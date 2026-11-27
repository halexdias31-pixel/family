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
/* null is never a row; in a list of objects a string or number is not one either. § */
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
    /* A script that 404s fires `onerror`, which is the one thing this route can report: § */
    tag.onerror = () => { done(); no(new Error('the backend did not load as a script')); };
    tag.src = url + (url.indexOf('?') === -1 ? '?' : '&') + 'callback=' + name;
    document.head.appendChild(tag);
  });
}

/* THE FILES THE FIRST SCREEN DOES NOT NEED (670): § */
let LATER_ASK = null, LATER_IN = false;
function laterFiles_() {
  if (LATER_ASK) return LATER_ASK;
  const lazy = (typeof window !== 'undefined' && Array.isArray(window.LAZY)) ? window.LAZY : [];
  const later = (typeof window !== 'undefined' && Array.isArray(window.LATER)) ? window.LATER.filter(f => lazy.indexOf(f) === -1) : [];
  /* ALL AT ONCE (720): fetched side by side, then run in one task, so no screen ever sees one LATER file § */
  /* ONLY WHEN IT RAN (live, 14 Nov): § */
  LATER_ASK = batchFiles_(later, 'later').then(ok => {
    if (ok) { LATER_IN = true; return; }
    LATER_ASK = null;
    laterFiles_.tries = (laterFiles_.tries || 0) + 1;
    setTimeout(() => laterFiles_().then(() => {
      if (!LATER_IN || typeof LOADED === 'undefined' || !LOADED) return;
      try { adoptMarks_(); } catch (e) { oops_(e, 'data:laterIn'); }
      try { repaint(); } catch (e) { oops_(e, 'data:laterIn'); }
    }), Math.min(30000, 1000 * Math.pow(2, laterFiles_.tries - 1)));
  });
  return LATER_ASK;
}
/* THE SECOND BATCH (1080): § */
let LAZY_ASK = null;
function lazyFiles_() {
  if (LAZY_ASK) return LAZY_ASK;
  const lazy = (typeof window !== 'undefined' && Array.isArray(window.LAZY)) ? window.LAZY : [];
  LAZY_ASK = laterFiles_().then(() => (LATER_IN ? batchFiles_(lazy, 'lazy') : false)).then(ok => {
    if (!ok) { LAZY_ASK = null; return; }
    lazyFiles_.in = true;
    /* A column that waited for them (`paint`'s ReferenceError) is drawn now, if the payload is here to draw it. */
    try { if (typeof STALE !== 'undefined' && STALE[AT] && LOADED) repaint(); } catch (e) { oops_(e, 'data:lazyIn'); }
  });
  return LAZY_ASK;
}
/* EVERY BATCH IN: until then a column whose code is missing waits instead of saying it did not draw. */
function filesIn_() { return LATER_IN && (!(Array.isArray(window.LAZY) && window.LAZY.length) || !!lazyFiles_.in); }
/* IN window.FILES' ORDER, whatever order the list is written in: that list is the load order. Never rejects; true when every file ran. */
function batchFiles_(want, bundle) {
  const off = Array.isArray(window.OFF) ? window.OFF : [];
  const list = (Array.isArray(window.FILES) ? window.FILES : want).filter(f => want.indexOf(f) !== -1 && off.indexOf(f) === -1);
  if (!list.length || typeof document === 'undefined' || typeof fetch !== 'function') return Promise.resolve(true);
  /* ONE URL FOR THE BATCH (1211): § */
  if (bundle && window.BUNDLE) {
    return fetch('bundle/' + bundle + '.js' + deployStamp_()).then(r => (r.ok ? r.text() : null)).catch(() => null).then(src => {
      if (src === null) return batchFiles_(want);
      const s = document.createElement('script');
      s.text = src + '\n//# sourceURL=bundle/' + bundle + '.js';
      document.head.appendChild(s);
      return true;
    });
  }
  return Promise.all(list.map(f => fetch('js/' + f + '.js' + deployStamp_()).then(r => (r.ok ? r.text() : null)).catch(() => null)))
    .then(texts => {
      /* ALL OR NONE: a batch with a hole in it is not run, so no screen reads half of it (720). */
      const gone = list.filter((f, i) => texts[i] === null);
      if (gone.length) { try { gone.forEach(f => window.__missing(f)); } catch (e) { /* no list to name it in */ } return false; }
      texts.forEach((src, i) => {
        const s = document.createElement('script');
        s.text = src + '\n//# sourceURL=js/' + list[i] + '.js';
        document.head.appendChild(s);
      });
      return true;
    });
}

