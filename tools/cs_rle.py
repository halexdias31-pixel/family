# Run-length encoding (GCSE Computer Science, chapter 5 Compression). Run: python3 tools/cs_rle.py
# A row of 14 pixels in four runs, 5 3 2 4; each run becomes a count and a colour, so 14 pixels are stored as 4 pairs.
# Drawn in the one animation format (16 Nov, tools/sa_draw.py).
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

RUNS = [(5, 'fill hot'), (3, 'fill'), (2, 'fill cool'), (4, 'fill hot')]
W = 24
d = Svg(400, 200)
x = 32
d.g('s1')
for n, cls in RUNS:
    for i in range(n):
        d.rect(x, 30, W - 2, W - 2, cls); x += W
d.end()
x = 32
for k, (n, cls) in enumerate(RUNS):
    mid = x + n * W / 2 - 1
    d.g('s%d' % (k + 2))
    d.path('M%g,58 v6 h%g v-6' % (x, n * W - 2))
    d.arrow(mid, 66, 50 + k * 92 + 20, 100)
    d.text(50 + k * 92 + 8, 124, str(n), anchor='end')
    d.rect(50 + k * 92 + 14, 110, 18, 18, cls)
    d.end()
    x += n * W
d.g('s6'); d.text(200, 160, 'each run becomes a count and a colour'); d.end()
d.g('s7'); d.text(200, 182, '14 pixels stored as 4 pairs', 'hot'); d.end()
anim_row.write_sa('rle', d.svg('Fourteen pixels in four runs are stored as four count and colour pairs'))
