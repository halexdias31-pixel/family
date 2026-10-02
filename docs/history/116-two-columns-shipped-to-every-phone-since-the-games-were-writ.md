## Two columns shipped to every phone since the games were written, and drawn for one person

**Asked for as "add a high scores chart to times table and flabby pird".** Measured before anything
was built: `doget.gs` sends `highscore: N(r.high_score_flappy)` and
`ttHighscore: N(r.high_score_tables)` on **every tutor row and every student row**, and the only
thing that has ever read either is the player's own `Best` line. **This repository's oldest shape
for the seventh time** — `figure`, `orderPrints`, the four message actions, `exam_date`, `wow`, the
eleven dead Settings writers. So the board needed no backend change, no tab and no column: it is the
second reader of something already on every phone.

**WHO IS ON IT IS THE SERVER'S DECISION AND IS NOT REPEATED ON THE PHONE.** `doGet` sends
`payload.students` only when `maySeeChildren` — an admin, a parent or a student — so a signed-out
stranger is sent no children at all and the board simply has fewer rows. Filtering them off here
instead would be the `MESSAGING` fault: one policy in two places, and the copy on the phone is the
one that gets forgotten. Absent by construction, the way the films list already is.

**ONE RENDERER, BECAUSE THE TWO BOARDS ARE ONE OBJECT.** They differ in a single column name. And it
says which empty it is: `scoreRanks_` counts the PEOPLE before it counts the scores, so "no people"
says the scores have not arrived and "people, no scores" says nobody has played — the distinction
`nothingHere` exists for.

### `mineIs_` was local to a screen only a signed-in person sees, and at file scope it threw

**THERE WERE THREE OTHER COPIES OF "WHICH ROW IS ME" AND THE WORST WAS ON THE PATH THIS NEEDED.**
`gameOver` in receipt.js matched a student on **handle alone** and a tutor on **`title` alone** —
two half-tests written out beside each other, either of which answers "not you" for somebody the
other would have found. A tutor whose handle and display name differ was never located, so a record
they had just set was written to the sheet and never to the row the app was holding. Lifted out of
`accountPages_`, given a fourth rung for `t.name` (a student row has no `title`, so before this a
student could only ever be matched by handle), and used by both.

**AND AT FILE SCOPE IT MET A STRANGER.** `USER.personId` on `null` throws, and `toolsStart_` wraps
each widget's `start` in its own try — so the game came up perfectly and the board beside it stayed
an **empty div**, signed out, at every width. **Found by the lab rather than by looking**: the
declared state reported "was entered and shows no…", which is exactly what that assertion is for.

### `SCORE_TOP` is three because the pane cannot grow, and the number is measured

`.pane` is `overflow: hidden`. The Flabby Pird card without a board is 634px against a pane that
caps at 803, so the board has about 140px. At five plus your own line it was 251px and `check/ui.js`
said so on the first run that could reach the state: *".pane holding card hides 111px below its own
fold"*. Three plus yours, on tighter rows, is 140px at every width — measured with a twenty-character
handle wrapping onto two lines, because twenty is what `check-handles.js` allows.

**AND `.row .k` IS `flex: 0 0 auto`, WHICH IS RIGHT FOR A LABEL AND WRONG FOR A NAME.** `min-width: 0`
alone does nothing for it because `flex-shrink` is still 0: the row ran **53px past the card at
320px** and took the pane with it. The board's label is the content and shrinks; the value is three
digits and does not.

**YOUR OWN LINE IS A GOLD RULE DOWN THE LEFT RATHER THAN GOLD TEXT**, and that is a cascade decision
rather than a taste. `.widget-full:has(.flappy) .row .k` scores (0,3,1) — `:has()` takes its own
argument's specificity — so `.board .row.is-me .k` would tie at (0,3,1) and the colour would be
settled by which rule is written later. That is `.price.faint` for the eighth time. Nothing anywhere
sets `box-shadow` or `padding-left` on a `.row`, so this cannot lose a race it does not look like it
is in.

### The times-table save wrote `USER` and not the row the board reads

`gameOver` had already done both for Flappy Bird and `endTimesTables` had only ever done the first —
invisible while the only reader was that card's own *"Your best is"*, and a new record announced
above a list still showing the old one the moment there is a board. Both go through `mineIs_` now.

### And the state that measures it had to seed the visitor, not a name

**THE FIRST VERSION PUT A SCORE ON THE FIXTURE'S ONE TUTOR AND CALLED THAT "YOU".** It is not: the
lab signs in as `Test Admin` / `testadmin` / `P001` and the fixture's tutor is `Ada Tutor` / `@ada` /
`P-@ada`, so `mineIs_` correctly matched nobody and the board drew three rows with no mark. **The
assertion failed and it was right to** — the state was wrong, not the app. It is seeded off `USER`
itself now, and it asserts `SCORE_TOP + 1` read off the app rather than a literal, which is what
caught the assertion going stale the moment that number changed for a measured reason.

**A wait for the payload went in and came out again.** `load()` ends with `DATA = d` — it REPLACES
the object — so a state seeding `DATA.students` before that assignment would have its seed thrown
away, and the flakiness looked exactly like that. It was not: it was the two bugs above. Three clean
runs with the wait removed, so it is removed. **Two rules changed on a measurement nobody took is
what `.mat-out` cost this project**, and the discipline is the same when the measurement exonerates
the change.
