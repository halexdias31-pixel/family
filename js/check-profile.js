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
  const ORDER = ['constants', 'core', 'people', 'booking', 'content', 'setup', 'records', 'doget', 'dopost'];
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

/* ---------- THE PEOPLE -------------------------------------------------------------------------- */
const base = {
  pin: '0000', verified: 'TRUE', listed: true, dbs_checked: true, xp: 10, credits: 5,
  city: 'London', town: 'Mitcham', borough: 'Merton', postcode: 'ZZ1 1ZZ', address: '1 Example Road',
  phone: '+44 7700 900123', date_of_birth: new Date(1990, 2, 4),
  photo: 'https://example.org/p.jpg',
};
const tutor = Object.assign({}, base, {
  person_id: 'P-T1', role: 'tutor', first_name: 'Ada', last_name: 'Tutor',
  handle: 'adatutor', email: 'tutor@example.org',
  headline: 'Friendly maths tutor', video: 'https://example.org/v.mp4', years_experience: 5,
  favourite_colour: 'Blue', adjective_1: 'calm', adjective_2: 'clear', adjective_3: 'kind',
  travel_km: 10, rate_per_hour: 20, extra_seat_rate: 0.5, max_students: 4, min_students: 1,
  age_min: 8, age_max: 16,
  availability: 'm09,m10,tu15,sa11',
});
const admin = Object.assign({}, tutor, { person_id: 'P-A1', role: 'admin', first_name: 'Hal', last_name: 'Admin',
  handle: 'haladmin', email: 'admin@example.org' });
const parent = Object.assign({}, base, { person_id: 'P-C1', role: 'client', first_name: 'Pat', last_name: 'Parent',
  handle: 'patparent', email: 'parent@example.org' });
const student = Object.assign({}, base, { person_id: 'P-S1', role: 'student', first_name: 'Sam', last_name: 'Student',
  handle: 'samstudent', email: 'student@example.org',
  date_of_birth: new Date(2010, 6, 21), exam_small_date: new Date(2027, 4, 14), exam_big_date: new Date(2027, 5, 10) });
const PEOPLE = [admin, tutor, parent, student];
/* ---------- THEIR QUALIFICATIONS AND LIBRARY CARDS, AS ROWS ON TABS OF THEIR OWN ------------------
   The people tab was redesigned so a list is a tab — see `SCHEMA.people`. A PGCE and a QTS are
   ordinary rows. The admin and the tutor share the shelf, and everybody holds two library cards. */
const QUAL_ROWS = [];
['P-A1', 'P-T1'].forEach(pid => QUAL_ROWS.push(
  { person_id: pid, subject: 'Maths', level: 'A-Level', institution: 'Edexcel', grade: 'B', completed: '2019', teach: 'TRUE', can_teach: 'FALSE' },
  { person_id: pid, subject: 'Physics', level: 'GCSE', institution: 'AQA', grade: '8', completed: '2017', teach: 'FALSE', can_teach: 'TRUE' },
  { person_id: pid, subject: 'Bible and Theology', level: 'Degree', completed: 'Present', teach: 'FALSE', can_teach: 'FALSE' },
  { person_id: pid, subject: 'PGCE', teach: 'FALSE', can_teach: 'FALSE' },
  { person_id: pid, subject: 'QTS', teach: 'FALSE', can_teach: 'FALSE' }));
const LIB_ROWS = [];
PEOPLE.forEach(p => LIB_ROWS.push(
  { person_id: p.person_id, library: 'Merton', card_number: '12345678', pin: '0000' },
  { person_id: p.person_id, library: 'Sutton Central', card_number: '87654321', pin: '0000' }));

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
  /* THE PHOTOGRAPH SHELF'S FIRST BOX: a packed cell like the library's, so the change has to go in
     through `photosIn` and come back out through `photosOut` to be read back at all. */
  ['photos_1', 'https://example.org/second.jpg'],
];

const bad = [];
let saves = 0, rounds = 0, shuffles = 0;
const b = backend();
b.seed('people', PEOPLE);
b.seed('qualifications', QUAL_ROWS);
b.seed('library_cards', LIB_ROWS);
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

/* 9. THE BUSINESS RECORDS: an admin's and nobody else's, a refused page writes nothing, what is
   saved comes back by its slug, an unchanged page writes nothing, and an item left empty is not a
   row — see backend/records.gs and the Settings pages in js/records.js. */
{
  const a = tokens['P-A1'], t = tokens['P-T1'];
  const as = (who, body) => b.post(Object.assign({ token: who.token, name: who.name }, body));
  const page = over => [
    Object.assign({ id: 'pub_liability', title: 'Public liability insurance', category: 'Insurance',
      provider: 'Hiscox', reference: 'PL-1', due_on: '2027-03-12' }, over || {}),
    { id: 'prof_indemnity', title: 'Professional indemnity insurance', category: 'Insurance',
      provider: '', reference: '', due_on: '' },
  ];
  const no = as(t, { action: 'listRecords' });
  if (no.success || no.records) bad.push('a tutor was answered listRecords — the business records are an admin\'s');
  if (as(t, { action: 'saveRecordsPage', records: page() }).success) bad.push('a tutor was allowed saveRecordsPage');
  const refused = as(a, { action: 'saveRecordsPage', records: page({ due_on: '2027-13-40' }) });
  if (refused.success) bad.push('a page carrying a date that does not exist was saved');
  else if (refused.writes) bad.push('a refused page had already written ' + refused.writes + ' cell(s)');
  const saved = as(a, { action: 'saveRecordsPage', records: page() });
  if (!saved.success) bad.push('an admin could not save a page of records — ' + saved.error);
  const list = as(a, { action: 'listRecords' });
  const got = (list.records || []).find(r => r.id === 'pub_liability');
  if (!got) bad.push('a saved record did not come back from listRecords by its slug');
  else if (got.due_on !== '2027-03-12' || got.reference !== 'PL-1') bad.push('pub_liability came back as ' + JSON.stringify(got));
  if ((list.records || []).some(r => r.id === 'prof_indemnity')) bad.push('an item left empty was written as a row');
  const again = as(a, { action: 'saveRecordsPage', records: page() });
  if (!again.success || again.writes) bad.push('saving an unchanged page wrote ' + again.writes + ' cell(s)');
  const moved = as(a, { action: 'saveRecordsPage', records: page({ reference: 'PL-2' }) });
  const back = (as(a, { action: 'listRecords' }).records || []).filter(r => r.id === 'pub_liability');
  if (!moved.success || back.length !== 1 || back[0].reference !== 'PL-2')
    bad.push('changing a saved item did not update its one row — ' + JSON.stringify(back));
}

