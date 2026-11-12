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
/* THE FORM AS THE ADMIN SEES IT, its questions answered through the real `change` listener, one at a time. */
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
  const host = d.createElement('div'); d.body.appendChild(host);
  const draw = () => { host.innerHTML = w.eval('bookerCard()'); return host; };
  const ctl = id => draw().querySelector('#bk-ctl-' + id);
  const pick = async (id, v) => {
    const el = ctl(id);
    if (!el) return 'no ' + id + ' control on the form';
    if (el.disabled) return id + ' is greyed';
    const has = [...(el.options || [])].some(o => o.value === v && !o.disabled);
    if (el.tagName === 'SELECT' && !has) return id + ' does not offer ' + JSON.stringify(v) + ' (offers ' + [...el.options].map(o => o.value).join(' | ') + ')';
    el.value = v;
    el.dispatchEvent(new w.Event('change', { bubbles: true }));
    await wait(30);
    return '';
  };
  const label = j => w.eval('openClassLabel_')(j);
  return { w, t, d, sent, host, draw, ctl, pick, label, D };
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
  if (!tag || tag.textContent.trim() !== 'Booking form') bad.push(where + ': the first tag is not the form\'s name');
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
  f.t.ACTIONS['book-slot'](f.draw().querySelector('[data-do="book-slot"][data-code="m16"]'));
  await wait(30);
  f.t.ACTIONS['book-slot'](f.draw().querySelector('[data-do="book-slot"][data-code="m17"]'));
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
  if (f.ctl('subjects')) bad.push('the class\'s subject is still a control to change');
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
  const blk = f.draw().querySelector('[data-do="book-block"]');
  if (!blk) bad.push('no Morning/Afternoon/Evening week on a waiting list');
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
  const blk = f.draw().querySelector('[data-do="book-block"]');
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
  const cells = [...f.draw().querySelectorAll('[data-do="book-slot"]')];
  if (cells.length !== 7 * 12) bad.push('the week has ' + cells.length + ' hours, not 7 × 12 (9:00 to 21:00)');
  const shut = cells.filter(c => c.disabled || /\bshut\b/.test(c.className)).map(c => c.dataset.code);
  if (shut.length) bad.push('hours greyed with no room booked: ' + shut.slice(0, 8).join(', '));
  for (const c of cells.map(x => x.dataset.code)) {
    f.t.ACTIONS['book-slot'](f.draw().querySelector('[data-code="' + c + '"]'));
    if ((f.t.BOOKING.slots || []).indexOf(c) === -1) { bad.push(c + ' did not tick'); break; }
    f.t.ACTIONS['book-slot'](f.draw().querySelector('[data-code="' + c + '"]'));
    if ((f.t.BOOKING.slots || []).indexOf(c) !== -1) { bad.push(c + ' did not untick'); break; }
  }
  /* A BOOKED ROOM GREYS ITS HOUR, and nothing else does. */
  const room = ((f.D.venues || []).find(v => v.title === 'Colliers Wood Library') || { rooms: [] }).rooms[0];
  room.busy = { m16: true };
  const c16 = f.draw().querySelector('[data-code="m16"]'), c17 = f.draw().querySelector('[data-code="m17"]');
  if (!c16 || !c16.disabled) bad.push('a booked room did not grey Monday 16:00');
  if (!c17 || c17.disabled) bad.push('a booked room greyed an hour it does not hold');
  delete room.busy;
  return bad;
});

