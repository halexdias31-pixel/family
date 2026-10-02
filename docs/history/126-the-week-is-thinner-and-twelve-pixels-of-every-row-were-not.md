## The week is thinner, and twelve pixels of every row were not the control

**Asked for as "make the grid squares and grid thinner".** Measured at 390 before touching anything:
a cell was **22.2 × 20** and a day row was **32.8** tall — so twelve pixels of every row were not the
cell, seven times over, and the week was 199px of a 518px card.

**`align-items: baseline` IS WHERE TEN OF THE TWELVE WENT.** `.bk-row` aligns a label's baseline with
its value's, which is right for a line of text beside a line of text and wrong for a label beside a
strip of boxes: a grid cell's baseline sits at the bottom of its content box, so the row grew to put
the day name's baseline there. `center` is what a row of boxes wants and it costs the other rows
nothing, because they do not have it. **The other two are `.bk-row`'s own `.1rem 0`**, which keeps
twelve lines of text apart and is not needed between rows whose content already has a 1px gutter.

**14px, AND WHAT SETS 14 RATHER THAN 12 IS THE DAY NAME.** `.hr`'s floor is 20px and its note says
why — *"below about 20px a cell 24px wide stops being reliably pressable"* — so this goes under it
deliberately, on the fourth asking, and `ACCEPTED_TAP` carries a smaller finding for it. At 12px the
cell stops being the tallest thing in the row and `Wednesday`'s own line box becomes the floor:
measured, 12px buys **two pixels** at 390 and costs a sixth of the target. Below the label there is
nothing left to win, which is a better place to stop than a number somebody liked.

| at 390 | cell | row pitch | the week | the card |
|---|---|---|---|---|
| before | 22.2 × 20 | 32.8 | 199.2px | 518px |
| after | **23.1 × 14** | **22.9** | **111.7px** | **430px** |

**The cells got WIDER doing it** — a 1px gutter between them rather than 2px, which is the same trade
the joined-hours bridge already paints into. At 320 it is 18.5 × 14 and at 768 24.4 × 14, `under: 0`
and no sideways scroll at any of the three.

### The waiting list quietly came with it, and `check-css.js` is what said so

**`blk` IS THE ONE THING THAT DIFFERS BETWEEN THE TWO WEEKS** — three cells a row can pay a real
fingertip where eleven cannot, which is the whole argument written beside `.hr.blk` — **and the day-
row refactor dropped the class from the markup.** So the blocks took the hour week's 14px along with
everything else. Nothing on screen said so and no measurement would have: a 14px block is a legal
box in a card that fits.

**What said so is a class styled and nowhere produced**, in a list that prints and does not fail. Put
back, the rule then had to be named **through the row** — `.bk-row.bk-wk .hr` is three classes deep
and a bare `.hr.blk` is two, so it had been losing a race it did not look like it was in.
`.price.faint` for the tenth time. Measured after: the blocks are **64 / 79.3 / 83.8 × 20**, and a
SAVED waiting list is five classes (`.rc.is-done .bk-row.bk-wk .hr`) and beats this in turn — right,
because a receipt's week is read rather than pressed.

### Three rules fought and two of the three fights were decided by file order alone

| | |
|---|---|
| `.bk-row.bk-wk .bk-v` | `gap` declared **1px at one line and 0 ninety lines down**. Both written deliberately, the first never applied. `check-css.js` |
| `.bk-row.bk-wk .slot-hours` | tied with `.rc.is-done .slot-hours`, three classes each, **on seven elements**. They agreed about the value, so nothing was ever wrong on screen — what was wrong is that the day the two stop agreeing the loser is whichever is further up the file. `check/cascade.js` |
| `.bk-row.bk-wk .hr` | tied with `.rc.is-done .hr`, **on seventy elements**. Named through the row, which is five and also settles the shut day without a second rule |

**And five receipt rules were compacting a grid the receipt no longer draws.** `.slot-grid`,
`.slot-row`, `.slot-day`, `.slot-row.is-shut .hr` and `.bk-open > p` were its copy of the week from
when the week was a block hanging under one row. `.bk-open` went with them — its rules had had no
markup since `jobGrid_` became `weekRows_`, and the arithmetic that ruled that shape out is kept as
prose where the rules were.

### The runner printed the last fourteen lines, and a long report ends with the part that is fine

**`check/press.js` failed once inside `npm run check` and the fourteen lines under the FAIL were the
twelve controls that are correctly quiet and a count.** Two full suite runs went into finding out
what that failure said; it could not be found from that output at all, and running the check alone
passed. **This repository's oldest shape pointed at its own runner** — *I did not manage to look*,
printed as a report.

**The tail stays, because for most checks it IS the finding.** What is added is the one fact it
cannot carry: that there was more, and the command that prints it. **Proved by mutation** — a second
`gap` on `.slot-hours` makes `check-css.js` fail and the visible fourteen lines read `(0) none`
three times and `rules read: 2033`, with `… 30 earlier line(s) not shown — node js/check-css.js`
underneath them.