/* 10. RANDOMISE — A NEW WORD FOR YOUR OWN HANDLE, AND NOBODY ELSE'S.
   *"handles should be their name and a virtuous describing word. they can randomise it but it will
   follow that general name."* The Settings card has no handle box any more; its Randomise tile
   posts `randomiseHandle`, and these are the things that action must be, through the real `doPost`:
   the asker's first name, a virtue and a fresh two-digit number in a random order, never led by the
   digits (*"their first name, a virtuous adjective and random numbers and maybe an underscore. but
   all random order"*, 2 October — it was `ada_<virtue>` with no number until then), never the
   handle they already had, the old one at the FRONT of `handle_was` with the history capped at
   `HANDLE_WAS_KEEP`, what the next sign-in hands back, the asker's own row whatever id is posted, a
   refusal that writes nothing for somebody signed out — and `changeHandle`, the typed box it
   replaced, no longer an action at all. `check-handles.js` holds the generator's own rules. */
{
  const t = tokens['P-T1'];
  const VIRTUES = b.ev('HANDLE_ADJ'), KEEP = b.ev('HANDLE_WAS_KEEP');
  const shuffle = body => { shuffles++; return b.post(Object.assign({ action: 'randomiseHandle' }, body)); };
  const before = b.row('P-T1').handle;
  const d = shuffle({ token: t.token, name: t.name, personId: 'P-T1' });
  /* THE SHAPE, WRITTEN HERE RATHER THAN ASKED OF `handleParts_`: the asker's first name, a virtue
     and a number 10–99 in any of the four orders that do not lead with the digits, one underscore at
     most. Asking the backend's own parser would be the generator marking its own homework. */
  const W = '(' + VIRTUES.join('|') + ')', N = '([1-9][0-9])';
  const ADA_SHAPES = [['ada', W, N], [W, 'ada', N], ['ada', N, W], [W, N, 'ada']]
    .map(ps => new RegExp('^' + ps.join('_?') + '$'));
  const adaShaped = h => ADA_SHAPES.some(re => re.test(String(h || '')))
    && (String(h).match(/_/g) || []).length <= 1 && !/^[0-9]/.test(String(h));
  if (!d.success) bad.push('randomiseHandle was refused for a signed-in tutor — ' + d.error);
  else {
    if (!adaShaped(d.handle)) bad.push('randomiseHandle answered "' + d.handle
      + '" for somebody called Ada — wanted ada, a virtue and a two-digit number in a random order');
    if (b.row('P-T1').handle !== d.handle) bad.push('randomiseHandle answered "' + d.handle
      + '" and the row holds "' + b.row('P-T1').handle + '"');
    if (d.was !== before) bad.push('randomiseHandle said the old handle was "' + d.was + '", the row held "' + before + '"');
    if (String(b.row('P-T1').handle_was).split(', ')[0] !== before)
      bad.push('handle_was does not start with the handle just replaced — it reads "' + b.row('P-T1').handle_was + '"');
    if (!(b.row('P-T1').handle_changed_at instanceof Date)) bad.push('handle_changed_at was not written');
    const back = b.post({ action: 'verifyLogin', email: b.row('P-T1').email, pin: '0000' });
    tokens['P-T1'] = back;
    if (back.handle !== d.handle) bad.push('the next sign-in handed back "' + back.handle + '", not the randomised "' + d.handle + '"');
  }
  /* PRESSED AGAIN AND AGAIN: never the handle you have, and the history newest first and capped. */
  let prev = b.row('P-T1').handle, same = 0;
  const orders = [];
  for (let i = 0; i < KEEP + 4; i++) {
    const tk = tokens['P-T1'];
    const e = shuffle({ token: tk.token, name: tk.name, personId: 'P-T1' });
    if (!e.success) { bad.push('randomiseHandle press ' + (i + 2) + ' was refused — ' + e.error); break; }
    if (String(e.handle).replace(/_/g, '') === String(prev).replace(/_/g, '')) same++;
    if (!adaShaped(e.handle)) bad.push('press ' + (i + 2) + ' answered "' + e.handle + '" — not ada, a virtue and NN');
    orders[ADA_SHAPES.findIndex(re => re.test(e.handle))] = true;
    if (String(b.row('P-T1').handle_was).split(', ')[0] !== prev)
      bad.push('press ' + (i + 2) + ': handle_was does not start with "' + prev + '"');
    prev = e.handle;
  }
  if (same) bad.push('randomiseHandle handed back the handle the person already had, ' + same + ' time(s)');
  /* MORE THAN ONE ORDER OVER THE PRESSES — "but all random order". Not all four: fourteen presses
     miss one of four about one run in fourteen, and a check that is red by chance is a red nobody
     reads. One order in fourteen presses is a fixed order, one chance in sixty million. */
  if (orders.filter(Boolean).length < 2) bad.push('fourteen Randomise presses all laid the parts out '
    + 'in one order — the owner asked for a random one');
  const hist = String(b.row('P-T1').handle_was).split(', ');
  if (hist.length !== KEEP) bad.push('after ' + (KEEP + 5) + ' presses handle_was holds ' + hist.length
    + ' handle(s), wanted the last ' + KEEP);

  /* SOMEBODY ELSE'S ID POSTED: the gate writes `personId` from the token, so the asker's own changes. */
  const parentWas = b.row('P-C1').handle, mineWas = b.row('P-T1').handle;
  const tk = tokens['P-T1'];
  const other = shuffle({ token: tk.token, name: 'Pat Parent', personId: 'P-C1' });
  if (b.row('P-C1').handle !== parentWas) bad.push('a tutor\'s randomiseHandle naming P-C1 changed the PARENT\'s handle');
  if (!other.success || b.row('P-T1').handle === mineWas) bad.push('a randomiseHandle naming somebody else did not change the asker\'s own');

  /* SIGNED OUT: refused, and nothing written. */
  const out = shuffle({ name: 'Ada Tutor', personId: 'P-T1' });
  if (out.success) bad.push('randomiseHandle with no token was allowed');
  else if (out.writes) bad.push('a refused randomiseHandle had already written ' + out.writes + ' cell(s)');

  /* AND THE TYPED BOX IS GONE FROM THE SERVER TOO, not only from the phone. */
  const typed = b.post({ action: 'changeHandle', token: tokens['P-T1'].token, name: tokens['P-T1'].name,
    personId: 'P-T1', handle: 'ada_whatever' });
  if (typed.success || typed.writes) bad.push('changeHandle is still an action — a typed handle reached the sheet');
}

/* 10. THE AGE RANGE: A YOUNGEST OLDER THAN THE OLDEST IS REFUSED BEFORE ANYTHING IS WRITTEN, so is an
   age that is not on the list, and a real change comes back. About you posts the headline as well,
   and it is changed in the same request — so a refusal that let the rest of the page through would
   show up here as a headline that moved. As the tutor, because it is a tutor's field; the admin row
   is a copy of the tutor's and would prove nothing the tutor does not. */
{
  const t = tokens['P-T1'];
  const groups = b.ev('PROFILE_GROUPS');
  const ask = fields => b.post({ action: 'updateProfile', token: tokens['P-T1'].token, name: t.name,
    personId: 'P-T1', target: t.name, targetId: 'P-T1', fields });
  const now = () => b.ev(`profileOf_(read(TAB.people).rows.find(r => r.person_id === 'P-T1'))`);
  if ((groups['About you'] || []).indexOf('age_min') === -1 || (groups['About you'] || []).indexOf('age_max') === -1) {
    bad.push('the age range is not on About you, so a tutor has nowhere to say which ages they teach');
  } else {
    const before = now();
    [[{ age_min: '16', age_max: '8' }, 'the youngest after the oldest'],
     [{ age_min: 'Adults', age_max: '11' }, 'adults only, up to eleven'],
     [{ age_min: '2' }, 'an age that is not on the list'],
     [{ age_max: 'teenagers' }, 'a word that is not on the list']].forEach(([ages, what]) => {
      const fields = Object.assign(formOf(groups['About you'], before), { headline: 'Moved by a refused save' }, ages);
      const d = ask(fields);
      if (d.success) bad.push('About you with ' + what + ' was saved');
      else if (d.writes) bad.push('About you with ' + what + ' was refused ("' + d.error + '") having already written ' + d.writes + ' cell(s)');
    });
    if (now().headline !== before.headline) bad.push('a refused age range moved the headline anyway');
    const fields = Object.assign(formOf(groups['About you'], before), { age_min: '11', age_max: 'Adults' });
    const d = ask(fields);
    if (!d.success) bad.push('a real age range (11 to Adults) was refused — ' + d.error);
    else {
      const again = b.post({ action: 'verifyLogin', email: b.row('P-T1').email, pin: '0000' });
      tokens['P-T1'] = again;
      const pr = again.profile || {};
      if (String(pr.age_min) !== '11' || String(pr.age_max) !== 'Adults')
        bad.push('the age range saved as 11 to Adults came back as "' + pr.age_min + '" to "' + pr.age_max + '"');
      /* AND THE PAYLOAD SAYS IT THE WAY THE CARD READS IT: a number and the word. */
      const pay = b.get({ token: again.token });
      const me = (pay.tutors || []).find(x => x.personId === 'P-T1');
      if (!me) bad.push('the tutor is not in the payload, so the age range could not be read back');
      else if (me.ageMin !== 11 || me.ageMax !== 'Adults')
        bad.push('the payload sends the age range as ' + JSON.stringify(me.ageMin) + ' to ' + JSON.stringify(me.ageMax)
          + ', where the card reads a number and the word "Adults"');
      /* AND THE TWO LISTS THE FORM DRAWS FROM ARE THE ONES THE RULE ASKS ABOUT. */
      const v = pay.validations || {};
      const list = b.ev('AGE_OPTIONS');
      if (JSON.stringify(v.age_min) !== JSON.stringify(list) || JSON.stringify(v.age_max) !== JSON.stringify(list))
        bad.push('validations does not carry AGE_OPTIONS for both ends, so the form offers ages the server refuses');
    }
  }
}

