# Cumulative frequency to a box plot (GCSE Maths chapter 20): writes its row of data/textbooks.json
# through tools/anim_row.py. Edit the data or the timeline and re-run: python3 tools/g_cumfreq.py
#
# WHAT IT DRAWS, in one loop of T seconds: sixty times, in minutes, as a running total plotted at each
# class's upper end; a smooth curve through them; the median read across from the 30th and down, then
# the quartiles from the 15th and the 45th; a box plot drawn straight under those three readings, whiskers to
# the lowest and highest times; and the interquartile range said. The curve is a monotone cubic
# (Fritsch–Carlson), so it never turns back down, and every reading is taken off the curve as drawn.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gcf'
T = 17.0
W, H = 220, 160
O = (30, 104)                       # the graph's origin
SX, SY = 2.8, 1.45                  # one minute across, one person up
UP = [0, 10, 20, 30, 40, 50, 60]    # class ends, minutes
CF = [0, 4, 14, 32, 52, 58, 60]     # the running total at each
LOW, HIGH = 3, 57                   # the fastest and slowest, which a box plot needs and a curve cannot give
BOX = (124, 140)                    # the box plot's top and bottom
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
def X(m): return O[0] + SX * m
def Y(n): return O[1] - SY * n

# ---- the monotone cubic through the points, as Bézier segments in data units -----------------------
n = len(UP)
d = [(CF[k + 1] - CF[k]) / (UP[k + 1] - UP[k]) for k in range(n - 1)]
m = [d[0]] + [0 if d[k - 1] * d[k] <= 0 else (d[k - 1] + d[k]) / 2 for k in range(1, n - 1)] + [d[-1]]
for k in range(n - 1):
    if d[k] == 0: m[k] = m[k + 1] = 0; continue
    a, b = m[k] / d[k], m[k + 1] / d[k]
    s = a * a + b * b
    if s > 9: t = 3 / s ** .5; m[k], m[k + 1] = t * a * d[k], t * b * d[k]
SEG = []
for k in range(n - 1):
    h = UP[k + 1] - UP[k]
    SEG.append(((UP[k], CF[k]), (UP[k] + h / 3, CF[k] + m[k] * h / 3), (UP[k + 1] - h / 3, CF[k + 1] - m[k + 1] * h / 3), (UP[k + 1], CF[k + 1])))
CURVE = 'M%s %s' % (f(X(0)), f(Y(0))) + ''.join('C%s %s %s %s %s %s' % (f(X(b[0])), f(Y(b[1])), f(X(c[0])), f(Y(c[1])), f(X(e[0])), f(Y(e[1]))) for a, b, c, e in SEG)

def bez(seg, t):
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = seg
    u = 1 - t
    return (u ** 3 * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3 * x3, u ** 3 * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3 * y3)

def read(target):
    """the time at which the curve reaches `target` people, found on the curve as drawn"""
    for seg in SEG:
        if seg[0][1] <= target <= seg[3][1]:
            lo, hi = 0.0, 1.0
            for _ in range(60):
                mid = (lo + hi) / 2
                if bez(seg, mid)[1] < target: lo = mid
                else: hi = mid
            return bez(seg, lo)[0]
    raise SystemExit('no reading for %s' % target)

TOTAL = CF[-1]
Q = {'q2': read(TOTAL / 2), 'q1': read(TOTAL / 4), 'q3': read(3 * TOTAL / 4)}
R = {k: round(v) for k, v in Q.items()}
AT = {'q2': 4.0, 'q1': 6.2, 'q3': 8.0}
DOWN, BOXT, IQR = 9.8, 10.0, 12.4

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <g class="%s-ax">' % P)
grid = ''.join('M%s %sV%s' % (f(X(u)), f(O[1]), f(Y(60))) for u in UP[1:]) + ''.join('M%s %sH%s' % (f(X(0)), f(Y(c)), f(X(60))) for c in (15, 30, 45, 60))
svg.append('        <path class="%s-grid" d="%s"/>' % (P, grid))
svg.append('        <path class="%s-axis" d="M%s %sH%s M%s %sV%s"/>' % (P, f(X(0)), O[1], f(X(62)), f(X(0)), O[1], f(Y(63))))
for u in UP[::2]:
    svg.append('        <text class="%s-num" x="%s" y="%d">%d</text>' % (P, f(X(u)), O[1] + 9, u))
