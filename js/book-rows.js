/* ---------- THE FORM SURVIVES A RELOAD (docs/history/317) § */
const bookBlank_ = () => Object.keys(BOOKING).every(k => k === 'done' || k === 'picking'
  || ![].concat(BOOKING[k] == null ? [] : BOOKING[k]).join('').trim());
/* WHOSE FORM IS IN `BOOKING` — the draft it was read from or last written to. See `bookFollow_`. */
let BOOK_WHO = '';
/* THE FORM AS ITS DRAFT IS WRITTEN — one function, so another tab's copy can be told from this one's. */
function bookJson_() {
  const o = {};
  Object.keys(BOOKING).forEach(k => { if (k !== 'picking') o[k] = BOOKING[k]; });
  return JSON.stringify(o);
}
function bookKeep_() {
  if (typeof draftKeep_ !== 'function') return;
  try {
    BOOK_WHO = draftWho_();
    if (bookBlank_()) draftDrop_('book', 'form'); else draftKeep_('book', 'form', bookJson_());
  } catch (e) {}
}
/* `who` IS ONLY EVER `'device'`: the device's form, read in for the person it is marked as (`bookFollow_`). */
function bookBack_(who) {
  if (typeof draftRead_ !== 'function') return;
  BOOK_WHO = who || draftWho_();
  try {
    const raw = draftRead_('book', 'form', undefined, who);
    if (raw === null) return;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || Array.isArray(o)) return;
    const plain = v => typeof v === 'string' || typeof v === 'number';
    Object.keys(o).forEach(k => {
      if (k === 'picking') return;
      const v = o[k];
      if (plain(v) || (Array.isArray(v) && v.every(plain))) BOOKING[k] = Array.isArray(v) ? v.slice() : v;
    });
  } catch (e) {}
}
bookBack_();
/* ---------- SENT IS NOT A DRAFT (`draftSent_`, data.js) § */
function bookSending_(going) {
  try {
    [['form']].concat(BOOK_STEPS.filter(st => st.emails).map(st => ['emails:' + st.id])).forEach(([id]) => {
      if (going) draftSent_('book', id); else draftSentBack_('book', id);
    });
  } catch (e) {}
}
/* ---------- AND ANOTHER TAB'S FORM IS THIS TAB'S (the `storage` listener in data.js) § */
function bookElsewhere_(v, old) {
  try {
    const mine = bookJson_();
    if (v !== null ? v === mine : old !== mine) return;
    resetBooking_(true);
    bookBack_();
    if ($('bookr') && typeof redrawBooker_ === 'function' && typeof paintBook_ === 'function') redrawBooker_(paintBook_);
  } catch (e) {}
}
/* ---------- AND THE FORM IS THE PERSON'S, ON A SHARED iPAD § */
function bookFollow_(signingIn) {
  if (typeof draftWho_ !== 'function') return;
  const now = draftWho_();
  if (now === BOOK_WHO) return;
  if (BOOK_WHO === 'device' && now !== 'device') {
    const may = typeof ansMayMove_ === 'function'
      ? ansMayMove_(draftKey_('book', 'form', 'device'), draftKey_('book', 'form', now)) : 'later';
    if (may === 'own' && bookBlank_()) bookBack_('device');
    if (may && !bookBlank_()) {
      /* THEIR OWN DRAFT FIRST, then the device's form joined to it. */
      try { bookJoin_(draftRead_('book', 'form', undefined, now)); } catch (e) {}
      bookKeep_();
      try {
        draftDrop_('book', 'form', 'device');
        BOOK_STEPS.forEach(st => { if (st.emails) bookEmailsCarry_(st, now); });
      } catch (e) {}
      return;
    }
  }
  resetBooking_(true);
  if (signingIn) BOOK_WHO = now; else bookBack_();
}
/* ---------- TWO FORMS OF ONE PERSON'S, PUT TOGETHER — `ansJoin_`'s rule (answers.js), for a form § */
function bookJoin_(raw) {
  if (raw === null || raw === undefined) return;
  let o = null;
  try { o = JSON.parse(raw); } catch (e) { return; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return;
  const plain = v => typeof v === 'string' || typeof v === 'number';
  const blank = v => ![].concat(v == null ? [] : v).join('').trim();
  Object.keys(o).forEach(k => {
    if (k === 'picking') return;
    const mine = o[k], here = BOOKING[k];
    if (Array.isArray(mine) && mine.every(plain)) {
      const list = mine.slice();
      [].concat(blank(here) ? [] : here).forEach(x => { if (!list.some(y => norm(y) === norm(x))) list.push(x); });
      const st = bookStep_(k);
      if (st && st.multi && typeof st.options === 'function') {
        try {
          const offered = (st.options() || []).map(norm);
          const at_ = x => { const i = offered.indexOf(norm(x)); return i === -1 ? offered.length : i; };
          list.sort((a, b) => at_(a) - at_(b));
        } catch (e) {}
      }
      BOOKING[k] = list;
    } else if (plain(mine) && !blank(mine)) {
      if (k === 'note') {
        const add = String(here == null ? '' : here).trim();
        BOOKING.note = !add || String(mine).indexOf(add) !== -1 ? String(mine) : String(mine).replace(/\s+$/, '') + '\n\n' + add;
      } else if (blank(here)) BOOKING[k] = mine;
    }
  });
}
/* THE ADDRESSES TYPED ON THE DEVICE'S FORM AND NOT YET LEFT, into the person's: § */
function bookEmailsCarry_(st, now) {
  const id = 'emails:' + st.id;
  const dev = draftRead_('book', id, undefined, 'device');
  if (dev === null) return;
  if (typeof ansMayMove_ === 'function' && !ansMayMove_(draftKey_('book', id, 'device'), draftKey_('book', id, now))) return;
  const mine = draftRead_('book', id, undefined, now);
  const all = [];
  [mine, dev].forEach(v => String(v == null ? '' : v).split(',').map(x => x.trim()).filter(Boolean)
    .forEach(x => { if (!all.some(y => norm(y) === norm(x))) all.push(x); }));
  /* `from` IS THE LIST THE BOX WILL BE DRAWN OVER (`stepInput_`), so the box draws this draft. */
  const saved = (BOOKING[st.id] || []).filter(x => String(x).trim()).join(', ');
  if (all.length) draftKeep_('book', id, all.join(', '), false, saved);
  draftDrop_('book', id, 'device');
}


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

/* ---------- AND THE SAME TOGGLE ONE GRID ALONG § */
on('book-block', el => {
  const when = el.dataset.when;
  const list = BOOKING.avail || [];
  const at = list.indexOf(when);
  if (at === -1) list.push(when); else list.splice(at, 1);
  BOOKING.avail = list;
  drawBooker();
});

/* `on('split-add')`, `on('split-set')` AND `on('split-done')` WERE HERE — the three handlers for
   the panel of email boxes. One text field replaced all of it; `book-emails` reads it. */


/* Answering one. A multi toggles, everything else replaces and moves on. */
/* ---------- A DROPDOWN ANSWERED § */
/* ---------- TICKING ONE ANSWER OF SEVERAL § */
/* ONLY THE CHOSEN CLIENT'S CHILDREN STAY TICKED — read off the Child question's own list, so the two cannot disagree. */
function bookKidsFor_() {
  const st = bookStep_('kids');
  let offered = [];
  try { offered = (st && st.options() || []).map(norm); } catch (e) {}
  BOOKING.kids = (BOOKING.kids || []).filter(k => offered.indexOf(norm(k)) !== -1);
  if (!BOOKING.kids.length) BOOKING.done = (BOOKING.done || []).filter(id => id !== 'kids');
}

function bookToggle_(step, v) {
  if (v) {
    const list = BOOKING[step.id] || [];
    const at = list.findIndex(x => norm(x) === norm(v));
    if (at === -1) list.push(v); else list.splice(at, 1);
    /* ---------- KEPT IN THE ORDER THE QUESTION OFFERS THEM, NOT THE ORDER THEY WERE TICKED § */
    try {
      const offered = (step.options() || []).map(norm);
      const at_ = x => { const i = offered.indexOf(norm(x)); return i === -1 ? offered.length : i; };
      list.sort((a, b) => at_(a) - at_(b));
    } catch (err) {}
    BOOKING[step.id] = list;
    if (step.set) step.set(list);
  }
  /* ANSWERED THE MOMENT THERE IS SOMETHING IN IT. § */
  BOOKING.done = uniq((BOOKING.done || []).concat([step.id]));
  if (!(BOOKING[step.id] || []).length) {
    BOOKING.done = (BOOKING.done || []).filter(id => id !== step.id);
  }
}

document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-set"]');
  if (!el) return;
  const step = bookStep_(el.dataset.step);
  if (!step) return;

  /* SEVERAL ANSWERS, ONE DROPDOWN LIKE THE REST (29 Oct): a pick adds the answer, a pick of a ticked one takes it off — `stepPick_`. */
  if (step.multi) {
    if (el.value && !stepLocked_(step)) bookToggle_(step, el.value);
    drawBooker();
    return;
  }
  /* AN OPTION THE LIST DREW DISABLED IS NOT TAKEN HOWEVER IT ARRIVES — a keyboard, an old browser
     that lets a disabled option through, a hand-built event. Said, and the row redrawn on what it
     held. */
  if (step.lock && step.lock()) { drawBooker(); return; }
  const no = step.off && el.value ? String(step.off(el.value) || '') : '';
  if (no) { toast(el.value + ' ' + no); drawBooker(); return; }
  BOOKING[step.id] = el.value || '';
  BOOKING.done = (BOOKING.done || []).filter(id => id !== step.id);

  /* WHAT THIS ANSWER DOES TO THE OTHERS IS THE STEP'S OWN `set` (book-steps.js), never a branch here. */
  if (step.set) step.set(BOOKING[step.id]);

  drawBooker();
});
/* ---------- CHOOSING A CLASS ANSWERS FOUR OTHER QUESTIONS (the `joining` step's `set`) § */
function joiningSet_() {
  const j = joinedJob_();
  BOOKING.subjects = j && j.subject ? [j.subject] : [];
  BOOKING.level    = (j && j.level) || '';
  BOOKING.loc      = (j && (j.location || j.venue)) || '';
  BOOKING.n        = j ? '1' : '';
  ['subjects', 'level', 'loc', 'n'].forEach(id => {
    BOOKING.done = j ? uniq((BOOKING.done || []).concat([id]))
                     : (BOOKING.done || []).filter(x => x !== id);
  });
}



