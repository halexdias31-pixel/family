// Set the moment this file starts executing. index.html watches it to distinguish a script
// that never loaded (cache/path problem) from one that loaded but couldn't reach the backend.
window.__familyBooted = true;

// What this frontend needs the backend to be able to do. Checked by NAME, not by version:
// version strings don't order ("…-machine" sorts after "…-events" because m > e), so comparing
// them would call an older deploy current. Add a name here when the site starts relying on
// something new in hermes.
// What this version of the site needs the backend to understand. If a deploy hasn't landed, the
// banner says so on load — rather than the first person to press a button getting "Unknown action".
const NEEDS_FEATURES = ['move', 'events', 'updateConfig', 'createCheckout', 'finalizePayment'];

const API = 'https://script.google.com/macros/s/AKfycbyINfTA44t4ibW6ihxADTwCo1CxCP8v6UA_SR_4GiCQuR7Q4cRNWnlkOdb2xQaSoGzk/exec';
let DATA = {};
let USER = null; // set on login: { name }
let NOTEPAD_TIMER = null;   // debounce timer for notepad auto-save
let PROFILE_SAVE_TIMER = null;   // debounce timer for profile editor auto-save
let VENUE_SAVE_TIMER = null;     // debounce timer for venue editor auto-save
// When an admin opens someone else's profile: { name, role, profile }. null means you're
// editing your own, which is the only thing anyone but an admin can do.
let EDIT_TARGET = null;
// Bumped every time an editor is opened. A fetch that finishes after the next click compares its
// own number and stands down — otherwise the slowest answer wins, whichever card you're on now.
let EDIT_SEQ = 0;

// The sheet writes TRUE/FALSE as text, the payload sends real booleans, and rows written by older
// versions send neither consistently. One reader for all three.
const TRUEish = v => v === true || /^(true|yes|1|✓)$/i.test(String(v ?? '').trim());

/* R is the hourly rate, and it's the tutor's own. A job nobody has claimed yet can't be priced
   from the rate of a tutor who hasn't taken it, so an unclaimed one uses this default.
   There is no minimum-wage floor and no markup any more: a tutor names their price, and what they
   are paid is what they charged. Your margin comes from B — your share of what an extra seat is
   worth — which is the only part of the price that isn't the tutor's work. */
const OPEN_RATE = 10;

/* One word for "nothing chosen yet", everywhere. The form had four — "Choose ⌄", "All Levels",
   an empty option and "No preference" — which read as four different states rather than one. */
const NONE_LABEL = '\u2014\u2014\u2014';

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
/**
 * MUST MATCH bmActionsFor in hermes.gs, LINE FOR LINE.
 * The backend re-checks every move, so a mismatch doesn't let anything illegal through — it shows
 * a button that then fails, or hides one that would have worked. This copy had already drifted:
 * it was still the old two-party rules table while the backend had moved to these, which is the
 * cost of duplicating a definition and the reason both are now written the same way.
 *
 *   Paid / Locked — you may always leave. Everything else is settled or waiting.
 *   Accepted      — terms agreed; the client owes payment, the tutor waits.
 *   otherwise     — put terms up or leave, and decide about anyone who's bidding.
 */
function bmActionsFor(role, mine, theirs) {
  mine = mine || ''; theirs = theirs || '';
  if (mine === 'Paying' || mine === 'Booked') return ['Withdraw'];
  if (mine === 'Agreed') return role === 'client' ? ['Pay', 'Withdraw'] : ['Withdraw'];
  const out = ['Request', 'Withdraw'];
  if (theirs === 'Waiting') { out.push('Accept'); out.push('Decline'); }
  return out;
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
  // participant status, from the person's own point of view
  Waiting: 'st-requested', Agreed: 'st-accepted', Paying: 'st-negotiating', Booked: 'st-active',
  // the previous words, so anything written before the rename still renders in colour
  Requested: 'st-requested', Accepted: 'st-accepted', Paid: 'st-negotiating', Locked: 'st-active',
  // tutor status
  Open: 'st-requested', Applied: 'st-negotiating', Confirmed: 'st-active',
  // lifecycle
  Uncreated: 'st-draft', Upcoming: 'st-accepted', Started: 'st-active',
  Ongoing: 'st-active', Ended: 'st-completed',
  // possession
  Yours: 'st-active', Others: 'st-requested',
};
// Plain text, not a chip. Status, Possession and Lifecycle are values in rows exactly like Venue
// and Tutor are, and dressing three of them as coloured labels made them read as a different KIND
// of thing — which is the opposite of what a row-based card is for. The colour survives as the
// text colour, so a cancelled job is still visibly cancelled.
const badge = v => {
  const s = String(v ?? '').trim();
  return s ? `<span class="state ${BADGE_CLASS[s] || 'st-requested'}">${esc(s)}</span>` : '';
};

/* Seven functions were removed here and elsewhere, each dead: bmPossession, parseProgress,
   isMyClass, totalCell, onSlotTickStrict, syncWeeks, priceAddStudent. Dead code is worse than no
   code — it reads as a thing the site does, so the next person to change a rule changes it in two
   places and only one of them runs. */

/* ---------- UTILS ---------- */
/* Comparing names, everywhere. This was redeclared inside TWENTY functions, each an identical
   line — and one of them wasn't identical, stripping punctuation where the others didn't, which is
   how "GeorgePovey" and "George Povey" were the same person in one place and two in another.
   One definition, so they cannot disagree. */
const norm = s => String(s || '').toLowerCase().trim();
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
const canTrack = () => hasRole('kid') || hasRole('tutor') || hasRole('admin');
// An admin is a tutor with extra powers, so everywhere that gates on "tutor" should also
// admit admin. Use these helpers rather than `USER.role === 'tutor'` directly.
const heldRoles = () => (USER && (USER.roles || [USER.role]) || []).map(x => String(x).toLowerCase());
const hasRole = r => heldRoles().indexOf(r) !== -1;
const isTutorRole = () => hasRole('tutor') || hasRole('admin');
const isAdmin = () => hasRole('admin');

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
  // Abstract rather than realistic. The tilt stays small and the paper is a flat colour — no
  // sheen, no torn edges, no rounded corners — so a wall of these reads as a designed system that
  // borrows the IDEA of a pinned note, instead of attempting a photograph of one and landing in
  // the uncanny middle. What carries the metaphor is the tilt, the shadow and the fixing; those
  // are enough, and everything else was noise.
  const lean = dice(30, 4) === 0;                        // roughly one note in four leans
  const tilt = lean ? (dice(0, 400) / 100 - 2)          // -2.00 … +1.99deg
                    : (dice(0, 90) / 100 - 0.45);       // -0.45 … +0.44deg
  s.setProperty('--tilt', tilt.toFixed(2) + 'deg');

  // The yellows spread properly now. Kept tight, the wall looked like one printed background with
  // gaps between the cards; opened up, each note is visibly its own piece of paper while the whole
  // set still reads as one pad. Hue does most of the work — lemon through to amber.
  s.setProperty('--h', (41 + dice(9, 18)) + '');                            // 41 … 58
  s.setProperty('--s', (64 + dice(13, 26)) + '%');                          // 64 … 89%
  s.setProperty('--l', (61 + dice(19, 17)) + '%');                          // 61 … 77%

  /* ---- WHAT IS RANDOMISED PER NOTE -----------------------------------------------------------
     Everything here is rolled from the card's own hash, so a given note always looks the same and
     the wall never twitches on re-render. Add to this list when you add a roll.
       dice(0)  tilt        weighted: ~1 in 4 leans up to 2deg, the rest stay under half a degree
       dice(9)  hue         41-58   lemon through amber
       dice(13) saturation  64-89%
       dice(19) lightness   61-77%
       dice(24) fixing      0 pin · 1 thumbtack · 2-3 folded bottom corner
       dice(27) tape angle  -4.5 to +4.4deg, for photos
       dice(30) lean        whether this note is one of the leaners
     ------------------------------------------------------------------------------------------ */
  // How it's fixed to the wall — five treatments. Folds are bottom corners only: a note held at
  // the top curls away at the bottom, and a top corner folding under its own pin looks wrong.
  // How it's fixed to the wall, so a screenful varies without any
  // one of them being decorative enough to notice on its own:
  //   0 ball-headed pin · 1 flat thumbtack · 2-5 a folded corner, one per corner
  card.dataset.deco = dice(24, 4);
  // Photos are taped on, and the tape sits at a slightly different angle on each.
  s.setProperty('--tape', (dice(27, 90) / 10 - 4.5).toFixed(1) + 'deg');    // -4.5 … +4.4deg
}

/* ---------- AVATARS ---------------------------------------------------------------------------
   A small blocky figure for each student, drawn as SVG from their handle. Same handle, same
   figure, for ever — the hash decides every choice, so nobody's avatar changes when the page
   re-renders.

   Deliberately ORIGINAL geometry rather than an off-brand version of a well-known minifigure.
   A famous toy figure's proportions and head design are protected as trade dress, and "similar
   but changed a bit" is precisely what that protection covers — the closer a lookalike gets, the
   worse its position. So this is a simple round-headed blocky character of its own: nothing here
   is traced from anything, and nothing needs crediting.

   Pieces vary: skin, hair shape and colour, shirt colour, an accessory. Four choices from one
   hash gives a few thousand combinations, which is plenty to feel personal on a roster of twenty.
--------------------------------------------------------------------------------------------- */
const AV_SKIN  = ['#f3c9a0', '#e0a878', '#c58a5b', '#8d5a3b', '#5f3a25', '#ffd9b3'];
const AV_HAIR  = ['#2b2118', '#5a3a1d', '#a8621f', '#d9b45a', '#8a8a8a', '#3a2a4a', '#7a2a2a'];
/* Colours are free — a palette, not a catalogue. The same eight serve shirts and hair, so a
   student can match them without either being something they had to buy. */
const AV_SHIRT = ['#f4f4f2', '#2f6b3f', '#1f5f8a', '#8a3a3a',
                  '#6b4d8a', '#c07a1f', '#3d4b57', '#2f6b6b'];

/* The SHAPES. Every id here has a matching entry in AVATAR_ITEMS in hermes.gs, which is what
   decides whether someone may wear it — this table only knows how to draw things, deliberately.
   Splitting it that way means the browser can hold the whole catalogue (it has to, to show a
   wardrobe) without holding any authority over it. */
const AV_ART = {
  /* Hairstyles. Each covers the crown and comes DOWN the sides — the head is a 20x20 box from
     y=12, so hair that starts lower than that reads as a headband, which is exactly what the
     first version looked like. */
  hair: {
    crop:    c => `<path d="M14 17a6 5 0 0 1 6-5h8a6 5 0 0 1 6 5v4H14z" fill="${c}"/>`,
    fringe:  c => `<path d="M14 17a6 5 0 0 1 6-5h8a6 5 0 0 1 6 5v5h-2v-4H16v4h-2z" fill="${c}"/>`,
    long:    c => `<path d="M14 17a6 5 0 0 1 6-5h8a6 5 0 0 1 6 5v15h-3V20H17v12h-3z" fill="${c}"/>`,
    bunches: c => `<path d="M14 17a6 5 0 0 1 6-5h8a6 5 0 0 1 6 5v3H14z" fill="${c}"/><circle cx="13" cy="23" r="3.6" fill="${c}"/><circle cx="35" cy="23" r="3.6" fill="${c}"/>`,
    curls:   c => `<g fill="${c}"><circle cx="18" cy="14" r="4"/><circle cx="24" cy="12.5" r="4.4"/><circle cx="30" cy="14" r="4"/><circle cx="15" cy="18" r="3.4"/><circle cx="33" cy="18" r="3.4"/></g>`,
    mohawk:  c => `<path d="M22 12h4v-4h-4z" fill="${c}"/><path d="M21 8h6l-1-4h-4z" fill="${c}"/><path d="M14 17a6 5 0 0 1 6-5h8a6 5 0 0 1 6 5v2H14z" fill="${c}" opacity=".45"/>`,
  },
  headwear: {
    none:     () => '',
    cap:      c => `<path d="M13 18a11 11 0 0 1 22 0v2H13z" fill="${c}"/><path d="M33 19h9v3h-9z" fill="${c}"/>`,
    beanie:   c => `<path d="M13 19a11 11 0 0 1 22 0v2H13z" fill="${c}"/><rect x="12" y="20" width="24" height="4" rx="1.5" fill="${c}" opacity=".75"/>`,
    headband: c => `<rect x="12" y="19" width="24" height="4" rx="1.5" fill="${c}"/>`,
    crown:    () => `<path d="M15 20l2-7 3.5 4L24 12l3.5 5L31 13l2 7z" fill="#e8c14a" stroke="#b8942c" stroke-width="1"/>`,
  },
  faceware: {
    none:    () => '',
    glasses: () => `<g fill="none" stroke="#2b2b2b" stroke-width="1.6"><circle cx="20" cy="25" r="3.4"/><circle cx="28" cy="25" r="3.4"/><path d="M23.4 25h1.2"/></g>`,
    shades:  () => `<g fill="#1b1b1b"><rect x="16.4" y="22.4" width="7" height="5" rx="1.6"/><rect x="24.6" y="22.4" width="7" height="5" rx="1.6"/><rect x="23.4" y="24.2" width="1.2" height="1.4"/></g>`,
    goggles: () => `<g><rect x="15" y="21.5" width="18" height="6.5" rx="3" fill="#3aa0d0" opacity=".85"/><rect x="13" y="23" width="22" height="2" fill="#2b2b2b"/></g>`,
  },
  shoulders: {
    none:     () => '',
    scarf:    c => `<path d="M18 33h12v4H18z" fill="${c}"/><path d="M27 36h4v9h-4z" fill="${c}" opacity=".9"/>`,
    backpack: c => `<rect x="6" y="36" width="5" height="17" rx="2" fill="${c}"/><rect x="37" y="36" width="5" height="17" rx="2" fill="${c}"/>`,
    cape:     c => `<path d="M12 35h24l4 21H8z" fill="${c}" opacity=".85"/>`,
  },
  handheld: {
    none:   () => '',
    book:   () => `<g><rect x="34" y="41" width="9" height="7" rx="1" fill="#b9452f"/><rect x="34" y="41" width="9" height="7" rx="1" fill="none" stroke="#7d2b1c"/><path d="M38.5 41v7" stroke="#f3e6d0"/></g>`,
    racket: () => `<g stroke="#7a5a2a" stroke-width="2" fill="none"><path d="M38 48v-4"/><ellipse cx="38" cy="39.5" rx="4.5" ry="5.5" fill="#e8e2d0"/></g>`,
    ball:   () => `<circle cx="39" cy="45" r="4.5" fill="#f2f2f2" stroke="#2b2b2b" stroke-width="1"/><path d="M39 41.5l1.8 1.6-.7 2.2h-2.2l-.7-2.2z" fill="#2b2b2b"/>`,
    wand:   () => `<g><rect x="37" y="37" width="2" height="12" rx="1" transform="rotate(12 38 43)" fill="#4a3520"/><path d="M41 35l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#ffd95e"/></g>`,
  },
  legs: {
    plain:  c => `<rect x="14" y="54" width="8" height="4" fill="${c}"/><rect x="26" y="54" width="8" height="4" fill="${c}"/>`,
    shorts: () => `<rect x="14" y="54" width="8" height="4" fill="#2f4f7a"/><rect x="26" y="54" width="8" height="4" fill="#2f4f7a"/>`,
    jeans:  () => `<rect x="14" y="54" width="8" height="5" fill="#33507a"/><rect x="26" y="54" width="8" height="5" fill="#33507a"/>`,
    skirt:  () => `<path d="M12 54h24l-2 4H14z" fill="#8a3a6b"/>`,
  },
};

/* Where each slot's art sits on the figure, so an item can be shown ALONE at a sensible crop.
   A shop card is selling one object, and a card-sized person wearing it makes the object the
   smallest thing on the card. */
const AV_CROP = {
  hair:      '10 6 28 20',
  headwear:  '11 10 26 14',
  faceware:  '13 19 22 12',
  shoulders: '4 31 40 26',
  handheld:  '32 32 14 20',
  legs:      '10 51 28 11',
};

/** Just the item, cropped to itself. Used by the shop. */
function itemArt(slot, id, size) {
  const fn = (AV_ART[slot] || {})[id];
  if (!fn) return '';
  // A neutral colour: these are shown off the figure, so there's no shirt or hair to inherit from.
  const art = fn('#5b6470');
  return `<svg class="av-item" viewBox="${AV_CROP[slot] || '0 0 48 56'}"
    width="${size || 64}" height="${size || 64}" aria-hidden="true">${art}</svg>`;
}

/** Read a stored avatar string — "skin:2|headwear:cap" — into an object. */
function avatarConfig(packed, handle) {
  // No choices made yet: the hash picks a starting look, so a new student has a face rather than
  // a blank. Everything below can then be changed.
  const h = hashOf(String(handle || '?'));
  const cfg = {
    skin: (h >>> 0) % AV_SKIN.length,
    hairColour: (h >>> 5) % AV_HAIR.length,
    shirt: 0,
    hair: 'crop', headwear: 'none', faceware: 'none', shoulders: 'none', handheld: 'none', legs: 'plain',
  };
  String(packed || '').split('|').forEach(pair => {
    const [k, v] = pair.split(':');
    if (!k || v === undefined) return;
    cfg[k] = /^\d+$/.test(v) ? Number(v) : v;
  });
  return cfg;
}

/** An <svg> figure for a person. Original geometry — nothing here is traced from anything. */
function avatarFor(handle, size, packed) {
  const c = avatarConfig(packed, handle);
  const skin  = AV_SKIN[c.skin % AV_SKIN.length];
  const hair  = AV_HAIR[c.hairColour % AV_HAIR.length];
  const shirt = AV_SHIRT[c.shirt % AV_SHIRT.length];
  const s = size || 46;

  const hairShape = ((AV_ART.hair || {})[c.hair] || AV_ART.hair.crop)(hair);

  const art = (slot, colour) => {
    const fn = (AV_ART[slot] || {})[c[slot]];
    return fn ? fn(colour) : '';
  };

  return `<svg class="avatar" viewBox="0 0 48 60" width="${s}" height="${Math.round(s * 60 / 48)}" aria-hidden="true">
    ${art('shoulders', shirt)}
    <rect x="14" y="12" width="20" height="20" rx="6" fill="${skin}"/>
    ${hairShape}
    ${art('headwear', hair)}
    <circle cx="20" cy="25" r="1.5" fill="#2b2b2b"/><circle cx="28" cy="25" r="1.5" fill="#2b2b2b"/>
    <path d="M21 29q3 2 6 0" stroke="#2b2b2b" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    ${art('faceware')}
    <rect x="20" y="32" width="8" height="4" fill="${skin}"/>
    <rect x="12" y="35" width="24" height="19" rx="3" fill="${shirt}"/>
    <rect x="8"  y="36" width="5" height="17" rx="2.2" fill="${shirt}"/>
    <rect x="35" y="36" width="5" height="17" rx="2.2" fill="${shirt}"/>
    ${art('legs', shirt)}
    ${art('handheld')}
  </svg>`;
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
    watchCardSizes(grid);
    grid.querySelectorAll(':scope > .card').forEach(card => {
      stickyStyle(card);                      // deterministic wobble; safe to re-run

      // WIDTH FOLLOWS CONTENT, everywhere.
      // A card asks for a width with data-span, but that's a floor rather than the answer: a note
      // holding forty rows shouldn't be the same width as one holding three just because nobody
      // remembered to widen it. So the content is measured and the card takes whichever is larger.
      // Measured from rows and characters rather than from rendered height, because height depends
      // on the width we're about to choose — asking would mean laying it out twice to find out.
      const rows = card.querySelectorAll(
        '.field-line, .slot, .check-row, .link-list li, .dir-row, .cl-msg-line').length;
      const chars = (card.innerText || '').length;
      const auto = (rows > 26 || chars > 1400) ? 3
                 : (rows > 10 || chars > 420)  ? 2
                 : 1;
      const asked = parseInt(card.dataset.span) || 1;
      const span = Math.max(1, Math.min(Math.max(asked, auto), cols));
      card.style.gridColumnEnd = span > 1 ? `span ${span}` : '';

      // Now measure height at the CHOSEN width (wider cards are shorter) and convert to a
      // row-span. offsetHeight, NOT getBoundingClientRect(): cards are slightly rotated (see
      // stickyStyle), and the rotated bounding box would blow the packing out.
      const h = card.offsetHeight;
      card.style.gridRowEnd = `span ${Math.max(1, Math.ceil((h + gap) / (rowH + gap)))}`;
    });
  });
}
/* A card that grows AFTER it's been laid out — a dropdown opening, a History expanding, a live
   quote gaining rows — keeps the row-span it was given at render time. The extra height then
   overflows into whatever sits beneath it, which is why an open dropdown covered the next
   section's search box.
   Watching each card for size changes fixes every case at once, including ones nobody has thought
   of yet: no need to hook the toggle event of each expandable thing and remember to hook the next
   one. Debounced, because a resize can cascade through several cards in a frame. */
