# Refraction through a glass block (GCSE Physics chapter 10): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the angles or the timeline and re-run: python3 tools/ph_refr.py
#
# WHAT IT DRAWS, in one loop of T seconds: a ray of light, as a bright pulse drawing its own path, meets a
# glass block at i = 50° to the normal. Inside, the pulse visibly slows (it covers the same ground in 1.5
# times as long, the speed of light in glass of refractive index 1.5) and the ray bends towards the normal,
# r ≈ 31° (Snell's law, sin i = 1.5 sin r). Leaving, it speeds up and bends away by the same angle, so it
# comes out parallel to the way it went in. Then a second ray along the normal: slower in the glass, but
# not bent at all. The still (reduced motion) is the first ray drawn whole with both angles marked.
import math, sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phrefr'
T = 14.5
W, H = 240, 128
GX, GY, GW, GH = 52, 40, 136, 52             # the block
N_ = 1.5
I = math.radians(50)
R = math.asin(math.sin(I) / N_)
V = 30.0                                     # the pulse's speed in air, units a second

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.') or '0'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

E = (92.0, GY)
S = (E[0] - 46 * math.sin(I), E[1] - 46 * math.cos(I))
X = (E[0] + GH * math.tan(R), GY + GH)
F = (X[0] + 40 * math.sin(I), X[1] + 40 * math.cos(I))

def ray(pts, t0, speeds):
    """vertex times along a path whose legs run at the given speeds"""
    ts, t = [t0], t0
    for k in range(len(pts) - 1):
        t += math.dist(pts[k], pts[k + 1]) / speeds[k]
        ts.append(t)
    return ts

A_PTS = [S, E, X, F]
A_T = ray(A_PTS, .4, [V, V / N_, V])
B_PTS = [(150.0, 8.0), (150.0, GY), (150.0, GY + GH), (150.0, 122.0)]
B_T = ray(B_PTS, 9.2, [V, V / N_, V])
A_END, B_END = 8.4, T - .5

def arc(c, a0, a1, r):
    """an arc about c from direction a0 to a1 (radians, SVG axes)"""
    p0 = (c[0] + r * math.cos(a0), c[1] + r * math.sin(a0))
    p1 = (c[0] + r * math.cos(a1), c[1] + r * math.sin(a1))
    sweep = 1 if a1 > a0 else 0
    return 'M%s %sA%g %g 0 0 %d %s %s' % (g(p0[0]), g(p0[1]), r, r, sweep, g(p1[0]), g(p1[1]))

UP, DOWN = -math.pi / 2, math.pi / 2
CAPS = [
    ('c0', 0.3, 2.0, 'light meets the glass<i class="%s-ln">at i = 50° to the normal</i>' % P),
    ('c1', 2.0, A_T[2], 'it slows down in glass<i class="%s-ln">and bends towards the normal</i>' % P),
    ('c2', A_T[2], 6.6, 'it speeds up leaving<i class="%s-ln">and bends away again</i>' % P),
    ('c3', 6.6, A_END, 'r ≈ 31°, less than i<i class="%s-ln">out parallel to the way in</i>' % P),
    ('c4', 9.0, B_END, 'along the normal<i class="%s-ln">slower, but no bending</i>' % P),
]
STILL = 'c3'

def path(pts): return 'M' + ' L'.join('%s %s' % (g(x), g(y)) for x, y in pts)

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <rect class="%s-glass" x="%d" y="%d" width="%d" height="%d"/>' % (P, GX, GY, GW, GH))
svg.append('      <text class="%s-lb" x="%d" y="%d">air</text><text class="%s-lb" x="%d" y="%d">glass</text>' % (P, GX + GW + 4, GY - 4, P, GX + GW - 4, GY + GH - 5))
svg.append('      <g class="%s-a %s-sa">' % (P, P))
svg.append('        <path class="%s-nl" d="M%s %dV%dM%s %dV%d"/>' % (P, g(E[0]), GY - 26, GY + 22, g(X[0]), GY + GH - 22, GY + GH + 26))
svg.append('        <path class="%s-a %s-ray %s-ra" d="%s" pathLength="1"/>' % (P, P, P, path(A_PTS)))
svg.append('        <circle class="%s-a %s-dot %s-da" cx="%s" cy="%s" r="3"/>' % (P, P, P, g(S[0]), g(S[1])))
svg.append('        <g class="%s-a %s-ang"><path class="%s-arc" d="%s"/><path class="%s-arc" d="%s"/>'
           '<text class="%s-al" x="%s" y="%s">i</text><text class="%s-al" x="%s" y="%s">r</text></g>' % (
               P, P, P, arc(E, UP - I, UP, 13), P, arc(E, DOWN - R, DOWN, 15),
               P, g(E[0] - 6), g(E[1] - 15), P, g(E[0] + 5), g(E[1] + 21)))
