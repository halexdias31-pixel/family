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
const SITE_VERSION = '2026-08-06-wear';

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
  { id: 'stuff',   icon: '🎁', label: 'Stuff',   title: 'Shop & Resources' },
  { id: 'tools',   icon: '🧰', label: 'Tools',   title: 'Tools' },

  /* BOOK, dead centre and a plus. The middle is where a thumb rests without moving, and a plus
     says "make something" in a way no other glyph does — it is the one action the whole app is
     for, and it should not be a word among six other words. */
  { id: 'book',    icon: '＋', label: 'Book',    title: 'Book a session', big: true },

  /* NOT "Who". It holds tutors, venues AND subjects — people, places and things — so a name
     asking about people was wrong about two thirds of it. "Find" is what you are doing on it. */
  { id: 'find',    icon: '🔎', label: 'Find',    title: 'Tutors, venues & subjects' },
  { id: 'arcade',  icon: '🕹', label: 'Arcade',  title: 'Arcade' },
  { id: 'library', icon: '🔗', label: 'Library', title: 'Link Library' },
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

function go(id, remember) {
  const tab = TABS.find(t => t.id === id) || TABS[0];
  AT = tab.id;
  if (remember !== false) { try { localStorage.setItem('familyTab', AT); } catch {} }

  /* Every screen hidden, one shown. `hidden` rather than emptied, because a hidden screen keeps
     its half-filled form and its scroll position — and a person switching tabs to check something
     expects to come back to what they were doing. */
  TABS.forEach(t => $('s-' + t.id)?.classList.toggle('hidden', t.id !== AT));
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
  wake(AT);
  /* After wake, because a page holding a canvas has to exist and be sized before it is moved.
     INSTANT, because this is arriving rather than travelling: the tab remembers which widget you
     were on, and animating there from the top is the app appearing to lose your place and then
     go and find it. */
  paintPager(AT, true);

  /* Back to the top on a tab change. Landing halfway down a new screen because the last one was
     scrolled is the single most disorienting thing a tab bar can do. */
  scrollTo({ top: 0, behavior: 'instant' });
}

/** Redraw one screen where it stands. Called after anything that changes what it should say. */
function paint(id) {
  const el = $('s-' + id);
  const s = SCREENS[id];
  if (!el) return;
  el.innerHTML = s
    ? s.draw()
    : '<p class="empty">Nothing here yet.</p>';
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
  tools:  ['Calculator', 'Timer', 'Docket', 'Notepad', 'Calendar'],
  arcade: ['Chess', 'Times Tables', 'Flabby Pird', 'One more thing'],
};

/* Which page each paged screen is showing. Kept per screen, so leaving Tools on the calendar and
   coming back puts you on the calendar — a pager that resets is a pager you have to re-navigate
   every time you check something on another tab. */
const PAGE = { tools: 0, arcade: 0 };

const pageCount = id => (PAGER[id] || []).length;

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
  const wrap = $('s-' + id)?.querySelector('.pager');
  const strip = wrap?.querySelector('.pages');
  if (!strip) return;
  const n = Math.max(0, Math.min(pageCount(id) - 1, PAGE[id] || 0));
  PAGE[id] = n;

  /* One frame with the transition off. Removed on the NEXT frame rather than immediately, because
     a style set and unset inside the same frame is a style the browser never applies — it collapses
     both into one recalculation and animates anyway. */
  if (instant) {
    wrap.classList.add('no-anim');
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove('no-anim')));
  }

  strip.style.setProperty('--drag', '0px');
  strip.querySelectorAll('.page').forEach((pg, i) => {
    const o = i - n;
    pg.style.setProperty('--o', o);
    pg.style.setProperty('--a', Math.abs(o));
    /* The front one is the only one that can be touched or scrolled. Without that, a tap aimed at
       the calculator can land on the timer showing behind it — which is worse than useless,
       because it works. */
    pg.classList.toggle('on', o === 0);
  });

  $('s-' + id).querySelectorAll('.page-dot').forEach((d, i) =>
    d.classList.toggle('on', i === n));
  /* The header says which widget, because the dots say how many and not which. On a screen where
     every page is a different tool that is the one word worth having at the top. */
  const tab = TABS.find(t => t.id === id);
  if (id === AT && tab) $('top-title').textContent = PAGER[id][n] || tab.title;
}

function goPage(id, to) {
  if (!PAGER[id]) return;
  const n = Math.max(0, Math.min(pageCount(id) - 1, to));
  if (n === PAGE[id]) return;
  PAGE[id] = n;
  /* The canvas is sized from its box, and its box is only real once its page is the one on screen.
     Arriving on the bird for the first time has to re-measure, or it draws into whatever size it
     happened to have while it was off to one side. */
  if (id === 'arcade' && PAGER.arcade[n] === 'Flabby Pird') setTimeout(() => initFlappy(), 300);
  /* A running game on a page nobody is looking at is a flat battery for nothing — the same reason
     `wake` only starts what is on screen. */
  if (id === 'arcade' && flappyState && flappyState.raf) {
    cancelAnimationFrame(flappyState.raf);
    flappyState.running = false;
  }
  paintPager(id);
}

/** Wrap a screen's cards into a vertical strip of pages. */
const pages = (id, cards) =>
  `<div class="pager"><div class="pages">${
    cards.map(c => `<section class="page">${c}</section>`).join('')
  }</div><div class="page-dots">${
    cards.map((c, i) => `<span class="page-dot" data-do="page-dot" data-id="${id}"
      data-n="${i}"></span>`).join('')
  }</div></div>`;

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

/* Jumping straight to a widget. The dots are a map as well as a position — four of them says
   there are four things here, which a scrolling column never managed to say at all. */
