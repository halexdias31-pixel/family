## An answer is its result now, and the working waits under "Why"

**Asked for as "make answers breaifer and their own widget too possibly?"**, and, offered the
choice between shorter written answers and hiding the working behind a tap: **"i want shorter
answers."** Measured first over `data/questions.json`: 4,309 answers, median 88 characters, 1,019
over 200, 324 over 400, the longest 1,677. A card whose answer is a paragraph has not told you the
answer; it has given you something to read to find it.

**The library already said where an answer stops.** 3,107 answers were written `result — why`, with
a result whose median length is six characters. So `answerParts_` (find.js) reads that convention
back rather than summarising anything: what is before the first SPACED em or en dash is the result,
the rest is the why. Not inside a table or a list (that dash is the cell's); inline tags open at the
split are closed on the result and reopened on the why. Mark-scheme codes (B1, M1, A1, P1, C1, cao,
oe, ft, isw, awrt, and the A-level "(1)", "[1]", ticks) come off the result entirely; in the why only
the ones that stand alone go, because "M1 for 360 − 220 − 90" without its code is a sentence about
nothing. An entity's own semicolon is parked while punctuation is tidied — the first version drew
`50&deg`.

**`answerBlock_` draws the result in `.qans-body` and one `<details class="qans-why">` under it**,
shut, its summary "Why", holding the working and the examiner's note together (two folds under one
answer is the same tax paid in taps). It is the app's only `<details>` again, and not where the old
one was: the argument in `answerBlock_` against a fold between the question and the mark scheme —
the tutor reads FROM this card — still holds, so the result is never folded, only the working.
Nothing opens it but a finger, not a right answer either: a fold that springs open is a long answer
with a delay. "Show the answer" for a student is unchanged and opens the result only.

**The data pass is `tools/answer-brief.py`**: 544 answers whose drawn result ran past 120 characters,
edited line by line (only the `answer` value on each line is replaced, in that line's own escaping,
and the row is parsed back and compared). 265 already led with their result and only the full stop
became the dash ("No. 40% of…" → "No — 40% of…"); 279 were given a short result in front, written by
reading the question and the answer, with the original kept word for word as the why — a "show that"
leads with what was shown, an "any two of" leads with the list compressed. `accept`, `choices` and
`choice_right` are untouched; the marker reads `accept` and nothing else. Runs twice safely.

**`js/check-answers.js`, in check-all**, runs the real `answerParts_` and `typeset_`: 15 cases of the
split; every library result at **120 characters** or fewer (after the pass: median 7, 95th
percentile 89 — before it the 90th was 154); a named `ACCEPTED` list with a reason each (one row: a
677-digit cube the sheet asked for); no fraction or power lost to the split; no code drawn in a
result. `check-flow` asks the card itself; `check/states.js` has the answer folded and opened, which
is how `ui.js` found the summary 34px wide at 320 on its first run (it has a 64px floor now).

**Not done, on purpose: the answer on its own page.** The figure page (`questionFigCard_`) is the
precedent, and the case for it is weaker now than when it was asked: the result is one line, so a
page for it would be a swipe to read a word. If the owner still wants it, the why — not the result —
is the half worth a page of its own.
