# The timeline of tenses (GCSE French foundations, chapter 6): a line from hier through aujourd'hui to demain, a marker
# walking it, and at each stop the same verb, manger, in that time frame's tense — j'ai mangé, je mange, je vais manger —
# with the tense's name. It is the chapter's three-time-frames sentence, taken a clause at a time.
# Writes its whole row of data/textbooks.json through tools/anim_row.py (`whole=`). Run: python3 tools/la_time.py
#
# THE MARKER MOVES IN THE SVG'S OWN UNITS: a CSS translate on an SVG element is in user units, so the stops below are
# the ticks' x, and the drawing scales with its box at any width.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions

ID, P = 'latime', 'lt'
X = [40, 150, 260]                          # the three ticks, in a 300-wide viewBox
STOPS = [('hier', 'passé composé', "Hier, j'ai <b>mangé</b> une pizza."),
         ("aujourd'hui", 'présent', "Aujourd'hui, je <b>mange</b> des pâtes."),
         ('demain', 'futur proche', 'Demain, je <b>vais manger</b> un curry.')]
W = 3.0                                     # seconds at each stop, the walk included
T = W * len(STOPS) + .6
COL = ['#e889a8', '#f0b45f', '#6fa8dc']

ticks = '\n'.join('''    <g class="%s-k%d">
      <circle class="%s-t" cx="%d" cy="34" r="5"/>
      <text class="%s-w" x="%d" y="18">%s</text>
      <text class="%s-n" x="%d" y="56">%s</text>
    </g>''' % (P, k, P, x, P, x, w, P, x, n) for k, (x, (w, n, s)) in enumerate(zip(X, STOPS)))
lines = [(k * W, (k + 1) * W, s) for k, (w, n, s) in enumerate(STOPS)]
cap_html, cap_css = captions(P, T, lines, end=T - .35)

html = '''<div class="an-%(id)s" aria-hidden="true">
  <svg class="%(p)s-svg" viewBox="0 0 300 66">
    <line class="%(p)s-ln" x1="14" y1="34" x2="290" y2="34"/>
    <path class="%(p)s-hd" d="M284 28 L292 34 L284 40"/>
%(ticks)s
    <circle class="%(p)s-dot" cx="0" cy="34" r="7"/>
  </svg>
  <div class="%(p)s-cap">
%(cap)s
  </div>
</div>''' % {'id': ID, 'p': P, 'ticks': ticks, 'cap': cap_html}

css = ['''.an-%(id)s { width: min(100cqi, 22rem); text-align: center; }
.%(p)s-svg { width: 100%%; height: auto; overflow: visible; }
.%(p)s-ln, .%(p)s-hd { fill: none; stroke: #8a8f98; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.%(p)s-t { fill: #1b1f27; stroke: #8a8f98; stroke-width: 2; }
.%(p)s-w { fill: currentColor; font-size: 13px; font-weight: 700; text-anchor: middle; }
.%(p)s-n { fill: currentColor; font-size: 10px; text-anchor: middle; opacity: .7; }
.%(p)s-k0, .%(p)s-k1, .%(p)s-k2 { opacity: .45; }
.%(p)s-k0 { color: %(c0)s; } .%(p)s-k1 { color: %(c1)s; } .%(p)s-k2 { color: %(c2)s; }
.%(p)s-dot { fill: #f0b45f; transform: translateX(%(x0)dpx); animation: %(p)s-dot %(T)gs infinite; }
.%(p)s-cap { display: grid; margin-top: .5rem; font-size: 1.05rem; min-height: 2.8em; align-items: center; }
.%(p)s-cap > span { grid-area: 1 / 1; }
.%(p)s-cap b { color: #f0b45f; }''' % {'id': ID, 'p': P, 'T': T, 'x0': X[0], 'c0': COL[0], 'c1': COL[1], 'c2': COL[2]}]
dot = []
for k, x in enumerate(X):
    a = k * W
    dot.append((a + (.0 if k == 0 else .6), 'transform: translateX(%dpx); animation-timing-function: ease-in-out;' % x))
    dot.append((a + W - .01 if k < len(X) - 1 else T - .6, 'transform: translateX(%dpx); animation-timing-function: ease-in-out;' % x))
dot.append((T, 'transform: translateX(%dpx);' % X[0]))
css.append(kf('%s-dot' % P, T, dot))
for k in range(len(X)):
    a = k * W + (.0 if k == 0 else .6)
    css.append('.%s-k%d { animation: %s-k%d %gs linear infinite; }' % (P, k, P, k, T))
    css.append(fade('%s-k%d' % (P, k), T, a + .2, k * W + W if k < len(X) - 1 else T - .6, lo=.45, hi=1))
css.append(cap_css)
# REDUCED MOTION: the marker at tomorrow, every stop lit, and the last sentence up (captions' base style).
css.append('''@media (prefers-reduced-motion: reduce) {
  .an-%(id)s, .an-%(id)s * { animation: none; }
  .%(p)s-k0, .%(p)s-k1, .%(p)s-k2 { opacity: 1; }
  .%(p)s-dot { transform: translateX(%(x)dpx); }
}''' % {'id': ID, 'p': P, 'x': X[2]})
css_all = '\n'.join(css)

anim_row.write_anim('latime', html=html, css=css_all,
                    whole={'book_id': 'TB-GCSE-FRENCH-FOUND', 'chapter': 6, 'title': 'Hier, aujourd’hui, demain',
                           'about': 'Time frame|Near future'})
print('%s: %d characters of markup, %d of CSS' % (ID, len(html), len(css_all)))
