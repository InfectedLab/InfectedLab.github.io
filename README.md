# InfectedLab — Kara Süvari'nin Saha Defteri

Berserk evreni temalı bir malware analizi & reverse engineering blogu.
Zararlı yazılımlar burada Havari, saldırı zincirleri Tutulma, IOC'ler
Kurban Damgası olarak anlatılır. Site GitHub Pages üzerinde statik
HTML olarak yayınlanır — Jekyll, build, derleyici yok.

## Yapı

```
InfectedLab/
├── index.html               # Ana sayfa (tematik makaleler + otopsiler)
├── about.html               # Kara Süvari hakkında
├── bestiary.html            # Berserk ↔ siber tehdit eşleme tablosu
├── posts/
│   ├── eclipse-ransomware.html
│   ├── apostle-apt.html
│   ├── behelit-phishing.html
│   ├── god-hand-nation-state.html
│   ├── brand-of-sacrifice-ioc.html
│   ├── berserker-armor-edr.html
│   └── writeup-template.html  ← Yeni analizler için iskelet
├── assets/
│   ├── css/style.css
│   └── js/main.js
├── .nojekyll                # GitHub Pages'e Jekyll çalıştırma de
└── README.md
```

## Yeni bir otopsi (writeup) eklemek

1. `posts/writeup-template.html` dosyasını kopyala:
   `posts/2026-05-12-asyncrat-otopsi.html` gibi bir isim ver.
2. İçeride `[ÖRNEK ŞABLON]`, `[TARİH]`, IOC tablosu, hash placeholder'larını
   gerçek değerlerle değiştir.
3. `index.html` içindeki "Otopsiler — Reverse Engineering" bölümüne
   yeni `post-card` ekle (şablon yorumda hazır).
4. Commit + push.

## Tema kuralları

- **Sahnenin dili Berserk olsun, ama teknik gerçekliği bozma.**
  "Behelit titreşti" diyorsun, ama altına gerçek bir HTML smuggling
  payload'ı koyuyorsun.
- **Pyramid of Pain'e göre IOC sırası:** hash → IP → domain → host
  artefaktı → tool → TTP. En değerlisi en altta.
- **Her makale bir saha notuyla biter.** ("— Kara Süvari, [yer], [saat].")

## GitHub Pages yayını

`InfectedLab.github.io` adıyla bir repo oluşturup ana dala (main) push'la,
ardından **Settings → Pages → Source: Deploy from branch / main / root**
seçimi yeterlidir. URL: `https://infectedlab.github.io/`

## Yasal not

Bu defter kurgudur ve eğitim amaçlıdır. Berserk evreni
[Kentaro Miura](https://en.wikipedia.org/wiki/Kentaro_Miura)'ya aittir.
Tüm IOC ve örnek kodlar kurgu amaçlıdır; gerçek IOC paylaşırken
ilgili etik kurallarına ve TLP işaretlemesine dikkat edin.
