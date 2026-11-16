# Merge sort (GCSE Computer Science, chapter 8 Algorithms). Run: python3 tools/cs_merge.py
# 6 2 8 1 5 3 7 4 is split in half and again down to single items, then merged back in order: pairs, fours, all eight.
# The rows are worked out below. Drawn in the one animation format (16 Nov, tools/sa_draw.py).
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

xs = [6, 2, 8, 1, 5, 3, 7, 4]
split = lambda size: [xs[i:i + size] for i in range(0, 8, size)]
merged = lambda size: [sorted(xs[i:i + size]) for i in range(0, 8, size)]
rows = [(split(8), ''), (split(4), 'split in half'), (split(2), 'and again'), (split(1), 'single items'),
        (merged(2), 'merge pairs in order'), (merged(4), 'merge into fours'), (merged(8), 'merge all eight')]
C = 22
d = Svg(400, 20 + 34 * len(rows))
for k, (groups, say) in enumerate(rows):
    y = 10 + k * 34
    d.g('s%d' % (k + 1))
    x = 12
    for g in groups:
        for v in g:
            d.box(x, y, C - 2, 24, str(v), 'cool' if k >= 4 else '', size=11, rx=3); x += C
        x += 8
    d.text(256, y + 16, say, 'cool' if k >= 4 else '', anchor='start', size=12)
    d.end()
anim_row.write_sa('merge', d.svg('Merge sort: split down to single items, then merge back in order'))
