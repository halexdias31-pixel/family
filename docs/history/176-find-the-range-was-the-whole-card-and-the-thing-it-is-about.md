## "Find the range." was the whole card, and the thing it is about was on the page before

**Asked for as *"can you ensure maths foundation paper 1 is refined and nice. also navigation is a
bit buggy for one student apparently. this is for maths foundation. summer 2024."*** Two halves of
one report, and they turned out to be one change.

**MEASURED FIRST, on `RS1786302107764-415`**: 41 questions, 80 marks, every one answered, 30 with a
Check — and **seventeen carrying a `figure` with `diagram` empty on all of them.** Two of those are
answer space; the other fifteen are pictures the paper prints and the transcription lost.

### The navigation report is not the pager, and that took ruling out rather than assuming

**The press pass walks a 41-question paper forwards and backwards on every run — the 2017 Foundation
one, as an admin and as a stranger.** Neither is the reported case, so the first move was a probe
that walks THIS paper as a STUDENT, by the route a student takes: answering the funnel's own
questions in the DOM rather than poking a filter in.

| walked as | pages | in the right order | held | clipped | arrived scrolled |
|---|---|---|---|---|---|
| **student** | 41 | **41 of 41**, forwards, backwards and jumping | 16 elements | 0 | 0 |
| admin | 41 | 41 of 41 | 16 | 0 | 0 |
| signed out | 41 | 41 of 41 | 16 | 0 | 0 |

**And at three real phone sizes rather than one**, because `check/ui.js` spent months measuring every
width in an 844px viewport: at 320x568, 390x844 and 414x736, **nothing is clipped and nothing
arrives scrolled** for any of the three. `stuffWindow_`'s recycling, `domIndex_`/`logIndex_` and
`paneReach_` are all sound on this paper.

**SO THE PAGER IS NOT IT, AND THE CARDS ARE.** Only Q23 had a preamble. Every other multi-part
question left the shared stem on part (a), so the strip handed a student:

| the card | all it said |
|---|---|
| Q15(b) | *"Find the range."* — no stem and leaf, no times, nothing |
| Q8(ii) | *"Give a reason for your answer."* |
| Q9(b), Q9(c) | *"Work out the input when the output is 28"* — no machine |
| Q22(b), Q24(b) | *"Does this affect your answer to part (a)?"* |

You had to swipe back to read what the question was about, and swiping back loses your place in a
41-page strip. **That is the report**, and it is not a navigation fault at all — it is six cards that
cannot be read on their own.

### A question-scoped preamble fixes both halves at once, which is why they are one commit

**`preamble_` DRAWS IT ON EVERY PART THAT HANGS FROM IT.** So the stem is written once and the
FIGURE is drawn once and appears on (a), (b) and (c) alike — the mechanism this repository already
chose for the AQA insert, for this paper's own Q23, and for the 2017 Foundation Q13, whose script
`tools/refine-1f-2406-p1.py` is built from. Five new preambles: Q8, Q9, Q15, Q22, Q24.

**Measured through the app after: 14 parts across 6 questions draw their shared stem, where before
2 did** — and those two drew a description of a Venn diagram that was never drawn.

**Q11, Q13, Q21 AND Q25 GET NONE, and that is the line.** Their parts are genuinely independent —
three unrelated calculations, notes in a wallet and then coins in a bag, a subtraction and then
somebody else's working. A preamble over those would be a heading with nothing under it.

### What is drawn, what is a table, and what the mark scheme settled without the paper

**CLAUDE.md's rule unchanged: only where the row's own words, or the scheme's own arithmetic,
determine the picture.**

| | |
|---|---|
| **Q22's floor plan** | the best case, and it needs no paper at all. The scheme prints `(10 − 6) × (8 − 5) = 12` and `"80" − "12"` among its routes, which fixes the L exactly — 10 by 8 with a 4 by 3 notch, 80 − 12 = **68 m²**, which is the answer. Asserted, along with 3 tins covering 75 |
| **Q23's Venn** | fixed by its own two answers. P′ is 10, 11, 13, 14, 16, 17 and P ∪ Q is five of nine, which places all nine numbers with 15 in the overlap and nothing left over |
| **Q25(a)'s line** | fixed by its answer, y = 3/2 x + 3, on the grid its lead states |
| **Q8, Q9, Q12** | every number is the paper's; Q8 and Q12 carry Edexcel's own *"Diagram NOT accurately drawn"*, which is also what stops x being measured instead of worked out |
| **Q3 and Q19** | shape from the row, one number chosen here — and neither choice can move the answer: any reflex angle is called reflex, and any placement of A with B at A + (5, −4) is described by that same vector. `examiner_note` says so on both |
| **Q7's grid** | squared paper with **no axes**, because the scheme gives a mark for "a linear scale present" and says it need not start at 0 — an axis drawn here would be a mark awarded by the picture. `blankgrid` gained `frame=False`, and its four existing callers were proved byte-identical first |