/* 10. WHO IS SENT WHICH FIGURE ON A SESSION, BY THE REAL `doGet`.
   *"for tutor they shouldnt see grand total client pays, only grand total they earn. admin should be
   able to see grand total client pays. total tutor earns, and how much admin earns."* The phone only
   draws what arrives — see `jobMoney_` — so the rule that matters is the payload's: a client is
   never sent the split, a tutor on the job is sent their pay and not the client's total, an admin
   is sent all three. Asked of the cache-keyed GET each person really makes, with their token. */
{
  b.seed('jobs', [{ job_id: 'J-MONEY', status: 'active', subject: 'Maths', level: 'GCSE',
    weekday: 'Tuesday', start_time: '16:00', hours_per_session: 1, venue: 'Online',
    price_total: 270, tutor_pay: 135, admin_profit: 81, max_students: 4, open_to_others: 'FALSE' }]);
  /* NAMES READ OFF THE ROWS AS THEY ARE NOW — the saves above rename the parent, and a roster
     naming somebody who no longer exists is a session nobody is on. */
  const nameOf = pid => { const r = b.row(pid); return (r.first_name + ' ' + r.last_name).trim(); };
  b.seed('events', [
    { event_id: 'E1', at: new Date(2026, 8, 22), job_id: 'J-MONEY', actor: nameOf('P-C1'), role: 'client', action: 'Request' },
    { event_id: 'E2', at: new Date(2026, 8, 23), job_id: 'J-MONEY', actor: nameOf('P-T1'), role: 'tutor', action: 'Request' },
  ]);
  /* AND THE PAYLOAD CACHE, NOT ONLY THE ROW CACHE. `b.seed` writes the tab directly, which is what a
     hand edit is, and the six-hour payload does not know — so any visitor fetched earlier in this
     file is served the payload from before the seed. The age-range section above fetches the
     tutor's, so the tutor and nobody else was sent a payload with no J-MONEY in it, and this
     section reported the session "did not reach the tutor". `clearPayloadCache` is what a real
     write retires it with. */
  b.ev('clearCache()'); b.ev('clearPayloadCache()');
  const asWho = pid => {
    const t = tokens[pid]; if (!t) return null;
    const d = b.get({ person: pid, name: t.name, token: t.token });
    return (d.liveJobs || d.clientClasses || []).find(j => j.id === 'J-MONEY') || null;
  };
  const has = v => v !== '' && v != null;
  const c = asWho('P-C1'), t = asWho('P-T1'), a = asWho('P-A1');
  if (!c || !t || !a) bad.push('the seeded session did not reach ' + [!c && 'the client', !t && 'the tutor', !a && 'the admin'].filter(Boolean).join(', ') + ' — so who sees which figure was NOT checked');
  else {
    if (Number(c.price) !== 270) bad.push('the client was sent a price of ' + JSON.stringify(c.price) + ', wanted 270');
    if (has(c.tutorPay) || has(c.adminKeeps)) bad.push('the client was sent the split — tutorPay ' + JSON.stringify(c.tutorPay) + ', adminKeeps ' + JSON.stringify(c.adminKeeps));
    if (has(t.price)) bad.push('the tutor was sent the client\'s total, ' + JSON.stringify(t.price));
    if (Number(t.tutorPay) !== 135) bad.push('the tutor was sent tutorPay ' + JSON.stringify(t.tutorPay) + ', wanted 135');
    if (has(t.adminKeeps)) bad.push('the tutor was sent what the admin keeps, ' + JSON.stringify(t.adminKeeps));
    if (Number(a.price) !== 270 || Number(a.tutorPay) !== 135 || Number(a.adminKeeps) !== 81) {
      bad.push('the admin was sent price ' + a.price + ', tutorPay ' + a.tutorPay + ', adminKeeps ' + a.adminKeeps + ' — wanted 270, 135, 81');
    }
  }
}

