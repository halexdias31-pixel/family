# Contour lines to a 3D hill and a cross-section (GCSE Geography chapter 14, geographical skills): writes
# its row of data/textbooks.json through tools/anim_row.py. Edit the layout or the timeline and re-run:
# python3 tools/gg_contour.py
#
# WHAT IT DRAWS, in one loop of T seconds: a hill as four contour rings, 50 m apart, closer together on
# its east side. The rings lift into stacked layers so the hill stands up, then settle flat again. A
# line A–B is drawn across them; from each place a contour crosses it a line drops to its height on a
# graph below, the points are joined, and the profile shows the steep side where the contours were
# close. The still (reduced motion) is the finished cross-section under the flat map.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'ggcontour'
T = 16.0
W, H = 240, 160
LY = 46                       # the section line A–B on the map
RINGS = [(50, 104, 90, 26), (100, 120, 62, 19), (150, 134, 38, 13), (200, 144, 16, 7)]   # (height, cx, rx, ry)
GB, GS = 150, 0.26            # the graph's 0 m line and its pixels per metre
LIFT = (0.6, 4.6)             # the hill stands up and settles again
DROP = (6.4, 10.0)            # the drop lines fall, one after another
JOIN = (10.4, 12.6)           # the profile is drawn


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


# where each ring crosses A–B, west to east, with its height
cross = sorted([(cx - rx, h) for h, cx, rx, ry in RINGS] + [(cx + rx, h) for h, cx, rx, ry in RINGS])
top = (148, 222)
prof = [(14, 30)] + cross[:4] + [top] + cross[4:] + [(226, 30)]
gy = lambda h: GB - GS * h

CAPS = [
    (0.2, 4.8, '<b class="ggcontour-k">Contour lines</b><i class="ggcontour-ln">lines of equal height, here every 50 m</i>'),
    (4.8, 6.4, '<b class="ggcontour-k">A line across</b><i class="ggcontour-ln">from A to B over the hill</i>'),
    (6.4, 10.2, '<b class="ggcontour-k">Drop each crossing</b><i class="ggcontour-ln">to its height on the graph below</i>'),
    (10.2, T, '<b class="ggcontour-k">The cross-section</b><i class="ggcontour-ln">contours close together: the steep side</i>'),
]
STILL = len(CAPS) - 1

s = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
s.append('      <g class="%s-hill">' % P)
for k, (h, cx, rx, ry) in enumerate(RINGS):
    s.append('        <g class="%s-lay %s-r%d">' % (P, P, k))
    s.append('          <ellipse class="%s-ring" cx="%d" cy="%d" rx="%d" ry="%d"/>' % (P, cx, LY, rx, ry))
    s.append('          <text class="%s-h" x="%d" y="%d">%d</text>' % (P, cx - rx + 9, LY + 3, h))
    s.append('        </g>')
s.append('      </g>')
s.append('      <g class="%s-ab">' % P)
s.append('        <path class="%s-line" d="M14 %d H226"/>' % (P, LY))
s.append('        <text class="%s-lab" x="8" y="%d">A</text>' % (P, LY + 3))
s.append('        <text class="%s-lab" x="232" y="%d">B</text>' % (P, LY + 3))
s.append('      </g>')
s.append('      <path class="%s-axis" d="M14 %d V%d H226"/>' % (P, gy(250), GB))
for h in (100, 200):
    s.append('      <text class="%s-h %s-ax" x="12" y="%.1f">%d</text>' % (P, P, gy(h) + 3, h))
for k, (x, h) in enumerate(cross):
    s.append('      <path class="%s-drop %s-d%d" pathLength="1" d="M%d %d V%.1f"/>' % (P, P, k, x, LY, gy(h)))
    s.append('      <circle class="%s-pt %s-p%d" cx="%d" cy="%.1f" r="2"/>' % (P, P, k, x, gy(h)))
s.append('      <path class="%s-prof" pathLength="1" d="M%s"/>' % (P, ' L'.join('%d %.1f' % (x, gy(h)) for x, h in prof)))
s.append('      <text class="%s-lab %s-steep" x="204" y="%.1f">steep</text>' % (P, P, gy(170)))
s.append('      <text class="%s-lab %s-steep" x="56" y="%.1f">gentle</text>' % (P, P, gy(170)))
s.append('    </svg>')
s.append('    <div class="%s-say">' % P)
for k, (a, b, words) in enumerate(CAPS):
    s.append('      <span class="%s-cap %s-c%d">%s</span>' % (P, P, k, words))
s.append('    </div>')
s.append('  </div>')

