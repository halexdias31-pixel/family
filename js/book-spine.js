/* THE SPINE — ONE ROW LIST, TWO DOCUMENTS. § */
/* ---------- THE FORM IS THE ARCHETYPE, SO THE FORM IS WHERE THIS COMES FROM § */
/* ---------- FOUR LABELS WERE TOO LONG FOR THEIR OWN COLUMN § */
/* ---------- `only` — WHICH DOCUMENT CAN EVER FILL THIS ROW § */
/* WHERE A BOOKING HAS GOT TO, AS FIVE TICKS RATHER THAN ONE SENTENCE. § */
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
  /* THE FIRST PLANNED SESSION IS IN THE PAST. § */
  { row: 'Started',   is: j => datePassed_(j.startDate), when: j => S_(j.startDate) },
  { row: 'Completed', is: j => datePassed_(j.endDate),   when: j => S_(j.endDate) },
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

/* HAS THIS DAY BEEN AND GONE. § */
function datePassed_(v) {
  const d = parseDMY(v);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d <= today;
}

/* ONE BUILDER, BOTH DOCUMENTS — which is the whole of what stops them drifting, the same argument `weekRows_` makes for the three week grids. § */
function stageRows_(j) {
  let on = true;
  return JOB_STAGES.map(st => {
    /* THE CHAIN. Once one is unticked, nothing below it can be — see the note above. `on` carries
       that down the list rather than each test repeating the ones before it. */
    on = on && !!j && !!st.is(j);
    /* ---------- ONE DATE FORMAT FOR THE FIVE, DECIDED HERE AND NOT IN FIVE PLACES § */
    const at = on && st.when ? st.when(j) : '';
    return { n: '', k: st.row, v: (at && fmtDate(at)) || '',
             mul: '', rate: '', total: '', free: true, tick: on };
  });
}

const SPINE_EXTRA = [
  { after: 'Subject', row: 'Extra subj.' },
  /* THE ROOM UNDER ITS VENUE (owner, 7 Nov), on the form and the booking alike. */
  { after: 'Venue',   row: 'Room' },
  { after: 'When',    row: 'Per session', only: 'wait' },
  /* `Sharing` IS PUSHED BY `jobRows` AND BY NOTHING ELSE — measured, one push in this file. The
     form asks the question as `Split` and names the answer there. */
  { after: 'Split',   row: 'Sharing',     only: 'receipt' },
  /* ---------- THE TALLY OF EVERYBODY'S ANSWER TO `When free`, UNDER THAT QUESTION § */
  { after: 'When free', row: 'Can come',  only: 'receipt' },
  /* ---------- PINNED TO THE FOOT RATHER THAN TO WHICHEVER QUESTION IS LAST § */
  { after: '',        row: 'About',     only: 'wait' },
  { after: '',        row: 'Dates' },
  { after: '',        row: 'Note' },
  /* THE TWO WAITING-LIST ROWS. § */
  { after: '',        row: 'A seat',    only: 'wait' },
  /* ---------- `Shared by` BELONGS TO THE FORM, ON BOTH ITS BRANCHES § */
  { after: '',        row: 'Shared by', only: 'book, wait' },
  /* LAST, ALWAYS. Where a booking has got to is the closing of the document, after everything it is about — which is where a receipt puts it and where the form now § */
  ...JOB_STAGES.map(st => ({ after: '', row: st.row, tick: true })),
  /* NO `Status` (owner, 29 Oct: "What is status for? … all those bits above status … tell you the status"): the five ticks are it. */
];

