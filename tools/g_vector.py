# Adding vectors tip to tail (GCSE Maths chapter 18): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the vectors or the timeline and re-run: python3 tools/g_vector.py
#
# WHAT IT DRAWS, in one loop of T seconds, on squared paper: a = (3, 2) from O; b = (1, −4) starting
# where a ends; the resultant a + b = (4, −2) from O straight to where b ends. Then b first and a
# after, dashed, closing a parallelogram on the same point: b + a = a + b. The column vectors in the
# caption are drawn as two stacked numbers between brackets, the way a paper writes them.
import math
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gvec'
T = 13.0
W, H = 160, 136
O, S = (40, 58), 16                 # the origin and one square
VA, VB = (3, 2), (1, -4)
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

# A LINE IS HIDDEN UNTIL ITS DRAW BEGINS: a dash of no length still paints its round cap, a dot at the end.
def draw(name, a, b):
    return ('@keyframes %s-%s { 0%%, %s { stroke-dashoffset: 1; opacity: 0; } %s { stroke-dashoffset: 1; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } 100%% { stroke-dashoffset: 0; opacity: 0; } }'
            % (P, name, pc(a), pc(a + .05), pc(b), pc(END)))

f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
def pt(v): return (O[0] + S * v[0], O[1] - S * v[1])
def plus(u, v): return (u[0] + v[0], u[1] + v[1])

def arrow(cls, frm, to, at, dur, faint=False):
    """a line drawn from `frm` to `to` (grid units) over [at, at + dur], its head arriving at the end."""
    p, q = pt(frm), pt(to)
    dx, dy = q[0] - p[0], q[1] - p[1]; n = math.hypot(dx, dy); ux, uy = dx / n, dy / n
    k = 7                           # the head's length; the line stops at its base so the tip is sharp
    base = (q[0] - ux * k, q[1] - uy * k)
    l, r = (base[0] - uy * 3.6, base[1] + ux * 3.6), (base[0] + uy * 3.6, base[1] - ux * 3.6)
    svg.append('      <path class="%s-v %s-%s%s" pathLength="1" d="M%s %sL%s %s"/>' % (P, P, cls, ' %s-dash' % P if faint else '', f(p[0]), f(p[1]), f(base[0]), f(base[1])))
    svg.append('      <path class="%s-h %s-%sh" d="M%s %sL%s %sL%s %sZ"/>' % (P, P, cls, f(q[0]), f(q[1]), f(l[0]), f(l[1]), f(r[0]), f(r[1])))
    TIMES.append((cls, at, dur))

def cv(x, y): return '<span class="gvec-cv"><i>%s</i><i>%s</i></span>' % (x, y)

AB = plus(VA, VB)
TIMES = []
svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
gx = range(-1, 7); gy = range(-4, 4)
grid = ''.join('M%s %sV%s' % (f(pt((i, 0))[0]), f(pt((0, 3))[1]), f(pt((0, -4))[1])) for i in gx) + \
       ''.join('M%s %sH%s' % (f(pt((-1, 0))[0]), f(pt((0, j))[1]), f(pt((6, 0))[0])) for j in gy)
svg.append('      <g class="%s-paper"><path class="%s-grid" d="%s"/><circle class="%s-o" cx="%d" cy="%d" r="2.4"/>'
           '<text class="%s-l" x="%d" y="%d">O</text></g>' % (P, P, grid, P, O[0], O[1], P, O[0] - 7, O[1] + 4))
