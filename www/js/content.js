/* Veri odaklı içerik: etkinlikler, dükkan temaları, seferler.
   Yeni etkinlik, tema ya da sefer eklemek için ilgili diziye kayıt eklemek yeterli. */
(function(O){
'use strict';

/* ---------- etkinlikler ----------
   test(date): etkinlik o gün açık mı. mul: {gold, speed, royal} çarpanları.
   Uzaktan etkinlik: Ors.setRemoteEvents([{id,name,desc,from:'2026-12-20',to:'2026-12-27',mul:{gold:2}}]) */
O.nowDate=function(){return new Date();};
O.EVENTS=[
  {id:'weekend',name:'Hafta Sonu Pazarı',desc:'Satış geliri ×1,5',test:d=>d.getDay()===0||d.getDay()===6,mul:{gold:1.5}},
  {id:'smithweek',name:'Demirci Haftası',desc:'Dövme hızı ×1,25 (her ayın ilk 7 günü)',test:d=>d.getDate()<=7,mul:{speed:1.25}},
  {id:'royalvisit',name:'Kraliyet Ziyareti',desc:'Kraliyet elçileri 2 kat sık gelir (ayın 15 ve 16\'sı)',test:d=>d.getDate()===15||d.getDate()===16,mul:{royal:2}}
];
let remote=[];
/* 'YYYY-AA-GG' yazılırsa yerel saatle gün başı / gün sonu sayılır */
function localDate(v,end){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v));
  if(m)return end?new Date(+m[1],+m[2]-1,+m[3],23,59,59):new Date(+m[1],+m[2]-1,+m[3]);
  return new Date(v);
}
O.setRemoteEvents=function(list){
  remote=[];
  (Array.isArray(list)?list:[]).forEach(function(e){
    if(!e||typeof e.id!=='string'||typeof e.name!=='string')return;
    const from=localDate(e.from,false),to=localDate(e.to,true);
    if(isNaN(from)||isNaN(to))return;
    const m={};['gold','speed','royal'].forEach(function(k){const v=Number(e.mul&&e.mul[k]);if(v>=1&&v<=5)m[k]=v;});
    remote.push({id:e.id,name:e.name,desc:String(e.desc||''),test:d=>d>=from&&d<=to,mul:m});
  });
};
O.activeEvents=function(){
  const d=O.nowDate();
  return O.EVENTS.concat(remote).filter(e=>e.test(d));
};
O.eventMul=function(k){
  let m=1;
  O.activeEvents().forEach(function(e){if(e.mul&&e.mul[k])m*=e.mul[k];});
  return m;
};


/* ---------- ırklar (her mekânın müşterisi) ----------
   Her mekân (bölüm) tek bir ırka hizmet eder; bkz. O.VENUES.
   pay: ödeme çarpanı, pat: sabır çarpanı, fav: en çok sipariş edilen silahlar (ağırlık 4),
   filter: silah çizimlerine uygulanan renk süzgeci, skins/hairs/cloths: görünüm, intro: yeni diyara girişte gösterilen metin. */
