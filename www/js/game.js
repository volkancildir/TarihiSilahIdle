/* Oyun motoru: durum, simülasyon, kayıt, mühür (prestij), destekler, çizim döngüsü */
(function(O){
'use strict';
const W=O.W, H=O.H, WEAPONS=O.WEAPONS, UPG=O.UPG, FORGE_X=O.FORGE_X, SLOT_X=O.SLOT_X, SLOT_ORDER=O.SLOT_ORDER;
const LANE=250, SLOT_Y=440, BASE_SPEED=105, KEY='ors-dukkani-v1', DAY_LEN=240;
const FONT_B="700 15px 'Alegreya Sans', system-ui, sans-serif";

/* ---------- durum ---------- */
function freshG(){
  return {ver:3,gold:0,total:0,runTotal:0,served:0,lost:0,nobles:0,royals:0,rate:0,sps:0,last:Date.now(),
    seals:0,prestiges:0,chapter:0,
    lv:{smith:0,carrier:0,training:0,forge:0,counter:0,recipe:0,hammer:0,boots:0,ads:0,quality:0},
    boost:{speed:0,gold:0},ach:{},daily:{last:'',streak:0},
    quest:{day:'',t:{},r:{},p:{serve:0,earn:0,noble:0},c:{}},
    fair:{day:'',used:0,extra:0,fragsDay:0,medals:{b:0,s:0,g:0},best:0,played:0},
    reloc:{day:'',used:0,disc:0},ench:'',col:{w:{},r:{},e:{},claimed:{}},story:{},premium:0,tut:0,meta:{first:Date.now(),sessions:0},theme:'stone',themes:{stone:1},exp:null,frags:0,expDone:0,
    set:{sound:true,haptic:true,music:true,notify:true}};
}
let G=freshG();
O.getG=function(){return G;};

const forgeCount=()=>1+G.lv.forge, slotCount=()=>3+G.lv.counter,
  walkMul=()=>1+.1*G.lv.boots, spawnEvery=()=>5*Math.pow(.9,G.lv.ads), unlocked=()=>2+G.lv.recipe;
const hammerMul=()=>(1+.16*G.lv.hammer)*(G.boost.speed>0?2:1)*(G.premium?2:1)*O.eventMul('speed');
const sealMul=()=>1+.5*Math.sqrt(G.seals);   // azalan getiri: mühür sayısı arttıkça bonus yavaş büyür
const priceMul=()=>(1+.12*G.lv.quality)*sealMul()*(G.boost.gold>0?2:1)*O.eventMul('gold');
O.tierMax=function(){let s=0;UPG.forEach(function(u){s+=u.max;});return s;};
O.tier=function(){let s=0;for(const k in G.lv)s+=G.lv[k];return s;};
O.sealGain=function(){return Math.floor(Math.sqrt(G.runTotal/2000));};
O.sealMul=sealMul;

let T=0, spawnT=0, nextSpawn=1.2, hintT=0, saveT=0, achT=0, hiddenAt=0, shake=0;
let workers=[], customers=[], orders=[], parts=[], floats=[], earnLog=[];
let slotBusy=[false,false,false,false,false,false];
const forges=FORGE_X.map(x=>({x:x,order:null,heat:0}));
const motes=[];
for(let i=0;i<22;i++)motes.push({x:Math.random()*W,y:80+Math.random()*480,vx:(Math.random()-.5)*6,vy:-2-Math.random()*4,ph:Math.random()*6.28,r:.8+Math.random()*1.4});

/* ---------- tuval ---------- */
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const bg=document.createElement('canvas');
const lcv=document.createElement('canvas');lcv.width=lcv.height=300;
const lc=lcv.getContext('2d');
let sc=1;
function buildBG(){
  bg.width=cv.width;bg.height=cv.height;
  const c=bg.getContext('2d');c.setTransform(sc,0,0,sc,0,0);
  O.buildBackground(c);
  const th=O.THEME_BY_ID[G.theme];
  /* seçili tema yoksa mekânın kendi rengi uygulanır */
  const tint=(th&&th.tint)||(fair?null:O.venueOf(G.chapter).tint);
  if(tint){
    c.save();c.setTransform(1,0,0,1,0,0);
    c.globalCompositeOperation='overlay';c.globalAlpha=tint[1]*1.6;c.fillStyle=tint[0];c.fillRect(0,0,bg.width,bg.height);
    c.globalCompositeOperation='soft-light';c.globalAlpha=tint[1];c.fillRect(0,0,bg.width,bg.height);
    c.restore();
  }
  c.setTransform(sc,0,0,sc,0,0);c.fillStyle=(function(){const q=c.createLinearGradient(0,490,0,H);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.5)');return q;})();c.fillRect(0,490,W,H-490);
  drawShelf(c);
}
/* hikâyeli müşterilerin bıraktığı süsler alt rafa dizilir */
const SHELF=[[62,500],[95,500],[128,500],[161,500],[194,500],[227,500],[373,500],[406,500],[439,500],[472,500],[505,500]];
function drawShelf(c){
  const done=O.STORIES.filter(s=>G.story&&G.story[s.id]);
  if(!done.length)return;
  c.save();c.textAlign='center';c.textBaseline='middle';c.font="22px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
  done.forEach(function(s,i){
    const p=SHELF[O.STORIES.indexOf(s)];if(!p)return;
    c.fillStyle='#5a3a22';c.fillRect(p[0]-15,p[1]+13,30,5);c.fillStyle='rgba(255,230,180,.35)';c.fillRect(p[0]-15,p[1]+13,30,1.5);
    c.fillStyle='#000';c.fillText(s.decor.icon,p[0],p[1]);
  });
  c.restore();
}
O.rebuildBG=function(){if(cv.width>1)buildBG();};
function resize(){
  const r=cv.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const px=Math.max(1,Math.round(r.width*dpr));
  if(cv.width!==px||cv.height!==Math.round(px*H/W)){cv.width=px;cv.height=Math.round(px*H/W);sc=px/W;buildBG();}
}
if(window.ResizeObserver)new ResizeObserver(resize).observe(cv);
window.addEventListener('resize',resize);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(cv.width>1)buildBG();});

/* ---------- parçacıklar ---------- */
function sparks(x,y,n,cols){for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.4,v=60+Math.random()*100;
  parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.5+Math.random()*.5,max:1,size:1.2+Math.random()*1.7,col:cols?cols[i%cols.length]:(Math.random()<.5?'#ffd467':'#ff8a3a'),g:260,add:true});}}
function puff(x,y){for(let i=0;i<10;i++){const a=Math.random()*6.28,v=20+Math.random()*30;
  parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-10,life:.6,max:.6,size:3+Math.random()*3,col:'#d9d4cc',g:0});}}
function steam(x,y){for(let i=0;i<7;i++){parts.push({x:x+(Math.random()-.5)*16,y:y,vx:(Math.random()-.5)*10,vy:-24-Math.random()*16,life:.9+Math.random()*.4,max:1.2,size:3,gr:9,al:.45,col:'#e3e9f0',g:0});}}
function coins(x,y,n){for(let i=0;i<(n||6);i++){parts.push({x:x,y:y,vx:(Math.random()-.5)*90,vy:-90-Math.random()*60,life:.7,max:.7,size:2.6,col:'#ffd36b',g:320,add:true});}}
function confetti(){const cols=['#ffd36b','#e8541f','#5aa0c8','#7cc680','#d98ad6'];
  for(let i=0;i<46;i++){parts.push({x:Math.random()*W,y:-10-Math.random()*60,vx:(Math.random()-.5)*50,vy:40+Math.random()*120,life:1.6+Math.random(),max:2.4,size:2.4+Math.random()*2,col:cols[i%5],g:60});}}
function float(txt,x,y,col){floats.push({txt:txt,x:x,y:y,col:col,life:1.1,max:1.1});}

