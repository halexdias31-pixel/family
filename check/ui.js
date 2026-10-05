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
/* `let`, BECAUSE A SECOND `--part` CANNOT HAVE THE SAME PORT: both halves run at once under
   check-all, and the first one to bind `UI_PORT` would leave the other failing on EADDRINUSE. Part 1
   takes `UI_PORT` as it always has; any later part asks the system for a free one (see `serve`), so
   no second fixed number has to be agreed with the other machines' workers. */
let PORT      = Number(process.env.UI_PORT || 8732);

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
/* `--part=1/2` MEASURES EVERY SECOND SCREEN, starting at the first. The note in js/check-all.js asked
   for exactly this when the run outgrew its fifteen minutes: split the states across two runs rather
   than raise the clock again. Screens are dealt alternately, so the two heavy columns (Find and
   Tools) land in different halves. A run with no `--part` measures everything, as before. */
const PART  = (/^(\d+)\/(\d+)$/.exec(arg('part') || '') || []).slice(1).map(Number);

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
const SCREENS_FALLBACK = ['stuff', 'account', 'feed', 'booking', 'shop', 'tools', 'games', 'reel', 'dm'];

/* THE SIZES THAT EXIST, AND THE HEIGHT IS HALF OF EACH ONE. 320 is the smallest phone still in use
   and the one everything breaks on first; 390 is the modern iPhone; 768 is a tablet held upright;
   1280 is a laptop. Four is enough — a layout that survives 320 and 1280 has survived everything
   between them, and every extra size is twenty more seconds on a check that has to be quick enough
   to run every time.

   THIS WAS FOUR WIDTHS AT ONE HEIGHT — `{ width, height: 844 }`, written out once and used for all
   four — so the lab's "320px phone" was a 320x844 device that has never existed, and its pane was
   807px against a real iPhone SE's 534. Every rule in this file that asks whether content fits a box
   was therefore measuring a box a third taller than the one it is in on the phone the complaint
   always comes from. `.pane` caps at `100dvh` minus the chrome, so the pane's height IS the
   viewport's, and a fake height is a fake pane.

   WHAT IT HID, AND BOTH ARE RECORDED IN CLAUDE.md AS FAULTS WITH NO INSTRUMENT: a 4:5 portrait
   photograph on a post is 582px inside a 534px pane at 320x568, so the caption, the comment box and
   its Send button are below the fold with no scroll and no page to turn to; and the session receipt
   runs 216px past the same pane. Neither is visible at 844.

   A HEIGHT IS A REAL DEVICE'S OR IT IS THE SAME FAULT AGAIN. 568 is the iPhone SE and the 5; 844 is
   the iPhone 12 through 15; 1024 is the iPad held upright, which is where 768 comes from; 800 is an
   ordinary laptop, and the shortest of the laptop heights rather than the tallest, because the
   question this file asks is whether a thing FITS. */
const SIZES = [[320, 568], [390, 844], [768, 1024], [1280, 800]];

/* THE STATES A SCREEN CAN BE IN — see check/states.js, which `check/press.js` reads as well. One
   list, because a state declared for the measuring pass and not the pressing one is a surface
   nobody presses, and that is the hole the booking grid lived in. */
const { STATES, statesOf } = require('./states.js');


