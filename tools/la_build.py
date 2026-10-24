# The sentence builder (GCSE Spanish foundations, chapter 8): four slots — time phrase, verb, connective, opinion — and
# a tile dropping into each in turn until the sentence stands; then the tiles swap for a past-tense sentence, built the
# same way. The labels under the slots stay, because the frame is the lesson: any sentence can be built in it.
# Writes its whole row of data/textbooks.json through tools/anim_row.py (`whole=`). Run: python3 tools/la_build.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import kf

ID, P = 'labuild', 'lb'
SLOTS = ['time phrase', 'verb', 'connective', 'opinion']
SENT = [['Normalmente', 'juego al tenis', 'porque', 'es divertido.'],
        ['El sábado pasado', 'fui a la piscina', 'pero', 'fue aburrido.']]
COL = ['#6fa8dc', '#c9cdd4', '#f0b45f', '#8fd18f']
DROP = .7                 # one tile every DROP seconds
HOLD = 2.4                # the whole sentence stands this long
HALF = .4 + DROP * len(SLOTS) + HOLD + .4
T = HALF * len(SENT)

cells = []
for j, name in enumerate(SLOTS):
    tiles = ''.join('<span class="%s-t %s-s%dj%d">%s</span>' % (P, P, i, j, s[j]) for i, s in enumerate(SENT))
    cells.append('    <span class="%s-slot %s-c%d"><span class="%s-tiles">%s</span><span class="%s-lab">%s</span></span>' % (P, P, j, P, tiles, P, name))
html = '''<div class="an-%(id)s" aria-hidden="true">
  <div class="%(p)s-row">
%(cells)s
  </div>
</div>''' % {'id': ID, 'p': P, 'cells': '\n'.join(cells)}

css = ['''.an-%(id)s { width: min(100cqi, 23rem); }
.%(p)s-row { display: flex; flex-wrap: wrap; justify-content: center; gap: .55rem .4rem; }
.%(p)s-slot { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
.%(p)s-tiles { display: grid; min-height: 2.1rem; min-width: 3.2rem; border-bottom: 2px dashed #555b66; padding-bottom: .2rem; }
.%(p)s-t { grid-area: 1 / 1; justify-self: center; padding: .25rem .55rem; border-radius: .45rem; font-weight: 700; white-space: nowrap;
  background: #23272f; border: 1px solid currentColor; }
.%(p)s-lab { font-size: .72rem; letter-spacing: .05em; text-transform: uppercase; opacity: .65; }''' % {'id': ID, 'p': P}]
for j, c in enumerate(COL):
    css.append('.%s-c%d .%s-t { color: %s; }' % (P, j, P, c))
for i in range(len(SENT)):
    for j in range(len(SLOTS)):
        a = i * HALF + .4 + j * DROP
        b = (i + 1) * HALF - .4
        name = '%s-s%dj%d' % (P, i, j)
        last = i == len(SENT) - 1
        css.append('.%s { opacity: %d; animation: %s %gs linear infinite; }' % (name, 1 if last else 0, name, T))
        css.append(kf(name, T, [(0, 'opacity: 0; transform: translateY(-1.2rem);'),
                                (a, 'opacity: 0; transform: translateY(-1.2rem); animation-timing-function: cubic-bezier(.3, 1.5, .5, 1);'),
                                (a + .45, 'opacity: 1; transform: none;'), (b, 'opacity: 1; transform: none;'),
                                (b + .3, 'opacity: 0; transform: translateY(.5rem);')]))
# REDUCED MOTION: the past-tense sentence, built (the base opacities show the last sentence's tiles).
css.append('''@media (prefers-reduced-motion: reduce) {
  .an-%(id)s, .an-%(id)s * { animation: none; }
}''' % {'id': ID})
css_all = '\n'.join(css)

anim_row.write_anim('labuild', html=html, css=css_all,
                    whole={'book_id': 'TB-GCSE-SPANISH-FOUND', 'chapter': 8, 'title': 'Build a sentence',
                           'about': 'Time phrase|Connective|Opinion phrase|Justification'})
print('%s: %d characters of markup, %d of CSS' % (ID, len(html), len(css_all)))
