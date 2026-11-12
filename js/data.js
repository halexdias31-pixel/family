/* @family. — data.js ONE FILE, SPLIT. § */

/* @family. — the shell. § */

/* ---------- WHERE THE DATA COMES FROM § */
const API = 'https://script.google.com/macros/s/AKfycbyDr5ZsF63_zfgx3tlhqPF3H7U8zSY8TjB8EKY30ZWxBfDIR0QztN4B64V9c-mud7Go/exec';

/* WHICH VERSION OF THE SITE THIS IS. § */
/* THIS SAID `2026-08-08-wiring` FOR A WEEK OF CHANGES. § */
/* MEASURED, NOT TYPED. § */
const SITE_VERSION = window.SITE_STAMP || 'local';

/* WHICH STYLESHEET IS RUNNING. § */
function cssVersion() {
  try {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--css-version').trim().replace(/^["']|["']$/g, '');
    return v || '(older than versioning)';
  } catch { return '(unknown)'; }
}

/* ---------- A ROW THAT IS NOT A ROW IS DROPPED AT THE DOOR (R6) ---------- */
/* null is never a row; in a list of objects a string or number is not one either. Returns {key: dropped}, so load() can report the count. */
function dataRowsClean_(d) {
  const out = {};
  if (!d || typeof d !== 'object') return out;
  const isRow = x => !!x && typeof x === 'object' && !Array.isArray(x);
  Object.keys(d).forEach(k => {
    const v = d[k];
    if (!Array.isArray(v)) return;
    const rows = v.some(isRow);
    const kept = v.filter(x => x != null && (!rows || isRow(x)));
    if (kept.length !== v.length) { out[k] = v.length - kept.length; d[k] = kept; }
  });
  return out;
}

/* ---------- ASKING BY SCRIPT TAG, FOR A PAGE THAT HAS NO ORIGIN § */
function jsonp(url) {
  return new Promise((ok, no) => {
    const name = '__fam' + Date.now() + Math.floor(Math.random() * 1000);
    const tag = document.createElement('script');
    const done = () => { delete window[name]; tag.remove(); };
    window[name] = d => { done(); ok({ __jsonp: d }); };
    /* A script that 404s fires `onerror`, which is the one thing this route can report: it cannot
       see a status code, so "the address did not load" is all there is to say. */
    tag.onerror = () => { done(); no(new Error('the backend did not load as a script')); };
    tag.src = url + (url.indexOf('?') === -1 ? '?' : '&') + 'callback=' + name;
    document.head.appendChild(tag);
  });
}

