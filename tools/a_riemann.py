# Integration as area, drawn: rectangles under y = x² from 0 to 2 — 4, then 8, 16 and 32 of them, each set growing up
# from the axis with its sum read out (1.75, 2.19, 2.42, 2.54) — and then the area itself, ∫₀² x² dx = 8/3.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
X = lambda x: 40 + 115 * x           # x 0..2 across, y 0..4 up
Y = lambda y: 185 - 38 * y
f = lambda x: x * x
NS = [4, 8, 16, 32]
WIN = [(0.4, 3.0), (3.0, 5.6), (5.6, 8.2), (8.2, 9.8)]   # each set's time on the stage
AREA = (9.6, 11.6)


def left_sum(n):
    w = 2.0 / n
    return sum(f(k * w) * w for k in range(n))


curve = ' '.join(('M' if i == 0 else 'L') + '%.1f %.1f' % (X(x), Y(f(x))) for i, x in enumerate([0.025 * i for i in range(85)]) if x <= 2.08)
under = 'M%.1f %.1f ' % (X(0), Y(0)) + ' '.join('L%.1f %.1f' % (X(x), Y(f(x))) for x in [0.025 * i for i in range(81)]) + ' L%.1f %.1f Z' % (X(2), Y(0))

css = [""".an-ariemann { --ari-a: #6fd8c4; --ari-b: #6fa8dc; width: min(88vw, 22rem, 100%%); text-align: center; }
.ari-svg { display: block; width: 100%%; height: auto; }
.ari-ax { stroke: var(--dim); stroke-width: 1; fill: none; }
.ari-curve { stroke: var(--ink); stroke-width: 2.2; fill: none; stroke-linecap: round; }
.ari-t { font: 700 12px var(--mono); fill: var(--dim); }
.ari-big { font: 700 13px var(--mono); fill: var(--ink); }
.ari-gold { fill: var(--gold); }
.ari-rect { stroke: var(--bg); stroke-width: .8; }
.ari-n0 .ari-rect, .ari-n2 .ari-rect { fill: var(--ari-a); fill-opacity: .7; }
.ari-n1 .ari-rect, .ari-n3 .ari-rect { fill: var(--ari-b); fill-opacity: .7; }
.ari-set { transform-box: view-box; transform-origin: 0 %dpx; }
.ari-area { fill: var(--gold); fill-opacity: .55; }
.ari-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.ari-say > span { grid-area: 1 / 1; }
.ari-say b { color: var(--gold); }""" % Y(0)]
sets, reads = [], []
for k, (n, (a, b)) in enumerate(zip(NS, WIN)):
    w = 2.0 / n
    rects = ''.join('<rect class="ari-rect" x="%.2f" y="%.2f" width="%.2f" height="%.2f"/>' % (X(i * w), Y(f(i * w)), X(w) - X(0), Y(0) - Y(f(i * w)))
                    for i in range(n) if f(i * w) > 0)
    sets.append('    <g class="ari-set ari-n%d">%s</g>' % (k, rects))
    # each set grows up from the axis, holds, and gives way to the next
    css.append('.ari-n%d { opacity: 0; animation: ari-n%d %gs ease-out infinite; }' % (k, k, T))
    css.append(kf('ari-n%d' % k, T, [(a, 'opacity: 0; transform: scaleY(0);'), (a + 0.7, 'opacity: 1; transform: scaleY(1);'),
                                     (b, 'opacity: 1; transform: scaleY(1);'), (b + 0.35, 'opacity: 0; transform: scaleY(1);')]))
    reads.append('    <text class="ari-big ari-r%d" x="16" y="22">n = %d · sum <tspan class="ari-gold">%.2f</tspan></text>' % (k, n, left_sum(n)))
    css.append('.ari-r%d { opacity: 0; animation: ari-r%d %gs linear infinite; }' % (k, k, T))
    css.append(fade('ari-r%d' % k, T, a + 0.3, b, f=0.3))
css.append('.ari-area { animation: ari-area %gs linear infinite; }' % T)
css.append(fade('ari-area', T, AREA[0] + 0.4, AREA[1], f=0.4))
css.append('.ari-rf { animation: ari-rf %gs linear infinite; }' % T)
css.append(fade('ari-rf', T, AREA[0] + 0.4, AREA[1]))
say_html, say_css = captions('ari', T, [
    (0, 3.0, 'Area ≈ the sum of n rectangles, f(x) × width'),
    (3.0, 9.6, 'More, thinner rectangles: the gap under the curve shrinks'),
    (9.6, T, 'The limit of the sums is the integral: <b>∫₀² x² dx = 8/3</b>')])
css += [say_css, still_block('ariemann')]

ticks = ''.join('<text class="ari-t" x="%.1f" y="%.1f">%s</text>' % (X(x) - 4, Y(0) + 15, l) for x, l in [(0, '0'), (1, '1'), (2, '2')])
html = '''<div class="an-ariemann" aria-hidden="true">
  <svg class="ari-svg" viewBox="0 0 300 215">
    <path class="ari-area" d="%s"/>
%s
    <path class="ari-ax" d="M40 196V34M28 185H292"/>
    %s
    <path class="ari-curve" d="%s"/>
    <text class="ari-t" x="196" y="52">y = x²</text>
%s
    <text class="ari-big ari-rf" x="16" y="22">area = <tspan class="ari-gold">8/3 ≈ 2.667</tspan></text>
  </svg>
  <div class="ari-say">
%s
  </div>
</div>''' % (under, '\n'.join(sets), ticks, curve, '\n'.join(reads), say_html)

anim_row.write_anim('ariemann', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 9, 'title': 'Rectangles to an integral',
                           'about': 'Definite integral'})
