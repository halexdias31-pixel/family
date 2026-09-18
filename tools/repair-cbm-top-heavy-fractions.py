"""Puts the fractions back into `Top Heavy Fractions Mixed Numbers`, and re-splits the rows.

SEVEN ROWS IN THE LIBRARY, FIFTEEN QUESTIONS ON THE PAPER. Corbettmaths sets a fraction as stacked
artwork, so the text layer of page 2 reads `1. 2. 3. Write as a mixed number Write as a mixed
number Write as a mixed number` -- three questions, no numbers, and the transcription made all
three ONE row. A child opening it saw "Write as a mixed number" three times with nothing to write.
Four row ids were never created; this is a repair of the sheet's shape as well as its content.

Read off the rendered pages: extract, find the maths is not there, then render every page and look.

EVERY ANSWER IS COMPUTED FROM THE TRANSCRIBED QUESTION. A top-heavy fraction and its mixed number
are exact inverses of each other -- 7/3 is 2 1/3 or it is not -- so each conversion is ROUND-TRIPPED
before it is written, the move `tools/cbmnum.py` already makes for Roman numerals and number words.

QUESTION 15 IS TWO ASKS AND BECOMES TWO ROWS. There is one answer box per ask on the paper and two
different answers, and CLAUDE.md's rule is that a row with more than one ask gets no `accept` --
one box on screen and two answers is a right answer marked wrong. Splitting it is the better fix.
"""
import json
import pathlib
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
PAPER = 'W-CBM-top-heavy-fractions-mixed-numbers'
SOURCE = 'https://drive.google.com/file/d/1RWWBGFmBWe2GS1bO4Lew6eS_U2Kzmwoa/view'


def top(a, b):
    return '<sup>%d</sup>&frasl;<sub>%d</sub>' % (a, b)


def mixed(f):
    w, rest = divmod(f.numerator, f.denominator)
    assert rest, '%s is a whole number, not a mixed one' % f
    return '%d<sup>%d</sup>&frasl;<sub>%d</sub>' % (w, rest, f.denominator)


def split(a, b):
    """a/b as a whole number and a remainder, round-tripped back before it is returned."""
    f = Fraction(a, b)
    w, rest = divmod(a, b)
    assert w * b + rest == a and 0 < rest < b
    assert Fraction(w) + Fraction(rest, b) == f, 'the mixed number does not come back to %d/%d' % (a, b)
    return w, rest


Q = []


def to_mixed(n, a, b):
    w, rest = split(a, b)
    Q.append(('%d' % n, '', '<p>Write %s as a mixed number</p>' % top(a, b),
              '<b>%s</b> &mdash; %d &divide; %d goes %d time%s with %d left over, so it is %d '
              'whole and %s more.' % (mixed(Fraction(a, b)), a, b, w, '' if w == 1 else 's', rest,
                                      w, top(rest, b)),
              '%d %d/%d' % (w, rest, b)))


def to_top(n, w, rest, b):
    a = w * b + rest
    assert Fraction(a, b) == w + Fraction(rest, b)
    Q.append(('%d' % n, '', '<p>Write %s as an improper (top-heavy) fraction</p>'
                            % mixed(Fraction(a, b)),
              '<b>%s</b> &mdash; one whole is %s, so %d whole%s %s %d &times; %d = %d of them, '
              'and the %d already there makes %d.'
              % (top(a, b), top(b, b), w, '' if w == 1 else 's', 'is' if w == 1 else 'are',
                 w, b, w * b, rest, a),
              '%d/%d' % (a, b)))


to_mixed(1, 7, 3)
to_mixed(2, 5, 2)
to_mixed(3, 5, 3)
to_mixed(4, 13, 10)
to_mixed(5, 16, 7)
to_mixed(6, 60, 11)
to_top(7, 1, 3, 4)
to_top(8, 3, 1, 2)
to_top(9, 1, 2, 5)
to_top(10, 2, 3, 10)
to_top(11, 1, 1, 3)
to_top(12, 4, 3, 4)

# 13 -- the match-up. Eight cards, four pairs, and every pair is checked rather than asserted by eye.
PAIRS = [((2, 1, 4), (9, 4)), ((2, 1, 3), (7, 3)), ((1, 3, 4), (7, 4)), ((3, 2, 3), (11, 3))]
for (w, r, d), (a, b) in PAIRS:
    assert Fraction(a, b) == w + Fraction(r, d), '%d %d/%d is not %d/%d' % (w, r, d, a, b)
MIXED_CARDS = ' &nbsp; '.join(mixed(Fraction(w * d + r, d)) for (w, r, d), _ in PAIRS)
TOP_CARDS = ' &nbsp; '.join(top(a, b) for _, (a, b) in
                            sorted(PAIRS, key=lambda p: (p[1][1], p[1][0])))
