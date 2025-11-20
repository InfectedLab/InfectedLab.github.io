---
layout: post
title:  "Crackme Serisi #1: Tersine Mühendisliğin 'Merhaba Dünya'sı"
date:   2025-11-19 12:00:00 +0300
categories: [Reverse Engineering, Crackme]
tags: [assembly, x64dbg, patching, beginner]
#feature: /assets/img/crackme-01.jpg
---

Zararlı yazılım analizine giden yol, önce zararsız yazılımların nasıl çalıştığını anlamaktan geçer. İşte bu noktada karşımıza **"Crackme"**ler çıkıyor.

Bu seride, internetteki siber güvenlik meraklıları tarafından hazırlanan, içinde "beni çöz" diye bağıran dijital bulmacaları, yani Crackme'leri inceleyeceğiz. Amacımız korsanlık değil; bir yazılımın karar mekanizmalarını (Decision Making) anlamak ve manipüle etmek.

İlk yazımızda en temel konsept olan **"String Karşılaştırma ve Zıplama (Jump)"** mantığını kıracağız.

### 🎯 Hedef: Basit Bir Şifre Kontrolü

Bu pratik için **[crackmes.one](https://crackmes.one)** adresinden "Very Easy" seviyesinde rastgele bir C/C++ crackme'si indirebilirsiniz. Mantık %99 ihtimalle aynı olacaktır.

Senaryomuz şu:
1. Programı açıyoruz.
2. Bizden şifre istiyor.
3. Yanlış girince: "Access Denied" (Erişim Reddedildi).
4. Doğru girince: "Welcome!" (Hoş geldin!).

Amacımız şifreyi bilmeden "Welcome" mesajını görmek.

### 🛠️ Gerekli Araçlar

Laboratuvarımızda şu araç hazır olmalı:
* **x64dbg (veya x32dbg):** Programı çalışırken incelememizi sağlayan Debugger.

### Adım 1: Keşif (Statik Analiz)

Programı çalıştırmadan önce, içinde sakladığı metinlere (Strings) bakmak her zaman ilk adımdır.

x64dbg ile dosyamızı açıyoruz.
`Sağ Tık -> Search for -> All Modules -> String references` yolunu izliyoruz.

Karşımıza şuna benzer bir liste çıkacak:
* `"Enter Password:"`
* `"Access Denied"` ❌
* `"Welcome, Admin!"` ✅

Eğer şifre kodun içine "hardcoded" (gömülü) olarak yazılmışsa, burada şifreyi bile görebiliriz! Ama biz daha teknik bir yol deneyeceğiz: **Patching.**

### Adım 2: Karar Anını Bulmak

"Access Denied" yazısına çift tıklayarak Assembly kodunun olduğu yere gidiyoruz. Genellikle manzara şöyledir:

```assembly
call GetInput       ; Kullanıcıdan veri al
cmp eax, ebx        ; Girilen şifreyi kontrol et (Karşılaştırma)
jne 0040105A        ; Eşit DEĞİLSE (Jump if Not Equal) hata mesajına git!
mov edx, "Welcome"  ; Eşitse Hoşgeldin mesajını hazırla
...
0040105A:
mov edx, "Error"    ; Hata mesajı