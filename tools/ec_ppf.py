# The production possibility frontier, drawn: a point slides along the curve from A to B and the wheat given up for the
# extra barley is marked — the opportunity cost; then a point inside (unused resources) and one outside (out of reach),
# and the whole frontier shifts outwards with growth. The whole row is this script's output (tools/anim_row.py,
# `whole=`); re-run it after any change. docs/history/425.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 15.0
OX, BASE, RX, RY = 40, 182, 214, 150      # the corner, and the frontier's two half-axes (a quarter ellipse)
TA, TB = 0.62, 1.02                       # A and B, as angles round the ellipse
GROW = 1.16


def at(t): return OX + RX * math.sin(t), BASE - RY * math.cos(t)


AX, AY = at(TA)
BX, BY = at(TB)
curve = 'M%d %d' % (OX, BASE - RY) + ''.join(' L%.1f %.1f' % at(math.pi / 2 * k / 24) for k in range(1, 25))

css = [""".an-ecppf { --eppf-cut: #e06666; width: min(88vw, 22rem, 100%); text-align: center; }
.eppf-svg { display: block; width: 100%; height: auto; }
.eppf-ax { stroke: var(--dim); stroke-width: 1.2; fill: none; }
.eppf-curve { stroke: #6fa8dc; stroke-width: 2.5; fill: none; }
.eppf-ghost { stroke: var(--faint); stroke-width: 1.5; stroke-dasharray: 3 3; fill: none; }
.eppf-t { font: 700 10px var(--mono); fill: var(--dim); }
.eppf-pt { fill: var(--ink); }
.eppf-lab { font: 700 11px var(--mono); fill: var(--ink); }
.eppf-dot { fill: var(--gold); }
.eppf-cutl { stroke: var(--eppf-cut); stroke-width: 2.5; fill: none; }
.eppf-gain { stroke: var(--gold); stroke-width: 2.5; fill: none; }
.eppf-ct { font: 700 10px var(--mono); fill: var(--eppf-cut); }
.eppf-gt { font: 700 10px var(--mono); fill: var(--gold); }
.eppf-in { fill: var(--dim); }
.eppf-out { fill: none; stroke: var(--eppf-cut); stroke-width: 1.5; }
.eppf-mv { transform-box: view-box; transform-origin: 0 0; }
.eppf-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.eppf-say > span { grid-area: 1 / 1; }
.eppf-say b { color: var(--gold); }"""]
css.insert(1, '.eppf-grow { transform-box: view-box; transform-origin: %dpx %dpx; }' % (OX, BASE))

# the dot: at A, along the curve to B (2–4 s), held, back to A at the end
path_stops = [(0, 'transform: translate(%.1fpx, %.1fpx);' % (AX, AY)), (1.6, 'transform: translate(%.1fpx, %.1fpx);' % (AX, AY))]
for k in range(1, 9):
    path_stops.append((1.6 + 2.0 * k / 8, 'transform: translate(%.1fpx, %.1fpx);' % at(TA + (TB - TA) * k / 8)))
path_stops += [(14.4, 'transform: translate(%.1fpx, %.1fpx);' % (BX, BY)), (14.9, 'transform: translate(%.1fpx, %.1fpx);' % (AX, AY))]
css.append('.eppf-m { transform: translate(%.1fpx, %.1fpx); animation: eppf-m %gs linear infinite; }' % (BX, BY, T))
css.append(kf('eppf-m', T, path_stops))
css.append('.eppf-oc { opacity: 1; animation: eppf-oc %gs linear infinite; }' % T)
css.append(fade('eppf-oc', T, 4.0, 7.4))
css.append('.eppf-io { opacity: 1; animation: eppf-io %gs linear infinite; }' % T)
css.append(fade('eppf-io', T, 7.8, 10.6))
css.append('.eppf-g { transform: scale(%g); animation: eppf-g %gs ease-in-out infinite; }' % (GROW, T))
css.append(kf('eppf-g', T, [(0, 'transform: scale(1);'), (10.8, 'transform: scale(1);'), (12.2, 'transform: scale(%g);' % GROW),
                            (14.4, 'transform: scale(%g);' % GROW), (14.9, 'transform: scale(1);')]))
css.append('.eppf-gh { opacity: 1; animation: eppf-gh %gs linear infinite; }' % T)
css.append(fade('eppf-gh', T, 10.8, 14.4))

say_html, say_css = captions('eppf', T, [
    (0, 4.0, 'A to B: <b>more barley means less wheat</b> — every point uses all resources'),
    (4.0, 7.4, '<b>Opportunity cost</b>: the wheat given up for the extra barley'),
    (7.4, 10.8, 'Inside: resources unemployed. Outside: out of reach — for now'),
    (10.8, T, 'More workers or better technology: <b>the PPF shifts out</b>')], end=14.4)
css += [say_css, still_block('ecppf')]

IX, IY = OX + 70, BASE - 50
QX, QY = OX + 175, BASE - 118           # outside the frontier, inside it once grown
html = '''<div class="an-ecppf" aria-hidden="true">
  <svg class="eppf-svg" viewBox="0 0 300 210">
    <path class="eppf-ghost eppf-gh" d="%s"/>
    <path class="eppf-curve eppf-g eppf-grow" d="%s"/>
    <circle class="eppf-pt" cx="%.1f" cy="%.1f" r="3"/>
    <text class="eppf-lab" x="%.1f" y="%.1f">A</text>
    <circle class="eppf-pt" cx="%.1f" cy="%.1f" r="3"/>
    <text class="eppf-lab" x="%.1f" y="%.1f">B</text>
    <g class="eppf-oc">
      <path class="eppf-cutl" d="M%.1f %.1fV%.1f"/>
      <text class="eppf-ct" x="%.1f" y="%.1f" text-anchor="end">wheat lost</text>
      <path class="eppf-gain" d="M%.1f %.1fH%.1f"/>
      <text class="eppf-gt" x="%.1f" y="%.1f" text-anchor="middle">barley gained</text>
    </g>
    <g class="eppf-io">
      <circle class="eppf-in" cx="%d" cy="%d" r="4"/>
      <text class="eppf-t" x="%d" y="%d">unused</text>
      <circle class="eppf-out" cx="%d" cy="%d" r="4"/>
      <text class="eppf-ct" x="%d" y="%d">unreachable</text>
    </g>
    <g class="eppf-m eppf-mv">
      <circle class="eppf-dot" r="5"/>
    </g>
    <path class="eppf-ax" d="M%d 14V%dH294"/>
    <text class="eppf-t" x="%d" y="10">Wheat</text>
    <text class="eppf-t" x="294" y="200" text-anchor="end">Barley</text>
  </svg>
  <div class="eppf-say">
%s
  </div>
</div>''' % (curve, curve, AX, AY, AX + 6, AY - 6, BX, BY, BX + 7, BY - 3,
             AX, AY, BY, AX - 4, (AY + BY) / 2 + 3, AX, BY, BX, (AX + BX) / 2, BY + 14,
             IX, IY, IX + 7, IY + 4, QX, QY, QX + 7, QY + 4,
             OX, BASE, OX - 30, say_html)

anim_row.write_anim('ecppf', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-GCSE-ECON', 'chapter': 1, 'title': 'The production possibility frontier',
                           'about': 'Production possibility frontier (PPF)|Opportunity cost'})
