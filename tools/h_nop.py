# Reading a source: Nature, Origin, Purpose (GCSE History chapter 11): writes its row of data/textbooks.json through
# tools/anim_row.py. Edit the drawing or the timeline and re-run: python3 tools/h_nop.py
#
# WHAT IT DRAWS, in one loop of T seconds: a sketch of Punch's cartoon "The Gap in the Bridge" (10 December 1919: the
# League of Nations as an arch of Belgium, France, England and Italy, its keystone, the USA, lying idle beside it)
# on a sheet of paper, and a magnifier that moves over it as the question is asked: N, what kind of source (a
# cartoon, the whole sheet); O, who made it and when (the credit line, zoomed); P, why (the gap, zoomed); then the
# context (the US Senate refused the Treaty in November 1919 and March 1920) and a judgement of its use. The still
# (reduced motion) is the whole sheet with the judgement.
import sys, pathlib, math; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

P = 'hnop'
T = 18.0
W, H = 220, 120
END = T - 0.8
CX, CY = 110, 60                     # the middle of the view, where a zoomed spot is brought

def pc(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def fade(name, a, b, c, d):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (P, name, pc(a), pc(b), pc(c), pc(d)))

def look(x, y, s):
    return 'transform: translate(%gpx, %gpx) scale(%g);' % (round(CX - s * x, 1), round(CY - s * y, 1), s)

# where the magnifier is, when: (time, x, y, scale); between two stops it glides
STOPS = [(0, CX, CY, 1), (5.4, CX, CY, 1), (6.2, 110, 104, 2.4), (8.4, 110, 104, 2.4), (9.2, 112, 44, 2.0),
         (11.4, 112, 44, 2.0), (12.2, CX, CY, 1)]
BADGES = [('n', 'N', 2.6, 5.4), ('o', 'O', 5.6, 8.4), ('p', 'P', 8.6, 11.4)]

CAPS = [
    ('c0', 0.2, 2.6, 'a source: how useful is it<i class="%s-ln">for the League\'s weakness?</i>' % P),
    ('c1', 2.6, 5.6, '<b class="%s-g">N</b>ature: a cartoon<i class="%s-ln">made to make a point</i>' % (P, P)),
    ('c2', 5.6, 8.6, '<b class="%s-g">O</b>rigin: Punch, Dec 1919<i class="%s-ln">a British magazine</i>' % (P, P)),
    ('c3', 8.6, 11.6, '<b class="%s-g">P</b>urpose: to mock<i class="%s-ln">the USA, missing from its own League</i>' % (P, P)),
    ('c4', 11.6, 14.4, 'Context: the US Senate<i class="%s-ln">said no, Nov 1919 and Mar 1920</i>' % P),
    ('c5', 14.4, T, 'useful for British opinion<i class="%s-ln">less for why the USA stayed out</i>' % P),
]
STILL = 'c5'

h = ['<div id="splash-%s" aria-hidden="true">' % P,
     '    <svg class="%s-svg" viewBox="0 0 %d %d">' % (P, W, H),
     '      <defs><clipPath id="%s-view"><rect x="0" y="0" width="%d" height="%d" rx="4"/></clipPath></defs>' % (P, W, H),
     '      <g clip-path="url(#%s-view)">' % P,
     '      <g class="%s-cam">' % P,
     '        <rect class="%s-sheet" x="40" y="4" width="140" height="110" rx="2"/>' % P]
# the arch: five blocks from 180° to 0°, the middle one (the keystone) gone
AX, AY, R0, R1 = 112, 70, 22, 36
NAMES = ['BEL', 'FRA', '', 'ENG', 'ITA']
for i in range(5):
    if i == 2: continue
    a0, a1 = math.radians(180 - 36 * i), math.radians(180 - 36 * (i + 1))
    pts = [(AX + R1 * math.cos(a0), AY - R1 * math.sin(a0)), (AX + R1 * math.cos(a1), AY - R1 * math.sin(a1)),
           (AX + R0 * math.cos(a1), AY - R0 * math.sin(a1)), (AX + R0 * math.cos(a0), AY - R0 * math.sin(a0))]
    am = math.radians(180 - 36 * i - 18)
    h.append('        <polygon class="%s-blk" points="%s"/>' % (P, ' '.join('%.1f,%.1f' % p for p in pts)))
    h.append('        <text class="%s-bt" x="%.1f" y="%.1f">%s</text>' % (P, AX + 29 * math.cos(am), AY - 29 * math.sin(am) + 1.5, NAMES[i]))
