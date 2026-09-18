"""Repairs and answers the Corbettmaths `Inequality Signs` worksheet.

THE ROW NUMBERS WERE OFF BY ONE FROM QUESTION 2 ONWARDS, AND NOTHING COULD HAVE SEEN IT. The sheet
has six questions; the library had five rows, numbered 1, 3, 4, 5 and 6. What it called row 3 held
question 2 -- the three four-digit comparisons -- with question 3's INSTRUCTION stuck on the end of
it, and question 3 itself, the right-or-wrong statements, was never transcribed at all. Every one
of those rows is valid markup with plausible content; only the paper shows the gap.

AND QUESTION 6's PAIRS WERE SCRAMBLED. The paper prints two columns, `left [] right`, four rows
down. The transcription read the left column then the right, so the row said `75 x 12 | 4³ |
4x3x2x1x0 | 2-3 | 30 x 40 | ...` -- eight true expressions in an order that pairs none of them
correctly, and an answer worked from it would have been wrong four times out of four. Read off the
rendered page, which is the only thing that shows a two-column layout.

EVERY COMPARISON IS EVALUATED, NOT EYEBALLED. The sign is computed from the two sides, so the
answer cannot disagree with the question printed above it -- and question 6 needs it: `2 - 3` is
MINUS ONE and `20 - 30` is minus ten, so the bigger-looking subtraction is the smaller number.
"""
import json
import pathlib

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
PAPER = 'W-CBM-inequality-signs'
SOURCE = 'https://drive.google.com/file/d/1i6MWXEvooVtmY4jq0sGpvD-cn9hVfdtv/view'


def sign(a, b):
    return '&gt;' if a > b else ('&lt;' if a < b else '=')


def plainsign(a, b):
    return '>' if a > b else ('<' if a < b else '=')


def compare(n, instruction, pairs):
    """`pairs` is (left shown, left value, right shown, right value)."""
    rows = ''.join('<p>%s &nbsp;<b>&#9633;</b>&nbsp; %s</p>' % (ls, rs) for ls, _, rs, _ in pairs)
    signs = [sign(lv, rv) for _, lv, _, rv in pairs]
    def side(shown, value):
        # only spell the value out when the box does not already print it -- `14 = 14` is noise
        return shown if shown.replace(',', '') == str(value) else '%s = %s' % (shown, value)
    how = '; '.join('%s %s %s' % (side(ls, lv), s, side(rs, rv))
                    for (ls, lv, rs, rv), s in zip(pairs, signs))
    return (str(n), '<p>%s</p>%s' % (instruction, rows),
            '<b>%s</b> &mdash; %s.' % (' &nbsp; '.join(signs), how),
            ' '.join(plainsign(lv, rv) for _, lv, _, rv in pairs))


SYMBOLS = 'Write the correct symbol in each box to make the statements correct.'
SIGNS = 'Write the correct sign &gt; or &lt; in each box.'

Q = [
    compare(1, SYMBOLS, [('14', 14, '16', 16), ('20', 20, '19', 19), ('58', 58, '55', 55),
                         ('99', 99, '101', 101), ('151', 151, '149', 149)]),
    compare(2, SIGNS, [('1,098', 1098, '1,100', 1100), ('6,821', 6821, '6,812', 6812),
                       ('9,999', 9999, '10,000', 10000)]),
]

# 3 -- the one the library never had. The signs are PRINTED here and the child says right or wrong.
STATED = [('81', 81, '&lt;', '83', 83), ('112', 112, '&lt;', '110', 110),
          ('148', 148, '&gt;', '149', 149)]
marks = ['&#10003;' if (plainsign(lv, rv) == ('<' if s == '&lt;' else '>')) else '&#10007;'
         for _, lv, s, _, rv in STATED]
assert marks == ['&#10003;', '&#10007;', '&#10007;']
Q.append(('3',
          '<p>Show if each statement is right (&#10003;) or wrong (&#10007;).</p>'
          + ''.join('<p>%s %s %s &nbsp;&nbsp; <b>&#9633;</b></p>' % (ls, s, rs)
                    for ls, _, s, rs, _ in STATED),
          '<b>&#10003; &nbsp; &#10007; &nbsp; &#10007;</b> &mdash; 81 really is less than 83, so '
          'that one is right. 112 is MORE than 110 and 148 is LESS than 149, so the other two are '
          'wrong.', None))

Q.append(compare(4, SIGNS, [('6.8', 6.8, '6.7', 6.7), ('2.4', 2.4, '2.5', 2.5),
                            ('8.21', 8.21, '8.9', 8.9), ('1.23', 1.23, '1.2', 1.2)]))
Q.append(compare(5, SYMBOLS, [('12 &times; 12', 144, '14 &times; 10', 140),
                              ('80 &divide; 20', 4, '75 &divide; 25', 3),
                              ('60 &times; 4', 240, '3 &times; 80', 240),
                              ('120 &divide; 5', 24, '5<sup>2</sup>', 25)]))
Q.append(compare(6, SYMBOLS, [('75 &times; 12', 900, '30 &times; 40', 1200),
                              ('4<sup>3</sup>', 64, '50 + 6 &times; 2', 62),
                              ('4 &times; 3 &times; 2 &times; 1 &times; 0', 0,
                               '4,444 &divide; 4,444', 1),
                              ('2 &minus; 3', -3 + 2, '20 &minus; 30', -30 + 20)]))

assert [q[0] for q in Q] == ['1', '2', '3', '4', '5', '6']
# the arithmetic each comparison rests on, asserted rather than trusted
assert 12 * 12 == 144 and 14 * 10 == 140 and 80 // 20 == 4 and 75 // 25 == 3
assert 60 * 4 == 3 * 80 == 240 and 120 // 5 == 24 and 5 ** 2 == 25
assert 75 * 12 == 900 and 30 * 40 == 1200 and 4 ** 3 == 64 and 50 + 6 * 2 == 62
assert 4 * 3 * 2 * 1 * 0 == 0 and 4444 // 4444 == 1 and 2 - 3 == -1 and 20 - 30 == -10

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
assert template

built, order = {}, []
for n, html, answer, accept in Q:
    row = dict(template)
    row.update(row_id='Q-CBM-inequality-signs-%s' % n, question=n, html=html, answer=answer)
    if accept:
        row['accept'] = accept
    built[row['row_id']] = row
    order.append(row['row_id'])

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

missing = [rid for rid in order if rid not in seen]
if missing:
    if not out[-2].endswith(','):
        out[-2] += ','
    for i, rid in enumerate(missing):
        out.insert(-1, json.dumps(built[rid]) + (',' if i < len(missing) - 1 else ''))
    if out[-2].endswith(','):
        out[-2] = out[-2][:-1]

FILE.write_text('\n'.join(out) + '\n')
print('%s: 6 questions re-cut from the paper and answered, %d of them rows that never existed (%s)'
      % (PAPER, len(missing), ', '.join(r.rsplit('-', 1)[1] for r in missing)))
