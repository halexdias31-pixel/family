# The angle in a semicircle, and why (GCSE Maths chapter 15): writes its row of data/textbooks.json
# through tools/anim_row.py. Edit the positions or the timeline and re-run: python3 tools/g_semi.py
#
# WHAT IT DRAWS, in one loop of T seconds: a circle with diameter AB; a point C visits four places on
# the circle and the angle ACB is marked square at every one — the theorem. Then the proof: the radius
# OC cuts the triangle into two isosceles triangles (OA = OC = OB), so the base angles pair up as a, a
# and b, b; the angles of ABC add to 180°, so 2a + 2b = 180° and the angle at C, a + b, is 90°.
# Each place of C is its own drawn group, crossfaded, because CSS cannot move the ends of a line.
import math
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gsemi'
T = 15.0
W, H = 200, 132
O, R = (100, 76), 54
POS = [150, 115, 80, 45]            # where C stands, in degrees round from the right
PROOF = 115                         # and where it stands for the proof
STEP, X0 = 1.4, 1.6                 # each place shows for STEP seconds, the first from X0
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
A, B = (O[0] - R, O[1]), (O[0] + R, O[1])
def on(deg): return (O[0] + R * math.cos(math.radians(deg)), O[1] - R * math.sin(math.radians(deg)))
def unit(p, q):
    dx, dy = q[0] - p[0], q[1] - p[1]; n = math.hypot(dx, dy); return (dx / n, dy / n)
def add(p, u, k): return (p[0] + u[0] * k, p[1] + u[1] * k)

def square(C, k=7):
    u, v = unit(C, A), unit(C, B)
    a, b, c = add(C, u, k), add(add(C, u, k), v, k), add(C, v, k)
    return 'M%s %sL%s %sL%s %s' % (f(a[0]), f(a[1]), f(b[0]), f(b[1]), f(c[0]), f(c[1]))

def arc(at, p, q, r):
    """the small arc at `at` from the ray towards p to the ray towards q."""
    u, v = unit(at, p), unit(at, q)
    s, e = add(at, u, r), add(at, v, r)
    sweep = 1 if u[0] * v[1] - u[1] * v[0] > 0 else 0
    return 'M%s %sA%d %d 0 0 %d %s %s' % (f(s[0]), f(s[1]), r, r, sweep, f(e[0]), f(e[1]))

def bis(at, p, q, r):
    u, v = unit(at, p), unit(at, q)
    m = (u[0] + v[0], u[1] + v[1]); n = math.hypot(*m)
    return add(at, (m[0] / n, m[1] / n), r)

def tri(C):
    return 'M%s %sL%s %sL%s %s' % (f(A[0]), f(A[1]), f(C[0]), f(C[1]), f(B[0]), f(B[1]))

SHOW = []                           # (class, from, to)
for k, d in enumerate(POS):
    SHOW.append(('p%d' % k, X0 + STEP * k, X0 + STEP * (k + 1)))
PF = X0 + STEP * len(POS)           # the proof begins
SHOW.append(('pf', PF, END + 0.8))
OC, AA, BB = PF + 0.4, PF + 1.4, PF + 2.4
CAPS = [
    ('c0', 0.3, X0 + 0.4, 'AB is a diameter'),
    ('c1', X0 + 0.4, PF + 0.2, 'C anywhere on the circle<i class="gsemi-ln">angle ACB is always 90°</i>'),
    ('c2', PF + 0.2, PF + 3.0, 'OA = OC = OB, all radii<i class="gsemi-ln">two isosceles triangles</i>'),
    ('c3', PF + 3.0, PF + 4.8, 'angles of ABC add to 180°<i class="gsemi-ln">a + b + (a + b) = 180°</i>'),
    ('c4', PF + 4.8, T, '<b class="gsemi-g">so a + b = 90°</b><i class="gsemi-ln">the angle in a semicircle</i>'),
]
STILL = 'c4'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <g class="%s-base">' % P)
svg.append('        <circle class="%s-rim" cx="%d" cy="%d" r="%d"/>' % (P, O[0], O[1], R))
svg.append('        <path class="%s-dia" d="M%d %dH%d"/>' % (P, A[0], A[1], B[0]))
svg.append('        <circle class="%s-o" cx="%d" cy="%d" r="2"/>' % (P, O[0], O[1]))
svg.append('        <text class="%s-l" x="%d" y="%d">A</text><text class="%s-l" x="%d" y="%d">B</text><text class="%s-l" x="%d" y="%d">O</text>'
           % (P, A[0] - 8, A[1] + 4, P, B[0] + 8, B[1] + 4, P, O[0], O[1] + 12))
