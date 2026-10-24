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

let DATA = {};

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

/* THE KEYS THE SITE ASKS FOR AND THE BACKEND DOES NOT SEND. § */
let MISSING_KEYS = {};
function missingKeys() {
  const ks = Object.keys(MISSING_KEYS);
  if (!ks.length) { console.log('Nothing has been asked for that the backend did not send.'); return {}; }
  console.table(MISSING_KEYS);
  return MISSING_KEYS;
}
let USER = null;

/* HAS THE FIRST LOAD COME BACK? § */
let LOADED = false;

/* AND WHY there is nothing to show. § */
let LOAD_FAILED = '';
/* WHY THE QUESTION FILE DID NOT ARRIVE, when it did not. § */
let LIBRARY_FAILED = '';

/* WHETHER THE 30-SECOND WATCHDOG IN index.html HAS SPOKEN. § */
let LOAD_SLOW = false;
try { USER = JSON.parse(localStorage.getItem('familyUser') || 'null'); } catch {}
/* ---------- A NAME PRINTED ABOVE ITS OWN HANDLE DOES NOT SAY THE HANDLE TOO § */
function nameBesideHandle_(name, handle) {
  const n = String(name || ''), h = String(handle || '').replace(/^@/, '');
  if (!h) return n;
  const tail = ' (@' + h + ')';
  return n.slice(-tail.length).toLowerCase() === tail.toLowerCase() ? n.slice(0, -tail.length) : n;
}

/* ---------- A CHILD SIGNED IN BEFORE 10 OCT IS CALLED BY HER FIRST NAME FROM THE FIRST FRAME § */
try {
  const p = USER && USER.profile, first = String((p && p.first_name) || '').trim();
  const rs = USER ? (Array.isArray(USER.roles) && USER.roles.length ? USER.roles : [USER.role]).map(String) : [];
  const kid = rs.indexOf('kid') !== -1
    && !rs.some(x => x === 'admin' || x === 'parent' || (x === 'tutor' && !USER.tutorPending));
  if (USER && kid && first && String(USER.name || '').indexOf(first + ' ') === 0
      && String(USER.name).indexOf('(@') === -1) USER.name = first;
} catch (e) {}

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
    try { put(); KEEP_UNKEPT.delete(k); return true; } catch (e) {}
    try { if (v !== null && typeof splashGiveWay_ === 'function' && splashGiveWay_()) { put(); KEEP_UNKEPT.delete(k); return true; } } catch (e) {}
  }
  KEEP_UNKEPT.add(k);
  if (quiet !== 'record' && !KEEP_SAID && v !== null && String(v).trim()) {
    KEEP_SAID = true;
    try { if (typeof toast === 'function') toast('This browser is not saving what you type — leaving the page would lose it.'); } catch (e) {}
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
    try { if (v === null || v === undefined) localStorage.removeItem(k); else localStorage.setItem(k, v); KEEP_UNKEPT.delete(k); } catch (e) {}
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
    try { if (typeof ansOnAccount_ === 'function' && ansOnAccount_(k)) return false; } catch (e) {}
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
  try { if (USER && (USER.personId || USER.name)) return 'u:' + (USER.personId || USER.name); } catch (e) {}
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
  if (!had) { try { had = localStorage.getItem(k) !== null; } catch (e) {} }
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
  try { const d = draftRead_(surface, id, w); held = d !== null && !draftSame_(d, w); } catch (e) {}
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
  try { draftFrom_(e.target && e.target.closest && e.target.closest('[data-draft]')); } catch (err) {}
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
  } catch (e) {}
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
  } catch (err) {}
});

/* ---------- THE SMALLEST HELPERS ---------------------------------------------------------------- */
/* ---------- AND WHEN ONE ID IS ON THE PAGE TWICE, THE COPY ON THE SCREEN IN FRONT § */
/* ---------- AND WHEN THE SCREEN IN FRONT HAS NO COPY, THE COPY ITS WIDGET WAS STARTED ON § */
const WIDGET_HOME = {};
const $ = id => {
  const el = document.getElementById(id);
  if (!el || typeof AT === 'undefined' || !AT) return el;
  const scr = document.getElementById('s-' + AT);
  if (!scr || scr.contains(el)) return el;
  try {
    const mine = scr.querySelector('#' + CSS.escape(id));
    if (mine) return mine;
    const slot = el.closest && el.closest('.widget-slot');
    const home = slot && WIDGET_HOME[slot.id];
    const host = home && home !== AT && document.getElementById('s-' + home);
    if (!host || host.contains(el)) return el;
    return host.querySelector('#' + CSS.escape(id)) || el;
  } catch { return el; }
};

/* The letter to put in a circle when there is no picture. The first LETTER, not the first
   character — punctuation is not an initial, and "@family." was giving "@", which sat next to the
   name and read as @@family. */
const initial = s => (String(s ?? '').match(/[A-Za-z0-9]/) || ['?'])[0].toUpperCase();

/* Anything from the branding tab, by name, with a fallback. Never throws on a key that has not
   been filled in — the whole point of that tab is that most of it is empty most of the time. */
const brand = (k, or) => ((DATA.brand || {})[k] || or || '');

/* IS THIS SOMETHING YOU WEAR? § */
const isWearable = x => {
  const k = norm(x && (x.kind || x.kindRaw));
  return k === 'wearable' || k === 'avatar';
};

/* Whether the person signed in is an admin. § */
const isAdmin = () => !!USER && rankAtLeast_('admin');

/* ---------- THE LAWS § */

