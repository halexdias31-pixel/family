"""Corbettmaths Foundation 5-a-day — September. See common.py and tools/insert-cbm-5ad-jan-FP.py.

Every page was rendered and read, because the text layer drops the fractions, the indices, the
timetables and every number printed inside a picture. The September book is laid out as a grid of
cells rather than five full-width rows: `pos` counts the cells in reading order (left to right, top
to bottom), and cells that share one context (a timetable, a diagram) are parts of one question
sharing a `pre` stem. Corbettmaths prints no answers, so every answer is worked out from the
transcribed question, with Fraction arithmetic and asserts where there is arithmetic to check.
"""
import pathlib, sys
from fractions import Fraction as F
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from common import Month, T, NO_SCHEME
MONTH = Month(9, '14Fa1Pnfqmhbk-XeZBnbMHpf4dT-kEpIg')
q, pre = MONTH.q, MONTH.pre

ALG   = 'Manipulating Expressions'
UNITS = 'Units & Measures'
MULT  = 'Multiplication'
COMP  = 'Compound Shapes'
AREA2 = 'Area of 2-D Shapes'
SHARE = 'Sharing in a Ratio'
PERIM = 'Perimeter'
CIRC  = 'Area & Circumference of Circles'
PCTID = 'Percentage Increase & Decrease'
PCTAM = 'Percentage of an Amount'
FACT  = 'Factorising'
CUBES = 'Cubes & Cube Roots'
SQRS  = 'Squares & Square Roots'
PRIME = 'Primes & Prime Factorisation'
ENLG  = 'Enlargements'
LINEQ = 'Linear Equations'
FRAC  = 'Fractions'
FRAMT = 'Fractions of an Amount'
DRAWN = ('The picture is described in words from the rendered page; the answer is a drawing, so it'
         ' is left for a person to mark.')
READ  = 'The numbers were read off the rendered page, where the text layer drops them.'

def mins(a, b):
    """Minutes from a to b, both 'hh:mm'."""
    h1, m1 = map(int, a.split(':')); h2, m2 = map(int, b.split(':'))
    return (h2 * 60 + m2) - (h1 * 60 + m1)

# ================================ 1 September ======================================================
q(1, 1, '1', '', 'calculation', ALG, '',
  "<p>In a school canteen, a cup of tea costs 80p.</p>"
  "<p>Write down an expression for the cost, in pence, of <i>y</i> cups of tea.</p>",
  "<b>80y</b> &mdash; each cup is 80p, so y cups cost 80 × y pence.", "80y|80 y|80*y|80 x y|80 × y")
TT1 = [('04:21', '07:11'), ('05:19', '08:09'), ('06:39', '09:29'), ('07:59', '10:49')]
assert all(mins(a, b) == 170 for a, b in TT1)
pre(1, '2', '', "<p>A train timetable:</p>"
    + T(['', 'Train 1', 'Train 2', 'Train 3', 'Train 4'],
        [['Liverpool'] + [a for a, b in TT1], ['London'] + [b for a, b in TT1]]), READ)
q(1, 2, '2', 'a', 'calculation', UNITS, '',
  "<p>How long does each train take to travel from Liverpool to London?</p>",
  "<b>2 hours 50 minutes</b> &mdash; 04:21 to 07:11 is 2 h 50 min, and every train takes the same.",
  "2 hours 50 minutes|2h 50m|2 h 50 min|2hr 50min|170 minutes|170")
q(1, 3, '2', 'b', 'short', UNITS, '',
  "<p>Lorenzo needs to arrive in London by 9am.</p><p>Which train should he catch?</p>",
  "<b>the 05:19 from Liverpool</b> &mdash; it arrives at 08:09; the next one arrives at 09:29, too late.",
  "05:19|05 19|0519|5:19")
q(1, 4, '2', 'c', 'calculation', MULT, '',
  "<p>Each train carries 550 passengers. All 4 trains are full.</p>"
  "<p>How many passengers travel in total?</p>",
  "<b>2200</b> &mdash; 550 × 4 = 2200.", "2200|2,200")
assert 80 * 30 + F(1, 2) * 20 * 20 == 2600
q(1, 5, '3', '', 'calculation', COMP + ',' + AREA2, 'compound-shape',
  "<p><b>Figure:</b> a field. Its bottom edge is 100m long and its right edge is a vertical 30m,"
  " with right angles at both right-hand corners. Its top edge is 80m long. From the left end of the"
  " top edge a vertical side of 10m goes down, and a slanted side then runs from there down to the"
  " left end of the bottom edge.</p><p>Find the area of the field.</p>",
  "<b>2600 m²</b> &mdash; a rectangle 80 × 30 = 2400, plus a triangle with base 100 − 80 = 20 and"
  " height 30 − 10 = 20, ½ × 20 × 20 = 200.", "2600|2600 m2|2600m2|2600 m²", READ)
assert [640 * F(k, 8) for k in (1, 3, 4)] == [80, 240, 320]
q(1, 6, '4', '', 'calculation', SHARE, '',
  "<p>£640 is shared between John, Elias and Parker in the ratio 1:3:4</p>"
  "<p>How much do they each receive?</p>",
  "<b>John £80, Elias £240, Parker £320</b> &mdash; 1 + 3 + 4 = 8 parts, so one part is 640 ÷ 8 = £80.")

# ================================ 2 September ======================================================
assert 275 + 18 * 40 == 995
q(2, 1, '1', '', 'calculation', MULT, '',
  "<p>James bought a motor scooter.</p><p>He paid a deposit of £275 and 18 monthly payments of £40.</p>"
  "<p>How much did it cost him in total?</p>",
  "<b>£995</b> &mdash; 18 × 40 = £720, plus the £275 deposit.", "995|£995")
q(2, 2, '2', '', 'short', CUBES, '', "<p>What is the cube root of 64?</p>",
  "<b>4</b> &mdash; 4 × 4 × 4 = 64.", "4")
q(2, 3, '3', '', 'short', CUBES, '', "<p>What is 5 cubed?</p>",
  "<b>125</b> &mdash; 5 × 5 × 5 = 125.", "125")
assert 320 * F(65, 100) == 208
q(2, 4, '4', '', 'calculation', PCTID, '',
  "<p>A new TV is priced at £320. In a sale it is reduced by 35%.</p><p>Calculate the sale price.</p>",
  "<b>£208</b> &mdash; 35% of 320 is £112, and 320 − 112 = 208 (or 65% of 320).", "208|£208")
q(2, 5, '5', '', 'calculation', CIRC, 'circle',
  "<p><b>Figure:</b> a circle with a diameter of 12cm drawn across it.</p>"
  "<p>Find the circumference of the circle.</p>",
  "<b>37.7 cm</b> (12π) &mdash; circumference = π × diameter = π × 12 = 37.699…",
  "37.7|37.7 cm|37.7cm|12π|12pi|37.70|37.699", READ)
q(2, 6, '6', '', 'calculation', FACT, '', "<p>Factorise fully &nbsp;8x² − 10x</p>",
  "<b>2x(4x − 5)</b> &mdash; the highest common factor of 8x² and 10x is 2x.",
  "2x(4x − 5)|2x(4x-5)|2x(4x - 5)")

# ================================ 3 September ======================================================
q(3, 1, '1', '', 'drawing', ENLG, 'grid',
  "<p><b>Figure:</b> a square grid 10 squares wide and 10 tall. Counting from its bottom-left corner,"
  " the centre of enlargement P is at the grid point (1, 1), and a rectangle 3 squares wide and"
  " 1 square tall has its corners at (2, 2), (5, 2), (5, 3) and (2, 3).</p>"
  "<p>Enlarge the rectangle by scale factor 2, using P as the centre of enlargement.</p>",
  "<b>a 6 by 2 rectangle with corners at (3, 3), (9, 3), (9, 5) and (3, 5)</b> &mdash; each corner"
  " is twice as far from P as before: (2, 2) is 1 right and 1 up from P, so its image is 2 right and"
  " 2 up.", '', DRAWN)
pre(3, '2', 'map',
    "<p><b>Figure:</b> a route map with the towns in a line: Swantown to Green Island is 42km, Green"
    " Island to Newham is 32km, and Newham to Oldville has no distance marked.</p>"
    "<p>Here is a route map between four towns. The distances, in kilometres, between some of the"
    " towns are shown on the map.</p>", READ)
assert 95 - 42 - 32 == 21
q(3, 2, '2', 'a', 'calculation', 'Subtraction', '',
  "<p>The distance from Swantown to Oldville is 95 kilometres.</p>"
  "<p>Work out the distance from Newham to Oldville.</p>",
  "<b>21 km</b> &mdash; 95 − 42 − 32 = 21.", "21|21 km|21km")
q(3, 3, '2', 'b', 'written', 'Addition,Subtraction', '',
  "<p>Complete the distance chart.</p>"
  + T(['Swantown', '', '', ''],
      [['42', 'Green Island', '', ''], ['', '32', 'Newham', ''], ['', '', '', 'Oldville']]),
  "<b>Swantown–Newham 74, Swantown–Oldville 95, Green Island–Oldville 53, Newham–Oldville 21</b>"
  " &mdash; add the legs along the route: 42 + 32 = 74, 32 + 21 = 53.")
assert 2 * 3 ** 3 == 54 and 2 ** 2 * 3 ** 3 == 108
q(3, 4, '3', '', 'calculation', PRIME, '',
  "<p>Express 54 as a product of its prime factors. Give your answer in index form.</p>",
  "<b>2 × 3³</b> &mdash; 54 = 2 × 27 = 2 × 3 × 3 × 3.", "2 × 3³|2 × 3^3|2x3^3|2*3^3|2 x 3^3")
