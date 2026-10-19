# check/swipe.js

The full text of comments in `check/swipe.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/swipe.js A FINGER ON THE GLASS:

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/swipe.js

   A FINGER ON THE GLASS: DOES THE CARD GO WHERE IT WAS SENT, AND ONLY THERE?

   ASKED FOR ON 5 OCTOBER: *"can you make swiping and so on more stable. like the widgets and all. a
   more pleasant experience. also focused widgets should be in centre of screen. also those widgets
   not in focus should actually look slightly out of focus effect."*

   `check/press.js` ALREADY SWIPES — with a mouse across every column and with real touch from the
   middle of a pane, from a control, twice in quick succession on the same axis. What it never asked,
   and the lab that measured "unstable" on 5 October found (history: pending-swipefocus), is the
   rest of what a thumb does:

     · a peek and a change of mind: 70px held still, or a drag pulled part of the way back and let go moving
       home — both turned the page, 8 times in 8;
     · a diagonal on a column with nowhere to go up or down — 45° on Saved did nothing, 12 in 12;
     · a second flick on the OTHER axis while the first is still settling — the first one's slide
       stopped dead and the card jumped 81–614px in one frame;
     · a tap on a card still sliding — it pressed whatever happened to be under the finger;
     · a text field focused and then swiped away — the keypad stayed up over a card that had gone;
     · and, found while centring them, an answer pressed on the funnel moving the search box down the
       screen, because the card was put back in the middle every time its height changed;
     · and the release itself: every page turn restyled all ~5,000 elements of the document.

   AND THE TWO THINGS THE OWNER ASKED TO SEE: the card in front sits in the middle of the screen,
   within a pixel, on every column at 320 and 390 wide; and the cards beside it carry the
   out-of-focus look while it does not — easing with the finger mid-drag, and dimmed rather than
   blurred for somebody who asked for less motion.

   REAL TOUCH THROUGH CDP, every move carrying the time it was MEANT to happen, so the speed the app
   fits from `e.timeStamp` is the finger's even when a busy machine delivers late — the lesson
   `check/press.js` records about its first flick being a slow drag. Outcomes are asked, not frame
   timings: on this shared machine milliseconds are noise and "which page did it land on" is not.

   EVERYTHING FAILS THAT IS FOUND, and a rule that could not reach its subject — no Tools column, no
   page to turn to, no field to focus — fails too, saying so. A check that cannot reach what it
   measures is not a pass.

     node check/swipe.js            both widths
     node check/swipe.js --verbose  every gesture, not only the failures
     node check/swipe.js --only=cell,focus --width=390
                                    some of it: cell folded axis tile slide other centre focus
                                    field hold keypad grow widgets cost flicks reduced wide
                                    widepress findrun sweep flappy — for proving one rule by mutation without waiting
                                    six minutes for all of them. A run narrowed
                                    this way says so, and is never what the roster runs.
   SWIPE_PORT pins the port; unset, the OS picks a free one, so parallel runs cannot collide.
================================================================================================== */
```

### ---------- THE FINGER

top level, before `finger`

```
/* ---------- THE FINGER ----------------------------------------------------------------------------
   `path(t)` gives the offset at t in 0..1 over `dur` ms. Moves go every 8ms WITHOUT waiting for the
   last to be delivered — a phone keeps reporting while the page is busy — and each carries its planned
   time. `end: false` leaves the finger down so a rule can look mid-drag. */
```

### PULLED BACK TO A POINT STILL PAST THE BAR — 120px is beyond a third of every step this asks (100px across at 390, 89px down Games), so only the speed home can

in `G`

```
/* PULLED BACK TO A POINT STILL PAST THE BAR — 120px is beyond a third of every step this asks
     (100px across at 390, 89px down Games), so only the speed home can stop it turning. Pulled back
     to 80, as the lab first did, it fell under the bar the release now uses and proved nothing about
     the speed: the mutant without `backing` passed. */
```

### ---------- IN THE PAGE

top level, before `RECORDER`

```
/* ---------- IN THE PAGE ---------------------------------------------------------------------------
   Installed before any app script: every action that RUNS (the dispatcher's own table, wrapped once
   the app has built it), and every axis the grid claims during a gesture, read after the app's own
   `pointermove` has decided it. */
```

### STILL MEANS NOTHING LEFT TO HAPPEN:

in `R.still`

```
/* STILL MEANS NOTHING LEFT TO HAPPEN: no column moving, no pane holding a layer, no slide window
       open, no placement booked, and nothing booked for after the slide — a widget started 300ms after
       arriving can grow its card, and the column re-centres on it then, not before. */
```

### AND NO PICTURE ON THE CARD IN FRONT STILL ON ITS WAY.

in `R.still`

