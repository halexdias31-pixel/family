"""Corbettmaths Foundation 5-a-day — August. See common.py and tools/insert-cbm-5ad-jan-FP.py.

Every page was rendered and read, because the text layer drops the column vectors, the fractions,
the indices and every number printed inside a picture. The August book is laid out as a grid of
cells rather than five full-width rows: `pos` counts the cells in reading order (left to right, top
to bottom), and a cell that continues its neighbour's context is part (b) of one question sharing a
`pre` stem. Corbettmaths prints no answers, so every answer is worked out from the transcribed
question, with Fraction arithmetic and asserts where there is arithmetic to check.
"""
import pathlib, sys
from fractions import Fraction as F
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from common import Month, T, NO_SCHEME
MONTH = Month(8, '12gWLCXFXhLB8N5KVddqc-_UByzmFVvPD')
q, pre = MONTH.q, MONTH.pre

LINEQ = 'Linear Equations'
RATIO = 'Writing & Simplifying Ratio'
RPROB = 'Ratio Problems'
SHARE = 'Sharing in a Ratio'
VOLSA = 'Volume & Surface Area'
TRANS = 'Translations'
AREA2 = 'Area of 2-D Shapes'
PCTID = 'Percentage Increase & Decrease'
PERIM = 'Perimeter'
SCAT  = 'Scatter Graphs & Correlation'
FRAC  = 'Fractions'
DRAWN = ('The picture is described in words from the rendered page; the answer is a drawing, so it'
         ' is left for a person to mark.')

# ================================ 1 August =========================================================
q(1, 1, '1', '', 'drawing', TRANS, 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x from −6 to 6 and y from −5 to 5. A right-angled"
  " triangle has its corners at (1, 0), (4, 0) and (1, 3).</p>"
  "<p>Translate the triangle by the translation vector (−5 over −2), that is, 5 left and 2 down.</p>",
  "<b>corners at (−4, −2), (−1, −2) and (−4, 1)</b> &mdash; move every corner 5 to the left and"
  " 2 down.", '', DRAWN)
q(1, 2, '2', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;6x − 10 = 8</p>",
  "<b>x = 3</b> &mdash; add 10 to get 6x = 18, then divide by 6.", "x = 3|x=3|3")
q(1, 3, '3', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;8 − x = 2</p>",
  "<b>x = 6</b> &mdash; 8 − 6 = 2, so x = 6.", "x = 6|x=6|6")
pre(1, '4', '', "<p>The ratio of red beads to white beads on a necklace is 2:1.</p>")
q(1, 4, '4', 'a', 'calculation', RATIO + ',' + FRAC, '', "<p>What fraction of the beads are white?</p>",
  "<b>1/3</b> &mdash; there are 2 + 1 = 3 parts and 1 of them is white.", "1/3")
q(1, 5, '4', 'b', 'calculation', RPROB, '', "<p>There are 42 red beads. How many beads are there in total?</p>",
  "<b>63</b> &mdash; 42 red beads are 2 parts, so one part is 21 and the 3 parts are 63.", "63")
q(1, 6, '5', '', 'calculation', VOLSA, 'prism',
  "<p><b>Figure:</b> a triangular prism 11cm long. Its cross-section is a right-angled triangle"
  " whose two shorter sides, either side of the right angle, are 4cm and 10cm.</p>"
  "<p>Calculate the volume of this prism.</p>",
  "<b>220 cm³</b> &mdash; the triangle's area is ½ × 4 × 10 = 20 cm², and 20 × 11 = 220.",
  "220|220 cm3|220cm3|220 cm³", "The dimensions were read off the rendered drawing.")
assert F(1, 2) * 4 * 10 * 11 == 220


MULDF = 'Multiplying & Dividing Fractions'
# ================================ 2 August =========================================================
q(2, 1, '1', '', 'calculation', AREA2, 'parallelogram',
  "<p><b>Figure:</b> a parallelogram with base y and a perpendicular height of 6cm.</p>"
  "<p>The area of the parallelogram is 72cm². Find y.</p>",
  "<b>y = 12 cm</b> &mdash; area = base × height, so y = 72 ÷ 6.", "12|y = 12|y=12|12cm|12 cm")
q(2, 2, '2', '', 'calculation', PCTID, '',
  "<p>Andy earns £300 per week.</p><p>He is awarded a pay rise of 40%.</p><p>What is his new wage?</p>",
  "<b>£420</b> &mdash; 40% of 300 is 120, and 300 + 120 = 420.", "420|£420")
q(2, 3, '3', '', 'calculation', SHARE, '', "<p>Share 4000 in the ratio 3:5</p>",
  "<b>1500 : 2500</b> &mdash; 3 + 5 = 8 parts, so one part is 500; 3 × 500 and 5 × 500.",
  "1500 : 2500|1500 and 2500")
q(2, 4, '4', '', 'calculation', MULDF, '', "<p>Work out &nbsp;<sup>4</sup>&frasl;<sub>5</sub> ÷ <sup>5</sup>&frasl;<sub>6</sub></p>",
  "<b>24/25</b> &mdash; flip the second fraction and multiply: 4/5 × 6/5 = 24/25.", "24/25")
q(2, 5, '5', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;7(2y + 3) = 140</p>",
  "<b>y = 8.5</b> &mdash; divide by 7 to get 2y + 3 = 20, so 2y = 17.", "y = 8.5|y=8.5|8.5|17/2")
assert F(4, 5) / F(5, 6) == F(24, 25) and F(140, 7) == 20

TERM  = 'Term-to-Term Rules'
# ================================ 3 August =========================================================
q(3, 1, '1', '', 'calculation', 'Subtraction,Division', '',
  "<p>The depth of a river is 160cm and each day it falls by 3cm.</p>"
  "<p>After how many days will the depth of the river fall to 124cm?</p>",
  "<b>12 days</b> &mdash; it has to fall 160 − 124 = 36cm, and 36 ÷ 3 = 12.", "12|12 days")
assert (160 - 124) / 3 == 12
q(3, 2, '2', 'a', 'calculation', PERIM, 'rectangle',
  "<p><b>Figure:</b> a rectangle 7cm tall and 3cm wide.</p><p>Calculate the perimeter of the rectangle.</p>",
  "<b>20 cm</b> &mdash; 7 + 3 + 7 + 3.", "20|20cm|20 cm")
q(3, 3, '2', 'b', 'calculation', PERIM, '',
  "<p>The rectangle (7cm tall, 3cm wide) is folded vertically.</p><p>Calculate the perimeter of the new rectangle.</p>",
  "<b>17 cm</b> &mdash; folding along a vertical line halves the width to 1.5cm, so 7 + 1.5 + 7 + 1.5 = 17.",
  '', 'No accept: "folded vertically" is read here as a fold along a vertical line (width halved,'
  ' 17cm); a student who halves the height instead gets 13cm, so a person should mark it. ' + NO_SCHEME)
pre(3, '3', '', "<p>The table shows the ages and cost of 8 second hand cars.</p>" + T(
    ['Age, years', '4', '7', '2', '4', '1', '9', '3', '6'],
    [['Cost, £', '6000', '3000', '7500', '5000', '8000', '1500', '6000', '4000']]))
q(3, 4, '3', 'a', 'drawing', SCAT, 'grid-blank',
  "<p>Plot the data on the scatter graph.</p><p>(The graph has Age (years) from 0 to 10 along the"
  " bottom and Cost from £0 to £8000 up the side.)</p>",
  "<b>eight crosses</b> at (4, 6000), (7, 3000), (2, 7500), (4, 5000), (1, 8000), (9, 1500),"
  " (3, 6000) and (6, 4000).", '', DRAWN)
q(3, 5, '3', 'b', 'explain', SCAT, '',
  "<p>Describe the relationship between the age of the cars and the cost.</p>",
  "<b>negative correlation</b> &mdash; the older the car, the less it costs.")

SIMPL = 'Simplifying & Collecting Terms'
MEDIAN = 'Median'
SLG   = 'Straight Line Graphs'
CDEC  = 'Calculating with Decimals'
OPEN  = 'The question has more than one right answer, so it is left for a person to mark.'
# ================================ 4 August =========================================================
q(4, 1, '1', '', 'short', PERIM + ',' + SIMPL, 'triangle',
  "<p>Shown below is an isosceles triangle.</p><p><b>Figure:</b> a triangle whose two equal"
  " sloping sides are each marked f (with a dash on each to show they are equal) and whose base"
  " is g.</p><p>Write an expression for the perimeter.</p>",
  "<b>2f + g</b> &mdash; two sides of f and one of g.", "2f + g|g + 2f|f + f + g")
q(4, 2, '2', '', 'short', MEDIAN, '',
  "<p>The median of five numbers is 7.</p><p>Four of the numbers are 2, 7, 8 and 9.</p>"
  "<p>Write down a possible value of the fifth number.</p>",
  "<b>any number 7 or less</b>, e.g. 5 &mdash; in order the five must have 7 in the middle, so the"
  " missing number goes below the 7.", '', OPEN)
