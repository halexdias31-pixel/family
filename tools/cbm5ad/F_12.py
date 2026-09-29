"""Corbettmaths Foundation 5-a-day — December. See common.py and tools/insert-cbm-5ad-jan-FP.py.

Every page was rendered and read, because the text layer drops the fractions, the indices and every
number printed inside a picture. The December book is a grid: each of the page's five rows is one
question, and where a row has two cells the right-hand one is either part (b) of the left (sharing a
`pre` stem) or the ask that finishes the left-hand stem, in which case the two cells are one row
here. `pos` counts the rows written, top to bottom. Corbettmaths prints no answers, so every answer
is worked out from the transcribed question, with Fraction arithmetic and asserts where there is
arithmetic to check.
"""
import pathlib, sys
from fractions import Fraction as F
from math import gcd
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from common import Month, T, NO_SCHEME
MONTH = Month(12, '1F1Ksg-VXW0f668-CimNatQZNrAin0cyJ')
q, pre = MONTH.q, MONTH.pre

def lcm(a, b): return a * b // gcd(a, b)

CALCD = 'Calculating with Decimals'
MIXED = 'Mixed Numbers'
HCF   = 'HCF & LCM'
NTH   = 'nth Term of a Linear Sequence'
BEST  = 'Best Value & Unitary Method'
UNITS = 'Units & Measures'
DRAWN = ('The picture is described in words from the rendered page; the answer is a drawing, so it'
         ' is left for a person to mark.')

# ================================ 1 December =======================================================
pre(1, '1', '', "<p>Given that 14.5 × 34 = 493</p>")
q(1, 1, '1', 'a', 'calculation', CALCD, '', "<p>Write down the value of 14.5 × 17</p>",
  "<b>246.5</b> &mdash; 17 is half of 34, so the answer is half of 493.", "246.5")
q(1, 2, '1', 'b', 'calculation', CALCD, '', "<p>Write down the value of 49.3 ÷ 14.5</p>",
  "<b>3.4</b> &mdash; 493 ÷ 14.5 = 34, and 49.3 is a tenth of 493, so the answer is 3.4.", "3.4")
assert F(145, 10) * 17 == F(4930, 20) and F(493, 10) / F(145, 10) == F(34, 10)
q(1, 3, '2', '', 'calculation', MIXED, '',
  "<p>Write <sup>11</sup>&frasl;<sub>2</sub> as a mixed number</p>",
  "<b>5 <sup>1</sup>&frasl;<sub>2</sub></b> &mdash; 2 goes into 11 five times with 1 left over.")
q(1, 4, '3', '', 'calculation', HCF, '',
  "<p>A bus leaves Derby Bus Station every 10 minutes. A train leaves Derby Train Station every"
  " 16 minutes.</p><p>At 9am a bus and a train leave the stations at the same time.</p>"
  "<p>When is the next time that a bus and train leave at the same time?</p>",
  "<b>10:20am</b> &mdash; the LCM of 10 and 16 is 80 minutes, and 80 minutes after 9am is 10:20am.",
  "10:20|10:20am|10.20|10.20am|10:20 am")
assert lcm(10, 16) == 80
q(1, 5, '4', '', 'calculation', NTH, '', "<p>Find the nth term of 2, 11, 20, 29, ...</p>",
  "<b>9n − 7</b> &mdash; the terms go up by 9, and 9 × 1 = 9 is 7 more than the first term 2.",
  "9n - 7|9n-7|9n − 7")
q(1, 6, '5', '', 'calculation', 'Ratio & Proportion', '',
  "<p>Kelly buys a 2 week holiday to California in March for £1800.</p>"
  "<p>Jenny buys a 2 week holiday to California in July for $4219.60</p>"
  "<p>Given £1 = $1.54</p><p>Find how much more Jenny pays for her holiday.</p>",
  "<b>£940</b> (or $1447.60) &mdash; $4219.60 ÷ 1.54 = £2740, and £2740 − £1800 = £940.",
  "£940|940|£940.00|$1447.60|1447.60|1447.6")
assert F(421960, 100) / F(154, 100) == 2740 and F(421960, 100) - 1800 * F(154, 100) == F(144760, 100)

FORM  = 'Formulae'
LINEQ = 'Linear Equations'
PERIM = 'Perimeter'
CHART = 'Charts & Diagrams'
# ================================ 2 December =======================================================
q(2, 1, '1', '', 'short', FORM, '',
  "<p>Nathan buys y apples at 15 pence each.</p>"
  "<p>Write an expression for the total cost in terms of y.</p>",
  "<b>15y pence</b> &mdash; y apples at 15p each cost 15 × y.", "15y|15y pence|15yp")
q(2, 2, '2', 'a', 'calculation', LINEQ, '', "<p>Solve &nbsp;4w = 20</p>",
  "<b>w = 5</b> &mdash; divide both sides by 4.", "w = 5|w=5|5")
q(2, 3, '2', 'b', 'calculation', LINEQ, '', "<p>Solve &nbsp;3y + 2 = 17</p>",
  "<b>y = 5</b> &mdash; subtract 2 to get 3y = 15, then divide by 3.", "y = 5|y=5|5")
q(2, 4, '3', '', 'calculation', PERIM, 'parallelogram',
  "<p><b>Figure:</b> a parallelogram, drawn with its long sides horizontal.</p>"
  "<p>The perimeter of this parallelogram is 50cm.</p>"
  "<p>The length of each short side is 7.5cm. Calculate the length of each long side.</p>",
  "<b>17.5 cm</b> &mdash; the two short sides make 15cm, leaving 35cm for the two long sides.",
  "17.5|17.5cm|17.5 cm")
assert (50 - 2 * F(15, 2)) / 2 == F(35, 2)
pre(2, '4', '',
  "<p>The two-way table shows the grades students in Year 10 received in their exams"
  " (rows are the Maths grade, columns the Physics grade).</p>"
  + T(['Maths \\ Physics', 'A', 'B', 'C', 'D'],
      [['A', 7, 6, 1, 1], ['B', 3, 5, 3, 0], ['C', 4, 2, 6, 3], ['D', 0, 0, 1, 0]]))
q(2, 5, '4', 'a', 'calculation', CHART, '', "<p>How many students are in Year 10?</p>",
  "<b>42</b> &mdash; the rows add to 15, 11, 15 and 1.", "42")
q(2, 6, '4', 'b', 'calculation', CHART, '',
  "<p>How many students got the same grade in maths and physics?</p>",
  "<b>18</b> &mdash; add the diagonal: 7 + 5 + 6 + 0.", "18")
assert 7+6+1+1+3+5+3+0+4+2+6+3+0+0+1+0 == 42 and 7+5+6+0 == 18

BEAR  = 'Bearings'
FDP   = 'Fraction Decimal Percentage Conversion'
SLG   = 'Straight Line Graphs'
SCALE = 'Scale Drawings & Maps'
# ================================ 3 December =======================================================
q(3, 1, '1', '', 'short', BEAR, '',
  "<p>Victoria is travelling North-East.</p>"
  "<p>Write her direction of travel as a three figure bearing.</p>",
  "<b>045°</b> &mdash; North-East is halfway between North (000°) and East (090°).",
  "045|045°|45|45°")
q(3, 2, '2', '', 'calculation', FDP, '',
  "<p>Write 40.5% as a fraction. Give your answer in its simplest form.</p>",
  "<b><sup>81</sup>&frasl;<sub>200</sub></b> &mdash; 40.5% = 405/1000, and dividing top and bottom"
  " by 5 gives 81/200.")
assert F(405, 1000) == F(81, 200)
pre(3, '3', 'coordinate-grid',
  "<p><b>Figure:</b> a grid with x from −2 to 6 and y from 0 to 16, the y-axis numbered in"
  " twos.</p>")
q(3, 3, '3', 'a', 'drawing', SLG, '', "<p>On the grid, draw y = 7</p>",
  "<b>a horizontal line through 7 on the y-axis</b> &mdash; every point on it has y = 7.", '', DRAWN)
q(3, 4, '3', 'b', 'drawing', SLG, '',
  "<p>On the grid draw the graph of y = 10 − 2x for the values of x from −1 to 5.</p>",
  "<b>a straight line from (−1, 12) to (5, 0)</b> &mdash; it passes through (0, 10), (1, 8), (2, 6),"
  " (3, 4) and (4, 2).", '', DRAWN)
assert [10 - 2 * x for x in (-1, 0, 5)] == [12, 10, 0]
q(3, 5, '4', '', 'calculation', SCALE, '',
  "<p>A map has a scale of 1cm represents 2km.</p>"
  "<p>Write this scale as a ratio in its simplest form.</p>",
  "<b>1 : 200 000</b> &mdash; 2km is 2 × 100 000 = 200 000cm.")

SEQ   = 'Sequences'
ANGT  = 'Angles in Triangles & Quadrilaterals'
AVTAB = 'Averages from a Table'
# ================================ 4 December =======================================================
q(4, 1, '1', '', 'calculation', LINEQ, '', "<p>Solve &nbsp;y − 3 = 9</p>",
  "<b>y = 12</b> &mdash; add 3 to both sides.", "y = 12|y=12|12")
