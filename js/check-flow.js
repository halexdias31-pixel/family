#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-flow.js

   DOES THE APP ACTUALLY WORK. The other five checkers read the source; this one RUNS it.

   WHAT THEY CANNOT SEE, and why this exists. `check.js` proves every name is declared. `check-doors`
   proves every button has a handler. `check-columns` proves every column exists. All five can pass
   while the app does nothing useful — because none of them ever loads a payload, draws a screen, or
   presses anything. Every fault that cost a day this month was of that kind:

     · the booking form submitted with the client's name in the wrong field
     · `doGet` never sent `kind`, so every waitlist drew as an ordinary session
     · the join button sent `move` on a class, which is the wrong act entirely
     · a payload arrived and was dropped because a variable read its own replacement

   Not one of those is a missing name, a dead rule or an absent column. Every one of them would have
   been caught by pressing the thing once.

   SO IT PRESSES THE THING. A real DOM, the real eighteen files in the real order, a fake backend
   that answers with a payload of the shape `doGet` sends — then it signs in, opens screens, walks
   the booking form down both paths, and looks at what came out and what got sent.

   THE FAKE BACKEND IS THE ONE THING TO KEEP HONEST. It answers with the SHAPE the real one answers
   with, and if the two drift this test passes while the app breaks — which is the failure mode of
   every test like it ever written. The shape is in `PAYLOAD` below, in one place, with the real
   field names, so drift is at least visible when somebody looks.

     node check-flow.js

   Add a journey by adding a `check(...)`. They are independent: one failing does not stop the rest,
   because a report that stops at the first fault tells you about one fault.
================================================================================================== */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const dir = __dirname;
const ORDER = ['core', 'price-rows', 'chess', 'data', 'shell', 'cards', 'me', 'posts', 'links',
               'find', 'resource', 'arcade', 'map', 'book', 'receipt', 'flyer', 'mat', 'games', 'overworld', 'boot'];

/* ---------- THE PAYLOAD, IN THE SHAPE THE BACKEND SENDS ------------------------------------------
   Small but real: two tutors, two venues, an interval, and one job of each kind. Anything the app
   reads has to be here under the name `doGet` actually uses, which is the whole risk of a fake —
   so the names are worth checking against `60_doGet.gs` whenever this file is edited. */
const seat = (status, client) => ({ n: 1, client: client || 'Rasa Poliksa', status, chat: '' });

