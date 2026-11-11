/* ---------- A NO-TUTOR-YET BOOKING, ACCEPTED (owner, 8 Nov): the booking just sent carries its tiles; admin accepts, a tutor applies, the client picks */
const NOTUTOR_JOB_ = () => ({
  id: 'J-N', jobId: 'J-N', kind: '', subject: 'Maths', level: 'GCSE', price: 302.4, tutorPay: 230.4, adminKeeps: 72,
  location: 'Client House', venue: 'Client House', term: 'Autumn 2', day: 'Monday', time: '16:00', hours: 2,
  slotCodes: 'm16,m17', dates: '10/11/26, 17/11/26', stealable: true, tutor: '',
  slots: [{ n: 1, client: 'Pat Parent', status: 'Waiting' }], tutorSlots: [], events: [],
});
check('Find › Booking: an admin accepts a No-tutor-yet booking from its own card, a tutor applies, the client picks, the week shows its hours and the money adds up', async () => {
  const { w, sent } = boot();
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (typeof t.jobPage !== 'function') return ['`jobPage_` is not exported — NOT checked'];
  const host = h => { const el = d.createElement('div'); el.innerHTML = h; d.body.appendChild(el); return el; };
  const job = NOTUTOR_JOB_();
  w.eval('DATA').liveJobs = [job];
  w.eval('DATA').jobs = [job];
  const tap = async (el, act) => { sent.length = 0; t.ACTIONS[act](el); await wait(200); return sent.find(b => b.action === 'move'); };
  /* THE ADMIN, ON THE BOOKING JUST SENT (`ASKED_JOB`), which was drawn bare. */
  t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
  w.eval("ASKED_JOB = 'J-N'");
  const card = host(w.eval('askedBlock_')());
  const yes = card.querySelector('.rc [data-do="job-answer"][data-yes="1"]');
  if (!yes) bad.push('the booking just sent has no Accept tile for the admin');
  if (!card.querySelector('.rc [data-do="job-delete"]')) bad.push('the booking just sent has no Delete tile for the admin');
  if (yes) {
    const m = await tap(yes, 'job-answer');
    if (!m || m.move !== 'Accept' || m.jobId !== 'J-N' || m.asAdmin !== '1') bad.push('Accept posted ' + JSON.stringify(m || sent.map(b => b.action)));
  }
  /* THE WEEK: Monday 16:00 and 17:00 ticked, nothing else. */
  const lit = [...card.querySelectorAll('.hr.on')].map(b => b.getAttribute('aria-label'));
  if (lit.join('|') !== 'Monday 16:00|Monday 17:00') bad.push('the saved week shows ' + JSON.stringify(lit) + ', wanted Monday 16:00 and 17:00');
  /* THE MONEY: client pays = tutor earns + admin earns, whatever was stored. */
  const fig = j => (t.jobMoney ? t.jobMoney(j) : { more: [] });
  const m2 = fig(job);
  if (m2.total !== '£302.40' || (m2.more || []).map(x => x.t).join() !== '£230.40,£72.00') bad.push('the admin\'s figures read ' + JSON.stringify(m2));
  const last = (fig(Object.assign({}, job, { tutorPay: 600 })).more || []).slice(-1)[0];
  if (!last || !/297\.60/.test(last.t)) bad.push('tutor £600 on a £302.40 booking says admin earns ' + JSON.stringify(last));
  w.eval("ASKED_JOB = ''");
  /* A TUTOR: Apply to teach, posted as their Request. */
  t.USER({ name: 'Ada Tutor', personId: 'P2', role: 'tutor', roles: ['tutor'] });
  const apply = host(t.jobPage(job)).querySelector('.rc [data-do="job-apply"]');
  if (!apply) bad.push('a tutor sees no Apply tile on a No-tutor-yet booking');
  else {
    const m = await tap(apply, 'job-apply');
    if (!m || m.move !== 'Request' || m.role !== 'tutor') bad.push('Apply posted ' + JSON.stringify(m || sent.map(b => b.action)));
  }
  /* THE CLIENT: one Choose tile per tutor who applied. */
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const pick = host(t.jobPage(Object.assign({}, job, { tutorSlots: [{ key: 'a', name: 'Ada Tutor', status: 'Applied' }] })))
    .querySelector('.rc [data-do="job-choose"]');
  if (!pick || pick.dataset.tutor !== 'Ada Tutor') bad.push('the client has no Choose Ada Tutor tile');
  else {
    const m = await tap(pick, 'job-choose');
    if (!m || m.move !== 'Accept' || m.counterpart !== 'Ada Tutor') bad.push('Choose posted ' + JSON.stringify(m || sent.map(b => b.action)));
  }
  return bad;
});

