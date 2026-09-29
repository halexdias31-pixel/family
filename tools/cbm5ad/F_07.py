"""Corbettmaths 5-a-day, Foundation, JULY — 31 days, read off the rendered pages.

Drive 1HHrCcD0CxbgG5D39g4tEw5pQeND-X_qa, 31 pages, one dated day per page (page index = day - 1).
Every page was RENDERED AND READ rather than extracted, for the reason tools/insert-cbm-5ad-jan-FP.py
gives: fractions, indices and the numbers inside pictures are artwork with no usable text layer.
The five questions are the five ROWS of each page's table, top to bottom.

The book prints NO answers, so every answer here is worked out from the transcribed question —
with fractions.Fraction and asserts where there is arithmetic to get wrong. An answer that cannot
be derived exactly (a drawing, a reading off a picture a student makes themselves) is left for a
person to mark with NO_SCHEME and no `accept`. A row with more than one ask gets no `accept`.
"""
import pathlib, sys
from fractions import Fraction as F
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from common import Month, T, NO_SCHEME
MONTH = Month(7, '1HHrCcD0CxbgG5D39g4tEw5pQeND-X_qa')
q, pre = MONTH.q, MONTH.pre

# ---- topics, in data/topics.json's own spellings (no comma inside a name) -------------------------
SEQT  = 'Term-to-Term Rules'
NTH   = 'nth Term of a Linear Sequence'
AREA2 = 'Area of 2-D Shapes'
BESTV = 'Best Value & Unitary Method'
CONV  = 'Fraction Decimal Percentage Conversion'
ORDER = 'Ordering Numbers & Decimals'
RATPR = 'Ratio & Proportion'
SHARE = 'Sharing in a Ratio'
RATIO = 'Writing & Simplifying Ratio'
PCTAM = 'Percentage of an Amount'
PCTID = 'Percentage Increase & Decrease'
FRAMT = 'Fractions of an Amount'
ADDF  = 'Adding & Subtracting Fractions'
MULDF = 'Multiplying & Dividing Fractions'
EQSF  = 'Equivalent & Simplifying Fractions'
MIXED = 'Mixed Numbers'
ROUND = 'Rounding'
SIGF  = 'Significant Figures'
EST   = 'Estimation'
BIDMAS= 'Order of Operations'
NEG   = 'Negative Numbers'
DEC   = 'Calculating with Decimals'
LMULT = 'Long Multiplication'
LDIV  = 'Long Division'
PRIME = 'Primes & Prime Factorisation'
HCF   = 'HCF & LCM'
FACM  = 'Factors & Multiples'
SQRT  = 'Squares & Square Roots'
CUBE  = 'Cubes & Cube Roots'
IND   = 'Laws of Indices'
INDX  = 'Indices'
SFORM = 'Standard Form'
SIMP  = 'Simplifying & Collecting Terms'
SIMUL = 'Simultaneous Equations'
EXPND = 'Expanding Brackets'
FACT  = 'Factorising'
SUBS  = 'Substitution'
LINEQ = 'Linear Equations'
BOTH  = 'Unknowns on Both Sides'
INEQ  = 'Solving Inequalities'
INEQN = 'Inequalities on a Number Line'
REARR = 'Rearranging Formulae'
FUNC  = 'Function Machines'
COORD = 'Coordinates'
SLG   = 'Straight Line Graphs'
QGR   = 'Quadratic Graphs'
RLG   = 'Real-Life Graphs'
ANGPL = 'Angles at a Point & on a Line'
ANGTQ = 'Angles in Triangles & Quadrilaterals'
ANGPA = 'Angles in Parallel Lines'
ANGPY = 'Angles in Polygons'
ANGTY = 'Types of Angle'
BEAR  = 'Bearings'
SHAPE = '2-D Shapes'
SHP3  = '3-D Shapes'
PERIM = 'Perimeter'
CSHAP = 'Compound Shapes'
CIRC  = 'Area & Circumference of Circles'
PARTS = 'Parts of a Circle'
VOLSA = 'Volume & Surface Area'
UNITS = 'Units & Measures'
CMEAS = 'Compound Measures'
SCALE = 'Scale Drawings & Maps'
PYTH  = "Pythagoras' Theorem"
TRIG  = 'Right-Angled Trigonometry'
REFL  = 'Reflections'
ROT   = 'Rotations'
TRANS = 'Translations'
ENL   = 'Enlargements'
PROB  = 'Basic Probability'
LIST  = 'Listing Outcomes & Sample Space'
RELF  = 'Relative Frequency & Expectation'
VENN  = 'Venn Diagrams & Set Notation'
MEAN  = 'Mean'
MEDN  = 'Median'
MODE  = 'Mode'
RANGE = 'Range'
AVG   = 'Averages & Range'
AVTAB = 'Averages from a Table'
REVMN = 'Reverse Mean'
BAR   = 'Bar Charts & Pictograms'
PIE   = 'Pie Charts'
STEM  = 'Stem & Leaf Diagrams'
SCAT  = 'Scatter Graphs & Correlation'
TIME  = 'Units & Measures'
PLACE = 'Place Value & Ordering'
INTER = 'Simple & Compound Interest'
DIRP  = 'Direct Proportion'
ROMAN = 'Roman Numerals'
SYMM  = 'Properties of Shapes'

# ================================ 1 July ==========================================================
assert [1, 4, 13, 40, 121] == [1, 1*3+1, 4*3+1, 13*3+1, 40*3+1]
q(1, 1, '1', '', 'short', SEQT, '',
  "<p>A sequence has the rule, multiply the previous number by three and then add one</p>"
  "<p>1 &nbsp; 4 &nbsp; 13 &nbsp; __ &nbsp; __</p><p>Fill in the missing numbers</p>",
  "<b>40 and 121</b> &mdash; 13 × 3 + 1 = 40, then 40 × 3 + 1 = 121.")
q(1, 2, '2', '', 'calculation', AREA2, 'diagram',
  "<p><b>Figure:</b> a parallelogram with base 6cm and a dotted perpendicular height of 5cm"
  " drawn from the top edge down to the base, with a right-angle mark.</p>"
  "<p>Find the area of the parallelogram</p>",
  "<b>30 cm²</b> &mdash; area of a parallelogram is base × perpendicular height = 6 × 5.",
  "30|30cm²|30 cm²|30cm2")
assert F(425, 6) > F(699, 10)          # pence per 100g: medium 70.83p, large 69.9p
q(1, 3, '3', '', 'explain', BESTV, '',
  "<p>A shop sells jars of honey in two different sizes.</p>"
  "<p>Medium: &nbsp;600g for £4.25</p><p>Large: 1kg for £6.99</p>"
  "<p>Which jar is better value for money?</p>",
  "<b>The large jar</b> &mdash; per 100g the medium costs 425 ÷ 6 = 70.8p and the large"
  " 699 ÷ 10 = 69.9p, so the large is cheaper per gram.")
q(1, 4, '4', '', 'calculation', RATPR, '',
  "<p>James is going on holiday in New York. James changes £800 into dollars ($).</p>"
  "<p>The exchange rate is £1 = $1.50</p><p>Work out how many dollars ($) James will receive.</p>",
  "<b>$1200</b> &mdash; 800 × 1.50 = 1200.", "1200|$1200|1,200")
assert sorted([F(88, 100), F(99, 1000), F(4, 5), F(9, 10), F(17, 20)]) == [F(99, 1000), F(4, 5), F(17, 20), F(88, 100), F(9, 10)]
q(1, 5, '5', '', 'short', CONV, '',
  "<p>Write these numbers in order of size. Start with the smallest number.</p>"
  "<p>88% &nbsp;&nbsp; 0.099 &nbsp;&nbsp; <sup>4</sup>&frasl;<sub>5</sub> &nbsp;&nbsp; 0.9"
  " &nbsp;&nbsp; <sup>17</sup>&frasl;<sub>20</sub></p>",
  "<b>0.099, <sup>4</sup>&frasl;<sub>5</sub>, <sup>17</sup>&frasl;<sub>20</sub>, 88%, 0.9</b>"
  " &mdash; as decimals they are 0.88, 0.099, 0.8, 0.9 and 0.85.")

# ================================ 2 July ==========================================================
q(2, 1, '1', '', 'short', SYMM, 'diagram',
  "<p><b>Figure:</b> a kite ABCD, with B at the top, A and C at the ends of the short upper edges"
  " and D at the bottom point.</p>"
  "<p>Does a kite have two lines of symmetry?</p><p>Do the diagonals cross at right angles?</p>",
  "<b>No, a kite has only one line of symmetry (BD); yes, the diagonals cross at right angles</b>"
  " &mdash; the only mirror line runs through the two unequal angles.")
q(2, 2, '2', '', 'short', SIMP, '',
  "<p>Simplify &nbsp; 8w + w + 3w &minus; 4w</p><p>Simplify &nbsp; 8a + 5c &minus; 3a &minus; 7c</p>",
  "<b>8w</b> and <b>5a &minus; 2c</b> &mdash; 8 + 1 + 3 &minus; 4 = 8; 8 &minus; 3 = 5 and"
  " 5 &minus; 7 = &minus;2.")
assert 140 * 5 // 7 == 100
q(2, 3, '3', '', 'calculation', SHARE, '',
  "<p>Oliver and Yasmin share 140 sweets in the ratio 2:5.</p>"
  "<p>How many sweets does Yasmin get?</p>",
  "<b>100</b> &mdash; 2 + 5 = 7 parts, 140 ÷ 7 = 20 per part, and Yasmin gets 5 × 20.", "100")
assert F(29 + 3, 4) == 8
q(2, 4, '4', '', 'calculation', LINEQ, '',
  "<p>Solve &nbsp; <sup>x + 3</sup>&frasl;<sub>4</sub> = 8</p>",
  "<b>x = 29</b> &mdash; multiply both sides by 4 to get x + 3 = 32, then take 3.", "29|x = 29|x=29")
q(2, 5, '5', '', 'short', SUBS, '',
  "<p>An airplane has economy and first class seating.<br>There are <i>s</i> seats in each row in"
  " economy.<br>There are <i>t</i> seats in each row in first class.<br>There are 9 rows in first"
  " class and 24 rows in economy.</p>"
  "<p>Write down an expression, in terms of <i>s</i> and <i>t</i>, for the number of seats on the"
  " airplane.</p>",
  "<b>24s + 9t</b> &mdash; 24 economy rows of s seats and 9 first-class rows of t seats.",
  "24s + 9t|24s+9t|9t + 24s|9t+24s")

# ================================ 3 July ==========================================================
q(3, 1, '1', '', 'calculation', LINEQ, '',
  "<p>Solve &nbsp; 5w = 30</p><p>Solve &nbsp; w &minus; 4 = 12</p>",
  "<b>w = 6</b> and <b>w = 16</b> &mdash; divide 30 by 5; add 4 to 12.")
