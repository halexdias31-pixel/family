#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/live.js

   THE REAL BACKEND, RUN AGAINST THE REAL DATABASE, HERE.

   WHY THIS EXISTS. Every check in this repo measures the app against `check/fixture.json` — four
   question rows, fifteen people, a handful of venues, all hand-written. That is the right thing for
   most of them: a fixture is stable, and a check that changes its answer when somebody edits a
   spreadsheet is a check nobody can act on.

   BUT IT MEANS NOTHING HAS EVER SEEN THE ACTUAL DATA. Three faults in one week came from exactly
   that gap, and no fixture would have caught any of them, because the fixture was written from the
   same belief as the code:

     `SCHEMA.landmarks` named seven columns the sheet has never had, so every building came through
     with width 0, depth 0 and no colour;
     `allTopics()` hardcoded `link: ''` with a comment explaining no PDF existed, while 328 rows
     carried one;
     past papers were drawn twice — once as a paper and once per question — which nobody could see
     until the fixture had a paper WITH questions in it.

   THIS IS NOT A SECOND IMPLEMENTATION. It loads the `.gs` files themselves and calls the real
   `doGet`. The only things replaced are the eight Apps Script globals the payload build touches,
   and `SpreadsheetApp` is backed by a dump of the real spreadsheets. If `doget.gs` is wrong about a
   column, this is wrong in exactly the same way — which is the point.

   ---------------------------------------------------------------------------------------------
   THE DUMP IS NEVER COMMITTED, and this is not a style preference. `Ledger` holds people's PINs,
   e-mail addresses, phone numbers and dates of birth, and this repository is PUBLIC. The dump path
   is in `.gitignore` and this file refuses to write one into the working tree.

   To make one, export the two spreadsheets and flatten them to:

     { "ledger": { "<tab>": [[row], [row], …] }, "settings": { … } }

   IT WAS THREE. `Library` held the questions, the cheat sheet components, the boxers and the
   bouts; all four are files in `data/` now and no backend code opens that spreadsheet, so a dump
   of it would be three keys this cannot use. A dump made before that change still works — an
   extra key is ignored.

   first row = headers, every cell a string, number or boolean. Then:

     node check/live.js --sheets /path/to/sheets.json --out /tmp/payload.json

   ---------------------------------------------------------------------------------------------
   WHAT IT CANNOT DO. It builds the payload; it does not prove the deployed version serves it. A
   push is not a deploy — see CLAUDE.md — and nothing here can see which version `/exec` is running.
   Every Google host is blocked from this environment by the network policy, so the deployed answer
   has to come from somebody opening the URL.
================================================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const argv = process.argv.slice(2);
const arg = n => { const i = argv.indexOf('--' + n); return i < 0 ? null : argv[i + 1]; };

const SHEETS = arg('sheets');
const OUT = arg('out') || '/tmp/family-payload.json';
const AS = arg('as') || '';               // a person's name, to build the payload as they see it

if (!SHEETS) {
  console.error('check/live.js: --sheets <sheets.json> is required. See the header of this file.');
  process.exit(1);
}
/* REFUSING TO WRITE INTO THE REPO. A payload built from the real Ledger has PINs in it. */
const repo = path.join(__dirname, '..');
if (!path.relative(repo, path.resolve(OUT)).startsWith('..')) {
  console.error('check/live.js: refusing to write the payload inside the repository — it contains\n' +
                'PINs, e-mail addresses and dates of birth, and this repository is public.\n' +
                'Pass --out with a path outside ' + repo);
  process.exit(1);
}

const book = JSON.parse(fs.readFileSync(SHEETS, 'utf8'));

/* ---------- THE SHEET, AS APPS SCRIPT SEES IT ----------------------------------------------------
   `read()` in core.gs uses getLastRow, getLastColumn, getRange().getValues() and getSheetByName, and
   `setCell` uses getRange().setValue(). That is the whole surface, so that is the whole stub. A
   write lands in the dump in memory and is thrown away with the process — this reads the database,
   it does not edit it. */