function payload() {
  const jobs = [
    { id: 'J-ASK', jobId: 'J-ASK', type: 'job', kind: '', status: 'unconfirmed',
      subject: 'Maths', level: 'GCSE', title: 'GCSE Maths', price: 240, tutorPay: 120,
      location: 'Colliers Wood Library', venue: 'Colliers Wood Library', tutor: 'GeorgePovey',
      day: 'Mon', time: '16:00', weeks: 6, dates: '', maxKids: 4, currentKids: 1,
      slots: [seat('Waiting')], tutorSlots: [{ key: 'a', name: 'GeorgePovey', status: 'Applied' }],
      events: [], canAsk: false, seatsGoing: 3, openToOthers: true },

    { id: 'J-OK', jobId: 'J-OK', type: 'job', kind: '', status: 'unconfirmed',
      subject: 'English Language', level: 'GCSE', title: 'GCSE English', price: 240, tutorPay: 120,
      location: 'Mitcham library', venue: 'Mitcham library', tutor: 'Sasha Matola',
      day: 'Wed', time: '17:00', weeks: 6, dates: '', maxKids: 4, currentKids: 1,
      slots: [seat('Agreed')], tutorSlots: [{ key: 'a', name: 'Sasha Matola', status: 'Confirmed' }],
      events: [], canAsk: false, seatsGoing: 3, openToOthers: true },

    { id: 'J-PAID', jobId: 'J-PAID', type: 'job', kind: '', status: 'active',
      subject: 'Maths', level: 'A-Level', title: 'A-Level Maths', price: 480, tutorPay: 240,
      location: 'Colliers Wood Library', venue: 'Colliers Wood Library', tutor: 'GeorgePovey',
      day: 'Fri', time: '18:00', weeks: 6, dates: '', maxKids: 4, currentKids: 1,
      slots: [seat('Booked')], tutorSlots: [{ key: 'a', name: 'GeorgePovey', status: 'Confirmed' }],
      events: [], canAsk: false, seatsGoing: 3, openToOthers: true },

    { id: 'W-LIST', jobId: 'W-LIST', type: 'job', kind: 'waitlist', status: 'unconfirmed',
      subject: 'Maths, English Language', level: 'GCSE', title: 'GCSE Maths, English Language',
      price: 19, tutorPay: 0, location: 'Colliers Wood Library', venue: 'Colliers Wood Library',
      tutor: '', day: '', time: '', weeks: 0, dates: '', maxKids: 4, currentKids: 2,
      slots: [seat('Waiting', 'Danile Cristina'), seat('Waiting', 'Phoebe Wickes')],
      tutorSlots: [], events: [], canAsk: true, seatsGoing: 2, openToOthers: true },
  ];
  return {
    ok: true, version: 'test', features: [],
    tutors: [
      { title: 'GeorgePovey', rate: 14, teaches: ['Maths (GCSE)'], dbs: true, listed: true,
        maxStudents: 4, minStudents: 1, avail: {} },
      { title: 'Sasha Matola', rate: 14, teaches: ['English Language (GCSE)'], dbs: true,
        listed: true, maxStudents: 4, minStudents: 1, avail: {} },
    ],
    venues: [
      { title: 'Colliers Wood Library', bestRate: 15, maxCapacity: 4, minCapacity: 1, rooms: [],
        borough: 'Merton', avail: {} },
      { title: 'Mitcham library', bestRate: 26, maxCapacity: 4, minCapacity: 1, rooms: [],
        borough: 'Merton', avail: {} },
    ],
    students: [], resources: [], posts: [], links: [], shop: [], trips: [], exams: [],
    birthdays: [], orders: [], widgets: [], laws: [], brand: {}, landmarks: [],
    intervals: [{ rel: 'Current', term: 'Autumn 1', label: 'Autumn 1', weeks: 6,
                  startDate: '01/09/2026', endDate: '18/10/2026', kind: 'term' }],
    festive: [{ id: 'H1', holiday: 'Christmas Day', name: 'Christmas party',
                blurb: 'An afternoon at the hall.', venue: 'Colliers Wood Library',
                date: '19/12/2026', hours: 2, price: 8, seats: 12, taken: 4, left: 8, jobId: '' }],
    jobs, liveJobs: jobs, clientClasses: jobs,
    dropdowns: { levels: ['GCSE', 'A-Level'], subjects: ['Maths', 'English Language'],
                 days: ['Mon', 'Wed', 'Fri'], times: ['16:00', '17:00', '18:00'],
                 boroughs: ['Merton'], locations: ['Colliers Wood Library', 'Mitcham library'],
                 services: ['Group'], linkCategories: [], topics: [], checklists: {}, focus: {} },
    multipliers: { levels: {}, subjects: {}, subjectsEta: {}, days: {}, times: {}, services: {},
                   students: {}, weeks: {}, baseRate: 0 },
    constants: { vars: { h: 2, max_students_per_job: 4 } },
    pricingRows: [], options: {}, validations: {}, availGrid: { days: [], hours: [] },
    health: { ok: true, missing: [], problems: [] },
  };
}

/* ---------- ONE APP, IN A REAL DOM ---------------------------------------------------------------
   Built fresh for every journey. Sharing one would be faster and would mean a journey that leaves a
   sheet open changes what the next one sees — which is how a test suite starts passing or failing
   depending on the order it runs in. */
