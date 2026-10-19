# js/overworld.js

The full text of comments in `js/overworld.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — overworld.js ONE FILE, SPLIT.

top level, before `FEED_PICS`

```
/* ==================================================================================================
   @family. — overworld.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   overworld.js is number 17 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### ---------- THE PICTURE

top level, before `FEED_PICS`

```
/* ---------- THE PICTURE -------------------------------------------------------------------------
   Fetched AFTER the card is drawn, and the card is readable without it. That order is the whole
   design: the gradient is not a placeholder waiting to be replaced, it is the floor — so a slow
   connection, a rate limit or a service that has stopped existing costs nothing at all.

   TWO SOURCES, and Commons is the default for a reason. The fourth column of every fact is a
   PHOTOGRAPH search term — `octopus underwater`, `Venice canal buildings` — and Wikimedia Commons
   answers those with photographs of the thing, needs no key, and allows the request from a
   browser. Giphy answers them with reaction GIFs, which read as a joke where an illustration
   should be. Put a key in config and it switches; leave it blank and it does not.

   A KEY IN HERE IS PUBLIC. It ships in a file anybody can read, which for Giphy's free tier is
   normal — the limit is tied to the key rather than the key being a secret — but it is worth
   knowing rather than finding out.
--------------------------------------------------------------------------------------------- */
```

### `origin=*` is what makes Commons answer a browser at all — without it the request is made, refused by CORS, and fails in a way that looks identical to the

in `url`

```
/* `origin=*` is what makes Commons answer a browser at all — without it the request is made,
       refused by CORS, and fails in a way that looks identical to the network being down.
       `filetype:bitmap` keeps out the SVG diagrams and PDF scans, which are technically images
       and are not photographs. */
```

### A TERM THE SERVICE ANSWERED WITH NOTHING is remembered as nothing, so a deck that repeats does not ask again for an answer already given.

in `feedPicture`

```
/* A TERM THE SERVICE ANSWERED WITH NOTHING is remembered as nothing, so a deck that repeats
       does not ask again for an answer already given.
       A REQUEST THAT FAILED IS NOT AN ANSWER. This used to remember those the same way, and one
       hiccup — a dropped connection, a rate limit, a fetch fired while the page was still loading
       — blanked that fact for the rest of the tab with no way to retry but a reload. It matters
       more now than it did: pages are built five ahead, so these go out in bursts as you swipe
       rather than one at a time, and a burst is exactly when a service says no. Left unknown, it
       is asked again the next time the card comes round. */
```

### The photograph arrives afterwards and fades in over the drawing.

in `drawFeed`

```
/* The photograph arrives afterwards and fades in over the drawing. It is loaded into an Image
     first and only put on screen once it has decoded — setting a background to a URL that is
     still downloading gives a card that flickers from gradient to white to picture.
     `at` is captured so a picture that arrives after three more taps is thrown away rather than
     landing on somebody else's fact. */
```

### A CLIP PLAYS HERE TOO, AND IT HAS TO BE ASKED.

in `drawFeed`

```
/* A CLIP PLAYS HERE TOO, AND IT HAS TO BE ASKED. `feedSlide` draws one renderer for both
     surfaces — that is the whole of why the Reels column and this widget stopped disagreeing — but
     a `<video>` with no `src` is a black rectangle until something sets one, and the only thing
     that did was the reel column's observer. A fact reaches both surfaces and a clip reached one:
     the same half-move `factsNow_` was written to end, one layer down.

     NO SOUND TILE, AND THAT IS A DIFFERENCE WORTH KEEPING. This card is one tap target — the tap
     deals the next fact — so a second control inside it would take the tap the widget is for. A
     clip here is muted and looping, which is what it is on the column until somebody asks. */
```

### ---------- WHERE YOU GOT TO IS NOT KEPT ANY MORE

in `drawFeed`

```
/* ---------- WHERE YOU GOT TO IS NOT KEPT ANY MORE ----------------------------------------------
     IT WAS `{ day, at }` IN `localStorage`, AND THE COMMENT WAS RIGHT about why it was scoped to a
     day: "the deck is reshuffled on a new day, so yesterday's card 12 is a different fact and
     returning to it would mean nothing." That is now true of every reload rather than every
     midnight — `feedShuffle` is `Math.random()`, so card 12 is a different fact every time, and
     restoring a position into a deck it was not taken from opens on something you have never seen.
     The note in `feedShuffle` has the whole argument. */
```

### THE FACT'S CARD AND NOTHING ELSE — the widget's declared `draw`, for the builder (docs/history/341).

top level, before `feedPaint_`

```
/* THE FACT'S CARD AND NOTHING ELSE — the widget's declared `draw`, for the builder (docs/history/341). No
   clip is given a source and no photograph is fetched: those are `drawFeed`'s, on arrival. A fact that is a
   `<video>` clip is not drawn at all (`false`): a video with no source is a black box, and the loader the
   slot already shows is the honest face of a clip that has not been asked for. */
```

### EVERY SESSION STARTS AT THE FIRST CARD OF ITS OWN SHUFFLE — see `drawFeed` above and the long note in `feedShuffle`.

in `initFeed`

```
/* EVERY SESSION STARTS AT THE FIRST CARD OF ITS OWN SHUFFLE — see `drawFeed` above and the long
     note in `feedShuffle`. The stored position went with the day seed; a leftover `familyFeed` key
     on somebody's phone is simply never read again, which is the right shape for a key that has
     stopped meaning anything. */
```

### TAP FOR THE NEXT, and the left third for the one before — the gesture stories taught everybody, and it costs one line more than a tap that only goes forward.

top level, before `box`

```
/* TAP FOR THE NEXT, and the left third for the one before — the gesture stories taught everybody,
   and it costs one line more than a tap that only goes forward. Going back is what makes tapping
   quickly safe: without it one tap too many loses a fact you were still reading, with no way to
   reach it again. */
```

### OPEN A WIDGET. Its markup into the sheet, then the one function that brings it to life.

top level, before `SWIPE`

```
/**
 * OPEN A WIDGET. Its markup into the sheet, then the one function that brings it to life.
 *
 * `openSheet` first and `start` second, always: every one of these finds its parts by id, and an
 * id cannot be found before the markup carrying it is in the document. That ordering was the whole
 * content of `wake` and it is the whole content of this.
 *
 * AND IT SAYS SO WHEN IT DOES NOT START. Same as before, in the same place — the space the widget
 * should have filled — because a card with a heading and nothing under it has been mistaken for an
 * unfinished feature twice.
 */
```

### ---------- `on('widget')` IS GONE, AND IT WAS A POP-UP

top level, before `SWIPE`

```
/* ---------- `on('widget')` IS GONE, AND IT WAS A POP-UP ---------------------------------------------
   IT PUT A WIDGET IN THE SHEET — `openSheet(wgt.name, wgt.html)` — which slides a panel over the
   whole app. `widget-open` in tiles.js does the same job the right way: the widget opens INSIDE its
   own card, in the slot the card already carries, and the same control closes it again.

   NOTHING CALLED THIS. Not one `data-do="widget"` anywhere in the app, so it was a second way to do
   something that already had a way — and the wrong way of the two, kept alive by nothing but not
   having been deleted. See the `surfaces` tab in the Engine sheet: SF-06.

   `check-doors` counts handlers against buttons and reports a door nothing presses; that is how this
   was found. */
```

### `wake` IS GONE, and with it the whole idea of a screen having things that need starting.

top level, before `SWIPE`

```
/* `wake` IS GONE, and with it the whole idea of a screen having things that need starting.
   It existed for two screens and both are gone: nine widgets now open one at a time in the sheet,
   and `on('widget')` does what wake did — markup first, then the one function that brings it to
   life, then a sentence in the empty space if it did not.
   That also ends the fault it was built around. `paint` replaced a screen's markup and threw away
   whatever had been drawn into it, so every repaint blanked the arcade and `repaint` had to
   remember to wake it again. A sheet is not repainted; it is opened, used and closed. */
```

### `on('flap-start')` was here — a toast saying "Tap the canvas to flap".

top level, before `SWIPE`

```
/* `on('flap-start')` was here — a toast saying "Tap the canvas to flap". Nothing in the app has
   ever carried `data-do="flap-start"`, so it has never once been shown to anybody. Removed rather
   than wired up: the canvas already says it, and a handler with no door is the `arrive()` fault
   again — something that looks like it works, so nobody looks past it. */
```

### SWIPING BETWEEN TABS.

top level, before `SWIPE`

```
/* ================================================================================================
   SWIPING BETWEEN TABS.

   The hard part is not the swipe — it is not breaking scrolling. A phone cannot know at the first
   pixel whether a finger is starting a horizontal swipe or a vertical scroll, and guessing wrong
   costs you scrolling, which is the thing people do a thousand times more often.

   So this WATCHES rather than decides. The first few pixels are allowed to happen; only once the
   finger has clearly committed to one axis is the gesture claimed, and under ten pixels nothing is
   claimed at all.
================================================================================================ */
```

### THE FRAME BOOKED BUT NOT YET DRAWN, and the position it will use when it is.

in `SWIPE`

```
/* THE FRAME BOOKED BUT NOT YET DRAWN, and the position it will use when it is. A finger reports
     more often than a screen redraws, so without these the grid was placed twice for every frame
     anybody saw and half of that work was thrown away before it reached the glass. */
```

### HOW FAST, AND WHEN. Two samples is all a flick needs — where the finger was a moment ago and where it is now — and keeping only the LAST short stretch is what

in `SWIPE`

```
/* HOW FAST, AND WHEN. Two samples is all a flick needs — where the finger was a moment ago and
     where it is now — and keeping only the LAST short stretch is what makes it a measure of the
     flick rather than an average of the whole drag. A gesture that crawls and then snaps should
     read as a snap, because that is what the hand did last. */
