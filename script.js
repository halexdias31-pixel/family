// Set the moment this file starts executing. index.html watches it to distinguish a script
// that never loaded (cache/path problem) from one that loaded but couldn't reach the backend.
window.__familyBooted = true;

// What this frontend needs the backend to be able to do. Checked by NAME, not by version:
// version strings don't order ("…-machine" sorts after "…-events" because m > e), so comparing
// them would call an older deploy current. Add a name here when the site starts relying on
// something new in hermes.
const NEEDS_FEATURES = ['move', 'events'];

const API = 'https://script.google.com/macros/s/AKfycbyINfTA44t4ibW6ihxADTwCo1CxCP8v6UA_SR_4GiCQuR7Q4cRNWnlkOdb2xQaSoGzk/exec';
let DATA = {};
let USER = null; // set on login: { name }
let NOTEPAD_TIMER = null;   // debounce timer for notepad auto-save
let PROFILE_SAVE_TIMER = null;   // debounce timer for profile editor auto-save
let VENUE_SAVE_TIMER = null;     // debounce timer for venue editor auto-save
// When an admin opens someone else's profile: { name, role, profile }. null means you're
// editing your own, which is the only thing anyone but an admin can do.
let EDIT_TARGET = null;

const isHome = loc => /\b(home|your house|your venue|my house|my home)\b/i.test(loc || '');

// Parse a number that may be written as a FRACTION ("1/100", "1/2"), a percentage ("5%") or a
// plain decimal. parseFloat("1/100") silently returns 1 — a 100x error on a price constant —
// so anything read from the sheet goes through here.
function num(raw) {
  if (typeof raw === 'number') return raw;
  const t = String(raw == null ? '' : raw).trim().replace(/[£$,\s]/g, '');
  if (!t) return NaN;
  const frac = t.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
  if (frac) { const den = parseFloat(frac[2]); return den === 0 ? NaN : parseFloat(frac[1]) / den; }
  if (t.endsWith('%')) { const p = parseFloat(t); return isNaN(p) ? NaN : p / 100; }
  return parseFloat(t);
}

// The 7 canonical job statuses. The `status` cell in the sheet holds one of these; any older
// value (Unstarted/Ongoing/Pending/etc.) is mapped onto the new set by jobStatus() so nothing
// breaks during the transition. This is the single source of truth for the lifecycle.
// JOB STATUS — the four words in source_job_status. Nothing else is a job status.
//   unsent       not created yet (the builder card)
//   unconfirmed  created, but nobody has paid — it exists on paper only
//   active       at least one family is Locked in and paying
//   cancelled    everybody left; with removal semantics the slots are simply empty
// Anything older in the sheet (Unstarted, Requested, Negotiating, Accepted…) maps onto these,
// so nothing breaks while old rows are still lying around.
const JOB_STATUSES = ['Unsent', 'Unconfirmed', 'Active', 'Cancelled'];
function jobStatus(j) {
  const s = String(j?.status || '').toLowerCase().trim();
  if (/cancel|abandon|declin/.test(s))              return 'Cancelled';
  if (/unsent|draft/.test(s))                       return 'Unsent';
  if (/active|locked|ongoing|started|complete/.test(s)) return 'Active';
  return 'Unconfirmed';   // requested, negotiating, accepted, unstarted, blank — all "on paper"
}

// --- CLIENT (family) statuses: the 6-state journey each family goes through in a job. ---
// Requested ⇄ Waiting (negotiation, turn tracked by offer_turn) → Accepted → (pay) → Participant.
// Declined (tutor rejects) and Cancelled (client withdraws) are the two exits.
const CLIENT_STATUSES = ['Requested', 'Queried', 'Unpaid', 'Participant', 'Declined', 'Cancelled'];
function clientStatus(raw) {
  const s = String(raw || '').toLowerCase().trim();
  // ORDER MATTERS: "unpaid" contains "paid", so it must be tested first or every unpaid client
  // reads as a paid participant — which would show a family as enrolled before they've paid.
  if (/unpaid|awaiting payment|payment due/.test(s))   return 'Unpaid';
  if (/particip|joined|enrolled/.test(s))              return 'Participant';
  if (/decline|rejected/.test(s))                      return 'Declined';
  if (/cancel|withdraw|left/.test(s))                  return 'Cancelled';
  if (/quer|wait|returned|changes/.test(s))            return 'Queried';   // ball with the client
  if (/accept|agreed|paid/.test(s))                    return 'Unpaid';    // legacy "Accepted"
  if (/request|pending|new/.test(s) || !s)             return 'Requested'; // ball with the tutor
  const exact = CLIENT_STATUSES.find(x => x.toLowerCase() === s);
  return exact || 'Requested';
}
// --- TUTOR status: the job's other negotiation, running in parallel with the families' ---
// A client can book with "No preference", which leaves the job Open for any tutor to claim.
// A claim isn't binding until the CLIENT accepts it — you don't get assigned a stranger.
const TUTOR_STATUSES = ['Open', 'Applied', 'Confirmed', 'Declined'];
function tutorStatus(raw, tutorName) {
  const s = String(raw || '').toLowerCase().trim();
  if (/confirm|agreed/.test(s))  return 'Confirmed';
  if (/appli|claim|proposed/.test(s)) return 'Applied';
  if (/declin|reject/.test(s))   return 'Declined';
  if (/open|none|any/.test(s))   return 'Open';
  // No stored status: infer it. A real name means someone was picked; "No preference" is Open.
  const nm = String(tutorName || '').toLowerCase().trim();
  return (!nm || nm === 'no preference' || nm === 'any') ? 'Open' : 'Confirmed';
}
const tutorStatusLabel = st => ({
  Open: 'Open — no applicants yet', Applied: 'Applicants waiting',
  Confirmed: 'Confirmed', Declined: 'Declined'
}[st] || 'Open');

// A family occupies a seat unless they've left the job entirely.
const CLIENT_ACTIVE = st => !['Declined', 'Cancelled'].includes(clientStatus(st));
// Friendly label for what the client sees.
const clientStatusLabel = st => ({
  Requested: 'Requested', Queried: 'Queried', Unpaid: 'Unpaid',
  Participant: 'Participant', Declined: 'Declined', Cancelled: 'Cancelled'
}[clientStatus(st)] || 'Requested');

// Normalise any time value to a friendly 12-hour label: "09:00"/Date/ISO → "9am", "13:30" → "1:30pm"
const fmtTime = t => {
  let s = String(t ?? '').trim();
  if (!s) return '';
  let h, min;
  const m = s.match(/(\d{1,2}):(\d{2})/);            // HH:MM anywhere in the string
  if (m) { h = +m[1]; min = +m[2]; }
  else {
    const d = new Date(s);
    if (isNaN(d)) return s;
    h = d.getHours(); min = d.getMinutes();
  }
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return min ? `${h12}:${String(min).padStart(2,'0')}${ampm}` : `${h12}${ampm}`;
};
// Add N hours to an "HH:MM" time, returning "HH:MM" (used for session end times)
const addHours = (t, n) => {
  const m = String(t ?? '').match(/(\d{1,2}):(\d{2})/);
  if (!m) return t;
  const h = (+m[1] + n) % 24;
  return `${String(h).padStart(2,'0')}:${m[2]}`;
};
// Day → plural, capitalised: "thursday"/"thursdays" → "Thursdays"
const fmtDay = day => {
  const s = String(day || '').trim();
  if (!s) return 'TBD';
  const base = s.replace(/s$/i, '');
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase() + 's';
};
// Weeks → whole number (round down; you can't bill a partial week)
const fmtWeeks = w => { const n = Math.floor(parseFloat(w) || 0); return n > 0 ? n : ''; };
// Date → short DD/MM/YY. Handles "22/07/2026", Date objects, and long GMT strings.
const fmtDate = v => {
  const s = String(v ?? '').trim();
  if (!s) return '';
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);   // already DD/MM/YYYY
  if (m) { const y = m[3].slice(-2); return `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${y}`; }
  const d = new Date(s);
  if (isNaN(d)) return s;
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)}`;
};

/* --- Booking state machine (mirror of BookingMachine.gs) ------------------------------------
   The SAME rules the backend enforces, so the dropdown can only ever offer moves the backend
   will accept. If you change one, change the other — they're deliberately identical, because a
   UI that offers an illegal action and a backend that rejects it is the worst of both.
   Leaving removes you: there is no Declined or Withdrawn status, the slot is simply emptied. */
const BM_STATUS = { NONE: '', REQUESTED: 'Requested', ACCEPTED: 'Accepted', PAID: 'Paid', LOCKED: 'Locked' };
const BM_ACTION = { REQUEST: 'Request', ACCEPT: 'Accept', DECLINE: 'Decline', WITHDRAW: 'Withdraw', PAY: 'Pay' };
const BM_RULES = [
  { when: (me, them) => me === 'Paid'   || them === 'Paid',   client: [], tutor: [] },
  { when: (me, them) => me === 'Locked' || them === 'Locked', client: ['Withdraw'], tutor: ['Withdraw'] },
  { when: (me, them) => me === 'Accepted' || them === 'Accepted', client: ['Pay', 'Withdraw'], tutor: ['Withdraw'] },
  { when: me => me === 'Requested', client: ['Withdraw'], tutor: ['Withdraw'] },
  { when: (me, them) => !me && them === 'Requested',
    client: ['Accept', 'Decline', 'Request', 'Withdraw'], tutor: ['Accept', 'Decline', 'Request', 'Withdraw'] },
  { when: (me, them) => !me && !them, client: ['Request'], tutor: ['Request'] }
];
function bmActionsFor(role, mine, theirs) {
  const r = BM_RULES.find(x => x.when(mine || '', theirs || ''));
  return r ? (r[role] || []) : [];
}
function bmPossession(clientStatus, tutorStatus) {
  if (clientStatus === 'Paid' || tutorStatus === 'Paid' || clientStatus === 'Locked') return '';
  if (clientStatus === 'Requested') return 'tutor';
  if (tutorStatus === 'Requested') return 'client';
  if (clientStatus === 'Accepted' || tutorStatus === 'Accepted') return 'client';
  return '';
}
/* ---------- ONE BADGE ------------------------------------------------------------------------
   Every coloured chip on the site, from one map. There were four separate ones — job status,
   participant status, tutor status and lifecycle — each with its own lookup object and its own
   inline <span> built at the call site. Four places to edit to change one colour, and four
   chances for the same word to come out a different shade in different cards.
   The values are the vocabularies in the `options` tab; anything unrecognised falls back rather
   than rendering an unstyled chip. --------------------------------------------------------- */
const BADGE_CLASS = {
  // job status
  Unsent: 'st-draft', Unconfirmed: 'st-requested', Active: 'st-active', Cancelled: 'st-declined',
  // participant status
  Requested: 'st-requested', Accepted: 'st-accepted', Paid: 'st-negotiating', Locked: 'st-active',
  // tutor status
  Open: 'st-requested', Applied: 'st-negotiating', Confirmed: 'st-active',
  // lifecycle
  Uncreated: 'st-draft', Upcoming: 'st-accepted', Started: 'st-active',
  Ongoing: 'st-active', Ended: 'st-completed',
  // possession
  Yours: 'st-active', Others: 'st-requested',
};
const badge = v => {
  const s = String(v ?? '').trim();
  return s ? `<span class="badge ${BADGE_CLASS[s] || 'st-requested'}">${esc(s)}</span>` : '';
};

/* ---------- UTILS ---------- */
const $   = id => document.getElementById(id);
const esc = s  => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Site-wide rule: any @mention or #hashtag in text is coloured blue, like social media.
// Always escapes first, so it's safe to use anywhere user/sheet text is rendered.
// Wrap @mentions and #hashtags for styling. They get separate modifier classes because a
// mention is highlighted in marker while a hashtag stays blue ink.
const escTokens = s => esc(s).replace(/([#@][\w.]+)/g,
  m => `<span class="token ${m[0] === '@' ? 'token-at' : 'token-tag'}">${m}</span>`);
const val = id => ($(id) || {}).value || '';
// Who participates in the checklist + arcade (topics, levels, highscores): kids AND tutors.
const canTrack = () => !!USER && (USER.role === 'kid' || USER.role === 'tutor' || USER.role === 'admin');
// An admin is a tutor with extra powers, so everywhere that gates on "tutor" should also
// admit admin. Use these helpers rather than `USER.role === 'tutor'` directly.
const isTutorRole = () => !!USER && (USER.role === 'tutor' || USER.role === 'admin');
const isAdmin = () => !!USER && USER.role === 'admin';

// Checklist progress: three independent columns tick1/tick2/tick3, each a comma list of topic names.
// A topic present in tickN's list = that box checked. Returns { topicLower: {t1,t2,t3} }.
function parseProgress() {
  const listToSet = str => new Set(String(str || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
  const s1 = listToSet(USER?.tick1), s2 = listToSet(USER?.tick2), s3 = listToSet(USER?.tick3);
  const keys = new Set([...s1, ...s2, ...s3]);
  const out = {};
  keys.forEach(k => out[k] = { t1: s1.has(k), t2: s2.has(k), t3: s3.has(k) });
  return out;
}
// Every section render funnels through here, so it's the one place that needs to re-pack
// the masonry after the DOM changes.
const html = (el, content) => {
  const node = $(el);
  if (!node) return;
  node.innerHTML = content;
  if (node.classList.contains('grid')) requestAnimationFrame(() => layoutGrid(node));
};
const tog = (el, force) => $(el)?.classList.toggle('hidden', force);
// Turn a Google Drive share link into a direct thumbnail URL.
// Handles both /file/d/FILEID/... and open?id=FILEID / ?id=FILEID formats.
// Anything that isn't a Drive link is passed through untouched.
const drive = url => {
  const s = String(url || '');
  const m = s.match(/\/d\/([\w-]+)/) || s.match(/[?&]id=([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w400` : s;
};
const empty = (arr, msg) => arr?.length ? arr.map : () => `<p class="muted">${msg}</p>`;

// Sheet column -> the name that column arrives under on a topic object. Only the ones that
// differ; everything else matches. Kept next to nothing else because it exists solely to let the
// relabel form prefill from what the card already has.
const RES_FIELD_MAP = {
  band_value: 'grade', key_stage: 'keystage', exam_board: 'examBoard',
  resource_type: 'resourceType', band_type: 'bandType',
};

// How many columns a checklist card asks for, based on how many topics it holds.
const spanForCount = n => n >= 80 ? 4 : n >= 35 ? 3 : n >= 14 ? 2 : 1;

/* ---------- STICKY-NOTE VARIATION ----------
   Cards get a small handmade wobble — tilt, tint, uneven corners — so they read as pinned-up
   notes rather than identical boxes.
   The important part is that it's NOT random per render: the dice are seeded by the card's
   own identity, so a given card always looks the same. With Math.random() every card would
   change tilt and colour on each filter, re-render and resize, and the wall would twitch.
   Same card → same seed → same look, forever. Different card → different look. */
const hashOf = str => {                       // FNV-1a: small, fast, well-spread
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
function stickyStyle(card) {
  // Identify the card by something stable and meaningful, not its position on screen.
  const id = card.dataset.cardName || card.dataset.cardId
          || card.querySelector('h3')?.textContent || card.textContent.slice(0, 48);
  const h = hashOf(String(id));
  const dice = (shift, n) => (h >>> shift) % n;      // quasi-independent rolls from one hash
  const s = card.style;
  // Variance is deliberately SMALL. The wider ranges this used to use (2.4deg of tilt, 15 degrees
  // of hue, 28 points of saturation) were aiming at "handmade", but across a grid of cards they
  // read as inconsistent rather than crafted — one note noticeably greener or paler than the one
  // beside it. Tightened to roughly a third: enough that no two notes are identical, not enough
  // to notice a difference unless you look for it. One pad, not a mixed handful.
  s.setProperty('--tilt', (dice(0, 80) / 100 - 0.4).toFixed(2) + 'deg');   // -0.40 … +0.39deg
  s.setProperty('--h', (46 + dice(9, 6)) + '');                            // 46 … 51
  s.setProperty('--s', (70 + dice(13, 10)) + '%');                         // 70 … 79%
  s.setProperty('--l', (66 + dice(19, 7)) + '%');                          // 66 … 72%
  s.setProperty('--ang', (dice(17, 90) + 100) + 'deg');                    // sheen direction
  // Slightly uneven corners — the torn-paper hint. Subtle, so cards still read as cards.
  // Corners: 4 independent radii spanning 10px made some cards visibly lopsided next to others.
  s.setProperty('--r1', (7 + dice(3, 4)) + 'px');
  s.setProperty('--r2', (7 + dice(6, 4)) + 'px');
  s.setProperty('--r3', (7 + dice(12, 4)) + 'px');
  s.setProperty('--r4', (7 + dice(21, 4)) + 'px');
  // How it's stuck up. Reduced from four treatments to two (tape or pin): four meant a single
  // screen showed tape, a pin, a curled corner and nothing at all, which is the least uniform
  // thing on the page. Same seed, so a given card never changes.
  card.dataset.deco = dice(24, 2);
}

/* ---------- GRID MASONRY ---------- */
/*  The .grid sections are CSS Grid with a small row unit (grid-auto-rows). A card's real
   height is measured here and turned into a row-span, which is what makes cards of
   different heights pack tightly — CSS alone can't do this yet.
   Unlike the old multi-column layout, Grid lets a card span several columns: a card asks
   via data-span="N", and we clamp N to however many columns actually fit, so a 3-wide card
   never breaks a narrow phone. */
function layoutGrid(only) {
  const grids = only ? [only] : document.querySelectorAll('.grid');
  grids.forEach(grid => {
    const cs = getComputedStyle(grid);
    const rowH = parseFloat(cs.gridAutoRows) || 8;
    const gap  = parseFloat(cs.rowGap) || 0;
    const cols = cs.gridTemplateColumns.split(' ').filter(Boolean).length || 1;
    grid.querySelectorAll(':scope > .card').forEach(card => {
      stickyStyle(card);                      // deterministic wobble; safe to re-run

      // Width from the card's own data-span (default 1), clamped to the columns that fit.
      const want = parseInt(card.dataset.span) || 1;
      const span = Math.max(1, Math.min(want, cols));
      card.style.gridColumnEnd = span > 1 ? `span ${span}` : '';

      // Now measure height at the CHOSEN width (wider cards are shorter) and convert to a
      // row-span. offsetHeight, NOT getBoundingClientRect(): cards are slightly rotated (see
      // stickyStyle), and the rotated bounding box would blow the packing out.
      const h = card.offsetHeight;
      card.style.gridRowEnd = `span ${Math.max(1, Math.ceil((h + gap) / (rowH + gap)))}`;
    });
  });
}
// Re-pack when the window resizes (column count and card heights both change).
let GRID_TIMER;
addEventListener('resize', () => { clearTimeout(GRID_TIMER); GRID_TIMER = setTimeout(() => layoutGrid(), 120); });
// Images arrive after render and change card heights, so re-pack when each one loads.
// 'load' doesn't bubble, hence the capture phase.
addEventListener('load', e => {
  if (e.target.tagName === 'IMG') layoutGrid(e.target.closest('.grid'));
}, true);

// A shareable deep link to one card. Built from the card's NAME rather than its sheet row,
// so a shared link keeps pointing at the right tutor/venue even if rows move in the sheet.
const cardShareUrl = name =>
  `${location.origin}${location.pathname}?card=${encodeURIComponent(String(name || '').trim())}`;

// If the page was opened from a shared card link (?card=Name), bring that card into view
// and flash it, so the person who followed the link sees what was actually shared.
function focusSharedCard() {
  const want = new URLSearchParams(location.search).get('card');
  if (!want) return;
  const key = s => String(s || '').toLowerCase().trim();
  const card = [...document.querySelectorAll('[data-card-name]')]
    .find(el => key(el.dataset.cardName) === key(want));
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.add('card-flash');
  setTimeout(() => card.classList.remove('card-flash'), 2200);
}

/* ---------- INIT ---------- */
async function init() {
  const params = new URLSearchParams(location.search);
  // Restore login from this browser session (survives the Stripe redirect / refresh)
  try {
    const saved = localStorage.getItem('familyUser');
    if (saved) USER = JSON.parse(saved);
  } catch {}

  // The cached USER (esp. USER.profile) can be stale — e.g. after editing the profile in a
  // previous session. Re-fetch it from the sheet so what you saved actually shows after a
  // reload. relogin matches on name only (no PIN) since we already trust the saved session.
  if (USER && USER.name) {
    try {
      const fresh = await (await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'relogin', name: USER.name }) })).json();
      if (fresh && !fresh.error && fresh.name) {
        USER = { ...USER,
          role: (fresh.role || USER.role || 'parent').toLowerCase(),
          profile: fresh.profile || USER.profile || null,
          kids: fresh.kids || USER.kids, parent: fresh.parent ?? USER.parent,
          topics: fresh.topics ?? USER.topics, friends: fresh.friends ?? USER.friends,
          handle: fresh.handle || USER.handle, xp: fresh.xp ?? USER.xp, credits: fresh.credits ?? USER.credits,
          highscore: fresh.highscore ?? USER.highscore, ttHighscore: fresh.ttHighscore ?? USER.ttHighscore,
          tick1: fresh.tick1 ?? USER.tick1, tick2: fresh.tick2 ?? USER.tick2, tick3: fresh.tick3 ?? USER.tick3,
          notepad: fresh.notepad ?? USER.notepad
        };
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      }
    } catch {}
  }

  // Returning after paying for an added student (?addpaid=1&ref=...)
  if (params.get('addpaid') === '1' && params.get('ref')) {
    try {
      await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'finalizeAddStudent', ref: params.get('ref') }) });
    } catch {}
    history.replaceState({}, '', location.pathname);
    const banner = $('health-banner');
    if (banner) { banner.textContent = '✅ Student added and paid — they\'re confirmed in the class.'; banner.classList.remove('hidden'); }
  } else if (params.get('addpaid') === '0') {
    history.replaceState({}, '', location.pathname);
  }

  // A parent landed on a split pay-share link (?pay_share=ORDERREF) → send them to pay their share.
  if (params.get('pay_share')) {
    const orderRef = params.get('pay_share');
    history.replaceState({}, '', location.pathname);
    try {
      const d = await (await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'payShare', splitRef: orderRef }) })).json();
      if (d.url) { window.location.href = d.url; return; }
    } catch {}
  }
  // Returning after paying a share (?sharepaid=1&ref=...) → mark it paid, maybe confirm the class.
  const sharePaid = params.get('sharepaid') === '1' && params.get('ref');
  if (sharePaid) {
    try {
      const d = await (await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'finalizeShare', ref: params.get('ref') }) })).json();
      history.replaceState({}, '', location.pathname);
      const banner = $('health-banner');
      if (banner) {
        banner.textContent = d.allPaid
          ? '✅ Share paid — the class is now fully funded and confirmed!'
          : '✅ Your share is paid. Waiting on the remaining parents.';
        banner.classList.remove('hidden');
      }
    } catch {}
  }

  // If returning from Stripe checkout (?paid=1&ref=...), finalize the booking now.
  const justPaid = params.get('paid') === '1' && params.get('ref');
  if (justPaid) {
    try {
      const res = await (await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'finalizeBooking', ref: params.get('ref') }) })).json();
      // If we weren't still logged in, restore login from who booked
      if (!USER && res && res.clientName) {
        try {
          const lr = await (await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'relogin', name: res.clientName }) })).json();
          if (lr && lr.success) {
            USER = { name: lr.name, role: (lr.role||'parent').toLowerCase(), kids: lr.kids||[], parent: lr.parent||'', profile: lr.profile||null, topics: lr.topics||'', friends: lr.friends||'', handle: lr.handle||'', highscore: lr.highscore||0, ttHighscore: lr.ttHighscore||0, xp: lr.xp||0, credits: lr.credits||0, tick1: lr.tick1||'', tick2: lr.tick2||'', tick3: lr.tick3||'', notepad: lr.notepad||'' };
            try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
          }
        } catch {}
      }
    } catch {}
    history.replaceState({}, '', location.pathname);
  } else if (params.get('paid') === '0') {
    history.replaceState({}, '', location.pathname);
  }
  try {
    // Hard timeout. Without one, a slow or timing-out Apps Script leaves every section stuck on
    // "Loading" with nothing in the console — indistinguishable from a broken build.
    const ctl = new AbortController();
    const killer = setTimeout(() => ctl.abort(), 45000);
    let res;
    try {
      res = await fetch(API, { signal: ctl.signal });
    } catch (err) {
      throw new Error(err.name === 'AbortError'
        ? 'The backend took over 45s to respond. Open the /exec URL directly to see how long it takes, '
          + 'and try adding ?refresh=1 to rebuild its caches.'
        : 'Could not reach the backend. ' + err.message);
    } finally {
      clearTimeout(killer);
    }
    DATA = await res.json();
    if (DATA.error) throw new Error(DATA.error);
    renderHealth();
    if (justPaid) {
      const banner = $('health-banner');
      if (banner) { banner.textContent = '✅ Payment received — your booking is confirmed.'; banner.classList.remove('hidden'); }
    }
    renderHeaderAuth();
    renderCards('tutors', DATA.tutors);
    renderCards('venues', DATA.venues);
    renderClasses();
    renderLinks();
    renderShop();
    renderChecklist();
    renderTools();
    renderArcade();
    renderGallery(DATA.gallery);
    fillDropdowns();
    initIntervals();
    verifyFormula();
    ['tutor','venue','class','link','shop'].forEach(renderFilterBar);
    calc();
    focusSharedCard();   // ?card=Name from a shared link → scroll to it
    // Which backend is actually serving /exec? If this isn't the version you just saved in
    // the Apps Script editor, the redeploy didn't land — that's the usual cause of new
    // backend fields arriving empty.
    console.log('@family. backend version:', DATA.version || '(older than versioning — needs redeploy)');
    // This frontend needs at least this backend. Versions are date-prefixed, so a plain string
    // compare orders them correctly. Worth checking automatically: a stale deploy looks exactly
    // like a broken feature — the action succeeds and the new behaviour silently doesn't happen.
    const have = DATA.features || [];
    const lacks = NEEDS_FEATURES.filter(f => !have.includes(f));
    if (lacks.length) {
      // A stale deploy is the worst kind of bug because it isn't one: the action succeeds, and
      // the newer half of it silently doesn't happen. Exactly what "the card updated but no
      // event row appeared" looks like.
      const msg = `Backend ${DATA.version || '(unversioned)'} is missing: ${lacks.join(', ')}. `
                + 'Redeploy the Apps Script as a NEW version — actions will seem to work while '
                + 'anything newer quietly does nothing.';
      console.warn('@family.', msg);
      const b = $('health-banner');
      if (b) { b.innerHTML = '⚠ <b>Stale backend.</b> ' + esc(msg); b.classList.remove('hidden'); }
    }
    // Which sheet dropdowns resolved to an option list. An empty one isn't fatal — the field
    // falls back to a plain text input — but it almost always means the validation rule isn't
    // applied to that column, so it's worth seeing rather than discovering by accident.
    if (DATA.validationsBuiltAt) {
      console.log('@family. dropdown options last rebuilt:', DATA.validationsBuiltAt,
        DATA.validationsBuiltAt === 'never'
          ? '— run rebuildValidations() in the Apps Script editor, or load /exec?rebuild=validations'
          : '— re-run that after editing a dropdown in the sheet');
    }
    if (DATA.timings) console.log('@family. backend timings (ms):', DATA.timings);
    // The showcase failing is not the same as the showcase being empty, and the section can't
    // tell you which. The backend now says which; this is where you read it.
    if (DATA.galleryError) console.warn('@family. showcase:', DATA.galleryError);
    if (DATA.validationReport) {
      const r = DATA.validationReport;
      console.log('@family. dropdowns loaded:', (r.found || []).length, r.found);
      if ((r.empty || []).length) console.warn('@family. NO validation found for:', r.empty,
        '— these render as plain text inputs. Check the rule covers the whole column, then reload with ?refresh=1');
    }
  } catch (e) {
    // Show a load error in the health banner (no full-screen loader anymore)
    const banner = $('health-banner');
    if (banner) {
      banner.innerHTML = `⚠ <b>Couldn't load site data.</b> ${esc(e.message)}`;
      banner.classList.remove('hidden');
    }
  } finally {
    // Site is ready (or errored) — fade the full-screen loading overlay out and remove it.
    const ls = document.getElementById('load-screen');
    if (ls) { ls.classList.add('gone'); setTimeout(() => ls.remove(), 450); }
  }
}

