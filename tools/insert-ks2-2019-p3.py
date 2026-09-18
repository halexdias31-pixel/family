"""KS2 SATs mathematics 2019, Paper 3: reasoning — 23 questions, 35 marks.

Read off the 2019 scheme, totals asserted, and the same rule about `figure` that Paper 2's script
records: a label that COUNTS is for a picture the row genuinely lacks, and a row whose content is
reproduced gets an ANSWER_SPACE label instead. Four questions here really need their picture -- a
pictogram whose symbols are the data, a coordinate grid with three points already on it, six
triangles arranged into a rectangle, and the labelled corners of ABDE. Everything else states its
own numbers.

THE ONE WORTH READING TWICE is question 21. The text layer gives `(25, 30) (40, 22) A B E D C`,
seven tokens with no geometry in them, and the mark scheme answers B = (55, 30) and D = (55, 14).
Those two facts together settle which point is which: if A is (25, 30) and C at (40, 22) is the
CENTRE, then the corner opposite A is (2x40-25, 2x22-30) = (55, 14), which is D, and B is the
corner at (55, 30). The script asserts that, so the reading is checked rather than assumed.
"""
import json
import pathlib
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
PAPER = 'P-STA-KS2-2019-P3'
SOURCE = 'https://drive.google.com/file/d/1ajMmEwAqqX6DNaqbBTJ4mzxaf7t0KuOu/view'

DOC = {
    'row_id': 'D-' + PAPER, 'paper_id': PAPER, 'kind': 'document', 'active': 'True',
    'name': 'Paper 3: Reasoning — May 2019', 'subject': 'Maths', 'key_stage': 'KS2',
    'band_type': 'stage', 'band_value': 'KS2 SATs', 'company': 'Standards & Testing Agency',
    'exam_board': 'STA', 'year': '2019', 'month': '5', 'document_type': 'Past paper',
    'total_marks': '35', 'source_url': SOURCE, 'needs': 'Ruler',
}


def frac(a, b):
    return '<sup>%d</sup>&frasl;<sub>%d</sub>' % (a, b)


Q = []


def q(n, marks, html, answer, accept, topics, figure=None, part=None):
    Q.append({'n': n, 'part': part, 'marks': marks, 'html': html, 'answer': answer,
              'accept': accept, 'topics': topics, 'figure': figure})


assert 8999 - 1100 == 7899
q(1, 1, '<p>The original price of a car is &pound;8,999. There is &pound;1,100 off in the sale. '
        'What is the sale price of the car?</p>',
  '<b>&pound;7,899</b> &mdash; 8,999 &minus; 1,100. Only the thousands and hundreds change.',
  '7899', 'Subtraction')
assert '%d' % 3576219 == '3576219' and '3576219'[2] == '7'
q(2, 1, '<p>Here is a number: 3,576,219</p><p>Which digit is in the ten thousands place?</p>',
  '<b>7</b> &mdash; count the columns from the right: 9 ones, 1 ten, 2 hundreds, 6 thousands, '
  '7 ten thousands. The scheme refuses 70,000: the question asks for the DIGIT, not its value.',
  '7', 'Place Value & Ordering', part='a')
assert round(3576219 / 1000000) == 4
q(2, 1, '<p>Round 3,576,219 to the nearest million.</p>',
  '<b>4,000,000</b> &mdash; the digit below the millions is 5, so it rounds up. Writing 4 on its '
  'own is refused: the answer is the whole rounded number.', '4000000',
  'Rounding', part='b')
assert 10 - 4 == 6
q(3, 1, '<p>Dev says, "I had &pound;10. I gave some money away." <i>a</i> is the amount of money, '
        'in pounds, that Dev gave away. Which expression shows how much money Dev has left? Tick '
        'one.</p><p>10 + <i>a</i> &nbsp; 10 &divide; <i>a</i> &nbsp; <i>a</i> &minus; 10 &nbsp; '
        '10 &minus; <i>a</i> &nbsp; <i>a</i> &times; 10</p>',
  '<b>10 &minus; <i>a</i></b> &mdash; he started with 10 and gave <i>a</i> away, so <i>a</i> comes '
  'off the 10. <i>a</i> &minus; 10 is the same two numbers the wrong way round and would be '
  'negative whenever he gave away less than he had.', '10 - a', 'Substitution', 'boxes')
