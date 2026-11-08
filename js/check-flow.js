#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-flow.js DOES THE APP ACTUALLY WORK. § */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const dir = __dirname;
/* THE LIBRARY WITH ITS WORDS (397): data/*.json is card metadata, and the private half comes back from data-private/. */
const LIB_FULL = require('../check/lib-full.js');
const { MEMBER_, signedInAs_ } = require('../check/flow-shared.js');   /* boot() reads them */
let LAST_W = null;
/* ---------- THE ORDER IS READ FROM index.html, NOT KEPT HERE § */
function loadOrder_() {
  const html = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'index.html'), 'utf8');
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
  if (!m) {
    console.error('cannot read window.FILES out of index.html — that list IS the load order');
    process.exit(1);
  }
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}
const ORDER = loadOrder_();

/* ---------- THE PAYLOAD, IN THE SHAPE THE BACKEND SENDS § */
const seat = (status, client) => ({ n: 1, client: client || 'Pat Parent', status, chat: '' });

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
      slots: [seat('Waiting', 'Dee Parent'), seat('Waiting', 'Fay Parent')],
      tutorSlots: [], events: [], canAsk: true, seatsGoing: 2, openToOthers: true,
      /* `whenCould` IS WHAT `doGet` SENDS ON EVERY WAITING LIST — `waitlistWhen`'s tally of the two families' own answers, most popular first — and this list never § */
      whenCould: { people: 2, slots: [{ slot: 'Monday evening', n: 2, all: true },
                                      { slot: 'Saturday morning', n: 1, all: false }] } },
  ];
  /* ---------- `client` IS SENT AND THIS PAYLOAD DID NOT SEND IT § */
  jobs.forEach(j => {
    if (!j.client) j.client = ((j.slots || [])[0] || {}).client || '';
  });
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
    students: [], resources: [], posts: [], shop: [], exams: [],
    birthdays: [], laws: [], brand: {},
    intervals: [{ rel: 'Current', term: 'Autumn 1', label: 'Autumn 1', weeks: 6,
                  startDate: '01/09/2026', endDate: '18/10/2026', kind: 'term' }],
    jobs, liveJobs: jobs, clientClasses: jobs,
    dropdowns: { levels: ['GCSE', 'A-Level'], subjects: ['Maths', 'English Language'],
                 days: ['Mon', 'Wed', 'Fri'], times: ['16:00', '17:00', '18:00'],
                 boroughs: ['Merton'], locations: ['Colliers Wood Library', 'Mitcham library'],
                 services: ['Group'], topics: [], checklists: {}, focus: {} },
    multipliers: { levels: {}, subjects: {}, subjectsEta: {}, days: {}, times: {}, services: {},
                   students: {}, weeks: {}, baseRate: 0 },
    /* ---------- PRICED, SO THE JOURNEYS BELOW ARE NOT PASSING ON AN EMPTY ROOM § */
    constants: { vars: { h: 2, max_students_per_job: 4,
                         print_rate_per_page: 0.02, laminate_rate_per_page: 0.35,
                         laminate_minimum: 0.5 } },
    pricingRows: [], options: {}, validations: {}, availGrid: { days: [], hours: [] },
    health: { ok: true, missing: [], problems: [] },
  };
}