function sheetOf(name, grid) {
  const rows = () => grid.length;
  const cols = () => grid.reduce((n, r) => Math.max(n, r.length), 0);
  return {
    getName: () => name,
    getLastRow: rows,
    getLastColumn: cols,
    getMaxRows: rows,
    getMaxColumns: cols,
    getRange(r, c, nr, nc) {
      nr = nr || 1; nc = nc || 1;
      return {
        getValues: () => Array.from({ length: nr }, (_, i) =>
          Array.from({ length: nc }, (_, j) => {
            const row = grid[r - 1 + i] || [];
            const v = row[c - 1 + j];
            return v === undefined ? '' : v;
          })),
        getValue() { return this.getValues()[0][0]; },
        setValue(v) {
          while (grid.length < r) grid.push([]);
          const row = grid[r - 1];
          while (row.length < c) row.push('');
          row[c - 1] = v;
          return this;
        },
        setValues(vals) { vals.forEach((rw, i) => rw.forEach((v, j) =>
          this.constructor && sheetOf(name, grid).getRange(r + i, c + j).setValue(v))); return this; },
      };
    },
    appendRow(vals) { grid.push(vals.slice()); return this; },
    insertSheet: () => { throw new Error('check/live.js: refusing to create a sheet'); },
  };
}

function bookOf(key) {
  const tabs = book[key] || {};
  return {
    getName: () => key,
    getSheets: () => Object.keys(tabs).map(n => sheetOf(n, tabs[n])),
    getSheetByName: n => (tabs[n] ? sheetOf(n, tabs[n]) : null),
    insertSheet: () => { throw new Error('check/live.js: refusing to create a sheet'); },
    getId: () => key,
  };
}

/* The ids in constants.gs, mapped back to the keys in the dump. Read out of the source rather than
   typed here, so renaming a file in `FILES` cannot silently point this at nothing — and so that
   removing one, as `Library` was, fails here loudly rather than resolving to a file that is not in
   the dump. */
const constants = fs.readFileSync(path.join(repo, 'backend', 'constants.gs'), 'utf8');
const idFor = {};
for (const m of constants.matchAll(/const\s+(LEDGER|SETTINGS)_ID\s*=\s*"([^"]+)"/g)) {
  idFor[m[2]] = m[1].toLowerCase();
}
if (Object.keys(idFor).length !== 2) {
  console.error('check/live.js: could not read two ids out of constants.gs — found ' +
                Object.keys(idFor).length);
  process.exit(1);
}

const props = {};
let out = null;

const sandbox = {
  console,
  JSON, Math, Date, String, Number, Boolean, Array, Object, RegExp, Error, isNaN, isFinite,
  parseInt, parseFloat, encodeURIComponent, decodeURIComponent, Map, Set, Promise,

  SpreadsheetApp: {
    openById: id => (idFor[id] ? bookOf(idFor[id]) : null),
    getActiveSpreadsheet: () => null,
    flush: () => {},
  },
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: k => (k in props ? props[k] : null),
      setProperty: (k, v) => { props[k] = String(v); },
      deleteProperty: k => { delete props[k]; },
      getProperties: () => Object.assign({}, props),
    }),
    getUserProperties() { return this.getScriptProperties(); },
  },
  /* NO CACHE. The point is to build the payload from the sheet every time — a cached answer is the
     one thing this must not give, since a stale payload is what half of these faults looked like. */
  CacheService: { getScriptCache: () => ({ get: () => null, put: () => {}, remove: () => {} }) },
  LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock: () => true, releaseLock: () => {} }) },
  Logger: { log: () => {} },
  Utilities: {
    getUuid: () => 'uuid-' + Math.random().toString(36).slice(2),
    sleep: () => {},
    formatDate: (d, tz, f) => new Date(d).toISOString(),
    base64Encode: s => Buffer.from(String(s)).toString('base64'),
    base64Decode: s => Array.from(Buffer.from(String(s), 'base64')),
    newBlob: s => ({ getBytes: () => Array.from(Buffer.from(String(s))), getDataAsString: () => String(s) }),
    computeDigest: () => [0],
    DigestAlgorithm: { MD5: 'MD5', SHA_256: 'SHA_256' },
    Charset: { UTF_8: 'UTF_8' },
  },
  ContentService: {
    createTextOutput: t => { out = t; return { setMimeType: () => ({ getContent: () => t }) }; },
    MimeType: { JSON: 'JSON', TEXT: 'TEXT' },
  },
  /* THE ADMIN SURFACE, STUBBED TO DO NOTHING. None of it runs while a payload is built; if one ever
     starts to, it throws here rather than pretending to have sent an e-mail. */
  UrlFetchApp: { fetch: () => { throw new Error('check/live.js: no network'); } },
  MailApp: { sendEmail: () => { throw new Error('check/live.js: refusing to send mail'); } },
  DriveApp: { getFolderById: () => null, getFileById: () => null },
  ScriptApp: {
    getScriptId: () => 'local',
    getOAuthToken: () => '',
    getProjectTriggers: () => [],
    newTrigger: () => { throw new Error('check/live.js: refusing to create a trigger'); },
    deleteTrigger: () => {},
    getService: () => ({ getUrl: () => '' }),
    getAuthorizationInfo: () => ({ getAuthorizationStatus: () => 'NOT_REQUIRED' }),
    AuthMode: { FULL: 'FULL' },
  },
  Session: { getActiveUser: () => ({ getEmail: () => '' }), getScriptTimeZone: () => 'Europe/London' },
};
sandbox.globalThis = sandbox;