/* ---------- hareket ve rota ---------- */
function route(fx,fy,tx,ty){
  const p=[];
  if(Math.abs(fx-tx)>20){if(Math.abs(fy-LANE)>4)p.push([fx,LANE]);p.push([tx,LANE]);}
  p.push([tx,ty]);return p;
}
function moveAlong(e,dist){
  let moved=0;
  while(dist>0&&e.path.length){
    const t=e.path[0],dx=t[0]-e.x,dy=t[1]-e.y,d=Math.hypot(dx,dy);
    if(Math.abs(dx)>.5)e.face=dx>0?1:-1;
    if(d<=dist){e.x=t[0];e.y=t[1];dist-=d;moved+=d;e.path.shift();}
    else{e.x+=dx/d*dist;e.y+=dy/d*dist;moved+=dist;dist=0;}
  }
  e.phase+=moved*.14;e.moving=moved>.01;
}
function idleSpot(role,i){
  if(role==='master')return[300,226];
  if(role==='smith')return[FORGE_X[i%4]-34+Math.floor(i/4)*68,228];
  return[78+i*58,284];
}
const stand=f=>[f.x-6,182], pick=f=>[f.x+28,186];
const PAL={
  master:{cloth:'#7d3a2c',apron:'#3a291d',skin:'#e3b48a',hair:'#2a1a12',hat:'band',hatCol:'#c8402c',beard:true,soot:true},
  smith:{cloth:'#5d6874',apron:'#8c6a42',skin:'#d9a577',hair:'#3a2a1f',hat:'cap',hatCol:'#3a3f47',soot:true},
  carrier:{cloth:'#2f7f86',apron:'#d9c58b',skin:'#f0c9a0',hair:'#6a4a2a',hat:'straw',hatCol:'#e2b048'}
};
const SMITH_SKIN=['#d9a577','#f0c9a0','#b27a4f','#e3b48a'];
const SMITH_HAIR=['#3a2a1f','#a0763a','#1a1a1a','#6a3a1f'];

/* ---------- çalışanlar ---------- */
function mk(role,idx){
  const s=idleSpot(role,idx);
  return {role:role,idx:idx,x:s[0],y:s[1],path:[],task:null,carry:null,phase:Math.random()*6,face:1,moving:false,hamAng:null};
}
function syncWorkers(poof){
  if(!workers.some(w=>w.role==='master'))workers.push(mk('master',0));
  const need={smith:G.lv.smith,carrier:G.lv.carrier};
  ['smith','carrier'].forEach(function(role){
    let have=workers.filter(w=>w.role===role).length;
    while(have<need[role]){const w=mk(role,have);workers.push(w);if(poof){puff(w.x,w.y-14);O.emit('sfx','hire');}have++;}
  });
}
const hasCarrier=()=>workers.some(w=>w.role==='carrier');

function pickTask(w){
  if(w.role!=='smith'){
    const ready=orders.filter(o=>o.state==='ready'&&!o.carrier).sort((a,b)=>a.cust.left-b.cust.left);
    if(ready.length){
      const o=ready[0];
      if(w.role==='carrier'||!hasCarrier()||o.readyAge>2){
        o.carrier=w;w.task={t:'toPick',order:o,forge:o.forge};
        const p=pick(o.forge);w.path=route(w.x,w.y,p[0],p[1]);return;
      }
    }
  }
  if(w.role!=='carrier'){
    const n=forgeCount();
    const free=forges.filter((f,i)=>i<n&&!f.order).sort((a,b)=>Math.abs(a.x-w.x)-Math.abs(b.x-w.x));
    const nw=orders.filter(o=>o.state==='new').sort((a,b)=>a.cust.left-b.cust.left);
    if(free.length&&nw.length){
      const f=free[0],o=nw[0];
      o.state='forging';o.forge=f;o.p=0;f.order=o;
      w.task={t:'toForge',order:o,forge:f};
      const s=stand(f);w.path=route(w.x,w.y,s[0],s[1]);
    }
  }
}
function arrive(w){
  const t=w.task;if(!t)return;
  if(t.t==='toForge'){t.t='hammer';w.face=1;t.hit=.4;}
  else if(t.t==='toPick'){
    const o=t.order;w.carry=o.weapon;
    if(o.forge&&o.forge.order===o)o.forge.order=null;
    o.state='carrying';t.t='deliver';
    w.path=route(w.x,w.y,SLOT_X[o.cust.slot],300);
  }
  else if(t.t==='deliver')deliver(w);
}
function deliver(w){
  const o=w.task.order,c=o.cust;
  w.carry=null;w.task=null;
  if(o.state==='cancelled'||c.state!=='waiting')return;
  const wp=WEAPONS[o.weapon],frac=Math.max(0,c.left/c.patience);
  const base0=wp.price*priceMul()*c.type.pay*(c.racePay||1),base=base0*(c.ench?O.enchMul(c.ench,c.race):1);
  let pay=Math.round(base+base*.5*frac);
  if(c.ench)pay=Math.max(1,pay-Math.round(wp.price*priceMul()*O.ENCH_COST));
  o.state='done';c.state='served';c.t=0;c.hold=o.weapon;
  if(!fair){
    if(c.type.id==='noble'){G.nobles++;G.quest.p.noble++;}
    G.col.w[wp.id]=(G.col.w[wp.id]||0)+1;G.col.r[c.race]=(G.col.r[c.race]||0)+1;
    if(c.ench)G.col.e[c.ench]=(G.col.e[c.ench]||0)+1;
    if(c.story&&!G.story[c.story.id]){
      G.story[c.story.id]=1;const sl=addFrags(c.story.frag);O.rebuildBG();
      O.emit('track','story_done',{id:c.story.id});O.emit('story',{s:c.story,seals:sl});
    }
    if(c.type.id==='royal'){G.royals++;O.emit('toast','Kraliyet elçisi memnun kaldı: +'+O.fmt(pay)+' altın!');}
  }
  earn(pay,c.x,c.y-70,c.type.id==='noble'||c.type.id==='royal',c);
}
function updWorker(w,dt){
  const t=w.task;
  if(t&&t.order.state==='cancelled'){w.task=null;w.carry=null;w.path=[];w.hamAng=null;}
  const sp=BASE_SPEED*walkMul()*(w.role==='carrier'?1.1:1);
  if(w.path.length){
    moveAlong(w,sp*dt);
    if(!w.path.length)arrive(w);
  }else{
    w.moving=false;
    if(w.task&&w.task.t==='hammer'){
      const tt=w.task,o=tt.order,wp=WEAPONS[o.weapon];
      const hs=hammerMul()*(w.role==='master'?1.15:1+.1*G.lv.training);
      o.p+=dt*hs;tt.hit-=dt*hs;
      if(tt.hit<=0){tt.hit=.42;const ec=o.cust.ench&&O.ENCH_BY_ID[o.cust.ench];sparks(tt.forge.x,128,ec?9:7,ec?[ec.col,'#ffffff',ec.col]:null);O.emit('sfx','clang');shake=Math.max(shake,1.2);}
      w.hamAng=-1.25+1.95*Math.pow(1-Math.max(0,tt.hit)/.42,2.2);
      if(o.p>=o.time){o.state='ready';o.readyAge=0;{const ec=o.cust.ench&&O.ENCH_BY_ID[o.cust.ench];sparks(tt.forge.x,126,ec?30:18,ec?[ec.col,'#ffffff']:null);if(ec){parts.push({ring:true,x:tt.forge.x,y:121,vx:0,vy:0,g:0,life:.7,max:.7,size:10,col:ec.col});parts.push({ring:true,x:tt.forge.x,y:121,vx:0,vy:0,g:0,life:.9,max:.9,size:4,col:'#ffffff'});}}steam(tt.forge.x,122);O.emit('sfx','ready');w.task=null;w.hamAng=null;}
    }
  }
  if(!w.task&&!w.path.length){
    pickTask(w);
    if(!w.task){
      const s=idleSpot(w.role,w.idx);
      if(Math.hypot(s[0]-w.x,s[1]-w.y)>3)w.path=route(w.x,w.y,s[0],s[1]);
    }
  }
}