/* NO REDRAW. Every other control on the paper changes what the receipt says, so it repaints; this
   one changes nothing but itself, and repainting would take the cursor out of the box the moment
   somebody clicked away mid-sentence. */
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-note"]');
  if (el) BOOKING.note = el.value || '';
});
/* AND AS IT IS TYPED, into the form's draft (`bookKeep_`) — still no redraw, for the reason above: a
   reload mid-sentence used to lose a note nobody had clicked away from yet (317). */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-note"]');
  if (!el) return;
  BOOKING.note = el.value || '';
  bookKeep_();
});

/* ---------- THE SPLIT, TYPED § */
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-emails"]');
  if (!el) return;
  const step = bookStep_(el.dataset.step);
  if (!step) return;
  const list = String(el.value || '').split(',').map(x => x.trim()).filter(Boolean);
  BOOKING[step.id] = list;
  /* AN ANSWER NOW, SO NO LONGER A DRAFT OF ITS OWN — `BOOKING`'s draft has it (`stepInput_`). */
  try { draftDrop_('book', 'emails:' + step.id); } catch (err) {}
  BOOKING.done = list.length
    ? uniq((BOOKING.done || []).concat([step.id]))
    : (BOOKING.done || []).filter(id => id !== step.id);
  drawBooker();
});


