# Plato's cave (Republic VII): prisoners watch shadows on the wall; one is freed, turns to see the fire and the
# objects that cast them, and climbs out to the sun, which stands for the Form of the Good.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/418.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, captions, still_block

T = 16.0
END = T - 0.6
css = [""".an-pcave { width: min(92vw, 23rem, 100%); }
.pcv-svg { display: block; width: 100%; height: auto; }
.pcv-rock { fill: none; stroke: rgb(244 241 232 / .4); stroke-width: 1.4; stroke-linejoin: round; }
.pcv-wall { fill: rgb(240 180 95 / .26); }
.pcv-sh { fill: rgb(0 0 0 / .85); }
.pcv-shs { animation: pcv-shs 4s linear infinite; }
.pcv-fig { fill: none; stroke: var(--dim); stroke-width: 1.5; stroke-linecap: round; }
.pcv-head { fill: var(--dim); stroke: none; }
.pcv-chain { stroke: var(--faint); stroke-width: 1; stroke-dasharray: 1.5 1.5; fill: none; }
.pcv-me { stroke: var(--gold); }
.pcv-mehead { fill: var(--gold); }
.pcv-low { fill: rgb(244 241 232 / .12); stroke: var(--line); stroke-width: 1; }
.pcv-obj { fill: var(--ink); opacity: .75; }
.pcv-fire { fill: #e8862c; transform-box: fill-box; transform-origin: 50% 100%; animation: pcv-fl .5s ease-in-out infinite alternate; }
.pcv-fire2 { fill: #ffd27a; transform-box: fill-box; transform-origin: 50% 100%; animation: pcv-fl .37s ease-in-out infinite alternate; }
.pcv-sky { fill: rgb(111 168 220 / .14); }
.pcv-sun { fill: #ffd27a; }
.pcv-rays { stroke: #ffd27a; stroke-width: 1.4; stroke-linecap: round; transform-box: fill-box; transform-origin: center; }
.pcv-say { display: grid; margin-top: .55rem; font: 600 .82rem/1.4 var(--mono); color: var(--ink); text-align: center; }
.pcv-say > span { grid-area: 1 / 1; }
.pcv-say b { color: var(--gold); }
@keyframes pcv-shs { from { transform: translateX(-34px); } to { transform: translateX(58px); } }
@keyframes pcv-fl { from { transform: scale(1, .82); } to { transform: scale(1.08, 1.06); } }"""]

# the freed prisoner: turns round at 5 s, walks past the fire, up the passage and out
css.append('.pcv-go { transform: translate(104px, -70px); animation: pcv-go %gs ease-in-out infinite; }' % T)
css.append(kf('pcv-go', T, [(5.8, 'transform: none;'), (7.6, 'transform: translate(52px, 0);'), (10.2, 'transform: translate(98px, -70px);'),
                            (11.2, 'transform: translate(104px, -70px);'), (END, 'transform: translate(104px, -70px);'), (END + .4, 'transform: none;')]))
css.append('.pcv-turn { transform-box: fill-box; transform-origin: center; transform: scaleX(-1); animation: pcv-turn %gs ease-in-out infinite; }' % T)
css.append(kf('pcv-turn', T, [(4.6, 'transform: none;'), (5.4, 'transform: scaleX(-1);'), (END, 'transform: scaleX(-1);'), (END + .4, 'transform: none;')]))
# the sun is faint from inside the cave and blazes when he reaches it
css.append('.pcv-sunall { animation: pcv-sunall %gs ease-in-out infinite; }' % T)
css.append(kf('pcv-sunall', T, [(9.4, 'opacity: .25;'), (11.4, 'opacity: 1;'), (END, 'opacity: 1;'), (END + .4, 'opacity: .25;')]))
css.append('.pcv-rays { animation: pcv-rays %gs ease-out infinite; }' % T)
css.append(kf('pcv-rays', T, [(10.6, 'transform: scale(.4); opacity: 0;'), (11.6, 'transform: scale(1.25); opacity: 1;'), (12.6, 'transform: none; opacity: 1;'),
                              (END, 'transform: none; opacity: 1;'), (END + .4, 'transform: scale(.4); opacity: 0;')]))

say, say_css = captions('pcv', T, [
    (0, 5.0, 'Chained since birth, the prisoners see only shadows, and take them for the real things'),
    (5.0, 8.8, 'One is freed and turns: the fire and the carried objects were casting the shadows'),
    (8.8, T, 'He climbs out, dazzled, and sees the sun: for Plato, the <b>Form of the Good</b>'),
], end=END)
css.append(say_css)
css.append(still_block('pcave'))


def figure(x, me=False):
    f, h = ('pcv-fig pcv-me', 'pcv-head pcv-mehead') if me else ('pcv-fig', 'pcv-head')
    # standing, facing left: the arm reaches toward the wall
    return ('<path class="%s" d="M%d 112v-9M%d 112l-3 6M%d 112l3 6M%d 106l-4 3"/><circle class="%s" cx="%d" cy="99" r="3"/>'
            % (f, x, x, x, x, h, x))


prisoners = '\n    '.join(figure(x) + '<path class="pcv-chain" d="M%d 118h6"/>' % x for x in (66, 78, 90))
html = '''<div class="an-pcave" aria-hidden="true">
  <svg class="pcv-svg" viewBox="0 0 240 140">
    <defs><clipPath id="pcv-clip"><rect x="10" y="30" width="44" height="82"/></clipPath></defs>
    <path class="pcv-sky" d="M184 4H240V48H198Z"/>
    <g class="pcv-sunall">
      <g class="pcv-rays"><path d="M222 6v-4M222 30v4M210 18h-4M234 18h4M213 9l-3-3M231 27l3 3M231 9l3-3M213 27l-3 3"/></g>
      <circle class="pcv-sun" cx="222" cy="18" r="7"/>
    </g>
    <path class="pcv-rock" d="M0 18H174L186 4M0 118H150L198 48H240"/>
    <rect class="pcv-wall" x="10" y="30" width="44" height="82"/>
    <g clip-path="url(#pcv-clip)">
      <g class="pcv-shs">
        <path class="pcv-sh" d="M6 52q9-12 18 0q9-12 18 0l-18 9Z"/>
        <path class="pcv-sh" d="M-30 104q-8-15 5-24h-5v-6h18v6h-5q13 9 5 24Z"/>
        <path class="pcv-sh" d="M-64 70l12-9 15 3 9-6 3 15-12 12h-18Z"/>
      </g>
    </g>
    %s
    <rect class="pcv-low" x="106" y="104" width="22" height="14"/>
    <path class="pcv-obj" d="M110 98q3-5 6 0q3-5 6 0l-6 3Z"/>
    <path class="pcv-obj" d="M118 104q-3-6 2-9h-2v-2h6v2h-2q5 3 2 9Z"/>
    <path class="pcv-fire" d="M134 118q-5-6 0-14q1 5 4 6q2-6 0-10q8 7 3 18Z"/>
    <path class="pcv-fire2" d="M137 118q-2-4 1-7q2 3 2 7Z"/>
    <g class="pcv-go"><g class="pcv-turn">%s</g></g>
  </svg>
  <div class="pcv-say">
%s
  </div>
</div>''' % (prisoners, figure(100, True), say)

anim_row.write_anim('pcave', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-PHIL', 'chapter': 6, 'title': "Plato's cave",
                           'about': "Theory of Forms|Plato's cave"})