/* ---------- ONE APP, IN A REAL DOM § */
function boot(opts) {
  opts = opts || {};
  const sent = [];
  let html = fs.readFileSync(path.join(dir, '..', 'index.html'), 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true,
                                /* A JOURNEY MAY ARRIVE ON AN ADDRESS — `?verify=` is read at boot,
                                   so the only way to test it is to start there. */
                                url: opts.url || 'https://example.org/' });
  const w = dom.window;
  /* The handful of browser things jsdom does not provide. Stubs rather than shims: the app must not
     be able to tell, and none of these is what is being tested. */
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  /* A CLOSED WINDOW DRAWS NO MORE FRAMES, as in a browser: this is Node's timer, which outlives `w.close()` and ran a frame on a window with no document */
  w.requestAnimationFrame = cb => setTimeout(() => { if (w.document) cb(Date.now()); }, 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  w.confirm = () => true;
  w.prompt = () => opts.prompt !== undefined ? opts.prompt : 'Weekday evenings';

  const data = opts.payload || payload();
  /* ---------- EVERY GET IS WRITTEN DOWN, AND A JOURNEY MAY ANSWER ONE ITSELF § */
  const gets = [];
  w.fetch = (url, o) => {
    if (!(o && o.body)) {
      gets.push(String(url));
      const got = typeof opts.serve === 'function' ? opts.serve(String(url)) : undefined;
      /* A PROMISE IS A FILE THAT ARRIVES WHEN THE JOURNEY SAYS — the slow network, on demand. */
      const answer = v => (v === null
        ? { ok: false, status: 404, text: () => Promise.resolve('Not found'), json: () => Promise.reject(new Error('404')) }
        : { ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(v)), json: () => Promise.resolve(v) });
      if (got && typeof got.then === 'function') return got.then(answer);
      if (got !== undefined) return Promise.resolve(answer(got));
    }
    /* ---------- THE STUB HAD NO `text()`, AND THAT HID EVERY WRITE'S SUCCESS PATH § */
    const body_ = txt => ({ ok: true, status: 200,
      text: () => Promise.resolve(JSON.stringify(txt)),
      json: () => Promise.resolve(txt) });
    if (o && o.body) {                       // a POST — record it and answer plausibly
      const body = JSON.parse(o.body);
      sent.push(body);
      /* A FUNCTION MAY ANSWER PER ACTION, so a journey can play an older server that knows some
         actions and not others. */
      const rep = typeof opts.reply === 'function' ? opts.reply(body) : opts.reply;
      /* A PROMISE IS A REPLY THAT ARRIVES WHEN THE JOURNEY SAYS — two requests answered in the other
         order, which is how a stale `myProfile` came to paint over a confirmation (review round three). */
      if (rep && typeof rep.then === 'function') return rep.then(v => body_(v || { success: true }));
      return Promise.resolve(body_(rep || { success: true, joined: 3, seats: 4 }));
    }
    return Promise.resolve(body_(data));
  };

  const errs = [];
  w.onerror = m => errs.push(String(m));
  /* JSDOM HAS NO MEDIA PLAYER. § */
  try {
    w.HTMLMediaElement.prototype.pause = function () {};
    w.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
    w.HTMLMediaElement.prototype.load = function () {};
  } catch (e) {}
  /* ---------- AND WHAT A JOURNEY NEEDS IN PLACE BEFORE THE FIRST LINE OF THE APP RUNS § */
  /* ---------- THE BUILDER IS HELD, UNLESS A JOURNEY ASKS FOR IT § */
  w.__aheadHold = !opts.ahead;
  /* THE FINDER IS FOR MEMBERS (400): `member: true` arrives signed in as a client, so a journey about the funnel has one. */
  if (opts.member && typeof opts.before !== 'function') signedInAs_(MEMBER_)(w);
  if (typeof opts.before === 'function') opts.before(w);
  const src = ORDER.map(n => fs.readFileSync(path.join(dir, n + '.js'), 'utf8')).join('\n');
  try {
    w.eval(src + '\n;window.__t = {' +
      'go, USER: v => { USER = v; }, whoami: () => USER, ACTIONS, BOOKING, STEPS: BOOK_STEPS, isTutorRole,' +
      /* THE TOOLS AND GAMES ARE FIND CARDS (790): Find › Tools or Find › Games pressed as the funnel's first answer, then the first card; `findPage` counts from it. */
      /* `id`: that widget's card, not the first. */
      /* NOBODY SIGNED IN IS A MEMBER HERE: Find is for members (400), and a journey that opened Tools signed out asked about the widget, not the gate. */
      'findGroup: (g, id) => { window.__findKind = g === "Games" ? "game" : "tool";' +
      '  if (!USER) USER = ' + JSON.stringify(MEMBER_) + ';' +
      '  finderSet_(FINDERS.stuff, { filters: [{ field: "forLabel", value: g }], q: "" }); go("stuff", false, true);' +
      '  const at = id ? inFinder_(FINDERS.stuff, () => stuffPages_().findIndex(pg => pg.x && pg.x.widget && String(pg.x.widget.id) === String(id))) : 0;' +
      '  goPage("stuff", inFinder_(FINDERS.stuff, () => stuffFirstResult_()) + Math.max(0, at), true); },' +
      /* A FINDER SET TO A GROUP WITHOUT GOING THERE — Find 2 showing Tools beside Find is what Tools beside Find was. */
      /* EVERY CARD OF A FINDER FILLED, as Tools' column drew every slot: for journeys that ask the builder about cards far down the list (790). */
      'findFillAll: fid => inFinder_(FINDERS[fid], () => { const f = stuffFirstResult_(); for (let i = 0; i < stuffPages_().length; i++) stuffFillOne_(f + i); }),' +
      'findGroupOn: (fid, g, id) => { if (!USER) USER = ' + JSON.stringify(MEMBER_) + ';' +
      '  finderSet_(FINDERS[fid], { filters: [{ field: "forLabel", value: g }], q: "" }); inFinder_(FINDERS[fid], () => { const at = id ? stuffPages_().findIndex(pg => pg.x && pg.x.widget && String(pg.x.widget.id) === String(id)) : 0; PAGE[fid] = stuffFirstResult_() + Math.max(0, at); paintStuff(true); }); },' +
      /* `n` IS AN INDEX INTO `widgetsOf_` of the last group, as it was into the column: the page of that widget's card. */
      'findPage: (n, ...a) => inFinder_(FINDERS.stuff, () => { const w0 = widgetsOf_(window.__findKind || "tool")[n]; const at = w0 ? stuffPages_().findIndex(pg => pg.x && pg.x.widget && String(pg.x.widget.id) === String(w0.id)) : -1;' +
      '  return goPage("stuff", stuffFirstResult_() + (at < 0 ? n : at), ...a); }),' +
      'pressForget: () => PRESS_LAST_.clear(),' +
      /* WHETHER EVERYTHING BOOKED FOR AFTER A SLIDE HAS RUN, the widget queue included — `woken_` below. § */
      'quiet: () => !PLACE_FRAME && !AFTER_SLIDE && !AFTER_SLIDE_JOBS.size && !(typeof TOOLS_WAIT !== "undefined" && TOOLS_WAIT.length)' +
      '  && !(typeof aheadBusy_ === "function" && aheadBusy_()),' +
      /* THE BUILDER'S OWN STATE, for the journeys about it (docs/history/341): § */
      'STALE: () => STALE, paints: () => Object.assign({}, PAINT_N), aheadLog: () => window.__aheadLog.slice(),' +
      'aheadBusy: () => aheadBusy_(), landRepaint: d => landRepaint_(d), epochs: () => ({ act: ACT_EPOCH, draw: DRAW_EPOCH }),' +
      /* WHETHER A SLIDE'S BAND IS STILL WIDER THAN THE GLASS — `trailEnd_` has one placement left to make, the one
         that puts it back (docs/history/341). A page is not still until it has. */
      'trailWide: () => TRAIL_X.lo < TRAIL_X.hi || TABS.some(x => { const h = document.getElementById("s-" + x.id); const was = h && h.TRAIL && colPlaced_(h);' +
      '  return !!(was && (h.TRAIL.top < -was[1] - 1 || h.TRAIL.bot > -was[1] + (h.clientHeight || innerHeight) + 1)); }),' +
      'isFav: k => isFav(k), TOOLS_ON: () => TOOLS_ON, PRE_PAYLOAD: () => [...PRE_PAYLOAD], GLASS: () => GLASS,' +
      /* AND WHAT THE BUILDER'S JOURNEYS ASK OF IT: § */
      'paint: (id, f) => paint(id, f), screenDraw: id => (SCREENS[id] ? SCREENS[id].draw() : null),' +
      'widgetState: () => ({ flappy: typeof flappyState !== "undefined" ? flappyState : null,' +
      '  vid: typeof VID !== "undefined" ? VID.at : null, party: typeof PARTY !== "undefined" ? PARTY : null }),' +
      'aheadKick: () => aheadKick_(), slotOn: (c, i) => slotOn_(c, i), reelMore: n => reelMore_(document.getElementById("s-reel"), n),' +
      'pageLo: () => PAGE_LO, swipeLive: v => { SWIPE.live = !!v; },' +
      /* AND WHAT THE REVIEW OF 12 OCT ASKED THE BUILDER (docs/history/341, "After review"): § */
      'aheadRunning: () => AHEAD.running, aheadOpened: () => AHEAD.opened, slideUntil: v => { SLIDE_UNTIL = v; },' +
      'settleOn: v => { SETTLE_ON = v; }, dmLast0: () => { DM_LAST = 0; }, stuffBehind: () => stuffBehind_(),' +
      'aheadSlow: () => [...AHEAD_SLOW], finder: () => FINDER.id, domIndex: (id, i) => domIndex_(id, i), afterIdle: () => !AFTER_SLIDE && !AFTER_SLIDE_JOBS.size && !(typeof TOOLS_WAIT !== "undefined" && TOOLS_WAIT.length),' +
      /* THE REAL TAB LIST, so a journey asking "does every tab draw" cannot be asking about tabs
         that no longer exist. It has been wrong twice from being written out by hand. */
      'TABS,' +
      /* WHAT THE LINE UNDER YOUR HANDLE SAYS (`HANDLE_SAID`, me.js) — a `let`, so a function (342). */
      'handleSaid: () => HANDLE_SAID,' +
      /* THE LIBRARY'S STATE (`LIB`, library.js) — a `const`, so a function (447). */
      'lib: () => LIB,' +
      /* A PART'S WORKING PHOTOS (`WORK_PICS`, working.js) — a `const`, so a function (529). */
      'workPics: () => WORK_PICS,' +
      /* THE PAPER AS DRAWN, so a journey can ask what is actually on it rather than what the
         functions behind it were supposed to produce. */
      'paper: () => (typeof bookBreakdown === "function" ? bookBreakdown(bookPrice()) : ""),' +
      /* WHAT WOULD GO ON THE WIRE. § */
      'spec: () => (typeof bookSpec === "function" ? bookSpec() : null),' +
      /* THE LEDGER THE CARD IS BUILT FROM. § */
      'price: () => (typeof bookPrice === "function" ? bookPrice() : null),' +
      /* THE SEVEN DAY NAMES, because a week step is seven rows of the card rather than one and
         a journey that listed them here would be a second copy of `SLOT_DAYS` to keep in step. */
      'days: () => (typeof SLOT_DAYS !== "undefined" ? SLOT_DAYS.map(d => d[1]) : []),' +
      /* THE RECEIPT'S WEEK, built from a saved job rather than from the form, so a journey can ask
         whether what was sent is what comes back drawn. */
      'jobGrid: typeof jobWeekRows_ === "function" ? (j => jobWeekRows_(j).map(r => r.strip).join("")) : null,' +
      /* AN ADMIN'S ACTIONS ON A SESSION, so a journey can ask that moving them from buttons to
         tiles did not lose one. */
      /* THE PAGER TABLE AND THE PAGE COUNTER, so a journey can ask whether what the header counts is
         what the screen drew. */
      /* AND `pageCount`, WHICH IS THE ONE DEFINITION OF HOW MANY PAGES A SCREEN HAS. § */
      /* THE PAYLOAD ITSELF, AS A GETTER RATHER THAN A REFERENCE. § */
      'DATA: () => DATA,' +
      /* THE FOUR CLASSROOM GAMES' ROUNDS, as a getter for the same reason — a journey asks whether a
         repaint kept the round, and only the state can say that the clock did not move while the
         column was away. */
      'PARTY: () => (typeof PARTY !== "undefined" ? PARTY : null),' +
      /* IMPOSTER'S ROUND, AS A GETTER FOR THE SAME REASON — `impDeal_` replaces the object — so a journey can hold each screen up against what was actually dealt § */
      'IMP: () => (typeof IMP !== "undefined" ? IMP : null),' +
      'impCards: () => (typeof impCards_ === "function" ? impCards_() : []),' +
      'impCatSym: c => (typeof IMP_DECK !== "undefined" && IMP_DECK[c] ? IMP_DECK[c].sym : undefined),' +
      'impCats: () => (typeof IMP_DECK !== "undefined" ? Object.keys(IMP_DECK) : []),' +
      /* THE VIDEOS CARD'S FAILED PICTURES, a `const` Set — a Drive film's address in it is the film's
         file id, so a journey asks whether signing out empties it. A copy, not the Set. */
      'vidBroken: () => (typeof VID_BROKEN !== "undefined" ? [...VID_BROKEN] : null),' +
      /* AND WHICH WATCH BLOCK IS THE APP'S OWN FULL SCREEN, if any — `VID_FS` is a `const` (note 321). */
      'vidFs: () => (typeof VID_FS !== "undefined" ? VID_FS.watch : null),' +
      /* AND WHICH COLUMN IS IN FRONT — a `let` in shell.js, so a second eval cannot read it; the videos
         journey asks that an arrow key did not turn it under a full-screen film. */
      'screenAt: () => AT,' +
      /* WHICH SESSION'S RECEIPT IS OPEN — a `let` in book.js; the way back from Stripe opens the one it paid for (430). */
      'openJob: () => OPEN_JOB,' +
      /* THE ACCOUNT COLUMN'S PAGES, so a journey can ask who is drawn on it. */
      'accountPages: c => accountPages_(c),' +
      /* WHERE YOUR OWN CARD'S NAME AND PICTURE ARE EDITED (453): Tutors, Parents or Students, by rank. */
      'homeCol: () => homeCol_(),' +
      /* THE TEN PICTURES' NAMES, IN THE GRID'S ORDER — a `const`, so only a getter reaches it. */
      'pfpNames: () => (typeof PFP_ART !== "undefined" ? Object.keys(PFP_ART) : []),' +
      'PAGER, PAGE, goPage, repaint, pageCount, PAGE_KEEP,'
      + 'STUFF_WIN: typeof STUFF_WIN === "number" ? STUFF_WIN : 0,'
      /* THE DOCKET'S STORAGE FORMAT AND ITS PAINTER, so a journey can round-trip a line through
         both without a browser and without the sheet. */
      + 'dockLines: typeof docketLines === "function" ? docketLines : null,'
      + 'dockText: typeof docketText === "function" ? docketText : null,'
      + 'paintDocket: typeof paintDocket === "function" ? paintDocket : null,'
      + 'jobAdmin: typeof jobAdminTiles_ === "function" ? jobAdminTiles_ : null,'
      + 'jobPaid: typeof jobPaidForm_ === "function" ? jobPaidForm_ : null,'
      /* THE WHOLE SESSION PAGE AND THE FIGURES ON IT, so a journey can ask who is shown which money
         and whether the actions are printed on the paper rather than floating under it. */
      + 'jobPage: typeof jobPage_ === "function" ? jobPage_ : null,'
      + 'jobMoney: typeof jobMoney_ === "function" ? jobMoney_ : null,'
      + 'formMoney: typeof formMoney_ === "function" ? formMoney_ : null,'
      + 'stage: typeof jobStage_ === "function" ? jobStage_ : null,' +
      'accepted: typeof jobAccepted_ === "function" ? jobAccepted_ : null,' +
      /* THE RECEIPT'S ROWS AS OBJECTS, because the count on the Dates row is a figure in a COLUMN and
         cutting it back out of the markup would be a second reading of `receiptRow`'s template. */
      'jobRows: typeof jobRows === "function" ? jobRows : null,' +
      /* THE ONE PLACE A SEAT COUNT IS BOUNDED, so a journey can ask what a venue does to the floor
         without reaching into the step that reads it. */
      'seatLimits: typeof seatLimits === "function" ? seatLimits : null,' +
      'spaceFor: typeof spaceFor === "function" ? spaceFor : null,' +
      /* THE FIVE STAGE ROWS AND THE BUILDER BOTH DOCUMENTS USE, so a journey asking about the ticks
         reads the app's own list rather than a copy of it written out here. */
      'JOB_STAGES: typeof JOB_STAGES !== "undefined" ? JOB_STAGES : [],' +
      'stageRows: typeof stageRows_ === "function" ? stageRows_ : null,' +
      'next: typeof nextBookStep === "function" ? nextBookStep : null,' +
      /* THE CONTROL A ROW CARRIES, so the several-answers journey can ask whether the row reads back what has been ticked — the button is the only label on it, which § */
      'control: typeof stepControl_ === "function" ? stepControl_ : null,' +
      /* THE FORM'S PAGE AS DRAWN, because a picker once replaced it rather than covering it — so the
         way to ask "is the form still there" is to ask what page 0 of the booking column holds. */
      'bookerCard: typeof bookerCard === "function" ? bookerCard : null,' +
      /* THE DRAG GUARD, SET — a `let` in shell.js, which a second eval cannot reach. The select
         journey plays a swipe that ends on a select with it, and asks that the list stays shut. */
      'pressMoved: v => { PRESS_MOVED = !!v; },' +
      /* THE PEN ON A QUESTION'S DIAGRAM, both halves: § */
      'padWrap: typeof padWrap_ === "function" ? padWrap_ : null,' +
      'padCard: typeof padWrap_ === "function" ? (x, svg, f) => \'<div class="qcard">\' + padWrap_(x, svg, f) + (x && x.key ? qtRow_(x) : \'\') + \'</div>\' : null,' +
      'padArm: typeof padArm_ === "function" ? padArm_ : null,' +
      /* AND THE STATE THE MARKUP IS BUILT FROM, so the repaint path can be asked the same question as the press path. § */
      'padOn: v => { PAD_ON = v; },' +
      /* AND READ BACK, so a journey can ask whether leaving a surface's drawing for its box turned the pen
         off (327) -- a `let`, which a second eval cannot reach. */
      'padNow: () => PAD_ON,' +
      /* AND THE PAD'S KEY, a `const` arrow, so a journey can arm a pad by the key its marks are kept
         under -- and read those marks back -- without writing the key's format out a second time. */
      'drawMark: typeof DRAW_MARK !== "undefined" ? DRAW_MARK : null,' +
      'padKey: typeof padKey_ === "function" ? padKey_ : null,' +
      /* THE PADLOCK (457), a `const` in overworld.js: which of the console and a question page holds the column still. */
      'padlock: () => (typeof PADLOCK !== "undefined" ? PADLOCK : null),' +
      /* WHICH TOOL EACH PAD HOLDS, a `const` Map -- so a journey can leave a stale choice behind and
         ask whether the bar, not the Map, decides what a drag draws. */
      'padTool: () => (typeof PAD_TOOL !== "undefined" ? PAD_TOOL : null),' +
      /* THE FINGER PEN'S CONTACTS, a `const` Map (338) -- a journey asks that every one is forgotten when the fingers have lifted, because one left behind is a pad the § */
      'padTouch: () => (typeof PAD_TOUCH !== "undefined" ? PAD_TOUCH : null),' +
      'swipe: () => (typeof SWIPE !== "undefined" ? SWIPE : null),' +
      /* AND THE STROKE BEING DRAWN, and the path the pen draws a stroke as, so a journey can hold the live path
         and the stored one up against `padPath_` of the points (338). */
      'padSt: () => (typeof PAD_ST !== "undefined" ? PAD_ST : null),' +
      'padPath: (st, k) => padPath_(st, k),' +
      /* AND THE PATHS IT KEEPS (`PAD_PATHS`, a `const` Map, after review), so a journey can ask what it holds. */
      'padPaths: () => (typeof PAD_PATHS !== "undefined" ? PAD_PATHS : null),' +
      /* THE CARD ON THE 📷 COLUMN. § */
      'card: typeof cameraCard === "function" ? cameraCard : null,' +
      /* THE TILE ROW UNDER A SESSION CARD, which is where Pay lives. § */
      'jobTiles: typeof jobTiles_ === "function" ? jobTiles_ : null,' +
      /* THE BOOKING COLUMN AS DRAWN, and the id of the booking just asked for. § */
      'blocks: typeof bookBlocks === "function" ? bookBlocks : null,' +
      'asked: () => ASKED_JOB,' +
      /* THE CHEAT SHEET'S COMPONENT LIST AND ITS TWO WIDTHS. § */
      'matParts: typeof matParts === "function" ? matParts : null,' +
      'matColW: typeof matColW === "function" ? matColW : null,' +
      'matPairW: typeof matPairW === "function" ? matPairW : null,' +
      'matSpan: typeof matSpan === "function" ? matSpan : null,' +
      'matSpanW: typeof matSpanW === "function" ? matSpanW : null,' +
      /* THE SUBJECT FILTER AND WHAT IT DECIDES. § */
      'matShown: typeof matShown === "function" ? matShown : null,' +
      'matSubjects: typeof matSubjects === "function" ? matSubjects : null,' +
      'matSubjectOf: typeof matSubjectOf === "function" ? matSubjectOf : null,' +
      'matLevelChoices: typeof matLevelChoices === "function" ? matLevelChoices : null,' +
      'matDraw: typeof matDraw === "function" ? matDraw : null,' +
      /* FILL AND CLEAR, and the tick list they change — the two shortcuts a person presses, asked
         through the same functions the buttons call. */
      'matPaint: typeof matPaint === "function" ? matPaint : null,' +
      'matOn: v => { if (v) MAT_ON = v.slice(); return MAT_ON.slice(); },' +
      'matSet: (s, l, tier) => { MAT_SUBJECT = s; MAT_LEVEL = l; if (tier) MAT_TIER = tier;' +
      '  MAT_EXAM = "all"; matSettle(matParts()); return [MAT_SUBJECT, MAT_LEVEL]; },' +
      /* THE TOPIC GROUPS — the third select — and the state the tool opened on, so a journey can ask what each view lists and where a student lands. § */
      'matGroupOf: typeof matGroupOf === "function" ? matGroupOf : null,' +
      'matGroupChoices: typeof matGroupChoices === "function" ? matGroupChoices : null,' +
      'matInGroup: typeof matInGroup === "function" ? matInGroup : null,' +
      'matGroup: g => { if (g !== undefined) MAT_GROUP = g; return MAT_GROUP; },' +
      'matNow: () => ({ subject: MAT_SUBJECT, level: MAT_LEVEL, group: MAT_GROUP }),' +
      'matFresh: () => { MAT_TOUCHED = false; MAT_SUBJECT = "Maths"; MAT_LEVEL = "all"; MAT_GROUP = "";' +
      '  MAT_ON = []; MAT_KIND = "cheat"; MAT_BLANK = matBlankFresh_();' +
      '  try { localStorage.removeItem("matChoice"); } catch (e) {} },' +
      /* THE PAPER KINDS — what a journey reads back after pressing the real selects. */
      'matBlank: () => (typeof MAT_BLANK !== "undefined" ? Object.assign({ kind: MAT_KIND }, MAT_BLANK) : null),' +
      'matSheet: () => (typeof MAT_SHEET !== "undefined" ? MAT_SHEET : ""),' +
      'matRecall: typeof matRecall === "function" ? matRecall : null,' +
      'matOrder: () => (typeof MAT_ORDER !== "undefined" ? MAT_ORDER : null),' +
      'orderText: typeof orderText_ === "function" ? orderText_ : null,' +
      /* WHO MAY OPEN A WIDGET, and the two lists that ask it. `star` puts a key in the device's
         favourites the way a press on a star does, without the request. */
      'widgetFor: typeof widgetFor_ === "function" ? widgetFor_ : null,' +
      'allWidgets: typeof allWidgets === "function" ? allWidgets : null,' +
      'widgetsOf: typeof widgetsOf_ === "function" ? widgetsOf_ : null,' +
      /* AN EXPRESSION READ INSIDE THE APP'S OWN SCOPE, where its `const`s are — the Console's state for its journey (419). */
      'inApp: s => eval(s),' +
      'savedWidgets: typeof savedWidgets_ === "function" ? savedWidgets_ : null,' +
      'star: k => FAVS.add(String(k)),' +
      /* WHICH WIDGETS ARE RUNNING AND ON WHICH COLUMN'S COPY, WHICH ARE WAITING THEIR TURN, AND WHAT THE LAST PLACEMENT SAID IS ON THE GLASS — three `let`s in § */
      'running: () => TOOLS_ON.map(e => ({ id: String(e.w.id), col: e.col, who: e.who, slot: e.slot })),' +
      /* AND WHICH COLUMNS A REPAINT LEFT TO BE DRAWN ON ARRIVAL — a `let` in shell.js. */
      'stale: id => !!STALE[id],' +
      'waiting: () => TOOLS_WAIT.map(q => ({ id: String(q.w.id), col: q.col })),' +
      'glass: () => ({ at: GLASS.at, cols: GLASS.cols.slice(), pages: GLASS.pages.slice() }),' +
      /* WHAT THE FIND SCREEN OFFERS AGAINST WHAT THE APP HOLDS, and the Saved column that reads the second. § */
      'funnelItems: typeof stuffItems === "function" ? stuffItems : null,' +
      'allItems: typeof stuffItemsAll_ === "function" ? stuffItemsAll_ : null,' +
      'savedPages: typeof savedPages_ === "function" ? savedPages_ : null,' +
      /* THE ANSWER BOX'S KEY, a `const` -- so a journey can clear a stored pick it made. `w.ansKey_`
         is undefined, and the `try` round it in one journey here was clearing nothing. */
      'ansKey: typeof ansKey_ === "function" ? ansKey_ : null,' +
      'doors: () => facetValues(stuffItems(), facetList().find(f => f.field === "forLabel"))' +
      '  .map(v => String(v.show || v.value)),' +
      'facetFields: () => facetList().map(f => f.field),' +
      /* THE BASKET, AND ITS ARITHMETIC. § */
      'CART: () => CART, setCart: v => { CART = v; },' +
      'cartMoney: typeof cartMoney_ === "function" ? cartMoney_ : null,' +
      'lamPrice: typeof laminatePrice === "function" ? laminatePrice : null,' +
      'basket: typeof cartCard_ === "function" ? cartCard_ : null,' +
      'PAGE: () => PAGE,' +
      /* THE SHOP COLUMN AND THE TWO LISTS IT WAS TAKEN FROM. § */
      'shopCards: typeof shopCards_ === "function" ? shopCards_ : null,' +
      'shopFunnel: typeof stuffItems === "function" ? stuffItems : null,' +
      'shopAll: typeof stuffItemsAll_ === "function" ? stuffItemsAll_ : null,' +
      'shopSaved: typeof savedPages_ === "function" ? savedPages_ : null,' +
      'shopDoors: () => facetValues(stuffItems(), facetList().find(f => f.field === "forLabel"))' +
      '  .map(v => String(v.show || v.value)),' +
      /* WHICH COLUMN IS IN FRONT. § */
      'AT: () => AT,' +
      /* THE MARKS AS THE APP DRAWS THEM, so a switch tile's picture is read against the entry its class names rather than trusted by the name (`soundTileSays_`). § */
      'ICONS: TILE_ICONS,' +
      /* AND WHERE A VISITOR WITH NOTHING REMEMBERED OPENS — a `const`, so a getter for `AT`'s reason. § */
      'TAB_HOME: () => TAB_HOME,' +
      /* FIND'S OWN STATE — the search words and the chips. A `const`, so only a function built in
         this evaluation can hand it over; the textbook journey types into `q` the way the box does. */
      'STUFF: () => STUFF,' +
      /* THE EIGHT-BIT FIGHTER'S WORDS AND SHAPES — `const`s, so a getter built here, like `STUFF`. The
         boxer journey asks the figure for exactly the pixels these say, rather than a copy of them. */
      'BOXER: () => (typeof BOXER_LOOK !== "undefined" ? { LOOK: BOXER_LOOK, HAIR: BOXER_HAIR, FACE: BOXER_FACE, BODY: BOXER_BODY, UNSAID: BOXER_HAIR_UNSAID } : null),' +
      /* AND THE SECOND FINDER'S — Find 2's own words and chips (docs/history/329, 347). The
         object itself, never parked or replaced; `STUFF` outside a binding is Find's, so the two
         getters name the two finders. */
      'RES: () => (typeof RES_ST !== "undefined" ? RES_ST : null),' +
      /* THE BIBLE READER'S STATE — a `const`, so a getter built here (see `STUFF`): § */
      'BIBLE: () => (typeof BIBLE !== "undefined" ? BIBLE : null),' +
      /* AND THE FUNNEL'S OWN MEMO OF WHAT IT TALLIED and the chain that orders the Bible's questions — both `const`s, so only this evaluation can hand them over. § */
      'FACET_TALLY: () => FACET_TALLY, FACET_NEEDS_FIRST: typeof FACET_NEEDS_FIRST !== "undefined" ? FACET_NEEDS_FIRST : null,' +
      /* A FACET BY ITS FIELD -- a `const` arrow, so only this evaluation can hand it over. The tag-row
         journey asks the `needs` facet's `showOf` whether the funnel says the calculator the way the
         card's tag does. */
      'facetBy: f => facetBy(f),' +
      /* AND THE THREE MORE THE TAG JOURNEYS ASK (355): the live list, a tag's colour, and a facet's
         answers inside the list a set of chips leaves -- all `const`s. */
      'facetList: () => facetList(), tagOf: f => tagOf_(f), asList: v => asList_(v),' +
      'narrow: (items, filters) => stuffNarrow_(items, filters, [], null),' +
      /* THE MESSAGES COLUMN'S STATE, SEEDED AS AN ANSWER JUST ARRIVED — the same five lets `check/states.js` sets in a browser, and for the same reason they are set § */
      'dmSeed: (msgs, pending) => { MESSAGES = msgs; MSG_PENDING = pending || []; DM_ASKED = true;' +
      '  DM_DONE = true; MSG_FAILED = false; DM_LAST = Date.now(); } };');
  } catch (e) {
    errs.push('LOAD THREW: ' + e.message);
  }
  LAST_W = w;
  return { w, sent, errs, gets };
}