pre(4, '2', '', "<p>Here is a sequence: 1, 5, 9, 13</p>")
q(4, 2, '2', 'a', 'short', SEQ, '', "<p>Write down the next two terms in this sequence.</p>",
  "<b>17, 21</b> &mdash; the terms go up by 4.", "17, 21|17 21|17,21|17 and 21")
q(4, 3, '2', 'b', 'explain', SEQ + ',' + NTH, '',
  "<p>Is 200 a term in this sequence? Explain your answer.</p>",
  "<b>No</b> &mdash; the nth term is 4n − 3, so every term is odd (one more than a multiple of 4);"
  " 200 is even. Equivalently 4n − 3 = 200 gives n = 50.75, not a whole number.")
q(4, 4, '3', '', 'calculation', ANGT, 'triangle',
  "<p><b>Figure:</b> a triangle (not drawn accurately) with one angle marked 30°.</p>"
  "<p>Shown is an isosceles triangle. Work out the possible sizes of the other two angles."
  " Give two different possible pairs.</p>"
  "<p>30° and ____ and ____ &nbsp;&nbsp; 30° and ____ and ____</p>",
  "<b>75° and 75°; or 30° and 120°</b> &mdash; if 30° is the odd angle the equal pair share"
  " 150°; if 30° is one of the equal pair the third angle is 180 − 60 = 120°.")
q(4, 5, '4', '', 'calculation', AVTAB, '',
  "<p>Work out the mean number of phones owned.</p>"
  + T(['Number of phones', 'Frequency'], [[0, 1], [1, 3], [2, 2], [3, 0], [4, 4], [5, 0]]),
  "<b>2.3</b> &mdash; total phones 0 + 3 + 4 + 0 + 16 + 0 = 23, over 10 people.", "2.3")
assert F(0*1 + 1*3 + 2*2 + 3*0 + 4*4 + 5*0, 1+3+2+0+4+0) == F(23, 10)

FRAMT = 'Fractions of an Amount'
PROB  = 'Probability'
POC   = 'Parts of a Circle'
CMEAS = 'Compound Measures'
# ================================ 5 December =======================================================
q(5, 1, '1', '', 'calculation', FRAMT, '',
  "<p>A standard box of cereal contains 480g of cereal.</p>"
  "<p>A smaller box contains <sup>1</sup>&frasl;<sub>3</sub> less cereal.</p>"
  "<p>How much cereal does the smaller box contain?</p>",
  "<b>320g</b> &mdash; a third of 480 is 160, and 480 − 160 = 320.", "320|320g|320 g")
assert 480 - F(480, 3) == 320
pre(5, '2', 'tree-diagram',
  "<p>240 acts took part in a talent show. 25% of the acts danced and the rest sang."
  " 40 acts made it through to the final. 29 of the acts that sang made it to the final.</p>"
  "<p><b>Figure:</b> a frequency tree starting at 240, branching to Danced and Sang, and each of"
  " those branching to Final and Eliminated, with every circle after the first left blank.</p>")
q(5, 2, '2', 'a', 'annotate', PROB, '', "<p>Complete the frequency tree.</p>",
  "<b>Danced 60 (Final 11, Eliminated 49); Sang 180 (Final 29, Eliminated 151)</b> &mdash; 25% of"
  " 240 is 60, and 40 − 29 = 11 dancers reached the final.")
assert F(25, 100) * 240 == 60 and 60 - 11 == 49 and 180 - 29 == 151
q(5, 3, '2', 'b', 'calculation', PROB, '',
  "<p>What fraction of the acts made it through to the final?</p>",
  "<b><sup>1</sup>&frasl;<sub>6</sub></b> &mdash; 40 out of 240.", "1/6|40/240")
q(5, 4, '3', '', 'drawing', POC, 'circle',
  "<p><b>Figure:</b> a circle with its centre marked.</p><p>Draw a tangent to the circle.</p>",
  "<b>a straight line touching the circle at exactly one point</b> &mdash; it is at right angles"
  " to the radius at that point and does not cross into the circle.", '', DRAWN)
q(5, 5, '4', '', 'calculation', CMEAS, '',
  "<p>Leo runs 2 kilometres in 2 minutes. Calculate his average speed. Give your answer in m/s</p>",
  "<b>16.7 m/s</b> (16<sup>2</sup>&frasl;<sub>3</sub>) &mdash; 2000m ÷ 120s.",
  "16.7|16.67|16.666|16 2/3|50/3|16.7 m/s|16.7m/s")
assert F(2000, 120) == F(50, 3)

RANGE = 'Range'
ROUND = 'Rounding'
RELF  = 'Relative Frequency & Expectation'
# ================================ 6 December =======================================================
q(6, 1, '1', '', 'short', RANGE, '',
  "<p>Mr and Mrs Jones have two children. One of their children is 13 years old."
  " The range of their ages is 8 years.</p><p>What are the possible ages of the other child?</p>",
  "<b>5 or 21</b> &mdash; the other child is 8 years younger or 8 years older than 13.")
q(6, 2, '2', '', 'calculation', HCF, '',
  "<p>A blue light flashes every 6 seconds. A green light flashes every 4 seconds."
  " They have both just flashed at the same time.</p>"
  "<p>After how many seconds will they both flash at the same time?</p>",
  "<b>12 seconds</b> &mdash; the LCM of 6 and 4 is 12.", "12|12 seconds|12s")
assert lcm(6, 4) == 12
q(6, 3, '3', '', 'calculation', ROUND, '', "<p>Round 45.5247 to 2 decimal places</p>",
  "<b>45.52</b> &mdash; the third decimal place is 4, so round down.", "45.52")
q(6, 4, '4', '', 'calculation', CMEAS, '',
  "<p>A car travels 105 miles in 150 minutes.</p><p>Calculate the speed of the car.</p>",
  "<b>42 mph</b> &mdash; 150 minutes is 2.5 hours, and 105 ÷ 2.5 = 42.",
  "42|42 mph|42mph|42 miles per hour")
assert F(105) / F(150, 60) == 42
q(6, 5, '5', '', 'calculation', RELF, '',
  "<p>The probability of a student at Mayfield High being left handed is 0.12</p>"
  "<p>1300 pupils go to Mayfield High.</p><p>How many pupils at Mayfield High are left handed?</p>",
  "<b>156</b> &mdash; 0.12 × 1300 (an estimate from the probability).", "156")
assert F(12, 100) * 1300 == 156

NEG   = 'Negative Numbers'
SIMP  = 'Simplifying & Collecting Terms'
CIRC  = 'Area & Circumference of Circles'
EQN   = 'Equations'
# ================================ 7 December =======================================================
q(7, 1, '1', 'a', 'calculation', NEG, '', "<p>−3 × 5</p>",
  "<b>−15</b> &mdash; a negative times a positive is negative.", "-15")
q(7, 2, '1', 'b', 'calculation', NEG, '', "<p>−8 × −2</p>",
  "<b>16</b> &mdash; a negative times a negative is positive.", "16")
q(7, 3, '2', '', 'calculation', FRAMT, '',
  "<p>Work out <sup>1</sup>&frasl;<sub>8</sub> of 28</p>",
  "<b>3.5</b> &mdash; 28 ÷ 8.", "3.5|3 1/2|7/2")
q(7, 4, '3', 'a', 'short', SIMP, '', "<p>Simplify &nbsp;8y − 2y</p>",
  "<b>6y</b> &mdash; 8 − 2 = 6.", "6y")
q(7, 5, '3', 'b', 'short', SIMP, '', "<p>Simplify &nbsp;6w + 3y + 4w + y</p>",
  "<b>10w + 4y</b> &mdash; collect the w terms (6 + 4) and the y terms (3 + 1).",
  "10w + 4y|10w+4y|4y + 10w|4y+10w")
q(7, 6, '4', '', 'calculation', CIRC, 'circle',
  "<p><b>Figure:</b> a circle with a radius of 71cm drawn from the centre.</p>"
  "<p>Calculate the circumference.</p>",
  "<b>446.1 cm</b> (142π) &mdash; C = 2πr = 2 × π × 71.",
  "446.1|446|446.1cm|446.1 cm|142π|142pi", "The radius was read off the rendered drawing.")
q(7, 7, '5', '', 'written', EQN, '', "<p>Write an equation with 11 as its solution.</p>",
  "<b>any equation solved by 11, e.g. x + 4 = 15</b> &mdash; check by substituting 11.", '', NO_SCHEME)

IND   = 'Indices'
ORDF  = 'Ordering Numbers & Decimals'
VOLSA = 'Volume & Surface Area'
# ================================ 8 December =======================================================
q(8, 1, '1', '', 'calculation', IND, '', "<p>Work out 12<sup>4</sup></p>",
  "<b>20736</b> &mdash; 12 × 12 = 144, 144 × 144 = 20736.", "20736|20 736|20,736")