check('Booking form: discount, Rest of this half term, extra places and a space in the building each change the price as they should', async () => {
  const f = await bsForm_(), bad = [];
  for (const [id, v] of [['client', 'Pat Parent'], ['how', 'Instant class'], ['subjects', 'Maths'], ['level', 'GCSE'], ['loc', 'Mitcham library'], ['interval', 'Rest of this half term']]) {
    const no = await f.pick(id, v); if (no) bad.push(no);
  }
  f.t.ACTIONS['book-slot'](f.draw().querySelector('[data-code="w17"]'));
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
  const rooms = [...f.ctl('loc').options].map(o => o.value).filter(v => / — /.test(v));
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
  try { t.go('booking', false, true); w.eval('BOOK_OPEN = true'); t.repaint(true); } catch (e) { return ['opening booking threw: ' + e.message]; }
  await wait(200);
  if (!d.getElementById('bookr')) return ['no booking form on Find › Booking — the scroll was NOT checked'];
  const moves = [];
  const was = Object.getOwnPropertyDescriptor(w.Element.prototype, 'scrollTop');
  Object.defineProperty(w.Element.prototype, 'scrollTop', { configurable: true, get() { return 400; },
    set(v) { if (Math.abs(v - 400) > 2) moves.push((this.id || this.className) + '.scrollTop = ' + v); } });
  const sTo = w.scrollTo, sIv = w.HTMLElement.prototype.scrollIntoView, sY = Object.getOwnPropertyDescriptor(w, 'scrollY');
  Object.defineProperty(w, 'scrollY', { configurable: true, get: () => 400 });
  w.scrollTo = (x, y) => { const to = x && typeof x === 'object' ? x.top : y; if (Math.abs((to || 0) - 400) > 2) moves.push('window.scrollTo ' + to); };
  w.HTMLElement.prototype.scrollIntoView = function () { moves.push(this.id + '.scrollIntoView'); };
  const answer = async (what, el, act) => {
    const card = d.getElementById('bookr');
    const pages = [...d.querySelectorAll('#s-stuff > .page')];
    moves.length = 0;
    if (!el) { bad.push(what + ': no control to answer on the form'); return; }
    el.focus();
    act(el);
    await wait(60);
    if (d.getElementById('bookr') !== card) bad.push(what + ': the form card was rebuilt, not patched');
    const now = [...d.querySelectorAll('#s-stuff > .page')];
    if (now.length !== pages.length || now.some((p, i) => p !== pages[i])) bad.push(what + ': the pages round the form were rebuilt');
    if (!el.isConnected) bad.push(what + ': the control answered was thrown away');
    else if (d.activeElement !== el) bad.push(what + ': the focus left the control (on ' + (d.activeElement && (d.activeElement.id || d.activeElement.tagName)) + ')');
    if (moves.length) bad.push(what + ': the page was scrolled — ' + moves.join(', '));
  };
  const change = v => el => { el.value = v; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const ctl = id => d.getElementById('bk-ctl-' + id);
  const opt = (id, re) => { const el = ctl(id); return el ? [...el.options].map(o => o.value).filter(v => v && re.test(v)).pop() || el.value : ''; };
  try {
    await answer('Kind', ctl('how'), change(opt('how', /new|instant/i)));
    await answer('Venue', ctl('loc'), change(opt('loc', / — /)));
    await answer('Extra seats', ctl('n'), change('2'));
    await answer('Term', ctl('interval'), change(opt('interval', /./)));
    const hour = d.querySelector('#bookr [data-do="book-slot"]:not(:disabled), #bookr [data-do="book-block"]:not(:disabled)');
    await answer('an hour ticked', hour, el => el.click());
    await answer('Discount', ctl('discValue'), el => { el.value = '10'; el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); });
    if (String(t.BOOKING.discValue) !== '10') bad.push('the discount typed did not reach BOOKING: ' + JSON.stringify(t.BOOKING.discValue));
    if (String(t.BOOKING.n) !== '2') bad.push('Extra seats did not reach BOOKING: ' + JSON.stringify(t.BOOKING.n));
  } finally {
    Object.defineProperty(w.Element.prototype, 'scrollTop', was); w.scrollTo = sTo; w.HTMLElement.prototype.scrollIntoView = sIv;
    if (sY) Object.defineProperty(w, 'scrollY', sY); else delete w.scrollY;
  }
  return bad;
});
