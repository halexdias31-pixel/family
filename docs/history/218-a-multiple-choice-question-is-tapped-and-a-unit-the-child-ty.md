## A multiple-choice question is tapped, and a unit the child types no longer marks them wrong

**Asked for as "if a question is multiple choice then they should just click on the choice, not have
to type the answer in."** Two new columns on a question row: `choices`, the options as a pipe list
(inline HTML kept, for equations), and `choice_right`, the 1-based positions the mark scheme credits
(a comma for "tick two"). `choiceBox_` in find.js draws them as `.quiz-opt` buttons in place of the
textarea. The pick is stored under the same `ansKey_` as positions, marked the moment enough are
chosen (positions against positions, so nothing is folded), shows the right one, and opens the mark
scheme when right. Where the scheme did not settle the answer, `choice_right` is empty: the pick is
kept and nothing is marked. **362 questions**, extracted by reading each row's html and its own
answer, never by working the subject out; `tools/set-choices.py` asserts each proposal and also
removes the run of html the options were printed in, so they are not shown twice.
`check-library.js` fails a credited position nobody can tap. Left as boxes on purpose: tick-per-row
grids, matching, multi-gap sentences, options that exist only as artwork, and "choose, then give a
reason", whose reason carries marks a button cannot hold.

**The SATs audit found the marker refusing careful answers**: "3.75 litres", "65p", "25%",
"144 cm²" and "(55, 30)" against an `accept` of the bare value. `markUnitOff_` takes a trailing unit
off what was typed, per comma part, and brackets that enclose the whole answer, and marks again, but
only against a way with no unit or the same unit, so "1000 cats" is still not "1,000 envelopes" and
"5 and 24" is never "5". Nine cases in `check-marking.js`. And `Q-STA-KS2-2024-P2-11` lost its
`accept`, which marked "3" correct where the answers are 5 and 24.
