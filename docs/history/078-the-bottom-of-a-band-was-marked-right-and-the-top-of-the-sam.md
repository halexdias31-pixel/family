## The bottom of a band was marked right and the top of the same band was marked wrong

**Found by asking whether the two papers somebody is sitting tonight actually mark.** Q13 of the
May 2017 Foundation Paper 1 is *"write down an estimate for the real height of the man"* and its
scheme takes **1.5 to 2 metres** — there is no single right answer to it, and `accept` says so in
the scheme's own words.

**`markBare_` strips a trailing word from the expected side, and `to 2 metres` IS a trailing word.**
So `1.5 to 2 metres` quietly became `1.5`, and measured before anything was changed:

| typed | marked |
|---|---|
| `1.5` | **Correct** |
| `1.75` | Not yet |
| `2` | **Not yet** |

**Both ends of one accepted band, from one cell, disagreeing.** And the bottom passing is what made
it invisible: a rule that failed everything would have been reported the first time anybody used
it, where one that says yes to the first number in the cell reads as marking.

**Three rows in the whole library carry a band** — Q13(a), Q13(b) and Q18(a) of that same paper —
and all three are on the paper a student is working through this evening. `markRange_` is the rule
rather than three repaired cells, which is this file's own sentence about `cost: 0` and `paper:
true` for the ninth time.

**Only `to` and the two long dashes.** A plain hyphen between two numbers is also how a person
writes a subtraction and how this library writes an age range, and a rule that cannot tell them
apart marks a WRONG answer right — the one failure worse than the one being fixed. **Compared as
whole numbers**, for the reason `markFrac_` gives: the ends of a band are decimals and a float
comparison at a boundary is the one place this must not be approximately right. Both ends inclusive,
because a scheme printing "1.5 to 2" accepts 1.5 and accepts 2.

**Proved in the app as well as in the check**: typing 1.75 and 2 into Q13(a) as a signed-in student
both come back *Correct*, 0.9 comes back *Not yet*. `check-marking.js` is 46 cases now, and the
mutation names five of them.
