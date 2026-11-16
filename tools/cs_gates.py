# Logic gates (GCSE Computer Science, chapter 11 Boolean logic). Run: python3 tools/cs_gates.py
# The truth table of AND, OR, XOR and NOT A, one row of inputs at a time; a 1 out is coral and the line under the table
# says which gates gave it. The outputs are worked out below. Drawn in the one animation format (16 Nov).
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

GATES = [('AND', lambda a, b: a & b), ('OR', lambda a, b: a | b), ('XOR', lambda a, b: a ^ b), ('NOT A', lambda a, b: 1 - a)]
COLS = [60, 110, 180, 240, 300, 360]
d = Svg(400, 210)
for x, h in zip(COLS, ['A', 'B'] + [g for g, _ in GATES]):
    d.text(x, 22, h, 'cool' if h in 'AB' else '')
d.line(30, 30, 390, 30)
d.line(140, 8, 140, 140)
for k, (a, b) in enumerate([(0, 0), (0, 1), (1, 0), (1, 1)]):
    y = 52 + k * 26
    outs = [f(a, b) for _, f in GATES]
    d.g('s%d' % (2 * k + 1))
    d.text(60, y, str(a)); d.text(110, y, str(b))
    for x, o in zip(COLS[2:], outs): d.text(x, y, str(o), 'hot' if o else '')
    d.end()
for k, (a, b) in enumerate([(0, 0), (0, 1), (1, 0), (1, 1)]):
    ones = [g for g, f in GATES if f(a, b)]
    d.g('s%d' % (2 * k + 2))
    d.text(100 if k % 2 == 0 else 300, 166 + (k // 2) * 22, 'A %d, B %d: 1 from %s' % (a, b, ', '.join(ones)), size=11)
    d.end()
anim_row.write_sa('gates', d.svg('The truth table of AND, OR, XOR and NOT A, row by row'))
