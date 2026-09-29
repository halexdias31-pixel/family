"""Corbettmaths Foundation 5-a-day — November. See common.py and tools/insert-cbm-5ad-jan-FP.py.

Every page was rendered and read, because the text layer drops the fractions, the indices and every
number printed inside a picture. The November book is laid out as a grid: a question may take a
whole row or one of two cells, and `pos` counts the cells in reading order (left to right, top to
bottom); a picture printed in the left cell of a row with its instruction in the right cell is ONE
question. Corbettmaths prints no answers, so every answer is worked out from the transcribed
question, with Fraction arithmetic and asserts where there is arithmetic to check.
"""
import pathlib, sys
from fractions import Fraction as F
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from common import Month, T, NO_SCHEME
MONTH = Month(11, '1rh5RQgMykU2Ir8rtrPUurrd8C6pyrrgD')
q, pre = MONTH.q, MONTH.pre

AREA2 = 'Area of 2-D Shapes'
PERIM = 'Perimeter'
ROT   = 'Rotations'
PRIME = 'Primes & Prime Factorisation'
DRAWN = ('The picture is described in words from the rendered page; the answer is a drawing, so it'
         ' is left for a person to mark.')

# ================================ 1 November =======================================================
q(1, 1, '1', '', 'calculation', AREA2, 'rectangle',
  "<p><b>Figure:</b> a rectangle 8cm long and 3cm high.</p><p>Find the area of the rectangle.</p>",
  "<b>24 cm²</b> &mdash; area = length × width = 8 × 3.", "24|24 cm2|24cm2|24 cm²|24cm²",
  "The dimensions were read off the rendered drawing.")
q(1, 2, '2', '', 'calculation', AREA2 + ',' + PERIM, '',
  "<p>A rectangle has an area of 40cm² and perimeter 26cm.</p><p>Find the length and width.</p>",
  "<b>8cm and 5cm</b> &mdash; length + width = 26 ÷ 2 = 13, and the two numbers adding to 13 that"
  " multiply to 40 are 8 and 5.", "")
assert 8 + 5 == 13 and 8 * 5 == 40
q(1, 3, '3', '', 'drawing', ROT, 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x and y from −6 to 6. Shape E is a quadrilateral with"
  " corners at (−1, −3), (2, −2), (2, −5) and (−1, −5).</p>"
  "<p>Rotate E 90° clockwise about the origin.</p>",
  "<b>corners at (−3, 1), (−2, −2), (−5, −2) and (−5, 1)</b> &mdash; a 90° clockwise turn about the"
  " origin sends (x, y) to (y, −x).", '', DRAWN)
q(1, 4, '4', '', 'calculation', PRIME, '',
  "<p>Given 300 = 2<sup>2</sup> × 3 × 5<sup>2</sup></p><p>Write 600 as a product of primes.</p>",
  "<b>2<sup>3</sup> × 3 × 5<sup>2</sup></b> &mdash; 600 = 2 × 300, so one more factor of 2.",
  "2^3 × 3 × 5^2|2^3 x 3 x 5^2|2 × 2 × 2 × 3 × 5 × 5|2x2x2x3x5x5")
assert 2**3 * 3 * 5**2 == 600

NEG   = 'Negative Numbers'
ANGLN = 'Angles at a Point & on a Line'
SEQ   = 'Types of Sequence'
VOLSA = 'Volume & Surface Area'
# ================================ 2 November =======================================================
q(2, 1, '1', '', 'calculation', NEG, '', "<p>Work out &nbsp;−20 ÷ 4</p>",
  "<b>−5</b> &mdash; 20 ÷ 4 = 5, and a negative divided by a positive is negative.", "-5|−5")
q(2, 2, '2', '', 'calculation', ANGLN, 'angles',
  "<p><b>Figure:</b> two straight lines cross. The angle below-left of the crossing is 75°; the"
  " angle y is directly opposite it, above-right of the crossing.</p><p>Find y</p>",
  "<b>y = 75°</b> &mdash; vertically opposite angles are equal.", "75|75°|y = 75|y=75",
  "The angle was read off the rendered drawing.")
q(2, 3, '3', '', 'calculation', AREA2, 'triangle',
  "<p>The area of this triangle is 30cm²</p><p><b>Figure:</b> a right-angled triangle with base"
  " 5cm and height x.</p><p>Find x</p>",
  "<b>x = 12 cm</b> &mdash; ½ × 5 × x = 30, so 2.5x = 30 and x = 12.",
  "12|x = 12|x=12|12cm|12 cm")
assert F(1, 2) * 5 * 12 == 30
q(2, 4, '4', '', 'calculation', SEQ, '',
  "<p>James saves money every week.</p><p>Week 1 he saves 1p<br>Week 2 he saves 2p<br>Week 3 he"
  " saves 4p<br>Week 4 he saves 8p &nbsp; and so on.</p>"
  "<p>How much money does he have saved in total up to and including week 8.</p>",
  "<b>255p (£2.55)</b> &mdash; the amount doubles each week: 1 + 2 + 4 + 8 + 16 + 32 + 64 + 128"
  " = 255.", "255p|255|£2.55|2.55")
assert sum(2**i for i in range(8)) == 255
q(2, 5, '5', '', 'calculation', VOLSA, 'prism',
  "<p><b>Figure:</b> a triangular prism 20cm long. Its cross-section is a right-angled triangle"
  " whose two shorter sides, either side of the right angle, are 5cm and 6cm.</p>"
  "<p>Calculate the volume</p>",
  "<b>300 cm³</b> &mdash; the triangle's area is ½ × 5 × 6 = 15 cm², and 15 × 20 = 300.",
  "300|300 cm3|300cm3|300 cm³", "The dimensions were read off the rendered drawing.")
assert F(1, 2) * 5 * 6 * 20 == 300

SCALE = 'Scale Drawings & Maps'
INDX  = 'Indices'
PROB  = 'Basic Probability'
PARAL = 'Angles in Parallel Lines'
UNITS = 'Units & Measures'
# ================================ 3 November =======================================================
q(3, 1, '1', '', 'calculation', SCALE, '',
  "<p>A map has a scale of 1cm : 3 miles.</p><p>On the map, the distance between two towns is"
  " 17cm.</p><p>What is the actual distance between the two towns?</p><p>Include units for your"
  " answer.</p>",
  "<b>51 miles</b> &mdash; each centimetre is 3 miles, and 17 × 3 = 51.", "51 miles|51miles")
q(3, 2, '2', '', 'calculation', VOLSA + ',' + UNITS, 'cuboid',
  "<p><b>Figure:</b> a cuboid 8mm wide, 9mm high and 1cm deep.</p>"
  "<p>Work out the volume of the cuboid.</p>",
  "<b>720 mm³</b> &mdash; 1cm is 10mm, so the volume is 8 × 9 × 10 = 720 mm³ (0.72 cm³).",
  "720 mm3|720mm3|720 mm³|720mm³|0.72 cm3|0.72cm3|0.72 cm³",
  "The dimensions were read off the rendered drawing; the mixed units are the paper's own.")
assert 8 * 9 * 10 == 720
q(3, 3, '3', '', 'calculation', INDX, '', "<p>Work out &nbsp;2<sup>5</sup></p>",
  "<b>32</b> &mdash; 2 × 2 × 2 × 2 × 2 = 32.", "32")
q(3, 4, '4', '', 'calculation', PROB, '',
  "<p>Teddy has a bag of counters.</p><p>The counters are red, green, white and pink.</p>"
  "<p>There are 200 counters in the bag.</p><p>The probability of a pink counter is 0.15</p>"
  "<p>The probability of a green counter is 0.25</p><p>The probability of a red counter is twice"
  " the probability of a white counter.</p><p>Calculate the number of red counters in the bag.</p>",
  "<b>80</b> &mdash; red and white together are 1 − 0.15 − 0.25 = 0.6; red is twice white, so red"
  " is 0.4, and 0.4 × 200 = 80.", "80")
assert (1 - F('0.15') - F('0.25')) * F(2, 3) * 200 == 80
q(3, 5, '5', '', 'explain', PARAL, 'parallel-lines',
  "<p><b>Figure:</b> two parallel lines (marked with arrows) are crossed by a transversal. Between"
  " the parallel lines, on the same side of the transversal, are two angles: 118° at the lower"
  " line and x at the upper line.</p>"
  "<p>Work out the size of the angle marked x.</p><p>Give a reason for your answer.</p>",
  "<b>x = 62°</b> &mdash; co-interior (allied) angles between parallel lines add up to 180°, and"
  " 180 − 118 = 62.", "", "The angles were read off the shading on the rendered drawing.")

AVG   = 'Mean'
SCAT  = 'Scatter Graphs & Correlation'
ORDDC = 'Ordering Numbers & Decimals'
# ================================ 4 November =======================================================
q(4, 1, '1', '', 'calculation', AVG, '',
  "<p>Rory and Luis think of two different numbers.</p><p>The midpoint of the two numbers is"
  " 23.</p><p>Rory says his number is 9.</p><p>What number is Luis thinking of?</p>",
  "<b>37</b> &mdash; 9 is 14 below 23, so Luis's number is 14 above it: 23 + 14 = 37.", "37")
assert (9 + 37) / 2 == 23
q(4, 2, '2', '', 'calculation', INDX, '',
  "<p>Work out &nbsp;4<sup>2</sup> + 2<sup>3</sup></p>",
  "<b>24</b> &mdash; 4² = 16 and 2³ = 8, and 16 + 8 = 24.", "24")
q(4, 3, '3', '', 'calculation', AREA2, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle with base 13cm and height 10cm.</p>"
  "<p>Work out the area of the right-angled triangle.</p>",
  "<b>65 cm²</b> &mdash; ½ × 13 × 10 = 65.", "65|65 cm2|65cm2|65 cm²",
  "The dimensions were read off the rendered drawing.")
