## `node check/press.js` — press it, did anything happen

**The last line of this file asked exactly this and nothing answered it**: *"What neither asks is the
question the owner asked: press this — did the screen change?"* Written the night the hour grid was
found dead, and the instrument arrived the next morning.

**It presses every distinct `data-do` in the app, twice over** — once signed in as an admin and once
as a stranger — and asks four things of each press: did it throw, did the app survive, did anything
change, and is there anything carrying the action to press at all. **91 actions, 57 seconds, on the
roster.**

**BY ACTION, NOT BY ELEMENT**, because the handler is the thing that can be broken: pressing every
element would press `qp-ans` four thousand times. And by the DISPATCH rather than by hit-testing —
`dispatchEvent` straight at the element — because whether a box can be hit is `check/ui.js`'s
question and it already answers it properly.

### Three instruments were green and each was right about what it asks

| | |
|---|---|
| `check-doors.js` | a `data-do` with a handler, a handler with a door. **Both true. The wiring was perfect and the wire went nowhere** |
| `check/ui.js` | can this control be read and hit. **A dead control measures perfectly** |
| `check-flow.js` | drives bookings through `BOOKING` and the send paths, so it proves the state machine and never presses a cell |

**And `pageerror` never fires, which is why a thrown handler is invisible too.** `shell.js` wraps
every action in a try/catch on purpose — an error escaping it reaches the window, and a browser
serving from `file://` reports that as `Script error.` with no message, no file and no line. Caught,
it keeps its message. So this listens where the app actually speaks: `console.error('[' + action +
']', err)`, which is the line in that catch.

**What counts as something happening is deliberately wide** — the screen's markup, the sheet, which
screen you are on, which page of it, a toast, a request leaving the phone, anything written to
`localStorage`. One of those moving is enough. The alternative is a check that cries wolf, and this
file has deleted one of those already.

### The one it found: a control drawn in gold that had done nothing for months

**`book-edit` was the only value on the booking form styled as pressable** — `.bk-pick` gave it a
gold underline and a pointer, and gold in this app means *the one thing to press*. The When row.
The row a person presses when the cells underneath it do not work, which is exactly what the owner
had just been doing.

**`stepGrid_` says ALWAYS OPEN in its first line and gives the reason**: a panel that unfolds
changes the card's height under the thumb reaching for it. The moment that was true there was
nothing left for `book-edit` to open — `stepIsPanel_` returned `!!st.grid`, so **the one row marked
pressable was the one row whose panel is always drawn.** The handler set `BOOKING.editing`,
`drawBooker()` rebuilt the card byte for byte identically, and the field was **written in four
places and read in none**: this repository's oldest shape, already recorded here under `figure`,
`orderPrints`, the four message actions, `exam_date` and `wow`.

**Three sentences outlived the thing they described** — the note over the handler still said the
week grid "is drawn as a panel, so pressing that row is the only way to reach it", and the note over
`stepGrid_` still said `BOOKING.editing` held which row was showing its grid. Both were true and
stopped being true in a commit about something else. Same fault as `resource_type` in `VOCAB` and
the dead `kind === 'paper'` guard.

### The harness was wrong three times first, all in the flattering direction

Worth the space, because every one of them printed a fault in the app that was a fault in the check:

- **`innerHTML.length` is not the markup.** A repaint that swaps one class for another of the same
  length reads as nothing having happened — measured on `book-edit`: 18,804 characters before and
  18,804 after, with the grid's open state genuinely different underneath. It hashes now, and the
  hash is what proved the control really was dead rather than merely equal-length.
- **It pressed the option that was already chosen.** `mat-level`, `mat-exam` and `timer-set` came
  back quiet because the first element carrying each is the selected one, and tapping the button
  that is already lit correctly does nothing. It prefers an unchosen control now.
- **And where nothing marks the choice, one press is not an answer.** `fm-preset` is three buttons
  and the flyer maker opens ON the flyer preset, so pressing the first asks it to become what it is.
  Measured: that press changes nothing and `sticker` changes the zoom, two checkboxes and 3,543
  characters of drawing. **Quiet now means every control carrying the action is quiet** — up to
  four of them.

**And ten actions went unpressed on the first honest run**, every one the harness: answering the
funnel's first question takes every card off the Find screen, so `fav`, `spot`, `qp-ans` and
`filter-clear` were gone by the time their turn came; and the sheet is closed after each press, so
`post-save` and `msg-send` came up for their turn against a screen that had not held them for twenty
presses. A sheet's actions are pressed **now, while it is open**; an action missing after other
presses gets a page nobody has touched, re-entered into the state it belongs to, and only then is it
reported.

### `check/states.js` — one list, because a state declared for one instrument and not the other is a hole

**`check/ui.js` owned the twenty declared states and `check/press.js` needed every one of them.**
Pressing only the state a screen opens in left the practical guide, the films, the message thread,
the session receipt and the basket unpressed entirely — none of them is on a screen `go()` lands on.

**A second copy would have drifted in the worst direction**: a state added for the measuring pass
and not the pressing one is a surface nobody presses, which is the hole the booking grid lived in.
That is this file's sentence about `documents_()`, `paperIdOf_`, `factsNow_` and `childrenOf` for
the fifth time. The extraction was proved neutral first — 132 combinations, nothing new — which is
the `libraryExtras_` rule: prove it identical, then make it.