on('page-dot', el => goPage(el.dataset.id, Number(el.dataset.n)));

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
    ACTIONS[doer.dataset.do](doer, e);
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
      /* WHAT THE BACKEND CAN DO, against what this site needs. `features` has been in the payload
         since before the rewrite and nothing has ever read it — which is why a stale deploy shows
         up as "That action is not recognised", a sentence written for somebody who did something
         wrong rather than for a deployment that is out of date. */
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
    else banner('The server said: ' + (d.error || 'something went wrong'));
  } catch (err) {
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
      el.innerHTML = 'Could not reach the backend.<br>'
        + '<a class="link" href="' + esc(API) + '" target="_blank" rel="noopener">Open it in a '
        + 'tab</a> — JSON means the address is right; a Google sign-in page means that deployment '
        + 'is set to “Only myself” rather than “Anyone”; a 404 means the id is wrong.<br>'
        + '<span class="faint">“Failed to fetch” means the reply never arrived at all: this URL is '
        + 'not being served. Check Manage deployments — the one under ACTIVE is the only one that '
        + 'answers, and an archived id looks exactly like this.</span><br>'
        + '<span class="faint">' + esc(String(err && err.message || err))
        + ' · site ' + esc(SITE_VERSION) + '</span>';
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

/* ---------- GO ------------------------------------------------------------------------------------ */
buildTabs();
go(AT, false);
load();

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

screen('find', () => {
  const tutors = (DATA.tutors || []).filter(t => t.title);
  const venues = (DATA.venues || []).filter(v => v.title);

  if (!tutors.length && !venues.length) {
    return '<p class="empty">Nothing loaded yet.</p>';
  }

  /* `is-tutor`, so a tutor's name is red wherever it appears — the same trick that makes a
     subject green and a venue purple. Three colours, three questions: what, where, who. */
  const person = t => `
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

  /* `is-venue`, so a venue name is purple wherever it appears — the same trick that makes a
     subject green, and the reason the eye can read this list without a legend. */
  const place = v => `
    <div class="card tap is-venue" data-do="who" data-kind="venue" data-name="${esc(v.title)}">
      <h3>${esc(v.title)}</h3>
      ${v.subtitle ? `<p class="sub">${mark(v.subtitle)}</p>` : ''}
      ${v.bestRate
        ? `<div class="row"><span class="k">Room hire</span>
             <span class="v mono">${money(v.bestRate)}/h</span></div>`
        : '<p class="faint">No charge</p>'}
    </div>`;

  /* Subjects last, after venues — the order a booking is assembled in: who, then where, then
     what. A list that matches the order somebody thinks in needs no explaining. */
  const subs = (typeof subjectRows === 'function' ? subjectRows() : []);
  const subject = x => `
    <div class="card tap is-subject" data-do="subject" data-name="${esc(x.name)}">
      <h3>${esc(x.name)}</h3>
      <div class="row">
        <span class="k">${x.mult === 1 ? 'No surcharge' : 'Surcharge'}</span>
        <span class="v mono">${x.mult === 1 ? '—'
          : (x.mult > 1 ? '+' : '−') + Math.abs(Math.round((x.mult - 1) * 100)) + '%'}</span>
      </div>
      ${x.tutors && x.tutors.length
        ? `<p class="faint" style="margin:.3rem 0 0">${esc(x.tutors.map(t => t.title).join(', '))}</p>`
        : '<p class="faint" style="margin:.3rem 0 0">Nobody teaches this yet</p>'}
    </div>`;

  return (tutors.length ? '<h2>Tutors</h2>' + tutors.map(person).join('') : '')
       + (venues.length ? '<h2>Venues</h2>' + venues.map(place).join('') : '')
       + (subs.length ? '<h2>Subjects</h2>' + subs.map(subject).join('') : '');
});

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
  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'setListed',
    adminName: USER.name, name: USER.name, who: el.dataset.who, on }) })
    .then(r => r.json())
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
  if (el.tagName === 'SELECT' || el.type === 'checkbox') ACTIONS[el.dataset.do](el, e);
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
screen('me', () => {
  if (!USER) {
    return `<div class="card">
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
      </div>`;
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
  return `<div class="card">
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

    <div class="card tap" data-do="change-pin"><h3>Change your PIN</h3>
      <p class="sub">You will need the current one.</p></div>

    <div class="card tap" data-do="my-referral"><h3>Tell someone</h3>
      <p class="sub">A link only you have. We will know it came from you.</p></div>

    <button class="btn quiet" data-do="signout" style="margin-top:.4rem">Sign out</button>
    ${/* BOTH VERSIONS, at the bottom where a version number belongs. It is the answer to the
          question that has cost more rounds than any bug: is what I am looking at the thing I
          just changed? Two strings, and either one being stale is visible without opening
          anything. */''}
    <p class="faint" style="text-align:center">@family. · Merton &amp; Wandsworth<br>
      site ${esc(SITE_VERSION)} · backend ${esc(DATA.version || '—')}</p>`;
});

on('do-signin', () => {
  const name = ($('in-name') || {}).value || '';
  const pin = ($('in-pin') || {}).value || '';
  const said = $('in-said');
  if (!name || !pin) { if (said) said.textContent = 'Both, please.'; return; }
  if (said) said.textContent = 'Checking…';
  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'verifyLogin', name, pin }) })
    .then(r => r.json())
    .then(d => {
      if (!d || !d.success) { if (said) said.textContent = (d && d.error) || 'That did not work.'; return; }
      USER = d;
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

  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'saveAvatar',
    name: USER.name, personId: USER.personId, avatar: cfg }) })
    .then(r => r.json())
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
on('edit-me',     () => toast('The profile form is next'));
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
  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'changePin', name: USER.name,
    currentPin: v('pin-now'), newPin: v('pin-new') }) })
    .then(r => r.json())
    .then(d => {
      if (d && d.error) { if (said) said.textContent = d.error; return; }
      toast('PIN changed'); closeSheet();
    })
    .catch(() => { if (said) said.textContent = 'Could not reach the server.'; });
});

on('my-referral', () => {
  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'myReferral', name: USER.name }) })
    .then(r => r.json())
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

/**
 * A SHAPE OF THE THING THAT IS COMING, not a spinner.
 *
 * A spinner says "wait"; this says "a picture and two lines are about to appear here" — so the
 * page does not jump when they do, and the wait feels like loading rather than like nothing
 * happening.
 */
function skeleton(n = 2) {
  return Array.from({ length: n }, () => `
    <article class="post sk">
      <header class="post-by">
        <span class="sk-box" style="width:1.9rem;height:1.9rem;border-radius:50%"></span>
        <span class="sk-box" style="width:6rem;height:.7rem"></span>
      </header>
      <span class="sk-box sk-pic"></span>
      <div class="post-acts"><span class="sk-box" style="width:3.5rem;height:1rem"></span></div>
      <span class="sk-box" style="width:80%;height:.7rem;margin-top:.5rem"></span>
      <span class="sk-box" style="width:45%;height:.7rem;margin-top:.35rem"></span>
    </article>`).join('');
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
  if (!LOADED) return skeleton(2);

  const posts = feedPosts();
  if (!posts.length) {
    return `<p class="empty">Nothing posted yet.<br>
      <span class="faint">Add a row to the posts tab with an image link and a caption.</span></p>`;
  }

  return posts.map((p, i) => {
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
  }).join('');
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

  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'reactPost',
    name: USER.name, postId: id, emoji }) })
    .then(x => x.json())
    .then(d => { if (d && d.error) throw new Error(d.error); })
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

  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'votePoll',
    name: USER.name, postId: id, choice }) })
    .then(r => r.json())
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
  go('posts');
  /* After the frame that draws it — the element cannot be scrolled to before it exists. */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const el = document.querySelector(`[data-post="${CSS.escape(id)}"]`);
    if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('post-lit'); }
  }));
}

/* ---------- POSTING ------------------------------------------------------------------------------
   An admin picks a photograph and it goes to the Drive folder and the posts tab at once.

   RESIZED ON THE PHONE FIRST. A modern camera makes a 4MB picture, which as base64 is 5.5MB — over
   what Apps Script will take, and a minute of a library's wifi. Scaled to 1600px and re-encoded it
   is about 300KB, and nobody can tell on a phone screen.
--------------------------------------------------------------------------------------------- */
function shrink(file, maxSide = 1600, quality = .82) {
  return new Promise((done, fail) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);       // or the full-size picture stays in memory
      done(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => fail(new Error('That file is not a picture we can read.'));
    img.src = URL.createObjectURL(file);
  });
}

on('new-post', () => openSheet('New post', `
  <label class="field"><span>picture</span>
    <input type="file" id="post-file" accept="image/*"></label>
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
  <p class="faint" id="post-said" style="margin:.6rem 0 0">
    Goes to the Drive folder and the posts tab together.</p>`));

/* A preview the moment a file is chosen. It is also the first sign that the resize worked — if the
   preview appears, the picture is readable and small. */
document.addEventListener('change', async e => {
  if (e.target.id !== 'post-file') return;
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const said = $('post-said');
  try {
    const data = await shrink(f);
    $('post-preview').innerHTML = `<img src="${data}" style="width:100%;margin-bottom:.6rem">`;
    $('post-preview').dataset.data = data;
    if (said) said.textContent = Math.round(data.length / 1365) + ' KB after resizing — from '
      + Math.round(f.size / 1024) + ' KB.';
  } catch (err) {
    if (said) said.textContent = String(err.message || err);
  }
});

/* Which name goes on the post. The business by default — the feed should read @family. rather
   than whoever had their phone out, and posting under your own name should be a choice you make
   rather than the one you fall into. */
on('as', el => {
  const row = $('post-as');
  if (!row) return;
  row.dataset.as = el.dataset.as;
  row.querySelectorAll('[data-do="as"]').forEach(b =>
    b.classList.toggle('on', b.dataset.as === el.dataset.as));
});

on('post-send', el => {
  const data = ($('post-preview') || {}).dataset?.data || '';
  const said = $('post-said');
  if (!data) { if (said) said.textContent = 'Pick a picture first.'; return; }
  el.disabled = true;
  if (said) said.textContent = 'Uploading…';

  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'addPost',
    name: USER.name, adminName: USER.name, data,
    caption: ($('post-cap') || {}).value || '',
    location: ($('post-loc') || {}).value || '',
    poll: ($('post-poll') || {}).value || '',
    postAs: ($('post-as') || {}).dataset?.as || 'brand',
    body: ($('post-body') || {}).value || '' }) })
    .then(r => r.json())
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
  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'editPost',
    name: USER.name, adminName: USER.name, id: el.dataset.id, fields }) })
    .then(r => r.json())
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

  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'deletePost',
    name: USER.name, adminName: USER.name, id: el.dataset.id, on: restoring }) })
    .then(r => r.json())
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
  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'scanPosts',
    name: USER.name, adminName: USER.name }) })
    .then(r => r.json())
    .then(d => {
      if (d && d.error) { toast(d.error); return; }
      if (d.added || d.dated) {
        toast([d.added ? d.added + ' new post' + (d.added === 1 ? '' : 's') : '',
               d.dated ? d.dated + ' date' + (d.dated === 1 ? '' : 's') + ' filled in' : '']
              .filter(Boolean).join(', '));
        load();
        return;
      }

      /* NOTHING ADDED. A toast saying "nothing found" leaves you with no way to tell a folder in
         the wrong place from a folder full of shortcuts, so the whole report is shown instead —
         which folder it opened, how many it looked in, and what it skipped and why. */
      openSheet('Nothing to add', `
        <div class="row"><span class="k">Folder</span>
          <span class="v">${esc(d.folder || 'unknown')}</span></div>
        <div class="row"><span class="k">Folders looked in</span>
          <span class="v mono">${d.looked || 1}</span></div>
        <div class="row"><span class="k">Files seen</span>
          <span class="v mono">${(d.seen || []).length}</span></div>
        ${(d.seen || []).length
          ? `<h2>What it skipped</h2>` + (d.seen || []).map(x =>
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

screen('library', () => {
  const links = [...(DATA.links || [])].sort((a, b) =>
    String(a.title || '').localeCompare(String(b.title || ''), 'en', { sensitivity: 'base' }));
  if (!links.length) return '<p class="empty">No links yet.</p>';

  return `<div class="tiles">${links.map(l => {
    const shape = (LINK_SHAPE.find(x => x.is.test(norm(l.category))) || {}).cls || 'mark';
    const want = norm(l.colour);
    const hex = /^#?[0-9a-f]{6}$/.test(want) ? (want[0] === '#' ? want : '#' + want) : null;
    /* A colour chosen in the sheet wins; otherwise one derived from the name, so every link looks
       like itself without anybody having to pick ninety colours. */
    const col = NAMED_COLOURS[want] || hex || `hsl(${hashOf(l.title || '?') % 360} 48% 46%)`;
    const initials = String(l.title || '').replace(/[^A-Za-z0-9 ]/g, '')
      .split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
    return `<a class="tile" href="${esc(l.url)}" target="_blank" rel="noopener">
      <span class="shape ${shape}" style="--c:${col}">${esc(initials)}</span>
      <span class="tile-name">${esc(l.title)}</span>
    </a>`;
  }).join('')}</div>`;
});


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
    if (x.kind === 'avatar' && x.slot && x.artId) shop[x.slot + ':' + x.artId] = x;
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
const STUFF = { q: '', group: 'subject', sort: 'name', filters: [] };

/* The fields a filter can be ON, what each is called, and where its values come from. One table,
   so adding a way to filter is a row here and nothing else — the picker, the matching and the
   chip label all read it. */
const FILTER_FIELDS = {
  subject: { label: 'Subject', of: items => uniq(items.map(x => x.subject)).sort(cmpText) },
  grade:   { label: 'Grade',   of: items => uniq(items.map(x => x.grade)).sort(cmpText) },
  /* Three kinds, not two. A wearable and a bicycle are both "shop" to the database and nothing
     alike to a person: one is earned and worn, the other is bought and posted. */
  kind:    { label: 'Kind',    of: () => ['Shop', 'Wearables', 'Resources'] },
  slot:    { label: 'Slot',    of: items => uniq(items.map(x => x.slot)).sort(cmpText) },
  /* Not a field on the item — a question about the person. It sits in the same list because to
     somebody filtering it is the same kind of thing: one more way to see less. */
  afford:  { label: 'Price',   of: () => USER ? ['Can afford', 'Free'] : ['Free'] },
};

/** Does one item satisfy one filter? The only place a field's values are interpreted. */
function filterHit(x, f, credits) {
  switch (f.field) {
    case 'subject': return x.subject === f.value;
    case 'grade':   return String(x.grade) === String(f.value);
    case 'kind':    return f.value === 'Wearables' ? !!x.wearable
                         : f.value === 'Shop'      ? x.kind === 'shop' && !x.wearable
                         :                           x.kind === 'topic';
    case 'slot':    return x.slot === f.value;
    case 'afford':  return f.value === 'Free' ? x.cost === 0
                                              : x.kind === 'shop' && x.cost <= credits;
    default:        return true;
  }
}

/* THE RESOURCES, flattened out of where the payload actually puts them.

   `DATA.resources` does not exist — I had been reading a key nothing sends, which is why the
   section was empty. They live nested in `dropdowns.checklists`, keyed by subject and then by
   band, because that is the shape the checklist needs them in.

   Flattened here rather than changed at the source: the checklist wants them nested and this wants
   them flat, and a payload that carries the same four hundred rows twice to satisfy both would be
   a waste of every phone's morning. */
function allTopics() {
  const by = (DATA.dropdowns || {}).checklists || {};
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

  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'toggleTopicTick',
    name: USER.name, handle: me, id: t.id, rowIndex: t.rowIndex, tick: n, checked }) })
    .then(r => r.json())
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
    /* `name` and `price`, which is what the payload actually calls them. I had written `title`
       and `cost` — so every shop item drew with no name and a price of zero. */
    ...(DATA.shop || []).map(x => ({
      kind: 'shop', name: x.name, key: x.name, sub: x.description || '', image: x.image,
      cost: Number(x.price) || 0, slot: x.slot || '', subject: '', grade: '', off: false,
      /* WHETHER IT IS A WEARABLE, AND WHAT IT COSTS TO REACH.
         A wearable is priced in one of two currencies and the card only ever read one of them: a
         level-gated item has a price of zero, which was being drawn as "free" — an item saying
         free that cannot be taken is worse than one saying nothing, because somebody presses it. */
      wearable: x.kind === 'avatar',
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
        /* The topic itself rides along, so the card can draw its ticks without looking it up
           again — a lookup per card is four hundred scans of four hundred rows to draw a list. */
        topic: x,
      })),
  ];
}