/* ---------- müşteriler ---------- */
const CLOTH=['#8a4f7d','#4f7a8a','#7a8a4f','#a0603a','#5a5f9a','#8f5a5a','#3f7f5f'];
const SKIN=['#f0c9a0','#d9a577','#b27a4f','#8a5a3a'];
const HAIR=['#2a1a12','#5a3a1f','#a0763a','#7a7a7a','#1a1a1a'];
const HATS=[null,'cap','straw','band'];
const HATC=['#6a4a2a','#3f5a7a','#c8402c','#e2b048'];
function pickOf(a){return a[Math.floor(Math.random()*a.length)];}
function pickType(){
  const tp=O.TYPES.filter(t=>G.lv.recipe>=t.from);
  let tot=0;tp.forEach(t=>{tot+=t.w;});
  let r=Math.random()*tot;
  for(const t of tp){r-=t.w;if(r<=0)return t;}
  return tp[0];
}
function freeSlot(){const n=slotCount();for(let i=0;i<n;i++){const p=SLOT_ORDER[i];if(!slotBusy[p])return p;}return -1;}
let fair=null;
const raceNow=()=>fair?fair.race:O.raceOf(G.chapter);
function syncRace(){O.weaponFilter=raceNow().filter||'';}
O.syncRace=syncRace;
O.raceNow=raceNow;
/* ırkın favori silahları 4 kat ağırlıkla seçilir */
function pickWeapon(av,race){
  const fw=fair?8:4;
  let tot=0;const w=av.map(function(i){const x=race.fav.indexOf(WEAPONS[i].id)>=0?fw:1;tot+=x;return x;});
  let r=Math.random()*tot;
  for(let k=0;k<av.length;k++){r-=w[k];if(r<=0)return av[k];}
  return av[av.length-1];
}
/* müşteri ırkının sevdiği (çarpanı 1,2 ve üstü) açık büyülerden birini ister */
const enchSeen={};
function enchUnlocked(e){return !e.need||!!G.story[e.need];}
O.enchUnlocked=enchUnlocked;
function pickEnch(race){
  if(G.chapter<O.ENCH_FROM||Math.random()>(race.enchChance||O.ENCH_CHANCE))return null;
  const l=O.ENCHS.filter(e=>enchUnlocked(e)&&(e.aff[race.id]||0)>=1.2);
  if(!l.length)return null;
  let tot=0;const w=l.map(e=>{const x=Math.pow(e.aff[race.id],3);tot+=x;return x;});
  let r=Math.random()*tot;
  for(let i=0;i<l.length;i++){r-=w[i];if(r<=0)return l[i].id;}
  return l[l.length-1].id;
}
function spawnCustomer(p,royal,story){
  const av=O.availList(G);let race=royal?O.RACES[0]:raceNow();
  if(story)race=O.RACES.filter(r=>r.id===story.race)[0];
  else if(race.mixed)race=pickOf(O.RACES);
  let wi=royal?av[av.length-1]:pickWeapon(av,race);
  if(story){const k=WEAPONS.findIndex(w=>w.id===story.weapon);wi=av.indexOf(k)>=0?k:av[av.length-1];}
  const wp=WEAPONS[wi],type=story?O.STORYT:(royal?O.ROYAL:pickType());
  const titled=type.id==='noble'||type.id==='royal';
  const ench=(!fair&&!royal&&!story)?pickEnch(race):null;
  const c={x:300,y:572,path:[[300,512],[SLOT_X[p],512],[SLOT_X[p],SLOT_Y]],slot:p,state:'entering',weapon:wi,type:type,
    patience:(28+wp.time*5)*type.pat*race.pat*(fair?.75:1),race:race.id,racePay:race.pay*(fair?1:O.venueOf(G.chapter).pay),left:0,order:null,phase:Math.random()*6,face:1,moving:true,hold:null,angry:false,t:0,dead:false,
    cloth:type.cloth||pickOf(race.cloths||CLOTH),skin:pickOf(race.skins||SKIN),hair:pickOf(race.hairs||HAIR),hat:titled?null:(race.helm?'helm':(race.wizardHat?'wizard':pickOf(HATS))),hatCol:pickOf(HATC),
    story:story||null,ench:ench,beard:race.id==='wizard'||((race.id==='human'||race.id==='state')&&Math.random()<.3),big:!!race.big,crown:titled};
  c.left=c.patience;slotBusy[p]=true;customers.push(c);
  if(c.ench&&!enchSeen[c.ench]){enchSeen[c.ench]=1;const e=O.ENCH_BY_ID[c.ench];O.emit('toast','Müşteri '+e.icon+' '+e.name+' istiyor: dövme %15 uzar ama fazla öder.');}
}
function leave(c,angry){
  if(c.order&&c.order.state!=='done'){const o=c.order;o.state='cancelled';if(o.forge&&o.forge.order===o)o.forge.order=null;}
  slotBusy[c.slot]=false;c.state='leaving';c.angry=angry;
  if(angry){if(fair){fair.lost++;fair.combo=0;}else G.lost++;float(O.tx('Kaçtı!'),c.x,c.y-72,'#ff8a73');O.emit('sfx','angry');}
  c.path=[[c.x,512],[300,512],[300,580]];
}
function updCust(c,dt){
  if(c.path.length){
    moveAlong(c,BASE_SPEED*.8*dt);
    if(!c.path.length){
      c.moving=false;
      if(c.state==='entering'){
        c.state='waiting';c.face=1;
        const o={cust:c,weapon:c.weapon,time:WEAPONS[c.weapon].time*(c.ench?O.ENCH_TIME:1),state:'new',p:0,forge:null,readyAge:0,carrier:null};
        orders.push(o);c.order=o;
      }else if(c.state==='leaving')c.dead=true;
    }
  }else c.moving=false;
  if(c.state==='waiting'){c.left-=dt;if(c.left<=0)leave(c,true);}
  else if(c.state==='served'){c.t+=dt;if(c.t>.9)leave(c,false);}
}

/* ---------- ekonomi ---------- */
function earn(amt,x,y,big,c){
  if(fair){
    const fav=c&&fair.race.fav.indexOf(WEAPONS[c.weapon].id)>=0,mult=Math.min(3,1+fair.combo*.2);
    const pts=Math.round(amt*mult*(fav?1.5:1));
    fair.combo++;fair.bestCombo=Math.max(fair.bestCombo,fair.combo);fair.score+=pts;fair.gold+=amt;fair.sold++;
    float('+'+O.fmt(pts)+(mult>1?' ×'+O.dec(mult.toFixed(1)):''),x,y,fav?'#9ef0a0':'#ffd36b');coins(x,y+18,big?12:6);
    O.emit('sfx','coin');return;
  }
  G.gold+=amt;G.total+=amt;G.runTotal+=amt;G.served++;earnLog.push({t:T,a:amt});
  G.quest.p.serve++;G.quest.p.earn+=amt;
  float('+'+O.fmt(amt),x,y,big?'#fff0a8':'#ffd36b');coins(x,y+18,big?12:6);
  O.emit('sfx','coin');
}
function curRate(){
  while(earnLog.length&&earnLog[0].t<T-300)earnLog.shift();
  let s=0;for(const e of earnLog)if(e.t>=T-60)s+=e.a;
  return s/Math.max(10,Math.min(60,T));
}
/* Çevrimdışı kazanç hızı: son 5 dakikanın ortalaması. Bu oturum 5 dakikadan kısaysa eksik kısım önceki oturumun
   kayıtlı hızıyla doldurulur (30 sn oynayıp çıkan oyuncu da hak ettiğini alır). gold: altın/sn, sps: satılan silah/sn */
let rateBase={g:0,s:0};
function avgRates(){
  while(earnLog.length&&earnLog[0].t<T-300)earnLog.shift();
  const w=Math.min(300,Math.max(T,1));let s=0;for(const e of earnLog)s+=e.a;
  /* önceki kayıtlı hız yoksa (ilk oyun, Mühür sonrası) yalnızca oynanan süre üzerinden ortalama alınır */
  if(!rateBase.g&&!rateBase.s){const ww=Math.max(w,20);return {gold:s/ww,sps:earnLog.length/ww};}
  const rest=300-w;
  return {gold:(s+rateBase.g*rest)/300,sps:(earnLog.length+rateBase.s*rest)/300};
}
O.curRate=curRate;
O.giveGold=function(n){n=Math.floor(n);if(n>0){G.gold+=n;O.emit('sfx','coin');}};

O.buy=function(id,mode){
  const u=O.UPG_BY_ID[id],l=G.lv[id];
  if(!u||l>=u.max)return false;
  const b=O.bulk(u,l,G.gold,mode);
  if(G.gold<b.total)return false;
  G.gold-=b.total;G.lv[id]=l+b.n;
  if(id==='smith'||id==='carrier')syncWorkers(true);
  O.emit('sfx','buy');O.buzz(12);
  save();
  return true;
};

