# Hyperinflation, 1918–1923 (GCSE History chapter 2): writes its row of data/textbooks.json through tools/anim_row.py.
# Edit the prices or the timeline and re-run: python3 tools/h_inflation.py
#
# WHAT IT DRAWS, in one loop of T seconds: the price of a loaf of bread in Berlin, in marks, a date at a time —
# 0.63 (1918), 163 (1922), 250 (January 1923), 3,465 (July 1923), 1,512,000 (September 1923) and
# 201,000,000,000 (November 1923), the figures most GCSE textbooks print. Each price is a bar on a scale where
# every notch is ten times the last, because on an ordinary scale the first five bars would be invisible; the
# counter under it says what that means in dollars, then how the Rentenmark ended it. The still (reduced
# motion) is every bar drawn with the dollar line.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, math

P = 'hinf'
T = 16.0
W, H = 220, 128
END = T - 0.8
X0, BW = 40, 110                     # where the bars start, and the widest bar
LO, HI = -1, 12                      # the scale: 10^-1 to 10^12 marks, one notch a power of ten

PRICES = [('1918', 0.63, '0.63'), ('1922', 163, '163'), ('Jan 1923', 250, '250'), ('Jul 1923', 3465, '3,465'),
          ('Sep 1923', 1512000, '1,512,000'), ('Nov 1923', 201e9, '201,000,000,000')]
BORN = [0.6, 2.0, 3.4, 4.8, 6.4, 8.2]

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def grow(name, a, b):
    return ('@keyframes %s-%s { 0%%, %s { transform: scaleX(0); opacity: 1; } %s, %s { transform: scaleX(1); opacity: 1; } '
            '100%% { transform: scaleX(1); opacity: 0; } }' % (P, name, pc(a), pc(b), pc(END)))

def width(v): return BW * (math.log10(v) - LO) / (HI - LO)

CAPS = [
    ('c0', 0.2, 3.4, 'a loaf of bread in Berlin, in marks'),
    ('c1', 3.4, 6.4, 'each notch is <b class="%s-g">ten times</b> the last' % P),
    ('c2', 6.4, 9.4, '1923: the Ruhr strikers were paid<i class="%s-ln">in newly printed money</i>' % P),
    ('c3', 9.4, 12.6, 'November 1923: <b class="%s-g">$1</b><i class="%s-ln">= 4,200,000,000,000 marks</i>' % (P, P)),
    ('c4', 12.6, T, 'the Rentenmark ended it:<i class="%s-ln">1 new mark for a trillion old</i>' % P),
]
STILL = 'c3'

h = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for k in range(LO, HI + 1):
    x = X0 + BW * (k - LO) / (HI - LO)
    h.append('      <line class="%s-tick" x1="%.1f" y1="4" x2="%.1f" y2="%d"/>' % (P, x, x, H - 14))
h.append('      <text class="%s-ax" x="%d" y="%d">0.1</text>' % (P, X0, H - 5))
h.append('      <text class="%s-ax %s-axr" x="%d" y="%d">1,000,000,000,000</text>' % (P, P, X0 + BW, H - 5))
for i, (d, v, s) in enumerate(PRICES):
    y = 8 + i * 18
    h.append('      <g class="%s-row %s-r%d">' % (P, P, i))
    h.append('        <text class="%s-date" x="0" y="%d">%s</text>' % (P, y + 7, d))
    h.append('        <rect class="%s-bar %s-b%d" x="%d" y="%d" width="%.1f" height="9" rx="1.5"/>' % (P, P, i, X0, y, width(v)))
    h.append('        <text class="%s-val" x="%d" y="%d">%s</text>' % (P, W, y + 7, s))
    h.append('      </g>')
h.append('    </svg>')
h.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    h.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
h.append('    </div>')
h.append('  </div>')

css = []
css.append('.an-%s { --hinf-bar: #e0a050; --hinf-hot: #e0605a; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(86vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-tick { stroke: var(--paper); stroke-opacity: .16; stroke-width: .6; }' % P)
css.append('.%s-ax { font: 6px var(--mono); fill: var(--paper); fill-opacity: .6; }' % P)
css.append('.%s-axr { text-anchor: end; }' % P)
css.append('.%s-date { font: 700 7px var(--mono); fill: var(--paper); }' % P)
css.append('.%s-val { font: 700 7px var(--mono); fill: var(--gold); text-anchor: end; }' % P)
css.append('.%s-bar { fill: var(--hinf-bar); transform-box: fill-box; transform-origin: left center; }' % P)
css.append('.%s-b4, .%s-b5 { fill: var(--hinf-hot); }' % (P, P))
css.append('.%s-say { display: grid; margin-top: .55rem; min-height: 2.7em; align-items: center; font: 700 .98rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; }' % P)
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
for i, a in enumerate(BORN):
    css.append('.%s-r%d { animation: %s-r%d %gs ease-in-out infinite; }' % (P, i, P, i, T))
    css.append(fade('r%d' % i, a, a + 0.4, END, T))
    css.append('.%s-b%d { animation: %s-b%d %gs ease-out infinite; }' % (P, i, P, i, T))
    css.append(grow('b%d' % i, a, a + 1.0))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-row, .%s-bar, .%s-s { animation: none; }' % (P, P, P))
css.append('}')

anim_row.write_anim('hinf', html='\n'.join(h), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(h), len(css)))
