# Resolving on an inclined plane, drawn: a block on a smooth 30° slope; its weight mg straight down, split into
# mg sin α along the slope and mg cos α into it; the reaction R = mg cos α cancels the part into the slope, and what
# is left slides the block down with a = g sin α.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
AL = math.radians(30)
B0, B1, BY = (24, 196), (284, 196), 196               # the slope's foot is B0, and it rises to the right above B1
TOPY = BY - (B1[0] - B0[0]) * math.tan(AL)
W = 70                                                # the weight arrow's length
U = (-math.cos(AL), math.sin(AL))                     # down the slope (to the left and down, on screen)
NRM = (-math.sin(AL), -math.cos(AL))                  # out of the slope


def on_slope(d): return (B0[0] + d * math.cos(AL), BY - d * math.sin(AL))   # d px up the slope from its foot


C0 = on_slope(190)                                    # the block's centre of contact
BH = 26
CEN = (C0[0] + NRM[0] * BH / 2, C0[1] + NRM[1] * BH / 2)


def arrow(cls, a, vec, length, head=8):
    b = (a[0] + vec[0] * length, a[1] + vec[1] * length)
    ang = math.atan2(vec[1], vec[0])
    pts = [(b[0] - head * math.cos(ang + s * 0.45), b[1] - head * math.sin(ang + s * 0.45)) for s in (1, -1)]
    return ('<g class="%s"><path class="ain-shaft %s-s" d="M%.1f %.1fL%.1f %.1f" pathLength="1"/><path class="ain-head" d="M%.1f %.1fL%.1f %.1fL%.1f %.1fZ"/></g>'
            % (cls, cls, a[0], a[1], b[0], b[1], b[0], b[1], pts[0][0], pts[0][1], pts[1][0], pts[1][1])), b


