# check/ui.js

The full text of comments in `check/ui.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/ui.js WHAT A PAIR OF EYES WAS FOR, DONE AS MEASUREMENTS.

top level, before `chromium`

```
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
```

### ITS OWN PORT, AND IT DID NOT HAVE ONE.

top level, before `PORT`

```
/* ITS OWN PORT, AND IT DID NOT HAVE ONE. `check/deploy.js` defaults to 8731 as well, which cost
   nothing for as long as the two ran one after another — and `js/check-all.js` starts the four
   browser-driven checks together now, where two servers asking for one port is one of them dying on
   EADDRINUSE with a stack trace instead of a report. Overridable for the same reason deploy's is:
   a port is the one thing about a harness that depends on what else is running. */
```

### `let`, BECAUSE A SECOND `--part` CANNOT HAVE THE SAME PORT:

top level, before `PORT`

```
/* `let`, BECAUSE A SECOND `--part` CANNOT HAVE THE SAME PORT: both halves run at once under
   check-all, and the first one to bind `UI_PORT` would leave the other failing on EADDRINUSE. Part 1
   takes `UI_PORT` as it always has; any later part asks the system for a free one (see `serve`), so
   no second fixed number has to be agreed with the other machines' workers. */
```

### ---------- THE FIXTURE, OR THE REAL PAYLOAD

top level, before `PAYLOAD_AT`

```
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
```

### ---------- `questions` AND `checklists` ARE NOT IN THE FIXTURE ANY MORE

top level, before `PAYLOAD_AT`

```
/* ---------- `questions` AND `checklists` ARE NOT IN THE FIXTURE ANY MORE --------------------------
   THEY WOULD BE IGNORED IF THEY WERE. `js/library.js` builds both from `data/questions.json`, which
   this server serves out of the repository like any other file — so whatever a fixture said about
   them was overwritten a moment after the payload landed, and editing it would have changed
   nothing. A fixture key that silently does nothing is the fault this whole suite exists to catch.

   THE LIBRARY IS COMMITTED DATA NOW, so it is as fixed as the fixture ever was: the same rows every
   run, versioned, and diffable. There is nothing to stand in for. */
```

### ---------- AND A STRANGER IS SENT WHAT `doGet` SENDS A STRANGER

top level, before `FIXTURE_ANON`

```
/* ---------- AND A STRANGER IS SENT WHAT `doGet` SENDS A STRANGER -----------------------------------
   THE FIXTURE IS THE ADMIN'S PAYLOAD, and it was served to the signed-out visitor too — so every run
   measured a stranger's videos card and Find holding three films that `doGet` builds inside
   `if (viewerIsAdmin)` and sends nobody else (note 068, `filmsFor_`). A fixture must send what doGet
   really sends: for the visitor who is not an admin, `films` is `[]` and `filmsSync` is not there. */
```

### `--part=1/3` MEASURES A THIRD OF THE SCREENS.

top level, before `PART`

```
/* `--part=1/3` MEASURES A THIRD OF THE SCREENS. The note in js/check-all.js asked for exactly this
   when the run outgrew its fifteen minutes: split the states across runs rather than raise the clock
   again. Which screens go in which part is `dealt_` below. A run with no `--part` measures everything,
   as before. */
```

### DEALT BY WEIGHT, NOT BY TURN.

top level, before `dealt_`

```
/* DEALT BY WEIGHT, NOT BY TURN. Every third screen in `TAB_ORDER` put Find, Games and Settings in one
   part -- 98 of the 151 states -- and on 8 Oct that part took 796s alone against 224s for the first,
   and ran past check-all's fifteen minutes whenever the other browser checks shared the machine. A
   screen costs what its states cost (each is measured at every size, for both visitors), so: heaviest
   first, each to the part with the least so far, and each part keeps the app's own order. The same
   screens always land in the same part. Find is a part of its own now; when one screen outgrows a
   part, it is that screen's states that want dividing, not the clock raising. */
```

### ---------- THE SCREENS, READ OFF THE APP RATHER THAN WRITTEN OUT HERE

top level, before `SCREENS_FALLBACK`

```
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
```

### THE SIZES THAT EXIST, AND THE HEIGHT IS HALF OF EACH ONE.

top level, before `WIDTH_ONLY`

```
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
```

### AND 1920x1080, ADDED 6 OCTOBER WITH THE WIDE WINDOW (THE GRID SHOWS MORE OF ITSELF, shell.js).

top level, before `WIDTH_ONLY`

```
/* AND 1920x1080, ADDED 6 OCTOBER WITH THE WIDE WINDOW (THE GRID SHOWS MORE OF ITSELF, shell.js).
   From 700px up the app stops being one phone-width column and shows whole screens side by side —
   one wider card at 768, three at 1280, five at 1920 — and those are three different layouts, not
   one layout at three sizes. 1280 already measured the three; nothing measured the five, which is
   the one where the most columns are on the glass at once and a card is narrowest beside others.
   `--width=1920` measures one size alone, for the same reason `--screen` measures one screen. */
```

### THE STATES A SCREEN CAN BE IN — see check/states.js, which `check/press.js` reads as well.

top level, before `STATES`

```
/* THE STATES A SCREEN CAN BE IN — see check/states.js, which `check/press.js` reads as well. One
   list, because a state declared for the measuring pass and not the pressing one is a surface
   nobody presses, and that is the hole the booking grid lived in. */
```

### ---------- AND THE VISITOR, WHICH THIS FILE HAD NEVER THOUGHT ABOUT

top level, before `VISITORS`

```
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
```

### ---------- AND A `profile`, BECAUSE AN EMPTY BOX IS NOT THE BOX PEOPLE HAVE

in `VISITORS`

```
/* ---------- AND A `profile`, BECAUSE AN EMPTY BOX IS NOT THE BOX PEOPLE HAVE --------------------
     THE SEED CARRIED NONE, so every card on the Settings column has been measured EMPTY on every
     run — which for a form is measuring the one state that cannot overflow. `loginReplyFor_` sends
     a person their own values now (see `profileOf_`), so a returning visitor arrives with boxes
     that have something in them, and this is that visitor.

     INVENTED, AND SHAPED TO BE THE WIDEST CASE RATHER THAN THE TIDIEST. The note is the longest
     thing any of these boxes ever holds; the card number is the full length a borough prints on
     one. Nothing here is anybody's — this file is committed to a public repository, which is the
     whole reason the real ones live in a spreadsheet. */