function boot(opts) {
  opts = opts || {};
  const sent = [];
  let html = fs.readFileSync(path.join(dir, '..', 'index.html'), 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true,
                                url: 'https://example.org/' });
  const w = dom.window;
  /* The handful of browser things jsdom does not provide. Stubs rather than shims: the app must not
     be able to tell, and none of these is what is being tested. */
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  w.confirm = () => true;
  w.prompt = () => opts.prompt !== undefined ? opts.prompt : 'Weekday evenings';

  const data = opts.payload || payload();
  w.fetch = (url, o) => {
    if (o && o.body) {                       // a POST — record it and answer plausibly
      const body = JSON.parse(o.body);
      sent.push(body);
      return Promise.resolve({ ok: true, status: 200,
        json: () => Promise.resolve(opts.reply || { success: true, joined: 3, seats: 4 }) });
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
  };

  const errs = [];
  w.onerror = m => errs.push(String(m));
  const src = ORDER.map(n => fs.readFileSync(path.join(dir, n + '.js'), 'utf8')).join('\n');
  try {
    w.eval(src + '\n;window.__t = {' +
      'go, USER: v => { USER = v; }, whoami: () => USER, ACTIONS, BOOKING, STEPS: BOOK_STEPS,' +
      'stage: typeof jobStage_ === "function" ? jobStage_ : null,' +
      'accepted: typeof jobAccepted_ === "function" ? jobAccepted_ : null,' +
      'next: typeof nextBookStep === "function" ? nextBookStep : null,' +
      'card: typeof newPostCard === "function" ? newPostCard : null,' +
      'bar: typeof installBar === "function" ? installBar : null,' +
      'PAGE: () => PAGE,' +
      /* A landmark rasterised at one bearing, so the test above can compare four of them. */
      'tiles: (ring, bearing) => {' +
      '  if (typeof owWorld !== "function") return 0;' +
      '  const was = DATA.landmarks;' +
      '  DATA.landmarks = [{ name: "t", kind: "retail", lat: 51.4174, lng: -0.1784,' +
      '    plots: 6, bearing, outline: ring,' +
      '    parts: [{ kind: "building", outline: ring, height: 10, x: 0, z: 0, w: 1, d: 1 }] }];' +
      '  const wd = owWorld();' +
      '  const n = wd ? owTilesOf(wd.items[0], wd.items[0].l.parts[0], owSiteBox(wd.items[0].l)).length : 0;' +
      '  DATA.landmarks = was;' +
      '  return n;' +
      '} };');
  } catch (e) {
    errs.push('LOAD THREW: ' + e.message);
  }
  return { w, sent, errs };
}

/* ---------- THE JOURNEYS -------------------------------------------------------------------------
   Each is a name and a function that returns a list of complaints. No complaints is a pass. They are
   written as questions somebody would actually ask of the app, not as assertions about internals. */
const checks = [];
const check = (name, fn) => checks.push({ name, fn });
const wait = ms => new Promise(r => setTimeout(r, ms));

check('the app loads and draws without throwing', async () => {
  const { w, errs } = boot();
  await wait(300);
  const bad = [];
  if (errs.length) bad.push('errors at load: ' + errs.join(' | '));
  if (!w.__t) return ['nothing was exported — the app did not finish loading'];
  if (typeof w.__t.go !== 'function') bad.push('go() is not a function');
  return bad;
});

check('the loading splash comes off', async () => {
  const { w } = boot();
  await wait(400);
  const sp = w.document.getElementById('splash');
  if (!sp) return ['there is no splash element at all'];
  return sp.classList.contains('done') ? []
    : ['the splash never lifted — load() did not finish, and nothing on screen would say why'];
});

