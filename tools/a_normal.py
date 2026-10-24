# The normal distribution, drawn: the standard normal curve with its X ~ N(50, 4²) scale beneath, and the area to the
# left of z shaded and read out as it steps z = −1, 0, 1, 1.96 — 0.159, 0.5, 0.841, 0.975.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
CX, BASE, SX, SY = 150, 158, 40, 300     # z = 0 at CX; px per unit of z; px per unit of density
ZS = [-1, 0, 1, 1.96]
HOLD = [(0.6, 2.8), (3.4, 5.6), (6.2, 8.4), (9.0, 11.4)]
LEFT = CX - SX * 3.4


def phi(z): return math.exp(-z * z / 2) / math.sqrt(2 * math.pi)
def Phi(z): return 0.5 * (1 + math.erf(z / math.sqrt(2)))


zs = [-3.4 + 0.05 * i for i in range(137)]
curve = 'M' + ' L'.join('%.1f %.1f' % (CX + SX * z, BASE - SY * phi(z)) for z in zs)
area = curve + ' L%.1f %d L%.1f %d Z' % (CX + SX * 3.4, BASE, LEFT, BASE)


def stations(fmt):
    st = []
    for z, (a, b) in zip(ZS, HOLD):
        st += [(a, fmt(z)), (b, fmt(z))]
    return [(0, fmt(-3.4))] + st + [(11.8, fmt(ZS[-1])), (T, fmt(-3.4))]


clip_at = lambda z: 'transform: translateX(%.1fpx) scaleX(%.2f);' % (LEFT, CX + SX * z - LEFT)
line_at = lambda z: 'transform: translateX(%.1fpx);' % (CX + SX * z)
css = [""".an-anormal { --ano-a: #6fa8dc; width: min(88vw, 22rem, 100%); text-align: center; }
.ano-svg { display: block; width: 100%; height: auto; }
.ano-ax { stroke: var(--dim); stroke-width: 1; fill: none; }
.ano-t { font: 700 11px var(--mono); fill: var(--dim); text-anchor: middle; }
.ano-x { fill: var(--ano-a); }
.ano-mv { transform-box: view-box; transform-origin: 0 0; }
.ano-curve { stroke: var(--ink); stroke-width: 2.2; fill: none; }
.ano-fill { fill: var(--gold); fill-opacity: .5; }
.ano-z { stroke: var(--gold); stroke-width: 2; }
.ano-big { font: 700 13px var(--mono); fill: var(--ink); }
.ano-gold { fill: var(--gold); }
.ano-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.ano-say > span { grid-area: 1 / 1; }
.ano-say b { color: var(--gold); }"""]
css.append('.ano-clip { %s animation: ano-clip %gs ease-in-out infinite; }' % (clip_at(ZS[-1]), T))
css.append(kf('ano-clip', T, stations(clip_at)))
css.append('.ano-z { %s animation: ano-z %gs ease-in-out infinite; }' % (line_at(ZS[-1]), T))
css.append(kf('ano-z', T, stations(line_at)))
reads = []
for k, (z, (a, b)) in enumerate(zip(ZS, HOLD)):
    x = 50 + 4 * z
    reads.append('    <text class="ano-big ano-r%d" x="12" y="22">P(Z &lt; %s) = <tspan class="ano-gold">%.3f</tspan></text>' % (k, ('%g' % z).replace('-', '−'), Phi(z)))
    reads.append('    <text class="ano-big ano-x ano-r%d" x="12" y="40">X &lt; %s</text>' % (k, ('%.2f' % x).rstrip('0').rstrip('.')))
    css.append('.ano-r%d { opacity: %d; animation: ano-r%d %gs linear infinite; }' % (k, 1 if k == len(ZS) - 1 else 0, k, T))
    css.append(fade('ano-r%d' % k, T, a + 0.1, b + 0.3 if k < len(ZS) - 1 else 11.6, f=0.3))
say_html, say_css = captions('ano', T, [
    (0, 3.4, 'Standardise: <b>Z = (X − μ) ÷ σ</b> — X = 46 is z = −1'),
    (3.4, 9.0, 'The shaded area is the probability P(Z &lt; z)'),
    (9.0, T, 'P(Z &lt; 1.96) = 0.975: <b>95% lies within μ ± 1.96σ</b>')])
css += [say_css, still_block('anormal')]

ticks = ''.join('<path class="ano-ax" d="M%.1f %dv5"/><text class="ano-t" x="%.1f" y="%d">%s</text><text class="ano-t ano-x" x="%.1f" y="%d">%d</text>'
                % (CX + SX * z, BASE, CX + SX * z, BASE + 16, ('%d' % z).replace('-', '−'), CX + SX * z, BASE + 31, 50 + 4 * z) for z in range(-3, 4))
html = '''<div class="an-anormal" aria-hidden="true">
  <svg class="ano-svg" viewBox="0 0 300 200">
    <defs><clipPath id="ano-cut"><rect class="ano-clip ano-mv" x="0" y="0" width="1" height="%d"/></clipPath></defs>
    <path class="ano-fill" d="%s" clip-path="url(#ano-cut)"/>
    <path class="ano-curve" d="%s"/>
    <path class="ano-ax" d="M8 %dH292"/>
    %s
    <text class="ano-t" x="286" y="%d">z</text>
    <text class="ano-t ano-x" x="286" y="%d">X</text>
    <line class="ano-z ano-mv" x1="0" y1="%d" x2="0" y2="%d"/>
%s
    <text class="ano-t ano-x" x="252" y="22">X ~ N(50, 4²)</text>
  </svg>
  <div class="ano-say">
%s
  </div>
</div>''' % (BASE + 1, area, curve, BASE, ticks, BASE + 16, BASE + 31, BASE, BASE - SY * phi(0) - 6, '\n'.join(reads), say_html)

anim_row.write_anim('anormal', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 14, 'title': 'Area under the normal curve',
                           'about': 'Normal distribution|Standardising'})
