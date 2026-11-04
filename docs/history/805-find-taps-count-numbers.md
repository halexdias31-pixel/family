# 805 — A Find tap counts numbers: facet columns, kept pages, the quiet reading

Stage 2 of making Find fast. A funnel tap took 0.9–3.3 s at 4x CPU on a 390×844 phone (and the first tap after a cold
landing up to 14 s). The aim: under 150 ms tap to next question on typical paths, behaviour identical.

## Where the time went (CPU profile, 4x)

- `facetTally_` asked every card every facet again on every tap: `facet.of(x)`, `asList_`, `spellKey_` and two string
  hashes per card per facet, over ~18,000 cards for "Practice", ~35,000 for the whole library.
- `stuffPages_` re-ran `pageParts_` for every result on every tap (stem plans, chunk weights, `stemOnCard_`,
  `questionHasAns_`), plus `wholeQuestions_`' `sib.indexOf` per part.
- `writingWeights_` still read `x.libBook`, retired by 520 — so every card weighed 1 and the 517 rule ("a writing weighs one
  however many verses") had silently stopped applying.

## What changed (js/find.js, one line in js/shell.js)

- **Facet columns** (`itemIx_`, `listIx_`, `facetCol_`, `facetRead_`, `facetIntern_`): every card has a number, every facet
  a column by it holding the card's values, each value interned to a number with its spelling key numbered too. A tally
  counts into arrays (`cnt`, `kw`) in the order this list first meets each value, so `by` is built in the same order the
  string walk built it. Columns live for one epoch (`facetEpochFresh_`: payload, facets tab, Ledger generation, your
  results, viewer, writings that came); `stuffForget_` drops it. The old string walk is kept for outside an epoch.
- **Narrowing by number** (`stuffNarrow_`): a chip's spelling keys are numbered in the column and each card's numbers
  checked; `filterHit` is the rule outside an epoch. Same rule: any value whose spelling key matches.
- **Writings weighed by 520's keys** (`writingKey_`: work + text): read in the same walk as the counts.
- **Kept pages per card** (`PAGE_KEPT`, `PAGE_PARTS`, `pagePrevKey_`): a card's pages are kept per set of page-reader chips,
  keyed on which of its stems the card before already drew (the only thing `pageParts_` takes from it), the payload, the
  Ledger generation and the whole list. `qId_` memoised per card; `wholeQuestions_` asks one set, not each sibling list.
- **Stem weight** memoised per stem per Ledger generation (`stemWeight_`), as `stemPlan_` already was.
- **The quiet reading** (`facetIndexJobs_`, `pageWarmJobs_`): an `index` job in the builder (`ahead_`, ranked last,
  `cold`, 25 ms slices) reads every facet's column, then every card's pages, so the first tap on a big list is counted,
  not read. Its key carries how far it got, so a job with more to read is not "stuck" (`aheadStill_`).

Behaviour: the same funnel. 546's first answers are untouched (`tools/finder-tags.js --check` green); one rule per facet
(the column is the one reader, `facetOwn_`, for every facet); both finders share the columns, which hang off the card, not
the binding. The writings fix changes **no funnel step**: 72 states walked three deep with 14 answers each, as a student and
signed out, ask the same facet with the old weights and the new (the library's writings are not where a split is close).

## Timings, tap to the frame after it, 4x CPU, 390×844, the student, `check/funnel-speed.js -v`

| Path | Before (7bf1edb) | After |
|---|---|---|
| Practice › Questions › Maths › Past paper › first | 1968 · 1591 · 1917 · 1238 · 189 | 644 · 835 · 336 · 348 · 451 |
| Practice › Questions › Biology › A-Level › AQA | 1600 · 1611 · 749 · 515 · 227 | 451 · 353 · 238 · 282 · 297 |
| Library › first › first | 273 · 180 | 273 · 181 |
| Practice › Answers › first › first | 1386 · 1472 · 525 · 236 | 396 · 557 · 211 · 172 |
| Practice › Questions › Chemistry › GCSE › AQA | 1442 · 1800 · 658 · 455 · 347 | 395 · 595 · 257 · 237 · 162 |

Median 1386 → 336 ms. The 150 ms target is met only on the narrow steps; a tap on a whole-library list (Practice,
Questions, Answers) is still 400–850 ms at 4x, most of it the page list (`stuffPages_` builds one entry per page of every
result) and drawing the first cards. Next: a page list built lazily up to the window, and the bundle's front page
(`bundleBuild_`, 55 ms at 4x on the big lists).

## The check

`check/funnel-speed.js` (slow, in check-all): five paths, every tap within 1200 ms at 4x and the median within 450 ms —
the budget catches a return to the 1–3 s era without failing on CI's slower machines. Port `FUNNELSPEED_PORT`.
