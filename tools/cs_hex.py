# Hexadecimal (GCSE Computer Science, chapter 3 Data representation). Run: python3 tools/cs_hex.py
# A byte splits into two nibbles of 8 4 2 1; each nibble is one hex digit, 10 to 15 written A to F. Four bytes in turn:
# 77, 163, 255 and 28. Drawn in the one animation format (16 Nov, tools/sa_draw.py).
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

NUMS = [77, 163, 255, 28]
PV = [8, 4, 2, 1]
d = Svg(400, 262)
xs = [40 + i * 26 for i in range(4)] + [222 + i * 26 for i in range(4)]
for i, x in enumerate(xs):
    d.text(x, 20, str(PV[i % 4]), size=11)
for k, n in enumerate(NUMS):
    y = 30 + k * 57
    hi, lo = n >> 4, n & 15
    d.g('s%d' % (2 * k + 1))
    for i, x in enumerate(xs):
        on = (n >> (7 - i)) & 1
        d.rect(x - 11, y + 4, 22, 24, 'pt' + (' hot' if on else ''), rx=3)
        d.text(x, y + 21, str(on), 'hot' if on else '')
    d.end()
    d.g('s%d' % (2 * k + 2))
    d.text(79, y + 46, '%d = %X' % (hi, hi) if hi > 9 else str(hi), 'cool', size=11)
    d.text(261, y + 46, '%d = %X' % (lo, lo) if lo > 9 else str(lo), 'cool', size=11)
    d.text(380, y + 21, '%02X = %d' % (n, n), 'hot', anchor='end')
    d.end()
anim_row.write_sa('hex', d.svg('A byte is two nibbles; each nibble is one hex digit: 4D, A3, FF and 1C'))
