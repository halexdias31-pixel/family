#!/usr/bin/env node
/* ==================================================================================================
   node js/check-profile.js — YOUR SETTINGS, SAVED AND READ BACK, THROUGH THE REAL BACKEND

   REPORTED AS *"some things arent updating when i click save. also the whole saving process feels very
   unresponsive"*, and an audit found four faults under it, every one of them invisible to the suite:

     · THE SIGN-IN REPLY THREW AWAY `profileOf_`. It set `profile: profileOf_(r)` and ten lines later
       replaced it with the raw cells — so the qualification shelf, the library cards, the phone's two
       boxes, the birthday's three and the exam pickers opened empty, and a Save wrote the blanks back.
     · NOBODY BUT AN ADMIN COULD SAVE AT ALL. `updateProfile` compared the phone's `targetId` (an id)
       with `body.name` (a display name the gate had just written), so every tutor, parent and student
       was refused "Not authorised to edit that profile."
     · A REFUSED SAVE HAD ALREADY WRITTEN. The phone and the birthday were written before the e-mail
       clash was asked about, so "That e-mail address is already on another account" came back over a
       row that had changed.
     · THE PAYLOAD CACHE WAS KEYED ON `?person=` AND `?name=`, so a stranger typing the admin's id and
       name into the address was handed the admin's payload — every child in `students`.

   NOT A SECOND IMPLEMENTATION. Every `.gs` file is loaded into one vm scope, in `check/live.js`'s
   order, over an in-memory Ledger whose tabs carry `SCHEMA`'s own headers, and every request goes in
   through the real `doPost`/`doGet`. `setValue` parses a string the way a UK-locale sheet does — a
   `dd/mm/yyyy` or ISO string becomes a Date, `TRUE` a boolean, a plain number a number, and a leading
   apostrophe is text and not part of the value — because what a Save writes is compared with what the
   sheet hands back, and a stub that stored strings as given would call every Date a change.

   WHAT THE FORM POSTS is built from the group lists the backend sends, with the three substitutions the
   form makes (`phone` → its two boxes, `date_of_birth` → its three, a checkbox → TRUE/FALSE) — the
   same names `settingsPages_` draws. `check-flow.js` drives the real form; this asks the backend.

   The people are invented, their PINs are 0000 and their addresses are on example.org.
================================================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const REPO = path.resolve(__dirname, '..');

function coerce(v) {
  if (typeof v !== 'string') return v;
  if (v.charAt(0) === "'") return v.slice(1);
  const t = v.trim();
  let m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) { const d = new Date(+m[3], +m[2] - 1, +m[1]); return d.getDate() === +m[1] ? d : v; }
  m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  if (/^(true|false)$/i.test(t)) return /^true$/i.test(t);
  if (/^-?\d+(\.\d+)?$/.test(t) && !/^0\d/.test(t)) return Number(t);
  return v;
}

function backend() {
  const tabs = {};
  const log = { writes: 0 };
  const cache = new Map();
  const sheetOf = name => {
    const grid = tabs[name];
    const rows = () => grid.length, cols = () => grid.reduce((n, r) => Math.max(n, r.length), 0);
    return {
      getName: () => name, getLastRow: rows, getLastColumn: cols, getMaxRows: rows, getMaxColumns: cols,
      getRange(r, c, nr, nc) {
        nr = nr || 1; nc = nc || 1;
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
    insertSheet: n => { tabs[n] = [[]]; return sheetOf(n); },
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
      formatDate: d => new Date(d).toISOString(),
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
  sandbox.globalThis = sandbox;
  const ORDER = ['constants', 'core', 'people', 'booking', 'content', 'setup', 'doget', 'dopost'];
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
    ev, tabs, log, cache,
    seed(name, rows) {
      const h = tabs[name][0];
      rows.forEach(r => tabs[name].push(h.map(c => (r[c] === undefined ? '' : r[c]))));
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

/* ---------- THE PEOPLE -------------------------------------------------------------------------- */
const base = {
  pin: '0000', verified: 'TRUE', listed: true, dbs_checked: true, xp: 10, credits: 5,
  city: 'London', town: 'Mitcham', borough: 'Merton', postcode: 'ZZ1 1ZZ', address: '1 Example Road',
  phone: '+44 7700 900123', date_of_birth: new Date(1990, 2, 4),
  library_card: 'Merton:12345678:0000|Sutton Central:87654321:0000', library_note: 'renew in May',
  photo: 'https://example.org/p.jpg',
};
const tutor = Object.assign({}, base, {
  person_id: 'P-T1', role: 'tutor', first_name: 'Ada', last_name: 'Tutor', full_name: 'Ada Tutor',
  handle: 'adatutor', username: 'adatutor', email: 'tutor@example.org',
  headline: 'Friendly maths tutor', video: 'https://example.org/v.mp4', years_experience: 5,
  favourite_colour: 'Blue', adjective_1: 'calm', adjective_2: 'clear', adjective_3: 'kind',
  travel_km: 10, rate_per_hour: 20, extra_seat_rate: 0.5, max_students: 4, min_students: 1,
  availability: 'm09,m10,tu15,sa11',
  quals: 'Maths:A-Level:Edexcel:B~2019~ts|Physics:GCSE:AQA:8~2017~t|Bible and Theology:Degree::~Present~',
  qual_1: 'Maths', qual_1_level: 'A-Level', qual_1_board: 'Edexcel', qual_1_grade: 'B',
  qual_2: 'Physics', qual_2_level: 'GCSE', qual_2_board: 'AQA', qual_2_grade: '8',
  qual_3: 'Bible and Theology', qual_3_level: 'Degree',
  teaches_1: 'Maths', teaches_1_level: 'A-Level', teaches_also: 'Physics (GCSE)',
  teaches_2: 'Physics', teaches_2_level: 'GCSE', extra_quals: 'PGCE, QTS',
});
const admin = Object.assign({}, tutor, { person_id: 'P-A1', role: 'admin', first_name: 'Hal', last_name: 'Admin',
  full_name: 'Hal Admin', handle: 'haladmin', username: 'haladmin', email: 'admin@example.org' });