masses = sorted([Fraction('1.25'), Fraction('0.99'), Fraction('1.025'), Fraction('0.009')])
assert masses == [Fraction('0.009'), Fraction('0.99'), Fraction('1.025'), Fraction('1.25')]
q(4, 1, '<p>Write these masses in order, starting with the lightest.</p><p>1.25 kg &nbsp; 0.99 kg '
        '&nbsp; 1.025 kg &nbsp; 0.009 kg</p>',
  '<b>0.009 kg, 0.99 kg, 1.025 kg, 1.25 kg</b> &mdash; pad them all to three decimal places first '
  '(0.009, 0.990, 1.025, 1.250) and they compare like whole numbers. 1.025 looks longer than 1.25 '
  'and is smaller, which is the whole question.', '0.009, 0.99, 1.025, 1.25', 'Ordering Decimals')
assert 128 + 72 == 200
q(5, 1, '<p>Write the missing digits to make this addition correct.</p>'
        '<p>&#9744;&thinsp;2&thinsp;&#9744; + &#9744;&thinsp;2 = 200</p>',
  '<b>128 + 72 = 200</b> &mdash; the units must make 10 (8 + 2), carrying one; the tens column is '
  'then 2 + 7 + 1 = 10, carrying one again; and that carried one is the hundreds digit of 200, so '
  'the hundreds digit of the first number is 1.', None, 'Addition', 'boxes')
assert Fraction(10) - Fraction('1.49') - Fraction('1.64') == Fraction('6.87')
q(6, 2, '<p>John buys one toy car at &pound;1.49 and one pack of stickers at &pound;1.64. He pays '
        'with a &pound;10 note. How much change does John get?</p><p>Show your method</p>',
  '<b>&pound;6.87</b> &mdash; 1.49 + 1.64 = &pound;3.13, and 10.00 &minus; 3.13 = &pound;6.87.',
  '6.87', 'Subtraction', 'long-method')
kit = [305, 275, 410, 360, 345, 375, 310, 255]
assert max(kit) - min(kit) == 155
q(7, 1, '<p>The masses of eight kittens are 305 g, 275 g, 410 g, 360 g, 345 g, 375 g, 310 g and '
        '255 g. What is the difference in mass between the heaviest kitten and the lightest '
        'kitten?</p>',
  '<b>155 g</b> &mdash; the heaviest is 410 g and the lightest 255 g, and 410 &minus; 255 = 155. '
  'Finding the two ends of a list of eight is the work; the subtraction is easy.', '155',
  'Subtraction', part='a')
bands = [sum(1 for k in kit if lo <= k <= hi) for lo, hi in
         [(250, 299), (300, 349), (350, 399), (400, 449)]]
assert bands == [2, 3, 2, 1] and sum(bands) == 8
q(7, 1, '<p>The masses of the kittens are to be put in four groups. Write the missing numbers in '
        'the table. One has been done for you.</p><table><tr><th>Mass in g</th><th>Number of '
        'kittens</th></tr><tr><td>250&ndash;299</td><td>&#9744;</td></tr><tr><td>300&ndash;349'
        '</td><td>&#9744;</td></tr><tr><td>350&ndash;399</td><td>&#9744;</td></tr>'
        '<tr><td>400&ndash;449</td><td>1</td></tr></table>',
  '<b>2, 3 and 2</b> &mdash; 255 and 275 are in the first group; 305, 310 and 345 in the second; '
  '360 and 375 in the third; and the 410 already written is the fourth. The check is that they add '
  'to 8, which is how many kittens there are.', None, 'Bar Charts & Pictograms', 'table-blank',
  part='b')
assert 6000 - 4289 - 355 == 1356
q(8, 2, '<p>Ken is playing a game. He has 4,289 points. Then he scores another 355 points. Ken\'s '
        'target is 6,000 points. How many more points does Ken need to reach his target?</p>'
        '<p>Show your method</p>',
  '<b>1,356</b> &mdash; 4,289 + 355 = 4,644, and 6,000 &minus; 4,644 = 1,356. Two steps, and '
  'stopping at 4,644 answers a question nobody asked.', '1356', 'Subtraction', 'long-method')
assert Fraction('2.25') * 1000 == 2250
q(9, 1, '<p>A pictogram shows the number of satellites above the Earth in 2016. One symbol '
        'represents 1,000 satellites. How many satellites were above the Earth in 2016?</p>',
  '<b>2,250</b> &mdash; the key says one symbol is 1,000, so a quarter of a symbol is 250. The '
  'scheme refuses 2,000 and refuses %s: the question asks how many satellites, not how many '
  'symbols. Reading how much of the last symbol is drawn needs the pictogram itself.' % frac(1, 4),
  '2250', 'Bar Charts & Pictograms', 'pictogram')