```

### DOES THIS DRAG BELONG TO THE GRID, OR TO WHAT IS UNDER THE FINGER?

top level, before `axisFree`

```
/**
 * DOES THIS DRAG BELONG TO THE GRID, OR TO WHAT IS UNDER THE FINGER?
 *
 * ONE RULE, BOTH AXES. There were two lists — a blocklist of selectors for sideways and a
 * different one for vertical — and they disagreed by construction: the sideways list named the
 * chess board and the keypad, the vertical list reused it, and the result was that the three
 * widgets you most wanted to swipe off were the three you could not.
 *
 * The rule is now the same question asked in either direction: is there something under the finger
 * that can still scroll THIS WAY? If so it is theirs. If not, it is the grid's. A short list of
 * controls that consume a drag for their own reasons is the only exception.
 */
```

### ---------- THE SHEET NO LONGER BLOCKS EVERYTHING, ONLY THE GRID

in `axisFree`

```
/* ---------- THE SHEET NO LONGER BLOCKS EVERYTHING, ONLY THE GRID ------------------------------
     THE GRID STAYS BLOCKED, and must: the sheet is over it and moving a screen nobody can see is
     how you close a card onto a different tab than the one you opened it from. What changes is that
     a sheet WITH neighbours now answers a vertical flick itself, so reading three past papers is
     three swipes rather than close, swipe, open, close, swipe, open.

     STILL FALSE EITHER WAY, because the grid is never the thing that moves here — the flick is
     picked up by the sheet's own watcher below. This returns false so the grid ignores the gesture
     exactly as before; the sheet takes it instead. */
```

### ---------- A SELECT IS NOT NAMED, AND A TEXTAREA IS MEASURED

in `axisFree`

```
/* ---------- A SELECT IS NOT NAMED, AND A TEXTAREA IS MEASURED ------------------------------------
     A SELECT WAS NAMED HERE, as *"a select opens by dragging on some phones"* — which is not a scroll
     and not something the walk below can see. For the week of note 226 it was moot: the app's own
     panel made every select `pointer-events: none`, so no finger landed on one, and a swipe that began
     on a dropdown moved the column like a swipe anywhere else on the card. That is what a thumb now
     expects of a card full of fields, and the owner asked on 9 October for the dropdowns to be the
     platform's own again without asking for the swipe to go back to stopping on them.

     SO IT IS NOT NAMED, and the drag that the app takes as a swipe opens no list either: past the
     ten pixels that set `PRESS_MOVED`, the `mousedown` a phone may still send at the lift is
     cancelled before the select can open from it (see beside `PRESS_MOVED` in shell.js). Measured
     with real touch on the booking card and the settings column, note 315. `[data-noswipe]` is the
     one name left — the boxes that say for themselves that a drag is theirs.

     A TEXTAREA WAS BESIDE IT AND THAT BLOCKED BOTH AXES ON EVERY ONE IN THE APP. Measured with
     real touch events on the notepad -- the widget that is mostly textarea -- a swipe left stayed
     on Tools and a swipe up stayed on page 5. You land on it and you cannot swipe off it, either
     way; the tab bar was the only way out. The same was true of every answer box on every question
     card, which is the surface a student's thumb is on all evening.

     AND IT IS WRONG IN BOTH DIRECTIONS FOR DIFFERENT REASONS. Sideways it can never be right: a
     textarea WRAPS, so `scrollWidth` is `clientWidth` and there is no sideways scroll to protect.
     Vertically it is right only while there is text below the fold -- which is exactly the
     question the walk below already asks of every other scroll container, with the six-pixel floor
     that entry was written for.

     SO IT IS MEASURED LIKE EVERYTHING ELSE. A textarea computes `overflow-y: auto`, so the walk
     sees it on its first step and answers correctly at both ends: empty, the grid gets the
     gesture; full, the browser scrolls the text; scrolled to the bottom, one more swipe turns the
     page. `textarea { touch-action: pan-y }` in the stylesheet is untouched and is the other half
     -- proved by measurement, the browser really does pan a full notepad while the page stays put.

     This is the entry above it one line up: a blanket refusal where a measurement belongs. */
```

### A cell is not a scroll container any more, so the walk below stops at anything genuinely inside one — the docket's list, the notepad — and hands everything

in `axisFree`

```
/* A cell is not a scroll container any more, so the walk below stops at anything genuinely
     inside one — the docket's list, the notepad — and hands everything else to the grid. That is
     what makes a swipe up mean the next widget rather than a few pixels of nothing. */
```

### ---------- WHICH BOX WANTS IT, NOT MERELY WHETHER ONE DOES

top level, before `scrollHost_`

```
/* ---------- WHICH BOX WANTS IT, NOT MERELY WHETHER ONE DOES --------------------------------------
   `axisFree` WAS THIS WALK AND ANSWERED A BOOLEAN, which was enough while every scrollable box in
   the app carried `touch-action: pan-y` and the BROWSER did the scrolling -- the grid only had to
   know to keep out of the way.

   A QUESTION CARD CANNOT BE `pan-y` AND THAT IS WHAT MADE THIS NECESSARY. `touch-action` is read
   once at the start of a gesture and cannot say "at the bottom, going up", so a pane set to pan
   keeps EVERY vertical gesture for ever: measured, a tall question card could be scrolled to its
   end and then could not be left by swiping at all -- three more swipes and the page never turned.
   That is fine for the notepad, which you deliberately enter and leave sideways, and not fine for
   the surface the whole library is read on.

   SO THE APP SCROLLS IT ITSELF. The pane stays `touch-action: none`, the grid keeps every gesture,
   and this says which box under the finger should get it instead -- the same walk, the same
   six-pixel floor, the same "can it still go THAT way" test, returning the element rather than a
   verdict about it. `axisFree` is now one line over the top of it, so there is one walk and the two
   answers cannot disagree. */
```

### MORE THAN A PIXEL OR TWO, and this number is the whole fault behind "swiping up sometimes thinks I am scrolling".

in `scrollHost_`

```
/* MORE THAN A PIXEL OR TWO, and this number is the whole fault behind "swiping up sometimes
         thinks I am scrolling".

         `scrollHeight` and `clientHeight` are rounded to whole pixels from a layout in fractions,
         so a pane whose contents fit EXACTLY reports one or two pixels of overflow perfectly
         routinely — a border, a line-height, a shadow. One pixel of overflow is not something
         anybody can scroll to, but this read it as a scroll container and handed the gesture over,
         and the pane then moved by a pixel and stopped. From the outside: a swipe that did
         nothing, at random, on the same card that worked a moment ago.

         Six pixels is under the smallest thing a thumb can deliberately scroll to, and well over
         any rounding. */
```

### It can scroll. Whether it still can IN THIS DIRECTION is what decides:

in `scrollHost_`

```
/* It can scroll. Whether it still can IN THIS DIRECTION is what decides: at its very top a
           downward drag is nothing to it and everything to the grid, which is what lets a long
           docket be read to the end and then hand over in one movement. */
```

### HOW FAR IS FAR ENOUGH — one distance, in pixels, whichever way you are going.

top level, before `THROW_PX`

```
/* HOW FAR IS FAR ENOUGH — one distance, in pixels, whichever way you are going.
   This was a FRACTION of the axis being travelled, which sounds even-handed and is not: 16% of a
   401px width is 64px and 16% of a 929px height is 149px, so the same flick meant "next" sideways
   and "nothing happened" upwards. Two and a third times the travel for the same intent, and it
   reads as the screen ignoring you.
   The same mistake as the gap between panes, in the same shape: a distance expressed as a
   proportion of whichever edge it happens to lie along. A thumb is the same size in both
   directions. */
```

### ---------- WHAT COUNTS AS TURNING THE PAGE

top level, before `THROW_PX`

```
/* ---------- WHAT COUNTS AS TURNING THE PAGE ------------------------------------------------------
   TWO WAYS, because there are two ways people do it.

   FAR ENOUGH: you dragged the card most of the way there and let go. That is the deliberate one,
   and distance is the right measure of it.

   FAST ENOUGH: you flicked. A flick is short — forty pixels and gone — and every version of this
   until now ignored it, because sixty-four pixels of travel was the only question asked. So a
   confident flick did nothing and the card fell back, which is the single thing that makes a
   swipe feel amateur: it is not that the animation is wrong, it is that the app did not believe
   you.

   A phone's own lists have worked both ways for fifteen years, which is why a swipe that only
   answers to distance feels wrong before anybody can say why. */
```

### ---------- AND "MOST OF THE WAY" HAD BECOME FIFTY-SIX PIXELS

top level, before `THROW_PX`

```
/* ---------- AND "MOST OF THE WAY" HAD BECOME FIFTY-SIX PIXELS ----------------------------------------
   IT WAS THE SMALLER OF 56px AND 18% OF THE STEP, which is 17% of a sideways step on a 390px phone and
   about 7% of a tall card — not "most of the way there" by any reading. Measured on 5 October: drag
   70px, hold still, lift, and the page turned 8 times in 8 on both axes. A peek at the next card
   became a page turn, which is the app not believing you in the other direction.

   NOW A THIRD OF THE STEP, BETWEEN 56 AND 120px — 100px across a 390px phone, 82px at 320, 120px
   down a tall card and 75px down a short one. The cap is the old note's point kept: a thumb is the
   same size in both directions, so a tall card may not ask for three times the travel a wide one
   does. A FLICK IS UNTOUCHED — forty pixels and gone still turns the page, because `fast` below is
   the other half and it did not change. */
```

### Far enough, for this axis.

top level, before `releaseV_`

```
/* Far enough, for this axis. A fraction of the actual step as well as a flat number, so the same
   gesture means the same thing on a small phone and a wide one — sixty-four pixels is a fifth of
   the way across a 320px card and an eighth of the way down a tall one. */
