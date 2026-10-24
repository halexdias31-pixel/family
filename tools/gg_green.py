# The greenhouse effect, natural then enhanced (GCSE Geography chapter 3, climate change): writes its row
# of data/textbooks.json through tools/anim_row.py. Edit the layout or the timeline and re-run:
# python3 tools/gg_green.py
#
# WHAT IT DRAWS, in one loop of T seconds: short-wave sunlight passing straight through the atmosphere
# to the ground; the warm ground giving off long-wave heat; greenhouse gases in the atmosphere sending
# some of it back down, while the rest escapes to space. Then more gas — from burning fossil fuels,
# cattle and deforestation — so more heat comes back than escapes, and the thermometer climbs. The
# still (reduced motion) is the enhanced picture with its thermometer high.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gggreen'
T = 16.0
W, H = 240, 140
SCENES = [(0.0, 8.0), (8.0, T)]
BAND = (40, 66)              # the atmosphere's greenhouse layer, top and bottom
GROUND = 116


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


WAVE = 'q2 -3 0 -6 t0 -6 t0 -6'          # a long-wave squiggle, drawn upwards from its foot
GAS0 = [(70, 50), (104, 58), (138, 47), (170, 56), (200, 49)]
GAS1 = [(54, 58), (88, 46), (122, 54), (154, 45), (186, 60), (214, 54), (40, 47)]
# (x of its foot, delay) — the natural loop: two escape, one comes back; the enhanced: one escapes, three come back
OUT0 = [('e', 112, 0.0), ('e', 168, -1.1), ('b', 140, -0.6)]
OUT1 = [('e', 168, 0.0), ('b', 112, -0.4), ('b', 140, -1.0), ('b', 196, -1.6)]

CAPS = [
    (0.2, 2.8, '<b class="gggreen-k">Sunlight in</b><i class="gggreen-ln">short-wave radiation passes through the air</i>'),
    (2.8, 5.4, '<b class="gggreen-k">Heat out</b><i class="gggreen-ln">the warm ground gives off long-wave radiation</i>'),
    (5.4, 8.0, '<b class="gggreen-k">Greenhouse gases trap some</b><i class="gggreen-ln">and send it back: warm enough for life</i>'),
    (8.0, 11.6, '<b class="gggreen-k">More gas from people</b><i class="gggreen-ln">fossil fuels, cattle, cutting down forests</i>'),
    (11.6, T, '<b class="gggreen-k">Enhanced greenhouse effect</b><i class="gggreen-ln">more heat is trapped, so the Earth warms</i>'),
]
STILL = len(CAPS) - 1

s = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
s.append('      <circle class="%s-sun" cx="22" cy="20" r="12"/>' % P)
s.append('      <rect class="%s-band" x="0" y="%d" width="%d" height="%d"/>' % (P, BAND[0], W, BAND[1] - BAND[0]))
s.append('      <text class="%s-lab %s-dim" x="232" y="36">atmosphere</text>' % (P, P))
s.append('      <rect class="%s-ground" x="0" y="%d" width="%d" height="%d"/>' % (P, GROUND, W, H - GROUND))
for k, (x, y) in enumerate(GAS0):
    s.append('      <circle class="%s-gas" cx="%d" cy="%d" r="3"/>' % (P, x, y))
s.append('      <g class="%s-more">' % P)
for k, (x, y) in enumerate(GAS1):
    s.append('        <circle class="%s-gas" cx="%d" cy="%d" r="3"/>' % (P, x, y))
s.append('      </g>')
for k, dl in enumerate((0.0, -0.7, -1.4)):
    s.append('      <path class="%s-sw %s-sw%d" d="M%d %d l10 13"/>' % (P, P, k, 30 + 8 * k, 30))
for sc, outs in ((0, OUT0), (1, OUT1)):
    s.append('      <g class="%s-sc %s-sc%d">' % (P, P, sc))
    for k, (kind, x, dl) in enumerate(outs):
        s.append('        <path class="%s-lw %s-%s %s-l%d%d" d="M%d %d %s"/>' % (P, P, kind, P, sc, k, x, GROUND - 2, WAVE))
    s.append('      </g>')
s.append('      <rect class="%s-tube" x="226" y="72" width="7" height="40" rx="3.5"/>' % P)
s.append('      <rect class="%s-merc" x="228" y="74" width="3" height="36" rx="1.5"/>' % P)
s.append('      <circle class="%s-bulb" cx="229.5" cy="114" r="5"/>' % P)
s.append('    </svg>')
s.append('    <div class="%s-say">' % P)
for k, (a, b, words) in enumerate(CAPS):
    s.append('      <span class="%s-cap %s-c%d">%s</span>' % (P, P, k, words))
