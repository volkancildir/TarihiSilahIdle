/* Çizim: silahlar, karakterler, dükkan arka planı, ocaklar, dekorlar, gökyüzü */
(function(O){
'use strict';
const W=O.W, WEAPONS=O.WEAPONS;
const OUT='#1b1f27', WOOD_D='#5e3a1b', STEEL_D='#8795a5', GOLD_BELT='#d9ad4a';
O.time=0;

/* ---------- yardımcılar ---------- */
const shCache={};
function shade(hex,f){
  const k=hex+f;if(shCache[k])return shCache[k];
  const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;
  const t=f<0?0:255,p=Math.abs(f);
  r=Math.round(r+(t-r)*p);g=Math.round(g+(t-g)*p);b=Math.round(b+(t-b)*p);
  return (shCache[k]='rgb('+r+','+g+','+b+')');
}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function poly(c,pts,fill,stroke){c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();c.fillStyle=fill;c.fill();if(stroke)c.stroke();}
function lg(c,x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);for(let i=0;i<stops.length;i+=2)g.addColorStop(stops[i],stops[i+1]);return g;}
const metal=(c,x0,x1)=>lg(c,x0,0,x1,0,[0,'#f4f7fa',.45,'#b6c2cf',1,'#738197']);
const woodG=(c,x0,x1)=>lg(c,x0,0,x1,0,[0,'#b98248',1,'#6a4220']);
const goldG=(c,x0,x1)=>lg(c,x0,0,x1,0,[0,'#ffe9a0',1,'#c18a1f']);
function hl(c,x1,y1,x2,y2){c.save();c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=.9;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.restore();}
O.art={rr:rr,poly:poly,lg:lg,shade:shade,mulberry:mulberry,OUT:OUT};

/* ---------- silahlar ---------- */
/* Irk süzgeci varsa silah bir kez süzgeçle çizilip saklanır, sonra resim olarak basılır (hızlı) */
const wcache={};
const FILTER_OK=(function(){try{return 'filter' in document.createElement('canvas').getContext('2d');}catch(e){return false;}})();
function drawWeapon(c,id,x,y,s,rot){
  const f=O.weaponFilter;
  if(!f||!FILTER_OK){drawWeaponRaw(c,id,x,y,s,rot);return;}
  const key=f+'|'+id;
  let spr=wcache[key];
  if(!spr){
    spr=document.createElement('canvas');spr.width=spr.height=210;
    const g=spr.getContext('2d');g.filter=f;g.translate(105,105);g.scale(3,3);
    drawWeaponRaw(g,id,0,0,1,0);
    wcache[key]=spr;
  }
  c.save();c.translate(x,y);c.rotate(rot||0);const k=(s||1)/3;c.scale(k,k);c.drawImage(spr,-105,-105);c.restore();
}
function hexRgb(h){const n=parseInt(h.slice(1),16);return ((n>>16)&255)+','+((n>>8)&255)+','+(n&255);}
function drawWeaponRaw(c,id,x,y,s,rot){
  c.save();c.translate(x,y);c.rotate(rot||0);c.scale(s||1,s||1);
  c.lineJoin='round';c.lineCap='round';c.lineWidth=1.4;c.strokeStyle=OUT;
  switch(id){
  case 'dagger':
    poly(c,[0,-17,4.2,-3,-4.2,-3],metal(c,-4.2,4.2),1);hl(c,-1.2,-12,-1.5,-4.5);
    c.fillStyle=goldG(c,-6.5,6.5);c.fillRect(-6.5,-3,13,3.2);c.strokeRect(-6.5,-3,13,3.2);
    c.fillStyle=woodG(c,-1.9,1.9);c.fillRect(-1.9,.2,3.8,8);c.strokeRect(-1.9,.2,3.8,8);
    c.beginPath();c.arc(0,10.6,2.4,0,7);c.fillStyle=goldG(c,-2.4,2.4);c.fill();c.stroke();break;
  case 'sword':
    poly(c,[0,-20,3.8,-16,3.8,4,-3.8,4,-3.8,-16],metal(c,-3.8,3.8),1);
    c.beginPath();c.moveTo(0,-16);c.lineTo(0,3);c.strokeStyle='#6f7e90';c.lineWidth=1;c.stroke();c.strokeStyle=OUT;c.lineWidth=1.4;
    hl(c,-2.4,-14,-2.4,2);
    c.fillStyle=goldG(c,-9,9);c.fillRect(-9,4,18,3.4);c.strokeRect(-9,4,18,3.4);
    c.fillStyle=woodG(c,-1.9,1.9);c.fillRect(-1.9,7.4,3.8,7);c.strokeRect(-1.9,7.4,3.8,7);
    c.beginPath();c.arc(0,16.6,2.4,0,7);c.fillStyle=goldG(c,-2.4,2.4);c.fill();c.stroke();break;
  case 'axe':
    c.fillStyle=woodG(c,-1.8,1.8);c.fillRect(-1.8,-17,3.6,35);c.strokeRect(-1.8,-17,3.6,35);
    c.beginPath();c.moveTo(1.8,-16);c.bezierCurveTo(10,-21,17,-15,14,-6);c.bezierCurveTo(12,-1,6,-3,1.8,-3);c.closePath();
    c.fillStyle=lg(c,2,-18,15,-3,[0,'#f4f7fa',.5,'#b6c2cf',1,'#6f7d92']);c.fill();c.stroke();
    hl(c,4,-14,10,-16);break;
  case 'spear':
    c.fillStyle=woodG(c,-1.5,1.5);c.fillRect(-1.5,-7,3,26);c.strokeRect(-1.5,-7,3,26);
    poly(c,[0,-20,4.6,-6,0,-9,-4.6,-6],metal(c,-4.6,4.6),1);hl(c,-1.4,-16,-2.8,-7.5);
    c.fillStyle=goldG(c,-2.6,2.6);c.fillRect(-2.6,-8,5.2,2.4);c.strokeRect(-2.6,-8,5.2,2.4);break;
  case 'bow':
    c.lineWidth=3.4;c.strokeStyle=OUT;c.beginPath();c.arc(9,0,18,Math.PI*.67,Math.PI*1.33);c.stroke();
    c.lineWidth=2.2;c.strokeStyle='#a9733a';c.beginPath();c.arc(9,0,18,Math.PI*.67,Math.PI*1.33);c.stroke();
    c.lineWidth=1;c.strokeStyle='#efe8d6';c.beginPath();c.moveTo(-.1,-15.5);c.lineTo(-.1,15.5);c.stroke();
    c.lineWidth=1.6;c.strokeStyle=WOOD_D;c.beginPath();c.moveTo(0,14);c.lineTo(0,-15);c.stroke();
    c.lineWidth=1.2;c.strokeStyle=OUT;poly(c,[0,-20,2.8,-14,-2.8,-14],metal(c,-2.8,2.8),1);
    c.fillStyle='#c8402c';c.fillRect(-2,10,4,4);break;
  case 'shield':{
    const g=c.createRadialGradient(-4,-4,2,0,0,15);g.addColorStop(0,'#c98a52');g.addColorStop(1,'#8a5430');
    c.beginPath();c.arc(0,0,14,0,7);c.fillStyle=g;c.fill();
    c.save();c.beginPath();c.arc(0,0,13,0,7);c.clip();c.fillStyle='rgba(180,40,34,.85)';c.fillRect(0,-14,14,14);c.fillRect(-14,0,14,14);c.restore();
    c.lineWidth=3;c.strokeStyle=STEEL_D;c.beginPath();c.arc(0,0,14,0,7);c.stroke();
    c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(0,0,12.4,Math.PI*1.05,Math.PI*1.6);c.stroke();
    c.lineWidth=1.4;c.strokeStyle=OUT;c.beginPath();c.arc(0,0,4.6,0,7);c.fillStyle=goldG(c,-4.6,4.6);c.fill();c.stroke();break;}
  case 'warhammer':
    c.fillStyle=woodG(c,-1.8,1.8);c.fillRect(-1.8,-6,3.6,25);c.strokeRect(-1.8,-6,3.6,25);
    c.fillStyle=metal(c,-10,10);c.fillRect(-10,-17,20,10);
    c.fillStyle='#7a889b';c.fillRect(-10,-17,4,10);c.fillRect(6,-17,4,10);
    c.strokeRect(-10,-17,20,10);hl(c,-4,-15.5,4,-15.5);
    poly(c,[-2.4,-17,2.4,-17,0,-22],metal(c,-2.4,2.4),1);break;
  case 'greatsword':
    poly(c,[0,-25,5,-20,5,5,-5,5,-5,-20],metal(c,-5,5),1);
    c.beginPath();c.moveTo(0,-20);c.lineTo(0,4);c.strokeStyle='#6f7e90';c.lineWidth=1;c.stroke();c.strokeStyle=OUT;c.lineWidth=1.4;
    hl(c,-3,-18,-3,3);
    c.fillStyle=goldG(c,-12,12);c.beginPath();c.moveTo(-12,5);c.lineTo(12,5);c.lineTo(10,9);c.lineTo(-10,9);c.closePath();c.fill();c.stroke();
    c.fillStyle=woodG(c,-2,2);c.fillRect(-2,9,4,8);c.strokeRect(-2,9,4,8);
    c.beginPath();c.arc(0,19.5,2.8,0,7);c.fillStyle='#d4503a';c.fill();c.stroke();break;
  case 'halberd':
    c.fillStyle=woodG(c,-1.6,1.6);c.fillRect(-1.6,-12,3.2,32);c.strokeRect(-1.6,-12,3.2,32);
    poly(c,[0,-25,3.4,-13,-3.4,-13],metal(c,-3.4,3.4),1);
    c.beginPath();c.moveTo(1.6,-12);c.bezierCurveTo(12,-16,17,-8,13,0);c.bezierCurveTo(10,3,5,1,1.6,1);c.closePath();
    c.fillStyle=lg(c,2,-16,14,2,[0,'#f4f7fa',.5,'#b6c2cf',1,'#6f7d92']);c.fill();c.stroke();
    poly(c,[-1.6,-4,-9,-1,-1.6,2],metal(c,-9,-1.6),1);
    c.fillStyle=goldG(c,-3,3);c.fillRect(-2.8,-14,5.6,2.4);c.strokeRect(-2.8,-14,5.6,2.4);break;
  case 'crossbow':
    c.fillStyle=woodG(c,-2.4,2.4);c.fillRect(-2.4,-8,4.8,27);c.strokeRect(-2.4,-8,4.8,27);
    c.lineWidth=3.2;c.strokeStyle=OUT;c.beginPath();c.moveTo(-15,-3);c.quadraticCurveTo(0,-14,15,-3);c.stroke();
    c.lineWidth=1.8;c.strokeStyle='#a9733a';c.beginPath();c.moveTo(-15,-3);c.quadraticCurveTo(0,-14,15,-3);c.stroke();
    c.lineWidth=.9;c.strokeStyle='#efe8d6';c.beginPath();c.moveTo(-15,-3);c.lineTo(0,5);c.lineTo(15,-3);c.stroke();
    c.lineWidth=1.4;c.strokeStyle=OUT;c.fillStyle=woodG(c,-1,1);c.fillRect(-1,-14,2,18);c.strokeRect(-1,-14,2,18);
    poly(c,[0,-19,2.6,-13,-2.6,-13],metal(c,-2.6,2.6),1);
    c.fillStyle=goldG(c,-4,4);c.fillRect(-3.6,3,7.2,3);c.strokeRect(-3.6,3,7.2,3);break;
  case 'mace':
    c.fillStyle=woodG(c,-1.8,1.8);c.fillRect(-1.8,-6,3.6,25);c.strokeRect(-1.8,-6,3.6,25);
    for(let k=0;k<8;k++){const an=k*Math.PI/4;poly(c,[Math.cos(an-.28)*8,-14+Math.sin(an-.28)*8,Math.cos(an)*12.5,-14+Math.sin(an)*12.5,Math.cos(an+.28)*8,-14+Math.sin(an+.28)*8],metal(c,-12,12),1);}
    c.beginPath();c.arc(0,-14,8,0,7);c.fillStyle=lg(c,-8,-20,8,-6,[0,'#f4f7fa',.5,'#b6c2cf',1,'#6a788c']);c.fill();c.stroke();hl(c,-4,-18,-1,-19);break;
  case 'rapier':
    poly(c,[0,-26,1.7,-22,1.7,3,-1.7,3,-1.7,-22],metal(c,-1.7,1.7),1);hl(c,-.6,-20,-.6,0);
    c.lineWidth=1.4;c.beginPath();c.arc(0,5,9,Math.PI*.05,Math.PI*.95);c.fillStyle=goldG(c,-9,9);c.fill();c.stroke();
    c.fillStyle=goldG(c,-9,9);c.fillRect(-8,3.4,16,2);c.strokeRect(-8,3.4,16,2);
    c.fillStyle=woodG(c,-1.6,1.6);c.fillRect(-1.6,9,3.2,7);c.strokeRect(-1.6,9,3.2,7);
    c.beginPath();c.arc(0,17.6,2.2,0,7);c.fillStyle=goldG(c,-2.2,2.2);c.fill();c.stroke();break;
  case 'staff':{
    c.fillStyle=woodG(c,-1.7,1.7);c.fillRect(-1.7,-8,3.4,28);c.strokeRect(-1.7,-8,3.4,28);
    c.lineWidth=2.4;c.strokeStyle=OUT;c.beginPath();c.moveTo(-1,-8);c.bezierCurveTo(-9,-10,-9,-22,0,-22);c.bezierCurveTo(9,-22,9,-10,1,-8);c.stroke();
    c.lineWidth=1.4;
    c.save();c.globalCompositeOperation='lighter';const gl=c.createRadialGradient(0,-16,1,0,-16,13);gl.addColorStop(0,'rgba(120,220,255,.7)');gl.addColorStop(1,'rgba(120,220,255,0)');c.fillStyle=gl;c.fillRect(-14,-30,28,28);c.restore();
    const og=c.createRadialGradient(-1.5,-17.5,.5,0,-16,5.4);og.addColorStop(0,'#f2ffff');og.addColorStop(.5,'#58c8f0');og.addColorStop(1,'#2a6aa8');
    c.beginPath();c.arc(0,-16,5,0,7);c.fillStyle=og;c.fill();c.stroke();
    c.fillStyle=goldG(c,-3,3);c.fillRect(-3,-10.4,6,2.4);c.strokeRect(-3,-10.4,6,2.4);break;}
  case 'longbow':
    c.lineWidth=3.4;c.strokeStyle=OUT;c.beginPath();c.arc(11,0,23,Math.PI*.7,Math.PI*1.3);c.stroke();
    c.lineWidth=2.2;c.strokeStyle='#6f9a46';c.beginPath();c.arc(11,0,23,Math.PI*.7,Math.PI*1.3);c.stroke();
    c.lineWidth=1;c.strokeStyle='#efe8d6';c.beginPath();c.moveTo(-.4,-18.5);c.lineTo(-.4,18.5);c.stroke();
    c.lineWidth=1.6;c.strokeStyle=WOOD_D;c.beginPath();c.moveTo(0,17);c.lineTo(0,-19);c.stroke();
    c.lineWidth=1.2;c.strokeStyle=OUT;poly(c,[0,-24,2.8,-18,-2.8,-18],metal(c,-2.8,2.8),1);
    c.fillStyle='#3f7f5f';c.fillRect(-2,12,4,4);break;
  case 'waraxe':
    c.fillStyle=woodG(c,-1.8,1.8);c.fillRect(-1.8,-18,3.6,38);c.strokeRect(-1.8,-18,3.6,38);
    [1,-1].forEach(function(sx){
      c.beginPath();c.moveTo(1.8*sx,-17);c.bezierCurveTo(11*sx,-23,19*sx,-15,15*sx,-5);c.bezierCurveTo(12*sx,0,6*sx,-2,1.8*sx,-3);c.closePath();
      c.fillStyle=lg(c,2*sx,-18,16*sx,-3,[0,'#f4f7fa',.5,'#b6c2cf',1,'#6f7d92']);c.fill();c.stroke();
    });
    hl(c,4,-15,10,-17);poly(c,[0,-26,2.4,-18,-2.4,-18],metal(c,-2.4,2.4),1);break;
  case 'scythe':
    c.fillStyle=woodG(c,-1.6,1.6);c.fillRect(-1.6,-14,3.2,34);c.strokeRect(-1.6,-14,3.2,34);
    c.beginPath();c.moveTo(0,-15);c.bezierCurveTo(10,-25,24,-18,27,-3);c.bezierCurveTo(21,-13,11,-15,0,-10);c.closePath();
    c.fillStyle=lg(c,0,-24,26,-3,[0,'#f4f7fa',.5,'#b6c2cf',1,'#6f7d92']);c.fill();c.stroke();hl(c,6,-17,16,-17);
    c.fillStyle=goldG(c,-3,3);c.fillRect(-2.8,-12,5.6,2.2);c.strokeRect(-2.8,-12,5.6,2.2);break;
  case 'silverdagger':
    poly(c,[0,-19,4.6,-3,-4.6,-3],lg(c,-4.6,0,4.6,0,[0,'#ffffff',.5,'#dce8f6',1,'#9db4d0']),1);hl(c,-1.4,-14,-1.6,-5);
    c.beginPath();c.moveTo(0,-15);c.lineTo(0,-4);c.strokeStyle='#8aa4c4';c.lineWidth=1;c.stroke();c.strokeStyle=OUT;c.lineWidth=1.4;
    c.fillStyle='#c9d3e4';c.fillRect(-7.5,-3,15,3.4);c.strokeRect(-7.5,-3,15,3.4);
    c.fillStyle=woodG(c,-1.9,1.9);c.fillRect(-1.9,.4,3.8,8);c.strokeRect(-1.9,.4,3.8,8);
    c.beginPath();c.arc(0,11,2.6,0,7);c.fillStyle='#b02a48';c.fill();c.stroke();break;
  case 'pike':
    c.fillStyle=woodG(c,-1.5,1.5);c.fillRect(-1.5,-12,3,34);c.strokeRect(-1.5,-12,3,34);
    poly(c,[0,-26,3.6,-13,-3.6,-13],metal(c,-3.6,3.6),1);hl(c,-1.2,-22,-2,-14);
    c.fillStyle=goldG(c,-3,3);c.fillRect(-2.8,-14,5.6,2.4);c.strokeRect(-2.8,-14,5.6,2.4);
    c.beginPath();c.moveTo(1.5,-10);c.quadraticCurveTo(9,-12,16,-9);c.lineTo(13,-5);c.lineTo(16,-1);c.quadraticCurveTo(9,-4,1.5,-2);c.closePath();
    c.fillStyle='#c8402c';c.fill();c.stroke();break;
  case 'thunderhammer':{
    c.fillStyle=woodG(c,-1.8,1.8);c.fillRect(-1.8,-6,3.6,25);c.strokeRect(-1.8,-6,3.6,25);
    c.save();c.globalCompositeOperation='lighter';const gl=c.createRadialGradient(0,-12,2,0,-12,18);gl.addColorStop(0,'rgba(140,200,255,.65)');gl.addColorStop(1,'rgba(140,200,255,0)');c.fillStyle=gl;c.fillRect(-20,-30,40,36);c.restore();
    c.fillStyle=lg(c,-11,-17,11,-7,[0,'#8fb8f0',.5,'#4a78c8',1,'#27407a']);c.fillRect(-11,-17,22,10);c.strokeRect(-11,-17,22,10);
    c.beginPath();c.moveTo(2,-17);c.lineTo(-3,-12);c.lineTo(0,-12);c.lineTo(-3,-7);c.lineTo(4,-13);c.lineTo(1,-13);c.closePath();c.fillStyle='#fff3a0';c.fill();c.lineWidth=.9;c.stroke();c.lineWidth=1.4;
    poly(c,[-2.4,-17,2.4,-17,0,-22],metal(c,-2.4,2.4),1);break;}
  case 'dragonblade':{
    c.save();c.globalCompositeOperation='lighter';const gl=c.createRadialGradient(0,-8,2,0,-8,22);gl.addColorStop(0,'rgba(255,120,40,.55)');gl.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=gl;c.fillRect(-24,-34,48,50);c.restore();
    c.beginPath();c.moveTo(0,-27);c.lineTo(4,-22);c.lineTo(6,-17);c.lineTo(4,-13);c.lineTo(6,-8);c.lineTo(4,-3);c.lineTo(5,5);c.lineTo(-5,5);c.lineTo(-4,-3);c.lineTo(-6,-8);c.lineTo(-4,-13);c.lineTo(-6,-17);c.lineTo(-4,-22);c.closePath();
    c.fillStyle=lg(c,0,-27,0,5,[0,'#ffe9a0',.45,'#ff8a2a',1,'#9a2418']);c.fill();c.stroke();
    c.beginPath();c.moveTo(0,-22);c.lineTo(0,4);c.strokeStyle='#ffd9a0';c.lineWidth=1;c.stroke();c.strokeStyle=OUT;c.lineWidth=1.4;
    c.fillStyle=goldG(c,-13,13);c.beginPath();c.moveTo(-14,3);c.quadraticCurveTo(-8,3,-6,6);c.lineTo(6,6);c.quadraticCurveTo(8,3,14,3);c.quadraticCurveTo(10,10,5,9);c.lineTo(-5,9);c.quadraticCurveTo(-10,10,-14,3);c.closePath();c.fill();c.stroke();
    c.fillStyle=woodG(c,-2,2);c.fillRect(-2,9,4,8);c.strokeRect(-2,9,4,8);
    c.beginPath();c.arc(0,19.5,2.8,0,7);c.fillStyle='#ff5a2a';c.fill();c.stroke();break;}
  case 'giantclub':
    c.beginPath();c.moveTo(-3,20);c.lineTo(3,20);c.lineTo(8,-8);c.bezierCurveTo(12,-18,6,-26,0,-26);c.bezierCurveTo(-6,-26,-12,-18,-8,-8);c.closePath();
    c.fillStyle=woodG(c,-10,10);c.fill();c.stroke();
    c.strokeStyle='rgba(60,36,16,.8)';c.lineWidth=1;[[-3,-14,2,-12],[1,-20,4,-18],[-4,-4,3,-2]].forEach(function(l){c.beginPath();c.moveTo(l[0],l[1]);c.lineTo(l[2],l[3]);c.stroke();});c.strokeStyle=OUT;c.lineWidth=1.4;
    [[-8,-12],[8,-12],[-7,-20],[7,-20],[0,-26]].forEach(function(s){poly(c,[s[0]-1.8,s[1]+1,s[0]+1.8,s[1]+1,s[0]+(s[0]<0?-3:s[0]>0?3:0),s[1]-(s[0]===0?4:2)],metal(c,-3,3),1);});break;
  case 'giantaxe':
    c.fillStyle=woodG(c,-2.2,2.2);c.fillRect(-2.2,-14,4.4,36);c.strokeRect(-2.2,-14,4.4,36);
    c.beginPath();c.moveTo(2,-16);c.lineTo(16,-24);c.lineTo(20,-8);c.lineTo(16,6);c.lineTo(2,0);c.closePath();
    c.fillStyle=lg(c,2,-24,20,6,[0,'#d8d2c4',.5,'#a8a090',1,'#6a6458']);c.fill();c.stroke();
    c.strokeStyle='rgba(60,50,40,.8)';c.lineWidth=1;c.beginPath();c.moveTo(6,-14);c.lineTo(14,-8);c.lineTo(8,-2);c.stroke();c.strokeStyle=OUT;c.lineWidth=1.4;
    c.fillStyle='#8a5a30';c.fillRect(-3.4,-9,6.8,3);c.strokeRect(-3.4,-9,6.8,3);c.fillRect(-3.4,-3,6.8,3);c.strokeRect(-3.4,-3,6.8,3);break;
  case 'crystalstaff':{
    c.fillStyle=woodG(c,-1.7,1.7);c.fillRect(-1.7,-8,3.4,28);c.strokeRect(-1.7,-8,3.4,28);
    c.save();c.globalCompositeOperation='lighter';const gl=c.createRadialGradient(0,-17,1,0,-17,15);gl.addColorStop(0,'rgba(200,120,255,.65)');gl.addColorStop(1,'rgba(200,120,255,0)');c.fillStyle=gl;c.fillRect(-16,-32,32,32);c.restore();
    c.beginPath();c.moveTo(0,-28);c.lineTo(6,-19);c.lineTo(3,-10);c.lineTo(-3,-10);c.lineTo(-6,-19);c.closePath();
    c.fillStyle=lg(c,-6,-28,6,-10,[0,'#f6e4ff',.5,'#b068e8',1,'#5a2a9a']);c.fill();c.stroke();
    c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=.9;c.beginPath();c.moveTo(0,-26);c.lineTo(-2.4,-18);c.stroke();c.strokeStyle=OUT;c.lineWidth=1.4;
    c.fillStyle=goldG(c,-4,4);c.fillRect(-4,-10,8,2.6);c.strokeRect(-4,-10,8,2.6);break;}
  case 'ancientstaff':{
    c.lineWidth=3.4;c.strokeStyle=OUT;c.beginPath();c.moveTo(0,22);c.bezierCurveTo(3,10,-3,2,1,-8);c.stroke();
    c.lineWidth=2.2;c.strokeStyle='#8a6a42';c.beginPath();c.moveTo(0,22);c.bezierCurveTo(3,10,-3,2,1,-8);c.stroke();
    c.lineWidth=3;c.strokeStyle=OUT;c.beginPath();c.moveTo(1,-8);c.bezierCurveTo(-9,-12,-8,-24,1,-24);c.bezierCurveTo(8,-24,9,-14,3,-12);c.stroke();
    c.lineWidth=1.8;c.strokeStyle='#a5824f';c.beginPath();c.moveTo(1,-8);c.bezierCurveTo(-9,-12,-8,-24,1,-24);c.bezierCurveTo(8,-24,9,-14,3,-12);c.stroke();c.lineWidth=1.4;c.strokeStyle=OUT;
    c.save();c.globalCompositeOperation='lighter';const gl=c.createRadialGradient(1,-18,1,1,-18,16);gl.addColorStop(0,'rgba(255,235,150,.75)');gl.addColorStop(1,'rgba(255,235,150,0)');c.fillStyle=gl;c.fillRect(-16,-34,34,34);c.restore();
    const og=c.createRadialGradient(0,-19,.5,1,-18,4.6);og.addColorStop(0,'#ffffff');og.addColorStop(.5,'#ffe48a');og.addColorStop(1,'#d8962a');
    c.beginPath();c.arc(1,-18,4.2,0,7);c.fillStyle=og;c.fill();c.stroke();
    c.fillStyle='#e8d8b0';[[-3,12],[2,5],[-2,-1]].forEach(function(s){c.beginPath();c.arc(s[0],s[1],1.3,0,7);c.fill();});break;}
  case 'helm':
    c.beginPath();c.moveTo(-12,13);c.lineTo(-12,-1);c.arc(0,-1,12,Math.PI,0);c.lineTo(12,13);c.closePath();
    c.fillStyle=lg(c,-12,0,12,0,[0,'#f4f7fa',.5,'#b6c2cf',1,'#6a788c']);c.fill();c.stroke();
    c.fillStyle='#1d222b';c.fillRect(-8,2,16,3.4);c.fillRect(-1.2,2,2.4,11);
    c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=.9;c.beginPath();c.arc(0,-1,9.6,Math.PI*1.1,Math.PI*1.55);c.stroke();c.strokeStyle=OUT;c.lineWidth=1.4;
    c.beginPath();c.moveTo(0,-12);c.bezierCurveTo(-4,-22,6,-24,12,-17);c.bezierCurveTo(6,-18,3,-14,2,-12);c.closePath();
    c.fillStyle='#d4503a';c.fill();c.stroke();
    c.fillStyle=goldG(c,-12,12);c.fillRect(-12,11,24,2.6);c.strokeRect(-12,11,24,2.6);break;
  }
  c.restore();
}

/* ---------- insanlar ---------- */
function drawPerson(c,p){
  const T=O.time;
  const x=p.x,y=p.y,f=p.face||1;
  const k=(O.PERSON_SCALE||1)*(p.big?1.55:1);
  c.save();c.translate(x,y);c.scale(k,k);c.translate(-x,-y);
  const bob=p.moving?Math.abs(Math.sin(p.phase))*2.2:Math.sin(T*2.2+p.phase)*.5;
  const st=p.moving?Math.sin(p.phase)*3.6:0;
  c.fillStyle='rgba(0,0,0,.30)';c.beginPath();c.ellipse(x,y+1,11.5,4,0,0,7);c.fill();
  c.lineWidth=1.2;c.strokeStyle=OUT;c.lineJoin='round';
  c.fillStyle='#3a2f29';
  rr(c,x-6.2,y-9+st*.4,5.2,9,2);c.fill();c.stroke();
  rr(c,x+1,y-9-st*.4,5.2,9,2);c.fill();c.stroke();
  c.fillStyle='rgba(255,255,255,.18)';c.fillRect(x-5,y-2+st*.4,3,1);c.fillRect(x+2,y-2-st*.4,3,1);
  const hy=y-29-bob;
  if(p.race==='vampire'){
    c.fillStyle='#4a0f1c';c.beginPath();c.moveTo(x-9,y-24-bob);c.lineTo(x+9,y-24-bob);c.lineTo(x+13,y-3);c.lineTo(x-13,y-3);c.closePath();c.fill();c.stroke();
  }
  if(p.race==='wizard'){
    c.fillStyle=shade(p.cloth,-.1);c.beginPath();c.moveTo(x-9,y-24-bob);c.lineTo(x+9,y-24-bob);c.lineTo(x+12,y-2);c.lineTo(x-12,y-2);c.closePath();c.fill();c.stroke();
    c.fillStyle='rgba(255,220,120,.7)';c.fillRect(x-11,y-5,22,1.6);
  }
  c.fillStyle=shade(p.cloth,-.3);rr(c,x-12,y-22-bob,4.6,9,2);c.fill();c.stroke();
  rr(c,x-8.8,y-24-bob,17.6,18,6);
  c.fillStyle=lg(c,x-8.8,0,x+8.8,0,[0,shade(p.cloth,.2),1,shade(p.cloth,-.28)]);c.fill();c.stroke();
  if(p.apron){
    rr(c,x-5.6,y-20-bob,11.2,14,3);
    c.fillStyle=lg(c,x-5.6,0,x+5.6,0,[0,shade(p.apron,.15),1,shade(p.apron,-.3)]);c.fill();
    c.lineWidth=.8;c.stroke();c.lineWidth=1.2;
    c.strokeStyle=shade(p.apron,-.45);c.beginPath();c.moveTo(x-4,y-24-bob);c.lineTo(x-4,y-20-bob);c.moveTo(x+4,y-24-bob);c.lineTo(x+4,y-20-bob);c.stroke();c.strokeStyle=OUT;
  }
  c.fillStyle='#3a2a1c';c.fillRect(x-8.6,y-11-bob,17.2,2.2);
  c.fillStyle=GOLD_BELT;c.fillRect(x-1.6,y-11.2-bob,3.2,2.6);
  c.fillStyle=shade(p.cloth,.05);rr(c,x+7.4,y-22-bob,4.6,9,2);if(p.hammer==null){c.fill();c.stroke();}
  c.fillStyle=p.skin;
  c.beginPath();c.arc(x-10,y-12.5-bob-st*.3,2.8,0,7);c.fill();c.stroke();
  if(p.hammer==null){c.beginPath();c.arc(x+10,y-12.5-bob+st*.3,2.8,0,7);c.fill();c.stroke();}
  c.beginPath();c.arc(x,hy,7.8,0,7);
  const hg=c.createRadialGradient(x-2.5,hy-2.5,1,x,hy,8.5);hg.addColorStop(0,shade(p.skin,.2));hg.addColorStop(1,p.skin);
  c.fillStyle=hg;c.fill();c.stroke();
  if(p.beard){c.fillStyle=p.hair;c.beginPath();c.arc(x,hy+1.4,7.6,.2,Math.PI-.2);c.quadraticCurveTo(x,hy+9,x+6.5,hy+3);c.fill();
    if(p.race==='wizard'){c.beginPath();c.moveTo(x-6,hy+4);c.lineTo(x+6,hy+4);c.lineTo(x,hy+17);c.closePath();c.fill();c.stroke();}}
  c.fillStyle=p.hair;c.beginPath();c.arc(x,hy,7.9,Math.PI,0);c.fill();
  c.fillRect(x-7.9,hy-.6,2,4);c.fillRect(x+5.9,hy-.6,2,4);
  if(p.hat==='wizard'){
    c.fillStyle=shade(p.cloth,-.05);c.beginPath();c.ellipse(x,hy-4,11.5,3.2,0,0,7);c.fill();c.stroke();
    c.beginPath();c.moveTo(x-6.4,hy-4.4);c.lineTo(x+1.5,hy-24);c.lineTo(x+6.4,hy-4.4);c.closePath();c.fill();c.stroke();
    c.fillStyle='#ffd36b';c.fillRect(x-6.2,hy-7.6,12.4,2);
    c.beginPath();c.arc(x+1.6,hy-17,1.1,0,7);c.fill();
  }
  else if(p.hat==='band'){c.fillStyle=p.hatCol;c.fillRect(x-7.9,hy-4.4,15.8,3);c.strokeRect(x-7.9,hy-4.4,15.8,3);}
  else if(p.hat==='cap'){c.fillStyle=p.hatCol;c.beginPath();c.arc(x,hy-.6,8,Math.PI,0);c.fill();c.stroke();c.fillRect(x+(f>0?2:-10),hy-2,8,2.4);}
  else if(p.hat==='straw'){c.fillStyle=p.hatCol;c.beginPath();c.ellipse(x,hy-3,11.5,3.6,0,0,7);c.fill();c.stroke();c.beginPath();c.arc(x,hy-3,6.2,Math.PI,0);c.fill();c.stroke();}
  if(p.crown){
    c.fillStyle=goldG(c,x-6,x+6);c.lineWidth=1;
    c.beginPath();c.moveTo(x-6,hy-6.5);c.lineTo(x-6,hy-12);c.lineTo(x-3,hy-9);c.lineTo(x,hy-13);c.lineTo(x+3,hy-9);c.lineTo(x+6,hy-12);c.lineTo(x+6,hy-6.5);c.closePath();c.fill();c.stroke();
    c.fillStyle='#d4503a';c.beginPath();c.arc(x,hy-8,1,0,7);c.fill();
  }
  const ex=x+f*1.8;
  c.fillStyle='#fff';c.beginPath();c.ellipse(ex-2.6,hy+.8,1.7,2,0,0,7);c.fill();c.beginPath();c.ellipse(ex+2.6,hy+.8,1.7,2,0,0,7);c.fill();
  c.fillStyle=OUT;c.beginPath();c.arc(ex-2.6+f*.5,hy+1,.95,0,7);c.fill();c.beginPath();c.arc(ex+2.6+f*.5,hy+1,.95,0,7);c.fill();
  c.strokeStyle=OUT;c.lineWidth=1;
  if(p.mood==='angry'){c.beginPath();c.moveTo(ex-5,hy-2.4);c.lineTo(ex-1,hy-.8);c.moveTo(ex+5,hy-2.4);c.lineTo(ex+1,hy-.8);c.stroke();c.beginPath();c.arc(ex,hy+6.4,2.2,Math.PI*1.1,Math.PI*1.9);c.stroke();}
  else if(p.mood==='happy'){c.beginPath();c.arc(ex,hy+3.4,2.8,.15,Math.PI-.15);c.stroke();}
  else if(p.mood==='worry'){c.beginPath();c.moveTo(ex-2,hy+5.6);c.lineTo(ex+2,hy+5.2);c.stroke();}
  else{c.beginPath();c.moveTo(ex-1.6,hy+5.2);c.lineTo(ex+1.6,hy+5.2);c.stroke();}
  if(p.race==='elf'){
    c.fillStyle=p.skin;
    c.beginPath();c.moveTo(x-7.2,hy-1);c.lineTo(x-14,hy-5);c.lineTo(x-7.4,hy+3);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(x+7.2,hy-1);c.lineTo(x+14,hy-5);c.lineTo(x+7.4,hy+3);c.closePath();c.fill();c.stroke();
  }else if(p.race==='orc'){
    c.fillStyle='#f4f0dc';c.lineWidth=.8;
    c.beginPath();c.moveTo(ex-3.4,hy+5.6);c.lineTo(ex-2.2,hy+1.8);c.lineTo(ex-1,hy+5.6);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(ex+1,hy+5.6);c.lineTo(ex+2.2,hy+1.8);c.lineTo(ex+3.4,hy+5.6);c.closePath();c.fill();c.stroke();
    c.lineWidth=1.2;c.strokeStyle=OUT;c.beginPath();c.moveTo(ex-5.4,hy-2.8);c.lineTo(ex-.8,hy-1.2);c.moveTo(ex+5.4,hy-2.8);c.lineTo(ex+.8,hy-1.2);c.stroke();
  }else if(p.race==='skeleton'){
    c.fillStyle='#14121a';
    c.beginPath();c.ellipse(ex-2.6,hy+.8,2.5,3,0,0,7);c.fill();c.beginPath();c.ellipse(ex+2.6,hy+.8,2.5,3,0,0,7);c.fill();
    c.fillStyle='#d8d0b8';c.beginPath();c.arc(ex-2.6,hy+1.2,.7,0,7);c.fill();c.beginPath();c.arc(ex+2.6,hy+1.2,.7,0,7);c.fill();
    c.fillStyle='#f4f0e0';c.fillRect(ex-3.4,hy+4.6,6.8,2.6);c.strokeStyle=OUT;c.lineWidth=.8;c.strokeRect(ex-3.4,hy+4.6,6.8,2.6);
    c.beginPath();c.moveTo(ex-1.1,hy+4.6);c.lineTo(ex-1.1,hy+7.2);c.moveTo(ex+1.1,hy+4.6);c.lineTo(ex+1.1,hy+7.2);c.stroke();
  }else if(p.race==='vampire'){
    c.fillStyle='#fff';c.lineWidth=.8;
    c.beginPath();c.moveTo(ex-2.6,hy+5);c.lineTo(ex-1.6,hy+8.2);c.lineTo(ex-.6,hy+5);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(ex+.6,hy+5);c.lineTo(ex+1.6,hy+8.2);c.lineTo(ex+2.6,hy+5);c.closePath();c.fill();c.stroke();
    c.fillStyle='#4a0f1c';c.lineWidth=1.2;c.strokeStyle=OUT;
    c.beginPath();c.moveTo(x-9,y-24-bob);c.lineTo(x-7,y-31-bob);c.lineTo(x-2,y-24-bob);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(x+9,y-24-bob);c.lineTo(x+7,y-31-bob);c.lineTo(x+2,y-24-bob);c.closePath();c.fill();c.stroke();
  }
  if(p.hat==='helm'){
    c.fillStyle=metal(c,x-9,x+9);c.lineWidth=1.2;c.strokeStyle=OUT;
    c.beginPath();c.arc(x,hy-.6,8.6,Math.PI,0);c.lineTo(x+8.6,hy+2);c.lineTo(x-8.6,hy+2);c.closePath();c.fill();c.stroke();
    c.fillStyle='#2a3340';c.fillRect(x-5.6,hy-.6,11.2,2.2);
    c.fillStyle='#c8402c';c.beginPath();c.ellipse(x,hy-9.6,2,3.4,0,0,7);c.fill();c.stroke();
  }
  if(p.soot){c.fillStyle='rgba(30,22,18,.45)';c.beginPath();c.ellipse(x-3.8*f,hy+3.4,2.2,1.4,0,0,7);c.fill();}
  c.strokeStyle=OUT;c.lineWidth=1.2;
  if(p.hammer!=null){
    c.save();c.translate(x+9*f,y-17-bob);c.rotate(p.hammer*f);
    c.fillStyle=woodG(c,-1.4,1.4);c.fillRect(-1.4,-15,2.8,16);c.strokeRect(-1.4,-15,2.8,16);
    c.fillStyle=metal(c,-5.5,5.5);c.fillRect(-5.5,-20,11,7);c.strokeRect(-5.5,-20,11,7);
    c.fillStyle=p.skin;c.beginPath();c.arc(0,0,2.8,0,7);c.fill();c.stroke();
    c.restore();
  }
  if(p.carry!=null)drawWeapon(c,WEAPONS[p.carry].id,x+12*f,y-26-bob,.75,.5*f);
  c.restore();
}

function drawBubble(c,x,y,wi,frac,pulse,vip){
  const T=O.time;
  const w=44,h=30,bx=x-w/2,by=y-6-h;
  c.save();
  if(pulse){const s=1+.05*Math.sin(T*12);c.translate(x,y);c.scale(s,s);c.translate(-x,-y);}
  c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=6;c.shadowOffsetY=2;
  c.lineWidth=vip?2:1.4;c.strokeStyle=vip?'#c18a1f':OUT;c.fillStyle=lg(c,0,by,0,by+h,[0,vip?'#fff6d2':'#fbf5e4',1,vip?'#f1dc9a':'#e6dabd']);
  rr(c,bx,by,w,h,8);c.fill();
  c.beginPath();c.moveTo(x-5,by+h-1);c.lineTo(x,y);c.lineTo(x+5,by+h-1);c.fill();
  c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetY=0;
  rr(c,bx,by,w,h,8);c.stroke();
  c.beginPath();c.moveTo(x-5,by+h);c.lineTo(x,y);c.lineTo(x+5,by+h);c.stroke();
  c.fillStyle=vip?'#f6e7b0':'#efe4c9';c.fillRect(x-4.2,by+h-1,8.4,2.6);
  drawWeapon(c,WEAPONS[wi].id,x,by+h/2-2.8,.62,0);
  c.fillStyle='rgba(60,45,20,.28)';rr(c,bx+6,by+h-7,w-12,4,2);c.fill();
  c.fillStyle=frac>.5?'#5fa35a':frac>.25?'#e0a02f':'#d4503a';
  rr(c,bx+6,by+h-7,Math.max(3,(w-12)*Math.max(0,frac)),4,2);c.fill();
  c.restore();
}

/* ---------- arka plan ---------- */
function bricks(c,x,y,w,h,seed,base){
  const R=mulberry(seed);
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
  c.fillStyle='#231f1d';c.fillRect(x,y,w,h);
  for(let yy=y,r=0;yy<y+h;yy+=16,r++){
    for(let xx=x-(r%2)*20;xx<x+w;xx+=40){
      const v=(R()-.5)*.16;
      c.fillStyle=shade(base,v);c.fillRect(xx+1,yy+1,38,14);
      c.fillStyle='rgba(255,255,255,.07)';c.fillRect(xx+1,yy+1,38,2);
      c.fillStyle='rgba(0,0,0,.18)';c.fillRect(xx+1,yy+13,38,2);
    }
  }
  c.restore();
}
function hang(c,id,x,y,s,rot){
  c.fillStyle='rgba(91,61,34,.9)';rr(c,x-12,y-34,24,70,3);c.fill();
  c.strokeStyle=OUT;c.lineWidth=1;c.stroke();
  c.fillStyle='#2a2623';c.beginPath();c.arc(x,y-28,1.8,0,7);c.fill();
  drawWeapon(c,id,x,y,s,rot);
}
function lantern(c,x,y){
  c.save();c.lineWidth=1.2;c.strokeStyle=OUT;
  c.fillStyle='#2f3338';c.fillRect(x-6,y-14,12,3);c.fillRect(x-6,y,12,3);
  const g=c.createRadialGradient(x,y-6,1,x,y-6,8);g.addColorStop(0,'#fff0b0');g.addColorStop(1,'#ffb347');
  c.fillStyle=g;rr(c,x-5,y-11,10,11,2);c.fill();c.stroke();
  c.beginPath();c.arc(x,y-14,4,Math.PI,0);c.stroke();
  c.restore();
}
function on(id){const d=O.DECOR_BY&&O.DECOR_BY[id];return !d||!O.tier||O.tier()>=d.at;}
function buildBackground(c){
  const R=mulberry(11);
  c.fillStyle='#352f2a';c.fillRect(0,0,W,W);
  for(let j=0;j<10;j++)for(let i=0;i<10;i++){
    const v=(R()-.5)*16,x=i*60,y=j*60;
    c.fillStyle='rgb('+Math.round(94+v)+','+Math.round(86+v)+','+Math.round(76+v)+')';
    c.fillRect(x+1.5,y+1.5,57,57);
    c.fillStyle=lg(c,x,y,x+60,y+60,[0,'rgba(255,245,225,.12)',1,'rgba(0,0,0,.16)']);c.fillRect(x+1.5,y+1.5,57,57);
    for(let k=0;k<7;k++){c.fillStyle=R()<.5?'rgba(0,0,0,.10)':'rgba(255,255,255,.07)';c.fillRect(x+3+R()*52,y+3+R()*52,1+R()*2,1+R()*1.6);}
    if(R()<.28){c.strokeStyle='rgba(20,14,10,.35)';c.lineWidth=.9;c.beginPath();let px=x+8+R()*40,py=y+6+R()*10;c.moveTo(px,py);for(let k=0;k<4;k++){px+=(R()-.5)*14;py+=6+R()*8;c.lineTo(px,py);}c.stroke();}
  }
  O.FORGE_X.forEach(function(fx){const g=c.createRadialGradient(fx,150,4,fx,150,80);g.addColorStop(0,'rgba(12,6,2,.38)');g.addColorStop(1,'rgba(12,6,2,0)');c.fillStyle=g;c.fillRect(fx-90,70,180,170);});
  if(on('carpet')){c.fillStyle='#5a2a2c';c.fillRect(34,238,532,25);
  c.fillStyle='rgba(0,0,0,.22)';c.fillRect(34,238,532,2);c.fillRect(34,261,532,2);
  c.strokeStyle='rgba(214,172,84,.55)';c.lineWidth=1.2;c.strokeRect(38,242,524,17);
  c.fillStyle='rgba(214,172,84,.35)';
  for(let x=52;x<552;x+=26){c.beginPath();c.moveTo(x,250.5);c.lineTo(x+5,246);c.lineTo(x+10,250.5);c.lineTo(x+5,255);c.closePath();c.fill();}
  c.fillStyle='#c9a24a';for(let y=239;y<262;y+=3){c.fillRect(30,y,4,1.4);c.fillRect(566,y,4,1.4);}}
  bricks(c,0,0,W,112,3,'#4a4440');
  bricks(c,0,112,12,488,5,'#4a4440');
  bricks(c,588,112,12,488,6,'#4a4440');
  c.save();c.translate(0,-60);
  bricks(c,12,588,250,12,7,'#4a4440');
  bricks(c,338,588,250,12,8,'#4a4440');
  c.restore();
  c.fillStyle=lg(c,0,112,0,150,[0,'rgba(0,0,0,.5)',1,'rgba(0,0,0,0)']);c.fillRect(0,112,W,38);
  c.fillStyle=lg(c,12,0,36,0,[0,'rgba(0,0,0,.35)',1,'rgba(0,0,0,0)']);c.fillRect(12,112,24,476);
  c.fillStyle=lg(c,564,0,588,0,[0,'rgba(0,0,0,0)',1,'rgba(0,0,0,.35)']);c.fillRect(564,112,24,476);
  c.save();c.translate(0,-60);
  c.fillStyle='#6a4a2a';c.fillRect(256,582,8,18);c.fillRect(336,582,8,18);c.fillRect(256,574,88,10);
  c.strokeStyle=OUT;c.lineWidth=1.2;c.strokeRect(256,574,88,10);c.strokeRect(256,582,8,18);c.strokeRect(336,582,8,18);
  c.fillStyle='#6b3a2a';rr(c,270,552,60,20,3);c.fill();c.strokeStyle='rgba(230,190,120,.6)';c.lineWidth=1;c.strokeRect(274,556,52,12);c.restore();
  if(on('shield')){drawWeapon(c,'shield',34,64,1.15,0);}
  if(on('wallw')){hang(c,'sword',170,58,1.15,0);hang(c,'axe',300,58,1.15,0);hang(c,'spear',430,58,1.15,.15);hang(c,'bow',566,58,1.15,0);}
  c.lineWidth=1.4;c.strokeStyle=OUT;
  if(on('trough')){c.fillStyle='#6a625a';rr(c,272,140,56,28,5);c.fill();c.stroke();
  c.fillStyle=lg(c,0,146,0,164,[0,'#5aa0c8',1,'#2f6a94']);rr(c,276,144,48,20,3);c.fill();
  c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1;c.beginPath();c.moveTo(282,150);c.lineTo(296,150);c.moveTo(300,156);c.lineTo(316,156);c.stroke();}
  c.strokeStyle=OUT;c.lineWidth=1.4;
  for(let k=0;k<9;k++){const px=34+(k%4)*10+(k>3?5:0),py=176-Math.floor(k/4)*8;c.beginPath();c.arc(px,py,6.5,0,7);c.fillStyle=k%3?'#25211f':'#33302c';c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.18)';c.fillRect(px-2.4,py-3.4,2.4,1.4);}
  if(on('grind')){c.fillStyle='#6a4a2a';c.fillRect(540,150,6,30);c.fillRect(574,150,6,30);c.fillRect(540,176,40,6);
  c.strokeStyle=OUT;c.strokeRect(540,150,6,30);c.strokeRect(574,150,6,30);
  c.beginPath();c.arc(560,160,14,0,7);c.fillStyle=lg(c,546,0,574,0,[0,'#b8b1a6',1,'#7a746c']);c.fill();c.stroke();
  c.beginPath();c.arc(560,160,3.5,0,7);c.fillStyle='#4a4440';c.fill();c.stroke();}
  c.fillStyle=lg(c,0,362,0,392,[0,'rgba(0,0,0,.4)',1,'rgba(0,0,0,0)']);c.fillRect(68,362,466,30);
  c.fillStyle=lg(c,0,320,0,346,[0,'#c48d55',1,'#9a6636']);rr(c,70,320,460,26,4);c.fill();
  c.strokeStyle='rgba(60,30,10,.35)';c.lineWidth=1.2;
  for(let x=116;x<530;x+=46){c.beginPath();c.moveTo(x,320);c.lineTo(x,346);c.stroke();}
  for(let k=0;k<26;k++){c.strokeStyle='rgba(70,40,15,.18)';c.beginPath();const gx=74+R()*452,gy=322+R()*22;c.moveTo(gx,gy);c.lineTo(gx+10+R()*14,gy+(R()-.5)*1.6);c.stroke();}
  c.fillStyle='rgba(255,235,200,.3)';c.fillRect(72,321,456,2);
  c.fillStyle=lg(c,0,346,0,362,[0,'#8a5a30',1,'#664020']);c.fillRect(70,346,460,16);
  c.strokeStyle=OUT;c.lineWidth=1.4;c.strokeRect(70,320,460,42);
  c.fillStyle='#caa04a';for(let x=80;x<530;x+=40){c.beginPath();c.arc(x,354,1.4,0,7);c.fill();}
  c.font="700 13px 'Alegreya SC', Georgia, serif";c.textAlign='center';c.textBaseline='middle';
  c.fillStyle='rgba(0,0,0,.5)';c.fillText(O.tx('ÖRS DÜKKANI'),300,355.5);
  c.fillStyle='#f6d98a';c.fillText(O.tx('ÖRS DÜKKANI'),300,354.5);
  for(let k=0;k<4;k++){c.beginPath();c.ellipse(142,336-k*3,8,4,0,0,7);c.fillStyle=goldG(c,134,150);c.fill();c.lineWidth=1;c.strokeStyle='#8a6414';c.stroke();}
  for(let k=0;k<3;k++){c.beginPath();c.ellipse(462,336-k*3,8,4,0,0,7);c.fillStyle=goldG(c,454,470);c.fill();c.stroke();}
  c.fillStyle='#e8dcc0';rr(c,296,328,24,10,2);c.fill();c.strokeStyle='#8a7a58';c.stroke();
  if(on('lantern')){lantern(c,96,330);lantern(c,504,330);}
  c.lineWidth=1.4;c.strokeStyle=OUT;
  c.save();c.translate(0,-60);
  [[556,552]].forEach(function(b){
    const gg=c.createRadialGradient(b[0]-6,b[1]-6,3,b[0],b[1],22);gg.addColorStop(0,'#98623a');gg.addColorStop(1,'#6a4020');
    c.beginPath();c.arc(b[0],b[1],20,0,7);c.fillStyle=gg;c.fill();c.stroke();
    c.beginPath();c.arc(b[0],b[1],13,0,7);c.strokeStyle='rgba(40,22,8,.7)';c.stroke();
    c.beginPath();c.arc(b[0],b[1],6,0,7);c.stroke();c.strokeStyle=OUT;
  });
  if(on('storage')){c.fillStyle=lg(c,24,492,62,528,[0,'#9c7040',1,'#6e4a26']);c.fillRect(24,492,38,36);c.strokeRect(24,492,38,36);
  c.strokeStyle='rgba(50,30,10,.8)';c.beginPath();c.moveTo(24,492);c.lineTo(62,528);c.moveTo(62,492);c.lineTo(24,528);c.stroke();
  c.strokeStyle=OUT;c.beginPath();c.ellipse(552,498,15,11,.3,0,7);c.fillStyle='#b8a47a';c.fill();c.stroke();
  c.beginPath();c.ellipse(560,508,13,10,-.2,0,7);c.fillStyle='#a8946a';c.fill();c.stroke();}
  c.restore();
  const g=c.createRadialGradient(300,300,230,300,300,440);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.28)');
  c.fillStyle=g;c.fillRect(0,0,W,W);
}

