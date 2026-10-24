# Descartes' method of doubt (Meditations I–II) as layers peeled away: the senses, waking life, even arithmetic,
# each struck through, until what cannot be doubted is left in the middle: I think, therefore I am.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/418.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, captions, still_block

T = 15.0
END = T - 0.6
CH = 4.4    # an em of the 7.5px label face, near enough, for the length of the line struck through it
css = [""".an-pdoubt { width: min(92vw, 23rem, 100%); }
.pdb-svg { display: block; width: 100%; height: auto; }
.pdb-ring { fill: rgb(244 241 232 / .03); stroke: var(--dim); stroke-width: 1.2; }
.pdb-lab { font: 700 7.5px var(--mono); fill: var(--ink); text-anchor: middle; }
.pdb-x { stroke: var(--coral); stroke-width: 1.4; stroke-linecap: butt; stroke-dasharray: 100; }
.pdb-core { fill: rgb(240 180 95 / .16); stroke: var(--gold); stroke-width: 2; }
.pdb-ct { font: 800 10.5px var(--mono); fill: var(--gold); text-anchor: middle; }
.pdb-say { display: grid; margin-top: .55rem; font: 600 .82rem/1.4 var(--mono); color: var(--ink); text-align: center; }
.pdb-say > span { grid-area: 1 / 1; }
.pdb-say b { color: var(--gold); }"""]

LAYERS = [((4, 4, 232, 142), 16, 'the senses: they sometimes deceive', 1.6),
          ((20, 24, 200, 118), 36, 'waking life: am I dreaming?', 4.6),
          ((36, 44, 168, 94), 56, 'even 2 + 3 = 5: an evil demon?', 7.6)]
parts = []
for k, ((x, y, w, h), ly, words, at) in enumerate(LAYERS):
    half = len(words) * CH / 2 + 3
    parts.append('<g class="pdb-g%d"><rect class="pdb-ring" x="%d" y="%d" width="%d" height="%d" rx="9"/>'
                 '<text class="pdb-lab" x="120" y="%d">%s</text>'
                 '<path class="pdb-x pdb-x%d" pathLength="100" d="M%.1f %.1fH%.1f"/></g>' % (k, x, y, w, h, ly, words, k, 120 - half, ly - 2.6, 120 + half))
    css.append('.pdb-x%d { animation: pdb-x%d %gs ease-in-out infinite; }' % (k, k, T))
    css.append(kf('pdb-x%d' % k, T, [(at, 'stroke-dashoffset: 100;'), (at + 0.8, 'stroke-dashoffset: 0;'), (END + .4, 'stroke-dashoffset: 0;')]))
    css.append('.pdb-g%d { opacity: .28; animation: pdb-g%d %gs ease-in-out infinite; }' % (k, k, T))
    css.append(kf('pdb-g%d' % k, T, [(0.1, 'opacity: 0;'), (0.5, 'opacity: 1;'), (at + 1.0, 'opacity: 1;'), (at + 1.8, 'opacity: .28;'),
                                     (END, 'opacity: .28;'), (END + .4, 'opacity: 0;')]))
css.append('.pdb-cg { transform-box: fill-box; transform-origin: center; animation: pdb-cg %gs ease-out infinite; }' % T)
css.append(kf('pdb-cg', T, [(0.1, 'opacity: 0; transform: none;'), (0.5, 'opacity: .22; transform: none;'), (10.0, 'opacity: .22; transform: none;'),
                            (10.6, 'opacity: 1; transform: scale(1.08);'), (11.2, 'opacity: 1; transform: none;'),
                            (END, 'opacity: 1; transform: none;'), (END + .4, 'opacity: 0; transform: none;')]))

say, say_css = captions('pdb', T, [
    (0, 3.6, 'Descartes doubts the senses: they have deceived him before'),
    (3.6, 6.6, 'He might be dreaming, so even waking life can be doubted'),
    (6.6, 9.8, 'An evil demon might deceive him even about arithmetic'),
    (9.8, T, 'But doubting is thinking, so the doubter must exist: <b>I think, therefore I am</b>'),
], end=END)
css.append(say_css)
css.append(still_block('pdoubt'))

html = '''<div class="an-pdoubt" aria-hidden="true">
  <svg class="pdb-svg" viewBox="0 0 240 150">
    %s
    <g class="pdb-cg">
      <rect class="pdb-core" x="54" y="70" width="132" height="54" rx="7"/>
      <text class="pdb-ct" x="120" y="93">I think,</text>
      <text class="pdb-ct" x="120" y="108">therefore I am</text>
    </g>
  </svg>
  <div class="pdb-say">
%s
  </div>
</div>''' % ('\n    '.join(parts), say)

anim_row.write_anim('pdoubt', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-PHIL', 'chapter': 6, 'title': 'Doubting down to the cogito',
                           'about': 'Method of doubt|Cogito'})