# the twelve shapes, read off the page: (shape, letter)
SHAPES_3 = [('c', 'A'), ('s', 'B'), ('s', 'A'), ('s', 'B'), ('c', 'A'), ('c', 'A'),
            ('s', 'B'), ('c', 'A'), ('s', 'B'), ('c', 'A'), ('c', 'B'), ('c', 'B')]
assert [sum(1 for s in SHAPES_3 if s == (k, l)) for k in 'sc' for l in 'AB'] == [1, 4, 5, 2]
q(3, 2, '2', '', 'short', LIST, 'diagram',
  "<p><b>Figure:</b> twelve shapes, each with a letter in it. Top row, left to right: a circle"
  " with A, a square with B, a square with A, a square with B, a circle with A, a circle with A."
  " Bottom row: a square with B, a circle with A, a square with B, a circle with A, a circle with B,"
  " a circle with B.</p><p>Complete the two-way table</p>"
  + T(['', 'A', 'B'], [['Square', '', ''], ['Circle', '', '']]),
  "<b>Square: A 1, B 4. Circle: A 5, B 2</b> &mdash; count each shape by its letter; the four"
  " cells add to the 12 shapes.")
q(3, 3, '3', '', 'short', SYMM, 'diagram',
  "<p><b>Figure:</b> a red triangular roundabout road sign: a white triangle with a red border and,"
  " in the middle, three curved black arrows chasing each other round in a circle.</p>"
  "<p>Lines of symmetry ______</p><p>Rotational symmetry order ______</p>",
  "<b>0 lines of symmetry; rotational symmetry of order 3</b> &mdash; the three arrows all turn the"
  " same way, so a mirror would reverse them, but a third of a turn maps the sign onto itself.",
  '', 'Read from the sign as printed: the arrows all point the same way round, which rules out a'
  ' mirror line while a turn of 120° leaves the sign unchanged.')
q(3, 4, '4', '', 'calculation', RANGE, '',
  "<p>Work out the range of these numbers</p><p>&minus;8 &nbsp;&nbsp; 6 &nbsp;&nbsp; &minus;5"
  " &nbsp;&nbsp; 2.5</p>",
  "<b>14</b> &mdash; largest minus smallest: 6 &minus; (&minus;8) = 14.", "14")
q(3, 5, '5', '', 'calculation', FACT, '',
  "<p>Factorise &nbsp; a<sup>2</sup> + 3a</p>",
  "<b>a(a + 3)</b> &mdash; a is a factor of both terms.", "a(a + 3)|a(a+3)|(a + 3)a|(a+3)a")

# ================================ 4 July ==========================================================
q(4, 1, '1', '', 'calculation', ANGPL, 'angle-diagram',
  "<p><b>Figure:</b> two straight lines crossing in an X. The angle on the right, between the two"
  " lines, is 47°. The angle on the left, opposite it, is a, and the angle at the top is b.</p>"
  "<p>Work out the size of angles a and b</p>",
  "<b>a = 47°, b = 133°</b> &mdash; a is vertically opposite the 47°, and b sits on a straight line"
  " with it, so b = 180 &minus; 47.")
assert F(100, 25) == 4
q(4, 2, '2', '', 'calculation', CMEAS, '',
  "<p>A lorry travels 100 miles at an average speed of 25 mph.</p>"
  "<p>Work out how long the journey lasts.</p>",
  "<b>4 hours</b> &mdash; time = distance ÷ speed = 100 ÷ 25.", "4|4 hours|4 hrs|4h")
q(4, 3, '3', '', 'calculation', ANGTY, '',
  "<p>Olivia is measuring an obtuse angle in her maths exam.<br>She has written the answer 32°</p>"
  "<p>Her teacher has said she has looked at the outside number instead of the inside number on"
  " the protractor.</p><p>What angle should Olivia have put on her exam?</p>",
  "<b>148°</b> &mdash; the two scales on a protractor add to 180°, and the angle is obtuse, so"
  " 180 &minus; 32.", "148|148°")
assert 240 // 3 * 5 == 400 and 240 // 3 * 8 == 640
q(4, 4, '4', '', 'calculation', RATPR, '',
  "<p>Jam is made from sugar and strawberries in the ratio 3:5.</p><p>A jar contains 240g of"
  " sugar.</p><p>How many grams of strawberries are in the jar?</p>"
  "<p>How many grams of jam are in the jar?</p>",
  "<b>400g of strawberries; 640g of jam</b> &mdash; 3 parts = 240g so one part is 80g;"
  " strawberries are 5 × 80 and the jam is all 8 parts, 8 × 80.")
q(4, 5, '5', '', 'calculation', AREA2, 'diagram',
  "<p><b>Figure:</b> a trapezium with parallel sides 3cm (top) and 7cm (bottom), each marked with"
  " an arrow, and a dotted perpendicular height of 4cm between them.</p>"
  "<p>Calculate the area of the trapezium</p>",
  "<b>20 cm²</b> &mdash; ½(a + b)h = ½ × (3 + 7) × 4.", "20|20cm²|20 cm²|20cm2")

# ================================ 5 July ==========================================================
assert F(2, 5) + F(3, 11) == F(37, 55) and F(1, 3) * F(2, 5) == F(2, 15)
q(5, 1, '1', '', 'calculation', f"{ADDF},{MULDF}", '',
  "<p><sup>2</sup>&frasl;<sub>5</sub> + <sup>3</sup>&frasl;<sub>11</sub></p>"
  "<p><sup>1</sup>&frasl;<sub>3</sub> × <sup>2</sup>&frasl;<sub>5</sub></p>",
  "<b><sup>37</sup>&frasl;<sub>55</sub></b> and <b><sup>2</sup>&frasl;<sub>15</sub></b> &mdash;"
  " over 55: 22/55 + 15/55; multiply the tops and the bottoms: (1 × 2)/(3 × 5).")
q(5, 2, '2', '', 'calculation', ENL, 'grid',
  "<p><b>Figure:</b> a square grid with two rectangles on it. Rectangle D, near the bottom left, is"
  " 3 squares wide and 1½ squares tall. Rectangle E, above it, is 9 squares wide and 4½ squares"
  " tall.</p><p>Rectangle E is an enlargement of rectangle D.</p>"
  "<p>What is the scale factor of the enlargement?</p>",
  "<b>3</b> &mdash; 9 ÷ 3 = 3 across and 4½ ÷ 1½ = 3 up.", "3",
  'The two rectangles were measured off the rendered grid in pixels: D 3 by 1.5 squares, E 9 by'
  ' 4.5 — both sides give the same factor, which is the check.')
assert F(28, 10) ** 2 + 7 ** 3 == F(35084, 100)
q(5, 3, '3', '', 'calculation', INDX, '',
  "<p>Calculate &nbsp; 2.8<sup>2</sup> + 7<sup>3</sup></p>",
  "<b>350.84</b> &mdash; 2.8 × 2.8 = 7.84 and 7 × 7 × 7 = 343.", "350.84")
PIE_5 = [('Netball', 15), ('Hockey', 10), ('Rugby', 26), ('Football', 9)]
assert sum(f for _, f in PIE_5) == 60 and [f * 6 for _, f in PIE_5] == [90, 60, 156, 54]
pre(5, '4', '',
  "<p>The table gives information about students staying after school to play sport.</p>"
  + T(['Sport', 'Frequency'], [[s, str(f)] for s, f in PIE_5]))
q(5, 4, '4', 'a', 'calculation', PIE, '',
  "<p>Calculate the size of each angle for a pie chart.</p>",
  "<b>Netball 90°, Hockey 60°, Rugby 156°, Football 54°</b> &mdash; 60 students share 360°, so"
  " each student is 6°.")
q(5, 5, '4', 'b', 'drawing', PIE, 'answer-space',
  "<p>Draw an accurate pie chart.</p><p>(A circle is printed with one radius already drawn"
  " straight up from the centre.)</p>",
  "<b>A pie chart with sectors of 90°, 60°, 156° and 54°</b>, each labelled with its sport and"
  " measured from the printed radius.", '', NO_SCHEME)

# ================================ 6 July ==========================================================
assert (4 + 5) * 2 == 18
q(6, 1, '1', '', 'calculation', FUNC, '',
  "<p>Lukas thinks of a number.</p><p>He adds 5<br>Then he doubles the answer</p>"
  "<p>His final answer is 18</p><p>What was his original number?</p>",
  "<b>4</b> &mdash; work backwards: 18 ÷ 2 = 9, then 9 &minus; 5 = 4.", "4")
q(6, 2, '2', '', 'short', SEQT, '',
  "<p>Here is a sequence of numbers</p><p>3 &nbsp; 6 &nbsp; 12 &nbsp; 24 &nbsp; … &nbsp; …</p>"
  "<p>What is the rule for continuing the sequence?</p>",
  "<b>Multiply the previous number by 2</b> &mdash; 3 × 2 = 6, 6 × 2 = 12, 12 × 2 = 24.")
assert 2 * (9*3 + 9*2 + 3*2) == 102
q(6, 3, '3', '', 'calculation', VOLSA, 'diagram',
  "<p><b>Figure:</b> a cuboid 9cm long, 3cm high and 2cm deep.</p>"
  "<p>Calculate the surface area of the cuboid</p>",
  "<b>102 cm²</b> &mdash; three pairs of faces: 2 × (9×3 + 9×2 + 3×2) = 2 × 51.",
  "102|102cm²|102 cm²|102cm2")
assert sorted([F(34, 100), F(1, 3), F(32, 100), F(7, 20), F(3, 10)]) == [F(3, 10), F(32, 100), F(1, 3), F(34, 100), F(7, 20)]
q(6, 4, '4', '', 'short', CONV, '',
  "<p>Write these number in order of size. Start with the smallest number.</p>"
  "<p>0.34 &nbsp;&nbsp; <sup>1</sup>&frasl;<sub>3</sub> &nbsp;&nbsp; 32% &nbsp;&nbsp;"
  " <sup>7</sup>&frasl;<sub>20</sub> &nbsp;&nbsp; 0.3</p>",
  "<b>0.3, 32%, <sup>1</sup>&frasl;<sub>3</sub>, 0.34, <sup>7</sup>&frasl;<sub>20</sub></b>"
  " &mdash; as decimals: 0.34, 0.333…, 0.32, 0.35 and 0.3.")
assert 2 * ((3*7 + 2*14) + 7) == 112
q(6, 5, '5', '', 'calculation', PERIM, 'diagram',
  "<p>A design is made from some identical rectangles and identical squares.<br>Each rectangle is"
  " twice as long as each square.<br>The perimeter of each square is 28cm.</p>"
  "<p><b>Figure:</b> five shapes joined edge to edge in one row: square, rectangle, square,"
  " rectangle, square. The rectangles lie along the row, so the whole design is one row of the"
  " same height.</p><p>Calculate the perimeter of the design.</p>",
  "<b>112 cm</b> &mdash; a square is 7cm a side, so a rectangle is 14cm by 7cm; the design is"
  " 3×7 + 2×14 = 49cm long and 7cm tall, and 2 × (49 + 7) = 112.", "112|112cm|112 cm")