/* THE FILES THE FIRST SCREEN DOES NOT NEED (670): index.html's `LATER`, asked for once the first column is drawn. Never rejects: a file that fails is named by `__missing`. */
let LATER_ASK = null, LATER_IN = false;
function laterFiles_() {
  if (LATER_ASK) return LATER_ASK;
  const lazy = (typeof window !== 'undefined' && Array.isArray(window.LAZY)) ? window.LAZY : [];
  const later = (typeof window !== 'undefined' && Array.isArray(window.LATER)) ? window.LATER.filter(f => lazy.indexOf(f) === -1) : [];
  /* ALL AT ONCE (720): fetched side by side, then run in one task, so no screen ever sees one LATER file without the rest (`WIDGETS` was read between find.js and map.js). */
  LATER_ASK = batchFiles_(later, 'later').then(() => { LATER_IN = true; });
  return LATER_ASK;
}
/* THE SECOND BATCH (1080): index.html's `LAZY`, files Find never needs, asked for behind the library (boot.js) or when a widget of theirs starts — one task, same rule. */
let LAZY_ASK = null;
function lazyFiles_() {
  if (LAZY_ASK) return LAZY_ASK;
  const lazy = (typeof window !== 'undefined' && Array.isArray(window.LAZY)) ? window.LAZY : [];
  LAZY_ASK = laterFiles_().then(() => batchFiles_(lazy, 'lazy')).then(() => {
    lazyFiles_.in = true;
    /* A column that waited for them (`paint`'s ReferenceError) is drawn now, if the payload is here to draw it. */
    try { if (typeof STALE !== 'undefined' && STALE[AT] && LOADED) repaint(); } catch (e) { oops_(e, 'data:lazyIn'); }
  });
  return LAZY_ASK;
}
/* EVERY BATCH IN: until then a column whose code is missing waits instead of saying it did not draw. */
function filesIn_() { return LATER_IN && (!(Array.isArray(window.LAZY) && window.LAZY.length) || !!lazyFiles_.in); }
/* IN window.FILES' ORDER, whatever order the list is written in: that list is the load order. Never rejects. */
function batchFiles_(want, bundle) {
  const off = Array.isArray(window.OFF) ? window.OFF : [];
  const list = (Array.isArray(window.FILES) ? window.FILES : want).filter(f => want.indexOf(f) !== -1 && off.indexOf(f) === -1);
  if (!list.length || typeof document === 'undefined' || typeof fetch !== 'function') return Promise.resolve();
  /* ONE URL FOR THE BATCH (1211): tools/bundle.js joined these files in this order; a bundle that fails falls back to the files one by one. */
  if (bundle && window.BUNDLE) {
    return fetch('bundle/' + bundle + '.js' + deployStamp_()).then(r => (r.ok ? r.text() : null)).catch(() => null).then(src => {
      if (src === null) return batchFiles_(want);
      const s = document.createElement('script');
      s.text = src + '\n//# sourceURL=bundle/' + bundle + '.js';
      document.head.appendChild(s);
    });
  }
  return Promise.all(list.map(f => fetch('js/' + f + '.js' + deployStamp_()).then(r => (r.ok ? r.text() : null)).catch(() => null)))
    .then(texts => texts.forEach((src, i) => {
      if (src === null) { try { window.__missing(list[i]); } catch (e) { /* no list to name it in */ } return; }
      const s = document.createElement('script');
      s.text = src + '\n//# sourceURL=js/' + list[i] + '.js';
      document.head.appendChild(s);
    }));
}

/* THE KEYS THE SITE ASKS FOR AND THE BACKEND DOES NOT SEND. § */
let MISSING_KEYS = {};
function missingKeys() {
  const ks = Object.keys(MISSING_KEYS);
  if (!ks.length) { console.log('Nothing has been asked for that the backend did not send.'); return {}; }
  console.table(MISSING_KEYS);
  return MISSING_KEYS;
}

/* HAS THE FIRST LOAD COME BACK? § */
let LOADED = false;

/* AND WHY there is nothing to show. § */
let LOAD_FAILED = '';
/* WHY THE QUESTION FILE DID NOT ARRIVE, when it did not. § */
let LIBRARY_FAILED = '';

/* WHETHER THE 30-SECOND WATCHDOG IN index.html HAS SPOKEN. § */
let LOAD_SLOW = false;
/* ---------- A NAME PRINTED ABOVE ITS OWN HANDLE DOES NOT SAY THE HANDLE TOO § */
function nameBesideHandle_(name, handle) {
  const n = String(name || ''), h = String(handle || '').replace(/^@/, '');
  if (!h) return n;
  const tail = ' (@' + h + ')';
  return n.slice(-tail.length).toLowerCase() === tail.toLowerCase() ? n.slice(0, -tail.length) : n;
}

/* NAMES (owner, 8 Nov): an admin sees the whole name; families, tutors and anything public see first name + surname initial ("Halex D.").
   `viewer` is a user, 'public' for a share, or left out for whoever is signed in. */
