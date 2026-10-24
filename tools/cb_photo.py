# Photosynthesis and respiration, one cycle (GCSE Biology chapter 7, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_photo.py
#
# WHAT IT SHOWS. A leaf (chloroplast) on the left and a mitochondrion on the right, joined by two arrows.
# Light falls on the leaf; carbon dioxide and water go in, glucose and oxygen come out and travel along
# the top arrow into the mitochondrion; there aerobic respiration releases energy (a burst), and carbon
# dioxide and water travel back along the bottom arrow to the leaf. The products of each are the
# reactants of the other. Last the two word equations, written out. The still is the whole cycle.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 28.0
S = [0, 6.5, 13, 19.5]
A = cb_kit.Anim('photo', 'bph', T, still=T - 2)
A.rule('.an-photo { --bph-leaf: #3ddc84; --bph-mi: #ff9e64; }')
A.rule('.bph-leaf { fill: var(--bph-leaf); fill-opacity: .35; stroke: var(--bph-leaf); stroke-width: 1.4; } .bph-mi { fill: var(--bph-mi); fill-opacity: .3; stroke: var(--bph-mi); stroke-width: 1.4; }')
A.rule('.bph-cr { fill: none; stroke: var(--bph-mi); stroke-width: 1.2; } .bph-sun { stroke: var(--gold); stroke-width: 1.6; }')
A.rule('.bph-tok { fill: var(--bg); stroke: var(--paper); stroke-opacity: .7; } .bph-g { stroke: var(--gold); }')
A.rule('.bph-svg .bph-t { font-size: 10.5px; font-weight: 700; } .bph-svg .bph-lb { font-size: 11px; } .bph-svg .bph-eq { font-size: 10.5px; } .bph-svg .bph-gd { fill: var(--gold); }')
A.rule('.bph-burst { fill: var(--gold); }')
A.head('Photosynthesis ⇄ respiration')
LX, MX, CY = 46, 194, 96
A.put('<path class="bph-leaf" d="M%d %dC%d %d %d %d %d %dC%d %d %d %d %d %dz"/>' % (LX - 30, CY + 26, LX - 30, CY - 20, LX + 10, CY - 40, LX + 34, CY - 40, LX + 34, CY - 4, LX + 10, CY + 30, LX - 30, CY + 26))
A.put('<g><ellipse class="bph-mi" cx="%d" cy="%d" rx="32" ry="20"/><path class="bph-cr" d="M%d %dq6 -16 12 0t12 0t12 0t12 0"/></g>' % (MX, CY, MX - 24, CY + 2))
A.put('<text class="bph-lb" x="%d" y="%d">leaf</text><text class="bph-lb" x="%d" y="%d">mitochondrion</text>' % (LX, CY + 44, MX, CY + 32))
A.put('<path class="bph-sun" d="M22 30l10 10M40 24l4 13M58 26l-2 13"/>', A.win(S[0] + .3, S[1] + 2))
A.put('<g>' + arrow(86, 68, 156, 68, 'bph-ar') + arrow(156, 142, 86, 142, 'bph-ar') + '</g>')


def tok(x, y, txt, gold=False):
    w = 8 + 7 * len(txt)
    return '<g><rect class="bph-tok%s" x="%s" y="%d" width="%d" height="16" rx="8"/><text class="bph-t%s" x="%s" y="%d">%s</text></g>' % (
        ' bph-g' if gold else '', r2(x - w / 2), y - 11, w, ' bph-gd' if gold else '', r2(x), y + 1, txt)


# carbon dioxide and water into the leaf (step 1), from the bottom-left
for k, (txt, y) in enumerate([('CO₂', 158), ('H₂O', 176)]):
    A.put(tok(30 + 40 * k, y, txt), A.path([(S[0] + .4, 0, 0), (S[0] + 3, 18 - 40 * k + 0, CY - y), (S[0] + 3.4, 18 - 40 * k, CY - y)], show=(S[0] + .2, S[0] + 3.4)))
# glucose and oxygen along the top to the mitochondrion (step 2)
for k, txt in enumerate(['glucose', 'O₂']):
    A.put(tok(LX + 20, 52 + 20 * k * 0, txt, gold=(k == 0)), A.path([(S[1] - 2, 0, 20 * k), (S[1] + .6 + .5 * k, 0, 20 * k - 6), (S[2] - 2.2 + .4 * k, MX - LX - 20, 20 * k + 30)], show=(S[1] - 2.2, S[2] - 1.8)))
A.put('<circle class="bph-burst" cx="%d" cy="%d" r="10"/>' % (MX, CY), A.pop(S[2] - 1.6, S[2] + 1, s0=.2))
A.group(A.win(S[2] - 1.4, S[3] - .3), '<text class="bph-lb bph-gd" x="%d" y="62">energy</text>' % MX)
# carbon dioxide and water back along the bottom (step 3)
for k, txt in enumerate(['CO₂', 'H₂O']):
    A.put(tok(MX - 10, 142, txt), A.path([(S[2] + .2 + .5 * k, 0, 18 * k), (S[3] - 1 + .4 * k, LX - MX + 30, 18 * k - 48)], show=(S[2], S[3] - .5)))
A.caption(S[0], S[1] - .3, 'Light: carbon dioxide + water', 'make glucose + oxygen')
A.caption(S[1], S[2] - .3, 'Glucose and oxygen go to the', 'mitochondria')
A.caption(S[2], S[3] - .3, 'Respiration releases energy and', 'gives back CO₂ + water')
A.group(A.win(S[3], T - .7), '<text class="bph-eq" x="120" y="164">CO₂ + H₂O → glucose + O₂</text><text class="bph-eq bph-gd" x="120" y="178">glucose + O₂ → CO₂ + H₂O</text>')
A.caption(S[3], T - .7, 'Each one feeds the other', y=200)

html, css = A.build('TB-GCSE-BIO', 7, 'Photosynthesis and respiration', 'Photosynthesis|Aerobic respiration',
                    'CO₂ + water → glucose + O₂ in the leaf, and back again in the mitochondria')
anim_row.write_anim('photo', html=html, css=css)