```

### ---------- THREE LIBRARIES, BECAUSE THE SHELF DRAWS THREE

in `profile`

```
/* ---------- THREE LIBRARIES, BECAUSE THE SHELF DRAWS THREE ------
                                     (The shelf is the library cards widget on Tools since
                                     docs/history/339, drawn from this profile.)
                                     THE SEED HELD `library_card`/`library_pin`, which are the
                                     names from before the nine boxes became one cell — so it
                                     would have measured an EMPTY shelf, which is the fault this
                                     file records about the fixture stating `focus` as a string
                                     `doGet` does not send. All three filled, and the longest
                                     library name the shelf will ever hold, because the row is
                                     `1fr max-content` and the name is the track that gives. */
```

### ---------- KNOWN, WITH A WRITTEN REASON EACH, AND STILL PRINTED

top level, before `ACCEPTED_TAP`

```
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
```

### `onCardEdit`: ACCEPTED ONLY INSIDE A CARD'S EDITOR (`.card-ed`), the one place the wardrobe is drawn since docs/history/339 — the review of it found this entry

in `ACCEPTED_TAP`

```
/* `onCardEdit`: ACCEPTED ONLY INSIDE A CARD'S EDITOR (`.card-ed`), the one place the wardrobe is drawn since
     docs/history/339 — the review of it found this entry matching the class anywhere, so a swatch drawn somewhere
     new would never have been measured. */
```

### ---------- A BOARD IS SQUARES OF ONE SIZE

top level, before `BOARDS`

```
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
```

### ---------- A WAIT IS THE ONE LOADER, THE SAME EVERYWHERE, AND IT HOLDS ITS ROOM

top level, before `LOADER_TOL`

```
/* ---------- A WAIT IS THE ONE LOADER, THE SAME EVERYWHERE, AND IT HOLDS ITS ROOM ------------------
   THE OWNER, 9 Oct: *"Every widget has unique loading look. They should all have a simplistic simple
   loading thing while it's info or whatever is loading."* `js/check-loading.js` reads the source for a
   wait drawn any other way; this measures the one that is drawn, wherever a state puts it on the
   screen — and `check/states.js` holds three widgets on a real request so that there is one to measure
   (`the business records still coming`, `the videos still coming`, `the camera still starting`).

   ASKED OF EVERY LOADER ON THE PAGE IN FRONT, IN EVERY STATE:
     · it is the one loader — `role="status"`, three dots;
     · its dots are the size and the gap of `loading_()` as the app draws it with nothing round it — a
       reference loader is put on the page, measured and taken off again, so the size is the app's own
       and not a number written here — and the same as every other loader measured at that width
       (`loaderSizes`, compared once the run is over). The size is `rem`, so it is a fact per width;
     · the dots are centred in the loader's box, and the box is centred across its card — "the same
       place in every card".
   AND OF A STATE THAT CAN `release` WHAT IT HELD: the card's height is taken with the loader on it,
   the request let go, `landed` waited for, and the height taken again. The loader is drawn OVER what
   is already there precisely so that these are the same number; a difference is the card jumping at
   the moment its content arrives.

   MEASURED BY LAYOUT, NOT BY PAINT. The dots breathe — a scale of .75 to 1 — so a dot's painted
   width depends on the frame; `offsetWidth` is the box before the transform, and a box's centre is
   where it is whatever the scale, because a transform scales about the middle. */
```

### CENTRE TO CENTRE, which is the dot and the gap together:

in `loadersOn`

```
/* CENTRE TO CENTRE, which is the dot and the gap together: a transform scales about the middle, so
         the centres are where layout put them on every frame, to the sub-pixel — where `offsetLeft` is
         rounded to a whole pixel and called two equal loaders a pixel apart. */
```

### AND UNZOOMED: `paneReach_` draws a card too tall for its pane smaller with CSS `zoom`, which `offsetWidth` does not see and a rectangle does — so the pitch is

in `loadersOn`

```
/* AND UNZOOMED: `paneReach_` draws a card too tall for its pane smaller with CSS `zoom`, which
         `offsetWidth` does not see and a rectangle does — so the pitch is divided back by the zoom the
         loader sits under, and a loader on a shrunk card is the same loader. */
```

### ---------- A CUSTOM PROPERTY NOTHING ANYWHERE SETS

top level, before `deadVars`

```
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
```

### ---------- SERVING THE REAL FILES

top level, before `MIME`

```
/* ---------- SERVING THE REAL FILES ------------------------------------------------------------
   Not a copy, not a build — the files as they are on disk, so what is measured is what would ship.
   file:// would have done, except the app behaves differently there on purpose (see `jsonp` in
   data.js), and measuring the fallback path tells you nothing about the path everybody uses. */
```

### ---------- THE MEASUREMENTS, RUN INSIDE THE PAGE

top level, before `settled`

```
/* ---------- THE MEASUREMENTS, RUN INSIDE THE PAGE -----------------------------------------------
   One function, passed whole to the browser, because crossing the boundary per element would turn
   two thousand elements into two thousand round trips. */
```

### ---------- NOTHING IS MEASURED WHILE A COLUMN IS STILL SLIDING

top level, before `settled`

```
/* ---------- NOTHING IS MEASURED WHILE A COLUMN IS STILL SLIDING ----------------------------------
   A FIXED WAIT WAS ALL THERE WAS — 450ms after `go`, 500ms after a state's `enter` — and on a loaded
   machine a column's slide outlasts it. Both geometry rules then read a card part-way to where it was
   sent: PANE OFF THE SCREEN named eleven panes 5–1949px out in one full run of `--part=2/2` and a
   different set the next, and COLUMNS OUT OF LINE named `games` 3–42px off the middle with its
   placed shift EXACTLY the one `columnShift_` asked for and one transition still running on the
   column (traced on 6 October). Both rules are about where a card RESTS. So: no running animation on
   any column, no placement booked for the next frame, then two frames — bounded at 4s, after which
   whatever is there is measured and reported as it is. */
```

### ---------- A DRAWN PICTURE IS ROUND, AND ITS OWN BOX MUST NOT CUT IT

top level, before `FACE_SEL`

```
/* ---------- A DRAWN PICTURE IS ROUND, AND ITS OWN BOX MUST NOT CUT IT ----------------------------------
   THE TEN PICTURES AND THE FIGURE'S BUST (`pfpArt_`, `avatarFor(…, { bust: true })`, links.js) are each a
   circle that touches the edge of its own `<svg>` — the ground is r=24 in a 48 viewBox, the bust's clip
   r=20 in a 40 one. An `<svg>` inside a page clips to its own box by default, and that clip is SNAPPED TO
   THE PIXEL GRID while the circle is not: under `paneReach_`'s zoom (0.858 on a 320 Settings card) or at
   a fractional column position, the snap lands a pixel inside the circle and the picture gets a flat
   side. Found by review on 10 Oct: the fox, robot and guitar flat on the right, the football, guitar and
   palette flat at the bottom, on the picker at 320 — and every rule here measured eleven fine buttons.
   NO RULE ABOUT BOXES CAN SEE IT: the box is the right size, in the right place, and fully on the glass.
   It is a question about pixels, so it is asked of pixels. The screen is photographed as it is, then
   with each drawing's OWN clip lifted (`overflow: visible` on that `<svg>`, nothing else), then as it is
   again; a pixel counts only where the two as-it-is pictures agree and the lifted one differs, so a
   loader or a slide moving between the shots cannot be read as a cut. THE FRAME ROUND A FACE IS NOT
   ASKED: `.prof-pic` and `.post-face` are round by design and clip to their own border, which is a
   circle — it never makes a flat side. Only the drawings fully on the glass, in the column in front. */
