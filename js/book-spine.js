/* THE SPINE — ONE ROW LIST, TWO DOCUMENTS. § */
/* ---------- THE FORM IS THE ARCHETYPE, SO THE FORM IS WHERE THIS COMES FROM § */
/* ---------- FOUR LABELS WERE TOO LONG FOR THEIR OWN COLUMN § */
/* ---------- `only` — WHICH DOCUMENT CAN EVER FILL THIS ROW § */
/* WHERE A BOOKING HAS GOT TO, AS FOUR TICKS RATHER THAN ONE SENTENCE. § */
/* ---------- AND EVERY TICK CARRIES THE DAY IT HAPPENED § */
const JOB_STAGES = [
  /* THE ROW EXISTS, SO IT WAS ASKED FOR. § */
  { row: 'Requested', is: j => true,
    when: j => S_(j.createdAt) || evAt_(j, 'Request', 1) },
  /* ---------- PUT TO A TUTOR, WHICH FOR MOST BOOKINGS IS THE SAME MOMENT AS THE ASKING § */
  { row: 'Applied for', is: j => true,
    when: j => evAt_(j, 'Apply', 1) || S_(j.createdAt) || evAt_(j, 'Request', 1) },
  /* THE BUSINESS HAS SAID YES. § */
  { row: 'Accepted',  is: j => jobAccepted_(j),
    when: j => evAt_(j, 'Accept', -1) },
  /* MONEY HAS MOVED. A seat at `Booked` is the machine's own record of a payment — `jobStage_` reads the same seats to decide which of the four documents this is § */
  { row: 'Paid',      is: j => jobStage_(j) === 'receipt',
    when: j => evAt_(j, 'Confirm', paidNeeds_(j)) },
];

/* THE nTH EVENT OF A KIND, AND `-1` IS THE LAST. § */
function evAt_(j, action, n) {
  const all = (j && j.events || []).filter(e => norm(e && e.action) === norm(action));
  if (!all.length) return '';
  const e = n === -1 ? all[all.length - 1] : all[n - 1];
  return e ? S_(e.at) : '';
}

/* HOW MANY BOOKED SEATS `jobStage_` IS WAITING FOR — one on a session, the whole house on a waiting list. § */
function paidNeeds_(j) {
  return norm(j && j.kind) === 'waitlist' ? seatsOf_(j) : 1;
}

/* ONE BUILDER, BOTH DOCUMENTS — which is the whole of what stops them drifting, the same argument `weekRows_` makes for the three week grids. § */
function stageRows_(j) {
  let on = true;
  return JOB_STAGES.map(st => {
    /* THE CHAIN. Once one is unticked, nothing below it can be — see the note above. `on` carries
       that down the list rather than each test repeating the ones before it. */
    on = on && !!j && !!st.is(j);
    /* ---------- ONE DATE FORMAT FOR THE FOUR, DECIDED HERE AND NOT IN FIVE PLACES § */
    const at = on && st.when ? st.when(j) : '';
    return { n: '', k: st.row, v: (at && date_(at)) || '',
             mul: '', rate: '', total: '', free: true, tick: on };
  });
}

const SPINE_EXTRA = [
  { after: 'Subject', row: 'Extra subj.' },
  /* THE ROOM UNDER ITS VENUE (owner, 7 Nov), on the form and the booking alike. */
  { after: 'Venue',   row: 'Room' },
  { after: 'When',    row: 'Per session', only: 'wait' },
  /* ---------- THE TALLY OF EVERYBODY'S ANSWER TO `When free`, UNDER THAT QUESTION § */
  { after: 'When free', row: 'Can come',  only: 'receipt' },
  /* ---------- PINNED TO THE FOOT RATHER THAN TO WHICHEVER QUESTION IS LAST § */
  { after: '',        row: 'About',     only: 'wait' },
  { after: 'When',    row: 'Dates' },
  { after: '',        row: 'Note' },
  /* THE TWO WAITING-LIST ROWS. § */
  { after: '',        row: 'A seat',    only: 'wait' },
  /* `Shared by` IS THE WAITING LIST'S SEAT COUNT; a session has no split since 12 Nov (owner). */
  { after: '',        row: 'Shared by', only: 'wait' },
  /* LAST, ALWAYS. Where a booking has got to is the closing of the document, after everything it is about — which is where a receipt puts it and where the form now § */
  ...JOB_STAGES.map(st => ({ after: '', row: st.row, tick: true })),
  /* NO `Status` (owner, 29 Oct: "What is status for? … all those bits above status … tell you the status"): the four ticks are it. */
];

const SPINE = (() => {
  const out = [];
  const tail = SPINE_EXTRA.filter(x => !x.after).map(x => x.row);
  BOOK_STEPS.forEach(st => {
    if (!st.short) return;
    /* ---------- A WEEK STEP IS SEVEN ROWS AND THEY ARE THE SAME SEVEN ON BOTH BRANCHES § */
    /* THE WEEK'S ROWS UNDER THEIR DRAWN NAME (`day_`, Mon…Sun): under the full name they missed the spine and fell below the ticks. */
    if (st.week) SLOT_DAYS.forEach(([, label]) => {
      if (out.indexOf(day_(label)) === -1) out.push(day_(label));
    });
    else out.push(st.short);
    SPINE_EXTRA.forEach(x => { if (x.after === st.short) out.push(x.row); });
  });
  /* AN EXTRA PINNED TO A STEP THAT NO LONGER EXISTS would vanish silently, which is the same class
     of fault as everything else tonight. Anything unplaced goes on the end, where it is visible,
     and `check-spine.js` reports it. */
  SPINE_EXTRA.forEach(x => {
    if (x.after && out.indexOf(x.row) === -1) out.push(x.row);
  });
  return out.concat(tail);
})();


/* One row name to the one document that can fill it, read off the two lists that declare rows so there is no third one to keep in step. § */
/* WHICH DOCUMENTS A FLAG NAMES, READ THE SAME WAY BY BOTH READERS. § */
function onlyHas_(only, on) {
  if (!only || !on) return true;
  const want = String(only).split(',').map(x => x.trim()).filter(Boolean);
  return String(on).split(',').map(x => x.trim()).some(o => want.indexOf(o) !== -1);
}

