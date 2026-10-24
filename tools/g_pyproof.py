# Pythagoras proved by rearranging (GCSE Maths chapter 17): writes its row of data/textbooks.json
# through tools/anim_row.py. Edit the legs or the timeline and re-run: python3 tools/g_pyproof.py
#
# WHAT IT DRAWS, in one loop of T seconds: a square of side a + b holding four copies of one right
# triangle (legs a and b, hypotenuse c), leaving a tilted square c² in the middle. The same four slide
# — translations only, no turning — into two rectangles, and the space they leave is now a² and b².
# Same big square, same four triangles, so the gaps are equal: c² = a² + b². Then they slide back.
# The translations are worked out by hand below and checked: every corner lands inside the square.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gpyr'
T = 14.0
W, H = 200, 108
A, B = 3, 4                         # the legs, in units
U = 12                              # one unit, in the viewBox
X0, Y0 = (W - (A + B) * U) / 2, 12  # the big square's top-left corner
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
def pt(x, y): return (X0 + U * x, Y0 + U * y)
def poly(vs): return 'M' + 'L'.join('%s %s' % (f(pt(*v)[0]), f(pt(*v)[1])) for v in vs) + 'Z'
S = A + B
# the four triangles round the tilted square, and how far each slides (in units) to the second picture
TRI = [
    ('t1', [(0, 0), (A, 0), (0, B)], (0, A)),
    ('t2', [(A, 0), (S, 0), (S, A)], (0, 0)),
    ('t3', [(S, A), (S, S), (B, S)], (-B, 0)),
    ('t4', [(B, S), (0, S), (0, B)], (A, -B)),
]
for _, vs, (dx, dy) in TRI:
    assert all(0 <= x + dx <= S and 0 <= y + dy <= S for x, y in vs)
INNER = [(A, 0), (S, A), (B, S), (0, B)]
GO, BACK = (3.6, 5.0), (10.0, 11.4)
CSQ, ABSQ, SAY = 1.6, 5.4, 7.4

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <path class="%s-sqc" d="%s"/>' % (P, poly(INNER)))
svg.append('      <path class="%s-sqa" d="%s"/>' % (P, poly([(0, 0), (A, 0), (A, A), (0, A)])))
svg.append('      <path class="%s-sqb" d="%s"/>' % (P, poly([(A, A), (S, A), (S, S), (A, S)])))
for c, vs, d in TRI:
    svg.append('      <path class="%s-tri %s-%s" d="%s"/>' % (P, P, c, poly(vs)))
svg.append('      <rect class="%s-out" x="%s" y="%s" width="%d" height="%d"/>' % (P, f(X0), f(Y0), S * U, S * U))
cx, cy = pt(S / 2, S / 2)
svg.append('      <text class="%s-big %s-tc" x="%s" y="%s">c²</text>' % (P, P, f(cx), f(cy + 5)))
ax, ay = pt(A / 2, A / 2); bx, by = pt(A + B / 2, A + B / 2)
svg.append('      <text class="%s-big %s-ta" x="%s" y="%s">a²</text>' % (P, P, f(ax), f(ay + 5)))
svg.append('      <text class="%s-big %s-tb" x="%s" y="%s">b²</text>' % (P, P, f(bx), f(by + 5)))
# the sides: a and b along the top and down the right, the same in both pictures
for (x1, x2), ch in (((0, A), 'a'), ((A, S), 'b')):
    m = pt((x1 + x2) / 2, 0)
    svg.append('      <text class="%s-s %s-e%s" x="%s" y="%s">%s</text>' % (P, P, ch, f(m[0]), f(m[1] - 3), ch))
for (y1, y2), ch in (((0, A), 'a'), ((A, S), 'b')):
    m = pt(S, (y1 + y2) / 2)
    svg.append('      <text class="%s-s %s-e%s" x="%s" y="%s">%s</text>' % (P, P, ch, f(m[0] + 7), f(m[1] + 3), ch))
