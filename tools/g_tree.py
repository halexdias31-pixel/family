# A probability tree, without replacement (GCSE Maths chapter 19): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the counts or the timeline and re-run:
# python3 tools/g_tree.py
#
# WHAT IT DRAWS, in one loop of T seconds: 5 red and 3 blue, two taken without putting the first back.
# The first pair of branches (5/8, 3/8); then the second pairs, whose fractions change because one
# ball has gone (4/7 after a red, 5/7 after a blue); then the red-red path lit end to end and its
# probability multiplied along it, 5/8 × 4/7 = 20/56; then every outcome, adding to 56/56.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gtree'
T = 16.0
W, H = 220, 140
RED, BLUE = 5, 3
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

# A LINE IS HIDDEN UNTIL ITS DRAW BEGINS: a dash of no length still paints its round cap, a dot at the end.
def draw(name, a, b):
    return ('@keyframes %s-%s { 0%%, %s { stroke-dashoffset: 1; opacity: 0; } %s { stroke-dashoffset: 1; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } 100%% { stroke-dashoffset: 0; opacity: 0; } }'
            % (P, name, pc(a), pc(a + .05), pc(b), pc(END)))

N = RED + BLUE
ROOT = (12, 70)
NODE = {'R': (80, 36), 'B': (80, 104), 'RR': (148, 16), 'RB': (148, 56), 'BR': (148, 84), 'BB': (148, 124)}
def frac(path):
    """the probability on the last branch of `path`, given the balls already taken"""
    r, b = RED - path[:-1].count('R'), BLUE - path[:-1].count('B')
    return (r if path[-1] == 'R' else b), r + b
S1, S2R, S2B, LIT, ALL = 1.8, 4.0, 6.2, 8.4, 11.0
BR = [('R', S1), ('B', S1), ('RR', S2R), ('RB', S2R), ('BR', S2B), ('BB', S2B)]

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <circle class="%s-root" cx="%d" cy="%d" r="3"/>' % (P, ROOT[0], ROOT[1]))
for path, at in BR:
    a = ROOT if len(path) == 1 else NODE[path[:-1]]
    b = NODE[path]
    n, d = frac(path)
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + (-5 if b[1] < a[1] else 11)
    svg.append('      <path class="%s-br %s-b%s" pathLength="1" d="M%d %dL%d %d"/>' % (P, P, path.lower(), a[0], a[1], b[0], b[1]))
    svg.append('      <g class="%s-tip %s-t%s"><circle class="%s-%s" cx="%d" cy="%d" r="4.5"/>'
               '<text class="%s-fr" x="%g" y="%g">%d/%d</text></g>' % (P, P, path.lower(), P, 'red' if path[-1] == 'R' else 'blue', b[0], b[1], P, mx, my, n, d))
# the red-red path, lit over the top of its two branches
svg.append('      <path class="%s-lit" pathLength="1" d="M%d %dL%d %dL%d %d"/>' % (P, ROOT[0], ROOT[1], NODE['R'][0], NODE['R'][1], NODE['RR'][0], NODE['RR'][1]))
for path in ('RR', 'RB', 'BR', 'BB'):
    num = 1
    for k in range(1, 3):
        n, d = frac(path[:k]); num *= n
    x, y = NODE[path]
    svg.append('      <text class="%s-out %s-o%s" x="%d" y="%d">%s <tspan class="%s-p">%d/56</tspan></text>' % (P, P, path.lower(), x + 10, y + 4, path, P, num))
svg.append('    </svg>')
CAPS = [
    ('c0', 0.2, S1, '5 red, 3 blue: take two<i class="gtree-ln">without putting one back</i>'),
    ('c1', S1, S2R, 'first ball<i class="gtree-ln">5/8 red, 3/8 blue</i>'),
    ('c2', S2R, S2B, 'after a red<i class="gtree-ln">4 red of the 7 left</i>'),
    ('c3', S2B, LIT, 'after a blue<i class="gtree-ln">5 red of the 7 left</i>'),
    ('c4', LIT, ALL, 'P(both red) = 5/8 × 4/7<i class="gtree-ln">= 20/56 = <b class="gtree-g">5/14</b></i>'),
    ('c5', ALL, T, 'multiply along a path<i class="gtree-ln">20 + 15 + 15 + 6 = 56</i>'),
]
STILL = 'c4'
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gtree-r: #e0605a; --gtree-b: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(80vw, 19rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-root { fill: var(--paper); }' % P)
css.append('.%s-br { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.4; stroke-dasharray: 1; }' % P)
css.append('.%s-lit { fill: none; stroke: var(--gold); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; }' % P)
css.append('.%s-red { fill: var(--gtree-r); } .%s-blue { fill: var(--gtree-b); }' % (P, P))
css.append('.%s-fr { font: 700 9px var(--mono); fill: var(--paper); text-anchor: middle; stroke: var(--bg); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }' % P)
css.append('.%s-out { font: 700 9px var(--mono); fill: var(--paper); fill-opacity: .8; }' % P)
css.append('.%s-p { fill: var(--gold); fill-opacity: 1; }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; }' % P)
# THE STILL: the whole tree, the red-red path lit and every outcome written; its caption is the sum.
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
css.append('.%s-root { animation: %s-root %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('root', 0, 0.4, END, T))
for path, at in BR:
    c = path.lower()
    css.append('.%s-b%s { animation: %s-b%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(draw('b' + c, at, at + 0.8))
    css.append('.%s-t%s { animation: %s-t%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade('t' + c, at + 0.7, at + 1.0, END, T))
css.append('.%s-lit { animation: %s-lit %gs ease-in-out infinite; }' % (P, P, T))
css.append(draw('lit', LIT, LIT + 1.2))
for path, at in (('rr', LIT + 1.2), ('rb', ALL), ('br', ALL + 0.3), ('bb', ALL + 0.6)):
    css.append('.%s-o%s { animation: %s-o%s %gs ease-in-out infinite; }' % (P, path, P, path, T))
    css.append(fade('o' + path, at, at + 0.4, END, T))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-root, .%s-br, .%s-tip, .%s-lit, .%s-out, .%s-s { animation: none; }' % (P, P, P, P, P, P))
css.append('}')

anim_row.write_anim('gtree', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
