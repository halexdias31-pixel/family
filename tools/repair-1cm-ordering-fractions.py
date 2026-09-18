"""Puts the fractions back into the 1st Class Maths `Ordering Fractions` worksheet, and answers it.

TWELVE QUESTIONS THAT ALL READ `Here are four fractions. Write these fractions in order of size.`
AND NAMED NO FRACTIONS. Unlike the Corbettmaths sheets this publisher does put its fractions in the
text layer -- but a numerator and its denominator are two separate words on two lines, interleaved
with the question numbers, so the reading order gives `1 2 13 20 3 5 3 4 1` for question 1 and a
transcription that reads straight through gets nothing it can use.

SO THEY WERE EXTRACTED BY POSITION, NOT BY READING ORDER. The four fractions sit on one line at
four x positions; within each position the higher word is the numerator. That is the same method
this repository already records for the Edexcel papers whose text layer flattened the maths --
`positional extraction settles it in advance rather than by suspicion` -- and it was then CHECKED
against all four rendered pages before anything was written, because a mis-paired numerator is a
wrong question that still reads perfectly.

EVERY ANSWER IS THE SORT, not a remembered order: `Fraction` puts the four in order and the answer
is rendered from that, so the question and its answer cannot come apart. The working names the
common denominator, which is what the sheet is teaching -- and it is the LCM of the four, computed
rather than chosen.
"""
import json
import math
import pathlib
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
PAPER = 'W-1CM-ordering-fractions'

# read off the PDF by position, then checked against all four rendered pages
PRINTED = {
    1:  [(1, 2), (3, 4), (3, 5), (13, 20)],
    2:  [(3, 8), (1, 4), (2, 5), (7, 20)],
    3:  [(3, 4), (2, 3), (1, 6), (11, 12)],
    4:  [(4, 9), (1, 2), (1, 6), (1, 3)],
    5:  [(5, 6), (5, 8), (3, 4), (7, 12)],
    6:  [(3, 4), (4, 5), (7, 10), (17, 25)],
    7:  [(2, 3), (1, 2), (5, 9), (5, 8)],
    8:  [(11, 18), (3, 5), (8, 15), (7, 12)],
    9:  [(2, 9), (1, 4), (3, 10), (11, 40)],
    10: [(8, 9), (7, 8), (13, 16), (8, 10)],
    11: [(3, 4), (11, 15), (7, 10), (11, 14)],
    12: [(1, 3), (3, 10), (7, 22), (19, 50)],
}


def top(a, b):
    return '<sup>%d</sup>&frasl;<sub>%d</sub>' % (a, b)


Q = []
for n in sorted(PRINTED):
    four = PRINTED[n]
    vals = [Fraction(a, b) for a, b in four]
    assert len(four) == 4
    assert len(set(vals)) == 4, 'question %d has two fractions of equal value' % n
    order = sorted(four, key=lambda p: Fraction(*p))
    lcm = math.lcm(*[b for _, b in four])
    # THE COMMON DENOMINATOR IS COMPUTED, NOT CHOSEN. 8/10 in question 10 is not in its lowest
    # terms and the paper prints it that way, so the LCM is taken over the denominators AS PRINTED
    # -- which is the number a child working down the page actually has to find.
    over = ['%d' % (Fraction(a, b) * lcm) for a, b in order]
    assert all(Fraction(x) == Fraction(*p) * lcm for x, p in zip(over, order))
    Q.append((str(n),
              '<p>Here are four fractions.</p><p>%s</p><p>Write these fractions in order of size. '
              'Start with the smallest fraction.</p>' % ' &nbsp; '.join(top(a, b) for a, b in four),
              '<b>%s</b> &mdash; put them all over %d: %s. Then the order of the numerators is the '
              'order of the fractions.'
              % (', '.join(top(a, b) for a, b in order), lcm,
                 ', '.join('%s = %s' % (top(a, b), top(int(x), lcm))
                           for (a, b), x in zip(order, over))),
              ' '.join('%d/%d' % p for p in order)))

assert len(Q) == 12

# ---- write ------------------------------------------------------------------------------------
lines = FILE.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
built = {}
out, seen = [], set()
for line in lines:
    if '"row_id"' not in line:
        out.append(line)
        continue
    row = json.loads(line.rstrip(','))
    tail = ',' if line.endswith(',') else ''
    if row.get('paper_id') == PAPER and row.get('kind') == 'question':
        n = row['question']
        html, answer, accept = next((h, a, c) for q, h, a, c in Q if q == n)
        row['html'] = html
        row['answer'] = answer
        # NO `accept`. The answer is four fractions in an order, and `markAnswer_` compares ONE
        # number: a child typing the right list would be told it is wrong, which is the failure
        # CLAUDE.md calls the worse of the two -- a student who stops trusting the marking.
        row.pop('accept', None)
        seen.add(n)
        out.append(json.dumps(row) + tail)
    else:
        out.append(line)

assert seen == {q[0] for q in Q}, 'rows missing: %r' % sorted({q[0] for q in Q} - seen)
FILE.write_text('\n'.join(out) + '\n')
print('%s: %d questions with their fractions restored and ordered' % (PAPER, len(Q)))
