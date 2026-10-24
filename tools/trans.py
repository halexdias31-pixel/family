# Coordinates, translation and reflection on one grid (KS2 Year 6 four quadrants; GCSE Maths chapter 14,
# Translation and Reflection, until the KS2 book has a position chapter). Writes its whole row of
# data/textbooks.json through tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE: change it and re-run.
# Run: python3 tools/trans.py
#
# WHAT IT SHOWS, on one 35s loop:
#   1. COORDINATES: a point walks along the x-axis first, then up or down — "along the corridor, then up the
#      stairs" — to (3, 2), then to (−2, 4), the walk left in coral since it is the negative way
#   2. TRANSLATION: a triangle slides 5 right, then 2 up; its old place stays dashed, and one corner is
#      followed from (−4, 0) to (1, 2), so "every corner moves the same" is something seen
#   3. REFLECTION in the y-axis: the shape folds over the mirror line (it flattens onto it and opens on the
#      other side), each corner joined across to its image, the same distance each side
# Colours: the shape and its point are this drawing's blue, the mirror and the arrows gold, negatives coral.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num

P = 'tf'
W, VH = 240, 192
U, X0, Y0 = 18, 30, 26          # one unit; where x = −5 and y = 5 are
YSAY, YSUM = 160, 184
L = anim_row.Loop(P, [11, 12, 12])
X = lambda x: X0 + (x + 5) * U
Y = lambda y: Y0 + (5 - y) * U


def t_(x, y, s, cls=''):
    return '<text%s x="%s" y="%s">%s</text>' % (' class="%s"' % cls if cls else '', num(x), num(y), s)


def say(a, b, s):
    return L.step(a, b, t_(W / 2, YSAY, s, 'tf-say'))


def grid():
    g = '<path class="tf-gr" d="%s"/>' % ''.join(['M%s %sV%s' % (X(x), Y(5), Y(-1)) for x in range(-5, 6) if x]
                                                  + ['M%s %sH%s' % (X(-5), Y(y), X(5)) for y in range(-1, 6) if y])
    g += '<path class="tf-ax" d="M%s %sH%sM%s %sV%s"/>' % (X(-5), Y(0), X(5), X(0), Y(5), Y(-1))
    g += ''.join(t_(X(x), Y(0) + 11, ('−%d' % -x) if x < 0 else x, 'tf-tk') for x in range(-5, 6) if x)
    g += ''.join(t_(X(0) - 6, Y(y) + 4, y, 'tf-tk tf-ty') for y in range(1, 6))
    return g


def poly(pts, cls):
    return '<path class="%s" d="M%sZ"/>' % (cls, 'L'.join('%s %s' % (X(x), Y(y)) for x, y in pts))


def coords(k):
    L.at(k)
    p = [grid()]
    t = .5
    walks = [((3, 2), 'tf-u'), ((-2, 4), 'tf-n')]
    for n, ((x, y), cls) in enumerate(walks):
        end = t + 4.6 if n + 1 < len(walks) else None     # the last walk stays: it is the still
        # the walk: along first, then up; the dot goes with it, and the label comes when it arrives
        p.append(L.step(t, end, '<path class="tf-wk %s tf-mv"%s d="M%s %sH%s"/>' % (
            cls, L.st(t, t0='scale(0,1)', o='0 0' if x > 0 else '100% 0'), X(0), Y(0), X(x))
            + '<path class="tf-wk tf-u tf-mv"%s d="M%s %sV%s"/>' % (L.st(t + 1.2, t0='scale(1,0)', o='0 100%'), X(x), Y(0), Y(y))))
        p.append(L.step(t, end, '<g class="tf-mv"%s><circle class="tf-pt tf-mv"%s cx="%s" cy="%s" r="4"/></g>' % (
            L.st(t + 1.2, t0='translate(0,%spx)' % (Y(0) - Y(y))), L.st(t, t0='translate(%spx,0)' % (X(0) - X(x))), X(x), Y(y))))
        p.append(L.step(t + 2.2, end, t_(X(x) + (16 if x > 0 else -16), Y(y) - 8, '(%s, %d)' % (x if x > 0 else '−%d' % -x, y), 'tf-lb')))
        p.append(say(t, end, 'along %d %s, then up %d' % (abs(x), 'right' if x > 0 else 'left', y)))
        t += 4.8
    p.append(L.step(t - .2, None, t_(W / 2, YSUM, 'x first, then y: (across, up)', 'tf-sum')))
    return L.scene(k, ''.join(p))


