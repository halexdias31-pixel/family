#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/ui.js

   WHAT A PAIR OF EYES WAS FOR, DONE AS MEASUREMENTS.

   Every visual fault on this site has been found the same way: somebody opened it on a phone,
   something looked wrong, and a screenshot came back. That works, and it only works for the screen
   somebody happened to open, at the width they happened to hold, on the day they happened to look.
   Nine screens times four widths is thirty-six looks, and nobody has ever done thirty-six looks.

   This does them in about twenty seconds, and it answers in numbers rather than in opinions.

     node check/ui.js              every screen, every width, report and exit 1 if anything failed
     node check/ui.js --screen=me  just one
     node check/ui.js --shots      also write PNGs to check/shots/ for a human to look at

   ------------------------------------------------------------------------------------------------
   IT READS THE RENDERED PAGE, NOT THE SOURCE. This matters more than it sounds.

   A scan of style.css said seven custom properties were used and never declared — `--fly-ink`,
   `--cols`, `--a` and four others — and every one of that list was wrong. They ARE set, from
   template strings in the JavaScript:

       style="--fly-ink:${esc(ink)}"        style="--cols:${days.length}"

   Reading the files could not see that and confidently reported a bug that did not exist.

   THEN THE OPPOSITE METHOD MADE THE IDENTICAL MISTAKE. Asking `getComputedStyle` instead produced
   the same seven names, because `--fly-ink` is only set on a flyer and a run that never opens one
   finds it resolved nowhere. Source-only and runtime-only were both wrong, in mirror image.

   So the rule throughout is: MEASURE THE RENDERED PAGE. Three of the four checks below do nothing
   else — overflow, tap size and contrast are all read off real boxes at real widths, because those
   are facts about a layout and a file cannot hold them.

   `deadVars` is the single exception, and it is the exception for a stated reason: whether ANY
   writer for a property exists is a fact about the SOURCE, and asking the page instead is what
   produced two of the three wrong answers above. It is not a measurement and does not pretend to be.

   ------------------------------------------------------------------------------------------------
   THE BACKEND IS NOT CALLED. `check/fixture.json` stands in for it — the same shape the real
   payload has, with two people, one session, one post. So this runs with no network, no Apps Script
   quota, and — the point — the SAME data every time. A check whose input changes is a check that
   fails on Tuesdays for reasons nobody can reproduce.

   ------------------------------------------------------------------------------------------------
   WHAT IT WILL NOT COMPLAIN ABOUT, and why each exclusion is here rather than being a smarter rule.

   THE PANES THAT SIT OFF-SCREEN ARE THE DESIGN. `placeCells` lays the screens out side by side and
   slides between them, so at any moment most of the app is parked to the left and right of the
   viewport. The first version of this check counted 156 elements "overflowing the viewport" and all
   but a handful of them were the next screen, waiting exactly where it was put. A check that cries
   wolf 156 times is a check that gets ignored on its first run and never run again.

   So: everything below is scoped to the ONE pane that is currently on screen, and overflow is asked
   as "does this box scroll sideways when it was not meant to" rather than "is this box past the
   right edge of the window". The second question has a different right answer for every element on
   this site. The first has the same right answer for all of them.
================================================================================================== */
'use strict';

const { chromium } = require('playwright');
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
/* ITS OWN PORT, AND IT DID NOT HAVE ONE. `check/deploy.js` defaults to 8731 as well, which cost
   nothing for as long as the two ran one after another — and `js/check-all.js` starts the four
   browser-driven checks together now, where two servers asking for one port is one of them dying on
   EADDRINUSE with a stack trace instead of a report. Overridable for the same reason deploy's is:
   a port is the one thing about a harness that depends on what else is running. */
const PORT    = Number(process.env.UI_PORT || 8732);

const arg   = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=')[1];

/* ---------- THE FIXTURE, OR THE REAL PAYLOAD ------------------------------------------------------
   `--payload <file>` SWAPS THE HAND-WRITTEN FIXTURE FOR ONE `check/live.js` BUILT, which is the
   real `doGet` run over the real spreadsheets. The fixture stays the default and stays what CI
   would run: it is stable, and a check whose answer changes when somebody edits a cell is a check
   nobody can act on.

   THE REAL ONE IS FOR LOOKING. Three faults in one week were invisible to the fixture because the
   fixture was written from the same belief as the code — a `landmarks` tab with columns it has
   never had, a `link` that "no resource has", a paper drawn twice. None of those is a shape error,
   so none of them could be caught by a shape nobody questioned.

   NEVER COMMIT THE FILE IT READS. A real payload has PINs, e-mail addresses and dates of birth in
   it, and this repository is public. `check/live.js` refuses to write one into the working tree and
   `.gitignore` carries the path as well. */
/* ---------- `questions` AND `checklists` ARE NOT IN THE FIXTURE ANY MORE --------------------------
   THEY WOULD BE IGNORED IF THEY WERE. `js/library.js` builds both from `data/questions.json`, which
   this server serves out of the repository like any other file — so whatever a fixture said about
   them was overwritten a moment after the payload landed, and editing it would have changed
   nothing. A fixture key that silently does nothing is the fault this whole suite exists to catch.

   THE LIBRARY IS COMMITTED DATA NOW, so it is as fixed as the fixture ever was: the same rows every
   run, versioned, and diffable. There is nothing to stand in for. */
const PAYLOAD_AT = arg('payload');
const FIXTURE = PAYLOAD_AT
  ? fs.readFileSync(PAYLOAD_AT, 'utf8')
  : fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
if (PAYLOAD_AT) {
  console.log('payload: ' + PAYLOAD_AT + '  (the real one — findings here are about the DATA as');
  console.log('         much as the code, and the numbers move when a cell does)\n');
}
const SHOTS = process.argv.includes('--shots');
const ONLY  = arg('screen');

/* ---------- THE SCREENS, READ OFF THE APP RATHER THAN WRITTEN OUT HERE ---------------------------
   THIS WAS A LIST OF NINE AND ITS OWN NOTE NAMED THE FAULT: *"if you add a screen, add it here —
   and if you forget, the check still passes, which is the one failure this file cannot catch by
   itself."* It was forgotten. The app has ELEVEN columns; `settings` and `saved` have been on it
   for weeks and have never been measured at any width by any visitor — and `saved` has a
   declared STATE in `check/states.js` that has therefore never run once.

   SO IT IS DERIVED, which is the repair `check-doors.js` already made when its own hand-kept file
   list had drifted to three files: read the list the browser itself uses. `TABS` is the column
   order the app draws, so a column added tomorrow is measured tomorrow with nothing here to
   remember. The fallback below is only for a boot that failed outright — and it says so loudly,
   because a silent fallback to nine is exactly the silence this replaces.

   `--list` STILL PRINTS WHAT IT FOUND, and there is nothing left to compare it against by eye. */
const SCREENS_FALLBACK = ['stuff', 'account', 'feed', 'booking', 'tools', 'games', 'make', 'reel', 'dm'];

/* THE WIDTHS THAT EXIST. 320 is the smallest phone still in use and the one everything breaks on
   first; 390 is the modern iPhone; 768 is a tablet held upright; 1280 is a laptop. Four is enough —
   a layout that survives 320 and 1280 has survived everything between them, and every extra width
   is twenty more seconds on a check that has to be quick enough to run every time. */
const WIDTHS = [320, 390, 768, 1280];

/* THE STATES A SCREEN CAN BE IN — see check/states.js, which `check/press.js` reads as well. One
   list, because a state declared for the measuring pass and not the pressing one is a surface
   nobody presses, and that is the hole the booking grid lived in. */
const { STATES, statesOf } = require('./states.js');


