# A Punnett square, Bb × Bb (GCSE Biology chapter 10, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_punnett.py
#
# WHAT IT SHOWS. Two parents, each Bb (B dominant, brown; b recessive, blue). Their alleles separate into
# gametes — the letters fly to the top and side of a grid — and each box takes one letter from its
# column and one from its row: BB, Bb, Bb, bb. Each box is then coloured by what shows: brown wherever
# there is a B. Three brown to one blue, the 3 : 1 of the chapter's own worked line, and so a 1 in 4
# (25%) chance of a bb child. The still is the coloured grid and the ratio.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2 = cb_kit.r2

T = 26.0
S = [0, 4, 8, 14, 19]
A = cb_kit.Anim('punnett', 'bpu', T, still=T - 2)
A.rule('.an-punnett { --bpu-B: #c8874a; --bpu-b: #6fa8dc; }')
A.rule('.bpu-grid { fill: none; stroke: var(--paper); stroke-opacity: .6; } .bpu-BB { fill: var(--bpu-B); fill-opacity: .55; } .bpu-bb { fill: var(--bpu-b); fill-opacity: .55; }')
A.rule('.bpu-svg .bpu-L { font-size: 18px; font-weight: 700; } .bpu-svg .bpu-g { font-size: 16px; font-weight: 700; fill: var(--gold); }')
A.rule('.bpu-svg .bpu-g2 { font-size: 12px; font-weight: 700; fill: var(--gold); }')
A.rule('.bpu-svg .bpu-lb { font-size: 11px; } .bpu-svg .bpu-big { font-size: 15px; font-weight: 700; fill: var(--gold); }')
A.head('Inheritance: Bb × Bb')
GX, GY, C = 96, 60, 44           # grid top-left and cell size
A.put('<path class="bpu-grid" d="M%d %dh%dv%dh-%dzM%d %dv%dM%d %dh%d"/>' % (GX, GY, 2 * C, 2 * C, 2 * C, GX + C, GY, 2 * C, GX, GY + C, 2 * C), A.win(S[1] + .4, T - .7))
# parents
A.group(A.win(0, S[1] + .4), '<text class="bpu-lb" x="60" y="44">parent 1</text><text class="bpu-L" x="60" y="66">Bb</text>',
        '<text class="bpu-lb" x="180" y="44">parent 2</text><text class="bpu-L" x="180" y="66">Bb</text><text class="bpu-L" x="120" y="66">×</text>')
# gametes: letters fly from the parents to the grid edges
GAM = [('B', 52, 66, GX + C / 2, GY - 10), ('b', 66, 66, GX + 1.5 * C, GY - 10), ('B', 172, 66, GX - 14, GY + C / 2 + 6), ('b', 186, 66, GX - 14, GY + 1.5 * C + 6)]
for L, x, y, tx, ty in GAM:
    A.put('<text class="bpu-g" x="%s" y="%s">%s</text>' % (r2(x), r2(y), L), A.path([(S[1], 0, 0), (S[1] + 2.4, tx - x, ty - y), (T - .7, tx - x, ty - y)], show=(S[1] - .2, T - .7)))
# boxes fill, one at a time
BOX = [('BB', 0, 0), ('Bb', 1, 0), ('Bb', 0, 1), ('bb', 1, 1)]
for k, (g, c, r) in enumerate(BOX):
    x, y = GX + C * c + C / 2, GY + C * r + C / 2
    t = S[2] + 1.3 * k
    A.put('<rect class="%s" x="%s" y="%s" width="%d" height="%d"/>' % ('bpu-bb' if g == 'bb' else 'bpu-BB', r2(x - C / 2 + 1), r2(y - C / 2 + 1), C - 2, C - 2), A.win(S[3] + .3 * k, T - .7))
    A.put('<text class="bpu-L" x="%s" y="%s">%s</text>' % (r2(x), r2(y + 6), g), A.pop(t, T - .7))
A.group(A.win(S[3] + 1.5, T - .7), '<text class="bpu-lb" x="38" y="96">brown:</text><text class="bpu-big" x="38" y="114">3</text>',
        '<text class="bpu-lb" x="212" y="96">blue:</text><text class="bpu-big" x="212" y="114">1</text>')
A.group(A.win(S[4], T - .7), '<text class="bpu-g2" x="120" y="172">3 : 1 — a 1 in 4 chance of bb</text>')
A.caption(S[0], S[1] - .3, 'Each parent has two alleles:', 'B (brown, dominant) and b')
A.caption(S[1], S[2] - .3, 'Each gamete carries one', 'allele of the two')
A.caption(S[2], S[3] - .3, 'Each box takes one allele from', 'each parent: BB, Bb, Bb, bb')
A.caption(S[3], S[4] - .3, 'One B is enough to show brown;', 'only bb shows blue')
A.caption(S[4], T - .7, 'Offspring ratio 3 : 1;', 'the chance of bb is 25%', y=192)

html, css = A.build('TB-GCSE-BIO', 10, 'Punnett square', 'Allele|Genotype|Homozygous|Bb × Bb gives BB',
                    'Bb × Bb gives BB, Bb, Bb, bb: three to one')
anim_row.write_anim('punnett', html=html, css=css)
