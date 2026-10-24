# The electromagnetic spectrum (GCSE Physics chapter 10): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the bands or the timeline and re-run: python3 tools/ph_em.py
#
# WHAT IT DRAWS, in one loop of T seconds: the seven groups in order of rising frequency, under one wave
# whose wavelength shrinks from left to right. A gold window slides from radio to gamma, stopping on each
# group while the caption names it and one use from the chapter; the hazards are said where they begin
# (ultraviolet on). Then the window goes and the caption says what they share: all transverse, all at
# the same speed in a vacuum. The still (reduced motion) is the whole spectrum with that caption.
import math, sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phem'
T = 17.0
W, H = 240, 100
BX, BW, BY, BH = 12, 216, 40, 16
N = 7
SW = BW / N
STEP = 2.0                                   # time on each group

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.') or '0'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

GROUPS = [  # (short name, fill, caption, second line)
    ('radio', '#7d6a5a', 'radio waves', 'TV and radio'),
    ('micro', '#8a5a4a', 'microwaves', 'satellites, cooking'),
    ('IR', '#a04a3a', 'infrared', 'heaters, thermal cameras'),
    ('light', None, 'visible light', 'fibre optics, seeing'),
    ('UV', '#7a5ab8', 'ultraviolet', 'ages skin, skin cancer risk'),
    ('X', '#5a7aa0', 'X-rays', 'medical images: ionising'),
    ('γ', '#6a8a8a', 'gamma rays', 'sterilising, treating cancer'),
]
SUMMARY = (N * STEP + .4, T - .3)

# the wave: its wavelength falls geometrically from 56 to 5 across the band
pts, ph = [], 0.0
for k in range(BW + 1):
    x = BX + k
    lam = 56 * (5 / 56) ** (k / BW)
    pts.append('%s %s' % (g(x), g(20 - 8 * math.sin(ph))))
    ph += 2 * math.pi / lam

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <defs><linearGradient id="%s-rb"><stop offset="0" stop-color="#e0403a"/><stop offset=".25" stop-color="#f0a03a"/>'
           '<stop offset=".45" stop-color="#e8e04a"/><stop offset=".65" stop-color="#4ac06a"/><stop offset=".85" stop-color="#4a7ae0"/>'
           '<stop offset="1" stop-color="#8a4ae0"/></linearGradient></defs>' % P)
svg.append('      <path class="%s-wave" d="M%s"/>' % (P, ' L'.join(pts)))
for k, (nm, fill, cap, ln) in enumerate(GROUPS):
    x = BX + k * SW
    paint = 'url(#%s-rb)' % P if fill is None else fill
    svg.append('      <rect class="%s-band" x="%s" y="%d" width="%s" height="%d" fill="%s"/>' % (P, g(x), BY, g(SW), BH, paint))
    svg.append('      <text class="%s-nm" x="%s" y="%d">%s</text>' % (P, g(x + SW / 2), BY + BH + 9, nm))
svg.append('      <rect class="%s-a %s-win" x="%s" y="%d" width="%s" height="%d" rx="1.5"/>' % (P, P, g(BX - 1), BY - 3, g(SW + 2), BH + 6))
svg.append('      <path class="%s-ar" d="M%d 80H%dm-4-3l4 3l-4 3"/>' % (P, BX, BX + BW))
svg.append('      <text class="%s-lo" x="%d" y="%d">long λ, low f</text><text class="%s-lo %s-hi" x="%d" y="%d">short λ, high f</text>'
           % (P, BX, 92, P, P, BX + BW, 92))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for k, (nm, fill, cap, ln) in enumerate(GROUPS):
    svg.append('      <span class="%s-a %s-s %s-c%d">%s<i class="%s-ln">%s</i></span>' % (P, P, P, k, cap, P, ln))
svg.append('      <span class="%s-a %s-s %s-c%d">all transverse<i class="%s-ln">same speed in a vacuum</i></span>' % (P, P, P, N, P))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-wave { fill: none; stroke: var(--paper); stroke-opacity: .85; stroke-width: 1.1; stroke-linejoin: round; }' % P)
css.append('.%s-band { stroke: var(--bg); stroke-width: .6; }' % P)
css.append('.%s-nm { font: 700 7px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-win { fill: none; stroke: var(--gold); stroke-width: 2; opacity: 0; }' % P)
css.append('.%s-ar { fill: none; stroke: var(--gold); stroke-width: 1; }' % P)
css.append('.%s-lo { font: 7px var(--mono); fill: var(--paper); fill-opacity: .8; }' % P)
css.append('.%s-hi { text-anchor: end; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-s:not(.%s-c%d) { opacity: 0; }' % (P, P, N))
# the window: in on radio, a step along at each change, out before the summary
fr = ['0%% { opacity: 0; transform: none; } %s { opacity: 1; transform: none; }' % pc(.3)]
for k in range(N):
    a = k * STEP
    fr.append('%s, %s { opacity: 1; transform: translateX(%spx); }' % (pc(a + .4) if k else pc(.3), pc(a + STEP), g(k * SW)))
fr.append('%s, 100%% { opacity: 0; transform: translateX(%spx); }' % (pc(N * STEP + .3), g((N - 1) * SW)))
css.append('.%s-win { animation: %s-win %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-win { %s }' % (P, ' '.join(fr)))
for k in range(N + 1):
    a, b = (k * STEP, (k + 1) * STEP) if k < N else SUMMARY
    css.append('.%s-c%d { animation: %s-c%d %gs ease-in-out infinite; }' % (P, k, P, k, T))
    css.append(fade('c%d' % k, a + .1, a + .4, b - .2, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phem', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
