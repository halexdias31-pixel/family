"""Corbettmaths 5-a-day, Foundation, June — read off the 30 rendered pages of June.pdf.

Every page was rendered and READ rather than extracted: the text layer drops the numbers inside the
pictures (triangle sides, table entries, grids) and runs indices into their bases. This book is laid
out as a two-column grid, so a printed row usually holds TWO questions side by side; each cell is its
own `q` row (its own `pos`), and where two cells hang off one stem (the hat, the same line, the same
table) they share a question number, differ by `part`, and the stem is a `pre` row.

No answers are printed in the book. Every answer is worked out from the transcribed question with
`Fraction` arithmetic and asserted below; what cannot be derived exactly (a drawing, a reading off a
line somebody draws) is left for a person to mark with NO_SCHEME and no `accept`.
"""
import pathlib, sys
from fractions import Fraction as F
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from common import Month, T, NO_SCHEME
MONTH = Month(6, '1RJ2QHh2kwUAhdiosFP2PSHABvNKUOeq5')
q, pre = MONTH.q, MONTH.pre

# topics, in data/topics.json's own spellings (common.py asserts every one)
PROB  = 'Basic Probability'
PCTID = 'Percentage Increase & Decrease'
PCTAM = 'Percentage of an Amount'
AREA2 = 'Area of 2-D Shapes'
SLG   = 'Straight Line Graphs'
SUBST = 'Substitution'
DRAW = ('A drawing on the grid, so it is left for a person to mark against the points worked out'
        ' in the question before it.')

# ================================ 1 June ==========================================================
pre(1, '1', '', "<p>The numbers 1 to 12 inclusive are placed in a hat.<br>John takes a number out"
    " of the bag at random.</p>")
q(1, 1, '1', 'a', 'calculation', PROB, '', "<p>What is the probability it is a 5?</p>",
  "<b>1/12</b> &mdash; one of the twelve equally likely numbers is a 5.", "1/12")
q(1, 2, '1', 'b', 'calculation', PROB, '', "<p>What is the probability it is an odd number?</p>",
  "<b>1/2</b> &mdash; 1, 3, 5, 7, 9 and 11 are odd, so 6/12 = 1/2.", "1/2|6/12|0.5")
assert 8 * F(130, 100) == F(52, 5) and 8 * F(135, 100) == F(54, 5)
q(1, 3, '2', 'a', 'calculation', PCTID, '', "<p>Increase £8 by 30%</p>",
  "<b>£10.40</b> &mdash; 30% of £8 is £2.40, and 8 + 2.40 = 10.40 (or 8 × 1.3).", "10.40|10.4|£10.40")
q(1, 4, '2', 'b', 'calculation', PCTID, '', "<p>Increase £8 by 35%</p>",
  "<b>£10.80</b> &mdash; 35% of £8 is £2.80, and 8 + 2.80 = 10.80 (or 8 × 1.35).", "10.80|10.8|£10.80")
q(1, 5, '3', '', 'calculation', AREA2, 'triangle',
  "<p><b>Figure:</b> a triangle with a horizontal top side of 9cm. A dotted perpendicular height of"
  " 3cm is drawn from the top side down to the opposite vertex.</p><p>Find the area of this"
  " triangle</p>",
  "<b>13.5 cm²</b> &mdash; ½ × base × perpendicular height = ½ × 9 × 3.", "13.5|13.5 cm²|13.5cm²")
pre(1, '4', '', "<p>y = 3x + 3</p>")
q(1, 6, '4', 'a', 'short', SUBST + ',' + SLG, 'table-blank',
  "<p>Complete the table of values for y = 3x + 3.</p>"
  + T(['x', '0', '1', '2', '3', '4', '5'], [['y', '', '', '', '', '', '']]),
  "<b>3, 6, 9, 12, 15, 18</b> &mdash; put each x into 3x + 3.")
q(1, 7, '4', 'b', 'drawing', SLG, 'grid-blank',
  "<p>On the grid draw the graph of y = 3x + 3 for values of x from 0 to 5.</p><p>(The grid runs x"
  " from 0 to 5 and y from 0 to 20.)</p>",
  "<b>A straight line through (0, 3) and (5, 18)</b> &mdash; plot the six points from the table and"
  " join them with a ruler.", '', DRAW)

# ================================ 2 June ==========================================================
CUBE  = 'Cubes & Cube Roots'
FDP   = 'Fraction Decimal Percentage Conversion'
FRAMT = 'Fractions of an Amount'
LINEQ = 'Linear Equations'
SCAT  = 'Scatter Graphs & Correlation'
q(2, 1, '1', '', 'calculation', CUBE, '', "<p>Work out 10 cubed</p>",
  "<b>1000</b> &mdash; 10 × 10 × 10.", "1000|1,000")
q(2, 2, '2', '', 'calculation', CUBE, '', "<p>Work out the cube root of 64</p>",
  "<b>4</b> &mdash; 4 × 4 × 4 = 64.", "4")
q(2, 3, '3', 'a', 'calculation', FRAMT, '', "<p>Write down £1.50 as a fraction of £5</p>",
  "<b>3/10</b> &mdash; 150p out of 500p is 150/500 = 3/10.", "3/10|150/500|1.5/5")
q(2, 4, '3', 'b', 'calculation', FDP, '', "<p>Write that answer as a percentage</p>",
  "<b>30%</b> &mdash; 3/10 = 30/100.", "30%|30")
assert 5 * 6 - 2 == 28 and 6 * (7 + 2) == 54
q(2, 5, '4', 'a', 'calculation', LINEQ, '', "<p>Solve 5y &minus; 2 = 28</p>",
  "<b>y = 6</b> &mdash; add 2 to get 5y = 30, then divide by 5.", "y = 6|y=6|6")
q(2, 6, '4', 'b', 'calculation', LINEQ, '', "<p>Solve 6(y + 2) = 54</p>",
  "<b>y = 7</b> &mdash; divide by 6 to get y + 2 = 9, then take 2.", "y = 7|y=7|7")
q(2, 7, '5', '', 'short', SCAT, 'scatter',
  "<p>Match each scatter graph to the best description of the type and strength of"
  " correlation.</p><p><b>Figure:</b> three small scatter graphs. In the first the nine crosses are"
  " spread over the whole square with no trend. In the second the crosses drift loosely upwards from"
  " bottom left to top right. In the third seven crosses fall closely in a line from top left to"
  " bottom right.</p><p>Descriptions: Strong positive correlation &nbsp; Weak positive correlation"
  " &nbsp; No correlation &nbsp; Weak negative correlation &nbsp; Strong negative correlation</p>",
  "<b>first: no correlation; second: weak positive correlation; third: strong negative"
  " correlation</b> &mdash; two of the five descriptions are not used.", '',
  'The three graphs were read off the rendered page; the matching is a judgement of the plotted'
  ' crosses, so it is left for a person to mark.')

# ================================ 3 June ==========================================================
IDX   = 'Indices'
EXPND = 'Expanding Brackets'
BEAR  = 'Bearings'
FACT  = 'Factorising'
MAP_NOTE = ('The map is a picture. The two crosses were located in pixels on the rendered page'
            ' (Donhampton is 244 units right of and 216 below Leek), giving 131.5° and 311.5°; a'
            ' measured bearing takes a tolerance, so it is left for a person to mark.')
q(3, 1, '1', '', 'short', IDX + ',' + CUBE, '',
  "<p>Arrange these in order, starting with the smallest.</p><p>2<sup>2</sup> &nbsp;&nbsp;"
  " &#8731;27 &nbsp;&nbsp; 1<sup>3</sup> &nbsp;&nbsp; &radic;25</p>",
  "<b>1<sup>3</sup>, &#8731;27, 2<sup>2</sup>, &radic;25</b> &mdash; they are 1, 3, 4 and 5.")
q(3, 2, '2', 'a', 'calculation', EXPND, '', "<p>Expand y(6 &minus; 2y<sup>2</sup>)</p>",
  "<b>6y &minus; 2y<sup>3</sup></b> &mdash; y × 6 = 6y and y × 2y<sup>2</sup> = 2y<sup>3</sup>.",
  "6y - 2y^3|6y-2y^3|6y − 2y³|6y-2y³")
q(3, 3, '2', 'b', 'calculation', EXPND, '', "<p>Expand 4h(2h &minus; 3)</p>",
  "<b>8h<sup>2</sup> &minus; 12h</b> &mdash; 4h × 2h = 8h<sup>2</sup> and 4h × 3 = 12h.",
  "8h^2 - 12h|8h^2-12h|8h² − 12h|8h²-12h")
pre(3, '3', 'map', "<p><b>Figure:</b> a map of an island with a North arrow pointing straight up"
    " and the scale 1cm = 10 miles. Five places are marked with crosses: Leek at the top left,"
    " Castletown near the top middle, Bilton on the left, Foxville lower left and Donhampton at the"
    " bottom right, below and to the right of Leek.</p>")
q(3, 4, '3', 'a', 'short', BEAR, 'map', "<p>What is the bearing of Donhampton from Leek?</p>",
  "<b>about 131°</b> &mdash; measure clockwise from North at Leek to the line to Donhampton.",
  '', MAP_NOTE)
q(3, 5, '3', 'b', 'short', BEAR, 'map', "<p>What is the bearing of Leek from Donhampton?</p>",
  "<b>about 311°</b> &mdash; the back bearing is the first one plus 180°.", '', MAP_NOTE)
q(3, 6, '4', '', 'calculation', FACT, '', "<p>Factorise completely 10xy + 6x<sup>2</sup></p>",
  "<b>2x(5y + 3x)</b> &mdash; the highest common factor of both terms is 2x.",
  "2x(5y + 3x)|2x(5y+3x)|2x(3x + 5y)|2x(3x+5y)")

# ================================ 4 June ==========================================================
SIMP  = 'Simplifying & Collecting Terms'
MANIP = 'Manipulating Expressions'
LIST  = 'Listing Outcomes & Sample Space'
TRANS = 'Translations'
ENLG  = 'Enlargements'
q(4, 1, '1', 'a', 'calculation', SIMP, '', "<p>Simplify a + a + a + a</p>",
  "<b>4a</b> &mdash; four lots of a.", "4a")
q(4, 2, '1', 'b', 'calculation', SIMP, '', "<p>Simplify 5a + 3b &minus; a &minus; 5b</p>",
  "<b>4a &minus; 2b</b> &mdash; 5a &minus; a = 4a and 3b &minus; 5b = &minus;2b.",
  "4a - 2b|4a-2b|4a − 2b")
pre(4, '2', '', "<p>Wilson is x years old.</p>")
q(4, 3, '2', 'a', 'short', MANIP, '', "<p>Ishaq is four years younger than Wilson.</p><p>Write an"
  " expression for Ishaq's age</p>", "<b>x &minus; 4</b> &mdash; four fewer years than x.",
  "x - 4|x-4|x − 4")
q(4, 4, '2', 'b', 'short', MANIP, '', "<p>Nicky is half of Wilson's age.</p><p>Write an expression"
  " for Nicky's age.</p>", "<b>x/2</b> &mdash; half of x, which can also be written ½x.",
  "x/2|x ÷ 2|½x|0.5x|1/2x")
