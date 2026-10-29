# Örs Dükkanı – Büyüme ve Elde Tutma Planı

Bu plan, idle oyun araştırmasından (GameAnalytics, AppFollow, AppTweak) çıkan bulgulara dayanır. Rakamlar sektör ortalamasıdır, garanti değildir.

## 1. Gerçekçi hedefler

| Gün | Tüm oyunlar (ortalama) | İyi idle oyun hedefi |
|---|---|---|
| D1 | ~%22 | %35–45 |
| D7 | ~%4 | %10–15 |
| D30 | <%1 | %3–6 |

Önce ilk dakikayı düzeltmek, sonra kullanıcı çekmek gerekir. Kötü onboarding'e getirilen her kullanıcı boşa gider.

## 2. "Oyun kısa sürer" sorununa cevap: Mekân bölümleri

Her bölüm bir mekândır ve tek bir müşteri ırkına hizmet eder. Oyuncunun her zaman görünen tek bir hedefi var (sahne altındaki çubuk). Hedefler bitince **taşınma bedeli** ödenir ve sonraki mekâna geçilir.

| # | Mekân | Müşteri | Kesintisiz (bot) süre |
|---|---|---|---|
| 1 | Sokak Demircisi | İnsan | ~15 dk |
| 2 | Köy Demircisi | İnsan | ~25 dk |
| 3 | Pazar Demircisi | İnsan | ~20 dk |
| 4 | Lonca Demircisi | Elf | ~45 dk |
| 5 | Orman Atölyesi | Elf | ~3 sa |
| 6 | Kaya Kalesi | Ork | ~7 sa |
| 7 | Mezarlık Dükkanı | İskelet | ~19 sa |
| 8 | Kan Şatosu | Vampir | ~2 gün |
| 9 | Şehir Garnizonu | Muhafız | günler |
| 10 | Dev Vadisi | Dev | haftalar |
| 11 | Büyücü Kulesi | Büyücü | haftalar |
| 12 | Krallık Demircisi | Karışık | haftalar |

Süreler, hiç boş durmayan ve her şeyi en uygun alan bir botun ölçümüdür; gerçek oyuncu çok daha yavaştır. 12. mekândan sonra tur başa döner ("Sokak Demircisi II" …), hedefler büyür, oyun bitmez.

**Gelir modeli:** Reklam hiçbir zaman zorunlu değildir. İsteğe bağlı iki yer var: (1) taşınma bedelini reklamla %10 düşürmek (günde en çok 3 kez, toplam %30), (2) mevcut körük/altın/çevrimdışı kazanç ikilemesi. İleride "Reklamsız + 2× hız" gibi tek seferlik satın alma eklenebilir (henüz kodda yok). Veri: `www/js/chapters.js` → `O.VENUES` (hedefler, bedel, ödül, ırk, sahne rengi).

## 3. İlk dakika (onboarding)
- İlk satış 10 saniye içinde olmalı. İlk iki yükseltme tek dokunuşla alınabilmeli.
- İlk bölüm hedefleri 2–3 dakikada bitmeli (hızlı ödül hissi).
- Prestij (Mühür) ilk ~9 dakikada açılır; bu, ilk "büyüme" anıdır.
- Reklam hiçbir zaman zorunlu değil, yalnızca ödüllü (isteğe bağlı) çıkar.

## 4. Günlük geri dönüş döngüsü
- Günlük ödül serisi + günlük 3 görev (zaten oyunda).
- Çevrimdışı kazanç (%60, en fazla 2 saat): "Dükkan sen yokken çalıştı" duygusu.
- Kraliyet müşterisi ve efsanevi tarifler: uzun vadeli hedef.

## 5. Bildirimler (kod hazır, eklenti kurulumu ve gerçek cihaz testi gerekiyor)
Yalnızca anlamlı olanlar, günde en fazla 1:
1. "Çevrimdışı kazancın dolu (2 saat)" – ilk ayrılıştan ~2 saat sonra.
2. "Günlük ödülün seni bekliyor" – seri bozulmadan önce.
3. "Yeni bölüm hedefine çok yakınsın" – yalnızca hedef %90 üzerindeyse.
Uygulama: `@capacitor/local-notifications` (`www/js/services.js` içinde `Ors.Notify`). İzin, ilk bölüm bitince (değer görüldükten sonra) bir kez istenir, açılışta değil. Dördüncü bildirim: sefer döndüğünde. Kullanıcı Ayarlar'dan kapatabilir.