/* ---------- mühür (prestij) ---------- */
O.doPrestige=function(){
  const gain=O.sealGain();
  if(gain<1)return false;
  const keep={seals:G.seals+gain,prestiges:G.prestiges+1,total:G.total,served:G.served,lost:G.lost,nobles:G.nobles,royals:G.royals,
    chapter:G.chapter,quest:G.quest,ach:G.ach,set:G.set,daily:G.daily,
    fair:G.fair,reloc:G.reloc,ench:G.ench,col:G.col,story:G.story,premium:G.premium,tut:G.tut,meta:G.meta,theme:G.theme,themes:G.themes,exp:G.exp,frags:G.frags,expDone:G.expDone};
  G=Object.assign(freshG(),keep);
  G.gold=25*G.seals;rollQuests();
  resetWorld();
  confetti();O.emit('sfx','prestige');O.buzz(40);
  O.emit('track','prestige',{gain:gain,seals:G.seals,chapter:G.chapter});
  O.emit('toast','Usta Mührü alındı: +'+gain+' mühür. Gelir ×'+O.dec(sealMul().toFixed(1))+'.');
  save();
  return true;
};

/* ---------- destekler ve günlük ödül ---------- */
O.addBoost=function(kind,secs){
  if(kind!=='speed'&&kind!=='gold')return;
  G.boost[kind]=Math.min(900,G.boost[kind]+secs);
};
function dayKey(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
O.dailyInfo=function(){
  const now=new Date(),today=dayKey(now),y=new Date(now.getTime()-864e5),yk=dayKey(y);
  const claimable=G.daily.last!==today;
  let streak=G.daily.streak;
  if(claimable)streak=(G.daily.last===yk)?(streak%7)+1:1;
  const reward=Math.round(Math.max(50,G.rate*90)*(1+.25*(streak-1)));
  return {claimable:claimable,streak:streak,reward:reward,today:today};
};
O.claimDaily=function(){
  const d=O.dailyInfo();
  if(!d.claimable)return false;
  G.daily.last=d.today;G.daily.streak=d.streak;
  O.giveGold(d.reward);
  if(d.streak===7){O.addBoost('speed',120);O.addBoost('gold',120);}
  O.emit('track','daily_claim',{streak:d.streak});
  O.emit('sfx','ach');coins(300,330,16);save();
  return true;
};

/* ---------- başarımlar ---------- */
function checkAch(){
  O.ACH.forEach(function(a){
    if(G.ach[a.id])return;
    if(a.test(G)){
      G.ach[a.id]=1;G.gold+=a.reward;
      O.emit('ach',a);O.emit('sfx','ach');confetti();
    }
  });
}

/* ---------- bölümler ---------- */
O.blockChapters=false;
O.chapterNow=function(){return O.chapterState(G,G.chapter);};
/* Hedefler bitince bölüm hazır olur; sonraki mekâna taşınmak için taşınma bedeli ödenir.
   Reklam izleyerek bedelin %10'u düşürülebilir (günde en çok 3 kez). */
const RELOC_MAX=3,RELOC_CUT=.1;
function relocDay(){const t=dayKey(new Date());if(G.reloc.day!==t){G.reloc.day=t;G.reloc.used=0;}}
O.relocInfo=function(){
  relocDay();
  const st=O.chapterState(G,G.chapter),fee=O.chapterAt(G.chapter).fee,pay=Math.ceil(fee*(1-G.reloc.disc));
  return {ready:!!(st&&st.all),fee:fee,pay:pay,disc:G.reloc.disc,adsLeft:RELOC_MAX-G.reloc.used,cut:RELOC_CUT,can:G.gold>=pay};
};
O.relocAd=function(){
  relocDay();
  if(G.reloc.used>=RELOC_MAX)return false;
  G.reloc.used++;G.reloc.disc=Math.min(.3,G.reloc.disc+RELOC_CUT);
  O.emit('track','reloc_ad',{chapter:G.chapter+1});save();return true;
};
O.relocate=function(){
  const r=O.relocInfo();
  if(!r.ready||G.gold<r.pay)return false;
  const idx=G.chapter,rw=O.chapterAt(idx).reward;
  G.gold-=r.pay;
  G.chapter++;G.reloc.disc=0;
  G.gold+=rw.gold;
  if(rw.seals)G.seals+=rw.seals;
  if(rw.boost){for(const k in rw.boost)O.addBoost(k,rw.boost[k]);}
  syncRace();O.rebuildBG();
  confetti();O.emit('sfx','chapter');O.buzz(40);
  O.emit('track','chapter_complete',{chapter:idx+1,seals:G.seals});
  O.emit('chapter',idx);
  save();return true;
};
let readyAt=-1;
function checkChapter(){
  const st=O.chapterState(G,G.chapter);
  if(!st||!st.all){readyAt=-1;return;}
  if(readyAt!==G.chapter){readyAt=G.chapter;O.emit('ready',G.chapter);}
}

/* ---------- günlük görevler ---------- */
function rollQuests(){
  const today=dayKey(new Date());
  if(G.quest.day===today)return;
  const rate=Math.max(G.rate||0,curRate()),t={},r={};
  O.DAILY.forEach(function(q){t[q.id]=q.target(rate);r[q.id]=Math.max(80,Math.round(rate*160));});
  G.quest={day:today,t:t,r:r,p:{serve:0,earn:0,noble:0},c:{}};
}
O.questList=function(){
  return O.DAILY.map(function(q){
    const t=G.quest.t[q.id]||1,p=Math.min(t,G.quest.p[q.id]||0);
    return {id:q.id,text:q.text(t),cur:p,target:t,reward:G.quest.r[q.id]||0,done:p>=t,claimed:!!G.quest.c[q.id]};
  });
};
O.claimQuest=function(id){
  const q=O.questList().filter(x=>x.id===id)[0];
  if(!q||!q.done||q.claimed)return false;
  G.quest.c[id]=1;O.giveGold(q.reward);O.emit('sfx','ach');coins(300,330,10);save();
  return true;
};

/* ---------- fuar (süreli mini mod) ---------- */
const FAIR_LEN=180,FAIR_FREE=3,FAIR_FRAG_CAP=3;
function fairDay(){
  const d=dayKey(new Date());
  if(G.fair.day!==d){G.fair.day=d;G.fair.used=0;G.fair.extra=0;G.fair.fragsDay=0;}
}
const fairRef=()=>Math.max(2,G.rate||0,curRate());
/* bugünün fuar teması tarihe göre sabit */
O.fairTheme=function(){const d=new Date();return O.RACES[(d.getFullYear()*372+d.getMonth()*31+d.getDate())%O.RACES.length];};
O.fairInfo=function(){
  fairDay();
  return {open:G.chapter>=2,left:Math.max(0,FAIR_FREE+G.fair.extra-G.fair.used),theme:O.fairTheme(),best:G.fair.best,medals:G.fair.medals,played:G.fair.played,
    active:!!fair,t:fair?fair.t:0,score:fair?fair.score:0,combo:fair?fair.combo:0,len:FAIR_LEN};
};
O.fairAddEntry=function(){fairDay();G.fair.extra++;save();};
O.fairStart=function(){
  fairDay();
  if(fair||G.chapter<2||G.fair.used>=FAIR_FREE+G.fair.extra)return false;
  G.fair.used++;
  fair={t:FAIR_LEN,score:0,gold:0,combo:0,bestCombo:0,sold:0,lost:0,race:O.fairTheme(),ref:fairRef()};
  resetWorld();syncRace();O.rebuildBG();
  O.emit('track','fair_start',{theme:fair.race.id});
  O.emit('fair',{type:'start'});
  save();return true;
};
function addFrags(n){
  G.frags+=n;let seals=0;
  while(G.frags>=O.FRAGS_PER_SEAL){G.frags-=O.FRAGS_PER_SEAL;seals++;}
  G.seals+=seals;return seals;
}
function fairEnd(){
  if(!fair)return;
  const f=fair;
  /* tema pahalı silahları öne çıkarıyorsa beklenen puan da yükselir: ortalama fiyat oranıyla düzelt */
  const av=O.availList(G);let sw=0,sp=0,su=0;
  av.forEach(function(i){const w=f.race.fav.indexOf(WEAPONS[i].id)>=0?8:1;sw+=w;sp+=w*WEAPONS[i].price;su+=WEAPONS[i].price;});
  const norm=(sp/sw)/(su/av.length);
  const ratio=f.score/(f.ref*FAIR_LEN*norm);
  /* ölçüm: hiç dokunmadan oynayan bir oyuncu yaklaşık 12–32 kat alır; eşikler buna göre */
  const medal=ratio>=35?'g':ratio>=20?'s':ratio>=10?'b':'';
  const mul={g:1.5,s:1.25,b:1,'':.5}[medal];
  const gold=Math.round(Math.min(f.gold*mul,f.ref*1200));
  fairDay();
  const want={g:3,s:1,b:0,'':0}[medal],frags=Math.max(0,Math.min(want,FAIR_FRAG_CAP-G.fair.fragsDay));
  G.fair.fragsDay+=frags;
  G.gold+=gold;G.total+=gold;G.runTotal+=gold;
  const seals=frags?addFrags(frags):0;
  const newBest=f.score>G.fair.best;
  if(newBest)G.fair.best=f.score;
  G.fair.played++;if(medal)G.fair.medals[medal]++;
  const res={type:'end',ratio:ratio,score:f.score,medal:medal,gold:gold,frags:frags,seals:seals,bestCombo:f.bestCombo,sold:f.sold,lost:f.lost,newBest:newBest,race:f.race.id};
  fair=null;resetWorld();syncRace();O.rebuildBG();
  confetti();O.emit('sfx',medal?'chapter':'click');
  O.emit('track','fair_end',{medal:medal||'none',score:f.score});
  O.emit('fair',res);
  save();
}
O.fairEnd=fairEnd;

/* ---------- seferler ---------- */
O.expedInfo=function(){
  const rate=Math.max(G.rate||0,curRate());
  const list=O.EXPEDS.map(function(e){
    return {e:e,open:G.chapter>=e.from,cost:O.expedCost(e,rate),reward:O.expedReward(e,rate)};
  });
  let act=null;
  if(G.exp){
    const e=O.EXPED_BY_ID[G.exp.id],left=Math.max(0,(G.exp.start+e.dur*1000-Date.now())/1000);
    act={e:e,left:left,done:left<=0,reward:G.exp.reward,skipsLeft:Math.max(0,EXP_SKIPS-(G.exp.skips||0))};
  }
  return {list:list,act:act,frags:G.frags};
};
/* Reklam izleyerek kalan sefer süresi yarıya iner (seferde en çok 2 kez) */
const EXP_SKIPS=2;
O.expedSkip=function(){
  const i=O.expedInfo();
  if(!i.act||i.act.done||i.act.skipsLeft<1)return false;
  G.exp.start-=i.act.left*500;G.exp.skips=(G.exp.skips||0)+1;
  O.emit('track','expedition_skip',{id:i.act.e.id});save();return true;
};
O.expedStart=function(id){
  const e=O.EXPED_BY_ID[id];
  if(!e||G.exp||G.chapter<e.from)return false;
  const rate=Math.max(G.rate||0,curRate()),cost=O.expedCost(e,rate);
  if(G.gold<cost)return false;
  G.gold-=cost;G.exp={id:id,start:Date.now(),reward:O.expedReward(e,rate)};
  O.emit('sfx','buy');O.emit('track','expedition_start',{id:id});save();
  return true;
};
O.expedClaim=function(){
  const i=O.expedInfo();
  if(!i.act||!i.act.done)return false;
  G.gold+=G.exp.reward;G.total+=G.exp.reward;G.runTotal+=G.exp.reward;
  G.frags+=i.act.e.frag;
  let seals=0;
  while(G.frags>=O.FRAGS_PER_SEAL){G.frags-=O.FRAGS_PER_SEAL;seals++;}
  G.seals+=seals;G.expDone++;
  const r=G.exp.reward;G.exp=null;
  coins(300,330,14);O.emit('sfx','ach');
  O.emit('toast','Sefer döndü: +'+O.fmt(r)+' altın, +'+i.act.e.frag+' Mühür Parçası'+(seals?' ve +'+seals+' Usta Mührü!':'.'));
  O.emit('track','expedition_claim',{id:i.act.e.id});
  save();return true;
};

/* ---------- temalar ---------- */
O.themeUse=function(id){
  const t=O.THEME_BY_ID[id];
  if(!t||!G.themes[id])return false;
  G.theme=id;O.rebuildBG();O.emit('sfx','click');save();return true;
};
O.themeBuy=function(id){
  const t=O.THEME_BY_ID[id];
  if(!t||G.themes[id]||G.gold<t.cost)return false;
  G.gold-=t.cost;G.themes[id]=1;O.emit('sfx','buy');O.emit('track','theme_buy',{id:id});
  return O.themeUse(id);
};
O.setTut=function(n){if(n>G.tut){G.tut=n;save();}};

/* ---------- kraliyet elçisi ---------- */
let royalT=0,nextRoyal=150;
function royalTick(dt){
  if(fair)return;
  if(G.chapter<3)return;
  royalT+=dt*O.eventMul('royal');
  if(royalT<nextRoyal)return;
  const s=freeSlot();
  if(s<0){royalT=nextRoyal-8;return;}
  spawnCustomer(s,true);
  royalT=0;nextRoyal=150+Math.random()*90;
  O.emit('toast','Kraliyet elçisi geldi! Büyük ödül için sabrı bitmeden sipariş ver.');O.emit('sfx','royal');
}

/* ---------- hikâyeli müşteriler ---------- */
let storyT=0,nextStory=70,storyHold=false;
function storyTick(dt){
  if(fair)return;
  /* bulunduğun mekânın hikâyesi öne geçer, yoksa en eski bekleyen gelir */
  const open=O.STORIES.filter(x=>!G.story[x.id]&&x.from<=G.chapter);
  const s=open.filter(x=>x.from===G.chapter)[0]||open[0];
  if(!s){storyHold=false;return;}
  storyT+=dt;
  if(storyT<nextStory)return;
  if(customers.some(c=>c.story)){storyHold=false;return;}
  const sl=freeSlot();
  /* yer yoksa sıradan müşteri alımı durur, ilk boşalan yer hikâyeli müşteriye kalır */
  if(sl<0){storyHold=true;return;}
  storyHold=false;spawnCustomer(sl,false,s);
  storyT=0;nextStory=200+Math.random()*120;
  O.emit('toast',s.name+' geldi: "'+s.line+'"');O.emit('sfx','royal');
}
O.storyInfo=function(){return O.STORIES.map(s=>({s:s,done:!!G.story[s.id],open:s.from<=G.chapter}));};

/* ---------- silah büyüsü ---------- */
O.enchOpen=()=>G.chapter>=O.ENCH_FROM;

/* ---------- koleksiyon defteri ---------- */
O.collInfo=function(){
  const W2=WEAPONS.map(w=>({name:w.name,got:!!G.col.w[w.id],n:G.col.w[w.id]||0}));
  const R2=O.RACES.map(r=>({name:r.name,got:!!G.col.r[r.id],n:G.col.r[r.id]||0}));
  const V2=O.VENUES.map((v,i)=>({name:v.name,got:i<=G.chapter||G.chapter>=O.VENUES.length}));
  const S2=O.STORIES.map(s=>({name:G.story[s.id]?s.decor.icon+' '+s.decor.name:'???',got:!!G.story[s.id]}));
  const E2=O.ENCHS.map(e=>({name:e.icon+' '+e.name,got:!!G.col.e[e.id]}));
  const mk=(id,name,items)=>{const n=items.filter(x=>x.got).length;return {id:id,name:name,items:items,got:n,total:items.length,full:n===items.length,claimed:!!G.col.claimed[id],reward:O.COLL_REWARD[id]};};
  const secs=[mk('weapons','Silahlar',W2),mk('races','Irklar',R2),mk('venues','Mekânlar',V2),mk('stories','Hikâyeli müşteriler',S2),mk('enchants','Büyüler',E2)];
  const got=secs.reduce((a,x)=>a+x.got,0),total=secs.reduce((a,x)=>a+x.total,0);
  return {secs:secs,got:got,total:total};
};
O.collClaim=function(id){
  const sec=O.collInfo().secs.filter(x=>x.id===id)[0];
  if(!sec||!sec.full||sec.claimed)return false;
  G.col.claimed[id]=1;const seals=addFrags(sec.reward);
  O.emit('sfx','ach');O.emit('track','coll_claim',{id:id});save();return {frags:sec.reward,seals:seals};
};

/* ---------- Usta Paketi (tek seferlik satın alma) ---------- */
O.hasPremium=()=>!!G.premium;
O.setPremium=function(){G.premium=1;O.emit('track','premium_buy',{});save();};

/* ---------- güncelleme ---------- */
let decorN=-1;
function decorWatch(){
  const n=O.DECOR.filter(d=>O.tier()>=d.at).length;
  if(n!==decorN){
    if(decorN>=0&&n>decorN&&!fair){const d=O.DECOR.filter(d=>O.tier()>=d.at)[n-1];O.emit('decor',d);O.emit('sfx','ach');}
    decorN=n;O.rebuildBG();
  }
}
function update(dt){
  decorWatch();
  T+=dt;O.time=T;
  if(Math.floor(T*2)!==syncRace.last){syncRace.last=Math.floor(T*2);syncRace();}
  spawnT+=dt;
  royalTick(dt);storyTick(dt);
  if(spawnT>=nextSpawn&&!storyHold){const s=freeSlot();if(s>=0){spawnCustomer(s);spawnT=0;nextSpawn=spawnEvery()*(fair?.55:1)*(.8+Math.random()*.4);}}
  for(const c of customers)updCust(c,dt);
  for(const w of workers)updWorker(w,dt);
  for(const o of orders)if(o.state==='ready')o.readyAge+=dt;
  const n=forgeCount();
  forges.forEach(function(f,i){
    const target=i>=n?0:(f.order&&f.order.state==='forging'&&f.order.p>0?1:(f.order?.55:.4));
    f.heat+=(target-f.heat)*Math.min(1,dt*3);
  });
  customers=customers.filter(c=>!c.dead);
  orders=orders.filter(o=>o.state!=='done'&&o.state!=='cancelled');
  for(const p of parts){p.life-=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
  parts=parts.filter(p=>p.life>0);
  for(const f of floats){f.life-=dt;f.y-=24*dt;}
  floats=floats.filter(f=>f.life>0);
  for(const m of motes){m.x+=(m.vx+Math.sin(T*.6+m.ph)*4)*dt;m.y+=m.vy*dt;if(m.y<60){m.y=590;m.x=Math.random()*W;}if(m.x<0)m.x=W;if(m.x>W)m.x=0;}
  if(G.boost.speed>0)G.boost.speed=Math.max(0,G.boost.speed-dt);
  if(G.boost.gold>0)G.boost.gold=Math.max(0,G.boost.gold-dt);
  shake=Math.max(0,shake-dt*6);
  achT+=dt;if(achT>.5){achT=0;checkAch();checkChapter();rollQuests();}
  hintT+=dt;if(hintT>.6){hintT=0;O.emit('hint',hintText());}
  if(fair){fair.t-=dt;if(fair.t<=0)fairEnd();}
  saveT+=dt;if(saveT>5){saveT=0;save();}
}

const HINT_DEFAULT='Ocakta silah dövülürken örse dokun: çekiç daha hızlı iner.';
function hintText(){
  if(fair)return 'Fuar sürüyor: favori silahları sat, hatasız satışlarla kombo yap!';
  const n=forgeCount();
  const freeForge=forges.some((f,i)=>i<n&&!f.order);
  const newCount=orders.filter(o=>o.state==='new').length;
  const readyWait=orders.filter(o=>o.state==='ready'&&!o.carrier).length;
  const idleSmith=workers.some(w=>w.role!=='carrier'&&!w.task);
  if(G.total===0)return 'İlk müşteri geliyor. Ustan siparişi ocakta dövecek, örse dokunarak hızlandır.';
  if(O.tier()===0&&G.gold>=25)return 'Altının yetiyor: Ekip sekmesinden bir Taşıyıcı tut.';
  if(O.sealGain()>=1&&G.prestiges===0)return 'Mühür sekmesinde Usta Mührü alabilirsin: kalıcı gelir bonusu kazanırsın.';
  if(newCount>=1&&!freeForge&&G.lv.forge<3)return 'Bütün ocaklar dolu. Yeni Ocak açarsan aynı anda daha çok silah dövülür.';
  if(readyWait>=2&&G.lv.carrier<8)return 'Biten silahlar bekliyor. Bir Taşıyıcı tutarsan ustan dövmeye devam eder.';
  if(newCount>=2&&freeForge&&!idleSmith&&G.lv.smith<8)return 'Sipariş birikiyor. Demirci Çırağı tutarsan boş ocaklar çalışır.';
  if(G.lost>0&&customers.filter(c=>c.state==='waiting').length>=slotCount()&&G.lv.counter<3)return 'Tezgâh dolu. Geniş Tezgâh daha çok müşteri bekletir.';
  return HINT_DEFAULT;
}

/* ---------- çizim ---------- */
function drawLight(c,sky){
  const l=lc,k=300/W;
  l.globalCompositeOperation='source-over';l.clearRect(0,0,300,300);
  l.fillStyle='rgba(6,10,30,'+(sky.dark+.04)+')';l.fillRect(0,0,300,300);
  l.globalCompositeOperation='destination-out';
  function pool(x,y,r,a){const g=l.createRadialGradient(x*k,y*k,0,x*k,y*k,r*k);g.addColorStop(0,'rgba(0,0,0,'+Math.min(1,a)+')');g.addColorStop(1,'rgba(0,0,0,0)');l.fillStyle=g;l.fillRect(0,0,300,300);}
  pool(300,320,360,.45);
  const n=forgeCount();
  forges.forEach(function(f,i){pool(f.x,112,i<n?150+70*f.heat:90,i<n?.55+.45*f.heat:.2);});
  const fl=Math.sin(T*9)*.05+Math.sin(T*13.7)*.04;
  pool(96,330,150,.7+fl);pool(504,330,150,.7-fl);
  pool(300,600,190,.5);
  if(O.tier()>=10)O.TORCH_POS.forEach(function(p,i){pool(p[0],p[1],130,.7+(i?-fl:fl));});
  c.drawImage(lcv,0,0,W,W);
}
function drawGlows(c){
  c.save();c.globalCompositeOperation='lighter';
  forges.forEach(function(f){
    if(f.heat<.05)return;
    const g=c.createRadialGradient(f.x,98,6,f.x,112,125);
    g.addColorStop(0,'rgba(255,140,50,'+(.36*f.heat)+')');g.addColorStop(1,'rgba(255,100,30,0)');
    c.fillStyle=g;c.fillRect(f.x-135,0,270,260);
  });
  [96,504].forEach(function(x,i){
    const a=.22+(i?-1:1)*(Math.sin(T*9)*.03);
    const g=c.createRadialGradient(x,324,2,x,324,70);g.addColorStop(0,'rgba(255,200,110,'+a+')');g.addColorStop(1,'rgba(255,170,80,0)');
    c.fillStyle=g;c.fillRect(x-80,250,160,150);
  });
  if(O.tier()>=10)O.TORCH_POS.forEach(function(p){
    const g=c.createRadialGradient(p[0],p[1]-4,2,p[0],p[1]-4,80);g.addColorStop(0,'rgba(255,170,80,.26)');g.addColorStop(1,'rgba(255,150,60,0)');
    c.fillStyle=g;c.fillRect(p[0]-90,p[1]-90,180,180);
  });
  for(const m of motes){c.fillStyle='rgba(255,230,190,'+(.1+.08*Math.sin(T*1.5+m.ph))+')';c.beginPath();c.arc(m.x,m.y,m.r,0,7);c.fill();}
  c.restore();
}
function personOf(e,role){
  const pal=PAL[role]||e;
  let skin=pal.skin,hair=pal.hair;
  if(role==='smith'){skin=SMITH_SKIN[e.idx%4];hair=SMITH_HAIR[e.idx%4];}
  let mood='';
  if(!role){
    if(e.angry)mood='angry';else if(e.state==='served')mood='happy';else if(e.state==='waiting'&&e.left/e.patience<.3)mood='worry';
  }else if(role!=='carrier'&&e.hamAng!=null)mood='happy';
  return {x:e.x,y:e.y,face:e.face,phase:e.phase,moving:e.moving,cloth:pal.cloth,apron:pal.apron,skin:skin,hair:hair,hat:pal.hat,hatCol:pal.hatCol,
    beard:pal.beard,soot:pal.soot,crown:e.crown,race:e.race,big:e.big,
    carry:e.carry!=null?e.carry:(e.hold!=null?e.hold:null),hammer:e.hamAng!=null?e.hamAng:null,mood:mood};
}
/* ---------- sahne içi satın alma düğmeleri: yeni ocak, çırak, taşıyıcı ---------- */
function sceneBtns(){
  const L=[],f=G.lv;
  return L; /* sahne içi + düğmeleri kapalı */
  if(fair)return L;
  if(f.forge<O.UPG_BY_ID.forge.max)L.push({id:'forge',x:FORGE_X[forgeCount()],y:70,k:.85});
  /* sağda, tezgâhın ocağa bakan yüzünde, tezgâh hizasında */
  if(f.smith<O.UPG_BY_ID.smith.max)L.push({id:'smith',x:552,y:216,k:1});
  if(f.carrier<O.UPG_BY_ID.carrier.max)L.push({id:'carrier',x:552,y:296,k:1});
  if(f.counter<O.UPG_BY_ID.counter.max&&slotCount()<6)L.push({id:'counter',x:SLOT_X[SLOT_ORDER[slotCount()]],y:438,k:.85});
  return L;
}
function drawSceneBtns(c){
  const L=sceneBtns();if(!L.length)return;
  c.save();c.textAlign='center';c.textBaseline='middle';
  L.forEach(function(b){
    const u=O.UPG_BY_ID[b.id],cost=O.cost(u,G.lv[b.id]),can=G.gold>=cost;
    const pul=can?1+.05*Math.sin(T*5):1;
    c.save();c.translate(b.x,b.y);c.scale(pul*b.k,pul*b.k);
    c.globalAlpha=can?1:.75;
    c.fillStyle='rgba(0,0,0,.35)';O.art.rr(c,-23,-21,46,52,9);c.fill();
    c.fillStyle=can?'#e2a93b':'#5f5c55';c.strokeStyle='#241706';c.lineWidth=2.2;O.art.rr(c,-23,-25,46,52,9);c.fill();c.stroke();
    c.fillStyle=can?'rgba(255,255,255,.22)':'rgba(255,255,255,.08)';O.art.rr(c,-20,-22,40,10,6);c.fill();
    c.strokeStyle=can?'#241706':'#2b2a27';c.lineWidth=4.4;c.lineCap='round';c.beginPath();c.moveTo(-8,-6);c.lineTo(8,-6);c.moveTo(0,-14);c.lineTo(0,2);c.stroke();
    const t=O.fmt(cost);c.font="800 13px 'Alegreya Sans', sans-serif";
    c.fillStyle='rgba(20,12,6,.8)';O.art.rr(c,-19,10,38,14,6);c.fill();
    c.fillStyle=can?'#ffe39a':'#b0a890';c.fillText(t,0,17.5);
    const en=O.lang==='en',lab=b.id==='smith'?(en?'Smith':'Çırak'):b.id==='carrier'?(en?'Carrier':'Taşıyıcı'):b.id==='counter'?(en?'Counter':'Tezgâh'):'';
    if(lab){c.font="800 10.5px 'Alegreya Sans', sans-serif";c.lineWidth=3;c.strokeStyle='rgba(20,12,6,.9)';c.strokeText(lab,0,-33);c.fillStyle='#ffe9bd';c.fillText(lab,0,-33);}
    c.restore();
  });
  c.restore();
}
function sceneHit(lx,ly){
  const L=sceneBtns();
  for(let i=0;i<L.length;i++){const b=L[i];if(Math.abs(lx-b.x)<28*b.k&&Math.abs(ly-b.y)<30*b.k)return b;}
  return null;
}
function render(){
  const phase=(.12+T/DAY_LEN)%1,sky=O.skyAt(phase);
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(bg,0,0);
  const sx=shake>0?(Math.random()-.5)*shake*2:0,sy=shake>0?(Math.random()-.5)*shake*2:0;
  ctx.setTransform(sc,0,0,sc,sx*sc,sy*sc);
  const c=ctx,n=forgeCount();
  c.save();c.translate(0,-60);O.drawDoor(c,sky);c.restore();
  forges.forEach(function(f,i){O.drawFurnace(c,f,i<n);});
  O.drawDecor(c,O.tier());
  const act=SLOT_ORDER.slice(0,slotCount());
  for(let p=0;p<6;p++){
    const x=SLOT_X[p];
    if(act.indexOf(p)>=0){
      c.fillStyle='rgba(0,0,0,.25)';O.art.rr(c,x-24,418,50,46,5);c.fill();
      c.fillStyle='#722c32';O.art.rr(c,x-25,414,50,46,5);c.fill();
      c.strokeStyle='rgba(226,176,72,.85)';c.lineWidth=1.4;O.art.rr(c,x-21,418,42,38,3);c.stroke();
      c.fillStyle='rgba(226,176,72,.45)';
      c.beginPath();c.moveTo(x,428);c.lineTo(x+6,437);c.lineTo(x,446);c.lineTo(x-6,437);c.closePath();c.fill();
      c.fillStyle='#caa04a';for(let k=0;k<6;k++){c.fillRect(x-24+k*9,460,1.4,4);}
    }else{
      c.strokeStyle='rgba(217,201,160,.25)';c.lineWidth=1.2;c.setLineDash([4,4]);O.art.rr(c,x-25,414,50,46,5);c.stroke();c.setLineDash([]);
    }
  }
  forges.forEach(function(f,i){if(i<n)O.drawAnvil(c,f);});
  const list=[];
  workers.forEach(w=>list.push({y:w.y,p:personOf(w,w.role)}));
  customers.forEach(cu=>list.push({y:cu.y,p:personOf(cu,null)}));
  list.sort((a,b)=>a.y-b.y);
  list.forEach(e=>O.drawPerson(c,e.p));
  drawLight(c,sky);
  drawGlows(c);
  for(const p of parts){
    const a=Math.max(0,p.life/p.max);
    if(p.ring){c.globalAlpha=a;c.strokeStyle=p.col;c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,p.size+(1-a)*18,0,7);c.stroke();continue;}
    c.globalAlpha=a*(p.al||1);
    if(p.add)c.globalCompositeOperation='lighter';
    c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.size+(p.gr||0)*(1-a),0,7);c.fill();
    c.globalCompositeOperation='source-over';
  }
  c.globalAlpha=1;
  customers.forEach(function(cu){
    if(cu.state==='waiting'&&!cu.moving){O.drawBubble(c,cu.x,cu.y-(cu.crown?62:54)-(cu.big?30:0),cu.weapon,cu.left/cu.patience,cu.left/cu.patience<.3,cu.crown);
      const ec=cu.ench&&O.ENCH_BY_ID[cu.ench];
      if(ec){c.save();c.fillStyle=ec.col;c.strokeStyle='#1b1f27';c.lineWidth=1.4;c.beginPath();c.arc(cu.x+14,cu.y-78-(cu.big?30:0),4.5,0,7);c.fill();c.stroke();c.restore();}
    }
    if(cu.story&&cu.state!=='leaving'){c.save();c.font="800 11px 'Alegreya Sans', sans-serif";c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='rgba(20,12,6,.9)';c.fillStyle='#ffd36b';const nm=O.tx(cu.story.name);c.strokeText(nm,cu.x,cu.y+14);c.fillText(nm,cu.x,cu.y+14);c.restore();}
    if(cu.state==='leaving'&&cu.angry){
      c.save();c.lineWidth=1.4;c.strokeStyle='#1b1f27';c.fillStyle='#d4503a';O.art.rr(c,cu.x-12,cu.y-84-(cu.big?30:0),24,24,7);c.fill();c.stroke();
      c.fillStyle='#fff';c.font="800 17px 'Alegreya Sans', sans-serif";c.textAlign='center';c.textBaseline='middle';c.fillText('!',cu.x,cu.y-71.5-(cu.big?30:0));c.restore();
    }
  });
  c.font=FONT_B;c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.lineJoin='round';
  for(const f of floats){c.globalAlpha=Math.min(1,f.life/.4);c.strokeStyle='rgba(20,12,6,.85)';c.strokeText(f.txt,f.x,f.y);c.fillStyle=f.col;c.fillText(f.txt,f.x,f.y);}
  c.globalAlpha=1;
  drawSceneBtns(c);
}