q(4, 4, '4', '', 'short', UNITS + ',' + ORDDC, '',
  "<p>Write the following in order, from lightest to heaviest.</p>"
  "<p>3kg &nbsp; 400g &nbsp; 0.5 tonnes &nbsp; 0.2kg</p>",
  "<b>0.2kg, 400g, 3kg, 0.5 tonnes</b> &mdash; in grams they are 200, 400, 3000 and 500 000.")
q(4, 5, '5', '', 'short', SCAT, 'scatter',
  "<p><b>Figure:</b> a scatter graph of nine crosses. Taken together they rise from the bottom"
  " left towards the top right, loosely scattered about that trend.</p>"
  "<p>What type of correlation is shown?</p>",
  "<b>Positive correlation</b> &mdash; as one variable increases the other tends to increase"
  " (a weak positive correlation).", "positive|positive correlation|weak positive|weak positive correlation",
  "The trend was read off the rendered scatter graph.")

FDP   = 'Fraction Decimal Percentage Conversion'
LINEQ = 'Linear Equations'
TWOWY = 'Charts & Diagrams'
SHARE = 'Sharing in a Ratio'
PCTAM = 'Percentage of an Amount'
EXPND = 'Expanding Brackets'
# ================================ 5 November =======================================================
q(5, 1, '1', '', 'short', FDP, '',
  "<p>Match each decimal and fraction.</p>"
  + T(['Decimal', 'Fraction'], [['0.325', '2/5'], ['0.4', '7/20'], ['0.3333…', '13/40'],
                                ['0.35', '1/3']])
  + "<p>(The first match, 0.4 to 2/5, is drawn for you.)</p>",
  "<b>0.325 = 13/40, 0.4 = 2/5, 0.3333… = 1/3, 0.35 = 7/20</b> &mdash; divide each numerator by"
  " its denominator.")
assert F(13, 40) == F('0.325') and F(7, 20) == F('0.35') and F(2, 5) == F('0.4')
q(5, 2, '2', '', 'calculation', LINEQ, '',
  "<p>Solve &nbsp;<sup>x + 6</sup>&frasl;<sub>8</sub> = 4</p>",
  "<b>x = 26</b> &mdash; multiply both sides by 8 to get x + 6 = 32, then subtract 6.",
  "x = 26|x=26|26")
q(5, 3, '3', '', 'calculation', TWOWY, '',
  "<p>Twice as many girls study German than boys.</p><p>There are 40 students altogether.</p>"
  + T(['', 'French', 'German'], [['Male', '14', ''], ['Female', '', '8']])
  + "<p>Find the missing numbers.</p>",
  "<b>Male German 4, Female French 14</b> &mdash; 8 girls is twice the boys, so 4 boys study"
  " German; then 40 − 14 − 4 − 8 = 14 girls study French.")
assert 40 - 14 - 4 - 8 == 14
q(5, 4, '4', '', 'calculation', SHARE + ',' + PCTAM, '',
  "<p>Sam and James win £500 in a competition. They share the money in the ratio 3:7.</p>"
  "<p>Sam gives 35% of the money he wins to his brother, Harry.</p>"
  "<p>How much money does Harry receive?</p>",
  "<b>£52.50</b> &mdash; Sam gets 3/10 of £500 = £150, and 35% of £150 is £52.50.",
  "52.50|£52.50|52.5|£52.5")
assert F(3, 10) * 500 * F(35, 100) == F('52.5')
q(5, 5, '5', '', 'calculation', EXPND, '', "<p>Expand &nbsp;2w(3w<sup>2</sup> − 5)</p>",
  "<b>6w³ − 10w</b> &mdash; 2w × 3w² = 6w³ and 2w × −5 = −10w.",
  "6w^3 - 10w|6w^3-10w|6w³ − 10w")
q(5, 6, '6', '', 'calculation', EXPND, '', "<p>Expand &nbsp;y<sup>2</sup>(8 − 2y)</p>",
  "<b>8y² − 2y³</b> &mdash; y² × 8 = 8y² and y² × −2y = −2y³.",
  "8y^2 - 2y^3|8y^2-2y^3|8y² − 2y³")

CALCD = 'Calculating with Decimals'
NTERM = 'nth Term of a Linear Sequence'
ROUND = 'Rounding'
SIGF  = 'Significant Figures'
# ================================ 6 November =======================================================
q(6, 1, '1', '', 'calculation', CALCD, '', "<p>Work out the value of 0.2 × 0.8</p>",
  "<b>0.16</b> &mdash; 2 × 8 = 16, and there are two decimal places in the question.", "0.16|.16")
pre(6, '2', 'dot-pattern',
  "<p>Patterns are made of dots.</p><p><b>Figure:</b> each pattern is a row of dots meeting a"
  " column of dots on the right. Pattern 1 has 4 dots (1 dot beside a column of 3), Pattern 2 has 7"
  " dots (2 dots beside a column of 5) and Pattern 3 has 10 dots (3 dots beside a column of 7).</p>",
  "The dots were counted off the rendered page.")
q(6, 2, '2', 'a', 'drawing', SEQ, '', "<p>Show Pattern 4.</p>",
  "<b>13 dots</b> &mdash; a row of 4 dots beside a column of 9 dots, sharing the middle row.", '',
  'The answer is a drawing, so it is left for a person to mark.')
q(6, 3, '2', 'b', 'calculation', NTERM, '',
  "<p>Find an expression in terms of n, for how many dots there will be in Pattern n</p>",
  "<b>3n + 1</b> &mdash; the patterns go 4, 7, 10, going up by 3 each time, and 3 × 1 + 1 = 4.",
  "3n + 1|3n+1|1 + 3n|1+3n")
assert [3 * n + 1 for n in (1, 2, 3, 4)] == [4, 7, 10, 13]
q(6, 4, '2', 'c', 'calculation', NTERM, '', "<p>Which pattern will have 2401 dots?</p>",
  "<b>Pattern 800</b> &mdash; 3n + 1 = 2401, so 3n = 2400 and n = 800.", "800|Pattern 800|pattern 800")
assert 3 * 800 + 1 == 2401
q(6, 5, '3', '', 'calculation', AREA2, 'parallelogram',
  "<p><b>Figure:</b> a parallelogram with base 5.4cm and a perpendicular height of 6.1cm.</p>"
  "<p>Work out the area of the parallelogram.</p>",
  "<b>32.94 cm²</b> &mdash; area = base × perpendicular height = 5.4 × 6.1.",
  "32.94|32.94 cm2|32.94cm2|32.94 cm²", "The dimensions were read off the rendered drawing.")
assert F('5.4') * F('6.1') == F('32.94')
pre(6, '4', '', "<p>Work out &nbsp;13 ÷ 0.3<sup>2</sup></p>")
q(6, 6, '4', 'a', 'calculation', ROUND + ',' + INDX, '', "<p>Give your answer to two decimal places.</p>",
  "<b>144.44</b> &mdash; 0.3² = 0.09, and 13 ÷ 0.09 = 144.444…", "144.44")
assert round(13 / 0.09, 2) == 144.44
q(6, 7, '4', 'b', 'calculation', SIGF, '', "<p>Give the answer to one significant figure.</p>",
  "<b>100</b> &mdash; 144.444… to one significant figure is 100.", "100")

ADDF  = 'Adding & Subtracting Fractions'
# ================================ 7 November =======================================================
q(7, 1, '1', '', 'calculation', SEQ, 'dot-pattern',
  "<p>The pattern below shows the first 3 triangular numbers.</p><p><b>Figure:</b> Pattern 1 is 1"
  " counter; Pattern 2 is 3 counters in a triangle (1 on top of 2); Pattern 3 is 6 counters (1 on"
  " top of 2 on top of 3).</p><p>Write down the fourth triangular number.</p>",
  "<b>10</b> &mdash; add a row of 4 to the 6: 1 + 2 + 3 + 4 = 10.", "10")
pre(7, '2', '', "<p>Charlotte selects a cube from a bag containing 6 red, 2 green and 5 white"
    " cubes.</p>")
q(7, 2, '2', 'a', 'calculation', PROB, '', "<p>What is the probability she picks a white cube?</p>",
  "<b>5/13</b> &mdash; 5 of the 6 + 2 + 5 = 13 cubes are white.", "5/13")
q(7, 3, '2', 'b', 'calculation', PROB, '', "<p>What is the probability she picks a red or white cube?</p>",
  "<b>11/13</b> &mdash; 6 + 5 = 11 of the 13 cubes are red or white.", "11/13")
q(7, 4, '3', '', 'drawing', ROT, 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x from −6 to 6 and y from −5 to 5. Shape A is an"
  " L-shape with corners at (2, 3), (5, 3), (5, 1), (4, 1), (4, 2) and (2, 2).</p>"
  "<p>Rotate shape A 90° anti-clockwise about the origin</p>",
  "<b>corners at (−3, 2), (−3, 5), (−1, 5), (−1, 4), (−2, 4) and (−2, 2)</b> &mdash; a 90°"
  " anti-clockwise turn about the origin sends (x, y) to (−y, x).", '', DRAWN)
q(7, 5, '4', '', 'calculation', ADDF, '',
  "<p><sup>3</sup>&frasl;<sub>4</sub> − <sup>1</sup>&frasl;<sub>3</sub></p>",
  "<b>5/12</b> &mdash; over twelfths: 9/12 − 4/12 = 5/12.", "5/12")
assert F(3, 4) - F(1, 3) == F(5, 12)
q(7, 6, '5', '', 'calculation', ADDF, '',
  "<p><sup>3</sup>&frasl;<sub>4</sub> + <sup>4</sup>&frasl;<sub>7</sub></p>",
  "<b>37/28 (1 9/28)</b> &mdash; over twenty-eighths: 21/28 + 16/28 = 37/28.", "37/28|1 9/28")