q(4, 5, '3', '', 'short', LIST, '',
  "<p>Marta attends one activity each day. List all possible combinations.</p>"
  + T(['Monday', 'Tuesday'], [['Golf', 'Ice-skating'], ['Football', 'Swimming'],
                              ['Rugby', 'Dodgeball'], ['Hockey', 'Basketball']]),
  "<b>16 combinations</b> &mdash; each of the 4 Monday activities with each of the 4 Tuesday ones:"
  " Golf with Ice-skating, Swimming, Dodgeball or Basketball, and the same four for Football, Rugby"
  " and Hockey.")
SHAPE_A = ("<p><b>Figure:</b> a square grid. Shape A is an L made of three squares: a column two"
           " squares tall with one more square to the right of its bottom square. Point P is on the"
           " bottom grid line, one square to the left of the bottom-left corner of A.</p>")
pre(4, '4', 'grid', SHAPE_A)
q(4, 6, '4', 'a', 'drawing', TRANS, 'grid', "<p>Translate shape A using the vector"
  " (0 over 4), that is 0 across and 4 up.</p>",
  "<b>The same L moved 4 squares straight up</b> &mdash; a top number of 0 is no movement across.",
  '', 'A drawing on the grid, so it is left for a person to mark.')
q(4, 7, '4', 'b', 'drawing', ENLG, 'grid', "<p>Enlarge shape A by scale factor 3, using point P as"
  " the centre of enlargement.</p>",
  "<b>An L three times the size</b> &mdash; measured from P, the corners of A at (1, 0), (3, 0),"
  " (3, 1), (2, 1), (2, 2) and (1, 2) squares go to (3, 0), (9, 0), (9, 3), (6, 3), (6, 6) and"
  " (3, 6).", '', 'A drawing on the grid, so it is left for a person to mark. The shape and P were'
  ' read off the rendered page.')

