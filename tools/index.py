# The index-laws animation (the textbooks' Maths chapter 2). This script is the row's source: change it here and re-run,
# never the row. Run: python3 tools/index.py
#
# WHAT IT SHOWS: a·a·a × a·a. The two groups are drawn, then joined (the × goes), and while they are joined the five
# tiles are counted 1, 2, 3, 4, 5, a numeral under each, and a⁵ is written when the fifth is counted: a³ × a² = a⁵,
# the powers add. Counting is only an argument while they are joined, so the count comes after the join. Drawn in the
# one animation format (16 Nov, tools/sa_draw.py); the history of the old timeline is in docs/history.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

A, B = 3, 2
C = 40
d = Svg(400, 190)
d.g('s1')
for i in range(A): d.box(30 + i * C, 20, C - 6, 34, 'a', 'cool', size=16, rx=4)
d.text(30 + A * C + 14, 43, '×', size=18)
for i in range(B): d.box(30 + A * C + 30 + i * C, 20, C - 6, 34, 'a', 'cool', size=16, rx=4)
d.text(330, 43, 'a³ × a²', size=15)
d.end()
d.g('s3')
for i in range(A + B): d.box(60 + i * C, 90, C - 6, 34, 'a', 'hot', size=16, rx=4)
d.end()
for i in range(A + B):
    d.g('s%d' % (4 + i * 4 // (A + B))); d.text(60 + i * C + (C - 6) / 2, 142, str(i + 1), 'hot', size=12); d.end()
d.g('s8'); d.text(200, 176, 'a³ × a² = a⁵: the powers add', 'hot', size=15); d.end()
anim_row.write_sa('index', d.svg('a cubed times a squared: five a’s, so a to the fifth'))
