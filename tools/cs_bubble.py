# Bubble sort (GCSE Computer Science, chapter 8 Algorithms). Run: python3 tools/cs_bubble.py
# 5 1 4 2 3: each pass compares neighbours and swaps them, so the biggest left sinks to the end; the third pass makes no
# swaps, so the list is sorted. The rows are worked out below, not typed. Drawn in the one animation format (16 Nov).
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

xs = [5, 1, 4, 2, 3]
rows = [(list(xs), 'start', 0)]
done = 0
while True:
    swaps = 0
    for i in range(len(xs) - 1 - done):
        if xs[i] > xs[i + 1]: xs[i], xs[i + 1] = xs[i + 1], xs[i]; swaps += 1
    done += 1
    rows.append((list(xs), 'pass %d · %s' % (done, 'biggest left sinks to the end' if swaps else 'no swaps, so sorted'), done))
    if not swaps: break

d = Svg(400, 40 + 46 * len(rows))
for k, (r, say, fixed) in enumerate(rows):
    y = 18 + k * 46
    d.g('s%d' % (2 * k + 1))
    for i, v in enumerate(r):
        sorted_ = i >= len(r) - fixed
        d.box(14 + i * 30, y, 26, 26, str(v), 'cool' if sorted_ else '')
    d.end()
    d.g('s%d' % (2 * k + 2)); d.text(168, y + 18, say, 'cool' if fixed else '', anchor='start', size=12); d.end()
anim_row.write_sa('bubble', d.svg('Bubble sort: each pass sinks the biggest left to the end until a pass makes no swaps'))
