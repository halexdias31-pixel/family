"""Corbettmaths Foundation 5-a-day — October. See common.py and tools/insert-cbm-5ad-jan-FP.py.

Every page was rendered and read, because the text layer drops the fractions, the indices and every
number printed inside a picture. The October book is a grid of cells rather than five full-width
rows: `pos` counts the questions in reading order (left to right, top to bottom), and a picture that
sits in the cell beside its question is part of that question rather than a row of its own.
Corbettmaths prints no answers, so every answer is worked out from the transcribed question, with
Fraction arithmetic and asserts where there is arithmetic to check.
"""
import pathlib, sys
from fractions import Fraction as F
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from common import Month, T, NO_SCHEME
MONTH = Month(10, '1LM3jmDt1jsZtsfdCazBLfsSrrZEjxw6w')
q, pre = MONTH.q, MONTH.pre

SIMP  = 'Simplifying & Collecting Terms'
PCTID = 'Percentage Increase & Decrease'
PCTAM = 'Percentage of an Amount'
VOLSA = 'Volume & Surface Area'
REARR = 'Rearranging Formulae'
AREA2 = 'Area of 2-D Shapes'
ADDFR = 'Adding & Subtracting Fractions'
MULFR = 'Multiplying & Dividing Fractions'
BEST  = 'Best Value & Unitary Method'
NEG   = 'Negative Numbers'
UNITS = 'Units & Measures'
PRIME = 'Primes & Prime Factorisation'
LINEQ = 'Linear Equations'
EXPND = 'Expanding Brackets'
FACT  = 'Factorising'
SUBS  = 'Substitution'
RATIO = 'Writing & Simplifying Ratio'
SHARE = 'Sharing in a Ratio'
RPROB = 'Ratio Problems'
PROB  = 'Basic Probability'
MEAN  = 'Mean'
AVG   = 'Averages & Range'
PERIM = 'Perimeter'
CIRC  = 'Area & Circumference of Circles'
PYTH  = "Pythagoras' Theorem"
ANG   = 'Angles'
FRAC  = 'Fractions'
FRAM  = 'Fractions of an Amount'
FDP   = 'Fraction Decimal Percentage Conversion'
ORDER = 'Order of Operations'
ROUND = 'Rounding'
SEQ   = 'Sequences'
NTH   = 'nth Term of a Linear Sequence'
STDF  = 'Standard Form'
INDX  = 'Indices'
DRAWN = ('The picture is described in words from the rendered page; the answer is a drawing, so it'
         ' is left for a person to mark.')

# ================================ 1 October ========================================================
q(1, 1, '1', '', 'calculation', SIMP, '', "<p>Simplify &nbsp;4a + 2a − a</p>",
  "<b>5a</b> &mdash; 4 + 2 − 1 = 5.", "5a")
q(1, 2, '2', '', 'calculation', SIMP, '', "<p>Simplify &nbsp;3w + 8y − 2w + 2y</p>",
  "<b>w + 10y</b> &mdash; 3w − 2w = w and 8y + 2y = 10y.", "w + 10y|w+10y|10y + w|10y+w")
q(1, 3, '3', '', 'calculation', PCTID, '',
  "<p>A football shirt normally costs £40.</p><p>A shop offers a 30% discount.</p>"
  "<p>What is the new price of the football shirt?</p>",
  "<b>£28</b> &mdash; 30% of £40 is £12, and £40 − £12 = £28.", "£28|28|£28.00|28.00")
assert 40 * F(7, 10) == 28
q(1, 4, '4', '', 'calculation', 'Multiplication', '',
  "<p>Emilia is paid £10 per hour. She works 2½ hours each day.</p>"
  "<p>In one week she worked 5 days.</p><p>How much did Emilia earn in that week?</p>",
  "<b>£125</b> &mdash; 2½ × 5 = 12½ hours, and 12½ × £10 = £125.", "£125|125|£125.00")
assert F(5, 2) * 5 * 10 == 125
q(1, 5, '5', '', 'calculation', VOLSA, 'prism',
  "<p><b>Figure (not to scale):</b> a prism 10cm long whose cross-section is an L-shape. The"
  " L is 9cm wide along the bottom and 8cm tall on the left. The lower step on the right is 5cm"
  " wide and 3cm tall.</p><p>Work out the volume of the prism.</p>",
  "<b>470 cm³</b> &mdash; the L is 9 × 8 = 72 with a 5 × 5 corner removed, so 47 cm², and"
  " 47 × 10 = 470.", "470|470 cm3|470cm3|470 cm^3|470cm^3",
  'The figure was read off the rendered page: the upright part is 9 − 5 = 4cm wide.')
assert 9 * 8 - 5 * (8 - 3) == 4 * 8 + 5 * 3 == 47
q(1, 6, '6', '', 'calculation', REARR, '', "<p>Rearrange y = 4x + 1 to make x the subject</p>",
  "<b>x = (y − 1)/4</b> &mdash; subtract 1 from both sides, then divide by 4.",
  "x = (y - 1)/4|x=(y-1)/4|x = (y-1)/4")

# ================================ 2 October ========================================================
q(2, 1, '1', '', 'short', 'Rotations,2-D Shapes', 'star',
  "<p><b>Figure:</b> a regular five-pointed star.</p>"
  "<p>Write down the order of rotational symmetry of the shape shown</p>",
  "<b>5</b> &mdash; the star looks the same in five positions as it turns once.", "5")
q(2, 2, '2', '', 'calculation', AREA2, 'triangle',
  "<p><b>Figure:</b> a triangle with base 14cm and perpendicular height 18cm.</p>"
  "<p>Calculate the area of the triangle</p>",
  "<b>126 cm²</b> &mdash; ½ × 14 × 18 = 126.", "126|126 cm2|126cm2|126 cm^2")
q(2, 3, '3', '', 'calculation', ADDFR, '', "<p>Work out &nbsp;1/2 + 5/12</p>",
  "<b>11/12</b> &mdash; 1/2 = 6/12, and 6/12 + 5/12 = 11/12.", "11/12")
assert F(1, 2) + F(5, 12) == F(11, 12)
q(2, 4, '4', '', 'calculation', ADDFR, '', "<p>Work out &nbsp;9/10 − 2/3</p>",
  "<b>7/30</b> &mdash; 27/30 − 20/30 = 7/30.", "7/30")
assert F(9, 10) - F(2, 3) == F(7, 30)
q(2, 5, '5', '', 'explain', BEST, '',
  "<p>Mr. Jones needs a plumber. The job should take 4 hours.</p>"
  "<p>Plumbers 'R' us: £50 call out charge + £30 per hour.<br>Plumb 4 u: £40 per hour.</p>"
  "<p>Which company should he hire?</p>",
  "<b>Plumb 4 u</b> &mdash; Plumbers 'R' us costs 50 + 4 × 30 = £170, Plumb 4 u costs"
  " 4 × 40 = £160, so Plumb 4 u is £10 cheaper.")
q(2, 6, '6', '', 'short', 'Place Value & Ordering', 'number-line',
  "<p><b>Figure:</b> a number line with equally spaced marks. One mark is labelled 9 and the"
  " mark two places to its right is labelled 12. An arrow points to the mark five places to the"
  " right of the 12.</p><p>What number is the arrow pointing to?</p>",
  "<b>19.5</b> &mdash; two gaps span 3, so each gap is 1.5, and 12 + 5 × 1.5 = 19.5.",
  "19.5|19½", 'The number line was read off the rendered page.')

# ================================ 3 October ========================================================
q(3, 1, '1', '', 'calculation', UNITS, '',
  "<p>The small bottle holds 250ml. The large bottle holds 2L.</p>"
  "<p>How many times larger is the large bottle?</p>",
  "<b>8 times</b> &mdash; 2L = 2000ml, and 2000 ÷ 250 = 8.", "8|8 times")
q(3, 2, '2', '', 'calculation', AREA2 + ',' + PERIM, 'square-and-triangle',
  "<p>The perimeter of a square grass field is 60m. In the field, there is a triangular pond.</p>"
  "<p><b>Figure:</b> the triangular pond has a base of 5m and a perpendicular height of 7m.</p>"
  "<p>Find the area of the field that is grass.</p>",
  "<b>207.5 m²</b> &mdash; each side is 60 ÷ 4 = 15m, so the field is 225 m²; the pond is"
  " ½ × 5 × 7 = 17.5 m²; 225 − 17.5 = 207.5.", "207.5|207.5 m2|207.5m2|207.5 m^2")
assert 15 * 15 - F(5 * 7, 2) == F(415, 2)
q(3, 3, '3', '', 'drawing', 'Translations', 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x and y from −6 to 6 and −5 to 5. Shape C is a T:"
  " its corners are (−4, −1), (−1, −1), (−1, −2), (−2, −2), (−2, −4), (−3, −4), (−3, −2) and"
  " (−4, −2).</p><p>Translate C by the vector (−1 over 5), that is, 1 left and 5 up.</p>",
  "<b>corners at (−5, 4), (−2, 4), (−2, 3), (−3, 3), (−3, 1), (−4, 1), (−4, 3) and (−5, 3)</b>"
  " &mdash; move every corner 1 left and 5 up.", '', DRAWN)
q(3, 4, '4', '', 'drawing', 'Enlargements', 'grid-shape',
  "<p><b>Figure:</b> an L-shape drawn on squared paper with a point P marked on a grid corner"
  " inside it. Taking P as (0, 0), the L has corners (−1, 1), (1, 1), (1, −1), (2, −1), (2, −2)"
  " and (−1, −2): two squares wide at the top and three squares wide along the bottom.</p>"
  "<p>Enlarge by scale factor 2 (centre P).</p>",
  "<b>corners at (−2, 2), (2, 2), (2, −2), (4, −2), (4, −4) and (−2, −4)</b> &mdash; double each"
  " corner's distance from P, so the L becomes 4 squares wide at the top, 6 along the bottom"
  " and 6 tall.", '', DRAWN)
q(3, 5, '5', '', 'calculation', PRIME, '', "<p>Write 66 as a product of primes</p>",
  "<b>2 × 3 × 11</b> &mdash; 66 = 2 × 33 = 2 × 3 × 11.", "2 × 3 × 11|2x3x11|2*3*11|2 x 3 x 11")

