/* check-eink.js - every icon in data/icons.json has its own drawing, black on white only, and the screen's files are current (470). node js/check-eink.js [-v] */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const V = process.argv.includes('-v') || process.env.VERBOSE === '1';
const bad = [];
let rows = [];
try { rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'icons.json'), 'utf8')); } catch (e) { console.error('check-eink: cannot read data/icons.json: ' + e.message); process.exit(1); }
if (!Array.isArray(rows) || rows.length < 50) { console.error('check-eink: data/icons.json has ' + (rows && rows.length) + ' rows, not the icon database'); process.exit(1); }
const ids = new Set();
const OK_PAINT = /^(#000|#fff|none)$/i;
for (const r of rows) {
  const say = (r && r.id) || '(no id)';
  if (!r || !r.id || ids.has(r.id)) { bad.push(say + ': no id, or the id twice'); continue; }
  ids.add(r.id);
  const s = String(r.svg || '');
  if (!/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 120 160"[^>]*>[\s\S]*<\/svg>$/.test(s)) { bad.push(say + ': no 120x160 svg'); continue; }
  const opens = (s.match(/<(svg|g|text)\b[^>]*[^/]>/g) || []).length, closes = (s.match(/<\/(svg|g|text)>/g) || []).length;
  if (opens !== closes) bad.push(say + ': ' + opens + ' elements opened and ' + closes + ' closed');
  for (const m of s.matchAll(/\b(fill|stroke|color|stop-color|flood-color)="([^"]*)"/g)) if (!OK_PAINT.test(m[2])) bad.push(say + ': ' + m[1] + '="' + m[2] + '" is not black, white or none');
  if (/opacity|gradient|<image|<filter|<pattern|style=|rgba?\(|hsla?\(/i.test(s)) bad.push(say + ': transparency, a gradient, an image, a filter or a style — none of these is 1-bit');
  if ((s.match(/<(path|circle|ellipse|rect)\b/g) || []).length < 12) bad.push(say + ': too few marks to be a drawing of the icon');
}
let gen;
try { gen = require(path.join(ROOT, 'tools', 'epaper-verse', 'icon-svgs.js')); } catch (e) { bad.push('tools/epaper-verse/icon-svgs.js does not load: ' + e.message); }
if (gen) {
  const stale = rows.filter(r => { try { return r.svg !== gen.svgFor(r); } catch (e) { return true; } });
  if (stale.length) bad.push(stale.length + ' drawings are not what icon-svgs.js writes (' + stale.slice(0, 3).map(r => r.id).join(', ') + ') — run node tools/epaper-verse/icon-svgs.js');
  let v = '';
  try { v = fs.readFileSync(path.join(ROOT, 'data', 'eink-verses.json'), 'utf8'); } catch (e) {}
  if (v !== gen.versesText()) bad.push('data/eink-verses.json is not verse.cpp\'s verses — run node tools/epaper-verse/icon-svgs.js');
}
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
console.log('OK — ' + rows.length + ' icons each drawn in black and white, and the e-ink files are current' + (V ? ' (' + [...ids].join(', ') + ')' : ''));
