# Earthquake waves (GCSE Geography chapter 1, tectonic hazards): writes its row of data/textbooks.json
# through tools/anim_row.py. Edit the layout or the timeline and re-run: python3 tools/gg_quake.py
#
# WHAT IT DRAWS, in one loop of T seconds: a slice through the ground at a conservative margin where
# the rock has stuck and now slips. The focus flashes underground and the epicentre is marked on the
# surface above it. P waves leave first and fastest, S waves follow, and surface waves roll out last
# and shake the houses hardest — while a seismograph at the top draws each arrival in turn, small,
# bigger, biggest. The still (reduced motion) is the finished trace with every wave labelled.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'ggquake'
T = 15.0
W, H = 240, 150
GY = 64                      # the ground's surface
FX, FY = 120, 126            # the focus
TRY = 24                     # the seismograph's rest line


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


def draw(name, a, b, end=T - 0.4):
    """a line drawn from nothing between a and b (pathLength 1), held, and gone at the loop's end."""
    return kf(name, [(a, 'stroke-dashoffset: 1; opacity: 1;'), (b, 'stroke-dashoffset: 0; opacity: 1;'),
                     (end, 'stroke-dashoffset: 0; opacity: 1;'), (end + 0.3, 'stroke-dashoffset: 0; opacity: 0;')])


def wiggle(x0, x1, amp, step):
    d, x, up = 'M%g %g' % (x0, TRY), x0, -1
    while x + step <= x1:
        d += ' L%g %g' % (x + step / 2, TRY + up * amp)
        x += step; up = -up
    return d + ' L%g %g' % (x1, TRY)


WAVES = [  # (class, start, end of its spread, label)
    ('p0', 3.4, 5.4), ('p1', 3.9, 5.9),
    ('s0', 6.4, 9.4), ('s1', 7.0, 10.0),
]
TRACE = [('t0', 12, 72, 2.5, 6, 3.6, 5.6, 'P'), ('t1', 72, 140, 7, 7, 6.6, 9.0, 'S'), ('t2', 140, 230, 13, 9, 9.6, 12.4, 'surface')]
SURF = (9.4, 12.6)

CAPS = [
    (0.2, 2.2, '<b class="ggquake-k">Focus</b><i class="ggquake-ln">where the stuck rock breaks and slips</i>'),
    (2.2, 3.6, '<b class="ggquake-k">Epicentre</b><i class="ggquake-ln">on the surface, right above the focus</i>'),
    (3.6, 6.4, '<b class="ggquake-k">P waves first</b><i class="ggquake-ln">fastest: push and pull</i>'),
    (6.4, 9.6, '<b class="ggquake-k">S waves next</b><i class="ggquake-ln">slower: side to side</i>'),
    (9.6, T, '<b class="ggquake-k">Surface waves last</b><i class="ggquake-ln">the biggest shaking and most damage</i>'),
]
STILL = len(CAPS) - 1

s = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H),
     '      <defs><clipPath id="%s-under"><rect x="0" y="%d" width="%d" height="%d"/></clipPath></defs>' % (P, GY, W, H - GY)]
s.append('      <rect class="%s-paper" x="6" y="4" width="%d" height="40" rx="3"/>' % (P, W - 12))
s.append('      <path class="%s-rest" d="M12 %d H%d"/>' % (P, TRY, W - 10))
for c, x0, x1, amp, step, a, b, lab in TRACE:
    s.append('      <path class="%s-tr %s-%s" pathLength="1" d="%s"/>' % (P, P, c, wiggle(x0, x1, amp, step)))
    s.append('      <text class="%s-tl %s-%sl" x="%g" y="%d">%s</text>' % (P, P, c, (x0 + x1) / 2, 41, lab))