/* ---------- ONE LOADER FOR A FILE OF THE SITE'S OWN (owner, 17 Nov): `dataFile_(path, o)` resolves to the parsed file, or null.
   o.as 'json' (the default) or 'text'; o.memo: one ask per path for the visit, shared by every caller; o.wait: ms before it is
   given up (20 s); o.cache: the fetch's cache mode ('default'); o.stamp false: no deploy stamp (a path that is not ours, or a
   page fetched fresh); o.what: the file's name in the reason. A miss is said once in `DATA_FILE_WHY[path]`; o.fail rejects with that reason instead of null. */
const DATA_FILE_MEMO = new Map(), DATA_FILE_WHY = {};
function dataFile_(path, o) {
  o = o || {};
  const as = o.as === 'text' ? 'text' : 'json';
  if (o.memo && DATA_FILE_MEMO.has(as + path)) return DATA_FILE_MEMO.get(as + path);
  const ask = new Promise((done, no) => {
    const what = o.what || path;
    const miss = why => { DATA_FILE_WHY[path] = why; if (o.fail) no(new Error(why)); else done(null); };
    if (typeof fetch !== 'function') return miss('nothing to fetch with');
    let over = false, ab = null;
    try { if (typeof AbortController === 'function') ab = new AbortController(); } catch (e) { /* no abort: the wait still ends */ }
    const ms = o.wait || 20000;
    const t = setTimeout(() => { over = true; try { if (ab) ab.abort(); } catch (e) { /* already stopped */ } miss(what + ' did not arrive in ' + Math.round(ms / 1000) + ' seconds'); }, ms);
    const url = path + (o.stamp === false || /^https?:/.test(path) ? '' : deployStamp_());
    const opt = { cache: o.cache || 'default' };
    if (ab) opt.signal = ab.signal;
    Promise.resolve().then(() => fetch(url, opt))
      .then(r => { if (!r || !r.ok) throw new Error(what + ' answered ' + (r ? r.status : 'nothing')); return as === 'text' ? r.text() : r.json(); })
      .then(v => { clearTimeout(t); if (!over) { delete DATA_FILE_WHY[path]; done(v); } },
            e => { clearTimeout(t); if (!over) miss((e && e.message) || String(e)); });
  });
  if (o.memo) { DATA_FILE_MEMO.set(as + path, ask); ask.then(v => { if (v === null) DATA_FILE_MEMO.delete(as + path); }, () => DATA_FILE_MEMO.delete(as + path)); }
  return ask;
}

/* THE KEYS THE SITE ASKS FOR AND THE BACKEND DOES NOT SEND. § */
let MISSING_KEYS = {};

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

/* NAMES (owner, 8 Nov): § */
/* A NAME TYPED IN LOWER CASE ("fin") IS STILL SHOWN WITH ITS CAPITAL; a handle keeps its own case. */
const capFirst_ = s => (/^@/.test(String(s || '')) ? String(s) : String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1));
/* ONE FORMATTER FOR NAMES (foundation 3): `fmtName_(person, style)` — 'short' (the default) "Fin W.", 'first' "Fin",
   'full' the whole name for an adult. A CHILD'S SURNAME IS NEVER SHOWN, whatever the style: her initial at most. */
const nameKid_ = p => {
  const rs = [].concat(p.roles || [], p.role || [], p.type || []).map(r => String(r).toLowerCase());
  return p.kid === true || p.child === true || rs.some(r => r === 'kid' || r === 'child' || r === 'student');
};
/* A QUALIFICATION'S LEVEL BY ITS ONE NAME (owner, 18 Nov): settings.json `levels.quals` — its list, its `says`, then the library levels' `says`
   ("Alevel" → "A-Level"); anything else is kept as typed. Copied to the backend by tools/cards-gen.js. */
