#!/usr/bin/env node
/* WRITES data/settings/question-aliases.json into js/qaliases.js; tools/cards-gen.js copies it and qAliasMine_ to the backend. `--check` only compares. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const JS = path.join(ROOT, 'js', 'qaliases.js');
const B = '/* ---------- QALIAS (generated) ---------- */\n', E = '/* ---------- END QALIAS ---------- */\n';

function mapSrc() {
  const a = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'question-aliases.json'), 'utf8')).aliases || {};
  const slim = {};
  Object.keys(a).sort().forEach(k => { slim[k] = a[k].slot === undefined ? { to: a[k].to } : { to: a[k].to, slot: a[k].slot, of: a[k].of }; });
  return 'const QALIAS = ' + JSON.stringify(slim) + ';\n';
}
const put = (src, b, e, body) => {
  const i = src.indexOf(b), j = src.indexOf(e);
  return i !== -1 && j > i ? src.slice(0, i) + b + body + src.slice(j) : src.replace(/\n*$/, '\n\n') + b + body + e;
};
function want() {
  const js = put(fs.readFileSync(JS, 'utf8'), B, E, mapSrc());
  return { js };
}
module.exports = { want };
if (require.main === module) {
  const w = want();
  const stale = [[JS, w.js]].filter(([f, t]) => fs.readFileSync(f, 'utf8') !== t);
  if (process.argv.includes('--check')) {
    if (stale.length) { console.log('✗ stale: ' + stale.map(s => path.relative(ROOT, s[0])).join(', ') + ' (node tools/aliases_gs.js)'); process.exit(1); }
    console.log('✓ aliases copied'); process.exit(0);
  }
  stale.forEach(([f, t]) => fs.writeFileSync(f, t));
  console.log('wrote ' + stale.length + ' file(s)');
}