/* Numeric-aware, so Grade 2 comes before Grade 10. Plain alphabetical put Grade 10 first, and that
   reads as the list being unsorted rather than sorted by a rule nobody wanted. */
const cmpText = (a, b) =>
  String(a).localeCompare(String(b), 'en', { sensitivity: 'base', numeric: true });

/* Buckets that mean "none of the above" sink to the bottom. Alphabetically "Other" and "Ungraded"
   land in the middle of the real groups, where they read as a subject somebody invented. */
const GROUP_LAST = ['Other', 'Ungraded', 'Shop', 'Resources'];
const groupOrder = (a, b) => {
  const la = GROUP_LAST.includes(a), lb = GROUP_LAST.includes(b);
  return la !== lb ? (la ? 1 : -1) : cmpText(a, b);
};

function groupOf(x) {
  switch (STUFF.group) {
    /* A shop item has no grade and never will. It gets its own bucket rather than being forced
       into "Ungraded" beside a topic that genuinely is missing one — those are different facts. */
    case 'grade': return x.kind === 'topic'
      ? (x.grade ? 'Grade ' + x.grade : 'Ungraded') : 'Shop';
    case 'kind':  return x.kind === 'shop' ? 'Shop' : 'Resources';
    default:      return x.kind === 'topic' ? (x.subject || 'Other') : (x.slot || 'Shop');
  }
}

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

  return out.sort((a, b) =>
      STUFF.sort === 'cost'  ? (a.cost - b.cost) || cmpText(a.name, b.name)
    : STUFF.sort === 'group' ? groupOrder(groupOf(a), groupOf(b)) || cmpText(a.name, b.name)
    :                          cmpText(a.name, b.name));
}

