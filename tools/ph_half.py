# Radioactive decay and half-life (GCSE Physics chapter 5): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the sample or the timeline and re-run: python3 tools/ph_half.py
#
# WHAT IT DRAWS, in one loop of T seconds: 64 unstable nuclei (gold) beside the chapter's count-rate graph,
# 800 counts a minute with a half-life of 2 days. Nuclei decay one here, one there, in no pattern — which
# ones is random, and nobody can say which is next — but by each half-life half of those left have gone:
# 64 → 32 → 16 → 8, while the graph is traced 800 → 400 → 200 → 100 and each half-life is read off it.
# Which nucleus decays when is drawn from a seeded shuffle, so the script writes the same row every time.
# The still (reduced motion) is the end: 8 left of 64, the graph whole, 1/8 of the start.
import math, random, sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phhalf'
T = 14.0
W, H = 240, 124
HL = 3.0                                     # seconds of loop per half-life (2 days)
T0 = 0.8
END = T0 + 3 * HL + 2.6
GX, GY, SD, SC = 124, 100, 16.0, .1          # graph origin; units per day and per count

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.') or '0'
def gxy(day): return GX + day * SD, GY - 800 * 2 ** (-day / 2) * SC

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

# fourteen moments of decay, four nuclei each: eight in the first half-life, four in the second, two in the
# third; within a half-life they come thicker at first, as the number left falls
SLOTS = []
for k, n in enumerate((8, 4, 2)):
    for j in range(n):
        SLOTS.append(T0 + k * HL + HL * (1 - 2 ** (-(j + .5) / n * 1.0)) / (1 - 2 ** -1.0))
rnd = random.Random(7)
order = list(range(64)); rnd.shuffle(order)
SLOT_OF = {}
for s in range(len(SLOTS)):
    for n in order[4 * s:4 * s + 4]: SLOT_OF[n] = s