q(3, 5, '4', '', 'calculation', PRIME, '',
  "<p>Express 108 as a product of its prime factors. Give your answer in index form.</p>",
  "<b>2² × 3³</b> &mdash; 108 = 4 × 27 = 2 × 2 × 3 × 3 × 3.",
  "2² × 3³|2^2 × 3^3|2^2x3^3|2^2*3^3|2^2 x 3^3")

# ================================ 4 September ======================================================
q(4, 1, '1', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;y + 2 = 16</p>",
  "<b>y = 14</b> &mdash; subtract 2 from both sides.", "y = 14|y=14|14")
q(4, 2, '2', '', 'short', 'Parts of a Circle', 'circle',
  "<p>Match each label and diagram.</p>"
  "<p>Labels: circle and radius; circle and segment; circle and arc; circle and diameter; circle"
  " and tangent; circle and chord.</p>"
  "<p><b>Figure:</b> six circles, in this order: A, a straight line through the centre from edge to"
  " edge; B, a region shaded between a straight line and the edge; C, a straight line touching the"
  " outside of the circle; D, a line from the centre to the edge; E, a straight line from edge to"
  " edge that misses the centre; F, a piece of the edge picked out. The first label, circle and"
  " radius, is already joined to D.</p>",
  "<b>radius D, segment B, arc F, diameter A, tangent C, chord E</b> &mdash; a diameter passes"
  " through the centre and a chord does not; a tangent touches at one point.", '', READ)
assert 80 * F(130, 100) == 104
q(4, 3, '3', '', 'calculation', PCTAM, '', "<p>Work out 130% of 80</p>",
  "<b>104</b> &mdash; 100% is 80 and 30% is 24, so 80 + 24 = 104.", "104")
assert [4 * n - 2 for n in (1, 2, 3, 4)] == [2, 6, 10, 14]
pre(4, '4', '', "<p>Here is a sequence: &nbsp;2 &nbsp;6 &nbsp;10 &nbsp;14 &nbsp;…</p>")
q(4, 4, '4', 'a', 'calculation', 'nth Term of a Linear Sequence', '', "<p>Calculate the nth term.</p>",
  "<b>4n − 2</b> &mdash; the terms go up in 4s, and 4 × 1 = 4 is 2 more than the first term.",
  "4n − 2|4n-2|4n - 2")
q(4, 5, '4', 'b', 'explain', 'nth Term of a Linear Sequence', '', "<p>Is 501 a term in the sequence?</p>",
  "<b>No</b> &mdash; every term is even (4n − 2 is always even), and 501 is odd; 4n − 2 = 501"
  " gives n = 125.75, not a whole number.")
q(4, 6, '5', '', 'calculation', 'Estimation', '', "<p>Estimate &nbsp;(5.9 × 20.12) ÷ 4.07</p>",
  "<b>30</b> &mdash; round to 1 significant figure: (6 × 20) ÷ 4 = 120 ÷ 4 = 30.", "30")

# ================================ 5 September ======================================================
q(5, 1, '1', '', 'calculation', 'Volume & Surface Area', 'cuboid',
  "<p><b>Figure:</b> a box shaped like a cuboid 5cm long, 4cm deep and 2cm tall, beside a"
  " centimetre cube (1cm by 1cm by 1cm).</p>"
  "<p>How many centimetre cubes are needed to fill the box?</p>",
  "<b>40</b> &mdash; 5 × 4 × 2 = 40.", "40", READ)
pre(5, '2', '', "<p>Using the information that 47 × 23 = 1081, write down the value of</p>")
assert 47 * 230 == 10810 and F(47, 10) * 23 == F(1081, 10)
q(5, 2, '2', 'a', 'short', 'Calculating with Decimals', '', "<p>47 × 230</p>",
  "<b>10 810</b> &mdash; 230 is ten times 23, so the answer is ten times 1081.", "10810|10 810|10,810")
q(5, 3, '2', 'b', 'short', 'Calculating with Decimals', '', "<p>4.7 × 23</p>",
  "<b>108.1</b> &mdash; 4.7 is a tenth of 47, so the answer is a tenth of 1081.", "108.1")
assert F(400, 6) * 15 == 1000
q(5, 4, '3', '', 'calculation', 'Best Value & Unitary Method', '',
  "<p>A recipe that serves 6 people uses: 1 kilogram of mince, 400 grams of tomatoes, 3 chillies,"
  " 600 grams of kidney beans.</p>"
  "<p>How many grams of tomatoes would be needed for 15 people?</p>",
  "<b>1000 g</b> &mdash; 15 people is 2.5 times the recipe, and 400 × 2.5 = 1000.",
  "1000|1000g|1000 g|1 kg|1kg")
G5 = [15, 20, 24, 18, 19, 21, 26, 29]
assert F(sum(G5), 8) == F(43, 2) and max(G5) - min(G5) == 14
q(5, 5, '4', '', 'explain', 'Comparing Distributions,Mean,Range', '',
  "<p>8 boys and 8 girls from a class run 100m.</p>"
  "<p>The times taken, to the nearest second, for each girl are: 15, 20, 24, 18, 19, 21, 26, 29</p>"
  "<p>The mean of the boys' times is 25 seconds. The range of the boys' times is 14 seconds.</p>"
  "<p>Thomas says that &ldquo;the boys in our class are faster than the girls.&rdquo; Is he correct?</p>",
  "<b>No</b> &mdash; the girls' mean is 172 ÷ 8 = 21.5 s, less than the boys' 25 s, so on average"
  " the girls are faster; both ranges are 14 s, so the times are equally spread.")

# ================================ 6 September ======================================================
q(6, 1, '1', '', 'short', 'HCF & LCM,Factors & Multiples', '',
  "<p>From the box, choose two numbers that have a common multiple of 24.</p>"
  "<p>The box holds: 12, 28, 100, 40, 64, 35, 6, 18, 38</p>",
  "<b>12 and 6</b> &mdash; 24 is a multiple of a number only if the number is a factor of 24, and"
  " the only factors of 24 in the box are 12 and 6.", '', READ)
q(6, 2, '2', '', 'short', UNITS, '', "<p>Convert 2 metres into millimetres.</p>",
  "<b>2000 mm</b> &mdash; 1 m = 1000 mm.", "2000|2000 mm|2000mm")
pre(6, '3', 'map',
    "<p>Shown below are the positions of a lighthouse and a fishing boat.</p>"
    "<p><b>Figure:</b> a north arrow, a lighthouse marked with a cross, and a fishing boat marked with"
    " a cross further to the right and lower down the page (to the south-east of the lighthouse).</p>")
q(6, 3, '3', 'a', 'annotate', 'Bearings', '',
  "<p>Find the bearing of the fishing boat from the lighthouse.</p>",
  "<b>about 115°</b> &mdash; measure clockwise from north at the lighthouse to the line joining it to"
  " the boat.", '',
  NO_SCHEME + ' Read off the drawing it is about 115°, but the true reading depends on the printed'
  ' page, so it is measured rather than worked out.')
q(6, 4, '3', 'b', 'annotate', 'Scale Drawings & Maps', '',
  "<p>1cm = 2 miles. Work out the distance of the fishing boat from the lighthouse.</p>",
  "<b>about 9.5 miles</b> &mdash; the crosses are about 4.8cm apart on the page, and 4.8 × 2 = 9.6.",
  '', NO_SCHEME + ' The gap was measured off the page as about 4.8cm; a ruler on the printed sheet'
  ' decides it.')
assert 95 // 5 == 19 and 95 % 5 == 0
q(6, 5, '4', '', 'calculation', 'Ratio Problems', '',
  "<p>Three angles are in the ratio 2:4:5. The largest angle is 95°.</p>"
  "<p>Find the size of the other angles.</p>",
  "<b>38° and 76°</b> &mdash; 5 parts are 95°, so one part is 19°; 2 × 19 = 38 and 4 × 19 = 76.")

# ================================ 7 September ======================================================
q(7, 1, '1', '', 'short', 'Indices', '', "<p>Work out &nbsp;2³</p>",
  "<b>8</b> &mdash; 2 × 2 × 2 = 8.", "8")
q(7, 2, '2', '', 'short', 'Fraction Decimal Percentage Conversion', '', "<p>Write 5% as a decimal.</p>",
  "<b>0.05</b> &mdash; 5% is 5 ÷ 100.", "0.05|.05")
q(7, 3, '3', '', 'short', 'Fraction Decimal Percentage Conversion', '', "<p>Write 0.7 as a fraction.</p>",
  "<b>7/10</b> &mdash; 0.7 is seven tenths.", "7/10")
q(7, 4, '4', '', 'written', 'Listing Outcomes & Sample Space', '',
  "<p>A rugby team plays two matches. They can win (W), draw (D) or lose (L) each match.</p>"
  "<p>Megan says that the rugby team could win both matches (WW).</p>"
  "<p>List all the other possible outcomes.</p>",
  "<b>WD, WL, DW, DD, DL, LW, LD, LL</b> &mdash; 3 results for each match gives 3 × 3 = 9 outcomes,"
  " and WW is the one already given.")
pre(7, '5', 'coordinate-grid',
    "<p><b>Figure:</b> a coordinate grid with x from −2 to 3 and y from −10 to 12.</p>", READ)
q(7, 5, '5', 'a', 'drawing', 'Straight Line Graphs', '', "<p>Draw x = 1</p>",
  "<b>a vertical line through (1, 0)</b> &mdash; every point on it has x = 1.", '', DRAWN)
