# The A ∩ B splash: prints the <div id="splash-venn"> for index.html, then the block of rules and
# @keyframes for style.css, from one table of geometry and one timeline. Edit either and re-run,
# then paste both halves over the old ones. Run: python3 tools/venn.py
#
# WHAT IT DRAWS, in one loop of T seconds: the universal set ξ is always there; circle A slides in
# from the left and B from the right; then the three regions a GCSE paper asks about are shaded in
# turn — A ∩ B, A ∪ B, A′ — each with its notation underneath; then the circles slide back out and
# the loop starts again from the same empty box, so there is no seam.
#
# EVERYTHING MOVES BY transform OR opacity. The shading is a hatch, which is how a Venn region is
# shaded on paper, and the hatch drifts sideways by exactly one line spacing per turn of its own loop
# — so a shaded region is never a still picture and `npm run splash -- is-venn` sees every frame move.
import math

T = 10.0                        # seconds, one whole loop
W, H = 160, 108                 # the viewBox
BOX = (6, 6, 148, 96)           # ξ, the universal set: x, y, w, h
R = 30
A = (64, 56)                    # circle centres; 32 apart, so the overlap is a fat lens, not a sliver
B = (96, 56)
SLIDE = 16                      # how far each circle travels in from its own side
P = 6                           # hatch spacing, measured along x
HATCH_S = 1.6                   # seconds for the hatch to drift one spacing

# ---- the regions, each one closed path -----------------------------------------------------------
dx = (B[0] - A[0]) / 2
dy = math.sqrt(R * R - dx * dx)
mx, top, bot = A[0] + dx, A[1] - dy, A[1] + dy
f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
# the lens: down the right of A, back up the left of B (both clockwise, both the short way)
AND = 'M%s %s A%d %d 0 0 1 %s %s A%d %d 0 0 1 %s %sZ' % (f(mx), f(top), R, R, f(mx), f(bot),
                                                        R, R, f(mx), f(top))
# the union: the long way round A, then the long way round B (both anticlockwise)
OR = 'M%s %s A%d %d 0 1 0 %s %s A%d %d 0 1 0 %s %sZ' % (f(mx), f(top), R, R, f(mx), f(bot),
                                                       R, R, f(mx), f(top))
# A′: the box with A cut out of it — `evenodd` makes the circle a hole
bx, by, bw, bh = BOX
NOT_A = 'M%d %dh%dv%dh%dZM%d %dA%d %d 0 1 0 %d %dA%d %d 0 1 0 %d %dZ' % (
    bx, by, bw, bh, -bw, A[0] - R, A[1], R, R, A[0] + R, A[1], R, R, A[0] - R, A[1])

# ---- the hatch: 45° lines down-left, covering the box at every offset from 0 to P ----------------
x0, x1 = bx - P, bx + bw + bh + P
segs = []
x = x0
while x <= x1:
    segs.append('M%d %dl%d %d' % (x, by - 2, -(bh + 4), bh + 4))
    x += P
HATCH = ''.join(segs)