assert F(3, 4) + F(4, 7) == F(37, 28)

MULT  = 'Multiplication'
MULDF = 'Multiplying & Dividing Fractions'
CUBES = 'Cubes & Cube Roots'
# ================================ 8 November =======================================================
q(8, 1, '1', '', 'short', MULT, '',
  "<p>Fill in the missing digits to show a possible answer.</p>"
  "<p>☐☐ × 4 = 5☐</p><p>(A two-digit number times 4 gives a two-digit answer whose first digit is"
  " 5.)</p>",
  "<b>13 × 4 = 52 or 14 × 4 = 56</b> &mdash; the answer must be a multiple of 4 in the fifties,"
  " and only 52 and 56 are.")
assert [n for n in range(50, 60) if n % 4 == 0] == [52, 56]
q(8, 2, '2', '', 'calculation', NTERM, 'stick-pattern',
  "<p>These patterns are made of sticks.</p><p><b>Figure:</b> Pattern 1 is a square of 4 sticks"
  " with a triangle (2 more sticks) on its left and on its right side — 8 sticks. Pattern 2 adds"
  " a square (3 more sticks) above and below — 14 sticks. Pattern 3 adds one more square above"
  " and below — 20 sticks.</p><p>How many sticks will there be in Pattern 8?</p>",
  "<b>50</b> &mdash; the patterns go 8, 14, 20, going up by 6, so Pattern n has 6n + 2 sticks and"
  " 6 × 8 + 2 = 50.", "50", "The sticks were counted off the rendered page.")
assert [6 * n + 2 for n in (1, 2, 3, 8)] == [8, 14, 20, 50]
q(8, 3, '3', '', 'calculation', ADDF, '',
  "<p><sup>4</sup>&frasl;<sub>9</sub> + <sup>2</sup>&frasl;<sub>5</sub></p>",
  "<b>38/45</b> &mdash; over forty-fifths: 20/45 + 18/45 = 38/45.", "38/45")
assert F(4, 9) + F(2, 5) == F(38, 45)
q(8, 4, '4', '', 'calculation', MULDF, '',
  "<p><sup>4</sup>&frasl;<sub>9</sub> × <sup>2</sup>&frasl;<sub>5</sub></p>",
  "<b>8/45</b> &mdash; multiply the tops and the bottoms: 4 × 2 = 8 and 9 × 5 = 45.", "8/45")
q(8, 5, '5', '', 'short', CUBES, '', "<p>List the first five cube numbers.</p>",
  "<b>1, 8, 27, 64, 125</b> &mdash; 1³, 2³, 3³, 4³ and 5³.")
q(8, 6, '6', '', 'calculation', VOLSA, 'prism',
  "<p><b>Figure</b> (not drawn accurately): a prism 15cm long whose cross-section is an L-shape"
  " (a step). The L is 11cm wide along the bottom and 12cm tall on the right. The tall part is"
  " 5cm wide, and the step down from its top is 9cm.</p><p>Work out the volume of the prism.</p>",
  "<b>1170 cm³</b> &mdash; the L is 11 × 12 − 6 × 9 = 132 − 54 = 78 cm², and 78 × 15 = 1170.",
  "1170|1170 cm3|1170cm3|1170 cm³", "The dimensions were read off the rendered drawing.")
assert (11 * 12 - (11 - 5) * 9) * 15 == 1170

AVGR  = 'Averages & Range'
COLLT = 'Simplifying & Collecting Terms'
BEAR  = 'Bearings'
# ================================ 9 November =======================================================
pre(9, '1', '', "<p>6 &nbsp; 4 &nbsp; 2 &nbsp; 9 &nbsp; 11 &nbsp; 11</p>")
q(9, 1, '1', 'a', 'calculation', 'Median', '', "<p>(a) What is the median?</p>",
  "<b>7.5</b> &mdash; in order 2, 4, 6, 9, 11, 11; the middle two are 6 and 9, and halfway is 7.5.",
  "7.5")
q(9, 2, '1', 'b', 'calculation', 'Mode', '', "<p>(b) What is the mode?</p>",
  "<b>11</b> &mdash; 11 appears twice, every other number once.", "11")
q(9, 3, '1', 'c', 'calculation', 'Range', '', "<p>(c) What is the range?</p>",
  "<b>9</b> &mdash; 11 − 2 = 9.", "9")
pre(9, '2', 'scatter',
  "<p><b>Figure:</b> a scatter graph of Arm Span (cm), from 100 to 190, against Height (cm), from"
  " 110 to 200, for ten students. The points run from about (120, 122) up to about (180, 190),"
  " rising steadily and lying close to a straight line on which the arm span is about the same as"
  " the height.</p>", "The points were read off the rendered scatter graph.")
q(9, 4, '2', 'a', 'explain', SCAT, '', "<p>Describe the relationship shown.</p>",
  "<b>Positive correlation</b> &mdash; the taller a student is, the longer their arm span tends to"
  " be.")
q(9, 5, '2', 'b', 'calculation', SCAT, '',
  "<p>Another student has a height of 150cm.</p><p>Estimate the arm span of this student.</p>",
  "<b>about 150cm</b> &mdash; read up from 150 on the height axis to a line of best fit through"
  " the points; the arm span is roughly equal to the height.", '',
  'An estimate off a line of best fit; a person should accept a sensible reading near 150cm. '
  + NO_SCHEME)
q(9, 6, '3', '', 'calculation', COLLT, '', "<p>Simplify &nbsp;6x + 2y − 3x + 7y</p>",
  "<b>3x + 9y</b> &mdash; 6x − 3x = 3x and 2y + 7y = 9y.", "3x + 9y|3x+9y|9y + 3x|9y+3x")
q(9, 7, '4', '', 'calculation', BEAR, 'bearing',
  "<p><b>Figure:</b> two points A and B, each with a North line drawn straight up from it. B is"
  " far to the right of A and a little higher up the page.</p>"
  "<p>What is the bearing of B from A?</p>",
  "<b>about 082°</b> &mdash; measure clockwise from the North line at A to the line AB; B is just"
  " north of due east from A.", '',
  'Measured off the rendered page: B is 486 units right of A and 68 units up, which is a bearing of'
  ' about 082°. The answer is a protractor measurement, so it is left for a person to mark within a'
  ' sensible tolerance.')

DIRNUM = 'Negative Numbers'
# ================================ 10 November ======================================================
pre(10, '1', '',
  T(['', 'Wins', 'Draws', 'Losses'],
    [['Sunderland City', '1', '5', '3'], ['Manchester Rovers', '2', '1', '6'],
     ['Liverpool United', '3', '0', '6'], ['London Town', '0', '9', '0']])
  + "<p>Win = 5 points &nbsp; Draw = 2 points &nbsp; Loss = −1 points</p>")
q(10, 1, '1', 'a', 'short', DIRNUM + ',' + MULT, '',
  "<p>Which team have the greatest number of points?</p>",
  "<b>London Town</b> &mdash; Sunderland City 5 + 10 − 3 = 12, Manchester Rovers 10 + 2 − 6 = 6,"
  " Liverpool United 15 + 0 − 6 = 9, London Town 0 + 18 − 0 = 18.", "London Town")
q(10, 2, '1', 'b', 'calculation', DIRNUM + ',' + MULT, '', "<p>How many points do they have?</p>",
  "<b>18</b> &mdash; 9 draws × 2 points = 18.", "18")
pts = {t: 5 * w + 2 * d - l for t, w, d, l in [('SC', 1, 5, 3), ('MR', 2, 1, 6), ('LU', 3, 0, 6),
                                                   ('LT', 0, 9, 0)]}
assert max(pts, key=pts.get) == 'LT' and pts['LT'] == 18
q(10, 3, '2', '', 'calculation', 'Equations', '',
  "<p>There are two bags of sweets, bag 1 and bag 2.</p><p>In total there are 40 sweets in the"
  " bags.</p><p>12 sweets are moved from bag 1 to bag 2. There is now an equal number of sweets in"
  " each bag.</p><p>How many sweets were in bag 2 at the start?</p>",
  "<b>8</b> &mdash; afterwards each bag holds 40 ÷ 2 = 20, so bag 2 started with 20 − 12 = 8.", "8")
MAPNOTE = ('Measured off the rendered page: School to Shop is about 144 points, which is about 5.1cm'
           ' on an A4 page, on a bearing of about 070°. Both answers are ruler and protractor'
           ' measurements, so they are left for a person to mark within a sensible tolerance.')
pre(10, '3', 'map',
  "<p><b>Figure:</b> a map showing a School and a Shop, each with a North line drawn straight up"
  " from it. The Shop is to the right of the School and a little higher up the page, about 5cm"
  " away on the printed page.</p>", MAPNOTE)
q(10, 4, '3', 'a', 'calculation', SCALE, '',
  "<p>The scale of the map is 1cm = 100 metres.</p><p>Work out the real distance between the"
  " school and the shop.</p><p>Give your answer in metres.</p>",
  "<b>about 500 metres</b> &mdash; measure the distance on the map (about 5cm) and multiply by 100.",
  '', MAPNOTE)
q(10, 5, '3', 'b', 'calculation', BEAR, '', "<p>What is the bearing of the shop from the school?</p>",
  "<b>about 070°</b> &mdash; measure clockwise from the North line at the School to the line to the"
  " Shop.", '', MAPNOTE)
q(10, 6, '4', '', 'calculation', VOLSA, 'cuboid',
  "<p><b>Figure:</b> a cuboid labelled Volume = 120cm³, with no lengths marked.</p>"
  "<p>This cuboid has a volume of 120cm³. Work out a possible value for its surface area.</p>",
  "<b>e.g. 184 cm²</b> &mdash; choose lengths that multiply to 120, such as 2 × 6 × 10; the surface"
  " area is 2(2×6 + 2×10 + 6×10) = 2(12 + 20 + 60) = 184 cm². Other lengths give other answers.",
  '', 'Many answers are correct, so it is left for a person to mark.')