```

### ---------- THE RELEASE SPEED, FITTED RATHER THAN SUBTRACTED

top level, before `releaseV_`

```
/* ---------- THE RELEASE SPEED, FITTED RATHER THAN SUBTRACTED ------------------------------------
   IT WAS TWO `Date.now()` SAMPLES, and that was fine while the speed only decided whether a flick
   turned the page. It seeds the settle's curve now (`settleCurve_` in shell.js), so a noisy speed is
   a random release: eight identical 40px flicks read anywhere from 0.34 to 1.35 px/ms, and the card
   left at a quarter of the finger's speed on one and one and a half times on another. Measured.

   THE LAST 80ms OF THE FINGER, with its own timestamps — the event's, not the clock's, so a busy
   main thread cannot bunch the samples up — and every coalesced sample the browser folded into one
   event, fitted with a straight line. The slope of that line is the speed. And nought if the finger
   had stopped: a flick held still before it lifts is not a flick, and the old speed, only ever
   updated by a move, went on reporting it and turned the page after a second's pause. */
```

### POINTER EVENTS, NOT TOUCH EVENTS.

top level, before `SWIPE.x`

```
/* POINTER EVENTS, NOT TOUCH EVENTS.
   The grid listened for `touchstart` and nothing else, so it worked on a phone and did nothing at
   all on a desktop — there is no touch to listen for, and dragging with a mouse produced no events
   the grid had any handler for. The tabs still worked because a tap is a click; the swipe simply
   was not there, which reads as broken rather than as unsupported.

   One pointer handler covers a finger, a mouse and a pen with the same code, which is the same
   argument as the two axes: a second way of doing it is a second thing to keep in step. */
```

### NO POINTER CAPTURE, AND THAT WAS THE BUG.

top level, before `SWIPE.id`

```
/* NO POINTER CAPTURE, AND THAT WAS THE BUG.

     This captured the pointer on `<html>` on every `pointerdown` — including a plain tap. Capture
     means one element owns the gesture until it is released, so the browser dispatched the release
     to the ROOT rather than to the thing under the finger, and the click never reached the card,
     the chip or the tick. Nothing threw. The app rendered perfectly and simply stopped answering.

     WHY IT WAS ADDED, and why that was wrong: to stop a drag dying when the finger slides off the
     element it started on. A real problem — and not one that had happened, and not one worth
     breaking every press in the app to prevent. The listeners are on the WINDOW, so they receive
     moves wherever the finger goes; capture was solving something that was already solved.

     The lesson is the one from the press animation two rounds ago: the fix for a thing nobody
     reported cost more than the thing it fixed. */
```

### THE SAME FINGER THAT STARTED IT, and nothing else.

top level, before `SWIPE.live`

```
/* THE SAME FINGER THAT STARTED IT, and nothing else. `isPrimary` is not the same question — a
     second finger put down after the first has lifted becomes primary itself, and a second one put
     down DURING a drag reports moves that this would otherwise steer the grid with. The id is the
     only thing that says "this is that gesture". */
```

### THIS IS A DRAG, WHATEVER THE GRID DECIDES NEXT.

top level, before `PRESS_MOVED`

```
/* THIS IS A DRAG, WHATEVER THE GRID DECIDES NEXT. The same ten pixels, read BEFORE the axis is
     chosen — because the branch below can refuse the gesture and stop reading moves, and a drag the
     grid will not take is still a drag as far as the thing under the finger is concerned. Without
     it, every swipe that began on a control pressed that control. See `PRESS_MOVED` in shell.js. */
```

### AND THE PRESSED LOOK GOES WITH IT, NOW.

top level, before `PRESS_MOVED`

```
/* AND THE PRESSED LOOK GOES WITH IT, NOW. A touch that moves sends no click, so the swallow in
       shell.js never runs and the mark stayed lit through the whole swipe until its 1.2s backstop —
       a control that looks held down while the column slides away under it. */
```

### THE DECISION, made once.

top level, before `SWIPE.live`

```
/* THE DECISION, made once. Ten pixels is enough to tell a deliberate drag from the wobble in a
     thumb, and 1.4x means an ambiguous diagonal goes to the vertical — which on a phone is the
     safer wrong answer, because scrolling is the thing people do a thousand times more often. */
```

### ---------- NOT WHILE A FINGER IS ON THE ARMED DRAWING

top level, before `SWIPE.live`

```
/* ---------- NOT WHILE A FINGER IS ON THE ARMED DRAWING ---------------------------------------------
       THIS FOLLOWS THE PRIMARY POINTER, and on a card being drawn on that is often not the finger: a palm
       or a gripping thumb that went down first beside the pad is primary, the drawing finger is not, and
       `[data-noswipe]` below asks only what the PRIMARY one landed on. So a hand drifting on the card slid
       the column out from under a stroke (docs/history/338). `padBusy_` (find.js) says a finger is on the
       armed ink, whichever went down first; while it does, neither the grid nor the pane takes this. A
       swipe already moving when a finger lands is left to finish -- that finger is a rest (338, T1). */
```

### ONE COUNT FOR THE WHOLE DECISION — `countHold_` in shell.js.

top level, before `axis`

```
/* ONE COUNT FOR THE WHOLE DECISION — `countHold_` in shell.js. It was asked up to three times
       here, and on Settings each one builds the column's markup; this is the frame the card should
       start moving in. Let go at the end of the block, before anything can paint. */
```

### ---------- UNLESS UP AND DOWN HAS NOWHERE TO GO

top level, before `n`

```
/* ---------- UNLESS UP AND DOWN HAS NOWHERE TO GO --------------------------------------------
         "THE SAFER WRONG ANSWER" ABOVE IS SAFE ONLY WHERE THERE IS A VERTICAL TO BE WRONG INTO. On a
         one-page column — Saved, the Spotlight, Messages, the Find root — or a card already at the
         end in the direction the thumb went, a diagonal handed to the vertical goes nowhere at all.
         Measured on 5 October with real touch: a sideways swipe at 40°, 45° or 55° on those columns
         did nothing 12 times in 12, and a thumb's sideways arc bowing 45px did nothing 3 in 4 (and
         once went sideways, depending on which coalesced sample first crossed ten pixels). `AXES.y
         .count()` never refused, because every column has a `PAGER` entry.
         So a gesture leaning at least half as far sideways as it goes up or down, on a vertical with
         no page that way and no box under the finger to scroll, belongs to the sideways axis. Up to
         about 63° from flat — beyond that a thumb is going up, and nothing happening is the answer. */
```

### ---------- THE GRID WILL NOT TAKE IT, SO SOMETHING UNDER THE FINGER MIGHT

top level, before `host`

```
/* ---------- THE GRID WILL NOT TAKE IT, SO SOMETHING UNDER THE FINGER MIGHT ------------------
           EVERY SCROLLABLE BOX IN THIS APP USED TO CARRY `touch-action: pan-y`, so a refusal here
           meant "the browser is already scrolling it" and dropping the gesture was the whole answer.
           A question card cannot be `pan-y` -- `touch-action` is read once at the start of a gesture
           and cannot say "at the bottom, going up", so a pane set to pan keeps every vertical gesture
           for ever and a tall card measured as impossible to leave by swiping. So the pane stays
           `none` and the app does the scrolling: same walk, same floor, and the drag hands over to
           the grid on the NEXT swipe, when there is nothing left to scroll and `axisFree` says yes.
           That is what a native scroller does at its end, and what the notepad already does. */
```

### ---------- THE TEN PIXELS ARE NOT ADDED IN ONE FRAME

top level, before `SWIPE.lock`

```
/* ---------- THE TEN PIXELS ARE NOT ADDED IN ONE FRAME ---------------------------------------
           NOTHING MOVES UNTIL THE FINGER HAS GONE TEN PIXELS, and then the card was placed at the whole
           of that travel at once — measured, a 13px step in the first moving frame against a finger
           moving 4px a frame, on every swipe. That twitch is the card not being stuck to the finger.
           So the travel at the moment the axis is chosen is taken off what is PLACED, which is what a
           native pager does with its touch slop. What is DECIDED — how far, which page — still reads
           the whole travel, so the threshold to turn a page is where it always was.
           ---------- THE SLOP, AND NOT A PIXEL MORE ------------------------------------------------
           IT WAS THE WHOLE TRAVEL AT THE MOMENT OF DECIDING, which is ten pixels only when every move
           arrives. On a busy phone they arrive folded together: measured on 5 October, a sideways drag
           whose first two `pointermove`s landed at 7px and then 132px locked at 132 — and the card
           followed the finger 132px behind it for the whole gesture, a card visibly not under the
           thumb. A native pager takes off its slop and nothing else, so this does too: ten pixels, the
           same ten the decision waits for, and any travel past them is placed in that first frame,
           because that is where the finger already is. */
```

### ---------- AND A CARD STILL SETTLING IS CAUGHT WHERE IT IS

top level, before `SWIPE.catch`

```
/* ---------- AND A CARD STILL SETTLING IS CAUGHT WHERE IT IS --------------------------------
           A SWIPE THAT STARTS WHILE THE LAST ONE IS STILL SLIDING used to snap the card to where it
           was GOING before following the finger: `no-anim` kills the running transition and the drag
           is placed relative to the target. Measured, flicking through Tools a second time 30ms
           after lifting jumped the card 51px under a still finger. The column's real position is read
           off the transition — once, here, and only when one is running — and the difference is
           carried by the drag, so the card is picked up where it is. */
```

### A mouse drag selects text as it goes, so the screen ends up half-highlighted behind the movement.

top level, before `SWIPE.d`

```
/* A mouse drag selects text as it goes, so the screen ends up half-highlighted behind the
     movement. Cancelled once the gesture belongs to the grid — and only then, because a drag that
     is still ambiguous might turn out to be somebody selecting a caption. */
