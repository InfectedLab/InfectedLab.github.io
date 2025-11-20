---
layout: post
title:  "Güvenli Bölge: Neden İzole Bir Analiz Laboratuvarına İhtiyacınız Var?"
date:   2025-11-19 15:00:00 +0300
categories: [Metodoloji, Başlangıç]
tags: [malware-analysis, lab-setup, security, virtual-machine]
#feature: /assets/img/lab-setup.jpg # Eğer bir görsel eklersen burayı aktif et
---

Tersine mühendislik ve zararlı yazılım analizi dünyasına adım atarken duyacağınız ilk ve en önemli kural şudur: **"Kendi bilgisayarında asla deneme."**

Bu blogda (InfectedLab) yapacağımız her şey, dijital dünyanın karanlık tarafındaki kodlarla, yani virüsler, trojanlar ve fidye yazılımlarıyla (ransomware) dans etmek üzerine kurulu olacak. Ancak bu dansı yapabilmek için önce sağlam bir piste, yani **izole edilmiş bir laboratuvar ortamına** ihtiyacımız var.

Peki, neden bu kadar paranoyak davranıyoruz ve neden bu ortamı kurmak zorundasınız?

### ☣️ Neden Laboratuvar?

Bir biyoloğun ölümcül bir virüsü mutfak masasında incelemediği gibi, biz de zararlı yazılımları günlük kullandığımız, içinde kişisel fotoğraflarımızın ve şifrelerimizin olduğu bilgisayarlarda inceleyemeyiz.

Laboratuvar ortamı (Lab) kurmak şu 3 temel nedenden dolayı zorunluluktur:

1.  **Güvenlik (Safety):** Analiz ettiğiniz bir fidye yazılımının yanlışlıkla çalışıp tüm hard diskinizi şifrelemesini veya bir RAT (Remote Access Trojan) aracılığıyla saldırganın kameranıza erişmesini istemezsiniz.
2.  **İzolasyon (Isolation):** Zararlı yazılımlar genellikle "eve telefon etmeye" (C2 sunucularına bağlanmaya) çalışır. Gerçek IP adresinizin ifşa olmaması ve ağınızdaki diğer cihazlara bulaşmayı önlemek için laboratuvarın dış dünyadan yalıtılmış olması gerekir.
3.  **Kontrol ve Geri Alma (Snapshot):** Analiz sırasında sistemi bozarız, kayıt defterini değiştiririz. İşimiz bittiğinde tek bir tuşla sistemi "temiz" haline geri döndürebilmek (Snapshot/Restore) bize zaman kazandırır.

### 🔍 Neden Kurulumu Anlatmıyorum?

İnternet, *"VirtualBox nasıl kurulur?"* veya *"Windows sanal makine oluşturma"* başlıklarıyla dolu binlerce rehberle dolu. **InfectedLab**'in amacı, zaten her yerde olan bilgiyi tekrar etmek değil, sizi araştırmaya ve öğrenmeye teşvik etmektir.

İyi bir Malware Analisti olmanın ilk şartı, **kendi araçlarını araştırıp kurabilme yeteneğidir.**

### 🛠️ Araştırmanız Gereken Anahtar Kelimeler

Kendi güvenli bölgenizi inşa etmek için aşağıdaki kavramları araştırmanızı ve sisteminizi buna göre hazırlamanızı bekliyorum:

* **Virtualization (Sanallaştırma):** *VirtualBox* veya *VMware Workstation*.
* **İşletim Sistemleri:** *Windows 10/11 VM* (Kurban makine) ve *Remnux* (Analiz aracı).
* **FlareVM:** Windows üzerinde analiz araçlarını otomatize eden harika bir script.
* **Network Isolation:** *Host-only Adapter* veya *Internal Network* yapılandırması.
* **Snapshots:** Sistemin temiz yedeğini alma.

### Son Söz

Bu blogda paylaşacağım analizleri takip edebilmek için, **kendi sanal laboratuvarınızı kurmuş olmanız gerekecek.**

Eğer bir zararlı yazılımı analiz etmek istiyorsanız, önce onu güvenle tutabileceğiniz kafesi inşa edin. Araştırmaya başlayın, kurulumunuzu yapın ve bir sonraki analiz yazısında görüşmek üzere hazır olun.

Güvenli kalın. 🛡️