q(10, 1, '<p>On the grid there are three points joined by two lines. Lara plots another point on '
         'the grid at (&minus;1, 2). She joins the points to make a quadrilateral. Complete '
         'Lara\'s quadrilateral on the grid. Use a ruler.</p>',
  'Plot (&minus;1, 2) &mdash; one square left of the y-axis and two up &mdash; and rule a line '
  'from it to each of the two points that are not yet joined. The other three corners are printed '
  'on the paper, so the grid is what this question is.', None, 'Coordinates', 'grid',
  part='a')
q(10, 1, '<p>Then Lara translates the quadrilateral 4 squares to the right. Draw the quadrilateral '
         'in its new position on the grid.</p>',
  'Move every corner 4 squares right and leave the y-coordinates alone, then join them in the same '
  'order. A translation changes where a shape is and nothing else &mdash; same size, same way up. '
  'The scheme gives the mark for a correct translation even of a wrong quadrilateral, so part (b) '
  'is not lost with part (a).', None, 'Translations', 'grid', part='b')
assert [n for n in (2, 3, 4, 5, 6) if all(n % d for d in range(2, n))] == [2, 3, 5]
assert [n for n in (2, 3, 4, 5, 6) if 12 % n == 0] == [2, 3, 4, 6]
assert [n for n in (2, 3, 4, 5, 6) if 15 % n == 0] == [3, 5]
q(11, 2, '<p>Here are five numbers: 2, 3, 4, 5, 6. Write each number on the correct cards. The '
         'number 2 has been written on the correct cards for you.</p><p>Cards: Prime numbers '
         '&nbsp; Factors of 12 &nbsp; Factors of 15</p>',
  '<b>Prime numbers: 2, 3, 5. Factors of 12: 2, 3, 4, 6. Factors of 15: 3, 5.</b> &mdash; a number '
  'can go on more than one card and two of them go on two: 3 is prime and divides both 12 and 15. '
  '4 and 6 are not prime, and neither divides 15.', None, 'Factors & Multiples', 'boxes')
assert Fraction(190, 10) == 19 and Fraction(91, 10) == Fraction('9.1')
q(12, 1, '<p>Amina\'s bed is 190 cm in length and 91 cm in width. She is making a one-tenth scale '
         'model of the bed. What are the length and width of Amina\'s model?</p>',
  '<b>length = 19 cm, width = 9.1 cm</b> &mdash; one tenth of each, so the decimal point moves one '
  'place left. Both have to be right for the mark.', None, 'Ratio Problems')
assert 2 * 27 == 54 and 54 < 90
q(13, 1, '<p>Kirsty says, "When you double the size of an acute angle, you always get an obtuse '
         'angle." Explain why Kirsty is not correct.</p>',
  'Give a COUNTER-EXAMPLE: an acute angle of 27&deg; doubles to 54&deg;, which is still acute, not '
  'obtuse. Any acute angle under 45&deg; does it, and 45&deg; itself doubles to a right angle, '
  'which is not obtuse either. "Sometimes it will be acute" earns nothing &mdash; the scheme wants '
  'a number or the reason, not the observation.', None, 'Types of Angle')
assert 30 + 31 + 30 == 91
q(14, 1, '<p>How many days are there in September, October and November altogether?</p>',
  '<b>91 days</b> &mdash; September 30, October 31, November 30. Thirty days hath September, April, '
  'June and November; October is one of the long ones between them.', '91', 'Units & Measures')
assert Fraction(250, 5) * 8 == 400
q(15, 1, '<p>The International Space Station orbits the Earth at a height of 250 miles. What is '
         'the height of the International Space Station in kilometres? Use 8 kilometres equals 5 '
         'miles.</p>',
  '<b>400 km</b> &mdash; 250 &divide; 5 = 50 lots of five miles, and each is 8 km, so '
  '50 &times; 8 = 400. A kilometre is shorter than a mile, so the number has to get BIGGER, which '
  'is the check on which way round to divide.', '400', 'Units & Measures')
spuds = Fraction(3, 2) * Fraction('1.50')
carrots = Fraction(1, 2) * Fraction('1.80')
assert spuds == Fraction('2.25') and carrots == Fraction('0.90')
assert Fraction(5) - spuds - carrots == Fraction('1.85')
q(16, 2, '<p>Potatoes cost &pound;1.50 per kg and carrots cost &pound;1.80 per kg. Jack buys %s kg '
         'of potatoes and %s kg of carrots. How much change does he get from &pound;5?</p>'
         '<p>Show your method</p>' % ('1' + frac(1, 2), frac(1, 2)),
  '<b>&pound;1.85</b> &mdash; the potatoes are 1.50 + 0.75 = &pound;2.25, the carrots are half of '
  '1.80 = 90p, together &pound;3.15, and 5.00 &minus; 3.15 = &pound;1.85. Both prices are PER '
  'KILOGRAM and neither amount is a whole kilogram.', '1.85', 'Calculating with Decimals',
  'long-method')
