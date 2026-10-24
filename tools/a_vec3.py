# Vectors in 3D, drawn: a = 3i + 2j + 4k walked out a component at a time — 3 along x, 2 along y, 4 up z — then the
# arrow from start to finish, the diagonal of a 3 by 2 by 4 box, and its length √(3² + 2² + 4²) = √29.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
O = (110, 146)
EX, EY, EZ = (-14, 18), (38, -4), (0, -27)          # the three unit vectors, drawn obliquely
A = (3, 2, 4)


def P(x, y, z): return (O[0] + x * EX[0] + y * EY[0] + z * EZ[0], O[1] + x * EX[1] + y * EY[1] + z * EZ[1])


def arrow(cls, a, b, head=7):
    """a shaft drawn from a to b (pathLength 1, grown by its dash) and a head at b"""
    ang = math.atan2(b[1] - a[1], b[0] - a[0])
    hx = [b[0] - head * math.cos(ang - s * 0.42) for s in (1, -1)]
    hy = [b[1] - head * math.sin(ang - s * 0.42) for s in (1, -1)]
    return ('<path class="av3-shaft %s" d="M%.1f %.1fL%.1f %.1f" pathLength="1"/>' % (cls, a[0], a[1], b[0], b[1]),
            '<path class="av3-head %sh" d="M%.1f %.1fL%.1f %.1fL%.1f %.1fZ"/>' % (cls, b[0], b[1], hx[0], hy[0], hx[1], hy[1]))


STEPS = [('av3-i', P(0, 0, 0), P(3, 0, 0), 0.6), ('av3-j', P(3, 0, 0), P(3, 2, 0), 2.2),
         ('av3-k', P(3, 2, 0), P(3, 2, 4), 3.8), ('av3-a', P(0, 0, 0), P(3, 2, 4), 5.6)]
css = [""".an-avec3 { --av3-i: #6fd8c4; --av3-j: #6fa8dc; --av3-k: var(--coral); width: min(88vw, 22rem, 100%); text-align: center; }
.av3-svg { display: block; width: 100%; height: auto; }
.av3-axis { stroke: var(--dim); stroke-width: 1; }
.av3-t { font: 700 12px var(--mono); fill: var(--dim); }
.av3-box { stroke: var(--ink); stroke-opacity: .35; stroke-width: 1; stroke-dasharray: 4 4; fill: none; }
.av3-shaft { fill: none; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 1; }
.av3-i, .av3-ih, .av3-li { stroke: var(--av3-i); fill: var(--av3-i); }
.av3-j, .av3-jh, .av3-lj { stroke: var(--av3-j); fill: var(--av3-j); }
.av3-k, .av3-kh, .av3-lk { stroke: var(--av3-k); fill: var(--av3-k); }
.av3-a, .av3-ah, .av3-la { stroke: var(--gold); fill: var(--gold); }
.av3-shaft.av3-i, .av3-shaft.av3-j, .av3-shaft.av3-k, .av3-shaft.av3-a { fill: none; }
.av3-head { stroke: none; }
.av3-lab { font: 700 13px var(--mono); stroke: none; }
.av3-mag { font: 700 13px var(--mono); fill: var(--ink); }
.av3-gold { fill: var(--gold); }
.av3-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.av3-say > span { grid-area: 1 / 1; }
.av3-say b { color: var(--gold); }"""]
body = []
for cls, a, b, at in STEPS:
    shaft, head = arrow(cls, a, b, 9 if cls == 'av3-a' else 7)
    body += ['    ' + shaft, '    ' + head]
    # the shaft grows over 1.1 s, then its head and its label come up
    css.append('.%s { stroke-dashoffset: 0; animation: %s %gs ease-in-out infinite; }' % (cls, cls, T))
    css.append(kf(cls, T, [(at, 'stroke-dashoffset: 1; opacity: 1;'), (at + 1.1, 'stroke-dashoffset: 0; opacity: 1;'),
                           (11.4, 'stroke-dashoffset: 0; opacity: 1;'), (11.8, 'stroke-dashoffset: 0; opacity: 0;')]))
    for el in (cls + 'h', 'av3-l' + cls[-1]):
        css.append('.%s { animation: %s %gs linear infinite; }' % (el, el, T))
        css.append(fade(el, T, at + 1.15, 11.4, f=0.25))
for cls, on in [('av3-box', 7.2), ('av3-mag', 8.4)]:
    css.append('.%s { animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(fade(cls, T, on, 11.4))
say_html, say_css = captions('av3', T, [
    (0, 5.6, '<b>a = 3i + 2j + 4k</b>: 3 along x, 2 along y, 4 up z'),
    (5.6, 8.4, 'The arrow from start to finish is a — the diagonal of a 3 × 2 × 4 box'),
    (8.4, T, '<b>∣a∣ = √(3² + 2² + 4²) = √29 ≈ 5.39</b>')])
css += [say_css, still_block('avec3')]

box_pts = [(0, 0, 0), (3, 0, 0), (3, 2, 0), (0, 2, 0)]
box = 'M' + ' L'.join('%.1f %.1f' % P(*p) for p in box_pts) + ' Z ' + 'M' + ' L'.join('%.1f %.1f' % P(x, y, 4) for x, y, _ in box_pts) + ' Z ' + \
      ' '.join('M%.1f %.1f L%.1f %.1f' % (P(x, y, 0) + P(x, y, 4)) for x, y, _ in box_pts)
ax = [('x', P(4.4, 0, 0)), ('y', P(0, 4.6, 0)), ('z', P(0, 0, 5))]
axes = ''.join('<line class="av3-axis" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/><text class="av3-t" x="%.1f" y="%.1f">%s</text>' % (O + p + (p[0] + (-12 if n == 'x' else 5), p[1] + (4 if n != 'z' else -3), n)) for n, p in ax)
mid = lambda a, b: ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
li, lj, lk, la = mid(P(0, 0, 0), P(3, 0, 0)), mid(P(3, 0, 0), P(3, 2, 0)), mid(P(3, 2, 0), P(3, 2, 4)), mid(P(0, 0, 0), P(3, 2, 4))
html = '''<div class="an-avec3" aria-hidden="true">
  <svg class="av3-svg" viewBox="0 0 300 238">
    %s
    <path class="av3-box" d="%s"/>
%s
    <text class="av3-lab av3-li" x="%.1f" y="%.1f">3i</text>
    <text class="av3-lab av3-lj" x="%.1f" y="%.1f">2j</text>
    <text class="av3-lab av3-lk" x="%.1f" y="%.1f">4k</text>
    <text class="av3-lab av3-la" x="%.1f" y="%.1f">a</text>
    <text class="av3-mag" x="180" y="30">∣a∣ = <tspan class="av3-gold">√29</tspan></text>
  </svg>
  <div class="av3-say">
%s
  </div>
</div>''' % (axes, box, '\n'.join(body), li[0] - 22, li[1] + 14, lj[0] - 4, lj[1] + 18, lk[0] + 6, lk[1] + 34, la[0] + 6, la[1] + 4, say_html)

anim_row.write_anim('avec3', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 11, 'title': 'A vector in three dimensions',
                           'about': 'Magnitude|Unit vectors i, j, k'})