/* ---------- TEMPLATES ---------- */

// A multi-select field for validated columns that allow multiple values (stored comma-separated
// in the sheet cell). Renders a checkbox list; the hidden input (data-pf/data-vf) holds the
// joined value that Save harvests, exactly like a normal field. `kind` is 'pf' or 'vf'.
function multiSelectField(kind, colName, current, opts) {
  const chosen = String(current || '').split(',').map(s => s.trim()).filter(Boolean);
  const isOn = o => chosen.some(c => c.toLowerCase() === String(o).toLowerCase());
  const boxes = opts.map(o =>
    `<label class="ms-opt"><input type="checkbox" class="ms-cb" data-ms="${esc(colName)}" value="${esc(o)}" ${isOn(o) ? 'checked' : ''}> ${esc(o)}</label>`
  ).join('');
  // The hidden input is what Save reads; ms-cb ticks keep it updated (see the change handler).
  return `<span class="ms-wrap" data-ms-for="${esc(colName)}">
    <input type="hidden" data-${kind}="${esc(colName)}" class="ms-value" value="${esc(chosen.join(', '))}">
    <span class="ms-list">${boxes}</span>
  </span>`;
}

const tpl = {
  tag: t => `<span class="tag">${esc(t)}</span>`,
  // Flat label row: renders the items as plain comma-separated text (no bordered boxes),
  // consistent with the standardised flat text look. `extra` (e.g. hashtag spans) still appended.
  tagRow: (items, extra = '') => {
    const text = (items || []).filter(Boolean).map(escTokens).join(', ');
    return (text || extra) ? `<p class="attr-line">${text}${extra ? ' ' + extra : ''}</p>` : '';
  },
  // If an image fails to load (bad/expired Drive link), remove it rather than showing
  // the browser's broken-image icon. Applies everywhere tpl.img is used.
  img: (src, style = '') => src
    ? `<img src="${drive(src)}" alt="" loading="lazy" onerror="this.remove()"${style ? ` style="${style}"` : ''}>`
    : '',

  actionBtn: it => it.link
    ? `<a href="${esc(it.link)}" target="_blank" style="text-decoration:none;width:100%"><span class="text-action" style="display:inline-block">${esc(it.actionText || 'Book Session')}</span></a>`
    : it.mediaUrl
      ? `<span class="text-action" data-video="${esc(it.mediaUrl)}" data-title="${esc(it.title)}">${esc(it.actionText || 'View')}</span>`
      : '',

  schedule: hours => {
    if (!hours) return '';
    const rows = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
      .map(d => {
        const s = hours[`${d.toLowerCase()}_start`], e = hours[`${d.toLowerCase()}_end`];
        return s && e ? `<li><b>${d}:</b> ${esc(s)} – ${esc(e)}</li>` : '';
      }).filter(Boolean).join('');
    return rows ? `<ul class="details" style="margin-top:15px;border-top:1px solid var(--border);padding-top:15px">
      <p class="muted" style="margin:0 0 5px;font-size:var(--fs-xs);text-transform:uppercase;letter-spacing:1px">Operating Hours</p>
      ${rows}</ul>` : '';
  },

  card: it => {
    const norm = s => String(s || '').toLowerCase().trim().replace(/\s+/g, ' ');
    // Match the logged-in tutor to their own card by full name, name-without-spaces, or first name.
    const myName = norm(USER?.name);
    const myNameNoSpace = myName.replace(/\s+/g, '');
    const cardName = norm(it.title);
    const cardNameNoSpace = cardName.replace(/\s+/g, '');
    const nameMatches = myName && (myName === cardName || myNameNoSpace === cardNameNoSpace
      || cardName.startsWith(myName) || myName.startsWith(cardName.split(' ')[0]));
    const isOwn = isTutorRole() && it.type === 'tutor' && nameMatches;
    // Tutor progress (level + high score) — shown quietly at the BOTTOM in gray so it doesn't
    // read as ranking/status between tutors to clients.
    const st = statsOf(it);
    const stats = (it.type === 'tutor' && (st.xp || it.highscore || st.credits))
      ? `<div class="tutor-stats">Lv ${st.level} · ${st.xp} XP · 🪙 ${st.credits} · 🎮 ${it.highscore || 0}</div>`
      : '';
    // Every action a card offers, in ONE stack, in normal flow. Share used to be absolutely
    // positioned in the corner while Edit/Log out sat in their own block, so the two collided
    // and landed on top of the photo. One list, one below the other, no overlap possible.
    // An admin can edit anyone. `data-person` names whose profile to open; absent means your own.
    const isPersonCard = it.type === 'tutor' || it.type === 'person';
    const actions = [
      isOwn ? `<span class="text-action edit-profile-btn" title="Edit your profile">Edit</span>` : '',
      (!isOwn && isPersonCard && isAdmin())
        ? `<span class="text-action edit-profile-btn" data-person="${esc(it.title)}" title="Edit ${esc(it.title)}">Edit</span>` : '',
      (it.type === 'venue' && isAdmin())
        ? `<span class="text-action edit-venue-btn" data-venue="${esc(it.title)}" title="Edit this venue">Edit</span>` : '',
      `<span class="text-action card-share-btn" title="Share ${esc(it.title)}"
         data-share-url="${esc(cardShareUrl(it.title))}" data-share-title="${esc(it.title)}">Share</span>`,
      isOwn ? `<span class="text-action" id="logout-btn">Log out</span>` : '',
    ].filter(Boolean).join('');

    return `<div class="card${isOwn ? ' own-profile' : ''}" data-card-id="${it.id}" data-card-name="${esc(it.title)}"${it.type === 'venue' ? ` data-venue="${esc(it.title)}"` : ''}>
    <div class="card-actions">${actions}</div>
    ${tpl.img(it.image)}
    <h3>${esc(it.title)}</h3>
    <p class="sub">${esc(it.subtitle)}</p>
    ${it.role ? tpl.row('Role', `<span class="badge st-requested">${esc(it.role)}</span>`, '', '', 'fl-free') : ''}
    ${(it.type === 'tutor' && Number(it.rate) > 0)
      // ONE rate row. A tutor's `constant` is their PAY; showing that publicly hands over your
      // margin in one subtraction, so everyone sees pay × markup — what an hour with this tutor
      // actually costs — and only an admin sees the pay behind it.
      ? tpl.row('Rate', esc('£' + (Number(it.rate) * wageMultiplier()).toFixed(2) + '/h'
          + (isAdmin() ? ' (pays £' + Number(it.rate).toFixed(2) + ')' : '')), '', '', 'fl-free')
      : ''}
    ${it.contact ? tpl.row('Contact', esc(it.contact), '', '', 'fl-free') : ''}
    ${it.warn ? `<p class="cl-blurb dir-warn">${esc(it.warn)}</p>` : ''}
    ${it.type === 'tutor' ? `<label class="dbs-tick${isAdmin() ? ' admin' : ''}">
      <input type="checkbox" class="dbs-cb" data-tutor="${esc(it.title)}" ${it.dbs ? 'checked' : ''} ${isAdmin() ? '' : 'disabled'}>
      <span>Enhanced DBS</span>
    </label>` : ''}
    <p class="desc">${escTokens(it.description)}</p>
    ${tpl.tagRow(it.tags)}
    ${tpl.tutorCreds(it)}
    ${tpl.schedule(it.hours)}
    ${tpl.actionBtn(it)}
    ${isOwn ? tpl.timetableSection(it.title) : ''}
    ${stats}
  </div>`;
  },

  // Admin-only: full venue editor — details, location, capacity, rate, and the open-hours
  // grid. Built from DATA.venueFields + DATA.availGrid so it stays in sync with the sheet.
  venueEditCard: (v = {}) => {
    const groups = DATA.venueFields || {};
    const grid   = DATA.availGrid;
    if (!Object.keys(groups).length) {
      return `<div class="card editing"><p class="muted">Venue fields unavailable — the backend needs redeploying.</p>
        <span class="text-action" id="cancel-venue-btn">Close</span></div>`;
    }
    const vals = v.fields || {};
    const human = c => String(c).replace(/source_address_names/, 'venue name')
      .replace(/_/g, ' ').replace(/\bconstant\b/, 'surcharge £/h').replace(/link 1/, 'more info link')
      .replace(/\s+/g, ' ').trim().replace(/^./, m => m.toUpperCase());
    const field = (colName) => {
      const val = vals[colName] ?? '';
      const opts = (DATA.validations || {})[colName];
      const multi = (DATA.multiSelect || []).includes(colName);
      let input;
      if (opts && opts.length && multi) {
        input = multiSelectField('vf', colName, val, opts);
      } else if (opts && opts.length) {
        input = `<select data-vf="${esc(colName)}" class="edit-input">
          <option value="">—</option>
          ${opts.map(o => `<option value="${esc(o)}"${String(val)===String(o)?' selected':''}>${esc(o)}</option>`).join('')}
        </select>`;
      } else if (['description'].includes(colName)) {
        input = `<textarea data-vf="${esc(colName)}" class="edit-input" rows="2">${esc(val)}</textarea>`;
      } else {
        const isNum = ['max_capacity','min_capacity','min_notice_days','constant'].includes(colName);
        input = `<input ${isNum ? 'type="number" min="0"' : ''} data-vf="${esc(colName)}" class="edit-input" value="${esc(val)}">`;
      }
      return `<label class="pf-field"><span class="edit-label">${esc(human(colName))}</span>${input}</label>`;
    };
    const section = (title, cols) => `<fieldset class="pf-group"><legend>${esc(title)}</legend>
      <div class="pf-grid">${cols.map(field).join('')}</div></fieldset>`;
    const fieldSections = Object.keys(groups).map(g => section(g, groups[g])).join('');

    // Open-hours tickbox grid
    let hoursSection = '';
    if (grid) {
      const on = x => /^(true|yes|1|✓)$/i.test(String(x || '').trim());
      const av = v.avail || {};
      const head = `<tr><th></th>${grid.hours.map(h => `<th>${h}</th>`).join('')}</tr>`;
      const gridRows = grid.days.map(([prefix, label]) => {
        const cells = grid.hours.map(h => {
          const col = prefix + String(h).padStart(2, '0');
          return `<td><input type="checkbox" class="venue-cb" data-vf="${esc(col)}" ${on(av[col]) ? 'checked' : ''}></td>`;
        }).join('');
        return `<tr><th class="avail-day">${esc(label)}</th>${cells}</tr>`;
      }).join('');
      hoursSection = `<fieldset class="pf-group"><legend>Open hours</legend>
        <div class="avail-wrap"><table class="avail-table">${head}${gridRows}</table>
        <p class="muted note">Tick the hours this venue is open for sessions.</p></div>
      </fieldset>`;
    }

    return `<div class="card editing profile-edit-wide" data-span="99" data-venue="${esc(v.title)}">
      <h3 class="gold mb-md">Editing ${esc(v.title)}</h3>
      ${fieldSections}
      ${hoursSection}
      <div class="row-gap mt-md center-y">
        <span class="edit-status muted note grow nowrap"></span>
        <span class="text-action" id="cancel-venue-btn">Done</span>
      </div>
    </div>`;
  },

  // Professional credentials shown on a tutor's card to any visitor: experience,
  // what they teach, their qualifications. Each part appears only if it has data, so a
  // sparse profile just shows less rather than empty headings.
  tutorCreds: (it) => {
    const rows = [];
    // Same row component as the rest of the card, so Experience lines up with Rate and Status
    // rather than sitting in its own slightly different grid.
    if (it.yrsExp) rows.push(tpl.row('Experience',
      esc(it.yrsExp + ' yr' + (String(it.yrsExp) === '1' ? '' : 's')), '', '', 'fl-free'));
    if (it.teaches?.length) rows.push(tpl.row('Teaches', esc(it.teaches.join(', ')), '', '', 'fl-free'));
    if (it.quals?.length) rows.push(tpl.row('Qualifications',
      it.quals.map(esc).join('<br>'), '', '', 'fl-free'));
    if (it.extraQuals) rows.push(tpl.row('Also', esc(it.extraQuals), '', '', 'fl-free'));
    // Venues this tutor is happy at — stored venue-side, displayed tutor-side.
    const myHandle = norm(it.handle);
    const venues = (DATA.venues || [])
      .filter(v => (v.comfort || []).some(h => norm(h) === myHandle))
      .map(v => v.title);
    if (venues.length) rows.push(tpl.row('Teaches at', esc(venues.join(', ')), '', '', 'fl-free'));
    return rows.join('');
  },

  // A single friend's card (shows their level, checklist progress, and arcade high score)
  // Shop item card: image, name, price, description, Buy button (payment wired later)
  shopCard: (it) => `<div class="card t-left">
    ${it.image ? tpl.img(it.image) : ''}
    <h3>${esc(it.name)}</h3>
    ${it.price ? `<p class="sub">${esc(it.unit || '')}${esc(it.price)}</p>` : ''}
    ${it.description ? `<p class="desc">${escTokens(it.description)}</p>` : ''}
    <span class="text-action buy-item-btn" data-item="${esc(it.id)}" data-name="${esc(it.name)}">Buy</span>
  </div>`,

  // Tutor's weekly timetable, rendered INSIDE their own profile card.
  // Built from their jobs; availability can slot into these lines later.
  timetableSection: (tutorName) => {
    const norm = s => String(s || '').toLowerCase().trim();
    const DAYS = (DATA.dropdowns?.days || []);
    const mine = (DATA.clientClasses || []).filter(j => norm(j.requestedTutor) === norm(tutorName));

    const rows = DAYS.map(day => {
      const jobs = mine
        .filter(j => norm(j.day) === norm(day))
        .sort((a, b) => String(a.time).localeCompare(String(b.time)));
      if (!jobs.length) return '';
      const lines = jobs.map(j => {
        const who = (j.slots || []).map(s => s.client).filter(Boolean).join(', ');
        const end = addHours(j.time, 2);   // sessions run 2 hours
        return `<div class="tt-line">
          <span class="tt-time">${esc(fmtTime(j.time))}–${esc(fmtTime(end))}</span>
          <span class="tt-what">${esc(who || j.subject || 'Class')}</span>
        </div>`;
      }).join('');
      return `<div class="tt-day">
        <div class="tt-dayname">${esc(fmtDay(day))}</div>
        ${lines}
      </div>`;
    }).filter(Boolean).join('');

    return `<div class="tt-section">
      <div class="tt-heading">Timetable</div>
      ${rows || '<p class="muted" style="font-size:var(--fs-xs);margin:0">No classes scheduled.</p>'}
    </div>`;
  },

  friendCard: (s, isChild = false) => {
    const st = statsOf(s);
    return `<div class="card t-left">
      ${isChild ? '' : `<button type="button" class="remove-friend-btn" data-handle="${esc(s.handle)}" title="Remove">✕</button>`}
      <h3>${esc(s.name)} <span class="lb-lvl">Lv ${st.level}</span></h3>
      <p class="sub">${esc(s.handle)}</p>
      ${tpl.tagRow([`${st.xp} XP`, `🪙 ${st.credits} credits`, `🎮 ${s.highscore || 0}`])}
    </div>`;
  },

  // Arcade game card (Flappy-style canvas)
  gameCard: () => `<div class="card t-center">
    <h3 class="gold mb-sm">Flabby Pird</h3>
    <canvas id="flappy-canvas" width="280" height="360" style="width:100%;max-width:280px;background:#0a0a0a;border:1px solid var(--border);border-radius:8px;cursor:pointer"></canvas>
    <p style="margin:10px 0 0">Score: <b id="flappy-score" class="ink-strong">0</b>${canTrack() ? ` · Best: <b id="flappy-best" class="ink-gold">${USER.highscore || 0}</b>` : ''}</p>
    <p id="flappy-msg" class="muted" style="font-size:var(--fs-xs);min-height:14px;margin-top:6px">Click the game to start</p>
  </div>`,

  // Kid's checklist: ONE CARD PER GRADE (each its own card in the grid)
  // Compact GCSE calculator that fits in a card (basic + √, x², trig, brackets, π)
  // Student notepad tool — saves to the person's `notepad` cell. Any logged-in user.
  // Notepad is always visible (simplest design). Saves automatically as you type, like the tickboxes.
  notepadCard: () => `<div class="card t-left">
    <h3 class="gold mb-sm">Notepad</h3>
    <textarea id="notepad-text" class="notepad-area" placeholder="Jot notes here..." ${USER ? '' : 'disabled'}>${esc(USER?.notepad || '')}</textarea>
    <p class="muted" id="notepad-status" style="font-size:var(--fs-xs);margin:6px 0 0;min-height:1em">${USER ? '' : 'Log in to save your notes.'}</p>
  </div>`,

  // Month calendar tool — today highlighted, prev/next navigation.
  calendarCard: () => `<div class="card t-left">
    <div class="row-between mb-sm">
      <span class="text-action" onclick="calShift(-1)">‹</span>
      <h3 class="gold" id="cal-label" style="margin:0">Calendar</h3>
      <span class="text-action" onclick="calShift(1)">›</span>
    </div>
    <div id="cal-body" class="cal-grid"></div>
  </div>`,

  // Times-tables sprint: 60 seconds, random questions up to 12×12. Score = correct answers.
  timesTableCard: () => `<div class="card t-left">
    <h3 class="gold mb-sm">Times Tables Sprint</h3>
    <p class="muted" style="font-size:var(--fs-xs);margin:0 0 10px">60 seconds. As many as you can.</p>
    <div id="tt-idle">
      <span class="text-action" id="tt-start">Start</span>
      ${canTrack() ? `<p class="muted note">Best: <b class="ink-gold">${USER.ttHighscore || 0}</b></p>` : ''}
    </div>
    <div id="tt-play" class="hidden">
      <p style="display:flex;justify-content:space-between;font-size:var(--fs-sm);margin:0 0 8px">
        <span>Time: <b id="tt-time" class="ink-strong">60</b>s</span>
        <span>Score: <b id="tt-score" class="ink-gold">0</b></span>
      </p>
      <p id="tt-question" style="font-size:26px;text-align:center;margin:12px 0;color:#fff"></p>
      <input id="tt-answer" type="number" inputmode="numeric" placeholder="Answer" style="width:100%;padding:10px;text-align:center;font-size:18px">
      <p id="tt-feedback" class="muted" style="font-size:var(--fs-xs);min-height:1em;margin:6px 0 0;text-align:center"></p>
    </div>
    <div id="tt-over" class="hidden t-center">
      <p style="font-size:var(--fs-lg);margin:10px 0">You got <b id="tt-final" class="ink-gold">0</b></p>
      <p id="tt-best-msg" class="muted note status-line"></p>
      <span class="text-action" id="tt-again">Play again</span>
    </div>
  </div>`,

  // Simple 25-minute countdown timer with an alarm.
  timerCard: () => `<div class="card t-left">
    <h3 class="gold mb-sm">Timer</h3>
    <p id="timer-display" style="font-size:var(--fs-display);text-align:center;margin:10px 0;color:#fff;letter-spacing:2px">25:00</p>
    <div class="row-gap">
      <button type="button" id="timer-toggle" class="action btn-wide">&#9654;</button>
      <button type="button" id="timer-reset" class="ghost btn-wide">&#8635;</button>
    </div>
    <p id="timer-msg" class="muted" style="font-size:var(--fs-xs);min-height:1em;margin:8px 0 0;text-align:center"></p>
  </div>`,

  calcToolCard: () => `<div class="card mini-calc t-left">
    <h3 class="gold mb-sm">Calculator</h3>
    <input id="mc-display" class="mc-display" value="0" readonly>
    <div class="mc-grid mc-fns">
      <button type="button" class="mc-btn fn" data-mc="sin(">sin</button>
      <button type="button" class="mc-btn fn" data-mc="cos(">cos</button>
      <button type="button" class="mc-btn fn" data-mc="tan(">tan</button>
      <button type="button" class="mc-btn fn" data-mc="sqrt(">√</button>
      <button type="button" class="mc-btn fn" data-mc="^2">x²</button>
      <button type="button" class="mc-btn fn" data-mc="^">xʸ</button>
      <button type="button" class="mc-btn fn" data-mc="(">(</button>
      <button type="button" class="mc-btn fn" data-mc=")">)</button>
      <button type="button" class="mc-btn fn" data-mc="pi">π</button>
      <button type="button" class="mc-btn del" data-mc="del" aria-label="Delete">⌫</button>
    </div>
    <div class="mc-grid mc-nums">
      <button type="button" class="mc-btn" data-mc="7">7</button>
      <button type="button" class="mc-btn" data-mc="8">8</button>
      <button type="button" class="mc-btn" data-mc="9">9</button>
      <button type="button" class="mc-btn op" data-mc="/">÷</button>
      <button type="button" class="mc-btn" data-mc="4">4</button>
      <button type="button" class="mc-btn" data-mc="5">5</button>
      <button type="button" class="mc-btn" data-mc="6">6</button>
      <button type="button" class="mc-btn op" data-mc="*">×</button>
      <button type="button" class="mc-btn" data-mc="1">1</button>
      <button type="button" class="mc-btn" data-mc="2">2</button>
      <button type="button" class="mc-btn" data-mc="3">3</button>
      <button type="button" class="mc-btn op" data-mc="-">−</button>
      <button type="button" class="mc-btn" data-mc="0">0</button>
      <button type="button" class="mc-btn" data-mc=".">.</button>
      <button type="button" class="mc-btn eq" data-mc="=">=</button>
      <button type="button" class="mc-btn op" data-mc="+">+</button>
    </div>
    <p class="muted note">Degrees mode</p>
  </div>`,

  // Admin only: relabel one resource in place. Built from DATA.resourceFields, so adding a field
  // is a backend change and nothing here moves. Saves on change like the tick boxes and the DBS
  // flag do — there's no Save button anywhere else on the site, so there isn't one here.
  resourceEdit: (tp) => {
    const groups = DATA.resourceFields || {};
    const lists  = DATA.options || {};
    const which  = DATA.resourceOptions || {};
    const field = (f) => {
      const v = tp[RES_FIELD_MAP[f] !== undefined ? RES_FIELD_MAP[f] : f] ?? '';
      const label = `<span class="edit-label">${esc(f.replace(/_/g, ' '))}</span>`;
      if (f === 'trackable' || f === 'print_required') {
        const on = f === 'trackable' ? tp.trackable : tp.paper;
        return `<label class="pf-field pf-check">
          <input type="checkbox" class="res-f" data-f="${esc(f)}" ${on ? 'checked' : ''}>${label}</label>`;
      }
      const opts = lists[which[f]] || null;
      const input = opts
        ? `<select class="res-f edit-input" data-f="${esc(f)}"><option value="">—</option>` +
          opts.map(o => `<option value="${esc(o)}"${norm(o) === norm(v) ? ' selected' : ''}>${esc(o)}</option>`).join('') +
          `</select>`
        : `<input class="res-f edit-input" data-f="${esc(f)}" value="${esc(v)}">`;
      return `<label class="pf-field">${label}${input}</label>`;
    };
    return `<div class="res-edit hidden" data-row="${tp.rowIndex}">
      ${Object.keys(groups).map(g => `<fieldset class="pf-group"><legend>${esc(g)}</legend>
        <div class="pf-grid">${groups[g].map(field).join('')}</div></fieldset>`).join('')}
      <div class="cl-acts"><span class="edit-status note grow"></span>
        <span class="text-action res-done">Done</span></div>
    </div>`;
  },

  // One checklist band card (subject + grade/stage) with two checkboxes per topic.
  // `item` = { subject, band, bandLabel, topics }. Uses current USER progress.
  checklistBandCard: (item, _i, all) => {
    const myHandle = canTrack() ? String(USER.handle || '').toLowerCase().trim() : '';
    // A box is checked if my handle appears in that topic's tickN handle-list.
    const iAmIn = (cellStr) => {
      if (!myHandle) return false;
      return String(cellStr || '').split(/[,\n]/).map(s => s.trim().toLowerCase())
        .some(h => h && h === myHandle);
    };
    const rows = item.topics.map(tp => {
      const box = (n, cell) => `<label class="mini-check"><input type="checkbox" class="topic-cb"
        data-row="${tp.rowIndex}" data-tick="${n}" ${iAmIn(cell) ? 'checked' : ''} ${myHandle ? '' : 'disabled'}></label>`;
      // Only trackable items (checklist=TRUE) get the three tick boxes. Reference-only
      // items (checklist=FALSE — inserts, formula sheets, technique glossaries) show just
      // the name and link.
      const boxes = tp.trackable
        ? `<span class="check-boxes">${box(1, tp.tick1)}${box(2, tp.tick2)}${box(3, tp.tick3)}</span>`
        : '';
      return `<div class="check-row${tp.trackable ? '' : ' ref-row'}">
        ${tp.link
          ? `<a class="check-topic" href="${esc(tp.link)}" target="_blank" rel="noopener">${esc(tp.name)}</a>`
          : `<span class="check-topic">${esc(tp.name)}</span>`}
        ${isAdmin() ? `<span class="text-action res-edit-btn" data-row="${tp.rowIndex}">Edit</span>` : ''}
        ${boxes}
      </div>${isAdmin() ? tpl.resourceEdit(tp) : ''}`;
    }).join('');
    // `all` is the sibling list — Array.map hands it over as the third argument, which is
    // exactly what the title rule needs to see what varies between cards.
    const title = cardTitle(item, all || [item]);
    // Width from how many topics the card holds — a big reference list spreads wide instead
    // of becoming a tall strip; a small card stays at 1 column.
    const span = spanForCount(item.topics.length);
    return `<div class="card grade-card" data-span="${span}" class="t-left">
      <h3 class="gold mb-xs">${esc(title)}</h3>
      <div class="check-list">${rows}</div>
    </div>`;
  },

  // The same card switched into edit mode (inputs in place of display fields)
  // The edit form is generated from DATA.profileFields (sent by the backend), so the field
  // list lives in exactly one place. Each input carries data-pf="<sheet column>", and Save
  // just harvests those — adding a field later needs no frontend change.
  profileEditCard: (p = {}) => {
    // Which fields you may edit depends on who you are. A tutor gets qualifications and
    // availability; a parent gets contact details; a student gets those plus date of birth.
    // The lists come from the backend so there is one definition of each, not two.
    // Whose role decides the fields: the person being EDITED, not the person doing the editing.
    // An admin opening a parent's profile should see the parent's form, not a tutor's.
    const editRole = EDIT_TARGET ? EDIT_TARGET.role : (USER && USER.role);
    const groups = (editRole === 'parent') ? (DATA.clientFields || {})
                 : (editRole === 'kid')    ? (DATA.studentFields || {})
                 : (DATA.profileFields || {});
    // The admin-set flags are read-only to the person themselves and WRITABLE to an admin —
    // that's what makes them admin-set rather than simply hidden.
    const readonly = EDIT_TARGET ? [] : (isTutorRole() ? (DATA.profileReadonly || []) : []);
    const adminExtras = EDIT_TARGET ? (DATA.profileReadonly || []) : [];
    const times    = DATA.dropdowns?.times || [];
    // The field list comes from the backend. If it's missing, the deployed Apps Script is
    // older than this frontend — say so plainly rather than showing an empty form.
    if (!Object.keys(groups).length) {
      return `<div class="card own-profile editing">
        <h3 class="gold mb-sm">Editing your profile</h3>
        <p class="muted" style="font-size:var(--fs-sm);text-align:left">
          Couldn't load the profile fields. The Apps Script needs redeploying as a
          <b>new version</b> before this form can appear.</p>
        <span class="text-action" id="cancel-profile-btn">Close</span>
      </div>`;
    }
    const human = c => String(c).replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
      .replace(/^./, m => m.toUpperCase());

    const field = (colName) => {
      const v  = p[colName] ?? '';
      const ro = readonly.includes(colName);
      const opts = (DATA.validations || {})[colName];
      const multi = (DATA.multiSelect || []).includes(colName);
      let input;
      // 'dbs checked' is a yes/no safeguarding flag → show it as a tickbox. It lives in the
      // "Set by admin" section and is readonly here, so the box is disabled for tutors.
      if (/^dbs[\s_]*check/i.test(colName)) {
        const on = /^(true|yes|1|✓)$/i.test(String(v).trim());
        return `<label class="pf-field pf-check">
          <input type="checkbox" data-pf="${esc(colName)}" class="edit-check" ${on ? 'checked' : ''}${ro ? ' disabled' : ''}>
          <span class="edit-label">${esc(human(colName))}</span>
        </label>`;
      }
      if (opts && opts.length && multi && !ro) {
        input = multiSelectField('pf', colName, v, opts);
      } else if (opts && opts.length) {
        input = `<select data-pf="${esc(colName)}" class="edit-input"${ro ? ' disabled' : ''}>
          <option value="">—</option>
          ${opts.map(o => `<option value="${esc(o)}"${String(v)===String(o)?' selected':''}>${esc(o)}</option>`).join('')}
        </select>`;
      } else if (['description', 'extra_qualifications', 'Hobbies'].includes(colName)) {
        input = `<textarea data-pf="${esc(colName)}" class="edit-input" rows="2">${esc(v)}</textarea>`;
      } else {
        input = `<input data-pf="${esc(colName)}" class="edit-input" value="${esc(v)}"${ro ? ' disabled' : ''}>`;
      }
      return `<label class="pf-field">
        <span class="edit-label">${esc(human(colName))}</span>
        ${input}
      </label>`;
    };

    // The availability group is rendered as a compact day × hour tickbox grid rather than 77
    // separate fields. Each cell is a checkbox whose data-pf is the sheet column (m09, tu10…);
    // Save harvests them as TRUE/FALSE like any other field.
    const availGrid = () => {
      const g = DATA.availGrid;
      if (!g) return '';
      const on = v => /^(true|yes|1|✓)$/i.test(String(v || '').trim());
      const head = `<tr><th></th>${g.hours.map(h => `<th>${h}</th>`).join('')}</tr>`;
      const rows = g.days.map(([prefix, label]) => {
        const cells = g.hours.map(h => {
          const col = prefix + String(h).padStart(2, '0');
          return `<td><input type="checkbox" class="avail-cb" data-pf="${esc(col)}" ${on(p[col]) ? 'checked' : ''}></td>`;
        }).join('');
        return `<tr><th class="avail-day">${esc(label)}</th>${cells}</tr>`;
      }).join('');
      return `<div class="avail-wrap"><table class="avail-table">${head}${rows}</table>
        <p class="muted note">Tick the hours you can teach.</p></div>`;
    };

    const section = (title, cols) => {
      if (title === 'Availability') {
        return `<fieldset class="pf-group"><legend>${esc(title)}</legend>${availGrid()}</fieldset>`;
      }
      return `<fieldset class="pf-group">
        <legend>${esc(title)}</legend>
        <div class="pf-grid">${cols.map(c => field(c)).join('')}</div>
      </fieldset>`;
    };

    const sections = Object.keys(groups).map(g => section(g, groups[g])).join('');

    // "Venues I teach at" — the tutor ticks venues they're comfortable at. Each tick writes
    // their handle into that VENUE's comfort list (like a checklist), saved instantly.
    const myHandle = String(p.username || USER?.handle || '').toLowerCase().trim();
    const venueTicks = (DATA.venues || []).map(v => {
      const on = (v.comfort || []).some(h => String(h).toLowerCase().trim() === myHandle);
      return `<label class="ms-opt"><input type="checkbox" class="venue-comfort-cb" data-venue="${esc(v.title)}" ${on ? 'checked' : ''}> ${esc(v.title)}</label>`;
    }).join('');
    const comfortSection = (isTutorRole() && (DATA.venues || []).length)
      ? `<fieldset class="pf-group"><legend>Venues I teach at</legend>
           <p class="muted note t-left">Tick the venues you're happy to teach at.</p>
           <div class="ms-list">${venueTicks}</div>
         </fieldset>`
      : '';
    // Read-only fields are shown so the tutor can see their status, but can't be changed here.
    const roSection = readonly.length
      ? `<fieldset class="pf-group">
           <legend>Set by admin</legend>
           <p class="muted note t-left">
             Shown for reference — ask an admin to change these.</p>
           <div class="pf-grid">${readonly.map(c => field(c)).join('')}</div>
         </fieldset>`
      : '';

    const adminSection = adminExtras.length
      ? `<fieldset class="pf-group"><legend>Admin only</legend>
           <p class="muted note t-left">
             Only an admin can change these.</p>
           <div class="pf-grid">${adminExtras.map(c => field(c)).join('')}</div>
         </fieldset>`
      : '';

    return `<div class="card own-profile editing profile-edit-wide" data-span="99">
      <h3 class="gold mb-md">${EDIT_TARGET
        ? 'Editing ' + esc(EDIT_TARGET.name) : 'Editing your profile'}</h3>
      ${sections}
      ${comfortSection}
      ${adminSection}
      ${roSection}
      <div class="row-gap mt-md center-y">
        <span class="edit-status muted note grow nowrap"></span>
        <span class="text-action" id="cancel-profile-btn">Done</span>
      </div>
    </div>`;
  },

  jobCard: (j, isDash = false, state = '') => {
    const norm = s => String(s || '').toLowerCase().trim();
    const slots = j.slots || [];
    const isTutor = isTutorRole() && norm(j.requestedTutor) === norm(USER.name);
    const admin = isAdmin();
    const myName = USER ? norm(USER.name) : '';
    const mySlot = USER ? slots.find(s => norm(s.client) === myName && myName) : null;
    const emptySlot = slots.find(s => !String(s.client||'').trim());
    const role = USER ? USER.role : '';
    const status = jobStatus(j);   // canonical status drives every action below
    const isClient1 = mySlot && mySlot.n === 1;
    // Joining only makes sense while the job is live and has room.
    const canJoin = USER && !isTutorRole() && role !== 'kid' && !mySlot && emptySlot && status === 'Active';

    // Whose turn is it during negotiation? On a fresh Requested job the tutor responds first;
    // during Negotiating, offerTurn names the side that must respond next. myTurn = mine.
    const negotiating = (status === 'Requested' || status === 'Negotiating');
    const mySide = (isTutor || admin) ? 'tutor' : (mySlot ? 'client' : '');
    const turn = j.offerTurn || (status === 'Requested' ? 'tutor' : '');
    const myTurn = mySide && mySide === turn;

    // Status shown as a coloured badge, colour by lifecycle stage.

    // No floating badge any more — status is a row like everything else, and two places to
    // read the same value is one place too many. "Yours" rides along in that row's value.

    // The job prices itself through the SAME function the booking form uses, so a class card
    // shows exactly the per-line costs the client agreed to. No separate breakdown anywhere.
    const P = priceJob(j);
    // POSSESSION = is this job mine? It separates the classes you're part of from other
    // families' classes that happen to have a free seat. It is NOT whose turn it is — that's
    // offer_turn, a different question with a different answer, and conflating them made the
    // row say "Yours" on a stranger's class just because you were the one being waited on.
    // Purely per-viewer: the same row is Yours to one family and Others to the next, so it is
    // derived here and never stored.
    // Computed inline rather than reusing the iAmTheTutor further down: that's a `const`
    // declared later in the function, so reading it here throws on the temporal dead zone —
    // a runtime error node --check can't see.
    // "Yours" = this job involves you, on either side. You booked it, you're teaching it, or
    // you've applied to teach it. Anything else is someone else's class that happens to be
    // visible to you — which is the distinction the row exists to draw.
    const meNow = norm(USER && USER.name);
    const isMine = !!mySlot
      || (isTutorRole() && norm(j.requestedTutor) === meNow)
      || (isTutorRole() && (j.tutorSlots || []).some(t => norm(t.name) === meNow));
    const possession = !USER
      ? ''
      : badge(isMine ? 'Yours' : 'Others');

    // JOB LIFECYCLE — the calendar life of the class, from source_job_lifecycle:
    //   uncreated · upcoming · started · ongoing · ended
    // Every one of these is decided by a DATE passing, never by anyone pressing anything, which
    // is what makes it independent of Status. A class can be Requested and Ongoing at once if
    // the term is running while terms are still being argued over.
    //   uncreated  the booking hasn't been made yet (the builder card only — a live job exists)
    //   upcoming   booked, no session has happened
    //   started    the first session has happened
    //   ongoing    more than one done, more still to come
    //   ended      every session is behind us
    const lifecycle = (() => {
      const ds = String(j.dates || '').split(',').map(x => x.trim()).filter(Boolean)
        .map(parseDMY).filter(Boolean).sort((a, b) => a - b);
      if (!ds.length) return 'Upcoming';                    // exists, but nothing scheduled yet
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const done = ds.filter(d => d <= today).length;
      if (done === 0)        return 'Upcoming';
      if (done >= ds.length) return 'Ended';
      if (done === 1)        return 'Started';
      return 'Ongoing';
    })();

    const detail = tpl.priceRows(P, {
      editable: false, studentsLabel: j.capacity, datesText: j.dates, possession,
      lifecycle: badge(lifecycle),
      // Status says WHERE the job is; Possession says whose it is. The "Yours" badge used to
      // ride along here as well, so the two rows said the same word one line apart.
      status: badge(status)
    });

    // Where the tutor side of this job stands, and which tutor a family is actually dealing with.
    // Both are needed by the control below; they lived inside the tutor panel that's now gone.
    const tStatus = tutorStatus(j.tutorStatus, j.requestedTutor);
    // The settled tutor if there is one, otherwise the only applicant. With several applicants
    // there is no single counterpart yet — which is exactly when the chooser appears instead.
    const dealTutor = (j.tutorSlots || []).find(t => /confirm/i.test(t.status || ''))
                   || ((j.tutorSlots || []).length === 1 ? j.tutorSlots[0] : null);
    const theirT = dealTutor ? dealTutor.status : '';

    // ---- THE ONE THING YOU CAN DO -----------------------------------------------------------
    // Everything below used to be three stacked blocks: a tutor panel with an applicant list and
    // a picker, a per-family panel with its own dropdown and blurb, and a history log — all open
    // at once, for every viewer, whether or not any of it was theirs to act on. A client who had
    // just booked was shown "1 tutor waiting. Picking one declines the rest" beside "pay to
    // secure your place", which are instructions for two different situations.
    //
    // So: the card states what it is and where it stands in its rows, offers AT MOST ONE control,
    // and puts the record behind a disclosure. If there is nothing for you to do, there is
    // nothing to read.

    // Who am I here, and what may I do about it?
    const meRow = mySlot || (isTutor ? { client: USER && USER.name, status: (j.tutorSlots || [])
      .filter(x => norm(x.name) === norm(USER && USER.name)).map(x => x.status)[0] || '' } : null);
    const myActs = meRow
      ? bmActionsFor(isTutor ? 'tutor' : 'client', String(meRow.status || ''), String(theirT || ''))
      : [];

    // A family with unchosen applicants has a real decision. Nobody else does — and if the tutor
    // was named at booking there was never a choice to make, so this never appears.
    const applicants = (j.tutorSlots || []).filter(x => !/confirm/i.test(x.status || ''));
    const mustPickTutor = !!mySlot && tStatus !== 'Confirmed' && applicants.length > 0;

    let control = '';
    if (mustPickTutor) {
      control = `<div class="cl-form">
        <select class="tutor-pick">
          <option value="">— choose your tutor —</option>
          ${applicants.map(a => `<option value="${esc(a.name)}">${esc(a.name)}</option>`).join('')}
        </select>
        <span class="text-action tutor-choose" data-job="${j.id}">Confirm tutor</span>
      </div>`;
    } else if (myActs.length) {
      const opts = (myActs.length > 1 ? [''] : []).concat(myActs);
      control = `<div class="cl-form">
        <select class="cl-action">${opts.map(a =>
          `<option value="${esc(a)}">${a ? esc(a) : '— choose —'}</option>`).join('')}</select>
        <input type="text" class="move-text cl-msg" placeholder="Add a message (optional)…">
        <span class="text-action cl-submit" data-job="${j.id}"
              data-counterpart="${esc(dealTutor ? dealTutor.name : '')}">Submit</span>
      </div>`;
    } else if (!mySlot && !isTutor && !admin && canJoin) {
      control = `<div class="cl-acts"><span class="text-action join-job-btn" data-job="${j.id}">Request to join</span></div>`;
    } else if (!USER && !isDash) {
      control = `<div class="cl-acts"><span class="text-action book-btn-inline${j.spotsLeft <= 0 ? ' disabled' : ''}">${j.spotsLeft <= 0 ? 'Full' : 'Book now'}</span></div>`;
    }

    // A tutor needs to see who is attending; a family does not need to see the other families.
    // Rows, not blocks — one line each, in the same grid as everything else on the card.
    const roster = (isTutor || admin)
      ? (j.slots || []).filter(x => x.client)
          .map(x => tpl.row(x.client, badge(x.status), '', '', 'fl-free')).join('')
      : '';

    // The record. Collapsed, because it's for when something looks wrong — not for every load.
    const history = (j.events || []).length
      ? `<details class="bd-more"><summary>History (${j.events.length})</summary>
           <div class="cl-thread">${j.events.map(e => `<div class="cl-msg-line">
             <span class="cl-who">${esc(e.actor || '—')}</span>
             <span class="cl-what">${esc(e.action)}${e.target ? ' → ' + esc(e.target) : ''}${
               e.message ? ' — ' + esc(e.message) : ''}<span class="note"> ${esc(e.at || '')}</span></span>
           </div>`).join('')}</div>
         </details>`
      : '';

    const cls = mySlot ? 'mine-class' : '';
    // Two columns wide: a priced card holds a dozen label/value/price rows plus the hour grid,
    // and at single width every value wraps. The booking card matches, so the pair still read
    // as one kind of object. layoutGrid clamps this down to 1 on narrow screens automatically.
    return `<div class="card ${cls}" data-span="2" data-card-name="${esc(j.title || 'Session')}">
      <div class="card-actions">
        <span class="text-action card-share-btn" title="Share this session"
          data-share-url="${esc(cardShareUrl(j.title || 'Session'))}" data-share-title="${esc(j.title || 'Session')}">Share</span>
      </div>
      ${(j.image || j.image2) ? `<div class="job-photos">${j.image ? tpl.img(j.image) : ''}${j.image2 ? tpl.img(j.image2) : ''}</div>` : ''}
      <h3>${esc(j.title) || 'Session'}</h3>
      <div class="job-detail">${detail}</div>
      ${roster ? `<div class="job-slots">${roster}</div>` : ''}
      ${control}
      ${history}
    </div>`;
  },

  // ONE row shape for every priced field, used by the booking form AND by live job cards:
  //   label | value | £/hour it adds | what that comes to over the whole booking
  // Two money columns because a rate on its own is unactionable — "+£1/h" sounds like nothing
  // until you see it's +£22 across the term — and a total on its own hides where it came from.
  // THE row. Every "label: value" on the site is this, so a card's rows line up with every
   // other card's rows whatever the card is. There were three of these — field-line here,
   // job-line in the class card and cred-row in the tutor credentials — each with its own class
   // names and its own CSS, which is why labels didn't align between sections.
  row: (k, valueHtml, rateHtml, totalHtml, cls) => {
    // A row with no money in it (Status, Role, Possession, Contact) drops to two columns.
    // Keeping four meant the two empty ones still claimed width, so in a one-column card the
    // value column was crushed to a few pixels and its contents wrapped one letter per line —
    // "A / d / m / i / n". Deciding this here rather than at each call site is the point: no
    // caller can forget, and no future row can reintroduce it.
    const money = (rateHtml || '') !== '' || (totalHtml || '') !== '';
    return `<div class="field-line ${money ? '' : 'fl-plain '}${cls || ''}">` +
      `<span class="fl-k">${esc(k)}</span><span class="fl-v">${valueHtml}</span>` +
      (money ? `<span class="fl-r">${rateHtml || ''}</span><span class="fl-p">${totalHtml || ''}</span>` : '') +
      `</div>`;
  },

  // P = a priceFrom() result (or null while a booking is still blank).
  // o = { editable, lesson, studentsLabel }
  priceRows: (P, o) => {
    o = o || {};
    const ed = !!o.editable, i = o.lesson;
    const L = P || {};
    const money = x => `£${(Number(x) || 0).toFixed(2)}`;

    // Every per-hour surcharge is discounted and multiplied by the hours before it reaches the
    // client — except the venue, which is room hire at cost and never discounted. So the total
    // a row contributes has to be derived the same way the price itself was, or the column
    // would quietly disagree with the Total beneath it.
    const F = (L.discountFactor || 1) * (L.promoAdj || 1);
    const H = L.hoursTotal || 0;
    const totOf = (x, atCost) => (Number(x) || 0) * (atCost ? 1 : F) * H;

    const rate = x => x ? `+ ${money(x)}/h` : '—';
    const tot  = (x, atCost) => x ? `+ ${money(totOf(x, atCost))}` : '—';
    // Editable rows get placeholders keyed by name; calc() refreshes them in place, because
    // re-rendering the block would drop keyboard focus and close the subject dropdown.
    const cell = (key, html) => ed ? `<span data-${key}>${P ? html : '—'}</span>` : html;
    const rateCell = (key, x) => cell('rate="' + key + '"', rate(x));
    const totCell  = (key, x, atCost) => cell('total="' + key + '"', tot(x, atCost));

    const ctl = (cls, extra) => `<select class="pick ${cls}" data-lesson="${i}"></select>${extra || ''}`;
    const free = x => x ? '' : 'fl-free';
    const subjectAdd = (L.avgSubject || 0) + (L.addSubjects || 0);
    const rows = [];

    // Status leads, because it's the first thing anyone looks for and it belongs in the row
    // system like everything else — a floating badge reads as decoration, a row reads as data.
    if (o.status) rows.push(tpl.row('Status', o.status, '', '', 'fl-free'));
    // Whose move it is, on its own line. Status says where the negotiation IS; possession says
    // who has to do something next. They answer different questions, so they get different rows.
    if (o.possession) rows.push(tpl.row('Possession', o.possession, '', '', 'fl-free'));
    // Lifecycle is the CALENDAR life of the class, which moves independently of the deal.
    // A job can be Accepted (deal) and still Upcoming (calendar); it becomes Ended by the date
    // passing, not by anyone pressing anything. Status answers "where's the negotiation",
    // Lifecycle answers "has it happened yet".
    if (o.lifecycle) rows.push(tpl.row('Lifecycle', o.lifecycle, '', '', 'fl-free'));

    rows.push(tpl.row('Tuition',
      // What a client should see is the rate, not how it was arrived at. "min wage × 2" tells a
      // parent what the tutor is paid and what the markup is — neither is theirs to know, and
      // "minimum wage" reads as a quality statement about the tutor besides. Admins keep the
      // derivation, because they're the ones who need to check it.
      `<span class="fl-note">${isAdmin()
        ? esc(`${L.usingTutorRate ? 'tutor rate' : 'min wage'} ${money(L.M)} × ${L.wMul}`)
        : (L.usingTutorRate ? "Tutor's rate" : 'Standard rate')}</span>`,
      cell('rate="base"', `${money((L.M || 0) * (L.wMul || 0))}/h`),
      cell('total="base"', `<b>${money(totOf((L.M || 0) * (L.wMul || 0)))}</b>`)));

    rows.push(tpl.row('Subject',
      ed ? `<span class="custom-select-wrapper">
             <span class="inline-select pick l-subject-display" data-lesson="${i}">Choose ⌄</span>
             <span class="custom-dropdown hidden l-subject-dropdown" data-lesson="${i}"></span>
           </span>`
         : esc((L.subjects || []).join(', ') || '—'),
      rateCell('subject', subjectAdd), totCell('subject', subjectAdd), ed ? '' : free(subjectAdd)));

    rows.push(tpl.row('Level', ed ? ctl('l-level') : esc(L.level || '—'),
      rateCell('level', L.L), totCell('level', L.L), ed ? '' : free(L.L)));

    rows.push(tpl.row('Venue',
      ed ? ctl('l-location') : esc((L.loc || 'Online') + (L.V ? '' : ' (hosted)')),
      rateCell('venue', L.V), totCell('venue', L.V, true), ed ? '' : free(L.V)));

    if (ed) rows.push(tpl.row('Host',
      `<label class="host-toggle"><input type="checkbox" class="l-host" data-lesson="${i}"> I'll host the venue</label>`, '', ''));

    rows.push(tpl.row('Students',
      ed ? ctl('l-qty', ` <span class="l-qty-label" data-lesson="${i}">student</span>`)
         : esc(o.studentsLabel || String(L.n || 1)),
      rateCell('students', L.addChildren), totCell('students', L.addChildren), ed ? '' : free(L.addChildren)));

    rows.push(tpl.row('Tutor', ed ? ctl('l-tutor') : esc(L.tutor || 'Any'), '—', '—', 'fl-free'));
    rows.push(tpl.row('Term',
      ed ? ctl('l-interval')
         : esc(L.interval || (L.slotsKnown ? `${L.W} session${L.W === 1 ? '' : 's'}` : '—')),
      '—', '—', 'fl-free'));
    if (ed) rows.push(tpl.row('Split with', ctl('l-split', ' others'), '—', '—', 'fl-free'));

    // The window, then every date inside it. Start is the sheet's start_date, or TODAY when that
    // date has already passed — picking the current interval mid-term can only start now. End is
    // the interval's last Sunday. Sessions are the chosen weekday between the two, which is why
    // the count here and the count in the price can never drift apart: they're the same array.
    const dateList = (L.sessionDates || []).map(d => fmtDate(d));
    // Anything arriving from the sheet goes through fmtDate too. A stored date can reach here
    // as a Date, an ISO string or a long GMT string depending on how it was written, and the
    // display must not depend on which.
    const datesText = dateList.length
      ? dateList.join(', ')
      : String(o.datesText || '').split(',').map(x => fmtDate(x.trim())).filter(Boolean).join(', ');
    rows.push(tpl.row('Starts',
      cell('starts', esc(dateList[0] || fmtDate(L.startDate) || '—')), '', '', 'fl-free'));
    rows.push(tpl.row('Ends',
      cell('ends', esc(fmtDate(L.lastSun) || fmtDate(L.endDate) || '—')), '', '', 'fl-free'));
    rows.push(tpl.row('Dates',
      cell('dates', datesText ? `<span class="fl-dates">${esc(datesText)}</span>` : '—'),
      '',
      cell('total="dates"', dateList.length ? esc(dateList.length + ' dates') : '—'), 'fl-free'));

    // Day and time are the tick grid in BOTH modes — a class card shows the same widget the
    // booking asked with, ticked and locked, so the two never look like different questions.
    rows.push(ed
      ? `<div class="l-slots" data-lesson="${i}"></div>`
      : tpl.slotGridStatic(L.day, L.time, L.h));

    rows.push(tpl.row('Per hour', '',
      cell('rate="perhour"', `<b>${money(L.chargePerHour)}/h</b>`), '', 'fl-rule'));
    rows.push(tpl.row('Length',
      cell('lengthtext', esc(`${L.h || 0} hr × ${L.slots || 0} session${(L.slots || 0) > 1 ? 's' : ''}`)),
      '', cell('total="length"', esc((L.hoursTotal || 0) + ' hrs')), 'fl-free'));
    rows.push(tpl.row('Total', '', '',
      cell('total="total"', `<b>${money(L.total)}</b>`), 'fl-rule'));

    // Where the money goes. Role-gated, but decided HERE rather than by each card, so the
    // booking form and the class it becomes can never show a different set of rows.
    if (isTutorRole()) rows.push(tpl.row('You earn', '', '',
      cell('total="tutorpay"', `<b>${money(L.tutorPay)}</b>`), 'fl-free'));
    if (isAdmin()) {
      rows.push(tpl.row('Venue cost', '', '',
        cell('total="venuetotal"', `<b>${money(L.venueTotal)}</b>`), 'fl-free'));
      rows.push(tpl.row('Your profit', '', '',
        cell('total="profit"', `<b>${money(L.profitTotal)}</b>`)));
      if (L.belowMinWage) rows.push(tpl.row('⚠ tutor below min wage', '',
        money(L.tutorHourly) + '/h', '', 'fl-warn'));
    }
    return rows.join('');
  },

  // A READ-ONLY version of the booking slot grid, so a booked class shows its hours the same
  // way the builder asks for them. Same table markup and classes as renderSlots(), so the two
  // are visually identical — only the disabled state and the pre-ticked cells differ.
  slotGridStatic: (day, time, hours) => {
    // Always renders, even with no day set — an empty grid still says "this is where the time
    // goes", where a "not set yet" sentence made the card look like a different component.
    const g = DATA.availGrid || { days: [['m','Mon'],['tu','Tue'],['w','Wed'],['th','Thu'],['f','Fri'],['sa','Sat'],['su','Sun']], hours: [9,10,11,12,13,14,15,16,17,18,19] };
    const prefix = dayPrefix(day);
    const start = parseInt(String(time || '').match(/(\d{1,2}):/)?.[1]);
    const span = Math.max(1, parseInt(hours) || 2);
    const booked = (p, h) => prefix && p === prefix && !isNaN(start) && h >= start && h < start + span;
    const head = `<tr><th></th>${g.hours.map(h => `<th>${h}</th>`).join('')}</tr>`;
    const rows = g.days.map(([p, label]) => {
      const cells = g.hours.map(h =>
        `<td><input type="checkbox" class="slot-cb" disabled ${booked(p, h) ? 'checked' : ''}></td>`).join('');
      return `<tr><th class="slot-day">${esc(label)}</th>${cells}</tr>`;
    }).join('');
    return `<div class="slot-grid-wrap slot-grid-static"><table class="slot-grid">${head}${rows}</table></div>`;
  },

  // One card per category, listing all links in that category as rows
  linkGroupCard: (category, links) => `<div class="card link-group">
    <h3 class="gold">${esc(category)}</h3>
    <ul class="link-list">
      ${links.map(l => `<li>
        <a href="${esc(l.url)}" target="_blank" rel="noopener" class="link-row">
          ${esc(l.title)}<span class="link-arrow">↗</span>
        </a>
        ${l.description ? `<p class="desc link-desc">${esc(l.description)}</p>` : ''}
      </li>`).join('')}
    </ul>
  </div>`,

  // The filename is the caption. Only the file extension is removed — everything else,
  // including brackets, dates and tokens, is ordinary text.
  cleanCaption: text => String(text || '').replace(/\.[^/.]+$/, '').trim(),

  socialPost: post => {
    const caption = tpl.cleanCaption(post.rawName);
    const tagRow = tpl.tagRow([post.label ? `${post.label}` : '']);
    return `<div class="card social-post">
      <div class="social-header">
        <div class="social-avatar">🔵</div>
        <span class="social-username">@family.</span>
        <span class="text-action social-share-btn" data-share-url="https://drive.google.com/file/d/${post.id}/view">Share</span>
      </div>
      <img class="social-img" src="https://drive.google.com/thumbnail?id=${post.id}&sz=w800" alt="Gallery Post" loading="lazy" onerror="this.closest('.social-post')?.remove()">
      <div class="social-body">
        ${caption ? `<p class="desc" style="margin:0 0 8px">${escTokens(caption)}</p>` : ''}
        ${tagRow}
      </div>
    </div>`;
  },

  // Access card: login form when logged out, personal dashboard when logged in.
  // Lives in the Classes & Booking grid so access sits with booking.
  // Login form card (shown in People when logged out)
  loginCard: () => `<div class="card" id="login-card">
      <h3 class="gold mb-md">Login</h3>
      <div class="checkout stack">
        <input type="text" id="auth-email" placeholder="Full Name">
        <input type="password" id="auth-pin" placeholder="PIN">
        <span class="text-action" id="auth-btn">Enter</span>
      </div>
      <p id="auth-msg" class="err mt-sm"></p>
    </div>`,

  // A logged-in parent/kid's own account card in People (their details + logout).
  // Kids also get their level/high score here since they take part in topics/arcade.
  accountCard: () => {
    const roleLabel = { parent: 'Parent', kid: 'Student' }[USER.role] || 'Member';
    const st = statsOf(USER);
    const kidStats = USER.role === 'kid'
      ? tpl.tagRow([`Lv ${st.level}`, `${st.xp} XP`, `🪙 ${st.credits} credits`, `🎮 ${USER.highscore || 0}`]) : '';
    return `<div class="card own-profile" id="account-card" class="t-left">
      <h3 class="gold mb-xs">${esc(USER.name)}</h3>
      <p class="sub">${roleLabel}${USER.handle ? ' · ' + esc(USER.handle) : ''}</p>
      ${kidStats}
      <p class="muted note">${
        USER.role === 'kid'
          ? 'Your checklist, friends and classes are in their sections below.'
          : 'Your children and classes are shown below.'
      }</p>
      <div class="card-actions">
        <span class="text-action edit-profile-btn" title="Edit your details">Edit</span>
        <span class="text-action" id="logout-btn">Log out</span>
      </div>
    </div>`;
  },

  // The booking card is a job card that hasn't been agreed yet, so it's built to the same
  // width and the same skeleton: title → priced rows → message → footer actions. It used to be
  // data-span="3" with a separate summary column; that width alone made it read as a different
  // kind of thing from the classes beside it, and the summary pane was the last of the old
  // breakdown. Both are gone — the total now sits in the footer where a job card puts its
  // actions, and the per-line costs live in the rows, same as everywhere else.
  builderCard: () => `<div class="card" id="new-job" data-span="2">
    <input type="hidden" id="c-service" value="Tuition">
    <h3>Build a session</h3>
    <div id="lessons"></div>
    <span class="text-action" id="add-lesson-btn">＋ Add another lesson</span>
    <div class="job-foot">
      <div class="field-line fl-rule hidden" id="order-total-row"><span class="fl-k">Order total</span><span class="fl-v"></span><span class="fl-p"><b>£<span id="total">0.00</span></b></span></div>
      <p id="home-note" class="muted hidden note">At-home lessons require a group of 4 students.</p>
      <div id="checkout-area" class="checkout"></div>
    </div>
  </div>`,

  // A lesson block IS a job card whose values haven't been chosen yet. Same rows, same price
  // column, same message box — because the next thing that happens to it (the tutor editing it
  // and sending it back) uses the identical component. That symmetry is why the message box is
  // here from the very first request: a counter-offer is just this card, edited, with a note.
  lessonBlock: (i) => `<div class="lesson-block" data-lesson="${i}">
    <div class="lesson-head">
      <span class="lesson-title">Lesson ${i + 1}</span>
      ${i > 0 ? `<span class="text-action remove-lesson-btn" data-lesson="${i}">Remove</span>` : ''}
    </div>
    <div class="job-detail">${tpl.priceRows(null, {
      editable: true, lesson: i,
      status: badge('Unsent'),
      possession: badge('Yours'),
      lifecycle: badge('Uncreated')
    })}</div>
    <div class="move-send-row">
      <input type="text" class="move-text l-message" data-lesson="${i}" placeholder="Add a message for the tutor (optional)…">
    </div>
  </div>`,
};

