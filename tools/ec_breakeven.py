# A break-even chart, built line by line: fixed costs (£2000, flat), total costs (fixed plus £6 a unit), total revenue
# (£10 a unit) from nothing; where revenue crosses total costs is break-even, 500 units; the loss to its left, the profit
# to its right, and the margin of safety at sales of 800. The whole row is this script's output (tools/anim_row.py,
# `whole=`); re-run it after any change. docs/history/425.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 15.0
FC, VC, P, QMAX, SALES = 2000, 6, 10, 1000, 800
OX, BASE, XW, YH, YMAX = 40, 182, 236, 156, 10000


def x(q): return OX + XW * q / QMAX


def y(v): return BASE - YH * v / YMAX


BE = FC / (P - VC)
STEPS = [('fc', 0.6), ('tc', 2.6), ('tr', 4.6), ('be', 6.6), ('zone', 8.4), ('mos', 10.2)]
END = 14.2

css = [""".an-ecbreakeven { --ebe-tc: var(--coral); --ebe-tr: #6fa8dc; --ebe-loss: rgb(224 102 102 / .3);
  --ebe-win: rgb(147 196 125 / .3); width: min(88vw, 22rem, 100%); text-align: center; }
.ebe-svg { display: block; width: 100%; height: auto; }
.ebe-ax { stroke: var(--dim); stroke-width: 1.2; fill: none; }
.ebe-t { font: 700 9px var(--mono); fill: var(--dim); }
.ebe-line { fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 1; }
.ebe-sfc { stroke: var(--gold); }
.ebe-tcl { stroke: var(--ebe-tc); }
.ebe-trl { stroke: var(--ebe-tr); }
.ebe-lab { font: 700 11px var(--mono); }
.ebe-lfc { fill: var(--gold); }
.ebe-ltc { fill: var(--ebe-tc); }
.ebe-ltr { fill: var(--ebe-tr); }
.ebe-loss { fill: var(--ebe-loss); }
.ebe-win { fill: var(--ebe-win); }
.ebe-zt { font: 700 10px var(--mono); fill: var(--ink); text-anchor: middle; }
.ebe-dot { fill: var(--ink); }
.ebe-gd { stroke: var(--ink); stroke-width: 1; stroke-dasharray: 3 3; fill: none; }
.ebe-bt { font: 700 10px var(--mono); fill: var(--ink); text-anchor: middle; }
.ebe-mosl { stroke: var(--gold); stroke-width: 2; fill: none; }
.ebe-mt { font: 700 10px var(--mono); fill: var(--gold); text-anchor: middle; }
.ebe-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.ebe-say > span { grid-area: 1 / 1; }
.ebe-say b { color: var(--gold); }"""]

for key, on in STEPS:
    if key in ('fc', 'tc', 'tr'):
        css.append('.ebe-d%s { stroke-dashoffset: 0; animation: ebe-d%s %gs ease-in-out infinite; }' % (key, key, T))
        css.append(kf('ebe-d' + key, T, [(0, 'stroke-dashoffset: 1; opacity: 1;'), (on, 'stroke-dashoffset: 1; opacity: 1;'),
                                         (on + 1.2, 'stroke-dashoffset: 0; opacity: 1;'), (END, 'stroke-dashoffset: 0; opacity: 1;'),
                                         (END + 0.5, 'stroke-dashoffset: 0; opacity: 0;')]))
    css.append('.ebe-%s { opacity: 1; animation: ebe-%s %gs linear infinite; }' % (key, key, T))
    css.append(fade('ebe-' + key, T, on + (1.2 if key in ('fc', 'tc', 'tr') else 0.35), END))

say_html, say_css = captions('ebe', T, [
    (0, 2.6, '<b>Fixed costs</b> £2000 — the same at any output'),
    (2.6, 4.6, '<b>Total costs</b> = fixed costs + £6 for every unit made'),
    (4.6, 6.6, '<b>Total revenue</b> = £10 × units sold, from zero'),
    (6.6, 8.4, '<b>Break-even</b> where they cross: 2000 ÷ (10 − 6) = 500 units'),
    (8.4, 10.2, 'Below 500 a loss, above it a profit'),
    (10.2, T, 'Selling 800: <b>margin of safety</b> = 800 − 500 = 300 units')], end=END)