```

### `no-anim` WAS ADDED TO THE DRAGGED CELLS HERE, and it switched off every transition on them — including the OTHER axis's slide, which is the jump `colWrite_`

top level, before `SWIPE.held`

```
/* `no-anim` WAS ADDED TO THE DRAGGED CELLS HERE, and it switched off every transition on them —
     including the OTHER axis's slide, which is the jump `colWrite_` in shell.js records. The drag's
     own placement now zeroes the finger's axis alone, so there is nothing to set up here. */
```

### ONE PLACEMENT PER FRAME THAT IS ACTUALLY DRAWN.

top level, before `SWIPE.px`

```
/* ONE PLACEMENT PER FRAME THAT IS ACTUALLY DRAWN.
     `pointermove` fires as often as the screen can report a finger, which on a 120Hz phone is
     twice as often as the screen is redrawn — so half of every drag was a full placement of the
     grid computed, and then thrown away before anybody saw it. Worse, the placements ran between
     frames rather than at the start of one, which is the arrangement most likely to make a
     movement look like it is lagging the thumb.

     Holding the position and placing it inside `requestAnimationFrame` means exactly one placement
     per drawn frame, using the newest position at the moment the browser is ready to draw. Fewer
     placements, and each one landing where the frame begins. */
```

### ---------- AT THE END OF THE RUN, NOTHING MOVES

top level, before `SWIPE.px`

```
/* ---------- AT THE END OF THE RUN, NOTHING MOVES ------------------------------------------------
     IT WAS `travelled * 0.25` — a quarter of the finger's travel, the rubber-band every list has.
     That is right for a list, where the give tells you the content continues and you have reached
     the bottom of it. It is wrong here, because there is nothing beyond the last tab and nothing
     beyond the last page: the give says "there is more, pull harder" about a place where there is
     no more, and it is the only movement in the app that leads nowhere.

     ZERO. The screen holds still, which is a stronger statement than a wobble and an honest one —
     the edge is the edge. Everything else about the gesture is unchanged: it still commits, still
     settles, still turns a page anywhere that is not the end. */
```

### THE CATCH IS IN WHAT IS PLACED AND NEVER IN WHAT IS DECIDED.

top level, before `SWIPE.d`

```
/* THE CATCH IS IN WHAT IS PLACED AND NEVER IN WHAT IS DECIDED. The first version added it to the
     travel the release reads, and a second flick up 30ms after the first then carried the card's
     leftover distance — hundreds of pixels the OTHER way — so it turned the page back: 1, 2, 1.
     Found by the review that was told to refute this, not by me. `PAGE` already points at the page
     being settled to, so the finger's own travel from there is the whole of the decision. */
```

### A DRAG AT EXACTLY NOUGHT IS STILL A DRAG.

in `SWIPE.frame`

```
/* A DRAG AT EXACTLY NOUGHT IS STILL A DRAG. `placeCells` reads a falsy `dragPx` as "not a
       drag" and books an ordinary placement, which gives the columns their slide back — so the first
       frame after the dead zone, which now lands on 0 by construction, would have slid the grid
       instead of holding it under the finger. A hundredth of a pixel rounds to nothing on screen. */
```

### AND THE SAME FINGER LETTING GO.

top level, before `v`

```
/* AND THE SAME FINGER LETTING GO. This had no check at all, so lifting a SECOND finger — resting
     a thumb, a palm on the edge of the screen — ended the drag as though it were the one doing the
     dragging. The card would stop halfway and settle back, which reads as the swipe simply failing
     for no reason. */
```

### EVERYTHING A DRAG SET, PUT BACK — in one line, so a field added later is added here rather than left to be noticed.

top level, before `SWIPE.live`

```
/* EVERYTHING A DRAG SET, PUT BACK — in one line, so a field added later is added here rather
     than left to be noticed. `px` and the three velocity fields were being left behind: harmless
     while `pointerdown` clears them, and harmless is not the same as correct, because the next
     thing to read one before a drag starts would get the last gesture's answer. */
```

### THE COUNT HELD FOR THE RELEASE — see `countHold_`.

top level, before `backing`

```
/* THE COUNT HELD FOR THE RELEASE — see `countHold_`. The vertical only: a page turn adds and
     removes no page, while a column change may paint the column it arrives at, and a count kept
     from before that paint would be a count of something that is no longer there. */
```

### FAR ENOUGH, OR FAST ENOUGH — and the flick has to be going the SAME WAY as the drag.

top level, before `backing`

```
/* FAR ENOUGH, OR FAST ENOUGH — and the flick has to be going the SAME WAY as the drag. A finger
       that pulls back at the last moment has a velocity pointing the other way, and honouring that
       would turn the page somebody just decided against. */
```

### ---------- AND FAR ENOUGH IS NOT ENOUGH IF THE FINGER IS ON ITS WAY BACK

top level, before `backing`

```
/* ---------- AND FAR ENOUGH IS NOT ENOUGH IF THE FINGER IS ON ITS WAY BACK ----------------------
       `fast` above already refuses a flick pointing home; `far` never looked at the speed at all.
       REPORTED AS PART OF *"can you make swiping and so on more stable"*, and measured on 5 October:
       drag 150px, pull back to 80px and lift while still moving back — the page turned, 8 times in 8,
       on both axes, the page somebody had just decided against. A release moving home at 0.2px/ms or
       more is a change of mind, however far out it was let go. */
```

### ---------- THE SETTLE CARRIES ON AT THE SPEED THE FINGER WAS GOING

top level, before `to`

```
/* ---------- THE SETTLE CARRIES ON AT THE SPEED THE FINGER WAS GOING --------------------------
       IT WAS `--slide` ON `<html>`, and that one line was most of what felt unstable. A custom property
       is INHERITED, so a new value on the root invalidates the style of every element in the app —
       about three thousand — and the placement that runs next pays for all of it before the card can
       move: measured at 4x CPU, 100-200ms of the card frozen where the finger left it, then a leap.
       And the curve it fed, `cubic-bezier(.16, 1, .3, 1)`, starts at 6.25 times its average speed, so
       the leap was 7 to 47 times faster than the finger had been moving.

       SO THE RELEASE IS HANDED TO THE PLACEMENT, which knows the distance each column really has to
       travel because it is the thing about to move them: `settleFrom_` records the speed and the
       moment, and `placeGrid` in shell.js turns them into a duration and a curve whose starting slope
       IS that speed, written on the columns themselves. Nothing is written on the root. */
```

### PAST THE END IS A SETTLE, NOT A TURN.

top level, before `to`

```
/* PAST THE END IS A SETTLE, NOT A TURN. `goPage` returns early when it is asked for the page it
       is already on — right for a tile, wrong here, because a card caught mid-settle and released
       past the last page carries the catch in its position and would be left off its page for good
       with nothing re-placing it. So a turn that has nowhere to go is a settle back, and is seen to. */
```

### ---------- A TALL CARD KEEPS MOVING AFTER THE THUMB LEAVES IT

top level, before `GLIDE`

```
/* ---------- A TALL CARD KEEPS MOVING AFTER THE THUMB LEAVES IT -------------------------------------
   PART OF *"if i try to scroll quickly up or down its clunky and janky"* (6 October). A question card
   taller than its pane is scrolled by the app itself (`scrollHost_` above says why it cannot be the
   browser's), and the app moved it exactly as far as the finger went and not a pixel more: a flick
   that left the glass at two pixels a millisecond stopped DEAD the instant it lifted. Measured at
   320x568 on the probability-tree card: a fast 120px flick, 0px of travel after the lift. Every
   list on a phone carries on and slows down; this one hit a wall, which is what "clunky" is.

   SO IT GLIDES: the release speed (`releaseV_`, the same fitted speed a page turn uses), slowed by
   the same constant a phone's own lists use — 0.998 per millisecond, which carries a 1px/ms flick
   about half a screen — and stopped at the card's end rather than bounced, because the end of a card
   is where the NEXT swipe turns the page (the owner's rule: a tall card scrolls before the page
   turns), and a rubber band there would say "more" about a place with none.

   ONE FRAME, ONE WRITE. The step is `requestAnimationFrame`'s and uses the frame's own time, so a
   frame that arrives late moves the card further rather than making it slower. A finger that lands
   during the glide stops it where it is (`pointerdown`), and that touch presses nothing — the glide
   keeps `SLIDE_UNTIL` a frame ahead, which is the press swallow every moving card already has.

   ---------- AND ANYTHING ELSE THAT MOVES THE CARD OR THE FOCUS STOPS IT TOO ------------------------
   A FINGER WAS THE ONLY THING THAT COULD. The glide carried its own position and wrote it every
   frame without looking, so for the two-and-a-half seconds a fast one lasts it was the pane's only
   scroller and its card was the only card in front, whatever else happened. Found by the review of
   6 October with a mouse flick down the Messages thread: a wheel notch the other way read 412 →
   420, 430 … 490, lost entirely; and ArrowRight during the glide left it scrolling a thread that had
   gone, pushing `SLIDE_UNTIL` forward, so the first click on Find's answer was swallowed as a press
   on a sliding card — 600ms after the turn's own slide had ended. So each frame asks first: is the
   card it was let go on still the one in front (`AT` and its `PAGE`, which `go`, `goPage`, a key and
   a wheel all move), and is the pane still where the glide last put it? A wheel, `scrollIntoView`
   or the app's own `scrollTop` is somebody else scrolling, and the glide gives way to them. Read
   back after each write, because the browser rounds a scroll position to a device pixel. */
```

### THE SAME GESTURE ON A TRACKPAD.

top level, before `wheelAt`

```
/* THE SAME GESTURE ON A TRACKPAD. Two fingers is a `wheel` event rather than a touch, so none of
   the above sees it — and without this a desktop can reach the tabs and not the widgets, because
   every page fits and there is nothing to scroll.
   One handler for both directions now, deciding the axis exactly as the finger does. */