/* THE CARD. Photographs, then every priced row, then the dates, then where it stands. § */
/* THE ROWS OF THE RECEIPT, AS DATA. § */
/* THE TERM RUNNING TODAY, holidays aside — one rule for the waiting list and for "Rest of this term". */
function runningTerm_(list, now) {
  const dt = v => parseDMY(v);
  return (list || []).filter(t => norm(t.kind) !== 'holiday')
    .find(t => dt(t.opensOn) && dt(t.closesOn) && now >= dt(t.opensOn) && now <= dt(t.closesOn)) || null;
}

/* REST OF THIS TERM (owner, 11 Nov): the running term from today; `computeSessionDates` counts its sessions as for any term. */
function restInterval_(list, today) {
  const now = today ? new Date(today) : new Date();
  now.setHours(0, 0, 0, 0);
  const t = runningTerm_(list, now);
  if (!t || !(now > parseDMY(t.opensOn))) return null;
  const end = parseDMY(t.closesOn);
  const dmy = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  return Object.assign({}, t, {
    label: 'Rest of this ' + (norm(t.kind) === 'half-term' ? 'half term' : 'term'),
    rest: t.label || t.term, opensOn: dmy, startDate: dmy,
    weeks: Math.max(1, Math.ceil((end - now + 864e5) / (7 * 864e5))),
  });
}

/* ---------- WHICH TERM A WAITING LIST IS FOR § */
function waitTerm_() {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const terms = intervals_().filter(t => norm(t.kind) !== 'holiday');
  const dt = v => parseDMY(v);
  const running = runningTerm_(terms.filter(t => !t.rest), now);
  const next = terms.filter(t => dt(t.opensOn) && dt(t.opensOn) > now)
    .sort((a, b) => dt(a.opensOn) - dt(b.opensOn))[0];
  return running || next || null;
}

/* HOW MANY FAMILIES ARE SPLITTING IT, IN ONE WORDING. § */
function familiesSay_(n) {
  const k = Math.max(1, Number(n) || 1);
  /* ONE FAMILY IS NOT A SPLIT, AND "1 family" ON A ROW CALLED `Shared by` READS AS A FAULT. § */
  if (k === 1) return 'Just you';
  return k + ' families';
}