pairs = [(x, y) for x in range(1, 10) for y in range(1, 10) if x + 2 * y == 20]
assert sorted(pairs) == [(2, 9), (4, 8), (6, 7), (8, 6)]
q(17, 1, '<p><i>x</i> + 2<i>y</i> = 20. <i>x</i> and <i>y</i> are whole numbers less than 10. What '
         'could <i>x</i> and <i>y</i> be?</p>',
  '<b><i>x</i> = 8 and <i>y</i> = 6</b> is one answer; the others are (6, 7), (4, 8) and (2, 9). '
  'Any of the four earns the mark. <i>x</i> has to be even, because 20 and 2<i>y</i> both are, '
  'which cuts the search in half straight away.', None, 'Linear Equations')
opts = [Fraction(1, 2), Fraction(2, 8), Fraction(3, 4), Fraction(7, 16), Fraction(24, 32)]
assert [o < Fraction(5, 8) for o in opts] == [True, True, False, True, False]
q(18, 2, '<p>Tick the fractions less than %s.</p><p>%s &nbsp; %s &nbsp; %s &nbsp; %s &nbsp; %s</p>'
         % (frac(5, 8), frac(1, 2), frac(2, 8), frac(3, 4), frac(7, 16), frac(24, 32)),
  '<b>%s, %s and %s</b> &mdash; %s is 0.625, so compare each against that: %s is 0.5, %s is 0.25 '
  'and %s is 0.4375, all smaller; %s and %s both cancel to %s, which is 0.75 and bigger. The two '
  'that are wrong are the two that look different and are the same.'
  % (frac(1, 2), frac(2, 8), frac(7, 16), frac(5, 8), frac(1, 2), frac(2, 8), frac(7, 16),
     frac(3, 4), frac(24, 32), frac(3, 4)),
  None, 'Ordering Fractions', 'boxes')
assert 53 * 68 == 3604 and 105 * 34 == 3570 and 3604 + 3570 == 7174
q(19, 3, '<p>Layla makes jewellery to sell at a school fair. Each bracelet has 53 beads and she '
         'makes 68 bracelets. Each necklace has 105 beads and she makes 34 necklaces. How many '
         'beads does Layla use altogether?</p><p>Show your method</p>',
  '<b>7,174 beads</b> &mdash; 53 &times; 68 = 3,604 and 105 &times; 34 = 3,570, and '
  '3,604 + 3,570 = 7,174. Three marks, and the scheme gives one for either long multiplication on '
  'its own, so writing both out is worth doing even if the addition goes wrong.', '7174',
  'Long Multiplication', 'long-method')
assert (2 * 500) // 34 == 29
q(20, 2, '<p>Adam is making booklets. Each booklet must have 34 sheets of paper. He has 2 packets '
         'of paper. There are 500 sheets of paper in each packet. How many <b>complete</b> '
         'booklets can Adam make from 2 packets of paper?</p><p>Show your method</p>',
  '<b>29 booklets</b> &mdash; 2 &times; 500 = 1,000 sheets, and 1,000 &divide; 34 = 29 remainder '
  '14. The word is COMPLETE, so the remainder is thrown away and 30 is wrong &mdash; there is not '
  'enough paper for a thirtieth. Dividing 500 first and doubling loses the remainder and can give '
  '28.', '29', 'Division', 'long-method')
A, C = (25, 30), (40, 22)
B = (2 * C[0] - A[0], A[1])
D = (2 * C[0] - A[0], 2 * C[1] - A[1])
assert B == (55, 30) and D == (55, 14)
q(21, 1, '<p>ABDE is a rectangle on coordinate axes. The sides of the rectangle are parallel to '
         'the axes. A is at (25, 30) and C, the centre of the rectangle, is at (40, 22). What are '
         'the coordinates of B?</p>',
  '<b>(55, 30)</b> &mdash; the centre is halfway along the rectangle, so it is 40 &minus; 25 = 15 '
  'to the right of A and the far side is another 15 beyond it, at 55. B is on the same top edge as '
  'A, so its y-coordinate is still 30.', '55, 30', 'Coordinates', 'grid', part='a')