/* THE BOOKING FORM IS THE BOOKING RECORD (owner, 8 Nov): the empty form and a saved booking draw the same lines in the same order, on the same five columns */
check('a saved booking draws the booking form\'s lines, in its order, with its header and five columns', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (typeof t.jobPage !== 'function' || typeof t.paper !== 'function') return ['`jobPage_` or the form is not exported — NOT checked'];
  t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
  const job = Object.assign(NOTUTOR_JOB_(), { id: 'J-S', jobId: 'J-S', tutor: 'Ada Tutor', day: 'Monday,Tuesday,Saturday',
    slotCodes: 'm16,m17,tu16,tu17,sa10,sa11', seatsGoing: 3, openToOthers: true, maxKids: 4,
    slots: [{ n: 1, client: 'Pat Parent', status: 'Agreed' }], tutorSlots: [{ key: 'a', name: 'Ada Tutor', status: 'Confirmed' }] });
  const read = h => {
    const el = d.createElement('div'); el.innerHTML = h;
    const bk = el.querySelector('.rc .bk');
    if (!bk) return null;
    const rows = [...bk.children].filter(r => r.matches('.bk-row'));
    return { head: rows.filter(r => r.matches('.is-cols')).map(r => [...r.children].map(c => c.textContent.trim()).join('|')),
      keys: rows.filter(r => !r.matches('.is-cols')).map(r => (r.querySelector('.bk-k') || {}).textContent.trim()),
      cells: [...new Set(rows.map(r => [...r.children].filter(c => /^bk-[nkvmrt]$/.test(c.className.split(' ')[0])).length))],
      tags: el.querySelectorAll('.rc-head .qtag').length };
  };
  const f = read(t.paper()), s = read(t.jobPage(job));
  if (!f || !s) return ['the form or the saved booking drew no rows'];
  if (f.keys.join(' / ') !== s.keys.join(' / ')) bad.push('form lines ' + JSON.stringify(f.keys) + ' but the saved booking draws ' + JSON.stringify(s.keys));
  if (f.head.join() !== s.head.join() || f.head.length !== 1) bad.push('header rows differ: ' + JSON.stringify([f.head, s.head]));
  if (f.cells.join() !== '6' || s.cells.join() !== '6') bad.push('cells per line: form ' + f.cells + ', saved ' + s.cells + ', wanted 6 (number, label, answer, ×, +/h, =)');
  if (f.tags !== s.tags) bad.push('a tag line above the rows on one and not the other');
  ['Started', 'Completed'].forEach(k => { if (s.keys.includes(k) || f.keys.includes(k)) bad.push('a "' + k + '" status line is still drawn'); });
  return bad;
});

/* REST OF THIS TERM (owner, 11 Nov): mid-term the form offers it, priced on the sessions left; a holiday offers none; nothing reads NaN */
check('booking form: mid-term it offers "Rest of this half term", priced on the Mondays left; in a holiday it does not; no NaN and no Day & time line on it', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, bad = [];
  if (!t.paper || !t.STEPS) return ['the form is not exported — NOT checked'];
  const day = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  const dmy = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  const D = t.DATA();
  D.intervals = [{ rel: 'Current', term: 'Autumn 2', kind: 'half-term', weeks: 7, opensOn: dmy(day(-21)), closesOn: dmy(day(27)),
                   startDate: dmy(day(-21)), endDate: dmy(day(27)) }];
  const opts = () => (t.STEPS.find(s => s.id === 'interval').options() || []);
  if (!opts().includes('Rest of this half term')) bad.push('mid-term the choices are ' + JSON.stringify(opts()));
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  Object.assign(t.BOOKING, { how: 'Instant class', loc: 'Colliers Wood Library', level: 'GCSE', n: '1', subjects: ['Maths'],
    interval: ['Rest of this half term'], slots: ['m16', 'm17'] });
  const spec = t.spec();
  const left = [...Array(28).keys()].filter(i => day(i).getDay() === 1).length;
  if (spec.startDate !== dmy(day(0)) || spec.endDate !== dmy(day(27))) bad.push('the rest runs ' + spec.startDate + '–' + spec.endDate);
  const L = t.price();
  if (!L || L.slots !== left || !(L.total > 0)) bad.push('the rest counts ' + (L && L.slots) + ' Mondays at ' + (L && L.total) + ', wanted ' + left + ' and a price');
  const html = t.paper();
  /* NO DAY & TIME LINE (owner, 11 Nov): the week's grid chooses them; the line that repeated them is gone. */
  if (/Day (&amp;|&) time/.test(html)) bad.push('the form still draws a Day & time line');
  if (/NaN/.test(html)) bad.push('the form reads NaN: ' + (html.match(/.{60}NaN.{20}/) || [''])[0]);
  D.intervals = [{ term: 'Half-term', kind: 'holiday', opensOn: dmy(day(-2)), closesOn: dmy(day(5)), startDate: dmy(day(-2)), endDate: dmy(day(5)) },
                 { term: 'Spring 1', kind: 'term', opensOn: dmy(day(6)), closesOn: dmy(day(50)), startDate: dmy(day(6)), endDate: dmy(day(50)) }];
  if (opts().some(o => /^Rest of/.test(o))) bad.push('in a holiday the choices still offer ' + JSON.stringify(opts()));
  return bad;
});
