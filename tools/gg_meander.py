# From meander to ox-bow lake, over time (GCSE Geography chapter 7, river landscapes): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the layout or the timeline and re-run:
# python3 tools/gg_meander.py
#
# WHAT IT DRAWS, in one loop of T seconds, the river from above at five moments years apart, each fading
# into the next: a gentle bend; the bend growing as the fast flow on the outside erodes a river cliff
# and the slow flow on the inside deposits a slip-off slope; the loop so tight its neck is narrow; a
# flood cutting through the neck; and deposition sealing the old bend off as an ox-bow lake. The line
# of fastest flow runs along each picture. The still (reduced motion) is the last: the lake made.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'ggmeander'
T = 17.0
W, H = 240, 130
# (from, to) of each picture's time on screen; they overlap by the fade
STAGES = [(0.0, 3.4), (3.0, 6.8), (6.4, 10.2), (9.8, 13.4), (13.0, T)]
STILL = 4

RIVERS = [
    'M0 98 C60 98 70 70 120 70 C170 70 180 98 240 98',
    'M0 106 C60 106 90 100 90 86 C90 70 70 62 70 46 C70 28 94 22 120 22 C146 22 170 28 170 46 C170 62 150 70 150 86 C150 100 180 106 240 106',
    'M0 108 C60 108 104 106 104 94 C104 78 64 70 64 46 C64 22 92 14 120 14 C148 14 176 22 176 46 C176 70 136 78 136 94 C136 106 180 108 240 108',
    'M0 108 C60 108 104 106 104 94 C104 78 64 70 64 46 C64 22 92 14 120 14 C148 14 176 22 176 46 C176 70 136 78 136 94 C136 106 180 108 240 108',
    'M0 108 H240',
]
CUT = 'M0 108 H240'                                        # the flood's new straight course
LAKE = 'M106 90 C102 76 64 70 64 46 C64 22 92 14 120 14 C148 14 176 22 176 46 C176 70 138 76 134 90'  # the old bend, cut off


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
    '<b class="ggmeander-k">A gentle bend</b><i class="ggmeander-ln">the fastest flow swings to the outside</i>',
    '<b class="ggmeander-k">The bend grows</b><i class="ggmeander-ln">erosion outside: river cliff; deposition inside: slip-off slope</i>',
    '<b class="ggmeander-k">A narrow neck</b><i class="ggmeander-ln">the two outsides erode towards each other</i>',
    '<b class="ggmeander-k">A flood cuts through</b><i class="ggmeander-ln">the river takes the shortest course</i>',
    '<b class="ggmeander-k">Ox-bow lake</b><i class="ggmeander-ln">deposition seals off the old bend</i>',
]

s = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
s.append('      <rect class="%s-land" x="0" y="0" width="%d" height="%d"/>' % (P, W, H))
for k, d in enumerate(RIVERS):
    s.append('      <g class="%s-st %s-st%d">' % (P, P, k))
    if k == 3:
        s.append('        <path class="%s-water" d="%s"/>' % (P, CUT))
        s.append('        <path class="%s-flood" d="M100 108 C108 96 132 96 140 108"/>' % P)
    if k == 4:
        s.append('        <path class="%s-water %s-lake" d="%s"/>' % (P, P, LAKE))
        s.append('        <path class="%s-silt" d="M98 100 Q104 86 112 98 Z M128 98 Q136 86 142 100 Z"/>' % P)
        s.append('        <text class="%s-lab" x="120" y="50">ox-bow lake</text>' % P)
    s.append('        <path class="%s-water" d="%s"/>' % (P, d))
    if k != 4:
        s.append('        <path class="%s-fast" d="%s"/>' % (P, d))
    if k == 1:
        s.append('        <path class="%s-silt" d="M98 96 C94 70 100 40 120 34 C140 40 146 70 142 96 Z"/>' % P)
        s.append('        <text class="%s-lab" x="120" y="10">river cliff</text>' % P)
        s.append('        <text class="%s-lab %s-dark" x="120" y="66">slip-off</text>' % (P, P))
        s.append('        <text class="%s-lab %s-dark" x="120" y="76">slope</text>' % (P, P))
    s.append('      </g>')
