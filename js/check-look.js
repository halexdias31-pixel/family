#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-look.js THE OWNER'S LOOK DECISIONS (8 Nov), each one a rule a change cannot quietly undo. */
const fs = require('fs'), path = require('path');
const dir = __dirname, root = path.join(dir, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const listed = (html.match(/FILES\s*=\s*\[([\s\S]*?)\]/) || [, ''])[1];
const files = [...listed.matchAll(/'([\w-]+)'/g)].map(m => m[1])
  .filter(n => fs.existsSync(path.join(dir, n + '.js')))
  .map(n => ({ n, src: fs.readFileSync(path.join(dir, n + '.js'), 'utf8') }));
const bad = [];

/* ---------- 1. EVERY ACTION IS A ROUND TILE ---------- */
/* An answer choice or a week-grid cell is a form's input, not an action, so those classes may stay raw buttons. */
const INPUT_CLS = /^(qp-slot|qp-item|qp-opt|hr|q-line|q-mark-b)\b/;
/* Files not yet converted, with their raw-button count: a ratchet, so each number only goes down. */
const LEFT = { tiles: 3, collections: 5, hadith: 1, layout: 3, map: 4, mat: 1, posts: 20, quran: 1,
  receipt: 1, rules: 1, 'shell-api': 1, 'shell-boot': 1, working: 1 };
files.forEach(({ n, src }) => {
  const raw = [...src.matchAll(/<button\b[^>]*?class="([^"]*)"|<button\b(?![^>]*class=)/g)]
    .filter(m => !INPUT_CLS.test(m[1] || ''));
  const may = LEFT[n] || 0;
  if (raw.length > may) bad.push(`1 raw <button>: ${n}.js has ${raw.length}, allowed ${may} — draw it with tile_({…}) (a form's Save: tile_({ form: true }))`);
});

if (bad.length) { bad.forEach(b => console.log('  ✗ ' + b)); console.log(`check-look: ${bad.length} problem(s)`); process.exit(1); }
console.log('check-look: ok');
