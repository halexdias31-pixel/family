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


/* The ladder. Singulars are words rather than numbers — "a minute ago", not "1 minute ago", because nobody counts to one — and "yesterday" for the same reason. § */
function ago(value) {
  const d = parseWhen(value);
  if (!d) return String(value ?? '');        // unparseable: show it as written, not as nothing

  const secs = (Date.now() - d.getTime()) / 1000;
  if (secs < 0) return date_(d);
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

  /* Past two months, "nine weeks ago" is arithmetic and a date is an answer. */
  return date_(d);
}

/* THE LAST GOOD PAYLOAD, KEPT ON THE DEVICE (1070): the next visit draws from it at once and the network's answer replaces it silently. */
const PAYLOAD_KEY = 'payload:kept';
let PAYLOAD_TEXT = null, PAYLOAD_KEPT_TRIED = false, PAYLOAD_OWED = null;
/* WRITTEN A MOMENT AFTER IT LANDS, off the paint, or as the page goes if that is sooner. */
/* FILED UNDER WHO IT WAS FOR when it landed, and dropped if someone else is signed in by the time it is written. */
function payloadOwed_() { const o = PAYLOAD_OWED; PAYLOAD_OWED = null; if (o && o.f.who === payloadFor_().who) payloadKeep_(o.t, o.f); }
function payloadOwe_(d) { if (PAYLOAD_TEXT && d && !d.error) { PAYLOAD_OWED = { t: PAYLOAD_TEXT, f: payloadFor_() }; setTimeout(payloadOwed_, 1000); } PAYLOAD_TEXT = null; }
/* FIND IS DRAWN WITH THE KEPT COPY, even below the fold: the next tap into a menu must not meet a loader. */
function payloadFind_() {
  try { if (typeof FINDER !== 'undefined' && STALE[FINDER.id]) { paint(FINDER.id); PRE_PAYLOAD.delete(FINDER.id); } } catch (e) { oops_(e, 'shell:keptFind'); }
}
addEventListener('pagehide', payloadOwed_);
/* NEVER A SECRET: a sign-in token, PIN or password field is dropped at any depth before the copy is written. */
const PAYLOAD_SECRET = /^(token|tokens|pin|pins|pin_?hash|pinhash|password|secret|session_?key|api_?key)$/i;
const payloadFor_ = () => { try { return { who: USER && USER.personId ? String(USER.personId) : '', build: String(window.BUILD_STAMP || '') }; } catch (e) { return { who: '', build: '' }; } };
function payloadKeep_(text, f) {
  try {
    const d = JSON.parse(text);
    if (!d || d.error) return;
    f = f || payloadFor_();
    localStorage.setItem(PAYLOAD_KEY, JSON.stringify({ who: f.who, build: f.build, at: Date.now(), d }, (k, v) => (PAYLOAD_SECRET.test(k) ? undefined : v)));
  } catch (e) { payloadForget_(); }
}
/* THE KEPT COPY FOR THIS ACCOUNT AND THIS BUILD, or null: anything else, or anything unreadable, is a normal load. */
function payloadKept_() {
  try {
    const k = JSON.parse(localStorage.getItem(PAYLOAD_KEY) || 'null'), f = payloadFor_();
    if (!k || !k.d || typeof k.d !== 'object' || k.who !== f.who || k.build !== f.build) return null;
    return k.d;
  } catch (e) { payloadForget_(); return null; }
}
/* GONE ON SIGN-OUT, and first to give way when the store is full (`keepPut_`). True when there was one. */
function payloadForget_() {
  PAYLOAD_OWED = null; PAYLOAD_TEXT = null;
  try { const had = localStorage.getItem(PAYLOAD_KEY) !== null; localStorage.removeItem(PAYLOAD_KEY); return had; } catch (e) { return false; }
}

/* NOT MERGED UNDER A FINGER (1070): while the build answers Find's menu and a tap came in the last 1.5 s, the library waits (10 s at most). */
let TAP_AT = 0;
['pointerdown', 'click'].forEach(t => addEventListener(t, () => { TAP_AT = Date.now(); }, true));
function libraryQuiet_() {
  const t0 = Date.now();
  return new Promise(ok => {
    const k = () => {
      let built = false;
      try { built = typeof FINDER !== 'undefined' && AT === FINDER.id && !!finderTagsAt_(); } catch (e) { built = false; }
      if (!built || Date.now() - TAP_AT > 1500 || Date.now() - t0 > 10000) ok(); else setTimeout(k, 300);
    };
    k();
  });
}
/* A FINDER CALL BEFORE THE SECOND BATCH LANDS: `inFinder_` lives in find-finder.js (LATER), so an early tap waits for it instead of throwing. */
function finderSoon_(F, fn) {
  if (typeof inFinder_ === 'function') return inFinder_(F, fn);
  laterFiles_().then(() => { try { if (typeof inFinder_ === 'function') inFinder_(F, fn); } catch (e) { /* the screen redraws on its own once in */ } });
  return undefined;
}