assert 2 * 6 * 10 == 120 and 2 * (12 + 20 + 60) == 184

LAWIX = 'Laws of Indices'
MONEY = 'Calculating with Decimals'
# ================================ 11 November ======================================================
pre(11, '1', '', "<p>If 150 × 34 = 5100</p><p>Use that information to work out:</p>")
q(11, 1, '1', 'a', 'calculation', MULT, '', "<p>15 × 34</p>",
  "<b>510</b> &mdash; 15 is 150 ÷ 10, so the answer is 5100 ÷ 10.", "510")
q(11, 2, '1', 'b', 'calculation', MULT, '', "<p>300 × 34</p>",
  "<b>10 200</b> &mdash; 300 is 150 × 2, so the answer is 5100 × 2.", "10200|10 200|10,200")
q(11, 3, '1', 'c', 'calculation', MULT + ',' + CALCD, '', "<p>1.5 × 3.4</p>",
  "<b>5.1</b> &mdash; 1.5 is 150 ÷ 100 and 3.4 is 34 ÷ 10, so the answer is 5100 ÷ 1000.", "5.1")
assert 15 * 34 == 510 and 300 * 34 == 10200 and F('1.5') * F('3.4') == F('5.1')
q(11, 4, '2', '', 'calculation', MONEY + ',' + 'Subtraction', '',
  "<p>Each unit of gas costs 15p</p>"
  + T(['', 'meter reading'], [['Jan', '6813'], ['June', '7191']])
  + "<p>How much was spent on gas between January and June?</p>",
  "<b>£56.70</b> &mdash; 7191 − 6813 = 378 units, and 378 × 15p = 5670p.",
  "£56.70|56.70|56.7|£56.7|5670p")
assert (7191 - 6813) * 15 == 5670
q(11, 5, '3', '', 'calculation', LAWIX, '', "<p>Simplify &nbsp;a × a × a × a × a</p>",
  "<b>a<sup>5</sup></b> &mdash; five a's multiplied together.", "a^5|a⁵")
q(11, 6, '4', '', 'calculation', COLLT, '', "<p>Simplify &nbsp;6a + 4a − a</p>",
  "<b>9a</b> &mdash; 6 + 4 − 1 = 9.", "9a")
q(11, 7, '5', '', 'calculation', AREA2, 'triangle',
  "<p><b>Figure:</b> a triangle with base 6cm and a perpendicular height of 16cm (drawn as a"
  " dotted line outside the triangle).</p><p>Find the area of the triangle.</p>",
  "<b>48 cm²</b> &mdash; ½ × 6 × 16 = 48.", "48|48 cm2|48cm2|48 cm²",
  "The dimensions were read off the rendered drawing.")
q(11, 8, '6', '', 'calculation', SIGF + ',' + 'Order of Operations', '',
  "<p>Work out &nbsp;<sup>13.2 + 8.9</sup>&frasl;<sub>2.3<sup>2</sup></sub></p>"
  "<p>Write your answer to 2 significant figures.</p>",
  "<b>4.2</b> &mdash; 13.2 + 8.9 = 22.1 and 2.3² = 5.29, so 22.1 ÷ 5.29 = 4.177…", "4.2")
assert round(22.1 / 5.29, 1) == 4.2

DIV   = 'Division'
STEM  = 'Stem & Leaf Diagrams'
# ================================ 12 November ======================================================
q(12, 1, '1', '', 'calculation', COLLT, '', "<p>Simplify</p><p>a + a + a</p>",
  "<b>3a</b> &mdash; three lots of a.", "3a")
q(12, 2, '2', '', 'calculation', LAWIX, '', "<p>Simplify</p><p>a × a × a</p>",
  "<b>a<sup>3</sup></b> &mdash; three a's multiplied together.", "a^3|a³")
q(12, 3, '3', '', 'calculation', DIV, '',
  "<p>385 students are going on a school trip.</p><p>At least one teacher must go with every 14"
  " students.</p><p>Work out the smallest number of teachers who must go.</p>",
  "<b>28</b> &mdash; 385 ÷ 14 = 27.5, and 27 teachers would only cover 378 students, so round up"
  " to 28.", "28")
assert 27 * 14 < 385 <= 28 * 14
q(12, 4, '4', '', 'short', AVG, '',
  "<p>Darius works out the mean of three numbers.</p><p>The mean is 6.</p><p>None of the numbers"
  " are 6.</p><p>Write down three numbers with a mean of 6.</p>",
  "<b>e.g. 4, 5 and 9</b> &mdash; any three numbers, none of them 6, that add up to 3 × 6 = 18.",
  '', 'Many answers are correct, so it is left for a person to mark.')
AGES = [14, 15, 18, 21, 23, 26, 29, 29, 30, 35, 37, 44]
pre(12, '5', '',
  "<p>The stem and leaf diagram below shows the ages of people in a group.</p>"
  "<p>Key: 1 | 4 means 14 years old</p>"
  + T(['Stem', 'Leaf'], [['1', '4 5 8'], ['2', '1 3 6 9 9'], ['3', '0 5 7'], ['4', '4']]))
q(12, 5, '5', 'a', 'calculation', STEM, '', "<p>How many people are over 25?</p>",
  "<b>7</b> &mdash; 26, 29, 29, 30, 35, 37 and 44.", "7")
q(12, 6, '5', 'b', 'calculation', STEM + ',' + 'Range', '', "<p>Work out the range of the ages.</p>",
  "<b>30 years</b> &mdash; oldest 44 minus youngest 14.", "30|30 years")
assert len([a for a in AGES if a > 25]) == 7 and max(AGES) - min(AGES) == 30

BEST  = 'Best Value & Unitary Method'
# ================================ 13 November ======================================================
q(13, 1, '1', '', 'calculation', CALCD, '', "<p>Work out &nbsp;72 ÷ 0.3</p>",
  "<b>240</b> &mdash; multiply both by 10: 720 ÷ 3 = 240.", "240")
assert F(72) / F('0.3') == 240
q(13, 2, '2', '', 'explain', BEST, '',
  "<p>A pack of 3 peppers cost £3.40</p><p>A pack of 4 peppers cost £4.08</p>"
  "<p>Which pack is better value for money?</p>",
  "<b>The pack of 4</b> &mdash; it is 408 ÷ 4 = 102p a pepper, against 340 ÷ 3 = 113.3p a pepper"
  " in the pack of 3.")
assert F(408, 4) < F(340, 3)
q(13, 3, '3', '', 'calculation', PERIM + ',' + COLLT, 'rectangle',
  "<p><b>Figure:</b> a rectangle with length 4x + 3y and width x + y.</p>"
  "<p>Write an expression for the perimeter of the rectangle.</p>",
  "<b>10x + 8y</b> &mdash; 2(4x + 3y) + 2(x + y) = 8x + 6y + 2x + 2y.", "10x + 8y|10x+8y|8y + 10x|8y+10x")
q(13, 4, '4', '', 'calculation', SHARE, '',
  "<p>Henry and Arthur share £65 in the ratio 4 : 9</p><p>How much money does Arthur receive?</p>",
  "<b>£45</b> &mdash; 4 + 9 = 13 parts, one part is £5, and Arthur gets 9 × £5.", "45|£45|£45.00")
q(13, 5, '5', '', 'calculation', LINEQ, '', "<p>Solve</p><p>9(y + 3) = 45</p>",
  "<b>y = 2</b> &mdash; divide by 9 to get y + 3 = 5, then subtract 3.", "y = 2|y=2|2")

SUBS  = 'Substitution'
CMEAS = 'Compound Measures'
EXPEC = 'Relative Frequency & Expectation'
# ================================ 14 November ======================================================
q(14, 1, '1', '', 'calculation', PROB, 'letters',
  "<p><b>Figure:</b> five letters scattered on the page: A, C, A, B, A (three A's, one B and one"
  " C).</p><p>What is the probability of selecting an A or B?</p>",
  "<b>4/5</b> &mdash; 3 A's and 1 B make 4 of the 5 letters.", "4/5|0.8",
  "The letters were counted off the rendered page.")
q(14, 2, '2', '', 'calculation', CUBES, '', "<p>Write down the cube root of 125</p>",
  "<b>5</b> &mdash; 5 × 5 × 5 = 125.", "5")
q(14, 3, '3', '', 'calculation', SUBS, '', "<p>If x = 2</p><p>Work out 5x</p>",
  "<b>10</b> &mdash; 5 × 2 = 10.", "10")
q(14, 4, '4', '', 'calculation', SUBS, '', "<p>If y = 6</p><p>Work out 2y + 3</p>",
  "<b>15</b> &mdash; 2 × 6 + 3 = 15.", "15")
q(14, 5, '5', '', 'calculation', CMEAS, '',
  "<p>Ethan drives for 2 hours 45 minutes at an average speed of 36 mph.</p>"
  "<p>How far does Ethan drive?</p>",
  "<b>99 miles</b> &mdash; 2 hours 45 minutes is 2.75 hours, and 36 × 2.75 = 99.",
  "99|99 miles|99miles")
assert 36 * F(11, 4) == 99
q(14, 6, '6', '', 'calculation', EXPEC, '',
  "<p>Mrs Jenkins is organising a charity raffle.</p><p>She sells 800 tickets for £5 each.</p>"
  "<p>The probability that someone wins a prize is 0.1</p><p>Each prize cost £15</p>"
  "<p>The profit is donated to charity.</p>"
  "<p>Work out how much money Mrs Jenkins donates to charity.</p>",
  "<b>£2800</b> &mdash; tickets raise 800 × £5 = £4000; she expects 0.1 × 800 = 80 prizes costing"
  " 80 × £15 = £1200; £4000 − £1200 = £2800.", "2800|£2800|£2,800|2,800")