assert 12 ** 4 == 20736
q(8, 2, '2', '', 'short', ORDF + ',' + FDP, '',
  "<p>0.16 &nbsp; 14% &nbsp; <sup>3</sup>&frasl;<sub>20</sub> &nbsp; 0.2 &nbsp; 9%</p>"
  "<p>Write these numbers in order of size. Start with the smallest number.</p>",
  "<b>9%, 14%, <sup>3</sup>&frasl;<sub>20</sub>, 0.16, 0.2</b> &mdash; as decimals they are 0.09,"
  " 0.14, 0.15, 0.16, 0.2.")
assert sorted([F(16, 100), F(14, 100), F(3, 20), F(2, 10), F(9, 100)]) == [F(9, 100), F(14, 100), F(3, 20), F(16, 100), F(2, 10)]
q(8, 3, '3', '', 'calculation', ANGT, 'quadrilateral',
  "<p><b>Figure:</b> a quadrilateral with angles 70°, 50°, a right angle and x.</p><p>Find x</p>",
  "<b>x = 150°</b> &mdash; angles in a quadrilateral add to 360°: 360 − 70 − 50 − 90.",
  "150|150°|x = 150|x=150", "The angles were read off the rendered drawing.")
q(8, 4, '4', '', 'calculation', FRAMT, '',
  "<p><sup>4</sup>&frasl;<sub>5</sub> of y is 20.</p><p>Find the size of y.</p>",
  "<b>y = 25</b> &mdash; one fifth of y is 20 ÷ 4 = 5, so y = 25.", "25|y = 25|y=25")
q(8, 5, '5', '', 'calculation', VOLSA, 'prism',
  "<p><b>Figure</b> (not drawn accurately): a step-shaped prism 20cm deep. Its front face is"
  " 18cm along the bottom and 16cm tall on the right; the lower step on the left is 5cm high with"
  " a 10cm top, and the taller part rises to 16cm.</p><p>Calculate the volume</p>",
  "<b>3560 cm³</b> &mdash; the front face is an 8 × 16 rectangle plus a 10 × 5 rectangle,"
  " 128 + 50 = 178 cm², and 178 × 20 = 3560.",
  "3560|3560cm3|3560 cm3|3560 cm³", "The dimensions were read off the rendered drawing.")
assert ((18 - 10) * 16 + 10 * 5) * 20 == 3560

DIV   = 'Division'
RATIO = 'Writing & Simplifying Ratio'
RLG   = 'Real-Life Graphs'
# ================================ 9 December =======================================================
q(9, 1, '1', '', 'calculation', DIV + ',' + CALCD, '',
  "<p>A piece of wire 45cm long is cut into six equal pieces.</p>"
  "<p>What is the length of each piece?</p>",
  "<b>7.5 cm</b> &mdash; 45 ÷ 6.", "7.5|7.5cm|7.5 cm")
q(9, 2, '2', '', 'short', SIMP, '', "<p>Simplify &nbsp;9 × c × d × 4</p>",
  "<b>36cd</b> &mdash; multiply the numbers, 9 × 4 = 36, and write the letters after.",
  "36cd|36dc")
q(9, 3, '3', '', 'calculation', RATIO, '',
  "<p>Rosie has 12 counters.</p><p>Bethan has 3 bags of counters. There are 50 counters in each"
  " bag.</p><p>Find the ratio of the number of counters Rosie has to the number of counters"
  " Bethan has.</p>",
  "<b>12 : 150</b>, which simplifies to 2 : 25 &mdash; Bethan has 3 × 50 = 150.",
  "12 : 150|2 : 25|12:150|2:25")
pre(9, '4', 'grid',
  "<p>5 miles = 8 kilometres</p><p><b>Figure:</b> a grid with Miles from 0 to 10 across and"
  " Kilometres from 0 to 20 up, numbered in twos.</p>")
q(9, 4, '4', 'a', 'drawing', RLG, '', "<p>Use this information to draw a conversion graph.</p>",
  "<b>a straight line through (0, 0), (5, 8) and (10, 16)</b> &mdash; 0 miles is 0km, and"
  " doubling 5 miles doubles 8km.", '', DRAWN)
q(9, 5, '4', 'b', 'calculation', RLG + ',' + CMEAS, '',
  "<p>A car travels at 60km/h. Convert this to miles per hour.</p>",
  "<b>37.5 mph</b> &mdash; 60km is 60 ÷ 8 × 5 = 37.5 miles.", "37.5|37.5 mph|37.5mph")
assert F(60, 8) * 5 == F(75, 2)

PCTAM = 'Percentage of an Amount'
LIST  = 'Listing Outcomes & Sample Space'
# ================================ 10 December ======================================================
q(10, 1, '1', '', 'calculation', PCTAM, '', "<p>Work out 20% of 70</p>",
  "<b>14</b> &mdash; 10% is 7, so 20% is 14.", "14")
q(10, 2, '2', '', 'short', FORM, '',
  "<p>In a furniture shop, a table comes with six chairs.</p>"
  "<p>Which of the formulae below connects the number of tables, T, and the number of chairs, C?</p>"
  "<p>Formula 1: C = T + 6<br>Formula 2: C = 6T<br>Formula 3: T = 6C<br>Formula 4: T = C + 6</p>",
  "<b>Formula 2: C = 6T</b> &mdash; each table brings 6 chairs, so there are 6 times as many chairs"
  " as tables.", "Formula 2|2|C = 6T|C=6T")
MENU = {'Soup': 250, 'Prawns': 425, 'Melon': 350}, {'Chicken': 625, 'Beef': 800, 'Pork': 750}, \
       {'Trifle': 350, 'Brownie': 400, 'Eton Mess': 450}
OK = [(a, b, c) for a in MENU[0] for b in MENU[1] for c in MENU[2]
      if MENU[0][a] + MENU[1][b] + MENU[2][c] <= 1500]
assert len(OK) == 18
q(10, 3, '3', '', 'short', LIST, '',
  "<p>Megan has £15. She is going to choose one starter, one main and one dessert.</p>"
  "<p>List all the possible combinations that Megan can afford.</p>"
  + T(['Starter', 'Main', 'Dessert'],
      [['Soup £2.50', 'Chicken £6.25', 'Trifle £3.50'],
       ['Prawns £4.25', 'Beef £8.00', 'Brownie £4.00'],
       ['Melon £3.50', 'Pork £7.50', 'Eton Mess £4.50']]),
  "<b>18 combinations</b>: " + '; '.join(' + '.join(x) for x in OK)
  + " &mdash; every total of £15 or less (£15 exactly counts as affordable).")
q(10, 4, '4', '', 'calculation', CIRC, '',
  "<p>A circle has a diameter of 3cm.</p><p>Find the circumference of the circle.</p>",
  "<b>9.42 cm</b> (3π) &mdash; C = πd = π × 3.", "9.42|9.4|9.42cm|3π|3pi|9.425")

ORDOP = 'Order of Operations'
ADDF  = 'Adding & Subtracting Fractions'
ANGPL = 'Angles in Parallel Lines'
# ================================ 11 December ======================================================
q(11, 1, '1', '', 'calculation', ORDOP, '', "<p>Work out 180 − 2 × 5<sup>2</sup></p>",
  "<b>130</b> &mdash; index first, 5² = 25; then 2 × 25 = 50; then 180 − 50.", "130")
assert 180 - 2 * 5 ** 2 == 130
q(11, 2, '2', '', 'calculation', ADDF, '',
  "<p>Work out <sup>4</sup>&frasl;<sub>5</sub> − <sup>1</sup>&frasl;<sub>3</sub></p>",
  "<b><sup>7</sup>&frasl;<sub>15</sub></b> &mdash; 12/15 − 5/15.", "7/15")
assert F(4, 5) - F(1, 3) == F(7, 15)
q(11, 3, '3', '', 'short', ANGPL, 'parallel-lines',
  "<p><b>Figure:</b> two parallel lines RS and TU crossed by one straight line. At the top"
  " crossing the angles are a (top left), b (top right), c (bottom left) and d (bottom right); at"
  " the bottom crossing they are e (top left), f (top right), g (bottom left) and h (bottom"
  " right).</p><p>Which angle is vertically opposite to angle <i>g</i>?</p>",
  "<b>f</b> &mdash; g and f are on opposite sides of the same crossing point.", "f",
  "The positions of the letters were read off the rendered drawing.")
pre(11, '4', '', "<p>Jack completes a journey in 2 stages.</p>")
q(11, 4, '4', 'a', 'calculation', CMEAS, '',
  "<p>In stage 1, Jack drives at 60 mph for 1 hour 45 minutes. How far does he travel in stage 1?</p>",
  "<b>105 miles</b> &mdash; 60 × 1.75.", "105|105 miles")
q(11, 5, '4', 'b', 'calculation', CMEAS, '',
  "<p>Altogether Jack travels 120 miles in 2 hours 30 minutes.</p>"
  "<p>What is his average speed in stage 2?</p>",
  "<b>20 mph</b> &mdash; stage 2 is 120 − 105 = 15 miles in 2h30 − 1h45 = 45 minutes, and"
  " 15 ÷ 0.75 = 20.", "20|20 mph|20mph")
assert 60 * F(7, 4) == 105 and F(120 - 105) / (F(5, 2) - F(7, 4)) == 20