/* 10. YOUR OWN FAMILY, THROUGH THE REAL `doGet`, AND NOBODY ELSE'S.
   ASKED FOR AS *"students should be able to see their parents and likewise"*. Two families on one
   tab, and the links that must NOT count beside the ones that must: a claim nobody answered and a
   claim refused, each naming somebody from the other family. A student sees their parent and not
   the other parent; a parent sees their child and not the other child; a stranger whose URL names
   the student sees nobody, because the list is built from the TOKEN. Its own backend, because the
   people above have no family and a link added there would change what they are sent. */
{
  const f = backend();
  const mk = (id, role, first, last) => Object.assign({}, base, { person_id: id, role, first_name: first,
    last_name: last, full_name: first + ' ' + last, handle: first.toLowerCase() + '_calm' + id.slice(-2),
    username: first.toLowerCase(), email: id.toLowerCase() + '@example.org' });
  f.seed('people', [mk('P-PA', 'client', 'Anna', 'Parent'), mk('P-PB', 'client', 'Bea', 'Parent'),
                    mk('P-SA', 'student', 'Abe', 'Child'), mk('P-SB', 'student', 'Ben', 'Child'),
                    mk('P-SC', 'student', 'Cal', 'Child'), mk('P-AD', 'admin', 'Ada', 'Boss')]);
  /* AND SIBLINGS, ON *"students should be able to see their parents and siblings likewise"*. Cal is
     Anna's second child, so Abe and Cal see each other; Ben is Bea's, and the only links between
     him and Anna's children are L3 (asked) and L4 (refused) — so until Abe says yes to Bea, Ben is
     nobody's brother here. After he does, Abe and Ben share an accepted parent and both appear. */
  f.seed('family', [
    { link_id: 'L1', parent_id: 'P-PA', child_id: 'P-SA', state: 'accepted' },
    { link_id: 'L5', parent_id: 'P-PA', child_id: 'P-SC', state: 'accepted' },
    { link_id: 'L2', parent_id: 'P-PB', child_id: 'P-SB', state: 'accepted' },
    { link_id: 'L3', parent_id: 'P-PB', child_id: 'P-SA', state: 'asked' },
    { link_id: 'L4', parent_id: 'P-PA', child_id: 'P-SB', state: 'refused' },
  ]);
  const tok = id => {
    const d = f.post({ action: 'verifyLogin', email: id.toLowerCase() + '@example.org', pin: '0000' });
    if (!d.success) bad.push('family: ' + id + ' could not sign in — ' + d.error);
    return d;
  };
  const fam = (d, label) => {
    if (!Array.isArray(d.family)) { bad.push('family: ' + label + ' was sent no `family` list at all'); return []; }
    if (d.family.some(x => x.email || x.phone || x.address || x.date_of_birth))
      bad.push('family: ' + label + ' was sent a private field on a family card');
    return d.family.map(x => x.relation + ':' + x.personId).sort().join(',');
  };
  const want = (label, got, exp) => { if (got !== exp) bad.push('family: ' + label + ' was sent [' + got + '] — wanted [' + exp + ']'); };
  /* AND STAMPED WITH WHOSE IT IS — the phone draws nothing whose `familyFor` is not the signed-in id. */
  const stamp = (d, label, exp) => { if (S(d.familyFor) !== exp) bad.push('family: ' + label + ' was stamped familyFor [' + S(d.familyFor) + '] — wanted [' + exp + ']'); return d; };
  const S = v => (v === undefined || v === null) ? '' : String(v);
  const sa = tok('P-SA'), pa = tok('P-PA'), pb = tok('P-PB'), sc = tok('P-SC');
  if (sa.token) want('the student P-SA', fam(stamp(f.get({ person: 'P-SA', name: sa.name, token: sa.token }), 'P-SA', 'P-SA'), 'P-SA'), 'parent:P-PA,sibling:P-SC');
  if (sc.token) want('the student P-SC', fam(stamp(f.get({ token: sc.token }), 'P-SC', 'P-SC'), 'P-SC'), 'parent:P-PA,sibling:P-SA');
  if (pa.token) want('the parent P-PA', fam(stamp(f.get({ person: 'P-PA', name: pa.name, token: pa.token }), 'P-PA', 'P-PA'), 'P-PA'), 'child:P-SA,child:P-SC');
  if (pb.token) want('the parent P-PB', fam(stamp(f.get({ person: 'P-PB', name: pb.name, token: pb.token }), 'P-PB', 'P-PB'), 'P-PB'), 'child:P-SB');
  want('a stranger whose URL names P-SA', fam(stamp(f.get({ person: 'P-SA', name: 'Abe Child' }), 'stranger', ''), 'stranger'), '');
  /* ---------- EVERYONE, ON AN ADMIN'S PEOPLE COLUMN, AND ON NOBODY ELSE'S ------------------------
     *"Admin should be able to see every one in the people column."* An admin's token is sent every
     student and client by id, and no private cell; a student, a parent and a stranger are sent
     nobody. The admin's own row is on `tutors`, so it is not repeated here. */
  {
    const ad = tok('P-AD');
    const ev = d => (Array.isArray(d.everyone) ? d.everyone : []).map(x => x.personId).sort().join(',');
    if (ad.token) {
      const d = f.get({ token: ad.token });
      want('the admin\'s `everyone`', ev(d), 'P-PA,P-PB,P-SA,P-SB,P-SC');
      if ((d.everyone || []).some(x => Object.keys(x).some(k => ['personId', 'title', 'handle', 'role', 'image'].indexOf(k) === -1)))
        bad.push('everyone: a field beyond what a card draws was sent — ' + JSON.stringify((d.everyone || [])[0]));
      if ((d.everyone || []).some(x => !x.title || !x.role)) bad.push('everyone: a row was sent with no name or role');
    }
    if (sa.token) want('a student\'s `everyone`', ev(f.get({ token: sa.token })), '');
    if (pa.token) want('a parent\'s `everyone`', ev(f.get({ token: pa.token })), '');
    want('a stranger whose URL names the admin', ev(f.get({ person: 'P-AD', name: 'Ada Boss' })), '');
  }
  /* THE REQUEST THAT BECOMES A LINK goes to the child it names and nobody else: P-SA has Bea's
     unanswered "this is my child" (L3), P-SB has only a REFUSED one (L4), and a stranger naming
     P-SA in the URL has none. This is also the payload that used to be an error — see `claims`. */
  const claimsOf = d => (Array.isArray(d.claims) ? d.claims : []).map(c => c.from).sort().join(',');
  const sb = tok('P-SB');
  if (sa.token) want('the claims sent to P-SA', claimsOf(f.get({ token: sa.token })), 'Bea Parent');
  if (sb.token) want('the claims sent to P-SB', claimsOf(f.get({ token: sb.token })), '');
  /* A CHILD OF ANOTHER FAMILY, AND AN ASKED LINK: Ben shares no ACCEPTED parent with Abe or Cal. */
  if (sb.token) want('the student P-SB (only an asked and a refused link to the other family)',
    fam(f.get({ token: sb.token }), 'P-SB'), 'parent:P-PB');
  if (pb.token) want('the claims sent to the parent who asked', claimsOf(f.get({ token: pb.token })), '');
  want('the claims sent to a stranger whose URL names P-SA', claimsOf(f.get({ person: 'P-SA', name: 'Abe Child' })), '');
  /* AND ANSWERING IT IS WHAT MAKES THE FAMILY: yes on L3 puts Bea on Abe's list, and Abe's claims
     empty. Only the child may answer — the parent who asked is refused. */
  if (sa.token && pb.token) {
    const row = ((f.get({ token: sa.token }).claims || [])[0] || {}).rowIndex;
    const byParent = f.post({ action: 'answerClaim', token: pb.token, rowIndex: row, accept: true });
    if (!byParent || !byParent.error) bad.push('family: the parent who asked could answer their own claim');
    const yes = f.post({ action: 'answerClaim', token: sa.token, rowIndex: row, accept: true });
    if (!yes || !yes.success) bad.push('family: P-SA could not accept Bea\'s claim — ' + JSON.stringify(yes));
    const after = f.get({ token: sa.token });
    want('P-SA after saying yes to Bea', fam(after, 'P-SA after yes'), 'parent:P-PA,parent:P-PB,sibling:P-SB,sibling:P-SC');
    if (sb.token) want('P-SB after Abe said yes to Bea', fam(f.get({ token: sb.token }), 'P-SB after yes'), 'parent:P-PB,sibling:P-SA');
    want('the claims left for P-SA after answering', claimsOf(after), '');
  }
}

/* 11. A STUDENT WITH NO EMAIL, THROUGH THE REAL `doPost`.
   ASKED FOR AS *"i have a student who doesnt have an email ... so he can still login."* A row with a
   blank address signs in by its handle and PIN, an address-holder cannot be reached by handle, and a
   forgotten PIN is reset only when a parent has accepted the link — the child's old PIN stops
   working, an unlinked child's does not. */
{
  const f = backend();
  const mk = (id, role, first, extra) => Object.assign({}, base, { person_id: id, role, first_name: first,
    last_name: 'Test', handle: first.toLowerCase() + '_calm', email: '' }, extra || {});
  f.seed('people', [mk('P-NP', 'client', 'Pat', { email: 'pat@example.org' }),
                    mk('P-NK', 'student', 'Kit'), mk('P-NL', 'student', 'Lee')]);
  f.seed('family', [{ link_id: 'L1', parent_id: 'P-NP', child_id: 'P-NK', state: 'accepted' }]);
  const inn = f.post({ action: 'verifyLogin', email: 'Kit_Calm', pin: '0000' });
  if (!inn || !inn.success) bad.push('no-email: a child with no address could not sign in by handle — ' + JSON.stringify(inn));
  /* AND A ROW THAT HAS AN ADDRESS ANSWERS TO ITS HANDLE TOO — the reverse of what this said until
     *"have the students be able to login with their handles too"*. Same person either door: the
     handle and the address must hand back the same `personId`, or the handle door signs somebody in
     as somebody else. */
  const viaHandle = f.post({ action: 'verifyLogin', email: '@Pat_Calm ', pin: '0000' });
  const viaMail = f.post({ action: 'verifyLogin', email: 'pat@example.org', pin: '0000' });
  if (!viaHandle || !viaHandle.success) bad.push('handle: a row that HAS an address could not sign in by its handle — ' + JSON.stringify(viaHandle));
  else if (!viaMail || !viaMail.success || String(viaHandle.personId) !== String(viaMail.personId) || String(viaHandle.personId) !== 'P-NP')
    bad.push('handle: the handle door and the address door resolved different people — ' + (viaHandle.personId) + ' vs ' + ((viaMail || {}).personId));
  const noSuch = f.post({ action: 'verifyLogin', email: 'nobody_calm', pin: '0000' });
  if (noSuch && noSuch.success) bad.push('handle: a handle nobody has signed somebody in');
  f.post({ action: 'forgotPin', who: 'lee_calm' });
  const leeStill = f.post({ action: 'verifyLogin', email: 'lee_calm', pin: '0000' });
  if (!leeStill || !leeStill.success) bad.push('no-email: a child with no linked parent had their PIN changed by a stranger');
  const said = f.post({ action: 'forgotPin', who: 'kit_calm' });
  if (!said || !said.success) bad.push('no-email: forgotPin for a linked child did not answer — ' + JSON.stringify(said));
  const kitOld = f.post({ action: 'verifyLogin', email: 'kit_calm', pin: '0000' });
  if (kitOld && kitOld.success) bad.push('no-email: the old PIN still works after the parent was sent a new one');
}

