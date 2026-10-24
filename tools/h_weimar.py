# Weimar to Hitler, 1919–1933 (GCSE History chapter 3): writes its row of data/textbooks.json through tools/anim_row.py.
# Edit the dates or the timeline and re-run: python3 tools/h_weimar.py
#
# WHAT IT DRAWS, in one loop of T seconds: a time line from 1918 to 1934 filling in as a causation chain — the
# crises of 1919–23 (Spartacists, Kapp Putsch, the Ruhr, the Munich Putsch) in red, Stresemann's recovery of
# 1924–29 (Dawes, Locarno, the League) in green, then the Wall Street Crash and the Depression, with the Nazis'
# Reichstag seats rising out of it (12 in 1928, 107 in 1930, 230 in July 1932), and last
# the gold line of 30 January 1933. The still (reduced motion) is the whole line with its last caption.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'hweim'
T = 18.0
W, H = 220, 120
END = T - 0.8
AX = 84                              # the time line's y
def X(year): return 10 + (year - 1918) * 12.5

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def grow(name, axis, a, b):
    return ('@keyframes %s-%s { 0%%, %s { transform: scale%s(0); opacity: 1; } %s, %s { transform: scale%s(1); opacity: 1; } '
            '100%% { transform: scale%s(1); opacity: 0; } }' % (P, name, pc(a), axis, pc(b), pc(END), axis, axis))

BANDS = [('crisis', 1919.0, 1924.0, 'crises', 0.5), ('gold', 1924.0, 1929.8, 'golden years', 3.8), ('dep', 1929.8, 1933.1, 'depression', 7.6)]
DOTS = [(1919.05, 0.9), (1920.2, 1.5), (1923.05, 2.1), (1923.85, 2.7),      # Spartacists, Kapp, Ruhr, Munich Putsch
        (1924.65, 4.4), (1925.8, 5.0), (1926.7, 5.6), (1929.8, 7.2)]          # Dawes, Locarno, League, the Crash
SEATS = [(1928.4, 12, 9.4), (1930.7, 107, 10.0), (1932.4, 230, 10.6)]
TOP = 230 / 46                       # seats per unit of height
CHANCELLOR = 1933.08

CAPS = [
    ('c0', 0.2, 3.8, '1919–23: crises<i class="%s-ln">risings, the Ruhr, hyperinflation</i>' % P),
    ('c1', 3.8, 7.0, '1924–29: the Golden Years<i class="%s-ln">Rentenmark, Dawes loans, Locarno</i>' % P),
    ('c2', 7.0, 9.4, 'October 1929: Wall Street Crash<i class="%s-ln">American loans called in</i>' % P),
    ('c3', 9.4, 12.6, '1932: six million out of work<i class="%s-ln">Nazi seats 12 → 107 → 230</i>' % P),
    ('c4', 12.6, T, '<b class="%s-g">30 January 1933</b><i class="%s-ln">Hindenburg makes Hitler chancellor</i>' % (P, P)),
]
STILL = 'c4'

h = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for name, a, b, label, t in BANDS:
    h.append('      <rect class="%s-band %s-%s" x="%.1f" y="%d" width="%.1f" height="12" rx="2"/>' % (P, P, name, X(a), AX - 6, X(b) - X(a)))
    h.append('      <text class="%s-bl %s-l%s" x="%.1f" y="%d">%s</text>' % (P, P, name, (X(a) + X(b)) / 2, AX + 2.5, label))
h.append('      <line class="%s-axis" x1="%d" y1="%d" x2="%d" y2="%d"/>' % (P, X(1918), AX + 9, X(1934), AX + 9))
for y in (1919, 1924, 1929, 1933):
    h.append('      <line class="%s-tick" x1="%.1f" y1="%d" x2="%.1f" y2="%d"/>' % (P, X(y), AX + 7, X(y), AX + 11))
    h.append('      <text class="%s-yr" x="%.1f" y="%d">%d</text>' % (P, X(y), AX + 20, y))
for i, (y, t) in enumerate(DOTS):
    h.append('      <circle class="%s-dot %s-d%d" cx="%.1f" cy="%d" r="2.2"/>' % (P, P, i, X(y), AX + 9))