# ================================ 7 July ==========================================================
q(7, 1, '1', '', 'calculation', UNITS, '',
  "<p>Connor’s watch is two minutes fast.<br>Grace’s watch is nine minutes slow.</p>"
  "<p>What time is shown on Grace’s watch when Connor’s watch shows 20:03?</p>",
  "<b>19:52</b> &mdash; the real time is 2 minutes earlier than Connor's, 20:01, and Grace's is 9"
  " minutes behind that.", "19:52|7:52pm|7:52 pm|7.52pm")
assert (6 + 4) * 2 == 20
q(7, 2, '2', '', 'calculation', SEQT, '',
  "<p>Here is a rule for continuing a sequence.</p><p><b>Add 4 then Multiply by 2</b></p>"
  "<p>The second term of this sequence is 20.</p><p>What is the first term?</p>",
  "<b>6</b> &mdash; undo the rule: 20 ÷ 2 = 10, then 10 &minus; 4 = 6.", "6")
A_7 = [(2, 2), (4, 2), (4, 4), (2, 3)]
assert [(-x, y) for x, y in A_7] == [(-2, 2), (-4, 2), (-4, 4), (-2, 3)]
assert [(y, -x) for x, y in A_7] == [(2, -2), (2, -4), (4, -4), (3, -2)]
pre(7, '3', 'grid',
  "<p><b>Figure:</b> a coordinate grid with x and y each running from &minus;6 to 6 (y from"
  " &minus;5 to 5). Shape A is a quadrilateral with corners at (2, 2), (4, 2), (4, 4) and (2, 3).</p>")
q(7, 3, '3', 'a', 'drawing', REFL, 'grid',
  "<p>Reflect shape A in the y-axis. Label your answer B.</p>",
  "<b>B has corners (&minus;2, 2), (&minus;4, 2), (&minus;4, 4) and (&minus;2, 3)</b> &mdash;"
  " reflecting in the y-axis changes the sign of each x-coordinate.")
q(7, 4, '3', 'b', 'drawing', ROT, 'grid',
  "<p>Rotate shape A, 90 degrees clockwise about the origin. Label your answer C.</p>",
  "<b>C has corners (2, &minus;2), (2, &minus;4), (4, &minus;4) and (3, &minus;2)</b> &mdash; a"
  " quarter turn clockwise about O sends (x, y) to (y, &minus;x).")
assert 180 - 105 == 75
q(7, 5, '4', '', 'calculation', ANGPA, 'angle-diagram',
  "<p><b>Figure:</b> two parallel lines, BD above and EG below, each marked with an arrow. A"
  " transversal runs from A at the top right, through C on BD and F on EG, down to H at the bottom"
  " left. At C, the angle between CD and CF (below BD, to the right of the transversal) is 105°."
  " At F, the angle x is between FG and FC (above EG, to the right of the transversal).</p>"
  "<p>Find the size of angle x.</p>",
  "<b>75°</b> &mdash; x and the 105° are co-interior angles between the parallel lines, so they"
  " add to 180°.", "75|75°")

# ================================ 8 July ==========================================================
q(8, 1, '1', '', 'explain', CONV, '',
  "<p>Ibrahim says “18% is greater than 0.2”</p><p>Is Ibrahim correct?<br>Explain your answer.</p>",
  "<b>No</b> &mdash; 0.2 is 20%, and 18% is less than 20% (or 18% = 0.18, which is less than 0.2).")
pre(8, '2', '3d-shape',
  "<p>Shown is the view from the front of a shape.</p><p><b>Figure:</b> a solid made of cubes,"
  " drawn in 3-D with an arrow marking the front. In the middle is a block two cubes wide and"
  " two cubes tall. A single cube stands at the bottom on each side of it, and each of these side"
  " cubes is drawn one cube nearer the front than the middle block.</p>",
  'The depth arrangement is read from a small oblique drawing, and a plan or side view depends on'
  ' exactly which cubes are behind which, so both views are left for a person to mark.')
q(8, 2, '2', 'a', 'drawing', SHP3, 'grid-blank',
  "<p>Draw the side elevation.</p>",
  "<b>A side elevation drawn on the square grid</b>, one square per cube face: the view from the"
  " side, showing the two-cube height of the middle block and the single-cube height of the side"
  " cube in front of it.", '', NO_SCHEME)
q(8, 3, '2', 'b', 'drawing', SHP3, 'grid-blank',
  "<p>Draw the plan view.</p>",
  "<b>A plan view drawn on the square grid</b>, one square per cube seen from directly above.",
  '', NO_SCHEME)
PROD_8 = [a * b for a in range(1, 7) for b in range(1, 7)]
assert PROD_8.count(12) == 4 and sum(x >= 10 for x in PROD_8) == 19
pre(8, '3', '',
  "<p>Two fair six sided dice are rolled.</p><p>The numbers on the two dice are <b>multiplied</b>"
  " together to give a score.</p>")
q(8, 4, '3', 'a', 'short', LIST, 'table-blank',
  "<p>Complete the table</p>"
  + T(['×', '1', '2', '3', '4', '5', '6'], [[str(r)] + [''] * 6 for r in range(1, 7)])
  + "<p>(Dice 1 across the top, Dice 2 down the side.)</p>",
  "<b>Each cell is its row number times its column number</b> &mdash; e.g. row 3 reads 3, 6, 9,"
  " 12, 15, 18 and row 6 reads 6, 12, 18, 24, 30, 36.")
q(8, 5, '3', 'b', 'calculation', PROB, '',
  "<p>Find the probability of a score of 12</p><p>Find the probability of a score of 10 or more</p>",
  "<b><sup>4</sup>&frasl;<sub>36</sub> = <sup>1</sup>&frasl;<sub>9</sub></b> and"
  " <b><sup>19</sup>&frasl;<sub>36</sub></b> &mdash; 12 appears 4 times in the 36 cells (2×6, 3×4,"
  " 4×3, 6×2) and 19 of the 36 cells are 10 or more.")

# ================================ 9 July ==========================================================
assert 360 - 77 - 40 - 212 == 31
q(9, 1, '1', '', 'calculation', ANGTQ, 'angle-diagram',
  "<p><b>Figure:</b> an arrowhead (a concave quadrilateral). Its top angle is 77°, its bottom right"
  " angle is 40°, the reflex angle at the dent in the bottom edge is 212°, and the bottom left"
  " angle is x.</p><p>Find the size of angle x</p>",
  "<b>31°</b> &mdash; the four angles of a quadrilateral add to 360°: 360 &minus; 77 &minus; 40"
  " &minus; 212.", "31|31°")
assert F(5, 2) * 36 == 90
q(9, 2, '2', '', 'calculation', CMEAS, '',
  "<p>Reggie drives for 2 hours 30 minutes at an average speed of 36 mph.</p>"
  "<p>How far does Reggie drive?</p>",
  "<b>90 miles</b> &mdash; 2 hours 30 minutes is 2.5 hours, and 2.5 × 36 = 90.",
  "90|90 miles|90miles")
q(9, 3, '3', '', 'calculation', EXPND, '',
  "<p>Expand &nbsp; 5(x &minus; 2)</p>",
  "<b>5x &minus; 10</b> &mdash; multiply each term in the bracket by 5.", "5x - 10|5x-10")
assert (-2 - 3, -2 - 2) == (-5, -4)
q(9, 4, '4', '', 'short', TRANS, 'grid',
  "<p><b>Figure:</b> a coordinate grid from &minus;6 to 6 across and &minus;5 to 5 up. Rectangle B"
  " has corners (3, 2) and (6, 3); rectangle A has corners (&minus;2, &minus;2) and (1,"
  " &minus;1).</p><p>Write down the translation vector that would take B to A.</p>",
  "<b>(&minus;5 over &minus;4)</b>, written as a column vector &mdash; B's bottom-left corner"
  " (3, 2) moves to A's (&minus;2, &minus;2): 5 left and 4 down.")
assert 2 * (12 + 5 + 6) == 46 and 46 * F(799, 100) == F(36754, 100)
q(9, 5, '5', '', 'calculation', f"{PERIM},{DEC}", 'diagram',
  "<p><b>Figure:</b> an L-shaped chicken enclosure. The top side is 12m, the right side goes down"
  " 5m, then the edge goes 8m in to the left, then 6m down; the left side runs the full height.</p>"
  "<p>Tim wants to build a new fence around the chicken enclosure.<br>Each metre of fencing will"
  " cost £7.99</p><p>Work out the cost of the new fence.</p>",
  "<b>£367.54</b> &mdash; the left side is 5 + 6 = 11m and the bottom is 12 &minus; 8 = 4m, so the"
  " perimeter is 12 + 5 + 8 + 6 + 4 + 11 = 46m, and 46 × £7.99 = £367.54.",
  "367.54|£367.54")

# ================================ 10 July =========================================================
q(10, 1, '1', '', 'short', ROUND, '',
  "<p>“My number is 200 to the nearest 10, but is not 200. What could my number be?”</p>",
  "<b>Any number from 195 up to (but not including) 205, other than 200</b> &mdash; e.g. 195, 197,"
  " 201 or 204.")
TAB_10 = {x: -2 * x + 11 for x in range(6)}
assert TAB_10 == {0: 11, 1: 9, 2: 7, 3: 5, 4: 3, 5: 1}
pre(10, '2', 'grid-blank',
  "<p>(A grid is printed with x from 0 to 5 and y from 0 to 12.)</p>")
q(10, 2, '2', 'a', 'short', SLG, 'table-blank',
  "<p>Complete the table of values for y = &minus;2x + 11.</p>"
  + T(['x', '0', '1', '2', '3', '4', '5'], [['y', '', '', '7', '5', '', '1']]),
  "<b>x = 0 gives 11, x = 1 gives 9, x = 4 gives 3</b> &mdash; e.g. &minus;2(4) + 11 = 3.")
q(10, 3, '2', 'b', 'drawing', SLG, 'grid-blank',
  "<p>On the grid, draw the graph of y = &minus;2x + 11 for values of x from 0 to 5.</p>",
  "<b>A straight line from (0, 11) to (5, 1)</b>, through (1, 9), (2, 7), (3, 5) and (4, 3).")
