# A geometric series converging, drawn: ½ + ¼ + ⅛ + … laid end to end in a bar that never passes 1, and under it the
# partial sums Sₙ climbing towards the dashed line S∞ = a ÷ (1 − r) = 1.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
N = 8
BX, BW, BY, BH = 20, 260, 28, 26     # the bar: the whole of 1
GX, GW, G0, GH = 44, 236, 208, 108   # the graph of Sₙ: n = 1 … 8 across, S = 0 … 1 up
AT = [0.6 + 0.95 * k for k in range(N)]
LABEL = {0: '½', 1: '¼', 2: '⅛'}


def S(n): return 1 - 0.5 ** n


css = [""".an-ageom { --age-a: #6fd8c4; --age-b: #6fa8dc; width: min(88vw, 22rem, 100%); text-align: center; }
.age-svg { display: block; width: 100%; height: auto; }
.age-frame { fill: none; stroke: var(--dim); stroke-width: 1.2; }
.age-pa { fill: var(--age-a); }
.age-pb { fill: var(--age-b); }
.age-pc { stroke: var(--bg); stroke-width: 1; }
.age-frac { font: 700 13px var(--mono); fill: var(--bg); text-anchor: middle; dominant-baseline: central; }
.age-ax { stroke: var(--dim); stroke-width: 1; fill: none; }
.age-lim { stroke: var(--gold); stroke-width: 1.4; stroke-dasharray: 5 4; }
.age-t { font: 700 11px var(--mono); fill: var(--dim); }
.age-gold { font: 700 12px var(--mono); fill: var(--gold); }
.age-dot { fill: var(--ink); }
.age-big { font: 700 13px var(--mono); fill: var(--ink); }
.age-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.age-say > span { grid-area: 1 / 1; }
.age-say b { color: var(--gold); }"""]
pieces, dots, reads = [], [], []
x = BX
for k in range(N):
    w = BW * 0.5 ** (k + 1)
    lab = '<text class="age-frac" x="%.1f" y="%d">%s</text>' % (x + w / 2, BY + BH // 2, LABEL[k]) if k in LABEL else ''
    pieces.append('    <g class="age-p%d"><rect class="age-pc %s" x="%.2f" y="%d" width="%.2f" height="%d"/>%s</g>' % (k, 'age-pa' if k % 2 == 0 else 'age-pb', x, BY, w, BH, lab))
    x += w
    gx, gy = GX + GW * k / (N - 1), G0 - GH * S(k + 1)
    dots.append('    <circle class="age-dot age-p%d" cx="%.1f" cy="%.1f" r="4"/>' % (k, gx, gy))
    reads.append('    <text class="age-big age-r%d" x="150" y="%d" text-anchor="middle">S%s = <tspan class="age-gold">%s</tspan></text>' % (k, BY + BH + 22, '₁₂₃₄₅₆₇₈'[k], ('%.4f' % S(k + 1)).rstrip('0')))
    css.append('.age-p%d { animation: age-p%d %gs ease-out infinite; }' % (k, k, T))
    css.append(kf('age-p%d' % k, T, [(AT[k] - 0.05, 'opacity: 0;'), (AT[k] + 0.35, 'opacity: 1;'), (11.4, 'opacity: 1;'), (11.8, 'opacity: 0;')]))
    css.append('.age-r%d { opacity: %d; animation: age-r%d %gs linear infinite; }' % (k, 1 if k == N - 1 else 0, k, T))
    css.append(fade('age-r%d' % k, T, AT[k] + 0.2, AT[k + 1] - 0.1 if k + 1 < N else 11.4, f=0.2))
for cls in ('age-lim', 'age-limt'):
    css.append('.%s { animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(fade(cls, T, AT[3], 11.4))
say_html, say_css = captions('age', T, [
    (0, 3.4, '½ + ¼ + ⅛ + …: each piece is half of what is left'),
    (3.4, 7.2, 'The sums 0.5, 0.75, 0.875 … close in on 1 and never pass it'),
    (7.2, T, '∣r∣ < 1, so <b>S∞ = a ÷ (1 − r) = ½ ÷ ½ = 1</b>')])
css += [say_css, still_block('ageom')]

nt = ''.join('<text class="age-t" x="%.1f" y="%d" text-anchor="middle">%d</text>' % (GX + GW * k / (N - 1), G0 + 14, k + 1) for k in range(N))
html = '''<div class="an-ageom" aria-hidden="true">
  <svg class="age-svg" viewBox="0 0 300 230">
    <text class="age-t" x="20" y="%d">0</text>
    <text class="age-t" x="272" y="%d">1</text>
%s
    <rect class="age-frame" x="%d" y="%d" width="%d" height="%d"/>
%s
    <path class="age-ax" d="M%d %dV%dM%d %dH290"/>
    <line class="age-lim" x1="%d" y1="%d" x2="290" y2="%d"/>
    <text class="age-gold age-limt" x="%d" y="%d">S∞ = 1</text>
    <text class="age-t" x="%d" y="%d">Sₙ</text>
    %s
    <text class="age-t" x="286" y="%d">n</text>
%s
  </svg>
  <div class="age-say">
%s
  </div>
</div>''' % (BY - 6, BY - 6, '\n'.join(pieces), BX, BY, BW, BH, '\n'.join(reads),
             GX - 12, G0, G0 - GH - 14, GX - 12, G0, GX - 12, G0 - GH, G0 - GH, 236, G0 - GH - 6,
             GX - 34, G0 - GH + 14, nt, G0 + 14, '\n'.join(dots), say_html)

anim_row.write_anim('ageom', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 4, 'title': 'Summing to infinity',
                           'about': 'Sum to infinity|Geometric sequence'})
