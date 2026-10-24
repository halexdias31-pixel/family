# Series and parallel circuits (GCSE Physics chapter 2): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the circuits or the timeline and re-run: python3 tools/ph_circ.py
#
# WHAT IT DRAWS, in one loop of T seconds, both of the chapter's worked circuits. First 2 Ω and 4 Ω in
# series on 12 V: charge flows round the one loop at the same rate everywhere (both ammeters read 2 A)
# and the 12 V is shared, 4 V and 8 V. Then two branches on 6 V: each has the full 6 V, the branches take
# 1 A and 2 A, and the battery's wire carries the sum, 3 A. The moving dots are the current: their speed
# is in proportion to it, so the 2 A branch flows twice as fast as the 1 A one and the main wire three
# times. The still (reduced motion) is the series circuit with every reading on it.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phcirc'
T = 17.0
W, H = 240, 124
L, R_, TOP, BOT = 30, 210, 20, 100
SPEED = 6.0                                   # units a second per amp
GAP = 10.0                                    # dot spacing

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def cell(volts):
    """the battery on the left wire, long (+) plate on top, and its label"""
    return ['<path class="%s-bat" d="M%d 54h-%dM%d 54h%dM%d 62h-5M%d 62h5"/>' % (P, L, 9, L, 9, L, L),
            '<text class="%s-v" x="%d" y="%d">%s</text>' % (P, L + 13, 61, volts)]

def res(x, y, w, h, label):
    return '<rect class="%s-r" x="%g" y="%g" width="%g" height="%g"/><text class="%s-rt" x="%g" y="%g">%s</text>' % (
        P, x, y, w, h, P, x + w / 2, y + h / 2 + 2.6, label)

def meter(x, y):
    return '<circle class="%s-m" cx="%g" cy="%g" r="6.5"/><text class="%s-mt" x="%g" y="%g">A</text>' % (P, x, y, P, x, y + 2.8)

def flow(cls, d, amps):
    return ('<path class="%s-a %s-flow %s-%s" d="%s"/>' % (P, P, P, cls, d), (cls, amps))

SCENES = [('se', 0.0, 8.5), ('pa', 8.5, T)]
CAPS = [
    ('c0', 0.3, 2.8, 'series: one loop<i class="%s-ln">R = 2 Ω + 4 Ω = 6 Ω</i>' % P),
    ('c1', 2.8, 5.4, 'the same current all round<i class="%s-ln">I = 12 ÷ 6 = 2 A</i>' % P),
    ('c2', 5.4, 8.2, 'the 12 V is shared<i class="%s-ln">4 V + 8 V = 12 V</i>' % P),
    ('c3', 8.8, 11.4, 'parallel: two branches<i class="%s-ln">each has the full 6 V</i>' % P),
    ('c4', 11.4, 14.0, 'branch currents add<i class="%s-ln">1 A + 2 A = 3 A</i>' % P),
    ('c5', 14.0, 16.7, 'more current, faster flow<i class="%s-ln">the battery supplies 3 A</i>' % P),
]
STILL = 'c2'
# readings: (class, x, y, text, appears, scene)
READ = [('s2a', 80, 116, '2 A', 3.0, 'se'), ('s2b', 160, 116, '2 A', 3.0, 'se'),
        ('s4v', 77, 11, '4 V', 5.6, 'se'), ('s8v', 155, 11, '8 V', 5.6, 'se'),
        ('p6a', 96, 64, '6 V', 9.0, 'pa'), ('p6b', 186, 64, '6 V', 9.0, 'pa'),
        ('p1', 134, 39, '1 A', 11.6, 'pa'), ('p2', 225, 39, '2 A', 11.6, 'pa'), ('p3', 70, 116, '3 A', 11.6, 'pa')]

flows = []
svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
# THE SERIES CIRCUIT
loop = 'M%d 54V%dH%dV%dH%dV62' % (L, TOP, R_, BOT, L)
svg.append('      <g class="%s-a %s-se">' % (P, P))
svg.append('        <path class="%s-wire" d="%s"/>' % (P, loop))
m, f = flow('fs', loop, 2); svg.append('        ' + m); flows.append(f)
for s in cell('12 V'): svg.append('        ' + s)
svg.append('        ' + res(62, TOP - 5, 30, 10, '2 Ω'))
svg.append('        ' + res(140, TOP - 5, 30, 10, '4 Ω'))
svg.append('        ' + meter(80, BOT))
svg.append('        ' + meter(160, BOT))
for c, x, y, txt, t0, sc in READ:
    if sc == 'se': svg.append('        <text class="%s-k %s-%s" x="%d" y="%d">%s</text>' % (P, P, c, x, y, txt))
svg.append('      </g>')
# THE PARALLEL CIRCUIT
B1, B2 = 120, R_
main1 = 'M%d 54V%dH%d' % (L, TOP, B1)
main2 = 'M%d %dH%dV62' % (B1, BOT, L)
br1 = 'M%d %dV%d' % (B1, TOP, BOT)
br2 = 'M%d %dH%dV%dH%d' % (B1, TOP, B2, BOT, B1)
svg.append('      <g class="%s-a %s-pa">' % (P, P))
svg.append('        <path class="%s-wire" d="%s %s %s %s"/>' % (P, main1, main2, br1, br2))
for cls, d, amps in (('f1', main1, 3), ('f2', main2, 3), ('f3', br1, 1), ('f4', br2, 2)):
    m, f = flow(cls, d, amps); svg.append('        ' + m); flows.append(f)
for s in cell('6 V'): svg.append('        ' + s)
svg.append('        ' + res(B1 - 5, 50, 10, 28, ''))
svg.append('        ' + res(B2 - 5, 50, 10, 28, ''))
svg.append('        ' + meter(B1, 36))
svg.append('        ' + meter(B2, 36))
svg.append('        ' + meter(70, BOT))
for c, x, y, txt, t0, sc in READ:
    if sc == 'pa': svg.append('        <text class="%s-k %s-%s" x="%d" y="%d">%s</text>' % (P, P, c, x, y, txt))
svg.append('      </g>')
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phcirc-flow: #6cb6ff; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-wire { fill: none; stroke: var(--paper); stroke-opacity: .55; stroke-width: 1.4; }' % P)
css.append('.%s-flow { fill: none; stroke: var(--phcirc-flow); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 0 %g; }' % (P, GAP))
css.append('.%s-bat { fill: none; stroke: var(--paper); stroke-width: 2; }' % P)
css.append('.%s-v { font: 700 8px var(--mono); fill: var(--gold); }' % P)
css.append('.%s-r { fill: var(--raised); stroke: var(--paper); stroke-width: 1.3; }' % P)
css.append('.%s-rt { font: 7px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-m { fill: var(--raised); stroke: var(--paper); stroke-width: 1.1; }' % P)
css.append('.%s-mt { font: 700 7.5px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-k { font: 700 8px var(--mono); fill: var(--gold); text-anchor: middle; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-pa, .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, STILL))
for c, a, b in SCENES:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .4, b - .4, b))
# the current: dots moving along each wire at a speed in proportion to the amps
for cls, amps in flows:
    css.append('.%s-%s { animation: %s-run %gs linear infinite; }' % (P, cls, P, round(GAP / (SPEED * amps), 3)))
css.append('@keyframes %s-run { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -%g; } }' % (P, GAP))
for c, x, y, txt, t0, sc in READ:
    end = 8.1 if sc == 'se' else T - .4
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, t0, t0 + .4, end, end + .3))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a, .%s-k { animation: none; }' % (P, P))
css.append('}')

anim_row.write_anim('phcirc', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
