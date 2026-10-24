# Four and six-figure grid references (GCSE Geography chapter 14, geographical skills): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the layout or the timeline and re-run:
# python3 tools/gg_grid.py
#
# WHAT IT DRAWS, in one loop of T seconds: a map's grid. Along the corridor to the easting, 45; up the
# stairs to the northing, 72; square 4572 lit — the four-figure reference names the square. Then the map
# zooms into that square, each side splits into tenths, and a marker goes 6 tenths along and 3 up to the
# church: 456 723, the six-figure reference that names a point (the chapter's own worked line). The
# still (reduced motion) is the zoomed square with both references given.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gggrid'
T = 17.0
W, H = 240, 150
MX, MY, S = 40, 10, 24       # the map's top-left corner and one square's side
E0, N0 = 44, 76              # the easting of its left edge and the northing of its top edge
SQ = (MX + S, MY + 3 * S)    # square 4572's top-left: easting 45, its bottom on northing 72
Z = 4                        # the zoom
ZX, ZY = 52, 30              # where the zoomed square's top-left lands
TX, TY = ZX - Z * SQ[0], ZY - Z * SQ[1]
CH = (SQ[0] + 0.6 * S, SQ[1] + S - 0.3 * S)     # the church, at 456 723
ZOOM_IN, ZOOM_OUT = (6.8, 8.2), (16.2, 16.9)


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
    (0.2, 2.6, '<b class="gggrid-k">Along the corridor</b><i class="gggrid-ln">the easting first: the line on the square\'s left, 45</i>'),
    (2.6, 4.6, '<b class="gggrid-k">Then up the stairs</b><i class="gggrid-ln">the northing: the line along its bottom, 72</i>'),
    (4.6, 6.8, '<b class="gggrid-k">Four figures: 4572</b><i class="gggrid-ln">names the whole square</i>'),
    (6.8, 9.0, '<b class="gggrid-k">Zoom in</b><i class="gggrid-ln">split each side of the square into tenths</i>'),
    (9.0, 12.2, '<b class="gggrid-k">6 tenths along, 3 up</b><i class="gggrid-ln">45 and 6, then 72 and 3</i>'),
    (12.2, T, '<b class="gggrid-k">Six figures: 456 723</b><i class="gggrid-ln">names a point: the church</i>'),
]
STILL = len(CAPS) - 1

s = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H),
     '      <defs><clipPath id="%s-frame"><rect x="%d" y="%d" width="%d" height="%d"/></clipPath></defs>' % (P, MX, MY, 5 * S, 5 * S)]
s.append('      <rect class="%s-paper" x="%d" y="%d" width="%d" height="%d"/>' % (P, MX, MY, 5 * S, 5 * S))
s.append('      <g clip-path="url(#%s-frame)">' % P)
s.append('        <g class="%s-zoom">' % P)
s.append('          <path class="%s-river" d="M%d 60 C70 70 90 40 120 54 S150 90 %d 84"/>' % (P, MX, MX + 5 * S))
s.append('          <path class="%s-road" d="M%d 24 L%d 122"/>' % (P, MX, MX + 5 * S))
for x, y in ((128, 112), (136, 106), (124, 104), (60, 24), (66, 30)):
    s.append('          <circle class="%s-wood" cx="%d" cy="%d" r="5"/>' % (P, x, y))
s.append('          <rect class="%s-sq" x="%d" y="%d" width="%d" height="%d"/>' % (P, SQ[0], SQ[1], S, S))
for k in range(6):
    s.append('          <path class="%s-gl" d="M%d %d V%d"/>' % (P, MX + S * k, MY, MY + 5 * S))
    s.append('          <path class="%s-gl" d="M%d %d H%d"/>' % (P, MX, MY + S * k, MX + 5 * S))
s.append('          <path class="%s-hot %s-he" d="M%d %d V%d"/>' % (P, P, SQ[0], MY, MY + 5 * S))
s.append('          <path class="%s-hot %s-hn" d="M%d %d H%d"/>' % (P, P, MX, SQ[1] + S, MX + 5 * S))
s.append('          <path class="%s-church" d="M%.1f %.1f v-3.2 m-1.2 1 h2.4"/>' % (P, CH[0], CH[1] - 1.2))
s.append('          <circle class="%s-church %s-dot" cx="%.1f" cy="%.1f" r="1.2"/>' % (P, P, CH[0], CH[1]))
s.append('        </g>')
s.append('      </g>')
# the labels of the whole map, which go when it zooms
s.append('      <g class="%s-far">' % P)
for k in range(6):
    s.append('        <text class="%s-num %s-e%d" x="%d" y="%d">%d</text>' % (P, P, k, MX + S * k, MY + 5 * S + 10, E0 + k))
    s.append('        <text class="%s-num %s-n%d" x="%d" y="%d">%d</text>' % (P, P, k, MX - 8, MY + S * k + 3, N0 - k))
