# The Iron Curtain, 1945–1961 (GCSE History chapter 13): writes its row of data/textbooks.json through tools/anim_row.py.
# Edit the tiles or the timeline and re-run: python3 tools/h_curtain.py
#
# WHAT IT DRAWS, in one loop of T seconds: Europe as a tile map (one square a country, placed roughly where it
# is, so every name can be read on a phone): the Red Army's USSR, then communist governments in Poland, Bulgaria,
# Romania, Hungary, Czechoslovakia (the 1948 coup) and East Germany (1949) turning red; Churchill's Iron Curtain
# drawn from Stettin to Trieste (March 1946); NATO's members turning blue (1949, Greece and Turkey 1952, West
# Germany 1955); the Warsaw Pact (1955); last the Berlin Wall (13 August 1961). Yugoslavia is communist but
# outside the bloc after 1948, so it stays a paler red. The still (reduced motion) is the finished map.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'hcur'
T = 18.0
W, H = 220, 168
END = T - 0.8
S = 24                               # one grid square; a tile is S - 2 wide

# (class, label, col, row, cols, rows, side, born): side is east (satellite), west (NATO), yu or none
TILES = [
    ('no', 'NOR', 4, 0, 1, 1, 'west', 8.6), ('se', 'SWE', 5, 0, 1, 1, 'none', 0), ('fi', 'FIN', 6, 0, 1, 1, 'none', 0),
    ('uk', 'UK', 1, 1, 1, 1, 'west', 8.6), ('dk', 'DEN', 4, 1, 1, 1, 'west', 8.9),
    ('bnl', 'BEN', 2, 2, 1, 1, 'west', 8.9), ('wg', 'W.GER', 3, 2, 1, 1, 'west', 10.0), ('eg', 'E.GER', 4, 2, 1, 1, 'east', 4.8),
    ('pl', 'POL', 5, 2, 1, 1, 'east', 3.0),
    ('fr', 'FRA', 2, 3, 1, 1, 'west', 8.6), ('ch', 'SUI', 3, 3, 1, 1, 'none', 0), ('cz', 'CZE', 4, 3, 1, 1, 'east', 4.4),
    ('pt', 'POR', 0, 4, 1, 1, 'west', 9.2), ('es', 'ESP', 1, 4, 1, 1, 'none', 0), ('it', 'ITA', 3, 4, 1, 1, 'west', 9.2),
    ('at', 'AUT', 4, 4, 1, 1, 'none', 0), ('hu', 'HUN', 5, 4, 1, 1, 'east', 4.0), ('ro', 'ROM', 6, 4, 1, 1, 'east', 3.6),
    ('yu', 'YUG', 4, 5, 1, 1, 'yu', 4.0), ('bg', 'BUL', 6, 5, 1, 1, 'east', 3.3), ('tr', 'TUR', 7, 5, 1, 1, 'west', 9.6),
    ('al', 'ALB', 4, 6, 1, 1, 'east', 3.8), ('gr', 'GRE', 5, 6, 1, 1, 'west', 9.6),
    ('su', 'USSR', 6, 1, 3, 3, 'su', 0),
]
CURTAIN = [(96, 44), (96, 96), (120, 96), (120, 120), (96, 120), (96, 126)]
LINE_AT, PACT, WALL = 5.6, 11.2, 14.0

CAPS = [
    ('c0', 0.2, 2.8, '1945: the Red Army holds<i class="%s-ln">eastern Europe</i>' % P),
    ('c1', 2.8, 5.6, '1945–49: communists take<i class="%s-ln">power, country by country</i>' % P),
    ('c2', 5.6, 8.4, 'March 1946, Churchill:<i class="%s-ln">an <b class="%s-g">Iron Curtain</b>, Stettin to Trieste</i>' % (P, P)),
    ('c3', 8.4, 11.2, '1949: NATO<i class="%s-ln">West Germany joins in 1955</i>' % P),
    ('c4', 11.2, 14.0, '1955: the Warsaw Pact<i class="%s-ln">the East\'s answer to NATO</i>' % P),
    ('c5', 14.0, T, '13 August 1961:<i class="%s-ln">the <b class="%s-g">Berlin Wall</b></i>' % (P, P)),
]
STILL = 'c5'

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

h = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for c, lab, col, row, cw, rh, side, born in TILES:
    x, y, w, hh = col * S + 1, row * S + 1, cw * S - 2, rh * S - 2
    h.append('      <rect class="%s-tile %s-%s" x="%d" y="%d" width="%d" height="%d" rx="3"/>' % (P, P, c, x, y, w, hh))
    h.append('      <text class="%s-lab" x="%g" y="%g">%s</text>' % (P, x + w / 2, y + hh / 2 + 2, lab))
h.append('      <rect class="%s-pact" x="%d" y="%d" width="%d" height="%d" rx="4"/>' % (P, 4 * S - 1, 2 * S - 1, 3 * S + 2, 2 * S + 2))
h.append('      <polyline class="%s-line" pathLength="100" points="%s"/>' % (P, ' '.join('%d,%d' % p for p in CURTAIN)))
h.append('      <text class="%s-end %s-ste" x="%d" y="%d">Stettin</text>' % (P, P, 94, 45))
h.append('      <text class="%s-end %s-tri" x="%d" y="%d">Trieste</text>' % (P, P, 94, 131))
bx, by = 4 * S + 18, 2 * S + 18
h.append('      <circle class="%s-ber" cx="%d" cy="%d" r="3"/>' % (P, bx, by))
h.append('      <line class="%s-wall" x1="%d" y1="%d" x2="%d" y2="%d"/>' % (P, bx, by - 4, bx, by + 4))
h.append('    </svg>')
h.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    h.append('      <span class="%s-t %s-%s">%s</span>' % (P, P, c, html))
h.append('    </div>')
h.append('  </div>')

css = []
css.append('.an-%s { --hcur-east: #e0605a; --hcur-west: #6fa8dc; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(86vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-tile { fill: var(--paper); fill-opacity: .1; stroke: var(--paper); stroke-opacity: .3; stroke-width: .6; }' % P)
css.append('.%s-su { fill: var(--hcur-east); fill-opacity: .6; }' % P)
css.append('.%s-yu { fill: var(--hcur-east); fill-opacity: .22; }' % P)
css.append('.%s-lab { font: 700 5.5px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-pact { fill: none; stroke: var(--hcur-east); stroke-width: 1.2; stroke-dasharray: 3 2; opacity: 0; }' % P)
css.append('.%s-line { fill: none; stroke: var(--gold); stroke-width: 2.4; stroke-linejoin: round; stroke-linecap: round; stroke-dasharray: 100; }' % P)
css.append('.%s-end { font: 700 5.5px var(--mono); fill: var(--gold); text-anchor: end; }' % P)
css.append('.%s-ber { fill: var(--paper); stroke: var(--bg); stroke-width: .8; }' % P)
css.append('.%s-wall { stroke: var(--gold); stroke-width: 1.6; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 .98rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-t { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; }' % P)
css.append('.%s-t:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
for c, lab, col, row, cw, rh, side, born in TILES:
    if side not in ('east', 'west'): continue
    var = 'var(--hcur-%s)' % side
    css.append('.%s-%s { fill: %s; fill-opacity: .6; animation: %s-%s %gs ease-in-out infinite; }' % (P, c, var, P, c, T))
    css.append('@keyframes %s-%s { 0%%, %s { fill: var(--paper); fill-opacity: .1; } %s, %s { fill: %s; fill-opacity: .6; } 100%% { fill: var(--paper); fill-opacity: .1; } }'
               % (P, c, pc(born), pc(born + 0.5), pc(END), var))
css.append('.%s-line { animation: %s-line %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-line { 0%%, %s { stroke-dashoffset: 100; } %s, %s { stroke-dashoffset: 0; opacity: 1; } 100%% { stroke-dashoffset: 0; opacity: 0; } }'
           % (P, pc(LINE_AT), pc(LINE_AT + 1.8), pc(END)))
for c, a in (('ste', LINE_AT), ('tri', LINE_AT + 1.6)):
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.4, END, T))
css.append('.%s-pact { animation: %s-pact %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('pact', PACT, PACT + 0.5, END, T))
css.append('.%s-wall { animation: %s-wall %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('wall', WALL + 0.3, WALL + 0.8, END, T))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-tile, .%s-line, .%s-end, .%s-wall, .%s-t { animation: none; }' % ((P,) * 5))
css.append('  .%s-pact { animation: none; opacity: 1; }' % P)
css.append('}')

anim_row.write_anim('hcur', html='\n'.join(h), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(h), len(css)))
