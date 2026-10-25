# A gallery of three informal fallacies, one card at a time: straw man, ad hominem, false dilemma. Each shows the
# claim, the bad reply, and in one line why the reply fails.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/418.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, still_block

T = 18.0
END = T - 0.6
css = [""".an-pfall { width: min(92vw, 23rem, 100%); }
.pfl-stage { display: grid; }
.pfl-card { grid-area: 1 / 1; display: grid; grid-template-columns: 3.4rem 1fr; gap: .2rem .7rem; align-items: start;
            padding: .8rem; border: 1px solid var(--line); border-radius: var(--r-sm, 8px); background: rgb(244 241 232 / .03);
            font: 600 .78rem/1.4 var(--mono); color: var(--ink); text-align: left; }
.pfl-ic { grid-row: 1 / span 4; width: 3.4rem; height: auto; }
.pfl-name { font-size: .95rem; font-weight: 800; color: var(--gold); letter-spacing: .02em; }
.pfl-who { color: var(--dim); }
.pfl-why { color: var(--coral); }
.pfl-line { fill: none; stroke: var(--ink); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.pfl-straw { fill: none; stroke: var(--gold); stroke-width: 1.6; stroke-linecap: round; }
.pfl-fill { fill: var(--ink); }
.pfl-dash { fill: none; stroke: var(--faint); stroke-width: 1.6; stroke-dasharray: 3 3; stroke-linecap: round; }
.pfl-hit { fill: none; stroke: var(--coral); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.pfl-ab { font: 800 9px var(--mono); fill: var(--gold); text-anchor: middle; }
.pfl-q { font: 800 9px var(--mono); fill: var(--faint); text-anchor: middle; }"""]

CARDS = [
    ('Straw man',
     '<path class="pfl-line" d="M24 8v34M10 20h28"/><circle class="pfl-line" cx="24" cy="10" r="5"/><path class="pfl-fill" d="M15 6h18l-3-4h-12Z"/>'
     '<path class="pfl-straw" d="M10 20l-3 4M10 20l-4 1M38 20l3 4M38 20l4 1M24 34l-4 6M24 34l4 6"/>',
     'We should have fewer cars in the town centre.',
     'So you want to ban cars and close every shop in town?',
     'It knocks down a weaker view that nobody put forward.'),
    ('Ad hominem',
     '<path class="pfl-line" d="M4 6h22v12h-14l-4 4v-4h-4Z"/><circle class="pfl-line" cx="36" cy="26" r="4"/><path class="pfl-line" d="M36 30v10M36 40l-4 6M36 40l4 6M30 34h12"/>'
     '<path class="pfl-hit" d="M8 34h20m-4 -4l4 4l-4 4"/>',
     'This study shows sugar harms children’s teeth.',
     'Why listen to him? He can’t even keep his garden tidy.',
     'It attacks the person; the evidence stands or falls on its own.'),
    ('False dilemma',
     '<path class="pfl-line" d="M24 46V28M24 28L10 10M24 28L38 10"/><path class="pfl-dash" d="M24 28V6M24 30L4 22M24 30L44 22"/>'
     '<text class="pfl-ab" x="8" y="8">A</text><text class="pfl-ab" x="40" y="8">B</text><text class="pfl-q" x="24" y="5">?</text>',
     'Either we build the new road, or the town centre dies.',
     'Isn’t there a third way, like a better bus service?',
     'It offers two options as if they were the only ones.'),
]
WIN = 6.0
cards = []
for k, (name, icon, a, b, why) in enumerate(CARDS):
    t0 = k * WIN + 0.3
    last = k == len(CARDS) - 1
    off = END if last else (k + 1) * WIN - 0.3
    cards.append('''    <div class="pfl-card pfl-k%d">
      <svg class="pfl-ic" viewBox="0 0 48 48">%s</svg>
      <div class="pfl-name">%s</div>
      <div><span class="pfl-who">A:</span> %s</div>
      <div class="pfl-b%d"><span class="pfl-who">B:</span> %s</div>
      <div class="pfl-why pfl-w%d">%s</div>
    </div>''' % (k, icon, name, a, k, b, k, why))
    css.append('.pfl-k%d { opacity: %d; animation: pfl-k%d %gs ease-out infinite; }' % (k, 1 if last else 0, k, T))
    css.append(kf('pfl-k%d' % k, T, [(t0, 'opacity: 0; transform: translateX(10px);'), (t0 + 0.5, 'opacity: 1; transform: none;'),
                                      (off, 'opacity: 1; transform: none;'), (off + 0.4, 'opacity: 0; transform: translateX(-10px);')]))
    for part, dt in (('b', 1.4), ('w', 3.0)):
        css.append('.pfl-%s%d { animation: pfl-%s%d %gs ease-out infinite; }' % (part, k, part, k, T))
        css.append(kf('pfl-%s%d' % (part, k), T, [(t0 + dt, 'opacity: 0;'), (t0 + dt + 0.4, 'opacity: 1;'), (off, 'opacity: 1;'), (off + 0.4, 'opacity: 0;')]))
css.append(still_block('pfall'))

html = '''<div class="an-pfall" aria-hidden="true">
  <div class="pfl-stage">
%s
  </div>
</div>''' % '\n'.join(cards)

anim_row.write_anim('pfall', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-PHIL', 'chapter': 1, 'title': 'A gallery of fallacies',
                           'about': 'Fallacy|Straw man'})
