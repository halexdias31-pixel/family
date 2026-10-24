# The carbon cycle (GCSE Biology chapter 12, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_carbon.py
#
# WHAT IT SHOWS. Carbon dioxide in the air across the top; a plant, an animal, decomposers in the soil
# and fossil fuels below. One carbon atom (a gold dot) is followed round: into the plant by
# photosynthesis, into the animal by feeding, back to the air by respiration; in dead remains and waste
# to the decomposers, which respire it back; and stored in fossil fuels, released by burning. Each arrow
# is drawn as the atom takes it, and stays, so the cycle builds up. The still is the finished cycle.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 30.0
S = [0, 5, 10, 15, 20, 25]
A = cb_kit.Anim('carbon', 'bca', T, still=T - 1.5)
A.rule('.an-carbon { --bca-air: #6fa8dc; --bca-pl: #3ddc84; --bca-an: #ff9e64; --bca-so: #8a6a4a; }')
A.rule('.bca-air { fill: var(--bca-air); fill-opacity: .18; stroke: var(--bca-air); } .bca-pl { fill: var(--bca-pl); } .bca-an { fill: var(--bca-an); } .bca-so { fill: var(--bca-so); fill-opacity: .6; } .bca-ff { fill: #555; }')
A.rule('.bca-c { fill: var(--gold); } .bca-ar.bca-gd { color: var(--gold); }')
A.rule('.bca-svg .bca-lb { font-size: 10.5px; } .bca-svg .bca-in { font-size: 10.5px; font-weight: 700; fill: var(--bg); }')
A.head('The carbon cycle')
A.put('<g><rect class="bca-air" x="14" y="24" width="212" height="22" rx="11"/><text class="bca-lb" x="120" y="39">carbon dioxide in the air</text></g>')
A.put('<g><path class="bca-pl" d="M44 120v-26c-14 0 -18 -14 -10 -20c0 -10 20 -10 20 0c8 6 4 20 -10 20"/><text class="bca-lb" x="44" y="132">plant</text></g>')
A.put('<g><ellipse class="bca-an" cx="120" cy="108" rx="18" ry="11"/><circle class="bca-an" cx="140" cy="100" r="7"/><text class="bca-lb" x="120" y="132">animal</text></g>')
A.put('<g><rect class="bca-so" x="14" y="140" width="130" height="22"/><text class="bca-lb" x="79" y="155">decomposers</text></g>')
A.put('<g><rect class="bca-ff" x="152" y="140" width="80" height="22"/><text class="bca-in" x="193" y="155">fossil fuel</text></g>')
# the arrows, each drawn as the atom takes it: (from, to, label, label xy, step)
AR = [((40, 48), (40, 72), 'photosynthesis', (40, 62), 0),
      ((62, 106), (98, 106), 'feeding', (80, 98), 1),
      ((128, 92), (128, 50), 'respiration', (166, 72), 2),
      ((112, 120), (100, 140), 'death, waste', (74, 136), 3),
      ((22, 140), (22, 50), 'decay: respire', (22, 66), 3),
      ((206, 140), (206, 50), 'burning', (206, 128), 4)]
for (a, b, lab, (lx, ly), st) in AR:
    A.group(A.pop(S[st] + 1.2, T - .7, s0=1), arrow(a[0], a[1], b[0], b[1], 'bca-ar bca-gd'))
lbl = [('photosynthesis', 76, 60, 0), ('feeding', 80, 98, 1), ('respiration', 172, 72, 2), ('burning', 182, 100, 4)]
for t, x, y, st in lbl:
    A.group(A.pop(S[st] + 1.4, T - .7, s0=.8), '<text class="bca-lb" x="%d" y="%d">%s</text>' % (x, y, t))
# the atom: (time, x, y)
J = [(0, 40, 36), (S[0] + .8, 40, 36), (S[0] + 3.5, 44, 92), (S[1] + .8, 44, 92), (S[1] + 3.5, 120, 108), (S[2] + .8, 120, 108), (S[2] + 3.8, 128, 36),
     (S[3] - .1, 128, 36), (S[3] + .1, 120, 108), (S[3] + 2.4, 30, 150), (S[3] + 4.2, 22, 36), (S[4] - .1, 22, 36), (S[4] + .1, 193, 151), (S[4] + 3.5, 206, 36), (S[5], 206, 36)]
x0, y0 = J[0][1], J[0][2]
A.put('<circle class="bca-c" cx="%d" cy="%d" r="5"/>' % (x0, y0),
      [(t, 0 if (S[3] - .1 <= t <= S[3] + .1 or S[4] - .1 <= t <= S[4] + .1) else 1, x - x0, y - y0, 1) for t, x, y in J] + [(T - .7, 0, 206 - x0, 0, 1), (T - .1, 0, 0, 0, 1)])
A.caption(S[0], S[1] - .3, 'Photosynthesis takes carbon', 'dioxide from the air')
A.caption(S[1], S[2] - .3, 'Animals eat plants: the carbon', 'passes along the food chain')
A.caption(S[2], S[3] - .3, 'Respiration returns it to the', 'air as carbon dioxide')
A.caption(S[3], S[4] - .3, 'Decomposers feed on the dead', 'and waste, and respire')
A.caption(S[4], S[5] - .3, 'Burning fossil fuels releases', 'carbon stored for ages')
A.caption(S[5], T - .7, 'The same carbon goes round', 'and round')

html, css = A.build('TB-GCSE-BIO', 12, 'The carbon cycle', 'Photosynthesis|Decomposer',
                    'one carbon atom round photosynthesis, feeding, respiration, decay and burning')
anim_row.write_anim('carbon', html=html, css=css)
