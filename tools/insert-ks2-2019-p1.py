"""KS2 SATs mathematics 2019, Paper 1: arithmetic — 36 questions.

READ OFF `ks2-2019-mathematics-papers-123-mark-scheme.pdf`, not derived. Every answer below was
checked against the scheme's own Requirement column before it was written here, which is the rule
this library paid for on the 2017 Highers: four answers there were subtly wrong precisely because
they were worked out rather than read.

AND THE PAPER'S FRACTIONS ARE ARTWORK. The text layer gives `16 3 3 =` for what is 3 cubed, and
`22 13 7 - 4 7 =` for 1 3/7 - 4/7 -- loose digits, the failure mode this repository records four
ways. Every one of the fourteen fraction and index questions was recovered by rendering its page
and looking at it.

THE TOTAL IS THE END-TO-END CHECK. The cover says 40, and 32 one-mark questions plus four
two-mark long multiplications and divisions is 40. That single number catches a dropped part, a
misread mark count and a duplicated question, and it is asserted before a row is written.

Crown copyright, Open Government Licence v3.0. The paper's own copyright page states it contains
no third-party content, which is why the questions can be reproduced here where an exam board's
cannot -- the AQA English insert one section along is the opposite case.
"""
import json
import pathlib
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
PAPER = 'P-STA-KS2-2019-P1'
SOURCE = 'https://drive.google.com/file/d/1krkDI-ySQFYZa25kyxdo5A7sDWaIEJ_-/view'

DOC = {
    'row_id': 'D-' + PAPER, 'paper_id': PAPER, 'kind': 'document', 'active': 'True',
    'name': 'Paper 1: Arithmetic — May 2019', 'subject': 'Maths', 'key_stage': 'KS2',
    'band_type': 'stage', 'band_value': 'KS2 SATs', 'company': 'Standards & Testing Agency',
    'exam_board': 'STA', 'year': '2019', 'month': '5', 'document_type': 'Past paper',
    'total_marks': '40', 'source_url': SOURCE,
    'needs': 'No calculator',
}


def frac(a, b):
    return '<sup>%d</sup>&frasl;<sub>%d</sub>' % (a, b)


def mixed(w, a, b):
    return '%d%s' % (w, frac(a, b))


Q = []


def q(n, marks, html, answer, accept, topics, figure=None):
    Q.append({'n': n, 'marks': marks, 'html': html, 'answer': answer, 'accept': accept,
              'topics': topics, 'figure': figure})


# ---- the plain arithmetic, answers as the scheme prints them --------------------------------
assert 6000 + 90 == 6090
q(1, 1, '<p>&#9744; = 6,000 + 90</p>', '6,090', '6090', 'Place Value & Ordering')
assert 8275 + 82 == 8357
q(2, 1, '<p>&#9744; = 8,275 + 82</p>', '8,357', '8357', 'Addition')
assert 800 + 20 + 6 == 826
q(3, 1, '<p>826 = 800 + &#9744; + 6</p>', '20', '20', 'Place Value & Ordering')
assert 336 + 5 == 341
q(4, 1, '<p>&#9744; + 5 = 341</p>', '336', '336', 'Addition')
assert 9 * 41 == 369
q(5, 1, '<p>9 &times; 41 =</p>', '369', '369', 'Multiplication')
assert Fraction('5.87') + Fraction('3.123') == Fraction('8.993')
q(6, 1, '<p>5.87 + 3.123 =</p>', '8.993', '8.993', 'Calculating with Decimals')
assert 180 // 3 == 60
q(7, 1, '<p>180 &divide; 3 =</p>', '60', '60', 'Division')
assert 120 // 12 == 10
q(8, 1, '<p>120 &divide; 12 =</p>', '10', '10', 'Division')
q(9, 1, '<p>213 &times; 0 =</p>', '0', '0', 'Multiplication')
assert 91 // 7 == 13
q(10, 1, '<p>91 &divide; 7 =</p>', '13', '13', 'Division')
assert 87 - 65 == 22
# THE SCHEME SAYS "Do not accept -22" -- the box is on the LEFT of the equals sign, and a child
# who reads it as 65 - 87 gets the sign the wrong way round. Worth carrying into the answer.
q(11, 1, '<p>&#9744; = 87 &minus; 65</p>', '22', '22', 'Subtraction')
assert 602 - 8 == 594
q(12, 1, '<p>602 &minus; &#9744; = 594</p>', '8', '8', 'Subtraction')
assert 1210 // 11 == 110
q(13, 1, '<p>1,210 &divide; 11 =</p>', '110', '110', 'Division')
assert Fraction('25.34') * 10 == Fraction('253.4')
q(14, 1, '<p>25.34 &times; 10 =</p>', '253.4', '253.4', 'Calculating with Decimals')
assert 60 // (30 - 24) == 10
q(15, 1, '<p>60 &divide; (30 &minus; 24) =</p>', '10', '10', 'Order of Operations')
assert 3 ** 3 == 27
q(16, 1, '<p>3<sup>3</sup> =</p>', '27', '27', 'Cubes & Cube Roots')
assert 101 * 1000 == 101000
q(17, 1, '<p>101 &times; 1,000 =</p>', '101,000', '101000', 'Multiplication')
assert Fraction(20, 100) * 3000 == 600
q(18, 1, '<p>20% of 3,000 =</p>', '600', '600', 'Percentage of an Amount')
assert 7 - Fraction('2.25') == Fraction('4.75')
q(19, 1, '<p>7 &minus; 2.25 =</p>', '4.75', '4.75', 'Calculating with Decimals')
assert Fraction('0.9') / 100 == Fraction('0.009')
q(20, 1, '<p>0.9 &divide; 100 =</p>', '0.009', '0.009', 'Calculating with Decimals')
assert 9 - Fraction('1.9') == Fraction('7.1')
q(21, 1, '<p>9 &minus; 1.9 =</p>', '7.1', '7.1', 'Calculating with Decimals')

