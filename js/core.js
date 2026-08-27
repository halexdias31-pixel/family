/* ==================================================================================================
   @family. — core.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   core.js is number 1 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */

/* ================================================================================================
   THE RULES.

   Carried over whole. Not one line of this knew what a sticky note was — it is all data in, answer
   out — which is exactly why it survived: the pricing chain, the seat limits, who may sit where,
   the status words, the chess engine, the feed.

   Months of work, and none of it needed changing. What burned was the markup that sat on top.
================================================================================================ */

/* The small things everything above leans on. Taken WITH the rules rather than left behind —
   the first pass carried the pricing chain and not the function it compares names with, which
   parsed perfectly and threw the moment anything ran. */

const norm = s => String(s || '').toLowerCase().trim();


const esc = s  => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ==================================================================================================
   A ROW: A LABEL ON THE LEFT, A VALUE ON THE RIGHT

   THE MOST REPEATED FOUR LINES IN THIS APP. Thirty-nine of them, written out by hand across eight
   files, and no two files agreeing about the details — the value carried `v mono` in fourteen of
   them and a bare `v` in ten. Nobody chose that. It is what happens when the same small thing is
   typed out afresh each time: every copy is a chance to leave something off, and none of them is
   wrong enough to notice.

   A NUMBER IS MONOSPACED, A WORD IS NOT, and that is the rule those thirty-nine were groping
   towards. Figures in a column want to line up — `£15.00` above `£1.00` above `£286.00` reads as a
   column of money only if the digits are the same width — and a name or a place does not, because
   monospaced prose looks like a receipt when it is meant to look like a sentence.

   IT IS DECIDED HERE RATHER THAN ASKED FOR. Every caller passing `mono` by hand is every caller
   able to forget, which is exactly what the fourteen-against-ten was. If it looks like a number,
   it is set like one.

   Anything genuinely different says so: `big` for a total, `gold` for something you can act on,
   `bad` for a warning. Those are decisions; the typeface is not.
================================================================================================== */
const row = (label, value, extra) => {
  const v = String(value == null ? '' : value);
  /* MONEY, A COUNT, A DATE, A PERCENTAGE — anything whose characters want to line up under one
     another. A dash is here because it is what a blank value shows, and a lone dash in the middle
     of a column of figures should sit where the figures sit. */
  const looksNumeric = /^[£$€]?[\d.,\s—–-]+%?$/.test(v.trim()) || /^\d/.test(v.trim());
  const cls = ['v', looksNumeric ? 'mono' : '', extra || ''].filter(Boolean).join(' ');
  return `<div class="row"><span class="k">${esc(label)}</span>` +
         `<span class="${cls}">${esc(v)}</span></div>`;
};

/* THE SAME ROW, WITH THE VALUE ALREADY MARKED UP — a link, a coloured word, a small drawing. `row`
   escapes its value, which is right for text somebody typed and wrong for markup somebody built,
   so the two cases are two functions rather than one with a flag. A flag would be a way to turn
   the escaping off, and a way to turn escaping off is a way to forget it is on. */
const rowHtml = (label, html, extra) =>
  `<div class="row"><span class="k">${esc(label)}</span>` +
  `<span class="${['v', extra || ''].filter(Boolean).join(' ')}">${html}</span></div>`;

/* ---------- THE TWO SHAPES THE FIRST TWO COULD NOT MAKE -------------------------------------------
   `row` and `rowHtml` covered most of a sheet and not all of it, so the rest were written out by
   hand — and a row written by hand is a row that can be spelt differently. Thirty-six of them were,
   across seven files, while the helper that existed was called by nobody.

   These two close the gap. Every label-and-value line in the app is now one of four calls, which
   means a new sheet cannot invent a fifth kind by accident and the four can be changed in one
   place. */

/* A VALUE THAT CHANGES WHILE YOU WATCH — a clock ticking down, a score going up. It needs a name so
   something can find it and write to it, and that is the only thing separating it from `row`.
   The id is the LAST argument because it is the rarest: almost no value moves. */
const rowLive = (label, value, id, extra) =>
  `<div class="row"><span class="k">${esc(label)}</span>` +
  `<span class="${['v', 'mono', extra || ''].filter(Boolean).join(' ')}"` +
  ` id="${esc(id)}">${esc(String(value == null ? '' : value))}</span></div>`;

