#!/usr/bin/env node
/* Hızlı kontrol: bütün JS dosyalarının sözdizimi ve index.html'deki dosya bağlantıları. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const www = path.join(__dirname, '..', 'www');
const html = fs.readFileSync(path.join(www, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g)].map((m) => m[1]);
let bad = 0;
refs.forEach((r) => {
  const p = path.join(www, r);
  if (!fs.existsSync(p)) { console.error('Eksik dosya: ' + r); bad++; return; }
  if (r.endsWith('.js')) {
    try { execFileSync(process.execPath, ['--check', p], { stdio: 'pipe' }); console.log('ok  ' + r); }
    catch (e) { console.error('HATA ' + r + '\n' + e.stderr); bad++; }
  } else console.log('ok  ' + r);
});
process.exit(bad ? 1 : 0);
