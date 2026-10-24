# Negative numbers on a thermometer — colder, warmer, and the difference across zero (KS2 Year 6; GCSE
# Maths chapter 1, on its negatives line, until the KS2 book has a number chapter). Writes its whole row of
# data/textbooks.json through tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE: change it and re-run.
# Run: python3 tools/neg.py
#
# WHAT IT SHOWS. SATs ask negatives as temperatures, and the step that goes wrong is crossing zero. So every
# change is split AT zero: down to 0 first, then the rest — 4 − 7 is "4 down to 0, then 3 more". Three on
# one 33s loop: 4°C getting 7° colder; −5°C warming by 8°; the difference between −6°C and 4°C (6 up to 0
# and 4 more: 10). The thermometer's level falls or rises with a gold pointer beside it, the part of the
# change down to (or up to) zero is this drawing's blue, the part past zero the app's green, and the answer gold.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num

P = 'ng'
W, VH = 240, 186
Y0, DY = 18, 7.2                # where +10 is, and one degree
TX = 50                         # the tube's middle
RX = 160                        # the right-hand panel's middle
L = anim_row.Loop(P, [11, 11, 11])
Y = lambda v: Y0 + (10 - v) * DY
BULB = Y(-10) + 12


def t_(x, y, s, cls=''):
    return '<text%s x="%s" y="%s">%s</text>' % (' class="%s"' % cls if cls else '', num(x), num(y), s)


def sg(v):
    return '−%d' % -v if v < 0 else str(v)


def tube():
    out = '<rect class="ng-tb" x="%s" y="%s" width="12" height="%s" rx="6"/><circle class="ng-tb" cx="%s" cy="%s" r="9"/>' % (
        TX - 6, Y0 - 6, num(BULB - Y0 + 6), TX, num(BULB))
    out += '<path class="ng-tk" d="%s"/>' % ''.join('M%s %sh%s' % (TX + 6, num(Y(v)), 5 if v % 2 else 8) for v in range(-10, 11))
    out += ''.join(t_(TX - 10, Y(v) + 3.5, sg(v), 'ng-lb' + (' ng-z' if v == 0 else '')) for v in range(-10, 11, 2))
    out += '<path class="ng-zl" d="M%s %sH%s"/>' % (TX + 6, num(Y(0)), TX + 30)
    return out


def level(a, b, v0, v1):
    """The red column from the bulb to v1, and the pointer beside it, drawn there. They move in two stages
    as the arrows do: to 0 at a, then on to v1 at b — two nested moves, scaled about the bulb."""
    h = lambda v: BULB - Y(v)
    o = '%spx %spx' % (TX, num(BULB))
    col = '<rect class="ng-hg" x="%s" y="%s" width="6" height="%s"/>' % (TX - 3, num(Y(v1)), num(h(v1)))
    col = '<g class="ng-mvs ng-vb"%s>%s</g>' % (L.st(a, t0='scale(1,%s)' % num(h(v0) / h(0)), o=o), col)
    col = '<g class="ng-mvs ng-vb"%s>%s</g>' % (L.st(b, t0='scale(1,%s)' % num(h(0) / h(v1)), o=o), col)
    ptr = '<path class="ng-pt" d="M%s %sl10 -5v10z"/>' % (TX + 14, num(Y(v1)))
    ptr = '<g class="ng-mvs"%s>%s</g>' % (L.st(a, t0='translate(0,%spx)' % num(Y(v0) - Y(0))), ptr)
    ptr = '<g class="ng-mvs"%s>%s</g>' % (L.st(b, t0='translate(0,%spx)' % num(Y(0) - Y(v1))), ptr)
    return col + '<circle class="ng-hg" cx="%s" cy="%s" r="6"/>' % (TX, num(BULB)) + ptr


def hop(a, v0, v1, cls):
    """An arrow beside the scale from v0 to v1, drawn out from v0."""
    down = v1 < v0
    return '<path class="ng-hp %s ng-mv"%s d="M%s %sV%s"/>' % (cls, L.st(a, t0='scale(1,0)', o='0 0' if down else '0 100%'), TX + 34, num(Y(v0)), num(Y(v1)))


def say(a, b, s, y):
    return L.step(a, b, t_(RX, y, s, 'ng-say'))


