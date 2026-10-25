# Building a sentence (English Language chapter 10, and a loading splash): writes its <div> and its rules into its row
# of data/textbooks.json through tools/anim_row.py. Edit the tables below and re-run: python3 tools/e_sent.py (416).
#
# WHAT IT DRAWS, in one loop of T seconds: a simple sentence assembled from its subject and verb; the same clause joined
# by "and" to a second one (compound); then a subordinate clause sliding in IN FRONT of the main clause (complex), which
# is the point a pupil misses — a complex sentence can open with its subordinate clause, and then takes a comma.
# Every clause carries its label underneath, coloured as the caption names it. Only opacity and transform move.
# REDUCED MOTION shows the complex sentence, labelled, with its caption: the most the picture has to say in one frame.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

ID, P = 'esent', 'sb'
T = 16.0                        # seconds, one loop
F = 0.4                         # a fade
STAGES = [                      # (stage, on, off, caption)
    (1, 0.3, 5.0, '<b>simple</b> one main clause'),
    (2, 5.3, 10.3, '<b>compound</b> two main clauses joined by and, but, or, so'),
    (3, 10.6, 15.5, '<b>complex</b> a main clause and a subordinate clause'),
]
CHUNKS = {                      # stage: [(words, label, colour class, appears at, comes from)]
    1: [('The fox', 'subject', 'blue', 0.5, 'translateY(-.6rem)'),
        ('ran.', 'verb', 'orange', 1.5, 'translateY(-.6rem)')],
    2: [('The fox ran', 'main clause', 'blue', 5.4, 'none'),
        ('and', 'conjunction', 'gold', 6.4, 'scale(1.8)'),
        ('the hens hid.', 'main clause', 'blue', 7.4, 'translateX(1rem)')],
    3: [('Because the farmer woke,', 'subordinate clause', 'purple', 12.0, 'translateX(-1.4rem)'),
        ('the fox ran.', 'main clause', 'blue', 10.7, 'none')],
}
COLOURS = {'blue': '#6cb6ff', 'orange': '#ff9e64', 'gold': 'var(--gold, #ffb454)', 'purple': '#c8a2ff'}
STILL = 3

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def window(name, a, b):
    return '@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }' % (
        P, name, pct(a), pct(a + F), pct(b), pct(b + F))
def arrive(name, t, frm):
    return '@keyframes %s-%s { 0%%, %s { opacity: 0; transform: %s; } %s, 100%% { opacity: 1; transform: none; } }' % (
        P, name, pct(t), frm, pct(t + F + .2))

html = ['<div id="splash-%s" aria-hidden="true">' % ID, '    <div class="sb-stage">']
for n, *_ in STAGES:
    parts = []
    for k, (words, label, col, *_r) in enumerate(CHUNKS[n]):
        parts.append('<span class="sb-w sb-%s sb-w%d%d"><b>%s</b><i>%s</i></span>' % (col, n, k, words, label))
    html.append('      <div class="sb-s sb-s%d">%s</div>' % (n, ''.join(parts)))
html.append('    </div>')
html.append('    <div class="sb-say">' + ''.join('<span class="sb-c sb-c%d">%s</span>' % (n, cap) for n, _, _, cap in STAGES) + '</div>')
html.append('    <div class="sp-sig">@family.</div>')
html.append('  </div>')

css = [
    '.an-esent { display: grid; justify-items: center; width: min(100%, 22rem); }',
    '.sb-stage, .sb-say { display: grid; width: 100%; }',
    '.sb-s, .sb-c { grid-area: 1 / 1; }',
    '.sb-s { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: .5rem .45rem; min-height: 4.6rem; }',
    '.sb-w { display: inline-flex; flex-direction: column; align-items: center; gap: .3rem; }',
    '.sb-w b { font: 700 clamp(1rem, 5.4cqi, 1.3rem) var(--mono); padding-bottom: .18rem; border-bottom: 2px solid currentColor; white-space: nowrap; }',
    '.sb-w i { font: 400 .62rem var(--mono); font-style: normal; letter-spacing: .1em; text-transform: uppercase; opacity: .85; }',
] + ['.sb-%s { color: %s; }' % (k, v) for k, v in COLOURS.items()] + [
    '.sb-say { margin-top: .9rem; font: 400 .82rem var(--mono); color: var(--dim, #9a9a9a); text-align: center; }',
    '.sb-say b { display: block; margin-bottom: .15rem; font-size: 1.05rem; letter-spacing: .12em; text-transform: uppercase; color: var(--ink, #e6e6e6); }',
    ', '.join('.sb-s%d, .sb-c%d' % (n, n) for n, *_ in STAGES if n != STILL) + ' { opacity: 0; }',
]
moving = []
for n, a, b, _ in STAGES:
    css.append('.sb-s%d, .sb-c%d { animation: %s-s%d %gs ease-in-out infinite; }' % (n, n, P, n, T))
    css.append(window('s%d' % n, a, b))
    moving.append('.sb-s%d, .sb-c%d' % (n, n))
    for k, (_w, _l, _c, t, frm) in enumerate(CHUNKS[n]):
        if frm == 'none': continue
        css.append('.sb-w%d%d { animation: %s-w%d%d %gs ease-out infinite; }' % (n, k, P, n, k, T))
        css.append(arrive('w%d%d' % (n, k), t, frm))
        moving.append('.sb-w%d%d' % (n, k))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  %s { animation: none; }' % ', '.join(moving))
css.append('}')

anim_row.write_anim('esent', html='\n'.join(html), css='\n'.join(css),
                    place=('TB-GCSE-ENGLANG', 10, 'Building a sentence', 'Simple sentence|Compound sentence|Complex sentence'))
print('esent: %d lines of markup, %d of CSS' % (len(html), len(css)))
