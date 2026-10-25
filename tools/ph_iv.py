# I–V graphs, an ohmic resistor against a filament lamp (GCSE Physics chapter 2): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the curves or the timeline and re-run:
# python3 tools/ph_iv.py
#
# WHAT IT DRAWS, in one loop of T seconds: current against potential difference, both ways round. The
# resistor's line is traced from −6 V to 6 V and read at one point: 3 V and 0.5 A, so R = V ÷ I = 6 Ω,
# and the same anywhere on a straight line through the origin. Then the lamp's curve, read twice: at 1 V
# it takes 0.29 A (3.4 Ω), at 6 V only 0.8 A (7.5 Ω) — the hotter filament resists more, which is why the
# curve flattens. The still (reduced motion) is both graphs, named, under the summary caption.
import math, sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phiv'
T = 17.0
W, H = 240, 132
OX, OY, SX, SY = 120, 64, 15.0, 50.0       # origin; units per volt and per amp

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.')
def xy(v, i): return OX + v * SX, OY - i * SY
def lamp(v): return math.copysign(.8 * (1 - math.exp(-abs(v) / 2.5)) / (1 - math.exp(-6 / 2.5)), v)

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def draw(name, a, b, end):
    return ('@keyframes %s-%s { 0%%, %s { stroke-dashoffset: 1; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } '
            '%s, 100%% { stroke-dashoffset: 0; opacity: 0; } }' % (P, name, pc(a), pc(b), pc(end), pc(end + .5)))

END = 16.4
RES = 'M%s %sL%s %s' % (g(xy(-6, -1)[0]), g(xy(-6, -1)[1]), g(xy(6, 1)[0]), g(xy(6, 1)[1]))
LAMP = 'M' + ' L'.join('%s %s' % tuple(g(c) for c in xy(v / 4, lamp(v / 4))) for v in range(-24, 25))
# a point read off a graph: (class, volts, amps, label, label x, label y, shown from, to)
READS = [('r1', 3, .5, '3 V, 0.5 A', 3.4, .5, 3.2, 6.4),
         ('l1', 1, lamp(1), '1 V, 0.29 A', 1.5, lamp(1) - .05, 9.8, 12.2),
         ('l2', 6, lamp(6), '6 V, 0.8 A', 1.2, .9, 12.2, 14.6)]
CAPS = [
    ('c0', 0.5, 3.2, 'an ohmic resistor<i class="%s-ln">a straight line through 0</i>' % P),
    ('c1', 3.2, 6.4, 'R = V ÷ I = 3 ÷ 0.5 = 6 Ω<i class="%s-ln">the same all along the line</i>' % P),
    ('c2', 6.6, 9.8, 'a filament lamp<i class="%s-ln">the curve flattens</i>' % P),
    ('c3', 9.8, 12.2, 'cool: 1 ÷ 0.29 ≈ 3.4 Ω<i class="%s-ln">little resistance</i>' % P),
    ('c4', 12.2, 14.6, 'hot: 6 ÷ 0.8 = 7.5 Ω<i class="%s-ln">a hotter filament resists more</i>' % P),
    ('c5', 14.6, END, 'line: constant R<i class="%s-ln">curve: R rises as it heats</i>' % P),
]
STILL = 'c5'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <path class="%s-ax" d="M%d %dH%dM%d %dV%d"/>' % (P, OX - 100, OY, OX + 100, OX, OY - 60, OY + 60))
svg.append('      <path class="%s-ax" d="M%d %dl-4-2.5v5zM%d %dl-2.5 4h5z"/>' % (P, OX + 104, OY, OX, OY - 64))
svg.append('      <text class="%s-an" x="%d" y="%d">V</text>' % (P, OX + 101, OY + 10))
svg.append('      <text class="%s-an" x="%d" y="%d">I</text>' % (P, OX + 6, OY - 56))
for v in (-6, -3, 3, 6):
    svg.append('      <path class="%s-tk" d="M%s %dv3"/><text class="%s-tn" x="%s" y="%d">%d</text>' % (P, g(xy(v, 0)[0]), OY, P, g(xy(v, 0)[0]), OY + 10, v))
svg.append('      <path class="%s-a %s-res" d="%s" pathLength="1"/>' % (P, P, RES))
svg.append('      <path class="%s-a %s-lamp" d="%s" pathLength="1"/>' % (P, P, LAMP))
svg.append('      <text class="%s-a %s-nm %s-nr" x="%s" y="%s">resistor</text>' % (P, P, P, g(xy(6, 1)[0] - 4), g(xy(6, 1)[1] - 2)))
svg.append('      <text class="%s-a %s-nm %s-nl" x="%s" y="%s">lamp</text>' % (P, P, P, g(xy(6, lamp(6))[0] + 2), g(xy(6, lamp(6))[1] + 10)))
for c, v, i, txt, lx, ly, a, b in READS:
    x, y = xy(v, i)
    tx, ty_ = xy(lx, ly)
    svg.append('      <g class="%s-a %s-%s"><path class="%s-pj" d="M%s %dV%sH%d"/><circle class="%s-pt" cx="%s" cy="%s" r="2.6"/>'
               '<text class="%s-pl" x="%s" y="%s">%s</text></g>' % (P, P, c, P, g(x), OY, g(y), OX, P, g(x), g(y), P, g(tx), g(ty_), txt))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phiv-lamp: #6cb6ff; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-ax { fill: var(--paper); fill-opacity: .7; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1; }' % P)
css.append('.%s-tk { stroke: var(--paper); stroke-opacity: .6; stroke-width: .8; }' % P)
css.append('.%s-an { font: 700 8px var(--mono); fill: var(--paper); }' % P)
css.append('.%s-tn { font: 6.5px var(--mono); fill: var(--paper); fill-opacity: .7; text-anchor: middle; }' % P)
css.append('.%s-res { fill: none; stroke: var(--gold); stroke-width: 2; stroke-dasharray: 1 1; }' % P)
css.append('.%s-lamp { fill: none; stroke: var(--phiv-lamp); stroke-width: 2; stroke-linejoin: round; stroke-dasharray: 1 1; }' % P)
css.append('.%s-nm { font: 700 7.5px var(--mono); text-anchor: end; }' % P)
css.append('.%s-nr { fill: var(--gold); }' % P)
css.append('.%s-nl { fill: var(--phiv-lamp); text-anchor: start; }' % P)
css.append('.%s-pj { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-width: .8; stroke-dasharray: 2 1.5; }' % P)
css.append('.%s-pt { fill: var(--paper); }' % P)
css.append('.%s-pl { font: 700 7.5px var(--mono); fill: var(--paper); }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('%s, .%s-s:not(.%s-%s) { opacity: 0; }' % (', '.join('.%s-%s' % (P, r[0]) for r in READS), P, P, STILL))
css.append('.%s-res { animation: %s-res %gs ease-in-out infinite; }' % (P, P, T))
css.append(draw('res', .6, 3.0, END))
css.append('.%s-lamp { animation: %s-lamp %gs ease-in-out infinite; }' % (P, P, T))
css.append(draw('lamp', 6.6, 9.4, END))
css.append('.%s-nr { animation: %s-nr %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('nr', 2.8, 3.2, END, END + .5))
css.append('.%s-nl { animation: %s-nl %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('nl', 9.2, 9.6, END, END + .5))
for c, v, i, txt, lx, ly, a, b in READS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .4, b - .3, b))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phiv', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