/* A ROW WITH NO LABEL — a name in a list, a line of a basket. It is a row because it sits in a
   column of rows and must line up with them; it has no label because the heading above already said
   what these are, and repeating that on every line is noise.
   Its own function rather than `row('', x)`, because an empty string as a label is a thing somebody
   forgot to fill in, and a reader cannot tell which. */
const rowValue = (html, extra) =>
  `<div class="row"><span class="${['v', extra || ''].filter(Boolean).join(' ')}">${html}</span></div>`;


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


function activePromoFactor(ctx) {
  const promos = DATA.promotions || [];
  let factor = 1;
  promos.forEach(p => {
    if (promoApplies(p, ctx)) factor *= (parseFloat(p.value) || 1);
  });
  return factor;
}


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

const ST = {
  UNSENT:    'Unsent',      // built, not yet sent to anyone
  REQUESTED: 'Requested',   // sent; waiting for the other side
  WAITING:   'Waiting',     // in the lobby, hasn't readied up
  AGREED:    'Agreed',      // readied up; waiting on everyone else
  PAYING:    'Paying',      // terms settled, payment in flight
  BOOKED:    'Booked',      // paid and in the diary
  CONFIRMED: 'Confirmed',   // a session that has happened
  DECLINED:  'Declined',    // the other side said no
  CANCELLED: 'Cancelled',   // called off after being booked
};

const ROLE = { ADMIN: 'admin', TUTOR: 'tutor', CLIENT: 'client', STUDENT: 'student' };

const ROLE_ALIASES = {
  admin: ROLE.ADMIN, administrator: ROLE.ADMIN,
  tutor: ROLE.TUTOR, teacher: ROLE.TUTOR,
  client: ROLE.CLIENT, parent: ROLE.CLIENT, guardian: ROLE.CLIENT,
  student: ROLE.STUDENT, kid: ROLE.STUDENT, child: ROLE.STUDENT, pupil: ROLE.STUDENT,
};


const roleOf = r => ROLE_ALIASES[norm(r)] || norm(r);


const isRole = (r, want) => roleOf(r) === want;


const heldRoles = () => (USER && (USER.roles || [USER.role]) || []).map(x => String(x).toLowerCase());


const hasRole = r => heldRoles().some(h => roleOf(h) === roleOf(r));


const uniq = arr => [...new Set((arr||[]).filter(Boolean))];


const hashOf = str => {                       // FNV-1a: small, fast, well-spread
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};


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