/* ---------- THE JOURNEYS § */
const checks = [];
/* `FLOW_ONLY=words node js/check-flow.js` runs the journeys whose names contain those words — for working on one; the suite always runs the lot, and says how § */
/* `FLOW_SLICE=1/3` RUNS EVERY THIRD JOURNEY, starting from the second — the suite in pieces, for a machine too busy to run all of it inside one ten-minute window. § */
const FLOW_RE_ = process.env.FLOW_RE ? new RegExp(process.env.FLOW_RE) : null;
const FLOW_SLICE = /^(\d+)\/(\d+)$/.exec(process.env.FLOW_SLICE || '');
let flowSeen = 0;
/* TIERS (860): core by tiers.json; FLOW_TIER=all|secondary adds the rest; FLOW_ONLY/FLOW_RE ask any. */
const FLOW_TIERS_ = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'settings', 'tiers.json'), 'utf8')).journeys; } catch (e) { return null; } })();
const FLOW_TIER = /^(all|secondary)$/.test(process.env.FLOW_TIER || '') ? process.env.FLOW_TIER : 'core';
const journeyTier_ = name => !FLOW_TIERS_ || (new RegExp(FLOW_TIERS_.core, 'i').test(name) && !new RegExp(FLOW_TIERS_.secondary, 'i').test(name)) ? 'core' : 'secondary';
const check = (name, fn) => {
  const n = flowSeen++;
  if (FLOW_SLICE && n % Number(FLOW_SLICE[2]) !== Number(FLOW_SLICE[1])) return;
  const tier = journeyTier_(name), asked = !!(process.env.FLOW_ONLY || FLOW_RE_);
  if (!asked && FLOW_TIER !== 'all' && tier !== FLOW_TIER) return;
  if ((!process.env.FLOW_ONLY || name.indexOf(process.env.FLOW_ONLY) !== -1) && (!FLOW_RE_ || FLOW_RE_.test(name))) checks.push({ name, fn, tier });
};
const wait = ms => new Promise(r => setTimeout(r, ms));
/* A PAD'S UNDO OR CLEAR (1020): on a question they stand in the part's tool row, paired to the pad by data-k; the whiteboard keeps them in the pad's bar. */
const padTile_ = (pad, cls) => pad && (pad.querySelector(cls) || [...((pad.closest('.qcard') || pad.parentNode || pad).querySelectorAll('.qt-row ' + cls))]
  .find(b => b.getAttribute('data-k') === pad.getAttribute('data-k')) || null);
