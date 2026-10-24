# Parametric equations, drawn: one parameter t runs along a slider; x = 2 cos t and y = sin 2t each move a shadow
# along its own axis, and the point they make together traces a figure of eight.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block, sine_stops

T = 11.0
CX, CY, SX, SY = 150, 96, 62, 56     # the origin; px per unit across and up
SL0, SL1, SLY = 40, 260, 192         # the t slider
RUN = (0.6, 8.8)
N = 32
TS = [2 * math.pi * k / N for k in range(N + 1)]
AT = [RUN[0] + (RUN[1] - RUN[0]) * k / N for k in range(N + 1)]
STILL = math.pi / 3


def pt(t): return (CX + SX * 2 * math.cos(t), CY - SY * math.sin(2 * t))
def tr(x, y): return 'translate(%.2fpx, %.2fpx)' % (x, y)


fine = [pt(2 * math.pi * i / 400) for i in range(401)]
curve_d = 'M' + ' L'.join('%.1f %.1f' % p for p in fine[::4])
seg = [0.0]
for a, b in zip(fine, fine[1:]): seg.append(seg[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))


def drawn(t): return seg[min(int(round(t / (2 * math.pi) * 400)), 400)] / seg[-1]


TWO = 2 * math.pi
# x = 2 cos t and y = sin 2t are each a sine, so each moves on a handful of eased stops (anim_row.sine_stops)
XPX = lambda v: CX + SX * 2 * v                      # v = sin(t + π/2) = cos t
YPX = lambda v: CY - SY * v                          # v = sin 2t
def sx(fmt): return sine_stops(RUN[0], RUN[1], math.pi / 2, math.pi / 2 + TWO, fmt) + [(10.4, fmt(1) + ' animation-timing-function: linear;')]
def sy(fmt): return sine_stops(RUN[0], RUN[1], 0, 2 * TWO, fmt) + [(10.4, fmt(0) + ' animation-timing-function: linear;')]
MOVERS = {   # class: (stops, the still's declaration at t = STILL)
    'apm-px': (sx(lambda v: 'transform: translateX(%.1fpx);' % XPX(v)), 'transform: translateX(%.1fpx);' % XPX(math.cos(STILL))),
    'apm-py': (sy(lambda v: 'transform: translateY(%.1fpx);' % YPX(v)), 'transform: translateY(%.1fpx);' % YPX(math.sin(2 * STILL))),
    'apm-vx': (sy(lambda v: 'transform: translateY(%dpx) scaleY(%.1f);' % (CY, YPX(v) - CY)), 'transform: translateY(%dpx) scaleY(%.1f);' % (CY, YPX(math.sin(2 * STILL)) - CY)),
    'apm-vy': (sx(lambda v: 'transform: translateX(%dpx) scaleX(%.1f);' % (CX, XPX(v) - CX)), 'transform: translateX(%dpx) scaleX(%.1f);' % (CX, XPX(math.cos(STILL)) - CX)),
    'apm-knob': ([(RUN[0], 'transform: translateX(%dpx);' % SL0), (RUN[1], 'transform: translateX(%dpx);' % SL1), (10.4, 'transform: translateX(%dpx);' % SL1)],
                 'transform: translateX(%.1fpx);' % (SL0 + (SL1 - SL0) * STILL / TWO)),
    'apm-fill': ([(RUN[0], 'transform: scaleX(0);'), (RUN[1], 'transform: scaleX(%d);' % (SL1 - SL0)), (10.4, 'transform: scaleX(%d);' % (SL1 - SL0))],
                 'transform: scaleX(%.1f);' % ((SL1 - SL0) * STILL / TWO)),
    'apm-curve': ([(AT[k], 'stroke-dashoffset: %.3f;' % (1 - drawn(t))) for k, t in enumerate(TS)] + [(10.4, 'stroke-dashoffset: 0;')], 'stroke-dashoffset: 0;'),
}
css = [""".an-aparam { --apm-x: #6fd8c4; --apm-y: #6fa8dc; width: min(88vw, 22rem, 100%); text-align: center; }
.apm-svg { display: block; width: 100%; height: auto; }
.apm-ax { stroke: var(--dim); stroke-width: 1; fill: none; }
.apm-t { font: 700 11px var(--mono); fill: var(--dim); }
.apm-big { font: 700 12px var(--mono); }
.apm-mv { transform-box: view-box; transform-origin: 0 0; }
.apm-curve { stroke: var(--gold); stroke-width: 2.4; fill: none; stroke-dasharray: 1; stroke-linejoin: round; }
.apm-ghost { stroke: var(--gold); stroke-opacity: .16; stroke-width: 2.4; fill: none; }
.apm-ptc { fill: var(--ink); }
.apm-xc, .apm-tx { fill: var(--apm-x); }
.apm-yc, .apm-ty { fill: var(--apm-y); }
.apm-vx { stroke: var(--apm-x); stroke-width: 1.2; stroke-dasharray: 3 3; }
.apm-vy { stroke: var(--apm-y); stroke-width: 1.2; stroke-dasharray: 3 3; }
.apm-track { stroke: var(--dim); stroke-opacity: .4; stroke-width: 4; stroke-linecap: round; }
.apm-fill { fill: var(--ink); }
.apm-knobc { fill: var(--ink); }
.apm-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.apm-say > span { grid-area: 1 / 1; }
.apm-say b { color: var(--gold); }"""]
for cls, (st, base) in MOVERS.items():
    first = st[0][1].split(' animation-timing-function')[0]
    css.append('.%s { %s animation: %s %gs linear infinite; }' % (cls, base, cls, T))
    css.append(kf(cls, T, [(0, first)] + st + [(10.6, first)]))