const SPINE = (() => {
  const out = [];
  const tail = SPINE_EXTRA.filter(x => !x.after).map(x => x.row);
  BOOK_STEPS.forEach(st => {
    if (!st.short) return;
    /* ---------- A WEEK STEP IS SEVEN ROWS AND THEY ARE THE SAME SEVEN ON BOTH BRANCHES § */
    if (st.week) SLOT_DAYS.forEach(([, label]) => {
      if (out.indexOf(label) === -1) out.push(label);
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

/* THE RECEIPT'S OLD NAMES FOR SPINE ROWS. Kept as a translation rather than renamed at the twenty
   call sites, so a `push` anywhere in this file still lands on the right line. */
/* `Total: ''` DROPS THE ROW. § */
/* `Extra subjects` → `Extra subj.` WAS THE ONE SHORTENING THAT NEVER REACHED ITS PUSH SITE. § */
/* `Students` → `Extra seats`, WHICH MOVED WITH THE STEP'S OWN `short`. § */
const SPINE_ALIAS = { Students: 'Extra seats', Host: 'Space', Total: '',
                      'Extra subjects': 'Extra subj.' };

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
    const k = SPINE_ALIAS[r.k] !== undefined ? SPINE_ALIAS[r.k] : r.k;
    /* AN ALIAS TO NOTHING IS A ROW THAT SHOULD NOT BE DRAWN, not a row with no home — see `Total`
       above. It was falling through to `extra` and printing at the foot anyway, which is the
       opposite of what the alias says. */
    if (SPINE_ALIAS[r.k] === '') return;
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
    n: '', k: k, v: TICK_ROW[k] ? '' : '—', mul: '', rate: '', total: '', free: true,
    faint: !TICK_ROW[k], blank: !TICK_ROW[k], tick: TICK_ROW[k] ? false : undefined,
  } : null))).filter(Boolean);
  return out.concat(extra);
}

/* THE DAYS THE WEEK ROW LEFT OUT, by label, so the spine does not invent them; none when no week was drawn. */
function weekLeft_(steps) {
  const weekDrew = steps.filter(r => r.strip).map(r => r.k);
  const weekLeft = {};
  if (weekDrew.length) SLOT_DAYS.forEach(([, label]) => { if (weekDrew.indexOf(label) === -1) weekLeft[label] = true; });
  return weekLeft;
}

function bookBreakdown(L, foot) {
  /* `L` IS NULL UNTIL ENOUGH IS ANSWERED TO COST IT — no subjects, or no venue on a shared class. § */

  const venueName = BOOKING.loc || 'No venue yet';
  const now = new Date();
  const when = fmtDate(now) + ' ' + String(now.getHours()).padStart(2, '0')
    + ':' + String(now.getMinutes()).padStart(2, '0');

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
    const k = SPINE_ALIAS[p.k] !== undefined ? SPINE_ALIAS[p.k] : p.k;
    if (k) merged[k] = true;
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
  let seq = 0;
  rows.forEach(r => { if (r.n !== '') r.n = String(++seq).padStart(3, '0'); });

  const out = rows.map(receiptRow);
  const pays = kid ? '' : payRow_(L);

  return receiptHtml({
    /* ---------- THE HEAD SAID WHAT THE ROWS SAY § */
    lines: [],
    /* WHO, so `breakdownRows` can put it at the top — the admin may have changed it, so it is read
       from the booking rather than assumed to be whoever is looking. */
    client: BOOKING.client || (USER && USER.name) || '',
    /* DRAW THE COLUMN HEADER. § */
    cols: !kid,
    rows: out,
    /* AN ADMIN'S PRICED FORM ENDS ON TWO ORDINARY LINES, Discount and Client pays (`payRow_`), and so has no total bar. */
    noTotal: kid || !!pays,
    /* ---------- £0.00 IS NOT A PRICE, IT IS AN ANSWER NOBODY GAVE § */
    total: (L && L.total > 0) ? money(L.total) : '—',
    /* THE DISCOUNT LINE (an admin's to set, greyed for others), then what the client pays — `discountRow_`, `payRow_`. */
    before: discountRow_(L) + pays,
    /* PASSED STRAIGHT THROUGH. The actions are built where the rest of the booking's wording is —
       see `drawBooker_` — and printed where a receipt's footer goes. */
    foot: foot || '',
    /* ---------- THE ROSTER IS NOT ON EITHER DOCUMENT § */
    /* ---------- THE SKIN WAS ONE WORD HERE, AND NOW THERE IS NO WORD § */
  });
}

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
        ? avatarFor(sl.name || sl.role, 34, '')
        : '<span class="rost-plus">+</span>'}</span>
      ${/* ---------- AN EMPTY SEAT SAID "OPEN" TWICE § */
            ''}
      <span class="rost-name">${esc(sl.filled ? (sl.name || sl.role) : 'Open')}</span>
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
        ? `<div class="qtags qcard-tags">${(r.lines || []).map((l, i) => l ? `<span class="qtag" data-tag="${[6, 9, 4][i] || 0}">${esc(l)}</span>` : '').join('')}</div>` : ''}
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
    <span class="bk-v">${heads && String(r.v) === '\u2014' ? '' : value}</span>
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

  push('Subject', j.subject || '');
  push('Level', j.level || '');
  /* ---------- FOUR ROWS WERE READING NAMES THE PAYLOAD HAS NEVER SENT § */
  /* ---------- AND THE COUNT IS THE EXTRAS, BECAUSE THAT IS WHAT THE FORM ASKED § */
  push('Students', seatsOf_(j) ? String(Math.max(0, seatsOf_(j) - 1)) : '');
  push('Venue', j.venue || j.location || '');
  push('Room', j.room || 'set by us before the first session');
  push('Host', TRUEish_(j.clientHosts) ? 'You' : 'We book the room');
  /* ---------- SEVEN DAY ROWS WHERE THE `When` ROW WAS § */
  jobWeekRows_(j).forEach(r => rows.push(r));
  push('Per session', j.hours ? j.hours + ' hour' + (Number(j.hours) === 1 ? '' : 's') : '');
  push('Term', j.term || '');
  /* "JUST YOU" IS WRONG ON A WAITING LIST, and on an open one it is the opposite of true: § */
  /* ---------- AND ON AN OPEN SESSION IT WAS THE OPPOSITE OF TRUE TOO § */
  const going = Number(j.seatsGoing) || 0;
  const seatsFree = 'Open — ' + going + ' seat' + (going === 1 ? '' : 's') + ' free';
  push('Sharing', norm(j.kind) === 'waitlist'
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
      push('About', iv.weeks + ' × ' + money(j.price || 0), money((j.price || 0) * iv.weeks));
    }
  }

  if (j.tutor) push('Tutor', j.tutor);

  /* ---------- `dates` IS WHAT THE SERVER SENDS AND THIS ASKED FOR `sessionDates` § */
  const dates = String(j.dates || j.sessionDates || '')
    .split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  /* THE SAME EVERY-DATE LIST AS THE BOOKING CARD — see the note there. § */
  /* ---------- HOW MANY DATES IS NOT A FIGURE, AND THE FIGURE COLUMN IS SIZED FOR MONEY § */
  /* THE SAME COUNT AS THE BOOKING CARD, THROUGH `opts` BECAUSE THIS `push` HARDCODES `mul: ''`. § */
  push('Dates', dates.length ? dates.join(', ') : '—', '',
       { free: true, dates: true, mul: dates.length > 1 ? '× ' + dates.length : '' });

  /* WHAT THE MONEY DOES, for whoever is allowed to see it. § */
  if (j.price && !childView_()) push('Total', '', money(j.price), { free: true });
  /* `Tutor is paid` AND `Left over` WERE ROWS HERE. § */

  /* ---------- WHERE IT IS, AND WHERE IT IS GOING § */
  stageRows_(j).forEach(r => rows.push(r));
  /* THE SAME ORDER THE FORM USES, so a receipt does not reshuffle what somebody just filled in — and NOT a dash for every question this job cannot answer. § */
  return spineRows_(rows, { fill: false });
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
        return `<button class="hr${on ? ' on' : ' shut'}" disabled title="${h}:00" aria-label="${esc(d.label)} ${h}:00"></button>`;
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
      return `<button class="hr${lit ? ' on' : ''}${lit ? '' : ' shut'}" disabled
        title="${h}:00" aria-label="${esc(d.label)} ${h}:00"></button>`;
    },
    { off: true, ruler: true });
}

