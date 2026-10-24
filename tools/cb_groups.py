# Periodic table groups and trends (GCSE Chemistry chapter 2, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_groups.py
#
# WHAT IT SHOWS. The first four periods of the table as cells, then one idea at a time lit on it: a
# group is a column and a period a row; Group 1 (one outer electron, more reactive going down — the
# arrow and the three reactions grow); Group 7 (seven outer electrons, less reactive going down);
# Group 0 (full shells, unreactive); a period's elements all have the same number of shells; and metals
# left of the staircase, non-metals right. The cells are too small to letter at 320px, so the lit
# column's symbols are written out large underneath. The still is Group 1, the chapter's first point.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 30.0
ST = [0, 4.5, 10, 15.5, 20, 25]
A = cb_kit.Anim('groups', 'cgr', T, still=ST[1] + 3)
X0, Y0, CW, CH = 9, 26, 12.3, 15
# columns per period (18-column layout); period 1 is H and He
ROWS = [[1, 18], [1, 2] + list(range(13, 19)), [1, 2] + list(range(13, 19)), list(range(1, 19))]
NONMETAL = {(0, 1), (0, 18), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18), (1, 13), (2, 15), (2, 16), (2, 17), (2, 18), (3, 17), (3, 18), (2, 14), (3, 16)}
A.rule('.an-groups { --cgr-1: #ff7b72; --cgr-7: #8fd18a; --cgr-0: #b98cff; --cgr-p: #6fa8dc; }')
A.rule('.cgr-c { fill: var(--paper); fill-opacity: .12; stroke: var(--paper); stroke-opacity: .35; stroke-width: .6; }')
A.rule('.cgr-g1 { fill: var(--cgr-1); } .cgr-g7 { fill: var(--cgr-7); } .cgr-g0 { fill: var(--cgr-0); } .cgr-pp { fill: var(--cgr-p); }')
A.rule('.cgr-mt { fill: var(--gold); fill-opacity: .55; } .cgr-nm { fill: var(--paper); fill-opacity: .55; }')
A.rule('.cgr-svg .cgr-sy { font-size: 15px; font-weight: 700; }')
A.rule('.cgr-svg .cgr-sm { font-size: 11px; fill-opacity: .85; }')
A.rule('.cgr-svg .cgr-t1 { fill: var(--cgr-1); } .cgr-svg .cgr-t7 { fill: var(--cgr-7); } .cgr-svg .cgr-t0 { fill: var(--cgr-0); } .cgr-svg .cgr-tp { fill: var(--cgr-p); }')
A.rule('.cgr-stair { fill: none; stroke: var(--gold); stroke-width: 2; }')
A.head('The periodic table')
cx = lambda c: X0 + (c - 1) * CW
cy = lambda r: Y0 + r * CH
cells = ''.join('<rect class="cgr-c" x="%s" y="%s" width="%s" height="%s"/>' % (r2(cx(c)), r2(cy(r)), r2(CW - 1), CH - 1) for r, cs in enumerate(ROWS) for c in cs)
A.put(cells)


def lit(cls, coords):
    return ''.join('<rect class="%s" x="%s" y="%s" width="%s" height="%s"/>' % (cls, r2(cx(c)), r2(cy(r)), r2(CW - 1), CH - 1) for r, c in coords)


# 1: what a group and a period are
A.group(A.win(ST[0] + .3, ST[1] - .3), lit('cgr-g1', [(r, 2) for r in range(1, 4)]).replace('cgr-g1', 'cgr-pp'),
        lit('cgr-mt', [(2, c) for c in ROWS[2]]),
        '<text class="cgr-sm cgr-tp" x="%s" y="102">group ↓</text>' % r2(cx(2) + 22),
        '<text class="cgr-sm" x="178" y="102">period →</text>')
A.caption(ST[0], ST[1] - .3, 'A group is a column;', 'a period is a row')
# 2: Group 1
A.group(A.win(ST[1], ST[2] - .3), lit('cgr-g1', [(1, 1), (2, 1), (3, 1)]),
        '<text class="cgr-sy cgr-t1" x="30" y="114">Li</text><text class="cgr-sy cgr-t1" x="30" y="134">Na</text><text class="cgr-sy cgr-t1" x="30" y="154">K</text>',
        '<text class="cgr-sm" x="160" y="114">fizzes</text><text class="cgr-sm" x="160" y="134">fizzes, melts</text><text class="cgr-sm" x="160" y="154">lilac flame</text>',
        arrow(224, 104, 224, 156, 'cgr-ar'), '<text class="cgr-sm cgr-t1" x="220" y="98">more</text>')