const ONLY_ON = (() => {
  const m = {};
  SPINE_EXTRA.forEach(x => { if (x.only) m[x.row] = x.only; });
  BOOK_STEPS.forEach(st => { if (st.only && st.short) m[st.short] = st.only; });
  return m;
})();

/* ---------- AND WHICH SPINE ROWS ARE A TICK RATHER THAN A VALUE § */
const TICK_ROW = (() => {
  const m = {};
  SPINE_EXTRA.forEach(x => { if (x.tick) m[x.row] = true; });
  return m;
})();

/* ---------- PUT ROWS IN SPINE ORDER, AND FILL WHAT IS MISSING § */
/* ---------- AND ONE OF THE TWO DOCUMENTS DOES NOT WANT THE DASHES § */
function spineRows_(rows, opts) {
  const say = {};
  const extra = [];
  rows.forEach(r => {
    /* EVERY ROW IS PUSHED UNDER ITS SPINE NAME (a price row's `row`, the step's `short`): no translation table (check-spine). */
    const k = r.k;
    if (!k) { extra.push(r); return; }
    if (SPINE.indexOf(k) === -1) { extra.push(r); return; }
    if (!say[k]) say[k] = Object.assign({}, r, { k: k });
  });
  const fill = !opts || opts.fill !== false;
  /* WHICH DOCUMENT IS ASKING. § */
  const on = (opts && opts.on) || '';
  /* ---------- AND A ROW WHOSE FIGURES WENT ONTO A QUESTION IS NOT A ROW TO INVENT § */
  const gone = (opts && opts.said) || {};
  const out = SPINE.map(k => (say[k] || (fill && !gone[k]
    && onlyHas_(ONLY_ON[k], on) ? {
    /* `blank` MARKS A ROW THE SPINE ADDED because neither document had one — it holds its place in the sequence and takes half the height of a row with something in § */
    n: '', k: k, v: TICK_ROW[k] ? '' : dash_(), mul: '', rate: '', total: '', free: true,
    faint: !TICK_ROW[k], blank: !TICK_ROW[k], tick: TICK_ROW[k] ? false : undefined,
  } : null))).filter(Boolean);
  return out.concat(extra);
}

/* THE DAYS THE WEEK ROW LEFT OUT, by label, so the spine does not invent them; none when no week was drawn. */
function weekLeft_(steps) {
  const weekDrew = steps.filter(r => r.strip).map(r => r.k);
  const weekLeft = {};
  if (weekDrew.length) SLOT_DAYS.forEach(([, label]) => { if (weekDrew.indexOf(day_(label)) === -1) weekLeft[day_(label)] = true; });
  return weekLeft;
}

/* THE FORM'S ROWS IN SPINE ORDER: the questions, their priced figures merged on, the room, the note. */
function formRows_(L) {
  /* `L` IS NULL UNTIL ENOUGH IS ANSWERED TO COST IT — no subjects, or no venue on a shared class. § */

  /* ---------- ONE LIST, AND IT IS THE FORM § */
  const steps = stepRows_();
  /* A CHILD'S FORM HAS THE QUESTIONS AND NO FIGURES (398) — no priced rows, no figure columns, no total. */
  const kid = childView_();
  const priced = L && !kid ? breakdownRows(L) : [];

  /* ---------- WHICH PRICED LINES BELONG TO A QUESTION § */
  /* ONE RULE, ASKED TWICE. § */
  /* ---------- THE BASE LINE MERGES ONTO THE TUTOR ROW LIKE EVERY OTHER PRICED LINE § */
  const ownRow = r => true;

  /* ---------- THE BASE LINE SAID THE TUTOR'S NAME, AND SO DID THE TUTOR ROW § */
  /* THE FIGURES, NOT THE NAME. Merged onto the Tutor row, whose value is already the tutor. */
  priced.forEach(r => { if (r.key === 'base') r.v = ''; });

  const byStep = {};
  priced.forEach(r => {
    if (!ownRow(r)) return;
    if (r.step && !byStep[r.step]) byStep[r.step] = r;
  });
  /* WHICH PRICED ROWS WERE CONSUMED BY A QUESTION, under the name the spine knows them by — so
     `spineRows_` does not invent a blank for a row whose figures are already on the card. */
  const merged = {};
  steps.forEach(r => {
    const p = byStep[r.id];
    if (!p) return;
    /* A ROW'S OWN FIGURE STAYS when its priced line has none: the week's `× 4` was wiped by its day lines' blank (525). */
    r.mul = S_(p.mul) ? p.mul : (r.mul || ''); r.rate = p.rate; r.total = S_(p.total) ? p.total : (r.total || '');
    p.used = true;
    if (p.k) merged[p.k] = true;
  });

  /* WHAT THE QUESTIONS ALREADY SAY, both by name and by which step they stand for. § */
  const said = {};
  const mine = {};
  steps.forEach(r => { said[norm(r.k)] = true; mine[r.id] = true; });

  /* ---------- A CONSEQUENCE SITS UNDER THE ANSWER THAT CAUSED IT § */
  const AFTER = { complexity: 'subjects' };

  const leftover = priced.filter(r =>
    !r.used && !said[norm(r.k)] && !(ownRow(r) && mine[r.step]));

  const placed = {};
  const body = [];
  steps.forEach(r => {
    body.push(r);
    /* THE ROOM IS OURS TO SET (owner, 7 Nov), so the unpriced form says so under Venue as the priced one does. */
    if (r.id === 'loc' && !priced.some(p => p.k === 'Room')) body.push({ n: '', k: 'Room', v: 'set by us', mul: '', rate: '', total: '', step: '', free: true });
    leftover.forEach(p => {
      if (placed[p.key] || AFTER[p.key] !== r.id) return;
      placed[p.key] = true;
      body.push(p);
    });
  });

  /* THE SPINE APPLIED AS THE LIST IS BUILT, not to a `const` afterwards — which is what the last version did, and `Assignment to constant variable` took the whole § */
  /* `on` SAYS WHICH OF THE FORM'S TWO BRANCHES THIS IS, so the other one's rows are not invented as dashes — see the note over `SPINE_EXTRA`. § */
  /* ---------- A DAY THE WEEK LEFT OUT IS NOT A DAY TO INVENT § */
  const weekLeft = weekLeft_(steps);
  const rows = spineRows_(body
    .concat(leftover.filter(p => !placed[p.key]))
    .concat([noteRow_()]), { on: bookOn_(), said: Object.assign({}, merged, weekLeft) });
  /* ---------- THE PICTURE IS DRAWN FROM THIS LIST, NOT FROM ITS OWN § */
  /* ---------- ONE SEQUENCE OF LINE NUMBERS, COUNTED AFTER THE MERGE § */
  return rows;
}

