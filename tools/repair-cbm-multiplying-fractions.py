"""Puts the fractions back into the `Multiplying Fractions` worksheet, and answers all 17.

THE SHEET HAD THREE QUESTIONS IN THE LIBRARY AND SEVENTEEN ON THE PAPER. Corbettmaths sets a
fraction as stacked artwork, so the PDF's text layer for this one holds the page numbers, the
copyright line and two sentences -- `1. 2. 3.` and nothing else on four of its pages. Fourteen
questions were never transcribed at all, and the three that were are the three whose words happened
to be text: "Find the area of this rectangle", "Work out the missing number", and Maxi the dog. All
three were missing their numbers.

Read off the rendered pages, which is the method this repository already records for a text layer
that has dropped its maths: extract, find it is not there, then render every page and look.

EVERY ANSWER IS COMPUTED FROM THE TRANSCRIBED QUESTION, never typed beside it. Corbettmaths
publishes no mark scheme for these and does not need to: a product of two fractions is settled by
`Fraction`, exactly. What arithmetic cannot catch is a MISREAD numerator, so the sum and the words
are built from one pair of numbers and the card is rendered from both -- which makes "a question
that says 3/10 and an answer worked from 3/100" a shape that cannot occur rather than one to check.
"""
import json
import pathlib
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
PAPER = 'W-CBM-multiplying-fractions'
SOURCE = 'https://drive.google.com/file/d/1llsub32q9miR3PpPfSe1lxo-9xKgdYjX/view'


def frac(f):
    """A fraction as the paper prints it: a whole number plain, a mixed number with its whole."""
    f = Fraction(f)
    if f.denominator == 1:
        return str(f.numerator)
    if abs(f) < 1:
        return '<sup>%d</sup>&frasl;<sub>%d</sub>' % (f.numerator, f.denominator)
    w, rest = divmod(abs(f.numerator), f.denominator)
    return '%s%d<sup>%d</sup>&frasl;<sub>%d</sub>' % ('&minus;' if f < 0 else '', w, rest,
                                                      f.denominator)


def plain(f):
    """What a child types, which is never an entity. `markFrac_` reads `a/b` and `w a/b`."""
    f = Fraction(f)
    if f.denominator == 1:
        return str(f.numerator)
    if abs(f) < 1:
        return '%d/%d' % (f.numerator, f.denominator)
    w, rest = divmod(abs(f.numerator), f.denominator)
    return '%d %d/%d' % (w, rest, f.denominator)


def product(x, y):
    """The answer and the working, both from the same two numbers.

    THE UNCANCELLED PRODUCT IS SHOWN BEFORE THE CANCELLED ONE, because that is the step the sheet
    is teaching: multiply the tops, multiply the bottoms, then simplify. An answer that only shows
    the simplified form tells a child what to write and not what to do.

    AND A MIXED NUMBER IS TURNED INTO A TOP-HEAVY ONE OUT LOUD. The first version of this went
    straight from `30 x 1 1/2` to "30 x 3 = 90", and there is no 3 anywhere in that question --
    a working with a number in it the child cannot find is worse than no working."""
    x, y = Fraction(x), Fraction(y)
    top, bot = x.numerator * y.numerator, x.denominator * y.denominator
    got = x * y
    assert got == Fraction(top, bot)
    lead = ''
    for f in (x, y):
        if f.denominator != 1 and abs(f) > 1:
            lead += 'first write %s as the top-heavy fraction %d&frasl;%d, then ' % (
                frac(f), f.numerator, f.denominator)
    how = (lead + 'multiply the numerators and multiply the denominators: %d &times; %d = %d over '
           '%d &times; %d = %d' % (x.numerator, y.numerator, top, x.denominator, y.denominator,
                                   bot))
    if got.denominator == 1:
        how += ', and %d &divide; %d = %d' % (top, bot, got)
    elif (top, bot) != (got.numerator, got.denominator):
        how += ', which cancels to %s' % frac(got)
    elif abs(got) > 1:
        how += ', which is %s' % frac(got)
    return got, how


Q = []


def sum_row(n, x, y, shown=None):
    got, how = product(x, y)
    Q.append((n, '<p>%s</p>' % (shown or '%s &times; %s' % (frac(x), frac(y))),
              '<b>%s</b> &mdash; %s.' % (frac(got), how), plain(got)))


