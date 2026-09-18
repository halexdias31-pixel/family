"""Puts the fractions back into the `Fraction of Amounts` worksheet, and answers it.

THE QUESTIONS HAD NO FRACTIONS IN THEM. Corbettmaths sets a fraction as stacked artwork, so the
PDF's text layer holds `Work out      of 24` and nothing else -- this repository already records
that fault for two other sheets and fixed those; this one was never done. Fourteen questions had
been sitting in the library asking a child to work out nothing of 24.

AND THE ROWS WERE MIS-SPLIT. Page 2 of the PDF holds questions 1, 2 and 3, and the transcription
made it ONE row: "Work out of 24 Work out of 18 Work out of 60". Four row ids were simply never
created. So this is a repair of the sheet's shape as well as its content -- 10 rows become 14.

Read off the rendered pages, which is the method this repository already records for a text layer
that has dropped its maths: extract, find it is not there, then render every page and look.
Every answer is computed with Fraction from the transcribed question, so a misread numerator and
a wrong answer cannot come apart.
"""
import json
import pathlib
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
PAPER = 'W-CBM-fraction-of-amounts'
SOURCE = 'https://drive.google.com/file/d/1NihcZRPWAYjtCDwGmrvykEqGw_hx3MHg/view'


def frac(a, b):
    return '<sup>%d</sup>&frasl;<sub>%d</sub>' % (a, b)


def of(a, b, n, unit=''):
    """`a/b of n`, with the answer and the two-step method both derived from the same numbers."""
    one = Fraction(n, b)
    whole = Fraction(a * n, b)
    assert whole.denominator == 1, (a, b, n)
    step = ('%s &divide; %d = %s' % ('{:,}'.format(n), b, '{:,}'.format(int(one)))
            if one.denominator == 1 else '%s &divide; %d' % ('{:,}'.format(n), b))
    if a == 1:
        return int(whole), '%s of %s is %s.' % (frac(a, b), '{:,}'.format(n), step)
    return int(whole), ('one %s is %s, and there are %d of them: %s &times; %d = %s.'
                        % ({2: 'half', 3: 'third', 4: 'quarter', 5: 'fifth', 7: 'seventh',
                            8: 'eighth', 9: 'ninth'}[b], step, a, '{:,}'.format(int(one)), a,
                           '{:,}'.format(int(whole))))


# (question number, the html the paper prints, the answer, the accept value)
Q = []


def plain(n, a, b, amount, unit=''):
    got, how = of(a, b, amount)
    Q.append((n, '<p>Work out %s of %s</p>' % (frac(a, b), '{:,}'.format(amount)),
              '<b>%s%s</b> &mdash; %s' % (unit, '{:,}'.format(got), how), str(got)))


plain(1, 1, 4, 24)
plain(2, 1, 3, 18)
plain(3, 1, 5, 60)
plain(4, 2, 3, 15)
plain(5, 3, 4, 36)
plain(6, 2, 5, 40)
plain(7, 6, 7, 56)

red, how = of(3, 4, 20)
assert red == 15
Q.append((8, '<p>James has 20 sweets.</p><p>%s of the sweets are red.</p>'
             '<p>How many sweets are red?</p>' % frac(3, 4),
          '<b>15</b> &mdash; %s' % how, '15'))

glasses, how = of(2, 9, 27)
assert glasses == 6 and 27 - glasses == 21
Q.append((9, '<p>In a class, there are 27 children.</p><p>%s of the children wear glasses.</p>'
             '<p>How many children do <b>not</b> wear glasses?</p>' % frac(2, 9),
          '<b>21</b> &mdash; %s So 6 wear glasses, and 27 &minus; 6 = 21 do not. The question '
          'asks for the ones who do NOT, so the fraction answer is an intermediate step and not '
          'the answer.' % how, '21'))

pages, how = of(3, 5, 120)
assert pages == 72
Q.append((10, '<p>Raphael has a book with 120 pages.</p><p>He has read %s of the pages in his '
              'book.</p><p>How many pages has Raphael read?</p>' % frac(3, 5),
          '<b>72</b> &mdash; %s' % how, '72'))

