# The circular flow of income, drawn: households spend at firms, firms pay incomes back to households, the money running
# round both arcs; then the withdrawals (saving, taxes, imports) drain out and the injections (investment, government
# spending, exports) come in. The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any
# change. docs/history/425.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import fade, captions, still_block

T = 14.0
OUT_ON, IN_ON = 4.6, 8.6
OUTS = [(92, 'S', 'saving'), (150, 'T', 'taxes'), (208, 'M', 'imports')]
INS = [(92, 'I', 'investment'), (150, 'G', 'government'), (208, 'X', 'exports')]

css = [""".an-ecflow { --eflw-in: #6fa8dc; --eflw-out: #e06666; width: min(88vw, 22rem, 100%); text-align: center; }
.eflw-svg { display: block; width: 100%; height: auto; }
.eflw-box { fill: var(--raised); stroke: var(--gold); stroke-width: 1.5; }
.eflw-bt { font: 700 11px var(--mono); fill: var(--ink); text-anchor: middle; }
.eflw-arc { fill: none; stroke: var(--line); stroke-width: 7; }
.eflw-run { fill: none; stroke: var(--gold); stroke-width: 3.5; stroke-linecap: round; stroke-dasharray: 2 14;
            animation: eflw-run 1.6s linear infinite; }
.eflw-at { font: 700 10px var(--mono); fill: var(--gold); text-anchor: middle; }
.eflw-o { stroke: var(--eflw-out); stroke-width: 2.5; fill: none; }
.eflw-ot { font: 700 11px var(--mono); fill: var(--eflw-out); text-anchor: middle; }
.eflw-i { stroke: var(--eflw-in); stroke-width: 2.5; fill: none; }
.eflw-it { font: 700 11px var(--mono); fill: var(--eflw-in); text-anchor: middle; }
.eflw-small { font: 700 8px var(--mono); }
@keyframes eflw-run { from { stroke-dashoffset: 16; } to { stroke-dashoffset: 0; } }
.eflw-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.eflw-say > span { grid-area: 1 / 1; }
.eflw-say b { color: var(--gold); }"""]
css.append('.eflw-outs { opacity: 1; animation: eflw-outs %gs linear infinite; }' % T)
css.append(fade('eflw-outs', T, OUT_ON, 13.6))
css.append('.eflw-ins { opacity: 1; animation: eflw-ins %gs linear infinite; }' % T)
css.append(fade('eflw-ins', T, IN_ON, 13.6))

say_html, say_css = captions('eflw', T, [
    (0, OUT_ON, 'Households spend at firms; firms pay wages, rent and profit back: <b>the circular flow</b>'),
    (OUT_ON, IN_ON, '<b>Withdrawals</b> leak out of the flow: saving, taxes, imports'),
    (IN_ON, T, '<b>Injections</b> come in: investment, government spending, exports. More in than out, and income grows')], end=13.6)
css += [say_css, still_block('ecflow')]

outs = '\n'.join('''      <path class="eflw-o" d="M%d 175V189m-4 -5l4 5l4 -5"/>
      <text class="eflw-ot" x="%d" y="200">%s</text>
      <text class="eflw-ot eflw-small" x="%d" y="209">%s</text>''' % (x, x, k, x, w) for x, k, w in OUTS)
ins = '\n'.join('''      <text class="eflw-it eflw-small" x="%d" y="7">%s</text>
      <text class="eflw-it" x="%d" y="18">%s</text>
      <path class="eflw-i" d="M%d 22V38m-4 -5l4 5l4 -5"/>''' % (x, w, x, k, x) for x, k, w in INS)

html = '''<div class="an-ecflow" aria-hidden="true">
  <svg class="eflw-svg" viewBox="0 0 300 212">
    <path class="eflw-arc" d="M52 86C52 26 248 26 248 86"/>
    <path class="eflw-arc" d="M248 128C248 188 52 188 52 128"/>
    <path class="eflw-run" d="M52 86C52 26 248 26 248 86"/>
    <path class="eflw-run" d="M248 128C248 188 52 188 52 128"/>
    <text class="eflw-at" x="150" y="64">spending £</text>
    <text class="eflw-at" x="150" y="158">incomes £</text>
    <rect class="eflw-box" x="10" y="86" width="84" height="42" rx="8"/>
    <text class="eflw-bt" x="52" y="111">Households</text>
    <rect class="eflw-box" x="206" y="86" width="84" height="42" rx="8"/>
    <text class="eflw-bt" x="248" y="111">Firms</text>
    <g class="eflw-outs">
%s
    </g>
    <g class="eflw-ins">
%s
    </g>
  </svg>
  <div class="eflw-say">
%s
  </div>
</div>''' % (outs, ins, say_html)

anim_row.write_anim('ecflow', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-GCSE-ECON', 'chapter': 8, 'title': 'The circular flow of income',
                           'about': 'Circular flow of income|Injections and withdrawals'})