/* ---------- AND THE VISITOR, WHICH THIS FILE HAD NEVER THOUGHT ABOUT ------------------------------
   NINE SCREENS AT FOUR WIDTHS, AND EVERY ONE OF THEM SIGNED OUT. Nothing here ever set a user, so
   every run measured what a stranger sees — and this app shows a stranger very little. The booking
   screen is the plainest case: signed out it is one card reading "Sign in to book", four lines and
   a button, and that is what "booking: nothing to report" has meant all along. The form behind it
   is the most control-dense surface in the app.

   HOW MUCH IT MEANT is worth writing down rather than summarising. Measured the first time this
   list existed: 87 controls under 44px and a sideways scroll at 320, on the booking card alone,
   none of which any run of this file had ever seen.

   SIGNED IN THROUGH THE FRONT DOOR, NOT BY POKING `USER`. `data.js` reads `familyUser` out of
   localStorage at boot, so seeding that key before the page loads is exactly the state a returning
   visitor arrives in — and it goes through whatever `data.js` does with it rather than around.

   ADMIN, because it is the widest surface: an admin sees the family's screens plus the queue, the
   roster and the job controls, so one pass covers both. A parent-only pass would be a third of the
   run for a subset of what this already measures. If an admin-only control is ever wrongly shown to
   a parent that is `check-access.js`'s question, not this file's — this one asks whether what is
   drawn can be read and hit.

   THE ID MATCHES `check/fixture.json`'s first person. A visitor the payload does not know is a
   visitor half the app refuses to draw anything for, which would measure the sign-in screen twice. */
const VISITORS = [
  { as: 'out', user: null },
  /* ---------- AND A `profile`, BECAUSE AN EMPTY BOX IS NOT THE BOX PEOPLE HAVE --------------------
     THE SEED CARRIED NONE, so every card on the Settings column has been measured EMPTY on every
     run — which for a form is measuring the one state that cannot overflow. `loginReplyFor_` sends
     a person their own values now (see `profileOf_`), so a returning visitor arrives with boxes
     that have something in them, and this is that visitor.

     INVENTED, AND SHAPED TO BE THE WIDEST CASE RATHER THAN THE TIDIEST. The note is the longest
     thing any of these boxes ever holds; the card number is the full length a borough prints on
     one. Nothing here is anybody's — this file is committed to a public repository, which is the
     whole reason the real ones live in a spreadsheet. */
  { as: 'in',  user: { name: 'Test Admin', personId: 'P001', person_id: 'P001',
                       role: 'admin', roles: ['admin'], handle: 'testadmin',
                       profile: { first_name: 'Test', last_name: 'Admin',
                                  borough: 'Sutton', city: 'London',
                                  /* ---------- THREE LIBRARIES, BECAUSE THE SHELF DRAWS THREE ------
                                     THE SEED HELD `library_card`/`library_pin`, which are the
                                     names from before the nine boxes became one cell — so it
                                     would have measured an EMPTY shelf, which is the fault this
                                     file records about the fixture stating `focus` as a string
                                     `doGet` does not send. All three filled, and the longest
                                     library name the shelf will ever hold, because the row is
                                     `1fr max-content` and the name is the track that gives. */
                                  lib1_name: 'Merton', lib1_no: '2000000000000', lib1_pin: '0000',
                                  lib2_name: 'Sutton', lib2_no: '2000000000001', lib2_pin: '0000',
                                  lib3_name: 'Wandsworth Town and Putney',
                                  lib3_no: '2000000000002', lib3_pin: '0000',
                                  library_note: 'Example note — the second card is in the top drawer' } } },
];

/* 44 CSS PIXELS is Apple's published minimum for something a finger has to hit, and Google says 48.
   The smaller number is used so this reports what is indefensible rather than what is imperfect. */
const MIN_TAP = 44;

/* ---------- KNOWN, WITH A WRITTEN REASON EACH, AND STILL PRINTED ---------------------------------
   `check-payload.js` HAS THIS LIST AND THE ARGUMENT FOR IT IS THE SAME. A finding that is real,
   understood, and not repairable by changing a number does not stop being real — but left failing
   it turns the run red for ever, and a red that is always red is a red nobody reads. The next thing
   to break then arrives as one more line in a wall.

   SO: STILL MEASURED, STILL PRINTED, IN THEIR OWN SECTION, AND THEY DO NOT FAIL THE BUILD. What
   makes that honest rather than convenient is the rule that each entry carries ONE WRITTEN REASON
   saying what was tried and what it would take. An entry anybody can read and disagree with is an
   argument; an entry that just names a selector is a silencer.

   MATCHED ON CLASS, NOT ON TEXT. A rule written against "10" would accept any 22px control that
   happens to say 10; the class is what the stylesheet acts on. */
const ACCEPTED_TAP = [
  { cls: /^hr\b/, why:
    'THE HOUR GRID IS THE CONTROL, and it cannot be made of 44px parts. Ten 44px cells need 440px, '
  + 'which is wider than any phone made. Shrinking to fewer hours loses the mornings, and stacking '
  + 'them loses the week-at-a-glance reading that is the whole reason the grid beat a pair of time '
  + 'dropdowns.\n'
  + '        AND IT SPANS TWO OF THE CARD\u2019S FIVE COLUMNS, WHICH IS THE LARGEST COMPROMISE ON '
  + 'THIS LIST. The card is one grid now \u2014 *"each field in its correct column"* \u2014 so the '
  + 'answer column is 56.3 / 75.3 / 80.9px at 320 / 390 / 768, and ten hours with their gutters in '
  + 'that is a **4.7 / 6.6 / 7.2px** cell. `grid-column: 2 / 4` gives the week the multiplier '
  + 'column as well, which a day row can never fill, and lands it on a real column edge: measured '
  + 'after, **8.97 / 11.69 / 12.48px** with a 1px gutter, and the block week 32.2 / 41.3 / 44.0. '
  + 'At 320 a fingertip still covers about three columns at once. THAT IS PAST WHERE A WRONG TAP '
  + 'IS RARE and the entry says so rather than dressing it up: what makes it liveable is that a '
  + 'wrong tap costs nothing \u2014 a lit hour comes straight back off with another tap and '
  + 'nothing is sent until Send.\n'
  + '        ASKED FOR THINNER TWICE AND THIS GIVES A FIFTH OF IT BACK. Ten hours across the full '
  + 'answer column was 18.5 / 23.1 / 24.4 before either ask; 44% of a span took it to 7.6 / 9.7 / '
  + '10.3 and ended the strip 29px inside the multiplier column, which is what *"each field in its '
  + 'correct column"* then convicted. The three shapes that give half the width for free were '
  + 'offered with their own numbers and refused: two rows of five hours a day (18.6 / 23.2 / 24.5, '
  + 'twice the height), turned on its side as seven day-columns (13 / 16.3 / 17.2, ten rows), and '
  + 'a shorter span. One declaration reverses it \u2014 `2 / -1; width: 44%` \u2014 and the trade '
  + 'is written here and beside the rule so it is a decision rather than something nobody '
  + 'measured.\n'
  + '        AND 14px IS UNDER `.hr`\u2019s OWN 20px FLOOR, on purpose and on the fourth asking: '
  + '*"make the grid squares and grid thinner"*. What stops it at 14 is that the day name takes '
  + 'over as the row\u2019s floor below it \u2014 12px buys two pixels at 390 and costs a sixth of '
  + 'the target. The arithmetic is beside `.bk-row.bk-wk` in style.css.\n'
  + '        THE OLD REASON ENDED "a finger picking a range on a grid is a DRAG, and the drag is '
  + 'what `slot-row` handles." IT DOES NOT. Measured: no pointer handler anywhere names '
  + '`slot-row` or `slot-hours`, every cell is an ordinary tap, and `slot-row` is not even the '
  + 'element any more \u2014 a day is a row of the card. A sentence that outlived what it '
  + 'described, which is the shape this repository records under `.favwrap.is-fav`.' },
  { cls: /^scr-sq\b/, why:
    'A SCRABBLE BOARD IS FIFTEEN SQUARES ACROSS AND THAT IS THE GAME, not a layout choice. Fifteen '
  + '44px cells need 660px, which is wider than any phone made; at 320px they are 13px each and at '
  + '390px they are 18px. The alternatives were both worse: a board scrolled sideways inside its '
  + 'own container hides most of the position, and seeing the whole board is what Scrabble IS, and '
  + 'a smaller board is a different game. The same argument the stylesheet already records for '
  + '`.c4` and `.oth`, whose cells are 40px and 35px for the same reason and only look acceptable '
  + 'because those boards are seven and eight across. What makes it liveable here is that a tap on '
  + 'the wrong square costs nothing: a tile you have just put down comes straight back off with '
  + 'another tap, and nothing is committed until Play.' },
  { cls: /^bk-(sel|in|v)\b/, why:
    'THE BOOKING ROW IS ONE LINE AND ITS UNDERLINE IS THE CELL\'S BOTTOM BORDER. Tried twice and '
  + 'photographed both times: `min-height: 44px` on the control grows the grid cell to 44px and '
  + 'leaves the dashed underline sitting 24px below the label it belongs to, with `align-items: '
  + 'center` no better than `baseline`. The card goes 754px to 1016px and reads as a list of '
  + 'detached rules. It is fixable — the underline has to move off the cell and onto the control — '
  + 'but that is a redesign of the row, not a number, and it is the app\'s main form.' },
];