css += [say_css, still_block('ecbreakeven')]

html = '''<div class="an-ecbreakeven" aria-hidden="true">
  <svg class="ebe-svg" viewBox="0 0 300 206">
    <g class="ebe-zone">
      <path class="ebe-loss" d="M%.1f %.1fL%.1f %.1fL%.1f %.1fZ"/>
      <path class="ebe-win" d="M%.1f %.1fL%.1f %.1fL%.1f %.1fZ"/>
      <text class="ebe-zt" x="%.1f" y="%.1f">loss</text>
      <text class="ebe-zt" x="%.1f" y="%.1f">profit</text>
    </g>
    <path class="ebe-line ebe-sfc ebe-dfc" pathLength="1" d="M%.1f %.1fH%.1f"/>
    <text class="ebe-lab ebe-lfc ebe-fc" x="%.1f" y="%.1f">FC</text>
    <path class="ebe-line ebe-tcl ebe-dtc" pathLength="1" d="M%.1f %.1fL%.1f %.1f"/>
    <text class="ebe-lab ebe-ltc ebe-tc" x="%.1f" y="%.1f">TC</text>
    <path class="ebe-line ebe-trl ebe-dtr" pathLength="1" d="M%.1f %.1fL%.1f %.1f"/>
    <text class="ebe-lab ebe-ltr ebe-tr" x="%.1f" y="%.1f">TR</text>
    <g class="ebe-be">
      <path class="ebe-gd" d="M%.1f %.1fV%d"/>
      <circle class="ebe-dot" cx="%.1f" cy="%.1f" r="4"/>
      <text class="ebe-bt" x="%.1f" y="%.1f">break-even</text>
    </g>
    <g class="ebe-mos">
      <path class="ebe-mosl" d="M%.1f %dH%.1fM%.1f %dv-6v12M%.1f %dv-6v12"/>
      <text class="ebe-mt" x="%.1f" y="%d">margin of safety</text>
    </g>
    <path class="ebe-ax" d="M%d 12V%dH292"/>
    <text class="ebe-t" x="%d" y="%d" text-anchor="end">£10k</text>
    <text class="ebe-t" x="%d" y="%d" text-anchor="end">£5k</text>
    <text class="ebe-t" x="%d" y="%d" text-anchor="end">£2k</text>
    <text class="ebe-t" x="%.1f" y="%d" text-anchor="middle">500</text>
    <text class="ebe-t" x="%.1f" y="%d" text-anchor="middle">1000</text>
    <text class="ebe-t" x="292" y="204" text-anchor="end">units</text>
  </svg>
  <div class="ebe-say">
%s
  </div>
</div>''' % (x(0), y(FC), x(BE), y(P * BE), x(0), y(0),
             x(BE), y(P * BE), x(QMAX), y(P * QMAX), x(QMAX), y(FC + VC * QMAX),
             x(130), y(1500), x(900), y(7900),
             x(0), y(FC), x(QMAX), x(QMAX) - 14, y(FC) + 14,
             x(0), y(FC), x(QMAX), y(FC + VC * QMAX), x(QMAX) + 3, y(FC + VC * QMAX) + 4,
             x(0), y(0), x(QMAX), y(P * QMAX), x(QMAX) - 18, y(P * QMAX) + 2,
             x(BE), y(P * BE), BASE, x(BE), y(P * BE), x(BE) - 34, y(P * BE) - 8,
             x(BE), BASE - 12, x(SALES), x(BE), BASE - 12, x(SALES), BASE - 12, (x(BE) + x(SALES)) / 2, BASE - 18,
             OX, BASE, OX - 3, y(10000) + 3, OX - 3, y(5000) + 3, OX - 3, y(2000) + 3,
             x(500), BASE + 11, x(1000), BASE + 11, say_html)

anim_row.write_anim('ecbreakeven', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-GCSE-BUS', 'chapter': 15, 'title': 'Building a break-even chart',
                           'about': 'Break-even chart|Break-even point|Margin of safety'})
