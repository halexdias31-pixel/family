# The sine rule and the cosine rule (GCSE Maths chapter 17, Higher): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the triangles or the timeline and re-run:
# python3 tools/g_rules.py
#
# WHAT IT DRAWS, in one loop of T seconds. First the sine rule: a triangle whose sides and angles are
# paired by colour — side a faces angle A, b faces B, c faces C — lit a pair at a time, then all three
# with a/sin A = b/sin B = c/sin C. Then the cosine rule on the chapter's triangle, b = 5 and c = 7,
# with A opened from 60° to 90° to 120°: a² = 25 + 49 − 70 cos A gives 39, then 74 (cos 90° = 0, so it
# is Pythagoras), then 109 — the side across a growing angle grows. Each angle is its own drawn group.
import math
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'grule'
T = 16.0
W, H = 200, 134
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
def unit(p, q):
    dx, dy = q[0] - p[0], q[1] - p[1]; n = math.hypot(dx, dy); return (dx / n, dy / n)
def add(p, u, k): return (p[0] + u[0] * k, p[1] + u[1] * k)
def arc(at, p, q, r):
    u, v = unit(at, p), unit(at, q)
    s, e = add(at, u, r), add(at, v, r)
    sweep = 1 if u[0] * v[1] - u[1] * v[0] > 0 else 0
    return 'M%s %sA%d %d 0 0 %d %s %s' % (f(s[0]), f(s[1]), r, r, sweep, f(e[0]), f(e[1]))
def bis(at, p, q, r):
    u, v = unit(at, p), unit(at, q); m = (u[0] + v[0], u[1] + v[1]); n = math.hypot(*m)
    return add(at, (m[0] / n, m[1] / n), r)
def off(p, q, k, inside):
    """a point k out from the middle of pq, on the side away from `inside`"""
    m = ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2); u = unit(p, q); n = (-u[1], u[0])
    if (inside[0] - m[0]) * n[0] + (inside[1] - m[1]) * n[1] > 0: n = (-n[0], -n[1])
    return add(m, n, k)

# ---- the sine rule's triangle ---------------------------------------------------------------------
A1, B1, C1 = (34, 100), (168, 100), (116, 28)
PAIRS = [  # class, side (from, to), the corner facing it with its two neighbours, letter
    ('pa', (B1, C1), (A1, B1, C1), 'a', 'A'),
    ('pb', (C1, A1), (B1, C1, A1), 'b', 'B'),
    ('pc', (A1, B1), (C1, A1, B1), 'c', 'C'),
]
LIT = [(1.0, 2.6), (2.6, 4.2), (4.2, 5.8)]
ALL, COS = 5.8, 8.2
DIM = .22

# ---- the cosine rule's triangles: A at the left, c along the base, b at angle A ---------------------
BB, CC, SC = 5, 7, 14
A2 = (52, 104)
ANGLES = [60, 90, 120]
FR = [(COS, 10.6), (10.6, 12.8), (12.8, None)]

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <g class="%s-one">' % P)
svg.append('        <path class="%s-tri" d="M%d %dL%d %dL%d %dZ"/>' % (P, A1[0], A1[1], B1[0], B1[1], C1[0], C1[1]))
for c, (p, q), (at, n1, n2), side, ang in PAIRS:
    inside = ((A1[0] + B1[0] + C1[0]) / 3, (A1[1] + B1[1] + C1[1]) / 3)
    ls = off(p, q, 8, inside)
    la = bis(at, n1, n2, 24)
    svg.append('        <g class="%s-pair %s-%s"><path class="%s-e" d="M%d %dL%d %d"/><path class="%s-arc" d="%s"/>'
               '<text class="%s-l" x="%s" y="%s">%s</text><text class="%s-l" x="%s" y="%s">%s</text></g>'
               % (P, P, c, P, p[0], p[1], q[0], q[1], P, arc(at, n1, n2, 14), P, f(ls[0]), f(ls[1] + 4), side,
                  P, f(la[0]), f(la[1] + 3.5), ang))
svg.append('        <text class="%s-rule %s-r1" x="%d" y="%d">a/sin A = b/sin B = c/sin C</text>' % (P, P, W / 2, H - 3))
svg.append('      </g>')
for (a0, b0), deg in zip(FR, ANGLES):
    t = math.radians(deg)
    B2 = (A2[0] + CC * SC, A2[1])
    C2 = (A2[0] + BB * SC * math.cos(t), A2[1] - BB * SC * math.sin(t))
    inside = ((A2[0] + B2[0] + C2[0]) / 3, (A2[1] + B2[1] + C2[1]) / 3)
    a2 = BB * BB + CC * CC - 2 * BB * CC * math.cos(t)
    lb, lc, la = off(A2, C2, 9, inside), off(A2, B2, 9, inside), off(B2, C2, 10, inside)
    mark = ('<path class="%s-sq" d="M%s %sv-8h8"/>' % (P, f(A2[0] + 8), f(A2[1])) if deg == 90 else
            '<path class="%s-arcw" d="%s"/>' % (P, arc(A2, B2, C2, 13)))
    am = bis(A2, B2, C2, 23)
    svg.append('      <g class="%s-cos %s-d%d"><path class="%s-tri" d="M%d %dL%d %dL%s %sZ"/>%s'
               '<path class="%s-ea" d="M%d %dL%s %s"/>'
               '<text class="%s-n" x="%s" y="%s">5</text><text class="%s-n" x="%s" y="%s">7</text>'
               '<text class="%s-na" x="%s" y="%s">%s</text><text class="%s-n" x="%s" y="%s">%d°</text></g>'
               % (P, P, deg, P, A2[0], A2[1], B2[0], B2[1], f(C2[0]), f(C2[1]), mark, P, B2[0], B2[1], f(C2[0]), f(C2[1]),
                  P, f(lb[0]), f(lb[1] + 4), P, f(lc[0]), f(lc[1] + 4), P, f(la[0]), f(la[1] + 4), f(math.sqrt(a2)), P, f(am[0] + 4), f(am[1] + 3), deg))