arrow('ba', (0, 0), VB, 6.4, 1.0, faint=True)          # b first, then a: the other way round
arrow('ab', VB, AB, 7.4, 1.0, faint=True)
arrow('a', (0, 0), VA, 0.8, 1.2)
arrow('b', VA, AB, 2.8, 1.2)
arrow('r', (0, 0), AB, 4.8, 1.2)
la, lb, lr = pt((1.3, 1.5)), pt((3.9, 0.2)), pt((2, -1.6))
svg.append('      <text class="%s-l %s-ta" x="%s" y="%s">a</text>' % (P, P, f(la[0]), f(la[1])))
svg.append('      <text class="%s-l %s-tb" x="%s" y="%s">b</text>' % (P, P, f(lb[0]), f(lb[1])))
svg.append('      <text class="%s-l %s-tr" x="%s" y="%s">a + b</text>' % (P, P, f(lr[0]), f(lr[1])))
svg.append('    </svg>')
CAPS = [
    ('c1', 0.6, 2.6, 'a = %s<i class="gvec-ln">3 across, 2 up</i>' % cv(3, 2)),
    ('c2', 2.6, 4.6, 'b = %s<i class="gvec-ln">starts where a ends</i>' % cv(1, '−4')),
    ('c3', 4.6, 6.4, 'a + b = %s<i class="gvec-ln">4 across, 2 down</i>' % cv(4, '−2')),
    ('c4', 6.4, 9.0, 'b first, then a<i class="gvec-ln">lands in the same place</i>'),
    ('c5', 9.0, T, '<b class="gvec-g">a + b = b + a</b> = %s<i class="gvec-ln">tip to tail</i>' % cv(4, '−2')),
]
STILL = 'c5'
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gvec-a: #6fd8c4; --gvec-b: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(66vw, 15rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-grid { fill: none; stroke: var(--paper); stroke-opacity: .16; stroke-width: .7; }' % P)
css.append('.%s-o { fill: var(--paper); }' % P)
css.append('.%s-l { font: 700 10px var(--mono); fill: var(--paper); text-anchor: middle; stroke: var(--bg); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }' % P)
css.append('.%s-ta { fill: var(--gvec-a); } .%s-tb { fill: var(--gvec-b); } .%s-tr { fill: var(--gold); }' % (P, P, P))
css.append('.%s-v { fill: none; stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 1; }' % P)
css.append('.%s-a, .%s-ab { stroke: var(--gvec-a); } .%s-ah, .%s-abh { fill: var(--gvec-a); }' % (P, P, P, P))
css.append('.%s-b, .%s-ba { stroke: var(--gvec-b); } .%s-bh, .%s-bah { fill: var(--gvec-b); }' % (P, P, P, P))
css.append('.%s-r { stroke: var(--gold); stroke-width: 3; } .%s-rh { fill: var(--gold); }' % (P, P))
# THE SECOND WAY ROUND IS FAINTER AND THINNER: the same two moves, not two new ones. It is not dashed,
# because the draw itself runs on stroke-dasharray 1 and a dash pattern would replace it.
css.append('.%s-dash { stroke-opacity: .55; stroke-width: 1.6; } .%s-bah, .%s-abh { fill-opacity: .55; }' % (P, P, P))
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 3.4em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }' % P)
css.append('.%s-cv { display: inline-grid; vertical-align: middle; padding: 0 .3em; line-height: 1.1; border: 2px solid currentColor; border-top: 0; border-bottom: 0; border-radius: .5em; }' % P)
css.append('.%s-cv i { font-style: normal; }' % P)
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
css.append('.%s-paper { animation: %s-paper %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('paper', 0, 0.6, END, T))
for cls, at, dur in TIMES:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, cls, P, cls, T))
    css.append(draw(cls, at, at + dur))
    css.append('.%s-%sh { animation: %s-%sh %gs ease-in-out infinite; }' % (P, cls, P, cls, T))
    css.append(fade(cls + 'h', at + dur - 0.1, at + dur + 0.1, END, T))
for cls, at in (('ta', 1.6), ('tb', 3.6), ('tr', 5.6)):
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, cls, P, cls, T))
    css.append(fade(cls, at, at + 0.4, END, T))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-paper, .%s-v, .%s-h, .%s-l, .%s-s { animation: none; }' % (P, P, P, P, P))
css.append('}')

anim_row.write_anim('gvec', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
