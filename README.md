# Örs Dükkanı

Demirci temalı idle oyunu. Müşteriler silah sipariş eder, ustan ve çalışanların ocakta döver, taşıyıcılar müşteriye götürür. Oyun düz HTML/JS/Canvas ile yazıldı ve Capacitor ile Android uygulamasına çevrilir.

## Klasörler

```
www/                 Oyunun kendisi (Capacitor'ın webDir klasörü)
  index.html
  css/style.css
  js/data.js         Silahlar, yükseltmeler, müşteri tipleri, başarımlar
  js/audio.js        Ses efektleri (WebAudio, dosya yok)
  js/art.js          Bütün çizimler: karakter, silah, dükkan, ışık, gökyüzü
  js/game.js         Simülasyon, kayıt, mühür (prestij), destekler
  js/ui.js           Sekmeler, mağaza, ödüller, pencereler, reklam bağlayıcısı
assets/              İkon ve açılış ekranı kaynakları (@capacitor/assets için)
store/               Play Store görselleri: ikon, tanıtım görseli, 4 ekran görüntüsü
docs/                Mağaza metinleri, gizlilik politikası şablonu, yayın kontrol listesi
tools/               Yardımcı betikler
capacitor.config.json
```

## Bilgisayarda denemek

```bash
npm run serve        # http://localhost:8080 adresinde açar (python3 gerekir)
```

Ya da `www/index.html` dosyasını doğrudan tarayıcıda açın.

## Android paketi oluşturmak

Gerekenler: güncel Node LTS, Android Studio, JDK (Android Studio ile gelir).

```bash
npm install
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli @capacitor/assets

npm run android:add        # android/ projesini oluşturur ve dikey yön kilidini ekler
npm run assets:android     # assets/ içindeki ikon ve açılış ekranından Android kaynaklarını üretir
npm run android:sync       # www/ klasörünü Android projesine kopyalar
npm run android:open       # Android Studio'yu açar
```

Android Studio'da: **Build > Generate Signed Bundle / APK > Android App Bundle**. Anahtar deposunu (keystore) oluşturup güvenli bir yerde yedekleyin. Play Console'a `.aab` dosyası yüklenir.

Güncelleme yayınlarken `android/app/build.gradle` içindeki `versionCode` değerini artırın.

Önemli: Google Play yeni uygulamalar ve güncellemeler için hedef API seviyesi şartı koyar (kontrol listesine bakın). Capacitor her sürümü için belirli bir hedef SDK kullanır ve bunu elle değiştirmenizi önermez. Bu yüzden `@capacitor/android` paketini sabit eski bir sürüme çekmeyin, güncel sürümü kullanın.

## Oyun tasarımı

