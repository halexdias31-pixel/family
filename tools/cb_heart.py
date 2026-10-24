# The heart and double circulation (GCSE Biology chapter 4, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_heart.py
#
# WHAT IT SHOWS. The heart as four chambers seen from the front (so its right side is on the reader's
# left), the lungs above and the body below, joined in a figure of eight. A stream of blood cells goes
# round: blue (deoxygenated) from the body into the right atrium, down to the right ventricle, up the
# pulmonary artery to the lungs, where each turns red; back down the pulmonary vein to the left atrium,
# the left ventricle (its thicker wall drawn thicker) and out of the aorta to the body, where it turns
# blue again. One gold-ringed cell leads, and each step's words and lit vessel follow it: blood passes
# through the heart twice for each trip round the body — the chapter's own blood path. The cells are one
# track, shifted along the path, so the stream costs two keyframes. The still is the whole circuit.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 30.0
A = cb_kit.Anim('heart', 'bhe', T, still=T - 1.5)
A.rule('.an-heart { --bhe-o: #ff5f56; --bhe-d: #6fa8dc; }')
A.rule('.bhe-ch { fill: var(--paper); fill-opacity: .07; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.2; } .bhe-lv { stroke-width: 3.5; }')
A.rule('.bhe-v { fill: none; stroke-width: 6; stroke-linejoin: round; stroke-opacity: .28; } .bhe-vd { stroke: var(--bhe-d); } .bhe-vo { stroke: var(--bhe-o); }')
A.rule('.bhe-org { fill: var(--paper); fill-opacity: .08; stroke: var(--paper); stroke-opacity: .5; }')
A.rule('.bhe-o { fill: var(--bhe-o); } .bhe-d { fill: var(--bhe-d); } .bhe-ld { fill: none; stroke: var(--gold); stroke-width: 1.8; }')
A.rule('.bhe-lit { fill: none; stroke: var(--gold); stroke-width: 2; stroke-linejoin: round; }')
A.rule('.bhe-svg .bhe-lb { font-size: 10.5px; } .bhe-svg .bhe-in { font-size: 10.5px; font-weight: 700; }')
A.head('Double circulation')
# THE PATH, as (x, y) corners in order, and which part is oxygenated
P = [(30, 150), (30, 72), (88, 72), (88, 108), (60, 108), (60, 40), (100, 30), (140, 30), (180, 40), (180, 72), (152, 72), (152, 108), (210, 108), (210, 150), (120, 160), (30, 150)]
OXY = range(6, 13)       # segments starting at these corners carry red blood
seglen = [((P[i + 1][0] - P[i][0]) ** 2 + (P[i + 1][1] - P[i][1]) ** 2) ** .5 for i in range(len(P) - 1)]
# EACH STEP GETS THE SAME TIME (T / 5), shared among its vessels by length: the lead cell slows on the short
# runs so every step's words stay up long enough to read.
BOUNDS = [0, 3, 5, 9, 11, 15]
times = [0.0] * len(P)
for a, b in zip(BOUNDS, BOUNDS[1:]):
    tot = sum(seglen[a:b])
    for i in range(a, b): times[i + 1] = times[i] + seglen[i] / tot * T / 5
# vessels drawn under everything
dpts = lambda a, b: 'M' + 'L'.join('%d %d' % P[i] for i in range(a, b + 1))
A.put('<path class="bhe-v bhe-vd" d="%s"/><path class="bhe-v bhe-vo" d="%s"/><path class="bhe-v bhe-vd" d="%s"/>' % (dpts(0, 6), dpts(6, 13), dpts(13, 15)))
A.put('<g><ellipse class="bhe-org" cx="120" cy="32" rx="34" ry="12"/><text class="bhe-lb" x="120" y="36">lungs</text><rect class="bhe-org" x="84" y="150" width="72" height="20" rx="6"/><text class="bhe-lb" x="120" y="164">body</text></g>')
A.put('<g><rect class="bhe-ch" x="76" y="62" width="40" height="20"/><rect class="bhe-ch" x="76" y="86" width="40" height="34"/><rect class="bhe-ch" x="124" y="62" width="40" height="20"/><rect class="bhe-ch bhe-lv" x="124" y="86" width="40" height="34"/>'
      '<text class="bhe-in" x="96" y="76">RA</text><text class="bhe-in" x="96" y="108">RV</text><text class="bhe-in" x="144" y="76">LA</text><text class="bhe-in" x="144" y="108">LV</text></g>')
A.put('<text class="bhe-lb" x="14" y="112" transform="rotate(-90 14 112)">vena cava</text><text class="bhe-lb" x="226" y="128" transform="rotate(90 226 128)">aorta</text>')


def track(red):
    pts = []
    for i, (x, y) in enumerate(P):
        on = (i in OXY) if red else (i not in OXY)
        prev_on = ((i - 1) in OXY) if red else ((i - 1) not in OXY)
        o = 1 if (on and i < len(P) - 1) or (prev_on and i > 0 and not on and False) else 0
        pts.append((times[i], 1 if on else 0, x - P[0][0], y - P[0][1], 1))
    # the colour changes at a corner: hold the old colour up to it and switch in a moment
    out = []
    for i, p in enumerate(pts):
        if i and pts[i - 1][1] != p[1]:
            out.append((p[0] - .01, pts[i - 1][1]) + p[2:])
        out.append(p)
    out[-1] = (T - .01, out[0][1]) + out[0][2:]
    return out


N = 10
x0, y0 = P[0]
for k in range(N):
    A.put('<circle class="bhe-d" cx="%d" cy="%d" r="4"/>' % (x0, y0), track(False), shift=k * T / N)
    A.put('<circle class="bhe-o" cx="%d" cy="%d" r="4"/>' % (x0, y0), track(True), shift=k * T / N)
A.put('<circle class="bhe-ld" cx="%d" cy="%d" r="7"/>' % (x0, y0), [(times[i], 1, x - x0, y - y0, 1) for i, (x, y) in enumerate(P)][:-1])
# the steps follow the lead cell
STEPS = [(0, 3, 'From the body, blood enters', 'the right atrium (vena cava)'),
         (3, 5, 'The right ventricle pumps it', 'to the lungs'),
         (5, 9, 'In the lungs it picks up', 'oxygen: now it is red'),
         (9, 11, 'Back to the left atrium', '(pulmonary vein)'),
         (11, 15, 'The left ventricle, thickest,', 'pumps it to the body (aorta)')]
for a, b, l1, l2 in STEPS:
    A.put('<path class="bhe-lit" d="%s"/>' % dpts(a, b), A.win(times[a] + .1, times[b] - .3, .3))
    A.caption(times[a] + .1, times[b] - .3, l1, l2)

html, css = A.build('TB-GCSE-BIO', 4, 'Double circulation', 'Double circulatory system|Blood path',
                    'blood through the heart twice: to the lungs and back, then to the body')
anim_row.write_anim('heart', html=html, css=css)