pre(4, '3', 'grid-blank', "<p>The table is for y = 3x + 1, and a grid has x from −1 to 2 and y from −3 to 7.</p>")
q(4, 3, '3', 'a', 'calculation', SLG, 'table-blank',
  "<p>Complete the table for y = 3x + 1</p>" + T(['x', '−1', '0', '1', '2'], [['y', '', '', '', '']]),
  "<b>y = −2, 1, 4, 7</b> &mdash; 3 × x + 1 for x = −1, 0, 1, 2.", '',
  'Four values in one box, so no accept.')
q(4, 4, '3', 'b', 'drawing', SLG, 'grid-blank', "<p>Draw the graph y = 3x + 1 on the grid.</p>",
  "<b>a straight line</b> through (−1, −2), (0, 1), (1, 4) and (2, 7).", '', DRAWN)
q(4, 5, '4', '', 'calculation', CDEC, '', "<p>Work out 3.4 × 8.25</p>",
  "<b>28.05</b> &mdash; 34 × 825 = 28050, and there are three decimal places in the question.", "28.05")
assert F('3.4') * F('8.25') == F('28.05')

TWOD  = '2-D Shapes'
COORD = 'Coordinates'
CMEAS = 'Compound Measures'
ANGPY = 'Angles in Polygons'
MIXED = 'Mixed Numbers'
# ================================ 5 August =========================================================
q(5, 1, '1', '', 'short', SIMPL, '', "<p>Simplify &nbsp;3a + 3a + 3a</p>",
  "<b>9a</b> &mdash; three lots of 3a.", "9a")
q(5, 2, '2', '', 'short', SIMPL, '', "<p>Simplify &nbsp;a × a</p>",
  "<b>a<sup>2</sup></b> &mdash; a number times itself is its square.", "a^2|a²")
pre(5, '3', 'kite', "<p><b>Figure:</b> a kite ABCD. A is on the left, B at the top, C on the right"
    " and D at the bottom; AB and BC are the two short sides and AD and CD the two long ones, so the"
    " angle at B is wide (obtuse) and the angle at D is narrow.</p>",
    'The shape was read off the rendered drawing; no angles or lengths are printed.')
q(5, 3, '3', 'a', 'short', TWOD, '', "<p>Is AB perpendicular to BC?</p>",
  "<b>No</b> &mdash; the angle at B is obtuse (more than 90°), so AB and BC do not meet at a right angle.",
  "No")
q(5, 4, '3', 'b', 'short', TWOD, '', "<p>Does Angle B = Angle D?</p>",
  "<b>No</b> &mdash; in a kite the equal pair are the angles between the unequal sides, A and C;"
  " here B is obtuse and D is acute.", "No")
q(5, 5, '4', '', 'calculation', COORD, '',
  "<p>Work out the midpoint of AB, if</p><p>A is the coordinate (5, 1)<br>B is the coordinate (9, 12)</p>",
  "<b>(7, 6.5)</b> &mdash; halfway between each pair: (5 + 9) ÷ 2 = 7 and (1 + 12) ÷ 2 = 6.5.",
  "(7, 6.5)|7, 6.5")
q(5, 6, '5', '', 'calculation', CMEAS + ',' + MIXED, '',
  "<p>Mary cycles at 20mph for 1¾ hours.</p><p>How far does she cycle?</p>",
  "<b>35 miles</b> &mdash; distance = speed × time = 20 × 1.75.", "35|35 miles")
q(5, 7, '6', '', 'calculation', ANGPY, 'polygons',
  "<p><b>Figure:</b> a regular hexagon and a regular pentagon sharing one edge. The angle y is at"
  " one end of the shared edge, in the gap outside both shapes between a side of the hexagon and a"
  " side of the pentagon.</p><p>Shown is a regular hexagon and regular pentagon. Find y.</p>",
  "<b>132°</b> &mdash; the interior angles are 120° (hexagon) and 108° (pentagon), and the angles"
  " round the point make 360°: 360 − 120 − 108 = 132.", "132|132°")
assert F(20) * F(7, 4) == 35 and 360 - 120 - 108 == 132

SUBST = 'Substitution'
NTH   = 'nth Term of a Linear Sequence'
EXPND = 'Expanding Brackets'
ROT   = 'Rotations'
# ================================ 6 August =========================================================
q(6, 1, '1', '', 'short', PERIM + ',' + EXPND, 'triangle',
  "<p><b>Figure:</b> an equilateral triangle with one side labelled 3x − 2.</p>"
  "<p>Shown is an equilateral triangle. Write an expression for the perimeter.</p>",
  "<b>9x − 6</b> &mdash; three equal sides: 3(3x − 2) = 9x − 6.", "9x - 6|3(3x - 2)")
q(6, 2, '2', '', 'calculation', SUBST, '', "<p>v = u + 10t</p><p>Find v if u = 3 and t = 5</p>",
  "<b>v = 53</b> &mdash; 3 + 10 × 5 = 3 + 50.", "53|v = 53")
pre(6, '3', '', "<p>13 &nbsp; 18 &nbsp; 23 &nbsp; 28 &nbsp; …</p>")
q(6, 3, '3', 'a', 'short', NTH, '', "<p>Work out the nth term.</p>",
  "<b>5n + 8</b> &mdash; it goes up in 5s, and 5 × 1 + 8 = 13.", "5n + 8|8 + 5n")
q(6, 4, '3', 'b', 'calculation', NTH, '', "<p>Work out the 40th term.</p>",
  "<b>208</b> &mdash; 5 × 40 + 8.", "208")
assert [5 * n + 8 for n in (1, 2, 3, 4, 40)] == [13, 18, 23, 28, 208]
q(6, 5, '4', '', 'drawing', ROT, 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x from −6 to 6 and y from −5 to 5. A right-angled"
  " triangle has its corners at (1, 0), (4, 0) and (1, 3).</p>"
  "<p>Rotate the triangle 90 degrees anticlockwise about the coordinates (−1, 0).</p>",
  "<b>corners at (−1, 2), (−1, 5) and (−4, 2)</b> &mdash; about (−1, 0), each point (x, y) goes to"
  " (−1 − y, x + 1).", '', DRAWN)

FDP   = 'Fraction Decimal Percentage Conversion'
FOFA  = 'Fractions of an Amount'
MEAN  = 'Mean'
REVMN = 'Reverse Mean'
# ================================ 7 August =========================================================
q(7, 1, '1', '', 'short', FDP, '', "<p>Write 35% as a decimal.</p>",
  "<b>0.35</b> &mdash; 35 ÷ 100.", "0.35")
q(7, 2, '2', '', 'calculation', FOFA, '',
  "<p>There are 135 pupils in Year 10 at a school.</p><p><sup>2</sup>&frasl;<sub>5</sub> of these"
  " students travel by bus to school.</p><p>How many students in Year 10 do not travel by bus?</p>",
  "<b>81</b> &mdash; 3/5 do not: 135 ÷ 5 = 27, and 27 × 3 = 81.", "81")
assert 135 * F(3, 5) == 81
q(7, 3, '3', '', 'calculation', MEAN, '',
  "<p>Calculate the mean of:</p><p>2 &nbsp; 7 &nbsp; 1 &nbsp; 1 &nbsp; 1 &nbsp; 5 &nbsp; 2 &nbsp;"
  " 1 &nbsp; 1 &nbsp; 5</p>",
  "<b>2.6</b> &mdash; the ten numbers add to 26, and 26 ÷ 10 = 2.6.", "2.6")
assert F(sum([2, 7, 1, 1, 1, 5, 2, 1, 1, 5]), 10) == F('2.6')
q(7, 4, '4', '', 'calculation', CDEC, '', "<p>Work out 0.7 × 0.2</p>",
  "<b>0.14</b> &mdash; 7 × 2 = 14, with two decimal places.", "0.14")
q(7, 5, '5', '', 'calculation', REVMN, '',
  "<p>The mean of five numbers is 7.</p><p>Four of the numbers are 2, 7, 8 and 9.</p>"
  "<p>Write down a possible value of the fifth number.</p>",
  "<b>9</b> &mdash; the five must add to 5 × 7 = 35, and 2 + 7 + 8 + 9 = 26, so the fifth is 9"
  " (it is the only value that works).", "9")
assert 35 - (2 + 7 + 8 + 9) == 9

PARTS = 'Parts of a Circle'
# ================================ 8 August =========================================================
q(8, 1, '1', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;5x + 3 = 58</p>",
  "<b>x = 11</b> &mdash; take 3 to get 5x = 55, then divide by 5.", "x = 11|11")
q(8, 2, '2', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;<sup>w</sup>&frasl;<sub>3</sub> = 12</p>",
  "<b>w = 36</b> &mdash; multiply both sides by 3.", "w = 36|36")
q(8, 3, '3', '', 'drawing', PARTS, 'answer-space',
  "<p>A circle is drawn.</p><p>Draw a tangent.</p>",
  "<b>a straight line touching the circle at exactly one point</b>, outside it everywhere else.", '', DRAWN)
q(8, 4, '4', '', 'explain', RPROB, '',
  "<p>In a bag, there are red sweets and yellow sweets, in the ratio 3:4</p>"
  "<p>Explain why there cannot be 25 sweets in the bag.</p>",
  "<b>25 is not a multiple of 7</b> &mdash; the bag holds 3 + 4 = 7 parts, so the total must be in"
  " the 7 times table (21, 28, …).")