for c in (15, 30, 45, 60):
    svg.append('        <text class="%s-num %s-ny" x="%s" y="%s">%d</text>' % (P, P, f(X(0) - 3), f(Y(c) + 3), c))
svg.append('      </g>')
for k, (u, c) in enumerate(zip(UP, CF)):
    svg.append('      <circle class="%s-pt %s-p%d" cx="%s" cy="%s" r="2.4"/>' % (P, P, k, f(X(u)), f(Y(c))))
svg.append('      <path class="%s-curve" pathLength="1" d="%s"/>' % (P, CURVE))
for q, target in (('q2', TOTAL / 2), ('q1', TOTAL / 4), ('q3', 3 * TOTAL / 4)):
    x = X(Q[q])
    svg.append('      <path class="%s-rd %s-%sa" pathLength="1" d="M%s %sH%s"/>' % (P, P, q, f(X(0)), f(Y(target)), f(x)))
    svg.append('      <path class="%s-rd %s-%sb" pathLength="1" d="M%s %sV%d"/>' % (P, P, q, f(x), f(Y(target)), O[1]))
    svg.append('      <text class="%s-val %s-%sv" x="%s" y="%d">%d</text>' % (P, P, q, f(x), O[1] + 17, R[q]))
cy = (BOX[0] + BOX[1]) / 2
svg.append('      <path class="%s-box" pathLength="1" d="M%s %dH%s V%d H%s Z M%s %dV%d"/>' % (P, f(X(Q['q1'])), BOX[0], f(X(Q['q3'])), BOX[1], f(X(Q['q1'])), f(X(Q['q2'])), BOX[0], BOX[1]))
svg.append('      <path class="%s-wh" pathLength="1" d="M%s %sH%s M%s %sH%s M%s %dV%d M%s %dV%d"/>'
           % (P, f(X(Q['q1'])), f(cy), f(X(LOW)), f(X(Q['q3'])), f(cy), f(X(HIGH)), f(X(LOW)), BOX[0] + 4, BOX[1] - 4, f(X(HIGH)), BOX[0] + 4, BOX[1] - 4))
svg.append('      <path class="%s-iqr" d="M%s %dv-3H%sv3"/>' % (P, f(X(Q['q1'])), BOX[1] + 7, f(X(Q['q3']))))
svg.append('      <text class="%s-num %s-ends" x="%s" y="%d">%d</text><text class="%s-num %s-ends" x="%s" y="%d">%d</text>'
           % (P, P, f(X(LOW)), BOX[1] + 10, LOW, P, P, f(X(HIGH)), BOX[1] + 10, HIGH))