svg.append('      </g>')
for (cls, a, b), d in zip(SHOW, POS + [PROOF]):
    C = on(d)
    lab = add(C, unit(O, C), 9)
    svg.append('      <g class="%s-pos %s-%s">' % (P, P, cls))
    svg.append('        <path class="%s-tri" d="%s"/>' % (P, tri(C)))
    if cls != 'pf':                 # in the proof the four angles say it; a square over them hides them
        svg.append('        <path class="%s-sq" d="%s"/>' % (P, square(C)))
    svg.append('        <circle class="%s-c" cx="%s" cy="%s" r="2.6"/>' % (P, f(C[0]), f(C[1])))
    svg.append('        <text class="%s-l" x="%s" y="%s">C</text>' % (P, f(lab[0]), f(lab[1] + 4)))
    svg.append('      </g>')
C = on(PROOF)
svg.append('      <path class="%s-oc" pathLength="1" d="M%d %dL%s %s"/>' % (P, O[0], O[1], f(C[0]), f(C[1])))
for cls, at, p, q, r, ch in (('aa', A, B, C, 14, 'a'), ('ac', C, A, O, 14, 'a'), ('ba', B, A, C, 14, 'b'), ('bc', C, O, B, 18, 'b')):
    m = bis(at, p, q, r + 7)
    svg.append('      <g class="%s-ang %s-%s"><path class="%s-arc" d="%s"/><text class="%s-al" x="%s" y="%s">%s</text></g>'
               % (P, P, cls[0] + 'g' + cls[1], P, arc(at, p, q, r), P, f(m[0]), f(m[1] + 3.5), ch))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gsemi-a: #6fd8c4; --gsemi-b: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(76vw, 18rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-rim { fill: none; stroke: var(--paper); stroke-opacity: .35; stroke-width: 1.4; }' % P)
css.append('.%s-dia { stroke: var(--paper); stroke-opacity: .8; stroke-width: 1.6; }' % P)
css.append('.%s-o { fill: var(--paper); }' % P)
css.append('.%s-l { font: 700 10px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-tri { fill: none; stroke: #e8862c; stroke-width: 2; stroke-linejoin: round; }' % P)
css.append('.%s-sq { fill: rgb(240 180 95 / .25); stroke: var(--gold); stroke-width: 1.3; }' % P)
css.append('.%s-c { fill: var(--gold); }' % P)
css.append('.%s-oc { fill: none; stroke: var(--paper); stroke-width: 1.4; stroke-dasharray: 1; }' % P)
css.append('.%s-arc { fill: none; stroke-width: 2; }' % P)
css.append('.%s-al { font: 700 10px var(--mono); text-anchor: middle; stroke: var(--bg); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }' % P)
css.append('.%s-aga .%s-arc, .%s-agc .%s-arc { stroke: var(--gsemi-a); } .%s-aga .%s-al, .%s-agc .%s-al { fill: var(--gsemi-a); }' % ((P,) * 8))
css.append('.%s-bga .%s-arc, .%s-bgc .%s-arc { stroke: var(--gsemi-b); } .%s-bga .%s-al, .%s-bgc .%s-al { fill: var(--gsemi-b); }' % ((P,) * 8))
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); font-size: 1.1em; }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }' % P)
# THE STILL is the proof's picture: C at its last place with OC and the four angles, and the answer.
css.append('.%s-pos:not(.%s-pf), .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, P, STILL))
css.append('.%s-base { animation: %s-base %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('base', 0, 0.6, END, T))
X = 0.3                             # a place hands over to the next in one crossfade of X seconds
for cls, a, b in SHOW:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, cls, P, cls, T))
    css.append(fade(cls, a - X / 2, a + X / 2, b - X / 2, b + X / 2) if b < END else fade(cls, a - X / 2, a + X / 2, END, T))
css.append('.%s-oc { animation: %s-oc %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-oc { 0%%, %s { stroke-dashoffset: 1; opacity: 0; } %s { stroke-dashoffset: 1; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } 100%% { stroke-dashoffset: 0; opacity: 0; } }'
           % (P, pc(OC), pc(OC + .05), pc(OC + 0.7), pc(END)))
for cls, at in (('aga', AA), ('agc', AA + 0.3), ('bga', BB), ('bgc', BB + 0.3)):
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, cls, P, cls, T))
    css.append(fade(cls, at, at + 0.4, END, T))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-base, .%s-pos, .%s-oc, .%s-ang, .%s-s { animation: none; }' % (P, P, P, P, P))
css.append('}')

anim_row.write_anim('gsemi', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