q(8, 5, '5', '', 'calculation', PCTID + ',' + FOFA, '',
  "<p>James buys 10 boxes of orange juice.</p><p>The cost of each box is £4.<br>Each box contains"
  " 10 cartons of orange juice.</p><p>James sells ¾ of the cartons for 80p each.</p><p>He then"
  " reduces the price by 25% and sells the remaining cartons.</p><p>Work out the total profit.</p>",
  "<b>£35</b> &mdash; he pays 10 × £4 = £40 for 100 cartons; 75 sell at 80p = £60 and 25 sell at"
  " 60p = £15, so £75 − £40 = £35.", "35|£35")
assert 75 * F('0.8') + 25 * F('0.8') * F(3, 4) - 40 == 35

CUBES = 'Cubes & Cube Roots'
INDIC = 'Indices'
ORDEC = 'Ordering Numbers & Decimals'
EST   = 'Estimation'
# ================================ 9 August =========================================================
q(9, 1, '1', '', 'short', CUBES, '', "<p>Write down the cube root of 125</p>",
  "<b>5</b> &mdash; 5 × 5 × 5 = 125.", "5")
q(9, 2, '2', '', 'calculation', INDIC, '', "<p>Work out 5<sup>4</sup></p>",
  "<b>625</b> &mdash; 5 × 5 × 5 × 5.", "625")
q(9, 3, '3', '', 'calculation', INDIC, '', "<p>Work out 10<sup>5</sup></p>",
  "<b>100000</b> &mdash; a 1 followed by five zeros.", "100000|100,000")
q(9, 4, '4', '', 'short', FDP + ',' + ORDEC, '',
  "<p>0.67 &nbsp; <sup>5</sup>&frasl;<sub>8</sub> &nbsp; <sup>4</sup>&frasl;<sub>5</sub> &nbsp; 70%</p>"
  "<p>Write in order of size, starting with the smallest.</p>",
  "<b>5/8, 0.67, 70%, 4/5</b> &mdash; as decimals they are 0.625, 0.67, 0.7 and 0.8.", '',
  'An ordering is four values in one box, so no accept.')
assert sorted([F('0.67'), F(5, 8), F(4, 5), F(7, 10)]) == [F(5, 8), F('0.67'), F(7, 10), F(4, 5)]
q(9, 5, '5', '', 'calculation', RPROB, '',
  "<p>Luca and James share money in the ratio 2:7.</p><p>James receives £30 more than Luca.</p>"
  "<p>How much does James receive?</p>",
  "<b>£42</b> &mdash; the difference is 7 − 2 = 5 parts = £30, so one part is £6 and James gets 7 × 6.",
  "42|£42")
q(9, 6, '6', '', 'calculation', EST, '',
  "<p>Estimate &nbsp;(98.7 × 3.05) ÷ 0.497</p>",
  "<b>600</b> &mdash; round each to 1 significant figure: 100 × 3 ÷ 0.5 = 600.", '',
  'An estimate depends on how the student rounds, so it is left for a person to mark.')

SQRT  = 'Squares & Square Roots'
REARR = 'Rearranging Formulae'
# ================================ 10 August ========================================================
q(10, 1, '1', '', 'short', SQRT + ',' + CUBES, '',
  "<p>Write a number that is both a square number and a cube number.</p>",
  "<b>64</b> (or 1, or 729) &mdash; 64 = 8<sup>2</sup> = 4<sup>3</sup>.", "64|1|729|4096")
q(10, 2, '2', '', 'short', SIMPL, '', "<p>Simplify &nbsp;2x + 3y + 5x − 2y − 4x</p>",
  "<b>3x + y</b> &mdash; 2x + 5x − 4x = 3x and 3y − 2y = y.", "3x + y|y + 3x")
pre(10, '3', 'grid-blank', "<p>A grid has x from 0 to 3 and y from 0 to 12.</p>")
q(10, 3, '3', 'a', 'drawing', SLG, 'grid-blank', "<p>Draw the graph y = 2x + 4</p>",
  "<b>a straight line</b> through (0, 4), (1, 6), (2, 8) and (3, 10).", '', DRAWN)
q(10, 4, '3', 'b', 'drawing', SLG, 'grid-blank', "<p>Draw the graph y = 6.</p>",
  "<b>a horizontal line</b> through 6 on the y-axis.", '', DRAWN)
q(10, 5, '4', '', 'short', REARR, '',
  "<p>Make w the subject &nbsp;a = <sup>w</sup>&frasl;<sub>c</sub></p>",
  "<b>w = ac</b> &mdash; multiply both sides by c.", "w = ac|w = ca|w=ac")

NEG   = 'Negative Numbers'
ANGTQ = 'Angles in Triangles & Quadrilaterals'
PCTAM = 'Percentage of an Amount'
PROPN = 'Properties of Number'
TWOASK = 'Two asks share one answer box, so no accept.'
# ================================ 11 August ========================================================
q(11, 1, '1', '', 'calculation', NEG, '', "<p>Work out the missing number &nbsp;☐ − 7 = −6</p>",
  "<b>1</b> &mdash; add 7 to −6.", "1")
q(11, 2, '2', '', 'calculation', ANGTQ, '',
  "<p>Two angles in a triangle are 50 degrees and 36 degrees.</p><p>Calculate the third.</p>",
  "<b>94°</b> &mdash; 180 − 50 − 36.", "94|94°")
q(11, 3, '3', '', 'calculation', PCTAM, '',
  "<p>20% of 30 = ____</p><p>50% of ____ = 30</p>",
  "<b>6 and 60</b> &mdash; 20% is a fifth, and 30 ÷ 5 = 6; 30 is half of 60.", '', TWOASK)
pre(11, '4', '', "<p>p and q are odd numbers.</p>")
q(11, 4, '4', 'a', 'short', PROPN, '', "<p>Is p + q &nbsp; odd, even or either?</p>",
  "<b>even</b> &mdash; odd + odd is always even (e.g. 3 + 5 = 8).", "even")
q(11, 5, '4', 'b', 'short', PROPN, '', "<p>Is pq &nbsp; odd, even or either?</p>",
  "<b>odd</b> &mdash; odd × odd is always odd (e.g. 3 × 5 = 15).", "odd")
q(11, 6, '5', '', 'short', REARR, '', "<p>Make w the subject &nbsp;aw + 7 = c</p>",
  "<b>w = (c − 7)/a</b> &mdash; take 7 from both sides, then divide by a.", "w = (c - 7)/a|w = (c-7)/a")

FACT  = 'Factorising'
QGRAPH = 'Quadratic Graphs'
# ================================ 12 August ========================================================
q(12, 1, '1', '', 'calculation', 'Multiplication,' + NEG, '',
  "<p>A win is worth 3 points.<br>A draw is worth 1 point.<br>A loss is worth −1 point.</p>"
  + T(['', 'Wins', 'Draws', 'Losses'], [['Sunderland City', '6', '5', '3']])
  + "<p>How many points do Sunderland City have?</p>",
  "<b>20</b> &mdash; 6 × 3 + 5 × 1 + 3 × (−1) = 18 + 5 − 3.", "20")
q(12, 2, '2', '', 'calculation', ANGTQ, 'triangle',
  "<p><b>Figure:</b> a triangle with angles 65° at the top and 55° at the bottom left; the angle x"
  " is at the bottom right.</p><p>Find x</p>",
  "<b>60°</b> &mdash; 180 − 65 − 55.", "60|60°")
q(12, 3, '3', '', 'short', FDP, '', "<p>Write 15% as a decimal.</p>",
  "<b>0.15</b> &mdash; 15 ÷ 100.", "0.15")
q(12, 4, '4', '', 'short', FDP, '', "<p>Write 0.8 as a percentage.</p>",
  "<b>80%</b> &mdash; 0.8 × 100.", "80%|80")
q(12, 5, '5', '', 'calculation', QGRAPH + ',' + SUBST, 'table-blank',
  "<p>Complete the table of values for y = x<sup>2</sup></p>"
  + T(['x', '0', '1', '2', '3', '4'], [['y', '', '', '', '', '']]),
  "<b>y = 0, 1, 4, 9, 16</b> &mdash; square each x.", '', 'Five values in one box, so no accept.')
q(12, 6, '6', '', 'short', FACT, '', "<p>Factorise &nbsp;25y + 50</p>",
  "<b>25(y + 2)</b> &mdash; 25 is the highest common factor.", "25(y + 2)|25(2 + y)")
q(12, 7, '7', '', 'short', FACT, '', "<p>Factorise &nbsp;4y<sup>2</sup> + 6y</p>",
  "<b>2y(2y + 3)</b> &mdash; 2y is the highest common factor.", "2y(2y + 3)|2y(3 + 2y)")

BPROB = 'Basic Probability'
# ================================ 13 August ========================================================
q(13, 1, '1', '', 'calculation', TERM, '',
  "<p>This sequence increases by the same amount each time.</p><p>Find the two missing numbers.</p>"
  "<p>12 &nbsp; ….. &nbsp; ….. &nbsp; 39</p>",
  "<b>21 and 30</b> &mdash; from 12 to 39 is 27 over three steps, so it goes up 9 each time.", '', TWOASK)