A.put('<g><rect class="cgr-g1" x="50" y="105" width="20" height="12"/></g>', A.win(ST[1] + .8, ST[2] - .3))
A.put('<g><rect class="cgr-g1" x="50" y="125" width="34" height="12"/></g>', A.win(ST[1] + 1.6, ST[2] - .3))
A.put('<g><rect class="cgr-g1" x="50" y="145" width="48" height="12"/></g>', A.win(ST[1] + 2.4, ST[2] - .3))
A.caption(ST[1], ST[2] - .3, 'Group 1: one outer electron,', 'more reactive going down')
# 3: Group 7
A.group(A.win(ST[2], ST[3] - .3), lit('cgr-g7', [(1, 17), (2, 17), (3, 17)]),
        '<text class="cgr-sy cgr-t7" x="30" y="114">F</text><text class="cgr-sy cgr-t7" x="30" y="134">Cl</text><text class="cgr-sy cgr-t7" x="30" y="154">Br</text>',
        '<text class="cgr-sm" x="150" y="114">pale yellow gas</text><text class="cgr-sm" x="150" y="134">green gas</text><text class="cgr-sm" x="150" y="154">brown liquid</text>',
        arrow(224, 104, 224, 156, 'cgr-ar'), '<text class="cgr-sm cgr-t7" x="220" y="98">less</text>')
A.caption(ST[2], ST[3] - .3, 'Group 7: seven outer electrons,', 'less reactive going down')
# 4: Group 0
A.group(A.win(ST[3], ST[4] - .3), lit('cgr-g0', [(r, 18) for r in range(4)]),
        '<text class="cgr-sy cgr-t0" x="60" y="124">He</text><text class="cgr-sy cgr-t0" x="100" y="124">Ne</text><text class="cgr-sy cgr-t0" x="140" y="124">Ar</text><text class="cgr-sy cgr-t0" x="180" y="124">Kr</text>',
        '<text class="cgr-sm" x="120" y="146">full outer shells</text>')
A.caption(ST[3], ST[4] - .3, 'Group 0, the noble gases:', 'full shells, so unreactive')
# 5: a period
A.group(A.win(ST[4], ST[5] - .3), lit('cgr-pp', [(2, c) for c in ROWS[2]]),
        '<text class="cgr-sy cgr-tp" x="120" y="124">Na Mg Al Si P S Cl Ar</text>',
        '<text class="cgr-sm" x="120" y="146">all have three shells</text>')
A.caption(ST[4], ST[5] - .3, 'Period 3: every element', 'has three shells of electrons')
# 6: metals and non-metals
nm = [(r, c) for r, cs in enumerate(ROWS) for c in cs if (r, c) in NONMETAL]
mt = [(r, c) for r, cs in enumerate(ROWS) for c in cs if (r, c) not in NONMETAL]
stair = 'M%s %sV%sH%sV%sH%sV%sH%sV%s' % (r2(cx(13)), r2(cy(1)), r2(cy(2)), r2(cx(14)), r2(cy(3)), r2(cx(16)), r2(cy(4)), r2(cx(16)), r2(cy(4)))
A.group(A.win(ST[5], T - .7), lit('cgr-mt', mt), lit('cgr-nm', nm), '<path class="cgr-stair" d="%s"/>' % stair,
        '<text class="cgr-sm" x="60" y="124">metals</text><text class="cgr-sm" x="190" y="124">non-metals</text>')
A.caption(ST[5], T - .7, 'Metals on the left,', 'non-metals on the right')

html, css = A.build('TB-GCSE-CHEM', 2, 'Groups and trends', 'Group|Period|Alkali metals|Halogens|Noble gases',
                    'Group 1 more reactive going down, Group 7 less, Group 0 unreactive')
anim_row.write_anim('groups', html=html, css=css)
