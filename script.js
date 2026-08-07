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
function jobStatus(j) {
  const s = String((j && j.status) || '').toLowerCase().trim();
  if (/cancel|abandon|declin/.test(s))                  return 'Cancelled';
  if (/unsent|draft/.test(s))                           return 'Unsent';
  if (/active|locked|ongoing|started|complete/.test(s)) return 'Active';
  return 'Unconfirmed';   // requested, negotiating, accepted, unstarted, blank — all "on paper"
}

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
  const sur = (group, value) => {
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
    /* Starts at 1 rather than 0 now that `sur` is neutral there — the `|| 1` on the end was the
       patch that hid this fault for days and times, and a patch that is no longer load-bearing is
       one somebody will remove for tidiness and reintroduce the bug with. */
    .reduce((hi, one) => Math.max(hi, sur(group, one)), 1);
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


/* ---------- THE PRICE BREAKDOWN, AS DATA ------------------------------------------------------
   Carried over whole. Every priced row on the card is declared ONCE here, and both the renderer
   and the refresher walk this same list — which is what stops a row being drawn and never updated,
   or updated after it stopped existing.

   `priceCells` and `runningAfter` were carried over at the rewrite and this table was not, so both
   were sitting in the file with nothing to walk. That is why the booker could only manage a per-
   hour figure and a total: the machinery for the full chain was already here and had no list.
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
    /* A DASH, not a sentence. "no change" is three words where the column holds numbers, and it
       is the only entry in it that has to be read rather than scanned. A dash says the same thing
       and keeps the column a column. */
    if (!m || m === 1) { out.mul = row.value && row.value(L) ? '—' : ''; return out; }
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


function subjectRows() {
  /* `subjectsEta` is where subject surcharges actually live — `subjects` is a separate, empty map
     and `subject` is nothing at all. I read the last of the three, which returns an empty object
     rather than an error, so every subject silently came back at x1. */
  const m = DATA.multipliers || {};
  const mult = m.subjects || m.subjectsEta || {};
  return (DATA.dropdowns?.subjects || []).map(name => {
    const tutors = (DATA.tutors || []).filter(t =>
      (t.teaches || []).some(x => norm(String(x).replace(/\s*\([^)]*\)/, '')) === norm(name)));
    const levels = uniq(tutors.flatMap(t => (t.teaches || [])
      .filter(x => norm(String(x).replace(/\s*\([^)]*\)/, '')) === norm(name))
      .map(x => (String(x).match(/\(([^)]+)\)/) || [, ''])[1])));
    /* The same word a tutor or a venue uses. One vocabulary across all three, so "sporty" filters
       them together rather than meaning something slightly different in each place. */
    const focus = ((DATA.dropdowns || {}).focus || {}).subject || {};
    return { name, mult: Number(mult[name]) || 1, tutors, levels,
             focus: focus[name] || '', rowIndex: null, type: 'subject' };
  });
}


function tickCount() {
  if (!USER) return 0;
  return ['tick1', 'tick2', 'tick3'].reduce((n, k) =>
    n + String(USER[k] || '').split(',').map(x => x.trim()).filter(Boolean).length, 0);
}


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


const START = 'rnbqkbnrpppppppp________________________________PPPPPPPPRNBQKBNR'.split('');

const CH_WHITE = 'w', CH_BLACK = 'b';
const isWhite = p => p !== '_' && p === p.toUpperCase();
const colourOf = p => p === '_' ? null : (isWhite(p) ? CH_WHITE : CH_BLACK);

/* A position is the board plus the four things you cannot see on it: whose turn, what castling is
   still allowed, whether an en-passant capture is available, and the move count. Leaving any of
   them out is the usual way a chess implementation goes quietly wrong. */
function newGame() {
  return {
    board: START.slice(),
    turn: CH_WHITE,
    castle: { K: true, Q: true, k: true, q: true },   // K/Q = white king/queen side
    ep: -1,                                            // square a pawn may be captured on, or -1
    halfmove: 0,                                       // for the fifty-move rule
  };
}

const file = i => i % 8;
const rank = i => Math.floor(i / 8);
const onBoard = (f, r) => f >= 0 && f < 8 && r >= 0 && r < 8;
const idx = (f, r) => r * 8 + f;

/* ---------- MOVES A PIECE COULD MAKE, ignoring whether the king is left in check ---------------
   Split out because "can this piece reach that square" and "is this move legal" are different
   questions, and conflating them is what makes check detection recursive and slow. */
function pseudoMoves(pos, from) {
  const b = pos.board, p = b[from];
  if (p === '_') return [];
  const me = colourOf(p);
  const f = file(from), r = rank(from);
  const out = [];
  const add = (tf, tr, opts) => {
    if (!onBoard(tf, tr)) return false;
    const to = idx(tf, tr);
    const t = b[to];
    if (t !== '_' && colourOf(t) === me) return false;      // own piece blocks
    out.push({ from, to, ...(opts || {}) });
    return t === '_';                                        // may continue if empty
  };
  const ray = (df, dr) => {
    for (let k = 1; k < 8; k++) if (!add(f + df * k, r + dr * k)) break;
  };

  const up = me === CH_WHITE ? -1 : 1;                          // white moves toward rank 0
  switch (p.toLowerCase()) {
    case 'p': {
      const one = idx(f, r + up);
      if (onBoard(f, r + up) && b[one] === '_') {
        // Promotion: a pawn reaching the last rank must become something.
        const last = (me === CH_WHITE && r + up === 0) || (me === CH_BLACK && r + up === 7);
        if (last) 'QRBN'.split('').forEach(q => out.push({ from, to: one, promote: q }));
        else out.push({ from, to: one });

        const startRank = me === CH_WHITE ? 6 : 1;
        const two = idx(f, r + up * 2);
        if (r === startRank && b[two] === '_') out.push({ from, to: two, double: true });
      }
      // Captures, including en passant — the one capture that lands on an empty square.
      [-1, 1].forEach(df => {
        const tf = f + df, tr = r + up;
        if (!onBoard(tf, tr)) return;
        const to = idx(tf, tr);
        const t = b[to];
        if (t !== '_' && colourOf(t) !== me) {
          const last = tr === 0 || tr === 7;
          if (last) 'QRBN'.split('').forEach(q => out.push({ from, to, promote: q }));
          else out.push({ from, to });
        } else if (to === pos.ep) {
          out.push({ from, to, enpassant: true });
        }
      });
      break;
    }
    case 'n':
      [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]]
        .forEach(([df, dr]) => add(f + df, r + dr));
      break;
    case 'b': [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,c]) => ray(a,c)); break;
    case 'r': [[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,c]) => ray(a,c)); break;
    case 'q': [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,c]) => ray(a,c)); break;
    case 'k':
      [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]].forEach(([df,dr]) => add(f+df, r+dr));
      break;
  }
  return out;
}

/** Is `sq` attacked by `by`? Asked of the king's square to find check. */
function attacked(pos, sq, by) {
  for (let i = 0; i < 64; i++) {
    const p = pos.board[i];
    if (p === '_' || colourOf(p) !== by) continue;
    /* Pawns are the exception: they MOVE forward and CAPTURE diagonally, so their moves are not
       the squares they attack. Using pseudoMoves here would have a pawn "attacking" the square in
       front of it, which is the classic way a king ends up able to walk into check. */
    if (p.toLowerCase() === 'p') {
      const up = by === CH_WHITE ? -1 : 1;
      const f = file(i), r = rank(i);
      if ((onBoard(f-1, r+up) && idx(f-1, r+up) === sq) ||
          (onBoard(f+1, r+up) && idx(f+1, r+up) === sq)) return true;
      continue;
    }
    if (pseudoMoves(pos, i).some(m => m.to === sq)) return true;
  }
  return false;
}

const kingSquare = (pos, side) =>
  pos.board.indexOf(side === CH_WHITE ? 'K' : 'k');

const inCheck = (pos, side) =>
  attacked(pos, kingSquare(pos, side), side === CH_WHITE ? CH_BLACK : CH_WHITE);

/** Play a move and hand back a NEW position. Nothing mutates, so undo is free and search is safe. */
function play(pos, m) {
  const n = {
    board: pos.board.slice(),
    turn: pos.turn === CH_WHITE ? CH_BLACK : CH_WHITE,
    castle: { ...pos.castle },
    ep: -1,
    halfmove: pos.halfmove + 1,
  };
  const p = n.board[m.from];
  const isPawn = p.toLowerCase() === 'p';
  if (isPawn || n.board[m.to] !== '_') n.halfmove = 0;

  n.board[m.to] = m.promote ? (isWhite(p) ? m.promote : m.promote.toLowerCase()) : p;
  n.board[m.from] = '_';

  // En passant: the captured pawn is not on the square you landed on.
  if (m.enpassant) n.board[idx(file(m.to), rank(m.from))] = '_';
  if (m.double) n.ep = idx(file(m.from), (rank(m.from) + rank(m.to)) / 2);

  // Castling moves the rook too.
  if (m.castle === 'K') { n.board[63] = '_'; n.board[61] = 'R'; }
  if (m.castle === 'Q') { n.board[56] = '_'; n.board[59] = 'R'; }
  if (m.castle === 'k') { n.board[7]  = '_'; n.board[5]  = 'r'; }
  if (m.castle === 'q') { n.board[0]  = '_'; n.board[3]  = 'r'; }

  /* Rights are lost by the king or rook MOVING, and also by a rook being captured on its home
     square — the second is the one implementations forget. */
  if (p === 'K') { n.castle.K = n.castle.Q = false; }
  if (p === 'k') { n.castle.k = n.castle.q = false; }
  if (m.from === 63 || m.to === 63) n.castle.K = false;
  if (m.from === 56 || m.to === 56) n.castle.Q = false;
  if (m.from === 7  || m.to === 7)  n.castle.k = false;
  if (m.from === 0  || m.to === 0)  n.castle.q = false;

  return n;
}

/** Every LEGAL move for the side to play — pseudo-moves, minus those that leave the king in check. */
function legalMoves(pos) {
  const side = pos.turn;
  const out = [];
  for (let i = 0; i < 64; i++) {
    if (pos.board[i] === '_' || colourOf(pos.board[i]) !== side) continue;
    for (const m of pseudoMoves(pos, i)) {
      if (!inCheck(play(pos, m), side)) out.push(m);
    }
  }

  /* Castling, which has four conditions and is where most implementations leak:
     the right survives, the squares between are empty, the king is not in check now, and it does
     not PASS THROUGH or land on an attacked square. */
  const them = side === CH_WHITE ? CH_BLACK : CH_WHITE;
  const k = kingSquare(pos, side);
  const safe = sq => !attacked(pos, sq, them);
  if (!inCheck(pos, side)) {
    if (side === CH_WHITE && k === 60) {
      if (pos.castle.K && pos.board[61] === '_' && pos.board[62] === '_'
          && pos.board[63] === 'R' && safe(61) && safe(62))
        out.push({ from: 60, to: 62, castle: 'K' });
      if (pos.castle.Q && pos.board[59] === '_' && pos.board[58] === '_' && pos.board[57] === '_'
          && pos.board[56] === 'R' && safe(59) && safe(58))
        out.push({ from: 60, to: 58, castle: 'Q' });
    }
    if (side === CH_BLACK && k === 4) {
      if (pos.castle.k && pos.board[5] === '_' && pos.board[6] === '_'
          && pos.board[7] === 'r' && safe(5) && safe(6))
        out.push({ from: 4, to: 6, castle: 'k' });
      if (pos.castle.q && pos.board[3] === '_' && pos.board[2] === '_' && pos.board[1] === '_'
          && pos.board[0] === 'r' && safe(3) && safe(2))
        out.push({ from: 4, to: 2, castle: 'q' });
    }
  }
  return out;
}

/** Checkmate, stalemate, or neither. No legal moves plus check is mate; without check it's a draw. */
function outcome(pos) {
  if (legalMoves(pos).length) return null;
  return inCheck(pos, pos.turn) ? 'mate' : 'stalemate';
}

/* ---------- THE OPPONENT -----------------------------------------------------------------------
   Minimax with alpha-beta. Deliberately shallow: a student wants an opponent that can be beaten
   with thought, not one that cannot be beaten at all — and a browser on a Chromebook has to answer
   within a second. */
const VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

/* Where a piece would rather be. Crude, but it is the difference between an engine that develops
   and one that shuffles its rooks — and the tables cost nothing to evaluate. */
const PAWN_MAP = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0];
const KNIGHT_MAP = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50];

function evaluate(pos) {
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const p = pos.board[i];
    if (p === '_') continue;
    const w = isWhite(p);
    let v = VALUE[p.toLowerCase()];
    // The maps are written from black's point of view, so white reads them mirrored.
    const at = w ? i : 63 - i;
    if (p.toLowerCase() === 'p') v += PAWN_MAP[at];
    if (p.toLowerCase() === 'n') v += KNIGHT_MAP[at];
    score += w ? v : -v;
  }
  return score;                                    // positive favours white
}

function search(pos, depth, alpha, beta) {
  const end = outcome(pos);
  if (end === 'mate') return pos.turn === CH_WHITE ? -99999 + depth : 99999 - depth;
  if (end === 'stalemate') return 0;
  if (depth === 0) return evaluate(pos);

  const moves = legalMoves(pos);
  // Captures first: alpha-beta prunes far more when good moves come early.
  moves.sort((a, b) => (pos.board[b.to] !== '_' ? 1 : 0) - (pos.board[a.to] !== '_' ? 1 : 0));

  if (pos.turn === CH_WHITE) {
    let best = -Infinity;
    for (const m of moves) {
      best = Math.max(best, search(play(pos, m), depth - 1, alpha, beta));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    best = Math.min(best, search(play(pos, m), depth - 1, alpha, beta));
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function bestMove(pos, depth) {
  const moves = legalMoves(pos);
  if (!moves.length) return null;
  let best = null, bestScore = pos.turn === CH_WHITE ? -Infinity : Infinity;
  // Shuffled, so an engine facing the same position twice does not play the same game twice.
  moves.sort(() => Math.random() - 0.5);
  for (const m of moves) {
    const s = search(play(pos, m), depth - 1, -Infinity, Infinity);
    if (pos.turn === CH_WHITE ? s > bestScore : s < bestScore) { bestScore = s; best = m; }
  }
  return best;
}


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

  ['Money', 'The £ sign is a letter L',
   'Libra — Roman for pound weight. The two strokes through it mean abbreviation. Same root as lb for pounds, which is why neither looks like the word it stands for.', 'pound sterling coins'],
  ['Money', 'A Post Office was once the biggest bank in the country',
   'Before high street banking reached most towns, the Post Office Savings Bank held more accounts than every bank combined. It is why post offices still feel institutional.', 'old post office building'],
  ['Money', 'Nobody agrees what a billion is',
   'It meant a million million in Britain until the 1970s and a thousand million in America. The government switched officially in 1974 and old textbooks did not.', 'calculator numbers'],

  ['Sport', 'The marathon distance comes from a royal box',
   'It was 25 miles until London 1908, when the start moved to Windsor Castle so the children could watch from the nursery. The extra 385 yards has been standard ever since.', 'marathon runners'],
  ['Sport', 'Football nearly had no crossbar',
   'Until 1875 the goal was two posts and a tape. Teams argued endlessly about whether a ball had passed over or under it, which is a fair description of most sport before rules.', 'football goal posts'],
  ['Sport', 'Table tennis was banned in the Soviet Union for 20 years',
   'Officials decided it was harmful to the eyes. The ban lasted from 1930 to 1950, by which time the rest of the world had a considerable head start.', 'table tennis'],

  ['Tech', 'The first computer bug was a moth',
   'Grace Hopper taped it into the Harvard Mark II logbook in 1947 with the note "first actual case of bug being found". The word already meant a fault; she found a literal one.', 'computer punch card'],
  ['Tech', 'Wi-Fi does not stand for anything',
   'A branding agency invented it to sound like hi-fi. IEEE 802.11b Direct Sequence is what it replaced, and the meaninglessness was the point.', 'wifi router'],
  ['Tech', 'The @ sign was nearly extinct',
   'It survived on typewriter keyboards as an accounting shorthand — 3 widgets @ £2. Ray Tomlinson picked it for email in 1971 because nobody used it in names.', 'typewriter keys'],
  ['Tech', 'Nokia started as a paper mill',
   'Then rubber boots, then cables, then phones. Companies that last a century rarely do it by staying in the same business.', 'paper mill'],

  ['Nature', 'Trees talk through fungus',
   'Mycorrhizal networks link roots across a forest, moving sugar and warning signals between trees. A dying tree will push its carbon into its neighbours.', 'forest fungi roots'],
  ['Nature', 'A single aspen colony can be one organism',
   'Pando in Utah is 47,000 trunks sharing one root system, thought to weigh 6,000 tonnes. It is possibly the heaviest living thing on Earth.', 'aspen forest'],
  ['Nature', 'Bamboo can grow nearly a metre a day',
   'Some species add 90cm in 24 hours — fast enough that you could watch it if you were patient. It is a grass, not a tree.', 'bamboo forest'],
  ['Nature', 'Lightning is five times hotter than the sun',
   'About 30,000°C at the channel, against 5,500°C at the sun surface. Only for a few millionths of a second, which is the only reason anyone survives being near it.', 'lightning storm'],

  ['Buildings', 'The Empire State Building went up in 410 days',
   'Finished ahead of schedule and under budget in 1931. Modern equivalents take four or five years, and mostly for reasons that have nothing to do with the building.', 'Empire State Building'],
  ['Buildings', 'Notre-Dame took nearly 200 years',
   'Begun 1163, largely finished 1345. Nobody who laid the first stone saw the roof. Cathedrals were built by people who accepted they would not see the end.', 'Notre Dame Paris'],
  ['Buildings', 'Venice is built on wooden piles that never rotted',
   'Millions of alder trunks driven into the mud. Without oxygen the wood petrified instead of decaying, and it has held the city up for 1,200 years.', 'Venice canal buildings'],

  ['People', 'The inventor of the Pringles tube is buried in one',
   'Fredric Baur was so pleased with it that he asked to be interred in one. His children stopped at a supermarket on the way to the funeral to buy the tube.', 'pringles tube'],
  ['People', 'Nikola Tesla died owing money in a New York hotel',
   'He had 300 patents and had lit the world, and spent his last years feeding pigeons. Being right and being paid are different achievements.', 'Nikola Tesla portrait'],
  ['People', 'Roald Dahl helped invent a brain valve',
   'After his son was injured, he worked with an engineer and a surgeon on the Wade-Dahl-Till valve for hydrocephalus. It was used on thousands of children.', 'Roald Dahl'],

  ['Oddities', 'There is a town where it is illegal to die',
   'Longyearbyen in Svalbard. The permafrost stops bodies decomposing, so burials preserve whatever killed you — including the 1918 flu, still viable in graves there.', 'Longyearbyen Svalbard'],
  ['Oddities', 'A cloud weighs about 500 tonnes',
   'An average cumulus holds roughly that much water. It stays up because the droplets are tiny and the air beneath is warmer and rising.', 'cumulus cloud sky'],
  ['Oddities', 'The shortest war lasted 38 minutes',
   'Britain against Zanzibar, 1896. The Sultan surrendered before the ships had finished firing, and the war was over before most people knew it had begun.', 'Zanzibar historic'],
  ['Oddities', 'Scotland has 421 words for snow',
   'Feefle, flindrikin, snitter, spitters, unbrak. A language grows vocabulary where its speakers need precision, which is why English has so many words for rain.', 'snow scotland landscape'],
];

/* THE COMPUTED GENERATORS lived here — times tables, factors, squares, percentages. Removed.
   They were endless, which was their whole justification, and endless arithmetic is still
   arithmetic: a feed that keeps handing you 7 x 8 is a feed you stop opening. Length comes from
   the list being long instead. */


function feedShuffle() {
  const deck = FEED_FACTS.map((_, i) => i);
  /* Seeded by the day and by how many decks have been through, so:
       · reloading gives the SAME order, which is what makes remembering your place worth anything
       · tomorrow gives a different one
       · a second pass today is a different order again, rather than the same 58 in the same run */
  let x = (feedToday() * 2654435761 + FEED_PASS * 40503) >>> 0;
  const rnd = () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };
  FEED_PASS++;
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  /* Never open on the card that just closed. Reshuffling can otherwise deal the same one twice in
     a row across the join, which is the one repeat anybody actually notices. */
  if (FEED_SEEN.length && FEED_FACTS[deck[0]] &&
      FEED_FACTS[deck[0]][1] === FEED_SEEN[FEED_SEEN.length - 1]) {
    deck.push(deck.shift());
  }
  FEED_DECK = deck;
}


function feedItem(n) {
  if (FEED_BUILT[n]) return FEED_BUILT[n];       // going back shows what you already saw

  if (!FEED_DECK.length) feedShuffle();
  const [subject, heading, body, pic] = FEED_FACTS[FEED_DECK.shift()];

  FEED_SEEN.push(heading);
  if (FEED_SEEN.length > 4) FEED_SEEN.shift();

  FEED_BUILT[n] = { id: 'g' + n, subject, heading, body, pic };
  return FEED_BUILT[n];
}


function feedToday() { return Math.floor(Date.now() / 864e5); }

/* ================================================================================================
   @family. — the shell.

   Not the whole app: the RUNTIME the screens are built on. Tabs, screen switching, the sheet, the
   toast, and the one place a screen is registered.

   The point of doing this first is that every screen after it is small. A screen becomes a
   function that returns markup and says what its header should read — it never touches the tab
   bar, never hides another screen, and never has an opinion about the sheet.
================================================================================================ */

/* ---------- WHERE THE DATA COMES FROM -----------------------------------------------------------
   THE ONE LINE THAT DECIDES WHETHER ANY OF THIS WORKS, and the one that went wrong for a week.

   Apps Script has two ways to publish. "Manage deployments → pencil → New version" updates the
   deployment already here. "New deployment" makes a SECOND one with a DIFFERENT id — and then
   every version you push lands on a URL nothing is calling, while this line goes on asking the
   old one. From the outside that is indistinguishable from the code not working: the editor says
   deployed, the sheet is right, and the site answers as it did yesterday.

   IT MUST BE THE ONE UNDER "ACTIVE" IN MANAGE DEPLOYMENTS. There is exactly one, and everything
   else in that list is Archived — an archived deployment is not served at all, so a URL pointing
   at one fails before it reaches any code. That is what "Failed to fetch" was: not a wrong
   character, not an access setting, a dead address.

   The two mistakes that produced it, so neither is repeated:
     · "New deployment" makes a SECOND URL rather than updating this one. Every version pushed
       that way lands somewhere the site is not calling. Use the PENCIL on the Active row and
       choose Version: New version.
     · An id that used to work is not evidence it still exists. The Active list is the evidence.

   To change it: Manage deployments → Active → the Copy button under the Web app URL. COPY IT,
   NEVER TYPE IT, and never read it off a screen. Seventy-two characters, and the one that went
   wrong here was position 22: a lowercase L read as a capital I. In this font they are the same
   vertical stroke, the URL is valid, the request goes out, and what comes back is "Failed to
   fetch" — which is also what a dead deployment and a private one look like. Three faults, one
   symptom, and no way to tell them apart from inside the app.
--------------------------------------------------------------------------------------------- */
const API = 'https://script.google.com/macros/s/AKfycbyDr5ZsF63_zfgx3tlhqPF3H7U8zSY8TjB8EKY30ZWxBfDIR0QztN4B64V9c-mud7Go/exec';

/* WHICH VERSION OF THE SITE THIS IS.
   The backend has had one since the beginning and the site has not, which is why "the backend is
   older than the site" could be diagnosed in ten seconds and "the site is older than the site"
   could not. GitHub Pages takes a minute to publish and a browser caches script.js for far longer,
   so a fix can be committed, pushed and live while the phone in your hand is still running last
   week's. Nothing said so, and there was no way to ask.

   Bumped whenever this file changes. Shown on the You screen and in every failure banner. */
const SITE_VERSION = '2026-08-07-built';

/**
 * WHICH STYLESHEET IS RUNNING.
 *
 * Read from a custom property `style.css` sets on :root. Without it the site could report its own
 * script version and its backend version and say nothing at all about its CSS — so a rule that had
 * been changed and a rule that had not arrived looked identical, and the only way to tell was to
 * ask somebody to hard refresh and try again.
 *
 * An empty answer means the stylesheet predates this, which is itself the answer.
 */
function cssVersion() {
  try {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--css-version').trim().replace(/^["']|["']$/g, '');
    return v || '(older than versioning)';
  } catch { return '(unknown)'; }
}

let DATA = {};
let USER = null;
try { USER = JSON.parse(localStorage.getItem('familyUser') || 'null'); } catch {}

/* ---------- THE SMALLEST HELPERS ---------------------------------------------------------------- */
const $ = id => document.getElementById(id);

/* The letter to put in a circle when there is no picture. The first LETTER, not the first
   character — punctuation is not an initial, and "@family." was giving "@", which sat next to the
   name and read as @@family. */
const initial = s => (String(s ?? '').match(/[A-Za-z0-9]/) || ['?'])[0].toUpperCase();

/* Anything from the branding tab, by name, with a fallback. Never throws on a key that has not
   been filled in — the whole point of that tab is that most of it is empty most of the time. */
const brand = (k, or) => ((DATA.brand || {})[k] || or || '');

/**
 * IS THIS SOMETHING YOU WEAR?
 *
 * The backend used to call it `avatar` — the sheet's own word — and now says `wearable`, which is
 * what it is to a person looking at one. Both are accepted, and that is not tidiness: these two
 * files travel separately and are pasted one per message, so for at least one deploy the payload
 * and the code that reads it will disagree about the word. Accepting either means the order they
 * arrive in does not matter, which is the same reason the screen describes its own layout rather
 * than trusting the stylesheet.
 *
 * Asked in one place, so the day the old word can be dropped is a one-line day.
 */
const isWearable = x => {
  const k = norm(x && (x.kind || x.kindRaw));
  return k === 'wearable' || k === 'avatar';
};

/* Whether the person signed in is an admin. Asked through roleOf, so it is true whichever of the
   four spellings the sheet happens to use — the old app had this and the new shell never did,
   which would have thrown the moment an admin opened a tutor, silently, inside a template. */
const isAdmin = () => !!USER && roleOf(USER.role || '') === 'admin';

/* ---------- THE LAWS ----------------------------------------------------------------------------
   How words are coloured, wherever they appear. Subjects green, #tags blue, @names softer blue,
   client names red — and the list lives in the database, so a new law is a row rather than a
   deploy.

   TWO THINGS MAKE THIS SAFE, and neither is optional:

   1. THE TEXT IS ESCAPED FIRST. Captions come from a spreadsheet anybody with an account can type
      into. Colour the words first and a caption reading `<img onerror=…>` is a script running on
      every phone that opens the app. Escape, then wrap — there is exactly one correct order.

   2. A MATCH IS NEVER FOUND INSIDE A SPAN ALREADY MADE. Each match is swapped for a placeholder
      that later laws cannot see, and the placeholders are put back at the end. Without it a
      subject called "Art" would colour the letters inside `<span class="part">`.
--------------------------------------------------------------------------------------------- */

/* One place a colour name becomes a class. A law says "green"; the stylesheet decides what green
   is — so the palette stays where a designer would look for it. */
const LAW_CLASS = {
  green: 'w-green', blue: 'w-blue', 'blue-soft': 'w-blue-soft',
  /* PURPLE IS A VENUE, the way green is a subject. The second colour to be given a meaning, and
     the restraint is the same: nothing else may use it, or it stops meaning anything.
     It needs a row in the `laws` tab to take effect — kind `list`, match `venues`, colour
     `purple` — because the list of venues is data and this is only the palette. */
  purple: 'w-purple',
  /* PINK IS SOMETHING YOU WEAR. A cape and a subject are not the same kind of noun, and the whole
     value of colouring a word is that you know what kind of thing it is before you have read it.
     It needs a row in the `laws` tab like the others — kind `list`, match `wearables`, colour
     `pink`. This is the palette; the list of wearables is data. */
  pink: 'w-pink',
  red: 'w-red', amber: 'w-amber', dim: 'w-dim', ink: '',
};

/** The lists a `kind: list` law can name. Each is read fresh, so adding a subject colours it. */
function lawList(name) {
  const d = DATA || {};
  switch (norm(name)) {
    case 'subjects': return ((d.dropdowns || {}).subjects || []);
    case 'tutors':   return (d.tutors || []).map(t => t.title);
    case 'venues':   return (d.venues || []).map(v => v.title);
    case 'clients':  return (d.clients || d.people || []).map(p => p.title || p.name || p);
    /* Everything in the shop that is worn rather than posted. Read from the shop rather than kept
       as a second list, so an item added to the sheet is coloured without anything else changing —
       which is the point of a law naming a list instead of naming words. */
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

/* ---------- WHEN SOMETHING HAPPENED --------------------------------------------------------------
   HOW LONG AGO, until that stops being the useful answer, and then the date.

   "3 hours ago" is something you feel; "16 August 2026" is something you look up. Everything
   recent enough to still be in somebody's head gets the first; past two months the gap has
   stopped meaning anything and the date is what you would actually want to know.
--------------------------------------------------------------------------------------------- */
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

/**
 * A timestamp WITH its time. `parseDMY` deliberately drops it — a session date is a date — and
 * here the time is the whole point: something posted forty minutes ago and something posted this
 * morning are both "today", and only one of them is news.
 *
 * DD/MM/YYYY, read explicitly. `new Date('12/06/2026')` is December the 6th in a browser, which
 * is the same misreading that would put half the feed in the wrong order.
 */
function parseWhen(v) {
  if (typeof v === 'number' && v > 0) return new Date(v);      // the payload's `at`, in ms
  const t = String(v ?? '').trim();
  if (!t) return null;
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

/**
 * The ladder. Singulars are words rather than numbers — "a minute ago", not "1 minute ago",
 * because nobody counts to one — and "yesterday" for the same reason.
 *
 * A date in the FUTURE is not a negative age. Clock skew and a hand-typed timestamp both produce
 * one, and "-3 hours ago" is the app admitting it cannot subtract, so anything ahead of now shows
 * its date instead.
 */
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

/* ---------- THE TABS ----------------------------------------------------------------------------
   One table. It drives the bar, the routing, and which screen is showing — so a tab cannot exist
   without a screen behind it, and a screen cannot be unreachable.

   `render` is the only thing a screen has to provide: a function returning the markup for that
   screen. `title` is what the header reads. Nothing else.
--------------------------------------------------------------------------------------------- */
const TABS = [
  /* Posts leftmost: the one screen somebody opens with no errand. Every other tab answers a
     question, and a person with no question needs somewhere to land. */
  { id: 'posts',   icon: '▦',  label: 'Posts',   title: 'Posts' },
  /* ONE TAB FOR FINDING ANYTHING — tutors, venues, subjects, resources, wearables, things.
     The id stays `stuff` because it keys the pager, the page memory and the tests; only what it is
     called has changed, and renaming an id to match a label is a day of moving things for no
     effect anybody can see. */
  /* FOUR TABS. Everything that is a THING you might want is behind one question here — people,
     places, subjects, resources, links, tools, games — and the three tabs that used to hold some
     of them are gone. What is left is the three things that are not lookups: the feed, booking,
     and you. */
  { id: 'stuff',   icon: '🔎', label: 'Find',    title: 'Find' },

  /* BOOK, dead centre and a plus. The middle is where a thumb rests without moving, and a plus
     says "make something" in a way no other glyph does — it is the one action the whole app is
     for, and it should not be a word among six other words. */
  { id: 'book',    icon: '＋', label: 'Book',    title: 'Book a session', big: true },

  /* NOT "Who". It holds tutors, venues AND subjects — people, places and things — so a name
     asking about people was wrong about two thirds of it. "Find" is what you are doing on it. */
  /* You, last. Everything else is the app; this is the one screen that is only about the person
     using it, and the far corner is where every app in the world has taught people to look. */
  { id: 'me',      icon: '◉',  label: 'You',     title: 'You' },
];

/* What each screen draws. Registered separately from the tab list so a screen can be built and
   swapped without touching the navigation — which is the whole reason for splitting them. */
const SCREENS = {};

/** Register a screen. `draw` returns markup; `act` is the optional header action. */
function screen(id, draw, act) { SCREENS[id] = { draw, act }; }

let AT = 'posts';
try { AT = localStorage.getItem('familyTab') || 'posts'; } catch {}

function go(id, remember, instant) {
  const tab = TABS.find(t => t.id === id) || TABS[0];
  const was = AT;
  AT = tab.id;
  if (remember !== false) { try { localStorage.setItem('familyTab', AT); } catch {} }

  /* NOTHING IS HIDDEN ANY MORE. Every screen sits on the X axis and is placed by how far it is
     from the one in front — which is what makes a sideways swipe show the next tab arriving rather
     than nothing at all, and what makes the two axes the same thing.
     A screen keeps its half-filled form and its scroll position exactly as it did when it was
     hidden, because it is still in the document; it is simply somewhere else. */
  /* IT ARRIVES FROM THE SIDE IT CAME FROM. One class and one keyframe, rather than eight screens
     held in position so that one of them could be seen sliding in. */
  const from = TABS.findIndex(t => t.id === was), to = TABS.findIndex(t => t.id === AT);
  const way = (was && was !== AT) ? (to > from ? 1 : -1) : 0;

  /* PAINT FIRST, PLACE SECOND, ALWAYS.
     `paintNeighbours` was running AFTER the placement and repainting the current screen along with
     its neighbours — so the pages that had just been given a position were replaced by fresh ones
     with none, and a page with no position sits at its resting place: off the side, invisible.
     The screen went blank and its neighbour showed a sliver. Placement is the last thing that
     happens here, and nothing after it may write innerHTML. */
  paintNeighbours();
  placeCells('x', instant);
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === AT));

  $('top-title').textContent = tab.title;

  /* The header's action belongs to the SCREEN, not the header — so a screen decides what its one
     button is, and the header has no list of special cases. */
  const s = SCREENS[AT];
  $('top-right').innerHTML = (s && s.act) ? s.act() : '';

  paint(AT);
  /* Anything that needs to start running once its markup exists — a canvas, a board, a clock.
     After paint, because none of it can find an element that has not been drawn yet. */
  /* A hoisted FUNCTION, not a const. The wakers are defined further down with the games they
     start, and a `const` read before its own line throws — including through `typeof`, which is
     the one check that cannot see into a temporal dead zone. A function declaration is hoisted,
     so calling it from up here is fine. */
  if (AT === 'stuff') fillStuffPages();
  /* After wake, because a page holding a canvas has to exist and be sized before it is moved.
     INSTANT, because this is arriving rather than travelling: the tab remembers which widget you
     were on, and animating there from the top is the app appearing to lose your place and then
     go and find it. */
  paintPager(AT, true);

  /* Back to the top on a tab change. Landing halfway down a new screen because the last one was
     scrolled is the single most disorienting thing a tab bar can do. */
  scrollTo({ top: 0, behavior: 'instant' });

  /* Played last, on the screen that is now the only one in the layout. Removed when it finishes
     rather than on a timer, so a slow phone sees the end of it. */
  if (way && !instant) arrive($('s-' + AT), way > 0 ? 'from-right' : 'from-left');
}

/** A short slide in, from one side or the other. The whole of the movement, in one place. */
function arrive(el, which) {
  if (!el) return;
  el.classList.remove('from-left', 'from-right', 'from-below', 'from-above');
  void el.offsetWidth;          // or the browser folds both changes into one frame and nothing runs
  el.classList.add(which);
  el.addEventListener('animationend', () => el.classList.remove(which), { once: true });
}

/**
 * DRAW THE SCREEN EITHER SIDE, so a sideways drag reveals one rather than an empty rectangle.
 *
 * Only the neighbours. Eight screens redrawn on every tab change would be most of a second on a
 * phone, and one of them holds four hundred resources — the same reasoning that fills a page of
 * the Stuff list only when you can reach it.
 */
function paintNeighbours() {
  const at = TABS.findIndex(t => t.id === AT);
  [at - 1, at + 1].forEach(i => {
    if (i < 0 || i >= TABS.length) return;
    const id = TABS[i].id;
    const el = $('s-' + id);
    if (!el || el.innerHTML) return;          // already drawn; redrawing would only cost
    paint(id);
    /* And placed, if it is a paged screen. A neighbour whose pages have no position shows nothing
       when a drag reveals it, which is worse than showing an empty rectangle because it looks like
       the screen itself is empty. */
    if (PAGER[id]) paintPager(id, true);
  });
  /* The screen in front is NOT repainted here. `go` has already drawn it, and drawing it a second
     time is what threw its placement away. */
}

/** Redraw one screen where it stands. Called after anything that changes what it should say. */
function paint(id) {
  /* A PAGED SCREEN HAS NO PADDING OF ITS OWN — each page supplies it, because a page is positioned
     against the screen's padding box and would otherwise be inset by it and then pad itself again.
     Marked here rather than in the markup so the two lists of paged screens cannot disagree:
     `PAGER` is the only one. */
  $('s-' + id)?.classList.toggle('paged', !!PAGER[id]);
  const el = $('s-' + id);
  const s = SCREENS[id];
  if (!el) return;
  el.innerHTML = s
    ? s.draw()
    : '<p class="empty">Nothing here yet.</p>';
}

/**
 * WHAT TO SAY WHEN THERE IS NOTHING.
 *
 * "Nothing here yet" and "we could not reach the server" are different facts, and every screen was
 * saying the first for both — so a phone with no signal told people to go and add rows to a
 * spreadsheet. One sentence, so no screen can get it wrong on its own, and so improving the
 * wording improves it everywhere at once.
 */
function nothingHere(whenEmpty) {
  return LOAD_FAILED
    ? `<p class="empty">Couldn’t load.<br>
        <span class="faint">${esc(LOAD_FAILED)}</span><br>
        <span class="text-action" data-do="retry">Try again</span></p>`
    : `<p class="empty">${whenEmpty}</p>`;
}

/** Redraw whatever is showing. What almost everything calls after a change. */
const repaint = () => {
  paint(AT);
  const s = SCREENS[AT];
  if (s && s.act) $('top-right').innerHTML = s.act();
  /* A repaint rebuilds the markup, which throws the positions away with it — so the page you were
     on would silently become the first one every time anything saved. Instant for the same reason
     `go` is: nothing moved, so nothing should appear to. */
  paintPager(AT, true);
};

function buildTabs() {
  /* Wrapped, so the BAR can go edge to edge while the row of tabs stays the width of the
     content — a bar that stops short of the screen looks like it failed to load, and tabs spread
     across a desktop look like a website. */
  $('tabs').innerHTML = '<div class="tabs-inner">' + TABS.map(t =>
    `<button class="tab${t.big ? ' big' : ''}" data-tab="${t.id}">
       <span class="ic">${t.icon}</span><span class="lb">${esc(t.label)}</span>
     </button>`).join('') + '</div>';
}

/* ================================================================================================
   ONE GRID. TWO AXES. THE SAME BEHAVIOUR ON BOTH.

   Tabs sit along X and a tab's widgets sit along Y, and until now those were two different pieces
   of machinery that happened to be operated by the same thumb: different rules about when a drag
   counts, different distances to travel, different-looking movement, and two separate ways of
   committing at the end. Learning one taught you nothing about the other.

   They are one thing here. A CELL is a screen or a page — the difference is only which axis it
   lies on — and everything below is written once and applied to both:

     · the same rule for when a gesture belongs to the grid rather than to what is under the finger
     · the same throw distance, as a fraction of the axis being travelled
     · the same resistance at the ends
     · the same depth and fade while turning, so a neighbour arriving looks the same either way
     · the same commit, so a tap on a tab and a swipe to it are the same movement

   Adding a third axis later would be a third entry in AXES and nothing else.
================================================================================================ */
const AXES = {
  /* X — the tabs. */
  x: {
    prop: '--dx',                                   // the drag offset, in the cell's transform
    span: () => innerWidth,
    /* The same signature as the other axis, `id` ignored — there is only one row of tabs. Written
       the same way so nothing calling an axis has to know which one it has. */
    at:    () => Math.max(0, TABS.findIndex(t => t.id === AT)),
    count: () => TABS.length,
    /* IN TAB ORDER, not in the order the sections happen to appear in index.html.
       This returned `querySelectorAll`, which is document order — and the markup lists the screens
       in a different order from the tab bar. So a screen was placed at the position of whichever
       section happened to sit at that index in the file: switching to Stuff put Library at the
       front and Stuff two screens off, which is a blank screen with a sliver of something else.
       Only Posts and You lined up by luck, which is precisely the two that ever worked.
       The tab bar is the order. Nothing should have to know how the markup is arranged. */
    cells: () => TABS.map(t => $('s-' + t.id)).filter(Boolean),
    go:    (n, instant) => go(TABS[n].id, true, instant),
  },
  /* Y — the widgets on a paged screen. Absent on a screen that is not paged, which is what makes
     a vertical drag there fall through to ordinary scrolling. */
  y: {
    prop: '--dy',
    span: () => innerHeight,
    /* EVERY ONE OF THESE TAKES AN `id`, defaulting to the screen in front. They used to read `AT`
       and nothing else, so the pages of a screen you were about to swipe onto could not be placed
       until you were already on it — and a page that has not been placed sits at its resting
       position, which is off the side at zero opacity. A blank screen with a sliver of its
       neighbour showing. */
    at:    id => PAGE[id || AT] || 0,
    count: id => PAGER[id || AT] ? pageCount(id || AT) : 0,
    cells: id => $('s-' + (id || AT))?.querySelectorAll(':scope > .page') || [],
    go:    (n, instant) => goPage(AT, n, instant),
  },
};

/**
 * PLACE EVERY CELL ON AN AXIS.
 *
 * Two numbers each, exactly as the dial already used:
 *   --ox / --oy   how far from the front, signed
 *   --a           the same, unsigned, because scale and fade want distance rather than direction
 *
 * `instant` is the difference between arriving and travelling: coming back to a tab has to put you
 * where you left off rather than fly you there, and a boot has to draw rather than animate.
 */
function placeCells(which, instant, dragPx, id) {
  const ax = AXES[which];
  const cells = ax.cells(id);
  if (!cells.length) return;
  const n = ax.at(id);
  cells.forEach((el, i) => showCell_(el, i === n, which, i === n ? (dragPx || 0) : 0));

  /* ANY SCREEN NO TAB POINTS AT. index.html lists eight sections and the tab table decides which
     of them exist — so removing a tab leaves a section behind that nothing ever places, keeping
     whatever the markup last gave it. `s-find` became one of those the moment Find and Stuff
     merged, and it would have sat on top of Posts.
     Hidden here rather than by deleting it from index.html, because that is the one file whose URL
     cannot be dated and so the one that has to be pasted by hand. The grid owning everything in
     its viewport is also just true: a cell it does not place is a cell it should not show. */
  if (which === 'x') {
    const mine = ax.cells();
    document.querySelectorAll('#screen > .screen').forEach(el => {
      if ([].indexOf.call(mine, el) === -1) showCell_(el, false, 'x', 0);
    });
  }
}

/**
 * ONE CELL IS SHOWN. THE REST ARE NOT IN THE LAYOUT AT ALL.
 *
 * This used to place eight screens side by side, each absolutely positioned, transformed by its
 * distance from the front, culled past a threshold, hidden by two properties at once, ordered by
 * z-index, and repainted as a neighbour so a drag would reveal it. Every one of those was a way of
 * saying "you are looking at this one" — and between them they went wrong six different times, in
 * six ways that all looked the same on a screen: black.
 *
 * `display: none` cannot go wrong. There is no position to be relative to, no transform to be
 * invalidated by a missing variable, no stacking order, no clip, and nothing to be off the side of.
 * The screen you are on is in the document and the other seven are not.
 *
 * WHAT THAT COSTS: a drag no longer reveals the next screen underneath. It slides the one you are
 * on and the next one arrives when you let go. That is a real loss and it is worth it — the
 * preview was the reason for all of the above, and it was never once seen working.
 */
function showCell_(el, front, which, dragPx) {
  if (!front) {
    /* Out of the layout entirely. One declaration, and there is no state it can be in where it is
       half-there. */
    el.style.display = 'none';
    el.classList.remove('on');
    /* And put the class back, so a screen is hidden by the markup's own means as well as by the
       inline style — the same belt-and-braces as the front cell, in the other direction. */
    el.classList.add('hidden');
    return;
  }

  /* THE FRONT CELL IS DESCRIBED IN FULL, and every one of these is an OVERRIDE rather than an
     absence.
     That distinction is what broke it: the previous version REMOVED inline properties, on the
     assumption that what was left underneath was nothing. What was left underneath was the
     stylesheet — which still said `position: absolute`, `transform: translateX(100%)` and
     `visibility: hidden`, because those are what the old layout needed. Removing an inline value
     does not remove the rule beneath it; it reveals it. Every screen went off the side and
     invisible, and nothing in the code said so.

     Written out, the screen you are on looks the same whatever style.css says — the current one,
     one from last week, or none at all. That is worth six lines: this file and the stylesheet
     travel separately, and they have been out of step more often than they have been in it. */
  /* THE ONE CLASS THAT BEATS AN INLINE STYLE.
     index.html marks seven of the eight sections `class="screen hidden"` so the page is not a wall
     of every screen before script.js runs — and `.hidden` is `display: none !important`, which
     outranks anything written on the element. So a screen could be described perfectly, in full,
     inline, and still not appear: the markup had said no first and said it louder.
     Taken off here, where the decision about what you are looking at is actually made. */
  el.classList.remove('hidden');

  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  /* IT FILLS ITS CONTAINER. This said `position: static; inset: auto` — chosen when the layout was
     being made independent of the stylesheet, and the wrong value to choose: a static block is as
     tall as its CONTENTS, so a cell stopped where its content stopped and everything below was the
     screen behind it showing through.
     Nothing looked wrong. Every computed style read correctly and the page simply had no spare
     height, so anything asking to be centred in it had nothing to be centred in — which is why a
     post stayed at the top through two attempts to centre it, neither of which was addressing the
     actual cause.
     Absolute and inset to zero, written out here rather than trusted to the stylesheet, which was
     the point of doing it inline in the first place. */
  el.style.position = 'absolute';
  el.style.top = '0'; el.style.right = '0'; el.style.bottom = '0'; el.style.left = '0';
  el.style.visibility = 'visible';
  el.style.opacity = '1';
  el.style.pointerEvents = 'auto';
  el.classList.add('on');
  el.classList.remove('far');

  /* Following a finger, or at rest. `none` rather than empty: empty would let the stylesheet's
     own transform back in. */
  const px = dragPx || 0;
  el.style.transform = px
    ? (which === 'x' ? 'translateX(' + px + 'px)' : 'translateY(' + px + 'px)')
    : 'none';
}

/* ---------- WIDGETS AS PAGES --------------------------------------------------------------------
   Tools and Arcade hold four things each, and a column of four cards means the fourth is a
   scroll away from being remembered. One at a time, full height, swipe up for the next — the
   same gesture as the tab bar turned ninety degrees, so there is one thing to learn rather than
   two.

   THE HARD PART IS THE SAME ONE AS THE TAB SWIPE: not breaking scrolling. "Swipe up" and "scroll
   down" are the same movement of the same thumb, and a page that guesses wrong takes away the
   thing people do a thousand times more often. So the rule is a hierarchy rather than a choice:

     the page scrolls if it has anywhere to scroll to
     only at its top or its bottom does the gesture belong to the pager

   Which means a short widget — the calculator, the timer, the board — pages immediately, and a
   long one — a docket with twenty lines, a notepad full of text — reads to the end first. Nobody
   has to know the rule; it is what already happens in every reader anybody has used.

   The names are here rather than in the markup so the header can say which widget you are on
   without the screen having to tell it.
--------------------------------------------------------------------------------------------- */
const PAGER = {
  /* POSTS ARE HOWEVER MANY THERE ARE, so this is a function rather than a list. Everything else
     about them is the same: one to a screen, swipe up for the next.
     They have no names to put in the header, so the position goes there instead. That is the
     thing the dots used to say and the only part of it worth keeping — on a feed, "4 of 12" is
     genuinely useful, where on five named tools it was saying nothing the title did not. */
  /* EVERY SCREEN IS PAGED. Nothing scrolls anywhere: a screen is a screen, and getting from one
     thing to the next is the same movement on both axes on all eight tabs. There is no longer such
     a thing as a screen you have to learn separately.
     The name shown in the header, or an empty string to leave the tab's own title alone — a
     single-page screen has no "1 of 1" worth saying.
     Each count comes from the same function that renders the pages, so the header and the screen
     cannot disagree about how many there are. */
  me:      () => mePages().map((_, i, a) => a.length > 1 ? (i + 1) + ' of ' + a.length : ''),
  book:    () => bookPages().map((_, i, a) => a.length > 1 ? (i + 1) + ' of ' + a.length : ''),

  /* Empty names, one per post. The pager needs the COUNT — that is what it pages through — and
     a post has no name worth putting in a header: "1 of 10" is a fact about the list rather than
     about the photograph, and it changed on every swipe where a title should hold still.
     Empty falls through to the tab's own title, so no special case is needed anywhere. */
  posts:  () => feedPosts().map(() => ''),
  /* The controls, then the results. Named so the header says which page of how many — on a list
     you are working through, that is the one thing a title cannot tell you and the number is
     worth having. */
  stuff:  () => {
    const n = stuffPageCount();
    return ['Search'].concat(Array.from({ length: n }, (_, i) => (i + 1) + ' of ' + n));
  },
};

/** The page names for a screen, whether they are a list or worked out each time. */
function pagerNames(id) {
  const v = PAGER[id];
  return typeof v === 'function' ? v() : (v || []);
}

/* Which page each paged screen is showing. Kept per screen, so leaving Tools on the calendar and
   coming back puts you on the calendar — a pager that resets is a pager you have to re-navigate
   every time you check something on another tab. */
const PAGE = { posts: 0, stuff: 0, me: 0, book: 0 };

const pageCount = id => pagerNames(id).length;

/**
 * THE DIAL.
 *
 * Every widget sits on the same spindle and only the one at the front is full size. Its
 * neighbours are still there — smaller, dimmer, a little way off — so the shape of the whole
 * screen is visible while you are using one part of it. A full-page slide showed one thing and
 * gave no sense that there was anything else, which is why the dots had to exist to say so.
 *
 * Each page is told two numbers and CSS does the rest:
 *   --o  how far from the front, SIGNED: -1 is the one above, +1 the one below
 *   --a  the same, unsigned, because CSS has no dependable abs() and scale and fade both want it
 *
 * `instant` is the difference between arriving and travelling. Coming back to a tab has to put
 * you where you left off — not fly you there from the top, which is what it did, and which reads
 * as the app losing your place and then correcting itself.
 */
function paintPager(id, instant) {
  if (!PAGER[id]) return;
  const host = $('s-' + id);
  if (!host || !host.querySelector(':scope > .page')) return;
  const n = Math.max(0, Math.min(pageCount(id) - 1, PAGE[id] || 0));
  PAGE[id] = n;

  /* THE SAME PLACER THE TABS USE. There were two of these — one setting `--o` on a page and one
     that did not exist at all for screens — which is precisely why the two axes drifted apart. */
  placeCells('y', instant, 0, id);

  /* THE HEADER SAYS WHICH WIDGET. It is now the only thing that does, which is why it matters:
     on a screen where every page is a different tool, the name at the top is worth more than a
     row of marks that could only ever say "third of five". */
  const tab = TABS.find(t => t.id === id);
  /* A page with a name puts it in the header; one without leaves the tab's own title alone. */
  if (id === AT && tab) $('top-title').textContent = pagerNames(id)[n] || tab.title;
}

function goPage(id, to, instant) {
  if (!PAGER[id]) return;
  const n = Math.max(0, Math.min(pageCount(id) - 1, to));
  const was = PAGE[id] || 0;
  if (n === was && !instant) return;
  PAGE[id] = n;
  /* The page being turned to may be empty. Filled BEFORE the transform moves, so it arrives with
     its contents rather than filling in underneath somebody. */
  if (id === 'stuff') fillStuffPages();
  if (id === AT) {
    placeCells('y', instant);
    if (!instant) arrive(AXES.y.cells(id)[n], was > n ? 'from-above' : 'from-below');
  }
  paintPager(id);
}

/** Wrap a screen's cards into a vertical strip of pages.

    NO DOTS. There was a column of them down the right edge saying how many widgets there were and
    which one you were on — and once each page fills the screen, the header already names the
    widget, so the dots were saying the same thing twice in a less readable way. The count they
    also carried is not worth a permanent mark on every screen: you find out by turning the dial,
    which takes one movement. */
const pages = (id, cards) =>
  cards.map(c => `<section class="page">${c}</section>`).join('');

/**
 * BLOCKS INTO PAGES.
 *
 * A screen says what it is made of — cards, tiles, sections — and this cuts the list into screens.
 * Every paged screen was working out its own chunking, which is the same three lines copied four
 * times and four chances for one of them to be off by one.
 *
 * The pager asks THIS for the number of pages and the screen asks it for the markup, so what is
 * rendered and what the header says can never disagree. That is the whole reason it is a function
 * rather than a number written down in two places.
 */
function chunk(blocks, per, wrap) {
  const out = [];
  for (let i = 0; i < blocks.length; i += per) {
    const part = blocks.slice(i, i + per).join('');
    out.push(wrap ? wrap(part) : part);
  }
  /* Never zero pages. A screen with nothing on it is still a screen, and a pager with no pages is
     a blank rectangle with no way to tell it from a fault. */
  return out.length ? out : [''];
}

/* How many of each thing a phone holds without cutting the last one in half. Different per screen
   because a tile is not a card and a card is not a post — one number for all of them would be
   wrong four times out of five. */
const PER_PAGE = { library: 12, me: 4, book: 5 };

/* The dot's handler is registered further down, WITH the other actions. `on()` writes into
   `ACTIONS`, which is a `const` declared after this point — and a const read before its own line
   throws rather than coming back undefined. The same trap the comment beside `wake` describes,
   and the reason that one is a hoisted function declaration. */

/* ---------- THE SHEET ---------------------------------------------------------------------------
   One element, reused. Anything needing the whole screen opens here rather than in a card that
   pushes the page around — and it keeps the thing underneath, so somebody filling in a booking has
   not left the list they found it in.
--------------------------------------------------------------------------------------------- */
let sheetOnClose = null;

function openSheet(title, html, onClose) {
  $('sheet-title').textContent = title;
  $('sheet-body').innerHTML = html;
  $('sheet').classList.remove('hidden');
  $('sheet-back').classList.remove('hidden');
  sheetOnClose = onClose || null;
  /* The page behind must not scroll while a sheet is open — two scrolling things at once is the
     thing that makes a phone feel broken. */
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  $('sheet').classList.add('hidden');
  $('sheet-back').classList.add('hidden');
  $('sheet-body').innerHTML = '';
  document.body.style.overflow = '';
  const f = sheetOnClose; sheetOnClose = null;
  if (f) f();
}

/* ---------- ONE WAY TO POST ----------------------------------------------------------------------
   Twenty-odd places call the backend, each with its own `.then(r => r.json())` and its own idea of
   what counts as a failure. That is twenty chances to miss something the server said — and the
   server has just started saying something new: a request that wrote to a column that does not
   exist comes back with `unwritten`, because a save that saved nothing must not report success.

   Handled here, once, so no caller has to know. Anything that reaches the `.then` of `send()` has
   genuinely worked; anything else lands in the `.catch` with a sentence worth showing.
--------------------------------------------------------------------------------------------- */
/**
 * ONE REQUEST, BUILT IN ONE PLACE.
 *
 * Called `api` rather than `post`, because `post` is a NOUN in this app before it is a verb — a
 * photograph with a caption — and three handlers already hold one in a local variable of exactly
 * that name. A shadowed function is a "post is not a function" thrown from a line that looks
 * correct, which is what happened the moment this was introduced.
 *
 * Every call to the backend carried its own copy of the method, the cache policy and the JSON
 * encoding — twenty-one copies of four lines, which is twenty-one places to edit the day any of
 * them has to carry a header, a timeout, a retry, or a queue for when the phone is offline. None
 * of that exists yet; all of it becomes one edit from here rather than twenty-one.
 *
 * IT DOES NOT THROW ON A REFUSAL. That was the tempting version, and it would have meant rewriting
 * every caller's reply handling by hand — most of them already read `d.error` and say something
 * specific about it, which is better than a generic catch. The reply comes back as it came.
 */
function api(body) {
  return fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify(body) })
    .then(r => r.json())
    .then(d => {
      /* A value the sheet had nowhere to put. The server turns this into an error where it can, so
         reaching here means it could not — a read that wrote, or a reply with no `success` to take
         away. Rare, and worth a word rather than nothing. */
      if (d && d.unwritten && d.unwritten.length) {
        banner('Some values were not saved: '
          + d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
          + ' — those columns are not in the sheet.');
      }
      return d || {};
    });
}

/** The same request, refusing to resolve on a refusal — for callers that would rather catch. */
function send(body) {
  return api(body).then(d => {
    if (d && d.error) throw new Error(d.error);
    return d;
  });
}

/* ---------- SAYING SOMETHING BRIEFLY ------------------------------------------------------------ */
let toastTimer = null;
function toast(msg) {
  let el = $('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2600);
}

/* ---------- ONE CLICK HANDLER -------------------------------------------------------------------
   Delegated from the document, so markup can be replaced without rewiring anything. A screen emits
   `data-do="something"` and handles it here; nothing ever attaches its own listener to a card that
   is about to be thrown away.
--------------------------------------------------------------------------------------------- */
const ACTIONS = {};
/** Register what a `data-do` means. */
function on(name, fn) { ACTIONS[name] = fn; }

/* Asking again. A failure that offers no way to retry costs a whole page reload, and on a phone a
   reload is the thing most likely to lose whatever was half-typed on another screen. */
on('retry', () => { LOADED = false; LOAD_FAILED = ''; banner(''); repaint(); load(); });

document.addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (tab) { go(tab.dataset.tab); return; }

  if (e.target.closest('#sheet-close') || e.target.id === 'sheet-back') { closeSheet(); return; }

  const doer = e.target.closest('[data-do]');
  /* A SELECT AND A CHECKBOX SPEAK THROUGH `change`, NOT `click`.
     A click on a select is the dropdown OPENING — its value is still the old one — so running the
     handler here fired every action with a stale answer and then redrew the markup out from under
     the list the person had just opened. Three finding controls did nothing at all, silently,
     which is the same failure as every entry on the list in the notes.
     They are refused here and picked up by the `change` listener further down. */
  if (doer && (doer.tagName === 'SELECT' || doer.type === 'checkbox')) return;
  if (doer && ACTIONS[doer.dataset.do]) {
    /* CAUGHT HERE, WHERE THE MESSAGE STILL EXISTS.
       Almost everything this app does runs from this one line, and an error escaping it reaches
       the window — where a browser serving from file:// reports it as "Script error." with no
       message, no file and no line, because it treats every local script as cross-origin. A real
       fault becomes two words that could mean anything.
       Caught, it keeps its message and names the action that produced it, which is the difference
       between "Script error." and "react — Cannot read properties of null". */
    try {
      ACTIONS[doer.dataset.do](doer, e);
    } catch (err) {
      console.error('[' + doer.dataset.do + ']', err);
      toast(doer.dataset.do + ' — ' + String((err && err.message) || err));
    }
  }
});

/* Swiping between tabs is further down, with the gesture handling it belongs to — I wrote a
   second, cruder version here before noticing the first. The one that survives follows the finger
   and resists at the ends; this one only decided after the fact. */

/* Escape closes the sheet, for anybody on a keyboard. Costs one line and is the first thing
   somebody tries. */
addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('sheet').classList.contains('hidden')) closeSheet();
});

/* ---------- LOADING ------------------------------------------------------------------------------ */
async function load() {
  try {
    /* The person's id goes with the request so the server can say which posts YOU liked — it
       cannot know otherwise, and sending every like to every phone to answer it would be absurd. */
    const who = USER && USER.personId ? '?person=' + encodeURIComponent(USER.personId) : '';
    /* NO CACHE, AND A DIFFERENT URL EVERY TIME. Both, because either alone can be got round.
       This is a plain GET, which a browser is entitled to hold — so an edit to the spreadsheet
       could be live, the deploy correct, the site current, and the phone still showing what it
       fetched ten minutes ago. That is indistinguishable from the change not having saved, and it
       is the third time on this project that a stale copy has been mistaken for a broken feature.
       `no-store` tells the browser not to keep it; `_` makes the URL one it has never seen, which
       is what covers the proxies and the service workers that ignore the header. */
    const bust = (who ? '&' : '?') + '_=' + Date.now();
    const res = await fetch(API + who + bust, { cache: 'no-store' });
    const d = await res.json();
    if (d && !d.error) {
      DATA = d;
      LOAD_FAILED = '';
      /* WHAT THE BACKEND CAN DO, against what this site needs. `features` has been in the payload
         since before the rewrite and nothing has ever read it — which is why a stale deploy shows
         up as "That action is not recognised", a sentence written for somebody who did something
         wrong rather than for a deployment that is out of date. */
      /* A payload that could not write something — the schema check ran and a column is still
         missing. Said on load rather than waiting for somebody to try to save into it. */
      if (d.unwritten && d.unwritten.length) {
        banner('The sheet is missing columns: '
          + d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
          + '. Anything saved to them is discarded.');
      }
      /* NO BANNER FOR A VERSION MISMATCH ANY MORE.
         It was built when a cached stylesheet was a real and invisible problem — twice a rule had
         been changed and the browser was serving an old copy, and there was no way to tell that
         from a rule that was simply wrong.
         index.html fixed that at the source: both files are requested with `?t=` and the current
         millisecond, so neither can be cached at all. What is left is a mismatch that means "the
         other file has not been pasted yet", which is true, harmless, and self-correcting — and an
         orange bar across the top of every screen is a heavy way to say it.
         Both versions are still on the You screen, which is where you look when you want to know. */
      const NEEDS = ['editPost', 'deletePost', 'editResource', 'deleteResource'];
      const missing = NEEDS.filter(f => (d.features || []).indexOf(f) === -1);
      if (missing.length) {
        /* THE VERSION IT ACTUALLY REACHED, said out loud. "The backend is older" was true and
           useless: it did not say WHICH backend, and the answer turned out to be a second
           deployment nobody knew was there. A version string in the message is the difference
           between redeploying again and going to look at the URL. */
        banner('The backend at this URL is ' + (d.version || 'an unknown version')
             + ', which cannot ' + missing.join(', ') + '. Either that deployment is old, or '
             + 'this site is pointed at the wrong one — check the id in API against the '
             + 'Deployment ID in Manage deployments.');
      }
    }
    else {
      LOAD_FAILED = String(d.error || 'the server refused the request');
      banner('The server said: ' + (d.error || 'something went wrong'));
    }
  } catch (err) {
    LOAD_FAILED = String((err && err.message) || err || 'could not reach the backend');
    /* WHICH URL IT TRIED, as something you can press.
       "Could not reach the server" is true of four different faults and useful for none of them:
       a wrong deployment id, a deployment whose access is still "Only myself", a browser with no
       connection, and a script that threw while parsing the reply all produce it. The URL is the
       one piece of evidence that separates them, and opening it in a tab answers the question in
       ten seconds — JSON means the address is right, a Google sign-in page means the deployment
       is private, a 404 means the id is wrong. */
    const el = $('banner');
    if (el) {
      el.classList.remove('hidden');
      /* THE ADVICE MATCHES THE FAULT. It used to print all of it every time — including "Failed
         to fetch means the reply never arrived" underneath an error that plainly was a reply. Two
         paragraphs of which one applied, and no way to tell which, is worse than one sentence. */
      const msg = String((err && err.message) || err || '');
      const why = /Unexpected token|not valid JSON/.test(msg)
        /* A reply arrived and it was a web page. Apps Script serves its own errors as HTML, and
           since the scopes were written into the manifest the commonest one by far is a consent
           that has not been given — a manifest change invalidates the authorisation, and only a
           run from the EDITOR can raise the prompt again. */
        ? 'The backend answered with a web page instead of data. Open it in a tab and read what '
          + 'it says — “Authorization is required” means the scopes changed and nobody has '
          + 'consented yet: run any function from the Apps Script editor once, accept the prompt, '
          + 'then deploy a new version.'
        : /Failed to fetch|NetworkError|Load failed/.test(msg)
        /* Nothing arrived at all — so it is the address or the access, not the code. */
        ? 'The reply never arrived, so this URL is not being served. Check Manage deployments: the '
          + 'one under ACTIVE is the only one that answers, an archived id looks exactly like '
          + 'this, and “Only myself” access does too.'
        : 'Something else went wrong on the way.';

      el.innerHTML = 'Could not reach the backend.<br>'
        + '<span class="faint">' + esc(why) + '</span><br>'
        + '<a class="link" href="' + esc(API) + '" target="_blank" rel="noopener">Open it in a '
        + 'tab</a> — the page itself will say which it is.<br>'
        + '<span class="faint">' + esc(msg)
        + ' · site ' + esc(SITE_VERSION) + ' · css ' + esc(cssVersion()) + '</span>';
    }
  }
  /* Set whether it SUCCEEDED or failed — a failed load is still a finished one, and leaving the
     skeleton up for ever would be the app pretending it is still trying. */
  LOADED = true;
  repaint();
  openSharedPost();     // if the app was opened on a shared link, go to that post
}

function banner(msg) {
  const el = $('banner');
  if (!msg) { el.classList.add('hidden'); return; }
  el.textContent = msg;
  el.classList.remove('hidden');
}

/* ---------- NOTHING MAY BE HELD ------------------------------------------------------------------
   A service worker outlives everything. It is installed once, it survives a reload, it survives
   clearing history on some browsers, and while it is there it can serve a copy of this file from
   months ago no matter what the server sends — which looks exactly like an edit not saving.

   This project has never deliberately registered one. That is not the same as there not being
   one: an experiment, a template, a tool that adds one for offline support, and it is there for
   good. So any worker is removed and every cache it made is emptied, on every load. It costs
   nothing when there is none, which is almost always.

   Run before the first fetch, so a worker cannot intercept the payload on the way past.
--------------------------------------------------------------------------------------------- */
(function purge() {
  try {
    navigator.serviceWorker?.getRegistrations?.().then(rs => {
      if (rs && rs.length) {
        rs.forEach(r => r.unregister());
        /* One reload, and only if there WAS one — otherwise this is a page that refreshes itself
           for ever, which is a worse fault than the one it is fixing. */
        caches?.keys?.().then(ks => Promise.all((ks || []).map(k => caches.delete(k))))
          .finally(() => location.reload());
      } else {
        caches?.keys?.().then(ks => (ks || []).forEach(k => caches.delete(k)));
      }
    }).catch(() => {});
  } catch {}
})();

/* The app STARTS at the very bottom of this file, not here.

   It used to start here, and here is above every `screen(...)` registration — so `go()` ran with
   an empty SCREENS table and `paint()` fell through to its own "Nothing here yet", on every tab,
   until the first fetch came back and repainted. The skeleton was never reached once, on any
   device: the thing it was covering had already been replaced by a sentence saying there was
   nothing to cover.

   Nothing marks the boundary in a file that is read top to bottom, which is exactly why the
   start belongs at the end — where everything it needs is behind it by construction rather than
   by somebody remembering. */

/* ================================================================================================
   THE FIRST SCREEN — Who.

   Tutors and venues, which is the simplest real screen: two lists of things the backend already
   sends. It is here to prove the shell rather than to be finished, and to be the shape every
   other screen copies:

     · a screen is ONE function returning markup
     · it never touches the tab bar, the header or another screen
     · anything needing the whole display opens a sheet
     · anything pressable carries `data-do`, so the markup can be thrown away and redrawn
================================================================================================ */

/* ---------- WHAT A PERSON, A PLACE AND A SUBJECT LOOK LIKE ---------------------------------------
   The Find SCREEN is gone — it and Stuff were two tabs asking the same question, and the funnel
   can hold both lists now that it skips whatever a kind cannot answer. What survives is the three
   card shapes, because a tutor still has to look like a tutor.

   `findItems`, `findPageHtml`, `findBrowse`, `findPageCount` and the `find-kind` handler went with
   the screen. Every one of them was a smaller, worse copy of something the funnel already does:
   a browse page with three counts, a pager, and a filter that could only ever ask one question.
--------------------------------------------------------------------------------------------- */
/** One card. The three shapes, each carrying the class that colours its name. */
function findCard(x) {
  const t = x.row;
  if (x.kind === 'tutor') return `
    <div class="card tap is-tutor${t.listed === false ? ' is-off' : ''}"
         data-do="who" data-kind="tutor" data-name="${esc(t.title)}">
      <h3>${esc(t.title)}${t.listed === false
        ? ' <span class="faint">— not listed</span>' : ''}</h3>
      ${t.subtitle ? `<p class="sub">${mark(t.subtitle)}</p>` : ''}
      ${t.rate ? `<div class="row"><span class="k">From</span>
                    <span class="v mono">${money(t.rate)}/h</span></div>` : ''}
      ${(t.tags || []).length
        ? `<p class="faint">${mark((t.tags || []).slice(0, 4).join(' · '))}</p>` : ''}
    </div>`;

  if (x.kind === 'venue') return `
    <div class="card tap is-venue" data-do="who" data-kind="venue" data-name="${esc(t.title)}">
      <h3>${esc(t.title)}</h3>
      ${t.subtitle ? `<p class="sub">${mark(t.subtitle)}</p>` : ''}
      ${t.bestRate
        ? `<div class="row"><span class="k">Room hire</span>
             <span class="v mono">${money(t.bestRate)}/h</span></div>`
        : '<p class="faint">No charge</p>'}
    </div>`;

  return `
    <div class="card tap is-subject" data-do="subject" data-name="${esc(t.name)}">
      <h3>${esc(t.name)}</h3>
      <div class="row">
        <span class="k">${t.mult === 1 ? 'No surcharge' : 'Surcharge'}</span>
        <span class="v mono">${t.mult === 1 ? '—'
          : (t.mult > 1 ? '+' : '−') + Math.abs(Math.round((t.mult - 1) * 100)) + '%'}</span>
      </div>
      ${t.tutors && t.tutors.length
        ? `<p class="faint" style="margin:.3rem 0 0">${esc(t.tutors.map(y => y.title).join(', '))}</p>`
        : '<p class="faint" style="margin:.3rem 0 0">Nobody teaches this yet</p>'}
    </div>`;
}

/* Tapping one opens a sheet rather than expanding the card. An expanding card pushes everything
   below it down, which on a phone means the thing you were looking at moves the moment you touch
   it — a sheet leaves the list exactly where it was. */
on('who', (el) => {
  const name = el.dataset.name;
  const list = el.dataset.kind === 'tutor' ? (DATA.tutors || []) : (DATA.venues || []);
  const it = list.find(x => norm(x.title) === norm(name));
  if (!it) return;

  const rows = [
    ['Where', it.city || it.borough],
    ['Rate', it.rate ? money(it.rate) + '/h' : (it.bestRate ? money(it.bestRate) + '/h' : '')],
    ['Teaches', (it.tags || []).join(', ')],
  ].filter(([, v]) => v);

  openSheet(name, `
    ${it.image ? `<img src="${esc(it.image)}" alt="" style="width:100%;border-radius:var(--r);margin-bottom:12px">` : ''}
    ${it.subtitle ? `<p class="note" style="margin-top:0">${mark(it.subtitle)}</p>` : ''}
    ${rows.map(([k, v]) =>
      `<div class="row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('')}
    <div class="btn-row" style="margin-top:1rem">
      <button class="btn" data-do="book-with" data-name="${esc(name)}">Book with them</button>
    </div>
    ${el.dataset.kind === 'tutor' && isAdmin()
      ? `<label class="check" style="margin-top:.6rem">
           <input type="checkbox" data-do="set-listed" data-who="${esc(name)}"
                  ${it.listed === false ? '' : 'checked'}>
           <span class="box"></span>
           <span>Listed on the site<br><span class="faint">Clients only see tutors that are
             ticked.</span></span>
         </label>`
      : ''}`);
});

/* The switch. Admin only — a tutor who could list themselves could put themselves in front of
   clients before you had agreed to it. */
on('set-listed', el => {
  const on = el.checked;
  api({ action: 'setListed',
    adminName: USER.name, name: USER.name, who: el.dataset.who, on })
    .then(d => {
      if (d && d.error) { el.checked = !on; toast(d.error); return; }
      toast(on ? 'Listed' : 'Hidden from clients');
      load();
    })
    .catch(() => { el.checked = !on; toast('Could not reach the server.'); });
});

/* THE OTHER HALF OF THE CLICK HANDLER.
   A checkbox is not clicked in the way a button is — the change event is what tells you it
   actually flipped, and reading .checked in a click handler can catch it mid-flight. A select is
   the same problem said louder: its value only means anything after `change`.
   So both come through here, and the click handler above refuses them. */
document.addEventListener('change', e => {
  const el = e.target.closest('[data-do]');
  if (!el || !ACTIONS[el.dataset.do]) return;
  if (el.tagName !== 'SELECT' && el.type !== 'checkbox') return;
  /* The same reason as the click handler: an error that gets out of here loses its message. */
  try {
    ACTIONS[el.dataset.do](el, e);
  } catch (err) {
    console.error('[' + el.dataset.do + ']', err);
    toast(el.dataset.do + ' — ' + String((err && err.message) || err));
  }
});

/* Tapping a SUBJECT. It has emitted `data-do="subject"` since the screen was written and no
   handler was ever registered, so the third of the three lists on this tab was the one that did
   nothing when you pressed it. */
on('subject', el => {
  const x = subjectRows().find(s2 => norm(s2.name) === norm(el.dataset.name));
  if (!x) return;
  openSheet(x.name, `
    <div class="row"><span class="k">${x.mult === 1 ? 'No surcharge' : 'Surcharge'}</span>
      <span class="v mono">${x.mult === 1 ? '—'
        : (x.mult > 1 ? '+' : '−') + Math.abs(Math.round((x.mult - 1) * 100)) + '%'}</span></div>
    ${x.levels && x.levels.filter(Boolean).length
      ? `<div class="row"><span class="k">Levels</span>
           <span class="v">${esc(x.levels.filter(Boolean).join(', '))}</span></div>` : ''}
    <h2>Who teaches it</h2>
    ${x.tutors && x.tutors.length
      ? x.tutors.map(t => `<div class="card tap is-tutor" data-do="who" data-kind="tutor"
           data-name="${esc(t.title)}"><h3>${esc(t.title)}</h3>
           ${t.rate ? `<p class="sub">${money(t.rate)}/h</p>` : ''}</div>`).join('')
      : '<p class="note">Nobody yet.</p>'}
    <div class="btn-row" style="margin-top:1rem">
      <button class="btn" data-do="book-with" data-name="">Book this</button>
    </div>`);
});

on('book-with', (el) => {
  closeSheet();
  go('book');
  toast('Booking screen — not built yet');
});


/* ================================================================================================
   THE SCREENS.

   One function each, returning markup. None of them touches the tab bar, hides another screen, or
   has an opinion about the sheet — that is the shell's job, and keeping it that way is why adding
   the eighth screen will be as easy as the second.

   Everything pressable carries `data-do`, so markup can be thrown away and redrawn without
   anything needing to be rewired.
================================================================================================ */

/* ---------- YOU --------------------------------------------------------------------------------
   Everything about the person using the app, and nothing about the app. Signed out it is one
   button; signed in it is who you are, what you have, and the ways out.
--------------------------------------------------------------------------------------------- */
/* One card ends where the next begins — the one place they are unambiguously separated, and the
   reason these screens are written as one template and split rather than assembled from a list:
   the template is how they read. */
const split_ = html => String(html).split(/(?=<div class="card|<h2)/).map(x => x.trim()).filter(Boolean);

/** Every card on the You screen, in order. */
function meBlocks() {
  if (!USER) {
    return split_(`<div class="card">
        <h3>Sign in</h3>
        <p class="sub">You need an account to book, to keep a checklist, or to spend credits.</p>
        <label class="field"><span>your name</span>
          <input id="in-name" autocomplete="username" placeholder="e.g. Halex Dias"></label>
        <label class="field"><span>PIN</span>
          <input id="in-pin" type="password" inputmode="numeric" autocomplete="current-password"></label>
        <button class="btn" data-do="do-signin">Sign in</button>
        <p class="faint" id="in-said" style="margin:.6rem 0 0"></p>
      </div>
      <div class="card tap" data-do="register">
        <h3>No account yet?</h3>
        <p class="sub">Making one takes a name, an email and a PIN.</p>
      </div>`);
  }

  const ticks = typeof tickCount === 'function' ? tickCount() : 0;
  const rows = [
    ['Name', USER.name],
    ['Role', roleOf(USER.role || '')],
    ['Credits', String(USER.credits || 0)],
    ['Ticks', String(ticks)],
    ['Email', USER.email],
    ['Where', USER.city || USER.borough],
  ].filter(([, v]) => v);

  /* THE PHOTOGRAPH, not the figure. `USER.avatar` is the WEARABLE string — "hair:crop|legs:jeans"
     — and putting that in a src gives a broken image every time. The picture is `photo`, it is a
     Drive link, and it goes through `pic()` like every other one.
     It was also never sent: verifyLogin's reply carried neither field, so this has been falling
     back to a letter for everybody since the rewrite. */
  /* A PHOTOGRAPH IF THERE IS ONE, otherwise the figure. The letter in a circle is the last
     resort now rather than the second — it says nothing about anybody, and every account has a
     figure whether or not anybody has chosen one, because the starting look is seeded from the
     handle. */
  const face = pic(USER.photo || (USER.profile || {}).photo || '');
  return split_(`<div class="card">
      <div class="thing">
        ${face
          ? `<img class="thing-pic" src="${esc(face)}" alt="">`
          : `<span class="thing-pic art">${avatarFor(USER.handle || USER.name, 52, USER.avatar)}</span>`}
        <div class="thing-body">
          <h3>${esc(USER.name)}</h3>
          <p class="sub">${esc(roleOf(USER.role || 'student'))}</p>
        </div>
      </div>
    </div>

    <div class="card">
      ${rows.map(([k, v]) =>
        `<div class="row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('')}
    </div>

    <div class="card tap" data-do="wardrobe">
      <div class="thing">
        <span class="thing-pic art">${avatarFor(USER.handle || USER.name, 52, USER.avatar)}</span>
        <div class="thing-body">
          <h3>Your figure</h3>
          <p class="sub">${(() => {
            /* WHAT THEY ARE WEARING, in words. A row of item names is what somebody would say out
               loud, and it tells you the wardrobe holds something before you open it. */
            const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
            const on = AV_SLOTS.map(([slot]) => cfg[slot])
              .filter(id => id && id !== 'none' && id !== 'crop' && id !== 'plain');
            return on.length ? esc(on.join(', ')) : 'Nothing on yet — pick something';
          })()}</p>
        </div>
      </div>
    </div>

    <div class="card tap" data-do="edit-me"><h3>Edit your details</h3>
      <p class="sub">Name, email, address, availability.</p></div>

    ${/* MESSAGES. Unread first in the count, because that is the only part anybody scans for. */''}
    <div class="card tap" data-do="messages"><h3>Messages</h3>
      <p class="sub">${(() => {
        const ms = DATA.messages || [];
        const unread = ms.filter(m => !m.mine && !m.read).length;
        return ms.length
          ? (unread ? unread + ' unread of ' + ms.length : ms.length + ', all read')
          : 'Nothing yet';
      })()}</p></div>

    ${/* Friends moved to Find, where people are looked for. A card here made them a setting about
          yourself rather than a set of people you can look through — and it was the only list on
          the site reachable from two places. */''}

    <div class="card tap" data-do="change-pin"><h3>Change your PIN</h3>
      <p class="sub">You will need the current one.</p></div>

    <div class="card tap" data-do="my-referral"><h3>Tell someone</h3>
      <p class="sub">A link only you have. We will know it came from you.</p></div>

    <button class="btn quiet" data-do="signout" style="margin-top:.4rem">Sign out</button>
    ${/* BOTH VERSIONS, at the bottom where a version number belongs. It is the answer to the
          question that has cost more rounds than any bug: is what I am looking at the thing I
          just changed? Two strings, and either one being stale is visible without opening
          anything. */''}
    ${/* ALL THREE, because any one of them being stale looks exactly like a bug in the other
          two. This line is the first thing to read when something has been changed and has not
          changed — and the CSS was the one that could not be asked. */''}
    <p class="faint" style="text-align:center">@family. · Merton &amp; Wandsworth<br>
      site ${esc(SITE_VERSION)} · css ${esc(cssVersion())}<br>
      backend ${esc(DATA.version || '—')}</p>`);}

const mePages = () => chunk(meBlocks(), PER_PAGE.me);

screen('me', () => pages('me', mePages()));
on('do-signin', () => {
  const name = ($('in-name') || {}).value || '';
  const pin = ($('in-pin') || {}).value || '';
  const said = $('in-said');
  if (!name || !pin) { if (said) said.textContent = 'Both, please.'; return; }
  if (said) said.textContent = 'Checking…';
  api({ action: 'verifyLogin', name, pin })
    .then(d => {
      if (!d || !d.success) { if (said) said.textContent = (d && d.error) || 'That did not work.'; return; }
      /* THE REPLY, PLUS WHAT WE ALREADY KNEW. This was `USER = d` — the reply wholesale — so any
         field the backend did not send simply did not exist on the person afterwards. Not
         hypothetical: `todo` was missing from this reply for weeks and every docket vanished at
         sign-in because of it.
         The name matters most, because it is what every request identifies the person by. A reply
         without one signs somebody in as nobody, and the failure that follows is a booking refused
         for not being signed in, to somebody who plainly is. */
      USER = Object.assign({ name: name }, d);
      if (!USER.name) USER.name = name;
      try { localStorage.setItem('familyUser', JSON.stringify(d)); } catch {}
      toast('Signed in');
      load();
    })
    .catch(() => { if (said) said.textContent = 'Could not reach the server.'; });
});

on('signout', () => {
  USER = null;
  try { localStorage.removeItem('familyUser'); } catch {}
  toast('Signed out');
  repaint();
});

/* ---------- THE WARDROBE -------------------------------------------------------------------------
   Every slot, every item, with the locked ones showing what they would take. A catalogue you can
   SEE is what makes levelling up mean anything — a list of only what you already own tells you
   nothing about what is next, which is the whole reason to have a level at all.

   The colours are free and come first, because they are what most people change and because
   nobody should have to earn the right to have brown hair. */
on('wardrobe', () => {
  if (!USER) { toast('Sign in first'); return; }
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  const items = wardrobe();
  const level = levelFromXp(USER.xp);

  const swatches = (field, colours) => `<div class="av-swatches">
    ${colours.map((col, i) => `<span class="av-sw${cfg[field] === i ? ' on' : ''}"
      style="background:${col}" data-do="av-colour" data-field="${field}" data-value="${i}"
      title="${esc(col)}"></span>`).join('')}
  </div>`;

  const slotRow = ([slot, label]) => {
    const mine = items.filter(x => x.slot === slot);
    if (!mine.length) return '';
    return `<div class="av-slot">
      <div class="av-slot-name">${esc(label)}</div>
      <div class="av-opts">${mine.map(it => {
        const on = cfg[slot] === it.id;
        /* WHY it is not yours, on the item itself. "Locked" is a state; "Level 8" is a thing you
           can count towards, and the difference is whether the wardrobe is a shop window or a
           list of doors. */
        const why = it.unlocked ? '' : (it.cost ? it.cost + ' cr' : 'Lv ' + it.level);
        return `<button class="av-opt${on ? ' on' : ''}${it.unlocked ? '' : ' locked'}"
          data-do="av-pick" data-slot="${esc(slot)}" data-id="${esc(it.id)}"
          title="${esc(it.name + (why ? ' — ' + why : ''))}">
          ${itemArt(slot, it.id, 34) || '<span class="av-none">—</span>'}
          <span class="av-name">${esc(it.name)}</span>
          ${why ? `<span class="av-why">${esc(why)}</span>` : ''}
        </button>`;
      }).join('')}</div>
    </div>`;
  };

  openSheet('Your figure', `
    <div class="av-wrap av-big" id="av-figure">${avatarFor(USER.handle || USER.name, 120, USER.avatar)}</div>
    <div class="row"><span class="k">Level</span><span class="v mono">${level}</span></div>
    <div class="row"><span class="k">Credits</span>
      <span class="v mono gold">${USER.credits || 0}</span></div>

    <h2>Colours</h2>
    <p class="faint" style="margin:0 0 .4rem">Free, all of them. Nobody earns their own hair.</p>
    <div class="av-slot"><div class="av-slot-name">Skin</div>${swatches('skin', AV_SKIN)}</div>
    <div class="av-slot"><div class="av-slot-name">Hair</div>${swatches('hairColour', AV_HAIR)}</div>
    <div class="av-slot"><div class="av-slot-name">Shirt</div>${swatches('shirt', AV_SHIRT)}</div>

    <h2>Things</h2>
    ${AV_SLOTS.map(slotRow).join('')}
    <p class="faint" id="av-said"></p>`);
});

/* A colour and an item go through the SAME request, because to the server they are the same
   thing: a whole look, re-checked piece by piece. Nothing here decides what anybody may wear. */
function avatarSave(change) {
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  Object.assign(cfg, change);
  const said = $('av-said');
  if (said) said.textContent = 'Saving…';

  /* The figure redraws IMMEDIATELY, before the server answers — picking a colour and waiting a
     second to see it is the difference between a wardrobe and a form. Put back if refused. */
  const before = USER.avatar;
  USER.avatar = Object.keys(cfg).map(k => k + ':' + cfg[k]).join('|');
  const fig = $('av-figure');
  if (fig) fig.innerHTML = avatarFor(USER.handle || USER.name, 120, USER.avatar);

  api({ action: 'saveAvatar',
    name: USER.name, personId: USER.personId, avatar: cfg })
    .then(d => {
      if (!d || d.error) throw new Error((d && d.error) || 'Could not save that');
      USER.avatar = d.avatar;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      if (d.owned) USER.avatarItems = d.owned;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      const el = $('av-said');
      if (el) el.textContent = (d.bought || []).length ? 'Bought ' + d.bought.join(', ') : 'Saved';
      if (fig) fig.innerHTML = avatarFor(USER.handle || USER.name, 120, USER.avatar);
    })
    .catch(err => {
      USER.avatar = before;
      if (fig) fig.innerHTML = avatarFor(USER.handle || USER.name, 120, USER.avatar);
      const el = $('av-said');
      if (el) el.textContent = String(err.message || err);
    });
}

on('av-colour', el => avatarSave({ [el.dataset.field]: Number(el.dataset.value) }));
on('av-pick', el => avatarSave({ [el.dataset.slot]: el.dataset.id }));

on('register',    () => toast('Registration is the next thing to wire'));

/* ---------- FRIENDS ------------------------------------------------------------------------------
   A comma list of handles on the person's own row. Kept as one cell for the same reason the docket
   is: a friendship has no life of its own, nothing links to it, and a tab would mean a row id and
   a deletion policy for something that is a name in a list.
--------------------------------------------------------------------------------------------- */
const friendHandles = () =>
  String((USER && USER.friends) || '').split(',').map(x => x.trim()).filter(Boolean);

/* ADDING ONE. The LIST is on Find with everything else; this is only the asking — a short question
   with an end, which is what a sheet is for. It used to show the list here too, which made friends
   the one set of people on the site reachable from two places. */
function friendsSheet() {
  openSheet('Add a friend', `
    <label class="field"><span>their handle</span>
      <input id="fr-add" placeholder="e.g. LuccaD" autocomplete="off"></label>
    <button class="btn" data-do="friend-add">Add</button>
    <p class="faint" id="fr-said" style="margin:.6rem 0 0">
      Exactly as they have it. A search that guesses adds the wrong person, and the wrong person is
      harder to notice than nobody — they simply appear on a list you scroll past.</p>`);
}
on('friends', () => { if (!USER) { toast('Sign in first'); return; } friendsSheet(); });

on('friend-add', () => {
  const box = $('fr-add'), said = $('fr-said');
  const want = ((box && box.value) || '').trim();
  if (!want) { box && box.focus(); return; }
  /* EXACT, and it has to be. A search that guesses adds the wrong person, and the wrong person is
     harder to notice than nobody — they simply appear on a list somebody scrolls past. */
  const found = (DATA.students || []).find(s2 => norm(s2.handle) === norm(want));
  if (!found) { if (said) said.textContent = 'Nobody has the handle "' + want + '".'; return; }
  if (norm(found.handle) === norm(USER.handle)) {
    if (said) said.textContent = 'That is you.'; return;
  }
  const list = friendHandles();
  if (list.some(h => norm(h) === norm(found.handle))) {
    if (said) said.textContent = found.handle + ' is already on your list.'; return;
  }
  friendsSave(list.concat([found.handle]), said);
  closeSheet();
  toast('Added ' + found.handle);
});

on('friend-drop', el => friendsSave(
  friendHandles().filter(h => norm(h) !== norm(el.dataset.handle)), $('fr-said')));

/* Adding one from the Find browse page, where the list is. */
on('friend-add-open', () => friendsSheet());

/* Written on the phone first, then sent — and the sheet redrawn either way, so removing somebody
   is visible before the round trip and put back if it fails. */
function friendsSave(list, said) {
  const before = USER.friends;
  USER.friends = list.join(', ');
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  /* The list lives on Find now, so that is what has to be redrawn — and the memo has to be told,
     or it serves the list from before the change. */
  FIND_MEMO.key = null;
  if (AT === 'stuff') paintStuff();
  api({ action: 'saveFriends', name: USER.name, personId: USER.personId, friends: USER.friends })
    .then(d => { if (d && d.error) throw new Error(d.error); })
    .catch(err => {
      USER.friends = before;
      FIND_MEMO.key = null;
      if (AT === 'stuff') paintStuff();
      const el = $('fr-said');
      if (el) el.textContent = String(err.message || 'Not saved — no connection.');
    });
}

/* ---------- MESSAGES -----------------------------------------------------------------------------
   Read-only for now on the sending side of a thread nobody has started: the backend has
   `sendMessage` and this can post to it, but there is no picker for WHO — that belongs with the
   roster, where the people you are talking to are already on screen.
--------------------------------------------------------------------------------------------- */
on('messages', () => {
  if (!USER) { toast('Sign in first'); return; }
  const ms = DATA.messages || [];
  openSheet('Messages', ms.length
    ? ms.map(m => `<div class="msg${m.mine ? ' mine' : ''}${!m.mine && !m.read ? ' unread' : ''}">
        <p class="msg-body">${mark(m.body)}</p>
        <p class="faint msg-when">${esc(m.mine ? 'you' : (m.fromName || 'them'))} · ${esc(m.at || '')}</p>
      </div>`).join('')
    : `<p class="empty">Nothing yet.<br><span class="faint">Messages about a session appear
         here.</span></p>`);
});

/* ---------- YOUR OWN DETAILS ---------------------------------------------------------------------
   Built from the backend's own field list, exactly as the resource editor is — `profileFields` IS
   the allow-list the server checks writes against, so a form built from it cannot offer a field
   the server will refuse or miss one it would accept.
--------------------------------------------------------------------------------------------- */
on('edit-me', () => {
  if (!USER) { toast('Sign in first'); return; }
  const role = roleOf(USER.role || '');
  const groups = (role === 'client' && DATA.clientFields && Object.keys(DATA.clientFields).length)
      ? DATA.clientFields
    : (role === 'student' && DATA.studentFields && Object.keys(DATA.studentFields).length)
      ? DATA.studentFields
    : (DATA.profileFields && Object.keys(DATA.profileFields).length)
      ? DATA.profileFields
    /* A backend too old to send it. The form still opens with what this file knows about — an
       admin who can edit nothing is worse than one who can edit a few things. */
    : { 'About you': ['first_name', 'last_name', 'photo'],
        'Where': ['borough', 'city'], 'Contact': ['email', 'phone'] };

  const p = USER.profile || {};
  const readonly = DATA.profileReadonly || [];

  const field = f => {
    const v = p[f] ?? '';
    const ro = readonly.indexOf(f) !== -1;
    const opts = (DATA.validations || {})[f];
    if (/^(dbs|active|listed)/.test(f)) {
      return `<label class="check">
        <input type="checkbox" data-me="${esc(f)}" ${TRUEish_(v) ? 'checked' : ''} ${ro ? 'disabled' : ''}>
        <span class="box"></span><span>${esc(fieldLabel(f))}</span></label>`;
    }
    if (opts && opts.length) {
      return `<label class="field"><span>${esc(fieldLabel(f))}</span>
        <select data-me="${esc(f)}" ${ro ? 'disabled' : ''}>
          <option value="">${NONE_LABEL}</option>
          ${opts.map(o => `<option value="${esc(o)}"${String(v) === String(o) ? ' selected' : ''}
            >${esc(o)}</option>`).join('')}
        </select></label>`;
    }
    return `<label class="field"><span>${esc(fieldLabel(f))}</span>
      <input data-me="${esc(f)}" value="${esc(String(v))}" ${ro ? 'disabled' : ''}
        ${/rate|hours|students|km|years/.test(f) ? 'inputmode="decimal"' : ''}></label>`;
  };

  openSheet('Your details',
    Object.keys(groups).map(g => `<h2><span>${esc(g)}</span></h2>`
      + groups[g].map(field).join('')).join('')
    + `<button class="btn" data-do="me-save">Save</button>
       <p class="faint" id="me-said" style="margin:.6rem 0 0"></p>`);
});

/* The sheet writes TRUE/FALSE as text and the payload sends real booleans; rows written by older
   versions send neither consistently. One reader for all three. */
const TRUEish_ = v => v === true || /^(true|yes|1|✓)$/i.test(String(v ?? '').trim());

on('me-save', el => {
  const said = $('me-said');
  const fields = {};
  document.querySelectorAll('#sheet-body [data-me]').forEach(box => {
    if (box.disabled) return;
    fields[box.dataset.me] = box.type === 'checkbox' ? (box.checked ? 'TRUE' : 'FALSE')
                                                     : String(box.value || '').trim();
  });
  el.disabled = true;
  if (said) said.textContent = 'Saving…';

  api({ action: 'updateProfile', name: USER.name,
    target: USER.name, targetId: USER.personId || '', fields })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      /* Kept on the phone as well, so the You screen shows the new values before the next load. */
      USER.profile = Object.assign({}, USER.profile || {}, fields);
      if (d && d.name) USER.name = d.name;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      closeSheet(); toast('Saved'); load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not save that');
    });
});
on('change-pin',  () => openSheet('Change your PIN', `
  <label class="field"><span>current PIN</span>
    <input id="pin-now" type="password" inputmode="numeric"></label>
  <label class="field"><span>new PIN</span>
    <input id="pin-new" type="password" inputmode="numeric"></label>
  <label class="field"><span>and again</span>
    <input id="pin-again" type="password" inputmode="numeric"></label>
  <button class="btn" data-do="pin-save">Change it</button>
  <p class="faint" id="pin-said" style="margin:.6rem 0 0">4 to 8 numbers, and not 1234.</p>`));

on('pin-save', () => {
  const v = id => ($(id) || {}).value || '';
  const said = $('pin-said');
  /* Typed twice, checked here before the server sees it — a PIN you cannot see and typed once is
     a PIN you get locked out by. */
  if (v('pin-new') !== v('pin-again')) { if (said) said.textContent = 'The two new PINs do not match.'; return; }
  api({ action: 'changePin', name: USER.name,
    currentPin: v('pin-now'), newPin: v('pin-new') })
    .then(d => {
      if (d && d.error) { if (said) said.textContent = d.error; return; }
      toast('PIN changed'); closeSheet();
    })
    .catch(() => { if (said) said.textContent = 'Could not reach the server.'; });
});

on('my-referral', () => {
  api({ action: 'myReferral', name: USER.name })
    .then(d => {
      if (!d || d.error) { toast((d && d.error) || 'Could not fetch it'); return; }
      const link = location.origin + location.pathname + '?ref=' + encodeURIComponent(d.code);
      openSheet('Tell someone', `
        <p class="note" style="margin-top:0">Send this to a family it would suit. We will know it
          came from you.</p>
        <div class="row"><span class="k">Your code</span><span class="v mono">${esc(d.code)}</span></div>
        <input class="mono" readonly value="${esc(link)}" style="margin:.6rem 0">
        <button class="btn" data-do="ref-send" data-link="${esc(link)}">Send it</button>
        <div class="row" style="margin-top:.8rem"><span class="k">Joined through you</span>
          <span class="v mono">${(d.sent || []).length}</span></div>
        ${(d.sent || []).length
          ? (d.sent || []).map(x => `<div class="row"><span class="k">·</span>
               <span class="v">${esc(x.name)}</span></div>`).join('')
          : '<p class="faint">Nobody yet. It only takes one.</p>'}`);
    })
    .catch(() => toast('Could not reach the server.'));
});

on('ref-send', el => {
  const link = el.dataset.link;
  if (navigator.share) { navigator.share({ title: '@family.', url: link }).catch(() => {}); return; }
  navigator.clipboard?.writeText(link).then(() => toast('Link copied')).catch(() => toast(link));
});

/* Whether the first load has come back. Separate from "are there any posts" — a spinner and an
   empty state answer different questions, and showing the wrong one makes an app look broken in
   the first second somebody sees it. */
let LOADED = false;
/* WHY there is nothing to show. `LOADED` says the attempt finished; this says whether it worked.
   Without it a failed fetch and an empty spreadsheet produce the same screen — and the words on
   that screen were "add a row to the posts tab", which is advice for a problem the person does not
   have, with no mention of the one they do. */
let LOAD_FAILED = '';

/**
 * A SHAPE OF THE THING THAT IS COMING, not a spinner.
 *
 * A spinner says "wait". This says "a face, a photograph and two lines are about to be here" — so
 * nothing jumps when they arrive, and the wait reads as loading rather than as nothing happening.
 *
 * IT HAS TO MATCH. It used to draw two stacked articles because the feed was a column; the feed is
 * one post per screen now, so it draws ONE, inside the same pager, with the picture taking the
 * same room the real one will. A skeleton in the wrong shape is worse than no skeleton at all —
 * the page still jumps, and it jumps at the exact moment somebody has started reading it.
 *
 * The bars are staggered a little. In lockstep they pulse as one block, which reads as a single
 * animated rectangle; slightly apart they read as separate things arriving.
 */
function skeleton() {
  const bar = (w, h, delay, extra) =>
    `<span class="sk-box" style="width:${w};height:${h};animation-delay:${delay}s${
      extra ? ';' + extra : ''}"></span>`;
  return pages('posts', [`
    <article class="post sk">
      <header class="post-by">
        ${bar('1.9rem', '1.9rem', 0, 'border-radius:50%;flex:none')}
        ${bar('6rem', '.7rem', .08)}
      </header>
      <span class="sk-box sk-pic" style="animation-delay:.16s"></span>
      <div class="post-acts">${bar('9rem', '2.3rem', .24)}</div>
      ${bar('80%', '.7rem', .32, 'margin-top:.5rem')}
      ${bar('45%', '.7rem', .4, 'margin-top:.35rem')}
    </article>`]);
}

/* ---------- POSTS -------------------------------------------------------------------------------
   The front of the app. A picture, a line about it, and a heart with a number.

   Full width and one column: a photograph split across two columns on a phone is two photographs
   of nothing.
--------------------------------------------------------------------------------------------- */

/* A Google Drive share link is a page, not a picture — pasting one into an <img> gives a broken
   image every time. This turns it into the direct thumbnail. Anything that is already a plain URL
   passes straight through. */
function pic(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  const id = (u.match(/\/file\/d\/([\w-]{20,})/) || u.match(/[?&]id=([\w-]{20,})/) || [])[1];
  return id ? 'https://lh3.googleusercontent.com/d/' + id + '=w1200' : u;
}

/**
 * THE FEED, IN ORDER.
 *
 * The sheet's row order is Drive's iteration order, which is not chronological and not anything —
 * February posts were sitting between June ones, and a feed in no order reads as a feed that
 * failed to load rather than as one arranged badly.
 *
 * `parseDMY` rather than `new Date()`: the cells are DD/MM/YYYY and a browser reads those as
 * American, so 12/06 becomes December.
 */
function feedPosts() {
  return [...(DATA.posts || DATA.gallery || [])]
    /* A deleted post is still on the screen for an admin, greyed. It has to be — something
       invisible cannot be put back, which is why the tutor switch works the same way. */
    .filter(p => p.active !== false || isAdmin())
    .sort((a, b) => {
      const pin = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      if (pin) return pin;
      /* `at` first — the payload's millisecond timestamp. `when` is a DAY, so two posts from the
         same afternoon tie on it and fall back to sheet order, which after a folder scan is
         Drive's order and no order at all. */
      const da = parseWhen(a.at || a.when), db = parseWhen(b.at || b.when);
      /* An undated post goes LAST, not first. Sorting a null as 0 put every unparsed date at the
         bottom of time — which is 1970, and above everything. */
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db - da;
    });
}

screen('posts', () => {
  /* NOTHING LOADED YET is not the same as NOTHING TO SHOW, and the difference matters: one is a
     wait and the other is a fact. Telling somebody "nothing posted yet" while the request is still
     in flight is a lie the app corrects a second later, which is worse than saying nothing. */
  if (!LOADED) return skeleton();

  const posts = feedPosts();
  if (!posts.length) {
    return nothingHere('Nothing posted yet.<br><span class="faint">Add a row to the posts tab '
      + 'with an image link and a caption.</span>');
  }

  /* ONE POST PER SCREEN, and the same pager the tools use. A feed is the place this shape
     belongs most obviously — a photograph competing with the top of the next photograph is a
     photograph nobody looks at properly, and scrolling past one by accident is how you never see
     it again. */
  return pages('posts', posts.map((p, i) => {
    const src = pic(p.image);
    /* The author's face, or the brand's mark when the post is the business speaking. A column of
       blank circles is the thing that makes a feed look unfinished. */
    const face = pic(p.avatar || brand('logo_square') || brand('logo_circle'));
    const who = p.handle || p.author || brand('name', '@family.');

    /* The order is Instagram's, and it is right: WHO first, then the picture, then what you can do
       about it, then what it says.
       Who first because a photograph with no attribution is an advert; the caption last because it
       is the only part you may not read. */
    return `<article class="post${p.active === false ? ' is-off' : ''}" data-post="${esc(p.id)}">
      <header class="post-by">
        ${face
          ? `<img class="post-face" src="${esc(face)}" alt="">`
          : `<span class="post-face none">${esc(initial(who))}</span>`}
        <span class="post-nm">
          <span class="post-who">${esc(who)}${p.pinned
            ? ' <span class="faint">· pinned</span>' : ''}${p.active === false
            ? ' <span class="faint">· deleted</span>' : ''}</span>
          ${p.location ? `<span class="post-where">${esc(p.location)}</span>` : ''}
        </span>
        ${/* One glyph, at the end of the row where it does not compete with the picture. A post is
              looked at a hundred times for every time it is edited, so the control is small. */''}
        ${isAdmin() ? `<span class="post-edit" data-do="post-edit"
             data-id="${esc(p.id)}">⋯</span>` : ''}
      </header>

      ${src ? `<img class="post-pic" src="${esc(src)}" alt=""
           loading="${i < 2 ? 'eager' : 'lazy'}">` : ''}

      ${/* THE ACTIONS ROW, which is now reactions and sharing and nothing else.
            The heart has gone. A like is a reaction with exactly one option, so having both was
            two counts of the same gesture — and a heart sitting beside a 👍 asking for the same
            press, with no way to tell somebody which one you meant.
            The reactions move UP here, into the place the heart held: directly under the picture,
            where the eye already goes and where the thing you can do about a photograph belongs. */''}
      <div class="post-acts">
        ${reacts(p) || (isAdmin()
          ? '<span class="faint">No reaction set — fill in <code>brand!reactions</code>.</span>'
          : '<span></span>')}
        <button class="post-act" data-do="share" data-id="${esc(p.id)}" aria-label="share">↗</button>
      </div>

      ${/* The name leads the caption, as it does everywhere — but ONLY when there is a caption.
            Without a caption it was printing the name on its own under the picture, which is the
            name said twice and answers nothing. */''}
      ${p.caption ? `<p class="post-cap"><b>${esc(who)}</b> ${mark(p.caption)}</p>` : ''}
      ${p.poll ? poll(p) : ''}
      ${p.body ? `<p class="note">${mark(p.body)}</p>` : ''}
      ${p.when || p.at ? `<p class="faint post-when">${esc(ago(p.at || p.when))}</p>` : ''}
    </article>`;
  }));
}, () => isAdmin()
  ? '<span class="act" data-do="new-post">＋</span><span class="act" data-do="scan-posts">⟳</span>'
  : '');

/* ---------- REACTIONS ---------------------------------------------------------------------------
   A row of faces with a count under each. Unlike the poll, the counts are NOT hidden — a poll asks
   a question and wants an unanchored answer; a reaction is a room agreeing with itself, and seeing
   that eleven people laughed is most of why anybody adds a twelfth.

   A face with nobody behind it shows no number rather than a 0 — a row of zeroes reads as
   indifference, and an empty space reads as nothing having happened yet.
--------------------------------------------------------------------------------------------- */
function reacts(p) {
  const r = p.reactions;
  /* NO FACES, NO ROW — and the caller is told, rather than being handed an empty div.
     `r.emoji.map` over an empty array drew a `<div class="reacts">` with nothing inside it, which
     renders as no gap, no message and no clue: exactly the silent absence this codebase keeps
     producing. The emoji set comes from `brand!reactions`, and while that cell is empty there is
     nothing to draw. */
  if (!r || !Array.isArray(r.emoji) || !r.emoji.length) return '';
  const counts = Array.isArray(r.counts) ? r.counts : [];
  return `<div class="reacts">
    ${r.emoji.map((e, i) => {
      const n = counts[i] || 0;
      const mine = r.yours === e;
      return `<button class="react${mine ? ' mine' : ''}${n ? ' any' : ''}"
                 data-do="react" data-id="${esc(p.id)}" data-emoji="${esc(e)}">
        <span class="react-e">${esc(e)}</span>${n ? `<span class="react-n">${n}</span>` : ''}
      </button>`;
    }).join('')}
    ${/* THE TOTAL, and it is its own button. Pressing a face adds YOUR reaction; pressing the
          number asks who — two different questions, and one control answering both means somebody
          who wants to see the list has to react to the post to find out.
          Only there when somebody has: a 0 that opens an empty panel is a promise broken. */''}
    ${r.total ? `<button class="react-who" data-do="who-reacted" data-id="${esc(p.id)}"
        >${r.total}</button>` : ''}
  </div>`;
}

/* WHO REACTED, AND WITH WHAT. Grouped by face rather than listed flat: "four people laughed" is
   the shape of the answer, and a list of twenty rows each carrying its own emoji makes you count
   them yourself. */
on('who-reacted', el => {
  const p = (DATA.posts || []).find(x => x.id === el.dataset.id);
  const r = p && p.reactions;
  if (!r || !r.total) return;

  const by = r.by || [];
  const groups = (r.emoji || []).map((e, i) => ({
    emoji: e, n: (r.counts || [])[i] || 0,
    names: by.filter(x => x.emoji === e).map(x => x.name),
  })).filter(g => g.n);

  openSheet(r.total + ' reaction' + (r.total === 1 ? '' : 's'),
    groups.map(g => `
      <h2><span>${esc(g.emoji)}</span><span class="faint">${g.n}</span></h2>
      ${g.names.length
        ? g.names.map(n => `<div class="row"><span class="v">${mark(n)}</span></div>`).join('')
        : ''}
      ${g.n > g.names.length
        /* Reacted by people whose names the site cannot resolve — somebody removed from the sheet,
           or a reaction from before they were added. The count is still true. */
        ? `<p class="faint">…and ${g.n - g.names.length} more</p>` : ''}`).join(''));
});

on('react', el => {
  if (!USER) { toast('Sign in to react'); go('me'); return; }
  const id = el.dataset.id, emoji = el.dataset.emoji;
  const post = (DATA.posts || []).find(x => x.id === id);
  if (!post || !post.reactions) return;

  const r = post.reactions;
  /* A counts array shorter than the emoji list would go NaN on the first press and stay NaN. The
     button can only exist if there are emoji, so this fills in whatever the payload left out. */
  if (!Array.isArray(r.counts) || r.counts.length !== r.emoji.length) {
    r.counts = r.emoji.map((_, i) => Number((r.counts || [])[i]) || 0);
  }
  if (typeof r.total !== 'number') r.total = r.counts.reduce((a, b) => a + b, 0);

  const before = { yours: r.yours, counts: r.counts.slice(), total: r.total };
  const at = e => r.emoji.indexOf(e);
  if (at(emoji) < 0) return;

  /* Moved before the server answers. The whole row is redrawn rather than one face, because
     changing your reaction moves two counts at once. */
  if (r.yours) { r.counts[at(r.yours)]--; r.total--; }
  if (r.yours === emoji) { r.yours = ''; }
  else { r.yours = emoji; r.counts[at(emoji)]++; r.total++; }
  repaint();

  send({ action: 'reactPost', name: USER.name, postId: id, emoji })
    .catch(err => {
      r.yours = before.yours; r.counts = before.counts; r.total = before.total;
      repaint();
      toast(String(err.message || 'Could not save that'));
    });
});

/* ---------- A POLL ------------------------------------------------------------------------------
   The counts are HIDDEN until you have voted. Not to be coy — seeing that eleven people said Yes
   before you answer changes what you answer, and a poll that anchors people is a poll that tells
   you what it already said.
--------------------------------------------------------------------------------------------- */
function poll(p) {
  const q = p.poll;
  const voted = !!q.yours;
  const most = Math.max(1, ...q.counts);

  return `<div class="poll">
    ${q.options.map((opt, i) => {
      const n = q.counts[i];
      const share = q.total ? Math.round(n / q.total * 100) : 0;
      const mine = q.yours === opt;
      return `<button class="poll-row${mine ? ' mine' : ''}${voted ? ' done' : ''}"
                 data-do="vote" data-id="${esc(p.id)}" data-choice="${esc(opt)}">
        ${voted
          /* The bar is drawn against the BIGGEST answer, not against the total — with four options
             the winner might be 30%, and a bar 30% across reads as nobody choosing it. */
          ? `<span class="poll-bar" style="width:${Math.round(n / most * 100)}%"></span>` : ''}
        <span class="poll-text">${mine ? '✓ ' : ''}${esc(opt)}</span>
        ${voted ? `<span class="poll-n">${share}%</span>` : ''}
      </button>`;
    }).join('')}
    <p class="faint poll-tot">${
      !USER ? 'Sign in to vote'
      : q.total === 0 ? 'No votes yet'
      : q.total + ' vote' + (q.total === 1 ? '' : 's')
        + (voted ? ' · tap yours again to take it back' : '')
    }</p>
  </div>`;
}

on('vote', el => {
  if (!USER) { toast('Sign in to vote'); return; }
  const id = el.dataset.id, choice = el.dataset.choice;
  const post = (DATA.posts || []).find(x => x.id === id);
  if (!post || !post.poll) return;

  const q = post.poll;
  const before = { yours: q.yours, counts: q.counts.slice(), total: q.total };

  /* Moved on screen before the server answers, the same as a like — and the whole poll is redrawn
     rather than one row, because a vote changes every percentage on it. */
  const at = i => q.options.indexOf(i);
  if (q.yours) { q.counts[at(q.yours)]--; q.total--; }
  if (q.yours === choice) { q.yours = ''; }
  else { q.yours = choice; q.counts[at(choice)]++; q.total++; }
  repaint();

  api({ action: 'votePoll',
    name: USER.name, postId: id, choice })
    .then(d => { if (d && d.error) throw new Error(d.error); })
    .catch(err => {
      q.yours = before.yours; q.counts = before.counts; q.total = before.total;
      repaint();
      toast(String(err.message || 'Could not save that vote'));
    });
});

/* SHARING. A post needs an address of its own or there is nothing to send — so each one gets
   `?post=` and the app opens on it. Without that, sharing sends somebody to the top of a feed to
   hunt for a photograph they were shown. */
on('share', el => {
  const id = el.dataset.id;
  const post = (DATA.posts || []).find(p => p.id === id);
  const url = location.origin + location.pathname + '?post=' + encodeURIComponent(id);
  const text = post && post.caption ? post.caption : '@family.';

  if (navigator.share) {
    navigator.share({ title: '@family.', text, url }).catch(() => {});
    return;
  }
  /* No share sheet — a desktop, or an older phone. Copying is the honest fallback; a dialog
     saying "sharing is not supported" helps nobody. */
  navigator.clipboard?.writeText(url)
    .then(() => toast('Link copied'))
    .catch(() => toast(url));
});

/* Arriving on a shared post. Read once at start-up and cleared, so a refresh later does not drag
   somebody back to a photograph they have finished with. */
function openSharedPost() {
  let id = '';
  try { id = new URLSearchParams(location.search).get('post') || ''; } catch {}
  if (!id) return;

  /* TURN THE DIAL TO IT, rather than scrolling. The feed is one post per screen now, so the post
     somebody was sent is a PAGE rather than a position down a column — and scrollIntoView on an
     absolutely-positioned page moves nothing at all, silently, which would look exactly like a
     shared link going to the top of the feed. */
  const n = feedPosts().findIndex(p => String(p.id) === String(id));
  if (n < 0) { go('posts'); return; }
  PAGE.posts = n;
  go('posts');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelector(`[data-post="${CSS.escape(id)}"]`)?.classList.add('post-lit');
  }));
}

/* ---------- POSTING ------------------------------------------------------------------------------
   An admin picks a photograph and it goes to the Drive folder and the posts tab at once.

   RESIZED ON THE PHONE FIRST. A modern camera makes a 4MB picture, which as base64 is 5.5MB — over
   what Apps Script will take, and a minute of a library's wifi. Scaled to 1600px and re-encoded it
   is about 300KB, and nobody can tell on a phone screen.
--------------------------------------------------------------------------------------------- */
/* `shrink` lived here — it resized a chosen photograph in the browser before uploading it, so a
   4MB camera picture did not become a 4MB row. There is nothing to upload any more: a post is the
   ADDRESS of a picture, so the picture is never carried anywhere and never needs shrinking.
   Deleted rather than left unused. Dead code reads as a thing the app does, and the next person to
   wonder why posting is slow would have found a resizer and believed it. */

on('new-post', () => {
  openSheet('New post', `
  ${/* CHOOSE ONE THAT IS ALREADY THERE, before being offered the upload.
       Uploading writes to Drive; choosing only reads it. That difference matters because a
       deployment can hold read and not write — and for a photograph taken on a phone this is the
       shorter route anyway: share it to the folder from the camera roll and it is here. */''}
  <div id="post-from-folder"><p class="faint">Looking in the folder…</p></div>
  ${/* A LINK, not a file.
       Uploading meant this app had to be allowed to write to your Drive, which is a large
       permission to hold for the sake of one button — and the picture has to be somewhere with a
       link anyway before anybody but you can see it.
       So the picture stays where it is and the post keeps its address. The row above fills this in
       for anything already in the folder; anything else is a paste. */''}
  <label class="field"><span>link to the picture</span>
    <input id="post-link" placeholder="https://…" inputmode="url" autocomplete="off"></label>
  <div id="post-preview"></div>
  <label class="field"><span>caption</span>
    <input id="post-cap" placeholder="One line about it"></label>
  <label class="field"><span>where</span>
    <input id="post-loc" placeholder="Colliers Wood Library" list="known-places">
    <datalist id="known-places">
      ${(DATA.venues || []).map(v => `<option value="${esc(v.title)}">`).join('')}
    </datalist></label>
  <label class="field"><span>more, if you want it</span>
    <textarea id="post-body" placeholder="Optional"></textarea></label>
  <label class="field"><span>poll, if you want one</span>
    <input id="post-poll" placeholder="Yes, No, Maybe"></label>
  <label class="field"><span>posting as</span>
    <span class="btn-row" id="post-as" data-as="brand">
      <button class="btn quiet on" data-do="as" data-as="brand">
        ${esc(brand('name', '@family.'))}</button>
      <button class="btn quiet" data-do="as" data-as="me">${esc(USER ? USER.name : 'me')}</button>
    </span></label>
  <button class="btn" data-do="post-send">Post it</button>
  <p class="faint" id="post-said" style="margin:.6rem 0 0"></p>`);

  /* Fetched after the sheet is up, so the form is usable while the folder is being read. */
  api({ action: 'folderFiles', name: USER.name, adminName: USER.name })
    .then(d => {
      const box = $('post-from-folder');
      if (!box) return;                                   // the sheet was closed
      if (d.error || !(d.files || []).length) {
        /* Nothing to choose, or no permission to look. Either way the upload below is the only
           route, and a picker with nothing in it is worse than no picker. */
        box.innerHTML = d.error
          ? `<p class="faint">Could not look in the folder: ${esc(d.error)}</p>`
          : `<p class="faint">Nothing new in the folder. Put a photograph in it from Drive and it
               will appear here.</p>`;
        return;
      }
      box.innerHTML = `<p class="faint">In the folder — tap one</p>
        <div class="pickers">${d.files.map(f => `
          <button class="picker" data-do="post-pick" data-id="${esc(f.id)}"
                  data-caption="${esc(f.caption)}" title="${esc(f.name)}">
            <img src="${esc(pic('https://drive.google.com/file/d/' + f.id + '/view'))}" alt=""
                 loading="lazy">
            <span>${esc(f.caption)}</span>
          </button>`).join('')}</div>`;
    })
    .catch(() => {
      const box = $('post-from-folder');
      if (box) box.innerHTML = '';
    });
});

/* Choosing one. It does not upload anything — the picture is already in Drive and already shared,
   so all that is missing is the row. */
on('post-pick', el => {
  document.querySelectorAll('.picker').forEach(b => b.classList.toggle('on', b === el));
  /* Straight into the link box, not into a hidden field beside it. There is one place the picture
     is named, and you can see it and change it — a picker that stores its answer somewhere
     invisible is a second source of truth waiting to disagree with the one on screen. */
  const box = $('post-link');
  if (box) box.value = 'https://drive.google.com/file/d/' + el.dataset.id + '/view';
  /* The caption comes from the file's name, and only while the box is empty — somebody who has
     already typed one meant it. */
  const cap = $('post-cap');
  if (cap && !cap.value) cap.value = el.dataset.caption || '';
  showPostPreview();
});

/**
 * A PREVIEW OF WHATEVER THE LINK POINTS AT.
 *
 * It is the only way to find out, before posting, that a Drive link has not been shared — the
 * commonest fault by far, and one that looks fine to whoever pasted it because they can see the
 * picture and nobody else can.
 */
function showPostPreview() {
  const box = $('post-preview');
  const url = ($('post-link') || {}).value || '';
  if (!box) return;
  if (!url.trim()) { box.innerHTML = ''; return; }

  const src = pic(url.trim());
  box.innerHTML = `<img src="${esc(src)}" alt=""
    style="width:100%;margin:.2rem 0 .6rem;background:var(--sunk)">`;
  const img = box.querySelector('img');
  if (!img) return;                 // nothing to watch load, so nothing to report about it
  const said = $('post-said');
  img.onload = () => { if (said) said.textContent = ''; };
  img.onerror = () => {
    box.innerHTML = '';
    if (said) said.textContent = 'That link does not show a picture. If it is in Drive, it needs '
      + 'to be shared with anyone who has the link.';
  };
}

document.addEventListener('input', e => {
  if (e.target.id === 'post-link') showPostPreview();
});

on('post-send', el => {
  const link = (($('post-link') || {}).value || '').trim();
  const said = $('post-said');
  if (!link) { if (said) said.textContent = 'A link to the picture, first.'; return; }
  el.disabled = true;
  if (said) said.textContent = 'Posting…';

  api({ action: 'addPost',
    name: USER.name, adminName: USER.name,
    /* THE ADDRESS OF THE PICTURE, and nothing else. No bytes go anywhere: the picture stays where
       it already is, which is the only reason this app no longer needs permission to write to your
       Drive at all. */
    image: link,
    caption: ($('post-cap') || {}).value || '',
    location: ($('post-loc') || {}).value || '',
    poll: ($('post-poll') || {}).value || '',
    postAs: ($('post-as') || {}).dataset?.as || 'brand',
    body: ($('post-body') || {}).value || '' })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet(); toast('Posted'); load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not post that');
    });
});

/* ---------- EDITING A POST -----------------------------------------------------------------------
   Admin only, and the same shape as editing a resource: id-keyed, only the fields shown are sent,
   and delete is a flag rather than a removed row.

   The row is REFERENCED. Likes, votes and reactions are all rows elsewhere pointing at this
   post_id — take the row away and every one of them points at nothing, which renders as a like
   count on a post that is not there.
--------------------------------------------------------------------------------------------- */
on('post-edit', el => {
  const p = (DATA.posts || []).find(x => x.id === el.dataset.id);
  if (!p) return;
  /* The options only, not the counts. What the site holds is what a phone was sent; the sheet's
     cell is the source, and the two are the same list while nobody has voted. */
  const opts = p.poll ? (p.poll.options || []).join(', ') : '';
  const voted = !!(p.poll && p.poll.total);

  openSheet('Edit post', `
    ${p.image ? `<img src="${esc(pic(p.image))}" alt=""
         style="width:100%;margin-bottom:.7rem">` : ''}
    <label class="field"><span>caption</span>
      <input id="pe-cap" value="${esc(p.caption || '')}"></label>
    <label class="field"><span>more</span>
      <textarea id="pe-body">${esc(p.body || '')}</textarea></label>
    <label class="field"><span>where</span>
      <input id="pe-loc" value="${esc(p.location || '')}" list="known-places">
      <datalist id="known-places">
        ${(DATA.venues || []).map(v => `<option value="${esc(v.title)}">`).join('')}
      </datalist></label>
    ${/* The date is editable because the feed is ORDERED by it. A post that arrived in the folder
          with the wrong timestamp sits in the wrong place for ever otherwise, and the only way to
          fix it was to open the spreadsheet. */''}
    <label class="field"><span>posted on</span>
      <input id="pe-when" value="${esc(p.when || '')}" placeholder="DD/MM/YYYY HH:MM:SS"></label>
    ${/* A VOTE IS STORED AGAINST THE WORDS. Rename an option and every vote cast for it points at
          something that no longer exists — the count survives, its option does not, and the
          percentages quietly stop adding up. Nothing throws, which is the worst version of it. So
          the options are editable only while nobody has voted. */''}
    <label class="field"><span>poll</span>
      <input id="pe-poll" value="${esc(opts)}" placeholder="Yes, No, Maybe" ${voted ? 'disabled' : ''}>
      ${voted ? `<span class="faint">${p.poll.total} vote${p.poll.total === 1 ? '' : 's'} cast —
        the options are fixed now. A vote is stored against the words, so changing them would
        strand it.</span>` : ''}</label>

    <label class="check">
      <input type="checkbox" id="pe-pin" ${p.pinned ? 'checked' : ''}>
      <span class="box"></span>
      <span>Pin to the top<br><span class="faint">Above everything, whatever its date.</span></span>
    </label>

    <button class="btn" data-do="post-save" data-id="${esc(p.id)}">Save</button>
    <div class="btn-row" style="margin-top:.5rem">
      <button class="btn danger" data-do="post-delete"
              data-id="${esc(p.id)}" data-on="${p.active === false ? '1' : ''}">
        ${p.active === false ? 'Restore' : 'Delete'}</button>
    </div>
    <p class="faint" id="pe-said" style="margin:.6rem 0 0">
      Deleting switches it off — the picture stays in Drive and the likes stay counted.</p>`);
});

on('post-save', el => {
  const v = id => (($(id) || {}).value || '').trim();
  const said = $('pe-said');
  const p = (DATA.posts || []).find(x => x.id === el.dataset.id);
  const voted = !!(p && p.poll && p.poll.total);

  /* A date typed into the wrong shape sorts the post to the bottom of the feed and gives no hint
     why. Checked here, where it can still be corrected. */
  if (v('pe-when') && !parseWhen(v('pe-when'))) {
    if (said) said.textContent = 'That date is not DD/MM/YYYY.';
    return;
  }

  const fields = {
    caption: v('pe-cap'), body: v('pe-body'), location: v('pe-loc'),
    posted_on: v('pe-when'), pinned: ($('pe-pin') || {}).checked,
  };
  /* Left out ENTIRELY rather than sent unchanged — the server tests whether the field was sent at
     all, and sending it back identical would still count as an attempt to change it. */
  if (!voted) fields.poll = v('pe-poll');

  el.disabled = true;
  if (said) said.textContent = 'Saving…';
  api({ action: 'editPost',
    name: USER.name, adminName: USER.name, id: el.dataset.id, fields })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet(); toast('Saved'); load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not save that');
    });
});

/* TWO PRESSES. Not a browser confirm() — it is the one dialogue on a phone that looks like the
   page has been taken over by something else, and it cannot say what is about to happen in the
   words this app uses. The button becomes the question, and a press somewhere else leaves it as
   it was. */
on('post-delete', el => {
  const restoring = !!el.dataset.on;
  if (!el.dataset.sure && !restoring) {
    el.dataset.sure = '1';
    el.textContent = 'Really delete?';
    setTimeout(() => { if (el.dataset.sure) { delete el.dataset.sure; el.textContent = 'Delete'; } }, 4000);
    return;
  }
  const said = $('pe-said');
  el.disabled = true;
  if (said) said.textContent = restoring ? 'Restoring…' : 'Deleting…';

  api({ action: 'deletePost',
    name: USER.name, adminName: USER.name, id: el.dataset.id, on: restoring })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet();
      toast(restoring ? 'Back on the feed' : 'Deleted — still there, switched off');
      load();
    })
    .catch(err => {
      el.disabled = false; delete el.dataset.sure;
      el.textContent = restoring ? 'Restore' : 'Delete';
      if (said) said.textContent = String(err.message || 'Could not do that');
    });
});

/* The sync. Files dropped into the folder from a computer are not posts until something notices
   them — this is that something, and without it the folder and the tab drift apart the first time
   somebody uploads outside the app. */
on('scan-posts', () => {
  toast('Looking in the folder…');
  api({ action: 'scanPosts',
    name: USER.name, adminName: USER.name })
    .then(d => {
      if (d && d.error) { toast(d.error); return; }

      /* EVERYTHING THE SCAN CAN CHANGE, not just what it added.
         This asked `d.added || d.dated` — so a run that took ten captions off ten filenames and
         added nothing fell through to the "Nothing to add" report below, which never reloads. The
         captions went into the sheet and the screen went on showing the old payload, which looks
         exactly like the captions not working. `recaptioned` is a third thing it can do and was
         the only one nobody was asking about. */
      const did = [
        d.added       ? d.added + ' new post' + (d.added === 1 ? '' : 's') : '',
        d.dated       ? d.dated + ' date' + (d.dated === 1 ? '' : 's') + ' filled in' : '',
        d.recaptioned ? d.recaptioned + ' caption' + (d.recaptioned === 1 ? '' : 's')
                        + ' from the file name' : '',
      ].filter(Boolean);

      if (did.length) {
        toast(did.join(', '));
        /* The payload is refetched, or nothing on screen changes. A write nobody can see is
           indistinguishable from a write that did not happen. */
        load();
        return;
      }

      /* NOTHING ADDED. A toast saying "nothing found" leaves you with no way to tell a folder in
         the wrong place from a folder full of shortcuts, so the whole report is shown instead —
         which folder it opened, how many it looked in, and what it skipped and why. */
      openSheet('Nothing changed', `
        <div class="row"><span class="k">Folder</span>
          <span class="v">${esc(d.folder || 'unknown')}</span></div>
        <div class="row"><span class="k">Folders looked in</span>
          <span class="v mono">${d.looked || 1}</span></div>
        <div class="row"><span class="k">Files seen</span>
          <span class="v mono">${(d.seen || []).length}</span></div>
        ${(d.seen || []).length
          /* "What it skipped" was a lie about half of these lines: a file that is already a post
             with the right caption was not skipped, it was checked and found to be correct. A
             heading that misdescribes the list under it is worse than no heading, because it tells
             you to stop reading. */
          ? `<h2>Every file it looked at</h2>` + (d.seen || []).map(x =>
              `<p class="faint" style="margin:.2rem 0">${esc(x)}</p>`).join('')
          : `<p class="note" style="margin-top:.8rem">The folder opened, and there was nothing in
               it at all.<br><br>
               <span class="faint">Most likely: the id in <code>posts_folder</code> points at a
               different folder from the one with the pictures — an easy thing to do if you have
               more than one open.</span></p>`}`);
    })
    .catch(() => toast('Could not reach the server.'));
});

/* ---------- LINK LIBRARY ------------------------------------------------------------------------
   Tiles, in a grid — the one place a grid is right, because a link is a destination rather than a
   thing to read, and a wall of them is faster to scan than a list.
   The shape says what kind it is, which is why the categories no longer need headings.
--------------------------------------------------------------------------------------------- */
const LINK_SHAPE = [
  { is: /^apps?$|^applications?$/,          cls: 'sq'   },
  { is: /^games?$|^gaming$|^arcade$/,       cls: 'cart' },
  { is: /^books?$|^reading$|^ebooks?$/,     cls: 'book' },
  { is: /^downloads?$|^files?$|^software$/, cls: 'dl'   },
  { is: /^videos?$|^watch$|^film$/,         cls: 'tape' },
];

const NAMED_COLOURS = {
  green:'#25d366', red:'#e23b3b', blue:'#2b6cd4', navy:'#1b3a6b', sky:'#3aa8e0',
  teal:'#2a9d8f', purple:'#7d4bc3', pink:'#e05a9a', orange:'#f07f2c', amber:'#f2b134',
  yellow:'#e8c33a', lime:'#7cb342', brown:'#8a5a3c', grey:'#6b6b6b', black:'#2b2b2b',
};

/* The Library SCREEN is gone with its tab — every link is a card on Find, searchable and
   filterable, which the tile wall never was. `libraryTiles` and `libraryPages` went with it. */
/* ================================================================================================
   AVATARS.

   Carried over whole from the burned file, geometry untouched. This is the one part of that
   rewrite that could not be rebuilt from the backend: hermes holds the CATALOGUE — which items
   exist, what each costs, who may wear it — and this holds the SHAPES. `art_id` is the join
   between them, which is why an item can be renamed in the sheet without changing what it looks
   like: they are different questions.

   The split is deliberate and worth keeping. The browser has to hold the whole set of drawings in
   order to show a wardrobe, and it must hold no authority at all over who may wear what — a
   student with the developer tools open can equip anything they like here, and the server will
   refuse it.

   Deliberately ORIGINAL geometry. A famous toy figure's proportions and head are protected as
   trade dress, and "similar but changed a bit" is precisely what that protection covers. This is
   a simple round-headed blocky character of its own — nothing traced, nothing to credit.
================================================================================================ */
const AV_SKIN  = ['#f3c9a0', '#e0a878', '#c58a5b', '#8d5a3b', '#5f3a25', '#ffd9b3'];
const AV_HAIR  = ['#2b2118', '#5a3a1d', '#a8621f', '#d9b45a', '#8a8a8a', '#3a2a4a', '#7a2a2a'];
/* Colours are FREE — a palette, not a catalogue. The same eight serve shirts and hair, so a
   student can match them without either being something they had to buy. Selling colours would
   have been eight cards for one object. */
const AV_SHIRT = ['#f4f4f2', '#2f6b3f', '#1f5f8a', '#8a3a3a',
                  '#6b4d8a', '#c07a1f', '#3d4b57', '#2f6b6b'];

const AV_ART = {
  /* Hairstyles. Each covers the crown and comes DOWN the sides — the head is a 20x20 box from
     y=12, so hair starting lower than that reads as a headband, which is what the first attempt
     looked like. */
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

/* The six slots, in the order they read on a wardrobe — top of the head downwards, which is how
   anybody describes what somebody is wearing. */
const AV_SLOTS = [['hair', 'Hairstyle'], ['headwear', 'Headwear'], ['faceware', 'Face'],
                  ['shoulders', 'Shoulders'], ['handheld', 'Holding'], ['legs', 'Legs']];

/** Just the item, cropped to itself. What a shop card shows. */
function itemArt(slot, id, size) {
  const fn = (AV_ART[slot] || {})[id];
  if (!fn) return '';
  // A neutral colour: shown off the figure, there is no shirt or hair to inherit from.
  const art = fn('#5b6470');
  return `<svg class="av-item" viewBox="${AV_CROP[slot] || '0 0 48 56'}"
    width="${size || 64}" height="${size || 64}" aria-hidden="true">${art}</svg>`;
}

/** Read a stored avatar string — "skin:2|headwear:cap" — into an object. */
function avatarConfig(packed, handle) {
  /* No choices made yet: the HASH picks a starting look, so a new student has a face rather than
     a blank. Seeded by their handle, so it is theirs and never changes on its own. */
  const h = hashOf(String(handle || '?'));
  const cfg = {
    skin: (h >>> 0) % AV_SKIN.length,
    hairColour: (h >>> 5) % AV_HAIR.length,
    shirt: 0,
    hair: 'crop', headwear: 'none', faceware: 'none',
    shoulders: 'none', handheld: 'none', legs: 'plain',
  };
  String(packed || '').split('|').forEach(pair => {
    const [k, v] = pair.split(':');
    if (!k || v === undefined) return;
    cfg[k] = /^\d+$/.test(v) ? Number(v) : v;
  });
  return cfg;
}

/** An <svg> figure for a person. Layer order is the drawing order, and it is the whole trick:
    shoulders behind the head, hair over the head, headwear over the hair, held things in front. */
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

  return `<svg class="avatar" viewBox="0 0 48 60" width="${s}" height="${Math.round(s * 60 / 48)}"
      aria-hidden="true">
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

/** Ten ticked topics is one level. Whole levels only — a fraction of a level is not a thing you
    can have, and "level 3.5" beside an item unlocking at 4 reads as nearly there when it is not. */
const levelFromXp = xp => Math.floor((Number(xp) || 0) / 10);

/**
 * EVERY WEARABLE, AND WHETHER IT IS YOURS.
 *
 * The backend sends `avatarItems` — its own answer, and the only one that counts. This falls back
 * to deriving the list from the shop rows and the drawings when it hasn't arrived, so a wardrobe
 * still appears on an older payload; what it must never do is decide anybody's unlocks, because
 * a student with the developer tools open can edit whatever this returns.
 */
function wardrobe() {
  const sent = (USER && USER.avatarItems) || DATA.avatarItems;
  if (sent && sent.length) return sent;

  const level = levelFromXp(USER && USER.xp);
  const shop = {};
  (DATA.shop || []).forEach(x => {
    if (isWearable(x) && x.slot && x.artId) shop[x.slot + ':' + x.artId] = x;
  });
  const out = [];
  AV_SLOTS.forEach(([slot]) => {
    Object.keys(AV_ART[slot] || {}).forEach(id => {
      const row = shop[slot + ':' + id];
      const cost = row ? Number(row.price) || 0 : 0;
      const need = row ? Number(row.level) || 0 : 0;
      /* Nothing, a crop and plain legs are what everybody starts with — they are the absence of an
         item rather than an item, so they can never be locked. */
      const free = !row || (!cost && !need) || id === 'none' || id === 'crop' || id === 'plain';
      out.push({ slot, id, name: row ? row.name : id, cost, level: need,
                 unlocked: free || (need && level >= need) });
    });
  });
  return out;
}

/* ---------- SHOP & RESOURCES --------------------------------------------------------------------
   Two lists that belong together because both are things you GET — one for credits, one for free,
   which is a smaller difference than either has with anything else in the app.

   With four hundred resources this is the one screen that genuinely needs finding tools. Four of
   them, and they do different jobs — which is why all four are here rather than one clever one:

     SEARCH   I know what it is called
     FILTER   show me only this kind
     GROUP    lay it out by subject, or by grade
     SORT     put the ones I want first

   THE CONTROLS ARE NOT REDRAWN WHEN THE LIST IS. Only `#stuff-list` is rewritten, so an open
   dropdown is never destroyed mid-choice and the search box never loses focus or caret — which is
   what the refocus hack under the old input handler existed to paper over.
--------------------------------------------------------------------------------------------- */
/* FILTERS YOU ADD, not a mode you pick.

   One dropdown could only ever ask one question: shop only, OR Maths, OR things you can afford —
   never Maths AND Grade 9 AND resources, which is the question somebody actually has. So a filter
   is a thing you add to a list, and the list is what narrows the results.

   TWO RULES, and they are the ones every filter list uses because they are the ones people mean:
     · SAME field  → either. Adding Physics after Maths shows both, because nobody adds a second
                     subject in order to see fewer things.
     · OTHER field → both. Maths and Grade 9 is Maths at Grade 9.

   Each one is a chip you can take off, so nothing can be narrowing the list without saying so —
   which is the failure of a dropdown you set three screens ago and forgot about. */
const STUFF = { q: '', sort: 'name', filters: [] };

/* The fields a filter can be ON, what each is called, and where its values come from. One table,
   so adding a way to filter is a row here and nothing else — the picker, the matching and the
   chip label all read it. */
/* ---------- ONE QUESTION AT A TIME ----------------------------------------------------------------
   Eleven filters as eleven controls is a form, and a form is the opposite of finding something.

   They are not eleven independent questions. Key stage decides band value. Tier only exists for
   some subjects at some levels. Exam wave contains the year. Board and company are near enough the
   same fact that one sheet row says Edexcel and Pearson. Asked all at once they are a wall; asked
   in order they collapse into two or three.

   SO: ONE RULE, AND EVERYTHING FOLLOWS FROM IT — only ever offer a filter that would change what
   you see. If everything left is Edexcel, do not ask about the board. If nothing left has a tier,
   do not ask about tier. That is not a guess about what people want; it is a fact about the
   remaining set, worked out again after every tap.

   Finding a past paper becomes: Maths → KS4 → Edexcel → Past paper. Four taps, one short list at a
   time, each shorter than the last because the one before it narrowed things.

   THE ORDER IS FIXED, and deliberately so. It mirrors how somebody actually asks — what sort of
   thing, what subject, what level, whose paper, what kind of paper — and a page that reorders
   itself is a page you have to read every time instead of reaching for.
--------------------------------------------------------------------------------------------- */
const FACETS = [
  /* What sort of thing, first. It is the one question that changes which of the others make any
     sense at all — a wearable has a slot and no exam board, a paper the reverse. */
  /* WHAT FOR, before what kind.
     A tutor, a venue and a subject are three answers to one question — who, where and what — and
     nobody assembling a session thinks of them as three different sorts of thing. They are the
     things you BOOK. Grouping them says so, and it takes the first question from nine answers to
     four, which is the difference between a menu and a choice.
     Derived, not stored: what a thing is for follows from what it IS, so there is no column for
     this and nothing to keep in step. And `kindLabel` below still asks which one — except where
     the group holds only one kind, in which case the one-answer rule skips it and choosing
     Learning takes you straight to the resources. */
  { field: 'forLabel',  label: 'What for',    of: x =>
      (x.kind === 'tutor' || x.kind === 'venue' || x.kind === 'subject') ? 'Booking'
    : x.kind === 'friend'                                                  ? 'Friends'
    : (x.kind === 'topic' || x.kind === 'link')                          ? 'Learning'
    : (x.kind === 'tool' || x.kind === 'game')                           ? 'Tools & games'
    :                                                                      'Shop' },
  { field: 'kindLabel', label: 'What kind',   of: x =>
      x.kind === 'tutor'   ? 'Tutors'
    : x.kind === 'venue'   ? 'Venues'
    : x.kind === 'subject' ? 'Subjects'
    : x.kind === 'friend'  ? 'Friends'
    : x.kind === 'link'    ? 'Links'
    : x.kind === 'tool'    ? 'Tools'
    : x.kind === 'game'    ? 'Games'
    : x.wearable           ? 'Wearables'
    : x.kind === 'shop'    ? 'Things'
    :                        'Resources' },
  /* Only venues have one, so it is only ever asked once you are looking at venues — which is the
     coverage rule doing the work that a per-kind filter list would otherwise have to. */
  { field: 'borough',   label: 'Where',       of: x => x.borough || '' },
  /* Only links have one, so it is only ever asked once you are looking at links — the coverage
     rule again, doing what a per-kind filter list would otherwise need code for. */
  { field: 'category',  label: 'Category',    of: x => x.category || '' },
  { field: 'subject',   label: 'Subject',     of: x => x.subject },
  /* THIRD, and it was seventh. An exercise and a past paper are different ERRANDS — somebody
     revising and somebody sitting a mock are not looking for the same thing — so it is the
     question that most changes what should come next. 412 of 417 rows can answer it, which is
     the other half of what makes a good early question. */
  { field: 'resourceType', label: 'Type',     of: x => x.resourceType },
  { field: 'keystage',  label: 'Key stage',   of: x => x.keystage },
  { field: 'bandValue', label: 'Grade',       of: x => x.bandValue && x.bandType === 'grade'
                                                    ? 'Grade ' + x.bandValue : '' },
  { field: 'stage',     label: 'Stage',       of: x => x.bandValue && x.bandType === 'stage'
                                                    ? x.bandValue : '' },
  { field: 'examBoard', label: 'Exam board',  of: x => x.examBoard },
  { field: 'tier',      label: 'Tier',        of: x => x.tier },
  { field: 'examWave',  label: 'Exam wave',   of: x => x.examWave },
  /* Through `yearOf`, so a paper whose year lives only inside "June 2024" is filterable by year
     without anybody having to type it into a second column to make the filter work. */
  { field: 'year',      label: 'Year',        of: x => yearOf(x) },
  { field: 'company',   label: 'Company',     of: x => x.company },
  /* A yes-or-no, phrased as the two answers rather than as the question. "Printed / Digital" is a
     choice; "Print required: true" is a database column somebody left showing. */
  { field: 'paper',     label: 'Printed?',    of: x => x.paper ? 'Printed' : 'Digital' },
  { field: 'slot',      label: 'Goes on',     of: x => x.slot },
  /* Last, because it is the one somebody asks when they already know what they want. */
  { field: 'afford',    label: 'Price',       of: x => x.cost === 0 ? 'Free'
                                                    : x.cost <= (USER ? USER.credits || 0 : 0)
                                                      ? 'Can afford' : '' },
];

const facetBy = f => FACETS.find(x => x.field === f);

/** Does one item satisfy one chosen filter? One comparison, because a facet says how to read
    itself — the old version had a switch with a case per field, which is a place to forget one. */
function filterHit(x, f) {
  const facet = facetBy(f.field);
  if (!facet) return true;
  return norm(facet.of(x)) === norm(f.value);
}

/** The distinct values of one facet across a set, with how many each would leave. */
function facetValues(items, facet) {
  const by = {};
  items.forEach(x => {
    const v = String(facet.of(x) ?? '').trim();
    if (!v) return;                       // blank is not an answer, so it is never offered
    by[v] = (by[v] || 0) + 1;
  });
  return Object.keys(by).sort(cmpText).map(v => ({ value: v, n: by[v] }));
}

/* HOW MANY OF THESE COULD EVEN ANSWER IT. Not how many distinct answers there are — how many
   items have one at all. */
function facetCoverage(items, facet) {
  if (!items.length) return 0;
  let n = 0;
  items.forEach(x => { if (String(facet.of(x) ?? '').trim()) n++; });
  return n / items.length;
}

/* HOW MUCH OF THE SET A QUESTION HAS TO COVER BEFORE IT IS WORTH ASKING. */
const FACET_COVERAGE = 0.5;

/**
 * THE NEXT QUESTION WORTH ASKING, or nothing.
 *
 * Three reasons to skip one, and the third is the one that matters:
 *
 * ALREADY ANSWERED. Obvious.
 *
 * EVERYTHING AGREES. A list with one entry is a tap that changes nothing, and three of those in a
 * row is what makes a filter feel like paperwork.
 *
 * MOST OF THEM CANNOT ANSWER IT. This is not about usefulness — it is about damage. Choosing a
 * value excludes every item with NO value for that field, and it does so silently: they do not
 * fail to match, they were never asked. On this library `exam_board` is filled on 26% of rows and
 * on 3% of past papers, so offering it and having somebody tap "Edexcel" takes them from four
 * hundred resources to a hundred and seven, with three hundred and eight vanishing for a reason no
 * screen mentions. That is not a filter, it is a trapdoor.
 *
 * Half is the line. Below it, a question is doing more harm by being asked than good by being
 * answered — and the rule is SELF-CORRECTING, which is what makes it better than reordering: once
 * you have narrowed to the rows that do carry a board, its coverage rises and it starts being
 * offered. The sparse questions arrive exactly when they stop being sparse.
 */
function nextFacet(items) {
  const asked = STUFF.filters.map(f => f.field);
  for (const facet of FACETS) {
    if (asked.indexOf(facet.field) !== -1) continue;
    if (facetValues(items, facet).length < 2) continue;
    if (facetCoverage(items, facet) < FACET_COVERAGE) continue;
    return facet;
  }
  return null;
}

/* THE RESOURCES, flattened out of where the payload actually puts them.

   `DATA.resources` does not exist — I had been reading a key nothing sends, which is why the
   section was empty. They live nested in `dropdowns.checklists`, keyed by subject and then by
   band, because that is the shape the checklist needs them in.

   Flattened here rather than changed at the source: the checklist wants them nested and this wants
   them flat, and a payload that carries the same four hundred rows twice to satisfy both would be
   a waste of every phone's morning. */
/* WALKED ONCE PER PAYLOAD, not once per caller.
   Four hundred resources live three levels deep in `dropdowns.checklists`, and eight different
   things ask for them flat — the shop list, the wardrobe, the checklist, `topicBy` twice in one
   lookup. Each call rebuilt all four hundred objects. Cached against the payload itself, so it is
   rebuilt exactly when the data changes and never otherwise. */
let TOPICS_MEMO = { from: null, list: null };

function allTopics() {
  const by = (DATA.dropdowns || {}).checklists || {};
  /* Keyed on the object IDENTITY of the payload's own branch. A new payload is a new object, so
     this cannot go stale — and it costs one comparison rather than hashing four hundred rows. */
  if (TOPICS_MEMO.from === by) return TOPICS_MEMO.list;
  const out = [];
  Object.keys(by).forEach(subject => {
    Object.keys(by[subject] || {}).forEach(band => {
      ((by[subject][band] || {}).topics || []).forEach(t => {
        out.push({
          /* THE ID IS THE POINT. A name is not a name — two subjects can both have "Quadratics",
             and every lookup here takes the first match. Reading the wrong one is invisible;
             deleting the wrong one is not. */
          id: t.id || '', name: t.name, subject, grade: t.grade || band, link: t.link,
          type: t.resourceType, board: t.examBoard, image: t.image,
          /* EVERY QUESTION THE FUNNEL CAN ASK. They have been in the payload since the fields
             were added and stopped here — flattened into six of twenty, because the checklist
             only needed six. A facet nothing carries is a facet that silently offers nothing. */
          bandType: t.bandType || '', bandValue: t.bandValue || band,
          keystage: t.keystage || '', tier: t.tier || '',
          examBoard: t.examBoard || '', company: t.company || '',
          resourceType: t.resourceType || '', examWave: t.examWave || '',
          year: t.year || '', paper: !!t.paper,
          pages: Number(t.pages) || 0, printable: t.printable,
          active: t.active !== false,
          /* THE THREE TICKS. Each is the comma-separated list of everybody who has done that pass
             — the count is its length, and whether it is YOURS is whether your handle is in it.
             Carried whole rather than as a boolean, because the same payload serves a tutor
             looking at who has done what and a student looking at their own row. */
          trackable: t.trackable !== false,
          rowIndex: t.rowIndex || 0,
          ticks: [t.tick1 || '', t.tick2 || '', t.tick3 || ''],
        });
      });
    });
  });
  TOPICS_MEMO = { from: by, list: out };
  return out;
}

/* By id, always. The name lookup is what remains for a row written before ids existed, and it is
   the one that picks the wrong "Quadratics" — so it is the fallback and not the rule. */
const topicBy = key => {
  const list = allTopics();
  return list.find(x => x.id && x.id === key)
      || list.find(x => norm(x.name) === norm(key)) || null;
};

/* WHAT A PRINTED COPY COSTS. Paper and toner, at the rate in the sheet — no multipliers, no
   discounts. This is the one price in the app that is not tuition and does not behave like it.

   NO PAGE COUNT, NO PRICE. Zero pages means nobody has counted this one yet, and pricing it at
   £0.00 would be the site answering a question it has not asked anybody. It returns null, and null
   is rendered as a sentence rather than as a number. */
function printPrice(pages) {
  const n = Number(pages) || 0;
  if (n <= 0) return null;
  const v = (DATA.constants || {}).vars || {};
  const rate = num(v.print_rate_per_page);
  if (isNaN(rate) || rate <= 0) return null;      // rate not set: printing is off, not free
  const min = num(v.print_minimum) || 0;
  return Math.max(min, Math.round(n * rate * 100) / 100);
}

/* Whether a printed copy is offered at all. An explicit FALSE in the sheet wins over any page
   count — countable and worth printing are different questions, and a 400-page textbook answers
   the first one yes. */
function canPrint(t) {
  const flag = String(t.printable ?? '').trim().toLowerCase();
  if (flag === 'false' || flag === 'no') return false;
  return printPrice(t.pages) !== null;
}

/* ---------- THREE PASSES ------------------------------------------------------------------------
   A tick is stored as a NAME in a list rather than as a number, which is what makes it possible to
   ask "who has done this" as well as "have I" — and what stops one person counting twice.

   Three of them, because doing something once and doing it three times spaced out are different
   facts and a single checkbox can only record the first. They are INDEPENDENT: ticking the third
   does not fill the first two, which would be the app deciding you had done two passes you never
   told it about, and would send three writes for one tap.
--------------------------------------------------------------------------------------------- */
function myTicks(t) {
  const me = norm(USER && (USER.handle || USER.name));
  if (!me) return [false, false, false];
  return (t.ticks || ['', '', '']).map(list =>
    String(list).split(',').map(x => norm(x)).some(h => h && h === me));
}

/* Nothing is drawn for a resource marked untrackable, or for somebody signed out. A row of dead
   boxes on four hundred cards is four hundred things to read past, and a control that cannot be
   pressed teaches nobody that signing in would make it work. */
function tickRow(t) {
  if (!USER || !t.trackable) return '';
  const mine = myTicks(t);
  const done = mine.filter(Boolean).length;
  return `<div class="ticks" data-do="ticks">
    <span class="faint tick-said">${
      done === 0 ? '' : done === 1 ? 'once' : done === 2 ? 'twice' : 'all three'}</span>
    ${/* PLAIN BOXES. They were numbered 1, 2, 3 — the pass each one recorded — and a number
          inside a checkbox reads as a quantity or a rank rather than as a thing you tick. The
          count in words at the other end of the row already says how many, which is the only part
          anybody needed the numbers for.
          Still INDEPENDENT underneath: ticking the third does not fill the first two. Three empty
          boxes invite being filled left to right and that is fine — it is what most people will
          do — but the app must not decide it on their behalf. */''}
    ${[0, 1, 2].map(i => `
      <label class="tick${mine[i] ? ' on' : ''}"
             title="pass ${i + 1}" aria-label="pass ${i + 1}">
        <input type="checkbox" data-do="tick"
               data-key="${esc(t.id || t.name)}" data-n="${i + 1}"
               ${mine[i] ? 'checked' : ''}>
        <span class="tick-box"></span>
      </label>`).join('')}
  </div>`;
}

/* A tap on the tick ROW that is not on a box. The row sits inside a card whose whole surface opens
   a sheet, so without this half the taps aimed at a checkbox would walk up to the card and open a
   panel instead. Registered to do nothing, which is exactly right. */
on('ticks', () => {});

on('tick', el => {
  if (!USER) { toast('Sign in to keep a checklist'); go('me'); return; }
  const t = topicBy(el.dataset.key);
  if (!t) return;
  const n = Number(el.dataset.n);
  const checked = !!el.checked;
  const me = USER.handle || USER.name;

  /* Edited in place, so a second tap reads the new state rather than the loaded one — the same
     read-after-write problem the backend's setCell exists to solve, one layer up. */
  const before = (t.ticks || []).slice();
  const list = String(t.ticks[n - 1] || '').split(',').map(x => x.trim()).filter(Boolean);
  const has = list.some(h => norm(h) === norm(me));
  if (checked && !has) list.push(me);
  if (!checked && has) list.splice(list.findIndex(h => norm(h) === norm(me)), 1);
  t.ticks[n - 1] = list.join(', ');
  el.closest('.tick')?.classList.toggle('on', checked);

  api({ action: 'toggleTopicTick',
    name: USER.name, handle: me, id: t.id, rowIndex: t.rowIndex, tick: n, checked })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      /* XP AND CREDITS MOVE WITH IT — a tick is worth one of each, which is what the wardrobe is
         priced against. Taken from the server rather than guessed: two devices ticking at once
         would each add one to their own stale copy and both be wrong. */
      if (typeof d.xp === 'number') USER.xp = d.xp;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      paintStuff();
    })
    .catch(err => {
      t.ticks = before;
      el.checked = !checked;
      el.closest('.tick')?.classList.toggle('on', !checked);
      toast(String(err.message || 'Could not save that tick'));
    });
});

/* The rate as a number of pence, for the line that spells the sum out. */
const printRatePence = () => {
  const r = num(((DATA.constants || {}).vars || {}).print_rate_per_page);
  return isNaN(r) ? 0 : Math.round(r * 100);
};

/* One list, so the four controls act on everything rather than on one half — a filter that
   silently ignores the shop is a filter nobody trusts twice.

   The RAW fields are kept on each item rather than a pre-computed group label. Grouping is a
   question asked at draw time; baking the answer in meant changing the dropdown could not change
   the shop items, because their label had already been decided. */
function stuffItems() {
  return [
    /* ---------- PEOPLE, PLACES AND SUBJECTS -----------------------------------------------------
       Find and Stuff were two tabs asking the same question — where is the thing I want — split by
       a distinction nobody makes while looking: people and places on one, objects on the other.
       Somebody who wants Maths does not know whether they need a tutor, a venue, a subject page or
       a past paper, and being made to guess which tab holds it is the whole problem.

       They can be one list now because the funnel skips a question most of the set cannot answer.
       That was the objection to merging and it is answered: choose Tutors and you will never be
       asked about exam boards, because a tutor has none and the coverage rule sees it. */
    ...(DATA.tutors || []).filter(t => t.title).map(t => ({
      kind: 'tutor', name: t.title, key: t.title, sub: t.subtitle || '', image: t.image,
      cost: Number(t.rate) || 0, slot: '', subject: '', grade: '', off: t.listed === false,
      row: t,
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
    })),
    ...(DATA.venues || []).filter(v => v.title).map(v => ({
      kind: 'venue', name: v.title, key: v.title, sub: v.subtitle || '', image: v.image,
      cost: Number(v.bestRate) || 0, slot: '', subject: '', grade: '', off: false,
      row: v, borough: v.borough || v.city || '',
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
    })),
    /* A LINK IS A THING YOU ARE LOOKING FOR TOO. It lives on its own tab as a wall of tiles —
       which is the right way to SCAN ninety of them — and it was reachable no other way, so
       somebody who half-remembers "that BBC one" had to know which tab to go to before they could
       search for it. Here it is searchable and filterable like everything else. */
    /* The nine widgets, findable like everything else. Searching "timer" now finds the timer,
       which on a tab it never could. */
    ...WIDGETS.map(wgt => ({
      kind: wgt.kind, name: wgt.name, key: 'w:' + wgt.id, sub: '', image: '',
      cost: 0, slot: '', subject: '', grade: '', off: false, row: wgt,
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
    })),
    /* FRIENDS. People are found on the Find tab like everything else — they were a card on You,
       which made them a setting about yourself rather than a set of people you can look through.
       Only somebody who has a checklist and a score has any: a parent has no scoreboard to compare
       and no reason to collect handles. */
    ...(canTrack() ? friendHandles().map(h => {
      const s2 = (DATA.students || []).find(x => norm(x.handle) === norm(h)) || {};
      return {
        kind: 'friend', name: s2.name || h, key: 'friend:' + h, sub: h, image: '',
        cost: 0, slot: '', subject: '', grade: '', off: false, row: Object.assign({ handle: h }, s2),
        bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
        resourceType: '', examWave: '', year: '', paper: false,
      };
    }) : []),
    ...(DATA.links || []).filter(l => l.title).map(l => ({
      kind: 'link', name: l.title, key: 'link:' + l.title, sub: '', image: '',
      cost: 0, slot: '', subject: '', grade: '', off: false, row: l,
      category: l.category || '',
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
    })),
    ...(typeof subjectRows === 'function' ? subjectRows() : []).map(x => ({
      kind: 'subject', name: x.name, key: x.name, sub: '', image: '',
      cost: 0, slot: '', subject: x.name, grade: '', off: false, row: x,
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
    })),
    /* `name` and `price`, which is what the payload actually calls them. I had written `title`
       and `cost` — so every shop item drew with no name and a price of zero. */
    ...(DATA.shop || []).map(x => ({
      kind: 'shop', name: x.name, key: x.name, sub: x.description || '', image: x.image,
      cost: Number(x.price) || 0, slot: x.slot || '', subject: '', grade: '', off: false,
      /* Blank on a shop row, and blank is what makes the funnel skip them: a facet whose values
         are all empty is never offered, so choosing Wearables never shows an exam board. */
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
      /* WHETHER IT IS A WEARABLE, AND WHAT IT COSTS TO REACH.
         A wearable is priced in one of two currencies and the card only ever read one of them: a
         level-gated item has a price of zero, which was being drawn as "free" — an item saying
         free that cannot be taken is worse than one saying nothing, because somebody presses it. */
      wearable: isWearable(x),
      level: Number(x.level) || 0,
      artId: x.artId || '',
    })),
    /* A resource costs nothing, and the zero is written here rather than left undefined — so
       every sort, filter and label downstream sees a number and not a hole. */
    ...allTopics()
      /* A deleted resource is still on the screen for an admin, greyed. It has to be: something
         invisible cannot be put back, which is the whole reason the tutor switch works this way. */
      .filter(x => x.active || isAdmin())
      .map(x => ({
        kind: 'topic', name: x.name, key: x.id || x.name, sub: x.subject || '', image: x.image,
        cost: 0, slot: '', subject: x.subject || '', grade: x.grade || '', off: !x.active,
        /* Straight through onto the flat item, so one funnel can ask one question of a past paper
           and a beanie without knowing which it has. */
        bandType: x.bandType, bandValue: x.bandValue, keystage: x.keystage, tier: x.tier,
        examBoard: x.examBoard, company: x.company, resourceType: x.resourceType,
        examWave: x.examWave, year: x.year, paper: x.paper,
        /* The topic itself rides along, so the card can draw its ticks without looking it up
           again — a lookup per card is four hundred scans of four hundred rows to draw a list. */
        topic: x,
      })),
  ];
}

/**
 * THE YEAR OF A THING, from the column or from the wave.
 *
 * `year` is its own column because a filter wants the year on its own — "June 2024" and
 * "November 2024" are two waves and one year, and bucketing by wave gives a facet with an entry
 * per sitting. But a wave already contains the year, and asking somebody to type 2024 into a
 * second cell to make the filter work is asking them to keep two facts in step by hand.
 *
 * So: the column when it is filled, and the four digits out of the wave when it is not.
 */
function yearOf(x) {
  const own = String((x && x.year) || '').trim();
  if (own) return own;
  const m = String((x && x.examWave) || '').match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : '';
}

/* Numeric-aware, so Grade 2 comes before Grade 10. Plain alphabetical put Grade 10 first, and that
   reads as the list being unsorted rather than sorted by a rule nobody wanted. */
const cmpText = (a, b) =>
  String(a).localeCompare(String(b), 'en', { sensitivity: 'base', numeric: true });

/**
 * THE SORTS WORTH OFFERING, for what is actually on screen.
 *
 * A–Z always. "Cheapest" only when something costs — with four hundred free resources it sorted
 * nothing and took up a third of the row. "Newest" only when anything carries a year.
 *
 * The same rule as the funnel: a control that cannot change what you see is a control that teaches
 * people the controls do not do anything.
 */
function sortsWorthOffering() {
  const items = stuffFiltered();
  const out = [['name', 'A–Z']];
  if (items.some(x => x.cost > 0)) out.push(['cost', 'Cheapest']);
  if (items.some(x => yearOf(x))) out.push(['year', 'Newest']);
  return out;
}

/* NO HEADINGS AT ALL, and no grouping behind them.

   It went in stages, and each stage removed a reason for the next. The dropdown went because the
   funnel asked the same question better. Then the headings followed the funnel automatically —
   which was neat, and still bought nothing: by the time you have answered two questions there are
   a handful of cards on a page, and a heading over four things names what all four already say on
   their own second line.

   What is left is a list. The funnel says what you asked for, the count says how many, and the
   cards say what they are. Three things, none of them repeating another.
--------------------------------------------------------------------------------------------- */

/* Every word must appear SOMEWHERE — so "maths 7" finds a Grade 7 Maths topic without the two
   words having to sit next to each other. Searching only the name and the group label missed a
   shop item by its description, which is the thing that actually says what it is. */
function stuffFind(items, credits) {
  let out = items;

  /* THE TWO RULES, in four lines. Filters are grouped by field, and an item must satisfy at least
     one from EVERY group — `some` within a field, `every` across them, which is exactly what
     "either / both" means written out. */
  const byField = {};
  STUFF.filters.forEach(f => { (byField[f.field] = byField[f.field] || []).push(f); });
  Object.keys(byField).forEach(field => {
    out = out.filter(x => byField[field].some(f => filterHit(x, f, credits)));
  });

  const words = norm(STUFF.q).split(/\s+/).filter(Boolean);
  if (words.length) out = out.filter(x => {
    const hay = norm([x.name, x.sub, x.subject, x.slot,
                      x.grade && 'grade ' + x.grade].filter(Boolean).join(' '));
    return words.every(w => hay.includes(w));
  });

  /* ONE KEY, then the name to settle ties. There was an outer sort by group — and with the
     groups gone there is nothing above the sort, which is most of why this is now four lines.
     The name is always the tiebreak, so two papers priced the same come out in the order anybody
     would look for them rather than in the order the sheet happens to hold them. */
  return out.sort((a, b) =>
       (STUFF.sort === 'cost' ? (a.cost - b.cost)
      : STUFF.sort === 'year' ? cmpText(yearOf(b), yearOf(a))
      : 0)
    || cmpText(a.name, b.name));
}

/* How many cards to a page. Eight fills a phone without quite filling it — a page that ends
   exactly at the fold gives no sign there is anything below, and one that overflows makes you
   scroll before you can swipe. If a chunk does overflow, the page scrolls and the pager waits,
   which is the same rule every other widget follows. */
const STUFF_PER_PAGE = 8;

/* THE FILTERED LIST, held between calls.
   Searching, grouping, sorting and paging all want the same array, and each was recomputing it —
   `stuffItems` flattens four hundred topics and twenty shop rows, `stuffFind` filters and sorts
   them, and that ran four times to draw one screen and again on every page turn.
   Keyed on everything that can change the answer. */
let FIND_MEMO = { key: null, from: null, items: null, total: 0 };

function stuffFiltered() {
  /* KEYED ON THE PAYLOAD ITSELF, by object identity, not on `DATA.version`.
     `version` is the BACKEND's version string — it changes when you deploy, and not when anybody
     edits a row. So a reload that brought back four hundred changed resources produced the same
     key as the reload before it, and this handed back the list it built last time. Editing a
     resource and refreshing showed the old one, for as long as the tab stayed open, and nothing
     anywhere said so.
     A new payload is a new object. That is the whole test, it costs one comparison, and it is the
     same one `allTopics` already uses one level down — which is why THAT was correct and this was
     not. */
  const key = JSON.stringify([STUFF.q, STUFF.sort, STUFF.filters,
                              USER ? USER.credits : -1, isAdmin()]);
  if (FIND_MEMO.key === key && FIND_MEMO.from === DATA) return FIND_MEMO.items;
  const all = stuffItems();
  const items = stuffFind(all, USER ? (USER.credits || 0) : 0);
  FIND_MEMO = { key: key, from: DATA, items: items, total: all.length };
  return items;
}

/**
 * ARE WE LOOKING AT WIDGETS AND NOTHING ELSE?
 *
 * If so they stop being cards and become the pages themselves — one to a screen, swipe between
 * them, already running. A game you have to open is not a game, and a calculator behind a tap is a
 * calculator you use the phone's own one instead.
 *
 * ALL of them, not some. A search matching a tool and three resources cannot give one thing a
 * whole screen and eight things another, so a mixed result stays a list of cards and the widget
 * card opens in the sheet as before. The whole-screen version is for when you have said Tools or
 * Games and there is nothing else in the way.
 */
const showingWidgets = () => {
  const items = stuffFiltered();
  return items.length > 0 && items.every(x => x.kind === 'tool' || x.kind === 'game');
};

/** One widget to a page; eight cards otherwise. */
const stuffPerPage = () => showingWidgets() ? 1 : STUFF_PER_PAGE;

/**
 * HOW MANY PAGES, WITHOUT BUILDING ANY OF THEM.
 *
 * This used to render every page's markup and return the length of the array — half a megabyte of
 * HTML to produce the number 59, and it ran on every single page turn because the pager asks for
 * the page names each time it moves. Drawing the screen took a fifth of a second with a library
 * this size and would take longer with every resource added.
 *
 * A page holds a fixed number of cards, so the count is a division.
 */
function stuffPageCount() {
  const n = stuffFiltered().length;
  return n ? Math.ceil(n / stuffPerPage()) : 1;
}

/**
 * ONE PAGE'S MARKUP, built when it is needed and not before.
 *
 * A GROUP HEADING IS REPEATED at the top of a page that continues one. Four hundred resources
 * eight to a screen means most groups span several, and a page opening with eight subject names
 * and no subject is a page you would have to swipe back to understand.
 */
function stuffPageHtml(n) {
  const items = stuffFiltered();
  const credits = USER ? (USER.credits || 0) : 0;

  if (!items.length) {
    const why = STUFF.q && STUFF.filters.length ? 'Try fewer words, or take a filter off.'
              : STUFF.q                          ? 'Try fewer words.'
              : STUFF.filters.length             ? 'Nothing matches all of those together.'
              : '';
    return (!FIND_MEMO.total)
      ? nothingHere('Nothing in the shop or the library yet.')
      : `<p class="empty">Nothing matches.${
          why ? `<br><span class="faint">${esc(why)}</span>` : ''}</p>`;
  }

  /* Cards, in order, and nothing between them. The continuation-heading logic went with the
     headings — repeating a group name at the top of a page that carries on from the last one was
     the fiddliest part of this function and existed only to make grouping survive being paged. */
  /* A WHOLE SCREEN EACH. The widget's own markup rather than a card standing in for it — the
     card was only ever a door, and there is nothing behind that door which could not be here. */
  if (showingWidgets()) {
    const wgt = items[n] && items[n].row;
    return wgt ? `<div class="widget-full">${wgt.html}</div>` : '';
  }

  const per = stuffPerPage();
  return items.slice(n * per, (n + 1) * per)
    .map(x => stuffCard(x, credits)).join('');
}

/* One card. Lifted out of the list so the pager and anything else can build one without rebuilding
   all four hundred around it. */
function stuffCard(x, credits) {
  /* A person, a place and a subject already have a card each — written for the Find screen and
     carrying the class that colours the name. Reused rather than reimplemented: two cards for one
     tutor is two things to keep looking the same. */
  if (x.kind === 'tutor' || x.kind === 'venue' || x.kind === 'subject') {
    return findCard({ kind: x.kind, row: x.row });
  }

  /* A LINK IS AN ANCHOR, not a card that opens a sheet. Everything else here opens something
     inside the app and a link leaves it — so it is the one card that has to be a real `<a>`, or a
     long-press cannot copy it and a middle-click cannot open it in a tab. It carries the same
     coloured shape the Library wall uses, so the same link looks like itself in both places. */
  /* A FRIEND. Their figure, their level, and a way to stop being one — everything a friend card
     ever showed, on the tab where people are looked for. */
  if (x.kind === 'friend') {
    const f = x.row;
    const xp = Number(f.xp) || 0;
    return `<div class="card">
      <div class="thing">
        <span class="thing-pic art">${avatarFor(f.handle, 44, f.avatar)}</span>
        <div class="thing-body">
          <h3>${esc(x.name)}</h3>
          <p class="sub">${esc(f.handle)}${f.name ? ' · level ' + levelFromXp(xp) : ''}</p>
        </div>
        <span class="text-drop" data-do="friend-drop" data-handle="${esc(f.handle)}">✕</span>
      </div>
    </div>`;
  }

  /* A widget's card is its name and nothing else — there is no picture, no price and no subject,
     and inventing a line to fill the space would be the card apologising for being short. */
  if (x.kind === 'tool' || x.kind === 'game') {
    return `<div class="card tap" data-do="widget" data-id="${esc(x.row.id)}">
      <h3>${esc(x.name)}</h3>
    </div>`;
  }

  if (x.kind === 'link') {
    const l = x.row;
    const shape = (LINK_SHAPE.find(y => y.is.test(norm(l.category))) || {}).cls || 'mark';
    const want = norm(l.colour);
    const hex = /^#?[0-9a-f]{6}$/.test(want) ? (want[0] === '#' ? want : '#' + want) : null;
    const col = NAMED_COLOURS[want] || hex || `hsl(${hashOf(l.title || '?') % 360} 48% 46%)`;
    const initials = String(l.title || '').replace(/[^A-Za-z0-9 ]/g, '')
      .split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
    return `<a class="card tap" href="${esc(l.url)}" target="_blank" rel="noopener">
      <div class="thing">
        <span class="thing-pic art"><span class="shape ${shape}" style="--c:${col}"
          >${esc(initials)}</span></span>
        <div class="thing-body">
          <h3>${esc(l.title)}</h3>
          <p class="sub">${mark(l.category || 'Link')} <span class="faint">· opens elsewhere</span></p>
        </div>
      </div>
    </a>`;
  }
  /* One card shape for both, because they are the same kind of thing to a person looking for one:
     a picture, a name, what it belongs to, and — if it costs anything — what.

     A RESOURCE SHOWS NO PRICE AT ALL. It used to say "0 credits — free", on the argument that a
     blank where a price should be reads as the app having forgotten. That argument holds for one
     card among priced ones and collapses when four hundred of the four hundred and ten say it:
     repeated on every row it stops being information and becomes a line you read past, and the
     one card that DOES cost something loses the contrast that made its price visible.

     A shop item priced at zero still says free, because there it means something — free among
     things that cost. A resource is free because it is a resource. */
  {
    const free = x.cost === 0;
    const afford = x.kind === 'shop' && !free && credits >= x.cost;
    /* WHAT IT TAKES TO HAVE IT. Three answers, and the card used to give one:
         a level    — earned, not bought. Gold once you are there, faint until then, and it says
                      WHICH level rather than "locked", because a number you can count towards is
                      a different thing from a door.
         credits    — bought. Gold when you can afford it.
         nothing    — genuinely free, which for a wearable means everybody starts with it. */
    const myLevel = Math.floor((Number(USER && USER.xp) || 0) / 10);
    const price = x.kind !== 'shop' ? ''
      : x.level > 0
        ? `<span class="price ${myLevel >= x.level ? 'can' : ''}">${
            myLevel >= x.level ? 'Level ' + x.level + ' — yours' : 'Level ' + x.level}</span>`
      : `<span class="price ${free ? 'free' : afford ? 'can' : ''}">${
          free ? 'free' : x.cost + ' credits'}</span>`;
    /* A wearable is a THIRD kind of thing on this list, beside a resource and a bought object —
       so it is marked as one and coloured as one, the same way a subject and a venue are. */
    return `<div class="card tap${x.wearable ? ' is-wear'
             : x.kind === 'topic' ? ' is-subject' : ''}${x.off ? ' is-off' : ''}"
         data-do="${x.kind === 'shop' ? 'shop-item' : 'topic'}" data-key="${esc(x.key)}">
      <div class="thing">
        ${/* A WEARABLE DRAWS ITSELF. It has no photograph and never will — the drawing is the
              object, and a card selling a cape with nothing on it was selling a word.
              Cropped to the item rather than shown on a figure: a card-sized person wearing a
              scarf makes the scarf the smallest thing on the card. */''}
        ${x.wearable && x.artId && itemArt(x.slot, x.artId)
          ? `<span class="thing-pic art">${itemArt(x.slot, x.artId, 44)}</span>`
          : x.image ? `<img class="thing-pic" src="${esc(pic(x.image))}" alt="" loading="lazy">` : ''}
        <div class="thing-body">
          <h3>${esc(x.name)}${x.off ? ' <span class="faint">— deleted</span>' : ''}</h3>
          ${/* Its own second line: a resource says its subject, a shop item its description. This
                fell back to the GROUP name when both were empty — which was the card repeating the
                heading above it, and is now a fallback to nothing, which is honest. */''}
          ${/* THE YEAR, ON THE CARD. For a past paper it is most of the identity — "Paper 1" is
                four papers and "Paper 1 · 2024" is one — and it was in the payload, filterable and
                sortable, and shown nowhere. A thing you can sort by and cannot see is a sort you
                have to take on trust.
                Read off the wave when the year itself is blank: "June 2024" carries it, and
                nobody should have to type the same fact into two columns. */''}
          <p class="sub">${mark(x.sub || x.subject || '')}${yearOf(x)
            ? ` <span class="mono faint">· ${esc(yearOf(x))}</span>` : ''}${x.wearable && x.slot
            /* WHERE IT GOES. Until there are drawings, the slot is the only thing on the card that
               says what the object actually is — "Cape · shoulders" is a garment and "Cape" on its
               own is a word. */
            ? ` <span class="faint">· ${esc(x.slot)}</span>` : ''}</p>
          ${price}
        </div>
      </div>
      ${x.kind === 'topic' && x.topic ? tickRow(x.topic) : ''}
    </div>`;
  }
}

/* The chips, and the + that adds one. Drawn with the list rather than with the two selects above
   it, because this row grows and shrinks and a fixed control does not. */
function filterChips() {
  return `<div class="chips">
    ${STUFF.filters.map((f, i) => `
      <button class="chip" data-do="filter-drop" data-i="${i}">
        <span class="chip-k">${esc((facetBy(f.field) || {}).label || f.field)}</span>
        ${esc(f.value)}<span class="chip-x">✕</span>
      </button>`).join('')}
    ${STUFF.filters.length > 1
      ? '<button class="chip clear" data-do="filter-clear">clear</button>' : ''}
  </div>`;
}

/* THE PICKER SHEET IS GONE. It asked which FIELD, then which VALUE — two taps and a panel over
   the screen before anything narrowed, and a list of every field whether or not it would change
   what you could see. The funnel asks the same questions in place, one at a time, already knowing
   which are worth asking.

   `filter-add` went with it. There is nothing to add: the next question is already on the page. */

on('noop', () => {});
/* ANSWERING THE QUESTION ON THE PAGE. One tap: it becomes a chip, and the next question — if
   there is one worth asking — takes its place. */
on('facet-pick', el => {
  STUFF.filters.push({ field: el.dataset.field, value: el.dataset.value });
  paintStuff();
});
on('filter-drop', el => { STUFF.filters.splice(Number(el.dataset.i), 1); paintStuff(); });
on('filter-clear', () => { STUFF.filters = []; paintStuff(); });

/**
 * REDRAW THE RESULTS AND NOTHING ELSE.
 *
 * The controls are page one and are never rebuilt — that is the whole reason they are a page of
 * their own. A search box redrawn on the keystroke loses its focus and its caret, and every
 * version of this screen so far has had a workaround for that somewhere.
 *
 * So the first `.page` is left exactly as it is and the rest are replaced. The chips live on that
 * first page too and DO get rewritten, because adding a filter is a press rather than a keystroke
 * and there is nothing to lose focus from.
 */
function paintStuff() {
  const chips = $('stuff-chips');
  if (chips) chips.innerHTML = filterChips();
  const count = $('stuff-count');
  if (count) count.innerHTML = stuffCount();
  const groups = $('stuff-groups');
  if (groups) groups.innerHTML = stuffQuestion();

  const host = $('s-stuff');
  if (!host) return;
  const first = host.querySelector(':scope > .page');
  if (!first) return;

  /* EMPTY pages, filled in as you reach them. Building all fifty-nine put half a megabyte of
     markup in the document to show eight cards, and rebuilt it on every keystroke. */
  host.innerHTML = first.outerHTML
    + Array.from({ length: stuffPageCount() }, () => '<section class="page"></section>').join('');
  fillStuffPages();
  paintPager('stuff', true);
}

/**
 * THE PAGES YOU CAN SEE, AND ONE EITHER SIDE.
 *
 * A page two turns away is off-screen and behind two others; its markup is a cost with no reader.
 * So a page is filled when it comes within reach and emptied when it leaves, which keeps the
 * document the size of five screens however long the library grows.
 *
 * Filled INDIVIDUALLY rather than by rewriting the strip, because rewriting it mid-turn destroys
 * the elements the transition is animating and the dial jumps instead of turning.
 */
function fillStuffPages() {
  const host = $('s-stuff');
  if (!host) return;
  const pages = host.querySelectorAll(':scope > .page');
  const at = PAGE.stuff || 0;
  const items = stuffFiltered();
  for (let i = 1; i < pages.length; i++) {
    const el = pages[i];
    const near = Math.abs(i - at) <= 1;
    if (near && el.dataset.filled !== '1') {
      el.innerHTML = stuffPageHtml(i - 1);
      el.dataset.filled = '1';
    } else if (!near && el.dataset.filled === '1') {
      el.innerHTML = '';
      delete el.dataset.filled;
    }
  }

  /* AND START THE ONE YOU ARE LOOKING AT.
     Only that one: a canvas measures itself from its box, and a page that is not the front one has
     no box worth measuring — the bird would draw into whatever size it happened to have while off
     to the side. Every widget finds its parts by id, so this has to come after the markup is in
     the document, which is why it is here rather than anywhere earlier.
     Started again on every fill rather than once. They are all idempotent — a board redraws from
     the position it already holds, a clock from the time it already has — and remembering which
     have been started is a second thing to keep true. */
  if (!showingWidgets()) return;
  const wgt = items[at - 1] && items[at - 1].row;
  if (!wgt) return;
  startWidget_(wgt);
}

/**
 * BRING ONE WIDGET TO LIFE, and say so in its own space if it does not.
 *
 * The same three steps `on('widget')` does — start it, look where it should have drawn, write the
 * reason there if nothing did. Shared rather than repeated, because a widget opened from a card
 * and a widget filling a page are the same widget and must fail the same way.
 */
function startWidget_(wgt) {
  let err = null;
  try { wgt.start(); } catch (e) { err = e; console.warn('[widget]', wgt.id, e); }

  const into = $(wgt.into);
  if (!into) { console.warn('[widget]', wgt.id, 'has nowhere to draw: #' + wgt.into); return; }
  /* A canvas and a textarea draw into themselves, so their emptiness says nothing about them. */
  if (wgt.into === 'flappy-canvas' || wgt.into === 'notepad') return;
  if (String(into.innerHTML || '').trim()) return;
  into.innerHTML = `<p class="note" style="padding:1rem;text-align:center">
    ${esc(wgt.what)} did not start.<br>
    <span class="faint">${esc(err ? String(err.message || err) : 'It drew nothing.')}</span></p>`;
}

/**
 * THE QUESTION, ON THE PAGE.
 *
 * What was here showed the groups the results would be put in — useful, and only ever one facet:
 * whatever `group` happened to be set to. This asks the next question that would actually narrow
 * things, whichever facet that turns out to be, and stops asking when there is nothing left worth
 * asking.
 *
 * WHAT IT LOOKS LIKE, in order down the page:
 *   the chips     what you have already said, each one removable
 *   the count     how many that leaves, and how many pages
 *   the question  one heading and a short list with counts
 *
 * And when the questions run out it says so, rather than showing an empty heading — which is the
 * moment somebody needs telling that swiping up is the next move.
 */
/* NAMED FOR WHAT IT WAS, not what it is. This drew the group list once; it draws the funnel's
   next question now, and the grouping it was named after no longer exists. Renamed so the one
   thing left on the browse page is called what it does. */
function stuffQuestion() {
  const items = stuffFiltered();
  /* NOBODY YET, and a way to fix that. An empty Friends list is the one empty result on this
     screen that is not a dead end — every other kind is empty because the sheet is, and this one
     is empty because you have not added anybody. */
  if (STUFF.filters.some(f => f.value === 'Friends') && !items.length) {
    return `<p class="empty">No friends yet.<br>
      <span class="text-action" data-do="friend-add-open">Add someone by their handle</span></p>`;
  }
  if (!items.length) return '';

  const facet = nextFacet(items);
  const adding = STUFF.filters.some(f => f.value === 'Friends')
    ? `<p style="margin:.6rem 0 0"><span class="text-action" data-do="friend-add-open"
        >Add someone by their handle</span></p>` : '';
  if (!facet) {
    return `<p class="faint" style="margin:.6rem 0 0">Nothing left to narrow.
      Swipe up for the ${items.length === 1 ? 'one' : items.length}.</p>` + adding;
  }

  const values = facetValues(items, facet);
  /* The count beside each value is what makes this a choice rather than a guess — a value that
     would leave three things and one that would leave three hundred look identical without it,
     and the difference is whether the next tap is worth making. */
  return `<h2><span>${esc(facet.label)}</span><span class="faint">${values.length}</span></h2>`
    + values.map(v => `<div class="row tap" data-do="facet-pick"
        data-field="${esc(facet.field)}" data-value="${esc(v.value)}">
        <span class="k">${mark(v.value)}</span>
        <span class="v mono">${v.n}</span>
      </div>`).join('');
}

/* `stuff-jump` went with the group list. It added a filter and turned to the results in one tap,
   which is exactly what `facet-pick` does — except that it only ever knew about the one grouping,
   so it could jump you to a subject and never to a key stage. */

/** How many of how many, for the line under the controls. Arithmetic, not markup. */
function stuffCount() {
  const n = stuffFiltered().length;
  const pages = stuffPageCount();
  return `${n} of ${FIND_MEMO.total}` + (n ? ` · ${pages} page${pages === 1 ? '' : 's'}` : '');
}

screen('stuff', () => {
  const credits = USER ? (USER.credits || 0) : 0;
  /* The control must SAY what it is doing. Without this the box snapped back to its first option
     every time the screen was redrawn, so the list and the dropdown above it disagreed — and the
     one you believe is the one you can see. */
  const sel = (what, v) => STUFF[what] === v ? ' selected' : '';

  const controls = (USER ? `<div class="card"><div class="row" style="border:0;padding:0">
        <span class="k">Your credits</span><span class="v big gold mono">${credits}</span>
      </div></div>` : '')
    + `<input class="search" id="stuff-q" placeholder="Search…" value="${esc(STUFF.q)}">
    ${/* ONE CONTROL, and only when it has more than one answer.
          The grouping dropdown is gone — the headings follow the funnel now, so there was nothing
          left for it to decide. The sort offers what would actually change the order and nothing
          else, which on a library of four hundred free resources is one option, and one option is
          not a choice. */''}
    ${(() => {
      const opts = sortsWorthOffering();
      return opts.length < 2 ? '' : `<div class="pick-row">
        <select id="stuff-sort" data-do="stuff-set" data-what="sort">
          ${opts.map(([v, label]) =>
            `<option value="${v}"${sel('sort', v)}>${esc(label)}</option>`).join('')}
        </select>
      </div>`;
    })()}
    <div id="stuff-chips">${filterChips()}</div>
    <p class="faint" id="stuff-count">${stuffCount()}</p>
    <div id="stuff-groups">${stuffQuestion()}</div>`;

  /* THE CONTROLS ARE A PAGE, and the results are the pages after it. Four hundred cards under a
     search box is a column nobody reaches the end of; eight to a screen is a thing you turn.

     It also solves what every version of this screen has worked around: the controls are drawn
     once and never rebuilt, so typing in the search box cannot lose its own focus. */
  /* Empty pages. `fillStuffPages` puts markup in the ones you can reach, after the screen exists
     — a page cannot be measured or moved until it is in the document. */
  return pages('stuff', [controls].concat(
    Array.from({ length: stuffPageCount() }, () => '')));
}, () => CART.length
  ? `<span class="act" data-do="open-cart">basket ‧ ${CART.length}</span>`
  : '');

/* Typed into rather than pressed, so it cannot go through the click handler. Debounced, because
   redrawing four hundred cards on every keystroke is how a search box feels broken. Nothing needs
   putting back afterwards now — the box itself is no longer part of what gets redrawn. */
let stuffTimer = null;
document.addEventListener('input', e => {
  if (e.target.id !== 'stuff-q') return;
  STUFF.q = e.target.value;
  clearTimeout(stuffTimer);
  stuffTimer = setTimeout(paintStuff, 180);
});

on('stuff-set', el => { STUFF[el.dataset.what] = el.value; paintStuff(); });

/* ---------- THE DOCKET --------------------------------------------------------------------------
   A list of things to do, ticked off. It lives in ONE CELL on the person's row — `todo`, which has
   been in the schema since the beginning, has a live `saveTodo` handler behind it, and has never
   once been written to by anything.

   ONE CELL, NOT A TAB. A docket line has no life of its own: nothing links to it, nothing counts
   it, nobody else reads it, and it exists for about a day. A tab would mean a row id, a person id,
   an order column and a deletion policy for something that is a scrap of paper.

   PLAIN TEXT, so it stays editable in the spreadsheet. `x ` in front of a line means done, which
   is the notation anybody would use if handed the cell and no instructions — the format has to
   survive being typed at by a person, because sooner or later it will be.
--------------------------------------------------------------------------------------------- */
function docketLines() {
  return String((USER && USER.todo) || '').split(/\r?\n/)
    .map(t => t.trim()).filter(Boolean)
    .map(t => {
      const done = /^(x|✓)\s+/i.test(t);
      return { done, text: t.replace(/^(x|✓)\s+/i, '') };
    });
}

const docketText = list =>
  list.map(l => (l.done ? 'x ' : '') + l.text).join('\n');

/* Kept in step on the phone first, then sent. A tick that waits for a round trip before moving is
   a tick that feels broken on a train — and this is a scrap of paper, not a payment. */
let dockTimer = null;
function docketSave(list) {
  if (!USER) return;
  USER.todo = docketText(list);
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  paintDocket();

  /* Debounced, because ticking four things off in four seconds is one intention and four writes
     to a spreadsheet cell. The last one wins and the three before it were never worth sending. */
  clearTimeout(dockTimer);
  const said = $('dock-said');
  if (said) said.textContent = 'Saving…';
  dockTimer = setTimeout(() => {
    api({ action: 'saveTodo',
      name: USER.name, personId: USER.personId, todo: USER.todo })
      .then(d => {
        if (d && d.error) throw new Error(d.error);
        const el = $('dock-said');
        if (el) el.textContent = 'Saved';
      })
      .catch(err => {
        /* SAID, not swallowed. A list that looks saved and is not is worse than one that never
           pretended — you find out by opening it tomorrow to nothing. */
        const el = $('dock-said');
        if (el) el.textContent = String(err.message || 'Not saved — no connection.');
      });
  }, 900);
}

function paintDocket() {
  const host = $('docket-body');
  if (!host) return;
  if (!USER) { host.innerHTML = '<p class="empty">Sign in to keep a docket.</p>'; return; }

  const list = docketLines();
  if (!list.length) {
    host.innerHTML = '<p class="faint" style="padding:.4rem 0">Nothing on it.</p>';
    return;
  }
  const left = list.filter(l => !l.done).length;

  host.innerHTML = list.map((l, i) => `
    <label class="dock-row${l.done ? ' done' : ''}">
      <input type="checkbox" data-do="dock-tick" data-i="${i}" ${l.done ? 'checked' : ''}>
      <span class="box"></span>
      <span class="dock-text">${mark(l.text)}</span>
      <span class="text-drop" data-do="dock-drop" data-i="${i}">✕</span>
    </label>`).join('')
    + `<div class="row" style="border:0;padding:.4rem 0 0">
        <span class="k">${left ? left + ' left' : 'All done'}</span>
        ${list.length > left
          ? '<span class="v"><button class="btn quiet tiny" data-do="dock-clear">Clear done</button></span>'
          : ''}
      </div>`;
}

on('dock-tick', el => {
  const list = docketLines();
  const i = Number(el.dataset.i);
  if (!list[i]) return;
  list[i].done = !!el.checked;
  docketSave(list);
});

/* Dropping one is immediate and has no undo, which is right for a line somebody wrote thirty
   seconds ago — a confirmation on a scrap of paper is a confirmation nobody reads. */
on('dock-drop', (el, e) => {
  /* It sits inside the label, so without this a tap would toggle the tick on its way past.
     Optional, because an action can be called without an event — `dock-add` is, from the Enter
     key — and a handler that assumes one is a handler that throws the first time it is reused. */
  e?.preventDefault?.();
  e?.stopPropagation?.();
  const list = docketLines();
  list.splice(Number(el.dataset.i), 1);
  docketSave(list);
});

on('dock-clear', () => docketSave(docketLines().filter(l => !l.done)));

on('dock-add', () => {
  const box = $('dock-add');
  const text = (box && box.value || '').trim();
  if (!text) { box?.focus(); return; }
  const list = docketLines();
  /* NEW LINES GO AT THE BOTTOM. A list that grows from the top moves everything you were reading
     every time you add to it, which on a phone means losing your place to your own typing. */
  list.push({ done: false, text });
  if (box) { box.value = ''; box.focus(); }
  docketSave(list);
});

/* Enter adds it. A phone keyboard shows "return" over that field and pressing it doing nothing is
   the smallest possible way to make a form feel broken. */
document.addEventListener('keydown', e => {
  if (e.target && e.target.id === 'dock-add' && e.key === 'Enter') {
    e.preventDefault();
    ACTIONS['dock-add']?.();
  }
});

/* ---------- THE NOTEPAD -------------------------------------------------------------------------
   It says "Saves as you type" under it and never has. `saveNotepad` has been live on the backend
   the whole time and nothing on this side has ever called it — so the caption was a promise the
   app could not keep, which is worse than no caption.
--------------------------------------------------------------------------------------------- */
function initPad() {
  const pad = $('notepad');
  if (!pad) return;
  pad.value = (USER && USER.notepad) || '';
  pad.disabled = !USER;
  const said = $('pad-said');
  if (said) said.textContent = USER ? 'Saves as you type.' : 'Sign in to keep notes.';
}

let padTimer = null;
document.addEventListener('input', e => {
  if (e.target.id !== 'notepad' || !USER) return;
  USER.notepad = e.target.value;
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  clearTimeout(padTimer);
  const said = $('pad-said');
  if (said) said.textContent = 'Saving…';
  /* Longer than the docket's, because this is typed continuously rather than tapped. Nine hundred
     milliseconds into a sentence is a write per word. */
  padTimer = setTimeout(() => {
    api({ action: 'saveNotepad',
      name: USER.name, personId: USER.personId, notepad: USER.notepad })
      .then(d => {
        if (d && d.error) throw new Error(d.error);
        const el = $('pad-said');
        if (el) el.textContent = 'Saved';
      })
      .catch(err => {
        const el = $('pad-said');
        if (el) el.textContent = String(err.message || 'Not saved — no connection.');
      });
  }, 1400);
});


/* ---------- ONE RESOURCE -------------------------------------------------------------------------
   Free to open, and priced to print. Two offers, not one — and the free one goes first, because it
   is what almost everybody wants and because a free thing listed under a paid one reads as the
   cheap option rather than as the default.
--------------------------------------------------------------------------------------------- */
on('topic', el => {
  const t = topicBy(el.dataset.key);
  if (!t) return;
  const price = printPrice(t.pages);
  const offered = canPrint(t);
  const inCart = CART.some(c => c.key === (t.id || t.name) && c.kind === 'print');

  openSheet(t.name, `
    <div class="row"><span class="k">Subject</span>
      <span class="v">${mark(t.subject || '—')}</span></div>
    <div class="row"><span class="k">Grade</span>
      <span class="v">${esc(String(t.grade || '—'))}</span></div>
    ${/* Only when there is one. A row reading "Year —" on four hundred exercises is four hundred
          lines saying nothing, and this sheet is already long. */''}
    ${yearOf(t) ? `<div class="row"><span class="k">Year</span>
      <span class="v mono">${esc(yearOf(t))}</span></div>` : ''}
    ${t.examWave ? `<div class="row"><span class="k">Exam wave</span>
      <span class="v">${esc(t.examWave)}</span></div>` : ''}
    <div class="row"><span class="k">Pages</span>
      <span class="v mono">${t.pages || '—'}</span></div>

    ${t.trackable && USER ? `<h2>Your passes</h2>
      <p class="faint" style="margin:0 0 .2rem">Three times, spaced out. Each is worth a credit.</p>
      ${tickRow(t)}` : ''}

    <h2>Digital</h2>
    <div class="row"><span class="k">Costs</span><span class="v mono green">free</span></div>
    ${t.link
      ? `<a class="btn ghost" href="${esc(t.link)}" target="_blank" rel="noopener"
           style="margin-top:.5rem">Open it now</a>`
      : '<p class="faint">No link on this one yet.</p>'}

    ${/* THE PRINTED COPY. Paper, at cost. The sum is spelled out rather than stated — "43 pages ×
          2p" is checkable, and "£0.86" is something you either believe or you do not. */''}
    <h2>Printed</h2>
    ${offered ? `
      <div class="row"><span class="k">${t.pages} pages × ${printRatePence()}p</span>
        <span class="v mono gold">${money(price)}</span></div>
      <button class="btn" style="margin-top:.5rem" data-do="cart-add"
              data-key="${esc(t.id || t.name)}" data-kind="print" ${USER ? '' : 'disabled'}>
        ${!USER ? 'Sign in first' : inCart ? 'Already in your basket' : 'Add a printed copy'}
      </button>`
      /* WHY it is not offered. A missing button is indistinguishable from a broken one, and the
         commonest reason here is a page count nobody has run yet — which is a thing you can fix
         rather than a thing you have to wonder about. */
      : `<p class="note">${t.pages
          ? 'Not offered as a print.'
          : 'Not priced yet — nobody has counted the pages.'}</p>`}

    ${isAdmin() ? `
      <h2>Admin</h2>
      <div class="btn-row">
        <button class="btn quiet" data-do="topic-edit" data-key="${esc(t.id || t.name)}">Edit</button>
        <button class="btn danger" data-do="topic-delete"
                data-key="${esc(t.id || t.name)}" data-on="${t.active ? '' : '1'}">
          ${t.active ? 'Delete' : 'Restore'}</button>
      </div>
      ${t.id ? '' : `<p class="faint">No id on this row — edits will match by name, which is
        unreliable. Run <code>ensureResourceIds()</code>.</p>`}
      <p class="faint" id="topic-said"></p>` : ''}`);
});

/* ---------- EDITING A RESOURCE, FROM THE BACKEND'S OWN LIST ---------------------------------------
   The form used to name seven fields by hand while the tab had twenty-five and the allow-list
   twenty. Adding a column meant a schema edit, an allow-list edit AND a form edit — and forgetting
   the third meant a column that existed, could be written to, and had nowhere to type it in.

   `resourceFields` has been in the payload the whole time. It IS the allow-list — the same object
   the server checks writes against — so a form built from it cannot offer a field the server will
   refuse, and cannot miss one the server would accept. One list, two readers.

   The groups come with it, so the form arrives already sectioned: What it is, Level, Source,
   Flags, Pages, Costs, Admin.
--------------------------------------------------------------------------------------------- */

/* A column name as a person would say it. Everything not named here is the column with its
   underscores taken out, which is right far more often than it is wrong — `exam_board` reads
   perfectly well as "exam board". */
const FIELD_LABEL = {
  band_type: 'grade or stage', band_value: 'which one', key_stage: 'key stage',
  exam_board: 'exam board', exam_wave: 'exam wave', resource_type: 'type',
  print_required: 'needs printing', level_required: 'unlocks at level',
  pages_checked: 'page count checked', trackable: 'can be ticked off',
};
const fieldLabel = f => FIELD_LABEL[f] || String(f).replace(/_/g, ' ');

/* The ones that are a yes or a no rather than a value. A checkbox for these and a text box for
   everything else — a boolean in a text field is somebody typing TRUE and hoping. */
const FIELD_BOOL = ['trackable', 'print_required', 'printable', 'active'];

/* Where a field's value comes from on the topic object, when it is not simply the same name.
   The payload names things as a person would — `examBoard` — and the sheet as a column does. */
const FIELD_FROM = {
  band_type: 'bandType', band_value: 'bandValue', key_stage: 'keystage',
  exam_board: 'examBoard', exam_wave: 'examWave', resource_type: 'resourceType',
  print_required: 'paper', level_required: 'level', name: 'name', link: 'link',
};

on('topic-edit', el => {
  const t = topicBy(el.dataset.key);
  if (!t) return;

  const groups = (DATA.resourceFields && Object.keys(DATA.resourceFields).length)
    ? DATA.resourceFields
    /* A backend too old to send it. The form still opens, with what this file knows about — an
       admin who cannot edit anything is worse than one who can edit seven things. */
    : { 'What it is': ['name', 'subject', 'resource_type', 'link'],
        'Level': ['band_type', 'band_value'], 'Pages': ['pages', 'printable'] };

  /* Values already known, offered as you type. Every value any resource has for that field, which
     is how "Edexcel" gets typed once and picked thereafter — and how three spellings of one board
     stop happening. */
  const known = f => {
    const from = FIELD_FROM[f] || f;
    return uniq(allTopics().map(x => String(x[from] ?? '').trim())).filter(Boolean).sort(cmpText);
  };

  const field = f => {
    const from = FIELD_FROM[f] || f;
    const v = t[from];
    if (FIELD_BOOL.indexOf(f) !== -1) {
      return `<label class="check">
        <input type="checkbox" data-ed="${esc(f)}" ${v ? 'checked' : ''}>
        <span class="box"></span><span>${esc(fieldLabel(f))}</span></label>`;
    }
    const opts = known(f);
    const list = opts.length > 1 ? 'ed-list-' + f : '';
    return `<label class="field"><span>${esc(fieldLabel(f))}</span>
      <input data-ed="${esc(f)}" value="${esc(String(v ?? ''))}"
             ${list ? `list="${list}"` : ''}
             ${/pages|price|level|year/.test(f) ? 'inputmode="numeric"' : ''}>
      ${list ? `<datalist id="${list}">${
        opts.map(o => `<option value="${esc(o)}">`).join('')}</datalist>` : ''}</label>`;
  };

  openSheet('Edit — ' + t.name,
    Object.keys(groups).map(g => `<h2><span>${esc(g)}</span></h2>`
      + groups[g].map(field).join('')).join('')
    + `<button class="btn" data-do="topic-save" data-key="${esc(t.id || t.name)}">Save</button>
       <p class="faint" id="ed-said" style="margin:.6rem 0 0">
         Changing the link clears the page count — it was read off the old file.</p>`);
});

on('topic-save', el => {
  const said = $('ed-said');

  /* WHATEVER THE FORM PUT ON THE PAGE, read back by the name it was given. The old version listed
     the seven fields again — a third place to forget one, and the reason adding a column meant
     three edits. */
  const fields = {};
  document.querySelectorAll('#sheet-body [data-ed]').forEach(box => {
    fields[box.dataset.ed] = box.type === 'checkbox'
      ? (box.checked ? 'TRUE' : 'FALSE')
      : String(box.value || '').trim();
  });

  if (!String(fields.name || '').trim()) {
    if (said) said.textContent = 'It needs a name.';
    return;
  }

  el.disabled = true;
  if (said) said.textContent = 'Saving…';

  api({ action: 'editResource',
    name: USER.name, adminName: USER.name, id: el.dataset.key, fields })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet(); toast('Saved'); load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not save that');
    });
});

/* Two presses, the same as a post. The button becomes the question rather than handing the screen
   to a browser dialogue that cannot speak in this app's words. */
on('topic-delete', el => {
  const restoring = !!el.dataset.on;
  if (!el.dataset.sure && !restoring) {
    el.dataset.sure = '1';
    el.textContent = 'Really delete?';
    setTimeout(() => { if (el.dataset.sure) { delete el.dataset.sure; el.textContent = 'Delete'; } }, 4000);
    return;
  }
  const said = $('topic-said');
  el.disabled = true;
  if (said) said.textContent = restoring ? 'Restoring…' : 'Deleting…';

  api({ action: 'deleteResource',
    name: USER.name, adminName: USER.name, id: el.dataset.key, on: restoring })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet();
      toast(restoring ? 'Back on the list' : 'Deleted — still there, switched off');
      load();
    })
    .catch(err => {
      el.disabled = false; delete el.dataset.sure;
      el.textContent = restoring ? 'Restore' : 'Delete';
      if (said) said.textContent = String(err.message || 'Could not do that');
    });
});

on('shop-item', el => {
  const it = (DATA.shop || []).find(x => norm(x.name) === norm(el.dataset.key));
  if (!it) return;
  const credits = USER ? (USER.credits || 0) : 0;
  const price = Number(it.price) || 0;
  const inCart = CART.some(c => c.key === it.name && c.kind === 'shop');
  const wearable = isWearable(it);

  /* A WEARABLE IS NOT PUT IN A BASKET. There is nothing to post and nothing to collect — it is
     worn, or it is not — so it goes on straight away and the credits come off at that moment.
     Buying and equipping are ONE act, which is what stops a failed request leaving somebody
     poorer than it found them. */
  const mine = wardrobe().find(w => w.slot === it.slot && w.id === it.artId);
  const owned = wearable && mine && mine.unlocked;
  const level = levelFromXp(USER && USER.xp);
  const tooLow = wearable && it.level && level < it.level;
  const wearing = wearable && USER
    && avatarConfig(USER.avatar, USER.handle || USER.name)[it.slot] === it.artId;

  openSheet(it.name, `
    ${wearable && itemArt(it.slot, it.artId)
      ? `<div class="av-wrap">${itemArt(it.slot, it.artId, 96)}</div>`
      : it.image ? `<img src="${esc(pic(it.image))}" alt=""
           style="width:100%;margin-bottom:.7rem">` : ''}
    ${it.description ? `<p class="note" style="margin-top:0">${mark(it.description)}</p>` : ''}
    ${it.slot ? `<div class="row"><span class="k">Goes on</span>
        <span class="v">${esc(it.slot)}</span></div>` : ''}
    ${it.level
      ? `<div class="row"><span class="k">Unlocks at</span>
           <span class="v mono${level >= it.level ? ' gold' : ''}">Level ${it.level}</span></div>
         <div class="row"><span class="k">You are</span>
           <span class="v mono">Level ${level}</span></div>`
      : `<div class="row"><span class="k">Costs</span>
           <span class="v mono">${price ? price + ' credits' : 'free'}</span></div>
         ${USER ? `<div class="row"><span class="k">You have</span>
           <span class="v mono">${credits}</span></div>` : ''}`}

    ${wearable
      ? `<button class="btn" style="margin-top:.85rem" data-do="wear"
                 data-slot="${esc(it.slot)}" data-id="${esc(it.artId)}"
                 ${!USER || tooLow || wearing ? 'disabled' : ''}>
          ${!USER ? 'Sign in first'
          : wearing ? 'Wearing it'
          : tooLow ? (it.level * 10 - (Number(USER.xp) || 0)) + ' more ticks to go'
          : owned ? 'Put it on' : 'Buy and wear it'}
        </button>
        ${tooLow ? `<p class="faint">Every topic you tick is one XP. Ten is a level.</p>` : ''}`
      : `<button class="btn" style="margin-top:.85rem" data-do="cart-add"
                 data-key="${esc(it.name)}" data-kind="shop" ${USER ? '' : 'disabled'}>
          ${!USER ? 'Sign in first' : inCart ? 'Already in your basket' : 'Add to basket'}
        </button>`}`);
});

/* PUTTING SOMETHING ON. The WHOLE look is sent, not the one change — the server re-checks every
   piece against what this person has earned, so the phone only ever has to know how to draw.
   That is the same request the wardrobe makes, which is why buying has no separate path that
   could succeed while the wearing failed. */
on('wear', el => {
  if (!USER) { toast('Sign in first'); go('me'); return; }
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  cfg[el.dataset.slot] = el.dataset.id;
  el.disabled = true;
  el.textContent = 'Putting it on…';

  api({ action: 'saveAvatar',
    name: USER.name, personId: USER.personId, avatar: cfg })
    .then(d => {
      if (!d || d.error) throw new Error((d && d.error) || 'Could not save that');
      USER.avatar = d.avatar;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      if (d.owned) USER.avatarItems = d.owned;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      closeSheet();
      toast((d.bought || []).length ? 'Bought ' + d.bought.join(', ') : 'Wearing it');
      repaint();
    })
    .catch(err => {
      el.disabled = false;
      el.textContent = 'Try again';
      toast(String(err.message || err));
    });
});

/* ---------- THE BASKET ---------------------------------------------------------------------------
   Kept on the phone, not the server. A basket is a half-formed intention — abandoning one should
   cost nothing and leave no trace, and a row in a spreadsheet for something nobody decided on is
   a row you have to clean up later.

   It survives a refresh, because the commonest way to lose a basket is to close a tab by accident.

   TWO CURRENCIES, NEVER ADDED. Credits buy shop items; pounds pay for paper. 5 credits and £0.86
   is not 91 of anything, and a single total would be the kind of wrong that looks right until
   somebody is charged.
--------------------------------------------------------------------------------------------- */
let CART = [];
try { CART = JSON.parse(localStorage.getItem('familyCart') || '[]'); } catch {}
const cartSave = () => { try { localStorage.setItem('familyCart', JSON.stringify(CART)); } catch {} };

on('cart-add', el => {
  if (!USER) { toast('Sign in first'); go('me'); return; }
  const key = el.dataset.key;
  const kind = ['topic', 'print', 'shop'].includes(el.dataset.kind) ? el.dataset.kind : 'shop';
  /* Keyed on BOTH, because a printed copy and a shop item can share a name and they are not the
     same line. The old test dropped the second one silently. */
  if (CART.some(c => c.key === key && c.kind === kind)) { toast('Already in your basket'); return; }

  if (kind === 'print') {
    const t = topicBy(key);
    if (!t || !canPrint(t)) { toast('That one is not priced for printing'); return; }
    CART.push({ key, name: t.name, kind, cost: 0, money: printPrice(t.pages), pages: t.pages });
  } else if (kind === 'topic') {
    const t = topicBy(key);
    if (!t) return;
    CART.push({ key, name: t.name, kind, cost: 0, money: 0 });
  } else {
    const src = (DATA.shop || []).find(x => norm(x.name) === norm(key));
    if (!src) return;
    CART.push({ key, name: src.name, kind, cost: Number(src.price) || 0, money: 0 });
  }

  cartSave();
  closeSheet();
  toast('In your basket — ' + CART.length + ' item' + (CART.length === 1 ? '' : 's'));
  repaint();
});

on('cart-drop', el => {
  CART = CART.filter(c => !(c.key === el.dataset.key && c.kind === el.dataset.kind));
  cartSave();
  repaint();
  if (!CART.length) closeSheet(); else on_openCart();
});

function on_openCart() {
  const credits = USER ? (USER.credits || 0) : 0;
  const due   = CART.reduce((n, c) => n + (c.cost || 0), 0);
  const cash  = CART.reduce((n, c) => n + (c.money || 0), 0);
  const short = due > credits;

  openSheet('Your basket', CART.length ? `
    ${CART.map(c => `<div class="row">
        <span class="k">${mark(c.name)}${c.kind === 'print'
          ? ` <span class="faint">printed · ${c.pages} pages</span>` : ''}</span>
        <span class="v mono">${c.money ? money(c.money) : (c.cost ? c.cost : 'free')}
          <span class="text-drop" data-do="cart-drop"
                data-key="${esc(c.key)}" data-kind="${esc(c.kind)}">✕</span></span>
      </div>`).join('')}

    ${due ? `<div class="row"><span class="k">Credits</span>
        <span class="v big mono">${due}</span></div>
      <div class="row"><span class="k">You have</span>
        <span class="v mono${short ? ' bad' : ''}">${credits}</span></div>` : ''}
    ${cash ? `<div class="row"><span class="k">To pay</span>
        <span class="v big mono gold">${money(cash)}</span></div>` : ''}

    <button class="btn" style="margin-top:.85rem" ${short ? 'disabled' : ''} data-do="cart-send">
      ${short ? (due - credits) + ' more credits needed'
              : cash ? 'Pay ' + money(cash) : 'Confirm'}
    </button>
    <p class="faint" style="margin-top:.5rem">${cash
      ? 'Printing is charged at cost — paper only. Collect from the library or a session.'
      : 'Nothing leaves your basket until you confirm.'}</p>`
    : '<p class="empty">Your basket is empty.</p>');
}
on('open-cart', on_openCart);

on('cart-send', () => {
  toast('Checkout is the next thing to build');
});

/* ---------- ARCADE ------------------------------------------------------------------------------
   Four things to do rather than four things to use.

   As with Tools, the ids are the ones the carried-over functions look for — `flappy-canvas`,
   `tt-question`, `timer-display`. Twelve of them were wrong at once here, and every single one
   would have failed in silence.
--------------------------------------------------------------------------------------------- */
/* TWELVE function keys, not ten. Ten into a four-column grid is two and a half rows, so `7` and
   `8` finished the row `π` and `⌫` started and the number pad never lined up — a keypad whose 5
   is not under the 8 is one you have to read rather than reach for.
   The four arrows fill it and do the two jobs the calculator was missing: left and right move the
   caret, up and down walk back through what you have already worked out. */
const CALC_KEYS = [
  ['sin(', 'sin', 'fn'], ['cos(', 'cos', 'fn'], ['tan(', 'tan', 'fn'], ['sqrt(', '√', 'fn'],
  ['^2', 'x²', 'fn'],    ['^', 'xʸ', 'fn'],     ['(', '(', 'fn'],      [')', ')', 'fn'],
  ['pi', 'π', 'fn'],     ['left', '◀', 'nav'],  ['right', '▶', 'nav'], ['del', '⌫', 'del'],
  ['7', '7', ''], ['8', '8', ''], ['9', '9', ''], ['/', '÷', 'op'],
  ['4', '4', ''], ['5', '5', ''], ['6', '6', ''], ['*', '×', 'op'],
  ['1', '1', ''], ['2', '2', ''], ['3', '3', ''], ['-', '−', 'op'],
  ['0', '0', ''], ['.', '.', ''], ['C', 'C', 'op'], ['+', '+', 'op'],
  ['up', '▲', 'nav'], ['down', '▼', 'nav'], ['=', '=', 'eq'],
];

/* ================================================================================================
   THE WIDGETS — nine things you USE rather than things you find.

   They had two tabs between them, Tools and Arcade, and both are gone. Not because the widgets
   changed: a calculator is a calculator. Because a tab is an expensive thing — eight of them and
   the labels are dropped on a small phone — and these are nine items in a list of six hundred that
   the funnel can already narrow in one tap.

   ONE TABLE, and it does four jobs that were spread across four places: what the card says, what
   the markup is, what starts it, and where to look to see whether it started. The last one is what
   was missing when a blank card looked like a widget nobody had finished building.

   THEY OPEN IN THE SHEET rather than on a page of their own. The sheet is already the thing that
   takes the whole screen for anything needing full attention, and a calculator needs exactly that
   — full width, nothing behind it, and a way out that is the same gesture as everywhere else.
================================================================================================ */
/* ================================================================================================
   THE OVERWORLD.

   Your venues as a map you move across, and the point of it is the thing a real map cannot do:
   nodes you have not reached yet are shut. Ticking topics moves you along it.

   DRAWN, NOT PHOTOGRAPHED, and that is a decision rather than a shortcut. Map tiles would need a
   key that is public in this site, come with terms about how they may be redrawn, weigh more than
   the whole app, and — the part that actually decides it — aerial London is grey roofs. An
   overworld is nodes, paths and a few landmarks with everything else deleted, which is why it
   reads at a glance.

   REAL POSITIONS WHERE THERE ARE ANY. A venue with coordinates sits where it really is, so Morden
   is south of Colliers Wood on the map because it is south of it in London. Without them the
   venues are laid on a winding path in the order they come, which is a worse map and a perfectly
   good game — so this works today and gets truer the moment the postcodes are filled in.
================================================================================================ */

/* Somewhere you can stand. `Online` and a client's own house are not places — they have no
   coordinates and never will, and putting them on a map would be inventing a location for the
   two entries whose whole meaning is not having one. */
const mapPlaces = () => (DATA.venues || []).filter(v => {
  if (!v.title) return false;
  /* BY NAME, NOT BY RATE. This used `isHome`, which answers a PRICING question — does this place
     charge room hire — and returns true for anything free. So a community centre that costs
     nothing was read as somebody's front room and vanished from the map, which is the entire
     Colliers Wood Community Centre and any other free venue.
     What is being asked here is different: is this a PLACE. Online is not, and a client's own
     house is not one we can point at. Both are recognisable by name, which is the only thing that
     actually distinguishes them. */
  return !/^online$/i.test(String(v.title).trim())
      && !/\b(home|house|client\s*(house|home|place)|your venue)\b/i.test(v.title);
});

/* ---------- WORLDS ---------------------------------------------------------------------------------
   A borough is a world. Not a metaphor stretched to fit — a borough is exactly what an overworld
   world is: a handful of places close enough to walk between, with a name everybody already knows,
   and a boundary somebody else drew.

   ORDERED BY HOW MANY PLACES ARE IN THEM, so the borough you work in most is World 1. Merton has
   the most venues, so Merton is where the map opens — and that stays true on its own as the estate
   changes, rather than because a number was typed somewhere.
--------------------------------------------------------------------------------------------- */
let MAP_WORLD = 0;

function mapWorlds() {
  const by = {};
  mapPlaces().forEach(v => {
    /* A venue with no borough still belongs somewhere. "Elsewhere" rather than a world of its own,
       because one venue is not a world and a map of six one-node worlds is a menu. */
    const w = String(v.borough || v.city || '').trim() || 'Elsewhere';
    (by[w] = by[w] || []).push(v);
  });
  return Object.keys(by).map(name => ({ name, venues: by[name] }))
    .sort((a, b) => b.venues.length - a.venues.length || cmpText(a.name, b.name));
}

/** The world being looked at, clamped — the count changes when a venue is added or moved. */
function mapWorld() {
  const all = mapWorlds();
  if (!all.length) return { name: '', venues: [] };
  /* `|| 0` before the clamp, because NaN passes through Math.min and Math.max unchanged — clamping
     it does nothing at all, and the list is then indexed with it. A guard that cannot fail is
     better here than one that depends on nobody upstream producing a NaN. */
  MAP_WORLD = Math.max(0, Math.min(all.length - 1, Number(MAP_WORLD) || 0));
  return all[MAP_WORLD] || { name: '', venues: [] };
}

/* The places in the world you are looking at. Everything downstream — the projection, the road,
   the terrain — is scoped to one world, so a map of Merton is scaled to Merton rather than to
   every borough at once. */
const mapNodes = () => mapWorld().venues;

/**
 * WHERE EACH NODE SITS, in a 0-100 box.
 *
 * Coordinates are projected against the SPREAD of the venues rather than against London — eleven
 * places inside six miles would otherwise be a cluster of dots in the middle of an empty square.
 * The map is of your estate, so it is scaled to your estate.
 *
 * Latitude is flipped because north is up and y counts down, which is the one arithmetic mistake
 * that makes a map look plausible and be upside down.
 */
function mapLayout() {
  const nodes = mapNodes();
  const placed = nodes.filter(v => Number(v.lat) && Number(v.lng));

  /* NOTHING INVENTED. There used to be a winding fallback path for venues with no coordinates —
     places drawn somewhere they are not, on a map whose entire value is being right about where
     things are. A venue without a postcode is simply not on the map, and the map says how many
     are missing. */

  /* ONE PROJECTION, shared with everything else drawn on this map. Two copies of this arithmetic
     that drifted apart would put the venues in the river. */
  const p = mapProject();
  return nodes.map((v, i) => {
    const la = Number(v.lat), ln = Number(v.lng);
    if (!la || !ln || !p) return { v, real: false };
    return { v, real: true, x: p.x(ln), y: p.y(la) };
  }).filter(n => n.real);
}

/**
 * WHERE A COORDINATE LANDS IN THE BOX, and the only place that decides it.
 *
 * Scaled to the SPREAD of the venues rather than to London — eleven places inside six miles would
 * otherwise be a cluster of dots in an empty square. The map is of your estate, so it is scaled to
 * your estate; the river and everything else is projected through this same function so it cannot
 * disagree with where the nodes are.
 */
function mapProject() {
  const placed = mapNodes().filter(v => Number(v.lat) && Number(v.lng));
  /* ONE VENUE IS STILL A WORLD. This refused anything under two, on the reasoning that a single
     point has no spread to scale by — true, and the wrong conclusion: Richmond and Sutton have one
     venue each, so both came out with no ground at all, no roads and no parks, which reads as a
     borough nobody has mapped rather than as a borough with one library in it.
     A single point has no spread but it does have a PLACE, and the minimum reach below supplies
     the rest. */
  if (!placed.length) return null;
  const lats = placed.map(v => Number(v.lat)), lngs = placed.map(v => Number(v.lng));
  const lo = { la: Math.min(...lats), ln: Math.min(...lngs) };
  const hi = { la: Math.max(...lats), ln: Math.max(...lngs) };
  /* A SPREAD OF ZERO IS ZERO. It used to fall back to 1 — a guard against dividing by nothing,
     from when the two axes were scaled independently and a zero would have. One degree is a
     hundred kilometres, so a world with a single venue in it came out scaled to most of southern
     England and drew every park in the file.
     Nothing divides by this any more, and the floor under `reach` below is what stops a zero
     spread collapsing the map. A guard that is no longer guarding anything is just a wrong
     number. */
  const span = { la: hi.la - lo.la, ln: hi.ln - lo.ln };
  /* ONE SCALE FOR BOTH AXES. They were stretched independently to fill the box, which is why
     Richmond Park came out as a long thin slab and the roads met at angles they do not meet at:
     the map was being squeezed differently across than down. A map with two scales is not a map.

     And PADDED, generously. The venues used to touch the edges, so half the terrain around them
     was clipped off and the nodes had nothing to sit among. A world wants room around it. */
  const mid = { la: (lo.la + hi.la) / 2, ln: (lo.ln + hi.ln) / 2 };
  /* Longitude compresses with latitude — a degree east is about 0.62 of a degree north up here —
     so the two have to be brought to the same units before one scale can serve both. */
  const K = Math.cos(mid.la * Math.PI / 180);
  /* HOW MUCH WORLD AROUND THE VENUES. 1.9 was too tight — the three Merton libraries are all in
     the east of the borough, so a map scaled to them stopped short of Wimbledon Common, which is
     the most recognisable thing in Merton. An overworld is mostly scenery with a path through it;
     the path should not fill the frame. */
  /* AND A FLOOR UNDER IT. Two venues a few streets apart — York Gardens and Battersea Reach are
     barely a mile — would otherwise scale the map to a mile across, so the world is two dots and
     the corner of one park. About three miles is the least that shows a borough: near enough to
     recognise the streets, far enough to hold the commons.
     0.045 degrees of latitude is roughly five kilometres. */
  /* AND A FLOOR UNDER IT — applied AFTER the multiplier, not before. Before it, the minimum was
     multiplied too and every world came out thirteen kilometres across, which is most of south
     London: Richmond's map showed Sutton's parks and Merton's showed everybody's.
     0.040 degrees of latitude is about four and a half kilometres, which is the least that reads
     as a borough — near enough to recognise the streets, wide enough to hold the commons. */
  const reach = Math.max(Math.max(span.la, span.ln * K) * 2.6, 0.040);
  const scale = 100 / reach;
  return {
    x: ln => 50 + (ln - mid.ln) * K * scale,
    /* Flipped: north is up, y counts down. */
    y: la => 50 - (la - mid.la) * scale,
  };
}

/* ---------- THE GROUND ----------------------------------------------------------------------------
   Rivers, roads and greenery — and only one of the three is real.

   NO TABLE, and that is the decision worth explaining. A terrain tab means somebody typing a grid
   of tiles into a spreadsheet: hours of work for something nobody examines closely, wrong the day a
   venue moves, and a second description of a place the venues already describe. Real map data —
   OpenStreetMap — gives proper parks and streets at the cost of a large fetch, an attribution, and
   a map that is ACCURATE rather than LEGIBLE. An overworld is not trying to be right about London.
   It is trying to be readable at a glance.

   So the ground is ROLLED FROM A SEED, the same trick as the sticky notes and the reel
   backgrounds: same venues, same world, for ever. Nobody maintains it and it cannot go stale.

   THE RIVER IS THE EXCEPTION, because it is the one feature that makes a map of London
   recognisable, and because York Gardens sits on it. Approximate — eleven points rather than a
   survey — which is the right amount of truth for a map whose venues are drawn as circles.
--------------------------------------------------------------------------------------------- */

/* ---------- THE REAL GROUND ---------------------------------------------------------------------
   Approximate, and deliberately so. Every figure below is the rough centre or corridor of a thing
   that is genuinely there — not a survey. On a map whose venues are drawn as circles a few hundred
   metres of error is invisible, and the alternative was a seeded texture that looked like terrain
   and meant nothing.

   BIG THINGS ONLY. The streets of south London are thousands of lines and would read as grey
   noise; its parks include every square and green. What is here is what somebody would name if you
   asked them what is around Merton: the commons, the royal parks, and the four roads everything
   else hangs off.
--------------------------------------------------------------------------------------------- */

/* THE WANDLE. It matters more than the Thames in World 1 — it runs the length of Merton, through
   Morden Hall Park and right past Colliers Wood, and it is why the borough is where it is. */
const WANDLE = [
  /* IT RISES IN SUTTON. The line used to start at Beddington, which is a mile north-east of where
     the river actually begins — so a map of Sutton had no water on it at all, in the borough the
     Wandle comes from. Carshalton Ponds and the Croydon arm are where it starts. */
  [51.3665, -0.1665], [51.3702, -0.1560], [51.3742, -0.1480],
  [51.3780, -0.1440], [51.3900, -0.1560], [51.3990, -0.1680], [51.4040, -0.1740],
  [51.4120, -0.1770], [51.4185, -0.1795], [51.4270, -0.1840], [51.4400, -0.1900],
  [51.4530, -0.1930], [51.4620, -0.1930], [51.4690, -0.1920],
];

/* THE BEVERLEY BROOK, down the west side of Wimbledon Common and Richmond Park to the Thames at
   Barnes — the boundary between two worlds and the reason the common ends where it does. */
const BEVERLEY = [
  [51.4180, -0.2560], [51.4270, -0.2500], [51.4360, -0.2470], [51.4450, -0.2450],
  [51.4560, -0.2440], [51.4660, -0.2430], [51.4720, -0.2450],
];

/* THE CRANE, through Twickenham to the Thames at Isleworth. */
const CRANE = [
  [51.4380, -0.3700], [51.4420, -0.3600], [51.4470, -0.3480], [51.4530, -0.3380],
  [51.4600, -0.3320], [51.4680, -0.3280],
];

/* The Thames, west to east: Richmond, Kew, Barnes, Putney, Wandsworth, Battersea, Vauxhall. */
const THAMES = [
  [51.4520, -0.3160], [51.4660, -0.2880], [51.4810, -0.2870], [51.4880, -0.2600],
  [51.4750, -0.2400], [51.4670, -0.2160], [51.4690, -0.1920], [51.4810, -0.1740],
  [51.4840, -0.1550], [51.4870, -0.1250], [51.5080, -0.1180],
];

/* ---------- THE GROUND ----------------------------------------------------------------------------
   Green and roads, and nothing else. No trees, no landmarks, no buildings but the venues — those
   were detail piled on a floor that was not right yet, and detail on a wrong floor is what made the
   board unreadable.

   OUTLINES, PROPERLY. Every green below is a real boundary walked round in eight to fourteen
   points, not a rectangle standing in for one: Wimbledon Common has its long west edge on Beverley
   Brook and its straight east side on Parkside, Morden Hall Park is the thin strip the Wandle runs
   down, Mitcham Common is the wedge the tram cuts through. Those shapes are what make a place
   recognisable from above — a box says only that something is there.

   ROADS ARE CARRIAGEWAYS, not hairlines. Drawn the way every road map draws them: a dark casing
   with a lighter fill on top, so a road has EDGES. A one-pixel stroke is a wire diagram.

   Accurate to a hundred metres or so, which is the limit of what can be written down without a
   survey and more than enough at this size.
--------------------------------------------------------------------------------------------- */
const PARKS = [
  /* Wimbledon Common with Putney Heath: the great block west of Parkside, bounded north by Roehampton,
     west by Beverley Brook, south by Camp Road and the Village. */
  ['Wimbledon Common', [
    [51.4472, -0.2402], [51.4468, -0.2268], [51.4430, -0.2222], [51.4372, -0.2210],
    [51.4318, -0.2232], [51.4288, -0.2280], [51.4262, -0.2340], [51.4266, -0.2430],
    [51.4310, -0.2478], [51.4382, -0.2492], [51.4440, -0.2458]]],

  /* Wimbledon Park: the lake and golf course between the railway and Arthur Road. */
  ['Wimbledon Park', [
    [51.4418, -0.2118], [51.4412, -0.2022], [51.4372, -0.1988], [51.4330, -0.2004],
    [51.4326, -0.2078], [51.4358, -0.2124]]],

  /* Morden Hall Park: the strip the Wandle runs down, between Morden Road and the tram. */
  ['Morden Hall Park', [
    [51.4072, -0.1802], [51.4064, -0.1710], [51.4030, -0.1668], [51.3994, -0.1676],
    [51.3986, -0.1746], [51.4012, -0.1800], [51.4044, -0.1818]]],

  /* Mitcham Common: the wedge east of the town, cut through by the tram and the A236. */
  ['Mitcham Common', [
    [51.4018, -0.1596], [51.4004, -0.1452], [51.3960, -0.1362], [51.3898, -0.1348],
    [51.3862, -0.1428], [51.3872, -0.1538], [51.3928, -0.1604], [51.3980, -0.1622]]],

  /* Cannon Hill Common, south-west Merton. */
  ['Cannon Hill Common', [
    [51.3986, -0.2160], [51.3980, -0.2072], [51.3936, -0.2058], [51.3928, -0.2140],
    [51.3954, -0.2178]]],

  /* Figge's Marsh, on the London Road between Mitcham and Tooting. */
  ["Figge's Marsh", [
    [51.4106, -0.1668], [51.4100, -0.1594], [51.4062, -0.1588], [51.4058, -0.1662]]],

  /* Ravensbury Park, further down the Wandle. */
  ['Ravensbury Park', [
    [51.3978, -0.1836], [51.3972, -0.1758], [51.3944, -0.1752], [51.3940, -0.1832]]],

  /* Cricket Green, the middle of old Mitcham. */
  ['Cricket Green', [
    [51.4010, -0.1740], [51.4006, -0.1678], [51.3980, -0.1674], [51.3978, -0.1738]]],

  /* Dundonald Recreation Ground, between Wimbledon and Merton Park. */
  ['Dundonald Rec', [
    [51.4198, -0.2116], [51.4194, -0.2058], [51.4166, -0.2054], [51.4164, -0.2114]]],

  /* Joseph Hood Recreation Ground, Raynes Park. */
  ['Joseph Hood Rec', [
    [51.4076, -0.2280], [51.4070, -0.2196], [51.4038, -0.2192], [51.4034, -0.2276]]],

  /* King George's Park, along the Wandle in Wandsworth. */
  ["King George's Park", [
    [51.4498, -0.1930], [51.4490, -0.1868], [51.4404, -0.1856], [51.4396, -0.1924]]],

  /* Garratt Park, Earlsfield. */
  ['Garratt Park', [
    [51.4336, -0.1876], [51.4330, -0.1810], [51.4300, -0.1806], [51.4296, -0.1874]]],

  /* Tooting Bec and Tooting Graveney Commons, the pair either side of Dr Johnson Avenue. */
  ['Tooting Common', [
    [51.4378, -0.1610], [51.4370, -0.1440], [51.4300, -0.1408], [51.4248, -0.1450],
    [51.4256, -0.1580], [51.4318, -0.1626]]],

  /* Wandsworth Common. */
  ['Wandsworth Common', [
    [51.4526, -0.1786], [51.4518, -0.1638], [51.4448, -0.1600], [51.4400, -0.1648],
    [51.4406, -0.1758], [51.4470, -0.1804]]],

  /* ---- WANDSWORTH ------------------------------------------------------------------------- */

  /* Clapham Common: the triangle between the three roads that bound it. */
  ['Clapham Common', [
    [51.4672, -0.1552], [51.4666, -0.1392], [51.4602, -0.1362], [51.4562, -0.1444],
    [51.4586, -0.1544], [51.4638, -0.1580]]],

  /* Battersea Park, along the river between the two bridges. */
  ['Battersea Park', [
    [51.4838, -0.1636], [51.4830, -0.1486], [51.4772, -0.1478], [51.4762, -0.1620],
    [51.4796, -0.1652]]],

  /* Wandsworth Park, the riverside strip below the Putney bridge road. */
  ['Wandsworth Park', [
    [51.4692, -0.2126], [51.4686, -0.2036], [51.4660, -0.2030], [51.4664, -0.2124]]],

  /* Putney Heath, the northern half of the common, above the Tibbet's Corner road. */
  ['Putney Heath', [
    [51.4552, -0.2360], [51.4548, -0.2216], [51.4482, -0.2196], [51.4446, -0.2268],
    [51.4478, -0.2372]]],

  /* Fishponds Fields and Springfield, either side of the Wandle at Garratt Lane. */
  ['Fishponds Fields', [
    [51.4386, -0.1948], [51.4380, -0.1876], [51.4344, -0.1872], [51.4340, -0.1944]]],

  /* Furzedown and Streatham Vale playing fields, the far side of Tooting. */
  ['Furzedown Rec', [
    [51.4278, -0.1428], [51.4272, -0.1352], [51.4240, -0.1348], [51.4236, -0.1424]]],

  /* Battersea Fields and Christchurch Gardens, behind the park. */
  ['Christchurch Gardens', [
    [51.4744, -0.1690], [51.4740, -0.1624], [51.4714, -0.1620], [51.4710, -0.1686]]],

  /* Falcon Park and Latchmere Recreation Ground, Clapham Junction. */
  ['Latchmere Rec', [
    [51.4688, -0.1712], [51.4684, -0.1650], [51.4658, -0.1646], [51.4654, -0.1708]]],

  /* Heathbrook Park, off the Wandsworth Road. */
  ['Heathbrook Park', [
    [51.4708, -0.1416], [51.4704, -0.1358], [51.4682, -0.1354], [51.4678, -0.1412]]],

  /* Roehampton and Dover House, west of the heath. */
  ['Dover House Park', [
    [51.4562, -0.2492], [51.4556, -0.2412], [51.4520, -0.2408], [51.4516, -0.2488]]],

  /* Barnes Common, over the river on the Wandsworth side of the bend. */
  ['Barnes Common', [
    [51.4728, -0.2462], [51.4720, -0.2334], [51.4664, -0.2318], [51.4652, -0.2440],
    [51.4690, -0.2482]]],

  /* ---- RICHMOND -------------------------------------------------------------------------- */

  /* Richmond Park: the biggest thing for miles, and the shape of a Richmond world. */
  ['Richmond Park', [
    [51.4586, -0.2926], [51.4570, -0.2740], [51.4506, -0.2566], [51.4414, -0.2506],
    [51.4322, -0.2540], [51.4262, -0.2668], [51.4276, -0.2846], [51.4362, -0.2966],
    [51.4478, -0.3006], [51.4548, -0.2988]]],

  /* Kew Gardens, between the river and Kew Road. */
  ['Kew Gardens', [
    [51.4856, -0.3018], [51.4842, -0.2872], [51.4772, -0.2856], [51.4738, -0.2934],
    [51.4772, -0.3030], [51.4826, -0.3054]]],

  /* Old Deer Park and the Royal Mid-Surrey, north of Richmond town. */
  ['Old Deer Park', [
    [51.4762, -0.3106], [51.4752, -0.3010], [51.4692, -0.3006], [51.4686, -0.3110]]],

  /* Richmond Green, the square in the middle of the town. */
  ['Richmond Green', [
    [51.4622, -0.3084], [51.4620, -0.3026], [51.4594, -0.3024], [51.4592, -0.3082]]],

  /* Marble Hill Park, over the river at Twickenham. */
  ['Marble Hill Park', [
    [51.4490, -0.3244], [51.4484, -0.3160], [51.4452, -0.3156], [51.4448, -0.3242]]],

  /* Ham Common and Ham Lands, south of the town. */
  ['Ham Common', [
    [51.4436, -0.3078], [51.4428, -0.2972], [51.4374, -0.2964], [51.4368, -0.3072]]],

  /* Bushy Park, the other royal park, across the Thames at Hampton. */
  ['Bushy Park', [
    [51.4188, -0.3452], [51.4176, -0.3272], [51.4084, -0.3238], [51.4026, -0.3330],
    [51.4062, -0.3466], [51.4136, -0.3496]]],

  /* East Sheen Common and Palewell, on the Richmond Park boundary. */
  ['East Sheen Common', [
    [51.4636, -0.2618], [51.4630, -0.2528], [51.4592, -0.2522], [51.4586, -0.2612]]],

  /* Terrace Gardens and Petersham Meadows, the slope down to the river. */
  ['Terrace Gardens', [
    [51.4560, -0.3040], [51.4556, -0.2966], [51.4526, -0.2962], [51.4522, -0.3036]]],

  /* Twickenham Green, over the bridge. */
  ['Twickenham Green', [
    [51.4472, -0.3396], [51.4468, -0.3330], [51.4442, -0.3326], [51.4438, -0.3392]]],

  /* Crane Park, along the river Crane towards Hanworth. */
  ['Crane Park', [
    [51.4414, -0.3690], [51.4408, -0.3556], [51.4374, -0.3550], [51.4368, -0.3684]]],

  /* Ham Lands, the meadows south of the town on the river bend. */
  ['Ham Lands', [
    [51.4442, -0.3168], [51.4436, -0.3094], [51.4380, -0.3088], [51.4374, -0.3162]]],

  /* Kew Green, between the bridge and the gardens. */
  ['Kew Green', [
    [51.4874, -0.2892], [51.4870, -0.2834], [51.4848, -0.2830], [51.4844, -0.2888]]],

  /* ---- SUTTON ---------------------------------------------------------------------------- */

  /* Nonsuch Park, on the Sutton and Epsom boundary. */
  ['Nonsuch Park', [
    [51.3676, -0.2438], [51.3668, -0.2276], [51.3600, -0.2258], [51.3566, -0.2350],
    [51.3606, -0.2452], [51.3652, -0.2470]]],

  /* Cheam Park, west of the town. */
  ['Cheam Park', [
    [51.3620, -0.2214], [51.3614, -0.2126], [51.3576, -0.2120], [51.3572, -0.2210]]],

  /* Sutton Green, the top of the High Street. */
  ['Sutton Green', [
    [51.3702, -0.1972], [51.3700, -0.1912], [51.3676, -0.1910], [51.3674, -0.1970]]],

  /* Rosehill Park, on the A217 between Morden and Sutton. */
  ['Rosehill Park', [
    [51.3878, -0.1930], [51.3872, -0.1846], [51.3830, -0.1840], [51.3826, -0.1926]]],

  /* Carshalton Park and the ponds. */
  ['Carshalton Park', [
    [51.3654, -0.1662], [51.3648, -0.1580], [51.3608, -0.1576], [51.3604, -0.1658]]],

  /* Beddington Park, along the Wandle towards Croydon. */
  ['Beddington Park', [
    [51.3760, -0.1420], [51.3752, -0.1290], [51.3702, -0.1284], [51.3698, -0.1414]]],

  /* The Oaks, on the downs at the southern edge. */
  ['Oaks Park', [
    [51.3392, -0.1966], [51.3384, -0.1866], [51.3336, -0.1860], [51.3330, -0.1960]]],

  /* Manor Park, behind the High Street. */
  ['Manor Park', [
    [51.3644, -0.1908], [51.3640, -0.1848], [51.3616, -0.1844], [51.3612, -0.1904]]],

  /* Overton Park and Sutton Common, north of the town. */
  ['Sutton Common', [
    [51.3812, -0.2018], [51.3806, -0.1930], [51.3768, -0.1924], [51.3762, -0.2012]]],

  /* The Grove, Carshalton, and the ponds at the top of the Wandle. */
  ['The Grove', [
    [51.3684, -0.1690], [51.3680, -0.1626], [51.3656, -0.1622], [51.3652, -0.1686]]],

  /* Cuddington Recreation Ground, Worcester Park end. */
  ['Cuddington Rec', [
    [51.3762, -0.2258], [51.3756, -0.2184], [51.3726, -0.2180], [51.3720, -0.2254]]],

  /* Roundshaw Downs, on the old aerodrome towards Croydon. */
  ['Roundshaw Downs', [
    [51.3548, -0.1352], [51.3542, -0.1240], [51.3496, -0.1234], [51.3490, -0.1346]]],

  /* Wandle Park and Butter Hill, where the river starts. */
  ['Wandle Park', [
    [51.3730, -0.1614], [51.3726, -0.1548], [51.3702, -0.1544], [51.3698, -0.1610]]],

  /* Belmont and Banstead Downs, the chalk at the very bottom. */
  ['Banstead Downs', [
    [51.3452, -0.2088], [51.3446, -0.1946], [51.3382, -0.1938], [51.3376, -0.2080]]],
];

/* ---------- BUILDINGS ------------------------------------------------------------------------------
   The ones you would use to say where you are, and nothing else.

   NOT EVERY BUILDING. A borough is tens of thousands of footprints; drawn at this size they are
   grey noise, and fetching them would be megabytes for a texture. What is here is what somebody
   would name — the tower, the station, the shopping centre, the hospital, the stadium — which is
   what a landmark IS: a building whose name locates you.

   `size` is roughly how big it is on the ground, in metres, so the Power Station is not the same
   square as a station entrance. Positions are to about fifty metres.
--------------------------------------------------------------------------------------------- */
const BUILDINGS = [
  /* ---- MERTON ---------------------------------------------------------------------------- */
  ['Colliers Wood Tower',   51.4185, -0.1772, 'tower',   40],
  ['Tandem Centre',         51.4145, -0.1810, 'retail', 140],
  ['Merton Abbey Mills',    51.4166, -0.1795, 'civic',    70],
  ['Colliers Wood Stn',     51.4180, -0.1780, 'station',  40],
  ['Centre Court',          51.4222, -0.2070, 'retail',  110],
  ['Wimbledon Station',     51.4214, -0.2064, 'station',  90],
  ['Wimbledon Theatre',     51.4196, -0.2044, 'civic',    60],
  ['All England Club',      51.4340, -0.2140, 'sport',   240],
  ['Plough Lane',           51.4318, -0.1885, 'sport',   120],
  ['Morden Station',        51.4022, -0.1948, 'station',  60],
  ['Merton Civic Centre',   51.4014, -0.1944, 'civic',    90],
  ['Mitcham Junction',      51.3960, -0.1590, 'station',  50],
  ['Deen City Farm',        51.4108, -0.1846, 'civic',    70],

  /* ---- WANDSWORTH ------------------------------------------------------------------------ */
  ['Battersea Power Stn',   51.4816, -0.1440, 'civic',   250],
  ['Clapham Junction',      51.4646, -0.1706, 'station', 140],
  ['Southside Centre',      51.4570, -0.1918, 'retail',  150],
  ['Wandsworth Town Hall',  51.4570, -0.1888, 'civic',    80],
  ['Wandsworth Prison',     51.4514, -0.1770, 'civic',   180],
  ["St George's Hospital",  51.4266, -0.1740, 'civic',   220],
  ['Battersea Arts Centre', 51.4640, -0.1662, 'civic',    70],
  ['Wandsworth Town Stn',   51.4610, -0.1880, 'station',  60],
  ['Putney Station',        51.4610, -0.2166, 'station',  60],
  ['Balham Station',        51.4432, -0.1524, 'station',  50],

  /* ---- RICHMOND -------------------------------------------------------------------------- */
  ['Richmond Station',      51.4632, -0.3016, 'station',  90],
  ['Richmond Theatre',      51.4620, -0.3034, 'civic',    60],
  ['Richmond Riverside',    51.4590, -0.3062, 'civic',    90],
  ['Twickenham Stadium',    51.4560, -0.3416, 'sport',   250],
  ['Kew Palace',            51.4842, -0.2952, 'civic',    60],
  ['Ham House',             51.4468, -0.3106, 'civic',    70],
  ['Marble Hill House',     51.4470, -0.3200, 'civic',    50],
  ['Twickenham Station',    51.4498, -0.3352, 'station',  60],
  ['Kew Bridge',            51.4884, -0.2878, 'station',  50],

  /* ---- SUTTON ---------------------------------------------------------------------------- */
  ['Sutton Station',        51.3600, -0.1918, 'station',  80],
  ['St Nicholas Centre',    51.3628, -0.1936, 'retail',  120],
  ['Sutton Civic Offices',  51.3618, -0.1948, 'civic',    80],
  ['Royal Marsden',         51.3542, -0.1968, 'civic',   180],
  ['Honeywood Museum',      51.3666, -0.1672, 'civic',    40],
  ['Carshalton Station',    51.3684, -0.1660, 'station',  50],
  ['Nonsuch Mansion',       51.3616, -0.2346, 'civic',    60],
  ['Whitehall Cheam',       51.3596, -0.2192, 'civic',    40],
  ['Wallington Station',    51.3602, -0.1462, 'station',  50],
];

/* THE MAIN ROADS, each walked through the places it actually goes. `w` is how wide it is drawn —
   an A-road is not a residential street and a tram is neither. */
const ROADS = [
  /* A24 — Tooting Broadway, Colliers Wood, South Wimbledon, Morden, and on towards Sutton. The
     spine of the borough: three of the venues sit on it. */
  ['A24 London Road', 'a', 3.2, [
    [51.4432, -0.1520], [51.4340, -0.1600], [51.4272, -0.1676], [51.4224, -0.1738],
    [51.4180, -0.1782], [51.4152, -0.1888], [51.4120, -0.1922], [51.4022, -0.1948],
    [51.3930, -0.1936], [51.3860, -0.1930]]],

  /* A219 — Parkside down Wimbledon Hill into the town, then Merton Road to meet the A24. */
  ['A219 Wimbledon Hill', 'a', 2.6, [
    [51.4462, -0.2276], [51.4380, -0.2268], [51.4330, -0.2258], [51.4288, -0.2172],
    [51.4244, -0.2100], [51.4214, -0.2064], [51.4188, -0.2010], [51.4160, -0.1948],
    [51.4152, -0.1888]]],

  /* A238 — Kingston Road, Wimbledon out through Raynes Park. */
  ['A238 Kingston Road', 'a', 2.2, [
    [51.4196, -0.2072], [51.4158, -0.2154], [51.4118, -0.2244], [51.4076, -0.2334],
    [51.4040, -0.2426]]],

  /* A236 — Christchurch Road and Church Road, Colliers Wood down to Mitcham and on to Croydon. */
  ['A236 Church Road', 'a', 2.4, [
    [51.4180, -0.1782], [51.4120, -0.1728], [51.4062, -0.1690], [51.4014, -0.1668],
    [51.3962, -0.1592], [51.3922, -0.1500]]],

  /* A217 — Morden down through Rose Hill to Sutton. */
  ['A217 Rose Hill', 'a', 2.2, [
    [51.4022, -0.1948], [51.3946, -0.1938], [51.3862, -0.1930], [51.3780, -0.1938]]],

  /* A297 — Bishopsford Road, Mitcham across to St Helier. */
  ['A297 Bishopsford Road', 'a', 1.8, [
    [51.4014, -0.1668], [51.3960, -0.1742], [51.3918, -0.1816], [51.3888, -0.1892]]],

  /* A3 — the trunk road along the north-west edge, Wandsworth out to Kingston. */
  ['A3 Kingston Bypass', 'a', 3.2, [
    [51.4602, -0.1930], [51.4536, -0.2118], [51.4462, -0.2276], [51.4372, -0.2400],
    [51.4262, -0.2528], [51.4150, -0.2668]]],

  /* A205 — the South Circular, across the top. */
  ['A205 South Circular', 'a', 2.8, [
    [51.4652, -0.2668], [51.4618, -0.2270], [51.4570, -0.1972], [51.4536, -0.1730],
    [51.4520, -0.1490]]],

  /* THE NORTHERN LINE, which is how most people arrive: Tooting Broadway, Colliers Wood,
     South Wimbledon, Morden. */
  ['Northern line', 'rail', 1.4, [
    [51.4272, -0.1676], [51.4180, -0.1782], [51.4152, -0.1920], [51.4022, -0.1948]]],

  /* TRAMLINK, Wimbledon out across Mitcham Common towards Croydon. */
  ['Tramlink', 'tram', 1.2, [
    [51.4214, -0.2064], [51.4160, -0.1990], [51.4092, -0.1900], [51.4022, -0.1802],
    [51.3980, -0.1700], [51.3958, -0.1592], [51.3920, -0.1462]]],

  /* ---- WANDSWORTH ------------------------------------------------------------------------- */

  /* A214 Trinity Road, straight up the side of Wandsworth Common to Tooting. */
  ['A214 Trinity Road', 'a', 2.4, [
    [51.4570, -0.1706], [51.4506, -0.1682], [51.4436, -0.1652], [51.4368, -0.1620],
    [51.4300, -0.1636]]],

  /* A3205 York Road and Battersea Park Road, the whole river frontage. */
  ['A3205 York Road', 'a', 2.6, [
    [51.4644, -0.2038], [51.4650, -0.1866], [51.4700, -0.1760], [51.4744, -0.1608],
    [51.4762, -0.1470], [51.4790, -0.1338]]],

  /* A3220 Latchmere Road, up over Battersea Bridge. */
  ['A3220 Latchmere Road', 'a', 2.2, [
    [51.4844, -0.1682], [51.4762, -0.1650], [51.4690, -0.1622], [51.4622, -0.1602]]],

  /* A3036 Wandsworth Road, Vauxhall out to the one-way system. */
  ['A3036 Wandsworth Road', 'a', 2.4, [
    [51.4856, -0.1244], [51.4738, -0.1436], [51.4652, -0.1610], [51.4598, -0.1786],
    [51.4586, -0.1930]]],

  /* A217 Wandsworth Bridge Road, over the river to Fulham. */
  ['A217 Wandsworth Bridge Road', 'a', 2.2, [
    [51.4726, -0.1878], [51.4676, -0.1888], [51.4622, -0.1902], [51.4570, -0.1918]]],

  /* A306 Roehampton Lane, the heath down to the Upper Richmond Road. */
  ['A306 Roehampton Lane', 'a', 2.2, [
    [51.4716, -0.2382], [51.4640, -0.2406], [51.4558, -0.2430], [51.4482, -0.2444]]],

  /* A24 Balham High Road, Clapham South down to Tooting. */
  ['A24 Balham High Road', 'a', 2.6, [
    [51.4526, -0.1478], [51.4444, -0.1524], [51.4370, -0.1580], [51.4300, -0.1638]]],

  /* B237 Garratt Lane, the whole Wandle valley from Wandsworth to Tooting. */
  ['B237 Garratt Lane', 'b', 1.6, [
    [51.4574, -0.1900], [51.4478, -0.1866], [51.4380, -0.1836], [51.4292, -0.1780],
    [51.4258, -0.1728]]],

  /* THE DISTRICT LINE, Putney Bridge across to Wimbledon. */
  ['District line', 'rail', 1.4, [
    [51.4682, -0.2088], [51.4610, -0.2160], [51.4520, -0.2210], [51.4420, -0.2200],
    [51.4318, -0.2130], [51.4214, -0.2064]]],

  /* ---- RICHMOND -------------------------------------------------------------------------- */

  /* A316 Chertsey Road, the trunk road out over Twickenham Bridge. */
  ['A316 Chertsey Road', 'a', 3.0, [
    [51.4726, -0.2680], [51.4692, -0.2872], [51.4646, -0.3062], [51.4570, -0.3244],
    [51.4506, -0.3396]]],

  /* A307 Kew Road and Richmond Road, Kew Bridge down through the town to Petersham. */
  ['A307 Kew Road', 'a', 2.4, [
    [51.4890, -0.2870], [51.4802, -0.2934], [51.4712, -0.2996], [51.4614, -0.3046],
    [51.4522, -0.3086], [51.4438, -0.3062]]],

  /* A305 Twickenham Road, over the river and on to Hounslow. */
  ['A305 Twickenham Road', 'a', 2.0, [
    [51.4614, -0.3046], [51.4592, -0.3196], [51.4560, -0.3336], [51.4530, -0.3470]]],

  /* A310 Twickenham Road down to Hampton, past the green. */
  ['A310 Hampton Road', 'a', 1.8, [
    [51.4506, -0.3350], [51.4436, -0.3402], [51.4344, -0.3466], [51.4248, -0.3524]]],

  /* A3003 Sandycombe Road and Kew Road, Richmond up to Kew Bridge. */
  ['A3003 Sandycombe Road', 'a', 1.8, [
    [51.4640, -0.3010], [51.4712, -0.2926], [51.4788, -0.2874], [51.4856, -0.2856]]],

  /* A308 Kingston Road, out along the river to Teddington. */
  ['A308 Kingston Road', 'a', 1.8, [
    [51.4530, -0.3054], [51.4462, -0.3110], [51.4386, -0.3164], [51.4300, -0.3208]]],

  /* B353 Sheen Lane and Mortlake, up to the South Circular. */
  ['B353 Sheen Lane', 'b', 1.4, [
    [51.4664, -0.2712], [51.4700, -0.2688], [51.4744, -0.2666], [51.4784, -0.2650]]],

  /* THE DISTRICT LINE to Richmond, and the South Western beside it. */
  ['District line', 'rail', 1.4, [
    [51.4784, -0.2650], [51.4712, -0.2782], [51.4650, -0.2900], [51.4630, -0.3010]]],

  /* ---- SUTTON ---------------------------------------------------------------------------- */

  /* A232 Cheam Road and Carshalton Road, the east–west road through the whole borough. */
  ['A232 Cheam Road', 'a', 2.6, [
    [51.3596, -0.2402], [51.3612, -0.2166], [51.3634, -0.1972], [51.3648, -0.1750],
    [51.3672, -0.1546], [51.3714, -0.1338]]],

  /* A2043 Sutton High Street and Malden Road, north out towards Worcester Park. */
  ['A2043 Sutton High Street', 'a', 2.0, [
    [51.3618, -0.1938], [51.3690, -0.1946], [51.3772, -0.1976], [51.3856, -0.2044],
    [51.3928, -0.2136]]],

  /* A237 Wallington and Hackbridge, along the Wandle valley. */
  ['A237 Hackbridge', 'a', 1.8, [
    [51.3668, -0.1490], [51.3752, -0.1542], [51.3828, -0.1622], [51.3894, -0.1706]]],

  /* B278 Sutton Common Road and Green Wrythe Lane, across the north of the borough. */
  ['B278 Sutton Common Road', 'b', 1.5, [
    [51.3746, -0.2032], [51.3768, -0.1922], [51.3790, -0.1806], [51.3806, -0.1690]]],

  /* B2230 Brighton Road, the High Street carrying on south towards Belmont. */
  ['B2230 Brighton Road', 'b', 1.6, [
    [51.3618, -0.1938], [51.3546, -0.1958], [51.3466, -0.1988], [51.3392, -0.2014]]],

  /* A2022 Woodmansterne Road, Carshalton Beeches across to Wallington. */
  ['A2022 Woodmansterne Road', 'a', 1.8, [
    [51.3510, -0.1802], [51.3538, -0.1660], [51.3568, -0.1512], [51.3596, -0.1376]]],

  /* THE SUTTON LINE, the railway everything down here hangs off. */
  ['Sutton line', 'rail', 1.4, [
    [51.4022, -0.1948], [51.3906, -0.1970], [51.3792, -0.1962], [51.3684, -0.1930],
    [51.3618, -0.1912]]],

  /* THE EPSOM LINE through Cheam and Ewell, west out of Sutton. */
  ['Epsom line', 'rail', 1.4, [
    [51.3618, -0.1912], [51.3606, -0.2074], [51.3592, -0.2216], [51.3576, -0.2372]]],
];

/**
 * THE GROUND, projected.
 *
 * Nothing here is generated any more. It was — a seed rolled blobs and curves that looked like
 * terrain and described nowhere — and the argument for it was that hand-drawing terrain is a lot
 * of typing. Which is true of a TILE GRID and false of this: the big things are a dozen lines,
 * they are facts rather than decoration, and a park in the right place is worth more than nine in
 * plausible ones.
 *
 * NOTHING WITHOUT COORDINATES. Real parks around invented venue positions would be a map that is
 * half true, which is worse than one that is honestly not — the same rule the river follows.
 */
/* A river's points in the box, or nothing at all if none of it comes near. Judged like a road —
   by whether ANY of it shows — rather than like a park, which is judged by its middle. */
function onFrame_(line, p, near) {
  const pts = line.map(([la, ln]) => ({ x: p.x(ln), y: p.y(la) }));
  return pts.some(q => near(q.x, q.y, 12)) ? pts : [];
}

function mapTerrain() {
  const p = mapProject();
  if (!p) return { green: [], roads: [], buildings: [], river: [], wandle: [], brooks: [] };

  /* WHAT IS ACTUALLY IN VIEW. Everything used to be drawn and clipped by the frame, so a map of
     Merton filled with the edges of things miles away. A map of a world shows that world.
     The radius-scaling that lived here went with the circles: a park is an outline now, and an
     outline is already in the right units. */
  const near = (x, y, pad) => x > -pad && x < 100 + pad && y > -pad && y < 100 + pad;

  return {
    green: PARKS.map(([name, outline]) => {
      const pts = outline.map(([la, ln]) => ({ x: p.x(ln), y: p.y(la) }));
      const cx = pts.reduce((n, q) => n + q.x, 0) / pts.length;
      const cy = pts.reduce((n, q) => n + q.y, 0) / pts.length;
      return { name, pts, cx, cy,
        /* Closed, so it is a shape rather than a line that happens to return to its start. */
        d: pts.map((q, i) => (i ? 'L' : 'M') + q.x.toFixed(1) + ' ' + q.y.toFixed(1)).join(' ') + ' Z' };
    /* Tight, now that a world has a floor under its size. At 15 a map of Merton reached Beddington
       Park, which is in Sutton and belongs to World 4. */
    }).filter(g => near(g.cx, g.cy, 10)),

    roads: ROADS.map(([name, kind, w, pts]) => ({
      name, kind, w,
      d: pts.map(([la, ln], i) => (i ? 'L' : 'M') + p.x(ln).toFixed(1) + ' ' + p.y(la).toFixed(1))
             .join(' '),
      /* A road is kept if ANY of it crosses the frame — unlike a park, which is judged by its
         middle. A road is long and mostly elsewhere by nature; the A3 belongs on a Merton map for
         the corner of it that clips the north-west, and dropping it for having its centre in
         Kingston would be dropping it for being a road. */
      near: pts.some(([la, ln]) => near(p.x(ln), p.y(la), 12)),
    })).filter(r => r.near),

    /* EVERY RIVER, CULLED LIKE A ROAD — kept if any part of it crosses the frame, because a river
       is long and mostly elsewhere by nature. This was the one layer nothing culled, so the Wandle
       was drawn on a map of Richmond and the Crane on a map of Sutton: a line ruled straight across
       a borough it is nowhere near, which is worse than a missing river because it looks like one.
       Named separately because the Thames is drawn wider than the rest — it is wider — and because
       a world usually has one that matters more: the Wandle in Merton, the Beverley Brook in
       Richmond. */
    /* THE BUILDINGS, as footprints. `size` is metres on the ground, and a metre is about
       0.000009 degrees of latitude — so a 250-metre power station comes out four times the width
       of a 60-metre theatre, which is the point of storing a size rather than drawing every
       building the same square. */
    buildings: BUILDINGS.map(([name, la, ln, kind, metres]) => {
      const x = p.x(ln), y = p.y(la);
      /* Scaled through the projection like everything else, so a building keeps its size relative
         to the ground when the world's frame changes. */
      const w = Math.max(1.1, Math.abs(p.y(la + metres * 0.000009) - y));
      return { name, kind, x, y, w };
    /* GENEROUS, because a building past the edge is clipped by the frame anyway and there are only
       forty of them — where being tight cost the two most recognisable buildings in two of the
       worlds: Twickenham Stadium sat eight units off the left of Richmond and Battersea Power
       Station six off the top of Wandsworth. */
    }).filter(b => near(b.x, b.y, 10)),

    river: onFrame_(THAMES, p, near),
    wandle: onFrame_(WANDLE, p, near),
    brooks: [BEVERLEY, CRANE].map(r => onFrame_(r, p, near)).filter(r => r.length),
  };
}

/* THE GAME LAYER IS GONE, for now.
   There was a path drawn between the venues in the order they came, a gold stretch showing how far
   ticked topics had carried you, a node lit as "here", and locking that could shut the ones ahead.
   None of it was true of anything: the path was not a route anybody walks, the order was the order
   the sheet happened to be in, and "here" was a division sum.
   What is left is a map of where the venues actually are, on ground that is actually there. The
   progression can come back once the ground is right, and it will be worth more sitting on
   something accurate than it was sitting on something invented.
--------------------------------------------------------------------------------------------- */

/* A NAME SHORT ENOUGH TO SIT UNDER A PIN. "Library" and "Centre" go because every one of them is a
   library or a centre — what tells them apart is the place, which is the part worth keeping.

   This was defined next to the projection maths and went out with it when the fake third dimension
   was removed. Nothing complained: it is only called inside a template string, so the file parsed,
   every check passed, and the map would have thrown the moment anybody opened it. That is the exact
   failure `stub-run` exists for, and the map is not in it — which is worth more than the fix. */
const shortName = t => String(t || '')
  .replace(/\b(library|centre|center|business|the)\b/gi, '')
  .replace(/\s+/g, ' ').trim().split(' ').slice(0, 2).join(' ') || String(t || '');

function drawOverworld() {
  const host = $('map-board');
  if (!host) return;

  const world = mapWorld();
  const worlds = mapWorlds();
  const nodes = mapLayout();
  const unplaced = mapNodes().length - nodes.length;

  if (!nodes.length) {
    host.innerHTML = `<p class="note" style="padding:1rem;text-align:center">
      ${world.name ? esc(world.name) + ' has no venue with a postcode yet.'
                   : 'No venues yet.'}</p>`;
    return;
  }

  const ground = mapTerrain();
  const asPath = list => list.length
    ? list.map((r, i) => (i ? 'L' : 'M') + r.x.toFixed(1) + ' ' + r.y.toFixed(1)).join(' ') : '';

  host.innerHTML = `<svg viewBox="0 0 100 100" class="map-svg" aria-hidden="true">
    ${/* PAINTER'S ORDER: the ground, then the green on it, then the water, then the roads that
          bridge the water, then the venues — which are the only thing here that is not scenery and
          so must never be drawn over. */''}
    <rect x="0" y="0" width="100" height="100" class="map-land"/>

    ${ground.green.map(g => `<path d="${g.d}" class="map-green"
      ><title>${esc(g.name)}</title></path>`).join('')}

    ${(() => { const d = asPath(ground.wandle);
               return d ? `<path d="${d}" class="map-water map-wandle"/>` : ''; })()}
    ${(ground.brooks || []).map(b => { const d = asPath(b);
        return d ? `<path d="${d}" class="map-water map-brook"/>` : ''; }).join('')}
    ${(() => { const d = asPath(ground.river);
               return d ? `<path d="${d}" class="map-water"/>` : ''; })()}

    ${/* Every casing first, then every fill — not casing-then-fill road by road, which would let
          one road's dark edge cut across the road beside it at every junction. Two passes is how a
          road map is drawn and the only way junctions look joined. */''}
    ${ground.roads.map(r => `<path d="${r.d}" class="map-case"
      stroke-width="${(r.w + 1).toFixed(1)}"/>`).join('')}
    ${ground.roads.map(r => `<path d="${r.d}" stroke-width="${r.w.toFixed(1)}" class="map-street ${
      r.kind === 'tram' ? 'map-tram' : r.kind === 'rail' ? 'map-rail'
      : r.kind === 'b' ? 'map-road-b' : 'map-road-a'
      }"><title>${esc(r.name)}</title></path>`).join('')}

    ${/* BUILDINGS, on top of the roads because they front onto them. Top-down like everything
          else — a footprint, not a little house seen from the side. Squares mostly, because from
          above most buildings are, and a station is drawn longer than it is wide because a
          platform is. */''}
    ${ground.buildings.map(b => {
      const long = b.kind === 'station' || b.kind === 'retail';
      const w = b.w, h = long ? b.w * 0.45 : b.w * 0.8;
      return `<rect x="${(b.x - w / 2).toFixed(1)}" y="${(b.y - h / 2).toFixed(1)}"
        width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="0.3"
        ${/* WRITTEN OUT, not assembled. `map-bld-${kind}` produces the same markup and is invisible
              to the check that every styled class is actually emitted — which is the check that has
              now caught three rules outliving their purpose. A class built by concatenation is a
              class that check cannot see. */''}
        class="map-bld ${
          b.kind === 'tower' ? 'map-bld-tower' : b.kind === 'station' ? 'map-bld-station'
          : b.kind === 'retail' ? 'map-bld-retail' : b.kind === 'sport' ? 'map-bld-sport'
          : 'map-bld-civic'
        }"><title>${esc(b.name)}</title></rect>`;
    }).join('')}

    ${/* THE VENUES. No path between them: there was one, drawn in the order the sheet happened to
          hold them, and it was not a route anybody walks. A map says where things are. */''}
    ${/* A VENUE IS A BUILDING TOO, and the only one that is coloured — everything else on the map
          is where you are, this is where you are going. Drawn as a footprint like the rest so it
          sits in the same world rather than floating over it as a pin. */''}
    ${nodes.map((n, i) => `<g class="map-node" data-do="map-node" data-i="${i}"
         data-name="${esc(n.v.title)}"
         transform="translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})">
      <rect x="-2.2" y="-1.8" width="4.4" height="3.6" rx="0.4" class="map-venue"/>
      <text x="0" y="6" class="map-name">${esc(shortName(n.v.title))}</text>
    </g>`).join('')}
  </svg>

  <div class="map-world">
    ${worlds.length > 1 ? '<span class="map-arrow" data-do="map-world" data-by="-1">‹</span>' : ''}
    <span class="map-world-name">World ${MAP_WORLD + 1} · ${esc(world.name || 'Nowhere')}</span>
    ${worlds.length > 1 ? '<span class="map-arrow" data-do="map-world" data-by="1">›</span>' : ''}
  </div>
  <p class="map-where">${nodes.length} place${nodes.length === 1 ? '' : 's'}</p>
  ${unplaced ? `<p class="faint" style="text-align:center">${unplaced} more without a postcode.</p>`
             : ''}`;
}

on('map-world', el => {
  const all = mapWorlds();
  /* A DIRECTION, OR NOTHING HAPPENS. Without the guard a press carrying no `data-by` gives
     `Number(undefined)` — NaN — and NaN survives every clamp below it, so `MAP_WORLD` becomes NaN,
     `mapWorld()` indexes the list with it, and the map throws on `.venues` of undefined from then
     on. One malformed press and the screen is dead until a reload. */
  const by = Number(el && el.dataset && el.dataset.by);
  if (!by) return;
  MAP_WORLD = (MAP_WORLD + by + all.length) % Math.max(1, all.length);
  drawOverworld();
});

/* Tapping a venue opens it. Nothing to refuse — there is no locking any more, so there is no
   sentence explaining why you cannot. */
on('map-node', el => {
  const n = mapLayout()[Number(el.dataset.i)];
  if (n) ACTIONS.who({ dataset: { kind: 'venue', name: n.v.title } });
});

function initOverworld() { drawOverworld(); }

const WIDGETS = [
  { id: 'chess', kind: 'game', name: 'Chess', start: () => initChess?.(),
    into: 'chess-board', what: 'The board',
    html: `<div class="card">
    <h3>Chess</h3>
    <p class="sub">Against the computer. Full rules, including castling and en passant.</p>
    <div id="chess-board" class="chess"></div>
    <p class="note" id="chess-say" style="text-align:center;margin:.2rem 0 .6rem">
      Your move — you are white.</p>
    <div class="btn-row">
      <button class="btn quiet" data-do="chess-new">New game</button>
      <button class="btn quiet" data-do="chess-undo">Take back</button>
      <select id="chess-level" style="flex:0 0 7rem">
        <option value="1">Gentle</option>
        <option value="2" selected>Steady</option>
        <option value="3">Tough</option>
      </select>
    </div>
  </div>` },
  { id: 'tables', kind: 'game', name: 'Times Tables', start: () => initTables?.(),
    into: 'tt-idle', what: 'The sprint',
    html: `<div class="card">
    <h3>Times Tables Sprint</h3>
    <div id="tt-idle">
      <p class="sub">Sixty seconds. As many as you can.</p>
      <button class="btn" id="tt-play" data-do="tt-start">Start</button>
    </div>
    <div id="tt-question" class="hidden tt">
      <p class="mono" id="tt-q" style="font-size:2rem;text-align:center;margin:.6rem 0">—</p>
      <input id="tt-answer" inputmode="numeric" placeholder="answer" autocomplete="off">
      <p class="note" id="tt-feedback" style="text-align:center;min-height:1.2em"></p>
      <div class="row"><span class="k">Time</span><span class="v mono" id="tt-time">60</span></div>
      <div class="row"><span class="k">Right</span><span class="v mono" id="tt-score">0</span></div>
      <button class="btn quiet" data-do="tt-stop" style="margin-top:.5rem">Give up</button>
    </div>
    <div id="tt-over" class="hidden"></div>
  </div>` },
  { id: 'flabby', kind: 'game', name: 'Flabby Pird', start: () => initFlappy?.(),
    into: 'flappy-canvas', what: 'The game',
    html: `<div class="card">
    <h3>Flabby Pird</h3>
    <p class="sub">Harder than it looks.</p>
    <canvas id="flappy-canvas" class="flappy"></canvas>
    <p class="note" id="flappy-msg" style="text-align:center;margin:.4rem 0 0">Tap to play</p>
    <div class="row"><span class="k">Score</span><span class="v mono" id="flappy-score">0</span></div>
    <div class="row"><span class="k">Best</span><span class="v mono" id="flappy-best">0</span></div>
  </div>` },
  { id: 'overworld', kind: 'game', name: 'The Overworld', start: () => initOverworld?.(),
    into: 'map-board', what: 'The map',
    html: `<div class="card">
      <h3>The Overworld</h3>
      <p class="sub">Every place we teach, and how far along you have got.</p>
      <div id="map-board" class="map"></div>
    </div>` },

  { id: 'reels', kind: 'game', name: 'One more thing', start: () => initFeed?.(),
    into: 'feed-screen', what: 'This',
    html: `<div class="card">
    <h3>One more thing</h3>
    <p class="sub">Something worth knowing. Tap for another.</p>
    <div id="feed-screen" class="feed" data-do="feed-tap"></div>
  </div>` },
  { id: 'calculator', kind: 'tool', name: 'Calculator', start: () => initMiniCalc?.(),
    into: 'mc-display', what: 'The calculator',
    html: `<div class="card">
    <h3>Calculator</h3>
    ${/* A DIV, not an input. A readonly input shows no caret on a phone, and one that is not
          readonly opens the keyboard over the keypad you are trying to press — so the caret is
          drawn, which is what makes the arrows mean anything. */''}
    <div id="mc-display" class="mc-display mono">0</div>
    <div class="mc-grid">
      ${CALC_KEYS.map(([v, label, cls]) =>
        `<button type="button" class="mc-btn ${cls}" data-mc="${esc(v)}">${esc(label)}</button>`
      ).join('')}
    </div>
  </div>` },
  { id: 'timer', kind: 'tool', name: 'Timer', start: () => initTimer?.(),
    into: 'timer-display', what: 'The timer',
    html: `<div class="card">
    <h3>Timer</h3>
    <p class="mono" id="timer-display" style="font-size:2.1rem;text-align:center;margin:.4rem 0">25:00</p>
    <div class="btn-row">
      ${/* A `data-do`, not an id. The delegated click handler only ever looks for `data-do`, so a
            button carrying an id alone is a button nothing is listening to — which is why this
            has never started anything. */''}
      <button class="btn quiet" data-do="timer-toggle" id="timer-toggle">▶</button>
      <button class="btn quiet" data-do="timer-reset">Reset</button>
    </div>
    ${/* The lengths people actually use. A number field for a duration is a keyboard and four taps
          for a question whose answer is almost always one of four. */''}
    <div class="btn-row" style="margin-top:.4rem">
      ${[5, 15, 25, 45].map(m =>
        `<button class="btn quiet tiny" data-do="timer-set" data-min="${m}">${m}</button>`).join('')}
    </div>
  </div>` },
  { id: 'docket', kind: 'tool', name: 'Docket', start: () => paintDocket?.(),
    into: 'docket-body', what: 'The docket',
    html: `<div class="card">
    <h3>Docket</h3>
    <p class="sub">What there is to do. Tick it off as you go.</p>
    <div id="docket-body"></div>
    <div class="dock-new">
      <input id="dock-add" placeholder="Add a line…" autocomplete="off">
      <button class="btn quiet tiny" data-do="dock-add">＋</button>
    </div>
    <p class="faint" id="dock-said" style="margin:.35rem 0 0"></p>
  </div>` },
  { id: 'notepad', kind: 'tool', name: 'Notepad', start: () => initPad?.(),
    into: 'notepad', what: 'The notepad',
    html: `<div class="card">
    <h3>Notepad</h3>
    <textarea id="notepad" placeholder="Jot something down…"></textarea>
    <p class="faint" id="pad-said" style="margin:.35rem 0 0">Saves as you type.</p>
  </div>` },
  { id: 'calendar', kind: 'tool', name: 'Calendar', start: () => initCalendar?.(),
    into: 'cal-body', what: 'The calendar',
    html: `<div class="card">
    <div class="cal-head">
      <span class="cal-arrow" data-do="cal-back">‹</span>
      <h3 id="cal-label" style="margin:0">Calendar</h3>
      <span class="cal-arrow" data-do="cal-fwd">›</span>
    </div>
    <div id="cal-body" class="cal"></div>
  </div>` },
];



/* The calculator keys go through the same delegated handler as everything else. The old app kept a
   `window._mcClick` and the carried-over function still sets it — so this hands the press to it
   rather than reimplementing arithmetic that already works. */
document.addEventListener('click', e => {
  const k = e.target.closest('[data-mc]');
  if (k) window._mcClick?.(k.dataset.mc);
});

/* ---------- BOOK --------------------------------------------------------------------------------
   The classes that exist, and the way to ask for one that does not. The pricing chain underneath
   this is the one carried over whole — the screen only has to show what it says.
--------------------------------------------------------------------------------------------- */
/** Everything on the Book screen, in order. */
function bookBlocks() {
  const jobs = DATA.liveJobs || DATA.jobs || [];
  const mine = USER ? jobs.filter(j => norm(j.client) === norm(USER.name)
                                    || norm(j.tutor) === norm(USER.name)) : [];
  const open = jobs.filter(j => !mine.includes(j));

  const jobCard = j => `
    <div class="card tap" data-do="job" data-id="${esc(String(j.id || j.jobId || ''))}">
      <h3>${esc(j.subject || 'Session')}${j.level ? ' · ' + esc(j.level) : ''}</h3>
      <p class="sub">${esc([j.venue, j.weekday, j.time].filter(Boolean).join(' · '))}</p>
      <div class="row">
        <span class="k">${esc(j.status || 'Open')}</span>
        <span class="v mono">${j.price ? money(j.price) : ''}</span>
      </div>
    </div>`;

  /* Built as blocks rather than one string, because the pager needs the pieces and this screen's
     pieces are already separate things — the button, the two headings, a card per session. */
  return [
    USER
      ? `<button class="btn" data-do="new-booking" style="margin-bottom:4px">Ask for a session</button>`
      : `<div class="card"><h3>Sign in to book</h3>
           <p class="sub">You need an account to ask for a session.</p>
           <button class="btn" data-do="signin">Sign in</button></div>`,
    mine.length ? '<h2><span>Yours</span></h2>' : '',
    ...mine.map(jobCard),
    open.length ? '<h2><span>Open</span></h2>' : '',
    ...open.map(jobCard),
    !jobs.length ? '<p class="empty">No sessions yet.</p>' : '',
  ].filter(Boolean);
}

const bookPages = () => chunk(bookBlocks(), PER_PAGE.book);

screen('book', () => pages('book', bookPages()), () => USER ? '' : '<span class="act" data-do="signin">Sign in</span>');
on('soon', () => toast('Not moved across yet'));
on('signin', () => toast('Sign-in screen next'));
/* ================================================================================================
   THE BOOKER.

   Nine things have to be known before a session can be asked for: subject, level, how many
   students, where, which days, what time, how long, for how many weeks, and whether a particular
   tutor. Put on one screen that is a form nobody finishes on a phone.

   SO IT IS THE SAME FUNNEL AS FIND. One question at a time, each answer narrowing the next, and
   the price appearing the moment it can be worked out rather than at the end. Which is not a
   stylistic echo — it is the same problem. A booking is a search through everything you COULD ask
   for, and the questions that matter depend on the answers already given: nobody is asked about a
   tier at KS3, and nobody is asked which room when the venue has one.

   TWO RULES CARRIED OVER, both learned the hard way on the finding screen:

     A QUESTION EVERYONE ANSWERS THE SAME WAY IS NOT ASKED. One venue means no venue question. One
     interval means no interval question. It is not a shortcut, it is the difference between a form
     and a conversation.

     AN ANSWER IS NEVER TAKEN AWAY. Choosing a small room after asking for six students does not
     silently drop you to four. The conflict is SHOWN — the room says why it does not fit — and it
     is yours to resolve. `setOptions` has done this for the old form since the beginning and the
     reasoning is written out there; this obeys the same rule for the same reason.
================================================================================================ */
/* EVERY ANSWER STARTS EMPTY, including the numbers.
   `n` began at 1 and `hours` at 0 — sensible defaults, and both counted as ANSWERED, so the
   booker never asked how many students were coming and quietly booked for one. A default is the
   app answering on somebody's behalf and then showing them the answer as though they gave it,
   which is the same fault `setOptions` was written to avoid on the old form.
   They become numbers in `bookSpec`, which is where a number is actually needed. */
const BOOKING = {
  subjects: [], level: '', n: '', loc: '', hosting: '',
  /* `m16` codes — Monday at four. One list replaces days, time and length, because ticking two
     adjacent hours says all three at once. */
  slots: [],
  /* Which questions have been finished with. A multiple-choice question needs telling. */
  done: [],
  /* The addresses of the other families, and whether the question has been put at all. */
  splitWith: [], splitAsked: false,
  interval: '', tutor: '', service: '',
};

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* The day codes the availability grids are written in. `m16` is Monday at four. */
const SLOT_DAYS = [['m', 'Monday'], ['tu', 'Tuesday'], ['w', 'Wednesday'], ['th', 'Thursday'],
                   ['f', 'Friday'], ['sa', 'Saturday'], ['su', 'Sunday']];

/* ---------- WHEN, AS ONE QUESTION -----------------------------------------------------------------
   This was three: which day, what time, how long. It is one, and the reason is written in the old
   file at `onSlotTick` — a session length chosen separately from the hours ticked meant two
   controls describing one thing, and everything that function did existed to force them to agree.
   Tick two hours on Monday and you have said the day, the time AND the length. Tick two more on
   Wednesday and you have a second session a week, which three separate questions could not express
   at all.

   AND IT ONLY OFFERS HOURS SOMEBODY CAN ACTUALLY TEACH IN. The tutor's availability and the
   venue's, overlapped. My three questions offered every hour of every day and would happily have
   booked a tutor who does not work Sundays into a library that shuts at four.
--------------------------------------------------------------------------------------------- */

/** An availability grid as a set of `m16` codes, from whatever shape the payload uses. */
function availSet_(a) {
  const out = {};
  if (!a) return out;
  if (Array.isArray(a)) { a.forEach(k => { out[norm(k)] = true; }); return out; }
  Object.keys(a).forEach(k => {
    const v = a[k];
    if (v === false || v === '' || v === 0) return;
    /* Either `{ m16: true }` or `{ m: [16,17] }` — both shapes exist in the sheet's history. */
    if (Array.isArray(v)) v.forEach(h => { out[norm(k) + String(h).padStart(2, '0')] = true; });
    else out[norm(k)] = true;
  });
  return out;
}

/** Which hours can be booked, and why not when there are none. */
function slotGrid() {
  const t = tutorRow_();
  const sp = spaceFor(BOOKING.loc);
  const venue = (DATA.venues || []).find(x => norm(x.title) === norm(BOOKING.loc));
  const tAvail = availSet_(t && t.avail);
  const vAvail = availSet_((sp && sp.avail) || (venue && venue.avail));
  const haveT = Object.keys(tAvail).length, haveV = Object.keys(vAvail).length;

  /* NOTHING SET IS NOT THE SAME AS NOTHING FREE. A tutor with no hours in the sheet has not said
     they are unavailable — nobody has said anything — so every hour is offered and the sheet is
     the thing to fix. Refusing everything would be the app inventing a constraint. */
  const open = code => (!haveT || tAvail[code]) && (!haveV || vAvail[code]);

  /* EVERY DAY AND EVERY HOUR, ALWAYS — the ones nobody is free for greyed rather than removed.
     A grid that changes shape as you choose things cannot be read: you cannot tell a Tuesday the
     tutor does not work from a Tuesday that was never offered, and the row moving under your thumb
     as you pick a venue is the same fault the dropdowns had before they started showing WHY an
     option does not fit instead of dropping it. */
  /* TEN TILL EIGHT, and eight is included — a session starting at eight is a session, and a grid
     that stops at the last START time has to explain itself. Eleven columns rather than fourteen,
     which is three fewer boxes sharing the same row and so three-fourteenths more width for each
     of them. */
  const hours = [];
  for (let h = 10; h <= 20; h++) hours.push(h);
  const rows = SLOT_DAYS.map(([prefix, label]) => ({
    prefix, label,
    hours: hours.map(h => {
      const code = prefix + String(h).padStart(2, '0');
      return { h, code, open: open(code) };
    }),
  }));
  const anyOpen = rows.some(r => r.hours.some(h => h.open));

  const why = anyOpen ? ''
    : !haveT && !haveV ? 'Nobody has set any hours yet.'
    : !haveT ? 'That venue is open, but the tutor has no hours set.'
    : !haveV ? 'The tutor has hours, but that venue has none set.'
    : 'The tutor’s hours and the venue’s do not overlap.';
  return { rows, why, anyOpen };
}

/**
 * THE TICKED HOURS, GROUPED INTO SESSIONS.
 *
 * A run of adjacent hours in one day IS a session, and its length IS the session length. Carried
 * over whole from `lessonRuns`, because it is the rule that lets one grid answer three questions.
 */
function bookRuns() {
  /* A LIST, WHATEVER HAPPENED. Anything that writes a string here is a bug elsewhere, and it
     should not become a crash three functions away from its cause. */
  const on = (Array.isArray(BOOKING.slots) ? BOOKING.slots : []).map(c => ({
    day: String(c).replace(/\d+$/, ''), hour: Number(String(c).match(/\d+$/) || 0),
  }));
  const runs = [];
  on.forEach(t => {
    /* The first hour of a run is one with nothing ticked directly before it in the same day. */
    if (on.some(x => x.day === t.day && x.hour === t.hour - 1)) return;
    let hours = 1;
    while (on.some(x => x.day === t.day && x.hour === t.hour + hours)) hours++;
    const dayName = (SLOT_DAYS.find(d => d[0] === t.day) || [])[1] || t.day;
    runs.push({ day: t.day, dayName, hour: t.hour, hours });
  });
  return runs.sort((a, b) => a.day.localeCompare(b.day) || a.hour - b.hour);
}

/* Every question, in the order somebody assembles a booking: WHAT, then WHO FOR, then WHERE, then
   WHEN, then HOW LONG, then WHO BY. `multi` means several answers are normal rather than an edge
   case — two subjects in one session is a thing people do, one venue is not.
   `why` is what makes an option that does not fit visible instead of absent. */
const BOOK_STEPS = [
  { id: 'subjects', label: 'What are we working on?', multi: true,
    options: () => (subjectRows() || []).map(x => x.name) },

  { id: 'level', label: 'What level?',
    options: () => ((DATA.dropdowns || {}).levels || []) },

  { id: 'n', label: 'How many students?',
    options: () => {
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_());
      const out = [];
      for (let i = 1; i <= Math.min(12, lim.max); i++) out.push(String(i));
      return out;
    },
    why: v => {
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_());
      if (Number(v) > lim.max) return 'more than ' + (lim.why.max || 'the limit') + ' allows';
      if (Number(v) < lim.min) return (lim.why.min || 'the minimum') + ' needs ' + lim.min;
      return '';
    } },

  { id: 'loc', label: 'Where?',
    options: () => ['At home'].concat(bookableSpaces().map(x => x.label)),
    why: v => {
      const sp = spaceFor(v);
      /* The seat count is already chosen by now, so a room too small says so rather than
         quietly resetting it. */
      if (sp && Number(sp.max) && BOOKING.n > Number(sp.max)) {
        return 'holds ' + sp.max + ', you asked for ' + BOOKING.n;
      }
      return '';
    } },

  /* "I'LL HOST" IS A CHOICE, and it was an inference — turned on only when somebody picked "At
     home", so a client who wanted to provide the room at a paid venue could not say so and never
     saw the saving. The rule the pricing chain has always followed is written at `const V`: the
     client provides the space, so they pay no venue rent, and it is AUTO-ON AND LOCKED for a venue
     that costs nothing.
     Locked is what `nextBookStep` already does with a one-answer question — a free venue offers
     only "Yes", so it is filled in and never asked. Nothing special is needed for the lock; it
     falls out of the rule that a question with one answer is not a question. */
  { id: 'hosting', label: 'Are you providing the space?',
    options: () => {
      const rate = venueRate_();
      /* Nothing to charge means nothing to decide: hosting is already true and asking would be
         the app consulting somebody about a fact. */
      return rate > 0 ? ['No', 'Yes'] : ['Yes'];
    },
    /* The saving was spelled out here and it is already on the card: the Host row shows
       − £15.00/h against the venue's + £15.00/h, one line apart. Saying it twice made the option
       longer to read than the question. */
    label_: v => v === 'Yes' ? 'Yes — no room hire' : 'No — we book the room' },

  /* ONE QUESTION WHERE THERE WERE THREE. `days`, `time` and `hours` all described the same
     fact, which is the mistake the old file had already found and removed: two controls for one
     thing means code whose whole job is making them agree.
     `grid` rather than a list, so it is drawn by hand below rather than as options. */
  { id: 'slots', label: 'When?', grid: true,
    options: () => slotGrid().rows.length ? ['grid'] : [] },

  { id: 'interval', label: 'Over what period?',
    options: () => (DATA.intervals || []).map(x => x.label || x.term).filter(Boolean) },

  /* SHARING THE COST. The pricing chain divides by `splitShares` and has since the beginning —
     three families in one session each pay a third — and the form never set it, so the feature
     existed and could not be reached. It is asked last but one because it changes the price
     without changing the session. */
  /* NAMING SOMEONE IS SPLITTING WITH THEM. The old form learned this the hard way: a count
     chosen separately from the addresses is two statements of one fact, and choosing three while
     naming two leaves neither the price nor the invitation list knowing which is true.
     So there is no number to pick. The count IS how many addresses have been given. */
  { id: 'splitOthers', label: 'Sharing the cost with anyone?', emails: true,
    options: () => ['emails'] },

  { id: 'tutor', label: 'Anyone in particular?',
    options: () => ['No preference'].concat(
      (DATA.tutors || []).filter(t => t.listed !== false && t.title).map(t => t.title)),
    why: v => {
      if (v === 'No preference') return '';
      const t = (DATA.tutors || []).find(x => norm(x.title) === norm(v));
      if (!t || !BOOKING.subjects.length) return '';
      const teaches = (t.teaches || []).map(x => norm(String(x).replace(/\s*\([^)]*\)/, '')));
      const missing = BOOKING.subjects.filter(sub => teaches.indexOf(norm(sub)) === -1);
      return missing.length ? 'does not teach ' + missing.join(', ') : '';
    } },
];

const tutorRow_ = () => (DATA.tutors || []).find(t => norm(t.title) === norm(BOOKING.tutor)) || null;

/* What the chosen place costs an hour — the ROOM's own rate where there is one, because a small
   room and a large one at the same venue are different prices and the building's single figure
   could only ever be right for one of them. */
function venueRate_() {
  if (!BOOKING.loc || BOOKING.loc === 'At home') return 0;
  const sp = spaceFor(BOOKING.loc);
  if (sp) return Number(sp.rate) || 0;
  const v = (DATA.venues || []).find(x => norm(x.title) === norm(BOOKING.loc));
  return v ? Number(v.bestRate) || 0 : 0;
}

const bookStep_ = id => BOOK_STEPS.find(s => s.id === id);

/** Has this one been answered? A multi is answered when it holds anything. */
function bookAnswered_(step) {
  /* A QUESTION YOU CAN ANSWER SEVERAL TIMES IS FINISHED WHEN YOU SAY IT IS.
     This returned true the moment ONE thing was ticked — so picking Maths counted as an answer,
     the booker moved straight on, and the Done button that would have let you add Physics was
     never drawn. Both multiple-choice questions were single-choice in practice: subjects, and the
     hours grid, where it meant you could book one hour and never two.
     `done` is the list of questions somebody has finished with. */
  if (step.multi || step.grid) {
    const any = step.grid ? (Array.isArray(BOOKING.slots) && BOOKING.slots.length > 0)
                          : (BOOKING[step.id] || []).length > 0;
    return any && (BOOKING.done || []).indexOf(step.id) !== -1;
  }
  /* Answered by SAYING so, since nought is a legitimate answer and an empty list cannot be told
     apart from an unanswered one. */
  if (step.emails) return BOOKING.splitAsked === true;
  const v = BOOKING[step.id];
  /* EMPTY IS UNANSWERED. NOTHING ELSE IS.
     This also refused '0', from when `hours` started at 0 and had to be told apart from a real
     answer. Everything starts empty now, so that guard had nothing left to protect — and it made
     "Just us", which is nought other families, impossible to record: the question was answered,
     the answer was thrown away, and it was asked again for ever.
     A zero is an answer. It is the answer to most of the questions worth asking. */
  return String(v ?? '') !== '';
}

/**
 * THE NEXT QUESTION WORTH ASKING, or nothing left.
 *
 * Skipped when answered, and skipped when there is only one thing it could be — in which case the
 * answer is filled in on the way past. One venue is not a choice, and asking is the app pretending
 * to consult somebody it has already decided for.
 */
function nextBookStep() {
  for (const step of BOOK_STEPS) {
    if (bookAnswered_(step)) continue;
    const opts = step.options().filter(Boolean);
    if (!opts.length) continue;                    // nothing to offer: leave it unanswered
    /* A GRID AND AN EMAIL LIST ARE NOT ONE-ANSWER QUESTIONS. Both declare a single option because
       they are drawn rather than listed — and the fill-in-the-only-answer rule took that literally,
       writing the string 'emails' into the booking and skipping the question entirely. The rule is
       about a LIST with one entry in it; these have no list. */
    if (opts.length === 1 && !step.multi && !step.grid && !step.emails) {
      BOOKING[step.id] = opts[0];                  // the only answer there is
      continue;
    }
    return step;
  }
  return null;
}

/** What the pricing chain wants, out of what has been answered so far. */
function bookSpec() {
  const iv = (DATA.intervals || []).find(x => (x.label || x.term) === BOOKING.interval) || {};
  const runs = bookRuns();
  /* The session length IS the length of a run — not a separate answer that has to be reconciled
     with the hours ticked. Where runs differ, the first one names the session; the total hours a
     week is what the price is actually built from. */
  const hours = runs.length ? runs[0].hours : 0;
  const perWeek = runs.reduce((n, r) => n + r.hours, 0);
  const days = [...new Set(runs.map(r => r.dayName))];
  const firstHour = runs.length ? String(runs[0].hour).padStart(2, '0') + ':00' : '';
  return {
    subjects: BOOKING.subjects, level: BOOKING.level, n: Number(BOOKING.n) || 1,
    loc: BOOKING.loc === 'At home' ? '' : BOOKING.loc,
    /* The answer, or the rule when it has not been given: a venue that charges nothing is hosted
       whether or not anybody said so. */
    hosting: BOOKING.hosting ? BOOKING.hosting === 'Yes'
                             : (BOOKING.loc === 'At home' || isHome(BOOKING.loc)),
    /* HOW MANY OTHERS, counted from the addresses given rather than picked separately. */
    splitOthers: (BOOKING.splitWith || []).filter(x => String(x).trim()).length,
    day: days.join(', '), time: firstHour,
    hours: hours,
    /* EVERY TICKED HOUR, added up. Two on Monday and two on Wednesday is four a week — and the
       chain multiplies by weeks, so passing one session's length would price a two-day booking as
       a one-day one. Counted from the grid rather than multiplied out, so two hours on Monday and
       one on Friday is three, which no amount of days-times-length can express. */
    hoursPerWeek: perWeek,
    /* The runs themselves, so the chain can work out the real session dates across every day. */
    runs: runs.map(r => ({ dayName: r.dayName, day: r.day, hours: r.hours })),
    interval: BOOKING.interval, weeks: iv.weeks || 0,
    startDate: iv.startDate || '', endDate: iv.endDate || '', lastSun: iv.lastSun || iv.endDate || '',
    tutor: BOOKING.tutor === 'No preference' ? '' : BOOKING.tutor,
  };
}

/* The price so far, or nothing. Shown from the moment it can be worked out rather than at the end
   — the whole point of asking in this order is that somebody can stop when it gets too dear. */
function bookPrice() {
  if (!BOOKING.subjects.length) return null;
  const L = priceFrom(bookSpec());
  return (L && L.chargePerHour > 0) ? L : null;
}

on('new-booking', () => {
  if (!USER) { toast('Sign in to book'); go('me'); return; }
  drawBooker();
});

/* Ticking an hour. Adjacent ticks become one session; the grid is redrawn so the summary under it
   keeps up. */
on('book-slot', el => {
  const code = el.dataset.code;
  const list = BOOKING.slots || [];
  const at = list.indexOf(code);
  if (at === -1) list.push(code); else list.splice(at, 1);
  BOOKING.slots = list;
  drawBooker();
});

on('split-add', () => { (BOOKING.splitWith = BOOKING.splitWith || []).push(''); drawBooker(); });
on('split-set', el => {
  const list = BOOKING.splitWith || [];
  list[Number(el.dataset.k)] = el.value;
  BOOKING.splitWith = list;
  /* NOT redrawn. Rebuilding the sheet on every keystroke destroys the box being typed into — the
     same fault the Stuff search box was built around. The price catches up when Done is pressed. */
});
on('split-done', () => { BOOKING.splitAsked = true; drawBooker(); });

/* Answering one. A multi toggles, everything else replaces and moves on. */
on('book-pick', el => {
  const step = bookStep_(el.dataset.step);
  const v = el.dataset.value;
  if (!step) return;
  /* Changing an answer takes you back to the card rather than onwards through questions you have
     already answered. */
  const wasEditing = BOOKING.editing === step.id;
  /* A GRID IS TICKED, NOT PICKED. `book-slot` owns it, and letting this one through would write a
     single code string over the list of them — after which everything that reads the slots as a
     list throws, several functions away from the press that caused it. */
  if (step.grid) return;
  if (step.multi) {
    const list = BOOKING[step.id] || [];
    const at = list.indexOf(v);
    if (at === -1) list.push(v); else list.splice(at, 1);
    BOOKING[step.id] = list;
  } else {
    BOOKING[step.id] = v;
    if (wasEditing) BOOKING.editing = '';
  }
  drawBooker();
});

/* Pressing a value on the card. It reopens that question and keeps everything else — which is the
   difference between changing your mind and starting again. */
on('book-edit', el => { BOOKING.editing = el.dataset.step; drawBooker(); });
/* And backing out of one without changing it. */
on('book-back', () => { BOOKING.editing = ''; drawBooker(); });

/* Going back to change one. It is emptied rather than the whole booking reset — everything after
   it stays answered, because changing the venue does not mean you changed your mind about the
   subject. */
on('book-undo', el => {
  const step = bookStep_(el.dataset.step);
  if (!step) return;
  if (step.emails) { BOOKING.splitWith = []; BOOKING.splitAsked = false; }
  else BOOKING[step.id] = step.grid ? [] : (step.multi ? [] : '');
  drawBooker();
});

/* Finished with a multiple-choice question. Recorded, so it stops being asked — and so that
   coming back to it later reopens it rather than treating one tick as the whole answer. */
on('book-more', el => {
  const id = (el && el.dataset && el.dataset.step) || (nextBookStep() || {}).id;
  if (id) BOOKING.done = uniq((BOOKING.done || []).concat([id]));
  BOOKING.editing = '';
  drawBooker();
});

/**
 * THE CARD. Photographs, then every priced row, then the dates, then where it stands.
 *
 * The order is the old one and it is right: what you are buying, what it costs and how that was
 * arrived at, when it happens, and only then its state. State last because what a booking IS is
 * what somebody came to read; where it STANDS is what they check afterwards.
 */
function bookBreakdown(L) {
  if (!L) return '<p class="note">Not enough answered to price it yet.</p>';
  const fmt = { money, esc, pct: x => x };

  /* Photographs of the two things chosen — the room and the person. A booking is largely about
     whether you like the look of both, and a card that names them without showing them is a
     receipt rather than an offer. */
  const sp = spaceFor(BOOKING.loc);
  const venue = (DATA.venues || []).find(x => norm(x.title) === norm(sp ? sp.venue : BOOKING.loc));
  const tutor = tutorRow_();
  /* A DRAWN STAND-IN rather than a word. "No tutor yet" in a box is a caption where a picture
     should be; a vague figure is recognisably a person nobody has chosen, which is what an open
     booking IS — and it holds the frame so a card with one photograph does not look like a booking
     with a room and no teacher. */
  const figure = kind => `<span class="bk-none"><svg viewBox="0 0 64 52" aria-hidden="true">${
    kind === 'venue'
      ? `<path d="M14 42V22l18-11 18 11v20z" fill="none" stroke="currentColor" stroke-width="2"/>
         <rect x="28" y="30" width="8" height="12" fill="currentColor" opacity=".45"/>
         <rect x="19" y="26" width="6" height="6" fill="currentColor" opacity=".28"/>
         <rect x="39" y="26" width="6" height="6" fill="currentColor" opacity=".28"/>`
      : `<circle cx="32" cy="20" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
         <path d="M16 46a16 16 0 0 1 32 0" fill="none" stroke="currentColor" stroke-width="2"/>`
  }</svg></span>`;
  const frame = (img, kind) => img
    ? `<img src="${esc(pic(img))}" alt="" loading="lazy">`
    : figure(kind);
  const photos = `<div class="bk-photos">
      ${frame(venue && venue.image, 'venue')}
      ${frame(tutor && tutor.image, 'tutor')}
    </div>`;

  /* One row: label, what was chosen, the multiplier, what it adds an hour, and the running total.
     Five columns because a multiplier and a fixed amount are different operations and sharing a
     column made the arithmetic impossible to follow. */
  /* `step` is which question this row's value came from. Given one, the value becomes a button
     that reopens it — which is the whole of "play with it": no mode to enter, no pencil to find,
     the number you want to change is the thing you press. */
  const row = (k, v, mul, rate, run, cls, step) => `<div class="bk-row ${cls || ''}">
      <span class="bk-k">${esc(k)}</span>
      <span class="bk-v${step ? ' bk-pick" data-do="book-edit" data-step="' + esc(step) : ''}">${v || ''}</span>
      <span class="bk-m">${mul || ''}</span>
      <span class="bk-r">${rate || ''}</span>
      <span class="bk-t">${run || ''}</span>
    </div>`;

  const out = [];
  ['rate', 'shape'].forEach(group => {
    const inGroup = PRICE_ROWS.filter(r => r.group === group);

    /* The hour grid sits at the top of the shape section, because ticking it is what produces a
       session count — so the rows below read as consequences of it rather than promises made
       before it. */
    if (group === 'shape') {
      bookRuns().forEach(r => {
        const g = slotGrid();
        const day = g.rows.find(x => x.prefix === r.day);
        const hours = (day ? day.hours : []).map(h =>
          `<span class="bk-hr${(BOOKING.slots || []).indexOf(h.code) !== -1 ? ' on' : ''}"
            >${h.h}</span>`).join('');
        out.push(row(r.dayName, `<span class="bk-hrs">${hours}</span>`, '', '', '', 'bk-day',
          'slots'));
      });
      if (L.hoursPerWeek) {
        out.push(row('Hours a week', '', '× ' + L.hoursPerWeek, '',
          L.weeksBooked ? money(runningAfter('hoursweek', L)) : '', 'bk-day'));
      }
    }

    inGroup.forEach((r, gi) => {
      if (r.show && !r.show(L)) return;
      const c = priceCells(r, L, fmt);
      /* Which question this row is showing the answer to. The row keys and the step ids are
         different vocabularies — one describes the price, the other the conversation — so the join
         is written out rather than assumed. */
      const asked = { base: 'tutor', subject: 'subjects', level: 'level', students: 'n',
                      venue: 'loc', host: 'hosting', term: 'interval',
                      split: 'splitOthers' }[r.key];
      /* A ROW'S VALUE IS WHAT WAS CHOSEN, and nothing else.
         Some rows carry an admin annotation in a `note` span — Extra seats explains WHERE its
         fraction came from, which matters when a tutor's own setting is being ignored. Stripping
         the tags kept the words, so "1" arrived as "1 config 1.5 + B 0.1" in a column two
         characters wide. The note is removed WITH its contents; what is left is the answer. */
      const plain = r.value
        ? String(r.value(L)).replace(/<span class="note">[\s\S]*?<\/span>/g, '')
                            .replace(/<[^>]*>/g, '').trim()
        : '';
      out.push(row(r.label, esc(plain),
        c.mul, c.rate, c.total, gi === inGroup.length - 1 ? 'bk-end' : '', asked));
    });
  });

  /* THE DATES. Not a summary of them — the actual list, because they ARE what is being paid for
     and a count is something you either believe or you do not. */
  const dates = (L.sessionDates || []).map(d => fmtDate(d));
  out.push(row('Dates', dates.length ? `<span class="bk-dates">${esc(dates.join(', '))}</span>` : '—',
    '', '', dates.length ? dates.length + ' dates' : '', 'bk-free'));

  /* Where it stands, last. Three separate facts that were once one word:
       status      where the negotiation is
       possession  whose booking this is
       lifecycle   where the CALENDAR is, which moves on its own as dates pass */
  out.push(row('Status', 'Unsent', '', '', '', 'bk-free'));
  out.push(row('Possession', 'Yours', '', '', '', 'bk-free'));
  out.push(row('Lifecycle', 'Uncreated', '', '', '', 'bk-free'));

  return photos + '<div class="bk">' + out.join('') + '</div>';
}

/**
 * REDRAW WITHOUT MOVING.
 *
 * Every answer rebuilds the whole sheet — the options change, the breakdown grows a row — and the
 * sheet scrolls back to the top each time, so the thing you were looking at leaves the screen at
 * the moment you touch it. On a list of eleven venues that means scrolling back down after every
 * single tap.
 *
 * The position is taken before the rebuild and put back after it, in the frame after the markup
 * lands — before that, the new content has no height and the scroll would be clamped to zero.
 * Clamped to the new height, because the page after an answer is usually shorter.
 */
function redrawBooker_(draw) {
  const body = $('sheet-body');
  const was = body ? body.scrollTop : 0;
  draw();
  const now = $('sheet-body');
  if (!now || !was) return;
  requestAnimationFrame(() => {
    now.scrollTop = Math.min(was, Math.max(0, now.scrollHeight - now.clientHeight));
  });
}

/* The one entry point. Everything that changes an answer calls this, and it is the only thing
   that calls `drawBooker_` — so nothing can redraw the sheet without keeping its place. */
function drawBooker() { redrawBooker_(drawBooker_); }

function drawBooker_() {
  /* PLAYING WITH IT.
     Once every question is answered the card is the whole booking, and the thing somebody actually
     wants next is not to start again — it is to ask what happens if. A different tutor, one fewer
     seat, hosting it themselves. The funnel is right for BUILDING a booking, where each answer
     narrows the next, and wrong for CHANGING one, where you already know what you want to change.
     So the card becomes the control. Every chosen value on it is already underlined to say
     somebody picked it; pressing one reopens that question with everything else kept, and answering
     it comes straight back to the card with the running column moved. No mode, no edit button —
     the value IS the button, which is what the old form did with its inline selects.
     `editing` is which question is open. Empty means the card. */
  const step = BOOKING.editing
    ? (bookStep_(BOOKING.editing) || nextBookStep())
    : nextBookStep();
  const L = bookPrice();

  /* WHAT HAS BEEN SAID SO FAR, each one pressable to change. A wizard that hides its earlier
     answers is one you have to restart to correct. */
  const said = BOOK_STEPS.filter(bookAnswered_).map(st => {
    const v = BOOKING[st.id];
    const text = st.emails
      ? ((BOOKING.splitWith || []).filter(x => String(x).trim()).length
          ? (BOOKING.splitWith || []).filter(x => String(x).trim()).join(', ') : 'Just us')
      : st.grid
      ? bookRuns().map(r => r.dayName.slice(0, 3) + ' ' + r.hour + ':00').join(', ')
      : st.multi ? v.join(', ') : (st.label_ ? st.label_(v) : v);
    return `<button class="chip" data-do="book-undo" data-step="${esc(st.id)}">
      <span class="chip-k">${esc(st.label.replace(/\?$/, ''))}</span>${esc(text)}
      <span class="chip-x">✕</span></button>`;
  }).join('');

  /* THE RUNNING BREAKDOWN. Every row says what it did to the price and what the price is with it
     applied — so the last figure IS the total, rather than a number you have to trust.
     Built from PRICE_ROWS, the same list the old card used, so a row cannot be drawn without being
     costed or costed without being drawn. */
  const money_ = bookBreakdown(L);
  if (!step) {
    openSheet('Ask for a session', `
      ${said ? `<div class="chips">${said}</div>` : ''}
      ${money_ || '<p class="note">Not enough answered to price it yet.</p>'}
      <label class="field"><span>anything else we should know</span>
        <textarea id="book-note" placeholder="Optional"></textarea></label>
      <button class="btn" data-do="book-send">Ask for it</button>
      <p class="faint" id="book-said" style="margin:.6rem 0 0">
        Nothing is booked or charged yet — this asks, and we come back to you.</p>`);
    return;
  }

  /* THE GRID IS DRAWN, not listed. Every other question is a set of options; this one is a week. */
  if (step.grid) {
    const g = slotGrid();
    const on = BOOKING.slots || [];
    const runs = bookRuns();
    openSheet(step.label, `
      ${g.anyOpen ? `
        <p class="faint">Tick the hours. Two together is a two-hour session; another day is another
          session that week.</p>
        <div class="slot-grid">
          ${g.rows.map(r => `<div class="slot-row">
            <span class="slot-day">${esc(r.label.slice(0, 3))}</span>
            <div class="slot-hours">
              ${r.hours.map(h => `<button class="hr${on.indexOf(h.code) !== -1 ? ' on' : ''}${
                h.open ? '' : ' shut'}" ${h.open ? '' : 'disabled'}
                title="${h.h}:00${h.open ? '' : ' — not available'}"
                data-do="book-slot" data-code="${esc(h.code)}">${h.h}</button>`).join('')}
            </div>
          </div>`).join('')}
        </div>
        ${runs.length ? `<p class="note">${runs.map(r =>
            esc(r.dayName) + ' ' + r.hour + ':00–' + (r.hour + r.hours) + ':00').join(' · ')}</p>
          <button class="btn" data-do="book-more" data-step="slots">Done — ${runs.length} session${
            runs.length === 1 ? '' : 's'} a week</button>` : ''}`
        /* NO HOURS AND WHY. An empty grid with no explanation reads as the app being broken; the
           reason is always something somebody can go and fix in the sheet. */
        : `<p class="note">${esc(g.why)}</p>`}
      ${said ? `<div class="chips">${said}</div>` : ''}
      ${money_}`);
    return;
  }

  /* ONE BOX PER PERSON, and a ＋ for another. How many there are IS how many there are. */
  if (step.emails) {
    const list = BOOKING.splitWith || [];
    openSheet(step.label, `
      <p class="faint">Each family pays their own share. Leave it empty if it is just you.</p>
      ${list.map((v, k) => `<label class="field"><span>their email</span>
        <input type="email" data-do="split-set" data-k="${k}" value="${esc(v)}"
               placeholder="name@example.com"></label>`).join('')}
      <div class="btn-row">
        <button class="btn quiet" data-do="split-add">＋ another</button>
        <button class="btn" data-do="split-done">
          ${list.filter(x => String(x).trim()).length
            ? 'Done — split ' + (list.filter(x => String(x).trim()).length + 1) + ' ways'
            : 'Just us'}</button>
      </div>
      ${said ? `<div class="chips">${said}</div>` : ''}
      ${money_}`);
    return;
  }

  const opts = step.options().filter(Boolean);
  const chosen = step.multi ? (BOOKING[step.id] || []) : [];

  openSheet(step.label, `
    ${BOOKING.editing ? '<button class="btn quiet" data-do="book-back">Leave it as it is</button>' : ''}
    ${opts.map(v => {
      const why = step.why ? step.why(v) : '';
      const on = chosen.indexOf(v) !== -1;
      /* NOT REMOVED, MARKED. An option that does not fit is shown with the reason, because a list
         that quietly drops things is a list that seems to have decided for you — and because the
         thing it would drop is often the thing you meant. */
      return `<div class="card tap${on ? ' is-on' : ''}${why ? ' is-off' : ''}"
           data-do="book-pick" data-step="${esc(step.id)}" data-value="${esc(v)}">
        <div class="row" style="border:0;padding:0">
          <span class="k">${on ? '✓ ' : ''}${mark(step.label_ ? step.label_(v) : v)}</span>
          ${why ? `<span class="v faint">${esc(why)}</span>` : ''}
        </div>
      </div>`;
    }).join('')}
    ${step.multi && chosen.length
      ? `<button class="btn" style="margin-top:.6rem" data-do="book-more"
           data-step="${esc(step.id)}">Done — ${chosen.length} chosen</button>` : ''}
    ${/* WHAT HAS BEEN SAID, between the question and the price. Above the choices it was the first
          thing read on a screen whose whole job is the list below it; below the breakdown it would
          be past the fold. Here it separates the two and reads as the join between them. */''}
    ${said ? `<div class="chips">${said}</div>` : ''}
    ${money_}`);
}

on('book-send', el => {
  const said = $('book-said');
  const L = bookPrice();
  el.disabled = true;
  if (said) said.textContent = 'Asking…';

  const spec = bookSpec();
  api({ action: 'createJob',
    name: USER.name, clientName: USER.name,
    subject: spec.subjects.join(', '), level: spec.level,
    day: spec.day, time: spec.time, location: BOOKING.loc,
    hosting: spec.hosting, hours: spec.hours, interval: spec.interval,
    requestedTutor: spec.tutor,
    dates: (L && L.sessionDates || []).map(d => fmtDate(d)).join(', '),
    price: L ? String(L.total || '') : '',
    /* WHAT THE JOB IS WORTH TO YOU, which `priceFrom` has always worked out and nothing ever
       sent — so the sheet's profit column stayed empty on every booking made through the app. */
    profit: L ? String(Math.round((L.profitTotal || 0) * 100) / 100) : '',
    service: BOOKING.service || 'Tuition',
    splitOthers: spec.splitOthers,
    /* Who to invite. `createJob` has accepted this since the beginning and nothing ever sent it,
       so a split booking was priced per family and nobody else was ever told about it. */
    splitEmails: (BOOKING.splitWith || []).filter(x => String(x).trim()).join(', '),
    message: ($('book-note') || {}).value || '',
    /* THE SAME ASK TWICE IS ONE ASK. A slow connection and an impatient thumb are the ordinary way
       a family ends up with two identical bookings, and the backend already refuses a repeated
       requestId — this is what gives it one. */
    requestId: 'R' + Date.now() + '-' + Math.floor(Math.random() * 1e6) })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      closeSheet();
      toast('Asked — we will come back to you');
      /* Emptied, so the next booking starts from nothing rather than from the last one. */
      BOOKING.subjects = []; BOOKING.slots = [];
      BOOKING.splitWith = []; BOOKING.splitAsked = false;
      ['level', 'loc', 'interval', 'tutor', 'n', 'hosting', 'service']
        .forEach(k => { BOOKING[k] = ''; });
      load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not ask for that');
    });
});

on('job', el => {
  const jobs = DATA.liveJobs || DATA.jobs || [];
  const j = jobs.find(x => String(x.id || x.jobId) === el.dataset.id);
  if (!j) return;
  openSheet(j.subject || 'Session', [
    ['Where', j.venue], ['When', [j.weekday, j.time].filter(Boolean).join(' ')],
    ['Tutor', j.tutor], ['Level', j.level], ['Status', j.status],
    ['Price', j.price ? money(j.price) : ''],
  ].filter(([, v]) => v).map(([k, v]) =>
    `<div class="row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join(''));
});



/* The state the games keep between frames — the board, the clock, the deck, which month the
   calendar is showing. Carried over WITH them: a game without its state is a function that throws
   on its first line, which is precisely what happened when I moved the functions alone. */
let FEED_AT = null;
let CHESS = null, CHESS_PICK = -1, CHESS_HIST = [], CHESS_BUSY = false;
let CAL_VIEW = null;
let ttState = null;
let timerState = { total: 25*60, left: 25*60, running: false, tick: null };
const GLYPH = { K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙', k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟' };
let FEED_DECK = [];
let FEED_SEEN = [];
let FEED_PASS = 0;
const FEED_BUILT = {};

/* ================================================================================================
   THE GAMES AND TOOLS, carried over.

   The chess board, the flappy loop, the times-tables clock, the calculator keypad, the timer, the
   calendar and the feed — all of it moved across whole rather than rewritten, because none of it
   was ever the problem. Only the sticky notes they used to sit on were.
================================================================================================ */

function initFlappy() {
  const canvas = $('flappy-canvas');
  if (!canvas) return;

  /* THE ELEMENT'S OWN SIZE, not its box. A canvas has two sizes — the CSS one it occupies and the
     `width`/`height` attributes it actually draws into — and stretching the first without the
     second draws at the old resolution and scales the result. Everything blurs, and worse, every
     number in the loop below is in drawing pixels: the bird's radius, the gap, the pipe width. A
     scaled canvas is a game where the collisions do not match what you can see.
     Set here rather than in the markup because the page is a fraction of the screen and the screen
     is not known until it exists. */
  const box = canvas.getBoundingClientRect();
  if (box.width && box.height) {
    canvas.width = Math.round(box.width);
    canvas.height = Math.round(box.height);
  }

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const GOLD = '#d4af37', BLUE = '#4f9eff', GREEN = '#3cb043';

  // reset any previous loop
  if (flappyState?.raf) cancelAnimationFrame(flappyState.raf);
  const S = flappyState = {
    bird: { x: 60, y: H/2, vy: 0, r: 9 },
    pipes: [], score: 0, running: false, dead: false, raf: null, frame: 0
  };
  /* SCALED FROM THE WIDTH, which is the axis this game is played along. Scaling from the height
     was wrong twice over: the box is now portrait, so it made everything four times too big, and
     height is not what a side-scroller's difficulty depends on — how far away a pipe is when you
     first see it is a horizontal distance, and so is how long you have to react.
     The original was tuned on a 300px-wide canvas, so that is the unit. Proportions hold and the
     difficulty holds with them, which is the whole point of scaling rather than hard-coding. */
  const k = W / 300;
  const GRAV = 0.45 * k, FLAP = -7 * k, GAP = 110 * k, PIPE_W = 42 * k, SPEED = 2 * k;
  S.bird.r = 9 * k;
  S.bird.x = 60 * k;
  S.bird.y = H / 2;

  const reset = () => {
    S.bird.y = H/2; S.bird.vy = 0; S.pipes = []; S.score = 0; S.frame = 0; S.dead = false;
    const sc = $('flappy-score'); if (sc) sc.textContent = '0';
  };
  const spawnPipe = () => {
    /* The margins scale too, or on a tall canvas every pipe would cluster at the top. */
    const top = 40 * k + Math.random() * Math.max(10, H - GAP - 110 * k);
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
        /* Through `send`, which refuses to resolve on a refusal. This ignored the reply entirely
           — `.then(() => …)` runs whatever came back — so a rejected save ran the success branch
           and the catch below, written for exactly this, could never fire. */
        send({ action: 'saveScore', name: USER.name, score: S.score })
          .then(() => {

            const meS = (DATA.students||[]).find(s => norm(s.handle) === norm(USER.handle)); if (meS) meS.highscore = S.score;
            const meT = (DATA.tutors||[]).find(x => norm(x.title) === norm(USER.name)); if (meT) meT.highscore = S.score;
            // No re-render mid-game — the "Best" display already updated; cards refresh naturally later
          })
          /* The screen already says "New best!". If the save never lands, a child believes a score
             was kept that was not, and finds it gone next visit with nothing to explain it. Say so
             quietly rather than lying, and put the old best back so the display is honest. */
          .catch(() => {
            USER.highscore = prev;
            if ($('flappy-best')) $('flappy-best').textContent = prev;
            if ($('flappy-msg')) $('flappy-msg').textContent =
              `${S.score}! Not saved — no connection.`;
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

/* ---------- TIMES TABLES SPRINT -----------------------------------------------------------------
   IT DESTROYED ITS OWN SCREEN ON THE FIRST LINE THAT RAN.

   `$('tt-question')` is the CONTAINER — the div holding the question, the answer box, the clock
   and the score. Setting `.textContent` on it replaced all four children with the string
   "7 × 8", so the input the next line reached for no longer existed. The question element is
   `tt-q`, one level in.

   Three more, each fatal on its own: the container was never un-hidden, so nothing would have
   shown even if it had survived; `tt-play` was un-hidden inside a parent that had just been
   hidden, which does nothing; and `endTimesTables` was called at zero seconds and has never
   existed, so the sixty-second mark threw a ReferenceError into a bare setInterval.
--------------------------------------------------------------------------------------------- */
const ttQuestion = () => ({ a: 1 + Math.floor(Math.random() * 12),
                            b: 1 + Math.floor(Math.random() * 12) });

function ttAsk() {
  ttState.cur = ttQuestion();
  const q = $('tt-q');
  if (q) q.textContent = `${ttState.cur.a} × ${ttState.cur.b}`;
}

function startTimesTables() {
  if (!$('tt-q')) return;
  clearInterval(ttState && ttState.timer);     // a second Start must not run two clocks
  ttState = { score: 0, left: 60, cur: ttQuestion(), timer: null, asked: 0 };

  $('tt-idle')?.classList.add('hidden');
  $('tt-over')?.classList.add('hidden');
  $('tt-question')?.classList.remove('hidden');   // the line that was missing entirely
  $('tt-score').textContent = '0';
  $('tt-time').textContent = '60';
  $('tt-feedback').textContent = '';
  ttAsk();

  const input = $('tt-answer');
  input.value = '';
  input.focus();

  ttState.timer = setInterval(() => {
    if (!ttState) return;
    ttState.left--;
    const t = $('tt-time');
    if (t) { t.textContent = ttState.left; t.classList.toggle('bad', ttState.left <= 10); }
    if (ttState.left <= 0) endTimesTables();
  }, 1000);

  /* Checked on every keystroke, with no Enter to press. "72" typed one digit at a time passes
     through "7", which is wrong for 8×9 and right for nothing — so a wrong number is never
     marked wrong, it is simply not yet right. A child typing the second digit of a correct
     answer must not be told they have failed. */
  input.oninput = () => {
    if (!ttState) return;
    /* Named `answer`, not `val`. There is a global `val()` that reads an input by id, and a local
       shadowing it inside a function that also reads inputs is a trap set for whoever edits this
       next. */
    const answer = parseInt(input.value, 10);
    if (isNaN(answer)) return;
    if (answer === ttState.cur.a * ttState.cur.b) {
      ttState.score++;
      ttState.asked++;
      $('tt-score').textContent = ttState.score;
      $('tt-feedback').textContent = '✓';
      ttAsk();
      input.value = '';
    }
  };
}

/**
 * SIXTY SECONDS, UP. Called by the clock and by the give-up button, and safe to call twice —
 * the interval is cleared first, so a tap landing in the same tick as the timeout cannot run
 * this over the top of itself.
 */
/* The screen is redrawn every time Arcade is opened, so the sprint starts again from its idle
   state — and a clock left running behind a screen that no longer has a question on it would go
   on ticking into elements that have been thrown away. */
function initTables() {
  if (!$('tt-idle')) return;
  if (ttState) { clearInterval(ttState.timer); ttState = null; }
  $('tt-idle')?.classList.remove('hidden');
  $('tt-question')?.classList.add('hidden');
  $('tt-over')?.classList.add('hidden');
}

function endTimesTables() {
  if (!ttState) return;
  clearInterval(ttState.timer);
  const score = ttState.score;
  const best = Math.max(Number(USER && USER.ttHighscore) || 0, score);
  ttState = null;

  $('tt-question')?.classList.add('hidden');
  const over = $('tt-over');
  if (over) {
    over.classList.remove('hidden');
    over.innerHTML = `
      <p class="mono" style="font-size:2rem;text-align:center;margin:.6rem 0">${score}</p>
      <p class="note" style="text-align:center">${
        score === 0 ? 'None. It happens — try a slower start.'
      : score >= best && score > 0 && score > (Number(USER && USER.ttHighscore) || 0)
        ? 'A new best.'
      : 'Your best is ' + best + '.'}</p>
      <button class="btn" data-do="tt-start" style="margin-top:.5rem">Again</button>`;
  }

  /* Kept only if it beats the old one, and only for somebody signed in. The server decides
     whether it stuck — `saveTtHighscore` returns the figure it actually holds, so a phone that
     was offline does not go on claiming a record that was never written. */
  if (USER && score > (Number(USER.ttHighscore) || 0)) {
    const was = Number(USER.ttHighscore) || 0;
    USER.ttHighscore = score;
    api({ action: 'saveTtHighscore',
      name: USER.name, personId: USER.personId, score })
      .then(d => {
        if (d && d.error) throw new Error(d.error);
        if (typeof d.best === 'number') USER.ttHighscore = d.best;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      })
      .catch(() => {
        /* Said quietly rather than left as a lie. A child told they set a record and finding it
           gone next visit has nothing to explain it. */
        USER.ttHighscore = was;
        const over2 = $('tt-over');
        if (over2) over2.insertAdjacentHTML('beforeend',
          '<p class="faint" style="text-align:center">Not saved — no connection.</p>');
      });
  }
}

function initMiniCalc() {
  const disp = $('mc-display');
  if (!disp) return;

  /* THE STATE. `at` is where the caret sits — an index BETWEEN characters, so 0 is before the
     first and expr.length is after the last. Everything below inserts and deletes there rather
     than at the end, which is the whole difference an arrow key makes. */
  let expr = '', at = 0;
  /* Every finished sum, oldest first, and where we are in it. `-1` means "not looking back",
     which is a different state from "looking at the newest" — pressing ▼ off the end has to
     return the working line, not hand back the last answer again. */
  const past = [];
  let back = -1;
  let fresh = false;         // the display holds an answer rather than something being typed

  const render = () => {
    const t = expr || '';
    disp.innerHTML = t
      ? esc(t.slice(0, at)) + '<span class="mc-caret"></span>' + esc(t.slice(at))
      : '<span class="mc-zero">0</span><span class="mc-caret"></span>';
    disp.scrollLeft = disp.scrollWidth;      // a long sum scrolls to where you are typing
  };

  /* Put something in at the caret and step past it. A multi-character token — `sin(`, `sqrt(` —
     moves the caret by its whole length, so the next digit lands inside the bracket. */
  const put = t => { expr = expr.slice(0, at) + t + expr.slice(at); at += t.length; };

  const recall = dir => {
    if (!past.length) return;
    /* From the working line ▲ goes to the newest; from inside the history it steps outwards. ▼
       off the end returns to an empty line rather than sticking on the last answer. */
    if (back === -1) { if (dir < 0) back = past.length - 1; else return; }
    else back = Math.min(past.length - 1, Math.max(-1, back + (dir < 0 ? -1 : 1)));
    expr = back === -1 ? '' : past[back];
    at = expr.length;
    fresh = false;
  };

  window._mcClick = (v) => {
    /* Anything that is not a movement leaves the history. Editing a recalled sum makes it a new
       one — otherwise ▲ from a half-edited line would step from where the original sat. */
    if (v !== 'up' && v !== 'down') back = -1;

    if (v === 'left')  { at = Math.max(0, at - 1); fresh = false; return render(); }
    if (v === 'right') { at = Math.min(expr.length, at + 1); fresh = false; return render(); }
    if (v === 'up')    { recall(-1); return render(); }
    if (v === 'down')  { recall(1);  return render(); }

    if (v === '=') {
      if (!expr || expr === 'Error') return;
      const was = expr;
      try {
        let t = expr.replace(/π/g, 'pi');
        // degree trig
        t = t.replace(/\b(sin|cos|tan)\(/g, '$1(DEG*');
        let result;
        if (window.math) {
          result = window.math.evaluate(t, { pi: Math.PI, DEG: Math.PI / 180 });
        } else {
          t = t.replace(/pi/g, Math.PI).replace(/DEG/g, Math.PI / 180)
               .replace(/sqrt/g, 'Math.sqrt').replace(/sin/g, 'Math.sin')
               .replace(/cos/g, 'Math.cos').replace(/tan/g, 'Math.tan').replace(/\^/g, '**');
          result = Function('"use strict";return (' + t + ')')();
        }
        expr = String(Math.round(result * 1e10) / 1e10);
        /* The SUM is remembered, not the answer. Going back to change one number in it is the
           reason anybody looks back at all, and an answer cannot be edited into a question. */
        if (past[past.length - 1] !== was) past.push(was);
        if (past.length > 30) past.shift();
        fresh = true;
      } catch { expr = 'Error'; fresh = false; }
      at = expr.length;
      return render();
    }

    if (v === 'C') { expr = ''; at = 0; fresh = false; return render(); }

    if (v === 'del') {
      /* Backspace AT THE CARET. It used to take the last character whatever the caret said,
         which with arrows would delete the wrong end of the sum. */
      if (expr === 'Error') { expr = ''; at = 0; return render(); }
      if (at > 0) { expr = expr.slice(0, at - 1) + expr.slice(at); at--; }
      fresh = false;
      return render();
    }

    if (expr === 'Error') { expr = ''; at = 0; fresh = false; }
    /* AFTER AN ANSWER: a digit starts a new sum, an operator continues from the answer.
       `5 + 3 =` then `× 2` is what almost everybody means, and clearing the 8 first would be the
       calculator throwing away what it had just told them. */
    if (fresh) {
      if (/^[0-9.]$/.test(v)) { expr = ''; at = 0; }
      fresh = false;
    }
    put(v);
    render();
  };

  render();
}

/* ---------- THE TIMER ---------------------------------------------------------------------------
   IT DID NOTHING AT ALL. The toggle carried an `id` and no `data-do`, so the one delegated click
   handler never saw it; `timer-reset` had a `data-do` and no handler was ever registered; and
   there was no tick function anywhere — `paintTimer` drew a number that nothing decremented.

   IT ALSO USED TO STOP ITSELF. `initTimer` cleared the clock every time Tools was opened, so
   going to the feed to look at something and coming back reset a session halfway through. A timer
   that stops when you look away is not a timer, so the state lives outside the screen and only
   the drawing is redone.
--------------------------------------------------------------------------------------------- */

/* ONE interval, ever. A second one started without clearing the first makes the clock run at
   double speed, which is the classic way a timer loses two seconds a second. */
function timerTick() {
  clearInterval(timerState.tick);
  timerState.tick = setInterval(() => {
    if (!timerState.running) return;
    timerState.left--;
    if (timerState.left <= 0) {
      timerState.left = 0;
      timerState.running = false;
      clearInterval(timerState.tick);
      toast('Time');
      /* A sound BUILT rather than fetched — a file is a request that can fail silently, and a
         timer that ends in silence has not ended. */
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          const ac = new AC();
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.frequency.value = 880; g.gain.value = 0.08;
          o.start(); o.stop(ac.currentTime + 0.35);
        }
      } catch {}
      navigator.vibrate?.([200, 100, 200]);
    }
    paintTimer();
  }, 1000);
}

/* Draws the clock as it stands, and picks a running one back up. Does NOT stop it. */
function initTimer() {
  paintTimer();
  if (timerState.running) timerTick();
}

on('timer-toggle', () => {
  if (!timerState.left) timerState.left = timerState.total;   // finished: play starts it again
  timerState.running = !timerState.running;
  if (timerState.running) timerTick(); else clearInterval(timerState.tick);
  paintTimer();
});

on('timer-reset', () => {
  timerState.running = false;
  clearInterval(timerState.tick);
  timerState.left = timerState.total;
  paintTimer();
});

on('timer-set', el => {
  const mins = Number(el.dataset.min) || 25;
  timerState.total = mins * 60;
  timerState.left = mins * 60;
  timerState.running = false;
  clearInterval(timerState.tick);
  paintTimer();
});

/* ---------- THE CALENDAR ------------------------------------------------------------------------
   A month, with what is ON it. An empty grid of numbers is a thing every phone already has; the
   reason to have one here is that it knows about the exams and the birthdays.

   The ARROWS were dead. `cal-back` and `cal-fwd` each carried a `data-do` and no handler was ever
   registered for either, so it has only ever been able to show this month.
--------------------------------------------------------------------------------------------- */
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

/* Everything that happens, keyed by day of the month. Built once per draw rather than searched
   per cell: forty-two cells against two lists is forty-two scans of them to shade six squares. */
function calendarMarks(y, m) {
  const out = {};
  const put = (d, mark) => { (out[d] = out[d] || []).push(mark); };

  (DATA.exams || []).forEach(x => {
    const d = parseDMY(x.date);
    if (!d || d.getFullYear() !== y || d.getMonth() !== m) return;
    put(d.getDate(), { kind: x.kind === 'mock' ? 'mock' : 'exam',
                       label: [x.subject, x.label].filter(Boolean).join(' · ') || 'Exam',
                       who: x.who || '' });
  });

  /* A birthday has no year, which is the point: it happens every year, and a date that only
     appears once is a date somebody misses. */
  (DATA.birthdays || []).forEach(b => {
    if (Number(b.month) !== m + 1) return;
    put(Number(b.day), { kind: 'birthday', label: b.name + '’s birthday', who: b.name });
  });

  return out;
}

function initCalendar() {
  if (!$('cal-body')) return;
  const now = new Date();
  CAL_VIEW = CAL_VIEW || { y: now.getFullYear(), m: now.getMonth() };
  drawCalendar();
}

function drawCalendar() {
  const host = $('cal-body');
  if (!host) return;
  const y = calView().y, m = CAL_VIEW.m;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startDay = (new Date(y, m, 1).getDay() + 6) % 7;   // Monday-first
  const days = new Date(y, m + 1, 0).getDate();
  const label = $('cal-label');
  if (label) label.textContent = `${MONTHS[m]} ${y}`;

  const marks = calendarMarks(y, m);
  const cells = [];
  ['M','T','W','T','F','S','S'].forEach(d => cells.push(`<span class="cal-h">${d}</span>`));
  for (let i = 0; i < startDay; i++) cells.push('<span></span>');
  for (let d = 1; d <= days; d++) {
    const isToday = new Date(y, m, d).getTime() === today.getTime();
    const on = marks[d] || [];
    /* A DOT PER KIND, not per event. Three exams on one day is one exam dot — the square is a few
       millimetres across, and what it has to say is "something is here". */
    const kinds = uniq(on.map(x => x.kind));
    cells.push(`<span class="cal-d${isToday ? ' cal-today' : ''}${on.length ? ' has' : ''}"
        ${on.length ? `data-do="cal-day" data-d="${d}"` : ''}>${d}${
      kinds.length ? `<span class="cal-dots">${
        kinds.map(k => `<i class="dot ${k}"></i>`).join('')}</span>` : ''}</span>`);
  }
  host.innerHTML = cells.join('');
}

/* CAL_VIEW is filled by initCalendar, which `wake` runs before the screen can be touched — so
   this cannot be null in practice. It is guarded anyway: a null that is safe only because of an
   ordering assumption is the same shape as every other silent failure on the list. */
const calView = () => (CAL_VIEW = CAL_VIEW
  || { y: new Date().getFullYear(), m: new Date().getMonth() });

on('cal-back', () => {
  calView().m--;
  if (CAL_VIEW.m < 0) { CAL_VIEW.m = 11; CAL_VIEW.y--; }
  drawCalendar();
});
on('cal-fwd', () => {
  calView().m++;
  if (CAL_VIEW.m > 11) { CAL_VIEW.m = 0; CAL_VIEW.y++; }
  drawCalendar();
});

/* WHAT IS ON THAT DAY. A dot says something is there and nothing else, and a mark you cannot open
   is a mark whose meaning you have to remember. */
on('cal-day', el => {
  const d = Number(el.dataset.d);
  const on = calendarMarks(calView().y, CAL_VIEW.m)[d] || [];
  openSheet(d + ' ' + MONTHS[CAL_VIEW.m], on.map(x => `
    <div class="row">
      <span class="k"><i class="dot ${x.kind}"></i> ${esc(
        x.kind === 'birthday' ? 'Birthday' : x.kind === 'mock' ? 'Mock' : 'Exam')}</span>
      <span class="v">${mark(x.label)}${x.who && x.kind !== 'birthday'
        ? `<br><span class="faint">${esc(x.who)}</span>` : ''}</span>
    </div>`).join(''));
});

function initChess() {
  if (!$('chess-board')) return;
  if (!CHESS) { CHESS = newGame(); CHESS_HIST = []; }
  drawChess();
}

function drawChess() {
  const el = $('chess-board');
  if (!el || !CHESS) return;
  const legal = CHESS_PICK >= 0
    ? legalMoves(CHESS).filter(m => m.from === CHESS_PICK).map(m => m.to)
    : [];
  el.innerHTML = CHESS.board.map((p, i) => {
    const dark = (file(i) + rank(i)) % 2 === 1;
    const cls = ['sq', dark ? 'dk' : 'lt'];
    if (i === CHESS_PICK) cls.push('pick');
    if (legal.includes(i)) cls.push(p === '_' ? 'can' : 'take');
    return `<span class="${cls.join(' ')}" data-sq="${i}">${p === '_' ? '' : GLYPH[p]}</span>`;
  }).join('');
  say();
}

function chessTap(sq) {
  if (!CHESS || CHESS_BUSY || CHESS.turn !== CH_WHITE || outcome(CHESS)) return;

  // Tapping one of your own pieces always selects it — which is what a player expects when they
  // change their mind mid-move, rather than the tap being read as an illegal destination.
  if (colourOf(CHESS.board[sq]) === CH_WHITE) {
    CHESS_PICK = CHESS_PICK === sq ? -1 : sq;
    drawChess();
    return;
  }
  if (CHESS_PICK < 0) return;

  const moves = legalMoves(CHESS).filter(m => m.from === CHESS_PICK && m.to === sq);
  if (!moves.length) { CHESS_PICK = -1; drawChess(); return; }

  // A promoting pawn offers four moves to the same square. Ask, rather than assuming a queen —
  // a rook is the right answer often enough to matter, and always queening is how a player loses
  // to stalemate they did not intend.
  let move = moves[0];
  if (moves.length > 1 && moves[0].promote) {
    const want = (prompt('Promote to Q, R, B or N?', 'Q') || 'Q').toUpperCase();
    move = moves.find(m => m.promote === want) || moves[0];
  }

  CHESS_HIST.push(CHESS);
  CHESS = play(CHESS, move);
  CHESS_PICK = -1;
  drawChess();

  if (outcome(CHESS)) return;

  /* The engine thinks on a timeout so the board repaints first — otherwise the browser shows your
     move and its reply in the same frame, and it looks as though nothing happened. */
  CHESS_BUSY = true;
  say('Thinking…');
  setTimeout(() => {
    const depth = parseInt(($('chess-level') || {}).value) || 2;
    const reply = bestMove(CHESS, depth);
    if (reply) { CHESS_HIST.push(CHESS); CHESS = play(CHESS, reply); }
    CHESS_BUSY = false;
    drawChess();
  }, 60);
}

function say(msg) {
  const el = $('chess-say');
  if (!el) return;
  if (msg) { el.textContent = msg; return; }
  const end = outcome(CHESS);
  if (end === 'mate') {
    el.textContent = CHESS.turn === CH_WHITE ? 'Checkmate — the computer wins.' : 'Checkmate — you win.';
  } else if (end === 'stalemate') {
    el.textContent = 'Stalemate. Nobody wins.';
  } else if (inCheck(CHESS, CHESS.turn)) {
    el.textContent = CHESS.turn === CH_WHITE ? 'You are in check.' : 'Check.';
  } else {
    el.textContent = CHESS.turn === CH_WHITE ? 'Your move.' : 'Thinking…';
  }
}

/* ---------- THE REELS ---------------------------------------------------------------------------
   One fact at a time, full card, tap for another.

   IT DREW NOTHING — a black rectangle, which is what `--sunk` looks like in an empty div. The
   first line called `tpl.feedSlide(it)` and the next `feedPicture(it.pic)`, and neither `tpl` nor
   `feedPicture` was carried over from the markup that burned. The ReferenceError went into
   `wake`'s catch, which is there so one broken game does not take the other three with it — and
   which turns a crash into a blank.

   NO PHOTOGRAPH. The old version fetched one per card from a search term: a key, a rate limit, an
   attribution line, and a card that goes blank the day the key expires. The background is DRAWN
   from the fact's own subject instead — the same words used as a seed rather than as a query — so
   it is instant, works with no connection, and is the same every time you see that fact.
--------------------------------------------------------------------------------------------- */

/* A colour from a string. Two hues a little apart so the gradient has somewhere to go, and the
   SUBJECT decides them — so every Space card is a family of blues and every Animals card its own
   green, without anybody choosing ninety colours. */
function feedColours(seed) {
  const h = hashOf(String(seed || '?'));
  const a = h % 360;
  const b = (a + 25 + (h >> 9) % 40) % 360;
  return [`hsl(${a} 42% 18%)`, `hsl(${b} 38% 9%)`, `hsl(${a} 60% 62%)`];
}

/* The card. The HEADING is the fact, so it takes the space; the body is why, so it is small. */
function feedSlide(it) {
  const c = feedColours(it.subject);
  return `<div class="feed-art" style="--a:${c[0]};--b:${c[1]};--c:${c[2]}">
    <span class="feed-mark">${esc(initial(it.subject))}</span>
    ${/* WHO THE PICTURE BELONGS TO. Empty until one arrives, and it has to be there from the
          start rather than added later — an element appearing under a photograph shifts the card
          the moment somebody starts reading it. */''}
    <span class="feed-credit"></span>
    <div class="feed-text">
      <span class="feed-subject">${esc(it.subject)}</span>
      <h3 class="feed-head">${esc(it.heading)}</h3>
      <p class="feed-body">${esc(it.body)}</p>
    </div>
  </div>`;
}

/* ---------- THE PICTURE -------------------------------------------------------------------------
   Fetched AFTER the card is drawn, and the card is readable without it. That order is the whole
   design: the gradient is not a placeholder waiting to be replaced, it is the floor — so a slow
   connection, a rate limit or a service that has stopped existing costs nothing at all.

   TWO SOURCES, and Commons is the default for a reason. The fourth column of every fact is a
   PHOTOGRAPH search term — `octopus underwater`, `Venice canal buildings` — and Wikimedia Commons
   answers those with photographs of the thing, needs no key, and allows the request from a
   browser. Giphy answers them with reaction GIFs, which read as a joke where an illustration
   should be. Put a key in config and it switches; leave it blank and it does not.

   A KEY IN HERE IS PUBLIC. It ships in a file anybody can read, which for Giphy's free tier is
   normal — the limit is tied to the key rather than the key being a secret — but it is worth
   knowing rather than finding out.
--------------------------------------------------------------------------------------------- */
const FEED_PICS = {};        // one lookup per search term, for as long as the tab is open

function feedPicture(query) {
  const q = String(query || '').trim();
  if (!q) return Promise.resolve(null);
  if (FEED_PICS[q] !== undefined) return Promise.resolve(FEED_PICS[q]);

  const key = ((DATA.constants || {}).vars || {}).giphy_key;
  const url = key
    ? 'https://api.giphy.com/v1/gifs/search?api_key=' + encodeURIComponent(key)
      + '&q=' + encodeURIComponent(q)
      /* `rating=g` is not optional on a site children open. Without it a search for "pistol
         shrimp" can return anything Giphy has under that phrase. */
      + '&limit=1&rating=g&lang=en'
    /* `origin=*` is what makes Commons answer a browser at all — without it the request is made,
       refused by CORS, and fails in a way that looks identical to the network being down.
       `filetype:bitmap` keeps out the SVG diagrams and PDF scans, which are technically images
       and are not photographs. */
    : 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*'
      + '&generator=search&gsrnamespace=6&gsrlimit=1'
      + '&gsrsearch=' + encodeURIComponent('filetype:bitmap ' + q)
      + '&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900';

  return fetch(url)
    .then(r => r.json())
    .then(d => {
      let out = null;
      if (key) {
        const g = (d.data || [])[0];
        if (g) out = { src: (g.images && g.images.downsized_medium || {}).url || '',
                       by: 'GIPHY' };
      } else {
        const pages = ((d.query || {}).pages) || {};
        const first = Object.keys(pages).map(k => pages[k])[0];
        const info = first && (first.imageinfo || [])[0];
        if (info) {
          const meta = info.extmetadata || {};
          out = {
            src: info.thumburl || info.url,
            /* The artist field is HTML — Commons stores a link in it — so the tags are stripped
               rather than escaped and rendered. A credit line is a name, not markup. */
            by: String((meta.Artist || {}).value || '').replace(/<[^>]*>/g, '').trim().slice(0, 60)
                || 'Wikimedia Commons',
          };
        }
      }
      FEED_PICS[q] = out && out.src ? out : null;
      return FEED_PICS[q];
    })
    /* Remembered as NOTHING rather than left unknown. A term the service cannot answer would
       otherwise be asked again every time the card came round, which on a deck that repeats is a
       request per tap for an answer already given. */
    .catch(() => { FEED_PICS[q] = null; return null; });
}

function drawFeed() {
  const host = $('feed-screen');
  if (!host) return;
  // No end to reach, so no wrapping and no going below the first.
  FEED_AT = Math.max(0, FEED_AT);
  const it = feedItem(FEED_AT);
  if (!it) return;
  host.innerHTML = feedSlide(it);

  /* The photograph arrives afterwards and fades in over the drawing. It is loaded into an Image
     first and only put on screen once it has decoded — setting a background to a URL that is
     still downloading gives a card that flickers from gradient to white to picture.
     `at` is captured so a picture that arrives after three more taps is thrown away rather than
     landing on somebody else's fact. */
  const at = FEED_AT;
  feedPicture(it.pic).then(found => {
    if (!found || at !== FEED_AT) return;
    const art = host.querySelector('.feed-art');
    if (!art) return;
    const img = new Image();
    img.onload = () => {
      if (at !== FEED_AT) return;
      art.style.backgroundImage = `url("${found.src}")`;
      art.classList.add('has-photo');
      const cred = host.querySelector('.feed-credit');
      if (cred && found.by) cred.textContent = found.by;
    };
    /* A src that 404s or is blocked simply never loads, and the gradient stays. Nothing to
       handle: the failure state and the starting state are the same picture. */
    img.src = found.src;
  });

  /* Where you got to, kept for TODAY only. The deck is reshuffled on a new day, so yesterday's
     card 12 is a different fact and returning to it would mean nothing. */
  try {
    localStorage.setItem('familyFeed', JSON.stringify({ day: feedToday(), at: FEED_AT }));
  } catch {}
}

function initFeed() {
  if (!$('feed-screen')) return;
  if (FEED_AT === null) {
    let saved = 0;
    try {
      const kept = JSON.parse(localStorage.getItem('familyFeed') || '{}');
      if (kept.day === feedToday()) saved = Number(kept.at) || 0;
    } catch {}
    FEED_AT = saved;
  }
  drawFeed();
}

/* TAP FOR THE NEXT, and the left third for the one before — the gesture stories taught everybody,
   and it costs one line more than a tap that only goes forward. Going back is what makes tapping
   quickly safe: without it one tap too many loses a fact you were still reading, with no way to
   reach it again. */
on('feed-tap', (el, e) => {
  const box = el.getBoundingClientRect();
  const x = (e && e.clientX !== undefined ? e.clientX : box.right) - box.left;
  FEED_AT += (x < box.width * 0.3 && FEED_AT > 0) ? -1 : 1;
  drawFeed();
});


function paintTimer() {
  const el = $('timer-display');
  if (!el) return;
  const m = Math.floor(timerState.left / 60), s = timerState.left % 60;
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  /* Red in the last minute. The one moment the number has to be findable from across a room, and
     the only thing on this screen allowed to be red. */
  el.classList.toggle('bad', timerState.left > 0 && timerState.left <= 60);
  const btn = $('timer-toggle');
  if (btn) btn.textContent = timerState.running ? '❚❚' : '▶';
}


let flappyState = null;

/**
 * OPEN A WIDGET. Its markup into the sheet, then the one function that brings it to life.
 *
 * `openSheet` first and `start` second, always: every one of these finds its parts by id, and an
 * id cannot be found before the markup carrying it is in the document. That ordering was the whole
 * content of `wake` and it is the whole content of this.
 *
 * AND IT SAYS SO WHEN IT DOES NOT START. Same as before, in the same place — the space the widget
 * should have filled — because a card with a heading and nothing under it has been mistaken for an
 * unfinished feature twice.
 */
on('widget', el => {
  const wgt = WIDGETS.find(x => x.id === el.dataset.id);
  if (!wgt) return;
  /* Still here for a MIXED result — searching "timer" alongside three resources gives a list of
     cards, and the card has to open something. When Tools or Games is chosen on its own they are
     the pages themselves and nothing needs opening. */
  openSheet(wgt.name, wgt.html);
  startWidget_(wgt);
});

/* Started when their screen appears, and only then — a canvas loop running behind a screen nobody
   is looking at is a flat battery for nothing. */
/* `wake` IS GONE, and with it the whole idea of a screen having things that need starting.
   It existed for two screens and both are gone: nine widgets now open one at a time in the sheet,
   and `on('widget')` does what wake did — markup first, then the one function that brings it to
   life, then a sentence in the empty space if it did not.
   That also ends the fault it was built around. `paint` replaced a screen's markup and threw away
   whatever had been drawn into it, so every repaint blanked the arcade and `repaint` had to
   remember to wake it again. A sheet is not repainted; it is opened, used and closed. */

on('chess-new',  () => { CHESS = newGame(); CHESS_HIST = []; CHESS_PICK = -1; drawChess(); });
on('chess-undo', () => {
  if (CHESS_HIST.length >= 2) { CHESS_HIST.pop(); CHESS = CHESS_HIST.pop(); }
  else if (CHESS_HIST.length) { CHESS = CHESS_HIST.pop(); }
  CHESS_PICK = -1; drawChess();
});
on('tt-start',   () => startTimesTables?.());
on('tt-stop',    () => endTimesTables?.());
on('flap-start', () => toast('Tap the canvas to flap'));

/* ================================================================================================
   SWIPING BETWEEN TABS.

   The hard part is not the swipe — it is not breaking scrolling. A phone cannot know at the first
   pixel whether a finger is starting a horizontal swipe or a vertical scroll, and guessing wrong
   costs you scrolling, which is the thing people do a thousand times more often.

   So this WATCHES rather than decides. The first few pixels are allowed to happen; only once the
   finger has clearly committed to one axis is the gesture claimed, and under ten pixels nothing is
   claimed at all.
================================================================================================ */

const SWIPE = {
  x: 0, y: 0,          // where the finger started
  d: 0,                // how far it has travelled along the axis it claimed
  axis: null,          // null until the finger commits: 'x' or 'y'
  live: false,
  cells: null,         // the strip being dragged, held so the release moves the same one
};

/**
 * DOES THIS DRAG BELONG TO THE GRID, OR TO WHAT IS UNDER THE FINGER?
 *
 * ONE RULE, BOTH AXES. There were two lists — a blocklist of selectors for sideways and a
 * different one for vertical — and they disagreed by construction: the sideways list named the
 * chess board and the keypad, the vertical list reused it, and the result was that the three
 * widgets you most wanted to swipe off were the three you could not.
 *
 * The rule is now the same question asked in either direction: is there something under the finger
 * that can still scroll THIS WAY? If so it is theirs. If not, it is the grid's. A short list of
 * controls that consume a drag for their own reasons is the only exception.
 */
function axisFree(target, axis, dir) {
  if (!$('sheet').classList.contains('hidden')) return false;   // the sheet is over everything
  /* A text area scrolls its own contents and a select opens by dragging on some phones. Neither is
     a scroll container the walk below would notice, so they are named. */
  if (target.closest?.('textarea, select, [data-noswipe]')) return false;
  /* A cell is not a scroll container any more, so the walk below stops at anything genuinely
     inside one — the docket's list, the notepad — and hands everything else to the grid. That is
     what makes a swipe up mean the next widget rather than a few pixels of nothing. */

  let el = target;
  while (el && el !== document.body) {
    const style = getComputedStyle(el);
    const over = axis === 'x' ? style.overflowX : style.overflowY;
    if (over === 'auto' || over === 'scroll') {
      const size = axis === 'x' ? el.clientWidth : el.clientHeight;
      const full = axis === 'x' ? el.scrollWidth : el.scrollHeight;
      const pos  = axis === 'x' ? el.scrollLeft : el.scrollTop;
      if (full > size + 1) {
        /* It can scroll. Whether it still can IN THIS DIRECTION is what decides: at its very top a
           downward drag is nothing to it and everything to the grid, which is what lets a long
           docket be read to the end and then hand over in one movement. */
        const atStart = pos <= 0, atEnd = pos + size >= full - 1;
        if ((dir > 0 && !atStart) || (dir < 0 && !atEnd)) return false;
      }
    }
    el = el.parentElement;
  }
  return true;
}

/* HOW FAR IS FAR ENOUGH, as a fraction of the axis being travelled rather than a number of pixels.
   Sideways used to ask for a quarter of the width and vertical an eighth of the height, so the
   same flick meant different things depending which way it went. One number, and it is the same
   proportion of the same thumb whichever way it is moving. */
const THROW = ax => Math.max(56, AXES[ax].span() * 0.16);

/* POINTER EVENTS, NOT TOUCH EVENTS.
   The grid listened for `touchstart` and nothing else, so it worked on a phone and did nothing at
   all on a desktop — there is no touch to listen for, and dragging with a mouse produced no events
   the grid had any handler for. The tabs still worked because a tap is a click; the swipe simply
   was not there, which reads as broken rather than as unsupported.

   One pointer handler covers a finger, a mouse and a pen with the same code, which is the same
   argument as the two axes: a second way of doing it is a second thing to keep in step. */
addEventListener('pointerdown', e => {
  if (!e.isPrimary) return;                            // a second finger is a pinch, not a swipe
  /* A mouse only counts while a button is down. Without this, moving the cursor across the page
     would drag the grid. */
  if (e.pointerType === 'mouse' && e.buttons !== 1) return;
  SWIPE.x = e.clientX; SWIPE.y = e.clientY;
  SWIPE.d = 0; SWIPE.axis = null; SWIPE.cells = null;
  SWIPE.live = true;
  SWIPE.target = e.target;
}, { passive: true });

addEventListener('pointermove', e => {
  if (!SWIPE.live || !e.isPrimary) return;
  if (e.pointerType === 'mouse' && e.buttons !== 1) { SWIPE.live = false; return; }
  const dx = e.clientX - SWIPE.x, dy = e.clientY - SWIPE.y;

  /* THE DECISION, made once. Ten pixels is enough to tell a deliberate drag from the wobble in a
     thumb, and 1.4x means an ambiguous diagonal goes to the vertical — which on a phone is the
     safer wrong answer, because scrolling is the thing people do a thousand times more often. */
  if (!SWIPE.axis) {
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    const axis = Math.abs(dx) > Math.abs(dy) * 1.4 ? 'x' : 'y';
    const dir = axis === 'x' ? dx : dy;
    if (!AXES[axis].count() || !axisFree(SWIPE.target, axis, dir)) { SWIPE.live = false; return; }
    SWIPE.axis = axis;
    SWIPE.cells = AXES[axis].cells();
  }

  const ax = AXES[SWIPE.axis];
  const travelled = SWIPE.axis === 'x' ? dx : dy;
  const at = ax.at(), last = ax.count() - 1;
  /* Resisted at the ends. The grid still moves, grudgingly, which says "nothing that way" better
     than refusing to move at all. */
  const end = (travelled > 0 && at === 0) || (travelled < 0 && at === last);

  /* A mouse drag selects text as it goes, so the screen ends up half-highlighted behind the
     movement. Cancelled once the gesture belongs to the grid — and only then, because a drag that
     is still ambiguous might turn out to be somebody selecting a caption. */
  if (e.cancelable) e.preventDefault();
  document.getSelection?.()?.removeAllRanges?.();
  SWIPE.d = travelled;
  SWIPE.cells.forEach(el => el.classList.add('no-anim'));
  /* THE SAME PLACER that puts them at rest, given a drag. One function decides where a cell is,
     whether a finger is on it or not — two would be two things to keep in step, which is how the
     axes came apart in the first place. */
  placeCells(SWIPE.axis, false, end ? travelled * 0.25 : travelled);
}, { passive: false });

addEventListener('pointerup', () => {
  if (!SWIPE.live) return;
  const axis = SWIPE.axis, d = SWIPE.d, cells = SWIPE.cells;
  SWIPE.live = false; SWIPE.axis = null; SWIPE.d = 0; SWIPE.cells = null;
  if (!axis || !cells) return;

  cells.forEach(el => el.classList.remove('no-anim'));
  const ax = AXES[axis];
  if (Math.abs(d) >= THROW(axis)) ax.go(ax.at() + (d < 0 ? 1 : -1));
  else placeCells(axis);          // not far enough: it settles back, and is seen to
}, { passive: true });

/* THE SAME GESTURE ON A TRACKPAD. Two fingers is a `wheel` event rather than a touch, so none of
   the above sees it — and without this a desktop can reach the tabs and not the widgets, because
   every page fits and there is nothing to scroll.
   One handler for both directions now, deciding the axis exactly as the finger does. */
let wheelAt = 0, wheelStop = null, wheelDone = false;

addEventListener('wheel', e => {
  const axis = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4 ? 'x' : 'y';
  const delta = axis === 'x' ? e.deltaX : e.deltaY;
  if (!AXES[axis].count()) return;
  if (!axisFree(e.target, axis, -delta)) return;

  wheelAt += delta;
  /* ONE NOTCH IS ONE WIDGET. The threshold was ninety, which is about one notch of a mouse wheel
     and several of a trackpad — so a small scroll did nothing at all and a large one did one
     thing, and in between it felt like the page had shifted slightly and given up. Forty is past
     any accidental brush and short of a deliberate scroll.
     Still once per gesture: a trackpad keeps sending numbers after the fingers lift, and without
     that guard one flick walks through four tabs. */
  if (!wheelDone && Math.abs(wheelAt) > 40) {
    wheelDone = true;
    const ax = AXES[axis];
    const to = ax.at() + (wheelAt > 0 ? 1 : -1);
    if (to >= 0 && to < ax.count()) ax.go(to);
  }
  /* A gap of 140ms means the fingers have stopped: long enough to outlast the momentum, short
     enough that a second deliberate flick is a second gesture. */
  clearTimeout(wheelStop);
  wheelStop = setTimeout(() => { wheelAt = 0; wheelDone = false; }, 140);
}, { passive: true });

/* A finger interrupted — a call arriving, the app going to the background. Put the screen back,
   or it stays shifted sideways for ever. */
/* A finger interrupted — a call arriving, the app going to the background. Whatever was being
   dragged is put back, on whichever axis it was. */
addEventListener('pointercancel', () => {
  const axis = SWIPE.axis;
  (SWIPE.cells || []).forEach(el => el.classList.remove('no-anim'));
  SWIPE.live = false; SWIPE.axis = null; SWIPE.d = 0; SWIPE.cells = null;
  if (axis) placeCells(axis);
}, { passive: true });


/* ================================================================================================
   IF ANY OF THIS THROWS, SAY SO ON THE SCREEN.

   A script that fails while starting leaves the page exactly as index.html wrote it: a header that
   already says "Posts", an empty tab bar, and eight empty sections. Which looks like a layout bug,
   or a stylesheet problem, or a backend that will not answer — anything except what it is. It has
   looked like all three this week, and each time the actual error was sitting in a console nobody
   had open.

   So the error is put where the app would have been. It costs nothing when nothing goes wrong, and
   the first line of it is worth more than an afternoon of guessing.
================================================================================================ */
function bootFailed(err, when) {
  try {
    const box = document.getElementById('screen') || document.body;
    box.innerHTML = ''
      + '<div style="padding:1rem;font:13px/1.5 ui-monospace,Menlo,monospace;color:#ffd7a8">'
      + '<p style="color:#ff8f6b;font-weight:700;margin:0 0 .6rem">'
      + 'The app stopped while ' + String(when) + '.</p>'
      + '<p style="margin:0 0 .6rem;white-space:pre-wrap">'
      + String((err && err.message) || err) + '</p>'
      + (err && err.stack
          ? '<p style="margin:0 0 .6rem;color:#9a8f82;white-space:pre-wrap;font-size:11px">'
            + String(err.stack).split('\n').slice(0, 4).join('\n') + '</p>'
          : '')
      + '<p style="margin:0;color:#9a8f82">site ' + SITE_VERSION + ' · css ' + cssVersion() + '</p>'
      + '</div>';
  } catch (e2) {
    /* Even that failed — the document is not there to write to. Nothing left but the console. */
  }
  try { console.error('@family. stopped while ' + when, err); } catch (e3) {}
}

/**
 * ANYTHING THAT THROWS LATER, and did not get caught nearer to where it happened.
 *
 * IT DOES NOT WIPE THE SCREEN ANY MORE. It did, and that was wrong twice over: an app that is
 * working is replaced by a message for something that may not matter at all, and the message
 * itself is usually "Script error." — the two words a browser gives for an uncaught error in a
 * script it treats as cross-origin, which on file:// is every script. Trading a working app for
 * two words that could mean anything is a bad trade.
 *
 * A PICTURE THAT FAILED TO LOAD IS NOT A CRASH. A missing avatar, a Drive link nobody shared, a
 * font — these fire an error event with an element as the target, and the app is fine. They are
 * counted and ignored.
 *
 * Once only, still: a loop of failures should not bury the first message, which is the one that
 * says what actually happened.
 */
let toldYou = false;
addEventListener('error', e => {
  /* A resource, not the code. `target` is the <img> or <script> that failed. */
  if (e && e.target && e.target !== window && e.target.tagName) {
    console.warn('[load]', e.target.tagName, e.target.currentSrc || e.target.src || '');
    return;
  }
  if (toldYou) return;
  toldYou = true;

  const msg = String((e && e.error && e.error.message) || (e && e.message) || 'something went wrong');
  console.error('[window]', (e && e.error) || msg);
  /* A banner rather than the whole screen. Whatever threw, everything else still works — and if it
     did not, the person can see that for themselves without being told. */
  banner('Something went wrong: ' + msg
    + (/^Script error/i.test(msg)
        /* The browser is withholding it, which it does for any script it treats as cross-origin —
           and opening the app from a file:// path makes every script cross-origin. */
        ? ' — the browser will not say more than that when the app is opened from a file rather '
          + 'than from a web address. The console has the real one.'
        : ''));
});

/* ================================================================================================
   AND GO.

   THE LAST LINES IN THE FILE, deliberately. `go()` draws a screen, and a screen only exists once
   its `screen(...)` call has run — so starting anywhere above them means drawing a table that has
   not been filled in yet. It did, for weeks: every tab said "Nothing here yet" until the first
   fetch returned, which looked like an empty database rather than an app that had not started.

   Everything below a boot line is a thing the boot cannot see. So there is nothing below it.
================================================================================================ */
try {
  buildTabs();
  go(AT, false);
} catch (err) {
  /* Drawing failed. There is no point asking the backend for data to put in a screen that could
     not be built, so `load` is not called — the message stays on screen instead of being replaced
     by a network error a moment later. */
  bootFailed(err, 'drawing the first screen');
  throw err;
}

load();
