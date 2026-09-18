"""KS2 SATs mathematics 2019, Paper 2: reasoning — 23 questions, 35 marks.

READ OFF THE SCHEME, not derived, for the reason Paper 1's script gives. The cover says 35 and the
rows sum to 35 with six two-mark questions; both are asserted before anything is written.

WHAT A REASONING PAPER CHANGES is the balance between answering and counting, and the first pass
of this script got that balance wrong. It marked seventeen rows as needing a picture, which put
twelve questions into the library's missing-picture backlog whose CONTENT is right here in the
row -- the multiplication grid is reproduced as a table, the five temperatures are in the prose,
the cuboid's three dimensions are stated. A backlog that counts questions nobody has to fix is the
mirror of a silence: both make the number mean nothing.

FIVE questions genuinely lack their picture -- the shape and mirror line to reflect, the measuring
container, the shopping scales, the hexagon beside the square, the card marked with grid lines --
and only those carry a `figure` that counts. Everything else carries an ANSWER_SPACE label, which
is what `figure` means when the paper printed somewhere to WRITE rather than something to read.
Where the scheme states the value the picture would have given (2.5 litres in the container) it is
in the answer with a note saying where it came from.

The fractions are artwork again. `12 7 10 0.07 23 1000 0.23` is 7/10 against 0.07 and 23/1000
against 0.23; question 20's five options came through as ten loose digits. Both recovered by
rendering the page.
"""
import json
import pathlib
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
PAPER = 'P-STA-KS2-2019-P2'
SOURCE = 'https://drive.google.com/file/d/1AEXz4DSRZEktr7BL5aGSOD5UY3igNbR3/view'

DOC = {
    'row_id': 'D-' + PAPER, 'paper_id': PAPER, 'kind': 'document', 'active': 'True',
    'name': 'Paper 2: Reasoning — May 2019', 'subject': 'Maths', 'key_stage': 'KS2',
    'band_type': 'stage', 'band_value': 'KS2 SATs', 'company': 'Standards & Testing Agency',
    'exam_board': 'STA', 'year': '2019', 'month': '5', 'document_type': 'Past paper',
    'total_marks': '35', 'source_url': SOURCE,
    'needs': 'Ruler, Protractor',
}


def frac(a, b):
    return '<sup>%d</sup>&frasl;<sub>%d</sub>' % (a, b)


Q = []


def q(n, marks, html, answer, accept, topics, figure=None, part=None):
    Q.append({'n': n, 'part': part, 'marks': marks, 'html': html, 'answer': answer,
              'accept': accept, 'topics': topics, 'figure': figure})


assert 4 * 8 == 32 and 3 * 7 == 21 and 4 * 3 == 12 and 8 * 7 == 56
q(1, 1, '<p>In this grid, there are four multiplications. Write the <b>three</b> missing '
        'numbers.</p><table><tr><td>4</td><td>&times;</td><td>8</td><td>=</td><td>&#9744;</td>'
        '</tr><tr><td>&times;</td><td></td><td>&times;</td><td></td><td></td></tr>'
        '<tr><td>3</td><td>&times;</td><td>&#9744;</td><td>=</td><td>21</td></tr>'
        '<tr><td>=</td><td></td><td>=</td><td></td><td></td></tr>'
        '<tr><td>&#9744;</td><td></td><td>56</td><td></td><td></td></tr></table>',
  '<b>32</b>, <b>7</b> and <b>12</b> &mdash; 4 &times; 8 = 32 across the top, 21 &divide; 3 = 7 in '
  'the middle, and 4 &times; 3 = 12 down the left. The 56 is the check: 8 &times; 7 = 56.',
  None, 'Multiplication', 'boxes')
assert 9072 - 1000 == 8072
q(2, 1, '<p>What number is 1,000 <b>less</b> than 9,072?</p>', '<b>8,072</b> &mdash; only the '
        'thousands digit changes: 9 thousands become 8.', '8072', 'Place Value & Ordering')
