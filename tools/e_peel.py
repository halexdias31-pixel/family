# A paragraph that analyses (English Language chapter 4, and a loading splash): writes its <div> and its rules into its
# row of data/textbooks.json through tools/anim_row.py. Edit the tables below and re-run: python3 tools/e_peel.py (416).
#
# WHAT IT DRAWS, in one loop of T seconds: a paragraph about Scrooge assembled block by block, Point, Evidence, Explain,
# Link, each with its letter on a coloured tab; then the tabs turn over to What, How, How, Why — the same paragraph read
# as the deeper method — and the Explain block glows, because the How is where the marks are. The quotation is
# Dickens's own, public domain. REDUCED MOTION shows the finished PEEL paragraph with its tabs.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

ID, P = 'epeel', 'pe'
T = 16.0
F = 0.4
TURN = 8.4                      # when the tabs turn from PEEL to What, How, Why
GONE = 15.3                     # when the paragraph clears for the loop to start again
BLOCKS = [  # (letter, deeper word, colour, text, appears at)
    ('P', 'what', '#6cb6ff', 'Dickens shows Scrooge is cut off from other people.', 0.4),
    ('E', 'how', '#ff9e64', 'He is &#8220;solitary as an oyster&#8221;.', 1.9),
    ('E', 'how', '#c8a2ff', 'The simile shuts him in a hard shell, yet an oyster can hide a pearl.', 3.4),
    ('L', 'why', 'var(--gold, #ffb454)', 'So his change at the end feels earned, and hits harder.', 4.9),
]
CAPS = [('<b>PEEL</b> point &#183; evidence &#183; explain &#183; link', 0.3, TURN - .3),
        ('<b>what &#183; how &#183; why</b> the method, and the writer&#8217;s purpose', TURN, GONE)]

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def window(name, a, b, frm='none'):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 0; transform: %s; } %s, %s { opacity: 1; transform: none; } '
            '%s, 100%% { opacity: 0; transform: none; } }') % (P, name, pct(a), frm, pct(a + F + .2), pct(b), pct(b + F))

html = ['<div id="splash-%s" aria-hidden="true">' % ID, '    <div class="pe-par">']
for k, (letter, word, col, text, _t) in enumerate(BLOCKS):
    html.append('      <div class="pe-b pe-b%d"><span class="pe-t"><span class="pe-l">%s</span><span class="pe-w">%s</span></span>'
                '<span class="pe-x">%s</span></div>' % (k, letter, word, text))
html.append('    </div>')
html.append('    <div class="pe-say">' + ''.join('<span class="pe-c pe-c%d">%s</span>' % (n, c[0]) for n, c in enumerate(CAPS)) + '</div>')
html.append('    <div class="sp-sig">@family.</div>')
html.append('  </div>')

css = [
    '.an-epeel { display: grid; justify-items: center; width: min(100%, 22rem); }',
    '.pe-par { display: grid; gap: .4rem; width: 100%; }',
    '.pe-b { display: flex; align-items: stretch; gap: .55rem; border: 1px solid var(--line, #232323); border-left: 3px solid var(--c); background: rgb(255 255 255 / .03); }',
] + ['.pe-b%d { --c: %s; }' % (k, b[2]) for k, b in enumerate(BLOCKS)] + [
    '.pe-t { display: grid; place-items: center; flex: none; width: 3.1rem; font: 700 .78rem var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--c); }',
    '.pe-l, .pe-w { grid-area: 1 / 1; }',
    '.pe-l { font-size: 1.25rem; }',
    '.pe-w { opacity: 0; }',
    '.pe-x { padding: .45rem .5rem .45rem 0; font: 400 clamp(.8rem, 3.9cqi, .95rem) var(--mono); line-height: 1.35; color: var(--ink, #e6e6e6); }',
    '.pe-say { display: grid; width: 100%; margin-top: .8rem; font: 400 .82rem var(--mono); color: var(--dim, #9a9a9a); text-align: center; }',
    '.pe-c { grid-area: 1 / 1; }',
    '.pe-c1 { opacity: 0; }',
    '.pe-say b { display: block; margin-bottom: .15rem; font-size: 1.05rem; letter-spacing: .12em; text-transform: uppercase; color: var(--ink, #e6e6e6); }',
]
moving = []
for k, b in enumerate(BLOCKS):
    css.append('.pe-b%d { animation: %s-b%d %gs ease-out infinite; }' % (k, P, k, T))
    css.append(window('b%d' % k, b[4], GONE, 'translateX(-1.2rem)'))
    moving.append('.pe-b%d' % k)
css.append('.pe-l { animation: %s-l %gs ease-in-out infinite; }' % (P, T))
css.append('@keyframes %s-l { 0%%, %s { opacity: 1; transform: none; } %s, 100%% { opacity: 0; transform: rotateX(90deg); } }' % (P, pct(TURN), pct(TURN + F)))
css.append('.pe-w { animation: %s-w %gs ease-in-out infinite; }' % (P, T))
css.append('@keyframes %s-w { 0%%, %s { opacity: 0; transform: rotateX(-90deg); } %s, 100%% { opacity: 1; transform: none; } }' % (P, pct(TURN + F), pct(TURN + 2 * F)))
css.append('.pe-b2 .pe-x { animation: %s-glow %gs ease-in-out infinite; }' % (P, T))
css.append('@keyframes %s-glow { 0%%, %s { color: var(--ink, #e6e6e6); } %s, %s { color: #c8a2ff; } %s, 100%% { color: var(--ink, #e6e6e6); } }' % (
    P, pct(TURN + 1), pct(TURN + 1.6), pct(GONE - 1.5), pct(GONE - .5)))
moving += ['.pe-l', '.pe-w', '.pe-b2 .pe-x']
for n, (_c, a, b) in enumerate(CAPS):
    css.append('.pe-c%d { animation: %s-c%d %gs ease-in-out infinite; }' % (n, P, n, T))
    css.append(window('c%d' % n, a, b))
    moving.append('.pe-c%d' % n)
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  %s { animation: none; }' % ', '.join(moving))
css.append('}')

anim_row.write_anim('epeel', html='\n'.join(html), css='\n'.join(css),
                    place=('TB-GCSE-ENGLANG', 4, 'A paragraph that analyses', 'Embedded quotation|Writer\'s methods'))
print('epeel: %d lines of markup, %d of CSS' % (len(html), len(css)))