let RESIZE_OBS = null;
function watchCardSizes(grid) {
  if (typeof ResizeObserver === 'undefined') return;
  if (!RESIZE_OBS) {
    let pending;
    RESIZE_OBS = new ResizeObserver(() => {
      clearTimeout(pending);
      // Re-pack on the next frame, after the browser has settled the new heights.
      pending = setTimeout(() => requestAnimationFrame(() => layoutGrid()), 60);
    });
  }
  grid.querySelectorAll(':scope > .card').forEach(c => RESIZE_OBS.observe(c));
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
          siblings: fresh.siblings ?? USER.siblings,
          avatar: fresh.avatar ?? USER.avatar,
          avatarItems: fresh.avatarItems ?? USER.avatarItems,
          profile: fresh.profile || USER.profile || null,
          kids: fresh.kids || USER.kids, parent: fresh.parent ?? USER.parent,
          topics: fresh.topics ?? USER.topics, friends: fresh.friends ?? USER.friends,
          handle: fresh.handle || USER.handle, xp: fresh.xp ?? USER.xp, credits: fresh.credits ?? USER.credits,
          highscore: fresh.highscore ?? USER.highscore, ttHighscore: fresh.ttHighscore ?? USER.ttHighscore,
          tick1: fresh.tick1 ?? USER.tick1, tick2: fresh.tick2 ?? USER.tick2, tick3: fresh.tick3 ?? USER.tick3,
          notepad: fresh.notepad ?? USER.notepad,
          todo: fresh.todo ?? USER.todo
        };
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      }
    } catch {}
  }

  // Back from an email confirmation link.
  if (params.get('verify')) {
    try {
      const d = await (await fetch(API, { method: 'POST', body: JSON.stringify({
        action: 'verifyEmail', token: params.get('verify') }) })).json();
      history.replaceState({}, '', location.pathname);
      const b = $('health-banner');
      if (b) {
        b.textContent = (d && d.success)
          ? '✅ Email confirmed' + (d.name ? ', ' + d.name : '') + ' — you can log in now.'
          : '⚠ ' + ((d && d.error) || 'That confirmation link did not work.');
        b.classList.remove('hidden');
      }
    } catch { history.replaceState({}, '', location.pathname); }
  }

  // Back from Stripe. The ref is checked against Stripe itself server-side before anything is
  // written, so landing on this URL by hand achieves nothing.
  if (params.get('paid') === '1' && params.get('ref')) {
    try {
      const d = await (await fetch(API, { method: 'POST', body: JSON.stringify({
        action: 'finalizePayment', ref: params.get('ref') }) })).json();
      history.replaceState({}, '', location.pathname);
      const b = $('health-banner');
      if (b) {
        b.textContent = (d && d.success)
          ? '✅ Payment received — your place is confirmed.'
          : '⚠ ' + ((d && d.error) || 'We could not confirm that payment. Please get in touch.');
        b.classList.remove('hidden');
      }
    } catch { history.replaceState({}, '', location.pathname); }
  } else if (params.get('paid') === '0') {
    history.replaceState({}, '', location.pathname);
  }


  // Returning after paying a share (?sharepaid=1&ref=...) → mark it paid, maybe confirm the class.
  const sharePaid = params.get('sharepaid') === '1' && params.get('ref');

  // If returning from Stripe checkout (?paid=1&ref=...), finalize the booking now.
  const justPaid = params.get('paid') === '1' && params.get('ref');
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
    checkStylesheet();
    renderHeaderAuth();
    renderCards('tutors', DATA.tutors);
    renderCards('venues', DATA.venues);
    renderClasses();
    renderLinks();
    renderShop();
    renderChecklist();
    renderTools();
    renderArcade();
    // The showcase arrives on its own, after everything else is on screen. It's the only part of
    // the payload that leaves Google Sheets, so it's the only part that can be slow for reasons
    // nothing else shares — and nothing on the page depends on it.
    loadGallery();
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
  // Wrapped, because tape is drawn with pseudo-elements and an <img> can't carry them. One place,
  // so every photo on the site is taped the same way.
  img: (src, style = '') => src
    ? `<span class="taped"><span class="taped-v"><img src="${drive(src)}" alt="" loading="lazy" onerror="this.closest('.taped')?.remove()"${style ? ` style="${style}"` : ''}></span></span>`
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
    // Rows, like every other fact on the card. A single run-on line in its own typography was the
    // last thing here that didn't look like the thing above it.
    const stats = (it.type === 'tutor' && (st.xp || it.highscore || st.credits))
      ? tpl.row('Level', esc(String(st.level)), '', '', 'fl-free')
        + tpl.row('XP', esc(String(st.xp)), '', '', 'fl-free')
        + tpl.row('Credits', esc(String(st.credits)), '', '', 'fl-free')
        + (it.highscore ? tpl.row('High score', esc(String(it.highscore)), '', '', 'fl-free') : '')
      : '';
    // Every action a card offers, in ONE stack, in normal flow. Share used to be absolutely
    // positioned in the corner while Edit/Log out sat in their own block, so the two collided
    // and landed on top of the photo. One list, one below the other, no overlap possible.
    // An admin can edit anyone. `data-person` names whose profile to open; absent means your own.
    const isPersonCard = it.type === 'tutor' || it.type === 'person';
    const actions = [
      isOwn ? `<span class="text-action edit-profile-btn" title="Edit your profile">✏️</span>` : '',
      (!isOwn && isPersonCard && isAdmin())
        ? `<span class="text-action edit-profile-btn" data-person="${esc(it.title)}" title="Edit ${esc(it.title)}">✏️</span>` : '',
      (it.type === 'venue' && isAdmin())
        ? `<span class="text-action edit-venue-btn" data-venue="${esc(it.title)}" title="Edit this venue">✏️</span>` : '',
      `<span class="text-action card-share-btn" title="Share ${esc(it.title)}"
         data-share-url="${esc(cardShareUrl(it.title))}" data-share-title="${esc(it.title)}">🔗</span>`,
      isOwn ? `<span class="text-action" id="logout-btn">Log out</span>` : '',
    ].filter(Boolean).join('');

    return `<div class="card${isOwn ? ' own-profile' : ''}" data-card-id="${it.id}" data-card-name="${esc(it.title)}"${it.type === 'venue' ? ` data-venue="${esc(it.title)}"` : ''}>
    <div class="card-actions">${actions}</div>
    ${(it.role === 'Student' && !it.image)
      ? `<div class="av-wrap">${avatarFor(it.handle || it.title, 64, it.avatar)}</div>`
      : tpl.img(it.image)}
    <h3>${esc(it.title)}</h3>
    <p class="sub">${esc(it.subtitle)}</p>
    ${it.role ? tpl.row('Role', esc(it.role), '', '', 'fl-free') : ''}
    ${(it.type === 'tutor' && Number(it.rate) > 0)
      // ONE rate row. A tutor's `constant` is their PAY; showing that publicly hands over your
      // margin in one subtraction, so everyone sees pay × markup — what an hour with this tutor
      // actually costs — and only an admin sees the pay behind it.
      // One number: what an hour with this tutor costs. Admins also see the margin, since the
      // tutor's pay is fixed and the difference is entirely yours.
      ? tpl.row('Rate', esc('£' + Number(it.rate).toFixed(2) + '/h'), '', '', 'fl-free')
      : ''}
    ${it.contact ? tpl.row('Contact', esc(it.contact), '', '', 'fl-free') : ''}
    ${it.warn ? `<p class="cl-blurb dir-warn">${esc(it.warn)}</p>` : ''}
    ${it.type === 'tutor' ? tpl.row('DBS', it.dbs ? '✅ Enhanced' : '—', '', '', 'fl-free') : ''}
    ${(it.type === 'tutor' && (() => {
      /* Confirmation goes stale on purpose. A profile nobody has looked at for a year is worse
         than an obviously incomplete one, because it reads as true — so the tick expires after a
         month and the tutor is asked again. */
      const when = it.detailsConfirmed ? parseDMY(it.detailsConfirmed) : null;
      const fresh = when && (Date.now() - when.getTime()) < 31 * 864e5;
      const mine = USER && norm(USER.name) === norm(it.title);
      if (fresh) return tpl.row('Details', '✅ Confirmed in the past month', '', '', 'fl-free');
      if (mine) return tpl.row('Details',
        `<label class="venue-here"><input type="checkbox" class="confirm-details-cb">
           <span class="note">Tick to confirm these are still correct</span></label>`, '', '', 'fl-free');
      return tpl.row('Details', '<span class="note">Not confirmed recently</span>', '', '', 'fl-free');
    })()) || ''}
    ${(() => {
      /* What an extra student costs with this tutor. It's the one pricing decision a tutor makes
         besides their rate, and it appeared only in a form and an admin list — not on the card
         where anyone would look for it.
         Shows what's ACTUALLY in play: their own figure, or the site default when they haven't
         set one, so a blank field and a real setting can't look the same. */
      if (it.type !== 'tutor') return '';
      const own = Number(it.extraSeat) || 0;
      const site = Number(((DATA.constants || {}).vars || {}).c) || 0;
      const inPlay = (own > 0 && own <= 2) ? own : site;
      if (!inPlay) return '';
      return tpl.row('Extra student',
        esc('+' + Math.round(inPlay * 100) + '% each') + (own ? '' : ' <span class="note">(default)</span>'),
        '', '', 'fl-free');
    })()}
    ${(it.type === 'tutor' && (it.minStudents || it.maxStudents)) ? tpl.row('Seats',
      esc([it.minStudents || 1, it.maxStudents || '—'].join(' – ')), '', '', 'fl-free') : ''}
    ${(it.focus && it.focus.length) ? tpl.row('Focus', esc(it.focus.join(', ')), '', '', 'fl-free') : ''}
    ${(it.type === 'venue' && isTutorRole()) ? tpl.row('I can teach here',
      `<label class="venue-here"><input type="checkbox" class="venue-comfort-cb"
         data-venue="${esc(it.title)}" ${(it.comfort || []).some(h => norm(h) === norm(USER && USER.handle)) ? 'checked' : ''}></label>`,
      '', '', 'fl-free') : ''}
    ${(it.type === 'venue' && (it.rooms || []).length) ? it.rooms.map(r =>
      tpl.row(r.name, esc('£' + r.rate + '/h' + (r.concession ? ' · concession £' + r.concession : '')
        + ' · seats ' + (r.min || 1) + '–' + (r.max || '?')), '', '', 'fl-free')).join('') : ''}
    ${(it.type === 'tutor' && (it.minHours || it.maxHours)) ? tpl.row('Session',
      esc([it.minHours || 1, it.maxHours || '—'].join(' – ') + ' hrs'), '', '', 'fl-free') : ''}
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

    /* The six rooms, always shown, always the same six. A venue has the spaces it has — asking
       someone to invent names produces "Room 2", "room2" and "Small Rm" across eleven venues, and
       a booking then can't tell which is which. Leave a slot blank and it isn't offered.
       Each carries its own rates, capacity AND opening hours: a library open all day whose large
       room is booked every morning is the normal case, not the exception. */
    const SLOTS = DATA.roomSlots || ['Small room 1', 'Small room 2', 'Medium room 1',
                                     'Medium room 2', 'Large room 1', 'Large room 2'];
    const byName = {};
    (v.rooms || []).forEach(r => { byName[norm(r.name)] = r; });

    const roomGrid = (name, room) => {
      const days = (DATA.availGrid || {}).days || [['m','Mon'],['tu','Tue'],['w','Wed'],
                     ['th','Thu'],['f','Fri'],['sa','Sat'],['su','Sun']];
      const hours = (DATA.availGrid || {}).hours || [9,10,11,12,13,14,15,16,17,18,19];
      const av = (room && room.avail) || {};
      return `<div class="avail-wrap"><table class="avail-grid"><tr><th></th>
        ${hours.map(h => `<th>${h}</th>`).join('')}</tr>
        ${days.map(([pre, label]) => `<tr><th>${label}</th>${hours.map(h => {
          const code = pre + String(h).padStart(2, '0');
          return `<td><input type="checkbox" class="room-av" data-room="${esc(name)}"
            data-code="${code}" ${/^(true|yes|1|✓)$/i.test(String(av[code] || '')) ? 'checked' : ''}></td>`;
        }).join('')}</tr>`).join('')}
      </table></div>`;
    };

    const roomBlock = (name) => {
      const r = byName[norm(name)] || {};
      const f = r.fields || {};
      const num = (key, label, val) => `<label class="pf-field">
        <span class="edit-label">${esc(label)}</span>
        <input class="room-f edit-input" data-room="${esc(name)}" data-f="${esc(key)}"
               value="${esc(String(val ?? ''))}" inputmode="decimal"></label>`;
      return `<details class="ve-slot"${r.rowIndex ? ' open' : ''}>
        <summary>${esc(name)}${r.rowIndex
          ? ` <span class="note">£${esc(String(r.rate || 0))}/h · seats ${esc(String(r.min || 1))}–${esc(String(r.max || '?'))}</span>`
          : ' <span class="note">not offered</span>'}</summary>
        <div class="ed-grid">
          ${num('rate_per_hour',   'rate £/h',        f.rate_per_hour ?? r.rate)}
          ${num('concession_rate', 'concession £/h',  f.concession_rate ?? r.concession)}
          ${num('min_capacity',    'min seats',       f.min_capacity ?? r.min)}
          ${num('max_capacity',    'max seats',       f.max_capacity ?? r.max)}
        </div>
        <p class="note t-left">Open hours for this room. Leave every box clear to use the venue's
          own hours below.</p>
        ${roomGrid(name, r)}
        <p class="note status-line" data-roomstatus="${esc(name)}"></p>
      </details>`;
    };

    const roomsSection = `<fieldset class="pf-group"><legend>Rooms</legend>
      <p class="note t-left">Fill in the rooms this venue has. Anything left blank isn't offered
        when booking.</p>
      ${SLOTS.map(roomBlock).join('')}
    </fieldset>`;

    return `<div class="card editing profile-edit-wide" data-span="99" data-venue="${esc(v.title)}">
      <h3 class="mb-md">Editing ${esc(v.title)}</h3>
      ${fieldSections}
      ${roomsSection}
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
  // Admin only: edit a shop item in place. Physical stock only — the avatar items live in the
  // code because they carry unlock rules as well as prices, so there is no sheet row to change.
  /* THE inline editor. Shop items, links and rooms are all "a sheet row with a few fields", so
     they share one form — `action` says where it saves, `groups` says what it shows. */
  rowEdit: (opts) => {
    const f = opts.values || {};
    const field = (name) => {
      const v = f[name] ?? '';
      const label = `<span class="edit-label">${esc(name.replace(/_/g, ' '))}</span>`;
      const input = name === 'description'
        ? `<textarea class="row-f edit-input" data-f="${esc(name)}" rows="2">${esc(v)}</textarea>`
        : `<input class="row-f edit-input" data-f="${esc(name)}" value="${esc(v)}">`;
      return `<label class="pf-field">${label}${input}</label>`;
    };
    return `<div class="res-edit hidden" data-row="${esc(String(opts.rowIndex))}"
                 data-action="${esc(opts.action)}" data-delete="${esc(opts.deleteAction || '')}">
      <div class="ed-grid">${Object.values(opts.groups).flat().map(field).join('')}</div>
      <div class="cl-acts">
        <span class="edit-status note grow"></span>
        ${opts.deleteAction ? `<span class="text-action row-delete" data-name="${esc(opts.name || '')}">Delete</span>` : ''}
        <span class="text-action res-done">Done</span>
      </div>
    </div>`;
  },

  shopEdit: (it) => {
    /* The field list comes from the backend so it stays in step with what's writable — but it must
       not DEPEND on it. Built from an empty payload this rendered a form with no fields in it,
       which reads as broken rather than as "the backend is older than the site". So there's a
       fallback list, and the values fall back to what the card already knows. */
    const groups = (DATA.shopFields && Object.keys(DATA.shopFields).length) ? DATA.shopFields : {
      'What it is': ['name', 'description', 'photo'],
      'Price':      ['price', 'currency', 'level_required'],
      'Wearable':   ['slot', 'art_id'],
      'Stock':      ['in_stock'],
    };
    // A bike has no slot and no artwork id. Rather than a second form, the fields that only make
    // sense for a wearable simply aren't drawn on a row that isn't one.
    const wearable = it.kind === 'avatar';
    // The row's own values if the backend sent them; otherwise the ones already on the card, so an
    // older backend still lets you edit what you can see.
    const f = (it.fields && Object.keys(it.fields).length) ? it.fields : {
      name: it.name, description: it.description || '', photo: it.image || '',
      price: it.price, currency: it.unit || '', in_stock: 'TRUE',
      level_required: it.level || '', slot: it.slot || '', art_id: it.artId || '',
    };
    const field = (name) => {
      const v = f[name] ?? '';
      const label = `<span class="edit-label">${esc(name.replace(/_/g, ' '))}</span>`;
      if (name === 'in_stock') {
        const on = !/^(false|no|0)$/i.test(String(v).trim()) && String(v).trim() !== '';
        return `<label class="pf-field pf-check">
          <input type="checkbox" class="shop-f" data-f="${esc(name)}" ${on ? 'checked' : ''}>${label}</label>`;
      }
      const input = name === 'description'
        ? `<textarea class="shop-f edit-input" data-f="${esc(name)}" rows="2">${esc(v)}</textarea>`
        : `<input class="shop-f edit-input" data-f="${esc(name)}" value="${esc(v)}">`;
      return `<label class="pf-field">${label}${input}</label>`;
    };
    // Without a sheet row there is nothing to write to, so say so rather than offering a form
    // that will fail on save.
    const row = it.rowIndex ?? it.id;
    const stale = !DATA.shopFields;
    return `<div class="res-edit hidden" data-row="${esc(String(row))}">
      ${stale ? `<p class="note">The backend is older than this page — deploy hermes.gs if saving fails.</p>` : ''}
      <div class="ed-grid">${Object.values(groups).flat()
        .filter(f => wearable || (f !== 'slot' && f !== 'art_id' && f !== 'level_required'))
        .map(field).join('')}</div>
      ${wearable ? `<p class="note">art_id decides the picture — change it only to one of the drawn
        shapes, or the item loses its artwork.</p>` : ''}
      <div class="cl-acts">
        <span class="edit-status note grow"></span>
        <span class="text-action shop-delete" data-row="${esc(String(row))}"
              data-name="${esc(it.name)}">Delete</span>
        <span class="text-action res-done">Done</span>
      </div>
    </div>`;
  },

  shopCard: (it) => {
    const bare = it.artId || String(it.id).replace(/^av-[a-z]+-/, '');
    const mine = (USER && USER.avatarItems || []).find(x => x.slot === it.slot && x.id === bare);
    const owned = it.kind === 'avatar' && mine && mine.unlocked;
    const level = statsOf(USER || {}).level;
    const tooLow = it.kind === 'avatar' && it.level && level < it.level;

    // The item alone, at its own crop. A whole figure would make the object the smallest thing on
    // a card that exists to sell that object.
    const preview = it.kind === 'avatar' ? `<div class="av-wrap">${itemArt(it.slot, bare, 78)}</div>`
                                          : (it.image ? tpl.img(it.image) : '');
    // A locked item shows what it TAKES rather than a price it can't be bought at.
    const cost = it.kind !== 'avatar' ? esc((it.unit || '') + it.price)
      : it.level ? 'Level ' + it.level
      : esc('🪙 ' + it.price);

    return `<div class="card t-left" data-card-name="${esc(it.name)}">
      ${isAdmin()
        ? `<div class="card-actions"><span class="text-action shop-edit-btn"
             data-row="${esc(String(it.rowIndex ?? it.id))}" title="Edit this item">✏️</span></div>` : ''}
      ${preview}
      <h3>${esc(it.name)}${it.inStock === false ? ' <span class="note">— out of stock</span>' : ''}</h3>
      ${tpl.row(it.level ? 'Unlocks at' : 'Price', cost, '', '', 'fl-free')}
      ${it.slot ? tpl.row('Slot', esc(it.slot), '', '', 'fl-free') : ''}
      ${it.description ? `<p class="desc">${escTokens(it.description)}</p>` : ''}
      ${(() => {
        if (!owned && tooLow) return `<p class="note">${esc(String((it.level * 10) - statsOf(USER || {}).xp))} more topics to go</p>`;
        const wearing = it.kind === 'avatar' && USER
          && avatarConfig(USER.avatar, USER.handle || USER.name)[it.slot] === bare;
        if (wearing) return '<p class="note">Wearing it</p>';
        const label = it.kind !== 'avatar' ? 'Buy' : (owned ? 'Equip' : 'Buy');
        return `<span class="text-action buy-item-btn" data-item="${esc(it.id)}" data-name="${esc(it.name)}"
             data-kind="${esc(it.kind || 'thing')}" data-slot="${esc(it.slot || '')}">${label}</span>`;
      })()}
      ${isAdmin() ? tpl.shopEdit(it) : ''}
    </div>`;
  },

  // Tutor's weekly timetable, rendered INSIDE their own profile card.
  // Built from their jobs; availability can slot into these lines later.
  timetableSection: (tutorName) => {
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
    return `<div class="card t-left" data-card-name="${esc(s.handle || s.name)}">
      ${isChild ? '' : `<button type="button" class="remove-friend-btn" data-handle="${esc(s.handle)}" title="Remove">✕</button>`}
      <div class="av-wrap">${avatarFor(s.handle || s.name, 56, s.avatar)}</div>
      <h3>${esc(s.name)}</h3>
      <p class="sub">${esc(s.handle)}</p>
      ${(s.siblings && s.siblings.length) ? tpl.row('Siblings', esc(s.siblings.join(', ')), '', '', 'fl-free') : ''}
      ${tpl.row('Level', esc(String(st.level)), '', '', 'fl-free')}
      ${tpl.row('XP', esc(String(st.xp)), '', '', 'fl-free')}
      ${tpl.row('Credits', esc(String(st.credits)), '', '', 'fl-free')}
      ${s.highscore ? tpl.row('High score', esc(String(s.highscore)), '', '', 'fl-free') : ''}
    </div>`;
  },

  // Arcade game card (Flappy-style canvas)
  gameCard: () => `<div class="card t-center" id="flappy-card">
    <h3 class="gold mb-sm">Flabby Pird</h3>
    <canvas id="flappy-canvas" width="280" height="360" style="width:100%;max-width:280px;background:#0a0a0a;border:1px solid var(--border);border-radius:8px;cursor:pointer"></canvas>
    <p style="margin:10px 0 0">Score: <b id="flappy-score" class="ink-strong">0</b>${canTrack() ? ` · Best: <b id="flappy-best" class="ink-gold">${USER.highscore || 0}</b>` : ''}</p>
    <p id="flappy-msg" class="muted" style="font-size:var(--fs-xs);min-height:14px;margin-top:6px">Click the game to start</p>
  </div>`,

  // Kid's checklist: ONE CARD PER GRADE (each its own card in the grid)
  // Compact GCSE calculator that fits in a card (basic + √, x², trig, brackets, π)
  // Student notepad tool — saves to the person's `notepad` cell. Any logged-in user.
  // Notepad is always visible (simplest design). Saves automatically as you type, like the tickboxes.
  notepadCard: () => `<div class="card t-left" id="notepad-card">
    <h3 class="gold mb-sm">Notepad</h3>
    <textarea id="notepad-text" class="notepad-area" placeholder="Jot notes here..." ${USER ? '' : 'disabled'}>${esc(USER?.notepad || '')}</textarea>
    <p class="muted" id="notepad-status" style="font-size:var(--fs-xs);margin:6px 0 0;min-height:1em">${USER ? '' : 'Log in to save your notes.'}</p>
  </div>`,

  // Month calendar tool — today highlighted, prev/next navigation.
  // A checklist. Stored as one text cell — a line per item, a leading "x " meaning done — because
  // that survives being read and edited in the sheet by hand, which a JSON blob would not.
  todoCard: () => {
    const lines = String(USER?.todo || '').split('\n').map(x => x.trim()).filter(Boolean);
    const rows = lines.map((l, i) => {
      const done = /^x\s+/i.test(l);
      const text = l.replace(/^x\s+/i, '');
      return `<label class="todo-row${done ? ' todo-done' : ''}">
        <input type="checkbox" class="todo-cb" data-i="${i}" ${done ? 'checked' : ''} ${USER ? '' : 'disabled'}>
        <span>${esc(text)}</span>
        <span class="todo-x" data-i="${i}" title="Remove">✕</span>
      </label>`;
    }).join('');
    return `<div class="card t-left" id="todo-card">
      <h3 class="mb-sm">Checklist</h3>
      <div class="todo-list">${rows || '<p class="note">Nothing on it yet.</p>'}</div>
      <input type="text" id="todo-new" class="todo-new" placeholder="${USER ? 'Add an item…' : 'Log in to use this'}" ${USER ? '' : 'disabled'}>
      <p class="note status-line" id="todo-status"></p>
    </div>`;
  },

  /* The wardrobe. Every slot, every item, with locked ones showing what they'd cost — a catalogue
     you can see is what makes levelling up mean something, where a list of only what you own tells
     you nothing about what's next.
     Buying and equipping are ONE action: a credit is spent at the moment the item goes on, so a
     failed request can never leave someone poorer than it found them. */
  /* The wardrobe, as a section. `who` is whose avatar it is; `editable` says whether the person
     looking at it may change it — an admin can SEE what a student is wearing without dressing them,
     which is the difference between oversight and interference. */
  avatarSection: (who, packed, items, editable) => {
    const cfg = avatarConfig(packed, who);

    items = items || [];
    const swatches = (field, colours) => `<div class="av-swatches">
      ${colours.map((col, i) => `<span class="av-sw${cfg[field] === i ? ' on' : ''}"
        style="background:${col}" data-field="${field}" data-value="${i}"></span>`).join('')}
    </div>`;

    const SLOTS = [['hair','Hairstyle'], ['headwear','Headwear'], ['faceware','Face'],
                   ['shoulders','Shoulders'], ['handheld','Holding'], ['legs','Legs']];
    const slotRow = ([slot, label]) => {
      const mine = items.filter(x => x.slot === slot);
      if (!mine.length) return '';
      return `<div class="av-slot">
        <div class="av-slot-name">${esc(label)}</div>
        <div class="av-opts">${mine.map(it => {
          const on = cfg[slot] === it.id;
          const why = it.unlocked ? '' : (it.cost ? it.cost + ' cr' : 'Lv ' + it.level);
          return `<span class="av-opt${on ? ' on' : ''}${it.unlocked ? '' : ' locked'}"
            data-slot="${esc(slot)}" data-id="${esc(it.id)}"
            title="${esc(it.name + (why ? ' — ' + why : ''))}">${esc(it.name)}${
            why ? `<b class="av-why">${esc(why)}</b>` : ''}</span>`;
        }).join('')}</div>
      </div>`;
    };

    return `<fieldset class="pf-group" id="avatar-section">
      <legend>Avatar</legend>
      <div class="av-wrap">${avatarFor(who, 110, packed)}</div>
      ${editable ? `
        <div class="av-slot"><div class="av-slot-name">Skin</div>${swatches('skin', AV_SKIN)}</div>
        <div class="av-slot"><div class="av-slot-name">Hair colour</div>${swatches('hairColour', AV_HAIR)}</div>
        <div class="av-slot"><div class="av-slot-name">Shirt colour</div>${swatches('shirt', AV_SHIRT)}</div>
        ${SLOTS.map(slotRow).join('')}
        <p class="note status-line" id="av-status"></p>`
      : `<p class="note t-left">Wearing: ${esc(SLOTS.map(([sl, lb]) => {
            const it = items.find(x => x.slot === sl && x.id === cfg[sl]);
            return it && it.id !== 'none' && it.id !== 'plain' ? it.name : '';
          }).filter(Boolean).join(', ') || 'nothing yet')}</p>`}
    </fieldset>`;
  },

  /* THE FEED — one thing worth knowing, in the shape of a phone.
     Deliberately NOT a scroll. It shows one card and asks you to move to the next, because the
     whole point of borrowing this shape is to borrow the attention it commands and spend it on
     something that leaves you better off. An endless column would be the same trap with a
     different label on it.
     The backgrounds are drawn from the card's own text, so a new row in the sheet arrives with a
     look of its own and nobody has to choose one. */
  /* The phone IS the card. It was a phone drawn on a sticky note, which is two objects standing
     for one thing — and the note's paper, pin and tilt all belonged to the wrong one.
     No counter and no arrows either: a feed has no length to be three-elevenths of the way
     through, and the shape being borrowed has never had a pair of chevrons under it. */
  feedCard: () => `<div class="card feed-card" id="feed-card" data-span="2">
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="phone-screen" id="feed-screen"></div>
      </div>
    </div>`,

  /** One card in the phone. The look comes from the text, so every row is its own without asking. */
  feedSlide: (it) => {
    const h = hashOf(String(it.id || it.heading));
    const hue = h % 360;
    const hue2 = (hue + 90 + (h >> 8) % 140) % 360;   // a wide spread, so the two never muddy
    const ang = (h >> 16) % 360;

    /* A DRAWN background — nothing to license, nothing to load, and it can never be the wrong
       photograph for the words on top of it. Three layers, because one gradient is a colour and
       three are a picture: a deep base, a light source somewhere off-centre, and a motif that
       belongs to the subject. */
    const MOTIF = {
      Physics:  '<circle cx="50" cy="30" r="26" /><circle cx="50" cy="30" r="40" /><circle cx="50" cy="30" r="54" />',
      Biology:  '<path d="M10 70 Q30 20 50 70 T90 70" /><path d="M10 88 Q30 38 50 88 T90 88" />',
      Language: '<path d="M12 78 h76" /><path d="M12 60 h58" /><path d="M12 42 h68" /><path d="M12 24 h40" />',
      History:  '<path d="M50 8 v84" /><path d="M22 30 h56" /><path d="M30 62 h40" />',
      Geography:'<ellipse cx="50" cy="50" rx="42" ry="42" /><ellipse cx="50" cy="50" rx="16" ry="42" /><path d="M8 50 h84" />',
      Study:    '<rect x="18" y="22" width="64" height="14" /><rect x="18" y="46" width="64" height="14" /><rect x="18" y="70" width="40" height="14" />',
      Music:    '<path d="M34 74 V22 l34 -8 v52" /><circle cx="28" cy="76" r="8" /><circle cx="62" cy="66" r="8" />',
      Art:      '<circle cx="38" cy="38" r="24" /><circle cx="62" cy="58" r="24" />',
      Maths:    '<path d="M20 80 L50 20 L80 80 Z" /><path d="M35 50 h30" />',
    };
    const key = Object.keys(MOTIF).find(k => String(it.subject || '').indexOf(k) === 0) || 'Maths';

    return `<div class="feed-slide" style="--a:${hue};--b:${hue2};--ang:${ang}deg">
      <div class="feed-art" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="feed-motif">
          <g fill="none" stroke="#fff" stroke-width="1.1">${MOTIF[key]}</g>
        </svg>
      </div>
      <div class="feed-text">
        ${it.subject ? `<span class="feed-tag">${esc(it.subject)}</span>` : ''}
        <h4>${esc(it.heading)}</h4>
        <p>${escTokens(it.body)}</p>
        ${it.link ? `<a class="feed-src" href="${esc(it.link)}" target="_blank"
            rel="noopener">open the resource ↗</a>` : ''}
      </div>
      <span class="feed-credit"></span>
    </div>`;
  },

  calendarCard: () => `<div class="card t-left" id="calendar-card">
    <div class="row-between mb-sm">
      <span class="text-action" onclick="calShift(-1)">‹</span>
      <h3 class="gold" id="cal-label" style="margin:0">Calendar</h3>
      <span class="text-action" onclick="calShift(1)">›</span>
    </div>
    <div id="cal-body" class="cal-grid"></div>
  </div>`,

  // Times-tables sprint: 60 seconds, random questions up to 12×12. Score = correct answers.
  timesTableCard: () => `<div class="card t-left" id="tt-card">
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
  timerCard: () => `<div class="card t-left" id="timer-card">
    <h3 class="mb-sm">Timer</h3>
    <p id="timer-display">25:00</p>
    <div class="row-gap">
      <button type="button" id="timer-toggle">&#9654;</button>
      <button type="button" id="timer-reset">&#8635;</button>
    </div>
    <p id="timer-msg" class="note status-line t-center"></p>
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
      <button type="button" class="mc-btn" data-mc="7" aria-label="7">7</button>
      <button type="button" class="mc-btn" data-mc="8" aria-label="8">8</button>
      <button type="button" class="mc-btn" data-mc="9" aria-label="9">9</button>
      <button type="button" class="mc-btn op" data-mc="/" aria-label="divide">÷</button>
      <button type="button" class="mc-btn" data-mc="4" aria-label="4">4</button>
      <button type="button" class="mc-btn" data-mc="5" aria-label="5">5</button>
      <button type="button" class="mc-btn" data-mc="6" aria-label="6">6</button>
      <button type="button" class="mc-btn op" data-mc="*" aria-label="multiply">×</button>
      <button type="button" class="mc-btn" data-mc="1" aria-label="1">1</button>
      <button type="button" class="mc-btn" data-mc="2" aria-label="2">2</button>
      <button type="button" class="mc-btn" data-mc="3" aria-label="3">3</button>
      <button type="button" class="mc-btn op" data-mc="-" aria-label="minus">−</button>
      <button type="button" class="mc-btn" data-mc="0" aria-label="0">0</button>
      <button type="button" class="mc-btn" data-mc="." aria-label="point">.</button>
      <button type="button" class="mc-btn eq" data-mc="=" aria-label="equals">=</button>
      <button type="button" class="mc-btn op" data-mc="+" aria-label="plus">+</button>
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
      // The declared list, then anything already in use that isn't on it. Without the second half
      // you can't pick "Paper 2" on a sheet full of Paper 2s, because nobody added it to options.
      const declared = lists[which[f]] || [];
      const inUse = (DATA.resourceInUse || {})[f] || [];
      const merged = declared.concat(inUse.filter(x => !declared.some(d => norm(d) === norm(x))));
      const opts = merged.length ? merged : null;
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
        ${tp.pages ? `<span class="check-pages" title="${esc(tp.pages)} pages">${esc(tp.pages)}pp</span>` : ''}
        ${isAdmin() ? `<span class="text-action res-edit-btn" data-row="${tp.rowIndex}" title="Relabel this resource">✏️</span>` : ''}
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

      /* The extra-seat fraction. Labelled plainly, because "extra seat rate" in an empty box reads
         as pounds — and 5 typed in here would mean each extra student costs 500% more. */
      if (colName === 'extra_seat_rate') {
        const f = parseFloat(v);
        /* Say what is ACTUALLY in play, not just what's typed. A value the pricing rejects looked
           identical to one it uses — the field showed 1, the price ignored it, and nothing
           connected the two. */
        const siteDefault = Number(((DATA.constants || {}).vars || {}).c) || 0;
        const inPlay = (f > 0 && f <= 2) ? f : siteDefault;
        const eg = !isNaN(f) && f > 0 && f > 2
          ? `${f} isn't a fraction — a second student can't cost ${f}× the first. Ignored; the site default of ${siteDefault} applies.`
          : (inPlay > 0
              ? `In use: a second student adds ${Math.round(inPlay * 100)}%, a third ${Math.round(inPlay * 200)}%.`
                + (f > 0 ? '' : ` (the site default — set your own to change it)`)
              : 'Nothing extra is charged for additional students.');
        return `<label class="pf-field">
          <span class="edit-label">extra student</span>
          <input data-pf="extra_seat_rate" class="edit-input" value="${esc(String(v))}"
                 inputmode="decimal" placeholder="0.2">
          <span class="note">A FRACTION, not pounds. 0.2 means a second student adds 20%.
            ${esc(eg)}</span>
        </label>`;
      }

      /* Roles: a multi-select. Holding two is normal — a parent who also tutors, an admin who
         teaches — so this is "choose any number", which is exactly what a select with `multiple`
         is for. Ctrl/Cmd-click, or tap on a phone. */
      if (colName === 'role') {
        const held = String(v).split(/[,\n]/).map(x => x.trim().toLowerCase()).filter(Boolean);
        const ALL = [['admin', 'Admin'], ['tutor', 'Tutor'],
                     ['client', 'Client'], ['student', 'Student']];
        return `<label class="pf-field">
          <span class="edit-label">roles</span>
          <select class="role-ms edit-input" data-pf="role" multiple size="4" ${ro ? 'disabled' : ''}>
            ${ALL.map(([id, label]) => `<option value="${id}"${held.includes(id) ? ' selected' : ''}>${esc(label)}</option>`).join('')}
          </select>
          <span class="note">Hold Ctrl (or Cmd) to pick more than one.</span>
        </label>`;
      }
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

    // Students get their wardrobe inside their own profile. An admin opening a student sees the
    // same figure and what they're wearing, but no controls — dressing somebody else's avatar
    // isn't oversight, and the unlocks are theirs to have earned.
    // Anyone with a face gets a wardrobe. It used to be students only, which left a parent with a
    // picture they couldn't change.
    const avatarBlock = (editRole === 'kid' || editRole === 'parent')
      ? (EDIT_TARGET
          ? tpl.avatarSection(EDIT_TARGET.name, (EDIT_TARGET.profile || {}).avatar,
                              EDIT_TARGET.avatarItems || [], false)
          : tpl.avatarSection(USER.handle || USER.name, USER.avatar,
                              DATA.avatarItems || USER.avatarItems || [], true))
      : '';

    // "Venues I teach at" — the tutor ticks venues they're comfortable at. Each tick writes
    // their handle into that VENUE's comfort list (like a checklist), saved instantly.
    const myHandle = String(p.username || USER?.handle || '').toLowerCase().trim();
    const venueTicks = (DATA.venues || []).map(v => {
      const on = (v.comfort || []).some(h => String(h).toLowerCase().trim() === myHandle);
      return `<label class="ms-opt"><input type="checkbox" class="venue-comfort-cb" data-venue="${esc(v.title)}" ${on ? 'checked' : ''}> ${esc(v.title)}</label>`;
    }).join('');
    // Removed from the profile: a tutor says which venues suit them ON the venue cards, where
    // they can see the place they're agreeing to. A checklist of names in a form asked them to
    // remember eleven buildings.
    const comfortSection = false && (isTutorRole() && (DATA.venues || []).length)
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

    return `<div class="card own-profile editing profile-edit-wide" data-span="99"
                 data-target="${esc(EDIT_TARGET ? EDIT_TARGET.name : (USER ? USER.name : ''))}"
                 data-target-id="${esc(EDIT_TARGET ? (EDIT_TARGET.personId || '') : (USER ? (USER.personId || '') : ''))}">
      <h3 class="gold mb-md">${EDIT_TARGET
        ? 'Editing ' + esc(EDIT_TARGET.name) : 'Editing your profile'}</h3>
      ${sections}
      ${avatarBlock}
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
    const canJoin = USER && !isTutorRole() && !hasRole('kid') && !mySlot && emptySlot && status === 'Active';

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
    // Shown to everyone, logged in or not. A visitor looking at a live class is looking at
    // somebody else's — "Others" is the true answer, and hiding the row made the card change
    // shape depending on whether you were signed in.
    const possession = badge(isMine ? 'Yours' : 'Others');

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

    // ---- THE ROSTER ---------------------------------------------------------------------------
    // Built like a fireteam: a fixed column of rectangular slots, filled ones showing who's in
    // them, empty ones showing a +. Every decision happens ON a slot — ✓ to accept, ✕ to decline
    // or leave, + to put yourself in one. That replaced a dropdown of verb names plus a Submit
    // button, which made you read a list of words to work out what was possible; a roster shows
    // it. Nobody has to be told what a plus on an empty slot does.
    //
    // Both sides are the same component, because both sides are doing the same thing: a tutor
    // ticks a family in, a family ticks a tutor in. One shape, read the same way by everyone.

    const myTutorSlot = (j.tutorSlots || []).find(x => norm(x.name) === norm(USER && USER.name));
    const iAmTutorHere = !!myTutorSlot || isTutor;
    // Being IN the roster and being the tutor OF the class are different things. An applicant is
    // the one being judged — they don't get to judge the family back. Only the confirmed tutor
    // decides who joins, because only they have a class for anyone to join.
    const iAmConfirmedTutor = isTutor || (!!myTutorSlot && /confirm/i.test(myTutorSlot.status || ''));
    const meRow = mySlot || (myTutorSlot ? { client: myTutorSlot.name, status: myTutorSlot.status }
                          : (isTutor ? { client: USER && USER.name, status: 'Accepted' } : null));
    const myActs = meRow
      ? bmActionsFor(iAmTutorHere ? 'tutor' : 'client', String(meRow.status || ''), String(theirT || ''))
      : [];

    // One slot, and every action that concerns a person lives ON their row as a single emoji.
    // `btns` is a list of [glyph, class, title] so a new action is one entry rather than new
    // markup and new CSS — which is how Pay ended up as a text link in its own strip below,
    // styled differently from everything else on the card.
    const slot = (o) => `<div class="slot${o.mine ? ' slot-mine' : ''}">
        <div class="slot-line">
          <span class="slot-name">${esc(o.name)}</span>
          ${o.status ? `<span class="slot-state">${badge(o.status)}</span>` : ''}
          ${(o.btns || []).length ? `<span class="slot-acts">${(o.btns || []).map(([g, c, title]) =>
            `<span class="slot-btn ${c}" data-job="${j.id}" data-who="${esc(o.name)}"
               data-side="${o.side}" title="${esc(title)}">${g}</span>`).join('')}</span>` : ''}
        </div>
        ${o.said ? `<div class="slot-said">${esc(o.said)}</div>` : ''}
        ${o.note || ''}
      </div>`;

    const addSlot = (side, label) => `<div class="slot slot-empty">
      <span class="slot-btn slot-add" data-job="${j.id}" data-side="${side}" title="${esc(label)}">＋</span>
      <span class="slot-hint">${esc(label)}</span>
    </div>`;

    // Every row carries its own note box — that IS the chat, sitting with the person who wrote
    // it rather than in a thread underneath. A tutor asking for two seats types it on their row;
    // the family reads it there and edits the terms from theirs.
    const noteBox = (who, side, mine) => mine
      ? `<input type="text" class="move-text slot-say" data-job="${j.id}" data-who="${esc(who)}"
           data-side="${side}" placeholder="Say something…">` : '';
    const lastSaid = who => {
      const said = (j.events || []).filter(e => norm(e.actor) === norm(who) && e.action === 'Say');
      return said.length ? said[said.length - 1].message : '';
    };

    const clientRows = (j.slots || []).filter(x => x.client).map(x => {
      const isMe = !!mySlot && norm(x.client) === norm(mySlot.client);
      const btns = [];
      // Your own row: ready up, pay, change the terms, leave.
      if (isMe && myActs.includes('Accept'))   btns.push(['✓', 'slot-ready', 'Ready — accept the terms as they stand']);
      if (isMe && myActs.includes('Pay'))      btns.push(['💳', 'slot-pay', 'Pay now']);
      if (isMe && myActs.includes('Edit'))     btns.push(['✏️', 'slot-edit', 'Change the terms']);
      if (isMe && myActs.includes('Withdraw')) btns.push(['✕', 'slot-no" data-leave="1', 'Leave this session']);
      // The confirmed tutor decides on a family still asking to join.
      if (!isMe && iAmConfirmedTutor && String(x.status) === 'Waiting') {
        btns.push(['✓', 'slot-yes', 'Accept ' + x.client]);
        btns.push(['✕', 'slot-no', 'Decline ' + x.client]);
      }
      return slot({ name: x.client, status: x.status, side: 'client', mine: isMe, btns,
                    said: lastSaid(x.client), note: noteBox(x.client, 'client', isMe) });
    }).join('');

    const tutorRows = (j.tutorSlots || []).map(x => {
      const isMe = !!myTutorSlot && norm(x.name) === norm(myTutorSlot.name);
      const settled = /confirm/i.test(x.status || '');
      const btns = [];
      if (isMe && myActs.includes('Accept'))   btns.push(['✓', 'slot-ready', 'Ready — accept the terms as they stand']);
      if (isMe && myActs.includes('Withdraw')) btns.push(['✕', 'slot-no" data-leave="1', 'Withdraw']);
      // The family picks from the applicants; that single ✓ is what settles who teaches.
      if (!!mySlot && !isMe && !settled) {
        btns.push(['✓', 'slot-yes', 'Choose ' + x.name]);
        btns.push(['✕', 'slot-no', 'Decline ' + x.name]);
      }
      return slot({ name: x.name, status: x.status, side: 'tutor', mine: isMe, btns,
                    said: lastSaid(x.name), note: noteBox(x.name, 'tutor', isMe) });
    }).join('');

    // Empty slots, shown only to someone who could actually fill one.
    const roomForClient = (j.spotsLeft || 0) > 0;
    const canJoinAsClient = USER && !isTutorRole() && !hasRole('kid') && !mySlot && roomForClient;
    const canApplyAsTutor = isTutorRole() && !iAmTutorHere && TRUEish(j.stealable)
      && tStatus !== 'Confirmed' && (j.tutorSlots || []).length < 3;

    const roster = `<div class="slots">
      ${clientRows}
      ${canJoinAsClient ? addSlot('client', 'Ask to join') : ''}
      ${(tutorRows || canApplyAsTutor) ? '<div class="slot-div">Tutor</div>' : ''}
      ${tutorRows}
      ${canApplyAsTutor ? addSlot('tutor', 'Apply to teach') : ''}
    </div>`;

    // No message box. It sat under every roster whether or not anything could be sent, and a
    // free-text note attached to a tick is not how anyone reads a party list. Anything that needs
    // saying belongs in the History, which records what happened without asking for prose.
    const extras = (!USER && !isDash)
      ? [`<span class="text-action book-btn-inline${j.spotsLeft <= 0 ? ' disabled' : ''}">${
          j.spotsLeft <= 0 ? 'Full' : 'Book now'}</span>`]
      : [];

    // The record. Collapsed — it's for when something looks wrong, not for every load.
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
          data-share-url="${esc(cardShareUrl(j.title || 'Session'))}" data-share-title="${esc(j.title || 'Session')}">🔗</span>
      </div>
      ${(j.image || j.image2) ? `<div class="job-photos">${j.image ? tpl.img(j.image) : ''}${j.image2 ? tpl.img(j.image2) : ''}</div>` : ''}
      <h3>${esc(j.title) || 'Session'}</h3>
      <div class="job-detail">${detail}</div>
      ${roster}
      ${extras.length ? `<div class="cl-acts">${extras.join('')}</div>` : ''}
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
  /* FIVE cells: label, value, % change, £/h change, total.
     A multiplier and a fixed amount are different kinds of number and were sharing one column, so
     "+30%" and "+ £15.00/h" appeared in the same place and had to be read carefully to tell apart.
     Given their own columns they line up down the card: every percentage under every other
     percentage, every hourly figure under every other one, and the totals on the right.
     `row` keeps its old four-argument shape and leaves the percentage column empty, so the twenty
     rows that don't need it were not touched. */
  /* SIX cells: label · value · ×multiplier · %change · £/h change · total.
     Two genuinely different operations were sharing one column:
       a % that changes the HOURLY RATE  — subject, level, extra seats
       a × that multiplies the FINISHED TOTAL — length, term, split, bulk, advance
     "+1%" and "×11 sessions" in the same place made the arithmetic impossible to follow, because
     reading down the column meant switching between two kinds of number without being told.
     Now each has a column, and a row is only ever in one of them. */
  /* FIVE cells: label · value · ×multiplier · £/h · total.
     The percentage column was removed because it never said anything the multiplier didn't:
     "× 1.01" and "+1%" are the same fact written twice, and a column that only restates its
     neighbour costs width and earns nothing. The argument is kept in the signature so callers
     don't all have to change; it's ignored. */
  /* SIX cells: label · value · × · ±£/h · running £/h · running total.
     The running RATE and the running TOTAL were sharing one column, so it held £14.14/h on one row
     and £4,807.44 on another — two different units under one heading, which is exactly the mixing
     that made the card hard to read. They're separate columns now, and each row fills whichever
     one it actually produces. */
  /* FIVE cells: label · value · × · ±£/h · running.
     ONE running column, carrying every row. It was split in two — a running rate and a running
     total — because they're different units, but the "/h" on the rate rows already says which is
     which, and a single column reads as one continuous chain where two read as two half-finished
     ones. The signature keeps both arguments; whichever is filled goes in the same place. */
  row6: (k, valueHtml, mulHtml, rateHtml, runHtml, totalHtml, cls) => {
    const run = runHtml || totalHtml || '';
    // A row with no money drops to two columns so its value isn't crushed. `fl-cols` opts back in:
    // Status and Lifecycle carry no money but belong in the same column as everything above them.
    const money = /fl-cols/.test(cls || '')
      || [mulHtml, rateHtml, run].some(x => (x || '') !== '');
    return `<div class="field-line ${money ? '' : 'fl-plain '}${cls || ''}">` +
      `<span class="fl-k">${esc(k)}</span><span class="fl-v">${valueHtml}</span>` +
      (money ? `<span class="fl-mul">${mulHtml || ''}</span>` +
               `<span class="fl-r">${rateHtml || ''}</span>` +
               `<span class="fl-p">${run}</span>` : '') +
      `</div>`;
  },

  row4: (k, valueHtml, pctHtml, rateHtml, totalHtml, cls) =>
    tpl.row6(k, valueHtml, '', pctHtml, rateHtml, totalHtml, cls),

  row: (k, valueHtml, rateHtml, totalHtml, cls) => {
    // A row with no money in it (Status, Role, Possession, Contact) drops to two columns.
    // Keeping four meant the two empty ones still claimed width, so in a one-column card the
    // value column was crushed to a few pixels and its contents wrapped one letter per line —
    // "A / d / m / i / n". Deciding this here rather than at each call site is the point: no
    // caller can forget, and no future row can reintroduce it.
    return tpl.row4(k, valueHtml, '', rateHtml, totalHtml, cls);
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
    // A multiplier reads as the percentage it adds. "x1.01" is correct and useless — you have to
    // do the subtraction yourself to learn it's 1% more.
    const mult = x => (!x || Number(x) === 1) ? '—'
      : (Number(x) > 1 ? '+' : '−') + Math.abs(Math.round((Number(x) - 1) * 1000) / 10) + '%';
    // What that percentage is WORTH here, in money, for the total column. A multiplier with an
    // empty money column was the one row you couldn't cost.
    const multMoney = (x, of) => (!x || Number(x) === 1) ? '—'
      : ((Number(x) > 1 ? '+ ' : '− ') + money(Math.abs(of * (Number(x) - 1)) * (F || 1) * H));
    // Editable rows get placeholders keyed by name; calc() refreshes them in place, because
    // re-rendering the block would drop keyboard focus and close the subject dropdown.
    const cell = (key, html) => ed ? `<span data-${key}>${html}</span>` : html;
    const rateCell = (key, x) => cell('rate="' + key + '"', rate(x));
    const totCell  = (key, x, atCost) => cell('total="' + key + '"', tot(x, atCost));

    const ctl = (cls, extra) => `<select class="pick ${cls}" data-lesson="${i}"></select>${extra || ''}`;
    const free = x => x ? '' : 'fl-free';
    // Kept apart on purpose: (ΣSᵢ)/k and s(k−1) are two different charges that both come from the
    // subjects, and adding them into one row hid the second entirely. With one subject the second
    // is always zero — so on a single-subject booking there is nothing to see, and on a two-subject
    // one a charge appears from nowhere unless it has a line of its own.
    const subjectAdd = (L.avgSubject || 0);
    const rows = [];


    /* Tuition and Tutor were two rows saying one thing. The rate IS the tutor's — changing the
       tutor is the only way to change it — so the chooser belongs on the row whose number it
       decides, rather than several rows below where the connection has to be inferred. */
    /* EVERY PRICED ROW, from the one table. Grouped by what a row does to the price: the shape of
       the booking first (it multiplies everything below), then what builds the hourly rate, then
       the discounts that scale the finished total.
       Nothing here knows about any individual row — adding one is an entry in PRICE_ROWS. */
    /* The dates the booking produces. Derived here, before the rows are built, because the Dates
       row now sits with the days that generate it rather than at the foot of the card. */
    const dateList = (L.sessionDates || []).map(d => fmtDate(d)).filter(Boolean);
    const datesText = dateList.length
      ? dateList.join(', ')
      : String(o.datesText || '').split(',').map(x => fmtDate(x.trim())).filter(Boolean).join(', ');

    /* The subject picker is the only control that isn't a plain <select> — a multi-select needs a
       display span and a dropdown, so it's named here rather than described in the table. */
    const subjectPicker = `<span class="custom-select-wrapper">
      <span class="inline-select pick l-subject-display" data-lesson="${i}">${NONE_LABEL}</span>
      <span class="custom-dropdown hidden l-subject-dropdown" data-lesson="${i}"></span>
    </span>`;

    const fmt = { money, esc, pct: mult };
    const controlFor = (r) => {
      // Not editable: the value is DERIVED, so it must be addressable — otherwise it renders once
      // from an empty price object and never changes again.
      if (!ed) return `<span data-val="${r.key}">${esc(r.value ? r.value(L) : '')}</span>`;
      if (r.control === 'subject-picker') return subjectPicker;
      if (r.control === 'split-emails')
        return `<span class="split-emails" data-lesson="${i}"></span>`;
      if (r.control === 'host-toggle')
        return `<label class="host-toggle"><input type="checkbox" class="l-host"
                 data-lesson="${i}"> I'll provide the space</label>`;
      // Editable, but no control of its own — a count the client doesn't set directly, like how
      // many extra subjects follow from the subjects they chose. Derived, so addressable.
      if (!r.control) return `<span data-val="${r.key}">${esc(r.value ? r.value(L) : '')}</span>`;
      return ctl(r.control, r.suffix || '');
    };

    /* Each group is ruled off from the next. They aren't a tidy grouping — they're three
       different operations on the price, and the card was running them together as one list:
         shape     multiplies the finished total   — how long, how many sessions, shared how ways
         rate      builds the hourly rate          — who teaches it, what, where
         discount  scales the finished total again
       A rule between them says that reading down is not one continuous sum. */
    /* WHAT, then WHEN, then what that timing earns off.
       The rate section answers what you're booking — subject, level, who teaches it, where. The
       shape section answers when and how much of it. That's the order the decisions are actually
       made in: the day grid can't even be filled until a venue is chosen, because the venue
       decides which hours are open.
       Discounts come last of the three because their input is the shape above them — how many
       sessions were ticked is what decides whether bulk applies at all. */
    ['rate', 'shape'].forEach(group => {
      const inGroup = PRICE_ROWS.filter(r => r.group === group);

      /* The day grid opens the shape section, and the rows that DEPEND on it follow. Ticking days
         is what produces a session count, so Time interval's "× 11" reads as a consequence of the
         rows above it rather than a promise made before them. */
      if (group === 'shape' && ed) {
        rows.push(`<div class="slots-hint-row"><span class="note l-slots-note"
          data-lesson="${i}"></span></div>`);
        SLOT_DAYS.forEach(([prefix, label], di) => {
          // Just the boxes. A count beside them repeated what the ticks already show, and needed
          // a bracket to explain what the seven figures were doing.
          rows.push(tpl.row6(label,
            `<span class="l-slots-day" data-lesson="${i}" data-day="${prefix}"></span>`,
            '', '', '', '', 'fl-day'));
        });

        /* The sum of the days, and the only multiplier among them. Seven rows each reading "× 4"
           claimed seven multiplications where there is one — the days add up, and their total is
           what the price multiplies by. */
        rows.push(tpl.row6('Hours a week', '',
          cell('mul="hoursweek"', ''), '', '',
          // It had no total cell at all, so the running figure had nowhere to land and the chain
          // broke exactly where the hours enter it.
          cell('total="hoursweek"', ''), 'fl-day fl-day-sum'));
      }

      inGroup.forEach((r, gi) => {
        const isLast = gi === inGroup.length - 1;
        // Every row is shown, always. A discount that isn't discounting still explains why — and
        // hiding it meant the bulk and advance rules were invisible on every booking that didn't
        // happen to trigger them, which is most of them.
        if (r.show && !r.show(L) && !ed && r.group !== 'discount') return;
        const c = priceCells(r, L, fmt);
        rows.push(tpl.row6(r.label, controlFor(r),
          cell(`mul="${r.key}"`,   c.mul),
          cell(`rate="${r.key}"`,  c.rate),
          '',
          cell(`total="${r.key}"`, c.total),
          (r.group === 'discount' ? 'fl-free ' : '') + (isLast ? 'fl-group-end' : '')));
      });
    });

    /* The Total row is gone. The last row of the chain IS the total — that's what a running column
       means — so a separate line restating it was one more number to reconcile rather than a
       conclusion. What it used to say when the booking was incomplete now belongs on the row that
       is actually incomplete. */

    // One email box per other party. Rendered by renderSplitEmails into this container, which
    // vanished with the hand-written rows — so choosing to split showed no way to say with whom.


    /* Dates, then state, last. The dates are a CONSEQUENCE of the term chosen rather than a
       decision — and eleven of them listed mid-form pushed the price below the fold.
       Derived right here, beside the rows that use them: reading them from a variable defined two
       hundred lines up is how they came to outlive their own definition. */
    /* Starts and Ends lived here. They restated the first and last of the dates listed directly
       below them — three rows for one fact, and the two that added nothing were the summaries. */
    rows.push(tpl.row6('Dates',
      cell('dates', datesText ? `<span class="fl-dates">${esc(datesText)}</span>` : '—'),
      '', '', '',
      cell('total="dates"', dateList.length ? esc(dateList.length + ' dates') : '—'),
      'fl-free fl-cols'));


    /* State last for the same reason. What a booking IS is what someone came to read; where it
       STANDS is what they check afterwards. */
    /* `fl-cols` keeps the money grid on a row that carries no money, so Status and the rest line
       up in the VALUE column with every choice above them rather than running to the right edge.
       They're facts about the booking, read down the same line as the facts that made it. */
    if (o.status) rows.push(tpl.row6('Status', o.status, '', '', '', '', 'fl-free fl-cols'));
    // Status says where the negotiation is; possession says who has to do something next. Different
    // questions, so different rows.
    if (o.possession) rows.push(tpl.row6('Possession', o.possession, '', '', '', '', 'fl-free fl-cols'));
    // Lifecycle is the CALENDAR life of the class and moves independently of the deal: a class can
    // be Agreed and still Upcoming, and becomes Ended because a date passed rather than because
    // anyone pressed anything.
    if (o.lifecycle) rows.push(tpl.row6('Lifecycle', o.lifecycle, '', '', '', '', 'fl-free fl-cols'));

    // Where the money goes. Role-gated, but decided HERE rather than by each card, so the
    // booking form and the class it becomes can never show a different set of rows.
    /* WHO SEES WHICH TOTAL.
       A client sees what they pay, and nothing else — the split between tutor, venue and you is
       not theirs to see and reads as a markup being justified.
       A tutor sees ONLY what they earn. Showing them the client's total invites a comparison
       against their own fee that neither party agreed to, and the difference isn't theirs either.
       An admin sees all four, because reconciling them is the job. */
    if (!ed && isAdmin()) {
      rows.push(tpl.row6('Client pays', '', '', '', '',
        cell('total="clienttotal"', `<b>${money(L.wholeTotal ?? L.total)}</b>`), 'fl-free'));
      rows.push(tpl.row6('Tutor earns', '', '', '', '',
        cell('total="tutorpay"', `<b>${money(L.tutorPay)}</b>`), 'fl-free'));
      rows.push(tpl.row6('Venue cost', '', '', '', '',
        cell('total="venuetotal"', `<b>${money(L.venueTotal)}</b>`), 'fl-free'));
      rows.push(tpl.row6('You earn', '', '', '', '',
        cell('total="profit"', `<b>${money(L.profitTotal)}</b>`), 'fl-free'));
      if (L.belowMinWage) rows.push(tpl.row('⚠ tutor below min wage', '',
        money(L.tutorHourly) + '/h', '', 'fl-warn'));
    } else if (!ed && isTutorRole()) {
      rows.push(tpl.row6('You earn', '', '', '', '',
        cell('total="tutorpay"', `<b>${money(L.tutorPay)}</b>`), 'fl-free'));
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
  linkGroupCard: (category, links) => `<div class="card link-group t-left">
    ${isAdmin() ? `<div class="card-actions"><span class="text-action add-link-btn"
        data-category="${esc(category)}" title="Add a link to ${esc(category)}">➕</span></div>` : ''}
    <h3>${esc(category)}</h3>
    <ul class="link-list">
      ${links.map(l => `<li>
        <a href="${esc(l.url)}" target="_blank" rel="noopener" class="link-row">
          ${esc(l.title)}<span class="link-arrow">↗</span>
        </a>
        ${isAdmin() ? `<span class="text-action link-edit-btn" data-row="${esc(String(l.rowIndex))}"
            title="Edit this link">✏️</span>` : ''}
        ${l.description ? `<p class="desc link-desc">${esc(l.description)}</p>` : ''}
        ${isAdmin() ? tpl.rowEdit({
            rowIndex: l.rowIndex, name: l.title, action: 'updateLink', deleteAction: 'deleteLink',
            groups: DATA.linkFields || { 'Link': ['name', 'url'], 'Where': ['category'],
                                         'More': ['description', 'photo'] },
            values: l.fields || { name: l.title, url: l.url, category: l.category,
                                  description: l.description || '', photo: l.image || '' }
          }) : ''}
      </li>`).join('')}
    </ul>
  </div>`,

  // The filename is the caption. Only the file extension is removed — everything else,
  // including brackets, dates and tokens, is ordinary text.
  cleanCaption: text => String(text || '').replace(/\.[^/.]+$/, '').trim(),

  socialPost: post => {
    const caption = tpl.cleanCaption(post.rawName);
    // Same three parts, same order, as tpl.card: actions, title, body. The old version opened with
    // an avatar-and-username header carrying its own share link, so the one control on a showcase
    // note sat in a different place from the control on every other note.
    return `<div class="card social-post" data-card-name="post-${esc(post.id)}">
      <div class="card-actions">
        <span class="text-action card-share-btn" title="Share this post"
          data-share-url="https://drive.google.com/file/d/${post.id}/view"
          data-share-title="${esc(caption || 'Showcase')}">🔗</span>
      </div>
      ${tpl.img('https://drive.google.com/thumbnail?id=' + post.id + '&sz=w800')}
      ${caption ? `<h3>${escTokens(caption)}</h3>` : ''}
      ${post.label ? tpl.row('Posted', esc(post.label), '', '', 'fl-free') : ''}
    </div>`;
  },

  // Access card: login form when logged out, personal dashboard when logged in.
  // Lives in the Classes & Booking grid so access sits with booking.
  // Login form card (shown in People when logged out)
  loginCard: () => `<div class="card" id="login-card">
      <h3 class="mb-md">Login</h3>
      <div class="checkout stack">
        <input type="text" id="auth-email" placeholder="Full name">
        <input type="password" id="auth-pin" placeholder="PIN">
        <span class="text-action" id="auth-btn">Enter</span>
      </div>
      <p id="auth-msg" class="err mt-sm"></p>
      <p class="note"><span class="text-action" id="show-register">Create an account</span></p>

      <div id="register-form" class="hidden">
        <h3 class="mb-sm">Create an account</h3>
        <div class="ed-grid">
          <label class="pf-field"><span class="edit-label">first name</span>
            <input class="edit-input" id="reg-first"></label>
          <label class="pf-field"><span class="edit-label">last name</span>
            <input class="edit-input" id="reg-last"></label>
          <label class="pf-field"><span class="edit-label">email</span>
            <input class="edit-input" id="reg-email" type="email"></label>
          <label class="pf-field"><span class="edit-label">choose a PIN</span>
            <input class="edit-input" id="reg-pin" type="password" inputmode="numeric"></label>
        </div>
        <p class="note">A PIN of 4 to 8 digits. You'll log in with your full name and this PIN.</p>
        <div class="cl-acts">
          <span class="text-action" id="reg-submit">Create account</span>
          <span class="text-action" id="reg-cancel">Cancel</span>
        </div>
        <p id="reg-msg" class="note status-line"></p>
      </div>
    </div>`,

  // A logged-in parent/kid's own account card in People (their details + logout).
  // Kids also get their level/high score here since they take part in topics/arcade.
  accountCard: () => {
    const roleLabel = { parent: 'Parent', kid: 'Student' }[USER.role] || 'Member';
    const st = statsOf(USER);
    // Rows, like every other card. The run-on "Lv 0, 0 XP, coins, controller" line was the last
    // thing on a card still written as a sentence.
    const kidStats = hasRole('kid')
      ? tpl.row('Level', esc(String(st.level)), '', '', 'fl-free')
        + tpl.row('XP', esc(String(st.xp)), '', '', 'fl-free')
        + tpl.row('Credits', esc(String(st.credits)), '', '', 'fl-free')
        + tpl.row('High score', esc(String(USER.highscore || 0)), '', '', 'fl-free')
      : '';
    return `<div class="card own-profile t-left" id="account-card">
      <div class="av-wrap">${avatarFor(USER.handle || USER.name, 64, USER.avatar)}</div>
      <h3 class="mb-xs">${esc(USER.name)}</h3>
      <p class="sub">${roleLabel}${USER.handle ? ' · ' + esc(USER.handle) : ''}</p>
      ${kidStats}
      ${(hasRole('kid') && (USER.siblings || []).length)
        ? tpl.row('Siblings', esc(USER.siblings.join(', ')), '', '', 'fl-free') : ''}
      ${(hasRole('parent') && (USER.kids || []).length)
        ? tpl.row('Children', esc(USER.kids.join(', ')), '', '', 'fl-free') : ''}
      <p class="muted note">${
        hasRole('kid')
          ? 'Your checklist, friends and classes are in their sections below.'
          : 'Your children and classes are shown below.'
      }</p>
      <div class="card-actions">
        <span class="text-action edit-profile-btn" title="Edit your details">✏️</span>
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
  /* Admin only: the pricing formula with every term colour-coded to the variable behind it, and
     each variable editable in place. It exists so the arithmetic isn't something you have to hold
     in your head while reading a quote — change w here and the booking card beside it recalculates
     as you type, before anything is saved.
     Colours are assigned per variable and used in both the formula and the rows, which is the
     whole trick: you can see which part of the price a number is responsible for. */
  /* Admin only: the pricing formula in symbols, with every letter explained beneath it.
     Letters rather than words in the steps — "subject + level + day + time" says the same thing
     as "S + L + D + T" but four times as wide, and once the key is directly below there's nothing
     for the words to add. It also makes the shape visible: you can see at a glance that four
     surcharges are added and three factors multiply. */
  formulaCard: () => {
    const v = (DATA.constants || {}).vars || {};

    // Editable — these live in the config tab and this card writes them back.
    const VARS = [
      ['s',         'Extra subject, as a fraction of one (0.15 = +15%)', '#0b5c8a'],

      ['B',         'Extra seat — your share. The only part of a price that is yours', '#a01f6b'],
      ['b',         'Bulk, per session after the first', '#00695f'],
      ['a',         'Ahead, per week after the first', '#7a5c00'],
      ['h',         'Hours per session',               '#3d4b57'],
    ];
    // Read-only: set per option in the pricing tab, not here.
    // Fixed in the code, not settings. Shown so the formula can be read, not so it can be changed.
    const FIXED = [
      ['R', "The hourly rate — the tutor's own. They set it, and it's what they're paid", '#b3261e'],
      ['OPEN_RATE', 'R for a job nobody has claimed yet — ' + OPEN_RATE.toFixed(2), '#8a4b00'],
    ];
    const RATES = [
      ['c', "Extra seat — each tutor's own share. The default below applies to anyone who hasn't set one", '#5b3fa0'],
      ['S', 'Subject multiplier. Several subjects are AVERAGED — 1.0 and 1.2 give 1.1', '#0b5c8a'],
      ['L', 'Level multiplier — 1.1 is 10% more',  '#7a3b00'],
      ['D', 'Day multiplier — 1.2 for a Sunday, say', '#4a5d23'],
      ['T', 'Time multiplier — 1.15 for an evening, say', '#5c4033'],
      ['V', 'Venue rate per hour', '#334e68'],
    ];
    // Read-only: counted from the booking itself.
    // P is the running total. Naming it is what makes the steps unambiguous: without it a line
    // reading "Times 1 − b(W−1)" could plausibly be scaling only the term above, and the whole
    // question of what a discount applies to is the thing this card exists to answer.
    const RUNNING = [['P', 'The running total — everything above this line', '#000']];
    const COUNTS = [
      ['k', 'Subjects chosen',        '#6b7280'],
      ['n', 'Seats',                  '#6b7280'],
      ['W', 'Slots — the number of sessions actually booked', '#6b7280'],
      ['A', 'Weeks between now and the first slot',           '#6b7280'],
    ];
    const ALL = VARS.concat(FIXED, RATES, COUNTS, RUNNING);
    const tint = k => (ALL.find(x => x[0] === k) || [,, '#000'])[2];
    const chip = k => `<b class="fx" style="color:${tint(k)}">${esc(k)}</b>`;

    // ONE formula, set out the way you'd write it on paper: the bracketed hourly rate first, the
    // factors that multiply it stacked beneath so they visibly apply to the whole bracket, then
    // the venue added outside them and the hours applied to everything.
    //
    // Laid out in a monospace block on purpose. Alignment is doing real work here — the four
    // multiplication signs sitting in a column is what shows they all act on the same bracket,
    // which was exactly the thing the step-by-step version couldn't express. Annotations sit to
    // the right rather than inline, so the expression itself stays uninterrupted.
    //
    // NOTE the shape: subjects and seats ADD to the hourly rate. An earlier version of this
    // formula multiplied by [1 + s(k−1)], which scaled the venue and every surcharge along with
    // the tuition. This matches the code as it actually runs.
    // Indent by depth rather than by runs of &nbsp;, and put each note on its own line beneath the
    // expression it describes. Notes sitting alongside were what forced the block wider than the
    // card and produced the scrollbar — the expression alone is short enough to fit anywhere.
    const F = (depth, expr, note) =>
      `<div class="fx-line fx-i${depth}"><code>${expr}</code></div>` +
      (note ? `<div class="fx-note-line fx-i${depth}">${esc(note)}</div>` : '');

    const formula =
      F(0, `${chip('P')} = ( [ ${chip('R')} · (Σ${chip('S')}ᵢ)/${chip('k')} · ${chip('L')} · ${chip('D')} · ${chip('T')} ]`,
           'one seat — every surcharge is a multiplier, 1 = no effect') +
      F(2, `· ( 1 + ${chip('s')}(${chip('k')}−1) )`,            'each extra subject') +
      F(2, `· ( 1 + (${chip('c')}+${chip('B')})(${chip('n')}−1) )`, 'each extra seat') +
      F(2, `· ( 1 − ${chip('b')}(${chip('W')}−1) )`,            'bulk') +
      F(2, `· ( 1 − ${chip('a')}(${chip('A')}−1) )`,            'booked ahead') +
      F(2, `· promo`) +
      F(1, `+ ${chip('V')} )`,                                  'venue — outside, never discounted') +
      F(1, `· ${chip('h')} · ${chip('W')}`,                     'hours × slots');

    const varRow = ([k, label, colour], editable) => `<div class="fx-var">
      <div class="fx-key" style="color:${colour}">${esc(k)}</div>
      <div class="fx-row">
        <span class="fx-label">${esc(label)}</span>
        ${editable
          ? `<input class="fx-input" data-key="${esc(k)}" value="${esc(String(v[k] ?? ''))}" inputmode="decimal">`
          : ''}
      </div>
    </div>`;

    // S, L, D, T and V aren't single numbers — each subject, level, day, time and venue carries
    // its own rate. Listing them here means the whole price is editable from one card instead of
    // "that one lives in another tab", which is the difference between a formula you can reason
    // about and one you have to go and look things up for.
    // Collapsed by default: twelve subjects and eleven venues would otherwise bury the nine
    // variables above them.
    const priced = (kind) => (DATA.pricingRows || []).filter(r => r.kind === kind);
    const optionGroup = (symbol, kind, colour, title) => {
      const rows = priced(kind);
      if (!rows.length) return '';
      return `<details class="fx-opts">
        <summary><b style="color:${colour}">${esc(symbol)}</b> ${esc(title)}
          <span class="note">${rows.length}</span></summary>
        ${rows.map(r => `<div class="fx-row fx-opt">
          <span class="fx-label">${esc(r.label)}</span>
          <input class="fx-input" data-kind="${esc(kind)}" data-label="${esc(r.label)}"
                 value="${esc(String(r.value))}" inputmode="decimal">
        </div>`).join('')}
      </details>`;
    };

    return `<div class="card" id="pricing-card">
      <h3>Pricing</h3>
      <div class="fx-formula">${formula}</div>
      <p class="note t-left">Change any value below and the booking beside this recalculates as
        you type.</p>
      ${(() => {
        /* c, B and s are FRACTIONS. A value above 1 is almost certainly a pound amount left from
           when they were added rather than multiplied: c = 1 means "each extra seat adds 100%",
           which is a real setting somebody might want and almost never the one they meant.
           It can't be corrected automatically, but it can be pointed at. */
        /* What an extra student ACTUALLY costs, from c and B together. Each cell on its own looks
           reasonable; it's the sum that decides the price, and nothing showed it. c = 1.5 with
           B = 0.5 is +200% per extra student, and neither number says so. */
        const seatPct = Math.round(((Number(v.c) || 0) + (Number(v.B) || 0)) * 100);
        const odd = ['s', 'c', 'B', 'b', 'a'].filter(k => Number(v[k]) > 1);
        return (seatPct > 100 || odd.length)
          ? `<p class="note fx-warn">Each extra student adds <b>${seatPct}%</b> — that's c
             ${esc(String(v.c || 0))} plus B ${esc(String(v.B || 0))}. These are fractions of the
             rate: 0.25 means +25%. ${odd.length
               ? esc(odd.join(', ')) + ' ' + (odd.length > 1 ? 'are' : 'is') + ' above 1, which is'
                 + ' usually a pound figure left over from before.' : ''}</p>`
          : '';
      })()}
      ${VARS.map(x => varRow(x, true)).join('')}
      <p class="note t-left fx-group">Fixed — set in the code</p>
      ${FIXED.map(x => varRow(x, false)).join('')}
      <p class="note t-left fx-group">Per option — a rate each</p>
      ${optionGroup('S', 'subject', '#0b5c8a', 'Subject surcharges')}
      ${optionGroup('L', 'level',   '#7a3b00', 'Level surcharges')}
      ${optionGroup('D', 'day',     '#4a5d23', 'Day surcharges')}
      ${optionGroup('T', 'time',    '#5c4033', 'Time surcharges')}
      ${optionGroup('V', 'venue',   '#334e68', 'Venue rates per hour')}
      ${(() => {
        /* Each tutor's extra-seat fraction. It varies per tutor exactly as a surcharge varies per
           subject, so it belongs in the same kind of list — and seeing them together is the only
           way to notice one tutor charging 30% for a second student while another charges 5%. */
        const tutors = (DATA.tutors || []).filter(t => t.title);
        if (!tutors.length) return '';
        const dflt = Number(v.c) || 0;
        return `<details class="fx-opts">
          <summary><b style="color:#5b3fa0">c</b> Extra seat, per tutor
            <span class="note">${tutors.length}</span></summary>
          ${tutors.map(t => {
            const own = Number(t.extraSeat) || 0;
            // A value the pricing won't accept must not read as one it uses — that's how a tutor's
            // setting of 5 sat on this list looking applied while the price ignored it.
            const usable = own > 0 && own <= 2;
            const inPlay = usable ? own : dflt;
            return `<div class="fx-row fx-opt">
              <span class="fx-label">${esc(t.title)}</span>
              <span class="fx-fixed">${inPlay ? '+' + Math.round(inPlay * 100) + '% each' : 'nothing extra'}${
                usable ? '' : (own ? ' — ' + own + ' isn\u2019t a fraction, default used'
                                   : ' <span class="note">(default)</span>')}</span>
            </div>`;
          }).join('')}
          <p class="note">Each tutor sets their own in their profile. Only the default is editable
            here.</p>
        </details>`;
      })()}
      <p class="note t-left fx-group">Counted from the booking</p>
      ${COUNTS.map(x => varRow(x, false)).join('')}
      ${RUNNING.map(x => varRow(x, false)).join('')}
      <p class="note status-line" id="fx-status"></p>
    </div>`;
  },

  builderCard: () => `<div class="card" id="new-job" data-span="4">
    <div class="card-actions"><span class="text-action card-share-btn" title="Share this quote"
      data-share-title="Session quote">🔗</span></div>
    <input type="hidden" id="c-service" value="Tuition">
    <h3>Build a session</h3>
    <div id="lessons"></div>
    <p><span class="text-action" id="add-lesson-btn" title="Add another lesson">➕</span></p>
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
    <div class="job-photos" data-lesson="${i}"></div>
    <div class="job-detail">${tpl.priceRows(null, {
      editable: true, lesson: i,
      status: badge('Unsent'),
      possession: badge('Yours'),
      lifecycle: badge('Uncreated')
    })}</div>
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
        avatar: p.avatar, handle: p.handle, xp: p.xp, credits: p.credits,
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
  if (id === 'tutors' && USER && hasRole('kid')) {
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
  if (id === 'tutors' && USER && hasRole('parent')) {
    const kidNames = (USER.kids || []).map(norm);
    const myKids = (DATA.students || []).filter(s => kidNames.includes(norm(s.name)) || kidNames.includes(norm(s.handle)));
    cardsHtml += myKids.map(s => tpl.friendCard(s, true)).join('');
  }

  html(id, cardsHtml);
}

function renderClasses(items = DATA.clientClasses || []) {
  const iAmIn = j => USER && (j.slots || []).some(s => norm(s.client) === norm(USER.name));
  const iAmTutor = j => USER && isTutorRole() && norm(j.requestedTutor) === norm(USER.name);
  // Visible if it has open spots, OR it's the user's own class, OR the user is its tutor (so a
  // full job still shows to the people already in it and to the tutor running it).
  const visible = items.filter(j => (j.spotsLeft > 0 && !j.isFull) || iAmIn(j) || iAmTutor(j));
  // The user's own classes float to the top
  const rank = j => classState(j) ? 1 : 0;
  const sorted = [...visible].sort((a, b) => rank(b) - rank(a));
  const cards = sorted.map(j => tpl.jobCard(j, false, classState(j))).join('');
  html('classes', (isAdmin() ? tpl.formulaCard() : '') + tpl.builderCard() + cards);
  fillDropdowns();
  initIntervals();
  renderCheckout();
  enforceHomeRule();
}

// Relationship of a job to the logged-in user:
//   'confirmed' → their class (blue)   'pending' → potential/awaiting tutor accept (grey)   '' → not theirs
function classState(j) {
  if (!USER) return '';
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
  // Everything role-dependent, from the one list. Keeping a second list here is what left Venues
  // out: log in as admin and the venue pencils only appeared after a full page reload.
  renderForRole();
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
const TITLE_DIMS = ['subject', 'band', 'resourceType', 'printout', 'keystage', 'examBoard',
                    'examWave', 'company', 'tier'];

// The distinct values one card holds for a given attribute.
function cardValues(item, dim) {
  if (dim === 'subject')      return item.subject ? [String(item.subject)] : [];
  if (dim === 'band')         return item.bandLabel ? [String(item.bandLabel)] : [];
  if (dim === 'resourceType') return item.resourceTypes || [];
  if (dim === 'keystage')     return item.keystages || [];
  if (dim === 'examBoard')    return item.examBoards || [];
  if (dim === 'examWave')     return item.examWaves || [];
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
const CARD_DIMS = ['subject', 'band', 'resourceType', 'printout', 'keystage', 'examBoard',
                   'examWave', 'tier', 'company'];

// One topic's value for a dimension, as a plain string (band = grade or stage, whichever it has).
function dimValue(it, dim) {
  if (dim === 'band')     return String(it.grade || it.stage || '');
  if (dim === 'subject')  return String(it.subject || '');
  return String(it[dim] || '');
}

// Build the checklist cards. Grouping is fixed (group by everything); `forceDim` is kept for
// the manual override, which now just promotes one dimension to the front of the title.
function checklistItems(forceDim, groupDim) {
  const distinctOf = (topics, key) => [...new Set(topics.map(t => String(t[key]||'').trim()).filter(Boolean).map(s=>s.toLowerCase()))];
  const all = allToolItems();
  if (!all.length) return [];

  // A card = a set of topics identical across every CARD_DIM. The composite key is just all
  // those values joined, so any single difference lands the topics in different cards.
  // WHICH TOPICS SHARE A CARD.
  //   automatic — they must match on EVERY dimension, so any difference splits them, giving many
  //               small precisely-labelled cards
  //   grouped    — that one dimension decides, so "by grade" gives one card per grade holding
  //               everything in it whatever its board, tier or company
  // That's what group-by changes: what's inside a note, not how notes sit on the wall.
  const dims = (groupDim && CARD_DIMS.indexOf(groupDim) !== -1) ? [groupDim] : CARD_DIMS;
  const groups = {};
  all.forEach(it => {
    const key = dims.map(d => dimValue(it, d)).join('|~|');
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
      examWaves: distinctOf(g.topics, 'examWave'),
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
    { name: 'checklist todo list', html: tpl.todoCard() },
    { name: 'worth knowing feed facts reels', html: tpl.feedCard() },
  ].filter(t => !q || t.name.includes(q));
  html('tools-content', tools.map(t => t.html).join('') || '<p class="muted">No tools match.</p>');
  initMiniCalc();
  initTimer();
  initCalendar();
  initFeed();
}

/* ---------- THE FEED, GENERATED --------------------------------------------------------------
   No table to fill. Every card is made on the spot, from two sources that can't be wrong:

     COMPUTED — arithmetic worked out here rather than looked up. A card saying 3 x 17 = 51 is
                true because it was calculated, and there is no supply of them to run out.
     YOUR OWN RESOURCES — the 418 topics already in the sheet, turned into retrieval prompts.
                "Can you do this without notes?" is the best-evidenced revision technique there
                is, and the topic list already exists.

   What it deliberately does NOT do is fetch facts from anywhere. An outside API of trivia is
   unsourced, a scrape is someone else's work, and an LLM invents things confidently — and a
   tutoring site telling a student something false is worse than one saying nothing.

   Seeded, so a card holds still while you read it and the order differs between visits.
--------------------------------------------------------------------------------------------- */
let FEED_SEED = Math.floor(Math.random() * 1e9);
/** A repeatable pseudo-random stream — same seed, same cards, so nothing shifts mid-read. */
function feedRandom(n) {
  let x = (FEED_SEED + n * 2654435761) >>> 0;
  return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };
}

/* THE THINGS WORTH KNOWING. Shipped in the code, not in a sheet — nothing to maintain, nothing to
   fetch, and every line was checked before it got here. Mixed with the computed generators below,
   so the feed has breadth AND never runs dry.
   Kept short on purpose: a card is read in the time it takes to decide whether to move on. */
/* THE THINGS WORTH KNOWING. Anything at all — the only rule is that it's true and that somebody
   would repeat it to a friend.

   Each carries its OWN picture search term, because relevance cannot come from the sentence:
   searching "honey does not go off" returns whatever matches those words, which is how a card
   about honey ends up showing a jar of jam. The term is chosen with the photograph in mind.

   Shipped in the code rather than a sheet: nothing to maintain, nothing to fetch, and every line
   was checked before it got here.
   [subject, heading, body, picture search] */
const FEED_FACTS = [
  ['Space', 'You are seeing the sun as it was eight minutes ago',
   'Light takes 8 minutes 20 seconds to cross 150 million km. If it went out you would carry on reading in bright daylight for the length of a song.', 'sun solar corona'],
  ['Space', 'There is a planet where it rains glass, sideways',
   'HD 189733b is cobalt blue and its winds run at 5,400 mph. The blue is silicate particles — glass — blown horizontally through the atmosphere.', 'exoplanet artist impression'],
  ['Space', 'Saturn would float',
   'It is less dense than water. Find an ocean big enough and the whole planet would sit on top of it.', 'Saturn planet rings'],
  ['Space', 'A day on Venus is longer than its year',
   'It turns once every 243 Earth days and orbits in 225. The sun rises in the west, twice a year, very slowly.', 'Venus planet surface'],

  ['Animals', 'Octopuses have three hearts and blue blood',
   'Two pump to the gills, one to the body — and that one stops when they swim, which is why they prefer crawling.', 'octopus underwater'],
  ['Animals', 'A shrimp can boil water by clicking',
   'The pistol shrimp snaps its claw fast enough to form a collapsing bubble that reaches thousands of degrees for a fraction of a millisecond.', 'pistol shrimp'],
  ['Animals', 'Wombats produce cube-shaped droppings',
   'The last stretch of intestine has patches of differing elasticity that mould them. Cubes do not roll away, which matters if you mark territory with them.', 'wombat'],
  ['Animals', 'One jellyfish can reverse its own ageing',
   'Turritopsis dohrnii reverts to its juvenile stage under stress and starts again. In principle it need never die of old age.', 'Turritopsis jellyfish'],
  ['Animals', 'Crows hold grudges, and tell their friends',
   'They recognise individual human faces, remember who treated them badly, and pass the grievance to birds that were never there.', 'crow corvid'],

  ['Everyday', 'Honey never goes off',
   'Jars from Egyptian tombs are still edible. Too acidic and too dry for bacteria, and bees add an enzyme that makes hydrogen peroxide.', 'honey jar honeycomb'],
  ['Everyday', 'Bananas are clones',
   'Almost every banana sold is a Cavendish, grown from cuttings — genetically one plant. That is why a single fungus can threaten the entire crop, and did once before.', 'banana plantation'],
  ['Everyday', 'Carrots were purple first',
   'Orange ones were bred in the Netherlands in the 16th century. The colour you think of as natural is a few hundred years old.', 'purple carrots'],
  ['Everyday', 'The QWERTY layout is not slowing you down',
   'The jamming story outlived the typewriter. Tests against faster layouts find differences small enough to vanish with practice.', 'typewriter keyboard'],
  ['Everyday', 'Bubble wrap was invented as wallpaper',
   'It failed. Then it was sold as greenhouse insulation. It failed again. Only on the third attempt did anyone think of packaging.', 'bubble wrap'],

  ['History', 'Zero was banned in Florence',
   'India had a symbol for it by the 7th century; Europe resisted 400 years, and Florence outlawed it in 1299. A digit meaning nothing looked like a way to forge a ledger.', 'medieval manuscript numerals'],
  ['History', 'Oxford is older than the Aztec Empire',
   'Teaching at Oxford began around 1096. Tenochtitlan was founded in 1325. Two things that feel like different eras overlapped by centuries.', 'Oxford university old building'],
  ['History', 'Cleopatra lived closer to the moon landing than to the pyramids',
   'The Great Pyramid was already 2,500 years old when she was born. She is 2,000 years from us.', 'Cleopatra bust'],
  ['History', 'The last execution by guillotine was in 1977',
   'The same year Star Wars opened and the Apple II went on sale. France kept it until 1981.', 'guillotine museum'],

  ['Language', 'Every word for "brother" sounds the same',
   'Bhrātṛ in Sanskrit, frater in Latin, bróðir in Norse. They did not borrow it — they inherited it from one language nobody wrote down, spoken 6,000 years ago.', 'ancient manuscript writing'],
  ['Language', 'Quarantine is a length of time',
   'Quaranta giorni — forty days. Venice held arriving ships that long during the plague, and the word carries the number inside it.', 'Venice harbour'],
  ['Language', '"Nice" used to mean stupid',
   'From Latin nescius, not-knowing. It drifted through foolish, fussy, precise, and only landed on pleasant in the 1700s.', 'old dictionary pages'],

  ['Body', 'You replace your skeleton about every ten years',
   'Osteoclasts dissolve old bone; osteoblasts lay down new. The shape stays, the material does not. You are the same skeleton the way a river is the same river.', 'human skeleton anatomy'],
  ['Body', 'Your gut has more bacteria than you have cells',
   'Roughly 38 trillion of them to 30 trillion of you. By headcount you are a minority in your own body.', 'bacteria microscope'],
  ['Body', 'Nothing you touch is actually touching you',
   'The floor holds you up by electromagnetic repulsion between electrons. What you feel as contact is a force at a distance.', 'atom model physics'],

  ['Earth', 'Africa is bigger than every map has shown you',
   'The USA, China, India and most of Europe fit inside it at once. Mercator stretches the poles to keep angles true and squashes the equator to pay for it.', 'Africa map satellite'],
  ['Earth', 'The sky is blue for the reason sunsets are red',
   'Air scatters short wavelengths hardest. At sunset the light crosses far more air, the blue is scattered away entirely, and what is left is what reaches you.', 'sunset sky'],
  ['Earth', 'Ice floats, and almost nothing else does',
   'Water expands when it freezes because the hydrogen bonds lock into a lattice with gaps. If it did not, lakes would freeze from the bottom and stay frozen.', 'iceberg ice'],
  ['Earth', 'Russia spans eleven time zones',
   'When it is Monday morning in Kaliningrad it is Monday evening in Kamchatka. One country, one working day, twelve hours apart.', 'Kamchatka landscape'],

  ['Making', 'Blue was the most expensive colour for 600 years',
   'Ultramarine came from lapis lazuli, mined in one valley in Afghanistan. It cost more than gold, which is why painters saved it for the Virgin Mary robes.', 'lapis lazuli ultramarine'],
  ['Making', 'An octave is a doubling',
   'The A above middle C is 440 vibrations a second; the next A is 880. Every octave doubles, and that ratio is why they sound like the same note.', 'piano keys'],
  ['Making', 'The Eiffel Tower is taller in summer',
   'Iron expands. It grows about 15cm on a hot day and leans slightly away from the sun.', 'Eiffel Tower'],

  ['Study', 'Reading it twice is one of the weakest ways to learn',
   'Recall beats review: shut the book, write what you remember, then check. It feels worse and works better, which is exactly why people avoid it.', 'student notebook studying'],
  ['Study', 'Sleep is when the learning gets filed',
   'The hippocampus replays the day during deep sleep and hands it to the cortex. Revising until 2am and sitting the paper at 9 skips the step that makes it stick.', 'sleeping night'],
  ['Study', 'Spacing beats cramming at equal total time',
   'Six hours over six days beats six hours in one. Each time you nearly forget and then retrieve it, the memory is rebuilt stronger.', 'calendar planning'],
];

const FEED_MAKERS = [
  // One of the shipped facts. Breadth comes from here; endlessness from the makers below.
  (r) => {
    const [subject, heading, body, pic] = FEED_FACTS[Math.floor(r() * FEED_FACTS.length)];
    return { subject, heading, body, pic };
  },

  /* Times tables, with the pair that's actually hard picked more often. Nobody forgets 2 x 5;
     the middle of the grid is where it goes. */
  (r) => {
    const hard = [[6,7],[7,8],[6,8],[7,9],[8,9],[6,9],[4,7],[3,8],[7,7],[8,8],[12,7],[11,9]];
    const [a, b] = r() < 0.6 ? hard[Math.floor(r() * hard.length)]
                             : [2 + Math.floor(r() * 11), 2 + Math.floor(r() * 11)];
    return { subject: 'Maths', heading: a + ' × ' + b,
      body: 'Say it before you scroll. It is ' + (a * b) + '. Another way in: '
        + a + ' × ' + (b - 1) + ' = ' + (a * (b - 1)) + ', then add ' + a + '.' };
  },

  /* A number and what it's built from. Factorising is the skill under fractions, surds and
     quadratics, and this is the same move on a number small enough to do in your head. */
  (r) => {
    const n = 12 + Math.floor(r() * 108);
    const f = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i);
    const prime = f.length === 2;
    const primes = [];
    let m = n;
    for (let p = 2; p <= m; p++) while (m % p === 0) { primes.push(p); m /= p; }
    return { subject: 'Maths', heading: 'What is ' + n + ' made of?',
      body: prime
        ? n + ' is prime — nothing divides it but 1 and itself.'
        : n + ' = ' + primes.join(' × ') + '. Its factors are ' + f.join(', ')
          + '. Every number breaks down one way only, and that is why factorising works.' };
  },

  /* Fraction, decimal and percentage are one number in three costumes. Seeing them together is
     what stops a student converting and losing the thread. */
  (r) => {
    const pairs = [[1,2],[1,3],[2,3],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,8],[3,8],[5,8],[7,8],
                   [1,6],[5,6],[1,10],[7,10],[1,20],[1,100],[2,7],[1,9]];
    const [a, b] = pairs[Math.floor(r() * pairs.length)];
    const dec = a / b;
    const rounded = Math.round(dec * 10000) / 10000;
    const exact = String(rounded).replace(/^0/, '') === String(dec).replace(/^0/, '');
    return { subject: 'Maths', heading: a + '/' + b + ' — three ways',
      body: a + '/' + b + ' = ' + (exact ? rounded : rounded + '…') + ' = '
        + (Math.round(dec * 1000) / 10) + '%. One number, three costumes. '
        + (exact ? 'It terminates because ' + b + ' divides a power of ten.'
                 : 'It repeats for ever — ' + b + ' does not divide any power of ten.') };
  },

  /* Squares to 20. The ones above 12 are the ones people never learn, and they're all over
     Pythagoras and quadratics. */
  (r) => {
    const n = 11 + Math.floor(r() * 15);
    return { subject: 'Maths', heading: n + ' squared',
      body: n + '² = ' + (n * n) + '. If that did not come instantly: ' + n + '² is '
        + (n - 1) + '² + ' + (n - 1) + ' + ' + n + ' = ' + ((n-1)*(n-1)) + ' + ' + (2*n - 1)
        + '. Every square is the one below it plus the two numbers that bridge them.' };
  },

  /* Percentage of an amount, done the way you'd do it in a shop rather than the way a formula
     suggests. */
  (r) => {
    const pcts = [5, 10, 12.5, 15, 20, 25, 30, 40, 60, 75, 80, 90];
    const p = pcts[Math.floor(r() * pcts.length)];
    const amt = [40, 60, 80, 120, 150, 200, 250, 320, 400, 500][Math.floor(r() * 10)];
    const out = Math.round(p * amt) / 100;
    return { subject: 'Maths', heading: p + '% of ' + amt,
      body: 'It is ' + out + '. Find 10% first — that is ' + (amt / 10)
        + ' — then build from there. Nobody sensible multiplies by ' + (p / 100) + '.' };
  },

  /* A topic from the sheet, as a retrieval prompt. This is the one that isn't arithmetic, and
     it's the most valuable card here: shutting the book and trying to explain something is the
     single best-evidenced way to make it stick. */
  (r) => {
    const topics = allToolItems().filter(t => t.name && t.trackable);
    if (!topics.length) return null;
    const t = topics[Math.floor(r() * topics.length)];
    const where = [t.subject, t.grade ? 'Grade ' + t.grade : t.stage].filter(Boolean).join(' · ');
    return { subject: where || t.subject || 'Revision',
      heading: t.name,
      body: 'Shut everything and explain it out loud, as if to somebody who has not met it. '
        + 'Where you stumble is the bit to go back to — that is the whole trick.',
      link: t.link };
  },
];

/* A PHOTOGRAPH, from Wikimedia Commons.
   Chosen because it needs no API key — a key in a public page is a key anyone can take and burn —
   and because everything on Commons is freely licensed. A plain web search would return images
   that cannot be licensed, and a tutoring business showing them is a business that can be invoiced
   for them.
   The search term comes from the FACT, not from its sentence: "honey does not go off" matches
   whatever contains those words, which is how a card about honey shows a jar of jam.
   Cached per term, because the same card comes round again and the network shouldn't. */
const FEED_PICS = {};
async function feedPicture(term) {
  if (!term) return null;
  if (FEED_PICS[term] !== undefined) return FEED_PICS[term];
  FEED_PICS[term] = null;                       // don't ask twice while the first is in flight
  try {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search'
      + '&gsrsearch=' + encodeURIComponent('filetype:bitmap ' + term)
      + '&gsrlimit=6&gsrnamespace=6&prop=imageinfo&iiprop=url|extmetadata'
      + '&iiurlwidth=900&format=json&origin=*';
    const d = await (await fetch(url)).json();
    const pages = Object.values((d && d.query && d.query.pages) || {});
    // Landscape only: a portrait crops to almost nothing behind a phone-shaped card.
    const usable = pages.filter(p => {
      const i = p.imageinfo && p.imageinfo[0];
      return i && i.thumburl && (i.thumbwidth || 0) >= (i.thumbheight || 1) * 0.9;
    });
    const pick = usable[0] || pages.find(p => p.imageinfo && p.imageinfo[0]);
    if (!pick) return null;
    const info = pick.imageinfo[0];
    const meta = info.extmetadata || {};
    const strip = v => String(v || '').replace(/<[^>]*>/g, '').trim();
    FEED_PICS[term] = {
      src: info.thumburl,
      // Attribution is the condition these are free under, so it is not optional.
      by: strip((meta.Artist || {}).value).slice(0, 60),
      licence: strip((meta.LicenseShortName || {}).value).slice(0, 30),
    };
    return FEED_PICS[term];
  } catch { return null; }               // offline, blocked, rate-limited — the drawing stands in
}

/** One card. `n` is its place in the run, so the same position always gives the same card. */
function feedItem(n) {
  const r = feedRandom(n);
  // Several attempts, because a maker can decline — the topic one has nothing to say before the
  // resources have loaded, and a blank card is worse than a different card.
  for (let tries = 0; tries < 6; tries++) {
    const make = FEED_MAKERS[Math.floor(r() * FEED_MAKERS.length)];
    const out = make(r);
    if (out) return { id: 'g' + n, ...out };
  }
  return null;
}

/* THE FEED. Where you are in it survives a re-render — a tool that loses your place every time
   something else on the page changes is a tool you stop using. Starts somewhere different each
   load, so the same card isn't always first. */
let FEED_AT = null;
function initFeed() {
  if (!$('feed-screen')) return;
  if (FEED_AT === null) FEED_AT = 0;
  drawFeed();
}
function drawFeed() {
  const screen = $('feed-screen');
  if (!screen) return;
  // No end to reach, so no wrapping and no going below the first.
  FEED_AT = Math.max(0, FEED_AT);
  const it = feedItem(FEED_AT);
  if (!it) return;
  screen.innerHTML = tpl.feedSlide(it);

  /* The photograph arrives afterwards and fades in over the drawing. That order matters: the card
     is readable the instant it appears, and a slow or failed fetch costs nothing — the drawn
     background is not a placeholder, it's the floor. */
  const at = FEED_AT;
  feedPicture(it.pic).then(pic => {
    if (!pic || at !== FEED_AT) return;         // moved on already
    const art = screen.querySelector('.feed-art');
    if (!art) return;
    const img = new Image();
    img.onload = () => {
      if (at !== FEED_AT) return;
      art.style.backgroundImage = `url(${pic.src})`;
      art.classList.add('has-photo');
      const cred = screen.querySelector('.feed-credit');
      if (cred && pic.by) cred.textContent = pic.by + (pic.licence ? ' · ' + pic.licence : '');
    };
    img.src = pic.src;
  });
}
function feedMove(by) { FEED_AT = (FEED_AT || 0) + by; drawFeed(); }

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
  // Whole levels only. One ticked topic is one XP and one credit; ten XP is a level. 35 ticks is
  // level 3 with five to go, not "level 3.5" — a fraction of a level isn't a thing you can have.
  return Math.floor((Number(xp) || 0) / XP_PER_LEVEL);
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
       <span class="text-action" id="book-btn" class="cta">Send request</span>`
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

/** Fetch and draw the showcase separately, once the rest of the site is up. */
function loadGallery() {
  fetch(API + '?galleryOnly=1')
    .then(r => r.json())
    .then(d => {
      if (d && d.galleryError) console.warn('@family. showcase:', d.galleryError);
      renderGallery((d && d.gallery) || []);
    })
    .catch(() => html('gallery', '<p class="muted">Showcase unavailable.</p>'));
}

/**
 * Redraw everything that depends on who you are.
 *
 * Logging in and out used to redraw a hand-written list of sections, and the list was missing
 * Venues — so venue cards kept the markup they were built with, and an admin who logged in saw no
 * edit pencil on them until a full page reload. Every section that renders differently for a tutor,
 * an admin or a visitor belongs here; anything added later that reads a role belongs here too.
 * One list, so a section can't be forgotten twice.
 */
function renderForRole() {
  renderHeaderAuth();
  renderClasses();                       // access card, booking form, class controls
  renderCards('tutors', DATA.tutors);    // People: own card, admin pencils, friend cards
  renderCards('venues', DATA.venues);    // Venues: admin pencil, "I can teach here" tick
  renderChecklist();                     // tick boxes only exist for someone who can tick them
  renderArcade();                        // personal bests
  renderTools();                         // notepad, checklist, avatar
  renderLinks(DATA.links);               // admin edit and add controls
  applyFilter('shop');                   // buy vs equip, admin editing
}

/* ---------- THE PRICE BREAKDOWN, AS DATA ------------------------------------------------------
   Every priced row on a booking card is declared ONCE, here. The renderer walks this list to build
   the card and calc() walks the same list to refresh it, so the two cannot describe different rows
   — which is the bug that has recurred all session: a row rendered but never refreshed, or a
   refresh aimed at a row that no longer existed.

   Each row says what KIND of thing it is, and the kind decides which column it appears in:

     'rate-mult'   a multiplier on the HOURLY RATE          → % column
     'rate-add'    a fixed amount added to the hourly rate  → £/h column
     'total-mult'  a multiplier on the FINISHED TOTAL       → × column

   That distinction is the whole point. A % that changes £/h and a × that scales the total are
   different operations, and sharing a column made the arithmetic unfollowable.

   To add a row: add an entry. Nothing else needs touching — not the renderer, not the refresher,
   not the stylesheet.
--------------------------------------------------------------------------------------------- */
const PRICE_ROWS = [
  // --- the shape of the booking: these multiply the finished total ---
  /* The 'Hours a week' row lived here. The When row reports the same number beside the grid that
     decides it, and two rows for one fact is the duplication this card has been shedding all along. */

  { key: 'term',   label: 'Time interval', kind: 'total-mult', group: 'shape',
    control: 'l-interval',
    value: L => L.interval || (L.weeksBooked ? L.weeksBooked + ' weeks' : ''),
    // Weeks, matching what it actually multiplies by. It reported the DATE count while the price
    // used weeks — the row and the arithmetic disagreed by a factor of the days ticked.
    /* Weeks are known as soon as an interval is chosen — they come from its own dates. Gating this
       on the session-date list meant a chosen interval showed no multiplier until the dates
       resolved, which is a later and separate question. */
    scale: L => L.weeksBooked || L.weeksLeft || 0,
    /* Until days are ticked, the interval only says how many WEEKS are left — not how many
       sessions, because a client may book one day a week or three. Stating a count here was a
       guess shown in the same column as settled figures. */
    // Silent until the days are ticked. A note in the multiplier column is a sentence where the
    // eye is looking for a number.
    idle:  L => '',
    show:  L => !!L.W },

  { key: 'base',    label: 'Tuition',  kind: 'rate-add',  group: 'rate',
    control: 'l-tutor',
    value: L => L.tutor || 'No preference',
    perHour: L => L.chargeRate || 0,
    // The rate itself, not an addition to it — so it shows unsigned, and its total is the tuition
    // component of the price rather than a "+".
    isBase: true, show: L => true },

  /* THE ORDER MATTERS. Each of these multiplies what the ones above it have already produced, so
     its `of` is the running total at its own point in the chain — not the bare rate. Writing the
     bases out by hand is how two rows came to share one, which made the breakdown £13.67 short of
     the price it was breaking down. `rateBase` derives each from the order below. */
  { key: 'subject', label: 'Subject',  kind: 'rate-mult', group: 'rate',
    control: 'subject-picker',
    value: L => (L.subjects || []).join(', '),
    mult:  L => L.avgSubject,
    of:    L => rateBase(L, 'subject') },

  { key: 'complexity', label: 'Extra subjects', kind: 'rate-mult', group: 'rate',
    control: null,
    value: L => String(Math.max(0, (L.k || 1) - 1)),
    mult:  L => L.fSubjectCount,
    of:    L => rateBase(L, 'complexity') },

  { key: 'level',   label: 'Level',    kind: 'rate-mult', group: 'rate',
    control: 'l-level',
    value: L => L.level || '',
    mult:  L => L.L,
    of:    L => rateBase(L, 'level') },

  { key: 'students', label: 'Extra seats', kind: 'rate-mult', group: 'rate',
    control: 'l-qty',
    /* Says WHERE the fraction came from, for an admin. A tutor's own setting and the site default
       produce identical-looking multipliers, so a setting that isn't reaching the price is
       indistinguishable from one that is — which is exactly how 1.5 kept applying while a tutor's
       0.25 sat in a column that didn't exist. */
    value: L => String(Math.max(0, (L.n || 1) - 1))
      + (isAdmin() && L.seatSource ? ` <span class="note">${esc(L.seatSource)}</span>` : ''),
    mult:  L => L.fChildrenAll,
    of:    L => rateBase(L, 'students') },

  { key: 'venue',   label: 'Venue',    kind: 'rate-add',  group: 'rate',
    control: 'l-location',
    value: L => L.loc || '',
    perHour: L => L.venueRate || 0,
    atCost: true },

  { key: 'host',    label: 'Host',     kind: 'rate-add',  group: 'rate',
    control: 'host-toggle',
    perHour: L => (L.hosting && L.venueRate) ? -L.venueRate : 0,
    atCost: true,
    show:  L => !!L.venueRate },

  { key: 'split',  label: 'Split with', kind: 'total-mult', group: 'shape',
    /* The count comes from the addresses. A number picked separately is a second statement of the
       same fact — choose 3, name 2, and neither the price nor the invitation list knows which is
       true. Naming someone IS splitting with them. */
    control: 'split-emails',
    /* Splitting changes both the hourly rate and the total, so it reports both — it was the only
       row that moved the price without saying by how much. */
    perHour: L => (L.splitOthers || 0) > 0 && L.chargePerHour
      ? -(L.chargePerHour * (L.splitOthers || 0)) : 0,
    value: L => String(L.splitOthers || 0),
    // Splitting with nobody is not a division — a row saying "÷ 1" is an operation that isn't
    // happening, which reads as a rule you have to think about.
    scale: L => (L.splitOthers || 0) > 0 ? 1 / ((L.splitOthers || 0) + 1) : 1,
    show:  L => (L.splitOthers || 0) > 0 },

  // --- what builds the hourly rate ---
  /* The bulk and booked-ahead rows lived here. Removed for now, and their coefficients are
     ignored with them — leaving b and a applying with no row to explain them would be a price
     change nobody on the card could account for. Set them back to a live factor when the section
     returns; the rest of the machinery is unchanged. */
];


/* The days, in one place. The grid, the price and the card all need them in the same order, and
   three copies of a list like this is how one of them ends up starting on a Sunday. */
const SLOT_DAYS = [['m','Monday'], ['tu','Tuesday'], ['w','Wednesday'], ['th','Thursday'],
                   ['f','Friday'], ['sa','Saturday'], ['su','Sunday']];

/* The order the rate multipliers apply in. Declared once, because it decides two things that have
   to agree: what the price IS, and what each row says it contributed. When each row carried its own
   hand-written base, two of them shared one and the breakdown stopped adding up. */
const RATE_CHAIN = [
  { key: 'subject',    mult: L => L.avgSubject },
  { key: 'complexity', mult: L => L.fSubjectCount },
  { key: 'level',      mult: L => L.L },
  { key: 'students',   mult: L => L.fChildrenAll },
];

/** The running hourly rate immediately BEFORE the named row applies. */
function rateBase(L, key) {
  let base = L.chargeRate || 0;
  for (const step of RATE_CHAIN) {
    if (step.key === key) return base;
    base *= Number(step.mult(L)) || 1;
  }
  return base;
}

/**
 * THE FOUR MONEY CELLS FOR ONE ROW.
 *
 * Every row answers the same three questions, whatever kind it is:
 *
 *   scale    what it multiplies the finished total by      → × column
 *   pct      what it changes the hourly rate by            → % column
 *   perHour  what it adds to the hourly rate, in pounds    → £/h column
 *
 * `total` is DERIVED from those, never declared separately. That is the guarantee: a row cannot
 * show a percentage without also showing what that percentage is worth per hour and over the
 * booking, because all three come from one number. Rows used to declare their columns
 * independently, which is why a rate multiplier could show "+1%" and nothing else — nobody had
 * written the £/h line, and nothing noticed it was missing.
 */
/**
 * THE RUNNING TOTAL after a given row has applied.
 *
 * The last column used to hold each row's own contribution — "+ £3.08" — which meant reading the
 * card was an addition problem: to know what a booking costs after the level surcharge you had to
 * sum everything above it. A running figure answers that directly, and the last one IS the total,
 * so the column ends where the price ends.
 *
 * Walks the same order the card renders in, so the number beside a row is the price with that row
 * and everything above it applied, and nothing below.
 */
function runningAfter(key, L) {
  let p = L.chargeRate || 0;
  const step = { subject: L.avgSubject, complexity: L.fSubjectCount,
                 level: L.L, students: L.fChildrenAll };
  for (const k of ['base', 'subject', 'complexity', 'level', 'students']) {
    if (k !== 'base') p *= Number(step[k]) || 1;
    if (k === key) return p;
  }
  /* The venue always ADDS its rate, and hosting TAKES IT BACK on the row below. Folding the
     hosting into the venue row meant that row said "+ £15.00/h" while the running total beside it
     didn't move, and the Host row showed nothing at all — the deduction happened between two rows
     with neither of them reporting it. Each row moves the running figure by exactly what it says
     it does. */
  p += (L.venueRate || 0);
  if (key === 'venue') return p;
  if (L.hosting) p -= (L.venueRate || 0);
  if (key === 'host') return p;
  p *= (L.hoursPerWeek || 0) || 1;
  if (key === 'hoursweek') return p;
  /* WEEKS, not dates. Hours-a-week already spans every day ticked, so multiplying by the date
     count — which is days × weeks — counts the days a second time. */
  p *= (L.weeksBooked || 0) || 1;
  if (key === 'term') return p;
  p /= (L.splitShares || 1);
  return p;
}

function priceCells(row, L, fmt) {
  const { money, esc } = fmt;
  const out = { mul: '', rate: '', total: '' };
  const hours = L.hoursTotal || 0;
  // What a per-hour amount is worth over the whole booking. Room hire is at cost, so it escapes
  // the discounts; everything else is discounted exactly as the total is.
  const over = (perHour, atCost) => perHour * hours
    * (atCost ? 1 : (L.discountFactor || 1) * (L.promoAdj || 1));
  // With no hours there is no total to state. Every row goes quiet together, rather than a column
  // of £0.00 that looks like a set of prices.
  const known = hours > 0;
  const signed = (x, unit) => (x === 0 ? '—'
    : (x > 0 ? '+ ' : '− ') + money(Math.abs(x)) + (unit || ''));

  /* A rate row produces a running RATE; a shape row produces a running TOTAL. Which column a row
     writes into is decided by which of the two it actually makes, never by what fits. */
  /* Every money row reports the same thing: what the booking costs with this row and everything
     above it applied. The shape rows come first and report HOURS, because that's what they
     establish; from Tuition down, the figure is pounds for the whole booking. One unit per
     section, and the section boundary is where the unit changes. */
  const isRateRow = ['base','subject','complexity','level','students','venue','host'].includes(row.key);
  const running = () => {
    if (isRateRow || known) return { total: money(runningAfter(row.key, L)) };
    /* Nothing to total yet — say WHY, on the row that's waiting for it. Going blank here made the
       chain look like it had failed halfway: the rate rows above still showed figures, because a
       rate is knowable without hours, so the bottom half read as broken rather than as unanswered.
       The reason is stated once, on the first row that can't proceed, and the rows below it stay
       quiet rather than repeating it. */
    const why = !L.hoursPerWeek ? 'tick some hours'
              : !L.weeksBooked  ? 'pick a time interval'
              : '';
    return { total: (row.key === 'hoursweek' && why) ? `<span class="note">${why}</span>` : '—' };
  };

  /* --- a multiplier on the finished total: length, term, split, bulk, advance --------------- */
  if (row.kind === 'total-mult') {
    const f = row.scale(L);
    /* A scale of 0 means the question hasn't been answered — no length chosen, no interval — and
       it rendered as 'x 0 hrs, −100%', which describes a total discount rather than an empty
       control. Nothing chosen is nothing to say.
       A scale of exactly 1 is different depending on the row: for a COUNT (one session, one hour)
       it's a real answer worth stating, and it was being suppressed — leaving the interval row
       claiming no sessions beside a bulk row correctly reporting one. For a DISCOUNT it means the
       rule isn't applying, which is what `idle` explains. */
    if (!f || (f === 1 && !row.unit)) {
      out.mul = row.idle ? row.idle(L) : '';
      return out;
    }
    /* Always a multiplier, never a divisor. "÷ 2" and "× 0.5" are the same operation written two
       ways, and a column holding both stops reading as one running product. */
    // A number, not a phrase. "× 22 sessions" in a column of "× 4", "× 0.50" and "× 0.790" is the
    // only entry that needs reading rather than scanning.
    out.mul = '× ' + Number(f).toFixed(f % 1 ? (f * 100 % 1 ? 3 : 2) : 0);

    /* A row that scales the total may also say what that's WORTH — the split does, because "you
       pay half" is more usefully stated as the pounds it takes off. Rows without a perHour say
       nothing here, which is most of them. */
    if (row.perHour) {
      const per = row.perHour(L);
      if (per) out.rate = signed(per, '/h');
    }
    Object.assign(out, running());
    return out;
  }

  /* --- a multiplier on the hourly rate: subject, level, extra subjects, extra seats --------- */
  // The running total after this row, for the last column. Rows before the hours are per hour;
  // after them, the figure is the booking. The unit says which.
  if (row.kind === 'rate-mult') {
    const m = Number(row.mult(L));
    // A multiplier of exactly 1 is a real answer — "this choice costs nothing extra" — and it read
    // as a blank row, which looks like a value that failed to load.
    if (!m || m === 1) { out.mul = row.value && row.value(L) ? 'no change' : ''; return out; }
    const base = row.of(L);
    const perHour = base * (m - 1);
    /* The multiplier AND the percentage. They are the same fact — x1.01 is +1% — and showing only
       one of them made rate multipliers look like a different kind of operation from the ones in
       the x column. They differ in WHERE they apply, not in what they are. */
    out.mul   = '× ' + Number(m).toFixed(m % 1 ? (m * 100 % 1 ? 3 : 2) : 0);
    out.rate  = signed(perHour, '/h');
    Object.assign(out, running());
    return out;
  }

  /* --- a fixed amount on the hourly rate: tuition, venue, hosting --------------------------- */
  const perHour = row.perHour(L);
  if (!perHour) {
    // No effect, but the running figure still belongs here: the column is read straight down, and
    // a gap in it looks like a number that failed rather than a row that did nothing.
    Object.assign(out, running());
    return out;
  }
  // Tuition is the rate itself rather than an addition to it, so it isn't signed.
  /* The base rate is itself a multiplier on nothing — the chain starts here — so it shows in the
     × column too. Without it the column began at "× 1.01" with no statement of what was being
     multiplied. */
  out.mul   = row.isBase ? '× ' + Number(perHour).toFixed(Number(perHour) % 1 ? 2 : 0) : '';
  out.rate  = row.isBase ? money(perHour) + '/h' : signed(perHour, '/h');
  Object.assign(out, running());
  return out;
}

/* ---------- IS THE STYLESHEET THERE? ----------------------------------------------------------
   A site with no CSS doesn't look like a site with no CSS — it looks like a site that has broken
   in some deep and unclear way, and the first instinct is to blame whatever changed last. It's
   worth ten lines to be told which it is.

   Checked by measuring something the stylesheet decides. If a card isn't laid out as a grid, the
   CSS didn't arrive — the file is missing, truncated, or hasn't been published yet.
--------------------------------------------------------------------------------------------- */
function checkStylesheet() {
  const probe = document.createElement('div');
  probe.className = 'field-line';
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  document.body.appendChild(probe);
  const styled = getComputedStyle(probe).display === 'grid';
  probe.remove();
  if (styled) return;

  const b = $('health-banner');
  if (b) {
    b.innerHTML = '⚠ <b>style.css did not load</b> — the page will look unformatted until it does. '
      + 'Open <code>style.css</code> on the site directly: if it 404s or looks short, re-upload it '
      + 'and wait for the build to finish.';
    b.classList.remove('hidden');
  }
  console.warn('@family. — style.css did not load. Everything else is fine.');
}

/* ---------- ONE WAY TO FILL A DROPDOWN --------------------------------------------------------
   Six places rebuilt a <select> and each was written differently — some kept the current value,
   some reset to the first option, some to blank. So changing the session length rebuilt every list
   on the card and silently discarded choices the client had already made.

   setOptions is the only way a list gets filled from here on:
     · the placeholder is always first, so "not chosen" is a state the control can be in
     · a value the person already picked SURVIVES, as long as it's still offered
     · a value that is no longer offered falls back to the placeholder, never to a substitute —
       quietly swapping someone's choice for a different one is worse than losing it

   That last rule is what makes filtering safe: a list can narrow whenever the facts change,
   because narrowing can only ever clear a choice, never replace it.
--------------------------------------------------------------------------------------------- */
function setOptions(el, values, opts) {
  if (!el) return;
  const o = opts || {};
  const label = o.label || (v => v);
  const list = (values || []).map(String);
  const had = el.value;

  /* WHY does an option say why it doesn't fit, instead of vanishing?
     Because a list that removes options can clear a choice the moment anything else changes — and
     it did, repeatedly: picking a venue with fewer seats than you'd asked for silently reset the
     seat count, picking a tutor reset the level, and each looked like the form deleting your work
     at random.
     Nothing is ever removed now. An option that doesn't fit is shown, disabled, with the reason
     attached. So `list` always contains everything, a rebuild can never fail to find what you
     chose, and the form has no way to lose an answer. The conflict becomes something you can SEE
     and resolve, rather than something that happens to you. */
  const why = o.why || (() => '');

  /* Options that don't fit are HIDDEN — with one exception, and the exception is what makes
     hiding them safe. A list that removes options can clear a choice the moment anything else
     changes, which is what it used to do: picking a venue with fewer seats than you'd asked for
     silently reset the seat count.
     So the option you have ALREADY CHOSEN is never removed, whether or not it still fits. It stays
     selected, marked with the reason, and the conflict is yours to resolve. Everything else that
     doesn't fit simply isn't offered — a list of greyed-out entries you can't pick is a list of
     things you have to read past. */
  const shown = list.filter(v => !why(v) || String(v) === String(had));

  el.innerHTML = `<option value="">${o.placeholder || NONE_LABEL}</option>`
    + shown.map(v => {
        const reason = why(v);
        return `<option value="${esc(v)}"${reason ? ' disabled data-why="' + esc(reason) + '"' : ''}>`
          + esc(label(v)) + (reason ? ' — ' + esc(reason) : '') + '</option>';
      }).join('');

  // The choice survives, always. It can only be lost by the person changing it.
  el.value = shown.includes(String(had)) ? had : '';

  /* If what they chose no longer fits, SAY so rather than undoing it. A booking that can't work is
     information; a booking that quietly rearranged itself is a betrayal of the form. */
  const chosenReason = had && shown.includes(String(had)) ? why(had) : '';
  const holder = el.parentElement;
  let warn = holder && holder.querySelector('.opt-warn');
  if (chosenReason) {
    if (!warn && holder) {
      warn = document.createElement('span');
      warn.className = 'opt-warn note';
      holder.appendChild(warn);
    }
    if (warn) warn.textContent = '⚠ ' + chosenReason;
    el.classList.add('opt-conflict');
  } else {
    if (warn) warn.remove();
    el.classList.remove('opt-conflict');
  }
  return chosenReason;
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
/* Every bookable space. A venue with rooms contributes one entry per room; a venue without
   contributes itself. One dropdown answers "where does this happen" — picking a building and then
   a room inside it is two questions for what is really one, and most venues have a single space
   and shouldn't ask twice. */
function bookableSpaces() {
  const out = [];
  (DATA.venues || []).forEach(v => {
    if (v.rooms && v.rooms.length) {
      v.rooms.forEach(r => out.push({
        label: v.title + ' \u2014 ' + r.name, venue: v.title, room: r.name,
        rate: r.rate, concession: r.concession, min: r.min, max: r.max, image: v.image,
        avail: r.avail, rowIndex: r.rowIndex, fields: r.fields,
        minHours: v.minHours, maxHours: v.maxHours
      }));
    } else {
      out.push({ label: v.title, venue: v.title, room: '',
                 rate: Number(v.bestRate) || 0, concession: 0,
                 min: v.minCapacity || 1, max: v.maxCapacity, image: v.image,
                 avail: v.avail, minHours: v.minHours, maxHours: v.maxHours });
    }
  });
  return out;
}

/** The space behind a chosen label, whether that's a room or a whole venue. */
function spaceFor(label) {
  const want = norm(label);
  return bookableSpaces().find(x => norm(x.label) === want) || null;
}

function venueCapacity(venueName) {
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
  const space = spaceFor(locEl && locEl.value);
  const cap = space ? { min: space.min || 1, max: space.max || 99 } : venueCapacity(locEl?.value);
  // The chosen tutor's own limits narrow it further — the seats on offer should be seats someone
  // will actually teach.
  const tName = document.querySelector(`.l-tutor[data-lesson="${i}"]`)?.value;
  const tut = tName ? (DATA.tutors || []).find(x => norm(x.title) === norm(tName)) : null;
  // Only a NAMED tutor narrows the seats. With no preference the seats on offer are the room's,
  // because any tutor who suits the booking can apply for it afterwards.
  if (tut) {
    if (tut.maxStudents) cap.max = Math.min(cap.max, tut.maxStudents);
    if (tut.minStudents) cap.min = Math.max(cap.min, tut.minStudents);
  }
  // Home venues need the whole group, so the minimum jumps to the venue's own minimum (or max).
  const min = (locEl && isHome(locEl.value)) ? Math.max(cap.min, cap.max) : cap.min;
  // '' when nothing has been chosen — not 1. Defaulting to one seat decides for the client and
  // then looks identical to them having decided.
  const prev = qtyEl.value;
  const opts = [];
  for (let n = min; n <= cap.max; n++) opts.push(n);
  if (!opts.length) opts.push(cap.max || 1);
  /* Counted as EXTRAS: 0 means one student. The old list counted seats, so "4" and "+600%" needed
     two sums in your head before they connected — with extras, the number shown is the number the
     fraction multiplies. */
  /* Every seat count, always — with the ones this room can't take marked rather than removed.
     Removing them is what wiped a chosen seat count the moment a smaller venue was picked. */
  const roomMax = cap.max || 99, roomMin = cap.min || 1;
  setOptions(qtyEl, [0, 1, 2, 3, 4, 5], {
    why: v => {
      const seats = Number(v) + 1;
      if (seats > roomMax) return (space ? space.label : 'this venue') + ' seats ' + roomMax;
      if (seats < roomMin) return 'needs at least ' + roomMin;
      return '';
    } });
  const lbl = document.querySelector(`.l-qty-label[data-lesson="${i}"]`);
  if (lbl) lbl.textContent = '';
}

// "split with N other people" — the bill is divided (N+1) ways, so N can never exceed
// (seats - 1): a lesson can't be split more ways than it has students. Options rebuild
// whenever the student count changes, keeping the current choice when it's still valid.
/** The people sharing this booking. How many there are IS how many boxes there are. */
function renderSplitEmails(i, addOne) {
  const wrap = document.querySelector(`.split-emails[data-lesson="${i}"]`);
  if (!wrap) return;
  const had = Array.from(wrap.querySelectorAll('.split-email')).map(el => el.value);
  if (addOne) had.push('');

  wrap.innerHTML = had.map((v, k) =>
    `<span class="split-one"><input type="email" class="split-email edit-input"
       data-lesson="${i}" data-k="${k}" placeholder="their email" value="${esc(v)}">
     <span class="text-action split-drop" data-lesson="${i}" data-k="${k}" title="Remove">✕</span></span>`
  ).join('')
  + `<span class="text-action split-add" data-lesson="${i}" title="Split with someone else">＋</span>`;
}

/** How many others are on this booking — the count of boxes, not a number chosen elsewhere. */
function splitCount(i) {
  return document.querySelectorAll(`.split-email[data-lesson="${i}"]`).length;
}

function syncSplitOptions(i) {
  const splitEl = document.querySelector(`.l-split[data-lesson="${i}"]`);
  if (!splitEl) return;
  /* Always 1 to 4, and NOTHING after setOptions. There used to be a line here reassigning .value
     from a list computed off the seat count, which undid the preservation setOptions had just done
     — so picking "2 others" set itself straight back to 0. Assigning .value after a rebuild is the
     exact pattern setOptions exists to remove; if a choice needs constraining, constrain the LIST. */
  setOptions(splitEl, [1, 2, 3, 4], { placeholder: '0' });
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
/**
 * Fill each day's row with its hours.
 *
 * One row per day rather than a table: the card already lays out a label, a value and figures, and
 * the grid was duplicating that with a 7 × 11 table squashed into a single value cell. Seven rows
 * use the layout instead of fighting it, and each day can report its own hours.
 *
 * Every hour is drawn on every day, always. Hours nobody is free for are disabled, not removed —
 * a grid that changes shape as you choose things can't be read, and it's the same rule the
 * dropdowns follow: show what doesn't fit and say why, never quietly drop it.
 */
function renderSlots(i) {
  const on = v => /^(true|yes|1|✓)$/i.test(String(v || '').trim());
  const g = DATA.availGrid || { hours: [9,10,11,12,13,14,15,16,17,18,19] };

  const tutorName = document.querySelector(`.l-tutor[data-lesson="${i}"]`)?.value || '';
  const venueName = document.querySelector(`.l-location[data-lesson="${i}"]`)?.value || '';
  const anyTutor = !tutorName;

  const picked = spaceFor(venueName);
  const venue = (DATA.venues || []).find(v => norm(v.title) === norm(picked ? picked.venue : venueName));
  const tutor = (DATA.tutors || []).find(t => norm(t.title) === norm(tutorName));

  // With no tutor named, ANY tutor's free hour counts — the job goes to whoever takes it.
  const tAvail = anyTutor
    ? (DATA.tutors || []).reduce((acc, t) => {
        Object.keys(t.avail || {}).forEach(c => { if (on(t.avail[c])) acc[c] = 'TRUE'; });
        return acc;
      }, {})
    : (tutor?.avail || {});
  const vAvail = (picked && picked.avail) || venue?.avail || {};

  const bookable = (code) => on(tAvail[code]) && on(vAvail[code]);

  // Why nothing is bookable, if nothing is — said above the rows rather than instead of them.
  const tHours = Object.keys(tAvail).filter(c => on(tAvail[c])).length;
  const vHours = Object.keys(vAvail).filter(c => on(vAvail[c])).length;
  const anyBookable = SLOT_DAYS.some(([p]) => g.hours.some(h => bookable(p + String(h).padStart(2,'0'))));
  const note = document.querySelector(`.l-slots-note[data-lesson="${i}"]`);
  if (note) {
    note.textContent = anyBookable
      ? 'Tick the hours you want. Adjacent hours make one session.'
      : !venueName ? 'Pick a venue to see when it\u2019s open.'
      : (!tHours && !vHours) ? 'Neither the venue nor any tutor has hours set.'
      : !tHours ? (anyTutor ? 'No tutor has hours set.' : tutorName + ' has no hours set.')
      : !vHours ? venueName + ' has no open hours set.'
      : 'The venue\u2019s hours and the tutor\u2019s don\u2019t overlap.';
  }

  SLOT_DAYS.forEach(([prefix]) => {
    const wrap = document.querySelector(`.l-slots-day[data-lesson="${i}"][data-day="${prefix}"]`);
    if (!wrap) return;
    // What was ticked, before the row is rewritten. The answer must outlive the markup showing it.
    const was = Array.from(wrap.querySelectorAll('.slot-cb:checked')).map(cb => cb.dataset.hour);

    wrap.innerHTML = g.hours.map(h => {
      const code = prefix + String(h).padStart(2, '0');
      const free = bookable(code);
      return `<label class="hr-box${free ? '' : ' hr-shut'}" title="${h}:00${free ? '' : ' — not available'}">
        <input type="checkbox" class="slot-cb" data-lesson="${i}" data-day="${prefix}"
               data-hour="${h}" data-daykey="${code}"${free ? '' : ' disabled'}>
        <span>${h}</span></label>`;
    }).join('');

    was.forEach(h => {
      const cb = wrap.querySelector(`.slot-cb[data-hour="${h}"]`);
      if (cb && !cb.disabled) cb.checked = true;
    });
  });

  layoutGrid(document.querySelector(`.l-slots-day[data-lesson="${i}"]`)?.closest('.grid'));
}


// Enforce "2 consecutive hours in ONE day" when a slot is ticked.
/**
 * Ticking the grid. A booking may now hold SEVERAL runs — Monday 1–3 and Tuesday 10–12 in one
 * lesson — because a family wanting two sessions a week of the same thing shouldn't have to build
 * a second lesson identical in every other respect.
 *
 * The rule is that every run is EXACTLY the session length. Not "at least": a three-hour block on
 * a two-hour booking would be a different lesson at a different price, so ticking a cell that
 * would extend a run past its length is refused rather than quietly repriced.
 */
function onSlotTick(i, day, hour, checked) {
  /* FREE-FORM. An hour toggles, and that's all.
     There used to be a session length chosen separately, and this function's job was to force the
     grid to agree with it — laying runs of exactly N hours, refusing clicks that wouldn't fit,
     clearing a whole run when one hour was untitcked. Every one of those behaviours existed only
     because two controls described one thing.
     Now a run of adjacent ticked hours IS a session, and its length IS the session length. There
     is nothing left to reconcile, so there is nothing left to go wrong. */
  calc();
  return;
}


/** Every ticked run for one lesson, as { day, hour } for the first hour of each. */
function lessonRuns(i) {
  const ticked = Array.from(document.querySelectorAll(`.slot-cb[data-lesson="${i}"]:checked`))
    .map(b => ({ day: b.dataset.day, hour: parseInt(b.dataset.hour) }));
  const runs = [];
  ticked.forEach(t => {
    // The first hour of a run is one with nothing ticked directly before it in the same day.
    const before = ticked.some(x => x.day === t.day && x.hour === t.hour - 1);
    if (before) return;
    // How long it runs for — adjacent ticked hours in the same day.
    let hours = 1;
    while (ticked.some(x => x.day === t.day && x.hour === t.hour + hours)) hours++;
    runs.push({ ...t, hours });
  });
  return runs.sort((a, b) => a.day.localeCompare(b.day) || a.hour - b.hour);
}

function fillLessonBlock(i) {
  const d = DATA.dropdowns || {};
  const set = (cls, list, labelFn) => {
    const el = document.querySelector(`.${cls}[data-lesson="${i}"]`);
    if (!el) return;
    const fmt = labelFn || (v => v);
    // A blank first option on every list, worded the same way. Without one, a select shows its
    // first value as though it had been chosen — which is how a booking gets a level nobody picked.
    setOptions(el, list || [], { label: fmt });
  };
  /* Only what fits what's already chosen. A tutor teaches certain subjects at certain levels, and
     offering the rest lets a client assemble a booking that no tutor can accept — which they only
     discover when nobody applies. */
  const chosenTutor = (DATA.tutors || []).find(t => norm(t.title) === norm(lval(i, 'l-tutor')));
  const tutorLevels = chosenTutor
    ? (chosenTutor.teaches || []).map(x => (String(x).match(/\(([^)]+)\)/) || [,''])[1]).filter(Boolean)
    : [];
  /* Every level, always. A tutor's `teaches` list is what they've written down, not a contract —
     filtering by it made every level they hadn't listed unbookable with them, which is a rule
     neither side agreed to and one nobody could see was being applied. */
  set('l-level', d.levels);
  // Rooms, not just buildings. A venue with several spaces contributes one entry each, so the
  // price and capacity that follow belong to the room actually being hired.
  /* Venues that can actually hold this booking, and that the chosen tutor will teach at. A room
     seating six shouldn't be offered for eight, and a tutor's comfort list exists to be used. */
  const wantSeats = Math.max(1, (parseInt(lval(i, 'l-qty')) || 0) + 1);
  const myHandle = chosenTutor ? norm(chosenTutor.handle) : '';
  /* Every space, with the reason it doesn't fit attached. A venue too small for the seats asked
     for is a conflict to resolve — either fewer seats or a different room — and hiding it made the
     seat count vanish instead, which explained nothing. */
  const spaces = bookableSpaces();
  setOptions(document.querySelector(`.l-location[data-lesson="${i}"]`), spaces.map(x => x.label), {
    why: label => {
      const sp = spaces.find(x => x.label === label);
      if (!sp) return '';
      if (sp.max && wantSeats > sp.max) return 'seats ' + sp.max;
      if (chosenTutor) {
        const v = (DATA.venues || []).find(x => norm(x.title) === norm(sp.venue));
        const list = (v && v.comfort) || [];
        if (list.length && !list.some(h => norm(h) === myHandle)) {
          return chosenTutor.title + ' does not teach here';
        }
      }
      return '';
    } });
  // Tutor: "No preference" first, then each tutor
  // The length control is gone: the grid says how many hours, and two controls describing one
  // fact is what made them able to disagree.

  const tutorEl = document.querySelector(`.l-tutor[data-lesson="${i}"]`);
  if (tutorEl) {
    const seats = Math.max(1, (parseInt(lval(i, 'l-qty')) || 0) + 1);
    const hrs = hoursPerWeek();
    // A limit of 0 means "not set", so it's treated as no limit rather than as a limit of zero.
    const willTake = t =>
      (!t.minStudents || seats >= t.minStudents) && (!t.maxStudents || seats <= t.maxStudents) &&
      (!t.minHours    || hrs   >= t.minHours)    && (!t.maxHours    || hrs   <= t.maxHours);
    // Only tutors are filtered. "No preference" is always offered, whatever the booking looks
    // like — a job nobody has claimed yet has no limits to break.
    const able = (DATA.tutors || []).filter(willTake);
    const prev = tutorEl.value;
    /* Every tutor, with the reason a booking is outside what they take. Filtering them out was
       why a chosen tutor could disappear when the seat count changed — and why the card had to
       carry a separate "1 tutor hidden" note explaining an absence. The reason belongs on the
       option itself. */
    setOptions(tutorEl, (DATA.tutors || []).map(t => t.title), {
      placeholder: 'No preference',
      why: name => {
        const t = (DATA.tutors || []).find(x => x.title === name);
        if (!t) return '';
        if (t.minStudents && seats < t.minStudents) return 'takes ' + t.minStudents + '+ seats';
        if (t.maxStudents && seats > t.maxStudents) return 'takes up to ' + t.maxStudents + ' seats';
        if (t.minHours && hrs && hrs < t.minHours)  return 'needs ' + t.minHours + '+ hours';
        if (t.maxHours && hrs && hrs > t.maxHours)  return 'does up to ' + t.maxHours + ' hours';
        return '';
      } });
  }
  // Term/interval: each lesson has its own. Bookable weeks are the term's remaining weeks
  // MINUS 1 — the last week is reserved so the tutor (and library) have prep/coordination time.
  const ivEl = document.querySelector(`.l-interval[data-lesson="${i}"]`);
  if (ivEl) {
    const intervals = getAcademicIntervals();
    /* Through setOptions like every other list. This was the ONLY dropdown assigning innerHTML
       directly, so it alone lost its selection every time anything else on the form changed —
       which is what wiped the interval, and with it the session count and every total.
       The data-* attributes are re-attached afterwards, since setOptions builds plain options. */
    setOptions(ivEl, intervals.map(iv => iv.name), {
      label: name => (intervals.find(iv => iv.name === name) || {}).label || name });
    Array.from(ivEl.options).forEach(opt => {
      const iv = intervals.find(x => x.name === opt.value);
      if (!iv) return;
      opt.dataset.weeks   = Math.max(0, (parseInt(iv.weeks) || 0) - 1);   // reserve 1 week
      opt.dataset.term    = iv.name;
      opt.dataset.start   = iv.startDate || '';
      opt.dataset.end     = iv.endDate || '';
      opt.dataset.lastsun = iv.lastSun || '';
    });
    syncBlockWeeks(i);
  }
  // Students, then split — split's options depend on how many students were picked.
  syncQtyOptions(i);
  syncSplitOptions(i);
  syncHostToggle(i);
  renderLessonPhotos(i);
  renderSlots(i);   // tutor × venue availability tickboxes for the chosen day
  /* The subject list, rebuilt WITHOUT losing what's ticked. Like the hour grid, the chosen
     subjects lived only as checked boxes — so redrawing the list threw them away, and this list is
     redrawn whenever anything on the form changes. Changing the level wiped the subjects. */
  const drop = document.querySelector(`.l-subject-dropdown[data-lesson="${i}"]`);
  if (drop) {
    const chosen = Array.from(drop.querySelectorAll('.subj-cb:checked')).map(cb => cb.value);
    drop.innerHTML = (d.subjects || []).map(s =>
      `<label><input type="checkbox" class="subj-cb" data-lesson="${i}" value="${esc(s)}"${
        chosen.includes(s) ? ' checked' : ''}> ${esc(s)}</label>`).join('');
    // And the label above it, which reports the choice rather than storing it.
    const disp = document.querySelector(`.l-subject-display[data-lesson="${i}"]`);
    if (disp) disp.textContent = chosen.length ? chosen.join(', ') : NONE_LABEL;
  }
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
  'current academic interval':          'Current Interval',
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
// weeksInWindow lived here. It was a second implementation of the operating-window rule, and
// two copies of one rule is how the site and the server came to disagree about which intervals
// were bookable. The backend computes it; the site uses what it's sent.


function getAcademicIntervals() {
  const isPlainCurrent = rel => String(rel || '').toLowerCase()
    .replace(/\s+/g, ' ').trim() === 'current academic interval';
  return (DATA.intervals || [])
    .filter(iv => iv.term || iv.rel)
    .filter(iv => !isPlainCurrent(iv.rel))     // clients can't book the current interval
    .map(iv => {
      const rel = String(iv.rel || '').toLowerCase().trim();
      const term = iv.term || iv.rel;
      /* Weeks come from the BACKEND now — it computes the operating window (first Monday to last
         Sunday inside the interval) and sends it. This used to be worked out here as well, and the
         two implementations disagreed: the site offered a different set of intervals from the one
         the server considered bookable. */
      const lastSun = iv.closesOn || iv.lastSun || iv.endDate;
      // The backend's figure, full stop. Recomputing it here is what made the two disagree, and a
      // local fallback would quietly reintroduce exactly that.
      const weeks = Math.max(0, parseInt(iv.weeks) || 0);
      const friendly = intervalFriendly(rel);
      // An admin sees when a term's dates are the wrong way round, because the symptom — two
      // terms offering the same weeks — looks like a site fault rather than a sheet one.
      const label = (iv.label || (term && friendly ? `${term} (${friendly})` : term))
        + (iv.dateFault && isAdmin() ? '  ⚠ dates reversed' : '');
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

  // term is now per-lesson; order-level sync just recalcs

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

// Hours taught per week — ONE source, read from a sheet variable so it isn't hardcoded in
// two pricing functions (which could silently disagree). Add a category=variable row named
// `hours_per_week` (or `hours`) to control it; falls back to 2 if the sheet doesn't set it.
/** The chosen venue and tutor, pictured. Redrawn whenever either changes. */
/**
 * A drawn stand-in for a picture that doesn't exist yet.
 *
 * Original geometry, same as the avatars: a plain room and a plain figure, in the paper's own ink.
 * Deliberately not a photograph and not a famous icon set — it should read as "not chosen yet"
 * rather than as a real place or a real person, and it should cost nothing to load.
 */
function placeholderArt(kind, label) {
  const say = kind === 'venue'
    ? (label ? esc(label) : 'No venue yet')
    : (label ? 'Any tutor' : 'No tutor yet');
  const art = kind === 'venue'
    // A simple building: a box, a pitched roof, a door and two windows.
    ? `<path d="M14 42V22l18-11 18 11v20z" fill="none" stroke="currentColor" stroke-width="2"/>
       <rect x="28" y="30" width="8" height="12" fill="currentColor" opacity=".5"/>
       <rect x="19" y="26" width="6" height="6" fill="currentColor" opacity=".3"/>
       <rect x="39" y="26" width="6" height="6" fill="currentColor" opacity=".3"/>`
    // A figure: head and shoulders, the same shapes the avatars use.
    : `<circle cx="32" cy="22" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
       <path d="M16 46a16 16 0 0 1 32 0" fill="none" stroke="currentColor" stroke-width="2"/>`;
  return `<span class="ph-art" title="${say}">
    <svg viewBox="0 0 64 52" aria-hidden="true">${art}</svg>
    <span class="ph-say">${say}</span>
  </span>`;
}

function renderLessonPhotos(i) {
  const wrap = document.querySelector(`.job-photos[data-lesson="${i}"]`);
  if (!wrap) return;
  const chosen = spaceFor(lval(i, 'l-location'));
  const venue = (DATA.venues || []).find(v => norm(v.title) === norm(chosen ? chosen.venue : lval(i, 'l-location')));
  const tutor = (DATA.tutors || []).find(t => norm(t.title) === norm(lval(i, 'l-tutor')));
  /* Two frames, always. An unchosen venue or an open booking used to contribute nothing, so the
     pair collapsed to one picture or none — and a card showing a single photo reads as a class
     with a tutor and no room, rather than one still being decided.
     A placeholder holds the space and says which half is open. */
  // tpl.img tapes them, like every other photo on the site — a picture on this card was the only
  // one stuck down differently.
  wrap.innerHTML =
    (venue && venue.image ? tpl.img(venue.image) : placeholderArt('venue', chosen ? chosen.label : ''))
    + (tutor && tutor.image ? tpl.img(tutor.image) : placeholderArt('tutor', lval(i, 'l-tutor')));
  layoutGrid(wrap.closest('.grid'));
}

/** Session length for one lesson: what the client picked, falling back to the configured default. */
/** Hours ticked per week — the length of one session, read from the grid rather than a control. */
function lessonHours(i) {
  const runs = lessonRuns(i);
  if (!runs.length) return 0;
  // The length of the FIRST run. Runs can differ — Monday 1-3 and Tuesday 10-11 is a legitimate
  // arrangement — so this is the representative session length; the price uses the total ticks.
  return runs[0].hours || 0;
}

/** Every ticked hour, across every day. This is what the price multiplies. */
function tickedHoursPerWeek(i) {
  return document.querySelectorAll(`.slot-cb[data-lesson="${i}"]:checked`).length;
}

/* tickHours lived here — the grid needed a length to lay a run of exactly N hours, and
   ticking has been free-form since. */

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
  // A room's own rate wins over the building's — a small room and a large one at Richmond are
  // different prices, and the venue's single figure could only ever be right for one of them.
  const space = spaceFor(loc);
  const venueRate = space ? space.rate : (venue ? (parseFloat(venue.bestRate) || 0) : 0);
  const V = hosting ? 0 : venueRate;

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
  /* WHAT THE CLIENT PAYS PER HOUR, before any multiplier.
     A tutor sets ONE number: their charge-out rate — what an hour with them costs. That replaced
     setting their pay and letting a markup do the rest, which meant nobody could see their own
     headline rate without doing the sum.
     Minimum wage is fixed and is not a rate: it's the floor the tutor is paid from, and the only
     thing it does here is tell you when a charge-out rate has dropped below what it costs to pay
     someone legally. */
  // Two ways to book, two rates:
  //   a named tutor  -> that tutor's own rate_per_hour
  //   No preference  -> the `open_rate` in config
  // open_rate falls back to the HIGHEST rate any tutor charges, because whoever ends up taking an
  // open job has to be covered by the price already agreed. Set it below the dearest tutor and the
  // difference comes out of your margin every time they're the one who applies.
  const tutorRow = tutor ? (DATA.tutors || []).find(t => norm(t.title) === norm(tutor)) : null;
  const tutorRate = Number(tutorRow && tutorRow.rate) || 0;
  // Named tutor: their own charge-out rate. No preference: the open rate, which is fixed because a
  // job nobody has claimed can't be priced on the rate of a tutor who hasn't taken it yet.
  const chargeRate = tutorRate > 0 ? tutorRate : OPEN_RATE;
  const usingTutorRate = tutorRate > 0;
  const M = tutorRate || cv('M', 'minimum wage', 'min wage', 'μ', 'mu');   // tutor's £/hr
  const wMul = cvD('w', 1, 'wage multiplier', 'W', 'λ', 'lambda');  // wage multiplier (default 1)
  const L = sur('levels', level);   // level  surcharge £/h/child
  /* With several days and times in one booking, the DEAREST applies. Averaging would let a cheap
     Monday offset a Sunday, so a booking that includes the expensive slot would cost less than one
     that is only the expensive slot. */
  const worstOf = (group, csv) => String(csv || '').split(',').map(x => x.trim()).filter(Boolean)
    .reduce((hi, one) => Math.max(hi, sur(group, one)), 0) || 1;
  const D = worstOf('days',  day);
  const T = worstOf('times', time);

  // Subjects: the AVERAGE of the chosen subjects' £ surcharges — so a pricey subject among
  // three exerts only a third of its pull. (Σ Sᵢ)/k, written out.
  const subjAdds = subjects.map(x => { const q = num((m.subjectsEta || {})[x]); return (isNaN(q) || q <= 0) ? 1 : q; });
  const k = Math.max(1, subjAdds.length);                       // k = subject count
  // The mean of the chosen subjects' multipliers: Maths at 1.0 and Physics at 1.2 gives 1.1, so a
  // dear subject among three carries a third of its weight. No subjects chosen means no effect.
  const avgSubject = subjAdds.length ? subjAdds.reduce((x, y) => x + y, 0) / k : 1;

  // --- Rates (0 switches the effect off) ---
  const s = cv('s', 'subject count rate', 'subject_count_rate');  // 1 + s(k−1)
  const c = cv('c', 'extra child rate', 'extra_child_rate');      // tutor's share of each extra child
  const B = cv('B', 'boss rate', 'boss_rate');                    // YOUR cut per extra child
  const b = cv('b', 'bulk discount rate', 'bulk_discount_rate');  // 1 − b(W−1)
  const a = cv('a', 'advance booking rate', 'early booking rate');// 1 − a(A−1)

  /* No fallback. An unchosen length is 0, not the configured default — a default here put
     'x 2 hrs' on the card beside a control still reading '———', which is the site answering on the
     client's behalf and then showing them the answer as though they'd given it. */
  const h = num(spec.hours) > 0 ? num(spec.hours) : 0;

  /* The ACTUAL sessions that will run, across EVERY run in the booking. A lesson on Monday and
     Tuesday has two sessions a week, so its dates — and its price — are both runs' dates put
     together. Reading only the first weekday was what made a second slot free. */
  const runList = spec.runs && spec.runs.length ? spec.runs
    : String(day || '').split(',').map(x => x.trim()).filter(Boolean).map(d => ({ dayName: d }));
  const DAY_FROM_PREFIX = { m:'Monday', tu:'Tuesday', w:'Wednesday', th:'Thursday',
                            f:'Friday', sa:'Saturday', su:'Sunday' };
  /* One date per DAY, not per run.
     Dates were generated per run, so two separate blocks on the same Monday — 10-11 and 14-15 —
     produced Monday twice and multiplied the whole booking by two Mondays. A date is a date the
     class meets; how many blocks it holds is already counted in the hours. */
  const bookedDays = [...new Set(runList
    .map(r => r.dayName || DAY_FROM_PREFIX[r.day] || '')
    .filter(Boolean))];
  const sessionDates = bookedDays
    .map(d => computeSessionDates(d, lastSun, startDate))
    .reduce((all, list) => all.concat(list), [])
    .sort((a, b) => a - b);
  // A live job already knows how many sessions it runs; only a fresh booking derives them
  // from the term window. spec.slots lets a job card price itself without a term dropdown.
  /* Sessions come from the actual dates. Before days are ticked there are none — and "|| 1" was
     inventing one, which is where a single phantom session and its totals came from.
     The weeks remaining in an interval is a DIFFERENT number: a booking may run once a week or
     three times, so it can be reported but never counted from. */
  const slots = spec.slots || sessionDates.length || 0;
  const weeksLeft = interval ? (parseFloat(spec.weeks) || 0) : 0;
  const W = slots;                             // bill by real sessions, not raw week count
  const firstDate = sessionDates[0] || null;
  const A = firstDate ? Math.max(0, Math.floor((firstDate - new Date()) / (7 * 864e5))) : 0;

  // --- The parts ------------------------------------------------------------------------------
  // Subjects and seats are FRACTIONS of the base rate, not flat amounts. A flat £5 for a second
  // seat means 36% more on a £14 tutor and 20% more on a £25 one — the same number meaning two
  // different things, and needing re-tuning every time a rate moves. As a fraction it holds its
  // meaning: 0.4 is "an extra seat costs 40% of the first", whoever is teaching.
  //
  // Both sit INSIDE the discount brackets, so a long booking discounts the extra seats too.
  // The venue stays outside: room hire doesn't change with how many people are in the room.
  // Everything in the hourly bracket is now a multiplier. One kind of thing instead of two: a
  // surcharge no longer has to be re-tuned when a tutor's rate moves, because 1.1 means "10% more"
  // whoever is teaching, where £1 meant 3.6% on one rate and 2.0% on another.
  const baseHourly = chargeRate * avgSubject * L * D * T;
  const fSubjects  = 1 + s * (k - 1);                     // each extra subject adds a fraction
  /* The tutor's own extra-seat fraction when they've set one, the config default otherwise. Only
     THEIR share is replaced: B stays yours, so a tutor deciding a second student is worth 20% more
     of their time can't move your margin while doing it. */
  /* A per-seat share is a FRACTION of the rate: 0.3 means a second student adds 30%, and 1 means
     it adds the full rate again. 1 is a real setting, so it's honoured — the old guard rejected
     anything at or above 1 as a leftover pound figure and threw away a deliberate choice without
     saying so.
     What's still rejected is a value large enough to be unmistakably an amount rather than a
     fraction: nobody means "a second student costs five times the first". */
  const asFraction = (x, fallback) => (x > 0 && x <= 2) ? x : fallback;
  const cRaw = (tutorRow && Number(tutorRow.extraSeat) > 0) ? Number(tutorRow.extraSeat) : c;
  const cUsed = asFraction(cRaw, 0);
  const bUsed = asFraction(B, 0);
  // Which one won, for the admin view. A silent fallback and a read value look the same on a card.
  const ignored = [];
  if (cRaw > 2) ignored.push(`c ${cRaw}`);
  if (B > 2) ignored.push(`B ${B}`);
  const seatSource = ignored.length
    ? `ignoring ${ignored.join(' and ')} — not fractions`
    : ((tutorRow && Number(tutorRow.extraSeat) > 0) ? `tutor ${cUsed} + B ${bUsed}`
                                                    : `config ${cUsed} + B ${bUsed}`);
  const fSeats     = 1 + (cUsed + bUsed) * (n - 1);
  /* Both discounts count units BEYOND the first: the first session and the first week earn
     nothing. That count cannot go below zero — booking for this week is not a reason to charge
     more, and (A−1) with A=0 turned a 2% discount into a 2% surcharge. */
  /* Three discounts, all counting units BEYOND the first, all clamped at zero — a discount that
     goes negative becomes a surcharge, which is how booking for this week once ADDED 2%.
       bulk    rewards volume: how many sessions in total
       ahead   rewards notice: how far off the first one is
       consec  rewards commitment: unbroken weeks, which is what makes a slot worth holding
     Bulk and consec differ on a term with gaps — ten sessions scattered over fifteen weeks earns
     the bulk discount and not the consecutive one, which is the distinction worth paying for. */
  /* Both neutral. The coefficients are still read from config so nothing downstream breaks, but
     they don't move the price while there's no row on the card to say they did. */
  const fBulk      = 1;
  const fAdvance   = 1;
  /* A block discount — cheaper per hour for a longer unbroken session — was asked for and isn't
     here, deliberately. It can't be a factor on the whole booking the way these are, because it's
     a property of each SESSION: Monday 13-17 earns it and Tuesday 10-11 doesn't, and no single
     number is true of both. Building it properly means pricing each run and summing, which is a
     different shape of formula. See NOTES.md. */
  const discountFactor = fBulk * fAdvance;
  const discountFloored = false;
  const F = 0;

  // Kept under their old names so nothing downstream had to change.
  const perChildHourly = baseHourly;
  const R = baseHourly * fSubjects;
  const addSubjects = R - baseHourly;                      // what the extra subjects added, in £
  const addChildren = R * (fSeats - 1);                    // what the extra seats added, in £
  const fSubjectCount = fSubjects, fChildrenAll = fSeats;

  const promoAdj = activePromoFactor({ subjects, n, weeks: W, day, time, level,
                                       lessonCount: spec.lessonCount || 1 });

  /* Hours a week, times weeks. Simpler and truer than sessions x session-length: a booking with
     Monday 1-3 and Tuesday 10-11 has two sessions of different lengths, which the old pair of
     numbers could not express at all. */
  /* Weeks the booking runs for. Sessions divided by runs-per-week — a Monday-and-Tuesday booking
     over 11 weeks has 22 sessions but runs for 11 weeks, and hours-a-week must multiply the
     second, not the first. */
  // Days a week, not blocks a week — for the same reason the dates are per day.
  const runsPerWeek = Math.max(1, bookedDays.length || 1);
  const weeksBooked = weeksLeft || (slots ? Math.round(slots / runsPerWeek) : 0);
  const hoursTotal = (num(spec.hoursPerWeek) || 0) * weeksBooked;
  /* The per-hour figure is real as soon as a rate is known — it does not need a length or a term.
     The TOTAL does: without hours there is nothing to total, and showing £0.00 there reads as a
     price rather than as an unanswered question. So they are computed separately and the card is
     told which is which. */
  /* SPLITTING DIVIDES BOTH FIGURES.
     The share was computed and then never used — the card showed the whole price with a "÷ 2" row
     beside it, so the number a client was actually being asked for appeared nowhere. And an hourly
     rate that ignores the split is the wrong rate for every person reading it: three families
     sharing a £30/h booking each pay £10/h, and that is the figure they need.
     Both the rate and the total are per person now, which is who the card is addressed to. */
  const splitShares = splitOthers + 1;
  const chargePerHour = (R * fSeats * discountFactor * promoAdj + V) / splitShares;
  const total = hoursTotal ? chargePerHour * hoursTotal : null;

  // The three shares. They must add up to exactly what the client pays, so each is derived from
  // the same numbers rather than computed independently:
  //   the tutor is paid their own rate plus every teaching surcharge
  //   your margin is the markup M(w−1)
  //   the extra-seat money is split between you by the ratio of c to B
  const seatExtraPerHour = R * (fSeats - 1) * discountFactor * promoAdj;
  const cbTotal = (cUsed + bUsed) || 1;                            // no divide-by-zero when both are 0
  /* The tutor is paid their own rate, with every surcharge that belongs to teaching — subject,
     level, day, time. All of it is their work, so all of it is theirs.
     Your share is B alone: what an extra seat is worth to you, which is the one part of the price
     that isn't hours taught. Both carry the same multipliers, so the two still add to exactly what
     the client pays. */
  const tutorBase = (chargeRate * avgSubject * L * D * T) * fSubjects * discountFactor * promoAdj;
  const yourBase  = 0;

  const tutorPay    = (tutorBase + seatExtraPerHour * (cUsed / cbTotal)) * hoursTotal;
  const profitTotal = (seatExtraPerHour * (bUsed / cbTotal)) * hoursTotal;
  const venueTotal  = V * hoursTotal;                                   // venue gets
  const cost        = tutorPay + venueTotal;                            // what the job costs us

  // The tutor's effective £/hour — surfaced so you can SEE if discounts push it under minimum
  // wage (the formula doesn't silently clamp it; this just makes the number visible).
  const tutorHourly = hoursTotal ? tutorPay / hoursTotal : 0;
  const belowMinWage = M > 0 && tutorHourly > 0 && tutorHourly < M;

  // The whole booking, before it's divided — what the tutor and the venue are actually paid,
  // which is a different question from what one family hands over.
  const wholeTotal = total === null ? null : total * splitShares;
  const shareAmount = total;
  return {
    i, total, weeks, slots, n, V, loc, day, time, level, subjects, tutor, interval, endDate, startDate, lastSun,
    // True once we know the real dates; a term-based estimate still shows, marked as provisional.
    slotsKnown: spec.slotsKnown !== false && slots > 0,
    // Weeks remaining in the chosen interval — reportable, never counted from.
    weeksLeft,
    provisional: !sessionDates.length && slots > 0,
    runs: runList,
    // What the venue WOULD cost. V is zero when hosting, so without this the saving can't be shown.
    venueRate, hosting, seatSource,
    hoursPerWeek: num(spec.hoursPerWeek) || 0, weeksBooked,
    // The two discount factors, so the card can show them as their own rows rather than folding
    // them silently into the total.
    fBulk, fAdvance, A,
    // The headline rate actually in play: this tutor's, or the open rate. The Tuition row shows it,
    // and showing anything else is how an edited rate appeared to have no effect.
    chargeRate,
    // The real dates this booking runs on. These ARE the billing basis — slots is their count —
    // so showing them is showing the client exactly what they're paying for, not a summary of it.
    sessionDates, firstDate,
    // every factor exposed so the breakdown can explain the price
    M, wMul, L, D, T, avgSubject, k, s, c, B, b, a, h, A, W,
    usingTutorRate,
    perChildHourly, addSubjects, addChildren, fSubjectCount, fChildrenAll, fBulk, fAdvance,
    discountFactor, discountFloored, F, R,
    chargePerHour, hoursTotal, tutorPay, venueTotal, cost, tutorHourly, belowMinWage,
    promoAdj, splitOthers, splitShares, shareAmount, profitTotal, wholeTotal,
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
  // A surcharge is a MULTIPLIER now, so the neutral value is 1 rather than 0. Blank, missing and
  // zero all mean "no effect" — a rate nobody has set must never zero a booking, and 0 is the value
  // a half-filled sheet is most likely to hold.
  const sur = (group, value) => {
    const x = num((m[group] || {})[value]);
    return (isNaN(x) || x <= 0) ? 1 : x;
  };

  const subjects = lsubjects(i);
  // The control holds EXTRA seats; the price works in total seats, so the one that's always there
  // is added back here rather than everywhere downstream.
  const n = Math.max(1, (parseInt(lval(i, 'l-qty')) || 0) + 1);
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
  // A lesson may run on several days a week now, so day and time are LISTS. Written as comma
  // strings because that's what the sheet holds and what the surcharge lookups read one at a time.
  const runs = lessonRuns(i);
  const day  = runs.map(r => PREFIX_DAY[r.day] || '').filter(Boolean).join(', ');
  const time = runs.map(r => String(r.hour).padStart(2, '0') + ':00').join(', ');
  const level = lval(i, 'l-level');
  const tutor = lval(i, 'l-tutor');
  const splitOthers = splitCount(i);   // as many as have been named


  const hostEl = document.querySelector(`.l-host[data-lesson="${i}"]`);
  const hosting = isHome(loc) || (hostEl && hostEl.checked);
  return priceFrom({
    i, subjects, n, level, loc, hosting, day, time, splitOthers, runs,
    hours: lessonHours(i),
    hoursPerWeek: tickedHoursPerWeek(i),
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
    const mult = x => (!x || Number(x) === 1) ? '—'
      : (Number(x) > 1 ? '+' : '−') + Math.abs(Math.round((Number(x) - 1) * 1000) / 10) + '%';
    // Totals only mean anything once the length is known, so they stay dashed until a slot is
    // ticked — otherwise they'd quietly report the cost of one invented session.
    const tot  = (x, atCost) => (ok && x) ? `+ ${money(totOf(x, atCost))}` : '—';
    const setV = (key, html) => { const el = block.querySelector(`[data-val="${key}"]`); if (el) el.innerHTML = html; };
    const setM = (key, html) => { const el = block.querySelector(`[data-mul="${key}"]`); if (el) el.innerHTML = html; };
    // setU went with the second running column — there is one now, and setT fills it.
    const setR = (key, html) => { const el = block.querySelector(`[data-rate="${key}"]`); if (el) el.innerHTML = html; };
    const setT = (key, html) => { const el = block.querySelector(`[data-total="${key}"]`); if (el) el.innerHTML = html; };

    const base = (L.M || 0) * (L.wMul || 0);
    setR('base', `${money(base)}/h`);
    setT('base', ok ? `<b>${money(totOf(base))}</b>` : '—');
    // Kept apart on purpose: (ΣSᵢ)/k and s(k−1) are two different charges that both come from the
    // subjects, and adding them into one row hid the second entirely. With one subject the second
    // is always zero — so on a single-subject booking there is nothing to see, and on a two-subject
    // one a charge appears from nowhere unless it has a line of its own.
    const subjectAdd = (L.avgSubject || 0);
    // The two subject charges are separate rows, so each needs its own refresh. Leaving the second
    // unwired renders it once and freezes it on a dash, which reads as "there is no charge" rather
    // than "nobody updated this".
    const multWorth = (x, of) => (!x || Number(x) === 1) ? '—'
      : ((Number(x) > 1 ? '+ ' : '− ') + money(Math.abs(of * (Number(x) - 1)) * (L.discountFactor || 1) * (L.promoAdj || 1) * (L.hoursTotal || 0)));
    /* Refresh every priced row from the SAME table the renderer used. There is no list of setter
       calls to keep in step any more — a row that exists is refreshed, because both halves ask the
       same question of the same data. */
    const fmt = { money, esc, pct: mult };
    PRICE_ROWS.forEach(r => {
      const c = priceCells(r, L, fmt);
      setM(r.key, c.mul);
      setR(r.key, c.rate);
      setT(r.key, c.total);
      // The VALUE too, where the row derives one. This was the gap: a row could show the right
      // money beside the wrong number, because only the money was ever refreshed.
      if (r.value) setV(r.key, esc(r.value(L)));
    });
    // The When row is a container rather than a priced row, so it isn't in PRICE_ROWS — but its
    // two reporting cells still have to be refreshed, or they freeze the way unrefreshed cells do.
    /* Each day's own hours, in the same columns as everything else. A day with nothing ticked
       says nothing rather than zero — zero is a figure, and an untouched day hasn't got one. */
    setM('dates', '');
    setM('hoursweek', L.hoursPerWeek ? esc('× ' + L.hoursPerWeek) : '—');
    setT('hoursweek', (L.hoursPerWeek && L.weeksBooked)
      ? money(runningAfter('hoursweek', L))
      : `<span class="note">${L.hoursPerWeek ? 'pick a time interval' : 'tick some hours'}</span>`);

    setT('clienttotal', `<b>${money(L.wholeTotal ?? L.total)}</b>`);
    setT('tutorpay',    `<b>${money(L.tutorPay)}</b>`);
    setT('venuetotal',  `<b>${money(L.venueTotal)}</b>`);
    setT('profit',      `<b>${money(L.profitTotal)}</b>`);
    // perhour and total went with the Total row — the running column carries both now.
    setT('tutorpay', ok ? `<b>${money(L.tutorPay)}</b>` : '—');
    setT('venuetotal', ok ? `<b>${money(L.venueTotal)}</b>` : '—');
    setT('profit', ok ? `<b>${money(L.profitTotal)}</b>` : '—');
    const dl = (L.sessionDates || []).map(d => fmtDate(d));
    const setEl = (attr, html) => { const el = block.querySelector(`[data-${attr}]`); if (el) el.innerHTML = html; };
    // Only with an interval chosen — the lesson's own window exists before anything is picked, so
    // showing it stated a start and an end for a booking that had neither.
    // starts and ends went with their rows — the dates below say both.
    setEl('dates',  dl.length ? `<span class="fl-dates">${esc(dl.join(', '))}</span>` : '—');
    setT('dates',   dl.length ? esc(dl.length + ' dates') : '—');

  });

  document.querySelectorAll('.lesson-block').forEach(b => enforceHomeRuleBlock(parseInt(b.dataset.lesson)));
}

/** Write the checklist back and redraw it. */
function saveTodo(text) {
  USER.todo = text;
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  renderTools();
  const status = $('todo-status');
  if (status) status.textContent = 'Saving…';
  clearTimeout(window._todoTimer);
  window._todoTimer = setTimeout(() => {
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'saveTodo', name: USER.name, todo: text }) })
      .then(r => r.json())
      .then(d => { const el = $('todo-status'); if (el) el.textContent = (d && d.error) ? d.error : 'Saved ✓'; })
      .catch(() => { const el = $('todo-status'); if (el) el.textContent = 'Not saved — check connection'; });
  }, 600);
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
    target: 'tutors', card: it => tpl.card(it),
    text: x => (x.title + x.subtitle + (x.tags||[]).join(' ')),
    fields: {
      subject:  { label: 'Subject',  opts: () => DATA.dropdowns?.subjects || [], match: (x,v) => (x.tags||[]).map(t=>t.toLowerCase()).includes(v) },
      city:     { label: 'City',     opts: () => uniq((DATA.tutors||[]).map(t=>t.city)),    match: (x,v) => norm(x.city) === v },
      borough:  { label: 'Borough',  opts: () => uniq((DATA.tutors||[]).map(t=>t.borough)), match: (x,v) => norm(x.borough) === v },
    }
  },
  venue: {
    target: 'venues', card: it => tpl.card(it),
    text: x => (x.title||''),
    fields: {
      focus:   { label: 'Focus',
                 opts: () => (DATA.options || {}).focus || ['Academic', 'Sporty', 'Other'],
                 match: (x, v) => (x.focus || []).some(f => norm(f) === v) },
      borough: { label: 'Borough', opts: () => DATA.dropdowns?.boroughs || [], match: (x,v) => norm(x.borough) === v },
      city:    { label: 'City',    opts: () => uniq((DATA.venues||[]).map(t=>t.city)), match: (x,v) => norm(x.city) === v },
    }
  },
  class: {
    target: 'classes', card: j => tpl.jobCard(j, false, classState(j)),
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
    target: 'shop', card: it => tpl.shopCard(it),
    render: items => html('shop', items.length
      ? items.map(tpl.shopCard).join('')
      : '<p class="muted">No items match.</p>'),
    text: x => (x.name + ' ' + (x.description||'')),
    fields: {
      unit: { label: 'Pay with', opts: () => uniq((DATA.shop||[]).map(s => s.unit)), match: (x,v) => norm(x.unit) === v },
      slot: { label: 'Avatar slot', opts: () => uniq((DATA.shop||[]).map(s => s.slot)),
              match: (x,v) => norm(x.slot) === v },
      kind: { label: 'Kind', opts: () => ['thing', 'avatar'], match: (x,v) => norm(x.kind) === v },
    }
  },
  post: {
    target: 'posts', card: p => tpl.socialPost(p),
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
    target: 'checklist-content', card: (it, i, all) => tpl.checklistBandCard(it, i, all),
    // The only section whose cards are BUILT from many items, so the only one where grouping has
    // anything to change.
    groupable: true,
    source: () => checklistItems('auto', activeGroup.tool || ''),
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
      examWave:     { label: 'Exam wave',      opts: () => uniq(allTopicFieldValues('examWave')), match: (x,v) => x.examWaves.includes(v) },
      resourceType: { label: 'Resource type',  opts: () => uniq(allTopicFieldValues('resourceType')), match: (x,v) => x.resourceTypes.includes(v) },
      company:      { label: 'Company',        opts: () => uniq(allTopicFieldValues('company')),  match: (x,v) => x.companies.includes(v) },
      stage:        { label: 'Stage',          opts: () => uniq(allTopicFieldValues('stage')),    match: (x,v) => x.stages.includes(v) },
      paper:        { label: 'Print-out needed', opts: () => ['Yes'], match: (x,v) => x.hasPaper },
    }
  },
};

const uniq = arr => [...new Set((arr||[]).filter(Boolean))];

// Active filters per section: { tutor: {subject:'maths'}, ... }
const activeFilters = {};
// Which field each section is grouped by. '' means ungrouped, which is the default everywhere.
const activeGroup = {};
// Which field each section is sorted by. '' = automatic, i.e. the section's own natural order.
const activeSort = {};

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

  // SORT — the same control on every section, built from that section's own fields.
  const fieldOpts = chosen => Object.keys(def.fields)
    .map(f => `<option value="${f}"${chosen === f ? ' selected' : ''}>${esc(def.fields[f].label)}</option>`).join('');
  const sortBy = `<select class="filter filter-sort" data-prefix="${prefix}" title="Sort by">
      <option value="">Sort: automatic</option>${fieldOpts(activeSort[prefix] || '')}
    </select>`;

  // GROUP BY — which single attribute decides what shares a card. Only the Checklist builds cards
  // out of many items, so it's the only section where this has anything to change: a tutor card
  // holds one tutor, and there is nothing to regroup. Its options are the card-forming dimensions
  // rather than the filter fields, because offering a field a card can't be built from would be a
  // control that does nothing.
  const GROUP_LABEL = { subject:'Subject', band:'Grade / Stage', resourceType:'Resource type',
    printout:'Print-out', keystage:'Key stage', examBoard:'Exam board', examWave:'Exam wave',
    tier:'Tier', company:'Company' };
  const groupBy = def.groupable
    ? `<select class="filter filter-group" data-prefix="${prefix}" title="Group by">
        <option value="">Group: automatic</option>
        ${CARD_DIMS.map(d => `<option value="${d}"${(activeGroup[prefix] || '') === d ? ' selected' : ''}>${
          esc(GROUP_LABEL[d] || d)}</option>`).join('')}
      </select>`
    : '';

  bar.innerHTML = search + dropdowns + addChip + sortBy + groupBy;
}

function applyFilter(prefix) {
  const def = FILTER_DEFS[prefix];
  if (!def) return;
  const active = activeFilters[prefix] || {};
  const q = norm(val(`${prefix}-search`));
  const source = def.source ? def.source()
    : (DATA[def.target === 'classes' ? 'clientClasses' : def.target] || []);
  let items = source.filter(x => {
    if (q && !def.text(x).toLowerCase().includes(q)) return false;
    for (const [field, value] of Object.entries(active)) {
      if (value && !def.fields[field].match(x, norm(value))) return false;
    }
    return true;
  });
  // SORT. Ordered using the field's OWN option list as the running order, so "by grade" runs
  // 1, 2, 3 rather than alphabetically and no section has to declare a comparator. Anything the
  // field doesn't recognise sorts last rather than being dropped.
  const sortField = activeSort[prefix] || '';
  if (sortField && def.fields[sortField]) {
    const fd = def.fields[sortField];
    const order = uniq(fd.opts());
    const rank = x => {
      for (let i = 0; i < order.length; i++) if (fd.match(x, norm(order[i]))) return i;
      return order.length;
    };
    items = items.slice().sort((a, b) => rank(a) - rank(b));
  }

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
/* After a profile save, refresh the payload. A tutor's rate lives in DATA, and every card and
   every quote reads it from there — so changing your rate and watching the booking still say the
   old one isn't a caching subtlety, it's the page never being told. */
function refreshAfterProfileSave() {
  clearTimeout(window._profileReload);
  window._profileReload = setTimeout(reloadData, 1200);
}

function autosaveProfile(card) {
  if (!card) return;
  const status = card.querySelector('.edit-status');
  if (status) status.textContent = 'Saving…';
  clearTimeout(PROFILE_SAVE_TIMER);
  PROFILE_SAVE_TIMER = setTimeout(() => {
    const fields = {};
    card.querySelectorAll('[data-pf]').forEach(el => {
      // A multi-select holds several values; .value would give only the first.
      if (el.multiple) {
        fields[el.dataset.pf] = Array.from(el.selectedOptions).map(o => o.value).join(', ');
        return;
      }
      if (el.disabled) return;
      fields[el.dataset.pf] = el.type === 'checkbox' ? (el.checked ? 'TRUE' : 'FALSE') : el.value;
    });
    console.log('[autosave] sending fields:', JSON.stringify(fields));
    // Read off the form itself. This element belongs to one person and cannot start belonging to
    // someone else halfway through a save.
    // The id when we have one, the name only as a fallback for a session that predates ids.
    const target = card.dataset.target || USER.name;
    const targetId = card.dataset.targetId || '';
    if (!target && !targetId) { if (status) status.textContent = 'Not saved — no target'; return; }
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'updateProfile',
      name: USER.name, target, targetId, fields }) })
      .then(r => r.json())
      .then(d => {
        console.log('[autosave] backend replied:', JSON.stringify(d));
        if (!USER.profile) USER.profile = {};
        Object.assign(USER.profile, fields);
        const me = (DATA.tutors || []).find(x => norm(x.title) === norm(USER.name));
        refreshAfterProfileSave();
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
  // Tutor ticks a venue they teach at → add/remove their handle in that venue's comfort list.
  if (e.target.classList.contains('confirm-details-cb') && USER) {
    if (!e.target.checked) return;
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'confirmDetails', name: USER.name }) })
      .then(r => r.json())
      .then(d => { if (d && d.error) flash(d.error); else { flash('Thanks — confirmed'); reloadData(); } })
      .catch(() => flash('Could not reach the server.'));
    return;
  }

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

  // Any inline row editor. The form carries the action it saves to, so one handler serves links,
  // rooms and anything added later — three near-identical handlers would be three places to fix
  // the next time saving needs to change.
  if (e.target.classList.contains('row-f') && isAdmin()) {
    const form = e.target.closest('.res-edit');
    const status = form?.querySelector('.edit-status');
    if (status) status.textContent = 'Saving…';
    const fields = {};
    form.querySelectorAll('.row-f').forEach(el => { fields[el.dataset.f] = el.value; });
    fetch(API, { method: 'POST', body: JSON.stringify({ action: form.dataset.action,
      adminName: USER.name, rowIndex: form.dataset.row, fields }) })
      .then(r => r.json())
      .then(d => { if (status) status.textContent = (d && d.error) ? d.error : 'Saved ✓'; })
      .catch(() => { if (status) status.textContent = 'Not saved — check connection'; });
    return;
  }

  if ((e.target.classList.contains('room-f') || e.target.classList.contains('room-av')) && isAdmin()) {
    const card = e.target.closest('[data-venue]');
    const room = e.target.dataset.room;
    if (!card || !room) return;
    const status = card.querySelector(`[data-roomstatus="${CSS.escape(room)}"]`);
    if (status) status.textContent = 'Saving…';
    const fields = {};
    card.querySelectorAll(`.room-f[data-room="${CSS.escape(room)}"]`)
        .forEach(el => { fields[el.dataset.f] = el.value; });
    const on = [];
    card.querySelectorAll(`.room-av[data-room="${CSS.escape(room)}"]`)
        .forEach(el => { if (el.checked) on.push(el.dataset.code); });
    clearTimeout(window['_room_' + room]);
    window['_room_' + room] = setTimeout(() => {
      fetch(API, { method: 'POST', body: JSON.stringify({ action: 'saveRoom',
        adminName: USER.name, venue: card.dataset.venue, name: room,
        fields, availability: on.join(',') }) })
        .then(r => r.json())
        .then(d => { if (status) status.textContent = (d && d.error) ? d.error
          : (d && d.removed ? 'Removed' : 'Saved ✓'); })
        .catch(() => { if (status) status.textContent = 'Not saved — check connection'; });
    }, 600);
    return;
  }

  // A shop edit saves the moment it changes, like every other editor on the site.
  if (e.target.classList.contains('shop-f') && isAdmin()) {
    const form = e.target.closest('.res-edit');
    const status = form?.querySelector('.edit-status');
    if (status) status.textContent = 'Saving…';
    const fields = {};
    form.querySelectorAll('.shop-f').forEach(el => {
      fields[el.dataset.f] = el.type === 'checkbox' ? (el.checked ? 'TRUE' : 'FALSE') : el.value;
    });
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'updateShop',
      adminName: USER.name, rowIndex: form.dataset.row, fields }) })
      .then(r => r.json())
      .then(d => { if (status) status.textContent = (d && d.error) ? d.error : 'Saved ✓'; })
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

  // A per-option rate changed — a subject's surcharge, a venue's hourly rate. Same treatment as
  // the variables above: the quote updates on the keystroke, the sheet a moment later.
  if (e.target.classList.contains('fx-input') && e.target.dataset.kind && isAdmin()) {
    const { kind, label } = e.target.dataset, value = e.target.value.trim();
    const row = (DATA.pricingRows || []).find(r => r.kind === kind && norm(r.label) === norm(label));
    if (row) row.value = parseFloat(value) || 0;
    // Keep the lookup the pricing maths actually reads in step, so the quote moves immediately.
    const bucket = { subject: 'subjectsEta', level: 'levels', day: 'days', time: 'times' }[kind];
    if (bucket && DATA.multipliers) DATA.multipliers[bucket][label] = parseFloat(value) || 0;
    if (kind === 'venue') {
      const ven = (DATA.venues || []).find(x => norm(x.title) === norm(label));
      if (ven) ven.bestRate = parseFloat(value) || 0;
    }
    calc();
    const status = $('fx-status');
    if (status) status.textContent = 'Saving…';
    clearTimeout(window._fxTimer);
    window._fxTimer = setTimeout(() => {
      fetch(API, { method: 'POST', body: JSON.stringify({ action: 'updatePricing',
        adminName: USER.name, kind, label, value }) })
        .then(r => r.json())
        .then(d => { if (status) status.textContent = (d && d.error) ? d.error : 'Saved ✓'; })
        .catch(() => { if (status) status.textContent = 'Not saved — check connection'; });
    }, 700);
    return;
  }

  // A pricing variable changed. The quote beside it updates on the keystroke — that's the point of
  // having it here — and the sheet is written a moment later.
  if (e.target.classList.contains('fx-input') && e.target.dataset.key && isAdmin()) {
    const key = e.target.dataset.key, value = e.target.value.trim();
    if (!DATA.constants) DATA.constants = {};
    if (!DATA.constants.vars) DATA.constants.vars = {};
    DATA.constants.vars[key] = value;
    calc();                                     // the booking card recalculates as you type
    const status = $('fx-status');
    if (status) status.textContent = 'Saving…';
    clearTimeout(window._fxTimer);
    window._fxTimer = setTimeout(() => {
      fetch(API, { method: 'POST', body: JSON.stringify({ action: 'updateConfig',
        adminName: USER.name, key, value }) })
        .then(r => r.json())
        .then(d => { if (status) status.textContent = (d && d.error) ? d.error : 'Saved ✓'; })
        .catch(() => { if (status) status.textContent = 'Not saved — check connection'; });
    }, 700);
    return;
  }

  if (e.target.classList.contains('todo-cb') && USER) {
    const lines = String(USER.todo || '').split('\n').filter(Boolean);
    const i = Number(e.target.dataset.i);
    const bare = lines[i].replace(/^x\s+/i, '');
    lines[i] = e.target.checked ? 'x ' + bare : bare;
    saveTodo(lines.join('\n'));
    return;
  }

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
  /* ANY booking control changed.
     Each control used to carry its own list of what to refresh afterwards — l-qty rebuilt the
     split options but not the venues, l-location rebuilt seats but not the tutor list, and l-split
     had no entry at all, so choosing a number did nothing. Every one of those lists was a guess
     about what a change could possibly affect, and every guess was wrong somewhere.

     They all affect each other: seats limit which rooms fit, the room limits the seats, the tutor
     limits both, the length changes what the grid asks for. So one change rebuilds the block —
     which is cheap, and cannot be incomplete. */
  if (e.target.matches('.l-qty, .l-split, .l-tutor, .l-location, .l-level, .l-interval')) {
    const li = parseInt(e.target.dataset.lesson);
    fillLessonBlock(li);       // every dropdown re-derived from every other choice
    renderSplitEmails(li);     // one email box per other party
    renderLessonPhotos(li);    // the venue and tutor being chosen
    renderSlots(li);           // the tick grid, for the right venue and length
    calc();
    return;
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


  // Search box typing
  const prefix = Object.keys(FILTER_DEFS).find(p => id === `${p}-search`);
  if (prefix) applyFilter(prefix);

  if (e.target.classList.contains('filter-group') || e.target.classList.contains('filter-sort')) {
    const store = e.target.classList.contains('filter-group') ? activeGroup : activeSort;
    store[e.target.dataset.prefix] = e.target.value;
    renderFilterBar(e.target.dataset.prefix);   // keep the control showing what's selected
    applyFilter(e.target.dataset.prefix);
    return;
  }

  // A dynamic filter dropdown changed
  if (e.target.classList.contains('filter-dyn')) {
    const p = e.target.dataset.prefix, f = e.target.dataset.field;
    (activeFilters[p] = activeFilters[p] || {})[f] = e.target.value;
    applyFilter(p);
  }
}));

// A note is sent with Enter. Nothing else on a card submits, so there's no button for it — the
// field IS the control, the way a chat box is.
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'todo-new' && USER) {
    const text = (e.target.value || '').trim();
    if (!text) return;
    const lines = String(USER.todo || '').split('\n').filter(Boolean);
    lines.push(text);
    saveTodo(lines.join('\n'));
    return;
  }
  if (e.key !== 'Enter' || !e.target.classList.contains('slot-say')) return;
  const text = (e.target.value || '').trim();
  if (!text || !USER) return;
  const { job: jobId, side } = e.target.dataset;
  e.target.value = '';
  e.target.placeholder = 'Sending…';
  post({ action: 'move', jobId, name: USER.name, role: side === 'tutor' ? 'tutor' : 'client',
         move: 'Say', text, requestId: newRequestId() }, e.target, '')
    .then(d => { if (d && d.success) setTimeout(reloadData, 700); });
});

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
        splitEmails: Array.from(document.querySelectorAll(`.split-email[data-lesson="${L.i}"]`))
          .map(el => el.value.trim()).filter(Boolean).join(', ')
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
    // Edit is the move that un-readies the room. Sending it drops every participant to Waiting,
    // so nobody is carried along by a change they haven't looked at.
    post({ action: 'move', jobId, name: USER.name, role: 'client', move: 'Edit', edits,
           requestId: newRequestId() }, t, '✅ Updated')
      .then(d => { if (d && d.success) { form.classList.add('hidden'); setTimeout(reloadData, 700); } });
    return;
  }

  // One submit sends the whole turn: the chosen action (if any) plus the typed message.

  // The tutor side: claim it, or the family's verdict on whoever claimed it. No message box —
  // these are one-tap decisions, and any discussion belongs in the family's thread.
  // ---- SLOT PRESSES ---------------------------------------------------------------------------
  // ✓ accept · ✕ decline or leave · ＋ put yourself in. The slot carries who and which side, so
  // the move is derived rather than chosen: a family pressing ✓ on a tutor slot is an Accept
  // aimed at that tutor, and there is no other thing it could mean.
  if (t.classList.contains('slot-btn')) {
    if (!USER) { $('go-login-btn')?.click(); return; }
    const { job: jobId, who, side, leave } = t.dataset;

    // ✏️ opens the terms form. Sending it writes an Edit, which un-readies everyone — so nothing
    // happens on the press itself.
    if (t.classList.contains('slot-edit')) {
      const form = t.closest('.card')?.querySelector('.edit-req-form');
      if (form) { form.classList.toggle('hidden'); layoutGrid(t.closest('.grid')); }
      return;
    }

    let payload = null, label = '', ask = '';
    if (t.classList.contains('slot-add')) {
      payload = { move: 'Request', role: side === 'tutor' ? 'tutor' : 'client', counterpart: '' };
      label = side === 'tutor' ? '✅' : '✅';
      ask = side === 'tutor' ? 'Apply to teach this? The family will see you among the applicants.'
                             : 'Ask to join this class?';
    } else if (t.classList.contains('slot-pay')) {
      // Payment leaves the site. The move is NOT recorded here — a client who opens the Stripe
      // page and closes the tab hasn't paid, and only Stripe's own answer on the way back counts.
      if (!confirm('Continue to payment?')) return;
      t.textContent = '⏳';
      fetch(API, { method: 'POST', body: JSON.stringify({ action: 'createCheckout',
                    jobId, name: USER.name, requestId: newRequestId() }) })
        .then(r => r.json())
        .then(d => {
          if (d && d.url) { window.location.href = d.url; return; }
          t.textContent = '💳';
          flash((d && d.error) || 'Could not start the payment.');
        })
        .catch(() => { t.textContent = '💳'; flash('Could not reach the server.'); });
      return;
    } else if (leave) {
      payload = { move: 'Withdraw', role: side === 'tutor' ? 'tutor' : 'client', counterpart: '' };
      label = '✕';
      ask = side === 'tutor'
        ? 'Withdraw your application? You are removed from the roster.'
        : 'Leave this session? You are removed from it entirely.';
    } else if (t.classList.contains('slot-ready')) {
      // Readying up is about YOU, so it carries no counterpart. Naming someone would accept them.
      payload = { move: 'Accept', role: side === 'tutor' ? 'tutor' : 'client', counterpart: '' };
      label = '✓';
      ask = '';
    } else if (t.classList.contains('slot-yes')) {
      // Only ever a family choosing a tutor — the one accept on the card.
      payload = { move: 'Accept', role: 'client', counterpart: who };
      label = '✓';
      ask = `Choose ${who}? Any other applicants are declined.`;
    } else if (t.classList.contains('slot-no')) {
      payload = { move: 'Decline', role: 'client', counterpart: who };
      label = '✕';
      ask = `Decline ${who}? They are removed from this session entirely.`;
    }
    if (!payload) return;
    if (ask && !confirm(ask)) return;
    post(Object.assign({ action: 'move', jobId, name: USER.name, requestId: newRequestId() }, payload),
         t, label)
      .then(d => { if (d && d.success) setTimeout(reloadData, 700); });
    return;
  }

  /* Wardrobe. A colour or an item; either way the WHOLE look is sent and the backend re-checks
     every piece, so the card only ever knows how to draw. Buying and equipping are one act — a
     credit is spent at the moment an item goes on, never before. */
  if (t.classList.contains('av-sw') || t.classList.contains('av-opt')) {
    if (!USER || !hasRole('kid')) return;
    const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
    if (t.classList.contains('av-sw')) cfg[t.dataset.field] = Number(t.dataset.value);
    else cfg[t.dataset.slot] = t.dataset.id;

    const status = $('av-status');
    if (status) status.textContent = 'Saving…';
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'saveAvatar', name: USER.name, avatar: cfg }) })
      .then(r => r.json())
      .then(d => {
        if (!d || d.error) { const el = $('av-status'); if (el) el.textContent = (d && d.error) || 'Could not save.'; return; }
        USER.avatar = d.avatar;
        if (d.credits !== undefined) USER.credits = d.credits;
        if (d.owned) USER.avatarItems = d.owned;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        // Repaint in place so the figure updates without losing your position in the wardrobe.
        const open = document.getElementById('avatar-card');
        if (open) { const g = open.closest('.grid'); open.outerHTML = tpl.avatarCard(); layoutGrid(g); }
        const el = $('av-status');
        if (el) el.textContent = (d.bought || []).length ? 'Bought ' + d.bought.join(', ') : 'Saved ✓';
      })
      .catch(() => { const el = $('av-status'); if (el) el.textContent = 'Not saved — check connection'; });
    return;
  }

  if (t.classList.contains('buy-item-btn')) {
    if (t.dataset.kind !== 'avatar') {
      // Physical stock still has no checkout behind it.
      t.textContent = 'Coming soon';
      setTimeout(() => t.textContent = 'Buy', 2000);
      return;
    }
    if (!USER || !hasRole('kid')) { flash('Log in as a student to buy this.'); return; }
    // Buying and wearing are one act, so this is the same request the wardrobe makes. The backend
    // checks the price and takes the credits; there is no separate "purchase" that could succeed
    // while the equipping failed.
    const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
    cfg[t.dataset.slot] = String(t.dataset.item).replace(/^av-[a-z]+-/, '');
    t.textContent = '⏳';
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'saveAvatar', name: USER.name, avatar: cfg }) })
      .then(r => r.json())
      .then(d => {
        if (!d || d.error) { t.textContent = 'Buy'; flash((d && d.error) || 'Could not buy that.'); return; }
        USER.avatar = d.avatar;
        if (d.credits !== undefined) USER.credits = d.credits;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        if (d.owned) USER.avatarItems = d.owned;
        flash((d.bought || []).length ? 'Bought ' + d.bought.join(', ') : 'Now wearing it');
        applyFilter('shop');
      })
      .catch(() => { t.textContent = 'Buy'; flash('Could not reach the server.'); });
    return;
  }

  // The feed: arrows, or the card itself — tapping the screen goes forward, which is how the
  // shape this borrows already behaves.
  // Tap the screen for the next one. Tapping the left eighth goes back, which is how the shape
  // this borrows already behaves — no controls, because it has never had any.
  const slide = t.closest('.feed-slide');
  if (slide) {
    const box = slide.getBoundingClientRect();
    feedMove(e.clientX - box.left < box.width * 0.22 ? -1 : 1);
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
    USER.friends = friendHandles().filter(h => norm(h) !== norm(handle)).join(', ');
    post({ action: 'saveFriends', name: USER.name, friends: USER.friends }, t, '✓');
    renderCards('tutors', DATA.tutors);
    return;
  }



  if (t.classList.contains('split-add')) {
    renderSplitEmails(parseInt(t.dataset.lesson), true);
    calc();
    return;
  }
  if (t.classList.contains('split-drop')) {
    const li = parseInt(t.dataset.lesson);
    t.closest('.split-one')?.remove();
    calc();
    return;
  }

  if (t.classList.contains('link-edit-btn')) {
    const form = t.closest('li')?.querySelector('.res-edit');
    if (form) { form.classList.toggle('hidden'); layoutGrid(t.closest('.grid')); }
    return;
  }

  if (t.classList.contains('add-link-btn') && isAdmin()) {
    t.textContent = '⏳';
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'addLink',
      adminName: USER.name, category: t.dataset.category, name: 'New link' }) })
      .then(r => r.json())
      .then(d => { if (d && d.error) flash(d.error); reloadData(); })
      .catch(() => { t.textContent = '➕'; flash('Could not reach the server.'); });
    return;
  }

  if (t.classList.contains('row-delete') && isAdmin()) {
    const form = t.closest('.res-edit');
    if (!confirm('Delete "' + (t.dataset.name || 'this') + '"? This removes the row.')) return;
    t.textContent = '⏳';
    fetch(API, { method: 'POST', body: JSON.stringify({ action: form.dataset.delete,
      adminName: USER.name, rowIndex: form.dataset.row }) })
      .then(r => r.json())
      .then(d => { if (d && d.error) { t.textContent = 'Delete'; flash(d.error); return; }
                   flash('Deleted'); reloadData(); })
      .catch(() => { t.textContent = 'Delete'; flash('Could not reach the server.'); });
    return;
  }

  if (t.classList.contains('shop-edit-btn')) {
    const card = t.closest('.card');
    const form = card?.querySelector('.res-edit');
    if (!form) return;
    const opening = form.classList.contains('hidden');
    form.classList.toggle('hidden');
    // Widen while it's open, back to normal when it closes.
    if (opening) card.dataset.span = 2; else delete card.dataset.span;
    layoutGrid(t.closest('.grid'));
    return;
  }

  if (t.classList.contains('shop-delete') && isAdmin()) {
    if (!confirm('Delete "' + t.dataset.name + '" from the shop? This removes the row.')) return;
    t.textContent = '⏳';
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'deleteShopItem',
      adminName: USER.name, rowIndex: t.dataset.row }) })
      .then(r => r.json())
      .then(d => {
        if (!d || d.error) { t.textContent = 'Delete'; flash((d && d.error) || 'Could not delete.'); return; }
        flash('Deleted');
        // Re-fetch rather than hiding the card: the row is gone, and every row below it has just
        // shifted up, so a stale list would edit the wrong item next.
        reloadData();
      })
      .catch(() => { t.textContent = 'Delete'; flash('Could not reach the server.'); });
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
    if (form) {
      form.classList.add('hidden');
      const card = form.closest('.card');
      if (card) delete card.dataset.span;
      layoutGrid(t.closest('.grid'));
    }
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

    /* Whose editor is open is GLOBAL state, and global state that's only cleared on the way out
       leaks. Open Sasha's editor, click the pencil on your own card without closing hers, and your
       form was built from whatever was still in EDIT_TARGET — her values, her photo.
       So it's cleared on the way IN, every time, before anything is drawn. Any editor already
       open is closed too: two at once was how you got there. */
    /* Cancel anything still queued. A debounced save outliving its own form is how a value typed
       into one person's card lands on another's. */
    clearTimeout(PROFILE_SAVE_TIMER);
    EDIT_TARGET = null;
    EDIT_SEQ++;
    const mySeq = EDIT_SEQ;
    document.querySelectorAll('.own-profile.editing').forEach(open => {
      const g = open.closest('.grid');
      open.outerHTML = '';
      layoutGrid(g);
    });

    if (!who) {
      const g = card.closest('.grid');
      card.outerHTML = tpl.profileEditCard(USER.profile || {});
      layoutGrid(g);
      return;
    }

    t.textContent = '⏳';
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'getProfile', adminName: USER.name, target: who }) })
      .then(r => r.json())
      .then(d => {
        t.textContent = '✏️';
        // A slow answer that arrives after you've clicked something else must not open a form for
        // somebody you're no longer looking at.
        if (mySeq !== EDIT_SEQ) return;
        if (!d || !d.success) { flash((d && d.error) || 'Could not open that profile.'); return; }
        EDIT_TARGET = { name: who, personId: d.personId || '', role: d.role,
                        profile: d.profile || {}, avatarItems: d.avatarItems || [] };
        const g = card.closest('.grid');
        if (!card.isConnected) { renderCards('tutors', DATA.tutors); return; }
        card.outerHTML = tpl.profileEditCard(EDIT_TARGET.profile);
        layoutGrid(g);
      })
      .catch(() => { t.textContent = '✏️'; flash('Could not reach the server.'); });
    return;
  }
  // Cancel editing → restore just this card to display form (no section rebuild)
  if (t.id === 'cancel-profile-btn') {
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
    const v = (DATA.venues || []).find(x => norm(x.title) === norm(t.dataset.venue));
    const card = t.closest('.card');
    if (card && v) { const g = card.closest('.grid'); card.outerHTML = tpl.venueEditCard(v); layoutGrid(g); }
    return;
  }
  // Cancel venue edit → restore the venue card
  if (t.id === 'cancel-venue-btn') {
    const card = t.closest('.card');
    const v = (DATA.venues || []).find(x => norm(x.title) === norm(card?.dataset.venue));
    if (card && v) { const g = card.closest('.grid'); card.outerHTML = tpl.card(v); layoutGrid(g); }
    return;
  }
  // Save venue edits (admin only)
  if (t.id === 'show-register') { tog('register-form', false); layoutGrid(t.closest('.grid')); return; }
  if (t.id === 'reg-cancel')     { tog('register-form', true);  layoutGrid(t.closest('.grid')); return; }

  if (t.id === 'reg-submit') {
    const body = { action: 'register', first_name: val('reg-first'), last_name: val('reg-last'),
                   email: val('reg-email'), pin: val('reg-pin') };
    const msg = $('reg-msg');
    if (msg) msg.textContent = 'Creating…';
    fetch(API, { method: 'POST', body: JSON.stringify(body) })
      .then(r => r.json())
      .then(d => {
        if (!d || d.error) { if (msg) msg.textContent = (d && d.error) || 'Could not create the account.'; return; }
        if (msg) msg.textContent = '';
        tog('register-form', true);
        // Their name goes in the login box ready for after they've confirmed, but there's no point
        // inviting them to type a PIN that won't be accepted yet.
        if ($('auth-email')) $('auth-email').value = d.name;
        if ($('auth-msg')) {
          $('auth-msg').textContent = 'Account created. Check your email for a confirmation link, '
            + 'then log in with your PIN.';
        }
      })
      .catch(() => { if (msg) msg.textContent = 'Could not reach the server.'; });
    return;
  }

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
        USER = { name: d.name, personId: d.personId || '',
                 roles: d.roles || [(d.role || 'parent').toLowerCase()],
                 role: (d.role || 'parent').toLowerCase(), kids: d.kids || [], parent: d.parent || '', profile: d.profile || null, topics: d.topics || '', friends: d.friends || '', handle: d.handle || '', highscore: d.highscore || 0, ttHighscore: d.ttHighscore || 0, xp: d.xp || 0, credits: d.credits || 0, tick1: d.tick1 || '', tick2: d.tick2 || '', tick3: d.tick3 || '', notepad: d.notepad || '', todo: d.todo || '', siblings: d.siblings || [],
          avatar: d.avatar || '', avatarItems: d.avatarItems || [] };
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
    renderForRole();
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
    if (card) shareCardImage(card, title);
  }
});

/**
 * Share a note as a PNG.
 *
 * DRAWN, not screenshotted. html2canvas was tried three times and produced a blank note twice —
 * it clones the whole document and re-renders it, so anything in the CSS it doesn't understand
 * silently ruins the output, and the failure looks identical to success until you open the file.
 *
 * This reads the card's TEXT out of the DOM and paints it onto a canvas: the note's own colour,
 * the same lines you can see, nothing else. It has no dependency, cannot be defeated by a style
 * rule, and produces the same result every time. Photos are left out deliberately — they're
 * cross-origin, which is the other thing that broke the old version.
 */
/**
 * Share a card as a PNG.
 *
 * DRAWN, not screenshotted. html2canvas was tried three times and produced a blank note twice — it
 * clones the document and re-renders it, so anything in the CSS it doesn't understand ruins the
 * output, and the failure looks identical to success until you open the file.
 *
 * Reads the card's ROWS rather than its text. Two things follow from that, both of which the
 * text-reading version got wrong:
 *   · a <select> reads as every option it holds, so the shared quote listed all eleven venues and
 *     all nine levels — only the CHOSEN one means anything
 *   · a row is five cells, not one sentence, so the columns are drawn as columns and the shared
 *     image looks like the card it came from
 */
async function shareCardImage(card, title) {
  const btn = card.querySelector('.card-share-btn, .social-share-btn');
  const prev = btn ? btn.textContent : '';
  if (btn) btn.textContent = '⏳';

  try {
    const cs = getComputedStyle(card);
    const paper = cs.backgroundColor || 'hsl(48 80% 70%)';

    /* What a cell says. A control reports its CHOICE, not its options — that's the difference
       between a quote and a list of everything that could have been quoted. */
    const cellText = (el) => {
      if (!el) return '';

      /* The multi-select subject picker keeps its answer in a display span; its checkboxes are the
         mechanism, not the value. Reading them gave "✓, ✓, —, —, —…", which is the shape of the
         control rather than what was chosen. */
      const disp = el.querySelector('.l-subject-display');
      if (disp) {
        const t = disp.textContent.trim();
        return t === NONE_LABEL ? '' : t;
      }

      /* The split cell is boxes and buttons. Its VALUE is who's on the booking — an empty box and
         the ✕ / ＋ that manage them are the mechanism, and reading them printed "✕ ＋" where a list
         of people belongs. */
      const emails = el.querySelectorAll('.split-email');
      if (emails.length) {
        const named = Array.from(emails).map(e => e.value.trim()).filter(Boolean);
        return named.length ? named.join(', ')
             : (emails.length + ' other' + (emails.length === 1 ? '' : 's') + ' — not named yet');
      }

      const parts = [];
      el.querySelectorAll('select').forEach(sel => {
        const opt = sel.selectedOptions && sel.selectedOptions[0];
        if (!opt) return;
        /* An empty VALUE isn't necessarily an empty choice — "No preference" is a real answer with
           no value behind it, and skipping it left the Tuition row blank on a quote that plainly
           had a tutor decision in it. Only the placeholder is nothing. */
        const label = opt.textContent.trim();
        if (label && label !== NONE_LABEL) parts.push(label);
      });
      // A lone tickbox is a yes/no; several are a mechanism and are read elsewhere.
      const boxes = el.querySelectorAll('input[type="checkbox"]');
      if (boxes.length === 1) parts.push(boxes[0].checked ? 'Yes' : 'No');
      el.querySelectorAll('input[type="email"], input[type="text"]').forEach(inp => {
        if (inp.value.trim()) parts.push(inp.value.trim());
      });
      if (parts.length) return parts.filter(Boolean).join(', ');
      /* Falling back to the cell's text, minus anything that's a control rather than a value —
         a ＋ that adds a row and a ✕ that removes one say nothing about the booking. */
      const clone = el.cloneNode(true);
      clone.querySelectorAll('.text-action, button').forEach(x => x.remove());
      return clone.innerText.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
    };

    /* Each row as the card holds it: its cells, whether its value is a control, whether a rule
       falls beneath it, and — for a day — which hours exist and which are ticked. The share should
       look like what it was taken from, and that means carrying the structure across rather than
       flattening it to text and rebuilding something similar. */
    const rows = [];
    card.querySelectorAll('.field-line').forEach(line => {
      if (line.closest('.res-edit, .cl-form, details')) return;
      if (line.id === 'order-total-row') return;

      const day = line.querySelector('.l-slots-day');
      const row = {
        k: (line.querySelector('.fl-k') || {}).innerText || '',
        mul: cellText(line.querySelector('.fl-mul')),
        rate: cellText(line.querySelector('.fl-r')),
        tot: cellText(line.querySelector('.fl-p')),
        rule: line.classList.contains('fl-group-end'),
        /* Two columns, as the card lays them out: Starts, Ends, Status and the rest carry no
           money, so their value runs to the right edge rather than stopping where the figures
           begin. Drawing them in the value column left the whole right-hand side blank below the
           price, which reads as a quote that gave up. */
        plain: line.classList.contains('fl-plain'),
        // A dashed underline is how the card marks a value you chose, as opposed to one it worked
        // out. Carrying that across is most of why the two look alike.
        chosen: !!line.querySelector('.fl-v select, .fl-v input, .fl-v .inline-select'),
      };
      if (day) {
        row.hours = Array.from(day.querySelectorAll('.slot-cb')).map(cb => ({
          h: cb.dataset.hour, on: cb.checked, off: cb.disabled,
        }));
        if (!row.hours.some(x => x.on)) return;      // a day with nothing ticked says nothing
      } else {
        row.v = cellText(line.querySelector('.fl-v'));
      }
      rows.push(row);
    });

    if (!rows.length) { flash('Nothing to share on this card'); return; }

    const heading = (card.querySelector('h3') || {}).innerText || title;

    /* Photos, through the BACKEND. A browser cannot draw a Drive photo onto a canvas it means to
       export: with crossOrigin set the image never loads, and without it the canvas is tainted and
       the export throws. Apps Script isn't a browser, so it fetches the bytes and returns a data
       URI — same-origin by definition. */
    /* Only the photo frames, in their own order — and the count includes the drawn placeholders,
       so one real photo still occupies half the width rather than stretching across a quote that
       has a venue and no tutor yet. */
    const frames = [...card.querySelectorAll('.job-photos > *')].slice(0, 2);
    const frameCount = frames.length;
    /* One entry PER FRAME, null where there's no photo — a placeholder frame or one that failed
       to fetch. Compacting the list is what let a missing venue picture move the tutor into the
       venue's slot. A slot is a position; an empty one stays empty. */
    const photos = await Promise.all(frames.map(async f => {
      const el = f.querySelector('img');
      if (!el || !el.src) return null;
      try {
        const d = await (await fetch(API, { method: 'POST',
          body: JSON.stringify({ action: 'imageData', url: el.src }) })).json();
        if (!d || !d.dataUri) return null;
        return await new Promise(res => {
          const im = new Image();
          im.onload = () => res(im); im.onerror = () => res(null);
          im.src = d.dataUri;
        });
      } catch { return null; }
    }));
    // The FRAME count decides the layout, not how many fetches succeeded — that is what keeps a
    // failed photo from moving the other one.

    const S = 2, W = 620, PAD = 24, LH = 22;
    const COL = { k: PAD, v: PAD + 92, mul: W - PAD - 214, rate: W - PAD - 132, tot: W - PAD };
    const IMG = frameCount ? 0 : 0;   // set below, once the square size is known

    /* SQUARE, like the card. Two frames side by side, each as tall as it is wide — the share was
       drawing them 281 x 180, which crops a portrait differently from the card and is most of why
       the two didn't match. */
    const frameW = frameCount ? (W - PAD * 2 - (frameCount - 1) * 10) / frameCount : 0;

    const draw = (withPhotos) => {
      const imgH = (withPhotos && frameCount) ? frameW + 12 : 0;
      /* Measured, not guessed. A wrapped value makes its row taller, so the height is taken from
         a first pass rather than from a row count — a canvas sized by counting rows would cut the
         last lines off the moment anything wrapped. */
      const H = PAD * 2 + imgH + 40 + rows.reduce((n, r) =>
        n + LH + (r.extra || 0) + (r.rule ? 6 : 0), 0);
      const c = document.createElement('canvas');
      c.width = W * S; c.height = H * S;
      const g = c.getContext('2d');
      g.scale(S, S);
      g.fillStyle = paper; g.fillRect(0, 0, W, H);

      let y = PAD + (imgH ? 6 : 0);   // the top strip laps above the photo
      if (imgH) {
        const gap = 10, TAPE = 7, LIP = 4;
        const h = frameW;
        photos.forEach((im, k) => {
          const x = PAD + k * (frameW + gap);

          if (im) {
            const r = Math.max(frameW / im.width, h / im.height);
            g.save();
            g.beginPath(); g.rect(x, y, frameW, h); g.clip();
            g.drawImage(im, x + (frameW - im.width * r) / 2, y + (h - im.height * r) / 2,
                        im.width * r, im.height * r);
            g.restore();
          } else {
            /* No photo in this slot — because none was chosen, or because the fetch failed. The
               card draws a dashed frame here rather than collapsing, and so does this: a quote
               with a tutor and no venue should look like a quote still being decided, not like a
               quote about a tutor. */
            g.strokeStyle = 'rgba(0,0,0,.22)';
            g.lineWidth = 1;
            g.setLineDash([4, 3]);
            g.strokeRect(x + 0.5, y + 0.5, frameW - 1, h - 1);
            g.setLineDash([]);
            g.fillStyle = 'rgba(0,0,0,.35)';
            g.font = "13px 'Patrick Hand', Georgia, serif";
            g.textAlign = 'center';
            g.fillText(k === 0 ? 'No venue yet' : 'No tutor yet', x + frameW / 2, y + h / 2 + 4);
            g.textAlign = 'left';
            return;                                   // no tape on an empty frame
          }

          /* Four strips of brown packing tape, corner to corner, parallel to the edge each covers —
             the geometry the stylesheet uses. Not angled: tape laid along an edge lies flat against
             it, and rotating the strips leaves triangles of bare join at the corners. */
          g.fillStyle = '#b98a52';
          g.fillRect(x - TAPE, y - LIP, frameW + TAPE * 2, TAPE);
          g.fillRect(x - TAPE, y + h - TAPE + LIP, frameW + TAPE * 2, TAPE);
          g.fillRect(x - LIP, y - TAPE, TAPE, h + TAPE * 2);
          g.fillRect(x + frameW - TAPE + LIP, y - TAPE, TAPE, h + TAPE * 2);
        });
        y += imgH;
      }

      // Centred, as the card centres it. Left-aligned it read as a document title rather than as
      // the note's own heading.
      g.fillStyle = '#000';
      g.font = "600 21px 'Patrick Hand', Georgia, serif";
      g.textAlign = 'center';
      g.fillText(heading, W / 2, y + 16);
      g.textAlign = 'left';
      y += 38;

      rows.forEach(r => {
        const mid = y - 5;                              // the row's vertical centre

        g.textAlign = 'left';
        g.fillStyle = '#000';
        g.font = "600 13px 'Patrick Hand', Georgia, serif";
        g.fillText(r.k, COL.k, y);

        if (r.hours) {
          /* The hour boxes, as the card draws them — ticked filled, available outlined, closed
             faint. A list of times said the same thing and looked nothing like it. */
          const BW = 15, BH = 12, gapx = 2;
          let x = COL.v;
          g.font = "8px 'Patrick Hand', Georgia, serif";
          r.hours.forEach(hr => {
            if (hr.on) {
              g.fillStyle = '#000';
              g.fillRect(x, mid - BH / 2, BW, BH);
              g.fillStyle = paper;
            } else {
              g.strokeStyle = hr.off ? 'rgba(0,0,0,.12)' : 'rgba(0,0,0,.35)';
              g.lineWidth = 1;
              g.strokeRect(x + 0.5, mid - BH / 2 + 0.5, BW - 1, BH - 1);
              g.fillStyle = hr.off ? 'rgba(0,0,0,.15)' : 'rgba(0,0,0,.55)';
            }
            g.textAlign = 'center';
            g.fillText(hr.h, x + BW / 2, mid + 3);
            x += BW + gapx;
          });
        } else {
          /* The value, right-aligned against the figures with a dashed rule beneath it when it's
             something you chose — that underline is how the card distinguishes a choice from a
             result, and without it every row read the same. */
          /* WRAPS, never truncates. A list of eleven dates ending in "…" tells a client they're
             paying for sessions the quote won't name — and the dates are the thing being bought.
             A value too long for its column takes another line, exactly as it does on the card. */
          g.font = "13px 'Patrick Hand', Georgia, serif";
          g.textAlign = 'right';
          /* A row with no money in it runs its value to the right edge, exactly as the card does —
             that's the two-column `.fl-plain` layout. Pinning every value at the multiplier column
             left Starts, Ends and Status stopping short with an empty band beside them, which
             reads as figures that failed to draw. */
          const right = r.plain ? COL.tot : COL.mul - 16;
          const room = right - COL.v;
          g.fillStyle = '#000';

          const lines = [];
          let line = '';
          String(r.v || '').split(' ').forEach(word => {
            const test = line ? line + ' ' + word : word;
            if (g.measureText(test).width > room && line) { lines.push(line); line = word; }
            else line = test;
          });
          if (line) lines.push(line);

          lines.forEach((ln, n) => g.fillText(ln, right, y + n * (LH - 4)));
          if (r.chosen && lines.length) {
            const last = lines[lines.length - 1];
            const w = Math.min(g.measureText(last).width + 16, room);
            const uy = y + (lines.length - 1) * (LH - 4) + 4;
            g.strokeStyle = 'rgba(0,0,0,.45)';
            g.lineWidth = 1;
            g.setLineDash([2, 2]);
            g.beginPath();
            g.moveTo(right - w, uy);
            g.lineTo(right, uy);
            g.stroke();
            g.setLineDash([]);
          }
          // At least one line tall, always. A row with no value gave zero lines and a NEGATIVE
          // height, which is how "Hours a week" ended up printed on top of "Time interval".
          r.extra = Math.max(0, lines.length - 1) * (LH - 4);
        }

        g.fillStyle = '#000';
        g.textAlign = 'right';
        g.font = "600 12px 'Patrick Hand', Georgia, serif";
        if (r.mul)  g.fillText(r.mul,  COL.mul + 62, y);
        g.font = "12px 'Patrick Hand', Georgia, serif";
        if (r.rate) g.fillText(r.rate, COL.rate + 76, y);
        g.font = "13px 'Patrick Hand', Georgia, serif";
        if (r.tot)  g.fillText(r.tot,  COL.tot, y);

        y += LH + (r.extra || 0);

        // The rule between sections, as on the card — it's what says the three groups do
        // different things to the price.
        if (r.rule) {
          g.strokeStyle = 'rgba(0,0,0,.22)';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(PAD, y - LH / 2 + 3);
          g.lineTo(W - PAD, y - LH / 2 + 3);
          g.stroke();
          y += 6;
        }
      });
      return { canvas: c, height: y + PAD };
    };

    /* Drawn twice. The first pass measures — wrapping only becomes knowable once the text is
       being laid out, and `r.extra` is what it learns — and the second draws onto a canvas sized
       to hold the answer. Cheap, and it can't come up short. */
    draw(true);
    let out = draw(true), blob = null;
    try {
      blob = await new Promise((res, rej) =>
        out.canvas.toBlob(b2 => b2 ? res(b2) : rej(new Error('no blob')), 'image/png'));
    } catch (tainted) {
      // The photos poisoned the canvas. Same card, text only, rather than nothing at all.
      out = draw(false);
      blob = await new Promise(res => out.canvas.toBlob(res, 'image/png'));
      flash('Shared without photos — the image host blocked them');
    }
    if (!blob) { flash('Could not create the image'); return; }

    const name = String(title).replace(/[^\w\-]+/g, '_').slice(0, 40) || 'card';
    const file = new File([blob], name + '.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title }); return; } catch { /* cancelled */ }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    flash('Image saved');
  } catch (err) {
    console.error('[share]', err);
    flash('Could not create the image');
  } finally {
    if (btn) btn.textContent = prev;
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
