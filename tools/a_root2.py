# Proof by contradiction that √2 is irrational, revealed a step at a time: suppose √2 = a ÷ b in lowest terms; then
# a is even, then b is even — and "lowest terms" is struck through, because both share the factor 2.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, still_block

T = 14.0
STEPS = [
    (0.5, 'Suppose <b>√2 = a ÷ b</b>, a fraction in <s class="ar2-low">lowest terms</s>'),
    (2.3, 'Square both sides: 2 = a² ÷ b², so <b>a² = 2b²</b>'),
    (4.1, 'a² is 2 × something, so a² is <i>even</i> — and so <i>a is even</i>: a = 2k'),
    (5.9, 'Then 2b² = (2k)² = 4k², so b² = 2k²: <i>b is even</i> too'),
    (7.8, '<u>Both even means both share the factor 2 — not lowest terms. Contradiction.</u>'),
    (10.0, 'So the supposition is false: <b>√2 is irrational</b> ∎'),
]
STRIKE = 8.6
css = [""".an-aroot2 { --ar2-even: #6fd8c4; width: min(92vw, 23rem, 100%); text-align: left; }
.ar2-steps { margin: 0; padding: 0; list-style: none; display: grid; gap: .45rem; font: 700 .8rem/1.4 var(--mono); color: var(--ink); }
.ar2-step { display: grid; grid-template-columns: 1.6rem 1fr; align-items: baseline; }
.ar2-k { color: var(--dim); }
.ar2-step b { color: var(--gold); }
.ar2-step i { font-style: normal; color: var(--ar2-even); }
.ar2-step u { text-decoration: none; color: var(--coral); }
.ar2-low { text-decoration: none; background: linear-gradient(var(--coral), var(--coral)) no-repeat 0 55% / 100% 2px; }"""]
rows = []
for k, (at, words) in enumerate(STEPS):
    rows.append('    <div class="ar2-step ar2-s%d"><span class="ar2-k">%d</span><span>%s</span></div>' % (k, k + 1, words))
    css.append('.ar2-s%d { animation: ar2-s%d %gs ease-out infinite; }' % (k, k, T))
    css.append(kf('ar2-s%d' % k, T, [(at, 'opacity: 0; transform: translateY(5px);'), (at + 0.5, 'opacity: 1; transform: none;'),
                                     (13.3, 'opacity: 1; transform: none;'), (13.7, 'opacity: 0; transform: none;')]))
# the line through "lowest terms" is drawn across it when the contradiction lands
css.append('.ar2-low { animation: ar2-low %gs ease-in-out infinite; }' % T)
css.append(kf('ar2-low', T, [(STRIKE, 'background-size: 0% 2px;'), (STRIKE + 0.7, 'background-size: 100% 2px;')]))
css.append(still_block('aroot2'))

html = '''<div class="an-aroot2" aria-hidden="true">
  <div class="ar2-steps">
%s
  </div>
</div>''' % '\n'.join(rows)

anim_row.write_anim('aroot2', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 1, 'title': '√2 is irrational',
                           'about': 'Proof by contradiction|Rational number'})