Q.append(('13', '',
          '<p>Match up the equivalent mixed numbers and the improper fractions.</p>'
          '<p>Mixed numbers: %s</p><p>Improper fractions: %s</p>' % (MIXED_CARDS, TOP_CARDS),
          '<b>%s</b> &mdash; turn each mixed number top-heavy and the pairs fall out.'
          % ', '.join('%s = %s' % (mixed(Fraction(w * d + r, d)), top(a, b))
                      for (w, r, d), (a, b) in PAIRS), ''))

week = Fraction(2, 5) * 7
assert week == Fraction(14, 5) and split(14, 5) == (2, 4)
Q.append(('14', '',
          '<p>Gregory the cat eats %s of a can of cat food each day.</p><p>Work out how much cat '
          'food is eaten in one week. Give your answer as a mixed number.</p>' % top(2, 5),
          '<b>%s cans</b> &mdash; a week is 7 days, so it is %s &times; 7 = %s, and 14 &divide; 5 '
          'goes 2 times with 4 left over.' % (mixed(week), top(2, 5), top(14, 5)), '2 4/5'))

# 15 -- the number cards. Every ordered pair is tried, so the list of right answers is found rather
# than remembered: a card used twice is not allowed, and the fraction has to be improper.
CARDS = [13, 9, 21, 5, 2]
def between(lo, hi):
    return [(a, b) for i, a in enumerate(CARDS) for j, b in enumerate(CARDS)
            if i != j and lo < Fraction(a, b) < hi]
assert between(2, 3) == [(13, 5), (21, 9), (5, 2)]
assert between(4, 5) == [(9, 2), (21, 5)]
CARD_ROW = ' &nbsp; '.join('<b>%d</b>' % c for c in CARDS)
for part, (lo, hi) in (('a', (2, 3)), ('b', (4, 5))):
    opts = between(lo, hi)
    Q.append(('15', part,
              '<p>Here are 5 number cards: %s</p><p>Using the cards, make an improper fraction '
              'between %d and %d.</p>' % (CARD_ROW, lo, hi),
              '<b>%s</b> &mdash; any one of them. %s'
              % (' or '.join(top(a, b) for a, b in opts),
                 ', '.join('%s is %s' % (top(a, b), ('%.3f' % (a / b)).rstrip('0'))
                           for a, b in opts)),
              ' or '.join('%d/%d' % (a, b) for a, b in opts)))

assert [q[0] + q[1] for q in Q] == [str(n) for n in range(1, 15)] + ['15a', '15b']

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
                    if k not in ('row_id', 'question', 'part', 'html', 'answer', 'accept',
                                 'figure', 'examiner_note')}
assert template, 'no question row to take the sheet-level columns from'

built, order = {}, []
for n, part, html, answer, accept in Q:
    row = dict(template)
    row.update(row_id='Q-CBM-top-heavy-fractions-mixed-numbers-%s%s' % (n, part),
               question=n, html=html, answer=answer)
    if part:
        row['part'] = part
    if accept:
        row['accept'] = accept
    built[row['row_id']] = row
    order.append(row['row_id'])

out, seen = [], set()
# THE MERGED ROW 15 IS DELETED RATHER THAN OVERWRITTEN. It held both asks, and it is replaced by
# 15a and 15b -- leaving it would put the question on the screen three times.
GONE = {'Q-CBM-top-heavy-fractions-mixed-numbers-15'}
for line in lines:
    if '"row_id"' not in line:
        out.append(line)
        continue
    row = json.loads(line.rstrip(','))
    tail = ',' if line.endswith(',') else ''
    if row['row_id'] in GONE:
        continue
    if row['row_id'] in built:
        seen.add(row['row_id'])
        out.append(json.dumps(built[row['row_id']]) + tail)
    elif row.get('paper_id') == PAPER and row.get('kind') == 'document':
        row['source_url'] = SOURCE
        out.append(json.dumps(row) + tail)
    else:
        out.append(line)
if out[-1] == ']' and out[-2].endswith(','):
    out[-2] = out[-2][:-1]

missing = [rid for rid in order if rid not in seen]
if missing:
    if not out[-2].endswith(','):
        out[-2] += ','
    for i, rid in enumerate(missing):
        out.insert(-1, json.dumps(built[rid]) + (',' if i < len(missing) - 1 else ''))
    if out[-2].endswith(','):
        out[-2] = out[-2][:-1]

FILE.write_text('\n'.join(out) + '\n')
print('%s: %d questions with their fractions restored, %d of them rows that never existed (%s)'
      % (PAPER, len(built), len(missing),
         ', '.join(r.rsplit('-', 1)[1] for r in missing)))