/* 12. A PROFILE PICTURE, THROUGH THE REAL `doPost`.
   ASKED FOR AS *"everyone should have a profile picture selector widget in account settings"*. The
   phone posts a square JPEG as a `data:` URL; `savePhoto` keeps it in Drive (`driveKeep_`, the helper
   `addPost` uses) and writes the address into `photo`. A Drive stood in for here: a folder that
   records what was put in it and whether it was shared, because a file only its owner can open is a
   broken square on every other phone. Four answers: it lands on YOUR row; a request naming somebody
   else still lands on yours; signed out is refused with nothing written; and something that is not a
   picture is refused with nothing written. And `remove` blanks the cell. */
let photos = 0;
{
  const f = backend();
  f.seed('people', PEOPLE);
  f.seed('config', [{ key: 'photos_folder', value: 'https://drive.google.com/drive/folders/FOLDER-photos-0001' }]);
  f.ev(`(function () {
    const made = [];
    globalThis.__MADE = made;
    DriveApp.Access = { ANYONE_WITH_LINK: 'ANYONE_WITH_LINK' };
    DriveApp.Permission = { VIEW: 'VIEW' };
    DriveApp.getFolderById = id => (id === 'FOLDER-photos-0001' ? { createFile: blob => {
      const file = { id: 'FILE' + made.length + '-abcdefghijklmnopqrstu', shared: '', blob,
        setSharing: (a, p) => { file.shared = a + '/' + p; return file; }, getId: () => file.id };
      made.push(file); return file; } } : null);
    Utilities.newBlob = (bytes, type, name) => ({ type, name, size: (bytes || []).length });
  })()`);
  const tk = {};
  ['P-T1', 'P-C1'].forEach(pid => {
    const p = PEOPLE.find(x => x.person_id === pid);
    const d = f.post({ action: 'verifyLogin', email: p.email, pin: '0000' });
    if (d && d.success) tk[pid] = d; else bad.push('photo: ' + pid + ' could not sign in — ' + JSON.stringify(d));
  });
  const JPEG = 'data:image/jpeg;base64,' + Buffer.from('a square face, 600 by 600').toString('base64');
  if (tk['P-T1'] && tk['P-C1']) {
    const parentWas = f.row('P-C1').photo;
    const mine = f.post({ action: 'savePhoto', token: tk['P-T1'].token, name: tk['P-T1'].name,
      personId: 'P-T1', data: JPEG });
    const made = f.ev('__MADE');
    if (!mine || !mine.success) bad.push('photo: a signed-in tutor could not save a picture — ' + JSON.stringify(mine));
    else {
      photos++;
      if (!/^https:\/\/drive\.google\.com\/file\/d\/FILE0-/.test(mine.photo)) bad.push('photo: the reply carried "' + mine.photo + '", not the Drive address of the file it kept');
      if (f.row('P-T1').photo !== mine.photo) bad.push('photo: the reply said ' + mine.photo + ' and the tutor\'s cell holds ' + f.row('P-T1').photo);
      if (!made.length || made[0].shared !== 'ANYONE_WITH_LINK/VIEW') bad.push('photo: the file was kept but not shared by link, so it is a broken square on every other phone');
      if (made.length && !/^photo-P-T1-\d+\.jpg$/.test(made[0].blob.name)) bad.push('photo: the file is called "' + (made[0].blob && made[0].blob.name) + '", wanted photo-P-T1-<time>.jpg');
    }
    /* SOMEBODY ELSE'S ID POSTED: the gate writes `personId` from the token, so the asker's own row. */
    const other = f.post({ action: 'savePhoto', token: tk['P-T1'].token, name: 'Pat Parent', personId: 'P-C1', data: JPEG });
    if (f.row('P-C1').photo !== parentWas) bad.push('photo: a tutor\'s savePhoto naming P-C1 changed the PARENT\'s picture');
    if (!other || !other.success || f.row('P-T1').photo !== other.photo) bad.push('photo: a savePhoto naming somebody else did not land on the asker\'s own row');
    else photos++;
    /* SIGNED OUT: refused, and nothing written — not the cell, and no file in the folder. */
    const files = f.ev('__MADE.length');
    const out = f.post({ action: 'savePhoto', name: 'Ada Tutor', personId: 'P-T1', data: JPEG });
    if (out && out.success) bad.push('photo: savePhoto with no token was allowed');
    else if (out.writes || f.ev('__MADE.length') !== files) bad.push('photo: a refused savePhoto had already written a cell or a file');
    /* NOT A PICTURE: refused by name, nothing kept. A link too — the picker never sends one. */
    [['data:text/html;base64,' + Buffer.from('<b>hi</b>').toString('base64'), 'an HTML file'],
     ['https://example.org/somebody-else.jpg', 'a link'], ['', 'nothing']].forEach(([data, what]) => {
      const was = f.row('P-T1').photo, n = f.ev('__MADE.length');
      const d = f.post({ action: 'savePhoto', token: tk['P-T1'].token, name: tk['P-T1'].name, personId: 'P-T1', data });
      if (d && d.success) bad.push('photo: ' + what + ' was accepted as a profile picture');
      if (f.row('P-T1').photo !== was || f.ev('__MADE.length') !== n) bad.push('photo: refusing ' + what + ' still wrote something');
    });
    /* REMOVE: the cell is blank, so the card draws the initial again. */
    const gone = f.post({ action: 'savePhoto', token: tk['P-C1'].token, name: tk['P-C1'].name, personId: 'P-C1', remove: true });
    if (!gone || !gone.success || f.row('P-C1').photo !== '') bad.push('photo: Remove did not blank the parent\'s picture — ' + JSON.stringify(gone));
    else photos++;
    if (f.row('P-T1').photo === '') bad.push('photo: the parent\'s Remove blanked the TUTOR\'s picture');
  }
  /* AND THE POSTS FOLDER IS THE FALLBACK, so the picker works with no new row in the config tab. */
  if (!/getPostFolder\(\)/.test(String(f.ev('getPhotoFolder_')))) bad.push('photo: getPhotoFolder_ no longer falls back to the posts folder');
}

/* 13. YOUR ROLES, THROUGH THE REAL `doPost` AND `doGet`.
   ASKED FOR AS *"each account should have a widget in account settings which say what the roles are.
   they can be either a tutor or client or student. they can be tutor and client and student like
   multiselect."* `setMyRoles` is the card's one action, and every rule it keeps is asked here of the
   sheet afterwards rather than of the reply: it lands on YOUR row whoever is named; signed out is
   refused with nothing written; admin cannot be ticked, and an admin's own admin survives a save;
   none ticked is refused; a ticked Tutor is held at `listed = PENDING` — not sent to a visitor, sent
   to the admin marked, not bookable by name, unable to take an open session, unable to message as a
   tutor — until the admin's Listed switch says yes; a role is not dropped while a live session holds
   it; and a row that is only a student cannot make itself a client. */
