# An enlargement from a centre (GCSE Maths chapter 14): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the shape, the centre or the timeline and re-run: python3 tools/g_enlarge.py
#
# WHAT IT DRAWS, in one loop of T seconds, on a grid: a triangle and a centre of enlargement; a ray from
# the centre through each corner, drawn on to twice the distance; the new corners marked there; the
# image joined up, every side twice as long and every angle the same; then the full description.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'genl'
T = 12.5
W, H = 160, 124
O, S = (14, 112), 13                # the grid's (0, 0) and one square
NX, NY = 10, 8
C = (1, 1)                          # the centre of enlargement
K = 2                               # the scale factor
SHAPE = [(3, 2), (5, 2), (3, 4)]
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
def big(v): return (C[0] + K * (v[0] - C[0]), C[1] + K * (v[1] - C[1]))
def poly(vs): return 'M' + 'L'.join('%s %s' % (f(pt(v)[0]), f(pt(v)[1])) for v in vs) + 'Z'
IMG = [big(v) for v in SHAPE]
assert all(0 <= x <= NX and 0 <= y <= NY for x, y in IMG)
RAYS, DOTS, JOIN = 1.8, 3.6, 5.0

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
grid = ''.join('M%s %sV%s' % (f(pt((i, 0))[0]), f(O[1]), f(pt((0, NY))[1])) for i in range(NX + 1)) + \
       ''.join('M%s %sH%s' % (f(O[0]), f(pt((0, j))[1]), f(pt((NX, 0))[0])) for j in range(NY + 1))
svg.append('      <path class="%s-grid" d="%s"/>' % (P, grid))
svg.append('      <path class="%s-img" d="%s"/>' % (P, poly(IMG)))
svg.append('      <path class="%s-obj" d="%s"/>' % (P, poly(SHAPE)))
for k, (v, w) in enumerate(zip(SHAPE, IMG)):
    a, m, b = pt(C), pt(v), pt(w)
    svg.append('      <path class="%s-ray %s-r%d" pathLength="1" d="M%s %sL%s %s"/>' % (P, P, k, f(a[0]), f(a[1]), f(b[0]), f(b[1])))
    svg.append('      <circle class="%s-dot %s-d%d" cx="%s" cy="%s" r="2.6"/>' % (P, P, k, f(b[0]), f(b[1])))
svg.append('      <circle class="%s-c" cx="%s" cy="%s" r="3"/>' % (P, f(pt(C)[0]), f(pt(C)[1])))
svg.append('      <text class="%s-l %s-lo" x="%s" y="%s">A</text>' % (P, P, f(pt((3.6, 2.6))[0]), f(pt((3.6, 2.6))[1] + 3)))
svg.append('      <text class="%s-l %s-li" x="%s" y="%s">B</text>' % (P, P, f(pt((6.4, 4.6))[0]), f(pt((6.4, 4.6))[1] + 3)))
svg.append('    </svg>')
CAPS = [
    ('c0', 0.2, RAYS, 'enlarge A by 2<i class="genl-ln">from the centre (1, 1)</i>'),
    ('c1', RAYS, DOTS, 'a line from the centre<i class="genl-ln">through each corner</i>'),
    ('c2', DOTS, JOIN, 'twice as far along<i class="genl-ln">each new corner</i>'),
    ('c3', JOIN, 7.4, 'every side × 2<i class="genl-ln">every angle the same</i>'),
    ('c4', 7.4, T, '<b class="genl-g">enlargement, scale factor 2,</b><i class="genl-ln">centre (1, 1)</i>'),
]
STILL = 'c4'
svg.append('    <div class="%s-say">' % P)
for c, a0, b0, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --genl-a: #6fd8c4; --genl-b: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(70vw, 16rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-grid { fill: none; stroke: var(--paper); stroke-opacity: .14; stroke-width: .6; }' % P)
css.append('.%s-obj { fill: var(--genl-a); fill-opacity: .45; stroke: var(--genl-a); stroke-width: 1.6; stroke-linejoin: round; }' % P)
css.append('.%s-img { fill: var(--genl-b); fill-opacity: .35; stroke: var(--genl-b); stroke-width: 1.6; stroke-linejoin: round; }' % P)
css.append('.%s-ray { fill: none; stroke: var(--gold); stroke-width: 1; stroke-opacity: .85; stroke-dasharray: 1; }' % P)
css.append('.%s-dot { fill: var(--genl-b); transform-box: fill-box; transform-origin: center; }' % P)
css.append('.%s-c { fill: var(--gold); }' % P)
css.append('.%s-l { font: 700 10px var(--mono); text-anchor: middle; stroke: var(--bg); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }' % P)
css.append('.%s-lo { fill: var(--genl-a); } .%s-li { fill: var(--genl-b); }' % (P, P))
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }' % P)
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
css.append('.%s-grid { animation: %s-grid %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('grid', 0, 0.6, END, T))
css.append('.%s-obj, .%s-lo, .%s-c { animation: %s-obj %gs ease-in-out infinite; }' % (P, P, P, P, T))
css.append(fade('obj', 0.2, 0.8, END, T))
for k in range(len(SHAPE)):
    css.append('.%s-r%d { animation: %s-r%d %gs ease-in-out infinite; }' % (P, k, P, k, T))
    css.append(draw('r%d' % k, RAYS + 0.3 * k, RAYS + 0.3 * k + 1.0))
    at = DOTS + 0.3 * k
    css.append('.%s-d%d { animation: %s-d%d %gs ease-out infinite; }' % (P, k, P, k, T))
    css.append('@keyframes %s-d%d { 0%%, %s { opacity: 0; transform: scale(.3); } %s { opacity: 1; transform: scale(1.7); } %s, %s { opacity: 1; transform: none; } 100%% { opacity: 0; transform: none; } }'
               % (P, k, pc(at), pc(at + 0.25), pc(at + 0.6), pc(END)))
css.append('.%s-img, .%s-li { animation: %s-img %gs ease-in-out infinite; }' % (P, P, P, T))
css.append(fade('img', JOIN, JOIN + 0.6, END, T))
for c, a0, b0, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a0, a0 + 0.3, b0 - 0.3, b0))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-grid, .%s-obj, .%s-img, .%s-ray, .%s-dot, .%s-c, .%s-l, .%s-s { animation: none; }' % ((P,) * 8))
css.append('}')

anim_row.write_anim('genl', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
