# Germany grows, 1935–1939 (GCSE History chapter 6): writes its row of data/textbooks.json through tools/anim_row.py.
# Edit the borders or the timeline and re-run: python3 tools/h_expand.py
#
# WHAT IT DRAWS, in one loop of T seconds: a sketch map of central Europe (borders simplified from longitude and
# latitude, not surveyed) starting from Germany as Versailles left it, then each step Hitler took, in gold, with its
# date: the Saar votes to return (January 1935), troops into the demilitarised Rhineland (March 1936), Anschluss with
# Austria (March 1938), the Sudetenland after Munich (October 1938), the rest of the Czech lands and Memel (March
# 1939), then Poland invaded (1 September 1939) in red. The still (reduced motion) is the whole map with its last line.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'hexp'
T = 19.0
W, H = 220, 156
END = T - 0.8

def xy(lon, lat): return (lon - 5.5) * 11, (56.0 - lat) * 16

def path(pts):
    return 'M' + 'L'.join('%.1f %.1f' % xy(*p) for p in pts) + 'Z'

GP = [(17.6, 54.8), (17.2, 53.7), (16.4, 53.2), (15.9, 52.6), (16.6, 51.9), (17.6, 51.4), (18.2, 51.2), (18.6, 50.5), (18.3, 50.0)]
CZN = [(18.3, 50.0), (17.6, 50.2), (16.6, 50.2), (16.2, 50.7), (15.0, 51.0), (14.3, 51.0), (13.0, 50.5), (12.1, 50.3)]
CZW = [(12.1, 50.3), (12.4, 49.8), (13.4, 49.0), (13.8, 48.6)]
ATN = [(13.8, 48.6), (12.8, 48.1), (13.0, 47.6), (12.2, 47.6), (11.0, 47.4), (10.2, 47.3), (9.6, 47.5)]
GERMANY = (GP + CZN[1:] + CZW[1:] + ATN[1:] +
           [(8.6, 47.7), (7.6, 47.6), (8.2, 49.0), (7.4, 49.1), (6.4, 49.5), (6.1, 50.2), (6.1, 50.8), (6.0, 51.8), (7.0, 52.2),
            (7.1, 52.6), (7.2, 53.3), (8.0, 53.6), (8.8, 54.0), (8.6, 54.9), (9.9, 54.8), (10.0, 54.5), (11.0, 54.0),
            (12.5, 54.4), (14.2, 53.9), (16.0, 54.3)])
EPRUSSIA = [(19.4, 54.4), (20.0, 54.7), (21.2, 55.2), (22.0, 55.0), (22.8, 54.4), (22.0, 53.5), (20.7, 53.3), (19.6, 53.5), (19.3, 53.9)]
SAAR = [(6.4, 49.5), (7.4, 49.1), (7.4, 49.6), (6.6, 49.7)]
RHINE = [(6.0, 51.8), (6.1, 50.8), (6.1, 50.2), (6.4, 49.5), (7.4, 49.1), (8.2, 49.0), (7.6, 47.6), (8.5, 47.6), (8.9, 48.6),
         (9.0, 50.0), (8.4, 50.7), (7.8, 51.3), (7.5, 52.0), (7.0, 52.2)]
AUSTRIA = ATN[::-1] + [(9.5, 47.1), (10.5, 46.9), (12.4, 46.7), (13.7, 46.5), (14.5, 46.4), (16.1, 46.7), (16.5, 47.0),
                       (17.1, 48.0), (16.9, 48.7), (15.0, 49.0), (14.7, 48.6)]
SUDETEN = (CZN + CZW + [(14.0, 48.6), (15.0, 49.0), (16.9, 48.7), (17.1, 48.6), (16.8, 49.0), (15.0, 49.4), (14.2, 49.1),
           (13.8, 49.4), (13.1, 49.9), (13.0, 50.2), (14.3, 50.6), (15.2, 50.6), (16.3, 50.2), (17.0, 49.8), (17.9, 49.7)])
BOHEMIA = [(17.9, 49.7), (17.0, 49.8), (16.3, 50.2), (15.2, 50.6), (14.3, 50.6), (13.0, 50.2), (13.1, 49.9), (13.8, 49.4),
           (14.2, 49.1), (15.0, 49.4), (16.8, 49.0), (17.1, 48.6), (17.9, 49.0), (18.8, 49.5), (18.3, 50.0)]
SLOVAKIA = [(18.8, 49.5), (19.5, 49.4), (20.9, 49.3), (22.5, 49.1), (22.6, 48.4), (20.5, 48.3), (18.8, 47.8), (17.1, 48.0),
            (17.1, 48.6), (17.9, 49.0)]
MEMEL = [(21.2, 55.2), (21.1, 55.9), (21.7, 55.9), (22.0, 55.0)]
POLAND = (GP[::-1] + [(18.8, 49.5), (19.5, 49.4), (20.9, 49.3), (22.5, 49.1), (23.0, 48.9), (24.6, 48.6), (24.6, 54.0),
          (23.5, 53.9), (22.8, 54.4), (22.0, 53.5), (20.7, 53.3), (19.6, 53.5), (19.3, 53.9), (18.6, 54.4), (18.5, 54.75)])

