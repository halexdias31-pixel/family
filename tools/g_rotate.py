# A rotation about a point, described fully (GCSE Maths chapter 14): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the shape or the timeline and re-run:
# python3 tools/g_rotate.py
#
# WHAT IT DRAWS, in one loop of T seconds, on a grid: a triangle; the centre (0, 0) marked; a copy of
# the triangle, like tracing paper pinned at the centre, turning a quarter turn clockwise while one
# corner sweeps its arc; the image left where it lands; then the description a mark scheme asks for —
# rotation, 90° clockwise, about (0, 0). The copy turns by CSS rotate about the centre's own point
# (transform-box: view-box), which on a y-down screen is clockwise for a positive angle.
import math
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'grot'
T = 13.0
W, H = 150, 132
O, S = (75, 66), 11                 # the centre (0, 0) and one square
SHAPE = [(1, 1), (4, 1), (1, 3)]
CORNER = (4, 1)                     # the corner whose arc is drawn
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
def pt(v): return (O[0] + S * v[0], O[1] - S * v[1])
def cw(v): return (v[1], -v[0])     # a quarter turn clockwise about (0, 0)
def poly(vs): return 'M' + 'L'.join('%s %s' % (f(pt(v)[0]), f(pt(v)[1])) for v in vs) + 'Z'
IMG = [cw(v) for v in SHAPE]
TURN = (2.8, 5.2)

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
grid = ''.join('M%s %sV%s' % (f(pt((i, 0))[0]), f(pt((0, 5.5))[1]), f(pt((0, -5.5))[1])) for i in range(-6, 7)) + \
       ''.join('M%s %sH%s' % (f(pt((-6, 0))[0]), f(pt((0, j))[1]), f(pt((6, 0))[0])) for j in range(-5, 6))