const ORDER = ['constants', 'core', 'people', 'booking', 'content', 'setup', 'doget', 'dopost'];
const src = ORDER.map(n => fs.readFileSync(path.join(repo, 'backend', n + '.gs'), 'utf8')).join('\n;\n');

const ctx = vm.createContext(sandbox);
try {
  vm.runInContext(src, ctx, { filename: 'backend.gs' });
} catch (err) {
  console.error('check/live.js: the backend would not load — ' + err.message);
  process.exit(1);
}

const params = { parameter: AS ? { name: AS } : {} };
let payload;
try {
  const res = vm.runInContext('doGet(' + JSON.stringify(params) + ')', ctx);
  const text = out !== null ? out : (res && res.getContent ? res.getContent() : null);
  payload = JSON.parse(text);
} catch (err) {
  console.error('check/live.js: doGet threw — ' + err.message);
  console.error(err.stack.split('\n').slice(1, 6).join('\n'));
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify(payload, null, 1));

const n = k => (Array.isArray(payload[k]) ? payload[k].length
              : payload[k] && typeof payload[k] === 'object' ? Object.keys(payload[k]).length : payload[k]);
console.log('');
console.log('THE REAL PAYLOAD, FROM THE REAL SHEETS');
console.log('  version   : ' + payload.version);
console.log('  keys      : ' + Object.keys(payload).length);
/* `boxers`, `fights`, `cheatsheet` and `questions` are deliberately NOT in this list. The payload
   still carries those keys as empty arrays — see the note in doget.gs — and printing `boxers: 0`
   here would say "the boxers are empty" about 103 rows that are simply somewhere else. That is the
   fault this repository records five times over: I did not look, reported as I looked and there was
   nothing there. js/check-library.js is what counts those files. */
for (const k of ['people', 'venues', 'shop', 'links', 'posts', 'intervals',
                 'facts', 'landmarks', 'jobs']) {
  if (k in payload) console.log('  %s: %s', (k + '           ').slice(0, 10), n(k));
}
const cl = payload.dropdowns && payload.dropdowns.checklists;
if (cl) {
  let topics = 0, linked = 0;
  for (const s of Object.keys(cl)) for (const b of Object.keys(cl[s])) {
    for (const t of cl[s][b].topics) { topics++; if (t.link) linked++; }
  }
  console.log('  checklists: %d subjects, %d documents, %d with a link', Object.keys(cl).length, topics, linked);
}
console.log('');
console.log('written to ' + OUT);
console.log('render it:  node check/ui.js --payload ' + OUT);
