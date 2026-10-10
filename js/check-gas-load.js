/* ==================================================================================================
   @family. — check-gas-load.js

   THE WHOLE BACKEND IN ONE vm SCOPE, OVER AN IN-MEMORY LEDGER, FOR WHATEVER WANTS TO ASK IT.

   LIFTED OUT OF `check-profile.js`, WHICH WROTE IT, the day a second check needed it.
   `check-aimark.js` asks the real `doPost` what "Mark with AI" answers with no key, over the cap,
   and when Gemini sends back seven marks out of three — the same `doPost`, the same gate, the same
   token. A second copy of this harness would be the second reader this repository keeps recording
   under `documents_()`, `paperIdOf_` and `childrenOf`, and it would drift on the first Apps Script
   service somebody stubs in one and not the other. `check-marks-load.js` is the same move for the
   marking functions.

   `backend(extra)` — `extra` is merged over the default services before the scope is built, so a
   check can hand in its own `UrlFetchApp` (Gemini) without the default one learning about it. The
   default refuses the network outright: a check that reached the internet would be a check that
   passes or fails with somebody else's server.
================================================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const REPO = path.resolve(__dirname, '..');

/* ---------- WHAT A REAL SHEET DOES TO A STRING, INCLUDING THE 0 IT DROPS ----------------------------
   THIS KEPT A STRING OF DIGITS THAT STARTS WITH 0 AS A STRING, and a real sheet does not: `setValue`
   and a person typing both turn it into a number, so four noughts come back `0`. That one kindness
   was the whole reason no check here could see a child's PIN that started with 0 refused for ever —
   the harness was storing the PIN the sheet would have mangled. Every seeded PIN in these checks is
   the `0000` placeholder, so since this line every one of them arrives as the number 0, exactly as a
   PIN typed into the live sheet does, and signing in at all now proves `authPinLost_`. A leading
   apostrophe is still text — that is `cellSafe_`'s answer, and the sheet's. */
function coerce(v) {
  if (typeof v !== 'string') return v;
  if (v.charAt(0) === "'") return v.slice(1);
  const t = v.trim();
  let m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) { const d = new Date(+m[3], +m[2] - 1, +m[1]); return d.getDate() === +m[1] ? d : v; }
  m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  if (/^(true|false)$/i.test(t)) return /^true$/i.test(t);
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return v;
}