s.append('        <circle class="%s-mk %s-m1" cx="%d" cy="%d" r="3"/>' % (P, P, MX, MY + 5 * S + 3))
s.append('        <circle class="%s-mk %s-m2" cx="%d" cy="%d" r="3"/>' % (P, P, MX - 3, MY + 5 * S))
s.append('      </g>')
# the tenths, in the zoomed square's own place on the screen
s.append('      <g class="%s-near">' % P)
for k in range(11):
    x = ZX + Z * S * k / 10.0
    y = ZY + Z * S - Z * S * k / 10.0
    tall = 5 if k in (0, 5, 10) else 3
    s.append('        <path class="%s-tick" d="M%.1f %d v%d M%d %.1f h-%d"/>' % (P, x, ZY + Z * S, tall, ZX, y, tall))
s.append('        <text class="%s-num" x="%d" y="%d">45</text>' % (P, ZX, ZY + Z * S + 13))
s.append('        <text class="%s-num" x="%d" y="%d">46</text>' % (P, ZX + Z * S, ZY + Z * S + 13))
s.append('        <text class="%s-num" x="%d" y="%d">72</text>' % (P, ZX - 10, ZY + Z * S + 3))
s.append('        <text class="%s-num" x="%d" y="%d">73</text>' % (P, ZX - 10, ZY + 3))
s.append('        <path class="%s-walk %s-w1" pathLength="1" d="M%d %d H%.1f"/>' % (P, P, ZX, ZY + Z * S, ZX + Z * S * .6))
s.append('        <path class="%s-walk %s-w2" pathLength="1" d="M%.1f %d V%.1f"/>' % (P, P, ZX + Z * S * .6, ZY + Z * S, ZY + Z * S * .7))
s.append('        <circle class="%s-pin" cx="%.1f" cy="%.1f" r="6"/>' % (P, ZX + Z * S * .6, ZY + Z * S * .7))
s.append('      </g>')
s.append('      <text class="%s-say4" x="%d" y="62">4572</text>' % (P, 200))
s.append('      <text class="%s-say6" x="%d" y="92">456 723</text>' % (P, 200))
s.append('    </svg>')
s.append('    <div class="%s-say">' % P)
for k, (a, b, words) in enumerate(CAPS):
    s.append('      <span class="%s-cap %s-c%d">%s</span>' % (P, P, k, words))
s.append('    </div>')
s.append('  </div>')