# ================================ 4 October ========================================================
q(4, 1, '1', '', 'explain', BEST, '',
  "<p>Small pack: 4 batteries for £1.80<br>Large pack: 6 batteries for £2.76</p>"
  "<p>Which is better value for money?</p>",
  "<b>the small pack</b> &mdash; £1.80 ÷ 4 = 45p a battery against £2.76 ÷ 6 = 46p a battery.")
assert F(180, 4) == 45 and F(276, 6) == 46
q(4, 2, '2', '', 'calculation', 'Subtraction,Multiplication', '',
  "<p>Below is part of a customer's electricity bill.</p>"
  + T(['', 'Reading'], [['Previous reading', '29381'], ['Present reading', '30122']])
  + "<p>Each unit costs 20p.</p><p>Work out the total cost</p>",
  "<b>£148.20</b> &mdash; 30122 − 29381 = 741 units, and 741 × 20p = 14820p = £148.20.",
  "£148.20|148.20|148.2|£148.2")
assert (30122 - 29381) * 20 == 14820
pre(4, '3', '', "<p>y = 2x − 3</p>")
q(4, 3, '3', 'a', 'calculation', 'Straight Line Graphs,' + SUBS, '',
  "<p>Complete the table of values for y = 2x − 3</p>"
  + T(['x', '−1', '0', '1', '2', '3'], [['y', '', '−3', '−1', '', '']]),
  "<b>y = −5, −3, −1, 1, 3</b> &mdash; the missing values are −5 (x = −1), 1 (x = 2) and"
  " 3 (x = 3).")
q(4, 4, '3', 'b', 'drawing', 'Straight Line Graphs', 'coordinate-grid',
  "<p><b>Figure:</b> a grid with x from −1 to 3 and y from −6 to 8.</p>"
  "<p>On the grid, draw the graph of y = 2x − 3 for values of x from −1 to 3.</p>",
  "<b>a straight line from (−1, −5) to (3, 3)</b> &mdash; plot the five points from the table"
  " and join them with a ruler.", '', DRAWN)
pre(4, '4', '', "<p>18, &nbsp;23, &nbsp;28, &nbsp;33, &nbsp;38 ...</p>")
q(4, 5, '4', 'a', 'calculation', NTH, '', "<p>Find the nth term of 18, 23, 28, 33, 38 ...</p>",
  "<b>5n + 13</b> &mdash; it goes up in 5s, and 18 − 5 = 13.", "5n + 13|5n+13|13 + 5n|13+5n")
q(4, 6, '4', 'b', 'calculation', NTH, '', "<p>Find the 100th term</p>",
  "<b>513</b> &mdash; 5 × 100 + 13 = 513.", "513")

# ================================ 5 October ========================================================
q(5, 1, '1', '', 'calculation', ROUND, '', "<p>Write 93.155 to the nearest whole number.</p>",
  "<b>93</b> &mdash; the first decimal is 1, which is less than 5, so round down.", "93")
q(5, 2, '2', '', 'calculation', ROUND, '', "<p>Write 93.155 to one decimal place.</p>",
  "<b>93.2</b> &mdash; the second decimal is 5, so the 1 rounds up to 2.", "93.2")
q(5, 3, '3', '', 'calculation', 'Calculating with Decimals,' + INDX, '',
  "<p>Calculate &nbsp;1 / 0.2<sup>2</sup></p>",
  "<b>25</b> &mdash; 0.2² = 0.04, and 1 ÷ 0.04 = 25.", "25")
assert 1 / F(2, 10) ** 2 == 25
q(5, 4, '4', '', 'calculation', AREA2, 'parallelogram',
  "<p><b>Figure:</b> a parallelogram with base 30mm, slanted side 23mm and perpendicular"
  " height 21mm.</p><p>Calculate the area of the parallelogram</p>",
  "<b>630 mm²</b> &mdash; base × perpendicular height = 30 × 21 = 630; the 23mm slant is not"
  " used.", "630|630 mm2|630mm2|630 mm^2")
q(5, 5, '5', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;5x − 4 = 26</p>",
  "<b>x = 6</b> &mdash; add 4 to get 5x = 30, then divide by 5.", "x = 6|x=6|6")
q(5, 6, '6', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;(x − 1)/3 = 4</p>",
  "<b>x = 13</b> &mdash; multiply by 3 to get x − 1 = 12, then add 1.", "x = 13|x=13|13")
q(5, 7, '7', '', 'short', 'Angles in Parallel Lines', 'parallel-lines',
  "<p><b>Figure:</b> two parallel lines crossed by one transversal. At the upper crossing the"
  " four angles are a (top left), b (top right), c (bottom right) and d (bottom left). At the"
  " lower crossing they are e (top left), f (top right), g (bottom right) and h (bottom"
  " left).</p><p>Which angle is corresponding to e?</p>",
  "<b>a</b> &mdash; a and e are in the same position (top left) at each crossing.", "a",
  'The letters were read off the rendered page.')

# ================================ 6 October ========================================================
q(6, 1, '1', '', 'calculation', 'Range,' + NEG, '',
  "<p>−4°C &nbsp; 3°C &nbsp; −7°C &nbsp; −12°C</p><p>Work out the range of the temperatures.</p>",
  "<b>15°C</b> &mdash; highest − lowest = 3 − (−12) = 15.", "15|15°C|15 °C|15C")
SHAPES = ('The two shapes were measured on the rendered page. Triangle: base about 5.1cm and two'
          ' equal sides about 3.8cm, height about 2.9cm, so a perimeter near 12.7cm and an area'
          ' near 7.3cm². Rectangle: about 3.6cm by 2.25cm, so a perimeter near 11.7cm and an area'
          ' near 8.1cm². Both comparisons hold by a clear margin, which is the point of the'
          ' question.')
pre(6, '2', 'shapes',
  "<p>The shapes below are drawn accurately.</p><p><b>Figure:</b> an isosceles triangle about"
  " 5.1cm wide at the base, with sloping sides about 3.8cm long, and a rectangle about 3.6cm by"
  " 2.25cm.</p>", SHAPES)
q(6, 2, '2', 'a', 'explain', PERIM, 'shapes', "<p>Which shape has the largest perimeter?</p>",
  "<b>the triangle</b> &mdash; measure the sides: about 5.1 + 3.8 + 3.8 = 12.7cm against"
  " 2 × (3.6 + 2.25) = 11.7cm for the rectangle.", '', SHAPES)
q(6, 3, '2', 'b', 'explain', AREA2, 'shapes', "<p>Which shape has the largest area?</p>",
  "<b>the rectangle</b> &mdash; about 3.6 × 2.25 = 8.1cm² against ½ × 5.1 × 2.9 = 7.4cm² for"
  " the triangle.", '', SHAPES)
q(6, 4, '3', '', 'explain', 'Cubes & Cube Roots', '',
  "<p>Theo says &ldquo;the difference between two consecutive cube numbers is always odd.&rdquo;</p>"
  "<p>Is Theo correct? You must show your workings.</p>",
  "<b>Yes</b> &mdash; e.g. 8 − 1 = 7, 27 − 8 = 19, 64 − 27 = 37; of two consecutive numbers one is"
  " odd and one even, so one cube is odd and the other even, and odd − even is always odd.")
assert all(((n + 1) ** 3 - n ** 3) % 2 == 1 for n in range(1, 50))
q(6, 5, '4', '', 'calculation', 'Laws of Indices', '', "<p>Simplify &nbsp;y<sup>8</sup> × y<sup>−2</sup></p>",
  "<b>y<sup>6</sup></b> &mdash; add the powers: 8 + (−2) = 6.", "y^6|y6")
q(6, 6, '5', '', 'calculation', SIMP, '', "<p>Simplify &nbsp;2ay × 4a</p>",
  "<b>8a<sup>2</sup>y</b> &mdash; 2 × 4 = 8 and a × a = a².", "8a^2y|8a²y|8ya^2|8ya²")

# ================================ 7 October ========================================================
q(7, 1, '1', '', 'calculation', PCTID, '', "<p>Decrease 15000 by 7%</p>",
  "<b>13950</b> &mdash; 7% of 15000 is 1050, and 15000 − 1050 = 13950 (or 15000 × 0.93).",
  "13950|13 950|13,950")
assert 15000 * F(93, 100) == 13950
pre(7, '2', '', "<p>y = 3x + 4</p>")
q(7, 2, '2', 'a', 'calculation', 'Straight Line Graphs,' + SUBS, '',
  "<p>Complete the table of values for y = 3x + 4</p>"
  + T(['x', '−1', '0', '1', '2'], [['y', '', '', '', '']]),
  "<b>y = 1, 4, 7, 10</b> &mdash; 3 × (−1) + 4 = 1, then add 3 each time.")
q(7, 3, '2', 'b', 'drawing', 'Straight Line Graphs', 'coordinate-grid',
  "<p><b>Figure:</b> a grid with x from −2 to 2 and y from −4 to 10.</p>"
  "<p>Draw the graph of y = 3x + 4.</p>",
  "<b>a straight line through (−1, 1), (0, 4), (1, 7) and (2, 10)</b> &mdash; plot the points"
  " from the table and join them with a ruler, across the whole grid.", '', DRAWN)
DTG = ('The graph was read off the rendered page (each small square is 2 minutes): she leaves home'
       ' at 11:05 and is 4km away at 11:20.')
pre(7, '3', 'distance-time-graph',
  "<p>Priya goes for a cycle from her house to the post office, 4km away.</p>"
  "<p><b>Figure:</b> a distance-time graph, distance from home (km) against time of day from"
  " 11:00 to 12:00. The line rises steadily from 0km at 11:05 to 4km at 11:20, stays at 4km"
  " until 11:40, then falls steadily back to 0km at 12:00.</p>", DTG)
q(7, 4, '3', 'a', 'calculation', 'Real-Life Graphs', 'distance-time-graph',
  "<p>How long did it take Priya to cycle to the post office?</p>",
  "<b>15 minutes</b> &mdash; from 11:05 to 11:20.", "15 minutes|15|15 mins|15 min", DTG)
q(7, 5, '3', 'b', 'calculation', 'Compound Measures,Real-Life Graphs', 'distance-time-graph',
  "<p>Work out Priya's speed cycling to the post office.</p>",
  "<b>16 km/h</b> &mdash; 4km in 15 minutes is 4km in ¼ hour, and 4 ÷ ¼ = 16.",
  "16 km/h|16km/h|16|16 kmh|16 kph", DTG)