/* The list and nothing else — the count, the groups, the cards. Everything above it on the screen
   is untouched when this is redrawn, which is the whole point. */
function stuffList() {
  const all = stuffItems();
  const credits = USER ? (USER.credits || 0) : 0;
  const items = stuffFind(all, credits);

  /* One card shape for both, because they are the same kind of thing to a person looking for one:
     a picture, a name, what it belongs to, and — if it costs anything — what.

     A RESOURCE SHOWS NO PRICE AT ALL. It used to say "0 credits — free", on the argument that a
     blank where a price should be reads as the app having forgotten. That argument holds for one
     card among priced ones and collapses when four hundred of the four hundred and ten say it:
     repeated on every row it stops being information and becomes a line you read past, and the
     one card that DOES cost something loses the contrast that made its price visible.

     A shop item priced at zero still says free, because there it means something — free among
     things that cost. A resource is free because it is a resource. */
  const card = x => {
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
    return `<div class="card tap${x.kind === 'topic' ? ' is-subject' : ''}${x.off ? ' is-off' : ''}"
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
          <p class="sub">${mark(x.sub || groupOf(x))}${x.wearable && x.slot
            /* WHERE IT GOES. Until there are drawings, the slot is the only thing on the card that
               says what the object actually is — "Cape · shoulders" is a garment and "Cape" on its
               own is a word. */
            ? ` <span class="faint">· ${esc(x.slot)}</span>` : ''}</p>
          ${price}
        </div>
      </div>
      ${x.kind === 'topic' && x.topic ? tickRow(x.topic) : ''}
    </div>`;
  };

  let body;
  if (!items.length) {
    /* WHICH control emptied it. "Nothing matches" beside four controls leaves somebody turning
       each one off in turn to find out which one is lying to them. */
    const why = STUFF.q && STUFF.filters.length ? 'Try fewer words, or take a filter off.'
              : STUFF.q                          ? 'Try fewer words.'
              : STUFF.filters.length             ? 'Nothing matches all of those together.'
              : '';
    body = `<p class="empty">Nothing matches.${
      why ? `<br><span class="faint">${esc(why)}</span>` : ''}</p>`;
  } else if (STUFF.group === 'none') {
    body = items.map(card).join('');
  } else {
    /* Grouped. The heading carries a COUNT, because "Maths 27" tells somebody whether it is worth
       opening in a way "Maths" does not.
       It goes through the laws like everything else — so a heading that names a subject is green
       without this code knowing what a subject is. */
    const by = {};
    items.forEach(x => { const g = groupOf(x); (by[g] = by[g] || []).push(x); });
    body = Object.keys(by).sort(groupOrder).map(g =>
      `<h2><span>${mark(g)}</span><span class="faint">${by[g].length}</span></h2>`
      + by[g].map(card).join('')).join('');
  }

  return `<p class="faint">${items.length} of ${all.length}</p>` + body;
}

