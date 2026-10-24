# Two syllogisms tested by drawing them as circles: dogs inside mammals inside animals is forced (valid); cats and dogs
# both inside mammals leaves dogs free to sit inside cats or outside, so "all dogs are cats" is not forced (invalid).
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/418.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, captions, still_block

T = 16.0
END = T - 0.6
css = [""".an-psyll { --psy-a: #6fa8dc; --psy-m: #b48ee8; width: min(92vw, 23rem, 100%); }
.psy-svg { display: block; width: 100%; height: auto; }
.psy-c { fill: none; stroke-width: 1.6; stroke-dasharray: 100; }
.psy-ca { stroke: var(--psy-a); }
.psy-cm { stroke: var(--psy-m); }
.psy-cc { stroke: var(--ink); }
.psy-cd { stroke: var(--gold); fill: rgb(240 180 95 / .12); }
.psy-cg { fill: none; stroke: var(--gold); stroke-width: 1.2; stroke-dasharray: 3 2.5; }
.psy-t { font: 700 9px var(--mono); text-anchor: middle; stroke: var(--bg, #000); stroke-width: 3px; paint-order: stroke; stroke-linejoin: round; }
.psy-ta { fill: var(--psy-a); }
.psy-tm { fill: var(--psy-m); }
.psy-tc { fill: var(--ink); }
.psy-td { fill: var(--gold); }
.psy-q { fill: var(--gold); font-size: 12px; }
.psy-v { font: 800 10px var(--mono); text-anchor: middle; letter-spacing: .06em; }
.psy-ok { fill: var(--good); }
.psy-no { fill: var(--coral); }
.psy-say { display: grid; margin-top: .55rem; font: 600 .82rem/1.4 var(--mono); color: var(--ink); text-align: center; }
.psy-say > span { grid-area: 1 / 1; }
.psy-say b { color: var(--gold); }"""]


def draw(cls, at, d=0.9):
    """A circle drawn round from nothing at `at` seconds, held, and gone just before the loop restarts."""
    css.append('.%s { animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(kf(cls, T, [(at, 'stroke-dashoffset: 100; opacity: 0;'), (at + d, 'stroke-dashoffset: 0; opacity: 1;'),
                           (END, 'stroke-dashoffset: 0; opacity: 1;'), (END + .4, 'stroke-dashoffset: 0; opacity: 0;')]))


def show(cls, at, d=0.4, last=None):
    last = END if last is None else last
    css.append('.%s { animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(kf(cls, T, [(at, 'opacity: 0;'), (at + d, 'opacity: 1;'), (last, 'opacity: 1;'), (last + .4, 'opacity: 0;')]))


draw('psy-l1', 0.4); show('psy-l1t', 0.8)
draw('psy-l2', 1.4); show('psy-l2t', 1.8)
draw('psy-l3', 2.4); show('psy-l3t', 2.8)
show('psy-lv', 3.8)
draw('psy-r1', 6.4); show('psy-r1t', 6.8)
draw('psy-r2', 7.4); show('psy-r2t', 7.8)
draw('psy-r3', 8.4); show('psy-r3t', 8.8)
show('psy-rv', 13.0)
# the dogs slide into cats and back out: both pictures fit the premises
css.append('.psy-dogs { animation: psy-dogs %gs ease-in-out infinite; }' % T)
css.append(kf('psy-dogs', T, [(9.6, 'transform: none;'), (10.6, 'transform: translateX(-22px);'), (11.6, 'transform: translateX(-22px);'), (12.6, 'transform: none;')]))
css.append('.psy-ghost { opacity: 0; animation: psy-ghost %gs linear infinite; }' % T)
css.append(kf('psy-ghost', T, [(9.5, 'opacity: 0;'), (9.8, 'opacity: 1;'), (12.5, 'opacity: 1;'), (12.8, 'opacity: 0;')]))
css.append('.psy-q { opacity: 0; animation: psy-q %gs linear infinite; }' % T)
css.append(kf('psy-q', T, [(10.4, 'opacity: 0;'), (10.7, 'opacity: 1;'), (11.5, 'opacity: 1;'), (11.8, 'opacity: 0;')]))

say, say_css = captions('psy', T, [
    (0, 6.0, 'All dogs are mammals, all mammals are animals: dogs <b>must</b> sit inside animals. Valid'),
    (6.0, 9.4, 'All cats are mammals, all dogs are mammals… so all dogs are cats?'),
    (9.4, T, 'Dogs can sit inside cats <b>or</b> outside them: the conclusion is not forced. Invalid'),
], end=END)
css.append(say_css)
css.append(still_block('psyll'))

html = '''<div class="an-psyll" aria-hidden="true">
  <svg class="psy-svg" viewBox="0 0 240 138">
    <circle class="psy-c psy-ca psy-l1" cx="60" cy="66" r="50" pathLength="100"/>
    <text class="psy-t psy-ta psy-l1t" x="60" y="30">animals</text>
    <circle class="psy-c psy-cm psy-l2" cx="60" cy="78" r="33" pathLength="100"/>
    <text class="psy-t psy-tm psy-l2t" x="60" y="58">mammals</text>
    <circle class="psy-c psy-cd psy-l3" cx="60" cy="90" r="16" pathLength="100"/>
    <text class="psy-t psy-td psy-l3t" x="60" y="93">dogs</text>
    <text class="psy-v psy-ok psy-lv" x="60" y="133">VALID ✓</text>
    <circle class="psy-c psy-cm psy-r1" cx="180" cy="66" r="50" pathLength="100"/>
    <text class="psy-t psy-tm psy-r1t" x="180" y="30">mammals</text>
    <circle class="psy-c psy-cc psy-r2" cx="160" cy="74" r="19" pathLength="100"/>
    <text class="psy-t psy-tc psy-r2t" x="153" y="77">cats</text>
    <circle class="psy-cg psy-ghost" cx="201" cy="74" r="19"/>
    <g class="psy-dogs">
      <circle class="psy-c psy-cd psy-r3" cx="201" cy="74" r="19" pathLength="100"/>
      <text class="psy-t psy-td psy-r3t" x="207" y="77">dogs</text>
    </g>
    <text class="psy-t psy-q" x="186" y="52">?</text>
    <text class="psy-v psy-no psy-rv" x="180" y="133">INVALID ✗</text>
  </svg>
  <div class="psy-say">
%s
  </div>
</div>''' % say

anim_row.write_anim('psyll', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-PHIL', 'chapter': 1, 'title': 'Syllogisms in circles',
                           'about': 'Syllogism|Validity'})