/* 4.5:1 is WCAG AA for body text. Large text is allowed 3:1, which is why size is checked too —
   holding 18pt-and-up to the body standard would report every heading on a dark site. */
const MIN_CONTRAST      = 4.5;
const MIN_CONTRAST_BIG  = 3.0;

/* ---------- A CUSTOM PROPERTY NOTHING ANYWHERE SETS ---------------------------------------------
   THE ONE CHECK HERE THAT IS NOT A MEASUREMENT, because it is the one question the running page
   cannot answer about itself. It took three wrong answers to work out why.

     · Reading style.css alone reported seven dead properties. All seven were wrong: `--fly-ink`
       and the rest are set from template strings — style="--fly-ink:${esc(ink)}" — which a scan of
       the stylesheet cannot see.

     · Asking the rendered page instead reported the SAME seven, for the mirror-image reason: a
       flyer only exists once you open one, so a run that never opens a flyer finds those names
       resolved nowhere and calls them dead.

     · Fixing that left `--tooth`, which is declared at style.css:1942 and was reported only because
       no element using it happened to be on screen. Wrong a third time.

   The lesson is that "is it resolved right now" is not the question. The question is whether ANY
   writer exists — a declaration in the CSS, a declaration in the HTML, or an assignment from the
   JavaScript — and that is decidable from the source alone, exactly and cheaply. A name used in a
   bare `var()` with no writer of any kind is a typo or a leftover, and nothing else.

   A `var(--x, fallback)` is never reported. The fallback is the writer. */