# ---- the timeline: (name, fade-in starts, fully in, fade-out starts, fully out), in seconds -------
IN, OUT = 0.0, 0.9              # the circles arrive over this
LEAVE = 9.0                     # and start leaving here, gone at T
# A REGION HANDS OVER TO THE NEXT IN ONE CROSSFADE, the same half second for both. Staggered, the
# two dipped together and the lens went blank between A ∩ B and A ∪ B — the one area both shade.
REGIONS = [  # class, path, rule, caption, fade in from, to, fade out from, to
    ('and', AND,   'nonzero', '<b class="vn-ta">A</b> &#8745; <b class="vn-tb">B</b>', 0.8, 1.3, 3.2, 3.7),
    ('or',  OR,    'nonzero', '<b class="vn-ta">A</b> &#8746; <b class="vn-tb">B</b>', 3.2, 3.7, 5.9, 6.4),
    ('not', NOT_A, 'evenodd', '<b class="vn-ta">A</b>&#8242;',                     5.9, 6.4, 8.6, 9.1),
]
assert REGIONS[-1][-1] <= T and LEAVE + 0.9 <= T + 0.01

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    """opacity 0 → 1 over [a, b], held, 1 → 0 over [c, d]."""
    return ('@keyframes vn-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (name, pct(a), pct(b), pct(c), pct(d)))

def come(name, sign):
    """slide in from `sign` and fade up; hold; slide back out the same way."""
    off = 'translateX(%dpx)' % (sign * SLIDE)
    return ('@keyframes vn-%s { 0%% { opacity: 0; transform: %s; } %s, %s { opacity: 1; transform: none; } '
            '100%% { opacity: 0; transform: %s; } }' % (name, off, pct(OUT), pct(LEAVE), off))

# ---- the markup ----------------------------------------------------------------------------------
svg = []
svg.append('<div id="splash-venn" aria-hidden="true">')
svg.append('    <svg class="vn-svg" viewBox="0 0 %d %d">' % (W, H))
svg.append('      <defs>')
for name, d, rule, *_ in REGIONS:
    svg.append('        <clipPath id="vn-c-%s"><path clip-rule="%s" d="%s"/></clipPath>' % (name, rule, d))
svg.append('        <path id="vn-hl" d="%s"/>' % HATCH)
svg.append('      </defs>')
# the shading goes UNDER the outlines, so a hatched region's edge is the circle's own stroke
for name, d, *_ in REGIONS:
    svg.append('      <g class="vn-r vn-r-%s" clip-path="url(#vn-c-%s)">'
               '<rect class="vn-tint" x="%d" y="%d" width="%d" height="%d"/>'
               '<use class="vn-h" href="#vn-hl"/></g>' % (name, name, *BOX))
# ξ IS DRAWN OVER THE SHADING, NOT UNDER IT, AND WITH SQUARE CORNERS. Under it, A′ — the one region
# that reaches the box — hatched straight across the border, so ξ's own edge read gold rather than
# as the edge of everything. And a rounded box over a clip that is a plain rectangle left the hatch
# poking out past all four corners; a GCSE paper draws ξ as a plain rectangle anyway.
svg.append('      <rect class="vn-box" x="%d" y="%d" width="%d" height="%d"/>' % BOX)
svg.append('      <text class="vn-xi" x="%d" y="%d">&#958;</text>' % (bx + 7, by + 12))
svg.append('      <g class="vn-g vn-ga"><circle class="vn-a" cx="%d" cy="%d" r="%d"/>'
           '<text class="vn-l vn-a-l" x="%d" y="%d">A</text></g>' % (A[0], A[1], R, A[0] - 15, A[1] + 5))
svg.append('      <g class="vn-g vn-gb"><circle class="vn-b" cx="%d" cy="%d" r="%d"/>'
           '<text class="vn-l vn-b-l" x="%d" y="%d">B</text></g>' % (B[0], B[1], R, B[0] + 15, B[1] + 5))
svg.append('    </svg>')
svg.append('    <div class="vn-say">')
for name, _, _, cap, *_ in REGIONS:
    svg.append('      <span class="vn-s vn-s-%s">%s</span>' % (name, cap))
svg.append('    </div>')
svg.append('    <div class="sp-sig">@family.</div>')
svg.append('  </div>')

# ---- the rules -----------------------------------------------------------------------------------
css = []
css.append('#splash-venn .vn-svg { width: min(66vw, 16rem); height: auto; }')
css.append('.vn-box { fill: none; stroke: rgb(244 241 232 / .35); stroke-width: 1.2; }')
# THE LETTERS SIT ON THE HATCH, so each carries a stroke of the page's own black painted under its
# fill: a hatch line running through a letter would turn "A" into a different glyph.
css.append('.vn-xi, .vn-l { stroke: var(--bg, #000); stroke-width: 3px; paint-order: stroke; '
           'stroke-linejoin: round; }')
css.append('.vn-xi { font: 400 11px var(--mono); fill: rgb(244 241 232 / .6); }')
# OUTLINES ONLY, as on a paper. Tinted circles put a third colour in the lens where they cross, so
# A′ — which leaves the lens unshaded — read as though the lens were shaded something else.
css.append('.vn-a, .vn-b { fill: none; stroke-width: 1.8; }')
css.append('.vn-a { stroke: #6fa8dc; } .vn-b { stroke: #e8862c; }')
css.append('.vn-l { font: 700 14px var(--mono); text-anchor: middle; }')
css.append('.vn-a-l { fill: #6fa8dc; } .vn-b-l { fill: #e8862c; }')
css.append('.vn-tint { fill: rgb(240 180 95 / .16); }')
css.append('.vn-h { fill: none; stroke: #f0b45f; stroke-width: 1.3; opacity: .8;')
css.append('        animation: vn-hatch %gs linear infinite; }' % HATCH_S)
css.append('@keyframes vn-hatch { to { transform: translateX(%dpx); } }' % P)
css.append('.vn-ga { animation: vn-ca %gs ease-in-out infinite; }' % T)
css.append('.vn-gb { animation: vn-cb %gs ease-in-out infinite; }' % T)
css.append(come('ca', -1))
css.append(come('cb', 1))
# THE NOTATION IS THE POINT, SO IT IS SET AT THE SIZE OF THE LETTERS ON THE CIRCLES. At 1rem it was
# 13.5px on a 320px phone under circle labels drawn at about 18 — the answer smaller than the question.
css.append('.vn-say { display: grid; margin-top: .7rem; font: 700 1.3rem var(--mono); color: var(--paper);')
css.append('          text-align: center; }')
css.append('.vn-s { grid-area: 1 / 1; }')
css.append('.vn-say b.vn-ta { color: #6fa8dc; } .vn-say b.vn-tb { color: #e8862c; }')
# base opacities ARE the reduced-motion still: the circles in, A ∩ B shaded and named
# said as one rule rather than "0, then 1 for the first" — two rules at one specificity would leave
# the still frame decided by which happens to be written later
css.append('.vn-r:not(.vn-r-and), .vn-s:not(.vn-s-and) { opacity: 0; }')
# THE SHADING CROSSFADES AND THE NOTATION DOES NOT. ∪ growing out of ∩ is the picture making its
# point, but two captions fading through each other in one cell is "A ∩ B" and "A ∪ B" printed on top
# of one another — so the old caption is gone by the middle of the crossfade and the new one starts
# there: a clean handover at the moment the picture is half one region and half the other.
CAP = 0.3
caps = []
for name, _, _, _, a, b, c, d in REGIONS:
    css.append('.vn-r-%s { animation: vn-%s %gs ease-in-out infinite; }' % (name, name, T))
    css.append(fade(name, a, b, c, d))
    i, o = (a + b) / 2, (c + d) / 2
    caps.append((i, o))
    css.append('.vn-s-%s { animation: vn-s-%s %gs ease-in-out infinite; }' % (name, name, T))
    css.append(fade('s-' + name, i, i + CAP, o - CAP, o))
assert all(caps[i][1] <= caps[i + 1][0] for i in range(len(caps) - 1)), caps
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .vn-g, .vn-r, .vn-s, .vn-h { animation: none; }')
css.append('}')

print('\n'.join(svg))
print()
print('\n'.join(css))
