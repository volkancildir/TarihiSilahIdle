/* Dış hizmet bağlayıcıları: analitik, yerel bildirimler, paylaşım kartı.
   Hepsi "sağlayıcı yoksa sessizce hiçbir şey yapmaz" ilkesiyle çalışır; Capacitor eklentileri
   kurulunca otomatik devreye girer (README → "Analitik ve bildirimler"). */
(function(O){
'use strict';
const cap=()=>(window.Capacitor&&window.Capacitor.Plugins)||{};

/* ---------- analitik ----------
   Olaylar yalnızca cihazda (son 100 olay) tutulur. Firebase Analytics eklentisi varsa oraya da gönderilir.
   Elle bağlamak için: Ors.Analytics.provider=function(name,params){...} */
const EVKEY='ors-events-v1';
O.Analytics={
  provider:null,
  last:[],
  track:function(name,params){
    params=params||{};
    const rec={n:String(name).slice(0,40),p:params,t:Date.now()};
    O.Analytics.last.push(rec);if(O.Analytics.last.length>100)O.Analytics.last.shift();
    try{localStorage.setItem(EVKEY,JSON.stringify(O.Analytics.last));}catch(e){}
    try{
      if(typeof O.Analytics.provider==='function')O.Analytics.provider(rec.n,params);
      else{const fa=cap().FirebaseAnalytics;if(fa&&fa.logEvent)fa.logEvent({name:rec.n,params:params});}
    }catch(e){}
  },
  sessionStart:function(){
    const G=O.getG();
    G.meta.sessions++;
    const day=Math.floor((Date.now()-G.meta.first)/86400000);
    O.Analytics.track('ors_session',{day_n:day,sessions:G.meta.sessions,chapter:G.chapter+1,seals:G.seals});
    O.save();
  }
};
try{const s=JSON.parse(localStorage.getItem(EVKEY)||'[]');if(Array.isArray(s))O.Analytics.last=s.slice(-100);}catch(e){}
O.on('track',function(n,p){O.Analytics.track(n,p);});
O.on('ach',function(a){O.Analytics.track('achievement',{id:a.id});});

/* ---------- yerel bildirimler ----------
   Uygulama arka plana geçince en çok 4 bildirim planlanır, öne gelince iptal edilir.
   İzin, ilk bölüm bitince (değer görüldükten sonra) bir kez istenir. */
const ASKED='ors-notify-asked';
const IDS=[101,102,103,104];
function plug(){return cap().LocalNotifications||null;}
async function granted(ln){
  try{const r=await ln.checkPermissions();return r&&r.display==='granted';}catch(e){return false;}
}
function at(ms){return new Date(Date.now()+ms);}
function plan(){
  const G=O.getG(),list=[];
  if(G.rate>0)list.push({id:101,title:O.tx('Örs Dükkanı'),body:O.tx('Dükkan sen yokken çalıştı. Çevrimdışı kazancın doldu!'),schedule:{at:at(7200*1000)}});
  const d=O.dailyInfo();
  if(d.claimable)list.push({id:102,title:O.tx('Günlük ödülün seni bekliyor'),body:O.tx('Serini bozma, ödülünü al.'),schedule:{at:at(3*3600*1000)}});
  else{const t=new Date();t.setDate(t.getDate()+1);t.setHours(18,0,0,0);list.push({id:102,title:O.tx('Günlük ödülün seni bekliyor'),body:O.tx('Serini bozma, ödülünü al.'),schedule:{at:t}});}
  const st=O.chapterNow();
  if(st){
    const g=st.goals.filter(x=>!x.done).sort((a,b)=>b.frac-a.frac)[0];
    if(g&&g.frac>=.75&&g.frac<1)list.push({id:103,title:O.tx('Bölüm hedefine çok yakınsın'),body:O.tx(g.t),schedule:{at:at(45*60*1000)}});
  }
  const ei=O.expedInfo();
  if(ei.act&&!ei.act.done)list.push({id:104,title:O.tx('Seferin döndü!'),body:O.tx(ei.act.e.name+' tamamlandı. Ödülünü al.'),schedule:{at:at(ei.act.left*1000+1000)}});
  return list;
}
async function cancelAll(){
  const ln=plug();if(!ln)return;
  try{await ln.cancel({notifications:IDS.map(id=>({id:id}))});}catch(e){}
}
async function scheduleAll(){
  const ln=plug();if(!ln||!O.getG().set.notify)return;
  if(!(await granted(ln)))return;
  await cancelAll();
  try{await ln.schedule({notifications:plan()});}catch(e){}
}
O.Notify={
  available:()=>!!plug(),
  plan:plan,
  onSetting:function(on){if(!on)cancelAll();},
  maybeAsk:function(tries){
    const ln=plug();if(!ln)return;
    try{if(localStorage.getItem(ASKED))return;}catch(e){}
    /* başka bir pencere açıksa (ör. bölüm penceresi) onu ezme, sonra tekrar dene */
    if(!document.getElementById('modal').hidden||O.blockChapters){
      if((tries||0)<20)setTimeout(function(){O.Notify.maybeAsk((tries||0)+1);},3000);
      return;
    }
    O.ui.modal('Bildirimler','Çevrimdışı kazancın dolunca ve günlük ödülün hazır olunca haber verelim mi? İstediğin zaman Ayarlar\'dan kapatabilirsin.',[
      {label:'Evet, haber ver',onClick:async function(){
        try{localStorage.setItem(ASKED,'1');}catch(e){}
        try{await ln.requestPermissions();}catch(e){}
        O.Analytics.track('notify_prompt',{accepted:1});
      }},
      {label:'Şimdi değil',alt:true,onClick:function(){
        try{localStorage.setItem(ASKED,'1');}catch(e){}
        O.Analytics.track('notify_prompt',{accepted:0});
      }}
    ]);
  }
};
document.addEventListener('visibilitychange',function(){
  if(document.hidden)scheduleAll();else cancelAll();
});
O.on('chapter',function(idx){if(idx>=0)setTimeout(function(){O.Notify.maybeAsk(0);},1500);});

/* ---------- paylaşım kartı ---------- */
O.shareChapter=function(idx){
  const G=O.getG(),ch=O.chapterAt(idx),rl={name:O.venueName(idx)};
  const S=1080,H=1350,cv=document.createElement('canvas');cv.width=S;cv.height=H;
  const c=cv.getContext('2d');
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1c2430');g.addColorStop(1,'#0e131a');
  c.fillStyle=g;c.fillRect(0,0,S,H);
  c.strokeStyle='#e2a93b';c.lineWidth=10;c.strokeRect(36,36,S-72,H-72);
  c.lineWidth=2;c.strokeRect(58,58,S-116,H-116);
  const glow=c.createRadialGradient(S/2,520,20,S/2,520,520);glow.addColorStop(0,'rgba(232,84,31,.55)');glow.addColorStop(1,'rgba(232,84,31,0)');
  c.fillStyle=glow;c.fillRect(0,0,S,H);
  c.textAlign='center';c.textBaseline='alphabetic';
  const F="'Alegreya SC','Alegreya Sans',Georgia,serif";
  c.fillStyle='#e2a93b';c.font='800 74px '+F;c.fillText(O.tx('ÖRS DÜKKANI'),S/2,190);
  const ws=['sword','axe','spear','bow','shield','warhammer','greatsword','helm'];
  ws.forEach(function(w,i){try{O.drawWeapon(c,w,170+i*105,330,3.2,.35);}catch(e){}});
  c.fillStyle='#f4ead8';c.font='700 56px '+F;c.fillText(O.tx(rl.name),S/2,520);
  c.font='800 120px '+F;c.fillStyle='#ffd36b';c.fillText(O.tx('Bölüm '+(idx+1)),S/2,670);
  c.fillStyle='#f4ead8';c.font='700 64px '+F;c.fillText(O.tx(ch.name),S/2,770);
  c.font='700 46px '+F;c.fillStyle='#c9d3de';c.fillText(O.tx('TAMAMLANDI'),S/2,850);
  const stats=[['Satılan silah',O.fmt(G.served)],['Usta Mührü',String(G.seals)],['Toplam altın',O.fmt(G.total)]];
  stats.forEach(function(s,i){
    const x=210+i*330;
    c.fillStyle='#ffd36b';c.font='800 72px '+F;c.fillText(s[1],x,1020);
    c.fillStyle='#c9d3de';c.font='700 34px '+F;c.fillText(O.tx(s[0]),x,1070);
  });
  c.fillStyle='#8795a5';c.font='700 36px '+F;c.fillText(O.tx('Sen de bir demirci dükkanı kur!'),S/2,1230);
  cv.toBlob(function(blob){
    if(!blob)return;
    const file=new File([blob],'ors-dukkani-bolum-'+(idx+1)+'.png',{type:'image/png'});
    const text=O.tx('Örs Dükkanı: "')+O.tx(ch.name)+O.tx('" bölümünü tamamladım!');
    O.Analytics.track('share_card',{chapter:idx+1});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      navigator.share({files:[file],text:text}).catch(function(){});
    }else{
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(a.href);},4000);
      O.emit('toast','Kart indirildi.');
    }
  },'image/png');
};
})(window.Ors=window.Ors||{});