s.append('      <path class="%s-arrow" d="M8 122 H40 M34 117 L40 122 L34 127"/>' % P)
s.append('      <text class="%s-lab %s-l" x="46" y="125">flow</text>' % (P, P))
s.append('    </svg>')
s.append('    <div class="%s-say">' % P)
for k, words in enumerate(CAPS):
    s.append('      <span class="%s-cap %s-c%d">%s</span>' % (P, P, k, words))
s.append('    </div>')
s.append('  </div>')

c = []
c.append('.an-%s { --ggmeander-land: #4e6b3a; --ggmeander-water: #5b9bd5; --ggmeander-silt: #c9a86a; text-align: center; }' % P)
c.append('.an-%s .%s-svg { display: block; width: min(84vw, 20rem); max-width: 100%%; height: auto; margin: 0 auto; overflow: hidden; border-radius: 4px; }' % (P, P))
c.append('.%s-land { fill: var(--ggmeander-land); fill-opacity: .55; }' % P)
c.append('.%s-water { fill: none; stroke: var(--ggmeander-water); stroke-width: 14; stroke-linecap: butt; }' % P)
c.append('.%s-lake { stroke-width: 12; stroke-linecap: round; }' % P)
c.append('.%s-flood { fill: none; stroke: var(--ggmeander-water); stroke-width: 14; }' % P)
c.append('.%s-fast { fill: none; stroke: var(--paper); stroke-opacity: .85; stroke-width: 1.4; stroke-dasharray: 4 6; }' % P)
c.append('.%s-silt { fill: var(--ggmeander-silt); }' % P)
c.append('.%s-arrow { fill: none; stroke: var(--gold); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }' % P)
c.append('.%s-lab { font: 700 9px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
c.append('.%s-dark { fill: var(--bg); font-size: 7.5px; }' % P)
c.append('.%s-l { text-anchor: start; }' % P)
c.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.8em; align-items: center; font: 400 .85rem/1.3 var(--mono); color: var(--paper); }' % P)
c.append('.%s-cap { grid-area: 1 / 1; }' % P)
c.append('.%s-k { display: block; color: var(--gold); font-size: 1.1em; }' % P)
c.append('.%s-ln { display: block; font-style: normal; opacity: .9; }' % P)
c.append('.%s-st:not(.%s-st%d), .%s-cap:not(.%s-c%d) { opacity: 0; }' % (P, P, STILL, P, P, STILL))
for k, (a, b) in enumerate(STAGES):
    c.append('.%s-st%d { animation: %s-st%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append('.%s-c%d { animation: %s-c%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(window('c%d' % k, a + (0.4 if k else 0.0), b))
    if k == 0:
        c.append(kf('st0', [(0.0, 'opacity: 1;'), (b - 0.4, 'opacity: 1;'), (b, 'opacity: 0;'), (T - 0.4, 'opacity: 0;'), (T, 'opacity: 1;')]))
    else:
        c.append(window('st%d' % k, a, b))
c.append('.%s-fast { animation: %s-fast 1.2s linear infinite; }' % (P, P))
c.append('@keyframes %s-fast { 0%% { stroke-dashoffset: 10; } 100%% { stroke-dashoffset: 0; } }' % P)
c.append('.%s-flood { animation: %s-flood %gs ease-in infinite; }' % (P, P, T))
c.append(kf('flood', [(10.0, 'opacity: 0;'), (11.0, 'opacity: 1;'), (12.6, 'opacity: 1;'), (13.2, 'opacity: 0;')]))
c.append('@media (prefers-reduced-motion: reduce) {')
c.append('  .an-%s, .an-%s * { animation: none; }' % (P, P))
c.append('}')

anim_row.write_anim('ggmeander', html='\n'.join(s), css='\n'.join(c))
print('%s: %d lines of markup, %d of CSS' % (P, len(s), len(c)))
