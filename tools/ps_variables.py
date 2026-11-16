# Independent and dependent variables (GCSE Psychology, Research methods): the IV is switched between two levels, the
# DV follows, the extraneous variable stays put. Writes the `saivdv` row in the one animation format (16 Nov).
# Run: python3 tools/ps_variables.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

d = Svg(400, 180)
d.g('s1'); d.box(20, 40, 110, 46, 'IV', 'hot', rx=8); d.text(75, 104, 'changed', 'hot', size=11); d.end()
d.g('s2'); d.arrow(134, 63, 266, 63, 'pt mv-flow'); d.text(200, 52, 'causes?', size=11); d.end()
d.g('s3'); d.box(270, 40, 110, 46, 'DV', 'cool', rx=8); d.text(325, 104, 'measured', 'cool', size=11); d.end()
d.g('s4'); d.box(145, 120, 110, 40, 'EV'); d.text(200, 176, 'kept the same', size=11); d.end()
anim_row.write_sa('ivdv', d.svg('The IV is changed, the DV is measured, extraneous variables are kept the same'))