order = sorted([1009909, 1023065, 1009099, 1230650], reverse=True)
assert order == [1230650, 1023065, 1009909, 1009099]
q(3, 1, '<p>Order the numbers starting with the largest. Match each number with its order.</p>'
        '<p>1,009,909 &nbsp; 1,023,065 &nbsp; 1,009,099 &nbsp; 1,230,650</p>'
        '<p>1st largest &nbsp; 2nd &nbsp; 3rd &nbsp; 4th smallest</p>',
  '<b>1,230,650</b> is 1st, <b>1,023,065</b> 2nd, <b>1,009,909</b> 3rd and <b>1,009,099</b> '
  'smallest &mdash; all four have seven digits and all four start 1,0 or 1,2, so the sort is '
  'decided at the third digit and then, for the two that start 1,009, at the sixth.',
  None, 'Place Value & Ordering', 'lines')
q(4, 1, '<p>Here is a shaded shape on a square grid. Reflect the shape in the mirror line. Use a '
        'ruler.</p>',
  'Each corner of the shape is redrawn the same number of squares on the far side of the mirror '
  'line, measured square by square along the line &mdash; the reflection is the same distance out '
  'as the original, not the same direction.', None, 'Reflections', 'grid')
seq = [110, 155, 200, 245, 290, 335]
assert all(seq[i + 1] - seq[i] == 45 for i in range(len(seq) - 1))
q(5, 2, '<p>The numbers in this sequence increase by 45 each time. Write the missing numbers.</p>'
        '<p>&#9744; &nbsp; 155 &nbsp; 200 &nbsp; 245 &nbsp; &#9744; &nbsp; &#9744;</p>',
  '<b>110</b>, <b>290</b> and <b>335</b> &mdash; 155 &minus; 45 = 110 going backwards, then '
  '245 + 45 = 290 and 290 + 45 = 335.', None, 'Term-to-Term Rules')
assert Fraction('0.3') / 10 == Fraction('0.03')
q(6, 1, '<p>Write the missing number to make this division correct.</p><p>0.3 &divide; &#9744; = '
        '0.03</p>', '<b>10</b> &mdash; the digits stay and the decimal point moves one place, '
                    'which is a division by ten.', '10', 'Calculating with Decimals')
q(7, 1, '<p>Jack pours some dark paint into a container. In litres, how much paint is in the '
        'container?</p>',
  '<b>2.5 litres</b> &mdash; the scale is marked 3, 4 and 5 with five small divisions to each '
  'litre, so one small division is 0.2, and the paint reaches halfway between 2 and 3. The value '
  'is the mark scheme\'s; reading it needs the container, which is printed on the paper.',
  '2.5', 'Units & Measures', 'measure')
assert 11 * 2 + 3 == 25 and 25 * 2 + 3 == 53
q(8, 1, '<p>In this sequence, the rule to get the next number is <b>multiply by 2, and then add '
        '3</b>. Write the missing number.</p><p>&#9744; &nbsp; 25 &nbsp; 53</p>',
  '<b>11</b> &mdash; run the rule backwards: take 3 off 25 to get 22, then halve it. Doing it '
  'forwards checks: 11 &times; 2 + 3 = 25.', '11', 'Term-to-Term Rules', part='a')
assert 53 * 2 + 3 == 109
q(8, 1, '<p>Write the missing number at the end of the sequence.</p><p>25 &nbsp; 53 &nbsp; '
        '&#9744;</p>', '<b>109</b> &mdash; 53 &times; 2 + 3.', '109', 'Term-to-Term Rules',
  part='b')
assert (953 - 85) // 7 == 124 and (953 - 85) % 7 == 0
q(9, 2, '<p>Jack chose a number. He multiplied the number by 7. Then he added 85. His answer was '
        '953. What number did Jack choose?</p><p>Show your method</p>',
  '<b>124</b> &mdash; undo the steps in reverse order: 953 &minus; 85 = 868, then '
  '868 &divide; 7 = 124. Dividing first would answer a different question.', '124',
  'Linear Equations', 'long-method')
