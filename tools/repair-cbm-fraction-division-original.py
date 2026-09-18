"""Puts the fractions back into `Fractions: Division` and `Fractions: Finding the Original Amount`.

`Fractions: Division` had TWELVE ROWS THAT READ `÷ 3`, `÷ 2`, `÷ 5` and nothing else. Corbettmaths
sets the fraction as stacked artwork and the divisor as ordinary text, so the text layer of every
page is exactly the divisors: `1. 2. 3. ÷ 3 ÷ 2 ÷ 5`. A child opening any of those twelve saw a
division sign and a number with nothing to divide.

`Fractions: Finding the Original Amount` lost six of its eight the same way -- "Jackson is of Sam's
age", "of the children in a class have brown hair" -- where the missing word is the fraction the
whole question turns on.

Read off the rendered pages, and every answer computed from the restored question with `Fraction`.
A fraction divided by a whole number, and a whole recovered from a part, are both exact inverses,
so each answer is CHECKED BACK against the question it came from before it is written.
"""
import json
import pathlib
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'


def top(f):
    f = Fraction(f)
    return '<sup>%d</sup>&frasl;<sub>%d</sub>' % (f.numerator, f.denominator)


def build(paper, source, rows):
    """rows is (question number, html, answer, accept). Every row must already exist."""
    lines = FILE.read_text().rstrip('\n').split('\n')
    assert lines[0] == '[' and lines[-1] == ']'
    ids = {'Q-%s-%s' % (paper.replace('W-CBM-', 'CBM-'), n) for n, _, _, _ in rows}
    out, seen = [], set()
    for line in lines:
        if '"row_id"' not in line:
            out.append(line)
            continue
        row = json.loads(line.rstrip(','))
        tail = ',' if line.endswith(',') else ''
        if row['row_id'] in ids:
            n = row['row_id'].rsplit('-', 1)[1]
            _, html, answer, accept = next(r for r in rows if r[0] == n)
            row['html'] = html
            row['answer'] = answer
            if accept:
                row['accept'] = accept
            seen.add(row['row_id'])
            out.append(json.dumps(row) + tail)
        elif row.get('paper_id') == paper and row.get('kind') == 'document':
            row['source_url'] = source
            out.append(json.dumps(row) + tail)
        else:
            out.append(line)
    assert seen == ids, 'rows that do not exist: %r' % sorted(ids - seen)
    FILE.write_text('\n'.join(out) + '\n')
    print('%s: %d questions with their fractions restored and answered' % (paper, len(rows)))


# =================================================================================================
# FRACTIONS: DIVISION -- a/b divided by a whole number.
# =================================================================================================
DIV = [(1, 3, 7, 3), (2, 2, 3, 2), (3, 5, 9, 5), (4, 9, 10, 3), (5, 4, 11, 2), (6, 6, 7, 3),
       (7, 1, 3, 2), (8, 1, 4, 3), (9, 1, 2, 10), (10, 5, 8, 2), (11, 3, 10, 2), (12, 4, 5, 3)]
