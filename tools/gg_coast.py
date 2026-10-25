# Coastal erosion and longshore drift (GCSE Geography chapter 6, coastal landscapes): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the layout or the timeline and re-run:
# python3 tools/gg_coast.py
#
# WHAT IT DRAWS, in one loop of T seconds: first a cliff from the side — waves slam into a crack and the
# trapped air bursts it (hydraulic power), pebbles are hurled at the foot (abrasion), a notch is cut, and
# the overhang above collapses so the cliff retreats. Then a beach from above: the prevailing wind sends
# the swash up the beach at an angle and the backwash drags straight back down, so one pebble zigzags
# along the coast — longshore drift. The still (reduced motion) is the beach with the zigzag drawn.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'ggcoast'
T = 16.0
W, H = 240, 136
SCENES = [(0.0, 7.6), (7.6, T)]
SEA = 96                     # the sea's surface, from the side
SHORE = 70                   # where the swash reaches, from above
LOW = 112                    # where the backwash leaves the pebble
ZIG = [(26 + 26 * k, k) for k in range(8)]
DRIFT = (8.2, 15.0)


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
    (0.2, 2.6, '<b class="ggcoast-k">Hydraulic power</b><i class="ggcoast-ln">waves force air into cracks; the pressure breaks the rock</i>'),
    (2.6, 5.0, '<b class="ggcoast-k">Abrasion</b><i class="ggcoast-ln">pebbles hurled by the waves wear the cliff away</i>'),
    (5.0, 7.6, '<b class="ggcoast-k">A notch, then collapse</b><i class="ggcoast-ln">the overhang falls and the cliff retreats</i>'),
    (7.6, 11.4, '<b class="ggcoast-k">Swash up at an angle</b><i class="ggcoast-ln">the prevailing wind drives waves up the beach</i>'),
    (11.4, T, '<b class="ggcoast-k">Longshore drift</b><i class="ggcoast-ln">backwash runs straight down, so pebbles move along</i>'),
]
STILL = len(CAPS) - 1

# the zigzag: up the beach with the wind, straight back down, again and again
pts = [(14, LOW)]
for x, k in ZIG[:5]:
    pts += [(pts[-1][0] + 24, SHORE + 4), (pts[-1][0] + 24, LOW)]
trail = 'M' + ' L'.join('%d %d' % p for p in pts)

s = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
# ---- THE CLIFF, FROM THE SIDE.
s.append('      <g class="%s-sc %s-sc0">' % (P, P))
s.append('        <rect class="%s-sea" x="0" y="%d" width="%d" height="%d"/>' % (P, SEA, W, H - SEA))
s.append('        <path class="%s-rock" d="M172 30 H240 V136 H150 V%d L166 %d Z"/>' % (P, SEA + 10, SEA - 14))
s.append('        <path class="%s-rock %s-drop" d="M150 30 H172 L166 %d H150 Z"/>' % (P, P, SEA - 14))
s.append('        <path class="%s-hole %s-notch" d="M150 %d Q166 %d 150 %d Z"/>' % (P, P, SEA - 14, SEA - 2, SEA + 10))
s.append('        <path class="%s-crack" d="M150 %d l8 -4 l-3 -6 l9 -3"/>' % (P, SEA - 8))
s.append('        <path class="%s-burst" d="M156 %d l3 -8 l2 6 l6 -4 l-2 7 l7 1 l-7 4 l3 6 l-7 -3 l-2 7 l-2 -7 l-7 2 l4 -6 z"/>' % (P, SEA - 4))
for k in range(3):
    s.append('        <path class="%s-wave %s-w%d" d="M6 %d q10 -16 22 -4 q-6 -2 -6 4 z"/>' % (P, P, k, SEA + 2))
for k in range(3):
    s.append('        <circle class="%s-peb %s-p%d" cx="%d" cy="%d" r="3"/>' % (P, P, k, 60 + 14 * k, SEA + 4 - 3 * k))
