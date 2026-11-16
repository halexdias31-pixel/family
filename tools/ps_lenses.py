# Two lenses on one school (GCSE Sociology, Education): the functionalist lens (green) sees shared values and a fair
# race; the Marxist lens (coral) sees class reproduced and obedience taught. Writes the `sasoclens` row in the one
# animation format (16 Nov). Run: python3 tools/ps_lenses.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

d = Svg(400, 200)
d.path('M160,110 V70 L200,45 L240,70 V110 Z'); d.rect(192, 88, 16, 22); d.text(200, 128, 'school', size=12)
d.g('s1'); d.circle(90, 80, 34, 'pt cool', 'stroke-width:3'); d.line(114, 104, 140, 128, 'pt cool', 'stroke-width:3'); d.end()
d.g('s2'); d.text(90, 160, 'functionalist:', 'cool'); d.text(90, 178, 'shared values, a fair race', 'cool', size=11); d.end()
d.g('s4'); d.circle(310, 80, 34, 'pt hot', 'stroke-width:3'); d.line(286, 104, 260, 128, 'pt hot', 'stroke-width:3'); d.end()
d.g('s5'); d.text(310, 160, 'Marxist:', 'hot'); d.text(300, 178, 'class reproduced, obedience taught', 'hot', size=10); d.end()
anim_row.write_sa('lens', d.svg('One school through two lenses: functionalist and Marxist'))