- **Akış:** Müşteri gelir, sipariş verir. Boş ocak ve boşta çalışan varsa sipariş dövülür. Biten silahı taşıyıcı (ya da taşıyıcı yoksa usta) müşteriye götürür. Sabır dolarsa müşteri öfkeyle çıkar.
- **Elle katkı:** Silah dövülürken örse dokunmak ilerlemeyi hızlandırır.
- **Yükseltmeler:** 10 kalem (çırak, taşıyıcı, usta eğitimi, ocak, tezgâh, tarif, çekiç, çizme, reklam, çelik). ×1, ×5 ve Maks satın alma modu var.
- **Müşteri tipleri:** Köylü, gezgin ve soylu. Soylu 2,4 kat öder ama sabırsızdır.
- **Usta Mührü (prestij):** Bu turdaki kazanç 2.000 altını geçince alınabilir. Mühür sayısı `kök(kazanç / 2000)` ile hesaplanır. Gelir çarpanı `1 + 0,5 × kök(mühür)` (azalan getiri), yeni tur `25 × mühür` altınla başlar. Bölüm ilerlemesi prestijde korunur.
- **Mekân bölümleri:** 12 mekân (Sokak, Köy, Pazar, Lonca, Orman, Kaya Kalesi, Mezarlık, Kan Şatosu, Garnizon, Dev Vadisi, Büyücü Kulesi, Krallık), her biri tek ırka hizmet eder (sonuncu karışık). 4–5 hedef bitince taşınma bedeli ödenir; isteğe bağlı reklamla bedel %10 düşer (günde 3 kez). Sahne altındaki hedef çubuğu hep görünür, dokununca bölüm listesi açılır. Bölüm bitince kutlama penceresi çıkar. Her gün 3 yeni günlük görev gelir (Ödüller sekmesi). Yeni bölüm eklemek için `data.js` içindeki `CHAPTERS` dizisine kayıt eklemek yeterli.
- **Kraliyet müşterisi:** 3. bölümden sonra 150–240 sn'de bir gelir, büyük ödeme yapar.
- **Efsanevi tarifler:** Büyük kılıç, teber, tatar yayı ve miğfer sırasıyla 3, 10, 30 ve 100 mühürde açılır.
- **Müzik:** Orta çağ tarzı (Re Dorian, 6/8, lavta, flüt, davul) tamamen kodla üretilir, dosya gerektirmez. Ayarlardan açılıp kapanır.
- **Tempo (kesintisiz ve en iyi oynayan bir bot ile ölçüm; çok değişkendir):** mekân 1 ~15 dk, 2 ~25 dk, 3 ~20 dk, 4 ~45 dk, 5 ~3 sa, 6 ~7 sa, 7 ~19 sa, 8 ~2 gün; 9–12. mekânlar haftalar sürer
- **Destekler:** Körük (dövme hızı ×2) ve Altın Bereketi (kazanç ×2). Reklam başına 60 sn, en fazla 10 dk birikir.
- **Günlük ödül:** 7 günlük seri. 7. günde iki destek de verilir.
- **Çevrimdışı kazanç:** Oyun kapalıyken son hızın %60'ı, en fazla 2 saat. Açılışta "iki katı için reklam izle" seçeneği çıkar.
- **Dükkan seviyesi:** Satın alınan her seviye sayılır. 3, 6, 10 ve 16. seviyede silah rafı, tezgâh örtüsü, duvar meşaleleri ve altın kılıç kürsüsü sahneye eklenir.
- **Gün döngüsü:** Dört dakikalık gündüz-gece döngüsü. Kapıdaki gökyüzü ve sahnenin ışığı değişir.

Dengeyi `www/js/data.js` içinden (maliyetler, çarpanlar, sürelere) ve `www/js/game.js` içinden (sabır, müşteri sıklığı, mühür formülü) ayarlayabilirsiniz.

## Yapı ve genişletme

| Dosya | İş |
|---|---|
| `js/data.js` | silahlar, yükseltmeler, başarımlar, yardımcılar |
| `js/chapters.js` | mekân bölümleri (`O.VENUES`: ırk, hedefler, taşınma bedeli, ödül). 10 mekândan sonra tur başa döner |
| `js/content.js` | ırklar, etkinlikler, dükkan temaları, seferler |
| `js/i18n.js` | Türkçe → İngilizce çeviri (`O.tx`). Yeni metin eklerken sözlüğe ekleyin |
| `js/game.js` | oyun motoru ve kayıt |
| `js/services.js` | analitik, yerel bildirimler, paylaşım kartı |
| `js/ui.js` | arayüz, rehber, ayarlar |

`node tools/check.js` sözdizimini, `node tools/check-i18n.js` çeviri eksiklerini denetler.

## Yeni özellikler

