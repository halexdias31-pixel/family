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
/* ---------- THE ORDER IS READ FROM index.html, NOT KEPT HERE ---------------------------------------
   THIS WAS A HAND-MAINTAINED COPY of the list in `index.html`, and CLAUDE.md already records what
   that costs: `select`, `collections` and `tiles` were added there and never here, so this checker
   read twenty-one files and was silent about three — one of them `tiles.js`, where every card
   action in the app is built.

   IT DRIFTED AGAIN THE MOMENT `library.js` WAS ADDED, which is the second time and the reason it is
   now derived. `index.html` IS the order — it is the file the browser obeys — so anything that
   needs the order asks it rather than remembering it. */
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
  /* ---------- `client` IS SENT AND THIS PAYLOAD DID NOT SEND IT --------------------------------
     `doget.gs` CARRIES A NOTE ABOUT THIS EXACT FIELD: *"`myJobs_` ON THE PHONE FILTERS ON
     `j.client` AND `j.tutor`, AND NEITHER WAS EVER SENT."* It was found and fixed at that end, and
     this payload — whose own heading says "anything the app reads has to be here under the name
     `doGet` actually uses, which is the whole risk of a fake" — was never brought into line.

     WHAT IT COST IS A WHOLE COLUMN. `myJobs_` returned nothing for anybody here, so the Booking
     column drew one page — the form — for every journey in this file, and the receipts that are
     pages after it were never on a screen any of them looked at. That is how a paged column with
     no `PAGER` entry survived: the journey written to catch exactly that could only see one page,
     and one page is not a disagreement.

     DERIVED FROM THE SEAT rather than typed a second time, so the roster and the client cannot
     disagree — which is the same reason `seat()` takes a default at all. The tutor is already on
     each row. */
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
    /* ---------- PRICED, SO THE JOURNEYS BELOW ARE NOT PASSING ON AN EMPTY ROOM --------------------
       THIS PAYLOAD IS NOT `check/fixture.json`, and that caught me out the first time: the laminate
       journeys read `laminatePrice`, which returns null when the sheet has no rate, and both took
       their "nothing is offered" branch and reported OK — including against a deliberately broken
       `cartMoney_`. A check that cannot reach its subject must not read as a pass; the branch is
       still there because an unpriced upgrade is a real state worth asserting about, but the rate
       is here so the branch that matters is the one that runs. */
    constants: { vars: { h: 2, max_students_per_job: 4,
                         print_rate_per_page: 0.02, laminate_rate_per_page: 0.35,
                         laminate_minimum: 0.5 } },
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
    /* ---------- THE STUB HAD NO `text()`, AND THAT HID EVERY WRITE'S SUCCESS PATH ----------------
       `api()` IN shell.js READS `r.text()` AND PARSES IT, deliberately — an Apps Script error page
       is HTML, and reading it as text first is what turns "Unexpected token '<'" into the sentence
       the server actually said. This stub answered with `json()` only. So `r.text` was undefined,
       every POST rejected with a TypeError, and the `.then` of every write in the app was
       unreachable from here.

       NOTHING FAILED, WHICH IS WHY IT LASTED. The journeys that press a send button assert on
       `sent` — the list this stub fills in before answering — and that is populated whether the
       reply is readable or not. So "a class books through joinWaitlist, a session through
       createJob" passed while proving only that the request left; what the app does with the
       answer had never run once.

       Found by a journey that asked what is on the screen AFTER a booking is sent, and got the
       same screen as before. Both shapes now, so a caller may read either. */
    const body_ = txt => ({ ok: true, status: 200,
      text: () => Promise.resolve(JSON.stringify(txt)),
      json: () => Promise.resolve(txt) });
    if (o && o.body) {                       // a POST — record it and answer plausibly
      const body = JSON.parse(o.body);
      sent.push(body);
      return Promise.resolve(body_(opts.reply || { success: true, joined: 3, seats: 4 }));
    }
    return Promise.resolve(body_(data));
  };

  const errs = [];
  w.onerror = m => errs.push(String(m));
  const src = ORDER.map(n => fs.readFileSync(path.join(dir, n + '.js'), 'utf8')).join('\n');
  try {
    w.eval(src + '\n;window.__t = {' +
      'go, USER: v => { USER = v; }, whoami: () => USER, ACTIONS, BOOKING, STEPS: BOOK_STEPS,' +
      /* THE REAL TAB LIST, so a journey asking "does every tab draw" cannot be asking about tabs
         that no longer exist. It has been wrong twice from being written out by hand. */
      'TABS,' +
      /* THE PAPER AS DRAWN, so a journey can ask what is actually on it rather than what the
         functions behind it were supposed to produce. */
      'paper: () => (typeof bookBreakdown === "function" ? bookBreakdown(bookPrice()) : ""),' +
      /* AN ADMIN'S ACTIONS ON A SESSION, so a journey can ask that moving them from buttons to
         tiles did not lose one. */
      /* THE PAGER TABLE AND THE PAGE COUNTER, so a journey can ask whether what the header counts is
         what the screen drew. */
      'PAGER, PAGE, goPage, repaint,'
      /* THE DOCKET'S STORAGE FORMAT AND ITS PAINTER, so a journey can round-trip a line through
         both without a browser and without the sheet. */
      + 'dockLines: typeof docketLines === "function" ? docketLines : null,'
      + 'dockText: typeof docketText === "function" ? docketText : null,'
      + 'paintDocket: typeof paintDocket === "function" ? paintDocket : null,'
      + 'jobAdmin: typeof jobAdminTiles_ === "function" ? jobAdminTiles_ : null,'
      + 'stage: typeof jobStage_ === "function" ? jobStage_ : null,' +
      'accepted: typeof jobAccepted_ === "function" ? jobAccepted_ : null,' +
      'next: typeof nextBookStep === "function" ? nextBookStep : null,' +
      /* THE CARD ON THE 📷 COLUMN. It was `newPostCard`, which no longer exists — it was a heading,
         a sentence and a tap target, and it is a button on the camera now. The rule the journey
         below checks is unchanged: a client and an admin are told different things. */
      'card: typeof cameraCard === "function" ? cameraCard : null,' +
      /* THE TILE ROW UNDER A SESSION CARD, which is where Pay lives. It used to be a block inside
         the receipt sheet and the journey below still looked for it there — see the note on that
         journey. Exposed so the test can ask the thing that actually renders the button. */
      'jobTiles: typeof jobTiles_ === "function" ? jobTiles_ : null,' +
      /* THE BOOKING COLUMN AS DRAWN, and the id of the booking just asked for. Together they are
         what a journey needs to ask whether pressing send leaves anything on the screen — which
         it did not, for as long as the form was the only thing on that page. */
      'blocks: typeof bookBlocks === "function" ? bookBlocks : null,' +
      'asked: () => ASKED_JOB,' +
      'bar: typeof installBar === "function" ? installBar : null,' +
      /* THE CHEAT SHEET'S COMPONENT LIST AND ITS TWO WIDTHS. `matParts` is the list after the sheet
         has had its say about order and levels, which is the list the page is actually built from —
         so a journey can ask what a component is worth without a browser and without the tab. */
      'matParts: typeof matParts === "function" ? matParts : null,' +
      'matColW: typeof matColW === "function" ? matColW : null,' +
      'matPairW: typeof matPairW === "function" ? matPairW : null,' +
      /* THE BASKET, AND ITS ARITHMETIC. `cartMoney_` is the one place a line's price is worked out
         — print plus the laminate upgrade — and `CART` is the list it works it out from. Exposed
         together so a journey can put a line in the basket and ask what it costs, which is the
         question somebody actually has about a basket. */
      'CART: () => CART, setCart: v => { CART = v; },' +
      'cartMoney: typeof cartMoney_ === "function" ? cartMoney_ : null,' +
      'lamPrice: typeof laminatePrice === "function" ? laminatePrice : null,' +
      'basket: typeof basketPages === "function" ? basketPages : null,' +
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

/* ---------- THE UPGRADE HAS TO BE IN THE PRICE, AND HAS TO COME BACK OUT --------------------------
   THE FAULT THIS GUARDS AGAINST is the one the design avoids on purpose: a laminate upgrade stored
   as a NUMBER added into the line's `money`. That works the first time and breaks the first time
   somebody takes it off, because the subtraction lives somewhere else and only one code path runs
   it. The flag is stored instead and the price derived, so this asks the round trip: on, off, and
   back to where it started.

   AND THAT NO RATE MEANS NO CHARGE. `laminatePrice` returns null when the sheet has not priced the
   pouches, and a laminated line must then cost exactly what an unlaminated one does — not zero, not
   NaN, and certainly not the print price plus `null` coerced to something. */
check('laminating a basket line adds its price, and unlaminating takes it off', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.cartMoney || !t.setCart || !t.lamPrice) return ['the basket is not exported — cannot check it'];
  const bad = [];
  const line = { key: 'T1', name: 'Quadratics', kind: 'print', cost: 0, money: 0.16, pages: 8 };

  const lam = t.lamPrice(8);
  if (lam === null) {
    /* The fixture this runs against may not price laminating; that is a valid state and the one
       thing to check about it is that nothing is charged for it. */
    line.laminate = true;
    if (t.cartMoney(line) !== 0.16) {
      bad.push('with no rate in the sheet a laminated line costs ' + t.cartMoney(line)
             + ' instead of the plain 0.16 — an unpriced upgrade must be free of charge, '
             + 'not charged as NaN or zeroed over the print price');
    }
    return bad;
  }

  const plain = t.cartMoney(line);
  if (plain !== 0.16) bad.push('a plain line costs ' + plain + ', not its own 0.16');

  line.laminate = true;
  const on = t.cartMoney(line);
  if (on !== Math.round((0.16 + lam) * 100) / 100) {
    bad.push('laminated it costs ' + on + ' but print 0.16 + laminate ' + lam
           + ' is ' + (0.16 + lam) + ' — the upgrade is not reaching the line total');
  }

  line.laminate = false;
  const off = t.cartMoney(line);
  if (off !== plain) {
    bad.push('taking the laminate off leaves it at ' + off + ' rather than back at ' + plain
           + ' — the upgrade was added to the stored price instead of derived from the flag');
  }
  return bad;
});