## 6. Analitik (kod hazır, Firebase eklentisi kurulmalı)
Oyun şu olayları üretir: `ors_session` (gün sayısı, oturum sayısı, bölüm), `tutorial_step`, `tutorial_done`, `tutorial_skip`, `chapter_complete`, `prestige`, `daily_claim`, `expedition_start`, `expedition_claim`, `theme_buy`, `achievement`, `share_card`, `notify_prompt`. Olaylar cihazda (son 100) tutulur; Firebase Analytics eklentisi kuruluysa oraya da gönderilir. Panelde D1/D7/D30'u ve bölümlere göre düşüşü izle. En çok kaybedilen bölüm, ilk ayarlanacak yerdir.

## 7. Mağaza (ASO)
- Başlık ≤30 karakter: "Örs Dükkanı: Demirci Idle".
- Kısa açıklama ≤80 karakter, uzun açıklamada anahtar kelimeler %2,5–3 yoğunlukta ("idle", "demirci", "orta çağ", "silah üret").
- Ekran görüntüleri gerçek oyunu göstermeli, kısa başlıklı (`store/` klasörü).
- Feature graphic'te slogan, fiyat, promosyon yazısı olmamalı.
- Türkçe + İngilizce yerelleştirme; ilk dönemde Türkçe değerlendirmelere cevap ver.

## 8. Yayın takvimi
1. **Kapalı test (14 gün, 12 test kullanıcısı)** – kişisel hesaplar için zorunlu. Arkadaş, Discord/Reddit idle toplulukları, Telegram grupları. Testçilere "14 gün boyunca kurulu tut" de.
2. **Üretim yayını** – hafta içi, sabah. Yayından sonraki 24–72 saat kritik: yorumları ve çökme raporlarını (Play Console → Android vitals) günde birkaç kez kontrol et.
3. **Haftalık/aylık etkinlikler** – sınırlı süreli görev, hafta sonu "2× altın" (veri olarak eklenebilir).
4. **İçerik yol haritası** – her ~4 haftada yeni bölüm (11–12), yeni bölge/dükkan teması, yeni silahlar.

## 9. Yorum ve puan
Puan istemini kötü anda göstermeyin: yalnızca bir bölüm tamamlandıktan sonra, bir kez. Sürüm bazında yorumları izleyin; düşüş varsa o sürümü hemen düzeltin.

## 10. Sonsuz bölüm yapısı ve içerik akışı
- 10 mekân elle yazıldı (`www/js/chapters.js` → `O.VENUES`). Sonrası aynı mekânların daha büyük hedefli turlarıdır. Yeni mekân eklemek için diziye kayıt eklemek yeterli: `race` (`content.js` → `O.RACES` kimliği, ya da `mixed`), `pay` (satış çarpanı), `tint` (sahne rengi), `goals`, `fee` (taşınma bedeli), `reward`. Her ırkın favori silahları vardır; elf yay ve hançer, ork balta ve çekiç ister.
- Etkinlikler (`www/js/content.js`): hafta sonu pazarı (gelir ×1,5), ayın ilk haftası (dövme hızı ×1,25), 15–16'sı kraliyet ziyareti. Uygulamayı güncellemeden etkinlik eklemek için `Ors.setRemoteEvents([...])` ile uzaktan JSON verilebilir (bir sunucu ya da Firebase Remote Config gerekir, bağlanmadı).
- Seferler ve temalar da veri olarak `content.js` içinde.
- **Fuar:** günlük 3 dakikalık mini mod (madalya, günlük hak). Sonraki mod fikirleri: zorluk modu ("Usta Sınavı"), günlük meydan okuma, online liderlik tablosu (sunucu gerekir).

## 11. Ek içerik ve gelir
- Hikâyeli müşteriler, silah büyüleri ve koleksiyon defteri, oyuncuya tekrar oynama sebebi verir; defter ödülü Mühür Parçası olduğu için seferlerle birlikte uzun vadeli hedef olur.
- **Usta Paketi** tek seferlik satın alma: reklamsız ödüller + kalıcı 2× dövme hızı. Fiyatı bölgeye göre Play Console'dan belirleyin; satın alma doğrulaması (purchase token) sunucuda ya da Play'in eklentisinde yapılmalı.
- Ödüllü reklam güçlendirmeleri 5 dk sürer; reklam ilgisi düşük kalırsa süre/ödül oranını `ui.js` içindeki `addBoost(...,300)` değerinden ayarlayın.

## 12. Henüz doğrulanmayanlar
Android derlemesi, gerçek telefonda ses/dokunma, gerçek reklam SDK'sı, bildirim ve Firebase eklentileri denenmedi. Yayından önce gerçek cihazda test edin.
