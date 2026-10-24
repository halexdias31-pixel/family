# Radians and the unit circle, drawn: the radius turns once, the arc it sweeps (θ, in radians: arc length on a circle
# of radius 1) is laid out along the axis, and P's height traces y = sin θ — one turn is 2π, then it repeats.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block, sine_stops

T = 11.0
R, CX, CY = 44, 58, 104              # the unit circle
W0, W1 = 118, 288                    # the wave's axis: θ = 0 … 2π
K = (W1 - W0) / (2 * math.pi)        # px per radian along it
RUN = (0.6, 8.6)                     # one turn
N = 24
TH = [2 * math.pi * k / N for k in range(N + 1)]
AT = [RUN[0] + (RUN[1] - RUN[0]) * k / N for k in range(N + 1)]
STILL = math.pi * 2 / 3              # the still: θ = 2π/3


def tr(x, y): return 'translate(%.2fpx, %.2fpx)' % (x, y)


wave = [(W0 + K * t, CY - R * math.sin(t)) for t in [2 * math.pi * i / 240 for i in range(241)]]
wave_d = 'M' + ' L'.join('%.1f %.1f' % p for p in wave[::2])
seg = [0.0]
for a, b in zip(wave, wave[1:]): seg.append(seg[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
LEN = seg[-1]


def drawn(t):
    """how much of the wave is drawn at θ = t, as a share of its length"""
    i = min(int(round(t / (2 * math.pi) * 240)), 240)
    return seg[i] / LEN


def stations(fmt, back):
    st = [(AT[k], fmt(t)) for k, t in enumerate(TH)]
    return [(0, fmt(0))] + st + [(10.4, fmt(2 * math.pi)), (10.6, back)]


TWO = 2 * math.pi
def lin(fmt): return [(RUN[0], fmt(0)), (RUN[1], fmt(TWO)), (10.4, fmt(TWO))]
def sin_(fmt): return sine_stops(RUN[0], RUN[1], 0, TWO, fmt) + [(10.4, fmt(0) + ' animation-timing-function: linear;')]
ARM = lambda t: 'transform: %s rotate(%.1fdeg);' % (tr(CX, CY), -math.degrees(t))
ARC = lambda t: 'stroke-dashoffset: %.3f;' % (1 - t / TWO)
RUL = lambda t: 'transform: %s scaleX(%.1f);' % (tr(W0, CY), K * t)
DX = lambda t: 'transform: translateX(%.1fpx);' % (W0 + K * t)
DY = lambda v: 'transform: translateY(%.1fpx);' % (CY - R * v)
LV = lambda v: 'transform: translateY(%.1fpx);' % (-R * v)
MOVERS = {   # class: (stops, the still's declaration): the turn is linear in time, the heights are sines (sine_stops)
    'aun-arm': (lin(ARM), ARM(STILL)), 'aun-arc': (lin(ARC), ARC(STILL)), 'aun-ruler': (lin(RUL), RUL(STILL)),
    'aun-dx': (lin(DX), DX(STILL)), 'aun-dy': (sin_(DY), DY(math.sin(STILL))), 'aun-lvl': (sin_(LV), LV(math.sin(STILL))),
    'aun-wave': ([(AT[k], 'stroke-dashoffset: %.3f;' % (1 - drawn(t))) for k, t in enumerate(TH)] + [(10.4, 'stroke-dashoffset: 0;')], 'stroke-dashoffset: 0;'),
}
css = [""".an-aunit { --aun-p: #6fd8c4; --aun-w: var(--gold); width: min(88vw, 22rem, 100%); text-align: center; }
.aun-svg { display: block; width: 100%; height: auto; }
.aun-ax { stroke: var(--dim); stroke-width: 1; fill: none; }
.aun-circ { stroke: var(--ink); stroke-opacity: .55; stroke-width: 1.4; fill: none; }
.aun-t { font: 700 11px var(--mono); fill: var(--dim); }
.aun-big { font: 700 12px var(--mono); fill: var(--ink); }
.aun-mv { transform-box: view-box; transform-origin: 0 0; }
.aun-armline { stroke: var(--ink); stroke-width: 1.8; }
.aun-p { fill: var(--aun-p); }
.aun-sin { stroke: var(--aun-p); stroke-width: 2; }
.aun-arc { stroke: var(--coral); stroke-width: 3.2; fill: none; stroke-dasharray: 1; }
.aun-ruler { fill: var(--coral); }
.aun-wave { stroke: var(--aun-w); stroke-width: 2.4; fill: none; stroke-dasharray: 1; stroke-linejoin: round; }
.aun-lvl { stroke: var(--aun-p); stroke-opacity: .45; stroke-width: 1; stroke-dasharray: 3 3; }
.aun-dotc, .aun-wl { fill: var(--aun-w); }
.aun-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.aun-say > span { grid-area: 1 / 1; }
.aun-say b { color: var(--gold); }
.aun-say i { font-style: normal; color: var(--coral); }"""]
for cls, (st, base) in MOVERS.items():
    first = st[0][1].split(' animation-timing-function')[0]
    css.append('.%s { %s animation: %s %gs linear infinite; }' % (cls, base, cls, T))
    css.append(kf(cls, T, [(0, first)] + st + [(10.6, first)]))
css.append('.aun-fx { animation: aun-fx %gs linear infinite; }' % T)
css.append(fade('aun-fx', T, 0.3, 10.1))
say_html, say_css = captions('aun', T, [
    (0, 3.2, 'θ in radians is the <i>arc length</i> round a circle of radius 1'),
    (3.2, 6.6, 'Lay the arc along the axis: P’s height over it is <b>sin θ</b>'),
    (6.6, T, 'One turn is 2π: after that the wave repeats — period 2π')])
css += [say_css, still_block('aunit')]

ticks = ''.join('<path class="aun-ax" d="M%.1f %dv6"/><text class="aun-t" x="%.1f" y="%d" text-anchor="middle">%s</text>' % (W0 + K * t, CY - 3, W0 + K * t, CY + 16 + (12 if t == math.pi else 0), l)
                for t, l in [(math.pi / 2, 'π/2'), (math.pi, 'π'), (3 * math.pi / 2, '3π/2'), (2 * math.pi, '2π')])
# the arc: a circle path from θ = 0, anticlockwise on screen, measured as 1
arc_d = 'M%.1f %.1f A%d %d 0 1 0 %.1f %.1f A%d %d 0 1 0 %.1f %.1f' % (CX + R, CY, R, R, CX - R, CY, R, R, CX + R, CY)
html = '''<div class="an-aunit" aria-hidden="true">
  <svg class="aun-svg" viewBox="0 0 300 190">
    <path class="aun-ax" d="M8 %dH294M%d 52V156"/>
    <circle class="aun-circ" cx="%d" cy="%d" r="%d"/>
    <g class="aun-fx"><path class="aun-arc" d="%s" pathLength="1"/></g>
    %s
    <text class="aun-t" x="%d" y="%d">1</text>
    <line class="aun-lvl aun-mv" x1="%d" y1="%d" x2="292" y2="%d"/>
    <g class="aun-fx">
      <rect class="aun-ruler aun-mv" x="0" y="-1.6" width="1" height="3.2"/>
      <path class="aun-wave" d="%s" pathLength="1"/>
    </g>
    <g class="aun-arm aun-mv">
      <line class="aun-armline" x1="0" y1="0" x2="%d" y2="0"/>
      <circle class="aun-p" cx="%d" cy="0" r="4.5"/>
    </g>
    <g class="aun-dx aun-mv"><g class="aun-dy aun-mv"><circle class="aun-dotc" cx="0" cy="0" r="4"/></g></g>
    <text class="aun-big" x="8" y="20">P = (cos θ, sin θ)</text>
    <text class="aun-big aun-wl" x="200" y="40">y = sin θ</text>
  </svg>
  <div class="aun-say">
%s
  </div>
</div>''' % (CY, W0, CX, CY, R, arc_d, ticks, CX + 18, CY + 13, CX, CY, CY, wave_d, R, R, say_html)

anim_row.write_anim('aunit', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 5, 'title': 'Radians and the unit circle',
                           'about': 'Radian|Unit circle'})
