## The week is half as wide, chosen over three shapes that would have been free

**Asked for as "i would like the grid to be half as wide as"** — the message arrived cut off
mid-clause, so the first move was the arithmetic for every reading of it rather than a guess. Ten
hour-columns across the answer column measured **194 / 240 / 253px** at 320 / 390 / 768, cells
**18.5 / 23.1 / 24.4 × 14**.

| half the width, as | 320px | 390px | 768px |
|---|---|---|---|
| **squeezed — still 10 columns** | **8.8px** | 11.1px | 11.8px |
| two rows of five hours a day | 18.6px | 23.2px | 24.5px |
| turned on its side — 7 day columns | 13px | 16.3px | 17.2px |

**THE OTHER TWO CHANGE THE SHAPE RATHER THAN THE SCALE, which is why they are free on width** — and
both were offered with their own numbers and their own costs (the five-hour rows double the week
from 112px to ~223px; turning it gives ten rows instead of seven and a new shape on all three
surfaces that draw a week). **The squeeze was chosen over all three with the arithmetic visible.**

**So it is one declaration and the entry is honest about what it costs.** At 320 a cell is 8.8px
with a 1px gutter — a fingertip covers about three columns at once, which is past where a wrong tap
is rare rather than merely possible. `ACCEPTED_TAP` says that in those words rather than dressing it
up, because a list of accepted compromises that reads as though nothing was given up is a list
nobody checks. **What makes it liveable is that a wrong tap costs nothing**: a lit hour comes
straight back off with another tap and nothing is sent until Send — the same argument that file
already makes for a Scrabble square.

**The LEFT edge does not move, which is the half four rounds of this were about.** A grid item with
an explicit width starts where its track starts, so the week still begins at **111.3** with every
other answer on the card; what changes is where it stops — 231.2 instead of 351.1.

**And it is one declaration on the answer CELL rather than two on the strips**, so the hour numbers
and the hours they name cannot come out different widths. That is `.slot-hh`'s own note about a
header sized by hand, and it is why the numbers were then measured rather than assumed: **6.4px of
ink in an 8.8px box at 320**, so a two-digit hour still fits with room either side, and nothing
scrolls sideways at any width.

**NOT THE BLOCK WEEK.** `blk` is the class that already says *this week's cells are different* —
three a row, which is why they can pay a real fingertip where eleven cannot — so the waiting list is
untouched at **64 / 79.3 / 83.8 × 20**. Halving those too would have shrunk the one grid in this app
that is not a compromise, to answer a complaint about the other one. They are never on the same card.

### What the measurement found on the way, and has not been fixed

**Measuring every row's box to answer this printed two things nobody had asked about**, both at 390:

| | |
|---|---|
| **the dashes have four more left edges** | every real answer starts at **111.3** and every label at **38.9**, but a blank row's label track is `max-content`, so its dash starts wherever its own label ends — `Dates` at 75.5, `Status` at 82, `Asked for` at 101.3, `Extra subj.` at 114.2 |
| **the header labels the wrong place** | `ANSWER` spans **96.6 → 221.7** and the answers underneath it run to **351.1**, because the header keeps five tracks and every other row collapses to two. So `×` and `RATE` are printed over space the row below uses for its answer |

**And the thing that has made this flip-flop for fourteen rounds is that `check/fixture.json` has no
`pricing` key.** `bookPrice()` returns null, so **every measurement and every screenshot of the
ordinary form has been of a card where the money columns are empty** — hidden once, put back,
collapsed per card, collapsed per row, each decision argued from a card that could never show the
thing being argued about. `waitlistSeat` was added for the waiting-list state and prices only that
branch. Written down rather than fixed here, because it is the next piece of work and not this one.

### And one step thinner again, which is where the hour numbers take over as the floor

**Asked for as "can you make the grid even slightly thinner".** The word had meant HEIGHT the last
time it was used and WIDTH this time, so both axes were measured before either was moved — and one
of them turned out to be spent.

**THE HEIGHT AXIS IS GONE AND THE RE-MEASUREMENT IS WHY IT IS WRITTEN DOWN RATHER THAN QUOTED.** At
390 the day name's own line box is **14.8px against a 14px cell**, so the LABEL already decides the
row: asking for a 13px cell takes the whole week from 111.7 to **110.7** — one pixel, spread across
seven rows. At 320 the label box is 12.3px and there are about twelve pixels to be had, on the
narrowest phone only. The note over `.bk-row.bk-wk` already claimed the day name was the floor; this
is the measurement that confirms it at the width the app is mostly read at.

**So the width took the step, and it stops at 44% because the NUMBERS become the floor** — the same
shape of stop as the day name on the other axis, which is what makes it a place to stop rather than
a number somebody liked:

| | 320px | 390px | 768px |
|---|---|---|---|
| full width | 18.5px | 23.1 | 24.4 |
| half | 8.8 | 11.1 | 11.8 |
| **44%** | **7.6** | **9.7** | **10.3** |
| hour number, ink against its box at 320 | **6.4 in 7.6** | — | — |

**At 42% that margin is 0.9px and at 40% it is 0.5px**, which is inside the difference between this
container's font rendering and a real phone's — so 44 is the last step with a margin anybody can
trust, and the thing that breaks below it is the LABEL rather than the target.

**Measured after**: week 105.4 / 111.7 / 116.1, card 530 / 593 / 617, `under: 0` at every width, no
sideways scroll, and the block week untouched at 64 / 79.3 / 83.8 × 20. 37 checks pass.

### The waiting list takes the same width, and the word it stores is not the word on the header

**Asked for as "the waitlist grid needs to take from the instant class grid. Same width. But there's
no individual slots. Just chunks."** The width is one declaration — the block week was excluded from
the 44% for exactly one commit and the exclusion is gone.

**THE ARGUMENT FOR EXCLUDING IT WAS ABOUT THE CELL AND THE CELL SURVIVES.** Three columns in 44% is
**27.8 / 34.5 / 36.5px wide by 20 tall** — still a real fingertip, and still about three times the
hour cell beside it on the other branch. What that argument did not weigh is that the two branches
of ONE card were drawing one control at two widths, which is what somebody switching Kind actually
sees. `blk` goes on carrying the height, which is the difference that is still real.

**AND THE LABELS COULD NOT SURVIVE IT, which is the part that is not a one-line edit.** Measured at
44% before anything was changed: `Afternoon` is **34.5px of ink in a 34.5px box at 390** — zero
margin — and at 320 it **wraps onto two lines**, so the header grows to 14.8px against its siblings'
8.9 and reads as ragged. `Morn · Aft · Eve` is 12.7 / 9.6 / 9.6 in 27.8 at the narrowest.

**SO `head` IS A SECOND FIELD AND `name` IS UNTOUCHED.** `name` goes through `blockPhrase_` into the
cell as `Monday morning`, and `waitlistWhen` on the backend splits the event message on commas and
tallies those phrases — so shortening it would leave every row written before today saying `morning`
and every row after it saying `morn`, **counted as two different answers in the one place somebody
reads to decide when to open a class.** That is two spellings of one answer, which this file records
under `level`, `exam_wave`, `topics` and `company`, and it would have been invisible until a tally
was wrong.

**The shortening is visual only and that was proved on the wire**: pressing a cell stores
`"Monday morning"` and its `title` and `aria-label` are still `Monday morning`, so a screen reader
and a long press both get the full word. No backend change, and nothing already in the sheet moves.

**Measured after**: both weeks 85.4 / 105.5 / 111.5 wide, every header label on one line at every
width, `under: 0`, no sideways scroll, 37 checks pass.