assert 4 / F(15, 60) == 16

# ================================ 8 October ========================================================
q(8, 1, '1', '', 'calculation', FDP, '', "<p>Write 17% as a decimal</p>",
  "<b>0.17</b> &mdash; 17 ÷ 100 = 0.17.", "0.17|.17")
q(8, 2, '2', '', 'calculation', FDP, '', "<p>Write 0.1 as a fraction</p>",
  "<b>1/10</b> &mdash; 0.1 is one tenth.", "1/10")
pre(8, '3', '', "<p>In 5 games, a footballer scores: &nbsp;1 &nbsp;2 &nbsp;1 &nbsp;3 &nbsp;0</p>")
q(8, 3, '3', 'a', 'calculation', 'Median', '', "<p>What is the median?</p>",
  "<b>1</b> &mdash; in order 0, 1, 1, 2, 3, and the middle value is 1.", "1")
q(8, 4, '3', 'b', 'calculation', 'Range', '', "<p>What is the range?</p>",
  "<b>3</b> &mdash; 3 − 0 = 3.", "3")
q(8, 5, '4', '', 'drawing', 'Rotations', 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x from −6 to 6 and y from −5 to 5. Triangle ABC has"
  " A(2, −3), B(3, −1) and C(4, −3).</p><p>Rotate triangle ABC 180° about the origin</p>",
  "<b>corners at (−2, 3), (−3, 1) and (−4, 3)</b> &mdash; a half turn about the origin changes"
  " the sign of both coordinates of each corner.", '', DRAWN)
q(8, 6, '5', '', 'drawing', '3-D Shapes', 'isometric-drawing',
  "<p><b>Figure:</b> an L-shaped solid on isometric paper made of 1-unit cubes: a row of three"
  " cubes, one cube deep, with a second cube stacked on the cube at the left-hand end. An arrow"
  " marks the front, looking at the long side of the row.</p><p>Draw the plan view</p>",
  "<b>a 3 by 1 rectangle</b> (three squares in a row, one square deep), with a line across it"
  " one square in from the left where the taller part meets the lower part &mdash; the view"
  " from directly above.", '', DRAWN)

# ================================ 9 October ========================================================
q(9, 1, '1', '', 'calculation', 'Calculating with Decimals', '',
  "<p>Apples cost £1.00 per kg. Oranges cost 24p each. Tomatoes cost £2.40 per kg.</p>"
  "<p>Dara buys: 0.5 kg of apples, 2 oranges, 2 kg of tomatoes.</p><p>Work out the total cost</p>",
  "<b>£5.78</b> &mdash; 50p + 48p + £4.80 = £5.78.", "£5.78|5.78")
assert 50 + 2 * 24 + 2 * 240 == 578
q(9, 2, '2', '', 'calculation', SUBS, '', "<p>p = 5, &nbsp;a = 6</p><p>Work out the value of 3a + 8p</p>",
  "<b>58</b> &mdash; 3 × 6 + 8 × 5 = 18 + 40 = 58.", "58")
q(9, 3, '3', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;3w = 18</p>",
  "<b>w = 6</b> &mdash; divide both sides by 3.", "w = 6|w=6|6")
q(9, 4, '4', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;4w + 2 = 38</p>",
  "<b>w = 9</b> &mdash; subtract 2 to get 4w = 36, then divide by 4.", "w = 9|w=9|9")
q(9, 5, '5', '', 'calculation', CIRC, '',
  "<p>This wheel has a radius of 21cm. Calculate the circumference.</p>",
  "<b>131.9 cm</b> (42π) &mdash; the diameter is 42cm, and π × 42 = 131.946…",
  "131.9|131.95|132|131.9 cm|42π|42pi")
pre(9, '6', '', "<p>(183 + 892) / (10.4 × 8.75)</p>")
q(9, 6, '6', 'a', 'calculation', ORDER, '',
  "<p>Work out (183 + 892) / (10.4 × 8.75).</p><p>Write down your full calculator display.</p>",
  "<b>11.81318681…</b> &mdash; 1075 ÷ 91 = 11.8131868…", "11.81318681|11.813186813|11.8131868")
assert F(183 + 892) / (F(104, 10) * F(875, 100)) == F(1075, 91)
q(9, 7, '6', 'b', 'calculation', 'Significant Figures', '',
  "<p>Write your answer to 3 significant figures.</p>",
  "<b>11.8</b> &mdash; 11.81… to 3 significant figures.", "11.8")

# ================================ 10 October =======================================================
q(10, 1, '1', '', 'calculation', 'Multiplication', '',
  "<p>Given 37 × 102 = 3774</p><p>Work out 37 × 103</p>",
  "<b>3811</b> &mdash; one more lot of 37: 3774 + 37 = 3811.", "3811")
assert 37 * 103 == 3811
q(10, 2, '2', '', 'calculation', EXPND, '', "<p>Expand &nbsp;8(a + c)</p>",
  "<b>8a + 8c</b> &mdash; multiply each term in the bracket by 8.", "8a + 8c|8a+8c|8c + 8a|8c+8a")
q(10, 3, '3', '', 'calculation', EXPND, '', "<p>Expand &nbsp;x(x + 4)</p>",
  "<b>x² + 4x</b> &mdash; x × x = x² and x × 4 = 4x.", "x^2 + 4x|x²+4x|x^2+4x|x² + 4x")
pre(10, '4', '', "<p>3, &nbsp;7, &nbsp;11, &nbsp;15 ...</p>")
q(10, 4, '4', 'a', 'calculation', NTH, '', "<p>Calculate the nth term of 3, 7, 11, 15 ...</p>",
  "<b>4n − 1</b> &mdash; it goes up in 4s, and 3 − 4 = −1.", "4n - 1|4n-1|4n − 1")
q(10, 5, '4', 'b', 'explain', NTH, '', "<p>Is 801 a term in the sequence?</p>",
  "<b>No</b> &mdash; 4n − 1 = 801 gives n = 200.5, which is not a whole number (every term is one"
  " less than a multiple of 4, and 801 is one more than 800).")
q(10, 6, '5', '', 'calculation', ORDER + ',' + INDX, '',
  "<p>Use your calculator to work out the value of (7.8 × 1.4)<sup>3</sup> / (5.5 − 3.3)<sup>2</sup></p>"
  "<p>Write down all the figures on your calculator display.</p>",
  "<b>269.0435306…</b> &mdash; 10.92³ = 1302.170688 and 2.2² = 4.84; 1302.170688 ÷ 4.84 ="
  " 269.04353…", "269.0435306|269.04353058|269.043530578")
assert (F(78, 10) * F(14, 10)) ** 3 / F(22, 10) ** 2 == F(20346417, 75625)
q(10, 7, '6', '', 'calculation', CIRC, '',
  "<p><b>Figure:</b> a circle with radius 11cm.</p><p>Calculate the area of the circle</p>",
  "<b>380.1 cm²</b> (121π) &mdash; π × 11² = 121π = 380.13…",
  "380.1|380.13|380|121π|121pi|380.1 cm2", 'The 11cm line runs from the centre to the edge, so it is the radius.')

# ================================ 11 October =======================================================
q(11, 1, '1', '', 'annotate', PROB, 'spinner',
  "<p><b>Figure:</b> a blank ten-sided spinner with 10 equal sections.</p>"
  "<p>Label the spinner so that:</p><ul><li>it has an even chance of landing on an odd number;"
  "</li><li>an 8 is more likely than a 4;</li><li>an 8 and a 7 are equally likely;</li>"
  "<li>it is impossible to get a number above 8.</li></ul>",
  "<b>for example 1, 3, 5, 7, 7, 2, 4, 6, 8, 8</b> &mdash; five odd and five even sections"
  " (even chance of odd), two 8s and two 7s (equally likely), one 4 (less likely than 8), and"
  " nothing above 8. Any labelling meeting all four conditions is correct.", '',
  'Many labellings are right, so this is left for a person to check against the four conditions.')
q(11, 2, '2', '', 'calculation', 'Direct Proportion', '',
  "<p>Phoebe changes £16 into US dollars. The exchange rate is £1 to $1.40</p>"
  "<p>How many US dollars does Phoebe receive?</p>",
  "<b>$22.40</b> &mdash; 16 × 1.40 = 22.40.", "$22.40|22.40|22.4|$22.4")
assert 16 * F(14, 10) == F(224, 10)
q(11, 3, '3', '', 'calculation', 'Scale Drawings & Maps', '',
  "<p>A scale drawing has a scale of 1:500. In real life the length of a boat is 150m.</p>"
  "<p>What is the length of the boat on the scale drawing? Give your answer in centimetres.</p>",
  "<b>30 cm</b> &mdash; 150m = 15000cm, and 15000 ÷ 500 = 30.", "30|30 cm|30cm")
q(11, 4, '4', '', 'calculation', PRIME, '', "<p>Write 72 as a product of primes</p>",
  "<b>2³ × 3²</b> (2 × 2 × 2 × 3 × 3) &mdash; 72 = 8 × 9.",
  "2^3 × 3^2|2³ × 3²|2 × 2 × 2 × 3 × 3|2x2x2x3x3|2^3x3^2|2^3*3^2")

# ================================ 12 October =======================================================
TOWNS = T(['', 'Foxtown', 'Sandcliff', 'Red Island'],
          [['Sandcliff', '52', '', ''], ['Red Island', '70', '32', ''],
           ['Donhampton', '31', '14', '28']])
pre(12, '1', '', "<p>This table shows the distances, in miles, between some towns.</p>" + TOWNS,
    'The printed triangular distance chart is recovered as a table: read a distance where a row'
    ' town meets a column town.')
q(12, 1, '1', 'a', 'short', 'Charts & Diagrams', '',
  "<p>Write down the distance from Sandcliff to Donhampton.</p>",
  "<b>14 miles</b> &mdash; where the Donhampton row meets the Sandcliff column.", "14|14 miles")
q(12, 2, '1', 'b', 'short', 'Charts & Diagrams', '', "<p>Which two towns are the furthest apart?</p>",
  "<b>Foxtown and Red Island</b> &mdash; 70 miles is the largest distance in the table.")
