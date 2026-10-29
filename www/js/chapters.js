/* Bölümler ve diyarlar
   - 10 mekân elle yazıldı (O.VENUES); sonra tur başa döner ve hedefler büyür (O.chapterAt), yani oyun bitmez.
      Hedefler bitince taşınma bedeli ödenir, ödül verilir ve sonraki mekân açılır.
   get: mevcut değeri döndürür, n: hedef. */
(function(O){
'use strict';
O.CHAPTERS=[];
/* ---------- mekânlar (bölümler) ----------
   Her bölüm bir mekândır ve tek bir müşteri ırkına hizmet eder (kraliyet bölümü karışıktır).
   goals: g=ölçü, n=hedef. fee: taşınma bedeli (altın). Hedefler bitince bedel ödenerek sonraki mekâna taşınılır.
   pay: bu mekândaki satış çarpanı. tint: mekân sahnesinin renk tonu. */
const S=(n)=>({t:n+' silah sat',get:g=>g.served,n:n});
const T=(n)=>({t:'Toplam '+O.fmt(n)+' altın kazan',get:g=>g.total,n:n});
const SEAL=(n)=>({t:n+' mührün olsun',get:g=>g.seals,n:n});
O.VENUES=[
  {id:'street',name:'Sokak Demircisi',race:'human',pay:1,tint:null,
   story:'Sokak köşesinde küçük bir ocak kurdun. İlk müşterilerini memnun et.',
   goals:()=>[S(8),{t:'1 Demirci Çırağı tut',get:g=>g.lv.smith,n:1},{t:'1 Taşıyıcı tut',get:g=>g.lv.carrier,n:1},S(90),{t:'2. ocağı aç',get:g=>g.lv.forge,n:1}],
   fee:1500,reward:{gold:60}},
  {id:'village',name:'Köy Demircisi',race:'human',pay:1.1,tint:['#7a9a4f',.20],
   story:'Köyün tek demircisi sensin. Çiftçiler ve yolcular kapında.',
   goals:()=>[S(200),T(12000),{t:'4 Demirci Çırağı tut',get:g=>g.lv.smith,n:4},{t:'Mızrak tarifini aç',get:g=>g.lv.recipe,n:2}],
   fee:20000,reward:{gold:300}},
  {id:'market',name:'Pazar Demircisi',race:'human',pay:1.2,tint:['#d4a53a',.18],
   story:'Pazarda tezgâh kurdun. Tüccarlar ve soylular sipariş veriyor.',
   goals:()=>[S(600),T(80000),{t:'1 soylu müşteriye sat',get:g=>g.nobles,n:1},{t:'Tezgâhı genişlet',get:g=>g.lv.counter,n:1},{t:'Çekiç Ustalığı 6. seviye',get:g=>g.lv.hammer,n:6}],
   fee:250000,reward:{gold:1500,boost:{speed:120}}},
  {id:'guild',name:'Lonca Demircisi',race:'elf',pay:1.3,tint:['#3f7f6a',.24],
   story:'Elf loncası seni üye aldı. Zarif yaylar ve hafif kılıçlar döveceksin. İlk Usta Mührünü almalısın.',
   goals:()=>[S(1500),T(1.5e6),{t:'İlk Usta Mührünü al',get:g=>g.prestiges,n:1},{t:'Bütün tarifleri aç',get:g=>g.lv.recipe,n:5}],
   fee:2e6,reward:{gold:9000,boost:{speed:120,gold:120}}},
  {id:'forest',name:'Orman Atölyesi',race:'elf',pay:1.4,tint:['#3f9a55',.30],
   story:'Gümüş Orman\'ın kalbinde bir atölye. Elf kraliçesinin elçileri de geliyor.',
   goals:()=>[S(3500),T(8e7),SEAL(3),{t:'Kraliyet elçisine sat',get:g=>g.royals,n:1},{t:'Çelik Kalitesi 10. seviye',get:g=>g.lv.quality,n:10}],
   fee:1e8,reward:{gold:30000}},
  {id:'fortress',name:'Kaya Kalesi',race:'orc',pay:1.5,tint:['#c0502a',.30],
   story:'Ork kalesinde ağır baltalar ve savaş çekiçleri isteniyor. Sabırsızlar ama cömertler.',
   goals:()=>[S(7000),T(1e9),SEAL(12),{t:'Çıraklık Okulu 10. seviye',get:g=>g.lv.training,n:10}],
   fee:1e9,reward:{gold:300000,boost:{speed:180,gold:180}}},
  {id:'crypt',name:'Mezarlık Dükkanı',race:'skeleton',pay:1.6,tint:['#6a7a8a',.30],
   story:'Solgun Mezarlık\'ta iskeletlerin acelesi yok. Mızrak, kalkan ve kılıç istiyorlar.',
   goals:()=>[S(12000),T(6e9),SEAL(30),{t:'Çekiç Ustalığı 14. seviye',get:g=>g.lv.hammer,n:14}],
   fee:4e9,reward:{gold:6e6}},
  {id:'castle',name:'Kan Şatosu',race:'vampire',pay:1.8,tint:['#8a2040',.34],
   story:'Vampirlerin şatosunda gece boyu iş var. Çok öderler ama beklemeyi sevmezler.',
   goals:()=>[S(20000),T(1e11),SEAL(70),{t:'5 kraliyet elçisine sat',get:g=>g.royals,n:5}],
   fee:6e10,reward:{gold:1.2e8,boost:{speed:300,gold:300}}},
  {id:'garrison',name:'Şehir Garnizonu',race:'state',pay:2,tint:['#3a5a8a',.30],
   story:'Başkentin muhafızları toplu sipariş veriyor: teber, kalkan, arbalet ve miğfer.',
   goals:()=>[S(35000),T(1.5e12),SEAL(150),{t:'Çelik Kalitesi 16. seviye',get:g=>g.lv.quality,n:16}],
   fee:1e12,reward:{gold:3e9}},
  {id:'giantvale',name:'Dev Vadisi',race:'giant',pay:2.2,tint:['#8a6a3a',.32],
   story:'Devlerin vadisinde her şey iri: ocaklar, örsler ve müşteriler. Sabırlılar ve cömertler.',
   goals:()=>[S(50000),T(8e12),SEAL(220),{t:'10 kraliyet elçisine sat',get:g=>g.royals,n:10}],
   fee:6e12,reward:{gold:4e10}},
  {id:'tower',name:'Büyücü Kulesi',race:'wizard',pay:2.4,tint:['#5a3aa0',.34],
   story:'Büyücülerin kulesinde asalar ve büyülü silahlar isteniyor. Neredeyse her sipariş bir büyü ister.',
   goals:()=>[S(80000),T(4e13),SEAL(300),{t:'15 kraliyet elçisine sat',get:g=>g.royals,n:15}],
   fee:3e13,reward:{gold:2e11,boost:{speed:300,gold:300}}},
  {id:'kingdom',name:'Krallık Demircisi',race:'mixed',pay:2.8,tint:['#d4a53a',.34],
   story:'Krallığın demircisisin. Her ırktan müşteri kapında. Adın destanlara geçecek.',
   goals:()=>[S(120000),T(2e14),SEAL(450),{t:'20 kraliyet elçisine sat',get:g=>g.royals,n:20}],
   fee:1.5e14,reward:{gold:1e12,seals:10,boost:{speed:300,gold:300}}}
];
O.VENUE_BY_ID={};O.VENUES.forEach(v=>{O.VENUE_BY_ID[v.id]=v;});
const ROMAN=['','II','III','IV','V','VI','VII','VIII','IX','X'];
const cache={};
function fmtN(n){return O.fmt(n);}
/* Mekân turu bitince (10 mekân) başa döner; her tur daha büyük hedefler ve "II, III…" eki alır */
O.venueOf=function(idx){return O.VENUES[idx%O.VENUES.length];};
O.cycleOf=function(idx){return Math.floor(idx/O.VENUES.length);};
O.venueName=function(idx){const c=O.cycleOf(idx);return O.venueOf(idx).name+(c>0?' '+(ROMAN[c]||('#'+(c+1))):'');};
/* çağ adları: bölüm başlığı "İnsan Çağı: Köy Demircisi" biçiminde gösterilir */
O.ERAS={human:'İnsan Çağı',elf:'Elf Çağı',orc:'Ork Çağı',skeleton:'İskelet Çağı',vampire:'Vampir Çağı',state:'Muhafızlar Çağı',giant:'Dev Çağı',wizard:'Büyücü Çağı',mixed:'Krallık Çağı'};
O.eraOf=function(idx){return O.ERAS[O.venueOf(idx).race];};
O.eraName=function(idx){return O.eraOf(idx)+': '+O.venueName(idx);};
O.raceOf=function(idx){
  const id=O.venueOf(idx).race;
  if(id==='mixed')return O.MIXED;
  return O.RACES.filter(r=>r.id===id)[0];
};
function make(idx){
  const v=O.venueOf(idx),c=O.cycleOf(idx);
  if(c===0)return Object.assign({},v,{venue:v.id,goals:v.goals()});
  const k=Math.pow(30,c),sk=Math.pow(2.5,c);
  const goals=[S(Math.round(v.goals()[0].n*sk)),T(v.goals()[1].n*k),SEAL(Math.round(400*Math.pow(1.8,c))),{t:(10+c*5)+' kez Usta Mührü al',get:g=>g.prestiges,n:10+c*5}];
  return {name:O.venueName(idx),story:v.story,goals:goals,fee:v.fee*k,reward:{gold:Math.round(v.reward.gold*k),boost:v.reward.boost,seals:2+c},venue:v.id,generated:true};
}
O.on('lang',function(){for(const k in cache)delete cache[k];});
O.chapterAt=function(idx){
  if(idx<0)return null;
  return cache[idx]||(cache[idx]=make(idx));
};
O.goalState=function(G,goal){
  const cur=Math.max(0,Math.min(goal.n,goal.get(G)));
  return {cur:cur,n:goal.n,done:cur>=goal.n,frac:cur/goal.n};
};
O.chapterState=function(G,idx){
  const ch=O.chapterAt(idx);
  if(!ch)return null;
  const goals=ch.goals.map(g=>Object.assign({t:g.t},O.goalState(G,g)));
  const done=goals.filter(g=>g.done).length;
  return {idx:idx,ch:ch,goals:goals,done:done,all:done===goals.length};
};
})(window.Ors=window.Ors||{});
