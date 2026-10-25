# Gravitational potential energy into kinetic energy (GCSE Physics chapter 1): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the numbers or the timeline and re-run:
# python3 tools/ph_drop.py
#
# WHAT IT DRAWS, in one loop of T seconds: the chapter's 0.5 kg ball dropped from 5 m, falling as a real
# ball does (h = 5 − ½gt², slowed down so it can be watched), beside two bars for its gravitational
# potential and kinetic stores. As it falls one bar empties into the other and their total stays at the
# dashed line, 24.5 J; half way down each holds 12.25 J. With no air resistance it bounces back to 5 m, the
# transfer running the other way, so the loop closes on itself. The still (reduced motion) is the ball
# half way down with the two bars equal.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phdrop'
T = 12.0
W, H = 240, 128
GY, PM = 114, 19.0                           # the ground; units per metre
BX = 78                                      # the ball's x
R = 6
BAR = 92                                     # a full bar, 24.5 J
FALL, LAND, RISE, TOPH = (1.5, 4.5), 4.5, (6.5, 9.5), 9.5

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.3f' % v).rstrip('0').rstrip('.') or '0'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

# height at each stop of the loop
STOPS = [(0.0, 5.0)]
for k in range(11):
    t = FALL[0] + k * .3
    STOPS.append((t, 5 * (1 - (k / 10) ** 2)))
STOPS.append((RISE[0], 0.0))
for k in range(1, 11):
    STOPS.append((RISE[0] + k * .3, 5 * (1 - (1 - k / 10) ** 2)))
STOPS.append((T, 5.0))

CAPS = [
    ('c0', 0.2, FALL[0], 'at 5 m: Ep = 24.5 J<i class="%s-ln">0.5 × 9.8 × 5, and Ek = 0</i>' % P),
    ('c1', FALL[0], LAND, 'falling: Ep becomes Ek<i class="%s-ln">half way: 12.25 J each</i>' % P),
    ('c2', LAND, RISE[0], 'at the bottom: Ek = 24.5 J<i class="%s-ln">½mv² = 24.5, v ≈ 9.9 m/s</i>' % P),
    ('c3', RISE[0], TOPH, 'nothing wasted<i class="%s-ln">so it rises back to 5 m</i>' % P),
    ('c4', TOPH, T - .1, 'Ep = m × g × h<i class="%s-ln">Ek = ½ × m × v²</i>' % P),
]
STILL = 'c1'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <path class="%s-gr" d="M20 %dH120"/>' % (P, GY))
svg.append('      <path class="%s-sc" d="M40 %sV%d%s"/>' % (P, g(GY - 5 * PM), GY, ''.join('M40 %sh-4' % g(GY - m * PM) for m in range(6))))
for m in (0, 5):
    svg.append('      <text class="%s-tn" x="33" y="%s">%d m</text>' % (P, g(GY - m * PM + 2.5), m))
svg.append('      <path class="%s-half" d="M44 %sH200"/>' % (P, g(GY - 2.5 * PM)))
svg.append('      <circle class="%s-a %s-ball" cx="%d" cy="%s" r="%d"/>' % (P, P, BX, g(GY - 5 * PM - R), R))
svg.append('      <path class="%s-tot" d="M134 %dH210"/><text class="%s-tl" x="210" y="%d">24.5 J</text>' % (P, GY - BAR, P, GY - BAR - 4))
svg.append('      <rect class="%s-a %s-bar %s-ep" x="140" y="%d" width="24" height="%d"/>' % (P, P, P, GY - BAR, BAR))
svg.append('      <rect class="%s-a %s-bar %s-ek" x="178" y="%d" width="24" height="%d"/>' % (P, P, P, GY - BAR, BAR))
svg.append('      <path class="%s-gr" d="M134 %dH210"/>' % (P, GY))
svg.append('      <text class="%s-bl" x="152" y="%d">Ep</text><text class="%s-bl" x="190" y="%d">Ek</text>' % (P, GY + 10, P, GY + 10))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phdrop-k: #6cb6ff; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-gr { stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.2; }' % P)
css.append('.%s-sc { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-width: .8; }' % P)
css.append('.%s-tn { font: 6.5px var(--mono); fill: var(--paper); fill-opacity: .75; text-anchor: end; }' % P)
css.append('.%s-half { stroke: var(--paper); stroke-opacity: .2; stroke-width: .6; stroke-dasharray: 2 2; }' % P)
css.append('.%s-ball { fill: var(--gold); stroke: var(--paper); stroke-opacity: .6; stroke-width: .8; transform: translateY(%spx); }' % (P, g(2.5 * PM)))
css.append('.%s-tot { stroke: var(--paper); stroke-opacity: .7; stroke-width: .9; stroke-dasharray: 3 2; }' % P)
css.append('.%s-tl { font: 700 7px var(--mono); fill: var(--paper); text-anchor: end; }' % P)
css.append('.%s-bar { transform-box: fill-box; transform-origin: 50%% 100%%; transform: scaleY(.5); }' % P)
css.append('.%s-ep { fill: var(--gold); fill-opacity: .75; }' % P)
css.append('.%s-ek { fill: var(--phdrop-k); fill-opacity: .75; }' % P)
css.append('.%s-bl { font: 700 8px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
def kf(name, fn):
    return '@keyframes %s-%s { %s }' % (P, name, ' '.join('%s { transform: %s; }' % (pc(t), fn(h)) for t, h in STOPS))
css.append('.%s-ball { animation: %s-ball %gs linear infinite; }' % (P, P, T))
css.append(kf('ball', lambda h: 'translateY(%spx)' % g((5 - h) * PM)))
css.append('.%s-ep { animation: %s-ep %gs linear infinite; }' % (P, P, T))
css.append(kf('ep', lambda h: 'scaleY(%s)' % g(h / 5)))
css.append('.%s-ek { animation: %s-ek %gs linear infinite; }' % (P, P, T))
css.append(kf('ek', lambda h: 'scaleY(%s)' % g(1 - h / 5)))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phdrop', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