const parent = Object.assign({}, base, { person_id: 'P-C1', role: 'client', first_name: 'Pat', last_name: 'Parent',
  full_name: 'Pat Parent', handle: 'patparent', username: 'patparent', email: 'parent@example.org' });
const student = Object.assign({}, base, { person_id: 'P-S1', role: 'student', first_name: 'Sam', last_name: 'Student',
  full_name: 'Sam Student', handle: 'samstudent', username: 'samstudent', email: 'student@example.org',
  date_of_birth: new Date(2010, 6, 21), exam_small_date: new Date(2027, 4, 14), exam_big_date: new Date(2027, 5, 10) });
const PEOPLE = [admin, tutor, parent, student];

/* ---------- WHAT THE FORM POSTS ------------------------------------------------------------------ */
const BOX = /^(qual_\d+_(teach|spec))$|^(m|tu|w|th|f|sa|su)\d\d$/;
function formOf(list, profile) {
  const names = [];
  list.forEach(f => {
    if (f === 'phone') names.push('phone_cc', 'phone_no');
    else if (f === 'date_of_birth') names.push('dob_d', 'dob_m', 'dob_y');
    else names.push(f);
  });
  const out = {};
  names.forEach(f => {
    const v = profile[f];
    out[f] = BOX.test(f) ? (/^(true|yes|1)$/i.test(String(v)) ? 'TRUE' : 'FALSE')
                         : String(v === undefined || v === null ? '' : v).trim();
  });
  return out;
}
/* One field per page to change, and what the form will show for it after signing in again. */
const CHANGE = [
  ['headline', 'A new headline'], ['town', 'Wimbledon'], ['phone_no', '7700 900999'],
  ['lib1_name', 'Wimbledon'], ['qual_2_received', '2016'], ['rate_per_hour', '26'],
  ['tu16', 'TRUE'], ['exam_small_date', '2027-05-20'], ['first_name', 'Patricia'],
];

