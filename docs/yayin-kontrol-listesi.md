# Google Play yayın kontrol listesi

Kaynaklar bölümündeki sayfalar 24 Ekim 2026'da okundu. Şartlar değişebildiği için yayından önce Play Console'daki güncel metinlere bakın.

## Teknik

- [ ] **Hedef API seviyesi:** Yeni uygulamalar ve güncellemeler 31 Ağustos 2026'dan itibaren Android 16 (API 36) veya üstünü hedeflemeli. Güncel Capacitor sürümü bunu karşılar (Capacitor belgeleri 9.x için hedef SDK 37 diyor). Eski bir Capacitor sürümüne sabitlemeyin.
- [ ] Uygulama **Android App Bundle (.aab)** olarak yüklenir, APK olarak değil.
- [ ] Anahtar deposu (keystore) yedeklendi ve şifreleri güvenli bir yerde. **Play App Signing**'e kaydolun.
- [ ] `versionCode` her yüklemede artırıldı.
- [ ] Gerçek bir telefonda denendi: açılış, ses, titreşim, uygulama arka plana gidip dönünce çevrimdışı kazanç, farklı ekran oranları.
- [ ] Test reklamı gerçek ödüllü reklamla değiştirildi (README, "Reklam bağlamak").

## Hesap

- [ ] Kişisel geliştirici hesabı 13 Kasım 2023'ten sonra açıldıysa: üretime çıkmadan önce **kapalı test** gerekir. En az **12 test kullanıcısı**, hepsi **kesintisiz 14 gün** kayıtlı kalmalı. Erken ayrılanlar sayılmaz. Kuruluş hesapları için şart farklı olabilir.
- [ ] Geliştirici kimliği doğrulaması ve ödeme profili tamamlandı.

## Mağaza sayfası

- [ ] Uygulama simgesi 512×512: `store/icon-512.png`
- [ ] Tanıtım görseli 1024×500: `store/feature-graphic-1024x500.png`
- [ ] Telefon ekran görüntüleri: `store/screenshot-*.png` (1080×1920). Görüntülerde başlık yazısı sistem yazı tipiyle çıkmış olabilir. İsterseniz gerçek telefondan yeniden alın.
- [ ] Kısa ve uzun açıklama: `docs/magaza-metinleri.md`
- [ ] **Gizlilik politikası** bir web adresinde yayınlandı (`docs/gizlilik-politikasi.md` şablon). Adresi Play Console'a girin.
- [ ] İçerik derecelendirme anketi dolduruldu (şiddet sorularında: çizgi film tarzı silahlar, kan veya yaralanma yok).
- [ ] Analitik (Firebase) eklendiyse: veri güvenliği formunda "Uygulama etkinliği" ve cihaz/diğer kimlikleri beyan edin, gizlilik politikasındaki analitik bölümünü açın.
- [ ] Bildirim eklendiyse: Android 13+ için POST_NOTIFICATIONS iznini gerçek cihazda deneyin.
- [ ] Veri güvenliği formu dolduruldu. Reklam eklenmediyse "veri toplamıyor" doğrudur. Reklam eklendiyse reklam kimliği ve reklam SDK'sının topladığı verileri beyan edin.
- [ ] Hedef kitle: çocuklara yönelik seçilirse reklam ve veri kuralları sertleşir. Genel kitle seçmeniz daha kolaydır.

## Kaynaklar

- [Hedef API seviyesi şartı (Android Developers)](https://developer.android.com/google/play/requirements/target-sdk)
- [Kişisel hesaplar için test şartı (Play Console Yardım)](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Capacitor ile Play Store yayını (Ionic)](https://ionicframework.com/docs/deployment/play-store)
- [Capacitor hedef SDK sayfası](https://capacitorjs.com/docs/next/android/setting-target-sdk)