/* The chips, and the + that adds one. Drawn with the list rather than with the two selects above
   it, because this row grows and shrinks and a fixed control does not. */
function filterChips() {
  return `<div class="chips">
    ${STUFF.filters.map((f, i) => `
      <button class="chip" data-do="filter-drop" data-i="${i}">
        <span class="chip-k">${esc((FILTER_FIELDS[f.field] || {}).label || f.field)}</span>
        ${esc(f.value)}<span class="chip-x">✕</span>
      </button>`).join('')}
    <button class="chip add" data-do="filter-add">+ filter</button>
    ${STUFF.filters.length > 1
      ? '<button class="chip clear" data-do="filter-clear">clear</button>' : ''}
  </div>`;
}

/* THE PICKER, in two steps — which field, then which value. One long list of every value across
   every field would put "Maths", "Grade 9" and "Can afford" together with nothing to say they are
   different kinds of thing. */
on('filter-add', () => {
  const items = stuffItems();
  const fields = Object.keys(FILTER_FIELDS)
    .filter(k => FILTER_FIELDS[k].of(items).filter(Boolean).length);
  openSheet('Add a filter', fields.map(k => {
    const vals = FILTER_FIELDS[k].of(items).filter(Boolean);
    return `<div class="card tap" data-do="filter-field" data-field="${esc(k)}">
       <h3>${esc(FILTER_FIELDS[k].label)}</h3>
       <p class="sub">${esc(vals.slice(0, 6).join(', '))}${vals.length > 6 ? '…' : ''}</p>
     </div>`;
  }).join(''));
});

on('filter-field', el => {
  const field = el.dataset.field;
  const items = stuffItems();
  const credits = USER ? (USER.credits || 0) : 0;
  const values = FILTER_FIELDS[field].of(items).filter(Boolean);

  openSheet(FILTER_FIELDS[field].label, values.map(v => {
    /* HOW MANY it would leave. A value with a number beside it is a choice; one without is a
       guess, and a guess that empties the list costs two taps to undo. */
    const n = items.filter(x => filterHit(x, { field, value: v }, credits)).length;
    const already = STUFF.filters.some(f => f.field === field && f.value === v);
    return `<div class="card tap${already ? ' is-off' : ''}"
         data-do="${already ? 'noop' : 'filter-pick'}"
         data-field="${esc(field)}" data-value="${esc(v)}">
      <div class="row" style="border:0;padding:0">
        <span class="k">${mark(v)}${already ? ' <span class="faint">— already on</span>' : ''}</span>
        <span class="v mono faint">${n}</span>
      </div>
    </div>`;
  }).join(''));
});

on('noop', () => {});
on('filter-pick', el => {
  STUFF.filters.push({ field: el.dataset.field, value: el.dataset.value });
  closeSheet();
  paintStuff();
});
on('filter-drop', el => { STUFF.filters.splice(Number(el.dataset.i), 1); paintStuff(); });
on('filter-clear', () => { STUFF.filters = []; paintStuff(); });

/** Redraw the chips and the list. The two selects above them keep their state and their focus. */
function paintStuff() {
  const chips = $('stuff-chips');
  if (chips) chips.innerHTML = filterChips();
  const el = $('stuff-list');
  if (el) el.innerHTML = stuffList();
}

screen('stuff', () => {
  const credits = USER ? (USER.credits || 0) : 0;
  /* The control must SAY what it is doing. Without this the box snapped back to its first option
     every time the screen was redrawn, so the list and the dropdown above it disagreed — and the
     one you believe is the one you can see. */
  const sel = (what, v) => STUFF[what] === v ? ' selected' : '';

  return (USER ? `<div class="card"><div class="row" style="border:0;padding:0">
        <span class="k">Your credits</span><span class="v big gold mono">${credits}</span>
      </div></div>` : '')
    + `<input class="search" id="stuff-q" placeholder="Search…" value="${esc(STUFF.q)}">
    <div class="pick-row">
      <select id="stuff-group" data-do="stuff-set" data-what="group">
        <option value="subject"${sel('group','subject')}>By subject</option>
        <option value="grade"${sel('group','grade')}>By grade</option>
        <option value="kind"${sel('group','kind')}>Shop / resources</option>
        <option value="none"${sel('group','none')}>No grouping</option>
      </select>
      <select id="stuff-sort" data-do="stuff-set" data-what="sort">
        <option value="name"${sel('sort','name')}>A–Z</option>
        <option value="cost"${sel('sort','cost')}>Cheapest</option>
        <option value="group"${sel('sort','group')}>By group</option>
      </select>
    </div>
    <div id="stuff-chips">${filterChips()}</div>
    <div id="stuff-list">${stuffList()}</div>`;
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
    fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'saveTodo',
      name: USER.name, personId: USER.personId, todo: USER.todo }) })
      .then(r => r.json())
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
    fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'saveNotepad',
      name: USER.name, personId: USER.personId, notepad: USER.notepad }) })
      .then(r => r.json())
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

