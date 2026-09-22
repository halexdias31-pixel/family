#!/usr/bin/env python3
"""Corbettmaths 5-a-day, Foundation Plus, January — 31 document rows and 155 question rows.

WHAT THIS IS, AND WHY IT IS NOT A WORKSHEET. The owner's own words: "its its own category, not to
be confused with the other corbet maths work which is like topic learning. this is 5 a day." A
Corbettmaths worksheet is thirty questions on ONE topic; a 5-a-day is five questions on five
DIFFERENT topics, sat in ten minutes, every day of a month. Same publisher, opposite shape — so
`document_type` is '5-a-day' and the funnel's Type question puts the two in different answers
instead of one pile. `tier` is 'Foundation Plus', which is Corbettmaths' own level printed on every
page and is not an exam tier; check-library.js's VOCAB already carries both words.

ONE DOCUMENT ROW PER DAY, because a day is the thing somebody sits. 31 days, 5 rows each.

WHERE EVERY QUESTION CAME FROM. `Jan-FP.pdf`, Drive 1C2JV58xRslmDoYUe6qtP-CuO48aSJ3FD, 32 pages —
31 dated pages and a trailing page holding only the copyright line. EVERY ONE OF THE 31 WAS
RENDERED AT SCALE 3 AND READ, not extracted. That is not diligence, it is the only method that
works on this publisher: CLAUDE.md already records two whole Corbettmaths worksheets that arrived
holding the single character `+`, because fractions and surds are set as stacked ARTWORK with no
text layer. Measured on this file, the same three ways:

  * ORDER. `get_text()` does not return reading order on these pages.
  * FLATTENED MATHS. Every real expression is set in STIXGeneral and PyMuPDF runs a superscript
    into its base. Day 4's `Work out the value of "4-2` is 4 to the power MINUS TWO and reads
    perfectly as "4 minus 2" = 2. Day 4's `7 / 11 + 1 2 / 3` is 7/11 + 1⅔ and extracts as five
    loose digits.
  * NUMBERS INSIDE PICTURES. 56 content images across the month, and the numbers a question turns
    on are in them: the pentagon's five angle labels, the grouped frequency table, the road sign
    reading "Frome Population 26,000", two column vectors, a two-way table, a scatter graph.

HOW A DAY IS CUT INTO FIVE. The five questions are the five ROWS of the page's table, top to
bottom — they carry no printed numbers, so position IS the numbering. Three things complicate it
and all three were measured off the DRAWN RULES per page rather than assumed, because the usual
grid (82/220/357/494.5/632/769) is wrong on several pages and day 24 is shifted wholesale:

  * A HALF-WIDTH RULE splits one column and not the other (days 5, 14, 19, 30). Those days really
    do have five rows; the naive detector sees four because it only looks for rules wider than
    300pt.
  * A SHARED STEM. Where one cell spans two rows, the two questions beside it hang off one piece
    of prose — the archery probabilities on day 5, the scatter graph on day 14, the coin tree on
    day 19, the bus tree on day 30, the vector grid on day 26, the rectangle on day 31, the alloy
    on day 10, the bearings figure on day 18, the sequence on day 23. That stem is a
    `kind: 'preamble'` ROW, never text copied onto both questions, and it is scoped by `question`
    — so those two rows share a question NUMBER and differ by `part`, which is how the rest of
    this library already models a two-part question.
  * AND THREE DAYS HAVE ONLY FOUR DRAWN ROWS — 6, 20 and 23. On each, a drawing question takes the
    room of two rows (a locus, a perpendicular bisector, an angle bisector) and one printed row
    carries two independent asks. THE SCOUT'S RULE — "a merged band is two questions sharing a
    stem" — IS FALSE FOR DAYS 6 AND 20: there is one instruction in that tall cell, not two. The
    day's fifth question is the split of the two-ask row. This is the one place the reading is a
    judgement rather than a measurement, and it is written down rather than hidden: on the other
    28 days a row carrying two independent asks stays ONE row and gets NO `accept`, so the same
    shape is treated two ways. The conservative side is taken wherever there is doubt.

WHAT MAY BE ANSWERED. Corbettmaths publishes no mark scheme with these — checked, every occurrence
of "answer" in the file is "give your answer in terms of pi" or "in standard form", and there is no
answers page. So an answer is DERIVED only where the question has an exact inverse, and it is
round-tripped: `fractions.Fraction` throughout, never a float, and the assertions below put every
answer back through its own question. CLAUDE.md's reason for that rule is the 2017 Highers, where
four answers were subtly wrong precisely because they were derived rather than read.

WHAT IS DELIBERATELY LEFT BLANK, with an `examiner_note` saying why: a reading off a graph (the two
scatter estimates on day 14 depend on where the student draws their line of best fit), a
construction, a "show that", a matching exercise, an open-ended answer (day 4's "write down the
equation of a line parallel to y = 2x - 3" has infinitely many), and an error interval, whose
answer is an interval rather than a number and cannot be compared as a string without telling a
right answer it is wrong.

AND A ROW WITH MORE THAN ONE ASK GETS NO `accept`, asserted below. There is one answer box on the
screen; two answers in it means the marking would refuse a right answer, which is the failure
CLAUDE.md calls the worse of the two because there is nobody for the child to appeal to.

FIGURES. A one-word label so check-library.js counts the backlog, and what the figure SHOWS said in
the question's own words — never what its answer is. The line between a figure that counts and one
that is merely ANSWER SPACE is this: if the row's own words fully determine both the task and the
answer, the missing picture is somewhere to WRITE (an empty Venn, a blank number line, a table to
complete, two dots to bisect between) and it takes an ANSWER_SPACE label. If the picture carries
data the answer depends on, it counts — even where the numbers were recovered off the render and
put into the text, because a student still cannot see the shape.

NO `exam_board`, `year`, `month`, `exam_wave`, `exam_date`, `paper` OR `total_marks`. Corbettmaths
is not a board, a 5-a-day has no sitting, `paper`'s vocabulary is 1-6 and a day is 1-31, and
nothing on the sheet says what it is out of — inventing a total would arm the 80-mark rule against
a number nobody printed.
"""
import json, pathlib, sys
from fractions import Fraction as F

