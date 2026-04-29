"""
InfectedLab — OG image generator.
Pillow ile 1200x630 boyutunda Berserk temalı social card üretir.

Kullanım:
    python scripts/make_og.py
Çıktı:
    assets/og/og-image.png
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "og")
OUT = os.path.abspath(os.path.join(OUT_DIR, "og-image.png"))

# Renk paleti
INK_0   = (5, 5, 6)
INK_1   = (12, 12, 14)
PARCH   = (235, 226, 200)
BONE    = (214, 205, 181)
BONE_DIM= (168, 158, 132)
BLOOD   = (139, 17, 23)
BLOOD_B = (196, 32, 42)
BLOOD_G = (255, 58, 58)
VIOLET  = (90, 42, 110)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vertical_gradient(size, top, bot):
    img = Image.new("RGB", size, top)
    px = img.load()
    for y in range(size[1]):
        t = y / max(size[1] - 1, 1)
        c = lerp(top, bot, t)
        for x in range(size[0]):
            px[x, y] = c
    return img


def radial_overlay(size, cx, cy, r_inner, r_outer, color, alpha_max):
    """size aralığında merkez (cx,cy) etrafında alpha'lı renk gradient."""
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    px = layer.load()
    r_in_sq = r_inner * r_inner
    r_out_sq = r_outer * r_outer
    for y in range(size[1]):
        for x in range(size[0]):
            dx = x - cx
            dy = y - cy
            d2 = dx * dx + dy * dy
            if d2 >= r_out_sq:
                continue
            if d2 <= r_in_sq:
                a = alpha_max
            else:
                t = (math.sqrt(d2) - r_inner) / (r_outer - r_inner)
                a = int(alpha_max * (1 - t))
            px[x, y] = (color[0], color[1], color[2], a)
    return layer


def draw_brand(img, cx, cy, size=320):
    """Kurban Damgası — basitleştirilmiş çapraz + halka deseni."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # Dış halkalar
    for r, w, a in [(size//2, 2, 140), (size//2 - 30, 1, 110)]:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(BLOOD_B[0], BLOOD_B[1], BLOOD_B[2], a), width=w)
    # Damga çizgileri
    s = size // 3
    for (x1, y1, x2, y2) in [
        (cx - s, cy - s, cx + s, cy + s),
        (cx - s, cy + s, cx + s, cy - s),
        (cx, cy - s - 20, cx, cy + s + 20),
        (cx - s - 20, cy, cx + s + 20, cy),
    ]:
        d.line([x1, y1, x2, y2], fill=(BLOOD_G[0], BLOOD_G[1], BLOOD_G[2], 220), width=6)
    # Glow
    glow = layer.filter(ImageFilter.GaussianBlur(radius=10))
    img.alpha_composite(glow)
    img.alpha_composite(layer)


def load_font(size, bold=False, italic=False):
    candidates = []
    win_fonts = r"C:\Windows\Fonts"
    if bold and not italic:
        candidates += ["Cambria-Bold.ttf", "georgiab.ttf", "timesbd.ttf", "Arialbd.ttf"]
    elif italic and not bold:
        candidates += ["Cambriai.ttf", "georgiai.ttf", "timesi.ttf", "ariali.ttf"]
    else:
        candidates += ["Cambria.ttc", "Cambria.ttf", "georgia.ttf", "times.ttf", "arial.ttf", "Arial.ttf"]
    for name in candidates:
        path = os.path.join(win_fonts, name)
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    # Fallback
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except Exception:
        return ImageFont.load_default()


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # Background
    img = vertical_gradient((W, H), INK_0, (10, 10, 12))
    img = img.convert("RGBA")

    # Kırmızı sağ-üst halo
    img.alpha_composite(radial_overlay((W, H), int(W * 0.85), int(H * -0.1), 100, 700, BLOOD, 110))
    # Mor sol-alt halo
    img.alpha_composite(radial_overlay((W, H), int(W * -0.1), int(H * 1.1), 100, 600, VIOLET, 90))

    # Sağda Damga
    draw_brand(img, int(W * 0.78), int(H * 0.50), size=360)

    d = ImageDraw.Draw(img)

    # Çerçeveler
    d.rectangle([30, 30, W - 30, H - 30], outline=(BONE[0], BONE[1], BONE[2], 50), width=1)
    d.rectangle([40, 40, W - 40, H - 40], outline=(BLOOD_B[0], BLOOD_B[1], BLOOD_B[2], 90), width=1)

    # Eyebrow
    f_eye = load_font(22, bold=True)
    d.text((80, 150), "— TUTULMA'NIN GÖLGESİNDE —", font=f_eye, fill=BLOOD_B)

    # Başlık
    f_title = load_font(96, bold=True)
    d.text((80, 200), "InfectedLab", font=f_title, fill=PARCH)

    # Alt başlık
    f_sub = load_font(36, italic=True)
    d.text((80, 320), "Kara Süvari'nin Saha Defteri", font=f_sub, fill=BONE)

    # Lede
    f_lede = load_font(24)
    d.text((80, 410), "Bu dünya Havarilerle dolu.", font=f_lede, fill=BONE_DIM)
    d.text((80, 445), "Her zararlı yazılım bir demondur,", font=f_lede, fill=BONE_DIM)
    d.text((80, 480), "her saldırı bir kurban ritüeli.", font=f_lede, fill=BONE_DIM)

    # URL
    f_url = load_font(20, bold=True)
    d.text((80, 560), "infectedlab.github.io", font=f_url, fill=BLOOD_B)

    # Kılıç işareti köşede
    f_glyph = load_font(40, bold=True)
    d.text((W - 90, 60), "X", font=f_glyph, fill=BLOOD_B)

    # Kaydet
    img.convert("RGB").save(OUT, "PNG", optimize=True)
    print("OK ->", OUT)


if __name__ == "__main__":
    main()
