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
      tutorSlots: [], events: [], canAsk: true, seatsGoing: 2, openToOthers: true,
      /* `whenCould` IS WHAT `doGet` SENDS ON EVERY WAITING LIST — `waitlistWhen`'s tally of the two
         families' own answers, most popular first — and this list never carried one, so the only
         thing on the page that answers the tutor's question was drawn by no journey here. The
         shape is the backend's: `people` who answered, and each phrase with its count. */
      whenCould: { people: 2, slots: [{ slot: 'Monday evening', n: 2, all: true },
                                      { slot: 'Saturday morning', n: 1, all: false }] } },
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
    students: [], resources: [], posts: [], shop: [], trips: [], exams: [],
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
                 services: ['Group'], topics: [], checklists: {}, focus: {} },
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
                                /* A JOURNEY MAY ARRIVE ON AN ADDRESS — `?verify=` is read at boot,
                                   so the only way to test it is to start there. */
                                url: opts.url || 'https://example.org/' });
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
  /* ---------- EVERY GET IS WRITTEN DOWN, AND A JOURNEY MAY ANSWER ONE ITSELF ------------------------
     THE STUB ANSWERED EVERY GET WITH THE PAYLOAD, so a journey could neither serve a real file nor
     ask what was asked for. The Bible needs both: an admin's reader has to be handed the real
     `data/bible/` files, and "a student never downloads a book" is a question about what was
     FETCHED, which only a list of fetches can answer. `serve` returns a body, `null` for a 404, or
     `undefined` to fall through to the payload as before — so every other journey is unchanged. */
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
      /* A FUNCTION MAY ANSWER PER ACTION, so a journey can play an older server that knows some
         actions and not others. */
      const rep = typeof opts.reply === 'function' ? opts.reply(body) : opts.reply;
      return Promise.resolve(body_(rep || { success: true, joined: 3, seats: 4 }));
    }
    return Promise.resolve(body_(data));
  };

  const errs = [];
  w.onerror = m => errs.push(String(m));
  /* JSDOM HAS NO MEDIA PLAYER. Reels are real `<video>` files now, and leaving a column pauses every
     clip on it — which jsdom answers with a "not implemented" stack trace per clip per journey, a
     wall of red over a run that passed. A video that does nothing is what this harness wants. */
  try {
    w.HTMLMediaElement.prototype.pause = function () {};
    w.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
    w.HTMLMediaElement.prototype.load = function () {};
  } catch (e) {}
  /* ---------- AND WHAT A JOURNEY NEEDS IN PLACE BEFORE THE FIRST LINE OF THE APP RUNS ------------
     `data.js` READS `familyUser` AT LOAD and `boot.js` starts the first screen and the payload in
     its last lines, so a journey that signs in with `__t.USER` afterwards has already missed the
     boot it is asking about. That was exactly the camera's fault: the prompt came from the repaint
     the payload's arrival makes, for somebody signed in from the moment the page opened — a path no
     journey here could stand on. So a journey may hand the window over first, the way `check/ui.js`
     uses `addInitScript`: seed storage, or stand in for a browser API jsdom does not have. */
  if (typeof opts.before === 'function') opts.before(w);
  const src = ORDER.map(n => fs.readFileSync(path.join(dir, n + '.js'), 'utf8')).join('\n');
  try {
    w.eval(src + '\n;window.__t = {' +
      'go, USER: v => { USER = v; }, whoami: () => USER, ACTIONS, BOOKING, STEPS: BOOK_STEPS, isTutorRole,' +
      /* WHETHER EVERYTHING BOOKED FOR AFTER A SLIDE HAS RUN, the widget queue included — `woken_`
         below. A function, because a `let` inside this eval is not reachable from a second one. */
      'quiet: () => !AFTER_SLIDE && !AFTER_SLIDE_JOBS.size && !(typeof TOOLS_WAIT !== "undefined" && TOOLS_WAIT.length),' +
      /* THE REAL TAB LIST, so a journey asking "does every tab draw" cannot be asking about tabs
         that no longer exist. It has been wrong twice from being written out by hand. */
      'TABS, wgChosen: () => wgChosen_(),' +
      /* THE PAPER AS DRAWN, so a journey can ask what is actually on it rather than what the
         functions behind it were supposed to produce. */
      'paper: () => (typeof bookBreakdown === "function" ? bookBreakdown(bookPrice()) : ""),' +
      /* WHAT WOULD GO ON THE WIRE. The day list, the start time and the session length are all
         taken from the FIRST run, so a journey asking whether the week reads in order is asking
         about three cells of the job row as well as about the card. */
      'spec: () => (typeof bookSpec === "function" ? bookSpec() : null),' +
      /* THE LEDGER THE CARD IS BUILT FROM. `paper()` above is the markup; this is the figures,
         and `sessionDates` is the one of them a journey can ask a question about that no
         rendering can answer — which year a session falls in. */
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
      /* AND `pageCount`, WHICH IS THE ONE DEFINITION OF HOW MANY PAGES A SCREEN HAS. This journey
         used to read `PAGER[id]().length` -- a second definition, and one that broke the day an
         entry started answering with a COUNT instead of a list of names. `PAGE_KEEP` and
         `STUFF_WIN` say how much of a windowed screen is in the document at once. */
      /* THE PAYLOAD ITSELF, AS A GETTER RATHER THAN A REFERENCE. `load()` ends with `DATA = d` —
         it REPLACES the object — so a captured reference would be a snapshot of whatever was there
         when this hook was built, which is the fault CLAUDE.md records about a state seeding
         `DATA.students` before that assignment. */
      'DATA: () => DATA,' +
      /* THE FOUR CLASSROOM GAMES' ROUNDS, as a getter for the same reason — a journey asks whether a
         repaint kept the round, and only the state can say that the clock did not move while the
         column was away. */
      'PARTY: () => (typeof PARTY !== "undefined" ? PARTY : null),' +
      /* THE ACCOUNT COLUMN'S PAGES, so a journey can ask who is drawn on it. */
      'accountPages: () => accountPages_(),' +
      'PAGER, PAGE, goPage, repaint, pageCount, PAGE_KEEP,'
      + 'STUFF_WIN: typeof STUFF_WIN === "number" ? STUFF_WIN : 0,'
      /* THE DOCKET'S STORAGE FORMAT AND ITS PAINTER, so a journey can round-trip a line through
         both without a browser and without the sheet. */
      + 'dockLines: typeof docketLines === "function" ? docketLines : null,'
      + 'dockText: typeof docketText === "function" ? docketText : null,'
      + 'paintDocket: typeof paintDocket === "function" ? paintDocket : null,'
      /* THE TIMETABLE'S KEY, because it is a `const` and only a function declaration reaches the
         window — and the key is the thing a journey has to clear and has to ask is per person. */
      + 'tmtKey: typeof tmtKey_ === "function" ? tmtKey_ : null,'
      + 'jobAdmin: typeof jobAdminTiles_ === "function" ? jobAdminTiles_ : null,'
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
      /* THE CONTROL A ROW CARRIES, so the multi-sheet journey can ask whether the row reads back
         what has been ticked — the button is the only label on it, which is the half of that
         feature a sheet full of ✓s cannot show. */
      'control: typeof stepControl_ === "function" ? stepControl_ : null,' +
      /* THE FORM'S PAGE AS DRAWN, because a picker replaces it rather than covering it — so the
         only way to ask "is the list on screen" is to ask what page 0 of the booking column holds. */
      'bookerCard: typeof bookerCard === "function" ? bookerCard : null,' +
      /* THE PEN ON A QUESTION'S DIAGRAM, both halves: the markup a card is built with, and the
         function the press mutates it with. A journey needs both because they are the two places
         the same four attributes are written, and the fault they guard is what happens when the two
         disagree. */
      'padWrap: typeof padWrap_ === "function" ? padWrap_ : null,' +
      'padArm: typeof padArm_ === "function" ? padArm_ : null,' +
      /* AND THE STATE THE MARKUP IS BUILT FROM, so the repaint path can be asked the same question
         as the press path. Without it only `padArm_` could be checked — and a `padWrap_` that got
         the armed case wrong would put the fault straight back on the next repaint. */
      'padOn: v => { PAD_ON = v; },' +
      /* AND THE PAD'S KEY, a `const` arrow, so a journey can arm a pad by the key its marks are kept
         under -- and read those marks back -- without writing the key's format out a second time. */
      'padKey: typeof padKey_ === "function" ? padKey_ : null,' +
      /* WHICH TOOL EACH PAD HOLDS, a `const` Map -- so a journey can leave a stale choice behind and
         ask whether the bar, not the Map, decides what a drag draws. */
      'padTool: () => (typeof PAD_TOOL !== "undefined" ? PAD_TOOL : null),' +
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
      /* THE CHEAT SHEET'S COMPONENT LIST AND ITS TWO WIDTHS. `matParts` is the list after the sheet
         has had its say about order and levels, which is the list the page is actually built from —
         so a journey can ask what a component is worth without a browser and without the tab. */
      'matParts: typeof matParts === "function" ? matParts : null,' +
      'matColW: typeof matColW === "function" ? matColW : null,' +
      'matPairW: typeof matPairW === "function" ? matPairW : null,' +
      'matSpan: typeof matSpan === "function" ? matSpan : null,' +
      'matSpanW: typeof matSpanW === "function" ? matSpanW : null,' +
      /* THE SUBJECT FILTER AND WHAT IT DECIDES. `matShown` is the one test the list and the paper
         both ask, so a journey asking it is asking what would print; `matSet` puts the two selects
         where a person would, through `matSettle`, which is what the handlers do. */
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
      /* THE TOPIC GROUPS — the third select — and the state the tool opened on, so a journey can ask
         what each view lists and where a student lands. `matFresh` forgets every choice the way a
         first visit on a new device would, so the next `initMat` decides the opening view again. */
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
      /* THE SENTENCE SCRAMBLE AND THE WORD SEARCH, their lists and their state, so a journey can
         deal a known sentence or puzzle and then press through the real handlers. */
      'ss: () => SS, setSs: v => { SS = v; }, ssOrders: ssOrders_, ssRight: ssRight_,' +
      'SS_SENTENCES: SS_SENTENCES, ssDeal: ssDeal_, ssPaint: ssPaint,' +
      'ws: () => WS, setWs: v => { WS = v; }, wsBuild: wsBuild_, wsRude: wsRude_,' +
      /* THE MAZE BEING WALKED, as a getter because `New maze` replaces it — a journey asks
         whether a repaint kept the same one, which only the object itself can say. */
      'maze: () => (typeof maze !== "undefined" ? maze : null),' +
      'WS_THEMES: WS_THEMES, WS_DIRS: WS_DIRS, WS_FORWARD: WS_FORWARD, wsPaint: wsPaint,' +
      'allWidgets: typeof allWidgets === "function" ? allWidgets : null,' +
      'widgetsOf: typeof widgetsOf_ === "function" ? widgetsOf_ : null,' +
      'savedWidgets: typeof savedWidgets_ === "function" ? savedWidgets_ : null,' +
      'star: k => FAVS.add(String(k)),' +
      /* WHAT THE FIND SCREEN OFFERS AGAINST WHAT THE APP HOLDS, and the Saved column that reads the
         second. Two lists on purpose: a kind taken off Find must leave the first and stay in the
         second, or a starred thing vanishes from the one list whose job is to keep it. `doors` is
         the first question's answers as the funnel draws them. */
      'funnelItems: typeof stuffItems === "function" ? stuffItems : null,' +
      'allItems: typeof stuffItemsAll_ === "function" ? stuffItemsAll_ : null,' +
      'savedPages: typeof savedPages_ === "function" ? savedPages_ : null,' +
      /* THE ANSWER BOX'S KEY, a `const` -- so a journey can clear a stored pick it made. `w.ansKey_`
         is undefined, and the `try` round it in one journey here was clearing nothing. */
      'ansKey: typeof ansKey_ === "function" ? ansKey_ : null,' +
      'doors: () => facetValues(stuffItems(), facetList().find(f => f.field === "forLabel"))' +
      '  .map(v => String(v.show || v.value)),' +
      'facetFields: () => facetList().map(f => f.field),' +
      /* THE BASKET, AND ITS ARITHMETIC. `cartMoney_` is the one place a line's price is worked out
         — print plus the laminate upgrade — and `CART` is the list it works it out from. Exposed
         together so a journey can put a line in the basket and ask what it costs, which is the
         question somebody actually has about a basket. */
      'CART: () => CART, setCart: v => { CART = v; },' +
      'cartMoney: typeof cartMoney_ === "function" ? cartMoney_ : null,' +
      'lamPrice: typeof laminatePrice === "function" ? laminatePrice : null,' +
      'basket: typeof cartCard_ === "function" ? cartCard_ : null,' +
      'PAGE: () => PAGE,' +
      /* THE SHOP COLUMN AND THE TWO LISTS IT WAS TAKEN FROM. `shopCards` is what `screen('shop')`
         draws; `shopFunnel` is what Find offers and `shopAll` what the app holds, so a journey can
         ask that a shop thing left the first, stayed in the second, and arrived on the column. */
      'shopCards: typeof shopCards_ === "function" ? shopCards_ : null,' +
      'shopFunnel: typeof stuffItems === "function" ? stuffItems : null,' +
      'shopAll: typeof stuffItemsAll_ === "function" ? stuffItemsAll_ : null,' +
      'shopSaved: typeof savedPages_ === "function" ? savedPages_ : null,' +
      'shopDoors: () => facetValues(stuffItems(), facetList().find(f => f.field === "forLabel"))' +
      '  .map(v => String(v.show || v.value)),' +
      /* WHICH COLUMN IS IN FRONT. A `let` in the app's one scope, and jsdom's `eval` runs each call
         in a scope of its own — measured: `w.eval("AT")` is "AT is not defined" — so only a function
         built in the same evaluation can read it. The camera journey asks it to know that the load
         it is watching is the one that opens on the feed. */
      'AT: () => AT,' +
      /* FIND'S OWN STATE — the search words and the chips. A `const`, so only a function built in
         this evaluation can hand it over; the textbook journey types into `q` the way the box does. */
      'STUFF: () => STUFF,' +
      /* THE BIBLE READER'S STATE — a `const`, so a getter built here (see `STUFF`): which book is open,
         whether the index landed, which book failed. The Bible journey asks it rather than the DOM
         where the DOM cannot say, such as whether a failure changed the open book. */
      'BIBLE: () => (typeof BIBLE !== "undefined" ? BIBLE : null),' +
      /* A FACET BY ITS FIELD -- a `const` arrow, so only this evaluation can hand it over. The tag-row
         journey asks the `needs` facet's `showOf` whether the funnel says the calculator the way the
         card's tag does. */
      'facetBy: f => facetBy(f),' +
      /* THE MESSAGES COLUMN'S STATE, SEEDED AS AN ANSWER JUST ARRIVED — the same five lets
         `check/states.js` sets in a browser, and for the same reason they are set together: a seed
         that leaves `DM_LAST` alone is one poll away from being replaced by the stub's empty answer.
         Lets, so only a function built in this evaluation can write them (see `AT` above). */
      'dmSeed: (msgs, pending) => { MESSAGES = msgs; MSG_PENDING = pending || []; DM_ASKED = true;' +
      '  DM_DONE = true; MSG_FAILED = false; DM_LAST = Date.now(); },' +
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
  LAST_W = w;
  return { w, sent, errs, gets };
}

/* ---------- THE JOURNEYS -------------------------------------------------------------------------
   Each is a name and a function that returns a list of complaints. No complaints is a pass. They are
   written as questions somebody would actually ask of the app, not as assertions about internals. */
const checks = [];
/* `FLOW_ONLY=words node js/check-flow.js` runs the journeys whose names contain those words — for
   working on one; the suite always runs the lot, and says how many it ran. */
const check = (name, fn) => {
  if (!process.env.FLOW_ONLY || name.indexOf(process.env.FLOW_ONLY) !== -1) checks.push({ name, fn });
};
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
  const html = String(t.basket() || '');
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

/* ---------- EVERY COMPONENT IS PRICED AT THE SLOT IT IS DRAWN IN ----------------------------------
   THE FAULT THIS GUARDS AGAINST has happened twice in `mat.js` already and both are written up
   there: the picker costs a component from its width, the page draws it at another, and the gauge
   that decides whether the sheet fits is confidently wrong. `half` was priced at 99mm while it was
   drawn at 61; the ruler was priced at 0cm² while the bar charged 52.

   THE SHEET IS A GRID OF FIXED SLOTS NOW ("make all components of cheat sheet maker fixed in area"),
   so the check is the slot: every component has a span of 2, 4 or 6 tracks, a height that is a whole
   number of rows, and the widths come out of the same constants the stylesheet is handed. The
   hundred square and the times table were asked for bigger, by name, so they are held at two thirds
   of the page — the one number that must not quietly drop back to a third. */
check('the cheat sheet prices every component at the fixed slot it is drawn in', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matParts || !t.matColW || !t.matPairW || !t.matSpan || !t.matSpanW) {
    return ['the cheat sheet is not exported'];
  }
  const bad = [];
  const parts = t.matParts();
  /* NAMED, NOT COUNTED — these two were asked for by name, twice now. */
  ['M02', 'M03'].forEach(id => {
    const c = parts.find(x => x.id === id);
    if (!c) return;                 /* the sheet can hide a component; that is not this check's business */
    if (t.matSpan(c) !== 4) {
      bad.push(id + ' (' + c.name + ') is ' + t.matSpan(c) + ' tracks wide — it was made two thirds '
             + 'of the page (4 of 6) because it was asked for bigger');
    }
  });
  if (!parts.some(c => c.id === 'M50')) bad.push('the periodic table (M50) is not in the list');
  if (!parts.some(c => c.id === 'M51')) bad.push('the pH scale (M51) is not in the list');
  parts.filter(c => !c.edge).forEach(c => {
    const span = t.matSpan(c);
    if ([2, 4, 6].indexOf(span) === -1) bad.push(c.id + ' spans ' + span + ' tracks, not 2, 4 or 6');
    if (!(c.h > 0) || Math.abs(c.h / 2 - Math.round(c.h / 2)) > 1e-9) {
      bad.push(c.id + ' is ' + c.h + 'mm tall, which is not a whole number of 2mm rows');
    }
  });
  /* THE ARITHMETIC, not a remembered number: 184mm of text, six tracks, five 6mm gutters. */
  const track = (184 - 6 * 5) / 6;
  const want3 = 2 * track + 6, want23 = 4 * track + 18;
  if (Math.abs(t.matColW() - want3) > 0.01) {
    bad.push('a narrow block is priced at ' + t.matColW() + 'mm; two tracks and a gutter is ' + want3);
  }
  if (Math.abs(t.matPairW() - want23) > 0.01) {
    bad.push('a two-thirds block is priced at ' + t.matPairW() + 'mm; four tracks and three gutters is '
           + want23);
  }
  if (Math.abs(t.matSpanW(6) - 184) > 0.01) {
    bad.push('six tracks come to ' + t.matSpanW(6) + 'mm, not the 184mm text block');
  }
  return bad;
});

/* ---------- THE NEGATIVE NUMBER LINE, AND A PICKER LIST THAT IS NOT A SCROLLER -----------------------
   ASKED FOR AS "add minus number line" and "the cheat sheet maker should not have a scroll thing", in
   one message. The line is a drawing with one right answer — twenty-one whole numbers, −10 to 10, one
   zero picked out, the minus a real minus — so it is asserted on what `matDraw` returns rather than
   left to a screenshot. And it is offered where it was asked for: SATs and the 11+, Y9 mocks and both
   GCSE tiers.
   THE LIST HALF IS ASKED OF THE MARKUP, because jsdom has no layout to measure a scroll bar in: the
   list and everything round it must not carry `.widget-squeeze`, which is the class that made it a
   scroller inside the card (see the note over the list in `initMat`). */
check('the cheat sheet has a negative number line, and its piece list does not scroll in the card', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matParts || !t.matDraw || !t.matSet || !t.matShown) return ['the cheat sheet is not exported'];
  const bad = [];
  const c = t.matParts().find(x => x.id === 'M52');
  if (!c) return ['there is no negative number line (M52) in the cheat sheet list'];
  if (t.matSpan(c) !== 6) bad.push('the negative number line is ' + t.matSpan(c) + ' tracks wide; a line is the full width');
  const d = w.document.createElement('div');
  d.innerHTML = t.matDraw(c);
  const labels = [...d.querySelectorAll('.mat-neg b')].map(b => b.textContent);
  const want = [];
  for (let n = -10; n <= 10; n++) want.push(n < 0 ? '−' + (-n) : String(n));
  if (labels.join(' ') !== want.join(' ')) bad.push('the line reads "' + labels.join(' ') + '", wanted −10 to 10 with a real minus');
  const zeros = [...d.querySelectorAll('.mat-neg b.z')].map(b => b.textContent);
  if (zeros.join() !== '0') bad.push('the line picks out ' + JSON.stringify(zeros) + ' where it should pick out 0 alone');
  if (d.querySelectorAll('.mat-neg i.z').length !== 1) bad.push('zero has no longer tick of its own');
  if (d.querySelectorAll('.mat-neg em.l, .mat-neg em.r').length !== 2) bad.push('the line has no arrow at each end');
  [['SATs'], ['11+'], ['Y9 Mocks'], ['GCSE', 'F'], ['GCSE', 'H']].forEach(([lv, tier]) => {
    t.matSet('Maths', lv, tier);
    if (!t.matShown(c)) bad.push('the negative number line is not offered on ' + lv + (tier ? ' ' + tier : ''));
  });
  t.matSet('Maths', 'Alevel');
  if (t.matShown(c)) bad.push('the negative number line is offered at A-level, which does not ask for it');
  t.matSet('Maths', 'all');

  try { t.go('tools', false, true); } catch (e) { return bad.concat('go("tools") threw: ' + e.message); }
  const doc = w.document;
  for (let n = 0; n < 20 && !doc.getElementById('mat-list'); n++) await wait(50);
  const list = doc.getElementById('mat-list');
  if (!list) return bad.concat('the cheat sheet maker did not draw on the Tools column');
  const box = list.closest('#mat-box') || list.parentElement;
  if (list.classList.contains('widget-squeeze') || box.querySelector('.widget-squeeze')) {
    bad.push('the cheat sheet\'s piece list is a `.widget-squeeze` again, which makes it scroll inside the card');
  }
  return bad;
});

/* ---------- THE SUBJECT FILTER NARROWS THE LIST AND THE PAPER TO ONE SUBJECT ---------------------
   ASKED FOR AS *"for cheat sheet maker it should have subject as a filter too"*. The fault worth a
   rule is the one a filter always risks: a choice on the screen that the paper does not honour —
   an English sheet carrying a hundred square, or "Every subject" quietly meaning Maths. So each
   subject the select offers is set the way the select sets it and `matShown`, the one test the list
   and the sheet share, is asked of every piece. The ruler belongs to no subject and must be offered
   under all of them. And the tier split is only offered where a piece changes with it, which is the
   maths: an English "GCSE Foundation" would be a choice that changes nothing on the paper. */
check('the cheat sheet offers only the pieces of the subject chosen', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matShown || !t.matSubjects || !t.matSubjectOf || !t.matLevelChoices || !t.matSet) {
    return ['the cheat sheet subject filter is not exported'];
  }
  const bad = [];
  const parts = t.matParts();
  const subs = t.matSubjects(parts);
  ['Maths', 'English', 'Science'].forEach(s => {
    if (subs.indexOf(s) === -1) bad.push('the subject select does not offer ' + s + ' — it offers ' + subs.join(', '));
  });
  if (subs[0] !== 'Maths') bad.push('Maths has the most pieces and is not first: ' + subs.join(', '));
  subs.forEach(s => {
    t.matSet(s, 'all');
    const shown = parts.filter(c => t.matShown(c));
    const stray = shown.filter(c => !c.edge && t.matSubjectOf(c) !== s);
    if (stray.length) {
      bad.push(s + ' shows ' + stray.length + ' piece(s) of another subject — '
             + stray.slice(0, 3).map(c => c.id + ' (' + t.matSubjectOf(c) + ')').join(', '));
    }
    if (!shown.some(c => !c.edge)) bad.push(s + ' is offered in the select and shows no piece at all');
    if (parts.some(c => c.edge) && !shown.some(c => c.edge)) {
      bad.push('the ruler is not offered under ' + s + ', and it goes down the edge of any sheet');
    }
  });
  t.matSet('all', 'all');
  const every = parts.filter(c => !c.edge && t.matShown(c)).map(c => t.matSubjectOf(c));
  subs.forEach(s => { if (every.indexOf(s) === -1) bad.push('"Every subject" leaves out ' + s); });

  t.matSet('English', 'all');
  const en = t.matLevelChoices(parts).map(o => o.v);
  if (en.some(v => v.indexOf('|') !== -1)) {
    bad.push('English offers a Foundation/Higher split and no English piece changes with the tier: '
           + en.join(', '));
  }
  t.matSet('Maths', 'all');
  const ma = t.matLevelChoices(parts).map(o => o.v);
  if (ma.indexOf('GCSE|F') === -1 || ma.indexOf('GCSE|H') === -1) {
    bad.push('Maths GCSE is not offered as Foundation and Higher: ' + ma.join(', '));
  }
  t.matSet('English', 'GCSE');
  parts.filter(c => !c.edge && t.matShown(c)).forEach(c => {
    if (c.lv.indexOf('GCSE') === -1) bad.push(c.id + ' is on an English GCSE sheet and is not a GCSE piece');
  });
  /* A PIECE OFFERED IS A PIECE THAT CAN BE DRAWN. `matDraw` prints a sentence on the paper for one
     with no drawing, which is right as a last resort and wrong as the state of a whole subject. The
     ruler is not asked: it is drawn down the margin by `matRuler`, never into a slot. */
  parts.filter(c => !c.edge).forEach(c => {
    if (/mat-gone/.test(String(t.matDraw(c)))) bad.push(c.id + ' (' + c.name + ') has nothing to draw it');
  });
  t.matSet('Maths', 'all');
  return bad;
});

/* ---------- THE PIECES A TOPIC AT A TIME, AND NO VIEW LONGER THAN EIGHT ROWS ----------------------
   ASKED FOR AS *"the cheat sheet maker shouldnt be as long as it is. you need to think a way to make
   it fit on screen without scrolling"*. The fit itself is measured in a browser by `check/states.js`;
   what jsdom can hold is the COUNT that makes the fit possible, at every subject × level × topic:
   eight rows, ruler included, is the most a 320x568 pane takes at 0.85 signed in (see `MAT_GROUPS`). A piece
   added to a group that is already full fails here, by name, before anybody draws it. And every
   piece is FILED — one that falls through to `Other` is a piece nobody added to the table.
   THEN THE PROMISE THAT MAKES GROUPS BEARABLE: a tick in one topic is still a tick when you are
   looking at another, it is on the paper either way, and the topic's own option says it is there. */
check('the cheat sheet lists a topic at a time, eight rows at most, and keeps ticks across topics', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matGroupOf || !t.matGroupChoices || !t.matInGroup || !t.matGroup) return ['the cheat sheet topic groups are not exported'];
  const bad = [];
  const parts = t.matParts();
  parts.filter(c => !c.edge && t.matGroupOf(c) === 'Other')
    .forEach(c => bad.push(c.id + ' (' + c.name + ') is in no topic group — add it to MAT_GROUPS'));
  const subs = t.matSubjects(parts).concat('all');
  let views = 0;
  subs.forEach(s => {
    t.matSet(s, 'all');
    t.matLevelChoices(parts).forEach(o => {
      const [l, tier] = o.v.split('|');
      t.matSet(s, l, tier);
      t.matGroupChoices(parts).forEach(g => {
        t.matGroup(g);
        views++;
        const rows = parts.filter(c => t.matShown(c) && t.matInGroup(c)).length;
        if (rows > 8) bad.push(s + ' · ' + o.say + ' · ' + g + ' lists ' + rows + ' rows; eight is what fits a 320x568 phone at 0.85');
        if (!parts.some(c => !c.edge && t.matShown(c) && t.matInGroup(c))) bad.push(s + ' · ' + o.say + ' offers ' + g + ' and lists nothing in it');
      });
    });
  });
  if (views < 50) bad.push('only ' + views + ' views were walked — the subject or level lists came back short');
  t.matSet('Maths', 'all');

  try { t.go('tools', false, true); } catch (e) { return bad.concat('go("tools") threw: ' + e.message); }
  const doc = w.document;
  for (let n = 0; n < 20 && !doc.getElementById('mat-group'); n++) await wait(50);
  const grp = doc.getElementById('mat-group');
  if (!grp) return bad.concat('the cheat sheet maker draws no topic select');
  const pick = g => { grp.value = g; t.ACTIONS['mat-group'](grp); };
  const tickFirst = () => {
    const box = doc.querySelector('#mat-list label:not(.off):not([data-id="M01"]) input:not(:checked)');
    if (!box) return '';
    box.checked = true; t.ACTIONS['mat-tick'](box);
    return box.getAttribute('data-id');
  };
  t.matOn([]); t.matPaint();
  pick('Number');
  const a = tickFirst();
  pick('Algebra');
  const b = tickFirst();
  if (!a || !b) return bad.concat('could not tick a piece in Number and one in Algebra');
  const on = t.matOn();
  if (on.indexOf(a) === -1 || on.indexOf(b) === -1) bad.push('changing topic dropped a tick: ' + JSON.stringify(on) + ', wanted ' + a + ' and ' + b);
  const label = [...grp.options].find(o => o.value === 'Number');
  if (!label || !/1✓/.test(label.textContent)) bad.push('the Number option reads "' + (label && label.textContent) + '" — it should say 1✓ while Algebra is showing');
  if (doc.querySelector('#mat-list label[data-id="' + a + '"]:not(.off)')) bad.push(a + ' is still listed under Algebra');
  const said = String((doc.getElementById('mat-said') || {}).textContent || '');
  if (!/2 pieces/.test(said)) bad.push('the gauge says "' + said + '" — both ticks are on the paper whichever topic is showing');
  t.matOn([]); t.matPaint();
  return bad;
});

/* ---------- A STUDENT OPENS ON THEIR OWN LEVEL --------------------------------------------------------
   THE AUDIT'S DEFAULT, TAKEN: *"Open on the student's own level when known."* Nothing on a person says
   their level, so it is read off the sessions they are the client of — this payload's first is GCSE
   Maths for Rasa Poliksa. A stranger knows nothing and opens on Every level, as before. */
check('the cheat sheet opens on the signed-in student\'s own level, and on every level for a stranger', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matFresh || !t.matNow) return ['the cheat sheet opening state is not exported'];
  const bad = [];
  const open = async () => {
    t.matFresh();
    /* `repaint`, NOT `paint`: `go` starts a column's widgets after its 300ms slide and `repaint`
       starts them at once, and `initMat` — where the opening view is decided — is a widget start. */
    try { t.go('tools', false, true); t.repaint(); } catch (e) { bad.push('drawing tools threw: ' + e.message); }
    await wait(100);
    return t.matNow();
  };
  t.USER(null);
  let now = await open();
  if (now.level !== 'all') bad.push('a stranger opens on ' + now.level + ' — nobody is known, so it should be Every level');
  t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  now = await open();
  if (now.level !== 'GCSE' || now.subject !== 'Maths') {
    bad.push('Rasa is booked into GCSE Maths and the cheat sheet opened on ' + now.subject + ' · ' + now.level);
  }
  t.USER(null);
  t.matFresh();
  return bad;
});

/* ---------- A CHEAT SHEET INTO THE BASKET, LAMINATED, AND THE ORDER NAMES ITS PIECES -----------------
   ASKED FOR AS *"add an upgrade to lamination for cheat sheet orders that are added to cart."* The
   sheet goes in as a one-page `print` line, which is what gives it the laminate switch; the rate is
   this payload's 0.35 a page with a 0.50 minimum, standing in for the Ledger's `laminate_rate_per_page`
   (the owner's £1.00 once typed). What must hold: the line says what it is, pressing twice is one
   line, laminating it puts the price on the line, and the message to the owner lists every piece —
   the only way the owner can print the sheet somebody built is to rebuild it from that list. And
   signed out it goes nowhere and says why, as every other basket door does. */
check('a cheat sheet goes into the basket, laminates, and the order names its pieces', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matFresh || !t.orderText || !t.CART || !t.cartMoney) return ['the cheat sheet basket door is not exported'];
  const bad = [];
  const doc = w.document;
  t.setCart([]);
  t.matFresh();
  try { t.go('tools', false, true); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  for (let n = 0; n < 20 && !doc.querySelector('[data-do="mat-cart"]'); n++) await wait(50);
  const trolley = doc.querySelector('#mat-box [data-do="mat-cart"]');
  if (!trolley) return ['there is no basket tile beside Print the sheet'];
  t.matSet('Maths', 'GCSE', 'H');
  t.matOn(['M01', 'M17', 'M26']);
  t.matPaint();

  t.USER(null);
  t.ACTIONS['mat-cart'](trolley);
  if (t.CART().length) bad.push('signed out, the sheet still went into the basket');
  const toastEl = doc.getElementById('toast');
  if (!/sign in/i.test(String(toastEl ? toastEl.textContent : ''))) bad.push('signed out, the toast does not say to sign in');

  t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  t.ACTIONS['mat-cart'](trolley);
  t.ACTIONS['mat-cart'](trolley);
  const cart = t.CART();
  if (cart.length !== 1) return bad.concat('two presses made ' + cart.length + ' basket lines, not one');
  const line = cart[0];
  if (line.kind !== 'print' || line.pages !== 1) bad.push('the sheet went in as ' + line.kind + ' with ' + line.pages + ' pages — it is one printed page');
  if (!/Maths/.test(line.name) || !/GCSE Higher/.test(line.name) || !/2 pieces/.test(line.name)) {
    bad.push('the line is called "' + line.name + '" — it should say Maths, GCSE Higher and 2 pieces');
  }
  ['Ruler down the edge', 'Straight line', 'Quadratics'].forEach(p => {
    if ((line.parts || []).indexOf(p) === -1) bad.push('the line does not carry "' + p + '" in its pieces: ' + JSON.stringify(line.parts));
  });

  /* THE SWITCH IS THE BASKET'S OWN, drawn on the Tools column's basket card. */
  for (let n = 0; n < 10 && !doc.querySelector('.cart-box [data-do="cart-laminate"]'); n++) await wait(50);
  const lam = doc.querySelector('.cart-box [data-do="cart-laminate"]');
  if (!lam) return bad.concat('the cheat sheet line in the basket has no laminate switch');
  const plain = t.cartMoney(line);
  t.ACTIONS['cart-laminate'](lam);
  if (!t.CART()[0].laminate) bad.push('pressing + laminate did not laminate the sheet');
  const want = Math.round((plain + t.lamPrice(1)) * 100) / 100;
  if (Math.round(t.cartMoney(t.CART()[0]) * 100) / 100 !== want) {
    bad.push('laminated, the sheet costs ' + t.cartMoney(t.CART()[0]) + ' and print ' + plain + ' + laminate ' + t.lamPrice(1) + ' is ' + want);
  }
  const text = String(t.orderText() || '');
  ['Ruler down the edge', 'Straight line', 'Quadratics'].forEach(p => {
    if (text.indexOf(p) === -1) bad.push('the order message does not name "' + p + '" — the owner cannot rebuild the sheet');
  });
  if (!/laminated/.test(text)) bad.push('the order message does not say the sheet is laminated');
  if (/1 pages/.test(text)) bad.push('the order message says "1 pages"');
  t.setCart([]);
  t.USER(null);
  t.matFresh();
  return bad;
});

/* ---------- PRACTICE PAPER: A HANDWRITING SHEET, LINED, AND SQUARED ------------------------------------
   ASKED FOR AS *"allow cheat sheet maker to make a handwriting worksheet. or lined or grid paper."*
   Pressed through the real selects and the real text box, and asked of the sheet the printer would
   be handed (`MAT_SHEET`), because every fault worth catching is on the paper and not on the card:
     · the four-line ruling is four lines — ascender, dashed x-height, baseline, descender — per row,
       and every one of them inside the drawing, so nothing runs under the footer;
     · the words are on the TRACE rows, in turn with the practice rows, and every word typed is on
       the page — a wrap that dropped the last word would print a sentence without its end;
     · squared paper is whole squares at the size chosen; lined paper is the spacing chosen;
     · a value the select does not offer is refused, so a stored 7mm cannot draw;
     · no colour is written on the paper as a literal — the sheet's tokens only;
     · it is one basket line with the laminate switch, named so the owner can tell it from the rest,
       and it prints through the cheat sheet's own print path. */
check('the cheat sheet maker draws a handwriting sheet, lined and squared paper, and prints them', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matFresh || !t.matBlank || !t.matSheet || !t.CART) return ['the practice paper is not exported'];
  const bad = [];
  const doc = w.document;
  t.setCart([]);
  t.matFresh();
  try { t.go('tools', false, true); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  for (let n = 0; n < 20 && !doc.getElementById('mat-subject'); n++) await wait(50);
  /* THE KINDS ARE A "Practice paper" GROUP IN THE SUBJECT SELECT — a select of their own was the 44px
     the card did not have at 320x568 (see `initMat`). */
  const kind = doc.getElementById('mat-subject');
  if (!kind) return ['the cheat sheet maker has no subject select'];
  const kinds = [...kind.querySelectorAll('optgroup option')].map(o => o.value).join(',');
  if (kinds !== 'paper:hand,paper:lined,paper:grid') bad.push('the subject select offers the paper kinds ' + kinds + ', not handwriting, lined and squared');
  if (kind.closest('[hidden]')) bad.push('the subject select is hidden, so the paper kinds cannot be reached');

  const press = (el, v) => { el.value = v; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const svgOf = () => { const d = doc.createElement('div'); d.innerHTML = t.matSheet(); return d; };
  /* THE SEGMENTS OF ONE PATH, as [x0, y0, x1, y1] — `M x y H x` and `M x y V y` are all it writes. */
  const segs = (d, cls) => {
    const p = d.querySelector('path.' + cls);
    if (!p) return [];
    return [...p.getAttribute('d').matchAll(/M(-?[\d.]+) (-?[\d.]+)([HV])(-?[\d.]+)/g)].map(m =>
      m[3] === 'H' ? [+m[1], +m[2], +m[4], +m[2]] : [+m[1], +m[2], +m[1], +m[4]]);
  };
  const inside = (d, name) => {
    const vb = (d.querySelector('svg.mat-ruling') || { getAttribute: () => '' }).getAttribute('viewBox') || '';
    const [, , W, H] = vb.split(/\s+/).map(Number);
    if (!W || !H) { bad.push(name + ': the ruling has no viewBox in millimetres'); return; }
    /* 260mm IS THE ROOM MEASURED IN CHROME between the name row and the footer (see `MAT_BLANK_H`);
       a taller drawing pushes the footer off the bottom of the A4 page. */
    if (H > 260 || W > 184) bad.push(name + ': the ruling is ' + W + ' x ' + H + 'mm — more than the 184 x 260mm the page has room for');
    d.querySelectorAll('svg.mat-ruling path').forEach(p => {
      const nums = (p.getAttribute('d').match(/-?[\d.]+/g) || []).map(Number);
      if (nums.some(v => v < -0.01) || nums.some(v => v > Math.max(W, H) + 0.01)) bad.push(name + ': a line is drawn outside the page');
    });
    const ys = [];
    d.querySelectorAll('svg.mat-ruling path').forEach(p => [...p.getAttribute('d').matchAll(/M[\d.]+ ([\d.]+)H/g)].forEach(m => ys.push(+m[1])));
    if (ys.some(y => y > H + 0.01)) bad.push(name + ': a line sits ' + Math.max(...ys) + 'mm down a ' + H + 'mm drawing — under the footer');
    if (/(fill|stroke)="#|style="[^"]*#[0-9a-f]{3}/i.test(d.innerHTML)) bad.push(name + ': a colour is written on the paper as a literal');
  };

  /* ---- HANDWRITING ---- */
  press(kind, 'paper:hand');
  if (t.matBlank().kind !== 'hand') return bad.concat('choosing Handwriting did not change the sheet');
  if (!doc.getElementById('mat-cheat').hidden) bad.push('the cheat sheet\'s pieces are still showing under Handwriting');
  if (!doc.getElementById('mat-level').closest('[hidden]')) bad.push('the level select is still showing under Handwriting');
  if (doc.getElementById('mat-blank').hidden) bad.push('the handwriting questions are hidden under Handwriting');
  const shown = [...doc.querySelectorAll('#mat-blank [data-for]')].filter(e => !e.hidden).map(e => e.getAttribute('data-for'));
  if (shown.some(f => f !== 'hand') || !shown.length) bad.push('under Handwriting the card shows the questions for ' + JSON.stringify(shown));
  const box = doc.getElementById('mat-text');
  const words = 'Sam can hop and skip to the big red bus stop';
  box.value = words;
  box.dispatchEvent(new w.Event('input', { bubbles: true }));
  await wait(320);
  let d = svgOf();
  if (!d.querySelector('.mat-sheet.is-hand')) return bad.concat('the printed sheet is not the handwriting sheet');
  const top = segs(d, 'mat-ln'), mid = segs(d, 'mat-ln-mid'), base = segs(d, 'mat-ln-base');
  const rows = base.length;
  if (!rows) return bad.concat('the handwriting sheet has no baselines');
  if (mid.length !== rows || top.length !== 2 * rows) {
    bad.push('the ruling is ' + top.length + ' faint, ' + mid.length + ' dashed and ' + rows + ' baselines — four lines a row is 2:1:1');
  }
  const b = +t.matBlank().size;
  base.forEach((s, i) => {
    if (Math.abs(s[1] - mid[i][1] - b) > 0.01) bad.push('row ' + (i + 1) + ': the x-height band is ' + (s[1] - mid[i][1]) + 'mm, not ' + b);
  });
  inside(d, 'handwriting');
  const traced = [...d.querySelectorAll('text.mat-trace')];
  const onPage = traced.map(x => x.textContent).join(' ');
  words.split(' ').forEach(x => { if (onPage.split(' ').indexOf(x) === -1) bad.push('"' + x + '" was typed and is not on the sheet'); });
  /* ONE PRACTICE ROW EACH: the trace rows are every other ruling, starting with the first. */
  const baseYs = base.map(s => s[1]);
  traced.forEach(x => {
    const r = baseYs.findIndex(y => Math.abs(y - +x.getAttribute('y')) < 0.01);
    if (r === -1) bad.push('the words "' + x.textContent + '" do not sit on a baseline');
    else if (r % 2) bad.push('the words "' + x.textContent + '" are on ruling ' + (r + 1) + ', a practice row');
  });
  if (traced.length !== Math.ceil(rows / 2)) bad.push(traced.length + ' trace rows on ' + rows + ' rulings with one practice row each — the words should come round again');
  const gap = doc.querySelector('#mat-blank select[data-k="gap"]');
  press(gap, '2');
  if (svgOf().querySelectorAll('text.mat-trace').length !== Math.ceil(rows / 3)) bad.push('two practice rows each did not leave two empty rulings after each traced one');
  press(gap, '1');
  /* A SIZE THE SELECT DOES NOT OFFER IS REFUSED — the one door every setting comes in by. */
  const size = doc.querySelector('#mat-blank select[data-k="size"]');
  const fake = doc.createElement('select');
  fake.setAttribute('data-k', 'size'); fake.innerHTML = '<option value="7">7</option>'; fake.value = '7';
  t.ACTIONS['mat-blank'](fake);
  if (t.matBlank().size === '7') bad.push('a 7mm writing size went in although nothing offers it');
  press(size, '4');
  if (segs(svgOf(), 'mat-ln-base').length <= rows) bad.push('Small writing did not fit more rulings than Large');

  /* ---- BASKET AND PRINT ---- */
  t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const trolley = doc.querySelector('#mat-box [data-do="mat-cart"]');
  if (!trolley) bad.push('there is no basket tile for the handwriting sheet');
  else {
    t.ACTIONS['mat-cart'](trolley);
    const line = t.CART()[0];
    if (!line) bad.push('the handwriting sheet did not go into the basket');
    else {
      if (line.kind !== 'print' || line.pages !== 1) bad.push('the handwriting sheet went in as ' + line.kind + ' with ' + line.pages + ' pages');
      if (!/Handwriting/.test(line.name)) bad.push('the basket line is called "' + line.name + '" — it does not say handwriting');
      if (!(line.parts || []).some(p => p.indexOf(words) !== -1)) bad.push('the basket line does not carry the words, so the owner cannot print the same sheet');
      for (let n = 0; n < 10 && !doc.querySelector('.cart-box [data-do="cart-laminate"]'); n++) await wait(50);
      if (!doc.querySelector('.cart-box [data-do="cart-laminate"]')) bad.push('the handwriting sheet in the basket has no laminate switch');
    }
  }
  t.setCart([]);
  t.USER(null);
  w.print = () => {};
  t.ACTIONS['mat-print']();
  if (!doc.querySelector('.mat-paper .mat-sheet.is-hand')) bad.push('Print did not put the handwriting sheet on the paper');
  doc.querySelectorAll('.mat-paper').forEach(p => p.remove());
  doc.body.classList.remove('printing-mat');

  /* ---- LINED ---- */
  press(kind, 'paper:lined');
  press(doc.querySelector('#mat-blank select[data-k="line"]'), '10');
  d = svgOf();
  const lines = segs(d, 'mat-ln').filter(s => s[1] === s[3]);
  const steps = new Set(lines.slice(1).map((s, i) => +(s[1] - lines[i][1]).toFixed(2)));
  if (!lines.length || steps.size !== 1 || !steps.has(10)) bad.push('10mm lined paper is spaced ' + JSON.stringify([...steps]));
  if (!d.querySelector('path.mat-ln-margin')) bad.push('lined paper has no margin');
  inside(d, 'lined');

  /* ---- SQUARED ---- */
  press(kind, 'paper:grid');
  press(doc.querySelector('#mat-blank select[data-k="grid"]'), '10');
  d = svgOf();
  const g = segs(d, 'mat-ln-grid');
  const vx = g.filter(s => s[0] === s[2]).map(s => s[0]), hy = g.filter(s => s[1] === s[3]).map(s => s[1]);
  const even = xs => new Set(xs.slice(1).map((x, i) => +(x - xs[i]).toFixed(2)));
  if (!vx.length || !hy.length) bad.push('squared paper has no lines');
  else {
    if ([...even(vx)].join() !== '10' || [...even(hy)].join() !== '10') bad.push('1cm squared paper is spaced ' + JSON.stringify([...even(vx), ...even(hy)]));
    const left = vx[0], right = 184 - vx[vx.length - 1];
    if (Math.abs(left - right) > 0.01) bad.push('the grid is ' + left + 'mm from the left and ' + right + 'mm from the right — not centred');
  }
  inside(d, 'squared');

  /* ---- A SUBJECT TAKES IT BACK TO THE CHEAT SHEET ---- */
  press(kind, 'Maths');
  if (t.matBlank().kind !== 'cheat' || doc.getElementById('mat-cheat').hidden) bad.push('choosing Maths after squared paper did not bring the cheat sheet back');
  press(kind, 'paper:grid');

  /* ---- REMEMBERED, AND A KIND FROM SOMEWHERE ELSE IS THE CHEAT SHEET ---- */
  const kept = JSON.parse(w.localStorage.getItem('matChoice') || '{}');
  if (kept.k !== 'grid' || !kept.p || kept.p.grid !== '10') bad.push('the paper choice is not remembered on this device: ' + JSON.stringify({ k: kept.k, p: kept.p }));
  w.localStorage.setItem('matChoice', JSON.stringify(Object.assign(kept, { k: 'origami', p: { grid: '3', line: 'x' } })));
  t.matFresh();
  w.localStorage.setItem('matChoice', JSON.stringify(Object.assign(kept, { k: 'origami', p: { grid: '3', line: 'x' } })));
  t.matRecall();
  if (t.matBlank().kind !== 'cheat') bad.push('a stored sheet type nobody offers opened as "' + t.matBlank().kind + '", not the cheat sheet');
  if (t.matBlank().grid !== '5') bad.push('a stored 3mm square went in although nothing offers it');

  /* ---- AND THE PAPER'S RULES SAY THEIR COLOURS AS TOKENS ---- */
  const css = fs.readFileSync(path.join(dir, '..', 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const mine = [...css.matchAll(/(\.mat-(?:ln[\w-]*|trace|name[\w ]*|ruling)[^{]*)\{([^}]*)\}/g)];
  if (!mine.length) bad.push('style.css has no rules for the rulings');
  mine.forEach(m => { if (/#[0-9a-f]{3,8}\b|rgb\(/i.test(m[2])) bad.push(m[1].trim() + ' writes a colour as a literal'); });
  t.matFresh();
  return bad;
});

/* ---------- A PENCE PRICE IS MONEY, AND A SHOP LINE IS ONE LINE --------------------------------------
   ASKED FOR AS *"refine basket to look nicer."*, and the first thing wrong with the basket's look was
   not a margin: a 30p pencil read "30 cr" and a £14 calculator "1400 cr", because `cart-add` wrote
   every shop price into the credits field whatever `unit` `doGet` sent with it — and the Send button
   then asked a student for 1,425 credits. So a pence row goes in as money, a credits row as credits,
   and a line saved the old way is re-read from the shop row when the basket is drawn.
   Then the shape: a shop line has no switch, so it has no strip — its ✕ is on the name's line — and
   the head says what the credits come to in one short line. */
check('a pence-priced shop item goes in the basket as money, on one line', async () => {
  const p = payload();
  p.shop = [{ name: 'Pencil', price: '30', unit: 'p', acquire: 'buy', audience: 'all', inStock: true },
            { name: 'Sticker sheet', price: '3', unit: '✓ ', acquire: 'ticks', audience: 'all', inStock: true }];
  const { w } = boot({ payload: p });
  await wait(300);
  const t = w.__t;
  if (!t.CART || !t.setCart || !t.basket || !t.cartMoney) return ['the basket is not exported'];
  const bad = [];
  t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  t.setCart([]);
  const add = key => {
    const el = w.document.createElement('button');
    el.dataset.key = key; el.dataset.kind = 'shop';
    t.ACTIONS['cart-add'](el);
  };
  add('Pencil'); add('Sticker sheet');
  const pencil = t.CART().find(c => c.key === 'Pencil');
  if (!pencil) return ['the pencil did not go into the basket'];
  if (pencil.cost !== 0 || pencil.money !== 0.3) bad.push('a 30p pencil went in as cost ' + pencil.cost + ', money ' + pencil.money + ' — it is £0.30, not 30 credits');
  const stick = t.CART().find(c => c.key === 'Sticker sheet');
  if (!stick || stick.cost !== 3) bad.push('a 3-tick sticker sheet lost its price: ' + JSON.stringify(stick));
  /* A LINE SAVED BEFORE THIS — `cost: 30` for the pencil — comes back as money when drawn. */
  t.setCart([{ key: 'Pencil', name: 'Pencil', kind: 'shop', cost: 30, money: 0 }]);
  const html = String(t.basket() || '');
  if (t.CART()[0].money !== 0.3 || t.CART()[0].cost !== 0) bad.push('a pencil saved as 30 credits is still ' + JSON.stringify(t.CART()[0]) + ' after the basket was drawn');
  if (/30 cr/.test(html)) bad.push('the basket still draws the pencil as "30 cr"');
  if (!/£0\.30/.test(html)) bad.push('the basket does not draw the pencil at £0.30');
  const d = w.document.createElement('div');
  d.innerHTML = html;
  const row = [...d.querySelectorAll('.bk-row.is-wide')].find(r => /Pencil/.test(r.textContent));
  if (!row) return bad.concat('no basket row for the pencil');
  if (!row.querySelector('.cart-ln [data-do="cart-drop"]')) bad.push('the pencil\'s ✕ is not on its name line');
  if (row.querySelector('.cart-ctl')) bad.push('the pencil draws a control strip with nothing to hold but its ✕');
  if (!row.querySelector('.cart-lead')) bad.push('the pencil has no leader to its price');
  t.setCart([{ key: 'Sticker sheet', name: 'Sticker sheet', kind: 'shop', cost: 3, money: 0 },
             { key: 'P-X', kind: 'print', name: 'Paper', pages: 0, cost: 0 }]);
  const head = (() => { const e = w.document.createElement('div'); e.innerHTML = String(t.basket() || '');
    const h = e.querySelector('.rc-head p'); return h ? h.textContent.trim() : ''; })();
  if (head.length > 30) bad.push('the basket head reads "' + head + '" — ' + head.length + ' characters, which wraps at 390');
  t.setCart([]);
  return bad;
});

/* ---------- SETTINGS SAVE AGAINST A SERVER OLDER THAN THE SITE ------------------------------------
   REPORTED FROM THE LIVE SITE: "the account settings stuff isnt saving. its saying action not
   recognised". The site was published and the Apps Script was not, so every Save asked the server
   for `myProfile`, got "That action is not recognised", and stopped. This plays that server — it
   refuses `myProfile` and answers everything else — with a copy of your details in the OLD shape
   (no `phone_cc`), and asks two things: a card of plain fields still posts `updateProfile`, and a
   card holding a packed field does not, saying the backend needs updating instead of the server's
   raw sentence. The second half is the guard's whole reason: that card's boxes can be empty, and
   posting them would write blanks over the sheet. */
check('a settings save still works against a server older than the site', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'myProfile'
    ? { error: 'That action is not recognised.' } : { success: true, changed: 1 } });
  await wait(300);
  const t = w.__t;
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk',
           profile: { first_name: 'Test', last_name: 'Admin', photo: '', phone: '07700900000' } });
  try { t.go('settings', false, true); w.paint('settings'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const d = w.document;
  const cardWith = f => [...d.querySelectorAll('#s-settings .me-form')]
    .find(form => form.querySelector('[data-me="' + f + '"]'));
  const plain = cardWith('first_name'), packed = cardWith('phone_no') || cardWith('dob_d');
  if (!plain || !packed) return ['the settings column has no About you card or no Contact card to press'];
  const bad = [];
  const press = form => t.ACTIONS['me-save'](form.querySelector('[data-do="me-save"]'));
  sent.length = 0;
  press(plain);
  await wait(300);
  if (!sent.some(b => b.action === 'updateProfile')) {
    bad.push('the About you card posted ' + JSON.stringify(sent.map(b => b.action))
             + ' and no updateProfile — an older server stops every save');
  }
  sent.length = 0;
  press(packed);
  await wait(300);
  if (sent.some(b => b.action === 'updateProfile')) {
    bad.push('the Contact card posted its empty packed boxes to an older server, which would write blanks over the sheet');
  }
  const said = String((packed.querySelector('.me-said') || {}).textContent || '');
  if (!/older than this site/i.test(said)) bad.push('the Contact card says "' + said + '" rather than that the backend needs updating');
  const toastEl = d.getElementById('toast');
  if (/not recognised/i.test(String(toastEl ? toastEl.textContent : ''))) bad.push('the raw "not recognised" sentence is still toasted');
  return bad;
});

/* ---------- THE QUALIFICATIONS CARD: ONE LINE A QUALIFICATION, EDITED IN PLACE, SAVED AS YOU GO ----------
   ASKED FOR AS *"can you make the qualifications widget more efficient, elegant, intuitive and take up
   less space"*. The card is a line per qualification in the profile chip's notation, a line opens its
   editor under itself, every answer chosen is saved, and one `+` adds. What none of that may lose is
   the data underneath — so these drive the page's own handlers and read the seven `data-me` boxes of
   each slot and the fields each save POSTS, which are what `qualsIn` rebuilds the rows from.

   ONE TUTOR FOR ALL FOUR: Maths and Physics at GCSE and A-Level, English Literature at GCSE, a degree
   still being studied, and an Enhanced DBS — the shelf a real tutor has, plus the two shapes the
   notation draws differently. Seven records, so three slots are left in the pool. */
const QUAL_TUTOR = {
  qual_1: 'Maths', qual_1_level: 'GCSE', qual_1_grade: '9', qual_1_board: 'Hill Top School', qual_1_received: '2016', qual_1_teach: 'TRUE', qual_1_spec: 'TRUE',
  qual_2: 'Maths', qual_2_level: 'A-Level', qual_2_grade: 'A*', qual_2_board: 'Hill Top Sixth Form', qual_2_received: '2018', qual_2_teach: 'TRUE', qual_2_spec: 'TRUE',
  qual_3: 'Physics', qual_3_level: 'GCSE', qual_3_grade: '8', qual_3_received: '2016', qual_3_teach: 'TRUE', qual_3_spec: 'FALSE',
  qual_4: 'Physics', qual_4_level: 'A-Level', qual_4_grade: 'A', qual_4_board: 'Hill Top Sixth Form', qual_4_received: '2018', qual_4_teach: 'TRUE', qual_4_spec: 'FALSE',
  qual_5: 'English Literature', qual_5_level: 'GCSE', qual_5_grade: '7', qual_5_received: '2016',
  qual_6: 'Bible and Theology', qual_6_level: "Bachelor's degree", qual_6_received: 'Present',
  qual_7: 'DBS', qual_7_level: 'Enhanced', qual_7_received: '2025',
};
async function qualCard_(profile) {
  const quals = [];
  for (let i = 1; i <= 10; i++) ['', '_level', '_board', '_grade', '_received', '_teach', '_spec'].forEach(k => quals.push('qual_' + i + k));
  const b = boot({ payload: Object.assign(payload(), { profileFields: { Qualifications: quals } }),
                   reply: { success: true, changed: 1 } });
  await wait(300);
  b.w.__t.USER({ name: 'Ada Tutor', personId: 'P002', role: 'tutor', roles: ['tutor'], token: 'tk',
                 profile: Object.assign({ first_name: 'Ada', last_name: 'Tutor', phone_cc: '+44' }, profile || QUAL_TUTOR) });
  b.w.__t.go('settings', false, true); b.w.paint('settings');
  await wait(300);
  const d = b.w.document;
  const q = {
    b, w: b.w, d, sent: b.sent,
    A: (act, el) => b.w.__t.ACTIONS[act](el),
    shelf: () => d.querySelector('#s-settings .q-shelf'),
    slot: i => q.shelf() && q.shelf().querySelector('.q-slot[data-slot="' + i + '"]'),
    box: (i, k) => (q.slot(i) || d).querySelector('[data-me="qual_' + i + k + '"]') || {},
    line: i => q.slot(i) && q.slot(i).querySelector(':scope > .q-line'),
    seg: (i, v) => q.slot(i).querySelector('[data-do="qual-teach"][data-v="' + v + '"]'),
    /* A PICK FROM A LIST, the way `sel-pick` makes one: the value, then `input` and `change`. */
    pick: (el, v) => { el.value = v; el.dispatchEvent(new b.w.Event('input', { bubbles: true }));
                       el.dispatchEvent(new b.w.Event('change', { bubbles: true })); },
    posts: () => b.sent.filter(x => x.action === 'updateProfile'),
    last: () => { const p = q.posts(); return (p[p.length - 1] || {}).fields || null; },
    said: () => String((d.getElementById('toast') || {}).textContent || ''),
  };
  return q;
}
check('the qualifications card reads one line a qualification, written as the profile chip writes it', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  const shelf = q.shelf();
  if (!shelf) return ['there is no qualifications card on the settings column'];
  if (q.d.querySelectorAll('#s-settings [data-me^="qual_"]').length !== 70) bad.push('the form does not hold all seventy qual_ boxes');
  const lines = [...shelf.querySelectorAll('.q-list .q-line')];
  if (lines.length !== 7) bad.push('seven qualifications drew ' + lines.length + ' lines, not one each');
  /* THE SUBJECT ONCE, AT THE HEAD OF ITS OWN LINES. */
  const named = lines.map(l => l.querySelector('.q-who').textContent.trim()).filter(Boolean);
  const want = ['Maths', 'Physics', 'English Literature', 'Bible and Theology', 'DBS'];
  if (JSON.stringify(named) !== JSON.stringify(want)) bad.push('the subjects named on the lines are ' + JSON.stringify(named) + ', not each once in order');
  if (!q.line(2) || q.line(2).querySelector('.q-who').textContent.trim()) bad.push('Maths A-Level repeats its subject');
  /* THE LEVEL RAISED OVER THE GRADE, in the profile chip's own `.prof-iso`. */
  const iso = i => { const s = q.line(i) && q.line(i).querySelector('.prof-iso');
    return s ? [...s.children].map(c => c.tagName + ':' + c.innerHTML).join(' ') : 'plain'; };
  if (iso(1) !== 'SUP:GCSE SUB:9') bad.push('Maths GCSE 9 is drawn as ' + iso(1) + ', not the level raised over the grade');
  if (iso(2) !== 'SUP:A-Level SUB:A*') bad.push('Maths A-Level A* is drawn as ' + iso(2));
  if (iso(6) !== "SUP:Bachelor's degree SUB:<i>studying</i>") bad.push('a degree still being studied is drawn as ' + iso(6) + ', not "studying" in the grade\'s place');
  /* A CERTIFICATE IS WRITTEN PLAIN, as on the card. */
  if (iso(7) !== 'plain' || (q.line(7).querySelector('.q-plain') || {}).textContent !== 'Enhanced') bad.push('the Enhanced DBS is drawn as notation rather than plain');
  /* TEACH AS THE GOLD CHIP, CAN TEACH AS A WORD, NOTHING FOR NOT TEACHING. */
  const mark = i => { const m = q.line(i).querySelector('.q-mark'); return m.querySelector('.q-chip') ? 'chip' : m.textContent.trim(); };
  const marks = [1, 2, 3, 4, 5].map(mark);
  if (JSON.stringify(marks) !== JSON.stringify(['chip', 'chip', 'Can teach', 'Can teach', ''])) bad.push('the teaching marks read ' + JSON.stringify(marks));
  /* WHAT THE FACE LEAVES OFF IS IN THE LINE'S NAME. */
  const name = q.line(1).getAttribute('aria-label') || '';
  if (!/Hill Top School/.test(name) || !/2016/.test(name) || !/teach/.test(name)) bad.push('the Maths GCSE line is named "' + name + '", without its school, year and teaching');
  /* NOTHING TO PRESS BUT THE LINES AND THE `+`, and nothing open. */
  const acts = [...new Set([...shelf.querySelectorAll('[data-do]')].filter(b => !b.closest('.q-ed, .q-pool')).map(b => b.dataset.do))].sort();
  if (JSON.stringify(acts) !== JSON.stringify(['qual-add', 'qual-open'])) bad.push('the read card offers ' + JSON.stringify(acts) + ', not the lines and one +');
  const add = shelf.querySelector('[data-do="qual-add"]');
  if (!add || !add.classList.contains('tile') || add.disabled) bad.push('the + is not a live tile');
  if (shelf.querySelector('.is-open') || shelf.querySelector('input[type="checkbox"]')) bad.push('the card arrived with a line open, or with a checkbox on it');
  return bad;
});
check('a qualification opens in place, and each answer is saved as it is chosen', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  if (!q.slot(4) || !q.slot(5)) return ['the card has no Physics A-Level or English GCSE to work on'];
  /* ONE TAP OPENS IT, and only it. */
  q.A('qual-open', q.line(5));
  q.A('qual-open', q.line(4));
  const open = [...q.shelf().querySelectorAll('.q-slot.is-open')].map(s => s.dataset.slot);
  if (JSON.stringify(open) !== '["4"]') bad.push('opening Physics A-Level after English left ' + JSON.stringify(open) + ' open');
  if (q.line(4).getAttribute('aria-expanded') !== 'true') bad.push('the open line does not say it is expanded');
  /* A GRADE CHOSEN IS A GRADE SAVED — no Save to find. */
  q.sent.length = 0;
  const saidLine = q.shelf().closest('.me-form').querySelector('.me-said');
  if (saidLine) saidLine.textContent = 'An old refusal';
  q.pick(q.box(4, '_grade'), 'A*');
  await wait(300);
  let f = q.last();
  if (!f) bad.push('choosing a grade saved nothing');
  /* THE TOAST IS THE RECEIPT; THE LINE UNDER THE CARD IS FOR A REFUSAL. *Walked:* "Saved" stood under the
     card for the rest of the session beside a toast saying the same. A success clears the line —
     including a refusal left there by a save that failed. */
  const saidNow = q.shelf().closest('.me-form').querySelector('.me-said');
  if (!saidNow || saidNow.textContent !== '') bad.push('after a save the line under the card says "' + (saidNow && saidNow.textContent) + '", not nothing');
  else {
    if (f.qual_4_grade !== 'A*' || f.qual_4_level !== 'A-Level' || f.qual_4 !== 'Physics') bad.push('the grade posted Physics as ' + JSON.stringify([f.qual_4, f.qual_4_level, f.qual_4_grade]));
    if (Object.keys(f).filter(k => /^qual_/.test(k)).length !== 70) bad.push('the grade did not post all seventy qual_ boxes');
  }
  if (!q.slot(4).classList.contains('is-open')) bad.push('the line shut after its grade was saved, so a second answer means opening it again');
  if (!q.d.querySelector('#s-settings .q-shelf').closest('.me-form').dataset.dirty) bad.push('an open line does not hold the column, so the repaint after a save would shut it');
  if ((q.line(4).querySelector('.prof-iso sub') || {}).textContent !== 'A*') bad.push('the line does not show the new grade');
  /* TEACH ON A SECOND LEVEL LEAVES THE FIRST'S — *"it unticks the other one. i dont want that"*. */
  q.sent.length = 0;
  q.A('qual-teach', q.seg(4, 'spec'));
  await wait(300);
  f = q.last();
  if (!f) bad.push('Teach saved nothing');
  else {
    if (f.qual_4_spec !== 'TRUE' || f.qual_4_teach !== 'TRUE') bad.push('Teach posted ' + JSON.stringify([f.qual_4_spec, f.qual_4_teach]) + ', not Teach and Can teach');
    if (f.qual_1_spec !== 'TRUE' || f.qual_2_spec !== 'TRUE') bad.push('Teach on Physics took Teach off Maths');
  }
  if (!q.line(4).querySelector('.q-chip')) bad.push('the line does not show the gold Teach chip it was just given');
  /* AND NOT TEACHING IS BOTH BOXES FALSE, ON THIS LINE ONLY. */
  q.sent.length = 0;
  q.A('qual-teach', q.seg(4, 'no'));
  await wait(300);
  f = q.last();
  if (!f || f.qual_4_spec !== 'FALSE' || f.qual_4_teach !== 'FALSE') bad.push('Not teaching did not post both of its boxes FALSE');
  else if (f.qual_3_teach !== 'TRUE') bad.push('Not teaching on the A-Level changed the GCSE');
  /* A SAVED LINE CANNOT LOSE ITS LEVEL BY A PICK: refused before anything is sent. */
  q.sent.length = 0;
  q.pick(q.box(4, '_level'), '');
  await wait(300);
  if (q.posts().length) bad.push('a line with its level emptied was saved');
  if (!/choose a level/i.test(q.said())) bad.push('emptying the level said "' + q.said() + '"');
  q.pick(q.box(4, '_level'), 'A-Level');
  await wait(300);
  /* THE SECOND TAP SHUTS IT, and with nothing left to save it sends nothing. */
  q.sent.length = 0;
  q.A('qual-open', q.line(4));
  await wait(300);
  if (q.posts().length) bad.push('shutting a line with nothing new in it saved again');
  if (q.shelf().querySelector('.is-open')) bad.push('the second tap did not shut the line');
  if (q.shelf().closest('.me-form').dataset.dirty) bad.push('a shut card still holds the column');
  /* A PRESS THAT REACHES A SHUT LINE'S TEACH — a raced redraw, or `check/press.js` pressing every action
     in turn — opens that line and answers, rather than doing nothing. */
  q.sent.length = 0;
  q.A('qual-teach', q.seg(5, 'spec'));
  await wait(300);
  const g = q.last();
  if (!g || g.qual_5_spec !== 'TRUE' || !q.slot(5).classList.contains('is-open')) bad.push('Teach pressed on a shut line did nothing');
  return bad;
});
/* A TAP THAT LANDS WHILE A TYPED ANSWER IS SAVING. A box is saved on `change`, which fires as it loses
   focus — under the finger already on the next line — and the save locks the card. Walked at 320,
   every run: the school saved, the tapped line was disabled before its click arrived, and nothing
   opened. Driven here in that order with a real `click()`, which jsdom drops on a disabled button
   exactly as a browser does (mutation: `data-unlocked` off the line — the line stays shut). */
check('a tap on another qualification while a typed answer is saving still opens it', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  if (!q.slot(1) || !q.slot(2)) return ['the card has no Maths GCSE and A-Level to work on'];
  q.A('qual-open', q.line(2));
  const school = q.box(2, '_board');
  school.value = 'Kings College';
  school.dispatchEvent(new q.w.Event('input', { bubbles: true }));
  q.sent.length = 0;
  school.dispatchEvent(new q.w.Event('change', { bubbles: true }));
  if (!q.shelf().closest('.me-form').classList.contains('is-sending')) bad.push('the school\'s change did not start a save, so this journey proves nothing');
  q.line(1).click();
  await wait(400);
  const f = q.last();
  if (!f || f.qual_2_board !== 'Kings College') bad.push('the typed school was not saved');
  if (q.posts().length !== 1) bad.push('one typed answer and one tap made ' + q.posts().length + ' saves');
  const open = [...q.shelf().querySelectorAll('.q-slot.is-open')].map(s => s.dataset.slot);
  if (JSON.stringify(open) !== '["1"]') bad.push('the tap on Maths GCSE during the save left ' + JSON.stringify(open) + ' open, not the GCSE');
  /* AND THE TICK, pressed the same way, shuts the line once the save is in. */
  q.A('qual-open', q.line(2));
  const s2 = q.box(2, '_board');
  s2.value = 'Kings College London';
  s2.dispatchEvent(new q.w.Event('input', { bubbles: true }));
  s2.dispatchEvent(new q.w.Event('change', { bubbles: true }));
  q.slot(2).querySelector('[data-do="qual-done"]').click();
  await wait(400);
  if ((q.last() || {}).qual_2_board !== 'Kings College London') bad.push('the second school was not saved');
  if (q.shelf().querySelector('.is-open')) bad.push('the tick pressed during the save did not shut the line');
  return bad;
});
/* A CERTIFICATE HAS NO GRADE AND IS NOT TAUGHT. *Walked at 390:* the DBS editor offered Grade and Teach,
   and Teach would have listed the DBS under Teaches on the profile (`teachesOf_` reads the tick, not
   the kind). The editor hides both (`.is-cert`, held in a real browser by `check/states.js`); here, the
   data: a line moved onto DBS posts its grade empty and both teaching boxes FALSE, and wears no mark.
   Mutation: the reset in `qualCommit_` removed — the A and Can teach go to the sheet under a DBS. */
check('a qualification moved onto a certificate drops its grade and its teaching', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  if (!q.slot(4)) return ['the card has no Physics A-Level to work on'];
  q.A('qual-open', q.line(4));
  if (q.slot(4).classList.contains('is-cert')) bad.push('Physics A-Level is marked a certificate');
  if (!q.slot(7).classList.contains('is-cert')) bad.push('the Enhanced DBS is not marked a certificate');
  q.sent.length = 0;
  q.pick(q.box(4, ''), 'First Aid');
  await wait(300);
  const f = q.last();
  if (!f) bad.push('moving the line onto First Aid saved nothing');
  else if (f.qual_4 !== 'First Aid' || f.qual_4_grade !== '' || f.qual_4_teach !== 'FALSE' || f.qual_4_spec !== 'FALSE') {
    bad.push('First Aid posted as ' + JSON.stringify([f.qual_4, f.qual_4_grade, f.qual_4_teach, f.qual_4_spec]) + ', keeping a grade or a teaching tick');
  }
  const s4 = q.slot(4);
  if (!s4 || !s4.classList.contains('is-cert')) bad.push('the line moved onto First Aid is not marked a certificate');
  if (s4 && s4.querySelector('.q-line .q-mark').textContent.trim()) bad.push('the certificate still wears a teaching mark');
  return bad;
});
check('adding a qualification: the + asks for the subject, then the level, and saves the moment it has both', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  q.sent.length = 0;
  q.A('qual-add', q.shelf().querySelector('[data-do="qual-add"]'));
  await wait(100);
  const fresh = q.shelf().querySelector('.q-subj.is-new .q-slot.is-open[data-new]');
  if (!fresh) return ['+ did not open a new line'];
  const n = fresh.dataset.slot;
  const subj = fresh.querySelector('select.q-name');
  /* THE SUBJECT'S LIST IS ALREADY OPEN, YOURS FIRST. */
  if (subj.getAttribute('aria-expanded') !== 'true') bad.push('+ did not open the subject list');
  const first = subj.querySelector('optgroup');
  const yours = first ? [...first.querySelectorAll('option')].map(o => o.value) : [];
  if (!first || first.label !== 'Your subjects' || JSON.stringify(yours) !== JSON.stringify(['Maths', 'Physics', 'English Literature', 'Bible and Theology', 'DBS'])) {
    bad.push('the subject list does not start with your own subjects (' + JSON.stringify(yours) + ')');
  }
  /* A SUBJECT ALONE IS NOT A QUALIFICATION: nothing posted, and the level is asked for next. */
  q.pick(subj, 'Maths');
  await wait(100);
  if (q.posts().length) bad.push('a subject with no level was saved');
  if ((q.box(n, '_level').getAttribute && q.box(n, '_level').getAttribute('aria-expanded')) !== 'true') bad.push('choosing the subject did not open the level list');
  q.pick(q.box(n, '_level'), 'AS');
  await wait(300);
  const f = q.last();
  if (!f) bad.push('a subject and a level were not saved');
  else {
    if (f['qual_' + n] !== 'Maths' || f['qual_' + n + '_level'] !== 'AS') bad.push('the new line posted as ' + JSON.stringify([f['qual_' + n], f['qual_' + n + '_level']]));
    if (Object.keys(f).filter(k => /^qual_/.test(k)).length !== 70) bad.push('adding did not post all seventy qual_ boxes');
    if (f.qual_1 !== 'Maths' || f.qual_7_level !== 'Enhanced') bad.push('adding disturbed the lines already saved');
  }
  /* AND IT IS A MATHS LINE NOW — in the Maths group itself, its subject not said a second time, open
     for its grade, no longer new. Asked as the SAME group as Maths GCSE, because a new line's own face
     names its subject and a check that read the nearest heading passed with the line left at the foot
     in a group of its own (mutation: the redraw after the first save removed). */
  const moved = q.slot(n);
  if (!moved || !q.slot(1) || moved.closest('.q-subj') !== q.slot(1).closest('.q-subj')
      || moved.querySelector('.q-who').textContent.trim() || q.shelf().querySelector('.q-subj.is-new')) {
    bad.push('the new AS did not join the Maths lines');
  }
  if (!moved || !moved.classList.contains('is-open') || moved.dataset.new) bad.push('the new line is not open as a saved line for the rest of its answers');
  /* A LINE THAT NEVER GOT ITS LEVEL GOES BACK UNSAVED. */
  q.A('qual-add', q.shelf().querySelector('[data-do="qual-add"]'));
  await wait(100);
  const half = q.shelf().querySelector('.q-slot[data-new]');
  q.sent.length = 0;
  if (half) { q.pick(half.querySelector('select.q-name'), 'Physics'); await wait(100);
              q.A('qual-done', half.querySelector('[data-do="qual-done"]')); await wait(200); }
  if (!half || q.posts().length || q.shelf().querySelector('.q-list .q-slot[data-new]')) bad.push('a line with a subject and no level was kept or saved');
  /* AN EMPTY SLOT REACHED BY A PRESS OPENS AS A NEW LINE — what `+` does with the next one — rather
     than redrawing the card exactly as it was. */
  const pooled = q.shelf().querySelector('.q-pool .q-line');
  if (pooled) { q.A('qual-open', pooled); await wait(100); }
  if (!pooled || !q.shelf().querySelector('.q-list .q-slot.is-open[data-new]')) bad.push('a press on an empty slot did nothing');
  /* TEN IS THE MOST: the + is off, and the line under it says why. */
  const ten = {};
  for (let i = 1; i <= 10; i++) Object.assign(ten, { ['qual_' + i]: 'Subject ' + i, ['qual_' + i + '_level']: 'GCSE' });
  const q10 = await qualCard_(ten);
  const add10 = q10.shelf() && q10.shelf().querySelector('[data-do="qual-add"]');
  if (!add10 || !add10.disabled) bad.push('the + is live at ten qualifications');
  if (!/ten is the most/i.test((q10.shelf() && q10.shelf().querySelector('.q-full') || {}).textContent || '')) bad.push('nothing says why there is no room for an eleventh');
  return bad;
});
check('removing a qualification: the bin saves at once, and only that one goes', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  q.A('qual-open', q.line(7));
  q.sent.length = 0;
  q.A('qual-drop', q.slot(7).querySelector('[data-do="qual-drop"]'));
  await wait(300);
  const f = q.last();
  if (!f) bad.push('the bin did not save');
  else {
    const blank = ['', '_level', '_grade', '_board', '_received'].every(k => f['qual_7' + k] === '')
               && f.qual_7_spec === 'FALSE' && f.qual_7_teach === 'FALSE';
    if (!blank) bad.push('the bin posted the DBS as ' + JSON.stringify(['', '_level', '_received'].map(k => f['qual_7' + k])));
    if (Object.keys(f).filter(k => /^qual_/.test(k)).length !== 70) bad.push('the bin did not post all seventy qual_ boxes');
    if (f.qual_6_level !== "Bachelor's degree" || f.qual_1_grade !== '9') bad.push('the bin took another qualification with it');
  }
  if (q.shelf().querySelector('.q-list .q-slot[data-slot="7"]')) bad.push('the DBS is still on the card after the bin');
  if (!/Removed DBS Enhanced/.test(q.said())) bad.push('the bin said "' + q.said() + '"');
  /* A LINE BEING ADDED WAS NEVER SAVED: its bin only puts it back. */
  q.A('qual-add', q.shelf().querySelector('[data-do="qual-add"]'));
  await wait(100);
  const fresh = q.shelf().querySelector('.q-slot[data-new]');
  q.sent.length = 0;
  if (fresh) { q.A('qual-drop', fresh.querySelector('[data-do="qual-drop"]')); await wait(200); }
  if (!fresh || q.posts().length || q.shelf().querySelector('.q-list .q-slot[data-new]')) bad.push('the bin on an unsaved line saved, or left the line on the card');
  return bad;
});

/* ---------- IMPOSTER: ONE PLAYER IS NOT TOLD, AND NOBODY SEES ANYBODY ELSE'S CARD -------------------
   THE GAME IS A SECRET KEPT BY A PHONE PASSED ROUND, and every way it can go wrong draws perfectly:
   two imposters, an imposter shown the word, a word left on the screen when the phone is handed on,
   a reveal naming somebody who was never told. So this deals a round of five through the app's own
   handlers and reads what each player would have seen — and what the NEXT player sees before they
   press anything, which is the half that is easy to get wrong. */
check('the imposter game tells everybody the word but one, and hides it between players', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  try { w.localStorage.setItem('wg-game', 'imp'); } catch (e) {}
  try { t.go('games', false, true); } catch (e) { return ['go("games") threw: ' + e.message]; }
  await wait(700);
  const d = w.document;
  const card = () => d.getElementById('imp-card');
  if (!card()) return ['the imposter game did not draw on the Games column'];
  const press = (act, attrs) => {
    const el = d.createElement('button');
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    t.ACTIONS[act](el);
  };
  const bad = [];
  const text = () => String(card().textContent || '').replace(/\s+/g, ' ').trim();
  const N = 5;
  for (let i = 0; i < 12; i++) press('imp-count', { 'data-d': '-1' });
  for (let i = 0; i < N - 3; i++) press('imp-count', { 'data-d': '1' });
  if (!/\b5\b/.test(text())) bad.push('two presses up from three players does not read 5: "' + text() + '"');
  press('imp-start');
  const seen = [];
  for (let i = 0; i < N; i++) {
    const before = text();
    if (before.indexOf('Player ' + (i + 1)) === -1 || !/Hand the phone/.test(before)) {
      bad.push('before player ' + (i + 1) + ' presses anything the card reads "' + before + '"');
    }
    seen.forEach(s => {
      if (s.word && before.indexOf(s.word) !== -1) bad.push('the word is on the screen when the phone reaches player ' + (i + 1));
    });
    press('imp-show');
    const shown = text();
    const imposter = /imposter/i.test(shown);
    /* THE WORD IS THE LARGE LINE, so it is read off the element that draws it rather than guessed
       at from the text round it. */
    const wordEl = card().querySelector('.art-word');
    seen.push({ imposter: imposter,
                word: imposter ? '' : String(wordEl ? wordEl.textContent : '').trim(),
                cat: String((card().querySelector('.art-cat-of') || {}).textContent || '').trim() });
    if (i === 1) {
      /* LEAVING THE COLUMN HIDES A WORD LEFT UP, and keeps whose turn it was. */
      const wd = t.allWidgets().find(x => x.id === 'wordgames');
      if (!wd || !wd.stop) bad.push('the imposter widget has no stop, so a word left up stays up');
      else wd.stop();
      t.go('games', false, true);
      if (!/Hand the phone to Player 2/.test(text())) {
        bad.push('leaving the column with a word up does not hide it: the card reads "' + text() + '"');
      }
      press('imp-show');
    }
    press('imp-hide');
  }
  const imps = seen.filter(s => s.imposter);
  if (imps.length !== 1) bad.push(imps.length + ' of ' + N + ' players were told they were the imposter');
  const words = new Set(seen.filter(s => !s.imposter).map(s => s.word));
  if (words.size !== 1 || [...words][0] === '') {
    bad.push('the others were not all shown one word: ' + [...words].join(' / '));
  }
  const cats = new Set(seen.map(s => s.cat));
  if (cats.size !== 1 || [...cats][0] === '') bad.push('not everybody, imposter included, was shown one category');
  const play = text();
  if ([...words].some(wd => wd && play.indexOf(wd) !== -1)) bad.push('the word is on the screen once everybody has looked');
  press('imp-reveal');
  const rev = text();
  const who = seen.findIndex(s => s.imposter) + 1;
  if (rev.indexOf('Player ' + who) === -1) bad.push('the reveal does not name player ' + who + ': "' + rev + '"');
  if ([...words].some(wd => rev.indexOf(wd) === -1)) bad.push('the reveal does not say the word');
  press('imp-players');
  return bad;
});
/* ---------- SENTENCE SCRAMBLE: TAPPED IN ORDER IS RIGHT, AND EVERY STATED ORDER IS RIGHT ------------
   A MARKER THAT TELLS A CHILD THEY ARE WRONG IS THE ONE PART OF A GAME THAT MUST NOT BE, and every way
   this one could be wrong draws perfectly: an alternative order refused, Check pressable on half a
   sentence, a chip that cannot be taken back, a deal that arrives already solved. So every sentence
   with a stated alternative is built in EACH of its orders through the real `ss-word` handler and
   checked through the real `ss-check`. */
check('the sentence scramble marks the right order right, every stated order, and nothing else', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.ss || !t.setSs || !t.SS_SENTENCES) return ['the sentence scramble is not exported'];
  try { t.go('games', false, true); } catch (e) { return ['go("games") threw: ' + e.message]; }
  await wait(300);
  const d = w.document;
  if (!d.getElementById('ss-box')) return ['the sentence scramble did not draw on the Games column'];
  const bad = [];
  const press = (act, attrs) => {
    const el = d.createElement('button');
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    t.ACTIONS[act](el);
  };
  /* PRESS THE CHIPS THAT SPELL `words`, choosing an unused chip with that text each time — which is
     what a person does when two chips both say "the". */
  const build = words => {
    words.forEach(wd => {
      const s = t.ss();
      const i = s.chips.findIndex((c, k) => c === wd && s.picked.indexOf(k) === -1);
      if (i < 0) { bad.push('no unused chip says ' + JSON.stringify(wd)); return; }
      press('ss-word', { 'data-i': String(i) });
    });
  };
  const deal = entry => {
    const words = t.ssOrders(entry)[0];
    t.setSs({ band: 'KS2', entry: entry, chips: words.slice().reverse(), picked: [], verdict: '', said: '' });
    t.ssPaint();
  };
  let alts = 0;
  Object.keys(t.SS_SENTENCES).forEach(band => t.SS_SENTENCES[band].forEach(entry => {
    const orders = t.ssOrders(entry);
    if (!t.ssRight(entry, orders[0])) bad.push(JSON.stringify(orders[0].join(' ')) + ' is not marked right against itself');
    orders.forEach((o, k) => {
      if (!k) return;
      alts++;
      deal(entry);
      build(o);
      press('ss-check');
      if (t.ss().verdict !== 'right') {
        bad.push('the stated alternative ' + JSON.stringify(o.join(' ')) + ' was marked ' + JSON.stringify(t.ss().verdict));
      }
    });
  }));
  if (!alts) bad.push('no sentence states an alternative order, so that half was NOT checked');

  /* ONE SENTENCE, THE WHOLE WAY ROUND, on the card. */
  const entry = t.SS_SENTENCES.KS3[0];
  const right = t.ssOrders(entry)[0];
  deal(entry);
  const check = () => d.querySelector('#ss-box [data-do="ss-check"]');
  build(right.slice(0, 2));
  if (!check() || !check().disabled) bad.push('Check can be pressed with two of ' + right.length + ' words placed');
  const built = String((d.querySelector('#ss-box .ss-built') || {}).textContent || '');
  if (built.trim() !== right.slice(0, 2).join(' ')) bad.push('the strip reads "' + built.trim() + '" after two taps');
  /* A USED CHIP TAKES ITS WORD BACK. */
  const s0 = t.ss();
  press('ss-word', { 'data-i': String(s0.picked[1]) });
  if (t.ss().picked.length !== 1) bad.push('tapping a used chip does not take its word back out');
  build(right.slice(1));
  if (!check() || check().disabled) bad.push('Check is not pressable with every word placed');
  press('ss-check');
  if (t.ss().verdict !== 'right' || !d.querySelector('#ss-box .ss-built.is-right')
      || !d.querySelector('#ss-box [data-do="ss-next"]')) {
    bad.push('the right order was not marked right on the card');
  }
  press('ss-next');
  if (t.ss().picked.length || t.ss().verdict) bad.push('Next sentence does not start from an empty strip');

  /* AND A WRONG ORDER IS WRONG, and says how far it got. */
  deal(entry);
  const wrong = right.slice(0, 2).concat(right.slice(2).reverse());
  if (t.ssRight(entry, wrong)) bad.push('the wrong order used here is accidentally right — pick another sentence');
  build(wrong);
  press('ss-check');
  if (t.ss().verdict !== 'wrong') bad.push('a wrong order was marked ' + JSON.stringify(t.ss().verdict));
  if (!/first 2 words are right/.test(t.ss().said)) bad.push('a wrong order says "' + t.ss().said + '" rather than how far it got');

  /* A DEAL NEVER ARRIVES SOLVED. */
  for (let i = 0; i < 200; i++) {
    t.ssDeal('KS2');
    if (t.ssRight(t.ss().entry, t.ss().chips)) { bad.push('a deal arrived already in order: ' + t.ss().chips.join(' ')); break; }
  }
  return bad;
});

/* ---------- WORD SEARCH: EVERY WORD IS IN THE GRID, AND TWO TAPS FIND IT -----------------------------
   A word search that hides a word wrongly is a puzzle nobody can finish and nothing on screen says
   why. So fifteen puzzles of every theme are built and each placed word is READ BACK out of the grid
   along its own cells; a younger theme's words must read forwards; and the filler must spell nothing
   on `WS_NOT` in any direction — asked of the grid, so a build that forgot to filter fails here.
   Then one puzzle is played through the real `ws-cell` handler, forwards and backwards. */
check('the word search hides every word where it says, and two taps find it', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.wsBuild || !t.WS_THEMES) return ['the word search is not exported'];
  try { t.go('games', false, true); } catch (e) { return ['go("games") threw: ' + e.message]; }
  await wait(300);
  const d = w.document;
  if (!d.getElementById('ws-grid')) return ['the word search did not draw on the Games column'];
  const bad = [];
  const dirOf = (n, a, b) => [Math.sign((b % n) - (a % n)), Math.sign(((b / n) | 0) - ((a / n) | 0))];
  t.WS_THEMES.forEach(th => {
    for (let k = 0; k < 15; k++) {
      const p = t.wsBuild(th);
      if (!p) { bad.push(th.id + ': a puzzle could not be built'); return; }
      if (p.words.length !== th.n) bad.push(th.id + ': ' + p.words.length + ' words placed, wanted ' + th.n);
      if (t.wsRude(p.grid, p.size)) { bad.push(th.id + ': a grid spells a word the filter refuses'); return; }
      /* ONE WORD AT MOST ACROSS THE WHOLE GRID — the note in `wsBuild_` is why: without it a younger
         8x8 drew six eight-letter words as six whole rows, a list rather than a puzzle. */
      const full = p.words.filter(x => x.key.length === p.size).length;
      if (full > 1) bad.push(th.id + ': ' + full + ' words run the whole width of one grid');
      p.words.forEach(wd => {
        const read = wd.cells.map(c => p.grid[c]).join('');
        if (read !== wd.key) bad.push(th.id + ': ' + wd.word + ' reads "' + read + '" off its own cells');
        const [dx, dy] = dirOf(p.size, wd.cells[0], wd.cells[1]);
        const name = Object.keys(t.WS_DIRS).find(n => t.WS_DIRS[n][0] === dx && t.WS_DIRS[n][1] === dy);
        if (th.young && t.WS_FORWARD.indexOf(name) === -1) {
          bad.push(th.id + ' is for younger players and hid ' + wd.word + ' going ' + name);
        }
      });
    }
  });
  const press = i => {
    const el = d.createElement('button');
    el.setAttribute('data-i', String(i));
    t.ACTIONS['ws-cell'](el);
  };
  const th = t.WS_THEMES.find(x => !x.young);
  const p = t.wsBuild(th);
  t.setWs(p);
  t.wsPaint();
  /* NOT IN A LINE IS NOTHING FOUND, AND THE SECOND TAP IS THE NEW START. */
  const a = 0, b = p.size * 2 + 1;
  press(a); press(b);
  if (t.ws().words.some(x => x.found)) bad.push('two taps not in a line found a word');
  if (t.ws().sel !== b) bad.push('a second tap off the line does not become the new start');
  press(b);
  p.words.forEach((wd, i) => {
    const first = wd.cells[0], last = wd.cells[wd.cells.length - 1];
    if (i % 2) { press(last); press(first); } else { press(first); press(last); }
    if (!t.ws().words[i].found) bad.push(wd.word + ' was not found by tapping ' + (i % 2 ? 'its last then first' : 'its first then last') + ' letter');
  });
  const struck = d.querySelectorAll('#ws-words li.got s').length;
  if (struck !== p.words.length) bad.push(struck + ' of ' + p.words.length + ' found words are struck through in the list');
  const lit = d.querySelectorAll('#ws-grid .ws-c.got').length;
  const cells = new Set([].concat(...p.words.map(x => x.cells))).size;
  if (lit !== cells) bad.push(lit + ' cells are highlighted where the found words cover ' + cells);
  if (!/All \d+ found/.test(String((d.getElementById('ws-said') || {}).textContent || ''))) bad.push('finishing the puzzle does not say so');
  if (d.querySelector('#ws-grid .ws-c:not([disabled])')) bad.push('a finished grid can still be tapped');
  return bad;
});


/* ---------- CONTEST: THE LAST CARD ON THE GAMES COLUMN, AND NOTHING ON IT TO PRESS -----------------
   ASKED FOR AS "make a widget in games column purley dedicatied for contest. make it a place holder
   for now." Two things a placeholder can get wrong without drawing badly: arriving anywhere but
   LAST, which moves every page `PAGE.games` has remembered by one, and growing a control before
   there is anything behind it, which is a button that does nothing.
   "LAST" BECAME "STRAIGHT AFTER `reels`" when Videos was appended behind it, for the same reason —
   the rule was never that contest is last for ever, it was that nothing was inserted above. */
check('the contest placeholder comes straight after One more thing on the Games column, says so, and has nothing to press', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  const bad = [];
  const roster = t.widgetsOf('game').map(x => String(x.id));
  if (roster.indexOf('contest') === -1) return ['there is no contest widget on the Games column'];
  if (roster.indexOf('contest') !== roster.indexOf('reels') + 1) bad.push('contest does not come straight after reels: ' + roster.join(', '));
  t.go('games', false, true);
  await wait(LEAVE_MS); await woken_();
  const slot = w.document.querySelector('#s-games #wgt-contest');
  if (!slot) return bad.concat(['the contest card did not draw on the Games column']);
  const h = slot.querySelector('h3');
  if (!h || h.textContent.trim() !== 'Contest') bad.push('the card is not headed Contest');
  if (!/Not built yet/.test(slot.textContent)) bad.push('the card does not say it is not built yet');
  const live = slot.querySelectorAll('button, [data-do], input, select, textarea, a[href]');
  if (live.length) bad.push('a placeholder has ' + live.length + ' control(s) on it: ' + [...live].map(e => e.outerHTML.slice(0, 60)).join(' | '));
  return bad;
});

/* ---------- LEGO TRADE-IN: THE LAST CARD ON THE TOOLS COLUMN, AND NOTHING ON IT TO PRESS ------------
   ASKED FOR AS "the lego trade in should be a widget in tools. you dont have to make it just leave a
   placeholder." The contest journey's two questions on the other column: appended LAST, so no page
   `PAGE.tools` remembers moves, and no control before there is anything behind one. */
check('the LEGO trade-in placeholder is the last card on the Tools column, says so, and has nothing to press', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  const bad = [];
  const roster = t.widgetsOf('tool').map(x => String(x.id));
  if (roster.indexOf('legotrade') === -1) return ['there is no legotrade widget on the Tools column'];
  if (roster[roster.length - 1] !== 'legotrade') bad.push('legotrade is not the last tool: ' + roster.join(', '));
  t.go('tools', false, true);
  await wait(LEAVE_MS); await woken_();
  const slot = w.document.querySelector('#s-tools #wgt-legotrade');
  if (!slot) return bad.concat(['the LEGO trade-in card did not draw on the Tools column']);
  const h = slot.querySelector('h3');
  if (!h || h.textContent.trim() !== 'LEGO trade-in') bad.push('the card is not headed LEGO trade-in');
  if (!/Not built yet/.test(slot.textContent)) bad.push('the card does not say it is not built yet');
  const live = slot.querySelectorAll('button, [data-do], input, select, textarea, a[href]');
  if (live.length) bad.push('a placeholder has ' + live.length + ' control(s) on it: ' + [...live].map(e => e.outerHTML.slice(0, 60)).join(' | '));
  return bad;
});

/* ---------- VIDEOS: TYPING NARROWS, A TAP PLAYS IN THE CARD, FULL SCREEN ASKS FOR FULL SCREEN -------
   ASKED FOR AS "videos would be in the games column. its one new widget. its a video searcher you
   type in. and there should be a full screen button." Each half can fail while the card still draws
   perfectly well: a box whose list does not change as you type, a row that is tapped and plays
   nothing (or plays in the wrong element — a YouTube link in a `<video>` is a black box), a switched-
   off row that shows anyway, and a Full screen tile that is pressed and asks nobody for anything.
   And the `contest` rule again: the card is appended LAST, so no remembered page moves.

   THE LIST IS THE JOURNEY'S OWN, served where the app asks for `data/videos.json`, so the rows are
   known here rather than whatever the owner has typed in by the time this runs. The built-in reels
   ride along, which is the point — the box searches them too. */
check('the videos widget is last on Games: typing narrows the list, a tap plays it in the card, full screen asks the player', async () => {
  const rows = [
    { title: 'How volcanoes erupt', url: 'https://www.youtube.com/watch?v=abcdefghijk', kind: 'clip',
      tags: 'science earth', age: '7+', notes: '', active: true },
    { title: 'Fractions in two minutes', url: 'data/reels/fractions.mp4', kind: 'clip',
      tags: 'maths', age: '', notes: '', active: '' },
    { title: 'A switched-off volcano', url: 'https://youtu.be/zyxwvutsrqp', kind: 'clip',
      tags: 'science', age: '', notes: '', active: false },
  ];
  let asked = 0;
  const full = [];
  const { w } = boot({ before: win => {
    const f0 = win.fetch;
    win.fetch = (url, o) => {
      if (/data\/videos\.json/.test(String(url))) {
        asked++;
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(rows),
                                 text: () => Promise.resolve(JSON.stringify(rows)) });
      }
      return f0(url, o);
    };
    /* JSDOM HAS NO FULL SCREEN, so the journey stands in for it and writes down who asked. */
    win.HTMLElement.prototype.requestFullscreen = function () { full.push(this.tagName.toLowerCase()); return Promise.resolve(); };
  } });
  await wait(300);
  const t = w.__t;
  const d = w.document;
  const bad = [];
  const roster = t.widgetsOf('game').map(x => String(x.id));
  if (roster.indexOf('videos') === -1) return ['there is no videos widget on the Games column'];
  if (roster[roster.length - 1] !== 'videos') bad.push('videos is not the last game: ' + roster.join(', '));
  t.go('games', false, true);
  await wait(LEAVE_MS); await woken_();
  const box = d.querySelector('#s-games #wgt-videos .vid-box');
  if (!box) return bad.concat(['the videos card did not draw on the Games column']);
  if (!asked) bad.push('the card never asked for data/videos.json');
  const q = box.querySelector('input.vid-q');
  if (!q) return bad.concat(['there is no search box on the videos card']);
  const titles = () => [...box.querySelectorAll('.vid-list .vid-row .vid-t')].map(e => e.textContent.trim());
  const before = titles();
  if (before.indexOf('How volcanoes erupt') === -1 || before.indexOf('Fractions in two minutes') === -1)
    bad.push('the listed videos are not in the list: ' + before.join(' | '));
  if (before.indexOf('A switched-off volcano') !== -1) bad.push('a row with active: false is listed');
  /* AND NOT THE REELS: *"the video widget shouldn't acknowledge reels."* They were a third list here. */
  if (before.some(x => /^Reel \d/.test(x))) bad.push('the videos widget lists the app\'s reels, which it was told not to: ' + before.join(' | '));

  const type = v => { q.value = v; q.dispatchEvent(new w.Event('input', { bubbles: true })); };
  type('volc');
  const narrowed = titles();
  if (narrowed.length !== 1 || narrowed[0] !== 'How volcanoes erupt')
    bad.push('typing "volc" did not narrow to the one volcano: ' + narrowed.join(' | '));
  if (!/1 of \d+ videos/.test(box.querySelector('.vid-said').textContent))
    bad.push('the count does not say how many of how many: ' + box.querySelector('.vid-said').textContent);
  if (d.querySelector('#s-games #wgt-videos input.vid-q') !== q) bad.push('typing rebuilt the search box, which drops a phone\'s keyboard');
  type('maths two');
  if (titles().join() !== 'Fractions in two minutes') bad.push('two words did not narrow to the row holding both: ' + titles().join(' | '));
  type('zzzz');
  if (titles().length || !/Nothing matches/.test(box.textContent)) bad.push('a search that matches nothing does not say so');

  /* A TAP ON A YOUTUBE ROW: the nocookie embed, of that id, in the card. */
  type('volc');
  t.ACTIONS['vid-play'](box.querySelector('.vid-row[data-do="vid-play"]'));
  const fr = box.querySelector('.vid-stage iframe.vid-player');
  if (!fr || !/^https:\/\/www\.youtube-nocookie\.com\/embed\/abcdefghijk\b/.test(fr.getAttribute('src') || ''))
    bad.push('tapping the YouTube row did not put its nocookie embed in the card: ' + (fr ? fr.getAttribute('src') : 'no iframe'));
  /* AN MP4 ROW: a `<video>`, inline, on that file. */
  type('fractions');
  t.ACTIONS['vid-play'](box.querySelector('.vid-row[data-do="vid-play"]'));
  const v = box.querySelector('.vid-stage video.vid-player');
  if (!v || v.getAttribute('src') !== 'data/reels/fractions.mp4' || !v.hasAttribute('playsinline'))
    bad.push('tapping the mp4 row did not put an inline <video> of it in the card');
  if (box.querySelector('.vid-stage iframe')) bad.push('the old player was left in the card beside the new one');

  /* FULL SCREEN IS A TILE, and pressing it asks the PLAYER, not the card. */
  const tile = box.querySelector('.vid-acts .tile[data-do="vid-full"]');
  if (!tile) bad.push('there is no Full screen tile under the player');
  else {
    t.ACTIONS['vid-full'](tile);
    if (full.join() !== 'video') bad.push('Full screen asked ' + (full.join() || 'nobody') + ' rather than the video');
  }
  /* LEAVING STOPS IT: no player left in the card on a column nobody is looking at. */
  t.go('tools', false, true);
  await wait(LEAVE_MS); await woken_();
  if (d.querySelector('#s-games .vid-stage .vid-player')) bad.push('leaving the Games column left the video in its player');
  return bad;
});

/* ---------- CONNECT 4: ONE COUNTER FALLS, INTO THE RIGHT SQUARE, AND THE FOUR THAT WON ARE RINGED ---
   ASKED FOR AS "refine connect 4 add dropping animation of counters." The fall itself is CSS and
   only a browser can play it — what can go wrong here is WHICH square falls: none (the mark is
   lost), more than one (every counter on the board jumps on every tap), the wrong one (a counter
   drops into a square gravity would not put it in), or the same one again on a refused tap. Each of
   those draws a perfectly good board, so this asks the marks. And a win that rings three, or five
   of a line of four, is a ring that points at the wrong thing. There was no Connect 4 journey
   before this one. */
check('connect 4 drops exactly the counter just played into the lowest empty square, and rings the four that win', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  const d = w.document;
  const W = 7, H = 6;
  t.go('games', false, true);
  await wait(LEAVE_MS); await woken_();
  const at = t.widgetsOf('game').findIndex(x => String(x.id) === 'connect4');
  if (at < 0) return ['there is no Connect 4 on the Games column'];
  t.goPage('games', at, true);
  const cells = () => [...d.querySelectorAll('#s-games #c4-board .c4-cell')];
  if (cells().length !== W * H) return ['the board did not draw ' + (W * H) + ' squares'];
  const bad = [];
  const tap = x => { const el = d.createElement('button'); el.setAttribute('data-x', String(x)); t.ACTIONS['c4-drop'](el); };
  const lowest = x => { for (let y = H - 1; y >= 0; y--) { const c = cells()[y * W + x]; if (!c.classList.contains('p1') && !c.classList.contains('p2')) return y; } return -1; };
  const fallen = () => cells().map((c, i) => c.classList.contains('c4-new') ? i : -1).filter(i => i >= 0);
  const said = () => d.querySelector('#s-games #c4-said');

  /* ONE TAP, ONE COUNTER FALLING, WHERE GRAVITY PUTS IT — twice in one column, so "lowest empty"
     is asked of a column that is not empty. */
  [[3, 'p1'], [3, 'p2'], [4, 'p1']].forEach(([x, side]) => {
    const y = lowest(x);
    tap(x);
    const f = fallen();
    if (f.length !== 1) { bad.push('a tap in column ' + (x + 1) + ' marked ' + f.length + ' counters to fall'); return; }
    if (f[0] !== y * W + x) bad.push('a tap in column ' + (x + 1) + ' dropped square ' + f[0] + ', not row ' + (y + 1) + ' of that column');
    const c = cells()[f[0]];
    if (!c.classList.contains(side)) bad.push('the counter that fell in column ' + (x + 1) + ' is not ' + side);
    if (!/--c4-fall:\s*\d/.test(c.getAttribute('style') || '') || Number((c.getAttribute('style').match(/--c4-fall:\s*(\d+)/) || [])[1]) !== y + 1) {
      bad.push('the counter that fell to row ' + (y + 1) + ' says it falls "' + c.getAttribute('style') + '"');
    }
  });
  /* WHOSE GO IT IS, AS A DISC IN THAT SIDE'S COLOUR — Yellow after three counters. */
  const disc = said() && said().querySelector('.c4-turn');
  if (!disc || !disc.classList.contains('p2') || disc.getAttribute('aria-hidden') !== 'true') {
    bad.push('after three counters the line reads "' + (said() || {}).innerHTML + '" — wanted a hidden yellow disc beside Yellow\'s go');
  }

  /* A FULL COLUMN PLAYS NOTHING, SO NOTHING FALLS — not even the counter that fell last time. */
  for (let i = 0; i < H; i++) tap(0);
  tap(0);
  if (!/full/.test(said().textContent)) bad.push('a tap on a full column reads "' + said().textContent + '"');
  if (fallen().length) bad.push('a tap on a full column dropped a counter again: square ' + fallen().join(', '));

  /* A WIN RINGS EXACTLY THE FOUR. Red down column 1, Yellow beside it. */
  t.ACTIONS['c4-again'](d.createElement('button'));
  if (cells().some(c => c.classList.contains('p1') || c.classList.contains('p2'))) bad.push('New game left counters on the board');
  [0, 1, 0, 1, 0, 1, 0].forEach(tap);
  const rung = cells().map((c, i) => c.classList.contains('c4-win') ? i : -1).filter(i => i >= 0);
  const four = [2, 3, 4, 5].map(y => y * W);
  if (rung.join(',') !== four.join(',')) bad.push('four Red counters down column 1 rang squares ' + rung.join(', ') + ', wanted ' + four.join(', '));
  if (!/Red wins/.test(said().textContent) || !said().querySelector('.c4-turn.p1')) bad.push('the win reads "' + said().innerHTML + '"');
  if (cells().some(c => !c.disabled)) bad.push('a won board can still be played');
  return bad;
});

/* ---------- THE MAZE: ITS WALLS ARE ITS OWN, ITS WALK SURVIVES A REPAINT, ITS KEYS ARE ITS OWN -----
   REPORTED AS "maz game is glitched." Three faults, and every one of them drew without a complaint
   from anything here — there was no maze journey at all.
     · THE WALLS. The south wall was the class `ws`, and the word search's grid is the bare `.ws`, so
       71 of 121 cells were laid out as small grids of their own. Asked here of the stylesheet itself:
       no rule whose subject names one of a maze cell's classes may be anybody's but the maze's. That
       is the fault as a rule rather than as the one class it happened to — a `.you` or an `.out`
       added for some other card tomorrow is the same collision. (`check/ui.js` asks the other half,
       in a real browser: that every square of a board is one size.)
     · THE WALK. A repaint dealt a new maze under a finger halfway to the exit.
     · THE KEYS. On the maze's page ArrowDown walked the maze AND turned the column; on Find, two
       arrows walked a maze nobody could see.
   The walk is played through the pad's own handler, along the shortest route read back off the
   drawn walls — so a wall drawn on the wrong side, or on one side of a doorway only, is a route
   this cannot finish. */
check('the maze draws its own walls, keeps a walk through a repaint, and has the arrow keys only in front', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.maze || !t.widgetsOf) return ['the maze is not exported'];
  const d = w.document;
  const N = 11;
  t.go('games', false, true);
  await wait(LEAVE_MS); await woken_();
  const at = t.widgetsOf('game').findIndex(x => String(x.id) === 'maze');
  if (at < 0) return ['there is no maze on the Games column'];
  t.goPage('games', at, true);
  await wait(50);
  const grid = () => d.querySelector('#s-games #maze-grid');
  if (!grid() || grid().children.length !== N * N) return ['the maze did not draw ' + (N * N) + ' squares'];
  const bad = [];

  /* 1. NO RULE BUT THE MAZE'S REACHES A MAZE SQUARE. Every selector in the stylesheet whose subject
     — its last compound, the element it styles — names a class some maze square carries, and that
     matches one, must be the maze's own (`.mz…`). jsdom matches selectors exactly as a browser does
     for everything here; one it cannot parse is skipped rather than guessed at. */
  {
    const css = fs.readFileSync(path.join(dir, '..', 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
    const cells = [...grid().children];
    const theirs = new Set();
    cells.forEach(c => c.classList.forEach(k => theirs.add(k)));
    const foreign = new Set();
    for (const m of css.matchAll(/([^{}@;]+)\{/g)) {
      m[1].split(',').map(x => x.trim()).filter(Boolean).forEach(sel => {
        if (/^(from|to|\d+%)$/.test(sel) || /::/.test(sel)) return;
        const subject = sel.split(/[\s>+~]+/).pop();
        const named = (subject.match(/\.[\w-]+/g) || []).map(x => x.slice(1));
        if (!named.some(k => theirs.has(k))) return;
        if (/\.mz\b|\.mz-/.test(sel)) return;
        let hit = false;
        try { hit = cells.some(c => c.matches(sel)); } catch (e) { return; }
        if (hit) foreign.add(sel);
      });
    }
    if (foreign.size) bad.push('a rule that is not the maze\'s reaches a maze square: ' + [...foreign].join(' | '));
  }

  /* THE WALLS AS DRAWN, read back off the squares' classes, and both sides of every wall agreeing. */
  const walls = () => {
    const out = [];
    [...grid().children].forEach((c, i) => {
      let v = 0;
      if (c.classList.contains('mz-n')) v |= 1;
      if (c.classList.contains('mz-e')) v |= 2;
      if (c.classList.contains('mz-s')) v |= 4;
      if (c.classList.contains('mz-w')) v |= 8;
      out[i] = v;
    });
    return out;
  };
  const STEP = { n: [0, -1, 1, 4], e: [1, 0, 2, 8], s: [0, 1, 4, 1], w: [-1, 0, 8, 2] };
  const route = (cells, from) => {
    const prev = new Array(N * N).fill(null);
    prev[from] = '';
    const q = [from];
    for (let i = 0; i < q.length; i++) {
      const a = q[i], x = a % N, y = (a / N) | 0;
      Object.keys(STEP).forEach(k => {
        const [dx, dy, bit] = STEP[k];
        const nx = x + dx, ny = y + dy, b = ny * N + nx;
        if (cells[a] & bit || nx < 0 || ny < 0 || nx >= N || ny >= N || prev[b] !== null) return;
        prev[b] = k; q.push(b);
      });
    }
    if (prev[N * N - 1] === null) return null;
    const steps = [];
    for (let b = N * N - 1; b !== from;) {
      const k = prev[b]; steps.unshift(k);
      b -= STEP[k][1] * N + STEP[k][0];
    }
    return steps;
  };
  {
    const c = walls();
    const oneSided = [];
    for (let i = 0; i < N * N; i++) {
      const x = i % N, y = (i / N) | 0;
      if (x < N - 1 && !!(c[i] & 2) !== !!(c[i + 1] & 8)) oneSided.push((x + 1) + ',' + (y + 1) + ' east');
      if (y < N - 1 && !!(c[i] & 4) !== !!(c[i + N] & 1)) oneSided.push((x + 1) + ',' + (y + 1) + ' south');
    }
    if (oneSided.length) bad.push('walls drawn on one side of a doorway only: ' + oneSided.slice(0, 5).join(', '));
    if (c.filter(v => v & 4).length === 0) bad.push('no square carries a south wall, so the wall classes were not read');
  }

  /* 2. THE KEYS, ON THE MAZE'S PAGE AND OFF IT. ArrowUp from the top left is always a wall: the
     maze must not move, and the press must not reach the pager either. */
  const key = k => d.body.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  const page = () => t.PAGE().games;
  const m0 = t.maze();
  key('ArrowUp');
  if (t.maze().moves !== 0) bad.push('ArrowUp into the outer wall counted a move');
  if (page() !== at) bad.push('ArrowUp on the maze page turned the column from the maze to page ' + page());
  t.goPage('games', at, true);
  const open0 = walls()[0] & 2 ? 'ArrowDown' : 'ArrowRight';
  key(open0);
  if (t.maze().moves !== 1) bad.push(open0 + ' on the maze page did not move the walker');
  if (page() !== at) bad.push(open0 + ' on the maze page also turned the column, to page ' + page());
  t.goPage('games', at, true);
  /* OFF IT: on the Find column the Games column is drawn as a neighbour, grid and all. */
  t.go('stuff', false, true);
  await wait(LEAVE_MS); await woken_();
  const was = t.maze().moves;
  ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].forEach(key);
  if (t.maze().moves !== was) bad.push('arrow keys on another column walked the maze from ' + was + ' to ' + t.maze().moves + ' moves');
  t.go('games', false, true);
  await wait(LEAVE_MS); await woken_();
  t.goPage('games', at, true);
  await wait(50);

  /* 3. A REPAINT KEEPS THE WALK. */
  if (t.maze() !== m0) bad.push('coming back to the column dealt a new maze');
  const drawn = walls().join(',');
  t.repaint(true);
  await wait(50);
  if (t.maze() !== m0 || t.maze().moves !== 1) bad.push('a repaint threw the walk away: moves ' + (t.maze() || {}).moves);
  if (walls().join(',') !== drawn) bad.push('a repaint drew different walls');

  /* 4. NEW MAZE STARTS AGAIN, and the shortest route read off the drawn walls finishes it. */
  const press = dd => { const el = d.createElement('button'); el.setAttribute('data-d', dd); t.ACTIONS['maze-go'](el); };
  t.ACTIONS['maze-again'](d.createElement('button'));
  const m1 = t.maze();
  if (m1 === m0 || m1.moves !== 0 || m1.x !== 0 || m1.y !== 0) bad.push('New maze did not start a fresh one at the top left');
  const way = route(walls(), 0);
  if (!way) return bad.concat(['the drawn walls have no way from the top left to the bottom right']);
  if (way.length !== m1.best) bad.push('the shortest way through the drawn walls is ' + way.length + ' and the maze says ' + m1.best);
  const half = way.length >> 1;
  way.slice(0, half).forEach(press);
  t.repaint(true);
  await wait(50);
  if (t.maze() !== m1 || t.maze().moves !== half) bad.push('a repaint halfway threw the walk away');
  way.slice(half).forEach(press);
  const said = String((d.querySelector('#s-games #maze-said') || {}).textContent || '');
  if (!t.maze().over || t.maze().moves !== m1.best) bad.push('the shortest route did not finish the maze in ' + m1.best);
  if (!/the shortest way there is/.test(said)) bad.push('finishing in the fewest moves says "' + said + '"');

  /* 5. A FINISHED MAZE GIVES THE KEYS BACK, and the next start deals another. */
  key('ArrowUp');
  if (page() === at) bad.push('ArrowUp on a finished maze still did not reach the pager');
  t.goPage('games', at, true);
  t.repaint(true);
  await wait(50);
  if (t.maze() === m1 || t.maze().over) bad.push('a finished maze was not replaced at the next start');
  return bad;
});

/* ---------- THE FOUR CLASSROOM GAMES: A ROUND SURVIVES A REPAINT, AND WAITS WHILE YOU ARE AWAY -----
   JUST A MINUTE, TABOO, HOT SEAT AND 20 QUESTIONS were asked to keep their round through a
   repaint — which is a stop and a start a moment apart — and to stop their clock when the column is
   left. Those pull against each other, because both arrive as the same `stop`, and every way of
   getting it wrong draws perfectly: a repaint that pauses the round under somebody's finger, a
   leave that lets the minute run out on another screen, a secret left up for whoever picks the
   phone up next. So these play each game through the app's own handlers and ask the state and the
   card both. */
/* A COLUMN'S WIDGETS ARE STARTED AND STOPPED FROM `afterSlide_`, about 300ms after the move, so a
   journey asking what leaving did has to wait that long first. */
const LEAVE_MS = 700;
/* AND ARRIVING NO LONGER STARTS THEM ALL IN THAT ONE TASK (5 Oct, `widgetsWake_` in arcade.js): the
   ones in view start at once and the rest one per task behind them, nearest first. Under jsdom a
   start is ~80ms, so the videos card thirteen pages down the Games column was still waiting its turn
   at 700ms — measured, and it is not a fault: nobody can see page thirteen without turning to it,
   and turning to it starts it (`widgetsNear_`). So a journey that has just ARRIVED waits for the
   column to finish waking as well — `quiet()`: the after-slide jobs and the widget queue both run
   dry, in the window booted last (the journeys run one at a time). Bounded, so a queue that never
   drains is a journey that fails on what it asked rather than a run that hangs; after a LEAVE it
   is already dry and this returns at once.
   THE CAMERA'S `CAM_SLIDE` WAITS SAY THE SAME THING — "past `afterSlide_`'s 300ms and any settle" —
   and failed on the unchanged base commit as well under a load average of 30–40 (measured 5 Oct):
   a fixed sleep is a guess at when a job ran, and `quiet()` is the job having run. */
let LAST_W = null;
const woken_ = async () => {
  for (let k = 0; k < 80; k++) {
    let quiet = true;
    try { quiet = !LAST_W || !LAST_W.__t || !LAST_W.__t.quiet || LAST_W.__t.quiet(); } catch (e) { quiet = true; }
    if (quiet) return;
    await wait(100);
  }
};
/* `k` IS WHICH WORD GAME THE WIDGET OPENS ON. All four live inside the one Word games widget, which
   draws only the game chosen; the choice is the device's, so it is set there before the column is
   reached. Alibi was the one that passed nothing, because it kept a card of its own; it is deleted. */
/* AND THE GAME'S OWN CARD IS WAITED FOR, NOT GUESSED AT. Six journeys booted with a fixed 300ms and
   a fixed `LEAVE_MS`, and under a load average of 20-40 they failed together -- "did not draw on the
   Games column", "PARTY is not reachable" -- every one green alone. Asked for every 100ms, up to 8s:
   the test harness (`__t`), then the card and the PARTY state the journey is about. A card that never
   comes still fails, on the journey's own first question. */
const partyBoot_ = async (k) => {
  const { w } = boot();
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  const t = w.__t;
  if (k) { try { w.localStorage.setItem('wg-game', k); } catch (e) {} }
  t.go('games', false, true);
  await wait(LEAVE_MS); await woken_();
  const d = w.document;
  for (let n = 0; n < 80; n++) {
    let ready = false;
    try { ready = (!k || !!d.getElementById(k + '-card')) && !!t.PARTY(); } catch (e) { ready = false; }
    if (ready) break;
    await wait(100);
  }
  const press = (act, attrs) => {
    const el = d.createElement('button');
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    t.ACTIONS[act](el);
  };
  const text = k => String((d.getElementById(k + '-card') || {}).textContent || '').replace(/\s+/g, ' ').trim();
  const acts = k => String((d.getElementById(k + '-acts') || {}).textContent || '').replace(/\s+/g, ' ').trim();
  return { w, t, d, press, text, acts, P: () => t.PARTY() };
};

check('just a minute keeps its round through a repaint and pauses when the column is left', async () => {
  const { t, d, press, text, acts, P } = await partyBoot_('jam');
  if (!d.getElementById('jam-card')) return ['Just a Minute did not draw on the Games column'];
  if (!P()) return ['the PARTY state is not reachable, so nothing about the round can be asked'];
  const bad = [];
  press('jam-start');
  const s = P().jam;
  if (!s || !s.topic || !s.ends) return ['Start did not deal a topic and start the clock'];
  if (text('jam').indexOf(s.topic) === -1) bad.push('the topic is not on the card: "' + text('jam') + '"');
  press('jam-call', { 'data-c': 'r' });
  press('jam-call', { 'data-c': 'r' });
  press('jam-call', { 'data-c': 'h' });
  if (!/Repetition\s*2/.test(acts('jam')) || !/Hesitation\s*1/.test(acts('jam'))) {
    bad.push('two repetitions and a hesitation read "' + acts('jam') + '"');
  }
  const topic = s.topic;
  t.repaint(true);
  await wait(50);
  const r = P().jam;
  if (!r || r.topic !== topic || r.tally.r !== 2) bad.push('a repaint threw the round away');
  if (!r || !r.ends) bad.push('a repaint left the clock stopped with the Games column still in front');
  if (text('jam').indexOf(topic) === -1) bad.push('after a repaint the card reads "' + text('jam') + '"');
  /* AWAY: the clock holds, and stays held on the way back. */
  t.go('tools', false, true);
  await wait(LEAVE_MS); await woken_();
  const held = P().jam;
  if (held.ends || held.run) bad.push('leaving the column left the clock running');
  const left = held.left;
  await wait(1200);
  t.go('games', false, true);
  await wait(LEAVE_MS); await woken_();
  if (P().jam.ends) bad.push('coming back started the clock without anybody pressing Resume');
  if (P().jam.left !== left) bad.push('the minute went on running while the column was away: ' + left + ' became ' + P().jam.left);
  if (!/Resume/.test(text('jam'))) bad.push('a paused round has no Resume: "' + text('jam') + '"');
  press('party-resume', { 'data-g': 'jam' });
  if (!P().jam.ends) bad.push('Resume did not start the clock again');
  /* AND THE END: a round whose minute is up says so and keeps its tally. */
  P().jam.ends = Date.now() + 100;
  await wait(600);
  if (P().jam.phase !== 'done' || !/Time/.test(text('jam')) || !/Repetition 2/.test(text('jam'))) {
    bad.push('a finished minute reads "' + text('jam') + '"');
  }
  return bad;
});

check('taboo shows a word with four or five forbidden words, and Correct and Pass deal the next', async () => {
  const { t, d, press, text, P } = await partyBoot_('tab');
  if (!d.getElementById('tab-card')) return ['Taboo did not draw on the Games column'];
  const bad = [];
  press('tab-start');
  const s = P().tab;
  if (!s || !s.ends) return ['Start did not begin a round'];
  const ban = d.querySelectorAll('#tab-card .tab-ban li').length;
  if (ban < 4 || ban > 5) bad.push(ban + ' forbidden words on the card');
  if (text('tab').indexOf(s.card[0]) === -1) bad.push('the word is not on the card');
  const first = s.card[0];
  press('tab-next', { 'data-got': '1' });
  press('tab-next', { 'data-got': '0' });
  if (s.score !== 1 || s.passed !== 1) bad.push('a Correct and a Pass counted ' + s.score + ' and ' + s.passed);
  if (s.card[0] === first) bad.push('Correct and Pass did not deal another word');
  t.repaint(true);
  await wait(50);
  if (P().tab !== s || !P().tab.ends) bad.push('a repaint stopped or replaced the round');
  /* PAUSED, THE WORD IS NOT ON THE CARD — whoever picks the phone up next may be on the other side. */
  t.go('tools', false, true);
  await wait(LEAVE_MS); await woken_();
  if (text('tab').indexOf(s.card[0]) !== -1) bad.push('a paused card still shows the word');
  return bad;
});

/* AND THE SAVED COLUMN IS NOT "HERE" FOR A GAME NOBODY STARRED. The first version counted the whole
   column as the Games column's twin, so a minute started on Games and swiped over to Saved went on
   running on a card that was on no screen — and Saved is the column next door. */
check('a round left for the Saved column, where it is not starred, pauses like any other leave', async () => {
  const { t, d, press, P } = await partyBoot_('tab');
  if (!d.getElementById('tab-card')) return ['Taboo did not draw on the Games column'];
  const bad = [];
  press('tab-start');
  if (!P().tab || !P().tab.ends) return ['Start did not begin a round'];
  if (d.querySelector('#s-saved #tab-card')) return ['Taboo is already on the Saved column, so this asks nothing'];
  t.go('saved', false, true);
  await wait(LEAVE_MS); await woken_();
  const s = P().tab;
  if (s.ends || s.run) bad.push('the clock went on running behind the Saved column, where the card is not');
  const left = s.left;
  await wait(800);
  if (P().tab.left !== left) bad.push('the minute ran down while the round was on no screen');
  return bad;
});

check('hot seat shows its word only once the phone faces the class, and hides it when the column goes', async () => {
  const { t, d, press, text, P } = await partyBoot_('hot');
  if (!d.getElementById('hot-card')) return ['Hot Seat did not draw on the Games column'];
  const bad = [];
  press('hot-start');
  const s = P().hot;
  if (!s) return ['Start did not begin a round'];
  if (s.ends) bad.push('the clock started before the word was shown');
  if (text('hot').indexOf(s.word) !== -1) bad.push('the word is on the screen before the phone is turned to the class');
  press('party-resume', { 'data-g': 'hot' });
  if (!s.ends || text('hot').indexOf(s.word) === -1) bad.push('Show the word did not show it and start the clock');
  press('hot-next', { 'data-got': '1' });
  if (s.score !== 1) bad.push('Got it did not count');
  const word = s.word;
  t.go('tools', false, true);
  await wait(LEAVE_MS); await woken_();
  t.go('games', false, true);
  await wait(LEAVE_MS); await woken_();
  if (text('hot').indexOf(word) !== -1) bad.push('the word is still up after leaving the column and coming back');
  if (P().hot.ends) bad.push('coming back started the clock by itself');
  return bad;
});

check('20 questions keeps the secret from the room and counts to twenty', async () => {
  const { t, d, press, text, P } = await partyBoot_('twq');
  if (!d.getElementById('twq-card')) return ['20 Questions did not draw on the Games column'];
  const bad = [];
  press('twq-start');
  const s = P().twq;
  if (!s || !s.word) return ['Start did not choose a secret'];
  if (text('twq').indexOf(s.word) !== -1) bad.push('the secret is on the screen before anybody pressed Show me');
  press('twq-show');
  if (text('twq').indexOf(s.word) === -1) bad.push('Show me did not show the secret');
  /* LEAVING WITH THE SECRET UP HIDES IT. */
  t.go('tools', false, true);
  await wait(LEAVE_MS); await woken_();
  t.go('games', false, true);
  await wait(LEAVE_MS); await woken_();
  if (text('twq').indexOf(s.word) !== -1) bad.push('the secret is still up after leaving the column');
  press('twq-show');
  press('twq-hide');
  if (text('twq').indexOf(s.word) !== -1) bad.push('the secret is on the screen while the class asks');
  for (let i = 0; i < 5; i++) press('twq-ask');
  t.repaint(true);
  await wait(50);
  if (P().twq.asked !== 5 || !/5 of 20/.test(text('twq'))) bad.push('five questions and a repaint read "' + text('twq') + '"');
  for (let i = 0; i < 20; i++) press('twq-ask');
  if (P().twq.asked !== 20 || P().twq.phase !== 'done') bad.push('the count went past twenty or did not end: ' + P().twq.asked);
  if (text('twq').indexOf(s.word) === -1 || !/Out of questions/.test(text('twq'))) bad.push('the end does not reveal the secret: "' + text('twq') + '"');
  return bad;
});

/* ---------- THE WORD GAMES ARE ONE WIDGET, AND SWITCHING GAME IS A LEAVE ---------------------------
   Asked for as "Merge word games into one widget. Like articulate and charades", and then Herd
   Mentality moved in as the eighth: "heard mentality is a word game so should go there." Three things can
   go wrong and all of them draw perfectly: the dropdown offering a game the slot cannot draw, a
   game switched away from going on running where nobody can see it, and the old game's card left
   in the slot beside the new one. */
check('the word games are one widget, and switching game pauses the one left', async () => {
  const { t, d, press, text, P } = await partyBoot_('tab');
  const bad = [];
  const ids = t.allWidgets().map(x => x.id);
  ['articulate', 'charades', 'taboo', 'hotseat', 'justaminute', 'twentyq', 'imposter', 'herd'].forEach(id => {
    if (ids.indexOf(id) !== -1) bad.push(id + ' is still a widget of its own beside Word games');
  });
  if (ids.indexOf('wordgames') === -1) return bad.concat(['there is no Word games widget']);
  const sel = d.getElementById('wg-pick');
  if (!sel) return bad.concat(['the Word games widget has no game dropdown']);
  const offered = [...sel.options].map(o => o.value);
  if (offered.length !== 8) bad.push('the dropdown offers ' + offered.length + ' games, wanted 8');
  /* HERD MENTALITY IS THE EIGHTH — "heard mentality is a word game so should go there." Asked by
     name, because a count of eight is also seven games and a stray. */
  if (offered.indexOf('herd') === -1) bad.push('Herd Mentality is not in the dropdown');
  for (const k of offered) {
    sel.value = k;
    t.ACTIONS['wg-pick'](sel);
    if (!d.getElementById(k + '-card')) bad.push('choosing ' + k + ' did not draw its card');
    const others = offered.filter(o => o !== k && d.getElementById(o + '-card'));
    if (others.length) bad.push('choosing ' + k + ' left ' + others.join(', ') + ' in the slot too');
  }
  /* AND IT DEALS IN THE SLOT, IN ITS OWN LARGE TYPE. The question is read across a table, and
     `.herd-card .herd-q` is the rule that makes it large — a wrapper without that class still draws,
     at body-text size, which no assertion about ids would notice. */
  sel.value = 'herd'; t.ACTIONS['wg-pick'](sel);
  const hq = d.querySelector('#wg-slot .herd-card #herd-q');
  if (!hq) bad.push('Herd Mentality drew without the .herd-card wrapper its question type hangs off');
  else {
    const q1 = hq.textContent.trim();
    if (!q1) bad.push('choosing Herd Mentality dealt no question');
    press('herd-next');
    const q2 = String((d.getElementById('herd-q') || {}).textContent || '').trim();
    if (!q2 || q2 === q1) bad.push('Next question did not deal another: "' + q1 + '" then "' + q2 + '"');
  }
  sel.value = 'tab'; t.ACTIONS['wg-pick'](sel);
  press('tab-start');
  const s = P().tab;
  if (!s || !s.ends) return bad.concat(['Start did not begin a Taboo round']);
  const word = s.card[0];
  sel.value = 'art'; t.ACTIONS['wg-pick'](sel);
  if (P().tab.ends || P().tab.run) bad.push('a Taboo round went on running after switching to Articulate');
  sel.value = 'tab'; t.ACTIONS['wg-pick'](sel);
  if (!d.getElementById('tab-card')) bad.push('switching back did not bring Taboo back');
  else if (text('tab').indexOf(word) !== -1) bad.push('the paused Taboo card shows its word');
  if (P().tab !== s) bad.push('switching away and back threw the Taboo round away');
  if (t.wgChosen() !== 'tab') bad.push('the chosen game is not remembered on the device');
  return bad;
});

/* ---------- ALIBI IS DELETED, AND NOTHING OF IT IS LEFT TO PRESS -------------------------------------
   Asked for as "delete alibi game." Its journey was here — a case, two suspects on two clocks, a
   verdict — and went with it. What replaces it asks the one thing a deletion can get wrong without
   anything drawing badly: a card left in the roster, or a handler left answering a button nothing
   draws any more, which is a door to nowhere that `check-doors` would only find from the other end. */
check('alibi is gone from the Games column, its handlers and its round state', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t || !t.allWidgets) return ['the widget roster is not exported'];
  const bad = [];
  if (t.allWidgets().some(x => String(x.id) === 'alibi')) bad.push('alibi is still a widget');
  ['alb-start', 'alb-next'].forEach(a => { if (t.ACTIONS[a]) bad.push(a + ' still has a handler'); });
  const P = t.PARTY();
  if (P && 'alb' in P) bad.push('PARTY still keeps a slot for an alibi round');
  t.go('games', false, true);
  await wait(LEAVE_MS); await woken_();
  if (w.document.getElementById('alb-card')) bad.push('an alibi card is still drawn on the Games column');
  return bad;
});

/* ---------- THE TIMETABLE KEEPS A WEEK, PER PERSON, ONE COLOUR A SUBJECT ----------------------------
   KEPT ON THE DEVICE, so nothing on the wire says whether it worked: a lesson that is not saved, a
   timetable shared between two students on one phone, or two subjects in one colour all draw
   perfectly. So this writes a Monday through the app's own handlers and its own `input` listener —
   the way a thumb does — and asks what comes back after a repaint, after somebody else signs in, and
   after a lesson goes.

   THREE SUBJECTS ON PURPOSE, and these three: the first version hashed a subject's letters into
   eight hues, and Chemistry and History came out the same red on the first screenshot. A rule that
   could not fail on the fault it was written for is no rule, so the fault's own pair is the case. */
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
  try { t.go('tools', false, true); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  await wait(300);
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

  /* A REPAINT REBUILDS THE MARKUP, and a timetable held only in it would be gone. THROUGH `repaint`
     AND NOTHING ELSE — the first version called `initTimetable()` straight after it, which redraws
     the widget whether or not the app's own repaint ever restarts it, so a roster entry that lost its
     `start` passed. `repaint` reaches it through `startScreen_` → `toolsStart_`, synchronously. */
  try { t.repaint(); } catch (e) { bad.push('repaint threw: ' + e.message); }
  if (rows().length !== 3) bad.push('after a repaint the timetable holds ' + rows().length + ' lessons, not 3');

  /* SOMEBODY ELSE ON THE SAME PHONE GETS THEIR OWN — again through the repaint a sign-in does. */
  t.USER(kit);
  try { t.repaint(); } catch (e) {}
  if (rows().length) bad.push('a second person signed in on the phone sees the first one\'s timetable');
  t.USER(sam);
  try { t.repaint(); } catch (e) {}
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

/* ---------- TOUCH TYPING: KEYS MOVE THE LINE, A WRONG ONE COUNTS, THE LADDER IS KEPT PER PERSON ------
   KEPT ON THE DEVICE AND TYPED, NOT TAPPED, so nothing on the wire and no `data-do` says whether it
   works. So this types the way a keyboard does — `keydown` on the focused hidden box — and the way a
   phone does — the character arriving in the box on `input` — and asks what the card draws.

   THE WINDOW LISTENER IS THE LEAK TEST. Flabby Pird's space bar and the pager's arrows listen on the
   document and the window; a printable key typed here that reached one of them is the bug the
   capture-phase stop exists for, so a listener of the journey's own on the window must hear nothing.

   AND EVERY LESSON'S LINES ARE READ FOR KEYS IT HAS NOT TAUGHT. One word list filtered per lesson is
   the design; a `t` in a home-row line is that filter gone, and only fifty lines of each would show
   it, because a line is drawn at random. */
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
  try { t.go('tools', false, true); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  await wait(300);
  /* TO ITS OWN PAGE, the way a swipe arrives: the Tools column keeps only the pages near the one
     being looked at in the document, and this card is tenth. */
  const n = w.widgetsOf_('tool').findIndex(x => String(x.id) === 'typing');
  if (n < 0) return ['there is no typing widget in the Tools roster'];
  try { t.goPage('tools', n, true); } catch (e) { return ['goPage("tools", ' + n + ') threw: ' + e.message]; }
  const box = () => d.querySelector('.kt-box');
  /* WAITED FOR, NOT SLEPT FOR. A fixed 100ms was enough on a quiet machine and failed this journey
     in roughly one run in three whenever other work shared the four CPUs — the card draws after the
     page turn's own frames, and those stretch under load. Polled up to two seconds, so a card that
     never draws still fails, and one that draws late no longer reads as a broken widget. */
  for (let i = 0; i < 40 && !(box() && box().querySelector('.kt-in')); i++) await wait(50);
  if (!box() || !box().querySelector('.kt-in')) return ['the touch-typing card did not draw on the Tools column with its box'];
  const bad = [];

  /* THROUGH `ktLesson_`, NOT `KT_LESSONS`: the app is evaluated as one block here, so its `const`s
     stay inside it and a journey reading one by name gets nothing — and an empty list here would be a
     check of nothing that passed. So an empty ladder is a failure of its own. */
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

/* ---------- THE FLYER MAKER IS AN ADMIN'S, AT EVERY DOOR ---------------------------------------------
   ASKED FOR AS *"make a flyer should only be visible to admin"*. `admin: true` on the roster entry is
   the rule and `widgetFor_` is the one place it is asked — this asks it as every other kind of
   visitor and as an admin, and then asks the two lists that draw widgets, because a rule on one door
   and not the next is the shape of every leak this repository records. The Saved column is the door
   that is easy to forget: a star is kept on the device, so a flyer starred by an admin would come
   back on the Saved column of whoever signs in on that phone next. */
check("the flyer maker is an admin's and nobody else's", async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.widgetFor || !t.allWidgets || !t.widgetsOf || !t.savedWidgets || !t.star) {
    return ['who may open a widget is not exported'];
  }
  const fly = t.allWidgets().find(x => x.id === 'flyers');
  if (!fly) return ['there is no flyer maker in the roster'];
  const bad = [];
  t.star('w:flyers');
  const visitors = [
    ['somebody signed out', null],
    ['a parent', { name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] }],
    ['a student', { name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'] }],
    ['a tutor', { name: 'Ada Tutor', personId: 'P-@ada', role: 'tutor', roles: ['tutor'] }],
  ];
  visitors.forEach(([say, u]) => {
    t.USER(u);
    if (t.widgetFor(fly)) bad.push(say + ' may open the flyer maker');
    if (t.widgetsOf('tool').some(x => x.id === 'flyers')) bad.push('the Tools column offers ' + say + ' the flyer maker');
    if (t.savedWidgets().some(x => x.id === 'flyers')) {
      bad.push('a flyer maker starred on this phone comes back on the Saved column of ' + say);
    }
  });
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'] });
  if (!t.widgetFor(fly)) bad.push('an admin may not open the flyer maker');
  if (!t.widgetsOf('tool').some(x => x.id === 'flyers')) bad.push('the Tools column does not offer an admin the flyer maker');
  if (!t.savedWidgets().some(x => x.id === 'flyers')) bad.push('an admin who starred the flyer maker does not find it on Saved');
  return bad;
});

/* ---------- VENUES ARE OFF FIND, AND A STARRED VENUE IS STILL ON SAVED -----------------------------
   ASKED FOR AS *"Get rid of booking places ... So finder now will become just learning stuff."* The
   venue kind was `Booking, Places`, a second group whose only job was to get past `FUNNEL_NOT_FOR`,
   and Find's first question read `Booking, Places | Learning | Links | Shop` — one chip with a
   comma in it. No check saw it, because `check/fixture.json` sent a `kinds` tab production does not
   have. THIS PAYLOAD SENDS NONE, which is what production sends, so the code's own groups decide.

   THREE QUESTIONS, ONE PER WAY IT CAN GO WRONG: a venue in the list Find draws; a door whose name is
   two groups joined by a comma (the code's own cell is not split by `asList_`, so a comma there is a
   chip, never two); and a venue somebody starred going missing from Saved, which reads every item
   the app holds rather than the funnel's list. */
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
  t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  t.star(all[0].key);
  const saved = t.savedPages().join('');
  if (saved.indexOf(all[0].name) === -1) {
    bad.push('"' + all[0].name + '" was starred and is not on the Saved column — taking a kind off Find '
             + 'must not take it off the list of things somebody kept. See `collItems_`.');
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
  /* ---------- A WEEK STEP IS SEVEN ROWS AND ITS `short` NAMES NONE OF THEM ------------------------
     `When?` HAS NO ROW CALLED `When` ANY MORE. The day names are the questions — Monday to Sunday,
     each with its hours in the answer column — and `short` is only the anchor `SPINE_EXTRA` pins
     `Per session` to. So the invariant is the same and what satisfies it is seven rows rather than
     one: read off `SLOT_DAYS` through the harness, because a list of day names written out here
     would be a second copy to keep in step. */
  const days = w.__t.days ? w.__t.days() : [];
  w.__t.STEPS
    .filter(s => { try { return s.options().filter(Boolean).length > 0; } catch (e) { return false; } })
    .forEach(s => {
      const want = s.week ? days : [s.short || s.id];
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
  const shape = skip => (w.__t.paper().match(/class="bk-k">[^<]*/g) || [])
    .map(x => x.split('>')[1])
    .filter(k => asked.indexOf(k) !== -1 && (!skip || skip.indexOf(k) === -1))
    .join('|');

  /* ---------- AND ONE QUESTION MAY BELONG TO ONE BRANCH, IF IT SAYS SO ------------------------
     THE INVARIANT ABOVE IS ABOUT ANSWERING, and that half is untouched: `blank` against `priced` is
     the fault this was written for — answering a level made seven rows vanish — and it is still
     compared whole.

     ACROSS THE BRANCH IT IS NARROWED TO WHAT THE CODE DECLARES. `only:` on a step says the question
     belongs to one of the two documents and the other never becomes it, which is the same sentence
     `SPINE_EXTRA` has carried since four derived rows were given the flag. Read off `BOOK_STEPS`
     rather than listed here, so the check cannot drift from the thing it is checking — and the old
     fault still fires with four names, because Subject, Level, When and Term declare nothing.

     A FLAG THAT DOES NOTHING IS WORSE THAN NO FLAG, so it is checked in both directions rather than
     merely tolerated: a branch-only question must be ON its own document and OFF the other. Without
     that, writing `only:` and forgetting to read it anywhere would quietly widen this exemption.

     ---------- AND THE TWO SHAPE COMPARISONS CANNOT FIRE ANY MORE, WHICH IS WORTH SAYING ----------
     MEASURED RATHER THAN ASSUMED, on four mutants. `stepRows_` pushes a row for EVERY step whether
     or not it is answered, and `spineRows_` then invents a dash for any spine row neither builder
     produced — so a question dropped from `stepRows_` comes straight back under the same name, and
     `fill: false` changes nothing here because no question row was ever missing to be filled. Both
     halves of the original fault are now structurally impossible: dropping Subject and Level on the
     waiting branch leaves the shape identical, and so does turning the form's `fill` off.

     `ONLY_ON` IS THE ONLY ROUTE LEFT by which a question row can vanish, which is why the live
     assertions are the two `only:` ones — the flag-does-nothing mutant is the one that fires.

     THEY ARE KEPT, for the reason `check-funnel.js` test 2 is kept after the spelling fold made it
     unfirable: this is where the invariant is written down, `!blank` still fails if the paper stops
     drawing questions at all, and both comparisons come back to life the day anything upstream
     stops guaranteeing them. What is not kept is the pretence — a rule that cannot fail under a
     confident comment about what it protects is a green light with nothing behind it. */
  /* ---------- A WEEK STEP'S ROWS ARE SHARED BY BOTH BRANCHES ON PURPOSE ---------------------------
     `avail` IS `only: 'wait'` AND IS A WEEK, so the rows it draws are Monday to Sunday — the same
     seven `slots` draws on the other branch. `SPINE` holds them once and whichever branch is live
     fills them, which is the whole reason the two weeks are never both on a card.

     SO THE FLAG CANNOT BE TESTED BY ROW NAME HERE, and pretending otherwise would be a rule that
     fires on the design. What the flag still governs for a week step is whether the step DRAWS —
     `stepWeekRows_` returns `[]` on the wrong branch — and that is what the shape comparison above
     covers: seven day rows exist on both branches and only one step ever produced them. Every
     non-week `only:` step is tested exactly as before. */
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
  [['book', bookOnly], ['wait', waitOnly]].forEach(([on, list]) => {
    list.forEach(([k, only, there]) => {
      if (only === on && !there) bad.push('"' + k + '" is declared only: ' + only
        + ' and is not on that branch\'s paper');
      if (only !== on && there) bad.push('"' + k + '" is declared only: ' + only
        + ' and is drawn on the ' + on + ' branch as well, so the flag does nothing');
    });
  });
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

/* ---------- AN UNLISTED TUTOR IS THE SERVER'S DECISION, AND THE FORM HAD ITS OWN COPY ------------
   `doGet`'s GATE IS `(listed || viewerIsAdmin)`, so a client is never SENT an unlisted tutor and the
   `t.listed !== false` this dropdown carried could only ever hide them from the one person the
   server had deliberately shown them to. Reported three times as *"i still dont see george"* about
   a tutor who was on the account column the whole time and missing from this list.

   TWO ASSERTIONS, BECAUSE THE FAULT HAS TWO HALVES. The option must be OFFERED, and its VALUE must
   still be the plain title — `priceFrom` matches `norm(t.title) === norm(tutor)`, so a decorated
   value would price the booking at the open rate with nothing on screen saying so. `label_` is what
   keeps the two apart and this is what proves it did not leak into one.

   THE PAYLOAD IS THE ADMIN'S, which is the only payload that can carry such a row. A client's copy
   has no unlisted tutor in it at all, so there is nothing here for a client-side filter to do. */
check('an unlisted tutor is offered to an admin, marked, with its value untouched', async () => {
  const { w } = boot();
  await wait(300);
  if (!w.__t.STEPS) return ['BOOK_STEPS is not exported — cannot check the form'];
  w.__t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'] });
  const D = w.__t.DATA();
  const held = (D.tutors || []).slice();
  D.tutors = held.concat([Object.assign({}, held[0] || {},
    { title: 'Switched Off', listed: false })]);
  const B = w.__t.BOOKING;
  B.how = 'Instant class'; B.loc = 'Colliers Wood Library';
  const step = w.__t.STEPS.find(s => s.id === 'tutor');
  const bad = [];
  if (!step) { D.tutors = held; return ['there is no tutor step']; }
  const opts = step.options().filter(Boolean);
  if (opts.indexOf('Switched Off') === -1) {
    bad.push('an admin is not offered the unlisted tutor: ' + JSON.stringify(opts));
  }
  const shown = step.label_ ? step.label_('Switched Off') : 'Switched Off';
  if (shown === 'Switched Off') bad.push('the unlisted tutor is offered with nothing saying so');
  if (step.label_ && step.label_('Sasha Matola') !== 'Sasha Matola') {
    bad.push('a listed tutor is marked too: ' + step.label_('Sasha Matola'));
  }
  D.tutors = held;
  return bad;
});

check('a waiting list is asked everything an instant class is, bar the four it cannot answer', async () => {
  /* ---------- THE WAITING BRANCH USED TO BE ASKED ALMOST NOTHING, AND THREE OF THOSE WERE WRONG ---
     REPORTED AS *"it doesnt let choosing a subject even though im trying to start a NEW waitlist",
     "it also doesnt let me select number of extra seats for waitlist session", "it also doesnt let
     me select which terms."* All three steps returned `[]` when `isWaiting_()`, and an empty option
     list is how `stepLocked_` GREYS a row — so the questions were not merely unasked, they were
     drawn, greyed, holding whatever the instant branch had left in them.

     THIS CHECK ASSERTED THAT AS THE DESIGN. It is the same journey pointed the other way now: four
     steps genuinely cannot be answered on a list, and everything else must be.

     THE FOUR, AND EACH FOR ITS OWN REASON. `tutor` — who teaches a list is settled when it fills.
     `slots` — an hour grid needs a day, and there is no day until it fills; `avail` asks the same
     question in blocks instead. `split` — the other seats are for whoever joins, so there is nobody
     to invite. `kids` — seeded here with no children on the account, so it is off both lists and is
     not what this journey is about. */
  const { w } = boot();
  await wait(300);
  if (!w.__t.STEPS) return ['BOOK_STEPS is not exported — cannot check the form'];
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const B = w.__t.BOOKING;
  /* THE TWO KINDS READ OFF THE STEP, not typed here — the sister journey below records what two
     invented strings cost when the labels changed underneath them. */
  const kinds = (w.__t.STEPS.find(s => s.id === 'how') || { options: () => [] }).options();
  const waitLabel = kinds.filter(k => /wait/i.test(k))[0];
  const nowLabel = kinds.filter(k => !/wait/i.test(k))[0];
  if (!waitLabel || !nowLabel) return ['the Kind question does not offer both kinds — not a pass'];
  const askedFor = how => {
    B.how = how; B.loc = 'Colliers Wood Library'; B.tutor = '';
    return w.__t.STEPS.filter(s => s.id !== 'how')
      .filter(s => { try { return s.options().filter(Boolean).length > 0; } catch (e) { return false; } })
      .map(s => s.id);
  };
  const bad = [];
  const session = askedFor(nowLabel);
  const klass = askedFor(waitLabel);
  ['subjects', 'level', 'loc', 'slots', 'interval', 'n'].forEach(id => {
    if (!session.includes(id)) bad.push('a session is not asked "' + id + '"');
  });
  ['tutor', 'slots', 'split'].forEach(id => {
    if (klass.includes(id)) bad.push('a list is asked "' + id + '", which it cannot answer');
  });
  ['subjects', 'n', 'interval', 'loc', 'level'].forEach(id => {
    if (!klass.includes(id)) bad.push('a list is not asked "' + id + '", which it can answer');
  });

  /* ---------- AND THE ONE LOCKED ROW SAYS WHAT IT WILL BE SUBMITTED AS ---------------------------
     REPORTED AS *"it just defualts to sasha motola and wont let change. it should defualt to no
     preference and not be able to change."* Two halves: the row must stay locked, and what it shows
     must be `No preference` rather than whatever the instant branch left behind.

     SEEDED THROUGH THE HANDLER RATHER THAN BY WRITING `BOOKING.tutor`, because clearing it is the
     handler's job and asserting the fallback with the cell already empty would prove nothing. */
  /* THROUGH THE REAL `change` LISTENER, because `book-set` is not an `on()` action — a select is
     answered by choosing, which fires `change` and never a click, so it is bound on the document
     rather than in `ACTIONS`. A harness that wrote `BOOKING.tutor = ''` itself would be asserting
     its own line. */
  B.how = nowLabel; B.tutor = 'Sasha Matola';
  const sel = w.document.createElement('select');
  sel.setAttribute('data-do', 'book-set');
  sel.setAttribute('data-step', 'how');
  const opt = w.document.createElement('option');
  opt.value = waitLabel; opt.textContent = waitLabel;
  sel.appendChild(opt); sel.value = waitLabel;
  w.document.body.appendChild(sel);
  try { sel.dispatchEvent(new w.Event('change', { bubbles: true })); }
  catch (e) { bad.push('choosing the waiting kind threw: ' + e.message); }
  sel.remove();
  if (!/wait/i.test(String(B.how || ''))) {
    bad.push('choosing ' + JSON.stringify(waitLabel) + ' did not set the kind — not a pass');
  }
  const tutor = w.__t.STEPS.find(s => s.id === 'tutor');
  if (!tutor) bad.push('there is no tutor step');
  else {
    if ((tutor.options() || []).filter(Boolean).length) {
      bad.push('a waiting list offers a tutor to choose, and who teaches one is settled when it fills');
    }
    const fb = tutor.fallback ? String(tutor.fallback() || '') : '';
    if (fb !== 'No preference') {
      bad.push('a waiting list\'s tutor row falls back to ' + JSON.stringify(fb) + ', not "No preference"');
    }
    if (B.tutor) {
      bad.push('switching to a waiting list keeps the tutor ' + JSON.stringify(B.tutor)
               + ', so the locked row prints it instead of the fallback');
    }
  }
  return bad;
});

check('picking several answers is one open, hanging off the field, over nothing', async () => {
  /* ---------- FOUR SHAPES OF ONE CONTROL, THREE OF THEM REPORTED ---------------------------------
     A `<select>` closed when you chose — that is what choosing means to it — so a question taking
     three answers was three opens, three scrolls and three closes: *"thats long."* A sheet was next
     and came back as *"i dont like this. this is shit. no pop up menus."* A page that REPLACED the
     form was third: *"i hate this."*

     SO THERE ARE THREE THINGS TO ASSERT AND THEY PULL AGAINST EACH OTHER. The list must stay open
     across ticks; nothing may open over the app; and the form must still be on its page while the
     list is up. A check asking only the first passes on both rejected shapes, and a check asking the
     first two passes on the page-replacement — which is how the last version of this journey went
     green over the thing that was about to be reported.

     `check/ui.js` CANNOT ASK ANY OF THEM. It measures whether a control can be read and hit, and a
     select that closes after every pick measures perfectly. `check/press.js` presses each action
     once and asks whether anything changed, which is true of all four shapes.

     ON THE BOOKING COLUMN, because the panel is `#drop` outside the screens and `dropRow_` will not
     open it unless the field is on the screen somebody is on and the page in front of them — which
     is the guard that stops a fixed box hanging in front of a column that has slid away. Driving the
     handlers on a screen nobody is on would prove nothing about any of it.

     THROUGH THE APP'S OWN HANDLERS, so the toggle, the panel and the re-render are the ones that
     ship — a harness rewriting `BOOKING.interval` itself would prove nothing about them. */
  const { w } = boot();
  await wait(300);
  const A = w.__t.ACTIONS || {};
  if (!A['book-many'] || !A['book-many-pick'] || !A['book-many-done']) {
    return ['book-many / book-many-pick / book-many-done are not registered — cannot check the list'];
  }
  if (!w.__t.bookerCard) return ['bookerCard is not exported — cannot see what the page holds'];
  const panel = w.document.getElementById('drop');
  if (!panel) return ['#drop is not in index.html — the list has nowhere to hang'];
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const B = w.__t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  /* `repaint()` BEFORE `go`, because `paintNeighbours` skips a screen that already has markup and
     the booking column was drawn at boot while nobody was signed in — so without this the column
     is still the "Sign in to book" card and the field the list hangs off is not in the document.
     That is `STALE`'s whole job and the app does the same thing when somebody signs in. */
  try { w.__t.repaint(true); } catch (e) { return ['repaint() threw: ' + e.message]; }
  try { w.__t.go('booking', false, true); } catch (e) { return ['go("booking") threw: ' + e.message]; }
  await wait(120);
  const step = (w.__t.STEPS || []).filter(x => x.multi && !x.grid)
    .filter(x => { try { return x.options().filter(Boolean).length >= 2; } catch (e) { return false; } })[0];
  if (!step) return ['no multiple-answer question offers two options — cannot check the list'];
  const opts = step.options().filter(Boolean);
  const bad = [];

  const open = () => !panel.classList.contains('hidden');
  const list = () => String(panel.innerHTML || '');
  const marked = () => (list().match(/class="btn quiet pick-opt on"/g) || []).length;
  const sheetOpen = () => !w.document.getElementById('sheet').classList.contains('hidden');
  /* THE FORM, ON ITS OWN PAGE, WHICHEVER STATE THE LIST IS IN — the page-replacement half. */
  const formUp = () => String(w.__t.bookerCard() || '').indexOf('id="bookr"') !== -1;

  A['book-many']({ dataset: { step: step.id } });
  if (!open()) bad.push('pressing the "' + step.id + '" row does not open the list');
  if (list().indexOf('pick-list') === -1) {
    bad.push('the list opens holding ' + JSON.stringify(list().slice(0, 80)) + ' rather than options');
  }
  if (sheetOpen()) bad.push('the "' + step.id + '" row opens a sheet over the app');
  if (!formUp()) bad.push('opening the list takes the form off its page');
  const drawn = (list().match(/data-do="book-many-pick"/g) || []).length;
  if (drawn !== opts.length) {
    bad.push('the list draws ' + drawn + ' options for a question with ' + opts.length);
  }

  /* TWO TICKS WITHOUT REOPENING — which is the whole of what was asked for. */
  A['book-many-pick']({ dataset: { step: step.id, val: opts[0] } });
  if (!open()) bad.push('ticking an answer closes the list, so the next one is another open');
  A['book-many-pick']({ dataset: { step: step.id, val: opts[1] } });
  if (!open()) bad.push('ticking a second answer closes the list');
  if (!formUp()) bad.push('ticking an answer takes the form off its page');
  if ((B[step.id] || []).length !== 2) {
    bad.push('two ticks left ' + JSON.stringify(B[step.id]) + ' rather than two answers');
  }
  if (marked() !== 2) {
    bad.push('the list shows ' + marked() + ' options marked, not the two that are chosen');
  }

  /* AND TICKING AGAIN TAKES ONE OFF, which is what the dropdown always did and must not be lost. */
  A['book-many-pick']({ dataset: { step: step.id, val: opts[0] } });
  if ((B[step.id] || []).length !== 1) {
    bad.push('ticking a chosen answer again does not take it off: ' + JSON.stringify(B[step.id]));
  }

  /* ---------- AND THERE IS A WAY OUT, WHICH A DROP-DOWN HAS THREE OF ------------------------------
     DONE, THE ROW AGAIN, AND A TAP ANYWHERE ELSE. The third is `#drop-back` carrying the same
     action, so it is the same handler and there is nothing separate to keep in step. */
  A['book-many-done']({ dataset: {} });
  if (B.picking) bad.push('Done leaves BOOKING.picking set to ' + JSON.stringify(B.picking));
  if (open()) bad.push('Done leaves the list open');
  if (list().indexOf('pick-list') !== -1) bad.push('Done leaves the options in #drop');
  if (!formUp()) bad.push('the form is not on its page once the list has closed');

  A['book-many']({ dataset: { step: step.id } });
  A['book-many']({ dataset: { step: step.id } });
  if (open()) bad.push('pressing the open row again does not shut the list');

  const back = w.document.getElementById('drop-back');
  if (!back) bad.push('#drop-back is not in index.html — a tap outside cannot close the list');
  else if (back.getAttribute('data-do') !== 'book-many-done') {
    bad.push('#drop-back carries ' + JSON.stringify(back.getAttribute('data-do'))
             + ' rather than the action that closes the list');
  }

  /* ---------- AND THE ROW IS WHAT OPENS IT, WHICH THE REST OF THIS CANNOT SAY -------------------
     THE FIRST VERSION CALLED THE HANDLERS AND NOTHING ELSE, so putting the row back to a `<select>`
     left every assertion above green: the panel still opened, because the journey opened it. A
     check that cannot fail on the fault it was written for is the shape this file has deleted one
     of — measured by mutation, which is the only way to know.
     THREE THINGS OF THE CONTROL: it carries the action, it reads back what has been ticked — the
     button is the only label on the row — and it says whether the list is up, which is the one fact
     a screen reader cannot get from anywhere else now that the panel is outside this markup. */
  const row = String(w.__t.control ? w.__t.control(step) : '');
  if (!w.__t.control) bad.push('stepControl_ is not exported — the row itself cannot be checked');
  else {
    if (row.indexOf('data-do="book-many"') === -1) {
      bad.push('the "' + step.id + '" row does not open the list — it draws '
               + JSON.stringify(row.slice(0, 80)));
    }
    if (row.indexOf(opts[1]) === -1) {
      bad.push('the row does not say what is chosen: ' + JSON.stringify(row.slice(0, 120)));
    }
    if (row.indexOf('aria-expanded') === -1) {
      bad.push('the row does not say whether the list is open');
    }
  }
  return bad;
});

/* ---------- A SINGLE-CHOICE SELECT OPENS THE SAME PANEL AND CLOSES ON THE PICK ---------------------
   ASKED FOR AS *"should be consistent with the booking multiselect drop down list"*. Every ordinary
   `<select>` now hangs `#drop` instead of opening the platform's picker — see `SEL_OK` in book.js.
   What can break, and what nothing else here can see, is the contract with the callers that were
   deliberately not touched: they listen for `change` on a real select, so the pick has to set the
   select's value and fire `change` exactly once — twice would recompute a price twice and swap a
   qualification box twice, none would be a pick that did nothing. And a disabled select must open
   nothing, or a locked booking row and every field `send_` holds still become pressable again.

   `check/ui.js` CANNOT ASK ANY OF IT: a panel that never opens measures perfectly, and so does a
   select that opens its native wheel. So this drives the real booking column with a click AT the
   select and a click on an option, through the app's own dispatcher — and asks the label route on
   the settings column, because a tap on a `.field`'s caption is the one way a finger can still
   reach a select whose own box takes no pointer. */
check('a single-choice select opens the booking panel, and choosing closes it with one change', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const panel = d.getElementById('drop');
  if (!panel) return ['#drop is not in index.html — a select has nowhere to hang its list'];
  if (typeof w.selOpen_ !== 'function') return ['selOpen_ is not declared, so NOTHING was checked — not a pass'];
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  try { w.__t.repaint(true); w.__t.go('booking', false, true); } catch (e) { return ['opening booking threw: ' + e.message]; }
  await wait(120);
  const bad = [];
  const open = () => !panel.classList.contains('hidden');
  const pick = () => d.querySelector('#bookr select.bk-sel:not(:disabled)');
  let sel = pick();
  if (!sel) return ['the booking form draws no enabled select — cannot check the panel'];
  const stepId = sel.dataset.step;
  let changes = 0;
  d.addEventListener('change', e => { if (e.target && e.target.dataset && e.target.dataset.step === stepId) changes++; });

  /* THE TAP. Its default has to be prevented, or a `<label>`'s activation focuses the select and a
     focused select is exactly what iOS opens its own wheel for. */
  const tap = el => { const ev = new w.MouseEvent('click', { bubbles: true, cancelable: true }); el.dispatchEvent(ev); return ev; };
  const ev = tap(sel);
  if (!open()) bad.push('a click on the "' + stepId + '" select does not open #drop');
  if (!ev.defaultPrevented) bad.push('the click that opened the panel was not prevented, so the platform picker can open as well');
  if (panel.dataset.owner !== 'sel') bad.push('the panel is owned by ' + JSON.stringify(panel.dataset.owner) + ', not by the select');
  if (!panel.querySelector('[role="listbox"]')) bad.push('the open panel has no role="listbox"');
  const btns = [...panel.querySelectorAll('[data-do="sel-pick"]')];
  /* EVERY OPTION BUT A BLANK THAT ONLY REPEATS ANOTHER'S WORDS — see `selHtml_`. */
  const said = o => String(o.label || o.text || '').trim();
  const want = [...sel.options].filter(o => !o.hidden && !(o.value === '' && !o.selected && said(o)
    && [...sel.options].some(x => x !== o && x.value !== '' && said(x) === said(o)))).length;
  if (btns.length !== want) bad.push('the panel draws ' + btns.length + ' options for a select with ' + want);
  if (!btns.every(b => /\bpick-opt\b/.test(b.className) && b.getAttribute('role') === 'option')) {
    bad.push('the options are not `.pick-opt` with role="option" — not the booking list\'s rows');
  }
  const marked = btns.filter(b => b.getAttribute('aria-selected') === 'true');
  if (marked.length !== 1 || Number(marked[0].dataset.i) !== sel.selectedIndex) {
    bad.push('the panel marks ' + marked.length + ' options as chosen, not the one the select holds');
  }
  if (sel.getAttribute('aria-expanded') !== 'true') bad.push('the select does not say its list is open (aria-expanded)');

  /* PICK A DIFFERENT ONE, THROUGH THE DISPATCHER. */
  const other = btns.find(b => Number(b.dataset.i) !== sel.selectedIndex && !b.disabled);
  if (!other) bad.push('no second option to choose — the pick was NOT checked');
  else {
    const val = other.dataset.v;
    tap(other);
    await wait(30);
    if (open()) bad.push('choosing an option leaves the panel open');
    if (changes !== 1) bad.push('choosing an option fired change ' + changes + ' times, not once');
    sel = pick();
    if (!sel || sel.value !== val) bad.push('choosing ' + JSON.stringify(val) + ' left the select holding ' + JSON.stringify(sel && sel.value));
    if (String(w.__t.BOOKING[stepId] || '') !== val) {
      bad.push('the booking handler never heard the pick: BOOKING.' + stepId + ' is ' + JSON.stringify(w.__t.BOOKING[stepId]));
    }
  }

  /* THE SAME ANSWER AGAIN IS NOT A CHANGE, as a native select does not fire one. */
  sel = pick();
  if (sel) {
    tap(sel);
    const same = panel.querySelector('[data-do="sel-pick"][aria-selected="true"]');
    const before = changes;
    if (same) tap(same);
    if (changes !== before) bad.push('choosing the answer already chosen fired change');
    if (open()) bad.push('choosing the answer already chosen leaves the panel open');
  }

  /* A TAP OUTSIDE SHUTS IT, through `#drop-back` and the action it already carries. */
  sel = pick();
  if (sel) {
    tap(sel);
    if (!open()) bad.push('the select does not open a second time');
    tap(d.getElementById('drop-back'));
    if (open()) bad.push('a tap outside does not shut the panel');
    if (sel.getAttribute('aria-expanded') === 'true') bad.push('a shut panel leaves the select saying it is open');
  }

  /* A DISABLED SELECT OPENS NOTHING. */
  sel = pick();
  if (sel) {
    sel.disabled = true;
    tap(sel);
    if (open()) bad.push('a disabled select opens the panel');
    sel.disabled = false;
  }

  /* THE CAPTION OF A `.field` IS A WAY IN TOO — the settings column's fields are selects in labels. */
  try { w.__t.go('settings', false, true); w.paint('settings'); } catch (e) { bad.push('drawing settings threw: ' + e.message); return bad; }
  await wait(60);
  const pages = [...d.querySelectorAll('#s-settings > .page')];
  const at = pages.findIndex(p => p.querySelector('label.field > select:not(:disabled)'));
  if (at < 0) bad.push('no settings page carries a select in a label — the label route was NOT checked');
  else {
    w.__t.goPage('settings', at, true);
    const lab = pages[at].querySelector('label.field > select:not(:disabled)').parentNode;
    const ev2 = tap(lab);
    if (!open()) bad.push('a tap on a select\'s label does not open the panel');
    if (!ev2.defaultPrevented) bad.push('a tap on a select\'s label was not prevented, so its activation can focus the select');
    w.bookDropShut_();
    if (open()) bad.push('Escape (bookDropShut_) does not shut a select\'s panel');
  }
  return bad;
});

check('a class books through joinWaitlist, a session through createJob', async () => {
  /* ---------- THE TWO KINDS ARE READ OFF THE STEP, NOT TYPED HERE ------------------------------
     THIS SEEDED `'A session of your own'` AND `'A shared class — join the waiting list'`, and the
     Kind question has offered `Instant class` and `Waiting list class` for months. It went on
     passing because `isWaiting_` is a substring test for "wait" and the old label happened to carry
     one — so both branches really were exercised, by luck, on two strings nobody can choose.

     THAT IS A CHECK MEASURING A STATE THE APP CANNOT BE IN, which is this file's own recurring
     fault seen from the instrument's side. The step's `options()` is the one list the form offers;
     `isWaiting_` still decides which is which, so the mapping cannot go stale either. */
  const bad = [];
  const { w: w0 } = boot();
  await wait(300);
  const kind = (w0.__t.STEPS || []).find(s => s.id === 'how');
  if (!kind) return ['the Kind step is not in BOOK_STEPS — cannot check the send paths'];
  const kinds = kind.options().filter(Boolean);
  if (kinds.length !== 2) return ['the Kind question offers ' + kinds.length + ' answers, not 2'];
  const pairs = kinds.map(k => [k, /wait/i.test(k) ? 'joinWaitlist' : 'createJob']);
  if (new Set(pairs.map(p => p[1])).size !== 2) {
    return ['both Kind answers take the same send path: ' + JSON.stringify(pairs)];
  }
  for (const [how, action] of pairs) {
    const { w, sent } = boot();
    await wait(300);
    w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
    const B = w.__t.BOOKING;
    Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
    B.how = how; B.level = 'GCSE'; B.loc = 'Colliers Wood Library';
    B.subjects = ['Maths']; B.n = '1'; B.hosting = 'No — we book the room';
    B.slots = ['m16']; B.interval = ['Autumn 1']; B.avail = ['Weekday evenings'];
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

check('a booking over several days reads in the week\'s own order', async () => {
  /* ---------- THE RUNS CAME BACK ALPHABETICALLY BY THEIR CODE PREFIX ---------------------------
     `bookRuns` SORTED `a.day.localeCompare(b.day)` OVER `m / tu / w / th / f / sa / su`, which is
     Friday, Monday, Saturday, Sunday, Thursday, Tuesday, Wednesday. A Monday-and-Friday booking —
     the commonest two-day shape there is — came back `Friday, Monday`.

     THREE THINGS ARE TAKEN FROM THE FIRST RUN, so it was never only the reading order: the day list
     goes into the job's `weekday` cell, `time` becomes `start_time`, and `hours` becomes
     `hours_per_session`, which `priceLooksWrong` measures the total against. A Monday 10-12 with a
     Friday 16-18 recorded its start as 16:00.

     THE TOTAL IS UNAFFECTED and that is exactly why nothing caught it: the money is built from
     `hoursPerWeek` and the real session dates, both sums over every run, so every figure on the
     card was right while the day and the time beside them were not.

     THE RULE RATHER THAN THE INSTANCE. `blockSay_` already orders the waiting list's week off
     `SLOT_DAYS` with a note saying why; the hour week kept the old sort. This is what makes the
     next one fail instead of being noticed. */
  const { w } = boot();
  await wait(300);
  if (!w.__t.spec) return ['bookSpec is not exported — cannot check the day order'];
  const B = w.__t.BOOKING;
  const bad = [];

  [['Monday and Friday', ['m10', 'm11', 'f16', 'f17'], 'Monday, Friday', '10:00'],
   ['Thursday and Saturday', ['th14', 'sa10'], 'Thursday, Saturday', '14:00'],
   ['three days', ['m10', 'm11', 'w15', 'f9', 'f10', 'f11'], 'Monday, Wednesday, Friday', '10:00'],
   ['Sunday and Monday', ['su12', 'm9'], 'Monday, Sunday', '09:00'],
  ].forEach(([name, slots, day, time]) => {
    B.slots = slots;
    const s = w.__t.spec();
    if (s.day !== day) bad.push(name + ': the days read "' + s.day + '", wanted "' + day + '"');
    if (s.time !== time) bad.push(name + ': the session starts "' + s.time + '", wanted "' + time + '"');
  });
  B.slots = [];
  return bad;
});

check('a refusal is a toast and never a banner that outlives it', async () => {
  /* ==================================================================================================
     REPORTED AS *"I don't like how name or pin not recognised is a banner. It should be like the
     other pop ups that come up at the bottom of screen."* Measured before it was changed: a wrong
     PIN put a gold bar across the top of the app — **and it was still there after signing in
     correctly**, because `banner('')` is called in exactly two places and neither is on that path.

     `why_` RAISED IT FOR ALL THIRTEEN OF ITS CALLERS, so this was never only the sign-in card: every
     failed write in the app left a standing alarm. Eight of the thirteen already toasted the same
     sentence, so the banner was a second copy at alarm volume that outlived what it was about.

     THE RULE IS THE DISTINCTION RATHER THAN THE SCREEN. A banner is for a STANDING condition — the
     sheet is missing columns, the questions did not load, a newer build is ready — each true until
     something changes. A refused action is a MOMENT. So: the sentence must be on the screen, and
     the banner must not be the thing carrying it.

     DRIVEN THROUGH THE APP'S OWN DOOR: the stub refuses the POST, `do-signin` runs, and what is
     asserted is what a person would see. */
  const { w } = boot({ reply: { success: false, error: 'Name or PIN not recognised.' } });
  await wait(300);
  const t = w.__t;
  const bad = [];
  t.USER(null);
  t.go('account', false, true);
  await wait(120);
  const d = w.document;
  const name = d.getElementById('in-name'), pin = d.getElementById('in-pin');
  if (!name || !pin) return ['the sign-in card is not on the account column, so nothing can be refused'];
  name.value = 'Nobody'; pin.value = '9999';
  const btn = d.querySelector('[data-do="do-signin"]');
  if (!btn) return ['there is no Sign in button to press'];
  /* ---------- WHAT THE BANNER SAID BEFORE, BECAUSE A STANDING ONE IS CORRECT -------------------
     THE FIXTURE RAISES ONE AT BOOT — its `version` is `test`, so `load()` warns that the
     deployment cannot do half the actions, which is exactly the standing condition a banner is
     for. A rule that asked "is any banner up" would have been red on that and taught nobody
     anything. The question is whether the REFUSAL raised one, so it is the change that is read. */
  const bannerWas = (() => { const b = d.getElementById('banner');
    return b && !b.classList.contains('hidden') ? String(b.textContent || '') : ''; })();
  try { t.ACTIONS['do-signin'](btn); } catch (e) { return ['do-signin threw: ' + e.message]; }
  await wait(400);

  const toastEl = d.getElementById('toast');
  const said = toastEl ? String(toastEl.textContent || '') : '';
  if (!/not recognised/i.test(said)) {
    bad.push('the refusal is not in a toast (the toast says ' + JSON.stringify(said) + ')');
  }
  const ban = d.getElementById('banner');
  const shown = ban && !ban.classList.contains('hidden') ? String(ban.textContent || '') : '';
  if (shown !== bannerWas) {
    bad.push('the refusal changed the banner to ' + JSON.stringify(shown)
             + (bannerWas ? ' (it said ' + JSON.stringify(bannerWas) + ' before)' : ''));
  }

  /* AND NOTHING IS LEFT ON THE CARD. `#in-said` carried a third copy — a faint line under the
     button — and it is gone; a rule that only checked the banner would let it come back. */
  if (d.getElementById('in-said')) bad.push('#in-said is back, so the sentence is on screen twice');
  return bad;
});

check('the sign-in card is one tile row, and Make an account posts register', async () => {
  /* ==================================================================================================
     ASKED FOR AS *"turn the sign in and forgot pin buttons into tiles. same with create account
     button."* Three things are held here, because each one broke or never existed before:
       - the three actions are TILES in ONE row on the sign-in card, and the old `No account yet?`
         card is gone (two doors to one room is the thing this app keeps removing);
       - the create-account tile OPENS something. It toasted "Registration is the next thing to
         wire" and posted nothing, which a press-sweep reads as "something happened";
       - a filled sheet posts `register` with the four fields the backend requires, by the names
         dopost.gs reads (`first_name`, `last_name`, `email`, `pin`) — and a PIN the backend would
         refuse is refused here BEFORE anything goes on the wire. */
  const { w, sent } = boot({ reply: b => b.action === 'register'
    ? { success: true, name: 'Rae Newcomer', pending: true } : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  t.go('account', false, true);
  await wait(120);
  const row = d.querySelector('#s-account .tile-row');
  const acts = row ? [...row.querySelectorAll('.tile')].map(x => x.dataset.do) : [];
  if (acts.join(',') !== 'do-signin,forgot-pin,register') {
    bad.push('the sign-in card\'s tile row holds ' + JSON.stringify(acts) + ', wanted do-signin, forgot-pin, register');
  }
  const loose = [...d.querySelectorAll('#s-account [data-do="do-signin"], #s-account [data-do="forgot-pin"], #s-account [data-do="register"]')]
    .filter(x => !x.classList.contains('tile'));
  if (loose.length) bad.push(loose.length + ' sign-in control(s) are still not tiles: ' + loose.map(x => x.dataset.do).join(', '));
  if (row && [...row.querySelectorAll('.tile')].some(x => !x.querySelector('svg.tile-i'))) {
    bad.push('a sign-in tile has no mark — TILE_ICONS is missing one of in, key, join');
  }

  /* ENTER STILL SIGNS IN — the listener clicks `[data-do="do-signin"]`, whatever element that is. */
  const name = d.getElementById('in-name'), pin = d.getElementById('in-pin');
  if (name && pin) {
    name.value = 'x@example.org'; pin.value = '0000';
    sent.length = 0;
    pin.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await wait(300);
    if (!sent.some(b => b.action === 'verifyLogin')) bad.push('Enter in the PIN box posted ' + JSON.stringify(sent.map(b => b.action)) + ', not verifyLogin');
    t.USER(null); t.go('account', false, true); try { w.paint('account'); } catch (e) {} await wait(80);
  } else bad.push('the sign-in card has no #in-name / #in-pin');

  const reg = d.querySelector('#s-account [data-do="register"]');
  if (!reg) return bad.concat(['there is no Make an account tile to press']);
  t.ACTIONS['register'](reg);
  await wait(50);
  const sheet = d.getElementById('sheet');
  if (!sheet || sheet.classList.contains('hidden')) return bad.concat(['pressing Make an account opened no sheet']);
  const fill = (id, v) => { const el = d.getElementById(id); if (el) el.value = v; return !!el; };
  if (!['reg-first', 'reg-last', 'reg-email', 'reg-pin'].every(id => fill(id, ''))) {
    return bad.concat(['the register sheet is missing one of its four boxes']);
  }
  const go_ = d.querySelector('#sheet-body [data-do="reg-send"]');
  if (!go_) return bad.concat(['the register sheet has no button']);
  /* WHO IT IS FOR, FIRST — the journey after this one asks the question itself; here it is answered
     so the rest of the form can be asked about. */
  const asStudent = d.querySelector('#sheet-body [data-do="reg-who"][data-who="student"]');
  if (!asStudent) return bad.concat(['the register sheet does not ask who the account is for']);
  t.ACTIONS['reg-who'](asStudent);

  /* A BAD PIN, REFUSED ON THE PHONE. Three digits and a letter are both things the server refuses. */
  fill('reg-first', 'Rae'); fill('reg-last', 'Newcomer'); fill('reg-email', 'rae@example.org');
  for (const p of ['123', '12a4', '123456789']) {
    fill('reg-pin', p);
    sent.length = 0;
    t.ACTIONS['reg-send'](go_);
    await wait(200);
    if (sent.some(b => b.action === 'register')) bad.push('a PIN of "' + p + '" was posted — the backend refuses it, so the phone should');
  }

  fill('reg-pin', '0000');
  sent.length = 0;
  t.ACTIONS['reg-send'](go_);
  await wait(300);
  const post = sent.find(b => b.action === 'register');
  if (!post) bad.push('a filled sheet posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no register');
  else {
    const want = { who: 'student', first_name: 'Rae', last_name: 'Newcomer', email: 'rae@example.org', pin: '0000' };
    Object.keys(want).forEach(k => { if (post[k] !== want[k]) bad.push('register carried ' + k + ' = ' + JSON.stringify(post[k]) + ', wanted ' + JSON.stringify(want[k])); });
  }
  if (!sheet.classList.contains('hidden')) bad.push('the sheet is still open after the account was made');
  const said = String((d.getElementById('toast') || {}).textContent || '');
  if (!/link/i.test(said)) bad.push('after registering the toast says ' + JSON.stringify(said) + ' — nothing about the emailed link');
  return bad;
});

check('arriving on ?verify= confirms the address once and takes it out of the bar', async () => {
  /* ==================================================================================================
     `register` MAILS `?verify=<token>` AND, BEFORE THIS, NOTHING ON THE SITE READ IT. Every account
     made from the form stayed PENDING and `verifyLogin` refuses PENDING — so the journey above would
     have passed on an account nobody could ever sign into. This starts the app on that address. */
  const { w, sent } = boot({ url: 'https://example.org/?verify=Vabc123&post=P9',
    reply: b => b.action === 'verifyEmail' ? { success: true, name: 'Rae Newcomer' } : { success: true } });
  await wait(400);
  const bad = [];
  const posts = sent.filter(b => b.action === 'verifyEmail');
  if (posts.length !== 1) bad.push('booting on ?verify= posted verifyEmail ' + posts.length + ' time(s), wanted once');
  else if (posts[0].token !== 'Vabc123') bad.push('verifyEmail carried token ' + JSON.stringify(posts[0].token) + ', wanted "Vabc123"');
  /* SINGLE-USE ON THE SERVER, so a refresh must not send it again. The rest of the address stays. */
  const q = String(w.location.search);
  if (/verify=/.test(q)) bad.push('the token is still in the address (' + q + '), so a refresh posts it again');
  if (!/post=P9/.test(q)) bad.push('taking the token out also took the rest of the address (' + q + ')');
  const said = String((w.document.getElementById('toast') || {}).textContent || '');
  if (!/confirmed/i.test(said)) bad.push('after verifying the toast says ' + JSON.stringify(said));

  /* AND AN ORDINARY START POSTS NOTHING OF THE KIND. */
  const plain = boot({});
  await wait(300);
  if (plain.sent.some(b => b.action === 'verifyEmail')) bad.push('an ordinary start posted verifyEmail');
  return bad;
});

/* ==================================================================================================
   EVERY WAY A CHILD GETS IN, ON THE SCREEN. *"so all kids can login easily with their handle and
   pin."* `check-signin.js` asks the backend through the real `doPost`; these ask the phone's half —
   that the form posts what the backend reads, that the answer is put where the child will look, and
   that the tiles are drawn for the people the server will say yes to and nobody else.
================================================================================================== */
check('a child with no email makes their own account with a grown-up\'s address, and is handed their handle', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'register'
    ? (b.parent_email ? { success: true, name: 'Ben Mum', pending: true, handle: 'ben_kind42', confirmBy: 'grown-up' }
                      : { success: true, name: 'Rae Newcomer', pending: true, handle: 'rae_kind43', confirmBy: 'self' })
    : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  t.go('account', false, true);
  await wait(120);
  const open = () => { const reg = d.querySelector('#s-account [data-do="register"]'); if (reg) t.ACTIONS['register'](reg); return !!reg; };
  if (!open()) return ['there is no Make an account tile to press'];
  await wait(50);
  const fill = (id, v) => { const el = d.getElementById(id); if (el) el.value = v; return !!el; };
  /* A STUDENT — the grown-up's-email tick is theirs alone (see the next journey for the parent). */
  const student = () => { const b = d.querySelector('#sheet-body [data-do="reg-who"][data-who="student"]'); if (b) t.ACTIONS['reg-who'](b); return !!b; };
  if (!student()) return ['the register sheet does not ask who the account is for'];
  const tick = d.getElementById('reg-noemail');
  if (!tick) return ['the register sheet has no "I have no email" tick, so a child with no address has no way in'];
  if (tick.closest('label.check') === null) bad.push('the no-email tick is not the app\'s own .check control');
  fill('reg-first', 'Ben'); fill('reg-last', 'Mum'); fill('reg-email', 'mum@example.org'); fill('reg-pin', '0000');
  tick.checked = true;
  sent.length = 0;
  t.ACTIONS['reg-send'](d.querySelector('#sheet-body [data-do="reg-send"]'));
  await wait(300);
  const post = sent.find(b => b.action === 'register');
  if (!post) return bad.concat(['the ticked form posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no register']);
  if (post.parent_email !== 'mum@example.org') bad.push('the grown-up\'s address went as ' + JSON.stringify(post.parent_email) + ', not parent_email');
  if (post.email) bad.push('the grown-up\'s address was ALSO sent as the child\'s own email — it would be their sign-in address');
  const box = d.getElementById('in-name');
  if (!box || box.value !== '@ben_kind42') bad.push('after registering with no email the sign-in box holds ' + JSON.stringify(box && box.value) + ' — not the handle the child signs in with');
  const said = String((d.getElementById('toast') || {}).textContent || '');
  if (!/@ben_kind42/.test(said) || !/grown-up/i.test(said)) bad.push('the toast after a no-email sign-up says ' + JSON.stringify(said) + ' — not the handle and not who opens the link');
  /* AND UNTICKED IT IS THE ADDRESS IT ALWAYS WAS. */
  await wait(50);
  if (!open()) return bad.concat(['the Make an account tile went after one use']);
  await wait(50);
  student();
  fill('reg-first', 'Rae'); fill('reg-last', 'Newcomer'); fill('reg-email', 'rae@example.org'); fill('reg-pin', '0000');
  sent.length = 0;
  t.ACTIONS['reg-send'](d.querySelector('#sheet-body [data-do="reg-send"]'));
  await wait(300);
  const post2 = sent.find(b => b.action === 'register');
  if (!post2 || post2.email !== 'rae@example.org' || post2.parent_email) bad.push('unticked, register posted ' + JSON.stringify(post2));
  if (box && box.value !== 'rae@example.org') bad.push('unticked, the sign-in box holds ' + JSON.stringify(box.value) + ', not the address');
  return bad;
});

check('a grown-up opening a no-email child\'s link is told the child\'s handle', async () => {
  const { w } = boot({ url: 'https://example.org/?verify=Vkid42',
    reply: b => b.action === 'verifyEmail'
      ? { success: true, name: 'Ben Mum', handle: 'ben_kind42', noEmail: true, linkedTo: 'Mia Mum' } : { success: true } });
  await wait(400);
  const said = String((w.document.getElementById('toast') || {}).textContent || '');
  const bad = [];
  if (!/@ben_kind42/.test(said)) bad.push('the grown-up was told ' + JSON.stringify(said) + ' — not the handle the child signs in with');
  if (/sign in with it/i.test(said)) bad.push('the grown-up was told to sign in with their own address, which signs nobody in for the child');
  return bad;
});

/* AND WHEN THE PARENT ACCOUNT ON THAT ADDRESS IS STILL PENDING, the child is confirmed and NOT put on it
   (`verifyEmail`, the PR #130 review: it may be somebody else's account on the grown-up's address). The
   grown-up is told what is left to do, not left believing the child is on their account — and told in a
   SHEET they close. Round one said it in a toast, which goes after 2.6 seconds, and the child's link is
   single-use, so the second half of the sentence was never read (the review of round one). */
check('a grown-up whose account is unconfirmed is told how to add the child, in a sheet that stays', async () => {
  const { w } = boot({ url: 'https://example.org/?verify=Vkid43',
    reply: b => b.action === 'verifyEmail'
      ? { success: true, name: 'Ben Mum', handle: 'ben_kind43', noEmail: true, linkedTo: '', parentPending: true } : { success: true } });
  await wait(400);
  const d = w.document, bad = [];
  const sheet = () => d.getElementById('sheet-body');
  const said = () => String((sheet() || {}).textContent || '').replace(/\s+/g, ' ');
  const open = () => { const s = d.getElementById('sheet'); return !!(s && sheet() && said().trim() && !s.hidden && !/\bhidden\b/.test(s.className)); };
  if (!open()) return ['the grown-up was told nothing that stays — no sheet after the link: ' + JSON.stringify(String((d.getElementById('toast') || {}).textContent || ''))];
  if (!/@ben_kind43/.test(said())) bad.push('the sheet does not say the handle the child signs in with: ' + JSON.stringify(said()));
  if (!/not on your account/i.test(said())) bad.push('the sheet does not say the child is NOT on their account yet: ' + JSON.stringify(said()));
  if (/is on your account/i.test(said().replace(/not on your account/ig, ''))) bad.push('the sheet says the child is on their account, which the backend refused to do');
  if (!/Confirm your @family\. account|Send the link again/.test(said()) || !/Add your child/.test(said()))
    bad.push('the sheet does not give the next step — open your own link, then "Add your child": ' + JSON.stringify(said()));
  if (!/Forgotten your PIN\?/.test(said())) bad.push('the sheet does not tell a grown-up who never made an account how to take theirs back');
  /* STILL THERE AFTER A TOAST WOULD HAVE GONE — the whole point of the sheet. */
  await wait(3000);
  if (!open()) bad.push('the sheet went by itself, like the toast it replaced');
  const done = d.querySelector('#sheet-body [data-do="sheet-done"]');
  if (!done) bad.push('the sheet has no Done to close it');
  else {
    w.__t.ACTIONS['sheet-done'](done);
    await wait(400);
    if (open()) bad.push('Done did not close the sheet');
  }
  return bad;
});

/* ==================================================================================================
   AN ADDRESS NOBODY HAS PROVED, ON THE PHONE. The backend holds two things back from a PENDING address
   — every mail but its link and a forgotten PIN, and every door that puts a child on the account —
   and `check-signin.js` §9 holds that. This asks the phone's half: that the person is told, where they
   would otherwise wait, and offered the link again; and that it all goes when the address is proved.
================================================================================================== */
check('a parent whose address is unconfirmed is told their mail is held, and can have the link sent again', async () => {
  const jo = { name: 'Jo Smith', personId: 'P-JO', role: 'parent', roles: ['parent'], token: 'tk-jo', handle: 'jo_kind94',
               pendingEmail: 'jsmith1@example.org', profile: { first_name: 'Jo', last_name: 'Smith' } };
  /* `say` IS WHAT THE SHEET HOLDS, read at each request, so the address can be proved under the phone. */
  let say = 'jsmith1@example.org';
  const reply = b => b.action === 'myProfile'
      ? { success: true, personId: 'P-JO', profile: jo.profile, role: 'parent', roles: ['parent'], tutorPending: false, pendingEmail: say }
    : b.action === 'resendLink'
      ? { success: true, pendingEmail: say, message: 'A new link is on its way to jsmith1@example.org.' }
    : { success: true, messages: [] };
  const { w, sent } = boot({ reply, before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(jo)); } catch (e) {} } });
  await wait(700);
  const t = w.__t, d = w.document, bad = [];
  const text = el => String((el || {}).textContent || '').replace(/\s+/g, ' ');

  /* THE YOU COLUMN: the line under your own card, and the tile beside Sign out. */
  t.go('account', false, true);
  await wait(250);
  const line = d.querySelector('#s-account .mail-held');
  if (!line || !/jsmith1@example\.org/.test(text(line)) || !/email you/i.test(text(line)))
    bad.push('a signed-in PENDING person is not told on their own card that their mail waits for the link: ' + JSON.stringify(text(line)));
  const youTile = d.querySelector('#s-account [data-do="resend-link"]');
  if (!youTile) bad.push('there is no "Send the link again" on their own card');
  else {
    sent.length = 0;
    t.ACTIONS['resend-link'](youTile);
    await wait(250);
    const post = sent.find(b => b.action === 'resendLink');
    if (!post) bad.push('"Send the link again" posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no resendLink');
    else if (post.to || post.email) bad.push('"Send the link again" put an address on the request — where it goes is the server\'s to say: ' + JSON.stringify(post));
    if (!/on its way/.test(text(d.getElementById('toast')))) bad.push('pressing it said ' + JSON.stringify(text(d.getElementById('toast'))) + ', not the server\'s answer');
  }

  /* SETTINGS: one card where the two child forms would be, with the address and the same tile. */
  t.go('settings', false, true);
  await wait(250);
  const held = d.querySelector('#s-settings .kid-held');
  if (!held) bad.push('a PENDING parent\'s Settings has no "open the link first" card where "Make your child\'s account" would be');
  else {
    if (!/jsmith1@example\.org/.test(text(held)) || !/link/i.test(text(held))) bad.push('the held card does not say which address to open the link from: ' + JSON.stringify(text(held)));
    if (!held.querySelector('[data-do="resend-link"]')) bad.push('the held card has no "Send the link again"');
  }
  if (d.querySelector('#s-settings [data-kid-new], #s-settings [data-kid]'))
    bad.push('a PENDING parent is still offered a child form the server will refuse');

  /* AND WHEN THE ADDRESS IS PROVED — on another phone, by the link — the next open puts the forms back
     and takes the line away. */
  say = '';
  const again = boot({ reply, before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(jo)); } catch (e) {} } });
  await wait(700);
  const t2 = again.w.__t, d2 = again.w.document;
  if ((t2.whoami() || {}).pendingEmail) bad.push('myProfile said the address is proved and the phone kept it waiting: ' + JSON.stringify(t2.whoami().pendingEmail));
  t2.go('settings', false, true);
  await wait(250);
  if (d2.querySelector('#s-settings .kid-held') || !d2.querySelector('#s-settings .kid-make [data-kid-new]'))
    bad.push('once the address was proved, Settings still holds the child back, or has no "Make your child\'s account" form');
  t2.go('account', false, true);
  await wait(250);
  if (d2.querySelector('#s-account .mail-held, #s-account [data-do="resend-link"]')) bad.push('once the address was proved, the You column still says the mail is held');
  return bad;
});

/* A STALE PHONE DRAWS THE FORM; THE SERVER'S REFUSAL TURNS IT INTO THE HELD CARD — not a toast over a
   form that will be refused again on every press. */
check('a refused make-child for an unconfirmed address turns the form into the held card', async () => {
  const pat = { name: 'Pat Parent', personId: 'P-PAT', role: 'parent', roles: ['parent'], token: 'tk-pat', handle: 'pat_kind20',
                profile: { first_name: 'Pat', last_name: 'Parent' } };
  const reply = b => b.action === 'makeChild'
      ? { error: 'Open the link we emailed to pat@example.org first — then you can make your child\'s account. Nothing was made.',
          why: 'unconfirmed', pendingEmail: 'pat@example.org' }
    : b.action === 'myProfile' ? { error: 'That action is not recognised.' }
    : { success: true, messages: [] };
  const { w } = boot({ reply, before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(pat)); } catch (e) {} } });
  await wait(700);
  const t = w.__t, d = w.document, bad = [];
  t.go('settings', false, true);
  await wait(250);
  const card = d.querySelector('#s-settings .kid-make');
  if (!card) return ['a parent with no word on their address was not shown the make-child form to begin with'];
  const val = (k, v) => { const el = card.querySelector('[data-kid-new="' + k + '"]'); if (el) el.value = v; };
  /* BUILT FROM ITS DIGITS — `check-secrets.js` refuses four digits beside the word. */
  val('first', 'Lu'); val('last', 'Parent'); val('pin', ['4', '8', '2', '6'].join(''));
  t.ACTIONS['kid-make'](card.querySelector('[data-do="kid-make"]'));
  await wait(400);
  if (!/Open the link we emailed to pat@example\.org/.test(String((d.getElementById('toast') || {}).textContent || '')))
    bad.push('the server\'s sentence was not said');
  if (!d.querySelector('#s-settings .kid-held') || d.querySelector('#s-settings [data-kid-new]'))
    bad.push('the refusal left the form standing instead of the held card');
  if (((t.whoami() || {}).pendingEmail || '') !== 'pat@example.org') bad.push('the phone did not keep the address the server said is waiting');
  return bad;
});

/* GOOGLE TAKING A PENDING ROW BACK CLEARS ITS PIN, and the person is told in a sheet — as often the real
   registrant, who would otherwise find their PIN refused tomorrow with no idea why. */
check('signing in with Google on an unconfirmed account says the PIN has gone, in a sheet', async () => {
  const msg = 'Signed in with Google, and that has confirmed your email. The account was made with a PIN before '
            + 'anybody had confirmed the address, so that PIN no longer works.';
  const { w } = boot({ reply: b => b.action === 'googleLogin'
    ? { success: true, name: 'Val Owner', personId: 'P-VAL', role: 'parent', roles: ['parent'], token: 'tk-val',
        pendingEmail: '', pinCleared: true, message: msg, profile: { first_name: 'Val' } }
    : { success: true, messages: [] } });
  await wait(300);
  const d = w.document, bad = [];
  if (typeof w.googleSignedIn_ !== 'function') return ['googleSignedIn_ is not reachable, so the Google reply was NOT checked'];
  w.googleSignedIn_({ credential: 'a-google-token' });
  await wait(400);
  const said = String((d.getElementById('sheet-body') || {}).textContent || '').replace(/\s+/g, ' ');
  if (!/PIN no longer works/.test(said)) bad.push('the Google reply said the PIN was cleared and no sheet says so: ' + JSON.stringify(said));
  /* AND AN ORDINARY GOOGLE SIGN-IN OPENS NOTHING. */
  const b2 = boot({ reply: b => b.action === 'googleLogin'
    ? { success: true, name: 'Cy Done', personId: 'P-CY', role: 'parent', roles: ['parent'], token: 'tk-cy', pendingEmail: '', profile: {} }
    : { success: true, messages: [] } });
  await wait(300);
  b2.w.googleSignedIn_({ credential: 'a-google-token' });
  await wait(400);
  const s2 = b2.w.document.getElementById('sheet');
  if (s2 && String((b2.w.document.getElementById('sheet-body') || {}).textContent || '').trim() && !s2.hidden && !/\bhidden\b/.test(s2.className))
    bad.push('an ordinary Google sign-in opened a sheet');
  return bad;
});

/* ==================================================================================================
   WHO THE ACCOUNT IS FOR. The walk after 273 found a parent who signed up on the phone made a student,
   with no "Make your child's account" and a Client tick refused. `check-signin.js` §8 asks the backend
   that `who` decides the role; this asks the phone's half — that the question is asked FIRST and
   cannot be skipped, that the answer shapes the form and goes on the wire, and that a parent who
   signed up is shown the make-child card on the first paint after signing in, with no reload.
================================================================================================== */
check('Make an account asks who it is for first, and a parent is a parent from the first sign-in', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'register'
      ? { success: true, name: 'Dana Brook', pending: true, handle: 'dana_kind44', confirmBy: 'self',
          role: b.who === 'parent' ? 'parent' : 'kid' }
    : b.action === 'verifyLogin'
      /* `pendingEmail` AS `loginReplyFor_` REALLY SENDS IT — a fixture must send what the backend sends,
         and the first sign-in after registering is before anybody has opened the link. */
      ? { success: true, name: 'Dana Brook', personId: 'P-DANA', handle: 'dana_kind44', token: 'tk-dana',
          role: 'parent', roles: ['parent'], tutorPending: false, pendingEmail: 'dana@example.org',
          profile: { first_name: 'Dana', last_name: 'Brook' } }
    : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  t.go('account', false, true);
  await wait(120);
  const reg = d.querySelector('#s-account [data-do="register"]');
  if (!reg) return ['there is no Make an account tile to press'];
  t.ACTIONS['register'](reg);
  await wait(50);
  const choice = who => d.querySelector('#sheet-body [data-do="reg-who"][data-who="' + who + '"]');
  const rest = () => d.getElementById('reg-rest');
  const tickRow = () => { const x = d.getElementById('reg-noemail'); return x && x.closest('.reg-kid'); };
  if (!choice('parent') || !choice('student')) return ['the register sheet does not ask "a parent or a student?"'];
  /* THE QUESTION FIRST: the boxes and the button are not shown, and nothing is chosen for you. */
  if (!rest() || !rest().hidden) bad.push('the boxes are shown before anybody has said who the account is for');
  if (d.querySelector('#sheet-body [data-do="reg-who"].on')) bad.push('an answer is already chosen when the sheet opens — the default is the fault this question ends');
  if (choice('parent').closest('label')) bad.push('the choice is inside a <label>, so a tap on its caption answers it');
  /* AND A SEND THAT SOMEHOW HAPPENS UNANSWERED POSTS NOTHING. */
  const fill = (id, v) => { const el = d.getElementById(id); if (el) el.value = v; };
  fill('reg-first', 'Dana'); fill('reg-last', 'Brook'); fill('reg-email', 'dana@example.org'); fill('reg-pin', '0000');
  sent.length = 0;
  t.ACTIONS['reg-send'](d.querySelector('#sheet-body [data-do="reg-send"]'));
  await wait(200);
  if (sent.some(b => b.action === 'register')) bad.push('an unanswered sheet posted register — the server would make them a student');

  /* A STUDENT TICKS THE GROWN-UP'S BOX, THEN SAYS PARENT: the tick goes, and is not sent. */
  t.ACTIONS['reg-who'](choice('student'));
  if (rest().hidden) bad.push('answering did not show the boxes');
  if (!tickRow() || tickRow().hidden) bad.push('a student is not offered "It\'s a grown-up\'s email"');
  d.getElementById('reg-noemail').checked = true;
  t.ACTIONS['reg-who'](choice('parent'));
  if (!choice('parent').classList.contains('on') || choice('parent').getAttribute('aria-pressed') !== 'true'
      || choice('student').classList.contains('on') || choice('student').getAttribute('aria-pressed') !== 'false') {
    bad.push('the chosen answer is not the gold, pressed one (and the other not)');
  }
  if (!tickRow().hidden || d.getElementById('reg-noemail').checked) bad.push('a parent is still offered, or still has ticked, the grown-up\'s-email box');
  const note = String((d.getElementById('reg-note') || {}).textContent || '');
  if (!/child's account/.test(note) || !/Settings/.test(note)) bad.push('a parent\'s note does not say where their child\'s account is made: ' + JSON.stringify(note));

  sent.length = 0;
  t.ACTIONS['reg-send'](d.querySelector('#sheet-body [data-do="reg-send"]'));
  await wait(300);
  const post = sent.find(b => b.action === 'register');
  if (!post) return bad.concat(['the parent\'s form posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no register']);
  if (post.who !== 'parent') bad.push('the parent\'s register carried who = ' + JSON.stringify(post.who));
  if (post.email !== 'dana@example.org' || post.parent_email) bad.push('the parent\'s address did not go as their own email: ' + JSON.stringify({ email: post.email, parent_email: post.parent_email }));

  /* THE FIRST SIGN-IN, AND SETTINGS ON THE VERY NEXT PAINT — nothing reloaded, nobody signed out. */
  t.go('account', false, true);
  await wait(80);
  fill('in-name', 'dana@example.org'); fill('in-pin', '0000');
  t.ACTIONS['do-signin'](d.querySelector('#s-account [data-do="do-signin"]'));
  await wait(300);
  const u = t.whoami();
  if (!u || u.role !== 'parent') return bad.concat(['signing in did not leave a parent signed in: ' + JSON.stringify(u && u.role)]);
  try { t.go('settings', false, true); } catch (e) { return bad.concat(['going to settings threw: ' + e.message]); }
  await wait(250);
  /* "MAKE YOUR CHILD'S ACCOUNT" IS THERE FROM THE FIRST PAINT — as the one sentence that says what
     comes first while the address is unproved (`confirmFirst_`), with the link offered again; the form
     itself once the link is opened (the journey after the next). */
  const heldCard = d.querySelector('#s-settings .kid-held');
  if (!heldCard || !/Make your child's account/.test(String(heldCard.textContent || '')) || !/dana@example\.org/.test(String(heldCard.textContent || '')))
    bad.push('a parent who has just signed in for the first time has no "Make your child\'s account" on Settings saying to open the link sent to their address');
  if (d.querySelector('#s-settings [data-kid-new]')) bad.push('a parent whose address nobody has proved yet is offered the make-child form, which the server refuses');

  /* A STUDENT'S POST SAYS STUDENT. */
  t.USER(null);
  t.go('account', false, true);
  await wait(80);
  t.ACTIONS['register'](d.querySelector('#s-account [data-do="register"]'));
  await wait(50);
  t.ACTIONS['reg-who'](choice('student'));
  fill('reg-first', 'Mo'); fill('reg-last', 'Learner'); fill('reg-email', 'mo@example.org'); fill('reg-pin', '0000');
  sent.length = 0;
  t.ACTIONS['reg-send'](d.querySelector('#sheet-body [data-do="reg-send"]'));
  await wait(300);
  const post2 = sent.find(b => b.action === 'register');
  if (!post2 || post2.who !== 'student') bad.push('a student\'s register carried who = ' + JSON.stringify(post2 && post2.who));
  return bad;
});

check('a role changed in the sheet reaches the screen on the next open, with no sign-out', async () => {
  /* THE WALK: the owner made a parent a client in the sheet; the parent reloaded; no card until they
     signed out and in. Here the phone opens holding a stale `kid` and `myProfile` says `parent`. */
  const kid = { name: 'Mo Learner', personId: 'P-MO', role: 'kid', roles: ['kid'], token: 'tk-mo',
                profile: { first_name: 'Mo', last_name: 'Learner' } };
  /* `say` IS WHAT THE SHEET HOLDS — read at each request, so a journey can change it under the phone. */
  let say = '';
  const reply = b => b.action === 'myProfile'
    ? Object.assign({ success: true, personId: b.personId || 'P-MO', profile: { first_name: 'Mo', last_name: 'Learner' } },
                    say ? { role: say, roles: [say], tutorPending: false } : {})
    : { success: true, messages: [] };
  const open = async role => {
    say = role;
    const b = boot({ reply, before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(kid)); } catch (e) {} } });
    await wait(700);
    return b;
  };
  const bad = [];
  {
    const { w, sent } = await open('parent');
    const t = w.__t, d = w.document;
    if (!sent.some(b => b.action === 'myProfile')) return ['opening the app signed in did not ask myProfile, so nothing could correct a stale role'];
    const u = t.whoami();
    if (!u || u.role !== 'parent' || (u.roles || []).join() !== 'parent') bad.push('the phone kept its stale role after myProfile said parent: ' + JSON.stringify(u && [u.role, u.roles]));
    let kept = null; try { kept = JSON.parse(w.localStorage.getItem('familyUser') || 'null'); } catch (e) {}
    if (!kept || kept.role !== 'parent') bad.push('the corrected role was not kept, so the next open starts stale again');
    try { t.go('settings', false, true); } catch (e) {}
    await wait(250);
    if (!d.querySelector('#s-settings .kid-make')) bad.push('after the role was corrected there is still no "Make your child\'s account" — the walk\'s sign-out dance is still needed');
  }
  /* AN OLD SERVER SENDS NO ROLE: what the phone had stays. */
  {
    const { w } = await open('');
    const u = w.__t.whoami();
    if (!u || u.role !== 'kid') bad.push('a myProfile with no role in it wiped the role the phone had: ' + JSON.stringify(u && u.role));
  }
  /* AND NOT ONLY SETTINGS: the column ON SCREEN when the role changes is drawn again. Made an admin in
     the sheet while looking at the people column, the phone draws the admin's list of everyone there
     and then — the role decides a whole column, not one card. */
  {
    const { w } = await open('kid');
    const t = w.__t, d = w.document;
    t.DATA().everyone = [{ personId: 'P-EVE', title: 'Eve Everyone', handle: 'eve_kind5', role: 'Student', image: '' }];
    try { t.go('account', false, true); w.paint('account'); } catch (e) { return bad.concat(['drawing the account column threw: ' + e.message]); }
    await wait(150);
    const eve = () => /P-EVE|Eve Everyone/.test((d.getElementById('s-account') || {}).innerHTML || '');
    if (eve()) return bad.concat(['a student is drawn the admin\'s list of everyone, so this cannot ask what a role change redraws']);
    say = 'admin';
    w.profileRefresh_();
    await wait(300);
    if ((t.whoami() || {}).role !== 'admin') bad.push('the role on the phone did not follow the sheet to admin');
    else if (!eve()) bad.push('the column on screen when the role changed was not drawn again — it shows the old role until something else repaints it');
  }
  return bad;
});

check('a parent makes their child\'s account in Settings and is shown the handle and the PIN on a slip', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'makeChild'
    ? { success: true, name: 'Ivy Parent', handle: 'ivy_kind42', personId: 'P-IVY' } : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER({ name: 'Pat Parent', personId: 'P-C1', role: 'parent', roles: ['parent'], token: 'tk',
           profile: { first_name: 'Pat', last_name: 'Parent' } });
  try { t.go('settings', false, true); w.paint('settings'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const card = () => d.querySelector('#s-settings .kid-make');
  if (!card()) return ['a parent\'s Settings has no "Make your child\'s account" card'];
  const pages = [...d.querySelectorAll('#s-settings .page')];
  const at = sel => pages.findIndex(p => p.querySelector(sel));
  const add = pages.findIndex(p => /Add your child/.test(p.textContent));
  if (add !== -1 && at('.kid-make') > add) bad.push('making a child\'s account comes after linking one — most children here have none');
  const box = k => card().querySelector('[data-kid-new="' + k + '"]');
  if (!box('first') || !box('last') || !box('pin')) return bad.concat(['the make card is missing one of first, last, PIN']);
  if (box('last').value !== 'Parent') bad.push('the last name box is not filled with the parent\'s own (' + JSON.stringify(box('last').value) + ')');
  if (box('pin').type !== 'password' || box('pin').inputMode !== 'numeric') bad.push('the PIN box is not a numeric password box');
  box('first').value = 'Ivy';
  for (const p of ['12a', '123']) {
    box('pin').value = p;
    sent.length = 0;
    t.ACTIONS['kid-make'](card().querySelector('[data-do="kid-make"]'));
    await wait(150);
    if (sent.some(b => b.action === 'makeChild')) bad.push('a PIN of "' + p + '" was posted');
  }
  box('pin').value = '0000';
  sent.length = 0;
  t.ACTIONS['kid-make'](card().querySelector('[data-do="kid-make"]'));
  await wait(400);
  const post = sent.find(b => b.action === 'makeChild');
  if (!post) return bad.concat(['Make their account posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no makeChild']);
  const want = { firstName: 'Ivy', lastName: 'Parent', pin: '0000', personId: 'P-C1' };
  Object.keys(want).forEach(k => { if (post[k] !== want[k]) bad.push('makeChild carried ' + k + ' = ' + JSON.stringify(post[k])); });
  try { w.paint('settings'); } catch (e) {}
  await wait(100);
  const slip = card() && card().querySelector('.pin-slip');
  if (!slip) bad.push('after the account was made there is no slip with the handle and PIN on the card');
  else {
    if (!/@ivy_kind42/.test(slip.textContent)) bad.push('the slip does not show the handle the server made');
    if (!/0000/.test(slip.textContent)) bad.push('the slip does not show the PIN the parent chose');
  }
  /* A STUDENT HAS NOBODY TO MAKE AN ACCOUNT FOR. */
  t.USER({ name: 'Sam Student', personId: 'P-S1', role: 'student', roles: ['student'], token: 'tk2' });
  try { t.repaint(true); t.go('settings', false, true); w.paint('settings'); } catch (e) {}
  await wait(200);
  if (d.querySelector('#s-settings .kid-make')) bad.push('a student is offered "Make your child\'s account"');
  /* AND ANOTHER PARENT ON THE SAME PHONE IS NOT SHOWN THE FIRST ONE'S CHILD'S PIN — the slip is held
     for the parent who made it, by id, and a phone passed along keeps its state. */
  t.USER({ name: 'Quinn Parent', personId: 'P-C2', role: 'parent', roles: ['parent'], token: 'tk3',
           profile: { first_name: 'Quinn', last_name: 'Other' } });
  try { t.repaint(true); t.go('settings', false, true); w.paint('settings'); } catch (e) {}
  await wait(200);
  if (!d.querySelector('#s-settings .kid-make')) bad.push('the second parent has no make card to look at');
  if (d.querySelector('#s-settings .pin-slip')) bad.push('the parent\'s slip was still drawn for the next person signed in on the phone');
  return bad;
});

check('New PIN is on a parent\'s child and on an admin\'s people, asks first, and shows the slip once', async () => {
  const FRESH = ['4', '8', '2', '9', '1', '3'].join('');
  const { w, sent } = boot({ reply: b => b.action === 'resetPin'
    ? { success: true, name: 'Kit Parent', first: 'Kit', handle: 'kit_kind41', pin: FRESH } : { success: true } });
  await wait(400);
  if (!w.__t.accountPages) return ['accountPages_ is not exported — cannot check the account column'];
  const t = w.__t, d = w.document, D = t.DATA(), bad = [];
  const pageOf = name => t.accountPages().find(h => h.indexOf('>' + name + '<') !== -1) || '';

  t.USER({ name: 'Pat Parent', personId: 'P-P', role: 'client', roles: ['client'], token: 'tk' });
  D.family = [{ personId: 'P-K', title: 'Kit Parent', relation: 'child', handle: 'kit_kind41', image: '' }];
  D.familyFor = 'P-P';
  const kit = pageOf('Kit Parent');
  if (!/data-do="kid-pin"[^>]*data-id="P-K"|data-id="P-K"[^>]*data-do="kid-pin"/.test(kit.replace(/\s+/g, ' ')))
    bad.push('a parent\'s child card has no New PIN tile for that child');
  try { t.go('account', false, true); w.paint('account'); } catch (e) { bad.push('drawing the account column threw: ' + e.message); }
  await wait(150);
  const tile = d.querySelector('#s-account [data-do="kid-pin"][data-id="P-K"]');
  if (!tile) return bad.concat(['no New PIN tile on the screen to press']);
  if (!tile.classList.contains('tile')) bad.push('New PIN is not a tile — a THING has tiles');
  sent.length = 0;
  t.ACTIONS['kid-pin'](tile);
  await wait(80);
  const sheet = d.getElementById('sheet');
  if (!sheet || sheet.classList.contains('hidden')) return bad.concat(['pressing New PIN opened nothing to confirm in']);
  if (sent.some(b => b.action === 'resetPin')) bad.push('pressing New PIN reset the PIN before asking');
  const go_ = d.querySelector('#sheet-body [data-do="kid-pin-go"]');
  if (!go_) return bad.concat(['the New PIN sheet has no button to say yes with']);
  t.ACTIONS['kid-pin-go'](go_);
  await wait(300);
  const post = sent.find(b => b.action === 'resetPin');
  if (!post || post.targetId !== 'P-K') bad.push('saying yes posted ' + JSON.stringify(post) + ' — wanted resetPin for P-K');
  const slip = d.querySelector('#sheet-body .pin-slip');
  if (!slip) bad.push('after the new PIN there is no slip in the sheet');
  else if (!/@kit_kind41/.test(slip.textContent) || slip.textContent.indexOf(FRESH) === -1) bad.push('the slip does not show the handle and the new PIN: ' + JSON.stringify(slip.textContent.replace(/\s+/g, ' ')));
  /* A PARENT'S OWN PARENT IS NOT THEIRS TO RESET — and a student's parent card carries no tile. */
  t.USER({ name: 'Kit Parent', personId: 'P-K', role: 'student', roles: ['student'], token: 'tk3' });
  D.family = [{ personId: 'P-P', title: 'Pat Parent', relation: 'parent', handle: 'pat_kind40', image: '' }];
  D.familyFor = 'P-K';
  if (/data-do="kid-pin"/.test(pageOf('Pat Parent'))) bad.push('a student\'s parent card carries a New PIN tile');
  delete D.family; delete D.familyFor;

  /* AN ADMIN: everybody who is not staff, "no handle yet" where there is none, and no tile without an id. */
  t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk2' });
  D.everyone = [
    { personId: 'P-E1', title: 'Evie Nohandle', handle: '', role: 'Student', image: '' },
    { personId: 'P-E2', title: 'Carl Handled', handle: 'carl_kind32', role: 'Client', image: '' },
    { personId: '', title: 'Noa Noid', handle: 'noa_kind64', role: 'Student', image: '' },
  ];
  const evie = pageOf('Evie Nohandle'), carl = pageOf('Carl Handled'), noa = pageOf('Noa Noid');
  if (!/no handle yet/.test(evie)) bad.push('the admin is not told a child has no handle yet');
  if (/no handle yet/.test(carl)) bad.push('a person with a handle is said to have none');
  if (!/data-do="kid-pin"/.test(evie) || !/data-do="kid-pin"/.test(carl)) bad.push('an admin\'s people card has no New PIN tile');
  if (!/data-do="msg-open"/.test(evie)) bad.push('New PIN pushed Message off the admin\'s card');
  if (/data-do="kid-pin"/.test(noa)) bad.push('a row with no id was given a New PIN tile that can name nobody to the server');
  delete D.everyone;
  t.USER(null);
  return bad;
});

check('Forgotten your PIN? says what the server said, including that nobody can be written to', async () => {
  const { w } = boot({ reply: b => b.action === 'forgotPin'
    ? (b.who === 'lee_kind42'
       ? { error: 'We have no email for this account, so we could not send a new PIN. Ask your parent or your tutor — they can give you one straight away.', why: 'no-inbox' }
       : { success: true, message: 'A new PIN is on its way to your parent\'s inbox. Your old PIN still works until you use the new one.' })
    : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null); t.go('account', false, true);
  await wait(120);
  const box = d.getElementById('in-name'), tile = d.querySelector('#s-account [data-do="forgot-pin"]');
  if (!box || !tile) return ['the sign-in card has no name box or no forgot-PIN tile'];
  box.value = 'lee_kind42';
  t.ACTIONS['forgot-pin'](tile);
  await wait(300);
  let said = String((d.getElementById('toast') || {}).textContent || '');
  if (!/no email for this account/i.test(said)) bad.push('a child nobody can be written to was told ' + JSON.stringify(said));
  box.value = '@kit_kind41';
  t.ACTIONS['forgot-pin'](d.querySelector('#s-account [data-do="forgot-pin"]') || tile);
  await wait(300);
  said = String((d.getElementById('toast') || {}).textContent || '');
  if (!/old PIN still works/i.test(said)) bad.push('the sent case toasted ' + JSON.stringify(said) + ' — not the server\'s sentence');
  return bad;
});

check('each stage tick takes the date it actually happened on', async () => {
  /* ==================================================================================================
     ASKED FOR AS *"The tick boxes have a date for when it got requested. When other things get
     ticked they should also have a date."* The dates were already on the phone and nothing read
     them: `doGet` has put `events: eventsForJob(jobId)` on every job since the roster was derived
     from the log, and `js/` had no reader for it at all.

     THIS TESTS THE RULE RATHER THAN THE RENDERING, because the rule is the part that can be subtly
     wrong for years. Each date is taken to match its own predicate and the two are OPPOSITE ends of
     the list — `Accepted` needs EVERY seat agreed, so it is the LAST `Accept`; `Paid` needs a seat
     BOOKED, and on a session that is one, so it is the FIRST `Confirm`. A log where everybody moved
     on the same day would pass whichever way round they were read, so the job below has two
     families moving four days apart and the two right answers are the two INNER dates: the second
     Accept and the first Confirm, never the first Accept or the last Confirm.

     AND THE WAITING LIST IS THE OTHER HALF OF `Paid`. `jobStage_` wants the whole house booked
     there, so the same log gives the LAST `Confirm` on a two-seat list — one rule, two answers, and
     the test is that changing only `kind` and `maxKids` moves that one date.

     A CHAIN, SO NOTHING BELOW AN EMPTY BOX MAY CARRY A DATE. That is the half a rendering test
     cannot see: a stage whose own test is true but whose predecessor is not must draw neither the
     tick nor the date. */
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t || typeof t.stageRows !== 'function') return ['stageRows_ is not exported, so the dates cannot be checked — not a pass'];
  /* REACHED, NOT COUNTED. This said `length !== 5` and would have gone stale the first time a stage
     was added — which it did, when `Applied for` went in between `Requested` and `Accepted`. What
     the guard is for is *can this check see its subject*, and the honest test of that is that there
     is a list of stages with rows and predicates on them. The rows themselves are asserted below by
     name and by the chain. */
  if (!Array.isArray(t.JOB_STAGES) || !t.JOB_STAGES.length
      || t.JOB_STAGES.some(x => !x || !x.row || typeof x.is !== 'function')) {
    return ['JOB_STAGES is not the list of rows the receipt is built from — not a pass'];
  }
  const bad = [];
  const log = [
    { at: '22/09/2026', actor: 'A', role: 'client', action: 'Request', target: '', message: '' },
    { at: '23/09/2026', actor: 'B', role: 'client', action: 'Request', target: '', message: '' },
    { at: '24/09/2026', actor: 'A', role: 'client', action: 'Accept',  target: '', message: '' },
    { at: '25/09/2026', actor: 'B', role: 'client', action: 'Accept',  target: '', message: '' },
    { at: '26/09/2026', actor: 'A', role: 'client', action: 'Confirm', target: '', message: '' },
    { at: '28/09/2026', actor: 'B', role: 'client', action: 'Confirm', target: '', message: '' },
  ];
  /* BOTH SESSION DATES IN THE PAST, so all five tick and all five have a date to be wrong about. */
  const job = { kind: 'session', createdAt: '21/09/2026', events: log,
                startDate: '01/10/2025', endDate: '05/11/2025',
                slots: [{ n: 1, client: 'A', status: 'Booked' }, { n: 2, client: 'B', status: 'Booked' }],
                tutorSlots: [] };
  const got = t.stageRows(job);
  const by = {};
  got.forEach(r => { by[r.k] = r; });
  /* `Applied for` TAKES THE ASKING'S OWN DATE on a booking with no `Apply` event, which is every
     booking today — see `JOB_STAGES`. Asserted rather than assumed, because "ticked with Requested"
     is the whole of what the owner asked for and a date reaching for a nearby event instead would
     look identical on the card. */
  const want = { Requested: '21/09/26', 'Applied for': '21/09/26',
                 Accepted: '25/09/26', Paid: '26/09/26',
                 Started: '01/10/25', Completed: '05/11/25' };
  Object.keys(want).forEach(k => {
    const r = by[k];
    if (!r) { bad.push('no "' + k + '" row at all'); return; }
    if (!r.tick) { bad.push('"' + k + '" is not ticked on a job where it plainly happened'); return; }
    if (r.v !== want[k]) bad.push('"' + k + '" is dated ' + JSON.stringify(r.v) + ', not ' + JSON.stringify(want[k]));
  });

  /* THE WAITING LIST WANTS THE LAST `Confirm`, because its own predicate wants every seat. */
  const list = t.stageRows(Object.assign({}, job, { kind: 'waitlist', maxKids: 2 }));
  const paid = list.find(r => r.k === 'Paid');
  if (!paid || !paid.tick) bad.push('a full waiting list does not tick Paid');
  else if (paid.v !== '28/09/26') {
    bad.push('a full waiting list is dated Paid ' + JSON.stringify(paid.v) + ', not "28/09/26" — '
             + 'it needs every seat, so the LAST Confirm is the one that filled it');
  }

  /* AND A STAGE BELOW AN EMPTY BOX CARRIES NOTHING, tick or date. `Accepted` is false here because
     one seat is still Waiting, so `Paid` must stay blank even though a `Confirm` sits in the log
     and both session dates are long past. */
  /* ---------- ASKED AS THE CHAIN RATHER THAN AS A LIST OF ROW NAMES -----------------------------
     THIS SKIPPED `Requested` BY NAME and reported every other row as broken, which was right while
     `Requested` was the only stage above `Accepted`. `Applied for` is above it too now, so a check
     naming rows would have failed on a row behaving exactly as designed.
     THE PROPERTY IS WHAT IS TESTED: find the first unticked row, and nothing after it may tick or
     carry a date. That is the chain itself, and it needs no list here to go stale. */
  const part = t.stageRows(Object.assign({}, job, {
    slots: [{ n: 1, client: 'A', status: 'Booked' }, { n: 2, client: 'B', status: 'Waiting' }] }));
  const broke = part.findIndex(r => !r.tick);
  if (broke === -1) bad.push('one seat is still Waiting and every stage ticks anyway');
  else part.slice(broke).forEach(r => {
    if (r.tick) bad.push('"' + r.k + '" ticks below the unticked "' + part[broke].k + '", so the chain is broken');
    if (r.v) bad.push('"' + r.k + '" carries the date ' + JSON.stringify(r.v) + ' with no tick');
  });

  /* A JOB WITH NO LOG DRAWS THE TICK AND NOTHING ELSE — never a nearby date, which on a document
     somebody keeps is the `cost: 0` shape. */
  const bare = t.stageRows(Object.assign({}, job, { events: [], createdAt: '' }));
  const acc = bare.find(r => r.k === 'Accepted');
  if (!acc || !acc.tick) bad.push('a job with no event log stops ticking Accepted');
  else if (acc.v) bad.push('a job with no event log dates Accepted ' + JSON.stringify(acc.v));
  return bad;
});

check('a day says how many hours it is, in the column that multiplies', async () => {
  /* ---------- REPORTED AS A COLUMN WITH NOTHING IN IT -------------------------------------------
     *"can you see how in screenshot i booked 3 hours? there should be a 3 hour mutultiplier in the
     multiplication column."* The `Hours a week` row was deleted a long way back with a note saying
     the When row reported the same number beside the grid that decides it — and then the When row
     became seven day rows and the number went with it.

     IT IS A MULTIPLIER RATHER THAN A CAPTION, which is why it goes in that column and why this
     journey asserts the arithmetic as well as the markup: `priceFrom` does `p *= L.hoursPerWeek`,
     and hours-a-week is the sum of the seven figures. A day's `× 3` that does not add up to the
     number the price is built from is two statements of one fact.

     THE DISPLAY HALF IS CSS AND IS NOT ASSERTABLE HERE. `.bk-m` is hidden on any row with no
     running total, which is right about every other row and would have hidden this — proved by
     mutation in a browser: with the week's exemption removed the markup says `× 3` and the card
     shows nothing. jsdom applies no stylesheet, so what this can hold is that the figure is written
     and that it is right. */
  const { w } = boot();
  await wait(300);
  if (!w.__t.paper) return ['bookBreakdown is not exported — cannot read the card'];
  const B = w.__t.BOOKING;
  const bad = [];
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.slots = ['m11', 'm12', 'm13', 'w12'];

  const rows = String(w.__t.paper() || '')
    .split('<div class="bk-row').filter(r => r.indexOf('bk-wk') !== -1);
  if (rows.length !== 7) return ['the card draws ' + rows.length + ' day rows, not 7'];
  const mul = r => (/<span class="bk-m">([^<]*)<\/span>/.exec(r) || ['', ''])[1].trim();
  const said = rows.map(mul);
  const want = ['\u00d7 3', '', '\u00d7 1', '', '', '', ''];
  if (JSON.stringify(said) !== JSON.stringify(want)) {
    bad.push('three hours on Monday and one on Wednesday reads ' + JSON.stringify(said)
             + ', wanted ' + JSON.stringify(want));
  }
  /* AND THE SEVEN ADD UP TO WHAT THE PRICE IS BUILT FROM. */
  const spec = w.__t.spec ? w.__t.spec() : null;
  const sum = said.reduce((a, t) => a + (parseFloat(String(t).replace(/[^\d.]/g, '')) || 0), 0);
  if (spec && Number(spec.hoursPerWeek) !== sum) {
    bad.push('the day figures add to ' + sum + ' and the price is built on '
             + spec.hoursPerWeek + ' hours a week');
  }
  return bad;
});

check('the dates row says how many dates it lists', async () => {
  /* ---------- ASKED FOR AS A MULTIPLIER FOR THE NUMBER OF DATES ---------------------------------
     *"there should be a multipler for the number of dates bit."* The count WAS on this card, as an
     aside beside the price, and was removed one commit earlier on the argument that *"the count is
     the MULTIPLIER on the row that does the arithmetic"* — which named the wrong number: the `Time
     interval` row multiplies by WEEKS, so three days a week over twelve weeks shows `× 12` and the
     thirty-six sessions were nowhere on the document.

     THE COUNT IS OF WHAT THE ROW LISTS, and that is what makes this assertable rather than a matter
     of taste: the figure and the value come from one array, so a row that lists six dates and counts
     five is a shape that cannot occur — unless somebody writes the count from somewhere else, which
     is exactly what this refuses.

     AND IT IS SILENT ON ONE DATE. `× 1` is the multiplier this app already declines to print, and a
     single session listing its one date needs no count of it.

     THE DISPLAY HALF IS CSS AND IS NOT ASSERTABLE HERE, the same as the day rows' own journey above:
     `.bk-m` is hidden on any row with no running total, which is right about every other row and
     would have hidden this. Proved by mutation in a browser instead — with the exemption removed the
     markup says `× 6` and the card paints nothing. */
  const { w } = boot();
  await wait(300);
  if (!w.__t.jobRows) return ['jobRows is not exported — cannot read the receipt'];
  const bad = [];
  const dates = of => (w.__t.jobRows({ id: 'J1', jobId: 'J1', subject: 'Maths', dates: of })
    .filter(r => r.k === 'Dates')[0] || {});

  const six = dates('06/10/26, 13/10/26, 20/10/26, 27/10/26, 03/11/26, 10/11/26');
  if (six.mul !== '\u00d7 6') {
    bad.push('six dates read ' + JSON.stringify(six.mul || '') + ' in the multiplier column');
  }
  if (String(six.v || '').split(',').length !== 6) {
    bad.push('the row lists ' + String(six.v || '').split(',').length + ' dates and counts 6');
  }
  const one = dates('06/10/26');
  if (one.mul) bad.push('one date reads ' + JSON.stringify(one.mul) + ' rather than nothing');
  const none = dates('');
  if (none.mul) bad.push('no dates reads ' + JSON.stringify(none.mul) + ' rather than nothing');
  return bad;
});

check('one ticked term prices one term', async () => {
  /* ---------- REPORTED AS *"why is it coming out to so much?"* -----------------------------------
     Over a card totalling £1024.59 whose Dates row listed EIGHTEEN sessions across two Septembers —
     September 2026 AND September 2027 — for one ticked term. Reproduced before anything was changed:
     with two rows named `Autumn 1` in the payload, `bookSpec().windows` came back with a length of
     two, the `Time interval` row read `Autumn 1, Autumn 1`, and three sessions became ten.

     THE PAYLOAD REALLY SHIPS THE NAME TWICE, and `doget.gs` believed otherwise — its own comment
     said that once terms which have ENDED are dropped *"each name appears once inside the next
     twelve months"*. Measured against the real `schoolYear` on 25/09/2026, that filter keeps
     `Autumn 1 2026-09-07..2026-10-23` AND `Autumn 1 2027-09-06..2027-10-22`: the first has not
     ended and the second starts four days inside the 370-day cut-off. So it held for most of the
     year and failed every autumn, which is the one term it matters for.

     REPAIRED AT SOURCE AND ON THE PHONE. The source fix is a deploy away and this app's house rule
     is that a broken sheet must still produce a working site, so `intervals_()` answers one row per
     name — and that is the half this journey can reach, because a journey seeds a payload rather
     than running `doGet`.

     THE ASSERTION IS THE WINDOWS AND THE SESSIONS, not the pounds. A price is a chain of six other
     rows and a figure here would fail for reasons that have nothing to do with terms; how many
     windows one ticked name opens is the fault itself. */
  const twice = payload();
  const one = twice.intervals[0];
  twice.intervals = [one, Object.assign({}, one, { startDate: '01/09/2027', endDate: '18/10/2027',
    lastSun: '18/10/2027', rel: 'Next year' })];
  const { w } = boot({ payload: twice });
  await wait(300);
  if (!w.__t.spec) return ['bookSpec is not exported — cannot check the term windows'];
  const bad = [];

  /* THE STEP MUST NOT OFFER THE NAME TWICE EITHER. Two identical buttons is not a choice anybody
     can make, and it is the half a person sees before the price is ever wrong. */
  const st = (w.__t.STEPS || []).filter(x => x.id === 'interval')[0];
  if (!st) bad.push('no interval step — cannot check what the term question offers');
  else {
    const offered = st.options();
    if (offered.length !== new Set(offered.map(x => String(x).toLowerCase())).size) {
      bad.push('the term question offers ' + JSON.stringify(offered)
             + ' — one name, two buttons');
    }
  }

  const B = w.__t.BOOKING;
  B.kind = 'Instant class'; B.subjects = ['Maths']; B.level = 'GCSE';
  B.interval = ['Autumn 1']; B.n = '1'; B.slots = ['m13', 'm14'];
  const spec = w.__t.spec();
  if ((spec.windows || []).length !== 1) {
    bad.push('one ticked term opened ' + (spec.windows || []).length + ' windows: '
           + JSON.stringify(spec.windows));
  }
  if (spec.interval !== 'Autumn 1') {
    bad.push('the Term row reads ' + JSON.stringify(spec.interval)
           + ' for one ticked term');
  }
  /* AND THE SESSIONS ARE INSIDE THAT ONE TERM, which is the thing the report was actually about: a
     second window a year away shows up as a date in the wrong year on the Dates row, and that is
     what the family would have been billed for. */
  if (w.__t.price) {
    const L = w.__t.price() || {};
    const out = (L.sessionDates || []).filter(d => d.getFullYear() !== 2026);
    if (out.length) {
      bad.push(out.length + ' of ' + (L.sessionDates || []).length
             + ' sessions fall outside the ticked term: '
             + out.map(d => d.getFullYear()).join(', '));
    }
  }
  return bad;
});

check('a session at the client\'s own home cannot be booked for one', async () => {
  /* ---------- ASKED FOR AS A FLOOR AND AS AN OPTION THAT MUST NOT EXIST -------------------------
     *"if its at clients house, then it should minimum 3 extra seats. there should be no option for 1
     extra seat."* The second sentence is what the first one means: `BOOKING.n` is the TOTAL, so
     three extra is four chairs and 1, 2 and 3 are not offered at all.

     TWO HALVES AND BOTH ARE ASSERTED, because they used to disagree. `seatLimits` has had a minimum
     since it was written — a venue with a minimum party size sets one — and the seats step's option
     list ignored it, starting at 1 whatever it said, so the refusal one line below was refusing
     numbers the list had just offered. The list starts at the floor now.

     AND THE SENTENCE IS IN THE ROW'S OWN UNITS. `lim.min` is a total and the row draws extras, so a
     refusal reading "needs 4" under a control offering 0, 1, 2 and 3 is the same fact in two units an
     inch apart — the shape this repository records under `needs_print` / `print_required`. */
  const { w } = boot();
  await wait(300);
  if (!w.__t.seatLimits || !w.__t.STEPS) return ['seatLimits is not exported — cannot check the floor'];
  const bad = [];
  const B = w.__t.BOOKING;
  const st = w.__t.STEPS.filter(x => x.id === 'n')[0];
  if (!st) return ['the form has no seats step called `n`'];

  /* THE FLOOR ITSELF, asked of the one function that decides it. */
  if (w.__t.seatLimits(null, null, 'At home').min < 4) {
    bad.push('a session at home has a seat floor of '
             + w.__t.seatLimits(null, null, 'At home').min + ', not 4');
  }
  if (w.__t.seatLimits(null, null, '').min !== 1) {
    bad.push('an unanswered venue imposes a floor of ' + w.__t.seatLimits(null, null, '').min);
  }
  /* A FREE ROOM IS NOT A HOUSE. The first version asked `isHome`, which is "does anybody pay for
     this room" — true of `Online` and of every free library — so a one-to-one video call needed four
     chairs. Two free venues are put on the payload for the question, and a house by name beside
     them so the rule is asked in both directions on one list. */
  const V = w.__t.DATA().venues = (w.__t.DATA().venues || []).concat([
    { title: 'Online', bestRate: 0 }, { title: 'Sutton Library', bestRate: 0 },
    { title: 'Client House', bestRate: 0 }]);
  ['Online', 'Sutton Library'].forEach(n => {
    if (w.__t.seatLimits(null, null, n).min !== 1) {
      bad.push('a session at "' + n + '", which costs nothing and is not anybody\'s house, has a seat floor of '
               + w.__t.seatLimits(null, null, n).min);
    }
  });
  if (w.__t.seatLimits(null, null, 'Client House').min < 4) {
    bad.push('a venue called "Client House" is not given the home floor');
  }
  V.splice(-3, 3);

  B.loc = 'At home';
  const home = st.options();
  if (home.indexOf('1') !== -1 || home.indexOf('2') !== -1 || home.indexOf('3') !== -1) {
    bad.push('at home the seats list still offers ' + JSON.stringify(home));
  }
  if (!home.length) bad.push('at home the seats list is empty, which greys the row');
  /* THE REFUSAL SPEAKS EXTRAS. `1` is one chair, which is nought extra. */
  const why = String(st.why('1') || '');
  if (!why) bad.push('one seat at home is not refused at all');
  else if (/\b4\b/.test(why) || why.indexOf('extra seat') === -1) {
    bad.push('the refusal reads ' + JSON.stringify(why) + ' — a total where the row draws extras');
  }

  B.loc = '';
  const away = st.options();
  if (away.indexOf('1') === -1) {
    bad.push('with no venue chosen the seats list is ' + JSON.stringify(away)
             + ' — the floor has leaked onto every booking');
  }
  if (st.why('1')) bad.push('one seat with no venue chosen is refused: ' + st.why('1'));
  return bad;
});

check('a receipt lights every day its booking runs on', async () => {
  /* ---------- THE WEEK WAS COMPARED TO ONE DAY NAME --------------------------------------------
     `jobGrid_` DID `norm(label) === norm(j.weekday)`, and `weekday` holds what `bookSpec` sent:
     every day the booking runs, joined with commas. So `norm('Monday')` never equalled
     `norm('Monday, Friday')` — not for Monday and not for Friday — and a two-day booking lit
     NOTHING. Measured: 2 cells on a one-day job, 0 on a two-day one, 0 on a three-day one.

     THE TALLEST BLOCK ON THE RECEIPT, DARK, on exactly the bookings somebody most needs to check,
     and it reads as a week with no session in it rather than as a fault. That grid exists, by its
     own note, so a family can SEE when their session runs instead of reading it off a line.

     THE SPAN IS ONE SPAN and is shown on each named day, because `start_time` and
     `hours_per_session` are single cells on the job row. */
  const { w } = boot();
  await wait(300);
  if (!w.__t.jobGrid) return ['jobWeekRows_ is not exported — cannot check the receipt week'];
  const lit = wd => (String(w.__t.jobGrid({ weekday: wd, time: '10:00', hours: 2 }))
    .match(/class="hr on/g) || []).length;
  const bad = [];
  [['Monday', 2], ['Monday, Friday', 4], ['Monday, Wednesday, Friday', 6]].forEach(([wd, want]) => {
    const got = lit(wd);
    if (got !== want) bad.push('"' + wd + '" lights ' + got + ' cells, wanted ' + want);
  });
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

  /* ---------- THE STATE ROWS ARE ON THE BLANK FORM, AND THEY ARE EMPTY ---------------------------
     THE STAGE ROWS ARE PINNED TO THE END OF THE SPINE so the document reads the same from the first
     question to the last payment — which is the invariant, and it is untouched by what those rows
     look like. On a form nobody has sent they have nothing to report: `Status` prints `—` like
     every other unanswered row, and the stages print an EMPTY TICK BOX, which is the same
     "nothing yet" with the difference that it also says what will be reported.

     `Stage` AND `Asked for` WERE TWO OF THE THREE THIS ASKED ABOUT. Both are gone — see
     `JOB_STAGES` in book.js: the sentence is what the ticks say in words and the date is the
     `Requested` tick's own value. So the rule is the same rule against the rows that exist.

     READ OFF `bk-k`/`bk-v`, WHICH IS THE MARKUP THE FORM ACTUALLY USES. The first version of this
     looked for `</tr>` and reported all three rows missing — they were present and already correct,
     and the check was describing its own selector rather than the page. A row here is a
     `div.bk-row` of spans, and the value is the `bk-v` following the `bk-k` that carries the label.

     THE TICK IS READ OFF THE WHOLE CELL rather than its text, because a ticked and an unticked box
     hold the SAME GLYPH and are told apart by one class. A rule reading the text would pass on both
     — which is the shape of every inert check this repository has deleted. */
  const cellOf = (html, label, whole) => {
    const k = html.indexOf('<span class="bk-k">' + label + '</span>');
    if (k < 0) return null;
    const v = html.indexOf('bk-v', k);
    if (v < 0) return null;
    const cell = html.slice(v, html.indexOf('</span>', v));
    return whole ? cell : cell.replace(/^[^>]*>/, '').trim();
  };
  /* THE FIVE, READ OFF THE APP so a stage added or renamed needs nothing changed here. A list
     written out in this file would be a second copy of `JOB_STAGES` to keep in step. */
  const STAGES = (w.__t.JOB_STAGES || []).map(s => s.row);
  const dashes = (html, where) => {
    /* READ OFF THE APP, SO A STAGE ADDED NEEDS NOTHING HERE. This asserted `length !== 5` beside a
       list it had just derived from `JOB_STAGES` — a number in a sentence nobody re-reads, sitting
       one line under the thing that made the number unnecessary. What is worth refusing is an
       EMPTY list, which is this check unable to reach its subject. */
    if (!STAGES.length) bad.push('JOB_STAGES has no rows, so the stage ticks cannot be checked');
    const v = cellOf(html, 'Status');
    if (v === null) bad.push(`the ${where} booking form has no "Status" row`);
    else if (v !== '—') {
      bad.push(`"Status" on the ${where} form reads ${JSON.stringify(v)}, not a dash`);
    }
    STAGES.forEach(label => {
      const cell = cellOf(html, label, true);
      if (cell === null) bad.push(`the ${where} booking form has no "${label}" row`);
      else if (cell.indexOf('bk-tick') === -1) {
        bad.push(`"${label}" on the ${where} form is not drawn as a tick box`);
      } else if (/bk-tick[^"]*\bon\b/.test(cell)) {
        bad.push(`"${label}" is ticked on the ${where} form, which nobody has sent`);
      }
    });
  };
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
  P.slots = ['m16']; P.interval = ['Autumn 1'];
  const priced = formPage();
  if (!w.__t.paper || w.__t.paper()) dashes(priced, 'priced');

  const B = w.__t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.how = 'A session of your own'; B.level = 'GCSE'; B.loc = 'Colliers Wood Library';
  B.subjects = ['Maths']; B.n = '1'; B.hosting = 'No — we book the room';
  B.slots = ['m16']; B.interval = ['Autumn 1'];
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
  /* ---------- `Requested` IS TICKED THE MOMENT IT IS SENT, AND ONLY ON THE SECOND DOCUMENT -------
     ASKED FOR AS *"a line for requested and it gets ticked automatically by system"* — so this is
     that sentence as a rule: nothing was ticked a moment ago, `book-send` has now gone, and the
     receipt under the form has its first box filled in. The form above it still has five empty
     ones, which is the spine's own argument about a document reading the same either side of a
     send, and the test that stops the tick being drawn on everything.

     IT REPLACES A COUNT OF THE WORD "Stage". That version asked only that the string appeared
     twice, so it would have passed on two blank forms — it was there to say "the second document
     is the booking widget" and could not say the widget had anything in it. */
  const ticked = s => (s.match(/class="bk-tick on"/g) || []).length;
  if (ticked(formPage()) < 1) {
    bad.push('nothing is ticked after the booking was sent, so the receipt is not under the form');
  }
  if (ticked(before) !== 0) {
    bad.push('the blank form had a ticked stage on it before anything was sent');
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
  /* `#s-booking` RATHER THAN THE SHEET — see the note on the admin journey above. `joinTile_` is
     what offers the seat and `jobPage_` draws it on the receipt's foot, so the control is on the
     page the app turns to. Where on the page is the journey after this one's question. */
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

/* ---------- THE WAY IN IS A LINE AND A TILE OF THE PAPER, NOT A BLOCK UNDER IT ----------------------
   ASKED FOR AS *"the session booking thing at the bottom of receipt should be a line in the
   booking."* `joinBlock` drew, after the receipt, a sentence with the seats and the seat price, the
   list's tally, a gold `Take a seat` and a faint paragraph — on black, under a card it belonged to.
   The journey above asked only that the right ACT was offered somewhere on the column, which the
   block passed while floating; this asks WHERE, for both kinds of joining:

     · nothing under the paper — no `.join`, and no control on the page outside `.rc`
     · the act is a TILE in the receipt's own foot (`.rc .rc-tiles`), first, before Share
     · the seats are a row of the document — `Sharing`, inside `.rc` — and an open session no longer
       says "Just you" on the page that offers you a seat on it
     · the list's tally is a `Can come` row of the paper, and it is there for somebody ON the list
       too, which the block never was — `canAsk` hid it from everybody already in

   PRESSED THROUGH THE TILE ITSELF, not through `ACTIONS`: a tile with the right `data-do` and no
   `data-id` would pass a lookup and find no class when tapped. */
const joinPage_ = (w, id) => {
  w.__t.ACTIONS['job']({ dataset: { id } });
  return [...w.document.querySelectorAll('#s-booking .page')]
    .find(p => new RegExp('\\b' + id + '\\b').test((p.querySelector('.rc-ref') || {}).textContent || ''));
};
const rowSays_ = (pg, k) => {
  const r = [...pg.querySelectorAll('.rc .bk-row')]
    .find(x => ((x.querySelector('.bk-k') || {}).textContent || '').trim() === k);
  return r ? r.querySelector('.bk-v').textContent.replace(/\s+/g, ' ').trim() : null;
};
const onPaperOnly_ = (pg, bad) => {
  if (pg.querySelector('.join') || pg.ownerDocument.querySelector('#s-booking .join')) {
    bad.push('a .join block is still drawn under the paper');
  }
  const loose = [...pg.querySelectorAll('[data-do]')].filter(x => !x.closest('.rc'));
  if (loose.length) bad.push('controls float outside the paper: ' + loose.map(x => x.dataset.do).join(', '));
};

check('a class with seats offers Take a seat as a tile on its receipt, and its seats as a line', async () => {
  const { w } = boot();
  await wait(300);
  w.__t.USER({ name: 'Somebody Else', personId: 'P9', role: 'parent', roles: ['parent'] });
  let pg;
  try { pg = joinPage_(w, 'W-LIST'); } catch (e) { return ['opening the class threw: ' + e.message]; }
  if (!pg) return ['the class has no page on the Booking column — nothing to look at'];
  const bad = [];
  onPaperOnly_(pg, bad);
  const foot = [...pg.querySelectorAll('.rc .rc-tiles [data-do]')].map(x => x.dataset.do);
  const tile = pg.querySelector('.rc .rc-tiles [data-do="job-take-seat"]');
  if (!tile) bad.push('no Take a seat tile in the receipt\'s foot (the foot holds: ' + foot.join(', ') + ')');
  else {
    if (!tile.classList.contains('tile')) bad.push('Take a seat is in the foot but is not a tile');
    if (tile.dataset.id !== 'W-LIST') bad.push('the Take a seat tile carries no id for the class');
    if (foot[0] !== 'job-take-seat') bad.push('Take a seat is not first in the foot: ' + foot.join(', '));
  }
  if (foot.includes('job-join')) bad.push('a class offers Ask to join, which is the act for a family\'s session');
  const sharing = rowSays_(pg, 'Sharing');
  if (sharing == null) bad.push('no Sharing row on the class\'s paper');
  else if (!/2 seats free/.test(sharing)) bad.push('the Sharing row says "' + sharing + '", wanted the 2 seats going');
  const seat = [...pg.querySelectorAll('.rc .rc-total .bk-t')].map(x => x.textContent.trim());
  if (!seat.includes('£19.00')) bad.push('the seat price is not on the paper\'s total row: ' + JSON.stringify(seat));
  const can = rowSays_(pg, 'Can come');
  const bars = pg.querySelectorAll('.rc .bk-row.bk-tally .wc-row').length;
  if (can == null) bad.push('the list\'s tally is not a Can come row of the paper');
  else if (bars !== 2 || !/Monday evening/.test(can)) bad.push('the Can come row draws ' + bars + ' bars ("' + can + '"), wanted the 2 slots sent');

  /* AND SOMEBODY ON THE LIST SEES THE TALLY TOO, and is offered no seat they already have. */
  w.__t.USER({ name: 'Danile Cristina', personId: 'P7', role: 'parent', roles: ['parent'] });
  const D = w.__t.DATA();
  (D.liveJobs || []).forEach(j => { if (j.id === 'W-LIST') j.canAsk = false; });
  let mine;
  try { mine = joinPage_(w, 'W-LIST'); } catch (e) { return bad.concat(['opening it as a member threw: ' + e.message]); }
  if (!mine) bad.push('the list has no page for a family on it');
  else {
    if (mine.querySelector('[data-do="job-take-seat"]')) bad.push('a family already on the list is offered a seat');
    if (rowSays_(mine, 'Can come') == null) bad.push('a family on the list cannot see when the others can come');
  }

  /* THE TILE IS WIRED: pressed as a finger would, it fills the form in for this class. */
  if (tile) {
    w.__t.USER({ name: 'Somebody Else', personId: 'P9', role: 'parent', roles: ['parent'] });
    (D.liveJobs || []).forEach(j => { if (j.id === 'W-LIST') j.canAsk = true; });
    const t = joinPage_(w, 'W-LIST').querySelector('.rc-tiles [data-do="job-take-seat"]');
    t.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(250);
    if (!/wait/i.test(String(w.__t.BOOKING.how || '')) || !w.__t.BOOKING.joining) {
      bad.push('pressing the Take a seat tile did not turn to the form for this class');
    }
  }
  return bad;
});

check('a session a family booked offers Ask to join as a tile, and says its seats are open', async () => {
  /* ONE MORE SESSION, OPEN, SEEN BY SOMEBODY NOT ON IT — in the shape `doGet` sends a stranger: no
     names on the seats, no `splitEmails` (that goes only to the family who typed the addresses),
     `canAsk` worked out by the server. Added to this journey's payload alone, so no other journey's
     column grows a page. */
  const p = payload();
  const open = { id: 'J-OPEN', jobId: 'J-OPEN', type: 'job', kind: '', status: 'unconfirmed',
    subject: 'Maths', level: 'GCSE', title: 'GCSE Maths', price: 240, location: 'Mitcham library',
    tutor: '', weekday: 'Wednesday', time: '17:00', hours: '1', term: 'Autumn 1', dates: '',
    maxKids: 4, currentKids: 1, slots: [{ n: 1, client: '', status: 'Agreed', chat: '' }],
    tutorSlots: [], events: [], canAsk: true, seatsGoing: 3, openToOthers: true, splitEmails: '',
    whenCould: null, client: '' };
  p.jobs.push(open);
  const { w } = boot({ payload: p });
  await wait(300);
  w.__t.USER({ name: 'Somebody Else', personId: 'P9', role: 'parent', roles: ['parent'] });
  let pg;
  try { pg = joinPage_(w, 'J-OPEN'); } catch (e) { return ['opening the session threw: ' + e.message]; }
  if (!pg) return ['the open session has no page on the Booking column — nothing to look at'];
  const bad = [];
  onPaperOnly_(pg, bad);
  const foot = [...pg.querySelectorAll('.rc .rc-tiles [data-do]')].map(x => x.dataset.do);
  const tile = pg.querySelector('.rc .rc-tiles [data-do="job-join"]');
  if (!tile) bad.push('no Ask to join tile in the receipt\'s foot (the foot holds: ' + foot.join(', ') + ')');
  else if (tile.dataset.id !== 'J-OPEN' || foot[0] !== 'job-join' || !foot.includes('book-share')) {
    bad.push('Ask to join is not first beside Share with its id: ' + foot.join(', '));
  }
  if (foot.includes('job-take-seat')) bad.push('a family\'s session offers Take a seat, which is the act for a list');
  const sharing = rowSays_(pg, 'Sharing');
  if (sharing == null) bad.push('no Sharing row on the session\'s paper');
  else if (/just you/i.test(sharing) || !/3 seats free/.test(sharing)) {
    bad.push('the Sharing row says "' + sharing + '" on a session offering you one of its 3 seats');
  }
  if (rowSays_(pg, 'Can come') != null) bad.push('a session with a day draws a waiting list\'s tally');

  /* "JUST YOU" IS STILL THE ANSWER WHERE IT IS TRUE: nothing going and nobody named. */
  const rows = w.__t.jobRows(Object.assign({}, open, { seatsGoing: 0 }));
  const full = (rows.find(r => r.k === 'Sharing') || {}).v;
  if (full !== 'Just you') bad.push('a session with no seat going says "' + full + '", wanted "Just you"');

  if (tile) {
    tile.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(250);
    if (!/instant/i.test(String(w.__t.BOOKING.how || '')) || !w.__t.BOOKING.joining) {
      bad.push('pressing the Ask to join tile did not turn to the form for this session');
    }
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

check('a student sees their parents, a parent their children, on the account column', async () => {
  /* ---------- ASKED FOR AS "students should be able to see their parents and likewise" ------------
     WHO IS IN `DATA.family` IS THE SERVER'S QUESTION and `check-profile.js` asks it through the real
     `doGet`: accepted links only, the token's own family only. This asks the other half — that the
     column draws a card for each person it was sent, labelled with which side of the link they are
     on, once each, and nothing at all when an older backend sent no key. */
  const { w, sent } = boot();
  await wait(400);
  if (!w.__t.accountPages) return ['accountPages_ is not exported — cannot check the account column'];
  const bad = [];
  const D = w.__t.DATA();
  const heads = () => w.__t.accountPages().map(h => (h.match(/<h3>([^<]*)/) || [])[1] || '').map(x => x.trim());
  const names = () => w.__t.accountPages().join('');

  w.__t.USER({ name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'] });
  delete D.family;
  const before = w.__t.accountPages().length;
  if (heads().some(h => /^Your (parent|child)/.test(h))) bad.push('with no `family` key a family card was drawn anyway');

  D.family = [
    { personId: 'P-P', title: 'Pat Parentworth', relation: 'parent', handle: 'pat_calm12', image: '' },
    { personId: 'P-S', title: 'Sam Student', relation: 'child', handle: 'sam_calm13', image: '' },
  ];
  /* A LIST BUILT FOR SOMEBODY ELSE, OR STAMPED BY NOBODY, DRAWS NOTHING. `DATA` outlives a sign-out
     and signing in paints before the new payload lands, so a phone handed from Pat to another
     family's child would otherwise show Pat's family as theirs. */
  D.familyFor = 'P-P';
  if (heads().some(h => /^Your (parent|child)/.test(h))) bad.push('a family list built for somebody else (P-P) was drawn on P-S\'s account column');
  delete D.familyFor;
  if (heads().some(h => /^Your (parent|child)/.test(h))) bad.push('a family list with no `familyFor` stamp was drawn');
  D.familyFor = 'P-S';
  const hs = heads();
  if (hs.filter(h => h === 'Your parent').length !== 1) bad.push('a student sent one parent drew ' + hs.filter(h => h === 'Your parent').length + ' "Your parent" card(s)');
  if (!/Pat Parentworth/.test(names())) bad.push('the parent\'s name is not on the student\'s account column');
  if (hs.some(h => h === 'Your child')) bad.push('a family entry for the signed-in person themselves was drawn as a card');
  if (w.__t.accountPages().length !== before + 1) bad.push('one parent added ' + (w.__t.accountPages().length - before) + ' page(s), not 1');

  /* AND A BROTHER OR SISTER, ON *"students should be able to see their parents and siblings
     likewise"*. `doGet` sends `relation: 'sibling'` for another child of an accepted parent; the
     column draws it under its own label, once, and the parent's card is still there beside it. A
     relation this phone has no label for is drawn as nothing, which is what an older phone does
     with a newer backend's rows. */
  {
    const held = D.family;
    D.family = held.concat([{ personId: 'P-S2', title: 'Sasha Student', relation: 'sibling', handle: 'sasha_kind14', image: '' },
                            { personId: 'P-X', title: 'Xan Unknownrel', relation: 'cousin', handle: 'xan_odd15', image: '' }]);
    const hs2 = heads();
    if (hs2.filter(h => h === 'Your brother or sister').length !== 1) bad.push('a student sent one sibling drew ' + hs2.filter(h => h === 'Your brother or sister').length + ' "Your brother or sister" card(s)');
    if (!/Sasha Student/.test(names())) bad.push('the sibling\'s name is not on the student\'s account column');
    if (hs2.filter(h => h === 'Your parent').length !== 1) bad.push('adding a sibling lost or doubled the parent card');
    if (/Xan Unknownrel/.test(names())) bad.push('a relation with no label (cousin) was drawn anyway');
    D.family = held;
  }

  /* A PARENT WHO IS ALSO A TUTOR IS DRAWN ONCE, here, and not again in the list of tutors below. */
  /* Seeded rather than taken from the fixture, whose one tutor carries no `personId` — and the
     match between a family entry and a tutor row is by that id and nothing else. */
  const heldTutors = D.tutors;
  const tutor = Object.assign({}, (D.tutors || [])[0] || {}, { personId: 'P-TP', title: 'Terry Tutorparent', handle: 'terry_kind21' });
  D.tutors = (D.tutors || []).concat([tutor]);
  {
    w.__t.USER({ name: 'Kid Two', personId: 'P-K2', role: 'student', roles: ['student'] });
    D.family = [{ personId: tutor.personId, title: tutor.title, relation: 'parent', handle: tutor.handle, image: '' }];
    D.familyFor = 'P-K2';
    const parentHeads = heads().filter(h => /^Your parent/.test(h));
    if (parentHeads.length !== 1) bad.push('a parent who is a tutor drew ' + parentHeads.length + ' family card(s)');
    const pagesWith = w.__t.accountPages().filter(h => h.indexOf('>' + tutor.title + '<') !== -1).length;
    if (pagesWith !== 1) bad.push('a parent who is also a tutor is on ' + pagesWith + ' pages of the column, not 1');
  }
  D.tutors = heldTutors;

  /* AND A PARENT SEES THEIR CHILD. */
  w.__t.USER({ name: 'Pat Parentworth', personId: 'P-P', role: 'client', roles: ['client'] });
  D.family = [{ personId: 'P-S', title: 'Sam Student', relation: 'child', handle: 'sam_calm13', image: '' }];
  D.familyFor = 'P-P';
  if (heads().filter(h => h === 'Your child').length !== 1) bad.push('a parent sent one child did not draw one "Your child" card');

  /* AND THE REQUEST THAT BECOMES A LINK. A parent's "this is my child" waits on the child, and the
     account column is the only place it is drawn — before this it was built by `meRest_`, which
     nothing calls, so no claim was ever answerable and no family could form from the app. It is the
     child's own and held to the same `familyFor` stamp; pressing yes posts `answerClaim` with that
     row and takes the card off at once rather than when the payload lands. */
  w.__t.USER({ name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'], token: 'tk' });
  D.family = []; D.familyFor = 'P-S';
  D.claims = [{ rowIndex: 7, from: 'Pat Parentworth', asked: '01/10/2026' }];
  if (!/Pat Parentworth says they are your parent/.test(names())) bad.push('a claim waiting on the child is not on the child\'s account column');
  D.familyFor = 'P-P';
  if (/says they are your parent/.test(names())) bad.push('a claim list built for somebody else was drawn');
  D.familyFor = 'P-S';
  try { w.__t.go('account', false, true); w.paint('account'); } catch (e) { bad.push('drawing the account column threw: ' + e.message); }
  const yes = w.document.querySelector('#s-account [data-do="claim-yes"]');
  if (!yes) bad.push('the claim card on the account column has no Yes button');
  else {
    sent.length = 0;
    w.__t.ACTIONS['claim-yes'](yes);
    await wait(300);
    const post = sent.find(b => b.action === 'answerClaim');
    if (!post) bad.push('pressing Yes posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no answerClaim');
    else if (String(post.rowIndex) !== '7' || post.accept !== true) bad.push('pressing Yes posted ' + JSON.stringify(post) + ' — wanted row 7, accept true');
    if ((D.claims || []).length) bad.push('the answered claim is still in the list the column is drawn from');
  }
  delete D.family; delete D.familyFor; delete D.claims;
  w.__t.USER(null);
  return bad;
});

check('an admin sees everyone on the people column, and nobody else sees more than before', async () => {
  /* ---------- ASKED FOR AS "Admin should be able to see every one in the people column." ---------
     WHO IS IN `DATA.everyone` IS THE SERVER'S QUESTION and `check-profile.js` asks it through the
     real `doGet` (admin token only, no private cell). This asks the phone's half: an admin's column
     draws one card per person sent, with a Message tile under it and no Listed switch; a student
     handed the same list — `DATA` outlives a sign-out — draws none of it; and nobody is drawn twice. */
  const { w } = boot();
  await wait(400);
  if (!w.__t.accountPages) return ['accountPages_ is not exported — cannot check the account column'];
  const bad = [];
  const D = w.__t.DATA();
  const all = () => w.__t.accountPages().join('');
  const count = n => w.__t.accountPages().filter(h => h.indexOf('>' + n + '<') !== -1).length;
  D.everyone = [
    { personId: 'P-E1', title: 'Evie Everystudent', handle: 'evie_calm31', role: 'Student', image: '' },
    { personId: 'P-E2', title: 'Carl Everyclient', handle: 'carl_kind32', role: 'Client', image: '' },
    { personId: 'P-AD', title: 'Ada Admin', handle: 'ada_brave33', role: 'Client', image: '' },
  ];
  w.__t.USER({ name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'] });
  if (/Evie Everystudent|Carl Everyclient/.test(all())) bad.push('a student was drawn the admin\'s `everyone` list');

  w.__t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk' });
  if (count('Evie Everystudent') !== 1) bad.push('an admin\'s column drew the student ' + count('Evie Everystudent') + ' time(s), not once');
  if (count('Carl Everyclient') !== 1) bad.push('an admin\'s column drew the client ' + count('Carl Everyclient') + ' time(s), not once');
  if (count('Ada Admin') !== 1) bad.push('the admin is on ' + count('Ada Admin') + ' pages of their own column, not 1');
  const evie = w.__t.accountPages().find(h => h.indexOf('>Evie Everystudent<') !== -1) || '';
  if (!/data-do="msg-open"/.test(evie)) bad.push('a student on the admin\'s column has no Message tile');
  if (/data-do="set-listed"/.test(evie)) bad.push('a student on the admin\'s column carries the tutor-only Listed switch');
  if (/prof-nohours/.test(evie)) bad.push('a student on the admin\'s column is told they "haven\'t set their hours", a tutor\'s warning');
  delete D.everyone;
  if (/Evie Everystudent/.test(all())) bad.push('with no `everyone` key the student was drawn anyway');
  w.__t.USER(null);
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
    /* THE ONE DEFINITION, asked of the app rather than reproduced here. `PAGER[id]()` may answer
       with a list of names or with a count -- see the note over `pageCount` -- and reading `.length`
       off it was this journey keeping a second opinion about which. */
    try { says = w.__t.pageCount(id); }
    catch (e) { bad.push(id + ' pager threw: ' + e.message); continue; }
    /* A SCREEN THAT DRAWS NO PAGES IS NOT PAGED AT ALL and its pager saying nothing is correct. */
    if (!drawn && !says) continue;
    /* ---------- A WINDOWED SCREEN HOLDS FEWER ELEMENTS THAN IT HAS PAGES ---------------------------
       The Find screen keeps `STUFF_WIN` result pages in the document and slides them -- see
       `stuffWindow_` in find.js -- so its element count is capped on purpose and comparing it
       against the total would report the window as the fault. The question is the same one: does
       the screen hold every page it is able to. */
    const keep = (w.__t.PAGE_KEEP && w.__t.PAGE_KEEP[id]) || 0;
    const want = keep ? Math.min(says, keep + (w.__t.STUFF_WIN || 0)) : says;
    if (drawn !== want) {
      bad.push(id + ': ' + drawn + ' page' + (drawn === 1 ? '' : 's') + ' drawn, pager counts '
                  + says + (want === says ? '' : ' (window holds ' + want + ')')
                  + ' \u2014 so the header and the screen disagree and moving down will '
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

  /* THEY ARE TILES NOW — and the ROW is the receipt's foot, built once in `jobPage_`, so this
     hands back marks rather than a row of its own. A row here would be a row inside a row. */
  if (asking.indexOf('class="tile') === -1) {
    bad.push('the admin actions are not tiles — they should look like every other thing\'s actions');
  }
  if (asking.indexOf('tile-row') !== -1) {
    bad.push('`jobAdminTiles_` wraps its own `.tile-row` again — the row is the receipt\'s foot');
  }
  if (/<button class="btn/.test(asking)) {
    bad.push('a plain `.btn` came back in among the tiles');
  }
  return bad;
});

/* ---------- WHO IS SHOWN WHICH FIGURE, AND WHERE THE ACTIONS ARE ---------------------------------
   ASKED FOR AS *"for tutor they shouldnt see grand total client pays, only grand total they earn.
   admin should be able to see grand total client pays. total tutor earns, and how much admin
   earns"* and *"no floating tiles for already booked sessions"*. Nothing else can ask either:
   `check/ui.js` measures whether a figure FITS, and a tutor shown the client's total measures
   perfectly; `check/press.js` presses the tiles wherever they are.

   THE SAME JOB, READ BY THREE PEOPLE — the client on it, the tutor on it, an admin — and the
   figures are the payload's as `doGet` sends them to an admin, so what is asked is the DRAWING:
   which label the total carries and which figures are under it. What `doGet` withholds from whom is
   `check-profile.js`'s question (section 10), asked of the real `doGet`. */
check('each person sees their own figure on a session, and its tiles are on the paper', async () => {
  const { w } = boot();
  await wait(300);
  if (typeof w.__t.jobMoney !== 'function' || typeof w.__t.jobPage !== 'function') {
    return ['`jobMoney_` or `jobPage_` is not exported, so who sees which figure cannot be checked'];
  }
  const bad = [];
  const job = {
    id: 'J-M', jobId: 'J-M', kind: '', subject: 'Maths', level: 'GCSE', price: 270,
    tutorPay: 135, adminKeeps: 81, tutor: 'Ada Tutor', location: 'Colliers Wood Library',
    dates: '06/10/26, 13/10/26', startDate: '06/10/26', endDate: '13/10/26',
    slots: [{ n: 1, client: 'Rasa Poliksa', status: 'Booked' }],
    tutorSlots: [{ key: 'a', name: 'Ada Tutor', status: 'Confirmed' }], events: [],
  };
  const doc = h => { const d = w.document.createElement('div'); d.innerHTML = h; return d; };
  const totals = d => [...d.querySelectorAll('.rc .rc-total')]
    .map(r => r.querySelector('.bk-k').textContent.trim() + ' ' + r.querySelector('.bk-t').textContent.trim());

  /* THE CLIENT: what they pay, and not one other figure. */
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const c = totals(doc(w.__t.jobPage(job)));
  if (c.length !== 1 || !/270\.00/.test(c[0])) bad.push('the client sees ' + JSON.stringify(c) + ', wanted their £270.00 alone');
  if (c.some(x => /135|81\./.test(x))) bad.push('the client is shown what the tutor or the admin takes: ' + JSON.stringify(c));

  /* THE TUTOR: what they earn IN PLACE OF the client total — never beside it. */
  w.__t.USER({ name: 'Ada Tutor', personId: 'P2', role: 'tutor', roles: ['tutor'] });
  const t = totals(doc(w.__t.jobPage(job)));
  if (t.length !== 1 || !/^YOU EARN|^You earn/i.test(t[0]) || !/135\.00/.test(t[0])) {
    bad.push('the tutor sees ' + JSON.stringify(t) + ', wanted "You earn £135.00" alone');
  }
  if (t.some(x => /270\.00/.test(x))) bad.push('the tutor is shown the client\'s total: ' + JSON.stringify(t));
  /* A BLANK `tutor_pay` IS A DASH, NOT A NOUGHT — every job before the phone sent it. */
  const unpaid = w.__t.jobMoney(Object.assign({}, job, { tutorPay: '' }));
  if (unpaid.total !== '—') bad.push('an unrecorded tutor pay reads ' + JSON.stringify(unpaid.total) + ', wanted a dash');

  /* A SECOND TUTOR WHO HAS ONLY APPLIED is on `tutorSlots` and not in `j.tutor`, which is the first
     name on the roster — so a test of `j.tutor` alone would hand them the client's line. */
  w.__t.USER({ name: 'Ben Tutor', personId: 'P3', role: 'tutor', roles: ['tutor'] });
  const t2 = totals(doc(w.__t.jobPage(Object.assign({}, job, {
    tutorSlots: job.tutorSlots.concat([{ key: 'b', name: 'Ben Tutor', status: 'Applied' }]) }))));
  if (t2.length !== 1 || !/you earn/i.test(t2[0]) || t2.some(x => /270\.00/.test(x))) {
    bad.push('a tutor who has applied but is not first on the roster sees ' + JSON.stringify(t2) + ', wanted "You earn"');
  }

  /* THE ADMIN: all three, as rows of the paper — no block under it. */
  w.__t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
  const ad = doc(w.__t.jobPage(job));
  const a = totals(ad);
  const want = [/client pays.*270\.00/i, /tutor earns.*135\.00/i, /admin earns.*81\.00/i];
  if (a.length !== 3 || want.some((re, i) => !re.test(a[i] || ''))) {
    bad.push('the admin sees ' + JSON.stringify(a) + ', wanted Client pays £270.00, Tutor earns £135.00, Admin earns £81.00');
  }
  if (ad.querySelector('.money-note')) bad.push('a money block still floats under the paper');
  /* A WAITING LIST'S `price` IS ONE SEAT, so the admin's line must not call it what the client pays. */
  const wl = totals(doc(w.__t.jobPage(Object.assign({}, job, { kind: 'waitlist' }))));
  if (!/^each seat pays/i.test(wl[0] || '')) bad.push('an admin reading a waiting list sees ' + JSON.stringify(wl[0]) + ', wanted "Each seat pays" over the per-seat figure');

  /* THE TILES ARE THE RECEIPT'S FOOT. Every action on the page is inside `.rc`, and a session
     already paid for offers no Pay. */
  const loose = [...ad.querySelectorAll('[data-do]')].filter(x => !x.closest('.rc'));
  if (loose.length) bad.push('actions float outside the paper: ' + loose.map(x => x.dataset.do).join(', '));
  if (!ad.querySelector('.rc .rc-tiles [data-do="job-delete"]')) bad.push('the admin\'s tiles are not on the receipt\'s foot');
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const paid = doc(w.__t.jobPage(job));
  if (paid.querySelector('[data-do="job-pay"]')) bad.push('a session already booked and paid offers Pay');
  const owed = doc(w.__t.jobPage(Object.assign({}, job, { slots: [{ n: 1, client: 'Rasa Poliksa', status: 'Agreed' }] })));
  if (!owed.querySelector('.rc .rc-tiles [data-do="job-pay"]')) bad.push('an accepted, unpaid session has no Pay on its paper');

  /* AND THE FORM: an admin pricing a booking sees the two more rows; nobody else does. */
  if (typeof w.__t.formMoney === 'function') {
    const L = { total: 300, tutorPay: 150, profitTotal: 40 };
    w.__t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
    const fa = w.__t.formMoney(L);
    if (fa.more.length !== 2 || !/150\.00/.test(fa.more[0].t) || !/40\.00/.test(fa.more[1].t)) {
      bad.push('an admin pricing the form is not shown what the tutor and the business take');
    }
    w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
    if (w.__t.formMoney(L).more.length) bad.push('a client pricing the form is shown the split');
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
  /* `image/*` STILL, AND NOW `video/*` BESIDE IT — a post takes clips as well as photographs. The
     test reads the attribute rather than matching it whole, so the order the two are written in is
     not a fault. */
  const acc = (html.match(/id="cam-pick"[^>]*accept="([^"]*)"/) || [])[1] || '';
  if (!/type="file"/.test(html) || !/image\/\*/.test(acc)) {
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
  /* ---------- `Write a post` IS A TILE NOW, AND WHAT THIS ASSERTS IS THE OPPOSITE --------------
     THE LINE HERE WAS `if (/Write a post/i.test(html)) bad.push('… is back on the camera card')`,
     written the day it was removed on request. Taking it away left `on('new-post')` — the whole
     composer, the Drive folder picker, the link box, the poll — unreachable, and `check-doors.js`
     has reported it as its only HANDLER WITH NO DOOR ever since. It is back as a tile, because it
     is the answer to *"i would like to add more photos to my portfolio"*: there is no portfolio
     surface, the feed is the nearest honest reading, and a Drive link pasted into that composer
     lands in the posts SHEET rather than in this public repository.

     SO THE ASSERTION FLIPS AND GAINS A SECOND HALF. A door is not a door if nothing dispatches it,
     which is the fault the removal caused — so this asks for the `data-do`, not merely the words.
     What the OLD line was defending is still defended one line up: `Turn the camera on` must not
     come back, because that one was on the normal path rather than behind a failure. */
  if (!/Write a post/i.test(html)) bad.push('`Write a post` is gone from the camera card again');
  if (!/data-do="new-post"/.test(html)) {
    bad.push('`Write a post` is on the card with no `data-do="new-post"`, so nothing opens it');
  }

  /* SIGNED OUT THERE IS NO VIEWFINDER AT ALL. `feedCamCard_` renders a sentence instead, and a
     camera that starts for somebody who is not signed in is a permission prompt with no purpose. */
  w.__t.USER(null);
  if (typeof w.__t.makeScreen === 'function') {
    const out = String(w.__t.makeScreen() || '');
    if (/id="cam-view"/.test(out)) bad.push('the viewfinder is drawn for somebody who is not signed in');
  }
  return bad;
});

/* ---------- THE CAMERA ASKS FOR NOTHING UNTIL SOMEBODY SWIPES UP TO IT ------------------------------
   REPORTED AS *"the website seems to ask you for permission to use camera when you first load into it
   even though the camera widget is above the front door widget. it should only go when you swipe to
   go up."* Reproduced: the payload's arrival calls `repaint`, and `repaint` runs `startScreen_`
   BEFORE `paintPager` — which is what moves the feed to its front door. For that moment the feed is
   still on page 0, page 0 IS the camera when the calendar has no festive card, and `feedCamWatch_`
   asked for it. The column then settled on the newest post with the prompt over it.

   NOTHING HERE HAD EVER STOOD IN FOR `getUserMedia`, which is why it was never caught. jsdom has no
   `mediaDevices`, so `camStart_` said "no camera support" and returned — and a camera that can never
   start cannot be caught starting early. So this stands in for it through `boot`'s `before`, counts
   the ASKS (each one is a prompt on a phone that has not said yes) and the streams still OPEN (each
   one is a recording light), because "asked once" and "left nothing running" are both the promise.

   EVERY WAY IN, each on a fresh app, because the fault depended on the first paint and a reused app
   has had its first paint:
     · signed in, no festive card — the reported case, where page 0 is the camera
     · signed out — no viewfinder, so nothing to ask for even on its own page
     · a festive card above the camera — the front door is page 2 and the camera page 1
     · a festive card and no post at all — nothing under the camera, so it must not be the front door
     · to another column and back — on a post it asks nothing; on the camera page that IS arriving
     · refused — a repaint on the camera page does not ask again behind your back; the button does
     · a prompt still up when a repaint lands — one ask, and the stream reaches the card on screen */
const camBoot_ = o => {
  const gum = { asks: 0, open: 0, hold: null };
  const p = payload();
  if (!o.festive) p.festive = [];
  /* TWO POSTS UNDER THE CAMERA, because the front door is "the newest post" and `payload()` has
     none — with no post below it the camera is the last page, and the column cannot open past it. */
  if (!o.noPosts) {
    p.posts = [1, 2].map(i => ({ id: 'PO' + i, author: '@family.', handle: '@family.', avatar: '',
      image: '', media: [], caption: 'Post ' + i, body: '', location: '', when: '0' + i + '/09/2026',
      at: Date.UTC(2026, 8, i), pinned: false, active: true, waiting: false, refused: false,
      reactions: {}, comments: { total: 0, list: [] } }));
  }
  const b = boot({ payload: p, before: w => {
    try { if (o.user) w.localStorage.setItem('familyUser', JSON.stringify(o.user)); } catch (e) {}
    const stream = () => {
      let on = true;
      gum.open++;
      const track = { kind: 'video', stop() { if (on) { on = false; gum.open--; } } };
      return { getTracks: () => [track], getVideoTracks: () => [track] };
    };
    Object.defineProperty(w.navigator, 'mediaDevices', { configurable: true, value: {
      getUserMedia: () => {
        gum.asks++;
        if (o.refuse) return Promise.reject(Object.assign(new Error('refused'), { name: 'NotAllowedError' }));
        if (o.slow) return new Promise(ok => { gum.hold = () => ok(stream()); });
        return Promise.resolve(stream());
      },
      enumerateDevices: () => Promise.resolve([]),
    } });
  } });
  b.gum = gum;
  b.at = () => (b.w.__t && typeof b.w.__t.AT === 'function' ? b.w.__t.AT() : '?');
  b.page = () => (b.w.__t.PAGE() || {}).feed;
  b.cam = () => (typeof b.w.feedCamAt_ === 'function' ? b.w.feedCamAt_() : -1);
  return b;
};
/* PAST `afterSlide_`'s 300ms and any settle, which is when `goPage` runs `feedCamWatch_`. */
const CAM_SLIDE = 700;
/* AND LONGER ONLY WHEN THE ANSWER IS NOT IN YET -- for the waits that expect the camera TO be asked.
   Inside a full `check-all` beside eight browsers and other worktrees' runs, 700ms of wall clock was
   not always past the slide: "swiping up asked 0 time(s)" on two runs in a row, a different case each
   time, and never when this journey ran alone. A wait that expects NOTHING to happen keeps the fixed
   700ms, because absence cannot be polled for. */
const camAsked_ = async pred => { await wait(CAM_SLIDE); for (let i = 0; i < 40 && !pred(); i++) await wait(100); };

check('the camera asks for nothing until somebody swipes up to it', async () => {
  const bad = [];
  const rasa = { name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] };

  /* ---------- SIGNED IN, NO FESTIVE CARD: THE ONE THAT WAS REPORTED ---------------------------- */
  {
    const b = camBoot_({ user: rasa });
    await wait(400);
    if (!b.w.__t || typeof b.w.feedCamAt_ !== 'function') {
      return ['the app did not load, so the camera was NOT checked — not a pass'];
    }
    if (!b.w.document.getElementById('cam-view')) {
      return ['no viewfinder was drawn for somebody signed in, so there was nothing to catch starting — not a pass'];
    }
    if (b.at() !== 'feed') bad.push(`the app opened on ${b.at()}, not the feed, so this was not the first load reported`);
    if (b.gum.asks) {
      bad.push(`opening the app asked for the camera ${b.gum.asks} time(s) — it is one swipe UP from the front door and nobody swiped`);
    }
    if (b.page() !== b.cam() + 1) bad.push(`the feed opened on page ${b.page()}, not the newest post at ${b.cam() + 1}`);
    const before = b.gum.asks;
    b.w.__t.repaint(); await wait(CAM_SLIDE); await woken_();
    if (b.gum.asks !== before) bad.push('a repaint on the front door asked for the camera');

    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await camAsked_(() => b.gum.asks === before + 1);
    if (b.gum.asks !== before + 1) bad.push(`swiping up to the camera asked ${b.gum.asks - before} time(s), not once`);
    if (b.gum.open !== 1) bad.push(`swiping up to the camera left ${b.gum.open} stream(s) open, not one`);
    b.w.__t.goPage('feed', b.cam() + 1); await wait(CAM_SLIDE); await woken_();
    if (b.gum.open) bad.push('swiping back down to the newest post left the camera running');

    /* AWAY AND BACK, ON A POST: the column remembers where it was, and that is not the camera. */
    b.w.__t.go('stuff'); await wait(CAM_SLIDE); await woken_();
    b.w.__t.go('feed'); await wait(CAM_SLIDE); await woken_();
    if (b.gum.asks !== before + 1) bad.push('coming back to the feed on the newest post asked for the camera again');

    /* AWAY AND BACK, ON THE CAMERA PAGE: that IS arriving at it, and it starts — the camera has
       started on arrival rather than on a tap since the note over `camStart_` was written. */
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_();
    b.w.__t.go('stuff'); await wait(CAM_SLIDE); await woken_();
    if (b.gum.open) bad.push('leaving the feed from the camera page left the camera running');
    b.w.__t.go('feed'); await wait(CAM_SLIDE); await woken_(); await camAsked_(() => b.gum.asks === before + 3);
    if (b.gum.asks !== before + 3) bad.push(`coming back to the feed on the camera page asked ${b.gum.asks - before - 2} time(s), not once`);
    if (b.gum.open !== 1) bad.push(`coming back to the camera page left ${b.gum.open} stream(s) open, not one`);
  }

  /* ---------- SIGNED OUT ------------------------------------------------------------------------ */
  {
    const b = camBoot_({});
    await wait(400);
    if (b.gum.asks) bad.push('signed out, opening the app asked for the camera');
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_();
    if (b.gum.asks) bad.push('signed out, the camera page asked for a camera it draws no viewfinder for');
  }

  /* ---------- A FESTIVE CARD ABOVE THE CAMERA ---------------------------------------------------- */
  {
    const b = camBoot_({ user: rasa, festive: true });
    await wait(400);
    if (b.cam() !== 1) bad.push(`with one festive card the camera is page ${b.cam()}, not 1, so that case was NOT checked`);
    if (b.gum.asks) bad.push('with a festive card above the camera, opening the app asked for it');
    if (b.page() !== 2) bad.push(`with a festive card the feed opened on page ${b.page()}, not the newest post at 2`);
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await camAsked_(() => b.gum.asks === 1);
    if (b.gum.asks !== 1) bad.push(`with a festive card, swiping up to the camera asked ${b.gum.asks} time(s), not once`);
  }

  /* ---------- A FESTIVE CARD AND NO POST AT ALL ---------------------------------------------------
     With nothing under the camera, "the page after the camera" does not exist, and `pageHome_`'s
     clamp put the column ON the camera — the reported prompt arriving by a second road. */
  {
    const b = camBoot_({ user: rasa, festive: true, noPosts: true });
    await wait(400);
    if (b.gum.asks) bad.push('with a festive card and no posts, opening the app asked for the camera');
    if (b.page() === b.cam()) bad.push('with a festive card and no posts, the feed opened ON the camera page');
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await camAsked_(() => b.gum.asks === 1);
    if (b.gum.asks !== 1) bad.push(`with a festive card and no posts, turning to the camera asked ${b.gum.asks} time(s), not once`);
  }

  /* ---------- REFUSED, THEN A REPAINT -------------------------------------------------------------
     The inbox landing and the profile refresh each repaint, and a repaint redraws the card — so a
     camera that was refused used to be asked for again by whatever landed next, which is a prompt on
     Safari that nobody swiped for. */
  {
    const b = camBoot_({ user: rasa, refuse: true });
    await wait(400);
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await camAsked_(() => b.gum.asks === 1);
    if (b.gum.asks !== 1) bad.push(`refused: swiping up asked ${b.gum.asks} time(s), not once`);
    b.w.__t.repaint(); await wait(CAM_SLIDE); await woken_();
    if (b.gum.asks !== 1) bad.push('refused: a repaint on the camera page asked again — a prompt nobody swiped for');
    const on = b.w.document.getElementById('cam-on');
    if (!on || on.hidden) bad.push('refused: after a repaint the card has no `Try the camera again`');
    const said = (b.w.document.getElementById('cam-said') || {}).textContent || '';
    if (!said.trim()) bad.push('refused: after a repaint the card no longer says why the camera did not start');
    if (on) { b.w.__t.ACTIONS['cam-on'](on); await wait(50); }
    if (b.gum.asks !== 2) bad.push('refused: `Try the camera again` did not ask again');
    b.w.__t.goPage('feed', b.cam() + 1); await wait(CAM_SLIDE); await woken_();
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await camAsked_(() => b.gum.asks === 3);
    if (b.gum.asks !== 3) bad.push('refused: swiping down and back up to the camera did not ask again');
  }

  /* ---------- THE PROMPT STILL UP WHEN A REPAINT LANDS --------------------------------------------
     `CAM_STREAM` is null until somebody answers, so a repaint in that moment used to ask a second
     time — and when both were granted the first stream was overwritten and never stopped. */
  {
    const b = camBoot_({ user: rasa, slow: true });
    await wait(400);
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_();
    b.w.__t.repaint(); await wait(50);
    if (b.gum.asks !== 1) bad.push(`a repaint while the prompt was up asked again — ${b.gum.asks} asks for one card`);
    if (b.gum.hold) { b.gum.hold(); await wait(50); }
    if (b.gum.open !== 1) bad.push(`the prompt answered left ${b.gum.open} stream(s) open, not one`);
    const v = b.w.document.getElementById('cam-view');
    if (!v || !v.srcObject) bad.push('the stream granted after a repaint went to the card that was replaced, not the one on the screen');
  }
  return bad;
});

/* ---------- POST, UNDER A POST, IS A TILE — AND KEEPS ITS MARK THROUGH THE WAIT ----------------------
   ASKED FOR AS *"post should be a tile too"*. Three things are held, because each one is a way the
   change can be half done:
     · THE COMPOSER'S ONLY CONTROL IS A TILE. Every button in `.cmt-form` is a `.tile`, there is
       exactly one, and it is still `cmt-add` on the post's own id with the `cmt-go` name — the
       paper aeroplane drawn, and "Post" in its name, since a tile has no word on it.
     · AN EMPTY BOX POSTS NOTHING, which is the refusal `check/press.js` already accepts.
     · THE MARK SURVIVES THE ROUND TRIP. The handler used to write "Posting…" into the control and
       put the old text back afterwards — on a tile that writes over the aeroplane and restores an
       empty string. So the press is read twice: at once (busy, disabled, mark still in the
       element), and after a refusal (not busy, enabled, mark back, the server's sentence under the
       box) — the refusal because it is the path that keeps the same element rather than
       repainting it away. Then a comment that goes through posts `addComment` with the words. */
check('Post under a post is a tile, and a comment keeps its mark through the wait', async () => {
  const rasa = { name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] };
  const p = payload();
  p.festive = [];
  p.posts = [1, 2].map(i => ({ id: 'PO' + i, author: '@family.', handle: '@family.', avatar: '',
    image: '', media: [], caption: 'Post ' + i, body: '', location: '', when: '0' + i + '/09/2026',
    at: Date.UTC(2026, 8, i), pinned: false, active: true, waiting: false, refused: false,
    reactions: {}, comments: { total: 0, list: [] } }));
  let refuse = true;
  const { w, sent } = boot({ payload: p,
    reply: b => (b.action === 'addComment' && refuse ? { error: 'That is too long to post.' } : { success: true }),
    before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(rasa)); } catch (e) {} } });
  await wait(400);
  const d = w.document, bad = [];
  w.__t.go('feed'); await wait(700);
  const form = d.querySelector('#s-feed .cmt-form');
  if (!form) return ['there is no comment composer on the feed for somebody signed in — nothing to press'];
  const post = form.closest('[data-post]'), id = post ? post.dataset.post : '';
  const ctl = [...form.querySelectorAll('button, a')];
  const loose = ctl.filter(x => !x.classList.contains('tile'));
  if (loose.length) bad.push('the comment composer still has ' + loose.length + ' control(s) that are not tiles: '
    + loose.map(x => (x.dataset.do || x.tagName) + ' "' + x.textContent.trim() + '"').join(', '));
  if (ctl.length !== 1) bad.push('the comment composer has ' + ctl.length + ' controls, wanted one — Post');
  const tile = form.querySelector('.tile[data-do="cmt-add"]');
  if (!tile) return bad.concat(['there is no cmt-add tile in the comment composer']);
  if (!tile.classList.contains('cmt-go')) bad.push('the Post tile lost the `cmt-go` name it is found by');
  if (!id || tile.dataset.id !== id) bad.push('the Post tile carries data-id ' + JSON.stringify(tile.dataset.id) + ' under post ' + JSON.stringify(id));
  if (!tile.querySelector('svg.tile-i-send')) bad.push('the Post tile has no paper aeroplane — `send` is the mark for sending');
  if (!/^Post\b/.test(tile.getAttribute('aria-label') || '')) bad.push('the Post tile is named ' + JSON.stringify(tile.getAttribute('aria-label')) + ', not "Post…"');

  const box = form.querySelector('.cmt-text');
  sent.length = 0;
  tile.click(); await wait(50);
  if (sent.some(b => b.action === 'addComment')) bad.push('an empty comment box posted addComment');

  box.value = 'Lovely to see this.';
  tile.click();
  if (!tile.disabled || !tile.classList.contains('is-busy')) bad.push('pressed, the Post tile is not disabled and busy while it waits');
  if (!tile.querySelector('svg.tile-i-send')) bad.push('pressed, the Post tile\'s mark was written over — the old "Posting…" swap');
  await wait(300);
  const said = form.querySelector('.cmt-said');
  if (tile.disabled || tile.classList.contains('is-busy')) bad.push('after a refusal the Post tile is still busy or disabled');
  if (!tile.querySelector('svg.tile-i-send')) bad.push('after a refusal the Post tile has no mark — the restore put text back over it');
  if (!said || !/too long/.test(said.textContent)) bad.push('the server\'s refusal is not under the box: ' + JSON.stringify(said && said.textContent));

  refuse = false;
  sent.length = 0;
  tile.click(); await wait(300);
  const c = sent.find(b => b.action === 'addComment');
  if (!c) bad.push('pressing Post with words in the box posted ' + JSON.stringify(sent.map(b => b.action)) + ', not addComment');
  else if (c.postId !== id || c.body !== 'Lovely to see this.' || c.personId !== 'P1')
    bad.push('addComment went out as ' + JSON.stringify({ postId: c.postId, body: c.body, personId: c.personId }));
  const after = d.querySelector('#s-feed .cmt-form .tile[data-do="cmt-add"]');
  if (!after || after.classList.contains('is-busy') || !after.querySelector('svg.tile-i-send'))
    bad.push('after a comment went through, the Post tile on the screen is missing, busy, or has lost its mark');
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

/* ---------- NOTHING OFFERS TO INSTALL, AND THE BROWSER IS NOT LEFT TO OFFER IT EITHER -------------
   THIS SPOT HELD "the install bar reaches somebody who has not signed in", and that journey went
   with the bar — the owner, 6 Oct: *"delete the suggester telling to bookmark"*. What the bar left
   behind was worse than either answer. me.js went on catching Chrome's `beforeinstallprompt`,
   cancelling the browser's own install bar and KEEPING the event for `installCard` — which nothing
   drew, because its only caller was `meRest_` and only the dead `mePages` reached that. So an
   Android visitor got no offer from the app and none from Chrome, a door called `install` stayed
   wired for a button that never appeared, and the comment over it said the offer "stays where
   somebody can go looking for it … on the You screen". `check-doors` passed all of it: it pairs a
   `data-do` with a handler wherever the string is WRITTEN, and written is not drawn.

   DECIDED: NOTHING SUGGESTS INSTALLING. Chrome's own mini-bar is a suggester too, in the browser's
   handwriting, so it stays cancelled; the browser MENU's Install / Add to Home Screen is left for
   anybody who goes looking. So this asks the running app four things, as the two people the old
   card was written for — somebody signed out on an iPhone, a parent on Android:
     · the offer is cancelled, so the mini-bar stays down;
     · nothing on the page changes when it arrives — a redraw is the app making room for an offer;
     · no `install` door is wired, so the event has nothing to be kept for;
     · and no screen draws an install button, the old bar, or the words "home screen". */
check('nothing offers to install, and the browser is not left to offer it either', async () => {
  const bad = [];
  const phones = [
    ['somebody signed out on an iPhone',
     'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
     null],
    ['a parent on Android',
     'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36',
     { name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] }],
  ];
  for (const [who, ua, user] of phones) {
    /* BEFORE THE APP RUNS, because a phone is a phone from its first line — anything asking the
       user agent at load must already get this answer. */
    const { w, errs } = boot({ before: win => Object.defineProperty(win.navigator, 'userAgent',
                                                 { value: ua, configurable: true }) });
    await wait(300);
    const t = w.__t;
    if (!t || !t.ACTIONS || !t.TABS) { bad.push(who + ': the app did not finish loading'); continue; }
    if (user) t.USER(user);

    /* THE OFFER AS CHROME SENDS IT: cancelable, with the `prompt()` that opens the real install
       dialog and the `userChoice` it settles. Counted, so anything that raises it later is seen. */
    let prompted = 0;
    const offer = new w.Event('beforeinstallprompt', { cancelable: true });
    offer.prompt = () => { prompted++; return Promise.resolve(); };
    offer.userChoice = Promise.resolve({ outcome: 'accepted' });

    /* WHAT THE PAGE DID ABOUT IT, read off the DOM rather than off a name. `takeRecords` straight
       after a synchronous dispatch holds exactly the mutations the listeners made — no timer can
       run in between — so a `repaint()` for an offer shows up here whatever it is called. */
    const watch = new w.MutationObserver(() => {});
    watch.observe(w.document.documentElement,
                  { childList: true, subtree: true, attributes: true, characterData: true });
    w.dispatchEvent(offer);
    const changed = watch.takeRecords().length;
    watch.disconnect();

    if (!offer.defaultPrevented) {
      bad.push(who + ': `beforeinstallprompt` was not cancelled, so Chrome slides up its own "Add to '
             + 'Home screen" bar — a suggester the owner asked to have gone, in the browser\'s handwriting');
    }
    if (changed) {
      bad.push(who + ': the install offer arriving changed ' + changed + ' thing(s) on the page — the '
             + 'app redrew for an offer, and nothing may make one');
    }
    if (Object.prototype.hasOwnProperty.call(t.ACTIONS, 'install')) {
      bad.push(who + ': a door called `install` is still wired — a handler kept for an install button, '
             + 'so the browser\'s offer is being held for something that may not be drawn');
    }

    /* EVERY SCREEN, read off `TABS` like the other walks here. Each one is drawn and then looked at
       for the three shapes an offer has had: the button, the old bar, and the words. */
    for (const id of t.TABS.map(x => x.id)) {
      try { t.go(id, false, true); } catch (e) { bad.push(who + ': ' + id + ' threw: ' + e.message); continue; }
      const el = w.document.getElementById('s-' + id);
      if (!el) continue;
      if (el.querySelector('[data-do="install"]')) bad.push(who + ': ' + id + ' draws an install button');
      /* A FEW WORDS EITHER SIDE, not the sentence: `textContent` runs one element's text into the
         next with no space, so "up to the full stop" can be half a screen. */
      const said = el.textContent.replace(/\s+/g, ' ').match(/.{0,30}home screen.{0,30}/i);
      if (said) bad.push(who + ': ' + id + ' says "…' + said[0].trim() + '…" — an install suggestion');
    }
    if (w.document.getElementById('install-bar')) bad.push(who + ': the install bar is back on the page');
    if (prompted) {
      bad.push(who + ': the browser\'s install dialog was opened ' + prompted + ' time(s) without anybody '
             + 'choosing Install from the browser menu');
    }
    if (errs.length) bad.push(who + ': errors: ' + errs.join(' | '));
  }
  return bad;
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

/* ---------- WHAT A TUTOR TEACHES: ONE CHIP A SUBJECT, ITS LEVELS RAISED ---------------------------
   *"what they teach should appear like Subject ^level, level, level. so like the levels are
   superscripted. no brackets."* The server sends one phrase per level, so the grouping is the
   card's, and every way it can go wrong draws perfectly: a subject twice in one row, a bracket left
   in, a level that was the specialism dragged out from under the gold edge, or the reverse. So this
   draws two tutors through the app's own `findCard` — one off the current backend, one off a
   backend old enough to send a single `teachesMain` string — and reads every chip back. */
check('what a tutor teaches is one chip a subject, its levels raised and no brackets', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const draw = row => { const box = d.createElement('div'); box.innerHTML = w.findCard({ kind: 'tutor', row }); return box; };
  /* A CHIP, READ BACK AS WHAT A PERSON SEES: the subject is the text outside the `<sup>`, the levels
     are the spans inside it. A row named by its caption, so the two rows cannot be confused. */
  const row = (box, cap) => {
    const c = [...box.querySelectorAll('.prof-cap')].find(x => x.textContent.trim() === cap);
    const tags = c && c.nextElementSibling ? [...c.nextElementSibling.querySelectorAll('.prof-tag')] : [];
    return tags.map(el => {
      const sup = el.querySelector('sup.prof-lv');
      return { said: (el.textContent.replace(sup ? sup.textContent : '', '').trim()
                      + (sup ? ' ^' + [...sup.querySelectorAll('span')].map(s => s.textContent.trim()).join(', ') : '')),
               main: el.classList.contains('is-main'), text: el.textContent };
    });
  };
  const bad = [];
  const want = (who, box, cap, list, main) => {
    const got = row(box, cap);
    if (JSON.stringify(got.map(g => g.said)) !== JSON.stringify(list)) {
      bad.push(who + ': "' + cap + '" reads ' + JSON.stringify(got.map(g => g.said)) + ', wanted ' + JSON.stringify(list));
    }
    if (got.some(g => g.main !== main)) bad.push(who + ': a chip under "' + cap + '" has the wrong edge (gold is the specialism)');
    if (got.some(g => /[()]/.test(g.text))) bad.push(who + ': a chip under "' + cap + '" still has a bracket in it');
  };
  /* THE CURRENT BACKEND: two specialisms in one subject, that subject again at a level that is NOT a
     specialism, a subject at two levels spelled two ways, one arriving bare AND with a level, and
     one bare and nothing else. */
  const now = draw({ title: 'Ada Tutor', personId: 'P-ada', rate: 30,
    teachesSpec: ['Maths (GCSE)', 'Maths (A-Level)'],
    teaches: ['Maths (GCSE)', 'Maths (A-Level)', 'Maths (AS)', 'English (KS3)', 'English (GCSE)',
              'English (gcse)', 'Physics', 'Physics (GCSE)', 'Chemistry'] });
  want('the current backend', now, 'Teaches', ['Maths ^GCSE, A-Level'], true);
  want('the current backend', now, 'Can also teach',
       ['Maths ^AS', 'English ^KS3, GCSE', 'Physics ^GCSE', 'Chemistry'], false);
  /* A BACKEND FROM BEFORE SEVERAL SPECIALISMS: one string, no list. The phone must not wait on a
     deploy to draw this the new way. */
  const old = draw({ title: 'Old Backend', personId: 'P-old', rate: 30, teachesMain: 'Maths (GCSE)',
    teaches: ['Maths (GCSE)', 'Maths (A-Level)'] });
  want('an older backend', old, 'Teaches', ['Maths ^GCSE'], true);
  want('an older backend', old, 'Can also teach', ['Maths ^A-Level'], false);
  return bad;
});

/* ---------- A QUALIFICATION, WRITTEN LIKE AN ISOTOPE ------------------------------------------------
   *"for the qualifications bit, should be for example Maths subscript to it is grade and super script
   is the level."* `profQualChip_` in cards.js draws the subject with the level raised over the grade
   lowered on its right, off the `qualsParts` the server sends. Every way this goes wrong draws: the
   grade raised and the level lowered, a certificate turned into notation, the place quietly dropped
   instead of moved into the name, a level alone sinking to the subject's line, a second Maths drawn
   away from the first, or a phone that waits on a backend deploy to draw anything at all. So one
   tutor is drawn through the app's own `findCard` with each case, and one off an older backend.
   The STACKING is a layout question jsdom cannot answer — that is `check/states.js`'s
   "a tutor's qualifications, written like isotopes", measured by `check/ui.js` in a real browser. */
check('a qualification is written like an isotope: the level raised, the grade lowered, the place in its name', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const draw = row => { const box = d.createElement('div'); box.innerHTML = w.findCard({ kind: 'tutor', row }); return box; };
  const P = (subject, level, grade, board, received, kind) => ({ subject, level, grade, board, received, kind: kind || 'subject' });
  /* A CHIP, READ BACK AS WHAT IS DRAWN: the subject is what is outside the stack, the level is the
     `<sup>` in it and the grade the `<sub>`, and the order inside the stack is the order on screen. */
  const read = box => {
    const c = [...box.querySelectorAll('.prof-cap')].find(x => x.textContent.trim() === 'Qualifications');
    const row = c && c.nextElementSibling;
    return row ? [...row.querySelectorAll('.prof-tag')].map(el => {
      const iso = el.querySelector('.prof-iso');
      const kids = iso ? [...iso.children].map(k => k.tagName.toLowerCase()) : [];
      return { subject: (el.textContent.replace(iso ? iso.textContent : '', '')).trim(),
               sup: iso && iso.querySelector('sup') ? iso.querySelector('sup').textContent : null,
               sub: iso && iso.querySelector('sub') ? iso.querySelector('sub').textContent : null,
               order: kids.join(','), stray: el.querySelectorAll('sup, sub').length - kids.length,
               role: el.getAttribute('role'), label: el.getAttribute('aria-label') || '', title: el.getAttribute('title') || '',
               studying: !!(iso && iso.querySelector('sub i')) };
    }) : null;
  };
  const bad = [];
  const now = read(draw({ title: 'Iso Tutor', personId: 'P-iso', rate: 30, quals: ['the sentences, which this phone must not draw'],
    qualsParts: [P('Maths', 'A-Level', 'B', 'Edexcel', '2019'), P('English', 'GCSE', '7', 'Hill Top School', '2016'),
                 P('PGCE', '', '', 'Institute of Education', '2021', 'cert'), P('Maths', 'GCSE', '9', 'Hill Top School', '2017'),
                 P('Physics', 'AS', '', '', ''), P('Chemistry', '', 'A', '', ''),
                 P('Theology', 'Degree', '', 'UWTSD', 'Present'), P('DBS', 'Enhanced', '', '', '', 'cert'), P('', 'GCSE', 'C', '', '')] }));
  if (!now) return ['the tutor card drew no "Qualifications" row at all'];
  const by = (s, sup) => now.find(q => q.subject === s && (sup === undefined || q.sup === sup));
  /* THE ORDER: Maths's two together, where Maths first appears, in the order they were entered — the
     shelf's own order — and the row with no subject (a level of nothing) not drawn. */
  const order = now.map(q => q.subject + (q.sup ? '^' + q.sup : ''));
  const wantOrder = ['Maths^A-Level', 'Maths^GCSE', 'English^GCSE', 'PGCE', 'Physics^AS', 'Chemistry', 'Theology^Degree', 'DBS Enhanced'];
  if (JSON.stringify(order) !== JSON.stringify(wantOrder)) bad.push('the chips read ' + JSON.stringify(order) + ', wanted ' + JSON.stringify(wantOrder));
  const maths = by('Maths', 'A-Level');
  if (!maths) bad.push('no Maths chip with A-Level raised');
  else {
    if (maths.sub !== 'B') bad.push('Maths A-Level lowers ' + JSON.stringify(maths.sub) + ' where its grade, "B", belongs');
    if (maths.order !== 'sup,sub') bad.push('Maths\'s stack is ' + maths.order + ' — the level goes OVER the grade');
    if (maths.stray) bad.push('a <sup> or <sub> sits outside the stack on the Maths chip');
    if (maths.role !== 'img') bad.push('the Maths chip is not role="img", so its aria-label is not what a screen reader hears');
    if (!/^Maths, A-Level, grade B, at Edexcel, 2019$/.test(maths.label)) bad.push('the Maths chip is named ' + JSON.stringify(maths.label) + ' — the board and the year must be in the name, the notation spoken in words');
    if (maths.title !== maths.label) bad.push('the Maths chip\'s title is not its name — a pointer held over it cannot see the place');
  }
  const eng = by('English', 'GCSE');
  if (!eng || eng.sub !== '7' || !/Hill Top School/.test(eng.label)) bad.push('English is not GCSE over 7 with Hill Top School in its name: ' + JSON.stringify(eng));
  const pgce = now.find(q => /PGCE/.test(q.subject));
  if (!pgce) bad.push('the PGCE was not drawn');
  else {
    if (pgce.sup !== null || pgce.sub !== null || pgce.order) bad.push('the PGCE is drawn as notation — a certificate is a plain chip');
    if (pgce.subject !== 'PGCE') bad.push('the PGCE chip reads ' + JSON.stringify(pgce.subject) + ' — the place belongs in its name, not on its face');
    if (!/Institute of Education/.test(pgce.label)) bad.push('the PGCE chip lost where it was taken: ' + JSON.stringify(pgce.label));
  }
  const dbs = now.find(q => /^DBS/.test(q.subject));
  if (!dbs || dbs.order) bad.push('an Enhanced DBS is notation, or missing — a certificate with a level is still a plain chip');
  const phy = by('Physics');
  if (!phy || phy.sup !== 'AS' || phy.sub !== null) bad.push('a level with no grade is not just the raised level: ' + JSON.stringify(phy));
  const chem = by('Chemistry');
  if (!chem || chem.sub !== 'A' || chem.sup !== null) bad.push('a grade with no level is not just the lowered grade: ' + JSON.stringify(chem));
  const theo = by('Theology');
  if (!theo || !theo.studying || theo.sub !== 'studying' || !/studying now/.test(theo.label)) bad.push('a degree still being studied does not say so in the grade\'s place: ' + JSON.stringify(theo));
  /* A BACKEND FROM BEFORE THE PARTS: the sentences, as plain chips, exactly as they were. */
  const old = read(draw({ title: 'Old Backend', personId: 'P-oldq', rate: 30, quals: ['Maths A-Level grade B at Edexcel (2019)', 'PGCE'] }));
  if (!old || JSON.stringify(old.map(q => q.subject)) !== JSON.stringify(['Maths A-Level grade B at Edexcel (2019)', 'PGCE']) || old.some(q => q.order))
    bad.push('an older backend\'s sentences are not drawn as they were: ' + JSON.stringify(old));
  /* A LAW THAT COLOURS A TWO-WORD SUBJECT COLOURS IT WHOLE. The chip holds the subject's last word to
     its stack with a no-wrap span, and the first build made that split BEFORE colouring — `mark` on
     "English" and on "Language" apart, so a `laws` row naming "English Language" matched neither half
     and the subject went uncoloured; "longest first" in `mark` exists to stop exactly that. A `word`
     or `regex` law is a row anybody with the sheet can add today, so this is not waiting on the
     retired subject list. Wanted: the coloured span reads the whole phrase; a law on "Maths" alone
     still leaves "Further" outside the held word, so a long subject can still break between words. */
  const D = w.__t.DATA(), lawsWere = D.laws;
  D.laws = [{ kind: 'word', match: 'English Language', colour: 'green' }, { kind: 'word', match: 'Maths', colour: 'green' }];
  try {
    const box = draw({ title: 'Law Tutor', personId: 'P-lawq', rate: 30,
      qualsParts: [P('English Language', 'GCSE', '8', '', '2016'), P('Further Maths', 'A-Level', 'A*', '', '2019')] });
    const chip = s => [...box.querySelectorAll('.prof-quals .prof-q')].find(c => c.getAttribute('aria-label').startsWith(s + ','));
    const green = c => c ? [...c.querySelectorAll('.w-green')].filter(x => !x.closest('.prof-iso')).map(x => x.textContent) : null;
    const held = c => { const e = c && c.querySelector('.prof-q-end'), i = e && e.querySelector('.prof-iso');
                        return e ? e.textContent.replace(i ? i.textContent : '', '') : null; };
    const en = chip('English Language'), fm = chip('Further Maths');
    if (JSON.stringify(green(en)) !== '["English Language"]')
      bad.push('a law on "English Language" colours its chip as ' + JSON.stringify(green(en)) + ' — the subject split before it was coloured');
    if (!en || held(en) !== 'English Language' || !en.querySelector('.prof-q-end .prof-iso'))
      bad.push('"English Language", coloured whole, is not held whole to its stack: ' + JSON.stringify(held(en)));
    if (JSON.stringify(green(fm)) !== '["Maths"]' || held(fm) !== 'Maths' || !/^Further /.test(fm.textContent))
      bad.push('"Further Maths" with a law on "Maths" reads ' + JSON.stringify({ green: green(fm), held: held(fm) }) + ' — "Further" belongs outside the held word');
  } finally { D.laws = lawsWere; }
  return bad;
});

/* ---------- AND THE LIBRARY CARDS CARRY NO NOTE, WHATEVER THE BACKEND SAYS ------------------------
   *"for the library card widget, there doesnt need to be a add note to it."* The current backend no
   longer lists `library_note`; the deployed one does, so this plays that older server and wants the
   shelf drawn and the note box not — on the page, not merely absent from the code. */
check('the library cards draw no note box, even from a backend that still lists one', async () => {
  const libs = [];
  for (let i = 1; i <= 5; i++) ['_name', '_no', '_pin'].forEach(k => libs.push('lib' + i + k));
  const { w } = boot({ payload: Object.assign(payload(), { profileFields: { 'Library cards': libs.concat(['library_note']) } }) });
  await wait(300);
  const t = w.__t;
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk',
           profile: { first_name: 'Test', last_name: 'Admin', lib1_name: 'Merton', library_note: 'old note' } });
  try { t.go('settings', false, true); w.paint('settings'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const d = w.document;
  const form = [...d.querySelectorAll('#s-settings .me-form')].find(f => f.querySelector('[data-me="lib1_name"]'));
  if (!form) return ['the settings column drew no library shelf, so the note box was NOT checked'];
  const bad = [];
  if (form.querySelector('[data-me="library_note"]')) bad.push('the library card page still draws a library_note box');
  const stray = [...form.querySelectorAll('[data-me]')].map(e => e.getAttribute('data-me')).filter(f => !/^lib\d+_(name|no|pin)$/.test(f));
  if (stray.length) bad.push('the library card page draws boxes that are not a card: ' + stray.join(', '));
  if (/note/i.test(form.textContent)) bad.push('the library card page still says "note" somewhere');
  return bad;
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

/* ---------- THE PICTURE IS A DOOR EXACTLY WHILE THE PEN IS OFF -----------------------------------
   REPORTED AS "for questions where you have to draw on it it doesnt work as when you are drawing
   its moving the widget itself". Measured with real touch events on Q7 of the June 2024 Foundation
   paper, before anything was changed: with the pen off a stroke across the grid took the app from
   `stuff` to `dm` sideways and back a page downwards, and drew nothing.

   THAT HALF IS BY DESIGN AND MUST STAY. `touch-action: none` on a region taller than the phone is a
   region you cannot swipe past, so a pad that took the finger before being asked would trap you on
   a box-plot grid. What was missing is that nothing said so: the remedy was a grey button among
   three, and the picture — a blank grid, the most inviting thing on the card — looked exactly like
   paper. So the picture carries the action while the pen is off, and `PRESS_MOVED` in shell.js
   keeps a DRAG from being a press, which is what lets the column still move.

   FOUR ATTRIBUTES AND TWO WRITERS. `padWrap_` builds them and the press mutates them in place, so
   they exist in two places by construction — and a half-armed pad is the invisible mode the gold
   frame was added to prevent. The sharp one is the `data-do` on the art: left on while the pen is
   ON, the dispatcher walks up from the ink to it and the first dot anybody draws turns the pen off
   again. Nothing else in the suite can see that — `check/press.js` presses each action once and
   `check/ui.js` measures geometry, and a pad that disarms itself measures perfectly. */
check('a question diagram is pressable exactly while the pen is off', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (typeof t.padWrap !== 'function' || typeof t.padArm !== 'function') {
    return ['padWrap_ or padArm_ is not exported, so the pen was NOT checked — not a pass'];
  }
  const bad = [];
  const x = { key: 'q:Q-PEN', answerType: 'drawing', diagram: '<svg viewBox="0 0 340 340"></svg>' };
  const hold = html => { const d = w.document.createElement('div'); d.innerHTML = html; return d; };

  /* ---------- AS BUILT ------------------------------------------------------------------------ */
  const off = hold(t.padWrap(x, x.diagram, ''));
  if (!off.querySelector('.qpad-art[data-do="pad-draw"]'))
    bad.push('with the pen off the picture carries no action, so the only way to arm it is a button '
      + 'under a credit line — which is what the report was about');
  if (!off.querySelector('.qpad-lock[data-do="pad-draw"]'))
    bad.push('with the pen off there is no lock control in the bar');
  if (off.querySelector('.qpad-ink[data-noswipe]'))
    bad.push('an un-armed pad already refuses the grid, so the card cannot be swiped off');

  /* ---------- AND AS THE PRESS LEAVES IT ------------------------------------------------------- */
  const pad = off.querySelector('.qpad');
  t.padArm(pad, true);
  if (pad.querySelector('.qpad-art[data-do]'))
    bad.push('the picture still carries the action while the pen is ON — the dispatcher walks up '
      + 'from the ink to it, so the first dot drawn turns the pen off again');
  if (!pad.classList.contains('is-drawing'))
    bad.push('arming the pad does not put the frame on, so the mode is invisible');
  if (!pad.querySelector('.qpad-ink[data-noswipe]'))
    bad.push('arming the pad does not mark the ink `data-noswipe`, so `axisFree` hands the stroke '
      + 'to the grid and a line of best fit slides the column');
  const lockOn = pad.querySelector('.qpad-lock');
  if (lockOn && lockOn.getAttribute('aria-pressed') !== 'true')
    bad.push('the armed pad\'s control does not report itself pressed');
  if (lockOn && !lockOn.querySelector('svg'))
    bad.push('the control lost its padlock when the press rewrote it — `textContent` would do that, '
      + 'which is why there is one face builder');

  t.padArm(pad, false);
  if (!pad.querySelector('.qpad-art[data-do="pad-draw"]'))
    bad.push('disarming does not give the picture its action back, so the second door works once');
  if (pad.querySelector('.qpad-ink[data-noswipe]'))
    bad.push('disarming leaves `data-noswipe` on, so the card can never be swiped off again');
  if (pad.classList.contains('is-drawing'))
    bad.push('disarming leaves the gold frame on');

  /* ---------- AND THE REPAINT PATH, ASKED THE SAME QUESTION -------------------------------------
     `padArm_` being right is not enough: a card is rebuilt on every repaint, so a `padWrap_` that
     emitted the action on an ARMED pad's picture would put the fault back the moment anything
     repainted — which on this screen is a keystroke in the search box. */
  t.padOn('pad:' + x.key);
  const on = hold(t.padWrap(x, x.diagram, ''));
  t.padOn('');
  if (on.querySelector('.qpad-art[data-do]'))
    bad.push('a card REBUILT with the pen on puts the action back on the picture, so the first dot '
      + 'after any repaint turns the pen off');
  if (!on.querySelector('.qpad-ink[data-noswipe]'))
    bad.push('a card rebuilt with the pen on does not mark the ink, so the pen survives a repaint '
      + 'in name only and the next stroke slides the column');
  if (!on.querySelector('.qpad.is-drawing'))
    bad.push('a card rebuilt with the pen on has no frame');
  return bad;
});

/* ---------- A RULER AND A COMPASS ON THE PEN, WHERE THE QUESTION ASKS FOR THEM -------------------------
   ASKED FOR AS *"some questions require a compass or ruler. so should have a tile for these things. if
   you cant find those questions dont worry just have the infrastructure set up for it."* Through the
   real pointer listeners and the real handlers, on a pad in the document whose picture is TWICE AS
   WIDE AS IT IS TALL -- the shape on which a circle drawn in the ink's stretched units comes out an
   ellipse, which is the one way a compass here can be wrong while looking right on a square grid:
     * which tools: `padTools_` from `needs` and from the words -- a ruler alone, ruler and compasses,
       a construction, nothing for a plain drawing, nothing for "plotting compasses" or "12 rulers",
       and a protractor decided but not drawn (there is no such tool). The bar draws exactly that.
     * Ruler: pressing it arms the pen and lights it; a drag from A through anywhere to B keeps ONE
       stroke of two points, A and B, under `padKey_`, and a card drawn again draws it
     * Compass: pressed on the centre and dragged out, a CLOSED ring -- first point the last -- every
       point the dragged radius from the centre in SCREEN pixels; and swung through a quarter turn,
       an open arc of a quarter turn at the width it had when the swing began
     * the point and the width are shown while dragging and gone after; a tap is a slip, kept nowhere
     * Undo takes the compass's ring off and then the ruler's line; the pen still draws freehand
     * a stale choice cannot draw: a compass left in `PAD_TOOL` for a pad whose bar has no Compass is
       the pen */
check('a ruler draws a straight line and a compass a round circle or arc, offered where the question asks', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, A = t.ACTIONS, d = w.document, bad = [];
  if (typeof t.padWrap !== 'function' || typeof w.padTools_ !== 'function' || typeof t.padKey !== 'function'
      || !A['pad-tool'] || !A['pad-undo'] || typeof t.padTool !== 'function') {
    return ['padWrap_, padTools_, padKey_, PAD_TOOL or the pad-tool / pad-undo handlers are not reachable — the tools were NOT checked'];
  }
  /* ---------- WHICH QUESTIONS GET WHICH TOOLS ---------------------------------------------------- */
  const q = (html, extra) => Object.assign({ kind: 'question', answerType: 'drawing', html: '<p>' + html + '</p>' }, extra || {});
  [[q('Reflect the shape in the mirror line.', { needs: ['Ruler'] }), 'pen ruler', 'needs: Ruler'],
   [q('Use a ruler and compasses to construct the perpendicular from P to the line.'), 'pen ruler compass', '"ruler and compasses" in the words'],
   [q('Construct the locus of points 3 cm from A.'), 'pen ruler compass', 'a locus'],
   [q('Draw the perpendicular bisector of AB.', { needs: 'Compass, Ruler' }), 'pen ruler compass', 'a comma-list cell and a bisector'],
   [q('Draw the graph of y = 2x + 1.'), 'pen', 'a plain drawing question'],
   [q('The two circles represent plotting compasses. Draw an arrow in each.'), 'pen', 'plotting compasses'],
   [q('Bradley buys 12 rulers. How much is one ruler?'), 'pen', 'rulers in a word problem'],
   [q('Construct a frequency tree for this information.'), 'pen', 'constructing a tree'],
   [q('Construct a two-way table for the data.'), 'pen', 'constructing a two-way table'],
   [q('Measure angle d.', { needs: ['Protractor'] }), 'pen protractor', 'a protractor'],
   [q('Bisect the angle.', { stems: [{ html: '<p>Use ruler and compasses only.</p>' }] }), 'pen ruler compass', 'a stem that says it']]
    .forEach(([x, want, what]) => {
      const got = w.padTools_(x).join(' ');
      if (got !== want) bad.push(what + ': padTools_ gave "' + got + '", wanted "' + want + '"');
    });
  const barOf = x => { const h = d.createElement('div'); h.innerHTML = t.padWrap(x, '<svg viewBox="0 0 340 340"></svg>', '');
    return [...h.querySelectorAll('.qpad-tool')].map(b => b.getAttribute('data-tool')).join(' '); };
  const offered = [[q('Use a ruler.', { key: 'q:T-R' }), 'pen ruler'], [q('Construct the bisector.', { key: 'q:T-C' }), 'pen ruler compass'],
    [q('Draw the graph.', { key: 'q:T-N' }), ''], [q('Measure the angle.', { key: 'q:T-P', needs: ['Protractor'] }), '']];
  offered.forEach(([x, want]) => {
    if (barOf(x) !== want) bad.push('the bar for "' + x.html.replace(/<[^>]*>/g, '') + '" offers [' + barOf(x) + '], wanted [' + want + ']');
  });

  /* ---------- A PAD IN THE DOCUMENT, 340 x 170 px: ONE UNIT ACROSS IS 1px, ONE UNIT DOWN 0.5px -------- */
  const x = q('Use a ruler and compasses to construct the bisector of angle ABC.', { key: 'q:Q-TOOLS-1' });
  const k = t.padKey(x);
  try { w.localStorage.removeItem(k); } catch (e) {}
  const host = d.createElement('div');
  d.body.appendChild(host);
  const L = 100, T = 50, W = 340, H = 170;
  const mount = () => {
    host.innerHTML = t.padWrap(x, '<svg viewBox="0 0 340 170"></svg>', '');
    host.querySelector('.qpad-ink').getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T });
    return host.querySelector('.qpad');
  };
  let pad = mount();
  const ink = () => pad.querySelector('.qpad-ink');
  const Ev = w.PointerEvent || w.MouseEvent;
  const fire = (type, px, py) => ink().dispatchEvent(new Ev(type, { bubbles: true, cancelable: true, clientX: px, clientY: py, pointerId: 1 }));
  const drag = pts => { fire('pointerdown', pts[0][0], pts[0][1]); pts.slice(1).forEach(p => fire('pointermove', p[0], p[1])); fire('pointerup', pts[pts.length - 1][0], pts[pts.length - 1][1]); };
  const stored = () => { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return []; } };
  const tool = name => pad.querySelector('.qpad-tool[data-tool="' + name + '"]');
  if (!tool('ruler') || !tool('compass') || !tool('pen')) return bad.concat(['the construction question\'s bar has no Pen, Ruler and Compass, so the drawing was NOT checked']);

  /* RULER */
  A['pad-tool'](tool('ruler'));
  if (!pad.classList.contains('is-drawing')) bad.push('pressing Ruler did not lock the card for drawing');
  if (!tool('ruler').classList.contains('on') || tool('ruler').getAttribute('aria-pressed') !== 'true') bad.push('the Ruler tile is not lit and pressed once chosen');
  if (tool('pen').classList.contains('on') || tool('compass').classList.contains('on')) bad.push('another tool is lit beside the Ruler');
  /* A (150,100)px is units (50,100); B (300,140)px is units (200,180). The middle of the drag wanders. */
  drag([[150, 100], [180, 60], [260, 160], [300, 140]]);
  let s = stored();
  if (s.length !== 1 || JSON.stringify(s[0]) !== '[50,100,200,180]') bad.push('a ruler drag stored ' + JSON.stringify(s) + ', wanted one stroke [50,100,200,180] -- its two ends and nothing between');
  if (pad.querySelector('.qpad-aid').innerHTML) bad.push('the ruler\'s anchor is still drawn after the finger lifted');
  pad = mount();
  const redrawn = [...pad.querySelectorAll('.qpad-g path')].map(p => p.getAttribute('d'));
  if (redrawn.join('|') !== 'M50 100L200 180') bad.push('the card drawn again shows ' + JSON.stringify(redrawn) + ', wanted the ruler\'s one line M50 100L200 180');
  if (!pad.classList.contains('is-drawing') || !tool('ruler').classList.contains('on')) bad.push('a card drawn again lost the pen or the Ruler in hand');

  /* COMPASS: centre (270,135)px = units (170,170); out to (330,135)px, a radius of 60px. */
  A['pad-tool'](tool('compass'));
  if (!tool('compass').classList.contains('on') || tool('ruler').classList.contains('on')) bad.push('pressing Compass did not move the light from Ruler to Compass');
  fire('pointerdown', 270, 135);
  fire('pointermove', 300, 135);
  fire('pointermove', 330, 135);
  const aid = pad.querySelector('.qpad-aid');
  if (!aid.querySelector('.qpad-pin')) bad.push('the compass\'s point is not shown while it is open');
  const rad = aid.querySelector('.qpad-rad');
  if (!rad || rad.getAttribute('d') !== 'M170 170L230 170') bad.push('the live radius is ' + (rad ? rad.getAttribute('d') : 'not drawn') + ', wanted M170 170L230 170');
  if (!pad.querySelector('.qpad-g [data-live]')) bad.push('the ring is not previewed while it is dragged');
  fire('pointerup', 330, 135);
  if (aid.innerHTML) bad.push('the compass\'s point and width are still drawn after the finger lifted');
  s = stored();
  const ring = s[1] || [];
  const off = st => { let worst = 0; for (let i = 0; i < st.length; i += 2) worst = Math.max(worst, Math.abs(Math.hypot((st[i] - 170) * W / 340, (st[i + 1] - 170) * H / 340) - 60)); return worst; };
  if (s.length !== 2) bad.push('after the compass there are ' + s.length + ' strokes stored, wanted 2');
  else {
    if (ring.length < 40) bad.push('the ring has ' + ring.length / 2 + ' points -- not enough to be round');
    if (ring[0] !== ring[ring.length - 2] || ring[1] !== ring[ring.length - 1]) bad.push('the ring is not closed: it starts at ' + ring.slice(0, 2) + ' and ends at ' + ring.slice(-2));
    if (off(ring) > 1.2) bad.push('a point of the ring is ' + off(ring).toFixed(2) + 'px off the 60px radius on the screen -- an ellipse on a picture that is not square');
    const xs = ring.filter((v, i) => !(i % 2)), ys = ring.filter((v, i) => i % 2);
    if (Math.abs((Math.max(...xs) + Math.min(...xs)) / 2 - 170) > 1 || Math.abs((Math.max(...ys) + Math.min(...ys)) / 2 - 170) > 1) bad.push('the ring is not about the centre that was pressed');
  }
  /* AN ARC: out to 60px, then a quarter turn round the point, clockwise on the screen. */
  const arcPts = [[270, 135], [300, 135], [330, 135]];
  for (let deg = 10; deg <= 90; deg += 10) arcPts.push([270 + 60 * Math.cos(deg * Math.PI / 180), 135 + 60 * Math.sin(deg * Math.PI / 180)]);
  drag(arcPts);
  s = stored();
  const arc = s[2] || [];
  if (s.length !== 3) bad.push('after the swing there are ' + s.length + ' strokes, wanted 3');
  else {
    if (arc[0] === arc[arc.length - 2] && arc[1] === arc[arc.length - 1]) bad.push('a quarter-turn swing drew a closed ring, not an arc');
    if (off(arc) > 1.2) bad.push('the arc is ' + off(arc).toFixed(2) + 'px off its 60px width');
    const ang = (px, py) => Math.atan2((py - 170) * H / 340, (px - 170) * W / 340) * 180 / Math.PI;
    const a0 = ang(arc[0], arc[1]), a1 = ang(arc[arc.length - 2], arc[arc.length - 1]);
    if (Math.abs(a0) > 12 || Math.abs(a1 - 90) > 6) bad.push('the arc runs from ' + a0.toFixed(0) + '° to ' + a1.toFixed(0) + '°, wanted about 0° to 90°');
  }
  /* A TAP IS A SLIP. */
  fire('pointerdown', 200, 120); fire('pointerup', 200, 120);
  if (stored().length !== 3) bad.push('a tap with the compass stored a mark');
  if (pad.querySelector('.qpad-g [data-live]')) bad.push('a tap with the compass left its preview on the picture');
  /* UNDO: the arc, then the ring, then the ruler's line is what is left. */
  A['pad-undo'](pad.querySelector('[data-do="pad-undo"]'));
  A['pad-undo'](pad.querySelector('[data-do="pad-undo"]'));
  s = stored();
  if (s.length !== 1 || JSON.stringify(s[0]) !== '[50,100,200,180]') bad.push('two Undos left ' + JSON.stringify(s).slice(0, 80) + ', wanted only the ruler\'s line');
  if (pad.querySelectorAll('.qpad-g path').length !== 1) bad.push('two Undos left ' + pad.querySelectorAll('.qpad-g path').length + ' marks on the picture, wanted 1');
  /* THE PEN, STILL FREEHAND. */
  A['pad-tool'](tool('pen'));
  drag([[110, 60], [120, 70], [130, 66]]);
  s = stored();
  if (s.length !== 2 || s[1].length !== 6) bad.push('the pen did not keep every point of a freehand stroke: ' + JSON.stringify(s[1] || null));
  /* A STALE CHOICE CANNOT DRAW. The plain question offers no tools; a Compass left for it is the pen. */
  const plain = q('Draw the graph.', { key: 'q:Q-TOOLS-2' });
  const pk = t.padKey(plain);
  try { w.localStorage.removeItem(pk); } catch (e) {}
  t.padTool().set(pk, 'compass');
  host.innerHTML = t.padWrap(plain, '<svg viewBox="0 0 340 170"></svg>', '');
  pad = host.querySelector('.qpad');
  pad.querySelector('.qpad-ink').getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T });
  if (pad.querySelector('.qpad-tool')) bad.push('a plain drawing question was given tool tiles');
  A['pad-draw'](pad.querySelector('.qpad-lock'));
  drag([[150, 100], [200, 100], [250, 120]]);
  const ps = (() => { try { return JSON.parse(w.localStorage.getItem(pk) || '[]'); } catch (e) { return []; } })();
  if (ps.length !== 1 || ps[0].length !== 6) bad.push('a pad with no Compass tile drew with a stale compass choice: ' + JSON.stringify(ps).slice(0, 80));
  A['pad-draw'](pad.querySelector('.qpad-lock'));
  t.padTool().delete(pk);
  try { w.localStorage.removeItem(k); w.localStorage.removeItem(pk); } catch (e) {}
  t.padOn('');
  host.remove();
  return bad;
});

/* ---------- A SWIPE SETTLES AT THE FINGER'S SPEED, WRITTEN ON THE COLUMNS AND NOT THE ROOT ------------
   ASKED FOR AS *"refine the swiping to feel more stable"*, and measured before it was touched: every
   release wrote `--slide` on `<html>`, which re-styled about three thousand elements before the card
   could move (100-200ms frozen at 4x CPU), and the curve it fed left at 7 to 47 times the finger's
   speed. Nothing here can time a frame, so the rule is the two facts the fix rests on: the curve's
   starting slope IS the release speed, and the settle is written on the columns — never the root. */
check("a swipe settles at the finger's speed, written on the columns and not the root", async () => {
  const { w } = boot();
  await wait(300);
  if (typeof w.settleCurve_ !== 'function' || typeof w.settleFrom_ !== 'function'
      || typeof w.placeGrid !== 'function') {
    return ['settleCurve_, settleFrom_ or placeGrid is not reachable, so the settle was NOT checked — not a pass'];
  }
  const bad = [];
  const slope = tf => { const m = /cubic-bezier\(\s*([^,]+),\s*([^,]+),/.exec(tf || ''); return m ? (+m[2]) / (+m[1]) : NaN; };
  /* A card D px from where it is going, released at v px/ms. A `cubic-bezier` leaves at y1/x1 times
     its average speed, and the average is D over the duration — so the card leaves at the finger's
     speed exactly when y1/x1 = |v| x duration / |D|. Four releases, one of them fast enough that
     `x1` has to shrink to say it. */
  [[300, 1.2], [-300, -1.2], [120, 0.3], [200, 4]].forEach(([D, v]) => {
    const c = w.settleCurve_(D, v);
    const want = Math.abs(v) * c.dur / Math.abs(D), got = slope(c.tf);
    if (!(Math.abs(got - want) / want < 0.02)) {
      bad.push(`a card ${D}px from home released at ${v}px/ms leaves at ${got.toFixed(2)}x its average `
        + `speed and should leave at ${want.toFixed(2)}x — the finger's own speed`);
    }
    if (!(c.dur >= 260 && c.dur <= 420)) bad.push(`a ${Math.abs(D)}px settle takes ${c.dur}ms, outside 260-420`);
  });
  /* RELEASED STILL, OR PULLING BACK THE OTHER WAY: nothing to carry on, so it eases out of rest. */
  if (slope(w.settleCurve_(200, 0).tf) !== 0) bad.push('a card released still does not start from rest');
  if (slope(w.settleCurve_(200, -1).tf) !== 0) bad.push('a card whose finger was pulling the other way starts by leaping toward home');

  /* ---------- AND WHERE IT IS WRITTEN ------------------------------------------------------------ */
  w.settleFrom_('x', -1);
  w.placeGrid(false, null);
  if (w.document.documentElement.style.getPropertyValue('--slide')) {
    bad.push('the release wrote --slide on <html>, which re-styles every element in the app before the card can move');
  }
  const hosts = [...w.document.querySelectorAll('#screen > .screen')].filter(h => h.style.transform);
  if (!hosts.length) bad.push('no column was placed, so where the settle goes was NOT checked');
  else if (!hosts.some(h => /cubic-bezier/.test(h.style.transitionTimingFunction || ''))) {
    bad.push('the settle was not written on the columns, so a release has no curve of its own');
  }
  return bad;
});

/* ---------- THE AGE RANGE ON A TUTOR'S CARD, AND EVERY HALF OF ONE A ROW CAN HOLD ----------------
   ASKED FOR AS *"tutors should also be able to state an age range of people they are willing to
   work with."* The card is the half a parent sees, and the rows it reads were often typed into the
   sheet by hand with one end filled in — so the rule is every shape, not the one the form produces.
   Asked of `profAges_` and then of the card itself, because a chip computed right and never drawn is
   this repository's oldest silence. */
check('an age range reads sensibly with both ends, one end, or neither', async () => {
  const { w } = boot();
  await wait(300);
  if (typeof w.profAges_ !== 'function' || typeof w.findCard !== 'function') {
    return ['profAges_ or findCard is not reachable, so the age range was NOT checked — not a pass'];
  }
  const bad = [];
  [[8, 16, 'Ages 8–16'], ['8', '16', 'Ages 8–16'], [10, 10, 'Age 10'],
   [11, '', 'Ages 11+'], [11, 'Adults', 'Ages 11+'], ['', 16, 'Ages up to 16'],
   ['Adults', '', 'Adults'], ['Adults', 'Adults', 'Adults'], ['', 'Adults', 'All ages'],
   [16, 8, 'Ages 8–16'], ['adults', 12, 'Ages 12+'], [0, 0, ''], ['', '', ''],
   [undefined, undefined, ''], ['teenagers', '', '']].forEach(([lo, hi, want]) => {
    const got = w.profAges_({ ageMin: lo, ageMax: hi });
    if (got !== want) bad.push(`youngest ${JSON.stringify(lo)} and oldest ${JSON.stringify(hi)} read "${got}", wanted "${want}"`);
  });
  const t = { title: 'Ada Tutor', handle: 'ada', rate: 30, yrsExp: 10, minStudents: 1, maxStudents: 4,
              ageMin: 8, ageMax: 16, teaches: [], listed: true, personId: 'P-x' };
  const html = String(w.findCard({ kind: 'tutor', row: t }) || '');
  const facts = (html.match(/prof-facts[^]*?<\/div>/) || [''])[0];
  if (!/>Ages 8–16</.test(facts)) bad.push('a tutor who teaches 8 to 16 has no "Ages 8–16" chip under At a glance');
  const none = String(w.findCard({ kind: 'tutor', row: Object.assign({}, t, { ageMin: '', ageMax: '' }) }) || '');
  if (/>Ages?\b|>Adults<|>All ages</.test(none)) bad.push('a tutor who has said nothing about ages is drawn with an age chip anyway');
  return bad;
});

/* ---------- A FRACTION ON A CARD IS DRAWN OVER ITS LINE, IN ALL FIVE PLACES A CARD DRAWS MATHS ----
   ASKED FOR AS "it shouldnt be 4/5 it should be 4 over the five like how it is supposed to be."
   `check-typeset.js` proves `typeset_` stacks a fraction; it cannot prove the CARD calls it, and a
   card that typesets the part and forgets the answer draws half its fractions slanted, which is
   exactly what the owner kept seeing. So this builds one card through the app's own
   `questionCard_` with a stored fraction in the stem, the lead, the part, the answer and both
   choices, and asks each region of the drawn card for its stacked fraction.

   AND THE MARKER'S COLUMN COMES OUT UNTOUCHED. `accept` is what a typed answer is compared with,
   and the typesetter must never see it: a `5/9` stacked into spans in `data-accept` would mark
   every right answer wrong. */
check('a fraction is drawn stacked in the stem, lead, part, answer and choices, and accept is not', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  if (typeof w.questionCard_ !== 'function') return ['questionCard_ is not reachable — renamed?'];
  const half = '<sup>1</sup>&frasl;<sub>2</sub>';
  const base = { kind: 'question', key: 'q-typeset', name: 'Q9', marks: 2,
    row: { row_id: 'Q-TYPESET-9', paper_id: 'P-TYPESET', subject: 'Maths', name: 'Typeset' },
    stems: [{ html: '<p>Stem ' + half + '</p>' }], lead: '<p>Lead ' + half + '</p>',
    html: '<p>Work out 3<sup>4</sup>&frasl;<sub>5</sub> and <i>x</i>^2</p>',
    answer: '<b><sup>32</sup>&frasl;<sub>15</sub></b>' };
  const draw = x => { const d = w.document.createElement('div'); d.innerHTML = w.questionCard_(x, 0); return d; };
  const tapped = draw(Object.assign({}, base, {
    choices: [half, '<sup>1</sup>&frasl;<sub>3</sub>'], choiceRight: [1] }));
  /* THE ANSWER IS ITS OWN PAGE NOW (`questionAnsCard_`), drawn open by `answerBlock_` -- so its
     fraction is asked of what that draws, not of the question card, which no longer carries it. */
  const ansDrawn = w.document.createElement('div');
  ansDrawn.innerHTML = typeof w.answerBlock_ === 'function' ? w.answerBlock_(base) : '';
  /* AND THE STEM IS ITS OWN PAGE NOW, in front of its parts (`questionStemCard_`), so its fraction
     is asked of that page. */
  const stemDrawn = w.document.createElement('div');
  stemDrawn.innerHTML = typeof w.questionStemCard_ === 'function' ? w.questionStemCard_(base, 0) : '';
  [['.qsheet-stem', 'the stem'], ['.qsheet-lead', 'the lead'], ['.qsheet-pb', 'the part'],
   ['.qans-body', 'the answer']].forEach(([sel, what]) => {
    const el = (sel === '.qans-body' ? ansDrawn : sel === '.qsheet-stem' ? stemDrawn : tapped).querySelector(sel);
    if (!el) bad.push(what + ' was not drawn at all');
    else if (!el.querySelector('.frac .frac-n') || !el.querySelector('.frac .frac-d')) bad.push(what + ' drew its fraction slanted: ' + el.innerHTML.slice(0, 120));
  });
  const opts = [...tapped.querySelectorAll('.qp-opt')];
  if (opts.length !== 2) bad.push('the two choices drew as ' + opts.length + ' buttons');
  else if (opts.some(b => !b.querySelector('.frac .frac-n'))) bad.push('a choice drew its fraction slanted');
  const part = tapped.querySelector('.qsheet-pb');
  if (part && !part.querySelector('.frac-mixed')) bad.push('3 4/5 is not kept together as a mixed number');
  if (part && !/x<\/i><sup>2<\/sup>/.test(part.innerHTML)) bad.push('x^2 was not raised: ' + part.innerHTML);
  /* THE TYPED BOX: no choices, an `accept`, and the attribute the marker reads must be byte for byte
     what the row says. */
  const typed = draw(Object.assign({}, base, { accept: '32/15 | 2 2\u204415' }));
  const mark = typed.querySelector('.qp-mark');
  if (!mark) bad.push('a row with an accept drew no Check');
  else if (mark.getAttribute('data-accept') !== '32/15 | 2 2\u204415') bad.push('accept reached the marker changed: ' + mark.getAttribute('data-accept'));
  if (base.html.indexOf('&frasl;') === -1) bad.push('drawing the card rewrote the stored row');
  return bad;
});

/* ---------- THE ANSWER IS ITS RESULT, AND NOTHING ELSE ----------------------------------------------
   ASKED FOR AS *"Also remove all 'why's. I just want it to have answer."* -- after 259 had folded the
   working under a "Why" and 263 had put the answer on its own page. `check-answers.js` proves
   `answerParts_` splits right and every library result is short; it cannot prove the PAGE draws only
   the head, and a page that typesets the result into `.qans-body` and the working under it passes
   every rule there while showing exactly the paragraph the owner asked to lose. So, through the
   app's own builders:
     * the result in `.qans-body`, codes off it, nothing of the working in it
     * no `.qans-why`, no `<details>`, no `.qans-more`, no `.qans-note` -- and none of the working's
       words or the examiner's note anywhere in the page's text
     * "Show the answer" on the hidden page draws exactly that, and nothing more
     * the working is still IN THE ROW: Mark with AI sends `answer` and `examinerNote` as the scheme
       (`aiScheme_`), and an answer page that stopped drawing them must not have stopped sending them */
check('an answer draws its result and nothing else: no Why, no working, no examiner\'s note', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  if (typeof w.answerBlock_ !== 'function') return ['answerBlock_ is not reachable — renamed?'];
  const draw = x => { const d = w.document.createElement('div'); d.innerHTML = w.answerBlock_(x); w.document.body.appendChild(d); return d; };
  const base = { kind: 'question', key: 'q-why', name: 'Q4', marks: 1,
    row: { row_id: 'Q-WHY-4', paper_id: 'P-WHY', subject: 'Maths', name: 'Why' },
    html: '<p>Work out 12 &divide; 4</p>' };
  const full = Object.assign({}, base, {
    answer: '<b>3</b> &mdash; B1, cao. A half of 6 is <sup>6</sup>&frasl;<sub>2</sub>, and 12 &divide; 4 = 3.',
    examinerNote: 'Most candidates were right.' });
  const card = draw(full);
  const body = card.querySelector('.qans-body');
  if (!body) bad.push('no .qans-body was drawn');
  else {
    if (body.textContent.trim() !== '3') bad.push('the result drew as "' + body.textContent.trim() + '", wanted "3"');
    if (/B1|cao|half/.test(body.textContent)) bad.push('the result carries the code or the working: ' + body.innerHTML);
  }
  const extra = sel => card.querySelector(sel);
  ['.qans-why', 'details', 'summary', '.qans-more', '.qans-note'].forEach(sel => {
    if (extra(sel)) bad.push('the answer still draws ' + sel + ' -- the owner asked for the answer and nothing else');
  });
  if (/A half of 6|Most candidates|Why/.test(card.textContent)) bad.push('the working, the note or the word "Why" is still in the answer\'s text: ' + card.textContent.replace(/\s+/g, ' ').trim().slice(0, 120));
  /* SHOWN, ON THE ANSWER PAGE: the same block, nothing more. */
  if (typeof w.questionAnsCard_ === 'function' && w.__t.ACTIONS['qa-show']) {
    const page = w.document.createElement('div');
    page.innerHTML = w.questionAnsCard_(full);
    w.document.body.appendChild(page);
    const held = w.stuffItemsAll_;
    w.stuffItemsAll_ = () => [full];
    const showBtn = page.querySelector('[data-do="qa-show"]');
    if (!showBtn) bad.push('a hidden answer page has no "Show the answer" to press');
    else try { w.__t.ACTIONS['qa-show'](showBtn); } finally { w.stuffItemsAll_ = held; }
    const opened = page.querySelector('.qans-card');
    if (!opened || opened.classList.contains('is-hidden') || !opened.querySelector('.qans-body')) bad.push('"Show the answer" did not show the answer');
    else if (opened.querySelector('details, .qans-why, .qans-note') || /A half of 6|Most candidates/.test(opened.textContent)) bad.push('the shown answer page carries the working or the note');
  } else bad.push('the answer page or its Show the answer has no handler');
  /* STILL SENT TO THE MARKER: the explanation left the page, not the row. */
  if (typeof w.aiScheme_ === 'function') {
    const sch = w.aiScheme_(full);
    if (!/half of 6/.test(sch) || !/Most candidates/.test(sch)) bad.push('Mark with AI no longer sends the working and the examiner\'s note as its scheme: ' + sch.slice(0, 120));
  } else bad.push('aiScheme_ is not reachable, so what the marker is sent was NOT checked');
  return bad;
});

/* WHAT A PAGE OF A QUESTION SAYS IT IS: its kind tag and its number tag -- `Question Q4a`, `Figure 3`,
   `Answer Q4a`, `Question Q5 · 1 of 2`. Those two tags replaced the gold header line (`qPage_` in
   find.js), so the journeys that read `.qcard-top b` read this instead: the same two facts, in the
   order the row draws them. `tagText` is one kind's text, or '' where the row has none. */
const tagText = (root, kind) => (((root && root.querySelector('.qcard-tags .qtag[data-tag="' + kind + '"]')) || {})
  .textContent || '').replace(/\s+/g, ' ').trim();
const pageHead = root => [tagText(root, 'kind'), tagText(root, 'number')].filter(Boolean).join(' ');

/* ---------- MARKING AND REVEALING LEAVE THE QUESTION WHERE IT IS -----------------------------------
   ASKED FOR AS "make it nice more sleek, fresh stable". jsdom lays nothing out, so the PIXELS are
   `check/states.js`'s to measure ("marked not yet, nothing moved" and its two siblings, in a real
   browser at four widths). What only this harness can hold cheaply is the half that comes first:
   the handlers must not REBUILD or INSERT anything above or around the answer. A Check that redrew
   the card, or a verdict that arrived as a new element, would shift the question in a way no CSS can
   take back -- and both have been this file's faults elsewhere (the `REEL_HELD` repaint).

   So on a real card, through the real handlers: the header, the tags and the question are the SAME
   nodes with the same markup after Check, a wrong Check, typing, Check again, "Show the answer" and
   a tapped option; the card's own children are the same list in the same order; and the verdict
   writes into a slot that was already there. And typing after a verdict takes it off -- "Correct"
   beside an answer that has since changed is the app vouching for something it never read.

   AND A WRONG TAP SHOWS NO ANSWER: the pick, "Not yet", and no option ticked -- a right tap ticks the
   pick and nothing else. Here because the tapped card is already here. */
check('marking, revealing and tapping leave the question where it is, and typing clears a stale verdict', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  if (typeof w.questionCard_ !== 'function') return ['questionCard_ is not reachable — renamed?'];
  const A = w.__t.ACTIONS;
  ['qp-check', 'qa-go', 'qp-choose'].forEach(a => { if (!A[a]) bad.push(a + ' has no handler'); });
  if (bad.length) return bad;
  const draw = x => { const h = d.createElement('div'); h.innerHTML = w.questionCard_(x, 0); d.body.appendChild(h); return h.querySelector('.qcard'); };
  /* THE TAG ROW AND THE QUESTION. There was a gold header line above the tags; everything it said is a
     tag now (`qPage_`), so the row is the card's whole head and is held as one block. */
  const still = card => {
    const top = ['.qcard-tags', '.qsheet'].map(s => card.querySelector(s));
    return { top, html: top.map(n => n && n.outerHTML), kids: [...card.children] };
  };
  const same = (a, card, when) => {
    const b = still(card);
    a.top.forEach((n, i) => {
      if (!n) return bad.push(when + ': the card has no ' + ['tag row', 'question'][i]);
      if (n !== b.top[i]) bad.push(when + ': the ' + ['tag row', 'question'][i] + ' was redrawn rather than left alone');
      else if (a.html[i] !== b.html[i]) bad.push(when + ': the ' + ['tag row', 'question'][i] + '\'s markup changed');
    });
    /* BY THE BLOCK'S FIRST CLASS, which names what it is; `is-near`, `is-done` and `is-shut` are the
       states marking is SUPPOSED to change. */
    if (a.kids.length !== b.kids.length || a.kids.some((k, i) => k.classList[0] !== b.kids[i].classList[0])) {
      bad.push(when + ': the card\'s blocks changed from [' + a.kids.map(k => k.className).join(', ')
        + '] to [' + b.kids.map(k => k.className).join(', ') + ']');
    }
  };
  const base = { kind: 'question', name: 'Q7', marks: 1,
    row: { row_id: 'Q-STILL-7', paper_id: 'P-STILL', subject: 'Maths', name: 'Still' },
    html: '<p>Work out <sup>5</sup>&frasl;<sub>8</sub> of 24</p>', answer: '<b>15</b> &mdash; 24 &divide; 8 &times; 5' };
  /* TYPED */
  const typed = draw(Object.assign({}, base, { key: 'q-still-typed', accept: '15' }));
  const t0 = still(typed);
  const slot = typed.querySelector('.qp-mark .qp-verdict');
  if (!slot) bad.push('a typed card has no verdict slot until it is marked, so the verdict arrives as a new line');
  const inp = typed.querySelector('.qp-ans-in');
  const chk = typed.querySelector('.qp-check');
  const type = v => { inp.value = v; inp.dispatchEvent(new w.Event('input', { bubbles: true })); };
  type('16'); A['qp-check'](chk);
  const mark = typed.querySelector('.qp-mark');
  if (!mark.classList.contains('is-near') || !/Not yet/.test(slot.textContent)) bad.push('a wrong answer was not marked "not yet": ' + mark.className + ' / ' + slot.textContent);
  if (typed.querySelector('.qp-mark .qp-verdict') !== slot) bad.push('the verdict was written into a new element, not the slot');
  same(t0, typed, 'after a wrong Check');
  type('15');
  if (mark.classList.contains('is-near') || mark.classList.contains('is-right') || slot.textContent) bad.push('typing a new answer left the old verdict on it: ' + mark.className + ' / ' + slot.textContent);
  same(t0, typed, 'after typing');
  A['qp-check'](chk);
  if (!mark.classList.contains('is-right')) bad.push('15 was not marked right');
  same(t0, typed, 'after a right Check');
  /* REVEALED -- by the tile under the card, which turns to the answer page. The tile is drawn by
     `questionTiles_` beside the card as `stuffCard` puts it; the card must not change for it. */
  const shutX = Object.assign({}, base, { key: 'q-still-shut', row: Object.assign({}, base.row, { row_id: 'Q-STILL-8' }) });
  const shut = draw(shutX);
  const r0 = still(shut);
  shut.parentNode.insertAdjacentHTML('beforeend', '<div class="tile-row">' + w.questionTiles_(shutX) + '</div>');
  const rev = shut.parentNode.querySelector('[data-do="qa-go"]');
  if (!rev) bad.push('a question with an answer has no tile to its answer page');
  else {
    const heldR = w.stuffItemsAll_;
    w.stuffItemsAll_ = () => [shutX];
    try { A['qa-go'](rev); } finally { w.stuffItemsAll_ = heldR; }
    same(r0, shut, 'after "To the answer"');
  }
  /* TAPPED -- `qp-choose` redraws the box from the stored pick and finds its question by key in the
     library, which this harness does not load; so the library is this one question for the length of
     the tap, and put back straight after. */
  const mc = Object.assign({}, base, { key: 'q-still-mc', row: Object.assign({}, base.row, { row_id: 'Q-STILL-9' }),
    choices: ['14', '15', '16'], choiceRight: [2] });
  try { w.localStorage.removeItem(w.__t.ansKey(mc)); } catch (e) {}
  const tapped = draw(mc);
  const m0 = still(tapped);
  if (!tapped.querySelector('.qp-choices + .qp-mark .qp-verdict')) bad.push('a tapped card has no verdict slot until it is marked');
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [mc];
  try { A['qp-choose'](tapped.querySelector('.qp-opt[data-n="1"]')); } finally { w.stuffItemsAll_ = held; }
  const box = tapped.querySelector('.qp-choices');
  if (!box || !box.classList.contains('is-done')) bad.push('a settled tapped question does not say so (is-done), so its options still look pressable');
  if (!tapped.querySelector('.qp-opt[data-n="1"].is-picked')) bad.push('the tap did not mark the pick');
  /* A MISS DOES NOT SHOW THE ANSWER. It ticked the right option beside it, which is the answer on the
     question card with nobody pressing Show -- *"answers should just stay hidden unless user unhides
     them."* Nothing ticked, and no words that name or point at the right one. */
  const shownBy = tapped.querySelector('.qp-opt.is-ans');
  if (shownBy) bad.push('a wrong tap ticked option ' + shownBy.getAttribute('data-n') + ' -- the answer shown on the question card without Show');
  const said = (tapped.querySelector('.qp-verdict') || {}).textContent || '';
  if (!/^Not yet/.test(said) || /marked|is 15|\b15\b/.test(said)) bad.push('a wrong tap\'s verdict reads "' + said + '" -- "Not yet", and nothing that gives the right one away');
  same(m0, tapped, 'after a wrong tap');
  try { w.localStorage.removeItem(w.__t.ansKey(mc)); } catch (e) {}
  /* AND A RIGHT ONE TICKS THE PICK -- the verdict on what you chose, which is not a reveal. */
  const mcR = Object.assign({}, mc, { key: 'q-still-mc-r', row: Object.assign({}, base.row, { row_id: 'Q-STILL-10' }) });
  try { w.localStorage.removeItem(w.__t.ansKey(mcR)); } catch (e) {}
  const tappedR = draw(mcR);
  w.stuffItemsAll_ = () => [mcR];
  try { A['qp-choose'](tappedR.querySelector('.qp-opt[data-n="2"]')); } finally { w.stuffItemsAll_ = held; }
  if (!tappedR.querySelector('.qp-opt[data-n="2"].is-picked.is-ans') || tappedR.querySelectorAll('.qp-opt.is-ans').length !== 1) bad.push('a right tap did not tick the pick, and only the pick');
  try { w.localStorage.removeItem(w.__t.ansKey(mcR)); } catch (e) {}
  /* AND THE WORDS SAY WHERE THE PICTURE WENT: a question whose figure is the page AFTER it (its
     marker at the end of its words) points at the next page; one whose figure stands in front of it
     says nothing, and one without a figure says nothing -- a pointer to a page that does not exist,
     or that you have just turned past, is worse than none. */
  const fig = draw(Object.assign({}, base, { key: 'q-still-fig', diagram: '<svg viewBox="0 0 10 10"></svg>',
    html: base.html + '<!--fig-->', row: Object.assign({}, base.row, { row_id: 'Q-STILL-10' }) }));
  if (!fig.querySelector('.qsheet-figref')) bad.push('a question whose figure is on the next page does not say so');
  if (fig.querySelector('.qsheet svg')) bad.push('the question card drew its figure inline again');
  const figFront = draw(Object.assign({}, base, { key: 'q-still-fig2', diagram: '<svg viewBox="0 0 10 10"></svg>',
    row: Object.assign({}, base.row, { row_id: 'Q-STILL-11' }) }));
  if (figFront.querySelector('.qsheet-figref')) bad.push('a question whose figure stands in front of it points forward at it');
  if (typed.querySelector('.qsheet-figref')) bad.push('a question with no figure points at a figure page that does not exist');
  return bad;
});

/* ---------- A FRACTION, TYPED ON THE KEYPAD, MARKED RIGHT --------------------------------------------
   ASKED FOR AS "make the input better … like hegarty maths … desmos". keypad.js says how; this presses
   it the way a thumb would, through the real handlers, on a real question card: the box keeps the
   phone's keyboard down (`inputmode="none"`), the pad has the keys the owner listed, the fraction is
   drawn STACKED with a dashed slot while it is still empty, and ✓ runs Check — against a scheme of
   `0.75`, so the keypad's `(3)/(4)` has to go through the bracket fold in `markNorm_` and `markFrac_`'s
   "or equivalent" to be marked right. A worded question beside it keeps its textarea. */
check('a fraction typed on the maths keypad is drawn stacked, saved, and marked right against 0.75', async () => {
  const { w, errs } = boot();
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (!A['kp-key']) return ['the keypad has no handler — keypad.js did not load'];
  const draw = x => { const h = d.createElement('div'); h.innerHTML = w.questionCard_(x, 0); d.body.appendChild(h); return h.querySelector('.qcard'); };
  const base = { kind: 'question', name: 'Q4', marks: 1, answerType: 'calculation', accept: '0.75',
    row: { row_id: 'Q-KP-4', paper_id: 'P-KP', subject: 'Maths', name: 'Keypad' },
    html: '<p>Write 0.75 as a fraction.</p>', answer: '<b>3/4</b>' };
  const x = Object.assign({}, base, { key: 'q-kp-frac' });
  try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {}
  const card = draw(x);
  const inp = card.querySelector('.qp-ans-in');
  if (!inp || inp.tagName !== 'INPUT' || inp.getAttribute('inputmode') !== 'none') {
    return ['a calculation’s answer box is ' + (inp ? '<' + inp.tagName.toLowerCase() + ' inputmode="' + inp.getAttribute('inputmode') + '">' : 'missing')
      + ' — wanted an <input inputmode="none"> so the phone keyboard stays down'];
  }
  if (card.querySelector('textarea.qp-ans-in')) bad.push('the maths card drew a textarea as well as the keypad box');
  if (card.querySelector('.qp-ai')) bad.push('a maths question with a scheme was offered "Mark with AI" — Check is exact there');
  inp.focus();
  const pad = d.getElementById('kp');
  if (!pad || pad.hidden) return bad.concat(['focusing the maths box did not open the keypad']);
  const key = v => pad.querySelector('.kp-key[data-v="' + v + '"]');
  const WANT = { '0': 'zero', '9': 'nine', '.': 'point', '-': 'minus', '×': 'times', '÷': 'divide',
    '!frac': 'fraction', '!pow': 'power', '!sqrt': 'square root', 'π': 'pi', '(': 'open bracket',
    ')': 'close bracket', 'x': 'the letter x', '!back': 'backspace', '!done': 'the ✓ submit' };
  Object.keys(WANT).forEach(v => { if (!key(v)) bad.push('the keypad has no ' + WANT[v] + ' key'); });
  /* 44px IS THE STYLESHEET'S, MEASURED BY check/ui.js IN A REAL BROWSER; jsdom lays nothing out. What
     this can see is that every key is a button with a handler, and that nothing on the pad would
     take the focus off the box. */
  pad.querySelectorAll('.kp-key').forEach(b => {
    if (b.tagName !== 'BUTTON' || b.getAttribute('type') !== 'button') bad.push('a key is not a <button type="button">: ' + b.outerHTML.slice(0, 60));
  });
  const press = v => { const b = key(v); if (b) A['kp-key'](b); else bad.push('no key ' + v + ' to press'); };
  press('!frac');
  const show = card.querySelector('.kp-show');
  if (inp.value !== '()/()') bad.push('the fraction key on an empty box typed "' + inp.value + '", wanted two slots "()/()"');
  if (!show.querySelector('.frac .frac-n .kp-hole') || !show.querySelector('.frac .frac-d .kp-hole')) bad.push('an empty fraction is not drawn as two dashed slots over a line: ' + show.innerHTML.slice(0, 160));
  if (!show.querySelector('.frac-n .kp-caret')) bad.push('the caret is not in the top slot after the fraction key');
  press('3'); press('!right'); press('4');
  if (inp.value !== '(3)/(4)') bad.push('3, →, 4 into the fraction typed "' + inp.value + '", wanted "(3)/(4)"');
  const n = show.querySelector('.frac .frac-n'), dd = show.querySelector('.frac .frac-d');
  if (!n || !dd || n.textContent.trim() !== '3' || dd.textContent.trim() !== '4') bad.push('three quarters is not drawn stacked, 3 over 4: ' + show.innerHTML.slice(0, 200));
  let kept = null;
  try { kept = w.localStorage.getItem(w.__t.ansKey(x)); } catch (e) {}
  if (kept !== '(3)/(4)') bad.push('the keypad’s answer was not saved under ansKey_ (got ' + JSON.stringify(kept) + ') — it has to go through the same input listener a typed one does');
  press('!done');
  const mark = card.querySelector('.qp-mark');
  if (!mark || !mark.classList.contains('is-right')) bad.push('✓ on (3)/(4) against 0.75 did not mark it right: ' + (mark ? mark.className + ' / ' + mark.textContent.trim() : 'no mark row'));
  if (!pad.hidden) bad.push('✓ left the keypad up');
  /* ⌫ TAKES AN EMPTY STRUCTURE AWAY WHOLE, and leaves a filled one alone. */
  const y = Object.assign({}, base, { key: 'q-kp-back', accept: 'x^2', row: Object.assign({}, base.row, { row_id: 'Q-KP-5' }) });
  try { w.localStorage.removeItem(w.__t.ansKey(y)); } catch (e) {}
  const c2 = draw(y);
  const i2 = c2.querySelector('.qp-ans-in');
  i2.focus();
  press('x'); press('!pow');
  if (i2.value !== 'x^()') bad.push('x then the power key typed "' + i2.value + '", wanted "x^()"');
  if (!c2.querySelector('.kp-show sup .kp-hole')) bad.push('an empty power is not drawn as a raised slot');
  press('!back');
  if (i2.value !== 'x') bad.push('⌫ in an empty power left "' + i2.value + '", wanted the whole ^() gone');
  press('!frac'); press('!back');
  if (i2.value !== 'x') bad.push('⌫ in an empty fraction after x left "' + i2.value + '"');
  press('!pow'); press('2'); press('!done');
  if (i2.value !== 'x^(2)' || !c2.querySelector('.qp-mark.is-right')) bad.push('x^(2) against x^2 was not marked right: ' + i2.value);
  /* AND A WORDED ANSWER IS STILL WORDS, on the phone's own keyboard. */
  const wd = draw(Object.assign({}, base, { key: 'q-kp-words', answerType: 'explain', accept: '',
    row: Object.assign({}, base.row, { row_id: 'Q-KP-6' }) }));
  const ta = wd.querySelector('.qp-ans-in');
  if (!ta || ta.tagName !== 'TEXTAREA' || ta.hasAttribute('inputmode')) bad.push('an explain question lost its textarea and the device keyboard');
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

/* ---------- MARK WITH AI: OFFERED WHERE IT CAN BE RIGHT, AND QUIET WHERE IT CANNOT ---------------------
   ASKED FOR AS "add gemini marking system for worded questions." The backend half is
   `check-aimark.js`; this is the phone's. Through the real `qp-ai` handler and the real `api()`, with
   the harness's `fetch` playing the server: what is sent (the question, the scheme, the answer, the
   marks and the person by ID — `check-post.js`'s rule), what is drawn from the reply, that typing
   takes a verdict off, and that a server with no key greys the button rather than leaving a control
   that does nothing. And the two ways it is not drawn at all: a deployment without the action, and a
   payload that says there is no key. */
check('Mark with AI sends a worded answer by person id, draws marks and a sentence, and greys when there is no key', async () => {
  const bad = [];
  const withAi = Object.assign(payload(), { features: ['aiMark'], aiMarking: true });
  let mode = 'mark';
  const { w, sent, errs } = boot({ payload: withAi, reply: b => {
    if (b.action !== 'aiMark') return null;
    return mode === 'off' ? { success: false, why: 'ai-off', message: 'AI marking isn’t switched on.' }
      : { success: true, awarded: 2, available: 3, feedback: 'You named faster particles but not the activation energy.', left: 19 };
  } });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS;
  if (!A['qp-ai']) return ['"Mark with AI" has no handler'];
  w.__t.USER({ name: 'Sam Student', personId: 'P-S1', token: 'tok-1', role: 'student' });
  const x = { kind: 'question', key: 'q-ai-1', name: 'Q2', marks: 3, answerType: 'explain', accept: '',
    row: { row_id: 'Q-AI-2', paper_id: 'P-AI', subject: 'Chemistry', name: 'Rates' },
    html: '<p>Explain why the rate of reaction increases with temperature.</p>',
    answer: 'Particles move faster &mdash; more frequent collisions; more have the activation energy.' };
  try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {}
  const draw = it => { const h = d.createElement('div'); h.innerHTML = w.questionCard_(it, 0); d.body.appendChild(h); return h.querySelector('.qcard'); };
  const card = draw(x);
  const go = card.querySelector('.qp-ai-go[data-do="qp-ai"]');
  if (!go) return ['a worded question with a scheme and a deployment that has aiMark drew no "Mark with AI"'];
  const ta = card.querySelector('textarea.qp-ans-in');
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [x];
  try {
    A['qp-ai'](go);
    if (!/Write something first/.test(card.querySelector('.qp-ai .qp-verdict').textContent)) bad.push('an empty box was sent to be marked');
    if (sent.some(s => s.action === 'aiMark')) bad.push('an empty box reached the server');
    ta.value = 'The particles have more energy so they collide more often.';
    ta.dispatchEvent(new w.Event('input', { bubbles: true }));
    A['qp-ai'](go);
    await wait(50);
  } finally { w.stuffItemsAll_ = held; }
  const s = sent.find(b => b.action === 'aiMark');
  if (!s) bad.push('pressing "Mark with AI" sent nothing');
  else {
    if (s.personId !== 'P-S1') bad.push('aiMark was sent personId ' + JSON.stringify(s.personId) + ' — a person is named by id, never by a cell they can edit');
    if (s.marks !== 3) bad.push('aiMark was sent marks ' + s.marks + ', wanted the question’s 3');
    if (!/rate of reaction/.test(s.question || '')) bad.push('the question’s words were not sent: ' + JSON.stringify(s.question));
    if (!/activation energy/.test(s.scheme || '') || /&mdash;|<b>/.test(s.scheme || '')) bad.push('the scheme was not sent as plain words: ' + JSON.stringify(s.scheme));
    if (s.answer !== ta.value) bad.push('the answer sent was not the one in the box');
  }
  const row = card.querySelector('.qp-ai');
  const verdict = row.querySelector('.qp-verdict').textContent;
  if (!/2 of 3 marks/.test(verdict) || !row.classList.contains('is-near')) bad.push('two of three marks was drawn as "' + verdict + '" / ' + row.className);
  const why = card.querySelector('.qp-ai-why');
  if (!why || !/activation energy/.test(why.textContent)) bad.push('the AI’s sentence was not drawn under the row');
  ta.value += ' Also more successful collisions.';
  ta.dispatchEvent(new w.Event('input', { bubbles: true }));
  if (row.querySelector('.qp-verdict').textContent || row.classList.contains('is-near') || (why && why.textContent)) bad.push('typing after an AI mark left the old verdict on a changed answer');
  /* NO KEY ON THE SERVER: one press, then every AI button on the screen is greyed and says why. */
  mode = 'off';
  const other = draw(Object.assign({}, x, { key: 'q-ai-2', row: Object.assign({}, x.row, { row_id: 'Q-AI-3' }) }));
  w.stuffItemsAll_ = () => [x];
  try { A['qp-ai'](go); await wait(50); } finally { w.stuffItemsAll_ = held; }
  [card, other].forEach((c, i) => {
    const b = c.querySelector('.qp-ai-go');
    if (!b || !b.disabled || !c.querySelector('.qp-ai.is-off')) bad.push('after "ai-off" the ' + (i ? 'other card’s' : 'pressed') + ' AI button is not greyed');
  });
  if (!/switched on/.test(card.querySelector('.qp-ai .qp-verdict').textContent)) bad.push('"ai-off" did not say AI marking isn’t switched on');
  if (draw(Object.assign({}, x, { key: 'q-ai-4' })).querySelector('.qp-ai')) bad.push('a card drawn after "ai-off" still offers AI marking');
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  /* AND NOT DRAWN AT ALL where the payload says there is no key, or the deployment has no action. */
  for (const [why2, p] of [['aiMarking: false', { features: ['aiMark'], aiMarking: false }], ['no aiMark in features', { features: [] }]]) {
    const b2 = boot({ payload: Object.assign(payload(), p) });
    await wait(300);
    const h = b2.w.document.createElement('div');
    h.innerHTML = b2.w.questionCard_(Object.assign({}, x, { key: 'q-ai-5' }), 0);
    if (h.querySelector('.qp-ai')) bad.push('with ' + why2 + ' the card still drew "Mark with AI"');
  }
  return bad;
});

/* ---------- THE ANSWER IS ITS OWN PAGE, AND NOBODY READS IT UNTIL THEY ASK --------------------------
   ASKED FOR AS *"what I want was answers to be short and to be their own widget"*, and then *"you
   should have to click to reveal the answer. Should behave the same whether it's a tutor or child. No
   difference between the two."* `check-answers.js` holds what an answer SAYS; this holds where it is
   and who can see it, through the app's own builders:
     * the page exists exactly when there is an answer -- [q, ans], [q, fig, ans], [q], [q, fig]
     * the question card keeps its box and no longer carries the answer, in any form
     * the answer page is hidden and the answer is NOT IN ITS MARKUP (the old `is-shut` hid with CSS an
       answer anybody could read in the document)
     * the question's tile ("To the answer") turns to the page and does NOT open it -- *"answers should
       just stay hidden unless user unhides them"* -- and the page's own Show tile does; the open
       survives a redraw (the `REEL_HELD` fault: a fact left on an element dies with it), and it opens
       only that question. Hide, and every role alike, are the next journey's
     * a tapped question settled right does NOT open it, and neither does a typed answer marked right:
       the card already says "Correct", and a page that opens itself is a reveal nobody pressed
     * a TUTOR's page is hidden exactly as a student's, with the same tile label -- it was open
       without asking, behind a tile that read "The answer"
     * Saved, which draws a kept thing through `cardPages_`, keeps the answer page after the figure
   Turning the page is a real browser's question -- `check/states.js`, "the answer, turned to from
   its question" -- because jsdom lays nothing out and has no library to page through. */
check('an answer is its own page after its question, hidden from everybody alike until shown, and kept on Saved', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const gone = ['pageParts_', 'questionCard_', 'questionAnsCard_', 'questionTiles_', 'cardPages_']
    .filter(n => typeof w[n] !== 'function');
  /* `ansKey_` IS A `const`, and only a function declaration reaches the window -- so it comes
     through `__t`. `w.ansKey_` is undefined, and a `try` around it clears nothing and says nothing. */
  const ansKey = w.__t.ansKey;
  if (typeof ansKey !== 'function') gone.push('ansKey_');
  if (gone.length) return [gone.join(', ') + ' not reachable — renamed? The answer page was NOT checked'];
  const A = w.__t.ACTIONS;
  if (!A['qa-go'] || !A['qa-show']) return ['qa-go or qa-show has no handler, so nothing can show an answer page'];
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; return h; };
  const SECRET = 'Seventeen-and-a-half';
  const row = id => ({ row_id: id, paper_id: 'P-ANSP', subject: 'Maths', name: 'Answer page' });
  const base = { kind: 'question', name: 'Q5', marks: 2, key: 'q-ansp', row: row('Q-ANSP-5'),
    html: '<p>Work out 35 &divide; 2</p>', answer: '<b>' + SECRET + '</b> &mdash; 35 &divide; 2 = 17.5' };
  const fig = Object.assign({}, base, { key: 'q-ansp-fig', row: row('Q-ANSP-6'), diagram: '<svg viewBox="0 0 10 10"></svg>' });
  const none = Object.assign({}, base, { key: 'q-ansp-none', row: row('Q-ANSP-7'), answer: '' });
  const figOnly = Object.assign({}, fig, { key: 'q-ansp-figonly', row: row('Q-ANSP-8'), answer: '' });
  const parts = x => JSON.stringify(w.pageParts_(x));
  /* A FIGURE WITH NO MARKER AND NO LEAD STANDS IN FRONT OF ITS CARD -- see `partPlan_` -- and the
     answer is still the page after the card. */
  [[base, '[null,"ans"]'], [fig, '["fig",null,"ans"]'], [none, '[null]'], [figOnly, '["fig",null]']].forEach(([x, want]) => {
    if (parts(x) !== want) bad.push(x.row.row_id + ' has pages ' + parts(x) + ', wanted ' + want);
  });
  /* THE QUESTION CARD: the box, and no answer. */
  const q = el(w.questionCard_(base));
  if (q.querySelector('.qans, .qans-body') || q.textContent.indexOf(SECRET) >= 0) bad.push('the question card still draws the answer');
  if (!q.querySelector('.qp-ans')) bad.push('the question card lost its answer box');
  if (!el(w.questionTiles_(base)).querySelector('[data-do="qa-go"]')) bad.push('a question with an answer has no tile to its answer page');
  if (el(w.questionTiles_(none)).querySelector('[data-do="qa-go"]')) bad.push('a question with no answer offers a tile to an answer page that does not exist');
  /* HIDDEN, signed out. */
  if (w.__t.isTutorRole()) bad.push('signed out reads as staff, so the hidden page was NOT checked');
  const hid = el(w.questionAnsCard_(base));
  const card = hid.querySelector('.qans-card');
  if (!card || !card.classList.contains('is-hidden')) bad.push('an answer page nobody has asked for is not hidden');
  if (hid.innerHTML.indexOf(SECRET) >= 0 || hid.innerHTML.indexOf('17.5') >= 0) bad.push('a hidden answer page still carries the answer in its markup');
  if (!/Answer hidden/.test(hid.textContent)) bad.push('a hidden answer page does not say "Answer hidden": ' + hid.textContent.trim().slice(0, 80));
  if (!hid.querySelector('[data-do="qa-show"]')) bad.push('a hidden answer page has no "Show the answer"');
  if (card && card.getAttribute('data-of') !== 'Q-ANSP-5') bad.push('the answer page does not name its row');
  /* TURNED TO FROM THE QUESTION'S TILE, where the page already stands -- AND STILL HIDDEN. *"answers
     should just stay hidden unless user unhides them"*: the question's tile turns the page and that is
     all it does. It used to show the answer as it turned, which made reaching the page and revealing
     it one tap. */
  d.body.appendChild(hid);
  const other = el(w.questionAnsCard_(fig));
  d.body.appendChild(other);
  const tiles = el(w.questionTiles_(base));
  d.body.appendChild(tiles);
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [base, fig];
  const goTile = tiles.querySelector('[data-do="qa-go"]');
  if (goTile) { try { A['qa-go'](goTile); } finally { w.stuffItemsAll_ = held; } }
  w.stuffItemsAll_ = held;
  const turned = d.querySelector('.qans-card[data-of="Q-ANSP-5"]');
  if (!turned || !turned.classList.contains('is-hidden') || turned.innerHTML.indexOf(SECRET) >= 0)
    bad.push('the question\'s "To the answer" tile showed the answer as it turned to it -- revealing is the answer page\'s own tap');
  if (goTile && /show/i.test(goTile.getAttribute('aria-label') || '')) bad.push('the question\'s tile still says it shows the answer: ' + goTile.getAttribute('aria-label'));
  /* SHOWN BY THE ANSWER PAGE'S OWN TILE, where it stands. */
  const showT = turned && turned.querySelector('[data-do="qa-show"]');
  if (!showT) bad.push('the answer page has no Show tile to press');
  else { w.stuffItemsAll_ = () => [base, fig]; try { A['qa-show'](showT); } finally { w.stuffItemsAll_ = held; } }
  const now = d.querySelector('.qans-card[data-of="Q-ANSP-5"]');
  if (!now || now.classList.contains('is-hidden') || now.textContent.indexOf(SECRET) < 0) bad.push('"Show the answer" on the answer page did not open it');
  else if (now.querySelector('details, .qans-why')) bad.push('showing the answer drew a Why fold under it');
  if (el(w.questionAnsCard_(base)).textContent.indexOf(SECRET) < 0) bad.push('the answer page shut again when it was drawn again');
  const fig2 = d.querySelector('.qans-card[data-of="Q-ANSP-6"]');
  if (!fig2 || !fig2.classList.contains('is-hidden')) bad.push('showing one question\'s answer opened another\'s');
  /* NOT OPENED BY A RIGHT TAP, settled in storage -- nor by a wrong one. */
  const mc = Object.assign({}, base, { key: 'q-ansp-mc', row: row('Q-ANSP-9'), choices: ['17', '17.5'], choiceRight: [2] });
  const shutNow = x => el(w.questionAnsCard_(x)).querySelector('.qans-card.is-hidden') !== null;
  try {
    w.localStorage.setItem(ansKey(mc), '1');
    if (!shutNow(mc)) bad.push('a tapped question answered wrong opened its answer page');
    w.localStorage.setItem(ansKey(mc), '2');
    if (!shutNow(mc)) bad.push('a tapped question answered right opened its answer page by itself -- the card already says Correct, and the page waits for the tap');
  } finally { try { w.localStorage.removeItem(ansKey(mc)); } catch (e) {} }
  /* AND NOT BY A RIGHT TAP AS IT HAPPENS, through the real handler on a real card. */
  const mcLive = Object.assign({}, mc, { key: 'q-ansp-mc2', row: row('Q-ANSP-11') });
  try { w.localStorage.removeItem(ansKey(mcLive)); } catch (e) {}
  const tapCard = el(w.questionCard_(mcLive));
  d.body.appendChild(tapCard);
  const heldT = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [mcLive];
  try { A['qp-choose'](tapCard.querySelector('.qp-opt[data-n="2"]')); } finally { w.stuffItemsAll_ = heldT; }
  if (!tapCard.querySelector('.qp-mark.is-right')) bad.push('the right option was not marked Correct, so the tap was NOT checked');
  if (!shutNow(mcLive)) bad.push('tapping the right option opened the answer page');
  try { w.localStorage.removeItem(ansKey(mcLive)); } catch (e) {}
  /* AND NOT BY A TYPED ANSWER MARKED RIGHT. */
  const typedX = Object.assign({}, base, { key: 'q-ansp-typed', row: row('Q-ANSP-12'), accept: '17.5' });
  const typedCard = el(w.questionCard_(typedX));
  d.body.appendChild(typedCard);
  const inp = typedCard.querySelector('.qp-ans-in');
  if (inp) { inp.value = '17.5'; inp.dispatchEvent(new w.Event('input', { bubbles: true })); }
  const heldC = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [typedX];
  try { if (typedCard.querySelector('.qp-check')) A['qp-check'](typedCard.querySelector('.qp-check')); } finally { w.stuffItemsAll_ = heldC; }
  if (!typedCard.querySelector('.qp-mark.is-right')) bad.push('17.5 was not marked right, so a right Check was NOT checked');
  if (!shutNow(typedX)) bad.push('a typed answer marked right opened its answer page by itself');
  try { w.localStorage.removeItem(ansKey(typedX)); } catch (e) {}
  /* SAVED: the kept question's figure, then the question, then its answer -- `pageParts_`'s order. */
  const pages = w.cardPages_(fig, 0);
  if (pages.length !== 3) bad.push('Saved draws a question with a figure and an answer as ' + pages.length + ' pages, wanted 3');
  else {
    if (!/class="qcard qfig/.test(pages[0])) bad.push('Saved\'s first page of a question is not its figure, which stands in front of it');
    if (!/qans-card[^"]*" data-of="Q-ANSP-6"/.test(pages[2])) bad.push('Saved\'s third page of a question is not its answer');
  }
  if (w.cardPages_(base, 0).length !== 2) bad.push('Saved does not keep the answer page after a kept question');
  if (w.cardPages_(none, 0).length !== 1) bad.push('Saved draws an answer page for a question with no answer');
  /* A TUTOR AND AN ADMIN ARE ASKED THE SAME: hidden until the tap, behind the same tile. */
  [['Ada Tutor', 'P002', 'tutor'], ['Ann Admin', 'P001', 'admin']].forEach(([name, pid, role]) => {
    w.__t.USER({ name: name, personId: pid, role: role, roles: [role] });
    if (!w.__t.isTutorRole()) { bad.push('could not sign ' + role + ' in, so their answer page was NOT checked'); return; }
    const tx = Object.assign({}, base, { key: 'q-ansp-' + role, row: row('Q-ANSP-' + role) });
    if (!shutNow(tx)) bad.push((role === 'admin' ? 'an ' : 'a ') + role + '\'s answer page is open without "Show the answer" -- the owner asked for no difference');
    const tl = el(w.questionTiles_(tx)).querySelector('[data-do="qa-go"]');
    if (!tl || !/To the answer/.test(tl.getAttribute('aria-label') || tl.textContent)) bad.push((role === 'admin' ? 'an ' : 'a ') + role + '\'s tile does not read "To the answer": ' + (tl ? (tl.getAttribute('aria-label') || tl.textContent.trim()) : '(none)'));
  });
  w.__t.USER(null);
  return bad;
});

/* ---------- SHOW, HIDE, SHOW: ONE TILE ON THE ANSWER PAGE, THE SAME FOR EVERYBODY -----------------------
   ASKED FOR AS *"answers should just stay hidden unless user unhides them. and can hide them again.
   simple is best."* Through the real handlers, on a real answer page in the document, for four
   visitors -- signed out, a student, a tutor, an admin -- each starting from nothing shown:
     * hidden: "Answer hidden", the answer NOT IN THE MARKUP, and the one tile is Show (the eye)
     * Show: the answer drawn, and the same tile slot now Hide (the eye struck through) -- the tile row
       is the same child of the card in both states, so the thumb finds Hide where it pressed Show
     * Hide: hidden exactly as before, answer gone from the markup, Show back in the slot
     * Show again: open again -- the toggle is not a one-way door
     * drawn afresh after a Hide it is hidden (`ANS_SHOWN` forgot), after a Show it is open, and the
       next visitor's page is hidden whatever the last one did
     * the question card's tile ("To the answer") reveals nothing for any of them */
check('the answer page shows, hides and shows again from one tile, hidden by default, the same for every visitor', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  const need = ['questionAnsCard_', 'questionTiles_', 'ansShow_', 'ansHide_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? Show and Hide were NOT checked'];
  if (!A['qa-show'] || !A['qa-hide'] || !A['qa-go']) return ['qa-show, qa-hide or qa-go has no handler, so the toggle was NOT checked'];
  const SECRET = 'Forty-two-and-a-quarter';
  const x = { kind: 'question', name: 'Q8', marks: 1, key: 'q-toggle-8',
    row: { row_id: 'Q-TOGGLE-8', paper_id: 'P-TOGGLE', subject: 'Maths', name: 'Toggle' },
    html: '<p>Work out 169 &divide; 4</p>', answer: '<b>' + SECRET + '</b> &mdash; 169 &divide; 4' };
  const held = w.stuffItemsAll_;
  const press = (act, from) => {
    const b = from.querySelector('[data-do="' + act + '"]');
    if (!b) return false;
    w.stuffItemsAll_ = () => [x];
    try { A[act](b); } finally { w.stuffItemsAll_ = held; }
    return true;
  };
  /* WHICH CHILD OF THE CARD THE TILE ROW IS -- "the same place" asked as structure, since jsdom lays
     nothing out. `check/states.js` measures the pixels. */
  const slot = card => [...card.children].indexOf(card.querySelector(':scope > .tile-row'));
  const who = [
    ['signed out', null],
    ['a student', { name: 'Sam Student', personId: 'P003', role: 'student', roles: ['student'] }],
    ['a tutor', { name: 'Ada Tutor', personId: 'P002', role: 'tutor', roles: ['tutor'] }],
    ['an admin', { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'] }],
  ];
  for (const [what, u] of who) {
    w.__t.USER(u);
    const host = d.createElement('div');
    host.innerHTML = w.questionAnsCard_(x);
    d.body.appendChild(host);
    const card = () => host.querySelector('.qans-card');
    const hiddenRight = when => {
      const c = card();
      if (!c || !c.classList.contains('is-hidden')) return bad.push(what + ', ' + when + ': the page is not hidden');
      if (c.innerHTML.indexOf(SECRET) >= 0 || c.querySelector('.qans, .qans-body')) bad.push(what + ', ' + when + ': a hidden page still carries the answer in its markup');
      if (!/Answer hidden/.test(c.textContent)) bad.push(what + ', ' + when + ': a hidden page does not say "Answer hidden"');
      const t = c.querySelector('.tile-row [data-do="qa-show"]');
      if (!t || !t.classList.contains('tile')) bad.push(what + ', ' + when + ': a hidden page has no Show tile');
      else if (!t.querySelector('.tile-i-show')) bad.push(what + ', ' + when + ': the Show tile is not the eye');
      if (c.querySelector('[data-do="qa-hide"]')) bad.push(what + ', ' + when + ': a hidden page offers Hide');
    };
    const shownRight = when => {
      const c = card();
      if (!c || c.classList.contains('is-hidden') || c.textContent.indexOf(SECRET) < 0) return bad.push(what + ', ' + when + ': the answer is not shown');
      const t = c.querySelector('.tile-row [data-do="qa-hide"]');
      if (!t || !t.classList.contains('tile')) bad.push(what + ', ' + when + ': a shown page has no Hide tile');
      else if (!t.querySelector('.tile-i-hide')) bad.push(what + ', ' + when + ': the Hide tile is not the struck-through eye');
      if (c.querySelector('[data-do="qa-show"]')) bad.push(what + ', ' + when + ': a shown page still offers Show');
      if (/Answer hidden/.test(c.textContent)) bad.push(what + ', ' + when + ': a shown page still says "Answer hidden"');
    };
    hiddenRight('as drawn');
    const s0 = slot(card());
    /* THE QUESTION'S OWN TILE, pressed first: it turns pages and reveals nothing. */
    const qt = d.createElement('div');
    qt.innerHTML = w.questionTiles_(x);
    d.body.appendChild(qt);
    w.stuffItemsAll_ = () => [x];
    try { A['qa-go'](qt.querySelector('[data-do="qa-go"]')); } finally { w.stuffItemsAll_ = held; qt.remove(); }
    hiddenRight('after the question\'s "To the answer"');
    /* THE FOCUS FOLLOWS THE TOGGLE. `ansSet_` replaces the card, so the tile that was pressed is gone;
       from a keyboard the focus has to land on the tile that replaced it rather than on `<body>`. And
       ONLY from the card that held it: a Hide with the focus somewhere else leaves it there. */
    const named = e => !e ? '(nothing)' : e === d.body ? '<body>'
      : '<' + e.tagName.toLowerCase() + (e.getAttribute('data-do') ? ' ' + e.getAttribute('data-do') : '') + '>';
    const showT0 = card().querySelector('[data-do="qa-show"]');
    if (showT0) showT0.focus();
    if (!press('qa-show', card())) bad.push(what + ': nothing to press to show it');
    shownRight('after Show');
    if (d.activeElement !== card().querySelector('[data-do="qa-hide"]')) bad.push(what + ': Show threw the focus away -- it is on ' + named(d.activeElement) + ', not on the Hide tile in its place');
    if (slot(card()) !== s0) bad.push(what + ': the tile row moved from child ' + s0 + ' to ' + slot(card()) + ' when the answer was shown');
    if (w.questionAnsCard_(x).indexOf(SECRET) < 0) bad.push(what + ': the page drawn afresh after Show is shut again');
    const elsewhere = d.createElement('input');
    d.body.appendChild(elsewhere);
    elsewhere.focus();
    if (!press('qa-hide', card())) bad.push(what + ': nothing to press to hide it');
    if (d.activeElement !== elsewhere) bad.push(what + ': a Hide pulled the focus to ' + named(d.activeElement) + ' from a box that held it, outside the card');
    elsewhere.remove();
    hiddenRight('after Hide');
    if (slot(card()) !== s0) bad.push(what + ': the tile row moved when the answer was hidden again');
    if (w.questionAnsCard_(x).indexOf(SECRET) >= 0) bad.push(what + ': the page drawn afresh after Hide is still open -- ANS_SHOWN did not forget it');
    if (!press('qa-show', card())) bad.push(what + ': nothing to press to show it a second time');
    shownRight('after Show, Hide, Show');
    /* AND PUT BACK, so the next visitor starts where everybody starts. */
    press('qa-hide', card());
    host.remove();
  }
  /* THE NEXT PERSON ON THE PHONE starts hidden whatever the last one did: the key carries who it is. */
  w.__t.USER(who[1][1]);
  w.ansShow_(x);
  w.__t.USER(who[2][1]);
  if (w.questionAnsCard_(x).indexOf(SECRET) >= 0) bad.push('a tutor\'s page is open because the student before them showed theirs');
  w.__t.USER(who[1][1]);
  w.ansHide_(x);
  w.__t.USER(null);
  return bad;
});

/* ---------- A QUESTION'S PAGES IN THE PAPER'S ORDER, AND A FIGURE NAMED AS THE PAPER NAMES IT ----------
   ASKED FOR AS *"preserve order of question from exam while at the same time giving diagrams and
   figures their own widget"* and *"diagram widgets shouldn't have a question number on them"*. Through
   the app's own builders, on a question shaped like Q3 of AQA Biology 8464/B/2H -- a stem that names
   Figure 3 and carries it, then parts, one of which has its own drawing it calls Figure 4:
     * the stem is its own page (`stemN`), then its figure (`sfigN`), then the first part -- ONCE: the
       next part along does not draw them again, but a part with nobody in front of it does
     * the strip (`stuffPages_`) reads stem, figure, (a), (a)'s answer, (b), (c), (c)'s own figure
     * the part's card no longer carries the stem; the stem card is `Q3` with no part and no marks
     * a figure page's header is the figure's own name -- Figure 3, Figure 4 (not the stem's 3), or
       plain Figure -- and never a question number
     * the answer tile turns by the distance from the CARD to the answer, not from the first page,
       which stopped being the same number when a stem could stand in front. */
check('a question\'s pages follow the paper: its stem and that stem\'s figure first and once, and a figure has no question number', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['pageParts_', 'questionCard_', 'questionStemCard_', 'questionStemFigCard_', 'questionFigCard_',
                'stuffPages_', 'cardPages_', 'questionTiles_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The paper order was NOT checked'];
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; return h; };
  const svg = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>';
  const stem = { id: 'S-ORD-3', html: '<p>AKU is a genetic disorder.</p><p>Figure 3 shows the inheritance of AKU in one family.</p>', diagram: svg };
  const row = id => ({ row_id: id, paper_id: 'P-ORD', subject: 'Biology', name: 'Order' });
  const part = (p, extra) => Object.assign({ kind: 'question', name: 'Q3(' + p + ')', qNumber: '3', qPart: p, marks: 2,
    key: 'q-ord-3' + p, row: row('Q-ORD-3' + p), stems: [stem], html: '<p>Part ' + p + '</p>' }, extra || {});
  const a = part('a', { html: '<p>Describe how Figure 3 shows that the allele is recessive.</p>', answer: '<b>both parents unaffected</b>' });
  const b = part('b');
  const c = part('c', { html: '<p>Use Figure 3 to complete Figure 4.</p>', diagram: svg });
  const parts = (x, prev) => JSON.stringify(w.pageParts_(x, prev));
  [[a, null, '["stem0","sfig0",null,"ans"]', '(a) with nothing in front'],
   [b, a, '[null]', '(b) after (a), which showed the stem'],
   [c, b, '["fig",null]', '(c) after (b), its own figure in front of its ask'],
   [b, null, '["stem0","sfig0",null]', '(b) on its own, which still needs its stem'],
   [Object.assign({}, b, { stems: [{ id: 'S-ORD-PIC', diagram: svg }] }), null, '["sfig0",null]', 'a stem that is only a picture']
  ].forEach(([x, prev, want, what]) => {
    if (parts(x, prev) !== want) bad.push(what + ' has pages ' + parts(x, prev) + ', wanted ' + want);
  });
  /* THE STRIP, through the app's own expansion over a results list. */
  const heldF = w.stuffFiltered;
  w.stuffFiltered = (() => { const list = [a, b, c]; return () => list; })();
  let strip = '';
  try { strip = w.stuffPages_().map(pg => pg.x.qPart + ':' + (pg.part || 'card')).join(' '); } finally { w.stuffFiltered = heldF; }
  if (strip !== 'a:stem0 a:sfig0 a:card a:ans b:card c:fig c:card') bad.push('the strip reads "' + strip + '", wanted the paper\'s order: stem, its figure, (a), its answer, (b), (c)\'s figure, (c)');
  /* SAVED, which draws a kept part alone, keeps the stem and its figure in front of it. */
  try { if (w.cardPages_(b, 0).length !== 3) bad.push('Saved draws ' + w.cardPages_(b, 0).length + ' pages for a kept part, wanted its stem, the stem\'s figure and the part'); }
  catch (e) { bad.push('cardPages_ threw on a part with a stem: ' + e.message); }
  /* THE CARDS. */
  const q = el(w.questionCard_(a));
  if (q.querySelector('.qsheet-stem') || /AKU is a genetic/.test(q.textContent)) bad.push('the part\'s card still prints the stem it now follows');
  const s = el(w.questionStemCard_(a, 0));
  const sHead = pageHead(s);
  if (!s.querySelector('.qcard.qstem[data-of="S-ORD-3"] .qsheet-stem')) bad.push('the stem page does not draw the stem or name its row');
  if (sHead !== 'Question Q3') bad.push('the stem page is tagged "' + sHead + '", wanted Question and the question\'s number alone, Q3');
  if (tagText(s, 'marks')) bad.push('the stem page carries the marks "' + tagText(s, 'marks') + '" -- they are each part\'s');
  if (!s.querySelector('.qsheet-figref')) bad.push('a stem whose figure is the next page does not say so');
  const head = html => pageHead(el(html));
  const sf = w.questionStemFigCard_(a, 0);
  if (head(sf) !== 'Figure 3') bad.push('the stem\'s figure is headed "' + head(sf) + '", wanted Figure 3');
  if (!el(sf).querySelector('.qfig[data-of="S-ORD-3"] svg')) bad.push('the stem\'s figure page does not draw its picture');
  if (head(w.questionFigCard_(c)) !== 'Figure 4') bad.push('(c)\'s own drawing is headed "' + head(w.questionFigCard_(c)) + '", wanted Figure 4 -- Figure 3 is the stem\'s');
  const plain = part('d', { stems: [], diagram: svg, html: '<p>Measure the angle.</p>' });
  if (head(w.questionFigCard_(plain)) !== 'Figure') bad.push('a figure the paper does not number is headed "' + head(w.questionFigCard_(plain)) + '", wanted Figure');
  [sf, w.questionFigCard_(c), w.questionFigCard_(plain)].forEach(h => {
    const row = el(h).querySelector('.qcard-tags');
    if (!row) bad.push('a figure page has no tag row');
    else if (tagText(el(h), 'number') || tagText(el(h), 'marks') || /\bQ\d/.test(row.textContent)) bad.push('a figure page carries a question number or marks: ' + row.textContent.replace(/\s+/g, ' ').trim());
  });
  if (el(w.questionCard_(c)).querySelector('.qsheet-figref')) bad.push('(c), whose own figure stands in front of it, points forward at a figure');
  if (el(w.questionCard_(b)).querySelector('.qsheet-figref')) bad.push('(b) points at a figure page it does not have -- the stem\'s figure is in front of it, not after');
  /* THE TILE: from (a)'s card, two pages after a stem and its figure, the answer is ONE page on. */
  const strip2 = el('<div id="s-ordtest"><section class="page"></section><section class="page"></section>'
    + '<section class="page"><div class="tile-row">' + w.questionTiles_(a) + '</div></section><section class="page"></section></div>');
  d.body.appendChild(strip2);
  const heldA = w.stuffItemsAll_, heldG = w.goPage;
  let went = null;
  w.stuffItemsAll_ = () => [a];
  w.goPage = (id, n) => { went = [id, n]; };
  try { w.__t.ACTIONS['qa-go'](strip2.querySelector('[data-do="qa-go"]')); }
  finally { w.stuffItemsAll_ = heldA; w.goPage = heldG; strip2.remove(); }
  if (!went || went[0] !== 'ordtest' || went[1] !== 3) bad.push('the answer tile on (a)\'s card turned to ' + JSON.stringify(went) + ', wanted page 3 -- the card is page 2 and its answer the page after');
  return bad;
});

/* ---------- A PAGE TOO LONG FOR A PHONE IS CUT BETWEEN PARAGRAPHS, AND THE ASK STAYS WITH ITS BOX -------
   ASKED FOR AS *"each widget is smaller than a phone screen"*. `check/cards.js` measures the pixels
   over the whole library; this holds the rules of the cut, through the app's own builders:
     * a part that fits is one card, in the wrappers it always had (`.qsheet-lead`, `.qsheet-pb`)
     * a long part is `pre0`, `pre1`... and then the card, every word once and in order, the LAST
       paragraph (the ask) on the card with the box, the pre pages with no box and saying "continued"
     * a long stem is `stem0`, `stem0-1`... and then its figure; only its first page carries `lines`
     * a table is never cut, and one block longer than a page stays whole rather than being broken
     * the answer tile still turns from the card to the answer, past any pre pages in front */
check('a page too long for a phone is cut between paragraphs, and the ask stays on the card with its box', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['pageParts_', 'questionCard_', 'questionPreCard_', 'questionStemCard_', 'partChunks_', 'htmlBlocks_']
    .filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The cut was NOT checked'];
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; return h; };
  const para = n => '<p>Step ' + n + ': ' + 'the solution is heated gently and stirred until it is clear. '.repeat(3) + '</p>';
  const table = '<table><tr><th>t / s</th><th>T / °C</th></tr>' + [1, 2, 3, 4, 5, 6].map(i => '<tr><td>' + i + '</td><td>' + (20 + i) + '</td></tr>').join('') + '</table>';
  const ask = '<p>Calculate the mean rate of temperature rise. ASK-LAST</p>';
  const row = id => ({ row_id: id, paper_id: 'P-CUT', subject: 'Chemistry', name: 'Cut' });
  const long = { kind: 'question', name: 'Q2.4', marks: 3, key: 'q-cut-long', row: row('Q-CUT-24'), stems: [],
    lead: '<p>A student did an experiment. LEAD-FIRST</p>',
    html: [1, 2, 3, 4, 5, 6, 7, 8].map(para).join('') + table + ask, answer: '<b>0.5 °C/s</b>', accept: '0.5' };
  const short = { kind: 'question', name: 'Q1', marks: 1, key: 'q-cut-short', row: row('Q-CUT-1'), stems: [],
    lead: '<p>Lead</p>', html: '<p>Work out 3 + 4</p>' };
  if (JSON.stringify(w.pageParts_(short)) !== '[null]') bad.push('a short part was cut: ' + JSON.stringify(w.pageParts_(short)));
  const sc = el(w.questionCard_(short));
  if (!sc.querySelector('.qsheet-lead') || !sc.querySelector('.qsheet-part > .qsheet-pb') || /of \d/.test(tagText(sc, 'number'))) bad.push('a short part lost its wrappers or says "1 of 1"');
  const parts = w.pageParts_(long);
  const pre = parts.filter(p => /^pre\d+$/.test(p || ''));
  if (!pre.length) bad.push('a part of eight paragraphs, a table and an ask was not cut: ' + JSON.stringify(parts));
  else {
    if (parts.indexOf(null) !== pre.length) bad.push('the pre pages do not come straight before the card: ' + JSON.stringify(parts));
    const pages = pre.map(p => el(w.stuffPart_(long, p))).concat([el(w.questionCard_(long))]);
    const text = pages.map(p => p.querySelector('.qsheet').textContent.replace(/Continued on the next page.*$/m, '')).join(' ');
    const want = [1, 2, 3, 4, 5, 6, 7, 8].map(n => 'Step ' + n + ':').concat(['LEAD-FIRST', 'ASK-LAST', 't / s']);
    want.forEach(t => { if (text.split(t).length !== 2) bad.push('"' + t + '" is on ' + (text.split(t).length - 1) + ' pages, wanted exactly one'); });
    if (text.indexOf('LEAD-FIRST') > text.indexOf('Step 1:') || text.indexOf('Step 8:') > text.indexOf('ASK-LAST')) bad.push('the cut pages are out of order');
    const card = pages[pages.length - 1];
    if (!/ASK-LAST/.test(card.textContent) || !card.querySelector('.qp-ans')) bad.push('the ask and the box are not on the same card');
    /* THE CUT RUNS FROM THE END: the card has the box and the tiles to make room for, so it takes the
       ask and only what fits beside them -- here the ask alone, the table too heavy to join it. Cut
       from the front instead, the card is whatever was left over: the last steps, the table and the
       ask, which is the long card this exists to stop. */
    if (/Step \d+:|t \/ s/.test(card.querySelector('.qsheet').textContent)) bad.push('the card took more than the ask beside its box -- the cut ran from the front: ' + card.querySelector('.qsheet').textContent.trim().slice(0, 80));
    pages.slice(0, -1).forEach((p, i) => {
      if (p.querySelector('.qp-ans, .qp-check')) bad.push('pre page ' + i + ' carries an answer box');
      if (!/Continued on the next page/.test(p.textContent)) bad.push('pre page ' + i + ' does not say it continues');
      if (!p.querySelector('.qcard.qpre[data-of="Q-CUT-24"]')) bad.push('pre page ' + i + ' does not name its row');
    });
    if (pages.some(p => p.querySelectorAll('table').length > 1 || (p.querySelector('table') && p.querySelectorAll('table tr').length !== 7))) bad.push('the table was cut between its rows');
    const n = pages.length;
    if (!new RegExp('^Q2\\.4 · ' + n + ' of ' + n + '$').test(tagText(card, 'number'))) bad.push('the card\'s number tag reads "' + tagText(card, 'number') + '", wanted Q2.4 · ' + n + ' of ' + n);
    /* THE TILE turns from the card to the answer, past the pre pages in front of it. */
    const strip = el('<div id="s-cuttest">' + parts.map(p => p === null
      ? '<section class="page"><div class="tile-row">' + w.questionTiles_(long) + '</div></section>' : '<section class="page"></section>').join('') + '</div>');
    d.body.appendChild(strip);
    const heldA = w.stuffItemsAll_, heldG = w.goPage;
    let went = null;
    w.stuffItemsAll_ = () => [long];
    w.goPage = (id, to) => { went = to; };
    try { w.__t.ACTIONS['qa-go'](strip.querySelector('[data-do="qa-go"]')); } finally { w.stuffItemsAll_ = heldA; w.goPage = heldG; strip.remove(); }
    if (went !== parts.indexOf('ans')) bad.push('the answer tile turned to page ' + went + ', wanted ' + parts.indexOf('ans'));
  }
  /* ONE BLOCK LONGER THAN A PAGE stays whole. */
  const one = { kind: 'question', name: 'Q9', key: 'q-cut-one', row: row('Q-CUT-9'), stems: [], html: '<p>' + 'word '.repeat(600) + '</p>' };
  if (JSON.stringify(w.pageParts_(one)) !== '[null]') bad.push('a single paragraph was cut inside itself: ' + JSON.stringify(w.pageParts_(one)));
  /* A LONG STEM. */
  const stem = { id: 'S-CUT-3', lines: 'Lines 1 to 40', html: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(para).join(''), diagram: '<svg viewBox="0 0 10 10"></svg>' };
  const sp = { kind: 'question', name: 'Q3(a)', qNumber: '3', key: 'q-cut-sp', row: row('Q-CUT-3a'), stems: [stem], html: '<p>Explain.</p>' };
  const sparts = w.pageParts_(sp);
  const sPages = sparts.filter(p => /^stem0(-\d+)?$/.test(p || ''));
  if (sPages.length < 2 || sparts.indexOf('sfig0') !== sPages.length || sPages[1] !== 'stem0-1') bad.push('a ten-paragraph stem was not cut into stem0, stem0-1... before its figure: ' + JSON.stringify(sparts));
  else {
    const drawn = sPages.map(p => el(w.stuffPart_(sp, p)));
    if (!drawn[0].querySelector('.qsheet-lines') || drawn[1].querySelector('.qsheet-lines')) bad.push('the stem\'s "Lines" label is not on its first page alone');
    if (!/Continued on the next page/.test(drawn[0].textContent) || !/Figure on the next page/.test(drawn[drawn.length - 1].textContent)) bad.push('a cut stem does not say "continued" then "figure" where it ends');
    const st = drawn.map(p => p.textContent).join(' ');
    [1, 5, 10].forEach(n => { if (st.split('Step ' + n + ':').length !== 2) bad.push('stem step ' + n + ' is not on exactly one page'); });
  }
  return bad;
});

/* ---------- EVERY FIGURE WHERE THE PAPER PRINTS IT, ON A PAGE OF ITS OWN ---------------------------------
   ASKED FOR AS *"Let's say there's a question which begins with text, then diagram, then text then
   diagram then text. This should break into 5 widgets. This is to ensure it's same order but diagram
   has its own widget."* The data marks where a row's figure stands with `<!--fig-->` between two
   blocks of its `html` (`figBlocks_`); through the app's own builders and its own strip:
     * the owner's sentence exactly -- stem text, the stem's figure, (a)'s text, (a)'s figure, (a)'s
       ask with the box -- is FIVE pages and then the answer, in that order
     * a stem with words on BOTH sides of its figure, and a part with a lead: the stem's words, its
       figure, the rest of its words (still `Q5`), the lead (`Q5(a)`), the part's figure, the ask --
       six, because the header changes from Q5 to Q5(a) between the third and the fourth: the stem's
       words are every part's, the lead is (a)'s, and one page holding both would print (a)'s
       sentence under a header that says Q5
     * text pages carry the number (`Q5 · 1 of 2`, `Q5(a) · 2 of 2`), figure pages only the figure's
       name; the box is on the page with the part's last words and nowhere else; "Figure on the
       next page" exactly where the next page is a figure
     * every word once and in order, and the marker NEVER drawn -- not on a page, not in the search
       haystack
     * the four placements without a marker: a lead (lead, figure, ask), none (figure, then the
       card), a pen question (the card, then the figure to draw on), a marker at the very end (the
       card, then the figure); a marker inside a paragraph stands after it rather than cutting it
     * the cut still works inside a side: eight paragraphs before the figure are cut into pages in
       front of it, and no page holds words from both sides
     * the strip (`stuffPages_`), Saved (`cardPages_`) and the answer tile all agree */
check('a figure stands where the paper prints it, on its own page: text, figure, text, figure, text', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['pageParts_', 'questionCard_', 'questionStemCard_', 'questionStemFigCard_', 'questionFigCard_',
                'questionPreCard_', 'stuffPart_', 'stuffPages_', 'cardPages_', 'questionTiles_', 'figBlocks_', 'partPlan_']
    .filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The figure order was NOT checked'];
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; return h; };
  const svg = n => '<svg viewBox="0 0 340 200"><text x="10" y="20">' + n + '</text></svg>';
  const row = id => ({ row_id: id, paper_id: 'P-FIG', subject: 'Maths', name: 'Paper 1: Foundation — June 2024' });
  const page = (x, part) => el(part ? w.stuffPart_(x, part) : w.stuffCard(x, 0));
  const head = pg => pageHead(pg);
  const say = pg => { const r = pg.querySelector('.qsheet-figref'); return r ? r.textContent.replace(/\s+/g, ' ').trim() : ''; };

  /* ---------- THE OWNER'S SENTENCE: FIVE PAGES ------------------------------------------------- */
  const stem5 = { id: 'S-FIG-5', html: '<p>ONE-TEXT A shape is drawn on a grid.</p>', diagram: svg('FIG-ONE') };
  const q5 = { kind: 'question', name: 'Q5(a)', qNumber: '5', qPart: 'a', marks: 2, key: 'q-fig-5a', row: row('Q-FIG-5a'),
    stems: [stem5], html: '<p>THREE-TEXT The shape is reflected in the line.</p><!--fig--><p>FIVE-TEXT Work out the size of angle x.</p>',
    diagram: svg('FIG-FOUR'), answer: '<b>40&deg;</b>', accept: '40' };
  const want5 = '["stem0","sfig0","pre0","fig",null,"ans"]';
  if (JSON.stringify(w.pageParts_(q5)) !== want5) bad.push('text, diagram, text, diagram, text has pages ' + JSON.stringify(w.pageParts_(q5)) + ', wanted ' + want5 + ' -- five, in that order, then the answer');
  else {
    const drawn = w.pageParts_(q5).map(p => page(q5, p));
    const words = ['ONE-TEXT', 'FIG-ONE', 'THREE-TEXT', 'FIG-FOUR', 'FIVE-TEXT'];
    words.forEach((t, i) => { if (drawn[i].textContent.indexOf(t) < 0) bad.push('page ' + (i + 1) + ' of the five does not hold ' + t + ': ' + drawn[i].textContent.replace(/\s+/g, ' ').trim().slice(0, 80)); });
    const heads = drawn.slice(0, 5).map(head);
    if (JSON.stringify(heads) !== JSON.stringify(['Question Q5', 'Figure', 'Question Q5(a) · 1 of 2', 'Figure', 'Question Q5(a) · 2 of 2']))
      bad.push('the five pages are tagged ' + JSON.stringify(heads) + ', wanted Question Q5, Figure, Question Q5(a) · 1 of 2, Figure, Question Q5(a) · 2 of 2');
    if (!drawn[4].querySelector('.qp-ans') || drawn.slice(0, 4).some(p => p.querySelector('.qp-ans'))) bad.push('the box is not on the last of the words alone');
    if (say(drawn[2]) !== 'Figure on the next page →') bad.push('(a)\'s words before its figure say "' + say(drawn[2]) + '", wanted "Figure on the next page →"');
    if (say(drawn[4])) bad.push('(a)\'s ask, after its figure, still points forward: "' + say(drawn[4]) + '"');
    if (!drawn[5].querySelector('.qans-card')) bad.push('the page after the ask is not the answer');
  }

  /* ---------- A STEM WITH WORDS ON BOTH SIDES OF ITS FIGURE, AND A PART WITH A LEAD -------------- */
  const stem = { id: 'S-FIG-6', html: '<p>STEM-ONE The diagram shows a triangle ABC.</p><!--fig--><p>STEM-TWO AB = 7 cm and angle C = 90°.</p>', diagram: svg('STEM-FIG') };
  const a = { kind: 'question', name: 'Q6(a)', qNumber: '6', qPart: 'a', marks: 3, key: 'q-fig-6a', row: row('Q-FIG-6a'),
    stems: [stem], lead: '<p>PART-LEAD Here is a second triangle, PQR.</p>', diagram: svg('PART-FIG'),
    html: '<p>PART-ASK Work out the length of PR.</p>', answer: '<b>5 cm</b> &mdash; by Pythagoras' };
  const want = '["stem0","sfig0","stem0-1","pre0","fig",null,"ans"]';
  const parts = w.pageParts_(a);
  if (JSON.stringify(parts) !== want) bad.push('stem text <!--fig--> stem text + lead + figure + ask has pages ' + JSON.stringify(parts) + ', wanted ' + want);
  else {
    const drawn = parts.map(p => page(a, p));
    const heads = drawn.map(head);
    const wantHeads = ['Question Q6 · 1 of 2', 'Figure', 'Question Q6 · 2 of 2', 'Question Q6(a) · 1 of 2', 'Figure',
                       'Question Q6(a) · 2 of 2', 'Answer Q6(a)'];
    if (JSON.stringify(heads) !== JSON.stringify(wantHeads)) bad.push('the pages are headed ' + JSON.stringify(heads) + ', wanted ' + JSON.stringify(wantHeads));
    /* EVERY WORD ONCE AND IN ORDER, and the figures between them. */
    const text = drawn.map(p => p.textContent).join(' | ');
    const seq = ['STEM-ONE', 'STEM-FIG', 'STEM-TWO', 'PART-LEAD', 'PART-FIG', 'PART-ASK'];
    seq.forEach(t => { if (text.split(t).length !== 2) bad.push('"' + t + '" is drawn ' + (text.split(t).length - 1) + ' times, wanted once'); });
    if (seq.some((t, i) => i && text.indexOf(t) < text.indexOf(seq[i - 1]))) bad.push('the words and figures are out of the paper\'s order: ' + seq.map(t => text.indexOf(t)).join(', '));
    /* FIGURE PAGES: a picture, its name, no number, no box. */
    [1, 4].forEach(i => {
      if (!drawn[i].querySelector('.qcard.qfig svg')) bad.push('page ' + (i + 1) + ' is not a figure page with its picture');
      if (tagText(drawn[i], 'number') || /\bQ\d/.test((drawn[i].querySelector('.qcard-tags') || {}).textContent || '')) bad.push('figure page ' + (i + 1) + ' carries a question number');
    });
    if (drawn.slice(0, 5).some(p => p.querySelector('.qp-ans')) || !drawn[5].querySelector('.qp-ans')) bad.push('the box is not on the page with the part\'s last words alone');
    const says = drawn.slice(0, 6).map(say);
    const wantSays = ['Figure on the next page →', '', '', 'Figure on the next page →', '', ''];
    if (JSON.stringify(says) !== JSON.stringify(wantSays)) bad.push('the pages\' pointers read ' + JSON.stringify(says) + ', wanted ' + JSON.stringify(wantSays));
    /* THE MARKER, NEVER DRAWN AND NEVER SEARCHED. */
    if (drawn.some(p => /<!--\s*fig/.test(p.innerHTML))) bad.push('the <!--fig--> marker is in a drawn page');
    if (typeof w.plainText_ === 'function' && /fig/i.test(w.plainText_(a.html))) bad.push('the marker reaches the search haystack: ' + w.plainText_(a.html));
    /* THE STRIP, SAVED AND THE TILE. */
    const heldF = w.stuffFiltered;
    w.stuffFiltered = (() => { const list = [a]; return () => list; })();
    let strip = '';
    try { strip = w.stuffPages_().map(pg => pg.part || 'card').join(' '); } finally { w.stuffFiltered = heldF; }
    if (strip !== 'stem0 sfig0 stem0-1 pre0 fig card ans') bad.push('the strip reads "' + strip + '"');
    const saved = w.cardPages_(a, 0);
    if (saved.length !== 7 || !/class="qcard qfig/.test(saved[4]) || !/qp-ans/.test(saved[5])) bad.push('Saved draws the question as ' + saved.length + ' pages, not the same seven in the same order');
    const tiles = el('<div id="s-figtest">' + parts.map(p => p === null
      ? '<section class="page"><div class="tile-row">' + w.questionTiles_(a) + '</div></section>' : '<section class="page"></section>').join('') + '</div>');
    d.body.appendChild(tiles);
    const heldA = w.stuffItemsAll_, heldG = w.goPage;
    let went = null;
    w.stuffItemsAll_ = () => [a];
    w.goPage = (id, to) => { went = to; };
    try { w.__t.ACTIONS['qa-go'](tiles.querySelector('[data-do="qa-go"]')); } finally { w.stuffItemsAll_ = heldA; w.goPage = heldG; tiles.remove(); }
    if (went !== parts.indexOf('ans')) bad.push('the answer tile turned to page ' + went + ', wanted ' + parts.indexOf('ans'));
  }

  /* ---------- WITHOUT A MARKER, AND WITH ONE IN THE WRONG PLACE ---------------------------------- */
  const one = (id, extra) => Object.assign({ kind: 'question', name: 'Q7', qNumber: '7', marks: 1, key: 'q-fig-' + id,
    row: row('Q-FIG-' + id), stems: [], diagram: svg('F'), html: '<p>Ask.</p>' }, extra);
  [[one('lead', { lead: '<p>Here is a grid.</p>' }), '["pre0","fig",null]', 'a lead and no marker: the lead, the figure, the ask'],
   [one('none', {}), '["fig",null]', 'no lead and no marker: the figure in front of the card'],
   [one('pen', { answerType: 'drawing', lead: '<p>Here is a grid.</p>' }), '[null,"fig"]', 'a pen question and no marker: the card, then the figure to draw on'],
   [one('end', { html: '<p>Ask.</p><!--fig-->' }), '[null,"fig"]', 'a marker at the very end: the card, then the figure'],
   [one('start', { html: '<!--fig--><p>Ask.</p>' }), '["fig",null]', 'a marker at the very start: the figure, then the card'],
   [one('nofig', { diagram: '', html: '<p>Before.</p><!--fig--><p>After.</p>' }), '[null]', 'a marker on a row with no figure: nothing to place, one card']
  ].forEach(([x, want, what]) => {
    if (JSON.stringify(w.pageParts_(x)) !== want) bad.push(what + ' -- got ' + JSON.stringify(w.pageParts_(x)) + ', wanted ' + want);
  });
  const nofig = el(w.questionCard_(one('nofig2', { diagram: '', html: '<p>Before.</p><!--fig--><p>After.</p>' })));
  if (!/Before\.[\s\S]*After\./.test(nofig.textContent) || /<!--/.test(nofig.innerHTML)) bad.push('a marker on a row with no figure is drawn, or lost the words around it');
  const inside = w.figBlocks_('<p>One.</p><p>Two <!--fig--> halves.</p><p>Three.</p>');
  if (inside.at !== 2 || inside.blocks.length !== 3 || /<!--/.test(inside.blocks.join(''))) bad.push('a marker inside a paragraph cut it, or did not stand after it: ' + JSON.stringify(inside));

  /* ---------- THE CUT, INSIDE A SIDE --------------------------------------------------------------- */
  const para = n => '<p>BEFORE-' + n + ' ' + 'the solution is heated gently and stirred until it is clear. '.repeat(3) + '</p>';
  const longX = one('long', { html: [1, 2, 3, 4, 5, 6, 7, 8].map(para).join('') + '<!--fig--><p>AFTER-ASK Find the rate.</p>' });
  const lp = w.pageParts_(longX);
  const fi = lp.indexOf('fig');
  if (fi < 2 || lp[fi + 1] !== null || lp.slice(0, fi).some(p => !/^pre\d+$/.test(p))) bad.push('eight paragraphs before a figure were not cut into pages in front of it: ' + JSON.stringify(lp));
  else {
    const before = lp.slice(0, fi).map(p => page(longX, p).textContent).join(' ');
    const after = page(longX, null).textContent;
    if (/AFTER-ASK/.test(before) || /BEFORE-\d/.test(after)) bad.push('a page holds words from both sides of the figure');
    [1, 8].forEach(n => { if (before.split('BEFORE-' + n + ' ').length !== 2) bad.push('BEFORE-' + n + ' is not on exactly one page in front of the figure'); });
  }
  return bad;
});

/* ---------- A QUESTION ANSWERED ON A DIAGRAM HAS SOMETHING TO ANSWER ON --------------------------------
   ASKED FOR AS *"some questions require answers on diagram. So should have a diagram for them to draw
   on to do it or whatever."* 234 of the 301 drawing and annotating questions had no picture under the
   pen. Through the app's own builders and handlers:
     * a drawing question with no picture gets a figure page AFTER its card (the ask first, then the
       thing to draw on), with the pen over a squared grid, headed "Squared grid" -- never "Figure",
       never a question number -- and a line saying it is not the paper's figure; marks stored under
       `padKey_` come back on it
     * which surface: `figure` naming a coordinate grid is axes; any other grid is squared; nothing
       is a blank space; an isometric label is blank; `surface` on the row wins, even on a question
       not answered by drawing; a question's own diagram, or its stem's one diagram, wins over all of
       it -- the paper's figure is never replaced by a surface
     * "text": no picture at all -- the part's own words are the surface. Every word a tap target; a
       tap rings it and stores it under the pen's key, another tap takes the ring off; a redraw keeps
       the rings; the passage reads exactly as it did (the same text, nothing added inside a word,
       "don't" one word, a full stop outside the word); the lead is not wrapped; a pre page and the
       card name a word the same way */
check('a question answered on a diagram has a surface: a grid under the pen, or its passage to ring words in', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['pageParts_', 'questionCard_', 'questionFigCard_', 'padSource_', 'padSurface_', 'surfaceSvg_', 'circWords_']
    .filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The surfaces were NOT checked'];
  const A = w.__t.ACTIONS;
  if (!A['qw-tap']) return ['qw-tap has no handler, so a word cannot be ringed'];
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; d.body.appendChild(h); return h; };
  const row = (id, extra) => Object.assign({ row_id: id, paper_id: 'P-SURF', subject: 'Maths', name: 'Surface' }, extra || {});
  const q = (id, extra, rowExtra) => Object.assign({ kind: 'question', name: 'Q8', qNumber: '8', marks: 2, key: 'q:Q-SURF-' + id,
    row: row('Q-SURF-' + id, rowExtra), stems: [], html: '<p>Draw the graph of y = 2x + 1.</p>' }, extra || {});

  /* ---------- THE FALLBACK GRID ------------------------------------------------------------------ */
  const grid = q('grid', { answerType: 'drawing' }, { figure: 'grid-blank' });
  if (JSON.stringify(w.pageParts_(grid)) !== '[null,"fig"]') bad.push('a drawing question with no picture has pages ' + JSON.stringify(w.pageParts_(grid)) + ', wanted [null,"fig"] -- the ask, then the surface');
  try { w.localStorage.setItem('pad:' + grid.key, JSON.stringify([[20, 20, 200, 200]])); } catch (e) {}
  const gp = el(w.questionFigCard_(grid));
  const pad = gp.querySelector('.qcard.qfig .qpad');
  if (!pad) bad.push('the surface page has no pen');
  else {
    if (!pad.querySelector('.qpad-art > svg.qsurf.is-grid')) bad.push('the pen is not over a squared grid: ' + (pad.querySelector('.qpad-art svg') || {}).outerHTML);
    if (pad.querySelectorAll('svg.qsurf line.grid').length < 30) bad.push('the grid has ' + pad.querySelectorAll('svg.qsurf line.grid').length + ' lines -- that is not squared paper');
    if (pad.getAttribute('data-k') !== 'pad:' + grid.key) bad.push('the surface\'s marks are kept under ' + pad.getAttribute('data-k') + ', not the pen\'s own key');
    if (!pad.querySelector('.qpad-g path')) bad.push('a mark stored under the pen\'s key is not drawn back on the surface');
    if (!/not the paper.s own figure/i.test(pad.textContent)) bad.push('the surface does not say it is not the paper\'s figure');
  }
  const gHead = pageHead(gp);
  if (gHead !== 'Squared grid') bad.push('the surface page is tagged "' + gHead + '", wanted "Squared grid"');
  if (/\bQ\d|Figure/.test(gHead)) bad.push('the surface page claims a number or a figure: ' + gHead);
  try { w.localStorage.removeItem('pad:' + grid.key); } catch (e) {}
  const ref = (el(w.questionCard_(grid)).querySelector('.qsheet-figref') || {}).textContent || '';
  if (!/^Squared grid on the next page/.test(ref.trim())) bad.push('the card does not say the squared grid is on the next page, in the words the page is headed with: "' + ref.trim() + '"');

  /* ---------- WHICH SURFACE ----------------------------------------------------------------------- */
  const svgDiag = '<svg viewBox="0 0 340 200"><circle cx="20" cy="20" r="9"/></svg>';
  [[q('coord', { answerType: 'drawing' }, { figure: 'coordinate-grid' }), 'coord'],
   [q('none', { answerType: 'annotate' }), 'blank'],
   [q('hist', { answerType: 'drawing' }, { figure: 'histogram-grid' }), 'grid'],
   [q('iso', { answerType: 'drawing' }, { figure: 'isometric-dots' }), 'blank'],
   [q('said', { answerType: 'calculation', surface: 'grid' }), 'grid'],
   [q('word', { answerType: 'calculation' }, { figure: 'grid-blank' }), '']
  ].forEach(([x, want]) => {
    const got = w.padSurface_(x);
    if (got !== want) bad.push(x.row.row_id + ' gets surface "' + got + '", wanted "' + want + '"');
  });
  const coordP = el(w.questionFigCard_(q('coord2', { answerType: 'drawing' }, { figure: 'coordinate-grid' })));
  if (!coordP.querySelector('svg.qsurf.is-coord line.axis') || pageHead(coordP) !== 'Axes') bad.push('a coordinate-grid question is not given axes on a grid, tagged Axes');
  const own = q('own', { answerType: 'drawing', diagram: svgDiag });
  if (!w.padSource_(own) || w.padSource_(own).from !== 'part' || el(w.questionFigCard_(own)).querySelector('svg.qsurf')) bad.push('a drawing question with its own picture had it replaced by a surface');
  const stemmed = q('stem', { answerType: 'drawing', stems: [{ id: 'S-SURF', html: '<p>Here is a grid.</p>', diagram: svgDiag }] });
  if (!w.padSource_(stemmed) || w.padSource_(stemmed).from === 'surface') bad.push('a drawing question under a stem\'s picture had it replaced by a surface');
  if (w.padSource_(q('plain', { answerType: 'calculation' }))) bad.push('a calculation with no surface named was given something to draw on');

  /* ---------- THE PASSAGE: RING A WORD BY TAPPING IT ------------------------------------------------ */
  const PASS = '<p>The crumbling castle stood high on the rocky hill. Don&rsquo;t forget the glorious views.</p>';
  const text = q('text', { answerType: 'annotate', surface: 'text', lead: '<p>LEADWORD sets the scene.</p>',
    html: '<p>Circle the three <b>adjectives</b> in the passage below.</p>' + PASS });
  const tk = 'pad:' + text.key + ':words';
  try { w.localStorage.removeItem(tk); } catch (e) {}
  if (JSON.stringify(w.pageParts_(text)) !== '[null]') bad.push('a passage question has pages ' + JSON.stringify(w.pageParts_(text)) + ' -- it needs no picture, the passage is the surface');
  const plain = el(w.questionCard_(Object.assign({}, text, { key: 'q:Q-SURF-text-plain', surface: '', answerType: 'short', row: row('Q-SURF-text-plain') })));
  const card = el(w.questionCard_(text));
  const host = card.querySelector('.qsheet-part.is-text[data-circ]');
  if (!host) bad.push('the passage is not drawn as a surface (.qsheet-part.is-text[data-circ])');
  else {
    if (host.getAttribute('data-circ') !== tk) bad.push('the rings are kept under ' + host.getAttribute('data-circ') + ', not beside the pen\'s marks at ' + tk);
    const words = [...host.querySelectorAll('.qw[data-do="qw-tap"]')].map(s => s.textContent);
    ['crumbling', 'castle', 'rocky', 'hill', 'Don’t', 'glorious', 'adjectives'].forEach(t => {
      if (words.indexOf(t) < 0) bad.push('"' + t + '" is not a word you can tap -- the words are ' + JSON.stringify(words.slice(0, 12)));
    });
    if (words.some(t => /[.,]/.test(t))) bad.push('a full stop or comma was taken into a word: ' + JSON.stringify(words.filter(t => /[.,]/.test(t))));
    if (card.querySelector('.qsheet-lead .qw')) bad.push('the lead\'s words were made tappable -- only the part\'s are the surface');
    const flat = n => n.querySelector('.qsheet-pb').textContent.replace(/\s+/g, ' ').trim();
    if (flat(card) !== flat(plain)) bad.push('the passage reads differently once it is a surface:\n            ' + flat(card) + '\n            ' + flat(plain));
    if (!/Tap a word/.test(card.textContent)) bad.push('the page does not say how to ring a word');
    const word = t => [...card.querySelectorAll('.qw')].find(s => s.textContent === t);
    const crumbling = word('crumbling');
    A['qw-tap'](crumbling);
    let stored = [];
    try { stored = JSON.parse(w.localStorage.getItem(tk) || '[]'); } catch (e) {}
    if (!crumbling.classList.contains('is-circled') || crumbling.getAttribute('aria-pressed') !== 'true') bad.push('a tap did not ring "crumbling"');
    if (stored.length !== 1 || stored[0] !== crumbling.getAttribute('data-w')) bad.push('the ring was not stored: ' + JSON.stringify(stored));
    A['qw-tap'](word('rocky'));
    const again = el(w.questionCard_(text));
    const lit = [...again.querySelectorAll('.qw.is-circled')].map(s => s.textContent).sort().join(',');
    if (lit !== 'crumbling,rocky') bad.push('a redrawn card rings [' + lit + '], wanted crumbling and rocky');
    A['qw-tap'](crumbling);
    if (crumbling.classList.contains('is-circled')) bad.push('a second tap did not take the ring off');
    const twin = [...again.querySelectorAll('.qw')].find(s => s.textContent === 'crumbling');
    if (twin && twin.classList.contains('is-circled')) bad.push('the ring came off one copy of the passage and stayed on the other');
  }
  try { w.localStorage.removeItem(tk); } catch (e) {}
  /* A WORD IS NAMED BY ITS BLOCK, so a pre page and the card agree on what to call it. */
  const named = w.circWords_('<p>One two</p>', 3, []);
  if (!/data-w="3\.0"[^>]*>One</.test(named) || !/data-w="3\.1"[^>]*>two</.test(named)) bad.push('words are not named by their block and place: ' + named);
  if (/qw/.test(w.circWords_('<svg><text>Axis</text></svg>', 0, []))) bad.push('words inside a drawing were made tappable');
  return bad;
});

/* ---------- A DRAWING IS THE PERSON'S WHO MADE IT, AS A TYPED ANSWER IS -------------------------------
   Found by the multi-part audit: the pen's marks and the ringed words were kept per PHONE
   (`pad:<question>`) while the answer box beside them was kept per person (`ansKey_`), so Ben, signing
   in after Ali on the same phone, found Ali's lines already on his grid. Through the app's own builders
   and handlers:
     * signed out the key is the phone's, `pad:<question>`, as it always was; signed in it carries who,
       `pad:u:<id>:<question>`, on the pad's `data-k` and the passage's `data-circ` -- the attributes
       every handler writes through
     * the phone's old marks MOVE to the first person signed in who opens them: drawn on their pad,
       stored under their key, and gone from the old one, so the next person opens a clean grid
     * never over marks somebody already has; the phone's marks wait for a person with none
     * a second person sees none of the first one's, and Undo on their pad takes only their own mark
     * the first person signed in again gets theirs back
     * ring for ring, the same for a passage */
check('a drawing and a ringed word are kept for whoever is signed in, and the phone\'s old ones move once to the first who opens them', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const t = w.__t;
  const A = t.ACTIONS;
  const bad = [];
  if (typeof w.questionFigCard_ !== 'function' || typeof w.questionCard_ !== 'function' || !t.padKey || !A['pad-undo'] || !A['qw-tap']) {
    return ['questionFigCard_, questionCard_, padKey_ or the pen\'s handlers are not reachable — renamed? Whose drawing it is was NOT checked'];
  }
  const LS = w.localStorage;
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; d.body.appendChild(h); return h; };
  const row = id => ({ row_id: id, paper_id: 'P-WHO', subject: 'Maths', name: 'Whose' });
  const x = { kind: 'question', name: 'Q8c', qNumber: '8', qPart: 'c', marks: 2, key: 'q:Q-WHO-8c', row: row('Q-WHO-8c'),
              stems: [], answerType: 'drawing', html: '<p>Draw the graph of y = 2x.</p>' };
  const OLD = 'pad:q:Q-WHO-8c';
  const ALI = { name: 'Ali', personId: 'P21', role: 'student', roles: ['student'] };
  const BEN = { name: 'Ben', personId: 'P22', role: 'student', roles: ['student'] };
  const CY = { name: 'Cy', personId: 'P23', role: 'student', roles: ['student'] };
  const got = k => { try { return JSON.parse(LS.getItem(k) || '[]'); } catch (e) { return ['unreadable']; } };
  const pad = () => el(w.questionFigCard_(x)).querySelector('.qpad');
  const lines = p => (p ? p.querySelectorAll('.qpad-g path').length : -1);

  /* SIGNED OUT: THE PHONE'S KEY, AND A LINE LEFT ON IT FROM BEFORE TODAY. */
  t.USER(null);
  if (t.padKey(x) !== OLD) bad.push('signed out, the marks are kept under ' + t.padKey(x) + ', not the phone\'s ' + OLD);
  LS.setItem(OLD, JSON.stringify([[10, 10, 100, 100]]));
  /* ALI OPENS IT FIRST, AND THE LINE BECOMES HERS. */
  t.USER(ALI);
  const kA = t.padKey(x);
  if (kA !== 'pad:u:P21:q:Q-WHO-8c') bad.push('signed in, the marks are kept under ' + kA + ', not under who is signed in');
  const pa = pad();
  if (!pa) return bad.concat(['a drawing question drew no pad']);
  if (pa.getAttribute('data-k') !== kA) bad.push('Ali\'s pad writes to ' + pa.getAttribute('data-k') + ', not to her key ' + kA);
  if (lines(pa) !== 1) bad.push('the phone\'s old line is not on the pad of the first person who opened it (' + lines(pa) + ' lines)');
  if (got(kA).length !== 1) bad.push('the phone\'s old line was not stored under Ali\'s key: ' + JSON.stringify(got(kA)));
  if (LS.getItem(OLD) !== null) bad.push('the phone\'s old line was COPIED to Ali, not moved — the next person would see it too');
  LS.setItem(kA, JSON.stringify([[10, 10, 100, 100], [20, 20, 200, 200]]));
  /* BEN, SAME PHONE: A CLEAN GRID, AND HIS UNDO IS HIS. */
  t.USER(BEN);
  const kB = t.padKey(x);
  const pb = pad();
  if (lines(pb) !== 0) bad.push('Ben, signed in after Ali on the same phone, sees ' + lines(pb) + ' of her lines');
  if (pb.getAttribute('data-k') !== kB || kB === kA) bad.push('Ben\'s pad writes to ' + pb.getAttribute('data-k') + ' — Ali\'s key is ' + kA);
  LS.setItem(kB, JSON.stringify([[5, 5, 50, 50]]));
  const pb2 = pad();
  A['pad-undo'](pb2.querySelector('.qpad-undo'));
  if (got(kB).length !== 0) bad.push('Undo on Ben\'s pad did not take Ben\'s mark: ' + JSON.stringify(got(kB)));
  if (got(kA).length !== 2) bad.push('Undo on Ben\'s pad touched Ali\'s marks: ' + JSON.stringify(got(kA)));
  /* THE PHONE DRAWS AGAIN SIGNED OUT; ALI ALREADY HAS MARKS, SO THEY WAIT FOR SOMEBODY WITH NONE. */
  t.USER(null);
  LS.setItem(OLD, JSON.stringify([[1, 1, 2, 2]]));
  t.USER(ALI);
  const pa2 = pad();
  if (lines(pa2) !== 2 || got(kA).length !== 2) bad.push('the phone\'s marks were moved over marks Ali already had: ' + JSON.stringify(got(kA)));
  if (LS.getItem(OLD) === null) bad.push('the phone\'s marks vanished when the person who opened them already had some');
  t.USER(CY);
  if (lines(pad()) !== 1 || LS.getItem(OLD) !== null) bad.push('the phone\'s marks did not move to the next person with none');
  /* ALI AGAIN: HERS, AND ONLY HERS. */
  t.USER(ALI);
  if (lines(pad()) !== 2) bad.push('Ali, signed in again, does not get her two lines back (' + lines(pad()) + ')');

  /* ---------- AND A PASSAGE'S RINGS, THE SAME WAY ----------------------------------------------------- */
  const text = { kind: 'question', name: 'Q9', qNumber: '9', marks: 1, key: 'q:Q-WHO-9', row: row('Q-WHO-9'), stems: [],
                 answerType: 'annotate', surface: 'text', html: '<p>Circle the adjective.</p><p>The tall tree swayed.</p>' };
  const OLDW = 'pad:q:Q-WHO-9:words';
  t.USER(null);
  const tall = (() => { const h = el(w.questionCard_(text)).querySelector('[data-circ]'); return [...h.querySelectorAll('.qw')].find(s => s.textContent === 'tall').getAttribute('data-w'); })();
  LS.setItem(OLDW, JSON.stringify([tall]));
  t.USER(ALI);
  const hostA = el(w.questionCard_(text)).querySelector('[data-circ]');
  const kAw = 'pad:u:P21:q:Q-WHO-9:words';
  if (!hostA || hostA.getAttribute('data-circ') !== kAw) bad.push('Ali\'s rings are kept under ' + (hostA && hostA.getAttribute('data-circ')) + ', not ' + kAw);
  else {
    const lit = [...hostA.querySelectorAll('.qw.is-circled')].map(s => s.textContent).join(',');
    if (lit !== 'tall') bad.push('the phone\'s old ring did not come to the first person who opened the passage: [' + lit + ']');
    if (LS.getItem(OLDW) !== null) bad.push('the phone\'s old ring was copied, not moved');
  }
  t.USER(BEN);
  const hostB = el(w.questionCard_(text)).querySelector('[data-circ]');
  if (hostB.querySelectorAll('.qw.is-circled').length) bad.push('Ben sees Ali\'s ringed word');
  A['qw-tap']([...hostB.querySelectorAll('.qw')].find(s => s.textContent === 'tree'));
  if (got('pad:u:P22:q:Q-WHO-9:words').length !== 1) bad.push('Ben\'s ring was not stored under his own key');
  if (JSON.stringify(got(kAw)) !== JSON.stringify([tall])) bad.push('Ben\'s tap changed Ali\'s rings: ' + JSON.stringify(got(kAw)));
  t.USER(null);
  [OLD, kA, kB, 'pad:u:P23:q:Q-WHO-8c', OLDW, kAw, 'pad:u:P22:q:Q-WHO-9:words'].forEach(k => { try { LS.removeItem(k); } catch (e) {} });
  return bad;
});

/* ---------- "USE YOUR GRAPH" SHOWS YOUR GRAPH -----------------------------------------------------------
   Found by the multi-part audit, finding 5: June 2024 2F Q24(c) "Use your graph to find estimates..."
   had no picture, and the graph was the child's own, on (b)'s grid, two swipes back. A part's `uses`
   names the earlier part whose drawing it needs (tools/set-uses.py). Through the app's own builders and
   handlers, with the library stood in by `stuffItemsAll_` as the tapped-answer journey does:
     * a part with no picture gets a page IN FRONT of its words, after its opening: the earlier part's
       picture, headed with that picture's own name and no question number, the marks on it, no pen, no
       control, no box -- and a line naming the part the marks came from
     * whoever is signed in: another person sees their own (none), and is told so
     * not when the page in front is already that picture (the earlier part with no answer page)
     * on Saved too (`cardPages_`), and "To the answer" still turns one page from the card
     * a part whose own figure IS that picture gets the marks UNDER its own pen instead -- no page --
       and its Undo takes its own mark and never the earlier one; a part that only LOOKS at that picture
       gets them on its copy, with no pen
     * a chain on one picture is one picture: (d) uses (c) uses (b) uses (a) shows all three's marks
     * a loop ends, and a part naming no such part draws exactly what it did
     * found in review, after the Figure tile and the "not drawn yet" page met this: the Figure tile on
       (c) shows (b)'s picture WITH this person's marks, not (b)'s empty grid; a part that uses a drawing
       on a surface ("Use the graph" after (a) drew on axes) is never also "not drawn yet"; and the page
       in front is headed as the child's ("Your drawing"), not "Figure" */
check('a part that uses an earlier part\'s drawing shows it, read only, in front of it or under its own pen', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const t = w.__t;
  const A = t.ACTIONS;
  const bad = [];
  const need = ['pageParts_', 'stuffPart_', 'questionFigCard_', 'cardPages_', 'usesOf_', 'questionUsesCard_', 'figsBefore_', 'figMissing_'].filter(n => typeof w[n] !== 'function');
  if (need.length || !t.padKey || !A['pad-undo']) return [(need.join(', ') || 'padKey_ / pad-undo') + ' not reachable — renamed? "Use your graph" was NOT checked'];
  const LS = w.localStorage;
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; d.body.appendChild(h); return h; };
  const row = id => ({ row_id: id, paper_id: 'P-USE', subject: 'Maths', name: 'Uses' });
  const GRID = '<svg viewBox="0 0 340 340"><line class="grid" x1="10" y1="10" x2="330" y2="10"/></svg>';
  const SCALE = '<svg viewBox="0 0 340 80"><line class="axis" x1="10" y1="40" x2="330" y2="40"/></svg>';
  const part = (q, p, extra) => Object.assign({ kind: 'question', name: 'Q' + q + p, qNumber: String(q), qPart: p, marks: 2,
    key: 'q:Q-USE-' + q + p, row: row('Q-USE-' + q + p), stems: [], html: '<p>Part ' + p + '.</p>' }, extra || {});
  const stem = { id: 'S-USE-24', html: '<p>Here is a table of values.</p>' };
  const b = part(24, 'b', { answerType: 'annotate', diagram: GRID, html: '<p>On the grid, draw the graph of y = x&sup2; &minus; x.</p>', answer: '<b>a curve</b>', stems: [stem] });
  const c = part(24, 'c', { uses: 'b', html: '<p>Use your graph to find estimates for the solutions of x&sup2; &minus; x = 4.</p>', answer: '<b>&minus;1.6, 2.6</b>', stems: [stem] });
  const cAlone = part(24, 'z', { uses: 'q', html: '<p>Names a part that is not there.</p>' });
  const i6 = part(6, '(i)', { answerType: 'annotate', diagram: SCALE, answer: '<b>&frac12;</b>' });
  const ii6 = part(6, '(ii)', { answerType: 'annotate', diagram: SCALE, uses: 'i', answer: '<b>0</b>' });
  const f3 = part(1, '3', { answerType: 'drawing', diagram: GRID, html: '<p>Complete Figure 2.</p>' });
  const f4 = part(1, '4', { answerType: 'explain', diagram: GRID, uses: '3', html: '<p>How does Figure 2 show it?</p>' });
  const sa = part(3, 'a', { answerType: 'drawing', diagram: SCALE });
  const sb = part(3, 'b', { answerType: 'drawing', diagram: SCALE, uses: 'a' });
  const sc = part(3, 'c', { answerType: 'drawing', diagram: SCALE, uses: 'b' });
  const sd = part(3, 'd', { uses: 'c', answer: '<b>8 &deg;C</b>' });
  const l1 = part(4, 'a', { answerType: 'drawing', diagram: GRID, uses: 'b' });
  const l2 = part(4, 'b', { answerType: 'drawing', diagram: GRID, uses: 'a' });
  const ax = part(25, 'a', { answerType: 'drawing', surface: 'coord', html: '<p>On the axes, draw the graph of y = 2x.</p>' });
  const axUse = part(25, 'b', { uses: 'a', html: '<p>Use the graph to find x when y = 6.</p>', answer: '<b>3</b>' });
  const LIB = [b, c, cAlone, i6, ii6, f3, f4, sa, sb, sc, sd, l1, l2, ax, axUse];
  const held = w.stuffItemsAll_, heldItems = w.stuffItems;
  w.stuffItemsAll_ = () => LIB;
  /* AND `stuffItems`, which `questionParts_` reads -- the Figure tile and "not drawn yet" ask it for a
     part's question. */
  w.stuffItems = () => LIB;
  const put = (x, marks) => LS.setItem(t.padKey(x), JSON.stringify(marks));
  const ALI = { name: 'Ali', personId: 'P31', role: 'student', roles: ['student'] };
  const BEN = { name: 'Ben', personId: 'P32', role: 'student', roles: ['student'] };
  const paths = (root, sel) => (root ? root.querySelectorAll(sel + ' path').length : -1);
  try {
    t.USER(ALI);
    put(b, [[20, 300, 100, 120, 170, 60], [200, 60, 320, 300]]);
    /* ---------- THE PAGE IN FRONT ---------------------------------------------------------------------- */
    const pc = w.pageParts_(c);
    if (JSON.stringify(pc) !== '["stem0","use",null,"ans"]') bad.push('(c) alone has pages ' + JSON.stringify(pc) + ', wanted its opening, then the graph, then its words, then its answer');
    if (w.pageParts_(c, b).indexOf('use') < 0) bad.push('after (b) and (b)\'s answer page, (c) has no page with the graph');
    const bNoAns = Object.assign({}, b, { answer: '' });
    if (w.pageParts_(c, bNoAns).indexOf('use') >= 0) bad.push('straight after (b)\'s own figure page, (c) draws the same picture again');
    const page = el(w.stuffPart_(c, 'use')).querySelector('.qcard');
    if (!page) bad.push('the "use" page draws nothing');
    else {
      if (!page.classList.contains('qfig') || page.getAttribute('data-of') !== 'Q-USE-24c' || page.getAttribute('data-uses') !== 'Q-USE-24b') bad.push('the "use" page is not (c)\'s figure page naming (b) as where its marks came from: ' + page.outerHTML.slice(0, 120));
      const head = tagText(page, 'kind');
      if (head !== 'Your drawing' || tagText(page, 'number')) bad.push('the "use" page is headed "' + pageHead(page) + '", wanted "Your drawing" and no question number');
      if (paths(page, '.qpad-was') !== 2) bad.push('the "use" page shows ' + paths(page, '.qpad-was') + ' of the two marks Ali made on (b)');
      if (!page.querySelector('.qpad-art > svg line.grid')) bad.push('the "use" page does not draw (b)\'s picture under the marks');
      if (page.querySelector('.qpad, [data-do], .tile, .qp-ans, .qpad-g')) bad.push('the "use" page can be drawn on, pressed or typed into — it is (b)\'s answer, read only');
      if (!/Your marks from Q24b/.test(page.textContent)) bad.push('the "use" page does not say whose marks these are: "' + page.textContent.replace(/\s+/g, ' ').trim().slice(-120) + '"');
    }
    const saved = w.cardPages_(c, 0);
    if (saved.length !== 4 || !/qfig-uses/.test(saved[1])) bad.push('on Saved, (c) is ' + saved.length + ' pages and the second is not the graph');
    const off = (() => { const p = w.pageParts_(c); return p.indexOf('ans') - p.indexOf(null); })();
    if (off !== 1) bad.push('"To the answer" on (c) would turn ' + off + ' pages, not one');
    /* ---------- THE FIGURE TILE ON (c) OPENS (b)'s PICTURE WITH THE GRAPH ON IT ---------------------- */
    const sheet = el((w.figsBefore_(c)[0] || {}).html || '');
    if (paths(sheet.querySelector('.qseen'), '.qpad-was') !== 2) bad.push('the Figure tile on (c) opens (b)\'s grid with ' + paths(sheet.querySelector('.qseen'), '.qpad-was') + ' of Ali\'s two marks — the graph it says to use is not there');
    if ((w.figsBefore_(c)[0] || {}).label !== 'Your drawing') bad.push('the Figure tile on (c) is titled "' + (w.figsBefore_(c)[0] || {}).label + '" over the child\'s own graph, wanted "Your drawing"');
    if (!/yours from Q24b/.test(sheet.textContent)) bad.push('the Figure tile on (c) does not say the marks are (b)\'s');
    if (sheet.querySelector('.qpad')) bad.push('the Figure tile on (c) gives a pen to (b)\'s answer');
    /* ---------- "USE THE GRAPH" AFTER A SURFACE IS NEVER "NOT DRAWN YET" ------------------------------- */
    if (w.figMissing_(Object.assign({}, axUse, { uses: '' })) !== true) bad.push('control: without its `uses`, Q25b "Use the graph" is not "not drawn yet" — the case below proves nothing');
    if (w.figMissing_(axUse)) bad.push('Q25b, which uses (a)\'s graph, is also "the paper prints a figure here — not drawn yet"');
    const pAx = w.pageParts_(axUse);
    if (pAx.indexOf('nofig') >= 0 || pAx.indexOf('use') < 0) bad.push('Q25b has pages ' + JSON.stringify(pAx) + ', wanted its graph and no "not drawn yet"');
    t.USER(BEN);
    if (el((w.figsBefore_(c)[0] || {}).html || '').querySelector('.qseen, .qpad-was') ) bad.push('Ben\'s Figure tile on (c) shows Ali\'s graph');
    const benPage = el(w.stuffPart_(c, 'use')).querySelector('.qcard');
    if (paths(benPage, '.qpad-was') !== 0) bad.push('Ben\'s (c) shows Ali\'s graph');
    if (!/Nothing drawn on Q24b yet/.test(benPage.textContent)) bad.push('with nothing drawn on (b), the "use" page does not say so');
    t.USER(ALI);
    /* ---------- ONE PICTURE, DRAWN ON TWICE: UNDER THE PEN ---------------------------------------------- */
    put(i6, [[170, 40, 170, 40]]);
    put(ii6, [[10, 40, 10, 40]]);
    if (w.pageParts_(ii6).indexOf('use') >= 0) bad.push('(ii), whose own figure is (i)\'s picture, also got a page in front');
    const padII = el(w.questionFigCard_(ii6)).querySelector('.qpad');
    if (paths(padII, '.qpad-was') !== 1) bad.push('(ii)\'s scale does not carry (i)\'s cross (' + paths(padII, '.qpad-was') + ')');
    if (paths(padII, '.qpad-g') !== 1) bad.push('(ii)\'s own marks are ' + paths(padII, '.qpad-g') + ', wanted its one cross');
    if (!/fainter marks are yours from Q6\(i\)/.test(padII.textContent)) bad.push('(ii)\'s pad does not say the fainter cross is (i)\'s — an Undo that will not take it would look broken');
    A['pad-undo'](padII.querySelector('.qpad-undo'));
    if (paths(padII, '.qpad-was') !== 1 || paths(padII, '.qpad-g') !== 0) bad.push('Undo on (ii) did not take (ii)\'s cross alone: ' + paths(padII, '.qpad-was') + ' of (i)\'s left, ' + paths(padII, '.qpad-g') + ' of its own');
    if (JSON.parse(LS.getItem(t.padKey(i6)) || '[]').length !== 1) bad.push('Undo on (ii) changed what (i) stored');
    if (paths(el(w.questionFigCard_(i6)).querySelector('.qpad'), '.qpad-was') !== 0) bad.push('(i) shows marks from a part that comes after it');
    LS.removeItem(t.padKey(i6));
    if (/fainter marks/.test(el(w.questionFigCard_(ii6)).textContent)) bad.push('with nothing on (i), (ii) still says the fainter marks are (i)\'s');
    /* ---------- ONE PICTURE, LOOKED AT: ON ITS COPY, NO PEN --------------------------------------------- */
    put(f3, [[20, 20, 300, 300]]);
    const fig4 = el(w.questionFigCard_(f4));
    if (paths(fig4.querySelector('.qseen'), '.qpad-was') !== 1 || fig4.querySelector('.qpad')) bad.push('(4), which only looks at Figure 2, does not show (3)\'s line on it read only');
    if (!/yours from Q13/.test(fig4.textContent)) bad.push('(4)\'s figure does not say the line on it is (3)\'s');
    LS.removeItem(t.padKey(f3));
    if (el(w.questionFigCard_(f4)).querySelector('.qseen') || !el(w.questionFigCard_(f4)).querySelector('figure svg')) bad.push('with nothing drawn on (3), (4) is not its plain figure');
    /* ---------- A CHAIN ON ONE PICTURE ------------------------------------------------------------------ */
    put(sa, [[10, 10, 10, 10], [20, 20, 20, 20]]);
    put(sb, [[5, 70, 330, 10]]);
    put(sc, [[40, 40, 40, 40]]);
    if (paths(el(w.questionFigCard_(sb)).querySelector('.qpad'), '.qpad-was') !== 2) bad.push('(b)\'s scatter does not carry (a)\'s points under its pen');
    if (paths(el(w.questionFigCard_(sc)).querySelector('.qpad'), '.qpad-was') !== 3) bad.push('(c)\'s scatter does not carry (a)\'s points and (b)\'s line under its pen');
    if (paths(el(w.stuffPart_(sd, 'use')).querySelector('.qseen'), '.qpad-was') !== 4) bad.push('(d)\'s page does not carry (a)\'s, (b)\'s and (c)\'s marks together');
    /* ---------- A LOOP, AND A PART THAT IS NOT THERE ---------------------------------------------------- */
    put(l1, [[1, 1, 2, 2]]); put(l2, [[3, 3, 4, 4]]);
    const loop = el(w.questionFigCard_(l1)).querySelector('.qpad');
    if (paths(loop, '.qpad-was') !== 1) bad.push('two parts naming each other drew ' + paths(loop, '.qpad-was') + ' earlier marks, wanted the other one\'s and no more');
    if (JSON.stringify(w.pageParts_(cAlone)) !== '[null]') bad.push('a part naming a part that is not there has pages ' + JSON.stringify(w.pageParts_(cAlone)));
  } catch (e) {
    bad.push('threw: ' + e.message);
  } finally {
    w.stuffItemsAll_ = held;
    w.stuffItems = heldItems;
    [ALI, BEN].forEach(u => { t.USER(u); LIB.forEach(x => { try { LS.removeItem(t.padKey(x)); } catch (e) {} }); });
    t.USER(null);
  }
  return bad;
});

/* ---------- FIND DRAWS THE SAME THING FOR A TUTOR, AN ADMIN, A STUDENT AND SOMEBODY SIGNED OUT --------
   ASKED FOR AS *"No distinction between tutor and student on the finder. All the same. Remove any
   nuances about that."* -- and before it, of the answer: *"Should behave the same whether it's a tutor
   or child. No difference between the two."* The differences that were there (an answer page open for
   staff, a tile reading "The answer" for them, a gold Spotlight tile for an admin on every question and
   practical) each looked deliberate where it was written, which is why the rule is asked of the whole
   family at once rather than of each in turn.

   EVERY PAGE OF A QUESTION FAMILY, drawn by the app's own builders for four visitors -- signed out, a
   student, a tutor, an admin -- and compared as markup: a stem with words both sides of its figure, a
   part with a lead, a figure and a box, its answer page hidden and then shown, a tapped question, a
   worded one with Mark with AI under it, a drawing question on a squared grid, a passage to ring words
   in; and a real practical, project and textbook through the real mapper.

   WHAT IS ALLOWED TO DIFFER IS WHAT IS A PERSON'S, NOT A ROLE'S, and it is taken out before comparing:
   the answer box's key and the done date's (`ans:u:<id>:`, whose drawer this is), the name over the box
   ("Ada's answer" / "Your answer"), and the star (`fav`) and the date's slot beside it (`.qcard-done`,
   see `questionTiles_`), which need somebody signed in to keep them for.
   Anything else that differs is a role showing through, and the first difference is printed. */
check('Find draws the same question family, practical, project and textbook for a tutor, an admin, a student and nobody', async () => {
  const read = n => JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8'));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the real kinds were NOT checked — not a pass'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
    { practicals: read('practicals'), projects: read('projects'), textbooks: read('textbooks') })));
  const p = payload();
  Object.assign(p, { practicals: made.practicals || [], projects: made.projects || [], textbooks: made.textbooks || [],
                     features: (p.features || []).concat(['aiMark']), aiMarking: true });
  const { w } = boot({ payload: p });
  await wait(300);
  const t = w.__t;
  const bad = [];
  const need = ['pageParts_', 'stuffPart_', 'stuffCard', 'questionAnsCard_', 'ansShow_', 'stuffItems'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The sameness was NOT checked'];
  const svg = '<svg viewBox="0 0 340 200"><circle cx="20" cy="20" r="9"/></svg>';
  const row = id => ({ row_id: id, paper_id: 'P-SAME', subject: 'Maths', name: 'Paper 1: Foundation — June 2024' });
  const stem = { id: 'S-SAME', html: '<p>The diagram shows a triangle.</p><!--fig--><p>AB = 7 cm.</p>', diagram: svg };
  const fam = [
    { kind: 'question', name: 'Q9(a)', qNumber: '9', qPart: 'a', marks: 2, key: 'q:Q-SAME-9a', row: row('Q-SAME-9a'), stems: [stem],
      lead: '<p>Here is a second triangle.</p>', diagram: svg, html: '<p>Work out PR.</p>', answer: '<b>5 cm</b> &mdash; by Pythagoras', accept: '5' },
    { kind: 'question', name: 'Q9(b)', qNumber: '9', qPart: 'b', marks: 1, key: 'q:Q-SAME-9b', row: row('Q-SAME-9b'), stems: [stem],
      html: '<p>Which is right?</p>', choices: ['3', '4'], choiceRight: [2], answer: '<b>4</b>' },
    { kind: 'question', name: 'Q10', qNumber: '10', marks: 3, key: 'q:Q-SAME-10', row: row('Q-SAME-10'), stems: [],
      answerType: 'explain', html: '<p>Explain why the angles add to 180°.</p>', answer: '<b>Angles on a line</b> &mdash; they make a half turn' },
    { kind: 'question', name: 'Q11', qNumber: '11', marks: 2, key: 'q:Q-SAME-11', row: Object.assign(row('Q-SAME-11'), { figure: 'grid-blank' }),
      stems: [], answerType: 'drawing', html: '<p>Draw the graph of y = 2x + 1.</p>', answer: '<b>A straight line</b>' },
    { kind: 'question', name: 'Q12', qNumber: '12', marks: 1, key: 'q:Q-SAME-12', row: row('Q-SAME-12'), stems: [],
      answerType: 'annotate', surface: 'text', html: '<p>Circle the adjective.</p><p>The tall tree swayed.</p>', answer: '<b>tall</b>' },
  ];
  const real = ['practical', 'project', 'textbook'].map(k => w.stuffItems().find(x => x.kind === k));
  real.forEach((x, i) => { if (!x) bad.push('no ' + ['practical', 'project', 'textbook'][i] + ' reached Find, so it was NOT compared'); });
  const items = fam.concat(real.filter(Boolean));
  /* A PERSON'S, NOT A ROLE'S -- see the note above. */
  const norm = html => {
    const h = w.document.createElement('div');
    h.innerHTML = html;
    h.querySelectorAll('[data-do="fav"], .tile-row .qcard-done').forEach(n => n.remove());
    /* A ROW THAT HELD ONLY THE STAR (and the date beside it) is the person's, and goes with them. */
    h.querySelectorAll('.tile-row').forEach(n => { if (!n.children.length) n.remove(); });
    return h.innerHTML.replace(/u:[A-Za-z0-9_-]+:/g, '').replace(/>[^<>]*(?:’|&rsquo;)s answer/g, '>WHO answer')
      .replace(/>Your answer/g, '>WHO answer');
  };
  const draw = () => {
    const out = [];
    items.forEach((x, i) => w.pageParts_(x, i ? items[i - 1] : null).forEach(part => {
      out.push({ at: (x.row && x.row.row_id || x.key) + '#' + (part || 'card'),
                 html: norm(part ? w.stuffPart_(x, part) : w.stuffCard(x, 0)) });
    }));
    /* AND EVERY ANSWER, SHOWN -- by this visitor's own tap, which is the one way any of them opens. */
    fam.forEach(x => { w.ansShow_(x); out.push({ at: x.row.row_id + '#ans-shown', html: norm(w.questionAnsCard_(x)) }); });
    return out;
  };
  const who = [
    ['signed out', null],
    ['a student', { name: 'Sam Student', personId: 'P003', role: 'student', roles: ['student'] }],
    ['a tutor', { name: 'Ada Tutor', personId: 'P002', role: 'tutor', roles: ['tutor'] }],
    ['an admin', { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'] }],
  ];
  const seen = who.map(([what, u]) => { t.USER(u); return { what, pages: draw() }; });
  t.USER(null);
  if (!(seen[2].pages.length && t.isTutorRole)) bad.push('could not draw for a tutor, so the sameness was NOT checked');
  const base = seen[0];
  if (base.pages.length < 15) bad.push('only ' + base.pages.length + ' pages were drawn -- the family did not come out whole');
  seen.slice(1).forEach(s => {
    if (s.pages.length !== base.pages.length) { bad.push(s.what + ' is drawn ' + s.pages.length + ' pages, signed out ' + base.pages.length); return; }
    const diffs = s.pages.filter((pg, i) => pg.html !== base.pages[i].html);
    if (diffs.length) {
      const pg = diffs[0], other = base.pages[s.pages.indexOf(pg)].html;
      let k = 0; while (k < pg.html.length && pg.html[k] === other[k]) k++;
      bad.push(s.what + ' sees ' + diffs.length + ' page(s) differently from somebody signed out, first ' + pg.at + ':\n'
        + '            ' + s.what + ': …' + pg.html.slice(Math.max(0, k - 60), k + 100).replace(/\s+/g, ' ') + '\n'
        + '            signed out: …' + other.slice(Math.max(0, k - 60), k + 100).replace(/\s+/g, ' '));
    }
  });
  /* AND THE SAME ITEMS: nothing on the learning surface is offered to one role and not another —
     BUT ONE, BY NAME. *"i want to add the bible to resources as a book. but only admin can see the
     bible."* is the owner asking for exactly one difference, so this expects it exactly: an admin's
     list is everybody else's plus `bible:kjv`, and nobody else's has it. Anything else that differs
     is still a role showing through. ONE PAYLOAD FOR EVERY ROLE HERE, deliberately: the films are an
     admin's too, but `doGet` decides that by leaving them out of everybody else's payload, so with
     the payload held still the only difference left is one the phone made — which is what this asks. */
  const BIBLE_KEY = 'bible:kjv';
  const offered = u => { t.USER(u); const ks = w.stuffItems().filter(x => w.kindOf_(x).group === 'Learning').map(x => x.key).sort(); t.USER(null); return ks; };
  const out0 = offered(null);
  if (out0.indexOf(BIBLE_KEY) >= 0) bad.push('somebody signed out is offered the Bible — it is for admins only');
  who.slice(1).forEach(([what, u]) => {
    const got = offered(u);
    const admin = u && u.role === 'admin';
    if (admin && got.indexOf(BIBLE_KEY) < 0) bad.push(what + ' is not offered the Bible, which the owner asked an admin to have');
    if (!admin && got.indexOf(BIBLE_KEY) >= 0) bad.push(what + ' is offered the Bible — it is for admins only');
    const rest = got.filter(k => k !== BIBLE_KEY).join('|');
    if (rest !== out0.filter(k => k !== BIBLE_KEY).join('|')) bad.push(what + ' is offered a different set of learning items from somebody signed out');
  });
  /* AND THE SPOTLIGHT WINDOW, WHICH IS NOT FIND, KEEPS THE ADMIN'S TILE on a learning item already in
     it -- or a question put there before this change could never be taken out (`SPOT_TILES`). */
  const prac = real[0];
  if (prac && typeof w.spotSet_ === 'function' && typeof w.spotPages === 'function') {
    t.USER(who[3][1]);
    w.spotSet_(prac.key, true);
    const win = (w.spotPages() || []).join('');
    if (!/data-do="spot"/.test(win)) bad.push('an admin looking at the Spotlight window has no tile to take a spotlit practical out of it');
    if (/data-do="spot"/.test(w.stuffCard(prac, 0))) bad.push('the same practical on Find carries the admin\'s Spotlight tile again');
    w.spotSet_(prac.key, false);
    t.USER(null);
  } else bad.push('spotSet_ or spotPages is not reachable, so the window\'s own tile was NOT checked');
  return bad;
});

/* ---------- EVERY CONTROL ON A QUESTION'S PAGES IS A TILE ------------------------------------------------
   ASKED FOR ONE AT A TIME AND THEN ALL AT ONCE: *"check button should be a tile."*, *"lock should be a
   tile too. same as undo and clear. it should all be tiles."* The house rule said a FORM has buttons,
   and the pen's bar, Check and Mark with AI were argued as a form's; the owner overruled it for this
   surface, so the rule is asked of the whole family at once rather than of whichever control somebody
   remembered.

   EVERY PAGE OF A QUESTION FAMILY, through the app's own builders, signed in so the star is drawn too:
   a stem with its figure, a part with a box and Check, a tapped question, a worded one with Mark with AI,
   a maths one on the keypad's box, a drawing question on a squared grid (pen off AND on -- the armed bar
   is drawn by a different branch), a pen question asking for a ruler and compasses, a passage to ring
   words in, and every answer page hidden and shown. Every `<button>`, every `[data-do]`, every
   `role="button"` and every link must be a `.tile` -- or one of the exceptions, each named where it is
   drawn with the reason:
     a multiple-choice option     the answer being given, with its own words and maths (`choiceBox_`)
     a key on the maths keypad    a keyboard (`kpKey_`) -- drawn on the body, listed for completeness
     a word in a passage          the answer being given, where the sentence put it (`circWords_`)
     the picture under the pen    the pen's second door while it is off (`padArm_`), not a control
     the answer box itself        a field, which is typed into rather than pressed
   And the tiles the owner named must actually be there, so a family that drew none cannot pass. */
check('every control on a question\'s pages is a tile, bar the options, the keys, the words and the box', async () => {
  const p = Object.assign(payload(), { aiMarking: true });
  p.features = (p.features || []).concat(['aiMark']);
  const { w } = boot({ payload: p });
  await wait(300);
  const t = w.__t, bad = [];
  const need = ['pageParts_', 'stuffPart_', 'stuffCard', 'questionAnsCard_', 'ansShow_', 'ansHide_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The tiles were NOT checked'];
  t.USER({ name: 'Sam Student', personId: 'P003', role: 'student', roles: ['student'], token: 'tok' });
  const svg = '<svg viewBox="0 0 340 200"><circle cx="20" cy="20" r="9"/></svg>';
  const row = id => ({ row_id: id, paper_id: 'P-TILES', subject: 'Maths', name: 'Paper 1: Foundation — June 2024' });
  const stem = { id: 'S-TILES', html: '<p>The diagram shows a triangle.</p>', diagram: svg };
  const fam = [
    { kind: 'question', name: 'Q4(a)', qNumber: '4', qPart: 'a', marks: 2, key: 'q:Q-TILES-4a', row: row('Q-TILES-4a'), stems: [stem],
      diagram: svg, html: '<p>Work out PR.</p>', answer: '<b>5 cm</b>', accept: 'five' },
    { kind: 'question', name: 'Q4(b)', qNumber: '4', qPart: 'b', marks: 1, key: 'q:Q-TILES-4b', row: row('Q-TILES-4b'), stems: [stem],
      html: '<p>Which is right?</p>', choices: ['3', '4'], choiceRight: [2], answer: '<b>4</b>' },
    { kind: 'question', name: 'Q5', qNumber: '5', marks: 3, key: 'q:Q-TILES-5', row: row('Q-TILES-5'), stems: [],
      answerType: 'explain', html: '<p>Explain why the angles add to 180°.</p>', answer: '<b>Angles on a line</b> &mdash; a half turn' },
    { kind: 'question', name: 'Q6', qNumber: '6', marks: 1, key: 'q:Q-TILES-6', row: row('Q-TILES-6'), stems: [],
      answerType: 'calculation', html: '<p>Work out 3/4 of 12.</p>', answer: '<b>9</b>', accept: '9' },
    { kind: 'question', name: 'Q7', qNumber: '7', marks: 2, key: 'q:Q-TILES-7', row: Object.assign(row('Q-TILES-7'), { figure: 'grid-blank' }),
      stems: [], answerType: 'drawing', html: '<p>Draw the graph of y = 2x + 1.</p>', answer: '<b>A straight line</b>' },
    { kind: 'question', name: 'Q8', qNumber: '8', marks: 2, key: 'q:Q-TILES-8', row: row('Q-TILES-8'), stems: [], needs: ['Ruler', 'Compass'],
      answerType: 'drawing', diagram: svg, html: '<p>Use a ruler and compasses to construct the perpendicular bisector of AB.</p>', answer: '<b>Arcs from A and B</b>' },
    { kind: 'question', name: 'Q9', qNumber: '9', marks: 1, key: 'q:Q-TILES-9', row: row('Q-TILES-9'), stems: [],
      answerType: 'annotate', surface: 'text', html: '<p>Circle the adjective.</p><p>The tall tree swayed.</p>', answer: '<b>tall</b>' },
  ];
  const pages = [];
  const drawAll = when => fam.forEach((x, i) => w.pageParts_(x, i ? fam[i - 1] : null).forEach(part => {
    pages.push({ at: x.row.row_id + '#' + (part || 'card') + when, html: part ? w.stuffPart_(x, part) : w.stuffCard(x, 0) });
  }));
  drawAll('');
  /* THE ARMED PEN, which `padWrap_` draws from `PAD_ON` by a different branch. */
  ['q:Q-TILES-7', 'q:Q-TILES-8'].forEach(k => {
    const x = fam.find(f => f.key === k);
    t.padOn(w.__t.padKey ? w.__t.padKey(x) : 'pad:' + k);
    pages.push({ at: x.row.row_id + '#fig, pen on', html: w.stuffPart_(x, 'fig') });
  });
  t.padOn('');
  /* AND EVERY ANSWER PAGE, SHOWN, then put back. */
  fam.forEach(x => { w.ansShow_(x); pages.push({ at: x.row.row_id + '#ans-shown', html: w.questionAnsCard_(x) }); w.ansHide_(x); });
  const EXEMPT = [
    ['button.qp-opt[data-do="qp-choose"]', 'a multiple-choice option'],
    ['button.kp-key[data-do="kp-key"]', 'a key on the maths keypad'],
    ['span.qw[data-do="qw-tap"]', 'a word in a passage to ring'],
    ['div.qpad-art[data-do="pad-draw"]', 'the picture under the pen, while it is off'],
    ['textarea.qp-ans-in[data-do="qp-ans"], input.qp-ans-in[data-do="qp-ans"]', 'the answer box'],
  ];
  const seen = {};
  const exempted = {};
  pages.forEach(pg => {
    const h = w.document.createElement('div');
    h.innerHTML = pg.html;
    h.querySelectorAll('button, [data-do], [role="button"], a[href]').forEach(el => {
      if (el.classList.contains('tile')) {
        const k = el.getAttribute('data-do') + (el.getAttribute('data-tool') ? ':' + el.getAttribute('data-tool') : '');
        seen[k] = (seen[k] || 0) + 1;
        return;
      }
      const ok = EXEMPT.find(([sel]) => el.matches(sel));
      if (ok) { exempted[ok[1]] = (exempted[ok[1]] || 0) + 1; return; }
      bad.push(pg.at + ' draws a control that is not a tile: <' + el.tagName.toLowerCase()
        + ' class="' + (el.getAttribute('class') || '') + '" data-do="' + (el.getAttribute('data-do') || '') + '">');
    });
  });
  /* THE ONES THE OWNER NAMED, which must be there for the rule above to mean anything. */
  [['qp-check', 'Check'], ['qp-ai', 'Mark with AI'], ['pad-draw', 'the pen\'s lock'], ['pad-undo', 'Undo'],
   ['pad-clear', 'Clear'], ['qa-go', 'To the answer'], ['qa-show', 'Show the answer'], ['qa-hide', 'Hide the answer'],
   ['pad-tool:pen', 'the Pen'], ['pad-tool:ruler', 'the Ruler'], ['pad-tool:compass', 'the Compass'],
   ['fav', 'the star']].forEach(([act, what]) => {
    if (!seen[act]) bad.push('no ' + what + ' tile (' + act + ') was drawn anywhere in the family, so the rule was NOT asked of it');
  });
  ['a multiple-choice option', 'a word in a passage to ring', 'the picture under the pen, while it is off', 'the answer box'].forEach(what => {
    if (!exempted[what]) bad.push('the family drew no ' + what + ', so its exception was NOT exercised');
  });
  t.USER(null);
  if (!bad.length) console.log('          ' + pages.length + ' pages; tiles: ' + Object.keys(seen).sort().map(k => k + ' ' + seen[k]).join(', '));
  return bad;
});

/* ---------- EVERY FACT ABOUT A PAGE OF A QUESTION IS A TAG, IN ONE ROW AT THE TOP ------------------------
   ASKED FOR AS *"why do the questions say non calculator but its not a tag? also the marks should also
   be a tag. also the question numbers should also be a tag. also answers should have the answer tags
   and questions have the question tag."* and *"why is ks2 sats one tag? it should be sats. if they want
   to specify key stage then it should be its own thing."* Through the app's own builders, on the five
   pages that make a question:
     * the tag row is the card's FIRST block, and nothing of the old head is left -- no gold header
       (`.qcard-top`), no subtitle (`.qcard-sub`), no `sat …` line, no orange `No calculator` line
     * the first tag says what the page is -- Question, Answer, the figure's name -- then the number,
       then the marks; the number and the marks only where they belong (no number on a figure, no
       marks on a figure or a stem), and nothing rather than "0 marks"
     * the calculator is ONE tag, `Non-calculator`, though the paper's name AND the cover's cell both
       say it -- and `Calculator allowed` on a calculator paper -- in the needs colour; the funnel's
       answer and chip say the same word
     * a KS2 SATs page says `SATs` and `KS2` as two tags, and nothing anywhere says `KS2 SATs` */
check('every fact about a page of a question is a tag in one row at the top: what it is, its number, its marks, SATs and KS2, the calculator once', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const t = w.__t;
  const need = ['questionCard_', 'questionAnsCard_', 'questionFigCard_', 'questionStemCard_', 'questionStemFigCard_', 'qTags_', 'chipShow_']
    .filter(n => typeof w[n] !== 'function');
  if (need.length || typeof t.facetBy !== 'function') return [need.concat(['facetBy']).join(', ') + ' not reachable — renamed? The tag row was NOT checked'];
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; return h; };
  const row = html => {
    const card = el(html).querySelector('.qcard');
    const r = card && card.querySelector('.qcard-tags');
    return { card, first: card && card.firstElementChild,
             tags: r ? [...r.querySelectorAll('.qtag')].map(s => ({ tag: s.getAttribute('data-tag') || '', text: s.textContent.trim() })) : [] };
  };
  const say = tags => tags.map(x => (x.tag || '-') + ':' + x.text).join(' | ');
  const svg = '<svg viewBox="0 0 10 10"><text>FIG</text></svg>';
  const gcse = { kind: 'question', name: 'Q4a', qNumber: '4', qPart: 'a', marks: 2, key: 'q-tags-4a',
    sub: 'Paper 1 (Non-Calculator) — November 2018', subject: 'Maths', level: 'GCSE', keystage: 'KS4',
    tier: 'Higher', examBoard: 'Edexcel', documentType: 'Past paper', needs: ['No calculator', 'Protractor'],
    row: { row_id: 'Q-TAGS-4a', paper_id: 'P-TAGS-1H', name: 'Paper 1 (Non-Calculator) — November 2018' },
    stems: [{ id: 'S-TAGS-4', html: '<p>A shape is drawn on a grid.</p>', diagram: svg }],
    html: '<p>Work out the size of angle x.</p>', diagram: svg, answer: '<b>40</b>', accept: '40' };
  const pages = {
    question: w.questionCard_(gcse), answer: w.questionAnsCard_(gcse), figure: w.questionFigCard_(gcse),
    stem: w.questionStemCard_(gcse, 0, 0), stemFigure: w.questionStemFigCard_(gcse, 0),
  };
  const want = {
    question: ['kind:Question', 'number:Q4a', 'marks:2 marks'], answer: ['kind:Answer', 'number:Q4a', 'marks:2 marks'],
    figure: ['kind:Figure'], stem: ['kind:Question', 'number:Q4'], stemFigure: ['kind:Figure'],
  };
  let paperFacts = null;
  Object.keys(pages).forEach(k => {
    const r = row(pages[k]);
    if (!r.card) return bad.push('the ' + k + ' page drew no card');
    if (!r.first || !r.first.classList.contains('qcard-tags')) bad.push('the ' + k + ' page\'s first block is ' + (r.first ? '.' + r.first.className : 'nothing') + ', not the tag row');
    ['.qcard-top', '.qcard-sub', '.qcard-needs', '.qcard-sat'].forEach(c => { if (r.card.querySelector(c)) bad.push('the ' + k + ' page still draws ' + c); });
    const head = r.tags.slice(0, want[k].length).map(x => x.tag + ':' + x.text);
    if (JSON.stringify(head) !== JSON.stringify(want[k])) bad.push('the ' + k + ' page\'s row starts ' + JSON.stringify(head) + ', wanted ' + JSON.stringify(want[k]));
    const rest = r.tags.slice(want[k].length);
    if (rest.some(x => ['kind', 'number', 'marks'].indexOf(x.tag) >= 0)) bad.push('the ' + k + ' page has a page tag past its head: ' + say(r.tags));
    /* THE PAPER'S FACTS ARE THE SAME ON EVERY PAGE OF IT. */
    const facts = say(rest);
    if (paperFacts === null) paperFacts = facts;
    else if (facts !== paperFacts) bad.push('the ' + k + ' page says the paper as ' + facts + ', the question page as ' + paperFacts);
    const calc = r.tags.filter(x => /calculator/i.test(x.text));
    if (calc.length !== 1 || calc[0].tag !== 'needs' || calc[0].text !== 'Non-calculator') bad.push('the ' + k + ' page says the calculator as ' + JSON.stringify(calc) + ' -- wanted ONE needs tag, Non-calculator');
    const seen = {};
    r.tags.forEach(x => { if (seen[x.text.toLowerCase()]) bad.push('the ' + k + ' page says "' + x.text + '" twice'); seen[x.text.toLowerCase()] = 1; });
  });
  if (paperFacts !== null) {
    ['level:GCSE', 'board:Edexcel', 'subject:Maths', 'tier:Higher', 'sitting:2018', 'sitting:November', 'paper:Paper 1', 'needs:Protractor']
      .forEach(f => { if (paperFacts.split(' | ').indexOf(f) < 0) bad.push('the paper\'s facts lack ' + f + ': ' + paperFacts); });
    if (/KS4/.test(paperFacts)) bad.push('a GCSE page says its key stage -- Key stage is asked inside SATs only: ' + paperFacts);
  }
  /* A CALCULATOR PAPER, AND A ROW WITH NO MARKS. */
  const calcQ = Object.assign({}, gcse, { key: 'q-tags-c', name: 'Q3', marks: '', sub: 'Paper 2 (Calculator) — June 2017', needs: ['Calculator'],
    row: Object.assign({}, gcse.row, { row_id: 'Q-TAGS-C', name: 'Paper 2 (Calculator) — June 2017' }), stems: [], diagram: '' });
  const c = row(w.questionCard_(calcQ));
  if (c.tags.filter(x => /calculator/i.test(x.text)).map(x => x.tag + ':' + x.text).join() !== 'needs:Calculator allowed') bad.push('a calculator paper says ' + say(c.tags.filter(x => /calculator/i.test(x.text))) + ', wanted one needs tag, Calculator allowed');
  if (c.tags.some(x => x.tag === 'marks' || /\b0 marks?\b/.test(x.text))) bad.push('a row with no marks has a marks tag: ' + say(c.tags));
  /* THE FUNNEL SAYS THE SAME WORD: the answer and the chip, through the facet's `showOf`. */
  const nf = t.facetBy('needs');
  const chip = w.chipShow_({ field: 'needs', value: 'No calculator' });
  if (!nf || !nf.showOf || nf.showOf('No calculator') !== 'Non-calculator' || chip !== 'Non-calculator') bad.push('the funnel says the calculator as "' + (nf && nf.showOf ? nf.showOf('No calculator') : '?') + '" / chip "' + chip + '", the card as Non-calculator');
  /* SATs, AND THE KEY STAGE BESIDE IT: a primary worksheet (a school year, a key-stage cell, no level)
     and an STA paper (`band_value: KS2 SATs`). */
  const sheet = { kind: 'question', name: 'Q1', qNumber: '1', key: 'q-tags-ws', sub: 'Adding Fractions', subject: 'Maths',
    bandType: 'year', bandValue: '5', keystage: 'KS2', documentType: 'Worksheet', company: '1stclassmaths',
    row: { row_id: 'Q-TAGS-WS', paper_id: 'P-TAGS-WS', name: 'Adding Fractions' }, stems: [], html: '<p>1/4 + 2/4</p>' };
  const sta = Object.assign({}, sheet, { key: 'q-tags-sta', bandType: 'stage', bandValue: 'KS2 SATs', documentType: 'Past paper',
    sub: 'Paper 1: Arithmetic — May 2024', examBoard: 'STA', marks: 1,
    row: { row_id: 'Q-TAGS-STA', paper_id: 'P-TAGS-STA', name: 'Paper 1: Arithmetic — May 2024' } });
  [['a SATs worksheet', sheet, ['kind:Question', 'number:Q1', 'level:SATs', 'level:KS2']],
   ['an STA paper', sta, ['kind:Question', 'number:Q1', 'marks:1 mark', 'level:SATs', 'level:KS2']]].forEach(([what, x, head]) => {
    const r = row(w.questionCard_(x));
    const got = r.tags.slice(0, head.length).map(y => y.tag + ':' + y.text);
    if (JSON.stringify(got) !== JSON.stringify(head)) bad.push(what + '\'s row starts ' + JSON.stringify(got) + ', wanted ' + JSON.stringify(head));
    if (r.tags.some(y => /KS\s*\d\s*SATs/i.test(y.text))) bad.push(what + ' still says the key stage inside the level: ' + say(r.tags));
    if (r.tags.some(y => y.tag === 'board')) bad.push(what + ' names a board beside SATs, which says who sets it: ' + say(r.tags));
  });
  return bad;
});

/* ---------- THE DAY A STUDENT DID A QUESTION, ON ITS CARD, FOR THEM ------------------------------------
   ASKED FOR AS *"when a student does do a question, it should record the date they did it."* Through
   the real handlers on a real card AND THE TILE ROW UNDER IT, where the date is now -- beside the star,
   because it is yours like the star is, and the header it sat in became tags (`questionTiles_`):
     * signed out, nothing is recorded and there is no slot -- the signed-out key is everybody, and a
       date on it is nobody's
     * signed in, a Check (right or not yet), a tap that chooses enough, and typing into a box that has
       no Check each write today under `done:<who>:<key>` and show `Done <d> <Mon>` in the tile row's slot
     * the slot is filled where it stands: the slot is the same node, the tag row untouched
     * it comes back when the card is drawn again, and is the signed-in person's only -- another
       student on the same phone sees a clean card
     * where `localStorage` throws (private mode), the date is held for the visit and still shown
     * a date from another year says the year */
check('a signed-in student\'s attempt is dated on the question card, for them alone, and nobody signed out is stamped', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const A = w.__t.ACTIONS;
  if (typeof w.doneText_ !== 'function' || typeof w.questionCard_ !== 'function' || !A['qp-check'] || !A['qp-choose']) {
    return ['doneText_, questionCard_ or the marking handlers are not reachable — renamed? The date was NOT checked'];
  }
  const now = new Date();
  const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const label = 'Done ' + now.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()];
  if (w.doneText_(today) !== label) bad.push('today reads "' + w.doneText_(today) + '", wanted "' + label + '"');
  if (w.doneText_('2001-10-04') !== 'Done 4 Oct 2001') bad.push('a date from another year reads "' + w.doneText_('2001-10-04') + '", wanted the year on it');
  if (w.doneText_('') !== '') bad.push('no date reads "' + w.doneText_('') + '", wanted nothing');
  const base = { kind: 'question', name: 'Q8', marks: 2,
    row: { row_id: 'Q-DONE-8', paper_id: 'P-DONE', subject: 'Maths', name: 'Done' },
    html: '<p>Work out 3 &times; 5</p>', answer: '<b>15</b>', accept: '15' };
  const typed = Object.assign({}, base, { key: 'q-done-typed' });
  /* THE CARD AND ITS TILE ROW, as `stuffCard` puts them -- the date is in the row. */
  const draw = x => { const h = d.createElement('div'); h.innerHTML = w.questionCard_(x, 0) + '<div class="tile-row">' + w.questionTiles_(x) + '</div>'; d.body.appendChild(h); return h.querySelector('.qcard'); };
  const slot = card => card.parentNode.querySelector('.tile-row .qcard-done');
  const stored = () => Object.keys(w.localStorage).filter(k => /^done:/.test(k));
  const markIt = card => {
    const inp = card.querySelector('.qp-ans-in');
    /* NO input EVENT: typing stamps the card too, so this asks the Check alone. */
    inp.value = '16';
    A['qp-check'](card.querySelector('.qp-check'));
  };
  /* SIGNED OUT. */
  w.__t.USER(null);
  const out = draw(typed);
  if (slot(out)) bad.push('signed out, the tile row has a date slot -- there is nothing it could ever say');
  if (out.querySelector('.qcard-done')) bad.push('the date slot is inside the card, not in the tile row beside the star');
  markIt(out);
  if (slot(out) && slot(out).textContent) bad.push('signed out, a Check stamped the card "' + slot(out).textContent + '"');
  if (stored().length) bad.push('signed out, a date was stored: ' + stored().join(', '));
  /* SIGNED IN. */
  w.__t.USER({ name: 'Lucca Smith', personId: 'P7', role: 'student', roles: ['student'] });
  const card = draw(typed);
  if (!slot(card)) return bad.concat(['signed in, the tile row has no date slot, so a date would arrive as a new element']);
  if (card.querySelector('.qcard-done')) bad.push('the date slot is inside the card, not in the tile row beside the star');
  const top = card.querySelector('.qcard-tags');
  const t0 = top && top.outerHTML;
  const s0 = slot(card);
  if (slot(card).textContent) bad.push('a question never done is already stamped "' + slot(card).textContent + '"');
  markIt(card);
  if (slot(card).textContent !== label) bad.push('a Check did not stamp the card: "' + slot(card).textContent + '", wanted "' + label + '"');
  if (slot(card) !== s0) bad.push('stamping the date drew a new slot rather than writing into the one that was there');
  if (!top || card.querySelector('.qcard-tags') !== top || top.outerHTML !== t0) bad.push('stamping the date redrew the tag row');
  if (!/Not yet/.test(card.querySelector('.qp-verdict').textContent)) bad.push('the date took the verdict\'s place');
  if (w.localStorage.getItem('done:u:P7:q-done-typed') !== today) bad.push('the date is not stored per person per question: ' + stored().join(', '));
  if (slot(draw(typed)).textContent !== label) bad.push('drawn again, the card forgot the date');
  /* A TAP THAT CHOOSES ENOUGH. */
  const mc = Object.assign({}, base, { key: 'q-done-mc', accept: '', choices: ['14', '15'], choiceRight: [2] });
  const tapped = draw(mc);
  const heldA = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [mc];
  try { A['qp-choose'](tapped.querySelector('.qp-opt[data-n="1"]')); } finally { w.stuffItemsAll_ = heldA; }
  if (slot(tapped).textContent !== label) bad.push('a tapped answer did not stamp the card: "' + slot(tapped).textContent + '"');
  /* TYPING INTO A BOX WITH NO CHECK. */
  const free = draw(Object.assign({}, base, { key: 'q-done-free', accept: '' }));
  const fin = free.querySelector('.qp-ans-in');
  fin.value = 'because it is'; fin.dispatchEvent(new w.Event('input', { bubbles: true }));
  if (slot(free).textContent !== label) bad.push('writing an answer where there is no Check did not stamp the card');
  /* ANOTHER STUDENT, SAME PHONE. */
  w.__t.USER({ name: 'Ben Other', personId: 'P8', role: 'student', roles: ['student'] });
  if (slot(draw(typed)).textContent) bad.push('another student sees the first one\'s date: "' + slot(draw(typed)).textContent + '"');
  /* PRIVATE MODE: storage throws, and the date is held for the visit. */
  const fresh = Object.assign({}, base, { key: 'q-done-private' });
  const priv = draw(fresh);
  Object.defineProperty(w, 'localStorage', { configurable: true, get() { throw new Error('private mode'); } });
  try {
    markIt(priv);
    if (slot(priv).textContent !== label) bad.push('with storage throwing, the date was not shown: "' + slot(priv).textContent + '"');
    if (slot(draw(fresh)).textContent !== label) bad.push('with storage throwing, the date was not held for the visit');
  } catch (e) { bad.push('with storage throwing, marking threw: ' + e.message); }
  finally { delete w.localStorage; }
  w.__t.USER(null);
  return bad;
});

/* ---------- AND THE SHEET HAS IT: ONE ATTEMPT SENT, THE SHEET'S DATE SHOWN ---------------------------
   ASKED FOR AS *"should be saved to a spreadsheet instead of"* being kept only on the phone. Through
   the real handlers on a real card, against a payload carrying `attempts` as `doGet` builds it:
     * a Check sends ONE `markDone` -- the question's key and today -- and a second Check and typing
       that day send nothing more; signed out, or to a backend without `markDone`, nothing at all
     * a question the sheet has and this phone does not shows the SHEET's date; the later of the two
       wins either way; a payload built for somebody else is not read
     * on load, what this phone has that the sheet lacks goes up in one request, and what the sheet
       already has does not
     * an admin's people column says `N questions · last <d> <Mon>` under a learner, and nobody else's does */
check('a Check sends one attempt to the sheet, the card shows the sheet\'s date, and what the phone kept is sent up on load', async () => {
  const now = new Date();
  const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const later = (now.getFullYear() + 1) + '-01-02';                 /* a day the sheet has that the phone cannot */
  const p = Object.assign(payload(), {
    features: ['markDone'],
    attempts: { for: 'P7', mine: {
      'q-sheet-only': { first: '2001-10-04', last: '2001-10-04', times: 1 },
      'q-sheet-later': { first: '2001-10-04', last: later, times: 2 },
      'q-sheet-older': { first: '2001-10-04', last: '2001-10-04', times: 1 },
      'q-synced': { first: '2001-10-04', last: '2026-09-02', times: 1 },
    } },
  });
  const reply = b => (b.action === 'markDone'
    ? { success: true, attempts: (b.items || []).reduce((o, it) => { o[it.key] = { first: it.day, last: it.day, times: 1 }; return o; }, {}) }
    : { success: true });
  const { w, sent } = boot({ payload: p, reply,
    /* WHAT THIS PHONE KEPT BEFORE THE SHEET EXISTED: two days the sheet lacks, one it already has. */
    before: win => {
      win.localStorage.setItem('done:u:P7:q-offline', '2026-09-01');
      win.localStorage.setItem('done:u:P7:q-synced', '2026-09-02');
      win.localStorage.setItem('done:u:P7:q-sheet-older', '2026-09-03');
      win.localStorage.setItem('done:u:P7:q-sheet-later', '2026-09-04');
    } });
  await wait(300);
  const d = w.document;
  const bad = [];
  const A = w.__t.ACTIONS;
  if (typeof w.questionCard_ !== 'function' || !A['qp-check'] || typeof w.adoptMarks_ !== 'function'
      || typeof w.attemptsLine_ !== 'function' || typeof w.findCard !== 'function') {
    return ['questionCard_, qp-check, adoptMarks_, attemptsLine_ or findCard is not reachable — renamed? The sheet\'s date was NOT checked'];
  }
  const marks = () => sent.filter(b => b.action === 'markDone');
  const base = { kind: 'question', name: 'Q8', marks: 2,
    row: { row_id: 'Q-SHEET-8', paper_id: 'P-SHEET', subject: 'Maths', name: 'Sheet' },
    html: '<p>Work out 3 &times; 5</p>', answer: '<b>15</b>', accept: '15' };
  const q = k => Object.assign({}, base, { key: k });
  /* THE CARD AND ITS TILE ROW -- the date is beside the star (`questionTiles_`). */
  const draw = x => { const h = d.createElement('div'); h.innerHTML = w.questionCard_(x, 0) + '<div class="tile-row">' + w.questionTiles_(x) + '</div>'; d.body.appendChild(h); return h.querySelector('.qcard'); };
  const slot = card => (card.parentNode.querySelector('.tile-row .qcard-done') || {}).textContent || '';
  const check_ = card => { card.querySelector('.qp-ans-in').value = '16'; A['qp-check'](card.querySelector('.qp-check')); };

  /* SIGNED OUT: nothing is sent. */
  w.__t.USER(null);
  check_(draw(q('q-anon')));
  await wait(20);
  if (marks().length) bad.push('signed out, a Check sent markDone: ' + JSON.stringify(marks()));

  /* SIGNED IN, AND THE LOAD'S SYNC: the payload landed before USER was set, so it is asked again here
     the way the next payload would ask it. */
  w.__t.USER({ name: 'Lucca Smith', personId: 'P7', role: 'student', roles: ['student'], token: 'tok-P7' });
  /* TWICE BEFORE THE REPLY IS BACK, as a stored payload and the fresh one land a moment apart. */
  w.adoptMarks_();
  w.adoptMarks_();
  await wait(30);
  const sync = marks();
  if (sync.length !== 1) bad.push('the load sent ' + sync.length + ' markDone request(s) for what the phone kept, wanted 1 — two payloads landing together must not send the backlog twice');
  else {
    const keys = (sync[0].items || []).map(i => i.key + '@' + i.day).sort().join(', ');
    if (keys !== 'q-offline@2026-09-01, q-sheet-older@2026-09-03') bad.push('the load sent ' + keys + ' — wanted the two days the sheet lacks (q-offline, q-sheet-older) and not q-synced, which it has');
    if (sync[0].token !== 'tok-P7') bad.push('markDone went without the sign-in token, so the server cannot know whose it is');
  }
  w.adoptMarks_();
  await wait(30);
  if (marks().length !== 1) bad.push('a second payload in the same visit sent the backlog again');

  /* THE SHEET'S DATE ON THE CARD. */
  const shows = k => slot(draw(q(k)));
  if (shows('q-sheet-only') !== 'Done 4 Oct 2001') bad.push('a question on the sheet and not on this phone reads "' + shows('q-sheet-only') + '", wanted the sheet\'s "Done 4 Oct 2001"');
  if (shows('q-sheet-later') !== w.doneText_(later)) bad.push('the sheet\'s later day lost to this phone\'s older one: "' + shows('q-sheet-later') + '", wanted "' + w.doneText_(later) + '"');
  if (shows('q-sheet-older') !== w.doneText_('2026-09-03')) bad.push('this phone\'s later day lost to the sheet\'s older one: "' + shows('q-sheet-older') + '"');

  /* ONE CHECK, ONE ATTEMPT -- and nothing more that day. */
  const n0 = marks().length;
  const card = draw(q('q-fresh'));
  check_(card);
  await wait(30);
  const one = marks().slice(n0);
  if (one.length !== 1) bad.push('a Check sent ' + one.length + ' markDone request(s), wanted 1');
  else if (JSON.stringify(one[0].items) !== JSON.stringify([{ key: 'q-fresh', day: today }])) bad.push('a Check sent ' + JSON.stringify(one[0].items) + ' — wanted [{ key: "q-fresh", day: "' + today + '" }]');
  if (slot(card) !== 'Done ' + now.getDate() + ' ' + mon[now.getMonth()]) bad.push('after the Check the card reads "' + slot(card) + '"');
  check_(card);
  const inp = card.querySelector('.qp-ans-in');
  ['1', '15', '150'].forEach(v => { inp.value = v; inp.dispatchEvent(new w.Event('input', { bubbles: true })); });
  await wait(30);
  if (marks().length - n0 !== 1) bad.push('a second Check and three keystrokes the same day sent ' + (marks().length - n0 - 1) + ' more markDone — wanted none: once per question per day');
  /* TYPING INTO A FRESH BOX: thirty keystrokes, one request. */
  const fin = draw(Object.assign(q('q-typed'), { accept: '' })).querySelector('.qp-ans-in');
  const n1 = marks().length;
  const words = 'because the angles add to 180';
  for (let i = 1; i <= words.length; i++) { fin.value = words.slice(0, i); fin.dispatchEvent(new w.Event('input', { bubbles: true })); }
  await wait(30);
  if (marks().length - n1 !== 1) bad.push('typing an answer sent ' + (marks().length - n1) + ' markDone requests, wanted 1');

  /* AND ITS NAME, for the weekly parent email (backend/digest.gs): a card the library holds sends what
     a parent can read — the subject, the paper, the number — and the subject is not said twice when
     the paper's name already says it. The cards above are not in the library, and sent no label. */
  const heldItems = w.stuffItemsAll_;
  const named = (k, subject, sub) => Object.assign(q(k), { subject: subject, sub: sub });
  const qa = named('q-named', 'Maths', 'Paper 1 (Calculator) — June 2024');
  const qb = named('q-named-2', 'Biology', 'Biology Paper 2 — June 2023');
  const n3 = marks().length;
  w.stuffItemsAll_ = () => [qa, qb];
  try { check_(draw(qa)); check_(draw(qb)); } finally { w.stuffItemsAll_ = heldItems; }
  await wait(30);
  const labels = marks().slice(n3).map(b => ((b.items || [])[0] || {}).label);
  if (JSON.stringify(labels) !== JSON.stringify(['Maths · Paper 1 (Calculator) — June 2024 · Q8', 'Biology Paper 2 — June 2023 · Q8'])) {
    bad.push('a Check on a library card sent the labels ' + JSON.stringify(labels) + ' — wanted "Maths · Paper 1 (Calculator) — June 2024 · Q8" and "Biology Paper 2 — June 2023 · Q8", the name a parent reads in the weekly email');
  }
  /* A PRACTICAL'S WORKSHEET BOX is the card's key with a slot on the end (`guideBox_`), and it was
     looked up whole, so it found no card and went up nameless — three raw keys in a parent's email
     for one worksheet. The slot comes off for the lookup and the name says it was the worksheet. */
  const pr = { kind: 'practical', name: 'Specific heat capacity', key: 'pr:PR-T1', subject: 'Physics', sub: 'AQA required practical' };
  const n4 = marks().length;
  w.stuffItemsAll_ = () => [qa, pr];
  try { w.doneMark_('ans:' + w.whoIs_() + ':pr:PR-T1#iv'); } finally { w.stuffItemsAll_ = heldItems; }
  await wait(30);
  const prSent = (((marks().slice(n4)[0] || {}).items) || [])[0] || {};
  if (prSent.key !== 'pr:PR-T1#iv' || prSent.label !== 'Physics · AQA required practical · Specific heat capacity · Worksheet') {
    bad.push('a practical’s worksheet box sent ' + JSON.stringify(prSent) + ' — wanted key pr:PR-T1#iv with the label "Physics · AQA required practical · Specific heat capacity · Worksheet"');
  }

  /* A PAYLOAD BUILT FOR SOMEBODY ELSE IS NOT READ. */
  w.__t.USER({ name: 'Ben Other', personId: 'P8', role: 'student', roles: ['student'], token: 'tok-P8' });
  if (shows('q-sheet-only')) bad.push('Ben sees Lucca\'s sheet date: "' + shows('q-sheet-only') + '"');

  /* AN ADMIN'S PEOPLE COLUMN, off the summary only an admin is sent. */
  w.__t.USER({ name: 'Hal Admin', personId: 'P1', role: 'admin', roles: ['admin'], token: 'tok-P1' });
  w.__t.DATA().attempts = { for: 'P1', mine: {}, people: { P7: { n: 12, last: '2001-10-04' }, P9: { n: 1, last: '2001-10-04' } } };
  const line = w.attemptsLine_('P7');
  if (line !== '12 questions · last 4 Oct 2001') bad.push('an admin reads "' + line + '" under a learner, wanted "12 questions · last 4 Oct 2001"');
  if (w.attemptsLine_('P9') !== '1 question · last 4 Oct 2001') bad.push('one question reads "' + w.attemptsLine_('P9') + '"');
  if (w.attemptsLine_('P5') !== '') bad.push('a person with no attempts reads "' + w.attemptsLine_('P5') + '", wanted nothing');
  const box = d.createElement('div');
  box.innerHTML = w.findCard({ kind: 'tutor', row: { title: 'Lucca Smith', handle: 'lucca', role: 'Student', personId: 'P7', activity: line } });
  const act = box.querySelector('.prof-who .prof-act');
  if (!act || act.textContent !== line) bad.push('the person card does not draw the line under the name: ' + (act ? act.textContent : 'no .prof-act'));
  w.__t.USER({ name: 'Ben Other', personId: 'P8', role: 'student', roles: ['student'], token: 'tok-P8' });
  if (w.attemptsLine_('P7') !== '') bad.push('a summary built for the admin is drawn for Ben on the same phone: "' + w.attemptsLine_('P7') + '"');

  /* A BACKEND WITHOUT `markDone`: the date stays on the phone and nothing is sent. */
  w.__t.DATA().features = [];
  w.__t.USER({ name: 'Lucca Smith', personId: 'P7', role: 'student', roles: ['student'], token: 'tok-P7' });
  const n2 = marks().length;
  check_(draw(q('q-old-backend')));
  await wait(30);
  if (marks().length !== n2) bad.push('a backend that does not list markDone was sent it anyway');
  w.__t.USER(null);
  return bad;
});

/* ---------- THE WEEKLY PARENT EMAIL'S CARD -----------------------------------------------------------
   ASKED FOR AS THE INFRASTRUCTURE FOR *"something which triggers every sunday"* and emails parents —
   built and switched off (backend/digest.gs). The card is how an admin sees which: it says the mode the
   config row says (anything but preview or send is Off, as on the server), it is an admin's alone, and
   its one tile asks `digestPreview` — a read — and opens what would be sent, the plain body escaped.
   It posts nothing else, and a backend without the action is told so rather than asked. */
check('the weekly parent email card is an admin\'s, says the switch, and Preview opens the emails without sending one', async () => {
  const preview = { success: true, mode: 'preview', hour: 18, scheduled: 0,
    week: { start: '2026-09-28', end: '2026-10-04', span: '28 Sep – 4 Oct' },
    emails: [{ learner: 'Ada Pupil', parent: 'Pat Parent', to: 'pat@example.org', subject: 'Ada’s week: 2 questions',
               text: 'Hello Pat,\n\nThis week (28 Sep – 4 Oct, up to 6pm on Sunday) Ada worked on 2 questions.\n\nThe questions\n- <b>Maths</b> · Q1\n- q:Q-2',
               html: '<p>Hello Pat,</p>', count: 2 }],
    unreachable: [{ id: 'P-S3', name: 'Cal Alone', count: 1, why: 'no parent has accepted a link to them' }] };
  const p = payload();
  p.features = ['digestPreview'];
  p.constants.vars.weekly_digest = 'off';
  const { w, sent } = boot({ payload: p, reply: b => (b.action === 'digestPreview' ? preview : { success: true }) });
  await wait(300);
  const t = w.__t, d = w.document;
  const bad = [];
  const card = () => d.querySelector('#s-settings .card.digest');
  const said = () => (card().querySelector('.digest-mode') || {}).textContent || '';
  t.USER({ name: 'Pat Parent', personId: 'P-C1', role: 'parent', roles: ['parent'], token: 'tk', profile: {} });
  try { t.go('settings', false, true); w.paint('settings'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(200);
  if (card()) bad.push('a parent is shown the weekly parent email card — it is an admin’s');
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk', profile: {} });
  w.paint('settings');
  await wait(200);
  if (!card()) return bad.concat(['an admin has no Weekly parent email card on the Settings column']);
  if (!/Weekly parent email:\s*Off/.test(said())) bad.push('with weekly_digest off the card reads "' + said() + '"');
  [['Preview', 'Preview'], ['send', 'Send'], ['yes', 'Off'], ['', 'Off']].forEach(([cell, word]) => {
    t.DATA().constants.vars.weekly_digest = cell;
    w.paint('settings');
    if (!new RegExp('Weekly parent email:\\s*' + word).test(said())) bad.push('weekly_digest "' + cell + '" reads "' + said() + '" — wanted ' + word + ', as the server reads it');
  });
  t.DATA().constants.vars.weekly_digest = 'off';
  w.paint('settings');
  const tile = card().querySelector('.tile-row .tile[data-do="digest-preview"]');
  if (!tile) return bad.concat(['the card has no Preview tile in a tile row']);
  if (card().querySelector('button:not(.tile)')) bad.push('the card has a plain button — a thing has tiles');
  sent.length = 0;
  t.ACTIONS['digest-preview'](tile);
  await wait(300);
  const asks = sent.filter(b => b.action === 'digestPreview');
  if (asks.length !== 1) bad.push('Preview posted ' + JSON.stringify(sent.map(b => b.action)) + ' — wanted one digestPreview');
  if (sent.some(b => b.action !== 'digestPreview')) bad.push('Preview posted something besides the read: ' + JSON.stringify(sent.map(b => b.action)));
  const sheet = d.getElementById('sheet'), body = d.getElementById('sheet-body');
  if (!sheet || sheet.classList.contains('hidden')) bad.push('Preview did not open the sheet');
  const text = body ? body.textContent.replace(/\s+/g, ' ') : '';
  ['28 Sep – 4 Oct', 'To Pat Parent · pat@example.org', 'Ada’s week: 2 questions', 'Hello Pat,', 'q:Q-2',
   'Cal Alone — no parent has accepted a link to them', 'This preview sent nothing', 'no Sunday booked yet',
   'On Sunday this email would be written to the digest_log tab, and none sent'].forEach(s => {
    if (text.indexOf(s) === -1) bad.push('the preview sheet does not say "' + s + '"');
  });
  if (text.indexOf('<b>Maths</b>') === -1 || (body && [...body.querySelectorAll('b')].some(b => b.textContent === 'Maths'))) bad.push('a question’s name was drawn as markup in the preview — it came off a phone and must be printed as text');
  if (!/Weekly parent email:\s*Preview/.test(said())) bad.push('after the preview the card still reads "' + said() + '" — wanted the mode the server just answered with');
  /* A BACKEND FROM BEFORE digest.gs: told, not asked. */
  try { t.ACTIONS['close-sheet'] && t.ACTIONS['close-sheet'](); } catch (e) {}
  t.DATA().features = [];
  sent.length = 0;
  t.ACTIONS['digest-preview'](card().querySelector('[data-do="digest-preview"]'));
  await wait(100);
  if (sent.some(b => b.action === 'digestPreview')) bad.push('a backend that does not list digestPreview was sent it: ' + JSON.stringify(sent.map(b => b.action)));
  if (!/sync backend/i.test((card().querySelector('.digest-said') || {}).textContent || '')) bad.push('a backend without the weekly email is not said to need a sync');
  t.USER(null);
  return bad;
});

/* ---------- A TUTOR'S HOURS ON THEIR CARD ---------------------------------------------------------
   ASKED FOR AS *"tutors availability should appear on their card."* Asked of the card itself, off
   the shape `doGet` really sends — `availGridOut`'s 77 codes with 'TRUE' or '' — because the fixture
   once held `avail: []` and a card tested against that would have passed by drawing nothing. Three
   answers: a ticked hour is lit, a ticked hour they are already teaching is greyed, and a tutor who
   has ticked nothing gets no caption and no week — not seventy-seven grey cells reading "never". */
check('a tutor\'s ticked hours are on their card, busy ones greyed, and none says they cannot be booked', async () => {
  const { w } = boot();
  const d = w.document;
  await wait(300);
  if (typeof w.findCard !== 'function') return ['findCard is not reachable, so the card\'s week was NOT checked — not a pass'];
  const avail = {};
  ['m', 'tu', 'w', 'th', 'f', 'sa', 'su'].forEach(p => { for (let h = 9; h <= 18; h++) avail[p + String(h).padStart(2, '0')] = ''; });
  ['m16', 'm17', 'sa10', 'su18'].forEach(c => { avail[c] = 'TRUE'; });
  const t = { title: 'Ada Tutor', handle: 'ada', rate: 30, teaches: [], listed: true, personId: 'P-x',
              avail, busy: { m17: 'Maths' } };
  const box = d.createElement('div');
  box.innerHTML = String(w.findCard({ kind: 'tutor', row: t }) || '');
  const bad = [];
  const caps = [...box.querySelectorAll('.prof-cap')].map(c => c.textContent.trim());
  if (!caps.includes('Available')) bad.push('a tutor with hours ticked has no "Available" caption on their card');
  const codeOf = { Monday: 'm', Saturday: 'sa', Sunday: 'su' };
  const cell = (day, h) => box.querySelector(`.prof-week .hr[data-code="${codeOf[day]}${String(h).padStart(2, '0')}"]`);
  const lit = [...box.querySelectorAll('.prof-week .hr.on')];
  if (lit.length !== 3) bad.push(`${lit.length} hours lit on the card, wanted 3 (Mon 16, Sat 10, Sun 18)`);
  [['Monday', 16], ['Saturday', 10], ['Sunday', 18]].forEach(([dd, h]) => {
    const c = cell(dd, h);
    if (!c || !c.classList.contains('on')) bad.push(`${dd} ${h}:00 is ticked and not lit on the card`);
  });
  const busy = cell('Monday', 17);
  if (!busy || busy.classList.contains('on') || !busy.classList.contains('shut')) {
    bad.push('Monday 17:00 is ticked but already taught, and is not greyed on the card');
  }
  if (box.querySelector('.prof-week button, .prof-week input, .prof-week label')) bad.push('a cell of the card\'s week is a control, so it can be pressed and is counted as a tap target');
  if (!/Monday 16:00/.test(((box.querySelector('.prof-week') || {}).getAttribute || (() => ''))
      .call(box.querySelector('.prof-week'), 'aria-label') || '')) bad.push('the card\'s week does not say its hours to a screen reader');
  const rows = [...box.querySelectorAll('.prof-week .slot-row:not(.slot-head)')];
  const shut = rows.filter(r => r.classList.contains('is-shut')).length;
  if (rows.length !== 7 || shut !== 4) bad.push(`${rows.length} days drawn with ${shut} collapsed, wanted 7 with 4 (Tue to Fri) collapsed`);
  const none = d.createElement('div');
  none.innerHTML = String(w.findCard({ kind: 'tutor', row: Object.assign({}, t, { avail: Object.assign({}, avail, { m16: '', m17: '', sa10: '', su18: '' }) }) }) || '');
  if (none.querySelector('.prof-week')) bad.push('a tutor with no hours ticked is drawn with a week anyway');
  /* AND SAYS WHY THEY CANNOT BE BOOKED BY NAME — *"tutor with no hours wont be bookable"*. It drew
     nothing at all, which left the greyed name in the booking form unexplained. */
  if (!/hasn.t set their hours yet/i.test((none.querySelector('.prof-nohours') || {}).textContent || '')) {
    bad.push('a tutor with no hours ticked does not say "hasn\'t set their hours yet" on their card');
  }
  return bad;
});

/* ---------- YOUR PICTURE, CHOSEN IN SETTINGS -------------------------------------------------------
   ASKED FOR AS *"everyone should have a profile picture selector widget in account settings"*. The
   page's own change listener and tiles, end to end: a file chosen on the hidden input is posted as
   `savePhoto` with a JPEG `data:` URL and your own id, the server's address comes back into the
   preview and into `USER.profile`, and `Remove` posts `remove` and puts the initial back. The crop
   itself is a canvas, which jsdom has not got — so `pfpPrepare_` is stood in for, and the real one
   is driven in a browser with a real file (see the history note). And the old link box must be gone,
   because a hidden `photo` field would be posted by the card's Save and write the old picture back. */
check('a picture chosen in Settings posts savePhoto and the preview shows it', async () => {
  const URL_ = 'https://drive.google.com/file/d/FILEabcdefghijklmnopqrstuv/view';
  const { w, sent } = boot({ reply: b => b.action === 'savePhoto'
    ? { success: true, photo: b.remove ? '' : URL_ } : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document;
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk',
           profile: { first_name: 'Test', last_name: 'Admin', photo: '' } });
  try { t.go('settings', false, true); w.paint('settings'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const bad = [];
  if (d.querySelector('#s-settings [data-me="photo"]')) bad.push('Settings still draws a box for a photo link beside the picker');
  const box = () => d.querySelector('#s-settings .pfp');
  if (!box()) return bad.concat(['Settings has no picture picker on any card']);
  const inp = box().querySelector('input.pfp-in[type="file"]');
  if (!inp || !/image\/\*/.test(inp.getAttribute('accept') || '')) bad.push('the picker has no hidden file input taking images');
  if (!box().querySelector('[data-do="pfp-pick"]')) bad.push('the picker has no Choose photo tile');
  const rm = box().querySelector('[data-do="pfp-remove"]');
  if (!rm || !rm.disabled) bad.push('Remove is pressable with no picture to remove');
  if (!/^T$/.test(String((box().querySelector('.pfp-none') || {}).textContent || '').trim())) bad.push('with no picture the preview is not the initial');
  if (!inp) return bad;
  w.pfpPrepare_ = () => Promise.resolve('data:image/jpeg;base64,' + Buffer.from('square').toString('base64'));
  Object.defineProperty(inp, 'files', { value: [new w.File(['x'], 'me.png', { type: 'image/png' })], configurable: true });
  sent.length = 0;
  inp.dispatchEvent(new w.Event('change', { bubbles: true }));
  await wait(300);
  const post = sent.find(b => b.action === 'savePhoto');
  if (!post) bad.push('choosing a file posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no savePhoto');
  else {
    if (!/^data:image\/jpeg;base64,/.test(String(post.data || ''))) bad.push('savePhoto carried "' + String(post.data).slice(0, 30) + '", not a JPEG data: URL');
    if (post.personId !== 'P001') bad.push('savePhoto did not name the signed-in person by id');
  }
  const img = box() && box().querySelector('.pfp-face img');
  if (!img || !/lh3\.googleusercontent\.com\/d\/FILEabcdefghijklmnopqrstuv/.test(img.getAttribute('src') || '')) {
    bad.push('after the save the preview shows ' + (img ? img.getAttribute('src') : 'no picture') + ', not the kept file');
  }
  if ((t.whoami().profile || {}).photo !== URL_) bad.push('USER.profile.photo was not given the kept address, so the next Settings draw shows the old face');
  const rm2 = box() && box().querySelector('[data-do="pfp-remove"]');
  if (!rm2 || rm2.disabled) bad.push('with a picture saved, Remove cannot be pressed');
  else {
    sent.length = 0;
    t.ACTIONS['pfp-remove'](rm2);
    await wait(300);
    if (!sent.some(b => b.action === 'savePhoto' && b.remove === true)) bad.push('Remove posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no savePhoto remove');
    if (!box() || box().querySelector('.pfp-face img') || (t.whoami().profile || {}).photo !== '') bad.push('after Remove the picture is still drawn or still on USER.profile');
  }
  return bad;
});

/* ---------- YOUR ROLES, TICKED IN SETTINGS ---------------------------------------------------------
   ASKED FOR AS *"each account should have a widget in account settings which say what the roles are.
   they can be either a tutor or client or student. they can be tutor and client and student like
   multiselect."* The card's own ticks and tile, end to end: what you hold is what is ticked (a
   `parent` from the sign-in reply is Client), Admin is never a tick, nothing ticked never leaves the
   phone, a Save posts `setMyRoles` with your id and the ticked words — and the server's answer, not
   the ticks, is what you are afterwards: a Tutor tick that came back pending leaves the staff test
   (`isTutorRole`) false, says it is waiting on the card, and still offers the tutor agreement. The
   server's own rules are `check-profile`'s; this is the phone's half. */
check('the roles card ticks what you hold, posts setMyRoles, and a waiting Tutor is not staff', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'setMyRoles'
    ? { success: true, role: 'tutor', roles: ['tutor', 'parent'], tutorPending: true, changed: true }
    : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document;
  t.USER({ name: 'Pat Parent', personId: 'P-C1', role: 'parent', roles: ['parent'], token: 'tk', tutorPending: false,
           profile: { first_name: 'Pat', last_name: 'Parent' } });
  try { t.go('settings', false, true); w.paint('settings'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const bad = [];
  const card = () => d.querySelector('#s-settings .roles-card');
  if (!card()) return ['Settings has no Your roles card'];
  const tick = r => card().querySelector(`[data-role-pick="${r}"]`);
  ['tutor', 'client', 'student'].forEach(r => { if (!tick(r)) bad.push('the roles card has no ' + r + ' tick'); });
  if (card().querySelector('[data-role-pick="admin"]')) bad.push('Admin is a tick on the roles card — it is given, not chosen');
  if (bad.length) return bad;
  if (!tick('client').checked || tick('tutor').checked || tick('student').checked) {
    bad.push('a parent signed in sees tutor=' + tick('tutor').checked + ' client=' + tick('client').checked
      + ' student=' + tick('student').checked + ', wanted only Client ticked');
  }
  if (card().querySelector('.role-admin')) bad.push('a parent is told they are also Admin');
  const save = () => card().querySelector('[data-do="roles-save"]');
  if (!save()) return bad.concat(['the roles card has no Save tile']);
  /* NONE TICKED: said on the card, nothing posted. */
  tick('client').checked = false;
  sent.length = 0;
  t.ACTIONS['roles-save'](save());
  await wait(200);
  if (sent.some(b => b.action === 'setMyRoles')) bad.push('a Save with nothing ticked was posted');
  if (!/at least one/i.test(card().querySelector('.roles-said').textContent)) bad.push('a Save with nothing ticked did not say to keep one');
  /* TUTOR AND CLIENT: posted, with the id. */
  tick('client').checked = true; tick('tutor').checked = true;
  sent.length = 0;
  t.ACTIONS['roles-save'](save());
  await wait(400);
  const post = sent.find(b => b.action === 'setMyRoles');
  if (!post) bad.push('Save posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no setMyRoles');
  else {
    if (JSON.stringify(post.roles) !== '["tutor","client"]') bad.push('setMyRoles carried ' + JSON.stringify(post.roles) + ', wanted ["tutor","client"]');
    if (post.personId !== 'P-C1') bad.push('setMyRoles did not name the signed-in person by id');
  }
  const me = t.whoami();
  if (!me.tutorPending || JSON.stringify(me.roles) !== '["tutor","parent"]') bad.push('USER was not given the server\'s answer — ' + JSON.stringify({ roles: me.roles, tutorPending: me.tutorPending }));
  if (t.isTutorRole()) bad.push('a Tutor tick the server says is waiting already passes the staff test');
  if (!card() || !card().querySelector('[data-role-pick="tutor"]').checked) bad.push('after the save the card does not show Tutor ticked');
  if (!card() || !/waiting for @family/.test(card().querySelector('.roles-said').textContent)) bad.push('the card does not say the Tutor tick is waiting for approval');
  if (!d.querySelector('#s-settings .card.agree')) bad.push('a waiting tutor is not offered the tutor agreement to sign');
  /* AND THE ADMIN: told, not ticked. */
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin', 'tutor'], token: 'tk', profile: {} });
  try { w.paint('settings'); } catch (e) { return bad.concat(['drawing settings for the admin threw: ' + e.message]); }
  if (!card() || !card().querySelector('.role-admin')) bad.push('an admin is not told Admin is given and kept');
  else if (!tick('tutor').checked || tick('client').checked) bad.push('an admin holding admin, tutor does not see Tutor alone ticked');
  return bad;
});

/* ---------- A REFUSED SAVE PUTS THE TICKS BACK; A LOST REPLY LEAVES THEM ------------------------------
   THE WALK AFTER THE PARENT SIGN-UP FOUND IT: a student ticks Client, Save, and the server's *"A
   student account cannot make itself a client … Nothing was changed"* arrived under a Client box
   still ticked in gold — the box saying yes over the line saying no. The server's half (it refuses,
   it writes nothing) is `check-signin` §8; this is what the phone draws afterwards. And the other
   failure, which must NOT do the same: a reply that never came decided nothing, so the ticks are
   still the request a second Save will send. */
check('a refused roles save puts the ticks back to what you hold; a lost reply keeps them', async () => {
  const NO = 'A student account cannot make itself a client (a parent or payer). Ask @family. to change it. Nothing was changed.';
  const { w, sent } = boot({ reply: b => b.action === 'setMyRoles' ? { error: NO } : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document;
  t.USER({ name: 'Mo Learner', personId: 'P-S1', role: 'kid', roles: ['kid'], token: 'tk', tutorPending: false,
           profile: { first_name: 'Mo', last_name: 'Learner' } });
  try { t.go('settings', false, true); w.paint('settings'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const bad = [];
  const card = () => d.querySelector('#s-settings .roles-card');
  if (!card()) return ['Settings has no Your roles card'];
  const tick = r => card().querySelector(`[data-role-pick="${r}"]`);
  const ticks = () => ['tutor', 'client', 'student'].filter(r => tick(r) && tick(r).checked).join(',');
  const line = () => (card().querySelector('.roles-said') || {}).textContent || '';
  if (ticks() !== 'student') return ['a student signed in sees "' + ticks() + '" ticked, wanted student alone'];
  /* REFUSED: the server's sentence stays, the ticks go back to what is held. */
  tick('client').checked = true;
  sent.length = 0;
  t.ACTIONS['roles-save'](card().querySelector('[data-do="roles-save"]'));
  await wait(400);
  if (!sent.some(b => b.action === 'setMyRoles')) return ['Save with Client ticked posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no setMyRoles'];
  if (line().indexOf('Nothing was changed') === -1) bad.push('the line under the tile does not carry the server\'s refusal — "' + line() + '"');
  if (ticks() !== 'student') bad.push('after "Nothing was changed" the card shows "' + ticks() + '" ticked, wanted what the student holds: student');
  if (JSON.stringify(t.whoami().roles) !== '["kid"]') bad.push('a refusal changed USER.roles to ' + JSON.stringify(t.whoami().roles));
  /* LOST: nothing was decided, so the ticks are left for the second Save. */
  w.fetch = () => Promise.reject(new w.TypeError('Failed to fetch'));
  tick('client').checked = true;
  t.ACTIONS['roles-save'](card().querySelector('[data-do="roles-save"]'));
  await wait(400);
  if (!/did not answer|offline/.test(line())) bad.push('a lost reply did not say so on the card — "' + line() + '"');
  if (ticks() !== 'client,student') bad.push('a reply that never came took the ticks back to "' + ticks() + '" — a second Save would send what the person did not choose');
  return bad;
});

/* ---------- THE SHOP IS A COLUMN, AND FIND IS LEARNING -------------------------------------------
   ASKED FOR AS *"Get rid of shop tag. I will make a new coloumn for shop stuff. So finder now will
   become just learning stuff."* — the door and the column in ONE change, because the shop's things
   had one way onto a screen and that was the door. So this asks both halves together: a thing that
   left Find and did not arrive on the column is the deletion the owner was asked about and refused.

   AND WHO SEES WHAT. `doGet` sends `audience` and `inStock` on every row, and before the column read
   them a signed-out visitor was offered the toner cartridge. The rows below are one of each case,
   shaped as `doGet` shapes them; `payload()` sends none, which is why no journey had ever drawn one. */
const shopRow_ = (n, name, kindRaw, audience, inStock, extra) => Object.assign({
  id: n, rowIndex: n, kind: 'thing', kindRaw: kindRaw, name: name, price: '', unit: '£',
  acquire: 'buy', audience: audience, level: 0, slot: '', artId: '', description: name + ', for sale.',
  image: '', inStock: inStock, fields: {} }, extra || {});
check('the shop is its own column with the basket on top, and Find no longer has a Shop door', async () => {
  const p = payload();
  p.shop = [shopRow_(2, 'Gooey Louie (board game)', 'game', 'all', true),
            shopRow_(3, 'Safety goggles', 'equipment', 'all', true),
            shopRow_(4, 'Pencil (HB)', 'consumable', 'student', true, { price: '30', unit: 'p' }),
            shopRow_(5, 'Measuring wheel', 'equipment', 'tutor', true, { acquire: 'loan' }),
            shopRow_(6, 'Toner cartridge', 'consumable', 'admin', true, { acquire: 'issued' }),
            shopRow_(7, 'DYU Bike', 'equipment', 'admin', false),
            shopRow_(8, 'Beanie', 'avatar', 'student', true, { kind: 'wearable', slot: 'hat' })];
  const { w } = boot({ payload: p });
  await wait(300);
  const t = w.__t;
  if (!t.shopCards || !t.shopFunnel || !t.shopAll || !t.shopSaved || !t.shopDoors || !t.widgetsOf) {
    return ['the shop column and the funnel\'s lists are not exported, so the shop was NOT checked — not a pass'];
  }
  const bad = [];
  const ids = t.TABS.map(x => x.id);
  if (ids.indexOf('shop') < 0) return ['there is no `shop` tab at all'];
  if (ids.indexOf('shop') !== ids.indexOf('booking') + 1) {
    bad.push('the Shop column is not right of Booking — the order reads ' + ids.join(', '));
  }
  if (!t.shopAll().some(x => x.kind === 'shop' && x.name === 'Safety goggles')) {
    return ['the payload\'s shop rows are not items at all, so nothing here measures anything'];
  }

  /* FIND: no shop thing in the list it draws, and no `Shop` door on its first question. */
  const leaked = t.shopFunnel().filter(x => x.kind === 'shop').map(x => x.name);
  if (leaked.length) bad.push('Find still offers ' + leaked.length + ' shop thing(s): ' + leaked.join(', '));
  if (t.shopDoors().some(d => /\bShop\b/.test(d))) bad.push('Find\'s first question still has a Shop door: ' + t.shopDoors().join(' | '));

  /* THE COLUMN, SIGNED OUT: the basket first, then the things for everybody, under their group. */
  const drawn = () => t.shopCards().join('\n');
  const first = t.shopCards()[0] || '';
  if (!/cart-box/.test(first)) bad.push('page 0 of the Shop column is not the basket');
  if (!t.widgetsOf('shop').some(x => String(x.id) === 'cart')) bad.push('the basket is not a widget of the shop');
  if (t.widgetsOf('tool').some(x => String(x.id) === 'cart')) bad.push('the basket is still on the Tools column as well — two `#cart-box`es on one page');
  let html = drawn();
  ['Gooey Louie', 'Safety goggles', 'Pencil (HB)'].forEach(n => {
    if (html.indexOf(n) < 0) bad.push('signed out, the shop does not draw "' + n + '", which is for everybody');
  });
  ['Measuring wheel', 'Toner cartridge', 'DYU Bike', 'Beanie'].forEach(n => {
    if (html.indexOf(n) >= 0) bad.push('signed out, the shop draws "' + n + '" — a tutor\'s, an admin\'s, a withdrawn row or a wearable');
  });
  const games = t.shopCards().find(c => /<h2><span>Games<\/span>/.test(c)) || '';
  if (games.indexOf('Gooey Louie') < 0) bad.push('Gooey Louie is not under a Games heading — the things are not grouped by their kind');
  if (!/data-do="cart-add"/.test(html)) bad.push('no thing on the shop has a trolley');

  /* AN ADMIN sees the business's own kit and the admin's rows; nobody sees a withdrawn one. */
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk', credits: 0 });
  html = drawn();
  ['Measuring wheel', 'Toner cartridge'].forEach(n => {
    if (html.indexOf(n) < 0) bad.push('an admin is not shown "' + n + '" on the shop');
  });
  if (html.indexOf('DYU Bike') >= 0) bad.push('the shop draws a row whose `active` is FALSE');

  /* A STARRED SHOP THING IS STILL ON SAVED, which reads every item and not the funnel's list. */
  t.star('Safety goggles');
  if (!t.shopSaved().join('').includes('Safety goggles')) bad.push('a starred shop thing is not on Saved now that Find does not offer it');

  /* AND THE WAY TO IT FROM A BUNDLE: `cart-open` lands on the Shop column, on the basket. */
  t.ACTIONS['cart-open']();
  await wait(50);
  if (t.AT() !== 'shop') bad.push('"see your basket" went to ' + t.AT() + ', not the Shop column');
  else if (t.PAGE().shop !== t.widgetsOf('shop').findIndex(x => String(x.id) === 'cart')) {
    bad.push('"see your basket" landed on page ' + t.PAGE().shop + ' of the shop, not on the basket');
  }
  return bad;
});

/* ---------- PROJECTS, A KIND OF ITS OWN BESIDE THE PRACTICALS ------------------------------------
   ASKED FOR AS "the projects are like practicles, but not practicles. so should be a new tag in the
   finder called projects." Asked of the REAL file through the REAL mapper: the first boot is only
   there to reach `libraryExtras_`, so the rows the second boot draws are exactly what a phone makes
   of `data/projects.json` — not a hand-written fixture of what somebody thought the mapper did.
   Then: Find offers every one, `What kind` names `Projects` beside `Practicals`, a project is four
   pages (card, materials, steps, share), and the share page's one tile lands on Messages. */
check('Projects is a kind in Find beside Practicals: card, materials, steps, and a share page to Messages', async () => {
  const rows = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'projects.json'), 'utf8'));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the projects were NOT checked — not a pass'];
  /* THE PRACTICALS TOO, so `What kind` has both siblings to name — the fixture has no library. */
  const prac = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'practicals.json'), 'utf8'));
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, { projects: rows, practicals: prac })));
  const mapped = made.projects || [];
  if (!mapped.length) return ['the mapper made nothing of ' + rows.length + ' rows in data/projects.json'];
  const p = payload();
  p.projects = mapped;
  p.practicals = made.practicals || [];
  const { w } = boot({ payload: p });
  await wait(300);
  const t = w.__t;
  const bad = [];
  const found = w.stuffItems().filter(x => x.kind === 'project');
  if (found.length !== mapped.length) bad.push('Find offers ' + found.length + ' of ' + mapped.length + ' projects');
  if (!found.length) return bad;

  /* THE TAG. `What kind` is grouped, so the word sits one tap in, beside the practicals. */
  const kindFacet = w.facetList().find(f => f.field === 'kindLabel');
  const shown = items => w.facetValues(items, kindFacet).map(v => String(v.show || v.value));
  const learning = w.stuffItems().filter(x => w.kindOf_(x).group === 'Learning');
  /* PLACED IN THE GROUPING, because one unplaced kind stands the whole question down to the
     alphabet — and in the same group as the practicals, which is where the owner will look. */
  const grp = k => { try { return kindFacet.bucketOf(k); } catch (e) { return ''; } };
  if (grp('Projects') !== 'Work through it' || grp('Practicals') !== grp('Projects')) {
    bad.push('`What kind` files Projects under "' + grp('Projects') + '" and Practicals under "' + grp('Practicals') + '"');
  }
  const inner = shown(learning);
  if (inner.indexOf('Projects') < 0 || inner.indexOf('Practicals') < 0) bad.push('`What kind` does not offer Projects beside Practicals — it reads ' + inner.join(' | '));

  const x = found[0];
  const parts = w.pageParts_(x);
  if (JSON.stringify(parts) !== JSON.stringify([null, 'kit', 'steps', 'share'])) {
    bad.push('a project is pages ' + JSON.stringify(parts) + ', not card, materials, steps, share');
  }
  const box = html => { const d = w.document.createElement('div'); d.innerHTML = html; return d; };
  const card = box(w.stuffCard(x));
  if (!card.querySelector('.card.proj')) bad.push('the project card is not drawn as a project');
  else {
    if (card.querySelector('.fc-flag').textContent.trim() !== 'Project') bad.push('the card is not flagged Project');
    if (card.textContent.indexOf(x.row.sessions + ' sessions') < 0) bad.push('the card does not say how many sessions');
    if (card.querySelector('.gd-box, .prac-kit, .prac-steps')) bad.push('the card carries its materials or steps — they are pages of their own');
  }
  const kit = box(w.stuffPart_(x, 'kit'));
  if (kit.querySelectorAll('.prac-kit li').length !== x.row.materials.length) bad.push('the materials page does not list every item');
  const steps = box(w.stuffPart_(x, 'steps'));
  if (steps.querySelectorAll('.prac-steps ol > li').length !== x.row.steps.length) bad.push('the steps page does not number every step');
  const share = box(w.stuffPart_(x, 'share'));
  if (!/Messages/.test(share.textContent)) bad.push('the share page does not tell them to send it in Messages');
  if (x.row.share && share.textContent.indexOf(x.row.share.slice(0, 40)) < 0) bad.push('the share page does not carry the row\'s own share note');
  const tile = share.querySelector('.tile-row [data-do="proj-share"]');
  if (!tile) bad.push('the share page has no Messages tile');
  if (typeof t.ACTIONS['proj-share'] !== 'function') bad.push('`proj-share` has no handler');
  else {
    t.ACTIONS['proj-share'](tile);
    await wait(50);
    if (t.AT() !== 'dm') bad.push('the Messages tile went to ' + t.AT() + ', not Messages');
  }
  return bad;
});

/* ---------- THE @family. TEXTBOOK, REACHED THE WAY THE OWNER SAID --------------------------------
   ASKED FOR AS "the @family textbook should be bare bones for now and the textbooks will be in the
   resources tag in the finder. first one can be gcse statistics." So the route is the claim:
   Learning → Resources → @family. textbooks → GCSE Statistics, pressed on the REAL answer buttons
   the funnel draws, over the real file through the real mapper — with the real boxers and bouts
   beside it, because they are what the book has to be found among, and a Resources holding only
   the book would never ask the Shelf question at all.

   Then: the list is the book; it is a contents card and one page per chapter in chapter order; a
   chapter page has its key words, its formulas STACKED by `typeset_`, its worked lines and the
   Higher mark; typing a word that is only inside a chapter finds it; and the star keeps it on
   Saved. */
check('the @family. textbook: Learning, Resources, @family. textbooks, GCSE Statistics — contents, chapters, search, star', async () => {
  const read = n => JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8'));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the textbooks were NOT checked — not a pass'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
    { textbooks: read('textbooks'), boxers: read('boxers'), fights: read('fights'), projects: read('projects') })));
  const books = made.textbooks || [];
  if (!books.length) return ['the mapper made no book of data/textbooks.json'];
  if (!(made.boxers || []).length) return ['the mapper made no boxers, so the shelf the book sits beside is empty — NOT a pass'];
  const p = payload();
  /* THE PROJECTS TOO, so `What kind` has a second answer and the Resources press is a real press —
     the fixture has no library, and with Resources the only kind the question would not be asked. */
  Object.assign(p, { textbooks: books, boxers: made.boxers, fights: made.fights || [], projects: made.projects || [] });
  const { w } = boot({ payload: p });
  await wait(300);
  const t = w.__t;
  if (!t.STUFF) return ['Find\'s state is not exported to the journey'];
  const bad = [];
  const book = books.find(b => b.name === 'GCSE Statistics');
  if (!book) return ['data/textbooks.json has no book called GCSE Statistics — names: ' + books.map(b => b.name).join(', ')];

  /* THE ROUTE, ONE PRESS AT A TIME, on whatever the question page draws. A grouped question may
     draw the BUCKET first (`Read or watch it`), and pressing it is the same route one tap longer,
     so a bucket that holds the next word on the route is pressed and the question asked again. */
  t.go('stuff');
  t.STUFF().filters.length = 0; t.STUFF().q = '';
  w.paintStuff();
  const route = ['Learning', 'Resources', '@family. textbooks'];
  const rungs = ['forLabel', 'kindLabel', 'shelf'];
  const kindFacet = w.facetList().find(f => f.field === 'kindLabel');
  const pressed = [];
  for (let guard = 0; route.length && guard < 8; guard++) {
    const btns = [...w.document.querySelectorAll('#s-stuff [data-do="facet-pick"]')];
    let el = btns.find(b => b.dataset.value === route[0]);
    /* A RUNG EVERYTHING LEFT ALREADY ANSWERS IS SKIPPED BY THE ONE-ANSWER RULE, and that is the
       route working rather than failing: the fixture has nothing under `What for` but Learning. The
       question is only allowed to be absent when its one answer IS the next word on the route. */
    const rung = w.facetList().find(f => f.field === rungs[3 - route.length]);
    const only = rung ? w.facetValues(w.stuffFiltered(), rung).map(v => String(v.value)) : [];
    if (!el && only.length === 1 && only[0] === route[0]) {
      pressed.push('(' + route.shift() + ')');
      continue;
    }
    if (!el) {
      const grp = (() => { try { return kindFacet.bucketOf(route[0]); } catch (e) { return ''; } })();
      el = grp && btns.find(b => b.dataset.value === grp && b.dataset.bucket);
      if (!el) {
        bad.push('the funnel did not offer "' + route[0] + '" after ' + (pressed.join(' → ') || 'nothing') + ' — it offered '
          + (btns.map(b => b.dataset.field + ':' + b.dataset.value).join(' | ') || 'no answers'));
        break;
      }
    } else route.shift();
    pressed.push(el.dataset.value);
    t.ACTIONS['facet-pick'](el);
    await wait(20);
  }
  if (route.length) return bad;
  /* THE SHELF HAS TO HAVE BEEN PRESSED, not skipped: one answer there would mean the boxing was
     not beside it, and the door this journey is about was never on screen. Same for Resources. */
  if (pressed.indexOf('@family. textbooks') < 0) bad.push('the shelf was never a question — ' + pressed.join(' → '));
  if (pressed.indexOf('Resources') < 0) bad.push('Resources was never pressed — ' + pressed.join(' → '));
  /* THE SHELF QUESTION OFFERED BOXING BESIDE IT, or it was not a door — it was the only answer. */
  const left = w.stuffFiltered();
  if (left.length !== 1 || left[0].kind !== 'textbook' || left[0].name !== 'GCSE Statistics') {
    bad.push('after ' + pressed.join(' → ') + ' the list is ' + left.length + ' item(s): '
      + left.slice(0, 4).map(x => x.kind + ' ' + x.name).join(', ') + ' — not the book');
  }
  /* AND NOTHING ELSE ON RESOURCES FELL OFF THE SHELVES. Pressing `Boxing` keeps only what says
     Boxing, so a boxer with no shelf would vanish from the route that used to reach him — the door
     would have cost the boxing what it gave the book. */
  const shelfFacet = w.facetList().find(f => f.field === 'shelf');
  const resources = w.stuffItems().filter(i => w.kindOf_(i).label === 'Resources');
  const unshelved = resources.filter(i => !w.facetValues([i], shelfFacet).length);
  if (unshelved.length) {
    bad.push(unshelved.length + ' of ' + resources.length + ' Resources are on no shelf ('
      + [...new Set(unshelved.map(i => i.kind))].join(', ') + ') — pressing a shelf hides them');
  }
  const x = left.find(i => i.kind === 'textbook') || w.stuffItems().find(i => i.kind === 'textbook');
  if (!x) return bad.concat(['Find offers no textbook at all']);

  /* CARD, THEN A PAGE PER CHAPTER IN ORDER. */
  const parts = w.pageParts_(x);
  const want = [null].concat(book.chapters.map(c => 'ch' + c.n));
  if (JSON.stringify(parts) !== JSON.stringify(want)) bad.push('the book is pages ' + JSON.stringify(parts).slice(0, 80) + ', not the card and ' + book.chapters.length + ' chapters in order');
  const box = html => { const d = w.document.createElement('div'); d.innerHTML = html; return d; };
  const card = box(w.stuffCard(x));
  if (!card.querySelector('.card.tb')) bad.push('the book card is not drawn as a textbook');
  else {
    if (card.querySelector('.fc-flag').textContent.trim() !== 'Textbook') bad.push('the card is not flagged Textbook');
    const toc = [...card.querySelectorAll('.tb-toc ol > li')].map(li => li.textContent.replace(/H$/, '').trim());
    if (toc.join('|') !== book.chapters.map(c => c.title).join('|')) bad.push('the contents do not list the chapters in order: ' + toc.slice(0, 3).join(', '));
    if (card.querySelector('.tb-words, .tb-math')) bad.push('the card carries a chapter — chapters are pages of their own');
  }
  /* A CHAPTER WITH FORMULAS, AND THE ONE THAT IS HIGHER ALL THROUGH. */
  const withMath = book.chapters.find(c => c.formulas.some(f => /\//.test(f.text)));
  const pg = box(w.stuffPart_(x, 'ch' + withMath.n));
  if (pg.querySelectorAll('.tb-words li').length !== withMath.words.length) bad.push('chapter ' + withMath.n + ' does not list every key word');
  if (pg.querySelectorAll('.tb-math li').length !== withMath.formulas.length) bad.push('chapter ' + withMath.n + ' does not list every formula');
  if (!pg.querySelector('.tb-math .frac .frac-n') || !pg.querySelector('.tb-math .frac .frac-d')) bad.push('chapter ' + withMath.n + '\'s fractions are not stacked — typeset_ was not run over the formulas');
  if (/&frasl;|\//.test([...pg.querySelectorAll('.tb-fm')].map(e => e.innerHTML.replace(/<span class="frac-s">\/<\/span>/g, '').replace(/<[^>]*>/g, '')).join(''))) bad.push('a slash is left standing in a formula on chapter ' + withMath.n);
  if (pg.querySelectorAll('.tb-points li').length !== withMath.points.length) bad.push('chapter ' + withMath.n + ' does not list every worked line');
  const hItems = withMath.words.concat(withMath.formulas, withMath.points).filter(i => i.higher).length;
  if (pg.querySelectorAll('li .tb-h').length !== hItems) bad.push('chapter ' + withMath.n + ' marks ' + pg.querySelectorAll('li .tb-h').length + ' lines Higher, the file says ' + hItems);
  const hc = book.chapters.find(c => c.higher);
  if (hc && !box(w.stuffPart_(x, 'ch' + hc.n)).querySelector('h3 .tb-h')) bad.push('chapter ' + hc.n + ' is Higher all through and its heading does not say so');

  /* SEARCHABLE BY ITS WORDS — one that is only inside a chapter, never in the title. */
  t.STUFF().filters.length = 0; t.STUFF().q = 'frequency density';
  if (!w.stuffFiltered().some(i => i.kind === 'textbook')) bad.push('typing "frequency density" does not find the book — the chapters are not in its haystack');
  t.STUFF().q = '';

  /* STARRABLE, by the card's own Save tile, and kept on Saved. */
  t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const fav = box(w.stuffCard(x)).querySelector('[data-do="fav"]');
  if (!fav) bad.push('the book card has no Save tile');
  else {
    t.ACTIONS.fav(fav);
    if (!t.savedPages().join('').includes('tb-toc')) bad.push('the book was starred and is not on the Saved column');
  }
  return bad;
});

/* ---------- THE BIBLE: AN ADMIN READS GENESIS 1, AND NOBODY ELSE IS SHOWN IT OR SENT IT ------------
   ASKED FOR AS "i want to add the bible to resources as a book. but only admin can see the bible."
   Two halves, and the second is the one that matters more:

   NOBODY BUT AN ADMIN. Signed out, a parent, a student and a tutor are each booted SIGNED IN FROM THE
   FIRST LINE (seeded the way `check/ui.js` seeds its visitor, so the boot that builds Find is theirs),
   with the real `data/bible/` files there to be fetched. Each walks to Resources and every shelf on
   it, searches `bible` and `genesis`, and even presses a book button that should not exist. Then the
   list of everything fetched is read: not one URL under `data/bible/`. Absent is the claim — no item,
   no `Books` answer, no card — and not one byte downloaded for a book they were never shown.

   AN ADMIN, BY THE OWNER'S ROUTE. Learning → Resources → Books on the real answer buttons; the list
   is the Bible; its cover and three lists (the Old Testament turned at Job, then the New); Genesis
   pressed, fetched ONCE, its chapter numbers turned to — after all three lists; chapter 1 pressed and
   READ — "In the beginning God created the heaven and the earth." — with `[was]` drawn as italics and
   no bracket anywhere; every verse of Genesis on exactly one page, in order; a tile back to the
   numbers on every page of every chapter, pressed from the middle of one, and the numbers' tile back
   to the Old Testament; Genesis again with no second fetch; the New Testament still page three and
   Matthew after it; Psalm 119 back to the page of numbers it is on; a book that fails to arrive said
   on the list without losing the one open; the book names searchable; the star keeping the cover and
   all three lists; and signing out from inside it leaving nothing of it on Find. */
check('the Bible: an admin opens Genesis 1 off the Books shelf; nobody else is shown it or fetches a byte of it', async () => {
  const read = n => JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8'));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the shelves were NOT built — not a pass'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
    { textbooks: read('textbooks'), boxers: read('boxers'), fights: read('fights'), projects: read('projects') })));
  /* THE SHELVES THE BIBLE STANDS BESIDE, so `Books` is pressed among real answers rather than alone. */
  const base = () => Object.assign(payload(), { textbooks: made.textbooks || [], boxers: made.boxers || [],
                                                fights: made.fights || [], projects: made.projects || [] });
  /* THE REAL FILES, SERVED AS THE SITE SERVES THEM, the deploy stamp and all; a name in `refuse` 404s. */
  const bibleDir = path.join(dir, '..', 'data', 'bible');
  const refuse = new Set();
  const serve = url => {
    const m = /(?:^|\/)data\/bible\/([a-z0-9-]+\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    if (refuse.has(m[1])) return null;
    const p = path.join(bibleDir, m[1]);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  };
  const seed = u => w => { try { w.localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} };
  const ofBible = gets => gets.filter(u => /data\/bible\//.test(u));
  const bad = [];

  /* ---------- NOBODY BUT AN ADMIN ---------------------------------------------------------------- */
  const others = [
    ['somebody signed out', null],
    ['a parent', { name: 'Rasa Poliksa', personId: 'P004', role: 'parent', roles: ['parent'] }],
    ['a student', { name: 'Sam Student', personId: 'P003', role: 'student', roles: ['student'] }],
    ['a tutor', { name: 'Ada Tutor', personId: 'P002', role: 'tutor', roles: ['tutor'] }],
  ];
  for (const [what, u] of others) {
    const b = boot({ payload: base(), serve, before: u ? seed(u) : undefined });
    await wait(300);
    const w = b.w, t = w.__t;
    if (!t || !t.STUFF) { bad.push(what + ': the app did not load, so it was NOT checked'); continue; }
    if (u && !(t.whoami() && t.whoami().role === u.role)) { bad.push(what + ' was not signed in at boot, so it was NOT checked'); continue; }
    t.go('stuff');
    t.STUFF().q = '';
    t.STUFF().filters = [{ field: 'kindLabel', value: 'Resources' }];
    w.paintStuff();
    await wait(30);
    const shelf = w.facetList().find(f => f.field === 'shelf');
    const shelves = shelf ? w.facetValues(w.stuffFiltered(), shelf).map(v => String(v.value)) : [];
    if (shelves.indexOf('Books') >= 0) bad.push(what + ' is offered the Books shelf');
    if (shelves.indexOf('@family. textbooks') < 0) bad.push(what + ' was not offered the textbooks shelf — the walk did not reach Resources, so the absence proves nothing');
    if (w.stuffItemsAll_().some(x => x.kind === 'bible')) bad.push(what + ' has the Bible on the list of everything the app holds');
    for (const q of ['bible', 'genesis', 'king james']) {
      t.STUFF().filters = []; t.STUFF().q = q;
      if (w.stuffFiltered().some(x => x.kind === 'bible')) bad.push(what + ' finds the Bible by searching "' + q + '"');
    }
    t.STUFF().q = '';
    w.paintStuff();
    if (w.document.querySelector('.card.bible, [data-do^="bible-"]')) bad.push(what + ' has a Bible card or button drawn');
    /* AND A BUTTON THEY COULD NOT HAVE BEEN SHOWN, PRESSED ANYWAY — the fetch is gated as well. */
    const fake = w.document.createElement('button');
    fake.setAttribute('data-n', '1');
    try { t.ACTIONS['bible-book'](fake); } catch (e) { bad.push(what + ': pressing a Bible book threw ' + e.message); }
    await wait(60);
    const got = ofBible(b.gets);
    if (got.length) bad.push(what + ' fetched ' + got.length + ' file(s) of the Bible: ' + got.slice(0, 3).join(', '));
    if (!b.gets.length) bad.push(what + ': no fetch was recorded at all, so "nothing of the Bible" proves nothing');
  }

  /* ---------- AN ADMIN, BY THE ROUTE --------------------------------------------------------------- */
  const admin = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'] };
  const a = boot({ payload: base(), serve, before: seed(admin) });
  const w = a.w, t = w.__t, d = w.document;
  for (let i = 0; i < 40 && !(t && t.BIBLE && t.BIBLE() && t.BIBLE().index); i++) await wait(25);
  if (!t || !t.BIBLE || !t.BIBLE()) return bad.concat(['the reader\'s state is not exported to the journey']);
  if (!t.BIBLE().index) return bad.concat(['an admin\'s Find never received data/bible/index.json — fetched: ' + ofBible(a.gets).join(', ')]);
  const index = JSON.parse(fs.readFileSync(path.join(bibleDir, 'index.json'), 'utf8'));
  if (ofBible(a.gets).length !== 1) bad.push('an admin\'s boot fetched ' + ofBible(a.gets).length + ' Bible files — the index and no book is the right number');

  t.go('stuff');
  t.STUFF().filters.length = 0; t.STUFF().q = '';
  w.paintStuff();
  const route = ['Learning', 'Resources', 'Books'];
  const rungs = ['forLabel', 'kindLabel', 'shelf'];
  const kindFacet = w.facetList().find(f => f.field === 'kindLabel');
  const pressed = [];
  for (let guard = 0; route.length && guard < 8; guard++) {
    const btns = [...d.querySelectorAll('#s-stuff [data-do="facet-pick"]')];
    let el = btns.find(b => b.dataset.value === route[0]);
    const rung = w.facetList().find(f => f.field === rungs[3 - route.length]);
    const only = rung ? w.facetValues(w.stuffFiltered(), rung).map(v => String(v.value)) : [];
    if (!el && only.length === 1 && only[0] === route[0]) { pressed.push('(' + route.shift() + ')'); continue; }
    if (!el) {
      const grp = (() => { try { return kindFacet.bucketOf(route[0]); } catch (e) { return ''; } })();
      el = grp && btns.find(b => b.dataset.value === grp && b.dataset.bucket);
      if (!el) {
        bad.push('the funnel did not offer "' + route[0] + '" to an admin after ' + (pressed.join(' → ') || 'nothing') + ' — it offered '
          + (btns.map(b => b.dataset.field + ':' + b.dataset.value).join(' | ') || 'no answers'));
        break;
      }
    } else route.shift();
    pressed.push(el.dataset.value);
    t.ACTIONS['facet-pick'](el);
    await wait(20);
  }
  if (route.length) return bad;
  if (pressed.indexOf('Books') < 0) bad.push('the Books shelf was never a question for an admin — ' + pressed.join(' → '));
  const left = w.stuffFiltered();
  const x = left.find(i => i.kind === 'bible');
  if (left.length !== 1 || !x) return bad.concat(['after ' + pressed.join(' → ') + ' the list is ' + left.length + ' item(s): '
    + left.slice(0, 4).map(i => i.kind + ' ' + i.name).join(', ') + ' — not the Bible']);

  /* THE COVER, MADE OF THE SHARED PARTS, SAYING WHO CAN SEE IT. */
  const box = html => { const e = d.createElement('div'); e.innerHTML = html; return e; };
  const cover = box(w.stuffCard(x)).querySelector('.favwrap > .card') || box(w.stuffCard(x)).firstElementChild;
  if (!cover || !cover.classList.contains('bible') || !cover.classList.contains('fc')) bad.push('the cover is not a `.card.fc.bible`');
  else {
    const h = cover.querySelector(':scope > .fc-head > h3');
    if (!h || h.textContent.trim() !== 'The Bible (King James Version)') bad.push('the cover is titled "' + (h && h.textContent.trim()) + '"');
    if (!cover.querySelector(':scope > .fc-head > .fc-flags > .fc-flag')) bad.push('the cover has no flag in its head');
    if (!/31,102 verses/.test(cover.textContent)) bad.push('the cover does not count the verses — the index did not reach it');
    if (!cover.querySelector('.bb-who')) bad.push('the cover does not say only admins are shown it');
    if (cover.querySelector('.tile-row')) bad.push('the cover carries a tile row inside the card');
  }
  const first = w.stuffFirstResult_();
  const parts0 = w.pageParts_(x);
  /* THE COVER, THEN THREE LISTS: the Old Testament on two pages and the New on one. */
  const LISTS = [null, 'ot', 'ot2', 'nt'];
  if (JSON.stringify(parts0) !== JSON.stringify(LISTS)) bad.push('before a book is opened the Bible is pages ' + JSON.stringify(parts0) + ', not the cover and three lists of books');
  if (!/next three pages/.test(cover ? cover.textContent : '')) bad.push('the cover does not say the books are the next three pages');

  /* BOTH TESTAMENTS, EVERY BOOK, IN ORDER, AS BUTTONS ON THE PAGE — and the Old Testament turned at
     Job, so neither of its pages is the thirty-nine that `paneReach_` drew at 84% on a 320px phone. */
  t.goPage('stuff', first + 1);
  await wait(30);
  const names = sel => [...d.querySelectorAll('#s-stuff .bb-toc' + sel + ' [data-do="bible-book"]')].map(b => b.textContent.trim());
  const wantOT = index.books.filter(b => b.testament === 'OT').map(b => b.book);
  const wantNT = index.books.filter(b => b.testament === 'NT').map(b => b.book);
  const turn = wantOT.indexOf('Job');
  if (names('[data-bb="ot"]').join('|') !== wantOT.slice(0, turn).join('|')) bad.push('the first Old Testament page lists ' + names('[data-bb="ot"]').length + ' books, not Genesis to Esther in order: ' + names('[data-bb="ot"]').slice(-2).join(', '));
  if (names('[data-bb="ot2"]').join('|') !== wantOT.slice(turn).join('|')) bad.push('the second Old Testament page lists ' + names('[data-bb="ot2"]').length + ' books, not Job to Malachi in order: ' + names('[data-bb="ot2"]').slice(0, 2).join(', '));
  if (names('.is-ot').join('|') !== wantOT.join('|')) bad.push('the two Old Testament pages list ' + names('.is-ot').length + ' books between them, not the 39 in order');
  if (names('.is-nt').join('|') !== wantNT.join('|')) bad.push('the New Testament page lists ' + names('.is-nt').length + ' books, not the 27 in order');
  [...d.querySelectorAll('#s-stuff .bb-toc')].forEach(pg => {
    const k = pg.firstElementChild, h = k && k.nextElementSibling;
    if (!k || !k.classList.contains('fc-kick') || !h || h.tagName !== 'H3') bad.push('a testament page does not open on its kicker and then its title');
  });

  /* GENESIS, PRESSED. */
  const press = async (sel, n) => {
    const el = d.querySelector('#s-stuff ' + sel);
    if (!el) { bad.push('no ' + sel + ' on the screen to press' + (n ? ' (' + n + ')' : '')); return false; }
    t.ACTIONS[el.getAttribute('data-do')](el);
    await wait(80);
    return true;
  };
  const before = ofBible(a.gets).length;
  if (!(await press('[data-do="bible-book"][data-n="1"]', 'Genesis'))) return bad;
  const gen = ofBible(a.gets).slice(before);
  if (gen.length !== 1 || !/data\/bible\/01-genesis\.json/.test(gen[0])) bad.push('pressing Genesis fetched ' + JSON.stringify(gen) + ' — not 01-genesis.json once');
  const genesis = JSON.parse(fs.readFileSync(path.join(bibleDir, '01-genesis.json'), 'utf8'));
  const parts = w.pageParts_(x);
  const chParts = parts.filter(p => /^c\d+/.test(p || ''));
  /* THE BOOK AFTER ALL THREE LISTS, not after its own testament. Between the Old Testament and the New
     it put Genesis's every page — 328 swipes at 320px from one list to the other. */
  if (JSON.stringify(parts.slice(0, 5)) !== JSON.stringify(LISTS.concat(['bk'])) || !/^c\d+/.test(parts[parts.length - 1] || '') || !chParts.length) {
    bad.push('with Genesis open the Bible is pages ' + JSON.stringify(parts).slice(0, 90) + ' — not the cover, the three lists, then Genesis');
  }
  const at = p => first + parts.indexOf(p);
  if (t.PAGE().stuff !== at('bk')) bad.push('pressing Genesis did not turn to its chapter numbers — page ' + t.PAGE().stuff + ', the numbers are ' + at('bk'));
  const grid = d.querySelectorAll('#s-stuff .bb-chs [data-do="bible-ch"]');
  if (grid.length !== 50) bad.push('Genesis offers ' + grid.length + ' chapter numbers, not 50');

  /* CHAPTER 1, PRESSED AND READ. */
  if (!(await press('[data-do="bible-ch"][data-ch="1"]', 'chapter 1'))) return bad;
  if (t.PAGE().stuff !== at('c1')) bad.push('pressing 1 did not turn to Genesis 1 — page ' + t.PAGE().stuff + ', Genesis 1 is ' + at('c1'));
  const c1 = d.querySelector('#s-stuff .card.bb-text.is-c1');
  if (!c1) bad.push('Genesis 1 is not drawn on the screen after turning to it');
  else {
    const h = c1.querySelector('h3');
    if (!h || h.textContent.trim() !== 'Genesis 1') bad.push('the chapter page is titled "' + (h && h.textContent.trim()) + '", not Genesis 1');
    const v1 = c1.querySelector('.bb-v');
    const n1 = v1 && v1.querySelector('.bb-n');
    if (!v1 || !n1 || n1.textContent.trim() !== '1') bad.push('the first verse does not carry its number 1');
    const words = v1 ? v1.textContent.replace(/^\s*1\s*/, '').trim() : '';
    if (words !== 'In the beginning God created the heaven and the earth.') bad.push('Genesis 1:1 reads "' + words + '"');
    if (!/darkness <i>was<\/i> upon the face of the deep/.test(c1.innerHTML)) bad.push('Genesis 1:2\'s [was] is not drawn as italics');
    if (/[\[\]]/.test(c1.textContent)) bad.push('a bracket is left standing on Genesis 1');
    if (/#/.test(c1.textContent)) bad.push('a pilcrow # is drawn on Genesis 1');
    const k = c1.firstElementChild, t3 = k && k.nextElementSibling;
    if (!k || !k.classList.contains('fc-kick') || !t3 || t3.tagName !== 'H3') bad.push('a chapter page does not open on its kicker and then its title');
  }
  /* EVERY VERSE OF GENESIS ON EXACTLY ONE PAGE, IN ORDER — the pages as the app draws them. */
  const drawn = [];
  chParts.forEach(p => {
    const pg = box(w.stuffPart_(x, p));
    const ch = Number(/^c(\d+)/.exec(p)[1]);
    pg.querySelectorAll('.bb-v').forEach(v => drawn.push(ch + ':' + v.querySelector('.bb-n').textContent.trim() + ' '
      + v.textContent.replace(/^\s*\d+\s*/, '').trim()));
  });
  const want = [];
  genesis.chapters.forEach((vs, ci) => vs.forEach((v, vi) => want.push((ci + 1) + ':' + (vi + 1) + ' ' + v.replace(/^#\s*/, '').replace(/[\[\]]/g, ''))));
  if (drawn.length !== want.length) bad.push('Genesis is drawn as ' + drawn.length + ' verses across its pages; the book has ' + want.length);
  else {
    const i = drawn.findIndex((s, j) => s !== want[j]);
    if (i >= 0) bad.push('Genesis is drawn out of order or altered at ' + want[i].slice(0, 60) + ' — drawn ' + drawn[i].slice(0, 60));
  }
  /* THE WAY BACK UP, ON EVERY PAGE OF EVERY CHAPTER — not only a chapter's last, which left Psalm 119's
     first page twenty-one swipes from any way out. Pressed from the FIRST page of Genesis 1, which is
     mid-chapter whenever the chapter is longer than a page. */
  const c1parts = chParts.filter(p => /^c1(-|$)/.test(p));
  if (c1parts.length < 2) bad.push('Genesis 1 is one page, so a way out from the middle of a chapter was NOT checked');
  const noWay = chParts.filter(p => !box(w.stuffPart_(x, p)).querySelector('.tile-row [data-do="bible-to"][data-to="bk"]'));
  if (noWay.length) bad.push(noWay.length + ' of Genesis\'s ' + chParts.length + ' text pages have no tile back to the chapter numbers, first ' + noWay[0]);
  t.goPage('stuff', at(c1parts[0]));
  await wait(30);
  if (await press('.is-' + c1parts[0] + ' [data-do="bible-to"]', 'back to the numbers from the first page of Genesis 1')) {
    if (t.PAGE().stuff !== at('bk')) bad.push('the tile on the first page of Genesis 1 did not go back to its chapter numbers');
  }
  /* AND THE NUMBERS BACK TO THE LIST THEIR BOOK IS ON — three pages behind them, past the New
     Testament, which is why it is a tile and not a swipe. */
  if (await press('.bb-chs.is-bk [data-do="bible-to"]', 'Genesis\'s numbers back to the Old Testament')) {
    if (t.PAGE().stuff !== at('ot')) bad.push('the tile under Genesis\'s chapter numbers did not go back to the Old Testament page it is listed on — page ' + t.PAGE().stuff + ', the list is ' + at('ot'));
  }

  /* GENESIS AGAIN: HELD FOR THE VISIT, SO NOT FETCHED TWICE. */
  t.goPage('stuff', first + 1);
  await wait(30);
  const n0 = ofBible(a.gets).length;
  await press('[data-do="bible-book"][data-n="1"]', 'Genesis again');
  if (ofBible(a.gets).length !== n0) bad.push('opening Genesis a second time fetched it again — the book is not held for the visit');
  if (t.PAGE().stuff !== at('bk')) bad.push('opening Genesis a second time did not turn to its chapter numbers');

  /* THE NEW TESTAMENT, WHERE IT ALWAYS IS: the lists do not move when a book opens, so it is the page
     after the two Old Testament ones with Genesis open as with nothing. */
  if (w.pageParts_(x).indexOf('nt') !== 3) bad.push('with Genesis open the New Testament is page ' + w.pageParts_(x).indexOf('nt') + ' of the Bible, not 3 — a book is standing between the lists');
  t.goPage('stuff', first + 3);
  await wait(30);
  await press('[data-do="bible-book"][data-n="40"]', 'Matthew');
  const mp = w.pageParts_(x);
  if (JSON.stringify(mp.slice(0, 5)) !== JSON.stringify(LISTS.concat(['bk']))) bad.push('with Matthew open the Bible is pages ' + JSON.stringify(mp.slice(0, 6)) + ' — not the three lists and then Matthew');
  if (mp.filter(p => /^c\d+$/.test(p || '')).length !== 28) bad.push('Matthew has ' + mp.filter(p => /^c\d+$/.test(p || '')).length + ' chapters\' first pages, not 28');
  if (t.PAGE().stuff !== first + mp.indexOf('bk')) bad.push('pressing Matthew did not turn to its chapter numbers');
  if (!box(w.stuffPart_(x, 'bk')).querySelector('[data-do="bible-to"][data-to="nt"]')) bad.push('Matthew\'s chapter numbers have no tile back to the New Testament');

  /* PSALMS, WHOSE NUMBERS ARE MORE THAN ONE PAGE: a psalm goes back to the page of numbers it is on,
     not the first. With no layout to measure (jsdom) a page offers `BIBLE_GRID` numbers — three pages
     of fifty — so Psalm 119 is on the third. On a phone the pages are the measured pane's rows. */
  t.goPage('stuff', first + 2);
  await wait(30);
  await press('[data-do="bible-book"][data-n="19"]', 'Psalms');
  const pp = w.pageParts_(x);
  const grids = pp.filter(p => /^bk/.test(p || ''));
  if (grids.length < 2) bad.push('Psalms has ' + grids.length + ' page(s) of chapter numbers — the many-page grid was NOT checked');
  else {
    const holding = grids.find(g => box(w.stuffPart_(x, g)).querySelector('[data-do="bible-ch"][data-ch="119"]'));
    const back = box(w.stuffPart_(x, 'c119')).querySelector('[data-do="bible-to"]');
    if (!holding || !back || back.getAttribute('data-to') !== holding) bad.push('Psalm 119\'s tile goes back to ' + (back && back.getAttribute('data-to')) + ', not ' + holding + ', the page of numbers it is on');
    if (grids.some(g => !box(w.stuffPart_(x, g)).querySelector('[data-do="bible-to"][data-to="ot2"]'))) bad.push('a page of Psalms\'s numbers has no tile back to the second Old Testament page, where Psalms is listed');
  }

  /* A BOOK THAT DOES NOT COME: said on the list, a toast, and the open book kept. */
  refuse.add('03-leviticus.json');
  t.goPage('stuff', first + 1);
  await wait(30);
  await press('[data-do="bible-book"][data-n="3"]', 'Leviticus');
  await wait(60);
  if (t.BIBLE().open !== 19) bad.push('a book that failed to arrive changed the open book to ' + t.BIBLE().open);
  const miss = d.querySelector('#s-stuff .bb-toc.is-ot .bb-miss');
  if (!miss || !/Leviticus/.test(miss.textContent)) bad.push('a book that failed to arrive is not said on the Old Testament page');
  const toastEl = d.getElementById('toast');
  if (!toastEl || !/Leviticus/.test(toastEl.textContent)) bad.push('a book that failed to arrive raised no toast naming it');
  if (a.errs.length) bad.push('errors while reading: ' + a.errs.slice(0, 3).join(' | '));

  /* THE BOOK NAMES ARE IN THE SEARCH, learned when the index landed. */
  t.STUFF().filters = []; t.STUFF().q = 'psalms';
  if (!w.stuffFiltered().some(i => i.kind === 'bible')) bad.push('typing "psalms" does not find the Bible — the book names are not in its haystack');
  t.STUFF().q = '';
  /* AND WHEN THE INDEX LANDS AFTER FIND WAS BUILT — held back here until the payload is in and the list
     made, which is the slow-network order. A search typed while it was on its way must not keep its
     answer once it lands. */
  let release = null;
  const late = new Promise(r => { release = r; });
  const slow = boot({ payload: base(), before: seed(admin),
                      serve: url => (/data\/bible\/index\.json/.test(url) ? late.then(() => serve(url)) : serve(url)) });
  await wait(300);
  const st = slow.w.__t;
  st.go('stuff');
  st.STUFF().filters = []; st.STUFF().q = 'psalms';
  const early = slow.w.stuffFiltered().some(i => i.kind === 'bible');
  release();
  await wait(60);
  if (early) bad.push('"psalms" found the Bible before its index arrived — the late-index case was not reached, so it is NOT checked');
  else if (!slow.w.stuffFiltered().some(i => i.kind === 'bible')) bad.push('typing "psalms" while the index was on its way still misses the Bible after it lands — the cached search was not told');
  st.STUFF().q = '';

  /* AND NOT BEFORE THE LIBRARY. With `data/questions.json` still on its way an admin's Find has to say
     the questions are still coming — the Bible stands on shelves that arrive with the library, and on
     its own it turned that sentence into a funnel of one book. The library is held back for good here,
     which is the slow phone frozen at its worst moment. */
  const held = boot({ payload: base(), before: seed(admin),
                      serve: url => (/data\/questions\.json/.test(url) ? new Promise(() => {}) : serve(url)) });
  await wait(300);
  held.w.__t.go('stuff');
  held.w.__t.STUFF().filters = []; held.w.__t.STUFF().q = '';
  held.w.paintStuff();
  if (held.w.stuffItemsAll_().some(i => i.kind === 'bible')) bad.push('an admin is offered the Bible before the library has landed');
  if (!/still coming/.test((held.w.document.getElementById('s-stuff') || {}).textContent || '')) {
    bad.push('an admin\'s Find with the library still on its way does not say the questions are still coming');
  }

  /* KEPT: the star puts the cover and all three lists on Saved. */
  const fav = box(w.stuffCard(x)).querySelector('[data-do="fav"]');
  if (!fav) bad.push('the Bible cover has no Save tile');
  else {
    t.ACTIONS.fav(fav);
    const saved = t.savedPages().join('');
    if (!/card fc prac bible/.test(saved) || !/data-bb="ot"/.test(saved) || !/data-bb="ot2"/.test(saved) || !/data-bb="nt"/.test(saved)) bad.push('the Bible was starred and Saved does not draw its cover and all three lists of books');
  }

  /* ---------- AND SIGNING OUT FROM INSIDE IT LEAVES NOTHING OF IT ------------------------------------
     FOUND BY THE REVIEW: an admin signed out on the Books shelf left "WHAT KIND Resources ✕ SHELF
     Books ✕" and "Nothing matches" on the signed-out Find — the name of the shelf only an admin is
     shown, on the screen of whoever picks the phone up next. Signed out from the reader as a finger
     would, on Genesis 1, with the search box holding a word too. */
  t.go('stuff');
  t.STUFF().q = 'genesis';
  t.STUFF().filters = [{ field: 'kindLabel', value: 'Resources' }, { field: 'shelf', value: 'Books' }];
  w.paintStuff();
  /* TYPED, as a finger types: `paintStuff` never rewrites the box, so the word goes in by hand. */
  const qBox = d.getElementById('stuff-q');
  if (!qBox) bad.push('there is no search box on Find, so whether its word is left behind was NOT checked');
  else qBox.value = 'genesis';
  if (!t.ACTIONS.signout) bad.push('there is no signout action to press, so signing out from the Bible was NOT checked');
  else {
    t.ACTIONS.signout(d.createElement('button'));
    await wait(60);
    t.go('stuff');
    await wait(30);
    if (t.whoami()) bad.push('pressing sign out left somebody signed in, so what it leaves behind was NOT checked');
    const f = t.STUFF().filters, said = (d.getElementById('s-stuff') || {}).textContent || '';
    if (f.length || t.STUFF().q) bad.push('signed out, Find still holds the admin\'s question: ' + JSON.stringify(f) + (t.STUFF().q ? ' and "' + t.STUFF().q + '"' : ''));
    if (/\bBooks\b/.test(said)) bad.push('signed out, Find still names the Books shelf: …' + said.slice(Math.max(0, said.indexOf('Books') - 60), said.indexOf('Books') + 20).replace(/\s+/g, ' '));
    if (d.querySelector('#s-stuff .card.bible')) bad.push('signed out, a Bible card is still drawn on Find');
    if (d.getElementById('stuff-q') && d.getElementById('stuff-q').value) bad.push('signed out, the search box still holds "' + d.getElementById('stuff-q').value + '"');
  }
  return bad;
});

/* ---------- EVERY FIND KIND THAT IS NOT A QUESTION IS BUILT FROM THE SAME FIVE PARTS ----------------
   *"didn't I ask you to sleekerise the whole widget system in the finder for questions and so on?"*
   The answer was one set of parts — `.fc-head` (title and flags), `.fc-kick` (whose page this is),
   `.fc-meta`, `.fc-sec`, `.fc-list` — and every kind moved onto it: the boxer off the shop's `.thing`
   row, the fight off a bare paragraph of names, the film's Watch
   tile out of a second tile row inside the card.

   ASKED OF THE MARKUP, OVER THE REAL FILES THROUGH THE REAL MAPPER, so a kind added tomorrow with a
   card of its own shape is named here by kind. What it LOOKS like is `check/states.js`'s question
   (the boxer, fight and textbook states measure the title size, the flag above the title, and the
   list's indent in a real browser); this is whether every kind is made of the same pieces:

     - the card is `.card.fc`, and its first child is ONE `.fc-head` holding an `h3` and its flags;
     - every page after it is `.card.fc` whose first child is the `.fc-kick` and whose second is
       the page's `h3` — except a picture page, which is the picture;
     - no shop row (`.thing`), no inline style, no loose `p.note`, and no tile row
       INSIDE a card: the tiles are the row under it, one row, which `stuffCard` adds;
     - every numbered list is an `.fc-list`, which is what gives `10.` its room. */
check('every Find kind that is not a question is made of the shared parts: head, kicker, meta, section, list', async () => {
  const read = n => JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8'));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the cards were NOT checked — not a pass'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
    { textbooks: read('textbooks'), boxers: read('boxers'), fights: read('fights'), projects: read('projects'),
      practicals: read('practicals') })));
  const p = payload();
  ['textbooks', 'boxers', 'fights', 'projects', 'practicals'].forEach(k => { p[k] = made[k] || []; });
  /* THE FILMS ARE THE FIXTURE'S THREE INVENTED ROWS, shaped as `doGet` sends an admin them — a long
     title, a series, and a placeholder with no file, the three ways the card is drawn. */
  p.films = JSON.parse(fs.readFileSync(path.join(dir, '..', 'check', 'fixture.json'), 'utf8')).films || [];
  const { w } = boot({ payload: p });
  await wait(300);
  const bad = [];
  const box = html => { const d = w.document.createElement('div'); d.innerHTML = html; return d; };
  const all = w.stuffItemsAll_();
  /* THE CARD'S OWN MARKUP, NOT A DRAWING'S. A practical's diagram is hand-written SVG and some of it
     carries a `style` attribute of its own, which is the drawing's business rather than the card's. */
  const onCard = el => !el.closest('svg, figure');
  const KINDS_HERE =['practical', 'project', 'textbook', 'film', 'boxer', 'fight'];
  KINDS_HERE.forEach(kind => {
    const xs = all.filter(x => x.kind === kind);
    if (!xs.length) { bad.push('no ' + kind + ' reached Find, so its card was NOT checked'); return; }
    xs.forEach(x => {
      const name = kind + ' "' + x.name + '"';
      const host = box(w.stuffCard(x));
      const card = host.querySelector('.favwrap > .card') || host.firstElementChild;
      if (!card || !card.classList.contains('fc')) { bad.push(name + ' is not a `.card.fc`'); return; }
      const head = card.firstElementChild;
      if (!head || !head.classList.contains('fc-head')) bad.push(name + ' does not open on `.fc-head`');
      else if (!head.querySelector(':scope > h3') || !head.querySelector(':scope > .fc-flags > .fc-flag')) {
        bad.push(name + '\'s head is not a title and its flags');
      }
      if (card.querySelectorAll('.fc-head').length !== 1) bad.push(name + ' has ' + card.querySelectorAll('.fc-head').length + ' heads');
      const stray = ['.thing', '[style]', 'p.note', '.tile-row'].filter(sel => [...card.querySelectorAll(sel)].some(onCard));
      if (stray.length) bad.push(name + ' carries ' + stray.join(', ') + ' inside the card');
      const pages = w.pageParts_(x).filter(Boolean).map(part => ({ part, el: box(w.stuffPart_(x, part)).firstElementChild }));
      pages.forEach(({ part, el }) => {
        if (!el) { bad.push(name + ' page ' + part + ' drew nothing'); return; }
        if (!el.classList.contains('fc')) bad.push(name + ' page ' + part + ' is not a `.card.fc`');
        const k = el.firstElementChild, h = k && k.nextElementSibling;
        if (!k || !k.classList.contains('fc-kick') || !h || h.tagName !== 'H3') {
          bad.push(name + ' page ' + part + ' does not open on its kicker and then its title');
        }
        if ([...el.querySelectorAll('[style], p.note, .thing')].some(onCard)) bad.push(name + ' page ' + part + ' carries a stray shape');
      });
      [card].concat(pages.map(pg => pg.el).filter(Boolean)).forEach(el => {
        el.querySelectorAll('ol').forEach(ol => {
          if (!ol.classList.contains('fc-list')) bad.push(name + ' has a numbered list that is not an `.fc-list`');
        });
      });
      if (kind === 'film' && !x.row.placeholder) {
        const row = host.querySelector(':scope > .tile-row');
        if (!row || !row.querySelector('a.tile[href]')) bad.push(name + '\'s Watch tile is not in the row under the card');
      }
    });
  });
  return bad.length > 12 ? bad.slice(0, 12).concat(['… and ' + (bad.length - 12) + ' more']) : bad;
});

/* ==================================================================================================
   THE FIGHTER'S PROFILE — FOUR JOURNEYS OVER THE REAL FILES
   ASKED FOR AS *"refine the boxers widget. maybe add image of each boxer. and make it look nicer.
   the wins losses etc."* Each is the claim the card makes, asked of the markup the app draws from
   `data/boxers.json` and `data/fights.json` through the real mapper — so a cell edited tomorrow is
   checked tomorrow, and a fixture cannot drift from what ships.

     a photo        Ali (the one row with one): an `<img>` with his name as its alt, the credit from
                    the row under it word for word, the record's three numbers as the row says, the
                    KOs under the wins, none under the losses (that cell is blank), and a bar whose
                    segments add up to 100 exactly.
     no photo       Joe Louis: the ring placeholder with his initials, and no `<img>` and no credit
                    anywhere on the card — a placeholder is not a broken picture. With them, the two
                    rows the licence rule and the blank rule turn on: an address with NO credit draws
                    the placeholder, and a fighter with no record says so instead of `0-0-0`.
     a broken URL   an address that fails: the `<img>` goes, the placeholder and nothing else is left,
                    the credit goes with it, and drawing the card again does not ask for it again.
     the bouts      Ali's fights page: one line per bout he is in, counted from the file by id rather
                    than by the function under test, newest first, the right opponent and the right
                    letter for each — and the fight card's two faces, the winner's framed.
================================================================================================== */
const boxerApp_ = async (edit) => {
  const read = n => JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8'));
  const raw = { boxers: read('boxers'), fights: read('fights') };
  if (edit) edit(raw);
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return { fail: 'libraryExtras_ is not reachable, so the boxers were NOT checked — not a pass' };
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, raw)));
  if (!(made.boxers || []).length) return { fail: 'the mapper made no boxers of data/boxers.json — NOT a pass' };
  const p = payload();
  p.boxers = made.boxers; p.fights = made.fights || [];
  const { w, errs } = boot({ payload: p });
  await wait(300);
  const item = name => w.stuffItemsAll_().find(x => x.kind === 'boxer' && x.name === name);
  const draw = html => { const d = w.document.createElement('div'); d.innerHTML = html; w.document.body.appendChild(d); return d; };
  return { w, errs, raw, made, item, draw };
};

check('a boxer with a photo: the picture, its credit, the record and a bar that adds up to 100', async () => {
  const a = await boxerApp_();
  if (a.fail) return [a.fail];
  const bad = [];
  const row = a.raw.boxers.find(b => b.name === 'Muhammad Ali');
  if (!row || !row.image) return ['data/boxers.json has no Muhammad Ali with a photo — this journey has nothing to look at'];
  const x = a.item('Muhammad Ali');
  if (!x) return ['Muhammad Ali is not in Find'];
  const card = a.draw(a.w.stuffCard(x)).querySelector('.card.fc.boxer');
  if (!card) return ['Ali\'s card is not a `.card.fc.boxer`'];
  const img = card.querySelector('.boxer-pic img.boxer-img');
  if (!img) bad.push('no <img> on the card of the one boxer with a photo');
  else {
    if (img.getAttribute('src') !== row.image) bad.push('the <img> points at ' + img.getAttribute('src') + ', not the row\'s image');
    if (img.getAttribute('alt') !== row.name) bad.push('the photo\'s alt is "' + img.getAttribute('alt') + '", not his name');
    if (img.getAttribute('loading') !== 'lazy') bad.push('the photo is not lazy-loaded');
  }
  /* THE CREDIT IS THE LINE STRAIGHT AFTER THE PHOTO — across the card under it rather than a caption
     in its narrow column (see `boxerPic_`), so it is asked for as the photo's next sibling. */
  const credit = card.querySelector('.boxer-pic + .boxer-credit');
  if (!credit || credit.textContent.trim() !== row.image_credit.trim()) bad.push('the credit under the photo is "' + (credit ? credit.textContent.trim() : 'missing') + '", not the row\'s "' + row.image_credit + '"');
  /* ---------- AND THE CREDIT IS A LINK TO THE PHOTO'S OWN FILE PAGE --------------------------------
     A CC BY or CC BY-SA photo is free on condition that its credit links to where the work and its
     licence can be read, so every Commons picture's credit is that link — the file page, named from
     the address's own file name (the thumbnail's size prefix is not part of it). Asked of the row's
     address by this check's own reading, so a wrong derivation in the app cannot agree with itself. */
  const file = (row.image.match(/\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)/) || [])[1];
  const link = credit && credit.querySelector('a.boxer-src');
  if (!file) bad.push('Ali\'s image is not a Commons upload address, so the link rule was NOT checked: ' + row.image);
  else if (!link) bad.push('the credit under a Commons photo is not a link to its file page');
  else {
    if (link.getAttribute('href') !== 'https://commons.wikimedia.org/wiki/File:' + file) bad.push('the credit links to ' + link.getAttribute('href') + ', not the file page File:' + file);
    if (link.getAttribute('target') !== '_blank' || !/noopener/.test(link.getAttribute('rel') || '')) bad.push('the credit link does not open outside the app with rel=noopener');
  }
  const flink = (() => {
    const t = a.w.stuffItemsAll_().find(i => i.kind === 'fight' && i.row.aId === row.boxer_id);
    const fcard = t && a.draw(a.w.stuffCard(t));
    return fcard && fcard.querySelector('.fight-credit a.boxer-src');
  })();
  if (file && (!flink || flink.getAttribute('href') !== 'https://commons.wikimedia.org/wiki/File:' + file)) bad.push('a fight card with Ali\'s face does not link his credit to the same file page');
  /* THE NUMBERS, AS THE ROW SAYS THEM. */
  const num = k => { const el = card.querySelector('.boxer-tally .boxer-n.is-' + k + ' b'); return el ? el.textContent.trim() : null; };
  [['w', 'wins'], ['l', 'losses'], ['d', 'draws']].forEach(([k, col]) => {
    if (num(k) !== String(Number(row[col]))) bad.push('the ' + col + ' column reads ' + num(k) + ', the row says ' + row[col]);
  });
  const ko = card.querySelector('.boxer-n.is-w .boxer-ko');
  if (!ko || ko.textContent.trim() !== row.wins_ko + ' KO') bad.push('under the wins: "' + (ko ? ko.textContent.trim() : 'nothing') + '", not "' + row.wins_ko + ' KO"');
  if (String(row.losses_ko).trim() === '' && card.querySelector('.boxer-n.is-l .boxer-ko')) bad.push('a KO count is printed under the losses and that cell is blank — "0 KO" is a claim nobody made');
  if (!card.querySelector('.boxer-rec')) bad.push('the record has lost the `.boxer-rec` name the textbook state looks for');
  const rate = Math.round(Number(row.wins_ko) / Number(row.wins) * 100);
  if (!new RegExp('KO rate ' + rate + '%').test((card.querySelector('.boxer-line') || {}).textContent || '')) bad.push('the KO rate is not ' + rate + '%');
  /* THE BAR ADDS UP TO A HUNDRED, and each segment is its share. */
  const rects = [...card.querySelectorAll('svg.boxer-bar rect')];
  const total = rects.reduce((s, r) => s + Number(r.getAttribute('width')), 0);
  if (!rects.length) bad.push('no record bar');
  else if (Math.abs(total - 100) > 0.001) bad.push('the bar\'s segments add up to ' + total + ', not 100');
  const all = Number(row.wins) + Number(row.losses) + Number(row.draws) + Number(row.no_contests || 0);
  const wr = rects.find(r => r.getAttribute('class') === 'is-w');
  if (wr && Math.abs(Number(wr.getAttribute('width')) - Number(row.wins) / all * 100) > 0.01) bad.push('the win segment is ' + wr.getAttribute('width') + '%, his wins are ' + (Number(row.wins) / all * 100).toFixed(2) + '%');
  /* THE TAPE ONLY HAS ROWS WITH SOMETHING IN THEM, and the reach is the row's. */
  const tape = [...card.querySelectorAll('.boxer-tape dt')].map(d => d.textContent.trim());
  if (row.reach_cm && tape.indexOf('Reach') < 0) bad.push('the tape has no Reach row and the row has ' + row.reach_cm);
  if (card.querySelectorAll('.boxer-tape dd:empty').length) bad.push('the tape draws an empty value');
  /* AND THE ACTIONS ARE TILES UNDER THE CARD — the star's row with a Highlights link in it. */
  const host = a.draw(a.w.stuffCard(x));
  const hl = host.querySelector(':scope > .tile-row a.tile[href*="youtube.com"]');
  if (!hl) bad.push('no Highlights tile in the row under the card');
  else if (hl.getAttribute('target') !== '_blank') bad.push('the Highlights tile does not open somewhere else');
  if (a.errs.length) bad.push('errors: ' + a.errs.join(' | '));
  return bad;
});

check('a boxer without a photo: the ring and his initials, no <img>; no credit means no photo; no record says so', async () => {
  const a = await boxerApp_(raw => {
    /* TWO ROWS EDITED IN THE COPY, never the file: a photo address with its credit taken away, which
       the licence rule must refuse to draw. */
    const g = raw.boxers.find(b => b.name === 'George Foreman');
    if (g) { g.image = 'https://upload.wikimedia.org/wikipedia/commons/x/xx/Foreman.jpg'; g.image_credit = ''; }
    /* AND JOE LOUIS WITH NO PHOTO, IN THE COPY. He was the no-photo boxer by accident of the file;
       when the photographs arrived he had one, and the journey stopped testing the placeholder at all.
       So the case is made here rather than found in the data. */
    const jl = raw.boxers.find(b => b.name === 'Joe Louis');
    if (jl) { jl.image = ''; jl.image_credit = ''; }
  });
  if (a.fail) return [a.fail];
  const bad = [];
  const x = a.item('Joe Louis');
  if (!x) return ['Joe Louis is not in Find'];
  if (x.row.image) return ['Joe Louis has a photo now — pick another boxer for the no-photo journey'];
  const card = a.draw(a.w.stuffCard(x)).querySelector('.card.fc.boxer');
  const fig = card && card.querySelector('.boxer-pic');
  if (!fig) return ['no picture box on a boxer with no photo — the placeholder was not drawn'];
  if (!fig.classList.contains('is-none')) bad.push('the picture box is not marked as the placeholder');
  if (card.querySelector('img')) bad.push('an <img> is on the card of a boxer with no photo');
  if (card.querySelector('.boxer-credit')) bad.push('a credit is on the card and there is no photo to credit');
  const ring = fig.querySelector('svg.boxer-ring');
  if (!ring) bad.push('no ring drawn in the placeholder');
  else {
    const ini = ring.querySelector('.boxer-ini');
    if (!ini || ini.textContent.trim() !== 'JL') bad.push('the placeholder\'s initials are "' + (ini ? ini.textContent : '') + '", not JL');
    if (!ring.querySelector('.bx-l .bx-glove')) bad.push('the placeholder has no fighter in it');
  }
  /* A `Jr.` IS NOT A SURNAME — the placeholder for Floyd Mayweather Jr. says FM. */
  const fm = a.item('Floyd Mayweather Jr.');
  const fmi = fm && a.draw(a.w.stuffCard(fm)).querySelector('.boxer-ini');
  if (fm && (!fmi || fmi.textContent.trim() !== 'FM')) bad.push('Floyd Mayweather Jr.\'s initials are "' + (fmi ? fmi.textContent : '') + '", not FM');
  /* AND A SURNAME CAN START WITH A PARTICLE — Oscar De La Hoya is OD, not OH. Asked of the function
     too, for the particle names the file does not hold yet, and for a particle that is a FIRST name. */
  const odl = a.item('Oscar De La Hoya');
  const odi = odl && a.draw(a.w.stuffCard(odl)).querySelector('.boxer-ini');
  if (!odl) bad.push('Oscar De La Hoya is not in Find, so the particle rule was NOT checked on a real row');
  else if (!odi || odi.textContent.trim() !== 'OD') bad.push('Oscar De La Hoya\'s initials are "' + (odi ? odi.textContent : '') + '", not OD');
  [['Ingemar Van Der Berg', 'IV'], ['Joe Von Rosen Jr.', 'JV'], ['De Wayne Smith', 'DS'], ['Juan Manuel Marquez', 'JM']].forEach(([n, i]) => {
    if (a.w.boxerInitials_(n) !== i) bad.push('"' + n + '" gives initials ' + a.w.boxerInitials_(n) + ', not ' + i);
  });
  /* AN ADDRESS WITH NO CREDIT IS NOT DRAWN. */
  const g = a.item('George Foreman');
  const gc = g && a.draw(a.w.stuffCard(g)).querySelector('.card.fc.boxer');
  if (!gc) bad.push('George Foreman is not in Find');
  else if (gc.querySelector('img')) bad.push('a photo with no credit was drawn — the licence makes the credit the condition of showing it');
  /* NO RECORD ON FILE IS SAID, NOT ZEROED. */
  const blank = a.raw.boxers.find(b => String(b.wins).trim() === '' && String(b.losses).trim() === '');
  const bx = blank && a.item(blank.name);
  if (!bx) bad.push('no boxer with a blank record reached Find, so that case was NOT checked');
  else {
    const bc = a.draw(a.w.stuffCard(bx)).querySelector('.card.fc.boxer');
    if (bc.querySelector('.boxer-tally')) bad.push(blank.name + ' has no record in the file and the card drew a scoreboard: ' + bc.querySelector('.boxer-tally').textContent.replace(/\s+/g, ' '));
    if (!/No fight record on file/.test(bc.textContent)) bad.push(blank.name + '\'s card does not say there is no record on file');
  }
  if (a.errs.length) bad.push('errors: ' + a.errs.join(' | '));
  return bad;
});

check('a boxer photo that will not load falls back to the ring, takes its credit, and is not asked for again', async () => {
  const BROKEN = 'https://example.invalid/no-such-boxer.jpg';
  const a = await boxerApp_(raw => {
    const ali = raw.boxers.find(b => b.name === 'Muhammad Ali');
    if (ali) { ali.image = BROKEN; ali.image_credit = ali.image_credit || 'Photo: test'; }
  });
  if (a.fail) return [a.fail];
  const bad = [];
  const x = a.item('Muhammad Ali');
  if (!x) return ['Muhammad Ali is not in Find'];
  const host = a.draw(a.w.stuffCard(x));
  const img = host.querySelector('img.boxer-img');
  if (!img) return ['the card drew no <img> for the broken address, so the fallback was NOT exercised'];
  /* THE BROWSER'S OWN SIGNAL. `error` does not bubble; the app listens for it in the capture phase on
     the document, which is the only place a failure on any card can be heard. */
  img.dispatchEvent(new a.w.Event('error'));
  const fig = host.querySelector('.boxer-pic');
  if (host.querySelector('img.boxer-img')) bad.push('the <img> is still on the card after it failed — a broken picture');
  if (!fig || !fig.classList.contains('is-none')) bad.push('the picture box did not fall back to the placeholder');
  if (!fig || !fig.querySelector('svg.boxer-ring .boxer-ini')) bad.push('the ring is not there to fall back to');
  if (host.querySelector('.boxer-credit')) bad.push('the credit stayed under a picture nobody can see');
  /* AND A REPAINT DOES NOT PUT IT BACK, which would flicker the ring behind a picture never coming. */
  const again = a.draw(a.w.stuffCard(x));
  if (again.querySelector('img.boxer-img')) bad.push('drawing the card again asked for the address that already failed');
  if (a.errs.length) bad.push('errors: ' + a.errs.join(' | '));
  return bad;
});

check('a boxer\'s fights: every bout they are in, newest first, from their side — and the fight card\'s two faces', async () => {
  /* FRAZIER WITHOUT HIS PHOTO, IN THE COPY, so the blue corner's placeholder is tested whatever the
     file holds -- the same reason Joe Louis is made photo-less in the journey above. */
  const a = await boxerApp_(raw => {
    const jf = raw.boxers.find(b => b.name === 'Joe Frazier');
    if (jf) { jf.image = ''; jf.image_credit = ''; }
  });
  if (a.fail) return [a.fail];
  const bad = [];
  const x = a.item('Muhammad Ali');
  if (!x) return ['Muhammad Ali is not in Find'];
  const id = a.raw.boxers.find(b => b.name === 'Muhammad Ali').boxer_id;
  /* COUNTED FROM THE FILE, BY ID, not by the function being checked. */
  const his = a.raw.fights.filter(f => f.boxer_a_id === id || f.boxer_b_id === id)
    .sort((p, q) => String(q.date).localeCompare(String(p.date)));
  if (!his.length) return ['data/fights.json has no bout with Ali\'s id — nothing to check'];
  /* ---------- SEVEN BOUTS A PAGE, AS MANY PAGES AS THAT TAKES --------------------------------------
     ONE PAGE OF FOURTEEN WAS DRAWN AT 70% ON A 320x568 PHONE — the floor, with the date line at six
     pixels — so the bouts are paged (`boxerFightPages_`). Asked of the file's count, not of the
     function's: fourteen bouts are two pages, every page but the last is full, the names he beat
     and lost to are on the first page only, each page's heading says which bouts it holds, and the
     pages read in order are every bout once, newest first. */
  const PER = 7;
  const wantParts = [null].concat(Array.from({ length: Math.ceil(his.length / PER) }, (_, i) => i ? 'fights' + (i + 1) : 'fights'));
  const parts = a.w.pageParts_(x);
  if (JSON.stringify(parts) !== JSON.stringify(wantParts)) bad.push('Ali\'s pages are ' + JSON.stringify(parts) + ', not his card and ' + (wantParts.length - 1) + ' pages of fights for his ' + his.length + ' bouts');
  const pgs = parts.filter(Boolean).map(part => a.draw(a.w.stuffPart_(x, part)).firstElementChild);
  const pg = pgs[0];
  if (!pg || !pg.classList.contains('fc')) return bad.concat(['the fights page is not a `.card.fc`']);
  pgs.forEach((p, i) => {
    const k = p && p.firstElementChild, h = k && k.nextElementSibling;
    if (!k || !k.classList.contains('fc-kick') || k.textContent.trim() !== 'Muhammad Ali' || !h || h.tagName !== 'H3') bad.push('fights page ' + (i + 1) + ' does not open on his name and then its title');
    const n = p ? p.querySelectorAll('.boxer-bouts li').length : 0;
    if (n > PER) bad.push('fights page ' + (i + 1) + ' holds ' + n + ' bouts — more than ' + PER + ' is past what a 320x568 pane shows at full size');
    if (i < pgs.length - 1 && n !== PER) bad.push('fights page ' + (i + 1) + ' holds ' + n + ' bouts and is not the last — a short page in the middle');
    const from = i * PER + 1, to = Math.min(his.length, (i + 1) * PER);
    const h4 = p && p.querySelector('.boxer-bouts h4');
    if (!h4 || h4.textContent.indexOf(from + '–' + to + ' of ' + his.length) < 0) bad.push('fights page ' + (i + 1) + '\'s heading is "' + (h4 ? h4.textContent : '') + '", not bouts ' + from + '–' + to + ' of ' + his.length);
    if (i > 0 && p && p.querySelector('.boxer-notable')) bad.push('fights page ' + (i + 1) + ' repeats who he beat — that is the first page\'s');
  });
  if (!pg.querySelector('.boxer-notable')) bad.push('the first fights page has lost who he beat and who beat him');
  const lis = pgs.reduce((all, p) => all.concat(p ? [...p.querySelectorAll('.boxer-bouts li')] : []), []);
  if (lis.length !== his.length) bad.push('the pages list ' + lis.length + ' bouts; the file has ' + his.length + ' with his id');
  lis.forEach((li, i) => {
    const f = his[i];
    if (!f) return;
    const opp = f.boxer_a_id === id ? f.boxer_b : f.boxer_a;
    const want = f.winner_id ? (f.winner_id === id ? 'W' : 'L')
      : f.winner ? (f.winner === 'Muhammad Ali' ? 'W' : 'L') : 'D';
    const got = (li.querySelector('.boxer-res') || {}).textContent;
    const name = (li.querySelector('.boxer-opp') || {}).textContent;
    if (name !== opp) bad.push('bout ' + (i + 1) + ' (' + f.date + ') names "' + name + '", the other corner is "' + opp + '"');
    if (got !== want) bad.push('bout ' + (i + 1) + ' against ' + opp + ' on ' + f.date + ' is marked ' + got + ', the file says ' + want);
    if (!li.classList.contains('is-' + want.toLowerCase())) bad.push('bout ' + (i + 1) + ' is not coloured as a ' + want);
    const how = (li.querySelector('.boxer-how') || {}).textContent || '';
    if (f.method && how.indexOf(f.method) !== 0) bad.push('bout ' + (i + 1) + ' does not say how it ended (' + f.method + '): "' + how + '"');
    /* THE RESULT IN WORDS FOR A SCREEN READER, the letter hidden from it. An `aria-label` on a bare
       span is ignored by most readers, so the word has to be text they read. */
    const say = (li.querySelector('.boxer-say') || {}).textContent || '';
    const word = { W: 'Won', L: 'Lost', D: 'Drew', NC: 'No contest' }[want];
    if (say.trim().replace(/,$/, '') !== word) bad.push('bout ' + (i + 1) + ' says "' + say + '" to a screen reader, not "' + word + '"');
    const sq = li.querySelector('.boxer-res');
    if (sq && (sq.getAttribute('aria-hidden') !== 'true' || sq.hasAttribute('aria-label'))) bad.push('bout ' + (i + 1) + '\'s letter square is read out as well as the word');
  });
  /* A FIGHTER WITH NOTHING FOR THAT PAGE HAS NO SUCH PAGE. */
  const none = a.made.boxers.find(b => !a.w.boxerHasFights_(b));
  const nx = none && a.item(none.name);
  if (nx && a.w.pageParts_(nx).length !== 1) bad.push(none.name + ' has no fights on file and still gets a fights page');
  /* THE FIGHT CARD: BOTH FACES, THE WINNER'S FRAMED, AND THE CREDIT FOR THE ONE PHOTO. */
  const thrilla = a.w.stuffItemsAll_().find(i => i.kind === 'fight' && i.row.a === 'Muhammad Ali' && i.row.date === '1975-10-01');
  if (!thrilla) bad.push('the Thrilla in Manila is not in Find');
  else {
    const fc = a.draw(a.w.stuffCard(thrilla)).querySelector('.card.fc.fight');
    const faces = fc ? [...fc.querySelectorAll('.fight-faces .boxer-pic')] : [];
    if (faces.length !== 2) bad.push('the fight card has ' + faces.length + ' faces, not 2');
    else {
      if (!faces[0].classList.contains('won') || faces[1].classList.contains('won')) bad.push('the winner\'s face is not the one framed');
      if (!faces[0].querySelector('img')) bad.push('Ali\'s photo is not on the fight card');
      if (faces[1].querySelector('img') || !faces[1].querySelector('.bx-r')) bad.push('Frazier, who has no photo, is not the blue-corner placeholder');
    }
    const cr = fc && fc.querySelector('.fight-credit');
    if (!cr || cr.textContent.indexOf('Ira Rosenberg') < 0) bad.push('the fight card shows Ali\'s photo without its credit');
    /* THE SAME DATE HIS PAGE PRINTS — `1 Oct 1975`, not the cell's `1975-10-01`. */
    const sub = fc && fc.querySelector('.sub');
    if (!sub || sub.textContent.trim().indexOf('1 Oct 1975') !== 0) bad.push('the fight card\'s date line is "' + (sub ? sub.textContent.trim() : '') + '", not the fighter\'s page\'s "1 Oct 1975 …"');
    if (sub && /\d{4}-\d{2}-\d{2}/.test(sub.textContent)) bad.push('the fight card prints an ISO date: ' + sub.textContent.trim());
  }
  if (a.errs.length) bad.push('errors: ' + a.errs.join(' | '));
  return bad;
});

/* ---------- WHAT A BOXER READS ON EVERY FIGHTER'S CARD, ALL 103 OF THEM -----------------------------
   THREE THINGS THE REVIEW FOUND BY READING THE CARDS AS A BOXER WOULD, each asked of every row in the
   file rather than of one example, because each was a fault on some rows and not others:

     the editor's to-do   "ACTIVE — record needs checking" was printed under Usyk's 24-0, and four
                          more like it. A note that says check or checking is the editor's and is not
                          drawn; EVERY OTHER NOTE IS — "Exhibition bouts excluded" qualifies a record
                          and belongs under it, so hiding too much is as red as hiding too little.
     Titles, or Honours   a section headed Titles with only a Hall of Fame badge under it told a boxer
                          that Tyson never won a belt. The heading is Titles exactly when the row
                          names one, Honours when it holds only an honour, and no section at all
                          when it holds neither.
     the weights          Pacquiao's eight divisions were six lines of the tape. Four or more are the
                          count and the lightest and heaviest; three or fewer are listed. */
check('every fighter\'s card: no note to the editor, Titles only over a title, many weights in one line', async () => {
  const a = await boxerApp_();
  if (a.fail) return [a.fail];
  const bad = [];
  const EDITOR = /\bcheck(ing)?\b/i;
  let editor = 0, shown = 0, honours = 0, titled = 0, folded = 0;
  a.raw.boxers.forEach(row => {
    const x = a.item(row.name);
    if (!x) { bad.push(row.boxer_id + ' ' + row.name + ' is not in Find'); return; }
    const card = a.draw(a.w.stuffCard(x)).querySelector('.card.fc.boxer');
    if (!card) { bad.push(row.name + ' drew no boxer card'); return; }
    const text = card.textContent.replace(/\s+/g, ' ');
    const note = String(row.notes || '').trim();
    if (note && EDITOR.test(note)) {
      editor++;
      if (text.indexOf(note) >= 0) bad.push(row.name + '\'s card prints the editor\'s note "' + note + '"');
    } else if (note) {
      shown++;
      /* ONLY WHERE THERE IS A RECORD TO QUALIFY: a fighter with none says so, and that is the line. */
      if (card.querySelector('.boxer-tally') && text.indexOf(note) < 0) bad.push(row.name + '\'s note "' + note + '" qualifies his record and is not on his card');
    }
    const h4 = card.querySelector('.boxer-titles h4');
    const belt = String(row.world_titles || '').trim();
    const honour = /^true$/i.test(String(row.hall_of_fame || '').trim()) || /^true$/i.test(String(row.lineal || '').trim());
    if (belt) {
      titled++;
      if (!h4 || h4.textContent.trim() !== 'Titles') bad.push(row.name + ' holds "' + belt + '" under a heading of "' + (h4 ? h4.textContent : 'nothing') + '"');
    } else if (honour) {
      honours++;
      if (!h4 || h4.textContent.trim() !== 'Honours') bad.push(row.name + ' has no belt on file and the section is headed "' + (h4 ? h4.textContent : 'nothing') + '" — Titles over no title says he never won one');
    } else if (h4) bad.push(row.name + ' has neither a belt nor an honour and still draws "' + h4.textContent + '"');
    const weights = String(row.divisions || '').split(/[|,;]/).map(s => s.trim()).filter(Boolean);
    const dd = [...card.querySelectorAll('.boxer-tape dt')].find(d => d.textContent.trim() === 'Weights');
    const val = dd ? dd.nextElementSibling.textContent.trim() : '';
    if (weights.length > 3) {
      folded++;
      const want = weights.length + ' · ' + weights[0] + ' → ' + weights[weights.length - 1];
      if (val !== want) bad.push(row.name + '\'s ' + weights.length + ' weights read "' + val + '", not "' + want + '"');
    } else if (weights.length > 1 && val !== weights.join(', ')) bad.push(row.name + '\'s ' + weights.length + ' weights read "' + val + '", not the list');
  });
  /* A RULE THAT FOUND NOTHING TO ASK IS NOT A PASS — print what each one actually looked at. */
  console.log('          editor\'s notes kept off: ' + editor + ' · notes shown: ' + shown + ' · Titles: ' + titled
    + ' · Honours: ' + honours + ' · weights folded: ' + folded);
  if (!editor) bad.push('no row carries an editor\'s note, so that rule was NOT exercised on the real file');
  if (!shown) bad.push('no row carries a note that qualifies its record, so hiding too much was NOT checked');
  if (!folded) bad.push('no row has four or more weights, so the folding was NOT checked');
  /* THE LADDER, NOT THE CELL'S ORDER, decides lightest and heaviest — asked of a cell typed out of order. */
  const out = a.w.boxerWeights_(['Heavyweight', 'Cruiserweight', 'Light Heavyweight', 'Middleweight']);
  if (out !== '4 · Middleweight → Heavyweight') bad.push('a cell typed heavy-to-light folds to "' + out + '", not "4 · Middleweight → Heavyweight"');
  if (a.errs.length) bad.push('errors: ' + a.errs.join(' | '));
  return bad;
});

/* ---------- SHARING A BOOKING HANDS OVER A PICTURE OF IT ------------------------------------------
   *"just make sure sharing booking is an identical jpg or png or whatevers best of the booking
   reciept."* It was `window.print()` — a PDF by way of the print dialogue — and this asks the three
   things the plumbing has to do, the three ways out in the order a phone takes them:

     1. a phone that can share files is handed ONE PNG FILE, the receipt's size at 2x, through
        `navigator.share` — and the SVG it was drawn from is the receipt the tile is on;
     2. a laptop that cannot share files gets a DOWNLOAD of that PNG, and is told so;
     3. a share sheet that is refused (Safari, when the picture took too long after the press) puts
        the picture in a sheet with a Share button of its own.

   JSDOM HAS NO LAYOUT AND NO CANVAS, so both are stood in for: the card's box is given a size, the
   canvas records what it is asked to draw, and an image "loads" when its source is set. What the
   picture LOOKS like is `check/share.js`'s question, in a real browser, pixel by pixel. This one is
   whether the press ends in the right place with the right file — which jsdom answers exactly. */
check('sharing a booking hands over a PNG of the receipt: share sheet, else download, else a sheet', async () => {
  const bad = [];
  const BOX = { left: 12.5, top: 30, width: 300, height: 520, right: 312.5, bottom: 550, x: 12.5, y: 30 };
  const made = [], clicks = [];
  const { w } = boot({ before: w => {
    /* AN IMAGE THAT LOADS, and a canvas that remembers its size and hands back a PNG blob. */
    w.Image = class { set src(v) { this._src = v; made.push(v); setTimeout(() => this.onload && this.onload(), 0); }
                      get src() { return this._src; } decode() { return Promise.resolve(); } };
    w.HTMLCanvasElement.prototype.getContext = function () {
      return { fillRect() {}, drawImage() {}, set fillStyle(v) {}, get fillStyle() { return ''; } };
    };
    w.HTMLCanvasElement.prototype.toBlob = function (cb, type) {
      const b = new w.Blob(['\x89PNG'], { type });
      b.__w = this.width; b.__h = this.height;
      setTimeout(() => cb(b), 0);
    };
    /* JSDOM DOES NOT DO PSEUDO-ELEMENTS and says so on the console for every element; answered with
       the element's own style, whose `content` is empty, so the clone simply adds no `::before`. */
    const gcs = w.getComputedStyle;
    w.getComputedStyle = (el, pseudo) => gcs.call(w, el);
    w.URL.createObjectURL = () => 'blob:receipt';
    w.URL.revokeObjectURL = () => {};
    w.HTMLAnchorElement.prototype.click = function () { clicks.push({ href: this.href, download: this.download }); };
  } });
  await wait(300);
  const d = w.document;
  w.__t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  try { w.__t.repaint(true); w.__t.go('booking', false, true); } catch (e) { return ['opening booking threw: ' + e.message]; }
  await wait(120);
  const rc = d.querySelector('#bookr .rc');
  if (!rc) return ['the booking form draws no .rc — nothing to share'];
  const tile = rc.querySelector('[data-do="book-share"]');
  if (!tile) return ['the receipt has no Share tile on it'];
  rc.getBoundingClientRect = () => BOX;
  const press = () => w.__t.ACTIONS['book-share'](tile);

  /* ---------- 1. A PHONE: ONE PNG FILE, TO THE SHARE SHEET ----------------------------------------- */
  const shared = [];
  w.navigator.canShare = x => !!(x && x.files && x.files.length && x.files[0].type === 'image/png');
  w.navigator.share = x => { shared.push(x); return Promise.resolve(); };
  press();
  await wait(120);
  if (shared.length !== 1) bad.push('a phone that shares files was handed ' + shared.length + ' shares, not 1');
  else {
    const f = (shared[0].files || [])[0];
    if (!f) bad.push('navigator.share was called with no file');
    else {
      if (f.type !== 'image/png') bad.push('the file shared is ' + f.type + ', not image/png');
      if (!/\.png$/.test(f.name)) bad.push('the file shared is called "' + f.name + '", not a .png');
      if (!(f instanceof w.File)) bad.push('what was shared is not a File, so a share sheet will not take it');
    }
  }
  const svg = decodeURIComponent((made[made.length - 1] || '').replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
  if (!svg) bad.push('no picture was drawn — nothing was set as an image source');
  else {
    /* THE RECEIPT'S OWN SIZE, AT TWICE THE PIXELS — the canvas and the SVG both say so. */
    if (!/<svg[^>]* width="600" height="1040"/.test(svg)) bad.push('the picture is not the receipt at 2x (300x520 → 600x1040): ' + (svg.match(/<svg[^>]*>/) || [''])[0]);
    if (!/viewBox="0 0 300 520"/.test(svg)) bad.push('the picture is not laid out at the receipt\'s own width');
    if (!/<foreignObject[^>]*width="300" height="520"/.test(svg)) bad.push('the receipt is not in a foreignObject of its own size');
    /* AND IT IS THIS RECEIPT: its first row's label is in it. (Whether the tiles are left off is a
       question about `display`, which jsdom does not compute — `check/share.js` asks it.) */
    const k = rc.querySelector('.bk-k');
    if (k && svg.indexOf(k.textContent.trim()) < 0) bad.push('the picture does not hold the receipt\'s first row, "' + k.textContent.trim() + '"');
  }

  /* ---------- 2. A LAPTOP: NO FILE SHARING, SO A DOWNLOAD ------------------------------------------ */
  w.navigator.canShare = () => false;
  shared.length = 0;
  press();
  await wait(120);
  if (shared.length) bad.push('a browser that cannot share files was still sent to navigator.share');
  const dl = clicks[clicks.length - 1];
  if (!dl) bad.push('a browser that cannot share files was given no download');
  else if (!/\.png$/.test(dl.download || '')) bad.push('the download is called "' + dl.download + '", not a .png');
  const said = (d.getElementById('toast') || {}).textContent || '';
  if (!/saved/i.test(said)) bad.push('the download said "' + said + '" rather than that it saved a picture');

  /* ---------- 3. A REFUSED SHARE SHEET: THE PICTURE IN A SHEET, WITH ITS OWN SHARE ------------------ */
  w.navigator.canShare = x => !!(x && x.files);
  w.navigator.share = x => { shared.push(x); const e = new Error('no'); e.name = 'NotAllowedError'; return Promise.reject(e); };
  shared.length = 0;
  press();
  await wait(150);
  const sheet = d.getElementById('sheet');
  const img = sheet && sheet.querySelector('img.rc-shot');
  if (!sheet || sheet.classList.contains('hidden') || !img) bad.push('a refused share sheet left nothing on the screen — the picture should be offered in a sheet');
  else if (!sheet.querySelector('[data-do="rc-shot-share"]')) bad.push('the sheet with the picture has no Share button, so a second press cannot open the share sheet');
  else {
    const before = shared.length;
    w.navigator.share = x => { shared.push(x); return Promise.resolve(); };
    w.__t.ACTIONS['rc-shot-share']();
    await wait(30);
    if (shared.length !== before + 1 || !((shared[shared.length - 1].files || [])[0] || {}).name)
      bad.push('the sheet\'s Share button did not share the picture');
  }
  return bad;
});

/* ---------- THE CHAT, POLISHED: WHAT WAS NEW STAYS MARKED, AND THE COMPOSER FITS ------------------
   *"also refine the chat widgetts. looks fine but refine please."* Three of the changes are
   behaviour rather than paint, and this asks each of them of the real column in jsdom:

     1. A MESSAGE THAT ARRIVED UNREAD IS OUTLINED ON THE DRAW THAT READS IT. `dmPages_` marks a
        thread read before it renders it, so the outline never showed and the head's "2 new" sat
        over nothing marked new. `fresh` is set by `markRead_`, so it must survive a second paint
        (the poll's) and go when the server's next answer replaces the objects.
     2. The composer's hint is "Message…" and the person's name is its `aria-label`.
     3. A refusal's sentence is its own element, so it can sit on the bubble's side.
   And the empty inbox names the door that starts a conversation, because the column has none. */
check('chat: what arrived unread stays outlined, the composer hint fits, a refusal sits on its side', async () => {
  const bad = [];
  const { w, sent } = boot();
  await wait(300);
  const d = w.document;
  w.__t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'] });
  const seed = (list, pending) => w.__t.dmSeed(JSON.parse(JSON.stringify(list)), pending);
  const m = (id, mine, read, body) => ({ id, mine, read, body, at: '2026-09-16 09:1' + id.slice(-1),
    withId: 'P009', withName: 'Ada Tutor', fromName: mine ? 'You' : 'Ada Tutor' });
  seed([m('m1', false, true, 'Tuesday?'), m('m2', true, true, 'Yes.'),
        m('m3', false, false, 'Great.'), m('m4', false, false, 'Bring a ruler.')]);
  try { w.__t.repaint(true); w.__t.go('dm', false, true); } catch (e) { return ['opening Messages threw: ' + e.message]; }
  await wait(80);
  const col = d.getElementById('s-dm');
  if (!col || !col.querySelector('.msg-bub')) return ['the Messages column drew no bubbles from a seeded thread: '
    + (col ? col.textContent.replace(/\s+/g, ' ').trim().slice(0, 100) : 'no #s-dm')];
  const outlined = () => [].map.call(col.querySelectorAll('.msg.unread .msg-body-text'), p => p.textContent.trim());
  const head = (col.querySelector('.dm-new') || {}).textContent || '';
  if (!/2 new/.test(head)) bad.push('the head says "' + head + '", not "2 new"');
  if (JSON.stringify(outlined()) !== JSON.stringify(['Great.', 'Bring a ruler.'])) {
    bad.push('the two messages that arrived unread are not the ones outlined — outlined: ' + JSON.stringify(outlined()));
  }
  const asked = sent.filter(b => b.action === 'readMessage').map(b => b.messageId).sort();
  if (JSON.stringify(asked) !== '["m3","m4"]') bad.push('readMessage was asked for ' + JSON.stringify(asked) + ', not m3 and m4');
  /* THE POLL'S REPAINT: the outline is "new since you arrived", so a second draw keeps it. */
  w.__t.repaint(true);
  await wait(30);
  if (outlined().length !== 2) bad.push('a second paint dropped the outline — it should last until the server answers again');
  /* THE SERVER'S NEXT ANSWER: the same messages, now read, as fresh objects. Nothing is news. */
  seed([m('m1', false, true, 'Tuesday?'), m('m2', true, true, 'Yes.'),
        m('m3', false, true, 'Great.'), m('m4', false, true, 'Bring a ruler.')]);
  w.__t.repaint(true);
  await wait(30);
  if (outlined().length) bad.push('the outline outlived the server saying the messages were read: ' + JSON.stringify(outlined()));

  const box = col.querySelector('.msg-form .msg-text');
  if (!box) bad.push('the thread has no composer');
  else {
    if (box.getAttribute('placeholder') !== 'Message…') bad.push('the composer\'s hint is "' + box.getAttribute('placeholder') + '", not "Message…"');
    if (!/Ada Tutor/.test(box.getAttribute('aria-label') || '')) bad.push('the composer does not name who it writes to in its aria-label');
  }

  /* A REFUSAL: its sentence in its own element, beside Retry and Remove. */
  seed([m('m1', false, true, 'Tuesday?')], [{ tmp: 'tmpX', mine: true, read: true, state: 'failed',
    err: 'One message every five minutes.', withId: 'P009', withName: 'Ada Tutor', fromName: 'Test Admin',
    body: 'Here it is', atMs: Date.now(), attachments: [], queue: [] }]);
  w.__t.repaint(true);
  await wait(30);
  const fail = col.querySelector('.msg.is-failed + .msg-fail, .msg.is-failed .msg-fail');
  if (!fail) bad.push('a failed send drew no refusal under its bubble');
  else {
    const why = fail.querySelector('.msg-fail-why');
    if (!why || !/five minutes/.test(why.textContent)) bad.push('the refusal\'s sentence is not an element of its own');
    if (!fail.querySelector('[data-do="msg-retry"]') || !fail.querySelector('[data-do="msg-drop"]')) bad.push('the refusal lost Retry or Remove');
  }

  /* AND AN EMPTY INBOX SAYS HOW ONE STARTS. */
  seed([]);
  w.__t.repaint(true);
  await wait(30);
  const empty = (col.querySelector('.empty') || {}).textContent || '';
  if (!/press Message/.test(empty)) bad.push('the empty inbox reads "' + empty.replace(/\s+/g, ' ').trim() + '" and does not say how to start a conversation');
  return bad;
});

/* ---------- A TUTOR WITH NO HOURS CANNOT BE BOOKED BY NAME ---------------------------------------------
   ASKED FOR AS *"tutor with no hours wont be bookable."* An empty grid meant every hour open. Now the
   tutor dropdown draws them disabled with the reason beside the name, a change that names them
   anyway is refused, the hour grid shuts every hour and says why, and the send stops before
   `createJob` — while a tutor WITH hours, and `No preference`, book exactly as before. */
check('a tutor with no hours is greyed, shuts the grid and is not sent for; No preference still books', async () => {
  const { w, sent } = boot();
  await wait(300);
  const t = w.__t;
  const st = (t.STEPS || []).find(s => s.id === 'tutor');
  if (!st || typeof w.stepSelect_ !== 'function' || typeof w.slotGrid !== 'function') {
    return ['the tutor step / stepSelect_ / slotGrid are not reachable, so this was NOT checked — not a pass'];
  }
  t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'parent', roles: ['parent'] });
  const D = t.DATA();
  const avail = {};
  ['m', 'tu', 'w', 'th', 'f', 'sa', 'su'].forEach(p => { for (let h = 9; h <= 18; h++) avail[p + String(h).padStart(2, '0')] = ''; });
  const some = Object.assign({}, avail, { m16: 'TRUE', m17: 'TRUE' });
  D.tutors = [
    { title: 'Nia Nohours', rate: 14, teaches: ['Maths (GCSE)'], listed: true, avail: Object.assign({}, avail) },
    { title: 'Ada Hours', rate: 14, teaches: ['Maths (GCSE)'], listed: true, avail: some },
  ];
  const B = t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.how = ((t.STEPS.find(s => s.id === 'how') || { options: () => [] }).options().find(k => !/wait/i.test(k))) || '';
  B.level = 'GCSE'; B.loc = 'Colliers Wood Library'; B.subjects = ['Maths']; B.n = '1';
  B.hosting = 'No — we book the room'; B.interval = ['Autumn 1'];
  const bad = [];
  const box = w.document.createElement('div');
  box.innerHTML = w.stepSelect_(st);
  const opt = name => [...box.querySelectorAll('option')].find(o => o.value === name);
  const nia = opt('Nia Nohours'), ada = opt('Ada Hours');
  if (!nia) bad.push('a tutor with no hours is not in the list at all — greyed, not absent');
  else if (!nia.disabled || !/hasn.t set their hours yet/.test(nia.textContent)) {
    bad.push('Nia (no hours) is offered as "' + nia.textContent.trim() + '"' + (nia.disabled ? '' : ', pressable'));
  }
  if (!ada || ada.disabled) bad.push('Ada (hours ticked) cannot be chosen');
  /* A CHANGE NAMING HER ANYWAY is refused by the handler, not only by the markup. */
  const sel = w.document.createElement('select');
  sel.setAttribute('data-do', 'book-set'); sel.setAttribute('data-step', 'tutor');
  sel.innerHTML = '<option value="Nia Nohours">Nia Nohours</option>';
  sel.value = 'Nia Nohours';
  w.document.body.appendChild(sel);
  sel.dispatchEvent(new w.Event('change', { bubbles: true }));
  if (B.tutor === 'Nia Nohours') bad.push('a change event naming Nia was taken by the book-set handler');
  /* THE GRID, NAMED: every hour shut, and why. */
  B.tutor = 'Nia Nohours';
  const g = w.slotGrid();
  if (g.anyOpen || !/hasn.t set their hours yet/.test(g.why)) bad.push('with Nia chosen the grid is ' + (g.anyOpen ? 'open' : 'shut') + ' and says "' + g.why + '"');
  /* AND THE SEND STOPS BEFORE `createJob`. */
  B.slots = ['m16'];
  sent.length = 0;
  try { t.ACTIONS['book-send']({ disabled: false, dataset: {} }); } catch (e) { bad.push('book-send threw: ' + e.message); }
  await wait(200);
  if (sent.some(x => x.action === 'createJob')) bad.push('a booking naming Nia (no hours) was sent as createJob');
  /* ADA: her two hours open, the rest shut; and the send carries every ticked hour as `slots`. */
  B.tutor = 'Ada Hours';
  const ga = w.slotGrid();
  const openCodes = ga.rows.flatMap(r => r.hours.filter(h => h.open).map(h => h.code)).join(',');
  if (openCodes !== 'm16,m17') bad.push('with Ada chosen the open hours are [' + openCodes + '], wanted [m16,m17]');
  sent.length = 0;
  try { t.ACTIONS['book-send']({ disabled: false, dataset: {} }); } catch (e) { bad.push('book-send threw: ' + e.message); }
  await wait(200);
  const job = sent.find(x => x.action === 'createJob');
  if (!job) bad.push('a booking naming Ada (hours ticked) was not sent');
  else if (job.slots !== 'm16') bad.push('createJob carried slots "' + job.slots + '", wanted "m16" — the server checks every ticked hour');
  /* NO PREFERENCE: unchanged — nobody's hours are consulted, the venue decides. */
  B.tutor = 'No preference';
  if (!w.slotGrid().anyOpen) bad.push('with No preference the grid shuts — a booking nobody named a tutor for must still be bookable');
  return bad;
});

/* ---------- THE WEEK OF YOUR SESSIONS: YOURS, EVERY DAY OF THEM, AND ONLY WHILE THEY RUN ---------------
   ASKED FOR AS *"calander and time table and availability ... it seems they clash"*. `weekSessions_`
   is what every week of sessions reads, and it had three faults as `weekGrid`: a Monday-and-Friday
   booking lit Monday only, a stranger's open session was on a parent's week, and a booking that
   ended in the summer was still there in the autumn. Asked of the real function over jobs shaped as
   `doGet` sends them — `day` the joined weekday cell, `dates` the comma list of session dates. */
check('your week holds your sessions only, on every day they run, while their dates are live', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (typeof w.weekSessions_ !== 'function') {
    return ['weekSessions_ is not reachable, so the week was NOT checked — not a pass'];
  }
  const mon = w.mondayOf_(new Date());
  const at = n => { const d = new Date(mon); d.setDate(d.getDate() + n); return d; };
  const dmy = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  const job = (id, extra) => Object.assign({ id, jobId: id, subject: id, time: '16:00', hours: 2,
    client: 'Rasa Poliksa', tutor: 'GeorgePovey', status: 'active', slots: [] }, extra);
  const D = t.DATA();
  D.liveJobs = D.jobs = [
    job('TWO-DAY', { day: 'Monday, Friday', dates: [at(-7), at(-3), at(0), at(4), at(7)].map(dmy).join(', ') }),
    job('STRANGER', { day: 'Tuesday', client: 'Somebody Else', tutor: 'Sasha Matola', dates: dmy(at(1)) }),
    job('ENDED', { day: 'Wednesday', dates: [at(-70), at(-63)].map(dmy).join(', ') }),
    job('NOT-YET', { day: 'Thursday', dates: [at(24), at(31)].map(dmy).join(', ') }),
    job('UNDATED', { day: 'Saturday', dates: '' }),
  ];
  t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'client', roles: ['client'] });
  const got = w.weekSessions_().map(s => s.j.id + '@' + s.day).sort().join(' ');
  const want = 'TWO-DAY@0 TWO-DAY@4 UNDATED@5';
  const bad = [];
  if (got !== want) bad.push('this week holds [' + got + '], wanted [' + want + '] — both days of the two-day booking, '
    + 'nothing of a stranger\'s, nothing ended or not yet started, and the undated request on its weekday');
  return bad;
});

/* ---------- THE TIMETABLE IS THE ONE WEEK: YOUR SESSIONS LOCKED IN IT, AND IT IS ON YOUR ACCOUNT ---------
   `Your week` drew the sessions booked here and the Timetable what somebody wrote; they are one widget
   now. Asked of the real handlers: a booked session is in the day's list among the lessons, in time
   order, as a row that opens the session (`job`) and has no boxes; a Saturday session shows the
   weekend; `Your week` is not on the Tools column any more. Then the account: a lesson typed while
   signed in is posted as `saveTimetable` with the person's id and the widget's own shape, a week
   already on this phone under their key is carried up the first time, a week on the account is drawn
   from `USER.timetable` on a phone that has nothing, and signed out it stays on the device. */
check('the timetable holds your booked sessions locked, is saved to your account, and Your week is gone', async () => {
  const { w, sent } = boot();
  await wait(300);
  const t = w.__t, d = w.document;
  if (typeof w.initTimetable !== 'function' || typeof t.tmtKey !== 'function' || typeof w.weekSessions_ !== 'function') {
    return ['the timetable / weekSessions_ are not reachable, so this was NOT checked — not a pass'];
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
  try { t.go('tools', false, true); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  await wait(300);
  if (d.querySelector('#week-body')) bad.push('`Your week` is still a widget on the Tools column — it is folded into the Timetable');
  const box = () => d.querySelector('.tmt-box');
  if (!box()) return bad.concat('the timetable did not draw on the Tools column');
  const chip = d.createElement('button'); chip.setAttribute('data-day', '0');
  t.ACTIONS['tmt-day'](chip);
  const list = () => [...box().querySelectorAll('.tmt-list > *')].map(r =>
    (r.classList.contains('is-booked') ? 'BOOKED ' : '') + r.querySelector('.tmt-at').textContent.trim() + ' '
    + r.querySelector('.tmt-sub').textContent.trim());
  const got = list().join(', ');
  if (got !== '09:00 Maths, BOOKED 10:00 Physics, 13:00 Art') {
    bad.push('Monday reads [' + got + '], wanted [09:00 Maths, BOOKED 10:00 Physics, 13:00 Art] — the phone\'s week carried up, '
      + 'your session among it in time order, and nobody else\'s');
  }
  const row = box().querySelector('.tmt-row.is-booked');
  if (!row || row.getAttribute('data-do') !== 'job' || row.getAttribute('data-id') !== 'J-MON') {
    bad.push('the booked session is not a row that opens it (data-do="job" data-id="J-MON")');
  }
  if (box().querySelector('.tmt-ed .tmt-in[data-id="J-MON"]')) bad.push('a booked session opened into editable boxes');
  if (box().querySelectorAll('.tmt-day').length !== 7) bad.push('a session on Saturday did not show the weekend: ' + box().querySelectorAll('.tmt-day').length + ' day chips');
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
  if (!/Greek/.test(box().textContent) || /Maths/.test(box().textContent)) bad.push('a phone with nothing on it did not draw the week kept on the account');
  /* SIGNED OUT: the device's own, under the bare key, and nothing is sent. */
  t.USER(null);
  try { t.repaint(); } catch (e) {}
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

/* ---------- A BANK HOLIDAY IS NOT A SESSION, AND IS NOT CHARGED FOR ---------------------------------
   `computeSessionDates` walked every week of a term, so the Early May bank holiday inside Summer 1 was
   a date on the receipt and a share of the price. `DATA.closures` is `closures()` off the backend, and
   a closed date is stepped over — which the count and the price follow without being told. Asked of
   a window four weeks out, so the journey does not depend on what month it is run in. */
check('a closed day inside a term is stepped over, and the price counts the sessions that run', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (typeof w.computeSessionDates !== 'function' || typeof w.priceFrom !== 'function') {
    return ['computeSessionDates / priceFrom are not reachable, so closures were NOT checked — not a pass'];
  }
  const mon = w.mondayOf_(new Date()); mon.setDate(mon.getDate() + 28);
  const at = n => { const d = new Date(mon); d.setDate(d.getDate() + n); return d; };
  const dmy = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  const win = { startDate: dmy(at(-14)), lastSun: dmy(at(20)) };
  const spec = { subjects: ['Maths'], level: 'GCSE', n: 1, hours: 1, hoursPerWeek: 1, day: 'Monday',
                 runs: [{ dayName: 'Monday', day: 'm', hours: 1 }], windows: [win], tutor: '' };
  const D = t.DATA();
  D.closures = [];
  const open = w.priceFrom(spec);
  D.closures = [{ date: dmy(mon), name: 'Early May bank holiday', kind: 'bank' }];
  const shut = w.priceFrom(spec);
  const bad = [];
  const list = L => (L.sessionDates || []).map(dmy).join(', ');
  if ((open.sessionDates || []).length !== 5) bad.push('with nothing closed the window holds ' + (open.sessionDates || []).length + ' Mondays, wanted 5: ' + list(open));
  if ((shut.sessionDates || []).length !== 4 || list(shut).indexOf(dmy(mon)) !== -1) {
    bad.push('with ' + dmy(mon) + ' closed the dates are [' + list(shut) + '] — the bank holiday is still a session');
  }
  if (shut.weeksBooked !== 4) bad.push('the price counts ' + shut.weeksBooked + ' sessions, wanted 4');
  if (!(shut.total > 0) || Math.abs(shut.total * 5 - open.total * 4) > 0.05 * open.total) {
    bad.push('the total did not follow the count: ' + open.total + ' for 5 sessions, ' + shut.total + ' for 4');
  }
  return bad;
});

/* ---------- THE CALENDAR SHOWS EVERY DATE THE APP KNOWS ------------------------------------------------
   It drew exams and birthdays and nothing else. Now: your sessions on their own dates (and nobody
   else's), a term's first day, every day of a half term, a bank holiday off `DATA.closures`, a festive
   event, and an exam — each a dot of its own kind, a key under the month naming only the kinds on
   it, and a tap on a day listing what is on it. Seeded in THIS month so the drawn widget shows it. */
check('the calendar marks sessions, terms, half terms, bank holidays, events and exams, with a key', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document;
  if (typeof w.calendarMarks !== 'function' || typeof w.calKey_ !== 'function') {
    return ['calendarMarks / calKey_ are not reachable, so the calendar was NOT checked — not a pass'];
  }
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const on = n => String(n).padStart(2, '0') + '/' + String(m + 1).padStart(2, '0') + '/' + y;
  const D = t.DATA();
  D.liveJobs = D.jobs = [
    { id: 'J-CAL', jobId: 'J-CAL', subject: 'Maths', time: '16:00', day: 'Monday', client: 'Rasa Poliksa', tutor: 'GeorgePovey',
      status: 'active', slots: [], dates: [on(3), on(17)].join(', '), location: 'Mitcham library' },
    { id: 'J-NOT', jobId: 'J-NOT', subject: 'Chemistry', time: '10:00', day: 'Tuesday', client: 'Somebody Else', tutor: 'Sasha Matola',
      status: 'active', slots: [], dates: on(4) },
  ];
  D.intervals = [
    { term: 'Autumn 2', label: 'Autumn 2', kind: 'term', startDate: on(5), endDate: '19/12/' + (y + 1) },
    { term: 'October Half Term', label: 'October Half Term', kind: 'half-term', startDate: on(20), endDate: on(22) },
  ];
  D.closures = [{ date: on(8), name: 'Staff training', kind: 'inset' }, { date: on(9), name: 'Early May bank holiday', kind: 'bank' }];
  D.festive = [{ id: 'H1', name: 'Pumpkin carving', holiday: 'Halloween', venue: 'Colliers Wood Library', date: on(25) }];
  D.exams = [{ personId: 'P1', who: 'Rasa Poliksa', subject: '', label: 'Small exam', date: on(12), kind: 'mock' }];
  t.USER({ name: 'Rasa Poliksa', personId: 'P1', role: 'client', roles: ['client'] });
  const mk = w.calendarMarks(y, m);
  const kinds = n => (mk[n] || []).map(x => x.kind).sort().join(',');
  const bad = [];
  [[3, 'session'], [17, 'session'], [4, ''], [5, 'term'], [20, 'halfterm'], [21, 'halfterm'], [22, 'halfterm'],
   [8, 'closed'], [9, 'bank'], [25, 'festive'], [12, 'mock']].forEach(([n, want]) => {
    if (kinds(n) !== want) bad.push('day ' + n + ' carries [' + kinds(n) + '], wanted [' + want + ']');
  });
  const key = d.createElement('div');
  key.innerHTML = w.calKey_(mk);
  const said = [...key.querySelectorAll('.cal-key span')].map(s => s.textContent.trim()).join(', ');
  if (said !== 'Session, Mock, Term, Half term, Bank holiday, Closed, Event') bad.push('the key reads [' + said + ']');
  /* DRAWN, AND A TAP ON A DAY LISTS IT. */
  try { t.go('tools', false, true); } catch (e) { return bad.concat('go("tools") threw: ' + e.message); }
  await wait(300);
  w.initCalendar();
  const cell = d.querySelector('#cal-body .cal-d[data-d="3"]');
  if (!cell || !cell.querySelector('.dot.session')) bad.push('the 3rd is not drawn with a session dot');
  if (!d.querySelector('.cal-key-box .cal-key')) bad.push('no key is drawn under the month');
  if (cell) {
    t.ACTIONS['cal-day'](cell);
    await wait(50);
    const sheet = d.getElementById('sheet');
    if (!sheet || !/Session/.test(sheet.textContent) || !/Maths/.test(sheet.textContent)) bad.push('tapping the 3rd does not list the Maths session');
  }
  return bad;
});

/* ==================================================================================================
   MULTI-PART QUESTIONS — THE FOLLOW-UPS TO THE OWNER'S *"can you see any clashes or bugs or counter
   intuitive things which occur with current system to keep questions in order while keeping the
   diagram in its own widget … multiple parts … like 1b 1c 1di 1dii"*. Each journey is one finding of
   the audit that answered it, through the app's own builders. `FLOW_ONLY=multipart` runs them alone.
================================================================================================== */
/* A PAYLOAD ROW, the shape `libraryInto_` hands `questionItems` -- the fields it reads and no more. */
const mpRow_ = (paper, name, q, part, extra) => Object.assign({ id: 'Q-' + paper + '-' + q + part, paper: paper, paper_id: paper,
  q: String(q), part: part, kind: 'question', name: name, subject: 'Maths', marks: 1,
  html: '<p>' + paper + ' Q' + q + part + '</p>' }, extra || {});

/* FINDING 12 AND 13: a question's parts in the order the paper prints them, whatever the spelling and
   however many, and two papers sharing a name never shuffled together. */
check('multipart: parts sort by their value within a question, and two papers with one name do not interleave', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  if (typeof w.questionItems !== 'function' || typeof w.stuffSorted_ !== 'function') return ['questionItems or stuffSorted_ not reachable — renamed? The order was NOT checked'];
  const D = w.__t.DATA();
  const held = D.questions;
  const same = 'Paper 1 (Non-calculator) — June 2024';
  const rows = [];
  const add = (paper, name, q, parts) => parts.forEach(p => rows.push(mpRow_(paper, name, q, p)));
  /* SHUFFLED ON PURPOSE, so the order out is the sort's and not the file's. */
  add('P-MP-L', 'Letters', 1, ['j', 'h', 'i']);
  add('P-MP-R', 'Numerals', 2, ['x', 'ii', 'ix', 'v', 'i', 'iv', 'iii', 'vi', 'viii', 'vii', 'xi']);
  add('P-MP-N', 'Numbers', 3, ['10', '2', '1', '11', '9']);
  add('P-MP-A', 'Nested', 4, ['b', 'a(ii)', 'a', 'b(i)', 'a(i)', 'dii', 'di', 'c']);
  add('P-MP-1H', same, 13, ['b', 'a']);
  add('P-MP-1F', same, 13, ['b', 'a']);
  D.questions = rows;
  let order = [];
  try { order = w.stuffSorted_(w.questionItems()).map(x => x.row.paper + ':' + x.qPart); }
  catch (e) { bad.push('sorting threw: ' + e.message); }
  finally { D.questions = held; }
  const of = paper => order.filter(o => o.indexOf(paper + ':') === 0).map(o => o.split(':')[1]).join(' ');
  [['P-MP-L', 'h i j', 'letters h, i, j -- a lone "i" here is the ninth letter, not a numeral'],
   ['P-MP-R', 'i ii iii iv v vi vii viii ix x xi', 'numerals by value -- "ix" used to sort before "v"'],
   ['P-MP-N', '1 2 9 10 11', 'numbered parts past 9 -- they sorted 1, 10, 11, 2'],
   ['P-MP-A', 'a a(i) a(ii) b b(i) c di dii', 'letters, then each letter\'s numerals']].forEach(([p, want, what]) => {
    if (of(p) !== want) bad.push(what + ': got "' + of(p) + '", wanted "' + want + '"');
  });
  /* THE SAME NAME, TWO PAPERS: each paper's parts together. */
  const twin = order.filter(o => /^P-MP-1[FH]:/.test(o)).map(o => o.replace('P-MP-', '')).join(' ');
  if (twin !== '1F:a 1F:b 1H:a 1H:b') bad.push('two papers called "' + same + '" read "' + twin + '" -- their parts interleave');
  return bad;
});

/* A SMALL LIBRARY OF MULTI-PART QUESTIONS, made into the funnel's own items by `questionItems` and
   handed to Find as its whole list -- `stuffItems` replaced, so the memo keyed on `DATA` cannot hand
   back the fixture's. Returns a function that puts everything back. */
function mpLibrary_(w, rows) {
  const D = w.__t.DATA();
  const held = { q: D.questions, si: w.stuffItems, sa: w.stuffItemsAll_ };
  D.questions = rows;
  const items = w.questionItems();
  D.questions = held.q;
  w.stuffItems = () => items;
  w.stuffItemsAll_ = () => items;
  return { items, put: () => { w.stuffItems = held.si; w.stuffItemsAll_ = held.sa; } };
}
const MP_SVG = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>';
const mpBank_ = () => [
  { id: 'S-MP-W-8', paper: 'P-MP-W', paper_id: 'P-MP-W', q: '8', kind: 'preamble', name: 'Whole', html: '<p>OA, OB and OC are three straight lines.</p>', diagram: MP_SVG },
  mpRow_('P-MP-W', 'Whole', 8, 'i', { html: '<p>Work out the size of angle x.</p>', answer: '<b>50°</b>' }),
  mpRow_('P-MP-W', 'Whole', 8, 'ii', { html: '<p>Give a REASONWORD for your answer.</p>', answer: '<b>angles on a line</b>' }),
  mpRow_('P-MP-W', 'Whole', 18, '', { html: '<p>Eighteen.</p>' }),
  { id: 'S-MP-W-1d', paper: 'P-MP-W', paper_id: 'P-MP-W', q: '1', part: 'd', kind: 'preamble', name: 'Whole',
    html: '<p>A car moves from REST.</p>', diagram: '<svg viewBox="0 0 10 10" class="mp-car"><path d="M0 10 10 0"/></svg>' },
  mpRow_('P-MP-W', 'Whole', 1, 'c', { html: '<p>One c.</p>' }),
  mpRow_('P-MP-W', 'Whole', 1, 'd(i)', { html: '<p>One d i.</p>' }),
  mpRow_('P-MP-W', 'Whole', 1, 'd(ii)', { html: '<p>One d ii.</p>' }),
  mpRow_('P-MP-V', 'Other', 8, '', { html: '<p>Another paper\'s eight.</p>' }),
  mpRow_('P-MP-W', 'Whole', 14, 'a', { html: '<p>The graph shows a journey. Work out the speed.</p>', diagram: '<svg viewBox="0 0 10 10" class="mp-graph"><path d="M0 10 10 0"/></svg>' }),
  mpRow_('P-MP-W', 'Whole', 14, 'b', { html: '<p>Work out an estimate for the distance.</p>' }),
  mpRow_('P-MP-W', 'Whole', 20, 'a', { html: '<p>Use the graph to find the gradient.</p>' }),
  mpRow_('P-MP-W', 'Whole', 20, 'b', { html: '<p>From the graph, estimate the value of y when x = 3.</p>' }),
  mpRow_('P-MP-W', 'Whole', 21, '', { html: '<p>On the grid, draw the line y = 2x.</p>', answerType: 'drawing' }),
];

/* FINDING 1: a search hit on one part brings the whole question, in order, and lands on the part. */
check('multipart: a search that finds one part brings its whole question, in order, landing on that part', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  const need = ['questionItems', 'stuffFiltered', 'stuffPages_', 'stuffPageOf_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The whole question was NOT checked'];
  const lib = mpLibrary_(w, mpBank_());
  const S = w.__t.STUFF();
  try {
    S.q = 'reasonword'; S.filters = [];
    const hits = w.stuffFiltered();
    if (hits.length !== 1 || hits[0].qPart !== 'ii') bad.push('the search should MATCH one part, Q8(ii) -- it matched ' + hits.map(x => x.name).join(', '));
    const strip = w.stuffPages_().map(pg => pg.x.name + ':' + (pg.part || 'card')).join(' ');
    const want = 'Q8(i):stem0 Q8(i):sfig0 Q8(i):card Q8(i):ans Q8(ii):card Q8(ii):ans';
    if (strip !== want) bad.push('the strip reads "' + strip + '", wanted the whole question: "' + want + '"');
    if (hits[0]) {
      const at = w.stuffPageOf_(hits[0]);
      const pg = w.stuffPages_()[at];
      if (!pg || pg.x !== hits[0] || pg.part) bad.push('turning to the hit lands on page ' + at + ' (' + (pg ? pg.x.name + ':' + pg.part : 'nothing') + '), not on Q8(ii)\'s card');
      else if (at !== 4) bad.push('the hit is page ' + at + ' -- Q8(i), its answer and the opening should be the four pages in front of it');
    }
  } finally { lib.put(); S.q = ''; S.filters = []; }
  return bad;
});

/* FINDING 10: a question's number typed into the box is that question. */
check('multipart: typing a question reference -- q8, 8ii, 1dii, 1d(ii), Q 8 -- matches that question exactly', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  if (typeof w.stuffFiltered !== 'function' || typeof w.questionItems !== 'function') return ['stuffFiltered or questionItems not reachable — the references were NOT checked'];
  const lib = mpLibrary_(w, mpBank_());
  const S = w.__t.STUFF();
  const names = (q, filters) => {
    S.q = q; S.filters = filters || [];
    return w.stuffFiltered().map(x => x.row.paper.slice(-1) + x.name).join(' ');
  };
  try {
    [['q8', [], 'VQ8 WQ8(i) WQ8(ii)', 'both papers\' Q8 and every part -- and not Q18'],
     ['Q 8', [], 'VQ8 WQ8(i) WQ8(ii)', '"Q 8" with a space'],
     ['q8ii', [], 'WQ8(ii)', '"q8ii"'], ['8ii', [], 'WQ8(ii)', '"8ii"'], ['q8(ii)', [], 'WQ8(ii)', '"q8(ii)"'],
     ['1dii', [], 'WQ1d(ii)', '"1dii"'], ['1d(ii)', [], 'WQ1d(ii)', '"1d(ii)"'], ['q1d', [], 'WQ1d(i) WQ1d(ii)', '"q1d", the whole of (d)'],
     ['q8', [{ field: 'paperId', value: 'P-MP-W' }], 'WQ8(i) WQ8(ii)', '"q8" inside a chosen paper'],
    ].forEach(([q, f, want, what]) => {
      const got = names(q, f);
      if (got !== want) bad.push(what + ' found "' + got + '", wanted "' + want + '"');
    });
    /* A BARE NUMBER IS STILL WORDS: "8" is not read as Q8. */
    if (names('eighteen', []) !== 'WQ18') bad.push('an ordinary word search broke: "eighteen" found "' + names('eighteen', []) + '"');
  } finally { lib.put(); S.q = ''; S.filters = []; }
  return bad;
});

/* FINDING 8: two kept parts of one question on Saved -- and on Spotlight -- draw its opening once. */
check('multipart: Saved and Spotlight draw a question\'s opening and its figure once for several kept parts', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['savedPages_', 'spotPages', 'collItems_', 'questionItems'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — Saved was NOT checked'];
  const lib = mpLibrary_(w, mpBank_());
  const eight = lib.items.filter(x => x.row.paper === 'P-MP-W' && String(x.qNumber) === '8');
  const other = lib.items.find(x => x.row.paper === 'P-MP-V');
  const heldC = w.collItems_;
  w.__t.USER({ name: 'Kept', personId: 'P-KEPT', role: 'student', roles: ['student'] });
  /* KEPT OUT OF ORDER, with another question between them, the way stars are pressed. */
  w.collItems_ = () => [eight[1], other, eight[0]];
  const read = html => {
    const h = d.createElement('div');
    h.innerHTML = html;
    const c = h.querySelector('.qcard') || h.firstElementChild;
    if (!c) return '?';
    if (c.classList.contains('qstem')) return 'stem';
    if (c.classList.contains('qfig')) return 'fig';
    if (c.classList.contains('qans-card')) return 'ans';
    return (tagText(c, 'number') || '?').replace(/\s.*$/, '');
  };
  try {
    [['Saved', () => w.savedPages_()], ['Spotlight', () => w.spotPages()]].forEach(([where, f]) => {
      const got = f().map(read).join(' ');
      const want = 'stem fig Q8(i) ans Q8(ii) ans Q8';
      if (got !== want) bad.push(where + ' reads "' + got + '", wanted "' + want + '" -- the opening once, the parts in the paper\'s order');
    });
    /* A PART KEPT ALONE STILL HAS ITS OPENING. */
    w.collItems_ = () => [eight[1]];
    const alone = w.savedPages_().map(read).join(' ');
    if (alone !== 'stem fig Q8(ii) ans') bad.push('a part kept alone reads "' + alone + '", wanted its opening and figure in front of it');
  } finally { w.collItems_ = heldC; lib.put(); }
  return bad;
});

/* FINDING 9: "To the answer" says where the answer really is, and the drawing page carries it too. */
check('multipart: "To the answer" says where the answer is, and the drawing page after a card carries it', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['questionTiles_', 'questionFigCard_', 'pageParts_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — the tile\'s note was NOT checked'];
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; return h; };
  const row = id => ({ row_id: id, paper_id: 'P-MP-T', subject: 'Maths', name: 'Tiles' });
  const q = (id, extra) => Object.assign({ kind: 'question', name: 'Q' + id, qNumber: id, marks: 2, key: 'q-mp-t' + id,
    row: row('Q-MP-T-' + id), html: '<p>Do it.</p>', answer: '<b>done</b>' }, extra || {});
  const plain = q('1');
  const grid = q('2', { answerType: 'drawing', surface: 'grid', html: '<p>Draw the line y = 2x.</p>' });
  const front = q('3', { diagram: MP_SVG });
  const note = h => { const t = el(h).querySelector('[data-do="qa-go"]'); return t ? String(t.getAttribute('aria-label') || '').replace(/^To the answer · /, '') : '(no tile)'; };
  [[plain, 'next page', 'a card whose answer is the next page'],
   [grid, 'after the squared grid', 'a card with the grid to draw on between it and its answer'],
   [front, 'next page', 'a card whose figure stands in front of it']].forEach(([x, want, what]) => {
    const got = note(w.questionTiles_(x));
    if (got !== want) bad.push(what + ' says "' + got + '", wanted "' + want + '"');
  });
  /* THE DRAWING PAGE: the grid after the card carries the tile; a figure in front of its card does not. */
  const gf = el(w.questionFigCard_(grid));
  const gt = gf.querySelector('[data-do="qa-go"]');
  if (!gt) bad.push('the grid page -- where the child finishes -- has no "To the answer" tile');
  else if (note(gf.innerHTML) !== 'next page' || gt.getAttribute('data-from') !== 'fig') bad.push('the grid page\'s tile reads "' + note(gf.innerHTML) + '" from "' + gt.getAttribute('data-from') + '", wanted "next page" from the figure');
  if (el(w.questionFigCard_(front)).querySelector('[data-do="qa-go"]')) bad.push('a figure read on the way to its card carries a tile to the answer');
  /* AND IT TURNS ONE PAGE ON FROM THE GRID: card page 0, grid page 1, answer page 2. */
  if (gt) {
    const strip = el('<div id="s-mptile"><section class="page"></section><section class="page">' + gf.innerHTML + '</section><section class="page"></section></div>');
    d.body.appendChild(strip);
    const heldA = w.stuffItemsAll_, heldG = w.goPage;
    let went = null;
    w.stuffItemsAll_ = () => [grid];
    w.goPage = (id, n) => { went = [id, n]; };
    try { w.__t.ACTIONS['qa-go'](strip.querySelector('[data-do="qa-go"]')); }
    finally { w.stuffItemsAll_ = heldA; w.goPage = heldG; strip.remove(); }
    if (!went || went[1] !== 2) bad.push('the grid page\'s tile turned to ' + JSON.stringify(went) + ', wanted page 2 -- the answer is the page after the grid');
  }
  return bad;
});

/* FINDING 2: a Figure tile on a part whose question has a figure in front of it, opening that figure
   over the card -- and the card, its box and what is typed in it, untouched underneath. */
check('multipart: a part with a figure behind it has a Figure tile that opens it over the card', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['questionTiles_', 'stuffCard', 'questionItems'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — the Figure tile was NOT checked'];
  if (!w.__t.ACTIONS['q-fig']) return ['q-fig has no handler — nothing can open a figure over the card'];
  const lib = mpLibrary_(w, mpBank_());
  const find = name => lib.items.find(x => x.row.paper === 'P-MP-W' && x.name === name);
  /* THE CARD AS DRAWN, because the tile stands at the end of the answer box (`ansBox_`), not in the row. */
  const tileOf = x => { const h = d.createElement('div'); h.innerHTML = w.stuffCard(x, 0); return h.querySelector('[data-do="q-fig"]'); };
  try {
    [['Q8(ii)', 'the opening\'s figure, two parts back'], ['Q8(i)', 'the opening\'s figure, one page back'],
     ['Q14b', 'Q14a\'s own graph, a part back'], ['Q14a', 'its own graph, the page before its card']].forEach(([n, what]) => {
      if (!find(n)) bad.push(n + ' is not in the library');
      else if (!tileOf(find(n))) bad.push(n + ' has no Figure tile, though ' + what + ' stands in front of it');
    });
    ['Q18', 'Q1c'].forEach(n => { if (find(n) && tileOf(find(n))) bad.push(n + ' offers a Figure tile with no figure in front of its card'); });
    /* OPENED, OVER A CARD WITH SOMETHING TYPED IN IT. */
    const x = find('Q14b');
    const page = d.createElement('section');
    page.className = 'page';
    page.innerHTML = '<div class="pane">' + w.stuffCard(x, 0) + '</div>';
    d.body.appendChild(page);
    const box = page.querySelector('.qp-ans input, .qp-ans textarea');
    if (!box) bad.push('the card drew no answer box to type in, so "untouched underneath" was NOT checked');
    else box.value = '42 km';
    const t = page.querySelector('[data-do="q-fig"]');
    if (!t) bad.push('the card as drawn on Find carries no Figure tile');
    /* BESIDE THE BOX, on its line -- where the keypad, which covers the row under the card on a small
       phone, cannot cover it (the review of the merge, 1F Q23b at 320x568). */
    else if (!t.parentElement || !t.parentElement.classList.contains('qp-ans-row') || !t.parentElement.querySelector('.qp-ans'))
      bad.push('the Figure tile is not at the end of the answer box\'s own line -- under the card, the keypad covers it on a 320px phone');
    else {
      w.__t.ACTIONS['q-fig'](t);
      const sheet = d.getElementById('sheet');
      if (!sheet || sheet.classList.contains('hidden')) bad.push('pressing Figure opened nothing');
      else if (!sheet.querySelector('svg.mp-graph')) bad.push('the sheet opened without Q14a\'s graph: ' + sheet.textContent.trim().slice(0, 60));
      if (!d.body.contains(page) || (box && box.value !== '42 km')) bad.push('opening the figure disturbed the card underneath or what was typed in it');
      if (typeof w.closeSheet === 'function') w.closeSheet();
      if (sheet && !sheet.classList.contains('hidden')) bad.push('the figure sheet does not close');
    }
    page.remove();
  } finally { lib.put(); }
  return bad;
});

/* FINDING 6, THE OWNER'S OWN EXAMPLE: a "(d)" opening, drawn once before (d)(i), headed Q1(d), its
   figure after it, and again in front of (d)(ii) opened alone -- never in front of (a) or (c). */
check('multipart: a (d) opening is drawn once before (d)(i), headed Q1(d), and again before (d)(ii) alone', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['questionItems', 'stuffPages_', 'pageParts_', 'questionStemCard_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — the (d) opening was NOT checked'];
  const lib = mpLibrary_(w, mpBank_());
  const S = w.__t.STUFF();
  try {
    S.q = 'q1'; S.filters = [{ field: 'paperId', value: 'P-MP-W' }];
    const strip = w.stuffPages_().filter(pg => String(pg.x.qNumber) === '1').map(pg => pg.x.name + ':' + (pg.part || 'card')).join(' ');
    const want = 'Q1c:card Q1d(i):stem0 Q1d(i):sfig0 Q1d(i):card Q1d(ii):card';
    if (strip !== want) bad.push('Q1 reads "' + strip + '", wanted "' + want + '" -- the (d) opening once, between (c) and (d)(i)');
    const di = lib.items.find(x => x.name === 'Q1d(i)'), dii = lib.items.find(x => x.name === 'Q1d(ii)'), c = lib.items.find(x => x.name === 'Q1c');
    if (dii && JSON.stringify(w.pageParts_(dii)) !== '["stem0","sfig0",null]') bad.push('(d)(ii) opened alone has pages ' + JSON.stringify(w.pageParts_(dii)) + ' -- it needs its (d) opening and figure');
    if (c && (c.stems || []).length) bad.push('(c) carries the (d) opening, which would stand in front of it');
    if (di) {
      const h = d.createElement('div');
      h.innerHTML = w.questionStemCard_(di, 0);
      const head = tagText(h, 'number');
      if (head !== 'Q1(d)') bad.push('the (d) opening is headed "' + head + '", wanted Q1(d)');
      if (!/REST/.test(h.textContent)) bad.push('the (d) opening does not draw its words');
    }
  } finally { lib.put(); S.q = ''; S.filters = []; }
  return bad;
});

/* FINDING 4: a part whose words name a figure, in a question with none, says so on a page of its own. */
check('multipart: a figure the words name and nobody drew is a "not drawn yet" page, once per run of parts', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['questionItems', 'pageParts_', 'stuffPart_', 'stuffPages_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — the missing figures were NOT checked'];
  const lib = mpLibrary_(w, mpBank_());
  const S = w.__t.STUFF();
  const find = name => lib.items.find(x => x.row.paper === 'P-MP-W' && x.name === name);
  try {
    const a = find('Q20a');
    if (!a || JSON.stringify(w.pageParts_(a)) !== '["nofig",null]') bad.push('Q20a, "Use the graph" with no graph anywhere, has pages ' + (a && JSON.stringify(w.pageParts_(a))) + ', wanted the gap and then the card');
    else {
      const h = d.createElement('div');
      h.innerHTML = w.stuffPart_(a, 'nofig');
      if (!/not drawn yet/.test(h.textContent) || !h.querySelector('.qcard.qfig.is-missing')) bad.push('the gap page does not say "not drawn yet": ' + h.textContent.trim().slice(0, 80));
    }
    S.q = 'q20'; S.filters = [{ field: 'paperId', value: 'P-MP-W' }];
    const strip = w.stuffPages_().map(pg => pg.x.name + ':' + (pg.part || 'card')).join(' ');
    if (strip !== 'Q20a:nofig Q20a:card Q20b:card') bad.push('Q20 reads "' + strip + '" -- the gap once, in front of the first part that names it');
    ['Q14a', 'Q14b', 'Q21'].forEach(n => {
      const x = find(n);
      if (x && w.pageParts_(x).indexOf('nofig') >= 0) bad.push(n + ' is given a "not drawn yet" page though its question has a figure, or it is answered on a surface');
    });
  } finally { lib.put(); S.q = ''; S.filters = []; }
  return bad;
});

/* THE OWNER: *"they have their own tag. i could in theory just click answers and only see answers."* --
   and then, 6 Oct: *"The answers should just be another tag at the start of the funnel menu. You
   complicated it."* So `Answers` is one of What kind's answers, beside `Questions`. Chosen, the strip is
   the answer pages only, in order, OPEN -- choosing it is asking for them -- with Hide still hiding one;
   its chip's cross takes it off. No tile on the answer page offers it any more. */
check('multipart: "Answers" is a kind at the start of the funnel, and choosing it shows only answer pages, open', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['questionAnsCard_', 'stuffPages_', 'facetValues', 'facetList', 'stuffPart_', 'stuffFiltered'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — the answers view was NOT checked'];
  const A = w.__t.ACTIONS;
  const lib = mpLibrary_(w, mpBank_());
  const S = w.__t.STUFF();
  try {
    /* OFFERED AT THE START, as a kind. */
    S.q = ''; S.filters = [];
    const kind = w.facetList().find(x => x.field === 'kindLabel');
    const said = x => { try { return [].concat(kind.of(x)); } catch (e) { return []; } };
    const withAns = lib.items.find(x => x.name === 'Q8(i)');
    const kinds = kind ? said(withAns) : [];
    if (kinds.indexOf('Answers') === -1) bad.push('a question with an answer tells What kind ' + JSON.stringify(kinds) + ' -- no "Answers" beside its own kind');
    if (kinds.length < 2) bad.push('choosing answers took the question\'s own kind off What kind');
    const noAns = lib.items.find(x => x.kind === 'question' && !w.questionHasAns_(x));
    if (noAns && said(noAns).indexOf('Answers') !== -1) bad.push(noAns.name + ' has no answer and still says "Answers"');
    if (w.facetList().some(x => x.field === 'pageKind')) bad.push('the old hidden Page filter is still a facet');
    /* AND NO TILE ON THE ANSWER PAGE ANY MORE. */
    const a = lib.items.find(x => x.name === 'Q8(i)');
    const h0 = d.createElement('div'); h0.innerHTML = w.questionAnsCard_(a);
    if (h0.querySelector('[data-do="qa-only"], [data-do="qa-all"]')) bad.push('the answer page still draws the "Answers only" switch');
    /* CHOSEN: only answer pages, in order, open. */
    S.filters = [{ field: 'paperId', value: 'P-MP-W' }, { field: 'kindLabel', value: 'Answers' }];
    const pages = w.stuffPages_();
    const parts = [...new Set(pages.map(pg => pg.part))];
    if (!pages.length || parts.length !== 1 || parts[0] !== 'ans') bad.push('the Answers strip holds ' + JSON.stringify(parts) + ', wanted answer pages and nothing else');
    const names = pages.map(pg => pg.x.name).join(' ');
    if (names !== 'Q8(i) Q8(ii)') bad.push('the Answers strip is "' + names + '", wanted Q8(i) Q8(ii) -- the answers there are, in order');
    pages.forEach(pg => {
      const h = d.createElement('div');
      h.innerHTML = w.stuffPart_(pg.x, 'ans');
      const c = h.querySelector('.qans-card');
      if (!c || c.classList.contains('is-hidden') || !/50°|angles on a line/.test(h.textContent)) bad.push(pg.x.name + '\'s answer is shut in the Answers view -- "only see answers" is forty Shows in a row otherwise');
    });
    /* HIDE STILL HIDES ONE. */
    if (A['qa-hide'] && pages[0]) {
      const host = d.createElement('div'); host.className = 'page';
      host.innerHTML = w.questionAnsCard_(pages[0].x);
      d.getElementById('s-stuff').appendChild(host);
      const hide = host.querySelector('[data-do="qa-hide"]');
      if (!hide) bad.push('an open answer in the Answers view has no Hide');
      else {
        A['qa-hide'](hide);
        const again = d.createElement('div');
        again.innerHTML = w.stuffPart_(pages[0].x, 'ans');
        if (!again.querySelector('.qans-card.is-hidden')) bad.push('Hide did not hide an answer in the Answers view');
      }
      host.remove();
    }
    /* AND "Questions" IS AS IT WAS: questions with their answers after them. */
    S.filters = [{ field: 'paperId', value: 'P-MP-W' }, { field: 'kindLabel', value: 'Questions' }];
    if (!w.stuffPages_().some(pg => pg.part !== 'ans')) bad.push('choosing Questions shows no question pages');
  } finally { lib.put(); S.q = ''; S.filters = []; if (w.__t.go) { try { w.__t.go('stuff', false, true); } catch (e) {} } }
  return bad;
});

/* THE REVIEW OF THE MERGE WITH THE PEN'S BRANCH, FINDINGS 1 AND 5: a part that USES an earlier part's
   drawing ("use your graph") is neither "not drawn yet" -- the figure it names is the child's own --
   nor offered that part's blank paper copy under Figure. A later part that does not use it still is. */
check('multipart: a "use your graph" part has no "not drawn yet" page and no blank Figure of the part it uses', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['questionItems', 'pageParts_', 'figsBefore_', 'questionTiles_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — "use your graph" was NOT checked'];
  const GRID = '<svg viewBox="0 0 10 10" class="mp-axes"><path d="M0 5h10M5 0v10"/></svg>';
  const rows = mpBank_().concat([
    mpRow_('P-MP-W', 'Whole', 24, 'a', { html: '<p>Complete the table.</p>' }),
    mpRow_('P-MP-W', 'Whole', 24, 'b', { html: '<p>On the grid, draw the graph of y = 2x.</p>', answerType: 'annotate', figure: 'grid-blank', diagram: GRID }),
    mpRow_('P-MP-W', 'Whole', 24, 'c', { html: '<p>Use your graph to find x when y = 3.</p>', uses: 'b' }),
    mpRow_('P-MP-W', 'Whole', 24, 'd', { html: '<p>Read the value off the graph when x = 1.</p>' }),
    /* AND ONE WHOSE GRAPH IS DRAWN ON A SURFACE, so nothing in the question is a printed figure. */
    mpRow_('P-MP-W', 'Whole', 25, 'a', { html: '<p>Draw the line y = x.</p>', answerType: 'drawing', surface: 'coord' }),
    mpRow_('P-MP-W', 'Whole', 25, 'b', { html: '<p>From the graph, find x when y = 3.</p>', uses: 'a' }),
  ]);
  const lib = mpLibrary_(w, rows);
  const find = n => lib.items.find(x => x.row.paper === 'P-MP-W' && x.name === n);
  try {
    const c = find('Q24c'), dd = find('Q24d');
    if (!c || !dd) return ['Q24c or Q24d did not reach the library'];
    /* THE ITEM MAY NOT CARRY `uses` UNTIL THE PEN'S BRANCH LANDS; the row does, and both are read. */
    const b25 = find('Q25b');
    if (!b25 || w.pageParts_(b25).indexOf('nofig') >= 0) bad.push('Q25b "from the graph", which uses the axes Q25a was drawn on, is given a "The paper prints a figure here -- not drawn yet" page beside the page showing that drawing');
    if (w.pageParts_(c).indexOf('nofig') >= 0) bad.push('Q24c "use your graph" is given a "not drawn yet" page -- the figure it names is the child\'s own graph on Q24b');
    const labels = w.figsBefore_(c).map(f => f.html);
    if (labels.some(h => /mp-axes/.test(h))) bad.push('Q24c\'s Figure opens Q24b\'s blank grid -- the picture it reads is the child\'s drawing, not the paper\'s empty copy');
    const h = d.createElement('div');
    h.innerHTML = w.stuffCard(c, 0);
    if (h.querySelector('[data-do="q-fig"]')) bad.push('Q24c offers a Figure tile with nothing in front of it but the grid it uses');
    /* A PART THAT DOES NOT SAY IT USES (b) STILL SEES (b)'s PICTURE -- the rule is the column, not the grid. */
    if (!w.figsBefore_(dd).some(f => /mp-axes/.test(f.html))) bad.push('Q24d, which uses nothing, lost Q24b\'s figure too -- the skip reached past the part that names it');
  } finally { lib.put(); }
  return bad;
});

/* THE REVIEW, FINDING 6: the line above the strip counts what the strip holds -- questions, not the parts
   that matched -- and names the question when a search found one inside a paper. */
check('multipart: the line under a chosen paper counts questions, names a searched one, and counts answers in that view', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  if (typeof w.paperEnd_ !== 'function' || typeof w.stuffFiltered !== 'function') return ['paperEnd_ or stuffFiltered not reachable — the count was NOT checked'];
  const lib = mpLibrary_(w, mpBank_());
  const S = w.__t.STUFF();
  const say = (q, more) => {
    S.q = q; S.filters = [{ field: 'paperId', value: 'P-MP-W' }].concat(more || []);
    return String(w.paperEnd_(w.stuffFiltered())).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  };
  try {
    [['q8', [], /swipe up for Q8\./, '"q8" in the paper -- one question with two parts'],
     ['reasonword', [], /swipe up for Q8\./, 'a word found in Q8(ii) alone -- the strip holds Q8 whole'],
     ['', [], /Swipe up for its 6 questions\./, 'the whole paper -- Q1, Q8, Q14, Q18, Q20, Q21, each counted once however many parts'],
     ['', [{ field: 'kindLabel', value: 'Answers' }], /Swipe up for its 2 answers\./, 'the Answers view'],
    ].forEach(([q, more, want, what]) => {
      const got = say(q, more);
      if (!want.test(got)) bad.push(what + ': "' + got + '"');
    });
  } finally { lib.put(); S.q = ''; S.filters = []; }
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
