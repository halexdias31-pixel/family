# Resultant force and Newton's first and second laws (GCSE Physics chapter 8): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the forces or the timeline and re-run:
# python3 tools/ph_force.py
#
# WHAT IT DRAWS, in one loop of T seconds: a 20 kg box with its forces as arrows drawn to scale. The box
# stays in the middle and the ground moves under it, so its speed is the ground's. First 50 N each way
# on a still box: the resultant is zero and it stays still. Then the same balanced forces on a box already
# moving: it keeps its speed (the ground slides by steadily) — the first law's two halves. Then 80 N
# against 20 N: the two arrows give way to one resultant of 60 N, and the ground speeds up under the box,
# a = F ÷ m = 3 m/s². The still (reduced motion) is that last picture with its sum.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phforce'
T = 15.0
W, H = 240, 104
GY = 78                                     # the ground
BX, BW, BH = 95, 50, 30                     # the box
K = .75                                     # units of arrow per newton
MID = GY - BH / 2

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.') or '0'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def arrow(cls, newtons, right, label, extra=''):
    L = newtons * K
    x0 = BX + BW if right else BX
    x1 = x0 + L if right else x0 - L
    s = 1 if right else -1
    return ('<g class="%s-a %s-%s"><path class="%s-ar%s" d="M%s %sH%sM%s %sl%s -4v8z"/><text class="%s-fl" x="%s" y="%s">%s</text></g>'
            % (P, P, cls, P, extra, g(x0), g(MID), g(x1 - 5 * s), g(x1), g(MID), g(-6 * s), P, g((x0 + x1) / 2 if L > 30 else x1), g(MID - 6), label))

ARROWS = [  # (class, newtons, right, label, from, to, look)
    ('b1', 50, True, '50 N', 0.3, 8.0, ''), ('b2', 50, False, '50 N', 0.3, 8.0, ''),
    ('u1', 80, True, '80 N', 8.4, 11.2, ''), ('u2', 20, False, '20 N', 8.4, 11.2, ''),
    ('res', 60, True, '60 N', 11.2, 14.4, ' %s-rs' % P),
]
SPEED = [('v0', 'v = 0', 0.3, 4.0), ('v1', 'v steady', 4.0, 8.0), ('v2', 'v rising', 11.6, 14.4)]
CAPS = [
    ('c0', 0.3, 2.2, '50 N each way<i class="%s-ln">resultant force = 0</i>' % P),
    ('c1', 2.2, 4.0, 'first law<i class="%s-ln">a still object stays still</i>' % P),
    ('c2', 4.0, 8.0, 'resultant still 0<i class="%s-ln">a moving one keeps its speed</i>' % P),
    ('c3', 8.4, 11.2, '80 N − 20 N = 60 N<i class="%s-ln">one resultant, to the right</i>' % P),
    ('c4', 11.2, 14.4, 'second law: F = m × a<i class="%s-ln">a = 60 ÷ 20 = 3 m/s²</i>' % P),
]
STILL = 'c4'
# the ground's offset at each moment: still, then steady, then speeding up (s = ut + ½at²)
V0, ACC = 16.0, 12.0
GROUND = [(0, 0), (4.0, 0)]
for k in range(1, 9): GROUND.append((4.0 + k * .5, -V0 * k * .5))
s1 = -V0 * 6.5
GROUND.append((10.5, s1))
for k in range(1, 8):
    t = k * .5
    GROUND.append((10.5 + t, s1 - V0 * t - .5 * ACC * t * t))
SPAN = int(-GROUND[-1][1] // 16 + 17) * 16

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <path class="%s-gl" d="M0 %dH%d"/>' % (P, GY, W))
svg.append('      <path class="%s-a %s-gd" d="%s"/>' % (P, P, ''.join('M%d %dl-6 8' % (x, GY) for x in range(6, SPAN, 16))))
svg.append('      <rect class="%s-box" x="%d" y="%d" width="%d" height="%d" rx="1.5"/>' % (P, BX, GY - BH, BW, BH))
svg.append('      <text class="%s-kg" x="%g" y="%g">20 kg</text>' % (P, BX + BW / 2, MID + 3))
for c, n, right, lab, a, b, look in ARROWS:
    svg.append('      ' + arrow(c, n, right, lab, look))
for c, txt, a, b in SPEED:
    svg.append('      <text class="%s-a %s-sp %s-%s" x="%g" y="%d">%s</text>' % (P, P, P, c, BX + BW / 2, GY - BH - 8, txt))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phforce-back: #6cb6ff; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-gl { stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.2; }' % P)
css.append('.%s-gd { fill: none; stroke: var(--paper); stroke-opacity: .4; stroke-width: 1; }' % P)
css.append('.%s-box { fill: var(--gold); fill-opacity: .2; stroke: var(--gold); stroke-width: 1.3; }' % P)
css.append('.%s-kg { font: 700 8px var(--mono); fill: var(--gold); text-anchor: middle; }' % P)
css.append('.%s-ar { fill: var(--gold); stroke: var(--gold); stroke-width: 2.4; }' % P)
css.append('.%s-b2 .%s-ar, .%s-u2 .%s-ar { fill: var(--phforce-back); stroke: var(--phforce-back); }' % (P, P, P, P))
css.append('.%s-ar.%s-rs { fill: var(--paper); stroke: var(--paper); }' % (P, P))
css.append('.%s-fl { font: 700 7.5px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-sp { font: 7.5px var(--mono); fill: var(--paper); fill-opacity: .85; text-anchor: middle; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
hidden = ['.%s-%s' % (P, c) for c, n, r, l, a, b, look in ARROWS if c != 'res'] + ['.%s-v0' % P, '.%s-v1' % P]
css.append('%s, .%s-s:not(.%s-%s) { opacity: 0; }' % (', '.join(hidden), P, P, STILL))
fr = ['%s { transform: translateX(%spx); opacity: 1; }' % (pc(t), g(x)) for t, x in GROUND]
fr.append('%s { transform: translateX(%spx); opacity: 0; }' % (pc(14.7), g(GROUND[-1][1])))
fr.append('%s { transform: none; opacity: 0; } 100%% { transform: none; opacity: 1; }' % pc(14.75))
css.append('.%s-gd { animation: %s-gd %gs linear infinite; }' % (P, P, T))
css.append('@keyframes %s-gd { %s }' % (P, ' '.join(fr)))
for c, n, right, lab, a, b, look in ARROWS + [(x[0], 0, 0, 0, x[2], x[3], '') for x in SPEED]:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .4, b - .3, b))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phforce', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