function backend(extra) {
  const tabs = {};
  const log = { writes: 0 };
  const cache = new Map();
  /* ---------- A TAB HAS A GRID, AND `getRange` REFUSES ANYTHING PAST IT -------------------------------
     THESE TABS WERE EXACTLY AS WIDE AS WHATEVER HAD BEEN WRITTEN TO THEM, and `getRange` wrote anywhere
     it was pointed. A real tab is a grid of a fixed size: a new one is 1000 x 26, one imported from an
     xlsx is sized to its content, and Apps Script answers a range past the edge with "The coordinates of
     the range are outside the dimensions of the sheet". The live `people` was imported at exactly 61
     columns with not one spare, so `ensureSchema` threw on its first tab every time it had a column to
     add — and no check here could see it, because no tab here had an edge.

     `gridOf[name]` is the size a check gives a tab (`grid(name, { cols, rows })`); with none, the
     Sheets default. A grid is never smaller than what is in it — `appendRow` widens and lengthens a
     real tab too — so only a check that pins a tab to its content meets an edge, and that is exactly
     the tab the 4 Oct import made. `insertColumnsAfter` widens it, as the real one does. */
  const gridOf = {};
  const sheetOf = name => {
    const grid = tabs[name];
    const rows = () => grid.length, cols = () => grid.reduce((n, r) => Math.max(n, r.length), 0);
    const maxCols = () => Math.max(cols(), (gridOf[name] || {}).cols || 26);
    const maxRows = () => Math.max(rows(), (gridOf[name] || {}).rows || 1000);
    return {
      getName: () => name, getLastRow: rows, getLastColumn: cols, getMaxRows: maxRows, getMaxColumns: maxCols,
      insertColumnsAfter(after, n) {
        const wide = maxCols() + n;                    // measured before the cells move, or n is counted twice
        grid.forEach(row => { if (row.length > after) row.splice(after, 0, ...new Array(n).fill('')); });
        gridOf[name] = { cols: wide, rows: (gridOf[name] || {}).rows };
        return this;
      },
      getRange(r, c, nr, nc) {
        nr = nr || 1; nc = nc || 1;
        if (r < 1 || c < 1 || r + nr - 1 > maxRows() || c + nc - 1 > maxCols()) {
          throw new Error('The coordinates of the range are outside the dimensions of the sheet. [' + name
            + ' is ' + maxRows() + ' x ' + maxCols() + '; asked for row ' + r + ', column ' + c + ', ' + nr + ' x ' + nc + ']');
        }
        const self = {
          getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => {
            const v = (grid[r - 1 + i] || [])[c - 1 + j]; return v === undefined ? '' : v; })),
          getValue: () => self.getValues()[0][0],
          setValue(v) {
            log.writes++;
            while (grid.length < r) grid.push([]);
            const row = grid[r - 1]; while (row.length < c) row.push('');
            row[c - 1] = coerce(v); return self;
          },
          setValues(vals) {
            vals.forEach((rw, i) => rw.forEach((v, j) => sheetOf(name).getRange(r + i, c + j).setValue(v)));
            return self;
          },
          setNumberFormat: () => self, setBackground: () => self, setFontWeight: () => self,
          /* `ensureSchema` REWROTE THE OPTIONS TAB through this until 10 Oct (`seedOptions` only adds
             now). Kept emptying the cells it covers rather than a no-op, so anything that still clears
             a range is seen doing it. */
          clearContent() {
            for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) {
              const row = grid[r - 1 + i]; if (row && c - 1 + j < row.length) row[c - 1 + j] = '';
            }
            return self;
          },
        };
        return self;
      },
      appendRow(vals) { grid.push(vals.map(coerce)); return this; },
      deleteRow(at) { grid.splice(at - 1, 1); },
      setFrozenRows() {}, setTabColor() {},
    };
  };
  const book = {
    getName: () => 'Ledger', getId: () => 'ledger',
    getSheets: () => Object.keys(tabs).map(sheetOf),
    getSheetByName: n => (tabs[n] ? sheetOf(n) : null),
    /* A NEW TAB HAS NO ROWS, so `appendRow` lands on row 1. It started as `[[]]` — one empty row — and
       the header `ensureSchema` appends to a tab it creates went to ROW 2, where `schemaGaps` (which
       reads row 1) could not find it: a tab created and reported as missing in the same breath. */
    insertSheet: n => { tabs[n] = []; gridOf[n] = { cols: 26, rows: 1000 }; return sheetOf(n); },
  };
  const props = {};
  let out = null;
  const sandbox = {
    console, JSON, Math, Date, String, Number, Boolean, Array, Object, RegExp, Error, isNaN, isFinite,
    parseInt, parseFloat, encodeURIComponent, decodeURIComponent, Map, Set, Promise, Symbol,
    SpreadsheetApp: { openById: () => book, getActiveSpreadsheet: () => book, flush: () => {} },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: k => (k in props ? props[k] : null),
        setProperty: (k, v) => { props[k] = String(v); },
        deleteProperty: k => { delete props[k]; },
        getProperties: () => Object.assign({}, props),
      }),
      getUserProperties() { return this.getScriptProperties(); },
    },
    /* A CACHE THAT KEEPS WHAT IT IS GIVEN, so the payload-key rule is asking a real question. */
    CacheService: { getScriptCache: () => ({
      get: k => (cache.has(k) ? cache.get(k) : null), put: (k, v) => { cache.set(k, v); },
      remove: k => { cache.delete(k); }, removeAll: ks => (ks || []).forEach(k => cache.delete(k)),
      getAll: ks => { const o = {}; (ks || []).forEach(k => { if (cache.has(k)) o[k] = cache.get(k); }); return o; },
      putAll: o => Object.keys(o || {}).forEach(k => cache.set(k, o[k])),
    }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock: () => true, releaseLock: () => {} }) },
    Logger: { log: () => {} },
    Utilities: {
      getUuid: () => crypto.randomUUID(), sleep: () => {},
      /* A DAY ASKED FOR AS A DAY. The whole ISO stamp for anything else, as before — but `aiMarkCount_`
         keys its tally on `yyyy-MM-dd`, and a stamp with milliseconds in it is a new day on every call,
         so the cap reset itself between presses and `check-aimark.js` caught 21 marks out of 20. */
      formatDate: (d, tz, fmt) => (fmt === 'yyyy-MM-dd' ? new Date(d).toISOString().slice(0, 10)
                                                         : new Date(d).toISOString()),
      base64Encode: s => Buffer.from(Array.isArray(s) ? s.map(b => b & 255) : String(s)).toString('base64'),
      base64EncodeWebSafe: s => Buffer.from(Array.isArray(s) ? s.map(b => b & 255) : String(s)).toString('base64url'),
      base64Decode: s => Array.from(Buffer.from(String(s), 'base64')),
      newBlob: s => ({ getBytes: () => Array.from(Buffer.from(String(s))), getDataAsString: () => String(s) }),
      computeDigest: (alg, s) => Array.from(crypto.createHash('sha256').update(String(s)).digest()).map(b => (b > 127 ? b - 256 : b)),
      DigestAlgorithm: { MD5: 'MD5', SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' },
    },
    ContentService: {
      createTextOutput: t => { out = t; const o = { setMimeType: () => o, getContent: () => t }; return o; },
      MimeType: { JSON: 'JSON', TEXT: 'TEXT', JAVASCRIPT: 'JAVASCRIPT' },
    },
    UrlFetchApp: { fetch: () => { throw new Error('no network'); } },
    MailApp: { sendEmail: () => {}, getRemainingDailyQuota: () => 100 },
    GmailApp: { sendEmail: () => {} },
    DriveApp: { getFolderById: () => null, getFileById: () => null },
    ScriptApp: { getScriptId: () => 'local', getOAuthToken: () => '', getProjectTriggers: () => [],
      newTrigger: () => ({ timeBased: () => ({ everyMinutes: () => ({ create() {} }), after: () => ({ create() {} }) }),
                           forSpreadsheet: () => ({ onChange: () => ({ create() {} }) }) }),
      deleteTrigger: () => {}, getService: () => ({ getUrl: () => '' }),
      getAuthorizationInfo: () => ({ getAuthorizationStatus: () => 'NOT_REQUIRED' }), AuthMode: { FULL: 'FULL' } },
    Session: { getActiveUser: () => ({ getEmail: () => '' }), getEffectiveUser: () => ({ getEmail: () => '' }),
               getScriptTimeZone: () => 'Europe/London' },
  };
  Object.assign(sandbox, extra || {});
  sandbox.globalThis = sandbox;
  /* `digest` WITH THE REST — `digestPreview` in dopost.gs calls into it, and `check-digest.js` runs its
     Sunday function on this same scope. */
  const ORDER = ['constants', 'core', 'people', 'booking', 'content', 'setup', 'records', 'digest', 'doget', 'dopost'];
  const missing = ORDER.filter(n => !fs.existsSync(path.join(REPO, 'backend', n + '.gs')));
  if (missing.length) {
    console.log('backend/' + missing.join('.gs, backend/') + '.gs could not be read, so NOTHING was checked — not a pass.');
    process.exit(1);
  }
  const src = ORDER.map(n => fs.readFileSync(path.join(REPO, 'backend', n + '.gs'), 'utf8')).join('\n;\n');
  const ctx = vm.createContext(sandbox);
  vm.runInContext(src, ctx, { filename: 'backend.gs' });
  const ev = s => vm.runInContext(s, ctx);
  const SCHEMA = ev('SCHEMA'), TAB = ev('TAB');
  Object.keys(TAB).forEach(k => { const n = TAB[k]; if (!tabs[n]) tabs[n] = [(SCHEMA[k] || SCHEMA[n] || []).slice()]; });
  return {
    /* `props` IS SCRIPT PROPERTIES, handed out so a check can put a key in or take one away. */
    ev, tabs, log, cache, props,
    /* `grid('people', { cols: 61 })` — the tab as an import leaves it: no column past its content. */
    grid(name, size) { gridOf[name] = Object.assign({}, gridOf[name], size); },
    seed(name, rows) {
      const h = tabs[name][0];
      /* THROUGH `coerce`, as a sheet would store them — a `TRUE` typed into a cell comes back a boolean,
         and a Save that compared a boolean against the string it posts would rewrite it every time. */
      rows.forEach(r => tabs[name].push(h.map(c => (r[c] === undefined ? '' : coerce(r[c])))));
    },
    row(pid) {
      const h = tabs.people[0];
      const r = tabs.people.find((x, i) => i > 0 && x[h.indexOf('person_id')] === pid);
      const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o;
    },
    post(body) {
      ev('clearCache()'); out = null; const w = log.writes;
      const res = ev('doPost(' + JSON.stringify({ postData: { contents: JSON.stringify(body) } }) + ')');
      const d = JSON.parse(out !== null ? out : res.getContent());
      Object.defineProperty(d, 'writes', { value: log.writes - w, enumerable: false });
      return d;
    },
    /* NO `clearCache()` HERE, unlike `post`: the payload-key rule is a question about what the cache
       hands back, and clearing it before each GET would make every request a miss. */
    get(params) {
      out = null;
      const res = ev('doGet(' + JSON.stringify({ parameter: params || {} }) + ')');
      return JSON.parse(out !== null ? out : res.getContent());
    },
  };
}


module.exports = { backend: backend, coerce: coerce };