/* ---------- RENDER ---------- */
// Fetch the admin people directory once, then re-render the People section with it.
function loadPeopleDirectory() {
  if (!isAdmin() || DATA._peopleLoading) return;
  DATA._peopleLoading = true;
  fetch(API, { method: 'POST', body: JSON.stringify({ action: 'listPeople', adminName: USER.name }) })
    .then(r => r.json())
    .then(d => {
      DATA._people = d.people || [];
      DATA._peopleLoading = false;
      renderCards('tutors', DATA.tutors);
    })
    .catch(() => { DATA._people = []; DATA._peopleLoading = false; });
}

// Persistent header auth: shows who's logged in (logout lives on their profile card).
function renderHeaderAuth() {
  const el = $('header-auth');
  if (!el) return;
  el.innerHTML = USER
    ? `<span class="muted" style="font-size:var(--fs-sm)">${esc(USER.name)}</span>`
    : '';
}

function renderCards(id, items = []) {
  // Two sheet rows for one person shouldn't become two cards. Deduped by name here rather than
  // hidden in the backend, because a duplicate ROW is a data problem worth noticing — it's
  // reported to the console so it can be fixed at source.
  if (id === 'tutors' || id === 'venues') {
    const k = x => String(x || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const seen = new Set(), dupes = [];
    items = (items || []).filter(x => {
      const key = k(x.title);
      if (!key) return true;                       // unnamed rows are their own problem
      if (seen.has(key)) { dupes.push(x.title); return false; }
      seen.add(key);
      return true;
    });
    if (dupes.length) console.warn('@family. duplicate rows in the sheet for:', dupes,
      '— same person twice in the database, showing one card each');
  }
  let cardsHtml = items.length ? items.map(tpl.card).join('') : '<p class="muted">Nothing yet.</p>';

  // Admin sees everyone, with each person's role spelled out. Loaded on demand rather than
  // shipped in every payload — it carries contact details, so it's an authorised request.
  // Admin sees everyone. Tutors and admins already have cards above, so this adds the people
  // who normally have none — clients and students — as ordinary cards in the same grid. No
  // separate list: the same card, just more of them, which is the whole difference the role makes.
  if (id === 'tutors' && isAdmin()) {
    if (!DATA._people) loadPeopleDirectory();
    // Compare names with spaces and punctuation stripped. `tutors` builds "George Povey" from
    // first_name + last_name, while the directory reads full_name, which in this sheet is often
    // "GeorgePovey" — so a plain lowercase compare treated them as two different people and
    // every tutor appeared twice.
    const key = x => String(x || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const shown = new Set((DATA.tutors || []).map(t => key(t.title)));
    const extra = (DATA._people || [])
      .filter(p => {
        const k = key(p.name);
        if (!k || shown.has(k)) return false;
        shown.add(k);        // also guards against duplicates WITHIN the directory itself
        return true;
      })
      .map((p, n) => ({
        id: 'p' + n, type: 'person', role: p.role,
        title: p.name,
        subtitle: [p.role, p.city].filter(Boolean).join(' · '),
        image: p.photo,
        tags: p.tags || [],
        description: p.description,
        // Flagged on the card because a blank address means every notification to this person
        // is silently dropped, and that stays invisible until someone says they weren't told.
        warn: p.contactable ? '' : 'No email — receives no notifications',
        contact: [p.email, p.phone].filter(Boolean).join(' · ')
      }));
    cardsHtml += extra.map(tpl.card).join('');
  }

  // People section: the login card (logged out) or the person's own account card (logged in).
  if (id === 'tutors') {
    if (!USER) {
      // Not logged in → login card leads the People grid
      cardsHtml = tpl.loginCard() + cardsHtml;
    } else if (!isTutorRole()) {
      // Parent/kid have no profile card, so give them their own editable account card here
      cardsHtml = tpl.accountCard() + cardsHtml;
    }
    // Tutor: their timetable renders inside their own card (see tpl.card)
  }

  // In the People section, a logged-in kid also sees a friend search + their friend cards
  if (id === 'tutors' && USER && USER.role === 'kid') {
    const norm = s => String(s || '').toLowerCase().trim();
    const handles = friendHandles().map(norm);
    const friends = (DATA.students || []).filter(s => handles.includes(norm(s.handle)));
    const friendCards = friends.map(tpl.friendCard).join('');
    cardsHtml += `<div class="card friend-search-card t-left">
        <h3 class="gold mb-sm">Add a Friend</h3>
        <input id="friend-search" class="edit-input" placeholder="Exact name e.g. LuccaD" class="mb-sm">
        <span class="text-action" id="add-friend-btn">Add friend</span>
        <p id="friend-msg" class="muted note status-line"></p>
      </div>` + friendCards;
  }
  // A logged-in parent sees their children's profile cards
  if (id === 'tutors' && USER && USER.role === 'parent') {
    const norm = s => String(s || '').toLowerCase().trim();
    const kidNames = (USER.kids || []).map(norm);
    const myKids = (DATA.students || []).filter(s => kidNames.includes(norm(s.name)) || kidNames.includes(norm(s.handle)));
    cardsHtml += myKids.map(s => tpl.friendCard(s, true)).join('');
  }

  html(id, cardsHtml);
}

function renderClasses(items = DATA.clientClasses || []) {
  const norm = s => String(s || '').toLowerCase().trim();
  const iAmIn = j => USER && (j.slots || []).some(s => norm(s.client) === norm(USER.name));
  const iAmTutor = j => USER && isTutorRole() && norm(j.requestedTutor) === norm(USER.name);
  // Visible if it has open spots, OR it's the user's own class, OR the user is its tutor (so a
  // full job still shows to the people already in it and to the tutor running it).
  const visible = items.filter(j => (j.spotsLeft > 0 && !j.isFull) || iAmIn(j) || iAmTutor(j));
  // The user's own classes float to the top
  const rank = j => classState(j) ? 1 : 0;
  const sorted = [...visible].sort((a, b) => rank(b) - rank(a));
  const cards = sorted.map(j => tpl.jobCard(j, false, classState(j))).join('');
  html('classes', tpl.builderCard() + cards);
  fillDropdowns();
  initIntervals();
  renderCheckout();
  enforceHomeRule();
}

// Relationship of a job to the logged-in user:
//   'confirmed' → their class (blue)   'pending' → potential/awaiting tutor accept (grey)   '' → not theirs
function classState(j) {
  if (!USER) return '';
  const norm = s => String(s || '').toLowerCase().trim();
  const status = jobStatus(j);
  const confirmed = status === 'Active';
  if (isTutorRole()) {
    if (norm(j.requestedTutor) !== norm(USER.name)) return '';
    return confirmed ? 'confirmed' : 'pending';
  }
  // Parent/kid: am I in any slot of this class?
  const mySlot = (j.slots || []).find(s => norm(s.client) === norm(USER.name));
  if (!mySlot) return '';
  return confirmed ? 'confirmed' : 'pending';
}

// Back-compat boolean (used by onLogin filter)
function isMyClass(j) { return classState(j) !== ''; }

// Column health-check banner: warns if the sheet is missing columns the code needs.
function renderHealth() {
  const el = $('health-banner');
  if (!el) return;
  const h = DATA.health;
  if (!h || h.ok) { el.classList.add('hidden'); return; }
  const lines = h.missing.map(m =>
    `<b>${esc(m.group)}</b>: ${m.columns.map(c => `<code>${esc(c)}</code>`).join(', ')}`
  ).join('<br>');
  el.innerHTML = `⚠ <b>Sheet health warning</b> — the code expects columns that aren't in the sheet ` +
    `(likely a rename or deletion). Affected features may not work until these are restored:<br>${lines}`;
  el.classList.remove('hidden');
}

// After a successful login: re-render sections; the login card in People becomes the user's own card
function onLogin() {
  renderHeaderAuth();                   // persistent top-right Log Out
  renderCards('tutors', DATA.tutors);  // People: login card → own account card / tutor edit
  renderChecklist();                   // Checklist section
  renderArcade();                      // Arcade game
  renderClasses();                     // Classes & Booking (user's classes highlight blue)
  renderCheckout();
  $('tutors').closest('section').scrollIntoView({ behavior: 'smooth' });
}

// Tools section: a calculator card + the maths checklist (grade cards).
// Grade cards can be filtered by subject/tier/grade via the database-driven filter bar.
// Build the flat list of checklist band-items (one per subject+band) for the shared filter system.
// Each item also carries the distinct values of the per-topic fields, so the shared filter
// can match a band if ANY of its topics has the chosen company / tier / keystage / stage.
// Flatten every tool item into one list (each carries its subject + all its fields).
function allToolItems() {
  const checklists = DATA.dropdowns?.checklists || {};
  const out = [];
  Object.keys(checklists).forEach(subject => {
    const bands = checklists[subject];
    Object.values(bands).forEach(entry => {
      (entry.topics || []).forEach(t => out.push({ ...t, subject, _bandField: entry.bandField || '' }));
    });
  });
  return out;
}

// Attributes a card title may mention, in the order they read best.
const TITLE_DIMS = ['subject', 'band', 'resourceType', 'printout', 'keystage', 'examBoard', 'company', 'tier'];

// The distinct values one card holds for a given attribute.
function cardValues(item, dim) {
  if (dim === 'subject')      return item.subject ? [String(item.subject)] : [];
  if (dim === 'band')         return item.bandLabel ? [String(item.bandLabel)] : [];
  if (dim === 'resourceType') return item.resourceTypes || [];
  if (dim === 'keystage')     return item.keystages || [];
  if (dim === 'examBoard')    return item.examBoards || [];
  if (dim === 'company')      return item.companies || [];
  if (dim === 'tier')         return item.tiers || [];
  if (dim === 'printout')     return item.printouts || [];
  return [];
}

// A card's title should say exactly what tells it apart from the cards beside it — no more,
// no less. An attribute earns its place only if BOTH hold:
//   1. it's the same for every topic in this card  → it's genuinely a property of the card
//   2. it separates two cards that the title SO FAR still leaves looking identical
// Rule 2 does all the work. An attribute that's identical everywhere (exam board, when
// every card is Edexcel) separates nothing, so it's dropped. So is an attribute that merely
// restates one already shown: once "Grade 5" is in the title, "KS3" splits no cards that
// grade hasn't already split, so it's redundant and goes too.
// This is also why titles respond to filtering without ever looking at the filters: pinning
// the exam board makes it constant, so it stops separating anything and drops out by itself.
function cardTitle(item, siblings) {
  const sibs = (siblings && siblings.length) ? siblings : [item];
  const cap = s => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
  // One card's value for a set of attributes, as a comparable key.
  const sig = (card, dims) => dims.map(d => {
    const v = cardValues(card, d);
    return v.length === 1 ? String(v[0]).toLowerCase() : '\u0000mixed';
  }).join('|');

  const chosen = [];
  // The "Group by" control doesn't regroup any more (grouping is fixed to "everything") — it
  // just promotes one attribute to the FRONT of the title, so the person can lead with what
  // they care about. It's added first if this card has a single value for it.
  const force = item._force;
  if (force && force !== 'auto' && cardValues(item, force).length === 1) chosen.push(force);

  for (const dim of TITLE_DIMS) {
    if (chosen.includes(dim)) continue;
    if (cardValues(item, dim).length !== 1) continue;   // mixed inside this card
    // Does this attribute split any group of cards the title can't tell apart yet?
    const seen = new Map();
    let separates = false;
    for (const s of sibs) {
      const key = sig(s, chosen), val = sig(s, [dim]);
      if (!seen.has(key)) seen.set(key, val);
      else if (seen.get(key) !== val) { separates = true; break; }
    }
    if (separates) chosen.push(dim);
  }

  const parts = chosen.map(d => cap(cardValues(item, d)[0]));
  // If filtering narrows things so far that nothing distinguishes, the card still needs a name.
  return parts.join(' · ')
      || [item.subject, item.bandLabel].filter(Boolean).join(' · ')
      || 'Topics';
}

// The attributes that define a card. Two topics share a card only if they match on ALL of
// these — so every card is uniform in every attribute, and any difference splits it into its
// own card. This is the whole grouping rule: no priority list, no "which dimension wins".
// Order here is just the order they read in the title.
const CARD_DIMS = ['subject', 'band', 'resourceType', 'printout', 'keystage', 'examBoard', 'tier', 'company'];

// One topic's value for a dimension, as a plain string (band = grade or stage, whichever it has).
function dimValue(it, dim) {
  if (dim === 'band')     return String(it.grade || it.stage || '');
  if (dim === 'subject')  return String(it.subject || '');
  return String(it[dim] || '');
}

// Build the checklist cards. Grouping is fixed (group by everything); `forceDim` is kept for
// the manual override, which now just promotes one dimension to the front of the title.
function checklistItems(forceDim) {
  const distinctOf = (topics, key) => [...new Set(topics.map(t => String(t[key]||'').trim()).filter(Boolean).map(s=>s.toLowerCase()))];
  const all = allToolItems();
  if (!all.length) return [];

  // A card = a set of topics identical across every CARD_DIM. The composite key is just all
  // those values joined, so any single difference lands the topics in different cards.
  const groups = {};
  all.forEach(it => {
    const key = CARD_DIMS.map(d => dimValue(it, d)).join('|~|');
    if (!groups[key]) groups[key] = { sample: it, topics: [] };
    groups[key].topics.push(it);
  });

  const cap = s => String(s||'').charAt(0).toUpperCase() + String(s||'').slice(1);
  const items = Object.values(groups).map(g => {
    const t = g.sample;
    const bandVal = t.grade || t.stage || '';
    const bandLabel = bandVal
      ? `${cap(t._bandField || (t.grade ? 'grade' : 'stage'))} ${bandVal}`.trim()
      : (t.trackable ? '' : 'Reference');
    return {
      subject: t.subject || 'Other',
      band: bandVal || (t.trackable ? '' : 'Reference'),
      bandLabel,
      topics: g.topics,
      // Each card is uniform, so these sets have exactly one value (or none) — but the title
      // rule and filters read them the same way as before.
      companies: distinctOf(g.topics, 'company'),
      tiers:     distinctOf(g.topics, 'tier'),
      keystages: distinctOf(g.topics, 'keystage'),
      stages:    distinctOf(g.topics, 'stage'),
      grades:    distinctOf(g.topics, 'grade'),
      examBoards:distinctOf(g.topics, 'examBoard'),
      resourceTypes: distinctOf(g.topics, 'resourceType'),
      printouts: distinctOf(g.topics, 'printout'),
      hasPaper:  g.topics.some(x => x.paper),
      _force: (forceDim && forceDim !== 'auto') ? forceDim : ''
    };
  });
  items.sort((a, b) => {
    if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
    const na = parseFloat(a.band), nb = parseFloat(b.band);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return String(a.band).localeCompare(String(b.band));
  });
  return items;
}
// All distinct values of a per-topic field across every topic (for filter dropdown options)
function allTopicFieldValues(key) {
  const checklists = DATA.dropdowns?.checklists || {};
  const vals = new Set();
  Object.values(checklists).forEach(bands => Object.values(bands).forEach(entry =>
    (entry.topics || []).forEach(t => { const x = String(t[key]||'').trim(); if (x) vals.add(x); })));
  return [...vals];
}

// Tools section: calculator card is fixed; the checklist band cards go through the shared filter.
function renderChecklist() {
  const el = $('checklist-content');
  if (!el) return;
  renderFilterBar('tool');   // shared filter bar (search + subject/level dropdowns)
  applyFilter('tool');       // shared filter renders the band cards into #checklist-content
}

// The Tools section: calculator, timer, notepad, and a month calendar. (These will become
// database-driven items later; for now they're the built-in tool cards.)
function renderTools(query) {
  const el = $('tools-content');
  if (!el) return;
  // Simple search box for the section (filters the tool cards by name).
  const bar = $('tools-filters');
  if (bar && !bar.dataset.wired) {
    bar.innerHTML = `<input class="filter" id="tools-search" placeholder="Search tools…">`;
    bar.dataset.wired = '1';
    $('tools-search').addEventListener('input', e => renderTools(e.target.value));
  }
  const q = String(query || (($('tools-search')||{}).value) || '').toLowerCase().trim();
  const tools = [
    { name: 'calculator', html: tpl.calcToolCard() },
    { name: 'timer',      html: tpl.timerCard() },
    { name: 'notepad',    html: tpl.notepadCard() },
    { name: 'calendar',   html: tpl.calendarCard() },
  ].filter(t => !q || t.name.includes(q));
  html('tools-content', tools.map(t => t.html).join('') || '<p class="muted">No tools match.</p>');
  initMiniCalc();
  initTimer();
  initCalendar();
}

// A simple month calendar card — today highlighted, prev/next month navigation.
let CAL_VIEW = null;
function initCalendar() {
  const host = $('cal-body');
  if (!host) return;
  const now = new Date();
  CAL_VIEW = CAL_VIEW || { y: now.getFullYear(), m: now.getMonth() };
  drawCalendar();
}
function drawCalendar() {
  const host = $('cal-body'); if (!host) return;
  const { y, m } = CAL_VIEW;
  const today = new Date(); today.setHours(0,0,0,0);
  const first = new Date(y, m, 1);
  const startDay = (first.getDay() + 6) % 7;   // Monday-first
  const days = new Date(y, m + 1, 0).getDate();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const label = $('cal-label'); if (label) label.textContent = `${months[m]} ${y}`;
  const cells = [];
  ['M','T','W','T','F','S','S'].forEach(d => cells.push(`<span class="cal-h">${d}</span>`));
  for (let i = 0; i < startDay; i++) cells.push('<span></span>');
  for (let d = 1; d <= days; d++) {
    const date = new Date(y, m, d);
    const isToday = date.getTime() === today.getTime();
    cells.push(`<span class="cal-d${isToday ? ' cal-today' : ''}">${d}</span>`);
  }
  host.innerHTML = cells.join('');
}
function calShift(delta) {
  if (!CAL_VIEW) return;
  let m = CAL_VIEW.m + delta, y = CAL_VIEW.y;
  if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
  CAL_VIEW = { y, m };
  drawCalendar();
}

// Compact calculator logic (degrees; uses math.js if present, else Function eval fallback)
function initMiniCalc() {
  const disp = $('mc-display');
  if (!disp) return;
  let expr = '';
  const render = () => disp.value = expr || '0';
  window._mcClick = (v) => {
    if (v === '=') {
      try {
        let s = expr.replace(/π/g,'pi');
        // degree trig
        s = s.replace(/\b(sin|cos|tan)\(/g, '$1(DEG*');
        let result;
        if (window.math) {
          result = window.math.evaluate(s, { pi: Math.PI, DEG: Math.PI/180 });
        } else {
          s = s.replace(/pi/g, Math.PI).replace(/DEG/g, Math.PI/180)
               .replace(/sqrt/g,'Math.sqrt').replace(/sin/g,'Math.sin').replace(/cos/g,'Math.cos').replace(/tan/g,'Math.tan').replace(/\^/g,'**');
          result = Function('"use strict";return (' + s + ')')();
        }
        expr = String(Math.round(result * 1e10) / 1e10);
      } catch { expr = 'Error'; }
    } else if (v === 'del') {
      expr = (expr === 'Error') ? '' : expr.slice(0, -1);
    } else {
      if (expr === 'Error' || expr === '0') expr = '';
      expr += v;
    }
    render();
  };
  render();
}

// Progression. XP = number of topics ticked (stored in the sheet's `xp` column).
// Level is DERIVED from XP: every 10 XP = 1 level (so each tick is +0.1 of a level).
// Credits are a spendable currency (stored in `credits`) — 1 earned per tick, spent in the Shop.
const XP_PER_LEVEL = 10;
function levelFromXp(xp) {
  return +( (Number(xp) || 0) / XP_PER_LEVEL ).toFixed(1);   // e.g. 23 xp → level 2.3
}
// Stats for a person object coming from the backend (or the logged-in USER)
function statsOf(p) {
  const xp = Number(p?.xp) || 0;
  return { xp, level: levelFromXp(xp), credits: Number(p?.credits) || 0 };
}

// --- Times Tables Sprint: 60s, random questions up to 12×12 ---
let ttState = null;
function startTimesTables() {
  const q = () => ({ a: 1 + Math.floor(Math.random()*12), b: 1 + Math.floor(Math.random()*12) });
  ttState = { score: 0, left: 60, cur: q(), timer: null };
  $('tt-idle')?.classList.add('hidden');
  $('tt-over')?.classList.add('hidden');
  $('tt-play')?.classList.remove('hidden');
  $('tt-score').textContent = '0';
  $('tt-time').textContent = '60';
  $('tt-question').textContent = `${ttState.cur.a} × ${ttState.cur.b}`;
  const input = $('tt-answer');
  input.value = ''; input.focus();

  ttState.timer = setInterval(() => {
    ttState.left--;
    $('tt-time').textContent = ttState.left;
    if (ttState.left <= 0) endTimesTables();
  }, 1000);

  input.oninput = () => {
    const val = parseInt(input.value);
    if (isNaN(val)) return;
    if (val === ttState.cur.a * ttState.cur.b) {
      ttState.score++;
      $('tt-score').textContent = ttState.score;
      $('tt-feedback').textContent = '✓';
      ttState.cur = q();
      $('tt-question').textContent = `${ttState.cur.a} × ${ttState.cur.b}`;
      input.value = '';
    }
  };
}
function endTimesTables() {
  if (!ttState) return;
  clearInterval(ttState.timer);
  const score = ttState.score;
  $('tt-play')?.classList.add('hidden');
  $('tt-over')?.classList.remove('hidden');
  $('tt-final').textContent = score;
  // Save a new personal best
  if (canTrack() && score > (USER.ttHighscore || 0)) {
    USER.ttHighscore = score;
    try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
    $('tt-best-msg').textContent = '🎉 New personal best!';
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'saveTtHighscore', name: USER.name, score }) }).catch(()=>{});
  } else if (canTrack()) {
    $('tt-best-msg').textContent = `Best: ${USER.ttHighscore || 0}`;
  }
  ttState = null;
}

