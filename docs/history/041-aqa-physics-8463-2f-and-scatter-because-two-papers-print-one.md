## AQA Physics 8463/2F — and `scatter()`, because two papers print one graph

**60 questions against `Mark scheme (Foundation)_ Paper 2 - June 2024`.** Cover total 100, margin
boxes 8, 9, 8, 13, 9, 8, 18, 13, 14, and the scheme's own arithmetic asserted — including
√18.62 = 4.3 to two significant figures.

**Questions 8 and 9 are questions 1 and 2 of 8463/2H word for word**, so <b>Figure 14 here is Figure
2 there</b>: the same six points of Table 1 plotted on the same grid. Building that twice is two
chances to disagree about where a cross goes, so the plotter moved to `tools/svgplot.py` as
`scatter()` — **and the extraction was proved byte-identical against the Higher paper's already
committed rows before it was kept**, which is the `libraryExtras_` move: prove it identical first,
then make it.

**Figure 9 is drawn from the corners the scheme quotes back.** A distance–time graph in three
straight sections, 3200 m in 2000 s at a mean of 1.6 m/s, with B the shallowest — every one of those
is a number the scheme prints, so the picture is determined and the script asserts the last corner
gives the mean speed. **Figure 6, one question earlier, is NOT drawn**, and the two together are the
line this repository keeps: 03.4 says only that the acceleration falls as the mass rises, and no
point on it is stated anywhere in the paper, so redrawing it would be inventing data.

**And `9.8` is not exact in binary either.** `25000 * 9.8` is 245000.00000000003, so the weight
assertion needed rounding — the second time in two papers that an assertion refused a true statement
for a reason worth writing down.

### `and` against `&` is two buttons, and my own probe said there was nothing there

**Nine AQA science papers went in over one session and three units ended up spelled both ways**:
`Atomic Structure and the Periodic Table` beside `Atomic Structure & the Periodic Table`,
`Magnetism and Electromagnetism` beside `Magnetism & Electromagnetism`, and `Infection and Response`
where `data/topics.json` says `Infection & Response`.

**`spellKey_` cannot fold these and is not meant to.** It reduces an answer to its letters and
digits, which is what makes `Alevel` and `A-Level` one button — and `and` is four more letters, so
the two spellings are two identities and two answers in the funnel for one unit.

**The throwaway probe I wrote to look for exactly this reported clean.** It normalised `the` out of
the middle of words and collapsed the wrong things; the raw tally of topic values, printed and read
line by line, showed all three immediately. **Same shape as `check-booking.js` exiting 0** — an
instrument that could not reach its subject, and I believed it. The rule is in `check-library.js`
now, so the next one fails instead of being looked for.

**And the first version of that rule was too wide, which is the `check-rows.js` lesson again.** It
lower-cased as well, so it reported all 46 of the file's case-only pairs — `Histograms` beside
`histograms` — as faults. Those are correct: `spellKey_` folds them and `topicOf_`'s vote picks the
spelling to show. The rule asks only the one question that fold cannot answer. **Proved by mutation
in both directions**: one row changed back to `and` fires it and exits 1; the real file is green.