on('topic-edit', el => {
  const t = topicBy(el.dataset.key);
  if (!t) return;
  const subjects = (DATA.dropdowns || {}).subjects || [];
  openSheet('Edit — ' + t.name, `
    <label class="field"><span>name</span>
      <input id="ed-name" value="${esc(t.name)}"></label>
    <label class="field"><span>subject</span>
      <input id="ed-subject" value="${esc(t.subject || '')}" list="ed-subjects">
      <datalist id="ed-subjects">
        ${subjects.map(s => `<option value="${esc(s)}">`).join('')}
      </datalist></label>
    <label class="field"><span>grade</span>
      <input id="ed-grade" value="${esc(String(t.grade || ''))}"></label>
    <label class="field"><span>link</span>
      <input id="ed-link" value="${esc(t.link || '')}"></label>
    <label class="field"><span>type</span>
      <input id="ed-type" value="${esc(t.type || '')}"></label>
    <label class="field"><span>exam board</span>
      <input id="ed-board" value="${esc(t.board || '')}"></label>
    <label class="field"><span>pages</span>
      <input id="ed-pages" inputmode="numeric" value="${t.pages || ''}"></label>
    <label class="check">
      <input type="checkbox" id="ed-print" ${canPrint(t) ? 'checked' : ''}>
      <span class="box"></span>
      <span>Offer a printed copy<br><span class="faint">Untick for anything too long to be
        worth printing.</span></span></label>
    <button class="btn" data-do="topic-save" data-key="${esc(t.id || t.name)}">Save</button>
    <p class="faint" id="ed-said" style="margin:.6rem 0 0">
      Changing the link clears the page count — it was read off the old file.</p>`);
});

on('topic-save', el => {
  const v = id => (($(id) || {}).value || '').trim();
  const said = $('ed-said');
  if (!v('ed-name')) { if (said) said.textContent = 'It needs a name.'; return; }
  el.disabled = true;
  if (said) said.textContent = 'Saving…';

  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'editResource',
    name: USER.name, adminName: USER.name, id: el.dataset.key,
    fields: {
      name: v('ed-name'), subject: v('ed-subject'), grade: v('ed-grade'),
      link: v('ed-link'), resource_type: v('ed-type'), exam_board: v('ed-board'),
      pages: v('ed-pages'), printable: ($('ed-print') || {}).checked ? 'TRUE' : 'FALSE',
    } }) })
    .then(r => r.json())
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

  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'deleteResource',
    name: USER.name, adminName: USER.name, id: el.dataset.key, on: restoring }) })
    .then(r => r.json())
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
  const wearable = it.kind === 'avatar';

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

  fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'saveAvatar',
    name: USER.name, personId: USER.personId, avatar: cfg }) })
    .then(r => r.json())
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
screen('arcade', () => pages('arcade', [
  `<div class="card">
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
  </div>`,

  `<div class="card">
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
  </div>`,

  `<div class="card">
    <h3>Flabby Pird</h3>
    <p class="sub">Harder than it looks.</p>
    <canvas id="flappy-canvas" class="flappy"></canvas>
    <p class="note" id="flappy-msg" style="text-align:center;margin:.4rem 0 0">Tap to play</p>
    <div class="row"><span class="k">Score</span><span class="v mono" id="flappy-score">0</span></div>
    <div class="row"><span class="k">Best</span><span class="v mono" id="flappy-best">0</span></div>
  </div>`,

  `<div class="card">
    <h3>One more thing</h3>
    <p class="sub">Something worth knowing. Tap for another.</p>
    <div id="feed-screen" class="feed" data-do="feed-tap"></div>
  </div>`,
]));

/* ---------- TOOLS -------------------------------------------------------------------------------
   Four things that are actually tools.

   THE IDS HERE ARE NOT A CHOICE. The calculator, the timer and the calendar were carried over
   whole from the old app, and they find their parts by id — `mc-display`, `cal-body`, `cal-label`.
   I first wrote this markup with the names I would have picked, and both simply did nothing: the
   calculator drew no keys and the calendar drew no month, silently, because a function that cannot
   find its element has nothing to say about it.

   So the markup matches the functions. The same mistake as writing `tools` for `tools-content` in
   the tab table, and the same fix: read what is there rather than write what seems right.
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

screen('tools', () => pages('tools', [
  `<div class="card">
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
  </div>`,

  `<div class="card">
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
  </div>`,

  `<div class="card">
    <h3>Docket</h3>
    <p class="sub">What there is to do. Tick it off as you go.</p>
    <div id="docket-body"></div>
    <div class="dock-new">
      <input id="dock-add" placeholder="Add a line…" autocomplete="off">
      <button class="btn quiet tiny" data-do="dock-add">＋</button>
    </div>
    <p class="faint" id="dock-said" style="margin:.35rem 0 0"></p>
  </div>`,

  `<div class="card">
    <h3>Notepad</h3>
    <textarea id="notepad" placeholder="Jot something down…"></textarea>
    <p class="faint" id="pad-said" style="margin:.35rem 0 0">Saves as you type.</p>
  </div>`,

  `<div class="card">
    <div class="cal-head">
      <span class="cal-arrow" data-do="cal-back">‹</span>
      <h3 id="cal-label" style="margin:0">Calendar</h3>
      <span class="cal-arrow" data-do="cal-fwd">›</span>
    </div>
    <div id="cal-body" class="cal"></div>
  </div>`,
]));

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
screen('book', () => {
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

  return (USER
      ? `<button class="btn" data-do="new-booking" style="margin-bottom:4px">Ask for a session</button>`
      : `<div class="card"><h3>Sign in to book</h3>
           <p class="sub">You need an account to ask for a session.</p>
           <button class="btn" data-do="signin">Sign in</button></div>`)
    + (mine.length ? '<h2>Yours</h2>' + mine.map(jobCard).join('') : '')
    + (open.length ? '<h2>Open</h2>' + open.map(jobCard).join('') : '')
    + (!jobs.length ? '<p class="empty">No sessions yet.</p>' : '');
}, () => USER ? '' : '<span class="act" data-do="signin">Sign in</span>');

on('soon', () => toast('Not moved across yet'));
on('signin', () => toast('Sign-in screen next'));
on('new-booking', () => toast('The booking builder is the next thing to build'));
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
        fetch(API, { method:'POST', body: JSON.stringify({ action:'saveScore', name: USER.name, score: S.score }) })
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
    const val = parseInt(input.value, 10);
    if (isNaN(val)) return;
    if (val === ttState.cur.a * ttState.cur.b) {
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
    fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify({ action: 'saveTtHighscore',
      name: USER.name, personId: USER.personId, score }) })
      .then(r => r.json())
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

/* Started when their screen appears, and only then — a canvas loop running behind a screen nobody
   is looking at is a flat battery for nothing. */