let roleRules = 0;
{
  const f = backend();
  const kid = Object.assign({}, base, { person_id: 'P-K1', role: 'student', first_name: 'Kit', last_name: 'Kid',
    handle: 'kitkid', email: 'kid@example.org', listed: '' });
  const boxer = Object.assign({}, tutor, { person_id: 'P-B1', role: 'tutor, head of boxing', first_name: 'George',
    last_name: 'Boxer', handle: 'georgeboxer', email: 'boxer@example.org' });
  /* `listed` BLANK for the parent, as on every row that predates the column — blank MEANS listed,
     which is exactly why a tick has to write the word rather than leave the cell alone. */
  const pat = Object.assign({}, parent, { listed: '' });
  f.seed('people', [admin, tutor, pat, student, kid, boxer]);
  const future = new Date(); future.setDate(future.getDate() + 30);
  const ddmm = d => d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  /* ADA IS TEACHING A SESSION NEXT MONTH that Pat has paid for; J-OPEN is a job open to any tutor. */
  f.seed('jobs', [{ job_id: 'J-LIVE', status: 'active', session_dates: ddmm(future), venue: 'Online' },
                  { job_id: 'J-OPEN', status: 'unconfirmed', session_dates: ddmm(future), venue: 'Online', stealable: 'TRUE' }]);
  f.seed('events', [
    { event_id: 'E1', job_id: 'J-LIVE', actor: 'Pat Parent', role: 'client', action: 'Request' },
    { event_id: 'E2', job_id: 'J-LIVE', actor: 'Ada Tutor', role: 'tutor', action: 'Accept', target: 'Pat Parent' },
    { event_id: 'E3', job_id: 'J-LIVE', actor: 'Pat Parent', role: 'client', action: 'Confirm' },
    { event_id: 'E4', job_id: 'J-OPEN', actor: 'Sam Student', role: 'client', action: 'Request' }]);
  const tk = {};
  [admin, tutor, pat, student, kid, boxer].forEach(p => {
    const d = f.post({ action: 'verifyLogin', email: p.email, pin: '0000' });
    if (d && d.success) tk[p.person_id] = d; else bad.push('roles: ' + p.person_id + ' could not sign in — ' + JSON.stringify(d));
  });
  const set = (pid, roles, extra) => f.post(Object.assign({ action: 'setMyRoles', token: tk[pid] && tk[pid].token,
    name: tk[pid] && tk[pid].name, personId: pid, roles }, extra || {}));
  const cell = pid => String(f.row(pid).role);
  const rule = (ok, said) => { if (ok) roleRules++; else bad.push('roles: ' + said); };
  if (Object.keys(tk).length === 6) {
    /* THE SIGN-IN REPLY SAYS WHETHER A TUTOR IS WAITING, so the phone's staff test can ask. */
    rule(tk['P-T1'].tutorPending === false, 'the sign-in reply carries no tutorPending:false for an approved tutor');

    /* SIGNED OUT: refused, nothing written. */
    const was = cell('P-C1');
    const out = f.post({ action: 'setMyRoles', name: 'Pat Parent', personId: 'P-C1', roles: ['client', 'student'] });
    rule(!(out && out.success) && !out.writes && cell('P-C1') === was, 'setMyRoles with no token was allowed, or wrote');

    /* OWN ROW ONLY: the tutor's token naming the parent's id changes the TUTOR's row. */
    const pw = cell('P-C1');
    const other = set('P-T1', ['tutor', 'student'], { personId: 'P-C1', name: 'Pat Parent' });
    rule(cell('P-C1') === pw, 'a tutor\'s setMyRoles naming P-C1 changed the PARENT\'s roles');
    rule(other && other.success && cell('P-T1') === 'tutor, student', 'a setMyRoles naming somebody else did not land on the asker\'s own row — '
      + JSON.stringify(other) + ' / ' + cell('P-T1'));

    /* ADMIN CANNOT BE TICKED — not alone, not beside a real role — and nothing is written. */
    const grab = set('P-C1', ['client', 'admin']);
    rule(!(grab && grab.success) && !grab.writes && !/admin/.test(cell('P-C1')), 'a parent ticked themselves Admin — ' + JSON.stringify(grab));
    rule(/given by @family/.test(String(grab && grab.error)), 'refusing Admin did not say it is given rather than chosen — ' + (grab && grab.error));
    /* AND AN ADMIN'S OWN ADMIN SURVIVES, with no approval wait on their own Tutor tick. */
    const ad = set('P-A1', ['client']);
    rule(ad && ad.success && cell('P-A1') === 'admin, client', 'an admin\'s save did not keep admin — ' + cell('P-A1'));
    const ad2 = set('P-A1', ['tutor', 'client']);
    rule(ad2 && ad2.success && !ad2.tutorPending && String(f.row('P-A1').listed) !== 'PENDING', 'an admin\'s own Tutor tick was held for approval');

    /* AT LEAST ONE. */
    const none = set('P-C1', []);
    rule(!(none && none.success) && !none.writes, 'a save with nothing ticked was accepted');

    /* A TITLE IS CARRIED THROUGH. */
    const gb = set('P-B1', ['tutor', 'student']);
    rule(gb && gb.success && cell('P-B1') === 'tutor, student, head of boxing', 'the title was lost — ' + cell('P-B1'));

    /* THE GATE ON TUTOR. Pat ticks it: role and the PENDING word, nothing else. */
    const tick = set('P-C1', ['tutor', 'client']);
    rule(tick && tick.success && tick.tutorPending === true, 'ticking Tutor did not come back pending — ' + JSON.stringify(tick));
    rule(cell('P-C1') === 'tutor, client' && String(f.row('P-C1').listed) === 'PENDING',
      'ticking Tutor wrote role "' + cell('P-C1') + '" and listed "' + f.row('P-C1').listed + '" — wanted tutor, client / PENDING');
    const named = list => (list.tutors || []).find(t => t.personId === 'P-C1');
    rule(!named(f.get({})), 'a pending tutor was sent to an anonymous visitor');
    const asAdmin = named(f.get({ token: tk['P-A1'].token }));
    rule(asAdmin && asAdmin.listed === false && asAdmin.pending === true, 'the admin was not sent the pending tutor, marked pending — '
      + JSON.stringify(asAdmin && { listed: asAdmin.listed, pending: asAdmin.pending }));
    const claim = f.post({ action: 'move', token: tk['P-C1'].token, name: 'Pat Parent', personId: 'P-C1', jobId: 'J-OPEN', role: 'tutor', move: 'Request' });
    rule(!(claim && claim.success), 'a pending tutor took an open session as its tutor');
    rule(!f.ev('read(TAB.events).rows').some(e => e.job_id === 'J-OPEN' && e.actor === 'Pat Parent'), 'a refused claim still wrote an event');
    const book = f.post({ action: 'createJob', token: tk['P-S1'].token, name: 'Sam Student', personId: 'P-S1', requestedTutor: 'Pat Parent',
      subject: 'Maths', level: 'GCSE', day: 'Monday', time: '16:00', location: 'Online', dates: ddmm(future), hours: 2, price: 40 });
    rule(!(book && book.success) && /not taking bookings/.test(String(book && book.error)), 'a pending tutor could be booked by name — ' + JSON.stringify(book));
    /* MESSAGING AS WHAT THEY ARE, NOT AS WHAT THEY TICKED: Kit (only a student) ticks Tutor and is still
       a student to the policy — may not write to a tutor. */
    const kt = set('P-K1', ['tutor', 'student']);
    rule(kt && kt.success && kt.tutorPending, 'a student could not ask to tutor — ' + JSON.stringify(kt));
    rule(f.ev("actingRole_(findPerson('P-K1'))") === 'student', 'a pending tutor who is a student acts as ' + f.ev("actingRole_(findPerson('P-K1'))"));
    const msg = f.post({ action: 'sendMessage', token: tk['P-K1'].token, name: 'Kit Kid', personId: 'P-K1', to: 'Ada Tutor', toId: 'P-T1', body: 'hello' });
    rule(!(msg && msg.success), 'a student who ticked Tutor could message a tutor');
    /* THE YES: the admin's Listed switch, and Pat is a tutor everywhere. */
    const yes = f.post({ action: 'setListed', token: tk['P-A1'].token, name: 'Hal Admin', personId: 'P-A1', who: 'Pat Parent', whoId: 'P-C1', on: true });
    rule(yes && yes.success && !f.ev("tutorPending_(findPerson('P-C1'))") && !!named(f.get({})), 'the admin\'s Listed switch did not approve the pending tutor');

    /* A CHILD'S ACCOUNT CANNOT MAKE ITSELF A CLIENT. Kit is a student (with a pending Tutor tick). */
    const kc = set('P-K1', ['client', 'student']);
    rule(!(kc && kc.success) && !kc.writes && !/client/.test(cell('P-K1')), 'a student-only account ticked itself Client — ' + JSON.stringify(kc));

    /* NOTHING DROPPED FROM UNDER A SESSION. Ada teaches J-LIVE next month; Pat pays for it. */
    const adaWas = cell('P-T1');
    const drop = set('P-T1', ['student']);
    rule(!(drop && drop.success) && !drop.writes && cell('P-T1') === adaWas && /1 session as a tutor/.test(String(drop && drop.error)),
      'unticking Tutor under a live session was not refused with the count — ' + JSON.stringify(drop) + ' / ' + cell('P-T1'));
    const pd = set('P-C1', ['tutor']);
    rule(!(pd && pd.success) && /as a client/.test(String(pd && pd.error)), 'unticking Client under a paid session was not refused — ' + JSON.stringify(pd));
    /* …and once the session is over, the same untick goes through. */
    f.ev("(function(){ const t = read(TAB.jobs); setCell(t, t.rows.find(j => j.job_id === 'J-LIVE'), 'status', 'ended'); })()");
    const drop2 = set('P-T1', ['student']);
    rule(drop2 && drop2.success && cell('P-T1') === 'student', 'unticking Tutor after the session ended was still refused — ' + JSON.stringify(drop2));

    /* AND THE ALIASES: a cell typed as `parent` reads as Client and saves as the canonical word. */
    f.ev("(function(){ const t = read(TAB.people); setCell(t, findPerson('P-B1'), 'role', 'parent'); })()");
    rule(JSON.stringify(f.ev("selfRolesOf_(findPerson('P-B1'))")) === '["client"]', 'a `parent` cell does not read as Client');
    const al = set('P-B1', ['client', 'student']);
    rule(al && al.success && cell('P-B1') === 'client, student', 'a `parent` cell saved as "' + cell('P-B1') + '", wanted client, student');
  }
}