/* THE WAITING LIST'S ROWS, after `For`: a seat's price shared, the term's estimate, the stages. */
function waitBreakdownRows_(rows, push) {
  const w = bookPrice();
  if (!w) return rows;
  /* WHAT KIND OF THING THIS IS, FIRST. § */
  push('Kind', 'Waiting list class', '', '', '', { free: true });
  push('A seat', esc(BOOKING.loc || 'no venue'), '', perHour_(w.chargePerHour),
    money_(w.perSeatSession), { end: true, step: 'loc' });
  push('Shared by', familiesSay_(w.seats), '', '', '', { free: true });
  push('Per session', esc(w.hours) + ' hours', '', '', '', { free: true });

  const term = waitTerm_();
  if (term) {
    /* ---------- `Running`, `Weeks left` AND A `For` HOLDING THE TERM WERE ALL HERE § */
    /* ---------- AND WHAT THE TERM WOULD COME TO § */
    if (term.weeks) {
      push('About', esc(term.weeks) + ' × ' + money_(w.perSeatSession),
        '', '', money_(w.perSeatSession * term.weeks), { est: true });
    }
  }

  /* THE FIVE STAGES, NONE OF THEM TICKED — for the same reason as the ones on the ordinary form below, and a waiting list nobody has joined is not a special case. § */
  stageRows_(null).forEach(r => rows.push(r));
  return rows;
}

function breakdownRows(L) {
  const fmt = { esc, pct: x => x };
  const rows = [];
  let line = 0;
  const push = (k, v, mul, rate, total, opts) => rows.push(Object.assign({
    n: (opts && opts.free) ? '' : String(++line).padStart(3, '0'),
    k, v: v || '', mul: mul || '', rate: rate || '', total: total || '',
  }, opts || {}));

  /* ---------- WHO IT IS FOR, AT THE TOP § */
  /* READ FROM THE BOOKING, NOT FROM `L`. § */
  /* ---------- "NOBODY YET" IS AN ANSWER, NOT A NAME § */
  const forWhom = BOOKING.client === NOBODY ? '' : (BOOKING.client || (USER && USER.name) || '');
  if (forWhom) push('For', esc(displayName_(forWhom)), '', '', '', { free: true, who: true });

  /* ---------- A WAITING LIST HAS A DIFFERENT BREAKDOWN, AND WAS SHOWN THE WRONG ONE § */
  if (isWaiting_()) return waitBreakdownRows_(rows, push);

  ['rate', 'shape'].forEach(group => {
    const inGroup = PRICE_ROWS.filter(r => r.group === group);

    if (group === 'shape') {
      bookRuns().forEach(r => {
        push(day_(r.dayName), hours_(r.hour, r.hour + r.hours), '', '', '',
          { day: true, step: 'slots', hours: r });
      });
      /* ---------- `Hours a week` WAS THE THIRD ROW TO SAY THE SAME THING § */
    }

    inGroup.forEach((r, gi) => {
      if (r.show && !r.show(L)) return;
      const c = priceCells(r, L, fmt);
      const plain = r.value
        ? String(r.value(L)).replace(/<span class="note">[\s\S]*?<\/span>/g, '')
                            .replace(/<[^>]*>/g, '').trim()
        : '';
      const asked = { base: 'tutor', subject: 'subjects', level: 'level', students: 'n',
                      venue: 'loc', host: 'hosting', term: 'interval',
                      split: 'split' }[r.key];
      /* AN UNANSWERED ROW SHOWS A DASH, the same as one on the unpriced card — see `stepRows_`. § */
      /* THE SAME DROPDOWN THE UNPRICED CARD USES. § */
      const st = asked ? bookStep_(asked) : null;
      const sel = st ? stepControl_(st) : '';
      push(r.row || r.label, plain || (asked ? dash_() : ''), c.mul, c.rate, c.total,
        /* ---------- `step` IS ALWAYS THE STEP, EVEN WHEN THE ROW HAS A CONTROL § */
        /* ---------- NO WEEK HANGS OFF A PRICED ROW ANY MORE § */
        { end: gi === inGroup.length - 1, step: asked, key: r.key, sel: sel });
      /* THE ROOM IS NOT THE FAMILY'S TO PICK (owner, 7 Nov): staff set it after booking (`setRoom`). */
      if (r.key === 'venue') push('Room', 'set by us after booking', '', '', '', { free: true });
    });
  });

  /* ---------- AND THE COUNT OF FAMILIES IS ON BOTH DOCUMENTS NOW § */
  push('Shared by', familiesSay_(L.splitShares), '', '', '', { free: true });

  /* ---------- AND IT IS EVERY DATE AGAIN, WHICH IS THE OWNER'S CALL AND THE SECOND TIME ROUND § */
  /* ---------- AND HOW MANY OF THEM THERE ARE GOES IN THE COLUMN THAT COUNTS § */
  const dates = (L.sessionDates || []).map(d => date_(d));
  /* NO "× sessions" HERE (owner, 7 Nov): Term's weeks × the week's hours is the one period multiplier the sum uses. */
  push('Dates', dates.length ? dates.join(', ') : dash_(), '', '', '', { free: true, dates: true });

  /* ---------- WHERE THIS ONE IS, TOO § */
  stageRows_(null).forEach(r => rows.push(r));
  /* ---------- THREE ROWS SAYING THE SAME NOTHING § */
  return rows;
}

