# Differentiation from first principles, drawn: the chord PQ on y = x², Q sliding down to P as h shrinks, the
# chord's gradient read out at each h (4, 3.5, 3 … 2.02), and the tangent it closes in on, f′(1) = 2.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
X = lambda x: 30 + 80 * x            # maths to the drawing: x 0..3 across, y 0..9 up
Y = lambda y: 190 - 19 * y
f = lambda x: x * x
P = (X(1), Y(1))
HS = [2, 1.5, 1, 0.5, 0.25, 0.1, 0.02]
AT = [0.8 + 1.2 * k for k in range(len(HS))]     # when Q arrives at each h; it waits HOLD there
HOLD, BACK = 0.6, 11.6


def n(v): return ('%.2f' % v).rstrip('0').rstrip('.')


def stations(fmt):
    """one property's stops: each h in turn, held; the last held to BACK, then (unseen) back to the first."""
    st = []
    for k, h in enumerate(HS):
        st += [(AT[k], fmt(h)), (AT[k] + HOLD, fmt(h))]
    return st + [(BACK, fmt(HS[-1])), (BACK + 0.2, fmt(HS[0]))]


def q(h): return (X(1 + h), Y(f(1 + h)))
def ang(h): return math.degrees(math.atan2(Y(f(1 + h)) - P[1], X(1 + h) - P[0]))
def tr(xy): return 'translate(%.1fpx, %.1fpx)' % xy


curve = ' '.join(('M' if i == 0 else 'L') + '%.1f %.1f' % (X(x), Y(f(x)))
                 for i, x in enumerate([-0.15 + 0.05 * i for i in range(65)]) if f(x) <= 9.6)
TAN = math.degrees(math.atan2(-19 * 2, 80))
L = HS[-1]
MOVERS = {   # class: its keyframes' declaration at h; the base style is the last h
    'afp-q': lambda h: 'transform: %s;' % tr(q(h)),
    'afp-sec': lambda h: 'transform: %s rotate(%.2fdeg);' % (tr(P), ang(h)),
    'afp-run': lambda h: 'transform: %s scaleX(%.1f);' % (tr(P), X(1 + h) - P[0]),
    'afp-rise': lambda h: 'transform: %s scaleY(%.1f);' % (tr((X(1 + h), P[1])), P[1] - Y(f(1 + h))),
    'afp-hl': lambda h: 'transform: %s;' % tr(((P[0] + X(1 + h)) / 2, P[1] + 15)),
}

css = [""".an-afirst { --afp-p: #6fd8c4; --afp-q: var(--coral); width: min(88vw, 22rem, 100%%); text-align: center; }
.afp-svg { display: block; width: 100%%; height: auto; }
.afp-ax { stroke: var(--dim); stroke-width: 1; fill: none; }
.afp-curve { stroke: var(--ink); stroke-width: 2.2; fill: none; stroke-linecap: round; }
.afp-t { font: 700 12px var(--mono); fill: var(--dim); }
.afp-big { font: 700 13px var(--mono); fill: var(--ink); }
.afp-gold { fill: var(--gold); }
.afp-p { fill: var(--afp-p); }
.afp-mv { transform-box: view-box; transform-origin: 0 0; }
.afp-ql { fill: var(--afp-q); }
.afp-sec { stroke: var(--afp-q); stroke-width: 1.8; }
.afp-run, .afp-rise { stroke: var(--dim); stroke-width: 1.4; }
.afp-tan { stroke: var(--gold); stroke-width: 2.4; stroke-linecap: round; transform: %s rotate(%.2fdeg); animation: afp-tan %gs linear infinite; }
.afp-chord { opacity: 0; animation: afp-chord %gs linear infinite; }
.afp-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.afp-say > span { grid-area: 1 / 1; }
.afp-say b { color: var(--gold); }
.afp-say i { font-style: normal; color: var(--afp-q); }""" % (tr(P), TAN, T, T)]
for cls, at in MOVERS.items():
    css.append('.%s { %s animation: %s %gs linear infinite; }' % (cls, at(L), cls, T))
    css.append(kf(cls, T, stations(at)))
css.append(fade('afp-chord', T, 0.6, 9.2, f=0.4))     # Q, the chord and its marks, until the tangent takes over
css.append(fade('afp-tan', T, 9.0, 11.5, f=0.45))

reads = []
for k, h in enumerate(HS):
    off = (AT[k + 1] - 0.45) if k + 1 < len(HS) else 9.0
    reads.append('    <text class="afp-big afp-r%d" x="44" y="22">h = %s · gradient <tspan class="afp-gold">%s</tspan></text>' % (k, n(h), n(2 + h)))
    css.append('.afp-r%d { opacity: 0; animation: afp-r%d %gs linear infinite; }' % (k, k, T))
    css.append(fade('afp-r%d' % k, T, AT[k] - 0.15, off, f=0.25))
css.append('.afp-rf { animation: afp-rf %gs linear infinite; }' % T)
css.append(fade('afp-rf', T, 9.2, 11.6))
say_html, say_css = captions('afp', T, [
    (0, 4.3, 'Chord PQ: gradient = <i>(f(1 + h) − f(1)) ÷ h</i>'),
    (4.3, 9.0, 'Shrink h: Q slides to P, the gradient closes in on 2'),
    (9.0, T, 'The limit is the tangent: <b>f′(1) = 2</b>')])
css += [say_css, still_block('afirst')]

html = '''<div class="an-afirst" aria-hidden="true">
  <svg class="afp-svg" viewBox="0 0 300 210">
    <path class="afp-ax" d="M30 196V34M14 190H292"/>
    <text class="afp-t" x="284" y="205">x</text>
    <text class="afp-t" x="22" y="30">y</text>
    <path class="afp-curve" d="%s"/>
    <text class="afp-t" x="150" y="80">y = x²</text>
    <line class="afp-tan afp-mv" x1="-110" y1="0" x2="190" y2="0"/>
    <g class="afp-chord">
      <line class="afp-sec afp-mv" x1="-110" y1="0" x2="230" y2="0"/>
      <line class="afp-run afp-mv" x1="0" y1="0" x2="1" y2="0"/>
      <line class="afp-rise afp-mv" x1="0" y1="0" x2="0" y2="-1"/>
      <text class="afp-t afp-hl afp-mv" x="-4" y="0">h</text>
      <g class="afp-q afp-mv">
        <circle class="afp-ql" cx="0" cy="0" r="4.5"/>
        <text class="afp-t afp-ql" x="7" y="-8">Q</text>
      </g>
    </g>
    <circle class="afp-p" cx="%.1f" cy="%.1f" r="4.5"/>
    <text class="afp-t" x="%.1f" y="%.1f">P(1, 1)</text>
%s
    <text class="afp-big afp-rf" x="44" y="22">h → 0 · f′(1) = <tspan class="afp-gold">2</tspan></text>
  </svg>
  <div class="afp-say">
%s
  </div>
</div>''' % (curve, P[0], P[1], P[0] - 64, P[1] - 10, '\n'.join(reads), say_html)

anim_row.write_anim('afirst', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 7, 'title': 'From chord to tangent',
                           'about': 'Differentiation from first principles|Tangent'})