```

### ---------- A WIDGET ON THE GLASS IS DRAWN, NOT WAITING TO BE STARTED

top level, before `veiledOnGlass`

```
/* ---------- A WIDGET ON THE GLASS IS DRAWN, NOT WAITING TO BE STARTED ----------------------------------
   THE OWNER, 10 Oct, with a screenshot at about 1194px: Settings in front, and the column beside it two
   widget cards that were nothing but the gold dots and a star — *"these remain loading untill i scroll
   to them. i dont like this"*. Every rule here measured the screen in front; the loader that stood for a
   widget nobody had started was on the screen BESIDE it, which on a wide window is whole and readable,
   and nothing asked. So: every widget's slot anywhere on the glass — whichever column — that still holds
   the veil `widgetOnColumn_` draws over a widget not yet started (`aria-busy` with the loader as its
   child). A widget's own wait inside its slot (the Videos card's list, the flyer's rooms) is a wait for
   data and is `loadersOn`'s, not this.

   ON THE GLASS MEANS MORE THAN 24px OF THE SLOT INSIDE `#screen` BOTH WAYS, in a column and a page that
   are drawn (not `opacity: 0`, not `visibility: hidden`). 24 is `WIDE_EDGE`, the edge the wide layout
   leaves past the last whole column: a phone's neighbour, or the 8px of card at the end of a 1280 row,
   shows no widget, and a widget the layout cannot show is not one that should be running.

   AFTER SETTLE AND THEN ASKED AGAIN FOR UP TO 3s, because a widget beside the one in front is started by
   the same queue as a far one — one per task, behind the slide — and a loaded machine is late, not wrong.
   One that has not started by then never will without somebody going to it.

   ---------- AND THE OTHER WAY: A WIDGET RUNNING BESIDE THE COLUMN IN FRONT WITH NO SLOT ON THE GLASS ----------
   FOUND BY THE REVIEW OF 331. The rule above only asked whether a slot on the glass was still veiled, so
   starting too MUCH passed it: `glassNow_` (shell.js) lit a page if any pixel of the PAGE was in the
   window, and at 1194 on Settings the flyer maker's page reached 75px into the window while its slot began
   13px below it — only its star showed, and the widget was running. The review took the page test out of
   `glassNow_` altogether (every page lit) and this rule, and all five journeys, stayed green while Chromium
   ran three Tools widgets off the glass. So every entry of `TOOLS_ON` (arcade.js: the widget, the column it
   was started on and its slot) whose column is not the one in front — the column in front starts all of its
   widgets, by design — is measured by the same test as above, and one whose slot shows 24px or less of
   itself on the glass either way, or is in no column at all (a paint threw its markup away), is a widget
   running for nobody. Asked over the same 3s, because what leaves the glass is stopped once the slide has
   settled, and on a loaded machine that is late too. */
```

### ---------- THE SCREEN WE ASKED FOR, BY NAME

in `inspect`

```
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
```

### ---------- AND THE SHEET, WHEN ONE IS OPEN

in `inspect`

```
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
```

### `#drop` WAS MEASURED HERE, for the sheet's reason:

in `inspect`

```
/* `#drop` WAS MEASURED HERE, for the sheet's reason: the booking form's list of answers was a panel
     outside the screens. Since 9 October it is checkboxes in the card (note 315), inside `#s-booking`,
     so the screen's own sweep measures every box — and there is no panel left to add. */
```

### ---------- AND THE MATHS KEYPAD, FOR THE SAME REASON AGAIN

in `inspect`

```
/* ---------- AND THE MATHS KEYPAD, FOR THE SAME REASON AGAIN -------------------------------------
     `#kp` IS ONE ELEMENT ON <body> (keypad.js), fixed to the foot of the app, so its thirty keys were
     outside every screen this file measured -- tap size, contrast, all of it -- for as long as the pad
     has existed, including the state that exists to picture it. Found on 8 Oct, when the owner said the
     keys could not be seen in the sun and nothing here had ever looked at one. */
```

### ---------- 1. SIDEWAYS SCROLL THAT NOBODY ASKED FOR

in `inspect`

```
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
```

### ---------- A ONE-LINE TEXT FIELD IS A BOX THAT WAS TOLD IT COULD

in `inspect`

```
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
```

### ---------- AND NOTHING INSIDE A DRAWING CAN PUSH THE PAGE SIDEWAYS

in `inspect`

```
/* ---------- AND NOTHING INSIDE A DRAWING CAN PUSH THE PAGE SIDEWAYS -------------------------
       The outermost `<svg>` clips to its own viewport — the UA default — so a descendant's layout
       box cannot reach the card. The `<svg>` itself is an ordinary replaced element and is still
       measured. `check/cards.js` learned this first (CLAUDE.md, "`check/cards.js` was measuring
       inside the drawings"); this file met it the day a paper audit put the 2017 Higher Q1 scatter
       graph on a page beside the bundle state, and reported its rotated y-axis caption — written
       once and turned into place, so its layout box runs off to the left — as the card scrolling. */
```

### ---------- AND AN ELLIPSIS IS THE OTHER WAY OF BEING TOLD

in `inspect`

```
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
```

### ---------- AND TEXT KEPT FOR A SCREEN READER IS THE THIRD WAY OF BEING TOLD

in `inspect`

```
/* ---------- AND TEXT KEPT FOR A SCREEN READER IS THE THIRD WAY OF BEING TOLD -------------------
       THE VISUALLY-HIDDEN PATTERN — a 1px box, `overflow: hidden`, `clip-path: inset(50%)` — is a
       declaration that the words are NOT to be seen: they are there for a screen reader, and the box
       is made too small for them on purpose. `scrollWidth` reports the words as overflowing the 1px
       they were put in, which is the pattern working, exactly as the ellipsis above was. Nothing of
       it is painted, so nothing can be dragged into view.

       IT ARRIVED WITH THE BOXER'S BOUTS. The W / L square was `aria-label` on a bare `<span>`, which
       most screen readers ignore, so it is hidden from them and a word they do read stands beside it
       (`.boxer-say`) — and this rule reported "Won, " as a 24px sideways scroll on every fights page.
       NARROW ON PURPOSE: clipped to nothing AND no wider than a pixel, so `overflow: hidden` on any
       visible box is still the fault it always was. */