check('the basket draws a laminate control on a paper and on nothing else', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.basket || !t.setCart || !t.lamPrice) return ['the basket is not exported — cannot check it'];
  if (t.lamPrice(8) === null) return [];        // not priced in this fixture; nothing to draw
  /* THE SHOP LINE CARRIES A PAGE COUNT ON PURPOSE, and that is the whole point of this journey.
     A highlighter with no `pages` is refused by `laminatePrice` returning null, so a version with
     the kind test taken out still passes — the check would be asserting the page count and
     reporting it as the kind. A workbook has pages and is still not a thing this shop laminates:
     it is stock, not something printed here. Giving it a count is what makes the kind test the
     thing being measured. */
  t.setCart([
    { key: 'T1', name: 'Quadratics', kind: 'print', cost: 0, money: 0.16, pages: 8 },
    { key: 'S1', name: 'Revision workbook', kind: 'shop', cost: 3, money: 0, pages: 64 },
  ]);
  const html = (t.basket() || []).join('');
  const bad = [];
  const n = (html.match(/data-do="cart-laminate"/g) || []).length;
  if (n !== 1) {
    bad.push('the basket drew ' + n + ' laminate controls for one paper and one shop item — '
           + 'a shop item is stock, not something printed here, and must not be offered one');
  }
  /* THE PRICE ON THE CONTROL, not just the word. "+ laminate" is a question somebody has to press
     to find the answer to. */
  if (!/cart-laminate[\s\S]{0,240}?[£\d]/.test(html)) {
    bad.push('the laminate control does not name its price, so pressing it is the only way to '
           + 'find out what it costs');
  }
  t.setCart([]);
  return bad;
});

/* ---------- THE TWO GRIDS ARE PRICED AT THE WIDTH THEY ARE DRAWN AT ------------------------------
   THE FAULT THIS GUARDS AGAINST has happened twice in `mat.js` already and both are written up
   there: the picker costs a component from its width, the page draws it at another, and the gauge
   that decides whether the sheet fits is confidently wrong. `half` was priced at 99mm while it was
   drawn at 61; the ruler was priced at 0cm² while the bar charged 52.

   THE `pair` BLOCKS ARE THE THIRD CHANCE TO MAKE IT. They are laid out two across rather than
   three, so the one number that must not be `matColW()` is theirs — and the two widths have to come
   out of the same two constants, or changing the gutter moves one and not the other. */
