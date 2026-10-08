## Find says only the answer, and keeps up with a fast thumb

The owner, 8 Oct, from a live session on a pupil's iPad, three things about Find:

- *"i dont need the category of the tag to appear with the choisen option in the finder."*
- *"clear button looks like a tag which it isnt."*
- *"if i scroll down quickly it does glitch out or clip fast or idk."*

### A chosen chip is its value

Each chosen answer was printed with its field's name in front, small and grey (`.chip-k`): six
answers in, the row read `What for Learning✕ | What kind Questions✕ | Subject Maths✕ | Type
Worksheet✕ | Level SATs✕ | Key stage KS2✕ | School year any✕`. The name was left off only when the
value began with it (`chipKeyIn_`). The colour already says what kind of tag it is. Dropping the
names saved a whole line of the question page: the chip block went from 105px to 79 at 390x844 and
from 93 to 64 at 820x1180, as drawn (the question card is zoomed to fit its long answer list).

Every facet's values were checked through `showOf` first. None that a person reaches needs its
field's name: Grade is already `Grade 5`, School year `Year 4`, Paper `Paper 1`, a sitting `2024`.
Two kinds of value did need more, and `chipText_` handles them by rule:

- **A skip** says what was skipped: `Any school year`, not `any`.
- **A bare number of one to three digits** keeps its field: `Chapter 119`, `Verse 16`. These are the
  Bible's two, which only an admin sees.

The `data-tag` colour stays on every chip. `chipKeyIn_` and `.chip-k` are gone.

### Clear is a tile beside the search box

Clear had been grey text, which read as a caption. It was then made "a chip like the others", which
read as a tag. A chip in that row is something you chose, and its ✕ takes back that one choice.
Clear acts on all of them, so it is now a tile, following CLAUDE.md's rule that tiles win a tie. It
uses the pen's own bin icon, and its label is `Clear · every answer`.

- **Where it sits:** beside the search box (`.find-search`), in a slot of its own, `#stuff-clear`.
  `paintStuff` rewrites only that slot, so the search box is never redrawn and keeps its focus and
  caret across a press.
- **When it shows:** from the **first** answer. The chip waited for the second, so the box would
  narrow under your thumb on the second answer. Now it narrows once, at the first, and stays put.

### Fast scrolling: what was wrong

Measured with Playwright at 820x1180 and 390x844 on the Corbettmaths subtraction sheet
(W-CBM-subtraction, 54 pages), with ten real touch flicks of 220px over 80ms, 80ms apart. Every
frame was read after it was painted.

**1. Empty cards on the glass.** On a phone the glass shows two cards either side of the one in
front; on a wide window it shows three. The fill that should keep them drawn was booked through
`afterSlide_`, which waits for 300ms of quiet and for the settle to end. A flick every 150ms starved
it completely.

The only page filled on the spot was one that was empty when you landed on it (`bare`). That fill
builds the card in front and one either side (`STUFF_SOON`), so it never reached the edge of the
glass. Result: an empty 31px sliver two or three cards down, every other turn.

**2. The column turned back against the run.** When the late pass did run, it emptied cards above
the one in front, shrinking each from 289px to 31px. `settle_` then asked for an instant placement.
`placeCells`' rule is that animation wins, so a page turn that had already booked a slide turned that
instant placement into a slide the wrong way. `holdColumn_`, which could have corrected it
invisibly, bailed out because a slide was booked.

**3. The late pass ran under a finger.** `afterSlide_` only counted a finger as down once it had
claimed an axis, which takes 10px of travel. Instrumented: the next touch went down at 4805ms and
the column was re-aimed at 4806ms.

**4. The window moved its pages under a running slide.** This was found while building the check.
Past the twelfth page, Find's window of fifteen pages re-centres every fourth turn, moving pages from
one end of the strip to the other. Everything left in the column jumped up the layout while the
slide's numbers stayed put. The card in front jumped 250–550px and slid back.

