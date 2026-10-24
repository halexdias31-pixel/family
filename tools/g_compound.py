# Compound interest, year by year (GCSE Maths chapter 3): writes its row of data/textbooks.json
# through tools/anim_row.py. Edit the amounts or the timeline and re-run: python3 tools/g_compound.py
#
# WHAT IT DRAWS, in one loop of T seconds: £2000 at 3% a year for 4 years, a bar a year. Each new bar
# is last year's amount carried across, with that year's interest stacked on it in gold — and the gold
# grows, £60, £61.80, £63.65, £65.56, because each year's 3% is of a bigger amount. Then the multiplier
# that does all of it at once, 2000 × 1.03⁴, and the straight line simple interest would have drawn.
# THE BARS START AT £1900, not £0, so four years of 3% can be seen; the broken axis says so.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'gcomp'
T = 15.0
W, H = 230, 142
START, RATE, YEARS = 2000, 3, 4
FLOOR = 1900                        # the value at the baseline
BASE, K = 122, 0.27                 # the baseline's y, and pixels per pound above FLOOR
BW, X0, GAP = 26, 32, 40            # bar width, first bar's left edge, bar pitch
END = T - 0.8

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def grow(name, a, b):
    """scaled up from its own bottom edge over [a, b]; gone with everything at END."""
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; transform: scaleY(0); } %s { opacity: 1; transform: scaleY(0); } %s, %s { opacity: 1; transform: none; } 100%% { opacity: 0; transform: none; } }'
            % (P, name, pc(a), pc(a + 0.05), pc(b), pc(END)))

f = lambda v: ('%.2f' % v).rstrip('0').rstrip('.')
money = lambda v: '£%d' % round(v) if abs(v - round(v)) < 1e-9 else '£%.2f' % v     # as the chapter writes it: £2251.02
AMT = [START]
for n in range(YEARS):
    AMT.append(round(AMT[-1] * (1 + RATE / 100), 10))
INT = [AMT[n + 1] - AMT[n] for n in range(YEARS)]
FINAL = round(START * (1 + RATE / 100) ** YEARS, 2)
assert abs(round(AMT[-1], 2) - FINAL) < 1e-9
SIMPLE = START + YEARS * START * RATE / 100
def Y(v): return BASE - K * (v - FLOOR)
def X(n): return X0 + GAP * n
YR = [1.6 + 1.9 * n for n in range(YEARS)]      # when year n + 1 is added
ALL, LINE = YR[-1] + 2.0, YR[-1] + 4.2

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
svg.append('      <g class="%s-ax"><path class="%s-axis" d="M%d %dH%d"/>' % (P, P, X0 - 12, BASE, X(YEARS) + BW + 6))
svg.append('        <path class="%s-brk" d="M%d %dl4 -3l-8 -4l8 -4l-4 -3"/>' % (P, X0 - 12, BASE))
for n in range(YEARS + 1):
    svg.append('        <text class="%s-yr" x="%g" y="%d">%d</text>' % (P, X(n) + BW / 2, BASE + 10, n))
svg.append('      </g>')
# year 0: the £2000
svg.append('      <rect class="%s-bar %s-b0" x="%d" y="%s" width="%d" height="%s"/>' % (P, P, X(0), f(Y(START)), BW, f(BASE - Y(START))))
for n in range(1, YEARS + 1):
    prev, now = AMT[n - 1], AMT[n]
    svg.append('      <rect class="%s-bar %s-b%d" x="%d" y="%s" width="%d" height="%s"/>' % (P, P, n, X(n), f(Y(prev)), BW, f(BASE - Y(prev))))
    svg.append('      <rect class="%s-gain %s-g%d" x="%d" y="%s" width="%d" height="%s"/>' % (P, P, n, X(n), f(Y(now)), BW, f(Y(prev) - Y(now))))
for n in range(YEARS + 1):
    svg.append('      <text class="%s-v %s-v%d" x="%g" y="%s">%s</text>' % (P, P, n, X(n) + BW / 2, f(Y(AMT[n]) - 4), money(round(AMT[n], 2))))
