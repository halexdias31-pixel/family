## The booking form said the same eleven numbers seventy-seven times

**Reported with a screenshot of the form: "just look at this so ugly and infomation overload.
howvere im pretty sure its all/almost all neccesary. the grid fucks it abit too. but i kinda need a
grid."** Both halves of that are right, and they rule out the obvious fix: nothing may be deleted,
and the week stays a week.

**Measured first, at 390px signed in, on the empty form:**

| | before | after |
|---|---|---|
| the card | 768px | 784px |
| rows | **28** | **28** — not one removed |
| digits inside the 77 cells | **154** | **0**, and 11 in one header row |
| blank rows whose dash sat at the card's right edge | **12** | 0 |
| the receipt's copy of the same grid | 113px | **80px** |

### The repetition was structural, so the fix is too

**`slotGrid()` BUILDS THE HOUR SPAN ONCE** — `for (let h = 10; h <= 20; h++)` — **and every day in
`SLOT_DAYS` maps over the same list.** So the numbers down each column were not merely alike, they
were the same array read seven times; drawing them seven times was drawing one fact seventy-seven
ways. One header row, and `.hr`'s own note is the argument for it: *"a grid of numbers is scanned
rather than read — you are looking for the shape of the ticked boxes, not reading eleven figures."*
A cell's number was never the thing being read. The column it sits in is.

**One helper, called by both grids.** `jobGrid_` was deliberately built out of the form's own markup
— its comment says *"the form's markup, down to the class names"* — because a receipt drawn with
different elements drifts the next time the grid is restyled. A header written twice would put that
back one element up, which is this file's sentence about `documents_()`, `factsNow_` and
`childrenOf`. And the header is an ordinary `.slot-row` in the same flex box with the same gap, so
the labels take the same `flex: 1 1 0` slice their columns do — **the columns line up by
construction** rather than by two sets of widths that can disagree.

**The cell keeps its name, and gains a better one.** An empty `<button>` has no accessible name at
all, so `aria-label` carries `Monday 14:00` — and, where the hour is shut, why. The bare numeral
never said which day it was on.

### A cell with nothing in it has to state its own height

**`.rc.is-done .hr { min-height: 0 }` was right while every cell held a digit.** The digit set the
height and the line only said *do not pay a fingertip's floor for something nobody presses*. With
the hours gone the cells are empty, so `0` became the actual height: **16.16px a cell before,
2.84px after** — seven rows of hairline with the booked hours floating over nothing. Declared now,
which is the move this file already records twice as *replace a property that was only true by
accident of interaction with one a reader can check*.

**And the day label stopped deciding the row.** Measured: a 9.2px label at the browser's normal
line-height made a 14.2px row round a 9.45px cell. On the form the 20px press target wins outright;
on the receipt it was the label, which is the wrong element to be deciding it. That is where the
receipt's 33px came from.

### Twelve dashes at one x and sixteen values at another

**The right side of the card zigzagged between two columns, twenty-eight times.** A blank row is
`max-content minmax(0, 1fr)`, so its dash landed at the card's right EDGE; an answered row is the
five-track grid, so its value stops two-thirds across where the multiplier, the rate and the total
begin. **Nothing could have caught it**: no overflow, no clipping, every row exactly the width it
asked for. A screenshot, for the ninth time.

**The three trailing tracks are kept on a blank row and left empty.** `.bk-row.is-bare` already
hides `.bk-m`, `.bk-r` and `.bk-t` there, so nothing is placed in them — but a track that exists
still takes its width, and that puts the end of the value column in the same place on every row.
The alternative is a right margin computed from the other three widths, which is the same number
written twice.

**And the label recedes with the value.** A blank row's value already dimmed and its label did not,
so `Weeks left` — a fact that does not exist until a term is chosen — was set in exactly the ink of
`Level`, which is the next thing somebody has to answer. Ten questions stand forward of eighteen
rows now, at no height and with nothing removed.

**What is NOT done, and the reason is `SPINE`'s own.** The twelve dashes stay. *"A document whose
SHAPE changes with its contents cannot be read at a glance: you find a line by where it is"* — and
a row appearing under your thumb as you answer is the fault the week grid's own note already
records about folding. The complaint was that they were loud, not that they were there.

### The known tap-target count went 102 to 492 and that is the honest number

`check/ui.js` keys a finding on the element's text, so seventy-seven hour cells collapsed to eleven
keys for as long as seven of them shared a caption. With `aria-label` naming the day they are
seventy-seven, which is how many controls there are. **The check is not tuned to make its own number
look like it used to** — nothing new is reported, the section is capped at sixty lines with a
remainder, the reason underneath is the same one, and the count that was wrong was the old one.

### The form was printing two other documents' rows, and a priced row twice

**Asked for again: "i just want the booking thing to be more efficient with space. and cant the grid
be better".** So the first move was to measure where the height goes rather than to trim what looked
trimmable. At 390px on the empty form, 784px:

