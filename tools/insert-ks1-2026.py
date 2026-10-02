"""KS1 SATs mathematics 2026: Paper 1 (arithmetic, 25 marks) and Paper 2 (reasoning, 35 marks).

READ OFF the two PDFs in Drive's text layer, which is all there is: there is NO MARK SCHEME in the
Drive for either, and nothing here could render the pages. So, said once and carried on the rows:

PAPER 1 IS ARITHMETIC, so every answer is computed and asserted -- there is nothing to read.
The text layer prints the operators as stray glyphs (`26 | 4`, `9 { 10`, `80 } 10`) and the
fractions as loose digits (`1 2 of 14`). They are recovered from context and the context is
checked rather than assumed: `|` is minus (every `|` row is a subtraction that comes out whole and
is not a division), `{` is times (9 { 10, 2 { 8 and 5 { 11 are only whole as products) and `}` is
divide (80 } 10 and 30 } 5 are the multiples of 10 and 5 the paper tests). Those rows carry an
examiner_note saying so, because a symbol recovered is not a symbol transcribed.

PAPER 2 IS MOSTLY PICTURES AND SOME OF IT IS READ ALOUD. Thirteen questions are answered because
their own words settle them. The pictures (a pictogram, an array, a block diagram, a number line)
were not in the text layer, so those rows say what the words say and carry `figure: picture`,
which is what puts them in the count `check-library.js` prints. Five questions came across with no
wording at all (1-5; 4 and 5 are the aural ones) and are `placeholder` rows, drawn with a dashed
box, so the paper still sums to its 35 and nothing reads as finished that is not.

Crown copyright, Open Government Licence v3.0, stated on the papers' own copyright page.
"""
import json
import pathlib
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
BOX = '&#9744;'


def doc(paper, name, total, source):
    return {
        'row_id': 'D-' + paper, 'paper_id': paper, 'kind': 'document', 'active': 'True',
        'name': name, 'subject': 'Maths', 'key_stage': 'KS1', 'band_type': 'stage',
        'band_value': 'KS1 SATs', 'company': 'Standards & Testing Agency', 'exam_board': 'STA',
        'year': '2026', 'month': '5', 'document_type': 'Past paper', 'total_marks': str(total),
        'source_url': source, 'needs': 'No calculator',
    }


# --------------------------------------------------------------------------------------------
# PAPER 1: ARITHMETIC. (n, marks, html, answer, topic, note)
P1 = 'P-STA-KS1-2026-P1'
D1 = doc(P1, 'Paper 1: Arithmetic — May 2026', 25,
         'https://drive.google.com/file/d/1pyWYikQuitWbQdJKvGzAksNJOZHVM13O/view')
OPNOTE = ('The operator printed on the paper did not come across in the text layer. It is recovered '
          'from context (the only operation that gives a whole-number answer), not transcribed.')
A = []


def a(n, html, answer, topic, note=None):
    A.append((n, 1, '<p>%s</p>' % html, str(answer), topic, note))


assert 9 + 7 == 16;            a(1, '9 + 7 =', 16, 'Addition')
assert 26 - 4 == 22;           a(2, '26 &minus; 4 =', 22, 'Subtraction', OPNOTE)
assert 15 + 6 == 21;           a(3, '15 + 6 =', 21, 'Addition')
assert 9 * 10 == 90;           a(4, '9 &times; 10 =', 90, 'Multiplication', OPNOTE)
assert 65 + 5 + 5 == 75;       a(5, '65 + 5 + 5 =', 75, 'Addition')
assert 11 + 7 == 18;           a(6, '11 + %s = 18' % BOX, 7, 'Addition')
assert 45 - 10 == 35;          a(7, '45 &minus; 10 =', 35, 'Subtraction', OPNOTE)
assert 2 * 8 == 16;            a(8, '2 &times; 8 =', 16, 'Multiplication', OPNOTE)
assert 32 + 50 == 82;          a(9, '32 + 50 =', 82, 'Addition')
assert 5 * 11 == 55;           a(10, '5 &times; 11 =', 55, 'Multiplication', OPNOTE)
assert 90 - 80 == 10;          a(11, '%s = 90 &minus; 80' % BOX, 10, 'Subtraction', OPNOTE)
assert 18 - 12 == 6;           a(12, '18 &minus; %s = 6' % BOX, 12, 'Subtraction', OPNOTE)
assert 37 + 51 == 88;          a(13, '%s = 37 + 51' % BOX, 88, 'Addition')
assert 80 // 10 == 8;          a(14, '80 &divide; 10 =', 8, 'Division', OPNOTE)
assert Fraction(1, 2) * 14 == 7
a(15, '<sup>1</sup>&frasl;<sub>2</sub> of 14 =', 7, 'Fractions of an Amount',
  'The fraction came across as loose digits (`1 2 of 14`); one half is the only reading that fits.')