/* ---------- `moneyBlock` STOOD HERE, AND THE FIGURES ARE ROWS OF THE PAPER NOW § */

/* ---------- HOW MANY SEATS A SESSION HAS § */
const seatsOf_ = j => Math.max(0, Number((j && (j.maxKids || j.maxStudents)) || 0));

/* ---------- `jobSaid_` STOOD HERE, AND THE STAGE IS FIVE TICKS NOW § */

/* `jobStatusSaid_` AND THE `Status` ROW WENT (owner, 29 Oct): the five ticks above it already say where a booking is. */

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
  const say = v => has(v) ? money(Number(v)) : '—';
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
  return { label: null, total: money(j.price || 0), more: [] };
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
  if (isWaiting_() || !L) return '';
  /* ONLY AN ADMIN SETS A DISCOUNT (owner, 7 Nov): everybody sees the line, greyed for the rest; the server refuses theirs (`discountRefusal_`). */
  const admin = typeof isAdmin === 'function' && isAdmin();
  const e = L.earn || { discount: 0 };
  return receiptRow({ n: '', k: 'Discount', v: '', mul: '', rate: '', cls: 'rc-disc', ctl: bkCtl_('discValue'),
    total: e.discount > 0 ? '− ' + money(e.discount / (L.splitShares || 1)) : '—',
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
  if (!L || !(L.total > 0) || !isFinite(Number(L.tutorPay))) return { label: null, more: [] };
  return { label: 'Client pays', more: [] };
}
function payRow_(L) {
  const label = formMoney_(L).label;
  if (!label || isWaiting_()) return '';
  return receiptRow({ n: '', k: label, v: '', mul: '', rate: '', total: money(L.total), cls: 'rc-pays' });
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
        : st.emails ? (list.length ? list.length + (list.length === 1 ? ' address' : ' addresses') : '')
        : st.grid === 'blocks' ? blockSay_(v)
        : st.grid ? bookRuns().map(r => r.dayName + ' ' + r.hour + ':00\u2013' + (r.hour + r.hours) + ':00').join(', ')
        : st.multi ? (list.join(', ') || fb(st))
        : (st.label_ && v ? st.label_(v) : (v || fb(st)));
      return st.short + ': ' + (String(said || '').trim() || '\u2014');
    });
    const admin = typeof isAdmin === 'function' && isAdmin();
    if (admin && !isWaiting_()) out.push('Discount: ' + (Number(BOOKING.discValue) > 0 ? BOOKING.discValue + '%' : '\u2014'));
    const L = bookPrice();
    if (L && L.total > 0) out.push((admin && !isWaiting_() ? 'Client pays' : 'Cost') + ': ' + money(L.total));
    if (String(BOOKING.note || '').trim()) out.push('Note: written (not copied)');
    return 'Fields: ' + out.join(' · ');
  } catch (e) { return ''; }
}

