#!/usr/bin/env node
/* @family. — tools/bundle.js ONE FILE PER BATCH, SO A RETURN VISIT RE-ASKS 3 URLS, NOT ~56 (owner, 12 Nov, history 1211). */
/* Concatenates js/ in index.html's FILES order into bundle/first.js (EAGER), bundle/later.js (LATER less LAZY) and bundle/lazy.js (LAZY); OFF never. */
/* The js/ files stay the source; edit those. build-stamp.js runs this first. `--check`: write nothing, exit 1 when a bundle is stale. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'bundle');

function list_(html, name) {
  const m = new RegExp('window\\.' + name + '\\s*=\\s*\\[([\\s\\S]*?)\\]').exec(html);
  if (!m) throw new Error('index.html has no window.' + name + ' list');
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}

/* THE SAME THREE LISTS index.html AND data.js's batchFiles_ WORK OUT, each in FILES' order (that list is the load order). */
function batches() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const FILES = list_(html, 'FILES'), LATER = list_(html, 'LATER'), LAZY = list_(html, 'LAZY'), OFF = list_(html, 'OFF');
  const on = f => OFF.indexOf(f) === -1;
  return {
    first: FILES.filter(f => LATER.indexOf(f) === -1 && on(f)),
    later: FILES.filter(f => LATER.indexOf(f) !== -1 && LAZY.indexOf(f) === -1 && on(f)),
    lazy: FILES.filter(f => LAZY.indexOf(f) !== -1 && on(f)),
  };
}

/* PLAIN CONCATENATION: one global scope, as the separate tags were. The newline before `;` survives a file ending in a `//` comment. */
function text(files) {
  return files.map(f => '/* ==== js/' + f + '.js ==== */\n' + fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8') + '\n;\n').join('');
}

function run(check) {
  const b = batches(), stale = [];
  if (!check) fs.mkdirSync(OUT, { recursive: true });
  for (const k of Object.keys(b)) {
    const file = path.join(OUT, k + '.js'), want = text(b[k]);
    let have = null;
    try { have = fs.readFileSync(file, 'utf8'); } catch (e) { /* not written yet */ }
    if (have === want) continue;
    if (check) stale.push('bundle/' + k + '.js');
    else fs.writeFileSync(file, want);
  }
  return { b, stale };
}

module.exports = { run, batches };

if (require.main === module) {
  const check = process.argv.includes('--check');
  const { b, stale } = run(check);
  const n = Object.keys(b).map(k => k + ' ' + b[k].length).join(', ');
  if (check && stale.length) { console.error('FAIL — bundle: ' + stale.join(', ') + ' no longer the js/ files they join. Run: node tools/build-stamp.js'); process.exit(1); }
  console.log((check ? 'OK — bundle: up to date (' : 'bundle: wrote (') + n + ' files)');
}
