# A velocity–time graph: gradient is acceleration, area is distance (GCSE Physics chapter 8): writes its
# row of data/textbooks.json through tools/anim_row.py. Edit the numbers or the timeline and re-run:
# python3 tools/ph_vt.py
#
# WHAT IT DRAWS, in one loop of T seconds: the chapter's car, 5 m/s to 25 m/s in 4 s. The graph is drawn
# in real time, one second of the car's to one second of the loop, and a car drives a road under it at the
# true distances (s = ut + ½at²), while the area under the line fills in strip by strip, each strip
# arriving as the car covers it. Then the gradient is read off (20 ÷ 4 = 5 m/s²), and the area split into a
# rectangle (20 m) and a triangle (40 m): 60 m, where the car stopped. The still (reduced motion) is the
# finished graph with the area split and its total.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phvt'
T = 14.0
W, H = 240, 136
OX, OY, SX, SV = 38, 92, 34.0, 2.6          # origin; units per second and per m/s
RX0, RY, SR = 38, 116, 2.9                  # the road: start, height, units per metre
U, A, TT = 5.0, 5.0, 4.0
T0 = 0.6                                    # when the car sets off
NS = 16                                     # strips

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.') or '0'
def px(t, v): return OX + t * SX, OY - v * SV
def vel(t): return U + A * t
def dist(t): return U * t + .5 * A * t * t

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

END = 13.2
GROUPS = [('grad', 4.8, 7.4), ('rect', 7.6, END), ('tri', 9.0, END)]
CAPS = [
    ('c0', 0.4, 4.8, '5 m/s to 25 m/s in 4 s<i class="%s-ln">the area fills as it goes</i>' % P),
    ('c1', 4.8, 7.4, 'gradient = acceleration<i class="%s-ln">(25 − 5) ÷ 4 = 5 m/s²</i>' % P),
    ('c2', 7.4, 9.0, 'area = distance<i class="%s-ln">rectangle: 5 × 4 = 20 m</i>' % P),
    ('c3', 9.0, 10.6, 'area = distance<i class="%s-ln">triangle: ½ × 4 × 20 = 40 m</i>' % P),
    ('c4', 10.6, END, '20 + 40 = 60 m<i class="%s-ln">just where the car stopped</i>' % P),
]
STILL = 'c4'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for k in range(NS):
    a, b = TT * k / NS, TT * (k + 1) / NS
    pts = [px(a, 0), px(a, vel(a)), px(b, vel(b)), px(b, 0)]
    svg.append('      <path class="%s-a %s-st %s-s%d" d="M%s"/>' % (P, P, P, k, ' L'.join('%s %s' % (g(x), g(y)) for x, y in pts) + 'Z'))
svg.append('      <path class="%s-ax" d="M%d %dV%dM%d %dH%d"/>' % (P, OX, OY - 82, OY, OX, OY, OX + 5 * SX + 4))
svg.append('      <text class="%s-an" x="%d" y="%d">v (m/s)</text><text class="%s-an %s-ae" x="%d" y="%d">t (s)</text>' % (P, OX + 3, OY - 76, P, P, OX + 5 * SX + 4, OY + 9))
for v in (5, 25):
    svg.append('      <text class="%s-tn %s-te" x="%d" y="%s">%d</text>' % (P, P, OX - 3, g(OY - v * SV + 2.5), v))
for t in range(5):
    svg.append('      <text class="%s-tn" x="%s" y="%d">%d</text>' % (P, g(OX + t * SX), OY + 9, t))
x0, y0 = px(0, U); x1, y1 = px(TT, vel(TT))
svg.append('      <path class="%s-a %s-line" d="M%s %sL%s %s" pathLength="1"/>' % (P, P, g(x0), g(y0), g(x1), g(y1)))
svg.append('      <g class="%s-a %s-grad"><path class="%s-dh" d="M%s %sH%sV%s"/><text class="%s-gl" x="%s" y="%s">4 s</text>'
           '<text class="%s-gl" x="%s" y="%s">20 m/s</text></g>' % (P, P, P, g(x0), g(y0), g(x1), g(y1), P, g((x0 + x1) / 2), g(y0 + 9), P, g(x1 + 22), g((y0 + y1) / 2)))
svg.append('      <g class="%s-a %s-rect"><path class="%s-ra" d="M%s %sH%sV%dH%sZ"/><text class="%s-al" x="%s" y="%s">20 m</text></g>'
           % (P, P, P, g(x0), g(y0), g(x1), OY, g(x0), P, g((x0 + x1) / 2), g((y0 + OY) / 2 + 3)))