```
/* AND NO PICTURE ON THE CARD IN FRONT STILL ON ITS WAY. A post reserves 4:5 while its photograph
         loads and takes the photograph's own shape when it lands; the column re-centres on that in the
         `ResizeObserver`'s delivery, which is the frame AFTER the layout a measurement forces. One full
         run caught the feed's first card 40.7px low in exactly that frame. */
```

### AND NO CAMERA QUESTION STILL OPEN.

in `R.still`

```
/* AND NO CAMERA QUESTION STILL OPEN. The feed's first card asks for the camera on arrival, and
         on a machine with none the answer comes back as a sentence that grows the card 611 → 692px —
         AFTER everything above had gone quiet. The column re-centres on it (measured 0.2px off by
         600ms), but a measurement taken in between read the card 40.7px low: 1 run in 3 of
         `--only=centre`, found by the review. A phone answers before the slide lands; this machine
         does not, and the check must wait for the answer rather than report the gap. */
```

### AND THE CARD IN FRONT THE SAME HEIGHT TWICE RUNNING, WITH ITS COLUMN WHERE IT IS MEANT TO BE.

in `R.still`

```
/* AND THE CARD IN FRONT THE SAME HEIGHT TWICE RUNNING, WITH ITS COLUMN WHERE IT IS MEANT TO BE.
         Whatever else grows a card late — the next thing like the camera — is caught by its effect
         rather than by name: a height that changed since the last look, or a column whose placed shift
         is not yet the one `columnShift_` asks for (the `ResizeObserver`'s frame has not come). */
```

### AND THE PAYLOAD'S SCREEN UP, so the builder is open (docs/history/341).

in `boot`

```
/* AND THE PAYLOAD'S SCREEN UP, so the builder is open (docs/history/341). The columns hold the boot's markup
     until then, and `aheadBusy_()` says "nothing to build" before the builder opens — so on a starved machine
     the sweep started on boot markup and drew twelve columns inside its releases, which RELEASE read as the
     builder's failure (the final run, 12 Oct). Not fatal if it never opens: the run goes on and says what it
     finds. */
```

### A ONE-PAGE COLUMN WITH A COLUMN AFTER IT — named rather than found first in the row.

top level, before `one`

```
/* A ONE-PAGE COLUMN WITH A COLUMN AFTER IT — named rather than found first in the row. The feed
       counts one page while its posts are still arriving and several a moment later, and a 45° drag
       on a column that HAS a page below is rightly a page turn: found by a run that picked it. Saved
       and the Spotlight are one card by construction in this fixture; each is asked again just
       before the gesture. */
```

### ---------- 1. ONE CELL, OR BACK WHERE IT WAS

top level, before `turn`

```
/* ---------- 1. ONE CELL, OR BACK WHERE IT WAS -------------------------------------------------
       Exactly one page or column for a gesture that commits, and none for one that does not — the
       two that turned the page against the person's mind first among them. */
```

### ---------- 1b. THE CARD STAYS UNDER THE FINGER WHEN THE MOVES ARRIVE FOLDED TOGETHER

top level, before `sp`

```
/* ---------- 1b. THE CARD STAYS UNDER THE FINGER WHEN THE MOVES ARRIVE FOLDED TOGETHER ---------
       Found by these screenshots, not by the lab: on a busy machine the first two moves of a drag
       arrived at 7px and 132px, the grid took off the whole 132 as "slop", and the card followed the
       finger 132px behind it for the rest of the gesture. Sent here as exactly that — one move inside
       the dead zone and the next far past it — so it does not depend on how loaded the machine is.
       The card may trail by the ten pixels of slop and no more. */
```

### ---------- 4. A TAP ON A CARD STILL SLIDING IS NOT A PRESS

top level, before `r`

```
/* ---------- 4. A TAP ON A CARD STILL SLIDING IS NOT A PRESS ---------------------------------
       ASKED OF THE MECHANISM, IN ONE TASK. The first version tapped the arriving card with a real
       finger 90ms after a flick, and it could not fail: a card still moving at that speed has slid
       out from under the finger between touch-down and lift, so the click lands on whatever they
       share and nothing is pressed either way — the mutant with the guard taken out passed. So the
       page is turned, the arriving card's star is pressed the way a finger presses it (`pointerdown`,
       `pointerup`, `click`) while the slide is running, and nothing may happen; then the same star,
       pressed once the card has landed, must answer — or the first half proved nothing. */
```

### ---------- 5. A SECOND GESTURE ON THE OTHER AXIS LEAVES THE FIRST ONE SLIDING

top level, before `r`

```
/* ---------- 5. A SECOND GESTURE ON THE OTHER AXIS LEAVES THE FIRST ONE SLIDING ---------------
       Asked of the mechanism, deterministically, because the symptom is a one-frame jump and frames
       are what a loaded machine cannot promise: a slide is started on one axis, a drag frame on the
       other is placed exactly as `pointermove` places it, and the first slide must still be running
       and still on its way. Then once with a real finger for the outcome. */
```

