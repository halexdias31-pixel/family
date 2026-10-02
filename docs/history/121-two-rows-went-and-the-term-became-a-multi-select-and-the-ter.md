## Two rows went and the term became a multi-select, and the term block had been silent throughout

**Asked for as "Remove weeks left running bit. Let term be multi select."** Two things, and the
second is why the first was worth measuring rather than deleting on sight.

**`Running` and `Weeks left` are gone from both documents**, the waiting-list card and the session
receipt, with their two `SPINE_EXTRA` entries and the three sentences of prose that described them.
**What is lost is the term's DATES**: `Running` printed *"Autumn 1 — 02/09 to 24/10"* and nothing
else on the card says when the term is. The term's NAME is still there, and the estimate under it —
`About  6 × £24.00  £144.00` — still says how many weeks it is worth. Written down here because it
is a real reduction rather than a tidy-up.

### The term is a multi-select, and the sessions are counted per term

**A family booking Autumn 1 and Autumn 2 was two jobs.** `multi: true` on the `interval` step is the
visible half; the arithmetic is the part that could have been wrong quietly.

**`bookSpec` returns `windows` — one `{startDate, lastSun}` per chosen term** — and `core.js` walks
each separately and dedupes, rather than taking the first term's start and the last term's end as one
span. **Proved by mutation, and the gap between the two numbers is a school holiday**: forcing the
outer span gives **12 sessions and £264, including `26/10`** — the October half-term week, when the
school is shut; the per-window walk gives **11 and £242**. A family would have been charged £22 for a
week nobody is teaching.

**Everything downstream is a count rather than a span, which is what made this safe.** `slots` is
`sessionDates.length`, and `priceLooksWrong` on the backend derives its weeks from that same count —
so the price scales with the dates and no `.gs` file changed. `term_name: S(body.interval)` is a
string cell and takes `Autumn 1, Autumn 2` as written.

**And the ticked list is kept in the order it is OFFERED, not the order it is tapped.** Ticking
Autumn 2 and then Autumn 1 reads back `Autumn 1, Autumn 2`, because a receipt listing a family's
terms out of order reads as a mistake in the booking.

### `new Date('02/11/2026')` is 11 February, and that is why the whole block drew nothing

**The waiting-list term block had never once run.** `waitTerm_`'s predecessor sorted and compared
with `new Date(v)` on this app's own `dd/mm/yyyy` cells: `02/11/2026` is 11 February to a browser —
already past, so never "the next term" — and `23/10/2026` is month 23, which is `NaN`, so never "the
term running now". **Both branches were permanently false**, and the card simply had two fewer rows
on it.

**`parseDMY` is the app's own reader and was three files away the whole time.** Same shape as
`waveOf`'s timezone fault, which cost this app seven buttons, and the same fix: one reader.

**It was only visible because the harness was given a seat price.** `bookPrice()` returns `null` for
a waiting list with no `BOOKING.loc`, so `breakdownRows` returns on its second line — and
`check/fixture.json` had no `waitlistSeat` at all. **So `booking · a waiting list` had been measuring
the branch EMPTY on every run since it was declared**, which is this file's own sentence about the
fixture that could not reach the receipt, the message thread or the basket. One venue in the fixture
and one line in the state, and the priced branch drew for the first time.

### A push naming a question is dropped, so the term could not be pushed at all

**`bookBreakdown` builds `said` from every step's label and drops any priced row naming one twice** —
which is right, and it means `push('For', …)` and `push('Term', …)` were both silently discarded.
`jobRows` had already found this on the receipt and written it down; the form kept the copy.

**So the term fills its own STEP instead**, through `st.fallback` — the hook the `client` step
already uses to show what a booking would be submitted as. **And `fallback` was ignored for a multi
in three places**: `stepRows_`'s value chain, `stepSelect_`'s locked branch (which is the one a
waiting list actually takes, because `options()` is empty there) and `stepSelect_`'s open first
option. One `fb`, read once, used in all three.

### Two things the newly-reachable card reported, and neither was the new feature

**`span.bk-r overflows by 2–3px` at all four widths.** `.bk-row`'s rate track was `7.5ch` and
**`£12.00/h` measures 52px of `--mono` in a 49.45px track** — `ch` resolves in the ROW's proportional
font while the figure is set in the mono one, which is the `6 dates` fault one column along. It is
`8ch` again, and the note records that the earlier reduction from 8 counted characters instead of
measuring them.

**`.pane hides 4px below its own fold` at 768 and 1280.** `A seat` merges onto the Venue row, and
`spineRows_` then invented a dash for a row that was already drawn — a blank for a fact that is on
the card. `bookBreakdown` collects the keys it merged (through `SPINE_ALIAS`, so `Students` counts as
`Seats`) and hands them to `spineRows_` as `said`, which is the same argument as `only:`: a row that
cannot be filled and a row that is already filled are both rows with no dash to invent.
