# 930 — Find's memory and waits on a phone

Measured by `tools/ux-health.js` (390x844, 4x CPU, public fixture), profiled with CDP sampling (heap and CPU) in the same walk.

**What the 905 MB was.** `usedJSHeapSize` read without a collection: after a forced GC the live heap was ~307 MB.
The rest was garbage from two hot loops, so the fix was to stop making it rather than to shrink the card list
(805's indexes were what ran an iPhone out of memory; nothing here adds an index or a column).

**Cause 1 — `padDrawn_` copied every row.** `stuffPages_` builds every result's pages; `pageParts_` → `stemOnCard_` →
`padSource_` → `padHasArt_` → `padDrawn_` called `workRow_(x)` (an `Object.assign` of the whole row) several times per
card per list. Now the answer is kept on the card (`_pd`), keyed on `LIB.gen` so landed library words re-ask it.

**Cause 2 — `facetTally_` read every item's values twice** (once to count, once for the weighed split). One pass now.

**Also** (owner, same round): `FACET_NONE_SHOWN = false` switches off `facetNoneHtml_` (the "Accuracy verified 0" line),
which tallied every facet on every question asked; and `facetWhy_` never asks a facet with one answer.

Same funnel answers and counts; no lazy list or typed arrays were needed for this round. Figures: the commit message.

**Round 2 (940) — opening a question.** Profiled (CDP, same walk): the ~2 s was not `stuffPages_` (it is memoised on the
list and costs ~0) but `finderWalk_`, which re-asks the funnel chip by chip: each step a fresh `stuffFiltered` (one-entry
memo, so the list and all its `FACET_TALLY` were thrown away) and a `nextFacet` over it. `stuffFiltered` now keeps the last
`FIND_RECENT` (6) lists it made, same key/payload/library, forgotten with `FIND_MEMO.key = null`; a walk through chips just
pressed gets back the same arrays and their tallies. ~6 extra arrays of item refs (~1 MB); live heap unchanged (280 MB).
Open a question 1959 → 1165 ms; what is left is `nextFacet` on lists never painted (~700 ms) and the paint (~170 ms).
