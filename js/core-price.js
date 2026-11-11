/* The config readers priceFrom's helpers share: a constant by any of its names, and a surcharge lookup. */
function priceKnobs_() {
  const m = DATA.multipliers || {};
  const v = (DATA.constants || {}).vars || {};
  const cv  = (...keys) => { for (const key of keys) { const x = num(v[key]); if (!isNaN(x)) return x; } return 0; };
  const cvD = (key, dflt, ...alts) => { for (const key2 of [key, ...alts]) { const x = num(v[key2]); if (!isNaN(x)) return x; } return dflt; };
  /* A SURCHARGE IS A MULTIPLIER, so the neutral value is 1. § */
  /* LEVELS GO THROUGH `levelMult`, which is this same rule lifted out so the subject cards and the level cards can ask the question too. § */
  const sur = (group, value) => {
    if (group === 'levels') return levelMult(value);
    const x = num((m[group] || {})[value]);
    return (isNaN(x) || x <= 0) ? 1 : x;
  };
  return { cv, cvD, sur };
}

/* The booking as asked for, every field defaulted, so an empty spec still prices. */
function priceSpec_(spec) {
  const endDate = spec.endDate || '';
  return {
    subjects: spec.subjects || [],
    n: Math.max(1, parseInt(spec.n) || 1),
    weeks: parseFloat(spec.weeks) || 1,
    interval: spec.interval || '',
    endDate,
    startDate: spec.startDate || '',
    lastSun: spec.lastSun || endDate,
    loc: spec.loc || '',
    day: spec.day || '',
    time: spec.time || '',
    level: spec.level || '',
    tutor: spec.tutor || '',
    splitOthers: parseInt(spec.splitOthers) || 0,
    i: spec.i,
    hosting: spec.hosting,
  };
}

