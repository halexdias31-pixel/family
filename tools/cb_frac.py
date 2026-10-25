# Fractional distillation of crude oil (GCSE Chemistry chapter 9, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_frac.py
#
# WHAT IT SHOWS. Crude oil heated to vapour enters the bottom of a column that is hot at the bottom and
# cool at the top. Vapour rises; each fraction condenses at the tray where the column is cooler than
# its boiling point and runs out of its pipe, bottom first: bitumen, fuel oil, diesel, kerosene, petrol,
# gases — each named with its chain length. Then the trend: shorter chains, lower boiling point, runnier,
# easier to light. The still is every fraction out and the trend.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 26.0
A = cb_kit.Anim('frac', 'cfd', T, still=T - 2)
A.rule('.an-frac { --cfd-hot: #ff7b72; }')
A.rule('.cfd-col { fill: none; stroke: var(--paper); stroke-opacity: .6; } .cfd-band { fill: var(--cfd-hot); }')
A.rule('.cfd-tr { stroke: var(--paper); stroke-opacity: .5; } .cfd-pipe { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.4; }')
A.rule('.cfd-v { fill: var(--paper); fill-opacity: .8; } .cfd-out { fill: var(--gold); }')
A.rule('.cfd-svg .cfd-nm { font-size: 11px; text-anchor: start; } .cfd-svg .cfd-c { font-size: 10.5px; text-anchor: start; fill: var(--gold); }')
A.rule('.cfd-svg .cfd-t { font-size: 10.5px; fill-opacity: .85; } .cfd-flame { fill: var(--coral); }')
A.head('Fractional distillation')
COL = (44, 24, 40, 130)          # x, y, w, h
# HOT AT THE BOTTOM, COOL AT THE TOP, as bands of one red fading upward (a row's CSS may not hold `url(`, so no gradient)
A.put('<g>' + ''.join('<rect class="cfd-band" x="44" y="%d" width="40" height="%s" fill-opacity="%s"/>' % (24 + k * 130 / 6, r2(130 / 6), r2(.05 + .06 * k)) for k in range(6)) + '</g>')
A.put('<rect class="cfd-col" x="%d" y="%d" width="%d" height="%d" rx="6"/>' % COL)
A.put('<text class="cfd-t" x="22" y="34">25 °C</text><text class="cfd-t" x="22" y="152">350 °C</text>')
A.put('<path class="cfd-flame" d="M56 168q6 -12 8 -5q4 -7 8 5z"/>')
FR = [('gases', 'C1–C4'), ('petrol', 'C5–C10'), ('kerosene', 'C10–C16'), ('diesel', 'C14–C20'), ('fuel oil', 'C20–C40'), ('bitumen', 'C40+')]
Y = [36, 56, 76, 96, 116, 138]
STEP, T0 = 2.6, 1.0
for k, (name, c) in enumerate(FR):
    y = Y[k]
    A.put('<path class="cfd-tr" d="M44 %dH84"/>' % (y + 6))
    A.put('<path class="cfd-pipe" d="M84 %dH100"/>' % y)
    order = 5 - k                       # bitumen first
    t = T0 + STEP * order
    # a vapour blob rising from the bottom to this tray
    A.put('<circle class="cfd-v" cx="%d" cy="150" r="3.5"/>' % (58 + 8 * (k % 3)), A.path([(t, 0, 0), (t + 1.6, 0, y - 150)], show=(t, t + 1.6), f=.3))
    A.put('<g><circle class="cfd-out" cx="104" cy="%d" r="3"/><text class="cfd-nm" x="112" y="%d">%s</text><text class="cfd-c" x="176" y="%d">%s</text></g>' % (y, y + 4, name, y + 4, c),
          A.pop(t + 1.7, T - .8, s0=.6))
SUM = T0 + STEP * 6 + .6
A.group(A.win(SUM, T - .7), arrow(228, 140, 228, 36, 'cfd-ar'))
A.caption(0, T0 + STEP * 2 - .3, 'Vapour rises; long chains', 'condense low, where it is hot')
A.caption(T0 + STEP * 2, SUM - .3, 'Shorter chains rise higher,', 'where the column is cooler')
A.caption(SUM, T - .7, 'Shorter chains: lower boiling', 'point, runnier, burn easily')

html, css = A.build('TB-GCSE-CHEM', 9, 'Fractional distillation', 'Fractional distillation|Crude oil|Shorter chains',
                    'crude oil vapour condensing at the tray where the column is cool enough')
anim_row.write_anim('frac', html=html, css=css)