/* ONE RENDERER, BOTH DOCUMENTS (owner, 8 Nov): the form is `bookingDoc_(null, foot)`, a saved booking `bookingDoc_(j, foot)` — same rows, filled and read-only. */
function bookingDoc_(j, foot, price) {
  const L = j ? null : (price !== undefined ? price : bookPrice());
  const kid = !j && childView_();
  const rows = j ? jobRows(j) : formRows_(L);
  /* ONE SEQUENCE OF LINE NUMBERS, counted after the spine has put the rows in order. */
  let seq = 0;
  rows.forEach(r => { if (r.n !== '') r.n = String(++seq).padStart(3, '0'); });
  const pay = j ? jobMoney_(j) : null;
  const wait = j ? norm(j.kind) === 'waitlist' : isWaiting_();
  /* THE FOOT, LINE FOR LINE: Discount, then an admin's money lines (`moneyLines_`) or everybody else's total bar. */
  const lines = j ? !pay.none && !wait && pay.more.length : false;
  const pays = j ? (lines ? moneyLines_(pay) : '') : (kid ? '' : payRow_(L));
  const base = {
    lines: [],
    cols: j ? !pay.none : !kid,
    rows: rows.map(receiptRow),
    before: (j ? (pay.none || wait ? '' : discountSaid_(j)) : discountRow_(L)) + pays,
    foot: foot || '',
  };
  if (!j) return receiptHtml(Object.assign(base, {
    client: BOOKING.client || (USER && USER.name) || '',
    noTotal: kid || !!pays,
    /* £0.00 IS NOT A PRICE, IT IS AN ANSWER NOBODY GAVE. */
    total: (L && L.total > 0) ? money_(L.total) : dash_(),
  }));
  return receiptHtml(Object.assign(base, {
    /* `done` marks the saved document read-only; `stage`, `was` and `accepted` pick its stamp. */
    done: true, stage: jobStage_(j), was: norm(j.kind) || 'session', accepted: jobAccepted_(j),
    totalLabel: pay.label || (wait ? 'Your seat' : 'Cost'),
    total: pay.total,
    noTotal: !!pay.none || !!lines,
    more: lines ? [] : pay.more,
    ref: 'Session ' + esc(String(j.id || j.jobId || '')),
  }));
}
/* The form's name for it, kept for its callers and the flow checks that call it with the price they hold. */
const bookBreakdown = (L, foot) => bookingDoc_(null, foot, L);

/* THE RECEIPT ITSELF — paper, head, columns, rows, total, barcode. § */
/* ---------- THE ROSTER § */
/* THE TWO FACES: the room and the person. § */
/* `facesOf_` WENT TOO — it looked up the venue and tutor photographs, and the last thing wanting
   them was the pair of grey squares at the top of the shared picture, removed earlier tonight. */




function rosterHtml(o) {
  const tutor = o.tutor || '';
  const seats = Math.max(0, Number(o.seats) || 0);
  const names = (o.names || []).filter(Boolean);

  const slots = [];
  slots.push({ role: 'Tutor', name: tutor, filled: !!tutor, tutor: true });
  for (let i = 0; i < seats; i++) {
    /* A SEAT SOMEBODY HAS PAID FOR IS TAKEN, whether or not it has a name on it. § */
    /* NAMED IF WE KNOW, "Child" IF WE DO NOT. § */
    /* "SOMEONE ELSE" IS AN ANSWER, NOT A NAME. § */
    slots.push({ role: 'Seat ' + (i + 1),
                 name: (names[i] && names[i] !== UNNAMED) ? names[i] : 'Child',
                 filled: true });
  }
  /* Pad to four. An open slot is drawn as open rather than left off, because the empty ones are
     the ones that say something. */
  while (slots.length < 4) slots.push({ role: 'Open', name: '', filled: false });

  return `<div class="rost">
    ${slots.map(sl => `<div class="rost-slot${sl.filled ? ' on' : ''}${sl.tutor ? ' tut' : ''}">
      <span class="rost-pic">${sl.filled
        ? personFace_({ name: sl.name || sl.role }, { size: 34 })
        : '<span class="rost-plus">+</span>'}</span>
      ${/* ---------- AN EMPTY SEAT SAID "OPEN" TWICE § */
            ''}
      <span class="rost-name">${esc(sl.filled ? (sl.name ? displayName_(sl.name) : sl.role) : 'Open')}</span>
      ${sl.filled ? `<span class="rost-role">${esc(sl.role)}</span>` : ''}
    </div>`).join('')}
  </div>`;
}

/* `facesFor` AND `rosterPips` WENT WITH `jobCard`. § */

/* FOUR OBJECTS, NOT ONE OBJECT IN FOUR MOODS. § */
/* ---------- WHAT EACH COLUMN IS, IN ONE SMALL ROW AT THE TOP § */
function spineHead_(r) {
  if (!r || !r.cols || !(r.rows || []).length) return '';
  return `<div class="bk-row is-cols">
    <span class="bk-n"></span>
    <span class="bk-k"></span>
    <span class="bk-v"></span>
    <span class="bk-m">×</span>
    <span class="bk-r">+/h</span>
    <span class="bk-t">=</span>
  </div>`;
}