```

### ONE NOTCH IS ONE WIDGET.

top level, before `wheelDone`

```
/* ONE NOTCH IS ONE WIDGET. The threshold was ninety, which is about one notch of a mouse wheel
     and several of a trackpad — so a small scroll did nothing at all and a large one did one
     thing, and in between it felt like the page had shifted slightly and given up. Forty is past
     any accidental brush and short of a deliberate scroll.
     Still once per gesture: a trackpad keeps sending numbers after the fingers lift, and without
     that guard one flick walks through four tabs. */
```

### A CANCELLED POINTER.

top level, before `axis`

```
/* A CANCELLED POINTER. The browser takes the gesture away — a phone call, a system edge swipe, a
   second finger — and `pointerup` never comes, so everything a drag sets up has to be undone here
   as well as there. It was undoing most of it: `held` and the booked frame were not reset, so the
   NEXT drag skipped its own setup and left a booked frame that placed the grid back where this one
   had been. */
```

### ---------- THE SCREEN CHANGING SHAPE UNDER THE APP

top level, before `RESHAPE`

```
/* ---------- THE SCREEN CHANGING SHAPE UNDER THE APP ----------------------------------------------
   NOTHING HANDLED THIS AT ALL, and it is the most visible thing left: turn the phone sideways and
   every card stays where it was put for the old width — half off the screen, overlapping, and the
   only way out is a reload. `stepX_` is a fraction of the app's width and the app's width has just
   changed; nothing asked it again.

   It is not only rotation. A phone's address bar sliding away, a keyboard opening under a text
   field, a desktop window being dragged wider — every one of those changes the number every
   position on this grid is derived from.

   PLACED AGAIN, INSTANTLY. Not animated: the cards have not moved as far as anybody is concerned,
   the SCREEN has, and sliding them to their new homes afterwards would look like the app reacting
   rather than the layout simply being right.

   DEBOUNCED, because a resize is not one event. Dragging a window edge fires dozens a second, and
   a rotation fires several as the browser settles on a size — placing on each is placing against
   numbers that are still moving. A tenth of a second after the last one is after it has settled.

   AND NOT DURING A DRAG. A finger is down and the grid is following it; re-placing underneath that
   would snatch the card away mid-gesture. The release places it anyway. */
```

### `'x'` names the axis the placement is FOR, and a full placement does both — every cell gets a new transform whichever is named.

in `reshaped_`

```
/* `'x'` names the axis the placement is FOR, and a full placement does both — every cell gets a
     new transform whichever is named. It was written as a conditional with the same answer in both
     branches, which is a thing that looks like a decision and is not. */
```

### `orientationchange` as well as `resize`:

top level, before `passive`

```
/* `orientationchange` as well as `resize`: on some phones the rotation fires this first and the
   resize only once the new size is known, and on others the reverse. Both, debounced together, so
   whichever arrives first books the same single placement. */
```

### ---------- COMING BACK TO A TAB THAT WAS LEFT MID-GESTURE

top level, before `axis`

```
/* ---------- COMING BACK TO A TAB THAT WAS LEFT MID-GESTURE ---------------------------------------
   Switch apps with a finger down and the browser may never send the pointerup — so `SWIPE.live`
   stays true, and the next press is treated as the continuation of a gesture from ten minutes ago:
   the grid jumps by however far the two touches happen to be apart. Cheap to close and impossible
   to diagnose from the outside. */
```

### AND PUT BACK, as `pointercancel` does.

top level, before `passive`

```
/* AND PUT BACK, as `pointercancel` does. The columns were left where the finger had them, marked
     `.dragging` with the finger's axis at no transition — which `holdColumn_` reads as a drag still
     going and refuses to hold. The placement runs on the first frame the page is shown again. */
```

### IF ANY OF THIS THROWS, SAY SO ON THE SCREEN.

top level, before `bootFailed`

```
/* ================================================================================================
   IF ANY OF THIS THROWS, SAY SO ON THE SCREEN.

   A script that fails while starting leaves the page exactly as index.html wrote it: a header that
   already says "Posts", an empty tab bar, and eight empty sections. Which looks like a layout bug,
   or a stylesheet problem, or a backend that will not answer — anything except what it is. It has
   looked like all three this week, and each time the actual error was sitting in a console nobody
   had open.

   So the error is put where the app would have been. It costs nothing when nothing goes wrong, and
   the first line of it is worth more than an afternoon of guessing.
================================================================================================ */
```

### ANYTHING THAT THROWS LATER, and did not get caught nearer to where it happened.

top level, before `toldYou`

```
/**
 * ANYTHING THAT THROWS LATER, and did not get caught nearer to where it happened.
 *
 * IT DOES NOT WIPE THE SCREEN ANY MORE. It did, and that was wrong twice over: an app that is
 * working is replaced by a message for something that may not matter at all, and the message
 * itself is usually "Script error." — the two words a browser gives for an uncaught error in a
 * script it treats as cross-origin, which on file:// is every script. Trading a working app for
 * two words that could mean anything is a bad trade.
 *
 * A PICTURE THAT FAILED TO LOAD IS NOT A CRASH. A missing avatar, a Drive link nobody shared, a
 * font — these fire an error event with an element as the target, and the app is fine. They are
 * counted and ignored.
 *
 * Once only, still: a loop of failures should not bury the first message, which is the one that
 * says what actually happened.
 */
```

### A SCRIPT THAT DID NOT ARRIVE is not the same kind of thing as a picture that did not.

top level, before `toldYou`

```
/* A SCRIPT THAT DID NOT ARRIVE is not the same kind of thing as a picture that did not.
       index.html names eighteen files, and a name that does not match what is actually on disk is
       eighteen failed requests and a blank screen with nothing said anywhere — the one failure the
       split into separate files can itself cause, and the one nobody can diagnose by looking at it.
       So it says which file, by name.
       A missing picture stays a console line. That is a gap in a page, not a broken app. */
```

### THE BOARD — TILES, THE WAY POLYTOPIA DOES IT.

top level, before `OW_WORLD`

```
/* ==================================================================================================
   THE BOARD — TILES, THE WAY POLYTOPIA DOES IT.

   A grid of square slabs. Each one is a terrain — grass, water, park, road, or a plot with a
   building standing on it — and the buildings are chunky blocks, not surveyed outlines.

   ---------------------------------------------------------------------------------------------
   WHY THE SURVEYED POLYGONS WENT, AFTER ALL THAT WORK ON THEM.

   The version before this extruded the real footprints: Sainsbury's as its actual thirty-seven
   vertices, ear-clipped and lit. It was accurate and it looked nothing like Polytopia, because
   Polytopia is not accurate — it is deliberately, aggressively simple. A building there is a box
   with a roof. A forest is a cone on a tile. The whole style is the REFUSAL of detail, and a
   thirty-seven-vertex supermarket is exactly the kind of detail it refuses.

   SO THE OUTLINES STILL DO THE WORK, just a different job: they decide WHICH TILES a landmark
   covers. The sheet's vertices are what makes the bus garage nine tiles long and Britannia Point
   one tile square — the shape informs the footprint on the grid, and the grid is what gets drawn.
   Nothing measured is wasted; it is used at the resolution the style wants.

   ---------------------------------------------------------------------------------------------
   WHAT MAKES A TILE READ AS A TILE.

   THICKNESS. A flat quad is a coloured rectangle; a slab with a visible side is a piece of the
   world. Every tile is drawn as a top face and two sides — the two that face the camera — and the
   sides are a darker shade of the top. That one thing is most of the look.

   A GAP BETWEEN THEM, so the grid is visible without a single line being drawn. Ninety per cent of
   the tile size, which leaves a dark seam that reads as edges rather than as gaps.
================================================================================================== */
```

### ---------- WHERE THE BOARD SITS IN THE FRAME

in `OW`

```
/* ---------- WHERE THE BOARD SITS IN THE FRAME --------------------------------------------------
     THE CAMERA AIMS ABOVE THE GROUND, not at it. Aiming at `look: 0` put the street through the
     middle of the picture with as much empty sky above as board below — and the sky is the half
     with nothing in it.

     RAISING WHAT IT LOOKS AT pushes the whole board DOWN the frame, which leaves the empty space
     under it rather than over it. That is the right way round: a board with room beneath reads as
     standing on something, and the labels have somewhere to go that is not on top of a roof. */
```

### THE PALETTE. Bright and flat, because that is the style — the survey colours in the sheet are muted greys and browns for drawing a map, and a map is not what

top level, before `OW_TERRAIN`

```
/* THE PALETTE. Bright and flat, because that is the style — the survey colours in the sheet are
   muted greys and browns for drawing a map, and a map is not what this is. The sheet's `kind`
   column already says what each thing IS, so it picks the colour and nobody has to re-enter one. */
```

### `owInside` — POINT IN POLYGON — STOOD HERE.

top level, before `OW_TILE_K`

```
/* `owInside` — POINT IN POLYGON — STOOD HERE. It decided which tiles a landmark's surveyed outline
   covered, back when the board was laid out geographically. A plot is a run of tiles now, chosen by
   how much room the thing needs rather than by where it really is, so there is nothing to test a
   point against. Deleted rather than kept for later: `check-dead` found it the moment it stopped
   being called, which is the whole reason that checker exists. */
```

### ---------- THE BOARD IS A PATH, NOT A MAP

top level, before `OW_TILE_K`

```
/* ---------- THE BOARD IS A PATH, NOT A MAP --------------------------------------------------------
   NOTHING IS TO SCALE AND THAT IS THE POINT. The version before this laid every landmark at its real
   position, which is honest and produces exactly what a real town produces: three buildings bunched
   at one end, four hundred metres of nothing, then two more. A map has to do that. A BOARD does not.

   SO EACH LANDMARK GETS A PLOT OF ITS OWN, in order along the path, and the next one starts where
   the last finishes. A bus garage takes four tiles because a bus garage needs four to look like one;
   a house takes one. The gap between them is the same everywhere, because the gap is a step along a
   path rather than a distance.

   THE ORDER IS STILL THE REAL ONE — west to east by longitude — so walking the board walks the town
   in the order you would actually meet it. Position decides the SEQUENCE and nothing else, which is
   the one thing about geography worth keeping. */