### EVERYTHING IN ONE TASK, with a style read forcing each step:

in `r`

```
/* EVERYTHING IN ONE TASK, with a style read forcing each step: the slide is started, the drag
           frame placed, and the first slide asked after — no frame in between for a loaded machine
           to stretch past the slide's own length. */
```

### ---------- 6. THE CARD IN FRONT IS IN THE MIDDLE OF THE SCREEN

top level, before `off`

```
/* ---------- 6. THE CARD IN FRONT IS IN THE MIDDLE OF THE SCREEN ------------------------------
       Every column, its first three pages: the pane's centre against `#screen`'s, across and down,
       within a pixel. Down is asked only of a card shorter than the screen — `.pane`'s cap makes that
       every card today, and a card taller than the glass is placed at its top instead. */
```

### ---------- 7. THE CARDS NOT IN FRONT ARE OUT OF FOCUS, AND THE ONE IN FRONT IS NOT

top level, before `rest`

```
/* ---------- 7. THE CARDS NOT IN FRONT ARE OUT OF FOCUS, AND THE ONE IN FRONT IS NOT ------------
       At rest: the card in front sharp; the ones above and below it and the card peeking in from the
       column either side blurred (or dimmed, for a pane that repaints itself); nothing two columns
       away or four pages down carrying it; no pane left holding a layer once nothing moves.
       Mid-drag: the card leaving and the card arriving are both part-way, so the look is following
       the finger rather than snapping at the lift. */
```

### AND THE NEIGHBOUR IS WORKED OUT AGAINST THE CARD IN FRONT NOW, not the one that was in front when the gesture first looked.

top level, before `cache`

```
/* AND THE NEIGHBOUR IS WORKED OUT AGAINST THE CARD IN FRONT NOW, not the one that was in front
         when the gesture first looked. FOUND BY THE REVIEW OF 6 OCTOBER: `softDrag_` kept the card it
         eases toward on `SOFT_DRAG`, which a finger down keeps alive past any placement — so when the
         last flick's release landed after the next finger had taken its axis, the cache still named
         the old card in front and the new one as its neighbour, and the card under the finger was
         eased to 1.8px of blur while the one it had left went sharp. ASKED OF THE MECHANISM, in one
         task and two frames, because the order a finger needs is a main thread blocked across both
         flicks: a drag frame, a placement that is not the finger's turning the page under it, and
         the next drag frame — which must ease the card that is in front NOW, so it is nearly sharp
         30px into a drag. Three cards in a row that blur rather than dim, so both drags have a
         neighbour to ease toward. */
```

### ---------- 8. A FIELD ON A CARD THAT HAS GONE IS LET GO OF

top level, before `ok`

```
/* ---------- 8. A FIELD ON A CARD THAT HAS GONE IS LET GO OF -----------------------------------
       The keypad and a phone's keyboard both close on `focusout`; nothing took the focus away when
       its card left. A focused field on a Tools card, then a swipe up from bare card. */
```

### ---------- 8b. A CARD YOU ARE USING STAYS WHERE IT IS, AND THE NEXT ONE IS CENTRED

top level, before `a`

```
/* ---------- 8b. A CARD YOU ARE USING STAYS WHERE IT IS, AND THE NEXT ONE IS CENTRED ----------
       Centring is where a card ARRIVES (`HOLD_AT` in shell.js). The first version re-centred on every
       change of height, so a real tap on the funnel's answer — which shortens the card — moved the
       search box 38px down the screen; the owner's "stable" state measures against the pane and could
       not see it. So: a real tap on the first answer, and the search box must not move ON THE
       SCREEN; then a page away and back, and the funnel must be centred again — a hold that is never
       let go is the same fault the other way up. */
```

### ---------- 8c. THE ANSWER BOX STAYS ABOVE THE KEYPAD

top level, before `PAPER`

```
/* ---------- 8c. THE ANSWER BOX STAYS ABOVE THE KEYPAD ----------------------------------------
       FOUND BY THE REVIEW OF THIS BRANCH: a card centred on the screen sits lower than one hung from
       the old top line, and at 320x568 every maths answer box on a paper's question cards ended up
       under the pad — 8 pages of 8, against 1 of 8 before. `kpRoom_` only scrolled a scroller, and a
       card whose content fits has none. So: a real tap on each answer box on the first few question
       pages of one paper, and the box's bottom must be 12px or more above the pad's top — the margin
       `kpRoom_` itself keeps. AND PUT BACK: the pad closed, the card is where it was before the tap,
       because a lift that outlives the pad is a card hanging off the top for no reason. */