s.append('        <text class="%s-lab" x="190" y="20">cliff</text>' % P)
s.append('      </g>')
# ---- THE BEACH, FROM ABOVE.
s.append('      <g class="%s-sc %s-sc1">' % (P, P))
s.append('        <rect class="%s-sea" x="0" y="0" width="%d" height="%d"/>' % (P, W, SHORE + 8))
s.append('        <rect class="%s-sand" x="0" y="%d" width="%d" height="%d"/>' % (P, SHORE + 8, W, H - SHORE - 8))
s.append('        <path class="%s-wind" d="M14 10 L46 42 M36 42 H46 V32"/>' % P)
s.append('        <text class="%s-lab %s-l" x="52" y="20">prevailing wind</text>' % (P, P))
s.append('        <path class="%s-trail" pathLength="1" d="%s"/>' % (P, trail))
s.append('        <circle class="%s-peb %s-go" cx="14" cy="%d" r="4"/>' % (P, P, LOW))
s.append('        <text class="%s-lab %s-dim" x="30" y="66">swash</text>' % (P, P))
s.append('        <text class="%s-lab %s-dim" x="78" y="128">backwash</text>' % (P, P))
s.append('        <path class="%s-along" d="M150 128 H220 M212 122 L220 128 L212 134"/>' % P)
s.append('      </g>')
s.append('    </svg>')
s.append('    <div class="%s-say">' % P)
for k, (a, b, words) in enumerate(CAPS):
    s.append('      <span class="%s-cap %s-c%d">%s</span>' % (P, P, k, words))
s.append('    </div>')
s.append('  </div>')

