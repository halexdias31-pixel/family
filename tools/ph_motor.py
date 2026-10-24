# The motor effect and Fleming's left-hand rule (GCSE Physics chapter 11): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the layout or the timeline and re-run:
# python3 tools/ph_motor.py
#
# WHAT IT DRAWS, in one loop of T seconds: a wire seen end on between the poles of a magnet. The field runs
# N to S, its lines flowing. A current switched on into the page (⊗) makes its own circular field, turning
# clockwise; the two fields together push the wire down, and it moves. Reversed (⊙, out of the page), the
# rings turn the other way and the wire is pushed up. Then the rule that predicts it: first finger the
# field, second finger the current, thumb the motion — drawn as three arrows matching the first case
# (field right, current into the page, motion down). The still (reduced motion) is the first case with
# its force and caption.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phmotor'
T = 16.0
W, H = 240, 120
CX, CY = 120, 58

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.') or '0'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

SHOW = [  # (class, from, to)
    ('field', .2, 12.2), ('win', 3.0, 9.6), ('wout', 9.6, 12.2), ('fdn', 6.0, 9.6), ('fup', 10.2, 12.2), ('rule', 12.6, 15.7),
]
CAPS = [
    ('c0', 0.3, 3.0, 'a magnetic field, N to S<i class="%s-ln">the lines show its direction</i>' % P),
    ('c1', 3.0, 6.0, 'current into the page ⊗<i class="%s-ln">makes its own circular field</i>' % P),
    ('c2', 6.0, 9.6, 'the fields push the wire<i class="%s-ln">F = B × I × l, at right angles</i>' % P),
    ('c3', 9.6, 12.2, 'reverse the current ⊙<i class="%s-ln">the force reverses: up</i>' % P),
    ('c4', 12.4, 15.7, 'Fleming\'s left-hand rule<i class="%s-ln">field, current, motion</i>' % P),
]
STILL = 'c2'

def arrow(x0, y0, x1, y1, cls):
    import math
    a = math.atan2(y1 - y0, x1 - x0)
    hx, hy = x1 - 6 * math.cos(a), y1 - 6 * math.sin(a)
    px, py = 3 * math.sin(a), -3 * math.cos(a)
    return '<path class="%s" d="M%s %sL%s %sM%s %sL%s %sL%s %sZ"/>' % (cls, g(x0), g(y0), g(hx), g(hy), g(x1), g(y1), g(hx + px), g(hy + py), g(hx - px), g(hy - py))

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <g class="%s-a %s-mag">' % (P, P))
svg.append('        <rect class="%s-n" x="14" y="26" width="40" height="64" rx="2"/><text class="%s-pl" x="34" y="62">N</text>' % (P, P))
svg.append('        <rect class="%s-sp" x="186" y="26" width="40" height="64" rx="2"/><text class="%s-pl" x="206" y="62">S</text>' % (P, P))
svg.append('      </g>')
svg.append('      <g class="%s-a %s-field">' % (P, P))
for y in (34, 46, 70, 82):
    svg.append('        <path class="%s-a %s-fl" d="M56 %dH184"/>' % (P, P, y))
svg.append('        <path class="%s-a %s-fl" d="M56 %dH%dM%d %dH184"/>' % (P, P, CY, CX - 26, CX + 26, CY))
svg.append('        <path class="%s-hd" d="%s"/>' % (P, ''.join('M%d %dl-4-3m4 3l-4 3M%d %dl-4-3m4 3l-4 3' % (78, y, 172, y) for y in (34, 46, CY, 70, 82))))
svg.append('      </g>')
svg.append('      <g class="%s-a %s-wire">' % (P, P))
svg.append('        <circle class="%s-w" cx="%d" cy="%d" r="7"/>' % (P, CX, CY))
svg.append('        <g class="%s-a %s-win"><circle class="%s-a %s-ring %s-cw" cx="%d" cy="%d" r="13"/><circle class="%s-a %s-ring %s-cw" cx="%d" cy="%d" r="20"/>'
           '<path class="%s-x" d="M%d %dl8 8m0-8l-8 8"/></g>' % (P, P, P, P, P, CX, CY, P, P, P, CX, CY, P, CX - 4, CY - 4))
svg.append('        <g class="%s-a %s-wout"><circle class="%s-a %s-ring %s-ccw" cx="%d" cy="%d" r="13"/><circle class="%s-a %s-ring %s-ccw" cx="%d" cy="%d" r="20"/>'
           '<circle class="%s-dt" cx="%d" cy="%d" r="2"/></g>' % (P, P, P, P, P, CX, CY, P, P, P, CX, CY, P, CX, CY))