s.append('      <rect class="%s-rock" x="0" y="%d" width="%d" height="%d"/>' % (P, GY, W, H - GY))
s.append('      <path class="%s-fault" d="M%d %d L%d %d"/>' % (P, FX - 8, H, FX + 4, GY))
s.append('      <g clip-path="url(#%s-under)">' % P)
for c, a, b in WAVES:
    s.append('        <circle class="%s-w %s-%s %s-%s" cx="%d" cy="%d" r="120"/>' % (P, P, c[0], P, c, FX, FY))
s.append('      </g>')
s.append('      <path class="%s-ground" d="M0 %d H%d"/>' % (P, GY, W))
for c, sign in (('sl', -1), ('sr', 1)):
    s.append('      <path class="%s-surf %s-%s" d="M%d %d q4 -5 8 0 t8 0 t8 0 t8 0"/>' % (P, P, c, FX - 16, GY))
for c, x in (('h0', 34), ('h1', 196)):
    s.append('      <path class="%s-house %s-%s" d="M%d %d v-12 l9 -8 l9 8 v12 z"/>' % (P, P, c, x, GY))
s.append('      <path class="%s-epi" d="M%d %d l-5 -9 h10 z"/>' % (P, FX, GY))
s.append('      <text class="%s-lab %s-epil" x="%d" y="%d">epicentre</text>' % (P, P, FX + 30, GY - 4))
s.append('      <path class="%s-focus" d="M%d %d l3 -7 l2 5 l6 -3 l-2 6 l7 1 l-6 3 l3 6 l-7 -2 l-2 6 l-2 -6 l-6 2 l3 -6 z"/>' % (P, FX - 3, FY + 1))
s.append('      <text class="%s-lab" x="%d" y="%d">focus</text>' % (P, FX + 26, FY + 4))
s.append('    </svg>')
s.append('    <div class="%s-say">' % P)
for k, (a, b, words) in enumerate(CAPS):
    s.append('      <span class="%s-cap %s-c%d">%s</span>' % (P, P, k, words))
s.append('    </div>')
s.append('  </div>')