pre(13, '2', '', "<p>200 tickets are sold in a raffle. There is one prize.</p>")
q(13, 2, '2', 'a', 'calculation', BPROB, '',
  "<p>Zayn buys one ticket.</p><p>What is the probability that he wins the prize?</p>",
  "<b>1/200</b> &mdash; one ticket out of 200.", "1/200|0.005")
q(13, 3, '2', 'b', 'calculation', BPROB, '',
  "<p>Joanne buys five tickets.</p><p>What is the probability that she wins the prize? Give your"
  " answer as a fraction in its simplest form.</p>",
  "<b>1/40</b> &mdash; 5/200 cancels by 5.", '', 'Asks for the simplest form, and the marker compares fractions by value, so an unsimplified fraction would be marked right; left for a person to mark.')
q(13, 4, '3', '', 'calculation', CMEAS, '',
  "<p>Jaxon drives 164km.</p><p>It takes 2 hours 30 minutes.</p><p>Work out his average speed.</p>",
  "<b>65.6 km/h</b> &mdash; speed = distance ÷ time = 164 ÷ 2.5.", "65.6|65.6 km/h|65.6km/h")
assert F(164) / F('2.5') == F('65.6')
q(13, 5, '4', '', 'short', NTH, '',
  "<p>Write down the nth term for this sequence</p><p>10 &nbsp; 7 &nbsp; 4 &nbsp; 1 &nbsp; …</p>",
  "<b>13 − 3n</b> &mdash; it goes down in 3s, so −3n, and 13 − 3 = 10.", "13 - 3n|-3n + 13")
assert [13 - 3 * n for n in range(1, 5)] == [10, 7, 4, 1]
q(13, 6, '5', '', 'short', PERIM + ',' + SIMPL, 'l-shape',
  "<p><b>Figure:</b> an L-shape made of right angles. Its full height (left side) is 3x + 3, its"
  " full width (bottom) is 3x + 1, the top of the upright is x wide and the foot on the right is"
  " x + 2 tall.</p><p>Write an expression for the perimeter.</p>",
  "<b>12x + 8</b> &mdash; the unlabelled sides make up the rest of the height and width, so the"
  " perimeter equals 2 × (3x + 3) + 2 × (3x + 1).", "12x + 8|8 + 12x")

TIME  = 'Units & Measures'
QNTH  = 'Quadratic nth Term'
# ================================ 14 August ========================================================
q(14, 1, '1', '', 'calculation', PCTID, '', "<p>Increase 40kg by 20%</p>",
  "<b>48 kg</b> &mdash; 20% of 40 is 8, and 40 + 8 = 48.", "48|48kg|48 kg")
q(14, 2, '2', '', 'calculation', TIME, '',
  "<p>A ferry leaves a port every 15 minutes, starting at 09:00</p><p>The last ferry leaves at"
  " 16:30</p><p>How many times does a ferry leave the port during one day?</p>",
  "<b>31</b> &mdash; 09:00 to 16:30 is 450 minutes, which is 30 gaps of 15 minutes, and there is"
  " one more ferry than gaps.", "31")
assert (16 * 60 + 30 - 9 * 60) // 15 + 1 == 31
q(14, 3, '3', '', 'calculation', SUBST, '',
  "<p>The nth term of a sequence is n<sup>2</sup> − 1</p><p>Work out the first 5 terms.</p>",
  "<b>0, 3, 8, 15, 24</b> &mdash; 1 − 1, 4 − 1, 9 − 1, 16 − 1, 25 − 1.", '',
  'Five values in one box, so no accept.')
q(14, 4, '4', '', 'calculation', VOLSA, 'prism',
  "<p><b>Figure:</b> a triangular prism 15cm long. Its triangular end has a base of 12cm and a"
  " perpendicular height of 6cm.</p><p>Find the volume.</p>",
  "<b>540 cm³</b> &mdash; the triangle is ½ × 12 × 6 = 36 cm², and 36 × 15 = 540.",
  "540|540 cm3|540cm3|540 cm³")
assert F(1, 2) * 12 * 6 * 15 == 540
pre(14, '5', '', "<p>10 &nbsp; 13 &nbsp; 16 &nbsp; 19 &nbsp; …</p>")
q(14, 5, '5', 'a', 'short', NTH, '', "<p>Calculate the nth term.</p>",
  "<b>3n + 7</b> &mdash; it goes up in 3s, and 3 + 7 = 10.", "3n + 7|7 + 3n")
q(14, 6, '5', 'b', 'calculation', NTH, '', "<p>Find the 200th term.</p>",
  "<b>607</b> &mdash; 3 × 200 + 7.", "607")
assert [3 * n + 7 for n in (1, 2, 3, 4, 200)] == [10, 13, 16, 19, 607]

RELF  = 'Relative Frequency & Expectation'
BVAL  = 'Best Value & Unitary Method'
CIRC  = 'Area & Circumference of Circles'
ANGPL = 'Angles in Parallel Lines'
# ================================ 15 August ========================================================
q(15, 1, '1', '', 'calculation', RELF, '',
  "<p>100 people play a game that costs £1<br>The probability of winning is 0.1<br>The prize is £4.</p>"
  "<p>Calculate how much profit the game makes.</p>",
  "<b>£60</b> &mdash; it takes 100 × £1 = £100; about 0.1 × 100 = 10 people win, costing 10 × £4 ="
  " £40; 100 − 40 = 60.", "60|£60")
q(15, 2, '2', '', 'calculation', BVAL, '',
  "<p>4kg of tomatoes is £4.80</p><p>How much does 3kg cost?</p>",
  "<b>£3.60</b> &mdash; 1kg is £4.80 ÷ 4 = £1.20, and 3 × £1.20 = £3.60.", "3.60|£3.60|3.6")
q(15, 3, '3', '', 'calculation', CIRC, 'circle',
  "<p><b>Figure:</b> a circle with a diameter of 6cm drawn across it.</p>"
  "<p>Calculate the circumference of this circle, to one decimal place.</p>",
  "<b>18.8 cm</b> &mdash; C = πd = 6π = 18.849…", "18.8|18.8cm|18.8 cm")
q(15, 4, '4', '', 'calculation', ANGPY, 'polygon',
  "<p><b>Figure:</b> the front of a house drawn as a hexagon: a flat bottom with a right angle at"
  " each end, two upright walls, two sloping roof edges and a flat top.</p>"
  "<p>The front of a house is in the shape of a hexagon with two right angles. The other four angles"
  " are all the same size. Calculate the size of one of these angles.</p>",
  "<b>135°</b> &mdash; a hexagon's angles add to 720°; 720 − 90 − 90 = 540, and 540 ÷ 4 = 135.",
  "135|135°")
assert (720 - 180) / 4 == 135
q(15, 5, '5', '', 'explain', ANGPL, 'angle-diagram',
  "<p><b>Figure:</b> two parallel lines (arrows on both) crossed by a sloping line. At the lower"
  " crossing the angle above the line and to the left of the sloping line is 51°. At the upper"
  " crossing the angle x is below the line and to the right of the sloping line.</p>"
  "<p>Find x. Give a reason.</p>",
  "<b>x = 51°</b> &mdash; alternate angles are equal (the two angles make a Z shape).", '',
  'A value and a reason share one answer box, so no accept.')

# ================================ 16 August ========================================================
q(16, 1, '1', '', 'calculation', RATIO, '',
  "<p>A class has 30 students and 21 are girls.</p><p>Find the ratio of boys to girls in its simplest form.</p>",
  "<b>3 : 7</b> &mdash; 30 − 21 = 9 boys, and 9 : 21 cancels by 3.", "3 : 7")
q(16, 2, '2', '', 'short', SIMPL, '', "<p>Simplify &nbsp;3a + 3a + 3a</p>",
  "<b>9a</b> &mdash; three lots of 3a.", "9a")
q(16, 3, '3', '', 'short', SIMPL, '', "<p>Simplify &nbsp;4a + 8c + 2a + 2c</p>",
  "<b>6a + 10c</b> &mdash; 4a + 2a and 8c + 2c.", "6a + 10c|10c + 6a")
q(16, 4, '4', '', 'calculation', SUBST, '',
  "<p>The nth term of a sequence is 4n + 3</p><p>Work out the first 5 terms.</p>",
  "<b>7, 11, 15, 19, 23</b> &mdash; 4 × 1 + 3 and then up in 4s.", '',
  'Five values in one box, so no accept.')
pre(16, '5', 'angle-diagram',
    "<p><b>Figure:</b> two parallel lines, AB on top and CD below (arrows on both), crossed by two"
    " sloping lines. The left one slopes down to the right: where it crosses AB the angle above AB"
    " and to its left is 65°, and where it crosses CD the angle y is above CD and to its right. The"
    " right one slopes up to the right: where it crosses AB the angle above AB and to its left is"
    " 105°, and where it crosses CD the angle x is above CD and to its left.</p>",
    'The positions of the four angles were read off the rendered drawing, zoomed.')
q(16, 5, '5', 'a', 'calculation', ANGPL, '', "<p>Find x</p>",
  "<b>x = 105°</b> &mdash; corresponding angles are equal: x sits in the same position at CD as the"
  " 105° does at AB.", "105|105°")