q(7, 6, '5', 'b', 'drawing', 'Straight Line Graphs', '', "<p>Draw the graph y = 4x</p>",
  "<b>a straight line through (−2, −8), (0, 0) and (3, 12)</b> &mdash; work out y = 4x for a few x"
  " values and join them.", '', DRAWN)

# ================================ 8 September ======================================================
q(8, 1, '1', '', 'drawing', 'Reflections', 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x and y each from −6 to 6. Triangle B has its corners at"
  " (2, 1), (4, 1) and (3, 4).</p><p>Reflect triangle B in the x-axis.</p>",
  "<b>corners at (2, −1), (4, −1) and (3, −4)</b> &mdash; reflecting in the x-axis keeps each x and"
  " changes the sign of each y.", '', DRAWN)
pre(8, '2', '', "<p>Find the value of 5y + 3w</p>")
assert 5 * 2 + 3 * 38 == 124 and 5 * 6 + 3 * -4 == 18
q(8, 2, '2', 'a', 'calculation', 'Substitution', '', "<p>when y = 2 and w = 38</p>",
  "<b>124</b> &mdash; 5 × 2 + 3 × 38 = 10 + 114.", "124")
q(8, 3, '2', 'b', 'calculation', 'Substitution,Negative Numbers', '', "<p>when y = 6 and w = −4</p>",
  "<b>18</b> &mdash; 5 × 6 + 3 × (−4) = 30 − 12.", "18")
q(8, 4, '3', '', 'calculation', 'Angles in Parallel Lines', 'angles',
  "<p><b>Figure:</b> two vertical parallel lines (marked with arrows) crossed by a straight line that"
  " slopes gently down from left to right. At the left crossing, the angle of 102° is between the"
  " part of the sloping line going to the left and the part of the parallel line going down. At the"
  " right crossing, angle x is between the part of the sloping line going to the right and the part"
  " of the parallel line going down.</p><p>Find the size of angle x.</p>",
  "<b>78°</b> &mdash; the angle corresponding to 102° at the right crossing sits beside x on the"
  " sloping straight line, so x = 180 − 102.", "78|78°", READ)
q(8, 5, '4', '', 'calculation', 'Rearranging Formulae', '', "<p>Make m the subject of &nbsp;s = hm/4</p>",
  "<b>m = 4s/h</b> &mdash; multiply both sides by 4, then divide by h.", "m = 4s/h|m=4s/h|4s/h")

# ================================ 9 September ======================================================
q(9, 1, '1', '', 'short', 'Simplifying & Collecting Terms', '', "<p>Simplify &nbsp;4a + a</p>",
  "<b>5a</b> &mdash; 4 a's and 1 more a.", "5a")
q(9, 2, '2', '', 'short', 'Simplifying & Collecting Terms', '', "<p>Simplify &nbsp;5a + 2c + 4a − c</p>",
  "<b>9a + c</b> &mdash; 5a + 4a = 9a and 2c − c = c.", "9a + c|9a+c|c + 9a|c+9a")
q(9, 3, '3', '', 'drawing', 'Rotations', 'grid',
  "<p><b>Figure:</b> a square grid 10 squares wide and 10 tall. Counting from its bottom-left corner,"
  " triangle C has its corners at (3, 6), (5, 6) and (4, 9), and P is the grid point (5, 5).</p>"
  "<p>Rotate triangle C 90° clockwise about P.</p>",
  "<b>corners at (6, 7), (6, 5) and (9, 6)</b> &mdash; each corner that is a squares right and b"
  " squares up from P moves to b right and a down: (4, 9) is 1 left and 4 up, so it goes to 4 right"
  " and 1 up.", '', DRAWN)
assert 260 * F(80, 100) == 208 and F(84 - 70, 70) * 100 == 20
q(9, 4, '4', '', 'calculation', PCTID, '',
  "<p>The price of a TV is £260. In a sale the price is decreased by 20%.</p>"
  "<p>Work out the price of the TV in the sale.</p>",
  "<b>£208</b> &mdash; 20% of 260 is £52, and 260 − 52 = 208.", "208|£208")
q(9, 5, '5', '', 'calculation', PCTID, '',
  "<p>The number of TVs sold increased from 70 to 84.</p><p>Work out the percentage increase.</p>",
  "<b>20%</b> &mdash; the increase is 14, and 14 ÷ 70 × 100 = 20.", "20%|20")
assert abs(F(49 * 20) * 3.141592653589793 - 3078.76) < 0.01
q(9, 6, '6', '', 'calculation', 'Volume & Surface Area', 'cylinder',
  "<p><b>Figure:</b> a cylinder with a radius of 7cm (marked from the centre of its top to the edge)"
  " and a height of 20cm.</p><p>Find the volume of the cylinder.</p>",
  "<b>3078.8 cm³</b> (980π) &mdash; π × 7² × 20 = 980π = 3078.76…",
  "3078.8|3078.76|3079|980π|980pi|3078.8 cm3|3078.8 cm³", READ)

# ================================ 10 September =====================================================
q(10, 1, '1', '', 'short', PERIM + ',Simplifying & Collecting Terms', 'rectangle',
  "<p><b>Figure:</b> a rectangle 2x long and x high.</p>"
  "<p>Write an expression for the perimeter of the rectangle.</p>",
  "<b>6x</b> &mdash; 2x + x + 2x + x = 6x.", "6x|6 x")
CARDS = ['cB', 'sB', 'sA', 'sB', 'cA', 'cA', 'sB', 'cA', 'sB', 'cB', 'cB', 'cB']
assert len(CARDS) == 12 and CARDS.count('cB') == 4 and CARDS.count('sB') == 4
pre(10, '2', 'cards',
    "<p>Below are 12 cards from a game. Each card shows a letter, A or B, inside a square or a"
    " circle.</p><p><b>Figure:</b> the 12 cards are: circle B, square B, square A, square B,"
    " circle A, circle A, square B, circle A, square B, circle B, circle B, circle B.</p>", READ)
q(10, 2, '2', 'a', 'written', 'Charts & Diagrams', '',
  "<p>Complete this two-way table.</p>"
  + T(['', 'A', 'B'], [['Square', '', ''], ['Circle', '', '']]),
  "<b>Square: A 1, B 4; Circle: A 3, B 4</b> &mdash; count each kind of card; the four numbers add"
  " to 12.")
q(10, 3, '2', 'b', 'calculation', 'Basic Probability', '',
  "<p>One card is picked at random. What is the probability it is a circle with the letter B?</p>",
  "<b>4/12 = 1/3</b> &mdash; 4 of the 12 cards are a circle with B.", "1/3|4/12")
q(10, 4, '3', '', 'short', 'Significant Figures', '', "<p>Round 8812 to one significant figure.</p>",
  "<b>9000</b> &mdash; the second digit is 8, so the 8 thousands round up.", "9000|9,000")
q(10, 5, '4', '', 'short', 'Significant Figures', '', "<p>Round 0.0761 to one significant figure.</p>",
  "<b>0.08</b> &mdash; the first significant digit is the 7, and the 6 after it rounds it up.",
  "0.08|.08")
q(10, 6, '5', '', 'explain', 'Statistics', '',
  "<p>Is shoe size discrete or continuous data? Discrete &#9744; &nbsp; Continuous &#9744;</p>"
  "<p>Give a reason for your answer.</p>",
  "<b>Discrete</b> &mdash; shoe sizes can only take set values (5, 5½, 6, …), not any value in"
  " between.")

# ================================ 11 September =====================================================
q(11, 1, '1', '', 'short', CUBES, '', "<p>List the first 5 cube numbers.</p>",
  "<b>1, 8, 27, 64, 125</b> &mdash; 1³, 2³, 3³, 4³, 5³.")
assert min(25 * 50, 8 * 100 + 5 * 50, 12 * 100) == 1050
q(11, 2, '2', '', 'calculation', 'Best Value & Unitary Method', '',
  "<p>Bottles of fizzy cola cost: 50p each, or £4 for a box of 10.</p>"
  "<p>Work out the cheapest price for 25 bottles of fizzy cola.</p>",
  "<b>£10.50</b> &mdash; two boxes of 10 (£8) and 5 single bottles (£2.50); three boxes would cost £12.",
  "10.50|£10.50|10.5|£10.5|1050p")
SOL = [(a, b) for a in range(5, 9) for b in range(8, 10) if 5 + a + 8 + b + 9 == 35]
assert SOL == [(5, 8)]
q(11, 3, '3', '', 'calculation', 'Averages & Range', '',
  "<p>Shown are five cards which are arranged in order from smallest to largest. The first card"
  " shows 5 and the other four are blank.</p>"
  "<p>The range of the cards is 4. The median of the cards is 8. The mean of the cards is 7.</p>"
  "<p>Work out the 4 missing numbers.</p>",
  "<b>5, 5, 8, 8, 9</b> &mdash; the largest is 5 + 4 = 9, the middle card is 8, and the five cards"
  " total 5 × 7 = 35, so the second and fourth add to 35 − 5 − 8 − 9 = 13; with the second between"
  " 5 and 8 and the fourth between 8 and 9, they are 5 and 8.")
q(11, 4, '4', '', 'short', 'Rounding', '', "<p>Write 129.34952 correct to 1 decimal place.</p>",
  "<b>129.3</b> &mdash; the next digit is 4, so round down.", "129.3")
