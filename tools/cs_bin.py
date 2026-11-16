# Binary to denary (GCSE Computer Science, chapter 3 Data representation). Run: python3 tools/cs_bin.py
# Eight bits under their place values 128 64 32 16 8 4 2 1, one row for each of 5, 77, 200 and 255 in turn: a bit that
# is on is coral, and the line under it says which place values add up to the number. Drawn in the one animation format
# (16 Nov, tools/sa_draw.py); 424's HTML counting lamps are in tools/anim_legacy.json's history.
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

PV = [128, 64, 32, 16, 8, 4, 2, 1]
NUMS = [5, 77, 200, 255]
X0, DX = 110, 36

d = Svg(400, 262)
for i, v in enumerate(PV):
    d.text(X0 + i * DX, 22, str(v), size=11)
for k, n in enumerate(NUMS):
    y = 34 + k * 56
    d.g('s%d' % (2 * k + 1))
    d.text(60, y + 21, str(n), 'hot', anchor='end')
    for i, v in enumerate(PV):
        on = n & v
        d.rect(X0 + i * DX - 14, y + 4, 28, 26, 'pt' + (' hot' if on else ''), rx=3)
        d.text(X0 + i * DX, y + 22, '1' if on else '0', 'hot' if on else '')
    d.end()
    d.g('s%d' % (2 * k + 2))
    d.text(X0 + 3.5 * DX, y + 46, 'all eight on = 255' if n == 255 else ' + '.join(str(v) for v in PV if n & v) + ' = %d' % n, size=11)
    d.end()

anim_row.write_sa('bin', d.svg('Eight bits under their place values make 5, 77, 200 and 255'))