BPROB = 'Basic Probability'
MEAN  = 'Mean'
REARR = 'Rearranging Formulae'
# ================================ 12 December ======================================================
q(12, 1, '1', '', 'calculation', BPROB, '',
  "<p>The probability of snow is 0.03</p><p>Work out the probability that it will not snow.</p>",
  "<b>0.97</b> &mdash; 1 − 0.03.", "0.97|97/100|97%")
q(12, 2, '2', '', 'calculation', MEAN, '', "<p>55 &nbsp;35 &nbsp;20 &nbsp;60 &nbsp;15</p><p>Work out the mean</p>",
  "<b>37</b> &mdash; the total is 185, and 185 ÷ 5 = 37.", "37")
assert F(55 + 35 + 20 + 60 + 15, 5) == 37
q(12, 3, '3', '', 'calculation', ANGT, 'triangle',
  "<p><b>Figure</b> (diagram not drawn accurately): a triangle DCF with E on DF, joined to C."
  " CE and CF are marked equal. Angle ECF is 40°, angle DCE is 15° and angle y is at D.</p>"
  "<p>Find the size of angle y</p>",
  "<b>y = 55°</b> &mdash; triangle CEF is isosceles, so its base angles are (180 − 40) ÷ 2 = 70°;"
  " angle CED = 180 − 70 = 110°; then y = 180 − 110 − 15.", "55|55°|y = 55|y=55",
  "The equal-side marks and the angles were read off the rendered drawing.")
