# Ionic bonding, Na → Cl (GCSE Chemistry chapter 3, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_ionic.py
#
# WHAT IT SHOWS, as a dot-and-cross diagram moves: sodium (2,8,1, its electrons crosses) and chlorine
# (2,8,7, dots). Sodium's one outer electron travels to the gap in chlorine's outer shell; sodium's
# empty third shell goes; both become ions in brackets with full shells, Na⁺ [2,8] and Cl⁻ [2,8,8]; the
# two pull together (the bond is the attraction); then the pair is one cell of the giant lattice.
# The still is the two ions with their charges — the answer a mark scheme wants drawn.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
import math
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 26.0
A = cb_kit.Anim('ionic', 'cio', T, still=14.5)
NA, CL, CY = 62, 178, 92
RAD = [12, 23, 34]


def spot(cx, shell, k, n8=True):
    if shell == 0: ang = [180, 0][k]
    else: ang = [-90, 0, 90, 180][k % 4] + (16 if k >= 4 else 0)
    a = math.radians(ang)
    return cx + RAD[shell] * math.cos(a), CY + RAD[shell] * math.sin(a)


def cross(x, y, cls='cio-x'):
    return '<path class="%s" d="M%s %sl6 6m0 -6l-6 6"/>' % (cls, r2(x - 3), r2(y - 3))


def dot(x, y, cls='cio-d'):
    return '<circle class="%s" cx="%s" cy="%s" r="3"/>' % (cls, r2(x), r2(y))


A.rule('.an-ionic { --cio-na: #6fa8dc; --cio-cl: #8fd18a; }')
A.rule('.cio-ring { fill: none; stroke: var(--paper); stroke-opacity: .35; }')
A.rule('.cio-x { stroke: var(--cio-na); stroke-width: 1.8; stroke-linecap: round; }')
A.rule('.cio-d { fill: var(--cio-cl); }')
A.rule('.cio-svg .cio-sym { font-size: 13px; font-weight: 700; }')
A.rule('.cio-svg .cio-lab { font-size: 11px; fill-opacity: .85; }')
A.rule('.cio-svg .cio-q { font-size: 15px; font-weight: 700; fill: var(--gold); }')
A.rule('.cio-br { fill: none; stroke: var(--paper); stroke-width: 1.4; }')
A.rule('.cio-svg .cio-hd1 { font-size: 12px; font-weight: 700; fill: var(--gold); }')
A.rule('.cio-pos { fill: var(--cio-na); } .cio-neg { fill: var(--cio-cl); }')
A.rule('.cio-svg .cio-ion { font-size: 11px; font-weight: 700; fill: var(--bg); }')
A.rule('.cio-gd { color: var(--gold); }')

# STEP TIMES
S1, S2, S3, S4, S5 = 0, 4.5, 9, 14, 19
A.put('<text class="cio-hd1" x="120" y="14">Ionic bonding: electrons move</text>')

# THE ATOMS (both shown until the lattice), and their pull together in step 4
pull = lambda dx: [(0, 0, 0), (S4 + .4, 0, 0), (S4 + 2, dx, 0), (S5, dx, 0)]
na_core = ''.join('<circle class="cio-ring" cx="%d" cy="%d" r="%d"/>' % (NA, CY, RAD[s]) for s in (0, 1)) + \
    '<text class="cio-sym" x="%d" y="%d">Na</text>' % (NA, CY + 4) + \
    ''.join(cross(*spot(NA, 0, k)) for k in range(2)) + ''.join(cross(*spot(NA, 1, k)) for k in range(8))
cl_core = ''.join('<circle class="cio-ring" cx="%d" cy="%d" r="%d"/>' % (CL, CY, RAD[s]) for s in (0, 1, 2)) + \
    '<text class="cio-sym" x="%d" y="%d">Cl</text>' % (CL, CY + 4) + \
    ''.join(dot(*spot(CL, 0, k)) for k in range(2)) + ''.join(dot(*spot(CL, 1, k)) for k in range(8)) + \
    ''.join(dot(*spot(CL, 2, k)) for k in range(7))