assert 24 * 5 + 3 == 123
q(10, 1, '<p>A theme park sells tickets online. Each ticket costs &pound;24. There is a &pound;3 '
         'charge for buying tickets. Which of these shows how to calculate the total cost, in '
         'pounds? Tick one.</p><p>number of tickets &times; 3 + 24<br>number of tickets &times; 24 '
         '+ 3<br>number of tickets + 3 &times; 24<br>number of tickets + 24 &times; 3</p>',
  '<b>number of tickets &times; 24 + 3</b> &mdash; every ticket costs &pound;24, so that is the '
  'multiplication, and the &pound;3 is charged once whatever the order, so it is added at the end. '
  'Five tickets would be 5 &times; 24 + 3 = &pound;123.',
  'number of tickets x 24 + 3', 'Substitution', 'boxes')
assert Fraction(1, 4) == Fraction('0.25')
q(11, 1, '<p>Amina says, "I would like to buy one-quarter of a kilogram of cheese." Write '
         'one-quarter on the scales as a decimal.</p>',
  '<b>0.25 kg</b> &mdash; a quarter of 1 is 0.25. The scheme refuses %s here: the question asks '
  'for a decimal.' % frac(1, 4), '0.25', 'Fraction Decimal Percentage Conversion', 'measure',
  part='a')
assert Fraction(2) - Fraction('1.35') == Fraction('0.65')
q(11, 1, '<p>The cheese costs &pound;1.35. Amina pays with a &pound;2 coin. How much change should '
         'Amina get?</p>', '<b>65p</b>, or &pound;0.65 &mdash; 2.00 &minus; 1.35.', '65 | 0.65',
  'Subtraction', part='b')
assert Fraction(7, 10) > Fraction('0.07') and Fraction(23, 1000) < Fraction('0.23')
q(12, 1, '<p>Here are three symbols: &lt; &nbsp; &gt; &nbsp; =</p><p>Write one symbol in each box '
         'to make the statements correct.</p><p>%s &nbsp;&#9744;&nbsp; 0.07</p><p>%s '
         '&nbsp;&#9744;&nbsp; 0.23</p>' % (frac(7, 10), frac(23, 1000)),
  '<b>%s &gt; 0.07</b> and <b>%s &lt; 0.23</b> &mdash; turn each fraction into a decimal first: '
  '7 tenths is 0.7, which beats 0.07, and 23 thousandths is 0.023, which does not reach 0.23. Both '
  'pairs use the same digits, which is the whole trap.' % (frac(7, 10), frac(23, 1000)),
  None, 'Fraction Decimal Percentage Conversion', 'boxes')
assert 180 - 35 - 90 == 55
q(13, 2, '<p>Here is a sketch of a triangle, not drawn to scale: one angle of 35&deg;, one right '
         'angle, and the side between them 8 cm. Draw the full-size triangle accurately below. Use '
         'an angle measurer (protractor) and a ruler. One line has been drawn for you.</p>',
  'Measure <b>35&deg;</b> at one end of the 8 cm line and <b>90&deg;</b> at the other, and extend '
  'both until they meet. The scheme allows 33&deg; to 37&deg;, 88&deg; to 92&deg; and a line of '
  '7.9 cm to 8.1 cm &mdash; and the third angle comes out at 180 &minus; 35 &minus; 90 = 55&deg;, '
  'which is worth checking once the triangle is drawn.', None, 'Types of Angle', 'lines')
q(14, 2, '<p>Complete the table. Round 39,476:</p><table><tr><td>to the nearest 10,000</td>'
         '<td>&#9744;</td></tr><tr><td>to the nearest 1,000</td><td>&#9744;</td></tr>'
         '<tr><td>to the nearest 100</td><td>&#9744;</td></tr></table>',
  '<b>40,000</b>, <b>39,000</b> and <b>39,500</b> &mdash; look each time at the digit to the RIGHT '
  'of the column you are rounding to: 9 for the ten-thousands, 4 for the thousands, 7 for the '
  'hundreds. The scheme refuses 9,000 and 500: the whole number is the answer, not the part that '
  'changed.', None, 'Rounding', 'table-blank')
