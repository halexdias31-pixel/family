# Measuring an angle with a protractor — which zero to count from, and acute, right, obtuse (GCSE Maths
# chapter 13, Protractor; KS2 Year 5). Writes its whole row of data/textbooks.json through
# tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE: change it and re-run, never the row.
# Run: python3 tools/prot.py
#
# IT REPLACES an arm sweeping back and forth over a half-circle with five ticks and the word "degrees": it
# had no numbers, so it could not teach reading one. A real protractor has two scales, and the mistake is
# reading the wrong one (140° for a 40° angle). So it is drawn with both — the one whose 0 is on the right
# in paper, the one whose 0 is on the left dimmer — and the scale to read lights gold for each angle,
# chosen by where the angle's first arm lies. Three on one 30s loop: 40° (acute), 90° (right, with its
# square corner), and 130° measured from an arm on the LEFT, so the other scale. The arm sweeps from the
# first arm round to the second, the arc fills, and the foot names the angle's type.
import sys, pathlib, math; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num

P = 'pt'
W, VH = 240, 186
CX, CY, R = 120, 124, 92
YSAY, YSUM = 154, 178
L = anim_row.Loop(P, [9.5, 9, 11.5])


def pol(r, deg):
    a = math.radians(deg)
    return CX + r * math.cos(a), CY - r * math.sin(a)


def t_(x, y, s, cls=''):
    return '<text%s x="%s" y="%s">%s</text>' % (' class="%s"' % cls if cls else '', num(x), num(y), s)


def protractor(left):
    """Both scales; the one to read (0 on the left when `left`) gold."""
    x0, y0 = pol(R, 180)
    x1, y1 = pol(R, 0)
    out = '<path class="pt-bd" d="M%s %sA%s %s 0 0 1 %s %sZ"/>' % (num(x0), num(y0), R, R, num(x1), num(y1))
    tk = ''
    for d in range(0, 181, 10):
        a, b = pol(R, d), pol(R - (8 if d % 30 == 0 else 5), d)
        tk += 'M%s %sL%s %s' % (num(a[0]), num(a[1]), num(b[0]), num(b[1]))
    out += '<path class="pt-tk" d="%s"/>' % tk
    for d in range(0, 181, 30):
        up = 9 if d in (0, 180) else 0       # the ends lift off the baseline, where the arms lie
        x, y = pol(R - 17, d)
        out += t_(x, y + 3.5 - up, d, 'pt-a' + ('' if left else ' pt-on'))
        x, y = pol(R - 31, d)
        out += t_(x, y + 3.5 - up, 180 - d, 'pt-b' + (' pt-on' if left else ''))
    return out + '<circle class="pt-c" cx="%s" cy="%s" r="2.2"/>' % (CX, CY)


def say(a, b, s):
    return L.step(a, b, t_(W / 2, YSAY, s, 'pt-say'))


def scene(k, ang, left, kind):
    L.at(k)
    start = 180 if left else 0
    end = 180 - ang if left else ang
    p = [L.g('in', .3, protractor(left))]
    ax, ay = pol(R + 6, start)
    p.append('<path class="pt-arm" d="M%s %sL%s %s"/>' % (CX, CY, num(ax), num(ay)))
    # the second arm, drawn where it ends, swept round from the first
    bx, by = pol(R + 6, end)
    turn = (end - start)                     # counter-clockwise in degrees, so clockwise on screen is negative
    p.append('<path class="pt-arm pt-mvs pt-vb"%s d="M%s %sL%s %s"/>' % (L.st(2.6, t0='rotate(%sdeg)' % turn, o='%spx %spx' % (CX, CY)), CX, CY, num(bx), num(by)))
    # the arc between them, and a right angle's square
    r = 24
    lo, hi = min(start, end), max(start, end)
    if ang == 90:
        s1, s2 = pol(14, lo), pol(14, hi)
        c = pol(14 * math.sqrt(2), (lo + hi) / 2)
        arc = '<path class="pt-sq" d="M%s %sL%s %sL%s %s"/>' % (num(s1[0]), num(s1[1]), num(c[0]), num(c[1]), num(s2[0]), num(s2[1]))
    else:
        a1, a2 = pol(r, lo), pol(r, hi)
        arc = '<path class="pt-arc" d="M%s %sL%s %sA%s %s 0 0 0 %s %sZ"/>' % (CX, CY, num(a1[0]), num(a1[1]), r, r, num(a2[0]), num(a2[1]))
    p.insert(1, L.step(4.5, None, arc))
    lx, ly = pol(r + 14, (lo + hi) / 2)
    p.append(L.step(4.7, None, t_(lx, ly + 4, '%d°' % ang, 'pt-g')))
    p.append(say(.3, 2.5, 'centre on the corner, 0 on an arm'))
    p.append(say(2.6, 4.6, 'count up from the 0 on %s' % ('the left' if left else 'the right')))
    p.append(say(4.7, None, {'acute': 'less than 90°: acute', 'right': 'a quarter turn: a right angle', 'obtuse': 'between 90° and 180°: obtuse'}[kind]))
    p.append(L.step(5.4, None, t_(W / 2, YSUM, '<tspan class="pt-g">%d°</tspan>, %s' % (ang, kind), 'pt-sum')))
    return L.scene(k, ''.join(p))


scenes = [scene(0, 40, False, 'acute'), scene(1, 90, False, 'right'), scene(2, 130, True, 'obtuse')]
html = ('<div class="an-prot" aria-hidden="true">\n  <svg class="pt-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + s for s in scenes)))

css = '''.pt-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.pt-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.pt-bd { fill: var(--paper); fill-opacity: .06; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.2; }
.pt-tk { stroke: var(--paper); stroke-opacity: .6; stroke-width: 1; }
.pt-svg .pt-a { font-size: 10px; fill-opacity: .9; }
.pt-svg .pt-b { font-size: 10px; fill-opacity: .45; }
.pt-svg .pt-on { fill: var(--gold); fill-opacity: 1; }
.pt-c { fill: var(--paper); }
.pt-arm { stroke: var(--paper); stroke-width: 2.4; stroke-linecap: round; }
.pt-svg .pt-vb { transform-box: view-box; }
.pt-arc { fill: var(--gold); fill-opacity: .35; stroke: var(--gold); stroke-width: 1.4; }
.pt-sq { fill: none; stroke: var(--gold); stroke-width: 1.6; }
.pt-svg .pt-g { fill: var(--gold); }
.pt-svg .pt-say { font-size: 12px; }
.pt-svg .pt-sum { font-size: 15px; }
''' + L.css()

anim_row.write_anim('prot', html=html, css=css, whole=True, place=dict(
    book_id='TB-KS2-MATHS', chapter=15, title='Protractor', about='Protractor'))
