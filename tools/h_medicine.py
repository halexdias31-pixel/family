# Turning points in medicine, 1348–1948 (GCSE History chapter 16): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the list or the timeline and re-run: python3 tools/h_medicine.py
#
# WHAT IT DRAWS, in one loop of T seconds: eleven turning points in Health and the people, a line at a time, each with
# the factor that drove it as a coloured tag — the Church (the Black Death, 1348), individuals (Vesalius 1543, Jenner
# 1796, Snow 1854), science (Harvey 1628, chloroform 1847, germ theory 1861), government (the 1875 Public Health Act,
# the NHS 1948), chance (Fleming 1928) and war (penicillin for D-Day, 1944). The rows are evenly spaced, not to
# scale: what it shows is the order and the factors. The still (reduced motion) is the whole list.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'hmed'
T = 18.0
W, H = 220, 118
END = T - 0.8
ROWS = [
    ('1348', 'Black Death: miasma, prayer', 'church', 'Church'),
    ('1543', 'Vesalius corrects Galen', 'ind', 'individual'),
    ('1628', 'Harvey: blood circulates', 'sci', 'science'),
    ('1796', 'Jenner\'s smallpox vaccine', 'ind', 'individual'),
    ('1847', 'chloroform for surgery', 'sci', 'science'),
    ('1854', 'Snow and the Broad St pump', 'ind', 'individual'),
    ('1861', 'Pasteur\'s germ theory', 'sci', 'science'),
    ('1875', 'Public Health Act', 'gov', 'government'),
    ('1928', 'Fleming sees the mould', 'luck', 'chance'),
    ('1944', 'penicillin for D-Day', 'war', 'war'),
    ('1948', 'the NHS', 'gov', 'government'),
]
BORN = [0.5 + 1.15 * i for i in range(len(ROWS))]
CAPS = [
    ('c0', 0.2, 2.8, 'c1000–1500<i class="%s-ln">the Church keeps Galen\'s ideas</i>' % P),
    ('c1', 2.8, 6.2, '1500–1800<i class="%s-ln">new knowledge, old treatments</i>' % P),
    ('c2', 6.2, 9.6, '1800–1900<i class="%s-ln">germs, surgery and the state</i>' % P),
    ('c3', 9.6, 13.4, 'the 1900s<i class="%s-ln">chance, war and government</i>' % P),
    ('c4', 13.4, T, '<b class="%s-g">factors work together</b><i class="%s-ln">penicillin: chance, science, war</i>' % (P, P)),
]
STILL = 'c4'

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

h = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
h.append('      <line class="%s-spine" x1="23" y1="3" x2="23" y2="%d"/>' % (P, H - 3))
for i, (yr, what, f, lab) in enumerate(ROWS):
    y = 9 + i * 10
    h.append('      <g class="%s-row %s-r%d">' % (P, P, i))
    h.append('        <circle class="%s-dot" cx="23" cy="%d" r="1.6"/>' % (P, y - 2))
    h.append('        <text class="%s-yr" x="19" y="%d">%s</text>' % (P, y, yr))
    h.append('        <text class="%s-what" x="28" y="%d">%s</text>' % (P, y, what))
    h.append('        <rect class="%s-chip %s-%s" x="172" y="%d" width="46" height="8" rx="4"/>' % (P, P, f, y - 6))
    h.append('        <text class="%s-cl" x="195" y="%.1f">%s</text>' % (P, y - 0.3, lab))
    h.append('      </g>')
h.append('    </svg>')
h.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    h.append('      <span class="%s-t %s-%s">%s</span>' % (P, P, c, html))
h.append('    </div>')
h.append('  </div>')

css = []
css.append('.an-%s { --hmed-church: #a0a0a0; --hmed-ind: #e0a050; --hmed-sci: #6fa8dc; --hmed-gov: #6fd8a0; --hmed-luck: #b48ce0; --hmed-war: #e0605a; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(86vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-spine { stroke: var(--paper); stroke-opacity: .3; stroke-width: .8; }' % P)
css.append('.%s-dot { fill: var(--gold); }' % P)
css.append('.%s-yr { font: 700 6.5px var(--mono); fill: var(--gold); text-anchor: end; }' % P)
css.append('.%s-what { font: 6.3px var(--mono); fill: var(--paper); }' % P)
css.append('.%s-chip { fill-opacity: .35; stroke-width: .8; }' % P)
for f in ('church', 'ind', 'sci', 'gov', 'luck', 'war'):
    css.append('.%s-%s { fill: var(--hmed-%s); stroke: var(--hmed-%s); }' % (P, f, f, f))
css.append('.%s-cl { font: 700 5.2px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 .98rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-t { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; }' % P)
css.append('.%s-t:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
for i, a in enumerate(BORN):
    css.append('.%s-r%d { animation: %s-r%d %gs ease-in-out infinite; }' % (P, i, P, i, T))
    css.append('@keyframes %s-r%d { 0%%, %s { opacity: 0; transform: translateX(-6px); } %s, %s { opacity: 1; transform: none; } %s, 100%% { opacity: 0; transform: none; } }'
               % (P, i, pc(a), pc(a + 0.5), pc(END), pc(T)))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-row, .%s-t { animation: none; }' % (P, P))
css.append('}')

anim_row.write_anim('hmed', html='\n'.join(h), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(h), len(css)))