// --- Countdown timer with alarm ---
let timerState = { total: 25*60, left: 25*60, running: false, tick: null };
function initTimer() {
  timerState.running = false;
  clearInterval(timerState.tick);
  paintTimer();
}
function paintTimer() {
  const el = $('timer-display');
  if (!el) return;
  const m = Math.floor(timerState.left / 60), s = timerState.left % 60;
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const btn = $('timer-toggle');
  if (btn) btn.innerHTML = timerState.running ? '&#9208;' : '&#9654;';
}
function toggleTimer() {
  if (timerState.running) {
    clearInterval(timerState.tick);
    timerState.running = false;
  } else {
    if (timerState.left <= 0) timerState.left = timerState.total;
    timerState.running = true;
    timerState.tick = setInterval(() => {
      timerState.left--;
      if (timerState.left <= 0) {
        clearInterval(timerState.tick);
        timerState.running = false;
        timerState.left = 0;
        if ($('timer-msg')) $('timer-msg').textContent = '⏰ Time\'s up!';
        beep();
      }
      paintTimer();
    }, 1000);
    if ($('timer-msg')) $('timer-msg').textContent = '';
  }
  paintTimer();
}
// Short alarm tone via the Web Audio API (no sound file needed)
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach(delay => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);
      osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.2);
    });
  } catch {}
}

