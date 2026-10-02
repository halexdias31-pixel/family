## The flow, declared in one place and measured

**What the order is now, and the principle behind it**: a question that changes WHICH QUESTIONS COME
NEXT is asked before one that merely narrows the list.

```
What for → What kind        the two doors. `always` keeps them in front whatever the sheet says
Subject                     then the boxing and practical branches, which the coverage rule hides elsewhere
Type                        the errand: a past paper has a Sitting and a Tier; a worksheet has a Grade
Level → Key stage → School year → Grade      who it is for, coarse to fine
Topic area → Topic          the branch, then the leaf
Exam board → Tier → Sitting → Paper → Question number → Question part      where it came from, drilling in
What you need → Publisher → Where → Category → Goes on → Price
```

**The greedy walk over the real library**: What for → What kind → Subject · Maths → Type · Worksheet →
Level → Key stage → Grade → Topic area → Topic → Paper, every step a real narrowing. The interleaving
of the past-paper questions and the worksheet questions costs nothing, because the coverage rule
skips whichever set the list on screen cannot answer — which is what makes one order serve two
errands without the funnel needing to branch.

**Two things left as printed findings rather than changed.** `Level` holds four range values —
`KS2–GCSE` 19, `KS2–KS3` 12, `KS3–GCSE` 10, `GCSE–A-level` 2 — where `Key stage` splits a comma into
a list; splitting those would put `KS2` and `KS3` into the Level question, which is a new overlap with
`Key stage` to fix an old one. And 27 rows have `KS3` in the level column and no `key_stage` cell, so
`Level · KS3` finds 27 where `Key stage · KS3` finds 736: rows to repair, and the `not:` rule
correctly does nothing on them because there is nothing there to defer to.