function qualLevel_(v) {
  const t = String(v == null ? '' : v).trim(), k = x => String(x).toLowerCase().replace(/[^a-z0-9+]/g, '');
  if (!t) return '';
  const Q = SHARED_SETTINGS.levels.quals, want = k(t);
  const inList = Q.list.find(x => k(x) === want);
  if (inList) return inList;
  const say = Object.keys(Q.says).find(x => k(x) === want);
  if (say) return Q.says[say];
  const lib = SHARED_SETTINGS.levels.list.find(l => k(l.level) === want || (l.says || []).some(x => k(x) === want));
  return lib && Q.list.indexOf(lib.level) >= 0 ? lib.level : t;
}
/* ITS PLACE, HIGHEST FIRST; a level off the list goes last. */
function qualRank_(v) {
  const i = SHARED_SETTINGS.levels.quals.list.indexOf(qualLevel_(v));
  return i < 0 ? 999 : i;
}
function fmtName_(person, style) {
  const p = person && typeof person === 'object' ? person : { name: person };
  const first = String(p.first_name || p.firstName || '').trim(), last = String(p.last_name || p.lastName || '').trim();
  const full = nameBesideHandle_(String(p.name || p.title || (first + ' ' + last)).trim(), p.handle);
  const w = full.split(/\s+/).filter(Boolean);
  if (style === 'first') return capFirst_(first || (/[@(]/.test(full) ? full : w[0] || ''));
  if (style === 'full' && !nameKid_(p)) return capFirst_(full);
  /* FIRST NAME AND AN INITIAL FOR EVERY VIEWER, admins too (owner, 9 Nov); a style that is not a word is a viewer, kept for old callers. */
  if (first && last) return capFirst_(first) + ' ' + last.charAt(0).toUpperCase() + '.';
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

/* WHAT A PERSON HAS WRITTEN IS KEPT ON THE DEVICE AS THEY WRITE IT — AND A WRITE THE DEVICE REFUSED IS § */
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
  /* NOT WRITTEN BEFORE WHAT IT WAITS ON — an answer whose owner's mark the store has not taken yet § */
  const waits = v !== null && typeof keepWaits_ === 'function' && keepWaits_(k);
  if (!waits) {
    try { put(); KEEP_UNKEPT.delete(k); return true; } catch (e) { /* storage refused: tried again below, then held for the visit */ }
    try { if (v !== null && ((typeof splashForget_ === 'function' && splashForget_()) || payloadForget_())) { put(); KEEP_UNKEPT.delete(k); return true; } } catch (e) { /* still refused: held for the visit and said */ }
  }
  KEEP_UNKEPT.add(k);
  if (quiet !== 'record' && !KEEP_SAID && v !== null && String(v).trim()) {
    KEEP_SAID = true;
    try { if (typeof toast === 'function') toast(text_('this-browser-is-not-saving-what')); } catch (e) { /* no toast yet: the warning is a nicety */ }
  }
  return false;
}
/* THE VISIT'S COPY OF A KEY THE STORE REFUSED, or `undefined` for a key the store holds as written. */
const keepHeld_ = k => (KEEP_UNKEPT.has(k) ? KEEP_MEM.get(k) : undefined);

/* ---------- ONE STORAGE KEEPER: every key the site keeps, by name, or by prefix when the name ends in `:` (owner, 17 Nov).
   scope: 'user' (this person's), 'device' (the phone's, whoever holds it) or 'session' (the tab's, sessionStorage).
   clearOnSignOut: `keep_.signOut()` removes it. ttl: how long it is good for, ms, where something reads it (the drafts' sweep).
   A user key that is unsent work (answers, the queue, drafts) is filed under its person and stays: the next person never reads it.
   NAMES NEVER CHANGE — a device keeps what it holds under them. A PIN is never kept: any name `DRAFT_NEVER` matches is refused. */
const KEEP = {
  familyUser: { scope: 'user', clearOnSignOut: true },
  favs: { scope: 'user', clearOnSignOut: true },
  surfaceFace: { scope: 'user', clearOnSignOut: true },
  familyCardEdit: { scope: 'user', clearOnSignOut: true },
  'payload:kept': { scope: 'user', clearOnSignOut: true },
  'kept:': { scope: 'user', clearOnSignOut: true },
  /* THE OLD ASSISTANT'S THREAD (Messages went 25 Nov): still cleared on sign-out from devices that kept one. */
  'asst:': { scope: 'user', clearOnSignOut: true },
  familyHandles: { scope: 'user', clearOnSignOut: true },
  familyAdminHint: { scope: 'user', clearOnSignOut: true },
  'ans:': { scope: 'user' }, 'pad:': { scope: 'user' }, 'board:': { scope: 'user' }, 'part:': { scope: 'user' }, 'aiMark:': { scope: 'user' },
  'ansAt:': { scope: 'user' }, 'ansDirty:': { scope: 'user' }, 'done:': { scope: 'user' },
  'subLast:': { scope: 'user' }, 'subQ:': { scope: 'user' }, 'subBefore:': { scope: 'user' }, 'subMigrated:': { scope: 'user' },
  'draft:': { scope: 'user', ttl: 30 * 24 * 60 * 60 * 1000 },
  familyGone: { scope: 'device', ttl: 60 * 60 * 1000 }, familyGoneKeys: { scope: 'device' }, familySwitched: { scope: 'device' },
  familyDevice: { scope: 'device' }, familyField: { scope: 'device' }, came_from: { scope: 'device' },
  familyTab: { scope: 'device' }, familyTabAt: { scope: 'device' }, 'arrival:shape': { scope: 'device' }, familyAheadSlow: { scope: 'device' },
  familyCart: { scope: 'device' }, familyHelpHand: { scope: 'device' }, familyLayout: { scope: 'device' }, familyRules: { scope: 'device' },
  familyWords: { scope: 'device' }, speedWpm: { scope: 'device' }, speedDraft: { scope: 'device' },
  /* gone: old keys only ever removed */
  'mark-sound': { scope: 'device' }, 'voice:name': { scope: 'device' },
  splashAnims: { scope: 'device' }, splashOff: { scope: 'device' }, 'splashAnim:': { scope: 'device' },
  familyVerify: { scope: 'session' }, familyPaid: { scope: 'session' },
};
const KEEP_ODD = new Set();
function keepSpec_(k) {
  k = String(k);
  if (Object.prototype.hasOwnProperty.call(KEEP, k)) return KEEP[k];
  const pre = Object.keys(KEEP).find(p => p.slice(-1) === ':' && k.indexOf(p) === 0);
  return pre ? KEEP[pre] : null;
}
const keepStore_ = k => ((keepSpec_(k) || {}).scope === 'session' ? sessionStorage : localStorage);
/* get: the stored text, null when there is none, undefined when the store is blocked. put: `how` is undefined (quiet: a refusal
   is only `false`), 'loud' (`keepPut_`'s held-for-the-visit and said) or 'record'. True when the store took it. */
const keep_ = {
  get(k) {
    const held = keepHeld_(k);
    if (held !== undefined) return held;
    try { return keepStore_(k).getItem(k); } catch (e) { return undefined; }
  },
  json(k, none) { try { const v = JSON.parse(keep_.get(k) || 'null'); return v == null ? none : v; } catch (e) { return none; } },
  put(k, v, how) {
    /* A NAME NOBODY REGISTERED is said once, and refused outright when it names a PIN or a password. */
    if (!keepSpec_(k)) { if (v !== null && draftNever_(k)) return false; if (!KEEP_ODD.has(k)) { KEEP_ODD.add(k); console.warn('keep_: unregistered key ' + k); } }
    if (keepStore_(k) !== localStorage) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); return true; } catch (e) { return false; } }
    return keepPut_(k, v === null ? null : String(v), how === 'loud' ? undefined : how || true);
  },
  del(k, how) { return keep_.put(k, null, how); },
  /* EVERY KEY THE DEVICE HOLDS starting `pre` ('' for all). */
  keys(pre) {
    const out = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(pre || '') === 0) out.push(k); } } catch (e) { return out; }
    return out;
  },
  /* SIGN-OUT: every key marked clearOnSignOut goes, by name and by prefix. */
  signOut() {
    Object.keys(KEEP).filter(n => KEEP[n].clearOnSignOut).forEach(n => {
      (n.slice(-1) === ':' ? keep_.keys(n) : [n]).forEach(k => keep_.del(k));
    });
  },
};
/* THE SIGN-IN KEPT ON THIS PHONE, never its PIN; false when storage is blocked, and the sign-in still holds for this visit. */
function saveUser_() {
  try { return keep_.put('familyUser', JSON.stringify(USER, (n, v) => (n && draftNever_(n) ? undefined : v))); } catch (e) { return false; }
}
/* ONCE MORE, AS THE PAGE GOES — a draft sent or a copy given way since may have made the room. § */
function keepRetry_() {
  [...KEEP_UNKEPT].sort((a, b) => KEEP_RECORD.has(b) - KEEP_RECORD.has(a)).forEach(k => {
    const v = KEEP_MEM.get(k);
    if (v !== null && v !== undefined && typeof keepWaits_ === 'function' && keepWaits_(k)) return;
    try { if (v === null || v === undefined) localStorage.removeItem(k); else localStorage.setItem(k, v); KEEP_UNKEPT.delete(k); } catch (e) { /* storage can be blocked; the app runs without it */ }
  });
}
/* WHAT ONLY THIS VISIT HOLDS — non-empty, and not on the account either (`ansOnAccount_`, answers.js). § */
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
const keepLeaving_ = () => { keepRetry_(); };
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
const DRAFT_KEEP_MS = KEEP['draft:'].ttl;
/* LONGER THAN ANY ANSWER APPS SCRIPT GIVES (six minutes is its ceiling), so a send still out in another tab § */
const DRAFT_SENT_MS = 10 * 60 * 1000;
const DRAFT_MAX = 200;
/* WHAT IS NEVER WRITTEN DOWN, by name: § */
const DRAFT_NEVER = /(^|[^a-z])(pin(code|no|num|number)?|password|passcode|passwd|cvc|cvv|csc|card_?(no|num|number)|sort_?code|security_?code|account_?(no|num|number)|iban)(\d|[^a-z]|$)/i;
function draftNever_(name) { return DRAFT_NEVER.test(String(name).replace(/([a-z\d])([A-Z])/g, '$1_$2')); }
function draftWho_() {
  try { if (USER && (USER.personId || USER.name)) return 'u:' + (USER.personId || USER.name); } catch (e) { /* no user yet: drafts are the guest's */ }
  return 'device';
}
/* `who` only to name somebody else's draft — the device's, carried into the person who signed in § */
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
  let raw = keep_.get(k);
  if (raw === undefined) raw = KEEP_MEM.has(k) ? KEEP_MEM.get(k) : null;
  return raw === null || raw === undefined ? null : draftParse_(raw);
}
/* PAST ITS TIME — see the sweep's note above. */
/* A DEVICE'S DRAFT MARKED AS SOMEBODY'S lasts as long as their own drafts do, not six hours. § */
function draftHeld_(k) {
  try {
    let raw;
    try { raw = ansRec_(ANS_GONE_KEYS); } catch (e) { raw = keep_.get(ANS_GONE_KEYS); }
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
  if (!had) had = typeof keep_.get(k) === 'string';
  return had ? keepPut_(k, null) : true;
}
/* ---------- SENT, ANSWERED, REFUSED — see "SENT IS NOT A DRAFT" above. `v` is the words that went, so a § */
const draftIs_ = (d, v) => v === undefined || String(d.v).trim() === String(v).trim();
function draftSent_(surface, id, v) {
  const k = draftKey_(surface, id), d = draftRaw_(k);
  if (!d || !draftIs_(d, v)) return;
  d.sent = Date.now();
  DRAFT_SENDING.set(k, d.v);
  keepPut_(k, JSON.stringify(d));
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
    const now = Date.now(), all = keep_.keys('draft:'), live = [];
    all.forEach(k => {
      const d = draftParse_(keep_.get(k));
      if (!d || draftOld_(k, d, now)) keep_.del(k); else live.push([k, Number(d.at) || 0]);
    });
    live.sort((a, b) => b[1] - a[1]).slice(DRAFT_MAX).forEach(x => keep_.del(x[0]));
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
const myRole_ = () => roleFor_();
/* MAY THIS ROLE DO IT: § */
const can_ = (role, kind, action) => {
  try {
    const row = ((((typeof DATA !== 'undefined' && DATA && DATA.permissions) || {})[kind] || {})[action]);
    if (row && typeof row[role] === 'boolean') return row[role];
  } catch (e) { /* a malformed permissions table falls back to admin only */ }
  return role === 'admin';
};

/* THREE ROLES FOR WHO SEES A SETTING (93): § */
/* AND A CHILD'S OWN (4h, owner 20 Nov): a student is `child`, so a child is answered by the child rows alone. */
/* ROLE_THREE_ and SEE_ROLES are settings.json `roles.see`, in the SHARED block (js/core.js). */
const roleThree_ = w => ROLE_THREE_[roleOf(String(w || '').trim())] || '';
/* THE VIEWER'S SEE ROLES (4h): each role it holds and no other — every `see` row is its own role's whole answer, nothing inherited, */
/* so Apply to teach can be a grown-up's without being staff's. An account ranked student is a child and holds only `child`. */
function seeRoles_() {
  if (!USER) return [];
  let words = [];
  try { words = [rank_()].concat(heldRoles().filter(h => roleThree_(h) !== 'tutor' || !USER.tutorPending)); } catch (e) { words = []; }
  if (roleThree_(rank_()) === 'child') return ['child'];
  return SEE_ROLES.filter(r => r !== 'child' && words.some(w => roleThree_(w) === r));
}
/* MAY THE VIEWER SEE THIS SETTINGS CARD OR ACCOUNT TYPE: § */
const seeMay_ = key => seeRoles_().some(r => can_(r, 'see', key));
/* MAY THE VIEWER HAVE THIS BUTTON: § */
/* NO TABLE LOADED: a signed-in grown-up keeps the button, as before the table (rule 6). */
const uiMay_ = key => { try { if (!((DATA && DATA.permissions) || {}).ui) return rankAtLeast_('client'); } catch (e) { return false; } return can_(myRole_(), 'ui', key); };

