# The three plate margins (GCSE Geography chapter 1, tectonic hazards): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the layout or the timeline and re-run:
# python3 tools/gg_plates.py
#
# WHAT IT DRAWS, in one loop of T seconds, a margin at a time, each a slice through the crust:
# constructive (two plates pull apart and magma rises into the gap), destructive (a thin, dense oceanic
# plate slides under a thick continental one, melts, and feeds a volcano) and conservative (seen from
# above: two plates slide past, stick, then slip with a jolt — an earthquake and no volcano). The still
# (reduced motion) is the destructive margin, the one that does most harm.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'ggplate'
T = 18.0
W, H = 240, 132
SCENES = [(0.0, 6.0), (6.0, 12.0), (12.0, T)]     # constructive, destructive, conservative
STILL = 1


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


def move(name, a, b, dx, dy, hold=0.0):
    """from rest at `a` to (dx, dy) at `b`, held there, and back at rest for the next loop."""
    return kf(name, [(a, 'transform: translate(0px, 0px);'), (b, 'transform: translate(%gpx, %gpx);' % (dx, dy))])


CAPS = [
    (0.3, 6.0, '<b class="ggplate-k">Constructive</b><i class="ggplate-ln">plates move apart; magma rises into the gap</i>'),
    (6.0, 12.0, '<b class="ggplate-k">Destructive</b><i class="ggplate-ln">oceanic plate sinks and melts: volcanoes, earthquakes</i>'),
    (12.0, T, '<b class="ggplate-k">Conservative</b><i class="ggplate-ln">plates slide past, stick, then slip: earthquakes only</i>'),
]

s = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
# ---- CONSTRUCTIVE: two plates pull apart over a magma chamber; a ridge of new crust fills the gap.
s.append('      <g class="%s-sc %s-sc0">' % (P, P))
s.append('        <rect class="%s-mantle" x="0" y="64" width="%d" height="%d"/>' % (P, W, H - 64))
s.append('        <path class="%s-magma %s-rise" d="M104 132 C104 96 112 72 120 50 C128 72 136 96 136 132 Z"/>' % (P, P))
s.append('        <rect class="%s-ocean %s-cl" x="6" y="44" width="110" height="20"/>' % (P, P))
s.append('        <rect class="%s-ocean %s-cr" x="124" y="44" width="110" height="20"/>' % (P, P))
s.append('        <path class="%s-arrow %s-cl" d="M74 34 H30 M38 28 L30 34 L38 40"/>' % (P, P))
s.append('        <path class="%s-arrow %s-cr" d="M166 34 H210 M202 28 L210 34 L202 40"/>' % (P, P))
s.append('        <text class="%s-lab" x="120" y="22">ridge</text>' % P)
s.append('        <text class="%s-lab %s-dim" x="40" y="104">mantle</text>' % (P, P))
s.append('      </g>')
# ---- DESTRUCTIVE: the oceanic plate dives under the continental one; melting feeds a volcano.
s.append('      <g class="%s-sc %s-sc1">' % (P, P))
s.append('        <rect class="%s-mantle" x="0" y="64" width="%d" height="%d"/>' % (P, W, H - 64))
s.append('        <path class="%s-ocean %s-dive" d="M-30 46 H118 C130 46 140 52 150 60 L196 104 L186 112 L140 70 C132 63 124 62 116 62 H-30 Z"/>' % (P, P))
s.append('        <path class="%s-cont" d="M128 40 L160 40 L172 20 L178 20 L190 40 L240 40 V80 H176 L150 58 C142 50 136 48 128 48 Z"/>' % P)
s.append('        <circle class="%s-magma %s-melt" cx="182" cy="92" r="7"/>' % (P, P))
s.append('        <path class="%s-magma %s-up" d="M172 82 C176 64 176 40 175 22 L178 22 C180 40 182 64 188 82 Z"/>' % (P, P))
s.append('        <path class="%s-ash %s-puff" d="M170 16 C166 8 172 2 178 6 C182 0 190 4 188 10 C194 12 190 18 184 16 Z"/>' % (P, P))
s.append('        <path class="%s-quake %s-jolt" d="M146 62 l4 -8 l2 6 l6 -4 l-2 7 l7 1 l-7 4 l3 6 l-7 -3 l-2 7 l-2 -7 l-7 2 l4 -6 z"/>' % (P, P))
s.append('        <path class="%s-arrow" d="M30 34 H78 M70 28 L78 34 L70 40"/>' % P)
s.append('        <text class="%s-lab" x="50" y="24">oceanic</text>' % P)
s.append('        <text class="%s-lab" x="206" y="56">continental</text>' % P)
s.append('      </g>')
# ---- CONSERVATIVE, FROM ABOVE: two plates either side of a fault, sliding opposite ways in jerks.
s.append('      <g class="%s-sc %s-sc2">' % (P, P))
s.append('        <g class="%s-slipl"><rect class="%s-cont" x="-40" y="16" width="320" height="44"/>' % (P, P))
for x in range(-30, 280, 30):
    s.append('          <rect class="%s-field" x="%d" y="28" width="16" height="20"/>' % (P, x))
