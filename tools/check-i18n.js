#!/usr/bin/env node
/* Çeviri denetimi:
   1) i18n.js içindeki her Türkçe anahtar kaynak kodlarda gerçekten geçiyor mu (yazım hatası bulur)
   2) Kaynaklardaki Türkçe harf içeren her metin İngilizceye çevrilince hâlâ Türkçe harf içeriyor mu (eksik çeviri bulur) */
const fs = require('fs');
const path = require('path');
const www = path.join(__dirname, '..', 'www');
global.window = {}; global.localStorage = { getItem: () => 'en', setItem() {} };
global.navigator = { language: 'en' };
['data', 'chapters', 'content', 'i18n'].forEach((f) => require(path.join(www, 'js', f + '.js')));
const O = window.Ors;
const files = ['data', 'chapters', 'content', 'game', 'ui', 'services', 'art'].map((f) => path.join(www, 'js', f + '.js')).concat([path.join(www, 'index.html')]);
const src = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n').replace(/\\'/g, "'");
let bad = 0;
O.i18nPairs.forEach(([k]) => { if (!src.includes(k)) { console.log('KAYNAKTA YOK: ' + JSON.stringify(k)); bad++; } });
const TR = /[çğıöşüÇĞİÖŞÜ]/;
const seen = new Set();
const lit = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`([^`]*)`/g;
let m;
const text = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
while ((m = lit.exec(text))) {
  const t = (m[1] ?? m[2] ?? m[3] ?? '').replace(/\\'/g, "'");
  if (!TR.test(t) || seen.has(t)) continue;
  /* ' parça', ' mührün olsun' gibi başı boşluklu parçalar kurallarla birleşik cümle olarak çevrilir; yorum metinleri de atlanır */
  if (t.startsWith(' ') || t.startsWith("'de ") || t.startsWith('sağlayıcı')) continue;
  seen.add(t);
  if (/^(.*font|\s*)$/.test(t) || /<\/?[a-z]/i.test(t) && !/>[^<]*[çğıöşüÇĞİÖŞÜ]/.test(t)) continue;
  const o = O.txHTML(O.tx(t));
  if (TR.test(o)) { console.log('ÇEVRİLMEMİŞ: ' + JSON.stringify(t).slice(0, 120) + '  →  ' + JSON.stringify(o).slice(0, 80)); bad++; }
}
console.log(bad ? bad + ' sorun' : 'Çeviri denetimi temiz');
process.exit(bad ? 1 : 0);
