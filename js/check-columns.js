#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-columns.js EVERY COLUMN THE BACKEND TOUCHES, AGAINST THE ONES THAT EXIST. § */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
/* THE BACKEND FILES, IN LOAD ORDER, UNDER WHATEVER THEY ARE CALLED. § */
/* `digest` LAST — the weekly parent email (backend/digest.gs) reads `submissions`, `people` and writes `digest_log`, and a column it named wrong would be an § */
const ORDER_ = ['constants', 'core', 'people', 'booking', 'content', 'setup', 'doGet', 'doPost', 'digest'];
const NUMBERED = ['00_constants', '10_core', '20_people', '30_booking', '40_content',
                  '50_setup', '60_doGet', '70_doPost', '80_digest'];
/* Each name tried in turn: numbered, plain, and plain lower-cased — `doget.gs` and `doGet.gs` are
   the same file to a person and different to a filesystem. */
/* AND IN `backend/`, WHICH IS WHERE THEY ARE. § */
const WHERE = [path.join(dir, '..', 'backend'), path.join(dir, 'backend'), dir, path.join(dir, '..')];
const findGs = (i) => WHERE
  .flatMap(w => [NUMBERED[i], ORDER_[i], ORDER_[i].toLowerCase()].map(n => path.join(w, n + '.gs')))
  .find(p2 => fs.existsSync(p2));
const GS_PATHS = ORDER_.map((unused, i) => findGs(i));

const missing = ORDER_.filter((unused, i) => !GS_PATHS[i]);
if (missing.length) {
  console.log('missing backend files: ' + missing.join(', '));
  console.log('looked for each as 00_name.gs, name.gs and name.gs lower-cased, in ' + dir);
  process.exit(1);
}

const con = strip(fs.readFileSync(GS_PATHS[0], 'utf8'));
const sch = con.slice(con.indexOf('const SCHEMA = {'), con.indexOf('\n};', con.indexOf('const SCHEMA = {')));
const cols = new Set([...sch.matchAll(/"([a-z_0-9]+)"/g)].map(m => m[1]));
const cfg  = new Set([...con.matchAll(/\['([a-z_0-9]+)',/g)].map(m => m[1]));

const gs = strip(GS_PATHS.map(p2 => fs.readFileSync(p2, 'utf8')).join('\n'));

/* WRITES. `setCell(t, row, 'field', v)` and the keys of an `addRow` object — both go through the
   headers, and both are dropped in silence when the header is not there. */
const writes = new Set([...gs.matchAll(/setCell\([^,]+,[^,]+,\s*'([a-z_0-9]+)'/g)].map(m => m[1]));

/* AND THE KEYS OF AN `addRow` OBJECT, which the comment above has always claimed and the code did not do. § */
for (const m of gs.matchAll(/addRow\([^,]+,\s*\{/g)) {
  let i = gs.indexOf('{', m.index), depth = 0, end = i;
  do { if (gs[end] === '{') depth++; else if (gs[end] === '}') depth--; end++; }
  while (depth > 0 && end < gs.length);
  for (const k of gs.slice(i, end).matchAll(/(?:^|[{,])\s*([a-z][a-z_0-9]*)\s*:/g)) {
    writes.add(k[1]);
  }
}

/* AND THE KEYS OF A `setCells` OBJECT, the third way a row is written (`setCells(t, row, { … })`, one call per run of columns) and the one this file was written § */
for (const m of gs.matchAll(/setCells\([^,]+,[^,]+,\s*\{/g)) {
  let i = gs.indexOf('{', m.index + m[0].length - 1), depth = 0, end = i;
  do { if (gs[end] === '{') depth++; else if (gs[end] === '}') depth--; end++; }
  while (depth > 0 && end < gs.length);
  for (const k of gs.slice(i, end).matchAll(/(?:^|[{,])\s*([a-z][a-z_0-9]*)\s*:/g)) {
    writes.add(k[1]);
  }
}

/* READS, and only off the names this file gives a sheet row. */
const reads = new Set([...gs.matchAll(/\b(r|x|j|row|owner|child|parent|me|who|post)\.([a-z][a-z_0-9]{2,})\b/g)]
  .map(m => m[2]));

/* Names that are plainly not columns: methods, and the fields of things that are not rows. */
const NOT = new Set(('sheet rows headers length push find filter map forEach indexOf slice join split '
  + 'trim error message result value sort some every concat reduce replace test match keys toString '
  + 'getTime includes tab field').split(' '));

const badWrite = [...writes].filter(c => !cols.has(c));
const badRead  = [...reads].filter(c => !cols.has(c) && !cfg.has(c) && !NOT.has(c));

const say = (title, list, why) => {
  console.log('');
  console.log(title + '  (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  list.forEach(c => console.log('  ' + c + '  — ' + why));
};

say('WRITTEN TO A COLUMN THAT IS NOT IN THE SCHEMA', badWrite,
    'setCell returns false and says nothing; the value is discarded');
say('READ FROM A COLUMN THAT IS NOT IN THE SCHEMA', badRead,
    'comes back undefined, which reads as blank or zero rather than as a fault');

console.log('');
console.log('columns in the schema: ' + cols.size + '   config keys: ' + cfg.size);
const fail = badWrite.length + badRead.length;
console.log(fail ? 'FAILED — each name above is a column something expects and the sheet has not got'
                 : 'OK — every column the backend reads and writes exists.');
process.exit(fail ? 1 : 0);