// Arcade section: the game card (high scores show on student/friend cards)
function renderArcade(query) {
  const el = $('arcade-content');
  if (!el) return;
  // Same search pattern the Tools section uses: a plain box that filters the cards by name.
  const bar = $('arcade-filters');
  if (bar && !bar.dataset.wired) {
    bar.innerHTML = `<input class="filter" id="arcade-search" placeholder="Search arcade…">`;
    bar.dataset.wired = '1';
    $('arcade-search').addEventListener('input', e => renderArcade(e.target.value));
  }
  const q = String(query || (($('arcade-search') || {}).value) || '').toLowerCase().trim();
  const games = [
    { name: 'flabby pird flappy bird', html: tpl.gameCard() },
    { name: 'times tables sprint multiplication', html: tpl.timesTableCard() },
  ].filter(g => !q || g.name.includes(q));
  html('arcade-content', games.map(g => g.html).join('') || '<p class="muted">No games match.</p>');
  initFlappy();  // wire up the canvas game (no-op when filtered out)
}

// --- Flabby Pird: simple one-button canvas game ---
let flappyState = null;
function initFlappy() {
  const canvas = $('flappy-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const GOLD = '#d4af37', BLUE = '#4f9eff', GREEN = '#3cb043';

  // reset any previous loop
  if (flappyState?.raf) cancelAnimationFrame(flappyState.raf);
  const S = flappyState = {
    bird: { x: 60, y: H/2, vy: 0, r: 9 },
    pipes: [], score: 0, running: false, dead: false, raf: null, frame: 0
  };
  const GRAV = 0.45, FLAP = -7, GAP = 110, PIPE_W = 42, SPEED = 2;

  const reset = () => {
    S.bird.y = H/2; S.bird.vy = 0; S.pipes = []; S.score = 0; S.frame = 0; S.dead = false;
    $('flappy-score').textContent = '0';
  };
  const spawnPipe = () => {
    const top = 40 + Math.random() * (H - GAP - 110);
    S.pipes.push({ x: W, top, scored: false });
  };
  const flap = () => {
    if (S.dead) { reset(); S.running = true; $('flappy-msg').textContent = ''; loop(); return; }
    if (!S.running) { S.running = true; $('flappy-msg').textContent = ''; loop(); }
    S.bird.vy = FLAP;
  };
  const gameOver = () => {
    S.dead = true; S.running = false;
    $('flappy-msg').textContent = `Game over — score ${S.score}. Click to retry.`;
    // Save score if a logged-in kid or tutor
    if (canTrack()) {
      const prev = USER.highscore || 0;
      if (S.score > prev) {
        USER.highscore = S.score;
        if ($('flappy-best')) $('flappy-best').textContent = S.score;
        fetch(API, { method:'POST', body: JSON.stringify({ action:'saveScore', name: USER.name, score: S.score }) })
          .then(() => {
            const norm = s => String(s||'').toLowerCase().trim();
            const meS = (DATA.students||[]).find(s => norm(s.handle) === norm(USER.handle)); if (meS) meS.highscore = S.score;
            const meT = (DATA.tutors||[]).find(x => norm(x.title) === norm(USER.name)); if (meT) meT.highscore = S.score;
            // No re-render mid-game — the "Best" display already updated; cards refresh naturally later
          });
        $('flappy-msg').textContent = `New best: ${S.score}! Click to retry.`;
      }
    }
  };

  const loop = () => {
    if (!S.running) return;
    S.frame++;
    // physics
    S.bird.vy += GRAV; S.bird.y += S.bird.vy;
    if (S.frame % 90 === 0) spawnPipe();
    S.pipes.forEach(p => p.x -= SPEED);
    S.pipes = S.pipes.filter(p => p.x + PIPE_W > 0);
    // collisions + scoring
    for (const p of S.pipes) {
      if (!p.scored && p.x + PIPE_W < S.bird.x) { p.scored = true; S.score++; $('flappy-score').textContent = S.score; }
      const inX = S.bird.x + S.bird.r > p.x && S.bird.x - S.bird.r < p.x + PIPE_W;
      const hitY = S.bird.y - S.bird.r < p.top || S.bird.y + S.bird.r > p.top + GAP;
      if (inX && hitY) return gameOver();
    }
    if (S.bird.y + S.bird.r > H || S.bird.y - S.bird.r < 0) return gameOver();
    // draw
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = GREEN;
    S.pipes.forEach(p => { ctx.fillRect(p.x, 0, PIPE_W, p.top); ctx.fillRect(p.x, p.top+GAP, PIPE_W, H-p.top-GAP); });
    ctx.fillStyle = GOLD;
    ctx.beginPath(); ctx.arc(S.bird.x, S.bird.y, S.bird.r, 0, Math.PI*2); ctx.fill();
    S.raf = requestAnimationFrame(loop);
  };

  // idle draw (bird sitting)
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = GOLD;
  ctx.beginPath(); ctx.arc(S.bird.x, S.bird.y, S.bird.r, 0, Math.PI*2); ctx.fill();

  canvas.onclick = flap;
  // space/arrow to flap (only when arcade canvas exists)
  S.keyHandler = e => { if ((e.code === 'Space' || e.code === 'ArrowUp') && $('flappy-canvas')) { e.preventDefault(); flap(); } };
  document.removeEventListener('keydown', window._flappyKey || (()=>{}));
  window._flappyKey = S.keyHandler;
  document.addEventListener('keydown', window._flappyKey);
}

// Current friend handles as an array (from USER.friends comma string)
function friendHandles() {
  return String(USER?.friends || '').split(',').map(s => s.trim()).filter(Boolean);
}
// Checkout depends on login state: prompt to log in, or show the booking button
function renderCheckout() {
  if (!$('checkout-area')) return;
  $('checkout-area').innerHTML = USER
    ? `<p class="muted note-sm">Booking as <b class="ink-strong">${esc(USER.name)}</b></p>
       <span class="text-action" id="book-btn" class="cta">Lock in &amp; book</span>`
    : `<p class="muted note-sm">Log in to book a session.</p>
       <span class="text-action" id="go-login-btn" class="cta">Log in to book</span>`;
}

function renderLinks(items = DATA.links || []) {
  if (!items.length) { html('links', '<p class="muted">No links found.</p>'); return; }
  // Group by category, preserving first-seen order
  const groups = {};
  items.forEach(l => { const c = l.category || 'General'; (groups[c] = groups[c] || []).push(l); });
  html('links', Object.entries(groups).map(([cat, links]) => tpl.linkGroupCard(cat, links)).join(''));
}

function renderShop(items = DATA.shop || []) {
  if (!items.length) { html('shop', '<p class="muted">No items in the shop yet.</p>'); return; }
  html('shop', items.map(tpl.shopCard).join(''));
}

let GALLERY_POSTS = [];  // parsed posts, kept for filtering

function renderGallery(galleryData = []) {
  if (!galleryData?.length) { html('gallery', '<p class="loader-text">No showcases active.</p>'); return; }

  // "3 days ago" style label from the file's own date (no filename parsing).
  const ageLabel = ts => {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - new Date(ts).setHours(0,0,0,0)) / 86400000);
    return diff <= 0 ? 'Today' : diff === 1 ? 'Yesterday'
      : diff < 7 ? `${diff} days ago` : diff < 30 ? `${Math.floor(diff/7)} weeks ago`
      : diff < 365 ? `${Math.floor(diff/30)} months ago` : `${Math.floor(diff/365)} years ago`;
  };

  GALLERY_POSTS = galleryData
    .map(p => {
      const obj = (typeof p === 'object') ? p : { id: p };
      const ts = obj.date ? new Date(obj.date).getTime() : 0;
      // The filename is just the caption now — no date, no location extracted from it.
      return { ...obj, ts, label: ageLabel(ts), year: ts ? String(new Date(ts).getFullYear()) : '', rawName: obj.name || '' };
    })
    .sort((a, b) => b.ts - a.ts);  // newest first

  renderFilterBar('post');
  applyFilter('post');
}

/* ---------- DROPDOWNS ---------- */
let LESSON_COUNT = 0;   // how many lesson blocks currently exist

function fillDropdowns() {
  const d = DATA.dropdowns || {};
  // Ensure at least one lesson block exists, then populate every block's dropdowns
  const wrap = $('lessons');
  if (wrap && !wrap.children.length) { wrap.innerHTML = tpl.lessonBlock(0); LESSON_COUNT = 1; }
  document.querySelectorAll('.lesson-block').forEach(b => fillLessonBlock(parseInt(b.dataset.lesson)));
}

// Fallback seat cap when a venue hasn't set one. Real limits come per-venue from the sheet.
const MAX_SEATS = 4;

// Look up the selected venue's capacity from the sheet data (falls back to sensible defaults).
function venueCapacity(venueName) {
  const norm = s => String(s || '').toLowerCase().trim();
  const v = (DATA.venues || []).find(x => norm(x.title) === norm(venueName));
  const max = (v && v.maxCapacity) ? v.maxCapacity : MAX_SEATS;
  const min = (v && v.minCapacity) ? v.minCapacity : 1;
  return { max, min: Math.min(min, max) };
}

// Keep the "I'll host" toggle in step with the chosen venue: a home venue means the client is
// always hosting, so it's auto-ticked and disabled (can't untick). Any other venue leaves it
// free to choose.
function syncHostToggle(i) {
  const hostEl = document.querySelector(`.l-host[data-lesson="${i}"]`);
  const locEl = document.querySelector(`.l-location[data-lesson="${i}"]`);
  if (!hostEl || !locEl) return;
  if (isHome(locEl.value)) {
    hostEl.checked = true;
    hostEl.disabled = true;
    hostEl.closest('.host-toggle')?.classList.add('locked');
  } else {
    hostEl.disabled = false;
    hostEl.closest('.host-toggle')?.classList.remove('locked');
  }
}

// Students dropdown — a <select> like every other field. The range comes from the chosen
// VENUE's own max/min capacity in the sheet; a "home" venue still requires its full group.
function syncQtyOptions(i) {
  const qtyEl = document.querySelector(`.l-qty[data-lesson="${i}"]`);
  if (!qtyEl) return;
  const locEl = document.querySelector(`.l-location[data-lesson="${i}"]`);
  const cap = venueCapacity(locEl?.value);
  // Home venues need the whole group, so the minimum jumps to the venue's own minimum (or max).
  const min = (locEl && isHome(locEl.value)) ? Math.max(cap.min, cap.max) : cap.min;
  const prev = parseInt(qtyEl.value) || 1;
  const opts = [];
  for (let n = min; n <= cap.max; n++) opts.push(n);
  if (!opts.length) opts.push(cap.max || 1);
  qtyEl.innerHTML = opts.map(n => `<option value="${n}">${n}</option>`).join('');
  qtyEl.value = opts.includes(prev) ? prev : opts[0];
  const lbl = document.querySelector(`.l-qty-label[data-lesson="${i}"]`);
  if (lbl) lbl.textContent = (parseInt(qtyEl.value) === 1) ? 'student' : 'students';
}

// "split with N other people" — the bill is divided (N+1) ways, so N can never exceed
// (seats - 1): a lesson can't be split more ways than it has students. Options rebuild
// whenever the student count changes, keeping the current choice when it's still valid.
function syncSplitOptions(i) {
  const splitEl = document.querySelector(`.l-split[data-lesson="${i}"]`);
  if (!splitEl) return;
  const qtyEl = document.querySelector(`.l-qty[data-lesson="${i}"]`);
  const n = Math.max(1, parseInt(qtyEl?.value) || 1);
  const prev = parseInt(splitEl.value) || 0;
  const opts = [];
  for (let x = 0; x <= n - 1; x++) opts.push(x);
  splitEl.innerHTML = opts.map(x => `<option value="${x}">${x}</option>`).join('');
  splitEl.value = opts.includes(prev) ? prev : 0;
}

// Populate one lesson block's dropdowns (level, location, day, time, subjects)
// Map a day dropdown value (e.g. "monday" / "Mon") to the availability-grid prefix.
const DAY_PREFIX = { monday:'m', tuesday:'tu', wednesday:'w', thursday:'th', friday:'f', saturday:'sa', sunday:'su' };
function dayPrefix(dayVal) {
  const d = String(dayVal || '').toLowerCase().trim();
  if (DAY_PREFIX[d]) return DAY_PREFIX[d];
  // also accept short forms
  const short = { mon:'m', tue:'tu', wed:'w', thu:'th', fri:'f', sat:'sa', sun:'su' };
  return short[d.slice(0,3)] || '';
}

