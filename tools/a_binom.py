# The binomial distribution, drawn: the eleven bars of B(10, p) reshaping as p goes 0.2 → 0.5 → 0.8 → 0.3 — piled
# near np and skewed right, symmetrical about 5, the mirror image — with the mean np marked under them.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
N = 10
PS = [0.2, 0.5, 0.8, 0.3]
HOLD = [(0.4, 2.6), (3.4, 5.6), (6.4, 8.6), (9.4, 11.6)]    # each p is reached at the first time and held to the second
B0, BW, BASE, KH = 22, 23.5, 168, 400                      # first bar's left, bar pitch, the axis, px per unit of probability


def pr(r, p): return math.comb(N, r) * p ** r * (1 - p) ** (N - r)


def bx(r): return B0 + r * BW


def stations(fmt):
    st = []
    for p, (a, b) in zip(PS, HOLD):
        st += [(a, fmt(p)), (b, fmt(p))]
    return st + [(T, fmt(PS[0]))]


css = [""".an-abinom { --abn-bar: #6fa8dc; width: min(88vw, 22rem, 100%); text-align: center; }
.abn-svg { display: block; width: 100%; height: auto; }
.abn-ax { stroke: var(--dim); stroke-width: 1; fill: none; }
.abn-t { font: 700 11px var(--mono); fill: var(--dim); text-anchor: middle; }
.abn-mv { transform-box: view-box; transform-origin: 0 0; }
.abn-bar { fill: var(--abn-bar); transform-box: fill-box; transform-origin: 50% 100%; }
.abn-mean { fill: var(--gold); }
.abn-mt { font: 700 11px var(--mono); fill: var(--gold); text-anchor: middle; }
.abn-big { font: 700 13px var(--mono); fill: var(--ink); }
.abn-gold { fill: var(--gold); }
.abn-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.abn-say > span { grid-area: 1 / 1; }
.abn-say b { color: var(--gold); }"""]
bars = []
for r in range(N + 1):
    cls = 'abn-b%d' % r
    at = lambda p, r=r: 'transform: scaleY(%.1f);' % (KH * pr(r, p))
    bars.append('    <rect class="abn-bar %s" x="%.1f" y="%d" width="%.1f" height="1"/>' % (cls, bx(r) + 1, BASE - 1, BW - 2))
    bars.append('    <text class="abn-t" x="%.1f" y="%d">%d</text>' % (bx(r) + BW / 2, BASE + 14, r))
    css.append('.%s { %s animation: %s %gs ease-in-out infinite; }' % (cls, at(0.3), cls, T))
    css.append(kf(cls, T, stations(at)))
mean_at = lambda p: 'transform: translateX(%.1fpx);' % (bx(0) + BW / 2 + N * p * BW)
css.append('.abn-m { %s animation: abn-m %gs ease-in-out infinite; }' % (mean_at(0.3), T))
css.append(kf('abn-m', T, stations(mean_at)))
reads = []
for k, (p, (a, b)) in enumerate(zip(PS, HOLD)):
    reads.append('    <text class="abn-big abn-r%d" x="16" y="22">X ~ B(10, <tspan class="abn-gold">%g</tspan>)</text>' % (k, p))
    css.append('.abn-r%d { opacity: %d; animation: abn-r%d %gs linear infinite; }' % (k, 1 if k == len(PS) - 1 else 0, k, T))
    css.append(fade('abn-r%d' % k, T, a - 0.2, b + 0.4 if k < len(PS) - 1 else 11.6, f=0.3))
say_html, say_css = captions('abn', T, [
    (0, 3.0, 'p = 0.2: the bars pile up near np = 2 and tail off right'),
    (3.0, 6.0, 'p = 0.5: symmetrical about np = 5'),
    (6.0, 9.0, 'p = 0.8: the mirror image, skewed left'),
    (9.0, T, 'Each bar is <b>P(X = r) = ¹⁰Cᵣ pʳ (1 − p)¹⁰⁻ʳ</b>')])
css += [say_css, still_block('abinom')]

html = '''<div class="an-abinom" aria-hidden="true">
  <svg class="abn-svg" viewBox="0 0 300 206">
    <path class="abn-ax" d="M14 %dH290"/>
%s
    <g class="abn-m abn-mv">
      <path class="abn-mean" d="M0 %dl-6 9h12z"/>
      <text class="abn-mt" x="0" y="%d">np</text>
    </g>
%s
  </svg>
  <div class="abn-say">
%s
  </div>
</div>''' % (BASE, '\n'.join(bars), BASE + 18, BASE + 37, '\n'.join(reads), say_html)

anim_row.write_anim('abinom', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 13, 'title': 'The shape of B(n, p)',
                           'about': 'Binomial distribution'})