# ---- the fractions, every one recovered from the rendered page -------------------------------
assert Fraction(10, 7) - Fraction(4, 7) == Fraction(6, 7)
q(22, 1, '<p>%s &minus; %s =</p>' % (mixed(1, 3, 7), frac(4, 7)), frac(6, 7), '6/7',
  'Adding & Subtracting Fractions', 'fractions')
assert 836 * 27 == 22572
q(23, 2, '<p>836 &times; 27</p><p>Show your method</p>', '22,572', '22572',
  'Long Multiplication', 'long-method')
assert Fraction(1, 5) + Fraction(3, 4) == Fraction(19, 20)
q(24, 1, '<p>%s + %s =</p>' % (frac(1, 5), frac(3, 4)), frac(19, 20), '19/20',
  'Adding & Subtracting Fractions', 'fractions')
assert 888 // 37 == 24 and 888 % 37 == 0
q(25, 2, '<p>888 &divide; 37</p><p>Show your method</p>', '24', '24', 'Long Division',
  'long-method')
assert Fraction(6, 5) + Fraction(21, 10) == Fraction(33, 10)
q(26, 1, '<p>%s + %s =</p>' % (mixed(1, 1, 5), mixed(2, 1, 10)), mixed(3, 3, 10), '3 3/10',
  'Mixed Numbers', 'fractions')
assert Fraction(35, 100) * 320 == 112
q(27, 1, '<p>35% of 320 =</p>', '112', '112', 'Percentage of an Amount')
assert Fraction(8, 9) - Fraction(1, 4) == Fraction(23, 36)
q(28, 1, '<p>%s &minus; %s =</p>' % (frac(8, 9), frac(1, 4)), frac(23, 36), '23/36',
  'Adding & Subtracting Fractions', 'fractions')
assert Fraction(51, 100) * 900 == 459
q(29, 1, '<p>51% of 900 =</p>', '459', '459', 'Percentage of an Amount')
assert 3468 * 62 == 215016
q(30, 2, '<p>3468 &times; 62</p><p>Show your method</p>', '215,016', '215016',
  'Long Multiplication', 'long-method')
assert Fraction(2, 3) / 3 == Fraction(2, 9)
q(31, 1, '<p>%s &divide; 3 =</p>' % frac(2, 3), frac(2, 9), '2/9',
  'Multiplying & Dividing Fractions', 'fractions')
assert Fraction(5, 2) - Fraction(3, 4) == Fraction(7, 4)
q(32, 1, '<p>%s &minus; %s =</p>' % (mixed(2, 1, 2), frac(3, 4)), mixed(1, 3, 4), '1 3/4',
  'Mixed Numbers', 'fractions')
assert Fraction(36, 100) * 450 == 162
q(33, 1, '<p>36% of 450 =</p>', '162', '162', 'Percentage of an Amount')
assert Fraction(7, 4) * 10 == Fraction(35, 2)
q(34, 1, '<p>%s &times; 10 =</p>' % mixed(1, 3, 4), mixed(17, 1, 2), '17 1/2',
  'Mixed Numbers', 'fractions')
assert Fraction(5, 6) * 540 == 450
q(35, 1, '<p>%s &times; 540 =</p>' % frac(5, 6), '450', '450', 'Fractions of an Amount',
  'fractions')
assert 8051 // 83 == 97 and 8051 % 83 == 0
q(36, 2, '<p>8051 &divide; 83</p><p>Show your method</p>', '97', '97', 'Long Division',
  'long-method')

# ---- the totals -------------------------------------------------------------------------------
assert [r['n'] for r in Q] == list(range(1, 37)), 'a question number is missing or repeated'
assert sum(r['marks'] for r in Q) == int(DOC['total_marks']), \
    'the paper is out of %s and these rows sum to %d' % (DOC['total_marks'],
                                                         sum(r['marks'] for r in Q))
assert sum(1 for r in Q if r['marks'] == 2) == 4, 'four questions carry two marks'
for r in Q:
    assert ',' not in r['topics'], \
        '`topics` is a comma-list, so a comma in a name is a second topic: %r' % r['topics']
    # AND NO HTML ENTITY EITHER. `Multiplying &amp; Dividing Fractions` is a different string from
    # `Multiplying & Dividing Fractions`, so it is a second button for one topic -- the `and`
    # against `&` fault this repository already records, wearing an escape. I wrote it into this
    # very script and the check did not catch it, which is why the check changed too.
    assert '&' not in r['topics'].replace(' & ', ''), \
        'a topic carries an HTML entity: %r' % r['topics']

rows = [DOC]
for r in Q:
    row = {
        'row_id': 'Q-STA-KS2-2019-P1-%d' % r['n'], 'paper_id': PAPER, 'question': str(r['n']),
        'kind': 'question', 'marks': str(r['marks']),
    }
    if r['figure']:
        row['figure'] = r['figure']
    row.update({
        'html': r['html'], 'answer_type': 'calculation', 'needs_print': 'False',
        'active': 'True', 'name': DOC['name'], 'subject': 'Maths', 'key_stage': 'KS2',
        'band_type': 'stage', 'band_value': 'KS2 SATs',
        'company': 'Standards & Testing Agency', 'exam_board': 'STA', 'year': '2019',
        'topics': r['topics'], 'document_type': 'Past paper',
        'answer': r['answer'], 'accept': r['accept'],
    })
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
print('%s: %d questions, %d marks, %d rows written'
      % (PAPER, len(Q), sum(r['marks'] for r in Q), len(rows)))
