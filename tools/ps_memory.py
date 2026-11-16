# The multi-store model (GCSE Psychology, Memory): three stores in a row and three items. One is rehearsed into LTM,
# one decays in STM, one is displaced from STM by the next. Writes the `samsm` row of data/textbooks.json, in the one
# animation format (16 Nov, tools/sa_draw.py). Run: python3 tools/ps_memory.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

d = Svg(400, 190)
for x, name in [(20, 'sensory'), (150, 'STM'), (280, 'LTM')]:
    d.box(x, 50, 100, 50, name, 'cool' if name == 'LTM' else '', rx=8)
d.arrow(122, 75, 148, 75); d.arrow(252, 75, 278, 75)
d.g('s1'); d.text(70, 40, 'attention', size=11); d.end()
d.g('s2'); d.path('M180,50 C180,20 220,20 220,50', 'pt cool mv-flow'); d.text(200, 18, 'rehearse', 'cool', size=11); d.end()
d.g('s3'); d.text(330, 40, 'rehearsed: stored', 'cool', size=11); d.end()
d.g('s4'); d.arrow(185, 102, 170, 140, 'pt hot'); d.text(150, 156, 'decay', 'hot', size=11); d.end()
d.g('s5'); d.arrow(215, 102, 230, 140, 'pt hot'); d.text(250, 156, 'displace', 'hot', size=11); d.end()
d.g('s6'); d.text(200, 182, 'rehearse, decay, displace'); d.end()
anim_row.write_sa('msm', d.svg('The multi-store model: sensory store, STM, LTM; rehearsal, decay and displacement'))
