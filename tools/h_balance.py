# A "how far do you agree?" judgement on a balance (GCSE History chapter 11): writes its row of data/textbooks.json
# through tools/anim_row.py. Edit the factors or the timeline and re-run: python3 tools/h_balance.py
#
# WHAT IT DRAWS, in one loop of T seconds: the statement "Versailles caused Weimar's crises, 1919–23", then a balance.
# Three weights go on the "agree" pan (reparations, the stab-in-the-back myth, the army cut to 100,000) and it tips;
# three go on the other (war debts, weak coalitions, extremists) and it comes most of the way back. Then the
# criterion that decides it (which factor made the others worse?) and the judgement, "largely agree", with its
# limit. An essay is that: both sides weighed, a criterion, a judgement. The still is the final tilt and judgement.
import sys, pathlib, math; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'hbal'
T = 18.0
W, H = 220, 112
END = T - 0.8
PX, PY, ARM = 110, 24, 76            # the pivot, and half the beam
PAN = 90                             # the pans' floor, level
BW, BH = 72, 12

LEFT = [('reparations', 2.8), ('stab in the back', 4.0), ('army of 100,000', 5.2)]
RIGHT = [('war debts', 6.4), ('weak coalitions', 7.6), ('extremists', 8.8)]
# the tilt over time: (time, degrees); negative is the left pan down
TILT = [(0, 0), (2.8, 0), (3.4, -3), (4.0, -3), (4.6, -6), (5.2, -6), (5.8, -9), (6.4, -9), (7.0, -7), (7.6, -7),
        (8.2, -5), (8.8, -5), (9.4, -4)]

CAPS = [
    ('c0', 0.2, 2.8, '"Versailles caused Weimar\'s<i class="%s-ln">crises, 1919–23." How far?</i>' % P),
    ('c1', 2.8, 6.4, 'for: the Treaty<i class="%s-ln">reparations led to the Ruhr</i>' % P),
    ('c2', 6.4, 10.0, 'against: other causes<i class="%s-ln">war debts, a weak constitution</i>' % P),
    ('c3', 10.0, 13.6, 'criterion: which factor<i class="%s-ln">made the others worse?</i>' % P),
    ('c4', 13.6, T, '<b class="%s-g">Judgement: largely agree</b><i class="%s-ln">but weak spots were already there</i>' % (P, P)),
]
STILL = 'c4'

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def drop(deg): return round(ARM * math.sin(math.radians(deg)), 1)

h = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
h.append('      <path class="%s-stand" d="M%d %dL%d %dH%dZ"/>' % (P, PX, PY, PX - 12, H - 2, PX + 12))
for side, sx, items in (('l', PX - ARM, LEFT), ('r', PX + ARM, RIGHT)):
    h.append('      <g class="%s-pan%s">' % (P, side))
    h.append('        <path class="%s-str" d="M%d %dL%d %dM%d %dL%d %d"/>' % (P, sx, PY, sx - BW / 2, PAN, sx, PY, sx + BW / 2, PAN))
    h.append('        <rect class="%s-plate" x="%d" y="%d" width="%d" height="2.5" rx="1"/>' % (P, sx - BW / 2 - 2, PAN, BW + 4))
    for i, (lab, born) in enumerate(items):
        y = PAN - (i + 1) * (BH + 1)
        h.append('        <g class="%s-wt %s-%s%d"><rect class="%s-blk %s-b%s" x="%d" y="%d" width="%d" height="%d" rx="2"/>'
                 '<text class="%s-wl" x="%d" y="%d">%s</text></g>' % (P, P, side, i, P, P, side, sx - BW / 2, y, BW, BH, P, sx, y + 8, lab))
    h.append('        <text class="%s-side" x="%d" y="%d">%s</text>' % (P, sx, PAN + 10, 'agree' if side == 'l' else 'disagree'))
    h.append('      </g>')
h.append('      <rect class="%s-beam" x="%d" y="%d" width="%d" height="3" rx="1.5"/>' % (P, PX - ARM - 4, PY - 1.5, 2 * ARM + 8))
h.append('      <circle class="%s-pin" cx="%d" cy="%d" r="2.5"/>' % (P, PX, PY))
h.append('    </svg>')
h.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    h.append('      <span class="%s-t %s-%s">%s</span>' % (P, P, c, html))
h.append('    </div>')
h.append('  </div>')

final = TILT[-1][1]
css = []
css.append('.an-%s { --hbal-for: #6fd8a0; --hbal-against: #e0605a; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(86vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; overflow: visible; }' % (P, P))
css.append('.%s-stand { fill: var(--paper); fill-opacity: .18; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1; stroke-linejoin: round; }' % P)
css.append('.%s-beam { fill: var(--paper); transform-box: view-box; transform-origin: %dpx %dpx; transform: rotate(%gdeg); }' % (P, PX, PY, final))
css.append('.%s-pin { fill: var(--gold); }' % P)
css.append('.%s-str { fill: none; stroke: var(--paper); stroke-opacity: .5; stroke-width: .7; }' % P)
css.append('.%s-plate { fill: var(--paper); fill-opacity: .8; }' % P)
css.append('.%s-blk { stroke-width: 1; }' % P)
css.append('.%s-bl { fill: var(--hbal-for); fill-opacity: .3; stroke: var(--hbal-for); }' % P)
css.append('.%s-br { fill: var(--hbal-against); fill-opacity: .3; stroke: var(--hbal-against); }' % P)
css.append('.%s-wl { font: 700 6px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-side { font: 6px var(--mono); fill: var(--paper); fill-opacity: .75; text-anchor: middle; }' % P)
css.append('.%s-panl { transform: translateY(%gpx); }' % (P, -drop(final)))
css.append('.%s-panr { transform: translateY(%gpx); }' % (P, drop(final)))
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 .98rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-t { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; }' % P)
css.append('.%s-t:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
def frames(fn):
    return ' '.join('%s { %s }' % ('0%' if t == 0 else pc(t), fn(d)) for t, d in TILT) + ' %s { %s } 100%% { %s }' % (pc(END), fn(final), fn(0))
css.append('.%s-beam { animation: %s-beam %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-beam { %s }' % (P, frames(lambda d: 'transform: rotate(%gdeg);' % d)))
css.append('.%s-panl { animation: %s-panl %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-panl { %s }' % (P, frames(lambda d: 'transform: translateY(%gpx);' % -drop(d))))
css.append('.%s-panr { animation: %s-panr %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-panr { %s }' % (P, frames(lambda d: 'transform: translateY(%gpx);' % drop(d))))
for side, items in (('l', LEFT), ('r', RIGHT)):
    for i, (lab, born) in enumerate(items):
        css.append('.%s-%s%d { animation: %s-%s%d %gs ease-in-out infinite; }' % (P, side, i, P, side, i, T))
        css.append('@keyframes %s-%s%d { 0%%, %s { opacity: 0; transform: translateY(-10px); } %s, %s { opacity: 1; transform: none; } %s, 100%% { opacity: 0; transform: none; } }'
                   % (P, side, i, pc(born), pc(born + 0.5), pc(END), pc(T)))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-beam, .%s-panl, .%s-panr, .%s-wt, .%s-t { animation: none; }' % ((P,) * 5))
css.append('}')

anim_row.write_anim('hbal', html='\n'.join(h), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(h), len(css)))
