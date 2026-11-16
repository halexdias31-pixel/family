# The A ∩ B animation (the textbooks' Maths chapter 19): the three regions a GCSE paper asks about, A ∩ B, A ∪ B and
# A′, each shaded in its own copy of the universal set ξ with its notation underneath, one after another; the circles
# slide in first. The geometry is the table below. Drawn in the one animation format (16 Nov, tools/sa_draw.py);
# the shading is a fill, each region clipped from the two circles. Run: python3 tools/venn.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

W, H, R, GAP = 120, 84, 24, 30          # one box; circle radius; centre to centre
PANELS = [('and', 'A ∩ B', 'both'), ('or', 'A ∪ B', 'either'), ('not', 'A′', 'not in A')]
d = Svg(400, 150)
defs = []
for k, (key, sym, words) in enumerate(PANELS):
    x0 = 10 + k * (W + 10)
    ax, bx, cy = x0 + W / 2 - GAP / 2, x0 + W / 2 + GAP / 2, 14 + H / 2
    circ = lambda x: 'M%g,%g a%g,%g 0 1 0 %g,0 a%g,%g 0 1 0 %g,0 Z' % (x - R, cy, R, R, 2 * R, R, R, -2 * R)
    if key == 'and':
        defs.append('<clipPath id="sa-vn-a%d"><path d="%s"/></clipPath>' % (k, circ(ax)))
        shade = '<g clip-path="url(#sa-vn-a%d)"><path d="%s" class="fill hot" style="fill-opacity:.5"/></g>' % (k, circ(bx))
    elif key == 'or':
        shade = '<path d="%s" class="fill hot" style="fill-opacity:.5"/><path d="%s" class="fill hot" style="fill-opacity:.5"/>' % (circ(ax), circ(bx))
    else:
        shade = '<path d="M%g,14 h%g v%g h%g Z %s" class="fill hot" style="fill-opacity:.5;fill-rule:evenodd"/>' % (x0, W, H, -W, circ(ax))
    d.rect(x0, 14, W, H)
    d.text(x0 + 8, 28, 'ξ', anchor='start', size=10)
    d.g('s%d' % (2 * k + 2)); d.add(shade); d.end()
    d.g('s1')
    d.g('mv-slide', style='--x:0px;--y:0px')
    d.circle(ax, cy, R, 'pt cool', 'stroke-width:2'); d.circle(bx, cy, R, 'pt hot', 'stroke-width:2')
    d.text(ax - 10, cy + 4, 'A', 'cool', size=11); d.text(bx + 10, cy + 4, 'B', 'hot', size=11)
    d.end(); d.end()
    d.g('s%d' % (2 * k + 3)); d.text(x0 + W / 2, 118, sym, 'hot', size=15); d.text(x0 + W / 2, 136, words, size=10); d.end()
d.out.insert(0, '<defs>%s</defs>' % ''.join(defs))
anim_row.write_sa('venn', d.svg('Venn diagrams shading A intersect B, A union B and the complement of A'))
