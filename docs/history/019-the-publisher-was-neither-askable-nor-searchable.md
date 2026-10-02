## The publisher was neither askable nor searchable

**Reported as "how would I get to 1st Class Maths worksheets?" and the honest answer was that you
could not.** Measured both ways:

- **The funnel never asks.** `Company` qualifies everywhere — 5 answers, 99% coverage, **a 65.8%
  split on the whole library**, comfortably the best narrowing available — and it sits near the end
  of `FACETS`, so Subject, Level, Type, Grade, Topic and Paper are all asked first. By the time its
  turn comes the list is Maths · KS4 · Worksheet and **every one of those 1,370 rows already IS 1st
  Class Maths**, so the facet has one answer and is correctly skipped. A question that can only be
  asked once its answer is decided is a question that is never asked.
- **The search box did not find it either.** `corbettmaths` returned **0 of 1,020**. `1st class
  maths` returned 325, which reads like it works and does not — coincidental hits on other fields,
  against 1,370 rows carrying the name in a cell.

**This is the `topics` fix one column along**, and the sentence is the same: a publisher's name is
printed nowhere in the question, so the one place that says Corbettmaths is the `company` cell. Built
onto the item, not matched per keystroke.

| typing | before | after |
|---|---|---|
| `corbettmaths` | 0 | **1,020** |
| `1st class maths` | 325 | **1,370** |
| `1stclassmaths` | 325 | **1,370** |
| `edexcel` | — | 1,148 |

**Both spellings, because the file holds one and people type the other.** `company` was normalised to
`1st Class Maths` by the spelling vote, and `1stclassmaths` is what that publisher writes on its own
sheets. A substring search cannot see through a space, so one form found 1,370 and the other 325 —
a search that half-works. `companyAtoms_` emits the shown spelling and `spellKey_`'s reduction of it,
so it is that function rather than a second opinion about what a spelling is.

**The funnel's order is deliberately NOT changed.** `at` is editorial and the `facets` tab owns it:
a low `order` on the `company` row asks it early, with no deploy. Which question somebody wants asked
first is a judgement, and it belongs in the sheet.