q(12, 3, '1', 'c', 'short', 'Charts & Diagrams', '',
  "<p>George visits his friend and returns home. He has travelled 64 miles in total.</p>"
  "<p>Where do they live?</p>",
  "<b>Sandcliff and Red Island</b> &mdash; 64 ÷ 2 = 32 miles each way, and 32 is the distance"
  " between Sandcliff and Red Island.")
q(12, 4, '2', '', 'calculation', ADDFR, '', "<p>Work out &nbsp;3/4 + 1/12</p>",
  "<b>5/6</b> (10/12) &mdash; 3/4 = 9/12, and 9/12 + 1/12 = 10/12 = 5/6.", "5/6|10/12")
assert F(3, 4) + F(1, 12) == F(5, 6)
q(12, 5, '3', '', 'calculation', MULFR, '', "<p>Work out &nbsp;5/14 × 3/4</p>",
  "<b>15/56</b> &mdash; multiply the tops and the bottoms: 15/56.", "15/56")
assert F(5, 14) * F(3, 4) == F(15, 56)
q(12, 6, '4', '', 'drawing', '3-D Shapes', 'isometric-drawing',
  "<p><b>Figure:</b> a solid made of cubes, four cubes wide, with an arrow marking the front."
  " Counting back from the front, the four columns are 2, 2, 1 and 3 cubes deep, and every"
  " column is one cube high.</p><p>Draw the plan view</p>",
  "<b>a 4-wide plan with the back row full</b> &mdash; from the back: row 1 all four squares;"
  " row 2 squares 1, 2 and 4; row 3 square 4 only (the view from directly above).", '',
  'The depths of the four columns were read off the rendered drawing, which is not quite'
  ' consistent in its projection, so the plan is left for a person to mark.')
q(12, 7, '5', '', 'calculation', SIMP, 'pyramid',
  "<p>To find the contents of each empty box, multiply the two terms directly beneath it.</p>"
  "<p><b>Figure:</b> a pyramid of boxes; the bottom row holds 3, y and 4, the middle row has two"
  " empty boxes and the top has one empty box.</p><p>Complete the multiplication pyramid.</p>",
  "<b>middle row 3y and 4y; top 12y²</b> &mdash; 3 × y = 3y, y × 4 = 4y, and 3y × 4y = 12y².")

# ================================ 13 October =======================================================
q(13, 1, '1', '', 'calculation', 'Multiplication', '',
  "<p>Safia sends 14 text messages daily that cost 5p each. She makes 3 calls each day costing"
  " 25p each.</p><p>How much does she spend altogether over five days?</p>",
  "<b>£7.25</b> &mdash; each day 14 × 5p + 3 × 25p = 70p + 75p = 145p, and 145p × 5 = 725p.",
  "£7.25|7.25|725p")
assert (14 * 5 + 3 * 25) * 5 == 725
q(13, 2, '2', '', 'calculation', 'HCF & LCM', '',
  "<p>What is the smallest number that is divisible by both 3 and 11?</p>",
  "<b>33</b> &mdash; 3 and 11 share no factor, so the LCM is 3 × 11.", "33")
q(13, 3, '3', '', 'calculation', 'HCF & LCM', '',
  "<p>What is the smallest number divisible by both 6 and 9?</p>",
  "<b>18</b> &mdash; multiples of 9 are 9, 18, …, and 18 is the first that 6 divides.", "18")
q(13, 4, '4', '', 'calculation', LINEQ, '',
  "<p>Matt's age and Noah's age add up to 64. Matt is 36 years older than Noah.</p>"
  "<p>How old is Noah?</p>",
  "<b>14</b> &mdash; 64 − 36 = 28 is twice Noah's age, so Noah is 14 (and Matt 50).", "14|14 years")
pre(13, '5', '', "<p>W = 3a + 2c</p>")
q(13, 5, '5', 'a', 'calculation', SUBS, '', "<p>Find W if a = 7 and c = 8</p>",
  "<b>W = 37</b> &mdash; 3 × 7 + 2 × 8 = 21 + 16 = 37.", "37|W = 37|W=37")
q(13, 6, '5', 'b', 'calculation', SUBS, '', "<p>Find W if a = 3.5 and c = 2.2</p>",
  "<b>W = 14.9</b> &mdash; 3 × 3.5 + 2 × 2.2 = 10.5 + 4.4 = 14.9.", "14.9|W = 14.9|W=14.9")
assert 3 * F(35, 10) + 2 * F(22, 10) == F(149, 10)
q(13, 7, '6', '', 'calculation', 'Bearings', 'bearings',
  "<p><b>Figure:</b> two points, A and B, each with a North line drawn upwards. B is far to the"
  " right of A and a little higher up the page.</p><p>What is the bearing of A from B?</p>",
  "<b>about 262°</b> &mdash; from B, A is just south of due west: measure clockwise from B's"
  " North line, which is 270° less about 8°.", "260 to 264",
  'Measured on the embedded picture: A is 521 units left of B and 72 units below it, so the'
  ' line BA is 7.9° below due west and the bearing is 262°. A protractor reading within 2° is'
  ' accepted.')

# ================================ 14 October =======================================================
pre(14, '1', '', "<p>19 &nbsp;8 &nbsp;5 &nbsp;13 &nbsp;21 &nbsp;0</p>")
q(14, 1, '1', 'a', 'calculation', MEAN, '', "<p>Work out the mean of 19, 8, 5, 13, 21, 0.</p>",
  "<b>11</b> &mdash; the total is 66, and 66 ÷ 6 = 11.", "11")
assert sum([19, 8, 5, 13, 21, 0]) == 66
q(14, 2, '1', 'b', 'calculation', 'Median', '', "<p>Work out the median</p>",
  "<b>10.5</b> &mdash; in order 0, 5, 8, 13, 19, 21; halfway between 8 and 13 is 10.5.", "10.5")
q(14, 3, '2', '', 'calculation', INDX, '', "<p>Work out &nbsp;4<sup>3</sup></p>",
  "<b>64</b> &mdash; 4 × 4 × 4 = 64.", "64")
q(14, 4, '3', '', 'calculation', FACT, '', "<p>Factorise &nbsp;3x + 9</p>",
  "<b>3(x + 3)</b> &mdash; 3 is a factor of both terms.", "3(x + 3)|3(x+3)")
q(14, 5, '4', '', 'calculation', FACT, '', "<p>Factorise &nbsp;y² + 5y</p>",
  "<b>y(y + 5)</b> &mdash; y is a factor of both terms.", "y(y + 5)|y(y+5)")
q(14, 6, '5', '', 'calculation', 'Compound Shapes', 'compound-shape',
  "<p><b>Figure:</b> a rectangle 32cm wide and 20cm tall with a right-angled triangular notch cut"
  " from the top edge. The top edge keeps 9cm at each end; in the 14cm between, the edge drops"
  " straight down 5cm at the left and then slopes back up to the top at the right.</p>"
  "<p>Work out the area of this shape</p>",
  "<b>605 cm²</b> &mdash; the rectangle is 32 × 20 = 640; the notch is a triangle ½ × 14 × 5 ="
  " 35; 640 − 35 = 605.", "605|605 cm2|605cm2|605 cm^2")
assert 32 * 20 - F(14 * 5, 2) == 605
q(14, 7, '6', '', 'calculation', RPROB, '',
  "<p>Aoife has 20p coins and 50p coins in the ratio 4 : 9. Aoife has £4 of 20p coins.</p>"
  "<p>How many 50p coins does she have?</p>",
  "<b>45</b> &mdash; £4 is 20 coins of 20p; 20 is 4 parts, so one part is 5 and 9 parts are 45.",
  "45")

# ================================ 15 October =======================================================
q(15, 1, '1', '', 'calculation', AREA2 + ',' + PERIM, '',
  "<p>A square has a perimeter of 28cm. What is the area of the square?</p>",
  "<b>49 cm²</b> &mdash; each side is 28 ÷ 4 = 7cm, and 7 × 7 = 49.", "49|49 cm2|49cm2|49 cm^2")
q(15, 2, '2', '', 'calculation', LINEQ, '',
  "<p>Martin thinks of a number. He multiplies it by 3. He subtracts 12.</p>"
  "<p>His answer is the same as his starting number.</p><p>What was his number?</p>",
  "<b>6</b> &mdash; 3n − 12 = n, so 2n = 12 and n = 6 (check: 18 − 12 = 6).", "6")
q(15, 3, '3', '', 'calculation', 'Charts & Diagrams', '',
  "<p>A cinema records some information about the visitors they have one weekend.</p>"
  + T(['Day', 'Males', 'Females', 'Total'],
      [['Saturday', '', '115', '212'], ['Sunday', '', '', ''], ['Total', '143', '', '360']])
  + "<p>Fill in all the missing values</p>",
  "<b>Saturday males 97; Sunday males 46, females 102, total 148; total females 217</b> &mdash;"
  " 212 − 115 = 97, 360 − 212 = 148, 143 − 97 = 46, 148 − 46 = 102, 115 + 102 = 217.")
assert 212 - 115 == 97 and 143 - 97 == 46 and 360 - 212 == 148 and 148 - 46 == 102 == 360 - 143 - 115
q(15, 4, '4', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;(x + 5)/2 = 12</p>",
  "<b>x = 19</b> &mdash; multiply by 2 to get x + 5 = 24, then subtract 5.", "x = 19|x=19|19")
q(15, 5, '5', '', 'calculation', REARR, '', "<p>Rearrange y = 2x + 1 to make x the subject</p>",
  "<b>x = (y − 1)/2</b> &mdash; subtract 1 from both sides, then divide by 2.",
  "x = (y - 1)/2|x=(y-1)/2|x = (y-1)/2")

