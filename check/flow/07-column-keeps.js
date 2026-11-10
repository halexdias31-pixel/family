/* ---------- A WIDGET'S LEAVE, WAITED FOR § */
/* A COLUMN'S WIDGETS ARE STARTED AND STOPPED FROM `afterSlide_`, about 300ms after the move, so a
   journey asking what leaving did has to wait that long first. */
const LEAVE_MS = 700;
/* AND ARRIVING NO LONGER STARTS THEM ALL IN THAT ONE TASK (5 Oct, `widgetsWake_` in arcade.js): § */
const woken_ = async () => {
  for (let k = 0; k < 80; k++) {
    let quiet = true;
    try { quiet = !LAST_W || !LAST_W.__t || !LAST_W.__t.quiet || LAST_W.__t.quiet(); } catch (e) { quiet = true; }
    if (quiet) return;
    await wait(100);
  }
};

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

/* ---------- VENUES ARE OFF FIND, AND A STARRED VENUE IS STILL ON SAVED § */
check('venues are off Find, and a starred venue is still on Saved', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.funnelItems || !t.allItems || !t.savedPages || !t.doors || !t.star) {
    return ['the funnel\'s two lists and the Saved column are not exported'];
  }
  const bad = [];
  const all = t.allItems().filter(x => x.kind === 'venue');
  if (!all.length) return ['the payload\'s two venues are not items at all, so nothing here measures anything'];
  const found = t.funnelItems().filter(x => x.kind === 'venue');
  if (found.length) {
    bad.push(found.length + ' venue(s) are still in the list Find draws (' + found.map(x => x.name).join(', ')
             + ') — the owner asked for booking places to be taken off it. See `venue` in KINDS.');
  }
  const doors = t.doors();
  const fused = doors.filter(d => /,/.test(d));
  if (fused.length) bad.push('Find\'s first question offers ' + fused.map(d => '"' + d + '"').join(', ')
                             + ' — two groups drawn as one door');
  if (doors.some(d => /^(Places|Booking)$/i.test(d))) {
    bad.push('Find\'s first question still offers ' + doors.join(' | '));
  }
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  t.star(all[0].key);
  const saved = t.savedPages().join('');
  if (saved.indexOf(all[0].name) === -1) {
    bad.push('"' + all[0].name + '" was starred and is not on the Saved column — taking a kind off Find '
             + 'must not take it off the list of things somebody kept. See `collItems_`.');
  }
  return bad;
});

/* THE IPAD DOUBLE TAP (466) — the owner: "With iPad when I double tap on the screen, it breaks — the widget list shifts up." */
check('a double tap neither zooms nor moves the column: touch-action manipulation on the page, and dblclick is refused', async () => {
  const css = fs.readFileSync(path.join(dir, '..', 'style.css'), 'utf8');
  const bad = [];
  const html = /\nhtml \{[^}]*touch-action:\s*manipulation/.test(css);
  if (!html) bad.push('style.css: `html` has no `touch-action: manipulation` — iPad Safari double-tap-zooms whatever the viewport says');
  const { w } = boot();
  await wait(200);
  const ev = new w.MouseEvent('dblclick', { bubbles: true, cancelable: true });
  w.document.getElementById('screen').dispatchEvent(ev);
  if (!ev.defaultPrevented) bad.push('a dblclick on the app was not refused — Safari would zoom on it');
  return bad;
});

/* NO SPLASH (466) — the owner: "I want to click on the app and it opens straight away." The first screen is drawn before the payload, and the load still says when it finished. */
check('the app opens straight onto its first screen, and the load says when it finished', async () => {
  const { w } = boot();
  const bad = [];
  if (w.document.getElementById('splash')) bad.push('there is a #splash again — nothing may cover the app while it loads');
  const first = w.document.getElementById('s-' + w.__t.AT());
  /* DRAWN, not necessarily full: the feed's posts come with the payload, so before it the feed is loading_()'s dots in place, under nothing. */
  if (!first || !(first.textContent.trim() || first.querySelector('.loading[role="status"]'))) bad.push('the first screen is empty straight after boot — it must draw (its own dots if it waits) before the payload');
  await wait(400);
  if (!w.document.documentElement.classList.contains('is-loaded')) bad.push('`html.is-loaded` never came — load() did not finish, and nothing would say why');
  return bad;
});

