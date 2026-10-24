# Conservation of momentum (GCSE Physics chapter 8): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the trolleys or the timeline and re-run: python3 tools/ph_mom.py
#
# WHAT IT DRAWS, in one loop of T seconds, two trolleys at their true relative speeds (10 units a second
# for each m/s). First the chapter's collision: 2 kg at 3 m/s hits a still 1 kg trolley and they stick,
# moving off together at 2 m/s — 2 × 3 = 3 × 2, the total 6 kg m/s before and after. Then the same two at
# rest, pushed apart by a spring: the 2 kg goes left at 1 m/s, the 1 kg right at 2 m/s, and the total is
# still zero. The total sits over each scene and never changes, which is the law. The still (reduced
# motion) is the stuck pair moving off, with the sum.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phmom'
T = 16.0
W, H = 240, 96
TY = 72                                      # the track's top
K = 10.0                                     # units a second per m/s

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.') or '0'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def trolley(x, w, kg, look):
    return ('<rect class="%s-tr %s-%s" x="%g" y="%d" width="%g" height="16" rx="1.5"/><text class="%s-kg" x="%g" y="%d">%s</text>'
            '<circle class="%s-wh" cx="%g" cy="%d" r="2.6"/><circle class="%s-wh" cx="%g" cy="%d" r="2.6"/>'
            % (P, P, look, x, TY - 19, w, P, x + w / 2, TY - 8, kg, P, x + 5, TY - 2.6, P, x + w - 5, TY - 2.6))

def vel(cls, x, y, v, label):
    """a velocity arrow, length in proportion, with its value"""
    L = 7 * abs(v)
    s = 1 if v > 0 else -1
    x1 = x + s * L
    return ('<g class="%s-a %s-%s"><path class="%s-va" d="M%g %gH%gM%g %gl%g -3v6z"/><text class="%s-vl" x="%g" y="%g">%s</text></g>'
            % (P, P, cls, P, x, y, x1 - 4 * s, x1, y, -5 * s, P, x + s * L / 2, y - 4, label))

# scene 1: the collision
A0, AW, BW = 10, 30, 20
B0 = 120
HIT = .8 + (B0 - A0 - AW) / (3 * K)          # when A reaches B
GO = 2.5                                     # how long they move off together
S1 = [(HIT, 0.0), (HIT + GO, 2 * K * GO)]
# scene 2: the push apart
M = 120
REL, RUN = 10.4, 3.0