```

### ---------- AND A PLAYER CROPPED TO COVER ITS FRAME IS THE FOURTH

in `inspect`

```
/* ---------- AND A PLAYER CROPPED TO COVER ITS FRAME IS THE FOURTH -----------------------------
       `object-fit: cover` IS HOW A `<video>` OR AN `<img>` FILLS A BOX OF ANOTHER SHAPE, and it is
       invisible to this rule because the element's own box never grows. An `<iframe>` has no such
       property — YouTube's player inside one letterboxes — so a Short in a reel (note 319) is the
       same crop done the only way an iframe allows: the frame is made the size a 9:16 picture needs
       to cover the slide, centred, and `.feed-yt` clips it. At 390 that is 333px in a 272px box, and
       this rule reported the crop working as a 31px sideways scroll.

       CENTRED IS WHAT MAKES IT NARROW. A cover crop takes the same off both sides; a layout fault —
       a box too wide for its column — starts at the left edge and spills off the right only. So the
       box must clip (`overflow: hidden` on its own is still not permission), every child painted
       past it must be an `<iframe>`, and each must overhang left and right by the same amount to
       2px. A player that is merely too wide is still reported. */
```

### THE FURTHEST ANY CHILD IS ACTUALLY PAINTED.

in `inspect`

```
/* THE FURTHEST ANY CHILD IS ACTUALLY PAINTED. Children only — the element's own rect is the
         box being overflowed, and asking whether it overflows itself always answers no.

         AN ELEMENT WITH NO ELEMENT CHILDREN IS NOT EXEMPT, and the first version of this made it
         so. A long unbreakable word in a plain `<div>` overflows with nothing to measure, so
         `paintedRight` stayed at the box's own left edge and every text overflow in the app would
         have been silently dropped — a check quietly answering "fine" to the commonest case there
         is. Text cannot be transformed away from its own box, so where there is nothing to measure
         the browser's `scrollWidth` is already the right answer and is taken as it stands. */
```

### ---------- AND THE OTHER AXIS, WHICH IS THE ONE THE APP IS NAVIGATED ON

in `inspect`

```
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
```

### AND THE FLOOR IS THE APP'S OWN NUMBER, NOT ONE OF THIS FILE'S.

in `inspect`

```
/* AND THE FLOOR IS THE APP'S OWN NUMBER, NOT ONE OF THIS FILE'S. `paneReach_` leaves a pane
     `hidden` unless it is more than `PANE_REACH` over, deliberately: below that the competing
     gesture is the app's whole navigation and handing it over for a few pixels reads as a swipe
     that did nothing. Asking with a floor of 2 while the app answers with a floor of 24 is two
     numbers for one question — this repository's oldest shape — so the rule reads the app's
     constant out of the page and anything at or under it is reported as the declared tolerance
     rather than as a fault. 2 only if the page does not have it, which is a boot that failed. */
```

### ---------- A BIBLE PAGE IS A CARD LIKE ANY OTHER NOW

in `inspect`

```
/* ---------- A BIBLE PAGE IS A CARD LIKE ANY OTHER NOW --------------------------------------------
       THIS FAILED A BIBLE PAGE THAT `paneReach_` HAD DRAWN SMALLER, because the first reader cut every
       chapter to the screen in measured pixels and one drawn smaller was its cut being wrong. The
       reader is gone (*"it should be like the other stuff ... each verse is a widget"*): a verse is one
       card, and the one too tall for a small phone — Esther 8:9 — and a grid of 150 chapters are drawn
       smaller to fit the way every card is, and counted under the known line below with the rest. */
```

### ---------- AND THE PANE ITSELF CAN BE OFF THE SCREEN, WHICH THE RULE ABOVE CANNOT SEE

in `inspect`

```
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
```

### ---------- EXCEPT A PANE THE KEYPAD LIFTED, WHOSE BOX IS WHOLE ON THE GLASS ABOVE IT

in `inspect`

```
/* ---------- EXCEPT A PANE THE KEYPAD LIFTED, WHOSE BOX IS WHOLE ON THE GLASS ABOVE IT ----------------
     THE PAD COVERS THE FOOT OF THE SCREEN, and `kpLift_` (keypad.js) lifts the column by exactly what
     the box being typed in is short of -- the phone's own keyboard pushes a page up the same way, and
     putting the pad away puts the column back (`kpRoomBack_`). On a card with a tall box that takes the
     card's TOP above the glass while the pad is up: an essay's sheet (docs/history/312), written with the
     question scrolled out of the way and the sheet, its row of tiles and the line being typed all above
     the pad. That is the design, not a pane placed for a card that has since changed size, so it is
     printed as KNOWN -- and ONLY when all three hold: the pad is up, the hold carries a lift, and the
     focused box's field and the row kept clear for it (`kpBox_`) are wholly on the glass above the pad.
     A lift that took the box itself off the top is still PANE OFF THE SCREEN. */
```

### ---------- AND A FIELD CAN BE IN THE WRONG COLUMN, WHICH NOTHING HERE COULD ASK

in `inspect`

```
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

     THE WEEK IS ONE OF TWO EXEMPTIONS AND ONLY ON ONE EDGE (the other is a waiting list's tally,
     beside it below, for the same reason). `.bk-row.bk-wk .bk-v` spans two tracks
     deliberately — ten pressable hours do not fit in the answer column, and the arithmetic is in
     style.css beside the declaration — so its RIGHT edge is allowed to differ and its LEFT edge is
     not, because the left edge is the one the eye tracks down the card.

     1.5px OF SLACK, WHICH IS SUB-PIXEL LAYOUT AND NOTHING ELSE. The smallest real fault this would
     have caught is 3px (`Extra subj.` overhanging its own label column); a track resolved by the
     browser differs between rows by hundredths. */
```

### ---------- AND A WAITING LIST'S TALLY, ON THE SAME EDGE FOR THE WEEK'S REASON

in `inspect`

```
/* ---------- AND A WAITING LIST'S TALLY, ON THE SAME EDGE FOR THE WEEK'S REASON ----------
             `.bk-row.bk-tally .bk-v` IS A CHART, NOT A VALUE: `Can come`'s bars, one per block the
             families offered, with `Wednesday afternoon` written on the longest. In the answer column
             alone they were 71px at 390 and the words were clipped by their own bars — measured on
             the first screenshot — so the row takes the three figure tracks it has nothing to put
             in. Its LEFT edge is still asked, because that is where every answer starts and the
             edge the eye runs down; a tally that started anywhere else would be named here. */
