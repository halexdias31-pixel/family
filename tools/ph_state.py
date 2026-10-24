# The particle model and changes of state (GCSE Physics chapter 4): writes its row of data/textbooks.json
# through tools/anim_row.py. Edit the layout or the timeline and re-run: python3 tools/ph_state.py
#
# WHAT IT DRAWS, in one loop of T seconds: sixteen particles in a box. Solid: a 4 x 4 lattice, each
# particle vibrating on its spot. Heated, they melt into a liquid — still touching, but sliding past one
# another — then boil into a gas that fills the box, far apart and fast. Cooled, the same sixteen condense
# and freeze back into the lattice, which is where the loop began: nothing is added or taken away, so the
# mass never changes (a physical change). The still (reduced motion) is the solid with its caption.
import random, sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phstate'
T = 18.0
W, H = 240, 132
BX, BY, BW, BH = 70, 8, 100, 100          # the box
R = 4.6                                   # a particle's radius
rnd = random.Random(4)

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.1f' % v).rstrip('0').rstrip('.')

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

# Where each particle is in each arrangement.
SOLID = [(BX + BW / 2 - 15.75 + 10.5 * (k % 4), BY + BH - 5.4 - 10.5 * (k // 4)) for k in range(16)]

def liquid(seed):
    r = random.Random(seed)
    spots = [(BX + 7 + 9.6 * i + r.uniform(-.8, .8), BY + BH - 5.2 + r.uniform(-.4, .4)) for i in range(10)]
    spots += [(BX + 11.8 + 9.6 * i + r.uniform(-.8, .8), BY + BH - 13.6 + r.uniform(-.6, .6)) for i in range(6)]
    r.shuffle(spots)
    return spots

def gas(seed):
    r = random.Random(seed)
    out = []
    while len(out) < 16:
        x, y = r.uniform(BX + 6, BX + BW - 6), r.uniform(BY + 6, BY + BH - 6)
        if all((x - a) ** 2 + (y - b) ** 2 > 18 ** 2 for a, b in out): out.append((x, y))
    return out

L1, L2, L3 = liquid(1), liquid(2), liquid(3)
G = [gas(s) for s in (11, 12, 13, 14, 15)]
# the timeline: (time, arrangement); between two stops a particle moves in a straight line
STOPS = [(0.0, SOLID), (2.6, SOLID), (4.2, L1), (5.4, L2), (6.6, L3), (8.2, G[0]), (9.0, G[1]),
         (9.8, G[2]), (10.6, G[3]), (11.4, G[4]), (13.0, L1), (14.6, SOLID), (T, SOLID)]

CAPS = [
    ('c0', 0.0, 2.6, 'solid: fixed places<i class="%s-ln">vibrating, closest together</i>' % P),
    ('c1', 2.6, 4.2, 'melting<i class="%s-ln">energy in, bonds loosen</i>' % P),
    ('c2', 4.2, 6.6, 'liquid: still touching<i class="%s-ln">but sliding past each other</i>' % P),
    ('c3', 6.6, 8.2, 'boiling<i class="%s-ln">particles break free</i>' % P),
    ('c4', 8.2, 11.4, 'gas: far apart, fast<i class="%s-ln">random, filling the box</i>' % P),
    ('c5', 11.4, 14.6, 'condensing, then freezing<i class="%s-ln">energy out</i>' % P),
    ('c6', 14.6, T, 'the same 16 particles<i class="%s-ln">mass is conserved</i>' % P),
]
STILL = 'c0'
HEAT = [('hot', 2.0, 8.6), ('cold', 11.0, 15.0)]

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <rect class="%s-box" x="%d" y="%d" width="%d" height="%d" rx="2"/>' % (P, BX, BY, BW, BH))
for k, (x, y) in enumerate(SOLID):
    svg.append('      <g class="%s-a %s-m%d"><circle class="%s-a %s-p %s-j%d" cx="%s" cy="%s" r="%s"/></g>'
               % (P, P, k, P, P, P, k % 3, g(x), g(y), g(R)))
svg.append('      <g class="%s-a %s-hot"><path class="%s-fl" d="M108 126q4-8 0-14q8 5 6 14zM122 126q4-9 0-16q9 6 6 16zM136 126q4-8 0-14q8 5 6 14z"/>'
           '<text class="%s-t" x="44" y="122">heat in</text></g>' % (P, P, P, P))
svg.append('      <g class="%s-a %s-cold"><path class="%s-co" d="M120 112v14m-5-5l5 5l5-5"/>'
           '<text class="%s-t %s-tc" x="196" y="122">heat out</text></g>' % (P, P, P, P, P))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phstate-p: #6cb6ff; --phstate-cold: #9ec5e8; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(86vw, 20rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-box { fill: var(--paper); fill-opacity: .04; stroke: var(--paper); stroke-opacity: .55; stroke-width: 1.2; }' % P)
css.append('.%s-p { fill: var(--phstate-p); fill-opacity: .8; stroke: var(--paper); stroke-opacity: .7; stroke-width: .6; }' % P)
css.append('.%s-fl { fill: var(--gold); fill-opacity: .8; }' % P)
css.append('.%s-co { fill: none; stroke: var(--phstate-cold); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }' % P)
css.append('.%s-t { font: 700 8px var(--mono); fill: var(--gold); text-anchor: middle; }' % P)
css.append('.%s-tc { fill: var(--phstate-cold); }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-hot, .%s-cold { opacity: 0; }' % (P, P))
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
# each particle's journey, as offsets from its place in the solid
for k in range(16):
    sx, sy = SOLID[k]
    frames = []
    for t, arr in STOPS:
        x, y = arr[k]
        frames.append('%s { transform: translate(%spx, %spx); }' % (pc(t), g(x - sx), g(y - sy)))
    css.append('.%s-m%d { animation: %s-m%d %gs ease-in-out infinite; }' % (P, k, P, k, T))
    css.append('@keyframes %s-m%d { %s }' % (P, k, ' '.join(frames)))
# the vibration: three quick jitters, so neighbours do not move in step
for j, (dx, dy) in enumerate(((.7, -.5), (-.6, .6), (.5, .7))):
    css.append('.%s-j%d { animation: %s-j%d %gs linear infinite; }' % (P, j, P, j, .3 + .04 * j))
    css.append('@keyframes %s-j%d { 0%%, 100%% { transform: none; } 25%% { transform: translate(%spx, %spx); } '
               '75%% { transform: translate(%spx, %spx); } }' % (P, j, g(dx), g(dy), g(-dx), g(-dy)))
for name, a, b in HEAT:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, name, P, name, T))
    css.append(fade(name, a, a + .4, b - .4, b))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phstate', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
