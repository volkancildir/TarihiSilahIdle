#!/usr/bin/env node
/* www/ klasörünü tek dosyalık önizlemeye çevirir: dist/preview.html
   (Capacitor paketi için gerekmez; sadece paylaşım ve hızlı deneme içindir.) */
const fs = require('fs');
const path = require('path');

const www = path.join(__dirname, '..', 'www');
const html = fs.readFileSync(path.join(www, 'index.html'), 'utf8');
const read = (p) => fs.readFileSync(path.join(www, p), 'utf8');

let css = (read('css/style.css') + '\n' + read('css/skin-wood.css') + '\n' + read('css/skin-parch.css')).replace(/max\(12px,/g, 'max(16px,');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => read(m[1])).join('\n');
const body = html.match(/<body>([\s\S]*?)<script src=/)[1];
const fonts = html.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]+>/)[0];

const out = [
  '<title>Örs Dükkanı</title>',
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  fonts,
  '<style>', css, '</style>',
  body.trim(),
  '<script>', scripts.replace(/<\/script>/g, '<\\/script>'), '</script>',
  ''
].join('\n');

const dist = path.join(__dirname, '..', 'dist');
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'preview.html'), out);
console.log('dist/preview.html yazıldı (' + Math.round(out.length / 1024) + ' KB)');
