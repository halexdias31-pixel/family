# How a tropical storm forms (GCSE Geography chapter 2, weather hazards): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the layout or the timeline and re-run:
# python3 tools/gg_storm.py
#
# WHAT IT DRAWS, in one loop of T seconds: first a slice through the air over a warm tropical sea —
# warm, moist air rising, a tower of cloud growing as it condenses and gives out heat, and air rushing
# in along the surface to replace it; then the storm from above, its bands of cloud turning
# anticlockwise round a calm eye ringed by the eyewall. The still (reduced motion) is the storm from
# above, eye and eyewall named.
import math, sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'ggstorm'
T = 16.0
W, H = 240, 140
SCENES = [(0.0, 9.0), (9.0, T)]
CX, CY = 120, 66             # the eye, from above


def pc(t): return ('%.2f' % (100 * max(0.0, min(T, t)) / T)).rstrip('0').rstrip('.') + '%'


def kf(name, stops):
    """@keyframes P-name from [(seconds, declarations)]; the ends are held to 0% and 100%."""
    stops = sorted(stops, key=lambda s: s[0])
    if stops[0][0] > 0: stops.insert(0, (0.0, stops[0][1]))
    if stops[-1][0] < T: stops.append((T, stops[-1][1]))
    seen, out = set(), []
    for t, d in stops:
        k = pc(t)
        if k in seen: continue
        seen.add(k); out.append('%s { %s }' % (k, d))
    return '@keyframes %s-%s { %s }' % (P, name, ' '.join(out))


def window(name, a, b, f=0.4):
    return kf(name, [(a, 'opacity: 0;'), (a + f, 'opacity: 1;'), (b - f, 'opacity: 1;'), (b, 'opacity: 0;')])


def arm(a0):
    """one band of cloud: a spiral from the eyewall out, sweeping back as it goes."""
    pts = []
    for k in range(25):
        f = k / 24.0
        r = 16 + 46 * f
        th = a0 + 2.4 * f
        pts.append('%.1f %.1f' % (CX + r * math.cos(th), CY + 0.92 * r * math.sin(th)))
    return 'M' + ' L'.join(pts)


CAPS = [
    (0.2, 2.8, '<b class="ggstorm-k">Sea above 27°C</b><i class="ggstorm-ln">warms the air and fills it with moisture</i>'),
    (2.8, 5.6, '<b class="ggstorm-k">Warm, moist air rises</b><i class="ggstorm-ln">cools, condenses: tall cloud, heat given out</i>'),
    (5.6, 9.0, '<b class="ggstorm-k">Low pressure below</b><i class="ggstorm-ln">air rushes in to replace the rising air</i>'),
    (9.0, 12.4, '<b class="ggstorm-k">The Earth\'s spin turns it</b><i class="ggstorm-ln">Coriolis effect: anticlockwise in the north</i>'),
    (12.4, T, '<b class="ggstorm-k">The eye</b><i class="ggstorm-ln">calm, sinking air; the strongest winds round it</i>'),
]
STILL = len(CAPS) - 1

s = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
# ---- THE SLICE: sea, rising air, the cloud tower, the inflow.
s.append('      <g class="%s-sc %s-sc0">' % (P, P))
s.append('        <rect class="%s-sea" x="0" y="112" width="%d" height="28"/>' % (P, W))
s.append('        <text class="%s-lab" x="200" y="130">27°C+</text>' % P)
s.append('        <path class="%s-cloud %s-tower" d="M60 92 C48 92 46 76 60 74 C58 56 80 50 90 60 C92 34 112 26 124 40 C134 22 160 30 158 52 C174 50 184 64 176 76 C190 80 186 94 172 92 Z"/>' % (P, P))
for k, x in enumerate((88, 120, 152)):
    s.append('        <path class="%s-up %s-u%d" d="M%d 110 v-24 m-5 6 l5 -6 l5 6"/>' % (P, P, k, x))
s.append('        <text class="%s-heat %s-h0" x="104" y="60">+ heat</text>' % (P, P))
s.append('        <g class="%s-inw">' % P)
s.append('        <path class="%s-in %s-il" d="M10 106 h26 m-6 -5 l6 5 l-6 5"/>' % (P, P))
s.append('        <path class="%s-in %s-ir" d="M230 106 h-26 m6 -5 l-6 5 l6 5"/>' % (P, P))
s.append('        <text class="%s-lab %s-dim" x="120" y="124">low pressure</text>' % (P, P))
s.append('        </g>')
s.append('      </g>')
# ---- FROM ABOVE: the bands turn round the eye.
s.append('      <g class="%s-sc %s-sc1">' % (P, P))
s.append('        <g class="%s-spin">' % P)
for k in range(4):
    s.append('          <path class="%s-arm" d="%s"/>' % (P, arm(k * math.pi / 2)))
s.append('        </g>')
s.append('        <ellipse class="%s-wall" cx="%d" cy="%d" rx="15" ry="14"/>' % (P, CX, CY))
s.append('        <ellipse class="%s-eye" cx="%d" cy="%d" rx="7" ry="6.5"/>' % (P, CX, CY))
s.append('        <path class="%s-tick" d="M%d %d L%d %d"/>' % (P, CX + 4, CY - 2, 186, 22))
s.append('        <text class="%s-lab" x="200" y="18">eye</text>' % P)
s.append('        <path class="%s-tick" d="M%d %d L%d %d"/>' % (P, CX - 13, CY + 7, 46, 116))
s.append('        <text class="%s-lab" x="38" y="128">eyewall</text>' % P)
s.append('      </g>')
s.append('    </svg>')
s.append('    <div class="%s-say">' % P)
for k, (a, b, words) in enumerate(CAPS):
    s.append('      <span class="%s-cap %s-c%d">%s</span>' % (P, P, k, words))
