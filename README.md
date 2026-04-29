# InfectedLab — Kara Süvari'nin Saha Defteri

Berserk evreni temalı bir malware analizi & reverse engineering blogu.
Zararlı yazılımlar burada Havari, saldırı zincirleri Tutulma, IOC'ler
Kurban Damgası olarak anlatılır. Site GitHub Pages üzerinde statik HTML
olarak yayınlanır — Jekyll, build, derleyici yok.

🌐 **Canlı:** https://infectedlab.com/  (mirror: https://infectedlab.github.io/)
🌍 **Diller:** TR · EN · JP — sağ üst köşedeki dil seçicisinden değiştirilebilir

## Yapı

```
InfectedLab/
├── index.html                      # Ana sayfa
├── about.html                      # Kara Süvari hakkında
├── bestiary.html                   # Berserk ↔ siber tehdit eşleme tablosu
├── tags.html                       # Etiket bulutu + filtre (?t=ransomware)
├── search.html                     # Lunr.js tabanlı istemci-taraflı arama
├── 404.html                        # "Bu yol Tutulma'da kayboldu"
├── CNAME                           # Custom domain → infectedlab.com
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
│   │   ├── i18n.js                 # Çoklu dil motoru (TR/EN/JP)
│   │   ├── main.js                 # Yıl, hover spotlight, kod kopyala, Berserker mod
│   │   ├── tags.js                 # Etiket bulutu + filtre (i18n-aware)
│   │   └── search.js               # Lunr.js arama (i18n-aware)
│   ├── i18n/
│   │   └── strings.json            # Tüm UI string'leri (TR/EN/JP)
│   ├── ioc/
│   │   ├── writeup-template.yar
│   │   └── writeup-template.stix.json
│   └── og/
│       ├── og-image.png            # 1200x630 sosyal kart
│       └── og-image.svg
├── data/
│   └── posts.json                  # ⚠ Multi-lang post indeksi
├── scripts/
│   └── make_og.py                  # OG PNG'yi yeniden üretir (Pillow)
├── .github/workflows/check.yml     # HTML lint + JSON validate + lychee linkcheck
├── .htmlhintrc
├── .nojekyll
└── .gitignore
```

## Çoklu dil (i18n)

İstemci-taraflı bir mini i18n sistemi. Sayfa kaynağında string'ler Türkçe yazılır,
JS sayfa yüklenince aktif dile göre değiştirir.

**HTML işaretleme:**
```html
<p data-i18n="hero.lede">Bu metin TR; JS aktif dile göre değiştirir.</p>
<h1 data-i18n-html="hero.title">İçerik <br> içerebilir.</h1>
<input data-i18n-attr="placeholder:search.placeholder" placeholder="Ara…">
```

**Yeni string eklemek:**
1. `assets/i18n/strings.json` dosyasında `"key": { "tr": "...", "en": "...", "ja": "..." }` ekle
2. HTML'de `data-i18n="key"` kullan

**Aktif dil seçim önceliği:** URL `?lang=xx` → `localStorage` → `<html lang>` → `navigator.language` → varsayılan (TR).

## Yeni bir otopsi (writeup) eklemek

1. **HTML kopyala** — `cp posts/writeup-template.html posts/2026-05-12-asyncrat.html`
2. **İçeriği doldur** — `[ÖRNEK ŞABLON]`, `[TARİH]`, IOC tablosu, hash placeholder'ları
3. **IOC dosyalarını üret** — `assets/ioc/<slug>.yar` ve `<slug>.stix.json`, post HTML'inde linkleri yenile
4. **`data/posts.json`'a multi-lang kaydı ekle** —
   ```json
   {
     "slug": "2026-05-12-asyncrat",
     "url": "posts/2026-05-12-asyncrat.html",
     "title":   { "tr": "...", "en": "...", "ja": "..." },
     "excerpt": { "tr": "...", "en": "...", "ja": "..." },
     "date": "2026-05-12",
     "tags": ["stealer", "rat"]
   }
   ```
5. **`index.html`** "Otopsiler — Reverse Engineering" bölümündeki yorumlu örneği aç ve doldur
6. **Commit & push** — `git add . && git commit -m "Otopsi: AsyncRAT" && git push`

Push'tan ~30-60 saniye sonra canlıda görünür.

## Custom domain (infectedlab.com)

`CNAME` dosyası repoda; GitHub Pages ayarı `gh api -X PUT repos/.../pages -f cname=infectedlab.com`
ile yapılmıştır. DNS GitHub apex IP'lerine işaret etmektedir:

```
A     @    185.199.108.153 / 109.153 / 110.153 / 111.153
AAAA  @    2606:50c0:8000::153 (× 4)
CNAME www  infectedlab.github.io.
```

HTTPS Let's Encrypt sertifikası GitHub tarafından otomatik provision edilmiştir
ve `https_enforced=true` ayarlıdır.

## OG / sosyal medya kartı

PNG önceden render edildi (`assets/og/og-image.png`). Tasarım değişirse:

```bash
pip install Pillow
python scripts/make_og.py
```

## Berserker zırh modu

Sağ üstteki **⛨** düğmesi yüksek-kontrast / agresif kırmızı temayı aç-kapatır.
Tercih `localStorage` üzerinde saklanır.

## CI

`.github/workflows/check.yml` her push'ta üç işi çalıştırır:
1. **htmlhint** — HTML şablon hataları
2. **JSON validate** — `data/posts.json`, `strings.json`, STIX bundle parse edilebilir mi
3. **lychee** — ölü link kontrolü (HTML + Markdown)

## Yasal not

Bu defter kurgudur ve eğitim amaçlıdır. Berserk evreni
[Kentaro Miura](https://en.wikipedia.org/wiki/Kentaro_Miura)'ya aittir.
Tüm IOC ve örnek kodlar kurgu amaçlıdır; gerçek IOC paylaşırken
ilgili etik kurallarına ve TLP işaretlemesine dikkat edin.
