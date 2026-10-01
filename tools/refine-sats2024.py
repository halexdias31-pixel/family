"""
KS2 SATs MATHEMATICS MAY 2024, PAPERS 1, 2 AND 3 -- WHAT CAN BE REPAIRED WITHOUT THE PAPER.

ASKED FOR AS *"the papers i do typically something is always wrong like your diagrams or
something. i just want it to be good."*

THE PAPER IS NOT IN DRIVE, AND THAT DECIDES THE SHAPE OF THIS SCRIPT. Searched by title, by folder
(SATs Maths / Past Papers / gov / 2024 holds only the KS1 2024 papers) and by full text; the KS2
2019 papers and their scheme are there and the 2024 ones are not. Every gov.uk host is blocked from
this environment. So CLAUDE.md's rule is the whole rule here: only what the row's own words, or
arithmetic over them, can prove. Nothing below invents a number the paper prints.

WHAT THAT LEAVES, and every change is asserted before a row is written:

  * Two document rows had no `total_marks`. Both reasoning papers are out of 35, and the question
    rows already sum to 35 on each -- asserted, so the total arms the check against a dropped part.

  * Paper 1 Q6, Q12 and Q15 lost their answer box. Each reads "= 9,171 - 530": the box the
    answer is written in sits BEFORE the equals sign on the paper, and the transcription kept the
    sign and dropped the box, so the card opened on a bare "=". The box is put back where the sign
    says it was. Their answers are recomputed.

  * Seven tables were sentences ("Table of ... Row 1 done: ..."). A table is not a picture -- the
    values are all in the row, so they are set as tables, with a box where the paper leaves a gap.

  * The Paper 3 Q14 pie chart and the Paper 2 Q18 scale are DRAWN, each with one choice made
    here that cannot move the answer, said in `examiner_note` and credited `family` -- the numbers are the paper's; the credit line `family-set` prints is written about chosen coins, so it would overclaim here.

  * Five `accept` cells were wrong in one direction or the other (see ACCEPTS).

WHAT IS NOT REPAIRED, because the row cannot settle it and guessing is the fault being fixed:
P1 Q21 (the index is lost), P1 Q36 (34234 / 7 leaves 4, so a digit is misread), P2 Q1, Q3, Q12,
Q21, P3 Q1, Q8, Q10(a), Q10(b), Q20 (pictures with no data in the row), P2 Q5, P3 Q11, Q19
(flattened digit puzzles with no consistent reading), P2 Q25 (the equation and the two values do
not fit). Each keeps the `examiner_note` that says so.

RUN ONCE: it refuses a file it has already changed, because refusing is cheaper than repairing.
"""
import json
import math
import os
import re
import sys
from fractions import Fraction

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from svgplot import W                  # noqa: E402  every drawing is 340 wide
except ImportError:                        # run from outside tools/: the same constant
    W = 340
assert W == 340

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# The file to change: the argument if one is given, else this repository's own library.
FILE = (sys.argv[1] if len(sys.argv) > 1
        else os.path.join(HERE, 'data', 'questions.json'))
ID = lambda s: 'Q-STA-KS2-2024-%s' % s     # noqa: E731
BOX = "<span class='box'>&nbsp;&nbsp;&nbsp;&nbsp;</span>"
MARKER = 'refine-sats2024'                 # written into a note so a second run can see the first


def svg(body, h, label):
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>' % (W, h, label, body))


def line(x1, y1, x2, y2, w=1.4):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
            'stroke-width="%.1f"/>' % (x1, y1, x2, y2, w))


def txt(x, y, s, cls='num', anchor='middle'):
    """Inline style rather than `text-anchor=`: CSS beats the presentation attribute."""
    return ('<text x="%.1f" y="%.1f" class="%s" style="text-anchor:%s">%s</text>'
            % (x, y, cls, anchor, s))