function receiptHtml(r) {
  /* ---------- `kind`, `SKIN` AND `STAGE` STOOD HERE, AND ONE OF THEM WAS ALREADY DEAD § */
  /* `.is-done` STAYS, and it is not a skin. It marks the SAVED document so the hour grid tightens —
     a record does not need rows you can press — which is a layout, not a colour. */
  const done = r.done ? ' is-done' : '';
  return `<div class="rc${done}">
    <div class="rc-head">
      ${/* ---------- THE SHOP NAME WAS FOR A RECEIPT, AND THIS IS NOT ONE ANY MORE § */
            ''}
      ${/* THE THREE LINES ON ONE LINE. § */
           ''}
      ${(r.lines || []).filter(Boolean).length
        ? `<div class="qtags qcard-tags">${(r.lines || []).map((l, i) => l ? `${qtag_(`${esc(l)}`, ` data-tag="${[6, 9, 4][i] || 0}"`)}` : '').join('')}</div>` : ''}
    </div>
    ${/* `r.photos` WAS HERE. Nothing passes photos to a receipt any more — see `bookBreakdown`. */''}
    ${/* ---------- AND THE RULE ABOVE THE ROWS IS THE HEADER'S OWN § */
         ''}
    ${spineHead_(r) ? '' : '<div class="rc-rule"></div>'}
    ${/* THE OLD COLUMN HEADINGS ARE STILL GONE, and `spineHead_` is not them. § */
         ''}
    ${/* ---------- THE TOTAL IS A ROW OF THE TABLE NOW, NOT A BAR BESIDE IT § */
         ''}
    ${/* ---------- `r.more`: WHO GETS WHAT, FOR THE ONE PERSON ALLOWED TO KNOW § */
         ''}
    <div class="bk">${spineHead_(r)}${(r.rows || []).join('')}${r.before || ''}${r.noTotal ? '' : `<div class="bk-row rc-total">
      <span class="bk-n"></span>
      <span class="bk-k">${esc(r.totalLabel || 'Cost')}</span>
      <span class="bk-v"></span>
      <span class="bk-m"></span>
      <span class="bk-r"></span>
      <span class="bk-t">${esc(r.total || '')}</span>
    </div>`}${(r.more || []).map(m => `<div class="bk-row rc-total rc-more${m.cls ? ' ' + esc(m.cls) : ''}">
      <span class="bk-n"></span>
      <span class="bk-k">${esc(m.k)}</span>
      <span class="bk-v"></span>
      <span class="bk-m"></span>
      <span class="bk-r"></span>
      <span class="bk-t">${esc(m.t)}</span>
    </div>`).join('')}${r.moreSay ? `<p class="bk-say rc-money-say">${esc(r.moreSay)}</p>` : ''}</div>
    ${/* THE ROSTER SLOT IS STILL HERE and nothing fills it — see the notes above. § */
          ''}
    ${r.roster ? `<div class="rc-rule"></div>${r.roster}` : ''}
    <div class="rc-rule"></div>
    ${/* ---------- WHAT YOU DO WITH IT, ON IT § */
          ''}
    ${r.foot || ''}
    ${/* THE BARCODE WAS HERE. § */
          ''}
    ${/* THE FOOTER LINE IS DRAWN ONLY IF THERE IS ONE. § */
          ''}
    ${/* THE REFERENCE, WHEN THERE IS ONE. § */
          ''}
    ${r.ref ? `<p class="rc-ref">${esc(r.ref)}</p>` : ''}
  </div>`;
}

/** One row of a receipt, from the shape `breakdownRows` and `jobRows` both produce. */
function receiptRow(r) {
  /* `wide` — A TITLE IS NOT A VALUE. § */
  const cls = [r.blank ? 'is-blank' : '',
               r.day ? 'bk-day' : '', r.end ? 'bk-end' : '', r.free ? 'bk-free' : '',
               r.wide ? 'is-wide' : '',
               /* THE WEEK'S OWN THREE. `bk-wk` lays the strip out in the answer cell, `is-shut`
                  collapses a day nobody works, `is-off` greys a week that cannot be answered. */
               r.strip ? 'bk-wk' : '', r.strip && r.shut ? 'is-shut' : '',
               r.strip && r.off ? 'is-off' : '',
               /* AND THE LIST'S TALLY, whose bars take the empty figure tracks — see `.bk-tally`. */
               r.tally ? 'bk-tally' : '', r.cls || '']
    .filter(Boolean).join(' ');
  /* A DAY SHOWS ITS HOURS, drawn rather than written — the same row of boxes the picker uses, so a day on the receipt and a day in the grid are visibly the same § */
  /* A DROPDOWN WHERE THERE IS ONE, and it replaces the value rather than sitting beside it: § */
  /* ---------- A DAY'S HOURS ARE ITS ANSWER § */
  /* ---------- A STAGE IS A MARK, NOT A VALUE § */
  /* THE BOX LAST, BECAUSE `.bk-v` IS RIGHT-ALIGNED AND FIVE BOXES HAVE TO BE ONE COLUMN. § */
  const value = r.tick !== undefined
    ? `${S_(r.v) ? `<span class="bk-when">${esc(r.v)}</span> ` : ''}<span
       class="bk-tick${r.tick ? ' on' : ''}" role="img" aria-label="${
       r.tick ? 'done' : 'not yet'}">✓</span>`
    : r.strip ? r.strip
    : r.sel ? r.sel
    /* A TALLY IS MARKUP FOR `strip`'S REASON — `whenCouldHtml` draws it, and nothing else does. */
    : r.tally ? r.tally
    : r.hours
    ? `<span class="bk-hrs">${((slotGrid().rows.find(x => x.prefix === r.hours.day)
        || { hours: [] }).hours).map(h => `<span class="bk-hr${
          (BOOKING.slots || []).indexOf(h.code) !== -1 ? ' on' : ''}">${h.h}</span>`).join('')}</span>`
    : r.dates ? `<span class="bk-dates">${esc(r.v)}</span>`
    : esc(r.v);
  /* ---------- A ROW WITH NO FIGURES DOES NOT NEED THE FIGURE COLUMNS § */
  /* ---------- A QUESTION KEEPS ITS COLUMNS WHETHER OR NOT IT HAS FIGURES § */
  /* AND A DAY ROW NEVER COLLAPSES TO THE NARROW COLUMN EITHER, for the reason the grid row had it: § */
  const bare = (!r.id || !!r.open || !!r.strip) && !S_(r.mul) && !S_(r.rate) && !S_(r.total);
  /* ---------- THE ROW ABOVE A GRID IS A HEADING, NOT A FIELD § */
  /* AND A DAY ROW LOSES ITS DASHED UNDERLINE FOR THE SAME REASON THE `When` ROW DID: § */
  /* AND A TALLY'S BARS ARE ITS ANSWER IN THE SAME WAY — a dashed "an answer goes here" under a
     count of answers already given is the card advertising a blank that is full. */
  const heads = !!r.open || !!r.strip || !!r.tally;
  return `<div class="bk-row ${cls}${bare ? ' is-bare' : ''}${heads ? ' is-head' : ''}">
    <span class="bk-n">${esc(r.n)}</span>
    ${/* A ROW WITH A CONTROL LABELS IT — see `bkCtl_`. `for` before `class`, so the receipt's own
          readers that look for `class="bk-k">` find the words either way. */
      r.ctl && r.sel ? `<label for="${esc(r.ctl)}" class="bk-k">${esc(r.k)}</label>`
                     : `<span class="bk-k">${esc(r.k)}</span>`}
    <span class="bk-v">${heads && String(r.v) === dash_() ? '' : value}</span>
    <span class="bk-m">${esc(r.mul)}</span>
    <span class="bk-r">${esc(r.rate)}</span>
    <span class="bk-t">${esc(r.total)}</span>
    ${/* ---------- THE WEEK IS A CELL OF THIS ROW NOW, NOT A BLOCK AFTER IT § */
          ''}
    ${r.open || ''}
  </div>${r.say ? `<p class="bk-say${r.say.warn ? ' is-warn' : ''}">${esc(r.say.text)}</p>` : ''}`;
}