assert (420 // 5 * 2, 420 // 5 * 3) == (168, 252)
q(10, 4, '3', '', 'calculation', SHARE, '',
  "<p>Share £420 in the ratio 2:3</p>",
  "<b>£168 and £252</b> &mdash; 5 parts, £420 ÷ 5 = £84 a part, so 2 × 84 and 3 × 84.")
assert 4 * 5 - (2 + 3 + 8) == 7
q(10, 5, '4', '', 'calculation', REVMN, '',
  "<p>The mean of four numbers is 5.</p><p>Three of the numbers are 2, 3 and 8.</p>"
  "<p>Work out the fourth number.</p>",
  "<b>7</b> &mdash; the four numbers total 4 × 5 = 20, and 2 + 3 + 8 = 13.", "7")

# ================================ 11 July =========================================================
q(11, 1, '1', '', 'calculation', ANGTQ, 'angle-diagram',
  "<p>Shown is a parallelogram</p><p><b>Figure:</b> a parallelogram leaning to the right, with"
  " arrows marking the two pairs of parallel sides. The acute angle at the top left is 38°; x is"
  " the angle at the bottom right, y the angle at the bottom left and z the angle at the top"
  " right.</p><p>Find x, y and z</p>",
  "<b>x = 38°, y = 142°, z = 142°</b> &mdash; opposite angles of a parallelogram are equal, and"
  " neighbouring angles add to 180°, so 180 &minus; 38 = 142.")
q(11, 2, '2', '', 'calculation', LINEQ, '',
  "<p>Solve &nbsp; 2w + 5 = 37</p>",
  "<b>w = 16</b> &mdash; take 5 to get 2w = 32, then halve.", "16|w = 16|w=16")
q(11, 3, '3', '', 'short', SCAT, 'scatter',
  "<p><b>Figure:</b> a scatter graph of the value of cars (£, 0 to 10000) against their age in years"
  " (0 to 9). The points run from about £9000 at 1–2 years down to about £1000 at 9 years.</p>"
  "<p>What type of correlation is shown?</p>",
  "<b>Negative correlation</b> &mdash; as the age goes up, the value goes down.",
  "negative|negative correlation|Negative|Negative correlation")
assert 2 * 3 * 3 == 18
q(11, 4, '4', '', 'calculation', PRIME, '',
  "<p>Write 18 as a product of primes</p>",
  "<b>2 × 3 × 3 = 2 × 3<sup>2</sup></b> &mdash; 18 = 2 × 9 and 9 = 3 × 3.",
  "2 × 3 × 3|2×3×3|2 x 3 x 3|2x3x3|2 × 3²|2×3²|2 × 3^2|2x3^2")
assert [330 // 15 * k for k in (6, 1, 8)] == [132, 22, 176]
q(11, 5, '5', '', 'calculation', SHARE, '',
  "<p>£330 is divided between John, Filip and Cleo in the ratio 6:1:8</p>"
  "<p>How much does each get?</p>",
  "<b>John £132, Filip £22, Cleo £176</b> &mdash; 15 parts, £330 ÷ 15 = £22 a part.")

# ================================ 12 July =========================================================
q(12, 1, '1', '', 'short', CONV, '',
  "<p>Write 61% as a decimal</p><p>Write 0.14 as a percentage</p>",
  "<b>0.61</b> and <b>14%</b> &mdash; divide by 100 to go from a percentage to a decimal, and"
  " multiply by 100 to go back.")
q(12, 2, '2', '', 'explain', SEQT, '',
  "<p>3 &nbsp; 9 &nbsp; 27 &nbsp; 81</p><p>What is the rule for carrying on the sequence?</p>"
  "<p>Explain why 8028 is not a term in this sequence.</p>",
  "<b>Multiply by 3</b>; 8028 is even, and every term is odd (an odd number times 3 is always"
  " odd), so it cannot appear. (The terms also jump from 6561 straight to 19683.)")
assert F(90, 5) * 3 == 54
q(12, 3, '3', '', 'calculation', DIRP, '',
  "<p>A taxi journey costs £3 for 5 miles.</p><p>How much is the cost for a 90 mile journey?</p>",
  "<b>£54</b> &mdash; 90 miles is 18 lots of 5 miles, and 18 × £3 = £54.", "54|£54")
q(12, 4, '4', '', 'calculation', REARR, '',
  "<p>Make <i>w</i> the subject of the formula</p><p><i>y</i> = 7<i>w</i> + <i>a</i></p>",
  "<b>w = (y &minus; a) ÷ 7</b> &mdash; subtract a from both sides, then divide by 7.",
  "w = (y - a)/7|w=(y-a)/7|(y - a)/7|(y-a)/7")
assert 9 // 3 * 8 == 24
q(12, 5, '5', '', 'calculation', RATPR, '',
  "<p>The ratio of green to blue counters in a bag is 3:5.</p><p>There are 9 green counters.</p>"
  "<p>How many counters are in the bag?</p>",
  "<b>24</b> &mdash; 3 parts are 9 counters, so a part is 3; the bag holds 8 parts, 8 × 3.", "24")

# ================================ 13 July =========================================================
q(13, 1, '1', '', 'calculation', PCTAM, '',
  "<p>50% of 60 = ____</p><p>25% of ____ = 10</p>",
  "<b>30</b> and <b>40</b> &mdash; 50% is a half; 25% is a quarter, so the number is 4 × 10.")
assert F(4, 5) * F(3, 7) == F(12, 35) and F(3, 5) / F(6, 7) == F(7, 10)
q(13, 2, '2', '', 'calculation', MULDF, '',
  "<p><sup>4</sup>&frasl;<sub>5</sub> × <sup>3</sup>&frasl;<sub>7</sub></p>"
  "<p><sup>3</sup>&frasl;<sub>5</sub> ÷ <sup>6</sup>&frasl;<sub>7</sub></p>",
  "<b><sup>12</sup>&frasl;<sub>35</sub></b> and <b><sup>7</sup>&frasl;<sub>10</sub></b> &mdash;"
  " multiply tops and bottoms; to divide, flip the second fraction: 3/5 × 7/6 = 21/30 = 7/10.")
assert 60 % 3 == 60 % 4 == 60 % 5 == 0 and all(n % 3 or n % 4 or n % 5 for n in range(1, 60))
q(13, 3, '3', '', 'calculation', HCF, '',
  "<p>A red light flashes every 3 seconds.<br>A yellow light flashes every 4 seconds.<br>A green"
  " light flashes every 5 seconds<br>They all flash at the same time.</p>"
  "<p>After how many seconds will they next all flash at the same time?</p>",
  "<b>60 seconds</b> &mdash; the lowest common multiple of 3, 4 and 5 is 3 × 4 × 5 = 60.",
  "60|60 seconds|60s")
A_13, B_13 = [(-4, -1), (-4, -4), (-2, -4)], [(1, -2), (1, -5), (3, -5)]
pre(13, '4', 'grid',
  "<p><b>Figure:</b> a coordinate grid from &minus;6 to 6 in both directions. Triangle A has"
  " corners (&minus;4, &minus;1), (&minus;4, &minus;4) and (&minus;2, &minus;4). Triangle B has"
  " corners (1, &minus;2), (1, &minus;5) and (3, &minus;5).</p>")
q(13, 4, '4', 'a', 'drawing', REFL, 'grid',
  "<p>Reflect triangle B using the x-axis as the mirror line. Label your answer C.</p>",
  "<b>C has corners (1, 2), (1, 5) and (3, 5)</b> &mdash; reflecting in the x-axis changes the"
  " sign of each y-coordinate.")
assert [(x, y + 4) for x, y in A_13] == [(-4, 3), (-4, 0), (-2, 0)]
q(13, 5, '4', 'b', 'drawing', TRANS, 'grid',
  "<p>Translate triangle A using the vector (0 over 4). Label your answer D.</p>",
  "<b>D has corners (&minus;4, 3), (&minus;4, 0) and (&minus;2, 0)</b> &mdash; every corner moves"
  " 0 across and 4 up.")

# ================================ 14 July =========================================================
q(14, 1, '1', '', 'calculation', FRAMT, '',
  "<p>There are 130 students in Year 11.</p><p>The number of pupils in Year 11 is one-sixth of the"
  " total number of pupils in the school.</p><p>Work out the total number of pupils in the"
  " school.</p>",
  "<b>780</b> &mdash; 130 is one sixth of the school, so the school is 6 × 130.", "780")
assert -6 * -7 == 42 and F(-45, 3) == -15
q(14, 2, '2', '', 'calculation', NEG, '',
  "<p>☐ × &minus;7 = 42</p><p>☐ ÷ 3 = &minus;15</p>",
  "<b>&minus;6</b> and <b>&minus;45</b> &mdash; 42 ÷ &minus;7 = &minus;6; &minus;15 × 3 ="
  " &minus;45.")
assert F(150, 4) * 10 == 375
q(14, 3, '3', '', 'calculation', DIRP, '',
  "<p>This recipe serves 4 people.</p>"
  + T(['Bolognese Sauce', ''], [['Minced Beef', '500 g'], ['Chopped Tomatoes', '750 g'],
                                ['Mushrooms', '40 g'], ['Chicken Stock', '150 ml']])
  + "<p>How much chicken stock would be needed to serve 10 people?</p>",
  "<b>375 ml</b> &mdash; 150 ÷ 4 = 37.5 ml a person, and 10 × 37.5 = 375.",
  "375|375ml|375 ml")
assert (F(2520, 100) - F(1230, 100)) / 2 == F(645, 100)
q(14, 4, '4', '', 'calculation', DEC, '',
  "<p>Hattie has £12.30<br>Max has £25.20</p><p>How much should Max give Hattie so that they will"
  " have the same amount of money?</p>",
  "<b>£6.45</b> &mdash; the difference is £25.20 &minus; £12.30 = £12.90, and Max gives half of"
  " it; both then have £18.75.", "6.45|£6.45")
q(14, 5, '5', '', 'calculation', REARR, '',
  "<p>Make a the subject &nbsp; 2a + f = p</p>",
  "<b>a = (p &minus; f) ÷ 2</b> &mdash; subtract f from both sides, then divide by 2.",
  "a = (p - f)/2|a=(p-f)/2|(p - f)/2|(p-f)/2")

# ================================ 15 July =========================================================
q(15, 1, '1', '', 'calculation', EST, '',
  "<p>Sofia buys 59 apples which cost 21p each.</p><p>Estimate the total cost.</p>",
  "<b>About £12</b> &mdash; round to 60 apples at 20p: 60 × 20 = 1200p. (The exact cost is"
  " £12.39.)", "12|£12|1200p|1200")
q(15, 2, '2', '', 'short', PARTS, 'diagram',
  "<p><b>Figure:</b> a circle with its centre marked by a cross and a thick line drawn from the"
  " centre straight out to the edge.</p><p>What part of the circle is shown?</p>",
  "<b>A radius</b> &mdash; a line from the centre to the circumference.", "radius|a radius|Radius")
q(15, 3, '3', '', 'calculation', IND, '',
  "<p>Simplify &nbsp; y<sup>7</sup> × y<sup>4</sup></p>"
  "<p>Simplify &nbsp; <sup>w<sup>4</sup></sup>&frasl;<sub>w<sup>6</sup></sub></p>",
  "<b>y<sup>11</sup></b> and <b>w<sup>&minus;2</sup></b> (= <sup>1</sup>&frasl;<sub>w<sup>2</sup></sub>)"
  " &mdash; add the powers to multiply, subtract them to divide: 4 &minus; 6 = &minus;2.")
assert [n * n + 3 for n in (1, 2, 3)] == [4, 7, 12] and [2 * n + 7 for n in range(1, 6)] == [9, 11, 13, 15, 17]
q(15, 4, '4', '', 'calculation', f"{SEQT},{NTH}", '',
  "<p>The nth term of a sequence is n² + 3</p><p>Write down the first three terms.</p>"
  "<p>Find the nth term of &nbsp; 9 &nbsp; 11 &nbsp; 13 &nbsp; 15 &nbsp; 17 &nbsp; …</p>",
  "<b>4, 7, 12</b> and <b>2n + 7</b> &mdash; put n = 1, 2, 3 into n² + 3; the second goes up in"
  " 2s, and 2 × 1 + 7 = 9.")
q(15, 5, '5', '', 'short', SLG, 'graph',
  "<p>What is the equation of this line?</p><p><b>Figure:</b> a grid with x and y from 0 to 6"
  " and a horizontal line drawn through y = 2.</p>"
  "<p>What is the equation of this line?</p><p><b>Figure:</b> the same grid with a vertical line"
  " drawn through x = 4.</p>",
  "<b>y = 2</b> and <b>x = 4</b> &mdash; every point on a horizontal line has the same y, and every"
  " point on a vertical line has the same x.")

# ================================ 16 July =========================================================
q(16, 1, '1', '', 'calculation', SFORM, '',
  "<p>Calculate &nbsp; 5 × 10<sup>2</sup></p><p>Calculate &nbsp; 1.5 × 10<sup>2</sup></p>",
  "<b>500</b> and <b>150</b> &mdash; 10<sup>2</sup> is 100, so multiply each by 100.")
q(16, 2, '2', '', 'calculation', NEG, '',
  "<p>Work out the product of &minus;4 and 7</p><p>Work out the product of &minus;4 and &minus;3</p>",
  "<b>&minus;28</b> and <b>12</b> &mdash; product means multiply; a negative times a positive is"
  " negative, and two negatives make a positive.")
pre(16, '3', 'grid-blank',
  "<p>(A grid is printed with x and y each from 0 to 6.)</p>")
q(16, 3, '3', 'a', 'drawing', SLG, 'grid-blank',
  "<p>Draw y = 4</p>",
  "<b>A horizontal line through (0, 4) and (6, 4)</b> &mdash; every point has y-coordinate 4.")
q(16, 4, '3', 'b', 'drawing', SLG, 'grid-blank',
  "<p>Draw y = 2x</p>",
  "<b>A straight line through (0, 0), (1, 2), (2, 4) and (3, 6)</b> &mdash; each y is double its x.")
q(16, 5, '4', '', 'short', f"{MEDN},{RANGE}", '',
  "<p>List 4 numbers with a median of 6 and a range of 4.</p>",
  "<b>For example 4, 6, 6, 8</b> &mdash; any four numbers whose middle two average 6 and whose"
  " largest is 4 more than the smallest (e.g. 5, 5, 7, 9 also works).")

# ================================ 17 July =========================================================
# Only FOUR rows are drawn on this page: the enlargement's grid takes the room of two. The day's
# fifth question is the split of the row that asks three things of one list of numbers — the mean
# is one ask with one answer; the range and the mode stay together, with no `accept`.
assert 10 * 65 - 400 == 250
q(17, 1, '1', '', 'calculation', DEC, '',
  "<p>A shopkeeper buys a box of 10 pens for £4.</p><p>He sells them for 65p each.</p>"
  "<p>What is his profit?</p>",
  "<b>£2.50</b> &mdash; he takes 10 × 65p = £6.50 and paid £4.", "2.50|£2.50|2.5|250p")
D_17 = [5, 8, 5, 12]
assert F(sum(D_17), 4) == F(15, 2) and max(D_17) - min(D_17) == 7
pre(17, '2', '', "<p>5 &nbsp; 8 &nbsp; 5 &nbsp; 12</p>")
q(17, 2, '2', 'a', 'calculation', MEAN, '',
  "<p>Calculate the mean</p>",
  "<b>7.5</b> &mdash; 5 + 8 + 5 + 12 = 30, and 30 ÷ 4 = 7.5.", "7.5|15/2")
q(17, 3, '2', 'b', 'calculation', f"{RANGE},{MODE}", '',
  "<p>Calculate the range</p><p>Calculate the mode</p>",
  "<b>Range 7, mode 5</b> &mdash; 12 &minus; 5 = 7, and 5 is the only value that appears twice.")
q(17, 4, '3', '', 'calculation', AREA2, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle with a vertical side of 6cm and a horizontal base of"
  " 4cm, the right angle between them.</p><p>Calculate the area of this triangle</p>",
  "<b>12 cm²</b> &mdash; ½ × base × height = ½ × 4 × 6.", "12|12cm²|12 cm²|12cm2")
q(17, 5, '4', '', 'drawing', ENL, 'grid',
  "<p><b>Figure:</b> a square grid with triangle A near the bottom left. A has a horizontal base 4"
  " squares long, and its top corner is 3 squares along the base from the left end and 2 squares"
  " up.</p><p>On the grid, draw an enlargement of triangle A using scale factor 2.</p>",
  "<b>A triangle with a base 8 squares long whose top corner is 6 squares along and 4 squares"
  " up</b> &mdash; every length doubles; no centre is given, so it may go anywhere on the grid.",
  '', 'Triangle A was read off the rendered grid, one square per 25px of the render.')

# ================================ 18 July =========================================================
assert F(12 * 8, 2) / 3 == 16
q(18, 1, '1', '', 'calculation', AREA2, 'diagram',
  "<p><b>Figure:</b> a right-angled triangle with a vertical side of 12cm and a base of 8cm, and"
  " beside it a rectangle 3cm tall whose length is marked but not given.</p>"
  "<p>The area of the triangle is equal to the area of the rectangle.</p>"
  "<p>Find the length of the rectangle</p>",
  "<b>16 cm</b> &mdash; the triangle is ½ × 8 × 12 = 48 cm², so the rectangle is 48 ÷ 3 long.",
  "16|16cm|16 cm")
MENU_18 = [('Soup', 'Fish'), ('Curry', 'Pizza', 'Burger'), ('Ice Cream', 'Danish')]
assert len([(a, b, c) for a in MENU_18[0] for b in MENU_18[1] for c in MENU_18[2]]) == 12
q(18, 2, '2', '', 'short', LIST, '',
  T(['Starter', 'Main', 'Dessert'], [['Soup', 'Curry', 'Ice Cream'], ['Fish', 'Pizza', 'Danish'],
                                     ['', 'Burger', '']])
  + "<p>Marco chooses one starter, one main and one dessert.</p>"
  "<p>List all the possible combinations.</p>",
  "<b>12 combinations</b> &mdash; Soup or Fish, with Curry, Pizza or Burger, with Ice Cream or"
  " Danish (2 × 3 × 2): e.g. Soup–Curry–Ice Cream, Soup–Curry–Danish, Soup–Pizza–Ice Cream, …,"
  " Fish–Burger–Danish.")
assert 4 * 5 + 3 == 23 and 5 * 3 - 2 * 9 == -3
q(18, 3, '3', '', 'calculation', SUBS, '',
  "<p>If x = 5, work out the value of 4x + 3</p><p>If x = 3 and y = 9, work out 5x &minus; 2y</p>",
  "<b>23</b> and <b>&minus;3</b> &mdash; 4 × 5 + 3 = 23; 5 × 3 &minus; 2 × 9 = 15 &minus; 18.")
assert 30 * 15 + F(1, 2) * (30 - 22) * (20 - 15) == 470
q(18, 4, '4', '', 'calculation', CSHAP, 'diagram',
  "<p><b>Figure:</b> a shape with a flat base 30m long and two vertical sides, 20m on the left and"
  " 15m on the right, with right angles at the bottom corners. Across the top, a horizontal edge"
  " 22m long runs in from the right side; the rest of the top is a sloping edge down from the top"
  " of the left side to the end of that 22m edge.</p><p>Find the area of this shape.</p>",
  "<b>470 m²</b> &mdash; a 30 × 15 rectangle (450) plus a triangle on top that is 30 &minus; 22 ="
  " 8 wide and 20 &minus; 15 = 5 tall (½ × 8 × 5 = 20).", "470|470m²|470 m²|470m2")
q(18, 5, '5', '', 'calculation', REARR, '',
  "<p>x = 2y + 3</p><p>Rearrange the formula to make y the subject</p>",
  "<b>y = (x &minus; 3) ÷ 2</b> &mdash; subtract 3 from both sides, then divide by 2.",
  "y = (x - 3)/2|y=(x-3)/2|(x - 3)/2|(x-3)/2")

# ================================ 19 July =========================================================
assert 2 * -8 == -16 and -1 * -2 == 2
q(19, 1, '1', '', 'calculation', NEG, '',
  "<p>2 × ☐ = &minus;16</p><p>&minus;1 × ☐ = 2</p>",
  "<b>&minus;8</b> and <b>&minus;2</b> &mdash; &minus;16 ÷ 2 = &minus;8; 2 ÷ &minus;1 = &minus;2.")
assert 1 - F(1, 3) - F(2, 5) == F(4, 15)
q(19, 2, '2', '', 'calculation', f"{ADDF},{FRAMT}", '',
  "<p>Gregory received £300.</p><p>He gave <sup>1</sup>&frasl;<sub>3</sub> of it to his favourite"
  " charity and spent <sup>2</sup>&frasl;<sub>5</sub> of it on a new violin.</p>"
  "<p>What fraction of his money is left?</p>",
  "<b><sup>4</sup>&frasl;<sub>15</sub></b> &mdash; 1/3 + 2/5 = 5/15 + 6/15 = 11/15, leaving 4/15"
  " (£100 + £120 spent, £80 of £300 left).", "4/15")
assert F(8, 9) - F(3, 5) == F(13, 45)
q(19, 3, '3', '', 'calculation', ADDF, '',
  "<p>Work out &nbsp; <sup>8</sup>&frasl;<sub>9</sub> &minus; <sup>3</sup>&frasl;<sub>5</sub></p>",
  "<b><sup>13</sup>&frasl;<sub>45</sub></b> &mdash; over 45: 40/45 &minus; 27/45.", "13/45")
assert 360 - 2 * 120 == 120
q(19, 4, '4', '', 'calculation', ANGPY, 'diagram',
  "<p><b>Figure:</b> three identical regular hexagons meeting at a single point, each touching"
  " the other two along an edge. The angle x is marked at that point, inside one of the"
  " hexagons.</p><p>Three identical regular hexagons are placed together.</p><p>Find x</p>",
  "<b>120°</b> &mdash; each interior angle of a regular hexagon is 720 ÷ 6 = 120° (and three of them"
  " fill the 360° round the point).", "120|120°")
assert 720 - (75 + 160 + 90 + 135 + 110) == 150
q(19, 5, '5', '', 'calculation', ANGPY, 'angle-diagram',
  "<p><b>Figure:</b> a hexagon with interior angles, going round, of 75°, 160°, a right angle,"
  " 135°, y and 110°.</p><p>Find the size of the angle labelled y</p>",
  "<b>150°</b> &mdash; the angles of a hexagon add to (6 &minus; 2) × 180 = 720°, and 720"
  " &minus; (75 + 160 + 90 + 135 + 110) = 150.", "150|150°")

# ================================ 20 July =========================================================
D_20 = [9, 1, 2, 8, 3, 8, 4, 1, 5, 6]
s20 = sorted(D_20); assert F(s20[4] + s20[5], 2) == F(9, 2)
q(20, 1, '1', '', 'calculation', MEDN, '',
  "<p>9 &nbsp; 1 &nbsp; 2 &nbsp; 8 &nbsp; 3 &nbsp; 8 &nbsp; 4 &nbsp; 1 &nbsp; 5 &nbsp; 6</p>"
  "<p>Calculate the median</p>",
  "<b>4.5</b> &mdash; in order: 1, 1, 2, 3, 4, 5, 6, 8, 8, 9; the middle two are 4 and 5.",
  "4.5|9/2")
assert 30000 * (1 - F(3, 5)) * F(135, 100) == 16200
q(20, 2, '2', '', 'calculation', f"{FRAMT},{PCTID}", '',
  "<p>The population of an island in 2000 was 30000</p><p>By 2010 the population has decreased"
  " by <sup>3</sup>&frasl;<sub>5</sub></p><p>The population increased by 35% between 2010 and"
  " 2020.</p><p>What was the population of the island in 2020?</p>",
  "<b>16200</b> &mdash; losing 3/5 leaves 2/5 of 30000 = 12000, and a 35% rise makes"
  " 12000 × 1.35 = 16200.", "16200|16,200")
assert F(30 - 2 * 6, 2) == 9
q(20, 3, '3', '', 'calculation', PERIM, 'diagram',
  "<p><b>Figure:</b> a parallelogram with two long sides and two short sides.</p>"
  "<p>The perimeter of this parallelogram is 30cm</p><p>The length of each short side is 6cm."
  " Calculate the length of each long side.</p>",
  "<b>9 cm</b> &mdash; the two short sides make 12cm, leaving 18cm for the two long sides.",
  "9|9cm|9 cm")
assert [11 * n - 2 for n in range(1, 6)] == [9, 20, 31, 42, 53] and 11 * 100 - 2 == 1098
q(20, 4, '4', '', 'calculation', NTH, '',
  "<p>Calculate the nth term for &nbsp; 9, 20, 31, 42, 53 …</p>"
  "<p>Using the nth term, work out the 100th term</p>",
  "<b>11n &minus; 2</b> and <b>1098</b> &mdash; it goes up in 11s and 11 × 1 &minus; 2 = 9; then"
  " 11 × 100 &minus; 2.")
PIE_20 = [('Yes', 3), ('No', 11), ('Undecided', 4)]
assert sum(f for _, f in PIE_20) == 18 and [f * 20 for _, f in PIE_20] == [60, 220, 80]
q(20, 5, '5', '', 'calculation', PIE, '',
  T(['Opinion', 'Frequency'], [[o, str(f)] for o, f in PIE_20])
  + "<p>Oscar is drawing a pie chart.</p><p>Work out the size of each angle.</p>",
  "<b>Yes 60°, No 220°, Undecided 80°</b> &mdash; 18 people share 360°, so each is 20°.")

# ================================ 21 July =========================================================
assert 400 * F(120, 100) == 480
q(21, 1, '1', '', 'calculation', PCTID, '',
  "<p>Francesca earns £400 a week</p><p>She is given a 20% pay rise.</p>"
  "<p>What is her new wage?</p>",
  "<b>£480</b> &mdash; 20% of £400 is £80, added on (or 400 × 1.2).", "480|£480")
assert 8 - F(128, 100) - F(65, 100) == F(607, 100)
q(21, 2, '2', '', 'calculation', DEC, '',
  "<p>Chloe has a ribbon 8 metres long.</p><p>She cuts two pieces from the ribbon.<br>The first"
  " piece was 1.28 metres long.<br>The second piece was 0.65 metres long.</p>"
  "<p>How much ribbon is left?</p>",
  "<b>6.07 m</b> &mdash; the pieces total 1.28 + 0.65 = 1.93m, and 8 &minus; 1.93 = 6.07.",
  "6.07|6.07m|6.07 m")
q(21, 3, '3', '', 'calculation', f"{PERIM},{SIMP}", 'diagram',
  "<p><b>Figure:</b> a pentagon whose sides are labelled, going round: 2x along the bottom, x up"
  " the right side, y and y along the two sloping top sides, and x up the left side.</p>"
  "<p>Find an expression for the perimeter of the pentagon.</p>",
  "<b>4x + 2y</b> &mdash; 2x + x + x + y + y.", "4x + 2y|4x+2y|2y + 4x|2y+4x")
q(21, 4, '4', '', 'short', BEAR, 'diagram',
  "<p><b>Figure:</b> two points A and B, each with a North line drawn straight up from it. B is"
  " to the right of A and a little higher up the page.</p><p>Measure the bearing of B from A.</p>",
  "<b>072°</b> (to within about 2°) &mdash; measure clockwise from A's North line round to the line"
  " from A to B.", "70 to 74",
  'Measured off the rendered page in pixels: from A to B is 578 across and 184 up at 6× scale,'
  ' which is 72.3° clockwise from North. The mark allows the usual ±2° of a protractor reading.')
q(21, 5, '5', '', 'calculation', FACT, '',
  "<p>Factorise &nbsp; w<sup>2</sup> &minus; 5w</p>",
  "<b>w(w &minus; 5)</b> &mdash; w is a factor of both terms.", "w(w - 5)|w(w-5)|(w - 5)w|(w-5)w")

# ================================ 22 July =========================================================
# Only FOUR rows are drawn on this page: the cupcake question takes the room of two. The day's
# fifth question is the split of the row that asks for two products of primes side by side.
q(22, 1, '1', '', 'drawing', AREA2, 'diagram',
  "<p><b>Figure:</b> a rectangle 5cm long and 3cm tall.</p>"
  "<p>Sketch a triangle with the same area as this rectangle.</p>",
  "<b>Any triangle with area 15 cm²</b> &mdash; e.g. base 5cm and perpendicular height 6cm, or"
  " base 10cm and height 3cm (½ × base × height = 15).", '', NO_SCHEME)
# the pattern read off the page, P = shaded, W = white; one square must be added for order 4
G_22 = ['PPPWP', 'WPWPP', 'PWWWP', 'PWWPW', 'PWPPP']
def _rot(g): return [''.join(g[4 - c][r] for c in range(5)) for r in range(5)]
_fix = [(r, c) for r in range(5) for c in range(5) if G_22[r][c] == 'W'
        and (lambda h: _rot(h) == h)([''.join('P' if (i, j) == (r, c) else G_22[i][j]
                                               for j in range(5)) for i in range(5)])]
assert _fix == [(3, 1)]
q(22, 2, '2', '', 'drawing', SYMM, 'grid',
  "<p><b>Figure:</b> a 5 by 5 grid of squares, some shaded. Row by row from the top (S = shaded,"
  " W = white):<br>S S S W S<br>W S W S S<br>S W W W S<br>S W W S W<br>S W S S S</p>"
  "<p>Shade one more square so this pattern has rotational symmetry order 4.</p>",
  "<b>Shade the square in the 4th row, 2nd column</b> &mdash; it is the only white square whose shading makes the"
  " pattern match itself after every quarter turn.")
assert 2 ** 3 * 3 == 24 and 2 ** 4 * 3 * 5 == 240
q(22, 3, '3', 'a', 'calculation', PRIME, '',
  "<p>Write 24 as a product of primes</p>",
  "<b>2 × 2 × 2 × 3 = 2<sup>3</sup> × 3</b> &mdash; 24 = 2 × 12 = 2 × 2 × 6 = 2 × 2 × 2 × 3.",
  "2 × 2 × 2 × 3|2×2×2×3|2 x 2 x 2 x 3|2x2x2x3|2³ × 3|2³×3|2^3 × 3|2^3×3|2^3x3")
q(22, 4, '3', 'b', 'calculation', PRIME, '',
  "<p>Write 240 as a product of primes</p>",
  "<b>2 × 2 × 2 × 2 × 3 × 5 = 2<sup>4</sup> × 3 × 5</b> &mdash; 240 = 24 × 10 = (2³ × 3) × (2 × 5).",
  "2 × 2 × 2 × 2 × 3 × 5|2×2×2×2×3×5|2x2x2x2x3x5|2⁴ × 3 × 5|2⁴×3×5|2^4 × 3 × 5|2^4×3×5|2^4x3x5")
assert 16 * F(23, 4) * 3 == 276 and F(276, 12) == 23
q(22, 5, '4', '', 'calculation', f"{MIXED},{DIRP}", '',
  "<p>Sarah makes cupcakes.<br>She makes 16 cupcakes per hour.</p><p>She makes cupcakes for"
  " 5<sup>3</sup>&frasl;<sub>4</sub> hours each day, for 3 days.</p><p>The cupcakes are packed"
  " into boxes that hold 12 cupcakes.</p><p>How many boxes are needed to hold all the cupcakes"
  " Sarah has made in 3 days?</p>",
  "<b>23 boxes</b> &mdash; 16 × 5¾ = 92 cupcakes a day, 92 × 3 = 276, and 276 ÷ 12 = 23 exactly.",
  "23")

# ================================ 23 July =========================================================
assert F(64, 100) < F(13, 20) == F(65, 100)
q(23, 1, '1', '', 'explain', CONV, '',
  "<p>Sophia says “0.64 is less than <sup>13</sup>&frasl;<sub>20</sub>”</p>"
  "<p>Is Sophia correct? Explain your answer.</p>",
  "<b>Yes</b> &mdash; <sup>13</sup>&frasl;<sub>20</sub> = <sup>65</sup>&frasl;<sub>100</sub> ="
  " 0.65, and 0.64 is less than 0.65.")
assert F(447, 1000) / 3 == F(149, 1000) and F(17, 1000) * F(8, 10) == F(136, 10000)
q(23, 2, '2', '', 'calculation', DEC, '',
  "<p>Work out &nbsp; 0.447 ÷ 3</p><p>Work out &nbsp; 0.017 × 0.8</p>",
  "<b>0.149</b> and <b>0.0136</b> &mdash; 447 ÷ 3 = 149; 17 × 8 = 136, with 3 + 1 = 4 decimal"
  " places.")
assert 4 + (-1) == 3 and 4 - (-1) == 5
q(23, 3, '3', '', 'calculation', SIMUL, '',
  "<p>Sian thinks of two different numbers</p><p>The two numbers have a total of 3</p>"
  "<p>The same numbers have a difference of 5</p><p>What two numbers did Sian think of?</p>",
  "<b>4 and &minus;1</b> &mdash; adding the total and the difference gives twice the bigger number:"
  " (3 + 5) ÷ 2 = 4, and 3 &minus; 4 = &minus;1.")
assert 180 - 59 == 121
q(23, 4, '4', '', 'calculation', ANGPA, 'angle-diagram',
  "<p><b>Figure:</b> two parallel lines, each marked with an arrow, cut by a transversal that runs"
  " down from the top left to the bottom right. At the lower line, the angle above the line and to"
  " the left of the transversal is 59°. At the upper line, x is the angle above the line and to the"
  " right of the transversal.</p><p>Find x.</p>",
  "<b>121°</b> &mdash; the angle above the upper line on the left of the transversal corresponds to"
  " the 59°, and x lies on a straight line with it: 180 &minus; 59.", "121|121°")
assert 14 * 10 == 20 * 7 == 140
q(23, 5, '5', '', 'calculation', f"{HCF},{UNITS}", '',
  "<p>Trains to Portadown leave a train station every 14 minutes.<br>Trains to Portrush leave a"
  " train station every 20 minutes<br>A train to Portadown and a train to Portrush both leave the"
  " train station at 8am.</p><p>When will a train to Portadown and a train to Portrush both leave"
  " the train station at the same time?</p>",
  "<b>10:20am</b> &mdash; the lowest common multiple of 14 and 20 is 140 minutes, which is 2 hours"
  " 20 minutes after 8am.", "10:20|10:20am|10:20 am|10.20am|10:20a.m.")

# ================================ 24 July =========================================================
q(24, 1, '1', '', 'calculation', CIRC, 'diagram',
  "<p>Find the circumference</p><p><b>Figure:</b> a circle with a dotted radius of 4cm drawn from"
  " the centre to the edge.</p>",
  "<b>25.1 cm (3 s.f.)</b> &mdash; C = 2&pi;r = 2 × &pi; × 4 = 8&pi; = 25.132…",
  "25.1 to 25.2|8π|8pi")
assert 2 * (F(53, 10) + F(26, 10)) == F(158, 10)
q(24, 2, '2', '', 'calculation', f"{PERIM},{DEC}", 'diagram',
  "<p>Shown below is a rectangle.</p><p><b>Figure:</b> a rectangle 5.3cm long and 2.6cm tall.</p>"
  "<p>Find the perimeter of the rectangle.</p>",
  "<b>15.8 cm</b> &mdash; 5.3 + 2.6 + 5.3 + 2.6.", "15.8|15.8cm|15.8 cm")
assert F(6 + 10, 2) * 5 == 40
q(24, 3, '3', '', 'calculation', AREA2, 'diagram',
  "<p><b>Figure:</b> a right-angled trapezium: parallel sides of 6cm (top) and 10cm (bottom), each"
  " marked with an arrow, and a vertical left side of 5cm meeting both at right angles.</p>"
  "<p>Find the area of the trapezium.</p>",
  "<b>40 cm²</b> &mdash; ½(a + b)h = ½ × (6 + 10) × 5.", "40|40cm²|40 cm²|40cm2")
EX_24 = [5, 6, 9, 12, 12]
assert sorted(EX_24)[2] == 9 and max(EX_24) - min(EX_24) == 7 and max(set(EX_24), key=EX_24.count) == 12
q(24, 4, '4', '', 'short', AVG, '',
  "<p>Marley has 5 cards, each with a number written on it.</p><p>The median is 9<br>The mode is"
  " 12<br>The range is 7</p><p>Write down a possible set of numbers Marley could have.</p>",
  "<b>For example 5, 6, 9, 12, 12</b> &mdash; the middle card is 9, two 12s make the mode, the"
  " smallest is 12 &minus; 7 = 5, and the second card can be 6, 7 or 8.")
assert round(240 * 3.14159265, 1) == 754.0
q(24, 5, '5', '', 'calculation', VOLSA, 'diagram',
  "<p><b>Figure:</b> a cylinder lying on its side, 15cm long, with a dotted radius of 4cm marked on"
  " its circular end.</p><p>Calculate the volume</p>",
  "<b>754 cm³ (3 s.f.)</b> &mdash; V = &pi;r²h = &pi; × 16 × 15 = 240&pi; = 753.98…",
  "753.9 to 754.1|754|240π|240pi")

# ================================ 25 July =========================================================
assert 90 * 6 + 130 * 4 + 1000 == 2060
q(25, 1, '1', '', 'calculation', DEC, '',
  "<p>Aisha has a mobile phone.<br>Text messages cost 4p each.<br>Calls cost 6p per minute.<br>She"
  " also has to pay £10 each month.</p><p>In September, Aisha:<br>- made 90 minutes of calls<br>-"
  " sent 130 text messages.</p><p>How much was her bill in September?</p>",
  "<b>£20.60</b> &mdash; calls 90 × 6p = £5.40, texts 130 × 4p = £5.20, plus £10.",
  "20.60|£20.60|20.6")
q(25, 2, '2', '', 'calculation', EXPND, '',
  "<p>Expand &nbsp; 7(y + 4)</p><p>Expand &nbsp; 5(3y + 1)</p>",
  "<b>7y + 28</b> and <b>15y + 5</b> &mdash; multiply every term inside the bracket.")
assert F(425, 100) ** 4 == F(32625390625, 10 ** 8)
q(25, 3, '3', '', 'calculation', f"{INDX},{ROUND}", '',
  "<p>Calculate &nbsp; 4.25<sup>4</sup> &nbsp; and write down the full calculator display</p>"
  "<p>Round your answer to one decimal place</p>",
  "<b>326.25390625</b>, which is <b>326.3</b> to 1 d.p. &mdash; 4.25 × 4.25 × 4.25 × 4.25.")
q(25, 4, '4', '', 'short', SIMP, '',
  "<p>Esme has y marbles.<br>Sean has 25 marbles.<br>Nylah has 10 marbles.</p>"
  "<p>Write down an expression for the total number of marbles they have.</p>",
  "<b>y + 35</b> &mdash; y + 25 + 10.", "y + 35|y+35|35 + y|35+y")
assert 5 * F(18, 4) == F(45, 2)
q(25, 5, '5', '', 'calculation', f"{PERIM},{SHAPE}", 'diagram',
  "<p>Here is a square inside of a regular pentagon.</p><p><b>Figure:</b> a regular pentagon with"
  " a square drawn inside it, the square's bottom side lying along the pentagon's bottom side and"
  " exactly as long.</p><p>The perimeter of the square is 18cm. What is the perimeter of the"
  " pentagon?</p>",
  "<b>22.5 cm</b> &mdash; each side of the square is 18 ÷ 4 = 4.5cm, which is also a side of the"
  " regular pentagon, so 5 × 4.5.", "22.5|22.5cm|22.5 cm")

# ================================ 26 July =========================================================
assert sorted([1, 2, 1, 3, 4])[2] == 2 and 4 - 1 == 3
q(26, 1, '1', '', 'calculation', f"{MEDN},{RANGE}", '',
  "<p>In 5 games, a footballer scores: &nbsp; 1 &nbsp; 2 &nbsp; 1 &nbsp; 3 &nbsp; 4</p>"
  "<p>What is the median?</p><p>What is the range?</p>",
  "<b>Median 2, range 3</b> &mdash; in order 1, 1, 2, 3, 4 the middle is 2; 4 &minus; 1 = 3.")
q(26, 2, '2', '', 'calculation', FACT, '',
  "<p>Factorise &nbsp; y² + 8y</p>",
  "<b>y(y + 8)</b> &mdash; y is a factor of both terms.", "y(y + 8)|y(y+8)|(y + 8)y|(y+8)y")
q(26, 3, '3', '', 'calculation', CIRC, '',
  "<p>A pizza has a circumference of 50cm.</p><p>Work out the diameter of the pizza.</p>",
  "<b>15.9 cm (3 s.f.)</b> &mdash; C = &pi;d, so d = 50 ÷ &pi; = 15.915…",
  "15.9 to 15.92|15.9cm|15.9 cm")
TAB_26 = {x: F(x, 2) + 2 for x in range(5)}
assert TAB_26 == {0: 2, 1: F(5, 2), 2: 3, 3: F(7, 2), 4: 4}
pre(26, '4', 'grid-blank',
  "<p>(A grid is printed with x and y each from 0 to 4.)</p>")
q(26, 4, '4', 'a', 'short', SLG, 'table-blank',
  "<p>Complete the table of values for y = ½x + 2</p>"
  + T(['x', '0', '1', '2', '3', '4'], [['y', '', '', '', '', '']]),
  "<b>y = 2, 2.5, 3, 3.5, 4</b> &mdash; half of x, plus 2: e.g. ½ × 3 + 2 = 3.5.")
q(26, 5, '4', 'b', 'drawing', SLG, 'grid-blank',
  "<p>On the grid, draw the graph of y = ½x + 2</p>",
  "<b>A straight line from (0, 2) to (4, 4)</b>, through (2, 3).")

# ================================ 27 July =========================================================
q(27, 1, '1', '', 'short', SIMP, '',
  "<p>Simplify &nbsp; a + a + a + a + a</p><p>Simplify &nbsp; 2a + 3a + a</p>",
  "<b>5a</b> and <b>6a</b> &mdash; count the a's: five of them; 2 + 3 + 1 = 6.")
q(27, 2, '2', '', 'calculation', PCTAM, '',
  "<p>10% of 60 = ____</p><p>10% of ____ = 4</p>",
  "<b>6</b> and <b>40</b> &mdash; 10% is a tenth, so 60 ÷ 10 = 6, and 4 is a tenth of 40.")
assert 5 * 8 * 15 == 600
q(27, 3, '3', '', 'calculation', VOLSA, 'diagram',
  "<p><b>Figure:</b> a milk carton shaped as a cuboid, 8cm wide, 5cm deep and 15cm tall.</p>"
  "<p>Calculate the volume</p>",
  "<b>600 cm³</b> &mdash; 8 × 5 × 15.", "600|600cm³|600 cm³|600cm3")
q(27, 4, '4', '', 'calculation', LINEQ, '',
  "<p>Solve &nbsp; 4w &minus; 2 = 32</p>",
  "<b>w = 8.5</b> &mdash; add 2 to get 4w = 34, then divide by 4.",
  "8.5|w = 8.5|w=8.5|17/2")
assert F(75) / F(3, 2) == 50
q(27, 5, '5', '', 'calculation', CMEAS, '',
  "<p>A car travels 75 miles in 1 hour and 30 minutes.</p><p>Calculate the speed.</p>",
  "<b>50 mph</b> &mdash; 1 hour 30 minutes is 1.5 hours, and 75 ÷ 1.5 = 50.",
  "50|50mph|50 mph")

# ================================ 28 July =========================================================
q(28, 1, '1', '', 'short', SIMP, '',
  "<p>Simplify &nbsp; 10m &minus; 4m</p><p>Simplify &nbsp; m + m + m + m + m &minus; m</p>",
  "<b>6m</b> and <b>4m</b> &mdash; 10 &minus; 4 = 6; five m's take away one m.")
assert F(13566, 100) + F(19388, 100) == F(32954, 100) and F(32954, 200) == F(16477, 100)
pre(28, '2', 'diagram',
  "<p><b>Figure:</b> a calculator whose display reads 329.54</p>"
  "<p>Holly works out the answer to 135.66 + 193.88 on a calculator.<br>Her answer is shown on the"
  " calculator.</p>")
q(28, 2, '2', 'a', 'calculation', ROUND, '',
  "<p>Round her answer to one decimal place.</p>",
  "<b>329.5</b> &mdash; the second decimal digit is 4, so round down.", "329.5")
q(28, 3, '2', 'b', 'calculation', MEAN, '',
  "<p>Holly wanted to calculate the mean of 135.66 and 193.88.</p><p>Finish this for her.</p>",
  "<b>164.77</b> &mdash; the mean of two numbers is their total divided by 2: 329.54 ÷ 2.",
  "164.77")
q(28, 4, '3', '', 'calculation', FACT, '',
  "<p>Factorise &nbsp; 12 + 4p</p>",
  "<b>4(3 + p)</b> &mdash; 4 is the highest common factor of 12 and 4p.",
  "4(3 + p)|4(3+p)|4(p + 3)|4(p+3)")
assert 220 * F(162, 100) == F(3564, 10)
q(28, 5, '4', '', 'calculation', RATPR, '',
  "<p>Sophie went to Spain.<br>She changed £220 into euros (€).</p><p>The exchange rate was"
  " £1 = €1.62</p><p>Change £220 into euros (€).</p>",
  "<b>€356.40</b> &mdash; 220 × 1.62.", "356.40|356.4|€356.40|€356.4")

# ================================ 29 July =========================================================
# Only FOUR rows are drawn on this page: the trip question takes the room of two. The day's fifth
# question is the split of the row holding an increase and a decrease side by side.
q(29, 1, '1', '', 'calculation', EXPND, '',
  "<p>Expand &nbsp; 2(y &minus; 10)</p>",
  "<b>2y &minus; 20</b> &mdash; multiply each term in the bracket by 2.", "2y - 20|2y-20")
q(29, 2, '2', '', 'explain', FACM, '',
  "<p>a is an even number<br>b is an odd number</p><p>Is a + b an odd number, an even number or"
  " could it be either?</p>",
  "<b>Always odd</b> &mdash; an even number is a whole number of pairs and an odd number is pairs"
  " with one left over, so the sum always has one left over (e.g. 2 + 3 = 5, 4 + 7 = 11).",
  "odd|always odd|an odd number|Odd")
assert 740 * F(122, 100) == F(9028, 10) and 65 * F(87, 100) == F(5655, 100)
q(29, 3, '3', 'a', 'calculation', PCTID, '',
  "<p>Increase £740 by 22%</p>",
  "<b>£902.80</b> &mdash; 740 × 1.22 (22% of £740 is £162.80, added on).",
  "902.80|902.8|£902.80|£902.8")
q(29, 4, '3', 'b', 'calculation', PCTID, '',
  "<p>Decrease £65 by 13%</p>",
  "<b>£56.55</b> &mdash; 65 × 0.87 (13% of £65 is £8.45, taken off).", "56.55|£56.55")
assert 17 * 100 + 320 + 90 + 80 == 2190 and 21 * 100 == 2100
q(29, 5, '4', '', 'explain', DEC, '',
  "<p>Orla is planning a trip for her friends</p><p>Here are the costs for the trip.</p>"
  + T(['Cost', ''], [['Entry fee', '£17 per person'], ['Transport', '£320'], ['Insurance', '£90'],
                     ['Other costs', '£80']])
  + "<p>Orla charges £21 per person for the trip.<br>100 people go on the trip.</p>"
  "<p>Has Orla collected enough money to pay for all the costs of the trip?</p>",
  "<b>No &mdash; she is £90 short</b>: the costs are 100 × £17 + £320 + £90 + £80 = £2190, and she"
  " collects 100 × £21 = £2100.")

# ================================ 30 July =========================================================
assert 40 + 3 * 15 == 85
q(30, 1, '1', '', 'calculation', f"{SUBS},{UNITS}", '',
  "<p>It costs £40 to hire a car for the first day, then £15 per extra day.</p>"
  "<p>How much does four days cost?</p>",
  "<b>£85</b> &mdash; the first day is £40 and the other three days are 3 × £15 = £45.",
  "85|£85")
assert 60 - 60 * F(1, 4) - 60 * F(2, 3) == 5
q(30, 2, '2', '', 'calculation', FRAMT, '',
  "<p>Tahir has £60</p><p>He gives <sup>1</sup>&frasl;<sub>4</sub> to his mum</p>"
  "<p>He gives <sup>2</sup>&frasl;<sub>3</sub> to his friend<br>Tahir keeps the rest.</p>"
  "<p>How much money is Tahir left with?</p>",
  "<b>£5</b> &mdash; ¼ of £60 is £15 and ⅔ of £60 is £40, so 60 &minus; 15 &minus; 40 = 5.",
  "5|£5")
q(30, 3, '3', '', 'short', 'Statistics', '',
  "<p>Sean is recording information about the cars that he is selling.</p><p>Put a cross in the"
  " box to indicate whether each of the following is discrete or continuous data.</p>"
  "<p>The length of the car &nbsp; Discrete ☐ &nbsp; Continuous ☐</p>"
  "<p>The number of doors &nbsp; Discrete ☐ &nbsp; Continuous ☐</p>",
  "<b>Length: continuous. Number of doors: discrete</b> &mdash; a length is measured and can take"
  " any value; doors are counted in whole numbers.")
assert [6 * n - 4 for n in range(1, 6)] == [2, 8, 14, 20, 26]
q(30, 4, '4', '', 'calculation', NTH, '',
  "<p>The first 5 terms of a sequence are</p><p>2 &nbsp; 8 &nbsp; 14 &nbsp; 20 &nbsp; 26</p>"
  "<p>Find the nth term</p>",
  "<b>6n &minus; 4</b> &mdash; it goes up in 6s, and 6 × 1 &minus; 4 = 2.", "6n - 4|6n-4")
assert (27000 * F(70, 100) - 8000) / 50 == 218
q(30, 5, '5', '', 'calculation', PCTID, '',
  "<p>The price of a new car is £27000<br>In a sale, the price is reduced by 30%<br>Brodie buys"
  " the car in the sale.<br>He pays a £8000 deposit and pays the rest over 50 monthly payments.<br>"
  "Find the cost of each monthly payment.</p>",
  "<b>£218</b> &mdash; the sale price is 27000 × 0.7 = £18900; less the deposit leaves £10900, and"
  " 10900 ÷ 50 = 218.", "218|£218")

# ================================ 31 July =========================================================
assert F(7, 10) - F(2, 3) == F(1, 30) and F(2, 9) / F(5, 6) == F(4, 15)
q(31, 1, '1', '', 'calculation', f"{ADDF},{MULDF}", '',
  "<p><sup>7</sup>&frasl;<sub>10</sub> &minus; <sup>2</sup>&frasl;<sub>3</sub></p>"
  "<p><sup>2</sup>&frasl;<sub>9</sub> ÷ <sup>5</sup>&frasl;<sub>6</sub></p>",
  "<b><sup>1</sup>&frasl;<sub>30</sub></b> and <b><sup>4</sup>&frasl;<sub>15</sub></b> &mdash;"
  " over 30: 21/30 &minus; 20/30; flip and multiply: 2/9 × 6/5 = 12/45 = 4/15.")
TREE_31 = {'chicken': (72, 51), 'tuna': (100 - 72, 3)}
assert (72 - 51, 100 - 72, 100 - 72 - 3) == (21, 28, 25) and F(21 + 25, 100) == F(23, 50)
pre(31, '2', 'tree-diagram',
  "<p>Shown is a frequency tree with some information about the types of sandwiches at a"
  " buffet.</p><p><b>Figure:</b> a frequency tree starting from 100 sandwiches. They split into"
  " chicken (72) and tuna (blank). Chicken splits into white bread (51) and brown bread (blank);"
  " tuna splits into white bread (3) and brown bread (blank).</p>")
q(31, 2, '2', 'a', 'short', 'Tree Diagrams', 'tree-diagram',
  "<p>Complete the frequency tree</p>",
  "<b>Tuna 28; chicken on brown bread 21; tuna on brown bread 25</b> &mdash; 100 &minus; 72 = 28,"
  " 72 &minus; 51 = 21 and 28 &minus; 3 = 25.")
q(31, 3, '2', 'b', 'calculation', PROB, '',
  "<p>Finn picks a sandwich at random.</p><p>Find the probability that the sandwich has been made"
  " with brown bread.</p>",
  "<b><sup>46</sup>&frasl;<sub>100</sub> = <sup>23</sup>&frasl;<sub>50</sub></b> &mdash; 21 + 25 ="
  " 46 of the 100 sandwiches are on brown bread.", "46/100|23/50|0.46|46%")
assert F(350, 6) < F(530, 9)
q(31, 4, '3', '', 'explain', BESTV, '',
  "<p>A restaurant sells two different portion sizes of doughballs.</p><p>6 doughballs for"
  " £3.50<br>or<br>9 doughballs for £5.30</p><p>Which is the better value for money?</p>",
  "<b>6 doughballs for £3.50</b> &mdash; that is 350 ÷ 6 = 58.3p each against 530 ÷ 9 = 58.9p each"
  " (or: 18 doughballs cost £10.50 one way and £10.60 the other).")
q(31, 5, '4', '', 'calculation', CIRC, 'diagram',
  "<p>Calculate the area of this circle</p><p><b>Figure:</b> a circle with a dotted radius of 8cm"
  " drawn from the centre to the edge.</p>",
  "<b>201 cm² (3 s.f.)</b> &mdash; A = &pi;r² = &pi; × 64 = 64&pi; = 201.06…",
  "201 to 201.1|64π|64pi")
