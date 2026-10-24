# Simultaneous equations as two lines meeting (GCSE Maths chapter 8): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the lines or the timeline and re-run:
# python3 tools/g_simul.py
#
# WHAT IT DRAWS, in one loop of T seconds: 3x + 2y = 16 drawn as a line (every point on it fits that
# equation), then x − 2y = 0 (every point on it fits that one); the one point on both lights up at
# (4, 2), its coordinates dropped to the axes, and the algebra that finds it without a graph is said
# underneath — add the equations and the y's cancel. Lines draw by stroke-dashoffset on pathLength 1.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gsim'
T = 13.0
W, H = 200, 140
O, S = (30, 126), 13                # the origin in the viewBox, and one unit
NX, NY = 9, 8
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

# A LINE IS HIDDEN UNTIL ITS DRAW BEGINS: a dash of no length still paints its round cap, a dot at the end.
def draw(name, a, b):
    """a line drawn from its start over [a, b], held, gone with everything at END."""
    return ('@keyframes %s-%s { 0%%, %s { stroke-dashoffset: 1; opacity: 0; } %s { stroke-dashoffset: 1; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } 100%% { stroke-dashoffset: 0; opacity: 0; } }'
            % (P, name, pc(a), pc(a + .05), pc(b), pc(END)))

def pt(x, y): return (O[0] + S * x, O[1] - S * y)
f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')

L1 = (pt(0, 8), pt(16 / 3, 0))      # 3x + 2y = 16
L2 = (pt(0, 0), pt(9, 4.5))         # x − 2y = 0
MEET = pt(4, 2)
D1, D2, DOT = (0.8, 2.3), (3.3, 4.8), 5.8
CAPS = [
    ('c1', 0.6, 3.1, '3x + 2y = 16<i class="gsim-ln">every point on the line fits it</i>'),
    ('c2', 3.1, 5.6, 'x − 2y = 0<i class="gsim-ln">and every point on this one</i>'),
    ('c3', 5.6, 8.0, 'they meet at (4, 2)<i class="gsim-ln">the one point that fits both</i>'),
    ('c4', 8.0, 10.4, 'add them: 4x = 16<i class="gsim-ln">so x = 4, and then y = 2</i>'),
    ('c5', 10.4, T, '<b class="gsim-g">x = 4, y = 2</b><i class="gsim-ln">where the two lines cross</i>'),
]
STILL = 'c5'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
grid = ''.join('M%s %sV%s' % (f(pt(i, 0)[0]), f(O[1]), f(pt(0, NY)[1])) for i in range(1, NX + 1)) + \
       ''.join('M%s %sH%s' % (f(O[0]), f(pt(0, j)[1]), f(pt(NX, 0)[0])) for j in range(1, NY + 1))
svg.append('      <g class="%s-ax">' % P)
svg.append('        <path class="%s-grid" d="%s"/>' % (P, grid))
svg.append('        <path class="%s-axis" d="M%d %dH%s M%d %dV%s"/>' % (P, O[0], O[1], f(pt(NX, 0)[0] + 6), O[0], O[1], f(pt(0, NY)[1] - 6)))
for i in (2, 4, 6, 8):
    svg.append('        <text class="%s-num" x="%s" y="%d">%d</text>' % (P, f(pt(i, 0)[0]), O[1] + 10, i))
    svg.append('        <text class="%s-num" x="%d" y="%s">%d</text>' % (P, O[0] - 6, f(pt(0, i)[1] + 3), i))
svg.append('        <text class="%s-num" x="%s" y="%d">x</text><text class="%s-num" x="%d" y="%s">y</text>'
           % (P, f(pt(NX, 0)[0] + 10), O[1] + 3, P, O[0], f(pt(0, NY)[1] - 9)))
svg.append('      </g>')
for n, (a, b) in (('l1', L1), ('l2', L2)):
    svg.append('      <path class="%s-line %s-%s" pathLength="1" d="M%s %sL%s %s"/>' % (P, P, n, f(a[0]), f(a[1]), f(b[0]), f(b[1])))
