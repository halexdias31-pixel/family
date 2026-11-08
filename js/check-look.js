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
  receipt: 1, rules: 1, 'shell-api': 1, working: 1 };
files.forEach(({ n, src }) => {
  const raw = [...src.matchAll(/<button\b[^>]*?class="([^"]*)"|<button\b(?![^>]*class=)/g)]
    .filter(m => !INPUT_CLS.test(m[1] || ''));
  const may = LEFT[n] || 0;
  if (raw.length > may) bad.push(`1 raw <button>: ${n}.js has ${raw.length}, allowed ${may} — draw it with tile_({…}) (a form's Save: tile_({ form: true }))`);
});

/* ---------- 2. NO GREY SENTENCES ---------- */
/* Text is ink or a tag; the two greys colour only a control that cannot be pressed (P8) or a placeholder. */
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const GREY = /(?<![-\w])color:\s*var\(--(dim|faint)\)/;
const STILL = /disabled|placeholder|is-off|\.shut|locked|\.off\b|:empty|read-only/;
for (const m of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (GREY.test(m[2]) && !STILL.test(sel)) bad.push(`2 grey text: "${sel.slice(0, 80)}" — ink, a tag (.qtag), or nothing`);
}
files.forEach(({ n, src }) => {
  if (/(?<![-\w])color:\s*var\(--(dim|faint)\)/.test(src)) bad.push(`2 grey text: inline in ${n}.js`);
});

/* ---------- 3. SAME LOOK EVERYWHERE: COLOUR IS A TOKEN ---------- */
/* A literal lives only in a :root block; everything else names a token, so one palette changes the whole site. */
const LIT = /(?<![\w&-])#[0-9a-fA-F]{3,8}\b(?![\w-])|\brgba?\(/;
const noComments = css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '));
for (const m of noComments.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  if (/^\s*:root\s*$/.test(m[1]) || !LIT.test(m[2])) continue;
  bad.push(`3 colour literal in "${m[1].trim().slice(0, 80)}" — use a token from :root`);
}
/* The one exception: the pH scale (mat.js) IS a set of colours, the content itself, not the site's look. */
const LIT_OK = new Set(['mat']);
files.forEach(({ n, src }) => {
  if (LIT_OK.has(n)) return;
  for (const m of src.matchAll(/style="([^"]*)"/g)) {
    if (/(?<![\w&-])#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(m[1])) bad.push(`3 inline colour literal in ${n}.js: ${m[1].slice(0, 60)}`);
  }
});

/* ---------- 4. ONE EMPTY STATE ---------- */
/* `empty_(text)` (tiles.js) is the only maker; a hand-made empty paragraph is the variant this replaced. */
files.forEach(({ n, src }) => {
  if (n === 'tiles') return;
  if (/class="empty\b/.test(src)) bad.push(`4 empty state by hand in ${n}.js — empty_('No … yet.')`);
  if (/class="(?:faint|sub)[^"]*">\s*(?:No |Nothing|None|Nobody)/.test(src)) bad.push(`4 a grey "nothing" line in ${n}.js — empty_('No … yet.')`);
});

if (bad.length) { bad.forEach(b => console.log('  ✗ ' + b)); console.log(`check-look: ${bad.length} problem(s)`); process.exit(1); }
console.log('check-look: ok');