/* THE JOURNEYS LIVE IN check/flow/ (1040), one file a feature, read in name order as one text so they share this scope and FLOW_PART deals the same roster. */
const FLOW_DIR_ = path.join(__dirname, '..', 'check', 'flow');
eval(fs.readdirSync(FLOW_DIR_).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(FLOW_DIR_, f), 'utf8')).join(''));
/* `FLOW_PART=2/4` RUNS THE SECOND QUARTER, in roster order — for a machine where the whole file takes longer than one shell may wait § */
const FLOW_PART_ = /^(\d+)\/(\d+)$/.exec(process.env.FLOW_PART || '');
if (FLOW_PART_) {
  const k = Number(FLOW_PART_[1]), n = Number(FLOW_PART_[2]), all = checks.length;
  const a = Math.floor((k - 1) * all / n), b = Math.floor(k * all / n);
  checks.splice(0, all, ...checks.slice(a, b));
  console.log('part ' + k + '/' + n + ': journeys ' + (a + 1) + '–' + b + ' of ' + all);
}
(async () => {
  let failed = 0, warned = 0;
  const skipped = [];
  console.log('');
  for (const c of checks) {
    let bad;
    try { bad = await c.fn(); }
    catch (e) {
      /* LIB_PRIVATE=absent (780): a journey that reads the library's words is skipped and counted, never passed. */
      if (LIB_FULL.isAbsent(e)) { skipped.push(c.name); console.log('  skip  ' + c.name); continue; }
      bad = ['the check itself threw: ' + e.message + (process.env.FLOW_STACK ? ' ' + e.stack : '')];
    }
    if (bad && bad.length && c.tier === 'secondary') {
      warned++;
      console.log('  WARN  ' + c.name + '  (secondary, report-only)');
      bad.forEach(b => console.log('          ' + b));
    } else if (bad && bad.length) {
      failed++;
      console.log('  FAIL  ' + c.name);
      bad.forEach(b => console.log('          ' + b));
    } else {
      console.log('  ok    ' + c.name);
    }
  }
  console.log('');
  LIB_FULL.skipParts(skipped);
  const ran = checks.length - skipped.length;
  if (warned) console.log('WARN — ' + warned + ' secondary journey(s) found something (report-only, 860)');
  console.log('tier ' + FLOW_TIER + ': ' + checks.filter(c => c.tier === 'core').length + ' core, ' + checks.filter(c => c.tier === 'secondary').length + ' secondary journeys');
  console.log(failed ? 'FAILED — ' + failed + ' of ' + ran + ' journeys are broken'
                     : 'OK — all ' + ran + ' journeys work' + (skipped.length ? ' (' + skipped.length + ' skipped: no private words).' : '.'));
  process.exit(failed ? 1 : 0);
})();
