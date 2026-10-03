## The question card was polished, and marking it no longer moves anything

**Asked for as "can you refine the question widget stuff. like just make it nice more sleek, fresh
stable ect."** Polish, not a redesign: every decision in 204, 218, 227, 241 and 259 is kept (the
coding font for question text, every picture its own card, tapped multiple choice, tags as labels,
the two palettes, "not yet" rather than "wrong", the result shown and the working folded).

**Looked at first, in screenshots at 320, 390 and 768**, signed out, as a student and as a tutor: a
short typed question, a long multi-part one with a stem and a lead, a tapped question before and
after a right and a wrong tap, a typed answer marked right, wrong and empty, the answer revealed
with Why shut and open, a question with a figure and its figure card, fractions, needs and a sat
date. Element positions were measured before and after every press.

| Read as unfinished | Now |
|---|---|
| **Pressing Check grew the card by 21.8px at 320**: "Not yet — have another go" wrapped under the button | the verdict wraps inside its own slot beside Check, in a row that is 44px whatever it says. 0px |
| **A wrong tap grew the card by 13.7px**: the verdict line arrived from nowhere | its line is reserved under the options. 0px |
| **Picking an option pushed its text in a pixel** (`.quiz-opt.is-picked` thickens the border to 2px) | the second pixel is an inset shadow |
| The right option was **gold** and the pressed miss **red**, above a verdict that is green for right and **gold** for not-yet — gold meant both "the answer" and "missed", and red said what the wording was chosen not to | on the question card the options take the verdict's colours: right is `--good` with a tick, the miss `--warn`. The recap quiz keeps its own gold/red; it has no verdict to disagree with |
| Options were grey text in dark boxes, read as a list of facts | a ring that fills when chosen, a tick on the answer; ink, not dim. After marking, the rest go `--faint` and stop looking pressable (`is-done` on the box) |
| Verdict was colour only; the green was its own `#6ee7a8` | `--good` / `--warn` tokens, and a ✓ or ↻ drawn by CSS so a screen reader hears only the sentence |
| A verdict stayed beside an answer that had since been edited | typing clears it (words, colour, rule) and keeps the slot |
| The answer box's rule did not say what happened | it takes the verdict's colour (`:has`; a browser without it loses only this) |
| Gaps down the card were .25/.5/.5/.5rem; "YOUR ANSWER" ran on from the question | three steps: .4rem within a group, .75rem between groups, 1rem question to answer |
| Marks were a body-face caption in `--faint` | the reference's mono face, `--dim` |
| A two-line tag drew as a lozenge (`999px` radius) | 9px: a pill on one line, a rounded box on two |
| The opened Why read as a second answer under the first | it hangs from a 2px rule on the left |
| "The angle marked y" with no angle on the card read as broken | "Figure on the next page →", a faint label, asked of the same `questionHasFig_` as `pageParts_` |

**Checked.** `check/states.js` gains three states that take the measurements BEFORE the press as well
as after — *a typed answer, marked not yet, nothing moved*; *marked right, the question still*;
*a tapped answer, not yet, nothing moved* — on named rows (`Q0664`, the Corbettmaths ×10 question).
`check-flow` gains *marking, revealing and tapping leave the question where it is*: the header, tags
and question are the same nodes with the same markup through a wrong Check, typing, a right Check,
"Show the answer" and a tap; the verdict writes into a slot that was already there; typing clears a
stale verdict; a settled tapped question says `is-done`; the figure pointer appears only where there
is a figure. Proved by mutation, each restored to green: the old wrapping row and no reserved line
(ui.js red at 320 for the typed state and at every width for the tapped one); the input listener not
clearing; `is-done` removed; Check redrawing `.qsheet`; the figure pointer removed.

**Not done:** `5/8 = ?/24` can still break before the `=` at some widths — a typeset_ question
(keeping a fraction and the sign after it on one line), not a style one, and `check-typeset` would
have to own it.