O.RACES=[
  {id:'human',name:'İnsanlar',pay:1,pat:1,fav:['sword','axe','spear','mace'],filter:'',
   skins:['#f0c9a0','#d9a577','#b27a4f','#8a5a3a'],hairs:['#2a1a12','#5a3a1f','#a0763a','#7a7a7a','#1a1a1a'],cloths:null,
   intro:'Köylüler, yolcular ve soylular. Her tür silaha ihtiyaçları var.'},
  {id:'elf',name:'Elfler',pay:1.15,pat:.9,fav:['bow','dagger','sword','rapier','longbow','staff'],filter:'sepia(.55) hue-rotate(62deg) saturate(1.7) brightness(1.12)',
   skins:['#f3dcc4','#ecd2b8','#e6caa8'],hairs:['#e8dca0','#f4f0d8','#c9b46a','#9ad0a0'],cloths:['#3f7f5f','#4f8f6a','#7a9a4f','#2f6f6a'],
   intro:'Elfler hafif, zarif silahlar sever: yaylar, hançerler ve ince kılıçlar. Sabırları azdır ama iyi öderler.'},
  {id:'orc',name:'Orklar',pay:1.25,pat:.8,fav:['axe','warhammer','greatsword','waraxe','thunderhammer'],filter:'sepia(.9) saturate(1.2) brightness(.72) contrast(1.15)',
   skins:['#7fa04a','#6c9040','#8aa85a','#5f8a3a'],hairs:['#1a1a1a','#2a1a12','#3a2a1a'],cloths:['#7a3a2a','#5a4a3a','#8a4a2a','#4a3a30'],
   intro:'Orklar ağır baltalar ve savaş çekiçleri ister. Sabırsızdırlar ama cömerttirler.'},
  {id:'skeleton',name:'İskeletler',pay:1,pat:1.5,fav:['spear','shield','sword','scythe'],filter:'grayscale(1) sepia(.4) brightness(1.1)',
   skins:['#e8e2d0','#ddd6c0','#f0ead8'],hairs:['#e8e2d0'],cloths:['#4a4a5a','#3a3a48','#5a5a6a'],
   intro:'İskeletlerin acelesi yok: sabırları çok yüksek. Mızrak, kalkan ve kılıç isterler.'},
  {id:'vampire',name:'Vampirler',pay:1.4,pat:.8,fav:['dagger','sword','crossbow','silverdagger'],filter:'sepia(.6) hue-rotate(-32deg) saturate(2.3) brightness(.85)',
   skins:['#d8d4dc','#cfc8d4','#e0dce4'],hairs:['#14101a','#2a1020','#0e0a14'],cloths:['#5a1020','#3a1030','#2a1a3a','#6a1830'],
   intro:'Vampirler zarif ve ölümcül silahlar ister. Çok öderler ama beklemeyi sevmezler.'},
  {id:'state',name:'Krallık Muhafızları',pay:1.2,pat:1.1,fav:['halberd','shield','crossbow','helm','pike'],filter:'hue-rotate(195deg) saturate(1.5) brightness(1.05)',
   skins:['#f0c9a0','#d9a577','#b27a4f'],hairs:['#2a1a12','#5a3a1f','#1a1a1a'],cloths:['#3a5a8a','#2f4f7a','#4a6a9a'],helm:true,
   intro:'Devletin muhafızları toplu sipariş verir: teber, kalkan, arbalet ve miğfer.'},
  {id:'giant',name:'Devler',pay:1.6,pat:1.4,fav:['giantclub','giantaxe','warhammer','waraxe'],filter:'sepia(.55) saturate(1.1) brightness(.88)',
   skins:['#c79a7a','#b8866a','#d6a98a','#a87858'],hairs:['#2a1a12','#4a2a1a','#6a4a2a'],cloths:['#6a4a2a','#5a5a3a','#7a5a3a','#4a4036'],big:true,
   intro:'Devler iri ve sabırlıdır. Dev boy tokmaklar ve baltalar isterler, çok iyi öderler.'},
  {id:'wizard',name:'Büyücüler',pay:1.8,pat:1,fav:['staff','crystalstaff','ancientstaff','dagger'],filter:'sepia(.4) hue-rotate(235deg) saturate(1.8) brightness(1.1)',
   skins:['#f0d4b8','#e6c8a8','#ddb892'],hairs:['#e8e8ee','#c8c8d4','#9a9aaa'],cloths:['#4a3a8a','#3a4a8a','#6a3a8a','#2f3f7a'],wizardHat:true,enchChance:.6,
   intro:'Büyücüler asalar ve büyülü silahlar ister. Çok öderler ve neredeyse her siparişte bir büyü isterler.'}
];
/* karışık müşteri (Krallık Demircisi): her müşteri rastgele bir ırktan gelir, silah çizimi süzgeçsizdir */
O.MIXED={id:'mixed',name:'Karışık Irklar',pay:1,pat:1,fav:['sword','axe','spear','bow','shield','warhammer','dragonblade'],filter:'',mixed:true,
  intro:'Her ırktan müşteri bir arada: elfler, orklar, iskeletler, vampirler ve muhafızlar.'};

/* ---------- hikâyeli müşteriler ----------
   from: gereken bölüm indeksi. weapon: istenen silah (açık değilse en iyi açık silah). mult: ödeme çarpanı.
   Teslim edince süs (dükkanın alt rafına konur) ve Mühür Parçası kazanılır. Yeni karakter eklemek için diziye kayıt ekleyin
   (raf 9 süslük; fazlası için art/game.js içindeki SHELF dizisine yer ekleyin). */
