#!/usr/bin/env python3
"""Corbettmaths 5-a-day, Foundation Plus, January — UNFINISHED, AND IT REFUSES TO RUN.

  *** 1 to 22 January are transcribed: 110 questions, read off the rendered pages. 23 to 31 are
  *** NOT, and neither is the writer at the foot. `sys.exit` below stops it dead, because a script
  *** that writes two thirds of a month leaves the library holding a January that stops on the
  *** 22nd with nothing anywhere saying so — which is this repository's oldest fault wearing a
  *** date: "I did not manage to look", shipped as "I looked and there was nothing there".
  ***
  *** WHAT IS LEFT, precisely, so the next session starts rather than re-derives:
  ***   1. days 23-31, 45 questions, pages 22-30 of Jan-FP.pdf (page index = day - 1). The shared
  ***      stems for 23, 26, 30 and 31 are ALREADY in `PRE` below — read off the pages — so only
  ***      the `q(...)` rows are missing.
  ***   2. the 31 `kind: 'document'` rows, one per day. `BASE` holds every column they need.
  ***   3. the writer: read the file, assert no row_id clashes, insert, write back ONE LINE PER
  ***      ROW and rewrite only the lines that change. tools/set-spec-codes.py has that shape.
  ***   4. `check-library.js` has `5-a-day` in its `document_type` vocabulary and `Foundation Plus`
  ***      in `tier` already, so nothing there needs changing.
  ***
  *** DAY 24 QUESTION 1 IS THE ONE TO LOOK AT TWICE. The triangle carries four tick marks in two
  *** pairs — AB = BD slanted, AD = DC vertical — and NO printed angle anywhere on the page, so x
  *** is not determined by anything the figure states. Either the render is missing a label or the
  *** question wants an explanation rather than a number. It needs the PDF open beside somebody;
  *** inventing an angle to make it answerable is the fault this file already avoids nine times.

WHAT IT IS WHEN IT IS FINISHED: 31 document rows and 155 question rows.

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

# THE GUARD, AND IT IS THE POINT OF THIS COMMIT. Everything below is real, checked transcription of
# 1 to 22 January and is committed so it survives the container; none of it may reach the library
# until the month is whole and the writer exists. Delete these two lines in the same change that
# adds days 23-31 and the writer, and not before.
sys.exit('tools/insert-cbm-5ad-jan-FP.py is unfinished (1-22 Jan only, no writer). '
         'See the header for exactly what is left.')

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

def T(head, body):
    """A printed table recovered into real markup. CLAUDE.md's KS2 entry is the rule: a table
    reproduced as a <table> is NOT a missing picture, and filing it as one puts a question nobody
    has to fix into the library's backlog -- the mirror of a silence."""
    return ('<table><tr>' + ''.join('<th>%s</th>' % h for h in head) + '</tr>'
            + ''.join('<tr>' + ''.join('<td>%s</td>' % c for c in r) + '</tr>' for r in body)
            + '</table>')

# ---- the shared stems ----------------------------------------------------------------------------
# (day, question, figure, html, note).  Scoped by `question`, so both parts of that question draw it.
PRE = [
(5, '3', '', "<p>Tiernan takes part in an archery competition.</p><p>The probability of it being"
 " windy is 0.4<br>The probability of Tiernan hitting a target in windy weather is 0.7<br>The"
 " probability of Tiernan hitting a target when it is not windy is 0.9</p>", ''),
(10, '4', '', "<p>50g of lead and 20g of tin are mixed to make an alloy.</p><p>The density of lead"
 " is 11g/cm<sup>3</sup><br>The density of tin is 7g/cm<sup>3</sup></p>", ''),
(14, '2', 'scatter', "<p>The value of cars in a used car garage are shown in the scatter graph"
 " above.</p><p><b>Figure:</b> a scatter graph with age in years along the bottom (0 to 9) and"
 " value in £ up the side (0 to 10000). Ten cars are plotted: (1, 8000), (1.5, 9000), (2, 7000),"
 " (3, 7000), (4.5, 6000), (5, 5000), (7, 4000), (7, 2000), (8, 3000) and (9, 1000).</p>",
 'The ten points were measured off the rendered page in pixels against the printed gridlines, not'
 ' read by eye. The graph is a raster image inside the PDF with no text layer and no vectors.'),
(18, '2', 'angle-diagram', "<p><b>Figure:</b> two points A and B, with B below and to the right of"
 " A, joined by a straight line. A North arrow points straight up from A and another points"
 " straight up from B, so the two North lines are parallel. The angle x is marked at A, between"
 " the North line at A and the line AB. The angle at B, between the line BA and the North line at"
 " B, is 65°.</p>", ''),
(19, '1', 'tree-diagram', "<p>A biased coin is flipped twice.</p><p><b>Figure:</b> a tree diagram"
 " for the two flips. On the first flip the branch to Tail is 0.8 and the branch to Head is 0.2;"
 " on the second flip the branch to Tail is 0.8 and the branch to Head is 0.2, whichever way the"
 " first flip went.</p>", ''),
(23, '2', '', "<p>1.5 &nbsp; 2 &nbsp; 2.5 &nbsp; 3 &nbsp; 3.5 &nbsp; …</p>", ''),
(26, '4', 'diagram', "<p><b>Figure:</b> a grid of identical parallelograms, three rows by three"
 " columns, with its corners lettered. Along the bottom, left to right, are O, A, B and C; the row"
 " above is D, E, F, G; the row above that is H, I, J, K; and the top row is L, M, N, P.</p>"
 "<p>OA = <b>a</b> &nbsp; and &nbsp; OD = <b>b</b></p>", ''),
(30, '1', 'tree-diagram', "<p>In a small village, one bus arrives a day.<br>The probability of rain"
 " in the village is 0.3.<br>If it rains, the probability of a bus being late is 0.4.<br>If it does"
 " not rain, the probability of a bus being late is 0.15.</p><p><b>Figure:</b> a tree diagram with"
 " Rain (0.3) and No Rain on the first set of branches, and Late / On Time on the second — Late is"
 " 0.4 after Rain and 0.15 after No Rain.</p>", ''),
(31, '2', 'diagram', "<p>A rectangle is shown below.</p><p><b>Figure:</b> a rectangle whose top"
 " side is labelled 2x + 9, whose bottom side is labelled 4x + 1, and whose two vertical sides are"
 " each labelled x.</p>", ''),
]

# ---- the questions --------------------------------------------------------------------------------
# (day, pos, question, part, asks, answer_type, topics, figure, html, answer, accept, examiner_note)
# `pos` is the row's position down the page and is what the row_id counts; `question` is the
# Corbettmaths question number, which compresses where two rows are parts of one question.
Q = []
def q(day, pos, question, part, asks, atype, topics, figure, html, answer='', accept='', note=''):
    Q.append((day, pos, question, part, asks, atype, topics, figure, html, answer, accept, note))

NO_SCHEME = ('Corbettmaths publishes no mark scheme with the 5-a-day sheets, and this answer cannot'
             ' be derived exactly, so it is left for a person to mark.')

# ================================ 1 January ========================================================
q(1, 1, '1', '', 1, 'calculation', INEQ, '',
  "<p>Solve the inequality &nbsp;3x + 4 &le; 22</p>",
  "<b>x &le; 6</b> &mdash; take 4 from both sides to get 3x &le; 18, then divide by 3.",
  "x ≤ 6|x≤6|x <= 6|x<=6|6")
q(1, 2, '2', '', 1, 'calculation', PCTID, '',
  "<p>A car decreases in value 10% each year.</p><p>If it was bought for £5000, how much will it be"
  " worth after 2 years?</p>",
  "<b>£4050</b> &mdash; each year it keeps 90% of its value, so 5000 × 0.9 × 0.9 = 5000 × 0.81.",
  "4050")
q(1, 3, '3', '', 1, 'calculation', PYTH, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle. The vertical side is 6cm and the horizontal side"
  " along the bottom is 4cm, with the right angle between them; the missing side is the sloping one"
  " joining their far ends.</p><p>Calculate the length of the missing side</p>",
  "<b>7.21 cm (3 s.f.)</b> &mdash; the missing side is the hypotenuse, so it is "
  "&radic;(6<sup>2</sup> + 4<sup>2</sup>) = &radic;52 = 7.2111…",
  "7.2 to 7.22")