# ================================ 5 June ==========================================================
MULDF = 'Multiplying & Dividing Fractions'
PROBL = 'Ratio Problems'
SHAPES = '2-D Shapes'
assert F(5, 9) * 27 == 15
assert 2 * (920 // 5) * 50 - 920 == 17480
q(5, 1, '1', 'a', 'calculation', FDP, '', "<p>Write 52% as a decimal</p>",
  "<b>0.52</b> &mdash; 52 ÷ 100.", "0.52|.52")
q(5, 2, '1', 'b', 'calculation', FDP, '', "<p>Write 0.55 as a fraction in its simplest form</p>",
  "<b>11/20</b> &mdash; 0.55 = 55/100, and dividing top and bottom by 5 gives 11/20.")
q(5, 3, '2', '', 'calculation', FRAMT, '', "<p>5/9 × 27</p>",
  "<b>15</b> &mdash; a ninth of 27 is 3, and five ninths is 15.", "15")
pre(5, '3', '', "<p>Bag 1 contains £9.20 in 5p coins.<br>Bag 2 contains twice as many coins as Bag"
    " 1.<br>If Bag 2 contains only 50p coins.</p>")
q(5, 4, '3', '', 'calculation', PROBL, '', "<p>How much more money is in Bag 2 than Bag 1?</p>",
  "<b>£174.80</b> &mdash; Bag 1 has 920 ÷ 5 = 184 coins, so Bag 2 has 368 coins × 50p = £184, and"
  " 184 &minus; 9.20 = 174.80.", "174.80|174.8|£174.80")
q(5, 5, '4', '', 'short', SHAPES, 'table-blank',
  "<p>Complete the table</p>"
  + T(['', 'Square', 'Rhombus', 'Trapezium'],
      [['Number of pairs of parallel sides', '2', '', ''],
       ['Diagonals always equal in length', '', '', 'No']]),
  "<b>Square: 2, Yes. Rhombus: 2, No. Trapezium: 1, No.</b> &mdash; a rhombus's diagonals are"
  " only equal when it is a square, and a trapezium has exactly one pair of parallel sides.")
assert F(20 - 8, 20) == F(3, 5)
q(5, 6, '5', '', 'calculation', PROB, '',
  "<p>Susan has some beads in a bag.<br>5 of the beads are orange.<br>3 of the beads are purple.<br>"
  "The rest of the beads are pink.<br>Susan takes a bead from the bag at random.<br>The probability"
  " that she takes a pink bead is 3/5</p><p>How many pink beads are in the bag before Susan takes a"
  " bead?</p>",
  "<b>12</b> &mdash; the 8 orange and purple beads are the other 2/5, so 1/5 is 4 beads, there are"
  " 20 altogether and 20 &minus; 8 = 12 are pink.", "12")

# ================================ 6 June ==========================================================
NEG   = 'Negative Numbers'
MULT  = 'Multiplication'
q(6, 1, '1', '', 'short', NEG, '',
  "<p>Cards: &nbsp;5 &nbsp; 4 &nbsp; 2 &nbsp; &minus;1 &nbsp; &minus;5</p><p>Use the cards above to"
  " complete the sums.</p><p>&#9633; + &#9633; = 0<br>&#9633; + &#9633; = 3</p>",
  "<b>5 + &minus;5 = 0 and 4 + &minus;1 = 3</b> &mdash; the only pair making 0 is 5 and &minus;5, and"
  " of the cards left only 4 and &minus;1 make 3 (2 would need a 1).")
assert 20 * F(13, 10) == 26 and 26 * F(13, 10) == F(338, 10) and 20 + 26 + F(338, 10) == F(798, 10)
pre(6, '2', '', "<p>Benjamin is starting a new training program.<br>Each month he increases the"
    " distance he runs by 3/10</p><p>In month 1 he ran 20 miles.</p>")
q(6, 2, '2', 'a', 'calculation', FRAMT, '', "<p>How far does Benjamin run in month 2?</p>",
  "<b>26 miles</b> &mdash; 3/10 of 20 is 6, and 20 + 6 = 26.", "26|26 miles")
q(6, 3, '2', 'b', 'calculation', FRAMT, '', "<p>How far does Benjamin run in total over the first"
  " three months?</p>",
  "<b>79.8 miles</b> &mdash; month 3 is 26 + 3/10 of 26 = 33.8, and 20 + 26 + 33.8 = 79.8.",
  "79.8|79.8 miles")
assert 42 * 31 == 1302 and 42 * 62 == 2604 and 42 * 32 == 1344
pre(6, '3', '', "<p>Using the information that &nbsp; 42 x 31 = 1302</p>")
q(6, 4, '3', 'a', 'calculation', MULT, '', "<p>write down the value of 42 x 62</p>",
  "<b>2604</b> &mdash; 62 is double 31, so the answer is double 1302.", "2604")
q(6, 5, '3', 'b', 'calculation', MULT, '', "<p>write down the value of 42 x 32</p>",
  "<b>1344</b> &mdash; 32 is one more than 31, so add one more 42: 1302 + 42.", "1344")
assert (F(7) ** 2 - 3) / (2 * F(1, 8)) == 184
q(6, 6, '4', '', 'calculation', SUBST, '',
  "<p>Find the value of: &nbsp; (w<sup>2</sup> &minus; 3) / 2a</p><p>When w = 7 and a = 0.125</p>",
  "<b>184</b> &mdash; the top is 49 &minus; 3 = 46 and the bottom is 2 × 0.125 = 0.25, and"
  " 46 ÷ 0.25 = 184.", "184")
assert 27 / F(3, 4) == 36 and F(2, 9) * 36 == 8
q(6, 7, '5', '', 'calculation', FRAMT, '', "<p>Three quarters of a number is 27.<br>What is two"
  " ninths of the number?</p>",
  "<b>8</b> &mdash; a quarter is 9, so the number is 36; a ninth of 36 is 4 and two ninths is 8.",
  "8")

# ================================ 7 June ==========================================================
BIDMAS = 'Order of Operations'
SQRT  = 'Squares & Square Roots'
import itertools
_ops = {'+': lambda a, b: a + b, '-': lambda a, b: a - b, '×': lambda a, b: a * b,
        '÷': lambda a, b: F(a, 1) / b}
_hits = [(o1, o2) for o1, o2 in itertools.product(_ops, repeat=2)
         if eval('2%s5%s10' % tuple(dict(zip('+-×÷', '+-*/'))[o] for o in (o1, o2))) == 0]
assert _hits == [('×', '-')], _hits
q(7, 1, '1', '', 'calculation', BIDMAS, '', "<p>Work out 3 x (2 + 4)</p>",
  "<b>18</b> &mdash; the bracket first, 2 + 4 = 6, then 3 × 6.", "18")
q(7, 2, '2', '', 'short', BIDMAS, '', "<p>2 &#9633; 5 &#9633; 10 = 0</p><p>Put the correct"
  " operations into the boxes to make the sum correct</p>",
  "<b>2 × 5 &minus; 10 = 0</b> &mdash; multiplication comes first, 10 &minus; 10 = 0; no other pair"
  " of the four operations works.")
q(7, 3, '3', 'a', 'calculation', CUBE, '', "<p>Work out the cube of 4</p>",
  "<b>64</b> &mdash; 4 × 4 × 4.", "64")
assert F(185, 10) ** 2 == F(34225, 100)
q(7, 4, '3', 'b', 'calculation', SQRT, '', "<p>Work out the square of 18.5</p>",
  "<b>342.25</b> &mdash; 18.5 × 18.5.", "342.25")
pre(7, '4', '', "<p>x + y = 6</p>")
q(7, 5, '4', 'a', 'short', SUBST + ',' + SLG, 'table-blank',
  "<p>Complete the table of values for the graph x + y = 6</p>"
  + T(['x', '0', '1', '2', '3', '4'], [['y', '', '5', '', '', '']]),
  "<b>6, 5, 4, 3, 2</b> &mdash; y = 6 &minus; x.")
q(7, 6, '4', 'b', 'drawing', SLG, 'grid-blank',
  "<p>On the grid, draw the graph of x + y = 6.</p><p>(The grid runs x from 0 to 4 and y from 0 to"
  " 8.)</p>",
  "<b>A straight line through (0, 6) and (4, 2)</b> &mdash; plot the points from the table and"
  " join them with a ruler.", '', DRAW)
q(7, 7, '5', '', 'calculation', PCTID, '',
  "<p>Mr Jones is given a pay rise.<br>Before the pay rise he received £10 an hour.<br>After the pay"
  " rise he received £25 an hour.</p><p>Calculate the percentage increase.</p>",
  "<b>150%</b> &mdash; the rise is £15, and 15 ÷ 10 × 100 = 150.", "150%|150")

# ================================ 8 June ==========================================================
NTH   = 'nth Term of a Linear Sequence'
PROOF = 'Algebraic Proof'
EXPCT = 'Relative Frequency & Expectation'
q(8, 1, '1', 'a', 'calculation', NEG, '', "<p>&minus;2 × 6</p>",
  "<b>&minus;12</b> &mdash; a negative times a positive is negative.", "-12|−12")
q(8, 2, '1', 'b', 'calculation', NEG, '', "<p>&minus;14 ÷ &minus;7</p>",
  "<b>2</b> &mdash; a negative divided by a negative is positive.", "2")
q(8, 3, '2', '', 'explain', SQRT + ',' + PROOF, '',
  "<p>Caroline says if you subtract two consecutive square numbers, the answer is always odd.</p>"
  "<p>Is she correct?</p>",
  "<b>Yes</b> &mdash; (n + 1)<sup>2</sup> &minus; n<sup>2</sup> = 2n + 1, which is always odd; for"
  " example 16 &minus; 9 = 7 and 25 &minus; 16 = 9.")
q(8, 4, '3', '', 'explain', SQRT, '',
  "<p>Sophie says if you square a number, the answer is always bigger.</p><p>Explain why she is"
  " wrong.</p>",
  "<b>A counter-example</b> &mdash; 0.5<sup>2</sup> = 0.25, which is smaller; and 1<sup>2</sup> = 1"
  " and 0<sup>2</sup> = 0 are not bigger either.")
assert [2 * n + 13 for n in range(1, 7)] == [15, 17, 19, 21, 23, 25] and 2 * 20 + 13 == 53
pre(8, '4', '', "<p>15 &nbsp; 17 &nbsp; 19 &nbsp; 21 &nbsp; 23 &nbsp; 25</p>")
q(8, 5, '4', 'a', 'calculation', NTH, '', "<p>Calculate the nth term</p>",
  "<b>2n + 13</b> &mdash; it goes up in 2s, and 15 &minus; 2 = 13.", "2n + 13|2n+13|13 + 2n|13+2n")
q(8, 6, '4', 'b', 'calculation', NTH, '', "<p>Work out the 20th term in the sequence</p>",
  "<b>53</b> &mdash; 2 × 20 + 13.", "53")
assert 500 * 4 - F(1, 10) * 500 * 12 == 1400
q(8, 7, '5', '', 'calculation', EXPCT, '',
  "<p>Mrs Jenkins is organising a charity raffle.<br>She sells 500 tickets for £4 each.<br>The"
  " probability that someone wins a prize is 0.1<br>Each prize cost £12<br>The profit is donated to"
  " charity.</p><p>Work out how much money Mrs Jenkins donates to charity.</p>",
  "<b>£1400</b> &mdash; tickets bring in 500 × £4 = £2000; she expects 0.1 × 500 = 50 prizes costing"
  " 50 × £12 = £600; 2000 &minus; 600 = 1400.", "1400|£1400|1,400")

# ================================ 9 June ==========================================================
MEAN  = 'Mean'
ROT   = 'Rotations'
REFL  = 'Reflections'
SHARE = 'Sharing in a Ratio'
_d9 = [21, 25, 27, 20, 23, 26, 28, 22]
assert sum(_d9) == 192 and F(sum(_d9), len(_d9)) == 24
q(9, 1, '1', '', 'calculation', MEAN, '', "<p>Find the mean of:</p><p>21 &nbsp; 25 &nbsp; 27"
  " &nbsp; 20 &nbsp; 23 &nbsp; 26 &nbsp; 28 &nbsp; 22</p>",
  "<b>24</b> &mdash; the eight numbers add to 192, and 192 ÷ 8 = 24.", "24")
q(9, 2, '2', 'a', 'calculation', SIMP, '', "<p>Simplify 5 × 7w</p>", "<b>35w</b> &mdash; 5 × 7 = 35.",
  "35w")
q(9, 3, '2', 'b', 'calculation', SIMP, '', "<p>Simplify 2w × 3w</p>",
  "<b>6w<sup>2</sup></b> &mdash; 2 × 3 = 6 and w × w = w<sup>2</sup>.", "6w^2|6w²|6w2")
_A9 = [(2, 3), (5, 3), (5, 1), (4, 1), (4, 2), (2, 2)]
pre(9, '3', 'grid', "<p><b>Figure:</b> a coordinate grid with x and y each from &minus;6 (&minus;5"
    " for y) to 6 (5 for y). Shape A is an L with corners at (2, 3), (5, 3), (5, 1), (4, 1), (4, 2)"
    " and (2, 2).</p>")
q(9, 4, '3', 'a', 'drawing', ROT, 'grid', "<p>Rotate shape A 180° about (0, 0).</p><p>Label this"
  " shape, B.</p>",
  "<b>B has corners (&minus;2, &minus;3), (&minus;5, &minus;3), (&minus;5, &minus;1), (&minus;4,"
  " &minus;1), (&minus;4, &minus;2), (&minus;2, &minus;2)</b> &mdash; a half turn about the origin"
  " changes the sign of both coordinates.", '', 'A drawing on the grid, so it is left for a person'
  ' to mark. The corners of A were read off the rendered page.')
q(9, 5, '3', 'b', 'drawing', REFL, 'grid', "<p>Reflect shape A using the mirror line x = 1</p>"
  "<p>Label this shape, C.</p>",
  "<b>C has corners (0, 3), (&minus;3, 3), (&minus;3, 1), (&minus;2, 1), (&minus;2, 2), (0, 2)</b>"
  " &mdash; each point moves to the same distance on the other side of x = 1, so x becomes"
  " 2 &minus; x.", '', 'A drawing on the grid, so it is left for a person to mark. The corners of A'
  ' were read off the rendered page.')
assert [2 - x for x, _ in _A9] == [0, -3, -3, -2, -2, 0]
assert 320 * F(2, 5) == 128 and 320 * F(3, 5) == 192
q(9, 6, '4', '', 'calculation', SHARE, '', "<p>Share $320 in the ratio 2:3</p>",
  "<b>$128 : $192</b> &mdash; 5 parts, so one part is 320 ÷ 5 = 64; 2 × 64 and 3 × 64.",
  "128:192|128 : 192|$128 and $192|128 and 192|128, 192")

# ================================ 10 June =========================================================
PCT   = 'Fraction Decimal Percentage Conversion'
MODE  = 'Mode'
RANGE = 'Range'
MEDN  = 'Median'
ANGTQ = 'Angles in Triangles & Quadrilaterals'
CSHAP = 'Compound Shapes'
q(10, 1, '1', '', 'calculation', PCT, 'diagram',
  "<p><b>Figure:</b> a rectangle made of 20 equal squares, 5 across and 4 down. The last three"
  " squares of the top row and the last two squares of each of the other three rows are shaded,"
  " 9 squares in all.</p><p>What percentage of the shape is shaded?</p>",
  "<b>45%</b> &mdash; 9 out of 20 squares, and 9/20 = 45/100.", "45%|45",
  'The squares were counted off the rendered page.')
_d10 = [7, 4, 3, 8, 12, 8, 7, 1, 5, 7, 7]
assert max(set(_d10), key=_d10.count) == 7 and max(_d10) - min(_d10) == 11 and sorted(_d10)[5] == 7
pre(10, '2', '', "<p>7 &nbsp; 4 &nbsp; 3 &nbsp; 8 &nbsp; 12 &nbsp; 8 &nbsp; 7 &nbsp; 1 &nbsp; 5"
    " &nbsp; 7 &nbsp; 7</p>")
q(10, 2, '2', 'a', 'calculation', MODE, '', "<p>Find the mode</p>",
  "<b>7</b> &mdash; 7 appears four times, more than any other number.", "7")
q(10, 3, '2', 'b', 'calculation', RANGE, '', "<p>Find the range</p>",
  "<b>11</b> &mdash; 12 &minus; 1.", "11")
q(10, 4, '2', 'c', 'calculation', MEDN, '', "<p>Find the median</p>",
  "<b>7</b> &mdash; in order 1, 3, 4, 5, 7, 7, 7, 7, 8, 8, 12, the 6th of the 11 is 7.", "7")
q(10, 5, '3', '', 'calculation', ANGTQ, 'triangle',
  "<p><b>Figure:</b> a triangle standing on a line that is extended past its bottom-right corner."
  " The bottom-left angle is 75° and the top angle is 45°. The angle x is the exterior angle at the"
  " bottom right, between the extended line and the triangle's right side.</p><p>Find x</p>",
  "<b>x = 120°</b> &mdash; the third angle is 180 &minus; 75 &minus; 45 = 60°, and x = 180 &minus;"
  " 60 (an exterior angle is the sum of the two opposite interior angles, 75 + 45).",
  "120|120°|x = 120|x=120")
assert 15 * (10 - 4) + F(1, 2) * 15 * 4 == 120 and 8 * 16 == 128
q(10, 6, '4', '', 'explain', CSHAP, 'diagram',
  "<p><b>Figure:</b> the side of a house, a pentagon: a rectangle 15m wide with a triangular roof on"
  " top. The whole height from the ground to the top of the roof is 10m, and the roof is 4m"
  " high.</p><p>William is painting the side of his house.<br>He has 8 litres of paint and each"
  " litre of paint covers 16m²<br>Does William have enough paint?</p>",
  "<b>Yes</b> &mdash; the wall is 15 × 6 = 90 m² and the roof triangle is ½ × 15 × 4 = 30 m², 120 m²"
  " in all; 8 × 16 = 128 m² of paint is enough.")
q(10, 7, '5', '', 'calculation', FACT, '', "<p>Factorise 15y + 20</p>",
  "<b>5(3y + 4)</b> &mdash; 5 goes into both terms.", "5(3y + 4)|5(3y+4)|5(4 + 3y)|5(4+3y)")

# ================================ 11 June =========================================================
MIXED = 'Mixed Numbers'
EQUIV = 'Equivalent & Simplifying Fractions'
PRIME = 'Primes & Prime Factorisation'
ADDF  = 'Adding & Subtracting Fractions'
q(11, 1, '1', '', 'calculation', MIXED, '', "<p>Write as a mixed number &nbsp; 11/3</p>",
  "<b>3 2/3</b> &mdash; 3 goes into 11 three times with 2 left over.", "3 2/3")
assert 16 * F(4, 5) == F(64, 5)
q(11, 2, '2', '', 'explain', FRAMT, 'grid',
  "<p>Harry wants to shade whole squares so that exactly 4/5 of the grid is shaded.</p><p><b>Figure:"
  "</b> a square grid of 16 squares, 4 across and 4 down.</p><p>Explain why this is not"
  " possible.</p>",
  "<b>4/5 of 16 is 12.8</b> &mdash; that is not a whole number of squares (16 is not a multiple of"
  " 5), so it cannot be done by shading whole squares.", '',
  'The 4 by 4 grid was read off the rendered page.')
q(11, 3, '3', '', 'short', SQRT + ',' + PRIME, '',
  "<p>Martin says the next number after a square number is always prime.<br>He is wrong.</p>"
  "<p>Write down two square numbers where the next number is not prime.</p>",
  "<b>For example 9 and 25</b> &mdash; 10 and 26 are not prime. Any odd square number above 1 works,"
  " because the next number is even and bigger than 2 &mdash; 49 is another (50).")
assert F(7, 20) + F(1, 5) == F(11, 20) and F(1, 6) / F(2, 3) == F(1, 4)
q(11, 4, '4', 'a', 'calculation', ADDF, '', "<p>7/20 + 1/5</p>",
  "<b>11/20</b> &mdash; 1/5 = 4/20, and 7/20 + 4/20 = 11/20.", "11/20|0.55")
q(11, 5, '4', 'b', 'calculation', MULDF, '', "<p>1/6 ÷ 2/3</p>",
  "<b>1/4</b> &mdash; flip the second fraction and multiply: 1/6 × 3/2 = 3/12 = 1/4.",
  "1/4|3/12|0.25")
assert 2 * 2 * 5 * 5 == 100
q(11, 6, '5', '', 'calculation', PRIME, '', "<p>Write 100 as a product of primes</p>",
  "<b>2 × 2 × 5 × 5</b> &mdash; or 2<sup>2</sup> × 5<sup>2</sup>; 100 = 10 × 10 and 10 = 2 × 5.",
  "2 × 2 × 5 × 5|2x2x5x5|2*2*5*5|2^2 × 5^2|2² × 5²|2^2x5^2")

# ================================ 12 June =========================================================
CALCD = 'Calculating with Decimals'
CIRC  = 'Area & Circumference of Circles'
assert F(45, 135) == F(1, 3)
pre(12, '1', '', "<p>A tea costs 45p</p>")
q(12, 1, '1', 'a', 'calculation', FRAMT, '', "<p>What is 45p as a fraction of £1.35</p>",
  "<b>45/135</b> &mdash; £1.35 is 135p, so it is 45 out of 135.", "45/135|1/3")
q(12, 2, '1', 'b', 'calculation', EQUIV, '', "<p>Give your answer in its simplest form.</p>",
  "<b>1/3</b> &mdash; 45 goes into 135 exactly three times.")
q(12, 3, '2', 'a', 'calculation', EXPND, '', "<p>Expand 5(a + c)</p>",
  "<b>5a + 5c</b> &mdash; multiply each term inside by 5.", "5a + 5c|5a+5c|5c + 5a|5c+5a")
q(12, 4, '2', 'b', 'calculation', EXPND, '', "<p>Expand 10(x + 4)</p>",
  "<b>10x + 40</b> &mdash; multiply each term inside by 10.", "10x + 40|10x+40|40 + 10x|40+10x")
assert [4 * n - 1 for n in range(1, 5)] == [3, 7, 11, 15] and (501 + 1) % 4 != 0
pre(12, '3', '', "<p>3 &nbsp; 7 &nbsp; 11 &nbsp; 15 &nbsp; … …</p>")
q(12, 5, '3', 'a', 'calculation', NTH, '', "<p>Calculate the nth term</p>",
  "<b>4n &minus; 1</b> &mdash; it goes up in 4s, and 3 &minus; 4 = &minus;1.",
  "4n - 1|4n-1|4n − 1")
q(12, 6, '3', 'b', 'explain', NTH, '', "<p>Is 501 a term in the sequence?</p>",
  "<b>No</b> &mdash; 4n &minus; 1 = 501 gives n = 125.5, which is not a whole number (every term is"
  " one less than a multiple of 4, and 501 is one MORE than 500).")
assert F(2120, 1000) * F(52, 10) / (F(921, 100) - F(28, 10)) == F(11024, 6410)
q(12, 7, '4', '', 'calculation', CALCD, '',
  "<p>Use your calculator to work out the value of</p><p>(2.12 × 5.2) / (9.21 &minus; 2.8)</p>"
  "<p>Write down all the figures on your calculator display.</p>",
  "<b>1.719812793</b> &mdash; the top is 11.024 and the bottom is 6.41, and 11.024 ÷ 6.41 ="
  " 1.7198127925…", "1.719812793|1.7198127925|1.71981279")
q(12, 8, '5', '', 'calculation', CIRC, 'circle',
  "<p>Calculate the shaded area</p><p><b>Figure:</b> a shaded ring between two circles with the"
  " same centre. The inner (unshaded) circle has a diameter of 5cm and the outer circle has a"
  " diameter of 8cm.</p>",
  "<b>30.6 cm² (3 s.f.)</b> &mdash; the radii are 4 and 2.5, so the ring is &pi; × 4<sup>2</sup>"
  " &minus; &pi; × 2.5<sup>2</sup> = 9.75&pi; = 30.63…", "30.6|30.63|9.75π|9.75pi|30.6 cm²")

# ================================ 13 June =========================================================
STATS = 'Statistics'
LAWS  = 'Laws of Indices'
import itertools as _it
assert sorted(int(''.join(p)) for p in _it.permutations('589')) == [589, 598, 859, 895, 958, 985]
q(13, 1, '1', '', 'short', LIST, '', "<p>Using the digits 5, 8 and 9 only once in each number,"
  " write all possible three digit numbers.</p>",
  "<b>589, 598, 859, 895, 958, 985</b> &mdash; three choices for the first digit, two for the"
  " second and one for the last: 3 × 2 × 1 = 6 numbers.")
pre(13, '2', 'diagram', "<p><b>Figure:</b> a regular pentagon ABCDE with D at the top.</p>")
q(13, 2, '2', 'a', 'drawing', SHAPES, 'diagram', "<p>Draw all the lines of symmetry on the"
  " pentagon.</p>",
  "<b>5 lines</b> &mdash; each runs from a corner to the middle of the opposite side.", '',
  'A drawing on the shape, so it is left for a person to mark.')
q(13, 3, '2', 'b', 'calculation', SHAPES, 'diagram', "<p>What is the order of rotational"
  " symmetry?</p>", "<b>5</b> &mdash; a regular pentagon looks the same five times in one full"
  " turn.", "5")
q(13, 4, '3', 'a', 'calculation', EXPND, '', "<p>Expand 5(x + 3)</p>",
  "<b>5x + 15</b> &mdash; multiply each term inside by 5.", "5x + 15|5x+15|15 + 5x|15+5x")
q(13, 5, '3', 'b', 'calculation', EXPND, '', "<p>Expand y(2y + 1)</p>",
  "<b>2y<sup>2</sup> + y</b> &mdash; y × 2y = 2y<sup>2</sup> and y × 1 = y.",
  "2y^2 + y|2y^2+y|2y² + y|2y²+y|y + 2y^2|y+2y²")
q(13, 6, '4', '', 'short', STATS, '',
  "<p>Put a cross in the box to indicate whether each of the following is discrete or continuous"
  " data.</p><p>(A picture of a car.)</p><p>The weight of the car &nbsp; Discrete"
  " &#9633; &nbsp; Continuous &#9633;<br>The number of gears &nbsp; Discrete &#9633; &nbsp;"
  " Continuous &#9633;</p>",
  "<b>The weight is continuous; the number of gears is discrete</b> &mdash; a weight is measured"
  " and can take any value, a number of gears is counted.")
q(13, 7, '5', '', 'short', SIMP + ',' + LAWS, 'boxes',
  "<p>The expression in each block is found by multiplying the two blocks directly beneath it.</p>"
  "<p><b>Figure:</b> a pyramid of blocks. The bottom row is 2x, 3x and x; the middle row has two"
  " empty blocks and the top has one empty block.</p><p>Find the missing expressions.</p>",
  "<b>Middle row 6x<sup>2</sup> and 3x<sup>2</sup>; top 18x<sup>4</sup></b> &mdash; 2x × 3x,"
  " 3x × x, then 6x<sup>2</sup> × 3x<sup>2</sup>.")

# ================================ 14 June =========================================================
CONV  = 'Best Value & Unitary Method'
RLG   = 'Real-Life Graphs'
_d14 = [7, 7, 7, 8, 2, 8, 7, 7, 5]
assert max(set(_d14), key=_d14.count) == 7 and max(_d14) - min(_d14) == 6 and sorted(_d14)[4] == 7
pre(14, '1', '', "<p>7 &nbsp; 7 &nbsp; 7 &nbsp; 8 &nbsp; 2 &nbsp; 8 &nbsp; 7 &nbsp; 7 &nbsp; 5</p>")
q(14, 1, '1', 'a', 'calculation', MODE, '', "<p>Find the mode</p>",
  "<b>7</b> &mdash; 7 appears five times.", "7")
q(14, 2, '1', 'b', 'calculation', RANGE, '', "<p>Find the range</p>",
  "<b>6</b> &mdash; 8 &minus; 2.", "6")
q(14, 3, '1', 'c', 'calculation', MEDN, '', "<p>Find the median</p>",
  "<b>7</b> &mdash; in order 2, 5, 7, 7, 7, 7, 7, 8, 8, the middle (5th) of the nine is 7.", "7")
q(14, 4, '2', 'a', 'calculation', SIMP, '', "<p>Simplify 9m &minus; 2m</p>",
  "<b>7m</b> &mdash; 9 &minus; 2 = 7.", "7m")
q(14, 5, '2', 'b', 'calculation', SIMP, '', "<p>Simplify m + m + m + m + m</p>",
  "<b>5m</b> &mdash; five lots of m.", "5m")
q(14, 6, '3', '', 'calculation', CONV, '',
  "<p>George is going on holiday to Poland</p><p>George changes £180 into Zloty.<br>The exchange"
  " rate is £1 = 5 Zloty</p><p>Work out how many Zloty George gets for £180.</p>",
  "<b>900 Zloty</b> &mdash; 180 × 5.", "900|900 Zloty|900 zloty")
GRAPH14 = ('The graph is a picture. Its corners were read off the rendered page against the printed'
           ' scale: 10 minutes and 10 miles per labelled division.')
pre(14, '4', 'graph', "<p>James went on a journey.</p><p><b>Figure:</b> a distance-time graph with"
    " time (minutes) from 0 to 110 along the bottom and distance (miles) from 0 to 80 up the side."
    " The line goes from (0, 0) to (40, 30), stays level to (50, 30), rises steeply to (60, 60),"
    " stays level to (70, 60) and then rises to (100, 80).</p>", GRAPH14)
q(14, 7, '4', 'a', 'calculation', RLG, 'graph', "<p>How many times did James stop for a"
  " break?</p>", "<b>2</b> &mdash; the line is level twice, from 40 to 50 minutes and from 60 to 70"
  " minutes.", "2|twice")
q(14, 8, '4', 'b', 'calculation', RLG, 'graph', "<p>How far did James travel in total?</p>",
  "<b>80 miles</b> &mdash; the line ends at 80 miles.", "80|80 miles")
q(14, 9, '4', 'c', 'calculation', RLG, 'graph', "<p>How long was James stationary for?</p>",
  "<b>20 minutes</b> &mdash; two level stretches of 10 minutes each.", "20|20 minutes|20 mins")

# ================================ 15 June =========================================================
ANGPT = 'Angles at a Point & on a Line'
pre(15, '1', 'triangle', "<p><b>Figure:</b> an isosceles triangle standing on a line that is"
    " extended past its bottom-right corner. The two sloping sides carry matching marks, so they are"
    " equal. The angle inside the triangle at the bottom right is 40°. The angle y is at the top of"
    " the triangle, and x is the angle outside the triangle at the bottom right, between the"
    " extended line and the sloping side.</p>")
q(15, 1, '1', 'a', 'calculation', ANGPT, 'triangle', "<p>Find x</p>",
  "<b>x = 140°</b> &mdash; angles on a straight line add to 180°, and 180 &minus; 40 = 140.",
  "140|140°|x = 140|x=140")
q(15, 2, '1', 'b', 'calculation', ANGTQ, 'triangle', "<p>Find y</p>",
  "<b>y = 100°</b> &mdash; the two equal sides make the base angles equal, both 40°, and"
  " 180 &minus; 40 &minus; 40 = 100.", "100|100°|y = 100|y=100")
pre(15, '2', '', "<p>A bag contains 10 discs.<br>Each disc is labelled with a different number from"
    " 1 to 10.<br>A disc is chosen from the bag at random.<br>Write down the probability that the"
    " chosen disc is</p>")
q(15, 3, '2', 'a', 'calculation', PROB, '', "<p>(a) a number less than four</p>",
  "<b>3/10</b> &mdash; 1, 2 and 3.", "3/10|0.3")
q(15, 4, '2', 'b', 'calculation', PROB + ',' + PRIME, '', "<p>(b) a prime number</p>",
  "<b>2/5</b> &mdash; 2, 3, 5 and 7 are prime, so 4/10 = 2/5.", "2/5|4/10|0.4")
q(15, 5, '3', '', 'short', MANIP, '',
  "<p>In one week, Aaliyah spent <i>x</i> minutes on the internet.<br>Sami spent 15 minutes less"
  " than Aaliyah.</p><p>Write down an expression for how long Sami spent on the internet.</p>",
  "<b>x &minus; 15</b> &mdash; 15 minutes fewer than x.", "x - 15|x-15|x − 15")
BEAR15 = ('The two points are a picture with no line drawn between them. They were located in'
          ' pixels on the rendered page (D is 234 units right of and 63 above C), giving 75° and'
          ' 255°; a measured bearing takes a tolerance, so it is left for a person to mark.')
pre(15, '4', 'diagram', "<p><b>Figure:</b> two points, C on the left and D higher up and well to the"
    " right, each with a North arrow pointing straight up.</p>")
q(15, 6, '4', 'a', 'short', BEAR, 'diagram', "<p>Find the bearing of D from C</p>",
  "<b>about 075°</b> &mdash; join C to D and measure clockwise from North at C.", '', BEAR15)
q(15, 7, '4', 'b', 'short', BEAR, 'diagram', "<p>Find the bearing of C from D</p>",
  "<b>about 255°</b> &mdash; the back bearing is the first one plus 180°.", '', BEAR15)

# ================================ 16 June =========================================================
ADDN  = 'Addition'
COORD = 'Coordinates'
assert F(28, 10) - F(15, 10) == F(13, 10) and F(13, 10) + F(12, 10) == F(25, 10)
assert F(28, 10) + F(25, 10) == F(53, 10)
q(16, 1, '1', '', 'short', CALCD + ',' + ADDN, 'boxes',
  "<p>The number in each block is found by adding the two blocks directly beneath it.</p><p><b>"
  "Figure:</b> a pyramid of blocks. The bottom row is 1.5, an empty block and 1.2; the middle row is"
  " 2.8 and an empty block; the top block is empty.</p><p>Find the missing numbers.</p>",
  "<b>Bottom middle 1.3, middle right 2.5, top 5.3</b> &mdash; 2.8 &minus; 1.5 = 1.3, then"
  " 1.3 + 1.2 = 2.5, then 2.8 + 2.5 = 5.3.")
_d16 = [4, 2, 5, 8, 6, 4, 2, 3, 5, 1]
assert F(sum(_d16), len(_d16)) == 4
q(16, 2, '2', '', 'calculation', MEAN, '', "<p>Find the mean of</p><p>4 &nbsp; 2 &nbsp; 5 &nbsp; 8"
  " &nbsp; 6 &nbsp; 4 &nbsp; 2 &nbsp; 3 &nbsp; 5 &nbsp; 1</p>",
  "<b>4</b> &mdash; the ten numbers add to 40, and 40 ÷ 10 = 4.", "4")
q(16, 3, '3', '', 'calculation', COORD, 'diagram',
  "<p>Here are two identical triangles.<br>Write down the coordinates of point B.</p><p><b>Figure:"
  "</b> x and y axes crossing at O. Below the x-axis is a right-angled triangle with corners at O,"
  " (0, &minus;6) and (11, &minus;6), the right angle at (0, &minus;6). Above the x-axis, to the left"
  " of the y-axis, is an identical right-angled triangle with a corner at (0, 9) on the y-axis: its"
  " long side runs level from (0, 9) to the point A on the left, and its short side runs straight up"
  " from A to the point B, with the right angle at A.</p>",
  "<b>(&minus;11, 15)</b> &mdash; the triangles are identical, so the level side is 11 long and the"
  " upright side 6 long: A is at (&minus;11, 9) and B is 6 above it.",
  "(-11, 15)|(-11,15)|(−11, 15)|-11, 15",
  'The two triangles are a picture. Which side is which was read off the rendered page: the level'
  ' side of each is the longer one.')
CONV16 = ('A reading off a printed conversion graph (a straight line from (0, 0) to 10 gallons ='
          ' 45 litres, read off the rendered page), so the answer is a small band rather than one'
          ' number.')
pre(16, '4', 'graph', "<p><b>Figure:</b> a conversion graph with gallons from 0 to 10 along the"
    " bottom and litres from 0 to 50 up the side. It is a straight line from (0, 0) to 10 gallons ="
    " 45 litres.</p>", CONV16)
assert 6 * F(45, 10) == 27 and 10 / F(45, 10) == F(20, 9)
q(16, 4, '4', 'a', 'calculation', RLG, 'graph', "<p>Use the graph to convert 6 gallons to"
  " litres.</p>", "<b>27 litres</b> &mdash; go up from 6 gallons to the line and across (1 gallon is"
  " 4.5 litres).", "26 to 28", CONV16)
q(16, 5, '4', 'b', 'calculation', RLG, 'graph', "<p>Use the graph to convert 10 litres to"
  " gallons.</p>", "<b>about 2.2 gallons</b> &mdash; go across from 10 litres to the line and down"
  " (10 ÷ 4.5 = 2.22…).", "2 to 2.4", CONV16)

# ================================ 17 June =========================================================
ORDF  = 'Ordering Fractions'
pre(17, '1', '', "<p>This table shows the distances, in miles, between some towns.</p>"
    + T(['Foxtown', '', '', ''], [['52', 'Sandcliff', '', ''], ['70', '32', 'Red Island', ''],
                                   ['31', '14', '28', 'Donhampton']])
    + "<p>(Read a number where a town's column meets another town's row: Foxtown to Sandcliff is"
    " 52 miles.)</p>")
q(17, 1, '1', 'a', 'calculation', 'Units & Measures', '', "<p>What is the distance between Foxtown"
  " and Red Island?</p>", "<b>70 miles</b> &mdash; down the Foxtown column to the Red Island row.",
  "70|70 miles")
q(17, 2, '1', 'b', 'short', 'Units & Measures', '', "<p>Write down the names of the two cities"
  " which are least distance apart?</p>",
  "<b>Sandcliff and Donhampton</b> &mdash; 14 miles is the smallest number in the table.")
assert F(1745, 100) * 15 == F(26175, 100)
q(17, 3, '2', '', 'calculation', CALCD, '',
  "<p>Chloe is building a fence for her garden.</p><p>The fence costs £17.45 per metre to build.<br>"
  "The fence is 15 metres long.</p><p>Work out the total cost of building the fence.</p>",
  "<b>£261.75</b> &mdash; 17.45 × 15 = 174.50 + 87.25.", "261.75|£261.75")
q(17, 4, '3', '', 'calculation', ENLG, 'grid',
  "<p><b>Figure:</b> on a square grid, rectangle A is 4 squares wide and 2 squares tall, and"
  " rectangle B is 8 squares wide and 4 squares tall.</p><p>Rectangle B is an enlargement of"
  " rectangle A.</p><p>What is the scale factor of the enlargement?</p>",
  "<b>2</b> &mdash; 8 ÷ 4 = 2 and 4 ÷ 2 = 2.", "2|scale factor 2",
  'The two rectangles were measured in squares off the rendered page.')
_o17 = sorted([(F(65, 100), '65%'), (F(7, 10), '7/10'), (F(68, 100), '0.68'), (F(2, 3), '2/3'),
               (F(3, 5), '3/5')])
assert [s for _, s in _o17] == ['3/5', '65%', '2/3', '0.68', '7/10']
q(17, 5, '4', '', 'short', ORDF + ',' + FDP, '',
  "<p>Write these numbers in order of size.<br>Start with the smallest number.</p><p>65% &nbsp;"
  " 7/10 &nbsp; 0.68 &nbsp; 2/3 &nbsp; 3/5</p>",
  "<b>3/5, 65%, 2/3, 0.68, 7/10</b> &mdash; as decimals they are 0.6, 0.65, 0.666…, 0.68 and 0.7.")

# ================================ 18 June =========================================================
BAR   = 'Bar Charts & Pictograms'
TIME  = 'Units & Measures'
q(18, 1, '1', '', 'calculation', AREA2, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle with an upright side of 12cm, a bottom side of 5cm and"
  " a sloping side of 13cm, the right angle between the 12cm and 5cm sides.</p><p>Calculate the"
  " area of the triangle</p>",
  "<b>30 cm²</b> &mdash; ½ × 5 × 12; the 13cm side is the slope and is not needed.",
  "30|30 cm²|30cm²")
assert 13 + 7 + 10 == 30
q(18, 2, '2', '', 'calculation', BAR, 'bar-chart',
  "<p><b>Figure:</b> a bar chart of a team's results, frequency up the side from 0 to 16. Win is"
  " 13, Draw is 7 and Loss is 10.</p><p>How many matches did the team play?</p>",
  "<b>30</b> &mdash; 13 + 7 + 10.", "30",
  'The bar heights were read off an enlarged render of the page against its gridlines.')
assert 5000 * F(103, 100) == 5150 and 600 * F(60, 100) == 360
q(18, 3, '3', 'a', 'calculation', PCTID, '', "<p>Increase $5000 by 3%</p>",
  "<b>$5150</b> &mdash; 3% of 5000 is 150.", "5150|$5150|5,150")
q(18, 4, '3', 'b', 'calculation', PCTID, '', "<p>Decrease 600cm by 40%</p>",
  "<b>360cm</b> &mdash; 40% of 600 is 240, and 600 &minus; 240 = 360.", "360|360cm|360 cm")
assert F(39, 10) * 62 == F(2418, 10) and F(39, 10) * 620 == 2418 and 39 * F(62, 100) == F(2418, 100)
pre(18, '4', '', "<p>Using the information that &nbsp; 3.9 x 62 = 241.8</p>")
q(18, 5, '4', 'a', 'calculation', MULT, '', "<p>write down the value of 3.9 x 620</p>",
  "<b>2418</b> &mdash; 620 is ten times 62, so the answer is ten times 241.8.", "2418|2,418")
q(18, 6, '4', 'b', 'calculation', MULT, '', "<p>Write down the value of 39 x 0.62</p>",
  "<b>24.18</b> &mdash; 39 is ten times 3.9 and 0.62 is a hundredth of 62, so 241.8 ÷ 10.",
  "24.18")
q(18, 7, '5', '', 'calculation', TIME, '',
  "<p>The flight from Perth to London is 16 hours and 35 minutes. The time is Perth is 7 hours ahead"
  " of London.</p><p>A flight leaves Perth at 8am on Wednesday.</p><p>What is the time in London"
  " when the flight arrives?</p>",
  "<b>5:35pm on Wednesday</b> &mdash; 8am in Perth is 1am in London, and 1am + 16 h 35 min is"
  " 17:35.", "5:35pm|5.35pm|17:35|5:35 pm|17.35|5:35pm Wednesday|17:35 Wednesday")

# ================================ 19 June =========================================================
SEQT  = 'Types of Sequence'
assert 360 - 115 - 65 - 85 == 95
q(19, 1, '1', '', 'calculation', ANGTQ, 'diagram',
  "<p><b>Figure:</b> a quadrilateral with angles of 115° and 85° on its left side, 65° at the top"
  " right and x at the bottom right.</p><p>Find x</p>",
  "<b>x = 95°</b> &mdash; the angles in a quadrilateral add to 360°, and 360 &minus; 115 &minus; 65"
  " &minus; 85 = 95.", "95|95°|x = 95|x=95")
assert F(679, 100) * 5 == F(3395, 100)
q(19, 2, '2', '', 'calculation', CALCD, '', "<p>A DVD costs £6.79 each.</p><p>Work out the cost of 5"
  " DVDs.</p>", "<b>£33.95</b> &mdash; 6.79 × 5, or 5 × £7 = £35 less 5 × 21p.", "33.95|£33.95")
assert [6 - 4 * x for x in (-1, 0, 1, 2, 3)] == [10, 6, 2, -2, -6]
pre(19, '3', '', "<p>y = 6 &minus; 4x</p>")
q(19, 3, '3', 'a', 'short', SUBST + ',' + SLG, 'table-blank',
  "<p>Complete the table of values for y = 6 &minus; 4x.</p>"
  + T(['x', '&minus;1', '0', '1', '2', '3'], [['y', '', '', '2', '', '&minus;6']]),
  "<b>10, 6, 2, &minus;2, &minus;6</b> &mdash; put each x into 6 &minus; 4x.")
q(19, 4, '3', 'b', 'drawing', SLG, 'grid-blank',
  "<p>On the grid, draw the graph of y = 6 &minus; 4x for values of x from &minus;1 to 3.</p><p>(The"
  " grid runs x from &minus;2 to 3 and y from &minus;10 to 12.)</p>",
  "<b>A straight line through (&minus;1, 10) and (3, &minus;6)</b> &mdash; plot the points from the"
  " table and join them with a ruler.", '', DRAW)
assert [n * n for n in (1, 2, 3)] == [1, 4, 9] and 10 * 10 == 100
q(19, 5, '4', '', 'calculation', SEQT, 'dots',
  "<p><b>Figure:</b> three dot patterns. Pattern 1 is a single dot. Pattern 2 is one dot above a row"
  " of 3 dots (4 dots). Pattern 3 is one dot, then a row of 3, then a row of 5 (9 dots).</p><p>How"
  " many dots are needed to make Pattern 10?</p>",
  "<b>100</b> &mdash; the patterns have 1, 4, 9 dots, the square numbers, so Pattern 10 has"
  " 10<sup>2</sup> (1 + 3 + 5 + … + 19).", "100",
  'The dots were counted off the rendered page.')

# ================================ 20 June =========================================================
DPROP = 'Direct Proportion'
import math as _m
assert 2 * 10 + 3 == 23 and 10 - 2 * 4 == 2 and round(12 * _m.pi, 1) == 37.7
q(20, 1, '1', 'a', 'calculation', SUBST, '', "<p>Find the value of 2x + 3</p><p>When x = 10</p>",
  "<b>23</b> &mdash; 2 × 10 + 3.", "23")
q(20, 2, '1', 'b', 'calculation', SUBST, '', "<p>Find the value of 10 &minus; 2x</p><p>When x ="
  " 4</p>", "<b>2</b> &mdash; 10 &minus; 2 × 4 = 10 &minus; 8.", "2")
q(20, 3, '2', 'a', 'calculation', SIMP, '', "<p>Simplify m + m + m + m + m</p>",
  "<b>5m</b> &mdash; five lots of m.", "5m")
q(20, 4, '2', 'b', 'calculation', SIMP, '', "<p>Simplify 6y + 10 + 2y &minus; 8</p>",
  "<b>8y + 2</b> &mdash; 6y + 2y = 8y and 10 &minus; 8 = 2.", "8y + 2|8y+2|2 + 8y|2+8y")
q(20, 5, '3', '', 'calculation', CIRC, 'circle',
  "<p><b>Figure:</b> a circle with a dotted diameter labelled 12m.</p><p>Find the circumference of"
  " the circle</p>",
  "<b>37.7 m (3 s.f.)</b> &mdash; &pi; × diameter = 12&pi; = 37.699…", "37.7|37.70|37.699|12π|12pi")
pre(20, '4', '', "<p>The exchange rate to change pounds into Indian rupees is £1 = 90 Rupees</p>")
q(20, 6, '4', 'a', 'short', DPROP, 'table-blank',
  "<p>Complete the table below.</p>"
  + T(['Pounds', '0', '1', '10', '50'], [['Rupees', '0', '90', '', '']]),
  "<b>900 and 4500</b> &mdash; 10 × 90 and 50 × 90.")
q(20, 7, '4', 'b', 'drawing', RLG, 'grid-blank',
  "<p>Draw a conversion graph for converting between pounds and rupees.</p><p>(The grid runs pounds"
  " from 0 to 90 and rupees from 0 to 7000.)</p>",
  "<b>A straight line through (0, 0), (10, 900) and (50, 4500)</b> &mdash; plot the table and join"
  " the points with a ruler; it reaches 7000 rupees at about £78.", '', DRAW)

# ================================ 21 June =========================================================
UNITS = 'Units & Measures'
PIE   = 'Pie Charts'
q(21, 1, '1', 'a', 'calculation', LINEQ, '', "<p>Solve 4w = 14</p>",
  "<b>w = 3.5</b> &mdash; divide both sides by 4.", "w = 3.5|w=3.5|3.5|7/2|3 1/2")
q(21, 2, '1', 'b', 'calculation', LINEQ, '', "<p>Solve w + 7 = 4</p>",
  "<b>w = &minus;3</b> &mdash; take 7 from both sides.", "w = -3|w=-3|-3|−3")
q(21, 3, '2', '', 'short', UNITS, '',
  "<p>200ml &nbsp;&nbsp; 60 litres &nbsp;&nbsp; 50ml &nbsp;&nbsp; 6 litres &nbsp;&nbsp; 600"
  " litres</p><p>Arrange in order from smallest to largest.</p>",
  "<b>50ml, 200ml, 6 litres, 60 litres, 600 litres</b> &mdash; 1 litre is 1000ml, so both ml amounts"
  " are less than a litre.")
assert F(16, 10) * F(21, 10) + F(1, 2) * F(16, 10) * F(8, 10) == 4
q(21, 4, '3', '', 'calculation', CSHAP, 'diagram',
  "<p><b>Figure (not drawn to scale):</b> a pentagon made of a rectangle 1.6m wide and 2.1m tall"
  " with a triangle on top; the triangle's perpendicular height is 0.8m.</p><p>Find the area</p>",
  "<b>4 m²</b> &mdash; the rectangle is 1.6 × 2.1 = 3.36 m² and the triangle ½ × 1.6 × 0.8 ="
  " 0.64 m².", "4|4 m²|4m²|4.00",
  'Where each measurement starts and stops was read off the rendered page: the 2.1m runs up the'
  ' upright side only, and the 0.8m is the height of the roof triangle.')
assert 360 - 90 - 120 == 150 and F(150, 360) * 48 == 20
pre(21, '4', 'pie-chart', "<p>The pie chart shows information about the counters in the bag.</p>"
    "<p><b>Figure:</b> a pie chart in three sectors. White has a right angle (90°), Red is 120°, and"
    " Black is the rest.</p>")
q(21, 5, '4', 'a', 'calculation', PIE, 'pie-chart', "<p>What fraction of the counters are white?"
  " Give your answer in its simplest form.</p>", "<b>1/4</b> &mdash; 90/360.")
q(21, 6, '4', 'b', 'calculation', PIE, 'pie-chart', "<p>What fraction of the counters are red? Give"
  " your answer in its simplest form.</p>", "<b>1/3</b> &mdash; 120/360.")
q(21, 7, '4', 'c', 'calculation', PIE, 'pie-chart', "<p>There are 48 counters in the bag.</p><p>Work"
  " out how many counters are black.</p>",
  "<b>20</b> &mdash; black is 360 &minus; 90 &minus; 120 = 150°, and 150/360 of 48 = 20.", "20")

# ================================ 22 June =========================================================
SCALE = 'Scale Drawings & Maps'
q(22, 1, '1', '', 'calculation', SCALE, '',
  "<p>A map has a scale of 1cm : 3 miles.<br>On the map, the distance between two towns is"
  " 7cm.</p><p>What is the actual distance between the two towns?</p>",
  "<b>21 miles</b> &mdash; 7 × 3.", "21|21 miles")
q(22, 2, '2', '', 'drawing', AREA2, 'triangle',
  "<p><b>Figure:</b> a right-angled triangle with an upright side of 3cm and a bottom side of"
  " 4cm.</p><p>Sketch a rectangle with the same area as this triangle.</p>",
  "<b>Any rectangle of area 6 cm², such as 2cm by 3cm</b> &mdash; the triangle is ½ × 4 × 3 ="
  " 6 cm².", '', 'Any rectangle whose sides multiply to 6 cm² is right, so it is left for a person'
  ' to mark.')
assert F(29 + 4, 2) == F(33, 2) and F(51, 10) - 3 == F(21, 10)
q(22, 3, '3', 'a', 'calculation', LINEQ, '', "<p>Solve 2y &minus; 4 = 29</p>",
  "<b>y = 16.5</b> &mdash; add 4 to get 2y = 33, then divide by 2.",
  "y = 16.5|y=16.5|16.5|33/2")
q(22, 4, '3', 'b', 'calculation', LINEQ, '', "<p>Solve 10(y + 3) = 51</p>",
  "<b>y = 2.1</b> &mdash; divide by 10 to get y + 3 = 5.1, then take 3.", "y = 2.1|y=2.1|2.1")
assert F(1, 2) * 280 == 140 and F(3, 8) * 400 == 150
q(22, 5, '4', '', 'short', FRAMT, '', "<p>Which is larger?</p><p>½ of 280 &nbsp; or &nbsp; 3/8 of"
  " 400</p>", "<b>3/8 of 400</b> &mdash; ½ of 280 is 140, and 3/8 of 400 is 150.",
  "3/8 of 400|3/8")
_d22 = [41, 27, 29, 35, 32, 38, 32]
assert sorted(_d22)[3] == 32
q(22, 6, '5', '', 'calculation', MEDN, '',
  "<p>Miss Jones gives her class a test.<br>The test is out of 50 marks.</p><p>Here are their"
  " scores.</p><p>41 &nbsp; 27 &nbsp; 29 &nbsp; 35 &nbsp; 32 &nbsp; 38 &nbsp; 32</p><p>Work out"
  " the median.</p>",
  "<b>32</b> &mdash; in order 27, 29, 32, 32, 35, 38, 41, the middle (4th) of the seven is 32.",
  "32")

# ================================ 23 June =========================================================
ANGPY = 'Angles in Polygons'
SOLID = '3-D Shapes'
q(23, 1, '1', 'a', 'calculation', LINEQ, '', "<p>Solve w &minus; 2 = 5</p>",
  "<b>w = 7</b> &mdash; add 2 to both sides.", "w = 7|w=7|7")
q(23, 2, '1', 'b', 'calculation', LINEQ, '', "<p>Solve w/5 = 2</p>",
  "<b>w = 10</b> &mdash; multiply both sides by 5.", "w = 10|w=10|10")
assert F((5 - 2) * 180, 5) == 108
q(23, 3, '2', '', 'calculation', ANGPY, 'diagram',
  "<p><b>Figure:</b> a regular pentagon.</p><p>Shown is a regular pentagon.</p><p>What is the size"
  " of each interior angle?</p>",
  "<b>108°</b> &mdash; the interior angles add to (5 &minus; 2) × 180 = 540°, and 540 ÷ 5 = 108.",
  "108|108°")
ELEV = ('The solid is a drawing of cubes whose hidden cubes cannot all be counted from one view, so'
        ' the elevations are left for a person to mark.')
pre(23, '3', 'diagram', "<p><b>Figure:</b> a solid made of centimetre cubes drawn in 3-D, with an"
    " arrow showing which side is the front. Beside each question is a blank square grid to draw"
    " on.</p>", ELEV)
q(23, 4, '3', 'a', 'drawing', SOLID, 'diagram', "<p>Draw the front elevation.</p>",
  "<b>The view from the front</b> &mdash; one square for every cube face seen looking at the"
  " front.", '', ELEV)
q(23, 5, '3', 'b', 'drawing', SOLID, 'diagram', "<p>Draw the side elevation.</p>",
  "<b>The view from the side</b> &mdash; one square for every cube face seen looking at the"
  " side.", '', ELEV)
q(23, 6, '3', 'c', 'drawing', SOLID, 'diagram', "<p>Draw the plan view.</p>",
  "<b>The view from above</b> &mdash; one square for every column of cubes seen from the top.",
  '', ELEV)
assert 450 * F(185, 1000) == F(8325, 100)
q(23, 7, '4', '', 'calculation', CALCD, '',
  "<p>Shown below is a 2 pence coin.</p><p>Each 2 pence coin is 0.185cm thick.<br>Kiren builds a"
  " tower of 450 2p coins.</p><p>How tall is the tower?</p>",
  "<b>83.25cm</b> &mdash; 450 × 0.185.", "83.25|83.25cm|83.25 cm|832.5mm")

# ================================ 24 June =========================================================
EST   = 'Estimation'
q(24, 1, '1', '', 'calculation', EST, '',
  "<p>Peter buys 297 packets of crisps at 21p each.</p><p>Estimate the total cost.</p>",
  "<b>about £60</b> &mdash; round to 300 × 20p = 6000p. (The exact cost is £62.37.)",
  "60|£60|6000p")
q(24, 2, '2', '', 'short', MANIP, '',
  "<p>Matas is 26 years old.<br>Hannah is <i>y</i> years younger than Matas.</p><p>Write an"
  " expression for Hannah's age.</p>", "<b>26 &minus; y</b> &mdash; y fewer years than 26.",
  "26 - y|26-y|26 − y")
_tt = [('04:21', '07:11'), ('05:19', '08:09'), ('06:39', '09:29'), ('07:59', '10:49'),
       ('14:40', '17:30'), ('15:28', '18:18'), ('17:00', '19:50'), ('18:49', '21:39')]
_mn = lambda t: int(t[:2]) * 60 + int(t[3:])
assert {_mn(b) - _mn(a) for a, b in _tt} == {170}
pre(24, '3', '', "<p>This timetable shows the times (GMT) of trains between Liverpool and"
    " London.</p>"
    + T(['Liverpool', '04 21', '05 19', '06 39', '07 59'],
        [['London', '07 11', '08 09', '09 29', '10 49']])
    + T(['London', '14 40', '15 28', '17 00', '18 49'],
        [['Liverpool', '17 30', '18 18', '19 50', '21 39']]))
q(24, 3, '3', 'a', 'calculation', TIME, '', "<p>How long does each journey take?</p>",
  "<b>2 hours 50 minutes</b> &mdash; every train, both ways: for example 04 21 to 07 11.",
  "2 hours 50 minutes|2h 50m|2 h 50 min|2:50|170 minutes|2 hours 50 mins")
assert _mn('09:29') + 7 * 60 == _mn('16:29')
q(24, 4, '3', 'b', 'calculation', TIME, '',
  "<p>Tom arrives in London at 09:29.<br>He spends the next 7 hours visiting tourist attractions in"
  " London.</p><p>What is the time of the next train he can catch back to Liverpool?</p>",
  "<b>17 00</b> &mdash; he is free at 16:29, so the 14 40 and 15 28 have gone and the next is"
  " 17 00.", "17:00|1700|17 00|5pm|5:00pm|5 pm")
assert len([(a, b) for a in 'RGP' for b in 'BYR']) == 9
q(24, 5, '4', '', 'short', LIST, 'diagram',
  "<p>Rob takes a counter at random from bag 1 and a counter at random from bag 2.</p><p><b>Figure:"
  "</b> Bag 1 holds a Red, a Green and a Pink counter; Bag 2 holds a Blue, a Yellow and a Red"
  " counter.</p><p>Write a list of all the possible combinations of the two counters that Rob can"
  " take.</p>",
  "<b>9 combinations</b> &mdash; Red–Blue, Red–Yellow, Red–Red, Green–Blue, Green–Yellow,"
  " Green–Red, Pink–Blue, Pink–Yellow, Pink–Red.")

# ================================ 25 June =========================================================
q(25, 1, '1', '', 'short', UNITS + ',' + EST, '',
  "<p>Shown below is a glass of water.</p><p>Below are four estimates of the amount of water that a"
  " glass holds. Circle the most appropriate estimate.</p><p>35ml &nbsp;&nbsp; 3.5L &nbsp;&nbsp;"
  " 350ml &nbsp;&nbsp; 35L</p>",
  "<b>350ml</b> &mdash; 35ml is a couple of spoonfuls and 3.5L is more than a big bottle of"
  " drink.", "350ml|350 ml")
pre(25, '2', '', "<p>The express bus from Dublin to Belfast takes <i>x</i> minutes.<br>The standard"
    " bus takes 42 minutes longer.</p>")
q(25, 2, '2', 'a', 'short', MANIP, '', "<p>Write down an expression for the time the standard bus"
  " takes.</p>", "<b>x + 42</b> &mdash; 42 minutes more than x.", "x + 42|x+42|42 + x|42+x")
q(25, 3, '2', 'b', 'short', MANIP, '', "<p>The airplane takes a third of the time the standard bus"
  " takes.</p><p>Write down an expression for the time the airplane takes.</p>",
  "<b>(x + 42)/3</b> &mdash; a third of the whole of x + 42, so it needs the bracket.",
  "(x + 42)/3|(x+42)/3|(x + 42) ÷ 3|(x+42)÷3|x/3 + 14|x/3+14")
_d25 = [3, 4, 5, 6, 2, 4, 3, 7, 3, 6]
assert F(sum(_d25), 10) == F(43, 10) and 4 < F(43, 10)
pre(25, '3', '', "<p>Niamh is recording the number of letters in each word in an article.</p><p>These"
    " are the first ten lengths.</p><p>3 &nbsp; 4 &nbsp; 5 &nbsp; 6 &nbsp; 2<br>4 &nbsp; 3 &nbsp;"
    " 7 &nbsp; 3 &nbsp; 6</p>")
q(25, 4, '3', 'a', 'calculation', MEAN, '', "<p>Work out the mean.</p>",
  "<b>4.3</b> &mdash; the ten lengths add to 43, and 43 ÷ 10 = 4.3.", "4.3")
q(25, 5, '3', 'b', 'short', MEAN, '', "<p>The 11th word has 4 letters.</p><p>Tick the box which"
  " describes what affect this will have on the mean.</p><p>The mean will decrease &#9633; &nbsp;"
  " The mean will remain the same &#9633; &nbsp; The mean will increase &#9633;</p>",
  "<b>The mean will decrease</b> &mdash; 4 is below the mean of 4.3, so it pulls it down (to"
  " 47 ÷ 11 = 4.27…).", "decrease|the mean will decrease")

# ================================ 26 June =========================================================
PARTS = 'Parts of a Circle'
q(26, 1, '1', 'a', 'calculation', LINEQ, '', "<p>Solve 8w = 48</p>",
  "<b>w = 6</b> &mdash; divide both sides by 8.", "w = 6|w=6|6")
q(26, 2, '1', 'b', 'calculation', LINEQ, '', "<p>Solve 5y + 3 = 68</p>",
  "<b>y = 13</b> &mdash; take 3 to get 5y = 65, then divide by 5.", "y = 13|y=13|13")
CIRCLE = ('A drawing on a printed circle, so it is left for a person to mark.')
q(26, 3, '2', 'a', 'drawing', PARTS, 'answer-space', "<p><b>Figure:</b> a circle.</p><p>Draw the"
  " radius</p>", "<b>A straight line from the centre to the edge</b> &mdash; half a diameter.", '',
  CIRCLE)
q(26, 4, '2', 'b', 'drawing', PARTS, 'answer-space', "<p><b>Figure:</b> a circle.</p><p>Draw the"
  " diameter</p>", "<b>A straight line from edge to edge through the centre</b>.", '', CIRCLE)
q(26, 5, '3', '', 'calculation', SCALE, 'map',
  "<p><b>Figure:</b> a map with two points, each with a North arrow: School at the bottom left and"
  " Shop higher up and to the right.</p><p>The scale of the map is 1cm = 100m.<br>Work out the real"
  " distance between the school and the shop.<br>Give your answer in metres.</p>",
  "<b>about 380m</b> &mdash; measure the straight line from School to Shop (about 3.8cm) and"
  " multiply by 100.", '',
  'The answer depends on measuring the printed map. On the PDF at actual size the two crosses are'
  ' 108.5pt (3.8cm) apart, which gives about 380m, but a printed copy may be scaled, so it is left'
  ' for a person to mark.')
assert F(40, 500) == F(2, 25)
q(26, 6, '4', '', 'calculation', FRAMT, '', "<p>Express 40p as a fraction of £5</p>",
  "<b>2/25</b> &mdash; £5 is 500p, and 40/500 = 2/25.", "2/25|40/500|4/50|0.08")
assert (900 // 60) * (300 // 60) * 3 == 225 and 900 % 60 == 0 and 300 % 60 == 0
q(26, 7, '5', '', 'calculation', AREA2, '',
  "<p>Rosie is tiling her bathroom wall.<br>The wall is 9m by 3m.<br>Each square tile is 60cm by"
  " 60cm.<br>Each tile cost £3.</p><p>Calculate the cost of tiling the wall.</p><p><b>Figure:</b>"
  " the wall, a rectangle 9m by 3m, beside a square tile 60cm by 60cm.</p>",
  "<b>£225</b> &mdash; 900 ÷ 60 = 15 tiles along and 300 ÷ 60 = 5 up, 75 tiles × £3.",
  "225|£225")

# ================================ 27 June =========================================================
CMEAS = 'Compound Measures'
DIVN  = 'Division'
assert F(2, 3) > F(17, 30) and F(2, 3) == F(20, 30)
q(27, 1, '1', '', 'short', ORDF, '', "<p>Which is larger?</p><p>2/3 &nbsp; or &nbsp; 17/30</p>",
  "<b>2/3</b> &mdash; 2/3 = 20/30, which is more than 17/30.", "2/3")
assert 47 * 23 == 1081 and 470 * 230 == 108100
q(27, 2, '2', '', 'calculation', MULT, '', "<p>Using the information that &nbsp; 47 x 23 = 1081</p>"
  "<p>write down the value of 470 x 230</p>",
  "<b>108100</b> &mdash; each number is ten times bigger, so the answer is 100 times 1081.",
  "108100|108,100")
GRAPH27 = ('The graph is a picture. Its corners were read off an enlarged render of the page against'
           ' its gridlines: 5 miles and 30 minutes per labelled division.')
pre(27, '3', 'graph', "<p>Tom travelled to a beach and back.</p><p><b>Figure:</b> a distance-time"
    " graph, distance from home (miles) from 0 to 50 up the side and time from 7am to 12noon along"
    " the bottom. The line leaves home at 7:30am, reaches 40 miles at 8:30am, stays level until"
    " 10am, falls to 30 miles at 11am, and is back home (0) at 12noon.</p>", GRAPH27)
q(27, 3, '3', 'a', 'calculation', RLG, 'graph', "<p>How long did Tom stay at the beach?</p>",
  "<b>1½ hours</b> &mdash; the line is level at 40 miles from 8:30am to 10am.",
  "1.5 hours|1 1/2 hours|90 minutes|1.5|1 hour 30 minutes|1h 30m|90 mins")
q(27, 4, '3', 'b', 'calculation', CMEAS + ',' + RLG, 'graph', "<p>Calculate Tom's speed between"
  " 10:00 and 11:00</p>",
  "<b>10 mph</b> &mdash; he travels from 40 to 30 miles, 10 miles in 1 hour.",
  "10 mph|10mph|10|10 miles per hour")
assert -(-560 // 9) == 63 and 62 * 9 < 560 <= 63 * 9
q(27, 5, '4', '', 'calculation', DIVN, '',
  "<p>Each member of a club is going to receive a badge.<br>There are 560 members.</p><p>The badges"
  " are sold in packs of 9.</p><p>Work out the least number of packs of badges that need to be"
  " bought.</p>",
  "<b>63</b> &mdash; 560 ÷ 9 = 62.2…, and 62 packs is only 558 badges, so a 63rd pack is needed.",
  "63")

# ================================ 28 June =========================================================
CONGR = 'Congruent Triangles'
VOLSA = 'Volume & Surface Area'
assert 2200 * F(8, 5) == 3520 and 3200 * F(9, 8) == 3600
q(28, 1, '1', '', 'explain', FRAMT, '',
  "<p>Last year Melissa was paid £2200 per month<br>Last year Natalie was paid £3200 per month</p>"
  "<p>Melissa's salary is increased by 3/5</p><p>Natalie's salary is increased by 1/8</p><p>Who is"
  " paid more each month this year?</p>",
  "<b>Natalie</b> &mdash; Melissa gets 2200 + 3/5 of 2200 = 2200 + 1320 = £3520; Natalie gets"
  " 3200 + 1/8 of 3200 = 3200 + 400 = £3600.")
assert F(3, 8) + F(2, 5) == F(31, 40) and F(7, 10) / F(5, 6) == F(21, 25)
q(28, 2, '2', 'a', 'calculation', ADDF, '', "<p>Work out 3/8 + 2/5</p>",
  "<b>31/40</b> &mdash; 15/40 + 16/40.", "31/40|0.775")
q(28, 3, '2', 'b', 'calculation', MULDF, '', "<p>Work out 7/10 ÷ 5/6</p>",
  "<b>21/25</b> &mdash; 7/10 × 6/5 = 42/50 = 21/25.", "21/25|42/50|0.84")
q(28, 4, '3', '', 'short', CONGR, 'grid',
  "<p><b>Figure:</b> nine shapes drawn on a square grid, labelled A to I. D is an L of four squares:"
  " a column three squares tall with one more square beside its top square. I is an L of four"
  " squares: a column two squares tall with two more squares to the right of its bottom square. A"
  " and G are L-shapes of five squares, B and H are straight bars, C, E and F are other"
  " shapes.</p><p>Find a shape that is congruent to D.</p>",
  "<b>I</b> &mdash; it is the same L of four squares (a long arm of 3 and a short arm of 2),"
  " turned round.", "I|shape I",
  'The shapes were counted in squares off an enlarged render of the page.')
assert 540 * F(4, 5) == 432
q(28, 5, '4', '', 'calculation', FRAMT, '',
  "<p>A jar of coffee used to contain 540g.</p><p>New packets contain one-fifth less.</p><p>Work out"
  " how much the new packet contains.</p>",
  "<b>432g</b> &mdash; a fifth of 540 is 108, and 540 &minus; 108 = 432.", "432|432g|432 g")
assert 2 * (7 * 11 + 7 * 11 + 11 * 11) == 550
q(28, 6, '5', '', 'calculation', VOLSA, 'diagram',
  "<p>Work out the surface area of this cuboid</p><p><b>Figure:</b> a cuboid 11cm long, 11cm deep"
  " and 7cm high.</p>",
  "<b>550 cm²</b> &mdash; two faces 11 × 11 = 121, and four faces 11 × 7 = 77: 2 × 121 + 4 × 77 ="
  " 242 + 308.", "550|550 cm²|550cm²")

# ================================ 29 June =========================================================
assert (F(4, 5), F(3, 4), F(2, 3), F(17, 20)) == (F(80, 100), F(75, 100), F(200, 300), F(85, 100))
q(29, 1, '1', '', 'short', FDP, '',
  "<p>Match each fraction to its percentage. One has been done for you: 2/3 is joined to"
  " 66⅔%.</p>" + T(['Fraction', 'Percentage'], [['4/5', '75%'], ['3/4', '66⅔%'], ['2/3', '80%'],
                                                  ['17/20', '85%']]),
  "<b>4/5 = 80%, 3/4 = 75%, 2/3 = 66⅔%, 17/20 = 85%</b> &mdash; write each fraction out of 100:"
  " 80/100, 75/100 and 85/100.")
q(29, 2, '2', '', 'calculation', EST, '', "<p>Estimate the value of &nbsp; 30.2 / 0.49</p>",
  "<b>about 60</b> &mdash; round to 30 ÷ 0.5 = 60. (The exact value is 61.6…)", "60")
assert F(6, 15) == F(2, 5)
q(29, 3, '3', '', 'calculation', PROB, '', "<p>Kezia has 9 blue socks and 6 red socks.</p><p>If she"
  " selects one sock at random, what is the probability she selects a red sock?</p>",
  "<b>2/5</b> &mdash; 6 of the 15 socks are red, and 6/15 = 2/5.", "2/5|6/15|0.4")
assert 2 + F(1, 2) * 30 == 17
q(29, 4, '4', '', 'calculation', SUBST, '',
  "<p>The cost of a taxi journey is worked out by the rule.</p><p>£2 plus 50p per mile</p><p>Work out"
  " the cost of a 30 mile journey.</p>",
  "<b>£17</b> &mdash; 30 × 50p = £15, plus £2.", "17|£17|17.00|£17.00")
assert 9 * 2 + (9 - 5) * 4 == 34
q(29, 5, '5', '', 'calculation', CSHAP, 'diagram',
  "<p>Find the area of the shape below</p><p><b>Figure:</b> an L-shape. The top edge is 9cm and the"
  " short right-hand edge is 2cm. From there an edge of 5cm runs back in underneath, and then an"
  " edge of 4cm runs down to the bottom.</p>",
  "<b>34 cm²</b> &mdash; the top strip is 9 × 2 = 18; the leg below is 9 &minus; 5 = 4 wide and"
  " 4 tall, 16; 18 + 16 = 34.", "34|34 cm²|34cm²",
  'Which edge each length belongs to was read off the rendered page.')

# ================================ 30 June =========================================================
assert 14 + 9 + 5 + 4 == 32 and 7 - 4 == 3
pre(30, '1', 'bar-chart', "<p>Shown are the shoe sizes for Year 7.</p><p><b>Figure:</b> a bar chart,"
    " frequency up the side from 0 to 15 and shoe size along the bottom. Size 4 has a frequency of"
    " 14, size 5 has 9, size 6 has 5 and size 7 has 4.</p>",
    'The bar heights were read off the rendered page against its gridlines.')
q(30, 1, '1', 'a', 'calculation', BAR, 'bar-chart', "<p>How many year 7s are there?</p>",
  "<b>32</b> &mdash; 14 + 9 + 5 + 4.", "32")
q(30, 2, '1', 'b', 'calculation', RANGE, 'bar-chart', "<p>What is the range of the shoe sizes?</p>",
  "<b>3</b> &mdash; the sizes run from 4 to 7, and 7 &minus; 4 = 3 (the range is of the sizes, not"
  " of the frequencies).", "3")
q(30, 3, '2', 'a', 'calculation', BIDMAS, '', "<p>Work out 15 + 3 x 2</p>",
  "<b>21</b> &mdash; multiply first: 3 × 2 = 6, then 15 + 6.", "21")
q(30, 4, '2', 'b', 'calculation', BIDMAS, '', "<p>Work out 20 ÷ 2 + 12 ÷ 4</p>",
  "<b>13</b> &mdash; divide first: 10 + 3.", "13")
q(30, 5, '3', '', 'calculation', EXPND, '', "<p>Expand 2w(3w &minus; 5)</p>",
  "<b>6w<sup>2</sup> &minus; 10w</b> &mdash; 2w × 3w = 6w<sup>2</sup> and 2w × 5 = 10w.",
  "6w^2 - 10w|6w^2-10w|6w² − 10w|6w²-10w")
_o30 = sorted([(F(3, 10), '3/10'), (F(29, 100), '29%'), (F(345, 1000), '34.5%'), (F(1, 3), '1/3'),
               (F(6, 25), '6/25')])
assert [s for _, s in _o30] == ['6/25', '29%', '3/10', '1/3', '34.5%']
q(30, 6, '4', '', 'short', ORDF + ',' + FDP, '',
  "<p>Arrange in order from smallest to largest</p><p>3/10 &nbsp; 29% &nbsp; 34.5% &nbsp; 1/3"
  " &nbsp; 6/25</p>",
  "<b>6/25, 29%, 3/10, 1/3, 34.5%</b> &mdash; as percentages they are 24%, 29%, 30%, 33⅓% and"
  " 34.5%.")