CAPS = [
    ('c0', 0.3, T0 + HL, '64 unstable nuclei<i class="%s-ln">which decays next? random</i>' % P),
    ('c1', T0 + HL, T0 + 2 * HL, 'one half-life: 2 days<i class="%s-ln">800 → 400 per minute</i>' % P),
    ('c2', T0 + 2 * HL, T0 + 3 * HL, 'two half-lives: 4 days<i class="%s-ln">400 → 200</i>' % P),
    ('c3', T0 + 3 * HL, T0 + 3 * HL + 1.4, 'three half-lives: 6 days<i class="%s-ln">200 → 100</i>' % P),
    ('c4', T0 + 3 * HL + 1.4, END, '1/2 × 1/2 × 1/2 = 1/8<i class="%s-ln">800 : 100 is 8 : 1</i>' % P),
]
STILL = 'c4'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for n in range(64):
    x, y = 17 + 10 * (n % 8), 22 + 10 * (n // 8)
    svg.append('      <circle class="%s-gone" cx="%d" cy="%d" r="3.6"/>' % (P, x, y))
for n in range(64):
    x, y = 17 + 10 * (n % 8), 22 + 10 * (n // 8)
    cls = ' %s-a %s-k%d' % (P, P, SLOT_OF[n]) if n in SLOT_OF else ''
    svg.append('      <circle class="%s-nu%s" cx="%d" cy="%d" r="3.6"/>' % (P, cls, x, y))
for k, cnt in enumerate((800, 400, 200, 100)):
    svg.append('      <text class="%s-a %s-ct %s-n%d" x="52" y="112">%d per minute</text>' % (P, P, P, k, cnt))
svg.append('      <path class="%s-ax" d="M%d %dV%dH%d"/>' % (P, GX, GY - 86, GY, GX + 7 * SD))
svg.append('      <text class="%s-an" x="%d" y="%d">count rate</text><text class="%s-an %s-ae" x="%d" y="%d">days</text>' % (P, GX + 3, GY - 82, P, P, GX + 7 * SD, GY + 18))
for d in (0, 2, 4, 6):
    svg.append('      <text class="%s-tn" x="%s" y="%d">%d</text>' % (P, g(GX + d * SD), GY + 9, d))
for c in (800, 400, 200, 100):
    svg.append('      <text class="%s-tn %s-te" x="%d" y="%s">%d</text>' % (P, P, GX - 2, g(GY - c * SC + 2.3), c))
curve = [gxy(d / 4) for d in range(0, 27)]
svg.append('      <path class="%s-a %s-curve" d="M%s" pathLength="1"/>' % (P, P, ' L'.join('%s %s' % (g(x), g(y)) for x, y in curve)))
for k in (1, 2, 3):
    x, y = gxy(2 * k)
    svg.append('      <path class="%s-a %s-hl %s-h%d" d="M%d %sH%sV%d"/>' % (P, P, P, k, GX, g(y), g(x), GY))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-gone { fill: var(--paper); fill-opacity: .14; }' % P)
css.append('.%s-nu { fill: var(--gold); }' % P)
css.append('.%s-ct { font: 700 7.5px var(--mono); fill: var(--gold); text-anchor: middle; }' % P)
css.append('.%s-ax { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1; }' % P)
css.append('.%s-an { font: 7px var(--mono); fill: var(--paper); fill-opacity: .75; }' % P)
css.append('.%s-ae { text-anchor: end; }' % P)
css.append('.%s-tn { font: 6.5px var(--mono); fill: var(--paper); fill-opacity: .75; text-anchor: middle; }' % P)
css.append('.%s-te { text-anchor: end; }' % P)
css.append('.%s-curve { fill: none; stroke: var(--gold); stroke-width: 1.8; stroke-linejoin: round; stroke-dasharray: 1 1; }' % P)
css.append('.%s-hl { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: .8; stroke-dasharray: 2 1.5; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('%s, .%s-s:not(.%s-%s) { opacity: 0; }' % (', '.join(['.%s-k%d' % (P, s) for s in range(len(SLOTS))] + ['.%s-n%d' % (P, k) for k in range(3)]), P, P, STILL))
for s, t in enumerate(SLOTS):
    css.append('.%s-k%d { animation: %s-k%d %gs ease-out infinite; }' % (P, s, P, s, T))
    css.append('@keyframes %s-k%d { 0%%, %s { opacity: 1; } %s, %s { opacity: 0; } 100%% { opacity: 1; } }' % (P, s, pc(t), pc(t + .25), pc(END + .3)))
for k in range(4):
    a = 0.2 if k == 0 else T0 + k * HL
    b = T0 + (k + 1) * HL if k < 3 else END
    css.append('.%s-n%d { animation: %s-n%d %gs ease-in-out infinite; }' % (P, k, P, k, T))
    css.append(fade('n%d' % k, a, a + .3, b - .1 if k < 3 else b, b + (.1 if k < 3 else .4)))
# the curve passes each half-life as the sample does
L = [0.0]
for i in range(len(curve) - 1): L.append(L[-1] + math.dist(curve[i], curve[i + 1]))
d = ['0%%, %s { stroke-dashoffset: 1; opacity: 1; }' % pc(T0)]
for k in (1, 2, 3):
    d.append('%s { stroke-dashoffset: %s; opacity: 1; }' % (pc(T0 + k * HL), g(1 - L[8 * k] / L[-1])))
d.append('%s { stroke-dashoffset: 0; opacity: 1; } %s { stroke-dashoffset: 0; opacity: 1; } %s, 100%% { stroke-dashoffset: 0; opacity: 0; }'
         % (pc(T0 + 3 * HL + .5), pc(END), pc(END + .4)))
css.append('.%s-curve { animation: %s-curve %gs linear infinite; }' % (P, P, T))
css.append('@keyframes %s-curve { %s }' % (P, ' '.join(d)))
for k in (1, 2, 3):
    css.append('.%s-h%d { animation: %s-h%d %gs ease-in-out infinite; }' % (P, k, P, k, T))
    css.append(fade('h%d' % k, T0 + k * HL - .1, T0 + k * HL + .3, END, END + .4))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phhalf', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
