# Similar shapes: length ×k, area ×k², volume ×k³ (GCSE Maths chapter 14): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the sizes or the timeline and re-run:
# python3 tools/g_similar.py
#
# WHAT IT DRAWS, in one loop of T seconds: a unit square beside a unit cube, then both scaled by 2 and
# by 3, each drawn ruled into unit pieces so the count can be seen — 1, 4, 9 squares; 1, 8, 27 cubes —
# and the rule said last: area factor k², volume factor k³. The cube is drawn in isometric projection,
# three faces ruled k by k. Each size is its own group, crossfaded.
import math
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gsimi'
T = 12.5
W, H = 220, 120
SQ = (24, 98, 19)                   # the square's bottom-left corner and one unit
CU = (160, 100, 13)                 # the cube's bottom front corner and one unit edge
KS = [1, 2, 3]
STAGE = [(0.3, 3.2), (3.2, 6.2), (6.2, None)]
RULE = 9.0
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
c30, s30 = math.cos(math.radians(30)), 0.5
def iso(x, y, z):
    e = CU[2]
    return (CU[0] + (x - y) * c30 * e, CU[1] - (x + y) * s30 * e - z * e)
def poly(pts): return 'M' + 'L'.join('%s %s' % (f(p[0]), f(p[1])) for p in pts) + 'Z'
def seg(a, b): return 'M%s %sL%s %s' % (f(a[0]), f(a[1]), f(b[0]), f(b[1]))

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for k in KS:
    x0, y0, u = SQ
    svg.append('      <g class="%s-k %s-k%d">' % (P, P, k))
    svg.append('        <rect class="%s-sq" x="%d" y="%d" width="%d" height="%d"/>' % (P, x0, y0 - u * k, u * k, u * k))
    if k > 1:
        d = ''.join('M%d %dV%d' % (x0 + u * i, y0 - u * k, y0) for i in range(1, k)) + ''.join('M%d %dH%d' % (x0, y0 - u * j, x0 + u * k) for j in range(1, k))
        svg.append('        <path class="%s-rule" d="%s"/>' % (P, d))
    svg.append('        <rect class="%s-one" x="%d" y="%d" width="%d" height="%d"/>' % (P, x0, y0 - u, u, u))
    svg.append('        <text class="%s-n" x="%g" y="%d">%d</text>' % (P, x0 + u * k / 2, y0 + 14, k * k))
    # the cube: left face (x = 0), right face (y = 0), top (z = k), each ruled k by k
    left = [iso(0, 0, 0), iso(0, k, 0), iso(0, k, k), iso(0, 0, k)]
    right = [iso(0, 0, 0), iso(k, 0, 0), iso(k, 0, k), iso(0, 0, k)]
    top = [iso(0, 0, k), iso(k, 0, k), iso(k, k, k), iso(0, k, k)]
    svg.append('        <path class="%s-fl" d="%s"/><path class="%s-fr" d="%s"/><path class="%s-ft" d="%s"/>'
               % (P, poly(left), P, poly(right), P, poly(top)))
    if k > 1:
        d = ''
        for i in range(1, k):
            d += seg(iso(0, i, 0), iso(0, i, k)) + seg(iso(0, 0, i), iso(0, k, i))      # left face
            d += seg(iso(i, 0, 0), iso(i, 0, k)) + seg(iso(0, 0, i), iso(k, 0, i))      # right face
            d += seg(iso(i, 0, k), iso(i, k, k)) + seg(iso(0, i, k), iso(k, i, k))      # top
        svg.append('        <path class="%s-rule" d="%s"/>' % (P, d))
    # one unit cube, the front top corner, in the same gold as the unit square: the piece being counted
    one = [poly([iso(0, 0, k - 1), iso(0, 1, k - 1), iso(0, 1, k), iso(0, 0, k)]),
           poly([iso(0, 0, k - 1), iso(1, 0, k - 1), iso(1, 0, k), iso(0, 0, k)]),
           poly([iso(0, 0, k), iso(1, 0, k), iso(1, 1, k), iso(0, 1, k)])]
    svg.append('        <path class="%s-one" d="%s"/>' % (P, ''.join(one)))
    svg.append('        <text class="%s-n" x="%s" y="%d">%d</text>' % (P, f(CU[0]), CU[1] + 14, k ** 3))
    svg.append('      </g>')
svg.append('    </svg>')
CAPS = [
    ('c1', 0.3, 3.2, 'length × 1<i class="gsimi-ln">area 1, volume 1</i>'),
    ('c2', 3.2, 6.2, 'length × 2<i class="gsimi-ln">area × 4, volume × 8</i>'),
    ('c3', 6.2, RULE, 'length × 3<i class="gsimi-ln">area × 9, volume × 27</i>'),
    ('c4', RULE, T, '<b class="gsimi-g">area × k², volume × k³</b><i class="gsimi-ln">when every length is × k</i>'),
]
STILL = 'c4'
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gsimi-a: #6fd8c4; --gsimi-v: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(80vw, 19rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-sq { fill: var(--gsimi-a); fill-opacity: .3; stroke: var(--gsimi-a); stroke-width: 1.4; }' % P)
css.append('.%s-one { fill: var(--gold); fill-opacity: .45; stroke: var(--gold); stroke-width: 1; }' % P)
css.append('.%s-rule { fill: none; stroke: var(--paper); stroke-opacity: .55; stroke-width: .7; }' % P)
css.append('.%s-fl, .%s-fr, .%s-ft { stroke: var(--gsimi-v); stroke-width: 1.4; stroke-linejoin: round; fill: var(--gsimi-v); }' % (P, P, P))
css.append('.%s-fl { fill-opacity: .22; } .%s-fr { fill-opacity: .4; } .%s-ft { fill-opacity: .6; }' % (P, P, P))
css.append('.%s-n { font: 700 11px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }' % P)
# THE STILL: the largest size, every piece countable, and the rule.
css.append('.%s-k:not(.%s-k3), .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, P, STILL))
X = 0.4
for k, (a, b) in zip(KS, STAGE):
    css.append('.%s-k%d { animation: %s-k%d %gs ease-in-out infinite; }' % (P, k, P, k, T))
    css.append(fade('k%d' % k, max(0, a - X / 2), a + X / 2, b - X / 2, b + X / 2) if b else fade('k%d' % k, a - X / 2, a + X / 2, END, T))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-k, .%s-s { animation: none; }' % (P, P))
css.append('}')

anim_row.write_anim('gsimi', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