css.append('.apm-fx { animation: apm-fx %gs linear infinite; }' % T)
css.append(fade('apm-fx', T, 0.3, 10.1))
say_html, say_css = captions('apm', T, [
    (0, 3.4, 'One parameter, t, drives both: <b>x = 2 cos t, y = sin 2t</b>'),
    (3.4, 6.8, 'Each shadow moves on its own axis; together they trace the curve'),
    (6.8, T, 'Gradient anywhere: <b>dy/dx = (dy/dt) ÷ (dx/dt)</b>')])
css += [say_css, still_block('aparam')]

# the dashed guides are 1 long and scaled; non-scaling-stroke keeps their dashes and width in screen units
html = '''<div class="an-aparam" aria-hidden="true">
  <svg class="apm-svg" viewBox="0 0 300 214">
    <path class="apm-ax" d="M14 %dH286M%d 30V162"/>
    <path class="apm-ghost" d="%s"/>
    <g class="apm-fx"><path class="apm-curve" d="%s" pathLength="1"/></g>
    <g class="apm-px apm-mv">
      <line class="apm-vx apm-mv" x1="0" y1="0" x2="0" y2="1" vector-effect="non-scaling-stroke"/>
      <circle class="apm-xc" cx="0" cy="%d" r="4"/>
      <g class="apm-py apm-mv"><circle class="apm-ptc" cx="0" cy="0" r="5"/></g>
    </g>
    <g class="apm-py apm-mv">
      <line class="apm-vy apm-mv" x1="0" y1="0" x2="1" y2="0" vector-effect="non-scaling-stroke"/>
      <circle class="apm-yc" cx="%d" cy="0" r="4"/>
    </g>
    <text class="apm-big apm-tx" x="14" y="20">x = 2 cos t</text>
    <text class="apm-big apm-ty" x="286" y="20" text-anchor="end">y = sin 2t</text>
    <line class="apm-track" x1="%d" y1="%d" x2="%d" y2="%d"/>
    <g transform="translate(%d %d)"><rect class="apm-fill apm-mv" x="0" y="-2" width="1" height="4"/></g>
    <g class="apm-knob apm-mv"><circle class="apm-knobc" cx="0" cy="%d" r="6"/></g>
    <text class="apm-t" x="%d" y="%d" text-anchor="middle">t = 0</text>
    <text class="apm-t" x="%d" y="%d" text-anchor="middle">2π</text>
  </svg>
  <div class="apm-say">
%s
  </div>
</div>''' % (CY, CX, curve_d, curve_d, CY, CX, SL0, SLY, SL1, SLY, SL0, SLY, SLY, SL0, SLY + 16, SL1, SLY + 16, say_html)

anim_row.write_anim('aparam', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 3, 'title': 'A curve from a parameter',
                           'about': 'Parametric equations'})
