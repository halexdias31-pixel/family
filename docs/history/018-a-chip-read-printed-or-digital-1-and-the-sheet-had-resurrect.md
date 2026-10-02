## A chip read "PRINTED OR DIGITAL 1", and the sheet had resurrected a deleted question

**Reported from a screenshot of the live funnel.** The deleted `Printed?` facet was back, wearing its
old label over a completely different column.

**`facetList` sorts a `facets` row into one of two piles** — a field the code declares is a RELABEL
of that facet; a field the code has never heard of is a NEW question read straight off the column.
**Deleting `paper` from `FACETS` moved the sheet's row from the first pile to the second**, silently,
in a commit that was about something else.

**And `paper` is a column that means something else.** This file already has the collision under its
own heading: `kind: 'paper'` was the document and `paper: '1'` is WHICH PAPER OF THE SET. The deleted
facet read `x.paper`, a literal `true` on every question; the column holds `1`, `2` and `3` on 1,158
rows. So the funnel offered a question labelled *"Printed or digital"* whose answers were **1, 2 and
3** — and pressing one quietly filtered the library to Paper 1s while the person believed they had
answered a question about printing.

**No rule could have caught it.** It is not lopsided — three answers and a real split. It is not a
literal — the answers move. And **nothing compares a LABEL against what a column holds**, because
nothing can.

**So a deletion is remembered.** `RETIRED_FACETS` is the `ACCEPTED` / `VOCAB` / `ACCEPTED_TAP`
pattern for a fourth time: one entry, one written reason, and a spreadsheet cannot undo a decision
the code made on purpose. It does not bar the column for ever — if "which paper of the set" is wanted
as a question it is one entry in `FACETS` with a label somebody has read, **which is the whole
point: a label is exactly the thing a spreadsheet cell never gets reviewed.**

**The sheet still needs fixing**; this only stops it drawing. Proved by mutation — without the guard
the facet comes back as `label "Printed or digital", answers: 1 / 2 / 3`, which is the screenshot —
and a legitimate invented facet (`field: pages`) is untouched.