aw, wend = arrow('ain-w', CEN, (0, 1), W)
aa, aend = arrow('ain-a', CEN, U, W * math.sin(AL))
ap, pend = arrow('ain-p', CEN, (-NRM[0], -NRM[1]), W * math.cos(AL))
ar, rend = arrow('ain-r', CEN, NRM, W * math.cos(AL))
SLIDE = (8.6, 10.2)
DIST = 120
css = [""".an-aincline { --ain-w: var(--coral); --ain-a: var(--gold); --ain-p: #6fa8dc; --ain-r: #6fd8c4; width: min(88vw, 22rem, 100%); text-align: center; }
.ain-svg { display: block; width: 100%; height: auto; }
.ain-slope { fill: var(--raised); stroke: var(--dim); stroke-width: 1.4; stroke-linejoin: round; }
.ain-block { fill: var(--ink); fill-opacity: .14; stroke: var(--ink); stroke-width: 1.6; }
.ain-t { font: 700 12px var(--mono); fill: var(--dim); }
.ain-shaft { fill: none; stroke-width: 2.6; stroke-dasharray: 1; }
.ain-w { stroke: var(--ain-w); fill: var(--ain-w); }
.ain-a { stroke: var(--ain-a); fill: var(--ain-a); }
.ain-p { stroke: var(--ain-p); fill: var(--ain-p); }
.ain-r { stroke: var(--ain-r); fill: var(--ain-r); }
.ain-head { stroke: none; }
.ain-guide { stroke: var(--ink); stroke-opacity: .3; stroke-width: 1; stroke-dasharray: 3 3; fill: none; }
.ain-lab { font: 700 12px var(--mono); stroke: none; }
.ain-arc { stroke: var(--dim); fill: none; stroke-width: 1.2; }
.ain-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.ain-say > span { grid-area: 1 / 1; }
.ain-say b { color: var(--gold); }"""]
for cls, on, off in [('ain-w', 0.5, 11.4), ('ain-a', 2.6, 11.4), ('ain-p', 2.6, 11.4), ('ain-r', 5.0, 11.4)]:
    css.append('.%s-s { stroke-dashoffset: 0; animation: %s-s %gs ease-out infinite; }' % (cls, cls, T))
    css.append(kf(cls + '-s', T, [(on, 'stroke-dashoffset: 1;'), (on + 0.9, 'stroke-dashoffset: 0;')]))
    css.append('.%s { animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(fade(cls, T, on, off, f=0.2))
    css.append('.%s-l { animation: %s-l %gs linear infinite; }' % (cls, cls, T))
    css.append(fade(cls + '-l', T, on + 0.9, off))
# the pair that cancels pulses together, then the block slides off with what is left
css.append('.ain-cancel { animation: ain-cancel %gs ease-in-out infinite; }' % T)
css.append(kf('ain-cancel', T, [(6.6, 'opacity: 1;'), (7.0, 'opacity: .25;'), (7.4, 'opacity: 1;'), (7.8, 'opacity: .25;'), (8.2, 'opacity: .25;')]))
css.append('.ain-guide { animation: ain-guide %gs linear infinite; }' % T)
css.append(fade('ain-guide', T, 2.8, 11.4))
slide = lambda d: 'transform: translate(%.1fpx, %.1fpx);' % (U[0] * d, U[1] * d)
css.append('.ain-move { animation: ain-move %gs cubic-bezier(.55, 0, 1, .45) infinite; }' % T)
css.append(kf('ain-move', T, [(SLIDE[0], slide(0)), (SLIDE[1], slide(DIST)), (11.4, slide(DIST)), (11.6, slide(0))]))
css.append('.ain-body { animation: ain-body %gs linear infinite; }' % T)
css.append(kf('ain-body', T, [(0, 'opacity: 0;'), (0.3, 'opacity: 1;'), (11.3, 'opacity: 1;'), (11.5, 'opacity: 0;')]))
say_html, say_css = captions('ain', T, [
    (0, 2.6, 'Weight <b>mg</b> acts straight down'),
    (2.6, 5.0, 'Resolve it: <b>mg sin α</b> along the slope, mg cos α into it'),
    (5.0, 8.6, 'R = mg cos α cancels the part into the slope'),
    (8.6, T, 'What is left accelerates it: <b>a = g sin α</b>')])
css += [say_css, still_block('aincline')]

ang = -math.degrees(AL)
block = '<rect class="ain-block" x="%.1f" y="%.1f" width="40" height="%d" transform="rotate(%.2f %.1f %.1f)"/>' % (C0[0] - 20, C0[1] - BH, BH, ang, C0[0], C0[1])
guide = 'M%.1f %.1fL%.1f %.1fL%.1f %.1f' % (aend[0], aend[1], wend[0], wend[1], pend[0], pend[1])
lab = lambda cls, p, dx, dy, t: '<text class="ain-lab %s %s-l" x="%.1f" y="%.1f"%s>%s</text>' % (cls, cls, p[0] + dx, p[1] + dy, ' text-anchor="end"' if dx < 0 else '', t)
html = '''<div class="an-aincline" aria-hidden="true">
  <svg class="ain-svg" viewBox="0 0 300 206">
    <path class="ain-slope" d="M%d %dL%d %dL%d %.1fZ"/>
    <path class="ain-arc" d="M%d %d A 34 34 0 0 0 %.1f %.1f"/>
    <text class="ain-t" x="%d" y="%d">α = 30°</text>
    <g class="ain-body"><g class="ain-move">
      %s
      <path class="ain-guide" d="%s"/>
      %s
      <g class="ain-cancel">%s
      %s</g>
      %s
      %s
      %s
      %s
      %s
    </g></g>
  </svg>
  <div class="ain-say">
%s
  </div>
</div>''' % (B0[0], BY, B1[0], BY, B1[0], TOPY, B0[0] + 34, BY, B0[0] + 34 * math.cos(AL), BY - 34 * math.sin(AL), B0[0] + 40, BY - 6,
             block, guide, aw, ap, ar, aa,
             lab('ain-w', wend, 6, 4, 'mg'), lab('ain-a', aend, -4, -4, 'mg sin α'), lab('ain-p', pend, 4, 14, 'mg cos α'),
             lab('ain-r', rend, -4, -2, 'R'), say_html)

anim_row.write_anim('aincline', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 17, 'title': 'Resolving on a slope',
                           'about': 'Resolving|On a smooth slope at angle α'})