q(16, 6, '5', 'b', 'calculation', ANGPL, '', "<p>Find y</p>",
  "<b>y = 115°</b> &mdash; the angle corresponding to 65° at CD is above CD on the left, and y is"
  " next to it on a straight line: 180 − 65.", "115|115°")
q(16, 7, '6', '', 'calculation', AREA2, 'trapezium',
  "<p><b>Figure:</b> a trapezium with parallel sides 2.5cm (top) and 5.5cm (bottom) and a"
  " perpendicular height of 4cm.</p><p>Calculate the area of the trapezium.</p>",
  "<b>16 cm²</b> &mdash; ½ × (2.5 + 5.5) × 4.", "16|16cm2|16 cm2|16 cm²")
assert F(1, 2) * (F('2.5') + F('5.5')) * 4 == 16

ADDF  = 'Adding & Subtracting Fractions'
# ================================ 17 August ========================================================
q(17, 1, '1', '', 'short', TERM, '',
  "<p>Write the next two terms</p><p>0.8 &nbsp; 0.4 &nbsp; 0.2 &nbsp; … &nbsp; …</p>",
  "<b>0.1 and 0.05</b> &mdash; each term is half the one before.", '', TWOASK)
q(17, 2, '2', '', 'short', TERM, '',
  "<p>Write the next two terms</p><p>1 &nbsp; 5 &nbsp; 25 &nbsp; … &nbsp; …</p>",
  "<b>125 and 625</b> &mdash; each term is 5 times the one before.", '', TWOASK)
q(17, 3, '3', '', 'short', EXPND, '', "<p>Expand &nbsp;6(x − 2)</p>",
  "<b>6x − 12</b> &mdash; 6 × x and 6 × (−2).", "6x - 12")
q(17, 4, '4', '', 'calculation', ADDF, '',
  "<p>Work out &nbsp;<sup>5</sup>&frasl;<sub>6</sub> − <sup>1</sup>&frasl;<sub>2</sub></p>",
  "<b>1/3</b> &mdash; 1/2 = 3/6, and 5/6 − 3/6 = 2/6 = 1/3.", "1/3|2/6")
assert F(5, 6) - F(1, 2) == F(1, 3)
q(17, 5, '5', '', 'calculation', BPROB, '',
  T(['', 'French', 'Art'], [['Female', '8', '3'], ['Male', '7', '3']])
  + "<p>A student is chosen at random.</p><p>What is the probability they study French?</p>",
  "<b>5/7</b> &mdash; 8 + 7 = 15 of the 21 students study French, and 15/21 = 5/7.", "5/7|15/21")
assert F(8 + 7, 8 + 3 + 7 + 3) == F(5, 7)
q(17, 6, '6', '', 'calculation', VOLSA, 'prism',
  "<p><b>Figure:</b> a prism 40cm long whose cross-section is an L-shape (a step). The bottom of the"
  " L is 20cm wide and 5cm tall; the upright part is 8cm wide and rises 12cm above the top of the"
  " step.</p><p>Calculate the volume of the prism.</p>",
  "<b>7840 cm³</b> &mdash; the L is 20 × 5 + 8 × 12 = 100 + 96 = 196 cm², and 196 × 40 = 7840.",
  "7840|7840 cm3|7840cm3|7840 cm³", 'The dimensions were read off the rendered drawing, zoomed.')
assert (20 * 5 + 8 * 12) * 40 == 7840

ORDF  = 'Ordering Fractions'
# ================================ 18 August ========================================================
q(18, 1, '1', '', 'short', PARTS, 'circle',
  "<p><b>Figure:</b> a circle with its centre marked by a dot. A straight line joins two points on"
  " the circle and does not pass through the centre.</p><p>What part of the circle is shown?</p>",
  "<b>a chord</b> &mdash; a straight line joining two points on the circle that does not go through"
  " the centre (so it is not a diameter).", "chord|a chord")
q(18, 2, '2', '', 'calculation', AREA2, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle with the two sides either side of the right angle"
  " 4cm (upright) and 16cm (base).</p><p>Find the area of the triangle.</p>",
  "<b>32 cm²</b> &mdash; ½ × 16 × 4.", "32|32cm2|32 cm2|32 cm²")
q(18, 3, '3', '', 'short', SIMPL, '',
  "<p>Simplify &nbsp;y<sup>2</sup> + y<sup>2</sup> + y<sup>2</sup></p>",
  "<b>3y<sup>2</sup></b> &mdash; three lots of y<sup>2</sup>.", "3y^2|3y²")
q(18, 4, '4', '', 'short', ORDF, '',
  "<p>Arrange in order, from smallest to largest.</p><p><sup>3</sup>&frasl;<sub>4</sub> &nbsp;"
  " <sup>7</sup>&frasl;<sub>9</sub> &nbsp; <sup>5</sup>&frasl;<sub>7</sub></p>",
  "<b>5/7, 3/4, 7/9</b> &mdash; as decimals 0.714…, 0.75 and 0.777…", '',
  'An ordering is three values in one box, so no accept.')
assert F(5, 7) < F(3, 4) < F(7, 9)
pre(18, '5', '', "<p>1, &nbsp;1.5, &nbsp;2, &nbsp;2.5, &nbsp;…</p>")
q(18, 5, '5', 'a', 'short', NTH, '', "<p>Find the nth term.</p>",
  "<b>0.5n + 0.5</b> &mdash; it goes up in 0.5s, and 0.5 + 0.5 = 1.", "0.5n + 0.5|0.5 + 0.5n|(n + 1)/2")
q(18, 6, '5', 'b', 'calculation', NTH, '', "<p>Find the 20th term.</p>",
  "<b>10.5</b> &mdash; 0.5 × 20 + 0.5.", "10.5")
assert [F(n, 2) + F(1, 2) for n in (1, 2, 3, 4, 20)] == [1, F(3, 2), 2, F(5, 2), F(21, 2)]

EQLN  = 'Equation of a Line'
# ================================ 19 August ========================================================
q(19, 1, '1', '', 'explain', SQRT, '',
  "<p>Carol claims “when you square a number, the answer is always bigger than the number you"
  " started with.”</p><p>Is she correct? Explain your answer.</p>",
  "<b>No</b> &mdash; a counter-example is enough: 1<sup>2</sup> = 1 is not bigger, and 0.5<sup>2</sup>"
  " = 0.25 is smaller.")
q(19, 2, '2', '', 'calculation', AREA2, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle with a base of 10cm; its upright side, the height, is"
  " not given.</p><p>The area of a triangle is 30cm². Find the height of the triangle.</p>",
  "<b>6 cm</b> &mdash; ½ × 10 × h = 30, so 5h = 30.", "6|6cm|6 cm")
q(19, 3, '3', '', 'short', SLG + ',' + EQLN, 'graph',
  "<p><b>Figure:</b> a grid with x from 0 to 5 and y from 0 to 6, and a vertical line drawn"
  " through 3 on the x-axis.</p><p>What is the equation of this line?</p>",
  "<b>x = 3</b> &mdash; every point on a vertical line has the same x.", "x = 3|x=3")
q(19, 4, '4', '', 'short', SLG + ',' + EQLN, 'graph',
  "<p><b>Figure:</b> a grid with x from 0 to 5 and y from 0 to 6, and a horizontal line drawn"
  " through 1 on the y-axis.</p><p>What is the equation of this line?</p>",
  "<b>y = 1</b> &mdash; every point on a horizontal line has the same y.", "y = 1|y=1")
q(19, 5, '5', '', 'calculation', EST, '',
  "<p>Work out an estimate to &nbsp;(49.1 × 8.08) ÷ 3.98</p>",
  "<b>100</b> &mdash; round to 1 significant figure: 50 × 8 ÷ 4 = 100.", '',
  'An estimate depends on how the student rounds, so it is left for a person to mark.')
q(19, 6, '6', '', 'calculation', ANGPY, 'polygon',
  "<p><b>Figure:</b> a hexagon with its interior angles marked 130°, 120°, 100°, 135°, x and 110°"
  " going round.</p><p>Find x</p>",
  "<b>x = 125°</b> &mdash; a hexagon's angles add to 720°, and 720 − 130 − 120 − 100 − 135 − 110 = 125.",
  "125|125°")
assert 720 - (130 + 120 + 100 + 135 + 110) == 125

PRIME = 'Primes & Prime Factorisation'
# ================================ 20 August ========================================================
q(20, 1, '1', '', 'short', PRIME, '', "<p>List the prime numbers between 20 and 40.</p>",
  "<b>23, 29, 31, 37</b> &mdash; each has no factors except 1 and itself.", '',
  'A list of four in one box, so no accept.')
assert [n for n in range(21, 40) if all(n % d for d in range(2, n))] == [23, 29, 31, 37]
q(20, 2, '2', '', 'calculation', RELF, '',
  "<p>When Ali takes a penalty the probability that he will score a goal is"
  " <sup>4</sup>&frasl;<sub>5</sub></p><p>Ali takes 30 penalties, how many times is he expected to"
  " score a goal?</p>",
  "<b>24</b> &mdash; 4/5 of 30: 30 ÷ 5 = 6, and 6 × 4 = 24.", "24")
