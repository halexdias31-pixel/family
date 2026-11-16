# Linear and binary search (GCSE Computer Science, chapter 8 Algorithms). Run: python3 tools/cs_search.py
# Looking for 72 in a sorted list of eleven: a linear search checks one after another, 10 checks; a binary search checks
# the middle and throws half away each time, 3 checks. The checks are worked out below. Drawn in the one format (16 Nov).
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

L = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91]
T = 72
lin = L.index(T) + 1
lo, hi, bin_ = 0, len(L) - 1, []
while lo <= hi:
    m = (lo + hi) // 2; bin_.append(m)
    if L[m] == T: break
    lo, hi = (m + 1, hi) if L[m] < T else (lo, m - 1)

C = 33
d = Svg(400, 200)
d.text(200, 16, 'looking for 72 in a sorted list', size=12)


def row(y, step, seen, label):
    d.g(step); d.text(16, y - 6, label, anchor='start', size=12)
    for i, v in enumerate(L):
        d.box(19 + i * C, y, C - 4, 26, str(v), 'hot' if v == T and i in seen else 'cool' if i in seen else '', size=11, rx=3)
    d.end()


row(46, 's1', [], 'linear search')
for k in range(lin):
    d.g('s2' if k < 5 else 's3'); d.text(19 + k * C + (C - 4) / 2, 88, str(k + 1), 'hot' if k == lin - 1 else 'cool', size=10); d.end()
d.g('s4'); d.text(384, 40, '%d checks' % lin, 'hot', anchor='end', size=12); d.end()
row(130, 's5', [], 'binary search')
for k, m in enumerate(bin_):
    d.g('s%d' % (6 + k)); d.text(19 + m * C + (C - 4) / 2, 172, str(k + 1), 'hot' if L[m] == T else 'cool', size=10); d.end()
d.g('s8'); d.text(384, 124, '%d checks' % len(bin_), 'hot', anchor='end', size=12); d.end()
anim_row.write_sa('search', d.svg('A linear search takes 10 checks to find 72; a binary search takes 3'))