// The booking time picker. For the chosen tutor + venue + day, show ONLY the hours where the
// tutor is free AND the venue is open (both grids say TRUE). Empty grid = unavailable (strict).
// The client ticks the hours they want; a booking is 2 CONSECUTIVE hours, so ticking one hour
// auto-suggests its neighbour and non-adjacent ticks are rejected.
function renderSlots(i) {
  const wrap = document.querySelector(`.l-slots[data-lesson="${i}"]`);
  if (!wrap) return;
  const norm = s => String(s || '').toLowerCase().trim();
  const on = v => /^(true|yes|1|✓)$/i.test(String(v || '').trim());

  const tutorName = document.querySelector(`.l-tutor[data-lesson="${i}"]`)?.value || '';
  const venueName = document.querySelector(`.l-location[data-lesson="${i}"]`)?.value || '';

  if (!venueName) { wrap.innerHTML = `<p class="slots-hint muted">Pick a venue to see available times.</p>`; layoutGrid(wrap.closest('.grid')); return; }

  const venue = (DATA.venues || []).find(v => norm(v.title) === norm(venueName));
  const vAvail = venue?.avail || {};

  // "No preference" means ANY tutor who is free — so the hours offered are the UNION across every
  // tutor, not a blank grid. Without this a no-preference booking could never pick a time, which
  // made the whole open-pool flow unreachable: the card said "Pick a tutor to see available
  // times" to someone who had deliberately not picked one.
  // A placeholder tutor row would have done the same job, but it would also have appeared in the
  // People section as a person, needed an email, and been counted in the admin directory. This
  // is the same answer without inventing someone.
  const tutor = tutorName ? (DATA.tutors || []).find(t => norm(t.title) === norm(tutorName)) : null;
  const anyTutor = !tutorName;
  const tAvail = anyTutor
    ? (DATA.tutors || []).reduce((acc, t) => {
        Object.keys(t.avail || {}).forEach(c => { if (on(t.avail[c])) acc[c] = 'TRUE'; });
        return acc;
      }, {})
    : (tutor?.avail || {});

  const g = DATA.availGrid || { days: [['m','Mon'],['tu','Tue'],['w','Wed'],['th','Thu'],['f','Fri'],['sa','Sat'],['su','Sun']], hours: [9,10,11,12,13,14,15,16,17,18,19] };

  // Only show days that have at least one bookable hour, so the grid stays compact.
  const dayHasSlots = g.days.filter(([prefix]) =>
    g.hours.some(h => { const c = prefix + String(h).padStart(2,'0'); return on(tAvail[c]) && on(vAvail[c]); })
  );

  if (!dayHasSlots.length) {
    wrap.innerHTML = `<p class="slots-hint muted">No times available ${
      anyTutor ? 'at ' + esc(venueName) : 'for ' + esc(tutorName) + ' at ' + esc(venueName)}. ${
      isAdmin() ? 'Check the venue\u2019s open hours and the tutors\u2019 availability \u2014 an ' +
                  'hour has to be ticked on both to be bookable.' : ''}</p>`;
    layoutGrid(wrap.closest('.grid'));
    return;
  }

  // A grid: rows = days with availability, columns = hours. Available cells are tickable,
  // unavailable ones are greyed (shown but disabled). Client ticks 2 consecutive hours in ONE day.
  const head = `<tr><th></th>${g.hours.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const rows = dayHasSlots.map(([prefix, label]) => {
    const cells = g.hours.map(h => {
      const c = prefix + String(h).padStart(2,'0');
      const ok = on(tAvail[c]) && on(vAvail[c]);
      return ok
        ? `<td><input type="checkbox" class="slot-cb" data-lesson="${i}" data-day="${prefix}" data-hour="${h}"></td>`
        : `<td class="slot-off"></td>`;
    }).join('');
    return `<tr><th class="slot-day">${esc(label)}</th>${cells}</tr>`;
  }).join('');

  wrap.innerHTML = `<p class="slots-hint muted">${anyTutor
      ? 'Hours when a tutor is free here \u2014 tick the 2 back-to-back you want:'
      : 'Tick the 2 back-to-back hours you want:'}</p>
    <div class="slot-grid-wrap"><table class="slot-grid">${head}${rows}</table></div>`;
  layoutGrid(wrap.closest('.grid'));
}

// Enforce "2 consecutive hours in ONE day" when a slot is ticked.
function onSlotTick(i, day, hour, checked) {
  const boxes = Array.from(document.querySelectorAll(`.slot-cb[data-lesson="${i}"]`));
  if (checked) {
    // Ticking a cell: keep only this day, this hour + an adjacent hour in the same day.
    const sameDay = boxes.filter(b => b.dataset.day === day);
    const hoursAvail = sameDay.map(b => parseInt(b.dataset.hour));
    // Clear everything first, then set this hour + a neighbour in the same day.
    boxes.forEach(b => { b.checked = false; });
    const self = sameDay.find(b => parseInt(b.dataset.hour) === hour);
    if (self) self.checked = true;
    const neighbour = hoursAvail.includes(hour + 1) ? hour + 1 : hoursAvail.includes(hour - 1) ? hour - 1 : null;
    if (neighbour !== null) {
      const nb = sameDay.find(b => parseInt(b.dataset.hour) === neighbour);
      if (nb) nb.checked = true;
    }
  }
  calc();
}

function fillLessonBlock(i) {
  const d = DATA.dropdowns || {};
  const set = (cls, list, labelFn) => {
    const el = document.querySelector(`.${cls}[data-lesson="${i}"]`);
    if (!el) return;
    const fmt = labelFn || (v => v);
    el.innerHTML = (list||[]).map(v => `<option value="${esc(v)}">${esc(fmt(v))}</option>`).join('');
  };
  set('l-level', d.levels);
  set('l-location', d.locations);
  // Tutor: "No preference" first, then each tutor
  const tutorEl = document.querySelector(`.l-tutor[data-lesson="${i}"]`);
  if (tutorEl) {
    const tutors = (DATA.tutors || []).map(t => t.title).filter(Boolean);
    tutorEl.innerHTML = `<option value="">No preference</option>` +
      tutors.map(nm => `<option value="${esc(nm)}">${esc(nm)}</option>`).join('');
  }
  // Term/interval: each lesson has its own. Bookable weeks are the term's remaining weeks
  // MINUS 1 — the last week is reserved so the tutor (and library) have prep/coordination time.
  const ivEl = document.querySelector(`.l-interval[data-lesson="${i}"]`);
  if (ivEl) {
    const intervals = getAcademicIntervals();
    ivEl.innerHTML = intervals.length
      ? intervals.map(iv => {
          const bookable = Math.max(0, (parseInt(iv.weeks) || 0) - 1);   // reserve 1 week
          return `<option value="${esc(iv.name)}" data-weeks="${bookable}" data-term="${esc(iv.name)}" data-start="${esc(iv.startDate)}" data-end="${esc(iv.endDate)}" data-lastsun="${esc(iv.lastSun)}">${esc(iv.label)}</option>`;
        }).join('')
      : '<option value="">No terms</option>';
    syncBlockWeeks(i);
  }
  // Students, then split — split's options depend on how many students were picked.
  syncQtyOptions(i);
  syncSplitOptions(i);
  syncHostToggle(i);
  renderSlots(i);   // tutor × venue availability tickboxes for the chosen day
  // Subject checkbox dropdown for this block
  const drop = document.querySelector(`.l-subject-dropdown[data-lesson="${i}"]`);
  if (drop) drop.innerHTML = (d.subjects||[]).map(s =>
    `<label><input type="checkbox" class="subj-cb" data-lesson="${i}" value="${esc(s)}"> ${esc(s)}</label>`).join('');
}

function fill(id, list = [], first, labelFn) {
  if (!$(id)) return;
  const fmt = labelFn || (v => v);
  $(id).innerHTML = (first ? `<option value="">${esc(first)}</option>` : '')
    + (list||[]).map(v => `<option value="${esc(v)}">${esc(fmt(v))}</option>`).join('');
}

// Parse a DD/MM/YYYY (or loose) date string to a Date at local midnight; null if unparseable.
function parseDMY(s) {
  if (!s) return null;
  const m = String(s).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  let d;
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; d = new Date(+y, +m[2] - 1, +m[1]); }
  else { d = new Date(s); }
  if (isNaN(d)) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ---------- ACADEMIC INTERVALS ---------- */
// Friendly wording for the relative interval names. The dropdown shows the real term plus
// this in brackets, e.g. "Summer 2 (This Term)". A sheet display_name column overrides the
// whole label if you want something fully custom.
const INTERVAL_LABELS = {
  'current academic interval':          'This Interval',
  'current academic interval - 1':      'Current Interval',
  'current academic interval - week':   'Current Interval',
  'next academic interval':             'Next Interval',
  'next next academic interval':        'Interval After',
};
// Tolerant lookup — the sheet's relative names vary in spacing and dashes.
function intervalFriendly(rel) {
  const key = String(rel || '').toLowerCase()
    .replace(/[–—]/g, '-').replace(/\s*-\s*/g, ' - ').replace(/\s+/g, ' ').trim();
  return INTERVAL_LABELS[key] || '';
}

// Whole weeks bookable inside an interval's window: from the later of (today, start_date) up to
// its last Sunday. Derived from the DATES, not a column — the sheet has days, not weeks, and a
// price built on days would be ~7x wrong. This also guarantees weeks matches the sessions that
// actually get booked, since both use the same window.
function weeksInWindow(startStr, endStr) {
  const start = parseDMY(startStr);
  const end   = parseDMY(endStr);
  if (!end) return 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const from = (start && start > today) ? start : today;
  if (end < from) return 0;
  return Math.max(0, Math.floor((end - from) / (7 * 864e5)) + 1);
}

function getAcademicIntervals() {
  const isPlainCurrent = rel => String(rel || '').toLowerCase()
    .replace(/\s+/g, ' ').trim() === 'current academic interval';
  return (DATA.intervals || [])
    .filter(iv => iv.term || iv.rel)
    .filter(iv => !isPlainCurrent(iv.rel))     // clients can't book the current interval
    .map(iv => {
      const rel = String(iv.rel || '').toLowerCase().trim();
      const term = iv.term || iv.rel;
      // Weeks: derive from the window. Fall back to the sheet's own value, then days/7.
      const lastSun = iv.lastSun || iv.endDate;
      let weeks = weeksInWindow(iv.startDate, lastSun);
      if (!weeks) {
        const raw = parseFloat(iv.weeks);
        if (!isNaN(raw) && raw > 0) weeks = raw > 25 ? Math.floor(raw / 7) : Math.floor(raw);
      }
      const friendly = intervalFriendly(rel);
      const label = iv.label || (term && friendly ? `${term} (${friendly})` : term);
      return {
        name:  term,                                          // value = actual term name
        label,                                                // what the dropdown shows
        weeks,                                                // whole weeks for billing + display
        startDate: iv.startDate || '',
        endDate: iv.endDate || '', lastMon: iv.lastMon || '', lastSun: iv.lastSun || ''
      };
    });
}

function initIntervals() { /* intervals are populated per lesson block in fillLessonBlock now */ }

function syncWeeks() { calc(); }   // term is now per-lesson; order-level sync just recalcs

// Update a lesson block's weeks label from its own chosen term
function syncBlockWeeks(i) {
  const sel = document.querySelector(`.l-interval[data-lesson="${i}"]`);
  const label = document.querySelector(`.l-weeks-label[data-lesson="${i}"]`);
  if (!sel || !sel.options.length) return;
  if (label) label.textContent = '';   // weeks bracket removed at Halex's request
}

// Every date matching `dayName` from today until endDate (inclusive). Returns Date[].
// Every session date for `dayName` inside the booking window: from the later of (today, start)
// up to and including the last Sunday / end. These are the ACTUAL sessions that will run — so
// their count is what we bill, never a raw week count that might overrun the term cutoff.
function computeSessionDates(dayName, endDateStr, startDateStr) {
  const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const target = DAYS.indexOf(String(dayName||'').toLowerCase().replace(/s$/,''));
  const end = parseDMY(endDateStr);
  if (target < 0 || !end) return [];
  const today = new Date(); today.setHours(0,0,0,0);
  const winStart = parseDMY(startDateStr);
  const d = (winStart && winStart > today) ? new Date(winStart) : new Date(today);
  while (d.getDay() !== target) d.setDate(d.getDate()+1);
  const out = [];
  while (d <= end && out.length < 60) { out.push(new Date(d)); d.setDate(d.getDate()+7); }
  return out;
}

/* ---------- CALCULATOR ----------
   PRICING FORMULA (per hour). Constants come from the sheet (category=variable);
   day/time/subject multipliers come from their dropdown rows.

   Core rate  K = γ·η·α·λ·μ
   where:  λ = min-wage multiplier   μ = minimum wage      β = extra-child reducer
           ε = tutor kickdown        η = subject (×)       α = harder day (×)
           γ = easier time (×)       n = number of kids    V = venue rate/h

   Client rate/hr = K + Kβ(n−1) + V
   Tutor cost/hr  = Kε − Kεβ(n−1) + V
   Profit/hr      = K(1 + β(n−1)) − Kε(1 − β(n−1))     (V cancels: client pays room hire)
   Total          = client rate/hr × 2h × weeks
------------------------------------------------------------------- */

// Convert a multiplier (1.1, 0.9, 1) into a signed percentage label, or '' if neutral
function pct(mult) {
  const p = Math.round((mult - 1) * 100);
  return p === 0 ? '' : (p > 0 ? `+${p}%` : `${p}%`);
}

// Self-check: verifies the pricing formula still produces a known result. Logs if it drifts.
function verifyFormula() {
  // Confirm the pricing constants actually arrived from the sheet. The #1 cause of a £0 quote is
  // a stale backend deploy — the vars object comes back empty. Show it ON THE PAGE, not console.
  const v = (DATA.constants || {}).vars || {};
  const M = num(v['M'] ?? v['minimum wage'] ?? v['mu']);
  const banner = $('pricing-diag');
  if (isNaN(M) || M <= 0) {
    // The full diagnosis names the pay variable and the deploy step — useful to an admin, and
    // nobody else's business. A visitor gets told prices are unavailable, which is the only part
    // that concerns them, and the detail still goes to the console either way.
    const detail = '⚠ Pricing isn\'t set up — every price will be £0. ' +
      'The backend sent no rate variable (M). Usual fix: redeploy the Apps Script as a NEW version ' +
      '(Deploy → Manage deployments → pencil → Version: New version → Deploy). ' +
      'Or add a category=variable row named M. ' +
      `[backend: ${DATA.version || 'OLD / not redeployed'}]`;
    const publicMsg = '⚠ Prices are temporarily unavailable. Please check back shortly, ' +
      'or get in touch and we\'ll quote you directly.';
    if (banner) { banner.textContent = isAdmin() ? detail : publicMsg; banner.style.display = 'block'; }
    console.error(detail, 'vars =', v);
  } else {
    if (banner) banner.style.display = 'none';
    console.log('@family. pricing OK — M =', M, '| vars =', Object.keys(v).join(', '));
  }
}

// Helper: read a field scoped to one lesson block by class + data-lesson index.
function lval(i, cls) {
  const el = document.querySelector(`.${cls}[data-lesson="${i}"]`);
  return el ? el.value : '';
}
function lsubjects(i) {
  return Array.from(document.querySelectorAll(`.subj-cb[data-lesson="${i}"]:checked`)).map(cb => cb.value).filter(Boolean);
}

// The wage multiplier from the sheet — what turns a tutor's pay into what a client is charged.
function wageMultiplier() {
  const v = (DATA.constants || {}).vars || {};
  for (const key of ['w', 'wage multiplier', 'λ', 'lambda']) {
    const x = num(v[key]);
    if (!isNaN(x) && x > 0) return x;
  }
  return 1;
}

// The wage markup from the sheet. Needed on the card because a tutor's `constant` is what THEY
// are paid; what a client pays for them is that times w.
function wageMultiplier() {
  const v = (DATA.constants || {}).vars || {};
  for (const k of ['w', 'wage multiplier', 'λ', 'lambda']) {
    const x = num(v[k]);
    if (!isNaN(x) && x > 0) return x;
  }
  return 1;
}

// Hours taught per week — ONE source, read from a sheet variable so it isn't hardcoded in
// two pricing functions (which could silently disagree). Add a category=variable row named
// `hours_per_week` (or `hours`) to control it; falls back to 2 if the sheet doesn't set it.
function hoursPerWeek() {
  const v = (DATA.constants || {}).vars || {};
  for (const key of ['hours_per_week', 'hours per week', 'hours', 'hpw']) {
    const x = parseFloat(v[key]);
    if (!isNaN(x) && x > 0) return x;
  }
  return 2;
}

// Price a single lesson block (index i). Weeks come from the order-level interval (shared).
// Pure pricing. Takes a plain spec — no DOM, no lesson index — so the booking builder AND a
// live job card can both price themselves through exactly one implementation. A booking and a
// booked class are the same object at different stages; they must never disagree on the money.
// spec = { subjects, n, level, loc, hosting, day, time, splitOthers, startDate, lastSun,
//          endDate, interval, tutor, weeks, slots, lessonCount }
function priceFrom(spec) {
  spec = spec || {};
  const m = DATA.multipliers || {};
  const v = (DATA.constants || {}).vars || {};
  const cv  = (...keys) => { for (const key of keys) { const x = num(v[key]); if (!isNaN(x)) return x; } return 0; };
  const cvD = (key, dflt, ...alts) => { for (const key2 of [key, ...alts]) { const x = num(v[key2]); if (!isNaN(x)) return x; } return dflt; };
  const sur = (group, value) => { const x = num((m[group] || {})[value]); return isNaN(x) ? 0 : x; };
  const norm = str => String(str || '').toLowerCase().trim();

  const subjects = spec.subjects || [];
  const n = Math.max(1, parseInt(spec.n) || 1);
  const weeks = parseFloat(spec.weeks) || 1;
  const interval = spec.interval || '';
  const endDate = spec.endDate || '';
  const startDate = spec.startDate || '';
  const lastSun = spec.lastSun || endDate;
  const loc = spec.loc || '';
  const day = spec.day || '';
  const time = spec.time || '';
  const level = spec.level || '';
  const tutor = spec.tutor || '';
  const splitOthers = parseInt(spec.splitOthers) || 0;
  const i = spec.i;
  const hosting = spec.hosting;

  const venue = (DATA.venues || []).find(x => norm(x.title) === norm(loc));
  // "I'll host the venue" — the client provides the space (or it's their home), so they don't
  // pay venue rent. Auto-on and locked for a home venue. When hosting, the V term drops to 0.
  const V = (venue && !hosting) ? (parseFloat(venue.bestRate) || 0) : 0;

  /* ================== THE PRICING FORMULA ==================
     P = ( [ M·w + (Σ Sᵢ)/k + L + D + T ]      ← £/hour/child, all ADDED
           · [ 1 + s(k−1) ]                     ← subject-count
           · [ 1 + (c+B)(n−1) ]                 ← extra children (c = tutor's, B = yours)
           · [ 1 − b(W−1) ]                     ← bulk discount
           · [ 1 − a(A−1) ]                     ← advance-booking discount
         + V ) · h · W                          ← venue is £/hour (not per child)
     Every symbol comes from the sheet; set a rate to 0 to switch that effect off. ============ */

  // --- £/hour/child surcharges (blank in the sheet = 0, i.e. no surcharge) ---
  // What the tutor is paid per hour. Each tutor row carries its own `constant`; the row named
  // "No preference" holds the default, so switching the default is a sheet edit, not a code
  // change. Only if no tutor (and no such row) resolves do we fall back to the M variable.
  // With a tutor named, their rate. With "No preference", the HIGHEST rate any tutor charges —
  // because whoever ends up taking it must be covered by the price already agreed. Falling back to
  // the M variable instead would quote 12.30 and then hand the job to a 14.00 tutor, leaving the
  // difference out of your margin on every open booking.
  const tutorRow = tutor ? (DATA.tutors || []).find(t => norm(t.title) === norm(tutor)) : null;
  const openRate = (DATA.tutors || []).reduce((hi, t) => Math.max(hi, Number(t.rate) || 0), 0);
  const tutorRate = Number(tutorRow && tutorRow.rate) > 0 ? Number(tutorRow.rate)
                  : (tutor ? 0 : openRate);
  const M = tutorRate || cv('M', 'minimum wage', 'min wage', 'μ', 'mu');   // tutor's £/hr
  const usingTutorRate = !!tutorRate;
  const wMul = cvD('w', 1, 'wage multiplier', 'W', 'λ', 'lambda');  // wage multiplier (default 1)
  const L = sur('levels', level);   // level  surcharge £/h/child
  const D = sur('days',   day);     // day    surcharge £/h/child
  const T = sur('times',  time);    // time   surcharge £/h/child

  // Subjects: the AVERAGE of the chosen subjects' £ surcharges — so a pricey subject among
  // three exerts only a third of its pull. (Σ Sᵢ)/k, written out.
  const subjAdds = subjects.map(s => num((m.subjectsEta || {})[s]) || 0);
  const k = Math.max(1, subjAdds.length);                       // k = subject count
  const avgSubject = subjAdds.length ? subjAdds.reduce((x, y) => x + y, 0) / k : 0;

  // --- Rates (0 switches the effect off) ---
  const s = cv('s', 'subject count rate', 'subject_count_rate');  // 1 + s(k−1)
  const c = cv('c', 'extra child rate', 'extra_child_rate');      // tutor's share of each extra child
  const B = cv('B', 'boss rate', 'boss_rate');                    // YOUR cut per extra child
  const b = cv('b', 'bulk discount rate', 'bulk_discount_rate');  // 1 − b(W−1)
  const a = cv('a', 'advance booking rate', 'early booking rate');// 1 − a(A−1)

  const h = cvD('h', hoursPerWeek(), 'hours per session', 'hours_per_session');   // hours/session

  // The ACTUAL sessions that will run, bounded by the term window (never past the cutoff).
  const sessionDates = computeSessionDates(day, lastSun, startDate);
  // A live job already knows how many sessions it runs; only a fresh booking derives them
  // from the term window. spec.slots lets a job card price itself without a term dropdown.
  const slots = spec.slots || sessionDates.length || 1;
  const W = slots;                             // bill by real sessions, not raw week count
  const firstDate = sessionDates[0] || null;
  const A = firstDate ? Math.max(0, Math.floor((firstDate - new Date()) / (7 * 864e5))) : 0;

  // --- The parts, all ADDED (£/hour). Only the discounts stay multiplicative, because a
  //     percentage off is the one thing a parent reads correctly as a percentage. ---
  const perChildHourly  = M * wMul + avgSubject + L + D + T;   // M·w + (ΣSᵢ)/k + L + D + T
  const addSubjects     = s * (k - 1);                         // + £/h per EXTRA subject
  const addChildren     = (c + B) * (n - 1);                   // + £/h per EXTRA child (c→tutor, B→you)
  const fBulk           = 1 - b * (W - 1);                     // [ 1 − b(W−1) ] — W = sessions
  const fAdvance        = 1 - a * (A - 1);                     // [ 1 − a(A−1) ]
  // Floor the combined discount at 20% off. fBulk is linear and unbounded, so a long enough
  // booking would otherwise reach zero and then go negative.
  const F = 0.8;
  const discountRaw     = fBulk * fAdvance;                    // Δ before the floor
  const discountFactor  = Math.max(F, discountRaw);
  const discountFloored = discountRaw < F;

  // R = the per-child hourly rate including any extra-subject charge.
  const R = perChildHourly + addSubjects;
  // Kept so anything downstream reading the old factor names still gets a sane number.
  const fSubjectCount   = perChildHourly ? R / perChildHourly : 1;
  const fChildrenAll    = R ? (R + addChildren) / R : 1;
  const promoAdj = activePromoFactor({ subjects, n, weeks: W, day, time, level, lessonCount: spec.lessonCount || 1 });

  // --- The money, split three ways. These SUM to the client price exactly. ---
  const hoursTotal  = h * slots;                                        // hours = hrs/session × sessions
  const chargePerHour = (R + addChildren) * discountFactor * promoAdj + V;   // all-in £/hour
  const total       = chargePerHour * hoursTotal;                       // client pays
  // The tutor is paid minimum wage plus every teaching-related surcharge; YOUR margin is the
  // wage markup M(w−1) plus your slice of each extra child. Works on a single-student booking,
  // which the old multiplicative split did not — it paid you B×(n−1) = £0 whenever n was 1.
  const tutorPay    = (M + avgSubject + L + D + T + addSubjects + c * (n - 1))
                      * discountFactor * promoAdj * hoursTotal;         // tutor gets
  const profitTotal = (M * (wMul - 1) + B * (n - 1))
                      * discountFactor * promoAdj * hoursTotal;         // you get
  const venueTotal  = V * hoursTotal;                                   // venue gets
  const cost        = tutorPay + venueTotal;                            // what the job costs us

  // The tutor's effective £/hour — surfaced so you can SEE if discounts push it under minimum
  // wage (the formula doesn't silently clamp it; this just makes the number visible).
  const tutorHourly = hoursTotal ? tutorPay / hoursTotal : 0;
  const belowMinWage = M > 0 && tutorHourly > 0 && tutorHourly < M;

  const splitShares = splitOthers + 1;
  const shareAmount = total / splitShares;
  return {
    i, total, weeks, slots, n, V, loc, day, time, level, subjects, tutor, interval, endDate, startDate, lastSun,
    slotsKnown: spec.slotsKnown !== false,
    // The real dates this booking runs on. These ARE the billing basis — slots is their count —
    // so showing them is showing the client exactly what they're paying for, not a summary of it.
    sessionDates, firstDate,
    // every factor exposed so the breakdown can explain the price
    M, wMul, L, D, T, avgSubject, k, s, c, B, b, a, h, A, W,
    usingTutorRate,
    perChildHourly, addSubjects, addChildren, fSubjectCount, fChildrenAll, fBulk, fAdvance,
    discountFactor, discountFloored, F, R,
    chargePerHour, hoursTotal, tutorPay, venueTotal, cost, tutorHourly, belowMinWage,
    promoAdj, splitOthers, splitShares, shareAmount, profitTotal,
    summary: { service: (typeof document !== 'undefined' ? val('c-service') : ''), level,
               subject: subjects.join(', '), location: loc, day, time, students: n,
               interval, weeks, requestedTutor: tutor }
  };
}


// Price ONE lesson block in the builder (index i) by scraping its controls into a spec.
function priceLesson(i) {
  const m = DATA.multipliers || {};
  const v = (DATA.constants || {}).vars || {};
  // Sheet numbers may be written as fractions ("1/100", "1/2") — parseFloat would read those
  // as 1, so every constant goes through num() instead.
  const cv  = (...keys) => { for (const key of keys) { const x = num(v[key]); if (!isNaN(x)) return x; } return 0; };
  const cvD = (key, dflt, ...alts) => { for (const key2 of [key, ...alts]) { const x = num(v[key2]); if (!isNaN(x)) return x; } return dflt; };
  const sur = (group, value) => { const x = num((m[group] || {})[value]); return isNaN(x) ? 0 : x; };  // £ surcharge, blank = 0
  const norm = str => String(str || '').toLowerCase().trim();

  const subjects = lsubjects(i);
  const n = Math.max(1, parseInt(lval(i, 'l-qty')) || 1);
  // Weeks come from THIS lesson's own term dropdown
  const ivSel = document.querySelector(`.l-interval[data-lesson="${i}"]`);
  const ivOpt = ivSel?.options[ivSel.selectedIndex];
  const weeks = parseFloat(ivOpt?.dataset.weeks) || 1;
  const interval = ivSel?.value || '';
  const endDate = ivOpt?.dataset.end || '';
  const startDate = ivOpt?.dataset.start || '';
  const lastSun = ivOpt?.dataset.lastsun || endDate;   // sessions run up to the last Sunday
  const loc = lval(i, 'l-location');
  // Day + time come from the ticked slot grid. A booking is 2 consecutive hours in one day;
  // read the earliest ticked cell for the start time and its day.
  const ticked = Array.from(document.querySelectorAll(`.slot-cb[data-lesson="${i}"]:checked`))
    .map(b => ({ day: b.dataset.day, hour: parseInt(b.dataset.hour) }))
    .sort((a, b) => a.hour - b.hour);
  const PREFIX_DAY = { m:'Monday', tu:'Tuesday', w:'Wednesday', th:'Thursday', f:'Friday', sa:'Saturday', su:'Sunday' };
  const day  = ticked.length ? (PREFIX_DAY[ticked[0].day] || '') : '';
  const time = ticked.length ? String(ticked[0].hour).padStart(2, '0') + ':00' : '';
  const level = lval(i, 'l-level');
  const tutor = lval(i, 'l-tutor');
  const splitOthers = parseInt(lval(i, 'l-split')) || 0;   // per-lesson split


  const hostEl = document.querySelector(`.l-host[data-lesson="${i}"]`);
  const hosting = isHome(loc) || (hostEl && hostEl.checked);
  return priceFrom({
    i, subjects, n, level, loc, hosting, day, time, splitOthers,
    weeks, interval, startDate, endDate, lastSun, tutor,
    lessonCount: document.querySelectorAll('.lesson-block').length
  });
}

// Price a LIVE job from its sheet record, so a class card can show the same per-line costs the
// booking form showed. The job stores its own session count, so no term lookup is needed.
function priceJob(j) {
  if (!j) return null;
  const subjects = String(j.subject || '').split(',').map(x => x.trim()).filter(Boolean);
  // weeks_left is one of the columns missing from the sheet, so fall back to counting the dates
  // the booking stored. If neither exists we still need a number to price with, but we flag that
  // it was invented so the card can say "—" instead of confidently claiming "1 session".
  const dateCount = String(j.dates || '').split(',').filter(x => x.trim()).length;
  const known = parseInt(j.weeks) || dateCount;
  const slots = Math.max(1, known || 1);
  return priceFrom({
    slotsKnown: !!known,
    subjects,
    n: Math.max(1, parseInt(j.currentKids) || 1),
    level: j.level || '',
    loc: j.location || '',
    hosting: isHome(j.location),
    day: j.day || '',
    time: j.time || '',
    splitOthers: 0,
    weeks: slots, slots,
    tutor: j.requestedTutor || '',
    lessonCount: 1
  });
}

// Cost of ADDING ONE student to an existing job, for the weeks remaining.
// An extra child pays half rate by default (eChild), for the remaining weeks (venue not re-charged).
function priceAddStudent(job) {
  const m = DATA.multipliers || {};
  const v = (DATA.constants || {}).vars || {};
  const cv  = (...keys) => { for (const key of keys) { const x = num(v[key]); if (!isNaN(x)) return x; } return 0; };
  const cvD = (key, dflt, ...alts) => { for (const k2 of [key, ...alts]) { const x = num(v[k2]); if (!isNaN(x)) return x; } return dflt; };
  const sur = (group, value) => { const x = num((m[group] || {})[value]); return isNaN(x) ? 0 : x; };

  // Same per-child hourly rate as the main formula, for ONE extra child over the weeks left.
  const M = cv('M', 'minimum wage', 'min wage', 'μ', 'mu');
  const wMul = cvD('w', 1, 'wage multiplier', 'W', 'λ', 'lambda');
  const subjList = String(job.subject || '').split(',').map(x => x.trim()).filter(Boolean);
  const adds = subjList.map(x => num((m.subjectsEta || {})[x]) || 0);
  const kS = Math.max(1, adds.length);
  const avgSubject = adds.length ? adds.reduce((x, y) => x + y, 0) / kS : 0;
  const perChildHourly = M * wMul + avgSubject + sur('levels', job.level) + sur('days', job.day) + sur('times', job.time);

  const s = cv('s', 'subject count rate', 'subject_count_rate');
  const c = cv('c', 'extra child rate', 'extra_child_rate');
  const B = cv('B', 'boss rate', 'boss_rate');
  const h = cvD('h', hoursPerWeek(), 'hours per session', 'hours_per_session');

  const weeksLeft = parseFloat(job.weeks) || 0;              // job.weeks = weeks_left
  const R = perChildHourly * (1 + s * (kS - 1));
  // One extra child adds (c + B) of the rate — the same slice the main formula charges.
  const cost = R * (c + B) * h * weeksLeft;
  return { cost, weeksLeft };
}

// ---- Promotions framework (empty for now) ----
// Each promotion is a sheet row (category = 'promo') with a condition and a multiplier.
// Returns the product of every active promo's multiplier (1 = no promotions active).
// ctx = { subjects, n, weeks, day, time, level, lessonCount } so conditions can check the booking.
function activePromoFactor(ctx) {
  const promos = DATA.promotions || [];
  let factor = 1;
  promos.forEach(p => {
    if (promoApplies(p, ctx)) factor *= (parseFloat(p.value) || 1);
  });
  return factor;
}
// Decides whether a promo applies to this booking. Extend as you add promo types.
function promoApplies(p, ctx) {
  if (!p || !p.active) return false;
  switch ((p.type || '').toLowerCase()) {
    case 'bulk':        return ctx.lessonCount >= (parseFloat(p.threshold) || 999);   // many lessons
    case 'multi_student': return ctx.n >= (parseFloat(p.threshold) || 999);           // many students
    case 'long_term':   return ctx.weeks >= (parseFloat(p.threshold) || 999);         // many weeks
    // add 'advance_booking', 'subject', 'day' etc. here later
    default: return false;
  }
}

// A lesson is only priceable once a subject is chosen and a slot is ticked. Without a day the
// term window yields no session dates and the maths silently falls back to ONE session — a
// number that looks real and isn't. So unready lessons contribute nothing to the order.
const lessonReady = L => !!(L && L.subjects.length && L.day && L.time);

// Order-level quote: price every lesson block, sum the ready ones into an order total.
function quote() {
  const blocks = Array.from(document.querySelectorAll('.lesson-block')).map(b => parseInt(b.dataset.lesson));
  const lessons = blocks.map(priceLesson);
  const ready = lessons.filter(lessonReady);
  const total = ready.reduce((s, L) => s + L.total, 0);
  const profitTotal = ready.reduce((s, L) => s + L.profitTotal, 0);
  return { lessons, ready, total: total.toFixed(2), profitTotal: profitTotal.toFixed(2) };
}

function calc() {
  const q = quote();
  if ($('total')) $('total').textContent = q.total;
  // With a single lesson its Total row IS the order total, so showing both is just a repeat.
  $('order-total-row')?.classList.toggle('hidden', q.lessons.length < 2);

  const money = x => `£${(Number(x) || 0).toFixed(2)}`;
  const plus  = x => x ? `+ ${money(x)}` : '—';

  // The prices live inside each lesson block now, so refresh the individual spans in place.
  // Re-rendering the block would drop keyboard focus and close the subject dropdown mid-edit.
  q.lessons.forEach(L => {
    const block = document.querySelector(`.lesson-block[data-lesson="${L.i}"]`);
    if (!block) return;
    const ok = lessonReady(L);
    const F = (L.discountFactor || 1) * (L.promoAdj || 1);
    const H = L.hoursTotal || 0;
    const totOf = (x, atCost) => (Number(x) || 0) * (atCost ? 1 : F) * H;
    const rate = x => x ? `+ ${money(x)}/h` : '—';
    // Totals only mean anything once the length is known, so they stay dashed until a slot is
    // ticked — otherwise they'd quietly report the cost of one invented session.
    const tot  = (x, atCost) => (ok && x) ? `+ ${money(totOf(x, atCost))}` : '—';
    const setR = (key, html) => { const el = block.querySelector(`[data-rate="${key}"]`); if (el) el.innerHTML = html; };
    const setT = (key, html) => { const el = block.querySelector(`[data-total="${key}"]`); if (el) el.innerHTML = html; };

    const base = (L.M || 0) * (L.wMul || 0);
    setR('base', `${money(base)}/h`);
    setT('base', ok ? `<b>${money(totOf(base))}</b>` : '—');
    const subjectAdd = (L.avgSubject || 0) + (L.addSubjects || 0);
    setR('subject', rate(subjectAdd));   setT('subject', tot(subjectAdd));
    setR('level', rate(L.L));            setT('level', tot(L.L));
    setR('venue', rate(L.V));            setT('venue', tot(L.V, true));
    setR('students', rate(L.addChildren)); setT('students', tot(L.addChildren));
    setR('perhour', ok ? `<b>${money(L.chargePerHour)}/h</b>` : '—');
    setT('length', ok ? esc(H + ' hrs') : '—');
    setT('total', ok ? `<b>${money(L.total)}</b>` : '—');
    setT('tutorpay', ok ? `<b>${money(L.tutorPay)}</b>` : '—');
    setT('venuetotal', ok ? `<b>${money(L.venueTotal)}</b>` : '—');
    setT('profit', ok ? `<b>${money(L.profitTotal)}</b>` : '—');
    const dl = (L.sessionDates || []).map(d => fmtDate(d));
    const setEl = (attr, html) => { const el = block.querySelector(`[data-${attr}]`); if (el) el.innerHTML = html; };
    setEl('starts', esc(dl[0] || fmtDate(L.startDate) || '—'));
    setEl('ends',   esc(fmtDate(L.lastSun) || fmtDate(L.endDate) || '—'));
    setEl('dates',  dl.length ? `<span class="fl-dates">${esc(dl.join(', '))}</span>` : '—');
    setT('dates',   dl.length ? esc(dl.length + ' dates') : '—');

    const lenEl = block.querySelector('[data-lengthtext]');
    if (lenEl) lenEl.innerHTML = ok
      ? esc(`${L.h} hr × ${L.slots} session${L.slots > 1 ? 's' : ''}`)
      : '<span class="muted">pick a day and time</span>';
  });

  document.querySelectorAll('.lesson-block').forEach(b => enforceHomeRuleBlock(parseInt(b.dataset.lesson)));
}

/* ---------- API POST ---------- */
// One id per user action, generated here and recorded server-side. If the same id arrives twice
// — double tap, flaky connection, impatient retry — the second is ignored. Ten lines, and it's
// the difference between one charge and two on a Pay.
const newRequestId = () =>
  'r-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);


// Re-fetch the payload, then redraw. Every move used to call renderClasses() alone, which
// redraws from the DATA fetched at page load — so a job the backend had just cancelled, or a
// slot it had just wiped, kept rendering exactly as it was before the move. The server was
// right and the screen was stale. Only the classes section is redrawn, so this can't disturb
// an open profile editor or a game in progress elsewhere on the page.
async function reloadData() {
  try {
    const res = await fetch(API);
    const d = await res.json();
    if (d && !d.error) { DATA = d; renderClasses(); }
  } catch { renderClasses(); }   // offline: at least redraw what we have
}


async function post(body, btn, okText) {
  btn.textContent = 'Working...';
  btn.disabled = true;
  try {
    const d = await (await fetch(API, { method: 'POST', body: JSON.stringify(body) })).json();
    if (d && d.success) { btn.textContent = okText; return d; }
    // Put the reason somewhere it survives. The button is destroyed by the next re-render, so
    // the message on it lasted about half a second — long enough to see that something failed
    // and not long enough to read why. The toast and the console both persist.
    const msg = (d && d.error) || 'The server didn\'t accept that.';
    btn.textContent = msg;
    btn.disabled = false;
    flash(msg);
    console.error('[action failed]', msg, '\nsent:', body, '\ngot:', d);
    return d || {};
  } catch (err) {
    btn.textContent = 'Error';
    btn.disabled = false;
    flash('Could not reach the server — is the backend deployed?');
    console.error('[action failed] no valid JSON back', err, '\nsent:', body);
    return {};
  }
}

/* ---------- FILTERING ----------
   Each section has a search box plus addable filter dropdowns (no separate menu).
   FILTER_DEFS lists which fields each section can filter on; users click "+ filter"
   to add one inline. Filtering is search-text AND all active dropdown values. */
const FILTER_DEFS = {
  tutor: {
    target: 'tutors',
    text: x => (x.title + x.subtitle + (x.tags||[]).join(' ')),
    fields: {
      subject:  { label: 'Subject',  opts: () => DATA.dropdowns?.subjects || [], match: (x,v) => (x.tags||[]).map(t=>t.toLowerCase()).includes(v) },
      city:     { label: 'City',     opts: () => uniq((DATA.tutors||[]).map(t=>t.city)),    match: (x,v) => norm(x.city) === v },
      borough:  { label: 'Borough',  opts: () => uniq((DATA.tutors||[]).map(t=>t.borough)), match: (x,v) => norm(x.borough) === v },
    }
  },
  venue: {
    target: 'venues',
    text: x => (x.title||''),
    fields: {
      borough: { label: 'Borough', opts: () => DATA.dropdowns?.boroughs || [], match: (x,v) => norm(x.borough) === v },
      city:    { label: 'City',    opts: () => uniq((DATA.venues||[]).map(t=>t.city)), match: (x,v) => norm(x.city) === v },
    }
  },
  class: {
    target: 'classes',
    text: x => (x.title + x.location + x.day + x.time),
    fields: {
      subject:  { label: 'Subject',  opts: () => DATA.dropdowns?.subjects || [],  match: (x,v) => norm(x.subject).includes(v) },
      location: { label: 'Location', opts: () => DATA.dropdowns?.locations || [], match: (x,v) => norm(x.location) === v },
    }
  },
  link: {
    target: 'links',
    text: x => (x.title + (x.description||'')),
    fields: {
      category: { label: 'Category', opts: () => DATA.dropdowns?.linkCategories || [], match: (x,v) => norm(x.category) === v },
    }
  },
  shop: {
    target: 'shop',
    render: items => html('shop', items.length
      ? items.map(tpl.shopCard).join('')
      : '<p class="muted">No items match.</p>'),
    text: x => (x.name + ' ' + (x.description||'')),
    fields: {
      unit: { label: 'Pay with', opts: () => uniq((DATA.shop||[]).map(s => s.unit)), match: (x,v) => norm(x.unit) === v },
    }
  },
  post: {
    target: 'posts',
    source: () => GALLERY_POSTS,
    render: items => html('gallery', items.length
      ? items.map(tpl.socialPost).join('')
      : '<p class="muted">No posts match.</p>'),
    text: x => x.rawName,
    fields: {
      year:     { label: 'Year',     opts: () => uniq(GALLERY_POSTS.map(p => p.year)).sort().reverse(), match: (x,v) => norm(x.year) === v },
    }
  },
  tool: {
    target: 'checklist-content',
    source: () => checklistItems(window.TOOL_GROUP_BY || 'auto'),
    // Only the checklist topic cards render here now — the calc/timer/notepad/calendar tools
    // live in their own Tools section (renderTools).
    render: items => { html('checklist-content',
      items.length ? items.map(tpl.checklistBandCard).join('')
        : '<div class="card"><p class="muted">No topics match.</p></div>'); },
    text: x => (x.subject + ' ' + x.bandLabel + ' ' + x.topics.map(t => t.name).join(' ')),
    fields: {
      subject:      { label: 'Subject',       opts: () => Object.keys(DATA.dropdowns?.checklists || {}), match: (x,v) => norm(x.subject) === v },
      grade:        { label: 'Grade',          opts: () => uniq(allTopicFieldValues('grade')).sort((a,b)=>+a-+b), match: (x,v) => x.grades.includes(v) },
      keystage:     { label: 'Key stage',      opts: () => uniq(allTopicFieldValues('keystage')), match: (x,v) => x.keystages.includes(v) },
      tier:         { label: 'Higher/lower',   opts: () => uniq(allTopicFieldValues('tier')),     match: (x,v) => x.tiers.includes(v) },
      examBoard:    { label: 'Exam board',     opts: () => uniq(allTopicFieldValues('examBoard')),match: (x,v) => x.examBoards.includes(v) },
      resourceType: { label: 'Resource type',  opts: () => uniq(allTopicFieldValues('resourceType')), match: (x,v) => x.resourceTypes.includes(v) },
      company:      { label: 'Company',        opts: () => uniq(allTopicFieldValues('company')),  match: (x,v) => x.companies.includes(v) },
      stage:        { label: 'Stage',          opts: () => uniq(allTopicFieldValues('stage')),    match: (x,v) => x.stages.includes(v) },
      paper:        { label: 'Print-out needed', opts: () => ['Yes'], match: (x,v) => x.hasPaper },
    }
  },
};

const norm = s => String(s || '').toLowerCase().trim();
const uniq = arr => [...new Set((arr||[]).filter(Boolean))];

// Active filters per section: { tutor: {subject:'maths'}, ... }
const activeFilters = {};

function renderFilterBar(prefix) {
  const def = FILTER_DEFS[prefix];
  const bar = $(`${prefix}-filters`);
  if (!def || !bar) return;
  const active = activeFilters[prefix] || (activeFilters[prefix] = {});

  // Which fields aren't active yet (can still be added)
  const available = Object.keys(def.fields).filter(f => !(f in active));

  const search = `<input type="text" id="${prefix}-search" class="filter" placeholder="Search ${def.target}..." value="${esc(val(`${prefix}-search`))}">`;

  const dropdowns = Object.keys(active).map(field => {
    const fd = def.fields[field];
    const opts = uniq(fd.opts()).map(o => `<option value="${esc(o)}" ${norm(active[field])===norm(o)?'selected':''}>${esc(o)}</option>`).join('');
    return `<span class="filter-chip-wrap">
      <select class="filter filter-dyn" data-prefix="${prefix}" data-field="${field}">
        <option value="">All ${esc(fd.label)}</option>${opts}
      </select>
      <button type="button" class="filter-remove" data-prefix="${prefix}" data-field="${field}" title="Remove filter">×</button>
    </span>`;
  }).join('');

  const addChip = available.length
    ? `<span class="filter-add-wrap">
        <button type="button" class="filter-add" data-prefix="${prefix}">+ Filter</button>
        <span class="filter-add-menu hidden" id="${prefix}-add-menu">
          ${available.map(f => `<button type="button" class="filter-add-opt" data-prefix="${prefix}" data-field="${f}">${esc(def.fields[f].label)}</button>`).join('')}
        </span>
      </span>` : '';

  // Tools section gets a "Group by" control in the filter bar (not in the grid).
  let groupBy = '';
  if (prefix === 'tool') {
    const cur = window.TOOL_GROUP_BY || 'auto';
    const opt = (v, label) => `<option value="${v}"${cur === v ? ' selected' : ''}>${label}</option>`;
    groupBy = `<select id="tool-group-by" class="filter filter-dyn" title="Lead card titles with">
      ${opt('auto', 'Sort: Automatic')}
      ${opt('band', 'Sort: Grade / Stage')}
      ${opt('resourceType', 'Sort: Resource type')}
      ${opt('printout', 'Sort: Print-out')}
      ${opt('keystage', 'Sort: Key stage')}
      ${opt('examBoard', 'Sort: Exam board')}
    </select>`;
  }

  bar.innerHTML = search + dropdowns + addChip + groupBy;
}

function applyFilter(prefix) {
  const def = FILTER_DEFS[prefix];
  if (!def) return;
  const active = activeFilters[prefix] || {};
  const q = norm(val(`${prefix}-search`));
  const source = def.source ? def.source()
    : (DATA[def.target === 'classes' ? 'clientClasses' : def.target] || []);
  const items = source.filter(x => {
    if (q && !def.text(x).toLowerCase().includes(q)) return false;
    for (const [field, value] of Object.entries(active)) {
      if (value && !def.fields[field].match(x, norm(value))) return false;
    }
    return true;
  });
  if (def.render) def.render(items);
  else if (def.target === 'classes') renderClasses(items);
  else if (def.target === 'tutors' || def.target === 'venues') renderCards(def.target, items);
  else if (def.target === 'links') renderLinks(items);
}

/* ---------- EVENTS ---------- */
// When 'Home' is the location for a lesson block, that block's student min jumps to 4.
function enforceHomeRuleBlock(i) {
  const qty = document.querySelector(`.l-qty[data-lesson="${i}"]`);
  const locEl = document.querySelector(`.l-location[data-lesson="${i}"]`);
  if (!qty || !locEl) return;
  // Rebuild the options (a <select> has no .min), then resync split, since the seat
  // count may have been forced up to a full group.
  syncQtyOptions(i);
  syncSplitOptions(i);
}
function enforceHomeRule() { /* legacy no-op; per-block version used now */ }

// Auto-save the profile editor. Unlike the old Save button, this does NOT rebuild the card
// (that would destroy the form mid-edit) — it writes to the backend and updates the live
// data quietly, with a small status line. Debounced so typing doesn't fire a save per key.
function autosaveProfile(card) {
  if (!card) return;
  const status = card.querySelector('.edit-status');
  if (status) status.textContent = 'Saving…';
  clearTimeout(PROFILE_SAVE_TIMER);
  PROFILE_SAVE_TIMER = setTimeout(() => {
    const fields = {};
    card.querySelectorAll('[data-pf]').forEach(el => {
      if (el.disabled) return;
      fields[el.dataset.pf] = el.type === 'checkbox' ? (el.checked ? 'TRUE' : 'FALSE') : el.value;
    });
    console.log('[autosave] sending fields:', JSON.stringify(fields));
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'updateProfile',
      name: USER.name, target: EDIT_TARGET ? EDIT_TARGET.name : USER.name, fields }) })
      .then(r => r.json())
      .then(d => {
        console.log('[autosave] backend replied:', JSON.stringify(d));
        if (!USER.profile) USER.profile = {};
        Object.assign(USER.profile, fields);
        const norm = s => String(s || '').toLowerCase().trim();
        const me = (DATA.tutors || []).find(x => norm(x.title) === norm(USER.name));
        if (!EDIT_TARGET && d && d.name && d.name !== USER.name) {
          USER.name = d.name;
          try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        }
        // Keep the visible tutor card record in step so "Done" shows the new values.
        if (me) {
          if (d && d.name) me.title = d.name;
          if (fields.description !== undefined) me.description = fields.description ? `"${fields.description}"` : '';
          me.tags = [fields.adjective_1, fields.adjective_2, fields.adjective_3].filter(Boolean);
          if (fields.photo !== undefined) me.image = fields.photo;
          if (fields.video !== undefined) me.mediaUrl = fields.video;
          if (fields.city !== undefined) me.subtitle = `📍 ${fields.city || 'London'}`;
        }
        if (status) status.textContent = 'Saved ✓';
      })
      .catch(() => { if (status) status.textContent = 'Not saved — check connection'; });
  }, 800);
}

// Auto-save the venue editor (admin only). Same idea: write quietly, don't rebuild.
function autosaveVenue(card) {
  if (!card) return;
  const status = card.querySelector('.edit-status');
  if (status) status.textContent = 'Saving…';
  clearTimeout(VENUE_SAVE_TIMER);
  VENUE_SAVE_TIMER = setTimeout(() => {
    const venueName = card.dataset.venue;
    const fields = {};
    card.querySelectorAll('[data-vf]').forEach(el => {
      if (el.disabled) return;
      fields[el.dataset.vf] = el.type === 'checkbox' ? (el.checked ? 'TRUE' : 'FALSE') : el.value;
    });
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'updateVenue', adminName: USER.name, venue: venueName, fields }) })
      .then(r => r.json())
      .then(d => {
        const norm = s => String(s || '').toLowerCase().trim();
        const v = (DATA.venues || []).find(x => norm(x.title) === norm(venueName));
        if (v) { v.fields = { ...(v.fields || {}), ...fields }; v.avail = { ...(v.avail || {}), ...fields }; }
        if (status) status.textContent = (d && d.error) ? d.error : 'Saved ✓';
      })
      .catch(() => { if (status) status.textContent = 'Not saved — check connection'; });
  }, 800);
}

['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  const id = e.target.id;

  // Tools "Group by" override: store the choice and re-run the tool filter to regroup.
  if (id === 'tool-group-by') {
    window.TOOL_GROUP_BY = e.target.value;
    applyFilter('tool');
    return;
  }

  // Tutor ticks a venue they teach at → add/remove their handle in that venue's comfort list.
  if (e.target.classList.contains('venue-comfort-cb')) {
    const venueName = e.target.dataset.venue;
    const checked = e.target.checked;
    const handle = USER?.handle || USER?.name || '';
    const status = e.target.closest('.card')?.querySelector('.edit-status');
    if (status) status.textContent = 'Saving…';
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'toggleVenueComfort', handle, venue: venueName, checked }) })
      .then(r => r.json())
      .then(d => {
        // Reflect on the live venue object so the tutor card updates without a reload.
        const norm = s => String(s || '').toLowerCase().trim();
        const v = (DATA.venues || []).find(x => norm(x.title) === norm(venueName));
        if (v) {
          v.comfort = (v.comfort || []).filter(h => norm(h) !== norm(handle));
          if (checked) v.comfort.push(handle);
        }
        if (status) status.textContent = (d && d.error) ? d.error : 'Saved ✓';
      })
      .catch(() => { if (status) status.textContent = 'Not saved — check connection'; });
    return;
  }

  // A relabel saves the moment it changes. Nothing else on this site has a Save button.
  if (e.target.classList.contains('res-f') && isAdmin()) {
    const form = e.target.closest('.res-edit');
    const status = form?.querySelector('.edit-status');
    if (status) status.textContent = 'Saving…';
    const fields = {};
    form.querySelectorAll('.res-f').forEach(el => {
      fields[el.dataset.f] = el.type === 'checkbox' ? (el.checked ? 'TRUE' : 'FALSE') : el.value;
    });
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'updateResource',
      adminName: USER.name, rowIndex: form.dataset.row, fields }) })
      .then(r => r.json())
      .then(d => { if (status) status.textContent = d && d.error ? d.error : 'Saved ✓'; })
      .catch(() => { if (status) status.textContent = 'Not saved — check connection'; });
    return;
  }

  // Admin toggles a tutor's Enhanced DBS tickbox directly on their card.
  if (e.target.classList.contains('dbs-cb') && isAdmin()) {
    const tutor = e.target.dataset.tutor;
    const checked = e.target.checked;
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'setTutorDbs', adminName: USER.name, tutor, checked }) })
      .then(r => r.json())
      .then(d => {
        // Reflect on the live tutor object so it sticks without a reload.
        const norm = s => String(s || '').toLowerCase().trim();
        const t = (DATA.tutors || []).find(x => norm(x.title) === norm(tutor));
        if (t) t.dbs = checked;
        if (d && d.error) e.target.checked = !checked;   // revert on failure
      })
      .catch(() => { e.target.checked = !checked; });
    return;
  }

  // Multi-select checkbox toggled → rebuild the hidden value from all ticked boxes, then save.
  if (e.target.classList.contains('ms-cb')) {
    const wrap = e.target.closest('.ms-wrap');
    if (wrap) {
      const picked = Array.from(wrap.querySelectorAll('.ms-cb:checked')).map(cb => cb.value);
      const hidden = wrap.querySelector('.ms-value');
      if (hidden) hidden.value = picked.join(', ');
      const card = wrap.closest('.card');
      if (card && hidden?.dataset.pf && USER) autosaveProfile(card);
      if (card && hidden?.dataset.vf && USER && isAdmin()) autosaveVenue(card);
    }
    return;
  }

  // Profile & venue editors auto-save — no Save button. Any change to a data-pf / data-vf
  // field harvests the whole form and writes it (debounced so typing doesn't fire per key).
  const pfEl = e.target.closest('[data-pf]') ? e.target : null;
  const vfEl = e.target.closest('[data-vf]') ? e.target : null;
  if (pfEl && USER) { autosaveProfile(pfEl.closest('.card')); }
  if (vfEl && USER && isAdmin()) { autosaveVenue(vfEl.closest('.card')); }

  // Notepad auto-saves shortly after you stop typing (debounced so we don't save every keystroke)
  if (id === 'notepad-text' && USER) {
    const status = $('notepad-status');
    if (status) status.textContent = 'Saving…';
    clearTimeout(NOTEPAD_TIMER);
    NOTEPAD_TIMER = setTimeout(() => {
      const notes = $('notepad-text')?.value ?? '';
      fetch(API, { method: 'POST', body: JSON.stringify({ action: 'saveNotepad', name: USER.name, notepad: notes }) })
        .then(() => { USER.notepad = notes; if (status) status.textContent = 'Saved'; })
        .catch(() => { if (status) status.textContent = 'Not saved — check connection'; });
    }, 900);
  }
  // Student count changed → rebuild that block's split options (max = seats - 1) BEFORE
  // pricing, so the price never uses a split that's no longer valid.
  if (e.target.classList.contains('l-qty')) {
    const li = parseInt(e.target.dataset.lesson);
    syncSplitOptions(li);
    const lbl = document.querySelector(`.l-qty-label[data-lesson="${li}"]`);
    if (lbl) lbl.textContent = (parseInt(e.target.value) === 1) ? 'student' : 'students';
  }

  // Tutor / venue changed → rebuild that block's available-time grid.
  if (e.target.classList.contains('l-tutor') || e.target.classList.contains('l-location')) {
    renderSlots(parseInt(e.target.dataset.lesson));
    if (e.target.classList.contains('l-location')) {
      syncQtyOptions(parseInt(e.target.dataset.lesson));
      syncHostToggle(parseInt(e.target.dataset.lesson));
    }
  }
  // "I'll host the venue" toggled → reprice (drops venue rent).
  if (e.target.classList.contains('l-host')) calc();
  // A time slot was ticked → enforce the 2-consecutive-hours rule.
  if (e.target.classList.contains('slot-cb')) {
    onSlotTick(parseInt(e.target.dataset.lesson), e.target.dataset.day, parseInt(e.target.dataset.hour), e.target.checked);
    return;
  }

  if (e.target.closest('#new-job')) calc();
  // Per-lesson term changed → update that block's weeks label
  if (e.target.classList.contains('l-interval')) { syncBlockWeeks(parseInt(e.target.dataset.lesson)); calc(); }

  // Search box typing
  const prefix = Object.keys(FILTER_DEFS).find(p => id === `${p}-search`);
  if (prefix) applyFilter(prefix);

  // A dynamic filter dropdown changed
  if (e.target.classList.contains('filter-dyn')) {
    const p = e.target.dataset.prefix, f = e.target.dataset.field;
    (activeFilters[p] = activeFilters[p] || {})[f] = e.target.value;
    applyFilter(p);
  }
}));

// Safety net: block any accidental form submission from ever reloading the page
document.addEventListener('submit', e => e.preventDefault());

document.addEventListener('click', e => {
  const t = e.target;

  // Mini calculator buttons
  if (t.dataset && t.dataset.mc !== undefined) { window._mcClick?.(t.dataset.mc); return; }

  // Filter: toggle the "+ Filter" menu
  if (t.classList.contains('filter-add')) {
    $(`${t.dataset.prefix}-add-menu`)?.classList.toggle('hidden');
    return;
  }
  // Filter: pick a field to add
  if (t.classList.contains('filter-add-opt')) {
    const p = t.dataset.prefix, f = t.dataset.field;
    (activeFilters[p] = activeFilters[p] || {})[f] = '';
    renderFilterBar(p);
    applyFilter(p);
    return;
  }
  // Filter: remove an active filter
  if (t.classList.contains('filter-remove')) {
    const p = t.dataset.prefix, f = t.dataset.field;
    if (activeFilters[p]) delete activeFilters[p][f];
    renderFilterBar(p);
    applyFilter(p);
    return;
  }
  // Close any open filter menu when clicking elsewhere
  if (!t.classList.contains('filter-add')) {
    document.querySelectorAll('.filter-add-menu').forEach(m => m.classList.add('hidden'));
  }

  // Modal
  if (t.dataset.video) {
    $('modal-title').textContent = t.dataset.title || 'Intro';
    $('modal-frame').src = t.dataset.video;
    tog('modal', false);
  }
  if (t.classList.contains('modal-close') || t.id === 'modal') {
    tog('modal', true);
    $('modal-frame').src = '';
  }

  // Prompt login from the booking card
  if (t.id === 'go-login-btn') {
    ($('login-card') || $('tutors'))?.scrollIntoView({ behavior: 'smooth' });
    $('auth-email')?.focus();
  }

  // Book (requires login + home-group rule)
  // Add another lesson block
  if (t.id === 'add-lesson-btn') {
    if (LESSON_COUNT >= 5) return;   // sane cap
    const i = LESSON_COUNT;
    $('lessons').insertAdjacentHTML('beforeend', tpl.lessonBlock(i));
    fillLessonBlock(i);
    LESSON_COUNT++;
    calc();
    // The card just got taller — re-measure so it doesn't overflow into the next section.
    layoutGrid(document.getElementById('new-job')?.closest('.grid'));
    return;
  }
  // Remove a lesson block
  if (t.classList.contains('remove-lesson-btn')) {
    const i = t.dataset.lesson;
    const block = document.querySelector(`.lesson-block[data-lesson="${i}"]`);
    if (block) block.remove();
    calc();
    layoutGrid(document.getElementById('new-job')?.closest('.grid'));
    return;
  }

  if (t.id === 'book-btn') {
    if (!USER) { $('go-login-btn')?.click(); return; }
    let q;
    try { q = quote(); } catch (err) { t.textContent = 'Error: ' + err.message; setTimeout(()=>t.textContent='Lock in & book',3000); return; }
    if (!q.lessons.length) { t.textContent = 'Add a lesson first'; setTimeout(()=>t.textContent='Lock in & book',2500); return; }
    // Validate each lesson (subject chosen, a slot ticked, home rule)
    for (const L of q.lessons) {
      if (!L.subjects.length) { t.textContent = 'Pick a subject for each lesson'; setTimeout(()=>t.textContent='Lock in & book',2500); return; }
      if (!L.day || !L.time)  { t.textContent = 'Tick a day & time slot'; setTimeout(()=>t.textContent='Lock in & book',2500); return; }
      if (isHome(L.loc) && L.n < 4) { t.textContent = 'Home lessons need 4 students'; setTimeout(()=>t.textContent='Lock in & book',2500); return; }
    }
    if (parseFloat(q.total) <= 0) { t.textContent = 'Price is £0 — check pricing is set up'; setTimeout(()=>t.textContent='Lock in & book',3000); return; }
    // Create each lesson as a REQUESTED job — no payment yet. The client pays only after the
    // tutor accepts (Accepted → Pay now → Participant). One createJob per lesson.
    t.textContent = 'Sending request…';
    const jobs = q.ready.map(L => {
      const dates = computeSessionDates(L.day, L.lastSun || L.endDate, L.startDate).map(fmtDate);
      return {
        action: 'createJob',
        clientName: USER.name, clientContact: USER.role || '',
        level: L.level, subject: L.subjects.join(', '), service: L.summary.service || 'Group',
        day: L.day, time: L.time, location: L.loc,
        weeks: L.weeks, students: L.n,
        requestedTutor: L.tutor,
        price: L.total.toFixed(2), profit: (L.profitTotal || 0).toFixed(2),
        dates: dates.join(', '),
        // Opens the job's thread. The tutor's reply — an edited card plus a note — lands in the
        // same thread, so a negotiation is one continuous conversation from the first request.
        message: lval(L.i, 'l-message')
      };
    });
    // Fire them in sequence; report the outcome on the button.
    (async () => {
      try {
        for (const job of jobs) {
          const r = await fetch(API, { method: 'POST', body: JSON.stringify(job) });
          const d = await r.json();
          if (d && d.error) throw new Error(d.error);
        }
        t.textContent = '✅ Requested — awaiting tutor';
        setTimeout(() => { t.textContent = 'Lock in & book'; init(); }, 1800);
      } catch (err) {
        t.textContent = err.message || 'Could not send request';
        setTimeout(() => t.textContent = 'Lock in & book', 3000);
      }
    })();
    return;
  }

  // Client requests to join an existing class (takes an empty slot)
  if (t.classList.contains('join-job-btn')) {
    if (!USER) { $('go-login-btn')?.click(); return; }
    const jobId = t.dataset.job;
    post({ action: 'clientMove', jobId, client: USER.name, move: 'request', by: 'client', sender: USER.name }, t, '✅ Requested');
  }

  // Booker adds another student mid-job → creates a Requested slot with the add-cost stored.
  // Tutor accepts via the per-client cmove buttons, then the parent pays (see below).
  if (t.classList.contains('add-student-btn')) {
    if (!USER) { $('go-login-btn')?.click(); return; }
    const jobId = t.dataset.job;
    // Find the job to price the add
    const job = (DATA.clientClasses || []).find(j => String(j.id) === String(jobId));
    const add = job ? priceAddStudent(job) : { cost: 0 };
    post({ action: 'addStudent', jobId, clientName: USER.name, addCost: add.cost.toFixed(2) }, t, '✅ Requested — awaiting tutor');
  }

  // Pay for an accepted mid-job add
  if (t.classList.contains('pay-add-btn')) {
    const { job: jobId, slot } = t.dataset;
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'payAddStudent', jobId, slot }) })
      .then(r => r.json())
      .then(d => { if (d.url) window.location.href = d.url; else { t.textContent = d.error || 'Error'; } })
      .catch(() => { t.textContent = 'Connection error'; });
  }

  // Tutor accepts/declines a specific client slot
  // Job lifecycle transition (Accept / Decline / Pay / set Active / Complete etc.)
  if (t.classList.contains('job-act')) {
    const { job: jobId, to } = t.dataset;
    // "Pay now" will eventually route through checkout; for now it just advances the status.
    post({ action: 'setJobStatus', jobId, status: to }, t, `✅ ${to}`);
    // Reflect immediately so the card updates without waiting for a reload.
    const job = (DATA.clientClasses || []).find(x => String(x.id) === String(jobId));
    // Refetch rather than guessing the new status locally: the backend derives it from every
    // client slot, so a local guess is right only until it isn't.
    setTimeout(reloadData, 700);
    return;
  }

  // Open the inline edit form for a pending request.
  if (t.classList.contains('edit-req')) {
    const form = t.closest('.cl-block')?.querySelector('.edit-req-form');
    if (form) form.classList.toggle('hidden');
    return;
  }
  if (t.classList.contains('edit-req-cancel')) {
    t.closest('.edit-req-form')?.classList.add('hidden');
    return;
  }
  // Submit edited terms → a counter-offer carrying the new details, back to the tutor.
  if (t.classList.contains('edit-req-send')) {
    const { job: jobId, client } = t.dataset;
    const form = t.closest('.edit-req-form');
    if (!form) return;
    const edits = {
      students: form.querySelector('.erf-students')?.value,
      day:      form.querySelector('.erf-day')?.value,
      time:     form.querySelector('.erf-time')?.value,
      venue:    form.querySelector('.erf-venue')?.value,
    };
    post({ action: 'clientMove', jobId, client, move: 'edit', by: 'client', edits, sender: USER ? USER.name : '' }, t, '✅ Updated');
    return;
  }

  // One submit sends the whole turn: the chosen action (if any) plus the typed message.
  if (t.classList.contains('cl-submit')) {
    const { job: jobId, counterpart } = t.dataset;
    const block = t.closest('.cl-block');
    const sel = block?.querySelector('.cl-action');
    const input = block?.querySelector('.cl-msg');
    const chosen = sel?.value || '';
    const text = (input?.value || '').trim();
    // Nothing chosen and nothing typed is not a turn.
    if (!chosen && !text) { input?.focus(); return; }
    // Asking for a change without saying what to change is just a decline with extra steps.
    if (chosen === 'Request' && !text) {
      input?.focus();
      input?.setAttribute('placeholder', "Say what you'd like changed…");
      return;
    }
    // Both of these erase the person from the job — name, status and every thread. There is no
    // Declined or Withdrawn state to recover from, so the confirm is the only safety net.
    if (chosen === 'Decline' && !confirm('Decline this? They are removed from the session entirely.')) return;
    if (chosen === 'Withdraw' && !confirm('Withdraw? You are removed from this session entirely.')) return;

    // The dropdown already holds machine verbs, so there's nothing to translate — that mapping
    // table was only ever papering over two vocabularies that should have been one.
    const by = isTutorRole() ? 'tutor' : 'client';
    const move = chosen;
    if (input) input.value = '';
    if (sel) sel.value = '';
    const label = { Accept: '✅ Accepted', Request: '✅ Sent', Decline: 'Declined',
                    Withdraw: 'Withdrawn', Pay: '✅ Paid' }[move] || '✅ Sent';
    post({ action: 'move', jobId, role: by, name: USER ? USER.name : '',
           counterpart, move, text, requestId: newRequestId() }, t, label)
      .then(d => { if (d && d.success) setTimeout(reloadData, 700); });
    return;
  }

  // The tutor side: claim it, or the family's verdict on whoever claimed it. No message box —
  // these are one-tap decisions, and any discussion belongs in the family's thread.
  if (t.classList.contains('tutor-apply')) {
    const box = t.closest('.cl-block')?.querySelector('.tutor-msg');
    const text = (box?.value || '').trim();
    if (!confirm('Apply to teach this job? The family will see you among the applicants.')) return;
    if (box) box.value = '';
    post({ action: 'tutorMove', jobId: t.dataset.job, move: 'claim', text,
           by: 'tutor', sender: USER ? USER.name : '', requestId: newRequestId() }, t, '✅ Applied')
      .then(d => { if (d && d.success) setTimeout(reloadData, 700); });
    return;
  }

  if (t.classList.contains('tutor-verdict')) {
    const move = t.dataset.move;
    const who = t.dataset.tutor || '';
    const ask = {
      decline: `Decline ${who}? Other applicants are unaffected.`
    }[move];
    if (ask && !confirm(ask)) return;
    post({ action: 'tutorMove', jobId: t.dataset.job, move, tutor: who,
           by: isTutorRole() ? 'tutor' : 'client', sender: USER ? USER.name : '',
           requestId: newRequestId() }, t,
         move === 'claim' ? '✅ Applied' : 'Declined')
      .then(d => { if (d && d.success) setTimeout(reloadData, 700); });
    return;
  }

  // The family picks one applicant. That single act declines everyone else.
  if (t.classList.contains('tutor-choose')) {
    const sel = t.closest('.cl-form')?.querySelector('.tutor-pick');
    const chosen = sel?.value || '';
    if (!chosen) { sel?.focus(); return; }
    if (!confirm(`Choose ${chosen}? Any other applicants will be declined.`)) return;
    post({ action: 'tutorMove', jobId: t.dataset.job, move: 'accept', tutor: chosen,
           by: 'client', sender: USER ? USER.name : '', requestId: newRequestId() }, t, '✅ Chosen')
      .then(d => { if (d && d.success) setTimeout(reloadData, 700); });
    return;
  }

  // A move chip was tapped → mark it selected (toggle), and reveal the time field for "propose".
  if (t.classList.contains('move-chip')) {
    const box = t.closest('.move-box');
    const wasSel = t.classList.contains('selected');
    box.querySelectorAll('.move-chip').forEach(c => c.classList.remove('selected'));
    if (!wasSel) t.classList.add('selected');
    const move = wasSel ? '' : t.dataset.move;
    const timeField = box.querySelector('.move-time');
    if (timeField) timeField.classList.toggle('hidden', move !== 'propose');
    return;
  }

  // "Send" submits this turn: the selected action (if any) + optional text, together.
  if (t.classList.contains('move-send')) {
    const jobId = t.dataset.job;
    const by = t.dataset.side || 'client';
    const box = t.closest('.move-box');
    const selected = box.querySelector('.move-chip.selected');
    const move = selected ? selected.dataset.move : 'text';
    const text = (box.querySelector('.move-text')?.value || '').trim();
    const time = (box.querySelector('.move-time')?.value || '').trim();
    // A text-only turn still needs *something* — either an action or a message.
    if (move === 'text' && !text) return;
    if (move === 'propose' && !time) { box.querySelector('.move-time')?.focus(); return; }

    // Add-a-child routes through the existing add-student flow (it prices/pays separately).
    if (move === 'addchild') {
      const job = (DATA.clientClasses || []).find(x => String(x.id) === String(jobId));
      if (job) { const add = priceAddStudent(job);
        post({ action: 'addStudent', jobId, clientName: USER.name, addCost: add.cost.toFixed(2), text }, t, '✅ Requested'); }
    } else {
      post({ action: 'jobMove', jobId, by, move, text, time, sender: USER ? USER.name : 'User' }, t, '✅ Sent');
    }
    // Reflect locally so the turn passes without waiting for a reload.
    const job = (DATA.clientClasses || []).find(x => String(x.id) === String(jobId));
    if (job) {
      if (move === 'accept') job.status = 'Accepted';
      else if (move === 'decline') job.status = 'Declined/Cancelled';
      else if (move === 'propose') job.status = 'Negotiating';
      setTimeout(reloadData, 700);
    }
    return;
  }

  // Shop: Buy button (payment not wired yet — placeholder confirmation)
  if (t.classList.contains('buy-item-btn')) {
    const name = t.dataset.name;
    t.textContent = 'Coming soon';
    setTimeout(() => t.textContent = 'Buy', 2000);
    return;
  }

  // Times Tables Sprint
  if (t.id === 'tt-start' || t.id === 'tt-again') { startTimesTables(); return; }

  // Timer
  if (t.id === 'timer-toggle') { toggleTimer(); return; }
  if (t.id === 'timer-reset') {
    clearInterval(timerState.tick);
    timerState.running = false;
    timerState.left = timerState.total;
    if ($('timer-msg')) $('timer-msg').textContent = '';
    paintTimer();
    return;
  }

  // Kid adds a friend by exact handle (e.g. "LuccaD")
  if (t.id === 'add-friend-btn') {
    const query = val('friend-search').trim();
    const msg = $('friend-msg');
    if (!query) return;
    const norm = s => String(s || '').toLowerCase().trim();
    // match against other students' handles (exact, case-insensitive)
    const match = (DATA.students || []).find(s => norm(s.handle) === norm(query) && norm(s.handle) !== norm(USER.handle));
    if (!match) { if (msg) msg.textContent = `No student found with the name "${query}".`; return; }
    const current = friendHandles();
    if (current.map(norm).includes(norm(match.handle))) { if (msg) msg.textContent = `${match.handle} is already your friend.`; return; }
    current.push(match.handle);
    USER.friends = current.join(', ');
    post({ action: 'saveFriends', name: USER.name, friends: USER.friends }, t, '✅ Added');
    if (msg) msg.textContent = '';
    $('friend-search').value = '';
    renderCards('tutors', DATA.tutors);
    return;
  }

  // Kid removes a friend
  if (t.classList.contains('remove-friend-btn')) {
    const handle = t.dataset.handle;
    const norm = s => String(s || '').toLowerCase().trim();
    USER.friends = friendHandles().filter(h => norm(h) !== norm(handle)).join(', ');
    post({ action: 'saveFriends', name: USER.name, friends: USER.friends }, t, '✓');
    renderCards('tutors', DATA.tutors);
    return;
  }

  // Admin opens the relabel form for one resource.
  if (t.classList.contains('res-edit-btn')) {
    const form = t.closest('.check-row')?.nextElementSibling;
    if (form && form.classList.contains('res-edit')) {
      form.classList.toggle('hidden');
      layoutGrid(t.closest('.grid'));
    }
    return;
  }
  if (t.classList.contains('res-done')) {
    const form = t.closest('.res-edit');
    if (form) { form.classList.add('hidden'); layoutGrid(t.closest('.grid')); }
    return;
  }

  // Student ticks/unticks a topic box → instantly write their handle to that topic row's tickN cell
  if (t.classList.contains('topic-cb')) {
    if (!canTrack() || !USER.handle) return;
    const { row: rowIndex, tick } = t.dataset;
    fetch(API, { method: 'POST', body: JSON.stringify({
      action: 'toggleTopicTick', rowIndex, tick, handle: USER.handle, checked: t.checked
    }) })
      .then(r => r.json())
      .then(d => {
        // Keep the local stats in step so the profile card shows the new XP/credits
        if (d && d.xp !== null && d.xp !== undefined) USER.xp = d.xp;
        if (d && d.credits !== null && d.credits !== undefined) USER.credits = d.credits;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        renderCards('tutors', DATA.tutors);   // refresh the profile card's Lv / XP / credits
      })
      .catch(() => {});
    return;
  }

  // Tutor saves their edited profile
  // Tutor clicks Edit on their own Team card → swap that card to edit mode in place
  if (t.classList.contains('edit-profile-btn')) {
    const card = t.closest('.card');
    if (!card) return;
    const who = t.dataset.person || '';
    // Your own profile is already in memory. Someone else's has to be fetched, and the fetch is
    // authorised server-side — it carries contact details and dates of birth.
    if (!who) {
      EDIT_TARGET = null;
      const g = card.closest('.grid');
      card.outerHTML = tpl.profileEditCard(USER.profile || {});
      layoutGrid(g);
      return;
    }
    t.textContent = 'Opening…';
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'getProfile', adminName: USER.name, target: who }) })
      .then(r => r.json())
      .then(d => {
        t.textContent = 'Edit';
        if (!d || !d.success) { flash((d && d.error) || 'Could not open that profile.'); return; }
        EDIT_TARGET = { name: who, role: d.role, profile: d.profile || {} };
        const g = card.closest('.grid');
        card.outerHTML = tpl.profileEditCard(EDIT_TARGET.profile);
        layoutGrid(g);
      })
      .catch(() => { t.textContent = 'Edit'; flash('Could not reach the server.'); });
    return;
  }
  // Cancel editing → restore just this card to display form (no section rebuild)
  if (t.id === 'cancel-profile-btn') {
    const norm = s => String(s || '').toLowerCase().trim();
    const card = t.closest('.card');
    if (!card) return;
    const g = card.closest('.grid');
    // Finished editing someone else: forget them and rebuild the section, so their card shows
    // the new values and the next Edit doesn't reopen the previous person.
    if (EDIT_TARGET) {
      EDIT_TARGET = null;
      DATA._people = null;               // refetch the directory so the card reflects the edit
      renderCards('tutors', DATA.tutors);
      return;
    }
    // A tutor returns to their public profile card; a parent or student to their account card,
    // which is the only card they have.
    const me = (DATA.tutors || []).find(x => norm(x.title) === norm(USER && USER.name));
    card.outerHTML = (isTutorRole() && me) ? tpl.card(me) : tpl.accountCard();
    layoutGrid(g);
    return;
  }

  // Admin: open a venue's editor
  if (t.classList.contains('edit-venue-btn')) {
    if (!isAdmin()) return;
    const norm = s => String(s || '').toLowerCase().trim();
    const v = (DATA.venues || []).find(x => norm(x.title) === norm(t.dataset.venue));
    const card = t.closest('.card');
    if (card && v) { const g = card.closest('.grid'); card.outerHTML = tpl.venueEditCard(v); layoutGrid(g); }
    return;
  }
  // Cancel venue edit → restore the venue card
  if (t.id === 'cancel-venue-btn') {
    const norm = s => String(s || '').toLowerCase().trim();
    const card = t.closest('.card');
    const v = (DATA.venues || []).find(x => norm(x.title) === norm(card?.dataset.venue));
    if (card && v) { const g = card.closest('.grid'); card.outerHTML = tpl.card(v); layoutGrid(g); }
    return;
  }
  // Save venue edits (admin only)
  // Login — verify full name + PIN against the sheet
  if (t.id === 'auth-btn') {
    const name = val('auth-email'), pin = val('auth-pin');
    if (!name || !pin) { $('auth-msg').textContent = 'Please enter both fields.'; return; }
    $('auth-msg').textContent = '';
    t.textContent = 'Verifying...'; t.disabled = true;
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'verifyLogin', name, pin }) })
      .then(r => r.json())
      .then(d => {
        t.textContent = 'Enter'; t.disabled = false;
        if (!d.success) { $('auth-msg').textContent = d.error || 'Login failed.'; return; }
        USER = { name: d.name, role: (d.role || 'parent').toLowerCase(), kids: d.kids || [], parent: d.parent || '', profile: d.profile || null, topics: d.topics || '', friends: d.friends || '', handle: d.handle || '', highscore: d.highscore || 0, ttHighscore: d.ttHighscore || 0, xp: d.xp || 0, credits: d.credits || 0, tick1: d.tick1 || '', tick2: d.tick2 || '', tick3: d.tick3 || '', notepad: d.notepad || '' };
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        // Brief diagnostic so you can SEE the role the backend gave you + which backend it is.
        const bv = DATA.version || 'unknown';
        const msg = `Logged in as role: "${USER.role}" · backend ${bv}`;
        $('auth-msg').textContent = msg;
        console.log('@family. login →', msg);
        $('auth-pin').value = '';
        onLogin();
      })
      .catch(() => { t.textContent = 'Enter'; t.disabled = false; $('auth-msg').textContent = 'Connection error.'; });
  }

  // Logout
  if (t.id === 'logout-btn') {
    USER = null;
    try { localStorage.removeItem('familyUser'); } catch {}
    renderHeaderAuth();
    renderClasses();                      // access card reverts to login; clears highlighting
    renderCards('tutors', DATA.tutors);   // People: drop friend cards/edit buttons
    renderChecklist();                    // Checklist: back to default view
    renderArcade();                       // Arcade: drop personal best display
    renderCheckout();
  }

  // Custom multi-select dropdowns (per-lesson subject picker + dash topics)
  if (t.classList.contains('l-subject-display') || t.closest('#dash-topic-display')) {
    t.closest('.custom-select-wrapper').querySelector('.custom-dropdown').classList.toggle('hidden');
  } else if (!t.closest('.custom-select-wrapper')) {
    document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.add('hidden'));
  }

  // Subject checkbox sync (per lesson block) — update that block's display label + recalc
  if (t.classList.contains('subj-cb')) {
    const i = t.dataset.lesson;
    const checked = Array.from(document.querySelectorAll(`.subj-cb[data-lesson="${i}"]:checked`)).map(cb => cb.value);
    const disp = document.querySelector(`.l-subject-display[data-lesson="${i}"]`);
    if (disp) disp.textContent = checked.length ? checked.join(', ') + ' ⌄' : 'Subject ⌄';
    calc();
  }
  // Dash topics (unchanged)
  if (t.classList.contains('dash-topic-cb')) {
    const checked = Array.from(document.querySelectorAll('.dash-topic-cb:checked')).map(cb => cb.value);
    if ($('dash-topic-display')) $('dash-topic-display').textContent = checked.length ? checked.join(', ') + ' ⌄' : 'Topics ⌄';
  }

  // Save checklist
  if (t.id === 'save-checklist-btn') {
    const selected = Array.from(document.querySelectorAll('.dash-topic-cb:checked')).map(cb => cb.value);
    console.log('Saving:', selected.join(', '));
    t.textContent = 'Saved!';
    setTimeout(() => t.textContent = 'Save Progress', 2000);
  }

  // Share buttons — gallery posts and tutor/venue cards all behave the same:
  // native share sheet where the device has one, clipboard copy otherwise.
  const shareBtn = t.closest('.social-share-btn, .card-share-btn');
  if (shareBtn) {
    const card = shareBtn.closest('.card');
    const title = shareBtn.dataset.shareTitle || 'family-note';
    if (card && window.html2canvas) {
      shareCardImage(card, title);
    } else {
      // Fallback: share the link if image capture isn't available.
      const url = shareBtn.dataset.shareUrl;
      if (navigator.share) navigator.share({ title, url }).catch(() => {});
      else navigator.clipboard?.writeText(url).then(() => flash('Link copied!')).catch(() => alert(url));
    }
  }
});

// Capture a card as a PNG and share it (native share sheet) or download it.
//
// Two things used to cut the image short, and both are about what "the card" actually is:
//   • Inner scroll areas. .cl-thread caps at 170px with overflow:auto, so a long conversation
//     rendered only the visible slice — html2canvas photographs boxes, it doesn't scroll them.
//   • Page scroll. html2canvas renders from the document origin, so a card halfway down a
//     scrolled page came out offset, clipping the bottom.
// Both are fixed by a single `.capturing` class (see style.css) plus telling html2canvas the
// element's FULL scroll size rather than its on-screen box. One class beats the pile of inline
// style juggling this used to do — and it can't leak, because it's removed in a finally block.
async function shareCardImage(card, title) {
  const btn = card.querySelector('.card-share-btn, .social-share-btn');
  const prevText = btn ? btn.textContent : '';
  if (btn) btn.textContent = 'Preparing…';
  card.classList.add('capturing');

  try {
    // Wait for Patrick Hand. html2canvas draws text with the computed font at capture time; if
    // the webfont hasn't finished loading it can render nothing at all rather than falling back.
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch {} }

    // Deliberately MINIMAL options. Passing width/height together with scrollX/scrollY and
    // windowWidth/windowHeight sizes the canvas to the element while laying its contents out at
    // document coordinates — so the card's own background and border draw at the origin and
    // everything inside lands off-canvas. That produced a blank note with a pin on it.
    // The .capturing class already unrolls every scroll box, which was the real clipping cause,
    // so html2canvas only needs to be told to keep the paper colour and render sharply.
    const canvas = await html2canvas(card, {
      backgroundColor: null,       // keep the note's own colour, transparent margins
      scale: 2,                    // crisp on retina
      logging: true,               // TEMPORARY: html2canvas narrates the clone to the console
      // Don't fetch images at all. Every photo here is a drive.google.com thumbnail, and Drive
      // doesn't reliably send CORS headers — so html2canvas would sit waiting on a load that
      // can never succeed, then return a canvas with the box decorations and nothing else.
      // That is exactly the blank note. Stripping the sources in the clone means there is
      // nothing to wait for, and the note exports as text, which is what it's for.
      useCORS: false,
      imageTimeout: 0,
      onclone: (doc, el) => {
        el.querySelectorAll('img').forEach(img => {
          img.removeAttribute('src');
          img.removeAttribute('srcset');
          img.style.visibility = 'hidden';   // keep its space, so the layout is unchanged
        });
        // TEMPORARY diagnostic. If the clone HAS the text but the export doesn't, the problem is
        // where it's drawn, not whether it exists — and those have opposite fixes.
        console.log('[share] clone height:', el.scrollHeight, 'live height:', card.scrollHeight);
        console.log('[share] clone text length:', (el.innerText || '').trim().length);
        console.log('[share] first 120 chars:', (el.innerText || '').trim().slice(0, 120));
      },
    });
    console.log('[share] canvas:', canvas.width, '×', canvas.height);

    const safeName = String(title).replace(/[^\w\-]+/g, '_').slice(0, 40) || 'note';
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    if (!blob) { flash('Could not create image'); return; }
    const file = new File([blob], `${safeName}.png`, { type: 'image/png' });

    // Prefer the native share sheet with the image file (mobile). Fall back to download.
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title }); return; } catch { /* cancelled */ }
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${safeName}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    flash('Image saved');
  } catch (e) {
    flash('Could not capture the note');
  } finally {
    // Always restore, even if the capture threw — a card stuck in capture mode would sit
    // un-tilted with its actions invisible and no way back short of a reload.
    card.classList.remove('capturing');
    if (btn) btn.textContent = prevText;
  }
}

// Tiny transient toast for share feedback.
function flash(msg) {
  let el = document.getElementById('flash-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'flash-toast';
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--gold);color:#000;padding:10px 18px;border-radius:8px;font-family:inherit;z-index:9999;box-shadow:0 6px 20px rgba(0,0,0,.4);transition:opacity .3s';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(window._flashTimer);
  window._flashTimer = setTimeout(() => { el.style.opacity = '0'; }, 2000);
}

init();
