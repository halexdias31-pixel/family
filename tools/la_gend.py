# Gender and agreement (GCSE Spanish foundations, chapter 7): one phrase, el chico alto, whose article, noun ending and
# adjective ending change together through the four forms — masculine and feminine, one and many — each change dropping
# into its slot at the same moment, so the eye sees the adjective follow the noun. Then a one-form adjective, grande.
# Writes its whole row of data/textbooks.json through tools/anim_row.py (`whole=`). Run: python3 tools/la_gend.py
#
# ONE KEYFRAME PER FORM, SHARED BY EVERY SLOT: the article, both endings and the label of form k all run `lg-wk`, so
# they cannot fall out of step with each other.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import kf

ID, P = 'lagend', 'lg'
FORMS = [('el', 'o', 'o', 'masculine · one', 'm'), ('la', 'a', 'a', 'feminine · one', 'f'),
         ('los', 'os', 'os', 'masculine · many', 'm'), ('las', 'as', 'as', 'feminine · many', 'f')]
GR = [('el coche', 'grande'), ('la casa', 'grande'), ('los coches', 'grandes'), ('las casas', 'grandes')]
W = 2.4                       # seconds each form is up
T = W * len(FORMS)

def slot(cls, pick):
    return '<span class="%s-%s %s-slot">%s</span>' % (P, cls, P, ''.join(
        '<span class="%s-w%d %s-%s">%s</span>' % (P, k, P, f[4], pick(k, f)) for k, f in enumerate(FORMS)))

html = '''<div class="an-%(id)s" aria-hidden="true">
  <div class="%(p)s-row">%(art)s <span class="%(p)s-wd">chic%(n)s</span> <span class="%(p)s-wd">alt%(a)s</span></div>
  <div class="%(p)s-tag">%(tag)s</div>
  <div class="%(p)s-two">%(gr)s</div>
  <div class="%(p)s-say">the adjective copies the noun</div>
</div>''' % {'id': ID, 'p': P,
             'art': slot('art', lambda k, f: f[0]), 'n': slot('end', lambda k, f: f[1]), 'a': slot('end', lambda k, f: f[2]),
             'tag': slot('lab', lambda k, f: f[3]),
             'gr': ''.join('<span class="%s-w%d">%s <b class="%s-g">%s</b></span>' % (P, k, n, P, g) for k, (n, g) in enumerate(GR))}

css = ['''.an-%(id)s { width: min(100cqi, 20rem); text-align: center; }
.%(p)s-row { font-size: 1.7rem; font-weight: 700; white-space: nowrap; }
.%(p)s-slot { display: inline-grid; vertical-align: bottom; }
.%(p)s-slot > span, .%(p)s-two > span { grid-area: 1 / 1; }
.%(p)s-art { justify-items: end; min-width: 1.9em; }
.%(p)s-end { justify-items: start; }
.%(p)s-m { color: #6fa8dc; }
.%(p)s-f { color: #f0b45f; }
.%(p)s-tag { display: grid; margin-top: .35rem; font-size: .85rem; letter-spacing: .03em; }
.%(p)s-lab { display: inline-grid; }
.%(p)s-two { display: grid; margin-top: 1.1rem; font-size: 1.05rem; }
.%(p)s-g { color: #8fd18f; }
.%(p)s-say { margin-top: .9rem; font-size: .8rem; letter-spacing: .04em; opacity: .7; }''' % {'id': ID, 'p': P}]
for k in range(len(FORMS)):
    a, b = k * W, (k + 1) * W
    css.append('.%s-w%d { opacity: %d; animation: %s-w%d %gs linear infinite; }' % (P, k, 1 if k == 0 else 0, P, k, T))
    st = [(0, 'opacity: 0; transform: translateY(-.45em);'),
          (a, 'opacity: 0; transform: translateY(-.45em); animation-timing-function: cubic-bezier(.2, .8, .3, 1);'),
          (a + .35, 'opacity: 1; transform: none;'), (b - .3, 'opacity: 1; transform: none;'), (b, 'opacity: 0; transform: translateY(.3em);')]
    if k == 0:   # the first form is also up at the loop's very end, so the loop closes on what it opens with
        st = [(0, 'opacity: 1; transform: none;'), (b - .3, 'opacity: 1; transform: none;'), (b, 'opacity: 0; transform: translateY(.3em);'),
              (T - .35, 'opacity: 0; transform: translateY(-.45em); animation-timing-function: cubic-bezier(.2, .8, .3, 1);'), (T, 'opacity: 1; transform: none;')]
    css.append(kf('%s-w%d' % (P, k), T, st))
# REDUCED MOTION: the first form, el chico alto, standing still (each form's base opacity says which shows).
css.append('''@media (prefers-reduced-motion: reduce) {
  .an-%(id)s, .an-%(id)s * { animation: none; }
}''' % {'id': ID})
css_all = '\n'.join(css)

anim_row.write_anim('lagend', html=html, css=css_all,
                    whole={'book_id': 'TB-GCSE-SPANISH-FOUND', 'chapter': 7, 'title': 'The adjective follows the noun',
                           'about': 'Agreement|-o adjectives|-e and consonant adjectives'})
print('%s: %d characters of markup, %d of CSS' % (ID, len(html), len(css_all)))