/* A SAVED JOB, AS A RECEIPT OF WHAT WAS ASKED FOR. § */
function jobRows(j) {
  const rows = [];
  let line = 0;
  const push = (k, v, total, opts) => {
    /* A ROW WITH NOTHING IN IT IS SKIPPED — a job with no tutor should not print an empty Tutor line. § */
    if ((v === '' || v == null) && !total) return;
    rows.push(Object.assign({
      n: (opts && opts.free) ? '' : String(++line).padStart(3, '0'),
      k, v: String(v), mul: '', rate: '', total: total || '',
    }, opts || {}));
  };

  /* THE FORM'S OWN LINES, IN THE FORM'S WORDS (owner, 8 Nov: "the booking form is the booking record"). */
  const wait = norm(j.kind) === 'waitlist';
  push('For', displayName_(j.client || ((j.slots || [])[0] || {}).client || ''));
  push('Kind', wait ? 'Waiting list class' : 'Instant class');
  push('Subject', j.subject || '');
  push('Level', j.level || '');
  /* ---------- FOUR ROWS WERE READING NAMES THE PAYLOAD HAS NEVER SENT § */
  /* ---------- AND THE COUNT IS THE EXTRAS, BECAUSE THAT IS WHAT THE FORM ASKED § */
  push('Extra seats', seatsOf_(j) ? String(Math.max(0, seatsOf_(j) - 1)) : '');
  push('Venue', j.venue || j.location || '');
  push('Room', j.room || 'set by us');
  push('Space', takesAllSeats_(j.venue || j.location || '') ? 'Yes'
    : TRUEish_(j.clientHosts) ? 'Yes \u2014 no room hire' : 'No \u2014 we book the room');
  /* ---------- SEVEN DAY ROWS WHERE THE `When` ROW WAS § */
  jobWeekRows_(j).forEach(r => rows.push(r));
  if (wait) push('Per session', j.hours ? j.hours + ' hour' + (Number(j.hours) === 1 ? '' : 's') : '');
  push('Term', j.term || '');
  /* "JUST YOU" IS WRONG ON A WAITING LIST, and on an open one it is the opposite of true: § */
  /* ---------- AND ON AN OPEN SESSION IT WAS THE OPPOSITE OF TRUE TOO § */
  const going = Number(j.seatsGoing) || 0;
  const seatsFree = 'Open — ' + going + ' seat' + (going === 1 ? '' : 's') + ' free';
  push('Split', norm(j.kind) === 'waitlist'
    ? (going > 0 ? seatsFree : 'Full')
    : (j.splitEmails
      || (going > 0 && TRUEish_(j.openToOthers) ? seatsFree : 'Just you')));
  /* ---------- WHEN THE FAMILIES ON A LIST CAN COME, AS A LINE OF THE LIST'S OWN PAPER § */
  const wc = j.whenCould;
  if (wc && (wc.slots || []).length) {
    push('Can come', wc.slots.map(s => s.slot + ' ' + s.n + '/' + wc.people).join(', '), '',
         { free: true, tally: whenCouldHtml(j) });
  }
  /* ---------- WHEN IT RUNS, AND WHAT THE TERM WOULD COME TO § */
  if (norm(j.kind) === 'waitlist') {
    const iv = intervals_().find(x => norm(x.label || x.term) === norm(j.term)) || null;
    /* ---------- `For` MEANS THE CLIENT, AND HERE IT MEANT THE TERM § */
    /* `Running` AND `Weeks left` WERE TWO PUSHES HERE and went with the form's — see the note by the waiting-list branch above. § */
    /* AND ONLY WHERE THERE IS A PRICE. `doGet` withholds it from a tutor who is not also paying —
       see `jobMoney_` — and "6 × £0.00" would print the hole as a figure. */
    if (iv && iv.weeks && j.price && !childView_()) {
      /* "ABOUT", because the weeks are what is LEFT and nothing runs until the seats fill. A
         precise total here would be a promise the list cannot keep. */
      push('About', iv.weeks + ' × ' + money_(j.price || 0), money_((j.price || 0) * iv.weeks));
    }
  }

  if (j.tutor) push('Tutor', displayName_(j.tutor));

  /* ---------- `dates` IS WHAT THE SERVER SENDS AND THIS ASKED FOR `sessionDates` § */
  const dates = String(j.dates || j.sessionDates || '')
    .split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  /* THE SAME EVERY-DATE LIST AS THE BOOKING CARD — see the note there. § */
  /* ---------- HOW MANY DATES IS NOT A FIGURE, AND THE FIGURE COLUMN IS SIZED FOR MONEY § */
  /* THE SAME COUNT AS THE BOOKING CARD, THROUGH `opts` BECAUSE THIS `push` HARDCODES `mul: ''`. § */
  push('Dates', dates.length ? dates.join(', ') : dash_(), '',
       { free: true, dates: true, mul: dates.length > 1 ? '× ' + dates.length : '' });

  push('Child', (j.forChildren || []).filter(Boolean).join(', '));
  push('Note', j.note || '');
  /* `Tutor is paid` AND `Left over` WERE ROWS HERE. § */

  /* ---------- WHERE IT IS, AND WHERE IT IS GOING § */
  stageRows_(j).forEach(r => rows.push(r));
  /* THE SAME ORDER THE FORM USES, so a receipt does not reshuffle what somebody just filled in — and NOT a dash for every question this job cannot answer. § */
  return spineRows_(rows, { on: wait ? 'wait' : 'book, tutoring' });
}