```

### AND A TOTAL'S LABEL, ON THE SAME EDGE AND FOR THE SAME KIND OF REASON.

in `inspect`

```
/* AND A TOTAL'S LABEL, ON THE SAME EDGE AND FOR THE SAME KIND OF REASON. `.rc-total .bk-k`
             spans every track but the figure's, so `CLIENT PAYS` and `TUTOR EARNS` cannot widen the
             question column and wrap every answer on the card — see the note beside it in
             style.css. Its LEFT edge is still asked: it starts where every other label starts. */
```

### ---------- A "TEXT CLIPPED RATHER THAN WRAPPED" RULE WAS HERE, AND IT WAS INERT

in `inspect`

```
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
```

### SUMMARY IS A TAP TARGET AND WAS NOT ON THIS LIST.

in `inspect`

```
/* SUMMARY IS A TAP TARGET AND WAS NOT ON THIS LIST. `<details>` arrived with the answer block on
       a question card (see `answerBlock_` in find.js) — the summary is the only way to open it, so a
       small one is exactly the fault this check exists to find, and it would have been invisible. */
```

### ---------- AND `data-do` IS WHAT A CONTROL IS IN THIS APP

in `inspect`

```
/* ---------- AND `data-do` IS WHAT A CONTROL IS IN THIS APP -----------------------------------
       THE WHOLE DISPATCH IS ONE DELEGATED LISTENER ON `data-do`, and `check/press.js` presses
       exactly those — so an element carrying one is a control by construction, whatever tag it
       happens to be. The colour swatches in the wardrobe are `<span data-do="av-colour">`: twenty-one
       of them, 30x30, invisible to this rule for as long as it asked about tag names only. A control
       nobody put in a `<button>` is not a smaller control. */
```

### ---------- A CONTROL INSIDE A LABEL IS NOT THE TARGET; THE LABEL IS

in `inspect`

```
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
```

### ---------- A SQUARE ON A GAME BOARD IS NOT AN ISOLATED CONTROL

in `inspect`

```
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
```

### CHESS JOINED THIS LIST when its board became a control — sixty-four squares that had been spans with no action, so the board could not be played at all.

in `inspect`

```
/* CHESS JOINED THIS LIST when its board became a control — sixty-four squares that had been
       spans with no action, so the board could not be played at all. Eight across is Othello's
       arithmetic exactly, and what makes a mis-tap survivable is the same: a tap on a square that is
       not one of the picked piece's legal moves does nothing to the game, it only picks or unpicks,
       and a move played in error comes back with Undo. */
```

### ---------- AND WHETHER A SCREEN READER CAN SAY WHAT IT IS

in `inspect`

```
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
```

### ---------- EACH CANDIDATE TRIMMED BEFORE THE `||`, NOT THE WHOLE CHAIN AFTER IT

in `inspect`

```
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
```

### A VALUE IS THE NAME OF A SUBMIT BUTTON AND OF NOTHING ELSE.

in `name`

```
/* A VALUE IS THE NAME OF A SUBMIT BUTTON AND OF NOTHING ELSE. `<input type="submit"
           value="Save">` really is named by its value; a text box holding `1985` is not — a
           screen reader announces that as the value and still has nothing to call the box.
           Unnarrowed, this rung made the rule BLIND to every unnamed box a person had typed
           into, which is the one state an unnamed box is usually found in. Proved by mutation:
           with the placeholder off, `dob_y` is silent while it holds `1985` and named the moment
           it is empty. This app has no submit input today (measured: zero across `js/` and
           `index.html`), so the narrowing costs nothing and stops the rung from covering for a
           fault. */
```

### ---------- HALF A PIXEL, BECAUSE THE RECT IS A SUM AND NOT A SIZE

in `inspect`

```
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
```

### ---------- AT ITS OWN SIZE, NOT THE SIZE A SHRUNK CARD DRAWS IT

in `inspect`

```
/* ---------- AT ITS OWN SIZE, NOT THE SIZE A SHRUNK CARD DRAWS IT -------------------------------
       `paneReach_` DRAWS A CARD SMALLER WHEN IT DOES NOT FIT ITS PANE — CSS `zoom`, down to
       `PANE_ZOOM_MIN` — because the owner asked for every widget to fit on the screen rather than
       scroll, "smaller font" included. So a 44px button on a card drawn at 0.9 is 40px on the glass,
       by design, and measuring the glass would report every control on every shrunk card as a new
       fault: 501 of them, the first run after it went in. The control is judged at the size the
       stylesheet gave it, and the shrinking is counted on its own line below — CARD DRAWN SMALLER TO
       FIT — so the cost is a number rather than a silence. */
```

### THE CLASS COMES BACK WITH IT, because a finding has to be identifiable to be accepted.

in `inspect`

```
/* THE CLASS COMES BACK WITH IT, because a finding has to be identifiable to be accepted. A
         report keyed on the element's TEXT cannot tell a 22px hour button from a 22px anything
         else, so an ACCEPTED entry written against the text would silence whatever happens to say
         the same word next year. The class is what the stylesheet acts on and what a reason can be
         written about. */
```

### ---------- 3. TEXT YOU CANNOT READ

in `inspect`

```
/* ---------- 3. TEXT YOU CANNOT READ ------------------------------------------------------------
     WITH THE TRANSPARENCY COMPOSITED, which the first version of this did not do — it walked up to
     the first ancestor with any background at all and compared against that, so a panel at 2.4%
     white over black was read as nearly-white and every label on it was reported as unreadable.
     Seven false alarms out of seven. Blending down the whole ancestor chain is four more lines and
     it is the difference between a check somebody trusts and a check somebody mutes. */
```

### `color(srgb r g b / a)` IS HOW CHROME COMPUTES A `color-mix()`, and its channels run 0 to 1, not 0 to 255.

in `inspect`

```
/* `color(srgb r g b / a)` IS HOW CHROME COMPUTES A `color-mix()`, and its channels run 0 to 1, not
     0 to 255. Read as `rgb()` a tinted chip's fill came out as nearly black at 10% -- so the tag
     chips' `--dim` field names measured 6.87:1 on every run while the real fill had them at 4.3, and
     the rule could never have caught the 14% tint that put them under the bar. */