function jobReceipt(j, foot) {
  const rows = jobRows(j);
  const pay = jobMoney_(j);
  const stage = jobStage_(j);
  return receiptHtml({
    /* ---------- THE SAME SKIN AS THE FORM, WHICH IS THE WHOLE POINT § */
    /* `done` MARKED THE SAVED DOCUMENT so the screen skin's blinking cursor could be turned off. § */
    done: true,
    stage: stage,
    /* THE JOB'S OWN KIND, WHICH IS NOT THE STAGE. § */
    was: norm(j.kind) || 'session',
    /* SO THE STAMP CAN SAY WHICH. An application that has been accepted and one that is still
       waiting are the same object at two moments, and the difference is the whole point of the
       stamp. */
    accepted: jobAccepted_(j),
    /* `location` IS WHAT THE PAYLOAD SENDS FOR A CLASS, and this read `venue` — which the jobs list uses and `clientClasses` does not. § */
    lines: [j.venue || j.location || 'No venue', j.tutor || 'No tutor yet', j.term || '']
      .filter(Boolean),
    /* AND THE RECEIPT DRAWS IT TOO. This said `Detail` where the form said `Answer`, because nothing
       on a receipt is being asked; both are `A` now and the distinction has nowhere to show. */
    cols: !pay.none,
    rows: rows.map(receiptRow),
    /* WHAT THE FIGURE IS, and it is not the same sentence at every stage. § */
    totalLabel: pay.label
      || (stage === 'application' ? 'It would come to'
        : stage === 'waitlist' ? 'Your seat'
        : 'Cost'),
    total: pay.total,
    noTotal: !!pay.none,
    more: pay.more,
    /* ---------- THE SESSION'S ACTIONS ARE PRINTED ON IT, LIKE THE FORM'S § */
    foot: foot || '',
    /* ---------- THE STATUS WORD IS NOT AN ASIDE ON THE TOTAL § */
    /* NO ROSTER HERE EITHER — see the note on the form. The chairs are `Your sessions`, one widget
       per class, which is the view that answers "who is in it". */
    ref: 'Session ' + esc(String(j.id || j.jobId || '')),
  });
}

/* ---------- ASKING TO JOIN SOMEBODY ELSE'S SESSION IS A TILE ON ITS PAPER NOW § */
/* ---------- THE STEP THAT WAS NOT THERE AT ALL § */
/* `payBlock` AND `leaveBlock` WERE HERE. Both are marks in the tile row under the card now —
   `jobTiles_` in tiles.js — which is where every other kind in this app keeps its actions, and the
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
  const before = $('bookr');
  const pane = before && before.closest('.pane');
  const was = pane ? pane.scrollTop : 0;
  const held = bookFocusOf_(before);
  draw();
  bookFocusBack_(held);
  if (!was) return;
  const after = $('bookr');
  const now = after && after.closest('.pane');
  if (!now) return;
  requestAnimationFrame(() => {
    now.scrollTop = Math.min(was, Math.max(0, now.scrollHeight - now.clientHeight));
  });
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