s.append('        </g>')
s.append('        <g class="%s-slipr"><rect class="%s-cont %s-alt" x="-40" y="62" width="320" height="44"/>' % (P, P, P))
for x in range(-15, 280, 30):
    s.append('          <rect class="%s-field" x="%d" y="74" width="16" height="20"/>' % (P, x))
s.append('        </g>')
s.append('        <path class="%s-fault" d="M0 61 H%d"/>' % (P, W))
s.append('        <path class="%s-quake %s-jolt2" d="M114 52 l4 -8 l2 6 l6 -4 l-2 7 l7 1 l-7 4 l3 6 l-7 -3 l-2 7 l-2 -7 l-7 2 l4 -6 z"/>' % (P, P))
s.append('        <path class="%s-arrow" d="M150 10 H106 M114 4 L106 10 L114 16"/>' % P)
s.append('        <path class="%s-arrow" d="M90 116 H134 M126 110 L134 116 L126 122"/>' % P)
s.append('        <text class="%s-lab %s-dim" x="40" y="128">seen from above</text>' % (P, P))
s.append('      </g>')
s.append('    </svg>')
s.append('    <div class="%s-say">' % P)
for k, (a, b, words) in enumerate(CAPS):
    s.append('      <span class="%s-s %s-c%d">%s</span>' % (P, P, k, words))
s.append('    </div>')
s.append('  </div>')

