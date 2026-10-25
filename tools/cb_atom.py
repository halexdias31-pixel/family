# Electron shells filling (GCSE Chemistry chapter 1, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_atom.py
#
# WHAT IT SHOWS. Eight atoms in turn, H, He, Li, C, Ne, Na, Ar, Ca: the nucleus says its protons and
# neutrons, and one electron joins for each proton, so the shells fill 2, then 8, then 8 — the rule a
# GCSE answer writes as 2,8,1. In a shell of eight the first four sit one at each compass point and the
# next four pair up with them, as a hand-drawn diagram is drawn. The newest electrons are gold; the
# panel on the right gives the symbol, the atomic number and the arrangement. The still is sodium,
# 2,8,1, the chapter's own worked line.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
import math

STEP = 3.6
ATOMS = [('H', 'Hydrogen', 1, 0), ('He', 'Helium', 2, 2), ('Li', 'Lithium', 3, 4), ('C', 'Carbon', 6, 6),
         ('Ne', 'Neon', 10, 10), ('Na', 'Sodium', 11, 12), ('Ar', 'Argon', 18, 22), ('Ca', 'Calcium', 20, 20)]
SAY = [('One proton, so one electron', 'in the first shell'),
       ('The first shell is full', 'with two electrons'),
       ('A new shell starts:', '2,1 — one outer electron'),
       ('Four in the second shell:', '2,4'),
       ('The second shell is full', 'with eight: 2,8 — a noble gas'),
       ('2,8,1 — one outer electron,', 'so sodium is in Group 1'),
       ('2,8,8 — a full outer shell,', 'so argon is unreactive'),
       ('2,8,8,2 — two outer electrons:', 'Group 2, Period 4')]
T = STEP * len(ATOMS) + 1.2
A = cb_kit.Anim('atom', 'cat', T, still=STEP * 5 + 2.5)
CX, CY = 78, 92
RAD = [20, 36, 52, 68]
CAP = [2, 8, 8, 2]


def shells(n):
    out, left = [], n
    for c in CAP:
        out.append(min(c, left)); left -= out[-1]
    return [x for x in out if x]


def spot(shell, k):
    if shell in (0, 3): ang = [180, 0][k]
    else: ang = [-90, 0, 90, 180][k % 4] + (14 if k >= 4 else 0)
    r = RAD[shell]
    a = math.radians(ang)
    return CX + r * math.cos(a), CY + r * math.sin(a)


start = lambda i: 0.4 + STEP * i
first = {}
for i, (_, _, z, _) in enumerate(ATOMS):
    n = 0
    for s, c in enumerate(shells(z)):
        for k in range(c):
            first.setdefault((s, k), i)
END = T - 0.9

A.rule('.cat-ring { fill: none; stroke: var(--paper); stroke-opacity: .35; stroke-width: 1; }')
A.rule('.cat-nuc { fill: var(--coral); }')
A.rule('.cat-svg .cat-pn { font-size: 11px; font-weight: 700; fill: var(--bg); }')
A.rule('.cat-e { fill: var(--cat-e); }')
A.rule('.cat-new { fill: var(--gold); }')
A.rule('.an-atom { --cat-e: #6fa8dc; }')
A.rule('.cat-svg .cat-sym { font-size: 30px; font-weight: 700; fill: var(--gold); }')
A.rule('.cat-svg .cat-z { font-size: 11px; fill-opacity: .8; }')
A.rule('.cat-svg .cat-cfg { font-size: 15px; font-weight: 700; }')
A.rule('.cat-svg .cat-hd { font-size: 12px; font-weight: 700; fill: var(--gold); }')

A.put('<text class="cat-hd" x="120" y="14">One electron for every proton</text>')
for s in range(4):
    i = min(v for (sh, k), v in first.items() if sh == s)
    A.put('<circle class="cat-ring" cx="%d" cy="%d" r="%d"/>' % (CX, CY, RAD[s]), A.pop(start(i), END, s0=.6))
A.put('<circle class="cat-nuc" cx="%d" cy="%d" r="13"/>' % (CX, CY))
for i, (sym, name, z, nn) in enumerate(ATOMS):
    a, b = start(i), start(i) + STEP - 0.45
    if i == len(ATOMS) - 1: b = END
    A.group(A.win(a, b, .35),
            '<text class="cat-pn" x="%d" y="%d">%dp</text>' % (CX, CY - 1, z),
            '<text class="cat-pn" x="%d" y="%d">%dn</text>' % (CX, CY + 10, nn),
            '<text class="cat-sym" x="192" y="70">%s</text>' % sym,
            '<text class="cat-z" x="192" y="88">%s</text>' % name,
            '<text class="cat-z" x="192" y="102">atomic no. %d</text>' % z,
            '<text class="cat-cfg" x="192" y="126">%s</text>' % ','.join(map(str, shells(z))),
            A.cap(*SAY[i]))
# THE ELECTRONS A STEP ADDS land together, gold while they are the new ones and blue after.
for i in range(len(ATOMS)):
    dots = [spot(s, k) for (s, k), i2 in sorted(first.items()) if i2 == i]
    blue = ''.join('<circle cx="%s" cy="%s" r="4"/>' % (cb_kit.r2(x), cb_kit.r2(y)) for x, y in dots)
    a = start(i) + 0.5
    nb = start(i) + STEP - 0.4 if i < len(ATOMS) - 1 else END
    A.put('<g class="cat-e">' + blue + '</g>', A.pop(a, END))
    A.put('<g class="cat-new">' + blue + '</g>', A.pop(a, nb))

html, css = A.build('TB-GCSE-CHEM', 1, 'Electron shells', 'Nuclear model|Atomic number',
                    'one electron per proton: shells fill 2, 8, 8')
anim_row.write_anim('atom', html=html, css=css)