R1 = []
for n, a, b, d in DIV:
    got = Fraction(a, b) / d
    assert got * d == Fraction(a, b), 'question %d does not come back' % n
    if a % d == 0:                       # the numerator divides, so the bottom does not change
        how = ('%d divides by %d, so only the top changes: %d &divide; %d = %d, which leaves %s'
               % (a, d, a, d, a // d, top(got)))
    else:                                # cut every part into d, so the bottom is multiplied
        how = ('%d does not divide by %d, so cut each part into %d instead: the bottom becomes '
               '%d &times; %d = %d and the top stays %d, which gives %s'
               % (a, d, d, b, d, b * d, a, top(got)))
    R1.append((str(n), '<p>%s &divide; %d</p>' % (top(Fraction(a, b)), d),
               '<b>%s</b> &mdash; %s.' % (top(got), how),
               '%d/%d' % (got.numerator, got.denominator)))

build('W-CBM-fractions-division',
      'https://drive.google.com/file/d/1JRUqHaxJ_N8XT3kuy_blm9xSh45vgSD-/view', R1)

# =================================================================================================
# FINDING THE ORIGINAL AMOUNT -- a part is given, the whole is wanted.
# =================================================================================================
R2 = []


def whole(n, html, part_of, part, answer_text, accept, how):
    got = Fraction(part) / Fraction(part_of)
    assert Fraction(part_of) * got == Fraction(part), 'question %d does not come back' % n
    R2.append((str(n), html, '<b>%s</b> &mdash; %s.' % (answer_text, how), accept))
    return got


assert whole(1, '<p>Harry thinks of a <b>whole</b> number. He works out <b>one-quarter</b> of the '
                'number. The result is 20.</p><p>What was the number that Harry started with?</p>',
             Fraction(1, 4), 20, '80', '80',
             'a quarter of the number is 20, so the whole number is 4 &times; 20 = 80') == 80
assert whole(2, '<p>%s of the children in a class have brown hair. 7 children in the class have '
                'brown hair.</p><p>How many children are in the class?</p>' % top(Fraction(1, 3)),
             Fraction(1, 3), 7, '21', '21',
             'a third of the class is 7, so the class is 3 &times; 7 = 21') == 21
assert whole(3, '<p>Jackson is %s of Sam&rsquo;s age. Jackson is 12 years old.</p><p>How old is '
                'Sam?</p>' % top(Fraction(1, 5)),
             Fraction(1, 5), 12, '60', '60',
             'Jackson is a fifth of Sam, so Sam is 5 &times; 12 = 60') == 60
assert whole(4, '<p>In Year 6, %s of the children are right handed. There are 16 children that are '
                'left handed in Year 6.</p><p>How many children are in Year 6?</p>'
                % top(Fraction(3, 4)),
             Fraction(1, 4), 16, '64', '64',
             'three quarters are right handed, so the 16 left-handers are the other QUARTER, and '
             'the year group is 4 &times; 16 = 64. The three quarters is there to be gone past')
assert whole(5, '<p>Kyle had some money. He spent &pound;12.50 on a ticket to a football match. He '
                'spent &pound;6 on a scarf. He has <b>two-thirds</b> of his money left.</p>'
                '<p>How much money did Kyle have to start with?</p>',
             Fraction(1, 3), Fraction('18.5'), '&pound;55.50', '55.50',
             'he spent 12.50 + 6 = &pound;18.50, and with two thirds left that spending is the '
             'other THIRD, so he started with 3 &times; 18.50 = &pound;55.50')
barry = Fraction(4) / Fraction(1, 3)
neville = barry / Fraction(1, 6)
assert barry == 12 and neville == 72
R2.append(('6', '<p>Rebecca is %s of Barry&rsquo;s age. Barry is %s of Neville&rsquo;s age. '
                'Rebecca is 4 years old.</p><p>How old is Neville?</p>'
                % (top(Fraction(1, 3)), top(Fraction(1, 6))),
           '<b>72</b> &mdash; Rebecca is a third of Barry, so Barry is 3 &times; 4 = 12. Barry is '
           'a sixth of Neville, so Neville is 6 &times; 12 = 72. Two steps, and the second one '
           'uses the answer to the first.', '72'))
assert whole(7, '<p>A new snack bar contains 9 g of sugar. %s of the snack bar is sugar.</p>'
                '<p>Work out the mass of the snack bar.</p>' % top(Fraction(3, 10)),
             Fraction(3, 10), 9, '30 g', '30',
             'three tenths of the bar is 9 g, so one tenth is 9 &divide; 3 = 3 g, and the whole '
             'bar is 10 &times; 3 = 30 g') == 30
assert whole(8, '<p>On Monday, Beth read %s of her book. On Tuesday she read the other 42 pages to '
                'finish her book.</p><p>How many pages are there in Beth&rsquo;s book?</p>'
                % top(Fraction(7, 10)),
             Fraction(3, 10), 42, '140', '140',
             'she read seven tenths on Monday, so the 42 pages are the other THREE tenths. One '
             'tenth is 42 &divide; 3 = 14, so the book is 10 &times; 14 = 140 pages') == 140

assert [r[0] for r in R2] == [str(n) for n in range(1, 9)]
build('W-CBM-fractions-finding-the-original-amount',
      'https://drive.google.com/file/d/1UJjCaqzvLMmQPtEOZrBEs6Ec4voZ9gi9/view', R2)