svg.append('    </svg>')
CAPS = [
    ('c0', 0.2, CSQ, 'four copies of one triangle<i class="gpyr-ln">legs a and b, long side c</i>'),
    ('c1', CSQ, GO[0], 'the space left: <b class="gpyr-g">c²</b><i class="gpyr-ln">a square on the long side</i>'),
    ('c2', GO[0], ABSQ, 'slide the same four'),
    ('c3', ABSQ, SAY, 'the space left: <b class="gpyr-a">a²</b> + <b class="gpyr-b">b²</b><i class="gpyr-ln">same big square, same triangles</i>'),
    ('c4', SAY, T, '<b class="gpyr-g">c² = a² + b²</b><i class="gpyr-ln">Pythagoras, with no numbers</i>'),
]
STILL = 'c4'
svg.append('    <div class="%s-say">' % P)
for c, a0, b0, html in CAPS:
    svg.append('      <span class="%s-s2 %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gpyr-a: #6fd8c4; --gpyr-b: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(76vw, 18rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-out { fill: none; stroke: var(--paper); stroke-opacity: .8; stroke-width: 1.4; }' % P)
css.append('.%s-tri { fill: #e8862c; fill-opacity: .55; stroke: #e8862c; stroke-width: 1.2; stroke-linejoin: round; }' % P)
css.append('.%s-sqc { fill: var(--gold); fill-opacity: .35; }' % P)
css.append('.%s-sqa { fill: var(--gpyr-a); fill-opacity: .4; } .%s-sqb { fill: var(--gpyr-b); fill-opacity: .4; }' % (P, P))
css.append('.%s-big { font: 700 15px var(--mono); text-anchor: middle; fill: var(--paper); }' % P)
css.append('.%s-tc { fill: var(--gold); } .%s-ta { fill: var(--gpyr-a); } .%s-tb { fill: var(--gpyr-b); }' % (P, P, P))
css.append('.%s-s { font: 700 10px var(--mono); text-anchor: middle; fill: var(--paper); fill-opacity: .85; }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s2 { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); } .%s-say b.%s-a { color: var(--gpyr-a); } .%s-say b.%s-b { color: var(--gpyr-b); }' % ((P,) * 6))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }' % P)
# THE STILL is the second picture: the triangles moved (their base transform), a² and b² shaded.
for c, vs, (dx, dy) in TRI:
    off = 'translate(%dpx, %dpx)' % (dx * U, dy * U)
    css.append('.%s-%s { transform: %s; animation: %s-%s %gs ease-in-out infinite; }' % (P, c, off, P, c, T))
    css.append('@keyframes %s-%s { 0%%, %s { transform: none; } %s, %s { transform: %s; } %s, 100%% { transform: none; } }'
               % (P, c, pc(GO[0]), pc(GO[1]), pc(BACK[0]), off, pc(BACK[1])))
css.append('.%s-sqc, .%s-tc, .%s-s2:not(.%s-%s) { opacity: 0; }' % (P, P, P, P, STILL))
css.append('.%s-sqc, .%s-tc { animation: %s-sqc %gs ease-in-out infinite; }' % (P, P, P, T))
css.append(fade('sqc', CSQ, CSQ + 0.5, GO[0] - 0.4, GO[0]))
css.append('.%s-sqa, .%s-sqb, .%s-ta, .%s-tb { animation: %s-ab %gs ease-in-out infinite; }' % (P, P, P, P, P, T))
css.append(fade('ab', ABSQ, ABSQ + 0.5, BACK[0] - 0.4, BACK[0]))
for c, a0, b0, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a0, a0 + 0.3, b0 - 0.3, b0))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-tri, .%s-sqc, .%s-sqa, .%s-sqb, .%s-big, .%s-s2 { animation: none; }' % ((P,) * 6))
css.append('}')

anim_row.write_anim('gpyr', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
