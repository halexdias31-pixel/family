## Chemistry Paper 1 is a replica of the paper now, both tiers

**Reported from inside the exam**: *"im doing chemistry paper 1 now and there are already places
where there are no diagrams like question 1a and so on... i want it to be a replica of the actual
exam."* 01.1 is four boxes of atoms and the question is *which box is a pure compound* — a question
about a picture you cannot see is not a question, which is the fault this file records under *"on
the app it's just text"*.

| | |
|---|---|
| **8462/1F** | 15 figures onto 21 rows |
| **8462/1H** | 5 figures onto 6 rows, two of them the Foundation paper's own builders |
| | **every figure row on both tiers is drawn** — the library's backlog went 737 → 707 |

**MEASURED OFF THE PAPER, NOT WRITTEN FROM THE PROSE.** Every figure in these two PDFs is an
embedded raster PNG with no text layer and no vectors, so the four that CARRY DATA were read in
pixels — the rule this file already sets for a picture that decides an answer. Figure 1's atoms were
split out of the touching molecules by a distance transform (A 12, B 6, C 10, D 12); Figure 5's
three numbered burette ticks at y = 199, 327 and 455.5 px with the meniscus at 275.5 give
16 + 76.5/128 = **16.60, which is one of the paper's four options and no other**; Figure 6's corner
is 0.80 g, which is 03.4's answer; Figure 7's crosses were found as connected components.

**THE TIER OVERLAP IS PROVED RATHER THAN CLAIMED.** AQA prints the same picture on both tiers, so
`fig14` gained three label arguments and `check()` asserts BOTH shared builders still reproduce,
byte for byte, the diagrams already committed on the Foundation rows. **The first run of that
assertion failed** — the refactor had changed the aria-label and the height by five units, and
nothing on screen would have said so. Same move as the `libraryExtras_` cutover and `svgplot.py`:
prove it identical, then make it.

**AND THE ARROWS ON FIGURE 8 WERE BOTH WRONG.** Four reaction profiles differing in exactly two
things — where the products sit and which way the arrow points — which is the whole of 08.2. The
arrowhead was drawn with its base on the wrong side, so all four pointed at the level they started
from; and `down` was written as reactants-to-products rather than as a direction on the page, so C
and D came out identical. **Two profiles that are the same picture is a question with two right
answers.** `check()` refuses a set where two differ in nothing, and B is asserted to be the only one
that is both exothermic and labelled downwards. Thirteenth time this file writes that a screenshot
is the last word on a drawing.

### The prose that stood in for the pictures had to go with them, and five rows handed over the answer

**THIS IS THE HALF THAT MATTERS MORE THAN THE DRAWINGS.** Every one of these rows was transcribed
with the figure written out in words, because the figure was not there. 01.1 said *"D — four
molecules, every one of them white-black-white"*, which IS *which is the pure compound*; 02.5 said
the meniscus sits six small divisions below the 16 mark, which IS 16.6; 03.4 said the points level
off *"at 0.80 g"*; 08.2 printed all four profiles as a bullet list, and the answer is B *because*
the products are lower; 03.1 described model A as a shaded ball of positive charge with electrons
dotted about inside it, which is the plum pudding model said out loud.

**The rule was already here and is being applied in the other direction**: *what a figure shows is
not what its answer is*, written about the AQA Biology pie chart. A description accurate enough to
teach around is right while the picture is missing and a second source for one fact the moment it
arrives — the `.reel .over` fault, where one object was written twice and the two drifted. Each row
keeps AQA's own lead-in and its ask and loses the sentence that was standing in for the drawing.

**The Higher paper's cuts are by ANCHOR rather than by rewriting each string**, because 06.1 carries
a five-row table of voltages and retyping a table to delete a clause beside it is how a digit
changes.

**And three rows carried a `figure` they never needed.** 05.1 says the nuclide out loud and 05.2 and
05.3 ask about that same atom, so nothing is missing from any of them — a count of work that does
not exist, which is the mirror of a silence and the direction this repository had only ever recorded
the other way round.