A.put('<g>' + na_core + '</g>', [(t, (0 if t > S5 + .3 else 1), x, y, 1) for t, x, y in [(0, 0, 0), (S4 + .4, 0, 0), (S4 + 2, 14, 0), (S5, 14, 0), (S5 + .5, 14, 0), (T - .6, 0, 0)]])
A.put('<g>' + cl_core + '</g>', [(t, (0 if t > S5 + .3 else 1), x, y, 1) for t, x, y in [(0, 0, 0), (S4 + .4, 0, 0), (S4 + 2, -14, 0), (S5, -14, 0), (S5 + .5, -14, 0), (T - .6, 0, 0)]])
# sodium's third shell: there until its electron has gone
A.put('<circle class="cio-ring" cx="%d" cy="%d" r="%d"/>' % (NA, CY, RAD[2]), A.win(0, S3 - .2, .5))
# the electron that moves: from sodium's outer shell to the gap in chlorine's (the 8th place)
x0, y0 = NA + RAD[2], CY
x1, y1 = spot(CL, 2, 7)
mid = ((x0 + x1) / 2 - x0, -26)
A.put(cross(x0, y0, 'cio-x cio-mv'), A.path([(S2 + .6, 0, 0), (S2 + 2.2, mid[0], mid[1]), (S2 + 3.6, x1 - x0, y1 - y0),
                                             (S4 + .4, x1 - x0, y1 - y0), (S4 + 2, x1 - x0 - 14, y1 - y0), (S5, x1 - x0 - 14, y1 - y0)], show=(0, S5 + .3)))
A.rule('.cio-svg .cio-mv { stroke: var(--gold); stroke-width: 2.2; }')
# labels under each atom
A.group(A.win(0, S3 - .3, .4),
        '<text class="cio-lab" x="%d" y="%d">sodium 2,8,1</text>' % (NA, CY + 50),
        '<text class="cio-lab" x="%d" y="%d">chlorine 2,8,7</text>' % (CL, CY + 50))
# brackets and charges after the move
br = lambda cx, dx, r: '<path class="cio-br" d="M%s %sh-5v%sh5M%s %sh5v%sh-5"/>' % (r2(cx - r + 5), CY - r, 2 * r, r2(cx + r - 5), CY - r, 2 * r)
A.put('<g>' + br(NA, 0, 30) + '<text class="cio-q" x="%d" y="%d">+</text>' % (NA + 32, CY - 28) +
      '<text class="cio-lab" x="%d" y="%d">Na⁺ [2,8]</text>' % (NA, CY + 50) + '</g>',
      [(t, o, x, 0, 1) for t, o, x in [(0, 0, 0), (S3, 0, 0), (S3 + .6, 1, 0), (S4 + .4, 1, 0), (S4 + 2, 1, 14), (S5, 1, 14), (S5 + .5, 0, 14), (T - .5, 0, 0)]])
A.put('<g>' + br(CL, 0, 41) + '<text class="cio-q" x="%d" y="%d">−</text>' % (CL + 47, CY - 34) +
      '<text class="cio-lab" x="%d" y="%d">Cl⁻ [2,8,8]</text>' % (CL, CY + 50) + '</g>',
      [(t, o, x, 0, 1) for t, o, x in [(0, 0, 0), (S3, 0, 0), (S3 + .6, 1, 0), (S4 + .4, 1, 0), (S4 + 2, 1, -14), (S5, 1, -14), (S5 + .5, 0, -14), (T - .5, 0, 0)]])
A.group(A.win(S4 + 1, S5, .4), arrow(88, 150, 106, 150, 'cio-ar cio-gd'), arrow(152, 150, 134, 150, 'cio-ar cio-gd'))
# THE LATTICE: the pair repeated in every direction
cells = ''
for i in range(7):
    for j in range(4):
        pos = (i + j) % 2 == 0
        x, y = 48 + i * 24, 52 + j * 24
        cells += '<circle class="%s" cx="%d" cy="%d" r="%d"/><text class="cio-ion" x="%d" y="%d">%s</text>' % (
            'cio-pos' if pos else 'cio-neg', x, y, 8 if pos else 11, x, y + 4, '+' if pos else '−')
A.put('<g>' + cells + '</g>', A.win(S5 + .4, T - .7, .6))

A.caption(S1, S2 - .3, 'Sodium has 1 outer electron;', 'chlorine has 7')
A.caption(S2, S3 - .3, 'Sodium gives its outer electron', 'to chlorine')
A.caption(S3, S4 - .3, 'Both now have full outer shells:', 'ions, Na⁺ and Cl⁻')
A.caption(S4, S5 - .3, 'Opposite charges attract:', 'that pull is the ionic bond')
A.caption(S5, T - .7, 'Repeated in every direction:', 'a giant ionic lattice, NaCl')

html, css = A.build('TB-GCSE-CHEM', 3, 'Ionic bonding', 'Ionic bond|Giant ionic lattice|NaCl',
                    'sodium gives its outer electron to chlorine: Na⁺ and Cl⁻')
anim_row.write_anim('ionic', html=html, css=css)
