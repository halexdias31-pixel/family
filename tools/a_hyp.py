# A hypothesis test's critical region, drawn: B(20, 0.5) under H₀, the upper tail added a bar at a time from X = 20
# down, its probability read out — X ≥ 15 is 2.1%, X ≥ 14 would be 5.8%, past 5% — then an observed 16 landing in it.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 13.0
N, P = 20, 0.5
B0, BW, BASE, KH = 13, 13.3, 160, 640
CRIT = 15
TAIL = list(range(N, CRIT - 2, -1))                  # 20, 19 … 15, then 14 tried
AT = {k: 2.6 + 0.62 * i for i, k in enumerate(TAIL)}
TRY14 = AT[CRIT - 1]                                  # 14 joins for a moment, and is sent back
REGION = TRY14 + 1.4
OBS, OBS_AT = 16, REGION + 1.2


def pr(r): return math.comb(N, r) * P ** N
def tail(k): return sum(pr(r) for r in range(k, N + 1))
def bx(r): return B0 + r * BW


css = [""".an-ahyp { --ahy-bar: #6fa8dc; --ahy-in: var(--coral); width: min(88vw, 22rem, 100%); text-align: center; }
.ahy-svg { display: block; width: 100%; height: auto; }
.ahy-ax { stroke: var(--dim); stroke-width: 1; fill: none; }
.ahy-t { font: 700 11px var(--mono); fill: var(--dim); text-anchor: middle; }
.ahy-bar { fill: var(--ahy-bar); }
.ahy-hot { fill: var(--ahy-in); }
.ahy-mark { fill: var(--ahy-in); }
.ahy-big { font: 700 13px var(--mono); fill: var(--ink); }
.ahy-in { fill: var(--ahy-in); }
.ahy-no { fill: var(--dim); }
.ahy-reg { stroke: var(--ahy-in); stroke-width: 2; fill: none; }
.ahy-regt { font: 700 12px var(--mono); fill: var(--ahy-in); text-anchor: middle; }
.ahy-obs { fill: var(--gold); }
.ahy-obst { font: 700 12px var(--mono); fill: var(--gold); text-anchor: middle; }
.ahy-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.ahy-say > span { grid-area: 1 / 1; }
.ahy-say b { color: var(--gold); }
.ahy-say i { font-style: normal; color: var(--ahy-in); }"""]
els = []
for r in range(N + 1):
    h = KH * pr(r)
    els.append('<rect class="ahy-bar" x="%.1f" y="%.1f" width="%.1f" height="%.1f"/>' % (bx(r) + 0.6, BASE - h, BW - 1.2, h))
els = ['    <g class="ahy-bars">' + ''.join(els) + '</g>']
css.append('.ahy-bars { transform-box: view-box; transform-origin: 0 %dpx; animation: ahy-bars %gs ease-out infinite; }' % (BASE, T))
css.append(kf('ahy-bars', T, [(0.2, 'transform: scaleY(0); opacity: 1;'), (1.4, 'transform: scaleY(1); opacity: 1;'),
                              (12.5, 'transform: scaleY(1); opacity: 1;'), (12.9, 'transform: scaleY(1); opacity: 0;')]))
reads = []
for k in TAIL:
    h = KH * pr(k)
    on = AT[k]
    # each tail bar turns coral, with a coral mark under it that shows even where the bar is too short to see
    off = (TRY14 + 0.9) if k == CRIT - 1 else 12.5
    els.append('    <g class="ahy-k%d"><rect class="ahy-hot" x="%.1f" y="%.1f" width="%.1f" height="%.1f"/><rect class="ahy-mark" x="%.1f" y="%d" width="%.1f" height="4"/></g>'
               % (k, bx(k) + 0.6, BASE - h, BW - 1.2, h, bx(k) + 0.6, BASE + 2, BW - 1.2))
    css.append('.ahy-k%d { opacity: %d; animation: ahy-k%d %gs linear infinite; }' % (k, 0 if k == CRIT - 1 else 1, k, T))
    css.append(fade('ahy-k%d' % k, T, on, off, f=0.2))
    nxt = AT[k] + 0.62 if k != CRIT - 1 else TRY14 + 0.9
    bad = tail(k) > 0.05
    reads.append('    <text class="ahy-big ahy-r%d" x="12" y="22">P(X ≥ %d) = <tspan class="%s">%.4f</tspan>%s</text>'
                 % (k, k, 'ahy-no' if bad else 'ahy-in', tail(k), ' &gt; 0.05 ✗' if bad else ''))
    css.append('.ahy-r%d { opacity: 0; animation: ahy-r%d %gs linear infinite; }' % (k, k, T))
    css.append(fade('ahy-r%d' % k, T, on, nxt - 0.05, f=0.12))
reads.append('    <text class="ahy-big ahy-rf" x="12" y="22">P(X ≥ 15) = <tspan class="ahy-in">0.0207</tspan> ≤ 0.05 ✓</text>')
css.append('.ahy-rf { animation: ahy-rf %gs linear infinite; }' % T)
css.append(fade('ahy-rf', T, TRY14 + 1.05, 12.5, f=0.2))
for cls, on in [('ahy-reg', REGION), ('ahy-regt', REGION), ('ahy-obsg', OBS_AT)]:
    css.append('.%s { animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(fade(cls, T, on, 12.5))
# the observed value drops in from above
css.append('.ahy-drop { animation: ahy-drop %gs cubic-bezier(.5, 0, .7, 1) infinite; }' % T)
css.append(kf('ahy-drop', T, [(OBS_AT, 'transform: translateY(-40px);'), (OBS_AT + 0.6, 'transform: none;')]))
say_html, say_css = captions('ahy', T, [
    (0, 2.6, '<b>H₀: p = 0.5, H₁: p &gt; 0.5</b> at the 5% level, X ~ B(20, 0.5)'),
    (2.6, REGION, 'Add the tail from the top until it would pass 5%'),
    (REGION, OBS_AT + 0.3, '<i>X ≥ 15</i> is the critical region: 2.1%, the actual significance level'),
    (OBS_AT + 0.3, T, 'Observed 16 is in it: <b>reject H₀</b> — evidence that p &gt; 0.5')])
css += [say_css, still_block('ahyp')]

ticks = ''.join('<text class="ahy-t" x="%.1f" y="%d">%d</text>' % (bx(r) + BW / 2, BASE + 19, r) for r in (0, 5, 10, 15, 20))
rx0, rx1 = bx(CRIT) + 0.6, bx(N) + BW - 0.6
html = '''<div class="an-ahyp" aria-hidden="true">
  <svg class="ahy-svg" viewBox="0 0 300 206">
    <path class="ahy-ax" d="M8 %dH292"/>
%s
    %s
    <path class="ahy-reg" d="M%.1f %dV%dH%.1fV%d"/>
    <text class="ahy-regt" x="%.1f" y="%d">X ≥ 15</text>
    <g class="ahy-obsg"><g class="ahy-drop"><path class="ahy-obs" d="M%.1f %dl-6 -10h12z"/><text class="ahy-obst" x="%.1f" y="%d">16</text></g></g>
%s
  </svg>
  <div class="ahy-say">
%s
  </div>
</div>''' % (BASE, '\n'.join(els), ticks, rx0, BASE + 24, BASE + 30, rx1, BASE + 24, (rx0 + rx1) / 2, BASE + 44,
             bx(OBS) + BW / 2, BASE - 32, bx(OBS) + BW / 2, BASE - 46, '\n'.join(reads), say_html)

anim_row.write_anim('ahyp', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 15, 'title': 'Finding the critical region',
                           'about': 'Critical region|Significance level'})
