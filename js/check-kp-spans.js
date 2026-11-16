/* @family. — check-kp-spans.js: every key width the keypad asks for has its grid rule in style.css.
   A width of 8 had no `.kp-s8`, so those keys shrank to one column and the letters' rows slid out of line on the iPad (owner photo, 16 Nov). */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const js = fs.readdirSync(path.join(root, 'js')).filter(f => /^keypad-.*\.js$/.test(f))
  .map(f => fs.readFileSync(path.join(root, 'js', f), 'utf8')).join('\n');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const asked = new Set();
(js.match(/span:\s*\d+/g) || []).forEach(m => asked.add(+m.replace(/\D/g, '')));
const tops = js.match(/KP_ABC_TOP_SPAN\s*=\s*\[([^\]]*)\]/);
if (tops) tops[1].split(',').forEach(n => asked.add(+n));
(js.match(/kpCh_\([^)]*?,\s*(\d+)\s*\)/g) || []).forEach(m => asked.add(+m.match(/(\d+)\s*\)$/)[1]));
const missing = [...asked].filter(n => n > 1 && !new RegExp('\\.kp-key\\.kp-s' + n + '\\s*\\{\\s*grid-column:\\s*span ' + n + ';').test(css));
if (missing.length) {
  console.log('FAILED — keypad key width(s) with no grid rule in style.css: ' + missing.map(n => '.kp-s' + n).join(', '));
  process.exit(1);
}
console.log('OK — every keypad key width (' + [...asked].sort((a, b) => a - b).join(', ') + ') has its grid rule.');
