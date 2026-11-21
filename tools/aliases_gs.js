#!/usr/bin/env node
/* WRITES data/settings/question-aliases.json into js/qaliases.js; tools/cards-gen.js copies it and qAliasMine_ to the backend. tools/build.js runs it. */
const fs = require('fs'), path = require('path');
const { ROOT, blockInto, writeIfChanged } = require('./lib/gen.js');
const JS = path.join(ROOT, 'js', 'qaliases.js');
const B = '/* ---------- QALIAS (generated) ---------- */\n', E = '/* ---------- END QALIAS ---------- */\n';

function mapSrc() {
  const a = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'question-aliases.json'), 'utf8')).aliases || {};
  const slim = {};
  Object.keys(a).sort().forEach(k => { slim[k] = a[k].slot === undefined ? { to: a[k].to } : { to: a[k].to, slot: a[k].slot, of: a[k].of }; });
  return 'const QALIAS = ' + JSON.stringify(slim) + ';\n';
}
function want() {
  const js = blockInto(fs.readFileSync(JS, 'utf8'), B, E, mapSrc());
  return { js };
}
function run() {
  const wrote = writeIfChanged(JS, want().js);
  console.log('aliases_gs: ' + (wrote ? 'wrote' : 'unchanged') + ' js/qaliases.js');
}
module.exports = { want, run };
if (require.main === module) run();