/* A NAME TYPED IN LOWER CASE ("fin") IS STILL SHOWN WITH ITS CAPITAL; a handle keeps its own case. */
const capFirst_ = s => (/^@/.test(String(s || '')) ? String(s) : String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1));
function displayName_(person, viewer) {
  const p = person && typeof person === 'object' ? person : { name: person };
  const first = String(p.first_name || p.firstName || '').trim(), last = String(p.last_name || p.lastName || '').trim();
  const full = nameBesideHandle_(String(p.name || p.title || (first + ' ' + last)).trim(), p.handle);
  /* FIRST NAME AND AN INITIAL FOR EVERY VIEWER, admins too (owner, 9 Nov): `viewer` is kept for callers that pass one. */
  if (first && last) return capFirst_(first) + ' ' + last.charAt(0).toUpperCase() + '.';
  const w = full.split(/\s+/).filter(Boolean);
  if (w.length < 2 || /[@(]/.test(full)) return capFirst_(full);
  return capFirst_(w[0]) + ' ' + w[w.length - 1].charAt(0).toUpperCase() + '.';
}

/* ---------- A CHILD SIGNED IN BEFORE 10 OCT IS CALLED BY HER FIRST NAME FROM THE FIRST FRAME § */
try {
  const p = USER && USER.profile, first = String((p && p.first_name) || '').trim();
  const rs = USER ? (Array.isArray(USER.roles) && USER.roles.length ? USER.roles : [USER.role]).map(String) : [];
  const kid = rs.indexOf('kid') !== -1
    && !rs.some(x => x === 'admin' || x === 'parent' || (x === 'tutor' && !USER.tutorPending));
  if (USER && kid && first && String(USER.name || '').indexOf(first + ' ') === 0
      && String(USER.name).indexOf('(@') === -1) USER.name = first;
} catch (e) { /* a short name is a nicety; the full one stays */ }

/* WHAT A PERSON HAS WRITTEN IS KEPT ON THE DEVICE AS THEY WRITE IT — AND A WRITE THE DEVICE REFUSED IS SAID, NEVER KEPT QUIETLY IN MEMORY. § */
const KEEP_MEM = new Map();
const KEEP_UNKEPT = new Set();
let KEEP_SAID = false;
/* `quiet` IS FOR A CONVENIENCE, NOT WORK — where Find was (`findPlaceKeep_`). § */
const KEEP_RECORD = new Set();
function keepPut_(k, v, quiet) {
  const put = () => { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); };
  if (quiet === true) { try { put(); return true; } catch (e) { return false; } }
  KEEP_MEM.set(k, v);
  if (quiet === 'record') KEEP_RECORD.add(k);
  /* NOT WRITTEN BEFORE WHAT IT WAITS ON — an answer whose owner's mark the store has not taken yet
     (`keepWaits_`, answers.js): held for the visit and said, as a refused write is. */
  const waits = v !== null && typeof keepWaits_ === 'function' && keepWaits_(k);
  if (!waits) {
    try { put(); KEEP_UNKEPT.delete(k); return true; } catch (e) { /* storage refused: tried again below, then held for the visit */ }
    try { if (v !== null && ((typeof splashForget_ === 'function' && splashForget_()) || payloadForget_())) { put(); KEEP_UNKEPT.delete(k); return true; } } catch (e) { /* still refused: held for the visit and said */ }
  }
  KEEP_UNKEPT.add(k);
  if (quiet !== 'record' && !KEEP_SAID && v !== null && String(v).trim()) {
    KEEP_SAID = true;
    try { if (typeof toast === 'function') toast('This browser is not saving what you type — leaving the page would lose it.'); } catch (e) { /* no toast yet: the warning is a nicety */ }
  }
  return false;
}
/* THE VISIT'S COPY OF A KEY THE STORE REFUSED, or `undefined` for a key the store holds as written. */
const keepHeld_ = k => (KEEP_UNKEPT.has(k) ? KEEP_MEM.get(k) : undefined);
/* ONCE MORE, AS THE PAGE GOES — a draft sent or a copy given way since may have made the room. § */
function keepRetry_() {
  [...KEEP_UNKEPT].sort((a, b) => KEEP_RECORD.has(b) - KEEP_RECORD.has(a)).forEach(k => {
    const v = KEEP_MEM.get(k);
    if (v !== null && v !== undefined && typeof keepWaits_ === 'function' && keepWaits_(k)) return;
    try { if (v === null || v === undefined) localStorage.removeItem(k); else localStorage.setItem(k, v); KEEP_UNKEPT.delete(k); } catch (e) { /* storage can be blocked; the app runs without it */ }
  });
}
/* WHAT ONLY THIS VISIT HOLDS — non-empty, and not on the account either (`ansOnAccount_`, answers.js).
   NOT A RECORD (`'record'` above): it is nobody's writing, and the answer it guards counts for itself. */