const fmtDate = v => {
  const s = String(v ?? '').trim();
  if (!s) return '';
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);   // already DD/MM/YYYY
  if (m) { const y = m[3].slice(-2); return `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${y}`; }
  const d = new Date(s);
  if (isNaN(d)) return s;
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)}`;
};


function num(raw) {
  if (typeof raw === 'number') return raw;
  const t = String(raw == null ? '' : raw).trim().replace(/[£$,\s]/g, '');
  if (!t) return NaN;
  const frac = t.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
  if (frac) { const den = parseFloat(frac[2]); return den === 0 ? NaN : parseFloat(frac[1]) / den; }
  if (t.endsWith('%')) { const p = parseFloat(t); return isNaN(p) ? NaN : p / 100; }
  return parseFloat(t);
}


function spaceFor(label) {
  const want = norm(label);
  return bookableSpaces().find(x => norm(x.label) === want) || null;
}


function isHome(loc) {
  const name = String(loc || '');
  if (/\b(home|house|client\s*(house|home|place)|your venue)\b/i.test(name)) return true;
  const sp = (typeof spaceFor === 'function') ? spaceFor(name) : null;
  if (sp) return !(Number(sp.rate) > 0);
  const v = (DATA.venues || []).find(x => norm(x.title) === norm(name));
  return !!v && !(Number(v.bestRate) > 0);
}


function seatLimits(space, tutor) {
  const v = (DATA.constants || {}).vars || {};
  const houseMax = Number(v.max_students_per_job) || 0;

  let max = 99, min = 1;
  const why = { max: '', min: '' };
  const capMax = (n, reason) => { if (n > 0 && n < max) { max = n; why.max = reason; } };
  const capMin = (n, reason) => { if (n > 0 && n > min) { min = n; why.min = reason; } };

  if (space)  { capMax(Number(space.max), space.label || 'this venue');
                capMin(Number(space.min), space.label || 'this venue'); }
  if (tutor)  { capMax(Number(tutor.maxStudents), tutor.title);
                capMin(Number(tutor.minStudents), tutor.title); }
  capMax(houseMax, 'your limit');

  return { max, min, why };
}



/* ================================================================================================
   THE EIGHT THAT WERE NEVER CARRIED OVER.

   Each of these is referenced by the rules above and was not declared anywhere — so eight separate
   features would have thrown a ReferenceError the first time their path ran, and every one of them
   is on a path nothing has called yet. `node --check` cannot see any of it: a name that does not
   exist is perfectly good syntax right up until the line executes.

   All eight are restored from the pre-rewrite file rather than reinvented, because a plausible
   guess at OPEN_RATE is a wrong price, and a plausible guess at jobStatus is a booking in the
   wrong state. Where the original had a comment explaining itself, the comment came too.
================================================================================================ */

/* R is the hourly rate, and it is the tutor's own. A job nobody has claimed yet cannot be priced
   from the rate of a tutor who has not taken it, so an unclaimed one uses this.
   There is no minimum-wage floor and no markup: a tutor names their price, and what they are paid
   is what they charged. Your margin comes from B — your share of what an extra seat is worth —
   which is the only part of the price that is not the tutor's work. */
const OPEN_RATE = 10;

/* One word for "nothing chosen yet", everywhere. The form had four — "Choose ⌄", "All Levels", an
   empty option and "No preference" — which read as four different states rather than one. */
const NONE_LABEL = '\u2014\u2014\u2014';

/** The value of an input by id, or ''. Reads a control that may not be on screen without throwing. */
const val = id => ($(id) || {}).value || '';

/* Who takes part in the checklist and the arcade: students, tutors and admins. A parent has no
   topics to tick and no score to keep. */
const canTrack = () => hasRole('kid') || hasRole('student') || hasRole('tutor') || hasRole('admin');

/* An admin is a tutor with extra powers, so everywhere gated on "tutor" admits an admin too.
   Written once rather than as `USER.role === 'tutor'` at each site, which is how an admin came to
   be refused by half the checks and allowed by the other half. */
const isTutorRole = () => hasRole('tutor') || hasRole('admin');

/* THE FOUR WORDS A JOB'S STATUS CAN BE, and nothing else.
     unsent       built, not sent to anyone
     unconfirmed  created, nobody has paid — it exists on paper only
     active       at least one family is booked in and paying
     cancelled    everybody left
   Anything older in the sheet — Requested, Negotiating, Accepted, Unstarted — maps onto these, so
   rows written before the rename still read correctly rather than falling through to a default. */
const JOB_STATUSES = ['Unsent', 'Unconfirmed', 'Active', 'Cancelled'];
/* `jobStatus` was here — a booking's status worked out on the phone. The backend folds it from the
   events and sends it, and a second opinion computed from a partial copy of the data is exactly the
   kind of duplication that disagrees quietly. */


/**
 * DOES THIS PROMOTION APPLY to this booking?
 *
 * Returns false for anything it does not recognise, which is the safe direction: an unknown promo
 * type that defaulted to true would silently discount every booking on the site, and the first
 * anybody would know of it is the money.
 */
function promoApplies(p, ctx) {
  if (!p || !p.active) return false;
  switch (String(p.type || '').toLowerCase()) {
    case 'bulk':          return ctx.lessonCount >= (parseFloat(p.threshold) || 999);
    case 'multi_student': return ctx.n           >= (parseFloat(p.threshold) || 999);
    case 'long_term':     return ctx.weeks       >= (parseFloat(p.threshold) || 999);
    default: return false;
  }
}

/**
 * THE RUNNING TOTAL after a given row has applied.
 *
 * The last column used to hold each row's own contribution — "+ £3.08" — which made reading the
 * card an addition problem: to know what a booking costs after the level surcharge you had to sum
 * everything above it. A running figure answers that directly, and the last one IS the total, so
 * the column ends where the price ends.
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
  /* The venue always ADDS its rate and hosting TAKES IT BACK on the row below. Folding the hosting
     into the venue row meant that row said "+ £15.00/h" while the running total beside it did not
     move, and the Host row showed nothing at all — the deduction happened between two rows with
     neither of them reporting it. Each row moves the figure by exactly what it says it does. */
  p += (L.venueRate || 0);
  if (key === 'venue') return p;
  if (L.hosting) p -= (L.venueRate || 0);
  if (key === 'host') return p;
  p *= (L.hoursPerWeek || 0) || 1;
  if (key === 'hoursweek') return p;
  /* WEEKS, not dates. Hours-a-week already spans every day ticked, so multiplying by the date
     count — which is days × weeks — would count the days a second time. */
  p *= (L.weeksBooked || 0) || 1;
  if (key === 'term') return p;
  p /= (L.splitShares || 1);
  return p;
}

/* ---------- ONE READER FOR THE SUBJECT MULTIPLIERS -----------------------------------------------
   There were two, and they did not agree.

   `priceFrom` read `m.subjectsEta`. `subjectRows`, which draws the subject cards, read
   `m.subjects || m.subjectsEta` — the other order. The backend happens to send the same table
   under both names, so today they land on the same number and the disagreement is invisible. The
   day one of those keys changes, the price a client is quoted and the surcharge printed on the
   card stop matching, and nothing anywhere will say so.

   Two names for one table is the backend's business and it can keep them. What must not be
   duplicated is the RULE for reading it: which name wins, and what a blank or a zero means. That
   is one fact, so it is written once.

   A blank or a zero is 1, which is "no effect" — the same rule `sur()` uses for levels, days and
   times inside `priceFrom`. These are multipliers; nothing in this table may ever zero a price. */
function subjectMult(name) {
  const m = DATA.multipliers || {};
  const table = m.subjects || m.subjectsEta || {};
  const q = num(table[name]);
  return (isNaN(q) || q <= 0) ? 1 : q;
}

/* ---------- AND ONE READER FOR THE LEVEL MULTIPLIERS ---------------------------------------------
   THE SAME FAULT SUBJECTS HAD, one table along. The rule for reading the level surcharge lived
   inside `priceFrom` as a closure, so nothing outside `priceFrom` could ask what a level costs
   without writing the rule out a second time — which is exactly how `subjectMult` came to exist.
   `levelRows` needs that number for the card, so it is written once, here, beside its twin.

   A blank or a zero is 1. Same rule, same reason: these are multipliers and nothing in this table
   may ever zero a price. `sur()` inside `priceFrom` now calls through to this for levels, so the
   figure on the card and the figure in the quote are one number rather than two that agree. */
function levelMult(name) {
  const q = num(((DATA.multipliers || {}).levels || {})[name]);
  return (isNaN(q) || q <= 0) ? 1 : q;
}

/* WHETHER A LEVEL HAS ACTUALLY BEEN PRICED, which `levelMult` cannot say — it answers 1 for a
   level set to 1 on purpose and 1 for a level nobody has ever entered, and those are different
   facts. The pricing tab is mostly the second: the comment in `priceFrom` below says most levels
   have never been given a multiplier, and a card that prints "no surcharge" over a blank cell is
   reporting a decision that was never made. */
function levelPriced(name) {
  const t = (DATA.multipliers || {}).levels || {};
  return Object.prototype.hasOwnProperty.call(t, name) && String(t[name]).trim() !== '';
}

function priceFrom(spec) {
  spec = spec || {};
  const m = DATA.multipliers || {};
  const v = (DATA.constants || {}).vars || {};
  const cv  = (...keys) => { for (const key of keys) { const x = num(v[key]); if (!isNaN(x)) return x; } return 0; };
  const cvD = (key, dflt, ...alts) => { for (const key2 of [key, ...alts]) { const x = num(v[key2]); if (!isNaN(x)) return x; } return dflt; };
  /* A SURCHARGE IS A MULTIPLIER, so the neutral value is 1. It returned 0 — and everything in the
     hourly bracket is multiplied together, so ONE missing entry took the whole tuition to nothing
     and the client was charged room hire and no teaching.

     It was reachable on a perfectly ordinary booking: the level multipliers live in the pricing
     tab, most levels have never been given one, and a blank cell and an unlisted level are the
     same thing here. Days and times escaped it only because `worstOf` happens to end in `|| 1`,
     and subjects because they carry their own guard — so the same fault existed three times over
     and two of them had already been patched at the call site rather than here.

     Zero and blank both mean "no effect", which for a multiplier is 1. There is no value of this
     that should ever be able to zero a price. */
  /* LEVELS GO THROUGH `levelMult`, which is this same rule lifted out so the subject cards and the
     level cards can ask the question too. Everything else still reads its table here. Two callers,
     one rule — the arrangement `subjectMult` already has. */
  const sur = (group, value) => {
    if (group === 'levels') return levelMult(value);
    const x = num((m[group] || {})[value]);
    return (isNaN(x) || x <= 0) ? 1 : x;
  };

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
     P = ( [ rate x (Σ Sᵢ)/k x L x D x T ]     ← £/hour/child, all MULTIPLIED
           · [ 1 + s(k−1) ]                     ← subject-count
           · [ 1 + (c+B)(n−1) ]                 ← extra children (c = tutor's, B = yours)
           · [ 1 − b(W−1) ]                     ← bulk discount
           · [ 1 − a(A−1) ]                     ← advance-booking discount
         + V ) · h · W                          ← venue is £/hour (not per child)
     Every symbol comes from the sheet; set a rate to 0 to switch that effect off. ============ */

  /* --- THE PER-HOUR MULTIPLIERS. Blank in the sheet means 1, which is "no effect". ---
     THEY ARE MULTIPLIERS, NOT AMOUNTS, and the whole of this file agrees on that — `sur()` above
     returns 1 for a blank cell, which is the identity for multiplying and would be an invisible
     +£1 an hour if these were added. The formula above says so and `baseHourly` below does it.

     THE SPREADSHEET DID NOT AGREE. Its column was `surcharge_per_hour` and the note on every row
     it created said "added to the hourly rate when chosen" — so somebody typing 5 into the GCSE
     row, meaning five pounds an hour more, would have multiplied every GCSE booking by five. It
     has never fired because every value is still 0, and a 0 is read as 1 and does nothing.
     The column is now `multiplier` on the pricing tab, which is what it has always been here. */
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
  const L = sur('levels', level);   // level multiplier: 1.1 is "10% more", whoever teaches it
  /* With several days and times in one booking, the DEAREST applies. Averaging would let a cheap
     Monday offset a Sunday, so a booking that includes the expensive slot would cost less than one
     that is only the expensive slot. */
  const worstOf = (group, csv) => String(csv || '').split(',').map(x => x.trim()).filter(Boolean)
    /* Starts at 1 rather than 0 now that `sur` is neutral there — the `|| 1` on the end was the
       patch that hid this fault for days and times, and a patch that is no longer load-bearing is
       one somebody will remove for tidiness and reintroduce the bug with. */
    .reduce((hi, one) => Math.max(hi, sur(group, one)), 1);
  const D = worstOf('days',  day);
  const T = worstOf('times', time);

  // Subjects: the AVERAGE of the chosen subjects' multipliers — so a pricey subject among three
  // exerts only a third of its pull. (Σ Sᵢ)/k, written out.
  const subjAdds = subjects.map(subjectMult);
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
  /* ---------- BILLED BY THE SESSIONS THAT EXIST, NOT THE WEEKS THAT REMAIN ------------------------
     THIS PREFERRED `weeksLeft` AND THAT IS A DIFFERENT NUMBER. `weeksLeft` is how many weeks are
     left in the interval; `slots` is how many session dates were actually found in it. They agree
     most of the time, which is why this survived — and when they differ the card contradicts
     itself in public: the multiplier row said "x 3" while the line under it listed two dates, and
     the total charged for the three.

     A booking cannot cost more than the sessions it contains. `slots` is the count of real dates,
     so the arithmetic and the list of dates now come from one number instead of two.

     THE DIVISION STAYS, for a booking that has slots but no dates yet — two days a week over
     eleven weeks is twenty-two sessions and eleven weeks, and hours-a-week multiplies the second. */
  const weeksBooked = sessionDates.length
    ? Math.max(1, Math.round(sessionDates.length / runsPerWeek))
    : (slots ? Math.round(slots / runsPerWeek) : 0);
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