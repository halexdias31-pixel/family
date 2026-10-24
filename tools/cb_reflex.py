# The reflex arc (GCSE Biology chapter 8, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_reflex.py
#
# WHAT IT SHOWS. A finger near a flame, the spinal cord to the right, and three neurones between them.
# An impulse (a gold spark) runs the chapter's own order: stimulus → receptor → sensory neurone → relay
# neurone in the spinal cord → motor neurone → effector (the arm muscle) → response, the hand pulled
# away. At each synapse the spark stops while chemicals (dots) cross the gap. Each part is named as the
# spark reaches it, and stays lit. The still is the whole arc, every part named.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 26.0
A = cb_kit.Anim('reflex', 'bre', T, still=T - 1.2)
A.rule('.an-reflex { --bre-n: #b98cff; --bre-m: #ff7b72; }')
A.rule('.bre-cord { fill: var(--paper); fill-opacity: .08; stroke: var(--paper); stroke-opacity: .5; } .bre-grey { fill: var(--paper); fill-opacity: .18; }')
A.rule('.bre-n { fill: none; stroke: var(--bre-n); stroke-width: 2; stroke-linecap: round; } .bre-lit { fill: none; stroke: var(--gold); stroke-width: 2.4; stroke-linecap: round; }')
A.rule('.bre-sp { fill: var(--gold); } .bre-chem { fill: var(--paper); } .bre-mus { fill: var(--bre-m); fill-opacity: .7; }')
A.rule('.bre-hand { fill: none; stroke: var(--paper); stroke-width: 6; stroke-linecap: round; } .bre-fl { fill: var(--gold); }')
A.rule('.bre-svg .bre-lb { font-size: 10.5px; } .bre-svg .bre-gl { font-size: 10.5px; fill: var(--gold); }')
A.head('The reflex arc')
A.put('<g transform="translate(0 -14)">')       # the arc sits a line higher, clear of the words
# spinal cord cross-section
A.put('<g><ellipse class="bre-cord" cx="196" cy="84" rx="34" ry="40"/><path class="bre-grey" d="M180 70q16 14 32 0q-6 14 0 28q-16 -14 -32 0q6 -14 0 -28z"/><text class="bre-lb" x="196" y="140">spinal cord</text></g>')
# the arm and hand (the response moves this group)
arm = '<path class="bre-hand" d="M20 96L64 96L64 150"/><ellipse class="bre-mus" cx="42" cy="96" rx="16" ry="8"/>'
A.put('<g>' + arm + '</g>')
A.put('<path class="bre-hand" d="M64 150l14 6"/>', [(0, 1, 0, 0, 1), (19, 1, 0, 0, 1), (20, 1, -10, -14, 1), (T - 1.2, 1, -10, -14, 1), (T - .4, 1, 0, 0, 1)])
A.put('<path class="bre-fl" d="M92 170q-6 -10 2 -18q0 6 4 6q2 -6 -2 -12q12 8 6 24z"/>')
# the three neurones as paths: sensory (finger → cord), relay (in the cord), motor (cord → muscle)
SEN = [(80, 152), (110, 140), (150, 110), (184, 86)]
REL = [(188, 86), (204, 86)]
MOT = [(208, 90), (160, 116), (100, 112), (52, 100)]
pth = lambda pts: 'M' + 'L'.join('%d %d' % p for p in pts)
A.put('<g><path class="bre-n" d="%s"/><path class="bre-n" d="%s"/><path class="bre-n" d="%s"/></g>' % (pth(SEN), pth(REL), pth(MOT)))
# the spark's journey: (time, x, y)
J = [(1.5, 80, 152), (4.5, 110, 140), (6, 150, 110), (7.5, 184, 86), (9.5, 184, 86), (10, 188, 86), (11, 204, 86), (13, 204, 86), (13.5, 208, 90), (15, 160, 116), (16.5, 100, 112), (18, 52, 100), (19, 52, 100)]
x0, y0 = J[0][1], J[0][2]
A.put('<circle class="bre-sp" cx="%d" cy="%d" r="4.5"/>' % (x0, y0), A.path([(t, x - x0, y - y0) for t, x, y in J], show=(1.3, 19.2), f=.25))
# chemicals crossing the two synapses
for k, (sx, sy, t) in enumerate([(184, 86, 7.6), (204, 86, 11.1)]):
    for j in range(3):
        A.put('<circle class="bre-chem" cx="%d" cy="%d" r="1.5"/>' % (sx, sy - 3 + 3 * j), A.path([(t + .2 * j, 0, 0), (t + 1.4 + .2 * j, 4, 0)], show=(t + .2 * j, t + 1.6 + .2 * j), f=.1))
# lit sections and names, kept once reached
A.put('<path class="bre-lit" d="%s"/>' % pth(SEN), A.pop(7.5, T - .7, s0=1))
A.put('<path class="bre-lit" d="%s"/>' % pth(REL), A.pop(11, T - .7, s0=1))
A.put('<path class="bre-lit" d="%s"/>' % pth(MOT), A.pop(18, T - .7, s0=1))
NAMES = [(1.4, '<text class="bre-gl" x="112" y="178">stimulus</text>'), (2.6, '<text class="bre-lb" x="44" y="170">receptor</text>'),
         (5, '<text class="bre-lb" x="124" y="152">sensory</text>'), (10, '<text class="bre-lb" x="196" y="60">relay</text>'),
         (15, '<text class="bre-lb" x="140" y="132">motor</text>'), (18.2, '<text class="bre-lb" x="42" y="82">effector</text>'),
         (19.5, '<text class="bre-gl" x="40" y="60">response</text>')]
for t, m in NAMES:
    A.group(A.pop(t, T - .7, s0=.8), m)
A.put('</g>')
A.caption(0, 4.3, 'The flame is a stimulus; a skin', 'receptor sends an impulse')
A.caption(4.5, 9.3, 'Along a sensory neurone; at the', 'synapse, chemicals cross the gap')
A.caption(9.5, 13.2, 'A relay neurone in the spinal', 'cord passes it on')
A.caption(13.4, 18.8, 'A motor neurone carries it', 'to the effector, a muscle')
A.caption(19, T - .7, 'The hand pulls away: fast and', 'automatic, no thinking')

html, css = A.build('TB-GCSE-BIO', 8, 'The reflex arc', 'Reflex arc|Reflex|Receptor|Effector|Synapse',
                    'stimulus, receptor, sensory, relay, motor neurone, effector: the hand pulls away')
anim_row.write_anim('reflex', html=html, css=css)