c = []
c.append('.an-%s { --ggcontour-ring: #c98a4a; text-align: center; }' % P)
c.append('.an-%s .%s-svg { display: block; width: min(84vw, 20rem); max-width: 100%%; height: auto; margin: 0 auto; overflow: hidden; }' % (P, P))
c.append('.%s-hill { transform-box: view-box; transform-origin: 120px %dpx; }' % (P, LY + 26))
c.append('.%s-ring { fill: var(--ggcontour-ring); fill-opacity: .16; stroke: var(--ggcontour-ring); stroke-width: 1.4; }' % P)
c.append('.%s-h { font: 400 6.5px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
c.append('.%s-ax { text-anchor: end; }' % P)
c.append('.%s-line { stroke: var(--gold); stroke-width: 1.4; }' % P)
c.append('.%s-lab { font: 700 8px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
c.append('.%s-axis { fill: none; stroke: var(--paper); stroke-opacity: .6; }' % P)
c.append('.%s-drop { stroke: var(--paper); stroke-opacity: .5; stroke-width: .8; stroke-dasharray: 1; stroke-dashoffset: 0; }' % P)
c.append('.%s-pt { fill: var(--gold); }' % P)
c.append('.%s-prof { fill: none; stroke: var(--gold); stroke-width: 2.2; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 0; }' % P)
c.append('.%s-steep { font-weight: 400; fill-opacity: .85; }' % P)
c.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.8em; align-items: center; font: 400 .85rem/1.3 var(--mono); color: var(--paper); }' % P)
c.append('.%s-cap { grid-area: 1 / 1; }' % P)
c.append('.%s-k { display: block; color: var(--gold); font-size: 1.1em; }' % P)
c.append('.%s-ln { display: block; font-style: normal; opacity: .9; }' % P)
c.append('.%s-cap:not(.%s-c%d) { opacity: 0; }' % (P, P, STILL))
for k, (a, b, w) in enumerate(CAPS):
    c.append('.%s-c%d { animation: %s-c%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(window('c%d' % k, a, b))
# the hill stands up: the map squashed into a slant, and each ring lifted by its height
a, b = LIFT
c.append('.%s-hill { animation: %s-hill %gs ease-in-out infinite; }' % (P, P, T))
c.append(kf('hill', [(a, 'transform: scaleY(1);'), (a + 1.2, 'transform: scaleY(.62);'), (b - 1.2, 'transform: scaleY(.62);'), (b, 'transform: scaleY(1);')]))
for k, (h, cx, rx, ry) in enumerate(RINGS):
    c.append('.%s-r%d { animation: %s-r%d %gs ease-in-out infinite; }' % (P, k, P, k, T))
    up = 'transform: translateY(-%gpx);' % (h * 0.2)
    c.append(kf('r%d' % k, [(a, 'transform: translateY(0px);'), (a + 1.2, up), (b - 1.2, up), (b, 'transform: translateY(0px);')]))
c.append('.%s-ab { animation: %s-ab %gs linear infinite; }' % (P, P, T))
c.append(kf('ab', [(4.8, 'opacity: 0;'), (5.3, 'opacity: 1;'), (T - 0.4, 'opacity: 1;'), (T, 'opacity: 0;')]))
n = len(cross)
for k in range(n):
    t0 = DROP[0] + k * (DROP[1] - DROP[0]) / n
    c.append('.%s-d%d { animation: %s-d%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(kf('d%d' % k, [(t0, 'stroke-dashoffset: 1; opacity: 1;'), (t0 + 0.4, 'stroke-dashoffset: 0; opacity: 1;'), (T - 0.4, 'stroke-dashoffset: 0; opacity: 1;'), (T, 'stroke-dashoffset: 0; opacity: 0;')]))
    c.append('.%s-p%d { animation: %s-p%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(kf('p%d' % k, [(t0 + 0.3, 'opacity: 0;'), (t0 + 0.45, 'opacity: 1;'), (T - 0.4, 'opacity: 1;'), (T, 'opacity: 0;')]))
c.append('.%s-prof { animation: %s-prof %gs linear infinite; }' % (P, P, T))
c.append(kf('prof', [(JOIN[0], 'stroke-dashoffset: 1; opacity: 1;'), (JOIN[1], 'stroke-dashoffset: 0; opacity: 1;'), (T - 0.4, 'stroke-dashoffset: 0; opacity: 1;'), (T, 'stroke-dashoffset: 0; opacity: 0;')]))
c.append('.%s-steep { animation: %s-steep %gs linear infinite; }' % (P, P, T))
c.append(kf('steep', [(JOIN[1], 'opacity: 0;'), (JOIN[1] + 0.4, 'opacity: 1;'), (T - 0.4, 'opacity: 1;'), (T, 'opacity: 0;')]))
c.append('@media (prefers-reduced-motion: reduce) {')
c.append('  .an-%s, .an-%s * { animation: none; }' % (P, P))
c.append('}')

anim_row.write_anim('ggcontour', html='\n'.join(s), css='\n'.join(c))
print('%s: %d lines of markup, %d of CSS' % (P, len(s), len(c)))
