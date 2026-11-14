/* ---------- THE BOOKING FORM, MADE STABLE (owner, 12 Nov): an admin books a client in each of the four class variations, through Send, on the one card. */
const BS_DMY_ = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
/* A HALF TERM RUNNING TODAY, so `Rest of this half term` is offered and dates are counted whatever day the suite runs. */
const BS_TERM_ = () => {
  const a = new Date(); a.setDate(a.getDate() - 20);
  const b = new Date(); b.setDate(b.getDate() + 40);
  return { rel: 'Current', term: 'Half A', label: 'Half A', kind: 'half-term', weeks: 9,
    startDate: BS_DMY_(a), endDate: BS_DMY_(b), opensOn: BS_DMY_(a), closesOn: BS_DMY_(b), lastSun: BS_DMY_(b), dateFault: '' };
};
const BS_JOBS_ = () => [
  { id: 'J-C', jobId: 'J-C', kind: '', subject: 'Maths', level: 'GCSE', location: 'Colliers Wood Library — Small room 1',
    venue: 'Colliers Wood Library — Small room 1', weekday: 'Tuesday', time: '16:00', maxKids: 4, currentKids: 1, canAsk: true },
  { id: 'J-W', jobId: 'J-W', kind: 'waitlist', subject: 'English', level: 'GCSE', location: 'Colliers Wood Library',
    venue: 'Colliers Wood Library', maxKids: 4, currentKids: 2 },
];
/* THE BOOKING AS THE ADMIN BUILDS IT ON FIND (owner, 13 Nov): each question a step of tags, answered by tapping one; `draw` is the summary card. */
async function bsForm_() {
  const { w, sent } = boot();
  await wait(300);
  const t = w.__t, d = w.document, D = t.DATA();
  t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
  D.clients = [{ name: 'Pat Parent', children: ['Kim', 'Lou'] }];
  D.intervals = [BS_TERM_()];
  /* PRICED AS THE LIVE SHEET IS: an extra child's share (`c`) and the business's cut (`B`), so seats and a discount move the price. */
  D.constants = D.constants || { vars: {} }; Object.assign(D.constants.vars, { c: 0.5, B: 0.3 });
  D.liveJobs = BS_JOBS_(); D.jobs = D.liveJobs;
  /* A VENUE WITH ROOMS, as the live one has: the form offers `Venue — Room`. */
  (D.venues || []).forEach(v => { if (v.title === 'Colliers Wood Library') v.rooms = [{ name: 'Small room 1', rate: 12, min: 1, max: 6 }, { name: 'Large room 1', rate: 14, min: 1, max: 10 }]; });
  w.eval('resetBooking_()');
  /* EVERY ANSWER FROM EMPTY, as the form's journeys had it: what the site prefills (`bookPrefill_`) is left out. */
  t.inApp('BOOK_PREFILLED = true');
  const bf = await bookFind_(w);
  const host = d.createElement('div'); d.body.appendChild(host);
  const draw = () => { host.innerHTML = w.eval('bookerCard()'); return host; };
  const pick = (id, v) => bf.pick(id, v);
  const label = j => w.eval('openClassLabel_')(j);
  return { w, t, d, sent, host, draw, pick, label, D, bf, hour: bf.hour };
}
/* NO NaN, undefined OR BLANK WHERE A VALUE IS EXPECTED, anywhere on the drawn form. */
function bsScan_(host, where) {
  const bad = [];
  const txt = host.textContent || '';
  const odd = txt.match(/NaN|undefined|\bnull\b|\[object|Infinity|£-/g);
  if (odd) bad.push(where + ': the form says ' + [...new Set(odd)].join(', '));
  host.querySelectorAll('input, select').forEach(el => { if (/undefined|NaN|null/.test(String(el.value))) bad.push(where + ': ' + (el.id || el.name) + ' holds ' + el.value); });
  host.querySelectorAll('.bk-row').forEach(r => {
    const k = ((r.querySelector('.bk-k') || {}).textContent || '').trim();
    if (!k || r.classList.contains('is-head')) return;
    const v = r.querySelector('.bk-v'), tot = r.querySelector('.bk-t');
    const empty = v && !v.textContent.trim() && !v.querySelector('select, input, .bk-tick, .tile, span[class]') && !(tot && tot.textContent.trim());
    if (empty) bad.push(where + ': the ' + k + ' row is blank');
  });
  if (!host.querySelector('.card.kc.kc-bookform')) bad.push(where + ': the form is not a card on the one template');
  const tag = host.querySelector('.kc-tags .qtag');
  if (!tag || tag.textContent.trim() !== 'Your booking') bad.push(where + ': the first tag is not the summary\'s name');
  const first = host.querySelector('.kc-act .tile');
  if (!first || first.getAttribute('data-do') !== 'book-send') bad.push(where + ': the round row does not lead with Send');
  return bad;
}
const bsSend_ = async f => {
  f.sent.length = 0;
  const el = f.draw().querySelector('[data-do="book-send"]');
  if (!el) return null;
  f.t.ACTIONS['book-send'](el);
  await wait(300);
  return f.sent;
};

check('Booking form: an admin CREATES a class for a client — every question answered on the card, priced with dates and a discount, then Send asks createJob for the client', async () => {
  const f = await bsForm_(), bad = [];
  const tutor = ((f.D.tutors || []).find(x => x.title && x.listed !== false) || {}).title || '';
  for (const [id, v] of [['client', 'Pat Parent'], ['how', 'Instant class'], ['joining', 'Start a new one'], ['subjects', 'Maths'], ['level', 'GCSE'],
    ['tutor', tutor], ['n', '2'], ['loc', 'Colliers Wood Library — Small room 1'], ['hosting', 'No'], ['interval', 'Rest of this half term'], ['kids', 'Kim']]) {
    const no = await f.pick(id, v); if (no) bad.push(no);
  }
  for (const c of ['m16', 'm17']) { const no = await f.hour(c); if (no) bad.push(no); }
  const disc = f.draw().querySelector('[data-do="book-disc"]');
  disc.value = '10'; disc.dispatchEvent(new f.w.Event('change', { bubbles: true }));
  const L = f.t.price();
  if (!L || !(L.total > 0) || !(L.sessionDates || []).length) bad.push('the class is not priced with dates: ' + JSON.stringify(L && { total: L.total, dates: (L.sessionDates || []).length }));
  bad.push(...bsScan_(f.draw(), 'create'));
  const sent = await bsSend_(f);
  const b = (sent || []).find(x => x.action === 'createJob');
  if (!b) return bad.concat(['Send posted ' + JSON.stringify((sent || []).map(x => x.action))]);
  if (b.clientName !== 'Pat Parent') bad.push('the booking was filed for ' + JSON.stringify(b.clientName) + ', not the client chosen');
  if (b.slots !== 'm16,m17' || b.subject !== 'Maths' || b.n !== '2' || b.discountValue !== '10' || !(Number(b.price) > 0)) bad.push('createJob carried ' + JSON.stringify({ slots: b.slots, subject: b.subject, n: b.n, disc: b.discountValue, price: b.price }));
  if ('splitEmails' in b) bad.push('Split is gone, yet createJob still sends splitEmails');
  if ((f.t.BOOKING.slots || []).length) bad.push('the form was not fresh after Send');
  return bad;
});

check('Booking form: an admin JOINS a running class for a client, part way through — the class answers four questions, Send asks to join it', async () => {
  const f = await bsForm_(), bad = [];
  for (const [id, v] of [['client', 'Pat Parent'], ['how', 'Instant class'], ['joining', f.label(BS_JOBS_()[0])], ['interval', 'Rest of this half term']]) {
    const no = await f.pick(id, v); if (no) bad.push(no);
  }
  const B = f.t.BOOKING;
  if (B.subjects.join() !== 'Maths' || B.level !== 'GCSE' || B.loc !== 'Colliers Wood Library — Small room 1') bad.push('joining did not answer the class\'s questions: ' + JSON.stringify({ s: B.subjects, l: B.level, loc: B.loc }));
  if ((await f.bf.offers('subjects')).length) bad.push('the class\'s subject is still a step to answer');
  bad.push(...bsScan_(f.draw(), 'join'));
  const sent = await bsSend_(f);
  const m = (sent || []).find(x => x.action === 'move');
  if (!m || m.move !== 'Request' || m.jobId !== 'J-C') bad.push('Send posted ' + JSON.stringify(sent));
  return bad;
});

check('Booking form: an admin STARTS a waiting-list class — Nobody yet, a place and when they could come; Send opens the list', async () => {
  const f = await bsForm_(), bad = [];
  for (const [id, v] of [['how', 'Waiting list class'], ['client', 'Nobody yet — just open it'], ['joining', 'Start a new one'], ['subjects', 'Maths'], ['level', 'GCSE'], ['loc', 'Mitcham library']]) {
    const no = await f.pick(id, v); if (no) bad.push(no);
  }
  const blk = (await f.bf.tags('avail'))[0];
  if (!blk) bad.push('no Morning/Afternoon/Evening step on a waiting list');
  else f.t.ACTIONS['book-block'](blk);
  bad.push(...bsScan_(f.draw(), 'start waitlist'));
  const sent = await bsSend_(f);
  const b = (sent || []).find(x => x.action === 'openWaitlist');
  if (!b || b.venue !== 'Mitcham library' || !b.availability) bad.push('Send posted ' + JSON.stringify(sent));
  return bad;
});

check('Booking form: an admin puts a client on a WAITING-LIST class already open — Send joins that list', async () => {
  const f = await bsForm_(), bad = [];
  for (const [id, v] of [['how', 'Waiting list class'], ['client', 'Pat Parent'], ['joining', f.label(BS_JOBS_()[1])]]) {
    const no = await f.pick(id, v); if (no) bad.push(no);
  }
  if (f.t.BOOKING.loc !== 'Colliers Wood Library') bad.push('the list\'s venue was not taken: ' + f.t.BOOKING.loc);
  const blk = (await f.bf.tags('avail'))[0];
  if (blk) f.t.ACTIONS['book-block'](blk);
  bad.push(...bsScan_(f.draw(), 'join waitlist'));
  const sent = await bsSend_(f);
  const b = (sent || []).find(x => x.action === 'joinWaitlist');
  if (!b || b.venue !== 'Colliers Wood Library') bad.push('Send posted ' + JSON.stringify(sent));
  return bad;
});

check('Booking form: every hour 9–21 toggles on and off on every day, and only a booked space greys one', async () => {
  const f = await bsForm_(), bad = [];
  for (const [id, v] of [['client', 'Pat Parent'], ['how', 'Instant class'], ['subjects', 'Maths'], ['level', 'GCSE'], ['loc', 'Colliers Wood Library — Small room 1']]) {
    const no = await f.pick(id, v); if (no) bad.push(no);
  }
  /* EVERY DAY ON THE DAYS STEP, then every hour of them on Times: 7 × 12 tags. */
  f.t.inApp('BOOK_FIND').days = f.t.inApp('SLOT_DAYS').map(x => x[1]);
  const tags = () => f.bf.tags('slots');
  const cells = await tags();
  if (cells.length !== 7 * 12) bad.push('the week has ' + cells.length + ' hours, not 7 × 12 (9:00 to 21:00)');
  const shut = cells.filter(c => c.getAttribute('aria-disabled') === 'true').map(c => c.dataset.code);
  if (shut.length) bad.push('hours greyed with no room booked: ' + shut.slice(0, 8).join(', '));
  for (const c of cells.map(x => x.dataset.code)) {
    await f.hour(c);
    if ((f.t.BOOKING.slots || []).indexOf(c) === -1) { bad.push(c + ' did not tick'); break; }
    await f.hour(c);
    if ((f.t.BOOKING.slots || []).indexOf(c) !== -1) { bad.push(c + ' did not untick'); break; }
  }
  /* A BOOKED ROOM GREYS ITS HOUR, and nothing else does. */
  const room = ((f.D.venues || []).find(v => v.title === 'Colliers Wood Library') || { rooms: [] }).rooms[0];
  room.busy = { m16: true };
  const now = await tags();
  const c16 = now.find(x => x.dataset.code === 'm16'), c17 = now.find(x => x.dataset.code === 'm17');
  if (!c16 || c16.getAttribute('aria-disabled') !== 'true') bad.push('a booked room did not grey Monday 16:00');
  if (!c17 || c17.getAttribute('aria-disabled') === 'true') bad.push('a booked room greyed an hour it does not hold');
  delete room.busy;
  return bad;
});

check('Booking form: discount, Rest of this half term, extra places and a space in the building each change the price as they should', async () => {
  const f = await bsForm_(), bad = [];
  for (const [id, v] of [['client', 'Pat Parent'], ['how', 'Instant class'], ['subjects', 'Maths'], ['level', 'GCSE'], ['loc', 'Mitcham library'], ['interval', 'Rest of this half term']]) {
    const no = await f.pick(id, v); if (no) bad.push(no);
  }
  { const no = await f.hour('w17'); if (no) bad.push(no); }
  const L0 = f.t.price();
  if (!L0 || !(L0.total > 0)) return bad.concat(['not priced: ' + JSON.stringify(L0 && L0.total)]);
  /* REST OF THIS HALF TERM: from today to the half term's end, its weeks counted. */
  if (!/^Rest of Half A$/.test(f.w.eval('bookSpec')().interval)) bad.push('Rest of this half term is sent as ' + f.w.eval('bookSpec')().interval);
  const weeks = f.w.eval('bookSpec')().weeks;
  if (!(weeks >= 5 && weeks <= 7)) bad.push('Rest of this half term counts ' + weeks + ' weeks, not the 6 left');
  /* EXTRA SEATS: a dearer class, the multiplier on its row. */
  const base = L0.total;
  { const no = await f.pick('n', '3'); if (no) bad.push(no); }
  const L1 = f.t.price();
  if (!(L1.total > base)) bad.push('two extra seats did not raise the price: ' + base + ' → ' + L1.total);
  const seatRow = [...f.draw().querySelectorAll('.bk-row')].find(r => /Extra seats/.test((r.querySelector('.bk-k') || {}).textContent || ''));
  if (!seatRow || !/×/.test(seatRow.querySelector('.bk-m').textContent)) bad.push('the Extra seats row shows no multiplier: ' + (seatRow && seatRow.textContent.replace(/\s+/g, ' ')));
  /* DISCOUNT: one % box, the client pays less, the line says by how much. */
  const disc = f.draw().querySelector('[data-do="book-disc"]');
  disc.value = '10'; disc.dispatchEvent(new f.w.Event('change', { bubbles: true }));
  const L2 = f.t.price();
  if (!(L2.earn && L2.earn.discount > 0)) bad.push('a 10% discount took nothing off');
  const dRow = f.draw().querySelector('.rc-disc .bk-t');
  if (!dRow || !/^− £/.test(dRow.textContent.trim())) bad.push('the Discount line says ' + JSON.stringify(dRow && dRow.textContent));
  /* A ROOM IN THE VENUE: offered by name, chosen, and priced at the room's rate. */
  const rooms = (await f.bf.offers('loc')).filter(v => / — /.test(v));
  if (!rooms.length) bad.push('no room of the venue is offered');
  else {
    const no = await f.pick('loc', rooms[0]); if (no) bad.push(no);
    if (f.t.BOOKING.loc !== rooms[0]) bad.push('choosing ' + rooms[0] + ' left ' + f.t.BOOKING.loc);
    if (!f.t.price()) bad.push('the room chosen cannot be priced');
  }
  /* THE RUNNING TOTAL COLUMN, on every priced row a figure, never NaN. */
  bad.push(...bsScan_(f.draw(), 'priced'));
  return bad;
});

/* "EVERYTHING I CLICK, IT JUMPS ME BACK UP TO THE TOP" (owner, 12 Nov): on the real Find page each kind of answer leaves the form, the pages
   round it and the focused control the very nodes they were, and moves no scroller (jsdom has no layout, so any write is the jump). */
check('Booking form: a select, an hour ticked and a discount typed each redraw in place — no page rebuilt, nothing scrolled, the focus kept', async () => {
  const f = await bsForm_();
  const { w, t, d } = f, bad = [];
  f.host.remove();
  const moves = [];
  const was = Object.getOwnPropertyDescriptor(w.Element.prototype, 'scrollTop');
  Object.defineProperty(w.Element.prototype, 'scrollTop', { configurable: true, get() { return 400; },
    set(v) { if (Math.abs(v - 400) > 2) moves.push((this.id || this.className) + '.scrollTop = ' + v); } });
  const sTo = w.scrollTo, sIv = w.HTMLElement.prototype.scrollIntoView, sY = Object.getOwnPropertyDescriptor(w, 'scrollY');
  Object.defineProperty(w, 'scrollY', { configurable: true, get: () => 400 });
  w.scrollTo = (x, y) => { const to = x && typeof x === 'object' ? x.top : y; if (Math.abs((to || 0) - 400) > 2) moves.push('window.scrollTo ' + to); };
  w.HTMLElement.prototype.scrollIntoView = function () { moves.push(this.id + '.scrollIntoView'); };
  try {
    /* A STEP'S TAG (owner, 13 Nov: the questions are Find's menus): answered, the next menu drawn, nothing scrolled. */
    const step = async (what, go) => { moves.length = 0; const no = await go(); if (no) bad.push(what + ': ' + no); if (moves.length) bad.push(what + ': the page was scrolled — ' + moves.join(', ')); };
    await step('Kind', () => f.pick('how', 'Instant class'));
    await step('Venue', async () => f.pick('loc', (await f.bf.offers('loc')).filter(v => / — /.test(v)).pop()));
    await step('Extra seats', () => f.pick('n', '2'));
    await step('Term', async () => f.pick('interval', (await f.bf.offers('interval'))[0]));
    await step('an hour ticked', () => f.hour('m16'));
    /* THE SUMMARY'S DISCOUNT BOX IS PATCHED IN PLACE: the card, the pages round it and the focused box are the nodes they were. */
    const card = await f.bf.done();
    if (!card) return bad.concat(['no summary card on Find › Booking — the discount was NOT checked']);
    const pages = [...d.querySelectorAll('#s-stuff > .page')];
    const el = d.getElementById('bk-ctl-discValue');
    moves.length = 0;
    if (!el) bad.push('Discount: no box on the summary');
    else {
      el.focus();
      el.value = '10'; el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true }));
      await wait(60);
      if (d.getElementById('bookr') !== card) bad.push('Discount: the summary card was rebuilt, not patched');
      const now = [...d.querySelectorAll('#s-stuff > .page')];
      if (now.length !== pages.length || now.some((p, i) => p !== pages[i])) bad.push('Discount: the pages round the summary were rebuilt');
      if (!el.isConnected) bad.push('Discount: the box answered was thrown away');
      else if (d.activeElement !== el) bad.push('Discount: the focus left the box');
      if (moves.length) bad.push('Discount: the page was scrolled — ' + moves.join(', '));
    }
    if (String(t.BOOKING.discValue) !== '10') bad.push('the discount typed did not reach BOOKING: ' + JSON.stringify(t.BOOKING.discValue));
    if (String(t.BOOKING.n) !== '2') bad.push('Extra seats did not reach BOOKING: ' + JSON.stringify(t.BOOKING.n));
  } finally {
    Object.defineProperty(w.Element.prototype, 'scrollTop', was); w.scrollTo = sTo; w.HTMLElement.prototype.scrollIntoView = sIv;
    if (sY) Object.defineProperty(w, 'scrollY', sY); else delete w.scrollY;
  }
  return bad;
});