```

### ---------- AND THE KEYS PRESSED WITH A FINGER, NOT WITH `.click()`

top level, before `PAPER`

```
/* ---------- AND THE KEYS PRESSED WITH A FINGER, NOT WITH `.click()` ------------------------------
       THE OWNER, 8 Oct: *"they keypad was a bit unstable. it wasnt working at first for some reason."*
       Every keypad check before this called `.click()` or the handler itself, so the path a finger takes
       -- touchstart, the pad's own `mousedown` guard that keeps the focus on the box, `pointerdown`'s
       press mark, the click the browser makes of the tap -- had never been walked. On the first box of
       the run: real touch on 7, then ⌫, then 5, and the box must end as it began plus a 5, with the pad
       still up and the box still focused. */
```

### ---------- AND A WORDED ANSWER, ON THE PAD'S LETTERS, BY TOUCH

top level, before `WQ`

```
/* ---------- AND A WORDED ANSWER, ON THE PAD'S LETTERS, BY TOUCH ------------------------------------
         THE OWNER, 8 Oct: *"Make the keypad never need to use their own keyboard the key pad seems to allow
         ios keyboard to show I just want self contained system really"*. The worded box was a textarea and
         the phone's keyboard; it is the pad's box now (keypad.js), and the box itself takes no touch --
         the finger lands on its drawing and the app focuses the box. So, with real touch on Q33's explain
         box: the pad comes up on its LETTERS with the box focused and still `readonly`; h, i, space, t, h,
         e, r, e, ⌫ type "Hi ther" with the capital put in by itself; a tap on the drawn `i` puts the caret
         before it and `x` lands there; the pill stays 11.5px or more above the pad; and ✓ (no tile on a
         box with no scheme and no AI) puts the pad away. */
```

### AND AS IT GROWS: a worded answer grows a line at a time, and the room asked for when the pad came up was for one line (`kpKeepClear_`).

top level, before `b`

```
/* AND AS IT GROWS: a worded answer grows a line at a time, and the room asked for when the pad
             came up was for one line (`kpKeepClear_`). The caret to the end, then enough letters to wrap
             at 320, and the pill must still clear the pad. */
```

### ---------- 8d. A CARD ABOVE THAT CHANGES HEIGHT DOES NOT MOVE THE ONE IN FRONT

top level, before `set`

```
/* ---------- 8d. A CARD ABOVE THAT CHANGES HEIGHT DOES NOT MOVE THE ONE IN FRONT ---------------
       Cards are an ordinary CSS column, so a card ABOVE the one being read that grows pushes it down
       — a post photograph landing in its own proportions is the first thing that does. `holdColumn_`
       (shell.js) puts the column back inside the `ResizeObserver`'s delivery, so that no frame is
       painted with the card moved. FOUND BY THE REVIEW OF 6 OCTOBER, two ways it did not:
         · UNDER A FINGER it returned on `.dragging`, and since `DRAG_PLAN` nothing else measures until
           the lift: 150px grown above Tools/2 left the card under the thumb 150px off for the whole
           held drag, on both axes;
         · AT REST it switched the vertical transition off with `'0s'`, which `colTransition_` cannot
           read, so the correction slid back over a third of a second — the jump painted. Found while
           fixing the first.
       So a card above the one in front is grown by up to 120px — inside its pane's cap, so nothing is
       zoomed and only the observer can answer — at rest, with a finger held part-way down, and with
       one held part-way across. Three frames on, the card in front must be where it was, within a
       pixel. Under a finger, once more after it moves one pixel, which is the next drag frame
       reading the plan the correction wrote: a fix that moved the column once and left the plan
       alone would put the card back off by the growth on the next move. */
```

### GROWN, AND READ THREE FRAMES LATER:

top level, before `grow`

```
/* GROWN, AND READ THREE FRAMES LATER: the observer answers in the first, so the second and
           third are frames a person sees. `pushed` is how far the layout moved the card in its
           column, which must be the growth — or nothing was asked. */