**THREE ARE TABLES AND NOT PICTURES**, which is this file's own line. Q15's stem and leaf, Q16's
three pack prices and Q7's hours were prose summarising a printed table — fifteen values a reader
has to re-pair by counting along two lists.

**Measured: pictures drawn here 98 → 107, and questions whose picture never came across 707 → 692**
— the fifteen this paper was missing. The paper now reports **0**.

### A screenshot found five faults and one of them contradicted its own answer

**Twenty-fifth time this file writes that a screenshot is the last word on a drawing** — counted off
the entries above rather than remembered, because this tally has been wrong inside its own warning
twice. Every one of these measured perfectly: valid markup, inside its own box, card fits.

| | |
|---|---|
| **Q3's arc was on the wrong side** | it swept the 140° — the angle the answer's own note calls the wrong turn — so **the picture said "obtuse" while the row said "reflex"**. One sweep flag |
| **Q7's table lost Saturday** | five columns in a 320px card, so the fourth day and its two figures were off the right-hand edge, on the question whose whole job is comparing four days. Days down, not across |
| **Q23's circles broke out of E** | r = 62 about a centre at 96 inside a box ending at 156, and two of the four numbers outside both circles were painted BELOW the universal set they are members of — a Venn diagram contradicting the notation it teaches |
| **Q8 had three numbers and no arcs** | so nothing paired a label with an angle, and the 220 read as detached from the figure entirely |
| **Q22's "6 m" was 3px past the top of its own box** | the one of the five `check/cards.js` could see, through the four-edge rule added with the practical drawings |

**And that rule named it four times under two wrong row ids** — twice as `Q-1MA1-2406-1H-13a`, on
the Higher paper. Measured: exactly one row in the library carries a diagram containing "6 m", and
it is the new Q22 preamble. Worth knowing before somebody chases a Higher-paper drawing that does
not exist; the mis-attribution went with the finding.

### The marker could not compare a ratio, and the dash half of its band rule had never run

**`markNorm_` TOOK THE SPACES OFF EITHER SIDE OF A FRACTION SLASH AND LEFT THEM ROUND A COLON.** So
`2:3` typed against the `2 : 3` a mark scheme prints came out **false** — the failure this file calls
the worse of the two. Measured across the library first: **not one of its 1,435 `accept` cells
contains a colon**, so no ratio answer anywhere could mark itself, and 62 ratio questions have none
at all. That is also what proves the fold cannot change an existing row. Q10 of this paper is the
first that can, so the paper is 31 of 41 with a Check.

**AND `markRange_`'s DASH BRANCH WAS DEAD FROM THE DAY IT WAS WRITTEN**, two lines apart:
`markNorm_`'s SECOND line turns an en or em dash into a hyphen — right, because a minus typed as
U+2212 has to compare equal to one typed as `-` — and it runs BEFORE the `(?:to|–|—)` regex. Only
the word `to` could ever match.

**Nothing could see it, because every band case in this repository was written with the word.**
CLAUDE.md recorded the gap and this is the measurement: four new cases, written first, **failed**,
and pass now. The dash is turned into `to` before normalising; a plain hyphen still is not, because
`1.5-2` is also how somebody writes a subtraction. Zero accept cells contain either dash, so this
too is provably a no-op on the current library. 57 marking cases.

### And the fields stay put while the request they are on is in flight

**REPORTED WITH THE LOGIN FAULT: *"i can still backspace login details while its loading logging in.
this is not proffesional or right."*** `send_` disabled the BUTTON and left every box live, so you
could edit the PIN that was already on the wire — and the refusal that came back was then about a
PIN the screen no longer showed.

**ON `send_` RATHER THAN ON THE SIGN-IN CARD**, because it is the one shared POST helper: the
booking form, the composer, the broadcast and the profile save all get it from one place. A lock
written on the card that prompted it is the `cost: 0` shape.