q(11, 5, '5', '', 'short', 'Rounding', '', "<p>Write 83.07718 correct to two decimal places.</p>",
  "<b>83.08</b> &mdash; the next digit is 7, so the 7 hundredths round up to 8.", "83.08")
q(11, 6, '6', '', 'short', 'Term-to-Term Rules', '',
  "<p>Write down the next term in the sequence. &nbsp; 2a + b, &nbsp; 3a + 5b, &nbsp; 4a + 9b, …</p>",
  "<b>5a + 13b</b> &mdash; the a's go up by 1 each time and the b's by 4.", "5a + 13b|5a+13b")

# ================================ 12 September =====================================================
pre(12, '1', 'bar-chart',
    "<p><b>Figure:</b> a bar chart of the shoe sizes of some students. Frequency runs from 0 to 16."
    " Shoe size 3 has frequency 13, size 4 has 7, size 5 has 14 and size 6 has 10.</p>",
    'The bar heights were read off the rendered chart against its gridlines.')
q(12, 1, '1', 'a', 'short', 'Bar Charts & Pictograms', '', "<p>How many students had a shoe size of 6?</p>",
  "<b>10</b> &mdash; the bar for size 6 reaches 10.", "10")
q(12, 2, '1', 'b', 'short', 'Range', '', "<p>What is the range of the shoe sizes?</p>",
  "<b>3</b> &mdash; the largest size is 6 and the smallest is 3, so 6 − 3 = 3.", "3")
q(12, 3, '2', '', 'calculation', PCTAM, '', "<p>Work out 30% of 60</p>",
  "<b>18</b> &mdash; 10% is 6, and 3 × 6 = 18.", "18")
assert F(13, 40) * 100 == F(65, 2)
q(12, 4, '3', '', 'calculation', 'Fraction Decimal Percentage Conversion', '',
  "<p>Write 13 out of 40 as a percentage.</p>",
  "<b>32.5%</b> &mdash; 13 ÷ 40 = 0.325.", "32.5%|32.5")
assert (62 + 124) - (53 + 117) == 16
q(12, 5, '4', '', 'calculation', 'Calculating with Decimals', '',
  "<p>The table shows the prices of first and second class stamps for Letters and Large Letters up"
  " to 500g.</p>"
  + T(['Format', 'Weight', '1st Class', '2nd Class'],
      [['Letters', '0 - 100g', '62p', '53p'], ['Large Letters', '0 - 100g', '93p', '73p'],
       ['', '101 - 250g', '£1.24', '£1.17'], ['', '251 - 500g', '£1.65', '£1.48']])
  + "<p>Musa is going to post a Letter weighing 90g and a Large Letter weighing 200g. He chooses to"
  " post them both as second class.</p>"
  "<p>How much money has Musa saved by posting second class instead of first class?</p>",
  "<b>16p</b> &mdash; first class 62p + £1.24 = £1.86, second class 53p + £1.17 = £1.70.",
  "16p|16|£0.16|0.16")

# ================================ 13 September =====================================================
assert [3 * n + 1 for n in (1, 2, 3, 6)] == [4, 7, 10, 19]
q(13, 1, '1', '', 'calculation', 'nth Term of a Linear Sequence', 'pattern',
  "<p>These patterns are made of sticks.</p>"
  "<p><b>Figure:</b> Pattern 1 is one square made of 4 sticks; Pattern 2 is two squares in a row"
  " sharing a side (7 sticks); Pattern 3 is three squares in a row (10 sticks).</p>"
  "<p>How many sticks will there be in Pattern 6?</p>",
  "<b>19</b> &mdash; each new square adds 3 sticks: 4, 7, 10, 13, 16, 19 (the rule is 3n + 1).", "19")
assert F(1, 2) * 12 == F(2, 3) * 9
q(13, 2, '2', '', 'calculation', FRAMT, '',
  "<p>Find the missing number &nbsp; ½ of 12 = ⅔ of ……</p>",
  "<b>9</b> &mdash; ½ of 12 is 6; 6 is two thirds, so one third is 3 and the whole is 9.", "9")
pre(13, '3', '', "<p>Hannah is y years old.</p>")
q(13, 3, '3', 'a', 'short', 'Manipulating Expressions', '',
  "<p>Martin is eight years older. Write an expression for Martin's age.</p>",
  "<b>y + 8</b> &mdash; add 8 to Hannah's age.", "y + 8|y+8|8 + y|8+y")
q(13, 4, '3', 'b', 'short', 'Manipulating Expressions', '',
  "<p>Beth is three times as old as Hannah. Write an expression for Beth's age.</p>",
  "<b>3y</b> &mdash; three times y.", "3y|3 y|3*y|3 × y")
q(13, 5, '4', '', 'explain', 'Statistics', '',
  "<p>Is height discrete or continuous data? Discrete &#9744; &nbsp; Continuous &#9744;</p>"
  "<p>Give a reason for your answer.</p>",
  "<b>Continuous</b> &mdash; height is measured and can take any value in a range, not only whole"
  " numbers.")
assert 800 * F(14, 10) == 1120
q(13, 6, '5', '', 'calculation', 'Direct Proportion', '',
  "<p>Izabella went to Italy. She changed £800 into euros (€).</p>"
  "<p>The exchange rate was £1 = €1.40</p><p>Change £800 into euros.</p>",
  "<b>€1120</b> &mdash; 800 × 1.40 = 1120.", "1120|€1120|1,120|€1,120")

# ================================ 14 September =====================================================
pre(14, '1', '', "<p>Here is a sequence: &nbsp;8 &nbsp;11 &nbsp;14 &nbsp;__ &nbsp;__</p>")
q(14, 1, '1', 'a', 'short', 'Term-to-Term Rules', '', "<p>Find the next two terms in this sequence.</p>",
  "<b>17, 20</b> &mdash; the terms go up by 3.", "17, 20|17 20|17,20")
assert 3 * 10 + 5 == 35
q(14, 2, '1', 'b', 'calculation', 'nth Term of a Linear Sequence', '',
  "<p>What is the 10th term in the sequence?</p>",
  "<b>35</b> &mdash; the nth term is 3n + 5, and 3 × 10 + 5 = 35.", "35")
assert all((n * (n + 1) * (n + 2)) % 6 == 0 for n in range(1, 50))
q(14, 3, '2', '', 'proof', 'Factors & Multiples', '',
  "<p>Show that when you multiply three <b>consecutive</b> numbers the answer is always in the six"
  " times table.</p><p>Try three different examples.</p>",
  "<b>for example 1 × 2 × 3 = 6, 2 × 3 × 4 = 24, 3 × 4 × 5 = 60</b> &mdash; all multiples of 6:"
  " of any three consecutive numbers at least one is even and one is a multiple of 3.")
assert (180 - (360 - 318)) / 2 == 69
q(14, 4, '3', '', 'calculation', 'Angles in Triangles & Quadrilaterals', 'triangle',
  "<p><b>Figure:</b> an isosceles triangle, its two sloping sides marked equal. The reflex angle"
  " outside the top corner is 318°. Angle x is one of the two base angles.</p>"
  "<p>Find the size of angle x.</p>",
  "<b>69°</b> &mdash; the angle inside the top is 360 − 318 = 42°, and the two equal base angles"
  " share 180 − 42 = 138°.", "69|69°", READ)
q(14, 5, '4', '', 'drawing', 'Rotations', 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x and y each from −6 to 6. Triangle C has its corners at"
  " (1, 0), (5, 0) and (3, 2).</p><p>Rotate triangle C 180° about the origin.</p>",
  "<b>corners at (−1, 0), (−5, 0) and (−3, −2)</b> &mdash; a half turn about the origin changes the"
  " sign of both coordinates.", '', DRAWN)

# ================================ 15 September =====================================================
pre(15, '1', 'triangle',
    "<p><b>Figure:</b> a triangle whose two sloping sides are marked equal. The base angle on the"
    " right is 70° and the angle at the top is y.</p>", READ)
assert 180 - 2 * 70 == 40
q(15, 1, '1', 'a', 'calculation', 'Angles in Triangles & Quadrilaterals', '', "<p>Find the size of y.</p>",
  "<b>40°</b> &mdash; the triangle is isosceles, so both base angles are 70°, and 180 − 70 − 70 = 40.",
  "40|40°")
q(15, 2, '1', 'b', 'short', '2-D Shapes', '', "<p>What type of triangle is shown?</p>",
  "<b>isosceles</b> &mdash; two sides are marked equal (and two angles are equal).",
  "isosceles|isosceles triangle")
q(15, 3, '2', '', 'short', 'Simplifying & Collecting Terms', '', "<p>Simplify &nbsp;2 × 4y</p>",
  "<b>8y</b> &mdash; 2 × 4 = 8.", "8y")
q(15, 4, '3', '', 'short', 'Simplifying & Collecting Terms,Indices', '', "<p>Simplify &nbsp;a × a × a</p>",
  "<b>a³</b> &mdash; a multiplied by itself three times.", "a³|a^3")
q(15, 5, '4', '', 'drawing', 'Reflections', 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x and y each from −6 to 6. Shape C is an arch: a"
  " rectangle from x = 2 to x = 5 and y = 3 to y = 5 with a one-square notch cut out of the middle of"
  " its bottom edge, so its corners are (2, 3), (2, 5), (5, 5), (5, 3), (4, 3), (4, 4), (3, 4) and"
  " (3, 3).</p><p>Reflect the shape in the y-axis.</p>",
  "<b>corners at (−2, 3), (−2, 5), (−5, 5), (−5, 3), (−4, 3), (−4, 4), (−3, 4) and (−3, 3)</b>"
  " &mdash; reflecting in the y-axis changes the sign of each x and keeps each y.", '', DRAWN)
