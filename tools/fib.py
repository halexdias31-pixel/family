# The Fibonacci animation (the textbooks' Maths chapter 10, and a loading splash): writes the squares and
# the spiral into its row of data/textbooks.json from the sequence itself. Run: python3 tools/fib.py
#
# ASKED FOR AS "make fibonacci sequence animation smaller so can fit more of it in". It drew five
# squares, 1 1 2 3 5, at eight units a side; this draws EIGHT, 1 1 2 3 5 8 13 21, at two units, in
# the same box on the screen. The ratio of the tiling goes 1.600 -> 1.619, which is the point of the
# picture: the more of the sequence, the nearer the golden ratio.
#
# LAID OUT BY RULE, NOT BY HAND. Each square goes against the whole of what came before, turning
# down, left, up, right, and the arc in each runs from the corner it shares with the last square to
# the opposite corner about the corner that makes it a clockwise quarter turn. The script asserts
# what the old hand-made one had to learn the hard way: every arc starts where the last one ended,
# and the heading is continuous at every joint, so it is a spiral and not a rosette.
#
# REFINED FOR LEARNING (docs/history/410): it was eight squares popping in at once with the numbers in a
# static line. Now it is one loop of T seconds told a term at a time — each square arrives with its
# number in it (from 5 up; 1, 1, 2 and 3 are too small to letter), the term joins the line underneath,
# and the sum that made it is said: 1 + 1 = 2, … 8 + 13 = 21. Then the spiral draws through them and
# the last ratio is set against the golden ratio. The script now writes the whole drawing, markup and
# rules, so nothing of it is left only in the row.
import math, re, pathlib
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

F = [1, 1, 2, 3, 5, 8, 13, 21]
U = 2.0                                   # units per Fibonacci 1
M = 4.0                                   # margin round the tiling

def build(off, start):
    """The tiling turned `off` quarter-steps round, and the spiral from corner `start` of the first
    square. Raises AssertionError if the chain is not a tangent spiral."""
    sq = [(0, 0, 1)]
    x0 = y0 = 0; x1 = y1 = 1
    dirs = ['down', 'left', 'up', 'right']
    for k, s in enumerate(F[1:]):
        d = dirs[(k + off) % 4]
        if d == 'down':   assert x1 - x0 == s; sq.append((x0, y1, s)); y1 += s
        elif d == 'left': assert y1 - y0 == s; sq.append((x0 - s, y0, s)); x0 -= s
        elif d == 'up':   assert x1 - x0 == s; sq.append((x0, y0 - s, s)); y0 -= s
        else:             assert y1 - y0 == s; sq.append((x1, y0, s)); x1 += s
    arcs, heading_out = [], None
    for (x, y, s) in sq:
        cs = corners(x, y, s)
        assert start in cs, 'the spiral left square %s' % ((x, y, s),)
        i = cs.index(start); end = cs[(i + 2) % 4]
        ok = []
        for c in [(start[0], end[1]), (end[0], start[1])]:
            a0 = math.atan2(start[1] - c[1], start[0] - c[0]); a1 = math.atan2(end[1] - c[1], end[0] - c[0])
            if abs(((a1 - a0) % (2 * math.pi)) - math.pi / 2) < 1e-9: ok.append((a0, a1))
        assert len(ok) == 1
        a0, a1 = ok[0]
        h_in = (a0 + math.pi / 2) % (2 * math.pi); h_out = (a1 + math.pi / 2) % (2 * math.pi)
        if heading_out is not None:
            assert abs(((h_in - heading_out + math.pi) % (2 * math.pi)) - math.pi) < 1e-9, 'a cusp'
        heading_out = h_out
        arcs.append((start, end, s)); start = end
    return sq, arcs, (x0, y0, x1, y1)

def corners(x, y, s): return [(x, y), (x + s, y), (x + s, y + s), (x, y + s)]

# LANDSCAPE, LIKE THE ONE IT REPLACES, and the first layout that is a true tangent spiral.
found = None
for off in range(4):
    for st in corners(0, 0, 1):
        try:
            sq, arcs, bb = build(off, st)
        except AssertionError:
            continue
        if bb[2] - bb[0] > bb[3] - bb[1]:
            found = (sq, arcs, bb); break
    if found: break
assert found, 'no landscape tangent spiral'
sq, arcs, (x0, y0, x1, y1) = found
W, H = (x1 - x0) * U + 2 * M, (y1 - y0) * U + 2 * M
P = lambda x, y: ((x - x0) * U + M, (y - y0) * U + M)