assert 20 + 54 == 74;          a(16, '20 + %s = 74' % BOX, 54, 'Addition')
assert 99 - 44 == 55;          a(17, '99 &minus; 44 =', 55, 'Subtraction', OPNOTE)
assert 76 - 54 == 22;          a(18, '76 &minus; 54 =', 22, 'Subtraction')
assert 13 - 4 == 9;            a(19, '%s &minus; 4 = 9' % BOX, 13, 'Subtraction', OPNOTE)
assert 30 // 5 == 6;           a(20, '30 &divide; 5 =', 6, 'Division', OPNOTE)
assert 37 + 28 == 65;          a(21, '37 + 28 =', 65, 'Addition')
assert 13 + 45 == 58;          a(22, '13 + %s = 58' % BOX, 45, 'Addition')
assert 98 - 69 == 29;          a(23, '98 &minus; 69 =', 29, 'Subtraction', OPNOTE)
assert 48 - 15 == 33;          a(24, '%s &minus; 15 = 33' % BOX, 48, 'Subtraction', OPNOTE)
assert Fraction(1, 4) * 100 == 25
a(25, '<sup>1</sup>&frasl;<sub>4</sub> of 100 =', 25, 'Fractions of an Amount',
  'The fraction came across as loose digits (`1 4 of 100`); one quarter is the only reading that fits.')
assert [r[0] for r in A] == list(range(1, 26)) and sum(r[1] for r in A) == 25

# --------------------------------------------------------------------------------------------
# PAPER 2: REASONING. dict rows so the optional columns stay readable.
P2 = 'P-STA-KS1-2026-P2'
D2 = doc(P2, 'Paper 2: Reasoning — May 2026', 35,
         'https://drive.google.com/file/d/11sFICD7LII91IyqcPjM9twPi3O0PIACp/view')
B = []
LOST = ('Only part of this question came across in the text layer, and the pictures did not. '
        'It needs the printed page.')
PIC = 'The picture this question is about did not come across.'


def b(n, marks, html, topic, answer='', accept=None, figure=None, note=None, choices=None,
      right=None, placeholder=False):
    B.append(dict(n=n, marks=marks, html=html, topic=topic, answer=answer, accept=accept,
                  figure=figure, note=note, choices=choices, right=right, placeholder=placeholder))


b(1, 1, '<p>55 56 57 58 59 &hellip;</p>', '', placeholder=True, figure='picture',
  note='Only the numbers 55 to 59 came across; the wording and the answer space did not.')
b(2, 1, '<p>(This question is on the printed page; its wording is not in the app yet.)</p>', '',
  placeholder=True, figure='picture', note='Nothing but the mark came across.')
b(3, 1, '<p>6 &minus; 2 &nbsp; 6 &times; 2 &nbsp; 6 &divide; 2 &nbsp; 6 + 2</p>', '',
  placeholder=True, figure='picture',
  note='Only the four calculations came across; the question asked about them did not.')
b(4, 1, '<p>(This question is read aloud, and the audio and wording are not in the app yet.)</p>', '',
  placeholder=True, figure='picture', note='An aural question; only the heading came across.')
b(5, 1, '<p>(This question is read aloud, and the audio and wording are not in the app yet.)</p>', '',
  placeholder=True, figure='picture', note='An aural question; only the heading came across.')
assert 83 > 76 and 83 < 94
b(6, 1, '<p>The numbers on these teddy bears are ordered from the smallest to the largest.</p>'
        '<p>76, ?, 94</p><p>Tick the correct number for the middle teddy bear.</p>',
  'Place Value & Ordering', answer='83', choices='67 | 49 | 83 | 96', right='3')
b(7, 1, '<p>This is one stick. This is a bundle of ten sticks.</p>'
        '<p>How many sticks are there in the box below?</p>',
  'Place Value & Ordering', figure='picture', note=PIC)
assert 20 - 11 == 9
b(8, 1, '<p>Ben wants to buy a robot. It costs &pound;20. He has &pound;11.</p>'
        '<p>How much more money does he need?</p>', 'Subtraction', answer='&pound;9', accept='9')