c = []
c.append('.an-%s { --ggquake-p: #6fa8dc; --ggquake-rock: #8d7a55; text-align: center; }' % P)
c.append('.an-%s .%s-svg { display: block; width: min(84vw, 20rem); max-width: 100%%; height: auto; margin: 0 auto; overflow: hidden; }' % (P, P))
c.append('.%s-paper { fill: var(--paper); fill-opacity: .08; stroke: var(--paper); stroke-opacity: .35; }' % P)
c.append('.%s-rest { stroke: var(--paper); stroke-opacity: .25; stroke-width: .6; }' % P)
c.append('.%s-tr { fill: none; stroke: var(--paper); stroke-width: 1.2; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 0; }' % P)
c.append('.%s-t0 { stroke: var(--ggquake-p); }' % P)
c.append('.%s-t1 { stroke: var(--gold); }' % P)
c.append('.%s-tl { font: 700 7px var(--mono); fill: var(--paper); fill-opacity: .8; text-anchor: middle; }' % P)
c.append('.%s-rock { fill: var(--ggquake-rock); fill-opacity: .35; }' % P)
c.append('.%s-fault { stroke: var(--paper); stroke-opacity: .5; stroke-width: 1; stroke-dasharray: 3 2; }' % P)
c.append('.%s-ground { stroke: var(--paper); stroke-width: 1.5; }' % P)
c.append('.%s-w { fill: none; transform-box: fill-box; transform-origin: center; opacity: 0; }' % P)
c.append('.%s-p { stroke: var(--ggquake-p); stroke-width: 1.4; stroke-dasharray: 2 3; }' % P)
c.append('.%s-s { stroke: var(--gold); stroke-width: 2.6; }' % P)
c.append('.%s-surf { fill: none; stroke: var(--paper); stroke-width: 2; stroke-linecap: round; opacity: 0; }' % P)
c.append('.%s-house { fill: var(--paper); fill-opacity: .85; transform-box: fill-box; transform-origin: 50%% 100%%; }' % P)
c.append('.%s-epi { fill: var(--gold); }' % P)
c.append('.%s-focus { fill: var(--gold); transform-box: fill-box; transform-origin: center; }' % P)
c.append('.%s-lab { font: 700 8px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
c.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.8em; align-items: center; font: 400 .85rem/1.3 var(--mono); color: var(--paper); }' % P)
c.append('.%s-say > span { grid-area: 1 / 1; }' % P)
c.append('.%s-k { display: block; color: var(--gold); font-size: 1.1em; }' % P)
c.append('.%s-ln { display: block; font-style: normal; opacity: .9; }' % P)
c.append('.%s-say > span:not(.%s-c%d) { opacity: 0; }' % (P, P, STILL))
for k, (a, b, w) in enumerate(CAPS):
    c.append('.%s-c%d { animation: %s-c%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(window('c%d' % k, a, b))
c.append('.%s-focus { animation: %s-focus %gs ease-out infinite; }' % (P, P, T))
c.append(kf('focus', [(0.2, 'transform: scale(.3);'), (0.6, 'transform: scale(1.5);'), (1.2, 'transform: scale(1);'),
                      (3.3, 'transform: scale(1);'), (3.5, 'transform: scale(1.4);'), (3.9, 'transform: scale(1);')]))
c.append('.%s-epi, .%s-epil { animation: %s-epi %gs linear infinite; }' % (P, P, P, T))
c.append(kf('epi', [(2.2, 'opacity: 0;'), (2.6, 'opacity: 1;'), (T - 0.4, 'opacity: 1;'), (T, 'opacity: 0;')]))
for cl, a, b in WAVES:
    c.append('.%s-%s { animation: %s-%s %gs %s infinite; }' % (P, cl, P, cl, T, 'linear'))
    c.append(kf(cl, [(a, 'opacity: 0; transform: scale(.04);'), (a + 0.1, 'opacity: 1; transform: scale(.06);'),
                     (b - 0.4, 'opacity: .7; transform: scale(.85);'), (b, 'opacity: 0; transform: scale(1);')]))
for cl, x0, x1, amp, step, a, b, lab in TRACE:
    c.append('.%s-%s { animation: %s-%s %gs linear infinite; }' % (P, cl, P, cl, T))
    c.append(draw(cl, a, b))
    c.append('.%s-%sl { animation: %s-%sl %gs linear infinite; }' % (P, cl, P, cl, T))
    c.append(kf(cl + 'l', [(a, 'opacity: 0;'), (a + 0.4, 'opacity: 1;'), (T - 0.4, 'opacity: 1;'), (T, 'opacity: 0;')]))
for cl, sign in (('sl', -1), ('sr', 1)):
    c.append('.%s-%s { animation: %s-%s %gs linear infinite; }' % (P, cl, P, cl, T))
    st = []
    for k in range(2):
        a = SURF[0] + k * 1.6
        st += [(a, 'opacity: 0; transform: translateX(0px);'), (a + 0.2, 'opacity: 1; transform: translateX(%gpx);' % (sign * 8)),
               (a + 1.5, 'opacity: 0; transform: translateX(%gpx);' % (sign * 92))]
    c.append(kf(cl, st))
shake = [(SURF[0] + 0.6, 'transform: rotate(0deg);')]
t, k = SURF[0] + 0.6, 0
while t < SURF[1]:
    t += 0.15; k += 1
    shake.append((t, 'transform: rotate(%gdeg);' % (6 if k % 2 else -6)))
shake.append((t + 0.15, 'transform: rotate(0deg);'))
for cl in ('h0', 'h1'):
    c.append('.%s-%s { animation: %s-shake %gs linear infinite; }' % (P, cl, P, T))
c.append(kf('shake', shake))
c.append('@media (prefers-reduced-motion: reduce) {')
c.append('  .an-%s, .an-%s * { animation: none; }' % (P, P))
c.append('}')

anim_row.write_anim('ggquake', html='\n'.join(s), css='\n'.join(c))
print('%s: %d lines of markup, %d of CSS' % (P, len(s), len(c)))
