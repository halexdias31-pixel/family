# Piaget's conservation of liquid (GCSE Psychology, Development): two equal short wide glasses; one is poured into a tall
# thin glass half as wide, so its level stands twice as high (3 x 2 = 1.5 x 4): the same amount, but a child who cannot
# yet conserve says the tall one has more. Writes the `sapiag` row in the one animation format (16 Nov). Run: python3 tools/ps_piaget.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

WIDE, LOW = 60, 40                       # the short glasses and their level; the tall one is half as wide, twice as high
d = Svg(400, 200)
base = 150


def glass(x, w, h, level, step=''):
    d.path('M%g,%g v%g h%g v%g' % (x, base - h, h, w, -h))
    if step: d.g(step)
    d.rect(x + 2, base - level, w - 4, level - 2, 'fill cool', style='fill-opacity:.6')
    if step: d.end()


glass(50, WIDE, 70, LOW)
d.g('s1'); d.text(80, 172, 'A', size=11); d.end()
glass(150, WIDE, 70, LOW, 's1')
d.g('s1'); d.text(180, 172, 'B', size=11); d.end()
d.g('s2'); d.arrow(215, 70, 270, 40, 'pt hot'); d.text(240, 36, 'pour B', 'hot', size=11); d.end()
glass(290, WIDE / 2, 110, 2 * LOW, 's3')
d.g('s3'); d.text(305, 172, 'C', size=11); d.end()
d.g('s4'); d.text(200, 22, 'same amount: A = C'); d.end()
d.g('s5'); d.text(200, 194, '"the tall one has more"', 'hot'); d.end()
anim_row.write_sa('piag', d.svg('The same amount of liquid poured into a tall thin glass looks like more to a young child'))