HERE = pathlib.Path(__file__).resolve().parent
TARGET = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else HERE.parent / 'data' / 'questions.json')
TOPICS = HERE.parent / 'data' / 'topics.json'

KEY = 'FP'
TIER = 'Foundation Plus'
FILE_ID = '1C2JV58xRslmDoYUe6qtP-CuO48aSJ3FD'
SRC = 'https://drive.google.com/file/d/%s/view' % FILE_ID

BASE = dict(subject='Maths', document_type='5-a-day', tier=TIER, company='Corbettmaths',
            key_stage='KS4', band_type='stage', band_value='GCSE', level='GCSE',
            active='True', source_url=SRC)

# ---- topics, in data/topics.json's own spellings -------------------------------------------------
# NO COMMA IN ANY OF THESE. `topics` is a comma-list read by asList_, so a comma inside a name is a
# second topic -- the fault CLAUDE.md records where AQA's "Bonding, Structure and the Properties of
# Matter" arrived as two topics and neither joined the tree. Asserted at the foot of this file, and
# every name is checked against data/topics.json rather than trusted.
INEQ  = 'Solving Inequalities'
PCTID = 'Percentage Increase & Decrease'
PYTH  = "Pythagoras' Theorem"
MEAN  = 'Mean'
SIMUL = 'Simultaneous Equations'
CIRC  = 'Area & Circumference of Circles'
ANGTQ = 'Angles in Triangles & Quadrilaterals'
PROB  = 'Probability'
ANGPL = 'Angles in Parallel Lines'
SFORM = 'Standard Form'
EXPND = 'Expanding Brackets'
FACT  = 'Factorising'
RATRI = 'Right-Angled Trigonometry'
REVPC = 'Reverse Percentages'
ADDF  = 'Adding & Subtracting Fractions'
EXACT = 'Exact Trig Values'
ANGPY = 'Angles in Polygons'
NEGIN = 'Fractional & Negative Indices'
SLG   = 'Straight Line Graphs'
ROUND = 'Rounding'
BOUND = 'Bounds & Error Intervals'
TREE  = 'Tree Diagrams'
VEC   = 'Vectors'
EST   = 'Estimation'
CONST = 'Constructions & Loci'
REARR = 'Rearranging Formulae'
MULDF = 'Multiplying & Dividing Fractions'
CMEAS = 'Compound Measures'
CONGR = 'Congruent Triangles'
SIMSH = 'Similar Shapes'
LINEQ = 'Linear Equations'
QUAD  = 'Solving Quadratics'
VENN  = 'Venn Diagrams & Set Notation'
INTER = 'Simple & Compound Interest'
RATIO = 'Writing & Simplifying Ratio'
RATPR = 'Ratio & Proportion'
SECT  = 'Arcs & Sectors'
VOLSA = 'Volume & Surface Area'
SCAT  = 'Scatter Graphs & Correlation'
NTH   = 'nth Term of a Linear Sequence'
SEQT  = 'Types of Sequence'
BEAR  = 'Bearings'
SQRT  = 'Squares & Square Roots'
PERIM = 'Perimeter'
AREA2 = 'Area of 2-D Shapes'
CSHAP = 'Compound Shapes'
PARTS = 'Parts of a Circle'
REVMN = 'Reverse Mean'
PCTAM = 'Percentage of an Amount'
MIXED = 'Mixed Numbers'
