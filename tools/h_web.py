# Why the First World War began (GCSE History chapter 12): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the web or the timeline and re-run: python3 tools/h_web.py
#
# WHAT IT DRAWS, in one loop of T seconds: a causation web building up. The four long-term causes (MAIN) arrive one
# at a time, each joined to WAR by a link that says how — the naval race, the alliance system, the Moroccan Crises,
# Bosnia — and to each other where they fed each other (the Schlieffen Plan tied German war plans to France and
# Belgium). Then the short-term trigger, Sarajevo (28 June 1914), joins Nationalism, and the July Crisis link turns
# WAR gold: thirty-seven days from the shooting to Britain's declaration on 4 August. The still is the whole web.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'hweb'
T = 18.0
W, H = 220, 150
END = T - 0.8
NW, NH = 60, 20

NODES = {   # name: (label, x, y, born)
    'm': ('Militarism', 4, 6, 0.5), 'a': ('Alliances', 156, 6, 2.6),
    'i': ('Imperialism', 4, 124, 5.6), 'n': ('Nationalism', 156, 124, 7.6),
    's': ('Sarajevo', 156, 66, 10.0),
}
WAR = (78, 60, 64, 30)
LINKS = [   # (from, to, label, born, label x, label y)
    ('m', 'w', 'naval race', 1.2, 58, 44), ('a', 'w', 'two armed camps', 3.3, 162, 44),
    ('m', 'a', 'Schlieffen Plan', 4.4, 110, 13), ('i', 'w', 'Morocco 1905, 1911', 6.3, 58, 112),
    ('n', 'w', 'Bosnia 1908', 8.3, 162, 112), ('n', 's', 'Black Hand', 10.0, 197, 106),
    ('s', 'w', 'July Crisis', 11.4, 149, 97),
]
GLOW = 12.4

def centre(k):
    if k == 'w': return WAR[0] + WAR[2] / 2, WAR[1] + WAR[3] / 2
    lab, x, y, born = NODES[k]
    return x + NW / 2, y + NH / 2

CAPS = [
    ('c0', 0.2, 2.6, 'Militarism<i class="%s-ln">the naval race, war plans</i>' % P),
    ('c1', 2.6, 5.6, 'Alliances<i class="%s-ln">two armed camps by 1907</i>' % P),
    ('c2', 5.6, 7.6, 'Imperialism<i class="%s-ln">Moroccan Crises, 1905 and 1911</i>' % P),
    ('c3', 7.6, 10.0, 'Nationalism<i class="%s-ln">Serbs and Bosnia, 1908</i>' % P),
    ('c4', 10.0, 12.6, 'the spark: Sarajevo<i class="%s-ln">28 June 1914</i>' % P),
    ('c5', 12.6, T, '<b class="%s-g">4 August 1914</b><i class="%s-ln">a web of causes, one spark</i>' % (P, P)),
]
STILL = 'c5'

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

h = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for i, (f, t, lab, born, lx, ly) in enumerate(LINKS):
    (x1, y1), (x2, y2) = centre(f), centre(t)
    h.append('      <line class="%s-ln%d %s-link%s" pathLength="100" x1="%g" y1="%g" x2="%g" y2="%g"/>'
             % (P, i, P, ' %s-hot' % P if f == 's' else '', x1, y1, x2, y2))
for i, (f, t, lab, born, lx, ly) in enumerate(LINKS):
    h.append('      <text class="%s-why %s-w%d" x="%g" y="%g">%s</text>' % (P, P, i, lx, ly, lab))
h.append('      <g class="%s-war"><rect class="%s-wbox" x="%d" y="%d" width="%d" height="%d" rx="4"/>'
         '<text class="%s-wt" x="%g" y="%g">WAR</text></g>' % (P, P, WAR[0], WAR[1], WAR[2], WAR[3], P, WAR[0] + WAR[2] / 2, WAR[1] + 19))
for k, (lab, x, y, born) in NODES.items():
    h.append('      <g class="%s-node %s-%s"><rect class="%s-box%s" x="%d" y="%d" width="%d" height="%d" rx="3"/>'
             '<text class="%s-nt" x="%g" y="%g">%s</text></g>' % (P, P, k, P, ' %s-spark' % P if k == 's' else '', x, y, NW, NH, P, x + NW / 2, y + 13, lab))
h.append('    </svg>')
h.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    h.append('      <span class="%s-t %s-%s">%s</span>' % (P, P, c, html))
h.append('    </div>')
h.append('  </div>')

css = []
css.append('.an-%s { --hweb-hot: #e0605a; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(86vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-link { stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.2; stroke-dasharray: 100; fill: none; }' % P)
css.append('.%s-hot { stroke: var(--hweb-hot); stroke-opacity: 1; stroke-width: 2; }' % P)
css.append('.%s-why { font: 6px var(--mono); fill: var(--paper); text-anchor: middle; paint-order: stroke; stroke: var(--bg); stroke-width: 2.5px; }' % P)
css.append('.%s-box { fill: var(--bg); stroke: var(--paper); stroke-width: 1; }' % P)
css.append('.%s-spark { stroke: var(--hweb-hot); }' % P)
css.append('.%s-nt { font: 700 7px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-wbox { fill: var(--gold); fill-opacity: .85; stroke: var(--gold); stroke-width: 1.2; }' % P)
css.append('.%s-wt { font: 700 11px var(--mono); fill: var(--bg); text-anchor: middle; letter-spacing: .1em; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 .98rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-t { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; }' % P)
css.append('.%s-t:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
for k, (lab, x, y, born) in NODES.items():
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, k, P, k, T))
    css.append(fade(k, born, born + 0.4, END, T))
for i, (f, t, lab, born, lx, ly) in enumerate(LINKS):
    css.append('.%s-ln%d { animation: %s-ln%d %gs ease-in-out infinite; }' % (P, i, P, i, T))
    css.append('@keyframes %s-ln%d { 0%%, %s { stroke-dashoffset: 100; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } 100%% { stroke-dashoffset: 0; opacity: 0; } }'
               % (P, i, pc(born), pc(born + 0.9), pc(END)))
    css.append('.%s-w%d { animation: %s-w%d %gs ease-in-out infinite; }' % (P, i, P, i, T))
    css.append(fade('w%d' % i, born + 0.6, born + 1.0, END, T))
css.append('.%s-wbox { animation: %s-wbox %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-wbox { 0%%, %s { fill: var(--bg); stroke: var(--paper); } %s, %s { fill: var(--gold); stroke: var(--gold); } 100%% { fill: var(--bg); stroke: var(--paper); } }'
           % (P, pc(GLOW), pc(GLOW + 0.5), pc(END)))
css.append('.%s-wt { animation: %s-wt %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-wt { 0%%, %s { fill: var(--paper); } %s, %s { fill: var(--bg); } 100%% { fill: var(--paper); } }'
           % (P, pc(GLOW), pc(GLOW + 0.5), pc(END)))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-node, .%s-link, .%s-why, .%s-wbox, .%s-wt, .%s-t { animation: none; }' % ((P,) * 6))
css.append('}')

anim_row.write_anim('hweb', html='\n'.join(h), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(h), len(css)))
