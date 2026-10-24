# Transverse and longitudinal waves (GCSE Physics chapter 9): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the waves or the timeline and re-run: python3 tools/ph_wave.py
#
# WHAT IT DRAWS: the same wave twice, travelling left to right. Above, a row of particles each moving only
# up and down — transverse, the oscillation at right angles to the energy's travel. Below, a row of layers
# each moving only left and right — longitudinal, the oscillation along it, bunching into compressions
# and spreading into rarefactions. One particle in each is gold, to show it goes nowhere while the wave
# goes by. A bracket rides one wavelength. Captions, on a loop of T seconds, take one wave at a time
# (the other dims), then v = f × λ with the chapter's ripples. Each particle's phase is a negative
# animation-delay set as a custom property, and its place in the still (reduced motion) is another, so
# the still is the wave frozen at one moment rather than a flat line.
import math, sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phwave'
T = 16.0
PER = 2.0                     # one oscillation, in seconds
LAM = 80.0                    # one wavelength
W, H = 240, 124
TY, LY = 34, 92               # the two rows' rest lines
A1, A2 = 10.0, 4.5            # amplitudes
X0 = 40                       # a crest (and the bracket's start) at time 0

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.') or '0'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def phase(x):
    f = ((x - X0) / LAM) % 1.0
    return (PER * f - PER if f > 1e-9 else 0.0), math.cos(2 * math.pi * f)

CAPS = [
    ('c0', 0.2, 4.0, 'transverse<i class="%s-ln">oscillations ⟂ energy transfer</i>' % P),
    ('c1', 4.0, 8.0, 'longitudinal<i class="%s-ln">oscillations ∥ energy transfer</i>' % P),
    ('c2', 8.0, 11.2, 'compressions, rarefactions<i class="%s-ln">sound is longitudinal</i>' % P),
    ('c3', 11.2, 15.6, 'v = f × λ<i class="%s-ln">4 Hz × 0.5 m = 2 m/s</i>' % P),
]
STILL = 'c3'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
# THE TRANSVERSE ROW
svg.append('      <g class="%s-a %s-top">' % (P, P))
svg.append('        <text class="%s-nm" x="14" y="10">transverse</text><text class="%s-en" x="226" y="10">energy →</text>' % (P, P))
svg.append('        <path class="%s-rest" d="M14 %dH226"/>' % (P, TY))
for k in range(22):
    x = 15 + 10 * k
    d, c = phase(x)
    gold = ' %s-me' % P if x == 125 else ''
    svg.append('        <circle class="%s-a %s-t%s" cx="%d" cy="%d" r="2.8" style="--d: %ss; --y: %spx"/>' % (P, P, gold, x, TY, g(d), g(-A1 * c)))
svg.append('        <path class="%s-ud" d="M131 %dv16m-2.5-13.5l2.5-2.5l2.5 2.5m-5 11l2.5 2.5l2.5-2.5"/>' % (P, TY - 8))
svg.append('        <g class="%s-a %s-lam"><path class="%s-br" d="M%d %dv-4H%dv4"/><text class="%s-bl" x="%d" y="%d">λ</text></g>'
           % (P, P, P, X0, TY - A1 - 4, X0 + LAM, P, X0 + LAM / 2, TY - A1 - 10))
svg.append('      </g>')
# THE LONGITUDINAL ROW
svg.append('      <g class="%s-a %s-bot">' % (P, P))
svg.append('        <text class="%s-nm" x="14" y="%d">longitudinal</text><text class="%s-en" x="226" y="%d">energy →</text>' % (P, LY - 20, P, LY - 20))
for k in range(27):
    x = 18 + 8 * k
    d, c = phase(x)
    gold = ' %s-me' % P if x == 122 else ''
    svg.append('        <path class="%s-a %s-l%s" d="M%d %dv22" style="--d: %ss; --x: %spx"/>' % (P, P, gold, x, LY - 11, g(d), g(A2 * c)))
svg.append('        <path class="%s-ud" d="M115 %dh14m-11.5-2.5l-2.5 2.5l2.5 2.5m9-5l2.5 2.5l-2.5 2.5" />' % (P, LY + 18))
svg.append('        <g class="%s-a %s-lab"><text class="%s-cr" x="%d" y="%d">C</text><text class="%s-cr" x="%d" y="%d">R</text></g>'
           % (P, P, P, X0 + LAM / 4, LY + 20, P, X0 + 3 * LAM / 4, LY + 20))
svg.append('      </g>')
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phwave-p: #6cb6ff; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-nm { font: 700 7.5px var(--mono); fill: var(--paper); }' % P)
css.append('.%s-en { font: 7px var(--mono); fill: var(--gold); text-anchor: end; }' % P)
css.append('.%s-rest { stroke: var(--paper); stroke-opacity: .18; stroke-width: .6; stroke-dasharray: 2 2; }' % P)
css.append('.%s-t { fill: var(--phwave-p); transform: translateY(var(--y)); animation: %s-ty %gs ease-in-out infinite; animation-delay: var(--d); }' % (P, P, PER))
css.append('.%s-l { stroke: var(--phwave-p); stroke-width: 1.6; transform: translateX(var(--x)); animation: %s-lx %gs ease-in-out infinite; animation-delay: var(--d); }' % (P, P, PER))
css.append('.%s-t.%s-me { fill: var(--gold); }' % (P, P))
css.append('.%s-l.%s-me { stroke: var(--gold); stroke-width: 2.2; }' % (P, P))
css.append('.%s-ud { fill: none; stroke: var(--gold); stroke-width: .9; stroke-linecap: round; stroke-linejoin: round; opacity: .8; }' % P)
css.append('.%s-br { fill: none; stroke: var(--paper); stroke-width: .9; }' % P)
css.append('.%s-bl, .%s-cr { font: 700 8px var(--mono); fill: var(--paper); text-anchor: middle; }' % (P, P))
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
css.append('@keyframes %s-ty { 0%%, 100%% { transform: translateY(-%gpx); } 50%% { transform: translateY(%gpx); } }' % (P, A1, A1))
css.append('@keyframes %s-lx { 0%%, 100%% { transform: translateX(%gpx); } 50%% { transform: translateX(-%gpx); } }' % (P, A2, A2))
# the bracket and the C/R labels ride the wave one wavelength each oscillation, and fade at each end of the ride
css.append('.%s-lam, .%s-lab { animation: %s-ride %gs linear infinite; }' % (P, P, P, PER))
css.append('@keyframes %s-ride { 0%% { transform: none; opacity: 0; } 15%%, 85%% { opacity: 1; } 100%% { transform: translateX(%gpx); opacity: 0; } }' % (P, LAM))
# one row at a time: the other dims
css.append('.%s-top { animation: %s-top %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-top { 0%%, %s { opacity: 1; } %s, %s { opacity: .3; } %s, 100%% { opacity: 1; } }' % (P, pc(3.8), pc(4.3), pc(10.9), pc(11.4)))
css.append('.%s-bot { animation: %s-bot %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-bot { 0%%, %s { opacity: .3; } %s, %s { opacity: 1; } %s, 100%% { opacity: .3; } }' % (P, pc(3.8), pc(4.3), pc(15.6), pc(T)))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phwave', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