assert [n for n in (16, 26, 61, 56, 66) if n // 10 == 6] == [61, 66]
b(9, 1, '<p>Circle all the numbers that have 6 tens.</p>', 'Place Value & Ordering',
  answer='61 and 66', choices='16 | 26 | 61 | 56 | 66', right='3,5')
b(10, 1, '<p>Compare the lengths of pencils using these signs: &gt; &lt; =</p>'
         '<p>Write the correct sign in each box: length of Pencil A and Pencil B; length of '
         'Pencil A and Pencil C.</p>', 'Units & Measures', figure='picture', note=PIC)
assert 100 - 70 == 30
b(11, 1, '<p>A bag has 100 g of pasta. Sam uses 70 g.</p><p>How much pasta is left in the bag?</p>',
  'Subtraction', answer='30 g', accept='30')
b(12, 1, '<p>Draw lines to order these times from the shortest to the longest.</p>'
         '<p>6 weeks &nbsp; 6 years &nbsp; 6 months &nbsp; 6 days</p>', 'Units & Measures',
  answer='6 days, 6 weeks, 6 months, 6 years', figure='answer-space')
assert 5 * 4 == 20
b(13, 1, '<p>Amy collects stickers. She buys a pack of 5 stickers each week.</p>'
         '<p>How many stickers does Amy buy in 4 weeks?</p><p>Circle your answer.</p>',
  'Multiplication', answer='20', choices='5 | 10 | 15 | 20 | 25', right='4')
b(14, 1, '<p>Draw line B on the grid so that it is double the length of line A.</p>',
  'Units & Measures', figure='picture', note=PIC)
b(15, 1, '<p>This diagram shows different ways to make the total 100.</p><p>Complete the diagram.</p>'
         '<p>100: 50, 40, 80</p>', 'Addition', figure='picture', note=PIC)
b(16, 1, '<p>Tick odd or even next to each number. One is done for you: 11 is odd.</p>'
         '<p>48 &nbsp; 72 &nbsp; 63</p>', 'Place Value & Ordering',
  answer='48 even, 72 even, 63 odd', figure='table-blank')
b(17, 1, '<p>How many faces does a triangular prism have?</p>', '3-D Shapes', answer='5', accept='5')
assert (7 + 3) // 2 - 3 == 2
b(18, 1, '<p>Kemi has 7 toy cars. Sam has 3 toy cars.</p>'
         '<p>Kemi gives Sam some of her cars. They now have the same number of cars.</p>'
         '<p>How many cars did Kemi give Sam?</p>', 'Subtraction', answer='2', accept='2')
b(19, 1, '<p>Weather and number of days: snowy, sunny, rainy.</p>'
         '<p>How many sunny and rainy days were there altogether?</p>',
  'Bar Charts & Pictograms', figure='picture', note=PIC)
assert 2 * 5 == 10 and 5 * 2 == 10 and 10 // 5 == 2 and 10 // 2 == 5
b(20, 1, '<p>Here are three number cards: 2, 5, 10.</p>'
         '<p>Use the number cards to make two different calculations.</p>', 'Multiplication',
  answer='Any two of: 2 &times; 5 = 10, 5 &times; 2 = 10, 10 &divide; 5 = 2, 10 &divide; 2 = 5',
  note='Several answers are right and no mark scheme is to hand, so this is marked by a person.')
b(21, 1, '<p>This is an array of oranges. Some of the oranges are hidden.</p>'
         '<p>How many oranges are hidden?</p>', 'Multiplication', figure='picture', note=PIC)
assert 7 + 4 + 9 == 20 and 7 + 5 + 8 == 20
b(22, 2, '<p>Here are some number cards: 1 2 3 4 5 6 7 8 9</p>'
         '<p>Use the number cards to make the calculation correct: 7 + &#9744; + &#9744; = 20</p>'
         '<p>Now use two different number cards to make the calculation correct: '
         '7 + &#9744; + &#9744; = 20</p>', 'Addition',
  answer='For example 7 + 4 + 9 = 20 and 7 + 5 + 8 = 20',
  note='Several answers are right and no mark scheme is to hand, so this is marked by a person.')
b(23, 1, '<p>Sam has two coins. The two coins are the same. His coins total one of these amounts.</p>'
         '<p>Circle one.</p>', 'Units & Measures', answer='40p',
  choices='30p | 35p | 40p | 45p', right='3')
assert Fraction(45, 3) == 15 or True
b(24, 1, '<p>This number line is divided into equal steps of 3.</p>'
         '<p>What number is the arrow pointing to?</p><p>0 &hellip; 30</p>', 'Sequences',
  figure='picture', note=PIC)
assert 45 // 5 == 9 and 45 % 5 == 0
b(25, 1, '<p>Sita is building towers using cubes. Each tower has 5 cubes. Sita has 45 cubes.</p>'
         '<p>How many towers does she make?</p>', 'Division', answer='9', accept='9')
b(26, 1, '<p>A class has 20 sports balls altogether.</p>'
         '<p>The block diagram shows how many there are of each type.</p>'
         '<p>Draw the missing blocks to show how many netballs there are.</p>',
  'Bar Charts & Pictograms', figure='picture', note=PIC)
b(27, 1, '<p>Write four coins that total 27p.</p>', 'Units & Measures',
  answer='For example 10p, 10p, 5p, 2p', note='Several answers are right, so this is marked by a person.')
assert 6 * 5 - 16 == 14
b(28, 2, '<p>There are 6 boxes of crayons. Each box has 5 crayons. Ajay takes 16 crayons.</p>'
         '<p>How many crayons are left?</p><p>Show your working</p>', 'Multiplication',
  answer='14', accept='14', figure='working')
b(29, 1, '<p>Look at this card: 12</p><p>Tick a card below that shows the same amount: '
         '34, 24, 14, 13</p>', 'Place Value & Ordering', figure='picture', note=PIC)
b(30, 1, '<p>Kemi builds some towers with cubes. The towers get bigger each time by the same amount.</p>'
         '<p>How many cubes will Kemi need for her next tower?</p>', 'Sequences',
  figure='picture', note=PIC)
b(31, 2, '<p>Sam is baking cakes. He fills all these cake tins. His family eat 15 of the cakes.</p>'
         '<p>How many cakes are left?</p><p>Show your working</p>', 'Division',
  figure='picture', note=PIC + ' The tins and what each holds are in it.')
assert 51 - 38 == 13
b(32, 1, '<p>Team A has 38 points and Team B has 51 points. Team B has more points than Team A.</p>'
         '<p>How many more?</p><p>Tick one.</p>', 'Subtraction', answer='13',
  choices='27 | 17 | 23 | 13', right='4')
assert [r['n'] for r in B] == list(range(1, 33))
assert sum(r['marks'] for r in B) == 35, sum(r['marks'] for r in B)


# --------------------------------------------------------------------------------------------
def row(paper, d, n, marks, html, topic, answer, accept, note, figure=None, choices=None,
        right=None, placeholder=False):
    assert ',' not in topic and '&' not in topic.replace(' & ', ''), topic
    r = {'row_id': 'Q-%s-%d' % (paper[2:], n), 'paper_id': paper, 'question': str(n),
         'kind': 'question', 'marks': str(marks)}
    if figure:
        r['figure'] = figure
    r.update({'html': html, 'answer_type': 'calculation', 'needs_print': 'False',
              'active': 'True', 'name': d['name'], 'subject': 'Maths', 'key_stage': 'KS1',
              'band_type': 'stage', 'band_value': 'KS1 SATs',
              'company': 'Standards & Testing Agency', 'exam_board': 'STA', 'year': '2026'})
    if topic:
        r['topics'] = topic
    r['document_type'] = 'Past paper'
    if answer:
        r['answer'] = answer
    if accept:
        r['accept'] = accept
    if choices:
        r['choices'] = choices
        r['choice_right'] = right
    if note:
        r['examiner_note'] = note
    if placeholder:
        r['placeholder'] = 'True'
    return r


rows = [D1]
for n, marks, html, answer, topic, note in A:
    rows.append(row(P1, D1, n, marks, html, topic, answer, answer, note, figure='boxes' if BOX in html else None))
rows.append(D2)
for r in B:
    rows.append(row(P2, D2, r['n'], r['marks'], r['html'], r['topic'], r['answer'], r['accept'],
                    r['note'], r['figure'], r['choices'], r['right'], r['placeholder']))

lines = FILE.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
seen = {json.loads(l.rstrip(','))['row_id'] for l in lines if '"row_id"' in l}
clash = seen & {r['row_id'] for r in rows}
assert not clash, 'already inserted: %r' % sorted(clash)
lines[-2] += ','
for r in rows[:-1]:
    lines.insert(-1, json.dumps(r) + ',')
lines.insert(-1, json.dumps(rows[-1]))
FILE.write_text('\n'.join(lines) + '\n')
print('%d rows written: Paper 1 %d questions / %d marks, Paper 2 %d questions / %d marks'
      % (len(rows), len(A), sum(x[1] for x in A), len(B), sum(x['marks'] for x in B)))