assert Fraction(15, 60) == Fraction(25, 100)
q(15, 1, '<p>Amina asked 60 children to choose their favourite flavour of jelly. Raspberry 12, '
         'Lemon 8, Orange 15, Blackcurrant 25, total 60. What percentage of the 60 children chose '
         'orange?</p>', '<b>25%</b> &mdash; 15 out of 60 is a quarter, and a quarter is 25%. The '
                        'other three flavours are there to be ignored.', '25',
  'Fraction Decimal Percentage Conversion')
assert 6 + 2 * 2 - 4 == 6
q(16, 1, '<p>Write the missing number.</p><p>6 + 2 &times; 2 &minus; &#9744; = 6</p>',
  '<b>4</b> &mdash; the multiplication goes first, so it is 6 + 4 &minus; &#9744; = 6, which makes '
  'the box 4. Working left to right instead gives 8 &times; 2 and the wrong answer.', '4',
  'Order of Operations')
per = 6 * 8
assert per == 48 and per // 4 == 12 and 12 ** 2 == 144
q(17, 2, '<p>A regular hexagon and a square have the same perimeter. The length of each side of '
         'the hexagon is 8 centimetres. Calculate the area of the square.</p><p>Show your '
         'method</p>',
  '<b>144 cm&sup2;</b> &mdash; the hexagon has six sides of 8 cm, so its perimeter is 48 cm; the '
  'square has the same perimeter, so each side is 48 &divide; 4 = 12 cm; and 12 &times; 12 = 144. '
  'Three steps, and the side of the square is the one worth writing down.', '144',
  'Area of 2-D Shapes', 'shapes')
assert 87 % 3 == 0 and 95 % 5 == 0 and all(89 % d for d in range(2, 10))
q(18, 1, '<p>Circle the prime number: 95 &nbsp; 89 &nbsp; 87</p><p>Explain how you know the other '
         'numbers are not prime.</p>',
  '<b>89</b> &mdash; and the explanation has to cover BOTH of the others, which is where the mark '
  'is: 87 = 3 &times; 29, so it divides by 3 (its digits add to 15, which is in the three times '
  'table), and 95 = 5 &times; 19, so it divides by 5 (every multiple of 5 ends in 5 or 0). '
  'Circling 89 on its own earns nothing.', '89', 'Primes & Prime Factorisation')
assert Fraction(60, 4) * 250 == 3750 and Fraction(3750, 1000) == Fraction('3.75')
q(19, 2, '<p>A machine pours 250 millilitres of juice every 4 seconds. How many litres of juice '
         'does the machine pour every minute?</p><p>Show your method</p>',
  '<b>3.75 litres</b> &mdash; a minute is 60 seconds, which is 60 &divide; 4 = 15 lots of four '
  'seconds, so 15 &times; 250 = 3,750 ml, and 3,750 &divide; 1000 = 3.75 litres. The conversion at '
  'the end is the half people drop: the question asks for litres and every number in it is in '
  'millilitres and seconds.', '3.75', 'Units & Measures', 'long-method')
fifths = [Fraction(1, 20), Fraction(20, 40), Fraction(1, 5), Fraction(3, 15), Fraction(2, 100)]
assert [f == Fraction(20, 100) for f in fifths] == [False, False, True, True, False]
q(20, 2, '<p>Tick the fractions that are <b>equal</b> to 20%%.</p><p>%s &nbsp; %s &nbsp; %s &nbsp; '
         '%s &nbsp; %s</p>' % (frac(1, 20), frac(20, 40), frac(1, 5), frac(3, 15), frac(2, 100)),
  '<b>%s and %s</b> &mdash; 20%% is one fifth, so the test is whether the fraction cancels to a '
  'fifth. %s is 15%%&hellip; no: it is 5%%. %s is a half, and %s is 2%%. The two with 20 in them '
  'are the two that are wrong, which is the point of the question.'
  % (frac(1, 5), frac(3, 15), frac(1, 20), frac(20, 40), frac(2, 100)),
  None, 'Fraction Decimal Percentage Conversion', 'boxes')