svg.append('        <g class="%s-a %s-fdn">%s<text class="%s-fl2" x="%d" y="%d">F</text></g>' % (P, P, arrow(CX, CY + 9, CX, CY + 30, '%s-fa' % P), P, CX + 8, CY + 28))
svg.append('        <g class="%s-a %s-fup">%s<text class="%s-fl2" x="%d" y="%d">F</text></g>' % (P, P, arrow(CX, CY - 9, CX, CY - 30, '%s-fa' % P), P, CX + 8, CY - 22))
svg.append('      </g>')
svg.append('      <g class="%s-a %s-rule">' % (P, P))
svg.append('        %s<text class="%s-rl" x="%d" y="%d">field: 1st finger</text>' % (arrow(CX, CY, CX + 46, CY, '%s-ra' % P), P, CX + 4, CY - 5))
svg.append('        %s<text class="%s-rl %s-re" x="%d" y="%d">current: 2nd finger</text>' % (arrow(CX, CY, CX - 26, CY - 26, '%s-ra %s-rc' % (P, P)), P, P, CX - 28, CY - 30))
svg.append('        %s<text class="%s-rl" x="%d" y="%d">motion: thumb</text>' % (arrow(CX, CY, CX, CY + 40, '%s-ra %s-rm' % (P, P)), P, CX + 5, CY + 38))
svg.append('        <text class="%s-rn" x="%d" y="%d">(into the page)</text>' % (P, CX - 28, CY - 21))
svg.append('      </g>')
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phmotor-n: #e0605a; --phmotor-s: #6cb6ff; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-n { fill: var(--phmotor-n); fill-opacity: .7; }' % P)
css.append('.%s-sp { fill: var(--phmotor-s); fill-opacity: .7; }' % P)
css.append('.%s-pl { font: 700 14px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-fl { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1; stroke-dasharray: 6 4; }' % P)
css.append('.%s-hd { fill: none; stroke: var(--paper); stroke-width: 1.2; }' % P)
css.append('.%s-ring { fill: none; stroke: var(--gold); stroke-opacity: .75; stroke-width: 1; stroke-dasharray: 5 3; }' % P)
css.append('.%s-w { fill: var(--raised); stroke: var(--gold); stroke-width: 1.6; }' % P)
css.append('.%s-x { stroke: var(--gold); stroke-width: 1.6; }' % P)
css.append('.%s-dt { fill: var(--gold); }' % P)
css.append('.%s-fa { fill: var(--paper); stroke: var(--paper); stroke-width: 2; }' % P)
css.append('.%s-fl2 { font: 700 9px var(--mono); fill: var(--paper); }' % P)
css.append('.%s-ra { fill: var(--phmotor-s); stroke: var(--phmotor-s); stroke-width: 2; }' % P)
css.append('.%s-ra.%s-rc { fill: var(--gold); stroke: var(--gold); }' % (P, P))
css.append('.%s-ra.%s-rm { fill: var(--paper); stroke: var(--paper); }' % (P, P))
css.append('.%s-rl { font: 700 7.5px var(--mono); fill: var(--paper); }' % P)
css.append('.%s-re { text-anchor: end; }' % P)
css.append('.%s-rn { font: 6.5px var(--mono); fill: var(--paper); fill-opacity: .75; text-anchor: end; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-wout, .%s-fup, .%s-rule, .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, P, P, STILL))
css.append('.%s-fl { animation: %s-flow 1s linear infinite; }' % (P, P))
css.append('@keyframes %s-flow { to { stroke-dashoffset: -10; } }' % P)
css.append('.%s-cw { animation: %s-cw 1.2s linear infinite; }' % (P, P))
css.append('@keyframes %s-cw { to { stroke-dashoffset: -8; } }' % P)
css.append('.%s-ccw { animation: %s-ccw 1.2s linear infinite; }' % (P, P))
css.append('@keyframes %s-ccw { to { stroke-dashoffset: 8; } }' % P)
# the wire: pushed down, back, pushed up, back
css.append('.%s-wire { animation: %s-wire %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-wire { 0%%, %s { transform: none; opacity: 1; } %s, %s { transform: translateY(12px); opacity: 1; } '
           '%s, %s { transform: none; opacity: 1; } %s, %s { transform: translateY(-12px); opacity: 1; } %s { transform: none; opacity: 1; } '
           '%s, %s { transform: none; opacity: 0; } 100%% { transform: none; opacity: 1; } }'
           % (P, pc(6.6), pc(8.4), pc(9.2), pc(9.8), pc(10.4), pc(11.2), pc(11.8), pc(12.2), pc(12.5), pc(15.7)))
css.append('.%s-mag { animation: %s-mag %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-mag { 0%%, %s { opacity: 1; } %s, %s { opacity: .25; } 100%% { opacity: 1; } }' % (P, pc(12.2), pc(12.6), pc(15.6)))
for c, a, b in SHOW:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .4, b - .3, b))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phmotor', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
