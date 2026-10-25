# Rates of reaction and collision theory (GCSE Chemistry chapter 8, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_rates.py
#
# WHAT IT SHOWS. Particles of two reactants jostling in a box, a gold ring where two collide hard
# enough to react, and a bar for collisions per second. One variable changes at a time, as a fair test
# does: at 20 °C a few collisions; the same temperature with twice the particles (more concentrated),
# more; the first particles at 50 °C, faster and wider, the most; then a catalyst, which is drawn as
# what it does — a second reaction profile whose hump (activation energy) is lower.
#
# THE JOSTLE IS ITS OWN SHORT LOOP. Each particle wanders on one of three four-point paths that repeat
# every 3.5 s cold and every 1.75 s hot (both divide the 28 s clock), set by `animation-duration` on
# `.cra-s` and `.cra-f`: per-particle tracks over the whole clock would have cost a keyframe each.
# Each sets its own `--o` and `--t`: custom properties inherit, and its layer's hidden still would hide it.
import sys, pathlib, random; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 28.0
S = [0, 7, 14, 21]
A = cb_kit.Anim('rates', 'cra', T, still=S[2] + 4)
A.rule('.an-rates { --cra-a: #6fa8dc; --cra-b: #ff9e64; }')
A.rule('.cra-box { fill: var(--paper); fill-opacity: .05; stroke: var(--paper); stroke-opacity: .5; }')
A.rule('.cra-pa { fill: var(--cra-a); } .cra-pb { fill: var(--cra-b); }')
A.rule('.cra-hit { fill: none; stroke: var(--gold); stroke-width: 2; }')
A.rule('.cra-bar { fill: var(--gold); } .cra-frame { fill: none; stroke: var(--paper); stroke-opacity: .4; }')
A.rule('.cra-svg .cra-lab { font-size: 11px; } .cra-svg .cra-tm { font-size: 13px; font-weight: 700; fill: var(--gold); }')
A.rule('.cra-ax { fill: none; stroke: var(--paper); stroke-opacity: .7; } .cra-p0 { fill: none; stroke: var(--paper); stroke-width: 2; } .cra-p1 { fill: none; stroke: var(--gold); stroke-width: 2; stroke-dasharray: 4 3; }')
A.rule('.cra-svg .cra-s { animation-duration: 3.5s; animation-timing-function: linear; }')
A.rule('.cra-svg .cra-f { animation-duration: 1.75s; animation-timing-function: linear; }')
JIG = {'cra-j1': [(25, 7, -5), (50, -3, 6), (75, -7, -2)], 'cra-j2': [(25, -6, 4), (50, 5, 7), (75, 6, -5)], 'cra-j3': [(25, 4, 7), (50, -7, 1), (75, 3, -6)]}
for n, pts in JIG.items():
    for amp, sfx in ((1, ''), (2, 'h')):
        A.rule('@keyframes %s%s {0%%,100%%{transform:none}%s}' % (n, sfx, ''.join('%d%%{transform:translate(%spx,%spx)}' % (p, r2(x * amp), r2(y * amp)) for p, x, y in pts)))
A.head('Collision theory')
BOX = (20, 26, 200, 92)
A.put('<rect class="cra-box" x="%d" y="%d" width="%d" height="%d"/>' % BOX, A.win(0, S[3] - .2))
rnd = random.Random(3)


def particles(n, speed, seed):
    r = random.Random(seed)
    out = ''
    for k in range(n):
        x, y = r.uniform(36, 204), r.uniform(42, 102)
        out += '<circle class="cra-a %s %s" cx="%s" cy="%s" r="4.5" style="--kf:cra-j%d%s;--d:-%ss;--o:1;--t:none"/>' % (
            'cra-pa' if k % 2 else 'cra-pb', 'cra-s' if speed == 's' else 'cra-f', r2(x), r2(y), 1 + k % 3, '' if speed == 's' else 'h', r2(r.uniform(0, 3)))
    return out


def hits(a, b, n, seed):
    r = random.Random(seed)
    for k in range(n):
        t = a + .5 + (b - a - 1.2) * (k + r.uniform(0, .6)) / n
        A.put('<circle class="cra-hit" cx="%s" cy="%s" r="7"/>' % (r2(r.uniform(40, 200)), r2(r.uniform(44, 100))), A.pop(t, t + .5, s0=.4, f=.3))


cold = particles(10, 's', 1)
A.group(A.win(0, S[2] - .2), cold)
A.group(A.win(S[1], S[2] - .2), particles(10, 's', 2))
A.group(A.win(S[2], S[3] - .2), particles(10, 'f', 1))
hits(S[0], S[1], 2, 11); hits(S[1], S[2], 4, 12); hits(S[2], S[3], 7, 13)
A.group(A.win(0, S[1] - .2), '<text class="cra-tm" x="50" y="44">20 °C</text>')
A.group(A.win(S[1], S[2] - .2), '<text class="cra-tm" x="50" y="44">20 °C</text>', '<text class="cra-lab" x="170" y="44">twice as many</text>')
A.group(A.win(S[2], S[3] - .2), '<text class="cra-tm" x="50" y="44">50 °C</text>')
# collisions per second
A.put('<g><text class="cra-lab" x="120" y="134">successful collisions per second</text><rect class="cra-frame" x="30" y="140" width="180" height="10"/></g>', A.win(0, S[3] - .2))
for k, w in enumerate([30, 70, 150]):
    A.put('<rect class="cra-bar" x="30" y="140" width="%d" height="10"/>' % w, A.win(S[k] + .6, S[k + 1] - .2))
A.caption(S[0], S[1] - .3, 'They react only when particles', 'collide with enough energy')
A.caption(S[1], S[2] - .3, 'More concentrated: more', 'particles, so more collisions')
A.caption(S[2], S[3] - .3, 'Hotter: faster, so they collide', 'more often and harder')
# a catalyst: the profile with a lower hump
gx, gy = 34, 30
prof0 = 'M%d 100H70C100 100 100 40 120 40C140 40 140 116 170 116H214' % gx
prof1 = 'M%d 100H70C100 100 104 72 120 72C136 72 140 116 170 116H214' % gx
A.group(A.win(S[3], T - .7), '<path class="cra-ax" d="M%d 26V128H214"/>' % gx, '<path class="cra-p0" d="%s"/>' % prof0,
        '<text class="cra-lab" x="120" y="34">without</text><text class="cra-lab cra-tm" x="176" y="62">with catalyst</text>',
        '<text class="cra-lab" x="20" y="80" transform="rotate(-90 20 80)">energy</text><text class="cra-lab" x="124" y="142">progress of reaction</text>')
A.put('<path class="cra-p1" d="%s"/>' % prof1, A.win(S[3] + 1.2, T - .7))
A.caption(S[3], T - .7, 'A catalyst gives a route with', 'lower activation energy')

html, css = A.build('TB-GCSE-CHEM', 8, 'Collision theory', 'Collision theory|Rate of reaction|Catalyst|Hotter',
                    'more collisions with enough energy: concentration, temperature, catalyst')
anim_row.write_anim('rates', html=html, css=css)