c = []
c.append('.an-%s { --ggplate-magma: #e8663a; --ggplate-sea: #4f86b8; --ggplate-land: #8d7a55; text-align: center; }' % P)
c.append('.an-%s .%s-svg { display: block; width: min(84vw, 20rem); max-width: 100%%; height: auto; margin: 0 auto; overflow: hidden; }' % (P, P))
c.append('.%s-mantle { fill: var(--ggplate-magma); fill-opacity: .16; }' % P)
c.append('.%s-magma { fill: var(--ggplate-magma); }' % P)
c.append('.%s-ocean { fill: var(--ggplate-sea); stroke: var(--paper); stroke-opacity: .5; stroke-width: .8; }' % P)
c.append('.%s-cont { fill: var(--ggplate-land); stroke: var(--paper); stroke-opacity: .5; stroke-width: .8; }' % P)
c.append('.%s-alt { fill-opacity: .75; }' % P)
c.append('.%s-field { fill: var(--paper); fill-opacity: .14; }' % P)
c.append('.%s-fault { stroke: var(--gold); stroke-width: 1.4; stroke-dasharray: 5 3; fill: none; }' % P)
c.append('.%s-arrow { fill: none; stroke: var(--gold); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }' % P)
c.append('.%s-ash { fill: var(--paper); fill-opacity: .5; }' % P)
c.append('.%s-quake { fill: var(--gold); }' % P)
c.append('.%s-lab { font: 700 9px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
c.append('.%s-dim { fill-opacity: .6; font-weight: 400; }' % P)
c.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.8em; align-items: center; font: 400 .85rem/1.3 var(--mono); color: var(--paper); }' % P)
c.append('.%s-s { grid-area: 1 / 1; }' % P)
c.append('.%s-k { display: block; color: var(--gold); font-size: 1.1em; }' % P)
c.append('.%s-ln { display: block; font-style: normal; opacity: .9; }' % P)
# THE STILL: the destructive slice and its caption; everything else waits unseen.
c.append('.%s-sc:not(.%s-sc%d), .%s-s:not(.%s-c%d) { opacity: 0; }' % (P, P, STILL, P, P, STILL))
c.append('.%s-rise, .%s-up, .%s-melt { transform-box: fill-box; transform-origin: 50%% 100%%; }' % (P, P, P))
c.append('.%s-jolt, .%s-jolt2, .%s-puff { transform-box: fill-box; transform-origin: center; }' % (P, P, P))
for k, (a, b) in enumerate(SCENES):
    c.append('.%s-sc%d { animation: %s-sc%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(window('sc%d' % k, a, b))
for k, (a, b, w) in enumerate(CAPS):
    c.append('.%s-c%d { animation: %s-c%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(window('c%d' % k, a, b))
# constructive: the plates part by 8 each side, and the magma swells up into the gap behind them
c.append('.%s-cl { animation: %s-cl %gs ease-in-out infinite; }' % (P, P, T))
c.append(move('cl', 0.6, 5.4, -8, 0))
c.append('.%s-cr { animation: %s-cr %gs ease-in-out infinite; }' % (P, P, T))
c.append(move('cr', 0.6, 5.4, 8, 0))
c.append('.%s-rise { animation: %s-rise %gs ease-in-out infinite; }' % (P, P, T))
c.append(kf('rise', [(0.6, 'transform: scaleY(.55);'), (5.4, 'transform: scaleY(1);')]))
# destructive: the slab slides in and down along its dip; the melt grows, rises, and the volcano puffs
c.append('.%s-dive { animation: %s-dive %gs linear infinite; }' % (P, P, T))
c.append(move('dive', 6.0, 12.0, 14, 0))
c.append('.%s-melt { animation: %s-melt %gs ease-in-out infinite; }' % (P, P, T))
c.append(kf('melt', [(6.8, 'transform: scale(.2);'), (8.6, 'transform: scale(1);')]))
c.append('.%s-up { animation: %s-up %gs ease-out infinite; }' % (P, P, T))
c.append(kf('up', [(8.4, 'transform: scaleY(0);'), (9.8, 'transform: scaleY(1);')]))
c.append('.%s-puff { animation: %s-puff %gs ease-out infinite; }' % (P, P, T))
c.append(kf('puff', [(9.6, 'opacity: 0; transform: scale(.3);'), (10.4, 'opacity: 1; transform: scale(1);'), (11.6, 'opacity: .7; transform: scale(1.3) translateY(-2px);')]))
c.append('.%s-jolt { animation: %s-jolt %gs linear infinite; }' % (P, P, T))
c.append(kf('jolt', [(7.5, 'opacity: 0; transform: scale(.4);'), (7.7, 'opacity: 1; transform: scale(1.2);'), (8.3, 'opacity: 0; transform: scale(1);'),
                     (10.5, 'opacity: 0; transform: scale(.4);'), (10.7, 'opacity: 1; transform: scale(1.2);'), (11.3, 'opacity: 0; transform: scale(1);')]))
# conservative: stick, stick, then a sudden slip of 10 — twice — with a flash at each slip
STEPS = [(12.4, 13.9, 14.1), (14.6, 16.1, 16.3)]
def jerk(sign):
    st, off = [(12.0, 'transform: translateX(0px);')], 0
    for a, b, e in STEPS:
        st.append((b, 'transform: translateX(%gpx);' % (sign * (off + 1))))
        off += 10
        st.append((e, 'transform: translateX(%gpx);' % (sign * off)))
    return st
c.append('.%s-slipl { animation: %s-slipl %gs linear infinite; }' % (P, P, T))
c.append(kf('slipl', jerk(-1)))
c.append('.%s-slipr { animation: %s-slipr %gs linear infinite; }' % (P, P, T))
c.append(kf('slipr', jerk(1)))
c.append('.%s-jolt2 { opacity: 0; animation: %s-jolt2 %gs linear infinite; }' % (P, P, T))
fl = []
for a, b, e in STEPS:
    fl += [(b, 'opacity: 0; transform: scale(.4);'), (e, 'opacity: 1; transform: scale(1.25);'), (e + 0.6, 'opacity: 0; transform: scale(1);')]
c.append(kf('jolt2', fl))
c.append('@media (prefers-reduced-motion: reduce) {')
c.append('  .an-%s, .an-%s * { animation: none; }' % (P, P))
c.append('}')

anim_row.write_anim('ggplate', html='\n'.join(s), css='\n'.join(c))
print('%s: %d lines of markup, %d of CSS' % (P, len(s), len(c)))
