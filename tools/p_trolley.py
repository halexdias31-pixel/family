# The trolley problem: one scene, two verdicts. The utilitarian branch switches (one death is fewer than five); the
# Kantian branch refuses to kill the one, who would be used merely as a means. Nobody is shown being hit.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/418.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, captions, still_block

T = 18.0
END = T - 0.6
css = [""".an-ptrolley { --ptr-k: #6fa8dc; width: min(92vw, 23rem, 100%); }
.ptr-svg { display: block; width: 100%; height: auto; }
.ptr-rail { fill: none; stroke: var(--dim); stroke-width: 1.6; stroke-linecap: round; }
.ptr-sleep { fill: none; stroke: var(--line); stroke-width: 1; }
.ptr-hiu { fill: none; stroke: var(--gold); stroke-width: 3.2; stroke-linecap: round; opacity: .75; }
.ptr-hik { fill: none; stroke: var(--ptr-k); stroke-width: 3.2; stroke-linecap: round; opacity: .75; }
.ptr-car { fill: var(--coral); }
.ptr-wheel { fill: var(--ink); }
.ptr-ghost { fill: none; stroke: var(--gold); stroke-width: 1.2; stroke-dasharray: 2 1.5; }
.ptr-fig { fill: none; stroke: var(--ink); stroke-width: 1.3; stroke-linecap: round; }
.ptr-head { fill: var(--ink); }
.ptr-lever { stroke: var(--ink); stroke-width: 1.8; stroke-linecap: round; transform-origin: 84px 86px; }
.ptr-base { fill: var(--dim); }
.ptr-tag { font: 600 7px var(--mono); fill: var(--ink); }
.ptr-tag tspan { font-weight: 800; }
.ptr-tu { fill: var(--gold); }
.ptr-tk { fill: var(--ptr-k); }
.ptr-say { display: grid; margin-top: .55rem; font: 600 .82rem/1.4 var(--mono); color: var(--ink); text-align: center; }
.ptr-say > span { grid-area: 1 / 1; }
.ptr-say b { color: var(--gold); }
.ptr-say i { font-style: normal; color: var(--ptr-k); }"""]


def show(cls, at, d=0.5, fro='opacity: 0;', to='opacity: 1;', last=None, base=None):
    last = END if last is None else last
    css.append('.%s { animation: %s %gs ease-out infinite; }' % (cls, cls, T))
    css.append(kf(cls, T, [(at, fro), (at + d, to), (last, to), (last + .4, fro)]))


css.append('.ptr-cargo { transform: translateX(56px); animation: ptr-cargo %gs ease-out infinite; }' % T)
css.append(kf('ptr-cargo', T, [(0.3, 'transform: none;'), (3.4, 'transform: translateX(56px);'), (END, 'transform: translateX(56px);'), (END + .4, 'transform: none;')]))
css.append('.ptr-lever { transform: rotate(0deg); animation: ptr-lever %gs ease-in-out infinite; }' % T)
css.append(kf('ptr-lever', T, [(4.2, 'transform: rotate(0deg);'), (4.8, 'transform: rotate(-35deg);'), (8.2, 'transform: rotate(-35deg);'),
                               (8.8, 'transform: rotate(0deg);')]))
show('ptr-hiu', 4.6, to='opacity: .75;')
show('ptr-tu', 5.6)
css.append('.ptr-ghost { opacity: 0; animation: ptr-ghost %gs ease-in-out infinite; }' % T)
css.append(kf('ptr-ghost', T, [(4.9, 'opacity: 0; transform: none;'), (5.2, 'opacity: 1; transform: none;'), (5.7, 'opacity: 1; transform: translate(19.4px, -5.7px);'), (6.2, 'opacity: 1; transform: translate(35px, -18.2px);'), (6.7, 'opacity: 1; transform: translate(50.6px, -31.2px);'), (7.2, 'opacity: 0; transform: translate(70px, -38px);')]))
show('ptr-hik', 8.8, to='opacity: .75;')
show('ptr-tk', 9.8)

say, say_css = captions('ptr', T, [
    (0, 4.0, 'A runaway trolley will kill five. A lever would send it onto a track with one person'),
    (4.0, 8.6, 'A <b>utilitarian</b> counts outcomes: switch, since one death is fewer than five'),
    (8.6, 13.0, 'A <i>Kantian</i> asks what you may do to a person: killing the one uses him merely as a means'),
    (13.0, T, 'Same facts, two verdicts. Make it pushing a man off a bridge, and most people refuse'),
], end=END)
css.append(say_css)
css.append(still_block('ptrolley'))


def fig(x, y):
    return '<path class="ptr-fig" d="M%g %gv-5M%g %gl-2 3M%g %gl2 3M%g %gl-2.5 2M%g %gl2.5 2"/><circle class="ptr-head" cx="%g" cy="%g" r="2"/>' % (
        x, y - 3, x, y - 3, x, y - 3, x, y - 6.5, x, y - 6.5, x, y - 10)


sleepers = ''.join('M%d 67v6' % x for x in range(10, 236, 9))
five = ''.join(fig(x, 70) for x in (194, 203, 212, 221, 230))
html = '''<div class="an-ptrolley" aria-hidden="true">
  <svg class="ptr-svg" viewBox="0 0 240 112">
    <path class="ptr-sleep" d="%s"/>
    <path class="ptr-hiu" d="M90 70C120 70 130 34 160 32H236"/>
    <path class="ptr-hik" d="M90 70H236"/>
    <path class="ptr-rail" d="M4 70H236M90 70C120 70 130 34 160 32H236"/>
    %s
    %s
    <rect class="ptr-base" x="80" y="86" width="8" height="3" rx="1"/>
    <path class="ptr-lever" d="M84 86V76"/>
    <g class="ptr-ghost"><rect x="79" y="60" width="22" height="10" rx="2"/></g>
    <g class="ptr-cargo">
      <rect class="ptr-car" x="10" y="58" width="22" height="10" rx="2"/>
      <circle class="ptr-wheel" cx="15" cy="69" r="2"/><circle class="ptr-wheel" cx="27" cy="69" r="2"/>
    </g>
    <text class="ptr-tag ptr-tu" x="6" y="16"><tspan>UTILITARIAN</tspan></text>
    <text class="ptr-tag ptr-tu" x="6" y="26">switch: 1 is fewer than 5</text>
    <text class="ptr-tag ptr-tk" x="100" y="92"><tspan>KANTIAN</tspan></text>
    <text class="ptr-tag ptr-tk" x="100" y="102">don't kill: never merely a means</text>
  </svg>
  <div class="ptr-say">
%s
  </div>
</div>''' % (sleepers, five, fig(214, 32), say)

anim_row.write_anim('ptrolley', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-PHIL', 'chapter': 4, 'title': 'The trolley problem',
                           'about': 'Trolley problem|Categorical imperative'})
