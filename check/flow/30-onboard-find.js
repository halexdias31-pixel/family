/* ---------- A NEW TEACHER, END TO END THROUGH FIND (owner, 7 Nov; docs/history/1150) */
/* The settings columns are off since the core freeze (1090), so every step here is reached through Find alone. */
/* FIND › BOOKING'S OWN TAGS (owner, 8 Nov): Booking form opens the form; Previous holds the client's finished bookings. */
check('Find › Booking offers a Booking form tag that draws the form, and a Previous tag with the client\'s finished bookings only', async () => {
  const W = cardWorld_({ people: [['P-C2', 'Cara', 'Client', 'client', 'cara@example.org']] });
  const k = await cardOpen_(W, 'cara@example.org', {});
  if (k.err) return [k.err];
  const bad = [], D = k.t.DATA();
  D.liveJobs = (D.liveJobs || []).concat([{ id: 'J-OLD', client: 'Cara Client', tutor: 'Ada Tutor', subject: 'Maths', startDate: '01/01/2024', endDate: '01/02/2024' },
    { id: 'J-NOW', client: 'Cara Client', tutor: 'Ada Tutor', subject: 'Physics', startDate: '01/01/2024', endDate: '01/01/2099' }]);
  k.w.stuffForget_();
  k.t.go('stuff', false, true);
  const pick = async v => { const S = k.t.STUFF(); S.filters.length = 0; S.filters.push({ field: 'kindLabel', value: 'Booking' }); if (v) S.filters.push({ field: 'kindOwn', value: v }); k.w.paintStuff(); await wait(300); };
  /* BOOKING ALONE IS THE FIRST BOOKING STEP (owner, 13 Nov): its tags in Find's menu, no form card; Booking's other answers follow it. */
  await pick('');
  if (!k.d.querySelector('#s-stuff .book-step [data-do="book-pick"]')) bad.push('Booking does not lead into the booking steps');
  if (k.d.querySelector('#s-stuff select[data-step], #s-stuff #bookr')) bad.push('Booking still draws the old form');
  const others = [...k.d.querySelectorAll('#s-stuff [data-do="facet-pick"][data-field="kindOwn"]')].map(x => x.dataset.value);
  if (others.indexOf('Previous') === -1) bad.push('Booking\'s other answers do not follow the first step: ' + others.join(', '));
  if (others.indexOf('Booking form') !== -1) bad.push('a Booking form tag is still offered');
  await pick('Previous');
  const prev = k.w.stuffFiltered().map(x => x.key);
  if (prev.join() !== 'job:J-OLD') bad.push('Previous lists ' + prev.join(', ') + ', wanted only the finished booking');
  return bad;
});
