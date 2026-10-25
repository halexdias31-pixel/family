# The water cycle and lag time (GCSE Geography chapter 7, river landscapes): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the layout or the timeline and re-run:
# python3 tools/gg_water.py
#
# WHAT IT DRAWS, in one loop of T seconds: first the cycle over a drainage basin — the sun lifts water
# vapour off the sea, it drifts inland and condenses into cloud over the hills, rain falls, and the
# water reaches the river fast over the ground and slowly through the soil. Then the storm hydrograph
# that journey makes: rain as bars, the river's discharge rising later, and the gap between the two
# peaks named — the lag time. The still (reduced motion) is the hydrograph with its lag time marked.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'ggwater'
T = 16.0
W, H = 240, 136
SCENES = [(0.0, 9.0), (9.0, T)]
STILL = 5
GX0, GX1, GY0, GY1 = 28, 226, 26, 112    # the hydrograph's plot
RAIN = [(40, 10), (54, 26), (68, 44), (82, 20), (96, 8)]    # (x, height) of each hour's bar
PEAK_R, PEAK_Q = 68, 142


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


CAPS = [
    (0.2, 2.4, '<b class="ggwater-k">Evaporation</b><i class="ggwater-ln">the sun heats the sea; water vapour rises</i>'),
    (2.4, 4.6, '<b class="ggwater-k">Condensation</b><i class="ggwater-ln">the vapour cools into cloud over the hills</i>'),
    (4.6, 6.8, '<b class="ggwater-k">Precipitation</b><i class="ggwater-ln">rain falls on the drainage basin</i>'),
    (6.8, 9.0, '<b class="ggwater-k">To the river</b><i class="ggwater-ln">fast over the ground, slowly through the soil</i>'),
    (9.0, 12.4, '<b class="ggwater-k">The storm hydrograph</b><i class="ggwater-ln">rain as bars, the river\'s discharge as a line</i>'),
    (12.4, T, '<b class="ggwater-k">Lag time</b><i class="ggwater-ln">from peak rainfall to peak discharge</i>'),
]

s = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
# ---- THE CYCLE.
s.append('      <g class="%s-sc %s-sc0">' % (P, P))
s.append('        <circle class="%s-sun" cx="18" cy="18" r="11"/>' % P)
s.append('        <rect class="%s-sea" x="0" y="104" width="80" height="32"/>' % P)
s.append('        <path class="%s-land" d="M72 104 C100 100 120 84 150 66 C170 54 186 40 204 36 C218 38 230 46 240 50 V136 H72 Z"/>' % P)
s.append('        <path class="%s-soil" d="M96 118 C130 110 170 90 240 80"/>' % P)
s.append('        <path class="%s-river" d="M168 58 C150 74 120 92 76 104"/>' % P)
for k, x in enumerate((20, 40, 60)):
    s.append('        <path class="%s-vap %s-v%d" d="M%d 100 q3 -4 0 -8 t0 -8"/>' % (P, P, k, x))
s.append('        <path class="%s-cloud" d="M30 34 C24 34 22 26 30 24 C30 14 44 12 48 20 C54 12 68 16 66 26 C74 26 74 34 66 34 Z"/>' % P)
s.append('        <g class="%s-rainw">' % P)
for k, x in enumerate((148, 160, 172, 184, 196)):
    s.append('          <path class="%s-drop %s-d%d" d="M%d 40 v6"/>' % (P, P, k % 3, x))
s.append('        </g>')
s.append('        <g class="%s-flow">' % P)
for k in range(3):
    s.append('          <circle class="%s-run %s-r%d" cx="196" cy="40" r="2.2"/>' % (P, P, k))
for k in range(2):
    s.append('          <circle class="%s-sink %s-k%d" cx="%d" cy="%d" r="2"/>' % (P, P, k, 176 + 14 * k, 52 - 6 * k))
