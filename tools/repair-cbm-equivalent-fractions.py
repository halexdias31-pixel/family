"""Puts the fractions back into `Equivalent Fractions Simplifying Fractions`.

TWELVE OF THE SIXTEEN QUESTIONS HAD NO NUMBERS IN THEM. Corbettmaths sets a fraction as stacked
artwork, so the text layer of this sheet reads `3. 4. 5. Find the missing number Find the missing
number Find the missing number` -- and that is what was in the library: "Find the missing number",
six times, with no fraction anywhere and nothing to find. Three more said only "Simplify".

Unlike the other two sheets repaired this week the ROWS were split correctly, one per question, so
this is a repair of their content and not of the sheet's shape.

Read off the rendered pages: extract, find the maths is not there, then render every page and look.

EVERY ANSWER IS COMPUTED FROM THE TRANSCRIBED QUESTION. An equivalence has an exact inverse -- the
missing number is the one that makes the two fractions equal, and `Fraction` settles that -- so
each is checked back against the pair it came from before it is written.

QUESTION 16 IS COUNTED OFF THE PICTURE RATHER THAN GUESSED. The rectangle is a raster image in the
PDF; its cell edges are 36 px apart over 288 by 216, which is 8 columns by 6 rows = 48 squares, and
the question itself says 14 are shaded. That is CLAUDE.md's rule for a picture carrying data: find
the gridlines by their own regular spacing and read the figures off them.
"""
import json
import pathlib
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
PAPER = 'W-CBM-equivalent-fractions-simplifying-fractions'
SOURCE = 'https://drive.google.com/file/d/1d2xYtSU7iotdhhnfmIWduekRHUnqwrqB/view'
BOX = '<b>&#9633;</b>'


def top(a, b):
    return '<sup>%d</sup>&frasl;<sub>%d</sub>' % (a, b)


def hole(a, b):
    """One of the two numbers is the box the child fills in."""
    return '<sup>%s</sup>&frasl;<sub>%s</sub>' % (BOX if a is None else a, BOX if b is None else b)


Q = []


def missing(n, known, asked):
    """`known` is a whole fraction; `asked` is the pair with one number left out."""
    ka, kb = known
    aa, ab = asked
    base = Fraction(ka, kb)
    if aa is None:
        got = base * ab
        assert got.denominator == 1 and Fraction(int(got), ab) == base
        got, scale, dirn = int(got), Fraction(ab, kb), 'bottom'
    else:
        got = Fraction(aa) / base
        assert got.denominator == 1 and Fraction(aa, int(got)) == base
        got, scale, dirn = int(got), Fraction(aa, ka), 'top'
    assert scale.denominator == 1 or (1 / scale).denominator == 1
    if scale >= 1:
        step = ('the %s has been multiplied by %s, so multiply the other one by %s too'
                % (dirn, scale, scale))
    else:
        step = ('the %s has been divided by %s, so divide the other one by %s too'
                % (dirn, 1 / scale, 1 / scale))
    Q.append((str(n), '<p>Find the missing number.</p><p>%s = %s</p>' % (top(ka, kb),
                                                                        hole(aa, ab)),
              '<b>%d</b> &mdash; %s.' % (got, step), str(got)))


def simplify(n, a, b):
    got = Fraction(a, b)
    g = a // got.numerator
    assert g == b // got.denominator and g > 1
    Q.append((str(n), '<p>Simplify %s</p>' % top(a, b),
              '<b>%s</b> &mdash; %d and %d both divide by %d: %d &divide; %d = %d and %d &divide; '
              '%d = %d.' % (top(got.numerator, got.denominator), a, b, g, a, g, got.numerator,
                            b, g, got.denominator),
              '%d/%d' % (got.numerator, got.denominator)))


# 1 and 2 -- three equivalent fractions with two numbers left out of them.
assert Fraction(2, 6) == Fraction(1, 3) and Fraction(4, 12) == Fraction(1, 3)
Q.append(('1', '<p>These diagrams show three equivalent fractions: a circle in thirds with one '
               'part shaded, the same circle in sixths with two parts shaded, and the same circle '
               'in twelfths.</p><p>Write in the missing numbers.</p>'
               '<p>%s = %s = %s</p>' % (top(1, 3), hole(2, None), hole(None, 12)),
          '<b>%s and %s</b> &mdash; each circle is cut into twice as many parts as the one before, '
          'so double the top and the bottom each time: %s, then %s, then %s.'
          % (top(2, 6), top(4, 12), top(1, 3), top(2, 6), top(4, 12)), ''))