/* ---------- A ROW IS ITS OWN QUESTION § */
function stepSelect_(st) {
  const opts = st.options().filter(Boolean);
  /* WHAT A LOCKED MULTI HAS TICKED — the one reason a multi reaches this function. */
  const chosen = st.multi ? (BOOKING[st.id] || []) : [];
  /* ---------- A FALLBACK HAS TO REACH THE CONTROL, NOT ONLY THE TEXT § */
  /* READ ONCE, BECAUSE TWO PLACES IN THIS FUNCTION WANT IT: the value a single-answer control opens
     on and the text a LOCKED row prints. It was inlined into the first alone, so a locked multi never
     saw it — see the note below. */
  const fb = st.fallback ? String(st.fallback() || '') : '';
  const v = st.multi ? '' : (BOOKING[st.id] || fb);

  /* ---------- A SETTLED ANSWER IS TEXT, NOT A CONTROL § */
  if (stepLocked_(st)) {
    const said = st.emails
      ? (BOOKING[st.id] || []).filter(x => String(x).trim()).join(', ')
      /* ---------- AND A LOCKED MULTI HAD NO FALLBACK EITHER § */
      : st.multi ? (chosen.join(', ') || fb)
      : (st.label_ && v ? st.label_(v) : v);   /* `v` already carries the fallback — see above */
    return `<span class="bk-set">${esc(String(dash_(said)))}</span>`;
  }
  const isOn = o => norm(o) === norm(v);
  /* ---------- THE BLANK OPTION DOES NOT REPEAT AN ANSWER ON THE LIST § */
  const said = o => String(st.label_ ? st.label_(o) : o);
  const dup = !!fb && opts.some(o => norm(said(o)) === norm(fb));
  /* DISABLED, NOT ABSENT. The row keeps its height, its label and its answer; only the pointer
     changes. A form whose rows come and go cannot be learnt. */
  /* A `lock` (the home seat count) greys the select but keeps it, so the fixed value still shows. */
  const off = stepLocked_(st) || !!(st.lock && st.lock());
  /* AN OPTION THAT CANNOT BE TAKEN IS DRAWN AND DISABLED, its reason beside its name — see `off` on
     the tutor step. The one already chosen is left pressable, so the row can show it. */
  const noOf = o => st.off ? String(st.off(o) || '') : '';
  const words = o => said(o) + (noOf(o) ? ' · ' + noOf(o) : '');
  const blank = dup ? dash_() : dash_(fb);
  const sel = `<select class="bk-sel" id="${bkCtl_(st.id)}" data-do="book-set" data-step="${esc(st.id)}"
      ${off ? 'disabled' : ''} aria-label="${esc(st.label)}">
    <option value=""${!v || !opts.some(isOn) ? ' selected' : ''}>${esc(blank)}</option>
    ${opts.map(o => `<option value="${esc(o)}"${isOn(o) ? ' selected' : ''}${
        noOf(o) && !isOn(o) ? ' disabled' : ''}>${esc(words(o))}</option>`).join('')}
  </select>`;
  /* ---------- AN ANSWER TOLD APART BY ITS END IS DRAWN IN WORDS, WITH THE SELECT LAID OVER THEM § */
  if (!st.wrap) return sel;
  const picked = opts.filter(isOn).pop();
  return `<span class="bk-face"><span class="bk-said" aria-hidden="true">${
    esc(picked !== undefined ? words(picked) : blank)}</span>${sel}</span>`;
}

/* ---------- THE NOTE IS A ROW LIKE THE REST § */
function noteRow_() {
  return { n: '', k: 'Note', v: '', mul: '', rate: '', total: '', step: '',
    ctl: bkCtl_('note'),
    sel: `<input class="bk-in bk-in-l" id="${bkCtl_('note')}" type="text" data-do="book-note"
      value="${esc(BOOKING.note || '')}" placeholder="anything else we should know"
      aria-label="Anything else we should know">` };
}

/* ---------- TYPING INTO A ROW § */
function stepInput_(st) {
  const v = (BOOKING[st.id] || []).filter(x => String(x).trim()).join(', ');
  /* `readonly`, NOT `disabled`. A locked text box should still be readable and selectable — somebody
     joining a class may well want to copy the addresses already on it. */
  /* THE ADDRESSES AS TYPED ARE A DRAFT of their own (data.js; 317) until `change` makes them answers — typed and reloaded before leaving the box, they were not in § */
  return `<input class="bk-in" id="${bkCtl_(st.id)}" type="text" data-do="book-emails" data-step="${esc(st.id)}"
    value="${esc(draftVal_('book', 'emails:' + st.id, v))}"${draftAttr_('book', 'emails:' + st.id, v)} placeholder="—" aria-label="${esc(st.label)}"
    ${stepLocked_(st) ? 'readonly' : ''} autocomplete="off" spellcheck="false">`;
}

