# How a rise in interest rates works through, drawn: the Bank of England raises the base rate, and the change passes down
# a chain — banks' loan and saving rates, borrowing and saving, spending, demand — until inflation falls back towards
# the 2% target. Each link lights in turn. The whole row is this script's output (tools/anim_row.py, `whole=`); re-run
# it after any change. docs/history/425.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 14.0
STEPS = [
    ('Bank of England', 'base rate 5.00% → <tspan class="erat-g">5.50%</tspan>'),
    ('Banks', 'loan and mortgage rates rise'),
    ('Households and firms', 'borrow less, save more'),
    ('Spending', 'consumption and investment fall'),
    ('Demand', 'firms sell less, raise prices less'),
    ('Inflation', '6% → <tspan class="erat-g">falling towards 2%</tspan>'),
]
X0, W, H, GAP, TOP = 16, 268, 30, 9, 6
FIRST, EACH, OFF = 0.6, 1.5, 13.4

css = [""".an-ecrates { width: min(88vw, 22rem, 100%); text-align: center; }
.erat-svg { display: block; width: 100%; height: auto; }
.erat-box { fill: var(--raised); stroke: var(--line); stroke-width: 1.2; }
.erat-lit { fill: none; stroke: var(--gold); stroke-width: 2; }
.erat-h { font: 700 11px var(--mono); fill: var(--gold); }
.erat-t { font: 700 10px var(--mono); fill: var(--ink); }
.erat-g { fill: var(--gold); }
.erat-arr { stroke: var(--dim); stroke-width: 1.5; fill: none; }
.erat-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.erat-say > span { grid-area: 1 / 1; }
.erat-say b { color: var(--gold); }"""]

svg = []
for k, (head, line) in enumerate(STEPS):
    y = TOP + k * (H + GAP)
    on = FIRST + k * EACH
    cls = 'erat-s%d' % k
    svg.append('''    <g class="%s">
      <rect class="erat-box" x="%d" y="%d" width="%d" height="%d" rx="6"/>
      <rect class="erat-lit" x="%d" y="%d" width="%d" height="%d" rx="6"/>
      <text class="erat-h" x="%d" y="%d">%s</text>
      <text class="erat-t" x="%d" y="%d">%s</text>
    </g>''' % (cls, X0, y, W, H, X0, y, W, H, X0 + 8, y + 12, head, X0 + 8, y + 25, line))
    if k:
        svg.append('    <path class="erat-arr %sa" d="M150 %dV%dm-4 -4l4 4l4 -4"/>' % (cls, y - GAP + 1, y - 1))
        css.append('.%sa { opacity: 1; animation: %sa %gs linear infinite; }' % (cls, cls, T))
        css.append(fade(cls + 'a', T, on - 0.35, OFF, f=0.3))
    css.append('.%s { opacity: 1; animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(fade(cls, T, on, OFF, f=0.35, lo=0.18))

say_html, say_css = captions('erat', T, [
    (0, 3.6, '<b>Monetary policy</b>: the Bank of England raises the base rate'),
    (3.6, 7.8, 'Borrowing costs more and saving pays more, so <b>spending falls</b>'),
    (7.8, T, 'Less demand, so prices rise more slowly: <b>inflation falls</b> towards the 2% target')], end=13.2)
css += [say_css, still_block('ecrates')]

height = TOP + len(STEPS) * (H + GAP) - GAP + 4
html = '''<div class="an-ecrates" aria-hidden="true">
  <svg class="erat-svg" viewBox="0 0 300 %d">
%s
  </svg>
  <div class="erat-say">
%s
  </div>
</div>''' % (height, '\n'.join(svg), say_html)

anim_row.write_anim('ecrates', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-GCSE-ECON', 'chapter': 9, 'title': 'How a rate rise works through',
                           'about': 'Monetary policy|Base rate'})
