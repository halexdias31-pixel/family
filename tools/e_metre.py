# Iambic pentameter (English Literature chapter 11, and a loading splash): writes its <div> and its rules into its row of
# data/textbooks.json through tools/anim_row.py. Edit the tables below and re-run: python3 tools/e_metre.py (416).
#
# WHAT IT DRAWS, in one loop of T seconds: a line of Sonnet 18 beaten out syllable by syllable, each stressed one swelling
# gold (DUM) and each unstressed one small (da); then the five feet are bracketed and counted. Then the witches' chant
# from Macbeth 4.1 does the same in trochees, the beat turned inside out — which is the point Shakespeare makes with it.
# Both lines are public domain. REDUCED MOTION shows the sonnet line scanned, its five feet bracketed and counted.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

ID, P = 'emetre', 'ip'
T = 17.0
F = 0.3
LINES = [  # (feet as [(syllable, stressed)], first beat, beat length, caption, on, off)
    ([[('Shall', 0), ('I', 1)], [('com', 0), ('pare', 1)], [('thee', 0), ('to', 1)], [('a', 0), ('sum', 1)], [('mer&#8217;s', 0), ('day?', 1)]],
     1.0, .5, '<b>iambic pentameter</b> da-DUM five times: the sonnet&#8217;s heartbeat', 0.3, 8.6),
    ([[('Dou', 1), ('ble,', 0)], [('dou', 1), ('ble', 0)], [('toil', 1), ('and', 0)], [('trou', 1), ('ble', 0)]],
     9.6, .55, '<b>trochaic tetrameter</b> DUM-da four times: the witches turn the beat inside out', 8.9, 16.4),
]
WHO = ['Shakespeare, Sonnet 18', 'Macbeth, Act 4 Scene 1']
STILL = 0
BRACKETS_AFTER = .5             # the feet are bracketed this long after the last beat

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def window(name, a, b):
    return '@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }' % (
        P, name, pct(a), pct(a + F), pct(b), pct(b + F))

html = ['<div id="splash-%s" aria-hidden="true">' % ID, '    <div class="ip-stage">']
for n, (feet, *_r) in enumerate(LINES):
    out, k = [], 0
    for j, foot in enumerate(feet):
        ys = ''.join('<span class="ip-y %s ip-y%d%d"><b>%s</b><i>%s</i></span>' % ('ip-s' if s else 'ip-u', n, k + q, syl, 'DUM' if s else 'da')
                     for q, (syl, s) in enumerate(foot))
        k += len(foot)
        out.append('<span class="ip-f"><span class="ip-ys">%s</span><span class="ip-n ip-n%d%d">%d</span></span>' % (ys, n, j, j + 1))
    html.append('      <div class="ip-s%d ip-l"><div class="ip-feet">%s</div><div class="ip-who">%s</div></div>' % (n, ''.join(out), WHO[n]))
html.append('    </div>')
html.append('    <div class="ip-say">' + ''.join('<span class="ip-c ip-c%d">%s</span>' % (n, l[3]) for n, l in enumerate(LINES)) + '</div>')
html.append('    <div class="sp-sig">@family.</div>')
html.append('  </div>')

css = [
    '.an-emetre { display: grid; justify-items: center; width: min(100%, 23rem); }',
    '.ip-stage, .ip-say { display: grid; width: 100%; }',
    '.ip-l, .ip-c { grid-area: 1 / 1; }',
    '.ip-feet { display: flex; flex-wrap: wrap; justify-content: center; gap: .6rem .35rem; }',
    '.ip-f { display: inline-flex; flex-direction: column; align-items: stretch; }',
    '.ip-ys { display: flex; gap: .2rem; }',
    '.ip-y { display: inline-flex; flex-direction: column; align-items: center; min-width: 1.9rem; }',
    '.ip-y b { font: 700 clamp(.95rem, 4.8cqi, 1.2rem) var(--mono); }',
    '.ip-y i { font: 400 .6rem var(--mono); font-style: normal; letter-spacing: .08em; }',
    '.ip-s { color: var(--gold, #ffb454); }',
    '.ip-u { color: var(--dim, #9a9a9a); }',
    '.ip-n { margin-top: .25rem; padding-top: .1rem; border-top: 2px solid #6cb6ff; font: 700 .62rem var(--mono); color: #6cb6ff; text-align: center; transform-origin: center; }',
    '.ip-who { margin-top: .5rem; font: 400 .66rem var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--dim, #9a9a9a); text-align: center; }',
    '.ip-say { margin-top: .8rem; font: 400 .82rem var(--mono); color: var(--dim, #9a9a9a); text-align: center; }',
    '.ip-say b { display: block; margin-bottom: .15rem; font-size: .95rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink, #e6e6e6); }',
    ', '.join('.ip-s%d, .ip-c%d' % (n, n) for n in range(len(LINES)) if n != STILL) + ' { opacity: 0; }',
]
moving = []
for n, (feet, first, beat, _c, on, off) in enumerate(LINES):
    css.append('.ip-s%d, .ip-c%d { animation: %s-s%d %gs ease-in-out infinite; }' % (n, n, P, n, T))
    css.append(window('s%d' % n, on, off))
    moving.append('.ip-s%d, .ip-c%d' % (n, n))
    sylls = [s for foot in feet for s in foot]
    for k, (_syl, s) in enumerate(sylls):
        t = first + beat * k
        big = 'scale(1.45) translateY(-.2rem)' if s else 'scale(.9)'
        css.append('.ip-y%d%d { animation: %s-y%d%d %gs ease-out infinite; }' % (n, k, P, n, k, T))
        css.append('@keyframes %s-y%d%d { 0%%, %s { opacity: .25; transform: none; } %s { opacity: 1; transform: %s; } %s, 100%% { opacity: 1; transform: none; } }' % (
            P, n, k, pct(t), pct(t + .12), big, pct(t + beat * .9)))
        moving.append('.ip-y%d%d' % (n, k))
    last = first + beat * len(sylls) + BRACKETS_AFTER
    for j in range(len(feet)):
        t = last + .25 * j
        css.append('.ip-n%d%d { animation: %s-n%d%d %gs ease-out infinite; }' % (n, j, P, n, j, T))
        css.append('@keyframes %s-n%d%d { 0%%, %s { opacity: 0; transform: scaleX(0); } %s, 100%% { opacity: 1; transform: none; } }' % (
            P, n, j, pct(t), pct(t + F)))
        moving.append('.ip-n%d%d' % (n, j))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  %s { animation: none; }' % ', '.join(moving))
css.append('}')

anim_row.write_anim('emetre', html='\n'.join(html), css='\n'.join(css),
                    place=('TB-GCSE-ENGLIT', 11, 'Iambic pentameter', 'Iambic pentameter'))
print('emetre: %d lines of markup, %d of CSS' % (len(html), len(css)))