function keepAtRisk_() {
  keepRetry_();
  return [...KEEP_UNKEPT].filter(k => {
    if (KEEP_RECORD.has(k)) return false;
    const v = KEEP_MEM.get(k);
    if (v === null || v === undefined || !String(v).trim() || v === '[]') return false;
    try { if (typeof ansOnAccount_ === 'function' && ansOnAccount_(k)) return false; } catch (e) { /* not known yet: treated as not on the account */ }
    return true;
  });
}
/* ---------- AND WHAT IS WAITING TO GO UP GOES AS THE PAGE GOES § */
const KEEP_DUE = new Map();
function keepDue_(name, send) { if (send) KEEP_DUE.set(name, send); else KEEP_DUE.delete(name); }
/* A PROMISE OF THEM ALL, so Sign out can send them before the session they need is ended (me.js). */
function keepFlush_() {
  const due = [...KEEP_DUE.values()];
  KEEP_DUE.clear();
  return Promise.all(due.map(f => { try { return Promise.resolve(f(true)).catch(() => {}); } catch (e) { return null; } }));
}
const keepLeaving_ = () => { keepFlush_(); keepRetry_(); };
window.addEventListener('pagehide', keepLeaving_);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') keepLeaving_(); });
/* ---------- A RELOAD ASKS FIRST, BUT ONLY WHEN THE WORK IS IN NOTHING BUT THIS PAGE § */
window.addEventListener('beforeunload', e => {
  if (!keepAtRisk_().length) return;
  e.preventDefault();
  e.returnValue = '';
});

/* ---------- A DRAFT: EVERY BOX THAT IS SENT OR SAVED BY A BUTTON § */
const DRAFT_DEVICE_MS = 6 * 60 * 60 * 1000;
/* WHOSE A SIGNED-OUT ANSWER OR DEVICE DRAFT IS (`ansGoneMark_`, answers.js; docs/history/317). § */
const ANS_GONE_KEYS = 'familyGoneKeys';
const DRAFT_KEEP_MS = 30 * 24 * 60 * 60 * 1000;
/* LONGER THAN ANY ANSWER APPS SCRIPT GIVES (six minutes is its ceiling), so a send still out in another
   tab is never swept from under it. */
const DRAFT_SENT_MS = 10 * 60 * 1000;
const DRAFT_MAX = 200;
/* WHAT IS NEVER WRITTEN DOWN, by name: § */
const DRAFT_NEVER = /(^|[^a-z])(pin(code|no|num|number)?|password|passcode|passwd|cvc|cvv|csc|card_?(no|num|number)|sort_?code|security_?code|account_?(no|num|number)|iban)(\d|[^a-z]|$)/i;
function draftNever_(name) { return DRAFT_NEVER.test(String(name).replace(/([a-z\d])([A-Z])/g, '$1_$2')); }
function draftWho_() {
  try { if (USER && (USER.personId || USER.name)) return 'u:' + (USER.personId || USER.name); } catch (e) { /* no user yet: drafts are the guest's */ }
  return 'device';
}
/* `who` only to name somebody else's draft — the device's, carried into the person who signed in
   (`bookFollow_`, book.js). Every other caller is the person in front of the screen. */
