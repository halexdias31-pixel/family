# The demographic transition model (GCSE Geography chapter 10, the development gap): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the layout or the timeline and re-run:
# python3 tools/gg_dtm.py
#
# WHAT IT DRAWS, in one loop of T seconds: the DTM's graph drawn stage by stage, left to right — birth
# rate, death rate and total population — with a band lighting the stage being told and the gap between
# births and deaths (natural increase) shaded. Stage 1 high and high; 2 deaths fall, population soars;
# 3 births fall; 4 both low; 5 births below deaths and the population falls. The still (reduced motion)
# is the whole graph with stage 2 lit, where the population grows fastest.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'ggdtm'
T = 16.0
W, H = 240, 134
X0, X1, Y0, Y1 = 26, 226, 22, 112        # the plot: left, right, top, the zero line
COL = (X1 - X0) / 5.0
DRAW = (0.4, 14.4)
STILL = 1

BIRTH = [(0, 12), (.3, 10), (.6, 12), (1.0, 11), (1.6, 12), (2.0, 13), (2.5, 30), (3.0, 55), (3.5, 66), (4.0, 70), (4.5, 76), (5.0, 80)]
DEATH = [(0, 14), (.2, 8), (.4, 18), (.6, 10), (.8, 16), (1.0, 13), (1.5, 38), (2.0, 56), (2.5, 64), (3.0, 68), (4.0, 72), (4.5, 70), (5.0, 66)]
POP = [(0, 86), (1.0, 84), (1.5, 76), (2.0, 64), (2.5, 46), (3.0, 32), (3.5, 24), (4.0, 22), (4.5, 24), (5.0, 28)]


def xy(p): return (X0 + COL * p[0], Y0 + p[1])


