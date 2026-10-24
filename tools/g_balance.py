# Solving a linear equation on a balance (GCSE Maths chapter 8): writes its row of data/textbooks.json
# through tools/anim_row.py. Edit the layout or the timeline and re-run: python3 tools/g_balance.py
#
# WHAT IT DRAWS, in one loop of T seconds: 5x − 3 = 2x + 9 as a level balance. Each x is a bag, each
# +1 a blue tile and each −1 a red one. Two bags come off both sides; three blue tiles go on both
# sides, and on the left each meets a red one and both vanish (a zero pair); then a third of each side
# is kept: one bag balances four tiles, x = 4. The beam never tilts, which is the whole rule: do the
# same to both sides. The still (reduced motion) is that last picture with its answer.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gbal'
T = 15.0
W, H = 220, 138
BEAM = 104                          # the beam's top edge; everything sits on it
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def life(name, born, die):
    """in over 0.5 s from `born`; lifted off and gone over 0.7 s from `die` (or with the rest at END)."""
    if die >= END:
        return fade(name, born, born + 0.5, END, T)
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; transform: none; } %s, %s { opacity: 1; transform: none; } '
            '%s, 100%% { opacity: 0; transform: translateY(-12px); } }' % (P, name, pc(born), pc(born + 0.5), pc(die), pc(die + 0.7)))

OFF2, ADD, PAIR, THIRD = 2.6, 5.4, 6.6, 9.2      # the four moves
BAG = (13, 18)
U = 10
ITEMS = []                          # (class, kind, x, y, born, die)
for i, x in enumerate((12, 28, 44)):             # the left's bottom row: three bags; two go at ÷ 3
    ITEMS.append(('lb%d' % i, 'bag', x, BEAM - BAG[1] - 2, 0.0, END if i == 0 else THIRD))
for i, x in enumerate((20, 36)):                 # stacked on them: the two bags that − 2x takes
    ITEMS.append(('lt%d' % i, 'bag', x, BEAM - 2 * BAG[1] - 3, 0.0, OFF2))
for i, x in enumerate((66, 79, 92)):             # −3: three red tiles, each met by a blue one
    ITEMS.append(('lr%d' % i, 'neg', x, BEAM - U - 2, 0.0, PAIR))
    ITEMS.append(('la%d' % i, 'pos', x, BEAM - 2 * U - 3, ADD, PAIR))
for i, x in enumerate((122, 138)):               # the right's 2x
    ITEMS.append(('rb%d' % i, 'bag', x, BEAM - BAG[1] - 2, 0.0, OFF2))
for k in range(12):                              # 9 tiles, then 3 more; one row of four is a third
    c, r = k % 4, k // 4
    ITEMS.append(('ru%d' % k, 'pos', 160 + 13 * c, BEAM - U - 2 - 12 * r, 0.0 if k < 9 else ADD, END if r == 0 else THIRD))

CAPS = [
    ('c0', 0.2, 2.4, '5x − 3 = 2x + 9'),
    ('c1', 2.4, 3.8, 'take 2x off both sides'),
    ('c2', 3.8, 5.2, '3x − 3 = 9'),
    ('c3', 5.2, 6.8, 'add 3 to both sides'),
    ('c4', 6.8, 8.8, '−3 + 3 = 0, so 3x = 12'),
    ('c5', 8.8, 10.4, 'divide both sides by 3'),
    ('c6', 10.4, 12.6, '<b class="gbal-g">x = 4</b><i class="gbal-ln">one bag balances four</i>'),
    ('c7', 12.6, T, 'check: 5 × 4 − 3 = 17<i class="gbal-ln">and 2 × 4 + 9 = 17</i>'),
]
STILL = 'c6'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <path class="%s-stand" d="M%d %dL%d %dH%dZ"/>' % (P, W / 2, BEAM + 3, W / 2 - 16, H - 4, W / 2 + 16))
svg.append('      <rect class="%s-beam" x="6" y="%d" width="%d" height="3" rx="1.5"/>' % (P, BEAM, W - 12))
for c, kind, x, y, born, die in ITEMS:
    if kind == 'bag':
        svg.append('      <g class="%s-it %s-%s"><rect class="%s-bag" x="%d" y="%d" width="%d" height="%d" rx="3"/>'
                   '<text class="%s-x" x="%g" y="%d">x</text></g>' % (P, P, c, P, x, y, BAG[0], BAG[1], P, x + BAG[0] / 2, y + 13))
    else:
        svg.append('      <rect class="%s-it %s-%s %s-%s" x="%d" y="%d" width="%d" height="%d" rx="1.5"/>' % (P, P, kind, P, c, x, y, U, U))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gbal-pos: #6fa8dc; --gbal-neg: #e0605a; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(80vw, 19rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-stand { fill: var(--paper); fill-opacity: .18; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.2; stroke-linejoin: round; }' % P)
css.append('.%s-beam { fill: var(--paper); fill-opacity: .8; }' % P)
css.append('.%s-bag { fill: var(--gold); fill-opacity: .3; stroke: var(--gold); stroke-width: 1.2; }' % P)
css.append('.%s-x { font: 700 11px var(--mono); fill: var(--gold); text-anchor: middle; }' % P)
css.append('.%s-pos { fill: var(--gbal-pos); fill-opacity: .55; stroke: var(--gbal-pos); stroke-width: 1; }' % P)
css.append('.%s-neg { fill: var(--gbal-neg); fill-opacity: .55; stroke: var(--gbal-neg); stroke-width: 1; }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); font-size: 1.3em; }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; }' % P)
# THE STILL: what is left at the end (one bag, four tiles) is opaque; everything that leaves is not.
gone = ['.%s-%s' % (P, c) for c, kind, x, y, born, die in ITEMS if die < END]
css.append('%s { opacity: 0; }' % ', '.join(gone))
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
for c, kind, x, y, born, die in ITEMS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(life(c, born, die))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-it, .%s-s { animation: none; }' % (P, P))
css.append('}')

anim_row.write_anim('gbal', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