/* ---------- ocak ve örs ---------- */
function flame(c,bx,by,h,w,sw){c.beginPath();c.moveTo(bx-w,by);c.quadraticCurveTo(bx-w*1.1,by-h*.55,bx+sw,by-h);c.quadraticCurveTo(bx+w*1.1,by-h*.55,bx+w,by);c.closePath();c.fill();}
function drawFurnace(c,f,active){
  const T=O.time,x=f.x;
  c.save();
  if(!active)c.globalAlpha=.55;
  c.lineWidth=1.4;c.strokeStyle=OUT;
  c.fillStyle=lg(c,x-16,0,x+16,0,[0,'#6a6158',1,'#4a433d']);c.fillRect(x-16,0,32,20);
  c.fillStyle=lg(c,x-48,0,x+48,0,[0,'#82786d',.5,'#6a6158',1,'#4f4842']);rr(c,x-48,16,96,88,6);c.fill();c.stroke();
  c.fillStyle='rgba(255,255,255,.08)';c.fillRect(x-46,18,92,3);
  c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=1;
  for(let k=0;k<5;k++){c.beginPath();c.moveTo(x-46,28+k*15);c.lineTo(x+46,28+k*15);c.stroke();}
  for(let k=0;k<5;k++){c.beginPath();c.moveTo(x-34+(k%2)*16+k*14,28);c.lineTo(x-34+(k%2)*16+k*14,100);c.stroke();}
  c.strokeStyle=OUT;c.lineWidth=1.4;
  c.fillStyle='#120b08';
  c.beginPath();c.moveTo(x-30,98);c.lineTo(x-30,64);c.arc(x,64,30,Math.PI,0);c.lineTo(x+30,98);c.closePath();c.fill();
  if(f.heat>.02){
    c.save();
    c.beginPath();c.moveTo(x-30,98);c.lineTo(x-30,64);c.arc(x,64,30,Math.PI,0);c.lineTo(x+30,98);c.closePath();c.clip();
    const gr=c.createLinearGradient(0,98,0,40);
    gr.addColorStop(0,'rgba(255,170,50,'+(.55*f.heat+.2)+')');gr.addColorStop(1,'rgba(255,90,20,0)');
    c.fillStyle=gr;c.fillRect(x-30,40,60,60);
    for(let k=0;k<7;k++){
      const bx=x-24+k*8,fl=Math.sin(T*(7+k*1.3)+k*1.7),h=(12+32*f.heat)*(.7+.3*fl)*(k===3?1.25:1),sw=Math.sin(T*5+k)*3;
      c.fillStyle='#e8541f';flame(c,bx,98,h,6.4,sw);
      c.fillStyle='#ff9b2e';flame(c,bx,98,h*.75,4.6,sw*.8);
      c.fillStyle='#ffe27a';flame(c,bx,98,h*.45,2.8,sw*.5);
    }
    c.fillStyle='rgba(255,140,40,'+(.5+.3*f.heat)+')';
    for(let k=0;k<6;k++){c.beginPath();c.ellipse(x-22+k*9,96,5,2.6,0,0,7);c.fill();}
    c.restore();
  }
  c.strokeStyle='#2a2623';c.lineWidth=2;
  for(let k=0;k<6;k++){c.beginPath();c.moveTo(x-25+k*10,98);c.lineTo(x-25+k*10,86);c.stroke();}
  c.strokeStyle='rgba(255,150,60,'+(.15+.6*f.heat)+')';c.lineWidth=2.4;
  c.beginPath();c.moveTo(x-30,98);c.lineTo(x-30,64);c.arc(x,64,30,Math.PI,0);c.lineTo(x+30,98);c.stroke();
  c.restore();
  if(!active){c.save();c.font="700 11px 'Alegreya Sans', sans-serif";c.textAlign='center';c.fillStyle='rgba(225,215,200,.85)';c.fillText(O.tx('Yeni ocak'),x,62);c.restore();}
}
function drawAnvil(c,f){
  const T=O.time,x=f.x;
  c.lineWidth=1.4;c.strokeStyle=OUT;
  c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x,154,22,6,0,0,7);c.fill();
  c.fillStyle=lg(c,x-14,0,x+14,0,[0,'#9a6a3a',1,'#5e3a1b']);rr(c,x-13,142,26,12,3);c.fill();c.stroke();
  c.strokeStyle='rgba(40,22,8,.6)';c.beginPath();c.moveTo(x-13,148);c.lineTo(x+13,148);c.stroke();c.strokeStyle=OUT;
  c.fillStyle=lg(c,x-8,0,x+8,0,[0,'#4a525c',1,'#2a2f35']);c.fillRect(x-7,134,14,9);c.strokeRect(x-7,134,14,9);
  c.fillStyle=lg(c,0,124,0,134,[0,'#8794a3',1,'#505a66']);c.fillRect(x-18,125,36,9);c.strokeRect(x-18,125,36,9);
  poly(c,[x+18,125,x+33,130,x+18,134],'#5a6470',1);
  c.fillStyle='rgba(255,255,255,.55)';c.fillRect(x-17,126,33,1.6);
  const o=f.order;
  if(!o)return;
  if(o.state==='forging'&&o.p>.01){
    const wp=WEAPONS[o.weapon],p=Math.min(1,o.p/(o.time||wp.time));
    c.save();
    c.globalCompositeOperation='lighter';
    const g=c.createRadialGradient(x,121,2,x,121,24);const ec0=o.cust&&o.cust.ench&&O.ENCH_BY_ID[o.cust.ench],rgb=ec0?hexRgb(ec0.col):'255,150,50';g.addColorStop(0,'rgba('+rgb+','+(.7*p)+')');g.addColorStop(1,'rgba('+rgb+',0)');
    c.fillStyle=g;c.fillRect(x-26,95,52,52);
    c.restore();
    c.save();c.globalAlpha=.4+.6*p;drawWeapon(c,wp.id,x-2,120,.85,Math.PI/2);c.restore();
    c.fillStyle='rgba(0,0,0,.6)';rr(c,x-23,157,46,7,3.5);c.fill();
    c.fillStyle=lg(c,x-22,0,x+22,0,[0,'#ffcf5a',1,'#ef6a2a']);rr(c,x-22,158,Math.max(4,44*p),5,2.5);c.fill();
  }else if(o.state==='ready'){
    const pr=2*Math.sin(T*5);
    const ec=o.cust&&o.cust.ench&&O.ENCH_BY_ID[o.cust.ench];c.strokeStyle=ec?ec.col:'rgba(255,211,107,.95)';c.lineWidth=ec?3:2;c.beginPath();c.arc(x,121,22+pr,0,7);c.stroke();
    if(ec){c.save();c.globalCompositeOperation='lighter';const rg=hexRgb(ec.col),gg=c.createRadialGradient(x,121,2,x,121,26);gg.addColorStop(0,'rgba('+rg+',.6)');gg.addColorStop(1,'rgba('+rg+',0)');c.fillStyle=gg;c.fillRect(x-28,93,56,56);c.restore();}
    drawWeapon(c,WEAPONS[o.weapon].id,x-2,120,.85,Math.PI/2);
  }
}

