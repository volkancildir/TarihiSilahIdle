#!/usr/bin/env node
/* `cap add android` sonrası çalıştırılır: oyunu dikey yönde kilitler.
   Kullanım: node tools/patch-android.js [manifest-yolu] */
const fs = require('fs');
const path = require('path');

const manifest = process.argv[2] || path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (!fs.existsSync(manifest)) {
  console.error('AndroidManifest.xml bulunamadı: ' + manifest + '\nÖnce "npx cap add android" çalıştırın.');
  process.exit(1);
}
let xml = fs.readFileSync(manifest, 'utf8');
if (/android:screenOrientation=/.test(xml)) {
  console.log('screenOrientation zaten tanımlı, değişiklik yapılmadı.');
  process.exit(0);
}
const out = xml.replace(/<activity\b/, '<activity\n            android:screenOrientation="portrait"');
if (out === xml) {
  console.error('<activity> etiketi bulunamadı, manifest elle düzenlenmeli.');
  process.exit(1);
}
fs.writeFileSync(manifest, out);
console.log('Dikey yön kilidi eklendi: ' + manifest);
