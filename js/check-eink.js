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
/* THE WIDGET STAYS IN THE WIDGET: nothing on the site links to the install page again. */
for (const f of fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js') && !/^check/.test(f))) {
  if (/epaper-verse\/install\.html/.test(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'))) bad.push('js/' + f + ' links to epaper-verse/install.html — the screen is the widget (470)');
}
if (bad.length) { console.error('check-eink: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('OK — ' + rows.length + ' icons each drawn in black and white, and the e-ink files are current' + (V ? ' (' + [...ids].join(', ') + ')' : ''));
