"""Puts the fractions back into `Fractions, Decimals and Percentages`, and answers all 25.

FOURTEEN OF THE TWENTY-FIVE QUESTIONS HAD NO NUMBERS IN THEM. Corbettmaths sets a fraction as
stacked artwork, so the text layer gives `Shade of this diagram` and `Write as a percentage` --
which is what a child opening the library saw. Thirteen rows had no answer either.

Read off the rendered pages: extract, find the maths is not there, then render every page and look.

EVERY ANSWER IS COMPUTED FROM THE TRANSCRIBED QUESTION. A fraction, a decimal and a percentage are
three spellings of one number, so `Fraction` settles all of them and each conversion is checked
back against the value it came from before it is written.

THREE OF THE PICTURES ARE COUNTED RATHER THAN GUESSED -- the rule this repository already records
for a picture carrying data. Question 15's grid is 4 squares across and 5 down with fourteen of
them shaded; question 14's triangle is cut into 1 + 3 + 5 + 7 = 16 small ones. Those counts are
what make the answers derivable, so they are asserted rather than trusted.

THE `Shade ...` QUESTIONS ARE ANSWERED BY SAYING HOW MANY PARTS, not by claiming the picture. The
row still carries `figure`, so `check-library.js` counts it as a picture that never came across.
"""
import json
import pathlib
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
PAPER = 'W-CBM-fractions-decimals-and-percentages'
SOURCE = 'https://drive.google.com/file/d/1muZicZI9F9vd2K3Z9uhuspGkVOEZHr8z/view'


def top(a, b):
    return '<sup>%d</sup>&frasl;<sub>%d</sub>' % (a, b)


def pc(f):
    """A fraction as a percentage, exact or it is not written."""
    v = Fraction(f) * 100
    assert v.denominator == 1, '%s is not a whole percentage' % f
    return int(v)


def dec(f):
    """A fraction as a terminating decimal, checked back to the fraction it came from."""
    f = Fraction(f)
    s = ('%f' % float(f)).rstrip('0').rstrip('.')
    assert Fraction(s) == f, '%s does not write exactly as %s' % (f, s)
    return s


Q = []          # (number, html, answer, accept, figure)


def add(n, html, answer, accept='', figure=''):
    Q.append((str(n), html, answer, accept, figure))


# 1, 3, 6, 14 -- shade this many parts. The answer is the count, because the picture is the paper's,
# and `want` arrives as the fraction or the percentage the paper actually prints on that question.
def shade(n, want, parts, shape, grid):
    frac = Fraction(int(want[:-1]), 100) if isinstance(want, str) else want
    shown = want if isinstance(want, str) else top(frac.numerator, frac.denominator)
    got = frac * parts
    assert got.denominator == 1, '%s of %d is not a whole number of parts' % (shown, parts)
    add(n, '<p>Shade %s of this diagram.</p><p>The diagram is %s.</p>' % (shown, shape),
        '<b>%d of the %d %s</b> &mdash; %s of %d is %d. Which ones you shade does not matter.'
        % (got, parts, grid, shown, parts, got), str(int(got)), 'diagram')


shade(1, Fraction(2, 3), 3, 'a circle cut into 3 equal parts', 'parts')
add(2, '<p>What fraction of this diagram is shaded?</p><p>The diagram is a circle cut into 5 equal '
       'parts, 2 of them shaded.</p>',
    '<b>%s</b> &mdash; 2 of the 5 parts are shaded, and %s does not cancel.'
    % (top(2, 5), top(2, 5)), '2/5', 'diagram')
shade(3, '50%', 12, 'a grid 4 squares across and 3 down', 'squares')
add(4, '<p>Mike got 25% of the questions right on a test.</p><p>What fraction of the questions did '
       'he get right?</p>',
    '<b>%s</b> &mdash; 25%% means 25 out of 100, and 25 and 100 both divide by 25.' % top(1, 4),
    '1/4')
add(5, '<p>Write 0.5 as a percentage.</p>',
    '<b>50%</b> &mdash; 0.5 is 5 tenths, which is 50 hundredths, and a percentage is hundredths.',
    '50')
shade(6, Fraction(5, 9), 9, 'a grid 3 squares across and 3 down', 'squares')

ROW7 = [(Fraction(1, 2), 'percentage'), (Fraction(1, 4), 'fraction'),
        (Fraction(1, 5), 'decimal'), (Fraction(1, 10), 'percentage')]
add(7, '<p>Fill in the missing values.</p>'
       '<table><tr><th>Fraction</th><th>Decimal</th><th>Percentage</th></tr>'
       '<tr><td>%s</td><td>0.5</td><td></td></tr>'
       '<tr><td></td><td>0.25</td><td>25%%</td></tr>'
       '<tr><td>%s</td><td></td><td>20%%</td></tr>'
       '<tr><td>%s</td><td>0.1</td><td></td></tr></table>'
       % (top(1, 2), top(1, 5), top(1, 10)),
    '<b>50%%, %s, 0.2 and 10%%</b> &mdash; in that order down the table. %s is 0.5 is 50%%; 0.25 '
    'is 25 hundredths, which is %s; %s is 0.2 is 20%%; %s is 0.1 is 10%%.'
    % (top(1, 4), top(1, 2), top(1, 4), top(1, 5), top(1, 10)))