/* The room rent, the rate charged, and every per-hour multiplier and config rate. */
function priceRates_(spec, q, knobs) {
  const { cv, cvD, sur } = knobs;
  const venue = (DATA.venues || []).find(x => norm(x.title) === norm(q.loc));
  // "I'll host the venue" — the client provides the space (or it's their home), so they don't
  // pay venue rent. Auto-on and locked for a home venue. When hosting, the V term drops to 0.
  // A room's own rate wins over the building's — a small room and a large one at Richmond are
  // different prices, and the venue's single figure could only ever be right for one of them.
  const space = spaceFor(q.loc);
  const venueRate = space ? space.rate : (venue ? (parseFloat(venue.bestRate) || 0) : 0);
  const V = q.hosting ? 0 : venueRate;

  /* THE PRICING FORMULA ================== P = § */

  /* THE PER-HOUR MULTIPLIERS. § */
  // What the tutor is paid per hour. Each tutor row carries its own `constant`; the row named
  // "No preference" holds the default, so switching the default is a sheet edit, not a code
  // change. Only if no tutor (and no such row) resolves do we fall back to the M variable.
  /* WHAT THE CLIENT PAYS PER HOUR, before any multiplier. § */
  // Two ways to book, two rates:
  //   a named tutor  -> that tutor's own rate_per_hour
  //   No preference  -> the `open_rate` in config
  // open_rate falls back to the HIGHEST rate any tutor charges, because whoever ends up taking an
  // open job has to be covered by the price already agreed. Set it below the dearest tutor and the
  // difference comes out of your margin every time they're the one who applies.
  /* `spec.tutorRow`: a row not yet saved — the Staff hub's pricing (405) asks this same sum of the figures being typed. */
  const tutorRow = spec.tutorRow || (q.tutor ? (DATA.tutors || []).find(t => norm(t.title) === norm(q.tutor)) : null);
  const tutorRate = Number(tutorRow && tutorRow.rate) || 0;
  // Named tutor: their own charge-out rate. No preference: the open rate, which is fixed because a
  // job nobody has claimed can't be priced on the rate of a tutor who hasn't taken it yet.
  const chargeRate = tutorRate > 0 ? tutorRate : OPEN_RATE;
  const usingTutorRate = tutorRate > 0;
  const M = tutorRate || cv('M', 'minimum wage', 'min wage', 'μ', 'mu');   // tutor's £/hr
  const wMul = cvD('w', 1, 'wage multiplier', 'W', 'λ', 'lambda');  // wage multiplier (default 1)
  const L = sur('levels', q.level);   // level multiplier: 1.1 is "10% more", whoever teaches it
  /* With several days and times in one booking, the DEAREST applies. Averaging would let a cheap
     Monday offset a Sunday, so a booking that includes the expensive slot would cost less than one
     that is only the expensive slot. */
  const worstOf = (group, csv) => String(csv || '').split(',').map(x => x.trim()).filter(Boolean)
    /* Starts at 1 rather than 0 now that `sur` is neutral there — the `|| 1` on the end was the patch that hid this fault for days and times, and a patch that is no § */
    .reduce((hi, one) => Math.max(hi, sur(group, one)), 1);
  const D = worstOf('days',  q.day);
  const T = worstOf('times', q.time);

  // Subjects: the AVERAGE of the chosen subjects' multipliers — so a pricey subject among three
  // exerts only a third of its pull. (Σ Sᵢ)/k, written out.
  const subjAdds = q.subjects.map(subjectMult);
  const k = Math.max(1, subjAdds.length);                       // k = subject count
  // The mean of the chosen subjects' multipliers: Maths at 1.0 and Physics at 1.2 gives 1.1, so a
  // dear subject among three carries a third of its weight. No subjects chosen means no effect.
  const avgSubject = subjAdds.length ? subjAdds.reduce((x, y) => x + y, 0) / k : 1;

  // --- Rates (0 switches the effect off) ---
  const s = cv('s', 'subject count rate', 'subject_count_rate');  // 1 + s(k−1)
  const c = cv('c', 'extra child rate', 'extra_child_rate');      // tutor's share of each extra child
  const B = cv('B', 'boss rate', 'boss_rate');                    // the DEFAULT cut, for a tutor whose own is blank
  const b = cv('b', 'bulk discount rate', 'bulk_discount_rate');  // 1 − b(W−1)
  const a = cv('a', 'advance booking rate', 'early booking rate');// 1 − a(A−1)

  /* No fallback. An unchosen length is 0, not the configured default — a default here put 'x 2 hrs' on the card beside a control still reading '———', which is the § */
  const h = num(spec.hours) > 0 ? num(spec.hours) : 0;
  return { venueRate, V, tutorRow, chargeRate, usingTutorRate, M, wMul, L, D, T, k, avgSubject, s, c, B, b, a, h };
}

/* The real session dates across every run and term window, and the counts billed from them. */
function priceDates_(spec, q) {
  /* The ACTUAL sessions that will run, across EVERY run in the booking. § */
  const runList = spec.runs && spec.runs.length ? spec.runs
    : String(q.day || '').split(',').map(x => x.trim()).filter(Boolean).map(d => ({ dayName: d }));
  const DAY_FROM_PREFIX = { m:'Monday', tu:'Tuesday', w:'Wednesday', th:'Thursday',
                            f:'Friday', sa:'Saturday', su:'Sunday' };
  /* One date per DAY, not per run. § */
  const bookedDays = [...new Set(runList
    .map(r => r.dayName || DAY_FROM_PREFIX[r.day] || '')
    .filter(Boolean))];
  /* ---------- ONE WINDOW PER TERM, NOT ONE ACROSS ALL OF THEM § */
  const windows = (spec.windows && spec.windows.length) ? spec.windows
                                                        : [{ startDate: q.startDate, lastSun: q.lastSun }];
  const seenDay = {};
  const sessionDates = bookedDays
    .map(d => windows
      .map(w => computeSessionDates(d, w.lastSun || w.endDate, w.startDate))
      .reduce((all, list) => all.concat(list), []))
    .reduce((all, list) => all.concat(list), [])
    .filter(dt => { const k = dt.getTime(); if (seenDay[k]) return false; seenDay[k] = 1; return true; })
    .sort((a, b) => a - b);
  // A live job already knows how many sessions it runs; only a fresh booking derives them
  // from the term window. spec.slots lets a job card price itself without a term dropdown.
  /* Sessions come from the actual dates. § */
  const slots = spec.slots || sessionDates.length || 0;
  const weeksLeft = q.interval ? (parseFloat(spec.weeks) || 0) : 0;
  const W = slots;                             // bill by real sessions, not raw week count
  const firstDate = sessionDates[0] || null;
  const A = firstDate ? Math.max(0, Math.floor((firstDate - new Date()) / (7 * 864e5))) : 0;
  return { runList, bookedDays, sessionDates, slots, weeksLeft, W, firstDate, A };
}