- **Irklar ve mekânlar:** her mekân tek ırka hizmet eder: insanlar (1–3), elfler (4–5), ork (6), iskelet (7), vampir (8), devlet muhafızları (9), devler (10, iri çizilir, sabırlı), büyücüler (11, %60 büyü ister), karışık (12). 12. mekândan sonra tur başa döner (II, III…) ve hedefler büyür. Her ırkın görünümü, ödeme ve sabır çarpanı, favori silahları ve silah renk tonu farklıdır. Yeni ırk eklemek için `js/content.js` → `O.RACES` ve `O.ERAS` (`js/chapters.js`).
- **İlk dakika rehberi:** 5 adım (örse dokun, çırak, taşıyıcı, hedef çubuğu, görevler). Atlanabilir. Eski oyuncularda otomatik kapanır.
- **Etkinlikler:** Hafta sonu pazarı, demirci haftası, kraliyet ziyareti. `Ors.setRemoteEvents` ile uzaktan etkinlik verilebilir.
- **Keşif sekmesi:** Seferler (10 dk, 1 sa, 4 sa, uygulama kapalıyken de sürer, Mühür Parçası verir, 10 parça = 1 mühür) ve 6 dükkan teması (altınla alınır).
- **Paylaşım kartı:** Bölüm bitince "Paylaş" düğmesi görsel bir kart üretir. Telefonda paylaşma menüsü açılır. Tarayıcıda indirir. Android'de güvenilir çalışması için Capacitor Share + Filesystem eklentileri eklenebilir.
- **Silahlar (25):** 11 eski + 14 yeni; yenileri mekâna bağlı açılır (Dev Tokmağı, Dev Baltası, Kristal Asa, Kadim Asa, Gürz, İnce Kılıç, Büyücü Asası, Uzun Yay, Çift Ağızlı Balta, Tırpan, Gümüş Hançer, Sancak Mızrağı, Yıldırım Çekici, Ejderha Kılıcı). Veri: `js/data.js` → `O.WEAPONS` (`rec`: tarif seviyesi, `legend`: mühür, `ven`: bölüm; dizi fiyata göre sıralı kalmalı), çizim: `js/art.js` → `drawWeaponRaw`.
- **Hikâyeli müşteriler:** 11 karakter (Bora, Selim, Lirael, Aelwen, Grumak, Mordis, Vladimir, Hilda, Thrum, Zafiros, Aldric), her biri belirli bir mekânda açılır, özel silah ister, 12× öder. Teslim edince dükkanın alt rafına bir süs konur ve Mühür Parçası verilir. Veri: `js/content.js` → `O.STORIES`.
- **Büyülü siparişler (4. bölümden):** Müşterilerin %35'i ırkının sevdiği bir büyü ister (Alev, Zehir, Gümüş, Mithril). Baloncukta renkli nokta çıkar, ocakta büyü rengiyle parıltı ve kıvılcım olur. Büyülü silah %15 geç dövülür, satış değerinin %20'si malzeme bedeli kesilir, ama müşteri ırk çarpanıyla (ör. elfe mithril ×2,1) öder. **Mithril formülü** Elf Kraliçesi Aelwen'in hikâyesi bitince bulunur (Orman Atölyesi). Veri: `O.ENCHS`.
- **Koleksiyon defteri:** silah, ırk, mekân, hikâye ve büyü ilerlemesi; her bölüm tamamlanınca Mühür Parçası ödülü.
- **Usta Paketi (tek seferlik satın alma):** reklam ödülleri reklam izletmeden verilir, dövme hızı kalıcı ×2. `Ors.Store.provider` ile gerçek Google Play satın alması bağlanmalıdır (şu an TEST penceresi var); satın alma Play tarafında doğrulanmalıdır. Ödüllü reklam güçlendirmeleri artık reklam başına 5 dk (en çok 15 dk birikir).
- **Çevrimdışı kazanç:** son 5 dakikanın ortalama hızı × %60 × kapalı süre (en çok 2 sa). Oturum 5 dakikadan kısaysa eksik kısım önceki kayıtlı hızla doldurulur. Altınla birlikte satılan silah sayısı da (hız × süre) eklenir; Mühür sonrası hız sıfırlanır.
- **Reklam noktaları (hepsi isteğe bağlı):** Fuar +1 hak, taşınma bedeli %10 (günde 3), sefer süresini yarıya indirme (seferde 2 kez), çevrimdışı kazancı ×2, Körük/Altın Bereketi (5 dk). Sıradaki iki mekân bölüm listesinde silüet ve "???" ile gizemli gösterilir.
- **Fuar (süreli mini mod):** Keşif sekmesinde, 3. bölümden sonra açılır. 3 dakikalık oturum, günlük tema (ırk) tarihe göre sabit. Favori silahlar 8 kat sık gelir, hatasız satışlar kombo yapar (en çok ×3). Fuar sürerken ana gelir ve istatistikler durur. Sonunda bronz/gümüş/altın madalya, altın ve (günde en çok 3) Mühür Parçası verilir. Günde 3 hak, reklamla +1. Madalya eşikleri `game.js` içinde `fairEnd` fonksiyonunda: referans, oyuncunun saklı gelir hızıdır ve temanın pahalı silah oranına göre düzeltilir. Dokunmadan oynayan bir oyuncu bronz/gümüş alır, altın için elle dokunmak gerekir.
- **Dil:** Türkçe ve İngilizce. Cihaz diline göre seçilir, Ayarlar'dan değişir.