q(15, 6, '5', '', 'calculation', 'Volume & Surface Area', 'prism',
  "<p><b>Figure:</b> a prism with a step-shaped cross-section of area 30cm² and a length of"
  " 12cm.</p><p>The cross-sectional area is 30cm². The length is 12cm. Work out the volume of the"
  " prism.</p>",
  "<b>360 cm³</b> &mdash; volume = cross-sectional area × length = 30 × 12.",
  "360|360 cm3|360cm3|360 cm³")

# ================================ 16 September =====================================================
q(16, 1, '1', '', 'short', 'Addition,Multiplication', '',
  "<p>Write two numbers on the two blank cards that add to give 12 and multiply to give 32.</p>",
  "<b>4 and 8</b> &mdash; 4 + 8 = 12 and 4 × 8 = 32.", "4 and 8|4, 8|8 and 4|4,8")
q(16, 2, '2', '', 'short', 'Negative Numbers', '',
  "<p>Write two numbers on the two blank cards that add to give 0 and multiply to give −16.</p>",
  "<b>4 and −4</b> &mdash; 4 + (−4) = 0 and 4 × (−4) = −16.", "4 and -4|-4 and 4|4, -4|4,-4")
pre(16, '3', 'coordinate-grid',
    "<p><b>Figure:</b> a rectangle ABCD drawn on x and y axes, with its sides parallel to the axes."
    " A is (4, 5), B is (10, 5) and C is (10, 2); D is the fourth corner, below A.</p>", READ)
q(16, 3, '3', 'a', 'short', 'Coordinates', '', "<p>What are the coordinates of D?</p>",
  "<b>(4, 2)</b> &mdash; D is below A (x = 4) and level with C (y = 2).", "(4, 2)|(4,2)|4, 2|4,2")
q(16, 4, '3', 'b', 'short', 'Coordinates', '',
  "<p>E is halfway between the coordinates A and B. Write down the coordinates of E.</p>",
  "<b>(7, 5)</b> &mdash; halfway between x = 4 and x = 10 is 7, and both have y = 5.",
  "(7, 5)|(7,5)|7, 5|7,5")
assert F(7, 15) - F(1, 5) == F(4, 15) and F(1, 2) / F(7, 8) == F(4, 7)
q(16, 5, '4', '', 'calculation', 'Adding & Subtracting Fractions', '', "<p>Work out &nbsp;7/15 − 1/5</p>",
  "<b>4/15</b> &mdash; 1/5 = 3/15, and 7/15 − 3/15 = 4/15.", "4/15")
q(16, 6, '5', '', 'calculation', 'Multiplying & Dividing Fractions', '', "<p>Work out &nbsp;1/2 ÷ 7/8</p>",
  "<b>4/7</b> &mdash; 1/2 × 8/7 = 8/14 = 4/7.", "4/7|8/14")
assert 540 - (140 + 80 + 95 + 130) == 95
q(16, 7, '6', '', 'calculation', 'Angles in Polygons', 'polygon',
  "<p><b>Figure:</b> a pentagon with interior angles 140°, 80°, 95°, 130° and x.</p><p>Find x.</p>",
  "<b>95°</b> &mdash; the angles of a pentagon add to (5 − 2) × 180 = 540°, and"
  " 540 − (140 + 80 + 95 + 130) = 95.", "95|95°", READ)

# ================================ 17 September =====================================================
q(17, 1, '1', '', 'calculation', 'Scale Drawings & Maps', '',
  "<p>The scale of a map is 1cm = 200m.</p><p>On the map, the church and the school are 6cm apart.</p>"
  "<p>What is the actual distance between the school and the church?</p>",
  "<b>1200 m</b> (1.2 km) &mdash; 6 × 200 = 1200.", "1200|1200m|1200 m|1.2km|1.2 km")
pre(17, '2', 'triangle',
    "<p><b>Figure:</b> a triangle with angles 25°, 120° and y.</p>", READ)
q(17, 2, '2', 'a', 'calculation', 'Angles in Triangles & Quadrilaterals', '', "<p>Find the size of y.</p>",
  "<b>35°</b> &mdash; 180 − 25 − 120 = 35.", "35|35°")
q(17, 3, '2', 'b', 'short', '2-D Shapes', '', "<p>What type of triangle is shown?</p>",
  "<b>obtuse-angled (and scalene)</b> &mdash; it has an angle of 120°, bigger than 90°, and its three"
  " angles are all different.", "obtuse|obtuse-angled|obtuse angled|scalene")
q(17, 4, '3', '', 'short', 'HCF & LCM', '', "<p>Find the lowest common multiple (LCM) of 15 and 20.</p>",
  "<b>60</b> &mdash; multiples of 20 are 20, 40, 60, and 60 is the first that 15 divides.", "60")
assert [F(f, 60) * 360 for f in (25, 14, 21)] == [150, 84, 126]
q(17, 5, '4', '', 'calculation', 'Pie Charts', '',
  "<p>Mollie is going to draw a pie chart.</p>"
  + T(['Colour', 'Frequency'], [['Blue', '25'], ['Green', '14'], ['Red', '21']])
  + "<p>Calculate the size of each angle.</p>",
  "<b>Blue 150°, Green 84°, Red 126°</b> &mdash; the total is 60, so each one counts 360 ÷ 60 = 6°.")
CASH = [(10, 16), (20, 19), (30, 4), (40, 3), (50, 6), (60, 2)]
assert F(sum(a * b for a, b in CASH), sum(b for a, b in CASH)) == 24
q(17, 6, '5', '', 'calculation', 'Averages from a Table', '',
  "<p>The table shows the amount of money withdrawn from a cash machine.</p>"
  + T(['Money Withdrawn', 'Frequency'], [['£%d' % a, str(b)] for a, b in CASH])
  + "<p>Work out the mean amount of money withdrawn.</p>",
  "<b>£24</b> &mdash; the total withdrawn is £1200 over 50 withdrawals, and 1200 ÷ 50 = 24.",
  "24|£24|£24.00|24.00", READ)

# ================================ 18 September =====================================================
q(18, 1, '1', '', 'calculation', 'Scale Drawings & Maps', '',
  "<p>A map has a scale of 1cm : 3 miles. On the map, the distance between two towns is 14cm.</p>"
  "<p>What is the actual distance between the two towns? Include units for your answer.</p>",
  "<b>42 miles</b> &mdash; 14 × 3 = 42.", "42 miles|42miles")
q(18, 2, '2', '', 'short', 'Rounding', '', "<p>Write the number 38 627 to the nearest thousand.</p>",
  "<b>39 000</b> &mdash; the hundreds digit is 6, so round up.", "39000|39 000|39,000")
q(18, 3, '3', '', 'short', 'Rounding', '', "<p>Write 6.35 correct to 1 decimal place.</p>",
  "<b>6.4</b> &mdash; the next digit is 5, so round up.", "6.4")
assert F(2 * 165, 15) == 22
q(18, 4, '4', '', 'calculation', AREA2 + ',Linear Equations', 'triangle',
  "<p><b>Figure:</b> a triangle with base b and a perpendicular height of 15cm.</p>"
  "<p>The area of the triangle is 165cm². Find b.</p>",
  "<b>22 cm</b> &mdash; ½ × b × 15 = 165, so b × 15 = 330 and b = 22.", "22|22 cm|22cm|b = 22|b=22", READ)
assert F(4, 5) * F(4, 5) == F(16, 25) and F(1, 3) / F(7, 20) == F(20, 21)
q(18, 5, '5', '', 'calculation', 'Multiplying & Dividing Fractions', '', "<p>Work out &nbsp;4/5 × 4/5</p>",
  "<b>16/25</b> &mdash; multiply the tops and multiply the bottoms.", "16/25")
q(18, 6, '6', '', 'calculation', 'Multiplying & Dividing Fractions', '', "<p>Work out &nbsp;1/3 ÷ 7/20</p>",
  "<b>20/21</b> &mdash; flip the second fraction and multiply: 1/3 × 20/7 = 20/21.", "20/21")
assert [3 * n + 5 for n in (1, 2, 3, 4)] == [8, 11, 14, 17]
q(18, 7, '7', '', 'calculation', 'nth Term of a Linear Sequence', '',
  "<p>Find the nth term of &nbsp;8 &nbsp;11 &nbsp;14 &nbsp;17 &nbsp;…</p>",
  "<b>3n + 5</b> &mdash; the terms go up in 3s, and 3 × 1 = 3 is 5 less than the first term.",
  "3n + 5|3n+5")

# ================================ 19 September =====================================================
q(19, 1, '1', '', 'short', 'Term-to-Term Rules', '',
  "<p>40 &nbsp;20 &nbsp;10 &nbsp;__ &nbsp;__</p><p>Find the next two terms in this sequence.</p>",
  "<b>5, 2.5</b> &mdash; each term is half the one before.", "5, 2.5|5 2.5|5,2.5")
q(19, 2, '2', '', 'short', 'Types of Sequence,Squares & Square Roots', '',
  "<p>1 &nbsp;4 &nbsp;9 &nbsp;16 &nbsp;__ &nbsp;__</p><p>Find the next two terms in this sequence.</p>",
  "<b>25, 36</b> &mdash; these are the square numbers 1², 2², 3², 4², so next come 5² and 6².",
  "25, 36|25 36|25,36")
q(19, 3, '3', '', 'short', 'HCF & LCM', '', "<p>Find the highest common factor (HCF) of 24 and 40.</p>",
  "<b>8</b> &mdash; 24 = 8 × 3 and 40 = 8 × 5, and 3 and 5 share no factor.", "8")
