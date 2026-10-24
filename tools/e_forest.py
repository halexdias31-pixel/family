# AFOREST (English Language chapter 8, and a loading splash): writes its <div> and its rules into its row of
# data/textbooks.json through tools/anim_row.py. Edit the tables below and re-run: python3 tools/e_forest.py (416).
#
# WHAT IT DRAWS, in one loop of T seconds: the seven letters of the memory aid in a row; each lights in turn, and the
# device it stands for is named under it with one line of a single argument — save the library — so the seven are
# seen working together on one case, not as a list. Then every letter lights and the whole aid is spelled out.
# REDUCED MOTION shows every letter lit and the aid spelled out.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

ID, P = 'eforest', 'af'
T = 16.0
F = 0.3
FIRST, EACH = 0.4, 1.8          # the first letter lights at FIRST; each holds EACH seconds
ITEMS = [
    ('A', 'anecdote', 'When I was nine, this library taught me to read.'),
    ('F', 'fact', 'The library is free to every child in town.'),
    ('O', 'opinion', 'Closing it would be a disgrace.'),
    ('R', 'rhetorical question', 'Where will our children read then?'),
    ('E', 'emotive language', 'a cold, dark, empty shell'),
    ('S', 'statistics', 'Nine in ten of its readers are under sixteen.'),
    ('T', 'triplet', 'free, warm and open to all'),
]
ALL = FIRST + EACH * len(ITEMS)  # every letter lit from here
GONE = T - .5
SUM = '<b>save the library</b> anecdote &#183; fact &#183; opinion &#183; rhetorical question &#183; emotive language &#183; statistics &#183; triplet'

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def window(name, a, b):
    return '@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }' % (
        P, name, pct(a), pct(a + F), pct(b), pct(b + F))

html = ['<div id="splash-%s" aria-hidden="true">' % ID, '    <div class="af-row">']
html.append('      ' + ''.join('<span class="af-k af-k%d">%s</span>' % (k, it[0]) for k, it in enumerate(ITEMS)))
html.append('    </div>')
html.append('    <div class="af-say">' + ''.join('<span class="af-c af-c%d"><b>%s</b>&#8220;%s&#8221;</span>' % (k, it[1], it[2]) for k, it in enumerate(ITEMS))
            + '<span class="af-c af-cs">%s</span></div>' % SUM)
html.append('    <div class="sp-sig">@family.</div>')
html.append('  </div>')

LIT = 'color: var(--bg, #000); background: var(--gold, #ffb454); border-color: var(--gold, #ffb454)'
DIM = 'color: var(--dim, #9a9a9a); background: transparent; border-color: var(--line, #232323)'
css = [
    '.an-eforest { display: grid; justify-items: center; width: min(100%, 22rem); }',
    '.af-row { display: flex; justify-content: center; gap: clamp(.2rem, 1.4cqi, .45rem); }',
    '.af-k { display: grid; place-items: center; width: clamp(2rem, 11cqi, 2.6rem); aspect-ratio: 1; border: 1px solid; font: 700 clamp(1.1rem, 6cqi, 1.5rem) var(--mono); %s; }' % LIT,
    '.af-say { display: grid; width: 100%; margin-top: 1rem; min-height: 4.4rem; font: 400 .9rem var(--mono); color: var(--ink, #e6e6e6); text-align: center; }',
    '.af-c { grid-area: 1 / 1; }',
    '.af-c:not(.af-cs) { opacity: 0; }',
    '.af-cs { font-size: .8rem; color: var(--dim, #9a9a9a); line-height: 1.5; }',
    '.af-say b { display: block; margin-bottom: .3rem; font-size: .8rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold, #ffb454); }',
]
moving = []
for k in range(len(ITEMS)):
    a, b = FIRST + EACH * k, FIRST + EACH * (k + 1) - F
    css.append('.af-k%d { animation: %s-k%d %gs ease-in-out infinite; }' % (k, P, k, T))
    css.append('@keyframes %s-k%d { 0%%, %s { %s; transform: none; } %s, %s { %s; transform: scale(1.18); } %s, %s { %s; transform: none; } %s, %s { %s; transform: none; } 100%% { %s; transform: none; } }' % (
        P, k, pct(a), DIM, pct(a + F), pct(b), LIT, pct(b + F), pct(ALL), DIM, pct(ALL + F), pct(GONE), LIT, DIM))
    css.append('.af-c%d { animation: %s-c%d %gs ease-in-out infinite; }' % (k, P, k, T))
    css.append(window('c%d' % k, a, b - .05))
    moving += ['.af-k%d' % k, '.af-c%d' % k]
css.append('.af-cs { animation: %s-cs %gs ease-in-out infinite; }' % (P, T))
css.append(window('cs', ALL, GONE))
moving.append('.af-cs')
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  %s { animation: none; }' % ', '.join(moving))
css.append('}')

anim_row.write_anim('eforest', html='\n'.join(html), css='\n'.join(css),
                    place=('TB-GCSE-ENGLANG', 8, 'AFOREST', 'Anecdote|Rule of three'))
print('eforest: %d lines of markup, %d of CSS' % (len(html), len(css)))