function deadVars() {
  const read = f => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
  const css  = read(path.join(ROOT, 'style.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  const html = read(path.join(ROOT, 'index.html'));
  const js   = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js'))
                 .map(f => read(path.join(ROOT, 'js', f))).join('\n');

  /* EVERY WRITER, of any kind. `--name:` covers a stylesheet rule, an inline style attribute, and
     a template string building one; setProperty covers the scripted form. */
  const writers = new Set();
  for (const src of [css, html, js]) {
    for (const m of src.matchAll(/(--[\w-]+)\s*:/g)) writers.add(m[1]);
    for (const m of src.matchAll(/setProperty\(\s*['"](--[\w-]+)/g)) writers.add(m[1]);
  }

  const dead = new Set();
  for (const src of [css, html]) {
    for (const m of src.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
      if (!writers.has(m[1])) dead.add(m[1]);
    }
  }
  return [...dead].sort();
}

/* ---------- SERVING THE REAL FILES ------------------------------------------------------------
   Not a copy, not a build — the files as they are on disk, so what is measured is what would ship.
   file:// would have done, except the app behaves differently there on purpose (see `jsonp` in
   data.js), and measuring the fallback path tells you nothing about the path everybody uses. */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
               '.ico': 'image/x-icon' };

function serve() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404); return res.end('not here');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(PORT, () => ok(s));
  });
}

/* ---------- THE MEASUREMENTS, RUN INSIDE THE PAGE -----------------------------------------------
   One function, passed whole to the browser, because crossing the boundary per element would turn
   two thousand elements into two thousand round trips. */
function inspect(opts) {
  const { MIN_TAP, MIN_CONTRAST, MIN_CONTRAST_BIG } = opts;
  const found = { overflow: [], hidden: [], offscreen: [], strays: [],
                 tinyTargets: [], lowContrast: [], noName: [] };

  /* ---------- THE SCREEN WE ASKED FOR, BY NAME ---------------------------------------------------
     `paint(id)` writes into `#s-<id>`, so that element IS the screen and there is nothing to work
     out. This asks for it directly.

     IT USED TO GUESS, and the guess was wrong in a way that took a while to see. The first version
     picked whichever pane had the largest area intersecting the viewport, on the reasoning that the
     one in front is the one you can see. That is true, and it is not stable: run `--screen=tools`
     on its own and it reported 25 sideways-scroll faults; run the same screen as part of all nine
     and it reported none. Same code, same screen, same width — a different answer depending on what
     had been visited first, because with nine screens drawn and placed, some other element won the
     area contest and the check quietly measured that instead.

     A CHECK THAT ANSWERS DIFFERENTLY ON THE SAME INPUT IS NOT A CHECK. It was about to be used to
     decide whether a change had broken the layout, and it would have blamed whichever change
     happened to be in the tree when the reading flipped.

     The fallback is still the old heuristic, for a screen whose element cannot be found at all —
     but it now says so, so a silent wrong answer becomes a visible unknown. */
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  let live = document.getElementById('s-' + opts.screenId);
  let guessed = false;

  if (!live) {
    guessed = true;
    const panes = [...document.querySelectorAll('section, .pane, .screen, .page')];
    live = document.body;
    let best = 0;
    for (const p of panes) {
      const r = p.getBoundingClientRect();
      const area = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0))
                 * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (area > best) { best = area; live = p; }
    }
  }

  const vis = el => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  /* ---------- AND THE SHEET, WHEN ONE IS OPEN ----------------------------------------------------
     `#sheet` IS A SIBLING OF THE SCREENS, NOT A CHILD OF ONE. So every surface this app opens in a
     sheet — the details form, the pay sheet, the composer, a tutor's profile, the practical guide —
     has been outside this measurement for as long as the file has existed. Nothing is wrong with
     `#s-<id>`: it IS the screen, and a sheet is not on it.

     WHICH MEANS A DECLARED STATE THAT OPENED ONE WOULD HAVE REPORTED A CLEAN SWEEP OF THE SCREEN
     UNDERNEATH IT — the "a check that cannot reach its subject reporting a pass" fault this file's
     own header records three times, and the reason `check-booking.js` read as a pass for months.

     IT CHANGES NOTHING WHERE NO SHEET IS OPEN, which is all 120 combinations today: `openSheet` is
     a finger's action and no state calls it yet. This is the road being built before the first
     state drives down it, deliberately, because the alternative is a state that looks measured. */
  const sheet = document.getElementById('sheet');
  const onSheet = sheet && !sheet.classList.contains('hidden') && vis(sheet)
    ? [sheet, ...sheet.querySelectorAll('*')] : [];
  const inside = [...live.querySelectorAll('*'), ...onSheet].filter(vis);

  /* ---------- 1. SIDEWAYS SCROLL THAT NOBODY ASKED FOR ------------------------------------------
     `scrollWidth > clientWidth` on a box whose overflow-x is not auto or scroll. This is the honest
     form of the question: the browser itself is saying "there is more here than fits, and I was not
     told that was allowed". No guessing about which parent an element was supposed to fit inside.

     ---------- AND `scrollWidth` DOES NOT KNOW ABOUT `transform` --------------------------------
     THIS IS THE ONE CASE WHERE THE BROWSER'S OWN ANSWER IS NOT THE ANSWER. `scrollWidth` is the
     layout width of the content; a `transform: scale()` on a child is painted afterwards and
     changes nothing about it. So an element holding a 794px sheet scaled to 0.353 reports 794
     against a 280px box — 514px of overflow that no viewer can ever see, because the thing is drawn
     at 280 and its right edge lands exactly on the box's.

     IT COST TWO WRONG FIXES BEFORE IT WAS MEASURED. `.mat-out` and `.fm-out` are the cheat sheet
     and the flyer, both A4 pages scaled to the phone by `matFit`/`flyFit`, both `overflow: hidden`
     and both correct. This check called them clipped; CLAUDE.md recorded the first as "a fixed
     paper width clipped with no way to reach the rest of the page you are about to print", and the
     second was changed on the strength of that entry. Nothing was ever clipped. Both are back to
     hidden, and the note that said otherwise is corrected.

     SO THE SECOND QUESTION IS ASKED IN PIXELS THE VIEWER CAN SEE. `getBoundingClientRect` DOES
     account for transforms, so the rendered right edge of the widest child is what settles it. If
     that edge is inside the box, the overflow is a number in a property and not a thing on a
     screen. Both methods are kept because each is right about something: the browser's own
     `scrollWidth` catches content that genuinely does not fit, and the rectangle catches the case
     where the page has already dealt with it. */
  const roots = [document.scrollingElement, live, ...inside];
  for (const el of roots) {
    if (!el) continue;
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowX)) continue;
    /* ---------- A ONE-LINE TEXT FIELD IS A BOX THAT WAS TOLD IT COULD --------------------------
       THIS RULE'S OWN QUESTION IS *"does this box scroll sideways when it was NOT told it could"*,
       and an `<input>` is the one element the platform tells: a value longer than the box scrolls
       inside it and the caret follows, which is what every text field on every site does. There is
       no `overflow-x` on it to read — the behaviour is the control's, not a declaration — so the
       test above cannot see the permission and reported the value instead of the layout.

       IT WAS FIRING ON REAL DATA AND NOTHING ELSE. `--screen=settings` exited 1 on `library_note`
       holding a sentence, and on a library called `Wandsworth Town and Putney`: up to 270px, which
       is simply how much of that name is scrolled out of view. A rule that fires on somebody typing
       a long borough is a rule that gets switched off.

       AND THE BOX AROUND IT IS STILL MEASURED. A track that collapses takes `label.field` with it,
       which this same rule reports — it did, at 4px wide — and an input too small to hit is the
       tap-target rule's question. Only the input's own horizontal scroll is exempt, and only it.
       `<textarea>` is NOT exempt: it wraps, so a sideways scroll there is a real fault. */
    if (el.tagName === 'INPUT') continue;
    const over = el.scrollWidth - el.clientWidth;
    if (over > 1 && el.clientWidth > 0) {
      const box = el.getBoundingClientRect();
      /* THE FURTHEST ANY CHILD IS ACTUALLY PAINTED. Children only — the element's own rect is the
         box being overflowed, and asking whether it overflows itself always answers no.

         AN ELEMENT WITH NO ELEMENT CHILDREN IS NOT EXEMPT, and the first version of this made it
         so. A long unbreakable word in a plain `<div>` overflows with nothing to measure, so
         `paintedRight` stayed at the box's own left edge and every text overflow in the app would
         have been silently dropped — a check quietly answering "fine" to the commonest case there
         is. Text cannot be transformed away from its own box, so where there is nothing to measure
         the browser's `scrollWidth` is already the right answer and is taken as it stands. */
      let paintedRight = null;
      for (const kid of el.children) {
        const k = kid.getBoundingClientRect();
        if (k.width > 0 && (paintedRight === null || k.right > paintedRight)) paintedRight = k.right;
      }
      /* 2px of slack, which is the rounding a fractional scale leaves behind — `0.3533` on 794px
         does not land on a whole pixel and neither does the box. */
      if (paintedRight !== null && paintedRight - box.right <= 2) continue;
      found.overflow.push({ tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 40),
        by: over, width: el.clientWidth });
    }
  }

  /* ---------- AND THE OTHER AXIS, WHICH IS THE ONE THE APP IS NAVIGATED ON ------------------------
     THIS FILE HAS ONLY EVER ASKED ABOUT SIDEWAYS. That is the right first question — a box that
     scrolls sideways when it was not told it could is always a fault — and it is the axis nobody
     travels: every screen in this app is a vertical strip of pages, and `.pane` is the glass each
     page is drawn on.

     `.pane` IS `overflow: hidden` AND `touch-action: none`, DELIBERATELY. Its own note says why: a
     pane that scrolls its own contents and a grid that pages are two gestures competing for one
     movement, and which one you got depended on whether the pane happened to be a pixel taller than
     its box. So the pane clips and the vertical drag always belongs to the grid.

     THE COST OF THAT IS STATED IN THE SAME COMMENT and is exactly what this measures: *"a card
     taller than the screen has its bottom cut off … Anything genuinely long should be PAGED."*
     Nothing anywhere was checking that anything genuinely long HAD been.

     WHAT IT COST, MEASURED: the Messages column stacked every conversation into one pane, and at
     390×844 with six of them that was 1,298px of content in an 805px box — 493px of somebody's
     messages on the page, with no scroll and no page to turn to. Six columns have now lost their
     vertical axis one way or another, and the reason it kept recurring is that the lab could not
     see the axis at all.

     EVERY PANE ON THE SCREEN, not just the one in front. A sixteen-page column has sixteen panes in
     the document and every one of them is a page somebody can turn to — measuring only the front
     one is `check/cards.js`'s own lesson about a sample and a sweep, on a second surface.

     A PANE THAT WAS TOLD IT MAY SCROLL IS EXEMPT, which is the same first question the sideways
     rule asks, and so is the widget's own scroller inside it — `.msg-body` and the notepad have
     their own `clientHeight`, so they never push the pane's `scrollHeight` in the first place.

     AND THE SAME SECOND QUESTION, IN PIXELS A VIEWER CAN SEE. A transform is invisible to
     `scrollHeight` exactly as it is to `scrollWidth` — the cheat sheet and the flyer are A4 pages
     scaled to a phone — so the lowest RENDERED child edge settles it. Without this the mat and the
     flyer would report hundreds of pixels that are not on any screen, which is the finding that
     cost this project two wrong fixes the first time round. */
  const panes = live && live.querySelectorAll ? [...live.querySelectorAll('.pane')] : [];
  for (const el of panes) {
    const s2 = getComputedStyle(el);
    if (/(auto|scroll)/.test(s2.overflowY)) continue;
    const under = el.scrollHeight - el.clientHeight;
    if (under <= 2 || el.clientHeight <= 0) continue;
    const box = el.getBoundingClientRect();
    let paintedBottom = null;
    for (const kid of el.children) {
      const k = kid.getBoundingClientRect();
      if (k.height > 0 && (paintedBottom === null || k.bottom > paintedBottom)) paintedBottom = k.bottom;
    }
    if (paintedBottom !== null && paintedBottom - box.bottom <= 2) continue;
    found.hidden.push({ tag: el.tagName.toLowerCase(),
      cls: String((el.firstElementChild && el.firstElementChild.className) || el.className || '')
             .slice(0, 40),
      by: under, height: el.clientHeight });
  }

  /* ---------- AND THE PANE ITSELF CAN BE OFF THE SCREEN, WHICH THE RULE ABOVE CANNOT SEE ----------
     THE RULE ABOVE ASKS WHETHER CONTENT OVERFLOWS ITS PANE. This asks the same question one box
     further out: the content fits its pane perfectly, `scrollHeight` equals `clientHeight`, and the
     PANE hangs off the bottom of the viewport with a card inside it nobody can reach.

     `columnShift_` CENTRES THE PAGE YOU ARE ON — `boxH / 2 - (offsetTop + offsetHeight / 2)` — and
     it runs when the column is PLACED. A card that grows afterwards keeps the offset it was placed
     with, so it grows downward out of the screen. Measured on the camera the day this was written:
     take a photograph and the card gains 167px of controls, and at 390x844 the pane ran from y139
     to y906 — `Save a copy` 62px below the glass, `under: 0` at every width, and the rule above
     silent at all four. `js/find.js`'s `settle_` is the app's own answer and the camera was not
     calling it.

     ONLY THE PAGE YOU ARE ON. Every other page of a paged column is legitimately off the viewport —
     that is what a column IS — so this asks `.page.on`, which is the class `paintPager` puts on the
     one in front. Without that narrowing it would report every card of every column and be the
     noise generator this file has already deleted one of.

     THE RENDERED BOX, for the reason the rule above gives: a transform is invisible to layout, and
     a `getBoundingClientRect` is what a viewer can actually see. 2px of slack, the same rounding
     allowance as everywhere else here. */
  const onPage = live && live.querySelector ? live.querySelector(':scope > .page.on > .pane') : null;
  if (onPage) {
    const r = onPage.getBoundingClientRect();
    const past = Math.round(Math.max(r.bottom - innerHeight, -r.top));
    if (past > 2 && r.height > 0) {
      found.offscreen.push({ tag: 'pane',
        cls: String((onPage.firstElementChild && onPage.firstElementChild.className) || '').slice(0, 40),
        by: past, height: Math.round(r.height) });
    }
  }

  /* ---------- AND A FIELD CAN BE IN THE WRONG COLUMN, WHICH NOTHING HERE COULD ASK ----------------
     REPORTED AS *"make reciept builder more like ordely. each field in its correct column"*, the
     morning after five column heads went onto the booking card. They sat over nothing, and every
     instrument in this repository was green: nothing overflowed, nothing was clipped, every row
     measured exactly what it asked for, and both mutants an adversarial review wrote against the
     header survived the whole suite.

     THE CAUSE WAS STRUCTURAL AND SO IS THE RULE. Every `.bk-row` used to declare `display: grid`
     and its own `grid-template-columns`, so `max-content` and `1fr` resolved PER ROW — five
     independent grids stacked up, lining up only by accident. Measured at 390 on a priced booking
     before the repair: the head's `Q` ended at 60.9 and every label at 75.6; an answer ended at
     158.3 on a priced row and 319.9 on one with no figures; three blank rows started their dash at
     44.3, 50.8 and 83.

     SO: EVERY CELL OF A COLUMN MUST HAVE THE SAME TWO EDGES. One question, asked of the card the
     visitor is looking at, over the classes the card's own grid names. The header is a row like any
     other here, which is the half that matters: a head that does not sit over its column is exactly
     as much a finding as a value that does not.

     THE WEEK IS THE ONE EXEMPTION AND ONLY ON ONE EDGE. `.bk-row.bk-wk .bk-v` spans two tracks
     deliberately — ten pressable hours do not fit in the answer column, and the arithmetic is in
     style.css beside the declaration — so its RIGHT edge is allowed to differ and its LEFT edge is
     not, because the left edge is the one the eye tracks down the card.

     1.5px OF SLACK, WHICH IS SUB-PIXEL LAYOUT AND NOTHING ELSE. The smallest real fault this would
     have caught is 3px (`Extra subj.` overhanging its own label column); a track resolved by the
     browser differs between rows by hundredths. */
  for (const card of (live ? live.querySelectorAll('.bk') : [])) {
    const rows = [...card.children].filter(el => el.classList.contains('bk-row'));
    if (rows.length < 2) continue;
    for (const col of ['bk-k', 'bk-v', 'bk-m', 'bk-r', 'bk-t']) {
      for (const edge of ['left', 'right']) {
        const seen = [];
        for (const row of rows) {
          const el = row.querySelector(':scope > .' + col);
          if (!el) continue;
          const b = el.getBoundingClientRect();
          if (!b.width && !b.height) continue;            // display:none has no box to be wrong
          /* THE WEEK'S RIGHT EDGE, EXEMPT WITH ITS REASON ABOVE. */
          if (edge === 'right' && col === 'bk-v' && row.classList.contains('bk-wk')) continue;
          seen.push({ at: Math.round(b[edge] * 10) / 10,
                      k: (row.querySelector(':scope > .bk-k') || {}).textContent || row.className });
        }
        if (seen.length < 2) continue;
        const lo = seen.reduce((a, b) => b.at < a.at ? b : a);
        const hi = seen.reduce((a, b) => b.at > a.at ? b : a);
        if (hi.at - lo.at > 1.5) found.strays.push({ col, edge, by: Math.round((hi.at - lo.at) * 10) / 10,
                                                     lo: lo.k.trim().slice(0, 18), hi: hi.k.trim().slice(0, 18) });
      }
    }
  }

  /* ---------- A "TEXT CLIPPED RATHER THAN WRAPPED" RULE WAS HERE, AND IT WAS INERT ---------------
     I WROTE IT, IT NEVER FIRED ONCE, AND DELETING IT IS THE HONEST OUTCOME. The fault it was for is
     real: the funnel's answer rows lost their counts, which left `.k` — `flex: 0 0 auto` — the only
     child of its row, and "Angles in Triangles & Quadrilaterals" was CLIPPED rather than wrapped at
     390px. A screenshot caught it and I assumed rule 1 could not, because an inline `<span>` has no
     `clientWidth` for it to measure.

     THAT ASSUMPTION WAS WRONG AND RULE 1 CATCHES IT PERFECTLY. The span pushes its parent `.row`'s
     `scrollWidth` past its `clientWidth`, and `.row` is an ordinary block — so the browser's own
     answer was right about it all along: 23 findings, up to 84px, the moment the fault is put back.

     WHAT WAS MISSING WAS NOT A RULE, IT WAS A STATE. The Find screen's first question is "What for"
     and its answers are one word each, so every answer row this file had ever measured was
     `Learning`, `Shop`, `Games`. Six answers down it is asking about topics. The row layout was
     proved against the shortest labels in the app and nothing else, and no amount of new measuring
     code would have found that — only pointing the existing measurement at the screen somebody is
     actually on. See `STATES`.

     A CHECK THAT CANNOT FAIL IS NOT A CHECK, and one that cannot fail while carrying a confident
     comment about what it protects is worse: it is a green light with nothing behind it. Proved by
     putting the fault back and counting: zero findings from it, twenty-three from the rule it was
     supposed to be helping. */

  /* ---------- 2. THINGS A FINGER CANNOT HIT ------------------------------------------------------ */
  for (const el of inside) {
    const tag = el.tagName;
    const role = el.getAttribute('role');
    /* SUMMARY IS A TAP TARGET AND WAS NOT ON THIS LIST. `<details>` arrived with the answer block on
       a question card (see `answerBlock_` in find.js) — the summary is the only way to open it, so a
       small one is exactly the fault this check exists to find, and it would have been invisible. */
    const tappable = /^(BUTTON|A|SELECT|INPUT|TEXTAREA|LABEL|SUMMARY)$/.test(tag)
      || role === 'button' || el.hasAttribute('onclick');
    if (!tappable) continue;
    if (el.closest('[hidden]')) continue;

    /* ---------- A CONTROL INSIDE A LABEL IS NOT THE TARGET; THE LABEL IS -------------------------
       A 14px CHECKBOX WAS REPORTED AND THE ROW AROUND IT IS 44px. `.mat-list label` wraps its
       checkbox and is `min-height: 44px`, and a click anywhere in a label toggles the control it
       contains — that is what a label IS, not a convention this app invented. So the finger has a
       44px row to hit and the check was measuring the glyph inside it.

       Three findings, at every width, for a control nobody has ever struggled to press. That is the
       same class of fault as the dead custom properties and the pane picked by area, both in
       CLAUDE.md: a check that measures the wrong thing and is believed. The fix for those two was
       to ask the right question, and this is the same fix.

       THE LABEL STILL HAS TO BE BIG ENOUGH. It is measured on its own pass — LABEL is in the
       tappable list above — so making a checkbox exempt does not make its row exempt. Shrink that
       row below 44px and this still reports it, as the label.

       ONLY WHEN THE LABEL ACTUALLY REACHES IT. `closest('label')` covers the wrapping form; a
       `for=` label sitting elsewhere in the DOM is deliberately NOT accepted, because proving it
       resolves to a big enough box is a different measurement and an unchecked assumption here
       would be exactly the kind of quiet pass this file exists to avoid. */
    /* ---------- A SQUARE ON A GAME BOARD IS NOT AN ISOLATED CONTROL --------------------------
       44px EXISTS SO SOMETHING CAN BE HIT WITHOUT LOOKING AT IT. A board cell is the opposite case:
       one of forty-two in a grid somebody is staring straight at, aimed at with the board in view.

       AND IT CANNOT BE MET HERE ANYWAY. Seven columns of 44px is 308px, plus gaps and padding is
       332px, on a phone that is 320px wide. Bleeding the board through the card's padding was tried
       and bought 4px and two sideways scrolls — the number is not reachable, so a check demanding it
       reports a fault nobody can fix, every run, for ever.

       WHAT MAKES A MIS-TAP SURVIVABLE, which is the part that actually matters: in Connect 4 the
       whole COLUMN is one target, so the real area is 25 x 150px — narrow, and tall enough to hit.
       In Othello only the legal moves are enabled, and there are rarely more than a handful, so the
       neighbours of any live square are almost always inert and a mis-tap does nothing at all.

       THE WEAK CASE, SAID OUT LOUD: two legal Othello moves can sit side by side, and there a
       mis-tap plays a move you did not choose. New game is the only way back. That is a real cost
       and it is the price of an 8x8 board on a 320px screen — every chess app on a phone pays it.

       NARROW ON PURPOSE. Only a cell whose own class says it is a board square. Anything else that
       is too small is still reported. */
    if (/\b(c4-cell|oth-cell)\b/.test(String(el.className || ''))) continue;

    if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) {
      const lab = el.closest('label');
      if (lab) {
        const lr = lab.getBoundingClientRect();
        if (lr.height >= MIN_TAP && lr.width >= MIN_TAP) continue;
      }
    }

    /* ---------- AND WHETHER A SCREEN READER CAN SAY WHAT IT IS ------------------------------------
       A CONTROL WITH NO NAME IS NOT AN IMPERFECT CONTROL, IT IS AN INVISIBLE ONE. The camera's
       shutter is the case this app already argued out loud: "a shutter with the word Photo written
       across it is not a shutter, and a control with no name at all is one a screen reader cannot
       offer." That got an `aria-label`; nothing anywhere checked the rest.

       MEASURED WHEN THIS WAS WRITTEN: ten controls had no text, no label and no `aria-label`, and
       every one of them carried a PLACEHOLDER — the comment box, the six message boxes, the funnel's
       search, the to-do line and the notepad. A placeholder IS the accessible name when there is
       nothing else, so all ten are named and none of them needed changing. Adding an `aria-label`
       saying what the placeholder already says would be two strings to keep in step, which is the
       fault this repository records under `MESSAGING`, under `kinds` and under `childrenOf`.

       SO THE RULE IS THE FLOOR RATHER THAN THE PREFERENCE: every source counted, and a control that
       has none of them fails. It runs inside the walk that was already happening, so it costs
       nothing, and the number it is guarding today is zero. */
    if (/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(tag)
        && el.type !== 'hidden' && !el.disabled) {
      const lab2 = el.closest('label');
      const by = el.getAttribute('aria-labelledby');
      const name = (el.getAttribute('aria-label')
        || el.getAttribute('title')
        || (by ? ((document.getElementById(by) || {}).textContent || '') : '')
        || (el.id ? ((document.querySelector('label[for="' + CSS.escape(el.id) + '"]') || {}).textContent || '') : '')
        || (lab2 ? lab2.textContent : '')
        || el.textContent
        || el.getAttribute('placeholder')
        || el.value || '').trim();
      if (!name) found.noName.push({ tag: tag.toLowerCase(),
        cls: String(el.className || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.'),
        act: el.dataset ? (el.dataset.do || '') : '' });
    }

    /* ---------- HALF A PIXEL, BECAUSE THE RECT IS A SUM AND NOT A SIZE ------------------------
       A BARE `< MIN_TAP` REPORTED THIRTEEN CONTROLS AS `51x44` — a size the report itself prints as
       passing, which is a finding nobody can act on. Measured at full precision, the calculator's
       `sin` key is **43.99998474121094** tall: `offsetHeight` is 44, `min-height` is `44px`, and
       `height` computes to `44px`. It is 44. What is not 44 is `getBoundingClientRect`, which on an
       element inside a translated ancestor is the floating-point sum of its layout position and the
       column's `translateY` — and the bottom and the top round the other way from each other.

       IT HAS BEEN ONE TRANSLATE AWAY FROM THIS SINCE THE RULE WAS WRITTEN. The columns were being
       slid by 108.5px, which happens to sum exactly; the day they slid by 33.8 instead, thirteen
       controls that had not changed by a pixel started failing. The instrument reporting its own
       arithmetic as the app's fault is the shape this project keeps finding in its own checks.

       HALF A PIXEL AND NOT A ROUNDING. `Math.round` would wave a real 43.5px control through;
       everything genuinely under the floor in this app is 38, 40, 20 or 13, so half a pixel is
       nowhere near any of them and is below what a screen can draw or a stylesheet can mean. */
    const r = el.getBoundingClientRect();
    if (r.height < MIN_TAP - 0.5 || r.width < MIN_TAP - 0.5) {
      /* THE CLASS COMES BACK WITH IT, because a finding has to be identifiable to be accepted. A
         report keyed on the element's TEXT cannot tell a 22px hour button from a 22px anything
         else, so an ACCEPTED entry written against the text would silence whatever happens to say
         the same word next year. The class is what the stylesheet acts on and what a reason can be
         written about. */
      found.tinyTargets.push({ tag: tag.toLowerCase(),
        cls: String(el.className || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.'),
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28),
        w: Math.round(r.width), h: Math.round(r.height) });
    }
  }

  /* ---------- 3. TEXT YOU CANNOT READ ------------------------------------------------------------
     WITH THE TRANSPARENCY COMPOSITED, which the first version of this did not do — it walked up to
     the first ancestor with any background at all and compared against that, so a panel at 2.4%
     white over black was read as nearly-white and every label on it was reported as unreadable.
     Seven false alarms out of seven. Blending down the whole ancestor chain is four more lines and
     it is the difference between a check somebody trusts and a check somebody mutes. */
  const parse = c => {
    const n = (c.match(/[\d.]+/g) || []).map(Number);
    return n.length ? { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 } : null;
  };
  const over = (fg, bg) => ({            // fg painted on top of bg
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const lum = c => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };

  const groundOf = el => {
    let acc = { r: 0, g: 0, b: 0, a: 1 };          // the page itself, assumed opaque
    const chain = [];
    for (let n = el; n; n = n.parentElement) chain.push(n);
    for (const n of chain.reverse()) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) acc = over(c, acc);
    }
    return acc;
  };

  for (const el of inside) {
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!own) continue;
    const s = getComputedStyle(el);
    const fg = parse(s.color);
    if (!fg) continue;
    const bg = groundOf(el);
    const solidFg = fg.a < 1 ? over(fg, bg) : fg;
    const a = lum(solidFg), b = lum(bg);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

    const px = parseFloat(s.fontSize) || 16;
    const bold = (parseInt(s.fontWeight, 10) || 400) >= 700;
    const big = px >= 24 || (bold && px >= 18.66);
    const need = big ? MIN_CONTRAST_BIG : MIN_CONTRAST;

    if (ratio < need) {
      found.lowContrast.push({ text: el.textContent.trim().slice(0, 30),
        ratio: +ratio.toFixed(2), need, px: Math.round(px),
        fg: s.color, bg: `rgb(${[bg.r, bg.g, bg.b].map(Math.round).join(' ')})` });
    }
  }

  return { found, guessed,
           pane: live === document.body ? 'body' : (live.id || live.className || live.tagName),
           counted: inside.length };
}