# ================================ 16 October =======================================================
q(16, 1, '1', '', 'short', 'Similarity & Congruence', 'grid-shapes',
  "<p><b>Figure:</b> six shapes, A to F, drawn on squared paper, each made of whole squares."
  " Using (column, row) squares counted from the top left of each shape:</p><ul>"
  "<li>A: (0,0), (0,1), (1,1), (1,2)</li><li>B: a T &mdash; (0,0), (1,0), (2,0), (1,1), (1,2)</li>"
  "<li>C: (0,0), (0,1), (0,2), (1,1), (2,1), (2,2)</li>"
  "<li>D: (0,0), (1,0), (1,1), (0,2), (1,2), (2,2)</li><li>E: (1,0), (1,1), (0,1), (0,2)</li>"
  "<li>F: an H &mdash; (0,0), (0,1), (0,2), (1,1), (2,0), (2,1), (2,2)</li></ul>"
  "<p>Which shape is congruent to C?</p>",
  "<b>D</b> &mdash; it is C reflected: both are a bar of three squares with a middle square off"
  " it and a last square turning back towards the end of the bar. A and E have 4 squares, B 5 and"
  " F 7.", "D", 'The six shapes were read square by square off the rendered page.')
CONV = ('The conversion graph was read off the rendered page: the straight line through the origin'
        ' reaches 10km at 6.25 miles, which is 1 mile = 1.6km.')
pre(16, '2', 'conversion-graph',
  "<p><b>Figure:</b> a conversion graph, km (0 to 10) against miles (0 to 10). A straight line"
  " runs from (0, 0) and reaches 10km at 6¼ miles.</p>", CONV)
q(16, 2, '2', 'a', 'calculation', 'Real-Life Graphs,Units & Measures', 'conversion-graph',
  "<p>Change 4km into miles</p>",
  "<b>2.5 miles</b> &mdash; read across from 4km to the line and down: 4 ÷ 1.6 = 2.5.",
  "2.5|2.5 miles|2½", CONV)
q(16, 3, '2', 'b', 'calculation', 'Real-Life Graphs,Units & Measures', 'conversion-graph',
  "<p>Change 15 miles into kilometres</p>",
  "<b>24 km</b> &mdash; 15 miles is off the graph, so read 5 miles = 8km and multiply by 3.",
  "24|24 km|24km", CONV)
assert 15 * F(16, 10) == 24 and 4 / F(16, 10) == F(5, 2)
q(16, 4, '3', '', 'written', '2-D Shapes', '',
  "<p>The names of three quadrilaterals are below.</p><p>square &nbsp; kite &nbsp; parallelogram</p>"
  "<p>Write each name in the correct position in the table below.</p>"
  + T(['', 'Line symmetry', 'No line symmetry'],
      [['Two pairs of parallel lines', '', ''], ['No parallel lines', '', '']]),
  "<b>square: two pairs of parallel lines, line symmetry; parallelogram: two pairs of parallel"
  " lines, no line symmetry; kite: no parallel lines, line symmetry</b> &mdash; the fourth box"
  " stays empty.")
q(16, 5, '4', '', 'calculation', 'Angles in Polygons', 'pentagon',
  "<p><b>Figure:</b> a pentagon with interior angles 136°, 108°, 76°, 140° and x.</p><p>Find x</p>",
  "<b>x = 80°</b> &mdash; a pentagon's angles add to 540°, and 540 − (136 + 108 + 76 + 140) = 80.",
  "80|80°|x = 80|x=80")
assert 540 - (136 + 108 + 76 + 140) == 80

# ================================ 17 October =======================================================
q(17, 1, '1', '', 'calculation', NEG, '', "<p>Fill in the box: &nbsp;□ + 2 = −1</p>",
  "<b>−3</b> &mdash; −1 − 2 = −3.", "-3|−3")
q(17, 2, '2', '', 'calculation', NEG, '', "<p>Fill in the box: &nbsp;−6 × □ = 36</p>",
  "<b>−6</b> &mdash; 36 ÷ −6 = −6, and a negative times a negative is positive.", "-6|−6")
q(17, 3, '3', '', 'short', 'Cubes & Cube Roots', '', "<p>List the first 5 cube numbers</p>",
  "<b>1, 8, 27, 64, 125</b> &mdash; 1³, 2³, 3³, 4³ and 5³.")
pre(17, '4', '', "<p>y = ¼x + 5</p>")
q(17, 4, '4', 'a', 'calculation', 'Straight Line Graphs,' + SUBS, '',
  "<p>Complete the table of values for y = ¼x + 5</p>"
  + T(['x', '−2', '−1', '0', '1', '2', '3', '4'], [['y', '', '', '', '', '', '', '']]),
  "<b>y = 4.5, 4.75, 5, 5.25, 5.5, 5.75, 6</b> &mdash; start at 5 when x = 0 and change by ¼"
  " for each step in x.")
assert [F(x, 4) + 5 for x in range(-2, 5)][0] == F(9, 2)
q(17, 5, '4', 'b', 'drawing', 'Straight Line Graphs', 'coordinate-grid',
  "<p><b>Figure:</b> a grid with x from −2 to 4 and y from −1 to 8.</p>"
  "<p>On the grid, draw the graph of y = ¼x + 5</p>",
  "<b>a straight line from (−2, 4.5) to (4, 6)</b> &mdash; plot the points from the table and"
  " join them with a ruler.", '', DRAWN)
q(17, 6, '5', '', 'short', 'Scatter Graphs & Correlation', 'scatter-graph',
  "<p><b>Figure:</b> a scatter graph of arm span (cm, 100 to 190) against height (cm, 110 to"
  " 200). The points climb steadily from about (120, 122) to (180, 188): taller people have"
  " longer arm spans.</p><p>What type of correlation does this scatter graph show?</p>",
  "<b>positive correlation</b> &mdash; as height increases, arm span increases.",
  "positive|positive correlation", 'The trend of the points was read off the rendered page.')

# ================================ 18 October =======================================================
q(18, 1, '1', '', 'calculation', 'Angles in Triangles & Quadrilaterals', 'quadrilateral',
  "<p><b>Figure:</b> a quadrilateral with interior angles 76°, 135°, 81° and x.</p><p>Find x</p>",
  "<b>x = 68°</b> &mdash; a quadrilateral's angles add to 360°, and 360 − (76 + 135 + 81) = 68.",
  "68|68°|x = 68|x=68")
assert 360 - (76 + 135 + 81) == 68
q(18, 2, '2', '', 'calculation', BEST, '',
  "<p>Three coffees cost £3.60.</p><p>What is the cost of twenty coffees?</p>",
  "<b>£24</b> &mdash; one coffee is £3.60 ÷ 3 = £1.20, and 20 × £1.20 = £24.",
  "£24|24|£24.00|24.00")
SCORES = [1, 4, 4, 2, 3, 4, 5, 1, 4, 1]
pre(18, '3', '',
  "<p>Ramy has a spinner that has sections labelled 1 to 5. He spins the spinner 10 times.</p>"
  "<p>Here are his scores. &nbsp;1 &nbsp;4 &nbsp;4 &nbsp;2 &nbsp;3 &nbsp;4 &nbsp;5 &nbsp;1 &nbsp;4"
  " &nbsp;1</p>")
q(18, 3, '3', 'a', 'calculation', 'Range', '', "<p>Work out the range.</p>",
  "<b>4</b> &mdash; 5 − 1 = 4.", "4")
q(18, 4, '3', 'b', 'calculation', 'Mode', '', "<p>Find the mode.</p>",
  "<b>4</b> &mdash; 4 comes up four times, more than any other score (1 comes up three times).", "4")
assert max(SCORES) - min(SCORES) == 4 and SCORES.count(4) == 4 and SCORES.count(1) == 3
PROBT = T(['Result', 'Win', 'Draw', 'Lose'], [['Probability', '0.6', '', '0.25']])
pre(18, '4', '', "<p>A rugby team can win, draw or lose a match. The table shows the probabilities"
    " of each result.</p>" + PROBT)
q(18, 5, '4', 'a', 'calculation', PROB, '', "<p>Calculate the missing probability in the table.</p>",
  "<b>0.15</b> &mdash; the probabilities add to 1, and 1 − 0.6 − 0.25 = 0.15.", "0.15|.15")
q(18, 6, '4', 'b', 'calculation', 'Relative Frequency & Expectation', '',
  "<p>The rugby team play 20 games. Each win is worth 5 points. Each draw is worth 2 points."
  " Each loss is worth 0 points.</p>"
  "<p>Work out how many points the rugby team should receive in one season.</p>",
  "<b>66 points</b> &mdash; expect 0.6 × 20 = 12 wins and 0.15 × 20 = 3 draws;"
  " 12 × 5 + 3 × 2 = 66.", "66|66 points")
assert 20 * F(6, 10) * 5 + 20 * F(15, 100) * 2 == 66

# ================================ 19 October =======================================================
q(19, 1, '1', '', 'short', 'Ordering Fractions,' + FDP, '',
  "<p>Arrange these numbers in order of size. Start with the smallest number.</p>"
  "<p>56% &nbsp; 11/20 &nbsp; 0.52 &nbsp; 1/2</p>",
  "<b>1/2, 0.52, 11/20, 56%</b> &mdash; as decimals 0.5, 0.52, 0.55, 0.56.")
assert sorted([F(56, 100), F(11, 20), F(52, 100), F(1, 2)]) == [F(1, 2), F(52, 100), F(11, 20), F(56, 100)]
q(19, 2, '2', '', 'calculation', LINEQ, 'shape-cross',
  "<p>Each shape represents a number. Work out the value of each shape.</p>"
  "<p><b>Figure:</b> a cross of boxes. The row holds four triangles, with a total of 76. The"
  " column holds a square, a triangle and a square, with a total of 63.</p>",
  "<b>triangle = 19, square = 22</b> &mdash; 4 triangles = 76 gives 19; then two squares are"
  " 63 − 19 = 44, so a square is 22.")