/** A job, on the same paper a booking is drawn on. */
/* WHICH OF THE FOUR A SAVED BOOKING IS. § */
/* ---------- THE WEEK, ON A RECEIPT, WITH THE BOOKED HOURS LIT § */
/* ---------- THE SAME SEVEN ROWS ON THE RECEIPT § */
function jobWeekRows_(j) {
  /* THE PAYLOAD SENDS `day` AND `slotCodes`; reading only `weekday` drew every saved booking's grid empty (owner, 8 Nov). */
  const days = String((j && (j.weekday || j.day)) || '').split(',').map(norm).filter(Boolean);
  const start = parseInt(String((j && (j.time || j.startTime)) || '').split(':')[0], 10);
  const hrs = Math.max(1, Number(j && (j.hours || j.hoursPerSession)) || 1);
  const hours = SLOT_HOURS;
  const codes = String((j && j.slotCodes) || '').split(',').map(x => x.trim()).filter(Boolean);
  if (codes.length) {
    return weekRows_(
      SLOT_DAYS.map(([c, label]) => {
        const lit = hours.filter(h => codes.indexOf(c + h) !== -1);
        return { label: label, hours: hours, on: lit.length > 0, lit: lit, mul: lit.length };
      }),
      (h, d) => {
        const on = d.lit.indexOf(h) !== -1;
        return tile_({ form: true, look: 'hr' + (on ? ' on' : ' shut'), off: true, title: h + ':00', aria: d.label + ' ' + h + ':00', html: '' });
      },
      { off: true, ruler: true });
  }
  return weekRows_(
    SLOT_DAYS.map(([, label]) => {
      const runs = days.indexOf(norm(label)) !== -1;
      /* THE SAME FIGURE THE FORM PRINTS, off the row rather than off the ticks — a saved job holds `hours_per_session` and one span, so a day it runs on is that many § */
      return { label: label, hours: hours, on: runs, mul: runs ? hrs : 0 };
    }),
    (h, d) => {
      const lit = d.on && isFinite(start) && h >= start && h < start + hrs;
      return tile_({ form: true, look: 'hr' + (lit ? ' on' : ' shut'), off: true, title: h + ':00', aria: d.label + ' ' + h + ':00', html: '' });
    },
    { off: true, ruler: true });
}

/* ---------- `moneyBlock` STOOD HERE, AND THE FIGURES ARE ROWS OF THE PAPER NOW § */

/* ---------- HOW MANY SEATS A SESSION HAS § */
const seatsOf_ = j => Math.max(0, Number((j && (j.maxKids || j.maxStudents)) || 0));

/* ---------- `jobSaid_` STOOD HERE, AND THE STAGE IS FOUR TICKS NOW § */

/* `jobStatusSaid_` AND THE `Status` ROW WENT (owner, 29 Oct): the four ticks above it already say where a booking is. */

function jobStage_(j) {
  const paid = (j.slots || []).filter(sl => /^booked$/i.test(String(sl.status || '')));
  if (norm(j.kind) === 'waitlist') {
    const seats = seatsOf_(j);
    if (!seats) return 'waitlist';   // unpriced: it cannot be full
    return paid.length >= seats ? 'receipt' : 'waitlist';
  }
  return paid.length ? 'receipt' : 'application';
}

/* HAS IT BEEN ACCEPTED YET — which is a different question from which of the four it is. § */
function jobAccepted_(j) {
  /* THE TWO SIDES SPEAK DIFFERENT WORDS, and reading them as one list is why this said "pending" on a session that had been accepted. § */
  const seats = j.slots || [];
  if (!seats.length) return false;
  const clientsOk = seats.every(sl => /^(agreed|paying|booked)$/i.test(String(sl.status || '')));
  /* A TUTOR IS OPTIONAL. § */
  const tutorsOk = (j.tutorSlots || []).every(sl => /^confirmed$/i.test(String(sl.status || '')));
  return clientsOk && tutorsOk;
}

/* ---------- THREE PEOPLE, THREE FIGURES, AND EACH SEES THEIR OWN § */
function jobMoney_(j) {
  const has = v => v !== '' && v != null && isFinite(Number(v));
  const say = v => has(v) ? money_(Number(v)) : dash_();
  if (typeof isAdmin === 'function' && isAdmin()) {
    /* A WAITING LIST'S `price` IS ONE SEAT, NOT A TOTAL — `doGet` says so beside it — so "Client pays" over it would name the per-seat figure as everything the § */
    const seat = norm(j.kind) === 'waitlist';
    /* ADMIN EARNS IS WHAT IS LEFT, so the three lines always add up; a stored figure counted before the discount once said tutor £600 on a £302.40 booking. */
    const fees = has(j.feesKept) ? Number(j.feesKept) : 0;
    const left = has(j.price) && has(j.tutorPay) ? Number(j.price) - Number(j.tutorPay) - fees : j.adminKeeps;
    return { label: seat ? 'Each seat pays' : 'Client pays', total: say(j.price),
             more: [{ k: 'Tutor earns', t: say(j.tutorPay) }]
               .concat(fees ? [{ k: 'Room and fees', t: say(fees) }] : [])
               .concat([{ k: 'Admin earns', t: seat ? say(j.adminKeeps) : say(left) }]) };
  }
  /* A CHILD'S SESSION HAS NO FIGURE ON IT (398) — `jobReceipt` draws no total row. */
  if (childView_()) return { label: null, total: '', more: [], none: true };
  const me = USER ? norm(USER.name) : '';
  const teaches = !!me && (norm(j.tutor) === me
    || (j.tutorSlots || []).some(t => norm(t.name) === me));
  const pays = !!me && (j.slots || []).some(sl => norm(sl.client) === me);
  if (teaches && !pays) return { label: 'You earn', total: say(j.tutorPay), more: [] };
  return { label: null, total: money_(j.price || 0), more: [] };
}