slept, how = of(3, 8, 24)
assert slept == 9
Q.append((11, '<p>On Saturday, Victoria slept for %s of the day.</p>'
              '<p>How many hours did Victoria sleep on Saturday?</p>' % frac(3, 8),
          '<b>9 hours</b> &mdash; a day is 24 hours, and %s The 24 is not printed anywhere in the '
          'question: knowing it is the part of this one that is not arithmetic.' % how, '9'))

bank, how = of(2, 5, 3000)
assert bank == 1200
Q.append((12, '<p>Declan has &pound;3,000</p><p>He puts %s of the money in the bank.</p>'
              '<p>How much money did Declan put in the bank?</p>' % frac(2, 5),
          '<b>&pound;1,200</b> &mdash; %s' % how, '1200'))

kids, how = of(3, 7, 1526)
assert kids == 654
Q.append((13, '<p>There are 1,526 fans at a football match.</p><p>%s of the fans are children.</p>'
              '<p>How many children attended the football match?</p>' % frac(3, 7),
          '<b>654</b> &mdash; %s' % how, '654'))

tyre = Fraction(1, 5) * 450
guitar = Fraction(2, 3) * 450
assert tyre == 90 and guitar == 300 and 450 - tyre - guitar == 60
Q.append((14, '<p>Shane has saved &pound;450</p><p>He spends %s of the &pound;450 on a new tyre '
              'for his car.</p><p>He spends %s of the &pound;450 on a new guitar.</p>'
              '<p>How much money does Shane have left?</p>' % (frac(1, 5), frac(2, 3)),
          '<b>&pound;60</b> &mdash; the tyre is 450 &divide; 5 = &pound;90 and the guitar is '
          '450 &divide; 3 = 150, &times; 2 = &pound;300; together that is &pound;390, and '
          '450 &minus; 390 = &pound;60. BOTH fractions are of the original &pound;450, not of '
          'what is left after the tyre &mdash; the question says so twice and it is the trap.',
          '60'))

assert [q[0] for q in Q] == list(range(1, 15))

# ---- write ------------------------------------------------------------------------------------
lines = FILE.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
template, doc_line = None, None
for i, line in enumerate(lines):
    if '"%s"' % PAPER not in line:
        continue
    row = json.loads(line.rstrip(','))
    if row.get('kind') == 'question' and template is None:
        template = {k: v for k, v in row.items()
                    if k not in ('row_id', 'question', 'html', 'answer', 'accept', 'figure',
                                 'examiner_note')}
    if row.get('kind') == 'document':
        doc_line = i
assert template and doc_line is not None

built = {}
for n, html, answer, accept in Q:
    row = dict(template)
    row['row_id'] = 'Q-CBM-fraction-of-amounts-%d' % n
    row['question'] = str(n)
    row['html'] = html
    row['answer'] = answer
    row['accept'] = accept
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
        # THE SHEET HAD NO LINK TO ITSELF. Every one of the 69 Corbettmaths documents is missing
        # its source_url while the PDF sits in Drive shared `anyone: reader` -- which is the whole
        # point of a resource row.
        row['source_url'] = SOURCE
        out.append(json.dumps(row) + tail)
    else:
        out.append(line)

missing = [rid for rid in built if rid not in seen]
assert lines[-2].endswith('}') or lines[-2].endswith('},')
if missing:
    if not out[-2].endswith(','):
        out[-2] += ','
    for i, rid in enumerate(sorted(missing, key=lambda r: int(r.rsplit('-', 1)[1]))):
        out.insert(-1, json.dumps(built[rid]) + (',' if i < len(missing) - 1 else ''))
    if out[-2].endswith(','):
        out[-2] = out[-2][:-1]

FILE.write_text('\n'.join(out) + '\n')
print('%s: %d questions rewritten with their fractions restored, %d of them new rows (%s)'
      % (PAPER, len(built), len(missing), ', '.join(sorted(missing)) or 'none'))
