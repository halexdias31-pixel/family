# js/check-doors.js

The full text of comments in `js/check-doors.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-doors.js AN ACTION WITH NO DOOR, AND A DOOR WITH NO ROOM.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-doors.js

   AN ACTION WITH NO DOOR, AND A DOOR WITH NO ROOM.

   `on('x', …)` registers a handler and `data-do="x"` is the only thing that ever reaches it. The two
   are joined by a STRING, so neither side fails when they stop matching. A handler nothing can reach
   is dead weight that reads as a working feature — `friends` and `scan-posts` are the two already
   known about. A `data-do` with no handler is worse: the thing is on screen, it looks pressable, and
   pressing it does nothing at all. `subject` was exactly that for the life of the Who screen.

   Neither check.js nor check-dead.js can see this. Both sides are alive by their own reckoning: the
   handler is called (by the dispatcher, dynamically) and the markup is emitted. The join is a string
   and nothing checks strings.

   Same for screens: `screen('name', …)` registers one and `go('name')` is how you get there.

     node check-doors.js
================================================================================================== */
```

### ---------- THE FILE LIST COMES FROM index.html, BECAUSE A SECOND ONE DRIFTS

top level, before `html`

```
/* ---------- THE FILE LIST COMES FROM index.html, BECAUSE A SECOND ONE DRIFTS -----------------------
   THIS WAS A HAND-KEPT `ORDER` ARRAY AND IT HAD DRIFTED TWICE. The note that stood here recorded
   the first time: *"`select`, `collections` AND `tiles` WERE MISSING. index.html loads twenty three
   files and this listed twenty, so three were never read — and `tiles.js` is where every card
   action in the app is built, which made all of them invisible to this audit."*

   IT HAD HAPPENED AGAIN, to `library.js`, `settings.js` and `terms.js`. index.html loads
   twenty-six files; this listed twenty-three. So every `on()`, every `data-do` and every `go()` in
   those three was outside the audit — `terms.js` alone has two handlers and both their doors — and
   the summary line at the foot has been understating what it looked at for as long as that was
   true.

   THE FIX IS THE ONE `check.js` ALREADY MAKES: read the list off `window.FILES` in index.html,
   which is the list the browser itself uses. A list kept by hand beside another list kept by hand
   is this repository's oldest shape, and the answer every time has been to delete one of them.

   ORDER IS PRESERVED, because it is the load order and this file reasons about it. */
```

### ---------- A HANDLER THAT DOES NOTHING IS NOT A HANDLER WITH NO DOOR

top level, before `m`

```
/* ---------- A HANDLER THAT DOES NOTHING IS NOT A HANDLER WITH NO DOOR --------------------------
     `on('noop', () => {})` IN tiles.js WAS REPORTED EVERY RUN and was right every time, in the sense
     that nothing on screen carries `data-do="noop"`. It is also exactly what that line is for: the
     note beside it says "this exists so a stray tap is explicitly nothing rather than accidentally
     something later". Same for `on('ticks', () => {})` in find.js, which absorbs taps aimed at a
     checkbox so they do not walk up to the card behind it.

     A RED THAT IS ALWAYS RED IS A RED NOBODY READS — this project's own words, in check-flow.js —
     and this one had been red since the day it was written. One permanent false alarm is enough to
     teach somebody that the whole report is noise.

     AN EMPTY BODY IS THE RULE, not a list of names to keep in step. A handler registered with
     nothing in it cannot do anything whether or not it is reachable, so it has nothing to report:
     the entire point of it is to swallow a press. Give it a body and it becomes checkable again,
     which is the right moment for the check to start caring. */
```

### ---------- A `change` LISTENER IS A HANDLER TOO

top level, before `m`

```
/* ---------- A `change` LISTENER IS A HANDLER TOO --------------------------------------------------
     `on()` IS FOR PRESSES, and a dropdown is never pressed — choosing from it fires `change` and
     never a click, so the three controls on the booking paper bind it directly:
     `closest('[data-do="book-set"]')` inside a document listener.

     They are doors with handlers and were reported as doors with none, which is the same false
     alarm as the tiles above, in the other direction. Matched on the same string the door is
     written with, so the two cannot drift apart. */
```

### ---------- A DOOR MADE IN JAVASCRIPT IS STILL A DOOR

top level, before `m`

```
/* ---------- A DOOR MADE IN JAVASCRIPT IS STILL A DOOR --------------------------------------
     `setAttribute('data-do', 'ow-tap')` reaches the same handler as `data-do="ow-tap"` written in
     markup, and this only read the markup — so a door built on an element created in code looked
     like no door at all, and its handler was reported as unreachable.

     It found a real fault the first time it fired that way and then went on reporting it after the
     fault was fixed, which is the shape of alarm people learn to skip. */
```

### ---------- A TILE'S `act` IS A DOOR

top level, before `m`

```
/* ---------- A TILE'S `act` IS A DOOR --------------------------------------------------------------
     `tile_({ act: 'fav' })` WRITES `data-do="fav"`, in one place, in tiles.js. Every card action in
     the app goes through it — the star, the trolley, HTML, Watch, Spotlight, Edit, Delete — so from
     this file's point of view all of them vanished the day tiles stopped being written out by hand.

     TEN FALSE ALARMS, WHICH IS WORSE THAN NONE. `fav`, `wear`, `cart-add`, `paper-read`,
     `topic-edit`, `topic-delete`, `book-with`, `set-listed`, `book-more`, `book-share` were all
     reported as handlers nothing can reach, on a screen where every one of them is a button you can
     press. A list that is ten parts noise is a list nobody reads, and this one is meant to be read
     the moment it is not empty.

     The same goes for `stepSelect_` and `stepInput_`, which build `data-do` the same way. */
```