/* AND THE FORM, WHILE IT IS BEING PRICED — for an admin only, and only once `priceFrom` has said what the tutor and the business would take. § */
/* ---------- AND THE MONEY BLOCK, WHICH IS THOSE TWO ROWS GROWN UP (docs/history/353) § */
/* ---------- WHAT THE JOB ROW KEEPS OF THE MONEY BLOCK § */
function bookMoneySend_(L) {
  const e = L && L.earn;
  if (!e) return {};
  const p2 = x => String(Math.round((Number(x) || 0) * 100) / 100);
  const out = {
    gross: p2(e.charged), tutorPayout: p2(e.tutorPayout), venueCost: p2(e.venue),
    cardFees: p2(e.cardFees), netProfit: p2(e.net),
  };
  if (e.discount > 0) {
    Object.assign(out, { discountType: e.discountType, discountValue: String(e.discountValue),
      discountCode: e.discountCode, discountAbsorbedBy: e.absorbedBy });
  }
  return out;
}

/* ---------- AN ADMIN'S DISCOUNT IS ONE LINE, A PERCENTAGE § */
function discountRow_(L) {
  if (isWaiting_()) return '';
  /* ONLY AN ADMIN SETS A DISCOUNT (owner, 7 Nov): everybody sees the line, greyed for the rest; the server refuses theirs (`discountRefusal_`). */
  const admin = typeof isAdmin === 'function' && isAdmin();
  const e = (L && L.earn) || { discount: 0 };
  return receiptRow({ n: '', k: 'Discount', v: '', mul: '', cls: 'rc-disc', ctl: bkCtl_('discValue'),
    rate: '',
    total: e.discount > 0 ? '− ' + money_(e.discount / ((L && L.splitShares) || 1)) : dash_(),
    sel: `<input class="bk-in" id="${bkCtl_('discValue')}" data-do="book-disc" data-field="discValue" type="number"
      inputmode="decimal" min="0" max="100" step="1" value="${admin ? esc(BOOKING.discValue) : ''}" placeholder="% off"${admin ? '' : ' disabled'}
      aria-label="Discount, per cent off">` });
}
/* KEPT AS IT IS TYPED, REDRAWN ON A CHANGE. § */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('input[data-do="book-disc"]');
  if (!el || el.dataset.field !== 'discValue') return;
  BOOKING.discValue = String(el.value || ''); bookKeep_();
});
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-disc"]');
  if (!el || el.dataset.field !== 'discValue' || !(typeof isAdmin === 'function' && isAdmin())) return;
  BOOKING.discValue = String(el.value || '').trim();
  drawBooker();
});

/* ---------- WHAT THE CLIENT PAYS, A LINE LIKE THE ONES ABOVE IT § */
function formMoney_(L) {
  if (!(typeof isAdmin === 'function' && isAdmin())) return { label: null, more: [] };
  /* THE SAME THREE FIGURES THE BOOKING ROW KEEPS (`bookShares_`): after the discount, so pays = tutor + admin + fees to the penny. */
  const sh = typeof bookShares_ === 'function' ? bookShares_(L) : null;
  const dash = dash_();
  return { label: 'Client pays', total: sh ? money_(sh.pays) : dash,
           more: [{ k: 'Tutor earns', t: sh ? money_(sh.tutor) : dash }]
             .concat(sh && sh.fees > 0 ? [{ k: 'Room and fees', t: money_(sh.fees) }] : [])
             .concat([{ k: 'Admin earns', t: sh ? money_(sh.admin) : dash }]) };
}
/* AN ADMIN'S MONEY, ONE BUILDER FOR THE FORM AND THE SAVED BOOKING: Client pays, then who earns what, as ordinary lines. */
function moneyLines_(m) {
  return [{ k: m.label, t: m.total, cls: 'rc-pays' }].concat((m.more || []).map(x => ({ k: x.k, t: x.t, cls: 'rc-earn' })))
    .map(x => receiptRow({ n: '', k: x.k, v: '', mul: '', rate: '', total: x.t, cls: x.cls })).join('');
}
function payRow_(L) {
  const m = formMoney_(L);
  if (!m.label || isWaiting_()) return '';
  return moneyLines_(m);
}
/* THE SAVED BOOKING'S DISCOUNT LINE: the form's box, read-only, so the two documents keep one line list. */
function discountSaid_(j) {
  const pc = Number(j && j.discountValue) || 0;
  return receiptRow({ n: '', k: 'Discount', v: '', mul: '', rate: '', cls: 'rc-disc', total: dash_(),
    sel: `<input class="bk-in" type="number" value="${pc > 0 ? esc(String(pc)) : ''}" placeholder="% off" disabled aria-label="Discount, per cent off">` });
}

/* ---------- WHAT THE CARD HOLDS, FOR A SUGGESTION ABOUT IT § */
function bookFieldsSaid_() {
  try {
    const ini = n => String(n || '').split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase() + '.').join('');
    const person = v => (v === NOBODY || v === UNNAMED) ? v : ini(v);
    const fb = st => st.fallback ? String(st.fallback() || '') : '';
    const on = bookOn_();
    const out = BOOK_STEPS.filter(st => st.short && onlyHas_(st.only, on)).map(st => {
      const v = BOOKING[st.id];
      const list = [].concat(v == null ? [] : v).filter(x => String(x).trim());
      const said = st.id === 'client' ? person(v || fb(st))
        : st.id === 'kids' ? list.map(person).join(', ')
        : st.grid === 'blocks' ? blockSay_(v)
        : st.grid ? bookRuns().map(r => day_(r.dayName) + ' ' + hours_(r.hour, r.hour + r.hours)).join(', ')
        : st.multi ? (list.join(', ') || fb(st))
        : (st.label_ && v ? st.label_(v) : (v || fb(st)));
      return st.short + ': ' + dash_(String(said || '').trim());
    });
    const admin = typeof isAdmin === 'function' && isAdmin();
    if (admin && !isWaiting_()) out.push('Discount: ' + (Number(BOOKING.discValue) > 0 ? BOOKING.discValue + '%' : dash_()));
    const L = bookPrice();
    if (L && L.total > 0) out.push((admin && !isWaiting_() ? 'Client pays' : 'Cost') + ': ' + money_(L.total));
    if (String(BOOKING.note || '').trim()) out.push('Note: written (not copied)');
    return 'Fields: ' + out.join(' · ');
  } catch (e) { return ''; }
}