def table(head, rows, tight=False):
    """`tight` for a four-column table: at the stylesheet's own padding the fourth column of P2 Q11
       ran off a 320px card and had to be scrolled to -- the column holding one of the two answer
       boxes. A screenshot caught it. Narrower padding and a slightly smaller face fit it whole."""
    c = ' style="padding:.3rem .35rem"' if tight else ''
    h = ''.join('<th scope="col"%s>%s</th>' % (c, x) for x in head)
    b = ''.join('<tr><th scope="row"%s>%s</th>%s</tr>'
                % (c, r[0], ''.join('<td%s>%s</td>' % (c, x) for x in r[1:])) for r in rows)
    t = '<table style="font-size:.86em">' if tight else '<table>'
    return '%s<thead><tr>%s</tr></thead><tbody>%s</tbody></table>' % (t, h, b)


# ================================================================================================
# PAPER 1  --  the three boxes, and every answer on the paper recomputed while we are here
# ================================================================================================
P1_LEADING_BOX = {'6': (9171, '-', 530), '12': (357, '-', 89), '15': (630, '/', 7)}
P1_ANS = {'6': 8641, '12': 268, '15': 90}
for q, (a, op, b) in P1_LEADING_BOX.items():
    v = a - b if op == '-' else Fraction(a, b)
    assert v == P1_ANS[q], (q, v)


def p1_html(q):
    a, op, b = P1_LEADING_BOX[q]
    sym = '&minus;' if op == '-' else '&divide;'
    return '<p>%s = %s %s %s</p>' % (BOX, '{:,}'.format(a), sym, '{:,}'.format(b))


# ================================================================================================
# THE TABLES -- each one is the lead's own sentence, set as the table it describes
# ================================================================================================
FRUIT = [('Banana', 12), ('Plum', 23), ('Apple', 32), ('Pear', 38)]
pairs = [(x, y) for i, x in enumerate(FRUIT) for y in FRUIT[i + 1:] if x[1] + y[1] == 200 - 150]
assert [(x[0], y[0]) for x, y in pairs] == [('Banana', 'Pear')], pairs     # P2 Q2's own answer
T_P2_2 = table(['Fruit', 'Cost'], [[f, '%dp' % p] for f, p in FRUIT])