const bad = [];
let saves = 0, rounds = 0;
const b = backend();
b.seed('people', PEOPLE);
const tokens = {};
PEOPLE.forEach(p => {
  const d = b.post({ action: 'verifyLogin', email: p.email, pin: '0000' });
  if (!d.success) { bad.push(p.person_id + ': could not sign in — ' + d.error); return; }
  tokens[p.person_id] = d;
});
if (!Object.keys(tokens).length) {
  console.log('Nobody could sign in, so NOTHING was checked — not a pass.');
  process.exit(1);
}

/* 1. THE SIGN-IN REPLY'S PROFILE IS `profileOf_`, EVERY KEY OF IT. */
PEOPLE.forEach(p => {
  const reply = tokens[p.person_id]; if (!reply) return;
  const want = b.ev(`profileOf_(read(TAB.people).rows.find(r => r.person_id === ${JSON.stringify(p.person_id)}))`);
  const diff = Object.keys(want).filter(k => JSON.stringify(want[k]) !== JSON.stringify((reply.profile || {})[k]));
  if (diff.length) bad.push(p.person_id + ': the sign-in reply\'s profile is not profileOf_ on ' + diff.length
    + ' key(s) — ' + diff.slice(0, 6).join(', ') + ' — so the settings form opens without them and a Save writes them back');
});

/* 2, 3, 4. EVERY PAGE, EVERY ROLE: a no-change Save succeeds and writes nothing; a change comes back. */
const GROUPS = { admin: 'PROFILE_GROUPS', tutor: 'PROFILE_GROUPS', client: 'CLIENT_GROUPS', student: 'STUDENT_GROUPS' };
PEOPLE.forEach(p => {
  const reply = tokens[p.person_id]; if (!reply) return;
  const groups = b.ev(GROUPS[p.role]);
  Object.keys(groups).forEach(g => {
    const ask = fields => b.post({ action: 'updateProfile', token: tokens[p.person_id].token, name: reply.name,
      personId: p.person_id, target: reply.name, targetId: p.person_id, fields });
    let profile = b.ev(`profileOf_(read(TAB.people).rows.find(r => r.person_id === ${JSON.stringify(p.person_id)}))`);
    const same = ask(formOf(groups[g], profile)); saves++;
    if (!same.success) { bad.push(p.person_id + ' · ' + g + ': a Save with nothing changed was refused — ' + same.error); return; }
    if (same.writes) bad.push(p.person_id + ' · ' + g + ': a Save with nothing changed wrote ' + same.writes + ' cell(s)');
    const pick = CHANGE.find(([f]) => formOf(groups[g], profile)[f] !== undefined);
    if (!pick) return;
    const fields = formOf(groups[g], profile); fields[pick[0]] = pick[1];
    const moved = ask(fields); saves++;
    if (!moved.success) { bad.push(p.person_id + ' · ' + g + ': changing ' + pick[0] + ' was refused — ' + moved.error); return; }
    const again = b.post({ action: 'verifyLogin', email: b.row(p.person_id).email, pin: '0000' });
    tokens[p.person_id] = again;
    const got = (again.profile || {})[pick[0]];
    rounds++;
    if (String(got) !== String(pick[1]) && !(pick[1] === 'TRUE' && /^true$/i.test(String(got))))
      bad.push(p.person_id + ' · ' + g + ': ' + pick[0] + ' saved as "' + pick[1] + '" and came back after signing in as "' + got + '"');
  });
});