svg.append('      <text class="%s-lab %s-t1" x="%s" y="%s">3x + 2y = 16</text>' % (P, P, f(pt(1.6, 7)[0]), f(pt(1.6, 7)[1])))
svg.append('      <text class="%s-lab %s-t2" x="%s" y="%s">x − 2y = 0</text>' % (P, P, f(pt(6.2, 5.3)[0]), f(pt(6.2, 5.3)[1])))
svg.append('      <path class="%s-drop" d="M%s %sV%d M%s %sH%d"/>' % (P, f(MEET[0]), f(MEET[1]), O[1], f(MEET[0]), f(MEET[1]), O[0]))
svg.append('      <circle class="%s-ring" cx="%s" cy="%s" r="6"/>' % (P, f(MEET[0]), f(MEET[1])))
svg.append('      <circle class="%s-dot" cx="%s" cy="%s" r="3.2"/>' % (P, f(MEET[0]), f(MEET[1])))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gsim-a: #6fd8c4; --gsim-b: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(76vw, 18rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-grid { fill: none; stroke: var(--paper); stroke-opacity: .12; stroke-width: .6; }' % P)
css.append('.%s-axis { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.1; }' % P)
css.append('.%s-num { font: 400 8px var(--mono); fill: var(--paper); fill-opacity: .7; text-anchor: middle; }' % P)
css.append('.%s-line { fill: none; stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 1; }' % P)
css.append('.%s-l1 { stroke: var(--gsim-a); } .%s-l2 { stroke: var(--gsim-b); }' % (P, P))
css.append('.%s-lab { font: 700 9px var(--mono); text-anchor: middle; stroke: var(--bg); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }' % P)
css.append('.%s-t1 { fill: var(--gsim-a); text-anchor: start; } .%s-t2 { fill: var(--gsim-b); }' % (P, P))
css.append('.%s-drop { fill: none; stroke: var(--gold); stroke-width: 1; stroke-dasharray: 3 2.5; }' % P)
css.append('.%s-dot { fill: var(--gold); }' % P)
css.append('.%s-ring { fill: none; stroke: var(--gold); stroke-width: 1.2; transform-box: fill-box; transform-origin: center; }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); font-size: 1.15em; }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }' % P)
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
css.append('.%s-ax { animation: %s-ax %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('ax', 0, 0.6, END, T))
css.append('.%s-l1 { animation: %s-l1 %gs ease-in-out infinite; }' % (P, P, T))
css.append(draw('l1', *D1))
css.append('.%s-l2 { animation: %s-l2 %gs ease-in-out infinite; }' % (P, P, T))
css.append(draw('l2', *D2))
css.append('.%s-t1 { animation: %s-t1 %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('t1', D1[1] - 0.4, D1[1], END, T))
css.append('.%s-t2 { animation: %s-t2 %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('t2', D2[1] - 0.4, D2[1], END, T))
css.append('.%s-dot { animation: %s-dot %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('dot', DOT, DOT + 0.3, END, T))
css.append('.%s-drop { animation: %s-drop %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('drop', DOT + 0.6, DOT + 1.2, END, T))
css.append('.%s-ring { opacity: 0; animation: %s-ring %gs ease-out infinite; }' % (P, P, T))
css.append('@keyframes %s-ring { 0%%, %s { opacity: 0; transform: scale(.4); } %s { opacity: 1; transform: scale(.6); } %s, 100%% { opacity: 0; transform: scale(2.2); } }'
           % (P, pc(DOT), pc(DOT + 0.2), pc(DOT + 1.4)))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-ax, .%s-line, .%s-lab, .%s-dot, .%s-drop, .%s-ring, .%s-s { animation: none; }' % (P, P, P, P, P, P, P))
css.append('}')

anim_row.write_anim('gsim', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