check('the cheat sheet prices its two-across blocks at two across', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matParts || !t.matColW || !t.matPairW) return ['the cheat sheet is not exported'];
  const bad = [];
  const parts = t.matParts();
  const pair = parts.filter(c => c.pair);
  /* ---------- NAMED, NOT COUNTED ------------------------------------------------------------------
     THIS ASKED WHETHER ANY COMPONENT WAS MARKED `pair` and passed with one of the two unmarked —
     which is exactly the change somebody makes by accident, editing one line of a pair. The ids are
     written here on purpose: these two were asked for by name, and a list of two kept in two places
     is the cheapest way to be told when one of them moves. */
  ['M02', 'M03'].forEach(id => {
    const c = parts.find(x => x.id === id);
    if (!c) return;                 /* the sheet can hide a component; that is not this check's business */
    if (!c.pair) {
      bad.push(id + ' (' + c.name + ') is no longer marked `pair`, so its width goes back to '
             + 'depending on how many other narrow blocks happen to share its run');
    }
  });
  if (!pair.length) {
    return ['no component is marked `pair` any more — the hundred square and the times table were, '
          + 'and without it their width goes back to depending on what else is ticked'];
  }
  /* EVERY `pair` BLOCK MUST ALSO BE NARROW. A full-width one would be drawn at 184mm and priced at
     88 — the same disagreement, pointing the other way. */
  pair.filter(c => !c.half).forEach(c =>
    bad.push(c.id + ' is marked `pair` but not `half`, so it is drawn full width and priced at half'));
  const one = t.matColW(), two = t.matPairW();
  if (!(two > one)) {
    bad.push('a two-across block is priced at ' + two + 'mm and a three-across one at ' + one
           + 'mm — two across cannot be the narrower of the two');
  }
  /* THE ARITHMETIC, not a remembered number: 184mm of text with one 8mm gutter, halved. */
  const want = (184 - 8) / 2;
  if (Math.abs(two - want) > 0.01) {
    bad.push('a two-across block is priced at ' + two + 'mm; 184mm of text less one 8mm gutter, '
           + 'halved, is ' + want + 'mm — the gutter is being spent twice or not at all');
  }
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
  /* THE SCREENS THAT EXIST, read off `TABS` rather than written out. This has now been wrong twice
     — once naming `find` after the funnel absorbed it, once naming `book` after the booking form
     moved onto the funnel — and both times it reported the app drawing nothing on a tab the app
     does not have. A test being wrong about the app is the worst kind of red there is, and a list
     of tabs kept by hand beside the real list of tabs is how you get one.

     Asked of the app, so it cannot go stale again. */
  (w.__t.TABS || []).map(t => t.id).forEach(id => {
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

check('every question the form asks has a row on the paper', async () => {
  /* ---------- THE CARD USED TO DELETE ITS OWN UNANSWERED QUESTIONS ---------------------------------
     `bookBreakdown` chose between two lists: the form's thirteen questions when nothing could be
     priced, and `PRICE_ROWS` — which only has lines for things that COST — the moment anything
     could. So answering a level made Kind, When, Term, Split, Child, For and Tutor disappear off
     the card while still being asked. Nothing threw; the rows were simply not drawn.

     THE CHECK IS THE INVARIANT, not the bug: whatever the form is asking, the paper has a row for
     it. Priced or not, before or after, a question with nowhere to answer it is broken. */
  const { w } = boot();
  await wait(300);
  if (!w.__t.STEPS) return ['BOOK_STEPS is not exported — cannot check the form'];
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
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
  w.__t.STEPS
    .filter(s => { try { return s.options().filter(Boolean).length > 0; } catch (e) { return false; } })
    .forEach(s => {
      if (!html.includes('>' + (s.short || s.id) + '<')) {
        bad.push('"' + s.label + '" is asked but has no row on the paper');
      }
    });
  return bad;
});

check('the paper keeps the same rows whatever is answered', async () => {
  /* ---------- ROWS USED TO COME AND GO ---------------------------------------------------------
     `stepRows_` SKIPPED ANY STEP WITH NO OPTIONS, so choosing "waiting list class" deleted Subject,
     Level, When and Term off the card, and choosing a class to join deleted four more. The paper
     reshaped itself under every answer: the card changed height, every row below moved, and where
     a field was depended on what you had already said.

     THE INVARIANT IS THE SHAPE. Whatever is answered, the same questions have the same rows in the
     same order. What changes is whether a row can be answered, which is a state of its control.

     This is the check that would have caught the disappearing rows AND would catch them coming
     back — an empty `options()` is a reason to grey a row, never to drop it. */
  const { w } = boot();
  await wait(300);
  if (!w.__t.paper) return ['bookBreakdown is not exported — cannot check the paper'];
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const B = w.__t.BOOKING;

  /* THE QUESTIONS ONLY, which is what has to hold still. A derived line — "Extra subjects", the
     booked days, an estimate — appears when there is something to say and belongs at the foot, below
     everything that can be answered. Those are additive and do not move a question. */
  const asked = w.__t.STEPS.map(s => s.short || s.id);
  const shape = () => (w.__t.paper().match(/class="bk-k">[^<]*/g) || [])
    .map(x => x.split('>')[1])
    .filter(k => asked.indexOf(k) !== -1)
    .join('|');

  B.how = 'Instant class'; B.loc = 'Colliers Wood Library';
  B.subjects = []; B.level = ''; B.joining = '';
  const blank = shape();

  B.subjects = ['Maths']; B.level = '11+';
  const priced = shape();

  B.how = 'Waiting list class';
  const klass = shape();

  const bad = [];
  if (!blank) bad.push('the paper drew no rows at all');
  if (priced !== blank) {
    bad.push('answering changed which rows exist:\n            was  ' + blank
      + '\n            now  ' + priced);
  }
  if (klass !== blank) {
    bad.push('choosing a waiting list changed which rows exist:\n            was  ' + blank
      + '\n            now  ' + klass);
  }
  return bad;
});

check('a price lands on the question that caused it', async () => {
  /* ---------- THE FIGURES WERE STRANDED FROM THEIR ANSWERS ---------------------------------------
     `bookBreakdown` merges each priced line onto the form row for the step it came from, and it
     finds that row by the line's `step` field. `breakdownRows` was blanking that field on any row
     that carried a control — which, once every question became a dropdown, was all of them.

     So nothing merged. Every price printed as a row of its own below the form, and the multiplier
     for "Level" sat four lines away from the level somebody had chosen. Nothing threw and the rows
     were all present, which is why it read as the figures having quietly gone.

     THE CHECK IS THAT A SURCHARGE IS ON ITS OWN ROW — the venue's running total on the Venue line,
     not on a second line named after the price table. */
  const { w } = boot();
  await wait(300);
  if (!w.__t.paper) return ['bookBreakdown is not exported — cannot check the paper'];
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
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
  /* ---------- AND THE BASE LINE IS STILL THERE, WHEREVER IT NOW LIVES ---------------------------
     THE GUARD IS REAL AND THE ADDRESS WAS STALE. An earlier attempt at this merge dropped the base
     charge off the card entirely — excluded from the merge, then dropped by a filter that saw it
     named a step and assumed it had already merged — so something has to insist it still exists.
     That part stands.

     BUT IT IS NO LONGER A ROW CALLED "Tuition". book.js:1999 folded it onto the Tutor row on
     purpose: `Tutor · Halex Dias` and `Tuition · Halex Dias · × 10 · £10.00/h` are one fact printed
     twice, once as something you can change and once as something you cannot. The note ends "the
     second row stops existing rather than being blanked and left", and it does not exist. So this
     was looking for a row the design had deliberately removed, and calling its absence a fault.

     ASKED OF THE MONEY INSTEAD OF THE LABEL. The base charge is the one price with no question
     behind it, and after the merge it is the Tutor row's running total. If that total is empty the
     charge really has gone — which is the thing this journey exists to catch — and it does not
     matter what the row is called when it happens. */
  const tutor = find('Tutor');
  if (!tutor) bad.push('there is no Tutor row, so the base charge has nowhere to be');
  else if (!cell(tutor, 'bk-t')) {
    bad.push('the base charge has vanished — the Tutor row carries no running total');
  }
  return bad;
});

check('an instant class with room can be joined, not only a waiting list', async () => {
  /* ---------- HALF THE JOINABLE THINGS WERE INVISIBLE ---------------------------------------------
     The `joining` row only had options when the kind was a waiting list, so a class already running
     with two seats left could not be reached from the form at all — you had to find its card and
     press a button that sent immediately. `kind` and `canAsk` were on the payload the whole time.

     THE TWO ARE JOINED BY DIFFERENT VERBS and that is the reason to keep them apart rather than a
     reason to offer one: a list is a thing that exists to be joined, a running class belongs to the
     family who booked it. So the row offers whichever kind was asked for, and `book-send` picks the
     verb to match. */
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

/* ---------- PRESSING SEND USED TO EMPTY THE SCREEN ------------------------------------------------
   `resetBooking_()` CLEARS EVERY ANSWER AND `load()` FETCHES THE NEW JOB, so the page a person was
   looking at a second ago went blank and a toast was the only evidence anything had happened. The
   session was real and two swipes away under `Booking · Receipts`, which is not where somebody
   looks immediately after pressing a button.

   SO THE BOOKING COMES BACK UNDER THE BLANK FORM, and this asks for exactly that: one more
   document on the SAME page, carrying the id of the job that was just created.

   THE PAGE COUNT IS PART OF IT. Each element of `bookBlocks()` is a page somebody swipes to, so a
   receipt returned as its own element would be "somewhere else" again — the fault this fixes,
   wearing a different shape. Same page, more markup. */
check('a booking you just asked for is still on the screen afterwards', async () => {
  const bad = [];
  const { w, sent } = boot({ reply: { success: true, jobId: 'J-ASK' } });
  await wait(300);
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });

  /* ---------- PAGE ZERO, WHICH IS THE FORM — NOT THE WHOLE COLUMN ------------------------------
     THIS JOINED EVERY PAGE AND ASKED WHETHER `J-ASK` WAS ANYWHERE IN IT, which was a true reading
     of the column while `myJobs_` returned nothing for anybody: one page, the form, and nothing
     else. With the payload sending `client` — see the note above `jobs` — this visitor has three
     sessions of her own and one of them IS J-ASK, so "a booking is shown before one has been asked
     for" became trivially true about a page this journey is not about.

     WHAT IT MEANS TO ASSERT is that `askedBlock_` draws nothing until something has been sent, and
     that is a fact about the form page. `blocks()[0]` is that page — `bookBlocks` returns the form
     first and the receipts after it. */
  const pagesBefore = w.__t.blocks().length;
  const formPage = () => w.__t.blocks()[0] || '';
  const before = formPage();
  if (before.includes('J-ASK')) bad.push('a booking is shown under the form before one was asked for');
  if (w.__t.asked()) bad.push('something is remembered as asked for before any send');

  /* ---------- THE THREE STATE ROWS ARE ON THE BLANK FORM, AND THEY ARE BLANK ----------------------
     `Stage`, `Status` and `Asked for` are pinned to the end of the spine so the document reads the
     same from the first question to the last payment. On a form nobody has sent they have nothing
     to report, and they print `—` like every other unanswered row rather than a sentence that stops
     the eye. Two of them carried sentences until the spec asked for dashes; this keeps them dashes.

     READ OFF `bk-k`/`bk-v`, WHICH IS THE MARKUP THE FORM ACTUALLY USES. The first version of this
     looked for `</tr>` and reported all three rows missing — they were present and already correct,
     and the check was describing its own selector rather than the page. A row here is a
     `div.bk-row` of spans, and the value is the `bk-v` following the `bk-k` that carries the label. */
  const cellOf = (html, label) => {
    const k = html.indexOf('<span class="bk-k">' + label + '</span>');
    if (k < 0) return null;
    const v = html.indexOf('bk-v', k);
    if (v < 0) return null;
    return html.slice(v, html.indexOf('</span>', v)).replace(/^[^>]*>/, '').trim();
  };
  const dashes = (html, where) => ['Stage', 'Status', 'Asked for'].forEach(label => {
    const v = cellOf(html, label);
    if (v === null) bad.push(`the ${where} booking form has no "${label}" row`);
    else if (v !== '—') {
      bad.push(`"${label}" on the ${where} form reads ${JSON.stringify(v)}, not a dash`);
    }
  });
  dashes(before, 'blank');

  /* ---------- AND ON THE PRICED FORM, WHICH IS A DIFFERENT BUILDER ---------------------------------
     THE BLANK FORM'S DASHES ARE NOT PROOF OF ANYTHING. `bookPrice()` is null until enough has been
     answered to cost the booking, so on an empty form `breakdownRows` never runs and the three rows
     come from `spineRows_`, which prints a dash for every spine row neither builder produced. They
     were dashes there before this rule existed and would be dashes if it were deleted.

     `breakdownRows` IS THE BUILDER THAT CARRIES THE VALUES, and it only runs once the form can be
     priced — so that is the state where "Stage says a sentence" could come back. Checked here after
     answering enough to produce a cost, which is the only version of this assertion that can fail.
     The first version tested the blank form only, and went on passing with the sentences put back. */
  const P = w.__t.BOOKING;
  Object.keys(P).forEach(k => { if (Array.isArray(P[k])) P[k] = []; else P[k] = ''; });
  P.how = 'A session of your own'; P.level = 'GCSE'; P.loc = 'Colliers Wood Library';
  P.subjects = ['Maths']; P.n = '1'; P.hosting = 'No — we book the room';
  P.slots = ['m16']; P.interval = 'Autumn 1';
  const priced = formPage();
  if (!w.__t.paper || w.__t.paper()) dashes(priced, 'priced');

  const B = w.__t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.how = 'A session of your own'; B.level = 'GCSE'; B.loc = 'Colliers Wood Library';
  B.subjects = ['Maths']; B.n = '1'; B.hosting = 'No — we book the room';
  B.slots = ['m16']; B.interval = 'Autumn 1';
  try { w.__t.ACTIONS['book-send']({ disabled: false, dataset: {} }); }
  catch (e) { return bad.concat('book-send threw: ' + e.message); }
  await wait(600);

  if (!sent.map(x => x.action).includes('createJob')) {
    return bad.concat('no createJob was sent, so there is nothing to show');
  }
  /* THE ID THE BACKEND ANSWERED WITH, not one this test invented — if `createJob` stops returning
     `jobId` the widget has nothing to look up and this is where that shows. */
  if (w.__t.asked() !== 'J-ASK') {
    bad.push('the booking just made was not remembered (asked = "' + w.__t.asked() + '")');
  }
  const after = formPage();
  if (!after.includes('J-ASK')) bad.push('the booking just made is not drawn under the form');
  /* THE STAGE ROW, TWICE: the blank form still says "Not asked for yet" and the receipt under it
     says where the real booking has got to. One of them is the answer to the other. */
  if ((after.split('Stage').length - 1) < 2) {
    bad.push('the second document has no Stage row, so it is not the booking widget');
  }
  /* ---------- IT MUST NOT GROW, AND IT IS ALLOWED TO SHRINK -------------------------------------
     THE RULE IS "BELOW, NOT BESIDE" — the booking just sent goes under the form rather than
     becoming another page to swipe to, which is the note `askedBlock_` carries. This asserted the
     count was UNCHANGED, which was the same statement while nobody had any other sessions.

     A SESSION ALREADY ON THE COLUMN MOVES ONTO THE FORM. `myJobsOrdered_` filters out whatever
     `ASKED_JOB` holds, precisely so the same receipt is not drawn twice — so asking for a session
     you already had legitimately takes the column from four pages to three. Growing is the fault;
     shrinking by one is the duplicate being removed. */
  const pagesAfter = w.__t.blocks().length;
  if (pagesAfter > pagesBefore) {
    bad.push('the booking was added as a separate page (' + pagesBefore + ' -> '
      + pagesAfter + '), not below the form');
  }
  return bad;
});

check('an admin can answer a booking, and only one that is waiting', async () => {
  const { w } = boot();
  await wait(300);
  w.__t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
  const bad = [];
  /* ---------- IT LOOKED IN THE SHEET, AND THERE IS NO SHEET ------------------------------------
     `on('job')` OPENED A PANEL OVER THE APP and now turns to the session's page on the Booking
     column — reported twice by the owner as "your week planner has pop ups… I told you I don't like
     that". So this reads `#s-booking`, which is where `paint` writes.

     THE JOURNEY WAS RIGHT TO BREAK, and that is the reason to repoint it rather than relax it: what
     it asserts — an admin can Accept a booking that is waiting and cannot Accept one already paid
     for — is true of the app either way, and it was checking the one renderer that has gone. The
     tiles it looks for are `jobAdminTiles_`'s, which `jobPage_` now draws, so this is the same
     question asked of the surviving surface. */
  const buttonsOn = id => {
    try { w.__t.ACTIONS['job']({ dataset: { id } }); } catch (e) { return ['THREW: ' + e.message]; }
    const b = w.document.getElementById('s-booking');
    return b ? [...b.querySelectorAll('[data-do]')].map(x => x.dataset.do) : [];
  };
  const ask = buttonsOn('J-ASK');
  if (!ask.includes('job-answer')) bad.push('no Accept/Decline on a booking that is waiting');
  const paid = buttonsOn('J-PAID');
  if (paid.includes('job-answer')) bad.push('Accept/Decline offered on a booking already paid for');
  return bad;
});

/* ---------- PAY MOVED, AND THIS JOURNEY DID NOT ---------------------------------------------------
   IT LOOKED IN THE RECEIPT SHEET, because that is where `payBlock` used to put the button. Both
   `payBlock` and `leaveBlock` became marks in the tile row under the card — see book.js:2828 — and
   `jobTiles_` in tiles.js is what renders them now.

   THE JOURNEY WAS RIGHT TO FAIL, ALL THE SAME. `receipt.js` was still calling the deleted
   `payBlock`, so opening any session receipt threw and the sheet had no buttons of any kind in it.
   "A client cannot pay an accepted booking" was true, and so was rather more than that. Fixing the
   call is what let this be re-pointed rather than simply deleted — the check was reporting a real
   fault right up until the fault was gone.

   ASKED OF `jobTiles_` DIRECTLY, so it is the same function the card calls, and the three states
   are the three that matter: asked-for, accepted, and already paid. */
check('a client can pay once it is accepted, and not before', async () => {
  const { w } = boot();
  await wait(300);
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  if (typeof w.__t.jobTiles !== 'function') return ['jobTiles_ is not exported — cannot check Pay'];

  const bad = [];
  const offersPay = id => {
    const j = (w.__t.BOOKING && w.__t.BOOKING.jobs ? w.__t.BOOKING.jobs : [])
      .find(x => String(x.id || x.jobId) === id);
    if (!j) return null;                       // fixture does not carry it; nothing to say
    try { return /job-pay/.test(w.__t.jobTiles({ row: j }) || ''); }
    catch (e) { return 'THREW: ' + e.message; }
  };

  const ask = offersPay('J-ASK'), ok = offersPay('J-OK'), paid = offersPay('J-PAID');
  if (typeof ask === 'string' || typeof ok === 'string' || typeof paid === 'string') {
    return [String(ask || ok || paid)];
  }
  if (ask === true)  bad.push('a client is offered Pay before it is accepted');
  if (ok === false)  bad.push('a client cannot pay an accepted booking');
  if (paid === true) bad.push('Pay is still offered on a paid booking');
  return bad;
});

check('taking a seat on a class does not go through the ordinary join', async () => {
  const { w, sent } = boot();
  await wait(300);
  w.__t.USER({ name: 'Somebody Else', personId: 'P9', role: 'parent', roles: ['parent'] });
  try { w.__t.ACTIONS['job']({ dataset: { id: 'W-LIST' } }); }
  catch (e) { return ['opening the class threw: ' + e.message]; }
  /* `#s-booking` RATHER THAN THE SHEET — see the note on the admin journey above. `joinBlock` is
     what offers the seat and `jobPage_` draws it, so the control is on the page the app turns to. */
  const b = w.document.getElementById('s-booking');
  const dos = b ? [...b.querySelectorAll('[data-do]')].map(x => x.dataset.do) : [];
  if (dos.includes('job-join')) {
    return ['a class offers "Ask to join", which is the act for somebody else\'s booking — '
      + 'it prices nothing and records no availability'];
  }
  if (!dos.includes('job-take-seat')) return ['a class with seats left offers no way to take one'];
  try { w.__t.ACTIONS['job-take-seat']({ disabled: false, dataset: { id: 'W-LIST' } }); }
  catch (e) { return ['taking a seat threw: ' + e.message]; }
  await wait(250);

  /* ---------- IT NO LONGER SENDS, AND THAT IS THE POINT --------------------------------------------
     THIS ASSERTED `joinWaitlist` WENT OUT, because taking a seat used to ask availability in a
     browser `prompt()` and post it immediately. That was two ways to join a class sharing no code
     and asking different questions, and the second could not price a seat or validate its answer.

     TAKING A SEAT FILLS THE FORM IN NOW and turns to it, so nothing is sent until the one send
     button is pressed — the same button an instant booking uses. Asserting a request here would be
     asserting the fault back into place.

     WHAT IS CHECKED INSTEAD is that the form knows what was chosen: a waiting list, THIS list, and
     the three things the class decides. That is what the old request carried, and it is now
     somewhere a person can see it before it goes. */
  const bad = [];
  const B = w.__t.BOOKING;
  if (!/wait/i.test(String(B.how || ''))) bad.push('the kind was not set to a waiting list');
  if (!B.joining) bad.push('the class was not chosen on the form');
  if (!B.loc) bad.push('the venue the class runs at was not filled in');
  if (sent.map(x => x.action).includes('joinWaitlist')) {
    bad.push('it sent joinWaitlist without anybody pressing send');
  }
  return bad;
});

check('a festive event shows itself and can be joined', async () => {
  const { w, sent } = boot();
  await wait(300);
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  /* ON POSTS, NOT BOOK. A festive card is the business announcing something with a date on it, which
     is the same voice as a post with a caption — it was only ever on the booking column because
     bookings were. There is no Book column now either way. */
  /* ---------- THE SCREEN IS CALLED `feed`, AND THIS ASKED FOR `posts` -----------------------------
     THE COLUMN WAS RENAMED AND THE JOURNEY WAS NOT. `posts.js:800` registers `screen('feed', …)`,
     so `go('posts')` navigates to a screen that does not exist and `#s-posts` is null. `cards`
     came back empty every time and the journey reported "the festive event never appeared on the
     feed" — which was true of the element it was looking at, and told you nothing about festive
     events. The feature is fine: `posts.js:191` maps `DATA.festive` through `festiveCard` and
     splices the cards in above the posts. */
  w.__t.go('feed', false, true);
  await wait(200);
  const el = w.document.getElementById('s-feed');
  if (!el) return ['there is no #s-feed — the feed screen did not draw at all'];
  const cards = el.querySelectorAll('.fest');
  if (!cards.length) return ['the festive event on the payload never appeared on the feed'];
  /* ---------- JOINING IS TWO STEPS, AND THIS ONLY DID THE FIRST ----------------------------------
     `fest-join` DOES NOT SEND ANYTHING AND IS NOT MEANT TO. It opens a sheet asking who is coming,
     because — the note above the handler — "a party needs a headcount and a family with three
     children is three chairs". `fest-join-go` is what sends, once there are names in the box.

     So "joining sent [nothing], expected joinFestive" was a true sentence about a journey that
     stopped halfway. It was hidden until now behind the wrong screen id: the card was never found,
     the journey returned before reaching here, and this half was unreachable.

     THE HEADCOUNT IS PART OF THE JOURNEY, so it is typed in rather than skipped. An empty box is
     refused by design and would look exactly like a broken send. */
  try { w.__t.ACTIONS['fest-join']({ disabled: false, dataset: { id: 'H1' } }); }
  catch (e) { return ['opening the join sheet threw: ' + e.message]; }
  await wait(200);

  const box = w.document.getElementById('fest-kids');
  if (!box) return ['the join sheet does not ask who is coming — no #fest-kids'];
  box.value = 'Amira and Yusuf';

  try { w.__t.ACTIONS['fest-join-go']({ disabled: false, dataset: { id: 'H1' } }); }
  catch (e) { return ['sending the headcount threw: ' + e.message]; }
  await wait(250);

  const got = sent.map(x => x.action);
  if (!got.includes('joinFestive')) {
    return ['joining sent [' + (got.join(', ') || 'nothing') + '], expected joinFestive'];
  }
  /* AND THE HEADCOUNT ACTUALLY TRAVELLED. Sending `joinFestive` with no `kids` would satisfy the
     line above and lose the one fact the extra step exists to collect. */
  const call = sent.find(x => x.action === 'joinFestive');
  return (call && String(call.kids || '').trim()) ? []
    : ['joinFestive was sent without the names — the headcount question achieved nothing'];
});

check('the docket keeps the text you typed, whatever it starts with', async () => {
  /* ---------- THE BUG, DEMONSTRATED BEFORE IT WAS FIXED -----------------------------------------
     `x ` AND A TICK WERE THE DONE MARKERS, bare, at the front of the line. So "x ray results" was
     stored and read back as a COMPLETED task called "ray results": the state wrong and the text
     eaten, which is both of the only two things a to-do list has to get right. "X marks the spot"
     went the same way.

     THE MARKER IS A MARKDOWN CHECKBOX NOW and cannot collide with prose. This journey is written
     against the STORAGE FORMAT rather than the markup, because that is what has to survive — the
     sheet is the database and these strings sit in a column somebody reads. */
  const { w } = boot();
  await wait(300);
  if (typeof w.__t.dockLines !== 'function' || typeof w.__t.dockText !== 'function') return [];

  const bad = [];
  const round = t => {
    w.__t.USER({ name: 'R', personId: 'P1', todo: w.__t.dockText([{ done: false, text: t }]) });
    return (w.__t.dockLines() || [])[0];
  };

  ['x ray results', 'X marks the spot', '\u2713 already ticked?', 'Buy milk'].forEach(t => {
    const got = round(t);
    if (!got) { bad.push('"' + t + '" vanished from the docket entirely'); return; }
    if (got.text !== t) bad.push('"' + t + '" came back as "' + got.text + '" \u2014 the text was eaten');
    if (got.done) bad.push('"' + t + '" came back ticked, and nobody ticked it');
  });

  /* A TICK MUST STILL SURVIVE A ROUND TRIP, or the fix traded one failure for the other. */
  w.__t.USER({ name: 'R', personId: 'P1', todo: w.__t.dockText([{ done: true, text: 'Pay the invoice' }]) });
  const ticked = (w.__t.dockLines() || [])[0];
  if (!ticked || !ticked.done) bad.push('a ticked line did not come back ticked');
  if (ticked && ticked.text !== 'Pay the invoice') bad.push('a ticked line lost its text');

  /* AND EVERY DOCKET WRITTEN BEFORE THE BOXES EXISTED still has to read correctly, or the fix
     silently unticks everybody's finished work the first time they open it. */
  w.__t.USER({ name: 'R', personId: 'P1', todo: 'x old style\n\u2713 also old\nplain line' });
  const legacy = w.__t.dockLines() || [];
  if (legacy.length !== 3) bad.push('a legacy docket did not read back as three lines');
  if (legacy[0] && (!legacy[0].done || legacy[0].text !== 'old style')) {
    bad.push('the legacy `x ` form stopped reading as done');
  }
  if (legacy[2] && legacy[2].done) bad.push('a plain legacy line came back ticked');
  return bad;
});

check('every pager counts the pages its screen actually draws', async () => {
  /* ---------- THE BUG THIS IS WRITTEN FOR, AND IT HAS HAPPENED THREE TIMES ------------------------
     `PAGER.account` counted `mePages()`. That function fed the old You COLUMN and says so in its
     own comment; `screen('account')` draws `accountPages_()` plus `termsPages_()`. So the number of
     pages the header believed in and the number on screen came from two functions that had not
     agreed since the column was folded into the funnel — and you could not move down the profile
     column at all. Not an error: the pager reported one page, so there was nowhere to go, while the
     pages sat underneath waiting.

     THE SAME SHAPE TWICE BEFORE. `PAGER` keyed on `me` and `posts` when the screens had been renamed
     `account` and `feed`, so two columns silently stopped paging. And `stuffFirstResult_` counted a
     page list that `paintStuff` built differently, which put a blank card under the question for
     every starred thing.

     SO THE JOURNEY ASKS THE BROWSER, not the source: paint each screen through `go`, count the
     `.page` elements that exist, and compare with what `PAGER[id]()` says. Two functions can only
     be checked against each other by running both. */
  const { w } = boot();
  await wait(400);
  if (!w.__t.PAGER) return ['PAGER is not exported — cannot check the pagers'];

  /* SIGNED IN, because half these columns draw a sign-in card and nothing else when signed out —
     a roster of one page agrees with anything and proves nothing. */
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  /* AND REPAINTED, BECAUSE THAT IS WHAT SIGNING IN DOES. `__t.USER` only sets the variable; the app
     calls `repaint()` straight after, which marks every other screen stale so `go` redraws it on the
     way in. Without this the journey walks onto screens painted while signed out and reports a
     disagreement that is its own doing — which is exactly what it did the first time it ran. */
  if (typeof w.__t.repaint === 'function') w.__t.repaint(true);
  await wait(200);

  const bad = [];
  /* ---------- AND IT WALKED `PAGER`, SO A SCREEN WITH NO ENTRY WAS INVISIBLE TO IT ---------------
     THIS IS THE FAULT THE JOURNEY IS NAMED FOR, IN THE JOURNEY. It asked every screen that HAS a
     pager whether that pager agrees with what is drawn — and the worst version of this bug is a
     paged screen with no entry at all, which `Object.keys(PAGER)` cannot enumerate. `booking` was
     exactly that: `screen('booking')` uses `pages()`, `PAGER` had never heard of it, and so the
     form and every session receipt on that column could not be swiped to. `shell.js`'s own note
     over `tools` describes the state precisely — "the pages exist and nothing reaches them" — and
     names the two columns it had already happened to.

     SO IT WALKS `TABS`, which is the app's own list of screens, and a screen that draws pages with
     no pager is a failure rather than a row that is never visited. Fourth costume of the
     check-that-cannot-reach-its-subject fault, and the first one inside a check written about
     pagers. */
  const ids = (w.__t.TABS || []).map(t => t.id);
  if (!ids.length) return ['TABS is empty — cannot tell which screens exist'];
  for (const id of ids) {
    try { w.__t.go(id, false, true); } catch (e) { bad.push(id + ' threw on go(): ' + e.message); continue; }
    await wait(120);
    const el = w.document.getElementById('s-' + id);
    if (!el) { bad.push(id + ' has no #s-' + id + ' to draw into'); continue; }
    const drawn = el.querySelectorAll('.page').length;
    /* A SCREEN THAT DRAWS PAGES AND HAS NO PAGER gets no `paged` class and no axis — see the note
       above. Said as its own sentence rather than as "0 against 3", because the repair is an entry
       in `PAGER` and not a number to correct. */
    if (!w.__t.PAGER[id]) {
      if (drawn > 1) {
        bad.push(id + ': ' + drawn + ' pages drawn and no PAGER entry \u2014 so the screen gets no '
                    + 'axis and none of them can be reached');
      }
      continue;
    }
    let says;
    try { says = (w.__t.PAGER[id]() || []).length; }
    catch (e) { bad.push(id + ' pager threw: ' + e.message); continue; }
    /* A SCREEN THAT DRAWS NO PAGES IS NOT PAGED AT ALL and its pager saying nothing is correct. */
    if (!drawn && !says) continue;
    if (drawn !== says) {
      bad.push(id + ': ' + drawn + ' page' + (drawn === 1 ? '' : 's') + ' drawn, pager counts '
                  + says + ' \u2014 so the header and the screen disagree and moving down will '
                  + 'stop early or refuse');
    }
  }
  return bad;
});

check('an admin still has every action on a session after the move to tiles', async () => {
  /* ---------- THE JOURNEY I PROMISED BEFORE MOVING THEM ------------------------------------------
     Accept, Decline, Mark as paid and Delete were four `<button>`s inside the receipt and are tiles
     now. A refactor that renders the same actions in a different shape is exactly the kind that
     loses one silently: the card still draws, the page still looks right, and the action somebody
     needed once a month is gone.

     SO IT ASKS FOR THE `data-do` NAMES, not the markup. That is what a tap actually dispatches on —
     it is what `check-doors` pairs against a handler — so a journey written against it survives the
     next change of shape too, which is the whole point of writing it at this moment.

     AND IT CHECKS THE STAGES SEPARATELY, because the actions are not all offered at once: Accept
     and Decline only exist on a request, and Mark as paid only once it is accepted. A journey that
     only looked at one stage would pass while the other had lost everything. */
  const { w } = boot();
  await wait(300);
  if (typeof w.__t.jobAdmin !== 'function') return [];   // only checkable where it is exported

  const bad = [];
  const job = { id: 'J-1', price: 40, slots: [] };
  const has = (html, act) => html.indexOf('data-do="' + act + '"') !== -1;

  /* A REQUEST NOBODY HAS ANSWERED: both halves of the decision, and the way to end it. */
  const asking = w.__t.jobAdmin(job, 'application', false);
  ['job-answer', 'job-delete'].forEach(a => {
    if (!has(asking, a)) bad.push('an unanswered request has no `' + a + '`');
  });
  if (has(asking, 'job-paid')) {
    bad.push('an unaccepted booking offers `job-paid` — the backend refuses that, so it must not be '
           + 'offered');
  }
  /* BOTH HALVES, not one. They are one decision and a tile row with only Accept on it is a trap. */
  if ((asking.match(/data-do="job-answer"/g) || []).length < 2) {
    bad.push('only one half of Accept/Decline is there');
  }

  /* ACCEPTED: paying by hand becomes possible, and answering is done with. */
  const agreed = w.__t.jobAdmin(job, 'application', true);
  if (!has(agreed, 'job-paid')) bad.push('an accepted booking has no `job-paid`');
  if (!has(agreed, 'job-delete')) bad.push('an accepted booking has no `job-delete`');

  /* A RUNNING SESSION: nothing to answer, nothing to mark, still endable. */
  const live = w.__t.jobAdmin(job, 'booked', true);
  if (has(live, 'job-answer')) bad.push('a booked session still offers `job-answer`');
  if (!has(live, 'job-delete')) bad.push('a booked session cannot be deleted');

  /* THEY ARE TILES NOW, in the row every other thing's actions use. */
  if (asking.indexOf('class="tile-row"') === -1) {
    bad.push('the admin actions are not in a `.tile-row` — they should look like every other '
           + "thing's actions");
  }
  if (/<button class="btn/.test(asking)) {
    bad.push('a plain `.btn` came back in among the tiles');
  }
  return bad;
});

check('the camera card starts itself and offers the gallery', async () => {
  /* ---------- THIS JOURNEY HAS OUTLIVED TWO OF ITS OWN SUBJECTS ------------------------------------
     It began as "an admin can run the folder scan", and `scan-posts` left the app. It was rewritten
     to check that the post card told a client and an admin different things — "we check posts before
     they go up" — and that sentence left with the `Write a post` button, removed on request.

     THE HONEST MOVE THE SECOND TIME IS NOT THE SAME AS THE FIRST. The rewrite worked because the
     rule survived its button: somebody still had to be told their post was moderated. This time the
     surface itself is gone — there is no composer on this card and no door to one anywhere — so
     there is no wording left to protect, and a journey asserting a deleted sentence is a red that
     will never go green. Rewriting it to guard the deletion instead of mourning it.

     WHAT IT GUARDS NOW is the card's actual promise: the camera comes up on its own, there is a way
     in from the gallery, and nothing asks you to switch a camera on that is already starting. Put a
     start button back in the normal path and this objects. */
  const { w } = boot();
  await wait(300);
  if (typeof w.__t.card !== 'function') return [];      // only checkable where the card is exported

  const bad = [];
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const html = w.__t.card();

  if (!/id="cam-view"/.test(html)) bad.push('the camera card has no viewfinder');
  if (!/id="cam-pick"/.test(html)) bad.push('there is no way to pick a picture from the gallery');
  if (!/type="file"/.test(html) || !/accept="image\/\*"/.test(html)) {
    bad.push('the gallery control is not a file input that accepts pictures');
  }
  /* `capture` WOULD REOPEN THE CAMERA, which is the thing the Photos button exists to be an
     alternative to — a one-word attribute that quietly turns the gallery back into a viewfinder. */
  if (/\bcapture\b/.test(html)) bad.push('the gallery control carries `capture`, so it opens the camera');

  /* THE START BUTTON IS ALLOWED TO EXIST AND NOT TO SHOW. It is the way back from a refused prompt.
     What must never come back is it being on the normal path — so if it is there, it is hidden. */
  const on = /<button[^>]*id="cam-on"[^>]*>/.exec(html);
  if (on && !/\bhidden\b/.test(on[0])) {
    bad.push('the camera card still shows a start button — it is meant to start on arrival');
  }
  if (/Turn the camera on/i.test(html)) bad.push('`Turn the camera on` is back on the card');
  if (/Write a post/i.test(html)) bad.push('`Write a post` is back on the camera card');

  /* SIGNED OUT THERE IS NO VIEWFINDER AT ALL. `screen('make')` renders a sentence instead, and a
     camera that starts for somebody who is not signed in is a permission prompt with no purpose. */
  w.__t.USER(null);
  if (typeof w.__t.makeScreen === 'function') {
    const out = String(w.__t.makeScreen() || '');
    if (/id="cam-view"/.test(out)) bad.push('the viewfinder is drawn for somebody who is not signed in');
  }
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
  /* SAME RENAME, AND THIS ONE FAILED SILENTLY RATHER THAN LOUDLY. `#s-posts` is null, so `pages`
     was empty, so `pages.length > 1` was false and the journey returned no complaints — a pass,
     every run, having examined nothing. A check that cannot find its subject must say so; passing
     is the one answer it has not earned. */
  const host = w.document.getElementById('s-feed');
  if (!host) return ['there is no #s-feed — cannot tell which card the feed opens on'];
  const pages = host.querySelectorAll(':scope > .page');
  if (pages.length > 1) {
    const front = pages[at.feed || at.posts || 0];
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