f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
T = 13.0                                  # seconds, one whole loop
STEP = 0.9                                # a square, its term and its sum, every STEP seconds
FIRST = 0.4
SPIRAL = (FIRST + STEP * len(F) + 0.2, FIRST + STEP * len(F) + 2.6)
RATIO = SPIRAL[1]
END = T - 0.8
def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def fade(name, a, b, c, d):
    return ('@keyframes fb-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (name, pc(a), pc(b), pc(c), pc(d)))
AT = [FIRST + STEP * k for k in range(len(F))]

out = ['<div id="splash-fib" aria-hidden="true">', '    <svg class="fb-svg" viewBox="0 0 %s %s">' % (f(W), f(H))]
for k, (x, y, s) in enumerate(sq):
    px, py = P(x, y)
    lab = ''
    if F[k] >= 5:                         # big enough to letter at phone width
        lab = '<text class="fb-n" x="%s" y="%s" style="--fb-fs: %spx">%d</text>' % (f(px + s * U / 2), f(py + s * U / 2 + s * U * .15), f(s * U * .42), F[k])
    out.append('      <g class="fb-g fb-s%d"><rect class="fb-sq" x="%s" y="%s" width="%s" height="%s"/>%s</g>' % (k, f(px), f(py), f(s * U), f(s * U), lab))
sx, sy = P(*arcs[0][0])
d = 'M%s %s ' % (f(sx), f(sy)) + ' '.join('A%s %s 0 0 1 %s %s' % ((f(s * U), f(s * U)) + tuple(f(v) for v in P(*e)))
                                          for (_, e, s) in arcs)
out.append('      <path class="fb-arc" pathLength="1" d="%s"/>' % d)
out.append('    </svg>')
out.append('    <div class="fb-say">')
out.append('      <div class="fb-line">%s</div>' % ' '.join('<span class="fb-t fb-t%d">%d</span>' % (k, v) for k, v in enumerate(F)))
SAY = [('r0', AT[0], AT[2], 'start with 1 and 1')]
for k in range(2, len(F)):
    SAY.append(('r%d' % k, AT[k], AT[k] + STEP if k < len(F) - 1 else RATIO, '%d + %d = <b class="fb-g2">%d</b>' % (F[k - 2], F[k - 1], F[k])))
SAY.append(('rr', RATIO, T, '%d ÷ %d = %.3f<i class="fb-ln">near the golden ratio 1.618</i>' % (F[-1], F[-2], F[-1] / F[-2])))
out.append('      <div class="fb-rules">')
for c, a, b, html in SAY:
    out.append('        <span class="fb-r fb-%s">%s</span>' % (c, html))
out.append('      </div>')
out.append('    </div>')
out.append('  </div>')

css = []
css.append('.an-fib { text-align: center; }')
css.append('.an-fib .fb-svg { display: block; width: min(72vw, 17rem); max-width: 100%; height: auto; margin: 0 auto; }')
css.append('.fb-sq { fill: rgb(111 168 220 / .12); stroke: #6fa8dc; stroke-width: .55; }')
css.append('.fb-n { font: 700 var(--fb-fs, 6px) var(--mono); fill: #6fa8dc; text-anchor: middle; }')
css.append('.fb-arc { fill: none; stroke: #f0b45f; stroke-width: 1.1; stroke-linecap: round; stroke-dasharray: 1; }')
css.append('.fb-say { margin-top: .7rem; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }')
css.append('.fb-line { letter-spacing: .12em; color: #f0b45f; }')
css.append('.fb-rules { display: grid; min-height: 2.6em; align-items: center; }')
css.append('.fb-r { grid-area: 1 / 1; }')
css.append('.fb-rules b.fb-g2 { color: #f0b45f; }')
css.append('.fb-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }')
# THE STILL (reduced motion): every square lettered, the spiral drawn, the whole line, and the ratio.
css.append('.fb-r:not(.fb-rr) { opacity: 0; }')
for k in range(len(F)):
    css.append('.fb-s%d { transform-box: fill-box; transform-origin: center; animation: fb-s%d %gs ease-out infinite; }' % (k, k, T))
    css.append('@keyframes fb-s%d { 0%%, %s { opacity: 0; transform: scale(.7); } %s, %s { opacity: 1; transform: none; } 100%% { opacity: 0; transform: none; } }'
               % (k, pc(AT[k]), pc(AT[k] + 0.4), pc(END)))
    css.append('.fb-t%d { animation: fb-t%d %gs ease-in-out infinite; }' % (k, k, T))
    css.append(fade('t%d' % k, AT[k] + 0.1, AT[k] + 0.4, END, T))
css.append('.fb-arc { animation: fb-arc %gs ease-in-out infinite; }' % T)
css.append('@keyframes fb-arc { 0%%, %s { stroke-dashoffset: 1; opacity: 0; } %s { stroke-dashoffset: 1; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } 100%% { stroke-dashoffset: 0; opacity: 0; } }'
           % (pc(SPIRAL[0]), pc(SPIRAL[0] + .05), pc(SPIRAL[1]), pc(END)))
for c, a, b, html in SAY:
    css.append('.fb-%s { animation: fb-%s %gs ease-in-out infinite; }' % (c, c, T))
    css.append(fade(c, a, a + 0.25, b - 0.25, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .fb-g, .fb-t, .fb-arc, .fb-r { animation: none; }')
css.append('}')

# INTO ITS ROW IN data/textbooks.json, not index.html — see tools/anim_row.py.
anim_row.write_anim('fib', html='\n'.join(out), css='\n'.join(css))
length = sum(math.pi / 2 * s * U for s in F)
print('viewBox %s x %s, %d squares, ratio %.3f, arc length %.1f' % (f(W), f(H), len(sq), (x1 - x0) / (y1 - y0), length))