/* ---------- SEVERAL ANSWERS, THE SAME DROPDOWN AS ONE § */
function stepPick_(st) {
  let opts = [];
  try { opts = (st.options() || []).filter(Boolean); } catch (e) {}
  const chosen = BOOKING[st.id] || [], on = o => chosen.some(c => norm(c) === norm(o));
  const said = o => String(st.label_ ? st.label_(o) : o);
  const fb = st.fallback ? String(st.fallback() || '') : '';
  const face = chosen.map(said).join(', ') || fb || dash_();
  return `<span class="bk-face${chosen.length ? ' is-set' : ''}"><span class="bk-said" aria-hidden="true">${esc(face)}</span><select class="bk-sel"
    id="${bkCtl_(st.id)}" data-do="book-set" data-step="${esc(st.id)}" aria-label="${esc(st.label)}">
    <option value="" selected>${esc(face)}</option>
    ${opts.map(o => `<option value="${esc(o)}">${on(o) ? '✓ ' : ''}${esc(said(o))}</option>`).join('')}
  </select></span>`;
}

/* ON THE SCREEN YOU ARE ON, ON THE PAGE IN FRONT OF YOU. § */
function dropOnFront_(row) {
  const host = row.closest('.screen');
  if (!host || host.id !== 's-' + AT) return false;
  /* WHICH PAGE, OFF `PAGE` RATHER THAN OFF `.page.on`. § */
  const page = row.closest('.page');
  if (page) {
    const kids = host.querySelectorAll(':scope > .page');
    const pos = Array.prototype.indexOf.call(kids, page);
    const p = typeof logIndex_ === 'function' ? logIndex_(AT, pos) : pos;
    if (p !== (PAGE[AT] || 0)) return false;
  }
  return true;
}

/* ---------- THE ROW'S LABEL IS THE ROW'S CONTROL'S LABEL § */
const bkCtl_ = id => 'bk-ctl-' + String(id || '').replace(/[^\w-]/g, '');
document.addEventListener('click', e => {
  if (e.defaultPrevented) return;
  const lab = e.target && e.target.closest && e.target.closest('label.bk-k[for]');
  const sel = lab && lab.control;
  if (!sel || sel.tagName !== 'SELECT' || sel.disabled || typeof sel.showPicker !== 'function') return;
  try { sel.showPicker(); } catch (err) { /* not rendered, or no activation: the label's focus stands */ }
});

/* ---------- AND THE LIST JUST OPENED IS BROUGHT ONTO THE SCREEN § */
function tickListShow_(find, still) {
  const fit = () => {
    const got = find();
    const list = got && got.list, head = (got && got.head) || list;
    const pane = list && list.closest('.pane');
    if (!pane || (still && !still()) || pane.scrollHeight <= pane.clientHeight) return;
    const pr = pane.getBoundingClientRect(), lr = list.getBoundingClientRect(), hr = head.getBoundingClientRect();
    const by = Math.min(lr.bottom - pr.bottom + 8, hr.top - pr.top - 8);
    if (by > 1) pane.scrollTop += by;
  };
  setTimeout(fit, 120);
  setTimeout(fit, 420);
}
/* EVERY `<select>` IS THE PLATFORM'S OWN AGAIN THE OWNER, 9 OCTOBER: § */

/* ---------- ELEVEN HOURS, SAID ONCE § */
function slotHead_(hours) {
  return `<div class="slot-row slot-head" aria-hidden="true">
    <span class="slot-day"></span>
    <div class="slot-hours">
      ${hours.map(h => `<span class="slot-hh">${h}</span>`).join('')}
    </div>
  </div>`;
}