assert 76 % 4 == 0 and (63 - 76 // 4) / 2 == 22
q(19, 3, '3', '', 'calculation', 'Pie Charts,' + PCTAM, 'pie-chart',
  "<p><b>Figure:</b> a pie chart of Mr. Jenkins' salary: rent and bills 45%, other 27%, savings"
  " 17%, food 11%.</p><p>The pie chart shows information about how Mr. Jenkins spent his salary"
  " for July. He was paid £2000 in July.</p><p>Work out how much Mr. Jenkins spent on rent and"
  " bills.</p>",
  "<b>£900</b> &mdash; 45% of £2000 = 0.45 × 2000 = £900.", "£900|900|£900.00")
q(19, 4, '4', '', 'explain', PCTID + ',' + BEST, '',
  "<p>James is buying a table. He finds the same table for sale in two different shops. When"
  " buying the table, the rate of VAT was 20%.</p><p>Table World: £140, prices include VAT.<br>"
  "Tables 'R' us: £120, prices do not include VAT.</p><p>Which shop is better value?</p>",
  "<b>Table World</b> &mdash; at Tables 'R' us, £120 + 20% VAT = £144, which is more than £140.")
assert 120 * F(6, 5) == 144
q(19, 5, '5', '', 'calculation', SHARE + ',Angles in Triangles & Quadrilaterals', '',
  "<p>The angles in a triangle are in the ratio 1 : 2 : 9</p>"
  "<p>What is the size of the largest angle?</p>",
  "<b>135°</b> &mdash; 1 + 2 + 9 = 12 parts share 180°, so a part is 15° and 9 parts are 135°.",
  "135|135°")

# ================================ 20 October =======================================================
q(20, 1, '1', '', 'calculation', PERIM + ',' + SIMP, 'rectangle',
  "<p><b>Figure:</b> a rectangle with length d and width c.</p>"
  "<p>Find an expression for the perimeter of the rectangle.</p>",
  "<b>2c + 2d</b> &mdash; c + d + c + d.", "2c + 2d|2c+2d|2d + 2c|2d+2c|2(c + d)|2(c+d)")
q(20, 2, '2', '', 'calculation', NEG, '',
  "<p>Amara is playing a game. She throws 8 balls at a target, one at a time. Each hit is worth 5"
  " points. Each miss is worth −4 points. Amara hits the target with 2 of the balls and misses"
  " with the rest.</p><p>How many points does Amara score?</p>",
  "<b>−14</b> &mdash; 2 hits are 10 points and 6 misses are −24 points; 10 − 24 = −14.", "-14|−14")
assert 2 * 5 + 6 * -4 == -14
q(20, 3, '3', '', 'calculation', 'Angles in Triangles & Quadrilaterals', 'rhombus',
  "<p>Shown is a rhombus.</p><p><b>Figure:</b> a tall rhombus. The angle at the top is 23°, the"
  " angle at the bottom is x, and the angles at the left and right are y and z.</p>"
  "<p>Find angles x, y and z.</p>",
  "<b>x = 23°, y = 157°, z = 157°</b> &mdash; opposite angles of a rhombus are equal, and"
  " neighbouring angles add to 180°: 180 − 23 = 157.")
q(20, 4, '4', '', 'calculation', MEAN + ',' + NEG, '',
  T(['Day', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri'], [['Temperature', '−4°C', '1°C', '−6°C', '1°C', '−2°C']])
  + "<p>What is the mean of the temperatures recorded?</p>",
  "<b>−2°C</b> &mdash; the total is −4 + 1 − 6 + 1 − 2 = −10, and −10 ÷ 5 = −2.", "-2|−2|-2°C|−2°C")
assert sum([-4, 1, -6, 1, -2]) == -10
pre(20, '5', '', "<p>The ratio of girls to boys in a class is 2 : 3</p>")
q(20, 5, '5', 'a', 'calculation', RATIO + ',' + FRAC, '', "<p>What fraction of the class are girls?</p>",
  "<b>2/5</b> &mdash; 2 of the 2 + 3 = 5 parts are girls.", "2/5")
q(20, 6, '5', 'b', 'calculation', RATIO + ',Percentages', '', "<p>What percentage of the class are boys?</p>",
  "<b>60%</b> &mdash; 3/5 = 60%.", "60%|60")

# ================================ 21 October =======================================================
q(21, 1, '1', '', 'drawing', 'Reflections', 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x and y from −6 to 6. Triangle D has corners (−3, 0),"
  " (−3, −4) and (0, −4).</p><p>Reflect D in the y-axis</p>",
  "<b>corners at (3, 0), (3, −4) and (0, −4)</b> &mdash; change the sign of each x-coordinate.",
  '', DRAWN)
q(21, 2, '2', '', 'calculation', ORDER, '', "<p>Work out &nbsp;11 + 11 − 6<sup>2</sup> ÷ 2</p>",
  "<b>4</b> &mdash; indices first: 6² = 36, then 36 ÷ 2 = 18, and 11 + 11 − 18 = 4.", "4")
assert 11 + 11 - 6 ** 2 / 2 == 4
q(21, 3, '3', '', 'explain', 'Angles in Parallel Lines,Angles at a Point & on a Line', 'parallel-lines',
  "<p><b>Figure:</b> parallel lines BD and EG crossed by the line AH, meeting BD at C and EG at"
  " F. At F the angle between FE and FH (below the line, on the left) is 70°. The angle x is at"
  " F between FG and FC (above the line, on the right).</p>"
  "<p>Work out the size of the angle marked x. Give a reason for your answer.</p>",
  "<b>x = 70°</b> &mdash; x and the 70° angle are vertically opposite angles, which are equal.",
  '', 'Which angles are marked was read off the rendered page. The answer needs a reason, so it'
  ' has no accept.')
q(21, 4, '4', '', 'calculation', RPROB, '',
  "<p>The ratio of red sweets to yellow sweets in a bag is 4 : 5. There are 240 red sweets in the"
  " bag.</p><p>How many sweets are there altogether in the bag?</p>",
  "<b>540</b> &mdash; 240 red is 4 parts, so a part is 60 and all 9 parts are 540.", "540")

# ================================ 22 October =======================================================
q(22, 1, '1', '', 'calculation', PCTID, '',
  "<p>A vintage car was bought for £9,400. Since then the value of the car has increased by 29%.</p>"
  "<p>Calculate the value of the car.</p>",
  "<b>£12,126</b> &mdash; 9400 × 1.29 = 12126.", "£12,126|£12126|12126|12,126|£12126.00")
assert 9400 * F(129, 100) == 12126
q(22, 2, '2', '', 'calculation', 'Angles in Triangles & Quadrilaterals,Angles at a Point & on a Line',
  'isosceles-triangle',
  "<p><b>Figure:</b> an isosceles triangle (the two sloping sides are marked equal) with its base"
  " extended to the right. The exterior angle at the right-hand base corner is 123°. The angle at"
  " the top is x.</p><p>Find x</p>",
  "<b>x = 66°</b> &mdash; the base angle is 180 − 123 = 57°, both base angles are 57°, and"
  " 180 − 2 × 57 = 66.", "66|66°|x = 66|x=66")
assert 180 - 2 * (180 - 123) == 66
q(22, 3, '3', '', 'drawing', 'Translations', 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x from −6 to 6 and y from −5 to 5. Shape D is a"
  " parallelogram with corners (−2, 1), (2, 1), (1, −1) and (−3, −1).</p>"
  "<p>Translate shape D using translation vector (−3 over −2), that is, 3 left and 2 down.</p>",
  "<b>corners at (−5, −1), (−1, −1), (−2, −3) and (−6, −3)</b> &mdash; move every corner 3 left"
  " and 2 down.", '', DRAWN)
q(22, 4, '4', '', 'calculation', SHARE + ',' + RPROB, '',
  "<p>Ava and Sienna share some money in ratio 2 : 7. Sienna gets £25 more than Ava.</p>"
  "<p>How much does each girl receive?</p>",
  "<b>Ava £10, Sienna £35</b> &mdash; the difference is 7 − 2 = 5 parts = £25, so a part is £5.")

# ================================ 23 October =======================================================
q(23, 1, '1', '', 'calculation', 'Angles in Triangles & Quadrilaterals', 'isosceles-triangle',
  "<p><b>Figure:</b> an isosceles triangle whose two sloping sides are marked equal. The angle"
  " at the top is 82°; w is one of the base angles.</p><p>Find w</p>",
  "<b>w = 49°</b> &mdash; the base angles are equal: (180 − 82) ÷ 2 = 49.", "49|49°|w = 49|w=49")
assert (180 - 82) / 2 == 49
q(23, 2, '2', '', 'short', '2-D Shapes', '',
  "<p>Here is a list of quadrilaterals: kite, rectangle, rhombus, square, parallelogram.</p>"
  "<p>For the following description, choose the correct name from the list.</p>"
  "<p>All four sides are the same length. There are no right angles.</p>",
  "<b>rhombus</b> &mdash; a square also has four equal sides, but it has right angles.",
  "rhombus|a rhombus")
q(23, 3, '3', '', 'calculation', AREA2, 'trapezium',
  "<p><b>Figure (not to scale):</b> a trapezium with parallel sides 9cm and 15cm and"
  " perpendicular height 4cm.</p><p>Calculate the area of the trapezium.</p>",
  "<b>48 cm²</b> &mdash; ½ × (9 + 15) × 4 = 48.", "48|48 cm2|48cm2|48 cm^2")
q(23, 4, '4', '', 'short', 'Listing Outcomes & Sample Space', '',
  "<p>Ben rolls a dice and flips a coin. He could get a Tail and a 1 (T1).</p>"
  "<p>Write a list of all the other possible outcomes.</p>",
  "<b>T2, T3, T4, T5, T6, H1, H2, H3, H4, H5, H6</b> &mdash; each of the 2 coin sides with each"
  " of the 6 dice numbers is 12 outcomes, and T1 is already given.")
q(23, 5, '5', '', 'explain', 'Sampling', '',
  "<p>Is time taken to read a book discrete or continuous data? Give a reason for your answer.</p>",
  "<b>Continuous</b> &mdash; time is measured, and it can take any value (not just whole"
  " numbers).")

# ================================ 24 October =======================================================
pre(24, '1', '', "<p>55% of students in a school have a locker.</p>")
q(24, 1, '1', 'a', 'calculation', FDP, '', "<p>What fraction of students <b>do not</b> have a locker?</p>",
  "<b>9/20</b> &mdash; 100% − 55% = 45% = 45/100 = 9/20.", "9/20|45/100")
q(24, 2, '1', 'b', 'calculation', PCTAM, '',
  "<p>There are 300 students in the school. How many students have a locker?</p>",
  "<b>165</b> &mdash; 55% of 300 = 0.55 × 300 = 165.", "165")
assert 300 * F(55, 100) == 165
q(24, 3, '2', '', 'calculation', 'Cubes & Cube Roots', '', "<p>Work out &nbsp;∛64</p>",
  "<b>4</b> &mdash; 4 × 4 × 4 = 64.", "4")
q(24, 4, '3', '', 'calculation', 'Compound Measures', '',
  "<p>The distance between two cities is 2898 miles. The plane journey took 6 hours.</p>"
  "<p>Calculate the average speed of the plane.</p>",
  "<b>483 mph</b> &mdash; speed = distance ÷ time = 2898 ÷ 6 = 483.", "483|483 mph|483mph")
assert 2898 / 6 == 483
DIFF = [[abs(a - b) for a in range(1, 7)] for b in range(1, 7)]
pre(24, '4', '',
  "<p>Two fair six-sided dice are rolled. The score is the <b>difference</b> between the numbers"
  " on each dice.</p>")
q(24, 5, '4', 'a', 'calculation', 'Listing Outcomes & Sample Space', '',
  "<p>Complete the table to show all possible scores.</p>"
  + T(['Dice 2 \\ Dice 1', '1', '2', '3', '4', '5', '6'],
      [['1', '0', '1', '', '', '', ''], ['2', '1', '', '', '', '', ''], ['3', '2', '', '', '', '', ''],
       ['4', '', '', '', '', '', ''], ['5', '', '', '', '', '', ''], ['6', '', '', '', '', '', '']]),
  "<b>" + '; '.join(' '.join(map(str, r)) for r in DIFF) + "</b> &mdash; each row is Dice 2"
  " = 1 to 6, each entry the larger number minus the smaller.")
q(24, 6, '4', 'b', 'calculation', PROB, '', "<p>Find the probability of scoring a 2</p>",
  "<b>8/36 = 2/9</b> &mdash; a difference of 2 appears in 8 of the 36 cells.", "2/9|8/36")
assert sum(r.count(2) for r in DIFF) == 8
q(24, 7, '4', 'c', 'calculation', PROB, '', "<p>Find the probability of scoring a number less than 3</p>",
  "<b>24/36 = 2/3</b> &mdash; 6 zeros, 10 ones and 8 twos make 24 of the 36 cells.", "2/3|24/36")
assert sum(1 for r in DIFF for v in r if v < 3) == 24

# ================================ 25 October =======================================================
q(25, 1, '1', '', 'calculation', FDP, '', "<p>Write 0.205 as a fraction</p>",
  "<b>41/200</b> (205/1000) &mdash; 0.205 = 205/1000, which simplifies to 41/200.",
  "41/200|205/1000")
assert F(205, 1000) == F(41, 200)
q(25, 2, '2', '', 'calculation', FDP, '', "<p>Write 0.205 as a percentage</p>",
  "<b>20.5%</b> &mdash; 0.205 × 100 = 20.5.", "20.5%|20.5")
pre(25, '3', 'frequency-tree',
  "<p>There are 120 students in year 11. 45 of the students are female. 27 of the male students"
  " studied French. 18 of the female students did not study French.</p>"
  "<p><b>Figure:</b> a blank frequency tree: 120 splits into male and female, and each of those"
  " splits into studied French and did not study French.</p>")
q(25, 3, '3', 'a', 'written', 'Charts & Diagrams', 'frequency-tree', "<p>Complete the frequency tree</p>",
  "<b>male 75 (French 27, not 48); female 45 (French 27, not 18)</b> &mdash; 120 − 45 = 75,"
  " 75 − 27 = 48 and 45 − 18 = 27.")
q(25, 4, '3', 'b', 'calculation', PROB, '',
  "<p>A student is picked at random. Write down the probability that the student studies French.</p>",
  "<b>54/120 = 9/20</b> &mdash; 27 + 27 = 54 of the 120 students study French.",
  "9/20|54/120|0.45|45%")
assert F(27 + (45 - 18), 120) == F(9, 20)
q(25, 5, '4', '', 'calculation', ADDFR, '', "<p>Work out &nbsp;3/7 + 1/5</p>",
  "<b>22/35</b> &mdash; 15/35 + 7/35 = 22/35.", "22/35")
assert F(3, 7) + F(1, 5) == F(22, 35)
q(25, 6, '5', '', 'calculation', MULFR, '', "<p>Work out &nbsp;3/7 × 1/5</p>",
  "<b>3/35</b> &mdash; multiply the tops and the bottoms.", "3/35")
q(25, 7, '6', '', 'explain', BEST, '',
  "<p>Which is better value for money?</p><p>0.9 grams of gold costs $38.20, or 6.5 grams of gold"
  " for $270</p>",
  "<b>6.5 grams for $270</b> &mdash; that is $270 ÷ 6.5 ≈ $41.54 a gram, against $38.20 ÷ 0.9 ≈"
  " $42.44 a gram.")
assert F(270) / F(65, 10) < F(3820, 100) / F(9, 10)

# ================================ 26 October =======================================================
q(26, 1, '1', '', 'calculation', UNITS, '',
  "<p>There are 14 children at a birthday party. There are 8 litres of lemonade at the beginning"
  " of the party. Each child drank 280 millilitres of lemonade.</p><p>How much lemonade is left?</p>",
  "<b>4.08 litres</b> (4080 ml) &mdash; 14 × 280 = 3920ml, and 8000 − 3920 = 4080ml.",
  "4.08 litres|4.08|4080 ml|4080ml|4080|4.08 l|4.08l")
assert 8000 - 14 * 280 == 4080
q(26, 2, '2', '', 'calculation', 'Angles in Triangles & Quadrilaterals,Angles at a Point & on a Line',
  'triangle',
  "<p><b>Figure:</b> a triangle standing on a straight line, with its right-hand side extended"
  " beyond the top corner. At the left-hand base corner the angle outside the triangle, on the"
  " line, is 154°. At the right-hand base corner the angle outside the triangle, on the line, is"
  " 73°. x is the angle at the top corner between the extended side and the triangle's left"
  " side (outside the triangle).</p><p>Find the size of angle x</p>",
  "<b>x = 133°</b> &mdash; the base angles inside are 180 − 154 = 26° and 180 − 73 = 107°; an"
  " exterior angle equals the sum of the two opposite interior angles, 26 + 107 = 133.",
  "133|133°|x = 133|x=133", 'Which side of each vertex the angles are marked on was read off the'
  ' rendered page.')
assert (180 - 154) + (180 - 73) == 133
q(26, 3, '3', '', 'calculation', RPROB, '',
  "<p>Ella takes part in an archery lesson. For every 4 arrows fired, only 3 hit the target."
  " Altogether Ella hit the target 24 times.</p><p>Work out how many arrows Ella fired.</p>",
  "<b>32</b> &mdash; 24 hits is 8 lots of 3, so she fired 8 × 4 = 32 arrows.", "32")
WORDS = [3, 4, 2, 6, 2, 4, 3, 7, 3, 6]
pre(26, '4', '',
  "<p>Hannah is recording the number of letters in each word in an article. These are the first"
  " ten lengths.</p><p>3 &nbsp;4 &nbsp;2 &nbsp;6 &nbsp;2 &nbsp;4 &nbsp;3 &nbsp;7 &nbsp;3 &nbsp;6</p>")
q(26, 4, '4', 'a', 'calculation', MEAN, '', "<p>Work out the mean.</p>",
  "<b>4</b> &mdash; the total is 40, and 40 ÷ 10 = 4.", "4")
assert sum(WORDS) == 40
q(26, 5, '4', 'b', 'explain', MEAN, '',
  "<p>The 11th word has 3 letters.</p><p>Tick the box which describes what affect this will have"
  " on the mean: the mean will decrease / the mean will remain the same / the mean will"
  " increase.</p>",
  "<b>the mean will decrease</b> &mdash; 3 is below the mean of 4 (the new mean is 43 ÷ 11 ≈ 3.9).")

# ================================ 27 October =======================================================
DATA27 = [4, 5, 5, 5, 6, 6, 7, 8, 9, 9]
pre(27, '1', '', "<p>4 &nbsp;5 &nbsp;5 &nbsp;5 &nbsp;6 &nbsp;6 &nbsp;7 &nbsp;8 &nbsp;9 &nbsp;9</p>")
q(27, 1, '1', 'a', 'calculation', 'Range', '', "<p>Find the range.</p>",
  "<b>5</b> &mdash; 9 − 4 = 5.", "5")
q(27, 2, '1', 'b', 'calculation', 'Mode', '', "<p>Write down the mode.</p>",
  "<b>5</b> &mdash; 5 appears three times, more than any other value.", "5")
q(27, 3, '1', 'c', 'calculation', 'Median', '', "<p>Find the median.</p>",
  "<b>6</b> &mdash; the 5th and 6th values are both 6.", "6")
assert (DATA27[4] + DATA27[5]) / 2 == 6 and DATA27.count(5) == 3
q(27, 4, '2', '', 'calculation', RPROB, '',
  "<p>Marcel has three times as many marbles as Klaudia. Tomas has four times as many marbles as"
  " Klaudia. Marcel has 12 marbles.</p><p>How many marbles does Tomas have?</p>",
  "<b>16</b> &mdash; Klaudia has 12 ÷ 3 = 4, so Tomas has 4 × 4 = 16.", "16")
q(27, 5, '3', '', 'calculation', FRAM + ',Equivalent & Simplifying Fractions', '',
  "<p>Finley is saving money towards a new motorbike that costs £4,000. He saves £50 each month.</p>"
  "<p>Work out what fraction of the total cost he saved over the first year of saving. Give your"
  " answer in its simplest form.</p>",
  "<b>3/20</b> &mdash; 12 × £50 = £600, and 600/4000 = 3/20.")
assert F(12 * 50, 4000) == F(3, 20)
q(27, 6, '4', '', 'calculation', 'Function Machines,' + LINEQ, 'function-machine',
  "<p><b>Figure:</b> a function machine: input → × 3 → − 8 → output.</p>"
  "<p>The input is the same as the output. Find the input.</p>",
  "<b>4</b> &mdash; 3x − 8 = x gives 2x = 8, so x = 4 (check: 4 × 3 − 8 = 4).", "4")
q(27, 7, '5', '', 'calculation', EXPND, '', "<p>Expand &nbsp;2(3w − 5y)</p>",
  "<b>6w − 10y</b> &mdash; multiply each term by 2.", "6w - 10y|6w-10y|6w − 10y")
q(27, 8, '6', '', 'calculation', EXPND, '', "<p>Expand &nbsp;2w(3w² − 5)</p>",
  "<b>6w³ − 10w</b> &mdash; 2w × 3w² = 6w³ and 2w × −5 = −10w.",
  "6w^3 - 10w|6w^3-10w|6w³ − 10w|6w³-10w")

# ================================ 28 October =======================================================
q(28, 1, '1', '', 'calculation', 'Formulae', '',
  "<p>William is y years old. Eoin is four years older than William.</p>"
  "<p>Write an expression for Eoin's age.</p>",
  "<b>y + 4</b> &mdash; add 4 to William's age.", "y + 4|y+4|4 + y|4+y")
q(28, 2, '2', '', 'calculation', LINEQ, '',
  "<p>Three consecutive numbers have a <b>sum</b> of 21.</p><p>What are the three numbers?</p>",
  "<b>6, 7 and 8</b> &mdash; the middle number is 21 ÷ 3 = 7.")
pre(28, '3', '', "<p>3 &nbsp;9 &nbsp;11 &nbsp;33</p>")
q(28, 3, '3', 'a', 'calculation', 'Range', '', "<p>Find the range.</p>",
  "<b>30</b> &mdash; 33 − 3 = 30.", "30")
q(28, 4, '3', 'b', 'calculation', 'Median', '', "<p>Find the median.</p>",
  "<b>10</b> &mdash; halfway between the middle two values, 9 and 11.", "10")
q(28, 5, '4', '', 'calculation', 'Compound Measures', '',
  "<p>Joshua drives 180km. It takes 2 hours 30 minutes.</p><p>Work out his speed.</p>",
  "<b>72 km/h</b> &mdash; 2 hours 30 minutes is 2.5 hours, and 180 ÷ 2.5 = 72.",
  "72|72 km/h|72km/h|72 kmh|72 kph")
assert 180 / F(5, 2) == 72
q(28, 6, '5', '', 'calculation', NTH, '',
  "<p>Write down the nth term for this sequence</p><p>11, &nbsp;8, &nbsp;5, &nbsp;2, ...</p>",
  "<b>14 − 3n</b> &mdash; it goes down in 3s, and 11 + 3 = 14.",
  "14 - 3n|14-3n|-3n + 14|-3n+14|14 − 3n")
assert [14 - 3 * n for n in range(1, 5)] == [11, 8, 5, 2]

# ================================ 29 October =======================================================
PIE = ('The angles were read off the rendered page: bus is marked with a right-angle square (90°),'
       ' and 70° + 80° + 120° + 90° = 360°.')
pre(29, '1', 'pie-chart',
  "<p>The pie chart shows how a group of students travel to school.</p><p><b>Figure:</b> a pie"
  " chart with four sectors: bus 90° (marked as a right angle), cycle 70°, car 80° and walk"
  " 120°.</p>", PIE)
assert 90 + 70 + 80 + 120 == 360
q(29, 1, '1', 'a', 'short', 'Pie Charts', 'pie-chart',
  "<p>What is the most popular method for students to travel to school?</p>",
  "<b>walk</b> &mdash; it has the largest angle, 120°.", "walk|walking", PIE)
q(29, 2, '1', 'b', 'calculation', 'Pie Charts,' + FRAC, 'pie-chart',
  "<p>What fraction of students walk to school?</p>",
  "<b>1/3</b> &mdash; 120/360 = 1/3.", "1/3|120/360", PIE)
q(29, 3, '2', '', 'calculation', VOLSA, 'cube',
  "<p><b>Figure:</b> a cube with every edge 5cm.</p>"
  "<p>Work out the surface area of the cube. State the units of your answer.</p>",
  "<b>150 cm²</b> &mdash; six faces, each 5 × 5 = 25cm²: 6 × 25 = 150.",
  "150 cm2|150cm2|150 cm²|150cm²|150 cm^2")
q(29, 4, '3', '', 'written', 'Averages & Range', '',
  "<p>Shown below are five cards which are arranged in order from smallest to largest. The first"
  " card is 5 and the other four are blank.</p><p>The range of the cards is 9. The median of the"
  " cards is 10. The mean of the cards is 9.</p><p>Work out the 4 missing numbers.</p>",
  "<b>5, 5, 10, 11, 14 or 5, 6, 10, 10, 14</b> &mdash; the range makes the largest 14, the"
  " median makes the middle 10, and a mean of 9 makes the total 45, so the second and fourth"
  " cards add to 45 − 29 = 16 with the second between 5 and 10 and the fourth between 10 and 14:"
  " 5 + 11 or 6 + 10.", '',
  'The three conditions allow two sets of cards (5, 5, 10, 11, 14 and 5, 6, 10, 10, 14), so'
  ' either is correct and this is left for a person to mark.')
SOLS = [(a, 16 - a) for a in range(5, 11) if 10 <= 16 - a <= 14]
assert SOLS == [(5, 11), (6, 10)]
COINS = [2, 5, 10, 20, 50, 100, 200]
q(29, 5, '4', '', 'short', PCTAM, '',
  "<p>Jack has some coins: 2p, 5p, 10p, 20p, 50p, £1, £2. He gives two coins to Andrew. One coin"
  " is 20% of the other.</p><p>List all the possible pairs of coins Jack could give Andrew.</p>",
  "<b>2p and 10p; 10p and 50p; 20p and £1</b> &mdash; 20% is one fifth, so the larger coin must be"
  " five times the smaller.")
assert [(a, b) for a in COINS for b in COINS if 5 * a == b] == [(2, 10), (10, 50), (20, 100)]

# ================================ 30 October =======================================================
pre(30, '1', '',
  "<p>Amie sells cars. She is paid £9 an hour and is paid a £50 bonus for each car sold.</p>")
q(30, 1, '1', 'a', 'calculation', 'Formulae', '',
  "<p>One week, Amie worked for 6 hours and sold 3 cars.</p><p>How much was her pay?</p>",
  "<b>£204</b> &mdash; 6 × £9 = £54 and 3 × £50 = £150; 54 + 150 = 204.", "£204|204|£204.00")
q(30, 2, '1', 'b', 'calculation', 'Formulae', '',
  "<p>The next week, Amie was paid £295.</p>"
  "<p>How many hours did she work and how many cars did she sell?</p>",
  "<b>5 hours and 5 cars</b> &mdash; 295 − 50 × cars must divide by 9: only 295 − 250 = 45 = 9 × 5"
  " works.")
assert [(h, c) for c in range(10) for h in range(40) if 9 * h + 50 * c == 295] == [(5, 5)]
PROD = [[a * b for a in range(1, 7)] for b in range(1, 7)]
pre(30, '2', '',
  "<p>Two fair six sided dice are rolled. The numbers on the two dice are <b>multiplied</b>"
  " together to give a score.</p>")
q(30, 3, '2', 'a', 'calculation', 'Listing Outcomes & Sample Space', '',
  "<p>Complete the table</p>"
  + T(['× (Dice 2 \\ Dice 1)', '1', '2', '3', '4', '5', '6'],
      [[str(b)] + [''] * 6 for b in range(1, 7)]),
  "<b>" + '; '.join(' '.join(map(str, r)) for r in PROD) + "</b> &mdash; each row is Dice 2"
  " = 1 to 6, each entry the two numbers multiplied.")
q(30, 4, '2', 'b', 'calculation', PROB, '', "<p>Find the probability of a score of 8</p>",
  "<b>2/36 = 1/18</b> &mdash; only 2 × 4 and 4 × 2 give 8.", "1/18|2/36")
q(30, 5, '2', 'c', 'calculation', PROB, '', "<p>Find the probability of a score of 8 or more</p>",
  "<b>22/36 = 11/18</b> &mdash; 22 of the 36 cells are 8 or more.", "11/18|22/36")
assert sum(r.count(8) for r in PROD) == 2 and sum(v >= 8 for r in PROD for v in r) == 22
q(30, 6, '3', '', 'calculation', NTH, '',
  "<p>14, &nbsp;17, &nbsp;20, &nbsp;23, ...</p><p>Work out the nth term and 100th term</p>",
  "<b>3n + 11; the 100th term is 311</b> &mdash; it goes up in 3s and 14 − 3 = 11;"
  " 3 × 100 + 11 = 311.")
assert [3 * n + 11 for n in (1, 2, 3, 4, 100)] == [14, 17, 20, 23, 311]

# ================================ 31 October =======================================================
q(31, 1, '1', '', 'calculation', 'HCF & LCM', '',
  "<p>A blue light flashes every 6 seconds. A green light flashes every 8 seconds. They have both"
  " flashed at the same time.</p><p>After how many seconds will they both flash at the same"
  " time?</p>",
  "<b>24 seconds</b> &mdash; the lowest common multiple of 6 and 8 is 24.", "24|24 seconds")
q(31, 2, '2', '', 'short', ORDER, '',
  "<p>Put brackets in the following statement to make it true.</p><p>4 + 3 × 7 − 1 = 42</p>",
  "<b>(4 + 3) × (7 − 1) = 42</b> &mdash; 7 × 6 = 42.")
assert (4 + 3) * (7 - 1) == 42
q(31, 3, '3', '', 'calculation', FRAM + ',' + PCTID, '',
  "<p>Alisha buys 200 books costing £3 each. She sells 2/5 of the books at £8 each.</p>"
  "<p>Alisha then reduces the price of the remaining books by 25%. She then sells some of the"
  " remaining books. Alisha makes £490 profit.</p>"
  "<p>Work out how many books Alisha did <b>not</b> sell.</p>",
  "<b>45</b> &mdash; the books cost 200 × £3 = £600, so she took £1090. 2/5 of 200 = 80 sold at £8"
  " is £640; the other £450 came from books at £8 × 0.75 = £6, which is 75 books; 120 − 75 = 45.",
  "45")
assert 200 * 3 + 490 - 80 * 8 == 450 and 450 / 6 == 75 and 200 - 80 - 75 == 45
q(31, 4, '4', '', 'short', 'Straight Line Graphs', 'coordinate-grid',
  "<p><b>Figure:</b> a grid with x and y from −4 to 4. A horizontal line is drawn through y = −2.</p>"
  "<p>Write down the equation of the line shown.</p>",
  "<b>y = −2</b> &mdash; every point on the horizontal line has y-coordinate −2.",
  "y = -2|y=-2|y = −2|y=−2", 'The line was read off the rendered page.')
