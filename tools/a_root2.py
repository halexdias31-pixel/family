# Proof by contradiction that √2 is irrational, revealed a step at a time: suppose √2 = a ÷ b in lowest terms; then
# a is even, then b is even, and "lowest terms" is struck through, because both share the factor 2. The row is this
# script's output, in the one animation format (16 Nov, tools/sa_draw.py); re-run it after any change. docs/history/411.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

# (words, colour): hot for what is assumed and what breaks it, cool for what is even
STEPS = [('Suppose √2 = a ÷ b, a fraction in', 'hot'),
         ('Square both sides: 2 = a² ÷ b², so a² = 2b²', ''),
         ('a² is 2 × something, so a² is even, and so a is even: a = 2k', 'cool'),
         ('Then 2b² = (2k)² = 4k², so b² = 2k²: b is even too', 'cool'),
         ('Both even: both share the factor 2, not lowest terms. Contradiction.', 'hot'),
         ('So the supposition is false: √2 is irrational ∎', '')]
d = Svg(400, 200)
for k, (words, cls) in enumerate(STEPS):
    y = 26 + k * 30
    d.g('s%d' % (k + 1))
    d.text(14, y, str(k + 1), anchor='start', size=11)
    d.text(30, y, words, cls, anchor='start', size=10.5)
    if k == 0: d.text(194, y, 'lowest terms', cls, anchor='start', size=10.5)
    d.end()
d.g('s5'); d.line(192, 22, 262, 22, 'pt hot', 'stroke-width:2'); d.end()    # "lowest terms" struck when the contradiction lands
anim_row.write_sa('aroot2', d.svg('Proof by contradiction that the square root of 2 is irrational'),
                  place=('TB-ALEVEL-MATHS', 1, '√2 is irrational', 'Proof by contradiction|Rational number'))