```

### ---------- AND A GRADIENT IS READ WHERE THE TEXT IS

in `inspect`

```
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
```

### ---------- A TILE IS READ ONLY WHERE IT IS PAINTED

in `grounds`

```
/* ---------- A TILE IS READ ONLY WHERE IT IS PAINTED ----------------------------------------------
         EVERY GRADIENT WAS TAKEN TO COVER ITS WHOLE BOX, which was true of every one this app had until
         the dropdown arrow (note 315): two 5px gradients, `no-repeat`, at the box's right edge — and read
         as the ground under the words, they put `Autumn 1` on the booking row's button at 2.25:1 on
         `--dim`, a grey the words never touch. So a layer that does not repeat and has a size in pixels
         is placed as CSS places it — `background-position` resolves to `(box − tile) × P% + N px` in the
         padding box, which is how the computed `calc(100% - 4px)` reads — and counts only when the
         text's centre is inside it. A layer that repeats, or is sized to its box, is read as before. */
```

### ---------- 4. AN EDGE YOU CANNOT SEE (WCAG 1.4.11, 3:1)

in `inspect`

```
/* ---------- 4. AN EDGE YOU CANNOT SEE (WCAG 1.4.11, 3:1) ------------------------------------------
     THE OWNER, 8 Oct, from a pupil's iPad in the sun: the keypad and the answer box could not be found.
     Rule 3 measures TEXT, and every glyph on them passed it -- 7:1 and up. What failed was the SHAPE:
     the box's face against the card was 1.04:1, its rule 1.25:1, Check's plate 1.05:1, a key's face
     against the pad 1.03:1 and its edge 1.34:1. In glare that is glyphs floating on nothing, and no rule
     here could say so. WCAG 1.4.11 asks 3:1 of the boundary of a control against what is next to it.

     ON THREE SUBJECTS AND NO OTHERS, on purpose: the keypad's keys, the answer field (`.qp-bar > .qp-ans`,
     and an essay's sheet since 9 Oct) and the Send tile -- the three the complaint named and the
     redesign answered. Every plate-and-mark tile in the app is ~1.1:1 by design (`.tile`: "the mark is
     the button"), so the rule asked of all of them would be a red of two hundred lines that nobody
     reads, which is the fault this file keeps recording. A control passes if its FACE or its BORDER
     reaches 3:1 against the ground behind it,
     both composited down the chain as rule 3 does. A disabled control is exempt, as WCAG exempts it. */
```

### LOADERS, COUNTED LIKE BOARDS — a run that measured none and a run where every one passed print the same nothing.

top level, before `loadersMeasured`

```
/* LOADERS, COUNTED LIKE BOARDS — a run that measured none and a run where every one passed print the
     same nothing. `loaderSizes[width]` collects each one's dot and gap, compared once the run is over:
     "the same size in every card" is a question across states, not inside one. */
```

### ---------- ASK THE APP WHICH COLUMNS IT HAS, ONCE, BEFORE MEASURING ANY OF THEM

top level, before `found`

```
/* ---------- ASK THE APP WHICH COLUMNS IT HAS, ONCE, BEFORE MEASURING ANY OF THEM ---------------
     ONE THROWAWAY PAGE, SIGNED IN, because `applyColumns_` can switch a column off and `TABS` is
     what it rewrites — so the honest list is the one the app is holding after a real boot rather
     than the one `columns.json` happens to say. Signed in, because that is the visitor who can
     reach the most of them. */
```

### `TABS` IS A LIST OF OBJECTS, NOT OF IDS — `check/press.js` maps `t.id` and the first version here did not, which handed `go()` an object and skipped every

in `found`

```
/* `TABS` IS A LIST OF OBJECTS, NOT OF IDS — `check/press.js` maps `t.id` and the first
           version here did not, which handed `go()` an object and skipped every column. It came
           back as 88 combinations where the run before it was 132, which is the only reason it was
           caught: a derived list that silently measures nothing looks exactly like a short one. */
```

### ---------- A WHOLE PAGE WAITING ON THE PAYLOAD, AND WHAT IT BECOMES

top level, before `HELD_COLUMNS`

```
/* ---------- A WHOLE PAGE WAITING ON THE PAYLOAD, AND WHAT IT BECOMES ---------------------------------
     THE RELEASE-AND-REMEASURE BELOW ONLY EVER MET LOADERS DRAWN OVER A CARD (the records, Videos, the
     camera), because every other state is measured with the payload in. The commonest wait in the app
     is the other kind — a column that is nothing but the loader until `load()` answers — and review
     found it drawn as a full-cell EMPTY CARD whose edges collapsed 250–325px a side the moment the
     content landed (feed 807→311px at 390, Saved 807→158, Spotlight 807→177), with nothing here able
     to see it. So: a page of its own, signed in, with the payload HELD at the route; the columns that
     wait on it measured; the payload let go; the same columns measured again.
     WHAT IS ASKED (style.css, "A WHOLE PAGE WAITING"): while it waits the pane draws NO FRAME — no
     fill, no visible edge, no shadow — so there is nothing to jump from; and the card that lands is
     centred where the dots were. Its HEIGHT is not compared, because it is meant to differ: what is
     on its way is not known until it comes, which is the whole reason no frame is drawn for it.
     AT THE TWO PHONE WIDTHS, in the first part of a split run (or a run measuring one of these
     columns) — a boot per width is the cost, and a phone is where this is the first second of the app. */
```

### WHO IS LOOKING, SET BEFORE THE PAGE EXISTS.

top level, before `status`

```
/* WHO IS LOOKING, SET BEFORE THE PAGE EXISTS. `addInitScript` runs ahead of every script on the
       page, so `data.js` finds the key already there and signs the visitor in itself — the app's own
       door rather than a hand on `USER` after the fact. A `null` user writes nothing and leaves the
       run exactly as it was before this list existed. */
```

### ---------- AND THE PAYLOAD AND THE LIBRARY ACTUALLY IN, NOT A GUESS AT WHEN THEY WILL BE

top level, before `timeout`

```
/* ---------- AND THE PAYLOAD AND THE LIBRARY ACTUALLY IN, NOT A GUESS AT WHEN THEY WILL BE ----------
       EVERY COLUMN DRAWS THE ONE LOADER UNTIL THEY ARE (`loading_`, shell.js — the owner, 9 Oct), so a
       screen measured before `load()` has finished is a screen of loaders measured as if it were the
       column. 1800ms was always enough on a quiet machine; on 9 Oct, at a load average of sixty, the
       splash was still up at 1920 and the shop's first shelf "had no shelf of things". Asked for, up to
       thirty seconds — the repository's rule that a fixed sleep is a guess at when a job ran. */
```

### SIGNING IN MUST ACTUALLY HAVE HAPPENED.

top level, before `signedIn`

```
/* SIGNING IN MUST ACTUALLY HAVE HAPPENED. A seeded key the app ignores would leave this pass
       measuring the signed-out screens a second time and reporting it as coverage — "I did not
       check" printed as "I checked and it was fine", which is the failure this project keeps
       finding in its own checks. Louder than a skip, because a silent one looks like a pass. */