### THE TAB BAR IS A DOOR, and it does not look like one.

top level, before `tabIds`

```
/* THE TAB BAR IS A DOOR, and it does not look like one. It navigates with `go(TABS[at].id)` — a
   value, not a literal — so every tab screen read as unreachable on the first run. A check that is
   mostly wrong is one nobody reads, so the tab ids are collected and counted as ways in.

   SAME FOR A `data-do` BUILT FROM AN EXPRESSION. find.js emits `data-do="${x.kind === 'shop' ?
   'shop-item' : 'topic'}"`, so `shop-item` has a door that no search for the literal string finds.
   Both branches are pulled out of the expression rather than guessed at. */
```

### ---------- A PAGING TABLE KEYED BY A SCREEN THAT DOES NOT EXIST

top level, before `SCREEN_KEYED`

```
/* ---------- A PAGING TABLE KEYED BY A SCREEN THAT DOES NOT EXIST ----------------------------------
   `PAGER`, `PAGE_HOME` and `PAGE` are all keyed by screen id, and two of their keys were `me` and
   `posts` — names the screens had before the columns were folded in. The screens are `account` and
   `feed`.

   NOTHING THREW. `paint` does `classList.toggle('paged', !!PAGER[id])`, and an undefined lookup is
   just false, so the class never went on and the screen simply did not page. Moving up and down on
   the feed and on You did nothing at all: no error, no jump, no flicker. Two of the nine screens
   lost an axis and the only evidence was that a swipe achieved nothing.

   It is the same rename that left `go('me')` behind, which this file already catches — so the fix
   is to ask the same question of these three tables. */
```

### ---------- AND THE SAME QUESTION ASKED THE OTHER WAY ROUND

top level, before `sections`

```
/* ---------- AND THE SAME QUESTION ASKED THE OTHER WAY ROUND -----------------------------------------
   THE BLOCK ABOVE ASKS WHETHER A TABLE KEY NAMES A REAL SCREEN. It cannot ask whether a real screen
   has its key — and that is the direction every one of these faults has actually come from:

     · `booking` and `reel` used `pages()` with no `PAGER` entry, so neither had a vertical axis.
     · `tools` and `games` used `stack()`, so about sixty per cent of each was unreachable.
     · `dm` did both, and at 390×844 with six conversations 493px of somebody's messages were on the
       page with no scroll and no page to turn to.

   FOUR TABLES AND A FILE OF MARKUP HAVE TO AGREE ABOUT WHAT A SCREEN IS — `TABS`, `TAB_ORDER`,
   `PAGER`, `screen()`, and a `<section id="s-…">` in index.html — and adding a column means editing
   all five. `TABS`'s own note records the one that shipped: *"a column that swipes to a blank is
   worse than a column that is not there, and it is the fault that shipped once already — TABS
   pushed without the matching section in index.html."* Nothing has ever compared them.

   EVERY ONE OF THESE FAILS SILENTLY, which is why they are worth a check rather than a convention:
   `paint` does `$('s-' + id)?.classList` and an absent section is `undefined`; `AXES.x.cells` does
   `.filter(Boolean)`, so a tab with no section simply drops out of the sideways axis and the column
   is skipped; `PAGER[id]` undefined is just false; and `TABS.sort` on `TAB_ORDER.indexOf` puts an
   unknown id at −1, which is the FRONT. */
```

### `pages(id, …)` is the only thing that builds a screen out of more than one page.

top level, before `paged`

```
/* `pages(id, …)` is the only thing that builds a screen out of more than one page. `stack()` is
   one page by construction, so it needs no entry — and whether a stack holds more than fits is a
   question about pixels, which `check/ui.js` asks as OUT OF REACH. */
```

### ---------- AN ADMIN'S COLUMN IS THE OTHER WAY ROUND

top level, before `noSection`

```
/* ---------- AN ADMIN'S COLUMN IS THE OTHER WAY ROUND ------------------------------------------------
   `biz` IS IN `TABS` FOR AN ADMIN AND FOR NOBODY ELSE (docs/history/334), and the owner's rule for it was
   that for anybody else nothing in the page names it. index.html is every visitor's document — a section
   written there is parsed for a child before any code can take it away — so an admin's column must have
   NO section in it, and something must make one for the admin: `columnsFor_` in shell.js, which is
   asked for by name and for the `createElement('section')` it makes the section with. Both halves fail. */
```

### ---------- AND THE SIXTH PLACE, WHICH IS THE ONE THE PHONE ACTUALLY OBEYS

top level, before `colRows`

```
/* ---------- AND THE SIXTH PLACE, WHICH IS THE ONE THE PHONE ACTUALLY OBEYS ---------------------------
   `data/settings/columns.json` DECIDES WHICH COLUMNS THE APP HAS, not only their order: `applyColumns_`
   in shell.js rebuilds `TABS` from the rows it is handed, so a tab with no row is not drawn on any
   phone — with every comparison above green, because all five of them read the code. Found adding
   `progress` (docs/history/320): the five agreed, and without its row the column would have shipped
   to nobody. `check-flow` cannot see it either — its stub answers that file with the payload, which
   has no `length`, so `settingsInto_` skips it and the journeys run on the code's own list.

   A ROW THAT IS SWITCHED OFF COUNTS. `active` FALSE is somebody's decision and this asks only that
   there was one. A row naming a screen the build does not have is reported the other way round —
   it is ignored rather than drawn, and a row nobody can act on is the `make` row that outlived its
   column. A file that cannot be read is said, not skipped: a check that cannot reach its subject is
   not a pass. */
```