assert 800 * 5 - F('0.1') * 800 * 15 == 2800

SHAPE = '2-D Shapes'
RLGR  = 'Real-Life Graphs'
# ================================ 15 November ======================================================
q(15, 1, '1', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;2y + 17 = 5</p>",
  "<b>y = −6</b> &mdash; subtract 17 to get 2y = −12, then divide by 2.", "y = -6|y=-6|-6|y = −6|−6")
pre(15, '2', '', "<p>E = 2a + c</p>")
q(15, 2, '2', 'a', 'calculation', SUBS, '', "<p>Find E if a = 7 and c = 8</p>",
  "<b>E = 22</b> &mdash; 2 × 7 + 8 = 22.", "22|E = 22|E=22")
q(15, 3, '2', 'b', 'calculation', SUBS, '', "<p>Find E if a = 5.5 and c = 4.5</p>",
  "<b>E = 15.5</b> &mdash; 2 × 5.5 + 4.5 = 11 + 4.5 = 15.5.", "15.5|E = 15.5|E=15.5")
q(15, 4, '3', '', 'drawing', SHAPE, 'isometric-dots',
  "<p>Draw a rhombus on the isometric dots.</p><p><b>Figure:</b> four rows of isometric dots,"
  " alternately three and four dots, each row offset by half a gap.</p>",
  "<b>any four-sided shape with all four sides the same length</b> &mdash; e.g. join four dots"
  " that make two equilateral triangles back to back (a 60°/120° rhombus).", '',
  'Many drawings are correct, so it is left for a person to mark.')
pre(15, '4', 'line-graph',
  "<p><b>Figure:</b> a conversion graph of Emirati Dirhams (0 to 350) against Pounds (£, 0 to 90)."
  " A straight line runs from (0, 0) to (£70, 350 Dirhams), passing through (£20, 100) and"
  " (£40, 200).</p>", "The line was read off the rendered graph: 5 Dirhams to the pound.")
q(15, 5, '4', 'a', 'calculation', RLGR, '', "<p>Convert 100 Dirhams into Pounds</p>",
  "<b>£20</b> &mdash; read across from 100 on the Dirhams axis to the line and down.",
  "20|£20|£20.00")
q(15, 6, '4', 'b', 'calculation', RLGR + ',Direct Proportion', '',
  "<p>Convert £800 into Dirhams</p>",
  "<b>4000 Dirhams</b> &mdash; £40 is 200 Dirhams, and £800 is 20 times that: 200 × 20 = 4000.",
  "4000|4000 Dirhams|4,000")