svg.append('      </g>')
svg.append('      <g class="%s-a %s-sb">' % (P, P))
svg.append('        <path class="%s-a %s-ray %s-rb" d="%s" pathLength="1"/>' % (P, P, P, path(B_PTS)))
svg.append('        <circle class="%s-a %s-dot %s-db" cx="%s" cy="%s" r="3"/>' % (P, P, P, g(B_PTS[0][0]), g(B_PTS[0][1])))
svg.append('      </g>')
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phrefr-glass: #6cb6ff; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-glass { fill: var(--phrefr-glass); fill-opacity: .14; stroke: var(--phrefr-glass); stroke-opacity: .7; stroke-width: 1; }' % P)
css.append('.%s-lb { font: 7px var(--mono); fill: var(--paper); fill-opacity: .7; text-anchor: end; }' % P)
css.append('.%s-nl { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-width: .8; stroke-dasharray: 3 2; }' % P)
css.append('.%s-ray { fill: none; stroke: var(--gold); stroke-width: 1.8; stroke-linejoin: round; stroke-dasharray: 1 1; }' % P)
css.append('.%s-dot { fill: var(--paper); stroke: var(--gold); stroke-width: 1.5; opacity: 0; }' % P)
css.append('.%s-arc { fill: none; stroke: var(--paper); stroke-width: .9; }' % P)
css.append('.%s-al { font: italic 700 8px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-sb, .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, STILL))

def travel(name, pts, ts, end):
    """the ray drawn and the pulse on its tip, passing each corner at the same moment"""
    L = [0.0]
    for k in range(len(pts) - 1): L.append(L[-1] + math.dist(pts[k], pts[k + 1]))
    d = ['0%%, %s { stroke-dashoffset: 1; }' % pc(ts[0])]
    p = ['0%%, %s { opacity: 0; transform: none; }' % pc(ts[0] - .2), '%s { opacity: 1; transform: none; }' % pc(ts[0])]
    for k in range(1, len(pts)):
        d.append('%s { stroke-dashoffset: %s; }' % (pc(ts[k]), g(1 - L[k] / L[-1])))
        p.append('%s { opacity: %s; transform: translate(%spx, %spx); }' % (pc(ts[k]), 0 if k == len(pts) - 1 else 1, g(pts[k][0] - pts[0][0]), g(pts[k][1] - pts[0][1])))
    d.append('%s, 100%% { stroke-dashoffset: 0; }' % pc(end))
    p.append('100%% { opacity: 0; transform: translate(%spx, %spx); }' % (g(pts[-1][0] - pts[0][0]), g(pts[-1][1] - pts[0][1])))
    css.append('.%s-r%s { animation: %s-r%s %gs linear infinite; }' % (P, name, P, name, T))
    css.append('@keyframes %s-r%s { %s }' % (P, name, ' '.join(d)))
    css.append('.%s-d%s { animation: %s-d%s %gs linear infinite; }' % (P, name, P, name, T))
    css.append('@keyframes %s-d%s { %s }' % (P, name, ' '.join(p)))

travel('a', A_PTS, A_T, A_END)
travel('b', B_PTS, B_T, B_END)
css.append('.%s-ang { animation: %s-ang %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('ang', 6.4, 6.8, A_END - .2, A_END + .2))
css.append('.%s-sa { animation: %s-sa %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('sa', 0, .3, A_END, A_END + .4))
css.append('.%s-sb { animation: %s-sb %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('sb', A_END + .4, A_END + .7, B_END, B_END + .4))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phrefr', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS; vertices at %s s' % (P, len(svg), len(css), ', '.join('%.1f' % t for t in A_T)))