/* Each extra seat's fraction (the tutor's own or config's) and the cut, named by where each came from. */
function priceSeats_(tutorRow, c, B, n) {
  /* The tutor's own extra-seat fraction when they've set one, the config default otherwise. § */
  /* A per-seat share is a FRACTION of the rate: § */
  const { cRaw, bRaw, cutOwn, cUsed, bUsed } = seatShare_(tutorRow, c, B);
  // Which one won, for the admin view. A silent fallback and a read value look the same on a card.
  // The cut is named by where it came from too: the tutor's own, or the config default.
  const ignored = [];
  if (cRaw > 2) ignored.push(`c ${cRaw}`);
  if (bRaw > 2 || bRaw < 0) ignored.push(cutOwn ? `their cut ${bRaw}` : `B ${bRaw}`);
  const seatSource = ignored.length
    ? `ignoring ${ignored.join(' and ')} — not fractions`
    : ((tutorRow && Number(tutorRow.extraSeat) > 0) ? `tutor ${cUsed}` : `config ${cUsed}`)
      + (cutOwn ? ` + their cut ${bUsed}` : ` + B ${bUsed}`);
  const fSeats     = 1 + (cUsed + bUsed) * (n - 1);
  return { cUsed, bUsed, seatSource, fSeats };
}

function priceFrom(spec) {
  spec = spec || {};
  const knobs = priceKnobs_();
  const q = priceSpec_(spec);
  const { subjects, n, weeks, interval, endDate, startDate, lastSun, loc, day, time, level, tutor, splitOthers, i, hosting } = q;
  const { venueRate, V, tutorRow, chargeRate, usingTutorRate, M, wMul, L, D, T, k, avgSubject, s, c, B, b, a, h } = priceRates_(spec, q, knobs);
  const { runList, bookedDays, sessionDates, slots, weeksLeft, W, firstDate, A } = priceDates_(spec, q);

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
  const { cUsed, bUsed, seatSource, fSeats } = priceSeats_(tutorRow, c, B, n);
  /* Both discounts count units BEYOND the first: § */
  /* Three discounts, all counting units BEYOND the first, all clamped at zero — a discount that goes negative becomes a surcharge, which is how booking for this § */
  /* Both neutral. The coefficients are still read from config so nothing downstream breaks, but
     they don't move the price while there's no row on the card to say they did. */
  const fBulk      = 1;
  const fAdvance   = 1;
  /* A block discount — cheaper per hour for a longer unbroken session — was asked for and isn't here, deliberately. § */
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
  const { weeksBooked, hoursTotal, splitShares, chargePerHour, tutorPay, profitTotal, venueTotal,
          cost, tutorHourly, belowMinWage, mo, total, wholeTotal, shareAmount } = priceMoney_(spec, knobs,
    { R, fSeats, discountFactor, promoAdj, V, splitOthers, bookedDays, sessionDates, slots,
      chargeRate, avgSubject, L, D, T, fSubjects, cUsed, bUsed, M,
      rows: { chargeRate, avgSubject, fSubjectCount: fSubjects, L, D, T, fChildrenAll: fSeats, n } });
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
    // THE MONEY BLOCK'S FIGURES, whole-booking — see `bookMoney_`. Only an admin's screen draws them.
    earn: mo,
    summary: { service: (typeof document !== 'undefined' ? val('c-service') : ''), level,
               subject: subjects.join(', '), location: loc, day, time, students: n,
               interval, weeks, requestedTutor: tutor }
  };
}

