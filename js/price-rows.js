/* @family. — price-rows.js ONE FILE, SPLIT. § */



/* ---------- THE PRICE BREAKDOWN, AS DATA § */
const PRICE_ROWS = [
  // --- the shape of the booking: these multiply the finished total ---
  /* The 'Hours a week' row lived here. The When row reports the same number beside the grid that
     decides it, and two rows for one fact is the duplication this card has been shedding all along. */

  { key: 'term',   label: 'Time interval', kind: 'total-mult', group: 'shape',
    control: 'l-interval',
    value: L => L.interval || (L.weeksBooked ? L.weeksBooked + ' weeks' : ''),
    // Weeks, matching what it actually multiplies by. It reported the DATE count while the price
    // used weeks — the row and the arithmetic disagreed by a factor of the days ticked.
    /* Weeks are known as soon as an interval is chosen — they come from its own dates. § */
    scale: L => L.weeksBooked || L.weeksLeft || 0,
    /* Until days are ticked, the interval only says how many WEEKS are left — not how many sessions, because a client may book one day a week or three. § */
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

  /* THE ORDER MATTERS. Each of these multiplies what the ones above it have already produced, so its `of` is the running total at its own point in the chain — not § */
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
    /* Says WHERE the fraction came from, for an admin. § */
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
    /* The count comes from the addresses. § */
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
  /* The bulk and booked-ahead rows lived here. § */
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
  /* Every money row reports the same thing: § */
  const isRateRow = ['base','subject','complexity','level','students','venue','host'].includes(row.key);
  const running = () => {
    if (isRateRow || known) return { total: money(runningAfter(row.key, L)) };
    /* Nothing to total yet — say WHY, on the row that's waiting for it. § */
    const why = !L.hoursPerWeek ? 'tick some hours'
              : !L.weeksBooked  ? 'pick a time interval'
              : '';
    return { total: (row.key === 'hoursweek' && why) ? `<span class="note">${why}</span>` : '—' };
  };

  /* --- a multiplier on the finished total: length, term, split, bulk, advance --------------- */
  if (row.kind === 'total-mult') {
    const f = row.scale(L);
    /* A scale of 0 means the question hasn't been answered — no length chosen, no interval — and it rendered as 'x 0 hrs, −100%', which describes a total discount § */
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
    /* The multiplier AND the percentage. § */
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


/* ---------- WHAT A TUTOR WROTE IN `teaches`, READ ONCE § */
const subjectIn_ = s => String(s || '').replace(/\s*\([^)]*\)/, '').trim();
const levelIn_   = s => (String(s || '').match(/\(([^)]+)\)/) || [, ''])[1].trim();


function subjectRows() {
  /* The table is read by `subjectMult` in core.js, which `priceFrom` also uses — so the number on
     this card and the number in the price are the same number by construction rather than by two
     pieces of code happening to agree. */
  return (DATA.dropdowns?.subjects || []).map(name => {
    const tutors = (DATA.tutors || []).filter(t =>
      (t.teaches || []).some(x => norm(subjectIn_(x)) === norm(name)));
    const levels = uniq(tutors.flatMap(t => (t.teaches || [])
      .filter(x => norm(subjectIn_(x)) === norm(name))
      .map(x => levelIn_(x))));
    /* The same word a tutor or a venue uses. One vocabulary across all three, so "sporty" filters
       them together rather than meaning something slightly different in each place. */
    const focus = ((DATA.dropdowns || {}).focus || {}).subject || {};
    return { name, mult: subjectMult(name), tutors, levels,
             focus: focus[name] || '', rowIndex: null, type: 'subject' };
  });
}


/* A LEVEL, AS A THING RATHER THAN AS A SIDE EFFECT. § */
function levelRows() {
  const listed = (DATA.dropdowns || {}).levels || [];
  const priced = Object.keys((DATA.multipliers || {}).levels || {});
  const taught = uniq((DATA.tutors || []).flatMap(t =>
    (t.teaches || []).map(x => levelIn_(x))));

  /* THE DROPDOWN FIRST, in its own order — that is the order the sheet chose and the order the booking form asks in, and a list of levels that runs GCSE, A-Level § */
  const names = uniq([...listed, ...taught, ...priced].filter(Boolean));

  return names.map(name => {
    const tutors = (DATA.tutors || []).filter(t =>
      (t.teaches || []).some(x => norm(levelIn_(x)) === norm(name)));
    /* WHICH SUBJECTS RUN AT THIS LEVEL — the mirror of the `levels` line on a subject card, and
       the fact somebody choosing a level actually wants. */
    const subjects = uniq(tutors.flatMap(t => (t.teaches || [])
      .filter(x => norm(levelIn_(x)) === norm(name))
      .map(x => subjectIn_(x))));
    const focus = ((DATA.dropdowns || {}).focus || {}).level || {};
    return {
      name,
      mult: levelMult(name),
      /* Not the same question as `mult === 1`. See `levelPriced` in core.js. */
      priced: levelPriced(name),
      /* WHETHER THE BOOKING FORM OFFERS IT. A level that is taught and priced but missing from the
         options tab cannot be booked at all, which is the one failure of the three that a client
         would never see and never report. */
      listed: listed.some(l => norm(l) === norm(name)),
      tutors, subjects,
      focus: focus[name] || '', rowIndex: null, type: 'level',
    };
  });
}


/* ---------- `tickCount` WAS HERE § */


/* `setOptions` was here — filling a <select> from a list, for a form built before the field
   renderers existed. Every form uses those now. */



const START = 'rnbqkbnrpppppppp________________________________PPPPPPPPRNBQKBNR'.split('');

const CH_WHITE = 'w', CH_BLACK = 'b';
const isWhite = p => p !== '_' && p === p.toUpperCase();
const colourOf = p => p === '_' ? null : (isWhite(p) ? CH_WHITE : CH_BLACK);

/* A position is the board plus the four things you cannot see on it: § */
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