# Diffusion and osmosis, as particles (GCSE Biology chapter 2, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_osmosis.py
#
# WHAT IT SHOWS. First diffusion: particles packed at one end of a box spread until they are even — net
# movement from high to low concentration, with nothing pushing them. Then osmosis: a partially permeable
# membrane with a dilute solution on the left and a concentrated sugar solution on the right. Water
# molecules (small, blue) cross; sugar molecules (big, orange) cannot; the water level rises on the
# concentrated side. Why a potato chip in strong salt solution loses mass. The still is the osmosis end.
import sys, pathlib, random; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2 = cb_kit.r2

T = 28.0
S = [0, 8, 12, 22]
A = cb_kit.Anim('osmosis', 'bos', T, still=S[3] - .5)
A.rule('.an-osmosis { --bos-w: #6fa8dc; --bos-s: #ff9e64; --bos-p: #c3e88d; }')
A.rule('.bos-box { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.3; }')
A.rule('.bos-p { fill: var(--bos-p); } .bos-w { fill: var(--bos-w); } .bos-s { fill: var(--bos-s); }')
A.rule('.bos-liq { fill: var(--bos-w); fill-opacity: .14; } .bos-mem { stroke: var(--gold); stroke-width: 2; stroke-dasharray: 4 3; }')
A.rule('.bos-svg .bos-lb { font-size: 11px; } .bos-svg .bos-gd { font-size: 11px; fill: var(--gold); }')
A.head('Diffusion and osmosis')
rnd = random.Random(5)
# 1. DIFFUSION
A.put('<rect class="bos-box" x="20" y="34" width="200" height="110"/>', A.win(0, S[1] - .3))
for k in range(18):
    x0, y0 = rnd.uniform(26, 70), rnd.uniform(40, 138)
    x1, y1 = 30 + (k % 6) * 36 + rnd.uniform(-4, 4), 48 + (k // 6) * 40 + rnd.uniform(-6, 6)
    A.put('<circle class="bos-p" cx="%s" cy="%s" r="3.5"/>' % (r2(x0), r2(y0)), A.path([(.6, 0, 0), (1 + 5.5 * (.6 + .4 * rnd.random()), x1 - x0, y1 - y0), (S[1], x1 - x0, y1 - y0)], show=(0, S[1] - .3)))
A.group(A.win(0, S[1] - .3), '<text class="bos-gd" x="50" y="158">high</text><text class="bos-lb" x="190" y="158">low</text>')
A.caption(0, S[1] - .3, 'Diffusion: particles spread from', 'high to low concentration')
# 2. OSMOSIS: the box with a membrane down the middle
A.put('<g><rect class="bos-box" x="20" y="34" width="200" height="110"/><path class="bos-mem" d="M120 34V144"/></g>', A.win(S[1], T - .7))
# the levels: dilute side falls, concentrated side rises (each a cross-fade, so neither leaves its box)
for x, y0, y1 in ((21, 64, 82), (121, 64, 46)):
    A.put('<rect class="bos-liq" x="%d" y="%d" width="98" height="%d"/>' % (x, y0, 143 - y0), A.win(S[1], S[2] + 4, .8))
    A.put('<rect class="bos-liq" x="%d" y="%d" width="98" height="%d"/>' % (x, y1, 143 - y1), A.win(S[2] + 4, T - .7, 2.5))
sug = [(30, 120), (150, 80), (176, 110), (204, 90), (160, 128), (196, 128)]
A.group(A.win(S[1] + .2, T - .7), ''.join('<circle class="bos-s" cx="%d" cy="%d" r="7"/>' % p for p in sug))
for k in range(12):
    x0 = 30 + (k % 4) * 22 + rnd.uniform(-3, 3)
    y0 = 78 + (k // 4) * 22 + rnd.uniform(-3, 3)
    cross = k % 3 != 2              # two in three cross over
    x1 = x0 + (100 if cross else 6)
    y1 = y0 - (10 if cross else 0)
    A.put('<circle class="bos-w" cx="%s" cy="%s" r="3"/>' % (r2(x0), r2(y0)), A.path([(S[2], 0, 0), (S[2] + 1 + .7 * k, x1 - x0, y1 - y0), (T - .7, x1 - x0, y1 - y0)], show=(S[1] + .2, T - .7)))
for k in range(4):
    A.put('<circle class="bos-w" cx="%d" cy="%d" r="3"/>' % (140 + 18 * k, 100 + 10 * (k % 2)), A.win(S[1] + .2, T - .7))
A.group(A.win(S[1] + .2, T - .7), '<text class="bos-lb" x="70" y="158">dilute</text><text class="bos-gd" x="170" y="158">concentrated</text>')
A.caption(S[1], S[2] - .3, 'A partially permeable membrane:', 'water passes, sugar cannot')
A.caption(S[2], S[3] - .3, 'Osmosis: water moves from the', 'dilute to the concentrated side')
A.caption(S[3], T - .7, 'So a potato in strong salt', 'solution loses mass')

html, css = A.build('TB-GCSE-BIO', 2, 'Diffusion and osmosis', 'Diffusion|Osmosis',
                    'particles spreading; water crossing a membrane to the concentrated side')
anim_row.write_anim('osmosis', html=html, css=css)