for i, (y, n, t) in enumerate(SEATS):
    hh = n / TOP
    h.append('      <g class="%s-seat %s-s%d"><rect class="%s-sb %s-sb%d" x="%.1f" y="%.1f" width="5" height="%.1f"/>'
             '<text class="%s-sn" x="%.1f" y="%.1f">%d</text></g>' % (P, P, i, P, P, i, X(y) - 2.5, AX - 8 - hh, hh, P, X(y), AX - 10 - hh, n))
h.append('      <text class="%s-sl %s-s4" x="%.1f" y="%d">Nazi seats</text>' % (P, P, X(1928.4), AX - 22))
h.append('      <g class="%s-ch">' % P)
h.append('        <line class="%s-chl" x1="%.1f" y1="12" x2="%.1f" y2="%d"/>' % (P, X(CHANCELLOR), X(CHANCELLOR), AX + 12))
h.append('        <text class="%s-cht" x="%.1f" y="8">Hitler chancellor</text>' % (P, X(CHANCELLOR) + 2))
h.append('      </g>')
h.append('    </svg>')
h.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    h.append('      <span class="%s-t %s-%s">%s</span>' % (P, P, c, html))
h.append('    </div>')
h.append('  </div>')

css = []
css.append('.an-%s { --hweim-crisis: #e0605a; --hweim-good: #6fd8a0; --hweim-dep: #e0a050; --hweim-nazi: #a0a0a0; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(86vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-band { fill-opacity: .55; transform-box: fill-box; transform-origin: left center; }' % P)
css.append('.%s-crisis { fill: var(--hweim-crisis); }' % P)
css.append('.%s-gold { fill: var(--hweim-good); }' % P)
css.append('.%s-dep { fill: var(--hweim-dep); }' % P)
css.append('.%s-bl { font: 700 6.5px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-axis, .%s-tick { stroke: var(--paper); stroke-opacity: .7; stroke-width: .8; }' % (P, P))
css.append('.%s-yr { font: 6.5px var(--mono); fill: var(--paper); fill-opacity: .8; text-anchor: middle; }' % P)
css.append('.%s-dot { fill: var(--paper); }' % P)
css.append('.%s-sb { fill: var(--hweim-nazi); transform-box: fill-box; transform-origin: center bottom; }' % P)
css.append('.%s-sn { font: 700 6px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-sl { font: 6px var(--mono); fill: var(--hweim-nazi); text-anchor: middle; }' % P)
css.append('.%s-chl { stroke: var(--gold); stroke-width: 1.4; }' % P)
css.append('.%s-cht { font: 700 6.5px var(--mono); fill: var(--gold); text-anchor: end; }' % P)
css.append('.%s-say { display: grid; margin-top: .55rem; min-height: 2.7em; align-items: center; font: 700 .98rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-t { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; }' % P)
css.append('.%s-t:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
for name, a, b, label, t in BANDS:
    css.append('.%s-%s { animation: %s-%s %gs ease-out infinite; }' % (P, name, P, name, T))
    css.append(grow(name, 'X', t, t + 2.0))
    css.append('.%s-l%s { animation: %s-l%s %gs ease-in-out infinite; }' % (P, name, P, name, T))
    css.append(fade('l' + name, t + 1.0, t + 1.5, END, T))
for i, (y, t) in enumerate(DOTS):
    css.append('.%s-d%d { animation: %s-d%d %gs ease-in-out infinite; }' % (P, i, P, i, T))
    css.append(fade('d%d' % i, t, t + 0.3, END, T))
for i, (y, n, t) in enumerate(SEATS):
    css.append('.%s-s%d { animation: %s-s%d %gs ease-in-out infinite; }' % (P, i, P, i, T))
    css.append(fade('s%d' % i, t, t + 0.4, END, T))
    css.append('.%s-sb%d { animation: %s-sb%d %gs ease-out infinite; }' % (P, i, P, i, T))
    css.append(grow('sb%d' % i, 'Y', t, t + 0.8))
css.append('.%s-s4 { animation: %s-s4 %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('s4', 9.4, 9.8, END, T))
css.append('.%s-ch { animation: %s-ch %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('ch', 12.6, 13.1, END, T))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-band, .%s-bl, .%s-dot, .%s-seat, .%s-sb, .%s-sl, .%s-ch, .%s-t { animation: none; }' % ((P,) * 8))
css.append('}')

anim_row.write_anim('hweim', html='\n'.join(h), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(h), len(css)))