**EXACTLY WHAT IT DISABLED IS WHAT IT ENABLES** — a field already disabled for its own reason, a
locked step on the booking form, must still be disabled afterwards. **And the focus comes back**,
because disabling the box somebody is typing in moves focus to the document.

**Measured against a request that hangs**: fields and both buttons disabled, `is-sending` on the
card, and **a backspace and a 9 typed mid-flight left the PIN as `1234`**. After the refusal
everything is live again, the typed values are intact and the caret is back in the PIN box.

**THERE WAS NO `input:disabled` RULE IN THIS STYLESHEET AT ALL**, so a locked box drew exactly like
a live one — the invisible mode recorded against the paused reel and the camera's shutter. It
recedes to `.62` rather than fading out, because the text is something somebody needs to still be
able to read while it is checked.

### Two things this commit owes to the one before it

**THE FOUR VERSION STAMPS WERE NOT BUMPED when `booking.gs` and `dopost.gs` changed for `hasPin_`**,
so the You screen would have shown the owner no way to tell whether the login fix had deployed. All
four move together to `2026-09-27-c-haspin`, which is what that rule is for.

**AND THE LESSON IS A COUNT RATHER THAN A ONE-PAPER REPAIR.** `check-library.js` prints **a picture
named on more than one part of one question: 146**, and the sharp end of it, **drawn on more than
one of them: 20**. Printed rather than failed, and `figure` is why: it is a LABEL, so two parts both
saying `graph` may mean Figure 3 and Figure 5, and a rule that cannot tell that from two parts
sharing one picture is the `check-rows.js` fault with 95 findings and 2 real ones.

### And three questions still printed their own gap, which is the failure mode that file names first

**Asked as *"is maths foundation paper 1 2024 summer all complete now. with diagram too and
everything"*.** Every picture was in by then and these were not:

```
Q11(b)  "Find the value of [INDEX NOT EXTRACTED - printed as a power, ...]"
Q18     "Write down the value of [INDEX NOT EXTRACTED - ... 10 to the power 0]"
Q28     "Solve x + 11 [INEQUALITY SIGN NOT EXTRACTED] 5 - 1/2 x"
```

**THE SYMBOL WAS ALREADY KNOWN AND WRITTEN DOWN TWO COLUMNS AWAY.** Each row's `examiner_note`
said what it is and how the scheme settles it — so the question was unreadable while its own
answer sat beside it, which is the fault this file records on the AQA chemistry papers: a
description is right while the thing is missing and a second, worse source for it the moment it is
not.

**AND IT IS THE TEXT LAYER'S WORST FAILURE, which this file names four ways and calls this one the
worst "because the question still reads sensibly and is now a different question".** `10 to the
power 0` and `10` are both askable; `x + 11 ≤ …` and `x + 11 = …` have different answers.

**Each is proved by its own answer rather than read off a PDF** — 2⁵ = 32 where 5² = 25, 10⁰ = 1,
and x + 11 ≤ 5 − ½x gives exactly x ≤ −4 with equality AT −4, which is what makes the sign
inclusive. The assertions run before a row is written. `examiner_note` keeps the provenance rather
than being emptied: the symbol is recovered rather than transcribed, and a reader is owed that
distinction for the reason `diagram_by` exists.

**AND THE SCRIPT BESIDE THIS ONE HAD NO RUN-ONCE GUARD, WHICH COST A FILE.** `tools/draw-1f-1705-q13.py`
opens by refusing to run against its own output; `tools/refine-1f-2406-p1.py` was written without
that line, and re-running it to add these three appended **five duplicate preambles** with the same
row_ids. Caught by counting ids immediately afterwards and restored from the index — but the lesson
is the precedent's: **a script that rewrites a committed data file refuses a second run**, because
refusing is cheaper than repairing. Both scripts carry it now, and the second run prints the
refusal rather than a diff.

**The paper: 41 questions, 80 marks, 41 of 41 answered, 31 of 41 with a Check, 6 preambles, 9
drawings, 3 tables, 0 missing pictures and 0 gaps left in any question's own text.** The ten
without a Check are correctly without one — an explain, a show-that, a draw-a-chart, a
describe-the-transformation scored as two independent B1s, and an answer that is an infinite family.