TICK8 = [('75%', Fraction(3, 4)), (top(34, 100), Fraction(34, 100)), ('0.75', Fraction(3, 4)),
         (top(4, 5), Fraction(4, 5)), ('34%', Fraction(34, 100))]
right8 = [t for t, v in TICK8 if v == Fraction(3, 4)]
assert right8 == ['75%', '0.75']
add(8, '<p>Tick the <b>two</b> numbers that are equivalent to %s</p><p>%s</p>'
       % (top(3, 4), ' &nbsp; '.join(t for t, _ in TICK8)),
    '<b>75%% and 0.75</b> &mdash; %s is 3 &divide; 4 = 0.75, which is 75 hundredths. %s and 34%% '
    'are the same as each other but not as %s, and %s is 0.8.'
    % (top(3, 4), top(34, 100), top(3, 4), top(4, 5)))

add(9, '<p>Write 0.8 as a percentage.</p>',
    '<b>80%</b> &mdash; 0.8 is 8 tenths, which is 80 hundredths.', '80')
add(10, '<p>Write 30% as a fraction.</p>',
    '<b>%s</b> &mdash; 30%% is %s, and 30 and 100 both divide by 10. %s is also right if the '
    'question does not ask you to simplify.' % (top(3, 10), top(30, 100), top(30, 100)),
    '3/10 or 30/100')
add(11, '<p>Write %s as a decimal.</p>' % top(2, 5),
    '<b>0.4</b> &mdash; %s is %s, which is 4 tenths.' % (top(2, 5), top(4, 10)), '0.4')
add(12, '<p>Write %s as a percentage.</p>' % top(7, 10),
    '<b>70%%</b> &mdash; %s is %s, and a percentage is hundredths.' % (top(7, 10), top(70, 100)),
    '70')

TICK13 = [('35%', Fraction(35, 100)), (top(30, 50), Fraction(30, 50)), ('0.35', Fraction(35, 100)),
          ('0.6', Fraction(6, 10))]
right13 = [t for t, v in TICK13 if v == Fraction(3, 5)]
assert right13 == [top(30, 50), '0.6']
add(13, '<p>Tick the <b>two</b> numbers that are equivalent to %s</p><p>%s</p>'
        % (top(3, 5), ' &nbsp; '.join(t for t, _ in TICK13)),
    '<b>%s and 0.6</b> &mdash; %s cancels by 10 to %s, and %s is 3 &divide; 5 = 0.6. 35%% and 0.35 '
    'are the same as each other and are not %s.' % (top(30, 50), top(30, 50), top(3, 5), top(3, 5),
                                                    top(3, 5)))

TRI = 1 + 3 + 5 + 7
assert TRI == 16
shade(14, '75%', TRI, 'a large triangle cut into %d small triangles, in rows of 1, 3, 5 and 7'
      % TRI, 'small triangles')

COLS15, ROWS15, SHADED15 = 4, 5, 14
g15 = Fraction(SHADED15, COLS15 * ROWS15)
assert COLS15 * ROWS15 == 20 and g15 == Fraction(7, 10)
add(15, '<p>What fraction of this diagram is shaded?</p><p>The diagram is a grid %d squares across '
        'and %d squares down. The right-hand 2 squares of each of the top 3 rows are shaded, and '
        'all 4 squares of each of the bottom 2 rows are shaded.</p>' % (COLS15, ROWS15),
    '<b>%s</b> &mdash; 2 &times; 3 = 6 shaded in the top three rows and 4 &times; 2 = 8 in the '
    'bottom two, so %d of the %d squares, and 14 and 20 both divide by 2.'
    % (top(g15.numerator, g15.denominator), SHADED15, COLS15 * ROWS15), '7/10', 'diagram')

glasses = Fraction(2, 5)
add(16, '<p>In a school, %s of the children wear glasses.</p><p>What fraction of the children '
        '<b>do not</b> wear glasses? What percentage of the children <b>do not</b> wear glasses?'
        '</p>' % top(2, 5),
    '<b>%s, and 60%%</b> &mdash; the whole school is %s, so %s &minus; %s = %s do not wear them, '
    'and %s is %s, which is 60%%.'
    % (top(3, 5), top(5, 5), top(5, 5), top(2, 5), top(3, 5), top(3, 5), top(60, 100)))

red = Fraction(20, 30)
assert red == Fraction(2, 3)
add(17, '<p>There are 30 sweets in a bag. 20 sweets are red.</p><p>What fraction of the sweets are '
        'red?</p>',
    '<b>%s</b> &mdash; 20 out of 30 is %s, and 20 and 30 both divide by 10.'
    % (top(2, 3), top(20, 30)), '2/3')