| | |
|---|---|
| the fifteen rows you answer | 285px |
| **the grid and its instruction** | **193px** |
| **twelve rows that are a dash** | **144px** |
| the total bar, the two tiles, the terms | 108px |

**THE SPINE IS THE UNION OF THREE DOCUMENTS AND THE FORM WAS DRAWING ALL THREE.** Measured on a
priced ordinary booking: nine dashes, and eight of them were another document’s. `A seat`,
`Shared by`, `Per session`, `Running`, `Weeks left` and `About` are pushed only inside
`if (isWaiting_()) { … return rows; }`, which an ordinary booking never enters; `Sharing` is
pushed once in this file, by `jobRows`, which is the receipt.

**`SPINE`’S OWN ARGUMENT SURVIVES INTACT, and it is what draws the line.** *"A document whose SHAPE
changes with its contents cannot be read at a glance: you find a line by where it is"* — true of a
row you have not answered YET, because you are about to and everything below it would move. A row
this branch cannot answer at all never moves anything: nothing you do on this form will ever fill
it, and it was never on this document. `only:` is one word on the `SPINE_EXTRA` entry, beside the
row it describes, and **it governs the invented dash and nothing else** — a builder that starts
pushing `Per session` needs nothing changed here, so a flag that goes stale can hide nothing.

**`Asked for` was refused by `check-flow.js`, and the refusal was right.** By the rule above it
would have gone with the rest; the check names the argument this file already records beside
`Stage` and `Status` — those three are the state of the booking, the form and the receipt for one
session are one document across TIME, and a row that appears only once the thing is saved changes
shape at the moment somebody is checking it. The six above are one document across NOTHING: an
ordinary booking never becomes a waiting list. Worth twelve pixels, and the check is why it is a
decision rather than an oversight.

### `Extra subjects` drew twice on every priced booking

**A dash beside `Subject`, and the real row at the FOOT of the card, below `Status`.** `AFTER` in
`bookBreakdown` places that row after the subjects step on purpose; `spineRows_` then moved it to
the end, because `price-rows.js` pushes it as `Extra subjects` and the spine row is `Extra subj.`
— `SPINE.indexOf` came back −1 and it fell through to `extra`.

**The shortening never reached its push site.** The note over `SPINE_EXTRA` records four labels
shortened to fit the 6.2em column; three were shortened where they are pushed and this one lives in
another file. One `SPINE_ALIAS` entry, which is what that table is for. **Found by rendering a
priced booking rather than by reading**: the row list came back with `Extra subjects` after
`Status`, which no amount of reading the two files side by side had suggested.

**And the moment it carried a real value it wrapped** — `Extra / subj.`, eleven characters in a
ten-character column. The `minmax(6.2em, max-content)` repair was already on `.bk-row.is-bare` and
`.bk-row.is-blank` and **not on the rule they are variants of**, which is this file’s own sentence
about `cost: 0` for the eighth time. The floor is what matters and it stays: every label starts at
6.2em, so the answers still line up down the card; `max-content` is a ceiling only a long label
reaches.

### Two hours in a row are one session, so they are one bar

**The instruction above the grid says it in words** — *"two together is a two-hour session; another
day is another session"* — **and the picture said the opposite**: two gold squares with a gutter
between them, which is two of something. A grid you read by shape should not need a sentence to say
what the shape means. Adjacent ticked hours now join, inner corners squared, so Monday 12–15 reads
as one block and Thursday 16 as one hour — on the receipt too, where the booked run is the only
thing on that grid.

**The gap is BRIDGED rather than closed, and that is the whole of it.** `.hr` is `flex: 1 1 0`, so
pulling a cell 2px left with a negative margin hands 2px of free space back to eleven flex items
and every column after the run drifts out of line with the header above it — which is the one
thing the header is for. Three pixels of gold painted into the gutter changes no layout at all.

**And the first version of that bridge made the cell scroll sideways.** Hung off the left cell it
reached `right: -3px`, and an absolutely positioned child sticking out to the RIGHT pushes its
ancestor’s `scrollWidth` — `check/ui.js` named `button.hr overflows by 3px` at eight combinations.
Nothing was clipped and nothing looked wrong; the box had simply started scrolling when it was not
told it could, which is exactly the question that check asks. Painted by the second cell leftwards
it is the same three pixels in the same gutter, and overflow to the left does not enter
`scrollWidth` at all.

### What it came to, and what was left alone

| | before | after |
|---|---|---|
| the empty form | 784px, **12 dashes** | **700px**, 5 |
| a priced ordinary booking | 844px, **9 dashes** | **764px**, **1** |
| a waiting list | 775px | 762px — and its own six rows are back |
| `Extra subjects` | a dash at the top **and** a row at the foot | one row, in its place, on one line |

**The grid is still 193px and is still at its floor**, which is worth repeating rather than quietly
trimming: seven rows at `max(20px, 1.55em)` plus the header is a week where a day has to be
pressable, and the 20px is a fingertip rather than a preference. What was left to win there was the
meaning, not the height.