def change(k, v0, d, line1, line2):
    L.at(k)
    v1 = v0 + d
    p = [tube(), t_(RX, 34, line1, 'ng-q'), t_(RX, 52, line2, 'ng-q')]
    p.append(level(1.4, 3.6, v0, v1))
    p.append(hop(1.4, v0, 0, 'ng-u'))
    p.append(say(1.6, None, '%s %s to 0' % (sg(v0), 'down' if d < 0 else 'up'), 86))
    p.append(hop(3.6, 0, v1, 'ng-n'))
    p.append(say(3.8, None, 'then %d more: <tspan class="ng-g">%s</tspan>' % (abs(v1), sg(v1)), 106))
    p.append(L.step(6, None, t_(RX, 146, '%s %s %d = <tspan class="ng-g">%s</tspan>' % (sg(v0), '−' if d < 0 else '+', abs(d), sg(v1)), 'ng-sum')))
    p.append(L.step(6.4, None, t_(RX, 168, '%d + %d = %d degrees' % (abs(v0), abs(v1), abs(d)), 'ng-say ng-dim')))
    return L.scene(k, ''.join(p))


def diff(k, a, b):
    L.at(k)
    p = [tube(), t_(RX, 34, 'the difference', 'ng-q'), t_(RX, 52, 'from %s°C to %d°C?' % (sg(a), b), 'ng-q')]
    p.append('<rect class="ng-hg" x="%s" y="%s" width="6" height="%s"/><circle class="ng-hg" cx="%s" cy="%s" r="6"/>' % (
        TX - 3, num(Y(a)), num(BULB - Y(a)), TX, num(BULB)))
    p.append(L.step(.6, None, '<path class="ng-mk" d="M%s %sh24M%s %sh24"/>' % (TX + 22, num(Y(a)), TX + 22, num(Y(b)))))
    p.append(hop(1.6, a, 0, 'ng-u'))
    p.append(say(1.8, None, '%s up to 0: %d' % (sg(a), -a), 86))
    p.append(hop(3.6, 0, b, 'ng-n'))
    p.append(say(3.8, None, '0 up to %d: %d' % (b, b), 106))
    p.append(L.step(6, None, t_(RX, 146, '%d + %d = <tspan class="ng-g">%d°C</tspan>' % (-a, b, b - a), 'ng-sum')))
    p.append(L.step(6.4, None, t_(RX, 168, '%d − %s = %d' % (b, '(−%d)' % -a, b - a), 'ng-say ng-dim')))
    return L.scene(k, ''.join(p))


scenes = [change(0, 4, -7, 'It is 4°C.', 'It gets 7° colder.'),
          change(1, -5, 8, 'It is −5°C.', 'It warms up 8°.'),
          diff(2, -6, 4)]
html = ('<div class="an-neg" aria-hidden="true">\n  <svg class="ng-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + s for s in scenes)))

css = '''.an-neg { --ng-u: #6fa8dc; }
.ng-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.ng-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.ng-tb { fill: var(--paper); fill-opacity: .08; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1; }
.ng-tk { stroke: var(--paper); stroke-opacity: .55; stroke-width: 1; }
.ng-svg .ng-lb { font-size: 10px; font-weight: 600; text-anchor: end; fill-opacity: .8; }
.ng-svg .ng-z { font-size: 11px; font-weight: 700; fill-opacity: 1; }
.ng-zl { stroke: var(--paper); stroke-opacity: .5; stroke-width: 1; stroke-dasharray: 2 2; }
.ng-hg { fill: var(--coral); }
.ng-pt { fill: var(--gold); }
.ng-svg .ng-vb { transform-box: view-box; }
.ng-hp { stroke-width: 3; stroke-linecap: round; }
.ng-hp.ng-u { stroke: var(--ng-u); }
.ng-hp.ng-n { stroke: var(--green); }
.ng-mk { stroke: var(--gold); stroke-width: 1.2; stroke-dasharray: 3 2; }
.ng-svg .ng-q { font-size: 12px; fill: var(--gold); }
.ng-svg .ng-say { font-size: 12px; }
.ng-svg .ng-dim { fill-opacity: .7; }
.ng-svg .ng-sum { font-size: 16px; }
.ng-svg .ng-g { fill: var(--gold); }
''' + L.css()

anim_row.write_anim('neg', html=html, css=css, whole=True, place=dict(
    book_id='TB-GCSE-MATHS', chapter=1, title='Negative numbers', about='−3 × −5'))