check('every tab draws something', async () => {
  const { w, errs } = boot();
  await wait(300);
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const bad = [];
  /* THE SCREENS THAT EXIST, read off `TABS` rather than written out. § */
  (w.__t.TABS || []).map(t => t.id).forEach(id => {
    try { w.__t.go(id, false, true); } catch (e) { bad.push(id + ' threw: ' + e.message); return; }
    const el = w.document.getElementById('s-' + id);
    if (!el) { bad.push(id + ': no screen element'); return; }
    /* THE ONE LOADER IS SOMETHING DRAWN ON MESSAGES ALONE, and only while its ask is out: § */
    if (!el.textContent.trim() && !(id === 'dm' && el.querySelector('.loading'))) bad.push(id + ': drew nothing at all');
  });
  /* AND MESSAGES ONCE ITS ASK HAS ANSWERED: words, not the loader for ever. */
  await wait(300);
  const dm = w.document.getElementById('s-dm');
  if (dm && !dm.textContent.trim()) bad.push('dm: still drew nothing but the loader after its ask answered');
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

check('a booking is drawn as the right kind of document', async () => {
  const { w } = boot();
  await wait(300);
  if (!w.__t.stage) return ['jobStage_ does not exist — the four widget states are not built'];
  const bad = [];
  const want = { 'J-ASK': 'application', 'J-OK': 'application', 'J-PAID': 'receipt',
                 'W-LIST': 'waitlist' };
  (w.__t.whoami() || {});
  const jobs = payload().jobs;
  jobs.forEach(j => {
    const got = w.__t.stage(j);
    if (got !== want[j.id]) bad.push(j.id + ' drew as ' + got + ', expected ' + want[j.id]);
  });
  /* AND THE ONE THAT MATTERS MOST: accepted-but-unpaid is still an application. It was drawn as a
     receipt once, which told a family they had bought something they had not. */
  if (w.__t.accepted) {
    const ok = jobs.find(j => j.id === 'J-OK');
    if (!w.__t.accepted(ok)) bad.push('J-OK is agreed on both sides and does not read as accepted');
    const ask = jobs.find(j => j.id === 'J-ASK');
    if (w.__t.accepted(ask)) bad.push('J-ASK is still waiting and reads as accepted');
  }
  return bad;
});

check('every question the form asks has a row on the paper', async () => {
  /* ---------- THE CARD USED TO DELETE ITS OWN UNANSWERED QUESTIONS § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.STEPS) return ['BOOK_STEPS is not exported — cannot check the form'];
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const B = w.__t.BOOKING;
  B.how = 'Instant class';
  B.loc = 'Colliers Wood Library';
  /* ENOUGH TO BE COSTABLE, which is the state the fault needed — an unpriced booking always drew
     the full list and looked fine. */
  B.subjects = ['Maths'];
  B.level = '11+';

  const html = w.__t.paper ? w.__t.paper() : '';
  if (!html) return ['bookBreakdown is not exported — cannot check the paper'];
  const bad = [];
  /* ---------- A WEEK STEP IS SEVEN ROWS AND ITS `short` NAMES NONE OF THEM § */
  const days = w.__t.days ? w.__t.days() : [];
  w.__t.STEPS
    .filter(s => { try { return s.options().filter(Boolean).length > 0; } catch (e) { return false; } })
    .forEach(s => {
      const want = s.week ? days.map(d => String(d).slice(0, 3)) : [s.short || s.id];
      if (s.week && !days.length) { bad.push('SLOT_DAYS is not exported — cannot check a week step'); return; }
      want.forEach(k => {
        if (!html.includes('>' + k + '<')) {
          bad.push('"' + s.label + '" is asked but has no ' + (s.week ? k + ' ' : '') + 'row on the paper');
        }
      });
    });
  return bad;
});

check('the paper keeps the same rows whatever is answered', async () => {
  /* ---------- ROWS USED TO COME AND GO § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.paper) return ['bookBreakdown is not exported — cannot check the paper'];
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const B = w.__t.BOOKING;

  /* THE QUESTIONS ONLY, which is what has to hold still. § */
  const asked = w.__t.STEPS.map(s => s.short || s.id);
  const shape = skip => (w.__t.paper().match(/class="bk-k">[^<]*/g) || [])
    .map(x => x.split('>')[1])
    .filter(k => asked.indexOf(k) !== -1 && (!skip || skip.indexOf(k) === -1))
    .join('|');

  /* ---------- AND ONE QUESTION MAY BELONG TO ONE BRANCH, IF IT SAYS SO § */
  /* ---------- A WEEK STEP'S ROWS ARE SHARED BY BOTH BRANCHES ON PURPOSE § */
  const BRANCHED = w.__t.STEPS.filter(s => s.only && !s.week).map(s => s.short || s.id);
  const has = k => shape().split('|').indexOf(k) !== -1;

  B.how = 'Instant class'; B.loc = 'Colliers Wood Library';
  B.subjects = []; B.level = ''; B.joining = '';
  const blank = shape();
  const blankShared = shape(BRANCHED);
  const bookOnly = w.__t.STEPS.filter(s => s.only && !s.week).map(s => [s.short || s.id, s.only, has(s.short || s.id)]);

  B.subjects = ['Maths']; B.level = '11+';
  const priced = shape();

  B.how = 'Waiting list class';
  const klass = shape();
  const klassShared = shape(BRANCHED);
  const waitOnly = w.__t.STEPS.filter(s => s.only && !s.week).map(s => [s.short || s.id, s.only, has(s.short || s.id)]);

  const bad = [];
  if (!blank) bad.push('the paper drew no rows at all');
  if (priced !== blank) {
    bad.push('answering changed which rows exist:\n            was  ' + blank
      + '\n            now  ' + priced);
  }
  if (klassShared !== blankShared) {
    bad.push('choosing a waiting list changed which rows exist:\n            was  ' + blank
      + '\n            now  ' + klass);
  }
  /* `only:` IS A LIST OF WORDS NOW (docs/history/353): § */
  const SAYS = { book: ['book', 'tutoring'], wait: ['wait'] };
  const owed = (only, on) => String(only).split(',').map(x => x.trim()).some(x => SAYS[on].indexOf(x) !== -1);
  [['book', bookOnly], ['wait', waitOnly]].forEach(([on, list]) => {
    list.forEach(([k, only, there]) => {
      if (owed(only, on) && !there) bad.push('"' + k + '" is declared only: ' + only
        + ' and is not on that branch\'s paper');
      if (!owed(only, on) && there) bad.push('"' + k + '" is declared only: ' + only
        + ' and is drawn on the ' + on + ' branch as well, so the flag does nothing');
    });
  });
  return bad;
});

check('a price lands on the question that caused it', async () => {
  /* ---------- THE FIGURES WERE STRANDED FROM THEIR ANSWERS § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.paper) return ['bookBreakdown is not exported — cannot check the paper'];
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  Object.assign(w.__t.BOOKING, { how: 'Instant class', loc: 'Colliers Wood Library',
    level: '11+', n: '2', subjects: ['Maths', 'English'] });

  const html = w.__t.paper();
  const rows = html.match(/<div class="bk-row[\s\S]*?<span class="bk-t">[^<]*<\/span>/g) || [];
  const cell = (r, c) => ((r.match(new RegExp('class="' + c + '">([^<]*)')) || [])[1] || '').trim();
  const find = k => rows.find(r => cell(r, 'bk-k') === k);

  const bad = [];
  const venue = find('Venue');
  if (!venue) bad.push('there is no Venue row at all');
  else if (!cell(venue, 'bk-t')) {
    bad.push('the Venue row carries no running total — its price did not find its question');
  }
  /* ---------- AND THE BASE LINE IS STILL THERE, WHEREVER IT NOW LIVES § */
  const tutor = find('Tutor');
  if (!tutor) bad.push('there is no Tutor row, so the base charge has nowhere to be');
  else if (!cell(tutor, 'bk-t')) {
    bad.push('the base charge has vanished — the Tutor row carries no running total');
  }
  return bad;
});

check('an instant class with room can be joined, not only a waiting list', async () => {
  /* ---------- HALF THE JOINABLE THINGS WERE INVISIBLE § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.STEPS) return ['BOOK_STEPS is not exported — cannot check the form'];
  w.__t.USER({ name: 'Somebody Else', personId: 'P9', role: 'parent', roles: ['parent'] });
  const B = w.__t.BOOKING;
  const step = w.__t.STEPS.find(s => s.id === 'joining');
  if (!step) return ['there is no joining step'];

  const bad = [];
  B.how = '';
  if (step.options().filter(Boolean).length) {
    bad.push('classes are offered before the kind has been chosen');
  }
  B.how = 'Instant class';
  if (step.options().filter(Boolean).length < 1) {
    bad.push('an instant booking is offered nothing at all, not even "start a new one"');
  }
  B.how = 'Waiting list class';
  const lists = step.options().filter(Boolean);
  if (!lists.length) bad.push('a waiting list booking is offered nothing');
  return bad;
});

