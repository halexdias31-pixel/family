/* ==================================================================================================
   @family. — price-rows.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   price-rows.js is number 2 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */



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
  /* The table is read by `subjectMult` in core.js, which `priceFrom` also uses — so the number on
     this card and the number in the price are the same number by construction rather than by two
     pieces of code happening to agree. */
  return (DATA.dropdowns?.subjects || []).map(name => {
    const tutors = (DATA.tutors || []).filter(t =>
      (t.teaches || []).some(x => norm(String(x).replace(/\s*\([^)]*\)/, '')) === norm(name)));
    const levels = uniq(tutors.flatMap(t => (t.teaches || [])
      .filter(x => norm(String(x).replace(/\s*\([^)]*\)/, '')) === norm(name))
      .map(x => (String(x).match(/\(([^)]+)\)/) || [, ''])[1])));
    /* The same word a tutor or a venue uses. One vocabulary across all three, so "sporty" filters
       them together rather than meaning something slightly different in each place. */
    const focus = ((DATA.dropdowns || {}).focus || {}).subject || {};
    return { name, mult: subjectMult(name), tutors, levels,
             focus: focus[name] || '', rowIndex: null, type: 'subject' };
  });
}


/**
 * HOW MANY PASSES THIS PERSON HAS DONE.
 *
 * COUNTED FROM THE RESOURCES, because that is where a tick is written. This added up
 * `USER.tick1..3` — three fields on the person's own row — and `toggleTopicTick` has never
 * written to them: it puts your handle into `ticks_1..3` on the RESOURCE. So a student could work
 * through the whole library and this returned 0 for ever, which reads as "you have done nothing"
 * rather than as a fault, and put the thousand-tick reward permanently out of reach.
 *
 * The backend already sends the right number as `ticks` on the login reply. It is used only as
 * the fallback: the local count is LIVE — it moves the moment a box is ticked, where the login
 * figure is as old as the last sign-in.
 */
function tickCount() {
  if (!USER) return 0;
  try {
    const topics = allTopics();
    if (topics.length) {
      return topics.reduce((n, t) => n + myTicks(t).filter(Boolean).length, 0);
    }
  } catch (e) { /* the payload has not arrived yet — fall through to what the login said */ }
  return Number(USER.ticks) || 0;
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