# P2 Q11: the completed top row is what tells you the last column is children divided by adults.
CARE = [('1 and under', 12, 4, 3), ('2 or 3', 20, 4, None), ('4 or 5', None, 3, 8)]
assert CARE[0][1] / CARE[0][2] == CARE[0][3]
P2_11 = (CARE[1][1] // CARE[1][2], CARE[2][2] * CARE[2][3])
assert P2_11 == (5, 24) and CARE[1][1] % CARE[1][2] == 0
T_P2_11 = table(['Age', 'Children', 'Adults', 'Children per adult'],
                [[a, str(c) if c else BOX, str(d), str(e) if e else BOX] for a, c, d, e in CARE],
                tight=True)

FRIENDS = [('Amina', '1.8'), ('William', '2.4'), ('Layla', '3.2'), ('Chen', '1.6'), ('Dev', '4.5')]
assert sum(Fraction(d) for _, d in FRIENDS) / 5 == Fraction('2.7')            # P2 Q22's answer
T_P2_22 = table(['Name', 'Distance (km)'], [list(r) for r in FRIENDS])

WEEKS = [(1, 7), (2, 14), (4, 28), (6, None), (10, None), (None, 105)]
assert all(d == w * 7 for w, d in WEEKS if w and d)
P3_9 = (6 * 7, 10 * 7, 105 // 7)
assert P3_9 == (42, 70, 15) and 105 % 7 == 0
T_P3_9 = table(['Weeks', 'Days'], [[str(w) if w else BOX, str(d) if d else BOX] for w, d in WEEKS])

PIE = [('A', 20), ('B', 25), ('C', 15), ('D', 30), ('E', 10)]
assert sum(p for _, p in PIE) == 100
assert [p * 360 // 100 for _, p in PIE] == [72, 90, 54, 108, 36]               # P3 Q14's answer
T_P3_14 = table(['Label', 'Percentage'], [[l, '%d%%' % p] for l, p in PIE])

SOLIDS = [('Cube', 6), ('Pentagonal prism', 2 + 5), ('Triangular-based pyramid', 1 + 3)]
assert [f for _, f in SOLIDS] == [6, 7, 4]
T_P3_23 = table(['Shape', 'Number of faces'], [[s, BOX] for s, _ in SOLIDS])


# ================================================================================================
# THE TWO DRAWINGS
# ================================================================================================
def pie_p3_14():
    """A circle with A (20% = 72 degrees) and B (25% = 90 degrees) drawn, and the rest left for
       the student. The SIZES are the table's; where A starts is chosen here (twelve o'clock,
       clockwise), and no starting angle moves the answer -- the student still has to fit 54,
       108 and 36 degrees into the 198 left."""
    cx, cy, r = W / 2.0, 106.0, 86.0
    pt = lambda deg, rad=r: (cx + rad * math.sin(math.radians(deg)),    # noqa: E731
                             cy - rad * math.cos(math.radians(deg)))
    body = ('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="currentColor" '
            'stroke-width="1.4"/>' % (cx, cy, r))
    edges = [0, 72, 72 + 90]
    for d in edges:
        x, y = pt(d)
        body += line(cx, cy, x, y)
    for lab, mid in (('A', 36), ('B', 72 + 45)):
        x, y = pt(mid, r * 0.58)
        body += txt(x, y + 5, '<tspan class="lbl">%s</tspan>' % lab)
    body += '<circle cx="%.1f" cy="%.1f" r="2.2" fill="currentColor"/>' % (cx, cy)
    return svg(body, 204, 'A pie chart with two sectors drawn from the centre: A, a fifth of the '
                          'circle, and B beside it, a quarter. The rest of the circle is empty.')


SCALE_LO, SCALE_HI, SCALE_STEP = 1000, 2000, 100        # grams
assert SCALE_LO < 1350 < SCALE_HI and (1350 - SCALE_LO) % SCALE_STEP != 0   # it falls between ticks


def scale_p2_18():
    """A weighing scale from 1 kg to 2 kg. The two ends are the row's; the 100 g divisions are
       chosen here. 1350 g is 0.35 of the way along whatever the divisions are, so a student who
       converts correctly puts the arrow in the same place on any version of this scale."""
    x0, x1, y = 34.0, 306.0, 44.0
    n = (SCALE_HI - SCALE_LO) // SCALE_STEP
    body = line(x0, y, x1, y)
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n
        h = 16 if i in (0, n) else (12 if i == n // 2 else 8)
        body += line(x, y, x, y - h, 1.2)
    body += txt(x0, y + 20, '1 kg') + txt(x1, y + 20, '2 kg')
    return svg(body, 74, 'A straight scale marked 1 kg at the left end and 2 kg at the right end, '
                         'divided into ten equal steps with a longer mark half way.')


# ================================================================================================
# WHAT GOES WHERE
# ================================================================================================
CHOSEN = ('Redrawn from the row: %s. The paper itself was not available to copy from, so %s was '
          'chosen here — and that choice cannot change the answer: %s.')

EDITS = {
    'P1-6': dict(html=p1_html('6')),
    'P1-12': dict(html=p1_html('12')),
    'P1-15': dict(html=p1_html('15')),
    'P2-2': dict(lead='<p>This table shows the cost of fruit at a school cafeteria.</p>' + T_P2_2,
                 figure=''),
    'P2-11': dict(lead=T_P2_11, figure='', accept='5, 24',
                  move='This table shows the number of children and adults at a childcare centre.'),
    'P2-18': dict(lead='', diagram=scale_p2_18(), diagram_by='family',
                  examiner_note=CHOSEN % ('a scale from 1 kg to 2 kg', 'the size of each '
                                          'division (100 g)', '1350 g is 1.35 kg, 0.35 of the way '
                                          'from 1 kg to 2 kg on any version of the scale')),
    'P2-22': dict(lead=T_P2_22, figure='',
                  move='This table shows the distance that five friends travel to school each day.'),
    'P3-9': dict(lead=T_P3_9, figure='', accept='42, 70, 15 | 42 days, 70 days and 15 weeks'),
    'P3-14': dict(lead=T_P3_14, move='Look at the data in this table.', diagram=pie_p3_14(), diagram_by='family',
                  examiner_note=CHOSEN % ('A is 20% and B is 25% of the circle, already drawn',
                                          'where sector A starts (at the top, going clockwise)',
                                          'C, D and E still need 54°, 108° and 36° of the '
                                          '198° left, wherever A begins')),
    'P3-23': dict(lead=T_P3_23, figure='',
                  accept='6, 7, 4 | Cube 6, pentagonal prism 7, triangular-based pyramid 4'),
}

# ---- THE ACCEPT CELLS ------------------------------------------------------------------------
#  P2 Q8   any whole number 3,500-4,499 and any 815,000-824,999 is right. One cell cannot hold two
#          bands across two boxes, and "4,000 and 820,000" marked every other right answer WRONG.
#          Empty: a person marks it, which the answer's own prose already explains how to do.
#  P2 Q20  325 minutes is the same answer and the answer says so; it was marked wrong.
#  P3 Q12  "in order starting with the least" -- `markAnswer_` compares a LIST AS A SET, so the
#          four fractions typed in ANY order were marked right. An ordering has no accept.
#  P2 Q11, P3 Q9, P3 Q23  set in EDITS: the old cells were sentences ("5 in the age 2 | 3 row ...",
#          split on the word "or") that nobody types; the bare numbers are what goes in the boxes.
ACCEPTS = {
    'P2-8': '',
    'P2-20': '5 hours 25 minutes | 325 minutes',
    'P3-12': '',
}
for k, v in ACCEPTS.items():
    EDITS.setdefault(k, {})['accept'] = v
assert 65 * 5 == 325 and divmod(325, 60) == (5, 25)
ORDER = [Fraction(1, 5), Fraction(3, 4), Fraction(8, 10), Fraction(7, 8)]
assert ORDER == sorted(ORDER)

TOTALS = {'P2': 35, 'P3': 35}


def main():
    with open(FILE, encoding='utf-8') as f:
        lines = f.read().split('\n')
    rows, marks = {}, {}
    for i, l in enumerate(lines):
        s = l.strip().rstrip(',')
        if not s.startswith('{'):
            continue
        r = json.loads(s)
        rid = r.get('row_id', '')
        if rid.startswith('Q-STA-KS2-2024-') or rid.startswith('D-P-STA-KS2-2024-'):
            rows[rid] = (i, r)
            if r.get('kind') == 'question':
                p = rid[15:17]
                marks[p] = marks.get(p, 0) + int(r.get('marks') or 0)
    if any(MARKER in str(r.get('examiner_note', '')) or '<svg' in str(r.get('diagram', ''))
           for _, r in rows.values()):
        raise SystemExit('refine-sats2024 has already run against this file')
    assert marks == {'P1': 40, 'P2': 35, 'P3': 35}, marks

    for k, ed in EDITS.items():
        i, r = rows[ID(k)]
        for col, v in ed.items():
            if col == 'move':
                continue
            r[col] = v
        if 'move' in ed:
            # THE SENTENCE THAT INTRODUCES THE TABLE GOES ABOVE IT. The lead is drawn before the
            # html, so a table in the lead with "This table shows..." under it reads backwards.
            first = '<p>%s</p>' % ed['move']
            assert r['html'].startswith(first), (k, r['html'][:80])
            r['html'] = r['html'][len(first):]
            r['lead'] = first + r['lead']
        if 'diagram' in ed:
            r['examiner_note'] = r['examiner_note'] + ' [%s]' % MARKER
        lines[i] = json.dumps(r, ensure_ascii=False, separators=(',', ':')) + ','
    for p, t in TOTALS.items():
        i, r = rows['D-P-STA-KS2-2024-' + p]
        assert not r.get('total_marks')
        r['total_marks'] = str(t)
        lines[i] = json.dumps(r, ensure_ascii=False, separators=(',', ':')) + ','

    # a lead that still reads "Table of ..." is a table this script forgot
    for k in EDITS:
        _, r = rows[ID(k)]
        assert not re.match(r'\s*Table', r.get('lead', '')), k
    with open(FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print('KS2 2024: %d rows changed, 2 totals set' % len(EDITS))


if __name__ == '__main__':
    main()
