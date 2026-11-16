# Asch's line study (GCSE Psychology, Social influence): the standard line and A, B, C; C matches. The group answers
# aloud in turn, all "A", the real participant (green) sixth of seven, as in Asch's groups. Writes the `saasch` row in
# the one animation format (16 Nov). Run: python3 tools/ps_asch.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

d = Svg(400, 210)
d.line(60, 20, 60, 100, 'pt', 'stroke-width:4'); d.text(60, 116, 'standard', size=11)
for x, h, n in [(170, 110, 'A'), (230, 50, 'B'), (290, 80, 'C')]:
    d.line(x, 100 - h + 10 if h > 80 else 100 - h, x, 100, 'pt' + (' cool' if n == 'C' else ''), 'stroke-width:4')
    d.text(x, 116, n, 'cool' if n == 'C' else '')
seats = 7
for i in range(seats):
    x = 50 + i * 50
    me = i == 5
    d.g('s%d' % min(8, i + 1))
    d.circle(x, 150, 10, 'pt' + (' cool' if me else ''))
    d.text(x, 185, '"A"', 'cool' if me else 'hot', size=12)
    d.end()
d.g('s8'); d.text(200, 205, 'C matches, but the group says A', size=11); d.end()
anim_row.write_sa('asch', d.svg("Asch's lines: C matches the standard, yet the group answers A in turn"))