def smooth(pts):
    """a Catmull-Rom curve through the points, as cubic Béziers."""
    q = [xy(p) for p in pts]
    d = 'M%.1f %.1f' % q[0]
    for i in range(len(q) - 1):
        p0, p1, p2 = q[max(i - 1, 0)], q[i], q[i + 1]
        p3 = q[min(i + 2, len(q) - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += ' C%.1f %.1f %.1f %.1f %.1f %.1f' % (c1 + c2 + p2)
    return d


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


STAGE_T = [(DRAW[0] + k * (DRAW[1] - DRAW[0]) / 5, DRAW[0] + (k + 1) * (DRAW[1] - DRAW[0]) / 5) for k in range(5)]
CAPS = [
    '<b class="ggdtm-k">Stage 1</b><i class="ggdtm-ln">high births and deaths: population low, steady</i>',
    '<b class="ggdtm-k">Stage 2</b><i class="ggdtm-ln">death rate falls (clean water, medicine): it soars</i>',
    '<b class="ggdtm-k">Stage 3</b><i class="ggdtm-ln">birth rate falls (contraception, careers): growth slows</i>',
    '<b class="ggdtm-k">Stage 4</b><i class="ggdtm-ln">both low: population high and steady</i>',
    '<b class="ggdtm-k">Stage 5</b><i class="ggdtm-ln">births below deaths: the population falls</i>',
]

# the gap between the lines, births over deaths: natural increase
gap = [xy(p) for p in BIRTH] + [xy(p) for p in reversed(DEATH)]

s = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
s.append('      <rect class="%s-band" x="%g" y="%d" width="%g" height="%d"/>' % (P, X0, Y0 - 4, COL, Y1 - Y0 + 4))
for k in range(1, 5):
    s.append('      <path class="%s-grid" d="M%g %d V%d"/>' % (P, X0 + COL * k, Y0 - 4, Y1))
s.append('      <path class="%s-axis" d="M%d %d V%d H%d"/>' % (P, X0, Y0 - 6, Y1, X1))
for k in range(5):
    s.append('      <text class="%s-num" x="%g" y="%d">%d</text>' % (P, X0 + COL * (k + .5), Y1 + 10, k + 1))
s.append('      <text class="%s-num %s-dim" x="%g" y="%d">stage</text>' % (P, P, X0 + 2, Y1 + 20))
s.append('      <polygon class="%s-gap" points="%s"/>' % (P, ' '.join('%.1f,%.1f' % p for p in gap)))
s.append('      <path class="%s-cv %s-pop" pathLength="1" d="%s"/>' % (P, P, smooth(POP)))
s.append('      <path class="%s-cv %s-birth" pathLength="1" d="%s"/>' % (P, P, smooth(BIRTH)))
s.append('      <path class="%s-cv %s-death" pathLength="1" d="%s"/>' % (P, P, smooth(DEATH)))
for k, (cl, x, lab) in enumerate((('birth', 30, 'birth rate'), ('death', 104, 'death rate'), ('pop', 176, 'population'))):
    s.append('      <path class="%s-key %s-%s" d="M%d 7 H%d"/>' % (P, P, cl, x, x + 10))
    s.append('      <text class="%s-num %s-l" x="%d" y="9.5">%s</text>' % (P, P, x + 13, lab))
s.append('    </svg>')
s.append('    <div class="%s-say">' % P)
for k, words in enumerate(CAPS):
    s.append('      <span class="%s-cap %s-c%d">%s</span>' % (P, P, k, words))
s.append('    </div>')
s.append('  </div>')

c = []
c.append('.an-%s { --ggdtm-death: #e0605a; text-align: center; }' % P)
c.append('.an-%s .%s-svg { display: block; width: min(84vw, 20rem); max-width: 100%%; height: auto; margin: 0 auto; overflow: hidden; }' % (P, P))
c.append('.%s-band { fill: var(--gold); fill-opacity: .14; transform: translateX(%gpx); }' % (P, COL * STILL))
c.append('.%s-grid { stroke: var(--paper); stroke-opacity: .18; stroke-width: .6; }' % P)
c.append('.%s-axis { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1; }' % P)
c.append('.%s-num { font: 700 8px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
c.append('.%s-l { text-anchor: start; font-weight: 400; }' % P)
c.append('.%s-dim { fill-opacity: .6; font-weight: 400; text-anchor: start; }' % P)
c.append('.%s-gap { fill: var(--gold); fill-opacity: .16; }' % P)
c.append('.%s-cv { fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 0; }' % P)
c.append('.%s-key { stroke-width: 2.2; }' % P)
c.append('.%s-birth { stroke: var(--gold); }' % P)
c.append('.%s-death { stroke: var(--ggdtm-death); }' % P)
c.append('.%s-pop { stroke: var(--paper); stroke-width: 3.2; }' % P)
c.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.8em; align-items: center; font: 400 .85rem/1.3 var(--mono); color: var(--paper); }' % P)
c.append('.%s-cap { grid-area: 1 / 1; }' % P)
c.append('.%s-k { display: block; color: var(--gold); font-size: 1.1em; }' % P)
c.append('.%s-ln { display: block; font-style: normal; opacity: .9; }' % P)
c.append('.%s-cap:not(.%s-c%d) { opacity: 0; }' % (P, P, STILL))
for k, (a, b) in enumerate(STAGE_T):
    c.append('.%s-c%d { animation: %s-c%d %gs linear infinite; }' % (P, k, P, k, T))
    c.append(window('c%d' % k, a if k else 0.0, b if k < 4 else T))
band = []
for k, (a, b) in enumerate(STAGE_T):
    band += [(a, 'transform: translateX(%gpx);' % (COL * k)), (b - 0.35, 'transform: translateX(%gpx);' % (COL * k))]
c.append('.%s-band { animation: %s-band %gs ease-in-out infinite; }' % (P, P, T))
c.append(kf('band', band + [(T - 0.3, 'transform: translateX(%gpx);' % (COL * 4)), (T, 'transform: translateX(0px);')]))
c.append('.%s-pop, .%s-birth.%s-cv, .%s-death.%s-cv { animation: %s-draw %gs linear infinite; }' % (P, P, P, P, P, P, T))
c.append(kf('draw', [(DRAW[0], 'stroke-dashoffset: 1; opacity: 1;'), (DRAW[1], 'stroke-dashoffset: 0; opacity: 1;'),
                     (T - 0.4, 'stroke-dashoffset: 0; opacity: 1;'), (T - 0.05, 'stroke-dashoffset: 0; opacity: 0;'), (T, 'stroke-dashoffset: 1; opacity: 0;')]))
c.append('.%s-gap { animation: %s-gap %gs linear infinite; }' % (P, P, T))
c.append(kf('gap', [(STAGE_T[3][0], 'opacity: 0;'), (STAGE_T[3][0] + 1.2, 'opacity: 1;'), (T - 0.4, 'opacity: 1;'), (T, 'opacity: 0;')]))
c.append('@media (prefers-reduced-motion: reduce) {')
c.append('  .an-%s, .an-%s * { animation: none; }' % (P, P))
c.append('}')

anim_row.write_anim('ggdtm', html='\n'.join(s), css='\n'.join(c))
print('%s: %d lines of markup, %d of CSS' % (P, len(s), len(c)))
