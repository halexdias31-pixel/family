# Zooming in on a quotation (English Literature chapter 2, Macbeth, and a loading splash): writes its <div> and its rules
# into its row of data/textbooks.json through tools/anim_row.py. Edit the tables below and re-run:
# python3 tools/e_zoom.py (416).
#
# WHAT IT DRAWS, in one loop of T seconds: Macbeth's "Vaulting ambition" lines (1.7, public domain); a lens closes in on
# one word at a time, the word swells and turns gold, and a note under the quotation says what that one word does —
# the habit a top answer shows: a single word, its connotations, and how it ties to the whole play. Then all three
# stay lit and the image is named whole. REDUCED MOTION shows the three words lit and the whole reading.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

ID, P = 'ezoom', 'qz'
T = 16.0
F = 0.4
# the quotation: (text, key word index or None); a None text is a line break
QUOTE = [('', None), ('Vaulting', 0), (' ambition, which ', None), ('o&#8217;erleaps', 1), (' itself', None), (None, None),
         ('And ', None), ('falls', 2), (' on th&#8217; other.', None)]
NOTES = [  # (word, what it does, lit from, to)
    ('vaulting', 'a rider&#8217;s leap over a fence: ambition as a reckless jump', 1.8, 5.4),
    ('o&#8217;erleaps', 'jumps too far and overshoots its mark', 5.8, 9.4),
    ('falls', 'the rider crashes: Shakespeare foreshadows Macbeth&#8217;s own fall', 9.8, 13.4),
]
SUM = (13.8, 'ambition is a leap that carries him too far, and he will fall')
GONE = T - .5

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def window(name, a, b):
    return '@keyframes %s-%s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }' % (
        P, name, pct(a), pct(a + F), pct(b), pct(b + F))

parts = []
for text, k in QUOTE:
    if text is None: parts.append('<br>'); continue
    if not text: continue
    parts.append('<span class="qz-k qz-k%d">%s</span>' % (k, text) if k is not None else text)
html = ['<div id="splash-%s" aria-hidden="true">' % ID,
        '    <div class="qz-q">&#8220;%s&#8221;</div>' % ''.join(parts).replace('<br>', '<span class="qz-br"></span>'),
        '    <div class="qz-who">Macbeth, Act 1 Scene 7</div>',
        '    <div class="qz-say">' + ''.join('<span class="qz-c qz-c%d"><b>%s</b>%s</span>' % (n, w, t) for n, (w, t, _a, _b) in enumerate(NOTES))
        + '<span class="qz-c qz-cs"><b>the whole image</b>%s</span></div>' % SUM[1],
        '    <div class="sp-sig">@family.</div>',
        '  </div>']

HOT = 'color: var(--gold, #ffb454); transform: scale(1.14)'
LIT = 'color: var(--gold, #ffb454); transform: none'
OFF = 'color: var(--ink, #e6e6e6); transform: none'
css = [
    '.an-ezoom { display: grid; justify-items: center; width: min(100%, 22rem); }',
    '.qz-q { font: 700 clamp(1rem, 5.2cqi, 1.25rem) var(--mono); line-height: 1.9; text-align: center; color: var(--ink, #e6e6e6); }',
    '.qz-br { display: block; }',
    '.qz-k { position: relative; display: inline-block; %s; }' % LIT,
    '.qz-k::after { content: ""; position: absolute; inset: -.3rem -.45rem; border: 2px solid var(--gold, #ffb454); border-radius: 50%; opacity: 0; }',
    '.qz-who { margin-top: .2rem; font: 400 .68rem var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--dim, #9a9a9a); }',
    '.qz-say { display: grid; width: 100%; margin-top: .9rem; min-height: 3.6rem; font: 400 .88rem var(--mono); color: var(--ink, #e6e6e6); text-align: center; }',
    '.qz-c { grid-area: 1 / 1; }',
    '.qz-c:not(.qz-cs) { opacity: 0; }',
    '.qz-say b { display: block; margin-bottom: .2rem; font-size: .8rem; letter-spacing: .12em; text-transform: uppercase; color: var(--gold, #ffb454); }',
]
moving = []
for n, (_w, _t, a, b) in enumerate(NOTES):
    css.append('.qz-k%d { animation: %s-k%d %gs ease-in-out infinite; }' % (n, P, n, T))
    css.append('@keyframes %s-k%d { 0%%, %s { %s; } %s, %s { %s; } %s, %s { %s; } %s, %s { %s; } 100%% { %s; } }' % (
        P, n, pct(a), OFF, pct(a + F), pct(b), HOT, pct(b + F), pct(SUM[0]), OFF, pct(SUM[0] + F), pct(GONE), LIT, OFF))
    css.append('.qz-k%d::after { animation: %s-r%d %gs ease-out infinite; }' % (n, P, n, T))
    css.append('@keyframes %s-r%d { 0%%, %s { opacity: 0; transform: scale(2.6); } %s, %s { opacity: 1; transform: none; } %s, 100%% { opacity: 0; transform: none; } }' % (
        P, n, pct(a), pct(a + .7), pct(b), pct(b + F)))
    css.append('.qz-c%d { animation: %s-c%d %gs ease-in-out infinite; }' % (n, P, n, T))
    css.append(window('c%d' % n, a + .3, b))
    moving += ['.qz-k%d' % n, '.qz-k%d::after' % n, '.qz-c%d' % n]
css.append('.qz-cs { animation: %s-cs %gs ease-in-out infinite; }' % (P, T))
css.append(window('cs', SUM[0], GONE))
moving.append('.qz-cs')
css.append('@media (prefers-reduced-motion: reduce) {')
css.append('  %s { animation: none; }' % ', '.join(moving))
css.append('}')

anim_row.write_anim('ezoom', html='\n'.join(html), css='\n'.join(css),
                    place=('TB-GCSE-ENGLIT', 2, 'Zooming in on a quotation', 'Ambition'))
print('ezoom: %d lines of markup, %d of CSS' % (len(html), len(css)))
