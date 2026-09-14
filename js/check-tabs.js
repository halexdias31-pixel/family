#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-tabs.js

   EVERY TAB THE BACKEND READS, AGAINST THE FILE IT SAYS THAT TAB IS IN.

   WHY THIS EXISTS. `read(name)` resolves a tab through `sheetFor_`, which looks the name up in
   `WHERE` to decide which of the three spreadsheets to open. A name with no line in `WHERE` gets no
   file, finds no sheet, and comes back as `{ rows: [] }` — and every caller in the app treats an
   empty list as an empty list. Not an error. Not a warning. A funnel with no questions in it, a
   shop with nothing for sale, a library of no past papers, each looking exactly like a database
   somebody has not filled in yet.

   THAT IS NOT HYPOTHETICAL. It was two maps and a default: `ELSEWHERE` for tabs in the subjects
   file, `HERE` for tabs renamed in the main one, and anything in neither fell through to
   `SPREADSHEET_ID`. The default is what hid it — every name resolved to a real file, so a tab that
   was never routed and a tab that was routed correctly were the same shape of nothing. Five tabs
   the backend reads (`resources`, `herd`, `map`, `landmark_parts`, `post_votes`) did not exist in
   any file at all, and the only reason anybody found out was reading all four spreadsheets by hand.

   Splitting one database into three removed the default — there is no main file to fall back to —
   so the fault moves from silent to visible, and this is the thing that makes it visible BEFORE a
   deploy rather than after one.

   WHAT IT CHECKS, all of it read out of the source rather than assumed:

     1. Every tab in `TAB` has a line in `WHERE`.       A tab the app asks for and cannot reach.
     2. Every tab in `SCHEMA` has a line in `WHERE`.    `ensureSchema` would skip it forever.
     3. Every `WHERE` line names a file in `FILES`.     A typo'd file key is a blank id.
     4. Every file in `FILES` has an id that is a       Both ids were `.xlsx` uploads once, and
        plausible Drive id, not a URL and not blank.    `openById` cannot read a cell of one.
     5. Nothing in `WHERE` is unknown to `TAB`/`SCHEMA`. Routing for a tab nothing reads — harmless,
                                                        so it prints and does not fail.

   WHAT IT CANNOT CHECK, and this matters: whether the tab is actually in that spreadsheet. That
   needs the file, and this runs in Node with no Drive. `checkTabs()` in the backend answers it from
   the other side, with the documents open. The two together cover it; neither does alone.

     node js/check-tabs.js
================================================================================================== */
const fs = require('fs');
const path = require('path');

/* THE CONSTANTS FILE, WHEREVER IT IS. Three checks each hand-rolled this and all three looked
   beside `js/` rather than in `backend/` — see CLAUDE.md. Directories in order of what is true
   today, then the spellings, because `constants.gs` is one name to a person and another to a
   filesystem. */
const dir = path.join(__dirname, '..');
const PLACES = [path.join(dir, 'backend'), path.join(dir, '..', 'backend'), dir];
const NAMES = ['constants.gs', '00_constants.gs'];
const CONSTANTS = PLACES.flatMap(p => NAMES.map(n => path.join(p, n))).find(p => fs.existsSync(p));

/* A CHECK THAT CANNOT FIND ITS SUBJECT MUST EXIT NON-ZERO. "I did not check" and "I checked and it
   was fine" are different answers, and exit 0 says the second one to everything that reads it. */
if (!CONSTANTS) {
  console.error('check-tabs: cannot find constants.gs. Looked in:\n  ' + PLACES.join('\n  '));
  process.exit(1);
}

const src = fs.readFileSync(CONSTANTS, 'utf8');

/* ---------- READING A TOP-LEVEL OBJECT OUT OF THE SOURCE -------------------------------------------
   Brace-counting rather than a regex, because every one of these objects has comments in it with
   braces and apostrophes in the prose. Comments are stripped from the SLICE, not from the whole
   file, so a `/*` inside a string elsewhere cannot shift the boundaries of this one. */
function objectAfter_(name) {
  const at = src.indexOf('const ' + name);
  if (at < 0) return null;
  const open = src.indexOf('{', at);
  if (open < 0) return null;
  let depth = 0, i = open;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (!depth) break; }
  }
  return src.slice(open, i + 1).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
}

const tabBlock = objectAfter_('TAB');
const whereBlock = objectAfter_('WHERE');
const filesBlock = objectAfter_('FILES');

if (!tabBlock || !whereBlock || !filesBlock) {
  console.error('check-tabs: could not read ' +
    [['TAB', tabBlock], ['WHERE', whereBlock], ['FILES', filesBlock]]
      .filter(p => !p[1]).map(p => p[0]).join(', ') + ' out of ' + CONSTANTS);
  process.exit(1);
}

/* The names the app asks for — the VALUE of each TAB line, since that is what `read()` is passed. */
const asked = new Set();
for (const m of tabBlock.matchAll(/(\w+)\s*:\s*'([^']+)'/g)) asked.add(m[2]);

/* SCHEMA's keys are tab names too, and they are not the same set: a tab can have columns described
   without `TAB` naming it. `ensureSchema` walks SCHEMA, so an unrouted key there is a tab whose
   columns are never added to anything. */
