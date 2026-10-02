## The practicals were written for one learner in one town

**Reported as "it seems you speciallised the practicles for me and my situation. it needs to be more
systematic and uniform like repeatable for anyone."** Measured rather than guessed at, because
"feels specialised" is not something to act on directly. Four things, and only one is prose:

| | |
|---|---|
| **`age_min` on 16 of 57 and `wow` on 16 of 57** | **the same sixteen** — the set that came out of one chat transcript. Two columns on a subset draw two kinds of card down one column: eleven saying "7+ · worth opening a session with" and forty-six saying neither |
| **two practicals named after one town's park and its river** | *Perimeter of Wandle Park*, *Flow rate of the River Wandle*, and five more naming a local landmark in their steps or notes |
| **notes addressing one person and one session** | *"before HE is watching"*, *"This is the one to open with"*, *"THE MOST VALUABLE ONE IN THE SET"* |
| **a practical built around what one house has** | *Fish behaviour logging* |

**`age_min` IS NOT `level` RESTATED, AND THAT WAS CHECKED RATHER THAN ASSUMED.** `level: 'GCSE'`
carries ages **6, 8, 9, 13 and 14** across the sixteen rows that have both — the volcano is GCSE
content about rates and ratio that a six-year-old can pour. So `level` is the spec content and
`age_min` is the youngest child who can DO it, and they are two facts. Storing one as the other
would be the `needs_print` / `print_required` fault this file records three times.

**So the rule is stated and the values are not guessed.** Where nobody has made a narrower judgement
the youngest child is the youngest in the band it is set for, which is `level`'s own lower bound —
41 filled that way, 16 judgements kept, and `tools/practical-uniform.py` asserts it never overwrote
one. **`wow` cannot be derived and is written out one row at a time**: a titration and an
electrolysis are the same level, the same venue and the same subject with completely different
answers to "is there anything to see". Deriving it from a word in the name would be the substring
fault that put a gold *required practical* flag on five cards saying they are not one.

**`cost_per_run_gbp` stays on 8 of 57 and that is the one deliberate gap.** A school owns the kit
and nobody has ever costed a lab practical; `libNum` answers absent rather than nought for exactly
that reason. The count is printed so it is a number rather than a silence.

**`check-practicals.js` fails on a live row with no `age_min` or no `wow`**, refuses any of the six
local names as a closed list — the `ACCEPTED` / `VOCAB` / `RETIRED_FACETS` pattern for the seventh
time — and prints per-column coverage, because a column on a subset is invisible until somebody
opens two cards side by side. **Proved by mutation**: a blanked `wow` and a note reading "Meet at
Wandle Park" are named and exit 1.

**And every one of the thirteen prose edits asserts that it found what it was replacing.** A
replacement that silently matches nothing is the shape this file records every time a rule is
written from the instance that prompted it.