q(20, 3, '3', '', 'calculation', ADDF, '',
  "<p>There are red, green and white counters in a bag.</p><p><sup>3</sup>&frasl;<sub>8</sub> of the"
  " counters are red.</p><p><sup>1</sup>&frasl;<sub>6</sub> of the counters are green.</p>"
  "<p>What fraction of the counters are white?</p>",
  "<b>11/24</b> &mdash; 3/8 + 1/6 = 9/24 + 4/24 = 13/24, and 1 − 13/24 = 11/24.", "11/24")
assert 1 - F(3, 8) - F(1, 6) == F(11, 24)
q(20, 4, '4', '', 'calculation', VOLSA, 'prism',
  "<p><b>Figure:</b> a triangular prism 20cm long. Its end is a right-angled triangle with sides"
  " 6cm and 8cm either side of the right angle and a sloping side of 10cm.</p><p>Calculate the volume.</p>",
  "<b>480 cm³</b> &mdash; the triangle is ½ × 6 × 8 = 24 cm², and 24 × 20 = 480 (the 10cm is not needed).",
  "480|480 cm3|480cm3|480 cm³")
q(20, 5, '5', '', 'short', EXPND, '', "<p>Expand &nbsp;4(x + 3)</p>",
  "<b>4x + 12</b> &mdash; 4 × x and 4 × 3.", "4x + 12|12 + 4x")

SYMM  = '2-D Shapes'
# ================================ 21 August ========================================================
q(21, 1, '1', '', 'calculation', INDIC, '', "<p>Work out 2<sup>3</sup></p>",
  "<b>8</b> &mdash; 2 × 2 × 2.", "8")
q(21, 2, '2', '', 'calculation', CUBES, '', "<p>Work out &nbsp;&#8731;27</p>",
  "<b>3</b> &mdash; 3 × 3 × 3 = 27.", "3")
q(21, 3, '3', '', 'drawing', SYMM, 'grid-blank',
  "<p>A grid of squares 5 wide and 4 tall.</p><p>Shade in squares so that the grid has:</p>"
  "<p>- no lines of symmetry<br>- order of rotational symmetry 2</p>",
  "<b>any shading that looks the same after a half-turn but has no mirror line</b> &mdash; e.g. shade"
  " the top-left square and the bottom-right square only.", '', OPEN)
q(21, 4, '4', '', 'short', TERM, '',
  "<p>Find the missing terms.</p><p>14 &nbsp;__&nbsp; 20 &nbsp;__&nbsp; 26</p>",
  "<b>17 and 23</b> &mdash; it goes up by 3 each time.", '', TWOASK)
pre(21, '5', 'pattern',
    "<p><b>Figure:</b> patterns of circles in an X shape. Pattern 1 is one circle; Pattern 2 is"
    " five circles (a centre circle with one on each diagonal arm); Pattern 3 is nine circles (a"
    " centre circle with two on each arm).</p>")
q(21, 5, '5', 'a', 'drawing', TERM, '', "<p>Draw Pattern 4</p>",
  "<b>13 circles</b> &mdash; a centre circle with three on each of the four arms of the X.", '', DRAWN)
q(21, 6, '5', 'b', 'short', NTH, '',
  "<p>Write an expression for the number of circles in pattern n</p>",
  "<b>4n − 3</b> &mdash; 1, 5, 9, 13 go up in 4s, and 4 − 3 = 1.", "4n - 3|-3 + 4n")
q(21, 7, '5', 'c', 'calculation', NTH, '', "<p>How many circles will be in pattern 10?</p>",
  "<b>37</b> &mdash; 4 × 10 − 3.", "37")
assert [4 * n - 3 for n in (1, 2, 3, 4, 10)] == [1, 5, 9, 13, 37]

ENLG  = 'Enlargements'
LAWS  = 'Laws of Indices'
# ================================ 22 August ========================================================
q(22, 1, '1', '', 'calculation', FOFA, '',
  "<p>There are 125 students in Year 11.</p><p>The number of pupils in Year 11 is one-fifth of the"
  " total number of pupils in the school.</p><p>Work out the total number of pupils in the school.</p>",
  "<b>625</b> &mdash; 125 is one fifth, so the whole is 125 × 5.", "625")
q(22, 2, '2', '', 'drawing', ENLG, 'grid',
  "<p><b>Figure:</b> a squared grid with a shaded right-angled triangle P: its base is 3 squares"
  " long and its upright side is 2 squares tall, with the right angle at the bottom left.</p>"
  "<p>Enlarge P by scale factor 3</p>",
  "<b>a right-angled triangle 9 squares long and 6 squares tall</b> &mdash; every length is"
  " multiplied by 3; no centre is given, so it may go anywhere on the grid.", '', DRAWN)
q(22, 3, '3', '', 'short', LAWS, '', "<p>Simplify &nbsp;y<sup>5</sup> × y<sup>2</sup></p>",
  "<b>y<sup>7</sup></b> &mdash; add the powers when multiplying.", "y^7|y⁷")
q(22, 4, '4', '', 'short', LAWS, '', "<p>Simplify &nbsp;y<sup>10</sup> ÷ y<sup>2</sup></p>",
  "<b>y<sup>8</sup></b> &mdash; subtract the powers when dividing.", "y^8|y⁸")
q(22, 5, '5', '', 'short', EXPND + ',' + SIMPL, '',
  "<p>Expand and simplify &nbsp;4(y + 3) + 3(y + 2)</p>",
  "<b>7y + 18</b> &mdash; 4y + 12 + 3y + 6.", "7y + 18|18 + 7y")
q(22, 6, '6', '', 'calculation', SHARE + ',' + ANGTQ, '',
  "<p>In a triangle, the ratio of the angles a, b and c is 1:2:3</p><p>What is the size of each angle?</p>",
  "<b>a = 30°, b = 60°, c = 90°</b> &mdash; 180 ÷ (1 + 2 + 3) = 30 per part.", '',
  'Three values in one box, so no accept.')

EQFR  = 'Equivalent & Simplifying Fractions'
ANGLN = 'Angles at a Point & on a Line'
# ================================ 23 August ========================================================
q(23, 1, '1', '', 'short', FDP + ',' + EQFR, '', "<p>Write 0.4 as a fraction in its simplest form.</p>",
  "<b>2/5</b> &mdash; 0.4 = 4/10, which cancels by 2.", '', 'Asks for the simplest form, and the marker compares fractions by value, so an unsimplified fraction would be marked right; left for a person to mark.')
q(23, 2, '2', '', 'calculation', ANGTQ + ',' + ANGLN, 'quadrilateral',
  "<p><b>Figure:</b> a quadrilateral standing on a straight base line that carries on past its"
  " bottom-right corner. Its interior angles are 82° at the bottom left, 121° at the top left and"
  " 75° at the top right. The angle x is outside the shape at the bottom right, between the right"
  " side and the extended base.</p><p>Find x</p>",
  "<b>x = 98°</b> &mdash; the fourth interior angle is 360 − 82 − 121 − 75 = 82°, and x is on a"
  " straight line with it: 180 − 82.", "98|98°")
assert 180 - (360 - 82 - 121 - 75) == 98
q(23, 3, '3', '', 'short', SCAT, 'scatter',
  "<p><b>Figure:</b> a scatter graph with x from 0 to 3 and y from 0 to 50. Fifteen crosses run"
  " from the top left, near (0.5, 45), down to the bottom right, near (2.75, 9): as x increases,"
  " y decreases.</p><p>What type of correlation is shown?</p>",
  "<b>negative correlation</b> &mdash; as one variable goes up the other goes down.",
  "negative|negative correlation", 'The trend was read off the rendered graph; no values are needed.')
q(23, 4, '4', '', 'calculation', PCTAM, '',
  "<p>Henry buys a car that costs £8000.</p><p>He pays a 20% deposit and pays the rest of the"
  " money over 20 monthly payments.</p><p>How much is each payment?</p>",
  "<b>£320</b> &mdash; the deposit is £1600, leaving £6400, and 6400 ÷ 20 = 320.", "320|£320")
assert (8000 - 8000 * F(20, 100)) / 20 == 320
q(23, 5, '5', '', 'short', REARR, '', "<p>Make g the subject &nbsp;a = &radic;g</p>",
  "<b>g = a<sup>2</sup></b> &mdash; square both sides.", "g = a^2|g = a²|g=a^2")

MODE  = 'Mode'
PIE   = 'Pie Charts'
# ================================ 24 August ========================================================
q(24, 1, '1', '', 'short', MODE, '',
  "<p>Write the mode of these numbers</p><p>3 &nbsp; 9 &nbsp; 3 &nbsp; 9 &nbsp; 8 &nbsp; 9 &nbsp; 3 &nbsp; 3</p>",
  "<b>3</b> &mdash; 3 appears four times, more than any other number.", "3")
q(24, 2, '2', '', 'calculation', LINEQ, '', "<p>Solve: &nbsp;6x = 30</p>",
  "<b>x = 5</b> &mdash; divide both sides by 6.", "x = 5|5")