q(1, 4, '4', '', 1, 'calculation', MEAN, '',
  "<p>The table shows information about how long it takes students to get to school.</p>"
  + T(['Time (t minutes)', 'Frequency'],
      [['0 &lt; t &le; 10', '2'], ['10 &lt; t &le; 20', '8'], ['20 &lt; t &le; 30', '12'],
       ['30 &lt; t &le; 40', '7'], ['40 &lt; t &le; 50', '1']])
  + "<p>Work out an estimate for the mean</p>",
  "<b>24 minutes</b> &mdash; use the midpoint of each group: 5×2 + 15×8 + 25×12 + 35×7 + 45×1 = 720,"
  " and there are 30 students, so 720 ÷ 30 = 24.",
  "24")
q(1, 5, '5', '', 1, 'calculation', SIMUL, '',
  "<p>David buys 2 DVDs and 2 CDs in a shop and in total they cost £18.</p><p>Ellie buys 3 DVDs and"
  " 2 CDs in the same shop and they cost £22.</p><p>Find the cost of each DVD and each CD.</p>",
  "<b>A DVD is £4 and a CD is £5</b> &mdash; Ellie bought one more DVD than David and paid £4 more,"
  " so a DVD is £4; then 2(4) + 2c = 18 gives c = 5.",
  "4, 5")

# ================================ 2 January ========================================================
q(2, 1, '1', '', 1, 'calculation', CIRC, 'diagram',
  "<p><b>Figure:</b> a semi-circle standing on its straight edge, with that straight edge labelled"
  " 12cm.</p><p>Calculate the perimeter of this semi-circle.<br>Leave your answer in terms of"
  " &pi;</p>",
  "<b>(6&pi; + 12) cm</b> &mdash; the curved part is half of &pi;d = 12&pi;, which is 6&pi;, and the"
  " straight edge adds another 12.", '')
q(2, 2, '2', '', 1, 'calculation', ANGTQ, 'triangle',
  "<p><b>Figure:</b> a triangle, not drawn accurately, whose three angles are labelled 2x &minus;"
  " 20, x and x.</p><p>Find the value of x</p>",
  "<b>x = 50</b> &mdash; the angles in a triangle add to 180, so (2x &minus; 20) + x + x = 180,"
  " giving 4x = 200.",
  "50")
q(2, 3, '3', '', 1, 'calculation', PROB, '',
  "<p>The probability of a bus being late on any day is 0.2</p><p>James gets the bus on Monday and"
  " on Tuesday.</p><p>What is the probability that both buses are on time?</p>",
  "<b>0.64</b> &mdash; a bus is on time with probability 1 &minus; 0.2 = 0.8, and the two days are"
  " independent, so 0.8 × 0.8 = 0.64.",
  "0.64|16/25")
q(2, 4, '4', '', 1, 'proof', ANGPL, 'angle-diagram',
  "<p><b>Figure:</b> two parallel lines, CE above and FI below, each with an arrow on it. D sits on"
  " the upper line and G and H sit on the lower line. Lines are drawn from D to G and from D to H,"
  " making triangle DGH. The angle EDH, between DE and DH, is marked 50°, and the angle DGF, between"
  " GD and GF, is marked 100°.</p><p>CE and FI are parallel lines.<br>Angle EDH = 50°<br>Angle DGF ="
  " 100°</p><p>Show, giving reasons, that triangle DGH is isosceles.</p>",
  "<b>Angle DHG = 50° and angle DGH = 80°, so angle GDH = 50° too &mdash; two equal angles, so the"
  " triangle is isosceles.</b> Angle DHG = 50° because it is alternate to angle EDH between the"
  " parallel lines. Angle DGH = 180 &minus; 100 = 80° because DGF and DGH are angles on a straight"
  " line. That leaves angle GDH = 180 &minus; 50 &minus; 80 = 50°, which equals angle DHG, so the"
  " sides opposite them are equal.",
  '', 'A "show that" — the reasoning is the answer, so there is nothing a single box can mark.')