/* Hours booked, the per-hour charge, and who is paid what — the shares add up to what the client pays. */
function priceMoney_(spec, knobs, p) {
  const { R, fSeats, discountFactor, promoAdj, V, splitOthers, bookedDays, sessionDates, slots,
          chargeRate, avgSubject, L, D, T, fSubjects, cUsed, bUsed, M } = p;
  /* Hours a week, times weeks. Simpler and truer than sessions x session-length: a booking with
     Monday 1-3 and Tuesday 10-11 has two sessions of different lengths, which the old pair of
     numbers could not express at all. */
  /* Weeks the booking runs for. Sessions divided by runs-per-week — a Monday-and-Tuesday booking
     over 11 weeks has 22 sessions but runs for 11 weeks, and hours-a-week must multiply the
     second, not the first. */
  // Days a week, not blocks a week — for the same reason the dates are per day.
  const runsPerWeek = Math.max(1, bookedDays.length || 1);
  /* ---------- BILLED BY THE SESSIONS THAT EXIST, NOT THE WEEKS THAT REMAIN § */
  const weeksBooked = sessionDates.length
    ? Math.max(1, Math.round(sessionDates.length / runsPerWeek))
    : (slots ? Math.round(slots / runsPerWeek) : 0);
  const hoursTotal = (num(spec.hoursPerWeek) || 0) * weeksBooked;
  /* The per-hour figure is real as soon as a rate is known — it does not need a length or a term. § */
  /* SPLITTING DIVIDES BOTH FIGURES. § */
  const splitShares = splitOthers + 1;
  /* THE HOURLY RATE THE ROWS SHOW, penny-rounded line by line (`runningAfter`), so gross = rows × hours exactly. */
  const rate = pence_(runningAfter('students', p.rows) * discountFactor * promoAdj);
  const chargePerHour = (rate + V) / splitShares;
  const teachTotal = hoursTotal ? chargePerHour * hoursTotal : null;

  // The three shares. They must add up to exactly what the client pays, so each is derived from
  // the same numbers rather than computed independently:
  //   the tutor is paid their own rate plus every teaching surcharge
  //   your margin is the markup M(w−1)
  //   the extra-seat money is split between you by the ratio of c to B
  /* TUTOR = THEIR OWN RATE FOR THE FIRST SEAT + THEIR EXTRA-SEAT RATE FOR EACH OTHER, × HOURS (owner, 8 Nov); @family. keeps the rest of the teaching. */
  const r = pence_(runningAfter('daytime', p.rows) * discountFactor * promoAdj);
  const tutorHour = pence_(r + r * cUsed * Math.max(0, (p.rows.n || 1) - 1));
  const tutorPay    = Math.min(tutorHour, rate) * hoursTotal;
  const profitTotal = rate * hoursTotal - tutorPay;
  const venueTotal  = V * hoursTotal;                                   // venue gets
  const cost        = tutorPay + venueTotal;                            // what the job costs us

  // The tutor's effective £/hour — surfaced so you can SEE if discounts push it under minimum
  // wage (the formula doesn't silently clamp it; this just makes the number visible).
  const tutorHourly = hoursTotal ? tutorPay / hoursTotal : 0;
  const belowMinWage = M > 0 && tutorHourly > 0 && tutorHourly < M;

  // The whole booking, before it's divided — what the tutor and the venue are actually paid,
  // which is a different question from what one family hands over.
  /* ---------- WHAT THE BOOKING EARNS, AFTER EVERYTHING IT COSTS (docs/history/353) § */
  const mo = bookMoney_({
    hours: hoursTotal,
    tutorPay, profit: profitTotal, venue: venueTotal,
    discount: spec.discount || null,
    feePct: knobs.cvD('card_fee_pct', 0), feeFixed: knobs.cvD('card_fee_fixed', 0),
  });
  /* THE TOTAL IS THE CHARGED FIGURE NOW, still per family. § */
  const total = teachTotal === null ? null : mo.charged / splitShares;
  const wholeTotal = total === null ? null : mo.charged;
  return { weeksBooked, hoursTotal, splitShares, chargePerHour, tutorPay, profitTotal, venueTotal,
           cost, tutorHourly, belowMinWage, mo, total, wholeTotal, shareAmount: total };
}