# Simplifying a surd (GCSE Maths chapter 2): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the number or the timeline and re-run: python3 tools/g_surd.py
#
# WHAT IT DRAWS, in one loop of T seconds: 48 unit squares as a 6 by 8 rectangle, which regroup into
# three 4 by 4 squares — 48 = 16 × 3, the largest square factor found. Under them the working changes
# a line at a time: √48 = √(16 × 3) = √16 × √3 = 4√3, the 4 being the side of a 16-square, lit gold
# on the drawing as it is said. Then the check: (4√3)² = 16 × 3 = 48.
import math
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gsurd'
T = 14.0
W, H = 200, 112
N = 48
SQ = max(k * k for k in range(2, int(math.isqrt(N)) + 1) if N % (k * k) == 0)   # 16
R, REST = math.isqrt(SQ), N // SQ                                                # 4 and 3
ROWS, COLS = 6, 8                   # the rectangle it starts as
assert ROWS * COLS == N
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def ruled(x, y, cols, rows, u):
    d = ''.join('M%g %gV%g' % (x + u * i, y, y + u * rows) for i in range(1, cols)) + ''.join('M%g %gH%g' % (x, y + u * j, x + u * cols) for j in range(1, rows))
    return '<rect class="%s-tile" x="%g" y="%g" width="%g" height="%g"/><path class="%s-rule" d="%s"/>' % (P, x, y, u * cols, u * rows, P, d)

STEP = [  # class, from, to, the line of working under the drawing
    ('w0', 0.3, 4.4, '√48'),
    ('w1', 4.4, 6.6, '√48 = √(16 × 3)'),
    ('w2', 6.6, 8.8, '= √16 × √3'),
    ('w3', 8.8, T, '= <tspan class="gsurd-k">4</tspan>√3'),
]
CAPS = [
    ('c0', 0.3, 2.4, 'start with 48 squares<i class="gsurd-ln">a 6 by 8 rectangle</i>'),
    ('c1', 2.4, 4.4, 'look for a square factor<i class="gsurd-ln">4, 9, 16, 25, 36 …</i>'),
    ('c2', 4.4, 6.6, '48 = 16 × 3<i class="gsurd-ln">three 4 by 4 squares</i>'),
    ('c3', 6.6, 8.8, '√(ab) = √a × √b<i class="gsurd-ln">√16 is a side: 4</i>'),
    ('c4', 8.8, 11.2, '<b class="gsurd-g">√48 = 4√3</b><i class="gsurd-ln">the square part comes out</i>'),
    ('c5', 11.2, T, 'check: (4√3)²<i class="gsurd-ln">= 16 × 3 = 48</i>'),
]
STILL = 'c4'
U = 8
svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
rw = COLS * U
svg.append('      <g class="%s-rect">%s</g>' % (P, ruled((W - rw) / 2, 10, COLS, ROWS, U)))
gap = 10
tw = REST * R * U + (REST - 1) * gap
x0 = (W - tw) / 2
blocks = ''.join(ruled(x0 + k * (R * U + gap), 14, R, R, U) for k in range(REST))
svg.append('      <g class="%s-sqs">%s</g>' % (P, blocks))
# the side of the first square, the 4 that comes out of the root
svg.append('      <g class="%s-side"><path class="%s-brk" d="M%g %dv-4H%gv4"/><text class="%s-four" x="%g" y="%d">%d</text></g>'
           % (P, P, x0, 10, x0 + R * U, P, x0 + R * U / 2, 6, R))
for c, a, b, txt in STEP:
    svg.append('      <text class="%s-w %s-%s" x="%d" y="%d">%s</text>' % (P, P, c, W / 2, 92, txt))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(76vw, 18rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-tile { fill: #6fa8dc; fill-opacity: .4; stroke: #6fa8dc; stroke-width: 1.2; }' % P)
css.append('.%s-rule { fill: none; stroke: var(--paper); stroke-opacity: .45; stroke-width: .6; }' % P)
css.append('.%s-brk { fill: none; stroke: var(--gold); stroke-width: 1.4; }' % P)
css.append('.%s-four { font: 700 9px var(--mono); fill: var(--gold); text-anchor: middle; }' % P)
css.append('.%s-w { font: 700 16px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-k { fill: var(--gold); }' % P)
css.append('.%s-say { display: grid; margin-top: .4rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); font-size: 1.1em; }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }' % P)
# THE STILL: the three squares, the side 4 marked, the last line of working and the answer.
css.append('.%s-rect, .%s-w:not(.%s-w3), .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, P, P, STILL))
css.append('.%s-rect { animation: %s-rect %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('rect', 0.2, 0.7, 4.2, 4.8))
css.append('.%s-sqs { animation: %s-sqs %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('sqs', 4.2, 4.8, END, T))
css.append('.%s-side { animation: %s-side %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('side', 6.8, 7.3, END, T))
for c, a, b, txt in STEP:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-rect, .%s-sqs, .%s-side, .%s-w, .%s-s { animation: none; }' % ((P,) * 5))
css.append('}')

anim_row.write_anim('gsurd', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