## Analitik ve bildirimler

İkisi de eklenti yoksa sessizce hiçbir şey yapmaz. Kurmak için:

```bash
npm install @capacitor/local-notifications @capacitor-firebase/analytics firebase
npx cap sync android
```

Firebase için `google-services.json` dosyasını `android/app/` içine koyun ve eklentinin belgesindeki Gradle adımlarını uygulayın. Bildirim izni ilk bölüm bitince istenir. Gizlilik politikasına ve Play Console "Veri güvenliği" formuna analitik ve bildirim bilgisini ekleyin.

## Reklam bağlamak

Oyun şu an **test reklamı** gösterir (3 saniyelik bir pencere). Gerçek yayında bunu ödüllü reklamla değiştirmeniz gerekir. Bağlantı noktası `www/js/ui.js` içindeki `Ors.Ads.provider` alanıdır:

```js
Ors.Ads.provider = function (done) {
  // ödüllü reklamı göster; izlendiyse done(true), kapatıldıysa done(false)
};
```

Bir AdMob eklentisi seçip bu fonksiyonu ona bağlayın. Reklam eklediğinizde gizlilik politikasını ve Play Console'daki "Veri güvenliği" ile "Reklam kimliği" beyanlarını güncelleyin (docs klasörüne bakın).

## Bu projede doğrulananlar ve doğrulanamayanlar

Doğrulandı: oyun mantığı gerçek bir Chromium'da çalıştırıldı (alım, mühür, destekler, günlük ödül, kayıt, çevrimdışı kazanç, reklam akışı, bölümler ve üretilen diyarlar, rehber, seferler, temalar, etkinlikler, İngilizce/Türkçe geçişi ve Türkçe sızıntı taraması, sahte bildirim eklentisiyle planlama). Telefon ve masaüstü boyutlarında ekran görüntüleri alındı. Manifest yama betiği örnek bir dosyada denendi.

Doğrulanamadı: gerçek Capacitor bildirim ve Firebase eklentileri (yalnızca sahte eklentiyle denendi) ve Android derlemesi. Bu ortamdan npm kayıt sunucusuna erişim yoktu, bu yüzden Capacitor kurulup `.aab` üretilemedi. Komutlar resmi belgelerden alındı, ancak ilk derlemede küçük düzeltmeler gerekebilir. Ayrıca gerçek bir telefonda dokunma, ses ve titreşim denenmedi.

Yazı tipleri (Alegreya) Google Fonts'tan yüklenir. İnternet yokken sistem yazı tipine düşer, oyun çalışmaya devam eder. Uygulamada çevrimdışı da aynı görünmesini isterseniz yazı tipi dosyalarını `www/` altına indirip `@font-face` ile bağlayın.
