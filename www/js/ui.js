/* Arayüz: sekmeler, mağaza, ödüller, mühür, ayarlar, pencereler, reklam bağlayıcısı */
(function(O){
'use strict';
const $=id=>document.getElementById(id);
const fmt=O.fmt;
const COIN='<svg class="coin" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#e2a93b" stroke="#9a6a14"/><circle cx="8" cy="8" r="4.2" fill="none" stroke="#9a6a14" stroke-width="1.2"/></svg>';
let mode=1, activeTab='workers', sealArmed=0;
const rows={}, panes={}, tabBtns={};
let stripCv=null, stripLv=-1;

/* ---------- küçük yardımcılar ---------- */
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=O.tx(text);return e;}
function setText(e,t){t=O.tx(t);if(e.textContent!==t)e.textContent=t;}
function setHTML(e,h){h=O.txHTML(h);if(e.dataset.h!==h){e.innerHTML=h;e.dataset.h=h;}}

/* ---------- toast ---------- */
let toastTimer=0;
const toastEl=$('toast');
function toast(msg){toastEl.textContent=O.tx(msg);toastEl.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(function(){toastEl.hidden=true;},4500);}
O.on('toast',toast);
O.on('decor',function(d){toast('Yeni dekor: '+d.name);});
O.on('ach',function(a){toast('Başarım: '+a.name+' (+'+fmt(a.reward)+' altın)');});
O.on('hint',function(t){setText($('hint'),t);});

/* ---------- pencere ---------- */
const modalEl=$('modal');
function closeModal(){modalEl.hidden=true;$('m-btns').innerHTML='';}
function modal(title,text,btns){
  setText($('m-title'),title);setText($('m-text'),text);
  const box=$('m-btns');box.innerHTML='';
  btns.forEach(function(b){
    const x=el('button','buy'+(b.alt?' alt':''),b.label);x.type='button';
    x.addEventListener('click',function(){O.emit('sfx','click');if(b.keep!==true)closeModal();if(b.onClick)b.onClick();});
    box.appendChild(x);
  });
  modalEl.hidden=false;
  const f=box.querySelector('button');if(f)f.focus();
}
O.ui={modal:modal,closeModal:closeModal,toast:toast};

/* ---------- reklam bağlayıcısı ----------
   Gerçek reklam eklemek için Ors.Ads.provider ayarlanır:
   Ors.Ads.provider=function(done){ ...ödüllü reklamı göster...; done(true veya false); }
   Ayar yoksa 3 saniyelik TEST reklamı gösterilir (yayın öncesi değiştirilmeli). */
O.Ads={
  provider:null,
  showRewarded:function(done){
    if(O.hasPremium&&O.hasPremium()){done(true);return;}
    if(typeof O.Ads.provider==='function'){
      try{O.Ads.provider(function(ok){done(!!ok);});}catch(e){done(false);}
      return;
    }
    let left=3;
    modal('Test reklamı','Gerçek uygulamada burada ödüllü reklam oynar. Kalan: '+left+' sn',[]);
    const t=setInterval(function(){
      left--;
      if(left<=0){clearInterval(t);closeModal();done(true);}
      else setText($('m-text'),'Gerçek uygulamada burada ödüllü reklam oynar. Kalan: '+left+' sn');
    },1000);
  }
};

/* ---------- satın alma bağlayıcısı (Usta Paketi) ----------
   Gerçek satın alma için Ors.Store.provider ayarlanır (Google Play Faturalandırma eklentisi):
   Ors.Store.provider={buy:function(done){...done(true|false)},restore:function(done){...done(true|false)},price:'₺99,99'}
   Ayar yoksa TEST satın alma penceresi çıkar (yayın öncesi bağlanmalı). Satın alma, sunucu ya da Play doğrulamasıyla kontrol edilmelidir. */
O.Store={
  provider:null,
  price:function(){return (O.Store.provider&&O.Store.provider.price)||'TEST';},
  buy:function(done){
    const p=O.Store.provider;
    if(p&&typeof p.buy==='function'){try{p.buy(function(ok){done(!!ok);});}catch(e){done(false);}return;}
    modal('Test satın alma','Gerçek uygulamada burada Google Play ödeme ekranı açılır. Test için satın alma onaylansın mı?',[
      {label:'Satın al (TEST)',onClick:function(){done(true);}},{label:'Vazgeç',alt:true,onClick:function(){done(false);}}]);
  },
  restore:function(done){
    const p=O.Store.provider;
    if(p&&typeof p.restore==='function'){try{p.restore(function(ok){done(!!ok);});}catch(e){done(false);}return;}
    done(false);
  }
};

/* ---------- üst çubuk ---------- */
const goldEl=$('gold'),rateEl=$('rate'),chipsEl=$('chips');
function updateTop(G){
  setText(goldEl,fmt(G.gold));
  setText(rateEl,'+'+O.dec(O.curRate().toFixed(1))+'/sn');
  let h='<span class="chip gold">Bölüm '+(G.chapter+1)+'</span><span class="chip">Yükseltme '+O.tier()+'/'+O.tierMax()+'</span>';
  if(G.seals>0)h+='<span class="chip seal">Mühür ×'+O.dec(O.sealMul().toFixed(1))+'</span>';
  O.activeEvents().forEach(function(e){h+='<span class="chip event">'+e.name+'</span>';});
  if(G.boost.speed>0)h+='<span class="chip fire">Körük ×2 '+O.fmtTime(G.boost.speed)+'</span>';
  if(G.boost.gold>0)h+='<span class="chip gold">Altın ×2 '+O.fmtTime(G.boost.gold)+'</span>';
  setHTML(chipsEl,h);
}

/* ---------- sekmeler ---------- */
const TICON={workers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/></svg>',shop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9l1.5-5h13L20 9v2H4zM5 11v9h14v-9M10 20v-5h4v5"/></svg>',grow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18l6-6 4 4 6-8M15 8h5v5"/></svg>',rewards:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 20h8"/></svg>',explore:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',seal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="5"/><path d="M9 14l-2 6 5-3 5 3-2-6"/></svg>'};
function buildTabs(){
  const bar=$('tabs');
  O.TABS.forEach(function(t){
    const b=el('button','tab');b.type='button';const ti=el('span','ti');ti.innerHTML=TICON[t.id]||'';const tl=el('span','tl',t.name);b.appendChild(ti);b.appendChild(tl);b.setAttribute('role','tab');b.id='tab-'+t.id;
    const dot=el('span','dot');dot.hidden=true;b.appendChild(dot);b.dot=dot;
    b.addEventListener('click',function(){selectTab(t.id);O.emit('sfx','click');});
    bar.appendChild(b);tabBtns[t.id]=b;
  });
}
function selectTab(id){
  activeTab=id;
  O.TABS.forEach(function(t){
    tabBtns[t.id].setAttribute('aria-selected',String(t.id===id));
    panes[t.id].hidden=t.id!==id;
  });
  $('modebar').hidden=(id==='rewards'||id==='seal'||id==='explore');
  $('content').scrollTop=0;
}
const modeBtns=document.querySelectorAll('#modebar button');
modeBtns.forEach(function(b){b.addEventListener('click',function(){
  mode=b.dataset.mode==='max'?'max':Number(b.dataset.mode);
  modeBtns.forEach(function(x){x.classList.toggle('on',x===b);});
  O.emit('sfx','click');
});});

/* ---------- mağaza satırları ---------- */
const UICON={smith:`<svg viewBox="0 0 24 24" fill="none" stroke="#3a2210" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M4 9h11c0 2.5-1.8 4-4.2 4v2h3v3H7v-3h3v-2C7 13 4.5 11.5 4 9z" fill="#8b95a1"/><path d="M15 9l5 1.6c-.6 1.3-2.2 2.2-4.4 2.4" fill="#6b7580"/></svg>`,carrier:`<svg viewBox="0 0 24 24" fill="none" stroke="#3a2210" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M6 9h12l1 11H5z" fill="#b5803f"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/><path d="M9 13h6"/></svg>`,training:`<svg viewBox="0 0 24 24" fill="none" stroke="#3a2210" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M2 9l10-5 10 5-10 5z" fill="#2f4f8a"/><path d="M6 11.5V16c3 2.4 9 2.4 12 0v-4.5"/><path d="M22 9v6"/></svg>`,forge:`<svg viewBox="0 0 24 24" fill="none" stroke="#3a2210" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z" fill="#e8741f"/><path d="M12 12c1 1.5 2 2 2 3.5a2 2 0 0 1-4 0c0-1 1-2 2-3.5z" fill="#ffd36e"/></svg>`,counter:`<svg viewBox="0 0 24 24" fill="none" stroke="#3a2210" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><rect x="3" y="9" width="18" height="4" rx="1" fill="#b5803f"/><path d="M5 13v7M19 13v7M3 20h18"/><path d="M8 9V6h8v3"/></svg>`,recipe:`<svg viewBox="0 0 24 24" fill="none" stroke="#3a2210" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M6 3h10l3 3v15H6z" fill="#f4e8c8"/><path d="M16 3v3h3M9 10h7M9 13h7M9 16h4"/></svg>`,hammer:`<svg viewBox="0 0 24 24" fill="none" stroke="#3a2210" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><rect x="3" y="4" width="11" height="6" rx="1.2" fill="#8b95a1"/><path d="M9 10l9 10" stroke-width="2.6" stroke="#7a4f22"/></svg>`,boots:`<svg viewBox="0 0 24 24" fill="none" stroke="#3a2210" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M7 3h6v8l6 3c1 .5 1.5 1.5 1.5 3v2H6V3z" fill="#7a4f22"/><path d="M6 18h14.5"/></svg>`,ads:`<svg viewBox="0 0 24 24" fill="none" stroke="#3a2210" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M3 10v4h4l8 4V6L7 10z" fill="#c8523a"/><path d="M18 9a4 4 0 0 1 0 6M20 6.5a7.5 7.5 0 0 1 0 11"/></svg>`,quality:`<svg viewBox="0 0 24 24" fill="none" stroke="#3a2210" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M7 4h10l4 5-9 11L3 9z" fill="#7fc4e8"/><path d="M3 9h18M9 4l-2 5 5 11 5-11-2-5"/></svg>`};
function buildRows(t){
  const pane=el('div','list');
  t.ids.forEach(function(id){
    const u=O.UPG_BY_ID[id];
    const row=el('div','row');
    row.classList.add('hi');const ico=el('div','uico');ico.innerHTML=UICON[id]||'';row.appendChild(ico);
    const left=el('div');
    const nm=el('div','name');const tt=el('span',null,u.name);const lv=el('span','lv');nm.appendChild(tt);nm.appendChild(lv);
    const sub=el('div','sub');
    const pips=el('div','pips');const pf=el('i');pips.appendChild(pf);
    left.appendChild(nm);left.appendChild(sub);left.appendChild(pips);
    if(id==='recipe'){stripCv=el('canvas','strip');left.appendChild(stripCv);}
    const b=el('button','buy');b.type='button';b.id='buy-'+id;
    b.addEventListener('click',function(){O.buy(id,mode);refresh();});
    row.appendChild(left);row.appendChild(b);pane.appendChild(row);
    rows[id]={u:u,lv:lv,sub:sub,btn:b,pf:pf,row:row};
  });
  if(t.id==='shop')buildEnch(pane);
  return pane;
}
function drawStrip(G){
  if(!stripCv)return;
  const dpr=Math.min(window.devicePixelRatio||1,2),sp=28,cols=11,rowsN=Math.ceil(O.WEAPONS.length/cols),cw=cols*sp,chh=rowsN*32;
  stripCv.width=cw*dpr;stripCv.height=chh*dpr;stripCv.style.width=cw+'px';stripCv.style.height=chh+'px';
  const c=stripCv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,cw,chh);
  O.WEAPONS.forEach(function(w,i){c.save();c.globalAlpha=O.weaponAvail(G,i)?1:.22;O.drawWeapon(c,w.id,sp/2+(i%cols)*sp,16+Math.floor(i/cols)*32,.66,.5);c.restore();});
}
function updateRows(G){
  const early=O.tier()<2&&G.served>=1;
  O.UPG.forEach(function(u){
    const r=rows[u.id];if(!r)return;
    const l=G.lv[u.id],maxed=l>=u.max;
    setText(r.lv,l+'/'+u.max);r.pf.style.width=(100*l/u.max)+'%';r.row.classList.toggle('maxed',maxed);
    setText(r.sub,u.text(l));
    if(maxed){r.btn.className='buy max';r.btn.disabled=true;setText(r.btn,'Tamam');delete r.btn.dataset.h;}
    else{
      const b=O.bulk(u,l,G.gold,mode),can=G.gold>=b.total;
      r.btn.className='buy'+(can&&early?' pulse':'');
      r.btn.disabled=!can;
      setHTML(r.btn,COIN+'<span>'+fmt(b.total)+'</span>'+(b.n>1?'<span class="x">×'+b.n+'</span>':''));
    }
  });
  const sk=G.lv.recipe+'/'+G.seals;
  if(stripLv!==sk){stripLv=sk;drawStrip(G);}
}

/* ---------- ödüller sekmesi ---------- */
const R={};
function buildRewards(){
  const pane=el('div');
  const daily=el('div','card');
  daily.appendChild(el('h3',null,'Günlük ödül'));
  R.dailyText=el('p');daily.appendChild(R.dailyText);
  R.dailyBtn=el('button','buy small','Al');R.dailyBtn.type='button';
  R.dailyBtn.addEventListener('click',function(){O.claimDaily();refresh();});
  daily.appendChild(R.dailyBtn);pane.appendChild(daily);

  R.evSec=el('div','sec','ETKİNLİKLER');pane.appendChild(R.evSec);
  R.ev=el('div','card');pane.appendChild(R.ev);
  pane.appendChild(el('div','sec','GÜNLÜK GÖREVLER'));
  R.q={};
  const ql=el('div','list');
  O.DAILY.forEach(function(d){
    const row=el('div','qrow');
    const t=el('div','t');const bar=el('div','p');const fill=el('i');bar.appendChild(fill);
    const btn=el('button','buy','Al');btn.type='button';
    btn.addEventListener('click',function(){O.claimQuest(d.id);refresh();});
    row.appendChild(t);row.appendChild(btn);row.appendChild(bar);ql.appendChild(row);
    R.q[d.id]={t:t,fill:fill,btn:btn};
  });
  pane.appendChild(ql);
  pane.appendChild(el('div','sec','DESTEKLER'));
  [['speed','Körük','Dövme hızı ×2 olur. Reklam başına 5 dk eklenir. Süre uygulama kapalıyken de akar.'],['gold','Altın Bereketi','Her satıştan 2 kat altın gelir. Reklam başına 5 dk eklenir. Süre uygulama kapalıyken de akar.']].forEach(function(b){
    const card=el('div','card');
    card.appendChild(el('h3',null,b[1]));
    const p=el('p',null,b[2]);card.appendChild(p);
    const btn=el('button','buy small','Reklam izle');btn.type='button';
    btn.addEventListener('click',function(){
      O.Ads.showRewarded(function(ok){if(ok){O.addBoost(b[0],300);O.emit('sfx','ach');toast(b[1]+' etkin.');refresh();}});
    });
    card.appendChild(btn);pane.appendChild(card);
    R['p_'+b[0]]=p;R['d_'+b[0]]=b[2];
  });

  pane.appendChild(el('div','sec','BAŞARIMLAR'));
  R.ach={};
  const list=el('div','list');
  O.ACH.forEach(function(a){
    const row=el('div','ach');
    row.appendChild(el('span','ck','✓'));
    const mid=el('div');mid.appendChild(el('div','t',a.name));mid.appendChild(el('div','d',a.desc));
    row.appendChild(mid);row.appendChild(el('span','r','+'+fmt(a.reward)));
    list.appendChild(row);R.ach[a.id]=row;
  });
  pane.appendChild(list);
  return pane;
}
function updateRewards(G){
  const d=O.dailyInfo();
  setText(R.dailyText,d.claimable?('Gün '+d.streak+'/7 · +'+fmt(d.reward)+' altın'+(d.streak===7?' ve iki destek':'')):'Bugünkü ödülü aldın. Yarın tekrar gel.');
  R.dailyBtn.disabled=!d.claimable;
  ['speed','gold'].forEach(function(k){
    const s=G.boost[k];
    setText(R['p_'+k],s>0?('Etkin: '+O.fmtTime(s)+' kaldı. '+R['d_'+k]):R['d_'+k]);
  });
  const evs=O.activeEvents();
  setHTML(R.ev,evs.length?evs.map(e=>'<h3>'+e.name+'</h3><p>'+e.desc+'</p>').join(''):'<h3>Etkinlik yok</h3><p>Hafta sonları, ayın ilk haftası ve 15–16\'sında özel etkinlikler olur.</p>');
  O.ACH.forEach(function(a){R.ach[a.id].classList.toggle('done',!!G.ach[a.id]);});
  O.questList().forEach(function(q){
    const r=R.q[q.id];
    setText(r.t,q.text+' ('+fmt(q.cur)+'/'+fmt(q.target)+')');
    r.fill.style.width=Math.round(q.cur/q.target*100)+'%';
    r.btn.disabled=!q.done||q.claimed;
    setText(r.btn,q.claimed?'Alındı':(q.done?'Al +'+fmt(q.reward):'+'+fmt(q.reward)));
  });
}

/* ---------- mühür sekmesi ---------- */
const S={};
function buildSeal(){
  const pane=el('div');
  const card=el('div','card full');
  card.appendChild(el('h3',null,'Usta Mührü'));
  card.appendChild(el('p',null,'Dükkanı sıfırlar, karşılığında kalıcı mühür verir. Gelir çarpanı = 1 + 0,5 × √mühür. Her mühür yeni turu 25 altınla da başlatır. Bölümler, başarımlar ve istatistikler korunur. Mühür sayısı arttıkça efsanevi silahlar açılır.'));
  pane.appendChild(card);
  const kv=el('dl','kv');
  [['seals','Mührün'],['mul','Gelir çarpanı'],['run','Bu turdaki kazanç'],['gain','Şimdi alınacak mühür']].forEach(function(k){
    kv.appendChild(el('dt',null,k[1]));const dd=el('dd',null,'0');kv.appendChild(dd);S[k[0]]=dd;
  });
  pane.appendChild(kv);
  const wrap=el('div');wrap.style.margin='0 14px 14px';
  S.btn=el('button','buy','Mühürle ve yeniden başla');S.btn.type='button';S.btn.style.width='100%';
  S.btn.addEventListener('click',function(){
    if(O.sealGain()<1)return;
    if(!sealArmed){sealArmed=Date.now();O.emit('sfx','click');updateSeal(O.getG());setTimeout(function(){sealArmed=0;updateSeal(O.getG());},4000);return;}
    sealArmed=0;
    if(O.doPrestige()){selectTab('workers');refresh();}
  });
  wrap.appendChild(S.btn);pane.appendChild(wrap);
  pane.appendChild(el('div','sec','İSTATİSTİK'));
  const st=el('dl','kv');
  [['served','Satılan silah'],['lost','Kaçan müşteri'],['total','Toplam kazanç'],['nobles','Soylu müşteri'],['pres','Alınan mühür sayısı']].forEach(function(k){
    st.appendChild(el('dt',null,k[1]));const dd=el('dd',null,'0');st.appendChild(dd);S[k[0]]=dd;
  });
  pane.appendChild(st);
  pane.appendChild(el('div','sec','EFSANEVİ TARİFLER'));
  const leg=el('div','decor');S.leg=[];
  O.WEAPONS.forEach(function(w,i){if(!w.legend)return;const s=el('span',null,w.name+' · '+w.legend+' mühür');leg.appendChild(s);S.leg.push([w,s]);});
  pane.appendChild(leg);
  S.decorTitle=el('div','sec','DÜKKAN DEKORLARI');pane.appendChild(S.decorTitle);
  const dec=el('div','decor');S.decor=[];
  O.DECOR.forEach(function(d){const s=el('span',null,d.name+' · Seviye '+d.at);dec.appendChild(s);S.decor.push([d,s]);});
  pane.appendChild(dec);
  return pane;
}
function updateSeal(G){
  const gain=O.sealGain();
  setText(S.seals,String(G.seals));
  setText(S.mul,'×'+O.dec(O.sealMul().toFixed(1)));
  setText(S.run,fmt(G.runTotal));
  setText(S.gain,'+'+gain);
  setText(S.served,fmt(G.served));setText(S.lost,fmt(G.lost));setText(S.total,fmt(G.total));setText(S.nobles,fmt(G.nobles));setText(S.pres,String(G.prestiges));
  S.btn.disabled=gain<1;
  setText(S.btn,gain<1?'En az 2.000 altın kazan':(sealArmed?'Emin misin? Tekrar dokun':'Mühürle ve yeniden başla (+'+gain+')'));
  S.decor.forEach(function(p){p[1].classList.toggle('on',O.tier()>=p[0].at);});
  S.leg.forEach(function(p){p[1].classList.toggle('on',G.seals>=p[0].legend);});
}

/* ---------- büyü tezgâhı (Dükkan sekmesi) ---------- */
const EN={};
function buildEnch(pane){
  const card=el('div','card full');
  card.appendChild(el('h3',null,'Büyülü Siparişler'));
  card.appendChild(el('p',null,'Bazı müşteriler ırklarının sevdiği bir büyüyü ister (baloncukta renkli nokta). Büyülü silah %15 geç dövülür ve satış değerinin %20\'si malzeme bedeli keser, ama müşteri çok daha fazla öder.'));
  EN.rows={};
  O.ENCHS.forEach(function(e){const p=el('p');card.appendChild(p);EN.rows[e.id]=p;});
  pane.appendChild(card);
}
function updateEnch(G){
  if(!EN.rows)return;
  const open=O.enchOpen(),rc=O.raceOf(G.chapter);
  const races=rc.mixed?O.RACES:[rc];
  O.ENCHS.forEach(function(e){
    const p=EN.rows[e.id];
    if(!open){setText(p,e.icon+' '+e.name+' · Bölüm '+(O.ENCH_FROM+1)+'\'te açılır');return;}
    if(!O.enchUnlocked(e)){setText(p,e.icon+' '+e.name+' · formül henüz bulunamadı');return;}
    const m=races.reduce(function(a,r){return a+(e.aff[r.id]||1);},0)/races.length-O.ENCH_COST;
    setText(p,e.icon+' '+e.name+' · '+(rc.mixed?'Ortalama net çarpan: ':'Net çarpan · '+rc.name+': ')+'×'+O.dec(m.toFixed(2)));
  });
}

/* ---------- koleksiyon defteri ---------- */
const collEl=el('div','coll');collEl.hidden=true;document.body.appendChild(collEl);
function openColl(){
  const info=O.collInfo();collEl.innerHTML='';
  const box=el('div','coll-box');
  box.appendChild(el('h2',null,'Koleksiyon Defteri'));
  box.appendChild(el('p','coll-sum','Tamamlanan: '+info.got+'/'+info.total));
  info.secs.forEach(function(sec){
    const card=el('div','card full');
    card.appendChild(el('h3',null,sec.name+' · '+sec.got+'/'+sec.total));
    const list=el('div','coll-items');
    sec.items.forEach(function(it){list.appendChild(el('span','coll-it'+(it.got?' got':''),it.got?it.name:'???'));});
    card.appendChild(list);
    const b=el('button','buy small',sec.claimed?'Alındı':'Ödül: +'+sec.reward+' Mühür Parçası');b.type='button';
    b.disabled=!sec.full||sec.claimed;
    b.addEventListener('click',function(){
      const r=O.collClaim(sec.id);
      if(r){toast('+'+r.frags+' Mühür Parçası'+(r.seals?' · +'+r.seals+' Usta Mührü':''));openColl();refresh();}
    });
    card.appendChild(b);box.appendChild(card);
  });
  const close=el('button','buy alt','Kapat');close.type='button';
  close.addEventListener('click',function(){O.emit('sfx','click');collEl.hidden=true;});
  box.appendChild(close);collEl.appendChild(box);collEl.hidden=false;O.emit('sfx','click');
}
collEl.addEventListener('click',function(e){if(e.target===collEl)collEl.hidden=true;});
O.on('story',function(d){
  const s=d.s;
  const ue=s.unlockEnch&&O.ENCH_BY_ID[s.unlockEnch];
  modal(s.name,'"'+s.thanks+'"  Yeni süs: '+s.decor.icon+' '+s.decor.name+' (alt rafa konuldu) · +'+s.frag+' Mühür Parçası'+(d.seals?' · +'+d.seals+' Usta Mührü':'')+(ue?' · Yeni büyü: '+ue.icon+' '+ue.name:''),[{label:'Güzel!'}]);
});

/* ---------- keşif sekmesi: seferler ve temalar ---------- */
const X={};
function buildExplore(){
  const pane=el('div');
  pane.appendChild(el('div','sec','FUAR'));
  const fc=el('div','card full');
  X.fairTitle=el('h3');fc.appendChild(X.fairTitle);
  X.fairText=el('p');fc.appendChild(X.fairText);
  X.fairStat=el('p');fc.appendChild(X.fairStat);
  X.fairBtn=el('button','buy small','Fuara gir');X.fairBtn.type='button';
  X.fairBtn.addEventListener('click',function(){if(O.fairStart()){selectTab('workers');O.emit('sfx','click');}refresh();});
  const fb=el('div');fb.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:6px';fb.appendChild(X.fairBtn);
  X.fairAd=el('button','buy small alt','Reklam izle: +1 hak');X.fairAd.type='button';
  X.fairAd.addEventListener('click',function(){O.Ads.showRewarded(function(ok){if(ok){O.fairAddEntry();O.emit('sfx','ach');refresh();}});});
  fb.appendChild(X.fairAd);fc.appendChild(fb);
  pane.appendChild(fc);
  pane.appendChild(el('div','sec','SEFERLER'));
  const info=el('div','card');
  info.appendChild(el('p',null,'Çıraklarını sefere gönder. Sefer sürerken (uygulama kapalıyken de) ilerler. Dönünce altın ve Mühür Parçası kazanırsın. 10 parça 1 Usta Mührü eder. Aynı anda tek sefer yapılabilir.'));
  X.frags=el('p');info.appendChild(X.frags);pane.appendChild(info);
  X.ex={};
  O.EXPEDS.forEach(function(e){
    const row=el('div','row');const left=el('div');
    const nm=el('div','name');nm.appendChild(el('span',null,e.name));left.appendChild(nm);
    const sub=el('div','sub');left.appendChild(sub);
    const skip=el('button','buy small alt','Reklam izle: süre yarıya insin');skip.type='button';skip.hidden=true;skip.style.marginTop='6px';
    skip.addEventListener('click',function(){O.Ads.showRewarded(function(ok){if(ok){O.expedSkip();O.emit('sfx','ach');refresh();}});});
    left.appendChild(skip);
    const b=el('button','buy');b.type='button';
    b.addEventListener('click',function(){
      const i=O.expedInfo();
      if(i.act&&i.act.e.id===e.id){O.expedClaim();}else{O.expedStart(e.id);}
      refresh();
    });
    row.appendChild(left);row.appendChild(b);pane.appendChild(row);
    X.ex[e.id]={sub:sub,btn:b,skip:skip};
  });
  pane.appendChild(el('div','sec','KOLEKSİYON'));
  const cc=el('div','card full');
  X.collText=el('p');cc.appendChild(X.collText);
  const cb=el('button','buy small','Defteri aç');cb.type='button';cb.addEventListener('click',openColl);
  cc.appendChild(cb);pane.appendChild(cc);
  pane.appendChild(el('div','sec','USTA PAKETİ'));
  const pc=el('div','card full');
  pc.appendChild(el('h3',null,'Reklamsız + 2× hız'));
  pc.appendChild(el('p',null,'Tek seferlik satın alma. Ödüllü reklam ödülleri reklam izlemeden hemen verilir ve dövme hızı kalıcı olarak 2 kat artar.'));
  const pr=el('div');pr.style.cssText='display:flex;gap:8px;flex-wrap:wrap';
  X.premBtn=el('button','buy small','Satın al');X.premBtn.type='button';
  X.premBtn.addEventListener('click',function(){O.Store.buy(function(ok){if(ok){O.setPremium();O.emit('sfx','ach');toast('Usta Paketi etkin. Teşekkürler!');}refresh();});});
  X.premRest=el('button','buy small alt','Satın alımı geri yükle');X.premRest.type='button';
  X.premRest.addEventListener('click',function(){O.Store.restore(function(ok){if(ok){O.setPremium();toast('Usta Paketi geri yüklendi.');}else toast('Geri yüklenecek satın alma bulunamadı.');refresh();});});
  pr.appendChild(X.premBtn);pr.appendChild(X.premRest);pc.appendChild(pr);pane.appendChild(pc);
  pane.appendChild(el('div','sec','DÜKKAN TEMALARI'));
  X.th={};
  const list=el('div','list');
  O.THEMES.forEach(function(t){
    const row=el('div','row');const left=el('div');
    const nm=el('div','name');const sw=el('i','swatch');sw.style.background=t.swatch;nm.appendChild(sw);nm.appendChild(el('span',null,t.name));left.appendChild(nm);
    const b=el('button','buy');b.type='button';
    b.addEventListener('click',function(){
      const G=O.getG();
      if(G.themes[t.id])O.themeUse(t.id);else O.themeBuy(t.id);
      refresh();
    });
    row.appendChild(left);row.appendChild(b);list.appendChild(row);
    X.th[t.id]={btn:b};
  });
  pane.appendChild(list);
  return pane;
}
function durText(sec){const h=Math.floor(sec/3600),m=Math.round(sec%3600/60);return h?(h+' sa'+(m?' '+m+' dk':'')):(m+' dk');}
function updateExplore(G){
  const fi=O.fairInfo(),th=fi.theme;
  const favs=th.fav.map(function(id){return O.WEAPONS.filter(w=>w.id===id)[0].name;}).join(', ');
  setText(X.fairTitle,'Bugünün fuarı: '+th.name);
  setText(X.fairText,'3 dakika. Favori silahlar: '+favs+'. Hatasız satışlar kombo yapar. Fuar sürerken ana dükkanın geliri durur.');
  setHTML(X.fairStat,'<span class="medal b"></span>'+fi.medals.b+' <span class="medal s"></span>'+fi.medals.s+' <span class="medal g"></span>'+fi.medals.g+' · En iyi puan: '+fmt(fi.best)+' · Kalan hak: '+fi.left);
  X.fairBtn.disabled=!fi.open||fi.active||fi.left<1;
  setText(X.fairBtn,fi.open?(fi.active?'Fuar sürüyor':'Fuara gir'):'Bölüm 3\'te açılır');
  X.fairAd.disabled=fi.active;
  const ci=O.collInfo();
  setText(X.collText,'Silah, ırk, mekân, hikâyeli müşteri ve büyü koleksiyonunu tamamla, Mühür Parçası kazan. Tamamlanan: '+ci.got+'/'+ci.total);
  if(O.hasPremium()){X.premBtn.disabled=true;X.premBtn.className='buy small max';setText(X.premBtn,'Satın alındı ✓');X.premRest.hidden=true;}
  else{X.premBtn.disabled=false;setText(X.premBtn,'Satın al · '+O.Store.price());X.premRest.hidden=false;}
  const i=O.expedInfo();
  setText(X.frags,'Mühür Parçası: '+G.frags+'/'+O.FRAGS_PER_SEAL+' · Tamamlanan sefer: '+G.expDone);
  i.list.forEach(function(x){
    const r=X.ex[x.e.id],act=i.act&&i.act.e.id===x.e.id;
    r.skip.hidden=!(act&&!i.act.done&&i.act.skipsLeft>0);
    if(!r.skip.hidden)setText(r.skip,'Reklam izle: süre yarıya insin ('+i.act.skipsLeft+' hak)');
    if(act){
      setText(r.sub,i.act.done?'Sefer döndü! Ödülünü al.':'Dönüşe '+O.fmtTime(i.act.left)+' var · ödül +'+fmt(i.act.reward)+' altın');
      r.btn.className='buy'+(i.act.done?' pulse':'');r.btn.disabled=!i.act.done;setText(r.btn,i.act.done?'Teslim al':'Yolda');
    }else if(!x.open){
      setText(r.sub,x.e.desc+' · Bölüm '+(x.e.from+1)+'\'de açılır');
      r.btn.className='buy';r.btn.disabled=true;setText(r.btn,'Kilitli');
    }else{
      setText(r.sub,x.e.desc+' · '+durText(x.e.dur)+' · ödül ~'+fmt(x.reward)+' altın + '+x.e.frag+' parça');
      r.btn.className='buy';r.btn.disabled=!!i.act||G.gold<x.cost;setHTML(r.btn,COIN+fmt(x.cost));
    }
  });
  O.THEMES.forEach(function(t){
    const b=X.th[t.id].btn;
    if(G.theme===t.id){b.className='buy max';b.disabled=true;setText(b,'Seçili');}
    else if(G.themes[t.id]){b.className='buy alt';b.disabled=false;setText(b,'Kullan');}
    else{b.className='buy';b.disabled=G.gold<t.cost;setHTML(b,COIN+fmt(t.cost));}
  });
}

/* ---------- ayarlar ---------- */
const setBtn=$('btn-set'),setBox=$('settings');
setBtn.addEventListener('click',function(e){e.stopPropagation();const open=setBox.hidden;setBox.hidden=!open;setBtn.setAttribute('aria-expanded',String(open));});
document.addEventListener('click',function(e){if(!setBox.hidden&&!setBox.contains(e.target)&&e.target!==setBtn){setBox.hidden=true;setBtn.setAttribute('aria-expanded','false');}});
$('set-music').addEventListener('change',function(e){O.setMusic(e.target.checked);O.save();});
$('set-sound').addEventListener('change',function(e){O.getG().set.sound=e.target.checked;O.save();if(e.target.checked){O.unlockAudio();O.sfx('click');}});
$('set-haptic').addEventListener('change',function(e){O.getG().set.haptic=e.target.checked;O.save();O.buzz(15);});
const resetBtn=$('reset'),askEl=$('reset-ask');
resetBtn.addEventListener('click',function(){askEl.hidden=false;resetBtn.hidden=true;});
$('reset-no').addEventListener('click',function(){askEl.hidden=true;resetBtn.hidden=false;});
$('reset-yes').addEventListener('click',function(){
  O.resetAll();askEl.hidden=true;resetBtn.hidden=false;setBox.hidden=true;selectTab('workers');refresh();
});
$('set-notify').addEventListener('change',function(e){O.getG().set.notify=e.target.checked;O.save();if(O.Notify)O.Notify.onSetting(e.target.checked);});
function syncSettings(){const G=O.getG();$('set-skin').value=skin();$('set-lang').value=O.lang;$('set-notify').checked=G.set.notify;$('set-music').checked=G.set.music;$('set-sound').checked=G.set.sound;$('set-haptic').checked=G.set.haptic;}
/* tarayıcılar sesi ancak bir dokunuştan sonra açar: ilk dokunuşta müzik başlar */
document.addEventListener('pointerdown',function(){O.unlockAudio();},true);

/* ---------- çevrimdışı kazanç ---------- */
O.on('offline',function(gain,sec,sold){
  const sl=sold>0?' altın kazandı ve '+fmt(sold)+' silah sattı. Reklam izlersen iki katını alırsın.':' altın kazandı. Reklam izlersen iki katını alırsın.';
  modal('Hoş geldin usta!','Sen yokken ('+durText(Math.min(sec,7200))+') dükkan '+fmt(gain)+sl,[
    {label:'Reklam izle: iki katını al (+'+fmt(gain)+')',onClick:function(){O.Ads.showRewarded(function(ok){if(ok){O.giveGold(gain);toast('+'+fmt(gain)+' altın eklendi.');refresh();}});}},
    {label:'Al',alt:true}
  ]);
});

/* ---------- bölüm hedef çubuğu ve bölüm listesi ---------- */
const goalEl=$('goal'),chEl=$('chapters');
function rewardText(rw){
  let s='+'+fmt(rw.gold)+' altın';
  if(rw.seals)s+=' · +'+rw.seals+' Usta Mührü';
  if(rw.boost){
    if(rw.boost.speed)s+=' · Körük '+O.fmtTime(rw.boost.speed);
    if(rw.boost.gold)s+=' · Altın Bereketi '+O.fmtTime(rw.boost.gold);
  }
  return s;
}
function updateGoal(G){
  const st=O.chapterNow();
  setText($('g-chap'),'Bölüm '+(st.idx+1)+' · '+st.ch.name);
  if(st.all){
    const r=O.relocInfo();
    setText($('g-count'),'Taşın!');
    setText($('g-text'),'Taşınma bedeli: '+fmt(r.pay)+'  ·  '+fmt(Math.min(G.gold,r.pay)));
    $('g-fill').style.width=Math.round(Math.min(1,G.gold/r.pay)*100)+'%';
    goalEl.classList.toggle('ready',r.can);
    return;
  }
  goalEl.classList.remove('ready');
  const g=st.goals.filter(x=>!x.done)[0]||st.goals[st.goals.length-1];
  setText($('g-count'),st.done+'/'+st.goals.length+' hedef');
  setText($('g-text'),g.t+(g.n>1?'  ·  '+fmt(g.cur)+' / '+fmt(g.n):''));
  $('g-fill').style.width=Math.round(g.frac*100)+'%';
}
function chapterHTML(G,i){
  const ch=O.chapterAt(i);
  const state=i<G.chapter?'done':(i===G.chapter?'cur':'lock');
  let h='<div class="ch '+state+'"><h4>'+(i+1)+'. '+ch.name+'<span>'+(state==='done'?'Tamamlandı':state==='cur'?'Şimdiki bölüm':'Kilitli')+'</span></h4>';
  if(state!=='lock')h+='<p>'+ch.story+'</p>';
  h+='<ul>';
  ch.goals.forEach(function(g){
    const s=O.goalState(G,g),ok=state==='done'||(state==='cur'&&s.done);
    h+='<li class="'+(ok?'ok':'')+'"><span>'+(ok?'✓ ':'')+g.t+'</span><span>'+(state==='lock'?'':fmt(state==='done'?g.n:s.cur)+' / '+fmt(g.n))+'</span></li>';
  });
  h+='</ul><div class="rw">Taşınma bedeli: '+fmt(ch.fee)+' · Ödül: '+rewardText(ch.reward)+'</div>';
  if(state==='cur'&&O.chapterNow().all)h+='<button class="buy" data-act="reloc">Taşın</button>';
  return h+'</div>';
}
/* Tamamlanan mekânlar tek satır, şimdiki mekân ayrıntılı, sonraki iki mekân kilitli satır */
function tease(i,full){
  const v=O.venueOf(i),c0=O.cycleOf(i)===0;
  const ws=c0?O.WEAPONS.filter(w=>w.ven===i%O.VENUES.length):[];
  const st=c0?O.STORIES.filter(s=>s.from===i):[];
  let h='<div class="tz">Müşteriler: '+(full?O.raceOf(i).name:'???');
  if(ws.length)h+=' · Yeni silah: <canvas class="sil" data-w="'+ws.map(w=>w.id).join(',')+'"></canvas>';
  if(st.length)h+=' · Hikâyeli müşteri: ???';
  return h+'</div>';
}
function drawSil(){
  document.querySelectorAll('#ch-list canvas.sil').forEach(function(cv){
    const ids=cv.getAttribute('data-w').split(','),sp=28,w=ids.length*sp,h=32,dpr=Math.min(window.devicePixelRatio||1,2);
    cv.width=w*dpr;cv.height=h*dpr;cv.style.width=w+'px';cv.style.height=h+'px';
    const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
    c.filter='brightness(0) opacity(.55)';
    ids.forEach(function(id,k){O.drawWeapon(c,id,sp/2+k*sp,16,.66,.5);});
    c.filter='none';
  });
}
/* Tamamlanan mekânlar tek satır, şimdiki mekân ayrıntılı, sonraki iki mekân kilitli ve gizemli (siluet) */
function renderChapters(G){
  let h='';
  const first=Math.max(0,G.chapter-3);
  if(first>0)h+='<div class="realm done"><b>Önceki mekânlar</b><span>✓ '+first+'</span></div>';
  for(let i=first;i<G.chapter;i++)h+='<div class="realm done"><b>'+(i+1)+'. '+O.eraName(i)+'</b><span>✓</span></div>';
  h+=chapterHTML(G,G.chapter);
  for(let i=G.chapter+1;i<=G.chapter+2;i++)h+='<div class="realm lock"><b>'+(i+1)+'. '+O.eraName(i)+'</b><span>Kilitli</span>'+tease(i,i===G.chapter+1)+'</div>';
  setHTML($('ch-list'),h);
  drawSil();
}
function relocModal(){
  const r=O.relocInfo(),ch=O.chapterAt(G0().chapter),next=O.chapterAt(G0().chapter+1);
  let text='Hedefler tamam! "'+next.name+'" mekânına taşınmak için taşınma bedelini öde. '+next.story;
  if(r.disc>0)text+=' İndirim: %'+Math.round(r.disc*100)+'.';
  const btns=[{label:'Öde ve taşın ('+fmt(r.pay)+')',keep:!r.can,onClick:function(){if(!r.can){toast('Yeterli altının yok.');return;}O.relocate();refresh();}}];
  if(r.adsLeft>0)btns.push({label:'Reklam izle: bedelin %'+Math.round(r.cut*100)+'\'u düşsün ('+r.adsLeft+' hak)',alt:true,keep:true,onClick:function(){
    O.Ads.showRewarded(function(ok){if(ok){O.relocAd();O.emit('sfx','ach');relocModal();refresh();}});
  }});
  btns.push({label:'Kapat',alt:true});
  modal('Taşınma zamanı',text,btns);
}
function G0(){return O.getG();}
function openChapters(){
  O.emit('sfx','click');
  chOpened=true;chEl.hidden=false;renderChapters(O.getG());
  const cur=$('ch-list').querySelector('.cur');if(cur)cur.scrollIntoView({block:'nearest'});
  $('ch-close').focus();
}
goalEl.addEventListener('click',function(){if(O.chapterNow().all)relocModal();else openChapters();});
$('ch-list').addEventListener('click',function(e){if(e.target&&e.target.getAttribute('data-act')==='reloc'){chEl.hidden=true;relocModal();}});
O.on('ready',function(){toast('Hedefler tamam! Taşınma bedelini öde.');});
$('ch-close').addEventListener('click',function(){chEl.hidden=true;O.emit('sfx','click');});
chEl.addEventListener('click',function(e){if(e.target===chEl)chEl.hidden=true;});
/* Yeni mekâna geçişte tam ekran başlık kartı: bölüm no, çağ adı, mekân adı */
const eraEl=el('div','era');eraEl.hidden=true;document.body.appendChild(eraEl);
function showEra(idx){
  const ch=O.chapterAt(idx),next=O.chapterAt(idx+1),rc=O.raceOf(idx+1);
  eraEl.innerHTML='';
  const box=el('div','era-box');
  box.appendChild(el('div','era-no','Bölüm '+(idx+2)));
  box.appendChild(el('h2','era-age',O.eraOf(idx+1)));
  box.appendChild(el('div','era-name',O.venueName(idx+1)));
  box.appendChild(el('p','era-txt','Müşteriler: '+rc.name+'. '+rc.intro));
  const nw=O.WEAPONS.filter(w=>w.ven===idx+1);
  if(nw.length)box.appendChild(el('div','era-rw','Yeni silah: '+nw.map(w=>w.name).join(', ')));
  box.appendChild(el('div','era-rw','Ödül: '+rewardText(ch.reward)));
  const row=el('div','m-btns');
  const go=el('button','buy','Devam');go.type='button';
  go.addEventListener('click',function(){
    O.emit('sfx','click');eraEl.classList.remove('show');
    setTimeout(function(){eraEl.hidden=true;},400);
    O.blockChapters=false;goalEl.classList.remove('flash');void goalEl.offsetWidth;goalEl.classList.add('flash');refresh();
  });
  const sh=el('button','buy alt','Paylaş');sh.type='button';
  sh.addEventListener('click',function(){O.emit('sfx','click');if(O.shareChapter)O.shareChapter(idx);});
  row.appendChild(go);row.appendChild(sh);box.appendChild(row);
  eraEl.appendChild(box);
  eraEl.hidden=false;void eraEl.offsetWidth;eraEl.classList.add('show');
  go.focus();
}
O.on('chapter',function(idx){
  O.blockChapters=true;
  chEl.hidden=true;closeModal();
  showEra(idx);
});

/* ---------- ilk dakika rehberi ---------- */
let chOpened=false;
const TUT=[
  {t:'Müşteri geldi! Ocakta silah dövülürken örse dokunarak hızlandır.',done:G=>G.served>=1},
  {t:'Ekip sekmesinden bir Demirci Çırağı tut. Ocağı o çalıştırır.',done:G=>G.lv.smith>=1,tab:'workers',hi:'buy-smith'},
  {t:'Ekip sekmesinden bir Taşıyıcı tut. Biten silahları müşteriye o götürür.',done:G=>G.lv.carrier>=1,tab:'workers',hi:'buy-carrier'},
  {t:'Sahnenin altındaki hedef çubuğuna dokun: bölümler ve ödüller orada.',done:()=>chOpened,hi:'goal'},
  {t:'Günlük ödül ve görevler "Görevler" sekmesinde seni bekliyor.',done:()=>activeTab==='rewards',hi:'tab-rewards'}
];
const coachEl=$('coach');
let lastHi=null;
function updateCoach(G){
  while(G.tut<TUT.length&&TUT[G.tut].done(G)){
    O.emit('track','tutorial_step',{step:G.tut+1});
    O.setTut(G.tut+1);
    if(G.tut>=TUT.length)O.emit('track','tutorial_done',{});
  }
  const step=G.tut<TUT.length?TUT[G.tut]:null;
  coachEl.hidden=!step;$('hint').style.display=step?'none':'';
  if(lastHi){lastHi.classList.remove('hl');lastHi=null;}
  if(!step)return;
  setText($('coach-text'),step.t);
  const h=step.hi&&$(step.hi);
  if(h&&!h.disabled){h.classList.add('hl');lastHi=h;}
}
$('coach-skip').addEventListener('click',function(){O.emit('track','tutorial_skip',{step:O.getG().tut});O.setTut(99);O.emit('sfx','click');updateCoach(O.getG());});

/* ---------- fuar göstergesi ve sonuç ---------- */
const fh=$('fairhud');
function updateFairHUD(){
  const fi=O.fairInfo();
  fh.hidden=!fi.active;
  if(!fi.active)return;
  setText($('fh-t'),O.fmtTime(fi.t));
  setText($('fh-s'),'Puan '+fmt(fi.score));
  setText($('fh-c'),fi.combo>1?'Kombo ×'+O.dec(Math.min(3,1+(fi.combo-1)*.2).toFixed(1)):'');
}
$('fh-end').addEventListener('click',function(){O.emit('sfx','click');O.fairEnd();});
O.on('fair',function(r){
  if(r.type!=='end')return;
  const names={g:'Altın',s:'Gümüş',b:'Bronz','':'Madalya yok'};
  let t='Puan: '+fmt(r.score)+' · Madalya: '+names[r.medal]+'. Satılan: '+r.sold+', kaçan: '+r.lost+', en iyi kombo: '+r.bestCombo+'. Ödül: +'+fmt(r.gold)+' altın';
  if(r.frags)t+=', +'+r.frags+' Mühür Parçası';
  if(r.seals)t+=' ve +'+r.seals+' Usta Mührü';
  t+='.'+(r.newBest?' Yeni rekor!':'');
  modal('Fuar bitti!',t,[{label:'Harika'}]);
  refresh();
});

/* ---------- yenileme döngüsü ---------- */
function refresh(){
  const G=O.getG();
  updateTop(G);updateRows(G);updateGoal(G);updateCoach(G);updateFairHUD();
  if(activeTab==='rewards')updateRewards(G);
  if(activeTab==='shop')updateEnch(G);
  if(activeTab==='seal')updateSeal(G);
  if(activeTab==='explore')updateExplore(G);
  if(!chEl.hidden)renderChapters(G);
  const qc=O.questList().some(q=>q.done&&!q.claimed);
  const ei=O.expedInfo();tabBtns.explore.dot.hidden=!(ei.act&&ei.act.done);
  tabBtns.rewards.dot.hidden=!(O.dailyInfo().claimable||qc);
  tabBtns.seal.dot.hidden=!(O.sealGain()>=Math.max(1,G.seals));
}
O.refreshUI=refresh;

/* ---------- başlangıç ---------- */
function buildAll(){
  stripLv=-1;stripCv=null;
  $('tabs').innerHTML='';$('content').innerHTML='';
  for(const k in rows)delete rows[k];for(const k in panes)delete panes[k];for(const k in tabBtns)delete tabBtns[k];
  buildTabs();
  O.TABS.forEach(function(t){
    let pane;
    if(t.id==='rewards')pane=buildRewards();
    else if(t.id==='seal')pane=buildSeal();
    else if(t.id==='explore')pane=buildExplore();
    else pane=buildRows(t);
    pane.hidden=true;panes[t.id]=pane;$('content').appendChild(pane);
  });
}
function boot(d){
  buildAll();
  O.start(d);
  if(O.getG().served>=30)O.setTut(99);
  if(O.Analytics)O.Analytics.sessionStart();
  syncSettings();
  O.i18nApply();
  selectTab('workers');
  refresh();
  setInterval(refresh,150);
}
function skin(){try{return localStorage.getItem('ors-skin')||'parch';}catch(e){return 'parch';}}
function applySkin(s){document.body.classList.toggle('skin-wood',s==='wood');document.body.classList.toggle('skin-parch',s==='parch');}
applySkin(skin());
$('set-skin').addEventListener('change',function(e){try{localStorage.setItem('ors-skin',e.target.value);}catch(x){}applySkin(e.target.value);O.emit('sfx','click');});
$('set-lang').addEventListener('change',function(e){
  O.setLang(e.target.value);
  const t=activeTab;buildAll();selectTab(t);
  ['g-chap','g-text','g-count','hint','coach-text'].forEach(function(id){const n=$(id);if(n)n.textContent='';});
  document.querySelectorAll('[data-h]').forEach(function(n){delete n.dataset.h;});
  O.rebuildBG();refresh();
});
const hot=window.claude&&window.claude.hot;
if(hot&&hot.ready)hot.ready(function(d){boot(d);});
else boot(hot&&hot.data);
})(window.Ors=window.Ors||{});