```

### DRIVEN THROUGH THE APP'S OWN FRONT DOOR.

top level, before `went`

```
/* DRIVEN THROUGH THE APP'S OWN FRONT DOOR. `go(id)` is what a tap calls, so anything it does
         on the way — remembering the page, painting neighbours — happens here too. A check that
         reaches past the app's navigation is checking a state the app cannot actually be in. */
```

### ---------- A COLUMN THIS VISITOR IS NOT GIVEN IS NOT MEASURED IN THEIR NAME

top level, before `went`

```
/* ---------- A COLUMN THIS VISITOR IS NOT GIVEN IS NOT MEASURED IN THEIR NAME ---------------------
         `biz` IS AN ADMIN'S (`columnsFor_`, shell.js; docs/history/334), and `go('biz')` for anybody else
         lands on the front door — so `--screen=biz` for the signed-out visitor measured the FEED and
         reported it as Business. Asked of the app's own row, asked again first (`columnsFor_`) because a
         Settings state plays another role on this visitor's phone and a repaint inside it leaves the row
         that role's: absent is a skip, said as one. */
```

### ASKED AGAIN FOR UP TO 2.5s, NOT ONCE.

top level, before `got`

```
/*
       ASKED AGAIN FOR UP TO 2.5s, NOT ONCE. Several states finish their `enter` on a timer of their
       own — `setTimeout(…, 150)` before the real press, so the card is placed first — and on a loaded
       machine that timer, the press and the paint behind it outlast the fixed wait above. Measured on
       6 October with `check/press.js --screen=stuff`: "a typed answer, marked not yet" did not arrive
       on 1 run in 2 on the base commit and on this branch alike, with nothing wrong in the app. A
       state that never arrives still fails, after the 2.5s; one that arrives late is measured. */
```

### AND WHY, WHEN THE STATE CAN SAY.

top level, before `why`

```
/* AND WHY, WHEN THE STATE CAN SAY. A state that measures something over time inside the
               page — a tap and the frames after it — knows what it saw, and "shows no …" alone sends
               whoever reads this to a screenshot that cannot show a fault three frames long. */
```

### ---------- A SCREEN THAT THREW WAS BEING MEASURED AND REPORTED CLEAN

top level, before `threw`

```
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
```

### REPORTED THROUGH `rows` LIKE EVERY OTHER FINDING, not counted here.

top level, before `width`

```
/* REPORTED THROUGH `rows` LIKE EVERY OTHER FINDING, not counted here. The summary reads
             `nothing to report` off the grouped buckets, so a fault that bumps `failures` without
             joining them makes the run exit 1 while printing that nothing is wrong — which is the
             overstatement the note above the summary already warns about, upside down. */
```

### COUNTED IN THE REPORT, NOT HERE.

top level, before `width`

```
/* COUNTED IN THE REPORT, NOT HERE. Every finding used to be a failure the moment it was
           measured, which left no place to ask whether it is one of the known ones — the accepted
           list has to be consulted where the findings are grouped, because that is where a finding
           has a class attached to it. Rows carry what was found; the report decides what it means. */
```

### ---------- THE PICTURES ARE DRAWN AS THEY WERE TAKEN

top level, before `tinted`

```
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
```

### ---------- THE REELS' SOUND TILE, MEASURED ON THE PICTURE IT SITS ON

top level, before `sound`

```
/* ---------- THE REELS' SOUND TILE, MEASURED ON THE PICTURE IT SITS ON ----------------------
           THE OWNER, 10 OCT: *"the sound on or off should be a tile like everything else."* A tile on a
           card is measured by the rules above like every other control; this one sits on a MOVING
           PICTURE, which none of them can see. Rule 3 composites a colour down the chain of elements
           behind it and a video's frame is not in that chain, so a mark in `--dim` on a white wall
           measures as grey on the app's black and passes. So, per reel on the screen (note 323):
             - it is `tile_`'s: `.tile` with one mark, no words drawn on it;
             - at least MIN_TAP square, and wholly inside its slide;
             - READABLE OVER ANY PICTURE: its plate composited over a white frame AND a black one,
               the mark against each at 3:1 (WCAG 1.4.11, a graphic) — the frame is whatever the clip
               is showing, so both ends are asked rather than the one that happens to be up;
             - CLEAR OF THE REEL'S OTHER OVERLAYS: the ▶ disc a held reel draws (a pseudo-element, so
               the slide is held for one synchronous read and let go), and any words on the slide;
             - ON TOP, WHERE A FINGER LANDS: `elementFromPoint` at its centre is the tile or something
               inside it. REVIEW, 10 OCT: every line above is a box and a colour, and none asks what is
               PAINTED there — `.reel-sound { z-index: -1 }` put the tile under the clip, invisible and
               impossible to press, and this printed "30 measured, nothing to report" over a shot with
               no tile in it. A box is a layout position; only a hit test says it is the top thing.
               ONLY ON THE CARD IN FRONT, AND ONLY WHERE IT CAN BE SEEN. `placeGrid` gives every page but
               the focused one `pointer-events: none` inline, on purpose (shell.js, "the card in front,
               not every column's current card"), so the next reel peeking up from below takes no press
               by design and its first run here reported it as covered by `.screen`. And a pane clips
               (the star at the foot of a widget, press.js), so a centre outside the viewport or any
               ancestor that clips is not asked either. The page's INLINE style is read, not the tile's
               computed one, so a tile that refuses presses itself is still asked. None asked on the
               column is a finding: the reel in front always has its tile in view.
           A dead Short hides its tile on purpose (`.reel:has(.feed-art.is-dead) .reel-sound`), so
           one not drawn there is not a finding; one not drawn anywhere else is. NONE MEASURED ON THE
           REELS COLUMN IS A FINDING TOO: it always has its clips. */
```

### A SLIDE WHOSE WHOLE PAGE IS UNDRAWN IS NOT ASKED.

in `sound`

```
/* A SLIDE WHOSE WHOLE PAGE IS UNDRAWN IS NOT ASKED. Since docs/history/341 the column holds six
               reels ahead and the band draws the pages a slide can carry onto the glass; the rest are hidden
               whole (`.far`), tile and all — which is the page, not the tile, and read here as "the Sound tile
               is not drawn on a clip that can play" for every reel from the fourth on. */
