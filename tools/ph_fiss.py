# Nuclear fission and the chain reaction (GCSE Physics chapter 6): writes its row of data/textbooks.json
# through tools/anim_row.py. Edit the tree or the timeline and re-run: python3 tools/ph_fiss.py
#
# WHAT IT DRAWS, in one loop of T seconds: one neutron (blue) is absorbed by a uranium-235 nucleus (gold),
# which splits into two smaller nuclei and three neutrons. Two of those split two more nuclei, whose
# neutrons split four: 1 → 2 → 4, each step bigger than the last, which is a chain reaction. The spare
# neutrons fly off; a reactor's control rods are there to absorb them, so that on average only one goes on
# from each fission. The still (reduced motion) is the end: seven nuclei split into fourteen fragments.
import math, sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phfiss'
T = 11.0
W, H = 240, 124
GEN = [[(50, 62)], [(118, 32), (118, 92)], [(188, 14), (188, 47), (188, 77), (188, 110)]]
TF = [1.4, 2.7, 4.0]                        # when each generation splits
FLY = 1.1                                    # a neutron's flight
HOLD = 10.0

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.') or '0'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

NUC, FRAG, NEU = [], [], []                  # (class, x, y, t) / (class, x, y, dx, dy, t) / (class, x0, y0, x1, y1, t0, stays)
n = 0
for k, gen in enumerate(GEN):
    for j, (x, y) in enumerate(gen):
        NUC.append(('u%d' % n, x, y, TF[k]))
        FRAG.append(('f%da' % n, x, y, -7, -9, TF[k]))
        FRAG.append(('f%db' % n, x, y, -7, 9, TF[k]))
        targets = GEN[k + 1][2 * j:2 * j + 2] if k + 1 < len(GEN) else []
        outs = targets + [(x + 34, y + (-14 if j % 2 == 0 else 14))] * (3 - len(targets) - (1 if k == 2 else 0))
        if k == 2: outs = [(x + 40, y - 6), (x + 40, y + 6)]
        for i, (x1, y1) in enumerate(outs):
            NEU.append(('n%d%d' % (n, i), x, y, x1, y1, TF[k] + .05, i < len(targets)))
        n += 1
NEU.insert(0, ('nin', 6, 62, 50, 62, TF[0] - FLY, True))

CAPS = [
    ('c0', 0.2, TF[0], 'a neutron hits uranium-235<i class="%s-ln">the nucleus absorbs it</i>' % P),
    ('c1', TF[0], TF[1], 'fission: it splits in two<i class="%s-ln">+ 2 or 3 neutrons + energy</i>' % P),
    ('c2', TF[1], TF[2], 'those neutrons split more<i class="%s-ln">1 → 2 → 4</i>' % P),
    ('c3', TF[2], 7.2, 'a chain reaction<i class="%s-ln">bigger at every step</i>' % P),
    ('c4', 7.2, HOLD, 'a reactor\'s control rods<i class="%s-ln">absorb the spare neutrons</i>' % P),
]
STILL = 'c3'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for c, x, y, dx, dy, t in FRAG:
    svg.append('      <circle class="%s-a %s-fr %s-%s" cx="%d" cy="%d" r="5.5"/>' % (P, P, P, c, x, y))
for c, x, y, t in NUC:
    svg.append('      <circle class="%s-a %s-u %s-%s" cx="%d" cy="%d" r="8.5"/>' % (P, P, P, c, x, y))
svg.append('      <text class="%s-lb" x="50" y="83">U-235</text>' % P)
for c, x0, y0, x1, y1, t0, stays in NEU:
    svg.append('      <circle class="%s-a %s-n %s-%s" cx="%d" cy="%d" r="2.2"/>' % (P, P, P, c, x0, y0))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phfiss-n: #6cb6ff; --phfiss-f: #e0605a; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-u { fill: var(--gold); stroke: var(--paper); stroke-opacity: .6; stroke-width: .8; transform-box: fill-box; transform-origin: center; }' % P)
css.append('.%s-fr { fill: var(--phfiss-f); fill-opacity: .85; stroke: var(--paper); stroke-opacity: .5; stroke-width: .6; }' % P)
css.append('.%s-n { fill: var(--phfiss-n); opacity: 0; }' % P)
css.append('.%s-lb { font: 700 7px var(--mono); fill: var(--paper); fill-opacity: .8; text-anchor: middle; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-u, .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, STILL))
# THE STILL: every fragment where it ends up
for c, x, y, dx, dy, t in FRAG:
    css.append('.%s-%s { transform: translate(%dpx, %dpx); }' % (P, c, dx, dy))
for c, x, y, t in NUC:
    css.append('.%s-%s { animation: %s-%s %gs ease-out infinite; }' % (P, c, P, c, T))
    css.append('@keyframes %s-%s { 0%%, 2%% { opacity: 0; transform: none; } 6%%, %s { opacity: 1; transform: none; } %s { opacity: 1; transform: scale(1.25); } '
               '%s, 100%% { opacity: 0; transform: scale(1.4); } }' % (P, c, pc(t - .15), pc(t), pc(t + .2)))
for c, x, y, dx, dy, t in FRAG:
    css.append('.%s-%s { animation: %s-%s %gs ease-out infinite; }' % (P, c, P, c, T))
    css.append('@keyframes %s-%s { 0%%, %s { opacity: 0; transform: none; } %s { opacity: 1; transform: translate(%spx, %spx); } '
               '%s { opacity: 1; transform: translate(%dpx, %dpx); } 100%% { opacity: 0; transform: translate(%dpx, %dpx); } }'
               % (P, c, pc(t), pc(t + .5), g(dx * .8), g(dy * .8), pc(HOLD), dx, dy, dx, dy))
for c, x0, y0, x1, y1, t0, stays in NEU:
    end = 'translate(%dpx, %dpx)' % (x1 - x0, y1 - y0)
    css.append('.%s-%s { animation: %s-%s %gs linear infinite; }' % (P, c, P, c, T))
    css.append('@keyframes %s-%s { 0%%, %s { opacity: 0; transform: none; } %s { opacity: 1; transform: none; } %s { opacity: %s; transform: %s; } %s, 100%% { opacity: 0; transform: %s; } }'
               % (P, c, pc(t0 - .05), pc(t0), pc(t0 + FLY), 1 if stays else .5, end, pc(t0 + FLY + (.05 if stays else .4)), end))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phfiss', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
