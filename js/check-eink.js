/* check-eink.js - every icon in data/icons.json is its public-domain image, a 120x160 1-bit PNG byte for byte its pictures.h bitmap (483); the screen's files are current (470). node js/check-eink.js [-v] */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const V = process.argv.includes('-v') || process.env.VERBOSE === '1';
const bad = [];
let rows = [];
try { rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'icons.json'), 'utf8')); } catch (e) { console.error('check-eink: cannot read data/icons.json: ' + e.message); process.exit(1); }
if (!Array.isArray(rows) || rows.length < 50) { console.error('check-eink: data/icons.json has ' + (rows && rows.length) + ' rows, not the icon database'); process.exit(1); }
const ids = new Set();
const zlib = require('zlib');
const rd0 = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
const PICS = [];   // pictures.h decoded: PIC_k's bytes and the id in its comment
try {
  for (const m of fs.readFileSync(path.join(ROOT, 'tools', 'epaper-verse', 'pictures.h'), 'utf8').matchAll(/const uint8_t PIC_(\d+)\[\] PROGMEM = \{  \/\/ (\S+)\n([\s\S]*?)\};/g))
    PICS[+m[1]] = { id: m[2], bytes: Buffer.from(m[3].match(/0x[0-9a-f]{2}/g).map(h => parseInt(h, 16))) };
} catch (e) {}
if (PICS.length !== rows.length) bad.push('pictures.h has ' + PICS.length + ' icons for ' + rows.length + ' rows — run node tools/epaper-verse/make-icons.js');
/* A PNG whose every pixel is #000 or #fff: grey at 1 bit, or a palette of black and white only; decoded through to the last row. */
function oneBit_(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32BE(0) !== 0x89504e47) return 'not a PNG';
  let o = 8, w = 0, h = 0, depth = 0, type = 0, lace = 0, pal = null; const idat = [];
  while (o < b.length) {
    const n = b.readUInt32BE(o), t = b.toString('latin1', o + 4, o + 8), d = b.subarray(o + 8, o + 8 + n);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; type = d[9]; lace = d[12]; }
    if (t === 'PLTE') pal = d; if (t === 'IDAT') idat.push(d); if (t === 'tRNS') return 'has transparency';
    o += 12 + n;
  }
  if (lace) return 'interlaced';
  if (type === 3) { for (let i = 0; i < pal.length; i += 3) { const c = pal[i] + pal[i + 1] + pal[i + 2]; if (c !== 0 && c !== 765) return 'a palette colour that is not black or white'; } }
  else if (!(type === 0 && depth === 1)) return 'colour type ' + type + ' at ' + depth + ' bits, not 1-bit black and white';
  if (depth > 1 && type === 3) return 'palette deeper than 1 bit';
  let raw; try { raw = zlib.inflateSync(Buffer.concat(idat)); } catch (e) { return 'pixels do not inflate'; }
  if (raw.length !== h * (1 + Math.ceil(w / 8))) return 'pixel data is ' + raw.length + ' bytes for ' + w + 'x' + h;
  if (w !== 120 || h !== 160 || type !== 0) return w + 'x' + h + ' (type ' + type + '), not the screen\'s 120x160 1-bit grey';
  const st = 16, out = Buffer.alloc(160 * 15);   // unfiltered rows, as drawBitmap bytes (1 = black)
  for (let y = 0; y < 160; y++) {
    const f = raw[y * st], row = raw.subarray(y * st + 1, y * st + st), up = y ? out.subarray((y - 1) * 15, y * 15).map(v => ~v & 255) : Buffer.alloc(15);
    for (let x = 0; x < 15; x++) {
      const a = x ? (~out[y * 15 + x - 1] & 255) : 0, b = up[x], c = x && y ? (~out[(y - 1) * 15 + x - 1] & 255) : 0, p = a + b - c;
      const pr = f === 0 ? 0 : f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : (Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c);
      out[y * 15 + x] = ~((row[x] + pr) & 255) & 255;
    }
  }
  return out;
}
for (const r of rows) {
  const say = (r && r.id) || '(no id)';
  if (!r || !r.id || ids.has(r.id)) { bad.push(say + ': no id, or the id twice'); continue; }
  ids.add(r.id);
  /* WIDGET == SCREEN (483): every icon's 120x160 1-bit PNG, which the widget draws, is byte for byte the PIC in pictures.h. */
  const k = rows.indexOf(r), png = path.join(ROOT, 'data', 'icons', '120', r.id + '.png');
  const got = fs.existsSync(png) ? oneBit_(png) : 'missing — run node tools/epaper-verse/make-icons.js';
  if (typeof got === 'string') bad.push(say + ': data/icons/120/' + r.id + '.png ' + got);
  else if (!PICS[k] || !got.equals(PICS[k].bytes) || PICS[k].id !== r.id) bad.push(say + ': data/icons/120/' + r.id + '.png is not PIC_' + k + ' of pictures.h — run node tools/epaper-verse/make-icons.js');
  /* A REAL ICON OR NONE (483): the owner — "Don't use those abstract recreations, delete them." */
  const src = r.image_source || {};
  if (r.image !== 'data/icons/120/' + r.id + '.png') bad.push(say + ': image is ' + r.image + ', not data/icons/120/' + r.id + '.png');
  if (!/^File:/.test(src.file || '') || !/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(src.url || '') || !/^(Public domain|PD|CC0)/i.test(src.licence || '')) bad.push(say + ': no public-domain Commons source recorded (image_source file, licence, url) — an icon without one is left out');
  if ('svg' in r) bad.push(say + ': carries a drawing — icons are the real image only');
}
let gen;
try { gen = require(path.join(ROOT, 'tools', 'epaper-verse', 'verses.js')); } catch (e) { bad.push('tools/epaper-verse/verses.js does not load: ' + e.message); }
if (gen) {
  let v = '';
  try { v = fs.readFileSync(path.join(ROOT, 'data', 'eink-verses.json'), 'utf8'); } catch (e) {}
  if (v !== gen.versesText()) bad.push('data/eink-verses.json is not verse.cpp\'s verses — run node tools/epaper-verse/verses.js');
}
for (const f of ['js/records.js', 'tools/epaper-verse/make-icons.js']) if (/\b(ic|row)\.svg\b|encodeURIComponent\((ic|row)\.svg/.test(rd0(f))) bad.push(f + ' still draws an icon from an svg — icons are the real image only (483)');
/* WHAT IS DESIGNED IS WHAT SHOWS (482): the widget draws the screen's 200x200 with verse.cpp's fonts and layout numbers, and the published .bin is the program that listens. */
const EP = path.join(ROOT, 'tools', 'epaper-verse');
const rd = f => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return ''; } };
const cpp = rd(path.join(EP, 'verse.cpp')), rec = rd(path.join(ROOT, 'js', 'records.js'));
let fonts = {};
try { fonts = JSON.parse(rd(path.join(ROOT, 'data', 'eink-fonts.json'))); } catch (e) {}
for (const n of ['FreeSerif12pt7b', 'FreeSerif9pt7b', 'FreeSerifItalic9pt7b']) {
  const f = fonts[n];
  if (!new RegExp('#include <Fonts/' + n + '\\.h>').test(cpp)) bad.push('verse.cpp no longer uses ' + n + ' — the widget would draw a different font');
  if (!f || f.first !== 32 || f.last !== 126 || !Array.isArray(f.glyphs) || f.glyphs.length !== 95 || !f.bitmap) bad.push('data/eink-fonts.json lacks ' + n + ' — run node tools/epaper-verse/gfx-fonts.js');
}
for (const k of ['M = 8, W = 200 - 2 * M, REF_TOP = 176', 'lineH[] = { 24, 18 }', 'drawFastHLine(70, REF_TOP, 60', 'drawBitmap((200 - PIC_W) / 2, 4', '(200 - textWidth(t)) / 2), 192'])
  if (cpp.indexOf(k) < 0) bad.push('verse.cpp changed "' + k + '" — change einkPage_ (js/records.js) to match, then this line');
