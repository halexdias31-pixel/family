# A titration (GCSE Chemistry chapter 5, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_titrate.py
#
# WHAT IT SHOWS. 25.0 cm³ of alkali in a conical flask with phenolphthalein (pink in alkali). Acid runs
# in drop by drop from the burette, its reading climbing from 0.00; the pink fades as the alkali is
# used up, and at the end point one drop turns it colourless: stop, and read 20.00 cm³. Then the titre
# (final − initial) and what happened, H⁺ + OH⁻ → H₂O, neutralisation. The level in the burette falls
# in steps a reader can count against the scale. The still is the end point read.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 26.0
S = [0, 4, 15, 19.5]
A = cb_kit.Anim('titrate', 'cti', T, still=S[2] + 2)
A.rule('.an-titrate { --cti-acid: #9ec5e8; --cti-pink: #ff8fc4; }')
A.rule('.cti-glass { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.3; }')
A.rule('.cti-acid { fill: var(--cti-acid); fill-opacity: .55; } .cti-pink { fill: var(--cti-pink); } .cti-clear { fill: var(--paper); fill-opacity: .12; }')
A.rule('.cti-tick { stroke: var(--paper); stroke-opacity: .5; } .cti-drop { fill: var(--cti-acid); }')
A.rule('.cti-svg .cti-rd { font-size: 15px; font-weight: 700; fill: var(--gold); text-anchor: start; }')
A.rule('.cti-svg .cti-lab { font-size: 11px; text-anchor: start; } .cti-svg .cti-big { font-size: 13px; font-weight: 700; fill: var(--gold); text-anchor: start; }')
A.head('Titration')
BX, BT, BB = 74, 24, 96         # burette x centre, top, bottom of the scale
A.put('<rect class="cti-glass" x="%d" y="%d" width="12" height="%d"/>' % (BX - 6, BT, BB - BT + 8))
A.put('<path class="cti-glass" d="M%d %dL%d %dL%d %dM%d %dh12"/>' % (BX - 6, BB + 8, BX - 1, BB + 18, BX + 1, BB + 18, BX - 9, BB + 4))
A.put('<path class="cti-tick" d="%s"/>' % ''.join('M%d %dh4' % (BX + 6, BT + 6 + 8 * k) for k in range(11)))
# the acid column falls in eight steps: each step is a slice taken off the top
SL = 8
H = (BB - BT - 6) / SL
for k in range(SL):
    y = BT + 6 + H * k
    t = S[1] + 1 + (S[2] - S[1] - 2) * k / SL
    A.put('<rect class="cti-acid" x="%d" y="%s" width="10" height="%s"/>' % (BX - 5, r2(y), r2(H + .4)), [(0, 1, 0, 0, 1), (t, 1, 0, 0, 1), (t + .4, 0, 0, 0, 1), (T - .6, 0, 0, 0, 1)] if k < SL // 2 + 1 else None)
# the flask: conical, alkali in it pink, fading, then colourless
FL = 'M%d 132L%d 164H%dL%d 132Z' % (BX - 6, BX - 34, BX + 34, BX + 6)
A.put('<path class="cti-clear" d="M%d 144L%d 164H%dL%d 144Z"/>' % (BX - 16, BX - 34, BX + 34, BX + 16))
A.put('<path class="cti-pink" d="M%d 144L%d 164H%dL%d 144Z"/>' % (BX - 16, BX - 34, BX + 34, BX + 16),
      [(0, 1, 0, 0, 1), (S[1] + 1, 1, 0, 0, 1), (S[2] - 1, .45, 0, 0, 1), (S[2], 0, 0, 0, 1), (T - .6, 0, 0, 0, 1)])
A.put('<path class="cti-glass" d="%s M%d 118V132M%d 118V132"/>' % (FL, BX - 6, BX + 6))
# drops: one shape, many times
for k in range(9):
    t = S[1] + .6 + k * (S[2] - S[1] - 1) / 9
    A.put('<circle class="cti-drop" cx="%d" cy="%d" r="2.2"/>' % (BX, BB + 21), A.path([(t, 0, 0), (t + .5, 0, 26)], show=(t, t + .5), f=.1))
# the reading
for k, (txt, a, b) in enumerate([('0.00 cm³', 0, S[1] + 1), ('8.50 cm³', S[1] + 1.2, S[1] + 4.6), ('16.20 cm³', S[1] + 4.8, S[2] - .2), ('20.00 cm³', S[2], T - .7)]):
    A.group(A.win(a, b, .3), '<text class="cti-rd" x="112" y="56">%s</text>' % txt)
A.put('<text class="cti-lab" x="112" y="38">burette reading</text>')
A.group(A.win(0, S[2] - .2), '<text class="cti-lab" x="112" y="146">25.0 cm³ alkali</text><text class="cti-lab" x="112" y="160">+ phenolphthalein</text>')
A.group(A.win(S[2], S[3] - .2), '<text class="cti-big" x="112" y="88">end point:</text><text class="cti-big" x="112" y="104">stop</text>')
A.group(A.win(S[3], T - .7), '<text class="cti-lab" x="112" y="80">titre:</text><text class="cti-lab" x="112" y="94">20.00 − 0.00</text><text class="cti-big" x="112" y="110">= 20.00 cm³</text>',
        '<text class="cti-lab" x="112" y="132">H⁺ + OH⁻ → H₂O</text>')
A.caption(S[0], S[1] - .3, 'Alkali in the flask is pink', 'with phenolphthalein')
A.caption(S[1], S[2] - .3, 'Add acid drop by drop,', 'swirling: the pink fades')
A.caption(S[2], S[3] - .3, 'One drop turns it colourless:', 'the end point — read the burette')
A.caption(S[3], T - .7, 'Neutralisation. Repeat until', 'titres agree within 0.10 cm³')

html, css = A.build('TB-GCSE-CHEM', 5, 'Titration', 'Neutralisation|pH scale',
                    'acid from a burette into alkali until the indicator changes: 20.00 cm³')
anim_row.write_anim('titrate', html=html, css=css)