```

### EVERY SQUARE OF EVERY BOARD ONE SIZE — see `BOARDS`.

top level, before `boards`

```
/* EVERY SQUARE OF EVERY BOARD ONE SIZE — see `BOARDS`. `getBoundingClientRect` and not
           `offsetWidth`, because a cell 24.72px wide and one 24.7px wide are one size and integer
           rounding would call them two; a translate (Connect 4's falling counter) moves a box
           without resizing it, so a counter caught mid-drop is still measured at its own size. */
```

### EVERY DRAWN PICTURE ROUND — see `FACE_SEL`.

top level, before `faces`

```
/* EVERY DRAWN PICTURE ROUND — see `FACE_SEL`. Three photographs only where there is a drawing on
           the glass, so a screen without one costs one question. AND NONE TO MEASURE IS NOT A PASS on
           the picker's own states, which exist to put eleven of them in front of this. */
```

### ---------- AND WHEN WHAT IT WAITED FOR LANDS, THE CARD DOES NOT MOVE

top level, before `before`

```
/* ---------- AND WHEN WHAT IT WAITED FOR LANDS, THE CARD DOES NOT MOVE --------------------------
           AFTER the picture, so the shot is of the wait. The height is the card the loader sat on, from
           `loadersOn` above; the same card is found again by the same rule once the content is in. */
```

### A STATE THAT SAYS IT `grows` IS A LIST WHOSE LENGTH IS NOT KNOWN UNTIL IT LANDS (the Videos card):

top level, before `width`

```
/* A STATE THAT SAYS IT `grows` IS A LIST WHOSE LENGTH IS NOT KNOWN UNTIL IT LANDS (the Videos
             card): the card is meant to be the size of what came, so it is held to the half that is
             still true — what was veiled kept its room, and the card did not SHRINK when the loader came
             off. Every other held state holds its card exactly. Found by review: the Videos state passed
             "did not move" only because it released into an empty list. */
```

### ---------- PUT IT BACK, BECAUSE THE NEXT STATE IS THE SAME PAGE

top level, before `ragged`

```
/* ---------- PUT IT BACK, BECAUSE THE NEXT STATE IS THE SAME PAGE -----------------------
           STATES RUN IN ORDER DOWN ONE PAGE and screens after them on that same page, so anything
           a state leaves standing is measured again under somebody else's name. `enter` is enough
           for every state that only moves the app — `go()` and `goPage()` replace what came
           before. A SHEET IS THE EXCEPTION: `go()` does not close one, so a guide left open would
           be counted as part of Tools, Games and every width after it.

           NOT A BLANKET `closeSheet()` AFTER EVERY STATE. That would be this file deciding what
           the app's state should be rather than the state saying so, and the first state whose
           whole point is a sheet still open would have no way to say it. */
```

### ---------- EVERY COLUMN'S CARD STARTS ON THE SAME LINE

top level, before `ragged`

```
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
       a card placed by a different rule.

       ---------- AND THE LINE IS THE MIDDLE OF THE SCREEN NOW ------------------------------------
       ASKED FOR ON 5 OCTOBER: *"focused widgets should be in centre of screen. also those widgets
       not in focus should actually look slightly out of focus effect."* So `columnShift_` centres the
       card in front again, and the cards beside it are drawn out of focus, which is what makes two
       neighbours of different heights read as depth rather than as an edge out of step. THE SAME
       INSTRUMENT, RESTATED: every column's current card has its CENTRE on the middle of `#screen`,
       within the same 2px — so a column placed by any other rule (the old top line, a stray offset)
       is still named, with how far off it is. A card as tall as the screen or taller is skipped:
       it cannot be centred and is placed at its top. */
```

### ---------- THE DOCUMENT MUST NOT SCROLL

top level, before `docScroll`

```
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
```

### WHAT STICKS OUT, because a number with nothing to look at is a fault nobody can act on.

in `docScroll`

```
/* WHAT STICKS OUT, because a number with nothing to look at is a fault nobody can act on.
         Fixed elements are skipped — they cannot lengthen the document — and so is anything inside a
         box that clips, which `#screen` does. */
```

### ---------- THE REPORT

top level, before `bucket`

```
/* ---------- THE REPORT -------------------------------------------------------------------------
     GROUPED BY FAULT, NOT BY SCREEN. The same 38px button on nine screens is one thing to fix, and
     printed per screen it reads as nine problems and buries the one that only happens at 320. */
```

### WHERE A FAULT WAS SEEN NOW SAYS WHO WAS LOOKING.

top level, before `r`

```
/* WHERE A FAULT WAS SEEN NOW SAYS WHO WAS LOOKING. `booking@320` and `booking@320 signed in` are
     different screens with the same name, and a report that calls them both `booking@320` groups
     two findings into one line and hides the half that only a signed-in visitor can reach. */
```

### A SEPARATE HEADING FROM THE ONE ABOVE, DELIBERATELY.

top level, before `ok`

```
/* A SEPARATE HEADING FROM THE ONE ABOVE, DELIBERATELY. They are the same loss and different
       repairs: "below its own fold" is a card too tall for its pane, and wants the card split or
       the column paged; "off the screen" is a pane placed for a card that has since changed size,
       and wants `placeCells('y', …)` where the size changed. One heading would send a reader to
       the wrong half. */
```

### A SUBJECT THE RULE NEVER REACHED IS NOT A PASS.

top level, before `failures`

```
/* A SUBJECT THE RULE NEVER REACHED IS NOT A PASS. The Find screen's states put the answer bar, Send
     and the keypad on the screen; a run that measured Find and found none of one of them is a selector
     that stopped matching, and it says so rather than printing a clean line. */
```

### EVERY FINDING THAT IS NOT KNOWN IS A FAILURE, counted once per distinct fault rather than once per place it was seen — the same 38px button on nine screens is

top level, before `failures`

```
/* EVERY FINDING THAT IS NOT KNOWN IS A FAILURE, counted once per distinct fault rather than once
     per place it was seen — the same 38px button on nine screens is one thing to fix, which is the
     grouping this whole report is built on. */
```

### THE SUMMARY MUST NOT OVERSTATE ITSELF — the same rule `check-payload.js` learned when it printed "everything the site reads, the backend sends" three lines

top level, before `kind`

```
/* THE SUMMARY MUST NOT OVERSTATE ITSELF — the same rule `check-payload.js` learned when it printed
     "everything the site reads, the backend sends" three lines under five accepted dead keys. With
     known findings below, "nothing to report" is not what happened; "nothing NEW" is. */
```

### THE KNOWN ONES, AFTER the ones that fail, so the list that needs doing is at the top — and in full rather than as a count, with the reason printed once under

top level, before `kind`

```
/* THE KNOWN ONES, AFTER the ones that fail, so the list that needs doing is at the top — and in
     full rather than as a count, with the reason printed once under each group. A list nobody can
     read the argument for is a list that stops being reread. */
```