CAPS = [
    ('c0', 0.3, HIT, 'before: 2 × 3 + 1 × 0<i class="%s-ln">= 6 kg m/s</i>' % P),
    ('c1', HIT, HIT + GO, 'they stick: 6 = 3 × v<i class="%s-ln">so v = 2 m/s</i>' % P),
    ('c2', HIT + GO, 8.4, 'momentum before = after<i class="%s-ln">in a closed system</i>' % P),
    ('c3', 8.9, REL, 'two trolleys at rest<i class="%s-ln">total momentum 0</i>' % P),
    ('c4', REL, REL + RUN, 'pushed apart by a spring<i class="%s-ln">equal and opposite forces</i>' % P),
    ('c5', REL + RUN, 15.6, '2 × (−1) + 1 × 2 = 0<i class="%s-ln">still zero: conserved</i>' % P),
]
STILL = 'c2'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <path class="%s-track" d="M4 %dH236"/>' % (P, TY))
svg.append('      <g class="%s-a %s-sa">' % (P, P))
svg.append('        <text class="%s-tot" x="120" y="12">total momentum: 6 kg m/s</text>' % P)
svg.append('        <g class="%s-a %s-ma">%s%s%s</g>' % (P, P, trolley(A0, AW, '2 kg', 'ta'), vel('v3', A0 + AW / 2, TY - 30, 3, '3 m/s'), vel('v2', A0 + AW, TY - 30, 2, '2 m/s')))
svg.append('        <g class="%s-a %s-mb">%s<text class="%s-a %s-vl %s-rest" x="%g" y="%d">at rest</text></g>' % (P, P, trolley(B0, BW, '1 kg', 'tb'), P, P, P, B0 + BW / 2, TY - 30))
svg.append('      </g>')
svg.append('      <g class="%s-a %s-sb">' % (P, P))
svg.append('        <text class="%s-tot" x="120" y="12">total momentum: 0</text>' % P)
svg.append('        <path class="%s-a %s-spr" d="M%d %dl2-3l2 6l2-6l2 6l2-3" />' % (P, P, M - 5, TY - 11))
svg.append('        <g class="%s-a %s-pa">%s%s</g>' % (P, P, trolley(M - 5 - AW, AW, '2 kg', 'ta'), vel('wl', M - 5 - AW / 2, TY - 30, -1, '1 m/s')))
svg.append('        <g class="%s-a %s-pb">%s%s</g>' % (P, P, trolley(M + 5, BW, '1 kg', 'tb'), vel('wr', M + 5 + BW / 2, TY - 30, 2, '2 m/s')))
svg.append('      </g>')
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phmom-b: #6cb6ff; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-track { stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.2; }' % P)
css.append('.%s-tr { stroke-width: 1.2; }' % P)
css.append('.%s-ta { fill: var(--gold); fill-opacity: .25; stroke: var(--gold); }' % P)
css.append('.%s-tb { fill: var(--phmom-b); fill-opacity: .25; stroke: var(--phmom-b); }' % P)
css.append('.%s-kg { font: 700 7px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-wh { fill: var(--raised); stroke: var(--paper); stroke-width: 1; }' % P)
css.append('.%s-va { fill: var(--paper); stroke: var(--paper); stroke-width: 1.4; }' % P)
css.append('.%s-vl { font: 7px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-tot { font: 700 8px var(--mono); fill: var(--gold); text-anchor: middle; }' % P)
css.append('.%s-spr { fill: none; stroke: var(--paper); stroke-width: 1; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-sb, .%s-v3, .%s-rest, .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, P, P, STILL))
css.append('.%s-ma { transform: translateX(%spx); }' % (P, g(B0 - A0 - AW + S1[1][1])))
css.append('.%s-mb { transform: translateX(%spx); }' % (P, g(S1[1][1])))
move = lambda name, stops: ('@keyframes %s-%s { %s }' % (P, name, ' '.join('%s { transform: translateX(%spx); }' % (k, g(x)) for k, x in stops)))
d1 = B0 - A0 - AW
css.append('.%s-ma { animation: %s-ma %gs linear infinite; }' % (P, P, T))
css.append(move('ma', [('0%, ' + pc(.8), 0), (pc(HIT), d1), (pc(HIT + GO) + ', 100%', d1 + S1[1][1])]))
css.append('.%s-mb { animation: %s-mb %gs linear infinite; }' % (P, P, T))
css.append(move('mb', [('0%, ' + pc(HIT), 0), (pc(HIT + GO) + ', 100%', S1[1][1])]))
css.append('.%s-pa { animation: %s-pa %gs linear infinite; }' % (P, P, T))
css.append(move('pa', [('0%, ' + pc(REL), 0), (pc(REL + RUN) + ', 100%', -1 * K * RUN)]))
css.append('.%s-pb { animation: %s-pb %gs linear infinite; }' % (P, P, T))
css.append(move('pb', [('0%, ' + pc(REL), 0), (pc(REL + RUN) + ', 100%', 2 * K * RUN)]))
for c, a, b in [('sa', .1, 8.6), ('sb', 8.7, 15.8), ('v3', .3, HIT), ('rest', .3, HIT), ('v2', HIT, 8.6),
                ('spr', 8.7, REL + .2), ('wl', REL, 15.8), ('wr', REL, 15.8)]:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .2, b))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phmom', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS; they meet at %.2f s' % (P, len(svg), len(css), HIT))