/* ---------- dükkan seviyesine bağlı dekorlar ---------- */
O.DECOR=[
  {id:'carpet',at:1,name:'Kırmızı halı'},
  {id:'trough',at:2,name:'Su yalağı'},
  {id:'runner',at:2,name:'Tezgâh örtüsü'},
  {id:'rack',at:3,name:'Silah rafı'},
  {id:'lantern',at:3,name:'Tezgâh fenerleri'},
  {id:'grind',at:4,name:'Bileme taşı'},
  {id:'shield',at:5,name:'Duvar kalkanı'},
  {id:'wallw',at:8,name:'Duvar silahları'},
  {id:'torch',at:10,name:'Duvar meşaleleri'},
  {id:'storage',at:12,name:'Sandık ve çuvallar'},
  {id:'trophy',at:16,name:'Altın kılıç kürsüsü'}
];
O.DECOR_BY={};O.DECOR.forEach(function(d){O.DECOR_BY[d.id]=d;});
O.TORCH_POS=[[22,300],[578,300]];
function drawRack(c){
  const x=44,y=396;
  c.lineWidth=1.4;c.strokeStyle=OUT;
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x,y+48,22,6,0,0,7);c.fill();
  c.fillStyle=woodG(c,x-20,x+20);c.fillRect(x-20,y+4,40,5);c.strokeRect(x-20,y+4,40,5);
  c.fillRect(x-20,y+32,40,5);c.strokeRect(x-20,y+32,40,5);
  c.fillRect(x-22,y,5,46);c.strokeRect(x-22,y,5,46);c.fillRect(x+17,y,5,46);c.strokeRect(x+17,y,5,46);
  drawWeapon(c,'sword',x-9,y+18,.95,0);drawWeapon(c,'axe',x+1,y+20,.9,0);drawWeapon(c,'spear',x+11,y+18,.9,0);
}
function drawRunner(c){
  c.fillStyle='#8a2a30';c.fillRect(190,322,220,22);
  c.fillStyle=lg(c,0,322,0,344,[0,'rgba(255,255,255,.12)',1,'rgba(0,0,0,.2)']);c.fillRect(190,322,220,22);
  c.strokeStyle='#e2b048';c.lineWidth=1.4;c.strokeRect(192,324,216,18);
  c.fillStyle='#e2b048';for(let x=196;x<408;x+=16){c.beginPath();c.moveTo(x,332);c.lineTo(x+4,328);c.lineTo(x+8,332);c.lineTo(x+4,336);c.closePath();c.fill();}
  c.fillStyle='#e8dcc0';rr(c,296,326,24,10,2);c.fill();c.strokeStyle='#8a7a58';c.lineWidth=1;c.stroke();
}
function drawTorch(c,x,y){
  const T=O.time;
  c.lineWidth=1.2;c.strokeStyle=OUT;
  c.fillStyle='#3a3a40';c.fillRect(x-4,y,8,16);c.strokeRect(x-4,y,8,16);
  c.fillStyle='#6a4a2a';c.fillRect(x-2,y-6,4,8);
  const k=Math.sin(T*10+x)*.5+.5;
  c.fillStyle='#e8541f';flame(c,x,y-4,16+4*k,5.5,Math.sin(T*6+x)*2);
  c.fillStyle='#ff9b2e';flame(c,x,y-4,11+3*k,3.8,Math.sin(T*6+x)*1.5);
  c.fillStyle='#ffe27a';flame(c,x,y-4,6+2*k,2.2,0);
}
function drawTrophy(c){
  const x=562,y=372;
  c.lineWidth=1.4;c.strokeStyle=OUT;
  c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x,y+26,18,5,0,0,7);c.fill();
  c.fillStyle=lg(c,x-14,0,x+14,0,[0,'#9a6a3a',1,'#5e3a1b']);rr(c,x-14,y+8,28,18,3);c.fill();c.stroke();
  c.fillStyle=goldG(c,x-10,x+10);c.fillRect(x-10,y+12,20,3);c.strokeRect(x-10,y+12,20,3);
  const g=c.createRadialGradient(x,y-12,2,x,y-12,26);g.addColorStop(0,'rgba(255,230,140,.35)');g.addColorStop(1,'rgba(255,230,140,0)');
  c.fillStyle=g;c.fillRect(x-30,y-40,60,60);
  c.save();c.translate(x,y-14);c.scale(1.9,1.9);
  c.lineJoin='round';c.lineWidth=.8;
  poly(c,[0,-20,3.8,-16,3.8,4,-3.8,4,-3.8,-16],goldG(c,-3.8,3.8),1);
  c.fillStyle='#8a5a1a';c.fillRect(-9,4,18,3.4);c.strokeRect(-9,4,18,3.4);
  c.fillStyle='#8a5a1a';c.fillRect(-1.9,7.4,3.8,6);
  c.restore();
}
function drawDecor(c,tier){
  O.DECOR.forEach(function(d){
    if(tier<d.at)return;
    if(d.id==='rack')drawRack(c);
    else if(d.id==='runner')drawRunner(c);
    else if(d.id==='torch')O.TORCH_POS.forEach(function(p){drawTorch(c,p[0],p[1]);});
    else if(d.id==='trophy')drawTrophy(c);
  });
}