function wake(id) {
  try {
    if (id === 'arcade') { initChess?.(); initFlappy?.(); initFeed?.(); initTables?.(); }
    if (id === 'tools')  { initMiniCalc?.(); initTimer?.(); initCalendar?.();
                           initPad?.(); paintDocket?.(); }
  } catch (e) {
    /* One broken game must not take the screen with it — the other three on that screen are fine,
       and a blank tab is a worse answer than a game that does not start. */
    console.warn('[wake]', id, e);
  }
}

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
  dx: 0, dy: 0,
  axis: null,          // null until the finger commits: 'x' or 'y'
  live: false,
  page: null,          // the .page under the finger, on a paged screen
};

/* The scrolling page the finger is on, if any. A paged screen hands its gesture to the pager only
   when the page itself has nowhere left to scroll — which is the same hierarchy the horizontal
   swipe uses for a wide table, said vertically. */
function pageUnder(target) {
  if (!PAGER[AT]) return null;
  return target && target.closest ? target.closest('.page') : null;
}

/* Places a sideways drag means something else. Checked once at the start rather than on every
   move — the answer cannot change mid-gesture, and asking sixty times a second would be work for
   nothing. */
function swipeAllowed(target) {
  if (!$('sheet').classList.contains('hidden')) return false;   // the sheet is over everything
  const no = target.closest?.(
    'input, textarea, select, canvas, .chess, .mc-grid, [data-noswipe]');
  if (no) return false;
  /* Anything that scrolls sideways on its own — a wide table, a row of tiles. Taking its gesture
     would make it unscrollable, and it has no other way to be read. */
  let el = target;
  while (el && el !== document.body) {
    if (el.scrollWidth > el.clientWidth + 4) {
      const how = getComputedStyle(el).overflowX;
      if (how === 'auto' || how === 'scroll') return false;
    }
    el = el.parentElement;
  }
  return true;
}

addEventListener('touchstart', e => {
  if (e.touches.length !== 1) return;                 // a pinch is not a swipe
  const t = e.touches[0];
  SWIPE.x = t.clientX; SWIPE.y = t.clientY;
  SWIPE.dx = 0; SWIPE.dy = 0; SWIPE.axis = null;
  SWIPE.live = swipeAllowed(e.target);
  SWIPE.page = pageUnder(e.target);
}, { passive: true });

addEventListener('touchmove', e => {
  if (!SWIPE.live || e.touches.length !== 1) return;
  const t = e.touches[0];
  const dx = t.clientX - SWIPE.x, dy = t.clientY - SWIPE.y;

  /* THE DECISION, made once. Ten pixels is enough to tell a deliberate sideways drag from the
     wobble in a thumb starting a scroll — and 1.4× means an ambiguous diagonal is treated as a
     scroll, which is the safer of the two wrong answers. */
  if (!SWIPE.axis) {
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    SWIPE.axis = Math.abs(dx) > Math.abs(dy) * 1.4 ? 'x' : 'y';
  }

  /* --- UP AND DOWN, on a paged screen ----------------------------------------------------------
     The page keeps the gesture while it has anywhere to scroll to. Only at its very top (dragging
     down) or its very bottom (dragging up) does the pager take it — so a docket with twenty lines
     is read to the end and THEN hands over, and the calculator, which fits, pages on the first
     movement.
     Nobody has to be told this rule. It is what happens in every reader anybody has used, and the
     alternative is a thumb-flick that sometimes scrolls and sometimes changes screens. */
  if (SWIPE.axis === 'y') {
    const pg = SWIPE.page;
    if (!pg) return;                                   // not a paged screen: the page scrolls
    const atTop = pg.scrollTop <= 0;
    const atEnd = pg.scrollTop + pg.clientHeight >= pg.scrollHeight - 1;
    if ((dy > 0 && !atTop) || (dy < 0 && !atEnd)) return;

    const at = PAGE[AT] || 0;
    /* Resisted at the ends, exactly as the tab swipe is: the dial still turns, grudgingly, which
       says "nothing that way" better than refusing to move at all. */
    const end = (dy > 0 && at === 0) || (dy < 0 && at === pageCount(AT) - 1);
    e.preventDefault();
    SWIPE.dy = dy;
    /* ONE property, inherited by every page. Each page's transform already reads `--drag`, so the
       whole dial follows the finger without JavaScript touching five elements on every frame of a
       gesture — which is what makes it smooth on a phone. */
    const wrap = $('s-' + AT)?.querySelector('.pager');
    const strip = wrap?.querySelector('.pages');
    if (wrap && strip) {
      wrap.classList.add('no-anim');
      strip.style.setProperty('--drag', (end ? dy * 0.25 : dy) + 'px');
    }
    return;
  }

  e.preventDefault();                                  // ours now — stop the page moving
  SWIPE.dx = dx;

  /* The screen follows the finger. Without this a swipe is a guess: you drag, nothing happens, and
     either the tab changes or it does not. Movement is what tells somebody the gesture was heard.
     Resisted at the ends — the drag still moves, but grudgingly, which says "nothing that way"
     better than refusing to move at all. */
  const at = TABS.findIndex(x => x.id === AT);
  const end = (dx > 0 && at === 0) || (dx < 0 && at === TABS.length - 1);
  const shift = end ? dx * 0.25 : dx;
  const el = $('s-' + AT);
  if (el) { el.style.transform = `translateX(${shift}px)`; el.style.transition = 'none'; }
}, { passive: false });

