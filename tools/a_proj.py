# Projectile motion, drawn: a ball fired at 20 m/s at 55° carrying its two velocity components — the horizontal one
# the same length all the way, the vertical one shrinking to nothing at the top and growing downwards — and a ghost
# left every eighth of the flight, equal steps across because the horizontal velocity never changes.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 11.0
U, TH, G = 20.0, math.radians(55), 9.8
UX, UY = U * math.cos(TH), U * math.sin(TH)
TF = 2 * UY / G                                      # time of flight, 3.34 s
X0, GROUND, S = 26, 190, 6.2                         # launch point; px per metre
V = 2.6                                              # px per m/s for the arrows
FLY = (0.8, 6.8)                                     # the flight, slowed
N = 32
TS = [TF * k / N for k in range(N + 1)]
AT = [FLY[0] + (FLY[1] - FLY[0]) * k / N for k in range(N + 1)]
GH = 8                                               # ghosts


def pos(t): return (X0 + S * UX * t, GROUND - S * (UY * t - G * t * t / 2))
def tr(x, y): return 'translate(%.1fpx, %.1fpx)' % (x, y)


def stations(fmt):
    return [(AT[k], fmt(t)) for k, t in enumerate(TS)] + [(10.4, fmt(TF)), (10.6, fmt(0))]


TOP = TF / 2
css = [""".an-aproj { --apr-x: #6fd8c4; --apr-y: var(--coral); width: min(88vw, 22rem, 100%); text-align: center; }
.apr-svg { display: block; width: 100%; height: auto; }
.apr-ground { stroke: var(--dim); stroke-width: 1.4; }
.apr-path { stroke: var(--ink); stroke-opacity: .25; stroke-width: 1.2; stroke-dasharray: 3 4; fill: none; }
.apr-t { font: 700 11px var(--mono); fill: var(--dim); }
.apr-mv { transform-box: view-box; transform-origin: 0 0; }
.apr-ballc { fill: var(--gold); }
.apr-ghost { fill: var(--gold); fill-opacity: .35; }
.apr-tick { stroke: var(--apr-x); stroke-width: 1.4; }
.apr-xs { stroke: var(--apr-x); stroke-width: 2.4; }
.apr-xh { fill: var(--apr-x); }
.apr-ys { stroke: var(--apr-y); stroke-width: 2.4; }
.apr-yh { fill: var(--apr-y); }
.apr-lx { font: 700 12px var(--mono); fill: var(--apr-x); }
.apr-ly { font: 700 12px var(--mono); fill: var(--apr-y); }
.apr-top { font: 700 12px var(--mono); fill: var(--apr-y); text-anchor: middle; }
.apr-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.apr-say > span { grid-area: 1 / 1; }
.apr-say b { color: var(--gold); }
.apr-say i { font-style: normal; color: var(--apr-x); }
.apr-say u { text-decoration: none; color: var(--apr-y); }"""]
STILL = TF * 0.25
RISE, FALL = 'cubic-bezier(.33, .67, .67, 1)', 'cubic-bezier(.33, 0, .67, .33)'   # exactly 2s − s² and s²: the parabola's two halves
F0, F1, FM = FLY[0], FLY[1], (FLY[0] + FLY[1]) / 2
at_t = lambda t: F0 + (F1 - F0) * t / TF
vy = lambda t: UY - G * t
BX = lambda t: 'transform: translateX(%.1fpx);' % pos(t)[0]
BY = lambda t: 'transform: translateY(%.1fpx);' % pos(t)[1]
YS = lambda t: 'transform: scaleY(%.2f);' % (V * vy(t))
YH = lambda t: 'transform: translateY(%.2fpx) scaleY(%.2f);' % (-V * vy(t), max(-1, min(1, vy(t) / 3)))
tq = [TF / 2 - 3 / G, TF / 2 + 3 / G]                # where the head has turned half over
movers = {   # class: (stops, the still): x and the arrows are linear in time; y is two exact quadratic halves
    'apr-bx': ([(F0, BX(0)), (F1, BX(TF)), (10.4, BX(TF))], BX(STILL)),
    'apr-by': ([(F0, BY(0) + ' animation-timing-function: %s;' % RISE), (FM, BY(TF / 2) + ' animation-timing-function: %s;' % FALL),
                (F1, BY(TF) + ' animation-timing-function: linear;'), (10.4, BY(TF))], BY(STILL)),
    'apr-ys': ([(F0, YS(0)), (F1, YS(TF)), (10.4, YS(TF))], YS(STILL)),
    'apr-yh': ([(F0, YH(0)), (at_t(tq[0]), YH(tq[0])), (at_t(tq[1]), YH(tq[1])), (F1, YH(TF)), (10.4, YH(TF))], YH(STILL)),
}
for cls, (st, base) in movers.items():
    first = st[0][1].split(' animation-timing-function')[0]
    css.append('.%s { %s animation: %s %gs linear infinite; }' % (cls, base, cls, T))
    css.append(kf(cls, T, [(0, first)] + st + [(10.6, first)]))
