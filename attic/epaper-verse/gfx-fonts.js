/* gfx-fonts.js - verse.cpp's three Adafruit GFX fonts into data/eink-fonts.json, so the widget draws the screen's pixels (482). */
/* node tools/epaper-verse/gfx-fonts.js <$OUT/libdeps/epaper-verse/Adafruit GFX Library/Fonts> — build.sh fetches it. BSD, NOTICE.txt. */
'use strict';
const fs = require('fs'), path = require('path');
const NAMES = ['FreeSerif12pt7b', 'FreeSerif9pt7b', 'FreeSerifItalic9pt7b'];   // verse.cpp's #includes, in its order
const dir = process.argv[2];
if (!dir) { console.error('usage: node tools/epaper-verse/gfx-fonts.js <Adafruit GFX Library>/Fonts'); process.exit(1); }
const out = {};
for (const n of NAMES) {
  const s = fs.readFileSync(path.join(dir, n + '.h'), 'utf8');
  const bm = s.slice(s.indexOf('Bitmaps[]'), s.indexOf('};', s.indexOf('Bitmaps[]'))).match(/0x[0-9A-Fa-f]{2}/g).map(h => parseInt(h, 16));
  const gs = s.slice(s.indexOf('Glyphs[]'), s.indexOf('};', s.indexOf('Glyphs[]')));
  const glyphs = [...gs.matchAll(/\{\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)\s*\}/g)].map(m => m.slice(1, 7).map(Number));
  const tail = s.slice(s.indexOf('const GFXfont'));
  const [first, last, yAdvance] = tail.match(/0x[0-9A-Fa-f]+|\b\d+\b(?=\s*\})/g).slice(-3).map(x => parseInt(x));
  if (glyphs.length !== last - first + 1) throw new Error(n + ': ' + glyphs.length + ' glyphs for ' + first + '..' + last);
  out[n] = { first, last, yAdvance, bitmap: Buffer.from(bm).toString('base64'), glyphs };   // glyph = [offset, w, h, xAdvance, xOffset, yOffset]
}
fs.writeFileSync(path.join(__dirname, '..', '..', 'data', 'eink-fonts.json'), JSON.stringify(out) + '\n');
console.log('data/eink-fonts.json: ' + NAMES.join(', '));
