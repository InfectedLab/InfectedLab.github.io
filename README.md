# InfectedLab — Kara Süvari'nin Saha Defteri

Berserk evreni temalı bir malware analizi & reverse engineering blogu.
Zararlı yazılımlar burada Havari, saldırı zincirleri Tutulma, IOC'ler
Kurban Damgası olarak anlatılır. Site GitHub Pages üzerinde statik HTML
olarak yayınlanır — Jekyll, build, derleyici yok.

🌐 **Canlı site:** https://infectedlab.github.io/

## Yapı

```
InfectedLab/
├── index.html                      # Ana sayfa (tematik makaleler + RE otopsileri)
├── about.html                      # Kara Süvari hakkında
├── bestiary.html                   # Berserk ↔ siber tehdit eşleme tablosu
├── tags.html                       # Etiket bulutu + filtre (?t=ransomware)
├── search.html                     # Lunr.js tabanlı istemci-taraflı arama (?q=...)
├── 404.html                        # "Bu yol Tutulma'da kayboldu"
├── posts/
│   ├── eclipse-ransomware.html
│   ├── apostle-apt.html
│   ├── behelit-phishing.html
│   ├── god-hand-nation-state.html
│   ├── brand-of-sacrifice-ioc.html
│   ├── berserker-armor-edr.html
│   └── writeup-template.html       # 🔥 Yeni RE/malware analizleri için iskelet
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── main.js                 # Yıl, hover spotlight, kod kopyala, Berserker mod
│   │   ├── tags.js                 # Etiket bulutu + filtre
│   │   └── search.js               # Lunr.js arama
│   ├── ioc/
│   │   ├── writeup-template.yar
│   │   └── writeup-template.stix.json
│   └── og/
│       ├── og-image.png            # 1200x630 sosyal kart (Twitter/Facebook)
│       └── og-image.svg            # Vektör versiyon
├── data/
│   └── posts.json                  # ⚠ Yeni post eklediğinde buraya da yaz
├── scripts/
│   └── make_og.py                  # OG PNG'yi yeniden üretir (Pillow gerekli)
├── .github/workflows/check.yml     # HTML lint + JSON validate + lychee linkcheck
├── .htmlhintrc                     # HTML lint kuralları
├── .nojekyll                       # GitHub Pages Jekyll'i atlasın
└── .gitignore
```

## Yeni bir otopsi (writeup) eklemek

1. **HTML kopyala**
   ```bash
   cp posts/writeup-template.html posts/2026-05-12-asyncrat-otopsi.html
   ```
2. **İçeriği doldur** — `[ÖRNEK ŞABLON]`, `[TARİH]`, IOC tablosu, hash placeholder'ları.
3. **IOC dosyalarını üret**
   ```bash
   cp assets/ioc/writeup-template.yar       assets/ioc/2026-05-12-asyncrat.yar
   cp assets/ioc/writeup-template.stix.json assets/ioc/2026-05-12-asyncrat.stix.json
   ```
   Yeni HTML içindeki `assets/ioc/writeup-template.*` linklerini bu dosyalara güncelle.
4. **`data/posts.json`'a kaydı ekle** — title, excerpt, tags, date.
5. **`index.html`** "Otopsiler — Reverse Engineering" bölümündeki yorumlu örnek
   `post-card`'ı kopyalayıp doldur.
6. **Commit & push**
   ```bash
   git add .
   git commit -m "Otopsi: AsyncRAT — Slan'ın küçük çocuğu"
   git push
   ```
   Push'tan ~30-60 saniye sonra canlıda görünür.

## OG/sosyal medya kartı

PNG önceden render edildi (`assets/og/og-image.png`).
Tasarımı değiştirmek istersen:

```bash
python scripts/make_og.py
```

`Pillow` paketi gerekiyor: `pip install Pillow`.

## Berserker zırh modu (Berserker mode)

Sağ üstteki **⛨** düğmesi yüksek-kontrast / agresif kırmızı temayı aç-kapatır.
Tercih `localStorage` üzerinde saklanır, sayfa geçişlerinde kalıcıdır.

## Tema kuralları

- **Sahnenin dili Berserk olsun, ama teknik gerçekliği bozma.**
  "Behelit titreşti" diyorsun, ama altına gerçek bir HTML smuggling
  payload'ı koyuyorsun.
- **Pyramid of Pain'e göre IOC sırası:** hash → IP → domain → host
  artefaktı → tool → TTP. En değerlisi en altta.
- **Her makale bir saha notuyla biter.** ("— Kara Süvari, [yer], [saat].")

## CI

`.github/workflows/check.yml` her push'ta üç işi çalıştırır:

1. **htmlhint** — HTML şablon hataları
2. **JSON validate** — `data/posts.json` ve STIX bundle'ları parse edilebilir mi
3. **lychee** — ölü link kontrolü (HTML + Markdown)

CI başarısız olursa Pages deploy yine olur (GitHub Pages ayrı bir akış),
ama PR/commit'te kırmızı işaret görürsün.

## Yasal not

Bu defter kurgudur ve eğitim amaçlıdır. Berserk evreni
[Kentaro Miura](https://en.wikipedia.org/wiki/Kentaro_Miura)'ya aittir.
Tüm IOC ve örnek kodlar kurgu amaçlıdır; gerçek IOC paylaşırken
ilgili etik kurallarına ve TLP işaretlemesine dikkat edin.