```

### ---------- 8e. A THUMB ON THE GAME LIGHTS NOTHING UP

top level, before `css`

```
/* ---------- 8e. A THUMB ON THE GAME LIGHTS NOTHING UP ------------------------------------------
       THE OWNER, 8 Oct: *"Flappy bird sometimes highlights when tapping. Like they tap then it
       highlights. Happens on phone."*

       IT WAS THE BROWSER SELECTING TEXT, NOT ANYTHING THE APP PAINTS. Somebody playing taps fast and
       now and then rests a thumb while the bird falls. On iOS a held press, or two quick taps, is the
       gesture that selects the nearest word and paints it blue, and nothing on the card said it was
       not text to select. The keypad has said so since it was built (`#kp`); the game never did.
       Three probes ruled the rest out: no `:hover`, `:active`, `:focus` or `.is-pressed` rule reaches
       the canvas or anything above it, nothing in that chain can take focus, and the game repaints
       nothing outside the canvas except its own message line.

       CHROMIUM CANNOT SHOW THE BLUE ITSELF. A long press on a canvas here selects nothing, with the
       fix or without it. So the rule asks the three things this browser CAN see, and each one fails
       with the fix taken out:
         · a thumb that lands just off the canvas, on the "Tap to play" line 6px under it or on the
           Score row, starts no selection (`selectstart`) and leaves no range. Chromium shares that
           half with WebKit;
         · and the same of a thumb beside the canvas, in the gutter of its page or under the board,
           where there is no text at all. The card alone refusing sent those to the next page: a
           caret in "Connect 4" every time, found by the skeptic's probe after the first fix;
         · the canvas, the card's text and the page they are on compute `user-select: none`, which
           is what WebKit asks of the element under the finger before it selects anything;
         · `-webkit-touch-callout: none` is in the stylesheet beside it, READ FROM THE FILE. Chromium
           does not know the property and drops it from the CSSOM, so the one line of the fix that
           only an iPhone reads is the one line no browser here could ever see go missing.
       The rest of the report is asked too, so it stays ruled out: rapid taps and a held press on the
       canvas focus nothing and change no outline, background, border or shadow on the card or on
       anything above it. A sticky `:hover` after a tap would show up exactly there, and it is the
       next thing a well-meaning rule would add.

       AND ONLY THE GAME. Text on the card beside it must still select, because a question, an answer
       or a message is text somebody may want to copy. A swipe that starts on the canvas must still
       turn the page: `user-select` is not `touch-action`, and that is the claim worth asking. */
```

### AND BESIDE IT, WHERE NO TEXT IS.

in `g`

```
/* AND BESIDE IT, WHERE NO TEXT IS. Between the canvas and the edge of its page are the star
           card's padding and the pane's, 27px a side and 14px under the board. A press there is on
           a box with nothing to select, and the browser carries it to the nearest text that may be
           selected — which, with the game's card refusing, was the heading of the NEXT page: a caret
           in "Connect 4" on every tap. Each spot must be on the game's page and off its card. */
```

### ---------- 9. ARRIVING AT A COLUMN OF WIDGETS STARTS THEM A FEW AT A TIME

top level, before `r`

```
/* ---------- 9. ARRIVING AT A COLUMN OF WIDGETS STARTS THEM A FEW AT A TIME --------------------
       Every widget's `start` lays the whole document out, and Tools arrived starting all twelve in
       one task — a second swipe waited behind every one. Counted per task: a task boundary is a
       `setTimeout(0)` the wrapper books on the first start it sees. And every one of them running
       shortly after, or the cure is a column of dead widgets. */
```

### THE BUILDER HELD, AND TOOLS MARKED STALE, so the arrival draws the column from nothing and starts its widgets through the queue — what this asks about.

in `r`

```
/* THE BUILDER HELD, AND TOOLS MARKED STALE, so the arrival draws the column from nothing and starts its
           widgets through the queue — what this asks about. With the builder on they are drawn ahead and
           adopted on arrival, which starts nothing (docs/history/341). Let go again after the finger below. */
```

### AND NONE STARTS UNDER A FINGER THAT HAS ONLY JUST TOUCHED.

top level, before `h`

```
/* AND NONE STARTS UNDER A FINGER THAT HAS ONLY JUST TOUCHED. `widgetsLater_` counted a finger as
         busy once its swipe had a direction, so the first few pixels of a swipe — the moment a stall
         is felt most — were fair game (the review of 5 October). Arrived at Tools from Games, a real
         touch held still on bare card while the queue still has widgets in it: nothing starts while
         it is down, until the wait's cap — AND EVERYTHING HAS STARTED BY 4s, still under the finger,
         because a thumb resting on the glass (or a lift the browser never sent) must not leave a
         column of dead widgets: `widgetsLater_` waits 1.5s from when it first found the column busy
         (`TOOLS_BUSY_SINCE`, which can be a moment before the touch) and then goes on regardless. */
```

### ---------- 10. A RELEASE RESTYLES THE CARDS THAT CHANGED, NOT THE DOCUMENT

top level, before `events`

```
/* ---------- 10. A RELEASE RESTYLES THE CARDS THAT CHANGED, NOT THE DOCUMENT -------------------
       From Chrome's own trace: every `UpdateLayoutTree` in the task a page turn and a column change
       run in. It was 4,381–5,054 elements for both — one `:has()` on the hour grid naming the class
       `on`, which `placeGrid` moves at every turn — and a column change also laid out the whole
       document, for a camera that was never on. Asked at 390 only: the count does not depend on the
       width, and a trace is the slowest thing here. */
```

### AND THE CAMERA IS LET GO OF ONLY BY LEAVING THE FEED.

top level, before `cam`

```
/* AND THE CAMERA IS LET GO OF ONLY BY LEAVING THE FEED. `camStop_` reset the camera card's
         markup on every column change, which forced a layout of the whole document at the release
         (230ms here on the base commit, warmed up). Asked by counting the calls, because a layout's
         cost is the one number on this machine that load decides. */
