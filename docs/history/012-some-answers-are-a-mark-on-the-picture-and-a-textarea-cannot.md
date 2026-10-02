## Some answers are a mark on the picture, and a textarea cannot hold one

**Reported as "what about quesitions which have diagrams and you are meant to draw on them? the
answer box bit will need a rework right."** Right. `ansBox_` offers a box for words, and "draw a box
plot for this information" is worth three marks that no sentence can earn. Somebody working through
November 2017 Paper 1 could write *the median is at 165* and could not do what the question asked.

**So the diagram takes the pen.** `padWrap_` lays a transparent SVG over the question's own figure,
at the figure's own coordinates, and a finger draws on it — which is what a printed paper is: the
figure and the answer space are one object. The picture is drawn INSIDE the pad rather than in its
usual `<figure>`, because a diagram rendered twice on one card is the fault every widget had when
the roster's name sat above its own heading, and here the second copy is the one you cannot write on.

**Only where there is a real picture, and that restraint is the design.** 135 questions in the
library say `drawing` or `annotate` and 128 have no figure transcribed yet. Generating a blank grid
for those would be worse than leaving them — *"on the grid, enlarge triangle T by scale factor −2
with centre (−2, −2)"* over squared paper with no axes and no triangle T is a question you cannot
answer dressed as one you can, which is the fault this file already records twice. `check-library.js`
prints **7 of 135**, so it is a backlog rather than a silence, and the pen arrives on a question the
moment its picture does.

**The pen is off until you ask for it.** A surface that takes the finger has `touch-action: none`,
and one taller than the phone is a surface you cannot scroll past. One 44px tap turns it on and a
gold frame says so, because a mode you cannot see is a mode that surprises you.

**Marks are stored in the picture's own coordinates, never in pixels.** Every diagram here lays out
inside `viewBox="0 0 340 H"`, so a stroke recorded there is the same stroke on a 320px phone and a
1280px laptop; pixels would put yesterday's answer half an inch off the axis the moment you turned
the phone. `pad:<row_id>` sits beside `ans:<row_id>` and for the same reason — these cards are
rebuilt on every repaint and a rebuilt SVG is an emptied one. Measured: a line and a single tap
survive a full card rebuild and a full page reload.

### Two faults a screenshot caught and no check could

**The first version returned the pad INSTEAD of the preamble block, which threw the preamble's prose
away with it.** Q12(a) is "draw a box plot for this information" and the information is the table in
that prose — so the card offered an empty grid and no figures to put on it. A question made
unanswerable by the feature meant to make it answerable. Valid markup, card fits at 320px, nothing
throws, 26 checks green.

**And `figCredit_` was written for the Corbettmaths coins.** *"these are our coins and our answer"* —
true of six rows, printed under thirty others where the drawing is faithful and the answer is
Edexcel's. A credit that overclaims is not a smaller problem than one that underclaims: it tells a
student the figures in front of them were made up. `diagram_by` is two values now — `family` for a
picture REDRAWN from what the paper prints, `family-set` for one whose CONTENT we chose because the
original was lost — and `DIAGRAM_BY` carries both with a reason.

**This file has now written "a screenshot is the last word on a drawing" four times.**
