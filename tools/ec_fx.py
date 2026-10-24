# The exchange rate and trade, drawn: a £20 UK shirt priced in dollars and a $30 US game priced in pounds, as bars, while
# the pound goes from $1.25 to $1.50 (exports dearer, imports cheaper) and then down to $1.00 (exports cheaper, imports
# dearer). The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change.
# docs/history/425.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 15.0
RATES = [1.25, 1.50, 1.00]
HOLD = [(0, 2.4), (3.4, 7.6), (8.6, 13.6)]     # each rate reached at the first time, held to the second
SHIRT, GAME = 20, 30
PX = 4.4                                         # px a dollar or a pound
L = 24                                           # the bars' left edge

css = [""".an-ecfx { --efx-ex: #6fa8dc; --efx-im: var(--coral); width: min(88vw, 22rem, 100%); text-align: center; }
.efx-svg { display: block; width: 100%; height: auto; }
.efx-h { font: 700 11px var(--mono); fill: var(--ink); }
.efx-t { font: 700 10px var(--mono); fill: var(--dim); }
.efx-rate { font: 700 16px var(--mono); fill: var(--gold); text-anchor: middle; }
.efx-ex { fill: var(--efx-ex); transform-box: fill-box; transform-origin: 0 0; }
.efx-im { fill: var(--efx-im); transform-box: fill-box; transform-origin: 0 0; }
.efx-v { font: 700 12px var(--mono); fill: var(--ink); }
.efx-up { font: 700 10px var(--mono); fill: var(--bad); }
.efx-dn { font: 700 10px var(--mono); fill: var(--good); }
.efx-base { stroke: var(--dim); stroke-width: 1; }
.efx-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.efx-say > span { grid-area: 1 / 1; }
.efx-say b { color: var(--gold); }"""]


def bar(cls, value):
    stops = []
    for r, (a, b) in zip(RATES, HOLD):
        stops += [(a, 'transform: scaleX(%.1f);' % (value(r) * PX)), (b, 'transform: scaleX(%.1f);' % (value(r) * PX))]
    stops.append((T, 'transform: scaleX(%.1f);' % (value(RATES[0]) * PX)))
    css.append('.%s { transform: scaleX(%.1f); animation: %s %gs ease-in-out infinite; }' % (cls, value(RATES[0]) * PX, cls, T))
    css.append(kf(cls, T, stops))


bar('efx-xb', lambda r: SHIRT * r)
bar('efx-mb', lambda r: GAME / r)

texts = []
for k, (r, (a, b)) in enumerate(zip(RATES, HOLD)):
    last = k == len(RATES) - 1
    cls = 'efx-p%d' % k
    ex, im = SHIRT * r, GAME / r
    note_x = '' if k == 0 else ('dearer ▲' if r > RATES[0] else 'cheaper ▼')
    note_m = '' if k == 0 else ('cheaper ▼' if r > RATES[0] else 'dearer ▲')
    cx = 'efx-up' if r > RATES[0] else 'efx-dn'
    cm = 'efx-dn' if r > RATES[0] else 'efx-up'
    texts.append('''    <g class="%s">
      <text class="efx-rate" x="150" y="22">£1 = $%.2f</text>
      <text class="efx-v" x="168" y="69">$%g</text>
      <text class="%s" x="214" y="68">%s</text>
      <text class="efx-v" x="168" y="125">£%g</text>
      <text class="%s" x="214" y="124">%s</text>
    </g>''' % (cls, r, round(ex, 2), cx, note_x, round(im, 2), cm, note_m))
    css.append('.%s { opacity: %d; animation: %s %gs linear infinite; }' % (cls, 1 if last else 0, cls, T))
    css.append(fade(cls, T, a + 0.2 if k else 0.01, (b + 0.5) if not last else T - 0.4, f=0.3) if k else
               kf(cls, T, [(0, 'opacity: 1;'), (b + 0.2, 'opacity: 1;'), (b + 0.5, 'opacity: 0;'), (T - 0.4, 'opacity: 0;'), (T, 'opacity: 1;')]))

say_html, say_css = captions('efx', T, [
    (0, 3.0, 'A UK shirt sold in the US, a US game sold in the UK'),
    (3.0, 8.1, 'The pound <b>appreciates</b>: exports dearer, imports cheaper — SPICED'),
    (8.1, T, 'The pound <b>depreciates</b>: exports cheaper, imports dearer')], end=13.8)
css += [say_css, still_block('ecfx')]

html = '''<div class="an-ecfx" aria-hidden="true">
  <svg class="efx-svg" viewBox="0 0 300 134">
    <text class="efx-h" x="%d" y="44">UK export: a £20 shirt</text>
    <text class="efx-t" x="%d" y="56">its price in the US</text>
    <rect class="efx-ex efx-xb" x="%d" y="60" width="1" height="8"/>
    <path class="efx-base" d="M%d 58V70"/>
    <text class="efx-h" x="%d" y="100">UK import: a $30 game</text>
    <text class="efx-t" x="%d" y="112">its price in the UK</text>
    <rect class="efx-im efx-mb" x="%d" y="116" width="1" height="8"/>
    <path class="efx-base" d="M%d 114V126"/>
%s
  </svg>
  <div class="efx-say">
%s
  </div>
</div>''' % (L, L, L, L, L, L, L, L, '\n'.join(texts), say_html)

anim_row.write_anim('ecfx', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-GCSE-ECON', 'chapter': 10, 'title': 'The pound, exports and imports',
                           'about': 'Exchange rate|Appreciation and depreciation'})
