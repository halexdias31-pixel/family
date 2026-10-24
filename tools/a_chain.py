# The chain rule, drawn: a nudge δx on the x line, stretched ×3 on its way to the u line (u = 3x + 1) and ×8 on its
# way to the y line (y = u², dy/du = 2u = 8 at u = 4) — so dy/dx = 8 × 3 = 24 at x = 1.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
LX, LU, LY = 40, 104, 168            # the three lines
X0, W0 = 40, 8                       # every nudge starts at the same place; δx is 8 wide
SU, SY = 3, 8                        # du/dx and dy/du at x = 1


def bar(y, w): return 'transform: translate(%dpx, %dpx) scaleX(%g);' % (X0, y - 7, w)


css = [""".an-achain { --ach-x: #6fd8c4; --ach-u: #6fa8dc; --ach-y: var(--coral); width: min(88vw, 22rem, 100%); text-align: center; }
.ach-svg { display: block; width: 100%; height: auto; }
.ach-line { stroke: var(--dim); stroke-width: 1.2; }
.ach-t { font: 700 12px var(--mono); fill: var(--dim); }
.ach-name { font: 700 13px var(--mono); fill: var(--ink); }
.ach-mv { transform-box: view-box; transform-origin: 0 0; }
.ach-bx { fill: var(--ach-x); }
.ach-bu { fill: var(--ach-u); }
.ach-by { fill: var(--ach-y); }
.ach-k { font: 700 13px var(--mono); }
.ach-kx { fill: var(--ach-x); }
.ach-ku { fill: var(--ach-u); }
.ach-ky { fill: var(--ach-y); }
.ach-tot { fill: var(--gold); }
.ach-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.ach-say > span { grid-area: 1 / 1; }
.ach-say b { color: var(--gold); }"""]
# δx: pulses in; the u nudge drops from the x line and stretches ×3; the y nudge drops from the u line and stretches ×8
css.append('.ach-bx { transform: translate(%dpx, %dpx) scaleX(%d); animation: ach-bx %gs linear infinite; }' % (X0, LX - 7, W0, T))
css.append(kf('ach-bx', T, [(0.3, 'opacity: 0;'), (0.8, 'opacity: 1;'), (11.4, 'opacity: 1;'), (11.8, 'opacity: 0;')]))
css.append('.ach-bu { %s animation: ach-bu %gs ease-in-out infinite; }' % (bar(LU, W0 * SU), T))
css.append(kf('ach-bu', T, [(1.6, 'opacity: 0; ' + bar(LX, W0)), (1.8, 'opacity: 1; ' + bar(LX, W0)), (2.5, 'opacity: 1; ' + bar(LU, W0)),
                            (3.6, 'opacity: 1; ' + bar(LU, W0 * SU)), (11.4, 'opacity: 1; ' + bar(LU, W0 * SU)), (11.8, 'opacity: 0; ' + bar(LU, W0 * SU))]))
css.append('.ach-by { %s animation: ach-by %gs ease-in-out infinite; }' % (bar(LY, W0 * SU * SY), T))
css.append(kf('ach-by', T, [(4.6, 'opacity: 0; ' + bar(LU, W0 * SU)), (4.8, 'opacity: 1; ' + bar(LU, W0 * SU)), (5.5, 'opacity: 1; ' + bar(LY, W0 * SU)),
                            (7.0, 'opacity: 1; ' + bar(LY, W0 * SU * SY)), (11.4, 'opacity: 1; ' + bar(LY, W0 * SU * SY)), (11.8, 'opacity: 0; ' + bar(LY, W0 * SU * SY))]))
for cls, on in [('ach-ku', 3.4), ('ach-ky', 6.8), ('ach-tot', 8.4)]:
    css.append('.%s { animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(fade(cls, T, on, 11.5))
say_html, say_css = captions('ach', T, [
    (0, 1.6, 'Nudge x by δx…'),
    (1.6, 4.6, 'u = 3x + 1 stretches it ×3: du/dx = 3'),
    (4.6, 8.4, 'y = u² stretches that ×2u = ×8: dy/du = 8'),
    (8.4, T, 'Chain rule: <b>dy/dx = dy/du × du/dx = 8 × 3 = 24</b>')])
css += [say_css, still_block('achain')]

html = '''<div class="an-achain" aria-hidden="true">
  <svg class="ach-svg" viewBox="0 0 300 200">
    <text class="ach-name" x="290" y="%d" text-anchor="end">x = 1</text>
    <line class="ach-line" x1="30" y1="%d" x2="290" y2="%d"/>
    <rect class="ach-bx ach-mv" x="0" y="0" width="1" height="14"/>
    <text class="ach-k ach-kx" x="%d" y="%d">δx</text>
    <text class="ach-name" x="290" y="%d" text-anchor="end">u = 3x + 1 = 4</text>
    <line class="ach-line" x1="30" y1="%d" x2="290" y2="%d"/>
    <rect class="ach-bu ach-mv" x="0" y="0" width="1" height="14"/>
    <text class="ach-k ach-ku" x="%d" y="%d">δu = 3 δx</text>
    <text class="ach-name" x="290" y="%d" text-anchor="end">y = u² = 16</text>
    <line class="ach-line" x1="30" y1="%d" x2="290" y2="%d"/>
    <rect class="ach-by ach-mv" x="0" y="0" width="1" height="14"/>
    <text class="ach-k ach-ky" x="%d" y="%d">δy = 8 δu = <tspan class="ach-tot">24 δx</tspan></text>
  </svg>
  <div class="ach-say">
%s
  </div>
</div>''' % (LX - 14, LX + 7, LX + 7, X0, LX - 14,
             LU - 14, LU + 7, LU + 7, X0, LU - 14,
             LY - 14, LY + 7, LY + 7, X0, LY - 14, say_html)

anim_row.write_anim('achain', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 8, 'title': 'The chain rule',
                           'about': 'Chain rule'})
