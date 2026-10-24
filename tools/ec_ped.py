# Price elasticity and revenue, drawn: two demand curves side by side, each with its total revenue as the box P × Q under
# the point. The price rises on both: on the steep, inelastic curve the box grows; on the flat, elastic one it shrinks.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/425.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
BASE, PX, QX = 176, 20, 1.0               # the axis, px per £ of price, px per unit of quantity
PANELS = [  # (key, left, heading, quantity at price p, price 1, price 2)
    ('i', 22, 'Inelastic', lambda p: 100 - 5 * (p - 4), 4, 6),
    ('e', 166, 'Elastic', lambda p: 100 - 40 * (p - 4), 4, 5),
]
RISE, BACK = (2.0, 3.8), (9.6, 10.8)

css = [""".an-ecped { --eped-box: rgb(240 180 95 / .28); width: min(92vw, 23rem, 100%); text-align: center; }
.eped-svg { display: block; width: 100%; height: auto; }
.eped-ax { stroke: var(--dim); stroke-width: 1.2; fill: none; }
.eped-d { stroke: var(--coral); stroke-width: 2.5; stroke-linecap: round; fill: none; }
.eped-box { fill: var(--eped-box); stroke: var(--gold); stroke-width: 1.5; vector-effect: non-scaling-stroke;
            transform-box: view-box; transform-origin: 0 0; }
.eped-was { fill: none; stroke: var(--faint); stroke-width: 1; stroke-dasharray: 3 3; }
.eped-h { font: 700 12px var(--mono); fill: var(--ink); text-anchor: middle; }
.eped-t { font: 700 10px var(--mono); fill: var(--dim); }
.eped-up { font: 700 11px var(--mono); fill: var(--good); text-anchor: middle; }
.eped-dn { font: 700 11px var(--mono); fill: var(--bad); text-anchor: middle; }
.eped-tr { font: 700 11px var(--mono); fill: var(--gold); text-anchor: middle; }
.eped-dot { fill: var(--gold); }
.eped-mv { transform-box: view-box; transform-origin: 0 0; }
.eped-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.eped-say > span { grid-area: 1 / 1; }
.eped-say b { color: var(--gold); }"""]


def moves(p1, p2, fmt):
    return [(0, fmt(p1)), (RISE[0], fmt(p1)), (RISE[1], fmt(p2)), (BACK[0], fmt(p2)), (BACK[1], fmt(p1))]


svg = []
for key, left, head, q, p1, p2 in PANELS:
    pre = 'eped-' + key
    lo, hi = (1.5, 7.2) if key == 'i' else (3.45, 6.3)
    d = 'M%.1f %.1fL%.1f %.1f' % (left + q(lo) * QX, BASE - lo * PX, left + q(hi) * QX, BASE - hi * PX)
    box = lambda p: 'transform: translate(%dpx, %dpx) scale(%.1f, %.1f);' % (left, BASE, q(p) * QX, p * PX)
    dot = lambda p: 'transform: translate(%.1fpx, %.1fpx);' % (left + q(p) * QX, BASE - p * PX)
    css.append('.%sb { %s animation: %sb %gs ease-in-out infinite; }' % (pre, box(p1), pre, T))
    css.append(kf(pre + 'b', T, moves(p1, p2, box)))
    css.append('.%sd { %s animation: %sd %gs ease-in-out infinite; }' % (pre, dot(p1), pre, T))
    css.append(kf(pre + 'd', T, moves(p1, p2, dot)))
    r1, r2 = p1 * q(p1), p2 * q(p2)
    for k, (on, off) in enumerate([(0, RISE[0] + 0.3), (RISE[1] + 0.2, BACK[0])]):
        css.append('.%sr%d { opacity: %d; animation: %sr%d %gs linear infinite; }' % (pre, k, 0 if k else 1, pre, k, T))
        css.append(fade('%sr%d' % (pre, k), T, on if on else 0.01, off, f=0.3) if k else
                   kf('%sr%d' % (pre, k), T, [(0, 'opacity: 1;'), (off - 0.3, 'opacity: 1;'), (off, 'opacity: 0;'),
                                              (BACK[1], 'opacity: 0;'), (BACK[1] + 0.3, 'opacity: 1;')]))
    good = r2 > r1
    svg.append('''    <text class="eped-h" x="%d" y="14">%s</text>
    <rect class="eped-was" x="%d" y="%d" width="%d" height="%d"/>
    <rect class="eped-box %sb" x="0" y="-1" width="1" height="1"/>
    <path class="eped-d" d="%s"/>
    <g class="%sd eped-mv">
      <circle class="eped-dot" r="4"/>
    </g>
    <path class="eped-ax" d="M%d 22V%dH%d"/>
    <text class="eped-tr %sr0" x="%d" y="%d">TR £%d</text>
    <text class="%s %sr1" x="%d" y="%d">TR £%d %s</text>''' % (
        left + 60, head, left, BASE - p1 * PX, q(p1) * QX, p1 * PX, pre, d, pre, left, BASE, left + 128,
        pre, left + 60, BASE + 16, r1, 'eped-up' if good else 'eped-dn', pre, left + 60, BASE + 16, r2, '▲' if good else '▼'))

say_html, say_css = captions('eped', T, [
    (0, 2.2, 'Price £4, 100 sold: <b>total revenue = price × quantity</b> = £400'),
    (2.2, 6.0, 'Inelastic: price +50%, sales −10%. <b>Revenue rises</b>'),
    (6.0, T, 'Elastic: price +25%, sales −40%. <b>Revenue falls</b>')], end=10.4)
css += [say_css, still_block('ecped')]

html = '''<div class="an-ecped" aria-hidden="true">
  <svg class="eped-svg" viewBox="0 0 300 200">
%s
    <text class="eped-t" x="2" y="30">P</text>
    <text class="eped-t" x="292" y="172" text-anchor="end">Q</text>
  </svg>
  <div class="eped-say">
%s
  </div>
</div>''' % ('\n'.join(svg), say_html)

anim_row.write_anim('ecped', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-GCSE-ECON', 'chapter': 3, 'title': 'Elastic and inelastic revenue',
                           'about': 'Price elasticity of demand (PED)|Total revenue'})