addEventListener('touchend', () => {
  if (!SWIPE.live) return;
  const el = $('s-' + AT);
  const dx = SWIPE.dx, dy = SWIPE.dy, axis = SWIPE.axis;
  SWIPE.live = false; SWIPE.axis = null; SWIPE.dx = 0; SWIPE.dy = 0; SWIPE.page = null;

  if (axis === 'y') {
    $('s-' + AT)?.querySelector('.pager')?.classList.remove('no-anim');
    /* A SHORTER throw than the tab swipe. Sideways is a deliberate reach across the screen; up is
       a flick, and asking a quarter of the height for it makes the gesture feel heavy. */
    if (Math.abs(dy) >= Math.max(50, innerHeight * 0.12)) {
      goPage(AT, (PAGE[AT] || 0) + (dy < 0 ? 1 : -1));
    } else {
      paintPager(AT);            // not far enough: the dial turns back, and it should be seen to
    }
    return;
  }

  if (el) { el.style.transition = ''; el.style.transform = ''; }
  /* A quarter of the screen, or 70px on a small one. Proportional rather than fixed, so the
     gesture asks for the same fraction of a thumb's travel on every phone. */
  const enough = Math.max(70, innerWidth * 0.25);
  if (Math.abs(dx) < enough) return;

  const at = TABS.findIndex(x => x.id === AT);
  const to = dx < 0 ? at + 1 : at - 1;
  if (to < 0 || to >= TABS.length) return;
  go(TABS[to].id);
}, { passive: true });

/* ---------- THE SAME GESTURE ON A TRACKPAD -------------------------------------------------------
   Two fingers sideways on a laptop is a `wheel` event with a horizontal delta, not a touch — so
   none of the code above sees it.

   It differs from a swipe in one way that matters: a touch has a beginning and an end, and a wheel
   is a stream of small numbers that stops whenever it stops. So the movement is accumulated, and a
   short pause is what counts as letting go.
--------------------------------------------------------------------------------------------- */
let wheelAt = 0, wheelStop = null, wheelDone = false;
let wheelY = 0, wheelYStop = null, wheelYDone = false;

/* THE SAME GESTURE ON A TRACKPAD, vertically. Without it a desktop can reach the tabs and not the
   widgets — every page fits, so there is nothing to scroll and the wheel does nothing at all. */
addEventListener('wheel', e => {
  if (!PAGER[AT]) return;
  if (Math.abs(e.deltaY) < Math.abs(e.deltaX) * 1.4) return;   // sideways: that is the tab swipe
  if (!$('sheet').classList.contains('hidden')) return;
  const pg = e.target.closest?.('.page');
  if (!pg) return;
  const atTop = pg.scrollTop <= 0;
  const atEnd = pg.scrollTop + pg.clientHeight >= pg.scrollHeight - 1;
  if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atEnd)) return;

  wheelY += e.deltaY;
  /* Once per gesture. A trackpad keeps sending numbers after the fingers lift, and without this
     one flick would walk through every widget on the screen. */
  if (!wheelYDone && Math.abs(wheelY) > 90) {
    wheelYDone = true;
    goPage(AT, (PAGE[AT] || 0) + (wheelY > 0 ? 1 : -1));
  }
  clearTimeout(wheelYStop);
  wheelYStop = setTimeout(() => { wheelY = 0; wheelYDone = false; }, 140);
}, { passive: true });

addEventListener('wheel', e => {
  /* Mostly vertical: they are scrolling the page, and taking it would make the feed unreadable. */
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.4) return;
  if (!$('sheet').classList.contains('hidden')) return;
  /* Something that scrolls sideways on its own owns the gesture — a wide table, a row of tiles. */
  if (e.target.closest?.('input, textarea, select, canvas, .chess, .mc-grid, [data-noswipe]')) return;

  wheelAt += e.deltaX;

  /* Once per gesture. A trackpad keeps sending numbers after the fingers lift — momentum — and
     without this one flick would walk through four tabs. */
  if (!wheelDone && Math.abs(wheelAt) > 90) {
    wheelDone = true;
    const i = TABS.findIndex(x => x.id === AT);
    const to = wheelAt > 0 ? i + 1 : i - 1;
    if (to >= 0 && to < TABS.length) go(TABS[to].id);
  }

  /* A gap of 140ms means the fingers have stopped. Long enough to outlast the momentum, short
     enough that a second deliberate flick is a second gesture. */
  clearTimeout(wheelStop);
  wheelStop = setTimeout(() => { wheelAt = 0; wheelDone = false; }, 140);
}, { passive: true });

/* TURNING THE PHONE changes the height of every page at once, and a canvas measured in portrait
   is the wrong shape in landscape. Debounced, because a rotation fires this a dozen times and
   re-measuring a canvas mid-game is a game that resets under your thumb. */
let sizeTimer = null;
addEventListener('resize', () => {
  clearTimeout(sizeTimer);
  sizeTimer = setTimeout(() => {
    paintPager(AT, true);
    if (AT === 'arcade' && PAGER.arcade[PAGE.arcade] === 'Flabby Pird'
        && !(flappyState && flappyState.running)) initFlappy();
  }, 220);
});

/* A finger interrupted — a call arriving, the app going to the background. Put the screen back,
   or it stays shifted sideways for ever. */
addEventListener('touchcancel', () => {
  const el = $('s-' + AT);
  if (el) { el.style.transition = ''; el.style.transform = ''; }
  SWIPE.live = false; SWIPE.axis = null; SWIPE.dx = 0; SWIPE.dy = 0; SWIPE.page = null;
  $('s-' + AT)?.querySelector('.pager')?.classList.remove('no-anim');
  paintPager(AT);          // a half-turned dial must not stay half-turned
}, { passive: true });