svg.append('    </svg>')
CAPS = [
    ('c0', 0.2, 2.2, 'cumulative frequency<i class="gcf-ln">a running total: 4, 14, 32 …</i>'),
    ('c1', 2.2, AT['q2'], 'a smooth curve through them'),
    ('c2', AT['q2'], AT['q1'], 'median: the 30th of 60<i class="gcf-ln">across, then down: %d</i>' % R['q2']),
    ('c3', AT['q1'], AT['q3'], 'lower quartile: the 15th<i class="gcf-ln">%d minutes</i>' % R['q1']),
    ('c4', AT['q3'], DOWN, 'upper quartile: the 45th<i class="gcf-ln">%d minutes</i>' % R['q3']),
    ('c5', DOWN, IQR, 'down into a box plot<i class="gcf-ln">whiskers to %d and %d</i>' % (LOW, HIGH)),
    ('c6', IQR, T, '<b class="gcf-g">IQR = %d − %d = %d</b><i class="gcf-ln">the middle half of the data</i>' % (R['q3'], R['q1'], R['q3'] - R['q1'])),
]
STILL = 'c6'
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gcf-c: #6fd8c4; --gcf-b: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(80vw, 19rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-grid { fill: none; stroke: var(--paper); stroke-opacity: .12; stroke-width: .6; }' % P)
css.append('.%s-axis { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.1; }' % P)
css.append('.%s-num { font: 400 8px var(--mono); fill: var(--paper); fill-opacity: .7; text-anchor: middle; }' % P)
css.append('.%s-ny { text-anchor: end; }' % P)
css.append('.%s-pt { fill: var(--gcf-c); transform-box: fill-box; transform-origin: center; }' % P)
css.append('.%s-curve { fill: none; stroke: var(--gcf-c); stroke-width: 2.2; stroke-dasharray: 1; }' % P)
css.append('.%s-rd { fill: none; stroke: var(--gold); stroke-width: 1; stroke-dasharray: 1; }' % P)
css.append('.%s-val { font: 700 9px var(--mono); fill: var(--gold); text-anchor: middle; }' % P)
css.append('.%s-box { fill: none; stroke: var(--gcf-b); stroke-width: 1.8; stroke-linejoin: round; stroke-dasharray: 1; }' % P)
css.append('.%s-wh { fill: none; stroke: var(--gcf-b); stroke-width: 1.4; stroke-dasharray: 1; }' % P)
css.append('.%s-iqr { fill: none; stroke: var(--gold); stroke-width: 1.6; }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }' % P)
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
css.append('.%s-ax { animation: %s-ax %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('ax', 0, 0.6, END, T))
for k in range(n):
    at = 0.6 + 0.2 * k
    css.append('.%s-p%d { animation: %s-p%d %gs ease-out infinite; }' % (P, k, P, k, T))
    css.append('@keyframes %s-p%d { 0%%, %s { opacity: 0; transform: scale(.3); } %s { opacity: 1; transform: scale(1.6); } %s, %s { opacity: 1; transform: none; } 100%% { opacity: 0; transform: none; } }'
               % (P, k, pc(at), pc(at + 0.2), pc(at + 0.45), pc(END)))
css.append('.%s-curve { animation: %s-curve %gs ease-in-out infinite; }' % (P, P, T))
css.append(draw('curve', 2.2, 3.6))
for q, at in AT.items():
    for part, a, b in (('a', at, at + 0.6), ('b', at + 0.6, at + 1.1)):
        css.append('.%s-%s%s { animation: %s-%s%s %gs ease-in-out infinite; }' % (P, q, part, P, q, part, T))
        css.append(draw(q + part, a, b))
    css.append('.%s-%sv { animation: %s-%sv %gs ease-in-out infinite; }' % (P, q, P, q, T))
    css.append(fade(q + 'v', at + 1.1, at + 1.4, END, T))
css.append('.%s-box { animation: %s-box %gs ease-in-out infinite; }' % (P, P, T))
css.append(draw('box', BOXT, BOXT + 0.8))
css.append('.%s-wh { animation: %s-wh %gs ease-in-out infinite; }' % (P, P, T))
css.append(draw('wh', BOXT + 0.8, BOXT + 1.4))
css.append('.%s-ends { animation: %s-ends %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('ends', BOXT + 1.2, BOXT + 1.5, END, T))
css.append('.%s-iqr { animation: %s-iqr %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('iqr', IQR, IQR + 0.4, END, T))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-ax, .%s-pt, .%s-curve, .%s-rd, .%s-val, .%s-box, .%s-wh, .%s-num, .%s-iqr, .%s-s { animation: none; }' % ((P,) * 10))
css.append('}')

anim_row.write_anim('gcf', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS; median %.2f, quartiles %.2f and %.2f' % (P, len(svg), len(css), Q['q2'], Q['q1'], Q['q3']))