h.append('        <line class="%s-ground" x1="50" y1="%d" x2="170" y2="%d"/>' % (P, AY, AY))
h.append('        <rect class="%s-blk" x="150" y="%d" width="16" height="9" rx="1" transform="rotate(-8 158 %d)"/>' % (P, AY - 9, AY - 4))
h.append('        <text class="%s-bt" x="158" y="%d" transform="rotate(-8 158 %d)">USA</text>' % (P, AY - 3, AY - 4))
h.append('        <circle class="%s-man" cx="62" cy="%d" r="3"/>' % (P, AY - 15))
h.append('        <path class="%s-mans" d="M62 %dV%dM62 %dL58 %dM62 %dL66 %dM58 %dL62 %dL66 %d"/>' % (P, AY - 12, AY - 5, AY - 10, AY - 7, AY - 10, AY - 7, AY, AY - 5, AY))
h.append('        <text class="%s-cap" x="110" y="86">THE GAP IN THE BRIDGE</text>' % P)
h.append('        <text class="%s-cred" x="110" y="105">Punch, 10 December 1919</text>' % P)
h.append('        <rect class="%s-ring %s-ro" x="80" y="99" width="60" height="9" rx="2"/>' % (P, P))
h.append('        <rect class="%s-ring %s-rp" x="98" y="28" width="28" height="22" rx="3"/>' % (P, P))
h.append('      </g>')
h.append('      </g>')
for c, L, a, b in BADGES:
    h.append('      <g class="%s-badge %s-%s"><circle class="%s-bc" cx="16" cy="16" r="11"/><text class="%s-bl" x="16" y="20.5">%s</text></g>' % (P, P, c, P, P, L))
h.append('    </svg>')
h.append('    <div class="%s-say">' % P)
for c, a, b, html in CAPS:
    h.append('      <span class="%s-t %s-%s">%s</span>' % (P, P, c, html))
h.append('    </div>')
h.append('  </div>')

css = []
css.append('.an-%s { text-align: center; }' % P)
css.append('.an-%s .%s-svg { display: block; width: min(86vw, 21rem); max-width: 100%%; height: auto; margin: 0 auto; }' % (P, P))
css.append('.%s-cam { transform-box: view-box; transform-origin: 0 0; }' % P)
css.append('.%s-sheet { fill: var(--paper); stroke: var(--paper-rule); stroke-width: .8; }' % P)
css.append('.%s-blk { fill: var(--paper-strip); stroke: var(--paper-ink); stroke-width: .8; stroke-linejoin: round; }' % P)
css.append('.%s-bt { font: 700 4.5px var(--mono); fill: var(--paper-ink); text-anchor: middle; }' % P)
css.append('.%s-ground { stroke: var(--paper-dim); stroke-width: .8; }' % P)
css.append('.%s-man { fill: none; stroke: var(--paper-ink); stroke-width: .8; }' % P)
css.append('.%s-mans { fill: none; stroke: var(--paper-ink); stroke-width: .8; stroke-linecap: round; stroke-linejoin: round; }' % P)
css.append('.%s-cap { font: 700 6.5px var(--mono); fill: var(--paper-ink); text-anchor: middle; letter-spacing: .05em; }' % P)
css.append('.%s-cred { font: italic 4.5px var(--mono); fill: var(--paper-dim); text-anchor: middle; }' % P)
css.append('.%s-ring { fill: none; stroke: var(--gold); stroke-width: 1; opacity: 0; }' % P)
css.append('.%s-bc { fill: var(--gold); }' % P)
css.append('.%s-bl { font: 700 12px var(--mono); fill: var(--bg); text-anchor: middle; }' % P)
css.append('.%s-badge { opacity: 0; }' % P)
css.append('.%s-say { display: grid; margin-top: .5rem; min-height: 2.7em; align-items: center; font: 700 .98rem/1.3 var(--mono); color: var(--paper); }' % P)
css.append('.%s-t { grid-area: 1 / 1; }' % P)
css.append('.%s-say b.%s-g { color: var(--gold); }' % (P, P))
css.append('.%s-ln { display: block; font-style: normal; font-weight: 400; opacity: .85; }' % P)
css.append('.%s-t:not(.%s-%s) { opacity: 0; }' % (P, P, STILL))
css.append('.%s-cam { animation: %s-cam %gs ease-in-out infinite; }' % (P, P, T))
css.append('@keyframes %s-cam { %s }' % (P, ' '.join('%s { %s }' % ('0%' if t == 0 else pc(t), look(x, y, s)) for t, x, y, s in STOPS) + ' 100% { ' + look(CX, CY, 1) + ' }'))
for c, L, a, b in BADGES:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
for c, a, b in (('ro', 6.2, 8.4), ('rp', 9.2, 11.4)):
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.2, b))
for c, a, b, html in CAPS:
    css.append('.%s-%s { animation: %s-%s %gs ease-in-out infinite; }' % (P, c, P, c, T))
    css.append(fade(c, a, a + 0.3, b - 0.3, b))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  .%s-cam, .%s-badge, .%s-ring, .%s-t { animation: none; }' % ((P,) * 4))
css.append('}')

anim_row.write_anim('hnop', html='\n'.join(h), css='\n'.join(css))
print('%s: %d lines of markup, %d of CSS' % (P, len(h), len(css)))
