# Milgram's obedience study (GCSE Psychology, Social influence), drawn as the generator's dial only: 15 to 450 volts in
# 15-volt steps, under the prod "please continue". No learner is drawn: the study is about the teacher. 300 V is where
# every participant was still going; 65% went to 450 V. Writes the `samilg` row in the one animation format (16 Nov).
# Run: python3 tools/ps_milgram.py
import math, sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

CX, CY, R = 200, 130, 100
ang = lambda v: math.radians(180 - 180 * (v - 15) / (450 - 15))
pt = lambda v, r: (CX + r * math.cos(ang(v)), CY - r * math.sin(ang(v)))
d = Svg(400, 200)
d.path('M%g,%g A%g,%g 0 0 1 %g,%g' % (*pt(15, R), R, R, *pt(450, R)))
for v in range(15, 451, 15):
    (x1, y1), (x2, y2) = pt(v, R), pt(v, R - (10 if v % 75 == 0 or v in (15, 450) else 5))
    d.line(x1, y1, x2, y2, 'pt' + (' hot' if v > 300 else ''))
for v in (15, 300, 450):
    x, y = pt(v, R + 16); d.text(x, y + 4, '%d V' % v, 'hot' if v == 450 else '', size=11)
d.g('s1'); d.text(200, 20, '"Please continue."', 'hot'); d.end()
x, y = pt(300, R - 16)
d.g('s2', transform='translate(%g,%g)' % (CX, CY))
d.g('mv-swing', style='transform-origin:0 0'); d.line(0, 0, 0, -(R - 20), 'pt hot', 'stroke-width:3'); d.end()
d.end()
d.circle(CX, CY, 6, 'fill')
d.g('s4'); d.text(200, 160, 'all 40 reached 300 V', size=12); d.end()
d.g('s6'); d.text(200, 182, '65% went to 450 V', 'hot'); d.end()
anim_row.write_sa('milg', d.svg("Milgram's dial from 15 to 450 volts: all reached 300 V and 65% went to 450 V"))
