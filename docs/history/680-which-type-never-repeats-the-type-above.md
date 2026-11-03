# 680 — Which type never repeats the type above, and the chip row never says a thing twice

The owner's screenshot: Find › Practice › Questions › Maths, Type · Worksheet, and then Which type asked again
with Worksheet among its answers, so the row read `Worksheet ×  Worksheet ×`. This was the side effect 660 noted.

**Cause.** `underOwn_(DOC_TYPE_UNDER, v)` (js/find.js) gave a value to Which type both for a type BELOW another
(`5-a-day`, `Specimen paper`) and for a type that has some below it (`Worksheet`, `Past paper`). A plain worksheet
therefore answered Which type "Worksheet", the parent's own name, beside "5-a-day".

**Fix, at the rule.**
- `underOwn_` answers only for a value that is below another. A plain worksheet answers Which type with nothing;
  Doesn't matter covers it. Which type after Worksheet offers 5-a-day; after Past paper, Specimen paper.
- That leaves Which type one answer, which the one rule would hold back ("one answer", thin, lopsided).
  `underChosen_` (facetWhy_): a question whose every answer sits BELOW an answer already chosen is asked even
  alone — its Doesn't matter is the parent's own items. Decided by the values, never by the field.
- The 610 pair (What kind / Which): `notTop_` drops from Which any kind spelt like its What kind, so a kind equal
  to its parent label is never offered twice.
- `filterChips` leaves out a chip whose words an earlier chip already says (the filter stays; its drop still works
  through the first chip of those words).

**Checks.** check-funnel `underTypes_` now proves a plain Worksheet / Past paper answers Which type with nothing
and that Which never repeats What kind; the random walk gains invariant f: no answer offered is already a chip.
check/states.js drops the `typeOwn` Worksheet / Past paper steps that can no longer be taken. The 660 journey in
check-flow asks Worksheet and reads the chip row; the 610 answers journey proves Which never offers Practice.