WORD = 'CORBETTMATHS'
t18, a18 = Fraction(WORD.count('T'), len(WORD)), Fraction(WORD.count('A'), len(WORD))
assert len(WORD) == 12 and WORD.count('T') == 3 and WORD.count('A') == 1
assert t18 == Fraction(1, 4) and a18 == Fraction(1, 12)
add(18, '<p>Here are 12 letter cards spelling <b>%s</b>.</p><p>What fraction of the letters are '
        'the letter <b>T</b>? What fraction of the letters are the letter <b>A</b>?</p>'
        % ' '.join(WORD),
    '<b>%s and %s</b> &mdash; there are %d letters altogether. Three of them are T, and %s cancels '
    'to %s. One is A, and %s does not cancel.'
    % (top(1, 4), top(1, 12), len(WORD), top(3, 12), top(1, 4), top(1, 12)))

add(19, '<p>In a town in Cornwall, it rained for 13 days during April.</p><p>What fraction of the '
        'days in the month did it rain?</p>',
    '<b>%s</b> &mdash; April has 30 days, and 13 and 30 share no factor so it does not cancel. The '
    '30 is not printed in the question: knowing it is the part of this one that is not arithmetic.'
    % top(13, 30), '13/30')

awake = Fraction(24 - 6, 24)
assert pc(awake) == 75
add(20, '<p>During a day, Madeleine slept for 6 hours.</p><p>What percentage of the day is '
        'Madeleine awake?</p>',
    '<b>75%%</b> &mdash; a day is 24 hours, so she is awake for 24 &minus; 6 = 18 of them; %s '
    'cancels to %s, which is 75%%.' % (top(18, 24), top(3, 4)), '75')

add(21, '<p>Danny scored 9 out of 10 in a quiz.</p><p>What percentage of the questions did Danny '
        'answer correctly?</p>',
    '<b>90%%</b> &mdash; %s is %s, and a percentage is hundredths.' % (top(9, 10), top(90, 100)),
    '90')

add(22, '<p>Write 17% as a fraction.</p>',
    '<b>%s</b> &mdash; a percentage is hundredths, and 17 and 100 share no factor so it does not '
    'cancel.' % top(17, 100), '17/100')
add(23, '<p>Write %s as a percentage.</p>' % top(7, 20),
    '<b>%d%%</b> &mdash; 20 &times; 5 = 100, so multiply the top by 5 as well: %s is %s.'
    % (pc(Fraction(7, 20)), top(7, 20), top(35, 100)), '35')
add(24, '<p>Write %s as a percentage.</p>' % top(14, 25),
    '<b>%d%%</b> &mdash; 25 &times; 4 = 100, so multiply the top by 4 as well: %s is %s.'
    % (pc(Fraction(14, 25)), top(14, 25), top(56, 100)), '56')
add(25, '<p>Write %s as a decimal.</p>' % top(1, 8),
    '<b>%s</b> &mdash; 1 &divide; 8. Halving three times gets there too: %s is 0.5, %s is 0.25, '
    '%s is 0.125.' % (dec(Fraction(1, 8)), top(1, 2), top(1, 4), top(1, 8)), '0.125')

assert [q[0] for q in Q] == [str(n) for n in range(1, 26)]

# ---- write ------------------------------------------------------------------------------------
lines = FILE.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
template = None
for line in lines:
    if '"%s"' % PAPER not in line:
        continue
    row = json.loads(line.rstrip(','))
    if row.get('kind') == 'question' and template is None:
        template = {k: v for k, v in row.items()
                    if k not in ('row_id', 'question', 'html', 'answer', 'accept', 'figure',
                                 'examiner_note')}
assert template, 'no question row to take the sheet-level columns from'

built = {}
for n, html, answer, accept, figure in Q:
    row = dict(template)
    row.update(row_id='Q-CBM-fractions-decimals-and-percentages-%s' % n, question=n, html=html,
               answer=answer)
    if accept:
        row['accept'] = accept
    if figure:
        row['figure'] = figure
    built[row['row_id']] = row

out, seen = [], set()
for line in lines:
    if '"row_id"' not in line:
        out.append(line)
        continue
    row = json.loads(line.rstrip(','))
    tail = ',' if line.endswith(',') else ''
    if row['row_id'] in built:
        seen.add(row['row_id'])
        out.append(json.dumps(built[row['row_id']]) + tail)
    elif row.get('paper_id') == PAPER and row.get('kind') == 'document':
        row['source_url'] = SOURCE
        out.append(json.dumps(row) + tail)
    else:
        out.append(line)

assert len(seen) == len(built), 'rows that did not already exist: %r' % sorted(set(built) - seen)
FILE.write_text('\n'.join(out) + '\n')
print('%s: %d questions restored and answered, %d carry a picture the transcription still lacks'
      % (PAPER, len(built), sum(1 for q in Q if q[4])))
