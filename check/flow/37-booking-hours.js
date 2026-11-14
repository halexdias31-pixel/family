/* ---------- EVERY HOUR TOGGLES (owner, 11 Nov): a client's house row without `takes_all_seats` kept one stray hour, and its venue hours shut the rest of the week. */
check('Find › Booking: an admin booking an Instant class at Client House toggles Mon 10 on and off, and the totals follow', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, bad = [];
  t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
  /* A FRESH FORM: an old kept draft with ticked hours is not brought back (owner, 11 Nov). */
  w.eval("draftKeep_('book', 'form', JSON.stringify({ slots: ['w17', 'w18', 'su17', 'su18'] })); resetBooking_(true); bookBack_();");
  if ((t.BOOKING.slots || []).length) bad.push('a new form opened with hours already ticked: ' + JSON.stringify(t.BOOKING.slots));
  const D = t.DATA();
  /* THE LIVE ROW AS IT CAME: a stray Wednesday hour and no `takes_all_seats`. */
  D.venues = (D.venues || []).filter(v => v.title !== 'Client House')
    .concat([{ title: 'Client House', bestRate: 1, minCapacity: 4, maxCapacity: 4, avail: { w15: true } }]);
  const tutor = ((D.tutors || []).find(x => x.title) || {}).title || '';
  Object.assign(t.BOOKING, { client: 'Halex Dias', how: 'Instant class', joining: '', loc: 'Client House', hosting: 'No — we book the room',
    level: 'GCSE', n: '3', subjects: ['Maths'], tutor: tutor, slots: [] });
  /* FIND'S TIMES STEP (owner, 13 Nov): Monday picked on Days, then its 10:00 tag. */
  const f = await bookFind_(w);
  const cell = async () => (await f.tags('slots')).find(x => x.dataset.code === 'm10');
  const hours = () => { const L = t.price(); return (L && L.hoursPerWeek) || 0; };
  t.inApp('BOOK_FIND').days = ['Monday'];
  const c0 = await cell();
  if (!c0) return ['no Monday 10:00 tag on the Times step'];
  if (c0.getAttribute('aria-disabled') === 'true') bad.push('Monday 10:00 is shut: ' + c0.outerHTML);
  const before = hours();
  await f.hour('m10');
  if ((t.BOOKING.slots || []).indexOf('m10') === -1) bad.push('tapping Monday 10:00 did not tick it');
  if (!(hours() > before)) bad.push('the week did not grow: ' + before + ' → ' + hours());
  if (!/\bis-on\b/.test(((await cell()) || {}).className || '')) bad.push('the ticked tag is not drawn on');
  await f.hour('m10');
  if ((t.BOOKING.slots || []).indexOf('m10') !== -1) bad.push('tapping it again did not untick it');
  if (hours() !== before) bad.push('the week did not shrink back: ' + hours() + ' vs ' + before);
  return bad;
});
