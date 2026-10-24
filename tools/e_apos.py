# Apostrophes (English Language chapter 11, and a loading splash): writes its <div> and its rules into its row of
# data/textbooks.json through tools/anim_row.py. Edit the tables below and re-run: python3 tools/e_apos.py (416).
#
# WHAT IT DRAWS, in one loop of T seconds, three rules, one at a time: OMISSION (the letter that goes is struck out and
# lifts away; the apostrophe drops into the gap it left), POSSESSION (one owner, plural owners ending in s, plural owners
# that do not), and ITS OR IT'S. Each line arrives in turn and its apostrophe pops in gold after it, so the eye goes to
# the mark. REDUCED MOTION shows the possession rule whole: the one pupils get wrong most.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

ID, P = 'eapos', 'ap'
T = 18.0
F = 0.4
# <k> is the apostrophe (and its s) that pops in gold; <x> a letter that is struck out and lifts away; <m> a dim aside
STAGES = [  # (on, off, caption, [(line, appears at)])
    (0.3, 5.9, '<b>omission</b> the apostrophe stands where letters are missing',
     [('do n<x>o</x>t <m>→</m> don<k>&#8217;</k>t', 0.5), ('it i<x>s</x> <m>→</m> it<k>&#8217;</k>s', 2.0),
      ('they a<x>re</x> <m>→</m> they<k>&#8217;</k>re', 3.4)]),
    (6.2, 11.9, '<b>possession</b> one owner &#8217;s &#183; plural in s, just &#8217; &#183; other plurals &#8217;s',
     [('<m>one dog:</m> the dog<k>&#8217;s</k> bone', 6.4), ('<m>two dogs:</m> the dogs<k>&#8217;</k> bones', 8.2),
      ('<m>children:</m> the children<k>&#8217;s</k> toys', 10.0)]),
    (12.2, 17.5, '<b>its or it&#8217;s?</b> if &#8220;it is&#8221; fits, write it&#8217;s',
     [('it<k>&#8217;</k>s <m>= it is</m>', 12.4), ('its <m>= belonging to it</m>', 13.8),
      ('It<k>&#8217;</k>s wagging its tail.', 15.2)]),
]
STILL = 1                       # index of the stage the still frame shows

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def window(name, a, b):
    return '@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }' % (
        P, name, pct(a), pct(a + F), pct(b), pct(b + F))
def arrive(name, t, frm):
    return '@keyframes %s-%s { 0%%, %s { opacity: 0; transform: %s; } %s, 100%% { opacity: 1; transform: none; } }' % (
        P, name, pct(t), frm, pct(t + F + .2))
def strike(name, t):
    return ('@keyframes %s-%s { 0%%, %s { opacity: 1; transform: none; color: inherit; } %s { opacity: 1; transform: none; color: #ff5f56; } '
            '%s, 100%% { opacity: 0; transform: translateY(-.9rem) rotate(-12deg); color: #ff5f56; } }') % (
        P, name, pct(t), pct(t + .5), pct(t + 1.1))

def tag(line, n, k):
    return (line.replace('<k>', '<span class="ap-k ap-k%d%d">' % (n, k)).replace('</k>', '</span>')
                .replace('<x>', '<span class="ap-x ap-x%d%d">' % (n, k)).replace('</x>', '</span>')
                .replace('<m>', '<span class="ap-m">').replace('</m>', '</span>'))

html = ['<div id="splash-%s" aria-hidden="true">' % ID, '    <div class="ap-stage">']
for n, (_a, _b, _c, lines) in enumerate(STAGES):
    html.append('      <div class="ap-s ap-s%d">%s</div>' % (n, ''.join(
        '<div class="ap-l ap-l%d%d">%s</div>' % (n, k, tag(l, n, k)) for k, (l, _t) in enumerate(lines))))
html.append('    </div>')
html.append('    <div class="ap-say">' + ''.join('<span class="ap-c ap-c%d">%s</span>' % (n, s[2]) for n, s in enumerate(STAGES)) + '</div>')
html.append('    <div class="sp-sig">@family.</div>')
html.append('  </div>')

css = [
    '.an-eapos { display: grid; justify-items: center; width: min(100%, 22rem); }',
    '.ap-stage, .ap-say { display: grid; width: 100%; }',
    '.ap-s, .ap-c { grid-area: 1 / 1; }',
    '.ap-s { display: grid; align-content: start; gap: .55rem; min-height: 6.6rem; }',
    '.ap-l { font: 700 clamp(1rem, 5.6cqi, 1.3rem) var(--mono); color: var(--ink, #e6e6e6); text-align: center; white-space: nowrap; }',
    '.ap-m { font-weight: 400; font-size: .8em; color: var(--dim, #9a9a9a); }',
    '.ap-k { display: inline-block; color: var(--gold, #ffb454); }',
    '.ap-x { display: inline-block; }',
    '.ap-say { margin-top: .9rem; font: 400 .82rem var(--mono); color: var(--dim, #9a9a9a); text-align: center; }',
    '.ap-say b { display: block; margin-bottom: .15rem; font-size: 1.05rem; letter-spacing: .12em; text-transform: uppercase; color: var(--ink, #e6e6e6); }',
    ', '.join('.ap-s%d, .ap-c%d' % (n, n) for n in range(len(STAGES)) if n != STILL) + ' { opacity: 0; }',
]
moving = []
for n, (a, b, _c, lines) in enumerate(STAGES):
    css.append('.ap-s%d, .ap-c%d { animation: %s-s%d %gs ease-in-out infinite; }' % (n, n, P, n, T))
    css.append(window('s%d' % n, a, b))
    moving.append('.ap-s%d, .ap-c%d' % (n, n))
    for k, (l, t) in enumerate(lines):
        css.append('.ap-l%d%d { animation: %s-l%d%d %gs ease-out infinite; }' % (n, k, P, n, k, T))
        css.append(arrive('l%d%d' % (n, k), t, 'translateY(.5rem)'))
        moving.append('.ap-l%d%d' % (n, k))
        if '<x>' in l:
            css.append('.ap-x%d%d { opacity: 0; animation: %s-x%d%d %gs ease-in-out infinite; }' % (n, k, P, n, k, T))
            css.append(strike('x%d%d' % (n, k), t + .7))
            moving.append('.ap-x%d%d' % (n, k))
        if '<k>' in l:
            css.append('.ap-k%d%d { animation: %s-k%d%d %gs cubic-bezier(.3,1.6,.6,1) infinite; }' % (n, k, P, n, k, T))
            css.append(arrive('k%d%d' % (n, k), t + (1.9 if '<x>' in l else .7), 'translateY(-1rem) scale(2)'))
            moving.append('.ap-k%d%d' % (n, k))
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  %s { animation: none; }' % ', '.join(moving))
css.append('}')

anim_row.write_anim('eapos', html='\n'.join(html), css='\n'.join(css),
                    place=('TB-GCSE-ENGLANG', 11, 'Apostrophes', 'Apostrophe'))
print('eapos: %d lines of markup, %d of CSS' % (len(html), len(css)))