Going back up a paper had the same fault from the other side: a card drawn above the one in front
pushed it down. A late fill landing mid-slide did it too, because `holdColumn_` had always left a
running slide to retarget from the old position.

### Fast scrolling: what changed

- **`goPage` fills the far edge of the glass, one card per turn** (`stuffFillOne_`, `glassRows_`).
  `glassRows_` is the one number `placeGrid`'s opacity also uses: 3 on a wide window, 2 on a phone.
  Only a turn gets this fill; a longer jump is still the `bare` path's.
- **An emptied page keeps its height** (`stuffPin_`). Its `min-height` is set from `pane.LAST_H`,
  which the existing `ResizeObserver` records inside its own delivery, after layout, so nothing is
  forced. It is read from the rectangle, because `offsetHeight` rounds and a 1px difference
  re-placed the column. `stuffBlank_` pins the same way when the window recycles, and
  `stuffFillOne_` lets go of the pin.
- **`settle_` holds the column rather than booking a placement.** It calls `holdColumn_`, which now:
  - answers `true` or `false`, and falls back to `placeCells` only when it cannot answer;
  - corrects a column only for the page it was placed for (`PLACED_P`, written by `placeGrid`);
  - mid-slide, moves the slide by exactly what the layout moved (`colShiftNow_`) and lets it finish
    in the time it had left.
- **`afterSlide_` treats any finger down as busy.** As `widgetsLater_` does, the wait is capped at
  1.5s, so a resting finger or a lost `pointerup` cannot starve it for ever.
- **The window keeps the cards where they are drawn** (`stuffKeepPlace_` in `stuffWindow_`). So do
  fills above the card in front, in `goPage`, which only measures when something can land above.

| 10 flicks, real touch | before: frames with an empty card | before: turned back | after |
|---|---|---|---|
| 820x1180, from the first result | 34 of 117 | 3 | 0 / 0 |
| 820x1180, the next ten (the window moves) | 46 of 118 | 6 | 0 / 0 |
| 390x844, from the first result | 32 of 132 | 3 | 0 / 0 |
| 390x844, the next ten | 33 of 122 | 7 | 0 / 0 |

Flicking back UP the paper, twelve flicks from page 40, measured with a probe rather than the
rule: before, 33 frames with an empty card and 7 card-frames drawn the wrong way at 820x1180, and 23
and 56 at 390x844. After, no empty card and nothing drawn the wrong way during the flicks at either
width.

### Checks

- **`check/swipe.js` rule 14, `findrun`.** Both widths, from the first result, ten real CDP flicks,
  then ten more through the window moving. It fails on three things:
  - **EMPTY ON THE GLASS:** a drawn, empty result page inside the window in any painted frame.
  - **TURNED BACK:** a non-finger write that re-aims the column more than 40px against the run with
    `PAGE` unchanged, or a card drawn more than 40px back down between two frames. A `colShiftNow_`
    write is where the column is drawn, not an aim, and is not counted.
  - **REACH:** fewer than 8 pages turned, or the window never moved.

  It was proved by three mutations, each made in a copy of the tree; the real files went green
  again afterwards:
  - with no far-edge fill (`STUFF_SOON` alone), EMPTY ON THE GLASS fails at both widths;
  - with no `min-height` pin, TURNED BACK fails at the end of each run;
  - with no `stuffKeepPlace_`, TURNED BACK fails, drawn, in the second ten.
- **`check/states.js` "six answers in"** now also asks for: no `.chip-k`; Subject's chip exactly
  `Maths✕` and still `data-tag="subject"`; `Any school year✕`; and the Clear tile in `#stuff-clear`
  with no Clear among the chips.
- **`check-flow` journey** "a chosen answer is only its value, and Clear is a tile beside the search
  box that keeps its focus".

### Not done

- `Any …` lowercases the facet's label. For the question-shaped labels it reads oddly: `Any what you
  need`, `Any goes on`. None of them is on a route a pupil takes today. If they matter, give those
  facets a skip wording in the `facets` tab.
- `check/swipe.js` flicks only down the paper. Going back up was measured with a probe, not a rule.