O.STORYT={id:'story',pay:12,pat:2.4,cloth:null};
O.STORIES=[
  {id:'bora',name:'Yaşlı Asker Bora',race:'human',from:0,weapon:'sword',frag:1,decor:{icon:'🎖️',name:'Bora\'nın Nişanı'},
   line:'Eski kılıcım paslandı evlat. Savaş yıllarından kalma bu çelikle yenisini döv.',thanks:'Eski günlerdeki gibi keskin! Bu nişanı sana bırakıyorum.'},
  {id:'selim',name:'Tüccar Selim',race:'human',from:2,weapon:'shield',frag:1,decor:{icon:'🔔',name:'Selim\'in Çanı'},
   line:'Kervanım haydut dolu yollardan geçecek. Sağlam bir kalkana ihtiyacım var.',thanks:'Yol boyunca bir çizik bile almadık! Kervan çanımı dükkana asmanı isterim.'},
  {id:'lirael',name:'Elf Elçisi Lirael',race:'elf',from:3,weapon:'bow',frag:1,decor:{icon:'🌿',name:'Lirael\'in Dalı'},
   line:'Ormanın sesini dinleyen bir yay istiyorum. Hafif ama asla şaşmayan.',thanks:'Ok değil, rüzgâr gibi uçuyor. Gümüş Orman\'dan bir dal armağan ediyorum.'},
  {id:'aelwen',name:'Elf Kraliçesi Aelwen',race:'elf',from:4,weapon:'dagger',frag:1,decor:{icon:'💎',name:'Aelwen\'in Mücevheri'},
   line:'İnce ve zarif bir hançer. Saray törenine yakışacak.',thanks:'Kusursuz işçilik! Taç mücevherlerimden birini bırakıyorum. Kayıp elf demircilerinin mithril formülünü de sana emanet ediyorum.',unlockEnch:'mithril'},
  {id:'grumak',name:'Ork Şefi Grumak',race:'orc',from:5,weapon:'warhammer',frag:1,decor:{icon:'🐗',name:'Grumak\'ın Dişi'},
   line:'Grumak çekiç ister! Büyük, ağır, kafa kırar!',thanks:'Grumak memnun! Bu dişi duvara as, herkes korksun.'},
  {id:'mordis',name:'İskelet Kral Mordis',race:'skeleton',from:6,weapon:'spear',frag:1,decor:{icon:'💀',name:'Mordis\'in Kafatası'},
   line:'Bin yıldır bekliyorum, bir mızrak daha beklerim. Ama kusursuz olsun.',thanks:'Kemiklerim titredi, harika bir iş. Mezarımdan bu kafatasını al.'},
  {id:'vladimir',name:'Kont Vladimir',race:'vampire',from:7,weapon:'crossbow',frag:1,decor:{icon:'🦇',name:'Vladimir\'in Yarasası'},
   line:'Gece avı için sessiz bir arbalet arıyorum. Parayı sorun etme.',thanks:'Zarif ve ölümcül. Şatomdan bir yarasa dostun olsun.'},
  {id:'hilda',name:'Komutan Hilda',race:'state',from:8,weapon:'halberd',frag:1,decor:{icon:'🚩',name:'Hilda\'nın Sancağı'},
   line:'Şehir kapısını koruyacak bir teber lazım. Askerlerim bekliyor.',thanks:'Garnizon sana borçlu! Bu sancağı dükkanında dalgalandır.'},
  {id:'thrum',name:'Dev Thrum',race:'giant',from:9,weapon:'giantclub',frag:1,decor:{icon:'🗿',name:'Thrum\'un Totemi'},
   line:'Thrum küçük insanlara büyük tokmak getirir. Tokmak yapmak, Thrum para vermek.',thanks:'Thrum sevindi! Bu totemi dükkana koy, dağlar seni korusun.'},
  {id:'zafiros',name:'Büyücü Zafiros',race:'wizard',from:10,weapon:'ancientstaff',frag:1,decor:{icon:'🔮',name:'Zafiros\'un Küresi'},
   line:'Yüzyıllık bir bilmece gibi bir asa arıyorum: Kadim Asa. Sadece gerçek bir usta döver.',thanks:'Asa seni seçti, demirci. Bu küre sana yolu gösterir.'},
  {id:'aldric',name:'Kral Aldric',race:'human',from:11,weapon:'dragonblade',frag:2,decor:{icon:'🏆',name:'Kral Aldric\'in Kupası'},
   line:'Krallığın demircisi, kralına bir kılıç döv. Taht bunu hak ediyor.',thanks:'Tacın ağırlığı bu kılıçtan hafif! Zafer kupamı al.'}
];
O.STORY_BY_ID={};O.STORIES.forEach(s=>{O.STORY_BY_ID[s.id]=s;});

