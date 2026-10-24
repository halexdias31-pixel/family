# Scrooge's change, a character arc (English Literature chapter 5, A Christmas Carol, and a loading splash): writes its
# <div> and its rules into its row of data/textbooks.json through tools/anim_row.py. Edit the tables below and re-run:
# python3 tools/e_scrooge.py (416).
#
# WHAT IT DRAWS, in one loop of T seconds: a timeline of the five staves with Scrooge's warmth climbing from cold to warm,
# drawn as one line that changes from ice blue to gold; at each stave a dot lands and a short quotation (Dickens, public
# domain) says where he has got to. Then the arc is named. The line is timed from its own segment lengths, so the pen
# keeps one speed. REDUCED MOTION shows the whole arc, every stave marked, and its name.
import math
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

ID, P = 'escrooge', 'sg'
T = 17.0
F = 0.4
W, H = 220, 112
STAVES = [  # (x, y, what he feels, quotation)
    (34, 90, 'cold', 'solitary as an oyster'),
    (76, 76, 'memory', 'a solitary child, neglected by his friends'),
    (118, 50, 'pity', 'tell me if Tiny Tim will live'),
    (160, 38, 'fear', 'I am not the man I was'),
    (200, 14, 'joy', 'as merry as a school-boy'),
]
START, END = 0.6, 12.6
GONE = T - .5
SUM = (13.2, '<b>character arc</b> from cold isolation to warmth: redemption')

pts = [(x, y) for x, y, *_r in STAVES]
seg = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]
L = sum(seg)
cum = [0.0]
for s in seg: cum.append(cum[-1] + s)
at = [START + (END - START) * c / L for c in cum]

def f(v): return ('%.1f' % v).rstrip('0').rstrip('.')
def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def window(name, a, b):
    return '@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }' % (
        P, name, pct(a), pct(a + F), pct(b), pct(b + F))

html = ['<div id="splash-%s" aria-hidden="true">' % ID,
        '    <svg class="sg-svg" viewBox="0 0 %d %d">' % (W, H),
        '      <defs><linearGradient id="sg-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6cb6ff"/><stop offset="1" stop-color="#ffb454"/></linearGradient></defs>',
        '      <path class="sg-ax" d="M10 6V100H214"/>',
        '      <text class="sg-y" x="13" y="12">warm</text>',
        '      <text class="sg-y" x="13" y="96">cold</text>']
for k, (x, y, *_r) in enumerate(STAVES):
    html.append('      <text class="sg-x" x="%d" y="110" text-anchor="middle">Stave %d</text>' % (x, k + 1))
html.append('      <path class="sg-line" stroke="url(#sg-grad)" d="M%s"/>' % ' L'.join('%d %d' % p for p in pts))
for k, (x, y, *_r) in enumerate(STAVES):
    html.append('      <circle class="sg-d sg-d%d" cx="%d" cy="%d" r="3.4"/>' % (k, x, y))
html.append('    </svg>')
html.append('    <div class="sg-say">' + ''.join('<span class="sg-c sg-c%d"><b>Stave %d &#183; %s</b>&#8220;%s&#8221;</span>' % (k, k + 1, s[2], s[3]) for k, s in enumerate(STAVES))
            + '<span class="sg-c sg-cs">%s</span></div>' % SUM[1])
html.append('    <div class="sp-sig">@family.</div>')
html.append('  </div>')

stops = ' '.join('%s { stroke-dashoffset: %s; }' % (pct(t), f(L - c)) for t, c in zip(at, cum))
css = [
    '.an-escrooge { display: grid; justify-items: center; width: min(100%, 23rem); }',
    '.sg-svg { width: 100%; height: auto; overflow: visible; }',
    '.sg-ax { fill: none; stroke: var(--line, #232323); stroke-width: 1; }',
    '.sg-y, .sg-x { font: 400 6.6px var(--mono); fill: var(--dim, #9a9a9a); }',
    '.sg-line { fill: none; stroke-width: 2.6; stroke-linejoin: round; stroke-linecap: round; stroke-dasharray: %s; }' % f(L + 1),
    '.sg-d { fill: var(--bg, #000); stroke: var(--ink, #e6e6e6); stroke-width: 1.4; transform-box: fill-box; transform-origin: center; }',
    '.sg-d4 { fill: var(--gold, #ffb454); stroke: var(--gold, #ffb454); }',
    '.sg-say { display: grid; width: 100%; margin-top: .6rem; min-height: 3.4rem; font: 400 .88rem var(--mono); color: var(--ink, #e6e6e6); text-align: center; }',
    '.sg-c { grid-area: 1 / 1; }',
    '.sg-c:not(.sg-cs) { opacity: 0; }',
    '.sg-say b { display: block; margin-bottom: .2rem; font-size: .76rem; letter-spacing: .12em; text-transform: uppercase; color: var(--gold, #ffb454); }',
    '.sg-line { animation: %s-draw %gs linear infinite; }' % (P, T),
    '@keyframes %s-draw { 0%% { stroke-dashoffset: %s; opacity: 1; } %s %s { stroke-dashoffset: 0; opacity: 1; } %s, 100%% { stroke-dashoffset: 0; opacity: 0; } }' % (
        P, f(L + 1), stops, pct(GONE), pct(GONE + F)),
]
moving = ['.sg-line']
for k in range(len(STAVES)):
    css.append('.sg-d%d { animation: %s-d%d %gs ease-out infinite; }' % (k, P, k, T))
    css.append('@keyframes %s-d%d { 0%%, %s { opacity: 0; transform: scale(0); } %s { opacity: 1; transform: scale(1.9); } %s, %s { opacity: 1; transform: none; } %s, 100%% { opacity: 0; transform: none; } }' % (
        P, k, pct(at[k]), pct(at[k] + .3), pct(at[k] + .6), pct(GONE), pct(GONE + F)))
    nxt = at[k + 1] if k + 1 < len(STAVES) else SUM[0]
    css.append('.sg-c%d { animation: %s-c%d %gs ease-in-out infinite; }' % (k, P, k, T))
    css.append(window('c%d' % k, at[k], nxt - F))
    moving += ['.sg-d%d' % k, '.sg-c%d' % k]
css.append('.sg-cs { animation: %s-cs %gs ease-in-out infinite; }' % (P, T))
css.append(window('cs', SUM[0], GONE))
moving.append('.sg-cs')
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  %s { animation: none; }' % ', '.join(moving))
css.append('}')

anim_row.write_anim('escrooge', html='\n'.join(html), css='\n'.join(css),
                    place=('TB-GCSE-ENGLIT', 5, 'Scrooge\'s change', 'Redemption'))
print('escrooge: %d lines of markup, %d of CSS; the line is %s long' % (len(html), len(css), f(L)))
