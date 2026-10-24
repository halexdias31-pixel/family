/* @family. — check-markers.js: no half-finished merge in any tracked file.
   A conflict line (seven <, = or > at the start of a line) slipped into style.css once and every check stayed green (405). */
const { execSync } = require('child_process');
const path = require('path');
const root = path.join(__dirname, '..');
const pat = '^(<{7} |={7}$|>{7} )';
let hits = '';
try { hits = execSync(`git grep -nE '${pat}' -- . ':!*.png' ':!*.jpg'`, { cwd: root, encoding: 'utf8' }); }
catch (e) { if (e.status !== 1) { console.log('FAILED — git grep could not run: ' + e.message); process.exit(1); } }
const lines = hits.split('\n').filter(Boolean);
if (lines.length) {
  console.log('FAILED — ' + lines.length + ' merge-conflict line(s) left in tracked files:');
  lines.slice(0, 40).forEach(l => console.log('  ' + l));
  process.exit(1);
}
console.log('OK — no merge-conflict lines in any tracked file.');