/* ---------- AND THE WEEK ROUND IT, BECAUSE THERE WERE THREE OF THESE § */
/* ---------- THE WEEK AS SEVEN ROWS OF THE CARD, NOT ONE BLOCK UNDER ONE ROW § */
function weekRows_(days, cell, opts) {
  const o = opts || {};
  const cols = ((days[0] || {}).hours || []).map(h => (typeof h === 'object' ? h.h : h));
  /* THE WEEK'S HOURS, ONCE (the grid's own, owner 7 Nov): four boxes ticked over two days is × 4, the hours a week
     `priceFrom` multiplies by, never × 2 twice (docs/history/525). */
  const week = days.reduce((n, d) => n + (Number(d.mul) || 0), 0);
  /* ON THE LAST TICKED DAY (owner, 8 Nov): × 4 on an empty Monday read as Monday's; it closes the week's ticks instead. */
  const last = days.reduce((at, d, i) => (Number(d.mul) > 0 ? i : at), 0);
  return days.map((d, i) => ({
    n: '', k: day_(d.label), v: '',
    /* ---------- HOW MANY HOURS THE WEEK IS, IN THE COLUMN THAT MULTIPLIES § */
    mul: (i === last && week) ? '\u00d7 ' + week : '', rate: '',
    total: (i === last && week && o.total) ? o.total : '',
    /* THE STEP EVERY ONE OF THESE ROWS BELONGS TO. `bookBreakdown` matches a price line to its
       question on `id`, and seven rows answering one question all carry the same one. */
    id: o.id || '',
    /* ---------- THE ANSWER IS DRAWN, NOT WRITTEN § */
    /* ---------- AND A TEN-COLUMN STRIP HAS NO ROOM TO LETTER EVERY COLUMN § */
    strip: (i === 0 ? (o.ruler
              ? '<span class="wk-hh wk-rule" aria-hidden="true">'
                + esc(String(cols[0])) + ' \u2013 ' + esc(String(cols[cols.length - 1])) + '</span>'
              : '<span class="wk-hh" aria-hidden="true">'
                + cols.map(h => '<span class="slot-hh">' + esc(String(h)) + '</span>').join('')
                + '</span>') : '')
      + '<span class="slot-hours">' + d.hours.map(h => cell(h, d)).join('') + '</span>',
    /* A DAY WITH NOTHING OPEN COLLAPSES. § */
    shut: !!d.shut,
    off: !!o.off,
    /* ---------- ONE SENTENCE, UNDER THE LAST DAY § */
    say: (i === days.length - 1 && o.say) ? { text: String(o.say), warn: false } : null,
  }));
}

/* A DAY IS ITS SHORT NAME, Mon to Sun, everywhere (owner, 8 Nov). */
function weekGrid_(days, cell) {
  const cols = ((days[0] || {}).hours || []).map(h => (typeof h === 'object' ? h.h : h));
  return `<div class="slot-grid">
    ${slotHead_(cols)}
    ${/* ---------- NO DAY HERE COLLAPSES ANY MORE, SO THIS NO LONGER DRAWS ONE § */
          ''}
    ${days.map(d => `<div class="slot-row">
      <span class="slot-day">${esc(day_(d.label))}</span>
      <div class="slot-hours">${d.hours.map(h => cell(h, d)).join('')}</div>
    </div>`).join('')}
  </div>`;
}

/* ---------- THE WAITING LIST'S WEEK, IN BLOCKS § */
function blockWeekRows_() {
  const on = BOOKING.avail || [];
  /* ---------- `is-blocks` HAS GONE AND `blk` HAS NOT § */
  return weekRows_(
    SLOT_DAYS.map(([, label]) => ({
      label: label,
      /* `h` IS WHAT THE HEADER GETS — the hour number on the other two weeks and the block's name
         here, which is the one thing that differs in the strip above the first row. */
      hours: SLOT_BLOCKS.map(b => ({ h: b.head, block: b, day: label })),
    })),
    (c) => {
      const phrase = blockPhrase_(c.day, c.block);
      /* THE PHRASE ITSELF, not a code. § */
      return tile_({ form: true, look: 'hr blk' + (on.indexOf(phrase) !== -1 ? ' on' : ''), title: phrase, aria: phrase, act: 'book-block', data: { when: phrase }, html: '' });
    },
    { id: 'avail' });
}

/* ---------- THE WEEK, ON THE PAPER § */
function stepWeekRows_(st) {
  /* ---------- ALWAYS DRAWN § */
  if (!st.grid) return [];

  /* ---------- ONE WEEK ON THE CARD, AND WHICH ONE DEPENDS ON THE BRANCH § */
  if (st.grid === 'blocks') return isWaiting_() ? blockWeekRows_() : [];
  if (isWaiting_()) return [];

  const g = slotGrid();
  const on = BOOKING.slots || [];
  const off = stepLocked_(st);
  /* `g.days`, NOT `g.rows`: § */
  return weekRows_(
    g.days.map(r => ({ label: r.label, hours: r.hours, shut: !r.hours.some(h => h.open),
                       /* THE TICKS THEMSELVES, counted where they are read. */
                       mul: r.hours.filter(h => on.indexOf(h.code) !== -1).length })),
    /* THE REASON, not just "not available": an hour never worked and an hour already taught are the same grey box; only the second is worth another week. */
    (h, d) => tile_({ form: true, look: 'hr' + (on.indexOf(h.code) !== -1 ? ' on' : '') + ((h.open && !off) ? '' : ' shut'), off: !(h.open && !off),
      title: h.h + ':00' + (h.why ? ' — ' + h.why : h.open ? '' : ' — not available'),
      aria: d.label + ' ' + h.h + ':00' + (h.open ? '' : ', ' + (h.why || 'not available')), act: 'book-slot', data: { code: h.code }, html: '' }),
    { id: st.id, off: off, ruler: true,
      /* ---------- A WEEK NOBODY IS FREE FOR IS STILL DRAWN § */
      /* NO SENTENCE WHILE ANY HOUR IS OPEN (owner, 8 Nov): the grey cells say it; only an empty grid needs words. */
      say: g.why,
      /* THE WEEK'S RUNNING TOTAL, in the last column like every priced line (owner, 8 Nov). */
      total: weekTotal_() });
}

