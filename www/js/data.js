/* Sabit veriler: silahlar, yükseltmeler, müşteri tipleri, bölümler, başarımlar, yardımcılar */
(function(O){
'use strict';
O.lang=(function(){
  let l=null;
  try{l=localStorage.getItem('ors-lang');}catch(e){}
  if(l!=='tr'&&l!=='en')l=/^tr\b/i.test((navigator.language||'tr'))?'tr':'en';
  return l;
})();
/* ondalık ayracı: Türkçede virgül, İngilizcede nokta */
O.dec=function(str){return O.lang==='en'?str:String(str).replace('.',',');};
O.W=600;O.H=540; /* görünen sahne yüksekliği: alt boş zemin kesildi, ocak alanı oransal büyüdü */
O.FORGE_X=[105,235,365,495];
O.SLOT_X=[120,192,264,336,408,480];
O.SLOT_ORDER=[2,3,1,4,0,5];
O.PERSON_SCALE=1.3;

/* legend: efsanevi silahlar için gereken mühür sayısı */
/* rec: gereken "Yeni Tarif" seviyesi · legend: gereken mühür · ven: gereken bölüm (mekân) indeksi
   Dizi fiyata göre sıralı kalmalı (kraliyet müşterisi en yüksek açık silahı ister). */
O.WEAPONS=[
  {id:'dagger',name:'Hançer',time:3.6,price:9,rec:0},
  {id:'sword',name:'Kılıç',time:5.4,price:18,rec:0},
  {id:'axe',name:'Balta',time:7.6,price:33,rec:1},
  {id:'spear',name:'Mızrak',time:9.9,price:57,rec:2},
  {id:'bow',name:'Yay',time:12.6,price:90,rec:3},
  {id:'shield',name:'Kalkan',time:15.3,price:142,rec:4},
  {id:'warhammer',name:'Savaş Çekici',time:18,price:225,rec:5},
  {id:'mace',name:'Gürz',time:19.8,price:300,ven:2},
  {id:'greatsword',name:'Büyük Kılıç',time:21.6,price:390,legend:3},
  {id:'rapier',name:'İnce Kılıç',time:26,price:600,ven:3},
  {id:'halberd',name:'Teber',time:25.2,price:630,legend:10},
  {id:'crossbow',name:'Arbalet',time:30.6,price:1050,legend:30},
  {id:'staff',name:'Büyücü Asası',time:32,price:1100,ven:4},
  {id:'longbow',name:'Uzun Yay',time:36,price:1700,ven:4},
  {id:'helm',name:'Şövalye Miğferi',time:36,price:1800,legend:100},
  {id:'waraxe',name:'Çift Ağızlı Balta',time:40,price:2400,ven:5},
  {id:'scythe',name:'Tırpan',time:44,price:3300,ven:6},
  {id:'silverdagger',name:'Gümüş Hançer',time:48,price:4600,ven:7},
  {id:'pike',name:'Sancak Mızrağı',time:52,price:6400,ven:8},
  {id:'giantclub',name:'Dev Tokmağı',time:60,price:9000,ven:9},
  {id:'giantaxe',name:'Dev Baltası',time:66,price:12000,ven:9},
  {id:'crystalstaff',name:'Kristal Asa',time:70,price:14000,ven:10},
  {id:'thunderhammer',name:'Yıldırım Çekici',time:74,price:17000,ven:11},
  {id:'ancientstaff',name:'Kadim Asa',time:78,price:21000,ven:10},
  {id:'dragonblade',name:'Ejderha Kılıcı',time:84,price:26000,ven:11}
];
O.BASE_WEAPONS=7;
O.RECIPE_LIST=O.WEAPONS.filter(w=>w.rec!=null);
/* i. silah şu an üretilebilir mi? */
O.weaponAvail=function(G,i){
  const w=O.WEAPONS[i];
  if(w.legend)return G.seals>=w.legend;
  if(w.ven!=null)return G.chapter>=w.ven;
  return G.lv.recipe>=w.rec;
};
O.availList=function(G){const a=[];for(let i=0;i<O.WEAPONS.length;i++)if(O.weaponAvail(G,i))a.push(i);return a;};

const ar=(a,b,l,max)=>l<max?a+' → '+b:a;
const x2=v=>'×'+v.toFixed(2);
O.UPG=[
  {id:'smith',name:'Demirci Çırağı',base:30,mult:1.5,max:8,text:l=>'Silahları ocakta dövür · '+l+' çırak'},
  {id:'carrier',name:'Taşıyıcı',base:25,mult:1.5,max:8,text:l=>'Biten silahı müşteriye götürür · '+l+' taşıyıcı'},
  {id:'training',name:'Çıraklık Okulu',base:120,mult:1.6,max:25,text:l=>'Çırakların dövme hızı '+ar(x2(1+.1*l),x2(1+.1*(l+1)),l,25)},
  {id:'forge',name:'Yeni Ocak',base:220,mult:3.2,max:3,text:l=>'Aynı anda dövülen silah: '+ar(1+l,2+l,l,3)},
  {id:'counter',name:'Geniş Tezgâh',base:140,mult:2.6,max:3,text:l=>'Bekleyen müşteri sayısı: '+ar(3+l,4+l,l,3)},
  {id:'recipe',name:'Yeni Tarif',base:70,mult:3.4,max:5,text:l=>l<5?'Açılacak: '+O.RECIPE_LIST[2+l].name+' ('+O.RECIPE_LIST[2+l].price+' altın)':'Bütün tarifler açık'},
  {id:'hammer',name:'Çekiç Ustalığı',base:50,mult:1.55,max:30,text:l=>'Dövme hızı '+ar(x2(1+.16*l),x2(1+.16*(l+1)),l,30)},
  {id:'boots',name:'Hafif Çizmeler',base:45,mult:1.6,max:15,text:l=>'Yürüme hızı '+ar(x2(1+.1*l),x2(1+.1*(l+1)),l,15)},
  {id:'ads',name:'Tabela ve Reklam',base:60,mult:1.65,max:15,text:l=>'Müşteri sıklığı '+ar((5*Math.pow(.9,l)).toFixed(1)+' sn',(5*Math.pow(.9,l+1)).toFixed(1)+' sn',l,15)},
  {id:'quality',name:'Çelik Kalitesi',base:80,mult:1.75,max:40,text:l=>'Satış değeri '+ar(x2(1+.12*l),x2(1+.12*(l+1)),l,40)}
];
O.UPG_BY_ID={};O.UPG.forEach(u=>{O.UPG_BY_ID[u.id]=u;});

O.TABS=[
  {id:'workers',name:'Ekip',ids:['smith','carrier','training']},
  {id:'shop',name:'Dükkan',ids:['forge','counter','recipe']},
  {id:'grow',name:'Gelişim',ids:['hammer','boots','ads','quality']},
  {id:'rewards',name:'Görevler'},
  {id:'explore',name:'Keşif'},
  {id:'seal',name:'Mühür'}
];

O.cost=(u,l)=>Math.ceil(u.base*Math.pow(u.mult,l));
/* mode: 1, 5 ya da 'max'. Dönen n kaç seviye alınacağı, total toplam bedel. */
O.bulk=function(u,l,gold,mode){
  const cap=u.max-l;
  if(cap<=0)return {n:0,total:0};
  const want=mode==='max'?cap:Math.min(mode,cap);
  let n=0,total=0;
  for(let i=0;i<want;i++){
    const c=O.cost(u,l+i);
    if(mode==='max'&&total+c>gold)break;
    total+=c;n++;
  }
  if(n===0){n=1;total=O.cost(u,l);}
  return {n:n,total:total};
};

/* Müşteri tipleri: pay çarpanı, sabır çarpanı, ağırlık (hangi tariften itibaren çıkar) */
O.TYPES=[
  {id:'villager',pay:1,pat:1,w:70,from:0,cloth:null},
  {id:'traveler',pay:1.35,pat:.95,w:22,from:1,cloth:'#3f6f8f'},
  {id:'noble',pay:2.4,pat:.75,w:10,from:2,cloth:'#6a3a8a'}
];
O.ROYAL={id:'royal',pay:8,pat:2.2,cloth:'#8a1f3a'};

/* ---------- Günlük görev şablonları ---------- */
O.DAILY=[
  {id:'serve',text:n=>n+' silah sat',target:()=>15},
  {id:'earn',text:n=>O.fmt(n)+' altın kazan',target:r=>Math.max(300,Math.round(r*420))},
  {id:'noble',text:n=>n+' soylu müşteriye sat',target:()=>2}
];

/* Başarımlar: altın ödülü otomatik verilir */
O.ACH=[
  {id:'first',name:'İlk Satış',desc:'İlk silahını sat.',reward:10,test:g=>g.served>=1},
  {id:'sv25',name:'Tezgâh Işıldıyor',desc:'25 silah sat.',reward:40,test:g=>g.served>=25},
  {id:'sv100',name:'Mahallenin Demircisi',desc:'100 silah sat.',reward:150,test:g=>g.served>=100},
  {id:'sv500',name:'Şehrin Demircisi',desc:'500 silah sat.',reward:800,test:g=>g.served>=500},
  {id:'sv2000',name:'Krallığın Demircisi',desc:'2.000 silah sat.',reward:6000,test:g=>g.served>=2000},
  {id:'smith1',name:'İlk Çırak',desc:'Bir Demirci Çırağı tut.',reward:30,test:g=>g.lv.smith>=1},
  {id:'carr1',name:'İlk Taşıyıcı',desc:'Bir Taşıyıcı tut.',reward:30,test:g=>g.lv.carrier>=1},
  {id:'forge4',name:'Dört Ocak',desc:'Bütün ocakları aç.',reward:300,test:g=>g.lv.forge>=3},
  {id:'recipes',name:'Usta Tarifler',desc:'Bütün tarifleri aç.',reward:500,test:g=>g.lv.recipe>=5},
  {id:'hammer30',name:'Çekiç Ustası',desc:'Çekiç Ustalığını son seviyeye çıkar.',reward:15000,test:g=>g.lv.hammer>=30},
  {id:'noble1',name:'Soylu Müşteri',desc:'Bir soyluya silah sat.',reward:80,test:g=>g.nobles>=1},
  {id:'royal1',name:'Kraliyet Tedarikçisi',desc:'Kraliyet elçisine silah sat.',reward:400,test:g=>g.royals>=1},
  {id:'earn1k',name:'Kese Doldu',desc:'Toplam 1.000 altın kazan.',reward:100,test:g=>g.total>=1000},
  {id:'earn20k',name:'Sandık Doldu',desc:'Toplam 20.000 altın kazan.',reward:600,test:g=>g.total>=20000},
  {id:'earn500k',name:'Hazine Odası',desc:'Toplam 500.000 altın kazan.',reward:5000,test:g=>g.total>=500000},
  {id:'seal1',name:'İlk Mühür',desc:'İlk Usta Mührünü al.',reward:500,test:g=>g.prestiges>=1},
  {id:'seal100',name:'Efsane Zanaatkâr',desc:'100 mühre ulaş ve Şövalye Miğferi dövmeyi aç.',reward:20000,test:g=>g.seals>=100}
];

O.fmt=function(n){
  n=Math.floor(n);if(!(n>=0))n=0;
  if(n<1000)return String(n);
  const u=['K','M','B','T','Qa','Qi','Sx','Sp','Oc','No'];let i=-1,v=n;
  while(v>=1000&&i<u.length-1){v/=1000;i++;}
  if(n>=1e33)return O.dec(n.toExponential(2)).replace('e+','e');
  return O.dec(v<10?v.toFixed(2):v<100?v.toFixed(1):v.toFixed(0))+u[i];
};
O.fmtTime=function(s){s=Math.max(0,Math.ceil(s));const m=Math.floor(s/60),r=s%60;return m+':'+(r<10?'0':'')+r;};

/* Basit olay yolu: motor ile arayüz arasında */
const L={};
O.on=function(n,f){(L[n]=L[n]||[]).push(f);};
O.emit=function(n,a,b,c){(L[n]||[]).forEach(function(f){try{f(a,b,c);}catch(e){if(window.console)console.error(e);}});};
})(window.Ors=window.Ors||{});