assert 200 * (800 // 40) == 4000

CIRC  = 'Area & Circumference of Circles'
# ================================ 16 November ======================================================
q(16, 1, '1', '', 'calculation', INDX, '', "<p>Work out &nbsp;5<sup>3</sup></p>",
  "<b>125</b> &mdash; 5 × 5 × 5 = 125.", "125")
q(16, 2, '2', '', 'calculation', 'Direct Proportion', '',
  "<p>A telephone call is 30p for 5 minutes.</p><p>How much will 8 minutes cost?</p>",
  "<b>48p</b> &mdash; one minute costs 30 ÷ 5 = 6p, and 8 × 6 = 48.", "48p|48|£0.48|0.48")
q(16, 3, '3', '', 'calculation', UNITS, '',
  "<p>Arlo is 1.53m tall.</p><p>Hannah is 4cm shorter than Arlo.</p><p>What is Hannah's height?</p>",
  "<b>1.49m</b> &mdash; 4cm is 0.04m, and 1.53 − 0.04 = 1.49.", "1.49m|1.49|1.49 m|149cm|149 cm")
q(16, 4, '4', '', 'calculation', PCTAM, '',
  "<p>Narinder is paid £1400 a month.</p><p>Every month she saves 30%.</p><p>How many months will"
  " it take Narinder to save £3000?</p>",
  "<b>8 months</b> &mdash; she saves 30% of £1400 = £420 a month; 7 months is £2940, just short,"
  " so it takes 8.", "8|8 months")
assert 7 * 420 < 3000 <= 8 * 420 and F(30, 100) * 1400 == 420
q(16, 5, '5', '', 'calculation', CIRC, 'circle',
  "<p><b>Figure:</b> a circle with a radius of 5cm.</p><p>Calculate the circumference</p>",
  "<b>31.4 cm</b> (10π) &mdash; circumference = 2πr = 2 × π × 5 = 31.415…",
  "31.4|31.4cm|31.4 cm|10π|31.42|31.416", "The radius was read off the rendered drawing.")

# ================================ 17 November ======================================================
q(17, 1, '1', '', 'calculation', VOLSA, 'cuboid',
  "<p><b>Figure:</b> a cuboid made of centimetre cubes, 4cm long, 2cm high and 2cm deep.</p>"
  "<p>Find the surface area of this cuboid.</p>",
  "<b>40 cm²</b> &mdash; two faces of 4 × 2 = 8, two of 4 × 2 = 8 and two of 2 × 2 = 4:"
  " 2(8 + 8 + 4) = 40.", "40|40 cm2|40cm2|40 cm²", "The dimensions were read off the rendered drawing.")
assert 2 * (4 * 2 + 4 * 2 + 2 * 2) == 40
q(17, 2, '2', '', 'short', CUBES, '',
  "<p>Circle all the cube numbers.</p><p>20 &nbsp; 64 &nbsp; 1 &nbsp; 343 &nbsp; 300 &nbsp; 726"
  " &nbsp; 150 &nbsp; 81</p>",
  "<b>64, 1 and 343</b> &mdash; 4³ = 64, 1³ = 1 and 7³ = 343; none of the others is a cube"
  " (9³ = 729, not 726).")
assert sorted(n for n in (20, 64, 1, 343, 300, 726, 150, 81) if round(n ** (1 / 3)) ** 3 == n) == [1, 64, 343]
q(17, 3, '3', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;y + 9 = 13</p>",
  "<b>y = 4</b> &mdash; subtract 9 from both sides.", "y = 4|y=4|4")
q(17, 4, '4', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;5x = 35</p>",
  "<b>x = 7</b> &mdash; divide both sides by 5.", "x = 7|x=7|7")
q(17, 5, '5', '', 'calculation', EXPND, '', "<p>Expand &nbsp;4(y + 2)</p>",
  "<b>4y + 8</b> &mdash; 4 × y and 4 × 2.", "4y + 8|4y+8|8 + 4y")
q(17, 6, '6', '', 'calculation', EXPND, '', "<p>Expand &nbsp;5(w − 2)</p>",
  "<b>5w − 10</b> &mdash; 5 × w and 5 × −2.", "5w - 10|5w-10|5w − 10")
q(17, 7, '7', '', 'explain', PARAL, 'parallel-lines',
  "<p><b>Figure</b> (not drawn accurately): parallel lines AB and CD (marked with arrows) are"
  " crossed by a vertical line. At AB, the angle below AB on the left of the vertical line is 135°."
  " At CD, the angle above CD on the left of the vertical line is x; the angle below CD on the"
  " right of it is marked y.</p>"
  "<p>Work out the size of the angle marked x.</p><p>Give a reason for your answer.</p>",
  "<b>x = 45°</b> &mdash; x and 135° are co-interior (allied) angles between parallel lines, so"
  " they add up to 180°: 180 − 135 = 45.", "", "The angles were read off the arcs on the rendered drawing.")

REFL  = 'Reflections'
SLG   = 'Straight Line Graphs'
# ================================ 18 November ======================================================
q(18, 1, '1', '', 'calculation', INDX, '', "<p>Work out &nbsp;3<sup>4</sup></p>",
  "<b>81</b> &mdash; 3 × 3 × 3 × 3 = 81.", "81")
q(18, 2, '2', '', 'calculation', MONEY + ',' + DIV, '',
  "<p>A car park costs £0.05 per minute.</p><p>Amelia parked in the car park at 2pm.</p>"
  "<p>When she left she had to pay £3.70</p><p>What time did Amelia leave the car park?</p>",
  "<b>3:14pm</b> &mdash; £3.70 ÷ £0.05 = 74 minutes, which is 1 hour 14 minutes after 2pm.",
  "3:14pm|3:14 pm|3.14pm|15:14|3:14")
assert F('3.70') / F('0.05') == 74
pre(18, '3', 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x and y from −6 to 6. Shape C is a block with a notch"
  " cut up into its bottom edge; its corners are (2, 5), (5, 5), (5, 3), (4, 3), (4, 4), (3, 4),"
  " (3, 3) and (2, 3).</p>", "The corners were read off the rendered grid.")
q(18, 3, '3', 'a', 'drawing', SLG, '', "<p>Draw the line y = 1</p>",
  "<b>a horizontal line through (0, 1)</b> &mdash; every point on it has a y-coordinate of 1.", '',
  'The answer is a drawing, so it is left for a person to mark.')
q(18, 4, '3', 'b', 'drawing', REFL, '', "<p>Reflect shape C in the line y = 1</p>",
  "<b>corners at (2, −3), (5, −3), (5, −1), (4, −1), (4, −2), (3, −2), (3, −1) and (2, −1)</b>"
  " &mdash; each corner moves to the same distance on the other side of y = 1, so (x, y) goes to"
  " (x, 2 − y).", '', DRAWN)
q(18, 5, '4', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;4(x − 7) = 48</p>",
  "<b>x = 19</b> &mdash; divide by 4 to get x − 7 = 12, then add 7.", "x = 19|x=19|19")

TTERM = 'Term-to-Term Rules'
# ================================ 19 November ======================================================
q(19, 1, '1', '', 'calculation', SCALE, '',
  "<p>A map has a scale of 1cm : 4 kilometres.</p><p>The actual distance between two cities is 56"
  " kilometres.</p><p>What is the distance between the cities on the map?</p>",
  "<b>14cm</b> &mdash; each centimetre is 4km, so 56 ÷ 4 = 14.", "14cm|14 cm|14")
pre(19, '2', '', "<p>Here are the first four terms of a sequence</p><p>3 &nbsp; 9 &nbsp; 15 &nbsp; 21</p>")
q(19, 2, '2', 'a', 'calculation', TTERM, '', "<p>What is the fifth term of the sequence?</p>",
  "<b>27</b> &mdash; the terms go up by 6, and 21 + 6 = 27.", "27")
q(19, 3, '2', 'b', 'calculation', NTERM, '', "<p>What is the tenth term of the sequence?</p>",
  "<b>57</b> &mdash; the nth term is 6n − 3, and 6 × 10 − 3 = 57.", "57")
assert [6 * n - 3 for n in (1, 2, 3, 4, 5, 10)] == [3, 9, 15, 21, 27, 57]
pre(19, '3', 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x from 0 to 5 and y from 0 to 5.</p>")
q(19, 4, '3', 'a', 'drawing', SLG, '', "<p>Draw x = 4</p>",
  "<b>a vertical line through (4, 0)</b> &mdash; every point on it has an x-coordinate of 4.", '',
  'The answer is a drawing, so it is left for a person to mark.')
q(19, 5, '3', 'b', 'drawing', SLG, '', "<p>Draw y = 2x</p>",
  "<b>a straight line through (0, 0), (1, 2) and (2, 4)</b> &mdash; each y is double its x.", '',
  'The answer is a drawing, so it is left for a person to mark.')
q(19, 6, '4', '', 'calculation', MONEY, '',
  "<p>Kate buys 0.5kg of bananas and 0.8kg of carrots.</p><p>The carrots cost £1.20 per"
  " kilogram</p><p>The total cost is £1.81</p><p>Work out the cost of 1 kg of bananas</p>",
  "<b>£1.70</b> &mdash; the carrots cost 0.8 × £1.20 = £0.96, so 0.5kg of bananas cost"
  " £1.81 − £0.96 = £0.85, and 1kg costs £1.70.", "1.70|£1.70|1.7|£1.7|170p")
assert (F('1.81') - F('0.8') * F('1.20')) / F('0.5') == F('1.7')

PCIRC = 'Parts of a Circle'
FORMS = 'Formulae'
# ================================ 20 November ======================================================
q(20, 1, '1', '', 'short', PCIRC, 'circle',
  "<p><b>Figure:</b> a circle with centre O. A straight line joins two points B and C on the"
  " circle and does not pass through O.</p><p>What is the name of the line BC?</p>",
  "<b>A chord</b> &mdash; a straight line joining two points on a circle that does not go through"
  " the centre.", "chord|a chord")
pre(20, '2', '', "<p>In a theatre there are 38 rows of seats.</p><p>Each row has 14 seats.</p>")
q(20, 2, '2', 'a', 'calculation', MULT, '', "<p>How many seats are there in total?</p>",
  "<b>532</b> &mdash; 38 × 14 = 532.", "532")
q(20, 3, '2', 'b', 'calculation', DIV + ',' + 'Subtraction', '',
  "<p>The price of a ticket is £12</p><p>During a show, the total cost of the tickets sold was"
  " £5436</p><p>How many tickets were not sold?</p>",
  "<b>79</b> &mdash; £5436 ÷ £12 = 453 tickets sold, and 532 − 453 = 79.", "79")
assert 38 * 14 - 5436 // 12 == 79 and 5436 % 12 == 0
q(20, 4, '3', '', 'short', FORMS, '',
  "<p>Circle the correct word to describe &nbsp;6y + z</p><p>Equation &nbsp; Expression &nbsp;"
  " Identity</p>",
  "<b>Expression</b> &mdash; it has no equals sign.", "Expression")
q(20, 5, '4', '', 'calculation', COLLT, '', "<p>Simplify fully</p><p>4a − 5c + a − 2c</p>",
  "<b>5a − 7c</b> &mdash; 4a + a = 5a and −5c − 2c = −7c.", "5a - 7c|5a-7c|5a − 7c")
q(20, 6, '5', '', 'calculation', EXPND, '', "<p>Expand and simplify</p><p>5(x + 5) − 4(x − 2)</p>",
  "<b>x + 33</b> &mdash; 5x + 25 − 4x + 8 = x + 33.", "x + 33|x+33|33 + x")

SQRT  = 'Squares & Square Roots'
PIE   = 'Pie Charts'
BARC  = 'Bar Charts & Pictograms'
# ================================ 21 November ======================================================
q(21, 1, '1', '', 'calculation', SQRT, '', "<p>Calculate &nbsp;√71.2336</p>",
  "<b>8.44</b> &mdash; 8.44 × 8.44 = 71.2336.", "8.44")
assert F('8.44') ** 2 == F('71.2336')
q(21, 2, '2', '', 'calculation', SEQ, '',
  "<p>Write down the next term in this sequence.</p><p>2 &nbsp; 6 &nbsp; 18 &nbsp; 54 &nbsp; ……</p>",
  "<b>162</b> &mdash; each term is 3 times the one before: 54 × 3 = 162.", "162")
q(21, 3, '3', '', 'calculation', TTERM, '',
  "<p>Write down the next term in this sequence.</p><p>a &nbsp; 2a + 1 &nbsp; 3a + 2 &nbsp; 4a + 3"
  " &nbsp; ……</p>",
  "<b>5a + 4</b> &mdash; the number of a's goes up by 1 and the number added goes up by 1.",
  "5a + 4|5a+4|4 + 5a")
q(21, 4, '4', '', 'calculation', AVGR, 'number-cards',
  "<p>Here are four number cards.</p><p><b>Figure:</b> four blank cards.</p><p>The mode is"
  " 11.</p><p>The median is 9.</p><p>The range is 8.</p><p>Find the mean.</p>",
  "<b>8</b> &mdash; the mode 11 needs the two largest cards to be 11; a median of 9 makes the"
  " second card 7; a range of 8 makes the smallest 3. So the cards are 3, 7, 11, 11 and the mean is"
  " 32 ÷ 4 = 8.", "8")
C = [3, 7, 11, 11]
assert (C[1] + C[2]) / 2 == 9 and C[-1] - C[0] == 8 and sum(C) / 4 == 8
q(21, 5, '5', '', 'drawing', PIE + ',' + BARC, 'pie-chart',
  "<p>The pie chart shows the holiday destinations of 60 people.</p><p><b>Figure:</b> a pie chart"
  " with four sectors: Italy 90°, France 138°, Spain 72° and Portugal 60°. Beside it is an empty"
  " grid for a bar chart.</p><p>Draw a bar chart to represent this information.</p>",
  "<b>bars of Italy 15, France 23, Spain 12, Portugal 10</b> &mdash; 360° ÷ 60 people = 6° a"
  " person, so divide each angle by 6; label both axes.", '',
  'The angles were read off the rendered pie chart. The answer is a drawing, so it is left for a'
  ' person to mark.')
assert 90 + 138 + 72 + 60 == 360 and [a // 6 for a in (90, 138, 72, 60)] == [15, 23, 12, 10]

PROPS = 'Properties of Shapes'
POLY  = 'Angles in Polygons'
# ================================ 22 November ======================================================
q(22, 1, '1', '', 'short', PROPS, 'shape',
  "<p><b>Figure:</b> a semicircle (the flat edge on the right).</p>"
  "<p>State the order of rotational symmetry</p>",
  "<b>1</b> &mdash; it only looks the same once in a full turn.", "1|order 1")
q(22, 2, '2', '', 'short', PROPS, 'shape',
  "<p><b>Figure:</b> the recycling symbol — three identical bent arrows chasing each other round a"
  " triangle.</p><p>State the order of rotational symmetry</p>",
  "<b>3</b> &mdash; it looks the same three times in a full turn, once for each arrow.",
  "3|order 3")
SPIN = [1, 4, 4, 2, 3, 4, 5, 1, 4, 1]
q(22, 3, '3', '', 'calculation', 'Median', '',
  "<p>Lily has a spinner that has sections labelled 1 to 5.</p><p>She spins the spinner 10"
  " times.</p><p>Here are her scores.</p><p>1 &nbsp; 4 &nbsp; 4 &nbsp; 2 &nbsp; 3<br>4 &nbsp; 5"
  " &nbsp; 1 &nbsp; 4 &nbsp; 1</p><p>Work out the median</p>",
  "<b>3.5</b> &mdash; in order 1, 1, 1, 2, 3, 4, 4, 4, 4, 5; the middle two are 3 and 4.", "3.5")
assert sorted(SPIN)[4:6] == [3, 4]
q(22, 4, '4', '', 'calculation', POLY, '',
  "<p>Complete the table</p>"
  + T(['Shape', 'Angles add up to'], [['Triangle', '180°'], ['Quadrilateral', '360°'],
                                       ['Pentagon', ''], ['Hexagon', '']]),
  "<b>Pentagon 540°, Hexagon 720°</b> &mdash; each extra side adds another triangle, another"
  " 180°: (n − 2) × 180.")
q(22, 5, '5', '', 'calculation', PRIME, '', "<p>Write 70 as a product of primes</p>",
  "<b>2 × 5 × 7</b> &mdash; 70 = 2 × 35 = 2 × 5 × 7.", "2 × 5 × 7|2x5x7|2 x 5 x 7")
q(22, 6, '6', '', 'calculation', PCTAM, '',
  "<p>Adam wins £500 in a competition.</p><p>He gives 20% of the money to his aunt.</p><p>He"
  " gives 7% of the money to his brother.</p><p>How much money does Adam have left?</p>",
  "<b>£365</b> &mdash; he gives away 20% + 7% = 27%, keeping 73%, and 73% of £500 is £365.",
  "365|£365|£365.00")
assert F(73, 100) * 500 == 365

ENLG  = 'Enlargements'
# ================================ 23 November ======================================================
q(23, 1, '1', '', 'calculation', FORMS + ',' + COLLT, '',
  "<p>Oranges cost x pence each.</p><p>Apples cost y pence each.</p><p>Write an expression for the"
  " total cost of an orange and 2 apples.</p>",
  "<b>x + 2y</b> &mdash; one orange is x and two apples are 2y.", "x + 2y|x+2y|2y + x|2y+x")
q(23, 2, '2', '', 'calculation', PERIM, 'l-shape',
  "<p><b>Figure:</b> an L-shape. Its left side is 9cm, its bottom is 10cm, its top (the narrow"
  " upright part) is 4cm wide, and the short vertical edge on the right is 4cm.</p>"
  "<p>Calculate the perimeter</p>",
  "<b>38cm</b> &mdash; the missing horizontal edge is 10 − 4 = 6cm and the missing vertical edge"
  " is 9 − 4 = 5cm, so 9 + 10 + 4 + 6 + 5 + 4 = 38.", "38|38cm|38 cm",
  "The lengths were read off the rendered drawing.")
assert 9 + 10 + 4 + (10 - 4) + (9 - 4) + 4 == 38
q(23, 3, '3', '', 'drawing', ENLG, 'square-grid',
  "<p><b>Figure:</b> a square grid with a centre point P near its top-left corner. Measured from P"
  " in squares (right, down), the shape's corners are (0, 1), (1, 1), (1, 0), (2, 0), (2, 1),"
  " (3, 1), (3, 2) and (0, 2): a 3-by-1 bar with a 1-by-1 square on top of its middle.</p>"
  "<p>Enlarge the shape with scale factor 3 using P as the centre of enlargement.</p>",
  "<b>corners at (0, 3), (3, 3), (3, 0), (6, 0), (6, 3), (9, 3), (9, 6) and (0, 6) squares from P"
  "</b> &mdash; multiply every distance from P by 3: a 9-by-3 bar with a 3-by-3 square on top of"
  " its middle.", '', 'The corners were read off the rendered grid. ' + DRAWN)
q(23, 4, '4', '', 'calculation', PIE, 'pie-chart',
  "<p><b>Figure:</b> a pie chart of five teams. Ireland is a right angle (90°), England is 120°,"
  " France is 45° and Wales is 45°; Scotland's angle is not marked.</p>"
  "<p>2400 fans were asked which team they support.</p><p>How many support Scotland?</p>",
  "<b>400</b> &mdash; Scotland's angle is 360 − 90 − 120 − 45 − 45 = 60°, and 60/360 of 2400 is"
  " 400.", "400", "The angles were read off the rendered pie chart; Ireland's sector is drawn as a"
  " quarter of the circle.")
assert F(360 - 90 - 120 - 45 - 45, 360) * 2400 == 400

TRIQ  = 'Angles in Triangles & Quadrilaterals'
# ================================ 24 November ======================================================
q(24, 1, '1', '', 'calculation', FDP + ',' + 'Equivalent & Simplifying Fractions', '',
  "<p>Write 0.08 as a fraction in its simplest form</p>",
  "<b>2/25</b> &mdash; 0.08 = 8/100, and dividing top and bottom by 4 gives 2/25.")
assert F('0.08') == F(2, 25)
q(24, 2, '2', '', 'calculation', FDP + ',' + 'Equivalent & Simplifying Fractions', '',
  "<p>Write 14% as a fraction in its simplest form</p>",
  "<b>7/50</b> &mdash; 14% = 14/100, and dividing top and bottom by 2 gives 7/50.")
assert F(14, 100) == F(7, 50)
q(24, 3, '3', '', 'calculation', INDX, '', "<p>Work out &nbsp;2<sup>4</sup></p>",
  "<b>16</b> &mdash; 2 × 2 × 2 × 2 = 16.", "16")
q(24, 4, '4', '', 'short', TRIQ, '',
  "<p>One angle in an isosceles triangle is 50°.</p><p>Write down the sizes of the other two"
  " angles.</p><p>Write two different possible answers.</p>",
  "<b>50° and 80°, or 65° and 65°</b> &mdash; either 50° is one of the two equal angles"
  " (180 − 50 − 50 = 80), or it is the odd angle ((180 − 50) ÷ 2 = 65).")
q(24, 5, '5', '', 'calculation', TWOWY, '',
  "<p>The two-way table gives some information about the football teams 50 students support.</p>"
  + T(['', 'Rovers', 'City', 'United', 'Total'],
      [['female', '11', '12', '3', ''], ['male', '', '', '7', ''], ['Total', '', '20', '', '50']])
  + "<p>Complete the two-way table.</p>",
  "<b>female total 26; male: Rovers 9, City 8, total 24; totals: Rovers 20, United 10</b> &mdash;"
  " 11 + 12 + 3 = 26, 20 − 12 = 8, 3 + 7 = 10, 50 − 20 − 10 = 20, 20 − 11 = 9, and 9 + 8 + 7 = 24.")
assert 9 + 8 + 7 == 24 and 26 + 24 == 50 and 20 + 20 + 10 == 50
q(24, 6, '6', '', 'calculation', FORMS, '',
  "<p>Y pounds is shared equally among n children.</p><p>Write down a formula for the amount, A,"
  " that each child should receive</p>",
  "<b>A = Y/n</b> &mdash; share Y equally between n: divide Y by n.", "A = Y/n|A=Y/n|A = Y ÷ n")

MIXED = 'Mixed Numbers'
REARR = 'Rearranging Formulae'
# ================================ 25 November ======================================================
q(25, 1, '1', '', 'short', PROB, 'spinner',
  "<p><b>Figure:</b> a triangular spinner divided into three equal blank sections, with a pointer"
  " through its centre.</p><p>This spinner has three sections.</p><p>It is certain to land on an"
  " <b>even</b> number.</p><p>Label the spinner.</p>",
  "<b>an even number in every section, e.g. 2, 4 and 6</b> &mdash; certain means every possible"
  " outcome is even.", '', 'Many labellings are correct, so it is left for a person to mark.')
q(25, 2, '2', '', 'calculation', MIXED, '',
  "<p>Write &nbsp;5<sup>3</sup>&frasl;<sub>4</sub> &nbsp;as a top heavy fraction</p>",
  "<b>23/4</b> &mdash; 5 wholes are 20 quarters, and 20 + 3 = 23 quarters.", "23/4")
assert 5 + F(3, 4) == F(23, 4)
q(25, 3, '3', '', 'calculation', BEST, '',
  "<p>3kg of strawberries cost £8.25</p><p>Work out the cost of 5kg of strawberries.</p>",
  "<b>£13.75</b> &mdash; 1kg costs £8.25 ÷ 3 = £2.75, and 5 × £2.75 = £13.75.",
  "13.75|£13.75")
assert F('8.25') / 3 * 5 == F('13.75')
q(25, 4, '4', '', 'calculation', CIRC, 'circle',
  "<p><b>Figure:</b> a circle with a diameter of 16cm.</p><p>Calculate the area</p>",
  "<b>201.1 cm²</b> (64π) &mdash; the radius is 8cm, and πr² = π × 64 = 201.06…",
  "201.1|201.06|201|64π|201.1 cm2|201.1cm2|201.1 cm²", "The diameter was read off the rendered drawing.")
q(25, 5, '5', '', 'calculation', REARR, '',
  "<p>Rearrange &nbsp;x = y + 5 &nbsp;to make y the subject.</p>",
  "<b>y = x − 5</b> &mdash; subtract 5 from both sides.", "y = x - 5|y=x-5|y = x − 5")

SHAPE3 = '3-D Shapes'
PCTID  = 'Percentage Increase & Decrease'
# ================================ 26 November ======================================================
q(26, 1, '1', '', 'calculation', PCTID, '', "<p>Increase 80 by 20%</p>",
  "<b>96</b> &mdash; 20% of 80 is 16, and 80 + 16 = 96.", "96")
q(26, 2, '2', '', 'calculation', PCTID, '', "<p>Increase 140 by 150%</p>",
  "<b>350</b> &mdash; 150% of 140 is 210, and 140 + 210 = 350 (or 140 × 2.5).", "350")
assert 80 * F(120, 100) == 96 and 140 * F(250, 100) == 350
q(26, 3, '3', '', 'calculation', LAWIX, '',
  "<p>Simplify</p><p>5x<sup>4</sup> × 3x<sup>5</sup></p>",
  "<b>15x<sup>9</sup></b> &mdash; 5 × 3 = 15 and x⁴ × x⁵ = x⁹ (add the powers).", "15x^9|15x⁹")
q(26, 4, '4', '', 'drawing', ROT, 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x from −6 to 6 and y from −5 to 5. Shape A is a"
  " quadrilateral with corners at (2, 3), (4, 4), (4, 2) and (2, 2).</p>"
  "<p>Rotate shape A 180° about the origin</p>",
  "<b>corners at (−2, −3), (−4, −4), (−4, −2) and (−2, −2)</b> &mdash; a half turn about the"
  " origin sends (x, y) to (−x, −y).", '', DRAWN)
q(26, 5, '5', '', 'short', SHAPE3, '',
  "<p>The front elevation of a solid shape is a triangle.</p><p>The side elevation of the solid"
  " shape is a triangle.</p><p>The plan view of the solid shape is a square.</p><p>Write down the"
  " name of the shape.</p>",
  "<b>A square-based pyramid</b> &mdash; a square base seen from above, rising to a point seen"
  " from the front and the side.", "square-based pyramid|square based pyramid|square pyramid")

# ================================ 27 November ======================================================
q(27, 1, '1', '', 'calculation', CALCD, '', "<p>Work out &nbsp;0.7 × 0.6</p>",
  "<b>0.42</b> &mdash; 7 × 6 = 42, and there are two decimal places in the question.", "0.42|.42")
q(27, 2, '2', '', 'calculation', INDX, '', "<p>Work out &nbsp;6<sup>3</sup></p>",
  "<b>216</b> &mdash; 6 × 6 × 6 = 216.", "216")
q(27, 3, '3', '', 'calculation', PROB, '',
  "<p>There are pink, yellow, green and blue beads in a bag.</p><p>The table shows the probability"
  " of picking each colour at random.</p>"
  + T(['Colour', 'Pink', 'Yellow', 'Green', 'Blue'], [['Probability', '0.5', '', '0.1', '0.2']])
  + "<p>Find the missing probability</p>",
  "<b>0.2</b> &mdash; the probabilities add up to 1, and 1 − 0.5 − 0.1 − 0.2 = 0.2.", "0.2|.2|1/5")
assert 1 - F('0.5') - F('0.1') - F('0.2') == F('0.2')
q(27, 4, '4', '', 'calculation', SUBS, '',
  "<p>c = 8</p><p>d = 3</p><p>Work out the value of &nbsp;2c − 7d</p>",
  "<b>−5</b> &mdash; 2 × 8 − 7 × 3 = 16 − 21 = −5.", "-5|−5")
q(27, 5, '5', '', 'calculation', MONEY, '',
  "<p>Each week Mrs Jones earns 20p commission on each ticket she sells for the first 100 tickets"
  " and 30p per ticket for any extra tickets she sells.</p><p>Last week she sold 130 tickets</p>"
  "<p>How much did she earn?</p>",
  "<b>£29</b> &mdash; 100 × 20p = £20 and the other 30 tickets earn 30 × 30p = £9.",
  "29|£29|£29.00|2900p")
assert 100 * 20 + 30 * 30 == 2900
q(27, 6, '6', '', 'calculation', ADDF, '',
  "<p>Find the number halfway between</p><p><sup>2</sup>&frasl;<sub>5</sub> &nbsp;and&nbsp;"
  " <sup>9</sup>&frasl;<sub>10</sub></p>",
  "<b>13/20 (0.65)</b> &mdash; 2/5 = 4/10, and halfway between 4/10 and 9/10 is (4/10 + 9/10) ÷ 2 ="
  " 13/20.", "13/20|0.65")
assert (F(2, 5) + F(9, 10)) / 2 == F(13, 20)

RATIO = 'Writing & Simplifying Ratio'
OOO   = 'Order of Operations'
# ================================ 28 November ======================================================
q(28, 1, '1', '', 'calculation', CUBES, '', "<p>Work out &nbsp;∛1000</p>",
  "<b>10</b> &mdash; 10 × 10 × 10 = 1000.", "10")
q(28, 2, '2', '', 'calculation', RATIO + ',' + UNITS, '',
  "<p>Write down the ratio of 50g to 1kg.</p><p>Give your answer in its simplest form.</p>",
  "<b>1 : 20</b> &mdash; 1kg is 1000g, and 50 : 1000 divides by 50 to 1 : 20.")
q(28, 3, '3', '', 'short', OOO + ',' + 'Inequalities', '',
  "<p>Write the correct symbol in each box to make the statements correct</p>"
  "<p>&gt; &nbsp; = &nbsp; &lt;</p>"
  "<p>75 × 12 &nbsp;☐&nbsp; 30 × 40</p><p>4<sup>3</sup> &nbsp;☐&nbsp; 50 + 6 × 2</p>"
  "<p>4 × 3 × 2 × 1 × 0 &nbsp;☐&nbsp; 4,444 ÷ 4,444</p><p>2 − 3 &nbsp;☐&nbsp; 20 − 30</p>",
  "<b>&lt;, &gt;, &lt;, &gt;</b> &mdash; 900 &lt; 1200; 64 &gt; 62; 0 &lt; 1; −1 &gt; −10.")
assert 75 * 12 < 30 * 40 and 4 ** 3 > 50 + 6 * 2 and 0 < 4444 // 4444 and 2 - 3 > 20 - 30
q(28, 4, '4', '', 'calculation', PROB, '',
  "<p>There are 50 sweets in a jar.</p><p>15 of the sweets are yellow and the rest are red.</p>"
  "<p>A sweet is picked at random.</p><p>Find the probability that the sweet is red.</p>",
  "<b>35/50 = 7/10</b> &mdash; 50 − 15 = 35 of the sweets are red.", "7/10|35/50|0.7")

PLANS = '3-D Shapes'
RPROB = 'Ratio Problems'
# ================================ 29 November ======================================================
SOLID = ('The solid was read off the rendered isometric drawing. The answers are drawings, so they'
         ' are left for a person to mark.')
pre(29, '1', 'isometric',
  "<p><b>Figure:</b> a solid made of centimetre cubes, with an arrow marking the front. It is a"
  " block 3 cubes wide, 2 cubes deep and 2 cubes high, with one more column of 2 cubes standing"
  " against its right-hand side at the back (so that column is set back one cube from the"
  " front).</p><p>Each answer is drawn on a square grid.</p>", SOLID)
q(29, 1, '1', 'a', 'drawing', PLANS, '', "<p>Draw the front elevation</p>",
  "<b>a rectangle 4 squares wide and 2 squares high</b> &mdash; from the front all four columns show,"
  " each 2 cubes high.", '', SOLID)
q(29, 2, '1', 'b', 'drawing', PLANS, '', "<p>Draw the side elevation</p>",
  "<b>a square 2 squares wide and 2 squares high</b> &mdash; from the side the solid is 2 cubes"
  " deep and 2 cubes high.", '', SOLID)
q(29, 3, '1', 'c', 'drawing', PLANS, '', "<p>Draw the plan view</p>",
  "<b>a back row of 4 squares with a front row of 3 squares under its left-hand three</b> &mdash;"
  " from above, the extra column fills only the back right.", '', SOLID)
q(29, 4, '2', '', 'calculation', BEST + ',' + 'Fractions of an Amount', '',
  "<p><sup>1</sup>&frasl;<sub>4</sub> kg of blueberries cost £1.24</p><p>Work out the cost of 2kg"
  " of blueberries</p>",
  "<b>£9.92</b> &mdash; 1kg costs 4 × £1.24 = £4.96, and 2kg cost £9.92.", "9.92|£9.92")
assert F('1.24') * 4 * 2 == F('9.92')
q(29, 5, '3', '', 'calculation', RATIO + ',Fractions', '',
  "<p>There are only red sweets and green sweets in a jar.</p><p>The ratio of red sweets to green"
  " sweets is 2:5</p><p>What fraction of the sweets are red?</p>",
  "<b>2/7</b> &mdash; there are 2 + 5 = 7 parts and 2 of them are red.", "2/7")
q(29, 6, '4', '', 'calculation', SHARE, '',
  "<p>Natalie, Olivia and Hugo share 240 sweets in the ratio 3:5:4</p><p>How many more sweets"
  " does Olivia have than Hugo?</p>",
  "<b>20</b> &mdash; 3 + 5 + 4 = 12 parts, so one part is 20; Olivia has one more part than Hugo.",
  "20")
assert 240 // 12 * (5 - 4) == 20

CONG  = 'Congruent Triangles'
# ================================ 30 November ======================================================
q(30, 1, '1', '', 'calculation', MIXED, '',
  "<p>Write &nbsp;<sup>90</sup>&frasl;<sub>11</sub> &nbsp;as a mixed number</p>",
  "<b>8 2/11</b> &mdash; 11 goes into 90 eight times (88) with 2 left over.", "8 2/11")
assert F(90, 11) == 8 + F(2, 11)
q(30, 2, '2', '', 'short', CONG, 'triangles',
  "<p><b>Figure:</b> five triangles in different positions. Top left: a right-angled triangle"
  " with a short upright side and a long base. Top right: an isosceles triangle lying on its side,"
  " pointing right. Bottom left: an isosceles triangle standing on its base. Bottom middle: a"
  " right-angled triangle whose two shorter sides are equal. Bottom right: a tall, leaning"
  " triangle.</p><p>Tick the triangles that are congruent.</p>",
  "<b>the top-right triangle and the bottom-left triangle</b> &mdash; both are isosceles with the"
  " same base and the same two equal sides; one is simply turned on its side.", '',
  'Measured off the rendered page: the top-right and bottom-left triangles both have sides of about'
  ' 158, 212 and 212 units; no other two triangles match. Left for a person to mark.')
q(30, 3, '3', '', 'calculation', PCTAM, '',
  "<p>Kylo and Nathanael sit a test worth 70 marks.</p><p>Kylo gets 33 marks in the test.</p>"
  "<p>Nathanael gets 40%.</p><p>Work out the difference between their marks.</p>",
  "<b>5 marks</b> &mdash; 40% of 70 is 28, and 33 − 28 = 5.", "5|5 marks")
assert 33 - F(40, 100) * 70 == 5
q(30, 4, '4', '', 'drawing', PIE, '',
  T(['Make', 'Frequency'], [['Ford', '8'], ['Mazda', '14'], ['Volkswagen', '21'],
                                     ['Fiat', '20'], ['Honda', '9']])
  + "<p>Calculate the size of each angle and then draw an accurate pie chart.</p>"
  "<p>(A circle is drawn with one radius already in place.)</p>",
  "<b>Ford 40°, Mazda 70°, Volkswagen 105°, Fiat 100°, Honda 45°</b> &mdash; the total is 72,"
  " so each car is 360 ÷ 72 = 5°; multiply each frequency by 5.", '',
  'The angles are exact; the pie chart is a drawing, so it is left for a person to mark.')
assert 8 + 14 + 21 + 20 + 9 == 72 and [f * 5 for f in (8, 14, 21, 20, 9)] == [40, 70, 105, 100, 45]