const schemaBlock = objectAfter_('SCHEMA') || '';
const described = new Set();
for (const m of schemaBlock.matchAll(/(?:^|[\n,])\s*['"]?([A-Za-z_]\w*)['"]?\s*:\s*\[/g)) {
  described.add(m[1]);
}

const routed = new Map();
for (const m of whereBlock.matchAll(/['"]?([A-Za-z_]\w*)['"]?\s*:\s*\{([^}]*)\}/g)) {
  const file = /file:\s*'([^']+)'/.exec(m[2]);
  const also = /alsoTry:\s*'([^']+)'/.exec(m[2]);
  routed.set(m[1], { file: file && file[1], alsoTry: also && also[1] });
}

const files = new Map();
for (const m of filesBlock.matchAll(/(\w+)\s*:\s*(\w+)/g)) {
  const decl = new RegExp('const\\s+' + m[2] + '\\s*=\\s*"([^"]*)"').exec(src);
  files.set(m[1], decl ? decl[1] : null);
}

const fail = [];
const note = [];

/* 1 + 2 — a tab something reaches for, with nowhere to reach. */
for (const name of [...asked].sort()) {
  if (!routed.has(name)) fail.push('TAB.' + name + ' — read() asks for it, no line in WHERE');
}
for (const name of [...described].sort()) {
  if (!routed.has(name)) fail.push('SCHEMA.' + name + ' — has columns described, no line in WHERE');
}

/* 3 — a file key that is not a file. `FILES[w.file]` is `undefined` for a typo, `|| ''` turns that
   into a blank id, and a blank id is an empty tab. One letter, one section of the site gone. */
for (const [name, w] of [...routed].sort()) {
  if (!w.file) fail.push('WHERE.' + name + ' — no file named');
  else if (!files.has(w.file)) {
    fail.push('WHERE.' + name + " — file '" + w.file + "' is not in FILES (" +
              [...files.keys()].join(', ') + ')');
  }
}

/* 4 — THE FAULT THAT COST THE MOST. Both ids pointed at .xlsx uploads for months; every section
   loaded empty, which is what a blank database looks like. Nothing here can tell an upload from a
   Sheet — that needs Drive — but it can catch the shapes that are certainly wrong: a blank id, a
   whole URL pasted in, and the `file/d` spelling that IS the upload, which is the one case where
   the id itself gives the fault away. */
for (const [name, id] of files) {
  if (id === null) fail.push('FILES.' + name + ' — no const holding an id');
  else if (!id) note.push('FILES.' + name + ' — blank id, so every tab in it reads as empty');
  else if (/drive\.google\.com\/file\/d\//.test(id)) {
    fail.push('FILES.' + name + ' — this is a drive.google.com/file/d/ address, which is an .xlsx ' +
              'UPLOAD. SpreadsheetApp.openById cannot read a cell of one.');
  } else if (/[/:?]/.test(id)) {
    fail.push('FILES.' + name + ' — looks like a URL, not an id. The id is only the part between ' +
              '/d/ and /edit.');
  } else if (!/^[A-Za-z0-9_-]{20,}$/.test(id)) {
    fail.push('FILES.' + name + ' — "' + id + '" is not shaped like a Drive id');
  }
}

/* 5 — routing for a tab nothing reads. Harmless: it is a line that does nothing, not a feature that
   does nothing. Same argument as "sent and never read" in check-payload.js — it prints, it does not
   fail, because a report that fails on things that are fine is a report nobody reads. */
for (const [name] of [...routed].sort()) {
  if (!asked.has(name) && !described.has(name)) {
    note.push('WHERE.' + name + ' — routed, but neither TAB nor SCHEMA mentions it');
  }
}

const byFile = {};
for (const [name, w] of routed) (byFile[w.file] = byFile[w.file] || []).push(name);

console.log('');
console.log('WHERE EVERY TAB LIVES');
for (const f of files.keys()) {
  const list = (byFile[f] || []).sort();
  console.log('  ' + f + '  (' + list.length + ' tabs)');
  console.log('    ' + (list.join(', ') || '(none)'));
}
const aliased = [...routed].filter(p => p[1].alsoTry);
if (aliased.length) {
  console.log('');
  console.log('TABS ALSO ANSWERING TO A SECOND NAME  (' + aliased.length + ')');
  for (const [n, w] of aliased) console.log('  ' + n + '  or  ' + w.alsoTry);
}

if (note.length) {
  console.log('');
  console.log('WORTH A LOOK — not failures  (' + note.length + ')');
  for (const n of note) console.log('  ' + n);
}

console.log('');
if (fail.length) {
  console.log('A TAB THAT CANNOT BE REACHED  (' + fail.length + ')');
  for (const f of fail) console.log('  ' + f);
  console.log('');
  console.log('Each of these reads back as an empty list, which is what an empty database looks ' +
              'like. Nothing will throw and nothing will say so.');
  process.exit(1);
}
console.log('OK — ' + routed.size + ' tabs, each routed to one of ' + files.size + ' files; ' +
            asked.size + ' asked for by TAB, ' + described.size + ' described in SCHEMA.');