/* 14. THE DAYS NOBODY IS TAUGHT, THROUGH THE REAL `doGet`.
   ASKED FOR as part of *"calander and time table and availability ... it seems they clash"*. The phone
   steps a booking's dates over `DATA.closures`, so what matters is what `doGet` puts in it: the bank
   holidays worked out for this year and next, an INSET day typed on the holidays tab, and a festive
   event the business is running — and NOT an observance nobody switched on, which is most of that
   tab and would otherwise cancel lessons on Valentine's Day. */
let closed = 0;
{
  const f = backend();
  const y = new Date().getFullYear();
  f.seed('holidays', [
    { holiday_id: 'H1', name: 'Staff training', date: '05/01/' + (y + 1), year: y + 1, kind: 'inset' },
    { holiday_id: 'H2', name: 'Halloween', date: '31/10/' + y, year: y, kind: 'observance', active: 'TRUE',
      event_name: 'Pumpkin carving', venue: 'Colliers Wood Library', price_per_child: 12 },
    { holiday_id: 'H3', name: "Valentine's Day", date: '14/02/' + (y + 1), year: y + 1, kind: 'observance', active: 'FALSE' },
  ]);
  const got = {};
  (f.get({}).closures || []).forEach(c => { got[c.date] = c; });
  const want = (date, kind, said) => {
    if (got[date] && got[date].kind === kind) closed++;
    else bad.push('closures: ' + said + ' (' + date + ') is ' + (got[date] ? 'sent as ' + got[date].kind : 'not sent'));
  };
  want('25/12/' + y, 'bank', 'Christmas Day this year');
  const ny = new Date(y + 1, 0, 1);
  while (ny.getDay() === 0 || ny.getDay() === 6) ny.setDate(ny.getDate() + 1);
  want('0' + ny.getDate() + '/01/' + (y + 1), 'bank', "next New Year's Day, on the weekday it is kept");
  want('05/01/' + (y + 1), 'inset', 'the INSET day typed on the holidays tab');
  want('31/10/' + y, 'festive', 'the Halloween event the business is running');
  if (got['14/02/' + (y + 1)]) bad.push("closures: Valentine's Day, an observance nobody switched on, closes teaching");
}

/* 15. A BOOKING BY NAME, AGAINST THE TUTOR'S WEEK, THROUGH THE REAL `createJob`.
   ASKED FOR AS *"tutor with no hours wont be bookable"*. The grey cells on the booking grid were
   advice: `createJob` wrote whatever hours it was sent. Now a named tutor is refused when they have
   ticked no hours at all, when an hour is outside their week, and when they are already teaching it
   in the weeks this booking runs — and a refusal writes no job. `No preference` books as before, and
   an older phone that sends no `slots` is checked off its `day` / `time` / `hours`. */
let hoursRules = 0;
{
  const f = backend();
  const nia = Object.assign({}, tutor, { person_id: 'P-T2', first_name: 'Nia', last_name: 'Nohours',
    handle: 'nianohours', email: 'nia@example.org', availability: '' });
  f.seed('people', [admin, tutor, parent, student, nia]);
  f.seed('config', [{ key: 'max_open_requests', value: 20 }]);
  const day = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  const mondayAfter = n => { const d = day(n); while (d.getDay() !== 1) d.setDate(d.getDate() + 1); return d; };
  const dmy = d => d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  const plus = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  /* ADA TEACHES MONDAY 09:00 FOR THREE WEEKS FROM NEXT WEEK — her own tick, a live roster. */
  const m1 = mondayAfter(7);
  f.seed('jobs', [{ job_id: 'J-ADA', status: 'active', weekday: 'Monday', start_time: '09:00', hours_per_session: 1,
    subject: 'Maths', venue: 'Online', session_dates: [m1, plus(m1, 7), plus(m1, 14)].map(dmy).join(', ') }]);
  f.seed('events', [
    { event_id: 'E1', job_id: 'J-ADA', actor: 'Pat Parent', role: 'client', action: 'Request' },
    { event_id: 'E2', job_id: 'J-ADA', actor: 'Ada Tutor', role: 'tutor', action: 'Accept', target: 'Pat Parent' }]);
  const tk = f.post({ action: 'verifyLogin', email: student.email, pin: '0000' });
  const jobs = () => f.ev('read(TAB.jobs).rows.length');
  const ask = (tutorName, extra) => {
    const was = jobs();
    const d = f.post(Object.assign({ action: 'createJob', token: tk.token, name: 'Sam Student', personId: 'P-S1',
      requestedTutor: tutorName, subject: 'Maths', level: 'GCSE', location: 'Online', hours: 1, price: 30 }, extra));
    return { d, wrote: jobs() - was };
  };
  const rule = (ok, said) => { if (ok) hoursRules++; else bad.push('tutor hours: ' + said); };
  if (!tk || !tk.success) bad.push('tutor hours: the student could not sign in — ' + JSON.stringify(tk));
  else {
    let r = ask('Nia Nohours', { day: 'Saturday', time: '11:00', slots: 'sa11', dates: dmy(day(40)) });
    rule(!r.d.success && /hasn.t set their hours/.test(String(r.d.error)) && !r.wrote,
      'a tutor with no hours was booked by name, or the refusal wrote a job — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Saturday', time: '11:00', slots: 'sa11', dates: dmy(day(40)) });
    rule(r.d.success && r.wrote === 1, 'Ada could not be booked inside her own week (Saturday 11:00) — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Sunday', time: '10:00', slots: 'su10', dates: dmy(day(40)) });
    rule(!r.d.success && /does not teach at Sunday 10:00/.test(String(r.d.error)) && !r.wrote,
      'an hour outside Ada\'s week was booked, or refused without naming it — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Saturday, Sunday', time: '11:00', slots: 'sa11,su10', dates: dmy(day(47)) });
    rule(!r.d.success && /does not teach at Sunday 10:00/.test(String(r.d.error)) && !r.wrote,
      'a booking whose SECOND day is outside Ada\'s week went through — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Monday', time: '09:00', slots: 'm09', dates: [plus(m1, 7), plus(m1, 14)].map(dmy).join(', ') });
    rule(!r.d.success && /already teaching at Monday 9:00|already teaching at Monday 09:00/.test(String(r.d.error)) && !r.wrote,
      'Monday 09:00 was sold twice in the weeks Ada already teaches it — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Monday', time: '09:00', slots: 'm09', dates: [plus(m1, 70), plus(m1, 77)].map(dmy).join(', ') });
    rule(r.d.success && r.wrote === 1, 'Monday 09:00 after Ada\'s session has ended was refused as busy — ' + JSON.stringify(r.d));
    r = ask('No preference', { day: 'Sunday', time: '10:00', slots: 'su10', dates: dmy(day(40)) });
    rule(r.d.success && r.wrote === 1, 'a booking with no tutor named was refused — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Sunday', time: '10:00', dates: dmy(day(54)) });
    rule(!r.d.success && /does not teach at Sunday 10:00/.test(String(r.d.error)) && !r.wrote,
      'an older phone sending no slots booked Ada outside her week — ' + JSON.stringify(r.d));
  }
}

