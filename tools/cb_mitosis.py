# Mitosis, stage by stage (GCSE Biology chapter 2, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_mitosis.py
#
# WHAT IT SHOWS. A cell with two pairs of chromosomes (a long and a short pair, each pair one colour).
# Growth: the cell copies its DNA — each chromosome becomes two joined copies, the X a diagram draws.
# The copies line up across the middle; spindle fibres pull one copy of each to each end; two nuclei
# form; the cell splits into two cells, each with the same four chromosomes as the first. The point the
# chapter makes in its worked line: two genetically identical cells. The still is the copies pulled apart.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2 = cb_kit.r2

T = 30.0
S = [0, 4, 9, 13.5, 18, 22.5]
A = cb_kit.Anim('mitosis', 'bmi', T, still=S[3] + 3)
A.rule('.an-mitosis { --bmi-a: #ff7b72; --bmi-b: #6fa8dc; }')
A.rule('.bmi-mem { fill: var(--paper); fill-opacity: .06; stroke: var(--paper); stroke-width: 1.4; }')
A.rule('.bmi-nuc { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-dasharray: 3 2; }')
A.rule('.bmi-ca { stroke: var(--bmi-a); } .bmi-cb { stroke: var(--bmi-b); } .bmi-ch { stroke-width: 4; stroke-linecap: round; fill: none; }')
A.rule('.bmi-sp { stroke: var(--gold); stroke-opacity: .7; stroke-width: .8; fill: none; }')
A.rule('.bmi-svg .bmi-st { font-size: 13px; font-weight: 700; fill: var(--gold); }')
A.head('Mitosis')
CX, CY = 120, 92
# the membrane: one cell, then (cytokinesis) a waist and two cells
A.put('<ellipse class="bmi-mem" cx="%d" cy="%d" rx="70" ry="52"/>' % (CX, CY), [(0, 1, 0, 0, .86), (S[1] - .5, 1, 0, 0, .86), (S[1] + 2, 1, 0, 0, 1), (S[5], 1, 0, 0, 1), (S[5] + .8, 0, 0, 0, 1), (T - .6, 0, 0, 0, .86)])
for dx in (-46, 46):
    A.put('<ellipse class="bmi-mem" cx="%d" cy="%d" rx="44" ry="46"/>' % (CX + dx, CY), A.path([(S[5] + .2, -dx * .3, 0, .9), (S[5] + 1.6, 0, 0), (T - .7, 0, 0)], show=(S[5] + .2, T - .7)))
A.put('<ellipse class="bmi-nuc" cx="%d" cy="%d" rx="42" ry="34"/>' % (CX, CY), A.win(0, S[2] - .3))
for dx in (-46, 46):
    A.put('<ellipse class="bmi-nuc" cx="%d" cy="%d" rx="22" ry="26"/>' % (CX + dx, CY), A.win(S[4] + 1, T - .7))
A.put('<path class="bmi-sp" d="M54 92Q120 52 186 92Q120 132 54 92M54 92H186"/>', A.win(S[2] + .6, S[4] + .6))
# chromosomes: (colour, length, home x, home y); each has two chromatids
CH = [('bmi-ca', 22, 96, 80), ('bmi-ca', 22, 140, 100), ('bmi-cb', 12, 108, 104), ('bmi-cb', 12, 132, 76)]
for k, (cls, L, hx, hy) in enumerate(CH):
    mx = CX                                    # metaphase: in a column at the middle
    my = [50, 84, 110, 130][k]
    for side in (-1, 1):
        # a chromatid is a vertical bar; the copy appears beside the original at S1
        bar = '<path class="bmi-ch %s" d="M%s %sv%d"/>' % (cls, r2(hx), r2(hy - L / 2), L)
        endx = CX + side * 46 - hx + (k % 2) * 8 - 4
        endy = (CY - 22 + 15 * k) - hy
        stops = [(0, 0, 0), (S[1] + .4, side * 2.5, 0), (S[1] + 2, side * 2.5, 0), (S[2] + .4, side * 2.5, 0), (S[2] + 3, mx - hx + side * 2.5, my - hy),
                 (S[3], mx - hx + side * 2.5, my - hy), (S[3] + 3.2, mx - hx + side * 34, my - hy), (S[4], mx - hx + side * 40, my - hy), (S[4] + 1.5, endx, endy), (T - .7, endx, endy)]
        if side == -1:
            A.put(bar, [(t, 1, x, y, 1) for t, x, y in stops[:-1]] + [(T - .7, 1, endx, endy, 1), (T - .2, 0, endx, endy, 1), (T - .05, 0, 0, 0, 1)])
        else:
            A.put(bar, A.path(stops, show=(S[1] + .2, T - .4)))
for k, (name, a, b) in enumerate([('a cell', 0, S[1]), ('DNA copied', S[1], S[2]), ('line up', S[2], S[3]), ('pulled apart', S[3], S[4]), ('two nuclei', S[4], S[5]), ('two cells', S[5], T)]):
    A.group(A.win(a + .2, b - .3 if b < T else T - .7, .3), '<text class="bmi-st" x="120" y="164">%d · %s</text>' % (k + 1, name))
A.caption(S[0], S[1] - .3, 'Two pairs of chromosomes', 'in the nucleus')
A.caption(S[1], S[2] - .3, 'The cell grows and copies', 'its DNA: two joined copies')
A.caption(S[2], S[3] - .3, 'The nucleus breaks down; the', 'chromosomes line up')
A.caption(S[3], S[4] - .3, 'Fibres pull one copy of each', 'chromosome to each end')
A.caption(S[4], S[5] - .3, 'A nucleus forms', 'round each set')
A.caption(S[5], T - .7, 'Two cells, genetically', 'identical to the first')

html, css = A.build('TB-GCSE-BIO', 2, 'Mitosis', 'Mitosis|Chromosome|Cell cycle',
                    'chromosomes copied, lined up, pulled apart: two identical cells')
anim_row.write_anim('mitosis', html=html, css=css)