/* ---------- AND THE VISITOR, WHICH THIS FILE HAD NEVER THOUGHT ABOUT ------------------------------
   NINE SCREENS AT FOUR WIDTHS, AND EVERY ONE OF THEM SIGNED OUT. Nothing here ever set a user, so
   every run measured what a stranger sees — and this app shows a stranger very little. The booking
   screen is the plainest case: signed out it is one card saying "Sign in to book" and nothing to
   press, and that is what "booking: nothing to report" has meant all along. The form behind it
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
                                  lib3_no: '2000000000002', lib3_pin: '0000' } } },
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
  { cls: /^qw\b/, why:
    'A WORD IN A PASSAGE IS THE SIZE OF A WORD, and on a "circle the three adjectives" question the '
  + 'words ARE the controls -- *"some questions require answers on diagram"*, and for KS2 grammar the '
  + 'passage is the diagram. A 44px word would be a passage with one word a line. What was done '
  + 'instead: the passage opens to 2.4 line height and each word carries 9px of padding above and '
  + 'below, which grows the hit area to about 35px tall without moving a line; the width is the '
  + "word's own and cannot honestly be anything else. What makes it liveable is what makes an hour "
  + 'cell liveable: a wrong tap costs nothing -- the same tap takes the ring straight back off, and '
  + 'nothing is sent anywhere.' },
  { cls: /^hr\b/, why:
    'THE HOUR GRID IS THE CONTROL, and it cannot be made of 44px parts. Ten 44px cells need 440px, '
  + 'which is wider than any phone made. Shrinking to fewer hours loses the mornings, and stacking '
  + 'them loses the week-at-a-glance reading that is the whole reason the grid beat a pair of time '
  + 'dropdowns.\n'
  + '        AND IT IS 4.7px WIDE AT 320, WHICH IS THE LARGEST COMPROMISE ON THIS LIST BY A LONG '
  + 'WAY. The card is one grid \u2014 *"each field in its correct column"* \u2014 so the answer '
  + 'column is 56.3 / 75.3 / 80.9px at 320 / 390 / 768, and ten hours with their 1px gutters in '
  + 'that is a **4.7 / 6.6 / 7.2px** cell. A fingertip covers about six columns at 320. THAT IS '
  + 'PAST WHERE A WRONG TAP IS RARE and the entry says so rather than dressing it up: what makes '
  + 'it liveable is that a wrong tap costs nothing \u2014 a lit hour comes straight back off with '
  + 'another tap and nothing is sent until Send.\n'
  + '        IT SPANNED THE MULTIPLIER COLUMN AS WELL UNTIL A DAY ROW HAD A MULTIPLIER. `2 / 4` '
  + 'was worth 8.97 / 11.69 / 12.48px a cell on the argument that a day could never fill that '
  + 'column, and *"there should be a 3 hour multiplier in the multiplication column, but i can '
  + 'also see theres no space for that. so make the time grid thinner by scale facter 0.5"* is '
  + 'both halves of why it no longer can. 0.53\u00d7 at every width, and *"i dont care if its '
  + 'really thin now"* is the authority. The three shapes that give half the width for free were '
  + 'offered with their own numbers and refused: two rows of five hours a day (18.6 / 23.2 / 24.5, '
  + 'twice the height), turned on its side as seven day-columns (13 / 16.3 / 17.2, ten rows), and '
  + 'a shorter span. One declaration reverses it \u2014 `grid-column: 2 / 4` \u2014 and it takes '
  + 'the multiplier with it.\n'
  + '        AND 14px IS UNDER `.hr`\u2019s OWN 20px FLOOR, on purpose and on the fourth asking: '
  + '*"make the grid squares and grid thinner"*. What stops it at 14 is that the day name takes '
  + 'over as the row\u2019s floor below it \u2014 12px buys two pixels at 390 and costs a sixth of '
  + 'the target. The arithmetic is beside `.bk-row.bk-wk` in style.css.\n'
  + '        THE OLD REASON ENDED "a finger picking a range on a grid is a DRAG, and the drag is '
  + 'what `slot-row` handles." IT DOES NOT. Measured: no pointer handler anywhere names '
  + '`slot-row` or `slot-hours`, every cell is an ordinary tap, and `slot-row` is not even the '
  + 'element any more \u2014 a day is a row of the card. A sentence that outlived what it '
  + 'described, which is the shape this repository records under `.favwrap.is-fav`.' },
  { cls: /^av-(sw|opt)\b/, why:
    'THE WARDROBE IS ONE CARD NOW, AND ITS CONTROLS ARE SIZED SO IT IS. Asked for as *"the avatar '
  + 'bit is split into like 4 widgets. should just be 1. make things smaller to fit on a screen if '
  + 'need be."* It was four pages — Colours, then the six slots two at a time — because at 44px '
  + 'every swatch and every drawing-with-its-name the whole wardrobe was 1517px against a 534px pane '
  + 'at 320x568. One card fits only if the controls come down: 21px colour circles eight to a row, '
  + 'and 29px squares holding the drawing alone, six to a row, which is the strip a 320px card has '
  + 'beside its label column. Measured with the card rendered at 320x568: inside the pane.\n'
  + '        WHAT MAKES IT LIVEABLE is what makes an hour cell liveable: a wrong tap costs nothing you '
  + 'cannot undo with the next one. Picking the wrong brown is fixed by picking the right one, and a '
  + 'hat you did not mean is taken off by pressing the one you did. The ONE press that is not free '
  + 'is a priced item, and that one says its price on its own face before it is pressed.\n'
  + '        THE OLD ENTRY REFUSED THIS for the colours alone, on the grounds that splitting them '
  + 'across three pages to get the 44px would make changing a look three swipes — which is the '
  + 'same argument, now answered the other way round because the owner asked for the one card.' },
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
  { cls: /^cal-d\b/, why:
    'A MONTH IS SEVEN COLUMNS AND EVERY DAY OF IT CAN BE TAPPED NOW. Seven 44px days need 308px of a '
  + 'card whose inside is about 210px at 320; measured, a day is 29x31 at 320, 37x34 at 390 and 39x36 '
  + 'at 768. Before the calendar learned sessions, terms, bank holidays and events, a day was '
  + 'pressable only when an exam or a birthday fell on it, and the fixture had neither, so nothing '
  + 'measured these. The alternatives were worse: a week at a time loses the month a family plans '
  + 'by, and a list of dates is what the calendar was asked to replace. What makes it liveable is '
  + 'that a tap on the wrong day costs nothing: it opens a sheet that says what is on that day and '
  + 'is closed again with nothing changed.' },
  { cls: /^ws-c\b/, why:
    'A WORD SEARCH IS A GRID OF LETTERS AND EVERY LETTER IS A PLACE A WORD CAN START OR END. Ten 44px '
  + 'cells need 440px and the narrowest phone here is 320; eight need 352. Measured at 320x568 a ten-letter row '
  + 'is 20px a cell and an eight-letter one 25px; at 390 they are 25px and 32px. The two ways out were both worse: a '
  + 'drag across the grid would fight the pager for the one gesture this app navigates by (the maze '
  + 'already refuses it for that reason, and the pen pad pays for it with a padlock), and a grid '
  + 'scrolled sideways hides the words it is asking you to find. What makes it liveable is that a '
  + 'wrong tap costs nothing: a first tap on the wrong letter is replaced by tapping the right one, '
  + 'and a second tap that is not in a line with the first simply becomes the new start.' },
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

/* ---------- A BOARD IS SQUARES OF ONE SIZE ---------------------------------------------------------
   REPORTED AS "maz game is glitched", AND NOTHING HERE COULD SEE IT. The maze's south wall was the
   class `ws` and the word search's grid is the bare `.ws`, so 71 of its 121 squares were laid out
   as grids of their own — 16.6px tall in 24.7px rows at 390, 12.1 against 19.3 at 320. Doubled
   walls, walls that missed each other, gaps in the outer edge. No tap target changed, nothing
   scrolled sideways, no text lost contrast: every rule in this file passed it, at every width.

   SO EVERY BOARD IS ASKED THE ONE THING A BOARD PROMISES. These are the six grids on the Games
   column whose children are its squares — chess, Connect 4, Othello, the maze, the word search and
   Scrabble — and on every one of them, at every width, all squares measured 0.02px apart or less
   when this was written. Half a pixel is the tolerance: sub-pixel layout and nothing else, the
   argument `ragged` makes below. A board that is not on the screen being measured is not counted;
   a GAMES column with none on it is a selector that stopped finding them, and says so. */