```

### ---------- 11. A QUICK RUN OF FLICKS: THE WORK, COUNTED

top level, before `sp`

```
/* ---------- 11. A QUICK RUN OF FLICKS: THE WORK, COUNTED ----------------------------------------
       REPORTED ON 6 OCTOBER, from a phone: *"if i try to scroll quickly up or down its clunky and
       janky. make it a smooth experience. more stability, smoother, more elegant."* Measured with
       rapid flicks at 4x CPU, four faults, each asked here by COUNTING the work rather than timing it,
       because on this machine milliseconds are noise and a count is not:

         · EVERY DRAG FRAME WAS A FULL PLACEMENT — every column restyled and MEASURED again, 8–14ms a
           frame against 16.7 — to arrive at the numbers the first frame had (`DRAG_PLAN` in
           shell.js). Asked: frames of a held drag that measure a column or place the grid in full.
         · A PAGE TURN ON SETTINGS BUILT THE WHOLE COLUMN'S MARKUP FIVE TIMES to count its pages
           (`countHold_`). Asked: how many times one flick counts them — twice is the floor, once to
           choose the axis and once at the release.
         · A TALL CARD STOPPED DEAD THE MOMENT THE THUMB LEFT IT — 0px of travel after a fast flick
           (`glide_` in overworld.js). Asked: does it carry on after the lift, without turning the
           page, and does a touch stop it where it is without pressing anything.
         · TURNING PAGES ON FIND forced a layout of the column for every page it emptied, in single
           tasks of up to 1.3s (`pane.scrollTop = 0` in `fillStuffPages`). Asked: how many panes that
           could never scroll were told to.
       Each one fails with its own name; a rule that could not reach its subject fails as REACH. */
```

### WHAT MAKES A PAGE TALL HERE IS OPTIONS, NOT WORDS.

in `tall`

```
/* WHAT MAKES A PAGE TALL HERE IS OPTIONS, NOT WORDS. A long stem is cut between paragraphs
             (`partChunks_`) and a long card is drawn smaller (`paneReach_`, down to `PANE_ZOOM_MIN`), so the
             six longest questions all fitted (0px, measured 8 Oct). What cannot be cut or shrunk past the floor is
             a row of full-width option buttons: `check/cards.js`'s tallest cards at 320 are all "choose the
             true statements" with eight long options. So: most options first, then most words, and measured. */
```

### AND ANYTHING ELSE THAT SCROLLS THE CARD, OR TAKES IT OUT OF FRONT, STOPS IT TOO.

top level, before `g`

```
/* AND ANYTHING ELSE THAT SCROLLS THE CARD, OR TAKES IT OUT OF FRONT, STOPS IT TOO. FOUND BY
             THE REVIEW OF 6 OCTOBER: a finger was the only thing that could. A wheel notch during a
             mouse's glide was written over on the next frame (412 → 420, 430 … 490), and an arrow key
             during one left it scrolling a card that had gone, pushing `SLIDE_UNTIL` forward so the
             first click on the new card was swallowed — 600ms after the turn's own slide had ended.
             ASKED OF THE MECHANISM: a slow glide started on the card (0.2px/ms, which lasts about
             1.1s over 90px, so it is still going when the key lands), then the pane set back to its
             top as a wheel or `scrollIntoView` would — it must stay there — and then a real
             ArrowRight, after which the glide must have stopped and nothing may still be holding
             presses off. */
```

### D. FIND EMPTIES PAGES WITHOUT ASKING PANES THAT NEVER SCROLLED TO SCROLL.

top level, before `fill`

```
/* D. FIND EMPTIES PAGES WITHOUT ASKING PANES THAT NEVER SCROLLED TO SCROLL.
         SINCE docs/history/341 a page is emptied only when the window is recycled past it (nothing inside the
         forty-one-page window is emptied), so this walks a paper longer than the window, past it. */
```

### EMPTIED IS COUNTED AS IT HAPPENS (`stuffBlank_`), not read off the pages afterwards:

in `fill`

```
/* EMPTIED IS COUNTED AS IT HAPPENS (`stuffBlank_`), not read off the pages afterwards: a recycled page
           is emptied and then filled again for the card it now stands for, and `still` waits for the builder,
           which refills every one — so the pages read at the end were all filled, and the rule said "nothing
           was asked" of a walk that had emptied a dozen (the final run, 12 Oct). */
```

### ---------- 12. A WIDE WINDOW: CENTRED AT BOTH ENDS, AND EVERY OTHER CARD OUT OF FOCUS

top level, before `env`

```
/* ---------- 12. A WIDE WINDOW: CENTRED AT BOTH ENDS, AND EVERY OTHER CARD OUT OF FOCUS ------------
     The owner, 6 Oct, after the wide window first went in: *"what happened to widgets not in focus
     should have the not in focus effect. also the widget in focus is always in centre not like how you
     just did."* The first version slid the row to the window's edge at either end, so Feed sat a third
     of the way in, and left every card beside the one in front sharp. Neither had a check, which is
     how both went in; these are the two halves of that sentence. 1280x800 — three columns on the
     glass — on the FIRST, a middle and the LAST screen, because the ends are where the slide was. */
