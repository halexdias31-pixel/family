#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-finder.js ONE WRITER OF A FINDER'S QUESTION (R1): outside find.js chips and words are set only by `finderSet_`. */
/* Booking from a card once kept the typed words under its new chip, and found nothing (docs/history/522). */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const JS = path.join(ROOT, 'js');
const bad = [];

/* Comments are blanked, line for line, so a note quoting an old line is not a write. */
const code_ = src => src
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  .split('\n').map(l => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1')).join('\n');

const OWNER = '(?:\\bSTUFF|\\bRES_ST|\\.st)\\s*\\.\\s*';
const WRITES = [
  [new RegExp(OWNER + '(filters|q)\\s*(?:\\+|-)?=(?!=)'), 'assigns'],
  [new RegExp(OWNER + 'filters\\s*\\.\\s*(?:push|pop|splice|shift|unshift|sort|reverse|fill)\\s*\\('), 'changes in place'],
  [new RegExp(OWNER + 'filters\\s*\\.\\s*length\\s*=(?!=)'), 'empties'],
];

const files = fs.readdirSync(JS).filter(n => /\.js$/.test(n) && n !== 'find.js' && !/^check/.test(n));
let lines = 0;
files.forEach(n => {
  code_(fs.readFileSync(path.join(JS, n), 'utf8')).split('\n').forEach((l, i) => {
    lines++;
    WRITES.forEach(([re, how]) => {
      if (re.test(l)) bad.push('js/' + n + ':' + (i + 1) + ' ' + how + ' a finder\'s chips or words by hand — call finderSet_(F, { filters, q }): `' + l.trim().slice(0, 120) + '`');
    });
  });
});

/* AND THE ONE WRITER IS THERE TO CALL — a scan of a tree without it would pass by reading nothing. */
const find = fs.readFileSync(path.join(JS, 'find.js'), 'utf8');
if (!/\nfunction finderSet_\s*\(F, o\)/.test(find)) bad.push('js/find.js declares no `finderSet_(F, o)` — the one writer is gone');
if (files.length < 20 || lines < 10000) bad.push('only ' + files.length + ' file(s), ' + lines + ' line(s) were read — the scan did not reach js/, which is not a pass');

if (bad.length) {
  console.log('FAILED — a finder\'s question is written from outside find.js:');
  bad.forEach(b => console.log('  ' + b));
  process.exit(1);
}
console.log('OK — ' + files.length + ' files outside find.js set no finder\'s chips or words except through finderSet_.');