```

### ---------- METRES TO TILES, ONCE, FOR EVERYTHING

top level, before `OW_TILE_K`

```
/* ---------- METRES TO TILES, ONCE, FOR EVERYTHING ------------------------------------------------
   THE ONE FORMULA THE BOARD RUNS ON. Every measurement that has to become board space goes through
   here, so adding a landmark is adding a surveyed row and nothing else — no judgement call about how
   many tiles it "should" be, and no drift between one made in March and one made in August.

       tiles = 0.55 × √metres,  held between 2 and 8

   WHY A SQUARE ROOT AND NOT A DIVISION. True scale was tried and put back — at ten metres a tile the
   bus garage is twenty-two tiles and the board is thirty screens of walking. But a flat cap is worse:
   clamp everything to eight and Sainsbury's, the retail park and the bus garage all come out the same
   size, which is a board where nothing is bigger than anything else. A root keeps the ORDER and
   compresses the RANGE — 215m is still the biggest thing on the board, but it is twice the tower
   rather than five times it. That is what a game map does to a real place, and doing it with one
   exponent means it does the same thing to every landmark.

   THE FLOOR IS TWO, because a one-tile plot cannot show a shape — a building on it is a cube and
   every small site would look identical. The ceiling is eight, which is the deepest the camera can
   see the back row of at this angle.

   BOTH SIDES GO THROUGH IT SEPARATELY, so proportion survives: 215×60 becomes 8×4 and stays long,
   147×153 becomes 7×7 and stays square. Nothing is measured in tiles and then adjusted. */
```

### EIGHT IS THE CEILING FOR A BUILDING AND FOURTEEN FOR OPEN GROUND, and the difference is what the ceiling is FOR.

top level, before `OW_SPAN_BUILT`

```
/* EIGHT IS THE CEILING FOR A BUILDING AND FOURTEEN FOR OPEN GROUND, and the difference is what the
   ceiling is FOR. Depth is capped because the camera has to see the back row past the front one —
   that is a fact about the angle and applies to everything. Width is capped because a building
   forty tiles long is a wall you walk beside for a minute; but a PARK forty tiles long is a park,
   and walking through one is not the same as walking past a shed.
   IT IS KEYED OFF `kind`, WHICH THE SHEET ALREADY SAYS. Still no judgement call per landmark: a
   river and a rec ground get the wider ceiling because of what they are, not because somebody
   decided they were special. */
```

### HOW MANY TILES EACH ONE NEEDS.

in `owWorld`

```
/* HOW MANY TILES EACH ONE NEEDS. From the sheet where somebody has said, and from the form where
     they have not — a shed is long by nature and a house is not, so the default follows the shape
     rather than being one number for everything. */
```

### HOW WIDE THE PLOT IS.

in `owWorld`

```
/* HOW WIDE THE PLOT IS. The sheet's `plots` where somebody has said, the form's own habit where
       they have not — AND at least as wide as the parts standing on it, because a part placed at
       x=4 on a two-tile plot would otherwise hang over the neighbour. The parts decide the minimum
       and nobody has to keep two numbers in step by hand. */
```

### THE WIDTH, FROM `plots` — how much room this landmark needs to look like itself, not how big it really is.

in `owWorld`

```
/* THE WIDTH, FROM `plots` — how much room this landmark needs to look like itself, not how big
       it really is.

       TRUE SCALE WAS TRIED AND PUT BACK. Ten metres a tile made every landmark honestly sized and
       the board two hundred tiles long — thirty screens of walking, with the farm a speck and the
       rec ground a field you cross in silence. Accurate, and not a board: the whole point of one is
       that each thing gets the room it needs and the next one starts. */
```

### ---------- THE PLOT KEEPS THE SITE'S PROPORTIONS, WHATEVER ANGLE IT IS TURNED TO

in `owWorld`

```
/* ---------- THE PLOT KEEPS THE SITE'S PROPORTIONS, WHATEVER ANGLE IT IS TURNED TO -------------
       `plots` MEANT WIDTH, AND THAT BROKE EVERY ROTATION. Britannia Point is 71 metres wide and
       106 deep; six tiles across fitted it, and turning it a quarter made it 106 wide and 71 deep
       — still squeezed into six. Everything compressed sideways: the T flattened into a line, and
       the ten-metre gap between the car park and the building fell below one tile and closed.

       IT NOW MEANS THE LONGEST SIDE, and the other one follows from the site's own shape. Turn the
       site and the two swap, because the box they are measured from has swapped — so the number of
       metres a tile stands for never changes, and neither does the shape. A T is a T at every
       bearing, and a gap that is a tile wide stays a tile wide.

       THAT IS THE GENERAL ANSWER to "how do I stop this happening": nothing is measured in tiles
       and then rotated. The rotation happens first, and everything is measured after — so there is
       no number left over from before the turn that could disagree with it. */
```

### MEASURED ONCE, IN THE SQUARED FRAME, BEFORE ANY TURN.

in `owWorld`

```
/* MEASURED ONCE, IN THE SQUARED FRAME, BEFORE ANY TURN. `plots` is the longest side and the
       other follows the site's own proportion — and because this happens before the bearing is
       applied, the numbers here describe the site itself rather than a particular view of it. */
```

### ---------- HOW BIG IT IS ON THE BOARD, WORKED OUT RATHER THAN DECIDED

in `owWorld`

```
/* ---------- HOW BIG IT IS ON THE BOARD, WORKED OUT RATHER THAN DECIDED -------------------------
       `owTiles` IS THE FORMULA AND IT IS THE POINT OF THIS. Every landmark used to need a person to
       look at it and type a `plots` number, so a board of forty was forty judgement calls and no two
       of them made on the same day agreed. The metres are already surveyed — `width_m` and `depth_m`
       are on the tab for every row — so the number of tiles is not a decision, it is a conversion,
       and a conversion belongs in one function that every landmark goes through.

       THE SHEET STILL WINS if `plots` is filled in. It is an override for the one site whose real
       proportions are not what you want on the board, not the place the number comes from. */
```

### THE SURVEYED METRES, under the names that mean metres.

in `owWorld`

```
/* THE SURVEYED METRES, under the names that mean metres. `l.depth` is the hand-set PLOT depth in
       tiles and always was — the two shared a key in the payload until today, and the measurement
       lost. Reading `depthM` is what makes the conversion above run on real numbers. */
```

### AND THE TURN, IN QUARTERS.

in `owWorld`

```
/* AND THE TURN, IN QUARTERS. Anything else would need the polygon re-sampled, which is the
       fault this whole arrangement exists to prevent — so a bearing is rounded to the nearest
       quarter and nobody loses anything, because 0, 90, 180 and 270 are the only useful answers. */
```

### HOW DEEP THE PLOT IS.

in `owWorld`

```
/* HOW DEEP THE PLOT IS. From the sheet where somebody has said, and otherwise from the SITE'S
       OWN PROPORTION — a site half as wide as it is deep gets a plot half as wide as it is deep, so
       a long thin building stays long and thin. Capped, because a board four tiles deep is a board
       you look down on rather than along. */
```

### ---------- HOW DEEP THE PLOT IS, AND WHY THE CAP WAS WRONG

in `owWorld`

```
/* ---------- HOW DEEP THE PLOT IS, AND WHY THE CAP WAS WRONG ---------------------------------
       IT WAS CAPPED AT FOUR, and Britannia Point is 71 metres wide by 106 deep. Squeezing a site
       half again as deep as it is wide into a plot the same shape as a square one distorts every
       part on it — and it is what made the northern block, which is a genuinely different size and
       position from the southern one, land on no tile at all.

       THE PROPORTION IS THE POINT. A plot as many times deeper than it is wide as the real site is:
       so a T stays a T, and a long site stays long. Eight is the new ceiling, which is deep enough
       for anything in Colliers Wood and shallow enough that the back row is still visible past the
       front one at this camera angle. */
```

### THE SHEET STILL OVERRIDES the depth, for a site whose proportions are not what you want on the board — but it is no longer where the depth comes from, because

in `owWorld`

```
/* THE SHEET STILL OVERRIDES the depth, for a site whose proportions are not what you want on
       the board — but it is no longer where the depth comes from, because a hand-set depth is a
       number that cannot survive a rotation either. */
```

### ROWS ARE COUNTED BACK FROM THE PATH, and that is the fix for the landmarks being on the wrong side.

in `owWorld`

```
/* ROWS ARE COUNTED BACK FROM THE PATH, and that is the fix for the landmarks being on the wrong
     side. The camera sits at POSITIVE z looking toward negative — so a bigger z is nearer the
     viewer and a smaller one is further away. Plots were at `+z`, which put every building in FRONT
     of its node, between the walker and the path.
     Row 0 is the path. Row 1 and up go BACKWARDS, away from the camera, which is where a landmark
     behind its node belongs. One rule, and the sign cannot be got wrong by accident again. */
```

### ---------- EVERY SIDE, NOT THREE OF THEM

in `owMesh`

```
/* ---------- EVERY SIDE, NOT THREE OF THEM ------------------------------------------------------
     THIS DREW TOP, FRONT AND RIGHT ONLY — and that was a bug, not an optimisation. Culling the
     other three is right for a camera that never moves, and this camera walks the whole length of
     the street: anything to the LEFT of where you are standing shows you its left face, and the
     left face was never built. So half the town had a wall missing, and which half changed as you
     walked, which is exactly what a glitch looks like.

     ALL FOUR SIDES NOW. The bottom is still skipped — nothing on this board is ever seen from
     underneath, and that one is safe because the ground is under every box by construction. Four
     more triangles a box; the depth buffer was already doing the hiding. */