```

### ---------- 13. A WIDE WINDOW: A PRESS BESIDE THE CARD IN FRONT BRINGS THAT CARD FORWARD, AND ONLY THAT

top level, before `env`

```
/* ---------- 13. A WIDE WINDOW: A PRESS BESIDE THE CARD IN FRONT BRINGS THAT CARD FORWARD, AND ONLY THAT
     From 700px the columns beside the one in front are whole cards (THE GRID SHOWS MORE OF ITSELF,
     shell.js), and a press over one is "bring that one forward" — `wideHit_`, by where the press
     landed. Two ways that went wrong, both found on 6 October and both asked here:

     A. A CLICK WITH NO POSITION. Enter on a focused control, or `el.click()`, arrives at 0,0 — and
        0,0 was read as a place. At 768 with You a page down, You's page above covers that corner, so
        Enter on a control in Settings' next card down sent the app to You. In check/ui.js it was
        eight Settings states "NOT measured" in a full run and green in every narrower one, because
        only You's own states, run just before, leave You a page down. So that is set up here on
        purpose, and the corner is asked to be covered first — if it is not, nothing was tested.
     B. A PRESS THAT WENT THROUGH. Every column's current card took presses (`d === 0`), so at 1280
        a mouse on a button of the card beside Find ran that button AND brought its column forward. */
```

### AND FROM CODE, the same click the lab's states send.

top level, before `how`

```
/* AND FROM CODE, the same click the lab's states send. Settings put back on the page it was
         on — the Enter's own handler may have turned to the button's page, and a click on the card
         in front is that card's press whatever this rule is about — and the corner asked again. */
```

### ANY CONTROL, NOT ONLY A BUTTON.

in `b`

```
/* ANY CONTROL, NOT ONLY A BUTTON. The card right of Find was You's sign-in card, all buttons; it is
           Find 2's question since the second finder (docs/history/329, 347) — Find's own first question,
           whose controls are the funnel's answers, `div[data-do="facet-pick"]` — and a press that went
           through one would be the same fault. */
```

### C. THE HAND GOES WHEN THE WIDE WINDOW DOES.

top level, before `spot`

```
/* C. THE HAND GOES WHEN THE WIDE WINDOW DOES. A mouse resting on a card beside the one in front
       makes the pointer a hand (`#screen`'s cursor) and half-focuses that card (`.wide-over`). FOUND
       BY THE REVIEW OF 6 OCTOBER: the one listener that writes either returns at once on a narrow
       window, so a window snapped or zoomed below 700px with the mouse still — Win+Left, Ctrl+Plus —
       kept the hand over every word of the phone layout for the rest of the session. So: the mouse
       on a side card, the hand asked for first (or nothing was tested), then the window made 640
       wide without the mouse moving. */
```

### ---------- 14. FIND, FLICKED FAST: NOTHING EMPTY ON THE GLASS, NOTHING TURNED BACK

top level, before `at`

```
/* ---------- 14. FIND, FLICKED FAST: NOTHING EMPTY ON THE GLASS, NOTHING TURNED BACK ----------------
     The owner, 8 Oct, from a live session on a pupil's iPad: *"if i scroll down quickly it does glitch
     out or clip fast or idk."* Nothing here had ever flicked a TALL WIDE window — the flicks above are
     at 390 and 320 and rule 12's 1280 is a window at rest — and an iPad is the one that shows three
     cards below the one in front. Measured there on the Corbettmaths subtraction sheet, ten quick
     flicks: an EMPTY card on the glass in 96 of 192 frames (48 of 207 at 390x844), and the column sent
     back against the run 137–731px, two or three times in every ten flicks. Three causes, all in how
     Find fills its window of pages (`goPage`, `stuffPin_`, `stuffKeepPlace_`, `afterSlide_`).

     SO THE RUN, AS A THUMB DOES IT: 820x1180 and 390x844, W-CBM-subtraction on Find from its first
     result, ten real touch flicks of 220px over 80ms, 80ms apart, from a point below the middle of the
     glass (a page not in front takes no presses, so the finger lands on the grid on every card). Then
     TEN MORE from wherever that left it, because the window of fifteen pages re-centres only once you
     are a dozen in, every fourth turn after — and moving it was the third cause. Every frame is read
     AFTER IT IS PAINTED (a `requestAnimationFrame` that posts a message, so the read is the frame that
     was drawn and not the one being built), and every write to the column is recorded.

       EMPTY ON THE GLASS  a result page with nothing in its pane, drawn (opacity over .05, not hidden)
                           and inside the window, in any frame.
       TURNED BACK         the column sent more than 40px AGAINST the run while `PAGE` stayed where it
                           was: a write that is not a finger's (`colWrite_`, wrapped as `__swCost` wraps
                           its functions) re-aimed backwards from the aim before it — a write that only
                           moves the drawn position with the layout (`colShiftNow_`) is not an aim and is
                           not counted — or a card DRAWN more than 40px further down in one frame than in
                           the frame before, which is what a write-shaped rule cannot see when the layout
                           itself moved.
       REACH               fewer than eight pages turned by ten flicks, or the second ten never moved
                           the window: the run did not happen, so nothing about it was measured.
     The first two were proved by mutation: the far edge not filled (`STUFF_SOON` alone) shows empty
     cards at both widths; an emptied page not held at its height turns the column back at the end of
     the run; the window moved without `stuffKeepPlace_` turns the cards back in the second ten. */