/* RATE × HOURS A WEEK, bare like every running total (a unit overflowed the column at 390px); blank until there is a rate and an hour to multiply. */
function weekTotal_() {
  try {
    const L = bookPrice();
    if (!L || !L.hoursPerWeek || !L.chargeRate || childView_()) return '';
    return money_(runningAfter('hoursweek', L));
  } catch (e) { return ''; }
}

/* Which steps open something under their row rather than answering in it. */
/* ---------- A FIELD THAT CANNOT BE ANSWERED IS SHOWN, NOT REMOVED § */
const FIXED_BY_CLASS = ['subjects', 'level', 'loc', 'n'];

function stepLocked_(st) {
  if (joinedJob_() && FIXED_BY_CLASS.indexOf(st.id) !== -1) return true;
  try { return !(st.grid || st.emails || st.options().filter(Boolean).length); }
  catch (e) { return true; }
}

/* The control a row carries. § */
function stepControl_(st) {
  if (st.grid) return '';
  if (st.emails) return stepInput_(st);
  /* A QUESTION TAKING SEVERAL ANSWERS IS THE SAME DROPDOWN — see `stepPick_`. A locked one falls through to the text
     `stepSelect_` draws for a settled answer. */
  if (st.multi && !stepLocked_(st)) return stepPick_(st);
  return stepSelect_(st);
}

/* ---------- EVERY QUESTION AS A ROW, ANSWERED OR NOT § */
/* WHICH OF THE FORM'S TWO BRANCHES THIS IS, in one place. § */
function bookOn_() { return isWaiting_() ? 'wait' : 'book, tutoring'; }

function stepRows_() {
  let line = 0;
  /* ONE FILTER, AND IT IS NOT ABOUT WHETHER A QUESTION CAN BE ANSWERED YET — see `stepLocked_` for why a question with nothing to offer is greyed rather than § */
  const on = bookOn_();
  return BOOK_STEPS
    .filter(st => onlyHas_(st.only, on))
    /* ---------- ONE STEP IS NOT ALWAYS ONE ROW § */
    .flatMap(st => {
      if (st.week) return stepWeekRows_(st);
      const v = BOOKING[st.id];
      const text = st.emails
        ? ((BOOKING.split || []).filter(x => String(x).trim()).join(', '))
        : st.grid === 'blocks'
        /* GROUPED — see `blockSay_`. The stored list is one phrase per cell and this is the
           sentence they add up to, which is the same split the hour grid makes between `m13, m14`
           and `Monday 13:00–15:00`. */
        ? blockSay_(v)
        : st.grid
        /* ---------- THE WHOLE RUN, NOT ITS START § */
        ? bookRuns().map(r => day_(r.dayName) + ' ' + hours_(r.hour, r.hour + r.hours))
            .join(', ')
        /* A MULTI WITH NOTHING TICKED FALLS BACK LIKE ANY OTHER STEP. § */
        : st.multi ? ((v || []).join(', ') || (st.fallback ? st.fallback() : ''))
        /* ---------- A QUESTION WITH AN OBVIOUS ANSWER SHOWS IT § */
        : (st.label_ ? st.label_(v) : (v || (st.fallback ? st.fallback() : '')));
      return [{ n: String(++line).padStart(3, '0'),
               k: st.short || st.id,
               /* AN EM DASH, NOT AN EMPTY CELL. A blank looks like a row that failed to draw; a
                  dash looks like a blank somebody is expected to fill, which is what it is. */
               v: String(dash_(text)),
               mul: '', rate: '', total: '',
               /* THE STEP THIS ROW STANDS FOR. § */
               id: st.id,
               sel: stepControl_(st),
               /* THE CONTROL THE ROW'S LABEL IS FOR — see `bkCtl_`. Only when one was drawn: a locked
                  row is text and a grid row has none, and a `for` naming nothing is a label that lies. */
               ctl: st.grid ? '' : st.emails || !stepLocked_(st) ? bkCtl_(st.id) : '',
               /* ---------- `why` WAS WRITTEN OUT ON FOUR STEPS AND DRAWN NOWHERE § */
               say: (() => {
                 /* ---------- NOTHING IS SAID ABOUT AN ANSWER NOBODY HAS GIVEN § */
                 const answered = st.multi ? (v || []).length
                   : String(v == null ? '' : v).trim() !== '';
                 /* ---------- AND NOTHING IS SAID ABOUT A QUESTION THIS BRANCH CANNOT ASK § */
                 if (!answered || stepLocked_(st)) return null;
                 const w = st.why ? String(st.why(v) || '') : '';
                 return w ? { text: w, warn: true } : null;
               })() }];
    });
}

/* `BOOK_ROWS` STOOD HERE and it was a list the card kept for something else to read. § */