/* 16. THE TIMETABLE, KEPT ON THE ACCOUNT, THROUGH THE REAL `doPost`.
   It lived on one phone. `saveTimetable` writes the `timetable` cell of the row the TOKEN resolves to
   (the docket's `savePerson`), so: it lands on yours; a request naming somebody else still lands on
   yours; signed out is refused with nothing written; something that is not the widget's shape is
   refused with nothing written; and the sign-in reply carries it back, which is how another phone
   gets it. */
let timetables = 0;
{
  const f = backend();
  f.seed('people', PEOPLE);
  const tk = {};
  ['P-S1', 'P-C1'].forEach(pid => {
    const p = PEOPLE.find(x => x.person_id === pid);
    const d = f.post({ action: 'verifyLogin', email: p.email, pin: '0000' });
    if (d && d.success) tk[pid] = d; else bad.push('timetable: ' + pid + ' could not sign in — ' + JSON.stringify(d));
  });
  const week = subj => JSON.stringify({ weekend: false, colours: {},
    days: [[{ id: 'L1', at: '09:00', subject: subj, note: '' }], [], [], [], [], [], []] });
  const rule = (ok, said) => { if (ok) timetables++; else bad.push('timetable: ' + said); };
  if (tk['P-S1'] && tk['P-C1']) {
    const parentWas = String(f.row('P-C1').timetable);
    const mine = f.post({ action: 'saveTimetable', token: tk['P-S1'].token, name: tk['P-S1'].name, personId: 'P-S1', timetable: week('Maths') });
    rule(mine && mine.success && /Maths/.test(String(f.row('P-S1').timetable)), 'a student could not keep their timetable — ' + JSON.stringify(mine));
    const other = f.post({ action: 'saveTimetable', token: tk['P-S1'].token, name: 'Pat Parent', personId: 'P-C1', timetable: week('Latin') });
    rule(String(f.row('P-C1').timetable) === parentWas && /Latin/.test(String(f.row('P-S1').timetable)),
      'a saveTimetable naming P-C1 wrote the PARENT\'s cell, or not the asker\'s — ' + JSON.stringify(other));
    const out = f.post({ action: 'saveTimetable', name: 'Sam Student', personId: 'P-S1', timetable: week('Art') });
    rule(!(out && out.success) && !out.writes, 'saveTimetable with no token was allowed, or wrote');
    ['not json', JSON.stringify({ days: [[], []] }), JSON.stringify({ days: 'monday' })].forEach(junk => {
      const was = String(f.row('P-S1').timetable);
      const d = f.post({ action: 'saveTimetable', token: tk['P-S1'].token, name: tk['P-S1'].name, personId: 'P-S1', timetable: junk });
      rule(!(d && d.success) && String(f.row('P-S1').timetable) === was, 'a timetable of the wrong shape (' + junk.slice(0, 20) + ') was kept');
    });
    const again = f.post({ action: 'verifyLogin', email: student.email, pin: '0000' });
    rule(again && /Latin/.test(String(again.timetable)), 'the sign-in reply does not carry the timetable back — ' + String(again && again.timetable));
  }
}

/* 17. A STUDENT'S TWO EXAM DATES REACH THE CALENDAR, ONCE EACH, THROUGH THE REAL `doGet`.
   `exam_small_date` and `exam_big_date` are written in Settings and the Calendar read only the exams
   tab. `doGet` merges the two cells into `exams` now — a mock and an exam — under the tab's own
   `maySee`, and a date the tab already holds for that person is the tab's row, not a second dot. */
let examDates = 0;
{
  const f = backend();
  f.seed('people', PEOPLE);
  f.seed('exams', [{ exam_id: 'X1', person_id: 'P-S1', subject: 'Maths', label: 'Paper 1', exam_date: '10/06/2027', kind: 'exam', active: 'TRUE' }]);
  const tok = pid => f.post({ action: 'verifyLogin', email: PEOPLE.find(p => p.person_id === pid).email, pin: '0000' });
  const s = tok('P-S1'), c = tok('P-C1'), a = tok('P-A1');
  const of = (t, pid) => (f.get({ token: t.token }).exams || []).filter(x => x.personId === pid)
    .map(x => x.date + ' ' + x.kind + ' ' + (x.subject || x.label)).sort().join(', ');
  const rule = (ok, said) => { if (ok) examDates++; else bad.push('exam dates: ' + said); };
  if (s && s.success && c && c.success && a && a.success) {
    const mine = of(s, 'P-S1');
    rule(mine === '10/06/2027 exam Maths, 14/05/2027 mock Small exam',
      'the student\'s own calendar holds [' + mine + '], wanted the tab\'s Maths on 10/06 once and the Small exam on 14/05');
    rule(of(a, 'P-S1') === mine, 'the admin is not sent the student\'s exam dates');
    rule(of(c, 'P-S1') === '', 'a parent who is not the student\'s family was sent their exam dates: ' + of(c, 'P-S1'));
  } else bad.push('exam dates: somebody could not sign in');
}

console.log(bad.length ? 'WRONG (' + bad.length + ')' : 'WRONG (0)');
bad.forEach(x => console.log('  ' + x));
console.log('');
console.log('people: ' + PEOPLE.length + '   saves: ' + saves + '   changes read back after signing in again: ' + rounds
  + '   handles randomised: ' + shuffles + '   pictures saved: ' + photos + '   role rules held: ' + roleRules
  + '   closed days sent: ' + closed + '   tutor-hours rules held: ' + hoursRules + '   timetable rules held: ' + timetables
  + '   exam-date rules held: ' + examDates);
if (bad.length) {
  console.log('FAILED — a Save that does not stick, or writes what nobody asked, is the one on the screen that only exists to change what the sheet holds.');
  process.exit(1);
}
console.log('OK — every settings page saves for every role, writes nothing when nothing changed, and reads back what was saved.');