svg.append('      <path class="%s-simple" pathLength="1" d="M%g %sL%g %s"/>' % (P, X(0) + BW / 2, f(Y(START)), X(YEARS) + BW / 2, f(Y(SIMPLE))))
svg.append('    </svg>')
CAPS = [('c0', 0.2, YR[0], '£2000 at 3% a year<i class="gcomp-ln">compound interest</i>')]
for n in range(YEARS):
    CAPS.append(('c%d' % (n + 1), YR[n], YR[n] + 1.9 if n < YEARS - 1 else ALL,
                 'year %d: 3%% of %s<i class="gcomp-ln">= <b class="gcomp-g">%s</b> more</i>' % (n + 1, money(round(AMT[n], 2)), money(round(INT[n], 2)))))
CAPS.append(('c5', ALL, LINE, '× 1.03 each year<i class="gcomp-ln">2000 × 1.03⁴ = <b class="gcomp-g">%s</b></i>' % money(FINAL)))
CAPS.append(('c6', LINE, T, 'simple interest: %s<i class="gcomp-ln">interest on interest: +%s</i>' % (money(SIMPLE), money(round(FINAL - SIMPLE, 2)))))
STILL = 'c5'
svg.append('    <div class="%s-say">' % P)
for c, a0, b0, html in CAPS:
    svg.append('      <span class="%s-s %s-%s">%s</span>' % (P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(80vw, 19rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-axis, .%s-brk { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.1; stroke-linejoin: round; }' % (P, P))
css.append('.%s-yr { font: 400 8px var(--mono); fill: var(--paper); fill-opacity: .7; text-anchor: middle; }' % P)
css.append('.%s-bar { fill: #6fa8dc; fill-opacity: .55; stroke: #6fa8dc; stroke-width: 1; }' % P)
css.append('.%s-gain { fill: var(--gold); stroke: var(--gold); stroke-width: 1; }' % P)
css.append('.%s-bar, .%s-gain { transform-box: fill-box; transform-origin: 50%% 100%%; }' % (P, P))
css.append('.%s-v { font: 700 8.5px var(--mono); fill: var(--paper); text-anchor: middle; }' % P)
css.append('.%s-simple { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.2; stroke-dasharray: 1; }' % P)
css.append('.%s-say { display: grid; margin-top: .6rem; min-height: 2.6em; align-items: center; font: 700 1.05rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; }' % P)
# THE STILL: all five bars with their gold, and the multiplier; the simple-interest line is hidden.
css.append('.%s-simple, .%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, P, STILL))
css.append('.%s-ax { animation: %s-ax %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('ax', 0, 0.5, END, T))
css.append('.%s-b0 { animation: %s-b0 %gs ease-out infinite; }' % (P, P, T))
css.append(grow('b0', 0.3, 1.1))
css.append('.%s-v0 { animation: %s-v0 %gs ease-in-out infinite; }' % (P, P, T))
css.append(fade('v0', 1.0, 1.3, END, T))
for n in range(1, YEARS + 1):
    t = YR[n - 1]
    css.append('.%s-b%d { animation: %s-b%d %gs ease-in-out infinite; }' % (P, n, P, n, T))
    # last year's amount slides across from the bar before: carried over, not grown again
    css.append('@keyframes %s-b%d { 0%%, %s { opacity: 0; transform: translateX(-%dpx); } %s { opacity: 1; transform: translateX(-%dpx); } %s, %s { opacity: 1; transform: none; } 100%% { opacity: 0; transform: none; } }'
               % (P, n, pc(t), GAP, pc(t + 0.1), GAP, pc(t + 0.7), pc(END)))
    css.append('.%s-g%d { animation: %s-g%d %gs ease-out infinite; }' % (P, n, P, n, T))
    css.append(grow('g%d' % n, t + 0.8, t + 1.3))
    css.append('.%s-v%d { animation: %s-v%d %gs ease-in-out infinite; }' % (P, n, P, n, T))
    css.append(fade('v%d' % n, t + 1.2, t + 1.5, END, T))
css.append('.%s-simple { animation: %s-simple %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-simple { 0%%, %s { stroke-dashoffset: 1; opacity: 0; } %s { stroke-dashoffset: 1; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } 100%% { stroke-dashoffset: 0; opacity: 0; } }'
           % (P, pc(LINE), pc(LINE + .05), pc(LINE + 1.0), pc(END)))
for c, a0, b0, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a0, a0 + 0.3, b0 - 0.3, b0))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-ax, .%s-bar, .%s-gain, .%s-v, .%s-simple, .%s-s { animation: none; }' % ((P,) * 6))
css.append('}')

anim_row.write_anim('gcomp', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS; %s after %d years' % (P, len(svg), len(css), money(FINAL), YEARS))