```

### THE TWO THAT WERE MISSING.

in `box`

```
/* THE TWO THAT WERE MISSING. The left is lit like the right — a flat-shaded box with three
       shades reads as solid, and giving the fourth side a fourth shade would make it read as a
       different building. The back is darkest, because it faces away from the sun. */
```

### ---------- THE GROUND

in `owMesh`

```
/* ---------- THE GROUND ---------------------------------------------------------------------------
     Every tile is grass, the row the walker uses is path, and the tiles a landmark stands on are its
     own plot. No point-in-polygon any more: a plot is a run of tiles, which is what makes this a
     board rather than a survey. */
```

### ---------- WHAT STANDS ON EACH PLOT

in `owMesh`

```
/* ---------- WHAT STANDS ON EACH PLOT ---------------------------------------------------------
     A LANDMARK IS NOT ONE THING. Priory Retail Park is a store AND a car park; a farm is a barn and
     paddocks and a fence. So the sheet holds PARTS — a row each, placed in tiles on the landmark's
     own plot — and this draws whatever it is given.

     NO PARTS IS THE ORDINARY CASE and it draws exactly what it drew before: one block, from the
     landmark's own `form`. Detail is for the landmarks worth the trouble, and nothing has to be
     filled in for the rest. */
```

### ---------- THE NODES ON THE PATH

in `owMesh`

```
/* ---------- THE NODES ON THE PATH ----------------------------------------------------------------
     One per landmark, in front of its plot — the Mario board's whole grammar. A venue is a bigger,
     gold one, because a venue is a place you can actually be taught. */
```

### ---------- HEIGHT IS TO SCALE, AND IT WAS NOT

top level, before `OW_HEIGHT`

```
/* ---------- HEIGHT IS TO SCALE, AND IT WAS NOT --------------------------------------------------
   IT WAS `sqrt(height) * 3.4`, WHICH IS A LIE ABOUT EVERY BUILDING. The square root pulls the range
   together so a tower and a shed both fit comfortably on one board — and the price is that Britannia
   Point, six and a half times the height of the bus garage, drew two and a half times its height.
   Everything looked like the same sort of building because everything nearly was.

   LINEAR. A metre is a metre, so the tower really is four times the northern block beside it and
   six times the garage down the road. That is the thing you actually notice on a board — a landmark
   is a landmark because it is taller than what is round it, and flattening the range takes away the
   only reason to look at it.

   THE FACTOR IS 0.62, chosen so the tallest thing here — 59.5m — draws about 37 units, which stands
   clear against a 4-tile-deep plot without leaving the top of the frame. A taller town would want a
   smaller number, and that is one number in one place. */
```

### ---------- A REAL SHAPE, ONTO THIS LANDMARK'S TILES

top level, before `owSquareAngle`

```
/* ---------- A REAL SHAPE, ONTO THIS LANDMARK'S TILES ------------------------------------------------
   THE BOUNDING BOX IS WHY EVERY BUILDING LOOKED THE SAME. A part drawn from `w` and `d` is a
   rectangle, so Tandem Centre — a C of shops round a car park — and Priory Retail Park came out as
   the same block, and the plan somebody walked round was thrown away at the last step.

   SO THE POLYGON IS RASTERISED. The landmark's whole site is measured, mapped onto its own plot of
   tiles, and every tile whose centre falls inside a part's outline belongs to that part. A C stays a
   C because the tiles in the middle are simply not in it.

   SCALED TO THE SITE, NOT TO THE BOARD. Within a landmark the shape is true — the car park really
   does wrap round the building in the proportion it does in life. Between landmarks nothing is to
   scale, because a board where Tandem Centre is forty times a corner shop is a board you cannot
   read. True shape, chosen size: the two decisions kept apart.

   `siteBox` IS COMPUTED FROM EVERY PART TOGETHER, which is the thing that makes them line up. Each
   part measured against its own extent would centre all of them on the same spot and the C would
   close.
--------------------------------------------------------------------------------------------- */
```

### THE ANGLE THAT PUTS A SITE SQUARE ON THE GRID.

top level, before `owSquareAngle`

```
/* THE ANGLE THAT PUTS A SITE SQUARE ON THE GRID.
   The longest edge of the outline decides it — for a building that is the long wall, and a long
   wall running along the tiles is what makes the footprint a clean block rather than a staircase.

   TO THE NEAREST NINETY IS THE SAME ANSWER. Turning a rectangle by 105 degrees and by 15 gives the
   same tiling, so the smallest turn is taken: fifteen degrees rather than a hundred and five, which
   also keeps the site pointing roughly the way it really does. */
```

### ---------- WHICH WAY ROUND IT STANDS

in `owSiteBox`

```
/* ---------- WHICH WAY ROUND IT STANDS ----------------------------------------------------------
     `bearing` HAS BEEN ON THE LANDMARKS TAB SINCE IT WAS MADE and nothing has ever read it. It is
     the answer to "Priory is facing the wrong way": a plan is surveyed north-up, and the side you
     want to be looking at is whichever side you would actually walk up to.

     WHAT THE NUMBER MEANS. Degrees to turn the site clockwise before it is drawn:
       0    as surveyed — you see its south side, which is right for anything on a north-side street
       90   turned a quarter — you see its EAST side, which is Priory: standing east, looking west
       180  you see its north side
       270  you see its west side

     THE WHOLE SITE TURNS TOGETHER, parts and all, about its own centre — so the car park stays on
     the same side of the building it is really on. Rotating each part separately would spin them
     into each other, which is the mistake that makes this look like a bug rather than a view. */
```

### ---------- SQUARE TO THE GRID FIRST, WHATEVER ANGLE IT WAS BUILT AT

in `owSiteBox`

```
/* ---------- SQUARE TO THE GRID FIRST, WHATEVER ANGLE IT WAS BUILT AT --------------------------
     THIS IS WHY BRITANNIA POINT CAME OUT L-SHAPED. Its blocks stand at 105 degrees — fifteen off
     the compass — and a rectangle at fifteen degrees rasterised onto a square grid is a STAIRCASE:
     two tiles, then one across, then two more. At a glance that is an L, and no amount of extra
     resolution fixes it. Finer tiles make a smoother staircase, which is why cutting them into
     sixteenths did not help either.

     SO THE SITE IS TURNED SQUARE BEFORE IT IS RASTERISED. The longest edge of the biggest part is
     found, and the whole site rotated until that edge runs along the grid. A rectangle then covers
     a clean block of tiles, because it is finally parallel to them.

     AND IT IS AUTOMATIC. Nobody should have to protract a satellite photograph to fill in a
     spreadsheet — the corners already say what angle the building stands at, so the number is
     derivable and deriving it is the whole job. `bearing` still overrides, for the cases where the
     view matters more than the tiling: a quarter turn on top of square is still square. */
```

### ---------- ONLY THE SQUARING HAPPENS HERE, NOT THE TURN

in `owSiteBox`

```
/* ---------- ONLY THE SQUARING HAPPENS HERE, NOT THE TURN ---------------------------------------
     THE BEARING USED TO BE ADDED IN AT THIS POINT, and that is why turning a site changed its
     shape: the polygon was rotated and then re-sampled against the tile grid, and re-sampling a
     shape at a different angle gives a different set of tiles. The T flattened, gaps closed, and no
     amount of care about plot sizes could fix it, because the shape was being recomputed each time.

     SO THE SITE IS ONLY SQUARED HERE — turned until its own right angles line up with the grid,
     which is the thing that has to happen before any tile is decided. The BEARING is applied
     afterwards, to the FINISHED TILES, by turning the grid a quarter at a time.

     ROTATING A GRID OF TILES CANNOT CHANGE WHAT IS ON IT. Four tiles in an L are four tiles in an L
     whichever way up you hold them — it is a transposition, not a measurement — so the shape is
     guaranteed identical at every bearing rather than merely observed to be. */
```

### HOW MANY PIECES A TILE IS CUT INTO for the purpose of shape.

top level, before `OW_MIN_CELLS`

```
/* HOW MANY PIECES A TILE IS CUT INTO for the purpose of shape.

   IT WAS FOUR, AND FOUR WAS WRONG. Sixteen times the resolution meant a building followed its real
   outline closely — tapered ends, notches, a cut corner — and that is precisely what a board is not
   for. The whole style is the REFUSAL of detail: a chunky shape you read at a glance beats an
   accurate one you have to look at. At four, Priory stopped being a shape and became a survey.

   ONE. A part covers whole tiles, which is what makes it read as a piece of a board rather than as
   a plan. The shape still comes from the real corners — a C is still a C, because the tiles in the
   middle are still not in it — it is simply rounded to the grid, which is the point of a grid. */
```

### ---------- THE GRID IS AS FINE AS THE SMALLEST THING ON THE SITE

top level, before `OW_MIN_CELLS`

```
/* ---------- THE GRID IS AS FINE AS THE SMALLEST THING ON THE SITE --------------------------------
   A FIXED NUMBER OF CELLS PER TILE WAS ALWAYS WRONG FOR SOMETHING. One meant a bridge disappeared;
   four meant a supermarket became a survey of itself. The number was never the problem — using ONE
   number for a 250-metre site and an 8-metre bridge was.

   SO IT IS DERIVED, PER SITE, from the smallest part standing on it: fine enough that the smallest
   part is about three cells across, and no finer. Sainsbury's has a footbridge on it, so its cells
   come out about three metres; Britannia Point has nothing smaller than a 13-metre wall, so its
   cells are coarser and its blocks stay chunky.

   AND A FINE GRID DOES NOT OVER-RESOLVE A BIG BUILDING. A 168-metre store at three-metre cells is
   still a big solid block — it reads chunky because it IS chunky, not because the grid was coarse.
   The only thing extra resolution buys on a large simple shape is a less jagged edge, which is the
   one kind of detail that never hurts.

   `MIN_CELLS` IS WHY THREE. Two cells across is a line with a width; three is the fewest that can
   have a middle, and a thing with no middle cannot read as a shape. */
