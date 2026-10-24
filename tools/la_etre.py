# Avoir or être: the DR MRS VANDERTRAMP house (GCSE French foundations, chapter 4). The sixteen verbs that take être in
# the passé composé are nearly all movement in and out of a house: a figure arrives, goes in, climbs the stairs, falls
# from the window. The mnemonic's letters light one by one and stay lit; under each, the verb and its passé composé
# with the agreement that être brings, (e); the figure stands where the verb puts it.
# Writes its whole row of data/textbooks.json through tools/anim_row.py (`whole=`). Run: python3 tools/la_etre.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade

ID, P = 'laetre', 'le'
# (letter, verb, participle, English, where the figure stands in the 200 x 120 house: x, y)
V = [('D', 'devenir', 'devenu', 'to become', 112, 101), ('R', 'revenir', 'revenu', 'to come back', 30, 105),
     ('M', 'monter', 'monté', 'to go up', 128, 84), ('R', 'rester', 'resté', 'to stay', 100, 101),
     ('S', 'sortir', 'sorti', 'to go out', 56, 105), ('V', 'venir', 'venu', 'to come', 42, 105),
     ('A', 'aller', 'allé', 'to go', 14, 105), ('N', 'naître', 'né', 'to be born', 96, 63),
     ('D', 'descendre', 'descendu', 'to go down', 128, 84), ('E', 'entrer', 'entré', 'to go in', 80, 101),
     ('R', 'retourner', 'retourné', 'to return', 34, 105), ('T', 'tomber', 'tombé', 'to fall', 166, 96),
     ('R', 'rentrer', 'rentré', 'to go home', 88, 101), ('A', 'arriver', 'arrivé', 'to arrive', 48, 105),
     ('M', 'mourir', 'mort', 'to die', 112, 63), ('P', 'partir', 'parti', 'to leave', 10, 105)]
GAPS = {2, 5}               # a space before the third and the sixth letter: DR MRS VANDERTRAMP
W = 1.4                     # seconds per verb
END = 2.6                   # every letter lit, and the rule said once, before the loop starts again
T = round(W * len(V) + END, 2)

letters = ''.join('%s<span class="%s-l"><span>%s</span><b class="%s-l%d">%s</b></span>'
                  % ('<span class="%s-gap"></span>' % P if k in GAPS else '', P, v[0], P, k, v[0]) for k, v in enumerate(V))
lines = [(k * W, (k + 1) * W, '<b>%s</b> — je suis %s(e) <i>%s</i>' % (v[1], v[2], v[3])) for k, v in enumerate(V)]
lines.append((len(V) * W, T, 'and every reflexive verb: je me suis levé(e)'))
# THE CAPTIONS CROSS-FADE QUICKLY (0.2 s), not anim_row.captions' 0.35 s out then 0.35 s in: at 1.4 s a verb, its
# gap-then-rise left each verb fully up for barely half a second.
cap_html = '\n'.join('    <span class="%s-c%d">%s</span>' % (P, k, w) for k, (a, b, w) in enumerate(lines))
cap_css = '\n'.join('.%s-c%d { opacity: %d; animation: %s-c%d %gs linear infinite; }\n%s'
                     % (P, k, 1 if k == len(lines) - 1 else 0, P, k, T,
                        fade('%s-c%d' % (P, k), T, a + .2 if a else .2, b if k < len(lines) - 1 else T - .2, f=.2))
                     for k, (a, b, w) in enumerate(lines))

