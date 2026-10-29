# Android paketi (AAB) üretme ve Play Store'a yükleme

Bu projenin Android klasörü hazır değildir; Android SDK ve Gradle indirmeleri önceki ortamda kapalıydı. Aşağıdaki GitHub Actions yolu bilgisayarsız derleme içindir.

## GitHub Actions ile derleme

1. Projede `.github/workflows/android.yml` iş akışı bulunmalı.
2. Bir anahtar deposu oluşturup Base64 biçiminde hazırlayın. Anahtar ve şifreleri kimseyle paylaşmayın.
3. GitHub deposunda Settings → Secrets and variables → Actions bölümüne şu secrets değerlerini ekleyin: `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
4. Actions → Android AAB → Run workflow ile çalıştırın.
5. İş akışı başarılı olursa `ors-dukkani-aab` adlı artifact içinden `app-release.aab` dosyasını indirin.

## Önemli

- Uygulama kimliği: `com.orsdukkani.idle`.
- Google Play'e genellikle imzalı Android App Bundle (.aab) yüklenir.
- Gerçek reklam ve uygulama içi satın alma sağlayıcıları henüz bağlanmadıysa bunlar yayın öncesi tamamlanmalıdır.
- Android derlemesi ve gerçek cihaz testi başarılı olmadan yayınlamayın.