s.append('    </div>')
s.append('  </div>')

c = []
c.append('.an-%s { --gggreen-sun: #ffd166; --gggreen-heat: #e8663a; --gggreen-land: #6b8f4e; text-align: center; }' % P)
c.append('.an-%s .%s-svg { display: block; width: min(84vw, 20rem); max-width: 100%%; height: auto; margin: 0 auto; overflow: hidden; }' % (P, P))
c.append('.%s-sun { fill: var(--gggreen-sun); }' % P)
c.append('.%s-band { fill: var(--paper); fill-opacity: .1; }' % P)
c.append('.%s-ground { fill: var(--gggreen-land); fill-opacity: .7; }' % P)
c.append('.%s-gas { fill: var(--paper); fill-opacity: .8; }' % P)
c.append('.%s-sw { stroke: var(--gggreen-sun); stroke-width: 2.2; stroke-linecap: round; }' % P)
c.append('.%s-lw { fill: none; stroke: var(--gggreen-heat); stroke-width: 2; stroke-linecap: round; }' % P)
c.append('.%s-tube { fill: none; stroke: var(--paper); stroke-opacity: .7; }' % P)
c.append('.%s-merc, .%s-bulb { fill: var(--gggreen-heat); }' % (P, P))
c.append('.%s-merc { transform-box: fill-box; transform-origin: 50%% 100%%; transform: scaleY(.8); }' % P)
c.append('.%s-lab { font: 700 8px var(--mono); fill: var(--paper); text-anchor: end; }' % P)
c.append('.%s-dim { fill-opacity: .6; font-weight: 400; }' % P)
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
c.append('.%s-more { animation: %s-more %gs linear infinite; }' % (P, P, T))
c.append(kf('more', [(8.4, 'opacity: 0;'), (9.4, 'opacity: 1;'), (T - 0.4, 'opacity: 1;'), (T, 'opacity: 0;')]))
c.append('.%s-merc { animation: %s-merc %gs ease-in-out infinite; }' % (P, P, T))
c.append(kf('merc', [(0.0, 'transform: scaleY(.45);'), (9.0, 'transform: scaleY(.45);'), (14.5, 'transform: scaleY(.85);'), (T - 0.3, 'transform: scaleY(.85);'), (T, 'transform: scaleY(.45);')]))
# the short loops: sunlight runs in from the sun to the ground; heat squiggles go up and out, or up and back
c.append('.%s-sw { animation: %s-sw 2.1s linear infinite; }' % (P, P))
c.append('.%s-sw1 { animation-delay: -.7s; }' % P)
c.append('.%s-sw2 { animation-delay: -1.4s; }' % P)
c.append('@keyframes %s-sw { 0%% { opacity: 0; transform: translate(0px, 0px); } 10%% { opacity: 1; } 85%% { opacity: 1; } 100%% { opacity: 0; transform: translate(%dpx, %dpx); } }' % (P, 64, 70))
c.append('.%s-e { animation: %s-e 2.2s linear infinite; }' % (P, P))
c.append('@keyframes %s-e { 0%% { opacity: 0; transform: translateY(0px); } 10%% { opacity: 1; } 80%% { opacity: 1; } 100%% { opacity: 0; transform: translateY(-112px); } }' % P)
c.append('.%s-b { animation: %s-b 2.2s linear infinite; }' % (P, P))
c.append('@keyframes %s-b { 0%% { opacity: 0; transform: translateY(0px) scaleY(1); } 10%% { opacity: 1; } 48%% { transform: translateY(-%dpx) scaleY(1); } 52%% { transform: translateY(-%dpx) scaleY(-1); } 90%% { opacity: 1; } 100%% { opacity: 0; transform: translateY(-8px) scaleY(-1); } }' % (P, GROUND - BAND[1] + 4, GROUND - BAND[1] + 4))
c.append('.%s-b { transform-box: fill-box; transform-origin: 50%% 50%%; }' % P)
for sc, outs in ((0, OUT0), (1, OUT1)):
    for k, (kind, x, dl) in enumerate(outs):
        if dl: c.append('.%s-l%d%d { animation-delay: %gs; }' % (P, sc, k, dl))
c.append('@media (prefers-reduced-motion: reduce) {')
c.append('  .an-%s, .an-%s * { animation: none; }' % (P, P))
c.append('}')

anim_row.write_anim('gggreen', html='\n'.join(s), css='\n'.join(c))
print('%s: %d lines of markup, %d of CSS' % (P, len(s), len(c)))
