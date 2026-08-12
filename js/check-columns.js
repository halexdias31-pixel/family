#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-columns.js

   EVERY COLUMN THE BACKEND TOUCHES, AGAINST THE ONES THAT EXIST.

   WHY THIS IS THE FAULT THAT KEEPS HAPPENING. `setCell` writing to a column that is not there
   returns false and says nothing; `read` handing back a row with no such key gives `undefined`,
   which `S()` turns into an empty string and `N()` turns into zero. Neither throws. The value goes
   nowhere, or comes back blank, and the feature simply does not work — the avatar that reset every
   time, the four pricing fields lost four times over, `job.tutor` that never existed and left every
   invitation without a tutor's name in it.

   The write side has been checked by hand more than once. This checks BOTH, and keeps checking.

   WHAT IT KNOWS NOT TO REPORT, because a check that is mostly wrong is a check nobody reads:

     CONFIG KEYS ARE ROWS. The config tab is key and value, so `cfg.print_minimum` reads a ROW
     called print_minimum. It is not a column and never was — four of those were reported the first
     time this ran and none of them was a fault.

     NOT EVERY DOT IS A ROW. `d.payment_status` is Stripe's reply, `x.tab` is a write-miss record,
     `e.parameter` is the request. Only the names this file actually uses for a sheet row are read.

     node check-columns.js
================================================================================================== */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
/* THE BACKEND FILES, IN LOAD ORDER, UNDER WHATEVER THEY ARE CALLED.
   Apps Script joins these into one scope before anything runs, and the ORDER matters — every
   top-level `const` lives in the constants file and everything else holds functions only, so the
   constants file has to come first. The ORDER here is that order, and it is not alphabetical:
   alphabetically `booking` comes before `constants`, which is the arrangement the headers warn is
   a dead site with an error nobody can place.

   TWO SPELLINGS ACCEPTED, because the files are called one thing in the Apps Script editor and were
   once called another here. Numbered names are self-documenting about the order; plain ones are
   what is actually on disk. Rather than make somebody rename eight files to satisfy a checker, the
   checker looks for both — a tool that only runs against a naming convention is a tool that does
   not run. */
const ORDER_ = ['constants', 'core', 'people', 'booking', 'content', 'setup', 'doGet', 'doPost'];
const NUMBERED = ['00_constants', '10_core', '20_people', '30_booking', '40_content',
                  '50_setup', '60_doGet', '70_doPost'];
/* Each name tried in turn: numbered, plain, and plain lower-cased — `doget.gs` and `doGet.gs` are
   the same file to a person and different to a filesystem. */
const findGs = (i) => [NUMBERED[i], ORDER_[i], ORDER_[i].toLowerCase()]
  .map(n => path.join(dir, n + '.gs'))
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