const draftKey_ = (surface, id, who) => 'draft:' + (who || draftWho_()) + ':' + surface + ':' + (id == null ? '' : id);
/* THE SAME WORDS, whichever line endings carried them — a textarea's value is `\n` and a cell may be `\r\n`. */
const draftSame_ = (a, b) => String(a == null ? '' : a).replace(/\r\n?/g, '\n') === String(b == null ? '' : b).replace(/\r\n?/g, '\n');
/* WHICH DRAFTS THIS PAGE HAS SENT AND NOT YET HEARD BACK ABOUT, and the words each went with. */
const DRAFT_SENDING = new Map();
function draftParse_(raw) {
  try {
    const d = JSON.parse(raw);
    return d && typeof d === 'object' && typeof d.v === 'string' ? d : null;
  } catch (e) { return null; }
}
function draftRaw_(k) {
  let raw = keepHeld_(k);
  if (raw === undefined) { try { raw = localStorage.getItem(k); } catch (e) { raw = KEEP_MEM.has(k) ? KEEP_MEM.get(k) : null; } }
  return raw === null || raw === undefined ? null : draftParse_(raw);
}
/* PAST ITS TIME — see the sweep's note above. */
/* A DEVICE'S DRAFT MARKED AS SOMEBODY'S lasts as long as their own drafts do, not six hours. § */
function draftHeld_(k) {
  try {
    let raw;
    try { raw = ansRec_(ANS_GONE_KEYS); } catch (e) { raw = localStorage.getItem(ANS_GONE_KEYS); }
    const map = JSON.parse(raw || '{}');
    return !!(map && map[k]);
  } catch (e) { return false; }
}
function draftOld_(k, d, now) {
  if (d.sent && !DRAFT_SENDING.has(k) && !(now - (Number(d.sent) || 0) < DRAFT_SENT_MS)) return true;
  const device = /^draft:device:/.test(k) && !draftHeld_(k);
  return !(now - (Number(d.at) || 0) < (device ? DRAFT_DEVICE_MS : DRAFT_KEEP_MS));
}
/* `was`, WHEN GIVEN, is the saved value the box is being drawn from: § */
function draftRead_(surface, id, was, who) {
  const k = draftKey_(surface, id, who);
  const d = draftRaw_(k);
  if (!d) return null;
  if (draftOld_(k, d, Date.now())) { draftDrop_(surface, id, who); return null; }
  if (d.sent && !DRAFT_SENDING.has(k)) return null;
  if (was !== undefined && typeof d.from === 'string' && !draftSame_(d.from, was)) return null;
  return d.v;
}
/* ---------- A DEVICE'S DRAFT IS SOMEBODY'S TOO, WHEN THE SERVER HAS JUST ENDED THEIR SESSION § */
function draftMark_(k, v, quiet) {
  if (quiet === true || !/^draft:device:/.test(k) || typeof ansGoneMark_ !== 'function') return;
  const was = v === null ? null : draftRaw_(k);
  ansGoneMark_(k, v, false, was ? was.v : null);
}
function draftKeep_(surface, id, v, quiet, from) {
  if (draftNever_(String(surface) + ':' + String(id == null ? '' : id))) return false;
  if (v === null || v === undefined) return draftDrop_(surface, id);
  const d = { v: String(v), at: Date.now() };
  if (from !== undefined && from !== null) d.from = String(from);
  const k = draftKey_(surface, id);
  draftMark_(k, d.v, quiet);
  return keepPut_(k, JSON.stringify(d), quiet);
}
function draftDrop_(surface, id, who) {
  const k = draftKey_(surface, id, who);
  DRAFT_SENDING.delete(k);
  draftMark_(k, null);
  let had = KEEP_MEM.has(k);
  if (!had) { try { had = localStorage.getItem(k) !== null; } catch (e) { /* storage can be blocked; the app runs without it */ } }
  return had ? keepPut_(k, null) : true;
}
/* ---------- SENT, ANSWERED, REFUSED — see "SENT IS NOT A DRAFT" above. `v` is the words that went, so a
   box written in again since Send keeps its new draft; a surface that sends a whole form passes none. */