/* One place a colour name becomes a class. A law says "green"; the stylesheet decides what green
   is — so the palette stays where a designer would look for it. */
const LAW_CLASS = {
  green: 'w-green', blue: 'w-blue', 'blue-soft': 'w-blue-soft',
  /* PURPLE IS A VENUE, the way green is a subject. § */
  purple: 'w-purple',
  /* PINK IS SOMETHING YOU WEAR. § */
  pink: 'w-pink',
  red: 'w-red', amber: 'w-amber', dim: 'w-dim', ink: '',
};

/** The lists a `kind: list` law can name. Each is read fresh, so adding a subject colours it. */
function lawList(name) {
  const d = DATA || {};
  switch (norm(name)) {
    /* ---------- `subjects` WAS HERE, AND IT IS RETIRED § */
    case 'subjects': return [];
    case 'tutors':   return (d.tutors || []).map(t => t.title);
    case 'venues':   return (d.venues || []).map(v => v.title);
    /* THE FAMILIES IN THE SESSIONS THIS PHONE CAN SEE. § */
    case 'clients':  return [...new Set((d.liveJobs || d.jobs || [])
                       .flatMap(j => (j.slots || []).map(s => s && s.client))
                       .filter(Boolean))];
    /* Everything in the shop that is worn rather than posted. § */
    case 'wearables':
    case 'wearable': return (d.shop || []).filter(isWearable).map(x => x.name);
    default:         return [];
  }
}

const rxSafe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * ESCAPE, then colour. The only function that should ever put user text on screen.
 *
 * Returns HTML — so whatever uses it must NOT escape the result again, and must not pass it
 * anywhere that expects plain text.
 */
function mark(text) {
  let out = esc(text ?? '');
  const laws = (DATA.laws || []);
  if (!laws.length || !out) return out;

  /* Matches are parked as placeholders so later laws cannot see inside them. `\u0000` cannot occur
     in escaped text, which is what makes it a safe marker rather than a hopeful one. */
  const parked = [];
  const park = html => '\u0000' + (parked.push(html) - 1) + '\u0000';

  laws.forEach(law => {
    const cls = LAW_CLASS[norm(law.colour)];
    if (cls === undefined) return;                 // a colour nobody has defined: left alone
    const wrap = m => park(`<span class="${cls}">${m}</span>`);

    if (law.kind === 'prefix') {
      const p = rxSafe(law.match);
      /* The symbol and the word after it, and only when the symbol starts a word — so an email
         address is not read as four @names. */
      out = out.replace(new RegExp('(^|[\\s(])(' + p + '[\\w-]+)', 'g'),
                        (all, before, hit) => before + wrap(hit));

    } else if (law.kind === 'list') {
      /* Longest first, so "Further Maths" wins over "Maths" — otherwise the longer name is
         coloured in two halves with a gap in the middle. */
      lawList(law.match)
        .filter(Boolean).map(String)
        .sort((a, b) => b.length - a.length)
        .forEach(word => {
          out = out.replace(new RegExp('\\b' + rxSafe(esc(word)) + '\\b', 'gi'), wrap);
        });

    } else if (law.kind === 'word') {
      out = out.replace(new RegExp('\\b' + rxSafe(esc(law.match)) + '\\b', 'gi'), wrap);

    } else if (law.kind === 'regex') {
      /* A bad pattern in a spreadsheet cell must not take the screen down with it. */
      try { out = out.replace(new RegExp(law.match, 'g'), wrap); } catch (e) { /* ignore */ }
    }
  });

  return out.replace(/\u0000(\d+)\u0000/g, (all, i) => parked[i]);
}
const money = n => '£' + (Number(n) || 0).toFixed(2);

/* ---------- WHEN SOMETHING HAPPENED § */
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

/* A timestamp WITH its time. § */
function parseWhen(v) {
  if (typeof v === 'number' && v > 0) return new Date(v);      // the payload's `at`, in ms
  const t = String(v ?? '').trim();
  if (!t) return null;
  /* ---------- AN ISO DATE IS READ FIRST, AND IT USED TO BE READ BACKWARDS § */
  const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (iso) {
    const d0 = new Date(+iso[1], +iso[2] - 1, +iso[3],
                        +(iso[4] || 0), +(iso[5] || 0), +(iso[6] || 0));
    return isNaN(d0) ? null : d0;
  }
  const m = t.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + (+m[3]) : +m[3];
    const d = new Date(y, +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    return isNaN(d) ? null : d;
  }
  const d = new Date(t);
  return isNaN(d) ? null : d;
}

/** 16 August 2026. No leading zero, the month written out, the year in full. */
const fullDate = d => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;

/* The ladder. Singulars are words rather than numbers — "a minute ago", not "1 minute ago", because nobody counts to one — and "yesterday" for the same reason. § */
function ago(value) {
  const d = parseWhen(value);
  if (!d) return String(value ?? '');        // unparseable: show it as written, not as nothing

  const secs = (Date.now() - d.getTime()) / 1000;
  if (secs < 0) return fullDate(d);
  if (secs < 45) return 'just now';

  const mins = Math.floor(secs / 60);
  if (mins < 60) return mins <= 1 ? 'a minute ago' : mins + ' minutes ago';

  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? 'an hour ago' : hours + ' hours ago';

  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7)  return days + ' days ago';
  if (days < 14) return 'a week ago';
  if (days < 28) return Math.floor(days / 7) + ' weeks ago';
  if (days < 60) return 'a month ago';

  /* Past two months, "nine weeks ago" is arithmetic and "16 August 2026" is an answer. */
  return fullDate(d);
}