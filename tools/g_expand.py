# Expanding double brackets as an area (GCSE Maths chapter 5): writes its row of data/textbooks.json
# through tools/anim_row.py. Edit the numbers or the timeline and re-run: python3 tools/g_expand.py
#
# WHAT IT DRAWS, in one loop of T seconds: a rectangle (x + 3) wide and (x + 2) tall, its sides
# labelled; the four cells fill one by one, each named as the product that makes it; then the two
# x-cells glow together as like terms and the caption collects them: x² + 5x + 6. Everything moves
# by opacity, so the loop ends on the empty rectangle it starts from.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gexp'
T = 13.0
W, H = 200, 150
X, U = 64, 14                       # the length x, and one unit, in viewBox units (x is NOT 64/14 units)
A, B = 3, 2                         # (x + A)(x + B)
L, TOP = 60, 30                     # the rectangle's top-left corner

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    """opacity 0 → 1 over [a, b], held, 1 → 0 over [c, d]."""
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

w1, w2, h1, h2 = X, A * U, X, B * U
CELLS = [  # class, x, y, w, h, label, caption, fill-in at
    ('xx', L, TOP, w1, h1, 'x²', 'x × x = x²', 1.6),
    ('ax', L + w1, TOP, w2, h1, '%dx' % A, '%d × x = %dx' % (A, A), 3.0),
    ('bx', L, TOP + h1, w1, h2, '%dx' % B, 'x × %d = %dx' % (B, B), 4.4),
    ('ab', L + w1, TOP + h1, w2, h2, str(A * B), '%d × %d = %d' % (A, B, A * B), 5.8),
]
END = T - 0.8                       # everything leaves together over the last 0.8 s
CAPS = [  # class, from, to, html
    ('c0', 0.2, 1.5, '(x + %d)(x + %d)' % (A, B)),
] + [('c' + c[0], c[7], c[7] + 1.4, c[6]) for c in CELLS] + [
    ('c5', 7.2, 8.6, 'x² + %dx + %dx + %d' % (A, B, A * B)),
    ('c6', 8.6, 10.2, 'like terms: <b class="gexp-o">%dx + %dx = %dx</b>' % (A, B, A + B)),
    ('c7', 10.2, END + 0.8, '(x + %d)(x + %d) = <b class="gexp-g">x² + %dx + %d</b>' % (A, B, A + B, A * B)),
]

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
# the sides: the bracket terms written along the top and down the left, with tick marks at the split
svg.append('      <g class="%s-side">' % P)
svg.append('        <path class="%s-tick" d="M%d %dv-8M%d %dv-8M%d %dv-8M%d %dh-8M%d %dh-8M%d %dh-8"/>'
           % (P, L, TOP - 2, L + w1, TOP - 2, L + w1 + w2, TOP - 2, L - 2, TOP, L - 2, TOP + h1, L - 2, TOP + h1 + h2))
svg.append('        <text class="%s-t" x="%g" y="%d">x</text>' % (P, L + w1 / 2, TOP - 8))
svg.append('        <text class="%s-t %s-n" x="%g" y="%d">+%d</text>' % (P, P, L + w1 + w2 / 2, TOP - 8, A))
svg.append('        <text class="%s-t" x="%d" y="%g">x</text>' % (P, L - 12, TOP + h1 / 2 + 4))
svg.append('        <text class="%s-t %s-n" x="%d" y="%g">+%d</text>' % (P, P, L - 14, TOP + h1 + h2 / 2 + 4, B))
svg.append('      </g>')
for c, x, y, w, h, lab, cap, at in CELLS:
    kind = 'sq' if c == 'xx' else ('one' if c == 'ab' else 'lin')
    svg.append('      <g class="%s-cell %s-%s">' % (P, P, c))
    svg.append('        <rect class="%s-%s-f" x="%d" y="%d" width="%d" height="%d"/>' % (P, kind, x, y, w, h))
    if c == 'ab':  # the six unit squares, so "6" is seen and not only read
        d = ''.join('M%d %dv%d' % (x + k * U, y, h) for k in range(1, A)) + ''.join('M%d %dh%d' % (x, y + k * U, w) for k in range(1, B))
        svg.append('        <path class="%s-unit" d="%s"/>' % (P, d))
    svg.append('        <text class="%s-l" x="%g" y="%g">%s</text>' % (P, x + w / 2, y + h / 2 + 5, lab))
    svg.append('      </g>')
# the like terms glow together: one outline round each x-cell
svg.append('      <g class="%s-like">' % P)
for c, x, y, w, h, *_ in CELLS:
    if c in ('ax', 'bx'):
        svg.append('        <rect class="%s-ring" x="%d" y="%d" width="%d" height="%d"/>' % (P, x + 1.5, y + 1.5, w - 3, h - 3))
svg.append('      </g>')
svg.append('      <rect class="%s-box" x="%d" y="%d" width="%d" height="%d"/>' % (P, L, TOP, w1 + w2, h1 + h2))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gexp-sq: #6fd8c4; --gexp-lin: #e8862c; --gexp-one: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(76vw, 18rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-box { fill: none; stroke: var(--paper); stroke-opacity: .8; stroke-width: 1.4; }' % P)
css.append('.%s-tick { fill: none; stroke: var(--paper); stroke-opacity: .5; stroke-width: 1; }' % P)
css.append('.%s-t { font: 700 12px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-n { fill: var(--gold); }' % P)
css.append('.%s-sq-f { fill: var(--gexp-sq); fill-opacity: .4; stroke: var(--gexp-sq); stroke-width: 1; }' % P)
css.append('.%s-lin-f { fill: var(--gexp-lin); fill-opacity: .4; stroke: var(--gexp-lin); stroke-width: 1; }' % P)
css.append('.%s-one-f { fill: var(--gexp-one); fill-opacity: .45; stroke: var(--gexp-one); stroke-width: 1; }' % P)
css.append('.%s-unit { fill: none; stroke: var(--paper); stroke-opacity: .55; stroke-width: .8; }' % P)
css.append('.%s-l { font: 700 13px var(--mono); fill: var(--paper); text-anchor: middle; stroke: var(--bg); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }' % P)
css.append('.%s-ring { fill: none; stroke: var(--gold); stroke-width: 3; }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-o { color: var(--gexp-lin); } .%s-say b.%s-g { color: var(--gold); }' % (P, P, P, P))
# THE STILL (reduced motion, and before the first frame) is the whole lesson: every cell filled and the
# answer written. Opacity 1 is the base; only captions that are not the last start hidden.
css.append('.%s-like, .%s-s:not(.%s-c7) { opacity: 0; }' % (P, P, P))
css.append('.%s-side { animation: %s-side %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('side', 0, 0.6, END, T))
for c, *_r, at in CELLS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, at, at + 0.5, END, T))
css.append('.%s-like { animation: %s-like %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-like { 0%%, %s { opacity: 0; } %s { opacity: 1; } %s { opacity: .25; } %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
           % (P, pc(8.6), pc(9.0), pc(9.4), pc(9.8), pc(10.4)))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-side, .%s-cell, .%s-like, .%s-s { animation: none; }' % (P, P, P, P))
css.append('}')

anim_row.write_anim('gexp', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