c = []
c.append('.an-%s { --ggcoast-sea: #4f86b8; --ggcoast-rock: #8d7a55; --ggcoast-sand: #c9a86a; text-align: center; }' % P)
c.append('.an-%s .%s-svg { display: block; width: min(84vw, 20rem); max-width: 100%%; height: auto; margin: 0 auto; overflow: hidden; }' % (P, P))
c.append('.%s-sea { fill: var(--ggcoast-sea); fill-opacity: .8; }' % P)
c.append('.%s-sand { fill: var(--ggcoast-sand); fill-opacity: .85; }' % P)
c.append('.%s-rock { fill: var(--ggcoast-rock); }' % P)
c.append('.%s-hole { fill: var(--bg); }' % P)
c.append('.%s-crack { fill: none; stroke: var(--bg); stroke-width: 1.4; }' % P)
c.append('.%s-burst { fill: var(--gold); opacity: 0; transform-box: fill-box; transform-origin: center; }' % P)
c.append('.%s-wave { fill: var(--paper); fill-opacity: .85; }' % P)
c.append('.%s-peb { fill: var(--paper); stroke: var(--bg); stroke-width: .6; }' % P)
c.append('.%s-wind, .%s-along { fill: none; stroke: var(--gold); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }' % (P, P))
c.append('.%s-trail { fill: none; stroke: var(--gold); stroke-width: 1.2; stroke-dasharray: 1; stroke-dashoffset: 0; }' % P)
c.append('.%s-lab { font: 700 8px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
c.append('.%s-l { text-anchor: start; }' % P)
c.append('.%s-dim { fill-opacity: .8; font-weight: 400; }' % P)
c.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.8em; align-items: center; font: 400 .85rem/1.3 var(--mono); color: var(--paper); }' % P)
c.append('.%s-cap { grid-area: 1 / 1; }' % P)
c.append('.%s-k { display: block; color: var(--gold); font-size: 1.1em; }' % P)
c.append('.%s-ln { display: block; font-style: normal; opacity: .9; }' % P)
c.append('.%s-notch, .%s-drop { transform-box: fill-box; }' % (P, P))
c.append('.%s-notch { transform-origin: 0%% 50%%; }' % P)
c.append('.%s-drop { transform-origin: 100%% 100%%; }' % P)
c.append('.%s-sc0, .%s-cap:not(.%s-c%d) { opacity: 0; }' % (P, P, P, STILL))
end = (pts[-1][0] - 14, 0)
c.append('.%s-go { transform: translate(%dpx, 0px); }' % (P, end[0]))
for k, (a, b) in enumerate(SCENES):
    c.append('.%s-sc%d { animation: %s-sc%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(window('sc%d' % k, a, b))
for k, (a, b, w) in enumerate(CAPS):
    c.append('.%s-c%d { animation: %s-c%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(window('c%d' % k, a, b))
# the waves roll in on their own beat while the cliff is seen
c.append('.%s-wave { animation: %s-wave 1.8s ease-in infinite; }' % (P, P))
c.append('.%s-w1 { animation-delay: -.6s; }' % P)
c.append('.%s-w2 { animation-delay: -1.2s; }' % P)
c.append('@keyframes %s-wave { 0%% { opacity: 0; transform: translateX(0px); } 15%% { opacity: 1; } 85%% { opacity: 1; } 100%% { opacity: 0; transform: translateX(126px); } }' % P)
c.append('.%s-burst { animation: %s-burst %gs linear infinite; }' % (P, P, T))
c.append(kf('burst', [(0.8, 'opacity: 0; transform: scale(.4);'), (1.0, 'opacity: 1; transform: scale(1.2);'), (1.5, 'opacity: 0; transform: scale(1);'),
                      (1.9, 'opacity: 0; transform: scale(.4);'), (2.1, 'opacity: 1; transform: scale(1.2);'), (2.6, 'opacity: 0; transform: scale(1);')]))
for k in range(3):
    a = 2.8 + 0.6 * k
    c.append('.%s-p%d { animation: %s-p%d %gs ease-in infinite; }' % (P, k, P, k, T))
    c.append(kf('p%d' % k, [(a, 'opacity: 0; transform: translate(0px, 0px);'), (a + 0.1, 'opacity: 1; transform: translate(0px, 0px);'),
                            (a + 0.7, 'opacity: 1; transform: translate(%dpx, -6px);' % (86 - 14 * k)), (a + 1.0, 'opacity: 0; transform: translate(%dpx, 0px);' % (80 - 14 * k))]))
c.append('.%s-notch { animation: %s-notch %gs ease-in-out infinite; }' % (P, P, T))
c.append(kf('notch', [(0.6, 'transform: scaleX(.15);'), (5.4, 'transform: scaleX(1);')]))
c.append('.%s-drop { animation: %s-drop %gs ease-in infinite; }' % (P, P, T))
c.append(kf('drop', [(5.4, 'opacity: 1; transform: translate(0px, 0px) rotate(0deg);'), (6.6, 'opacity: 1; transform: translate(-8px, 54px) rotate(-24deg);'),
                     (7.0, 'opacity: 0; transform: translate(-8px, 60px) rotate(-24deg);')]))
# the pebble: each swash and each backwash takes the same time
legs = len(pts) - 1
step = (DRIFT[1] - DRIFT[0]) / legs
st = [(DRIFT[0], 'transform: translate(0px, 0px);')]
for k in range(1, len(pts)):
    st.append((DRIFT[0] + k * step, 'transform: translate(%dpx, %dpx);' % (pts[k][0] - 14, pts[k][1] - LOW)))
c.append('.%s-go { animation: %s-go %gs ease-in-out infinite; }' % (P, P, T))
c.append(kf('go', st))
c.append('.%s-trail { animation: %s-trail %gs linear infinite; }' % (P, P, T))
c.append(kf('trail', [(DRIFT[0], 'stroke-dashoffset: 1;'), (DRIFT[1], 'stroke-dashoffset: 0;')]))
c.append('@media (prefers-reduced-motion: reduce) {')
c.append('  .an-%s, .an-%s * { animation: none; }' % (P, P))
c.append('}')

anim_row.write_anim('ggcoast', html='\n'.join(s), css='\n'.join(c))
print('%s: %d lines of markup, %d of CSS' % (P, len(s), len(c)))