assert 180 - (180 - (180 - 40) // 2) - 15 == 55
q(12, 4, '4', '', 'short', REARR, '', "<p>Make y the subject of &nbsp;c = 2y + a</p>",
  "<b>y = (c − a) ÷ 2</b> &mdash; subtract a from both sides, then divide by 2.",
  "y = (c - a)/2|y=(c-a)/2|(c-a)/2|y = (c − a)/2")
q(12, 5, '5', '', 'calculation', CMEAS, '',
  "<p>Poppy walks 11 kilometres at a speed of 4 km/h</p>"
  "<p>Calculate how long it takes Poppy. Give your answer in hours and minutes.</p>",
  "<b>2 hours 45 minutes</b> &mdash; 11 ÷ 4 = 2.75 hours, and 0.75 hours is 45 minutes.",
  "2 hours 45 minutes|2h 45m|2h45m|2 hours 45 mins|2 hr 45 min")
assert F(11, 4) == 2 + F(45, 60)

LMULT = 'Long Multiplication'
SCAT  = 'Scatter Graphs & Correlation'
# ================================ 13 December ======================================================
q(13, 1, '1', '', 'calculation', 'Subtraction' + ',' + CALCD, '',
  "<p>Florence has £1.80. Tameka has £3.</p>"
  "<p>How much money should Tameka give Florence so they have the same amount?</p>",
  "<b>60p</b> &mdash; they have £4.80 together, so each should have £2.40; Tameka gives £3 − £2.40.",
  "60p|£0.60|0.60|0.6|60")
assert (F(18, 10) + 3) / 2 == F(24, 10)
pre(13, '2', 'axes', "<p><b>Figure:</b> two blank pairs of axes with no scales.</p>")
q(13, 2, '2', 'a', 'drawing', SCAT, '', "<p>Plot some points that would have a positive correlation</p>",
  "<b>points rising from bottom left to top right</b> &mdash; as one value goes up, so does the"
  " other.", '', DRAWN)
q(13, 3, '2', 'b', 'drawing', SCAT, '', "<p>Plot some points that would have no correlation</p>",
  "<b>points scattered with no pattern</b> &mdash; no trend up or down.", '', DRAWN)
q(13, 4, '3', '', 'calculation', LMULT, '', "<p>Work out 845 × 129</p>",
  "<b>109 005</b> &mdash; 845 × 100 = 84 500, 845 × 20 = 16 900, 845 × 9 = 7605.",
  "109005|109 005|109,005")
assert 845 * 129 == 109005
q(13, 5, '4', '', 'short', NTH + ',' + 'Factors & Multiples', '',
  "<p>Here are the nth terms of 4 sequences.</p>"
  "<p>Sequence 1: 3n + 1<br>Sequence 2: 5n + 10<br>Sequence 3: 10n<br>Sequence 4: 5n − 1</p>"
  "<p>For each sequence state whether the numbers in the sequence are A &mdash; always multiples"
  " of 5, S &mdash; sometimes multiples of 5, N &mdash; never multiples of 5.</p>",
  "<b>Sequence 1 S, Sequence 2 A, Sequence 3 A, Sequence 4 N</b> &mdash; 3n + 1 gives 4, 7, 10, ...;"
  " 5n + 10 = 5(n + 2); 10n = 5 × 2n; 5n − 1 is always one less than a multiple of 5.")
assert any((3*n+1) % 5 == 0 for n in range(1, 10)) and any((3*n+1) % 5 for n in range(1, 10))
assert all((5*n+10) % 5 == 0 and (10*n) % 5 == 0 and (5*n-1) % 5 for n in range(1, 50))

PCTID = 'Percentage Increase & Decrease'
PRIME = 'Primes & Prime Factorisation'
# ================================ 14 December ======================================================
q(14, 1, '1', '', 'calculation', BPROB, '',
  "<p>There are 8 green pens, 3 red pens and 5 black pens in a pot. One pen is picked at random.</p>"
  "<p>Write down the probability that the pen is black.</p>",
  "<b><sup>5</sup>&frasl;<sub>16</sub></b> &mdash; 5 black out of 8 + 3 + 5 = 16 pens.",
  "5/16|0.3125")
q(14, 2, '2', '', 'drawing', POC, 'circle',
  "<p><b>Figure:</b> a circle with its centre marked.</p><p>Draw a chord</p>",
  "<b>a straight line joining two points on the circle</b> &mdash; its ends are both on the"
  " circumference.", '', DRAWN)
q(14, 3, '3', '', 'calculation', PCTID, '',
  "<p>Harry normally works 30 hours per week. His normal rate of pay is £9 per hour.</p>"
  "<p>When Harry works more than 30 hours per week, he is paid overtime for each extra hour."
  " His overtime pay is 20% more than his normal pay.</p>"
  "<p>Last week Harry worked 35 hours. Work out his total pay.</p>",
  "<b>£324</b> &mdash; 30 × £9 = £270; overtime is £9 × 1.2 = £10.80 an hour, and 5 × £10.80 = £54.",
  "£324|324|£324.00|324.00")
assert 30 * 9 + 5 * 9 * F(12, 10) == 324
q(14, 4, '4', '', 'short', PRIME, '', "<p>Write 200 as a product of primes.</p>",
  "<b>2<sup>3</sup> × 5<sup>2</sup></b> (2 × 2 × 2 × 5 × 5) &mdash; halve to 100, 50, 25, then 5 × 5.",
  "2^3 × 5^2|2 × 2 × 2 × 5 × 5|2x2x2x5x5|2^3x5^2|2^3 x 5^2")
assert 2 ** 3 * 5 ** 2 == 200

PSHAP = 'Properties of Shapes'
MEDN  = 'Median'
MODE  = 'Mode'
# ================================ 15 December ======================================================
q(15, 1, '1', '', 'short', PSHAP, '',
  "<p>What is the order of rotational symmetry of a rectangle?</p>",
  "<b>2</b> &mdash; a rectangle looks the same twice in a full turn (after 180° and 360°).", "2|order 2")
pre(15, '2', '', "<p>29 &nbsp;32 &nbsp;32 &nbsp;12 &nbsp;11</p>")
q(15, 2, '2', 'a', 'calculation', MEDN, '', "<p>Work out the median</p>",
  "<b>29</b> &mdash; in order 11, 12, 29, 32, 32, the middle value is 29.", "29")
q(15, 3, '2', 'b', 'short', MODE, '', "<p>Write down the mode</p>",
  "<b>32</b> &mdash; it appears twice.", "32")
pre(15, '3', 'coordinate-grid',
  "<p><b>Figure:</b> a grid with x from 0 to 5 and y from 0 to 5.</p>")
q(15, 4, '3', 'a', 'drawing', SLG, '', "<p>Draw y = 3</p>",
  "<b>a horizontal line through 3 on the y-axis</b>.", '', DRAWN)
q(15, 5, '3', 'b', 'drawing', SLG, '', "<p>Draw y = x</p>",
  "<b>a straight line through (0, 0), (1, 1), (2, 2) ... (5, 5)</b>.", '', DRAWN)
q(15, 6, '4', '', 'calculation', CMEAS, '',
  "<p>Ali cycles 8 kilometres in 30 minutes. Calculate his average speed, in km/h.</p>",
  "<b>16 km/h</b> &mdash; 30 minutes is half an hour, so 8 × 2.", "16|16 km/h|16km/h|16kmh")

MANIP = 'Manipulating Expressions'
# ================================ 16 December ======================================================
q(16, 1, '1', 'a', 'calculation', ROUND, '', "<p>Write 8.7 to the nearest whole number.</p>",
  "<b>9</b> &mdash; the tenths digit is 7, so round up.", "9")
q(16, 2, '1', 'b', 'calculation', ROUND, '', "<p>Write 3.483 correct to 1 decimal place.</p>",
  "<b>3.5</b> &mdash; the second decimal place is 8, so round up.", "3.5")
q(16, 3, '2', '', 'calculation', CALCD, '', "<p>1.825 ÷ 5</p>",
  "<b>0.365</b> &mdash; 1825 ÷ 5 = 365, keeping three decimal places.", "0.365|.365")
assert F(1825, 1000) / 5 == F(365, 1000)
q(16, 4, '3', '', 'short', MANIP, '',
  "<p>Circle the correct word to describe &nbsp;2x + 7 = 15</p><p>Equation &nbsp; Expression"
  " &nbsp; Identity</p>",
  "<b>Equation</b> &mdash; it has an equals sign and is true for one value of x only (x = 4).",
  "Equation|equation|an equation")
pre(16, '4', 'coordinate-grid',
  "<p><b>Figure:</b> a grid with x from 0 to 6 and y from 0 to 6.</p>")
q(16, 5, '4', 'a', 'drawing', SLG, '', "<p>Draw x = 2</p>",
  "<b>a vertical line through 2 on the x-axis</b>.", '', DRAWN)
q(16, 6, '4', 'b', 'drawing', SLG, '', "<p>Draw x + y = 4</p>",
  "<b>a straight line from (0, 4) to (4, 0)</b> &mdash; it passes through (1, 3), (2, 2) and"
  " (3, 1).", '', DRAWN)

REVM  = 'Reverse Mean'
# ================================ 17 December ======================================================
q(17, 1, '1', '', 'short', BEAR, '',
  "<p>Victoria is travelling South-East.</p>"
  "<p>Write her direction of travel as a three figure bearing.</p>",
  "<b>135°</b> &mdash; South-East is halfway between East (090°) and South (180°).", "135|135°")
q(17, 2, '2', '', 'calculation', CMEAS, '',
  "<p>A pigeon flies for 7 hours at a speed of 45 km/h. Calculate how far the pigeon flies.</p>",
  "<b>315 km</b> &mdash; 45 × 7.", "315|315km|315 km")
pre(17, '3', 'bearings',
  "<p><b>Figure:</b> points A and B, each with a North line drawn upwards. B is to the right of A"
  " and a little higher, joined to A by a straight line. No angle is marked, so the bearings are"
  " measured with a protractor.</p>")
q(17, 3, '3', 'a', 'short', BEAR, '', "<p>Write down the three figure bearing of B from A</p>",
  "<b>about 081°</b> &mdash; measure clockwise from North at A; the line AB is about 9° above the"
  " East direction.", '',
  "Measured off the rendered page (B is about 9° above due East of A); the printed drawing needs"
  " a protractor, so a tolerance of a few degrees applies and it is left for a person to mark.")
q(17, 4, '3', 'b', 'short', BEAR, '', "<p>Write down the three figure bearing of A from B</p>",
  "<b>about 261°</b> &mdash; the back bearing: 081° + 180°.", '',
  "The back bearing of the measured 081°; left for a person to mark within a tolerance.")
q(17, 5, '4', '', 'calculation', REVM, '',
  "<p>Six students sit an exam. Here are the marks of five of the students: 70 &nbsp;65 &nbsp;85"
  " &nbsp;91 &nbsp;75</p><p>The mean for the six exams is 80</p>"
  "<p>Work out the mark for the sixth exam.</p>",
  "<b>94</b> &mdash; the six marks total 6 × 80 = 480, and the five add to 386.", "94")
assert 6 * 80 - (70 + 65 + 85 + 91 + 75) == 94

PIE   = 'Pie Charts'
# ================================ 18 December ======================================================
pre(18, '1', '', "<p>The cost of 9 coffees is £20.25</p>")
q(18, 1, '1', 'a', 'calculation', BEST, '', "<p>Find the cost of 1 coffee.</p>",
  "<b>£2.25</b> &mdash; £20.25 ÷ 9.", "£2.25|2.25")
q(18, 2, '1', 'b', 'calculation', BEST, '', "<p>Find the cost of 4 coffees.</p>",
  "<b>£9.00</b> &mdash; 4 × £2.25.", "£9|£9.00|9|9.00")
assert F(2025, 100) / 9 * 4 == 9
q(18, 3, '2', '', 'drawing', PIE, 'pie-chart',
  "<p>The table below shows information about the grades received in a test.</p>"
  + T(['Grade', 'Frequency'], [['A', 10], ['B', 15], ['C', 13], ['D', 5], ['E', 2]])
  + "<p><b>Figure:</b> a circle with one radius drawn straight up from the centre.</p>"
  "<p>Draw a pie chart to show this information.</p>",
  "<b>A 80°, B 120°, C 104°, D 40°, E 16°</b> &mdash; 45 people share 360°, so each is 8°.",
  '', DRAWN)
assert 360 % 45 == 0 and [f * 8 for f in (10, 15, 13, 5, 2)] == [80, 120, 104, 40, 16]
q(18, 4, '3', '', 'calculation', ANGT, 'quadrilateral',
  "<p><b>Figure:</b> a quadrilateral with a right angle at its bottom left. Its left side is"
  " extended upwards, and the angle between that extension and the top side is 132°. The angle at"
  " the top right is 145° and the angle at the bottom right is x.</p><p>Find x</p>",
  "<b>x = 77°</b> &mdash; the interior angle at the top left is 180 − 132 = 48°, and"
  " 360 − 48 − 145 − 90 = 77.", "77|77°|x = 77|x=77",
  "The angles and where they are marked were read off the rendered drawing.")
assert 360 - (180 - 132) - 145 - 90 == 77
q(18, 5, '4', '', 'explain', PCTID + ',' + BEST, '',
  "<p>Candles normally cost £9 each. Two websites have special offers:"
  " Corbettmaths Candles &mdash; buy 3 get 1 free; Candles'R'us &mdash; 20% off.</p>"
  "<p>Laura wants to buy 40 candles. Which website should Laura use?</p>",
  "<b>Corbettmaths Candles</b> &mdash; she pays for 30 of the 40 candles, 30 × £9 = £270, against"
  " 40 × £9 × 0.8 = £288 at Candles'R'us.")
assert 30 * 9 == 270 and 40 * 9 * F(8, 10) == 288

SIMSH = 'Similar Shapes'
RPROB = 'Ratio Problems'
# ================================ 19 December ======================================================
q(19, 1, '1', '', 'short', SIMSH, 'grid',
  "<p><b>Figure:</b> seven triangles A to G drawn on squared paper. B is a right-angled triangle"
  " with two 4-square sides; F is a right-angled triangle with two 2-square sides; C has"
  " right-angle sides of 2 and 3 squares, E of 4 and 2 squares, A is 4 squares wide and 3 tall,"
  " and D and G are sloping triangles.</p>"
  "<p>Write down the letters of two triangles that are mathematically similar.</p>",
  "<b>B and F</b> &mdash; both are right-angled with equal shorter sides; B is F enlarged by"
  " scale factor 2.", "B and F|B, F|B F|BF|F and B",
  "The side lengths were counted on the squares of the rendered grid.")
q(19, 2, '2', '', 'calculation', CMEAS, '',
  "<p><b>Figure:</b> a road sign reading Belfast 20 miles.</p>"
  "<p>Freya drives 20 miles to Belfast at an average speed of 40mph.</p>"
  "<p>How long does the journey take?</p>",
  "<b>30 minutes</b> &mdash; 20 ÷ 40 = 0.5 hours.", "30 minutes|30 mins|30|half an hour|0.5 hours")
q(19, 3, '3', '', 'short', PERIM + ',' + SIMP, 'rectangle',
  "<p><b>Figure:</b> a rectangle 2x + 7 long and x + 3 wide.</p>"
  "<p>Find an expression for the perimeter of the rectangle</p>",
  "<b>6x + 20</b> &mdash; 2(2x + 7) + 2(x + 3) = 4x + 14 + 2x + 6.", "6x + 20|6x+20|20 + 6x")
q(19, 4, '4', '', 'explain', ANGPL, 'parallel-lines',
  "<p><b>Figure</b> (not drawn accurately): a line AC with AB leaning up to the right from A"
  " and CD leaning up to the right from C. The angle BAC is 72° and the angle ACD is 108°.</p>"
  "<p>Edward says the lines AB and CD are parallel. Is Edward correct?</p>",
  "<b>Yes</b> &mdash; the co-interior angles 72° + 108° add to 180°, which only happens when the"
  " lines are parallel.")
q(19, 5, '5', '', 'calculation', RPROB, '',
  "<p>At a rugby match, the ratio of children to adults is 2 : 3. There are 80 children in the"
  " crowd. Each adult ticket costs £8. Each child ticket costs a quarter of the adult ticket.</p>"
  "<p>Work out the total money made from ticket sales</p>",
  "<b>£1120</b> &mdash; one part is 40, so 120 adults pay £960 and 80 children pay £2 each, £160.",
  "£1120|1120|£1,120|£1120.00")
assert 80 // 2 * 3 * 8 + 80 * 2 == 1120

SIGF  = 'Significant Figures'
TRANS = 'Translations'
FMACH = 'Function Machines'
# ================================ 20 December ======================================================
q(20, 1, '1', '', 'calculation', SIGF, '', "<p>Write 4714 correct to 1 significant figure.</p>",
  "<b>5000</b> &mdash; the second digit is 7, so the 4 thousands round up.", "5000|5 000|5,000")
q(20, 2, '2', '', 'drawing', TRANS, 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x and y from −6 to 6. Triangle B has its corners at"
  " (−4, 0), (−2, 0) and (−2, 2).</p>"
  "<p>Translate triangle B using translation vector (4 over −2), that is, 4 right and 2 down.</p>",
  "<b>corners at (0, −2), (2, −2) and (2, 0)</b> &mdash; move every corner 4 right and 2 down.",
  '', DRAWN)
q(20, 3, '3', '', 'calculation', PCTAM, '',
  "<p>Sahil is going to buy a car. The car costs £24000. He pays a deposit of 15%."
  " Sahil pays the rest of the money over 20 monthly payments.</p>"
  "<p>Work out the cost of each monthly payment.</p>",
  "<b>£1020</b> &mdash; the deposit is £3600, leaving £20 400, and £20 400 ÷ 20 = £1020.",
  "£1020|1020|£1,020|£1020.00")
assert 24000 * F(85, 100) / 20 == 1020
q(20, 4, '4', '', 'calculation', FMACH + ',' + LINEQ, 'function-machine',
  "<p><b>Figure:</b> a function machine: input → multiply by 6 → subtract 80 → output.</p>"
  "<p>The input is the same as the output. Find the input</p>",
  "<b>16</b> &mdash; 6x − 80 = x gives 5x = 80; check: 16 × 6 − 80 = 16.", "16")
assert 16 * 6 - 80 == 16

# ================================ 21 December ======================================================
q(21, 1, '1', '', 'short', LIST, '',
  "<p>Starter: Soup, Melon, Prawns. Main: Beef, Gammon.</p>"
  "<p>Elsie is going to choose one starter and one main. List all her possible choices.</p>",
  "<b>Soup &amp; Beef, Soup &amp; Gammon, Melon &amp; Beef, Melon &amp; Gammon, Prawns &amp; Beef,"
  " Prawns &amp; Gammon</b> &mdash; 3 starters × 2 mains = 6 choices.")
q(21, 2, '2', '', 'short', FORM, '',
  "<p>Rhys is x years old. Hannah is 7 years younger than Rhys.</p>"
  "<p>Write an expression for Hannah's age.</p>",
  "<b>x − 7</b> &mdash; 7 less than Rhys.", "x - 7|x-7|x − 7")
q(21, 3, '3', '', 'calculation', DIV, '',
  "<p>Each member of a club is going to receive a badge. There are 824 members."
  " The badges are sold in packs of 15.</p>"
  "<p>Work out the least number of packs of badges that need to be bought.</p>",
  "<b>55</b> &mdash; 824 ÷ 15 = 54.9..., and 54 packs (810 badges) are not enough, so round up.",
  "55|55 packs")
assert 54 * 15 < 824 <= 55 * 15
pre(21, '4', 'pie-chart',
  "<p>The pie chart shows the flavours of ice cream sold by a shop in one day. There were a total"
  " of 270 ice creams sold.</p><p><b>Figure:</b> a pie chart with angles Strawberry 72°, Honeycomb"
  " 72°, Vanilla 60°, Mint 36° and Chocolate 120°.</p>",
  "The angles were read off the rendered pie chart.")
q(21, 4, '4', 'a', 'calculation', PIE, '',
  "<p>Calculate the number of vanilla flavoured ice creams sold.</p>",
  "<b>45</b> &mdash; 60/360 × 270.", "45")
q(21, 5, '4', 'b', 'calculation', PIE, '',
  "<p>Calculate the number of strawberry flavoured ice creams sold.</p>",
  "<b>54</b> &mdash; 72/360 × 270.", "54")
assert 72 + 72 + 60 + 36 + 120 == 360 and F(60, 360) * 270 == 45 and F(72, 360) * 270 == 54

CONG  = 'Congruent Triangles'
AREA2 = 'Area of 2-D Shapes'
# ================================ 22 December ======================================================
q(22, 1, '1', '', 'short', CONG, 'grid',
  "<p><b>Figure:</b> the same seven triangles A to G on squared paper as on 19 December. D has a"
  " vertical side of 3 squares and its other sides go 3 across and 1 down, and 3 across and 4"
  " down; G has a vertical side of 3 squares and its other sides go 3 across and 1 up, and 3"
  " across and 4 up.</p><p>Write down the letters of two congruent triangles.</p>",
  "<b>D and G</b> &mdash; both have sides of 3, √10 and 5 squares, so they are the same size and"
  " shape.", "D and G|D, G|D G|DG|G and D",
  "The corners were read off the squares of the rendered grid and the side lengths computed.")
assert 3 ** 2 + 1 ** 2 == 10 and 3 ** 2 + 4 ** 2 == 25
q(22, 2, '2', '', 'calculation', 'Ratio & Proportion', '',
  "<p>George is going on holiday to Poland. George changes £565 into Zloty."
  " The exchange rate is £1 = 5 Zloty.</p><p>Work out how many Zloty George gets for £565.</p>",
  "<b>2825 Zloty</b> &mdash; 565 × 5.", "2825|2825 zloty|2825 Zloty|2,825")
q(22, 3, '3', '', 'calculation', HCF, '',
  "<p>Find the lowest common multiple (LCM) of 25 and 30</p>",
  "<b>150</b> &mdash; 25 = 5², 30 = 2 × 3 × 5, so the LCM is 2 × 3 × 5² = 150.", "150")
assert lcm(25, 30) == 150
q(22, 4, '4', '', 'short', AREA2 + ',' + SIMP, 'rectangle',
  "<p><b>Figure:</b> a rectangle 5x long and 2y wide.</p>"
  "<p>Find an expression for the area of the rectangle.</p>",
  "<b>10xy</b> &mdash; 5x × 2y.", "10xy|10yx")
q(22, 5, '5', '', 'calculation', CMEAS, '',
  "<p>Ranjit drives 110 miles to the hotel. His journey takes 2½ hours.</p>"
  "<p>Work out his average speed.</p>",
  "<b>44 mph</b> &mdash; 110 ÷ 2.5.", "44|44 mph|44mph")
assert F(110) / F(5, 2) == 44

ORDFR = 'Ordering Fractions'
SHARE = 'Sharing in a Ratio'
ENLG  = 'Enlargements'
# ================================ 23 December ======================================================
q(23, 1, '1', 'a', 'calculation', LINEQ, '', "<p>Solve &nbsp;w + 3 = 20</p>",
  "<b>w = 17</b> &mdash; subtract 3 from both sides.", "w = 17|w=17|17")
q(23, 2, '1', 'b', 'calculation', LINEQ, '', "<p>Solve &nbsp;7y = 35</p>",
  "<b>y = 5</b> &mdash; divide both sides by 7.", "y = 5|y=5|5")
q(23, 3, '2', '', 'calculation', DIV, '',
  "<p>Mr Cooper wants to hire a carpet cleaner. It costs £15 per day. Mr Cooper's final bill is"
  " £90.</p><p>How many days did he hire the carpet cleaner for?</p>",
  "<b>6 days</b> &mdash; £90 ÷ £15.", "6|6 days")
q(23, 4, '3', '', 'short', ORDFR, '',
  "<p>Arrange in order, starting with the smallest.</p>"
  "<p><sup>5</sup>&frasl;<sub>8</sub> &nbsp; <sup>3</sup>&frasl;<sub>4</sub> &nbsp;"
  " <sup>11</sup>&frasl;<sub>20</sub> &nbsp; <sup>3</sup>&frasl;<sub>5</sub></p>",
  "<b><sup>11</sup>&frasl;<sub>20</sub>, <sup>3</sup>&frasl;<sub>5</sub>,"
  " <sup>5</sup>&frasl;<sub>8</sub>, <sup>3</sup>&frasl;<sub>4</sub></b> &mdash; as decimals 0.55,"
  " 0.6, 0.625, 0.75.")
assert sorted([F(5, 8), F(3, 4), F(11, 20), F(3, 5)]) == [F(11, 20), F(3, 5), F(5, 8), F(3, 4)]
q(23, 5, '4', '', 'calculation', SHARE, '', "<p>Share £405 in the ratio 2:3</p>",
  "<b>£162 : £243</b> &mdash; 5 parts, so one part is £81.",
  "£162 : £243|£162, £243|162, 243|162:243|162 and 243")
assert F(405, 5) * 2 == 162 and F(405, 5) * 3 == 243
q(23, 6, '5', '', 'drawing', ENLG, 'coordinate-grid',
  "<p><b>Figure:</b> a grid with x and y from 0 to 7. A trapezium has its corners at (4, 1),"
  " (6, 1), (6, 2) and (5, 2).</p><p>Enlarge the trapezium by scale factor 3, centre (6, 0).</p>",
  "<b>corners at (0, 3), (6, 3), (6, 6) and (3, 6)</b> &mdash; each corner's distance from (6, 0)"
  " is multiplied by 3.", '', DRAWN)
assert [(6 + 3 * (x - 6), 3 * y) for x, y in [(4, 1), (6, 1), (6, 2), (5, 2)]] == [(0, 3), (6, 3), (6, 6), (3, 6)]

PCT   = 'Percentages'
FACT  = 'Factorising'
# ================================ 24 December ======================================================
pre(24, '1', '', "<p>James buys a number of plants. Each plant costs £4.19</p>")
q(24, 1, '1', 'a', 'calculation', DIV + ',' + CALCD, '', "<p>How many plants can James buy for £20?</p>",
  "<b>4</b> &mdash; 4 plants cost £16.76 and 5 would cost £20.95.", "4|4 plants")
q(24, 2, '1', 'b', 'calculation', CALCD, '', "<p>How much change should he receive?</p>",
  "<b>£3.24</b> &mdash; £20 − £16.76.", "£3.24|3.24")
assert 4 * F(419, 100) <= 20 < 5 * F(419, 100) and 20 - 4 * F(419, 100) == F(324, 100)
q(24, 3, '2', '', 'explain', PCT + ',' + FDP, '',
  "<p>In a French test, Leah scored 13 out of 20. In a German test she scored 17 out of 25.</p>"
  "<p>Which is the better result?</p>",
  "<b>German</b> &mdash; 13/20 = 65% and 17/25 = 68%.")
assert F(13, 20) < F(17, 25)
q(24, 4, '3', '', 'short', SIMP, '', "<p>Simplify &nbsp;5w − 3w + 9w</p>",
  "<b>11w</b> &mdash; 5 − 3 + 9 = 11.", "11w")
q(24, 5, '4', '', 'calculation', CALCD, 'coin',
  "<p>Shown below is a 2 pence coin. <b>Figure:</b> a 2p coin with its thickness marked"
  " 0.185cm.</p><p>Each 2 pence coin is 0.185cm thick. Stephen builds a tower of 300 2p coins."
  " How tall is the tower?</p>",
  "<b>55.5 cm</b> &mdash; 300 × 0.185.", "55.5|55.5cm|55.5 cm")
assert 300 * F(185, 1000) == F(555, 10)
q(24, 6, '5', '', 'short', FACT, '', "<p>Factorise fully &nbsp;6y<sup>2</sup> + 15y</p>",
  "<b>3y(2y + 5)</b> &mdash; the highest common factor of both terms is 3y.",
  "3y(2y + 5)|3y(2y+5)|3y(5 + 2y)")

EST   = 'Estimation'
AVG   = 'Averages & Range'
ROT   = 'Rotations'
# ================================ 25 December ======================================================
q(25, 1, '1', '', 'calculation', EST, '',
  "<p>Estimate &nbsp;(4.01 × 29.5) ÷ 1.978</p>",
  "<b>60</b> &mdash; round each number to 1 significant figure: 4 × 30 ÷ 2 = 60.", "60")
q(25, 2, '2', '', 'short', AVG, '',
  "<p><b>Figure:</b> three blank cards.</p><p>Write a number on each card so that: the range is 7,"
  " the median is 8 and the mean is 7.</p>",
  "<b>3, 8, 10</b> &mdash; the middle card is 8, the three add to 21 so the other two add to 13,"
  " and they differ by 7, giving 3 and 10.", "3, 8, 10|3 8 10|3,8,10")
assert sorted([3, 8, 10])[1] == 8 and 10 - 3 == 7 and F(3 + 8 + 10, 3) == 7
q(25, 3, '3', '', 'drawing', ROT, 'coordinate-grid',
  "<p><b>Figure:</b> a coordinate grid with x and y from −6 to 6. Triangle B has its corners at"
  " (−4, 0), (−2, 0) and (−2, 2).</p><p>Rotate B 90° anticlockwise about (−1, 0)</p>",
  "<b>corners at (−1, −3), (−1, −1) and (−3, −1)</b> &mdash; each corner turns a quarter turn"
  " anticlockwise about (−1, 0).", '', DRAWN)
rot = lambda x, y: (-1 - y, x + 1)
assert [rot(*p) for p in [(-4, 0), (-2, 0), (-2, 2)]] == [(-1, -3), (-1, -1), (-3, -1)]
q(25, 4, '4', '', 'short', ANGPL, 'parallel-lines',
  "<p><b>Figure:</b> the same diagram as on 11 December: parallel lines RS and TU crossed by one"
  " straight line, with angles a (top left), b (top right), c (bottom left) and d (bottom right) at"
  " the top crossing, and e, f, g, h in the same positions at the bottom crossing.</p>"
  "<p>Which angle is vertically opposite to angle <i>a</i>?</p>",
  "<b>d</b> &mdash; a and d are on opposite sides of the same crossing point.", "d",
  "The positions of the letters were read off the rendered drawing.")

NUMLN = 'Place Value & Ordering'
# ================================ 26 December ======================================================
q(26, 1, '1', '', 'calculation', CALCD, '', "<p>Work out 0.3 × 0.5</p>",
  "<b>0.15</b> &mdash; 3 × 5 = 15, with two decimal places.", "0.15|.15")
q(26, 2, '2', '', 'calculation', LINEQ, '',
  "<p>Solve &nbsp;<sup>w</sup>&frasl;<sub>2</sub> = 20</p>",
  "<b>w = 40</b> &mdash; multiply both sides by 2.", "w = 40|w=40|40")
q(26, 3, '3', '', 'calculation', NUMLN, 'number-line',
  "<p>Shown is a number line. <b>Figure:</b> a number line with ten equal gaps. The sixth mark"
  " from the left is labelled 52 and the ninth mark is labelled 73. An arrow points to the first"
  " mark after the left end.</p><p>What number is the arrow pointing to?</p>",
  "<b>17</b> &mdash; three gaps span 73 − 52 = 21, so each gap is 7; the arrow is 5 gaps left of"
  " 52, and 52 − 35 = 17.", "17",
  "The positions of the marks were read off the rendered drawing.")
assert 52 - 5 * F(73 - 52, 3) == 17
pre(26, '4', 'line-graph',
  "<p><b>Figure:</b> a conversion graph with UK pounds from 0 to 100 across and Turkish Lira from"
  " 0 to 500 up; the straight line goes from (0, 0) to (100, 400).</p>",
  "The end point of the line was read off the rendered graph.")
q(26, 4, '4', 'a', 'calculation', RLG, '',
  "<p>Max buys a T-shirt for 120 Turkish Lira. How much in UK Pounds?</p>",
  "<b>£30</b> &mdash; the line gives £1 = 4 Lira, so 120 ÷ 4.", "£30|30|£30.00")
q(26, 5, '4', 'b', 'calculation', RLG, '', "<p>Convert £350 into Turkish Lira.</p>",
  "<b>1400 Lira</b> &mdash; £350 is off the graph, so use £100 = 400 Lira: 3.5 × 400.",
  "1400|1400 lira|1400 Lira|1,400")

BARPI = 'Bar Charts & Pictograms'
CUBES = 'Cubes & Cube Roots'
SUBST = 'Substitution'
# ================================ 27 December ======================================================
q(27, 1, '1', '', 'calculation', BARPI, 'pictogram',
  "<p><b>Figure:</b> a pictogram of Newport County's matches. Key: a circle represents 2 matches."
  " Win: 5 circles. Draw: 1 circle and a half circle. Loss: 3 circles and a half circle.</p>"
  "<p>A win is worth 3 points, a draw is worth 1 point, a lose is worth 0 points.</p>"
  "<p>How many points did Newport County earn over the season?</p>",
  "<b>33</b> &mdash; 10 wins, 3 draws and 7 losses: 10 × 3 + 3 × 1 = 33.", "33|33 points",
  "The number of circles in each row was counted off the rendered pictogram.")
assert 5 * 2 * 3 + F(3, 2) * 2 * 1 == 33
q(27, 2, '2', '', 'short', CUBES, '', "<p>List the first 6 cube numbers</p>",
  "<b>1, 8, 27, 64, 125, 216</b> &mdash; 1³, 2³, 3³, 4³, 5³, 6³.",
  "1, 8, 27, 64, 125, 216|1 8 27 64 125 216|1,8,27,64,125,216")
q(27, 3, '3', '', 'calculation', SUBST, '',
  "<p>Find the value of 4c + 5g when c = −6 and g = 1.5</p>",
  "<b>−16.5</b> &mdash; 4 × −6 = −24 and 5 × 1.5 = 7.5, so −24 + 7.5.", "-16.5")
assert 4 * -6 + 5 * F(3, 2) == F(-33, 2)
q(27, 4, '4', '', 'calculation', VOLSA, 'cuboid',
  "<p><b>Figure:</b> a cuboid 12cm wide, 5cm high and 22cm long.</p>"
  "<p>Find the volume of the cuboid.</p>",
  "<b>1320 cm³</b> &mdash; 12 × 5 × 22.", "1320|1320cm3|1320 cm3|1320 cm³",
  "The dimensions were read off the rendered drawing.")
assert 12 * 5 * 22 == 1320
q(27, 5, '5', '', 'calculation', LINEQ, '',
  "<p>Solve &nbsp;<sup>x</sup>&frasl;<sub>2</sub> = 1<sup>1</sup>&frasl;<sub>2</sub></p>",
  "<b>x = 3</b> &mdash; multiply both sides by 2: 2 × 1½ = 3.", "x = 3|x=3|3")

LAWIN = 'Laws of Indices'
# ================================ 28 December ======================================================
q(28, 1, '1', '', 'calculation', IND, '', "<p>Work out 3<sup>3</sup> − 1</p>",
  "<b>26</b> &mdash; 3³ = 27, and 27 − 1 = 26.", "26")
q(28, 2, '2', '', 'short', LAWIN, '', "<p>Simplify &nbsp;a<sup>4</sup> ÷ a<sup>−2</sup></p>",
  "<b>a<sup>6</sup></b> &mdash; subtract the powers: 4 − (−2) = 6.", "a^6|a6")
q(28, 3, '3', '', 'short', PSHAP, '',
  "<p>Put the names of these quadrilaterals into the correct boxes: square, parallelogram, kite"
  " and rhombus.</p>"
  + T(['', 'Line symmetry', 'No line symmetry'],
      [['Two pairs of parallel lines', '', ''], ['No parallel lines', '', '']]),
  "<b>Two pairs of parallel lines with line symmetry: square, rhombus; two pairs with no line"
  " symmetry: parallelogram; no parallel lines with line symmetry: kite</b> &mdash; the last box"
  " stays empty.")
q(28, 4, '4', '', 'explain', HCF, '',
  "<p>Ravi says &ldquo;to find the lowest common multiple of two numbers, just multiply them"
  " together.&rdquo;</p><p>Explain why Ravi is wrong.</p>",
  "<b>Multiplying gives a common multiple, but not always the lowest</b> &mdash; e.g. 4 × 6 = 24,"
  " but the LCM of 4 and 6 is 12, because they share the factor 2.")
assert lcm(4, 6) == 12

EXPB  = 'Expanding Brackets'
BOUND = 'Bounds & Error Intervals'
# ================================ 29 December ======================================================
q(29, 1, '1', 'a', 'calculation', SUBST, '', "<p>If x = 5, work out the value of 4x</p>",
  "<b>20</b> &mdash; 4 × 5.", "20")
q(29, 2, '1', 'b', 'calculation', SUBST, '', "<p>If x = 3 and y = 9, work out 2x − y</p>",
  "<b>−3</b> &mdash; 2 × 3 − 9 = 6 − 9.", "-3")
q(29, 3, '2', '', 'short', EXPB + ',' + SIMP, '',
  "<p>Expand and simplify &nbsp;3(2x + 1) + 2(x + 7)</p>",
  "<b>8x + 17</b> &mdash; 6x + 3 + 2x + 14.", "8x + 17|8x+17|17 + 8x")
q(29, 4, '3', '', 'calculation', BOUND, '',
  "<p><b>Figure:</b> a sign reading &ldquo;Frome &mdash; Population 26,000&rdquo;.</p>"
  "<p>This sign is correct to the nearest thousand.</p>"
  "<p>What is the lowest possible number of people that live in Frome?</p>",
  "<b>25 500</b> &mdash; half of 1000 below 26 000; 25 500 rounds up to 26 000.",
  "25500|25 500|25,500")
q(29, 5, '4', '', 'calculation', LINEQ + ',' + EXPB, '', "<p>Solve &nbsp;5(2y + 1) = 85</p>",
  "<b>y = 8</b> &mdash; divide by 5 to get 2y + 1 = 17, so 2y = 16.", "y = 8|y=8|8")
assert 5 * (2 * 8 + 1) == 85
q(29, 6, '5', '', 'calculation', VOLSA, 'cylinder',
  "<p><b>Figure:</b> a cylinder with radius 2cm and height 5cm.</p>"
  "<p>Calculate the volume of the cylinder.</p>",
  "<b>62.8 cm³</b> (20π) &mdash; π × 2² × 5.",
  "62.8|62.83|62.8cm3|62.8 cm³|20π|20pi", "The dimensions were read off the rendered drawing.")

COORD = 'Coordinates'
# ================================ 30 December ======================================================
q(30, 1, '1', '', 'calculation', ADDF, '',
  "<p>Work out <sup>7</sup>&frasl;<sub>20</sub> + <sup>1</sup>&frasl;<sub>3</sub></p>",
  "<b><sup>41</sup>&frasl;<sub>60</sub></b> &mdash; 21/60 + 20/60.", "41/60")
assert F(7, 20) + F(1, 3) == F(41, 60)
q(30, 2, '2', '', 'calculation', HCF, '',
  "<p>Imogen is organising a barbecue. She needs bread rolls and burgers. Bread rolls are sold"
  " in packs of 20. Burgers are sold in packs of 12. Imogen buys exactly the same number of bread"
  " rolls as burgers.</p><p>What is the least number of each pack that Imogen buys?</p>"
  "<p>.......... packs of bread rolls &nbsp; .......... packs of burgers</p>",
  "<b>3 packs of bread rolls and 5 packs of burgers</b> &mdash; the LCM of 20 and 12 is 60,"
  " and 60 ÷ 20 = 3, 60 ÷ 12 = 5.")
assert lcm(20, 12) == 60
q(30, 3, '3', '', 'short', COORD, 'coordinate-grid',
  "<p><b>Figure:</b> a square drawn on axes. Its corners are labelled (0, 7) top left, (14, 7) top"
  " right, (14, −7) bottom right, and B bottom left.</p>"
  "<p>The diagram shows a square. Write down the coordinates of <b>B</b></p>",
  "<b>(0, −7)</b> &mdash; B is below (0, 7) and level with (14, −7).", "(0, -7)|(0,-7)|0, -7|0,-7")
q(30, 4, '4', '', 'calculation', CALCD + ',' + 'Subtraction', '',
  "<p>The table shows the prices of first and second class stamps for Letters and Large Letters"
  " up to 500g.</p>"
  + T(['Format', 'Weight', '1st Class', '2nd Class'],
      [['Letters', '0 - 100g', '62p', '53p'], ['Large Letters', '0 - 100g', '93p', '73p'],
       ['Large Letters', '101 - 250g', '£1.24', '£1.17'],
       ['Large Letters', '251 - 500g', '£1.65', '£1.48']])
  + "<p>Matt is going to post a Letter weighing 80g and a Large Letter weighing 300g. He chooses"
  " to post them both as second class.</p>"
  "<p>How much money has Matt saved by posting second class instead of first class?</p>",
  "<b>26p</b> &mdash; first class would be 62p + £1.65 = £2.27, second class is 53p + £1.48 ="
  " £2.01.", "26p|26|£0.26|0.26")
assert (62 + 165) - (53 + 148) == 26

INEQ  = 'Inequalities'
MULDF = 'Multiplying & Dividing Fractions'
# ================================ 31 December ======================================================
q(31, 1, '1', '', 'calculation', ROUND, '', "<p>Round 18.7347 to two decimal places</p>",
  "<b>18.73</b> &mdash; the third decimal place is 4, so round down.", "18.73")
q(31, 2, '2', '', 'short', INEQ, '',
  "<p>−1 ≤ x &lt; 3</p><p>Write down all the possible integer values of x.</p>",
  "<b>−1, 0, 1, 2</b> &mdash; −1 is included and 3 is not.", "-1, 0, 1, 2|-1,0,1,2|-1 0 1 2")
q(31, 3, '3', '', 'calculation', MULDF, '',
  "<p>Work out <sup>7</sup>&frasl;<sub>8</sub> × <sup>3</sup>&frasl;<sub>4</sub></p>",
  "<b><sup>21</sup>&frasl;<sub>32</sub></b> &mdash; multiply the tops and the bottoms.", "21/32")
assert F(7, 8) * F(3, 4) == F(21, 32)
pre(31, '4', 'tree-diagram',
  "<p>During a weekend, 60 buses arrive in a village. 43 of the 50 buses that arrive on the"
  " Saturday are on time. 2 of the buses that arrive on Sunday are late.</p>"
  "<p><b>Figure:</b> a frequency tree starting at 60, branching to Saturday and Sunday, and each"
  " of those branching to Late and On Time, with every circle after the first left blank.</p>")
q(31, 4, '4', 'a', 'annotate', PROB, '', "<p>Complete the frequency tree.</p>",
  "<b>Saturday 50 (Late 7, On Time 43); Sunday 10 (Late 2, On Time 8)</b> &mdash; 60 − 50 = 10"
  " on Sunday and 50 − 43 = 7 late on Saturday.")
q(31, 5, '4', 'b', 'calculation', PROB, '', "<p>What fraction of the buses are late?</p>",
  "<b><sup>3</sup>&frasl;<sub>20</sub></b> &mdash; 7 + 2 = 9 of 60.", "3/20|9/60|0.15")
assert F(50 - 43 + 2, 60) == F(3, 20)
