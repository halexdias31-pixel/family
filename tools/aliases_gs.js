#!/usr/bin/env node
/* WRITES data/settings/question-aliases.json into js/qaliases.js; tools/cards-gen.js copies it and qAliasMine_ to the backend. tools/build.js runs it. */
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
function run() {
  const t = want().js, was = fs.readFileSync(JS, 'utf8');
  if (t !== was) fs.writeFileSync(JS, t);
  console.log('aliases_gs: ' + (t !== was ? 'wrote' : 'unchanged') + ' js/qaliases.js');
}
module.exports = { want, run };
if (require.main === module) run();
