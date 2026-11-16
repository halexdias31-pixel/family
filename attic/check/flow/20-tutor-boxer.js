/* Journey taken out of check/flow/20-tutor-boxer.js in the 16 Nov cull: the timetable. */
/* ---------- THE TIMETABLE IS ITS OWN WEEK, ON YOUR ACCOUNT, AND NO BOOKING IS SYNCED INTO IT (466) ---------- */
check('466: the timetable holds only its own lessons — a booked session is not drawn in it — is saved to your account, and Your week is gone', async () => {
  const { w, sent } = boot();
  await wait(300);
  const t = w.__t, d = w.document;
  if (typeof w.initTimetable !== 'function' || typeof t.tmtKey !== 'function') {
    return ['the timetable is not reachable, so this was NOT checked — not a pass'];
  }
  const bad = [];
  const mon = w.mondayOf_(new Date());
  const at = n => { const x = new Date(mon); x.setDate(x.getDate() + n); return x; };
  const dmy = x => String(x.getDate()).padStart(2, '0') + '/' + String(x.getMonth() + 1).padStart(2, '0') + '/' + x.getFullYear();
  const D = t.DATA();
  D.liveJobs = D.jobs = [
    { id: 'J-MON', jobId: 'J-MON', subject: 'Physics', location: 'Mitcham library', day: 'Monday, Saturday',
      time: '10:00', hours: 2, client: 'Sam Student', tutor: 'GeorgePovey', status: 'active', slots: [],
      dates: [at(0), at(5), at(7)].map(dmy).join(', ') },
    { id: 'J-ELSE', jobId: 'J-ELSE', subject: 'Chemistry', day: 'Monday', time: '12:00', hours: 1,
      client: 'Somebody Else', tutor: 'Sasha Matola', status: 'active', slots: [], dates: dmy(at(0)) },
  ];
  const sam = { name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'], token: 'tk' };
  /* A WEEK ALREADY ON THIS PHONE under Sam's key, from before it was kept on the account. */
  w.localStorage.setItem('tmt:u:P9', JSON.stringify({ weekend: false,
    days: [[{ id: 'L1', at: '09:00', subject: 'Maths', note: '' }, { id: 'L2', at: '13:00', subject: 'Art', note: '' }], [], [], [], [], [], []] }));
  t.USER(sam);
  try { t.findGroup('Tools', 'timetable'); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  for (let n = 0; n < 40 && !d.querySelector('.tmt-box'); n++) await wait(50);
  if (d.querySelector('#week-body')) bad.push('`Your week` is still a widget on the Tools column — it is folded into the Timetable');
  const box = () => d.querySelector('.tmt-box');
  if (!box()) return bad.concat('the timetable did not draw on the Tools column');
  const chip = d.createElement('button'); chip.setAttribute('data-day', '0');
  t.ACTIONS['tmt-day'](chip);
  const list = () => [...box().querySelectorAll('.tmt-list > *')].map(r =>
    (r.classList.contains('is-booked') ? 'BOOKED ' : '') + r.querySelector('.tmt-at').textContent.trim() + ' '
    + r.querySelector('.tmt-sub').textContent.trim());
  const got = list().join(', ');
  if (got !== '09:00 Maths, 13:00 Art') {
    bad.push('Monday reads [' + got + '], wanted [09:00 Maths, 13:00 Art] — the phone\'s week carried up and no booked session synced into it (466)');
  }
  if (box().querySelector('.tmt-row.is-booked, [data-id="J-MON"]')) bad.push('a booked session is drawn in the timetable — nothing syncs into it (466)');
  if (box().querySelectorAll('.tmt-day').length !== 5) bad.push('a session on Saturday opened the weekend: ' + box().querySelectorAll('.tmt-day').length + ' day chips, wanted 5 — only the Weekend box does (466)');
  /* THE ACCOUNT. The carry-up wrote USER.timetable; give the debounce time and look at the wire. */
  await wait(1100);
  const save = sent.filter(x => x.action === 'saveTimetable').pop();
  if (!save) bad.push('the week on this phone was not carried up to the account (no saveTimetable sent)');
  else {
    let shape = null; try { shape = JSON.parse(save.timetable); } catch (e) {}
    if (save.personId !== 'P9' || !shape || !Array.isArray(shape.days) || shape.days.length !== 7) {
      bad.push('saveTimetable carried ' + JSON.stringify({ personId: save.personId, days: shape && shape.days && shape.days.length }));
    }
    if (shape && JSON.stringify(shape).indexOf('J-MON') !== -1) bad.push('the booked session was SAVED into the timetable — a copy of a booking goes stale');
  }
  /* A LESSON TYPED WHILE SIGNED IN IS SENT. */
  sent.length = 0;
  t.ACTIONS['tmt-add'](d.createElement('button'));
  const sub = box().querySelector('.tmt-in[data-f="subject"]');
  if (sub) { sub.value = 'Latin'; sub.dispatchEvent(new w.Event('input', { bubbles: true })); }
  await wait(1100);
  const typed = sent.filter(x => x.action === 'saveTimetable').pop();
  if (!typed || !/Latin/.test(typed.timetable || '')) bad.push('a lesson typed while signed in was not saved to the account');
  /* ANOTHER PHONE: nothing on the device, the week on the account. */
  w.localStorage.removeItem('tmt:u:P9');
  const onAccount = JSON.stringify({ weekend: false, days: [[{ id: 'L9', at: '15:00', subject: 'Greek', note: '' }], [], [], [], [], [], []] });
  t.USER(Object.assign({}, sam, { timetable: onAccount }));
  try { t.repaint(); } catch (e) {}
  for (let n = 0; n < 40 && !(box() && /Greek/.test(box().textContent)); n++) await wait(50);   /* Find fills its card after the paint (790) */
  if (!box()) return bad.concat(['the repaint left no timetable on Find']);
  if (!/Greek/.test(box().textContent) || /Maths/.test(box().textContent)) bad.push('a phone with nothing on it did not draw the week kept on the account');
  /* SIGNED OUT: the device's own, under the bare key, and nothing is sent. */
  /* SIGNED OUT, Find is not offered (400, 790): a visitor reaches no timetable, so the device-only half is asked only when one is still drawn. */
  t.USER(null);
  try { t.repaint(); } catch (e) {}
  for (let n = 0; n < 40 && !box(); n++) await wait(50);
  if (!box()) return bad;
  sent.length = 0;
  w.localStorage.removeItem('tmt');
  t.ACTIONS['tmt-add'](d.createElement('button'));
  const sub2 = box().querySelector('.tmt-in[data-f="subject"]');
  if (sub2) { sub2.value = 'Music'; sub2.dispatchEvent(new w.Event('input', { bubbles: true })); }
  await wait(1100);
  if (sent.some(x => x.action === 'saveTimetable')) bad.push('signed out, the timetable was posted to the server');
  if (!/Music/.test(w.localStorage.getItem('tmt') || '')) bad.push('signed out, the timetable was not kept on the device');
  if (box().querySelector('.tmt-row.is-booked')) bad.push('signed out, somebody\'s booked session is drawn');
  return bad;
});

