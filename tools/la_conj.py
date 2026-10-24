# The conjugation table (GCSE Spanish foundations, chapter 2): hablar loses its -ar, the stem habl- is copied down six
# rows, and each person's ending slides onto it in turn — o, as, a, amos, áis, an — with what it means beside it.
# Writes its whole row of data/textbooks.json through tools/anim_row.py (`whole=`). Run: python3 tools/la_conj.py
#
# ONE LOOP, ONE CLOCK. Every part's keyframes are cut from the same T-second loop (anim_row.kf), not staggered with
# animation-delay: a delayed loop drifts out of step with the -ar lifting off, and the table must empty before it refills.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, still_block

ID, P = 'laconj', 'lc'
T = 9.0
ROWS = [('yo', 'o', 'I speak'), ('tú', 'as', 'you speak'), ('él, ella', 'a', 'he or she speaks'),
        ('nosotros', 'amos', 'we speak'), ('vosotros', 'áis', 'you all speak'), ('ellos', 'an', 'they speak')]
OFF = 1.4            # the -ar has gone by here
STEP = .75           # one ending every STEP seconds
CLEAR = 7.9          # everything fades from here to the loop's end

cells, css = [], []
for k, (who, end, means) in enumerate(ROWS):
    on = OFF + .5 + k * STEP
    cells.append('    <span class="%s-p">%s</span><span class="%s-s">habl</span><b class="%s-e %s-e%d">%s</b><span class="%s-m %s-m%d">%s</span>'
                 % (P, who, P, P, P, k, end, P, P, k, means))
    css.append('.%s-e%d { animation: %s-e%d %gs linear infinite; }' % (P, k, P, k, T))
    css.append(kf('%s-e%d' % (P, k), T, [(0, 'opacity: 0; transform: translateX(2.4em);'),
                                         (on - .45, 'opacity: 0; transform: translateX(2.4em); animation-timing-function: cubic-bezier(.2, .8, .3, 1);'),
                                         (on, 'opacity: 1; transform: none;'), (CLEAR, 'opacity: 1; transform: none;'),
                                         (CLEAR + .4, 'opacity: 0; transform: none;')]))
    css.append('.%s-m%d { animation: %s-m%d %gs linear infinite; }' % (P, k, P, k, T))
    css.append(fade('%s-m%d' % (P, k), T, on + .25, CLEAR))

html = '''<div class="an-%(id)s" aria-hidden="true">
  <div class="%(p)s-inf"><span class="%(p)s-st">habl</span><span class="%(p)s-ar">ar</span><span class="%(p)s-to">to speak</span></div>
  <div class="%(p)s-tab">
%(cells)s
  </div>
  <div class="%(p)s-say">stem + ending = who is doing it</div>
</div>''' % {'id': ID, 'p': P, 'cells': '\n'.join(cells)}

base = '''.an-%(id)s { width: min(100cqi, 21rem); font-size: .95rem; line-height: 1.35; text-align: left; }
.%(p)s-inf { display: flex; align-items: baseline; gap: .1em; justify-content: center; margin-bottom: .7rem; font-size: 1.5rem; font-weight: 700; }
.%(p)s-st { color: #6fa8dc; }
.%(p)s-ar { color: #e8836b; display: inline-block; animation: %(p)s-ar %(T)gs linear infinite; }
.%(p)s-to { margin-left: .6em; font-size: .85rem; font-weight: 400; opacity: .7; }
.%(p)s-tab { display: grid; overflow: clip; grid-template-columns: auto auto 1fr; column-gap: .1em; row-gap: .3rem; align-items: baseline; }
.%(p)s-p { opacity: .7; padding-right: .7em; }
.%(p)s-s { color: #6fa8dc; font-weight: 700; justify-self: end; }
.%(p)s-e { color: #f0b45f; font-weight: 700; justify-self: start; }
.%(p)s-m { grid-column: 1 / -1; margin: -.2rem 0 .1rem; font-size: .78rem; opacity: .6; }
.%(p)s-say { margin-top: .8rem; text-align: center; font-size: .8rem; letter-spacing: .04em; opacity: .75; }
''' % {'id': ID, 'p': P, 'T': T}
ar = kf('%s-ar' % P, T, [(0, 'opacity: 1; transform: none;'), (.7, 'opacity: 1; transform: none; animation-timing-function: ease-in;'),
                         (OFF, 'opacity: 0; transform: translateY(-.9em) rotate(-14deg);'),
                         (CLEAR, 'opacity: 0; transform: translateY(-.9em) rotate(-14deg);'), (T, 'opacity: 1; transform: none;')])
# REDUCED MOTION: the finished table — every ending on its stem — with the -ar shown struck off.
still = '''@media (prefers-reduced-motion: reduce) {
  .an-%(id)s, .an-%(id)s * { animation: none; }
  .%(p)s-ar { opacity: .35; text-decoration: line-through; }
}''' % {'id': ID, 'p': P}
css_all = base + ar + '\n' + '\n'.join(css) + '\n' + still

anim_row.write_anim('laconj', html=html, css=css_all,
                    whole={'book_id': 'TB-GCSE-SPANISH-FOUND', 'chapter': 2, 'title': 'Endings onto the stem',
                           'about': 'Stem|Endings'})
print('%s: %d characters of markup, %d of CSS' % (ID, len(html), len(css_all)))
