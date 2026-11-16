/* Journeys taken out of check/flow/07-column-keeps.js in the 16 Nov cull: the timetable and touch typing (code already in attic/). */
/* ---------- THE TIMETABLE KEEPS A WEEK, PER PERSON, ONE COLOUR A SUBJECT § */
check('the timetable keeps a week per person, one colour a subject, through a repaint', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  const d = w.document;
  if (typeof w.initTimetable !== 'function' || typeof t.tmtKey !== 'function') {
    return ['the timetable widget is not in the app'];
  }
  const sam = { name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'] };
  const kit = { name: 'Kit Other', personId: 'P8', role: 'student', roles: ['student'] };
  t.USER(sam);
  try { t.findGroup('Tools', 'timetable'); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  for (let n = 0; n < 60 && !d.querySelector('#s-stuff #wgt-timetable'); n++) await wait(50);
  w.localStorage.removeItem(t.tmtKey());
  w.initTimetable();
  const box = () => d.querySelector('.tmt-box');
  if (!box()) return ['the timetable did not draw on the Tools column'];
  const press = (act, attrs) => {
    const el = d.createElement('button');
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    if (attrs && attrs.checked) el.checked = true;
    t.ACTIONS[act](el);
  };
  const type = (f, v) => {
    const el = box().querySelector('.tmt-in[data-f="' + f + '"]');
    if (!el) return false;
    el.value = v;
    el.dispatchEvent(new w.Event('input', { bubbles: true }));
    return true;
  };
  const rows = () => [...box().querySelectorAll('.tmt-row')].map(r => ({
    at: r.querySelector('.tmt-at').textContent.trim(),
    sub: r.querySelector('.tmt-sub').textContent.trim(),
    c: r.style.getPropertyValue('--tmt-c') }));
  const bad = [];
  press('tmt-day', { 'data-day': '0' });
  for (const [sub, note] of [['Chemistry', 'Room 4'], ['History', ''], ['Maths', '']]) {
    press('tmt-add');
    if (!type('subject', sub)) { bad.push('adding a lesson does not open it with a subject box'); break; }
    if (note) type('note', note);
    const id = box().querySelector('.tmt-in').dataset.id;
    press('tmt-open', { 'data-id': id });
  }
  let r = rows();
  if (r.map(x => x.at + ' ' + x.sub).join(', ') !== '09:00 Chemistry, 10:00 History, 11:00 Maths') {
    bad.push('three lessons added read back as "' + r.map(x => x.at + ' ' + x.sub).join(', ') + '"');
  }
  if (new Set(r.map(x => x.c)).size !== 3 || r.some(x => !x.c)) {
    bad.push('three subjects are not in three colours: ' + r.map(x => x.sub + '=' + x.c).join(', '));
  }
  if (!/Room 4/.test(box().textContent)) bad.push('the note typed into the open lesson is not on its line');
  const maths = (rows().find(x => x.sub === 'Maths') || {}).c;

  /* A REPAINT REBUILDS THE MARKUP, and a timetable held only in it would be gone. § */
  try { t.repaint(); } catch (e) { bad.push('repaint threw: ' + e.message); }
  for (let n = 0; n < 60 && !box(); n++) await wait(50);   /* Find fills its page after the paint (790) */
  if (rows().length !== 3) bad.push('after a repaint the timetable holds ' + rows().length + ' lessons, not 3');

  /* SOMEBODY ELSE ON THE SAME PHONE GETS THEIR OWN — again through the repaint a sign-in does. */
  t.USER(kit);
  try { t.repaint(); } catch (e) {}
  for (let n = 0; n < 60 && !box(); n++) await wait(50);
  if (rows().length) bad.push('a second person signed in on the phone sees the first one\'s timetable');
  t.USER(sam);
  try { t.repaint(); } catch (e) {}
  for (let n = 0; n < 60 && !box(); n++) await wait(50);
  if (rows().length !== 3) bad.push('signing back in does not bring the timetable back');

  /* A LESSON ADDED AND SHUT WITH NOTHING IN IT GOES, rather than leaving an `Untitled` line that only
     Remove can take off. Shut three ways: Done, another day, and Add again. */
  press('tmt-add');
  press('tmt-open', { 'data-id': box().querySelector('.tmt-in').dataset.id });
  if (rows().length !== 3) bad.push('Add then Done with nothing typed leaves ' + rows().length + ' lessons, not 3');
  press('tmt-add');
  press('tmt-day', { 'data-day': '0' });
  press('tmt-add');
  press('tmt-add');
  press('tmt-open', { 'data-id': box().querySelector('.tmt-in').dataset.id });
  if (rows().length !== 3) bad.push('a blank lesson shut by another day or another Add is still on the day: ' + rows().length + ' lessons');

  /* A SUBJECT IN ANOTHER ALPHABET HAS A COLOUR. `[a-z0-9]` reduced `Ελληνικά` to nothing. And the time
     arrives on `change` as well as `input`, which is what an older phone's wheel sends. */
  press('tmt-add');
  type('subject', 'Ελληνικά');
  const at = box().querySelector('.tmt-in[data-f="at"]');
  if (at) { at.value = '15:20'; at.dispatchEvent(new w.Event('change', { bubbles: true })); }
  press('tmt-open', { 'data-id': box().querySelector('.tmt-in').dataset.id });
  const gk = rows().find(x => x.sub === 'Ελληνικά');
  if (!gk) bad.push('a Greek subject typed into a lesson is not on the day');
  else {
    if (!gk.c) bad.push('a subject written in Greek letters is drawn with no colour');
    if (gk.at !== '15:20') bad.push('a time sent only as `change` is not kept: the line reads ' + gk.at);
  }
  const g = [...box().querySelectorAll('.tmt-row')].find(x => /Ελληνικά/.test(x.textContent));
  if (g) press('tmt-drop', { 'data-id': g.dataset.id });

  /* A COLOUR DOES NOT MOVE WHEN ANOTHER SUBJECT ARRIVES EARLIER IN THE WEEK. */
  press('tmt-add');
  type('subject', 'Art');
  type('at', '08:00');
  press('tmt-open', { 'data-id': box().querySelector('.tmt-in').dataset.id });
  if ((rows().find(x => x.sub === 'Maths') || {}).c !== maths) bad.push('adding Art at 08:00 changed Maths\'s colour');
  if ((rows()[0] || {}).sub !== 'Art') bad.push('a lesson at 08:00 is not first on the day');

  press('tmt-weekend', { checked: true });
  if (box().querySelectorAll('.tmt-day').length !== 7) bad.push('ticking Weekend does not show seven days');
  press('tmt-weekend');
  if (box().querySelectorAll('.tmt-day').length !== 5) bad.push('unticking Weekend does not go back to five days');

  const hid = [...box().querySelectorAll('.tmt-row')].find(x => /History/.test(x.textContent));
  if (hid) press('tmt-drop', { 'data-id': hid.dataset.id });
  if (rows().some(x => x.sub === 'History') || rows().length !== 3) bad.push('Remove does not take the lesson off');
  w.localStorage.removeItem(t.tmtKey());
  return bad;
});

/* ---------- TOUCH TYPING: KEYS MOVE THE LINE, A WRONG ONE COUNTS, THE LADDER IS KEPT PER PERSON § */
check('touch typing moves on a right key, counts a wrong one, keeps the ladder per person', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  const d = w.document;
  if (typeof w.initTyping !== 'function' || typeof w.ktKey_ !== 'function' || typeof w.ktNow_ !== 'function') {
    return ['the touch-typing widget is not in the app'];
  }
  const sam = { name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'] };
  const kit = { name: 'Kit Other', personId: 'P8', role: 'student', roles: ['student'] };
  t.USER(kit); w.localStorage.removeItem(w.ktKey_());
  t.USER(sam); w.localStorage.removeItem(w.ktKey_());
  try { t.findGroup('Tools'); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  await wait(300);
  /* TO ITS OWN PAGE, the way a swipe arrives: the Tools column keeps only the pages near the one
     being looked at in the document, and this card is tenth. */
  const n = w.widgetsOf_('tool').findIndex(x => String(x.id) === 'typing');
  if (n < 0) return ['there is no typing widget in the Tools roster'];
  try { t.findPage(n, true); } catch (e) { return ['goPage("tools", ' + n + ') threw: ' + e.message]; }
  const box = () => d.querySelector('.kt-box');
  /* WAITED FOR, NOT SLEPT FOR. § */
  for (let i = 0; i < 40 && !(box() && box().querySelector('.kt-in')); i++) await wait(50);
  if (!box() || !box().querySelector('.kt-in')) return ['the touch-typing card did not draw on the Tools column with its box'];
  const bad = [];

  /* THROUGH `ktLesson_`, NOT `KT_LESSONS`: § */
  const lessons = typeof w.ktLessonCount_ === 'function'
    ? Array.from({ length: w.ktLessonCount_() }, (_, i) => w.ktLesson_(i)) : [];
  if (lessons.length !== 5) bad.push('the ladder has ' + lessons.length + ' lessons, not 5');
  lessons.forEach((L, n) => {
    for (let i = 0; i < 50; i++) {
      const line = w.ktLine_(n);
      const stray = [...line].filter(c => /[a-z]/i.test(c) && !L.keys.includes(c.toLowerCase()));
      const caps = /[A-Z]/.test(line), marks = /[,.;:?']/.test(line.replace(/\.$/, ''));
      if (stray.length) { bad.push(L.name + ' drew a line with keys it has not taught: "' + line + '"'); break; }
      if (!L.caps && caps) { bad.push(L.name + ' drew a capital: "' + line + '"'); break; }
      if (!L.marks && marks) { bad.push(L.name + ' drew a mark: "' + line + '"'); break; }
      /* "alas alas" was the first screenshot's home row: one word practised twice, not the row. */
      const ws = line.toLowerCase().replace(/[^a-z' ]/g, '').split(' ');
      if (ws.some((x, j) => j && x === ws[j - 1])) { bad.push(L.name + ' drew a word twice running: "' + line + '"'); break; }
    }
  });

  let heard = 0;
  const ear = e => { if (e.key && e.key.length === 1) heard++; };
  w.addEventListener('keydown', ear);
  const key = k => {
    const el = box().querySelector('.kt-in');
    el.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  };
  const done = () => (box().querySelector('.kt-done') || {}).textContent || '';
  t.ACTIONS['kt-focus'](box().querySelector('.kt-line'));
  if (!box().classList.contains('typing')) bad.push('tapping the line does not put the card into typing');

  const line = w.ktNow_().line;
  for (const c of line.slice(0, 5)) key(c);
  if (done() !== line.slice(0, 5)) bad.push('five right keys leave "' + done() + '" done, not "' + line.slice(0, 5) + '"');
  if (heard) bad.push(heard + ' typed keys reached a listener on the window — the space bar is Flabby Pird\'s again');

  const want = line[5];
  const next = box().querySelector('.kt-k.next');
  if (!next || next.textContent.trim() !== (want === ' ' ? 'space' : want.toLowerCase())) {
    bad.push('the key lit is "' + (next ? next.textContent.trim() : 'none') + '" and the next letter is "' + want + '"');
  }
  key(want === 'q' ? 'z' : 'q');
  if (done() !== line.slice(0, 5)) bad.push('a wrong key moved the line on');
  if (w.ktNow_().wrong !== 1) bad.push('a wrong key was counted ' + w.ktNow_().wrong + ' times, not once');
  if (!box().querySelector('.kt-k.miss')) bad.push('a wrong key is not shown on the keyboard');
  if ((box().querySelector('.kt-acc') || {}).textContent === '100%') bad.push('accuracy still reads 100% after a wrong key');

  /* THE PHONE'S DOOR: the character lands in the box, and the box is emptied so the next lands alone. */
  const inp = box().querySelector('.kt-in');
  inp.value = want;
  inp.dispatchEvent(new w.Event('input', { bubbles: true }));
  if (done() !== line.slice(0, 6)) bad.push('a key that arrives as `input`, as a phone sends it, does not move the line');
  if (box().querySelector('.kt-in').value) bad.push('the hidden box is not emptied after a phone key');
  if (d.activeElement !== box().querySelector('.kt-in')) bad.push('the hidden box lost the focus while typing');

  /* THREE CLEAN LINES OPEN THE NEXT RUNG. */
  for (const c of line.slice(6)) key(c);
  for (let i = 0; i < 2; i++) for (const c of w.ktNow_().line) key(c);
  const rung2 = () => box().querySelector('.kt-rung[data-n="1"]');
  if (!rung2() || rung2().disabled) bad.push('three lines at 90% or better did not open the Top row');
  let kept = {};
  try { kept = JSON.parse(w.localStorage.getItem(w.ktKey_()) || '{}'); } catch (e) {}
  if (kept.open !== 1) bad.push('the ladder on the device says open ' + kept.open + ', not 1');

  /* THROUGH `repaint` AND NOTHING ELSE, the timetable journey's lesson: a half-typed line and the
     open rung both survive the app's own redraw. */
  const half = w.ktNow_().line.slice(0, 3);
  for (const c of half) key(c);
  try { t.repaint(); } catch (e) { bad.push('repaint threw: ' + e.message); }
  if (!rung2() || rung2().disabled) bad.push('after a repaint the Top row is shut again');
  if (done() !== half) bad.push('after a repaint the line in hand reads "' + done() + '" done, not "' + half + '"');

  t.USER(kit);
  try { t.repaint(); } catch (e) {}
  if (!rung2() || !rung2().disabled) bad.push('a second person on the machine finds the first one\'s Top row open');
  if (done()) bad.push('a second person on the machine gets the first one\'s half-typed line');
  t.USER(sam);
  try { t.repaint(); } catch (e) {}
  if (!rung2() || rung2().disabled) bad.push('signing back in does not bring the ladder back');

  w.removeEventListener('keydown', ear);
  w.localStorage.removeItem(w.ktKey_());
  return bad;
});

