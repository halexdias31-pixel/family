#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-tabs.js EVERY TAB THE BACKEND READS, AGAINST THE FILE IT SAYS THAT TAB IS IN. § */
const fs = require('fs');
const path = require('path');

/* THE CONSTANTS FILE, WHEREVER IT IS. § */
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

/* ---------- READING A TOP-LEVEL OBJECT OUT OF THE SOURCE § */
function objectAfter_(name, text) {
  const into = text || src;
  /* A WORD BOUNDARY, because `indexOf` matches a PREFIX. § */
  const decl = new RegExp('const\\s+' + name + '\\b').exec(into);
  if (!decl) return null;
  const at = decl.index;
  const open = into.indexOf('{', at);
  if (open < 0) return null;
  let depth = 0, i = open;
  for (; i < into.length; i++) {
    if (into[i] === '{') depth++;
    else if (into[i] === '}') { depth--; if (!depth) break; }
  }
  return into.slice(open, i + 1).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
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

/* 4 — THE FAULT THAT COST THE MOST. § */
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

/* 5 — routing for a tab nothing reads. § */
for (const [name] of [...routed].sort()) {
  if (!asked.has(name) && !described.has(name)) {
    note.push('WHERE.' + name + ' — routed, but neither TAB nor SCHEMA mentions it');
  }
}

/* 6 — THE FOURTH PLACE THAT NAMES TABS, and the one that was checked by nothing. § */
const DOGET = PLACES.flatMap(d => ['doget.gs', 'doGet.gs'].map(n => path.join(d, n)))
  .find(f => fs.existsSync(f));
if (!DOGET) {
  console.error('check-tabs: cannot find doget.gs, so REQUIRED_TABS went unchecked. Looked in:\n  ' +
                PLACES.join('\n  '));
  process.exit(1);
}
const requiredBlock = objectAfter_('REQUIRED_TABS', fs.readFileSync(DOGET, 'utf8'));
if (!requiredBlock) {
  console.error('check-tabs: no `const REQUIRED_TABS = {` in ' + DOGET + '. It is the list that ' +
                'decides whether doGet answers with a payload at all, and this rule exists ' +
                'because it went stale once. Renamed, or turned back into an array?');
  process.exit(1);
}
const required = [];
for (const m of requiredBlock.matchAll(/(?:^|\n)\s*['"]?([A-Za-z_]\w*)['"]?\s*:\s*['"]/g)) {
  required.push(m[1]);
}
if (!required.length) {
  console.error('check-tabs: REQUIRED_TABS in ' + DOGET + ' parsed to no tabs at all. A check that ' +
                'cannot reach its subject must not report that the subject is fine.');
  process.exit(1);
}
for (const name of required) {
  if (!routed.has(name)) {
    fail.push('REQUIRED_TABS.' + name + ' — doGet refuses to answer without it, and WHERE routes ' +
              'it nowhere. read() gets a blank id, so this is EVERY SCREEN DARK on the next deploy.');
  } else if (!described.has(name)) {
    fail.push('REQUIRED_TABS.' + name + ' — doGet refuses to answer without it, and SCHEMA does ' +
              'not describe it, so ensureSchema will never create it and ?setup=1 cannot repair it.');
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
            asked.size + ' asked for by TAB, ' + described.size + ' described in SCHEMA, ' +
            required.length + ' that doGet will not answer without.');