const draftIs_ = (d, v) => v === undefined || String(d.v).trim() === String(v).trim();
function draftSent_(surface, id, v) {
  const k = draftKey_(surface, id), d = draftRaw_(k);
  if (!d || !draftIs_(d, v)) return;
  d.sent = Date.now();
  DRAFT_SENDING.set(k, d.v);
  keepPut_(k, JSON.stringify(d));
}
function draftSentDone_(surface, id, v) {
  const k = draftKey_(surface, id), d = draftRaw_(k);
  if (v === undefined || draftIs_({ v: DRAFT_SENDING.get(k) || '' }, v)) DRAFT_SENDING.delete(k);
  if (d && d.sent && draftIs_(d, v)) draftDrop_(surface, id);
}
/* NOT WHILE THE PAGE IS GOING. § */
let DRAFT_LEAVING = false;
window.addEventListener('pagehide', () => { DRAFT_LEAVING = true; });
window.addEventListener('pageshow', () => { DRAFT_LEAVING = false; });
function draftSentBack_(surface, id, v) {
  if (DRAFT_LEAVING) return;
  const k = draftKey_(surface, id), d = draftRaw_(k);
  if (v === undefined || draftIs_({ v: DRAFT_SENDING.get(k) || '' }, v)) DRAFT_SENDING.delete(k);
  if (!d || !d.sent || !draftIs_(d, v)) return;
  delete d.sent;
  keepPut_(k, JSON.stringify(d));
}
function draftAttr_(surface, id, was) {
  const w = was === null || was === undefined ? '' : String(was);
  let held = false;
  try { const d = draftRead_(surface, id, w); held = d !== null && !draftSame_(d, w); } catch (e) { /* an unreadable draft is none */ }
  return ' data-draft="' + esc(surface + ':' + (id == null ? '' : id)) + '"' + (w ? ' data-draft-was="' + esc(w) + '"' : '')
    + (held ? ' data-draft-held' : '');
}
function draftVal_(surface, id, was) {
  const w = was === null || was === undefined ? '' : String(was);
  const d = draftRead_(surface, id, w);
  if (d === null) return w;
  /* A DRAFT THAT SAYS WHAT IS SAVED ANYWAY is no draft — saved elsewhere since, or typed back. */
  if (draftSame_(d, w)) { draftDrop_(surface, id); return w; }
  return d;
}
function draftFrom_(el) {
  if (!el || !el.getAttribute) return;
  const spec = el.getAttribute('data-draft');
  if (!spec || /^(password|file|hidden)$/i.test(el.type || '')) return;
  const at = spec.indexOf(':');
  const surface = at < 0 ? spec : spec.slice(0, at), id = at < 0 ? '' : spec.slice(at + 1);
  const box = String(el.type || '').toLowerCase() === 'checkbox';
  const v = box ? (el.checked ? '1' : '0') : String(el.value == null ? '' : el.value);
  const was = el.hasAttribute('data-draft-was') ? el.getAttribute('data-draft-was') : (box ? '0' : '');
  if (draftSame_(v, was)) draftDrop_(surface, id); else draftKeep_(surface, id, v, false, was);
}
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  try { draftFrom_(e.target && e.target.closest && e.target.closest('[data-draft]')); } catch (err) { /* a draft is a nicety; typing goes on */ }
}));
function draftSweep_() {
  try {
    const now = Date.now(), all = [], live = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('draft:') === 0) all.push(k); }
    all.forEach(k => {
      const d = draftParse_(localStorage.getItem(k));
      if (!d || draftOld_(k, d, now)) localStorage.removeItem(k); else live.push([k, Number(d.at) || 0]);
    });
    live.sort((a, b) => b[1] - a[1]).slice(DRAFT_MAX).forEach(x => localStorage.removeItem(x[0]));
  } catch (e) { /* storage can be blocked; old drafts wait for next time */ }
}
draftSweep_();
/* ---------- AND A DRAFT WRITTEN IN ANOTHER TAB IS THE DRAFT IN THIS ONE § */
window.addEventListener('storage', e => {
  const k = e && e.key;
  if (!k || k.indexOf('draft:') !== 0) return;
  try {
    KEEP_UNKEPT.delete(k);
    KEEP_MEM.delete(k);
    const pre = 'draft:' + draftWho_() + ':';
    if (k.indexOf(pre) !== 0) return;
    const spec = k.slice(pre.length);
    const old = draftParse_(e.oldValue), now = draftParse_(e.newValue);
    const v = now && !now.sent ? now.v : null;
    document.querySelectorAll('[data-draft]').forEach(el => {
      if (el.getAttribute('data-draft') !== spec || /^(password|file|hidden)$/i.test(el.type || '')) return;
      const box = String(el.type || '').toLowerCase() === 'checkbox';
      const saved = el.hasAttribute('data-draft-was') ? el.getAttribute('data-draft-was') : (box ? '0' : '');
      if (now && typeof now.from === 'string' && !draftSame_(now.from, saved)) return;
      const cur = box ? (el.checked ? '1' : '0') : String(el.value == null ? '' : el.value);
      const want = v !== null ? v : (old && draftSame_(cur, old.v) ? saved : null);
      if (want === null || draftSame_(cur, want)) return;
      if (box) el.checked = want === '1'; else el.value = want;
    });
    if (spec === 'book:form' && typeof bookElsewhere_ === 'function') bookElsewhere_(v, old ? old.v : null);
  } catch (err) { /* a form mid-change keeps what it shows */ }
});
/* THE VIEWER'S ROLE IN THE PERMISSIONS TABLE (86a): anyone, member, child or admin. */
const myRole_ = () => (!USER ? 'anyone' : isAdmin() ? 'admin' : (typeof childView_ === 'function' && childView_()) ? 'child' : 'member');
/* MAY THIS ROLE DO IT: DATA.permissions (data/settings/permissions.json), else admin only — the table the backend's gate reads too. */
const can_ = (role, kind, action) => {
  try {
    const row = ((((typeof DATA !== 'undefined' && DATA && DATA.permissions) || {})[kind] || {})[action]);
    if (row && typeof row[role] === 'boolean') return row[role];
  } catch (e) {}
  return role === 'admin';
};

