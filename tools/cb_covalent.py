# Covalent bonding, sharing a pair (GCSE Chemistry chapter 3, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_covalent.py
#
# WHAT IT SHOWS. Two hydrogen atoms, one electron each, drift together until their shells overlap and
# the two electrons sit in the overlap: a shared pair, one covalent bond, drawn as H–H. Then the same
# idea twice more as dot-and-cross diagrams: water (oxygen shares one pair with each hydrogen, two lone
# pairs left) and methane (carbon shares four pairs). Electrons from one atom are crosses and from the
# other dots, so "shared" is visible: each pair is one of each. The still is water.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
import math
r2 = cb_kit.r2

T = 28.0
S1, S2, S3, S4, S5 = 0, 4.5, 9, 13.5, 20.5
A = cb_kit.Anim('covalent', 'cco', T, still=S4 + 4)
CY = 92

A.rule('.an-covalent { --cco-h: #6fa8dc; --cco-o: #ff9e64; }')
A.rule('.cco-sh { fill: var(--paper); fill-opacity: .06; stroke: var(--paper); stroke-opacity: .45; }')
A.rule('.cco-x { stroke: var(--cco-h); stroke-width: 1.8; stroke-linecap: round; }')
A.rule('.cco-d { fill: var(--cco-o); }')
A.rule('.cco-svg .cco-sym { font-size: 13px; font-weight: 700; }')
A.rule('.cco-svg .cco-big { font-size: 22px; font-weight: 700; fill: var(--gold); }')
A.rule('.cco-svg .cco-hd1 { font-size: 12px; font-weight: 700; fill: var(--gold); }')
A.rule('.cco-pair { fill: none; stroke: var(--gold); stroke-width: 1.4; stroke-dasharray: 3 2; }')
A.rule('.cco-svg .cco-lab { font-size: 11px; fill-opacity: .85; }')


def cross(x, y):
    return '<path class="cco-x" d="M%s %sl6 6m0 -6l-6 6"/>' % (r2(x - 3), r2(y - 3))


def dot(x, y):
    return '<circle class="cco-d" cx="%s" cy="%s" r="3"/>' % (r2(x), r2(y))


A.put('<text class="cco-hd1" x="120" y="14">Covalent bonds: sharing</text>')
# H2: two atoms come together
R = 26
L0, R0, D = 70, 170, 32          # each moves D toward the middle
mv = lambda dx: A.path([(S1, 0, 0), (S2 + .3, 0, 0), (S2 + 2.6, dx, 0), (S4 - .6, dx, 0)], show=(0, S4 - .5))
A.put('<g><circle class="cco-sh" cx="%d" cy="%d" r="%d"/><text class="cco-sym" x="%d" y="%d">H</text></g>' % (L0, CY, R, L0, CY + 5), mv(D))
A.put('<g><circle class="cco-sh" cx="%d" cy="%d" r="%d"/><text class="cco-sym" x="%d" y="%d">H</text></g>' % (R0, CY, R, R0, CY + 5), mv(-D))
# the electrons: from the far side of each atom into the overlap
A.put(cross(L0 + R, CY), A.path([(S1, 0, 0), (S2 + .3, 0, 0), (S2 + 2.6, D - 6 + 120 - (L0 + D) - (R - 0), -9), (S4 - .6, 120 - (L0 + R), -9)], show=(0, S4 - .5)))
A.put(dot(R0 - R, CY), A.path([(S1, 0, 0), (S2 + .3, 0, 0), (S2 + 2.6, 120 - (R0 - R), 9), (S4 - .6, 120 - (R0 - R), 9)], show=(0, S4 - .5)))
A.put('<ellipse class="cco-pair" cx="120" cy="%d" rx="9" ry="17"/>' % CY, A.win(S3 - .4, S4 - .5))
A.put('<text class="cco-big" x="120" y="150">H–H</text>', A.win(S3, S4 - .5))
A.caption(S1, S2 - .3, 'Each H atom has one electron;', 'its shell is full with two')
A.caption(S2, S3 - .3, 'The atoms overlap and share', 'their two electrons')
A.caption(S3, S4 - .5, 'A shared pair of electrons', 'is one covalent bond: H–H')


def molecule(cx, cy, central, n_out, hs, lone):
    """A central atom (dots) sharing a pair with each H (crosses) at the angles in hs, lone pairs at `lone`."""
    m = '<circle class="cco-sh" cx="%d" cy="%d" r="30"/>' % (cx, cy)
    for a in hs:
        ra = math.radians(a)
        hx, hy = cx + 44 * math.cos(ra), cy + 44 * math.sin(ra)
        m += '<circle class="cco-sh" cx="%s" cy="%s" r="18"/><text class="cco-sym" x="%s" y="%s">H</text>' % (r2(hx), r2(hy), r2(hx + 6 * math.cos(ra)), r2(hy + 6 * math.sin(ra) + 4))
        px, py = cx + 28 * math.cos(ra), cy + 28 * math.sin(ra)
        ox, oy = 5 * -math.sin(ra), 5 * math.cos(ra)
        m += dot(px + ox, py + oy) + cross(px - ox, py - oy)
    for a in lone:
        ra = math.radians(a)
        px, py = cx + 24 * math.cos(ra), cy + 24 * math.sin(ra)
        ox, oy = 5 * -math.sin(ra), 5 * math.cos(ra)
        m += dot(px + ox, py + oy) + dot(px - ox, py - oy)
    m += '<text class="cco-sym" x="%d" y="%d">%s</text>' % (cx, cy + 5, central)
    return m


A.group(A.win(S4, S5 - .3), molecule(120, 96, 'O', 6, [150, 30], [-125, -55]), '<text class="cco-big" x="120" y="166">H₂O</text>')
A.caption(S4, S5 - .3, 'Water: oxygen shares one pair', 'with each hydrogen')
A.group(A.win(S5, T - .7), molecule(120, 96, 'C', 4, [-90, 0, 90, 180], []), '<text class="cco-big" x="196" y="40">CH₄</text>')
A.caption(S5, T - .7, 'Methane: carbon shares four', 'pairs — a simple molecule')

html, css = A.build('TB-GCSE-CHEM', 3, 'Covalent bonding', 'Covalent bond|Simple molecule',
                    'two atoms share a pair of electrons: H–H, H₂O, CH₄')
anim_row.write_anim('covalent', html=html, css=css)