q(21, 1, '<p>Adam has a rectangular piece of card marked with grid lines. He makes two straight '
         'cuts along the grid lines. The two cuts divide the rectangle into 3 shapes: 2 squares of '
         'different size, and 1 rectangle. Using the grid lines, draw two lines that show where '
         'Adam could have made his cuts. Use a ruler.</p>',
  'Cut the largest square off one end first, then cut a smaller square off what is left &mdash; '
  'the piece that remains is the rectangle. The scheme prints four different correct answers, so '
  'the two squares can be either way round and at either end.', None, 'Area of 2-D Shapes', 'grid')
temps = [Fraction('8.1'), Fraction('9.3'), Fraction('11.9'), Fraction('11.8'), Fraction('12.4')]
assert sum(1 for t in temps if t < 10) == 2 and Fraction(2, 5) == Fraction('0.4')
q(22, 1, '<p>A graph shows the maximum temperature for five days: Monday 8.1&deg;C, Tuesday '
         '9.3&deg;C, Wednesday 11.9&deg;C, Thursday 11.8&deg;C, Friday 12.4&deg;C. For what '
         'fraction of the five days was the maximum temperature below 10&nbsp;&deg;C?</p>',
  '<b>%s</b> &mdash; Monday at 8.1 and Tuesday at 9.3 are the two below 10, out of five days. '
  'Thursday at 11.8 is lower than Wednesday and still well above 10.' % frac(2, 5), '2/5',
  'Fractions of an Amount', part='a')
assert sum(temps) == Fraction('53.5') and sum(temps) / 5 == Fraction('10.7')
q(22, 2, '<p>What was the mean maximum temperature, to one decimal place?</p><p>Show your '
         'method</p>',
  '<b>10.7 &deg;C</b> &mdash; 8.1 + 9.3 + 11.9 + 11.8 + 12.4 = 53.5, and 53.5 &divide; 5 = 10.7. '
  'It lands on one decimal place exactly, so nothing has to be rounded.', '10.7', 'Mean',
  'long-method', part='b')
assert 3 * 4 * 6 == 72 and 8 * 9 * 11 == 792 and 792 - 72 == 720
q(23, 2, '<p>Amina made a cuboid using centimetre cubes, 6 cm by 3 cm by 4 cm. Stefan makes a '
         'cuboid that is 5 cm longer, 5 cm taller and 5 cm wider than Amina\'s cuboid. What is the '
         'difference between the number of cubes in Amina\'s and Stefan\'s cuboids?</p>'
         '<p>Show your method</p>',
  '<b>720 cubes</b> &mdash; Amina\'s is 3 &times; 4 &times; 6 = 72, Stefan\'s is 8 &times; 9 '
  '&times; 11 = 792, and 792 &minus; 72 = 720. Every one of the three sides grows by 5, so all '
  'three have to be changed before multiplying &mdash; adding 5 to the answer, or to one side, is '
  'the mistake this is built on.', '720', '3-D Shapes', 'long-method')

# ---- the totals -------------------------------------------------------------------------------
want = [(1, None), (2, None), (3, None), (4, None), (5, None), (6, None), (7, None), (8, 'a'),
        (8, 'b'), (9, None), (10, None), (11, 'a'), (11, 'b'), (12, None), (13, None), (14, None),
        (15, None), (16, None), (17, None), (18, None), (19, None), (20, None), (21, None),
        (22, 'a'), (22, 'b'), (23, None)]
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
    rid = 'Q-STA-KS2-2019-P2-%d%s' % (r['n'], r['part'] or '')
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
# THE NUMBER PRINTED IS THE ONE check-library.js WILL COUNT, not "rows with a figure". Those are
# different questions and the first version of this script printed the second while meaning the
# first -- 17 against the 5 that are really missing a picture. A count that does not measure what
# its sentence claims is the fault this repository records as "all 18 checks pass".
ANSWER_SPACE = ('grid-blank', 'fractions', 'boxes', 'long-method', 'lines', 'working',
                'answer-space', 'table-blank')
missing = [r for r in Q if r['figure'] and r['figure'] not in ANSWER_SPACE]
print('%s: %d questions, %d marks, %d rows. %d lack the picture they are about (%s)'
      % (PAPER, len(Q), sum(r['marks'] for r in Q), len(rows), len(missing),
         ', '.join('Q%d%s' % (r['n'], r['part'] or '') for r in missing)))
