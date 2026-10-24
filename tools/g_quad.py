# A quadratic's graph, its roots and turning point (GCSE Maths chapter 7): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the quadratic or the timeline and re-run:
# python3 tools/g_quad.py
#
# WHAT IT DRAWS, in one loop of T seconds: y = x² − 4x + 3 traced as a parabola; factorised as
# (x − 1)(x − 3); its roots lit where it crosses the x-axis; the y-intercept at x = 0; then the line of
# symmetry halfway between the roots, and the turning point on it. A parabola segment IS a quadratic
# Bézier, so the curve is one exact `Q`, worked out below from the end points and the slope at one.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gquad'
T = 14.0
W, H = 200, 146
O, S = (66, 112), 17                # the origin in the viewBox, and one unit
A, B, C = 1, -4, 3                  # y = Ax² + Bx + C
X0, X1 = -0.4, 4.4                  # the curve's ends
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

# A LINE IS HIDDEN UNTIL ITS DRAW BEGINS: a dash of no length still paints its round cap, a dot at the end.
def draw(name, a, b):
    return ('@keyframes %s-%s { 0%%, %s { stroke-dashoffset: 1; opacity: 0; } %s { stroke-dashoffset: 1; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } 100%% { stroke-dashoffset: 0; opacity: 0; } }'
            % (P, name, pc(a), pc(a + .05), pc(b), pc(END)))

y = lambda x: A * x * x + B * x + C
dy = lambda x: 2 * A * x + B
def pt(x, v): return (O[0] + S * x, O[1] - S * v)
f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
ctrl = ((X0 + X1) / 2, y(X0) + dy(X0) * (X1 - X0) / 2)
p0, p1, p2 = pt(X0, y(X0)), pt(*ctrl), pt(X1, y(X1))
CURVE = 'M%s %sQ%s %s %s %s' % tuple(f(v) for v in p0 + p1 + p2)
TP = (-B / (2 * A), y(-B / (2 * A)))
ROOTS = (1, 3)
assert all(abs(y(r)) < 1e-9 for r in ROOTS)

DRAW, ROOT, YINT, SYM = (0.8, 2.6), 4.6, 6.6, 8.4
CAPS = [
    ('c1', 0.6, 3.0, 'y = x² − 4x + 3<i class="gquad-ln">a parabola: a U shape</i>'),
    ('c2', 3.0, 4.6, 'y = (x − 1)(x − 3)<i class="gquad-ln">the same, factorised</i>'),
    ('c3', 4.6, 6.6, 'roots: x = 1 and x = 3<i class="gquad-ln">where y = 0, on the x-axis</i>'),
    ('c4', 6.6, 8.4, 'y-intercept 3<i class="gquad-ln">put x = 0: y = 3</i>'),
    ('c5', 8.4, 10.8, 'turning point (2, −1)<i class="gquad-ln">halfway between the roots</i>'),
    ('c6', 10.8, T, '<b class="gquad-g">roots 1 and 3</b><i class="gquad-ln">turning point (2, −1)</i>'),
]
STILL = 'c6'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <g class="%s-ax">' % P)
grid = ''.join('M%s %sV%s' % (f(pt(i, 0)[0]), f(pt(0, -1.5)[1]), f(pt(0, 5.6)[1])) for i in range(-1, 6) if i) + \
       ''.join('M%s %sH%s' % (f(pt(-1.2, 0)[0]), f(pt(0, j)[1]), f(pt(5.2, 0)[0])) for j in range(-1, 6) if j)
svg.append('        <path class="%s-grid" d="%s"/>' % (P, grid))
svg.append('        <path class="%s-axis" d="M%s %sH%s M%s %sV%s"/>' % (P, f(pt(-1.2, 0)[0]), O[1], f(pt(5.4, 0)[0]), O[0], f(pt(0, -1.6)[1]), f(pt(0, 5.9)[1])))
for i in (1, 2, 3, 4):
    svg.append('        <text class="%s-num" x="%s" y="%s">%d</text>' % (P, f(pt(i, 0)[0] + 4), f(O[1] + 10), i))
for j in (2, 4):
    svg.append('        <text class="%s-num" x="%s" y="%s">%d</text>' % (P, f(O[0] - 12), f(pt(0, j)[1] + 3), j))