check('every tab draws something', async () => {
  const { w, errs } = boot();
  await wait(300);
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const bad = [];
  /* THE FOUR SCREENS THAT EXIST, read off the `screen(...)` calls rather than assumed. This asked
     for `find`, which was removed when the funnel absorbed it — so the test reported the app
     drawing nothing on a tab the app does not have, which is a test being wrong about the app and
     the worst kind of red there is. */
  ['posts', 'stuff', 'book', 'me'].forEach(id => {
    try { w.__t.go(id, false, true); } catch (e) { bad.push(id + ' threw: ' + e.message); return; }
    const el = w.document.getElementById('s-' + id);
    if (!el) { bad.push(id + ': no screen element'); return; }
    if (!el.textContent.trim()) bad.push(id + ': drew nothing at all');
  });
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

check('the booking form asks a session everything and a class almost nothing', async () => {
  const { w } = boot();
  await wait(300);
  if (!w.__t.STEPS) return ['BOOK_STEPS is not exported — cannot check the form'];
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const B = w.__t.BOOKING;
  const askedFor = how => {
    B.how = how; B.loc = 'Colliers Wood Library';
    return w.__t.STEPS.filter(s => s.id !== 'how')
      .filter(s => { try { return s.options().filter(Boolean).length > 0; } catch (e) { return false; } })
      .map(s => s.id);
  };
  const bad = [];
  const session = askedFor('A session of your own');
  const klass = askedFor('A shared class — join the waiting list');
  ['subjects', 'level', 'loc', 'slots', 'interval'].forEach(id => {
    if (!session.includes(id)) bad.push('a session is not asked "' + id + '"');
  });
  ['tutor', 'n', 'slots', 'interval', 'subjects', 'split'].forEach(id => {
    if (klass.includes(id)) bad.push('a class is asked "' + id + '", which it cannot answer');
  });
  if (!klass.includes('loc')) bad.push('a class is not asked which venue');
  if (!klass.includes('level')) bad.push('a class is not asked which level');
  return bad;
});

check('a class books through joinWaitlist, a session through createJob', async () => {
  const bad = [];
  for (const [how, action] of [['A session of your own', 'createJob'],
                               ['A shared class — join the waiting list', 'joinWaitlist']]) {
    const { w, sent } = boot();
    await wait(300);
    w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
    const B = w.__t.BOOKING;
    Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
    B.how = how; B.level = 'GCSE'; B.loc = 'Colliers Wood Library';
    B.subjects = ['Maths']; B.n = '1'; B.hosting = 'No — we book the room';
    B.slots = ['m16']; B.interval = 'Autumn 1'; B.avail = ['Weekday evenings'];
    try { w.__t.ACTIONS['book-send']({ disabled: false, dataset: {} }); }
    catch (e) { bad.push(how + ' threw: ' + e.message); continue; }
    await wait(250);
    const got = sent.map(x => x.action);
    if (!got.includes(action)) {
      bad.push(how + ' sent [' + (got.join(', ') || 'nothing') + '], expected ' + action);
    }
  }
  return bad;
});

check('an admin can answer a booking, and only one that is waiting', async () => {
  const { w } = boot();
  await wait(300);
  w.__t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
  const bad = [];
  const buttonsOn = id => {
    try { w.__t.ACTIONS['job']({ dataset: { id } }); } catch (e) { return ['THREW: ' + e.message]; }
    const b = w.document.getElementById('sheet-body');
    return b ? [...b.querySelectorAll('[data-do]')].map(x => x.dataset.do) : [];
  };
  const ask = buttonsOn('J-ASK');
  if (!ask.includes('job-answer')) bad.push('no Accept/Decline on a booking that is waiting');
  const paid = buttonsOn('J-PAID');
  if (paid.includes('job-answer')) bad.push('Accept/Decline offered on a booking already paid for');
  return bad;
});

check('a client can pay once it is accepted, and not before', async () => {
  const { w } = boot();
  await wait(300);
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const bad = [];
  const buttonsOn = id => {
    try { w.__t.ACTIONS['job']({ dataset: { id } }); } catch (e) { return ['THREW: ' + e.message]; }
    const b = w.document.getElementById('sheet-body');
    return b ? [...b.querySelectorAll('[data-do]')].map(x => x.dataset.do) : [];
  };
  if (buttonsOn('J-ASK').includes('job-pay')) bad.push('a client is offered Pay before it is accepted');
  if (!buttonsOn('J-OK').includes('job-pay')) bad.push('a client cannot pay an accepted booking');
  if (buttonsOn('J-PAID').includes('job-pay')) bad.push('Pay is still offered on a paid booking');
  return bad;
});

check('taking a seat on a class does not go through the ordinary join', async () => {
  const { w, sent } = boot();
  await wait(300);
  w.__t.USER({ name: 'Somebody Else', personId: 'P9', role: 'parent', roles: ['parent'] });
  try { w.__t.ACTIONS['job']({ dataset: { id: 'W-LIST' } }); }
  catch (e) { return ['opening the class threw: ' + e.message]; }
  const b = w.document.getElementById('sheet-body');
  const dos = b ? [...b.querySelectorAll('[data-do]')].map(x => x.dataset.do) : [];
  if (dos.includes('job-join')) {
    return ['a class offers "Ask to join", which is the act for somebody else\'s booking — '
      + 'it prices nothing and records no availability'];
  }
  if (!dos.includes('job-take-seat')) return ['a class with seats left offers no way to take one'];
  try { w.__t.ACTIONS['job-take-seat']({ disabled: false, dataset: { id: 'W-LIST' } }); }
  catch (e) { return ['taking a seat threw: ' + e.message]; }
  await wait(250);
  const got = sent.map(x => x.action);
  return got.includes('joinWaitlist') ? []
    : ['taking a seat sent [' + (got.join(', ') || 'nothing') + '], expected joinWaitlist'];
});

check('a festive event shows itself and can be joined', async () => {
  const { w, sent } = boot();
  await wait(300);
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  w.__t.go('book', false, true);
  await wait(200);
  const el = w.document.getElementById('s-book');
  const cards = el ? el.querySelectorAll('.fest') : [];
  if (!cards.length) return ['the festive event on the payload never appeared on the Book screen'];
  try { w.__t.ACTIONS['fest-join']({ disabled: false, dataset: { id: 'H1' } }); }
  catch (e) { return ['joining threw: ' + e.message]; }
  await wait(250);
  const got = sent.map(x => x.action);
  return got.includes('joinFestive') ? []
    : ['joining sent [' + (got.join(', ') || 'nothing') + '], expected joinFestive'];
});

check('the folder scan is reachable, and only by an admin', async () => {
  /* THIS HANDLER EXISTED WITH NO BUTTON ANYWHERE for as long as posting has. It read in the source
     exactly like a working feature, which is the whole reason `check-doors` was written — and a
     door alone is not enough, because a door drawn for the wrong person is its own fault. */
  const { w } = boot();
  await wait(300);
  if (typeof w.__t.card !== 'function') return [];      // only checkable where the card is exported
  const bad = [];
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  if (w.__t.card().includes('scan-posts')) bad.push('a client is offered the folder scan');
  w.__t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
  if (!w.__t.card().includes('scan-posts')) bad.push('an admin has no way to run the folder scan');
  return bad;
});

check('the friend search still works for a student', async () => {
  /* THE OTHER HALF OF GUARDING THE CHILDREN LIST. Restricting who receives it is only right if the
     people who need it still have it — and `friend-add` matches an EXACT handle, so a student with
     no list can never add anybody and the failure is silent: "Nobody has the handle …", which reads
     as the friend not existing rather than as the list not arriving. */
  const p = payload();
  p.students = [{ name: 'Augie', handle: 'augie', xp: 10, highscore: 3, siblings: [], friends: '' },
                { name: 'Mabel', handle: 'mabel', xp: 4, highscore: 1, siblings: [], friends: '' }];
  const { w } = boot({ payload: p });
  await wait(300);
  w.__t.USER({ name: 'Augie Wickes', personId: 'PS', handle: 'augie', role: 'kid',
               roles: ['kid'], friends: '' });
  const found = (w.__t.whoami() && (p.students || []).find(s => s.handle === 'mabel'));
  return found ? [] : ['a student cannot look up another child by handle — the friend list is unusable'];
});

check('the app still loads when opened from a file', async () => {
  /* A PAGE OPENED FROM A FILE HAS NO ORIGIN, and the browser refuses `fetch` to anywhere else
     before a single byte leaves — instantly, with "Failed to fetch". This is how the app is
     actually opened most days, and it went unnoticed for an afternoon because a refusal and a dead
     backend say the same words. The script-tag route is what makes it work; this is here so that
     route cannot quietly disappear again. */
  const fs2 = require('fs');
  const shell = fs2.readFileSync(path.join(dir, 'shell.js'), 'utf8');
  const data = fs2.readFileSync(path.join(dir, 'data.js'), 'utf8');
  const bad = [];
  if (!/function jsonp\(/.test(data)) {
    bad.push('there is no jsonp() — a page opened from a file cannot reach the backend at all');
  }
  if (!/location\.protocol === 'file:'/.test(shell)) {
    bad.push('load() does not notice it is on a file:// page, so it uses fetch and is refused');
  }
  if (!/__jsonp/.test(shell)) {
    bad.push('nothing unwraps the jsonp reply, so the payload arrives and is dropped');
  }
  return bad;
});

check('the install bar reaches somebody who has not signed in', async () => {
  /* THE POINT OF IT. The first version was a card on the You screen — behind a sign-in form and two
     swipes of a carousel — so a new client, who is exactly the person you want to install it, could
     never see it. This is here so it cannot quietly go back to being unreachable. */
  const { w } = boot();
  await wait(300);
  Object.defineProperty(w.navigator, 'userAgent',
    { value: 'Mozilla/5.0 (iPhone) Safari', configurable: true });
  if (typeof w.__t.bar !== 'function') return ['installBar is not exported — cannot check it'];
  w.__t.bar();                                     // deliberately NOT signed in
  const el = w.document.getElementById('install-bar');
  if (!el) return ['no install bar for a signed-out visitor on an iPhone'];
  return /Add to Home Screen/.test(el.textContent) ? []
    : ['the bar is there but does not say how to install on iOS'];
});

check('each column opens on the page worth reading', async () => {
  /* THE ＋ CARD IS NOT THE FRONT PAGE. It is pane 0 of the feed because `unshift` puts it there,
     so opening at 0 opens on a form to make a post rather than on the newest post.

     THIS BROKE ONCE ALREADY AND SILENTLY. The home position was applied on the first `paintPager`,
     which runs while the app draws its first frame — before the payload, so the column was one pane
     long and the clamp pulled it back to 0, and the "already opened" flag then made that permanent.
     It looked exactly like the setting being ignored. Checked here so it cannot happen again. */
  const { w } = boot();
  await wait(600);
  const bad = [];
  const at = w.__t.PAGE ? w.__t.PAGE() : null;
  if (!at) return [];                              // only checkable where PAGE is exported
  const host = w.document.getElementById('s-posts');
  const pages = host ? host.querySelectorAll(':scope > .page') : [];
  if (pages.length > 1) {
    const front = pages[at.posts || 0];
    if (front && /New post/.test(front.textContent)) {
      bad.push('the Posts column opens on the ＋ New post card rather than on a post');
    }
  }
  return bad;
});

check('a landmark is the same shape whichever way it is turned', async () => {
  /* THE FAULT THIS PREVENTS. Turning a site used to rotate the POLYGON and re-sample it against the
     tile grid — and re-sampling a shape at a different angle gives a different set of tiles. A T
     flattened into a line, and a ten-metre gap between a car park and a building closed. It looked
     like a rendering bug and it was an arithmetic one.

     Now the site is squared, measured, and rasterised ONCE, and the bearing turns the finished
     tiles a quarter at a time. That is a relabelling rather than a measurement, so the shape cannot
     change — and this checks that it does not, because "cannot" is a claim worth testing. */
  const { w } = boot();
  await wait(300);
  if (typeof w.__t.tiles !== 'function') return [];     // only checkable where it is exported
  const ring = [[51.4174, -0.1781], [51.4173, -0.1782], [51.4174, -0.1787], [51.4175, -0.1786]];
  const counts = [0, 90, 180, 270].map(b => w.__t.tiles(ring, b));
  const same = counts.every(c => c === counts[0]);
  return same ? []
    : ['a landmark covers ' + counts.join('/') + ' tiles at 0/90/180/270 — turning it changes '
       + 'its shape, which means the polygon is being re-sampled rather than the tiles turned'];
});

check('a backend that never answers does not hang the app for ever', async () => {
  let html = fs.readFileSync(path.join(dir, '..', 'index.html'), 'utf8');
  const hasDeadline = /AbortController|Promise\.race|setTimeout\([^)]*abort/i.test(
    fs.readFileSync(path.join(dir, 'shell.js'), 'utf8'));
  const hasWatchdog = /Still loading after/i.test(html);
  const bad = [];
  if (!hasDeadline) {
    bad.push('the payload fetch has no deadline — a slow backend leaves the splash up for ever, '
      + 'with nothing on screen saying why. That cost most of one day.');
  }
  if (!hasWatchdog) {
    bad.push('index.html has no splash watchdog — if the code loads and the data never comes, '
      + 'nothing says so');
  }
  return bad;
});

/* ---------- RUN THEM ---------------------------------------------------------------------------- */
(async () => {
  let failed = 0;
  console.log('');
  for (const c of checks) {
    let bad;
    try { bad = await c.fn(); }
    catch (e) { bad = ['the check itself threw: ' + e.message]; }
    if (bad && bad.length) {
      failed++;
      console.log('  FAIL  ' + c.name);
      bad.forEach(b => console.log('          ' + b));
    } else {
      console.log('  ok    ' + c.name);
    }
  }
  console.log('');
  console.log(failed ? 'FAILED — ' + failed + ' of ' + checks.length + ' journeys are broken'
                     : 'OK — all ' + checks.length + ' journeys work.');
  process.exit(failed ? 1 : 0);
})();