pre(19, '4', 'coordinate-grid',
    "<p><b>Figure:</b> a coordinate grid with x and y each from 0 to 9. A straight line joins the"
    " point A at (2, 5) to the point B.</p>", 'B was read off the rendered grid as (7, 6).')
q(19, 4, '4', 'a', 'short', 'Coordinates', '', "<p>Write down the coordinates of B.</p>",
  "<b>(7, 6)</b> &mdash; 7 across and 6 up.", "(7, 6)|(7,6)|7, 6|7,6")
q(19, 5, '4', 'b', 'short', 'Coordinates', '',
  "<p>C is the midpoint of AB. Write down the coordinates of C.</p>",
  "<b>(4.5, 5.5)</b> &mdash; halfway between 2 and 7 is 4.5, and halfway between 5 and 6 is 5.5.",
  "(4.5, 5.5)|(4.5,5.5)|4.5, 5.5|4.5,5.5")
q(19, 6, '5', '', 'short', 'Bounds & Error Intervals', '',
  "<p>A sign reads &ldquo;Frome — Population 26,000&rdquo;. This sign is correct to the nearest"
  " thousand.</p><p>What is the greatest possible number of people that live in Frome?</p>",
  "<b>26 499</b> &mdash; 26 500 would round up to 27 000, so the most is one person fewer.",
  "26499|26 499|26,499")

# ================================ 20 September =====================================================
q(20, 1, '1', '', 'short', 'Simplifying & Collecting Terms', '', "<p>Simplify &nbsp;5y + 2 + 3y</p>",
  "<b>8y + 2</b> &mdash; 5y + 3y = 8y, and the 2 stays.", "8y + 2|8y+2|2 + 8y|2+8y")
q(20, 2, '2', '', 'short', 'Simplifying & Collecting Terms', '', "<p>Simplify &nbsp;w + 1 + w + 5</p>",
  "<b>2w + 6</b> &mdash; w + w = 2w and 1 + 5 = 6.", "2w + 6|2w+6|6 + 2w|6+2w")
q(20, 3, '3', '', 'calculation', 'HCF & LCM', '',
  "<p>A blue light flashes every 8 seconds. A red light flashes every 12 seconds.</p>"
  "<p>Both lights have just flashed together. After how many seconds will both lights flash"
  " together?</p>",
  "<b>24 seconds</b> &mdash; the lowest common multiple of 8 and 12 is 24.",
  "24|24 seconds|24s|24 s")
q(20, 4, '4', '', 'short', 'Real-Life Graphs', 'line-graph',
  "<p><b>Figure:</b> a conversion graph with Pounds (£) from 0 to 90 across and Emirati Dirhams from"
  " 0 to 350 up. A straight line goes from (0, 0) to £70 = 350 Dirhams.</p>"
  "<p>Convert 200 Dirhams into Pounds (£).</p>",
  "<b>£40</b> &mdash; read across from 200 Dirhams to the line and down: the line shows £1 = 5"
  " Dirhams, and 200 ÷ 5 = 40.", "40|£40|£40.00", READ)
assert 849 * 4 == 3396
q(20, 5, '5', '', 'calculation', 'Bounds & Error Intervals', '',
  "<p>Nicola is organising a concert to raise money for charity. Entry to the concert is £4.00. The"
  " number of people attending the concert is 800 to the nearest hundred.</p>"
  "<p>What is the greatest possible amount of money she raised for charity?</p>",
  "<b>£3396</b> &mdash; at most 849 people came (850 would round to 900), and 849 × £4 = £3396.",
  "3396|£3396|£3,396|3,396|£3396.00")

# ================================ 21 September =====================================================
assert 800 * F(40, 100) == 320
q(21, 1, '1', '', 'calculation', PCTAM, '',
  "<p>In one week 800 people went to a swimming pool. 40% of them were men.</p>"
  "<p>How many men went to the swimming pool?</p>",
  "<b>320</b> &mdash; 10% of 800 is 80, and 4 × 80 = 320.", "320")
q(21, 2, '2', '', 'written', 'Basic Probability,Range', '',
  "<p>A teacher has five cards, face down.</p><p>He says: &ldquo;I am going to take a card at random."
  " It is certain that the card is over 20. It is impossible that the card is odd. The range of the"
  " numbers is 8. Each card shows a different number.&rdquo;</p><p>What could the numbers be?</p>",
  "<b>for example 22, 24, 26, 28, 30</b> &mdash; five different even numbers all over 20 whose largest"
  " is 8 more than the smallest must be five even numbers in a row, starting at 22 or above.")
pre(21, '3', 'coordinate-grid',
    "<p><b>Figure:</b> a coordinate grid with x from 0 to 4 and y from 0 to 4.</p>")
q(21, 3, '3', 'a', 'drawing', 'Straight Line Graphs', '', "<p>On the grid, draw the graph of x = 3.</p>",
  "<b>a vertical line through (3, 0)</b> &mdash; every point on it has x = 3.", '', DRAWN)
q(21, 4, '3', 'b', 'drawing', 'Straight Line Graphs', '', "<p>On the grid, draw the graph of y = 1.</p>",
  "<b>a horizontal line through (0, 1)</b> &mdash; every point on it has y = 1.", '', DRAWN)
q(21, 5, '4', '', 'calculation', CIRC, 'circle',
  "<p><b>Figure:</b> a circle with a diameter of 5cm drawn across it.</p>"
  "<p>Calculate the area of the circle.</p>",
  "<b>19.6 cm²</b> (6.25π) &mdash; the radius is 5 ÷ 2 = 2.5, and π × 2.5² = 19.634…",
  "19.6|19.63|19.635|6.25π|6.25pi|19.6 cm2|19.6 cm²", READ)

# ================================ 22 September =====================================================
q(22, 1, '1', '', 'short', PRIME, '', "<p>List the first five prime numbers.</p>",
  "<b>2, 3, 5, 7, 11</b> &mdash; 1 is not prime, and 2 is the only even prime.")
q(22, 2, '2', '', 'short', CUBES, '', "<p>List the first five cube numbers.</p>",
  "<b>1, 8, 27, 64, 125</b> &mdash; 1³, 2³, 3³, 4³, 5³.")
q(22, 3, '3', '', 'short', 'Rotations,2-D Shapes', 'signs',
  "<p>Circle the road sign with rotational symmetry order 2.</p>"
  "<p><b>Figure:</b> three road signs: a blue circle with a white arrow pointing down and to the"
  " left; a red warning triangle with three curved arrows going round in a circle; a blue rectangle"
  " crossed by three white diagonal stripes.</p>",
  "<b>the blue rectangle with three diagonal stripes</b> &mdash; it looks the same after a half"
  " turn; the arrow sign has no rotational symmetry, and the triangle with three arrows going round"
  " comes back to itself three times in a turn (order 3).", '', READ)
q(22, 4, '4', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;w + 8 = 20</p>",
  "<b>w = 12</b> &mdash; subtract 8 from both sides.", "w = 12|w=12|12")
q(22, 5, '5', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;2x + 1 = 41</p>",
  "<b>x = 20</b> &mdash; subtract 1 to get 2x = 40, then divide by 2.", "x = 20|x=20|20")
W22 = [3, 6, 5, 6, 4, 3, 5, 9, 5, 4]
assert sorted(W22)[4:6] == [5, 5] and F(sum(W22), 10) == 5
pre(22, '6', '',
    "<p>Hannah is recording the number of letters in each word in an article. These are the first"
    " ten lengths:</p><p>3 &nbsp;6 &nbsp;5 &nbsp;6 &nbsp;4 &nbsp;3 &nbsp;5 &nbsp;9 &nbsp;5 &nbsp;4</p>")
q(22, 6, '6', 'a', 'calculation', 'Median', '', "<p>Work out the median.</p>",
  "<b>5</b> &mdash; in order 3 3 4 4 5 5 5 6 6 9, the middle two are 5 and 5.", "5")
q(22, 7, '6', 'b', 'calculation', 'Mean', '', "<p>Calculate the mean.</p>",
  "<b>5</b> &mdash; the total is 50 and 50 ÷ 10 = 5.", "5")
q(22, 8, '6', 'c', 'explain', 'Mean', '',
  "<p>The 11th word has 5 letters. Tick the box which describes what effect this will have on the"
  " mean: the mean will decrease &#9744; &nbsp; the mean will remain the same &#9744; &nbsp; the mean"
  " will increase &#9744;</p>",
  "<b>the mean will remain the same</b> &mdash; the new word equals the mean of 5, so the total is"
  " 55 over 11 words, which is still 5.")

# ================================ 23 September =====================================================
q(23, 1, '1', '', 'short', 'Expanding Brackets', '', "<p>Expand &nbsp;12(5 − x)</p>",
  "<b>60 − 12x</b> &mdash; multiply each term inside by 12.", "60 − 12x|60-12x|60 - 12x")
q(23, 2, '2', '', 'short', 'Laws of Indices', '', "<p>Simplify &nbsp;w³ × w⁻⁵</p>",
  "<b>w⁻²</b> (or 1/w²) &mdash; add the powers: 3 + (−5) = −2.", "w⁻²|w^-2|w^(-2)|1/w²|1/w^2", READ)