const BOARDS = '.chess, .c4, .oth, .mz, .ws, .scr';
const BOARD_TOL = 0.5;

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
    const own = PART.length === 2 && PART[0] > 1;
    s.listen(own ? 0 : PORT, () => { if (own) PORT = s.address().port; ok(s); });
  });
}

/* ---------- THE MEASUREMENTS, RUN INSIDE THE PAGE -----------------------------------------------
   One function, passed whole to the browser, because crossing the boundary per element would turn
   two thousand elements into two thousand round trips. */
function inspect(opts) {
  const { MIN_TAP, MIN_CONTRAST, MIN_CONTRAST_BIG } = opts;
  const found = { overflow: [], hidden: [], offscreen: [], strays: [], shrunk: [],
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
  /* ---------- AND THE DROP-DOWN, FOR THE SAME REASON ---------------------------------------------
     `#drop` IS THE BOOKING FORM'S LIST OF ANSWERS and it is a sibling of the screens because `.pane`
     is `overflow: hidden` and would clip it anywhere else. So its twelve 44px options are outside
     `#s-booking` entirely, and a measurement that stopped at the screen would report a clean sweep
     of the card behind them. Same sentence as the sheet above, one control along. */
  const drop = document.getElementById('drop');
  const onDrop = drop && !drop.classList.contains('hidden') && vis(drop)
    ? [drop, ...drop.querySelectorAll('*')] : [];
  const inside = [...live.querySelectorAll('*'), ...onSheet, ...onDrop].filter(vis);

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
    /* ---------- AND NOTHING INSIDE A DRAWING CAN PUSH THE PAGE SIDEWAYS -------------------------
       The outermost `<svg>` clips to its own viewport — the UA default — so a descendant's layout
       box cannot reach the card. The `<svg>` itself is an ordinary replaced element and is still
       measured. `check/cards.js` learned this first (CLAUDE.md, "`check/cards.js` was measuring
       inside the drawings"); this file met it the day a paper audit put the 2017 Higher Q1 scatter
       graph on a page beside the bundle state, and reported its rotated y-axis caption — written
       once and turned into place, so its layout box runs off to the left — as the card scrolling. */
    if (el.ownerSVGElement) continue;
    /* ---------- AND AN ELLIPSIS IS THE OTHER WAY OF BEING TOLD ---------------------------------
       SAME QUESTION, SECOND ANSWER. `text-overflow: ellipsis` on a clipped box is a declaration
       that the text is EXPECTED to be longer than the box and that the browser should say so — and
       it does say so, in the one place the reader is looking, with a mark drawn on the screen. That
       is the opposite of a box scrolling sideways when nobody asked it to: nothing is hidden
       silently and nothing can be reached by dragging.

       BOTH PROPERTIES AND NO ELEMENT CHILDREN, which is what keeps this narrow. `overflow: hidden`
       on its own is not permission — it is how a layout fault gets clipped instead of scrolled, and
       the rule must go on catching that. A box with element children is a layout, and an ellipsis on
       one of those says nothing about whether its children fit.

       IT REMOVES THREE FINDINGS ACROSS THE WHOLE APP and they are one element: `.rost-name`, a
       seat's occupant in a four-column roster on a 320px phone. The rule was reporting the ellipsis
       working. */
    if (!el.children.length && /ellipsis/.test(s.textOverflow || '')
        && /hidden|clip/.test(s.overflowX)) continue;
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
  /* AND THE FLOOR IS THE APP'S OWN NUMBER, NOT ONE OF THIS FILE'S. `paneReach_` leaves a pane
     `hidden` unless it is more than `PANE_REACH` over, deliberately: below that the competing
     gesture is the app's whole navigation and handing it over for a few pixels reads as a swipe
     that did nothing. Asking with a floor of 2 while the app answers with a floor of 24 is two
     numbers for one question — this repository's oldest shape — so the rule reads the app's
     constant out of the page and anything at or under it is reported as the declared tolerance
     rather than as a fault. 2 only if the page does not have it, which is a boot that failed. */
  const paneFloor = typeof PANE_REACH === 'number' ? PANE_REACH : 2;
  const panes = live && live.querySelectorAll ? [...live.querySelectorAll('.pane')] : [];
  for (const el of panes) {
    const zk = el.firstElementChild && parseFloat(el.firstElementChild.style.zoom);
    if (zk > 0 && zk < 1) found.shrunk.push({ cls: String(el.firstElementChild.className || '')
      .split(/\s+/)[0], z: zk });
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
      by: under, height: el.clientHeight, tol: under <= paneFloor, floor: paneFloor });
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
          /* AND A TOTAL'S LABEL, ON THE SAME EDGE AND FOR THE SAME KIND OF REASON. `.rc-total .bk-k`
             spans every track but the figure's, so `CLIENT PAYS` and `TUTOR EARNS` cannot widen the
             question column and wrap every answer on the card — see the note beside it in
             style.css. Its LEFT edge is still asked: it starts where every other label starts. */
          if (edge === 'right' && col === 'bk-k' && row.classList.contains('rc-total')) continue;
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
    /* ---------- AND `data-do` IS WHAT A CONTROL IS IN THIS APP -----------------------------------
       THE WHOLE DISPATCH IS ONE DELEGATED LISTENER ON `data-do`, and `check/press.js` presses
       exactly those — so an element carrying one is a control by construction, whatever tag it
       happens to be. The colour swatches in the wardrobe are `<span data-do="av-colour">`: twenty-one
       of them, 30x30, invisible to this rule for as long as it asked about tag names only. A control
       nobody put in a `<button>` is not a smaller control. */
    const tappable = /^(BUTTON|A|SELECT|INPUT|TEXTAREA|LABEL|SUMMARY)$/.test(tag)
      || role === 'button' || el.hasAttribute('onclick') || el.hasAttribute('data-do');
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
    /* CHESS JOINED THIS LIST when its board became a control — sixty-four squares that had been
       spans with no action, so the board could not be played at all. Eight across is Othello's
       arithmetic exactly, and what makes a mis-tap survivable is the same: a tap on a square that is
       not one of the picked piece's legal moves does nothing to the game, it only picks or unpicks,
       and a move played in error comes back with Undo. */
    if (/\b(c4-cell|oth-cell|chess-sq)\b/.test(String(el.className || ''))) continue;

    if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) {
      const lab = el.closest('label');
      if (lab) {
        /* AT ITS OWN SIZE, for the reason given below where the control itself is measured: a label
           on a card `paneReach_` has drawn smaller is 44px times the zoom on the glass. */
        let lz = 1;
        for (let e = lab; e; e = e.parentElement) {
          const zv = parseFloat(e.style && e.style.zoom);
          if (zv > 0 && zv < 1) lz *= zv;
        }
        const lr = lab.getBoundingClientRect();
        if (lr.height / lz >= MIN_TAP - 0.5 && lr.width / lz >= MIN_TAP - 0.5) continue;
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
      /* ---------- EACH CANDIDATE TRIMMED BEFORE THE `||`, NOT THE WHOLE CHAIN AFTER IT -------
         A WHITESPACE-ONLY LABEL IS TRUTHY, so `(lab2 ? lab2.textContent : '')` stopped the chain
         dead on every caption-less field and the `.trim()` at the end then made it `''`. The one
         source that would have named those boxes — the PLACEHOLDER, three rungs further down —
         was never reached. Measured: twelve correctly-named controls reported as unnamed (the
         nine library-card boxes and the three date-of-birth ones), collapsed by the grouping key
         into a single `<input>` line, so the report said 1 where it meant 12 and every one of the
         twelve was wrong.
         IT HAS BEEN WRONG SINCE THE LIBRARY SHELF SHIPPED, and the note above says why nobody
         saw it: this rule's whole argument is that a placeholder IS the accessible name when
         there is nothing else, and the shelf is the first thing in the app to lean on that. An
         instrument that cannot reach the source its own comment names is the shape this
         repository keeps finding in its own checks. */
      const lab2 = el.closest('label');
      const by = el.getAttribute('aria-labelledby');
      const t_ = v => String(v || '').trim();
      const name = t_(el.getAttribute('aria-label'))
        || t_(el.getAttribute('title'))
        || (by ? t_((document.getElementById(by) || {}).textContent) : '')
        || (el.id ? t_((document.querySelector('label[for="' + CSS.escape(el.id) + '"]') || {}).textContent) : '')
        || (lab2 ? t_(lab2.textContent) : '')
        || t_(el.textContent)
        || t_(el.getAttribute('placeholder'))
        /* A VALUE IS THE NAME OF A SUBMIT BUTTON AND OF NOTHING ELSE. `<input type="submit"
           value="Save">` really is named by its value; a text box holding `1985` is not — a
           screen reader announces that as the value and still has nothing to call the box.
           Unnarrowed, this rung made the rule BLIND to every unnamed box a person had typed
           into, which is the one state an unnamed box is usually found in. Proved by mutation:
           with the placeholder off, `dob_y` is silent while it holds `1985` and named the moment
           it is empty. This app has no submit input today (measured: zero across `js/` and
           `index.html`), so the narrowing costs nothing and stops the rung from covering for a
           fault. */
        || (/^(submit|button|reset|image)$/.test(el.type || '') ? t_(el.value) : '');
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
    /* ---------- AT ITS OWN SIZE, NOT THE SIZE A SHRUNK CARD DRAWS IT -------------------------------
       `paneReach_` DRAWS A CARD SMALLER WHEN IT DOES NOT FIT ITS PANE — CSS `zoom`, down to
       `PANE_ZOOM_MIN` — because the owner asked for every widget to fit on the screen rather than
       scroll, "smaller font" included. So a 44px button on a card drawn at 0.9 is 40px on the glass,
       by design, and measuring the glass would report every control on every shrunk card as a new
       fault: 501 of them, the first run after it went in. The control is judged at the size the
       stylesheet gave it, and the shrinking is counted on its own line below — CARD DRAWN SMALLER TO
       FIT — so the cost is a number rather than a silence. */
    let ez = 1;
    for (let e = el; e; e = e.parentElement) {
      const zv = parseFloat(e.style && e.style.zoom);
      if (zv > 0 && zv < 1) ez *= zv;
    }
    const r0 = el.getBoundingClientRect();
    const r = { width: r0.width / ez, height: r0.height / ez };
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
  /* `color(srgb r g b / a)` IS HOW CHROME COMPUTES A `color-mix()`, and its channels run 0 to 1, not
     0 to 255. Read as `rgb()` a tinted chip's fill came out as nearly black at 10% -- so the tag
     chips' `--dim` field names measured 6.87:1 on every run while the real fill had them at 4.3, and
     the rule could never have caught the 14% tint that put them under the bar. */
  const parse = c => {
    const n = (c.match(/[\d.]+/g) || []).map(Number);
    if (!n.length) return null;
    const k = /^color\(srgb\s/.test(c) ? 255 : 1;
    return { r: n[0] * k, g: n[1] * k, b: n[2] * k, a: n.length > 3 ? n[3] : 1 };
  };
  const over = (fg, bg) => ({            // fg painted on top of bg
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const lum = c => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };

  /* ---------- AND A GRADIENT IS READ WHERE THE TEXT IS ----------------------------------------------
     A PANE IS `#101010` UNDER A 5%-TO-1.5% WHITE GRADIENT, and this read only the `#101010`: the
     chips sit at the top of the pane, where the wash is lightest, so a tag chip's tint was measured
     on a ground darker than the one it is drawn on, and a 16% tint that put its field names at
     4.3:1 passed. A LINEAR gradient with an angle is read at the text's own centre -- projected onto
     the gradient line the way CSS draws it, stops evenly spaced or at their own percentages -- so a
     label at the top of a pane is held to the top's wash and a caption at the bottom to the
     bottom's. Any other gradient (radial, conic, a keyword corner) cannot be placed here, and is
     held to the WORSE of its lightest and darkest stop: the honest answer to "somewhere on this box"
     is both ends. Only those two are kept, so a stack of gradients cannot multiply. */
  const stopsOf = img => {
    const out = [];
    const re = /((?:rgba?|color)\([^()]*\))(?:\s+(-?[\d.]+)%)?/g;
    let m;
    while ((m = re.exec(img))) {
      const c = parse(m[1]);
      if (c) out.push({ c: c, at: m[2] === undefined ? null : Number(m[2]) / 100 });
    }
    if (!out.length) return out;
    if (out[0].at === null) out[0].at = 0;
    if (out[out.length - 1].at === null) out[out.length - 1].at = 1;
    for (let i = 1; i < out.length - 1; i++) {
      if (out[i].at !== null) continue;
      let j = i; while (out[j].at === null) j++;
      const lo = out[i - 1].at, hi = out[j].at;
      for (let k = i; k < j; k++) out[k].at = lo + (hi - lo) * (k - i + 1) / (j - i + 1);
    }
    return out;
  };
  const colourAt = (stops, t) => {
    if (t <= stops[0].at) return stops[0].c;
    for (let i = 1; i < stops.length; i++) {
      if (t <= stops[i].at) {
        const a = stops[i - 1], b = stops[i];
        const f = b.at > a.at ? (t - a.at) / (b.at - a.at) : 1;
        const mix = k => a.c[k] + (b.c[k] - a.c[k]) * f;
        return { r: mix('r'), g: mix('g'), b: mix('b'), a: mix('a') };
      }
    }
    return stops[stops.length - 1].c;
  };
  const grounds = el => {
    let accs = [{ r: 0, g: 0, b: 0, a: 1 }];       // the page itself, assumed opaque
    const box = el.getBoundingClientRect();
    const px = box.left + box.width / 2, py = box.top + box.height / 2;
    const chain = [];
    for (let n = el; n; n = n.parentElement) chain.push(n);
    for (const n of chain.reverse()) {
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) accs = accs.map(a => over(c, a));
      const img = String(cs.backgroundImage || '');
      if (!/gradient\(/.test(img)) continue;
      /* EACH LAYER, TOP LAYER LAST: CSS paints the first one listed on top. */
      const layers = img.split(/,\s*(?=(?:repeating-)?(?:linear|radial|conic)-gradient\(|url\()/).reverse();
      layers.forEach(layer => {
        const stops = stopsOf(layer);
        if (!stops.length) return;
        const ang = /^linear-gradient\(\s*(-?[\d.]+)deg/.exec(layer);
        const plain = /^linear-gradient\(\s*(?:rgba?|color)\(/.test(layer);   // no angle: 180deg
        if (ang || plain) {
          const r = n.getBoundingClientRect();
          const th = (ang ? Number(ang[1]) : 180) * Math.PI / 180;
          const dx = Math.sin(th), dy = -Math.cos(th);
          const len = Math.abs(r.width * dx) + Math.abs(r.height * dy) || 1;
          const t = ((px - (r.left + r.width / 2)) * dx + (py - (r.top + r.height / 2)) * dy) / len + 0.5;
          const s = colourAt(stops, Math.max(0, Math.min(1, t)));
          if (s.a > 0) accs = accs.map(a => over(s, a));
          return;
        }
        const all = [];
        accs.forEach(a => stops.forEach(s => { if (s.c.a > 0) all.push(over(s.c, a)); }));
        if (!all.length) return;
        all.sort((p, q) => lum(p) - lum(q));
        accs = all.length > 1 ? [all[0], all[all.length - 1]] : all;
      });
    }
    return accs;
  };
  const groundOf = el => grounds(el)[0];

  for (const el of inside) {
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!own) continue;
    const s = getComputedStyle(el);
    const fg = parse(s.color);
    if (!fg) continue;
    let bg = null, ratio = Infinity;
    grounds(el).forEach(g => {
      const solidFg = fg.a < 1 ? over(fg, g) : fg;
      const a = lum(solidFg), b = lum(g);
      const r = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      if (r < ratio) { ratio = r; bg = g; }
    });

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
  /* HOW MANY BOARDS THE RULE ABOVE `BOARDS` ACTUALLY MEASURED, printed with the summary — a count
     rather than a silence, because "no board was a mess" and "no board was found" both print no
     finding. */
  let boardsMeasured = 0;
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
        /* `TABS` IS A LIST OF OBJECTS, NOT OF IDS — `check/press.js` maps `t.id` and the first
           version here did not, which handed `go()` an object and skipped every column. It came
           back as 88 combinations where the run before it was 132, which is the only reason it was
           caught: a derived list that silently measures nothing looks exactly like a short one. */
        try { return (typeof TABS !== 'undefined' ? TABS : []).map(t => (t && t.id) || t)
                .filter(x => typeof x === 'string'); } catch (e) { return []; }
      });
    } catch (e) { return []; } finally { await page.close(); }
  })();
  if (!found.length) {
    console.warn('  ! the app did not report its columns, so this run measures the nine written '
               + 'into SCREENS_FALLBACK. A column added since is NOT being measured.');
    failures++;
  }
  const SCREENS = found.length ? found : SCREENS_FALLBACK;
  const screens = ONLY ? [ONLY]
    : PART.length === 2 ? SCREENS.filter((s, i) => i % PART[1] === PART[0] - 1) : SCREENS;

  if (SHOTS) fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });

  for (const [width, height] of SIZES) {
  for (const who of VISITORS) {
    const page = await browser.newPage({ viewport: { width, height },
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

        /* ---------- THE PICTURES ARE DRAWN AS THEY WERE TAKEN ------------------------------------
           THIS PLACE HELD THE OPPOSITE RULE FOR A DAY. "FILM LOOK" required a grain `mask-image`
           and a warm `filter` on every post picture and reel clip, because the owner had asked for
           "a grainy look ... like 1999 or 2003"; then asked *"remove the 2002 grainy effect on the
           posts"*, and the CSS went. Turned round rather than deleted, because the reason it was
           written still holds the other way up: a look that is two properties ON THE PICTURE is
           invisible to every layout rule in this file — it measures perfectly — so a filter or a
           mask put back on these pictures, by any selector, would be noticed by nothing else.
           ONLY THE PICTURES, NOT EVERY ELEMENT. The old rule walked the whole screen to catch the
           grain leaking onto a caption; with no grain left there is nothing to leak, and these are
           the only elements the look was ever on. `.post-face` (the avatar) is not a picture of the
           post and was never in scope. AND NONE TO MEASURE IS NOT A PASS: the fixture's post
           carries photographs and the reel column always has its clips, so finding none on either
           is a selector that stopped reaching its subject. */
        const tinted = await page.evaluate(sid => {
          const host = document.getElementById('s-' + sid);
          if (!host) return [];
          const pics = [...host.querySelectorAll('.post img, .post video, .post-preview img, '
                                                + '.post-preview video, .reel video')]
            .filter(el => /\bpost-(pic|cell)\b/.test(el.className) || el.classList.contains('feed-vid'));
          const out = [];
          pics.forEach(el => {
            const st = getComputedStyle(el);
            const mask = st.maskImage || st.webkitMaskImage || 'none';
            if (st.filter !== 'none' || mask !== 'none') {
              out.push(`${el.tagName.toLowerCase()}.${el.className.split(/\s+/)[0]} is drawn through `
                       + (st.filter !== 'none' ? `filter ${st.filter.slice(0, 60)}` : `a mask`)
                       + ` rather than as it was taken`);
            }
          });
          if (sid === 'feed' && !pics.length) out.push('the feed drew no post picture to measure');
          if (sid === 'reel' && !pics.length) out.push('the reel column drew no clip to measure');
          return out;
        }, id);
        if (tinted.length) rows.push({ width, id: label, as: who.as, tinted });

        /* EVERY SQUARE OF EVERY BOARD ONE SIZE — see `BOARDS`. `getBoundingClientRect` and not
           `offsetWidth`, because a cell 24.72px wide and one 24.7px wide are one size and integer
           rounding would call them two; a translate (Connect 4's falling counter) moves a box
           without resizing it, so a counter caught mid-drop is still measured at its own size. */
        const boards = await page.evaluate(({ sid, sel, tol }) => {
          const host = document.getElementById('s-' + sid);
          const out = [];
          let n = 0;
          if (!host) return { out, n };
          host.querySelectorAll(sel).forEach(b => {
            const kids = [...b.children];
            if (kids.length < 4) return;
            const sz = kids.map(k => k.getBoundingClientRect());
            if (!sz.some(r => r.width > 0)) return;
            n++;
            const ws = sz.map(r => r.width), hs = sz.map(r => r.height);
            const spread = a => Math.max(...a) - Math.min(...a);
            if (spread(ws) > tol || spread(hs) > tol) {
              const name = b.id ? '#' + b.id : '.' + String(b.className).split(/\s+/)[0];
              const odd = sz.filter(r => Math.abs(r.height - Math.max(...hs)) > tol
                                      || Math.abs(r.width - Math.max(...ws)) > tol).length;
              out.push(`${name}: ${odd} of ${kids.length} squares are not the board's size — `
                + `${Math.min(...ws).toFixed(1)}-${Math.max(...ws).toFixed(1)}px wide, `
                + `${Math.min(...hs).toFixed(1)}-${Math.max(...hs).toFixed(1)}px tall`);
            }
          });
          if (sid === 'games' && !n) out.push('the Games column drew no board to measure');
          return { out, n };
        }, { sid: id, sel: BOARDS, tol: BOARD_TOL });
        boardsMeasured += boards.n;
        if (boards.out.length) rows.push({ width, id: label, as: who.as, boards: boards.out });

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

    /* ---------- THE DOCUMENT MUST NOT SCROLL -----------------------------------------------------
       THIS APP IS ONE VIEWPORT WITH THE COLUMNS MOVED BY TRANSFORMS. `#screen` is `100dvh` minus the
       four spacing variables and `body` pads by exactly the same four, so the document is the
       viewport and there is nothing under it. A document that CAN scroll is therefore never a
       feature here — it is always some box or padding that outgrew the arithmetic.

       REPORTED AS "sometimes when trying to swipe up on phone it scrolls on the whole page ... it
       feels clunky", and measured: `@media (max-width: 23rem)` reserved 3rem at the foot of `body`
       for a tab bar that was deleted from index.html, so at 320x568 the document was 609px inside a
       568px viewport. On iOS that is worse than 41px of travel — any scrollable document lets Safari
       begin collapsing its toolbar, `100dvh` grows as it does, `#screen` and `body` grow with it,
       and the overflow changes underneath the gesture.

       NOTHING HERE COULD SEE IT, and each of the three geometry rules is right about what it asks.
       SIDEWAYS SCROLL is the other axis. OUT OF REACH asks whether a PANE hides content below its
       own fold — this pane did not, the padding was outside it. PANE OFF THE SCREEN asks whether a
       pane is placed outside the viewport — it was not. The loss is one box further out again: the
       DOCUMENT, which no rule had ever measured.

       ZERO TOLERANCE, not a floor, and that is the difference from every other rule in this file.
       The six-pixel floors elsewhere exist because `scrollHeight` is rounded from a layout in
       fractions and a pane that fits exactly reports a pixel or two. Here the two numbers are the
       same `100dvh` twice, so they agree exactly — measured at six phone sizes, the overflow is 0px
       and not 1px. A floor would let the next 3rem in as long as somebody wrote it as 3px.

       PER WIDTH AND VISITOR, not per screen: the document is the document whichever column is in
       front of it, and asking nine times would report one fault as nine. */
    const docScroll = await page.evaluate(() => {
      const se = document.scrollingElement || document.documentElement;
      const over = se.scrollHeight - se.clientHeight;
      if (over <= 0) return null;
      /* WHAT STICKS OUT, because a number with nothing to look at is a fault nobody can act on.
         Fixed elements are skipped — they cannot lengthen the document — and so is anything inside a
         box that clips, which `#screen` does. */
      const past = [];
      document.querySelectorAll('body > *').forEach(el => {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.position === 'fixed') return;
        const r = el.getBoundingClientRect();
        past.push({ what: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''),
                    h: Math.round(r.height) });
      });
      const bs = getComputedStyle(document.body);
      return { over: Math.round(over), h: se.scrollHeight, vh: se.clientHeight,
               pad: bs.paddingTop + ' / ' + bs.paddingBottom,
               kids: past.map(k => k.what + ' ' + k.h + 'px').join(', ') };
    });
    if (docScroll) rows.push({ width, id: '—', as: who.as, docScroll });

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
    const k = kind + '\u0000' + key;
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
    /* LIKE THE ONE BELOW IT, NOT GROUPED UNDER A SCREEN: the document belongs to no column. */
    if (r.docScroll) add('THE DOCUMENT SCROLLS',
      `the page is ${r.docScroll.h}px tall inside a ${r.docScroll.vh}px viewport, so the whole app `
      + `can be scrolled by ${r.docScroll.over}px — body padding ${r.docScroll.pad}, `
      + `children ${r.docScroll.kids}`,
      `${r.width}px${r.as === 'in' ? ' signed in' : ''}`);
    if (r.ragged) add('COLUMNS OUT OF LINE',
      `the current card starts ${r.ragged.by}px apart across ${r.ragged.n} columns — `
      + `${r.ragged.hi.id} at ${r.ragged.hi.top}, ${r.ragged.lo.id} at ${r.ragged.lo.top}`,
      `${r.width}px${r.as === 'in' ? ' signed in' : ''}`);
    /* THE SCREEN NEVER DREW. Grouped like the rest so one broken card across four widths and two
       visitors is one line to fix rather than eight, and so it is counted exactly once. */
    if (r.drawFailed) add('SCREEN DID NOT DRAW', r.drawFailed, at);
    (r.tinted || []).forEach(f => add('PICTURE NOT AS TAKEN', f, at));
    (r.boards || []).forEach(f => add('BOARD SQUARES OF MORE THAN ONE SIZE', f, at));
    (r.overflow || []).forEach(o => add('SIDEWAYS SCROLL',
      `${o.tag}.${o.cls.split(/\s+/)[0] || ''} overflows by ${o.by}px`, at));
    (r.hidden || []).forEach(o => add(o.tol ? 'OUT OF REACH, INSIDE THE APP\'S OWN FLOOR (known)'
                                             : 'OUT OF REACH',
      `.pane holding ${o.cls.split(/\s+/)[0] || o.tag} hides ${o.by}px below its own fold`, at,
      o.tol ? `A PANE THIS CLOSE TO FITTING IS LEFT CLIPPED ON PURPOSE, and the number is `
            + `\`PANE_REACH\` in find.js — ${o.floor}px, read out of the page rather than written `
            + `here, so the app and this rule cannot drift apart about one question. Below it the `
            + `competing gesture is the app's whole navigation: \`scrollHost_\` would take a swipe `
            + `to move the card by a few pixels and the page would not turn, which reads as a swipe `
            + `that did nothing. THE CONTENT REALLY IS UNREACHABLE and that is why this prints `
            + `rather than staying silent — under a line of text on a card whose own design is the `
            + `only thing that can win it back.`
            : undefined));
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
    (r.shrunk || []).forEach(o => add('CARD DRAWN SMALLER TO FIT (known)',
      `.${o.cls || 'card'} at ${Math.round(o.z * 100)}%`, at,
      `ASKED FOR: "I don't like scrolling. If you need to leave things more compact or smaller font. `
      + `This goes for all widgets so they all fit on screen." \`paneReach_\` in find.js shrinks a card `
      + `taller than its pane, down to PANE_ZOOM_MIN, and only scrolls past that. Its controls shrink `
      + `with it — the trade the owner chose — so each is judged above at its own size, and this line `
      + `is how many cards pay it and by how much.`));
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
            + `${SIZES.length} sizes (${SIZES.map(([w, h]) => w + 'x' + h).join(', ')}) x `
            + `${VISITORS.length} visitors: ${VISITORS.map(v => v.as === 'in' ? 'signed in'
                                                                : 'signed out').join(' and ')})\n`);
  console.log(`boards measured square by square: ${boardsMeasured}\n`);

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