```

### AND A CEILING, because one traced doorstep should not drag a whole site to a four-hundred-cell grid.

top level, before `OW_MAX_CELLS`

```
/* AND A CEILING, because one traced doorstep should not drag a whole site to a four-hundred-cell
   grid. Anything below `OW_OBJECT_FRAC` of the site's long side is not rasterised at all — see
   `owPart`, which drops a standard object on one cell instead. Its shape carries nothing; its
   presence carries everything. */
```

### TURNING A FINISHED GRID OF TILES, a quarter at a time.

top level, before `owTurn`

```
/* TURNING A FINISHED GRID OF TILES, a quarter at a time.

   THIS IS THE WHOLE POINT OF THE ARRANGEMENT. Rotating a polygon and re-sampling it gives a
   different set of tiles every time — that is what flattened the T and closed the gap. Rotating the
   TILES is a relabelling: the same cells, at different coordinates. Four in an L are four in an L
   whichever way up the grid is held.

   THE PLOT'S OWN WIDTH AND DEPTH SWAP on an odd quarter, which is why they were swapped when the
   plot was measured — the two have to agree or a tile lands outside its own plot. */
```

### ---------- ONE PART OF A LANDMARK

top level, before `owPart`

```
/* ---------- ONE PART OF A LANDMARK -----------------------------------------------------------------
   A rectangle of the plot with a nature. Everything the board can put on the ground goes through
   here, so a car park and a barn are the same call with different rows behind them.

   THE PLOT'S FRONT-LEFT CORNER IS THE ORIGIN. `x` and `z` in the sheet are tiles from there, which
   is a thing somebody can count on the screen while filling the row in — a metre offset would be a
   number nobody can check.
--------------------------------------------------------------------------------------------- */
```

### ---------- A PART WITH REAL CORNERS IS DRAWN TILE BY TILE

in `owPart`

```
/* ---------- A PART WITH REAL CORNERS IS DRAWN TILE BY TILE ------------------------------------
     AND THAT IS THE WHOLE DIFFERENCE. One box over the bounding rectangle turns a C-shaped shopping
     centre into a block — which is exactly what made Tandem Centre and Priory indistinguishable. A
     box per covered tile keeps the hole in the middle, because the tiles in the middle were never
     covered.

     ADJACENT TILES MERGE ON SCREEN. Two boxes sharing a face read as one building, so a run of six
     tiles is a long shed and an L of them is an L — no logic needed for the shape beyond knowing
     which tiles are in. */
```

### ---------- A PART THAT COVERS NO TILES AT ALL

in `owPart`

```
/* ---------- A PART THAT COVERS NO TILES AT ALL --------------------------------------------------
     IT HAPPENS, AND IT HAPPENS SILENTLY. A small building on a large plot can fall entirely between
     tile centres — Britannia Point's northern block does exactly that at four plots wide and not at
     three. Nothing throws; the part is simply not drawn, and the only way to notice is to know it
     should be there.

     SO IT IS DRAWN ANYWAY, one tile at the middle of where it really is. A building in roughly the
     right place is a fault somebody can see and fix by widening the plot; a building that is not
     there at all is a fault that gets filed as "the board looks wrong" a month later. */
```

### ---------- AND A BUILDING

in `owPart`

```
/* ---------- AND A BUILDING ------------------------------------------------------------------
     The same six silhouettes as before, now per part rather than per landmark — so a retail park
     can be a shed AND a car park, which is the whole point of this. */
```

### ---------- THE NAMES ARE HTML, OVER THE CANVAS

in `initOverworldBoard`

```
/* ---------- THE NAMES ARE HTML, OVER THE CANVAS -------------------------------------------------
     TEXT IN WEBGL IS A WHOLE SUBSYSTEM — a font atlas, a texture, a quad per glyph, and kerning done
     by hand. For six labels that is a fortnight of work to end up with worse type than the browser
     already has.

     SO THE LABEL IS AN ORDINARY ELEMENT and the 3D only decides WHERE it goes: the landmark's
     position is run through the same camera matrix the buildings use, which gives a point on the
     screen, and the element is moved there each frame. Real text, real font, selectable, and it
     scales with the phone's own type size — none of which a texture atlas would give.

     ONE ELEMENT PER LANDMARK, made once. Moving them is a transform per frame; making them would be
     a layout per frame, and that is the difference between smooth and not. */
```

### ---------- AND THE NAMES, PUT WHERE THE 3D SAYS

in `draw`

```
/* ---------- AND THE NAMES, PUT WHERE THE 3D SAYS -----------------------------------------------
       The same matrix that drew the buildings, applied to one point above each of them. The divide
       by `w` is the perspective divide — the step that makes a thing further away appear smaller and
       nearer the middle, and the reason a label tracks its building rather than sliding off it.

       BEHIND THE CAMERA IS NOT "OFF TO ONE SIDE". A point behind gives a negative `w` and the
       arithmetic mirrors it back onto the screen, so a label from the far end of the street would
       appear over the near end. Hidden by the sign test rather than by clamping. */
```

### WELL ABOVE THE ROOFS.

in `draw`

```
/* WELL ABOVE THE ROOFS. Twenty-two metres put the label at about the height of a building, so
         a name sat across whatever it was naming — and the one thing a label must never do is hide
         the thing it points at. Forty-eight clears the tallest silhouette on the board (a tower
         draws about thirty-four) with room to spare.

         AND FURTHER BACK, over the plot rather than over the path — so a label belongs to the
         building behind the node instead of floating above the walker. */
```

### ---------- TAPPING A NAME

top level, before `name`

```
/* ---------- TAPPING A NAME -------------------------------------------------------------------------
   The label carries `data-do="ow-tap"`, and the handler for it was lost in one of the rewrites of
   this board — leaving a door onto nothing. `check-doors` did not catch it, because the attribute is
   set in JavaScript rather than written into markup, and that checker reads markup. Worth knowing:
   a door made with `setAttribute` is outside what it can see.

   A VENUE SAYS WHERE IT IS, because that is a thing somebody can act on. Anything else says its
   address, because a landmark on this board is something you navigate by rather than book. */
```

### ONE TILE OF A PART. The same vocabulary as a whole part — a surface, a fence, or a building — at the size of a single tile, so a rasterised shape is built out

top level, before `owPartTile`

```
/* ONE TILE OF A PART. The same vocabulary as a whole part — a surface, a fence, or a building — at
   the size of a single tile, so a rasterised shape is built out of these and a hand-placed
   rectangle is built out of one big one. Same look either way. */
```

### ---------- ONE CELL IS ONE WHOLE TILE

in `owPartTile`

```
/* ---------- ONE CELL IS ONE WHOLE TILE ---------------------------------------------------------
     `OW_SUB` WAS USED HERE AND DECLARED NOWHERE, and this would have thrown the moment anybody
     opened the map with a rasterised part on it — a plain ReferenceError, no board at all.

     It is left over from the four-by-four sub-tile experiment: when that was reverted the constant
     went and two uses of it stayed. `check-dead` and `check.js` both found it, which is the whole
     reason those checkers exist — a name used but never declared is invisible until it runs.

     ONE, WRITTEN OUT, rather than a constant nobody else needs. A part covers whole tiles now, so
     the divisor is not a setting; reintroducing it as a variable would invite somebody to change
     it and put the staircase back. */
```

### ---------- A BRIDGE IS THE ONE FLAT THING THAT DOES NOT LIE ON THE GROUND

in `owPartTile`

```
/* ---------- A BRIDGE IS THE ONE FLAT THING THAT DOES NOT LIE ON THE GROUND -------------------
       Water sits BELOW the tile, which is what makes a river read as a river rather than as a blue
       floor. A bridge has to sit ABOVE it — over the water, with a gap you can see under — or it is
       just a differently coloured stretch of river.

       So it is a deck on two piers rather than a surface: raised, with the water visible either
       side of the supports. Three boxes, and it is the only thing on this board that is off the
       ground. */
```

### A BUILDING TILE. The height comes from the part, so every tile of one building is the same height and they read as one solid — which is what makes a rasterised

in `owPartTile`

```
/* A BUILDING TILE. The height comes from the part, so every tile of one building is the same
     height and they read as one solid — which is what makes a rasterised C look like a building
     rather than like a row of blocks that happen to touch. */
```

### A FLICK INSIDE AN OPEN SHEET SEPARATE FROM THE GRID'S GESTURE ON PURPOSE.

top level, before `SHEET_FLICK`

```
/* ==================================================================================================
   A FLICK INSIDE AN OPEN SHEET
   --------------------------------------------------------------------------------------------------
   SEPARATE FROM THE GRID'S GESTURE ON PURPOSE. The grid tracks a drag live, moving cells under the
   finger, and everything about that machinery assumes the thing being moved is the grid. Reusing it
   here would mean teaching it about a second kind of target for the sake of one gesture.

   SO THIS IS A FLICK, NOT A DRAG. Nothing follows the finger; the sheet changes when the finger
   lifts. That is a poorer gesture than the grid's and the right trade: the sheet's content is
   arbitrary HTML of unknown height, and dragging it live would mean deciding, mid-gesture, whether
   a finger on a long question is scrolling it or leaving it.

   WHICH IS ALSO WHY IT DEFERS TO SCROLLING. If the sheet's own body can still scroll in the
   direction of the flick, the flick was a scroll — the step only happens at the end of the travel,
   which is where a reader is when they have finished reading.
================================================================================================== */
```

