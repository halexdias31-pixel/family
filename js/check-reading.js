#!/usr/bin/env node
/* @family. — js/check-reading.js EVERY LIBRARY TEXT IS DRAWN BY `readingCard_` (owner, 8 Nov): one layout, one reference table. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const JS = fs.readdirSync(__dirname).filter(f => f.endsWith('.js') && !f.startsWith('check')).map(f => [f, fs.readFileSync(path.join(__dirname, f), 'utf8')]);
const bad = [];
const fnBody = name => {
  for (const [f, s] of JS) {
    const at = s.indexOf('function ' + name + '(');
    if (at >= 0) { const end = s.indexOf('\n}', at); return { f, body: s.slice(at, end < 0 ? undefined : end) }; }
  }
  return null;
};
/* THE KINDS ARE THE TABLE'S: each must exist in Find's kind list and its card must reach `readingCard_`. */
const writings = fs.readFileSync(path.join(__dirname, 'writings.js'), 'utf8');
const table = /const READING_REF = \{([\s\S]*?)\n\};/.exec(writings);
if (!table) { console.log('check-reading: READING_REF not found in js/writings.js'); process.exit(1); }
const kinds = [...table[1].matchAll(/^\s*(\w+):\s*\{/gm)].map(m => m[1]);
const finder = JS.find(([f]) => f === 'find-finder.js')[1];
/* A TEXT KIND FIND KNOWS BUT THE TABLE DOES NOT is a text drawn another way. */
const TEXT_FILES = ['writings.js', 'quran.js', 'texts.js', 'pdtexts.js', 'hymns.js'];
const made = new Set();
JS.filter(([f]) => TEXT_FILES.includes(f)).forEach(([, s]) => [...s.matchAll(/kind: '(\w+)'/g)].forEach(m => made.add(m[1])));
made.add('bible');
made.forEach(k => { if (!kinds.includes(k)) bad.push(`kind ${k} is a Library text but has no READING_REF row`); });
kinds.forEach(k => {
  /* THE FIND CARD IS findCard's (the card template); the reader a tap opens is the kind's entry in the opener table. */
  const m = new RegExp('\\b' + k + ': x => (\\w+)\\(x\\)').exec(finder);
  if (!m) return bad.push(`kind ${k}: no reader in find-finder.js's opener table`);
  let fn = fnBody(m[1]), hops = 0;
  while (fn && !/readingCard_\(/.test(fn.body) && hops++ < 2) {
    const next = /return [^;]*?(\w+Card_)\(x\)/.exec(fn.body);
    fn = next ? fnBody(next[1]) : null;
  }
  if (!fn || !/readingCard_\(/.test(fn.body)) bad.push(`kind ${k}: ${m[1]} does not draw through readingCard_`);
});
/* NO BESPOKE CARD LEFT in a text's own file. */
TEXT_FILES.filter(f => f !== 'writings.js').forEach(f => {
  const s = fs.readFileSync(path.join(__dirname, f), 'utf8');
  if (/class="card[ "]/.test(s)) bad.push(`${f}: draws its own card markup; use readingCard_`);
});
if (bad.length) { console.log('check-reading: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log(`OK — ${kinds.length} Library text kinds, every one drawn by readingCard_.`);
void ROOT;