s.append('    </div>')
s.append('  </div>')

c = []
c.append('.an-%s { --ggstorm-sea: #4f86b8; --ggstorm-warm: #e8663a; text-align: center; }' % P)
c.append('.an-%s .%s-svg { display: block; width: min(84vw, 20rem); max-width: 100%%; height: auto; margin: 0 auto; overflow: hidden; }' % (P, P))
c.append('.%s-sea { fill: var(--ggstorm-sea); }' % P)
c.append('.%s-cloud { fill: var(--paper); fill-opacity: .82; transform-box: fill-box; transform-origin: 50%% 100%%; }' % P)
c.append('.%s-up { fill: none; stroke: var(--ggstorm-warm); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }' % P)
c.append('.%s-in { fill: none; stroke: var(--gold); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }' % P)
c.append('.%s-heat { font: 700 9px var(--mono); fill: var(--ggstorm-warm); text-anchor: middle; }' % P)
c.append('.%s-lab { font: 700 9px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
c.append('.%s-dim { fill-opacity: .7; font-weight: 400; }' % P)
c.append('.%s-arm { fill: none; stroke: var(--paper); stroke-opacity: .75; stroke-width: 9; stroke-linecap: round; }' % P)
c.append('.%s-spin { transform-box: view-box; transform-origin: %dpx %dpx; }' % (P, CX, CY))
c.append('.%s-wall { fill: none; stroke: var(--gold); stroke-width: 6; }' % P)
c.append('.%s-eye { fill: var(--bg); stroke: var(--paper); stroke-opacity: .5; }' % P)
c.append('.%s-tick { stroke: var(--paper); stroke-opacity: .6; stroke-width: .8; }' % P)
c.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.8em; align-items: center; font: 400 .85rem/1.3 var(--mono); color: var(--paper); }' % P)
c.append('.%s-cap { grid-area: 1 / 1; }' % P)
c.append('.%s-k { display: block; color: var(--gold); font-size: 1.1em; }' % P)
c.append('.%s-ln { display: block; font-style: normal; opacity: .9; }' % P)
c.append('.%s-sc0, .%s-cap:not(.%s-c%d) { opacity: 0; }' % (P, P, P, STILL))
for k, (a, b) in enumerate(SCENES):
    c.append('.%s-sc%d { animation: %s-sc%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(window('sc%d' % k, a, b))
for k, (a, b, w) in enumerate(CAPS):
    c.append('.%s-c%d { animation: %s-c%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(window('c%d' % k, a, b))
# the rising air loops on its own short beat; its scene's window decides when it is seen
c.append('.%s-up { animation: %s-up 1.4s linear infinite; }' % (P, P))
c.append('.%s-u1 { animation-delay: -.5s; }' % P)
c.append('.%s-u2 { animation-delay: -.95s; }' % P)
c.append('@keyframes %s-up { 0%% { opacity: 0; transform: translateY(0px); } 25%% { opacity: 1; } 80%% { opacity: 1; } 100%% { opacity: 0; transform: translateY(-34px); } }' % P)
c.append('.%s-tower { animation: %s-tower %gs ease-out infinite; }' % (P, P, T))
c.append(kf('tower', [(2.6, 'transform: scale(.35, .2); opacity: .3;'), (5.6, 'transform: scale(1, 1); opacity: 1;')]))
c.append('.%s-h0 { animation: %s-h0 %gs linear infinite; }' % (P, P, T))
c.append(kf('h0', [(3.6, 'opacity: 0;'), (4.0, 'opacity: 1;'), (5.4, 'opacity: 1;'), (5.8, 'opacity: 0;')]))
c.append('.%s-il { animation: %s-il 1.2s ease-in infinite; }' % (P, P))
c.append('.%s-ir { animation: %s-ir 1.2s ease-in infinite; }' % (P, P))
c.append('@keyframes %s-il { 0%% { transform: translateX(0px); opacity: 0; } 30%% { opacity: 1; } 100%% { transform: translateX(46px); opacity: 0; } }' % P)
c.append('@keyframes %s-ir { 0%% { transform: translateX(0px); opacity: 0; } 30%% { opacity: 1; } 100%% { transform: translateX(-46px); opacity: 0; } }' % P)
c.append('.%s-inw { animation: %s-inw %gs linear infinite; }' % (P, P, T))
c.append(window('inw', 5.6, 9.0))
c.append('.%s-spin { animation: %s-spin 5s linear infinite; }' % (P, P))
c.append('@keyframes %s-spin { 0%% { transform: rotate(0deg); } 100%% { transform: rotate(-360deg); } }' % P)
c.append('@media (prefers-reduced-motion: reduce) {')
c.append('  .an-%s, .an-%s * { animation: none; }' % (P, P))
c.append('}')

anim_row.write_anim('ggstorm', html='\n'.join(s), css='\n'.join(c))
print('%s: %d lines of markup, %d of CSS' % (P, len(s), len(c)))