/* ---------- dokunma ---------- */
cv.addEventListener('pointerdown',function(e){
  O.unlockAudio();
  const r=cv.getBoundingClientRect(),lx=(e.clientX-r.left)/r.width*W,ly=(e.clientY-r.top)/r.height*H,n=forgeCount();
  const sb=sceneHit(lx,ly);
  if(sb){if(!O.buy(sb.id,1)){float(O.tx('Altın yetmiyor'),sb.x,sb.y-26,'#ff9a8a');O.emit('sfx','click');}else{sparks(sb.x,sb.y,10);coins(sb.x,sb.y,4);}return;}
  parts.push({ring:true,x:lx,y:ly,vx:0,vy:0,g:0,life:.4,max:.4,size:6,col:'#ffd36b'});
  O.emit('sfx','tap');
  for(let i=0;i<n;i++){
    const f=forges[i];
    if(Math.abs(lx-f.x)<56&&ly<220&&f.order&&f.order.state==='forging'){f.order.p+=.8;sparks(f.x,128,12);O.emit('sfx','clang');O.buzz(8);shake=Math.max(shake,2);}
  }
});

/* ---------- kayıt ---------- */
function save(){try{G.last=Date.now();if(!fair&&T>=5){const a=avgRates();G.rate=a.gold;G.sps=a.sps;}localStorage.setItem(KEY,JSON.stringify(G));}catch(e){}}
O.save=save;
function merge(o){
  const g=freshG();
  if(!o||typeof o!=='object')return g;
  ['gold','total','runTotal','served','lost','nobles','royals','rate','sps','last','seals','prestiges'].forEach(function(k){if(typeof o[k]==='number'&&isFinite(o[k]))g[k]=o[k];});
  if(typeof o.runTotal!=='number')g.runTotal=g.total;
  if(typeof o.chapter==='number'&&isFinite(o.chapter))g.chapter=Math.max(0,Math.min(100000,Math.floor(o.chapter)));
  if(o.quest&&typeof o.quest.day==='string'&&o.quest.t&&o.quest.r&&o.quest.p){
    const q=g.quest;q.day=o.quest.day;
    O.DAILY.forEach(function(d){
      q.t[d.id]=Math.max(1,Number(o.quest.t[d.id])||1);q.r[d.id]=Math.max(0,Number(o.quest.r[d.id])||0);
      q.p[d.id]=Math.max(0,Number(o.quest.p[d.id])||0);if(o.quest.c&&o.quest.c[d.id])q.c[d.id]=1;
    });
  }
  if(o.lv&&typeof o.lv==='object')UPG.forEach(function(u){const v=o.lv[u.id];if(typeof v==='number'&&v>=0)g.lv[u.id]=Math.min(u.max,Math.floor(v));});
  if(o.boost&&typeof o.boost==='object'){['speed','gold'].forEach(function(k){if(typeof o.boost[k]==='number'&&o.boost[k]>0)g.boost[k]=Math.min(900,o.boost[k]);});}
  if(o.ach&&typeof o.ach==='object')O.ACH.forEach(function(a){if(o.ach[a.id])g.ach[a.id]=1;});
  if(o.daily&&typeof o.daily.last==='string'){g.daily.last=o.daily.last;g.daily.streak=Math.max(0,Math.min(7,Math.floor(o.daily.streak)||0));}
  if(o.set&&typeof o.set==='object'){g.set.sound=o.set.sound!==false;g.set.haptic=o.set.haptic!==false;g.set.music=o.set.music!==false;g.set.notify=o.set.notify!==false;}
  if(o.fair&&typeof o.fair==='object'){
    const f=g.fair,n=v=>Math.max(0,Math.floor(Number(v))||0);
    if(typeof o.fair.day==='string')f.day=o.fair.day;
    f.used=n(o.fair.used);f.extra=n(o.fair.extra);f.fragsDay=n(o.fair.fragsDay);f.best=n(o.fair.best);f.played=n(o.fair.played);
    if(o.fair.medals){f.medals.b=n(o.fair.medals.b);f.medals.s=n(o.fair.medals.s);f.medals.g=n(o.fair.medals.g);}
  }
  if(o.col&&typeof o.col==='object'){
    const cnt=(src,dst,ids)=>{if(src&&typeof src==='object')ids.forEach(function(id){const v=Number(src[id]);if(v>0)dst[id]=Math.floor(v);});};
    cnt(o.col.w,g.col.w,O.WEAPONS.map(w=>w.id));cnt(o.col.r,g.col.r,O.RACES.map(r=>r.id));cnt(o.col.e,g.col.e,O.ENCHS.map(e=>e.id));
    if(o.col.claimed)Object.keys(O.COLL_REWARD).forEach(function(k){if(o.col.claimed[k])g.col.claimed[k]=1;});
  }
  if(o.story&&typeof o.story==='object')O.STORIES.forEach(function(st){if(o.story[st.id])g.story[st.id]=1;});
  if(typeof o.ench==='string'&&O.ENCH_BY_ID[o.ench])g.ench=o.ench;
  if(o.premium)g.premium=1;
  if(o.reloc&&typeof o.reloc==='object'){const n=v=>Math.max(0,Number(v)||0);if(typeof o.reloc.day==='string')g.reloc.day=o.reloc.day;g.reloc.used=Math.min(3,Math.floor(n(o.reloc.used)));g.reloc.disc=Math.min(.3,n(o.reloc.disc));}
  if(typeof o.tut==='number'&&isFinite(o.tut))g.tut=Math.max(0,Math.min(99,Math.floor(o.tut)));
  if(o.meta&&typeof o.meta==='object'){if(typeof o.meta.first==='number'&&isFinite(o.meta.first))g.meta.first=o.meta.first;g.meta.sessions=Math.max(0,Math.floor(Number(o.meta.sessions))||0);}
  if(o.themes&&typeof o.themes==='object'){O.THEMES.forEach(function(t){if(o.themes[t.id])g.themes[t.id]=1;});}
  if(typeof o.theme==='string'&&g.themes[o.theme])g.theme=o.theme;
  if(typeof o.frags==='number'&&isFinite(o.frags))g.frags=Math.max(0,Math.floor(o.frags)%O.FRAGS_PER_SEAL);
  if(typeof o.expDone==='number'&&isFinite(o.expDone))g.expDone=Math.max(0,Math.floor(o.expDone));
  if(o.exp&&typeof o.exp==='object'&&O.EXPED_BY_ID[o.exp.id]&&isFinite(o.exp.start)&&isFinite(o.exp.reward)){g.exp={id:o.exp.id,start:o.exp.start,reward:Math.max(0,o.exp.reward),skips:Math.min(2,Math.max(0,Math.floor(Number(o.exp.skips))||0))};}
  return g;
}
function loadSave(){try{const s=localStorage.getItem(KEY);if(s)return merge(JSON.parse(s));}catch(e){}return null;}
function resetWorld(){
  workers=[];customers=[];orders=[];parts=[];floats=[];earnLog=[];slotBusy=[false,false,false,false,false,false];
  forges.forEach(f=>{f.order=null;f.heat=0;});
  rateBase={g:G.rate||0,s:G.sps||0};
  T=0;O.time=0;spawnT=0;nextSpawn=1.2;royalT=0;nextRoyal=150;storyT=0;nextStory=70;storyHold=false;
  syncWorkers(false);
}
O.resetAll=function(){
  try{localStorage.removeItem(KEY);}catch(e){}
  const set=G.set;G=freshG();G.set=set;rollQuests();resetWorld();syncRace();O.rebuildBG();save();
};
function applyOffline(sec){
  /* Körük ve Altın Bereketi süreleri uygulama kapalıyken de akar */
  if(sec>0){G.boost.speed=Math.max(0,G.boost.speed-sec);G.boost.gold=Math.max(0,G.boost.gold-sec);}
  if(sec>30&&G.rate>0){
    const eff=.6*Math.min(sec,7200);
    const gain=Math.floor(G.rate*eff),sold=Math.floor((G.sps||0)*eff);
    if(gain>0){G.gold+=gain;G.total+=gain;G.runTotal+=gain;G.served+=sold;if(G.quest&&G.quest.p){G.quest.p.serve+=sold;G.quest.p.earn+=gain;}O.emit('offline',gain,sec,sold);return gain;}
  }
  return 0;
}
document.addEventListener('visibilitychange',function(){
  if(document.hidden){hiddenAt=Date.now();save();}
  else if(hiddenAt){applyOffline((Date.now()-hiddenAt)/1000);hiddenAt=0;}
});
window.addEventListener('pagehide',save);

/* ---------- başlangıç ---------- */
let lastFrame=0;
function frame(now){
  let dt=(now-lastFrame)/1000;lastFrame=now;
  if(!(dt>0))dt=0;if(dt>.1)dt=.1;
  update(dt);render();
  requestAnimationFrame(frame);
}
O.step=function(dt){update(dt);};
O.render=render;
O.emitParts={sparks:sparks,confetti:confetti,coins:coins,float:float};
O.start=function(d){
  let g=null;
  if(d&&typeof d.gold==='number')g=merge(d);
  if(!g)g=loadSave();
  if(g){G=g;}
  rollQuests();resetWorld();resize();
  if(g)applyOffline((Date.now()-G.last)/1000);
  try{if(window.claude&&window.claude.hot&&window.claude.hot.snapshot){window.claude.hot.snapshot(function(){return JSON.parse(JSON.stringify(G));});}}catch(e){}
  requestAnimationFrame(function(t){lastFrame=t;requestAnimationFrame(frame);});
};
})(window.Ors=window.Ors||{});
