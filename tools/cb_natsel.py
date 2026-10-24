# Natural selection over generations (GCSE Biology chapter 11, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_natsel.py
#
# WHAT IT SHOWS. Peppered moths on soot-dark bark, ten to a generation. A mutation makes one dark. Birds
# find and eat the pale moths that show up against the bark (each is marked, then gone); the survivors
# breed, and the next generation has more dark moths, which pass on the allele: 1 dark in 10, then 4,
# then 8. A bar under each generation keeps the count. Variation, selection, inheritance, over time — the
# chapter's natural selection. The still is the third generation and the bars.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2 = cb_kit.r2

T = 30.0
S = [0, 4, 9, 13.5, 18, 23]
A = cb_kit.Anim('natsel', 'bns', T, still=T - 2)
A.rule('.an-natsel { --bns-bark: #3a3530; --bns-pale: #e9e3d0; --bns-dark: #1d1a17; }')
A.rule('.bns-bark { fill: var(--bns-bark); } .bns-pale { fill: var(--bns-pale); } .bns-dark { fill: var(--bns-dark); stroke: var(--paper); stroke-opacity: .35; stroke-width: .6; }')
A.rule('.bns-eat { fill: none; stroke: var(--coral); stroke-width: 2; } .bns-bar { fill: var(--gold); } .bns-fr { fill: none; stroke: var(--paper); stroke-opacity: .4; }')
A.rule('.bns-svg .bns-lb { font-size: 11px; } .bns-svg .bns-gen { font-size: 13px; font-weight: 700; fill: var(--gold); }')
A.head('Natural selection')
A.put('<rect class="bns-bark" x="14" y="26" width="212" height="92" rx="6"/>')
moth = lambda x, y, cls: '<path class="%s" d="M%s %sc-8 -8 -16 -4 -14 4c2 6 10 6 14 0c4 6 12 6 14 0c2 -8 -6 -12 -14 -4z"/>' % (cls, r2(x), r2(y))
POS = [(40 + 40 * (k % 5), 52 + 40 * (k // 5)) for k in range(10)]
GENS = [  # (dark positions, pale positions eaten, start, end)
    ({3}, {0, 4, 6, 8}, S[0], S[3]),
    ({1, 3, 5, 8}, {0, 6, 9}, S[3], S[4] + 2.5),
    ({0, 1, 2, 3, 5, 6, 8, 9}, set(), S[4] + 2.5, T),
]
for g, (dark, eaten, a, b) in enumerate(GENS):
    b2 = b - .3 if b < T else T - .7
    for k, (x, y) in enumerate(POS):
        cls = 'bns-dark' if k in dark else 'bns-pale'
        if k in eaten:
            te = (S[1] + .5 + .7 * len([e for e in eaten if e < k])) if g == 0 else (S[3] + 2 + .6 * len([e for e in eaten if e < k]))
            A.put(moth(x, y, cls), A.win(a + .1, te + .6, .4))
            A.put('<circle class="bns-eat" cx="%s" cy="%s" r="13"/>' % (r2(x), r2(y)), A.win(te - .2, te + .6, .2))
        else:
            A.put(moth(x, y, cls), A.win(a + .1, b2, .5))
    A.group(A.win(a + .1, b2), '<text class="bns-gen" x="120" y="140">generation %d</text>' % (g + 1))
# the bars: dark moths out of ten, one per generation, kept
A.put('<g><text class="bns-lb" x="56" y="158">dark moths:</text></g>')
for g, n in enumerate([1, 4, 8]):
    a = GENS[g][2] + .6
    A.group(A.pop(a, T - .7, s0=.6), '<rect class="bns-fr" x="%d" y="150" width="40" height="10"/><rect class="bns-bar" x="%d" y="150" width="%d" height="10"/><text class="bns-lb" x="%d" y="174">%d/10</text>' % (110 + 44 * g, 110 + 44 * g, 4 * n, 130 + 44 * g, n))
A.caption(S[0], S[1] - .3, 'Variation: a mutation makes', 'one moth dark')
A.caption(S[1], S[3] - .3, 'On dark bark, birds see and', 'eat more of the pale moths')
A.caption(S[3], S[4] - .3, 'Survivors breed and pass on', 'their alleles: more dark moths')
A.caption(S[4], S[5] - .3, 'Again the pale are eaten', 'more often')
A.caption(S[5], T - .7, 'Over generations dark becomes', 'common: natural selection')

html, css = A.build('TB-GCSE-BIO', 11, 'Natural selection', 'Natural selection|Mutation|Variation',
                    'pale moths eaten on dark bark: dark moths 1, 4, 8 in ten over three generations')
anim_row.write_anim('natsel', html=html, css=css)