q(24, 3, '3', '', 'calculation', LINEQ, '', "<p>Solve: &nbsp;2x + 1 = 19</p>",
  "<b>x = 9</b> &mdash; take 1 to get 2x = 18, then divide by 2.", "x = 9|9")
q(24, 4, '4', '', 'calculation', MULDF, '', "<p>Work out &nbsp;<sup>3</sup>&frasl;<sub>5</sub> × 7</p>",
  "<b>21/5</b> (= 4 1/5 = 4.2) &mdash; 3 × 7 = 21 fifths.", "21/5|4 1/5|4.2")
q(24, 5, '5', '', 'calculation', PIE, '',
  T(['Country', 'Frequency'], [['England', '5'], ['Ireland', '15'], ['Scotland', '10'], ['Wales', '6']])
  + "<p>Ivan wants to draw a pie chart.</p><p>Work out the size of each angle.</p>",
  "<b>England 50°, Ireland 150°, Scotland 100°, Wales 60°</b> &mdash; the total is 36, so each one"
  " is 360 ÷ 36 = 10°.", '', 'Four values in one box, so no accept.')
assert 360 // (5 + 15 + 10 + 6) == 10
q(24, 6, '6', '', 'calculation', VOLSA, 'cylinder',
  "<p><b>Figure:</b> a cylinder 20cm tall with a radius of 4cm (drawn from the centre of the top to"
  " its edge).</p><p>Calculate the volume.</p>",
  "<b>1005.3 cm³</b> (= 320π) &mdash; V = πr<sup>2</sup>h = π × 16 × 20 = 320π = 1005.309…",
  "1005.3|1005.31|320π|1005|1005.3 cm3")

TANG  = 'Types of Angle'
# ================================ 25 August ========================================================
q(25, 1, '1', '', 'calculation', 'Subtraction,Division', '',
  "<p>PRINT CHARGES</p><p>3p per page<br>85p for the cover</p><p>A book costs £4.45</p>"
  "<p>How many pages are in the book?</p>",
  "<b>120</b> &mdash; take the cover off: 445p − 85p = 360p, and 360 ÷ 3 = 120.", "120")
assert (445 - 85) / 3 == 120
q(25, 2, '2', '', 'calculation', TANG, '', "<p>Find the angle between the hands of a clock at 1pm</p>",
  "<b>30°</b> &mdash; the 12 hours share 360°, so each hour is 30°, and the hands are one hour apart.",
  "30|30°")
q(25, 3, '3', '', 'calculation', TANG, '', "<p>Find the angle between the hands of a clock at 4pm</p>",
  "<b>120°</b> &mdash; four hours apart, 4 × 30.", "120|120°")
q(25, 4, '4', '', 'calculation', SUBST + ',' + NEG, '',
  "<p>If y = −4 and x = 2, work out the value of: &nbsp;(y + 20) ÷ x</p>",
  "<b>8</b> &mdash; (−4 + 20) ÷ 2 = 16 ÷ 2.", "8")
q(25, 5, '5', '', 'calculation', 'Division', '',
  "<p>$1.50 = £1</p><p>A pair of trousers costs $45.</p><p>Work out the cost in pounds.</p>",
  "<b>£30</b> &mdash; 45 ÷ 1.5 = 30.", "30|£30")
q(25, 6, '6', '', 'calculation', AREA2 + ',' + LINEQ, 'parallelogram',
  "<p><b>Figure:</b> a parallelogram with a base of (x + 3) cm and a perpendicular height of 4cm.</p>"
  "<p>The area of the parallelogram is 32cm². Find x.</p>",
  "<b>x = 5</b> &mdash; 4(x + 3) = 32, so x + 3 = 8.", "x = 5|5")

REFL  = 'Reflections'
# ================================ 26 August ========================================================
pre(26, '1', 'kite', "<p><b>Figure:</b> a kite ABCD. A is on the left, B at the top, C on the right"
    " and D at the bottom; AB and BC are the two short sides and AD and CD the two long ones.</p>",
    'The shape was read off the rendered drawing; no angles or lengths are printed.')
q(26, 1, '1', 'a', 'short', TWOD, '', "<p>Is AB parallel to CD?</p>",
  "<b>No</b> &mdash; a kite has no parallel sides; AB and CD slope towards each other.", "No")
q(26, 2, '1', 'b', 'short', TWOD, '', "<p>Does Angle A = Angle C?</p>",
  "<b>Yes</b> &mdash; a kite's one pair of equal angles is between its unequal sides, at A and C.", "Yes")
q(26, 3, '2', '', 'short', FDP + ',' + EQFR, '', "<p>Convert 0.14 into a fraction in its simplest form.</p>",
  "<b>7/50</b> &mdash; 0.14 = 14/100, which cancels by 2.", '', 'Asks for the simplest form, and the marker compares fractions by value, so an unsimplified fraction would be marked right; left for a person to mark.')
q(26, 4, '3', '', 'short', FDP + ',' + EQFR, '', "<p>Convert 80% into a fraction in its simplest form.</p>",
  "<b>4/5</b> &mdash; 80/100 cancels by 20.", '', 'Asks for the simplest form, and the marker compares fractions by value, so an unsimplified fraction would be marked right; left for a person to mark.')
q(26, 5, '4', '', 'calculation', SHARE, '',
  "<p>Martin and Laura share 415 sweets in the ratio 1:4.</p><p>How many sweets does Laura receive?</p>",
  "<b>332</b> &mdash; 5 parts, so one part is 415 ÷ 5 = 83, and Laura gets 4 × 83.", "332")
assert 415 // 5 * 4 == 332
q(26, 6, '5', '', 'short', REFL + ',' + EQLN, 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with two trapeziums. A has corners (1, 0), (5, 0), (4, −2)"
  " and (2, −2). B has corners (1, 3), (5, 3), (4, 5) and (2, 5).</p><p>B is a reflection of A.</p>"
  "<p>What is the equation of the mirror line?</p>",
  "<b>y = 1.5</b> &mdash; halfway between y = 0 and y = 3 (and between −2 and 5).", "y = 1.5|y=1.5|y = 3/2",
  'The corners were read off the rendered grid, zoomed.')
q(26, 7, '6', '', 'explain', ANGPL, 'angle-diagram',
  "<p><b>Figure:</b> two parallel lines crossed by a line sloping up to the right. At the upper"
  " crossing the angle below the line and to the right of the sloping line is 115°. At the lower"
  " crossing the angle a is above the line and to the left of the sloping line.</p>"
  "<p>Size of a? Reason?</p>",
  "<b>a = 115°</b> &mdash; alternate angles are equal (a Z shape).", '',
  'A value and a reason share one answer box, so no accept.')

ALGFR = 'Algebraic Fractions'
REVPC = 'Reverse Percentages'
# ================================ 27 August ========================================================
q(27, 1, '1', '', 'short', SIMPL, '', "<p>Simplify &nbsp;3y × 2y</p>",
  "<b>6y<sup>2</sup></b> &mdash; 3 × 2 = 6 and y × y = y<sup>2</sup>.", "6y^2|6y²")
q(27, 2, '2', '', 'short', SIMPL + ',' + ALGFR, '',
  "<p>Simplify &nbsp;<sup>25xy</sup>&frasl;<sub>5x</sub></p>",
  "<b>5y</b> &mdash; 25 ÷ 5 = 5 and the x cancels.", "5y")
q(27, 3, '3', '', 'calculation', ADDF, '',
  "<p>Work out &nbsp;<sup>3</sup>&frasl;<sub>8</sub> + <sup>3</sup>&frasl;<sub>4</sub> +"
  " <sup>1</sup>&frasl;<sub>2</sub></p>",
  "<b>13/8</b> (= 1 5/8) &mdash; in eighths: 3/8 + 6/8 + 4/8 = 13/8.", "13/8|1 5/8|1.625")
assert F(3, 8) + F(3, 4) + F(1, 2) == F(13, 8)
q(27, 4, '4', '', 'short', FACT, '', "<p>Factorise &nbsp;8y + 10</p>",
  "<b>2(4y + 5)</b> &mdash; 2 is the highest common factor.", "2(4y + 5)|2(5 + 4y)")
q(27, 5, '5', '', 'calculation', PCTAM, '', "<p>20% of a number is 4.</p><p>What is the number?</p>",
  "<b>20</b> &mdash; 20% is a fifth, so the number is 4 × 5.", "20")
q(27, 6, '6', '', 'calculation', PCTAM, '', "<p>30% of a different number is 15.</p><p>What is the number?</p>",
  "<b>50</b> &mdash; 10% is 15 ÷ 3 = 5, so 100% is 50.", "50")
q(27, 7, '7', '', 'calculation', REVMN, '',
  "<p>The mean of four numbers is 6.</p><p>Three of the numbers are 1, 3 and 8.</p>"
  "<p>Work out the fourth number.</p>",
  "<b>12</b> &mdash; the four add to 4 × 6 = 24, and 24 − (1 + 3 + 8) = 12.", "12")

