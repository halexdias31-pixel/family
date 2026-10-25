# SOH CAH TOA on one right-angled triangle (GCSE Maths chapter 17): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the triangle or the timeline and re-run:
# python3 tools/g_soh.py
#
# WHAT IT DRAWS, in one loop of T seconds: a right-angled triangle with an angle θ; its sides named
# one at a time — hyp facing the right angle, opp facing θ, adj beside θ — then each ratio lights
# exactly the two sides it uses: sin = opp/hyp, cos = adj/hyp, tan = opp/adj. Last, a worked line
# with the chapter's own numbers: hyp 10 and θ = 35° give opp = 10 × sin 35° = 5.74.
import math
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gsoh'
T = 16.0
W, H = 200, 132
TH = 35                             # θ, in degrees
A = (30, 116)                       # θ's corner
ADJ = 140
C = (A[0] + ADJ, A[1])              # the right angle
B = (C[0], A[1] - ADJ * math.tan(math.radians(TH)))
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def level(name, stops):
    """opacity keyframes through (seconds, value) stops; 0 at both ends of the loop."""
    pts = [(0, 0)] + stops + [(END, stops[-1][1]), (T, 0)]
    return '@keyframes %s-%s { %s }' % (P, name, ' '.join('%s { opacity: %s; }' % (pc(t), v) for t, v in pts))

f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
NAME = [(1.6, 'hyp'), (3.0, 'opp'), (4.4, 'adj')]
SOH, CAH, TOA, WORK = 5.8, 7.6, 9.4, 11.2
DIM = .18
X = 0.3
def lit(on):                        # on: for each phase SOH, CAH, TOA, WORK — lit or dimmed
    out = []
    for t, v in zip((SOH, CAH, TOA, WORK), on):
        out += [(t, out[-1][1] if out else 1), (t + X, 1 if v else DIM)]
    return out
SIDES = [  # class, path, label x, y, the name's time, lit in SOH CAH TOA WORK
    ('hyp', (A, B), (A[0] + B[0]) / 2 - 12, (A[1] + B[1]) / 2 - 6, 1.6, (1, 1, 0, 1)),
    ('opp', (C, B), C[0] + 14, (B[1] + C[1]) / 2 + 4, 3.0, (1, 0, 1, 1)),
    ('adj', (A, C), (A[0] + C[0]) / 2, A[1] + 12, 4.4, (0, 1, 1, 0)),
]
CAPS = [
    ('c0', 0.3, 1.6, 'a right angle, and θ'),
    ('c1', 1.6, 3.0, 'hyp: faces the right angle'),
    ('c2', 3.0, 4.4, 'opp: faces θ'),
    ('c3', 4.4, SOH, 'adj: next to θ'),
    ('c4', SOH, CAH, '<b class="gsoh-k">SOH</b><i class="gsoh-ln">sin θ = opp ÷ hyp</i>'),
    ('c5', CAH, TOA, '<b class="gsoh-k">CAH</b><i class="gsoh-ln">cos θ = adj ÷ hyp</i>'),
    ('c6', TOA, WORK, '<b class="gsoh-k">TOA</b><i class="gsoh-ln">tan θ = opp ÷ adj</i>'),
    ('c7', WORK, T, 'hyp 10, θ = 35°<i class="gsoh-ln">opp = 10 × sin 35° = <b class="gsoh-g">5.74</b></i>'),
]
STILL = 'c7'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
r = 22
arc = 'M%s %sA%d %d 0 0 0 %s %s' % (f(A[0] + r), f(A[1]), r, r, f(A[0] + r * math.cos(math.radians(TH))), f(A[1] - r * math.sin(math.radians(TH))))
svg.append('      <g class="%s-base">' % P)
svg.append('        <path class="%s-tri" d="M%s %sL%s %sL%s %sZ"/>' % (P, f(A[0]), f(A[1]), f(B[0]), f(B[1]), f(C[0]), f(C[1])))
svg.append('        <path class="%s-sq" d="M%s %sv-9h9"/>' % (P, f(C[0] - 9), f(C[1])))
svg.append('        <path class="%s-th" d="%s"/>' % (P, arc))
svg.append('        <text class="%s-thl" x="%s" y="%s">θ</text>' % (P, f(A[0] + r + 8), f(A[1] - 5)))
svg.append('      </g>')
for c, (p, q), lx, ly, at, on in SIDES:
    svg.append('      <g class="%s-side %s-%s"><path class="%s-e-%s" d="M%s %sL%s %s"/><text class="%s-lab %s-t-%s" x="%s" y="%s">%s</text></g>'
               % (P, P, c, P, c, f(p[0]), f(p[1]), f(q[0]), f(q[1]), P, P, c, f(lx), f(ly), c))
svg.append('      <g class="%s-work">' % P)
svg.append('        <text class="%s-num" x="%s" y="%s">10</text>' % (P, f((A[0] + B[0]) / 2 + 9), f((A[1] + B[1]) / 2 + 13)))
svg.append('        <text class="%s-num" x="%s" y="%s">35°</text>' % (P, f(A[0] + r + 27), f(A[1] - 5)))
svg.append('        <text class="%s-num %s-ans" x="%s" y="%s">5.74</text>' % (P, P, f(C[0] + 14), f((B[1] + C[1]) / 2 + 16)))
svg.append('      </g>')
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gsoh-hyp: #f0b45f; --gsoh-opp: #6fd8c4; --gsoh-adj: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(76vw, 18rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-tri { fill: rgb(244 241 232 / .05); stroke: var(--paper); stroke-opacity: .35; stroke-width: 1.2; stroke-linejoin: round; }' % P)
css.append('.%s-sq, .%s-th { fill: none; stroke: var(--paper); stroke-opacity: .8; stroke-width: 1.1; }' % (P, P))
css.append('.%s-thl { font: 700 11px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
for c, *_ in SIDES:
    css.append('.%s-e-%s { stroke: var(--gsoh-%s); stroke-width: 3.2; stroke-linecap: round; }' % (P, c, c))
    css.append('.%s-t-%s { fill: var(--gsoh-%s); }' % (P, c, c))
css.append('.%s-lab { font: 700 11px var(--mono); text-anchor: middle; stroke: var(--bg); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }' % P)
css.append('.%s-num { font: 700 10px var(--mono); fill: var(--paper); text-anchor: middle; stroke: var(--bg); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }' % P)
css.append('.%s-ans { fill: var(--gold); }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-k { color: var(--gold); letter-spacing: .12em; } .%s-say b.%s-g { color: var(--gold); }' % (P, P, P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; }' % P)
# THE STILL is the worked line: hyp and opp lit, adj dimmed, the numbers on.
css.append('.%s-adj { opacity: %s; }' % (P, DIM))
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
css.append('.%s-base { animation: %s-base %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('base', 0, 0.6, END, T))
for c, pq, lx, ly, at, on in SIDES:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(level(c, [(at, 0), (at + 0.4, 1)] + lit(on)))
css.append('.%s-work { animation: %s-work %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('work', WORK + 0.2, WORK + 0.6, END, T))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-base, .%s-side, .%s-work, .%s-s { animation: none; }' % (P, P, P, P))
css.append('}')

anim_row.write_anim('gsoh', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