assert Fraction(4, 5) == Fraction(8, 10) == Fraction(12, 15)
Q.append(('2', '<p>These diagrams show three equivalent fractions: a bar in fifths with four parts '
               'shaded, the same bar in tenths with eight parts shaded, and the same bar in '
               'fifteenths.</p><p>Write in the missing numbers.</p>'
               '<p>%s = %s = %s</p>' % (hole(4, None), top(8, 10), hole(None, 15)),
          '<b>%s and %s</b> &mdash; %s halves down to %s, and three times %s is %s.'
          % (top(4, 5), top(12, 15), top(8, 10), top(4, 5), top(4, 5), top(12, 15)), ''))

missing(3, (2, 3), (None, 6))
missing(4, (1, 5), (None, 20))
missing(5, (5, 7), (10, None))
missing(6, (15, 25), (None, 5))
missing(7, (12, 21), (4, None))
missing(8, (3, 8), (9, None))
simplify(9, 6, 8)
simplify(10, 9, 15)
simplify(11, 18, 22)

rain = Fraction(12, 20)
assert rain == Fraction(3, 5)
Q.append(('12', '<p>Over 20 days in February, it rained on 12 days.</p><p>What fraction of the '
                'days were rainy? Simplify your answer.</p>',
          '<b>%s</b> &mdash; 12 rainy days out of 20 is %s, and 12 and 20 both divide by 4: '
          '12 &divide; 4 = 3 and 20 &divide; 4 = 5.' % (top(3, 5), top(12, 20)), '3/5'))

THREE = [(6, 10), (9, 15), (12, 20)]
for a, b in THREE:
    assert Fraction(a, b) == Fraction(3, 5)
Q.append(('13', '<p>Write down 3 different fractions that are equivalent to %s</p>' % top(3, 5),
          '<b>%s</b> &mdash; any three will do: multiply the top and the bottom of %s by the same '
          'number, 2, 3 and 4 here. There are infinitely many.'
          % (', '.join(top(a, b) for a, b in THREE), top(3, 5)), ''))

CARDS14 = [(2, 3), (12, 15), (9, 12), (16, 20), (6, 10)]
pairs14 = [c for c in CARDS14 if sum(1 for d in CARDS14
                                     if Fraction(*d) == Fraction(*c)) > 1]
assert pairs14 == [(12, 15), (16, 20)] and Fraction(12, 15) == Fraction(4, 5)
Q.append(('14', '<p>Two of the fractions are equivalent. Circle the equivalent fractions.</p>'
                '<p>%s</p>' % ' &nbsp; '.join(top(a, b) for a, b in CARDS14),
          '<b>%s and %s</b> &mdash; both simplify to %s. The others are %s, %s and %s.'
          % (top(12, 15), top(16, 20), top(4, 5), top(2, 3), top(3, 4), top(3, 5)), ''))

CARDS15 = [(14, 21), (20, 33), (15, 25), (12, 18)]
odd = [c for c in CARDS15 if Fraction(*c) != Fraction(2, 3)]
assert odd == [(20, 33), (15, 25)]
Q.append(('15', '<p>Circle the two fractions that are <b>not</b> equivalent to %s</p><p>%s</p>'
                % (top(2, 3), ' &nbsp; '.join(top(a, b) for a, b in CARDS15)),
          '<b>%s and %s</b> &mdash; %s simplifies to %s and %s to %s, so both are %s. %s does not '
          'cancel at all, and %s is %s.'
          % (top(20, 33), top(15, 25), top(14, 21), top(2, 3), top(12, 18), top(2, 3), top(2, 3),
             top(20, 33), top(15, 25), top(3, 5)), ''))

COLS, ROWS, SHADED = 8, 6, 14
shaded = Fraction(SHADED, COLS * ROWS)
assert COLS * ROWS == 48 and shaded == Fraction(7, 24)
Q.append(('16', '<p>Here is a rectangle divided into a grid %d squares across and %d squares '
                'down, with %d of those identical squares shaded inside it.</p><p>What fraction '
                'of the rectangle is shaded? Simplify your answer.</p>' % (COLS, ROWS, SHADED),
          '<b>%s</b> &mdash; the rectangle holds %d &times; %d = %d squares, so %s are shaded, '
          'and 14 and 48 both divide by 2.'
          % (top(shaded.numerator, shaded.denominator), COLS, ROWS, COLS * ROWS,
             top(SHADED, COLS * ROWS)), '7/24'))

assert [q[0] for q in Q] == [str(n) for n in range(1, 17)]

# rows whose question is ABOUT a picture the transcription does not have
FIGURE = {'1': 'diagram', '2': 'diagram', '16': 'diagram'}

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
for n, html, answer, accept in Q:
    row = dict(template)
    row.update(row_id='Q-CBM-equivalent-fractions-simplifying-fractions-%s' % n,
               question=n, html=html, answer=answer)
    if accept:
        row['accept'] = accept
    if n in FIGURE:
        row['figure'] = FIGURE[n]
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
print('%s: %d questions with their fractions restored, %d of them carry a picture the '
      'transcription still lacks' % (PAPER, len(built), len(FIGURE)))