svg.append('      <g class="%s-a %s-tri"><path class="%s-ta" d="M%s %sL%s %sV%sZ"/><text class="%s-al" x="%s" y="%s">40 m</text></g>'
           % (P, P, P, g(x0), g(y0), g(x1), g(y1), g(y0), P, g(x0 + (x1 - x0) * .66), g(y0 - 12)))
# the road and the car
svg.append('      <path class="%s-road" d="M%d %dH%s"/>' % (P, RX0 - 4, RY + 4, g(RX0 + 60 * SR + 6)))
for m in (0, 20, 40, 60):
    svg.append('      <path class="%s-rk" d="M%s %dv3"/><text class="%s-tn" x="%s" y="%d">%d m</text>' % (P, g(RX0 + m * SR), RY + 4, P, g(RX0 + m * SR), RY + 14, m))
svg.append('      <g class="%s-a %s-car"><rect class="%s-cb" x="%d" y="%d" width="12" height="5" rx="1"/><path class="%s-cb" d="M%d %dh6l1.5-3h-6z"/>'
           '<circle class="%s-wh" cx="%d" cy="%d" r="1.4"/><circle class="%s-wh" cx="%d" cy="%d" r="1.4"/></g>'
           % (P, P, P, RX0 - 6, RY - 3, P, RX0 - 4, RY - 3, P, RX0 - 3, RY + 2.5, P, RX0 + 3, RY + 2.5))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phvt-tri: #6cb6ff; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-ax { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1; }' % P)
css.append('.%s-an { font: 7px var(--mono); fill: var(--paper); fill-opacity: .75; }' % P)
css.append('.%s-ae { text-anchor: end; }' % P)
css.append('.%s-tn { font: 6.5px var(--mono); fill: var(--paper); fill-opacity: .75; text-anchor: middle; }' % P)
css.append('.%s-te { text-anchor: end; }' % P)
css.append('.%s-st { fill: var(--gold); fill-opacity: .22; }' % P)
css.append('.%s-line { fill: none; stroke: var(--gold); stroke-width: 2; stroke-dasharray: 1 1; }' % P)
css.append('.%s-dh { fill: none; stroke: var(--paper); stroke-width: .9; stroke-dasharray: 2.5 1.5; }' % P)
css.append('.%s-gl, .%s-al { font: 700 7.5px var(--mono); fill: var(--paper); text-anchor: middle; }' % (P, P))
css.append('.%s-ra { fill: var(--gold); fill-opacity: .35; stroke: var(--gold); stroke-width: .8; }' % P)
css.append('.%s-ta { fill: var(--phvt-tri); fill-opacity: .35; stroke: var(--phvt-tri); stroke-width: .8; }' % P)
css.append('.%s-road { stroke: var(--paper); stroke-opacity: .5; stroke-width: 1; }' % P)
css.append('.%s-rk { stroke: var(--paper); stroke-opacity: .5; stroke-width: .8; }' % P)
css.append('.%s-cb { fill: var(--gold); }' % P)
css.append('.%s-wh { fill: var(--paper); }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-st, .%s-grad, .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, P, STILL))
css.append('.%s-car { transform: translateX(%spx); }' % (P, g(60 * SR)))
# the line, in real time
css.append('.%s-line { animation: %s-line %gs linear infinite; }' % (P, P, T))
css.append('@keyframes %s-line { 0%%, %s { stroke-dashoffset: 1; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } %s, 100%% { stroke-dashoffset: 0; opacity: 0; } }'
           % (P, pc(T0), pc(T0 + TT), pc(END), pc(END + .5)))
# the car at the true distance each half second (straight between, near enough at this size)
fr = ['0%%, %s { transform: none; opacity: 1; }' % pc(T0)]
for k in range(1, 9):
    t = k * .5
    fr.append('%s { transform: translateX(%spx); opacity: 1; }' % (pc(T0 + t), g(dist(t) * SR)))
fr.append('%s { transform: translateX(%spx); opacity: 1; } %s { transform: translateX(%spx); opacity: 0; } 100%% { transform: none; opacity: 0; }'
          % (pc(END), g(60 * SR), pc(END + .5), g(60 * SR)))
css.append('.%s-car { animation: %s-car %gs linear infinite; }' % (P, P, T))
css.append('@keyframes %s-car { %s }' % (P, ' '.join(fr)))
# each strip arrives as the line passes its right edge, and all go when the split takes over
for k in range(NS):
    t = T0 + TT * (k + 1) / NS
    css.append('.%s-s%d { animation: %s-s%d %gs linear infinite; }' % (P, k, P, k, T))
    css.append(fade('s%d' % k, t - .2, t, 7.6, 8.0))
for c, a, b in GROUPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .4, b - .3, b + (.5 if b == END else 0)))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phvt', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