assert [3 * n + 3 for n in (1, 2, 3, 4, 200)] == [6, 9, 12, 15, 603]
pre(23, '3', 'pattern',
    "<p>Patterns are made of sticks.</p>"
    "<p><b>Figure:</b> each pattern is a tower of squares stacked on top of each other with a"
    " triangular roof on top: Pattern 1 has one square, Pattern 2 two, Pattern 3 three and Pattern 4"
    " four.</p>", READ)
q(23, 3, '3', 'a', 'short', 'Term-to-Term Rules', '',
  "<p>Complete the table for Pattern 4.</p>"
  + T(['Pattern Number', '1', '2', '3', '4'], [['Number of Sticks', '6', '9', '12', '']]),
  "<b>15</b> &mdash; each pattern has 3 more sticks than the one before.", "15")
q(23, 4, '3', 'b', 'calculation', 'nth Term of a Linear Sequence', '',
  "<p>Find an expression for the number of sticks in Pattern n.</p>",
  "<b>3n + 3</b> &mdash; it goes up in 3s, and 3 × 1 = 3 is 3 less than the 6 sticks in Pattern 1.",
  "3n + 3|3n+3|3(n + 1)|3(n+1)")
q(23, 5, '3', 'c', 'calculation', 'nth Term of a Linear Sequence', '',
  "<p>How many sticks are there in Pattern 200?</p>",
  "<b>603</b> &mdash; 3 × 200 + 3 = 603.", "603")
assert 4200000 * F(118, 100) == 4956000
q(23, 6, '4', '', 'calculation', PCTID, '',
  "<p>In 2000 the population of a country was 4,200,000. By 2020, the population had increased by"
  " 18%.</p><p>Work out the population in 2020.</p>",
  "<b>4 956 000</b> &mdash; 4 200 000 × 1.18 = 4 956 000.", "4956000|4 956 000|4,956,000")

# ================================ 24 September =====================================================
assert 6 + (7 + 1) * 5 == 46
q(24, 1, '1', '', 'short', 'Order of Operations', '',
  "<p>Put brackets in the calculation to make the answer <b>46</b>.</p><p>6 + 7 + 1 × 5</p>",
  "<b>6 + (7 + 1) × 5</b> &mdash; 7 + 1 = 8, 8 × 5 = 40, and 6 + 40 = 46.",
  "6 + (7 + 1) × 5|6+(7+1)×5|6+(7+1)x5|6 + (7 + 1) x 5")
pre(24, '2', '',
    "<p>Martin is x years old. Jennifer is 6 years older than Martin. Connor is twice as old as"
    " Jennifer.</p>")
q(24, 2, '2', 'a', 'short', 'Manipulating Expressions', '', "<p>Write an expression for Jennifer's age.</p>",
  "<b>x + 6</b> &mdash; 6 more than Martin.", "x + 6|x+6|6 + x|6+x")
q(24, 3, '2', 'b', 'short', 'Manipulating Expressions', '', "<p>Write an expression for Connor's age.</p>",
  "<b>2(x + 6)</b>, which is 2x + 12 &mdash; twice Jennifer's age.",
  "2(x + 6)|2(x+6)|2x + 12|2x+12")
q(24, 4, '2', 'c', 'short', 'Simplifying & Collecting Terms', '',
  "<p>Write an expression for the sum of the three ages.</p>",
  "<b>4x + 18</b> &mdash; x + (x + 6) + (2x + 12) = 4x + 18.", "4x + 18|4x+18")
PRICE = [(2011, 111), (2012, 128), (2013, 133), (2014, 132), (2015, 108)]
assert max(range(4), key=lambda i: PRICE[i + 1][1] - PRICE[i][1]) == 0
pre(24, '3', 'line-graph',
    T(['Year', 'Price in pence'], [[str(a), str(b)] for a, b in PRICE])
    + "<p><b>Figure:</b> a blank grid with Year from 2011 to 2015 across and Price from 100 to 145"
    " up.</p>", READ)
q(24, 5, '3', 'a', 'drawing', 'Line Graphs & Time Series', '', "<p>Draw a line graph for the data.</p>",
  "<b>points at (2011, 111), (2012, 128), (2013, 133), (2014, 132), (2015, 108), joined with straight"
  " lines</b> &mdash; plot each year's price and join them in order.", '', DRAWN)
q(24, 6, '3', 'b', 'short', 'Line Graphs & Time Series', '',
  "<p>Between which two consecutive years did the price increase the most? …… and ……</p>",
  "<b>2011 and 2012</b> &mdash; the price went up 17p, more than the 5p rise from 2012 to 2013.",
  "2011 and 2012|2011, 2012|2011-2012|2011 to 2012")

# ================================ 25 September =====================================================
q(25, 1, '1', '', 'calculation', 'Volume & Surface Area', 'cube',
  "<p><b>Figure:</b> a cube with edges of 7mm.</p>"
  "<p>Work out the volume of the cube. State the units of your answer.</p>",
  "<b>343 mm³</b> &mdash; 7 × 7 × 7 = 343.", "343 mm³|343 mm3|343mm3|343mm³", READ)
q(25, 2, '2', '', 'short', 'Coordinates', 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x and y each from 0 to 6, and a straight line from A at"
  " (2, 2) to B at (4, 6).</p><p>Write down the coordinates of the midpoint of AB.</p>",
  "<b>(3, 4)</b> &mdash; halfway between 2 and 4 is 3, and halfway between 2 and 6 is 4.",
  "(3, 4)|(3,4)|3, 4|3,4", READ)
assert F(7, 8) * F(3, 4) == F(21, 32) and F(2, 17) / F(2, 5) == F(5, 17)
q(25, 3, '3', '', 'calculation', 'Multiplying & Dividing Fractions', '', "<p>Work out &nbsp;7/8 × 3/4</p>",
  "<b>21/32</b> &mdash; multiply the tops and multiply the bottoms.", "21/32")
q(25, 4, '4', '', 'calculation', 'Multiplying & Dividing Fractions', '', "<p>Work out &nbsp;2/17 ÷ 2/5</p>",
  "<b>5/17</b> &mdash; 2/17 × 5/2 = 10/34 = 5/17.", "5/17|10/34")
assert (16000 - 10000) * F(30, 100) == 1800
q(25, 5, '5', '', 'calculation', PCTAM, '',
  "<p>In a country, people have to pay tax on their salary as shown: 30% on all earnings over"
  " £10,000.</p><p>David earns £16,000. Calculate how much tax he pays.</p>",
  "<b>£1800</b> &mdash; he earns £6000 over £10 000, and 30% of 6000 is 1800.",
  "1800|£1800|£1,800|1,800")
q(25, 6, '6', '', 'calculation', CIRC, 'circle',
  "<p><b>Figure:</b> a circle with a radius of 9cm drawn from its edge to its centre.</p>"
  "<p>Calculate the circumference of the circle.</p>",
  "<b>56.5 cm</b> (18π) &mdash; the diameter is 18, and π × 18 = 56.548…",
  "56.5|56.55|56.5 cm|56.5cm|18π|18pi", READ)

# ================================ 26 September =====================================================
D26 = [9, 8, 5, 8, 1, 2, 4]
assert sorted(D26)[3] == 5
pre(26, '1', '', "<p>9 &nbsp;8 &nbsp;5 &nbsp;8 &nbsp;1 &nbsp;2 &nbsp;4</p>")
q(26, 1, '1', 'a', 'short', 'Mode', '', "<p>Write down the mode.</p>",
  "<b>8</b> &mdash; 8 appears twice and every other number once.", "8")
q(26, 2, '1', 'b', 'short', 'Median', '', "<p>What is the median?</p>",
  "<b>5</b> &mdash; in order 1 2 4 5 8 8 9, the middle one is 5.", "5")
assert 600 // 9 == 66
q(26, 3, '2', '', 'calculation', 'Division', '',
  "<p>Otis is putting crayons into boxes. He puts 9 crayons in each box.</p>"
  "<p>How many boxes can he fill completely with 600 crayons?</p>",
  "<b>66</b> &mdash; 600 ÷ 9 = 66 remainder 6, so 66 boxes are full.", "66")
assert 400 * F(40, 100) == 160 and 300 * F(1, 2) == 150
q(26, 4, '3', '', 'explain', PCTAM, '',
  "<p>Two glasses contain orange juice. A 400ml glass is 40% full. A 300ml glass is half full.</p>"
  "<p>Which glass contains less orange juice?</p>",
  "<b>the 300ml glass</b> &mdash; it holds 150ml, and the 400ml glass holds 40% of 400 = 160ml.")
assert 300 * F(2, 5) == 120
q(26, 5, '4', '', 'calculation', SHARE, '',
  "<p>Alex and Thomas share 300 sweets. They divide them in the ratio 3:2.</p>"
  "<p>How many sweets does Thomas have?</p>",
  "<b>120</b> &mdash; 5 parts, so one part is 60, and Thomas has 2 parts.", "120")
assert 200 - 104 == 96 and 96 // 4 == 24 and 104 - 90 == 14
q(26, 6, '5', '', 'written', 'Tree Diagrams', 'tree-diagram',
  "<p>There are 104 students in Year 11. A quarter of the students in Year 10 did not do their"
  " homework. 90 students in Year 11 did their homework.</p><p>Complete the frequency tree.</p>"
  "<p><b>Figure:</b> a frequency tree starting from 200 students, splitting into Year 10 and Year 11,"
  " and each of those splitting into Did homework and Did not do homework; every box but the 200 is"
  " blank.</p>",
  "<b>Year 10: 96 (did 72, did not 24); Year 11: 104 (did 90, did not 14)</b> &mdash; 200 − 104 = 96,"
  " a quarter of 96 is 24, and 104 − 90 = 14.", '', READ)

