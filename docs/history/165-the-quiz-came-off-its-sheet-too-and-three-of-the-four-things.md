## The quiz came off its sheet too, and three of the four things on the card were saying it twice

**Asked for as "ok get rid of the other pop up menu"** — the second half of *"I HATE THIS. I HATE
POP UP"*. The practical guide came off its sheet the commit before; the quiz was the surface left
that is plainly the same object, and the arithmetic that sent both there was the same arithmetic.

**THE BRIDGE WAS ALREADY BUILT, WHICH IS WHY THIS IS SMALL.** `paneReach_` gives an overflowing
funnel pane `overflow-y: auto` after a paint and `scrollHost_` hands the swipe to it, so a card
taller than the pane scrolls and the pager takes over at the end. That was written for the 431
question cards and it is what made the guide's move one line; a quiz is 5 questions, 20 options and
5 explanations, and it is the same line.

### Three of the four pieces on the card were a second copy of something

**Measured before anything was deleted, on a real card**: the head, a `sub`, a `.quiz-say`, a tile
row — and then the same facts again inside the sheet the tile opened.

| | |
|---|---|
| **`.quiz-say`** | *"3 of 5 answered so far"* on the card, with `.quiz-score` saying *"1 right out of the 3 answered · 2 to go"* an inch below once the sheet was open. **Two sentences about one fact, and the one that says more stays** — the roster's `<h3>` over a widget's own heading, and `Shared by · 1 family` over a row already reading `Just you` |
| **the `Start` / `Carry on` tile** | its label's second job was saying whether you had begun, which is the score line's job. With the quiz drawn underneath it, the tile's first job is to reveal what is already there — **a control that does nothing, which is exactly what `check/press.js` exists to report** |
| **`quizSheet_`'s first line** | `<p class="sub">Biology · GCSE Higher</p>`, with `Biology · 5 questions` and a `GCSE Higher` chip four lines above it on the card. Invisible while the two were on different surfaces and one fact three times the moment they were on one |

**`Print` MOVED RATHER THAN GOING, and its own note is why.** *"A tutor should not have to open a
quiz to get at its worksheet"* — with nothing to open, the card satisfies that by itself, so the
button at the foot of the form is the only copy. **A FORM has buttons; the card IS the form now**,
which is the house style deciding it rather than a preference.

### Six quizzes are in the DOM at once, so an id would have marked the wrong one

**`quizAnswered_` READ `$('sheet-body')`** — correct while a sheet was the one place a quiz could
be. The funnel's windowed pager keeps about six result pages in the DOM, so on a card that is
**`$('msg-text')` again**: the fault where a reply typed into the second thread posted to the
first. Same for `quiz-again`, which called `openSheet` to repaint.

**ASKED OF THE DOM RATHER THAN REMEMBERED**, which is what `msg-send` and `me-save` already do —
walk up from the element pressed to the block it belongs to (`el.closest('.quiz-body')`). **And the
block is read BEFORE the row is replaced**: `row.outerHTML = …` detaches the row, and `closest` on
a detached node cannot find its old parents. Measured on the real screen with six quiz cards up:
pressing a choice on card 2 gives marked rows `0,1,0,0,0,0`, explanations `0,1,0,0,0,0`, and only
card 2's score moves; `Start again` on card 2 returns it to `0,0,0,0,0,0` with exactly one
`.quiz-body` per card.

**`quiz-again` REDRAWS ITS BLOCK RATHER THAN THE COLUMN.** A `paintStuff()` would rebuild the whole
funnel strip to clear five keys — the argument `cart-drop` already makes: the press IS the change,
and what it changed is in `localStorage` rather than on a wire.

**And `quizSheet_` is `quizBody_`.** A function called `quizSheet_` that builds no sheet is the
stale name this repository keeps finding — `resource_type` in `VOCAB`, the dead `kind === 'paper'`
guard, `.favwrap.is-fav`.

### The state was measuring a surface the app no longer has, and its two ends had drifted apart

**`check/states.js`'s quiz state opened a sheet and counted `#sheet-body .quiz-q`** — so left alone
it would have reported the quiz unreachable while the card drew it perfectly. It filters the funnel
to quizzes, repaints, and turns to the first result page, exactly as the practical state does.

**AND THE SEED HAD TO MOVE WITH IT, which is the half that would have been silent.** `enter`
seeded `stuffItemsAll_()`'s first quiz; the funnel SORTS before it pages, so the card the screen
lands on is `stuffFiltered()[0]` and seeding the other one leaves this state measuring an untouched
card. Both ends read the same list now — **`leave` too, or it would clear five keys on a quiz
nobody touched and leave five behind on the one that was**, and states run in order down one page,
so those keys would still be there when Tools and Games are measured. The sentence this file writes
about `documents_()`, `factsNow_` and `childrenOf`.

**The expect is per CARD rather than across the screen**, for the reason the guide's own expect
records: six cards in the DOM is eighteen `.quiz-q` where the rule wants five.
