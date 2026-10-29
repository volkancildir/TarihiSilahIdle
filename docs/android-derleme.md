# Android paketi (AAB) üretme ve Play Store'a yükleme

Bu projenin Android klasörü hazır değildir: üretildiği ortamda Android SDK ve Gradle indirmeleri kapalıydı, bu yüzden `.aab` dosyası orada derlenemedi. Aşağıdaki iki yoldan biriyle kendi bilgisayarınızda ya da GitHub'da derleyebilirsiniz. Kodun kendisi tarayıcıda denendi, gerçek bir telefonda denenmedi.

## Yol A: Bilgisayarınızda (Android Studio)

1. Node.js (22 ve üstü), JDK 21 ve Android Studio kurun.
2. Proje klasöründe:
   ```
   npm install @capacitor/core @capacitor/android @capacitor/cli @capacitor/assets
   npm run android:add
   npm run assets:android
   npm run android:sync
   npm run android:open
   ```
3. Android Studio'da **Build → Generate Signed App Bundle** ile `.aab` üretin (anahtar deposunu burada oluşturabilirsiniz; yedeğini ve şifrelerini kaybetmeyin).

## Yol B: GitHub Actions (bilgisayara kurulum yok)

1. Projeyi bir GitHub deposuna yükleyin (`.github/workflows/android.yml` içinde hazır).
2. Bir anahtar deposu üretin: `keytool -genkey -v -keystore release.keystore -alias ors -keyalg RSA -keysize 2048 -validity 10000`
3. Depoda Settings → Secrets: `KEYSTORE_BASE64` (`base64 -w0 release.keystore` çıktısı), `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
4. Actions → **Android AAB** → Run workflow. Bitince "ors-dukkani-aab" çıktısındaki `app-release.aab` dosyasını indirin.

## Play Console'a yükleme

- Uygulama kimliği: `com.orsdukkani.idle`. Güncellemede `android/app/build.gradle` içindeki `versionCode` her seferinde artar.
- **Play App Signing**'e kaydolun.
- Mağaza görselleri `store/` klasöründe (simge, tanıtım görseli, 4 ekran görüntüsü, yeni görünümle yenilendi). Metinler `docs/magaza-metinleri.md`, gizlilik politikası şablonu `docs/gizlilik-politikasi.md` içinde.
- Yeni kişisel hesapta üretime çıkmadan önce kapalı test (en az 12 test kullanıcısı) gerekebilir; ayrıntılar `docs/yayin-kontrol-listesi.md` içinde.

## Para kazanma için yapılması gerekenler

Reklam ve "Usta Paketi" satın alması şu an **test taklididir**. Gerçek AdMob ve Google Play Billing eklentilerini `Ors.Ads` ve `Ors.Store` bağdaştırıcılarına bağlamadan yayınlarsanız oyun reklam göstermez ve gerçek satın alma çalışmaz. README'deki "Reklam bağlamak" bölümüne bakın.
