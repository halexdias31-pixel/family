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
   follow that general name."* The Settings card has no handle box any more; its Randomise button
   posts `randomiseHandle`, and these are the things that action must be, through the real `doPost`:
   the asker's first name and a virtue with no number (nothing else here is called Ada), never the
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
  const m = String(d.handle || '').match(/^ada_([a-z]+)$/);
  if (!d.success) bad.push('randomiseHandle was refused for a signed-in tutor — ' + d.error);
  else {
    if (!m || VIRTUES.indexOf(m[1]) === -1) bad.push('randomiseHandle answered "' + d.handle
      + '" for somebody called Ada — wanted ada_<virtue>, with no number when nothing clashes');
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
  for (let i = 0; i < KEEP + 4; i++) {
    const tk = tokens['P-T1'];
    const e = shuffle({ token: tk.token, name: tk.name, personId: 'P-T1' });
    if (!e.success) { bad.push('randomiseHandle press ' + (i + 2) + ' was refused — ' + e.error); break; }
    if (e.handle === prev) same++;
    if (String(b.row('P-T1').handle_was).split(', ')[0] !== prev)
      bad.push('press ' + (i + 2) + ': handle_was does not start with "' + prev + '"');
    prev = e.handle;
  }
  if (same) bad.push('randomiseHandle handed back the handle the person already had, ' + same + ' time(s)');
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
                    mk('P-SA', 'student', 'Abe', 'Child'), mk('P-SB', 'student', 'Ben', 'Child')]);
  f.seed('family', [
    { link_id: 'L1', parent_id: 'P-PA', child_id: 'P-SA', state: 'accepted' },
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
  const sa = tok('P-SA'), pa = tok('P-PA'), pb = tok('P-PB');
  if (sa.token) want('the student P-SA', fam(stamp(f.get({ person: 'P-SA', name: sa.name, token: sa.token }), 'P-SA', 'P-SA'), 'P-SA'), 'parent:P-PA');
  if (pa.token) want('the parent P-PA', fam(stamp(f.get({ person: 'P-PA', name: pa.name, token: pa.token }), 'P-PA', 'P-PA'), 'P-PA'), 'child:P-SA');
  if (pb.token) want('the parent P-PB', fam(stamp(f.get({ person: 'P-PB', name: pb.name, token: pb.token }), 'P-PB', 'P-PB'), 'P-PB'), 'child:P-SB');
  want('a stranger whose URL names P-SA', fam(stamp(f.get({ person: 'P-SA', name: 'Abe Child' }), 'stranger', ''), 'stranger'), '');
  /* THE REQUEST THAT BECOMES A LINK goes to the child it names and nobody else: P-SA has Bea's
     unanswered "this is my child" (L3), P-SB has only a REFUSED one (L4), and a stranger naming
     P-SA in the URL has none. This is also the payload that used to be an error — see `claims`. */
  const claimsOf = d => (Array.isArray(d.claims) ? d.claims : []).map(c => c.from).sort().join(',');
  const sb = tok('P-SB');
  if (sa.token) want('the claims sent to P-SA', claimsOf(f.get({ token: sa.token })), 'Bea Parent');
  if (sb.token) want('the claims sent to P-SB', claimsOf(f.get({ token: sb.token })), '');
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
    want('P-SA after saying yes to Bea', fam(after, 'P-SA after yes'), 'parent:P-PA,parent:P-PB');
    want('the claims left for P-SA after answering', claimsOf(after), '');
  }
}

console.log(bad.length ? 'WRONG (' + bad.length + ')' : 'WRONG (0)');
bad.forEach(x => console.log('  ' + x));
console.log('');
console.log('people: ' + PEOPLE.length + '   saves: ' + saves + '   changes read back after signing in again: ' + rounds
  + '   handles randomised: ' + shuffles);
if (bad.length) {
  console.log('FAILED — a Save that does not stick, or writes what nobody asked, is the one on the screen that only exists to change what the sheet holds.');
  process.exit(1);
}
console.log('OK — every settings page saves for every role, writes nothing when nothing changed, and reads back what was saved.');
