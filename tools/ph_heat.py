# A heating curve (GCSE Physics chapter 4): writes its row of data/textbooks.json through tools/anim_row.py.
# Edit the curve or the timeline and re-run: python3 tools/ph_heat.py
#
# WHAT IT DRAWS, in one loop of T seconds: ice at −20 °C heated at a steady rate, the temperature traced
# against time. Where it slopes, the energy raises the temperature (ΔE = m c Δθ); where it is flat — at
# 0 °C while the ice melts and at 100 °C while the water boils — the energy goes into breaking the bonds
# between particles (E = m L) and the temperature does not move. Each stretch is named as the dot reaches
# it. The still (reduced motion) is the whole curve, labelled, with the flat-line rule as its caption.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phheat'
T = 16.0
W, H = 240, 140
X0, Y0, XW, YH = 34, 118, 196, 104          # the plot: origin, width, height
TMIN, TMAX = -20, 120

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.')
def ty(c): return Y0 - (c - TMIN) / (TMAX - TMIN) * YH

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

# the curve's corners as (x across the plot, temperature) and when the dot reaches each
PTS = [(0, -20), (24, 0), (66, 0), (110, 100), (168, 100), (190, 120)]
AT = [0.6, 2.4, 4.6, 7.4, 10.2, 11.4]
XY = [(X0 + x, ty(c)) for x, c in PTS]
END = 14.8
seg = [((XY[i][0] - XY[i + 1][0]) ** 2 + (XY[i][1] - XY[i + 1][1]) ** 2) ** .5 for i in range(len(XY) - 1)]
TOT = sum(seg)
CUM = [0]
for s in seg: CUM.append(CUM[-1] + s / TOT)

LABELS = [  # (class, x, y, text, from)
    ('l0', X0 + 4, ty(0) - 6, 'solid', 0.8),
    ('l1', X0 + 45, ty(0) - 4, 'melting', 2.6),
    ('l2', X0 + 68, ty(55), 'liquid', 4.8),
    ('l3', X0 + 118, ty(100) + 11, 'boiling', 7.6),
    ('l4', X0 + 150, ty(114), 'gas', 10.4),
]
CAPS = [
    ('c0', 0.4, 2.6, 'ice warms<i class="%s-ln">ΔE = m × c × Δθ</i>' % P),
    ('c1', 2.6, 4.8, 'flat at 0 °C: melting<i class="%s-ln">E = m × L, no temperature rise</i>' % P),
    ('c2', 4.8, 7.6, 'water warms<i class="%s-ln">c = 4200 J/kg °C</i>' % P),
    ('c3', 7.6, 10.4, 'flat at 100 °C: boiling<i class="%s-ln">energy breaks bonds instead</i>' % P),
    ('c4', 10.4, 12.6, 'steam warms<i class="%s-ln">sloped again: Δθ rises</i>' % P),
    ('c5', 12.6, END, '2 kg warmed by 10 °C<i class="%s-ln">2 × 4200 × 10 = 84 000 J</i>' % P),
]
STILL = 'c1'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for c in (0, 100):
    svg.append('      <path class="%s-grid" d="M%d %sH%d"/>' % (P, X0, g(ty(c)), X0 + XW))
    svg.append('      <text class="%s-tk" x="%d" y="%s">%d °C</text>' % (P, X0 - 3, g(ty(c) + 3), c))
svg.append('      <path class="%s-ax" d="M%d %dV%dM%d %sH%d"/>' % (P, X0, Y0 - YH - 4, Y0 + 2, X0, g(ty(TMIN)), X0 + XW))
svg.append('      <text class="%s-an" x="%d" y="%d">temperature</text>' % (P, X0 + 3, Y0 - YH))
svg.append('      <text class="%s-an %s-ar" x="%d" y="%d">time (energy in) →</text>' % (P, P, X0 + XW, Y0 + 13))
d = 'M' + ' L'.join('%s %s' % (g(x), g(y)) for x, y in XY)
svg.append('      <path class="%s-a %s-curve" d="%s" pathLength="1"/>' % (P, P, d))
svg.append('      <circle class="%s-a %s-dot" cx="%s" cy="%s" r="3.2"/>' % (P, P, g(XY[0][0]), g(XY[0][1])))
for c, x, y, txt, t0 in LABELS:
    svg.append('      <text class="%s-a %s-lb %s-%s" x="%s" y="%s">%s</text>' % (P, P, P, c, g(x), g(y), txt))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-ax { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1; }' % P)
css.append('.%s-grid { fill: none; stroke: var(--paper); stroke-opacity: .2; stroke-width: .6; stroke-dasharray: 2 2; }' % P)
css.append('.%s-tk { font: 7px var(--mono); fill: var(--paper); fill-opacity: .8; text-anchor: end; }' % P)
css.append('.%s-an { font: 7px var(--mono); fill: var(--paper); fill-opacity: .7; }' % P)
css.append('.%s-ar { text-anchor: end; }' % P)
css.append('.%s-curve { fill: none; stroke: var(--gold); stroke-width: 2.2; stroke-linejoin: round; stroke-dasharray: 1 1; }' % P)
css.append('.%s-dot { fill: var(--paper); stroke: var(--gold); stroke-width: 1.2; opacity: 0; }' % P)
css.append('.%s-lb { font: 700 7.5px var(--mono); fill: var(--paper); }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
# the line is drawn and the dot rides its tip: both pass each corner at the same moment
dash = ['0%%, %s { stroke-dashoffset: 1; opacity: 1; }' % pc(AT[0])]
dot = ['0%%, %s { opacity: 0; transform: none; }' % pc(AT[0] - .3), '%s { opacity: 1; transform: none; }' % pc(AT[0])]
for k in range(1, len(AT)):
    dash.append('%s { stroke-dashoffset: %s; opacity: 1; }' % (pc(AT[k]), g(1 - CUM[k])))
    dot.append('%s { opacity: 1; transform: translate(%spx, %spx); }' % (pc(AT[k]), g(XY[k][0] - XY[0][0]), g(XY[k][1] - XY[0][1])))
dash.append('%s { stroke-dashoffset: 0; opacity: 1; } %s, 100%% { stroke-dashoffset: 0; opacity: 0; }' % (pc(END), pc(END + .6)))
last = 'translate(%spx, %spx)' % (g(XY[-1][0] - XY[0][0]), g(XY[-1][1] - XY[0][1]))
dot.append('%s { opacity: 1; transform: %s; } %s, 100%% { opacity: 0; transform: %s; }' % (pc(END), last, pc(END + .6), last))
css.append('.%s-curve { animation: %s-curve %gs linear infinite; }' % (P, P, T))
css.append('@keyframes %s-curve { %s }' % (P, ' '.join(dash)))
css.append('.%s-dot { animation: %s-dot %gs linear infinite; }' % (P, P, T))
css.append('@keyframes %s-dot { %s }' % (P, ' '.join(dot)))
for c, x, y, txt, t0 in LABELS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, t0, t0 + .4, END, END + .6))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phheat', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