svg.append('      <text class="%s-rule %s-r2" x="%d" y="%d">a² = b² + c² − 2bc cos A</text>' % (P, P, W / 2, H - 3))
svg.append('    </svg>')
CAPS = [
    ('s0', 0.2, LIT[0][0], 'any triangle<i class="grule-ln">sides a, b, c; angles A, B, C</i>'),
    ('s1', LIT[0][0], LIT[0][1], 'side a faces angle A'),
    ('s2', LIT[1][0], LIT[1][1], 'side b faces angle B'),
    ('s3', LIT[2][0], LIT[2][1], 'and side c faces C'),
    ('s4', ALL, COS, '<b class="grule-g">the sine rule</b><i class="grule-ln">each side ÷ the sine it faces</i>'),
    ('s5', COS, 10.6, 'cosine rule, b = 5, c = 7<i class="grule-ln">A = 60°: a² = 74 − 35 = 39</i>'),
    ('s6', 10.6, 12.8, 'A = 90°: cos A = 0<i class="grule-ln">a² = 25 + 49: Pythagoras</i>'),
    ('s7', 12.8, T, 'A = 120°: cos A &lt; 0<i class="grule-ln">a² = 74 + 35 = 109</i>'),
]
STILL = 's4'
svg.append('    <div class="%s-say">' % P)
for c, a0, b0, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --grule-a: #6fd8c4; --grule-b: #6fa8dc; --grule-c: #e8862c; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(76vw, 18rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-tri { fill: rgb(244 241 232 / .05); stroke: var(--paper); stroke-opacity: .4; stroke-width: 1.2; stroke-linejoin: round; }' % P)
css.append('.%s-e, .%s-ea { stroke-width: 3; stroke-linecap: round; }' % (P, P))
css.append('.%s-arc, .%s-arcw, .%s-sq { fill: none; stroke-width: 1.6; }' % (P, P, P))
css.append('.%s-l, .%s-n, .%s-na { font: 700 10px var(--mono); text-anchor: middle; stroke: var(--bg); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }' % (P, P, P))
for c, col in (('pa', 'a'), ('pb', 'b'), ('pc', 'c')):
    css.append('.%s-%s .%s-e, .%s-%s .%s-arc { stroke: var(--grule-%s); } .%s-%s .%s-l { fill: var(--grule-%s); }' % (P, c, P, P, c, P, col, P, c, P, col))
css.append('.%s-ea { stroke: var(--grule-a); } .%s-na { fill: var(--grule-a); } .%s-n { fill: var(--paper); }' % (P, P, P))
css.append('.%s-arcw, .%s-sq { stroke: var(--gold); }' % (P, P))
css.append('.%s-rule { font: 700 9.5px var(--mono); fill: var(--gold); text-anchor: middle; }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; font-size: .9em; }' % P)
# THE STILL is the sine rule: the three pairs lit and the rule written; the cosine triangles hidden.
css.append('.%s-cos, .%s-r2, .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, P, STILL))
css.append('.%s-one { animation: %s-one %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('one', 0, 0.6, COS - 0.3, COS))
X = 0.3
for k, (c, *_r) in enumerate(PAIRS):
    a0, b0 = LIT[k]
    stops = [(0, DIM), (a0, DIM), (a0 + X, 1), (b0, 1), (b0 + X, DIM), (ALL, DIM), (ALL + X, 1), (T, 1)]
    if k == 2: stops = [(0, DIM), (a0, DIM), (a0 + X, 1), (T, 1)]
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append('@keyframes %s-%s { %s }' % (P, c, ' '.join('%s { opacity: %s; }' % (pc(t), v) for t, v in stops)))
css.append('.%s-r1 { animation: %s-r1 %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('r1', ALL, ALL + 0.4, T - 1, T))
for (a0, b0), deg in zip(FR, ANGLES):
    css.append('.%s-d%d { animation: %s-d%d %gs ease-in-out infinite; }' % (P, deg, P, deg, T))
    css.append(fade('d%d' % deg, a0 - X / 2, a0 + X / 2, b0 - X / 2, b0 + X / 2) if b0 else fade('d%d' % deg, a0 - X / 2, a0 + X / 2, END, T))
css.append('.%s-r2 { animation: %s-r2 %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('r2', COS, COS + 0.4, END, T))
for c, a0, b0, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a0, a0 + 0.3, b0 - 0.3, b0))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-one, .%s-pair, .%s-rule, .%s-cos, .%s-s { animation: none; }' % ((P,) * 5))
css.append('}')

anim_row.write_anim('grule', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
