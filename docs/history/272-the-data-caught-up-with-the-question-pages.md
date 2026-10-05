## The data caught up with the question pages: answers that stand alone, figures where the paper prints them, a surface for every drawing

The owner, after a lesson on June 2024 Paper 1 Foundation: *"remove all whys. I just want it to
have answer"*, *"text, then diagram, then text then diagram then text … should break into 5
widgets"*, *"some questions require answers on diagram. So should have a diagram for them to draw
on"*. The front end for all three landed in 270; this is the data it needed, written by a workflow
of producer agents with an independent verifier behind each, and applied line by line
(`scratchpad/qfix/apply.js`: untouched rows stay byte-identical, every line re-parsed).

**Answers that stand alone — 332 heads and 124 whole answers.** With the why no longer drawn, a
head of "Yes", "Shown", "No effect" or "AO2" said the work had been done and not what it came to.
1,422 answers with a why were read; about a third were rewritten so the head is the result plus the
figures or reason that make it one ("Yes: the floor is 68 m² and 3 tins cover 75 m²"). The verifiers
corrected 38 and rejected none in the first batch. Eleven came out over check-answers' 120-character
limit and were cut by hand; one (`Q-AQA-8464B-2406-1H-014`, two enzymes with where each is made) is
ACCEPTED with a reason rather than lose "small intestine" to fit. One English row
(`Q-AQA-8700-2306-2-1`, four true statements) still says "AO1": the letters are in AQA's mark
scheme, not in the data.

**Figures where the paper prints them — `<!--fig-->` on 327 rows.** Every row with a figure got an
explicit position among its blocks, read the way a setter lays out a page (introduction before the
figure, the ask after, "below" and "above" taken at their word).

**A surface for every drawing question — 132 diagrams drawn, 66 surfaces named.** Of 234 drawing
and annotate questions with nothing to draw on, the verifiers kept a drawn SVG wherever the text
described the figure fully, `surface` grid/coord/blank/text where it was plain paper or the words
themselves, and listed the rest rather than invent them. Every new drawing passes `check/diagrams.js`
(271) with no label touching a line.

**A check that was wrong the day the data arrived.** `check/cards.js` called the 14 ringed-word
passages "a picture on the question card", because their note's class is `qpad-note` and the rule
matched any class starting `qpad`. It matches the pad itself now.
