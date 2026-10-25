# A cash-flow forecast, running: month by month the table shows opening balance, inflows, outflows, net cash flow and
# closing balance, and each closing balance drops into the chart below as a bar — red under the line when the business
# would be overdrawn — and becomes the next month's opening balance. The whole row is this script's output
# (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/425.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 15.0
OPEN = 1000
MONTHS = [('Jan', 5000, 6500), ('Feb', 6000, 5000), ('Mar', 7000, 5500), ('Apr', 4500, 6000), ('May', 8000, 6000), ('Jun', 8000, 6500)]
START, EACH, END = 0.4, 2.0, 14.4
ZERO, PXL = 214, 0.022                    # the chart's zero line, px a pound
BX0, BW = 46, 38


def money(v):
    return ('−£%s' % format(-v, ',')) if v < 0 else '£%s' % format(v, ',')


css = [""".an-eccashflow { --ecf-in: var(--good); --ecf-out: var(--bad); width: min(88vw, 22rem, 100%); text-align: center; }
.ecf-svg { display: block; width: 100%; height: auto; }
.ecf-row { font: 700 11px var(--mono); fill: var(--dim); }
.ecf-v { font: 700 11px var(--mono); fill: var(--ink); text-anchor: end; }
.ecf-vin { fill: var(--ecf-in); }
.ecf-vout { fill: var(--ecf-out); }
.ecf-vgold { fill: var(--gold); }
.ecf-mh { font: 700 13px var(--mono); fill: var(--gold); text-anchor: end; }
.ecf-rule { stroke: var(--line); stroke-width: 1; }
.ecf-zero { stroke: var(--dim); stroke-width: 1.2; }
.ecf-up { fill: var(--gold); transform-box: fill-box; transform-origin: 50% 100%; }
.ecf-dn { fill: var(--ecf-out); transform-box: fill-box; transform-origin: 50% 0; }
.ecf-ml { font: 700 9px var(--mono); fill: var(--dim); text-anchor: middle; }
.ecf-bv { font: 700 8px var(--mono); fill: var(--ink); text-anchor: middle; }
.ecf-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.ecf-say > span { grid-area: 1 / 1; }
.ecf-say b { color: var(--gold); }"""]

ROWS = ['Opening balance', 'Cash inflows', 'Cash outflows', 'Net cash flow', 'Closing balance']
table = ['    <text class="ecf-row" x="12" y="%d">%s</text>' % (40 + 17 * k, r) for k, r in enumerate(ROWS)]
table.append('    <path class="ecf-rule" d="M12 %dH288"/>' % (40 + 17 * 3 + 5))
months, bars = [], []
bal = OPEN
for k, (m, i, o) in enumerate(MONTHS):
    opening, net = bal, i - o
    bal = opening + net
    on = START + k * EACH
    last = k == len(MONTHS) - 1
    cls = 'ecf-m%d' % k
    vals = [(opening, ''), (i, ' ecf-vin'), (-o, ' ecf-vout'), (net, ' ecf-vin' if net >= 0 else ' ecf-vout'), (bal, ' ecf-vgold')]
    months.append('    <g class="%s">\n      <text class="ecf-mh" x="288" y="18">%s</text>\n%s\n    </g>' % (
        cls, m, '\n'.join('      <text class="ecf-v%s" x="288" y="%d">%s</text>' % (c, 40 + 17 * n, money(v)) for n, (v, c) in enumerate(vals))))
    css.append('.%s { opacity: %d; animation: %s %gs linear infinite; }' % (cls, 1 if last else 0, cls, T))
    css.append(fade(cls, T, on if k else 0.01, on + EACH - 0.1 if not last else END, f=0.25) if k else
               kf(cls, T, [(0, 'opacity: 1;'), (on + EACH - 0.1, 'opacity: 1;'), (on + EACH + 0.15, 'opacity: 0;'),
                           (END, 'opacity: 0;'), (END + 0.3, 'opacity: 1;')]))
    # the bar: up from zero (gold) or down from it (red), grown in as the month closes, kept to the end
    x = BX0 + k * BW
    h = abs(bal) * PXL
    up = bal >= 0
    bcls = 'ecf-b%d' % k
    bars.append('    <rect class="%s %s" x="%d" y="%d" width="%d" height="1"/>' % ('ecf-up' if up else 'ecf-dn', bcls, x + 6, ZERO - 1 if up else ZERO, BW - 12))
    bars.append('    <text class="ecf-ml" x="%d" y="%d">%s</text>' % (x + BW / 2, ZERO + (11 if up else -3), m))
    bars.append('    <text class="ecf-bv %sv" x="%d" y="%.0f">%s</text>' % (bcls, x + BW / 2, ZERO - h - 3 if up else ZERO + h + 9, money(bal)))
    grow = on + 0.9
    css.append('.%s { transform: scaleY(%.1f); animation: %s %gs ease-out infinite; }' % (bcls, max(h, 0.1), bcls, T))
    css.append(kf(bcls, T, [(0, 'transform: scaleY(0);'), (grow, 'transform: scaleY(0);'), (grow + 0.6, 'transform: scaleY(%.1f);' % max(h, 0.1)),
                            (END, 'transform: scaleY(%.1f);' % max(h, 0.1)), (END + 0.4, 'transform: scaleY(0);')]))
    css.append('.%sv { opacity: 1; animation: %sv %gs linear infinite; }' % (bcls, bcls, T))
    css.append(fade(bcls + 'v', T, grow + 0.6, END))

say_html, say_css = captions('ecf', T, [
    (0, 2.4, 'January: £1,000 in the bank, £1,500 more out than in — <b>overdrawn</b>'),
    (2.4, 6.4, 'Each <b>closing balance</b> is the next month\'s <b>opening balance</b>'),
    (6.4, 10.4, '<b>Net cash flow</b> = cash inflows − cash outflows'),
    (10.4, T, 'The forecast warns of January in advance: arrange an overdraft')], end=END)
css += [say_css, still_block('eccashflow')]

html = '''<div class="an-eccashflow" aria-hidden="true">
  <svg class="ecf-svg" viewBox="0 0 300 240">
%s
%s
    <path class="ecf-zero" d="M40 %dH%d"/>
%s
  </svg>
  <div class="ecf-say">
%s
  </div>
</div>''' % ('\n'.join(table), '\n'.join(months), ZERO, BX0 + len(MONTHS) * BW + 4, '\n'.join(bars), say_html)

anim_row.write_anim('eccashflow', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-GCSE-BUS', 'chapter': 16, 'title': 'A cash-flow forecast, month by month',
                           'about': 'Cash-flow forecast|Opening and closing balance|Net cash flow'})