q(21, 1, '<p>What are the coordinates of D?</p>',
  '<b>(55, 14)</b> &mdash; D is the corner diagonally opposite A, so the centre is halfway between '
  'them in BOTH directions: 22 is 8 below 30, so D is 8 below that again, at 14. The scheme gives '
  'the mark for the right y-coordinates even if the x is wrong in both, so the two parts do not '
  'both fall on one slip.', '55, 14', 'Coordinates', 'grid', part='b')
assert Fraction('10.5') == Fraction(3, 2) * 7
q(22, 1, '<p>Six identical right-angled triangles are arranged to make a rectangle. One side is '
         'marked 7 cm. Calculate the length of the rectangle.</p>',
  '<b>10.5 cm</b> &mdash; the value is the mark scheme\'s. Which side the 7 cm is and how the six '
  'triangles sit inside the rectangle are printed on the paper, and that arrangement is the '
  'question: the length works out at one and a half times the 7 cm.', '10.5',
  'Area of 2-D Shapes', 'shapes')
assert 800 == 640 + 160 and 640 == 4 * 160
q(23, 1, '<p>The distance from point P to point R is 800 metres. The distance from point P to '
         'point Q is 4 times the distance from point Q to point R. Olivia says, "It is 600 metres '
         'from point P to point Q." Explain why Olivia is not correct.</p>',
  'If PQ were 600 m then QR would be 800 &minus; 600 = 200 m, and 600 is only THREE times 200, not '
  'four. The real split is five equal parts: 800 &divide; 5 = 160 m for QR and 4 &times; 160 = '
  '<b>640 m</b> for PQ. Either sentence earns the mark; "Olivia is wrong" on its own does not.',
  None, 'Ratio Problems')

# ---- the totals -------------------------------------------------------------------------------
want = [(1, None), (2, 'a'), (2, 'b'), (3, None), (4, None), (5, None), (6, None), (7, 'a'),
        (7, 'b'), (8, None), (9, None), (10, 'a'), (10, 'b'), (11, None), (12, None), (13, None),
        (14, None), (15, None), (16, None), (17, None), (18, None), (19, None), (20, None),
        (21, 'a'), (21, 'b'), (22, None), (23, None)]
assert [(r['n'], r['part']) for r in Q] == want, 'a question is missing, repeated or out of order'
assert sum(r['marks'] for r in Q) == int(DOC['total_marks']), \
    'the paper is out of %s and these rows sum to %d' % (DOC['total_marks'],
                                                         sum(r['marks'] for r in Q))
for r in Q:
    assert ',' not in r['topics'], 'a comma in a topic name is a second topic: %r' % r['topics']
    assert '&' not in r['topics'].replace(' & ', ''), \
        'a topic carries an HTML entity: %r' % r['topics']

rows = [DOC]
for r in Q:
    rid = 'Q-STA-KS2-2019-P3-%d%s' % (r['n'], r['part'] or '')
    row = {'row_id': rid, 'paper_id': PAPER, 'question': str(r['n']), 'kind': 'question',
           'marks': str(r['marks'])}
    if r['part']:
        row['part'] = r['part']
    if r['figure']:
        row['figure'] = r['figure']
    row.update({
        'html': r['html'], 'answer_type': 'calculation', 'needs_print': 'False', 'active': 'True',
        'name': DOC['name'], 'subject': 'Maths', 'key_stage': 'KS2', 'band_type': 'stage',
        'band_value': 'KS2 SATs', 'company': 'Standards & Testing Agency', 'exam_board': 'STA',
        'year': '2019', 'topics': r['topics'], 'document_type': 'Past paper',
        'answer': r['answer'],
    })
    if r['accept']:
        row['accept'] = r['accept']
    rows.append(row)

lines = FILE.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
seen = {json.loads(l.rstrip(','))['row_id'] for l in lines if '"row_id"' in l}
clash = seen & {r['row_id'] for r in rows}
assert not clash, 'row ids already in the file: %r' % sorted(clash)
lines[-2] += ','
for r in rows[:-1]:
    lines.insert(-1, json.dumps(r) + ',')
lines.insert(-1, json.dumps(rows[-1]))
FILE.write_text('\n'.join(lines) + '\n')

ANSWER_SPACE = ('grid-blank', 'fractions', 'boxes', 'long-method', 'lines', 'working',
                'answer-space', 'table-blank')
missing = [r for r in Q if r['figure'] and r['figure'] not in ANSWER_SPACE]
print('%s: %d questions, %d marks, %d rows. %d lack the picture they are about (%s)'
      % (PAPER, len(Q), sum(r['marks'] for r in Q), len(rows), len(missing),
         ', '.join('Q%d%s' % (r['n'], r['part'] or '') for r in missing)))
