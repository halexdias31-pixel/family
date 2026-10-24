# The story arc, Freytag's pyramid (English Language chapter 5, and a loading splash): writes its <div> and its rules
# into its row of data/textbooks.json through tools/anim_row.py. Edit the tables below and re-run:
# python3 tools/e_arc.py (416).
#
# WHAT IT DRAWS, in one loop of T seconds: the arc of a story drawn as one line, the pen reaching each turn of it as
# that stage is named — exposition, inciting incident, rising action, climax, falling action, resolution — while a
# six-line story of our own (no set text) is told underneath, one line per stage. Then the whole shape is named.
# The line is drawn by stroke-dashoffset, timed from the lengths of its own segments, so the pen keeps one speed.
# REDUCED MOTION shows the whole arc, every stage named, and the name of the shape.
import math
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

ID, P = 'earc', 'fy'
T = 15.0
F = 0.4
W, H = 220, 118
PTS = [(10, 98), (55, 92), (130, 22), (182, 78), (210, 80)]   # the arc's turns
START, END = 0.4, 9.6           # the pen sets off, and arrives
GONE = 14.4                     # everything clears
# (name, svg label x, y, anchor, the turn it belongs to, story line)
STAGES = [
    ('exposition', 10, 112, 'start', 0, 'Mia moves to her gran&#8217;s farm.'),
    ('inciting incident', 60, 112, 'start', 1, 'She finds a locked door in the barn.'),
    ('rising action', 82, 54, 'end', 1, 'A key goes missing; a light flickers at night.'),
    ('climax', 130, 13, 'middle', 2, 'At midnight, she opens the door.'),
    ('falling action', 160, 44, 'start', 2, 'Inside are her grandad&#8217;s old letters.'),
    ('resolution', 210, 96, 'end', 3, 'She reads them to Gran by the fire.'),
]
SUM = (11.6, '<b>Freytag&#8217;s pyramid</b> the shape under every story')

seg = [math.dist(PTS[i], PTS[i + 1]) for i in range(len(PTS) - 1)]
L = sum(seg)
cum = [0.0]
for s in seg: cum.append(cum[-1] + s)
at = [START + (END - START) * c / L for c in cum]               # when the pen reaches each turn
# a stage is named as the pen sets off along it; a point stage (inciting incident, climax) when the pen gets there
when = [at[0], at[1], at[1] + .5, at[2], at[2] + .5, at[3] + .3]

def f(v): return ('%.1f' % v).rstrip('0').rstrip('.')
def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def window(name, a, b, frm='none'):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; transform: %s; } %s, %s { opacity: 1; transform: none; } '
            '%s, 100%% { opacity: 0; transform: none; } }') % (P, name, pct(a), frm, pct(a + F), pct(b), pct(b + F))

d = 'M' + ' L'.join('%d %d' % p for p in PTS)
html = ['<div id="splash-%s" aria-hidden="true">' % ID,
        '    <svg class="fy-svg" viewBox="0 0 %d %d">' % (W, H),
        '      <path class="fy-base" d="M6 100H214"/>',
        '      <path class="fy-line" d="%s"/>' % d]
for i, (x, y) in enumerate(PTS[1:4], 1):
    html.append('      <circle class="fy-dot fy-d%d" cx="%d" cy="%d" r="%s"/>' % (i, x, y, '4' if i == 2 else '3'))
for k, (name, x, y, anchor, *_r) in enumerate(STAGES):
    html.append('      <text class="fy-t fy-t%d" x="%d" y="%d" text-anchor="%s">%s</text>' % (k, x, y, anchor, name))
html.append('    </svg>')
html.append('    <div class="fy-say">' + ''.join('<span class="fy-c fy-c%d"><b>%s</b> %s</span>' % (k, s[0], s[5]) for k, s in enumerate(STAGES))
            + '<span class="fy-c fy-cs">%s</span></div>' % SUM[1])
html.append('    <div class="sp-sig">@family.</div>')
html.append('  </div>')

stops = ' '.join('%s { stroke-dashoffset: %s; }' % (pct(t), f(L - c)) for t, c in zip(at, cum))
css = [
    '.an-earc { display: grid; justify-items: center; width: min(100%, 23rem); }',
    '.fy-svg { width: 100%; height: auto; overflow: visible; }',
    '.fy-base { stroke: var(--line, #232323); stroke-width: 1; }',
    '.fy-line { fill: none; stroke: var(--gold, #ffb454); stroke-width: 2.4; stroke-linejoin: round; stroke-linecap: round; stroke-dasharray: %s; }' % f(L + 1),
    '.fy-dot { fill: var(--bg, #000); stroke: var(--gold, #ffb454); stroke-width: 1.6; transform-box: fill-box; transform-origin: center; }',
    '.fy-d2 { fill: var(--gold, #ffb454); }',
    '.fy-t { font: 400 7.4px var(--mono); fill: var(--ink, #e6e6e6); }',
    '.fy-t3 { font-weight: 700; font-size: 8.6px; fill: var(--gold, #ffb454); }',
    '.fy-say { display: grid; width: 100%; margin-top: .7rem; font: 400 .86rem var(--mono); color: var(--ink, #e6e6e6); text-align: center; }',
    '.fy-c { grid-area: 1 / 1; }',
    '.fy-say b { display: block; margin-bottom: .15rem; font-size: .74rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold, #ffb454); }',
    '.fy-c:not(.fy-cs) { opacity: 0; }',
    '.fy-line { animation: %s-draw %gs linear infinite; }' % (P, T),
    '@keyframes %s-draw { 0%% { stroke-dashoffset: %s; opacity: 1; } %s %s { stroke-dashoffset: 0; opacity: 1; } %s, 100%% { stroke-dashoffset: 0; opacity: 0; } }' % (
        P, f(L + 1), stops, pct(GONE), pct(GONE + F)),
]
moving = ['.fy-line']
for i in range(1, 4):
    css.append('.fy-d%d { animation: %s-d%d %gs ease-out infinite; }' % (i, P, i, T))
    css.append('@keyframes %s-d%d { 0%%, %s { opacity: 0; transform: scale(0); } %s { opacity: 1; transform: scale(1.8); } %s, %s { opacity: 1; transform: none; } %s, 100%% { opacity: 0; transform: none; } }' % (
        P, i, pct(at[i]), pct(at[i] + .3), pct(at[i] + .6), pct(GONE), pct(GONE + F)))
    moving.append('.fy-d%d' % i)
for k in range(len(STAGES)):
    css.append('.fy-t%d { animation: %s-t%d %gs ease-out infinite; }' % (k, P, k, T))
    css.append(window('t%d' % k, when[k], GONE))
    nxt = when[k + 1] if k + 1 < len(STAGES) else SUM[0]
    css.append('.fy-c%d { animation: %s-c%d %gs ease-in-out infinite; }' % (k, P, k, T))
    css.append(window('c%d' % k, when[k], nxt - F))
    moving += ['.fy-t%d' % k, '.fy-c%d' % k]
css.append('.fy-cs { animation: %s-cs %gs ease-in-out infinite; }' % (P, T))
css.append(window('cs', SUM[0], GONE))
moving.append('.fy-cs')
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  %s { animation: none; }' % ', '.join(moving))
css.append('}')

anim_row.write_anim('earc', html='\n'.join(html), css='\n'.join(css),
                    place=('TB-GCSE-ENGLANG', 5, 'The story arc', 'Narrative writing'))
print('earc: %d lines of markup, %d of CSS; the line is %s long' % (len(html), len(css), f(L)))