/* ---------- GO ---------------------------------------------------------------------------------- */
(async () => {
  const server = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome']
              .find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});

  let failures = 0;
  const rows = [];

  /* ---------- ASK THE APP WHICH COLUMNS IT HAS, ONCE, BEFORE MEASURING ANY OF THEM ---------------
     ONE THROWAWAY PAGE, SIGNED IN, because `applyColumns_` can switch a column off and `TABS` is
     what it rewrites — so the honest list is the one the app is holding after a real boot rather
     than the one `columns.json` happens to say. Signed in, because that is the visitor who can
     reach the most of them. */
  const found = await (async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    try {
      const who = VISITORS.find(v => v.user);
      if (who) await page.addInitScript(u => {
        try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {}
      }, who.user);
      await page.route('**://script.google.com/**', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
      await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1800);
      return await page.evaluate(() => {
        try { return (typeof TABS !== 'undefined' ? TABS : []).slice(); } catch (e) { return []; }
      });
    } catch (e) { return []; } finally { await page.close(); }
  })();
  if (!found.length) {
    console.warn('  ! the app did not report its columns, so this run measures the nine written '
               + 'into SCREENS_FALLBACK. A column added since is NOT being measured.');
    failures++;
  }
  const SCREENS = found.length ? found : SCREENS_FALLBACK;
  const screens = ONLY ? [ONLY] : SCREENS;

  if (SHOTS) fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });

  for (const width of WIDTHS) {
  for (const who of VISITORS) {
    const page = await browser.newPage({ viewport: { width, height: 844 },
                                         deviceScaleFactor: 1 });
    const jsErrors = [];
    page.on('pageerror', e => jsErrors.push(String(e.message).slice(0, 120)));

    /* WHO IS LOOKING, SET BEFORE THE PAGE EXISTS. `addInitScript` runs ahead of every script on the
       page, so `data.js` finds the key already there and signs the visitor in itself — the app's own
       door rather than a hand on `USER` after the fact. A `null` user writes nothing and leaves the
       run exactly as it was before this list existed. */
    if (who.user) await page.addInitScript(u => {
      try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {}
    }, who.user);

    /* THE BACKEND, STOOD IN FOR. Matched on the host so it catches the JSONP route too. */
    await page.route('**://script.google.com/**', r =>
      r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));

    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);                      // the boot fetch and first paint

    /* SIGNING IN MUST ACTUALLY HAVE HAPPENED. A seeded key the app ignores would leave this pass
       measuring the signed-out screens a second time and reporting it as coverage — "I did not
       check" printed as "I checked and it was fine", which is the failure this project keeps
       finding in its own checks. Louder than a skip, because a silent one looks like a pass. */
    if (who.user) {
      const signedIn = await page.evaluate(() => {
        try { return !!(typeof USER !== 'undefined' && USER); } catch (e) { return false; }
      });
      if (!signedIn) {
        console.warn(`  ! seeded a user and the app is still signed out at ${width}px — `
                    + `the signed-in half of the app was NOT measured.`);
        failures++;
      }
    }

    for (const id of screens) {
      /* DRIVEN THROUGH THE APP'S OWN FRONT DOOR. `go(id)` is what a tap calls, so anything it does
         on the way — remembering the page, painting neighbours — happens here too. A check that
         reaches past the app's navigation is checking a state the app cannot actually be in. */
      const went = await page.evaluate(sid => {
        try { if (typeof go === 'function') { go(sid, false, true); return true; } } catch (e) {}
        return false;
      }, id);
      if (!went) { rows.push({ width, id, as: who.as, skipped: 'no go()' }); continue; }
      await page.waitForTimeout(450);

      /* ONE PASS PER DECLARED STATE — see `STATES`. A screen with none listed has exactly one, with
         no `enter`, which is precisely what every screen had before this existed. */
      for (const state of statesOf(id)) {
        const label = state.name ? `${id} · ${state.name}` : id;
        /* WHOSE STATE IS THIS. A widget marked `admin` is not in a stranger's roster, so asking a
           stranger to reach it would report a fault about the check rather than about the app. */
        if (state.only) {
          const mine = await page.evaluate(src => {
            try { return !!(0, eval)('(' + src + ')')(); } catch (e) { return false; }
          }, String(state.only));
          if (!mine) { rows.push({ width, id: label, as: who.as, skipped: 'not this visitor' }); continue; }
        }
        if (state.enter) {
          const entered = await page.evaluate(src => {
            try { (0, eval)('(' + src + ')')(); return true; } catch (e) { return String(e.message); }
          }, String(state.enter));
          if (entered !== true) {
            console.warn(`  ! could not reach "${label}" at ${width}px: ${entered}`);
            failures++;
            continue;
          }
          await page.waitForTimeout(500);
        }

        /* AND IT HAS TO HAVE ARRIVED. A state that silently did not happen leaves this measuring
           the previous one twice and reporting it as coverage — which is the whole fault this file
           exists to stop repeating. */
        if (state.expect) {
          const got = await page.evaluate(src => {
            try { return (0, eval)('(' + src + ')')(); } catch (e) { return 0; }
          }, String(state.expect));
          if (!got) {
            console.warn(`  ! "${label}" at ${width}px was entered and shows no ${state.wants} — `
                       + `that state was NOT measured.`);
            failures++;
            continue;
          }
        }

        /* ---------- A SCREEN THAT THREW WAS BEING MEASURED AND REPORTED CLEAN ---------------------
           `pageerror` ABOVE CATCHES AN UNCAUGHT THROW, and `paint` in shell.js catches every one
           this can be about first: it wraps `s.draw()` in a try/catch and replaces the screen with
           a card reading "This screen did not draw". That card is short, has no overflow, no small
           tap target and no low-contrast text — so it measures perfectly, and every one of the
           eight account combinations came back "nothing to report" while the app was rendering an
           error message where a person's profile should have been.

           FOUND BY BREAKING IT FOR REAL. A profile card did `(t.focus || []).join(...)` while the
           fixture held a string; the TypeError went into `paint`'s catch, `pageerror` never fired,
           and this file printed `nothing to report.` across 88 combinations.

           THIS IS THE `check-booking.js` FAULT IN A FIFTH COSTUME — a check that cannot reach its
           subject reporting that the subject is fine. `paint`'s catch is right and stays: the rest
           of the app genuinely is fine, and taking the whole page down would be worse for a person
           using it. What was missing is that the LAB has to be able to tell the difference.

           ASKED OF THE RENDERED PAGE, not of the source, because that is the only place the answer
           exists — the throw is in data the app was given, and no amount of reading `cards.js`
           would show it. See the note at the top of this file on which of the two each check uses. */
        const threw = await page.evaluate(sid => {
          const el = document.getElementById('s-' + sid);
          if (!el) return '';
          const h = [...el.querySelectorAll('h3')]
            .find(x => x.textContent.trim() === 'This screen did not draw');
          return h ? ((h.parentElement.querySelector('.sub') || {}).textContent || '').trim() : '';
        }, id);
        if (threw) {
          /* REPORTED THROUGH `rows` LIKE EVERY OTHER FINDING, not counted here. The summary reads
             `nothing to report` off the grouped buckets, so a fault that bumps `failures` without
             joining them makes the run exit 1 while printing that nothing is wrong — which is the
             overstatement the note above the summary already warns about, upside down. */
          rows.push({ width, id: label, as: who.as, drawFailed: threw });
          continue;
        }

        const { found, counted, guessed } = await page.evaluate(inspect,
          { MIN_TAP, MIN_CONTRAST, MIN_CONTRAST_BIG, screenId: id });
        if (guessed) console.warn(`  ! #s-${id} not found at ${width}px — fell back to guessing `
                                + `which pane is in front, so this row may be measuring the wrong thing.`);

        /* COUNTED IN THE REPORT, NOT HERE. Every finding used to be a failure the moment it was
           measured, which left no place to ask whether it is one of the known ones — the accepted
           list has to be consulted where the findings are grouped, because that is where a finding
           has a class attached to it. Rows carry what was found; the report decides what it means. */
        rows.push({ width, id: label, as: who.as, counted, guessed, ...found });

        if (SHOTS) await page.screenshot({
          path: path.join(__dirname, 'shots',
            `${id}${state.name ? '-' + state.name.replace(/\s+/g, '-') : ''}`
            + `-${width}${who.as === 'in' ? '-in' : ''}.png`) });

        /* ---------- PUT IT BACK, BECAUSE THE NEXT STATE IS THE SAME PAGE -----------------------
           STATES RUN IN ORDER DOWN ONE PAGE and screens after them on that same page, so anything
           a state leaves standing is measured again under somebody else's name. `enter` is enough
           for every state that only moves the app — `go()` and `goPage()` replace what came
           before. A SHEET IS THE EXCEPTION: `go()` does not close one, so a guide left open would
           be counted as part of Tools, Games and every width after it.

           NOT A BLANKET `closeSheet()` AFTER EVERY STATE. That would be this file deciding what
           the app's state should be rather than the state saying so, and the first state whose
           whole point is a sheet still open would have no way to say it. */
        if (state.leave) {
          await page.evaluate(src => {
            try { (0, eval)('(' + src + ')')(); } catch (e) {}
          }, String(state.leave));
          await page.waitForTimeout(250);
        }
      }
    }

    /* ---------- EVERY COLUMN'S CARD STARTS ON THE SAME LINE ------------------------------------
       REPORTED AS *"when I swipe left and right on certain things I see the edge are slid up or
       down at times"*, and nothing here could see it: every rule above measures ONE screen, and
       this is a fault between screens. Measured at the time, the current card's top edge ran from
       98px on Make to 343px on Saved — a 245px spread — because `columnShift_` centred each column
       on its own card and the cards are different heights. What you see at the edge while swiping
       is a sliver of the neighbour, so a neighbour whose top is 90px lower is a step in the edge.

       ASKED ONCE PER WIDTH AND VISITOR, AFTER EVERY SCREEN HAS BEEN VISITED, because it is a
       property of the grid rather than of a screen — there is no per-screen pass this could have
       been a line in. A column with no page is skipped rather than counted as zero: a screen this
       visitor cannot reach is not a column out of line.

       THE TOLERANCE IS SUB-PIXEL LAYOUT AND NOTHING ELSE. Measured across the three sizes the
       spread is 0.3–0.5px, which is `offsetTop` rounding; 2px leaves room for that and no room for
       a card placed by a different rule. */
    const ragged = await page.evaluate(() => {
      const tops = [];
      document.querySelectorAll('.screen').forEach(s => {
        const id = s.id.slice(2);
        const pages = s.querySelectorAll(':scope > .page');
        if (!pages.length) return;
        let at = 0;
        try { at = domIndex_(id, PAGE[id] || 0); } catch (e) { at = 0; }
        const cur = pages[Math.max(0, Math.min(pages.length - 1, at))];
        if (!cur) return;
        tops.push({ id, top: +cur.getBoundingClientRect().top.toFixed(1) });
      });
      if (tops.length < 2) return null;
      const lo = tops.reduce((a, b) => a.top < b.top ? a : b);
      const hi = tops.reduce((a, b) => a.top > b.top ? a : b);
      return { by: +(hi.top - lo.top).toFixed(1), lo, hi, n: tops.length };
    });
    if (ragged && ragged.by > 2) rows.push({ width, id: '—', as: who.as, ragged });

    if (jsErrors.length) {
      failures += jsErrors.length;
      rows.push({ width, id: '—', as: who.as, jsErrors });
    }
    await page.close();
  }
  }

  await browser.close();
  server.close();

  /* ---------- THE REPORT -------------------------------------------------------------------------
     GROUPED BY FAULT, NOT BY SCREEN. The same 38px button on nine screens is one thing to fix, and
     printed per screen it reads as nine problems and buries the one that only happens at 320. */
  const bucket = {};
  const add = (kind, key, where, why) => {
    const k = kind + ' ' + key;
    (bucket[k] = bucket[k] || { kind, key, where: [], why }).where.push(where);
  };
  /* A KIND ENDING IN "(known)" IS IN ONE OF THE ACCEPTED LISTS: printed in full, with its reason,
     and not counted against the run. Everything else fails. */
  const isKnown = kind => / \(known\)$/.test(kind);

  for (const name of deadVars()) {
    failures++;
    add('DEAD CSS VAR', name + ' is used in a bare var() and nothing anywhere sets it', 'source');
  }

  /* WHERE A FAULT WAS SEEN NOW SAYS WHO WAS LOOKING. `booking@320` and `booking@320 signed in` are
     different screens with the same name, and a report that calls them both `booking@320` groups
     two findings into one line and hides the half that only a signed-in visitor can reach. */
  for (const r of rows) {
    if (r.skipped) continue;
    const at = `${r.id}@${r.width}${r.as === 'in' ? ' signed in' : ''}`;
    (r.jsErrors || []).forEach(e => add('JS ERROR', e,
      `${r.width}px${r.as === 'in' ? ' signed in' : ''}`));
    /* NOT GROUPED UNDER A SCREEN NAME, because it is not about one: the place is the width and the
       visitor, and the finding names the two columns furthest apart so there is something to look
       at rather than a number. */
    if (r.ragged) add('COLUMNS OUT OF LINE',
      `the current card starts ${r.ragged.by}px apart across ${r.ragged.n} columns — `
      + `${r.ragged.hi.id} at ${r.ragged.hi.top}, ${r.ragged.lo.id} at ${r.ragged.lo.top}`,
      `${r.width}px${r.as === 'in' ? ' signed in' : ''}`);
    /* THE SCREEN NEVER DREW. Grouped like the rest so one broken card across four widths and two
       visitors is one line to fix rather than eight, and so it is counted exactly once. */
    if (r.drawFailed) add('SCREEN DID NOT DRAW', r.drawFailed, at);
    (r.overflow || []).forEach(o => add('SIDEWAYS SCROLL',
      `${o.tag}.${o.cls.split(/\s+/)[0] || ''} overflows by ${o.by}px`, at));
    (r.hidden || []).forEach(o => add('OUT OF REACH',
      `.pane holding ${o.cls.split(/\s+/)[0] || o.tag} hides ${o.by}px below its own fold`, at));
    /* A SEPARATE HEADING FROM THE ONE ABOVE, DELIBERATELY. They are the same loss and different
       repairs: "below its own fold" is a card too tall for its pane, and wants the card split or
       the column paged; "off the screen" is a pane placed for a card that has since changed size,
       and wants `placeCells('y', …)` where the size changed. One heading would send a reader to
       the wrong half. */
    /* A SEPARATE HEADING AGAIN, AND FOR THE SAME REASON: this is not a box that is too big or in
       the wrong place, it is a box in the wrong COLUMN, and the repair is always the card's grid
       rather than the element. */
    (r.strays || []).forEach(o => add('FIELD OUT OF ITS COLUMN',
      `.${o.col} ${o.edge} edge varies by ${o.by}px down one card — "${o.hi}" against "${o.lo}"`, at));
    (r.offscreen || []).forEach(o => add('PANE OFF THE SCREEN',
      `.pane holding ${o.cls.split(/\s+/)[0] || o.tag} (${o.height}px) sits ${o.by}px outside the viewport`, at));
    (r.tinyTargets || []).forEach(t => {
      const ok = ACCEPTED_TAP.find(a => a.cls.test(t.cls || ''));
      add(ok ? 'TAP TARGET (known)' : 'TAP TARGET',
        `<${t.tag}>${t.cls ? '.' + t.cls : ''} ${JSON.stringify(t.text)} is ${t.w}x${t.h}`, at,
        ok && ok.why);
    });
    (r.lowContrast || []).forEach(c => add('CONTRAST',
      `${JSON.stringify(c.text)} ${c.ratio}:1 (needs ${c.need}) ${c.fg} on ${c.bg}`, at));
    (r.noName || []).forEach(n => add('NO NAME',
      `<${n.tag}>${n.cls ? '.' + n.cls : ''}${n.act ? ` [${n.act}]` : ''} has no text, label, `
      + `aria-label, title or placeholder — a screen reader has nothing to say about it`, at));
  }

  const checked = rows.filter(r => !r.skipped && r.id !== '—').length;
  console.log(`\nchecked ${checked} screen/width/visitor combinations `
            + `(${screens.reduce((n, id) => n + statesOf(id).length, 0)} screen states x `
            + `${WIDTHS.length} widths x `
            + `${VISITORS.length} visitors: ${VISITORS.map(v => v.as === 'in' ? 'signed in'
                                                                : 'signed out').join(' and ')})\n`);

  /* EVERY FINDING THAT IS NOT KNOWN IS A FAILURE, counted once per distinct fault rather than once
     per place it was seen — the same 38px button on nine screens is one thing to fix, which is the
     grouping this whole report is built on. */
  failures += Object.values(bucket).filter(b => !isKnown(b.kind)).length;

  const kinds = [...new Set(Object.values(bucket).map(b => b.kind))].filter(k => !isKnown(k));
  const known = [...new Set(Object.values(bucket).map(b => b.kind))].filter(isKnown);

  const printKind = kind => {
    const items = Object.values(bucket).filter(b => b.kind === kind);
    console.log(`${kind}  (${items.length})`);
    for (const it of items.slice(0, 60)) {
      const w = it.where;
      const at = w.length > 4 ? `${w.slice(0, 3).join(', ')} +${w.length - 3} more` : w.join(', ');
      console.log(`   ${it.key}\n      at ${at}`);
    }
    if (items.length > 60) console.log(`   …and ${items.length - 60} more`);
    console.log('');
  };

  /* THE SUMMARY MUST NOT OVERSTATE ITSELF — the same rule `check-payload.js` learned when it printed
     "everything the site reads, the backend sends" three lines under five accepted dead keys. With
     known findings below, "nothing to report" is not what happened; "nothing NEW" is. */
  if (!kinds.length) {
    console.log(known.length
      ? '  nothing NEW to report. The known ones are below, each with its reason.\n'
      : '  nothing to report.\n');
  } else {
    for (const kind of kinds) printKind(kind);
  }

  /* THE KNOWN ONES, AFTER the ones that fail, so the list that needs doing is at the top — and in
     full rather than as a count, with the reason printed once under each group. A list nobody can
     read the argument for is a list that stops being reread. */
  for (const kind of known) {
    printKind(kind);
    const why = [...new Set(Object.values(bucket).filter(b => b.kind === kind)
                                                 .map(b => b.why).filter(Boolean))];
    why.forEach(w => console.log('   why: ' + w.replace(/(.{92}) /g, '$1\n        ') + '\n'));
  }

  const skipped = rows.filter(r => r.skipped);
  if (skipped.length) {
    console.log(`not reachable: ${[...new Set(skipped.map(s => s.id))].join(', ')}\n`);
  }

  process.exit(failures ? 1 : 0);
})().catch(err => { console.error('check/ui.js fell over:', err); process.exit(2); });
