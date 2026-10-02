## `needs` — what you must have in front of you, as one column

**Asked for as three things**: whether a question is calculator or not, whether a print is required,
whether a compass is required. **They are one column**, and this repository has already paid for
learning that — the `images` note above is the whole argument. Three booleans is three schema
changes, three mappings, three renderers and three checks, and the day somebody needs a fourth (a
protractor, tracing paper, squared paper) it is all four again. `needs` is a comma-list read by
`asList_`, exactly as `topics` and `keystage` already are.

### Where each one lives is the part that matters, and it is not the same place

**Calculator is a fact about the PAPER.** It is printed on the front cover — *"You must not use a
calculator"* — and is true of all 31 questions inside. So it sits on the `kind: 'document'` row:
**103 cells covering 1,013 questions**. Writing it onto every question row would be a thousand
chances for row 4 to disagree with row 3, which is the denormalisation hazard `paperMismatches`
exists for.

**A compass is a fact about the QUESTION.** One question asks you to construct a bisector and the
other thirty do not.

**So the card shows the union**, outermost first — the same shape and the same order as `preamble_`.
Measured: `No calculator · Compass · Ruler` on the November 2019 Paper 1 question whose text names
both, `No calculator` alone on the rest of that paper.

### What is filled in, and what is deliberately left blank

| | |
|---|---|
| the paper's own name states calculator or not | **103 papers → 1,013 questions.** Written |
| the question's own text names a compass | **2 of 4,005.** Written, and that is all of them |
| ruler 10, protractor 2, tracing paper 0 | written |

**Two of four thousand is not coverage**, and inventing the rest from topic words — *construct*,
*locus*, *bisector* — is the thing this file warns about three times: a renderer that printed "not
drawn yet" off the `figure` column and was wrong on ~120 questions, and a curve read by eye that
gave 50 where the pixels said 48.1. **A wrong "you need compasses" sends a tutor into a lesson with
the wrong bag**; a blank one sends them to look at the paper, which they were going to do anyway.
`check-library.js` prints the number so it is a backlog rather than a silence.

### The printed sheet already existed twice, and the two are disjoint

**The first version of `tools/set-needs.py` derived it from `figure`** — the four answer-space
labels — and would have been a **third** spelling of a fact the library already holds two of:

```
needs_print     True on 252 rows      print_required  True on 104 rows
rows True in BOTH: 0                  rows where they disagree: 356
printable       True on 1,287  — a different fact: whether a PDF exists to print at all
```

**Zero overlap is the tell.** Two columns meaning one thing, written by two imports over two
disjoint subsets, neither ever given the other's rows. `find.js` had already noticed, where the
deleted `Printed?` facet used to be: *"the three columns it might have read disagree anyway, so an
honest version of this question would have had to pick one and say why."*

**So it is read, not rewritten.** `libraryInto_` unions the two onto `needsPrint` and `needsOf_`
puts the answer in the same list as everything else. **A union is safe precisely because they are
disjoint** — there is no row where one says yes and the other no, so nothing is adjudicated and
nothing is invented. Rewriting 356 content rows to make a filter work is the diff `levelOf_` already
refused to produce.

### A list column is checked per item, not per cell

**`key_stage` gave this away and it took a second list column to notice.** Its vocabulary read
`KS1`, `KS1, KS2`, `KS2`, `KS3`, `KS3, KS4`, `KS4`, `KS5` — five values and two COMBINATIONS,
listed because the loop compared the whole cell. Fine at two, combinatorial after: `needs` holds six
atoms, so a cell-wise list would need **sixty-three** entries to permit what six atoms already say,
and a real pair like `Compass, Ruler` fails until somebody types it out.

`LIST_COLS` splits those columns before checking, the combinations are gone from `key_stage`, and
**the mutation proves it catches a stray hidden inside a valid list**: `"Compass, calc"` reports
`needs = "calc" on 1 row`, where a whole-cell check would have had to reject the pair or allow the
typo.

### And `libraryInto_` had a dead guard from the rename

`if (String(r.kind).toLowerCase() === 'paper') return;` — the value the rename made `document`. So
the guard has been permanently false since, and all 665 document rows have been arriving in
`DATA.questions`. **Nothing was drawn wrongly**, because `questionItems` filters `kind !== 'document'`
itself; the line was simply dead, under a comment describing what it no longer did. Same shape as
`resource_type` in `VOCAB` and `isEdexcelGcseMaths`, which the same rename also broke in silence.

**It is deliberate now rather than accidental**, because the app needs those rows: a document row is
where a paper-level fact lives, and `needsIndex_` reads them straight out of that list. Restoring
the skip would have taken that away; leaving a dead line would have left the next reader believing
the opposite of what happens.