s.append('          <text class="%s-lab" x="200" y="112">infiltration</text>' % P)
s.append('          <text class="%s-lab" x="120" y="74">runoff</text>' % P)
s.append('        </g>')
s.append('      </g>')
# ---- THE HYDROGRAPH.
s.append('      <g class="%s-sc %s-sc1">' % (P, P))
s.append('        <path class="%s-axis" d="M%d %d V%d H%d"/>' % (P, GX0, GY0 - 4, GY1, GX1))
for x, h in RAIN:
    s.append('        <rect class="%s-bar" x="%d" y="%d" width="12" height="%d"/>' % (P, x - 6, GY0, h))
q = 'M%d 100 C80 100 96 98 108 80 C120 60 130 38 %d 36 C156 38 166 62 184 80 C198 92 212 96 %d 98' % (GX0, PEAK_Q, GX1)
s.append('        <path class="%s-q" pathLength="1" d="%s"/>' % (P, q))
s.append('        <g class="%s-lag">' % P)
s.append('          <path class="%s-peak" d="M%d 18 V%d M%d 18 V%d"/>' % (P, PEAK_R, GY1, PEAK_Q, GY1))
s.append('          <path class="%s-span" d="M%d 18 H%d M%d 14 L%d 18 L%d 22 M%d 14 L%d 18 L%d 22"/>' % (P, PEAK_R + 2, PEAK_Q - 2, PEAK_R + 6, PEAK_R + 2, PEAK_R + 6, PEAK_Q - 6, PEAK_Q - 2, PEAK_Q - 6))
s.append('          <text class="%s-lab %s-g" x="%d" y="11">lag time</text>' % (P, P, (PEAK_R + PEAK_Q) // 2))
s.append('        </g>')
s.append('        <text class="%s-lab %s-l" x="%d" y="%d">rain</text>' % (P, P, 104, GY0 + 8))
s.append('        <text class="%s-lab %s-l" x="%d" y="%d">discharge</text>' % (P, P, 176, 70))
s.append('        <text class="%s-lab" x="%d" y="%d">time</text>' % (P, (GX0 + GX1) // 2, GY1 + 12))
s.append('      </g>')
s.append('    </svg>')
s.append('    <div class="%s-say">' % P)
for k, (a, b, words) in enumerate(CAPS):
    s.append('      <span class="%s-cap %s-c%d">%s</span>' % (P, P, k, words))
s.append('    </div>')
s.append('  </div>')

c = []
c.append('.an-%s { --ggwater-sea: #4f86b8; --ggwater-land: #4e6b3a; --ggwater-sun: #ffd166; text-align: center; }' % P)
c.append('.an-%s .%s-svg { display: block; width: min(84vw, 20rem); max-width: 100%%; height: auto; margin: 0 auto; overflow: hidden; }' % (P, P))
c.append('.%s-sun { fill: var(--ggwater-sun); }' % P)
c.append('.%s-sea { fill: var(--ggwater-sea); }' % P)
c.append('.%s-land { fill: var(--ggwater-land); }' % P)
c.append('.%s-soil { fill: none; stroke: var(--bg); stroke-opacity: .35; stroke-width: 1; stroke-dasharray: 3 3; }' % P)
c.append('.%s-river { fill: none; stroke: var(--ggwater-sea); stroke-width: 3.5; stroke-linecap: round; }' % P)
c.append('.%s-vap { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.4; stroke-linecap: round; }' % P)
c.append('.%s-cloud { fill: var(--paper); transform-box: fill-box; transform-origin: center; }' % P)
c.append('.%s-drop { stroke: var(--ggwater-sea); stroke-width: 1.8; stroke-linecap: round; }' % P)
c.append('.%s-run, .%s-sink { fill: var(--ggwater-sea); stroke: var(--paper); stroke-width: .5; }' % (P, P))
c.append('.%s-axis { fill: none; stroke: var(--paper); stroke-opacity: .7; }' % P)
c.append('.%s-bar { fill: var(--ggwater-sea); }' % P)
c.append('.%s-q { fill: none; stroke: var(--paper); stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 0; }' % P)
c.append('.%s-peak { stroke: var(--gold); stroke-width: 1; stroke-dasharray: 3 2; }' % P)
c.append('.%s-span { fill: none; stroke: var(--gold); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }' % P)
c.append('.%s-lab { font: 700 8px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
c.append('.%s-l { text-anchor: start; font-weight: 400; }' % P)
c.append('.%s-g { fill: var(--gold); }' % P)
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
c.append('.%s-vap { animation: %s-vap 1.5s linear infinite; }' % (P, P))
c.append('.%s-v1 { animation-delay: -.5s; }' % P)
c.append('.%s-v2 { animation-delay: -1s; }' % P)
c.append('@keyframes %s-vap { 0%% { opacity: 0; transform: translateY(0px); } 30%% { opacity: 1; } 100%% { opacity: 0; transform: translateY(-40px); } }' % P)
c.append('.%s-cloud { animation: %s-cloud %gs ease-in-out infinite; }' % (P, P, T))
c.append(kf('cloud', [(2.2, 'transform: translate(0px, 0px) scale(.6); fill-opacity: .5;'), (4.6, 'transform: translate(128px, -10px) scale(1.2); fill-opacity: .9;')]))
c.append('.%s-rainw { animation: %s-rainw %gs linear infinite; }' % (P, P, T))
c.append(kf('rainw', [(4.6, 'opacity: 0;'), (5.0, 'opacity: 1;'), (8.6, 'opacity: 1;'), (9.0, 'opacity: 0;')]))
c.append('.%s-drop { animation: %s-drop .7s linear infinite; }' % (P, P))
c.append('.%s-d1 { animation-delay: -.23s; }' % P)
c.append('.%s-d2 { animation-delay: -.46s; }' % P)
c.append('@keyframes %s-drop { 0%% { opacity: 0; transform: translateY(0px); } 20%% { opacity: 1; } 100%% { opacity: 0; transform: translateY(14px); } }' % P)
c.append('.%s-flow { animation: %s-flow %gs linear infinite; }' % (P, P, T))
c.append(kf('flow', [(6.6, 'opacity: 0;'), (7.0, 'opacity: 1;'), (8.6, 'opacity: 1;'), (9.0, 'opacity: 0;')]))
c.append('.%s-run { animation: %s-run 1.6s linear infinite; }' % (P, P))
c.append('.%s-r1 { animation-delay: -.53s; }' % P)
c.append('.%s-r2 { animation-delay: -1.06s; }' % P)
c.append('@keyframes %s-run { 0%% { transform: translate(0px, 0px); } 35%% { transform: translate(-30px, 14px); } 70%% { transform: translate(-50px, 30px); } 100%% { transform: translate(-60px, 38px); } }' % P)
c.append('.%s-sink { animation: %s-sink 2.6s linear infinite; }' % (P, P))
c.append('.%s-k1 { animation-delay: -1.3s; }' % P)
c.append('@keyframes %s-sink { 0%% { opacity: 0; transform: translate(0px, 0px); } 20%% { opacity: 1; } 100%% { opacity: 0; transform: translate(-14px, 40px); } }' % P)
c.append('.%s-q { animation: %s-q %gs linear infinite; }' % (P, P, T))
c.append(kf('q', [(9.4, 'stroke-dashoffset: 1;'), (12.2, 'stroke-dashoffset: 0;')]))
c.append('.%s-lag { animation: %s-lag %gs linear infinite; }' % (P, P, T))
c.append(kf('lag', [(12.4, 'opacity: 0;'), (12.9, 'opacity: 1;'), (T - 0.4, 'opacity: 1;'), (T, 'opacity: 0;')]))
c.append('@media (prefers-reduced-motion: reduce) {')
c.append('  .an-%s, .an-%s * { animation: none; }' % (P, P))
c.append('}')

anim_row.write_anim('ggwater', html='\n'.join(s), css='\n'.join(c))
print('%s: %d lines of markup, %d of CSS' % (P, len(s), len(c)))