svg.append('      <g class="%s-paper"><path class="%s-grid" d="%s"/>' % (P, P, grid))
svg.append('        <path class="%s-axis" d="M%s %dH%s M%d %sV%s"/></g>' % (P, f(pt((-6, 0))[0]), O[1], f(pt((6, 0))[0]), O[0], f(pt((0, 5.5))[1]), f(pt((0, -5.5))[1])))
svg.append('      <path class="%s-obj" d="%s"/>' % (P, poly(SHAPE)))
svg.append('      <path class="%s-img" d="%s"/>' % (P, poly(IMG)))
r = S * math.hypot(*CORNER)
a, b = pt(CORNER), pt(cw(CORNER))
svg.append('      <path class="%s-arc" pathLength="1" d="M%s %sA%s %s 0 0 1 %s %s"/>' % (P, f(a[0]), f(a[1]), f(r), f(r), f(b[0]), f(b[1])))
svg.append('      <g class="%s-copy"><path class="%s-trace" d="%s"/><path class="%s-arm" d="M%d %dL%s %s"/></g>' % (P, P, poly(SHAPE), P, O[0], O[1], f(a[0]), f(a[1])))
svg.append('      <circle class="%s-ring" cx="%d" cy="%d" r="5"/>' % (P, O[0], O[1]))
svg.append('      <circle class="%s-c" cx="%d" cy="%d" r="2.6"/>' % (P, O[0], O[1]))
svg.append('      <text class="%s-l %s-lo" x="%s" y="%s">A</text>' % (P, P, f(pt((2, 1.7))[0]), f(pt((2, 1.7))[1] + 3)))
svg.append('      <text class="%s-l %s-li" x="%s" y="%s">B</text>' % (P, P, f(pt((1.7, -2))[0]), f(pt((1.7, -2))[1] + 3)))
svg.append('    </svg>')
CAPS = [
    ('c0', 0.2, 1.6, 'turn triangle A<i class="grot-ln">90° clockwise about (0, 0)</i>'),
    ('c1', 1.6, TURN[0], 'the centre stays still'),
    ('c2', TURN[0], 5.6, 'every point turns 90°<i class="grot-ln">round the centre</i>'),
    ('c3', 5.6, 7.6, 'B is A turned<i class="grot-ln">same distance from the centre</i>'),
    ('c4', 7.6, T, '<b class="grot-g">rotation, 90° clockwise,</b><i class="grot-ln">about (0, 0)</i>'),
]
STILL = 'c4'
svg.append('    <div class="%s-say">' % P)
for c, a0, b0, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --grot-a: #6fd8c4; --grot-b: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(66vw, 15rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-grid { fill: none; stroke: var(--paper); stroke-opacity: .13; stroke-width: .6; }' % P)
css.append('.%s-axis { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1; }' % P)
css.append('.%s-obj { fill: var(--grot-a); fill-opacity: .4; stroke: var(--grot-a); stroke-width: 1.6; stroke-linejoin: round; }' % P)
css.append('.%s-img { fill: var(--grot-b); fill-opacity: .4; stroke: var(--grot-b); stroke-width: 1.6; stroke-linejoin: round; }' % P)
css.append('.%s-trace { fill: none; stroke: var(--gold); stroke-width: 1.4; stroke-linejoin: round; }' % P)
css.append('.%s-arm { stroke: var(--gold); stroke-width: 1; stroke-opacity: .8; }' % P)
css.append('.%s-arc { fill: none; stroke: var(--gold); stroke-width: 1.2; stroke-dasharray: 1; }' % P)
css.append('.%s-c { fill: var(--gold); }' % P)
css.append('.%s-ring { fill: none; stroke: var(--gold); stroke-width: 1.2; transform-box: fill-box; transform-origin: center; }' % P)
css.append('.%s-l { font: 700 10px var(--mono); text-anchor: middle; stroke: var(--bg); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }' % P)
css.append('.%s-lo { fill: var(--grot-a); } .%s-li { fill: var(--grot-b); }' % (P, P))
css.append('.%s-copy { transform-box: view-box; transform-origin: %dpx %dpx; }' % (P, O[0], O[1]))
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }' % P)
# THE STILL: A, B and the arc between them, with the full description; the turning copy is hidden.
css.append('.%s-copy, .%s-ring, .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, P, STILL))
css.append('.%s-paper { animation: %s-paper %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('paper', 0, 0.6, END, T))
css.append('.%s-obj, .%s-lo { animation: %s-obj %gs ease-in-out infinite; }' % (P, P, P, T))
css.append(fade('obj', 0.2, 0.8, END, T))
css.append('.%s-c { animation: %s-c %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('c', 1.6, 1.9, END, T))
css.append('.%s-ring { animation: %s-ring %gs ease-out infinite; }' % (P, P, T))
css.append('@keyframes %s-ring { 0%%, %s { opacity: 0; transform: scale(.4); } %s { opacity: 1; transform: scale(.7); } %s, 100%% { opacity: 0; transform: scale(2.4); } }'
           % (P, pc(1.6), pc(1.8), pc(2.8)))
css.append('.%s-copy { animation: %s-copy %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-copy { 0%%, %s { opacity: 0; transform: none; } %s, %s { opacity: 1; transform: none; } %s { opacity: 1; transform: rotate(90deg); } %s, 100%% { opacity: 0; transform: rotate(90deg); } }'
           % (P, pc(TURN[0] - 0.4), pc(TURN[0]), pc(TURN[0]), pc(TURN[1]), pc(TURN[1] + 0.6)))
css.append('.%s-arc { animation: %s-arc %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-arc { 0%%, %s { stroke-dashoffset: 1; opacity: 0; } %s { stroke-dashoffset: 1; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } 100%% { stroke-dashoffset: 0; opacity: 0; } }'
           % (P, pc(TURN[0]), pc(TURN[0] + .05), pc(TURN[1]), pc(END)))
css.append('.%s-img, .%s-li { animation: %s-img %gs ease-in-out infinite; }' % (P, P, P, T))
css.append(fade('img', TURN[1] - 0.1, TURN[1] + 0.5, END, T))
for c, a0, b0, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a0, a0 + 0.3, b0 - 0.3, b0))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-paper, .%s-obj, .%s-img, .%s-l, .%s-c, .%s-ring, .%s-copy, .%s-arc, .%s-s { animation: none; }' % ((P,) * 9))
css.append('}')

anim_row.write_anim('grot', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
