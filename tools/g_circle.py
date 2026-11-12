# The parts of a circle (1MA1 G9), named one at a time: radius, diameter, chord and segment, sector and arc, tangent.
# Writes its row through tools/g_figkit.py; edit and re-run: python3 tools/g_circle.py
import math
import g_figkit

P, O, R = 'gcirc', (100, 78), 54
f = lambda v: ('%.1f' % v).rstrip('0').rstrip('.')
def on(d, r=R): return (O[0] + r * math.cos(math.radians(d)), O[1] - r * math.sin(math.radians(d)))
def pt(p): return '%s %s' % (f(p[0]), f(p[1]))
def lab(d, txt, cls='t', r=R + 12): q = on(d, r); return '<text class="%s-%s" x="%s" y="%s">%s</text>' % (P, cls, f(q[0]), f(q[1] + 3.5), txt)

c1, c2 = on(190), on(280)            # the chord, low on the left
s1, s2 = on(20), on(70)              # the sector, up on the right
T = on(135)                          # where the tangent touches
u = (math.cos(math.radians(45)), -math.sin(math.radians(45)))   # along the tangent, in screen terms
t1, t2 = (T[0] - 34 * u[0], T[1] - 34 * u[1]), (T[0] + 34 * u[0], T[1] + 34 * u[1])
steps = [
    '<circle class="%s-ln" cx="%d" cy="%d" r="%d"/><circle class="%s-dot" cx="%d" cy="%d" r="2.2"/>' % (P, O[0], O[1], R, P, O[0], O[1]),
    '<path class="%s-ln" d="M%d %dL%s"/>%s' % (P, O[0], O[1], pt(on(-20)), lab(-2, 'radius', r=R - 22)),
    '<path class="%s-fa" d="M%sA%d %d 0 0 1 %sZ"/><text class="%s-t" x="%s" y="%s">segment</text><text class="%s-tg" x="%s" y="%s">chord</text>'
    % (P, pt(c2), R, R, pt(c1), P, 40, 144, P, f((c1[0] + c2[0]) / 2 + 12), f((c1[1] + c2[1]) / 2 - 8)),
    '<path class="%s-fa" d="M%d %dL%sA%d %d 0 0 0 %sZ"/><path class="%s-hi" d="M%sA%d %d 0 0 0 %s"/>%s%s'
    % (P, O[0], O[1], pt(s1), R, R, pt(s2), P, pt(s1), R, R, pt(s2), lab(45, 'sector', r=R - 22), lab(45, 'arc', 'tg')),
    '<path class="%s-hi" d="M%sL%s"/><path class="%s-dash" d="M%d %dL%s"/>%s' % (P, pt(t1), pt(t2), P, O[0], O[1], pt(T), lab(135, 'tangent', 'tg', R + 16)),
]
g_figkit.write(P, 6, 'The parts of a circle', 'Radius', '0 0 200 150', steps,
               'a sector has the centre as a corner<br>a segment is cut off by a chord')