/* ---------- gökyüzü ve gün döngüsü ---------- */
const SKY=[
  {p:0,   top:[142,197,232],bot:[205,230,242],dark:.10,st:0},
  {p:.42, top:[142,197,232],bot:[205,230,242],dark:.10,st:0},
  {p:.50, top:[232,147,90], bot:[250,200,120],dark:.30,st:.2},
  {p:.58, top:[18,28,62],   bot:[44,54,96],   dark:.52,st:1},
  {p:.88, top:[18,28,62],   bot:[44,54,96],   dark:.52,st:1},
  {p:.96, top:[240,160,120],bot:[250,210,150],dark:.26,st:.2},
  {p:1,   top:[142,197,232],bot:[205,230,242],dark:.10,st:0}
];
function mix(a,b,t){return a+(b-a)*t;}
O.skyAt=function(p){
  let i=0;while(i<SKY.length-2&&p>SKY[i+1].p)i++;
  const a=SKY[i],b=SKY[i+1],t=Math.max(0,Math.min(1,(p-a.p)/(b.p-a.p)));
  const m=function(x,y){return [mix(x[0],y[0],t),mix(x[1],y[1],t),mix(x[2],y[2],t)];};
  return {top:m(a.top,b.top),bot:m(a.bot,b.bot),dark:mix(a.dark,b.dark,t),st:mix(a.st,b.st,t)};
};
const rgb=a=>'rgb('+Math.round(a[0])+','+Math.round(a[1])+','+Math.round(a[2])+')';
function drawDoor(c,sky){
  const x=264,y=584,w=72,h=16;
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
  c.fillStyle=lg(c,0,y,0,y+h,[0,rgb(sky.top),1,rgb(sky.bot)]);c.fillRect(x,y,w,h);
  if(sky.st>.25){c.fillStyle='rgba(255,255,230,'+(sky.st*.8)+')';[[272,588],[290,592],[306,587],[322,591],[330,586]].forEach(function(s){c.fillRect(s[0],s[1],1.6,1.6);});}
  c.restore();
}

O.drawWeapon=drawWeapon;O.drawPerson=drawPerson;O.drawBubble=drawBubble;
O.buildBackground=buildBackground;O.drawFurnace=drawFurnace;O.drawAnvil=drawAnvil;
O.drawDecor=drawDecor;O.drawDoor=drawDoor;
})(window.Ors=window.Ors||{});