html = '''<div class="an-%(id)s" aria-hidden="true">
  <svg class="%(p)s-svg" viewBox="0 0 200 120">
    <path class="%(p)s-roof" d="M62 46 L110 14 L158 46"/>
    <path class="%(p)s-wall" d="M70 46 V92 M70 110 H150 V46 M70 74 H150"/>
    <path class="%(p)s-st" d="M118 110 V102 H124 V94 H130 V86 H136 V78 H142 V74"/>
    <path class="%(p)s-wi" d="M150 54 V66"/>
    <path class="%(p)s-gd" d="M0 110 H200"/>
    <g class="%(p)s-fig"><circle cx="0" cy="-9" r="3.2"/><path d="M0 -6 V2 M-3.5 -3 H3.5 M0 2 L-3 8 M0 2 L3 8"/></g>
  </svg>
  <div class="%(p)s-lets">%(letters)s</div>
  <div class="%(p)s-cap">
%(cap)s
  </div>
</div>''' % {'id': ID, 'p': P, 'letters': letters, 'cap': cap_html}

css = ['''.an-%(id)s { width: min(100cqi, 21rem); text-align: center; }
.%(p)s-svg { width: min(70cqi, 15rem); height: auto; }
.%(p)s-roof, .%(p)s-wall, .%(p)s-st, .%(p)s-gd, .%(p)s-wi { fill: none; stroke: #8a8f98; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.%(p)s-roof { stroke: #e8836b; }
.%(p)s-wi { stroke: #6fa8dc; stroke-width: 3.5; }
.%(p)s-gd { stroke: #555b66; }
.%(p)s-fig { fill: none; stroke: #f0b45f; stroke-width: 2; stroke-linecap: round; transform: translate(%(x0)dpx, %(y0)dpx); animation: %(p)s-fig %(T)gs infinite; }
.%(p)s-fig circle { fill: #f0b45f; stroke: none; }
.%(p)s-lets { display: flex; justify-content: center; margin: .5rem 0 .4rem; font-weight: 800; font-size: 1.2rem; letter-spacing: .02em; }
.%(p)s-gap { width: .55em; }
.%(p)s-l { display: inline-grid; }
.%(p)s-l > span, .%(p)s-l > b { grid-area: 1 / 1; }
.%(p)s-l > span { opacity: .3; }
.%(p)s-l > b { color: #f0b45f; }
.%(p)s-cap { display: grid; min-height: 2.8em; align-items: center; font-size: .98rem; }
.%(p)s-cap > span { grid-area: 1 / 1; }
.%(p)s-cap b { color: #f0b45f; }
.%(p)s-cap i { display: block; font-size: .78rem; font-style: normal; opacity: .65; }''' % {'id': ID, 'p': P, 'T': T, 'x0': V[0][4], 'y0': V[0][5]}]
fig = []
for k, v in enumerate(V):
    a = k * W
    fig.append((a + .35 if k else 0, 'transform: translate(%dpx, %dpx); animation-timing-function: ease-in-out;' % (v[4], v[5])))
    fig.append(((k + 1) * W - .05, 'transform: translate(%dpx, %dpx); animation-timing-function: ease-in-out;' % (v[4], v[5])))
fig.append((T - .4, 'transform: translate(%dpx, %dpx); animation-timing-function: ease-in-out;' % (V[-1][4], V[-1][5])))
fig.append((T, 'transform: translate(%dpx, %dpx);' % (V[0][4], V[0][5])))
css.append(kf('%s-fig' % P, T, fig))
for k in range(len(V)):
    css.append('.%s-l%d { animation: %s-l%d %gs linear infinite; }' % (P, k, P, k, T))
    css.append(fade('%s-l%d' % (P, k), T, k * W + .4, T - .35))
css.append(cap_css)
# REDUCED MOTION: every letter lit, the rule said, the figure where the loop starts (each part's base style).
css.append('''@media (prefers-reduced-motion: reduce) {
  .an-%(id)s, .an-%(id)s * { animation: none; }
}''' % {'id': ID})
css_all = '\n'.join(css)

anim_row.write_anim('laetre', html=html, css=css_all,
                    whole={'book_id': 'TB-GCSE-FRENCH-FOUND', 'chapter': 4, 'title': 'The DR MRS VANDERTRAMP house',
                           'about': 'DR MRS VANDERTRAMP|Être agreement'})
print('%s: %d characters of markup, %d of CSS, a %gs loop' % (ID, len(html), len(css_all), T))