/* THREE ROLES FOR WHO SEES A SETTING (93): keyed by the role a word means (`roleOf`), so teacher, parent, kid… are ROLE_ALIASES' alone. */
const ROLE_THREE_ = { student: 'family', client: 'family', member: 'family', family: 'family',
  staff: 'tutor', tutor: 'tutor', apprentice: 'tutor', admin: 'admin', business: 'admin', site: 'admin' };
const SEE_ROLES = ['family', 'tutor', 'admin'];
const roleThree_ = w => ROLE_THREE_[roleOf(String(w || '').trim())] || '';
/* THE VIEWER'S THREE ROLES: rank and held roles mapped, a higher role holding the lower ones as ranks always have; a pending tutor is not one yet. */
function seeRoles_() {
  if (!USER) return [];
  let words = [];
  try { words = [rank_()].concat(heldRoles().filter(h => roleThree_(h) !== 'tutor' || !USER.tutorPending)); } catch (e) { words = []; }
  const top = Math.max(0, ...words.map(w => SEE_ROLES.indexOf(roleThree_(w))));
  return SEE_ROLES.slice(0, top + 1);
}
/* MAY THE VIEWER SEE THIS SETTINGS CARD OR ACCOUNT TYPE: permissions.json's `see` rows; no row, an admin's only (`can_`). */
const seeMay_ = key => seeRoles_().some(r => can_(r, 'see', key));
/* MAY THE VIEWER HAVE THIS BUTTON: permissions.json's `ui` rows, by the action roles, so a child differs from a parent; no row, an admin's only. */
/* NO TABLE LOADED: a signed-in grown-up keeps the button, as before the table (rule 6). */
const uiMay_ = key => { try { if (!((DATA && DATA.permissions) || {}).ui) return rankAtLeast_('client'); } catch (e) { return false; } return can_(myRole_(), 'ui', key); };

