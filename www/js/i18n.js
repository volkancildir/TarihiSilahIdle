/* Çeviri katmanı (Türkçe kaynak → İngilizce).
   Oyundaki bütün metinler Türkçe yazılmıştır. O.tx(metin) dil İngilizce ise çevirir, Türkçe ise aynen döndürür.
   Yöntem: (1) sayıya bağlı kurallar (tekil/çoğul, cümle düzeni), (2) en uzun parçadan başlayarak parça değiştirme.
   Yeni metin eklerken İngilizcesini PAIRS dizisine ekleyin. tools/check-i18n.js eksikleri ve yazım hatalarını bulur. */
(function(O){
'use strict';

const PAIRS=[
/* --- genel arayüz --- */
['Örs Dükkanı','Anvil Shop'],['ÖRS DÜKKANI','ANVIL SHOP'],
['Ayarlar','Settings'],['Altın yetmiyor','Not enough gold'],['Görünüm','Look'],['Demir & Ahşap','Iron & Wood'],['Klasik','Classic'],['Parşömen','Parchment'],['Müzik','Music'],['Ses efektleri','Sound effects'],['Titreşim','Vibration'],['Bildirimler','Notifications'],
['Oyunu sıfırla','Reset game'],['Evet, sil','Yes, delete'],['Vazgeç','Cancel'],['Tüm ilerleme silinecek.','All progress will be deleted.'],
['Rehberi geç','Skip tutorial'],['Satın alma miktarı','Buy amount'],['Satın alma','Buy amount'],['Maks','Max'],['Bölümler','Chapters'],['Kapat','Close'],
['Geliştirmeler','Upgrades'],['Bölüm hedefleri','Chapter goals'],
['Demirci dükkanı: ocaklar, tezgah ve bekleyen müşteriler','Blacksmith shop: furnaces, counter and waiting customers'],
['Yeni ocak','New furnace'],['Kaçtı!','Left!'],
/* --- sekmeler --- */
['Ekip','Crew'],['Dükkan','Shop'],['Gelişim','Growth'],['Görevler','Quests'],['Keşif','Explore'],['Mühür','Seal'],
/* --- üst çipler --- */
['Bölüm ','Chapter '],['Dükkan ','Shop '],['Yükseltme ','Upgrades '],['Mühür ×','Seal ×'],['Körük ×2 ','Bellows ×2 '],['Altın ×2 ','Gold ×2 '],['/sn','/s'],
/* --- silahlar --- */
['Hançer','Dagger'],['Kılıç','Sword'],['Balta','Axe'],['Mızrak','Spear'],['Yay','Bow'],['Kalkan','Shield'],['Savaş Çekici','Warhammer'],
['Büyük Kılıç','Greatsword'],['Teber','Halberd'],['Arbalet','Crossbow'],['Şövalye Miğferi','Knight\'s Helm'],
/* --- yükseltmeler --- */
['Demirci Çırağı','Apprentice'],['Taşıyıcı','Carrier'],['Çıraklık Okulu','Apprentice School'],['Yeni Ocak','New Furnace'],['Geniş Tezgâh','Wide Counter'],
['Yeni Tarif','New Recipe'],['Çekiç Ustalığı','Hammer Mastery'],['Hafif Çizmeler','Light Boots'],['Tabela ve Reklam','Sign & Advertising'],['Çelik Kalitesi','Steel Quality'],
['Silahları ocakta dövür · ','Forges weapons at the furnace · '],['Biten silahı müşteriye götürür · ','Carries finished weapons to customers · '],
['Çırakların dövme hızı ','Apprentice forging speed '],['Aynı anda dövülen silah: ','Weapons forged at once: '],['Bekleyen müşteri sayısı: ','Waiting customers: '],
['Açılacak: ','Unlocks: '],[' altın)',' gold)'],['Bütün tarifler açık','All recipes unlocked'],['Dövme hızı ','Forging speed '],['Yürüme hızı ','Walking speed '],
['Müşteri sıklığı ','Customer rate '],[' sn',' s'],['Satış değeri ','Sale value '],['Tamam','Maxed'],
/* --- ödüller, günlük, destekler --- */
['Günlük ödül','Daily reward'],['ETKİNLİKLER','EVENTS'],['GÜNLÜK GÖREVLER','DAILY QUESTS'],['DESTEKLER','BOOSTS'],['BAŞARIMLAR','ACHIEVEMENTS'],
['Gün ','Day '],[' ve iki destek',' and both boosts'],['Bugünkü ödülü aldın. Yarın tekrar gel.','You claimed today\'s reward. Come back tomorrow.'],
['Al +','Claim +'],['Al','Claim'],['Alındı','Claimed'],['Reklam izle','Watch ad'],['Körük','Bellows'],['Altın Bereketi','Gold Blessing'],


['Etkin: ','Active: '],[' kaldı. ',' left. '],[' etkin.',' active.'],['Başarım: ','Achievement: '],
['Etkinlik yok','No events'],['Hafta sonları, ayın ilk haftası ve 15–16\'sında özel etkinlikler olur.','Special events happen on weekends, in the first week of the month and on the 15th and 16th.'],
['Test reklamı','Test ad'],['Gerçek uygulamada burada ödüllü reklam oynar. Kalan: ','A rewarded ad would play here in the real app. Remaining: '],
/* --- etkinlikler --- */
['Hafta Sonu Pazarı','Weekend Market'],['Satış geliri ×1,5','Sale income ×1.5'],['Demirci Haftası','Smith\'s Week'],
['Dövme hızı ×1,25 (her ayın ilk 7 günü)','Forging speed ×1.25 (first 7 days of every month)'],['Kraliyet Ziyareti','Royal Visit'],
['Kraliyet elçileri 2 kat sık gelir (ayın 15 ve 16\'sı)','Royal envoys come twice as often (15th and 16th of the month)'],
/* --- mühür sekmesi --- */
['Usta Mührünü','Master\'s Seal'],['Usta Mührü alındı: +','Master\'s Seal taken: +'],['Usta Mührü!','Master\'s Seal!'],['Usta Mührü','Master\'s Seal'],
['Dükkanı sıfırlar, karşılığında kalıcı mühür verir. Gelir çarpanı = 1 + 0,5 × √mühür. Her mühür yeni turu 25 altınla da başlatır. Bölümler, başarımlar ve istatistikler korunur. Mühür sayısı arttıkça efsanevi silahlar açılır.',
 'Resets your shop in exchange for permanent seals. Income multiplier = 1 + 0.5 × √seals. Each seal also starts a new run with 25 gold. Chapters, achievements and stats are kept. Legendary weapons unlock as your seal count grows.'],
['Mührün','Your seals'],['Gelir çarpanı','Income multiplier'],['Bu turdaki kazanç','Earned this run'],['Şimdi alınacak mühür','Seals you would get now'],
['Mühürle ve yeniden başla (+','Seal and restart (+'],['Mühürle ve yeniden başla','Seal and restart'],['Emin misin? Tekrar dokun','Sure? Tap again'],
['En az 2.000 altın kazan','Earn at least 2,000 gold'],['İSTATİSTİK','STATS'],['Satılan silah','Weapons sold'],['Kaçan müşteri','Customers lost'],
['Toplam kazanç','Total earnings'],['Soylu müşteri','Noble customers'],['Alınan mühür sayısı','Seals taken'],['EFSANEVİ TARİFLER','LEGENDARY RECIPES'],
['DÜKKAN DEKORLARI','SHOP DECOR'],[' · Seviye ',' · Level '],[' mühür. Gelir ×',' seals. Income ×'],[' mühür',' seals'],
['Silah rafı','Weapon rack'],['Kırmızı halı','Red carpet'],['Su yalağı','Water trough'],['Bileme taşı','Grindstone'],['Duvar kalkanı','Wall shield'],['Tezgâh fenerleri','Counter lanterns'],['Duvar silahları','Wall weapons'],['Sandık ve çuvallar','Crates and sacks'],['Yeni dekor: ','New decor: '],['Tezgâh örtüsü','Counter runner'],['Duvar meşaleleri','Wall torches'],['Altın kılıç kürsüsü','Golden sword stand'],
/* --- keşif --- */
['SEFERLER','EXPEDITIONS'],['DÜKKAN TEMALARI','SHOP THEMES'],
['Çıraklarını sefere gönder. Sefer sürerken (uygulama kapalıyken de) ilerler. Dönünce altın ve Mühür Parçası kazanırsın. 10 parça 1 Usta Mührü eder. Aynı anda tek sefer yapılabilir.',
 'Send your apprentices on expeditions. They keep going while the app is closed. When they return you earn gold and Seal Fragments. 10 fragments make 1 Master\'s Seal. Only one expedition at a time.'],
['Mühür Parçası: ','Seal Fragments: '],['Mühür Parçası','Seal Fragments'],[' · Tamamlanan sefer: ',' · Expeditions done: '],
['Sefer döndü! Ödülünü al.','The expedition is back! Claim your reward.'],['Dönüşe ','Returns in '],[' var · ödül +',' · reward +'],
['Teslim al','Collect'],['Yolda','On the way'],['Kilitli','Locked'],
[' · ödül ~',' · reward ~'],[' altın + ',' gold + '],[' sa',' h'],[' dk',' min'],['Seçili','Selected'],['Kullan','Use'],
['Sefer döndü: +','Expedition returned: +'],[' altın, +',' gold, +'],[' ve +',' and +'],
['Maden Seferi','Mine Expedition'],['Çıraklar yakındaki madene gider.','Apprentices head to a nearby mine.'],['Kervan Seferi','Caravan Expedition'],
['Uzak şehirlerle ticaret.','Trade with distant cities.'],['Ejderha Mağarası','Dragon\'s Cave'],['Tehlikeli ama değerli bir yolculuk.','A dangerous but rewarding journey.'],
['Taş Atölye','Stone Workshop'],['Kızıl Kor Atölyesi','Crimson Ember Workshop'],['Buz Kalesi','Ice Fortress'],['Orman Loncası','Forest Guild'],
['Saray Atölyesi','Palace Workshop'],['Gece Atölyesi','Night Workshop'],
/* --- hikâye, büyü, defter, paket --- */
[' altın kazandı ve ',' gold and sold '],[' silah sattı. Reklam izlersen iki katını alırsın.',' weapons. Watch an ad to get double.'],
['Sen yokken (','While you were away ('],[') dükkan ',') the shop earned '],[' altın kazandı. Reklam izlersen iki katını alırsın.',' gold. Watch an ad to get double.'],['Reklam izle: iki katını al (+','Watch ad: get double (+'],['Reklam izle: süre yarıya insin','Watch ad: halve the time'],['Reklam izle: süre yarıya insin (','Watch ad: halve the time ('],[' · Hikâyeli müşteri: ???',' · Story customer: ???'],
['Dev Tokmağı','Giant Club'],['Dev Baltası','Giant Axe'],['Kristal Asa','Crystal Staff'],['Kadim Asa','Ancient Staff'],['Dev Vadisi','Giant Vale'],['Büyücü Kulesi','Wizard Tower'],['Devlerin vadisinde her şey iri: ocaklar, örsler ve müşteriler. Sabırlılar ve cömertler.','Everything in the giants\' vale is huge: forges, anvils and customers. They are patient and generous.'],['Büyücülerin kulesinde asalar ve büyülü silahlar isteniyor. Neredeyse her sipariş bir büyü ister.','The wizards\' tower wants staves and enchanted weapons. Almost every order asks for an enchantment.'],['Dev Çağı','Age of Giants'],['Büyücü Çağı','Age of Wizards'],['Devler','Giants'],['Büyücüler','Wizards'],['Devler iri ve sabırlıdır. Dev boy tokmaklar ve baltalar isterler, çok iyi öderler.','Giants are huge and patient. They want giant-sized clubs and axes and pay very well.'],['Büyücüler asalar ve büyülü silahlar ister. Çok öderler ve neredeyse her siparişte bir büyü isterler.','Wizards want staves and enchanted weapons. They pay a lot and ask for an enchantment on almost every order.'],['Dev Thrum','Giant Thrum'],['Thrum\'un Totemi','Thrum\'s Totem'],['Thrum küçük insanlara büyük tokmak getirir. Tokmak yapmak, Thrum para vermek.','Thrum bring big club for little people. You make club, Thrum give money.'],['Thrum sevindi! Bu totemi dükkana koy, dağlar seni korusun.','Thrum happy! Put this totem in your shop, may the mountains protect you.'],['Büyücü Zafiros','Wizard Zafiros'],['Zafiros\'un Küresi','Zafiros\'s Orb'],['Yüzyıllık bir bilmece gibi bir asa arıyorum: Kadim Asa. Sadece gerçek bir usta döver.','I seek a staff like a century-old riddle: the Ancient Staff. Only a true master can forge it.'],['Asa seni seçti, demirci. Bu küre sana yolu gösterir.','The staff has chosen you, smith. This orb will show you the way.'],
['Kusursuz işçilik! Taç mücevherlerimden birini bırakıyorum. Kayıp elf demircilerinin mithril formülünü de sana emanet ediyorum.','Flawless craftsmanship! I am leaving you one of my crown jewels. I also entrust you with the lost elf smiths\' mithril formula.'],['Müşteri ','Customer '],['Büyülü Siparişler','Enchanted Orders'],['Bazı müşteriler ırklarının sevdiği bir büyüyü ister (baloncukta renkli nokta). Büyülü silah %15 geç dövülür ve satış değerinin %20\'si malzeme bedeli keser, ama müşteri çok daha fazla öder.','Some customers ask for an enchantment their race likes (a colored dot on the bubble). An enchanted weapon takes 15% longer to forge and costs 20% of the sale value in materials, but the customer pays much more.'],['\'te açılır',' unlocks'],['Ortalama net çarpan: ','Average net multiplier: '],[' istiyor: dövme %15 uzar ama fazla öder.',' wants it: forging takes 15% longer but pays more.'],['formül henüz bulunamadı','formula not found yet'],['Yeni büyü: ','New enchantment: '],['Mithril Kaplama','Mithril Plating'],
['Gürz','Mace'],['İnce Kılıç','Rapier'],['Büyücü Asası','Wizard Staff'],['Uzun Yay','Longbow'],['Çift Ağızlı Balta','Double-Bladed Axe'],['Tırpan','Scythe'],['Gümüş Hançer','Silver Dagger'],['Sancak Mızrağı','Banner Pike'],['Yıldırım Çekici','Thunder Hammer'],['Ejderha Kılıcı','Dragon Blade'],['Yeni silah: ','New weapon: '],
['Net çarpan · ','Net multiplier · '],['Yaşlı Asker Bora','Old Soldier Bora'],['Bora\'nın Nişanı','Bora\'s Medal'],['Eski kılıcım paslandı evlat. Savaş yıllarından kalma bu çelikle yenisini döv.','My old sword has rusted, kid. Forge a new one from this steel left over from the war years.'],['Eski günlerdeki gibi keskin! Bu nişanı sana bırakıyorum.','Sharp as in the old days! I am leaving you this medal.'],['Tüccar Selim','Merchant Selim'],['Selim\'in Çanı','Selim\'s Bell'],['Kervanım haydut dolu yollardan geçecek. Sağlam bir kalkana ihtiyacım var.','My caravan will pass through bandit-infested roads. I need a sturdy shield.'],['Yol boyunca bir çizik bile almadık! Kervan çanımı dükkana asmanı isterim.','Not a scratch along the road! I would like you to hang my caravan bell in your shop.'],['Elf Elçisi Lirael','Elf Envoy Lirael'],['Lirael\'in Dalı','Lirael\'s Branch'],['Ormanın sesini dinleyen bir yay istiyorum. Hafif ama asla şaşmayan.','I want a bow that listens to the voice of the forest. Light, but never missing.'],['Ok değil, rüzgâr gibi uçuyor. Gümüş Orman\'dan bir dal armağan ediyorum.','It flies like the wind, not an arrow. I give you a branch from the Silver Forest.'],['Elf Kraliçesi Aelwen','Elf Queen Aelwen'],['Aelwen\'in Mücevheri','Aelwen\'s Jewel'],['İnce ve zarif bir hançer. Saray törenine yakışacak.','A slim, graceful dagger. Fit for the palace ceremony.'],['Ork Şefi Grumak','Orc Chief Grumak'],['Grumak\'ın Dişi','Grumak\'s Tusk'],['Grumak çekiç ister! Büyük, ağır, kafa kırar!','Grumak wants hammer! Big, heavy, breaks heads!'],['Grumak memnun! Bu dişi duvara as, herkes korksun.','Grumak happy! Hang this tusk on the wall, let everyone fear.'],['İskelet Kral Mordis','Skeleton King Mordis'],['Mordis\'in Kafatası','Mordis\'s Skull'],['Bin yıldır bekliyorum, bir mızrak daha beklerim. Ama kusursuz olsun.','I have waited a thousand years, I can wait for one more spear. But make it flawless.'],['Kemiklerim titredi, harika bir iş. Mezarımdan bu kafatasını al.','My bones trembled, a wonderful job. Take this skull from my grave.'],['Kont Vladimir','Count Vladimir'],['Vladimir\'in Yarasası','Vladimir\'s Bat'],['Gece avı için sessiz bir arbalet arıyorum. Parayı sorun etme.','I am looking for a silent crossbow for the night hunt. Never mind the money.'],['Zarif ve ölümcül. Şatomdan bir yarasa dostun olsun.','Elegant and deadly. Let a bat from my castle be your friend.'],['Komutan Hilda','Commander Hilda'],['Hilda\'nın Sancağı','Hilda\'s Banner'],['Şehir kapısını koruyacak bir teber lazım. Askerlerim bekliyor.','We need a halberd to guard the city gate. My soldiers are waiting.'],['Garnizon sana borçlu! Bu sancağı dükkanında dalgalandır.','The garrison owes you! Let this banner fly in your shop.'],['Kral Aldric','King Aldric'],['Kral Aldric\'in Kupası','King Aldric\'s Trophy'],['Krallığın demircisi, kralına bir kılıç döv. Taht bunu hak ediyor.','Smith of the kingdom, forge your king a sword. The throne deserves it.'],['Tacın ağırlığı bu kılıçtan hafif! Zafer kupamı al.','The weight of the crown is lighter than this sword! Take my victory trophy.'],['Alev Büyüsü','Flame Enchantment'],['Zehir Kaplama','Poison Coating'],['Gümüş Kaplama','Silver Plating'],['Hikâyeli müşteriler','Story customers'],['Büyüler','Enchantments'],['Test satın alma','Test purchase'],['Gerçek uygulamada burada Google Play ödeme ekranı açılır. Test için satın alma onaylansın mı?','The Google Play payment screen opens here in the real app. Confirm the purchase for testing?'],['Satın al (TEST)','Buy (TEST)'],['Dövme hızı ×2 olur. Reklam başına 5 dk eklenir. Süre uygulama kapalıyken de akar.','Forging speed doubles. Each ad adds 5 minutes. The time keeps running while the app is closed.'],['Her satıştan 2 kat altın gelir. Reklam başına 5 dk eklenir. Süre uygulama kapalıyken de akar.','Every sale pays double gold. Each ad adds 5 minutes. The time keeps running while the app is closed.'],['"  Yeni süs: ','"  New decoration: '],['Güzel!','Nice!'],['KOLEKSİYON','COLLECTION'],['Defteri aç','Open the book'],['USTA PAKETİ','MASTER PACK'],['Reklamsız + 2× hız','Ad-free + 2× speed'],['Tek seferlik satın alma. Ödüllü reklam ödülleri reklam izlemeden hemen verilir ve dövme hızı kalıcı olarak 2 kat artar.','One-time purchase. Rewarded-ad rewards are given instantly without watching ads, and forging speed is permanently doubled.'],['Satın al','Buy'],['Usta Paketi etkin. Teşekkürler!','Master Pack active. Thank you!'],['Satın alımı geri yükle','Restore purchase'],['Usta Paketi geri yüklendi.','Master Pack restored.'],['Geri yüklenecek satın alma bulunamadı.','No purchase found to restore.'],['Silah, ırk, mekân, hikâyeli müşteri ve büyü koleksiyonunu tamamla, Mühür Parçası kazan. Tamamlanan: ','Complete your weapon, race, venue, story customer and enchantment collections to earn Seal Fragments. Completed: '],['Satın alındı ✓','Purchased ✓'],['Satın al · ','Buy · '],[' geldi: "',' arrived: "'],['Koleksiyon Defteri','Collection Book'],['Alındı','Claimed'],['Ödül: +','Reward: +'],[' Mühür Parçası',' Seal Fragments'],['Yeni süs: ','New decoration: '],[' (alt rafa konuldu) · +',' (placed on the lower shelf) · +'],
/* --- mekân bölümleri --- */
['İnsan Çağı','Age of Humans'],['Elf Çağı','Age of Elves'],['Ork Çağı','Age of Orcs'],['İskelet Çağı','Age of Skeletons'],['Vampir Çağı','Age of Vampires'],['Muhafızlar Çağı','Age of the Guards'],['Krallık Çağı','Age of the Kingdom'],['Müşteriler: ','Customers: '],['Devam','Continue'],
['Sokak Demircisi','Street Smith'],['Köy Demircisi','Village Smith'],['Pazar Demircisi','Market Smith'],['Lonca Demircisi','Guild Smith'],['Orman Atölyesi','Forest Workshop'],
['Kaya Kalesi','Rock Fortress'],['Mezarlık Dükkanı','Graveyard Shop'],['Kan Şatosu','Blood Castle'],['Şehir Garnizonu','City Garrison'],['Krallık Demircisi','Kingdom Smith'],
['Sokak köşesinde küçük bir ocak kurdun. İlk müşterilerini memnun et.','You set up a small forge on a street corner. Keep your first customers happy.'],
['Köyün tek demircisi sensin. Çiftçiler ve yolcular kapında.','You are the only smith in the village. Farmers and travelers are at your door.'],
['Pazarda tezgâh kurdun. Tüccarlar ve soylular sipariş veriyor.','You set up a stall at the market. Merchants and nobles are placing orders.'],
['Elf loncası seni üye aldı. Zarif yaylar ve hafif kılıçlar döveceksin. İlk Usta Mührünü almalısın.','The elf guild took you in. You will forge graceful bows and light swords. Earn your first Master\'s Seal.'],
['Gümüş Orman\'ın kalbinde bir atölye. Elf kraliçesinin elçileri de geliyor.','A workshop in the heart of the Silver Forest. The elf queen\'s envoys visit too.'],
['Ork kalesinde ağır baltalar ve savaş çekiçleri isteniyor. Sabırsızlar ama cömertler.','The orc fortress wants heavy axes and war hammers. They are impatient but generous.'],
['Solgun Mezarlık\'ta iskeletlerin acelesi yok. Mızrak, kalkan ve kılıç istiyorlar.','The skeletons of the Pale Graveyard are in no hurry. They want spears, shields and swords.'],
['Vampirlerin şatosunda gece boyu iş var. Çok öderler ama beklemeyi sevmezler.','There is work all night in the vampires\' castle. They pay well but hate waiting.'],
['Başkentin muhafızları toplu sipariş veriyor: teber, kalkan, arbalet ve miğfer.','The capital\'s guards place bulk orders: halberds, shields, crossbows and helms.'],
['Krallığın demircisisin. Her ırktan müşteri kapında. Adın destanlara geçecek.','You are the kingdom\'s smith. Customers of every race are at your door. Your name will enter the legends.'],
['Karışık Irklar','Mixed Races'],['Her ırktan müşteri bir arada: elfler, orklar, iskeletler, vampirler ve muhafızlar.','Customers of every race together: elves, orcs, skeletons, vampires and guards.'],
['Taşın!','Move!'],['Taşınma bedeli: ','Relocation fee: '],['Taşın','Move'],['Önceki mekânlar','Earlier venues'],
['Hedefler tamam! "','Goals complete! "'],['" mekânına taşınmak için taşınma bedelini öde. ','" - pay the relocation fee to move there. '],[' İndirim: %',' Discount: %'],
['Öde ve taşın (','Pay and move ('],['Yeterli altının yok.','Not enough gold.'],['Reklam izle: bedelin %','Watch ad: cut the fee by %'],['\'u düşsün (',' ('],[' hak)',' left)'],
['Taşınma zamanı','Time to move'],['Hedefler tamam! Taşınma bedelini öde.','Goals complete! Pay the relocation fee.'],

/* --- bölümler --- */
[' hedef',' goals'],['Tamamlandı','Completed'],['Şimdiki bölüm','Current chapter'],['Ödül: ','Reward: '],[' bölüm',' chapters'],
[' altın',' gold'],['Altın','Gold'],[' · Körük ',' · Bellows '],[' · Altın Bereketi ',' · Gold Blessing '],

['Paylaş','Share'],

['Krallığın Demircisi','Kingdom\'s Smith'],









['Mızrak tarifini aç','Unlock the Spear recipe'],['Tezgâhı genişlet','Expand the counter'],
['Bütün tarifleri aç','Unlock all recipes'],['İlk Usta Mührünü al','Take your first Master\'s Seal'],['Kraliyet elçisine sat','Sell to a royal envoy'],

['Kor','Ember'],['Demir','Iron'],['Gümüş','Silver'],['Kızıl','Crimson'],
['Ocağı','Forge'],['Pazarı','Market'],['Kalesi','Fortress'],['Loncası','Guild'],
['FUAR','FAIR'],['Fuara gir','Enter the fair'],['Reklam izle: +1 hak','Watch ad: +1 entry'],['Bugünün fuarı: ','Today\'s fair: '],
['3 dakika. Favori silahlar: ','3 minutes. Favorite weapons: '],['. Hatasız satışlar kombo yapar. Fuar sürerken ana dükkanın geliri durur.','. Flawless sales build a combo. Your main shop earns nothing while the fair runs.'],
[' · En iyi puan: ',' · Best score: '],[' · Kalan hak: ',' · Entries left: '],['Fuar sürüyor: favori silahları sat, hatasız satışlarla kombo yap!','The fair is on: sell favorite weapons and build combos with flawless sales!'],
['Fuar sürüyor','Fair in progress'],['Bölüm 3\'te açılır','Unlocks in chapter 3'],['Bitir','End'],['Puan: ','Score: '],['Puan ','Score '],['Kombo ×','Combo ×'],
['Fuar bitti!','Fair over!'],[' · Madalya: ',' · Medal: '],['Bronz','Bronze'],['Madalya yok','No medal'],['. Satılan: ','. Sold: '],[', kaçan: ',', lost: '],
[', en iyi kombo: ',', best combo: '],['. Ödül: +','. Reward: +'],['Yeni rekor!','New record!'],['Harika','Great'],
['Gümüş Orman','Silver Forest'],['Solgun Mezarlık','Pale Graveyard'],['Kan Şatosu','Blood Castle'],
['İnsanlar','Humans'],['Elfler','Elves'],['Orklar','Orcs'],['İskeletler','Skeletons'],['Vampirler','Vampires'],['Krallık Muhafızları','Kingdom Guards'],
['Köylüler, yolcular ve soylular. Her tür silaha ihtiyaçları var.','Villagers, travelers and nobles. They need every kind of weapon.'],
['Elfler hafif, zarif silahlar sever: yaylar, hançerler ve ince kılıçlar. Sabırları azdır ama iyi öderler.','Elves like light, graceful weapons: bows, daggers and slim swords. They have little patience but pay well.'],
['Orklar ağır baltalar ve savaş çekiçleri ister. Sabırsızdırlar ama cömerttirler.','Orcs want heavy axes and warhammers. They are impatient but generous.'],
['İskeletlerin acelesi yok: sabırları çok yüksek. Mızrak, kalkan ve kılıç isterler.','Skeletons are in no hurry: very patient. They want spears, shields and swords.'],
['Vampirler zarif ve ölümcül silahlar ister. Çok öderler ama beklemeyi sevmezler.','Vampires want elegant, deadly weapons. They pay a lot but hate waiting.'],
['Devletin muhafızları toplu sipariş verir: teber, kalkan, arbalet ve miğfer.','The state\'s guards place bulk orders: halberds, shields, crossbows and helms.'],


/* --- başarımlar --- */
['İlk Satış','First Sale'],['Tezgâh Işıldıyor','Counter Gleams'],['Mahallenin Demircisi','Neighborhood Smith'],['Şehrin Demircisi','City Smith'],
['İlk Çırak','First Apprentice'],['İlk Taşıyıcı','First Carrier'],['Dört Ocak','Four Furnaces'],['Usta Tarifler','Master Recipes'],['Çekiç Ustası','Hammer Master'],
['Soylu Müşteri','Noble Customer'],['Kraliyet Tedarikçisi','Royal Supplier'],['Kese Doldu','Purse Full'],['Sandık Doldu','Chest Full'],['Hazine Odası','Treasure Room'],
['İlk Mühür','First Seal'],['Efsane Zanaatkâr','Legendary Artisan'],
['İlk silahını sat.','Sell your first weapon.'],['Bir Demirci Çırağı tut.','Hire an Apprentice.'],['Bir Taşıyıcı tut.','Hire a Carrier.'],
['Bütün ocakları aç.','Open all furnaces.'],['Bütün tarifleri aç.','Unlock all recipes.'],['Çekiç Ustalığını son seviyeye çıkar.','Max out Hammer Mastery.'],
['Bir soyluya silah sat.','Sell a weapon to a noble.'],['Kraliyet elçisine silah sat.','Sell a weapon to a royal envoy.'],
['İlk Usta Mührünü al.','Take your first Master\'s Seal.'],['100 mühre ulaş ve Şövalye Miğferi dövmeyi aç.','Reach 100 seals and unlock the Knight\'s Helm.'],
/* --- oyun içi ipuçları ve bildirimler --- */
['Altının yetiyor: Ekip sekmesinden bir Taşıyıcı tut.','You can afford it: hire a Carrier in the Crew tab.'],
['Biten silahlar bekliyor. Bir Taşıyıcı tutarsan ustan dövmeye devam eder.','Finished weapons are waiting. Hire a Carrier so your smith can keep forging.'],
['Bütün ocaklar dolu. Yeni Ocak açarsan aynı anda daha çok silah dövülür.','All furnaces are busy. A New Furnace lets you forge more at once.'],
['Kraliyet elçisi geldi! Büyük ödül için sabrı bitmeden sipariş ver.','A royal envoy has arrived! Serve them before their patience runs out for a big reward.'],
['Kraliyet elçisi memnun kaldı: +','The royal envoy is pleased: +'],['Mühür sekmesinde Usta Mührü alabilirsin: kalıcı gelir bonusu kazanırsın.','You can take a Master\'s Seal in the Seal tab: a permanent income bonus.'],
['Ocakta silah dövülürken örse dokun: çekiç daha hızlı iner.','Tap the anvil while a weapon is forged: the hammer falls faster.'],
['Sipariş birikiyor. Demirci Çırağı tutarsan boş ocaklar çalışır.','Orders are piling up. Hire an Apprentice to run the idle furnaces.'],
['Tezgâh dolu. Geniş Tezgâh daha çok müşteri bekletir.','The counter is full. A Wide Counter holds more waiting customers.'],
['İlk müşteri geliyor. Ustan siparişi ocakta dövecek, örse dokunarak hızlandır.','The first customer is coming. Your smith will forge the order; tap the anvil to speed it up.'],
['Müşteri geldi! Ocakta silah dövülürken örse dokunarak hızlandır.','A customer is here! Tap the anvil while a weapon is forged to speed it up.'],
['Ekip sekmesinden bir Demirci Çırağı tut. Ocağı o çalıştırır.','In the Crew tab, hire an Apprentice. They run the furnace.'],
['Ekip sekmesinden bir Taşıyıcı tut. Biten silahları müşteriye o götürür.','In the Crew tab, hire a Carrier. They bring finished weapons to customers.'],
['Sahnenin altındaki hedef çubuğuna dokun: bölümler ve ödüller orada.','Tap the goal bar under the scene: chapters and rewards are there.'],
['Günlük ödül ve görevler "Görevler" sekmesinde seni bekliyor.','Your daily reward and quests are waiting in the "Quests" tab.'],
['Hoş geldin usta!','Welcome back, master!'],[' altın kazandı.',' gold.'],
[' altın eklendi.',' gold added.'],[' altın!',' gold!'],
['Dükkan sen yokken çalıştı. Çevrimdışı kazancın doldu!','Your shop kept working while you were away. Offline earnings are full!'],
['Günlük ödülün seni bekliyor','Your daily reward is waiting'],['Serini bozma, ödülünü al.','Keep your streak, claim your reward.'],
['Bölüm hedefine çok yakınsın','You are very close to a chapter goal'],['Seferin döndü!','Your expedition is back!'],[' tamamlandı. Ödülünü al.',' is done. Claim your reward.'],
['Çevrimdışı kazancın dolunca ve günlük ödülün hazır olunca haber verelim mi? İstediğin zaman Ayarlar\'dan kapatabilirsin.','Want a heads-up when your offline earnings are full or your daily reward is ready? You can turn this off in Settings anytime.'],
['Evet, haber ver','Yes, notify me'],['Şimdi değil','Not now'],
['TAMAMLANDI','COMPLETED'],['Toplam altın','Total gold'],['Sen de bir demirci dükkanı kur!','Build your own blacksmith shop!'],
['Örs Dükkanı: "','Anvil Shop: "'],['" bölümünü tamamladım!','" chapter complete!'],['Kart indirildi.','Card downloaded.']
];

/* sayıya ve cümle düzenine bağlı kurallar. Küresel kurallar (g bayraklı) metnin her yerine uygulanır. */
const pl=(n,one,many)=>n+' '+(String(n)==='1'?one:many);
const RULES=[
  [/^(\S+) silah sat(\.?)$/u,(m,n,d)=>'Sell '+n+' weapons'+d],
  [/^(\d+) Demirci Çırağı tut$/u,(m,n)=>'Hire '+pl(n,'Apprentice','Apprentices')],
  [/^(\d+) Taşıyıcı tut$/u,(m,n)=>'Hire '+pl(n,'Carrier','Carriers')],
  [/^(\d+)\. ocağı aç$/u,(m,n)=>'Open furnace #'+n],
  [/^Toplam (.+?) altın kazan(\.?)$/u,(m,x,d)=>'Earn '+tx(x)+' gold in total'+d],
  [/^(\S+) mührün olsun$/u,(m,n)=>'Own '+n+' seals'],
  [/^(\d+) soylu müşteriye sat$/u,(m,n)=>'Sell to '+pl(n,'noble customer','noble customers')],
  [/^(\d+) kraliyet elçisine sat$/u,(m,n)=>'Sell to '+pl(n,'royal envoy','royal envoys')],
  [/^(\d+) kez Usta Mührü al$/u,(m,n)=>'Take the Master\'s Seal '+n+' times'],
  [/^(.+) (\d+)\. seviye$/u,(m,a,n)=>tx(a)+' level '+n],
  [/^([\d.,]+[KMBTa-z]*) altın kazan$/u,(m,n)=>'Earn '+n+' gold'],
  [/^(\d+) mühre ulaş$/u,(m,n)=>'Reach '+n+' seals']
];
/* sözlükten önce uygulanan kalıplar (içindeki "Bölüm " gibi parçalar sözlüğe takılmasın diye) */
const PRE=[
  [/ · Bölüm (\d+)'de açılır/g,' · unlocks in chapter $1']
];
const GLOBAL=[
  [/(\d+) çırak(?!\p{L})/gu,(m,n)=>pl(n,'apprentice','apprentices')],
  [/(\d+) taşıyıcı(?!\p{L})/gu,(m,n)=>pl(n,'carrier','carriers')],
  [/(\d+) parça(?!\p{L})/gu,(m,n)=>pl(n,'fragment','fragments')]
];

const esc=s=>s.replace(/[\\^$.*+?()[\]{}|\/]/g,'\\$&');
const map=new Map();
PAIRS.forEach(function(p){map.set(p[0],p[1]);});
const keys=Array.from(map.keys()).sort((a,b)=>b.length-a.length);
const RX=new RegExp(keys.map(function(k){
  return (/^\p{L}/u.test(k)?'(?<!\\p{L})':'')+esc(k)+(/\p{L}$/u.test(k)?'(?!\\p{L})':'');
}).join('|'),'gu');

let cache=new Map();
/* çekirdek çeviri: kurallar, sonra parça değiştirme */
function core(s){
  let out=s;
  for(let i=0;i<RULES.length;i++){
    const m=RULES[i][0].exec(s);
    if(m)return RULES[i][1].apply(null,m);
  }
  PRE.forEach(function(g){out=out.replace(g[0],g[1]);});
  out=out.replace(RX,function(m){return map.get(m);});
  GLOBAL.forEach(function(g){out=out.replace(g[0],g[1]);});
  return out.replace(/\+(\d+) Master's Seal(?!s)/g,function(m,n){return '+'+pl(n,'Master\'s Seal','Master\'s Seals');});
}
/* "✓ " öneki ile "· 3 / 5" ve "(3/5)" ilerleme ekleri çekirdekten ayrılıp çevrilmeden geri eklenir */
const PARTS=/^(✓ )?([\s\S]*?)(\s+·\s+\S+ \/ \S+|\s+\(\S+\/\S+\))?$/u;
function tx(s){
  if(O.lang!=='en'||typeof s!=='string'||!s)return s;
  const hit=cache.get(s);if(hit!==undefined)return hit;
  const m=PARTS.exec(s);
  let out=(m[1]||'')+core(m[2])+(m[3]||'');
  out=out.replace(/(\d)\.(\d{3})(?!\d)/g,'$1,$2');
  if(cache.size>4000)cache=new Map();
  cache.set(s,out);
  return out;
}
O.tx=tx;
O.i18nPairs=PAIRS;
/* HTML parçalarının yalnızca etiket dışındaki metinlerini çevirir */
O.txHTML=function(h){
  if(O.lang!=='en')return h;
  return h.replace(/(^|>)([^<>]+)(?=<|$)/g,function(m,a,t){return a+tx(t);});
};

/* sayfadaki sabit metinleri (ve aria-label) çevirir; orijinal Türkçe saklanır */
O.i18nApply=function(){
  const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);
  nodes.forEach(function(n){
    if(!n.parentNode||/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName))return;
    if(n.__tr===undefined){const t=n.nodeValue.trim();if(!t||!/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(t))return;n.__tr=n.nodeValue;}
    const lead=n.__tr.match(/^\s*/)[0],trail=n.__tr.match(/\s*$/)[0];
    n.nodeValue=lead+tx(n.__tr.trim())+trail;
  });
  document.querySelectorAll('[aria-label]').forEach(function(e){
    if(e.__trLabel===undefined)e.__trLabel=e.getAttribute('aria-label');
    e.setAttribute('aria-label',tx(e.__trLabel));
  });
  if(document.documentElement.__trLang===undefined)document.documentElement.__trLang=document.documentElement.lang;
  document.documentElement.lang=O.lang;
  document.title=tx('Örs Dükkanı');
};
O.setLang=function(l){
  if(l!=='tr'&&l!=='en')return;
  O.lang=l;cache=new Map();
  try{localStorage.setItem('ors-lang',l);}catch(e){}
  O.i18nApply();
  O.emit('lang',l);
};
})(window.Ors=window.Ors||{});
