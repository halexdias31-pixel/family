# Balancing an equation, atoms counted on both sides (GCSE Chemistry chapter 4, and a loading
# splash) — docs/history/420. THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row.
# Run: python3 tools/cb_balance.py
#
# WHAT IT SHOWS. Methane burning, CH₄ + O₂ → CO₂ + H₂O, drawn as atoms (carbon grey, hydrogen pale,
# oxygen red) with a tally under each side. Unbalanced, the H and O counts disagree and are red. A 2 in
# front of H₂O adds a second water molecule (H now agrees); a 2 in front of O₂ adds a second oxygen
# molecule (O agrees); every count gold: balanced, CH₄ + 2O₂ → CO₂ + 2H₂O, and no atom made or lost —
# conservation of mass. Only whole molecules are added, never a changed formula, which is the mistake
# the drawing is there to prevent. The still is the balanced equation.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 26.0
S = [0, 6, 12, 18]
A = cb_kit.Anim('balance', 'cbe', T, still=S[3] + 3)
A.rule('.an-balance { --cbe-c: #8a8a8a; --cbe-h: #f4f1e8; --cbe-o: #ff7b72; }')
A.rule('.cbe-C { fill: var(--cbe-c); } .cbe-H { fill: var(--cbe-h); } .cbe-O { fill: var(--cbe-o); }')
A.rule('.cbe-svg .cbe-eq { font-size: 13.5px; font-weight: 700; }')
A.rule('.cbe-svg .cbe-n { font-size: 13.5px; font-weight: 700; fill: var(--gold); }')
A.rule('.cbe-svg .cbe-t { font-size: 12px; } .cbe-svg .cbe-ok { fill: var(--gold); } .cbe-svg .cbe-no { fill: var(--coral); }')
A.rule('.cbe-ln { stroke: var(--paper); stroke-opacity: .3; }')
A.head('Balancing: count every atom')


def atom(el, x, y, r=None):
    r = r or (5 if el == 'H' else 8)
    return '<circle class="cbe-%s" cx="%s" cy="%s" r="%s"/>' % (el, r2(x), r2(y), r)


CH4 = lambda x, y: atom('C', x, y) + atom('H', x, y - 11) + atom('H', x, y + 11) + atom('H', x - 11, y) + atom('H', x + 11, y)
O2 = lambda x, y: atom('O', x - 6, y) + atom('O', x + 6, y)
CO2 = lambda x, y: atom('O', x - 13, y) + atom('C', x, y) + atom('O', x + 13, y)
H2O = lambda x, y: atom('O', x, y) + atom('H', x - 9, y + 7) + atom('H', x + 9, y + 7)
MY = 74
A.put('<g>' + CH4(30, MY) + O2(80, MY) + CO2(150, MY) + H2O(206, MY) + '</g>')
A.put('<g>' + arrow(104, MY, 126, MY, 'cbe-ar') + '<text class="cbe-eq" x="56" y="%d">+</text>' % (MY + 5) + '</g>')
A.put('<g>' + O2(80, MY + 26) + '</g>', A.pop(S[2] + .6))
A.put('<g>' + H2O(206, MY + 26) + '</g>', A.pop(S[1] + .6))
# THE EQUATION, a version per step: the 2s land in gold
EQ = 44
A.group(A.win(0, S[1] - .1, .3), '<text class="cbe-eq" x="120" y="%d">CH₄ + O₂ → CO₂ + H₂O</text>' % EQ)
A.group(A.win(S[1], S[2] - .1, .3), '<text class="cbe-eq" x="120" y="%d">CH₄ + O₂ → CO₂ + <tspan class="cbe-n">2</tspan>H₂O</text>' % EQ)
A.group(A.win(S[2], T - .7, .3), '<text class="cbe-eq" x="120" y="%d">CH₄ + <tspan class="cbe-n">2</tspan>O₂ → CO₂ + <tspan class="cbe-n">2</tspan>H₂O</text>' % EQ)
# THE TALLY: left and right of a line, a row per element
TY = 124
A.put('<g><path class="cbe-ln" d="M120 %dV%d"/><text class="cbe-t" x="60" y="%d">reactants</text><text class="cbe-t" x="180" y="%d">products</text></g>' % (TY - 8, TY + 44, TY, TY))
COUNTS = [  # (C, H, O) left, right
    ((1, 4, 2), (1, 2, 3)),
    ((1, 4, 2), (1, 4, 4)),
    ((1, 4, 4), (1, 4, 4)),
]
for k, (l, r) in enumerate(COUNTS):
    a, b = S[k], (S[k + 1] - .1 if k < 2 else T - .7)
    m = ''
    for j, el in enumerate('CHO'):
        ok = 'cbe-ok' if l[j] == r[j] else 'cbe-no'
        y = TY + 15 + 14 * j
        m += '<text class="cbe-t %s" x="60" y="%d">%s × %d</text><text class="cbe-t %s" x="180" y="%d">%s × %d</text>' % (ok, y, el, l[j], ok, y, el, r[j])
    A.group(A.win(a, b, .3), m)
A.caption(S[0], S[1] - .3, 'Count each atom on each side:', 'H and O do not match')
A.caption(S[1], S[2] - .3, 'Add a whole molecule: 2H₂O.', 'Now H matches: 4 and 4')
A.caption(S[2], S[3] - .3, 'Add another O₂: 2O₂.', 'Now O matches: 4 and 4')
A.caption(S[3], T - .7, 'Balanced: no atom made or lost,', 'so mass is conserved')

html, css = A.build('TB-GCSE-CHEM', 4, 'Balancing equations', 'Conservation of mass',
                    'CH₄ + 2O₂ → CO₂ + 2H₂O, every atom counted on both sides')
anim_row.write_anim('balance', html=html, css=css)
