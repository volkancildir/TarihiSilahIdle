#!/usr/bin/env python3
"""Play Store için 1080x1920 ekran görüntüleri alır (Playwright + Chromium gerekir)."""
import os
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL='file://'+os.path.join(ROOT,'www','index.html')
OUT=os.path.join(ROOT,'store'); os.makedirs(OUT,exist_ok=True)
SETUP="""(n)=>{Ors.resetAll();const G=Ors.getG();G.gold=4000;
 Ors.buy('carrier',5);Ors.buy('smith',4);Ors.buy('forge',2);Ors.buy('recipe',4);Ors.buy('counter',2);Ors.buy('hammer',3);Ors.buy('ads',3);
 G.gold=n.gold;G.total=n.total;G.runTotal=n.run;G.served=n.served;G.prestiges=n.pres;G.seals=n.seals;
 for(let i=0;i<60*n.sim;i++)Ors.step(1/60);
 document.getElementById('toast').hidden=true;}"""
shots=[
 ('1-dukkan-gunduz','workers',dict(gold=1480,total=3200,run=3200,served=64,pres=0,seals=0,sim=45)),
 ('2-dukkan-gece','shop',dict(gold=5200,total=9000,run=9000,served=140,pres=0,seals=0,sim=125)),
 ('3-oduller','rewards',dict(gold=820,total=5000,run=5000,served=90,pres=0,seals=0,sim=50)),
 ('4-muhur','seal',dict(gold=2400,total=26000,run=26000,served=380,pres=1,seals=2,sim=60)),
]
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,tab,st in shots:
        ctx=b.new_context(viewport={'width':540,'height':960},device_scale_factor=2,is_mobile=True,has_touch=True,locale='tr-TR')
        pg=ctx.new_page(); pg.goto(URL); pg.wait_for_timeout(600)
        pg.evaluate(SETUP,st); pg.evaluate("()=>{Ors.blockChapters=true;const m=document.getElementById('modal');m.hidden=true}"); pg.click('#tab-'+tab); pg.wait_for_timeout(900)
        pg.evaluate("()=>{const m=document.getElementById('modal');if(!m.hidden)document.querySelector('#m-btns button').click();document.getElementById('toast').hidden=true}")
        pg.screenshot(path=os.path.join(OUT,'screenshot-'+name+'.png')); ctx.close()
    b.close()
print(sorted(f for f in os.listdir(OUT)))