STEPS = [  # (class, shape, born)
    ('saar', SAAR, 2.6), ('rhine', RHINE, 5.0), ('aus', AUSTRIA, 7.6), ('sud', SUDETEN, 10.0),
    ('boh', BOHEMIA, 12.4), ('mem', MEMEL, 12.4),
]
POLE = 14.8
CAPS = [
    ('c0', 0.2, 2.6, 'Germany after Versailles'),
    ('c1', 2.6, 5.0, 'Jan 1935: the Saar votes<i class="%s-ln">to return to Germany</i>' % P),
    ('c2', 5.0, 7.6, 'Mar 1936: troops march<i class="%s-ln">into the Rhineland</i>' % P),
    ('c3', 7.6, 10.0, 'Mar 1938: Anschluss<i class="%s-ln">with Austria</i>' % P),
    ('c4', 10.0, 12.4, 'Oct 1938: the Sudetenland<i class="%s-ln">given away at Munich</i>' % P),
    ('c5', 12.4, 14.8, 'Mar 1939: the rest of<i class="%s-ln">the Czech lands, and Memel</i>' % P),
    ('c6', 14.8, T, '<b class="%s-g">1 Sep 1939</b>: Poland invaded<i class="%s-ln">Britain and France declare war</i>' % (P, P)),
]
STILL = 'c6'
LABELS = [('GERMANY', 10.8, 51.6, ''), ('POLAND', 20.8, 51.6, 'pl'), ('E. PRUSSIA', 21.0, 54.0, ''), ('AUSTRIA', 14.3, 47.4, ''),
          ('CZECH', 15.3, 49.9, ''), ('SLOVAKIA', 20.3, 48.7, '')]

h = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for c, shape in (('ctx', AUSTRIA), ('ctx', SUDETEN), ('ctx', BOHEMIA), ('ctx', SLOVAKIA), ('ctx', MEMEL)):
    h.append('      <path class="%s-%s" d="%s"/>' % (P, c, path(shape)))
h.append('      <path class="%s-pol" d="%s"/>' % (P, path(POLAND)))
h.append('      <path class="%s-de" d="%s"/>' % (P, path(GERMANY)))
h.append('      <path class="%s-de" d="%s"/>' % (P, path(EPRUSSIA)))
for c, shape, born in STEPS:
    h.append('      <path class="%s-new %s-%s" d="%s"/>' % (P, P, c, path(shape)))
x, y = xy(18.65, 54.35)
h.append('      <circle class="%s-dz" cx="%.1f" cy="%.1f" r="1.6"/>' % (P, x, y))
# the three arrows of 1 September: from Pomerania, from Silesia and Slovakia, from East Prussia
for i, (lon0, lat0, lon1, lat1) in enumerate(((16.0, 52.2, 18.6, 52.2), (17.6, 50.6, 19.6, 51.0), (20.6, 53.8, 20.6, 52.6))):
    a, b = xy(lon0, lat0); c, d = xy(lon1, lat1)
    h.append('      <line class="%s-arw %s-a%d" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (P, P, i, a, b, c, d))
for t, lon, lat, extra in LABELS:
    x, y = xy(lon, lat)
    h.append('      <text class="%s-lab%s" x="%.1f" y="%.1f">%s</text>' % (P, (' %s-%s' % (P, extra)) if extra else '', x, y, t))
h.append('    </svg>')
h.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    h.append('      <span class="%s-t %s-%s">%s</span>' % (P, P, c, html))
h.append('    </div>')
h.append('  </div>')

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d, top=1):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: %s; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), top, pc(d)))

css = []
css.append('.an-%s { --hexp-war: #e0605a; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(86vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-ctx, .%s-pol { fill: var(--paper); fill-opacity: .07; stroke: var(--paper); stroke-opacity: .45; stroke-width: .6; stroke-linejoin: round; }' % (P, P))
css.append('.%s-de { fill: var(--gold); fill-opacity: .32; stroke: var(--gold); stroke-width: .9; stroke-linejoin: round; }' % P)
css.append('.%s-new { fill: var(--gold); fill-opacity: .75; stroke: var(--gold); stroke-width: .9; stroke-linejoin: round; }' % P)
css.append('.%s-rhine { fill-opacity: .5; }' % P)
css.append('.%s-dz { fill: var(--paper); }' % P)
css.append('.%s-arw { stroke: var(--hexp-war); stroke-width: 2.2; stroke-linecap: round; opacity: 0; }' % P)
css.append('.%s-lab { font: 700 5.5px var(--mono); fill: var(--paper); text-anchor: middle; letter-spacing: .04em; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 .98rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-t { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--hexp-war); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; }' % P)
css.append('.%s-t:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
for c, shape, born in STEPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s { opacity: 1; fill: var(--paper); } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
               % (P, c, pc(born), pc(born + 0.4), pc(born + 1.2), pc(END), pc(T)))
css.append('.%s-pol { animation: %s-pol %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-pol { 0%%, %s { fill: var(--paper); fill-opacity: .07; } %s, %s { fill: var(--hexp-war); fill-opacity: .4; } 100%% { fill: var(--paper); fill-opacity: .07; } }'
           % (P, pc(POLE), pc(POLE + 0.6), pc(END)))
for i in range(3):
    css.append('.%s-a%d { animation: %s-a%d %gs ease-in-out infinite; }' % (P, i, P, i, T))
    css.append(fade('a%d' % i, POLE + 0.3 * i, POLE + 0.3 * i + 0.4, END, T))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-new, .%s-t, .%s-arw { animation: none; }' % (P, P, P))
css.append('  .%s-pol { animation: none; fill: var(--hexp-war); fill-opacity: .4; }' % P)
css.append('  .%s-arw { opacity: 1; }' % P)
css.append('}')

anim_row.write_anim('hexp', html='\n'.join(h), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(h), len(css)))
