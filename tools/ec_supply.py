# Demand and supply, drawn: the market settles where D meets S; demand shifts right (price and quantity both rise), then
# supply shifts left (price rises, quantity falls), each with the new equilibrium and its dashed price and quantity.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/425.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, captions, still_block

T = 14.0
OX, BASE = 34, 184                       # the axes' corner
SX0, SY0, SX1, SY1 = 81, 156, 240, 50    # supply, rising (from x 81, so shifted left it stays right of the axis)
DX0, DY0, DX1, DY1 = 60, 50, 240, 170    # demand, falling
SHIFT = 40
# (t, demand dx, supply dx): rest, demand right, rest, supply left, rest
PHASES = [(0, 0, 0), (2.0, 0, 0), (3.6, SHIFT, 0), (6.0, SHIFT, 0), (7.0, 0, 0), (8.0, 0, 0), (9.6, 0, -SHIFT),
          (12.4, 0, -SHIFT), (13.4, 0, 0)]


def eq(dd, sd):
    """Where the shifted lines cross: supply y = SY0 − k(x − SX0 − sd), demand y = DY0 + k(x − DX0 − dd)."""
    k = (SY0 - SY1) / (SX1 - SX0)
    x = (SY0 - DY0 + k * (SX0 + sd) + k * (DX0 + dd)) / (2 * k)
    return x, DY0 + k * (x - DX0 - dd)


def stops(fmt):
    return [(t, fmt(dd, sd)) for t, dd, sd in PHASES]


css = [""".an-ecsupply { --esd-s: #6fa8dc; width: min(88vw, 22rem, 100%); text-align: center; }
.esd-svg { display: block; width: 100%; height: auto; }
.esd-ax { stroke: var(--dim); stroke-width: 1.2; fill: none; }
.esd-ghost { stroke: var(--faint); stroke-width: 1.5; stroke-dasharray: 3 3; fill: none; }
.esd-s { stroke: var(--esd-s); stroke-width: 2.5; stroke-linecap: round; fill: none; }
.esd-d { stroke: var(--coral); stroke-width: 2.5; stroke-linecap: round; fill: none; }
.esd-lab { font: 700 12px var(--mono); }
.esd-ls { fill: var(--esd-s); }
.esd-ld { fill: var(--coral); }
.esd-t { font: 700 10px var(--mono); fill: var(--dim); }
.esd-gold { fill: var(--gold); }
.esd-old { fill: none; stroke: var(--faint); stroke-width: 1.5; }
.esd-gt { font: 700 10px var(--mono); fill: var(--gold); }
.esd-guide { stroke: var(--gold); stroke-width: 1; stroke-dasharray: 3 3; fill: none; }
.esd-mv { transform-box: view-box; transform-origin: 0 0; }
.esd-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.esd-say > span { grid-area: 1 / 1; }
.esd-say b { color: var(--gold); }"""]


def mover(cls, fmt, ease='ease-in-out'):
    css.append('.%s { %s animation: %s %gs %s infinite; }' % (cls, fmt(0, 0), cls, T, ease))
    css.append(kf(cls, T, stops(fmt)))


mover('esd-dm', lambda dd, sd: 'transform: translateX(%dpx);' % dd)
mover('esd-sm', lambda dd, sd: 'transform: translateX(%dpx);' % sd)
mover('esd-e', lambda dd, sd: 'transform: translate(%.1fpx, %.1fpx);' % eq(dd, sd))
mover('esd-h', lambda dd, sd: 'transform: translate(%dpx, %.1fpx) scaleX(%.1f);' % (OX, eq(dd, sd)[1], eq(dd, sd)[0] - OX))
mover('esd-v', lambda dd, sd: 'transform: translate(%.1fpx, %.1fpx) scaleY(%.1f);' % (eq(dd, sd)[0], eq(dd, sd)[1], BASE - eq(dd, sd)[1]))
mover('esd-p', lambda dd, sd: 'transform: translateY(%.1fpx);' % eq(dd, sd)[1])
mover('esd-q', lambda dd, sd: 'transform: translateX(%.1fpx);' % eq(dd, sd)[0])

say_html, say_css = captions('esd', T, [
    (0, 2.0, 'The market clears at the <b>equilibrium price</b>, where D meets S'),
    (2.0, 7.0, 'Incomes rise: <b>demand shifts right</b> — price up, quantity up'),
    (7.0, 13.0, 'A poor harvest: <b>supply shifts left</b> — price up, quantity down')], end=12.6)
css += [say_css, still_block('ecsupply')]

html = '''<div class="an-ecsupply" aria-hidden="true">
  <svg class="esd-svg" viewBox="0 0 300 206">
    <path class="esd-ghost" d="M%d %dL%d %d"/>
    <path class="esd-ghost" d="M%d %dL%d %d"/>
    <circle class="esd-old" cx="%.1f" cy="%.1f" r="4"/>
    <path class="esd-guide esd-h esd-mv" vector-effect="non-scaling-stroke" d="M0 0H1"/>
    <path class="esd-guide esd-v esd-mv" vector-effect="non-scaling-stroke" d="M0 0V1"/>
    <g class="esd-sm esd-mv">
      <path class="esd-s" d="M%d %dL%d %d"/>
      <text class="esd-lab esd-ls" x="%d" y="%d">S</text>
    </g>
    <g class="esd-dm esd-mv">
      <path class="esd-d" d="M%d %dL%d %d"/>
      <text class="esd-lab esd-ld" x="%d" y="%d">D</text>
    </g>
    <g class="esd-e esd-mv">
      <circle class="esd-gold" r="4.5"/>
    </g>
    <g class="esd-p esd-mv">
      <text class="esd-gt" x="%d" y="4" text-anchor="end">P</text>
    </g>
    <g class="esd-q esd-mv">
      <text class="esd-gt" x="0" y="%d" text-anchor="middle">Q</text>
    </g>
    <path class="esd-ax" d="M%d 16V%dH292"/>
    <text class="esd-t" x="%d" y="12">Price</text>
    <text class="esd-t" x="292" y="202" text-anchor="end">Quantity</text>
  </svg>
  <div class="esd-say">
%s
  </div>
</div>''' % (SX0, SY0, SX1, SY1, DX0, DY0, DX1, DY1, eq(0, 0)[0], eq(0, 0)[1],
             SX0, SY0, SX1, SY1, SX1 + 4, SY1 - 2,
             DX0, DY0, DX1, DY1, DX1 + 4, DY1 + 4,
             OX - 4, BASE + 13, OX, BASE, OX - 26, say_html)

anim_row.write_anim('ecsupply', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-GCSE-ECON', 'chapter': 2, 'title': 'Demand and supply shifting',
                           'about': 'Equilibrium price|Shift in demand|Shift in supply'})