svg.append('        <text class="%s-num" x="%s" y="%s">x</text><text class="%s-num" x="%s" y="%s">y</text>'
           % (P, f(pt(5.4, 0)[0] + 6), f(O[1] + 3), P, f(O[0]), f(pt(0, 5.9)[1] - 4)))
svg.append('      </g>')
svg.append('      <path class="%s-sym" pathLength="1" d="M%s %sV%s"/>' % (P, f(pt(TP[0], 0)[0]), f(pt(0, 5.6)[1]), f(pt(0, -1.5)[1])))
svg.append('      <path class="%s-curve" pathLength="1" d="%s"/>' % (P, CURVE))
for k, r in enumerate(ROOTS):
    svg.append('      <circle class="%s-dot %s-root %s-r%d" cx="%s" cy="%s" r="3.4"/>' % (P, P, P, k, f(pt(r, 0)[0]), f(O[1])))
svg.append('      <circle class="%s-dot %s-yint" cx="%s" cy="%s" r="3.4"/>' % (P, P, f(O[0]), f(pt(0, C)[1])))
svg.append('      <circle class="%s-dot %s-tp" cx="%s" cy="%s" r="3.4"/>' % (P, P, f(pt(*TP)[0]), f(pt(*TP)[1])))
svg.append('      <text class="%s-lab %s-tpl" x="%s" y="%s">(2, −1)</text>' % (P, P, f(pt(*TP)[0] + 7), f(pt(*TP)[1] + 12)))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gquad-c: #6fd8c4; --gquad-r: #e8862c; --gquad-y: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(76vw, 18rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-grid { fill: none; stroke: var(--paper); stroke-opacity: .12; stroke-width: .6; }' % P)
css.append('.%s-axis { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.1; }' % P)
css.append('.%s-num { font: 400 8px var(--mono); fill: var(--paper); fill-opacity: .7; text-anchor: middle; }' % P)
css.append('.%s-curve { fill: none; stroke: var(--gquad-c); stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 1; }' % P)
css.append('.%s-sym { fill: none; stroke: var(--gold); stroke-width: 1; stroke-dasharray: 1; }' % P)
css.append('.%s-dot { stroke: var(--bg); stroke-width: 1.2; }' % P)
css.append('.%s-root { fill: var(--gquad-r); } .%s-yint { fill: var(--gquad-y); } .%s-tp { fill: var(--gold); }' % (P, P, P))
css.append('.%s-lab { font: 700 9px var(--mono); fill: var(--gold); stroke: var(--bg); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); font-size: 1.1em; }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }' % P)
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
css.append('.%s-ax { animation: %s-ax %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('ax', 0, 0.6, END, T))
css.append('.%s-curve { animation: %s-curve %gs ease-in-out infinite; }' % (P, P, T))
css.append(draw('curve', *DRAW))
css.append('.%s-sym { animation: %s-sym %gs ease-in-out infinite; }' % (P, P, T))
css.append(draw('sym', SYM, SYM + 1.0))
# A DOT ARRIVES WITH A SMALL POP so the eye goes to it: scaled from its own centre
css.append('.%s-dot { transform-box: fill-box; transform-origin: center; }' % P)
for cls, at in (('r0', ROOT), ('r1', ROOT + 0.3), ('yint', YINT), ('tp', SYM + 1.0)):
    css.append('.%s-%s { animation: %s-%s %gs ease-out infinite; }' % (P, cls, P, cls, T))
    css.append('@keyframes %s-%s { 0%%, %s { opacity: 0; transform: scale(.3); } %s { opacity: 1; transform: scale(1.6); } %s, %s { opacity: 1; transform: none; } 100%% { opacity: 0; transform: none; } }'
               % (P, cls, pc(at), pc(at + 0.25), pc(at + 0.6), pc(END)))
css.append('.%s-tpl { animation: %s-tpl %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('tpl', SYM + 1.2, SYM + 1.6, END, T))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-ax, .%s-curve, .%s-sym, .%s-dot, .%s-lab, .%s-s { animation: none; }' % (P, P, P, P, P, P))
css.append('}')

anim_row.write_anim('gquad', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