for (const k of ['M = 8, W = 200 - 2 * M, REF_TOP = 176', 'lineH = [24, 18]', 'x = 70; x < 130', 'einkDot_(px, 40 + x, 4 + y)', '(200 - einkWidth_(ital, t)) / 2)), 192'])
  if (rec.indexOf(k) < 0) bad.push('js/records.js einkPage_ lost "' + k + '" — it must draw as verse.cpp does');
if (!/ARDUINO_USB_CDC_ON_BOOT=1/.test(rd(path.join(EP, 'platformio.ini')))) bad.push('tools/epaper-verse/platformio.ini is missing or does not build USB CDC on boot');
const bin = (() => { try { return fs.readFileSync(path.join(EP, 'epaper-verse.bin')); } catch (e) { return Buffer.alloc(0); } })();
if (bin[0] !== 0xe9 || bin[0x8000] !== 0xaa || bin[0x10000] !== 0xe9) bad.push('epaper-verse.bin is not a merged image (bootloader at 0, partitions at 0x8000, app at 0x10000) — run tools/epaper-verse/build.sh');
if (bin.indexOf('READY epaper-verse 482') < 0) bad.push('epaper-verse.bin predates 482 (it does not stay awake for Sync) — run tools/epaper-verse/build.sh');
/* THE WIDGET STAYS IN THE WIDGET: nothing on the site links to the install page again. */
for (const f of fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js') && !/^check/.test(f))) {
  if (/epaper-verse\/install\.html/.test(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'))) bad.push('js/' + f + ' links to epaper-verse/install.html — the screen is the widget (470)');
}
if (bad.length) { console.error('check-eink: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
if (bad.length) { console.error('check-eink: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('OK — ' + rows.length + ' icons, each its public-domain image as the screen\'s 1-bit 120x160, and the e-ink files are current' + (V ? ' (' + [...ids].join(', ') + ')' : ''));
