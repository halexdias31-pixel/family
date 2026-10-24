# Moments, drawn: a plank on a pivot with 30 N at 2 m to the left; a 20 N load slides out from 0.5 m on the right, its
# clockwise moment read out at each stop as the plank tips less and less — level at 3 m, where 20 × 3 = 30 × 2.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
PX, PY = 150, 140                     # the pivot's tip; the plank sits on it
M = 38                                # px per metre
DS = [0.5, 1, 1.5, 2, 2.5, 3]
AT = [0.8 + 1.3 * k for k in range(len(DS))]
HOLD = 0.8


def tilt(d):
    """degrees, positive clockwise: proportional to the unbalanced moment, at most 9°"""
    net = 20 * d - 60
    return max(-9, min(9, net * 0.2))


def stations(fmt):
    st = []
    for k, d in enumerate(DS):
        st += [(AT[k], fmt(d)), (AT[k] + HOLD, fmt(d))]
    return [(0, fmt(DS[0]))] + st + [(11.5, fmt(DS[-1])), (11.9, fmt(DS[0]))]


rot = lambda d: 'transform: translate(%dpx, %dpx) rotate(%.2fdeg) translate(%dpx, %dpx);' % (PX, PY, tilt(d), -PX, -PY)
slide = lambda d: 'transform: translateX(%.1fpx);' % (M * d)
css = [""".an-amoment { --amo-l: #6fa8dc; --amo-r: #6fd8c4; width: min(88vw, 22rem, 100%); text-align: center; }
.amo-svg { display: block; width: 100%; height: auto; }
.amo-mv { transform-box: view-box; transform-origin: 0 0; }
.amo-plank { fill: var(--raised); stroke: var(--ink); stroke-width: 1.6; }
.amo-tick { stroke: var(--dim); stroke-width: 1; }
.amo-pivot { fill: var(--gold); }
.amo-ground { stroke: var(--dim); stroke-width: 1.4; }
.amo-l { fill: var(--amo-l); }
.amo-r { fill: var(--amo-r); }
.amo-n { font: 700 11px var(--mono); fill: var(--bg); text-anchor: middle; dominant-baseline: central; }
.amo-t { font: 700 10px var(--mono); fill: var(--dim); text-anchor: middle; }
.amo-big { font: 700 12px var(--mono); fill: var(--ink); }
.amo-u { font: 700 10px var(--mono); fill: var(--dim); }
.amo-tl { fill: var(--amo-l); }
.amo-tr { fill: var(--amo-r); }
.amo-gold { fill: var(--gold); }
.amo-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.amo-say > span { grid-area: 1 / 1; }
.amo-say b { color: var(--gold); }"""]
css.append('.amo-tip { %s animation: amo-tip %gs ease-in-out infinite; }' % (rot(DS[-1]), T))
css.append(kf('amo-tip', T, stations(rot)))
css.append('.amo-load { %s animation: amo-load %gs ease-in-out infinite; }' % (slide(DS[-1]), T))
css.append(kf('amo-load', T, stations(slide)))
reads = []
for k, d in enumerate(DS):
    off = AT[k + 1] - 0.45 if k + 1 < len(DS) else 11.5
    cw = 20 * d
    reads.append('    <text class="amo-big amo-tr amo-r%d" x="8" y="40">clockwise: 20 × %g = %g%s</text>' % (k, d, cw, ' ✓' if cw == 60 else ''))
    css.append('.amo-r%d { opacity: %d; animation: amo-r%d %gs linear infinite; }' % (k, 1 if k == len(DS) - 1 else 0, k, T))
    css.append(fade('amo-r%d' % k, T, AT[k] + 0.3, off, f=0.25))
css.append('.amo-bal { animation: amo-bal %gs linear infinite; }' % T)
css.append(fade('amo-bal', T, AT[-1] + 0.4, 11.5))
say_html, say_css = captions('amo', T, [
    (0, 3.4, '<b>Moment = force × perpendicular distance</b> from the pivot'),
    (3.4, AT[-1], 'Slide the 20 N load out: its clockwise moment grows'),
    (AT[-1], T, 'At 3 m: 20 × 3 = 30 × 2 — <b>the moments balance</b>')])
css += [say_css, still_block('amoment')]

ticks = ''.join('<line class="amo-tick" x1="%.1f" y1="%d" x2="%.1f" y2="%d"/><text class="amo-t" x="%.1f" y="%d">%d m</text>' % (PX + M * m, PY + 8, PX + M * m, PY + 13, PX + M * m, PY + 23, abs(m))
                for m in (-3, -2, -1, 1, 2, 3))
html = '''<div class="an-amoment" aria-hidden="true">
  <svg class="amo-svg" viewBox="0 0 300 196">
    <text class="amo-big amo-tl" x="8" y="22">anticlockwise: 30 × 2 = 60</text>
    <text class="amo-u" x="292" y="22" text-anchor="end">in N m</text>
%s
    <text class="amo-big amo-gold amo-bal" x="150" y="186" text-anchor="middle">balanced</text>
    <line class="amo-ground" x1="40" y1="%d" x2="260" y2="%d"/>
    <path class="amo-pivot" d="M%d %dl-16 26h32z"/>
    <g class="amo-tip amo-mv">
      <rect class="amo-plank" x="%d" y="%d" width="%d" height="8" rx="2"/>
      %s
      <rect class="amo-l" x="%d" y="%d" width="30" height="26" rx="2"/>
      <text class="amo-n" x="%d" y="%d">30 N</text>
      <g class="amo-load amo-mv">
        <rect class="amo-r" x="%d" y="%d" width="26" height="22" rx="2"/>
        <text class="amo-n" x="%d" y="%d">20 N</text>
      </g>
    </g>
  </svg>
  <div class="amo-say">
%s
  </div>
</div>''' % ('\n'.join(reads), PY + 34, PY + 34, PX, PY + 8, PX - M * 3.3, PY, M * 6.6, ticks,
             PX - 2 * M - 15, PY - 26, PX - 2 * M, PY - 13, PX - 13, PY - 22, PX, PY - 11, say_html)

anim_row.write_anim('amoment', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 18, 'title': 'Balancing moments',
                           'about': 'Moment|Equilibrium'})