def translate(k):
    L.at(k)
    p = [grid()]
    A = [(-4, 0), (-2, 0), (-4, 2)]
    dx, dy = 5, 2
    B = [(x + dx, y + dy) for x, y in A]
    p.append(poly(A, 'tf-gh'))
    t = .8
    p.append(say(.3, 3.2, 'translate 5 right, 2 up'))
    shape = poly(B, 'tf-sh') + '<circle class="tf-pt" cx="%s" cy="%s" r="3.2"/>' % (X(B[0][0]), Y(B[0][1]))
    p.append('<g class="tf-mvs"%s><g class="tf-mv"%s>%s</g></g>' % (
        L.st(t, t0='translate(%spx,0)' % (-dx * U)), L.st(t + 2.2, t0='translate(0,%spx)' % (dy * U)), shape))
    p.append(L.step(t, None, '<path class="tf-arr" d="M%s %sH%sV%s"/>' % (X(A[0][0]), Y(A[0][1]) + 0, X(B[0][0]), Y(B[0][1]))))
    p.append(say(3.4, 6.6, 'every corner moves the same'))
    p.append(L.step(3.6, None, t_(X(B[0][0]) - 4, Y(B[0][1]) + 14, '(1, 2)', 'tf-lb')))
    p.append(t_(X(A[0][0]) - 4, Y(A[0][1]) - 44, '(−4, 0)', 'tf-lb tf-dim'))
    p.append(say(6.8, None, 'same shape, same way round'))
    p.append(L.step(7.2, None, t_(W / 2, YSUM, '(−4, 0) → <tspan class="tf-g">(1, 2)</tspan>', 'tf-sum')))
    return L.scene(k, ''.join(p))


def reflect(k):
    L.at(k)
    p = [grid()]
    A = [(1, 1), (4, 1), (4, 2), (2, 2), (2, 4), (1, 4)]
    B = [(-x, y) for x, y in A]
    p.append('<path class="tf-mir" d="M%s %sV%s"/>' % (X(0), Y(5) - 4, Y(-1)))
    p.append(t_(X(0) + 2, Y(5) - 7, 'mirror line', 'tf-ml'))
    p.append(poly(A, 'tf-sh'))
    t = 1.0
    p.append(say(.3, 3, 'reflect in the y-axis'))
    # the fold: drawn where it lands; it starts turned back over the line (scale −1 about the y-axis)
    p.append(L.step(t, None, '<g class="tf-mvs"%s>%s</g>' % (L.st(t + .4, t0='scale(-1,1)', o='%spx 0' % (4 * U)), poly(B, 'tf-sh tf-im'))))
    t += 2.6
    j = ''.join('<path class="tf-jn" d="M%s %sH%s"/>' % (X(x), Y(y), X(-x)) for x, y in [(4, 1), (2, 4)])
    p.append(L.step(t, None, j + t_(X(3), Y(1) + 13, '4', 'tf-ds') + t_(X(-3), Y(1) + 13, '4', 'tf-ds')
                    + t_(X(1), Y(4) - 5, '2', 'tf-ds') + t_(X(-1), Y(4) - 5, '2', 'tf-ds')))
    p.append(say(t, t + 3, 'each corner: same distance'))
    p.append(say(t + 3.2, None, 'flipped: a mirror image'))
    p.append(L.step(t + 3.6, None, t_(W / 2, YSUM, '(4, 1) → <tspan class="tf-g">(−4, 1)</tspan>', 'tf-sum')))
    return L.scene(k, ''.join(p))


scenes = [coords(0), translate(1), reflect(2)]
html = ('<div class="an-trans" aria-hidden="true">\n  <svg class="tf-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + s for s in scenes)))

css = '''.an-trans { --tf-u: #6fa8dc; }
.tf-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.tf-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.tf-gr { stroke: var(--paper); stroke-opacity: .16; stroke-width: .8; }
.tf-ax { stroke: var(--paper); stroke-opacity: .75; stroke-width: 1.2; }
.tf-svg .tf-tk { font-size: 10px; font-weight: 600; fill-opacity: .7; }
.tf-svg .tf-ty { text-anchor: end; }
.tf-wk { fill: none; stroke-width: 2.6; stroke-linecap: round; }
.tf-wk.tf-u { stroke: var(--tf-u); }
.tf-wk.tf-n { stroke: var(--coral); }
.tf-pt { fill: var(--gold); }
.tf-svg .tf-lb { font-size: 11px; fill: var(--gold); }
.tf-svg .tf-dim { fill: var(--paper); fill-opacity: .7; }
.tf-sh { fill: var(--tf-u); fill-opacity: .55; stroke: var(--tf-u); stroke-width: 1.6; stroke-linejoin: round; }
.tf-im { fill-opacity: .35; }
.tf-gh { fill: none; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.2; stroke-dasharray: 3 2; }
.tf-arr { fill: none; stroke: var(--gold); stroke-width: 1.4; stroke-dasharray: 4 2.5; }
.tf-mir { stroke: var(--gold); stroke-width: 2; stroke-dasharray: 5 3; }
.tf-svg .tf-ml { font-size: 10px; fill: var(--gold); text-anchor: start; }
.tf-jn { stroke: var(--gold); stroke-width: 1.2; stroke-dasharray: 2 2; }
.tf-svg .tf-ds { font-size: 11px; fill: var(--gold); }
.tf-svg .tf-say { font-size: 12px; }
.tf-svg .tf-sum { font-size: 13px; }
.tf-svg .tf-g { fill: var(--gold); }
''' + L.css()

anim_row.write_anim('trans', html=html, css=css, whole=True, place=dict(
    book_id='TB-GCSE-MATHS', chapter=14, title='Translation and reflection', about='Translation|Reflection'))
