## The funnel's answers are chips that wrap like text, and a sitting is asked as Summer, then 2018

**Asked for as "turn the finder options to look more like the google chips tags … they dont need to
appear one above the other but can fill like from left to right top to down like writing a
paragraph" and "some tags are like summer 2018 when it should just be summer then 2018".**

**THE ANSWERS ARE CHIPS.** `stuffQuestion` wraps its answer rows and `Doesn't matter` in one
`.answers` box, which is `flex-wrap`, so a chip is as wide as its words and the answers fill a line
before starting the next. `.row.tap.counted` is a pill now: an outline (`--chip-line`, declared on
`.answers, .chips` because it is this family's own edge), no fill at rest, a light fill under a
finger, the radius half the 44px height so a long answer still wraps inside its own chip.
`Doesn't matter` is the same chip with a dashed edge and the dim colour. The chosen-filter chips
above (`.chip`) are the same pill and outline, FILLED, which is how a filter chip says "on". The
chips' field label (`.chip-k`) moved to `--dim`: `--faint` on the 8% fill measured 3.97:1 and
`check/ui.js` named every field on the first run.

**THE SITTING IS TWO QUESTIONS.** `examWave` answered `Summer 2018`, and sixteen sittings grouped
into year pairs whose answers then repeated the year. It is `examSeries` (label `Sitting`: Summer,
Autumn) at order 130 and `examYear` (label `Year`: 2024 … 2017, newest first, the `2023 & 2024`
pairs only when more than seven) at 132, both rows in `data/settings/facets.json`. Both read
`sittingOf_`, which cuts `waveOf`'s answer in two and is memoised on the item, so they cannot
disagree with each other or with the bundle. `examWave` is in `RETIRED_FACETS`, so a sheet row
cannot bring the joined answer back. A facet may declare `cmp` for an order that is not a date the
`dateKey_` test can read: years newest first, series in the order of the year (`seriesCmp_`).

**The bundle still says `Summer 2017`.** Its title has a reader of its own over `waveOf`
(`SITTING_READER_`), and falls back to the series word and the year chip when the papers do not
share one sitting; its groups read `waveOf` directly.

**Measured, the walk the owner takes** — Maths · Past paper · GCSE, topics skipped, Higher:
`Sitting: Summer (555) | Autumn (335)` → `Year: 2024 | 2023 | 2020 | 2019 | 2018 | 2017` →
`Paper: Paper 1 | Paper 2 | Paper 3`.

**Checked.** `check-funnel.js` rule 4 is three now: `waveOf` over the items is `<series> <year>`,
the Sitting question offers series words only, the Year question four-digit years only, and the
run fails if `examWave` is still live. Proved by mutation both ways (an unsplit series names 16
answers; `examWave` back in `FACETS` names it). `check/states.js` gains `the sitting, then the
year`, whose expect wants bare years and two chips on one line; with the answers back in a column it
names the state at every width.

### A review found two more, and both were the change rather than the app

**A ONE-LETTER CHIP WAS 34px WIDE.** "As wide as its words" has a floor the words do not set: the
letter ranges the funnel groups a long list into are often one letter (`S` among the topics, `G` and
`P` among the English papers), and those chips measured 34x44 at 320 — under the tap floor sideways.
No state reached one, because every answer the declared states land on is a word. `.row.tap.counted`
has `min-width: 44px` and centres its label, and `check/states.js` gains `an answer one letter
long` (Topic over GCSE Maths past papers, where `S` is a range). **Proved by mutation**: without the
floor the tap-target rule names `"S" is 34x44` at all four sizes.

**THE PAPER ANSWERS STILL SAID `— June 2024` UNDER A `2024` CHIP.** `paperLabels_` appended its
subject and tier rungs after the paper's date (`Paper 1 — June 2024 · Foundation`), so `nameForms_`
had nothing to cut between `Paper 1` and the whole string, and the first version of this change
exempted the year from the paper-label rule with a comment. The rungs go BEFORE the spaced dash now
(`Paper 1 · Foundation — June 2024`), so the date is the last cut and `shortLabels_` drops it
wherever the answers on screen allow: Physics · Summer · 2024 with tier unanswered reads `Paper 1`,
`Paper 1 · Foundation`, `Paper 1 · Higher`. The exemption is gone and the rule asserts the year;
**proved by mutation** — the rungs appended again names all 7 answers spelling out "2024". A name
with no dash is unchanged, and a bundle's labels shorten the same way.

**`check/press.js` and `check/cards.js` take `PRESS_PORT` and `CARDS_PORT`**, as `check/ui.js`,
`check/cascade.js` and `check/deploy.js` already did: both had a fixed port, which is one of two
runs dying on `EADDRINUSE` the moment two copies of the suite share a machine.