sum_row(1, Fraction(1, 2), Fraction(1, 5))
sum_row(2, Fraction(1, 3), Fraction(1, 3))
sum_row(3, Fraction(1, 2), Fraction(3, 4))
sum_row(4, Fraction(3, 4), Fraction(1, 4))
sum_row(5, Fraction(3, 10), Fraction(1, 2))
sum_row(6, Fraction(3, 10), Fraction(5, 6))

area, how = product(Fraction(1, 5), Fraction(7, 9))
assert area == Fraction(7, 45)
Q.append((7, '<p>A rectangle is %s m wide and %s m tall.</p><p>Find the area of this rectangle. '
             'Give your answer in m<sup>2</sup>.</p>' % (frac(Fraction(7, 9)),
                                                        frac(Fraction(1, 5))),
          '<b>%s m<sup>2</sup></b> &mdash; the area of a rectangle is its two sides multiplied, so '
          '%s &times; %s: %s.' % (frac(area), frac(Fraction(1, 5)), frac(Fraction(7, 9)), how),
          plain(area)))

# 8 is a DIVISION dressed as a multiplication, which is why it is on this sheet: the box divided by
# 7/15 gives 2/3, so the box is 2/3 OF 7/15 -- multiply to undo the division.
box, how = product(Fraction(2, 3), Fraction(7, 15))
assert box / Fraction(7, 15) == Fraction(2, 3)
Q.append((8, '<p>Work out the missing number.</p><p>&#9633; &divide; %s = %s</p>'
             % (frac(Fraction(7, 15)), frac(Fraction(2, 3))),
          '<b>%s</b> &mdash; dividing by %s gave %s, so the missing number is %s of %s: %s. Check '
          'it: %s &divide; %s = %s.'
          % (frac(box), frac(Fraction(7, 15)), frac(Fraction(2, 3)), frac(Fraction(2, 3)),
             frac(Fraction(7, 15)), how, frac(box), frac(Fraction(7, 15)),
             frac(Fraction(2, 3))),
          plain(box)))

sum_row(9, Fraction(1, 5), 3)
sum_row(10, 7, Fraction(1, 8))
sum_row(11, 30, Fraction(1, 2))
sum_row(12, Fraction(4, 5), 20)
sum_row(13, Fraction(1, 5), 360)

cans, how = product(Fraction(2, 3), 12)
assert cans == 8
Q.append((14, '<p>Alexis has a pet dog, Maxi. Each day Maxi eats %s of a can of dog food.</p>'
              '<p>How many cans of dog food should Alexis buy to last 12 days?</p>'
              % frac(Fraction(2, 3)),
          '<b>8 cans</b> &mdash; twelve days at %s of a can each is %s &times; 12: %s.'
          % (frac(Fraction(2, 3)), frac(Fraction(2, 3)), how), '8'))

sum_row(15, 30, Fraction(3, 2))
sum_row(16, Fraction(3, 2), 13)
sum_row(17, 53, Fraction(5, 2))

assert [q[0] for q in Q] == list(range(1, 18))
# the three the paper prints as mixed numbers, checked in the form a child reads them
assert Fraction(3, 2) == 1 + Fraction(1, 2) and Fraction(5, 2) == 2 + Fraction(1, 2)
assert plain(Fraction(39, 2)) == '19 1/2' and plain(Fraction(265, 2)) == '132 1/2'

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
    row.update(row_id='Q-CBM-multiplying-fractions-%d' % n, question=str(n), html=html,
               answer=answer, accept=accept)
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

missing = [rid for rid in built if rid not in seen]
if missing:
    if not out[-2].endswith(','):
        out[-2] += ','
    order = sorted(missing, key=lambda r: int(r.rsplit('-', 1)[1]))
    for i, rid in enumerate(order):
        out.insert(-1, json.dumps(built[rid]) + (',' if i < len(order) - 1 else ''))
    if out[-2].endswith(','):
        out[-2] = out[-2][:-1]

FILE.write_text('\n'.join(out) + '\n')
print('%s: %d questions with their fractions restored, %d of them rows that never existed (%s)'
      % (PAPER, len(built), len(missing),
         ', '.join(r.rsplit('-', 1)[1] for r in sorted(missing, key=lambda r: int(r.rsplit('-', 1)[1])))))