c = []
c.append('.an-%s { --gggrid-water: #5b9bd5; --gggrid-wood: #6b8f4e; text-align: center; }' % P)
c.append('.an-%s .%s-svg { display: block; width: min(84vw, 20rem); max-width: 100%%; height: auto; margin: 0 auto; overflow: hidden; }' % (P, P))
c.append('.%s-paper { fill: var(--paper); fill-opacity: .1; }' % P)
c.append('.%s-zoom { transform-box: view-box; transform-origin: 0px 0px; transform: translate(%dpx, %dpx) scale(%d); }' % (P, TX, TY, Z))
c.append('.%s-river { fill: none; stroke: var(--gggrid-water); stroke-width: 3; vector-effect: non-scaling-stroke; }' % P)
c.append('.%s-road { stroke: var(--gold); stroke-opacity: .55; stroke-width: 2; vector-effect: non-scaling-stroke; }' % P)
c.append('.%s-wood { fill: var(--gggrid-wood); fill-opacity: .7; }' % P)
c.append('.%s-gl { stroke: var(--paper); stroke-opacity: .5; stroke-width: 1; vector-effect: non-scaling-stroke; }' % P)
c.append('.%s-hot { stroke: var(--gold); stroke-width: 2; vector-effect: non-scaling-stroke; opacity: 0; }' % P)
c.append('.%s-sq { fill: var(--gold); fill-opacity: .18; stroke: var(--gold); stroke-width: 2; vector-effect: non-scaling-stroke; }' % P)
c.append('.%s-church { fill: none; stroke: var(--paper); stroke-width: 1.4; vector-effect: non-scaling-stroke; }' % P)
c.append('.%s-dot { fill: var(--paper); }' % P)
c.append('.%s-num { font: 700 8px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
c.append('.%s-mk { fill: var(--gold); }' % P)
c.append('.%s-tick { stroke: var(--paper); stroke-width: 1; }' % P)
c.append('.%s-walk { fill: none; stroke: var(--gold); stroke-width: 1.6; stroke-dasharray: 1; stroke-dashoffset: 0; }' % P)
c.append('.%s-pin { fill: none; stroke: var(--gold); stroke-width: 2; transform-box: fill-box; transform-origin: center; }' % P)
c.append('.%s-say4, .%s-say6 { font: 700 13px var(--mono); fill: var(--gold); text-anchor: middle; }' % (P, P))
c.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.8em; align-items: center; font: 400 .85rem/1.3 var(--mono); color: var(--paper); }' % P)
c.append('.%s-cap { grid-area: 1 / 1; }' % P)
c.append('.%s-k { display: block; color: var(--gold); font-size: 1.1em; }' % P)
c.append('.%s-ln { display: block; font-style: normal; opacity: .9; }' % P)
c.append('.%s-far, .%s-cap:not(.%s-c%d) { opacity: 0; }' % (P, P, P, STILL))
for k, (a, b, w) in enumerate(CAPS):
    c.append('.%s-c%d { animation: %s-c%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(window('c%d' % k, a, b))
zin = 'transform: translate(%dpx, %dpx) scale(%d);' % (TX, TY, Z)
zout = 'transform: translate(0px, 0px) scale(1);'
c.append('.%s-zoom { animation: %s-zoom %gs ease-in-out infinite; }' % (P, P, T))
c.append(kf('zoom', [(ZOOM_IN[0], zout), (ZOOM_IN[1], zin), (ZOOM_OUT[0], zin), (ZOOM_OUT[1], zout)]))
c.append('.%s-far { animation: %s-far %gs linear infinite; }' % (P, P, T))
c.append(kf('far', [(0.0, 'opacity: 1;'), (ZOOM_IN[0], 'opacity: 1;'), (ZOOM_IN[0] + 0.5, 'opacity: 0;'), (ZOOM_OUT[1] - 0.3, 'opacity: 0;'), (ZOOM_OUT[1], 'opacity: 1;')]))
c.append('.%s-near { animation: %s-near %gs linear infinite; }' % (P, P, T))
c.append(kf('near', [(ZOOM_IN[1], 'opacity: 0;'), (ZOOM_IN[1] + 0.5, 'opacity: 1;'), (ZOOM_OUT[0], 'opacity: 1;'), (ZOOM_OUT[0] + 0.3, 'opacity: 0;')]))
c.append('.%s-m1 { animation: %s-m1 %gs ease-in-out infinite; }' % (P, P, T))
c.append(kf('m1', [(0.4, 'transform: translateX(0px); opacity: 1;'), (2.2, 'transform: translateX(%dpx); opacity: 1;' % S), (6.4, 'transform: translateX(%dpx); opacity: 1;' % S), (6.8, 'transform: translateX(%dpx); opacity: 0;' % S), (T - 0.3, 'transform: translateX(0px); opacity: 0;'), (T, 'transform: translateX(0px); opacity: 1;')]))
c.append('.%s-m2 { opacity: 0; animation: %s-m2 %gs ease-in-out infinite; }' % (P, P, T))
c.append(kf('m2', [(2.6, 'transform: translateY(0px); opacity: 0;'), (2.8, 'transform: translateY(0px); opacity: 1;'), (4.4, 'transform: translateY(-%dpx); opacity: 1;' % S), (6.4, 'transform: translateY(-%dpx); opacity: 1;' % S), (6.8, 'transform: translateY(-%dpx); opacity: 0;' % S)]))
c.append('.%s-he { animation: %s-he %gs linear infinite; }' % (P, P, T))
c.append(kf('he', [(1.8, 'opacity: 0;'), (2.2, 'opacity: 1;'), (6.6, 'opacity: 1;'), (7.0, 'opacity: 0;')]))
c.append('.%s-hn { animation: %s-hn %gs linear infinite; }' % (P, P, T))
c.append(kf('hn', [(4.0, 'opacity: 0;'), (4.4, 'opacity: 1;'), (6.6, 'opacity: 1;'), (7.0, 'opacity: 0;')]))
c.append('.%s-sq { animation: %s-sq %gs linear infinite; }' % (P, P, T))
c.append(kf('sq', [(4.6, 'fill-opacity: 0; stroke-opacity: 0;'), (5.0, 'fill-opacity: .18; stroke-opacity: 1;'), (T - 0.4, 'fill-opacity: .18; stroke-opacity: 1;'), (T, 'fill-opacity: 0; stroke-opacity: 0;')]))
c.append('.%s-say4 { animation: %s-say4 %gs linear infinite; }' % (P, P, T))
c.append(kf('say4', [(4.6, 'opacity: 0;'), (5.0, 'opacity: 1;'), (T - 0.4, 'opacity: 1;'), (T, 'opacity: 0;')]))
c.append('.%s-w1 { animation: %s-w1 %gs linear infinite; }' % (P, P, T))
c.append(kf('w1', [(9.2, 'stroke-dashoffset: 1;'), (10.6, 'stroke-dashoffset: 0;')]))
c.append('.%s-w2 { animation: %s-w2 %gs linear infinite; }' % (P, P, T))
c.append(kf('w2', [(10.6, 'stroke-dashoffset: 1;'), (11.8, 'stroke-dashoffset: 0;')]))
c.append('.%s-pin { animation: %s-pin %gs ease-out infinite; }' % (P, P, T))
c.append(kf('pin', [(11.8, 'opacity: 0; transform: scale(2);'), (12.3, 'opacity: 1; transform: scale(1);')]))
c.append('.%s-say6 { animation: %s-say6 %gs linear infinite; }' % (P, P, T))
c.append(kf('say6', [(12.2, 'opacity: 0;'), (12.6, 'opacity: 1;'), (T - 0.4, 'opacity: 1;'), (T, 'opacity: 0;')]))
c.append('@media (prefers-reduced-motion: reduce) {')
c.append('  .an-%s, .an-%s * { animation: none; }' % (P, P))
c.append('}')

anim_row.write_anim('gggrid', html='\n'.join(s), css='\n'.join(c))
print('%s: %d lines of markup, %d of CSS' % (P, len(s), len(c)))
