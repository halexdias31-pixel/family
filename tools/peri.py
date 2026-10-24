# Area and perimeter — squares counted, the way round walked, and a triangle as half a rectangle (KS2 Year
# 4–6; GCSE Maths chapter 16, Triangle and trapezium, until the KS2 book has a measures chapter). Writes its
# whole row of data/textbooks.json through tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE: change it and
# re-run, never the row. Run: python3 tools/peri.py
#
# WHAT IT SHOWS. Children mix the two up because both come from the same rectangle. So the same 6 cm by 4 cm
# rectangle three times on one 36s loop:
#   1. AREA is squares: the first row's six squares counted one by one, then the rows land with the running
#      total beside each (6, 12, 18, 24) — "4 rows of 6" — so length × width is a count, not a rule
#   2. PERIMETER is the way round: each side drawn in gold in turn, the running total at the foot
#   3. A TRIANGLE IS HALF: the diagonal cut, the cut half turned about the middle onto the other, ½ × 6 × 4
# Colours: squares this drawing's blue, the way round gold, the answer gold; cm for a length, cm² for an area.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num

P = 'pm'
W, VH = 240, 190
U, NX, NY = 22, 6, 4
X0, Y0 = (W - U * NX) / 2, 40
X1, Y1 = X0 + U * NX, Y0 + U * NY
YSAY, YSUM = 162, 184
L = anim_row.Loop(P, [12, 12, 12])


def t_(x, y, s, cls=''):
    return '<text%s x="%s" y="%s">%s</text>' % (' class="%s"' % cls if cls else '', num(x), num(y), s)


def say(a, b, s):
    return L.step(a, b, t_(W / 2, YSAY, s, 'pm-say'))


def frame(k, title):
    return [t_(W / 2, 16, title, 'pm-q'),
            '<rect class="pm-rc" x="%s" y="%s" width="%s" height="%s"/>' % (num(X0), Y0, U * NX, U * NY),
            t_(W / 2, Y1 + 14, '6 cm', 'pm-lb'), t_(X0 - 18, (Y0 + Y1) / 2 + 4, '4 cm', 'pm-lb')]


def grid():
    return '<path class="pm-gr" d="%s"/>' % ''.join(['M%s %sV%s' % (num(X0 + U * i), Y0, Y1) for i in range(1, NX)]
                                                    + ['M%s %sH%s' % (num(X0), num(Y0 + U * j), num(X1)) for j in range(1, NY)])


def area(k):
    L.at(k)
    p = frame(k, 'Area: count the squares')
    t = .6
    p.append(say(t, t + 3, 'one square is 1 cm²'))
    for i in range(NX):
        x = X0 + U * i
        p.append('<g class="pm-pop"%s><rect class="pm-u" x="%s" y="%s" width="%s" height="%s"/>%s</g>' % (
            L.st(t + .4 * i), num(x + 1), Y0 + 1, U - 2, U - 2, t_(x + U / 2, Y0 + U / 2 + 4, i + 1, 'pm-n')))
    p.append(L.step(t + 2.6, None, t_(X1 + 14, Y0 + U / 2 + 4, 6, 'pm-rt')))
    t += 3.2
    for j in range(1, NY):
        y = Y0 + U * j
        p.append('<g class="pm-fly"%s>%s%s</g>' % (L.st(t, t0='translate(0,-10px)'), ''.join(
            '<rect class="pm-u" x="%s" y="%s" width="%s" height="%s"/>' % (num(X0 + U * i + 1), y + 1, U - 2, U - 2) for i in range(NX)),
            t_(X1 + 14, y + U / 2 + 4, 6 * (j + 1), 'pm-rt')))
        t += 1.1
    p.append(say(3.8, t + .2, 'a row of 6, then 4 rows'))
    t += .4
    p.append(say(t, None, '4 rows of 6 squares'))
    p.append(L.step(t + .5, None, t_(W / 2, YSUM, 'Area = 6 × 4 = <tspan class="pm-g">24 cm²</tspan>', 'pm-sum')))
    assert t + .5 + 2 < L.L[k] - L.fade
    return L.scene(k, ''.join(p))


