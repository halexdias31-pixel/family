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