const jobReceipt = (j, foot) => bookingDoc_(j, foot);

/* ---------- ASKING TO JOIN SOMEBODY ELSE'S SESSION IS A TILE ON ITS PAPER NOW § */
/* ---------- THE STEP THAT WAS NOT THERE AT ALL § */
/* `payBlock` AND `leaveBlock` WERE HERE. Both are marks in the tile row under the card now —
   `jobOpts_` in tiles-jobs.js — which is where every other kind in this app keeps its actions, and the
   reasoning is written there. */

/* ---------- WHEN THE FAMILIES ON A LIST CAN COME § */
function whenCouldHtml(j) {
  const w = j && j.whenCould;
  if (!w || !w.slots || !w.slots.length) return '';
  /* A COUNT OUT OF NOBODY IS NOT A BAR. `people` is the number of families who answered, so it is
     never below a slot's own count — but a payload that sent it blank would draw `Infinity%`. */
  const of = Math.max(1, Number(w.people) || 0);
  return `<div class="wc">${w.slots.map(s => `<div class="wc-row${s.all ? ' is-all' : ''}">
      <span class="wc-n">${esc(s.n)}/${esc(w.people)}</span>
      <span class="wc-slot">${esc(s.slot)}</span>
      <i style="--f:${Math.min(100, (Number(s.n) || 0) / of * 100).toFixed(0)}%"></i>
    </div>`).join('')}</div>`;
}

/* ---------- `joinBlock` STOOD HERE, UNDER THE PAPER, AND IT IS THREE PIECES OF THE PAPER NOW § */

/* REDRAW WITHOUT MOVING. § */
/* ---------- KEEPING THE PLACE ACROSS A REDRAW § */
function redrawBooker_(draw) {
  const card = $('bookr');
  const held = bookFocusOf_(card);
  const pane = card && card.closest('.pane'), was = pane ? pane.scrollTop : 0, y = window.scrollY || 0;
  /* ONLY WHAT CHANGED IS TOUCHED (owner, 12 Nov: "it jumps me back up to the top"): the card is patched against a fresh
     `bookerCard()`, so the Find page round it is never rebuilt; no card, the caller paints. */
  let done = false;
  try {
    const t = document.createElement('div');
    t.innerHTML = card && card.isConnected ? bookerCard() : '';
    if (t.children.length === 1 && t.firstElementChild.id === card.id) { patchNode_(card, t.firstElementChild); done = true; }
  } catch (e) { done = false; }
  if (!done) draw();
  bookFocusBack_(held);
  const keep = () => {
    const now = $('bookr') && $('bookr').closest('.pane');
    if (now && was && Math.abs(now.scrollTop - was) > 1) now.scrollTop = was;
    if (Math.abs((window.scrollY || 0) - y) > 1) window.scrollTo(window.scrollX || 0, y);
  };
  if (!done) { keep(); requestAnimationFrame(keep); }
}

/* A NODE MADE TO MATCH ANOTHER, keeping every element whose shape is the same — so a focused control stays the one in the page. */
function patchNode_(old, fresh) {
  if (old.nodeType !== fresh.nodeType || old.nodeName !== fresh.nodeName) { old.replaceWith(fresh); return; }
  if (old.nodeType !== 1) { if (old.nodeValue !== fresh.nodeValue) old.nodeValue = fresh.nodeValue; return; }
  [...old.attributes].forEach(a => { if (!fresh.hasAttribute(a.name)) old.removeAttribute(a.name); });
  [...fresh.attributes].forEach(a => { if (old.getAttribute(a.name) !== a.value) old.setAttribute(a.name, a.value); });
  /* A CONTROL'S LIVE STATE IS A PROPERTY, NOT ITS ATTRIBUTE: set from what was drawn, unless it is being typed in now. */
  const ctl = /^(SELECT|INPUT|TEXTAREA)$/.test(old.tagName);
  if (!ctl && old.innerHTML === fresh.innerHTML) return;
  const a = [...old.childNodes], b = [...fresh.childNodes];
  if (a.length !== b.length) old.replaceChildren(...b);
  else a.forEach((n, i) => patchNode_(n, b[i]));
  if (!ctl) return;
  if (/^(checkbox|radio)$/.test(old.type)) old.checked = fresh.hasAttribute('checked');
  else if (old.options) old.selectedIndex = Math.max(0, [...old.options].findIndex(o => o.hasAttribute('selected')));
  else if (document.activeElement !== old && old.value !== (fresh.getAttribute('value') || '')) old.value = fresh.getAttribute('value') || '';
}

/* ---------- AND THE FOCUS STAYS ON WHAT WAS JUST ANSWERED § */
function bookFocusOf_(card) {
  const a = document.activeElement;
  if (!card || !a || a === document.body || !card.contains(a) || !a.dataset || !a.dataset.do) return null;
  const fine = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
  const tick = a.tagName === 'INPUT' && a.type === 'checkbox';
  if (!(tick || a.tagName === 'BUTTON' || (a.tagName === 'SELECT' && fine))) return null;
  return { tag: a.tagName, data: bookDataOf_(a), value: tick ? a.value : null };
}
const bookDataOf_ = el => JSON.stringify(Object.keys(el.dataset).sort().map(k => [k, el.dataset[k]]));
function bookFocusBack_(k) {
  if (!k) return;
  const card = $('bookr');
  if (!card) return;
  const el = [...card.querySelectorAll('[data-do]')].find(x => x.tagName === k.tag && bookDataOf_(x) === k.data
    && (k.value === null || x.value === k.value));
  if (el && !el.disabled && document.activeElement !== el) { try { el.focus({ preventScroll: true }); } catch (e) {} }
}

/* BOOKING, AS A COLUMN `bookingPages_` ALREADY BUILDS THIS and has done since the form was folded into the funnel — it answers `What for · Booking`, and it § */
screen('booking', () => pages('booking', bookingPages_({ column: true })));