/* ---------- silah büyüleri ----------
   Bazı müşteriler (%35) ırkının sevdiği bir büyüyü ister. aff: ırka göre ödeme çarpanı. Büyülü silah dövmeyi %15 uzatır ve
   satış değerinin %20'si kadar malzeme bedeli keser. need: bu hikâye bitince formül açılır (Mithril: Elf Kraliçesi Aelwen). */
O.ENCH_FROM=3;O.ENCH_CHANCE=.35;/* ırkın kendi enchChance değeri varsa o kullanılır */O.ENCH_COST=.2;O.ENCH_TIME=1.15;
O.ENCHS=[
  {id:'flame',name:'Alev Büyüsü',icon:'🔥',col:'#ff7a2a',aff:{human:1.3,elf:.8,orc:1.8,skeleton:1.3,vampire:1.1,state:1.4,giant:1.5,wizard:1.5}},
  {id:'poison',name:'Zehir Kaplama',icon:'🧪',col:'#6ad04a',aff:{human:1.3,elf:1.7,orc:.8,skeleton:.6,vampire:.7,state:1.1,giant:1.0,wizard:1.4}},
  {id:'silver',name:'Gümüş Kaplama',icon:'🌙',col:'#cfd8e6',aff:{human:1.3,elf:1.4,orc:.9,skeleton:1.1,vampire:2,state:1.5,giant:1.0,wizard:1.5}},
  {id:'mithril',name:'Mithril Kaplama',icon:'✨',col:'#8fd8ff',need:'aelwen',aff:{human:1.6,elf:2.1,orc:1,skeleton:1.2,vampire:1.1,state:1.7,giant:1.4,wizard:1.9}}
];
O.ENCH_BY_ID={};O.ENCHS.forEach(e=>{O.ENCH_BY_ID[e.id]=e;});
O.enchMul=function(id,raceId){const e=O.ENCH_BY_ID[id];return e?(e.aff[raceId]||1):1;};

/* ---------- koleksiyon defteri ödülleri (Mühür Parçası) ---------- */
O.COLL_REWARD={weapons:3,races:3,venues:5,stories:5,enchants:3};

/* ---------- dükkan temaları (altınla alınır) ----------
   tint: zemin ve duvarlara bindirilen renk */
O.THEMES=[
  {id:'stone',name:'Taş Atölye',cost:0,tint:null,swatch:'#8a7a68'},
  {id:'ember',name:'Kızıl Kor Atölyesi',cost:25000,tint:['#c0502a',.30],swatch:'#c0502a'},
  {id:'frost',name:'Buz Kalesi',cost:1.5e6,tint:['#4a8cd0',.32],swatch:'#4a8cd0'},
  {id:'forest',name:'Orman Loncası',cost:8e7,tint:['#3f9a55',.28],swatch:'#3f9a55'},
  {id:'royal',name:'Saray Atölyesi',cost:5e9,tint:['#d4a53a',.32],swatch:'#d4a53a'},
  {id:'shadow',name:'Gece Atölyesi',cost:3e11,tint:['#5a3aa0',.36],swatch:'#5a3aa0'}
];
O.THEME_BY_ID={};O.THEMES.forEach(t=>{O.THEME_BY_ID[t.id]=t;});

/* ---------- seferler ----------
   from: gereken bölüm indeksi (0'dan). Bedel ve ödül, sefer başındaki gelire göre hesaplanır.
   frag: Mühür Parçası. 10 parça 1 Usta Mührü verir. */
O.EXPEDS=[
  {id:'mine',name:'Maden Seferi',desc:'Çıraklar yakındaki madene gider.',dur:600,frag:1,from:3},
  {id:'caravan',name:'Kervan Seferi',desc:'Uzak şehirlerle ticaret.',dur:3600,frag:3,from:6},
  {id:'dragon',name:'Ejderha Mağarası',desc:'Tehlikeli ama değerli bir yolculuk.',dur:14400,frag:8,from:9}
];
O.EXPED_BY_ID={};O.EXPEDS.forEach(e=>{O.EXPED_BY_ID[e.id]=e;});
O.FRAGS_PER_SEAL=10;
O.expedCost=(e,rate)=>Math.max(50,Math.round(rate*e.dur*.15));
O.expedReward=(e,rate)=>Math.max(100,Math.round(rate*e.dur*.5));
})(window.Ors=window.Ors||{});