```

### A WRITE MADE BY `colShiftNow_` IS WHERE THE COLUMN IS DRAWN, moved by what its layout moved — mid-slide that is behind the slide's end by however far it has

top level, before `window.colShiftNow_`

```
/* A WRITE MADE BY `colShiftNow_` IS WHERE THE COLUMN IS DRAWN, moved by what its layout moved —
           mid-slide that is behind the slide's end by however far it has still to go, so read as an aim
           it would look like a turn back of up to a whole card. It is not an aim, and is marked. */
```

### TWO RUNS. Ten flicks down the subtraction sheet from its first result; then — since docs/history/341 the window is forty-one pages and the sheet's thirty-three

top level, before `phase`

```
/* TWO RUNS. Ten flicks down the subtraction sheet from its first result; then — since docs/history/341 the
         window is forty-one pages and the sheet's thirty-three fit inside it, so it would never move — FIFTEEN
         flicks down a 76-question paper (AQA Biology 8461 2F) from eight pages short of the window's end, after
         a rest, so the run crosses the window's edge and the builder's re-centring and fills are what it meets.
         That run also asks BUILT AHEAD: at every landing, at least `glassRows_() + 3` pages past the one in
         front already filled — a fifteen-flick run from rest never reaches an unfilled page. */
```

### AND WHAT THE RUN HAD TO BUILD:

top level, before `before`

```
/* AND WHAT THE RUN HAD TO BUILD: every card drawn while it ran by anything but the builder — the release's
           own fill, an arrival on an empty page (`stuffFillOne_` is the one way a card is drawn). From rest, ten
           flicks down a sheet that fits inside the window should find every card already drawn and build none:
           that is what forty-one pages were bought for (M15b, docs/history/341 — back at fifteen, the release
           fill kept BUILT AHEAD true by drawing the cards inside the flicks, and nothing said so). */
```

### A WRITE MADE AFTER THE WINDOW MOVED IS IN A DIFFERENT FRAME OF REFERENCE — the pages above the card in front are not the pages they were, so its aim is not

top level, before `last`

```
/* A WRITE MADE AFTER THE WINDOW MOVED IS IN A DIFFERENT FRAME OF REFERENCE — the pages above the card in
           front are not the pages they were, so its aim is not comparable with the one before. Since 341 the
           window is re-centred in the quiet as well as slid in a release, and a quiet re-centring on the page
           the run ended on is exactly such a pair: `colShiftNow_` moves the column with its layout, then the
           placement aims at the same place in the new coordinates. What the eye would see of a window moved
           wrongly is still caught, by the drawn rule below. */
```

### ---------- 15. ACROSS THE ROW, FAST: NO COLUMN SEE-THROUGH ON THE GLASS, AND A RELEASE BUILDS NOTHING

top level, before `at`

```
/* ---------- 15. ACROSS THE ROW, FAST: NO COLUMN SEE-THROUGH ON THE GLASS, AND A RELEASE BUILDS NOTHING -------
     The owner, 11 Oct: *"If I scrol fast left right up or down it's still clunky."* Measured that day
     (docs/history/341): a sideways sweep left whole columns at opacity nought for 0.3–0.8s while the row
     carried them across the glass — each column's fade keyed on the column the row was GOING to, which a run
     of flicks keeps two to six ahead of where it is drawn — and an arrival built inside the release: a
     column drawn, a widget started, under the finger that was already starting the next flick.
       SWEEP    from rest, bursts of four fast flicks across the whole row and back: any painted frame with a
                column across the glass (40px of it or more, holding a page on the glass) at opacity .05 or
                less, or hidden.
       RELEASE  inside a release (`go`, `goPage`, run by the finger's own handler) `paint` is called, or a
                widget's `start`: across the sweep from rest, and in a page turn on Tools made the moment its
                arrival has queued widgets that were drawn ahead and cannot be adopted (a press since) — the
                case where starting them in the turn would be the stall. A drawn slot is started after the
                slide; only one still under its loader is started in a turn. */
```

