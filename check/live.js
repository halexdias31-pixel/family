#!/usr/bin/env node
/* @family. — check/live.js THE REAL BACKEND, RUN AGAINST THE REAL DATABASE, HERE. § */
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

/* ---------- THE SHEET, AS APPS SCRIPT SEES IT § */
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

/* The ids in constants.gs, mapped back to the keys in the dump. § */
const constants = fs.readFileSync(path.join(repo, 'backend', 'constants.gs'), 'utf8');
const idFor = {};
for (const m of constants.matchAll(/const\s+(LEDGER|SETTINGS)_ID\s*=\s*"([^"]+)"/g)) {
  idFor[m[2]] = m[1].toLowerCase();
}
/* ONE NOW. Settings was folded into the Ledger and its id deleted; a dump with a "settings" key
   still works, the key is simply never opened. */
if (!Object.values(idFor).includes('ledger')) {
  console.error('check/live.js: could not read LEDGER_ID out of constants.gs — found ' +
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
/* `boxers`, `fights`, `cheatsheet` and `questions` are deliberately NOT in this list. § */
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
