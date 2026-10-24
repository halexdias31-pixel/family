# Factorising a quadratic with tiles (GCSE Maths chapter 5): writes its row of data/textbooks.json
# through tools/anim_row.py. Edit the numbers or the timeline and re-run: python3 tools/g_factor.py
#
# WHAT IT DRAWS, in one loop of T seconds: x² + 5x + 6 laid out as tiles — one x² square, five x
# strips, six unit squares — which slide together into one rectangle. Its sides can then be read off:
# x + 2 by x + 3. The six units fit the corner as 2 × 3, which is why the pair is "multiply to 6, add
# to 5". Each tile is drawn where it ends and starts offset by translate, so the still is the answer.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gfac'
T = 13.0
W, H = 200, 156
X, U = 48, 12                       # the length x and one unit, in viewBox units
R0 = (58, 76)                       # the finished rectangle's top-left corner

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

rx, ry = R0
# (class, kind, start x, y, end x, y, w, h, moves at): kind sq = x², lin = x strip, one = unit
TILES = [('t0', 'sq', 8, 8, rx, ry, X, X, 1.8)]
for i in range(3):                  # the three strips that stand up the right: width x + 3
    TILES.append(('v%d' % i, 'lin', 62 + 14 * i, 8, rx + X + U * i, ry, U, X, 3.0 + 0.3 * i))
for j in range(2):                  # the two that lie along the bottom: height x + 2
    TILES.append(('h%d' % j, 'lin', 106, 8 + 14 * j, rx, ry + X + U * j, X, U, 4.0 + 0.3 * j))
k = 0
for j in range(2):
    for i in range(3):
        sx, sy = 160 + 14 * (k % 2), 8 + 14 * (k // 2)
        TILES.append(('u%d' % k, 'one', sx, sy, rx + X + U * i, ry + X + U * j, U, U, 5.2 + 0.15 * k))
        k += 1
LAB = 7.4                           # the sides are named
END = T - 0.8
CAPS = [
    ('c0', 0.2, 1.8, 'x² + 5x + 6'),
    ('c1', 1.8, 3.0, 'make one rectangle'),
    ('c2', 3.0, 5.2, 'x strips: 3 up, 2 along'),
    ('c3', 5.2, 7.4, 'the six 1s fill the corner<i class="gfac-ln">2 × 3 = 6 and 2 + 3 = 5</i>'),
    ('c4', 7.4, T, 'x² + 5x + 6 = <b class="gfac-g">(x + 2)(x + 3)</b>'),
]

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for c, kind, sx, sy, ex, ey, w, h, at in TILES:
    svg.append('      <rect class="%s-tile %s-%s %s-%s" x="%d" y="%d" width="%d" height="%d" rx="1.5"/>' % (P, P, kind, P, c, ex, ey, w, h))
svg.append('      <text class="%s-l" x="%d" y="%d">x²</text>' % (P, rx + X / 2, ry + X / 2 + 4))
svg.append('      <g class="%s-side">' % P)
svg.append('        <text class="%s-t" x="%d" y="%d">x</text>' % (P, rx + X / 2, ry - 7))
svg.append('        <text class="%s-t %s-n" x="%d" y="%d">+3</text>' % (P, P, rx + X + 3 * U / 2, ry - 7))
svg.append('        <text class="%s-t" x="%d" y="%d">x</text>' % (P, rx - 10, ry + X / 2 + 4))
svg.append('        <text class="%s-t %s-n" x="%d" y="%d">+2</text>' % (P, P, rx - 13, ry + X + U + 4))
svg.append('        <rect class="%s-box" x="%d" y="%d" width="%d" height="%d"/>' % (P, rx, ry, X + 3 * U, X + 2 * U))
svg.append('      </g>')
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --gfac-sq: #6fd8c4; --gfac-lin: #e8862c; --gfac-one: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(76vw, 18rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-tile { stroke-width: 1; fill-opacity: .45; }' % P)
css.append('.%s-sq { fill: var(--gfac-sq); stroke: var(--gfac-sq); }' % P)
css.append('.%s-lin { fill: var(--gfac-lin); stroke: var(--gfac-lin); }' % P)
css.append('.%s-one { fill: var(--gfac-one); stroke: var(--gfac-one); }' % P)
css.append('.%s-l { font: 700 13px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-t { font: 700 12px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-n { fill: var(--gold); }' % P)
css.append('.%s-box { fill: none; stroke: var(--gold); stroke-width: 1.6; }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; color: var(--gold); }' % P)
css.append('.%s-s:not(.%s-c4) { opacity: 0; }' % (P, P))
# EACH TILE SITS WHERE IT ENDS; the keyframes hold it at its starting place until it moves, so with
# no animation (reduced motion) the tiles already make the rectangle.
for c, kind, sx, sy, ex, ey, w, h, at in TILES:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    off = 'translate(%dpx, %dpx)' % (sx - ex, sy - ey)
    css.append('@keyframes %s-%s { 0%% { opacity: 0; transform: %s; } %s, %s { opacity: 1; transform: %s; } %s, %s { opacity: 1; transform: none; } 100%% { opacity: 0; transform: none; } }'
               % (P, c, off, pc(0.6), pc(at), off, pc(at + 0.9), pc(END)))
css.append('.%s-l { animation: %s-l %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-l { 0%% { opacity: 0; transform: translate(%dpx, %dpx); } %s, %s { opacity: 1; transform: translate(%dpx, %dpx); } %s, %s { opacity: 1; transform: none; } 100%% { opacity: 0; transform: none; } }'
           % (P, 8 - rx, 8 - ry, pc(0.6), pc(1.8), 8 - rx, 8 - ry, pc(2.7), pc(END)))
css.append('.%s-side { animation: %s-side %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('side', LAB, LAB + 0.6, END, T))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-tile, .%s-l, .%s-side, .%s-s { animation: none; }' % (P, P, P, P))
css.append('}')

anim_row.write_anim('gfac', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
