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

