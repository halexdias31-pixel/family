# Insertion sort (GCSE Computer Science, chapter 8 Algorithms). Run: python3 tools/cs_insert.py
# 4 2 5 1 3: the sorted part (green) grows from the left; each next item is inserted into it where it belongs. The rows
# are worked out below. Drawn in the one animation format (16 Nov, tools/sa_draw.py).
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

xs = [4, 2, 5, 1, 3]
rows = [(list(xs), 1, None, 'start: 4 is a sorted part of one')]
for i in range(1, len(xs)):
    v = xs.pop(i)
    j = 0
    while j < i and xs[j] <= v: j += 1
    xs.insert(j, v)
    rows.append((list(xs), i + 1, j, 'insert %d into the sorted part' % v))

d = Svg(400, 30 + 44 * len(rows))
for k, (r, n, at, say) in enumerate(rows):
    y = 14 + k * 44
    d.g('s%d' % (k + 1))
    for i, v in enumerate(r):
        d.box(24 + i * 34, y, 28, 28, str(v), 'hot' if i == at else 'cool' if i < n else '')
    d.text(204, y + 19, say, anchor='start', size=12)
    d.end()
anim_row.write_sa('insert', d.svg('Insertion sort: each item is inserted into the sorted part on the left'))