q(2, 5, '5', '', 2, 'short', SFORM, '',
  "<p>Write 50000 in standard form</p><p>Write 0.0043 in standard form</p>",
  "<b>5 × 10<sup>4</sup></b> and <b>4.3 × 10<sup>&minus;3</sup></b> &mdash; move the digits so that"
  " exactly one non-zero digit sits before the point, and count the places moved.",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')

# ================================ 3 January ========================================================
q(3, 1, '1', '', 1, 'calculation', CIRC, 'circle',
  "<p><b>Figure:</b> a circle with a dotted line drawn right across it through the centre, labelled"
  " 6cm &mdash; so 6cm is the diameter.</p><p>Calculate the circumference of this circle, leaving"
  " your answer in terms of &pi;</p>",
  "<b>6&pi; cm</b> &mdash; the circumference is &pi;d, and the dotted line across the centre is the"
  " diameter, so it is &pi; × 6.", '')
q(3, 2, '2', '', 2, 'calculation', EXPND + ', ' + FACT, '',
  "<p>Expand and simplify</p><p>(x + 4)(x + 6)</p><p>Factorise &nbsp;y<sup>2</sup> + y &minus;"
  " 20</p>",
  "<b>x<sup>2</sup> + 10x + 24</b> and <b>(y + 5)(y &minus; 4)</b> &mdash; for the first, 4 + 6 = 10"
  " and 4 × 6 = 24. For the second, look for two numbers multiplying to &minus;20 and adding to 1:"
  " 5 and &minus;4.",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')
q(3, 3, '3', '', 1, 'calculation', RATRI, 'triangle',
  "<p>Shown is a right angled triangle.</p><p><b>Figure:</b> the vertical side on the left is 4cm"
  " and the sloping side is 10cm. The angle x sits at the bottom right, between the sloping 10cm"
  " side and the horizontal base, so the 4cm side is opposite it.</p><p>Find angle x.</p>",
  "<b>23.6° (1 d.p.)</b> &mdash; the 4cm side is opposite x and the 10cm side is the hypotenuse, so"
  " sin x = 4 ÷ 10 = 0.4 and x = 23.578…°",
  "23.5 to 24")
q(3, 4, '4', '', 1, 'calculation', REVPC, '',
  "<p>Olivia has 36 DVDs.<br>This number of DVDs is 80% more than the number she had last"
  " month.</p><p>How many DVDs did Olivia have last month?</p>",
  "<b>20</b> &mdash; 36 is 180% of last month's number, so last month is 36 ÷ 1.8 = 20. Checking:"
  " 20 × 1.8 = 36.",
  "20")
q(3, 5, '5', '', 4, 'short', '', 'diagram',
  "<p>Match each of the following</p><p><b>Figure:</b> four expressions on the left &mdash; 4x + y,"
  " &nbsp;x + x + x &equiv; 3x, &nbsp;5x &minus; 2 = 28, &nbsp;V = lwh &mdash; and four words on"
  " the right: Expression, Equation, Formula, Identity. A line is drawn from the first expression"
  " to the first word as an example.</p>",
  "<b>4x + y is an expression; x + x + x &equiv; 3x is an identity; 5x &minus; 2 = 28 is an"
  " equation; V = lwh is a formula.</b> An expression has no equals sign; an identity is true for"
  " every value and uses &equiv;; an equation is true for particular values; a formula is a rule"
  " connecting quantities.",
  '', 'Four pairs to match in one row — one answer box cannot mark them, so no `accept`.')

# ================================ 4 January ========================================================
q(4, 1, '1', '', 1, 'calculation', ADDF, '',
  "<p>Work out, as a mixed number.</p>"
  "<p><span class=\"frac\"><span class=\"frac-n\">7</span><span class=\"frac-d\">11</span></span>"
  " + 1<span class=\"frac\"><span class=\"frac-n\">2</span><span class=\"frac-d\">3</span></span>"
  "</p>",
  "<b>2<sup>10</sup>&frasl;<sub>33</sub></b> &mdash; 1&#8532; is <sup>5</sup>&frasl;<sub>3</sub>, so"
  " the sum is <sup>21</sup>&frasl;<sub>33</sub> + <sup>55</sup>&frasl;<sub>33</sub> ="
  " <sup>76</sup>&frasl;<sub>33</sub>, which is 2 remainder 10.",
  "2 10/33|76/33")
q(4, 2, '2', '', 2, 'short', EXACT, '',
  "<p>Write down the exact value of &nbsp;Sin 0°</p><p>Write down the exact value of &nbsp;Sin"
  " 45°</p>",
  "<b>Sin 0° = 0</b> and <b>Sin 45° = <sup>&radic;2</sup>&frasl;<sub>2</sub></b> (the same number as"
  " 1 ÷ &radic;2).",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')
q(4, 3, '3', '', 1, 'calculation', ANGPY, 'shapes',
  "<p>Shown is a pentagon, with the size of each angle shown.</p><p><b>Figure:</b> a five-sided"
  " shape whose five interior angles are labelled x + 10, 2x + 10, x + 10, x + 20 and 2x.</p>"
  "<p>Find the size of the largest angle.</p>",
  "<b>150°</b> &mdash; the angles in a pentagon add to 540, so (x + 10) + (2x + 10) + (x + 10) +"
  " (x + 20) + 2x = 7x + 50 = 540, giving x = 70. The five angles are then 80, 150, 80, 90 and 140,"
  " and the largest is 2x + 10 = 150.",
  "150")
q(4, 4, '4', '', 1, 'calculation', NEGIN, '',
  "<p>Work out the value of &nbsp;4<sup>&minus;2</sup></p>",
  "<b><sup>1</sup>&frasl;<sub>16</sub></b> (0.0625) &mdash; a negative power means one over the"
  " positive power, so 4<sup>&minus;2</sup> = 1 ÷ 4<sup>2</sup> = 1 ÷ 16.",
  "1/16|0.0625")
q(4, 5, '5', '', 1, 'short', SLG, '',
  "<p>Write down the equation of a line parallel to &nbsp;y = 2x &minus; 3</p>",
  "<b>Any line of the form y = 2x + c, with c not equal to &minus;3</b> &mdash; for example"
  " y = 2x + 5. Parallel lines have the same gradient, and the gradient here is 2.",
  '', 'Open-ended — every line with gradient 2 except the one printed is right, so there is no single'
      ' value to mark against.')

# ================================ 5 January ========================================================
q(5, 1, '1', '', 1, 'calculation', BOUND, 'diagram',
  "<p><b>Figure:</b> a road sign reading &ldquo;Frome &nbsp; Population &nbsp; 26,000&rdquo;.</p>"
  "<p>This sign is correct to the nearest thousand.</p><p>What is the greatest possible number of"
  " people that live in Frome?</p>",
  "<b>26,499</b> &mdash; rounding to the nearest thousand, the population is at least 25,500 and"
  " less than 26,500. It is a number of PEOPLE, so it is a whole number, and the largest whole"
  " number below 26,500 is 26,499. (26,500 itself would round up to 27,000.)",
  "26499")
q(5, 2, '2', '', 1, 'calculation', ANGPY, 'shapes',
  "<p><b>Figure:</b> three identical regular pentagons joined so that they all meet at one point,"
  " with a gap left between two of them. The angle y is marked at that point, in the gap.</p>"
  "<p>Three identical regular pentagons are joined as shown.</p><p>Find y.</p>",
  "<b>36°</b> &mdash; each interior angle of a regular pentagon is 540 ÷ 5 = 108°. Three of them"
  " meet at the point and angles round a point add to 360, so y = 360 &minus; 3 × 108 = 36.",
  "36")
q(5, 3, '3', 'a', 1, 'drawing', TREE, '',
  "<p>Show this in a tree diagram.</p>",
  "<b>Two sets of branches.</b> The first pair is Windy 0.4 and Not windy 0.6. From Windy the pair"
  " is Hits 0.7 and Misses 0.3; from Not windy it is Hits 0.9 and Misses 0.1.",
  '', 'A drawing — there is nothing a single answer box can mark.')
q(5, 4, '3', 'b', 1, 'calculation', PROB, '',
  "<p>Find the probability of Tiernan hitting the target.</p>",
  "<b>0.82</b> &mdash; he can hit it either way round: 0.4 × 0.7 = 0.28 when it is windy, and"
  " 0.6 × 0.9 = 0.54 when it is not. Adding the two branches gives 0.82.",
  "0.82|41/50")
q(5, 5, '4', '', 1, 'calculation', VEC, 'diagram',
  "<p><b>Figure:</b> two column vectors, <b>a</b> with 6 above &minus;4, and <b>b</b> with &minus;2"
  " above 1.</p><p>Work out <b>a</b> &minus; <b>b</b></p>",
  "<b>The column vector 8 above &minus;5</b> &mdash; subtract top from top and bottom from bottom:"
  " 6 &minus; (&minus;2) = 8 and &minus;4 &minus; 1 = &minus;5.",
  "8, -5")

# ================================ 6 January ========================================================
# FOUR DRAWN ROWS. The locus takes the room of two and the standard-form row carries two independent
# asks, which are this day's fourth and fifth questions. See the header.
q(6, 1, '1', '', 1, 'calculation', EST, '',
  "<p>Estimate the value of</p><p><span class=\"frac\"><span class=\"frac-n\">803 × 2.97</span>"
  "<span class=\"frac-d\">0.613</span></span></p>",
  "<b>4000</b> &mdash; round each number to 1 significant figure: (800 × 3) ÷ 0.6 = 2400 ÷ 0.6.",
  "4000")
q(6, 2, '2', '', 1, 'drawing', CONST, 'answer-space',
  "<p><b>Figure:</b> two points, A on the left and B on the right, each marked with a small cross,"
  " with empty space around them to draw in.</p><p>Draw the locus of all points which are"
  " equidistant from points A and B.</p>",
  "<b>The perpendicular bisector of AB</b> &mdash; a straight line at right angles to AB through its"
  " midpoint, drawn with compasses: set them to more than half of AB, draw arcs from A and from B"
  " above and below the line, and join where the arcs cross.",
  '', 'A construction — there is nothing a single answer box can mark.')
q(6, 3, '3', '', 1, 'calculation', REARR, '',
  "<p>Make <i>t</i> the subject of the formula</p><p><i>v</i> = <i>u</i> + 10<i>t</i></p>",
  "<b>t = (v &minus; u) ÷ 10</b> &mdash; take u from both sides to get v &minus; u = 10t, then"
  " divide both sides by 10.",
  '', 'The answer is a rearranged formula rather than a value, so there is no number to mark against.')
q(6, 4, '4', '', 1, 'short', SFORM, '',
  "<p>Write 650000 in standard form</p>",
  "<b>6.5 × 10<sup>5</sup></b> &mdash; one non-zero digit before the point, and the digits move 5"
  " places.",
  "6.5 x 10^5|6.5*10^5|6.5e5|6.5 × 10^5")
q(6, 5, '5', '', 1, 'short', SFORM, '',
  "<p>Write 0.021 in standard form</p>",
  "<b>2.1 × 10<sup>&minus;2</sup></b> &mdash; the number is smaller than 1, so the power is"
  " negative; the digits move 2 places.",
  "2.1 x 10^-2|2.1*10^-2|2.1e-2|2.1 × 10^-2")

# ================================ 7 January ========================================================
q(7, 1, '1', '', 2, 'short', '', '',
  "<p>What is the reciprocal of 4?</p><p>What is the reciprocal of 0.5?</p>",
  "<b><sup>1</sup>&frasl;<sub>4</sub></b> (0.25) and <b>2</b> &mdash; the reciprocal of a number is"
  " 1 divided by it, so 1 ÷ 4 = 0.25 and 1 ÷ 0.5 = 2.",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')
q(7, 2, '2', '', 1, 'calculation', MULDF, '',
  "<p>Work out</p><p>1<span class=\"frac\"><span class=\"frac-n\">1</span><span class=\"frac-d\">2"
  "</span></span> × 3<span class=\"frac\"><span class=\"frac-n\">1</span><span class=\"frac-d\">3"
  "</span></span></p>",
  "<b>5</b> &mdash; turn both into top-heavy fractions first: <sup>3</sup>&frasl;<sub>2</sub> ×"
  " <sup>10</sup>&frasl;<sub>3</sub> = <sup>30</sup>&frasl;<sub>6</sub> = 5.",
  "5")
q(7, 3, '3', '', 1, 'calculation', CMEAS, '',
  "<p>Luka runs 2.25 kilometres in 5 minutes.</p><p>Calculate his average speed.<br>Give your answer"
  " in m/s</p>",
  "<b>7.5 m/s</b> &mdash; change the units first: 2.25 km is 2250 m and 5 minutes is 300 s, so the"
  " speed is 2250 ÷ 300.",
  "7.5")
q(7, 4, '4', '', 1, 'calculation', RATRI, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle ABC with the right angle at C. B is at the top, C"
  " directly below it and A to the right of C. The side BC is 12cm and the sloping side BA is"
  " 13cm.</p><p>Calculate the size of angle ABC.</p>",
  "<b>22.6° (1 d.p.)</b> &mdash; at B the 12cm side is adjacent and the 13cm side is the hypotenuse,"
  " so cos(ABC) = 12 ÷ 13 and the angle is 22.619…°",
  "22.6 to 22.7")
q(7, 5, '5', '', 1, 'short', CONGR, 'similar-triangles',
  "<p><b>Figure:</b> two triangles. In ABC the side AB is 15.5cm, CB is 9.1cm and AC is 9.9cm, with"
  " the marked angle at B. In LMN the side LN is 15.5cm, with the marked angle at N.</p>"
  "<p>ABC and LMN are congruent triangles.<br>Angle B = Angle N</p><p>Write down the length of"
  " LM.</p>",
  "<b>9.9 cm</b> &mdash; angle B matches angle N, and the 15.5cm side sits beside both of them"
  " (AB and LN), so the matching is A↔L, B↔N, C↔M. LM therefore matches AC, which is 9.9cm.",
  "9.9")

# ================================ 8 January ========================================================
q(8, 1, '1', '', 1, 'calculation', PROB, '',
  "<p>The probability of Oliver scoring a penalty is 0.7.<br>He takes 30 penalties.</p><p>How many"
  " goals should he score?</p>",
  "<b>21</b> &mdash; the expected number is the probability times the number of tries: 0.7 × 30.",
  "21")
q(8, 2, '2', '', 1, 'short', INEQ, '',
  "<p>&minus;5 &lt; 2x &le; 4</p><p>x is an integer</p><p>Write down all the possible values of"
  " x.</p>",
  "<b>&minus;2, &minus;1, 0, 1, 2</b> &mdash; dividing through by 2 gives &minus;2.5 &lt; x &le; 2,"
  " and the whole numbers in that range are those five. Note &minus;2.5 is not included but 2 is.",
  "-2, -1, 0, 1, 2")
q(8, 3, '3', '', 1, 'calculation', SIMSH, 'shapes',
  "<p><b>Figure:</b> two rectangles. ABCD is the smaller, with AB along the top measuring 7cm and"
  " AD down the side measuring 1.25cm. EFGH is the larger, with EH down the side measuring 5cm and"
  " EF along the top unmarked.</p><p>Rectangles <i>ABCD</i> and <i>EFGH</i> are similar.<br>AD ="
  " 1.25cm &nbsp; AB = 7cm &nbsp; EH = 5cm</p><p>Work out the length of EF.</p>",
  "<b>28 cm</b> &mdash; AD and EH match, so the scale factor is 5 ÷ 1.25 = 4. EF matches AB, so"
  " EF = 7 × 4.",
  "28")
q(8, 4, '4', '', 2, 'short', SLG, '',
  "<p>A line has equation &nbsp;y = 3x + 4</p><p>Write down the gradient of the line</p><p>Write"
  " down the coordinates of the y-intercept of the line</p>",
  "<b>Gradient 3</b> and <b>y-intercept (0, 4)</b> &mdash; in y = mx + c the gradient is m and the"
  " line crosses the y-axis at c.",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')
q(8, 5, '5', '', 2, 'calculation', FACT, '',
  "<p>Factorise &nbsp;x<sup>2</sup> + 4x &minus; 12</p><p>Factorise &nbsp;x<sup>2</sup> &minus;"
  " 25</p>",
  "<b>(x + 6)(x &minus; 2)</b> and <b>(x + 5)(x &minus; 5)</b> &mdash; for the first, 6 × (&minus;2)"
  " = &minus;12 and 6 + (&minus;2) = 4. The second is a difference of two squares.",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')

# ================================ 9 January ========================================================
q(9, 1, '1', '', 1, 'calculation', INEQ, '',
  "<p>Write down the smallest integer that satisfies &nbsp;6x &minus; 1 &gt; 31</p>",
  "<b>6</b> &mdash; 6x &gt; 32, so x &gt; 5.33…, and the smallest whole number above that is 6.",
  "6")
q(9, 2, '2', '', 2, 'drawing', PARTS, 'answer-space',
  "<p><b>Figure:</b> two plain circles with nothing marked on them, one above each"
  " instruction.</p><p>Draw a segment</p><p>Draw a tangent</p>",
  "<b>A segment</b> is the region cut off by a straight line (a chord) joining two points on the"
  " circle. <b>A tangent</b> is a straight line that touches the circle at exactly one point and"
  " does not cross it.",
  '', 'Two drawings in one row — there is nothing a single answer box can mark.')
q(9, 3, '3', '', 2, 'short', SFORM, '',
  "<p>Write &nbsp;2.5 × 10<sup>5</sup>&nbsp; as an ordinary number</p><p>Write &nbsp;3.8 ×"
  " 10<sup>&minus;3</sup>&nbsp; as an ordinary number</p>",
  "<b>250000</b> and <b>0.0038</b> &mdash; move the digits 5 places up for the first and 3 places"
  " down for the second.",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')
q(9, 4, '4', '', 1, 'calculation', RATRI, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle RST with the right angle at T. R is at the bottom left,"
  " T at the bottom right and S directly above T. The side ST is 14cm and the angle at R is"
  " 53°.</p><p>Find the length of the side RT.</p>",
  "<b>10.5 cm (3 s.f.)</b> &mdash; from R the 14cm side is opposite and RT is adjacent, so"
  " tan 53° = 14 ÷ RT, giving RT = 14 ÷ tan 53° = 10.549…",
  "10.5 to 10.6")
q(9, 5, '5', '', 1, 'calculation', NEGIN, '',
  "<p>Work out &nbsp;8<sup>&minus;2</sup></p>",
  "<b><sup>1</sup>&frasl;<sub>64</sub></b> (0.015625) &mdash; a negative power means one over the"
  " positive power, so it is 1 ÷ 8<sup>2</sup> = 1 ÷ 64.",
  "1/64|0.015625")

# ================================ 10 January =======================================================
q(10, 1, '1', '', 1, 'calculation', ADDF, '',
  "<p>Work out</p><p>4<span class=\"frac\"><span class=\"frac-n\">1</span><span class=\"frac-d\">2"
  "</span></span> + 2<span class=\"frac\"><span class=\"frac-n\">2</span><span class=\"frac-d\">3"
  "</span></span></p>",
  "<b>7<sup>1</sup>&frasl;<sub>6</sub></b> &mdash; as top-heavy fractions this is"
  " <sup>9</sup>&frasl;<sub>2</sub> + <sup>8</sup>&frasl;<sub>3</sub> ="
  " <sup>27</sup>&frasl;<sub>6</sub> + <sup>16</sup>&frasl;<sub>6</sub> ="
  " <sup>43</sup>&frasl;<sub>6</sub>, which is 7 remainder 1.",
  "7 1/6|43/6")
q(10, 2, '2', '', 1, 'calculation', QUAD, '',
  "<p>Solve &nbsp;x<sup>2</sup> + 5x + 6 = 0</p>",
  "<b>x = &minus;2 and x = &minus;3</b> &mdash; it factorises as (x + 2)(x + 3) = 0, so one bracket"
  " or the other must be nought.",
  "-2, -3")
q(10, 3, '3', '', 1, 'calculation', REVPC, '',
  "<p>A lamp is on sale at £22.05<br>This is a 10% reduction of the normal price.</p><p>What was the"
  " price of the lamp before the reduction?</p>",
  "<b>£24.50</b> &mdash; £22.05 is 90% of the old price, so the old price is 22.05 ÷ 0.9. Checking:"
  " 24.50 × 0.9 = 22.05.",
  "24.5|24.50")
q(10, 4, '4', 'a', 1, 'calculation', CMEAS, '',
  "<p>Work out the volume of lead used in the alloy.</p>",
  "<b>4.55 cm<sup>3</sup> (3 s.f.)</b> &mdash; volume = mass ÷ density = 50 ÷ 11 ="
  " <sup>50</sup>&frasl;<sub>11</sub> = 4.5454… cm<sup>3</sup>.",
  "4.54 to 4.55|50/11")
q(10, 5, '4', 'b', 2, 'calculation', CMEAS, '',
  "<p>Work out the volume of tin used in the alloy.</p><p>What is the density of the alloy?</p>",
  "<b>Tin: 2.86 cm<sup>3</sup> (3 s.f.)</b>, since 20 ÷ 7 = <sup>20</sup>&frasl;<sub>7</sub>."
  " <b>Alloy: 9.46 g/cm<sup>3</sup> (3 s.f.)</b> &mdash; the alloy weighs 70g and takes up"
  " <sup>50</sup>&frasl;<sub>11</sub> + <sup>20</sup>&frasl;<sub>7</sub> ="
  " <sup>570</sup>&frasl;<sub>77</sub> cm<sup>3</sup>, so its density is 70 ÷ that = 9.456…",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')

# ================================ 11 January =======================================================
q(11, 1, '1', '', 2, 'calculation', LINEQ, '',
  "<p>George is x years old<br>Jayden is 3 years older than George<br>The sum of their ages is"
  " 37</p><p>Write an equation based on this information</p><p>Solve the equation</p>",
  "<b>x + (x + 3) = 37, that is 2x + 3 = 37</b>, and solving it gives <b>x = 17</b> &mdash; so"
  " George is 17 and Jayden is 20.",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')
q(11, 2, '2', '', 1, 'calculation', SLG, 'graph',
  "<p><b>Figure:</b> a straight line L drawn on a grid. It crosses the y-axis at 1 and passes"
  " through the points (1, 3), (2, 5) and (3, 7).</p><p>Work out the gradient of line L</p>",
  "<b>2</b> &mdash; between (0, 1) and (3, 7) the line goes 6 up for 3 across, and 6 ÷ 3 = 2.",
  "2",
  'The line passes exactly through the lattice points (0,1), (1,3), (2,5) and (3,7), read off the'
  ' rendered grid in pixels rather than by eye — the graph is a raster image with no vectors.')
q(11, 3, '3', '', 1, 'calculation', CSHAP, 'shapes',
  "<p><b>Figure (not drawn to scale):</b> a shaded rectangle 20cm long and 11cm high with an"
  " unshaded circle cut out of the middle of it. A dotted line right across the circle is labelled"
  " 8cm, so 8cm is its diameter.</p><p>Calculate the shaded area</p>",
  "<b>169.7 cm<sup>2</sup> (1 d.p.)</b>, or exactly 220 &minus; 16&pi; &mdash; the rectangle is"
  " 20 × 11 = 220 cm<sup>2</sup> and the circle has radius 4, so its area is 16&pi; = 50.265…",
  "169.7|169.73")
q(11, 4, '4', '', 1, 'calculation', SIMUL, '',
  "<p>Solve the simultaneous equations</p><p>5x &minus; 2y = 4<br>3x &minus; 6y = 6</p>",
  "<b>x = 0.5 and y = &minus;0.75</b> &mdash; multiplying the first by 3 gives 15x &minus; 6y = 12;"
  " subtracting the second leaves 12x = 6, so x = 0.5, and then 5(0.5) &minus; 2y = 4 gives"
  " y = &minus;0.75.",
  "0.5, -0.75")
q(11, 5, '5', '', 1, 'explain', CONGR, 'similar-triangles',
  "<p><b>Figure:</b> two triangles A and B. In each, one side is 14cm, another is 10cm, and the"
  " angle between those two sides is 25°.</p><p>Triangles A and B are congruent.</p><p>State the"
  " reason why.</p>",
  "<b>SAS &mdash; side, angle, side.</b> Two sides of one triangle equal two sides of the other"
  " (14cm and 10cm), and the angle BETWEEN those two sides is the same 25° in both.",
  '', 'The answer is a written reason rather than a value.')

# ================================ 12 January =======================================================
q(12, 1, '1', '', 1, 'calculation', PROB, '',
  "<p>The table shows the students studying French and German.</p>"
  + T(['', 'French', 'German'], [['Male', '14', '6'], ['Female', '12', '8']])
  + "<p>A student is selected at random.</p><p>What is the probability of the student studying"
    " German?</p>",
  "<b><sup>7</sup>&frasl;<sub>20</sub></b> (0.35) &mdash; 6 + 8 = 14 students study German out of"
  " 14 + 6 + 12 + 8 = 40 altogether, and <sup>14</sup>&frasl;<sub>40</sub> cancels to"
  " <sup>7</sup>&frasl;<sub>20</sub>.",
  "7/20|0.35|14/40")
q(12, 2, '2', '', 1, 'calculation', CIRC, 'diagram',
  "<p><b>Figure:</b> a semi-circle standing on its straight edge, with that straight edge labelled"
  " 8cm.</p><p>Calculate the area</p>",
  "<b>25.1 cm<sup>2</sup> (1 d.p.)</b>, or exactly 8&pi; &mdash; the radius is 4, so the whole"
  " circle would be 16&pi; and half of it is 8&pi; = 25.132…",
  "25.1|25.13")
q(12, 3, '3', '', 1, 'calculation', PYTH, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle with a vertical side of 5cm, a horizontal base of 12cm"
  " and the right angle between them. The sloping side is labelled y.</p><p>Find y</p>",
  "<b>13 cm</b> &mdash; y is the hypotenuse, so y = &radic;(5<sup>2</sup> + 12<sup>2</sup>) ="
  " &radic;169 = 13.",
  "13")
q(12, 4, '4', '', 1, 'short', QUAD, 'table-blank',
  "<p>Complete this table for the graph</p><p>y = x<sup>2</sup> + 1</p><p><b>Figure:</b> a table"
  " with x taking the values &minus;2, &minus;1, 0, 1 and 2, and an empty row underneath for"
  " y.</p>",
  "<b>y = 5, 2, 1, 2 and 5</b> &mdash; square each x first, then add 1: (&minus;2)<sup>2</sup> + 1"
  " = 5, (&minus;1)<sup>2</sup> + 1 = 2, 0 + 1 = 1, 1 + 1 = 2, 4 + 1 = 5.",
  "5, 2, 1, 2, 5")
q(12, 5, '5', '', 1, 'calculation', VEC, 'diagram',
  "<p><b>Figure:</b> two column vectors, <b>a</b> with 2 above &minus;1, and <b>b</b> with 5 above"
  " 3.</p><p>Work out 2<b>a</b> + <b>b</b> as a column vector</p>",
  "<b>The column vector 9 above 1</b> &mdash; 2<b>a</b> is 4 above &minus;2, and adding <b>b</b>"
  " gives 4 + 5 = 9 and &minus;2 + 3 = 1.",
  "9, 1")

# ================================ 13 January =======================================================
q(13, 1, '1', '', 1, 'drawing', INEQ, 'answer-space',
  "<p><b>Figure:</b> a number line marked from &minus;5 to 5 in ones.</p><p>Draw x &lt; 2 on the"
  " number line.</p>",
  "<b>An open circle at 2 with the line shaded to the left of it.</b> The circle is open (not"
  " filled) because 2 itself is not included.",
  '', 'A drawing — there is nothing a single answer box can mark.')
q(13, 2, '2', '', 2, 'calculation', FACT, '',
  "<p>Factorise &nbsp;x<sup>2</sup> + 12x + 35</p><p>Factorise &nbsp;x<sup>2</sup> &minus; 10x +"
  " 25</p>",
  "<b>(x + 5)(x + 7)</b> and <b>(x &minus; 5)<sup>2</sup></b> &mdash; for the first, 5 × 7 = 35 and"
  " 5 + 7 = 12. For the second, &minus;5 × &minus;5 = 25 and &minus;5 + &minus;5 = &minus;10, so"
  " both brackets are the same.",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')
q(13, 3, '3', '', 1, 'calculation', CIRC, '',
  "<p>A bicycle wheel has diameter 80cm.<br>The bicycle travels 50m.</p><p>How many complete"
  " revolutions does the wheel make?</p>",
  "<b>19</b> &mdash; one turn covers &pi; × 80 = 251.3 cm, and 50m is 5000 cm, so 5000 ÷ 251.3 ="
  " 19.89 turns. Only COMPLETE turns count, so the answer is 19 rather than 20.",
  "19")
q(13, 4, '4', '', 1, 'calculation', VOLSA, 'shapes',
  "<p><b>Figure:</b> a cylinder with a dotted line across the top labelled 12cm (its diameter) and"
  " a dotted height of 14cm, beside a cube whose edge is labelled y cm.</p><p>A cube has side length"
  " y cm.<br>The cylinder and cube have the same volume.</p><p>Find y</p>",
  "<b>11.7 cm (3 s.f.)</b> &mdash; the cylinder's radius is 6, so its volume is &pi; ×"
  " 6<sup>2</sup> × 14 = 504&pi; = 1583.4 cm<sup>3</sup>. The cube has volume y<sup>3</sup>, so y"
  " is the cube root of 1583.4, which is 11.656…",
  "11.6 to 11.7")
q(13, 5, '5', '', 1, 'calculation', SIMUL, '',
  "<p>Solve the simultaneous equations</p><p>5x + 3y = 41<br>2x + 3y = 20</p><p>Do not use trial and"
  " improvement</p>",
  "<b>x = 7 and y = 2</b> &mdash; both equations have 3y, so subtracting the second from the first"
  " leaves 3x = 21. Then 2(7) + 3y = 20 gives 3y = 6.",
  "7, 2")

# ================================ 14 January =======================================================
q(14, 1, '1', '', 1, 'calculation', ADDF, '',
  "<p>Work out</p><p>4<span class=\"frac\"><span class=\"frac-n\">1</span><span class=\"frac-d\">4"
  "</span></span> &minus; 2<span class=\"frac\"><span class=\"frac-n\">5</span>"
  "<span class=\"frac-d\">7</span></span></p>",
  "<b>1<sup>15</sup>&frasl;<sub>28</sub></b> &mdash; as top-heavy fractions this is"
  " <sup>17</sup>&frasl;<sub>4</sub> &minus; <sup>19</sup>&frasl;<sub>7</sub> ="
  " <sup>119</sup>&frasl;<sub>28</sub> &minus; <sup>76</sup>&frasl;<sub>28</sub> ="
  " <sup>43</sup>&frasl;<sub>28</sub>, which is 1 remainder 15.",
  "1 15/28|43/28")
q(14, 2, '2', 'a', 1, 'calculation', SCAT, '',
  "<p>The next car that arrives is 6 years old.</p><p>Estimate the value of the car.</p>",
  '', '',
  'A reading off a line of best fit. The answer depends on exactly where the student draws that'
  ' line, so there is no single right value — this is left for a person to mark. ' + NO_SCHEME)
q(14, 3, '2', 'b', 1, 'calculation', SCAT, '',
  "<p>A car has a value of £2500.</p><p>Estimate the age of the car.</p>",
  '', '',
  'A reading off a line of best fit. The answer depends on exactly where the student draws that'
  ' line, so there is no single right value — this is left for a person to mark. ' + NO_SCHEME)
q(14, 4, '3', '', 1, 'calculation', QUAD, '',
  "<p>Solve</p><p>4x<sup>2</sup> = 100</p>",
  "<b>x = 5 and x = &minus;5</b> &mdash; dividing by 4 gives x<sup>2</sup> = 25, and a square root"
  " has two signs, so both 5 and &minus;5 work.",
  "5, -5")
q(14, 5, '4', '', 1, 'short', SLG, '',
  "<p>Write down the equation of the line that is parallel to y = 6x + 1 and passes through"
  " (0, 8).</p>",
  "<b>y = 6x + 8</b> &mdash; parallel means the same gradient, 6, and passing through (0, 8) means"
  " it crosses the y-axis at 8.",
  "y = 6x + 8|y=6x+8|y = 6x+8|6x + 8|6x+8")

# ================================ 15 January =======================================================
q(15, 1, '1', '', 1, 'calculation', EXPND, '',
  "<p>Simplify</p><p>5(x + 3) + 2x &minus; 4</p>",
  "<b>7x + 11</b> &mdash; expanding gives 5x + 15 + 2x &minus; 4, then collect: 5x + 2x = 7x and"
  " 15 &minus; 4 = 11.",
  "7x + 11|7x+11|11 + 7x|11+7x")
q(15, 2, '2', '', 1, 'calculation', MULDF, '',
  "<p>Work out</p><p>8<span class=\"frac\"><span class=\"frac-n\">1</span><span class=\"frac-d\">3"
  "</span></span> ÷ <span class=\"frac\"><span class=\"frac-n\">4</span><span class=\"frac-d\">7"
  "</span></span></p>",
  "<b>14<sup>7</sup>&frasl;<sub>12</sub></b> &mdash; 8&#8531; is <sup>25</sup>&frasl;<sub>3</sub>,"
  " and dividing by <sup>4</sup>&frasl;<sub>7</sub> means multiplying by"
  " <sup>7</sup>&frasl;<sub>4</sub>: <sup>175</sup>&frasl;<sub>12</sub>, which is 14 remainder 7.",
  "14 7/12|175/12")
q(15, 3, '3', '', 1, 'calculation', PYTH, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle with a vertical side of 4cm on the left and a sloping"
  " side of 10cm. The base, labelled y, is horizontal and the right angle is between the base and"
  " the 4cm side.</p><p>Calculate y</p>",
  "<b>9.17 cm (3 s.f.)</b> &mdash; the 10cm side is the hypotenuse, so y ="
  " &radic;(10<sup>2</sup> &minus; 4<sup>2</sup>) = &radic;84 = 9.1651…",
  "9.16 to 9.17")
q(15, 4, '4', '', 1, 'calculation', RATIO, '',
  "<p>There are white, green and blue beads in a bag.</p><p>The ratio of white beads to green beads"
  " is 2:5</p><p>The ratio of green beads to blue beads is 1:3</p><p>Work out the ratio of white"
  " beads to blue beads</p>",
  "<b>2 : 15</b> &mdash; make the green parts match. Green:blue is 1:3, which is the same as 5:15,"
  " so white:green:blue is 2:5:15 and white:blue is 2:15.",
  "2:15|2 : 15")
q(15, 5, '5', '', 1, 'calculation', SECT, 'sector',
  "<p><b>Figure:</b> a sector of a circle with centre O, bounded by two straight edges OA and OB and"
  " the arc AB. One straight edge is labelled 6cm and the angle at O is 40°.</p><p>Find the area of"
  " the sector.<br>Give your answer in terms of &pi;.</p>",
  "<b>4&pi; cm<sup>2</sup></b> &mdash; the sector is <sup>40</sup>&frasl;<sub>360</sub> ="
  " <sup>1</sup>&frasl;<sub>9</sub> of the whole circle, and the whole circle is &pi; ×"
  " 6<sup>2</sup> = 36&pi;, so the sector is 36&pi; ÷ 9.", '')

# ================================ 16 January =======================================================
q(16, 1, '1', '', 1, 'short', SQRT, '',
  "<p>Between which two consecutive integers does &nbsp;&radic;87&nbsp; lie?</p>",
  "<b>9 and 10</b> &mdash; 9<sup>2</sup> = 81 and 10<sup>2</sup> = 100, and 87 sits between them.",
  "9, 10|9 and 10")
q(16, 2, '2', '', 1, 'calculation', LINEQ, '',
  "<p>Solve &nbsp;5x + 1 = 3x + 19</p>",
  "<b>x = 9</b> &mdash; take 3x from both sides to get 2x + 1 = 19, then take 1 and halve.",
  "9")
q(16, 3, '3', '', 1, 'calculation', INTER, '',
  "<p>Cerys leaves £5000 in the bank for four years.<br>It earns compound interest of 2% each"
  " year.</p><p>Calculate the total amount Cerys has in the bank at the end of the four years.</p>",
  "<b>£5412.16</b> &mdash; each year the balance is multiplied by 1.02, so after four years it is"
  " 5000 × 1.02<sup>4</sup> = 5000 × 1.08243216 = 5412.1608, which is £5412.16 to the nearest penny.",
  "5412.16")
q(16, 4, '4', '', 1, 'drawing', VENN, 'answer-space',
  "<p>&xi; = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}<br>A = {square numbers}<br>B = {multiples of"
  " 3}</p><p>Draw a Venn diagram for this information.</p><p><b>Figure:</b> an empty Venn diagram"
  " &mdash; a rectangle labelled &xi; containing two overlapping circles labelled A and B.</p>",
  "<b>A alone holds 1 and 4; the overlap holds 9; B alone holds 3, 6 and 12; and 2, 5, 7, 8, 10 and"
  " 11 sit outside both circles.</b> The square numbers up to 12 are 1, 4 and 9; the multiples of 3"
  " are 3, 6, 9 and 12; and 9 is in both.",
  '', 'A drawing — there is nothing a single answer box can mark.')
q(16, 5, '5', '', 1, 'explain', CONGR, 'similar-triangles',
  "<p><b>Figure:</b> two triangles, C and D. Each has sides of 6.5cm, 14cm and 10cm.</p>"
  "<p>Triangles A and B are congruent.</p><p>State the reason why.</p>",
  "<b>SSS &mdash; side, side, side.</b> All three sides of one triangle are equal to all three sides"
  " of the other, which fixes the shape completely.",
  '', 'The answer is a written reason rather than a value.')

# ================================ 17 January =======================================================
q(17, 1, '1', '', 1, 'calculation', PERIM, 'shapes',
  "<p><b>Figure:</b> a rectangle whose longer side is labelled 2x + 7 and whose shorter side is"
  " labelled x + 3.</p><p>The perimeter of the rectangle is 53cm</p><p>Find x</p>",
  "<b>x = 5.5</b> &mdash; the perimeter is 2(2x + 7) + 2(x + 3) = 6x + 20, so 6x + 20 = 53 and"
  " 6x = 33.",
  "5.5|11/2")
q(17, 2, '2', '', 1, 'calculation', REARR, '',
  "<p>Make v the subject</p><p>t = <span class=\"frac\"><span class=\"frac-n\">v</span>"
  "<span class=\"frac-d\">4</span></span> + 1</p>",
  "<b>v = 4(t &minus; 1), that is v = 4t &minus; 4</b> &mdash; take 1 from both sides, then multiply"
  " both sides by 4.",
  '', 'The answer is a rearranged formula rather than a value, so there is no number to mark against.')
q(17, 3, '3', '', 1, 'calculation', PYTH, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle with the right angle at the top left. The vertical side"
  " down the left is 6cm, the horizontal side along the top is labelled y, and the sloping side"
  " joining their ends is 20cm.</p><p>Find y</p>",
  "<b>19.1 cm (3 s.f.)</b> &mdash; the 20cm side is the hypotenuse, so y ="
  " &radic;(20<sup>2</sup> &minus; 6<sup>2</sup>) = &radic;364 = 19.078…",
  "19 to 19.1")
q(17, 4, '4', '', 1, 'calculation', REVPC, '',
  "<p>Jacob buys a watch costing £84</p><p>This cost includes VAT at a rate of 20%.</p><p>How much"
  " is the watch without VAT?</p>",
  "<b>£70</b> &mdash; £84 is 120% of the price before VAT, so that price is 84 ÷ 1.2. Checking:"
  " 70 × 1.2 = 84.",
  "70")
q(17, 5, '5', '', 2, 'short', EXACT, '',
  "<p>Write down the exact value of &nbsp;Cos 60°</p><p>Write down the exact value of &nbsp;Tan"
  " 30°</p>",
  "<b>Cos 60° = <sup>1</sup>&frasl;<sub>2</sub></b> and <b>Tan 30° ="
  " <sup>&radic;3</sup>&frasl;<sub>3</sub></b> (the same number as 1 ÷ &radic;3).",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')

# ================================ 18 January =======================================================
q(18, 1, '1', '', 2, 'calculation', EXPND, '',
  "<p>If 2x + 4y = 18</p><p>What is the value of 4x + 8y?</p><p>What is the value of x + 2y?</p>",
  "<b>4x + 8y = 36</b> and <b>x + 2y = 9</b> &mdash; 4x + 8y is double 2x + 4y, so it is 2 × 18;"
  " and x + 2y is half of it, so it is 18 ÷ 2.",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')
q(18, 2, '2', 'a', 1, 'calculation', ANGPL, '',
  "<p>What is the size of angle x?</p>",
  "<b>115°</b> &mdash; the two North lines are parallel and AB crosses both, so x and the 65° are"
  " co-interior (allied) angles and add to 180.",
  "115")
q(18, 3, '2', 'b', 2, 'calculation', BEAR, '',
  "<p>What is the bearing of A from B?</p><p>What is the bearing of B from A?</p>",
  "<b>The bearing of A from B is 295°</b> and <b>the bearing of B from A is 115°</b> &mdash; a"
  " bearing is measured clockwise from North. From A that is the angle x = 115°; from B it is the"
  " back bearing, 115 + 180 = 295°.",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')
q(18, 4, '3', '', 1, 'calculation', VOLSA, 'shapes',
  "<p><b>Figure:</b> a cone standing on its circular base, with a dotted vertical height of 9cm from"
  " the base to the point and a dotted radius of 5cm across the base.</p><p>A cone has a base of"
  " radius 5cm.<br>The height of the cone is 9cm.</p><p>Work out the volume of the cone.</p>",
  "<b>235.6 cm<sup>3</sup> (1 d.p.)</b>, or exactly 75&pi; &mdash; the volume of a cone is"
  " <sup>1</sup>&frasl;<sub>3</sub>&pi;r<sup>2</sup>h = <sup>1</sup>&frasl;<sub>3</sub> × &pi; ×"
  " 25 × 9 = 75&pi; = 235.619…",
  "235.6|235.62")
q(18, 5, '4', '', 1, 'calculation', BOUND, '',
  "<p>The population of Northern Ireland is 1.8 million, to the nearest hundred thousand.</p>"
  "<p>What is the lowest possible number of people that live in Northern Ireland?</p>",
  "<b>1,750,000</b> &mdash; rounding to the nearest hundred thousand, the true figure is at least"
  " half a hundred thousand below 1,800,000, which is 1,800,000 &minus; 50,000.",
  "1750000")

# ================================ 19 January =======================================================
q(19, 1, '1', 'a', 1, 'calculation', PROB, '',
  "<p>Work out the probability of a tail and a tail.</p>",
  "<b>0.64</b> &mdash; the two flips are independent, so multiply along the branches: 0.8 × 0.8.",
  "0.64|16/25")
q(19, 2, '1', 'b', 1, 'calculation', PROB, '',
  "<p>Work out the probability of at least one tail.</p>",
  "<b>0.96</b> &mdash; the only way to get no tail at all is two heads, which is 0.2 × 0.2 = 0.04,"
  " so everything else is 1 &minus; 0.04.",
  "0.96|24/25")
q(19, 3, '2', '', 1, 'calculation', QUAD, '',
  "<p>Solve &nbsp;x<sup>2</sup> &minus; 2x &minus; 15 = 0</p>",
  "<b>x = 5 and x = &minus;3</b> &mdash; it factorises as (x &minus; 5)(x + 3) = 0, since"
  " &minus;5 × 3 = &minus;15 and &minus;5 + 3 = &minus;2.",
  "5, -3")
q(19, 4, '3', '', 1, 'calculation', EST, '',
  "<p>Estimate &nbsp;<span class=\"frac\"><span class=\"frac-n\">87.8 × 2.1</span>"
  "<span class=\"frac-d\">0.199</span></span></p>",
  "<b>900</b> &mdash; round each number to 1 significant figure: (90 × 2) ÷ 0.2 = 180 ÷ 0.2.",
  "900")
q(19, 5, '4', '', 1, 'short', BOUND, '',
  "<p>A number, n, has been truncated to two decimal places.<br>The result is 5.62</p><p>Write down"
  " the error interval for n.</p>",
  "<b>5.62 &le; n &lt; 5.63</b> &mdash; truncating chops the digits off rather than rounding, so"
  " anything from 5.62 up to (but not including) 5.63 truncates to 5.62. Note this is NOT"
  " 5.615 &le; n &lt; 5.625, which is what rounding would give.",
  '', 'The answer is an interval rather than a number. Comparing it as a string would tell a student'
      ' who wrote it with different spacing or with <= that they were wrong, so it is left for a'
      ' person to mark.')

# ================================ 20 January =======================================================
# FOUR DRAWN ROWS. The construction takes the room of two and the factorising row carries two
# independent asks, which are this day's fourth and fifth questions. See the header.
q(20, 1, '1', '', 1, 'drawing', CONST, 'answer-space',
  "<p><b>Figure:</b> two points, A on the left and B on the right, each marked with a small cross,"
  " with empty space around them to draw in.</p><p>Construct the perpendicular bisector of the line"
  " joining the points A and B.</p>",
  "<b>Set your compasses to more than half of AB, draw arcs from A and from B both above and below"
  " the line, and join the two crossing points.</b> That line cuts AB in half at right angles. The"
  " arcs must be left showing &mdash; they are the working.",
  '', 'A construction — there is nothing a single answer box can mark.')
q(20, 2, '2', '', 1, 'calculation', MULDF, '',
  "<p>Work out</p><p>1<span class=\"frac\"><span class=\"frac-n\">4</span><span class=\"frac-d\">5"
  "</span></span> ÷ 2<span class=\"frac\"><span class=\"frac-n\">3</span><span class=\"frac-d\">4"
  "</span></span></p>",
  "<b><sup>36</sup>&frasl;<sub>55</sub></b> &mdash; as top-heavy fractions this is"
  " <sup>9</sup>&frasl;<sub>5</sub> ÷ <sup>11</sup>&frasl;<sub>4</sub>, and dividing by a fraction"
  " means multiplying by its reciprocal: <sup>9</sup>&frasl;<sub>5</sub> ×"
  " <sup>4</sup>&frasl;<sub>11</sub> = <sup>36</sup>&frasl;<sub>55</sub>.",
  "36/55")
q(20, 3, '3', '', 1, 'calculation', CMEAS, '',
  "<p>A container exerts a force of 4000 Newtons on the floor.<br>The pressure on the floor is 500"
  " Newtons/m<sup>2</sup></p><p>Calculate the area of the container that is in contact with the"
  " floor.</p>",
  "<b>8 m<sup>2</sup></b> &mdash; pressure = force ÷ area, so area = force ÷ pressure ="
  " 4000 ÷ 500.",
  "8")
q(20, 4, '4', '', 1, 'calculation', FACT, '',
  "<p>Factorise &nbsp;x<sup>2</sup> + 8x + 16</p>",
  "<b>(x + 4)<sup>2</sup></b> &mdash; 4 × 4 = 16 and 4 + 4 = 8, so both brackets are the same.",
  "(x + 4)^2|(x+4)^2|(x + 4)(x + 4)|(x+4)(x+4)")
q(20, 5, '5', '', 1, 'calculation', FACT, '',
  "<p>Factorise &nbsp;x<sup>2</sup> &minus; 121</p>",
  "<b>(x + 11)(x &minus; 11)</b> &mdash; a difference of two squares, since 121 = 11<sup>2</sup>.",
  "(x + 11)(x - 11)|(x+11)(x-11)|(x - 11)(x + 11)|(x-11)(x+11)")

# ================================ 21 January =======================================================
q(21, 1, '1', '', 1, 'calculation', PCTID, '',
  "<p>Mark's wage was £120 a week<br>This increased to £144 a week</p><p>What was the percentage"
  " increase?</p>",
  "<b>20%</b> &mdash; the rise is £24, and 24 ÷ 120 = 0.2, which is 20% of the ORIGINAL wage.",
  "20")
q(21, 2, '2', '', 1, 'calculation', INEQ, '',
  "<p>Solve the inequality &nbsp;4x + 11 &lt; 2x + 27</p>",
  "<b>x &lt; 8</b> &mdash; take 2x from both sides to get 2x + 11 &lt; 27, then take 11 and halve.",
  "x < 8|x<8|8")
q(21, 3, '3', '', 1, 'calculation', INTER, '',
  "<p>£2000 is invested at 10% compound interest for two years.</p><p>How much money will there be"
  " after 2 years?</p>",
  "<b>£2420</b> &mdash; each year the balance is multiplied by 1.1, so it is 2000 ×"
  " 1.1<sup>2</sup> = 2000 × 1.21.",
  "2420")
q(21, 4, '4', '', 1, 'calculation', PROB, '',
  "<p>Sudha is taking part in a quiz on TV.<br>The probability she answers a question correctly is"
  " <sup>4</sup>&frasl;<sub>5</sub></p><p>Sudha is asked two questions</p><p>Calculate the"
  " probability she answers both questions correctly.</p>",
  "<b><sup>16</sup>&frasl;<sub>25</sub></b> (0.64) &mdash; the two questions are independent, so"
  " multiply: <sup>4</sup>&frasl;<sub>5</sub> × <sup>4</sup>&frasl;<sub>5</sub>.",
  "16/25|0.64")
q(21, 5, '5', '', 1, 'calculation', SIMUL, '',
  "<p>Solve the simultaneous equations</p><p>3x + 5y = 1<br>2x &minus; 3y = 7</p><p>Do not use trial"
  " and improvement</p>",
  "<b>x = 2 and y = &minus;1</b> &mdash; multiply the first by 3 and the second by 5 to get"
  " 9x + 15y = 3 and 10x &minus; 15y = 35; adding them gives 19x = 38, so x = 2, and then"
  " 3(2) + 5y = 1 gives y = &minus;1.",
  "2, -1")

# ================================ 22 January =======================================================
q(22, 1, '1', '', 1, 'calculation', REVMN, '',
  "<p>The mean of five numbers is 12.</p><p>Four of the numbers are 7, 2, 15 and 4</p><p>Work out"
  " the fifth number</p>",
  "<b>32</b> &mdash; if the mean of five numbers is 12 they add to 60, and the four given add to"
  " 28, so the fifth is 60 &minus; 28.",
  "32")
q(22, 2, '2', '', 2, 'short', SLG, '',
  "<p>A line has equation &nbsp;y = <span class=\"frac\"><span class=\"frac-n\">4</span>"
  "<span class=\"frac-d\">5</span></span>x + 3</p><p>Write down the gradient of the line</p>"
  "<p>Write down the coordinates of the y-intercept of the line</p>",
  "<b>Gradient <sup>4</sup>&frasl;<sub>5</sub></b> (0.8) and <b>y-intercept (0, 3)</b> &mdash; in"
  " y = mx + c the gradient is m and the line crosses the y-axis at c.",
  '', 'Two asks in one row — one answer box cannot mark both, so no `accept`.')
q(22, 3, '3', '', 1, 'calculation', PYTH, 'triangle',
  "<p><b>Figure (not drawn accurately):</b> a right-angled triangle PQR with the right angle at P."
  " P is at the top left, Q to its right and R below P. The side PQ is 50cm and the sloping side QR"
  " is 2m.</p><p>Work out the length of PR.</p>",
  "<b>1.94 m (3 s.f.), which is 194 cm</b> &mdash; change to one unit first: 50cm is 0.5m. QR is the"
  " hypotenuse, so PR = &radic;(2<sup>2</sup> &minus; 0.5<sup>2</sup>) = &radic;3.75 = 1.9365… m.",
  "1.93 to 1.94|193 to 194")
q(22, 4, '4', '', 1, 'calculation', CMEAS, '',
  "<p>Calculate the density of a piece of wood with a mass of 7g and a volume of"
  " 10cm<sup>3</sup></p>",
  "<b>0.7 g/cm<sup>3</sup></b> &mdash; density = mass ÷ volume = 7 ÷ 10.",
  "0.7|7/10")
q(22, 5, '5', '', 1, 'calculation', QUAD, '',
  "<p>Solve &nbsp;x<sup>2</sup> + 9x + 14 = 0</p>",
  "<b>x = &minus;2 and x = &minus;7</b> &mdash; it factorises as (x + 2)(x + 7) = 0, since"
  " 2 × 7 = 14 and 2 + 7 = 9.",
  "-2, -7")