def perim(k):
    L.at(k)
    p = frame(k, 'Perimeter: the way round')
    p.append(grid())
    sides = [('M%s %sH%s' % (num(X0), Y0, num(X1)), 'scale(0,1)', '0 0', 6),
             ('M%s %sV%s' % (num(X1), Y0, Y1), 'scale(1,0)', '0 0', 4),
             ('M%s %sH%s' % (num(X1), Y1, num(X0)), 'scale(0,1)', '100% 0', 6),
             ('M%s %sV%s' % (num(X0), Y1, Y0), 'scale(1,0)', '0 100%', 4)]
    t, run = .8, 0
    for i, (d, t0, o, n) in enumerate(sides):
        p.append('<path class="pm-way pm-mv"%s d="%s"/>' % (L.st(t, t0=t0, o=o), d))
        line = '%d' % n if i == 0 else '%d + %d = %d' % (run, n, run + n)
        run += n
        p.append(say(t, t + 1.7 if i < 3 else None, line + ' cm'))
        t += 1.9
    p.append(L.step(t, None, t_(W / 2, YSUM, 'P = 6 + 4 + 6 + 4 = <tspan class="pm-g">20 cm</tspan>', 'pm-sum')))
    assert t + 2 < L.L[k] - L.fade
    return L.scene(k, ''.join(p))


def tri(k):
    L.at(k)
    p = frame(k, 'A triangle is half of it')
    p.append(grid())
    keep = '<path class="pm-tk" d="M%s %sH%sV%sZ"/>' % (num(X0), Y1, num(X1), Y0)        # bottom-left, bottom-right, top-right
    cut = '<path class="pm-tc" d="M%s %sH%sV%sZ"/>' % (num(X0), Y1, num(X1), Y0)  # drawn where it lands; it starts turned onto the top-left half
    p.append(L.step(.6, None, keep))
    p.append(L.step(.6, None, '<path class="pm-dg" d="M%s %sL%s %s"/>' % (num(X0), Y1, num(X1), Y0)))
    p.append(say(.6, 3.4, 'cut along the diagonal'))
    # the cut half turns half a turn about the rectangle's middle, and lands exactly on the other half
    mid = '%spx %spx' % (num(U * NX / 2), num(U * NY / 2))
    p.append(L.step(.6, None, '<g class="pm-mvs"%s>%s</g>' % (L.st(3.6, t0='rotate(180deg)', o=mid), cut)))
    p.append(say(3.6, 6.4, 'the two halves match'))
    p.append(say(6.6, None, 'half of 6 × 4 = 12'))
    x = (W - 181) / 2              # "A =", ½, "× 6 × 4 = 12 cm²" at 14px, set end to end
    p.append(L.step(7.2, None, t_(x + 12.6, YSUM, 'A =', 'pm-sum') + L.frac(x + 36, YSUM - 5, 1, 2, 11)
                    + t_(x + 47, YSUM, '× 6 × 4 = <tspan class="pm-g">12 cm²</tspan>', 'pm-sum pm-st')))
    return L.scene(k, ''.join(p))


scenes = [area(0), perim(1), tri(2)]
html = ('<div class="an-peri" aria-hidden="true">\n  <svg class="pm-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + s for s in scenes)))

css = '''.an-peri { --pm-u: #6fa8dc; }
.pm-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.pm-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.pm-rc { fill: var(--paper); fill-opacity: .06; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1; }
.pm-gr { stroke: var(--paper); stroke-opacity: .3; stroke-width: .8; }
.pm-u { fill: var(--pm-u); }
.pm-svg .pm-n { font-size: 11px; fill: var(--bg); }
.pm-svg .pm-rt { font-size: 12px; fill: var(--pm-u); }
.pm-svg .pm-q { font-size: 13px; fill: var(--gold); }
.pm-svg .pm-lb { font-size: 11px; fill-opacity: .8; }
.pm-way { fill: none; stroke: var(--gold); stroke-width: 3; stroke-linecap: round; }
.pm-tk { fill: var(--pm-u); fill-opacity: .85; }
.pm-tc { fill: var(--pm-u); fill-opacity: .45; stroke: var(--pm-u); stroke-width: 1; }
.pm-dg { stroke: var(--gold); stroke-width: 1.6; stroke-dasharray: 4 2.5; }
.pm-fr { color: var(--paper); }
.pm-fr text { fill: currentColor; }
.pm-svg .pm-fr text { font-size: 11px; }
.pm-fr path { stroke: currentColor; stroke-width: 1.2; }
.pm-svg .pm-say { font-size: 12px; }
.pm-svg .pm-sum { font-size: 14px; }
.pm-svg .pm-g { fill: var(--gold); }
.pm-svg .pm-st { text-anchor: start; }
''' + L.css()

anim_row.write_anim('peri', html=html, css=css, whole=True, place=dict(
    book_id='TB-KS2-MATHS', chapter=14, title='Area and perimeter', about='Perimeter|Area'))