css.append('.apr-fly { animation: apr-fly %gs linear infinite; }' % T)
css.append(fade('apr-fly', T, 0.4, 10.3))
ghosts = []
for g in range(1, GH):
    t = TF * g / GH
    x, y = pos(t)
    on = FLY[0] + (FLY[1] - FLY[0]) * g / GH
    ghosts.append('<g class="apr-g%d"><circle class="apr-ghost" cx="%.1f" cy="%.1f" r="5"/><line class="apr-tick" x1="%.1f" y1="%d" x2="%.1f" y2="%d"/></g>' % (g, x, y, x, GROUND - 4, x, GROUND + 4))
    css.append('.apr-g%d { animation: apr-g%d %gs linear infinite; }' % (g, g, T))
    css.append(fade('apr-g%d' % g, T, on, 10.3, f=0.15))
css.append('.apr-top { opacity: 0; animation: apr-top %gs linear infinite; }' % T)
tt = FLY[0] + (FLY[1] - FLY[0]) / 2
css.append(fade('apr-top', T, tt - 0.1, tt + 1.4, f=0.25, lo=0))
say_html, say_css = captions('apr', T, [
    (0, 2.6, '<i>Horizontal: u cos θ</i> — the same all the way'),
    (2.6, 4.9, '<u>Vertical: u sin θ − gt</u> — shrinking to 0 at the top …'),
    (4.9, 7.4, '… then growing downwards as it falls'),
    (7.4, T, 'Equal times, equal steps across: <b>only the vertical part feels g</b>')])
css += [say_css, still_block('aproj')]

arc = 'M' + ' L'.join('%.1f %.1f' % pos(TF * i / 60) for i in range(61))
xt, yt = pos(TOP)
html = '''<div class="an-aproj" aria-hidden="true">
  <svg class="apr-svg" viewBox="0 0 300 210">
    <line class="apr-ground" x1="10" y1="%d" x2="292" y2="%d"/>
    <path class="apr-path" d="%s"/>
    <text class="apr-t" x="%d" y="%d">u = 20 m/s, θ = 55°</text>
    <text class="apr-top" x="%.1f" y="%.1f">vertical velocity 0</text>
    %s
    <g class="apr-fly">
      <g class="apr-bx apr-mv"><g class="apr-by apr-mv">
        <line class="apr-xs" x1="0" y1="0" x2="%.1f" y2="0"/>
        <path class="apr-xh" d="M%.1f 0l-7 -4v8z"/>
        <line class="apr-ys apr-mv" x1="0" y1="0" x2="0" y2="-1" vector-effect="non-scaling-stroke"/>
        <path class="apr-yh apr-mv" d="M0 0l-4 7h8z"/>
        <circle class="apr-ballc" cx="0" cy="0" r="6"/>
      </g></g>
    </g>
    <text class="apr-lx" x="290" y="22" text-anchor="end">u cos θ = 11.5 m/s</text>
    <text class="apr-ly" x="290" y="40" text-anchor="end">u sin θ − gt</text>
  </svg>
  <div class="apr-say">
%s
  </div>
</div>''' % (GROUND, GROUND, arc, X0, GROUND + 15, xt, yt - 18, ''.join(ghosts), V * UX, V * UX + 1, say_html)

anim_row.write_anim('aproj', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 16, 'title': 'A projectile, in two parts',
                           'about': 'Projectile|Components'})
