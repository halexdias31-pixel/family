## The quiz is printable, and a new tab is the one surface this app refuses

**Asked for as "the quizes should open in a new tabe where they are printable".** The second half is
built and the first half is deliberately not, so it is worth saying which is which before anything
else: **there is no new tab, and `check-surfaces.js` is the file that says why.** Its own header
argues it out — `window.open` *"asks for pop-up permission, so the first press often does nothing at
all; the back gesture then leaves the app entirely, and whatever was filtered or half filled in is
gone"* — and it names the replacement in the same breath: *"→ `openSheet()`. It is part of this
page, so closing it puts you back exactly where you were, and the browser's own print still takes
it."* It is a rule with a check behind it, so a tab would have failed the build.

**And two tools in this app already print correctly this way.** The cheat sheet and the flyer each
build their paper, append it to `document.body`, put a class on it and call `window.print()`. **So
what was actually missing is the PAPER, not the tab.**

### The screen quiz and the printed quiz are two documents from one row

The screen one is answered with a thumb: four options a fingertip tall, a running score, an
explanation that appears the moment you answer. Printed, every one of those is wrong — a tick box is
not 44px, a score of nothing is not worth ink, and **the explanation is the answer**. That is the
split `questionCard_` and the practical guide already record, one data file along.

**TWO SHEETS, AND THE SECOND IS WHY IT IS TWO.** Page one is the quiz a student writes on and
carries no answer anywhere; page two is the key, with the `why` under each. A tutor prints both,
hands over the first and keeps the second — and printing the first alone is the page range every
print dialogue has. One sheet with the answers at the foot is a sheet you cannot hand to anybody.

**Name and Date on a rule each**, which is the oldest thing on any worksheet and the one a generated
sheet always forgets: a printed quiz comes back and has to say whose it is. **A letter per choice**,
because a printed option is circled rather than pressed and a circle needs something to go round —
drawn from the index rather than typed, so the sheet and the key cannot disagree about which is C.
**Two ruled lines** for a typed answer, because the answer is a word or a number and a box the depth
of the screen one would be most of a page for eight characters.

**Built fresh rather than cloned**, which is the one difference from `mat-print`. That one copies a
sheet somebody has configured on screen, so a *move* would leave the tool broken if the print threw;
this is generated from the row every time and there is nothing on screen to damage.

### The column clips the page, for the third time

`body` is a centred 26.5rem column — about 115mm — with `overflow-x: clip`, so a 210mm sheet inside
the app's own markup starts where the COLUMN starts and everything past 115mm is cut off. The cheat
sheet learned that, the flyer learned it separately, and the note over `.fm-out` says so outright:
*"one of the two printable tools in this app prints correctly and the other does not. Same three
lines, same reason."* Three now, and the same three lines.

**`print` had to be added to `TILE_ICONS`**, because `tileIcon_` falls back to the WORD for a name it
has never heard of — *"visibly wrong, rather than invisible"* — and the first screenshot was a tile
reading `Print` in a row of glyphs.

### 15mm is a measurement, not a margin somebody liked

**At 18mm of padding the two longest quizzes came to 1145px against A4's 1123.** Five questions
whose options wrap — `QZ-CHE-chemical-analysis-GCSE-H`, `QZ-BIO-ecology-GCSE-H` — so the last
question moved to a sheet of its own carrying one line, and `break-before: page` then put the answer
key on page **three**. A five-question quiz on three sheets of paper is not one a tutor prints twice,
and **nothing about that output is wrong**, which is exactly why no other rule here could have caught
it. 15mm of padding, 6mm between questions and 6mm under the header take the tallest to 1103 and
every one of the 162 sheets onto one side of A4.

### `check/cards.js` lays out all 81, because nothing had ever laid out one

**A printed quiz is on no screen, in no sheet, and in no state any instrument here declares.**
`check/ui.js` measures screens; this file measured cards and guides; and `quizPaper_` exists in
`document.body` for the length of a print dialogue and is taken away again. So it joins the file
that already asks "does this content fit the box it is given", with the two questions that had each
already failed once: **does the sheet fit its page**, and **is an answer anywhere on page one**.

**Measured under print media**, because every rule that gives those sheets their size lives inside
`@media print` — on screen `.qz-paper` is `display: none` and every box is zero. It is the last thing
that page does, so nothing measured above it is measured in the wrong medium. **Proved in both
directions**: the old spacing names three quizzes and exits 1, and a `why` pushed onto the question
line names all 405.

### The press harness counted a print the way it counts a request

**`quiz-print` is the first of this app's three print paths the press pass has ever been able to
reach** — `mat-print` and the flyer are both behind a control that is disabled in a container with
no printer — and it came back **quiet**. Correctly, by that check's own reading: `stateOf` hashes
`#s-<id>` and the sheet, and a print's whole effect is outside both.

**So it is counted, exactly as `fetches` already is.** `window.__press.prints` is what the guard's
stub increments, which measures the thing the handler exists to do rather than the few hundred
milliseconds its paper happens to be in the document. **And the stub answers like a real browser**
rather than doing nothing: headless has no dialogue, so a bare `window.print = () => {}` never fires
`afterprint` — and all three print paths take their paper away in that listener, with a four-second
backstop behind it. Left to the backstop, an A4 sheet sits at the foot of `body` across the next
several presses. Dispatching the event is the dialogue being opened and dismissed, which is what a
press is. 99 actions pressed became **104**.

### And the first screenshot was grey, which was the instrument rather than the page

The whole of page one came back a flat grey over cream. Nothing was painting over it: the shot was
taken while `#splash.done` was still running its `visibility` transition, and `opacity` had not yet
reached nought. **A measurement taken at the wrong moment, in the alarming direction this time** —
the entries under `check/load.js` record four taken in the flattering one. Three seconds later both
sheets are the paper palette they declare, and `elementsFromPoint` over the sheet returns the sheet,
the paper, the body and nothing else.
