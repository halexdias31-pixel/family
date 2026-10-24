# Electrolysis of molten lead bromide, ions migrating (GCSE Chemistry chapter 6, and a loading splash)
# — docs/history/420. THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row.
# Run: python3 tools/cb_electro.py
#
# WHAT IT SHOWS. A crucible of molten lead bromide between two graphite electrodes. Off, the ions are
# scattered and free to move. On, every Pb²⁺ drifts to the cathode (−) and every Br⁻ to the anode (+);
# at the cathode the lead ions gain electrons and a bead of grey lead grows under it (Pb²⁺ + 2e⁻ → Pb);
# at the anode the bromide ions lose electrons and brown bromine rises (2Br⁻ → Br₂ + 2e⁻); electrons go
# round the wire from anode to cathode. The chapter's first worked line. The still is the ions arrived.
import sys, pathlib, random; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 28.0
S = [0, 4.5, 11, 16, 21]
A = cb_kit.Anim('electro', 'cel', T, still=S[2] - .5)
A.rule('.an-electro { --cel-pb: #9ec5e8; --cel-br: #e0884a; }')
A.rule('.cel-pot { fill: var(--paper); fill-opacity: .07; stroke: var(--paper); stroke-opacity: .5; }')
A.rule('.cel-el { fill: #555; stroke: var(--paper); stroke-opacity: .5; }')
A.rule('.cel-w { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.3; }')
A.rule('.cel-pb { fill: var(--cel-pb); } .cel-br { fill: var(--cel-br); }')
A.rule('.cel-svg .cel-ion { font-size: 10.5px; font-weight: 700; fill: var(--bg); }')
A.rule('.cel-svg .cel-sg { font-size: 15px; font-weight: 700; fill: var(--gold); }')
A.rule('.cel-svg .cel-lab { font-size: 11px; }')
A.rule('.cel-lead { fill: #a9a9a9; } .cel-gas { fill: var(--cel-br); fill-opacity: .7; }')
A.rule('.cel-e { fill: var(--gold); }')
A.rule('.cel-svg .cel-eq { font-size: 10.5px; fill: var(--gold); }')
A.head('Electrolysis of lead bromide')
# circuit: battery on top, wires down to the electrodes
CA, AN = 78, 162           # electrode centres
A.put('<path class="cel-w" d="M%d 70V36H112M128 36H%dV70"/>' % (CA, AN))
A.put('<path class="cel-w" d="M112 28V44M118 31V41"/>')        # cell symbol: long plate and short plate
A.put('<path class="cel-w" d="M118 36H128"/>')
A.put('<text class="cel-sg" x="%d" y="62">−</text><text class="cel-sg" x="%d" y="62">+</text>' % (CA - 14, AN + 14))
A.put('<rect class="cel-pot" x="40" y="80" width="160" height="62" rx="6"/>')
A.put('<rect class="cel-el" x="%d" y="66" width="10" height="70"/><rect class="cel-el" x="%d" y="66" width="10" height="70"/>' % (CA - 5, AN - 5))
A.put('<text class="cel-lab" x="%d" y="156">cathode</text><text class="cel-lab" x="%d" y="156">anode</text>' % (CA, AN))
# THE IONS: scattered, then each drifts to its electrode and stays there
rnd = random.Random(7)
spots = [(rnd.uniform(52, 188), rnd.uniform(90, 134)) for _ in range(14)]
spots = [(x, y) for x, y in spots if abs(x - CA) > 12 and abs(x - AN) > 12]
for k, (x, y) in enumerate(spots):
    pb = k % 3 == 0
    tx = CA + 13 if pb else AN - 13
    ty = 88 + (k * 7) % 48
    j = (lambda: (rnd.uniform(-4, 4), rnd.uniform(-4, 4)))
    w1, w2 = j(), j()
    stops = [(0, 0, 0), (1.5, w1[0], w1[1]), (3, w2[0], w2[1]), (S[1], 0, 0), (S[1] + 4 + k * .15, tx - x, ty - y), (T - .8, tx - x, ty - y)]
    if pb:
        A.put('<g><circle class="cel-pb" cx="%s" cy="%s" r="7.5"/><text class="cel-ion" x="%s" y="%s">2+</text></g>' % (r2(x), r2(y), r2(x), r2(y + 3.5)),
              [(t, (0 if t > S[2] + 2 else 1) if True else 1, dx, dy, 1) for t, dx, dy in stops[:-1]] + [(S[2] + 2.5, 0, tx - x, ty - y, 1), (T - .5, 0, 0, 0, 1)])
    else:
        A.put('<g><circle class="cel-br" cx="%s" cy="%s" r="6"/><text class="cel-ion" x="%s" y="%s">−</text></g>' % (r2(x), r2(y), r2(x), r2(y + 3.5)),
              [(t, 1, dx, dy, 1) for t, dx, dy in stops[:-1]] + [(S[3] + 2.5, 0, tx - x, ty - y, 1), (T - .5, 0, 0, 0, 1)])
# lead forms under the cathode; bromine bubbles rise at the anode
A.put('<ellipse class="cel-lead" cx="%d" cy="139" rx="20" ry="4"/>' % CA, A.pop(S[2] + 1, T - .8, s0=.2))
for k in range(4):
    A.put('<circle class="cel-gas" cx="%d" cy="128" r="4"/>' % (AN + 10 - 5 * k), A.path([(0, 0, 0), (S[3] + .3 + .6 * k, 0, 0), (S[3] + 3.3 + .6 * k, 6 - 3 * k, -52), (T - .9, 6 - 3 * k, -52)], show=(S[3] + .3 + .6 * k, T - .9)))
A.group(A.win(S[2] + .5, T - .7), '<text class="cel-eq" x="%d" y="171">Pb²⁺ + 2e⁻ → Pb</text>' % (CA - 16))
A.group(A.win(S[3] + .5, T - .7), '<text class="cel-eq" x="%d" y="171">2Br⁻ → Br₂ + 2e⁻</text>' % (AN + 18))
# electrons round the wire, anode to cathode
for k in range(3):
    A.put('<circle class="cel-e" cx="%d" cy="70" r="3"/>' % AN,
          A.path([(S[4] + .4 * k, 0, 0), (S[4] + 1.3 + .4 * k, 0, -34), (S[4] + 2.2 + .4 * k, -34, -34), (S[4] + 3.8 + .4 * k, -84, -34), (S[4] + 4.7 + .4 * k, -84, 0)], show=(S[4] + .4 * k, S[4] + 4.7 + .4 * k)))
A.caption(S[0], S[1] - .3, 'Molten, the ions are free', 'to move')
A.caption(S[1], S[2] - .3, 'Pb²⁺ goes to the cathode (−),', 'Br⁻ to the anode (+)')
A.caption(S[2], S[3] - .3, 'At the cathode lead ions gain', 'electrons: lead metal forms')
A.caption(S[3], S[4] - .3, 'At the anode bromide ions lose', 'electrons: bromine gas')
A.caption(S[4], T - .7, 'Electrons flow round the wire', 'from the anode to the cathode', y=None)

html, css = A.build('TB-GCSE-CHEM', 6, 'Electrolysis', 'Electrolysis|Cathode|Anode|Molten lead bromide',
                    'Pb²⁺ to the cathode, Br⁻ to the anode: lead and bromine')
anim_row.write_anim('electro', html=html, css=css)
