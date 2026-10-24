# The binomial expansion, drawn: Pascal's triangle built a row at a time — each number the sum of the two above it,
# the 3 + 3 → 6 shown — then row 4 lit and set as the coefficients of (a + b)⁴, and 6 read as ⁴C₂.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
ROWS = 6
DX, DY, TOP, MID = 36, 25, 26, 150
ROW_AT = [0.4 + 0.9 * r for r in range(ROWS)]       # row r appears at this time
LIT = 6.2                                            # row 4 lights up; the expansion follows


def pos(r, k): return (MID + (k - r / 2) * DX, TOP + r * DY)


css = [""".an-apascal { --apa-n: #6fa8dc; width: min(88vw, 22rem, 100%); text-align: center; }
.apa-svg { display: block; width: 100%; height: auto; }
.apa-n { font: 700 14px var(--mono); fill: var(--ink); text-anchor: middle; dominant-baseline: central; }
.apa-link { stroke: var(--apa-n); stroke-width: 1; stroke-opacity: .45; }
.apa-hot { stroke: var(--gold); stroke-width: 2; stroke-opacity: 1; }
.apa-four { fill: var(--gold); }
.apa-exp { font: 700 12px var(--mono); fill: var(--ink); text-anchor: middle; }
.apa-c { fill: var(--gold); }
.apa-pick { font: 700 12px var(--mono); fill: var(--dim); text-anchor: middle; }
.apa-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.apa-say > span { grid-area: 1 / 1; }
.apa-say b { color: var(--gold); }"""]
els = []
for r in range(ROWS):
    row = []
    for k in range(r + 1):
        x, y = pos(r, k)
        if r:
            for kk in (k - 1, k):
                if 0 <= kk <= r - 1:
                    px, py = pos(r - 1, kk)
                    hot = r == 4 and k == 2
                    row.append('<line class="apa-link%s" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (' apa-hot' if hot else '', px, py + 8, x, y - 8))
        row.append('<text class="apa-n%s" x="%.1f" y="%.1f">%d</text>' % (' apa-four' if r == 4 else '', x, y, math.comb(r, k)))
    els.append('    <g class="apa-r%d">%s</g>' % (r, ''.join(row)))
    css.append('.apa-r%d { animation: apa-r%d %gs ease-out infinite; }' % (r, r, T))
    css.append(kf('apa-r%d' % r, T, [(ROW_AT[r] - 0.05, 'opacity: 0; transform: translateY(-6px);'), (ROW_AT[r] + 0.45, 'opacity: 1; transform: none;'),
                                      (11.5, 'opacity: 1; transform: none;'), (11.85, 'opacity: 0; transform: none;')]))
# row 4 is ink until it lights; the hot links (3 + 3 → 6) glow while row 4 arrives
css.append('.apa-four { animation: apa-four %gs linear infinite; }' % T)
css.append(kf('apa-four', T, [(LIT - 0.1, 'fill: var(--ink);'), (LIT + 0.4, 'fill: var(--gold);')]))
css.append('.apa-hot { animation: apa-hot %gs linear infinite; }' % T)
css.append(kf('apa-hot', T, [(ROW_AT[4], 'stroke-opacity: .45; stroke: var(--apa-n);'), (ROW_AT[4] + 0.3, 'stroke-opacity: 1; stroke: var(--gold);'),
                             (LIT + 2.5, 'stroke-opacity: 1; stroke: var(--gold);'), (LIT + 3, 'stroke-opacity: .45; stroke: var(--apa-n);')]))
for cls, on in [('apa-exp', LIT + 0.6), ('apa-pick', LIT + 2.8)]:
    css.append('.%s { animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(fade(cls, T, on, 11.5))
say_html, say_css = captions('apa', T, [
    (0, LIT, 'Each number is the sum of the two above it'),
    (LIT, LIT + 2.6, 'Row 4, 1 4 6 4 1, are the coefficients of <b>(a + b)⁴</b>'),
    (LIT + 2.6, T, '6 = ⁴C₂: the ways to take b from 2 of the 4 brackets')])
css += [say_css, still_block('apascal')]

y_exp = TOP + ROWS * DY + 6
html = '''<div class="an-apascal" aria-hidden="true">
  <svg class="apa-svg" viewBox="0 0 300 %d">
%s
    <text class="apa-exp" x="150" y="%d">(a + b)⁴ = <tspan class="apa-c">1</tspan>a⁴ + <tspan class="apa-c">4</tspan>a³b + <tspan class="apa-c">6</tspan>a²b² + <tspan class="apa-c">4</tspan>ab³ + <tspan class="apa-c">1</tspan>b⁴</text>
    <text class="apa-pick" x="150" y="%d">(a+b)(a+b)(a+b)(a+b): pick 2 b’s → ⁴C₂ = 6</text>
  </svg>
  <div class="apa-say">
%s
  </div>
</div>''' % (y_exp + 30, '\n'.join(els), y_exp, y_exp + 22, say_html)

anim_row.write_anim('apascal', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 4, 'title': 'Pascal and (a + b)ⁿ',
                           'about': 'Binomial expansion'})
