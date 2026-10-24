# eˣ and ln x, drawn: a point rides y = eˣ with its tangent, and the tangent's rise over a run of 1 stands beside the
# point's height — the same length, which is what makes e the base; then the curve folds over y = x into y = ln x.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 13.0
S, OX, OY = 42, 120, 160             # px per unit; the origin
X = lambda x: OX + S * x
Y = lambda y: OY - S * y
XS = [-2.0 + 0.25 * k for k in range(11)]          # the point's stations, x = −2 … 0.5 (past that the rise leaves the frame)
AT = [0.6 + 0.54 * k for k in range(len(XS))]      # it rides steadily, 0.6 s to 6.0 s
FOLD = (7.4, 9.0)                                  # the copy of eˣ folds over y = x into ln x


def tr(x, y): return 'translate(%.1fpx, %.1fpx)' % (x, y)


def stations(fmt):
    st = [(AT[k], fmt(x)) for k, x in enumerate(XS)]
    return st + [(6.2, fmt(XS[-1])), (6.9, fmt(0.0)), (12.4, fmt(0.0)), (12.6, fmt(XS[0]))]   # back to x = 0 for the fold


ex = [x / 20 for x in range(-56, 25)]
exp_d = ' '.join(('M' if i == 0 else 'L') + '%.1f %.1f' % (X(x), Y(math.exp(x))) for i, x in enumerate(ex))
MOVERS = {
    'aex-pt': lambda x: 'transform: %s;' % tr(X(x), Y(math.exp(x))),
    'aex-tan': lambda x: 'transform: %s rotate(%.2fdeg);' % (tr(X(x), Y(math.exp(x))), -math.degrees(math.atan(math.exp(x)))),
    'aex-h': lambda x: 'transform: %s scaleY(%.2f);' % (tr(X(x), OY), S * math.exp(x)),
    'aex-run': lambda x: 'transform: %s scaleX(%d);' % (tr(X(x), Y(math.exp(x))), S),
    'aex-rise': lambda x: 'transform: %s scaleY(%.2f);' % (tr(X(x + 1), Y(math.exp(x))), S * math.exp(x)),
}
L = 0.0          # the still: the point at x = 0, where height and gradient are both 1
REFL = lambda s: 'transform: %s rotate(-45deg) scale(1, %g) rotate(45deg) %s;' % (tr(OX, OY), s, tr(-OX, -OY))

css = [""".an-aexp { --aex-e: #6fd8c4; --aex-l: #6fa8dc; width: min(88vw, 22rem, 100%); text-align: center; }
.aex-svg { display: block; width: 100%; height: auto; }
.aex-ax { stroke: var(--dim); stroke-width: 1; fill: none; }
.aex-t { font: 700 12px var(--mono); fill: var(--dim); }
.aex-mv { transform-box: view-box; transform-origin: 0 0; }
.aex-e { stroke: var(--aex-e); stroke-width: 2.4; fill: none; stroke-linecap: round; }
.aex-l { stroke: var(--aex-l); stroke-width: 2.4; fill: none; stroke-linecap: round; }
.aex-te { fill: var(--aex-e); }
.aex-tl { fill: var(--aex-l); }
.aex-mirror { stroke: var(--dim); stroke-width: 1.2; stroke-dasharray: 5 4; }
.aex-tan { stroke: var(--ink); stroke-width: 1.4; stroke-opacity: .7; }
.aex-h, .aex-rise { stroke: var(--gold); stroke-width: 3; }
.aex-run { stroke: var(--gold); stroke-width: 1.4; stroke-opacity: .6; }
.aex-ptc { fill: var(--ink); }
.aex-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.aex-say > span { grid-area: 1 / 1; }
.aex-say b { color: var(--gold); }"""]
for cls, at in MOVERS.items():
    css.append('.%s { %s animation: %s %gs linear infinite; }' % (cls, at(L), cls, T))
    css.append(kf(cls, T, stations(at)))
css.append('.aex-ride { animation: aex-ride %gs linear infinite; }' % T)
css.append(fade('aex-ride', T, 0.4, 12.3))
css.append('.aex-fold { %s animation: aex-fold %gs ease-in-out infinite; }' % (REFL(-1), T))
css.append(kf('aex-fold', T, [(FOLD[0] - 0.4, 'opacity: 0; ' + REFL(1)), (FOLD[0], 'opacity: 1; ' + REFL(1)), (FOLD[1], 'opacity: 1; ' + REFL(-1)),
                              (12.3, 'opacity: 1; ' + REFL(-1)), (12.7, 'opacity: 0; ' + REFL(-1))]))
for cls, on in [('aex-mirror', 6.8), ('aex-mname', 6.8), ('aex-lname', FOLD[1])]:
    css.append('.%s { animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(fade(cls, T, on, 12.3))
say_html, say_css = captions('aex', T, [
    (0, 3.4, 'On y = eˣ the gradient (gold rise over a run of 1) …'),
    (3.4, 6.8, '… always equals the height: <b>the derivative of eˣ is eˣ</b>'),
    (6.8, T, 'Reflect in y = x: the inverse of eˣ is <b>y = ln x</b>')])
css += [say_css, still_block('aexp')]

html = '''<div class="an-aexp" aria-hidden="true">
  <svg class="aex-svg" viewBox="0 0 300 236">
    <path class="aex-ax" d="M%d 228V8M6 %dH294"/>
    <text class="aex-t" x="286" y="%d">x</text>
    <text class="aex-t" x="%d" y="16">y</text>
    <line class="aex-mirror" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>
    <text class="aex-t aex-mname" x="238" y="40">y = x</text>
    <path class="aex-l aex-fold aex-mv" d="%s"/>
    <text class="aex-t aex-tl aex-lname" x="226" y="%.1f">y = ln x</text>
    <path class="aex-e" d="%s"/>
    <text class="aex-t aex-te" x="%.1f" y="22">y = eˣ</text>
    <g class="aex-ride">
      <line class="aex-tan aex-mv" x1="-90" y1="0" x2="90" y2="0"/>
      <line class="aex-h aex-mv" x1="0" y1="0" x2="0" y2="-1"/>
      <line class="aex-run aex-mv" x1="0" y1="0" x2="1" y2="0"/>
      <line class="aex-rise aex-mv" x1="0" y1="0" x2="0" y2="-1"/>
      <g class="aex-pt aex-mv"><circle class="aex-ptc" cx="0" cy="0" r="4.5"/></g>
    </g>
  </svg>
  <div class="aex-say">
%s
  </div>
</div>''' % (OX, OY, OY + 14, OX + 6, X(-1.6), Y(-1.6), X(3.6), Y(3.6), exp_d,
             Y(1.0) + 18, exp_d, X(1.15) + 4, say_html)

anim_row.write_anim('aexp', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 6, 'title': 'eˣ and its mirror, ln x',
                           'about': 'The number e|Natural logarithm'})