ROUND = 'Rounding'
SSPACE = 'Listing Outcomes & Sample Space'
_prod = [a * b for a in range(1, 5) for b in range(1, 5)]
assert F(_prod.count(2), 16) == F(1, 8) and F(sum(p < 6 for p in _prod), 16) == F(1, 2)
# ================================ 28 August ========================================================
q(28, 1, '1', '', 'short', ROUND, '',
  "<p>Erin says “my number is 500 to the nearest 10, but is not 500.”</p><p>What could her number be?</p>",
  "<b>any number from 495 up to (but not including) 505, other than 500</b> &mdash; e.g. 498 or"
  " 503.", '', OPEN)
q(28, 2, '2', '', 'short', EXPND + ',' + SIMPL, '',
  "<p>Expand and simplify &nbsp;4(y + 3) − 3(y + 2)</p>",
  "<b>y + 6</b> &mdash; 4y + 12 − 3y − 6.", "y + 6|6 + y")
pre(28, '3', '', "<p>Two spinners have the equal size sections with the numbers 1, 2, 3 and 4. They"
    " are spun and the two numbers are multiplied together.</p>")
q(28, 3, '3', 'a', 'calculation', SSPACE, 'table-blank',
  "<p>Complete the table to show all the possible totals.</p>"
  + T(['', '1', '2', '3', '4'], [[str(r), '', '', '', ''] for r in range(1, 5)]),
  "<b>row 1: 1, 2, 3, 4; row 2: 2, 4, 6, 8; row 3: 3, 6, 9, 12; row 4: 4, 8, 12, 16</b> &mdash;"
  " multiply the row number by the column number.", '', 'Sixteen values in one box, so no accept.')
q(28, 4, '3', 'b', 'calculation', SSPACE + ',' + BPROB, '',
  "<p>What is the probability of the total being 2?</p>",
  "<b>1/8</b> &mdash; 2 appears twice in the 16 cells (1 × 2 and 2 × 1): 2/16.", "1/8|2/16|0.125")
q(28, 5, '3', 'c', 'calculation', SSPACE + ',' + BPROB, '',
  "<p>What is the probability of the total being under 6?</p>",
  "<b>1/2</b> &mdash; 1, 2, 3, 4, 2, 4, 3, 4 are the 8 cells under 6: 8/16.", "1/2|8/16|0.5")
q(28, 6, '4', '', 'calculation', ANGPY, 'answer-space',
  "<p>A regular hexagon is drawn, with one interior angle marked x.</p>"
  "<p>What is the size of each interior angle in a regular hexagon?</p>",
  "<b>120°</b> &mdash; the angles add to (6 − 2) × 180 = 720°, and 720 ÷ 6 = 120.", "120|120°")

# ================================ 29 August ========================================================
q(29, 1, '1', '', 'short', TIME + ',' + NEG, '',
  "<p>Elijah’s watch is four minutes fast. Jo’s watch is five minutes slow.</p><p>What time is shown"
  " on Jo’s watch when Elijah’s watch shows 13:04</p>",
  "<b>12:55</b> &mdash; the real time is 13:04 − 4 minutes = 13:00, and Jo's is 5 minutes behind that.",
  "12:55|12.55")
pre(29, '2', 'triangle', "<p><b>Figure:</b> an isosceles triangle with its two sloping sides marked"
    " equal. The interior angle at the bottom right is 70° and y is the angle at the top. The base"
    " carries on past the bottom-right corner, and x is the angle outside the triangle there.</p>")
q(29, 2, '2', 'a', 'calculation', ANGLN, '', "<p>Find x</p>",
  "<b>x = 110°</b> &mdash; x and 70° are on a straight line: 180 − 70.", "110|110°")
q(29, 3, '2', 'b', 'calculation', ANGTQ, '', "<p>Find y</p>",
  "<b>y = 40°</b> &mdash; the base angles of an isosceles triangle are equal, so both are 70°, and"
  " 180 − 70 − 70 = 40.", "40|40°")
q(29, 4, '3', '', 'short', MODE, '',
  "<p>Riley asked 6 friends their age.</p><p>21 &nbsp; 28 &nbsp; 28 &nbsp; 28 &nbsp; 29 &nbsp; 30</p>"
  "<p>If a seventh friend has an age of 34, will the mode decrease, increase or stay the same?</p>",
  "<b>stay the same</b> &mdash; 28 is still the most common age (three times).", "stay the same|same")
q(29, 5, '4', '', 'short', FACT, '', "<p>Factorise &nbsp;6y + 27</p>",
  "<b>3(2y + 9)</b> &mdash; 3 is the highest common factor.", "3(2y + 9)|3(9 + 2y)")
q(29, 6, '5', '', 'calculation', RPROB, '',
  "<p>A mother’s and daughter’s ages are in the ratio 7:2</p><p>If the daughter is 14, how old is the mother?</p>",
  "<b>49</b> &mdash; 14 is 2 parts, so one part is 7, and the mother is 7 × 7.", "49")

# ================================ 30 August ========================================================
q(30, 1, '1', '', 'calculation', AREA2, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle with the two sides either side of the right angle"
  " 12cm (upright) and 10cm (base).</p><p>Find the area of this right angle triangle.</p>",
  "<b>60 cm²</b> &mdash; ½ × 10 × 12.", "60|60cm2|60 cm2|60 cm²")
q(30, 2, '2', '', 'calculation', 'Multiplication', '',
  "<p>£1 = $1.50</p><p>Nicola changes £20 into dollars.</p><p>How much will she get?</p>",
  "<b>$30</b> &mdash; 20 × 1.50.", "30|$30")
q(30, 3, '3', '', 'calculation', ADDF + ',' + EQFR, '',
  "<p>What fraction is halfway between &nbsp;<sup>2</sup>&frasl;<sub>5</sub> and"
  " <sup>9</sup>&frasl;<sub>10</sub>?</p>",
  "<b>13/20</b> &mdash; 2/5 = 4/10; halfway between 4/10 and 9/10 is 6.5/10 = 13/20.", "13/20|0.65")
assert (F(2, 5) + F(9, 10)) / 2 == F(13, 20)
q(30, 4, '4', '', 'short', BVAL, '',
  "<p>A watch costs €50 in Lisbon.<br>The same watch costs £35 in London.</p><p>Given £1 = €1.25</p>"
  "<p>Which is cheaper?</p>",
  "<b>London</b> &mdash; €50 ÷ 1.25 = £40, which is more than £35.", "London")
q(30, 5, '5', '', 'short', BVAL, '',
  "<p>500ml of shampoo costs 78p<br>1.25 litres of shampoo costs £2</p><p>Which is better value?</p>",
  "<b>the 500ml bottle</b> &mdash; 1.25 litres is 2.5 × 500ml, and 2.5 × 78p = £1.95, less than £2."
  " (Per 100ml: 15.6p against 16p.)", "500ml|500 ml|the 500ml")
assert F('2.5') * 78 == 195

INEQ  = 'Solving Inequalities'
RLG   = 'Real-Life Graphs'
# ================================ 31 August ========================================================
q(31, 1, '1', '', 'short', EXPND + ',' + SIMPL, '', "<p>Simplify &nbsp;9(5y + 3) − 4</p>",
  "<b>45y + 23</b> &mdash; 45y + 27 − 4.", "45y + 23|23 + 45y")
pre(31, '2', '', "<p>The ratio of red beads to white beads on a necklace is 5:2.</p>")
q(31, 2, '2', 'a', 'calculation', RATIO + ',' + FRAC, '', "<p>What fraction of the beads are white?</p>",
  "<b>2/7</b> &mdash; there are 5 + 2 = 7 parts and 2 of them are white.", "2/7")
q(31, 3, '2', 'b', 'calculation', RPROB, '', "<p>There are 60 red beads, how many white beads are there?</p>",
  "<b>24</b> &mdash; 60 red is 5 parts, so one part is 12, and white is 2 × 12.", "24")
q(31, 4, '3', '', 'short', INEQ, '',
  "<p>List all the integers that satisfy the inequality &nbsp;6 &lt; x &le; 10</p>",
  "<b>7, 8, 9, 10</b> &mdash; 6 is left out (strictly greater) and 10 is kept (less than or equal).",
  '', 'A list of four in one box, so no accept.')
pre(31, '4', 'graph',
    "<p>David lives in Torquay. He visited his aunt and then returned home.</p><p><b>Figure:</b> a"
    " distance-time graph, time of day from 11:00 to 12:00 along the bottom and distance from home"
    " (km) from 0 to 4 up the side. The line leaves 0 km at 11:05, rises in a straight line to 4 km"
    " at 11:20, stays level at 4 km until 11:40, then falls in a straight line back to 0 km at"
    " 12:00.</p>",
    'The times and distances were read off the rendered graph against its gridlines, zoomed; each'
    ' small square is 2 minutes across.')
q(31, 5, '4', 'a', 'calculation', RLG, '', "<p>How long did he stay at his aunt’s?</p>",
  "<b>20 minutes</b> &mdash; the flat part runs from 11:20 to 11:40.", "20|20 minutes|20 mins")
q(31, 6, '4', 'b', 'calculation', RLG, '', "<p>How far away from Torquay does his aunt live?</p>",
  "<b>4 km</b> &mdash; the height of the flat part.", "4|4km|4 km")
q(31, 7, '4', 'c', 'calculation', RLG, '', "<p>How far did David travel?</p>",
  "<b>8 km</b> &mdash; 4 km there and 4 km back.", "8|8km|8 km")