/* ---------- A GUEST BOOKS THROUGH FIND'S STEPS (owner, 13 Nov): Booking → Subject → … → one summary card, the calculator's price on it; Send asks them to sign in, then sends */
check('Find › Booking as a guest: every step a menu of tags, the summary card priced by the calculator, Send asks for sign-in and books once signed in', async () => {
  const PIN = ['1', '9', '7', '3'].join('');
  const { w, sent } = boot({ reply: b => (b.action === 'verifyLogin' ? (b.pin === PIN ? Object.assign({ success: true }, MEMBER_) : { success: false, error: 'Wrong PIN' })
    : b.action === 'createJob' ? { success: true, jobId: 'J-GUEST' } : { success: true, messages: [] }) });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  const D = t.DATA();
  D.intervals = [BS_TERM_()];
  w.eval('resetBooking_()');
  /* GUEST, THE FIRST FIND STEP; then Booking on the front menu. */
  t.go('stuff', false, true);
  t.ACTIONS['sign-guest'](d.createElement('button'));
  await wait(30);
  const front = [...d.querySelectorAll('#s-stuff [data-do="facet-pick"]')].find(x => x.dataset.value === 'Booking');
  if (!front) return ['a guest\'s front menu does not offer Booking'];
  t.ACTIONS['facet-pick'](front);
  await wait(200);
  const f = await bookFind_(w);
  const asked = [];
  /* EACH STEP AS A PERSON MEETS IT: the first tag that can be taken, Next on a several-answer step; never a select. */
  for (let i = 0; i < 20; i++) {
    const id = f.at();
    if (!id) break;
    asked.push(id);
    const m = f.menu();
    if (!m) { bad.push('the ' + id + ' step drew no menu'); break; }
    if (d.querySelector('#s-stuff select')) bad.push('a select is drawn on the ' + id + ' step');
    const tag = [...m.querySelectorAll('[data-do]')].find(x => x.dataset.do !== 'book-next' && x.getAttribute('aria-disabled') !== 'true' && x.getAttribute('aria-pressed') !== 'true');
    if (tag) { t.ACTIONS[tag.dataset.do](tag); await wait(30); }
    if (id === 'slots') { const two = [...f.menu().querySelectorAll('[data-do="book-slot"]')].find(x => x.getAttribute('aria-pressed') !== 'true'); if (two) { t.ACTIONS['book-slot'](two); await wait(30); } }
    const next = f.menu() && f.menu().querySelector('[data-do="book-next"]');
    if (f.at() === id && next) { t.ACTIONS['book-next'](next); await wait(30); }
    if (f.at() === id) { bad.push('the ' + id + ' step would not move on'); break; }
  }
  const want = ['subjects', 'level', 'tutor', 'loc', 'interval', 'days', 'slots', 'n'];
  const order = want.map(id => asked.indexOf(id));
  if (order.some(i => i === -1) || order.some((v, i) => i && v < order[i - 1])) bad.push('the steps came as ' + asked.join(' → ') + ', wanted ' + want.join(' → '));
  /* THE CHIPS ARE THE ANSWERS; THE END IS ONE SUMMARY CARD. */
  const chips = [...d.querySelectorAll('#s-stuff [data-do="book-back"].chip')].map(c => c.dataset.step);
  if (want.some(id => chips.indexOf(id) === -1)) bad.push('the chips are ' + chips.join(', ') + ', not one a step');
  await f.paint();
  const cards = d.querySelectorAll('#s-stuff #bookr');
  if (cards.length !== 1) return bad.concat(['the steps ended on ' + cards.length + ' summary cards, not one']);
  const card = cards[0];
  if (card.querySelector('select')) bad.push('the summary card still holds a dropdown');
  const L = t.price();
  const calc = t.inApp('priceFrom')(t.spec());
  if (!L || !(L.total > 0)) return bad.concat(['the booking is not priced: ' + JSON.stringify(L && L.total)]);
  if (Math.abs(calc.total - L.total) > 1e-9) bad.push('the summary\'s price ' + L.total + ' is not the calculator\'s ' + calc.total);
  const said = t.inApp('money_')(L.total);
  if (card.textContent.indexOf(said) === -1) bad.push('the summary card does not say the price ' + said);
  const acts = [...card.querySelectorAll('.kc-act .tile')].map(x => x.dataset.do);
  if (acts[0] !== 'book-send' || acts.indexOf('book-share') === -1) bad.push('the summary\'s tiles are ' + acts.join(', ') + ', wanted Send first and Share');
  /* SEND AS A GUEST: nothing posted, the answers kept, and the sign-in step asked again. */
  sent.length = 0;
  t.ACTIONS['book-send'](card.querySelector('[data-do="book-send"]'));
  await wait(60);
  if (sent.some(b => b.action === 'createJob')) bad.push('a guest\'s Send booked without signing in');
  if (!d.getElementById('in-name')) bad.push('Send did not offer the sign-in step');
  const kept = JSON.stringify(t.BOOKING.slots);
  /* SIGNED IN: the same answers, the same price, and Send books. */
  const no = await findSign_(w, 'momember', PIN);
  if (no) return bad.concat([no]);
  await wait(300);
  if (!t.whoami()) return bad.concat(['the sign-in did not land']);
  if (JSON.stringify(t.BOOKING.slots) !== kept) bad.push('signing in lost the answers: ' + kept + ' → ' + JSON.stringify(t.BOOKING.slots));
  /* THE SIGNED-IN PAYLOAD IS THE FIXTURE'S AGAIN, so the running term this journey priced on is put back. */
  t.DATA().intervals = [BS_TERM_()];
  const L2 = t.price();
  if (!L2 || Math.abs(L2.total - L.total) > 1e-9) bad.push('signed in, the price moved: ' + L.total + ' → ' + (L2 && L2.total));
  const host = d.createElement('div'); d.body.appendChild(host);
  host.innerHTML = w.eval('bookerCard()');
  sent.length = 0;
  t.ACTIONS['book-send'](host.querySelector('[data-do="book-send"]'));
  await wait(300);
  const b = sent.find(x => x.action === 'createJob');
  if (!b) bad.push('Send, signed in, posted ' + JSON.stringify(sent.map(x => x.action)));
  else if (Math.abs(Number(b.price) - L.total) > 0.01) bad.push('createJob carried the price ' + b.price + ', not ' + L.total);
  return bad;
});
