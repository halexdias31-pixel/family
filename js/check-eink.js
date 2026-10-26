/* check-eink.js - every icon in data/icons.json has its real image as a 1-bit PNG with a public-domain source (479), or a listed fallback drawing; black on white only, and the screen's files are current (470). node js/check-eink.js [-v] */
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
/* Icons Commons has no public-domain copy of: these alone keep a drawing (479). Adding one here is a decision, not a fix. */
const FALLBACK = new Set(require(path.join(ROOT, 'tools', 'epaper-verse', 'fallbacks.json')));
const zlib = require('zlib');
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
  if (w > 640 || h > 504 || w < 200 || h < 200) return w + 'x' + h + ' does not fit the panel\'s icon area (640x504) or is too small to be the icon';
  return '';
}
for (const r of rows) {
  const say = (r && r.id) || '(no id)';
  if (!r || !r.id || ids.has(r.id)) { bad.push(say + ': no id, or the id twice'); continue; }
  ids.add(r.id);
  if (r.image) {
    const src = r.image_source || {};
    if (r.image !== 'data/icons/' + r.id + '.png') bad.push(say + ': image is ' + r.image + ', not data/icons/' + r.id + '.png');
    else if (!fs.existsSync(path.join(ROOT, r.image))) bad.push(say + ': ' + r.image + ' is missing');
    else { const e = oneBit_(path.join(ROOT, r.image)); if (e) bad.push(say + ': ' + r.image + ' — ' + e); }
    if (!/^File:/.test(src.file || '') || !/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(src.url || '') || !/^(Public domain|PD|CC0)/i.test(src.licence || '')) bad.push(say + ': no public-domain Commons source recorded (image_source file, licence, url)');
    if ('svg' in r) bad.push(say + ': has its real image and a drawing too — run node tools/epaper-verse/icon-svgs.js');
    if (FALLBACK.has(r.id)) bad.push(say + ': has its real image but is still listed in fallbacks.json');
    continue;
  }
  if (!FALLBACK.has(r.id)) bad.push(say + ': no real image and not listed in tools/epaper-verse/fallbacks.json');
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
  const stale = rows.filter(r => !r.image).filter(r => { try { return r.svg !== gen.svgFor(r); } catch (e) { return true; } });
  if (stale.length) bad.push(stale.length + ' drawings are not what icon-svgs.js writes (' + stale.slice(0, 3).map(r => r.id).join(', ') + ') — run node tools/epaper-verse/icon-svgs.js');
  let v = '';
  try { v = fs.readFileSync(path.join(ROOT, 'data', 'eink-verses.json'), 'utf8'); } catch (e) {}
  if (v !== gen.versesText()) bad.push('data/eink-verses.json is not verse.cpp\'s verses — run node tools/epaper-verse/icon-svgs.js');
}
/* THE WIDGET STAYS IN THE WIDGET: nothing on the site links to the install page again. */
for (const f of fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js') && !/^check/.test(f))) {
  if (/epaper-verse\/install\.html/.test(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'))) bad.push('js/' + f + ' links to epaper-verse/install.html — the screen is the widget (470)');
}
if (bad.length) { console.error('check-eink: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
const real = rows.filter(r => r.image).length;
for (const f of FALLBACK) if (!ids.has(f)) bad.push('fallbacks.json lists ' + f + ', which is not an icon');
if (bad.length) { console.error('check-eink: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('OK — ' + rows.length + ' icons in black and white (' + real + ' the real image, ' + (rows.length - real) + ' a fallback drawing), and the e-ink files are current' + (V ? ' (' + [...ids].join(', ') + ')' : ''));