# ================================ 27 September =====================================================
assert 4 * 100 + 7 == 407 and 4 * 99 + 7 == 403
pre(27, '1', '', "<p>Here are the first four terms of a number sequence: &nbsp;11 &nbsp;15 &nbsp;19 &nbsp;23</p>")
q(27, 1, '1', 'a', 'short', 'Term-to-Term Rules', '', "<p>Write down the next term of the number sequence.</p>",
  "<b>27</b> &mdash; the terms go up by 4.", "27")
q(27, 2, '1', 'b', 'short', 'Term-to-Term Rules', '',
  "<p>The 100th term of the number sequence is 407. Work out the 99th term of the number sequence.</p>",
  "<b>403</b> &mdash; each term is 4 more than the one before, so the 99th is 407 − 4.", "403")
pre(27, '2', 'coordinate-grid', "<p><b>Figure:</b> a coordinate grid with x from −2 to 3 and y from −10 to 12.</p>", READ)
q(27, 3, '2', 'a', 'drawing', 'Straight Line Graphs', '', "<p>Draw x = −1</p>",
  "<b>a vertical line through (−1, 0)</b> &mdash; every point on it has x = −1.", '', DRAWN)
q(27, 4, '2', 'b', 'drawing', 'Straight Line Graphs', '',
  "<p>On the grid, draw the graph of y = 2x − 4 for values of x from −2 to 3.</p>",
  "<b>a straight line from (−2, −8) through (0, −4) to (3, 2)</b> &mdash; work out y = 2x − 4 for each"
  " x and join the points.", '', DRAWN)
assert F(105, 3) == 35 and F(408, 12) == 34
q(27, 5, '3', '', 'explain', 'Best Value & Unitary Method', '',
  "<p>A shop sells a small box of 3 cupcakes for £1.05. The same shop also sells a large box of 12"
  " cupcakes for £4.08.</p><p>Which size of box is better value for money?</p>",
  "<b>the large box</b> &mdash; small: 105 ÷ 3 = 35p a cupcake; large: 408 ÷ 12 = 34p a cupcake.")

# ================================ 28 September =====================================================
q(28, 1, '1', '', 'short', 'Significant Figures', 'calculator',
  "<p>Aminah has worked out the answer to a calculation. Her calculator display shows 827.4715.</p>"
  "<p>Her teacher has told her to write all her answers to four significant figures.</p>"
  "<p>Round her answer to four significant figures.</p>",
  "<b>827.5</b> &mdash; the fifth significant digit is 7, so the 4 rounds up to 5.", "827.5", READ)
SB = {'Butter': 80, 'Caster Sugar': 60, 'Plain Flour': 100, 'Cornflour': 40}
assert [v * F(3, 4) for v in SB.values()] == [60, 45, 75, 30]
q(28, 2, '2', '', 'calculation', 'Direct Proportion', '',
  "<p>A recipe for shortbread serves 4:</p>"
  + T(['Ingredient', 'Amount'], [[k, '%dg' % v] for k, v in SB.items()])
  + "<p>How much of each ingredient will he need for 3 people?</p>",
  "<b>Butter 60g, Caster Sugar 45g, Plain Flour 75g, Cornflour 30g</b> &mdash; 3 people is ¾ of the"
  " recipe, so multiply each amount by ¾.", '', READ)
assert 180 - (360 - (75 + 160 + 60)) == 115
q(28, 3, '3', '', 'calculation', 'Angles in Triangles & Quadrilaterals,Angles at a Point & on a Line',
  'quadrilateral',
  "<p><b>Figure:</b> a quadrilateral with interior angles 75°, 160° and 60°. Its base is extended past"
  " the fourth corner, and x is the angle outside the quadrilateral between the extension and the"
  " side that meets it.</p><p>Find x.</p>",
  "<b>115°</b> &mdash; the fourth interior angle is 360 − 75 − 160 − 60 = 65°, and x is on a straight"
  " line with it: 180 − 65 = 115.", "115|115°", READ)
assert 4 * 2 + 5 * F(3, 2) == F(31, 2)
q(28, 4, '4', '', 'calculation', 'Substitution', '',
  "<p>Find the value of 4c + 5g when c = 2 and g = 1.5</p>",
  "<b>15.5</b> &mdash; 4 × 2 + 5 × 1.5 = 8 + 7.5.", "15.5")
assert 2 * (1 * 3 + 3 * 10 + 1 * 10) == 86
q(28, 5, '5', '', 'calculation', 'Volume & Surface Area', 'cuboid',
  "<p><b>Figure:</b> a cuboid 3cm wide, 1cm tall and 10cm long.</p>"
  "<p>Calculate the surface area of the cuboid.</p>",
  "<b>86 cm²</b> &mdash; two faces of 3 × 1 = 3, two of 3 × 10 = 30 and two of 1 × 10 = 10:"
  " 2 × (3 + 30 + 10) = 86.", "86|86 cm2|86cm2|86 cm²", READ)

# ================================ 29 September =====================================================
pre(29, '1', 'hexagon', "<p><b>Figure:</b> a regular hexagon.</p>")
q(29, 1, '1', 'a', 'drawing', 'Reflections,2-D Shapes', '',
  "<p>Draw all lines of symmetry on the regular hexagon.</p>",
  "<b>6 lines</b> &mdash; three through opposite corners and three through the midpoints of opposite"
  " sides.", '', DRAWN)
q(29, 2, '1', 'b', 'short', 'Rotations,2-D Shapes', '',
  "<p>What is the order of rotational symmetry of the regular hexagon?</p>",
  "<b>6</b> &mdash; it fits onto itself six times in a full turn.", "6")
q(29, 3, '2', '', 'drawing', 'Rotations,2-D Shapes', '',
  "<p>Draw a shape with order of rotational symmetry 1.</p>",
  "<b>any shape that only looks the same after a full turn</b> &mdash; for example a right-angled"
  " triangle with sides of different lengths, or the letter L.", '', NO_SCHEME)
assert all((n * (n + 1)) % 2 == 0 for n in range(1, 50))
q(29, 4, '3', '', 'proof', 'Factors & Multiples', '',
  "<p>Show that when you multiply two <b>consecutive</b> numbers the answer is always even.</p>"
  "<p>Try three different examples.</p>",
  "<b>for example 2 × 3 = 6, 5 × 6 = 30, 7 × 8 = 56</b> &mdash; all even: of two consecutive numbers"
  " one is always even, and an even number times anything is even.")
assert 30 - 21 == 9 and 90 - 30 == 60 and 60 - 45 == 15 and (9 + 45, 21 + 15) == (54, 36)
q(29, 5, '4', '', 'written', 'Charts & Diagrams', '',
  "<p>90 people sit their driving tests over one week. Complete the two-way table.</p>"
  + T(['', 'Under 20 driving lessons', '20 or over driving lessons', 'total'],
      [['Pass', '', '21', '30'], ['Fail', '45', '', ''], ['total', '', '', '90']]),
  "<b>Pass: 9, 21, 30; Fail: 45, 15, 60; total: 54, 36, 90</b> &mdash; 30 − 21 = 9, 90 − 30 = 60,"
  " 60 − 45 = 15, then add the columns.", '', READ)
q(29, 6, '5', '', 'short', 'Laws of Indices', '', "<p>Simplify &nbsp;w⁶ ÷ w⁴ (written as a fraction)</p>",
  "<b>w²</b> &mdash; subtract the powers: 6 − 4 = 2.", "w²|w^2", READ)

# ================================ 30 September =====================================================
assert 4 + 6 + (12 - 4) + 5 + 12 + (6 + 5) == 46
q(30, 1, '1', '', 'calculation', PERIM, 'compound-shape',
  "<p><b>Figure:</b> an L-shape made of right angles. Its top edge is 4cm, the side down from the top"
  " edge's right end is 6cm, the lower right side is 5cm, and its bottom edge is 12cm. The other two"
  " sides are not labelled.</p><p>What is the perimeter of the shape?</p>",
  "<b>46 cm</b> &mdash; the missing sides are 12 − 4 = 8 across and 6 + 5 = 11 down the left, so"
  " 4 + 6 + 8 + 5 + 12 + 11 = 46.", "46|46 cm|46cm", READ)
q(30, 2, '2', '', 'short', 'Rounding', '', "<p>What is 7.5314 to two decimal places?</p>",
  "<b>7.53</b> &mdash; the next digit is 1, so round down.", "7.53")
assert F(400 - 126, 400) * 100 == F(137, 2)
q(30, 3, '3', '', 'calculation', 'Fraction Decimal Percentage Conversion', '',
  "<p>There are 400 students in a school. 126 travel to school by bus.</p>"
  "<p>What percentage of the students <b>do not</b> travel to school by bus?</p>",
  "<b>68.5%</b> &mdash; 400 − 126 = 274, and 274 ÷ 400 × 100 = 68.5.", "68.5%|68.5")
assert F(175, 1000) / F(4, 100) == F(35, 8)
q(30, 4, '4', '', 'calculation', 'Calculating with Decimals', '', "<p>Work out &nbsp;0.175 ÷ 0.04</p>",
  "<b>4.375</b> &mdash; multiply both by 100: 17.5 ÷ 4 = 4.375.", "4.375")
q(30, 5, '5', '', 'calculation', FACT, '', "<p>Factorise fully &nbsp;20y² − 30y</p>",
  "<b>10y(2y − 3)</b> &mdash; the highest common factor of 20y² and 30y is 10y.",
  "10y(2y − 3)|10y(2y-3)|10y(2y - 3)")
