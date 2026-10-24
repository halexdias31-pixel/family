# Energy transfers as a Sankey diagram, and efficiency (GCSE Physics chapter 1): writes its row of
# data/textbooks.json through tools/anim_row.py. Edit the numbers or the timeline and re-run:
# python3 tools/ph_sank.py
#
# WHAT IT DRAWS, in one loop of T seconds: the chapter's motor, 60 W for 10 s, as a Sankey diagram whose
# band widths are to scale (0.1 unit a joule). 600 J of electrical energy flows in; 450 J goes on as the
# load's gravitational potential energy; 150 J bends away, dissipated by heating and sound. Dashes flowing
# along the bands are the transfer happening. Then the two sums the chapter asks for: 450 + 150 = 600 (no
# energy is destroyed) and 450 ÷ 600 = 0.75, an efficiency of 75%. The still (reduced motion) is the
# finished diagram with the efficiency.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'phsank'
T = 14.0
W, H = 240, 132
S = .1                                       # units a joule
X0, XS, XE = 14, 104, 206                    # input start, the split, the useful band's end
TOP = 26
IN, USE, WASTE = 600, 450, 150

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.') or '0'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

wi, wu, ww = IN * S, USE * S, WASTE * S
yi = TOP + wi / 2
yu = TOP + wu / 2
yw = TOP + wu + ww / 2
WX = XS + 26                                 # where the waste band runs down
BANDS = [  # (class, path, width, drawn from, to)
    ('bi', 'M%d %sH%d' % (X0, g(yi), XS), wi, 0.4, 1.8),
    ('bu', 'M%d %sH%d' % (XS, g(yu), XE), wu, 1.8, 3.4),
    ('bw', 'M%d %sH%sQ%s %s %s %sV%d' % (XS, g(yw), g(WX - 12), g(WX), g(yw), g(WX), g(yw + 12), 124), ww, 1.8, 3.4),
]
END = 13.2
LABELS = [  # (class, x, y, text, second line, from)
    ('li', X0 + 2, TOP - 5, '600 J in', 'electrical', 0.8),
    ('lu', XE, TOP - 5, '450 J useful', 'gravitational potential', 3.0),
    ('lw', WX + 12, 104, '150 J wasted', 'heating, sound', 3.0),
]
CAPS = [
    ('c0', 0.3, 3.4, 'a 60 W motor for 10 s<i class="%s-ln">60 × 10 = 600 J in</i>' % P),
    ('c1', 3.4, 6.2, 'band width shows energy<i class="%s-ln">450 J lifts the load</i>' % P),
    ('c2', 6.2, 9.0, '450 + 150 = 600 J<i class="%s-ln">none created or destroyed</i>' % P),
    ('c3', 9.0, END, 'efficiency = 450 ÷ 600<i class="%s-ln">= 0.75 = 75%%</i>' % P),
]
STILL = 'c3'

svg = ['<div id="splash-%s" aria-hidden="true">' % P,
       '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H)]
for c, d, w, a, b in BANDS:
    svg.append('      <path class="%s-a %s-band %s-%s" d="%s" stroke-width="%s" pathLength="1"/>' % (P, P, P, c, d, g(w)))
for c, d, w, a, b in BANDS:
    svg.append('      <path class="%s-a %s-flow %s-%s2" d="%s" stroke-width="%s"/>' % (P, P, P, c, d, g(w * .5)))
svg.append('      <path class="%s-a %s-hd %s-hu" d="M%d %sl10 %sl-10 %sz"/>' % (P, P, P, XE, g(TOP - 3), g(wu / 2 + 3), g(wu / 2 + 3)))
svg.append('      <path class="%s-a %s-hd %s-hw" d="M%s 124l%s 7l%s -7z"/>' % (P, P, P, g(WX - ww / 2 - 3), g(ww / 2 + 3), g(ww / 2 + 3)))
for c, x, y, txt, ln, t0 in LABELS:
    anchor = ' %s-end' % P if c == 'lu' else ''
    svg.append('      <text class="%s-a %s-lb%s %s-%s" x="%s" y="%s">%s<tspan class="%s-l2" x="%s" dy="8">%s</tspan></text>'
               % (P, P, anchor, P, c, g(x), g(y - 8 if c != 'lw' else y), txt, P, g(x), ln))
svg.append('    </svg>')
svg.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    svg.append('      <span class="%s-a %s-s %s-%s">%s</span>' % (P, P, P, c, html))
svg.append('    </div>')
svg.append('  </div>')

css = []
css.append('.an-%s { --phsank-w: #e0605a; text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-band { fill: none; stroke: var(--gold); stroke-opacity: .55; stroke-dasharray: 1 1; }' % P)
css.append('.%s-bw { stroke: var(--phsank-w); }' % P)
css.append('.%s-flow { fill: none; stroke: var(--paper); stroke-opacity: .35; stroke-dasharray: 2 8; opacity: 0; }' % P)
css.append('.%s-hd { fill: var(--gold); fill-opacity: .55; }' % P)
css.append('.%s-hw { fill: var(--phsank-w); }' % P)
css.append('.%s-lb { font: 700 7.5px var(--mono); fill: var(--paper); }' % P)
css.append('.%s-end { text-anchor: end; }' % P)
css.append('.%s-l2 { font-weight: 400; font-size: 6.5px; fill-opacity: .8; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 1rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-s { grid-area: 1 / 1; }' % P)
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; font-size: .85em; opacity: .85; }' % P)
css.append('.%s-s:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
for c, d, w, a, b in BANDS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append('@keyframes %s-%s { 0%%, %s { stroke-dashoffset: 1; opacity: 1; } %s, %s { stroke-dashoffset: 0; opacity: 1; } %s, 100%% { stroke-dashoffset: 0; opacity: 0; } }'
               % (P, c, pc(a), pc(b), pc(END), pc(END + .5)))
    css.append('.%s-%s2 { animation: %s-run 1s linear infinite, %s-%s2 %gs ease-in-out infinite; }' % (P, c, P, P, c, T))
    css.append(fade(c + '2', b, b + .4, END, END + .5))
css.append('@keyframes %s-run { to { stroke-dashoffset: -10; } }' % P)
for c in ('hu', 'hw'):
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, 3.2, 3.5, END, END + .5))
for c, x, y, txt, ln, t0 in LABELS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, t0, t0 + .4, END, END + .5))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + .3, b - .3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-a { animation: none; }' % P)
css.append('}')

anim_row.write_anim('phsank', html='\n'.join(svg), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(svg), len(css)))