/* 5. A REFUSED SAVE HAS WRITTEN NOTHING. Somebody else's address, a new phone and a new birthday —
   as the admin, because the admin is the one role whose Save reached the writes before the gate was
   repaired, so it is the one that could prove the old order wrong. */
{
  const reply = tokens['P-A1'];
  const profile = b.ev(`profileOf_(read(TAB.people).rows.find(r => r.person_id === 'P-A1'))`);
  const fields = formOf(b.ev('PROFILE_GROUPS')['Contact & address'] || ['email', 'phone', 'date_of_birth'], profile);
  Object.assign(fields, { email: 'parent@example.org', phone_no: '7700 900555', dob_d: '9', dob_m: '9', dob_y: '1999' });
  const d = b.post({ action: 'updateProfile', token: reply.token, name: reply.name, personId: 'P-A1',
    target: reply.name, targetId: 'P-A1', fields });
  if (d.success) bad.push('a Contact Save carrying another account\'s e-mail was accepted');
  else if (d.writes) bad.push('a Contact Save refused ("' + d.error + '") had already written ' + d.writes + ' cell(s)');
}

/* 6. NOBODY SAVES SOMEBODY ELSE'S ROW, and an admin still may. */
{
  const t = tokens['P-T1'];
  const d = b.post({ action: 'updateProfile', token: t.token, name: t.name, personId: 'P-T1',
    target: 'Pat Parent', targetId: 'P-C1', fields: { town: 'Nowhere' } });
  if (d.success || d.writes) bad.push('a tutor saved a parent\'s row');
  const a = tokens['P-A1'];
  const e = b.post({ action: 'updateProfile', token: a.token, name: a.name, personId: 'P-A1',
    target: 'Pat Parent', targetId: 'P-C1', fields: { town: 'Sutton' } });
  if (!e.success) bad.push('an admin could not save a parent\'s row — ' + e.error);
}

/* 7. A NEW PIN KEEPS THE PHONE THAT CHANGED IT SIGNED IN. */
{
  const t = tokens['P-S1'];
  const d = b.post({ action: 'changePin', token: t.token, name: t.name, personId: 'P-S1', currentPin: '0000', newPin: '4826' });
  if (!d.success) bad.push('changePin was refused — ' + d.error);
  else if (!d.token) bad.push('changePin answered with no token, so the phone that changed the PIN is signed out on the server and still looks signed in');
  else {
    const old = b.post({ action: 'myProfile', token: t.token, name: t.name, personId: 'P-S1' });
    if (old.success) bad.push('the session from before the PIN change still works');
    if (old.why !== 'signed-out') bad.push('a dead session is not answered with why: "signed-out", so the phone cannot tell');
    const fresh = b.post({ action: 'myProfile', token: d.token, name: t.name, personId: 'P-S1' });
    if (!fresh.success) bad.push('the token changePin handed back does not work — ' + fresh.error);
  }
}

/* 8. `myProfile` IS YOUR OWN ROW, WHOEVER YOU CLAIM TO BE. */
{
  const t = tokens['P-C1'];
  const d = b.post({ action: 'myProfile', token: t.token, name: 'Hal Admin', personId: 'P-A1' });
  if (!d.success || d.personId !== 'P-C1') bad.push('myProfile answered for ' + d.personId + ' when the token is P-C1');
}

/* 9. THE PAYLOAD A STRANGER GETS DOES NOT DEPEND ON WHO THE URL SAYS THEY ARE. */
{
  const a = tokens['P-A1'];
  b.get({ person: 'P-A1', name: 'Hal Admin', token: a.token });
  const stranger = b.get({ person: 'P-A1', name: 'Hal Admin' });
  if ((stranger.students || []).length) bad.push('a request with the admin\'s id and name in the URL and NO token was served '
    + (stranger.students || []).length + ' student(s) — the cache is keyed on the URL');
}

console.log(bad.length ? 'WRONG (' + bad.length + ')' : 'WRONG (0)');
bad.forEach(x => console.log('  ' + x));
console.log('');
console.log('people: ' + PEOPLE.length + '   saves: ' + saves + '   changes read back after signing in again: ' + rounds);
if (bad.length) {
  console.log('FAILED — a Save that does not stick, or writes what nobody asked, is the one on the screen that only exists to change what the sheet holds.');
  process.exit(1);
}
console.log('OK — every settings page saves for every role, writes nothing when nothing changed, and reads back what was saved.');
