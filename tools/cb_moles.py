# Relative formula mass and moles (GCSE Chemistry chapter 4, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_moles.py
#
# WHAT IT SHOWS. Mr of calcium carbonate built atom by atom: Ca 40, then C 12, then three O at 16, a bar
# growing to scale and a running total, 40 → 52 → 100. Then what Mr is for: 100 g of it is one mole.
# Then the chapter's worked line, CaCO₃ → CaO + CO₂, the bar splitting into 56 and 44 — mass conserved.
# Then [H] moles = mass ÷ Mr, 25 g ÷ 100 = 0.25 mol, the quarter of the bar lit. The still is Mr = 100.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2 = cb_kit.r2

T = 30.0
S = [0, 4, 8, 12, 17, 23]
A = cb_kit.Anim('moles', 'cmo', T, still=S[2] + 3)
A.rule('.an-moles { --cmo-ca: #6fa8dc; --cmo-c: #8a8a8a; --cmo-o: #ff7b72; }')
A.rule('.cmo-ca { fill: var(--cmo-ca); } .cmo-c { fill: var(--cmo-c); } .cmo-o { fill: var(--cmo-o); }')
A.rule('.cmo-svg .cmo-in { font-size: 11px; font-weight: 700; fill: var(--bg); }')
A.rule('.cmo-svg .cmo-big { font-size: 20px; font-weight: 700; fill: var(--gold); }')
A.rule('.cmo-svg .cmo-mid { font-size: 13px; font-weight: 700; }')
A.rule('.cmo-svg .cmo-gd { font-size: 14px; font-weight: 700; fill: var(--gold); }')
A.rule('.cmo-frame { fill: none; stroke: var(--paper); stroke-opacity: .4; }')
A.rule('.cmo-q { fill: var(--gold); fill-opacity: .9; }')
A.head('Relative formula mass, Mr')
# the formula as atoms
A.put('<g><circle class="cmo-ca" cx="58" cy="50" r="15"/><text class="cmo-in" x="58" y="54">Ca</text></g>', A.pop(S[0] + .3, S[3] - .2))
A.put('<g><circle class="cmo-c" cx="100" cy="50" r="11"/><text class="cmo-in" x="100" y="54">C</text></g>', A.pop(S[1] + .3, S[3] - .2))
for k in range(3):
    A.put('<g><circle class="cmo-o" cx="%d" cy="50" r="10"/><text class="cmo-in" x="%d" y="54">O</text></g>' % (136 + 26 * k, 136 + 26 * k), A.pop(S[2] + .3 + .35 * k, S[3] - .2))
# the bar: 0..100 across 200 units
BX, BY, BW = 20, 92, 2.0
A.put('<rect class="cmo-frame" x="%d" y="%d" width="%d" height="20"/>' % (BX, BY, 100 * BW))
seg = [(0, 40, 'cmo-ca', 'Ca 40', S[0]), (40, 12, 'cmo-c', '12', S[1]), (52, 48, 'cmo-o', 'O 3 × 16', S[2])]
for x0, w, cls, lab, t in seg:
    A.group(A.pop(t + .6, S[4] - .2, s0=.8), '<rect class="%s" x="%s" y="%d" width="%s" height="20"/>' % (cls, r2(BX + x0 * BW), BY, r2(w * BW)),
            '<text class="cmo-in" x="%s" y="%d">%s</text>' % (r2(BX + (x0 + w / 2) * BW), BY + 14, lab))
for k, (txt, t, b) in enumerate([('40', S[0], S[1]), ('40 + 12 = 52', S[1], S[2]), ('Mr = 40 + 12 + 48 = 100', S[2], S[4])]):
    A.group(A.win(t + .6, b - .2, .3), '<text class="%s" x="120" y="138">%s</text>' % ('cmo-gd' if k == 2 else 'cmo-mid', txt))
A.caption(S[0], S[1] - .3, 'Add up the relative atomic', 'masses: calcium is 40')
A.caption(S[1], S[2] - .3, 'Carbon adds 12')
A.caption(S[2], S[3] - .3, 'Three oxygens add 3 × 16 = 48:', 'Mr of CaCO₃ is 100')
A.group(A.win(S[3], S[4] - .2), '<text class="cmo-mid" x="120" y="60">100 g of CaCO₃ = 1 mole</text>')
A.caption(S[3], S[4] - .3, 'Its Mr in grams is one mole:', '100 g of CaCO₃')
# the decomposition: the bar splits 56 | 44
A.group(A.win(S[4], S[5] - .2), '<text class="cmo-mid" x="120" y="60">CaCO₃ → CaO + CO₂</text>',
        '<rect class="cmo-ca" x="%d" y="%d" width="%s" height="20"/><text class="cmo-in" x="%s" y="%d">CaO 56</text>' % (BX, BY, r2(56 * BW), r2(BX + 28 * BW), BY + 14),
        '<text class="cmo-big" x="120" y="138">100 = 56 + 44</text>')
A.put('<g><rect class="cmo-o" x="%s" y="%d" width="%s" height="20"/><text class="cmo-in" x="%s" y="%d">CO₂ 44</text></g>' % (r2(BX + 56 * BW), BY, r2(44 * BW), r2(BX + 78 * BW), BY + 14),
      A.path([(S[4] + .4, 0, 0), (S[4] + 2, 4, -16), (S[5] - .3, 4, -16)], show=(S[4], S[5] - .2)))
A.caption(S[4], S[5] - .3, 'Heated, it splits: 56 + 44 —', 'the mass is conserved')
# [H] moles = mass ÷ Mr
A.group(A.win(S[5], T - .7), '<text class="cmo-mid" x="120" y="60">[H] moles = mass ÷ Mr</text>',
        '<rect class="cmo-q" x="%d" y="%d" width="%s" height="20"/>' % (BX, BY, r2(25 * BW)),
        '<text class="cmo-gd" x="120" y="138">25 g ÷ 100 = 0.25 mol</text>')
A.caption(S[5], T - .7, '25 g is a quarter of 100 g,', 'so a quarter of a mole')

html, css = A.build('TB-GCSE-CHEM', 4, 'Moles and Mr', 'Relative formula mass|Mole|Conservation of mass',
                    'Mr of CaCO₃ built atom by atom: 40 + 12 + 48 = 100; 25 g is 0.25 mol')
anim_row.write_anim('moles', html=html, css=css)