### A quiet press FAILS, and every current one carries a written reason

**`ACCEPTED_TAP` prints and does not fail, because a 20px hour cell cannot be repaired by changing a
number.** A control that does nothing CAN be repaired, and one that silently stopped working is the
fault this file was written for — so the twelve that are correctly quiet are listed with one
sentence each (an empty box focused rather than posted, a caret placed in a text field, a camera the
container does not have) and anything else turns the run red.

**Proved in both directions.** Putting the old `paintBook_` back — the one that repainted a screen
the booking column is not on — names `book-slot` and `book-set` and exits 1; the real file exits 0.

**`npm run check` went from about 45 seconds to 1 minute 39.** That is the price and it is written
down rather than hidden: the session-start hook pays it on every session, and what it buys is the
one class of fault this project has shipped twice — a control that looks alive and is not.

### And the other thing a finger does, which nothing had ever measured

**Every screen in this app is reached by a SWIPE and no check had made one.** The tabs are a second
way in, so a broken gesture leaves the app looking fine on a desktop and is the whole navigation
gone on a phone — which is the shape `overworld.js` already records twice: the grid listened for
`touchstart` alone and did nothing at all with a mouse, and a `setPointerCapture` on every press
sent the release to the root so that no card, chip or tick ever answered. *"Nothing threw. The app
rendered perfectly and simply stopped answering."*

**`page.mouse` makes the real events, at the pace a hand makes them**, so the thresholds, the axis
lock and the velocity are all exercised — none of which a direct call to `go()` touches. Measured:
**18 sideways and 12 vertical, every one landing where it should**, and the ends are part of it — a
swipe left from the last column must stay on the last column rather than sliding into nothing.

### `check/ui.js` was not on the roster, and this file said twice that it was

**132 combinations of screen, state, width and visitor — sideways scroll, tap targets, contrast, JS
errors, content below a pane's own fold — and `npm run check` never ran it.** This file says in two
places that it "has run on every commit for weeks". It has run when somebody typed `npm run
check:ui`. **That is the `check-booking.js` fault about the instrument rather than the app, and this
file's own sentence is the answer: the roster is the only thing that makes a check real.**

**What kept it off was the clock, and the clock was the wrong reason.** Measured: `check/press.js`
spends 77 seconds of wall time and **4.5 seconds of processor** — the rest is waiting for a page to
settle, which is exactly what four processes can do at once on a four-core machine. So the four
browser-driven checks start together at the top of the run and are printed in roster order in their
place when the fast ones have finished. **Sequentially those four are about three minutes; together
they cost the slowest of them, and the whole suite is 1 minute 25 with `ui.js` included** — shorter
than it was without it.

**Two of them wanted the same port.** `check/ui.js` and `check/deploy.js` both defaulted to 8731,
which cost nothing for as long as they ran one after another and would have been one of them dying
on `EADDRINUSE` with a stack trace where a report should be. The kind of fault that only exists once
something else changes, which is the argument for changing it in the same commit.

### A control with no name is not an imperfect control, it is an invisible one

**The camera's shutter already made this argument out loud** — *"a shutter with the word Photo
written across it is not a shutter, and a control with no name at all is one a screen reader cannot
offer"* — and got an `aria-label`. **Nothing checked the rest of the app.**

**Measured: ten controls have no text, no label and no `aria-label`, and every one of them carries a
PLACEHOLDER** — the comment box, the six message boxes, the funnel's search, the to-do line and the
notepad. A placeholder IS the accessible name when there is nothing else, so all ten are named and
**none of them needed changing**. Adding an `aria-label` repeating the placeholder would be two
strings to keep in step, which is the fault this file records under `MESSAGING`, under `kinds` and
under `childrenOf`.

**So the rule is the floor rather than the preference**, it runs inside the walk `check/ui.js` was
already making so it costs nothing, and the number it guards today is zero. Proved by mutation:
taking the placeholder off the search box names `<input>.search` at 36 combinations and exits 1.

### What the app does when its own ground gives way, measured rather than assumed

**Two whole classes of visitor nothing had ever stood in for**, and both came back clean:

| | |
|---|---|
| **`localStorage` throws on every write** — a phone with storage blocked or a quota of nought | nine screens drew, the splash lifted, no JS errors, every column still reachable |
| **`localStorage` throws on every READ as well** — the `SecurityError` a locked-down browser gives | identical |
| **every data file corrupted, four ways each** — truncated JSON, an HTML error page, an object where a list belongs, an empty body, across all 15 files the app fetches | **60 combinations: nine screens drew every time, the splash lifted every time, no errors** |

**That is the house rule holding**: *an empty or broken sheet must still produce a working site.*
Every one of those reads is a `try`/`catch` around a `fetch` whose result is put through
`Array.isArray(rows) ? rows : []` — written one at a time, over months, by somebody following the
rule rather than checking it. **It is written down here rather than turned into a check**, because
sixty boots is four minutes and what it proves is a property of code that already exists; the guard
that matters is the rule in the house style, which a reader applies.
