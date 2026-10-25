# The cosmological argument as a chain of causes running back into the distance: oak from acorn from oak… Aquinas
# stops the regress with a first, uncaused cause; Hume asks why the chain could not be infinite. Both are drawn.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/418.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, captions, still_block

T = 15.0
END = T - 0.6
css = [""".an-pcause { width: min(92vw, 23rem, 100%); }
.pcs-svg { display: block; width: 100%; height: auto; }
.pcs-box { fill: rgb(244 241 232 / .06); stroke: var(--dim); stroke-width: 1.2; }
.pcs-t { fill: var(--ink); font-family: var(--mono); font-weight: 700; text-anchor: middle; dominant-baseline: central; }
.pcs-ar { fill: none; stroke: var(--faint); stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.pcs-by { fill: var(--faint); font: 600 6.5px var(--mono); text-anchor: middle; }
.pcs-dots { fill: var(--dim); font: 800 12px var(--mono); text-anchor: middle; }
.pcs-first { fill: rgb(240 180 95 / .16); stroke: var(--gold); stroke-width: 1.6; }
.pcs-ft { fill: var(--gold); font: 800 7.5px var(--mono); text-anchor: middle; }
.pcs-q { fill: var(--coral); font: 800 14px var(--mono); text-anchor: middle; }
.pcs-say { display: grid; margin-top: .55rem; font: 600 .82rem/1.4 var(--mono); color: var(--ink); text-align: center; }
.pcs-say > span { grid-area: 1 / 1; }
.pcs-say b { color: var(--gold); }"""]


def show(cls, at, d=0.45, fro='opacity: 0;', to='opacity: 1;'):
    css.append('.%s { animation: %s %gs ease-out infinite; }' % (cls, cls, T))
    css.append(kf(cls, T, [(at, fro), (at + d, to), (END, to), (END + .4, fro)]))


# (centre x, width, height, font size, word), nearest first: each one further back is smaller
LINKS = [(216, 34, 22, 8.5, 'oak'), (175, 30, 19, 7.5, 'acorn'), (139, 26, 17, 7, 'oak'), (108, 23, 15, 6.5, 'acorn'), (82, 20, 13, 6, 'oak')]
Y = 52
parts = []
for k, (cx, w, h, fs, word) in enumerate(LINKS):
    at = 0.4 + 0.8 * k
    parts.append('<g class="pcs-l%d"><rect class="pcs-box" x="%g" y="%g" width="%g" height="%g" rx="3"/>'
                 '<text class="pcs-t" x="%g" y="%g">%s</text></g>' % (k, cx - w / 2, Y - h / 2, w, h, cx, Y, word))
    css.append('.pcs-l%d .pcs-t { font-size: %gpx; }' % (k, fs))
    show('pcs-l%d' % k, at, fro='opacity: 0; transform: translateX(6px);', to='opacity: 1; transform: none;')
    if k:
        x1, x0 = LINKS[k - 1][0] - LINKS[k - 1][1] / 2 - 2, cx + w / 2 + 2
        parts.append('<path class="pcs-ar pcs-a%d" d="M%g %gH%gm3 -2.5l-3 2.5l3 2.5"/>' % (k, x1, Y, x0))
        show('pcs-a%d' % k, at - 0.2)
parts.append('<text class="pcs-by pcs-a1" x="195.5" y="%g">caused by</text>' % (Y - 13))
css.append('.pcs-dots { animation: pcs-dots %gs linear infinite; }' % T)
css.append(kf('pcs-dots', T, [(4.2, 'opacity: 0;'), (4.6, 'opacity: 1;'), (5.2, 'opacity: .3;'), (5.8, 'opacity: 1;'), (6.4, 'opacity: .3;'),
                              (7.0, 'opacity: 1;'), (END, 'opacity: 1;'), (END + .4, 'opacity: 0;')]))
show('pcs-fc', 7.2, d=0.7, fro='opacity: 0; transform: scale(.6);', to='opacity: 1; transform: none;')
css.append('.pcs-fc { transform-box: fill-box; transform-origin: center; }')
show('pcs-q', 10.8, fro='opacity: 0; transform: translateY(4px);', to='opacity: 1; transform: none;')

say, say_css = captions('pcs', T, [
    (0, 5.2, 'This oak came from an acorn, which came from an oak… every effect has a cause'),
    (5.2, 10.4, 'Aquinas: the chain cannot go back for ever, so there is a <b>first cause</b>, itself uncaused'),
    (10.4, T, 'Hume: why could the chain not be infinite? And why must a first cause be God?'),
], end=END)
css.append(say_css)
css.append(still_block('pcause'))

html = '''<div class="an-pcause" aria-hidden="true">
  <svg class="pcs-svg" viewBox="0 0 240 92">
    %s
    <text class="pcs-dots" x="58" y="55">…</text>
    <g class="pcs-fc">
      <rect class="pcs-first" x="6" y="38" width="38" height="28" rx="4"/>
      <text class="pcs-ft" x="25" y="50">first</text>
      <text class="pcs-ft" x="25" y="59">cause</text>
    </g>
    <text class="pcs-q" x="25" y="30">?</text>
  </svg>
  <div class="pcs-say">
%s
  </div>
</div>''' % ('\n    '.join(parts), say)

anim_row.write_anim('pcause', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-PHIL', 'chapter': 2, 'title': 'A chain of causes',
                           'about': "Infinite regress|Aquinas' Second Way"})
