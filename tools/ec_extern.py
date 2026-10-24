# A negative externality, drawn: the market settles where demand meets the producer's own cost, MPC; then the external
# cost lifts MPC to MSC, the social optimum Q* appears to the left of the market's Qm, and the over-production between
# them is shaded as the welfare loss. The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it
# after any change. docs/history/425.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 13.0
OX, BASE = 34, 186
D0, D1 = (50, 40), (262, 170)             # demand = marginal social benefit
S0, S1 = (50, 172), (262, 62)             # MPC = the market's supply
LIFT = 38                                  # the external cost a unit, in px


def y_on(a, b, x): return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])


def cross(a, b, c, d):
    """Where segment-lines ab and cd meet."""
    ka, kc = (b[1] - a[1]) / (b[0] - a[0]), (d[1] - c[1]) / (d[0] - c[0])
    x = (c[1] - a[1] + ka * a[0] - kc * c[0]) / (ka - kc)
    return x, a[1] + ka * (x - a[0])


M0, M1 = (S0[0], S0[1] - LIFT), (S1[0], S1[1] - LIFT)
QM = cross(D0, D1, S0, S1)
QS = cross(D0, D1, M0, M1)
TOP = (QM[0], y_on(M0, M1, QM[0]))
GAPX = 238

css = [""".an-ecextern { --eext-msc: #e06666; --eext-loss: rgb(224 102 102 / .35); width: min(88vw, 22rem, 100%); text-align: center; }
.eext-svg { display: block; width: 100%; height: auto; }
.eext-ax { stroke: var(--dim); stroke-width: 1.2; fill: none; }
.eext-d { stroke: var(--gold); stroke-width: 2.5; stroke-linecap: round; fill: none; }
.eext-s { stroke: #6fa8dc; stroke-width: 2.5; stroke-linecap: round; fill: none; }
.eext-m { stroke: var(--eext-msc); stroke-width: 2.5; stroke-linecap: round; fill: none; }
.eext-loss { fill: var(--eext-loss); stroke: var(--eext-msc); stroke-width: 1; }
.eext-gd { stroke: var(--dim); stroke-width: 1; stroke-dasharray: 3 3; fill: none; }
.eext-gap { stroke: var(--eext-msc); stroke-width: 1.5; fill: none; }
.eext-t { font: 700 10px var(--mono); fill: var(--dim); }
.eext-lab { font: 700 11px var(--mono); }
.eext-ld { fill: var(--gold); }
.eext-ls { fill: #6fa8dc; }
.eext-lm { fill: var(--eext-msc); }
.eext-dot { fill: var(--ink); }
.eext-mv { transform-box: view-box; transform-origin: 0 0; }
.eext-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.eext-say > span { grid-area: 1 / 1; }
.eext-say b { color: var(--gold); }"""]

LIFT_AT = (3.2, 4.8)
css.append('.eext-up { transform: translateY(-%dpx); opacity: 1; animation: eext-up %gs ease-in-out infinite; }' % (LIFT, T))
css.append(kf('eext-up', T, [(0, 'transform: translateY(0); opacity: 0;'), (LIFT_AT[0] - 0.3, 'transform: translateY(0); opacity: 0;'),
                             (LIFT_AT[0], 'transform: translateY(0); opacity: 1;'), (LIFT_AT[1], 'transform: translateY(-%dpx); opacity: 1;' % LIFT),
                             (12.4, 'transform: translateY(-%dpx); opacity: 1;' % LIFT), (12.8, 'transform: translateY(-%dpx); opacity: 0;' % LIFT)]))
for cls, on in (('eext-qm', 1.0), ('eext-gp', 4.9), ('eext-qs', 6.0), ('eext-wl', 8.0)):
    css.append('.%s { opacity: 1; animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(fade(cls, T, on, 12.4))

say_html, say_css = captions('eext', T, [
    (0, 3.2, 'The market makes <b>Qm</b>, where demand meets the firm\'s own cost, MPC'),
    (3.2, 6.0, 'Add the pollution others pay for: <b>MSC = MPC + external cost</b>'),
    (6.0, 8.0, 'Society\'s best output <b>Q*</b> is where demand meets MSC'),
    (8.0, T, 'Qm is more than Q*: over-production, a <b>welfare loss</b>. A tax can close it')], end=12.4)
css += [say_css, still_block('ecextern')]

html = '''<div class="an-ecextern" aria-hidden="true">
  <svg class="eext-svg" viewBox="0 0 300 212">
    <path class="eext-loss eext-wl" d="M%.1f %.1fL%.1f %.1fL%.1f %.1fZ"/>
    <path class="eext-s" d="M%d %dL%d %d"/>
    <text class="eext-lab eext-ls" x="%d" y="%d">MPC</text>
    <g class="eext-up eext-mv">
      <path class="eext-m" d="M%d %dL%d %d"/>
      <text class="eext-lab eext-lm" x="%d" y="%d">MSC</text>
    </g>
    <path class="eext-d" d="M%d %dL%d %d"/>
    <text class="eext-lab eext-ld" x="%d" y="%d">D</text>
    <g class="eext-qm">
      <path class="eext-gd" d="M%.1f %.1fV%d"/>
      <circle class="eext-dot" cx="%.1f" cy="%.1f" r="3.5"/>
      <text class="eext-lab eext-ls" x="%.1f" y="%d" text-anchor="middle">Qm</text>
    </g>
    <g class="eext-gp">
      <path class="eext-gap" d="M%d %.1fV%.1fM%d %.1fh6M%d %.1fh6"/>
      <text class="eext-t" x="%d" y="%.1f" text-anchor="end">external</text>
      <text class="eext-t" x="%d" y="%.1f" text-anchor="end">cost</text>
    </g>
    <g class="eext-qs">
      <path class="eext-gd" d="M%.1f %.1fV%d"/>
      <circle class="eext-dot" cx="%.1f" cy="%.1f" r="3.5"/>
      <text class="eext-lab eext-lm" x="%.1f" y="%d" text-anchor="middle">Q*</text>
    </g>
    <path class="eext-ax" d="M%d 14V%dH294"/>
    <text class="eext-t" x="2" y="10">Costs, benefits</text>
    <text class="eext-t" x="294" y="208" text-anchor="end">Output</text>
  </svg>
  <div class="eext-say">
%s
  </div>
</div>''' % (QS[0], QS[1], TOP[0], TOP[1], QM[0], QM[1],
             S0[0], S0[1], S1[0], S1[1], S1[0] + 4, S1[1] + 4,
             S0[0], S0[1], S1[0], S1[1], S1[0] + 4, S1[1] + 4,
             D0[0], D0[1], D1[0], D1[1], D1[0] + 3, D1[1] + 4,
             QM[0], QM[1], BASE, QM[0], QM[1], QM[0], BASE + 13,
             GAPX, y_on(S0, S1, GAPX), y_on(M0, M1, GAPX), GAPX - 3, y_on(S0, S1, GAPX), GAPX - 3, y_on(M0, M1, GAPX),
             GAPX - 4, y_on(S0, S1, GAPX) - LIFT / 2 + 9, GAPX - 4, y_on(S0, S1, GAPX) - LIFT / 2 + 19,
             QS[0], QS[1], BASE, QS[0], QS[1], QS[0], BASE + 13,
             OX, BASE, say_html)

anim_row.write_anim('ecextern', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-GCSE-ECON', 'chapter': 4, 'title': 'A negative externality',
                           'about': 'Negative externality|Marginal private cost (MPC)|Marginal social cost (MSC)'})
