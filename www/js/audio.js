/* Ses: efektler ve orta çağ müziği. Dosya kullanmadan WebAudio ile üretilir. */
(function(O){
'use strict';
let ac=null,master=null,sfxBus=null,musBus=null;
const last={};

function ensure(){
  if(ac)return ac;
  try{
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)return null;
    ac=new C();
    master=ac.createGain();master.gain.value=.6;master.connect(ac.destination);
    sfxBus=ac.createGain();sfxBus.gain.value=1;sfxBus.connect(master);
    musBus=ac.createGain();musBus.gain.value=0;musBus.connect(master);
  }catch(e){ac=null;}
  return ac;
}
function tone(f,dur,type,vol,when,slideTo){
  const t=ac.currentTime+(when||0),o=ac.createOscillator(),g=ac.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f,t);
  if(slideTo)o.frequency.exponentialRampToValueAtTime(slideTo,t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(sfxBus);o.start(t);o.stop(t+dur+.02);
}
function noise(dur,vol,hp,when){
  const t=ac.currentTime+(when||0),n=Math.floor(ac.sampleRate*dur),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=b;f.type='highpass';f.frequency.value=hp||1500;g.gain.value=vol;
  s.connect(f);f.connect(g);g.connect(sfxBus);s.start(t);
}
const SFX={
  clang:function(){noise(.05,.22,2200);tone(1250,.2,'triangle',.11);tone(1870,.13,'sine',.06);},
  tap:function(){noise(.03,.12,3000);},
  ready:function(){tone(988,.16,'sine',.12);tone(1319,.28,'sine',.12,.09);},
  coin:function(){tone(1568,.07,'square',.05);tone(2093,.13,'square',.05,.06);},
  buy:function(){tone(523,.1,'triangle',.12);tone(659,.1,'triangle',.12,.07);tone(784,.16,'triangle',.12,.14);},
  hire:function(){tone(330,.22,'sine',.15,0,660);noise(.08,.1,1200,.05);},
  angry:function(){tone(170,.28,'sawtooth',.07,0,90);},
  ach:function(){[659,784,988,1319].forEach(function(f,i){tone(f,.18,'triangle',.12,i*.09);});},
  chapter:function(){[392,523,659,784,1047].forEach(function(f,i){tone(f,.32,'triangle',.13,i*.11);tone(f/2,.4,'sine',.08,i*.11);});},
  royal:function(){[587,587,784,988,784,988,1175].forEach(function(f,i){tone(f,.2,'square',.05,i*.14);tone(f,.2,'triangle',.08,i*.14);});},
  prestige:function(){tone(220,.9,'sawtooth',.06,0,880);[523,659,784,1047].forEach(function(f,i){tone(f,.4,'triangle',.12,.5+i*.1);});},
  click:function(){tone(700,.04,'square',.04);}
};
O.sfx=function(name){
  const G=O.getG&&O.getG();
  if(!G||!G.set.sound)return;
  const now=Date.now();
  if(last[name]&&now-last[name]<55)return;
  last[name]=now;
  if(!ensure())return;
  if(ac.state==='suspended')return;
  try{SFX[name]&&SFX[name]();}catch(e){}
};
O.buzz=function(ms){
  const G=O.getG&&O.getG();
  if(G&&G.set.haptic&&navigator.vibrate){try{navigator.vibrate(ms);}catch(e){}}
};
O.on('sfx',function(n){O.sfx(n);});

/* ---------- müzik ----------
   Re Dorian dizisi, 6/8 ölçü. Lavta (Karplus-Strong), flüt, drone ve çerçeve davulu.
   Her 4 ölçüde akor dizisi ve ezgi cümlesi rastgele seçilir; böylece döngü sıkmaz. */
const SCALE=[0,2,3,5,7,9,10];                  // Re Dorian
const STEP=0.19;                               // sekizlik nota süresi (sn)
const CHORDS={Dm:{root:50,t:[0,3,7]},C:{root:48,t:[0,4,7]},G:{root:43,t:[0,4,7,12]},Am:{root:45,t:[0,3,7]},F:{root:41,t:[0,4,7,12]}};
const PROGS=[['Dm','C','Dm','Am'],['Dm','C','G','Dm'],['Dm','F','C','Dm'],['Dm','Am','C','G']];
/* ezgi cümleleri: [derece, süre(sekizlik)], toplam 12; derece -1 = sus */
const PHRASES=[
  [[4,3],[5,1],[4,1],[2,1],[4,3],[-1,3]],
  [[0,2],[2,1],[4,3],[5,2],[4,2],[2,2]],
  [[7,3],[6,1],[5,1],[4,1],[2,3],[-1,3]],
  [[4,1],[5,1],[6,1],[7,3],[6,2],[4,2],[2,2]],
  [[2,2],[4,2],[5,2],[4,2],[2,2],[0,2]],
  [[-1,2],[4,2],[7,2],[8,3],[7,1],[5,2]]
];
const mus={on:false,timer:0,nextT:0,step:0,bar:0,prog:PROGS[0],phrase:null,pi:0,pt:0,drone:null,notes:0,cache:{}};
const mf=m=>440*Math.pow(2,(m-69)/12);
function degMidi(d){return 62+SCALE[((d%7)+7)%7]+12*Math.floor(d/7);}

function pluckBuf(m){
  if(mus.cache[m])return mus.cache[m];
  const sr=ac.sampleRate,f=mf(m),N=Math.max(2,Math.round(sr/f)),len=Math.floor(sr*1.5),b=ac.createBuffer(1,len,sr),d=b.getChannelData(0);
  const ring=new Float32Array(N);for(let i=0;i<N;i++)ring[i]=Math.random()*2-1;
  for(let i=0;i<len;i++){
    const j=i%N,nx=(i+1)%N;
    d[i]=ring[j];
    ring[j]=.5*(ring[j]+ring[nx])*.9965;
  }
  let pk=0;for(let i=0;i<len;i++)pk=Math.max(pk,Math.abs(d[i]));
  const fade=Math.floor(sr*.15);
  for(let i=0;i<len;i++){d[i]=d[i]/pk*.9;if(i>len-fade)d[i]*=(len-i)/fade;}
  mus.cache[m]=b;return b;
}
function pluck(m,when,vol){
  const s=ac.createBufferSource(),g=ac.createGain();
  s.buffer=pluckBuf(m);g.gain.value=vol;s.connect(g);g.connect(musBus);s.start(when);mus.notes++;
}
function flute(m,when,dur,vol){
  const f=mf(m),o=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain(),g2=ac.createGain(),lfo=ac.createOscillator(),lg=ac.createGain();
  o.type='sine';o.frequency.value=f;o2.type='sine';o2.frequency.value=f*2;g2.gain.value=.22;
  lfo.frequency.value=5.2;lg.gain.value=5;lfo.connect(lg);lg.connect(o.detune);lg.connect(o2.detune);
  const end=when+dur;
  g.gain.setValueAtTime(0.0001,when);g.gain.linearRampToValueAtTime(vol,when+.07);g.gain.setValueAtTime(vol*.9,Math.max(when+.08,end-.12));g.gain.linearRampToValueAtTime(0.0001,end+.1);
  o.connect(g);o2.connect(g2);g2.connect(g);g.connect(musBus);
  o.start(when);o2.start(when);lfo.start(when);o.stop(end+.15);o2.stop(end+.15);lfo.stop(end+.15);mus.notes++;
}
function drum(when,vol){
  const o=ac.createOscillator(),g=ac.createGain();
  o.type='sine';o.frequency.setValueAtTime(130,when);o.frequency.exponentialRampToValueAtTime(52,when+.16);
  g.gain.setValueAtTime(vol,when);g.gain.exponentialRampToValueAtTime(.0001,when+.22);
  o.connect(g);g.connect(musBus);o.start(when);o.stop(when+.25);
}
function startDrone(){
  if(mus.drone)return;
  const lp=ac.createBiquadFilter(),g=ac.createGain(),a=ac.createOscillator(),b=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain();
  lp.type='lowpass';lp.frequency.value=360;g.gain.value=.05;
  a.type='sawtooth';a.frequency.value=mf(38);b.type='sawtooth';b.frequency.value=mf(45);b.detune.value=4;
  lfo.frequency.value=.12;lg.gain.value=.018;lfo.connect(lg);lg.connect(g.gain);
  a.connect(lp);b.connect(lp);lp.connect(g);g.connect(musBus);a.start();b.start();lfo.start();
  mus.drone={stop:function(){try{a.stop();b.stop();lfo.stop();}catch(e){}}};
}
function stopDrone(){if(mus.drone){mus.drone.stop();mus.drone=null;}}

function schedule(){
  if(!mus.on||!ac)return;
  while(mus.nextT<ac.currentTime+.4){
    const t=Math.max(mus.nextT,ac.currentTime+.02),s=mus.step%24,bar=Math.floor(s/6),bs=s%6;
    if(s===0){
      if(mus.bar%2===0)mus.prog=PROGS[Math.floor(Math.random()*PROGS.length)];
      mus.bar++;
    }
    const ch=CHORDS[mus.prog[bar]];
    /* lavta: sekizlik arpej */
    const pat=[0,2,1,2,1,2][bs],tn=ch.t[pat%ch.t.length];
    if(bs===0)pluck(ch.root,t,.5);
    pluck(ch.root+12+tn,t,bs===0?.34:.26);
    /* davul: ölçü başı ve dördüncü sekizlik */
    if(bs===0)drum(t,.5);else if(bs===3)drum(t,.26);
    /* ezgi: her iki ölçüde yeni cümle */
    if(s%12===0){mus.phrase=PHRASES[Math.floor(Math.random()*PHRASES.length)];mus.pi=0;mus.pt=0;}
    if(mus.phrase){
      if(mus.pt===0&&mus.pi<mus.phrase.length){
        const n=mus.phrase[mus.pi];
        if(n[0]>=0)flute(degMidi(n[0]),t,n[1]*STEP*.92,.09);
        mus.pt=n[1];
      }
      mus.pt--;
      if(mus.pt===0)mus.pi++;
    }
    mus.step++;mus.nextT=t+STEP;
  }
}
function fade(to,secs){
  if(!ac)return;
  const t=ac.currentTime;
  musBus.gain.cancelScheduledValues(t);musBus.gain.setValueAtTime(musBus.gain.value,t);musBus.gain.linearRampToValueAtTime(to,t+secs);
}
O.musicStart=function(){
  const G=O.getG&&O.getG();
  if(!G||!G.set.music||mus.on)return;
  if(!ensure())return;
  if(ac.state==='suspended'){try{ac.resume();}catch(e){}}
  mus.on=true;mus.nextT=ac.currentTime+.1;mus.step=0;mus.bar=0;
  startDrone();fade(.5,2.5);
  mus.timer=setInterval(schedule,90);schedule();
};
O.musicStop=function(){
  if(!mus.on)return;
  mus.on=false;clearInterval(mus.timer);
  if(ac){fade(0,.6);setTimeout(function(){if(!mus.on)stopDrone();},700);}
};
O.musicStats=function(){return {on:mus.on,notes:mus.notes,state:ac?ac.state:'none'};};
O.unlockAudio=function(){
  if(!ensure())return;
  if(ac.state==='suspended'){try{ac.resume();}catch(e){}}
  const G=O.getG&&O.getG();
  if(G&&G.set.music&&!mus.on)O.musicStart();
};
O.setMusic=function(on){
  const G=O.getG();G.set.music=on;
  if(on){ensure();O.musicStart();}else O.musicStop();
};
/* uygulama arka plana gidince sustur, dönünce devam et */
document.addEventListener('visibilitychange',function(){
  if(document.hidden){if(mus.on){mus.on=false;clearInterval(mus.timer);if(ac){stopDrone();fade(0,.1);}mus.resumeLater=true;}}
  else if(mus.resumeLater){mus.resumeLater=false;O.musicStart();}
});
})(window.Ors=window.Ors||{});
