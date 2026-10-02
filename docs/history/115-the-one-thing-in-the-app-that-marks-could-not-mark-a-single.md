## The one thing in the app that marks could not mark a single answer on it

**Measured while the owner was sitting the paper**: 102 questions across the two tiers, 102 with an
answer written out, and **`accept` empty on every one** — so `ansBox_` drew a box and no Check
button on all of them, and the only way to find out whether you were right was to open the mark
scheme, which is the one thing a student on their own will not do honestly. The rest of the library
is not like this: 1,398 rows already carry one. **37 do now.**

**THE RULE IS AS NARROW AS THE FAIRNESS ARGUMENT NEEDS**, because this is the one thing in the app
that tells a child they are wrong and there is nobody for them to appeal to. Two shapes qualify:

| | |
|---|---|
| **a tick box** | the paper prints the options, so the set of right answers is closed and printed |
| **one value** | a calculation whose answer is a single number. `markBare_` already drops the unit |

**Everything else is left alone and that is most of the paper.** Every `explain`, every level-marked
answer, every "any two of", every answer that is two facts in one box. A mark scheme that reads
working is not a string comparison and pretending otherwise is worse than no button. **The sentence
options and the equation options are left out too**: this app has a text box rather than radio
buttons, nobody types `2 Cl⁻ → Cl₂ + 2 e⁻`, and a right answer marked wrong is the failure that
makes a student stop trusting the marking.

**Every entry is proved both ways before it is written**, through the app's own `markAnswer_` rather
than a second opinion about what a right answer is — `check-quizzes.js`'s rule, which found three
real faults on its first run. **The writer refused six entries on its first runs and every refusal
was real**: `3.4 mg/cm³` is not `3.4 mg/cm3` to a string comparison; `72.41` is a right answer to a
question that asks for no significant figures; `Trials 2 and 3` is not `Trial 2 and Trial 3`; `Fe`
is iron; and two rows whose printed answer is itself a list of alternatives or carries its own
working needed saying what a student actually types rather than papering over it with a wider cell.

### `check-library.js` — a tick box has one right option, and the paper prints the others

**A rule living only in the thing that produced the data is a rule nothing enforces about the
data**, which is this file's sentence about `cost: 0` for the fourteenth time. A file can be
hand-edited, appended to by another script, or written by a version of the tool that has since
changed.

**A MULTIPLE-CHOICE QUESTION IS THE ONE PLACE THE WRONG ANSWERS ARE WRITTEN DOWN**, so it is the one
place a checker can prove an `accept` is not too GENEROUS — the rule beside it only asks whether a
cell can mark its own answer right. Exactly one printed option may mark right, and **it would have
fired on a real draft of this commit**: 03.8's four options differ in two halves — energy in or out,
endothermic or exothermic — and `endothermic`, the obvious short form to reach for, marks none of
them.

**Narrowed to what prints "tick one box", and that narrowing is the `check-rows.js` lesson.** The
general form — any row with an `accept` and a bulleted list — reports two rows across the library
and both are wrong: `Q-1MA1-1706-1F-7` bullets Fahima's shopping and `Q-AQA-8464B-2406-2H-053`
bullets the two things sewage affected. Nothing can tell a bullet list from an option list; **the
paper's own instruction can.** Proved by mutation in both directions — an accept that marks none and
one that marks two — and it prints the **133** tick-box questions elsewhere in the library that
still carry no `accept`, so what is left is a number rather than a silence.
