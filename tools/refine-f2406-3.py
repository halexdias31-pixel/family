"""
JUNE 2024 FOUNDATION PAPER 3 (CALCULATOR), CHECKED QUESTION BY QUESTION AGAINST THE PRINTED PAPER.

Asked for by the tutor as "the papers i do typically something is always wrong like your diagrams
or something. i just want it to be good." So every row of `RS1786302107764-419` was compared with
`Question paper - Paper 3F - June 2024.pdf` (P76926A) and `Mark scheme - Paper 3F - June 2024.pdf`,
both in Drive, rendered page by page and read.

WHAT WAS WRONG, IN SHORT:

  TEN PICTURES THE PAPER PRINTS WERE NEVER DRAWN, and each row described its picture in a `lead`
  instead -- *"A bar chart of methods of travel ..."*, *"A circle drawn on the page."* A student
  cannot read a bar off a sentence, and three of those sentences were the only thing on the card.
  Every one is drawn here from the PDF's own vector geometry (`page.get_drawings()`), so positions,
  shapes and labels are the paper's rather than a guess, and the sentence that stood in for each is
  gone -- a description beside its own picture is the second source CLAUDE.md warns about.

  FOUR SHARED STEMS SAT ON PART (a) ONLY, so part (b) could not be read on its own: Q6(b) asked for
  a map length with no scale anywhere on its card; Q7(b) asked "How many more?" with no chart;
  Q24(b) asked for a plan of "the solid prism" with no prism; Q27(b) asked for P(both heads) with
  neither probability. Each stem is a question-scoped preamble now.

  TWO TABLES WERE PROSE (Q13's two-way table, Q14's drinks), and are tables.

  THE MARKING HAD THREE CELLS THAT TOLD A CHILD THE WRONG THING -- see ACCEPTS below. The worst is
  Q5: `markParts_` SORTS a comma list before comparing, so an ordering question with an `accept`
  marks the answer in the WRONG order right. CLAUDE.md already says an ordering has no `accept`.

Run once. It refuses a second run, because it inserts preamble rows.
"""
import json
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgplot import W                       # noqa: E402  the one place the scale lives

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.path.join(HERE, 'data', 'questions.json')
PAPER = 'RS1786302107764-419'
PFX = 'Q-1MA1-2406-3F-'
NOT_SCALE = 'Diagram NOT accurately drawn'


def svg(body, h, label):
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>' % (W, h, label, body))


def ln(x1, y1, x2, y2, w=1.4, extra=''):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
            'stroke-width="%s"%s/>' % (x1, y1, x2, y2, w, extra))


def txt(x, y, s, cls='num', anchor='middle', size=None):
    """Inline style, never the `text-anchor` attribute: `.qsheet .num { text-anchor: middle }` beats
       a presentation attribute, which CLAUDE.md records costing ten centred y-axis numbers."""
    st = 'text-anchor:%s' % anchor + (';font-size:%spx' % size if size else '')
    return '<text x="%.1f" y="%.1f" class="%s" style="%s">%s</text>' % (x, y, cls, st, s)


def it(s):
    return '<tspan class="lbl">%s</tspan>' % s


def dot(x, y, r=2.4):
    return '<circle cx="%.1f" cy="%.1f" r="%s" fill="currentColor"/>' % (x, y, r)


def head(x, y, ang, size=7.0):
    """An arrowhead as a filled triangle -- never a <marker>, whose id would repeat on a page that
       holds several cards (CLAUDE.md, the square ABCD)."""
    a = math.radians(ang)
    bx, by = x - size * math.cos(a), y - size * math.sin(a)
    px, py = -math.sin(a) * size * 0.45, math.cos(a) * size * 0.45
    return ('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor"/>'
            % (x, y, bx + px, by + py, bx - px, by - py))


def coordgrid(xs, ys, cx, cy, left, top, xlab, ylab, size=11, xstep=1.0):
    """A squared coordinate grid with both axes, as Edexcel prints it. `xs`/`ys` are the grid's
       edges in units; `cx`/`cy` are pixels per unit. Returns (body, X, Y, height)."""
    x0, x1 = xs
    y0, y1 = ys
    X = lambda v: left + (v - x0) * cx           # noqa: E731
    Y = lambda v: top + (y1 - v) * cy            # noqa: E731
    b = ''
    v = x0
    while v <= x1 + 1e-9:
        b += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" ' \
             'stroke-width=".6" opacity=".45"/>' % (X(v), Y(y1), X(v), Y(y0))
        v += xstep
    for k in range(int(round((y1 - y0))) + 1):
        yv = y0 + k
        b += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" ' \
             'stroke-width=".6" opacity=".45"/>' % (X(x0), Y(yv), X(x1), Y(yv))
    # axes, with the arrowheads the paper prints
    b += ln(X(x0), Y(0), X(x1) + 10, Y(0), 1.3) + head(X(x1) + 12, Y(0), 0)
    b += ln(X(0), Y(y0), X(0), Y(y1) - 10, 1.3) + head(X(0), Y(y1) - 12, -90)
    b += txt(X(x1) + 14, Y(0) + 13, it('x'), 'lbl', 'middle')
    b += txt(X(0) - 9, Y(y1) - 6, it('y'), 'lbl', 'middle')
    for k in xlab:
        b += txt(X(k) - 3, Y(0) + 13, ('&minus;%d' % -k) if k < 0 else str(k), anchor='middle',
                 size=size)
    for k in ylab:
        b += txt(X(0) - 4, Y(k) + 4, ('&minus;%d' % -k) if k < 0 else str(k), anchor='end',
                 size=size)
    b += txt(X(0) - 5, Y(0) + 12, '<tspan style="font-style:italic">O</tspan>', anchor='end',
             size=size)
    return b, X, Y, Y(y0)


def poly(pts, X, Y, fill=True):
    p = ' '.join('%.1f,%.1f' % (X(a), Y(b)) for a, b in pts)
    return ('<polygon points="%s" fill="currentColor" fill-opacity="%s" stroke="currentColor" '
            'stroke-width="2"/>' % (p, '.22' if fill else '0'))


def table(head_, rows, first_is_head=True):
    h = ''.join('<th scope="col">%s</th>' % c for c in head_)
    b = ''
    for r in rows:
        cells = ''.join('<td>%s</td>' % c for c in r[1:])
        b += ('<tr><th scope="row">%s</th>%s</tr>' % (r[0], cells)) if first_is_head else \
            '<tr>%s</tr>' % ''.join('<td>%s</td>' % c for c in r)
    return '<table><thead><tr>%s</tr></thead><tbody>%s</tbody></table>' % (h, b)


# ================================================================================================
# Q7  -- the bar chart. Heights read off the PDF's own bar lines (page 4): each bar is a vector
#        line whose top lands exactly on a gridline, so the numbers are the paper's, not estimates.
# ================================================================================================
Q7 = [('Bus', 9), ('Car', 7), ('Cycle', 3), ('Walk', 8), ('Other', 1)]
assert max(Q7, key=lambda t: t[1])[0] == 'Bus'                       # (a) the mode
assert dict(Q7)['Walk'] - dict(Q7)['Cycle'] == 5                     # (b)


def q7():
    L, R, T, B = 74.0, 330.0, 12.0, 212.0
    u = (B - T) / 10.0
    b = ''
    for k in range(11):
        y = B - k * u
        b += ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
              'stroke-width=".6" opacity=".4"/>' % (L, y, R, y))
        b += ln(L - 4, y, L, y, 1) + txt(L - 7, y + 4, str(k), anchor='end', size=12)
    b += ln(L, T, L, B, 1.3) + ln(L, B, R, B, 1.3)
    step = (R - L) / 5.0
    for i, (name, n) in enumerate(Q7):
        x = L + step * (i + 0.5)
        b += ln(x, B, x, B - n * u, 4.5)
        b += txt(x, B + 17, name, size=12)
    b += txt((L + R) / 2.0, B + 37, 'Method of travel', size=12)
    for j, w in enumerate(['Number', 'of', 'students']):
        b += txt(30, 98 + j * 15, w, size=12)
    return svg(b, 258, 'A bar chart of how students travel to school. Number of students from 0 '
                       'to 10 up the side, five bars along the bottom: Bus, Car, Cycle, Walk and '
                       'Other.')


# ================================================================================================
# Q10 -- two circles, each with its centre marked. The chord's ends are the paper's: from the
#        centre, one is down and to the left at 225 degrees, the other just below the right edge.
# ================================================================================================
def q10a():
    cx, cy, r = 170.0, 84.0, 72.0
    b = ('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="currentColor" '
         'stroke-width="1.4"/>' % (cx, cy, r)) + dot(cx, cy)
    return svg(b, 168, 'A circle with its centre marked by a dot.')


Q10_CHORD = [(258.0 - 297.6, 431.8 - 392.1), (353.8 - 297.6, 395.1 - 392.1)]   # PDF, r = 56.2
Q10_R_PDF = 56.15
for dx, dy in Q10_CHORD:
    assert abs(math.hypot(dx, dy) - Q10_R_PDF) < 0.6, 'the chord must end ON the circle'
# and it must not pass through the centre, or it would be a diameter and the answer would change
_a, _b = Q10_CHORD
assert abs(_a[0] * _b[1] - _a[1] * _b[0]) / math.hypot(_b[0] - _a[0], _b[1] - _a[1]) > 15


def q10b():
    cx, cy, r = 170.0, 84.0, 72.0
    k = r / Q10_R_PDF
    (ax, ay), (bx, by) = [(cx + dx * k, cy + dy * k) for dx, dy in Q10_CHORD]
    b = ('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="currentColor" '
         'stroke-width="1.4"/>' % (cx, cy, r)) + dot(cx, cy) + ln(ax, ay, bx, by, 1.4)
    return svg(b, 168, 'A circle with its centre marked by a dot, and a straight line inside it '
                       'joining two points on the circle. The line does not pass through the '
                       'centre.')


# ================================================================================================
# Q14 -- the circle the pie chart is drawn in, with the one radius the paper starts it from.
# ================================================================================================
Q14 = [('Coffee', 30), ('Hot chocolate', 10), ('Tea', 50)]
assert [n * 360 // sum(v for _, v in Q14) for _, n in Q14] == [120, 40, 200]


def q14():
    cx, cy, r = 170.0, 124.0, 112.0
    b = ('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="currentColor" '
         'stroke-width="1.3"/>' % (cx, cy, r)) + ln(cx, cy, cx, cy - r, 1.3)
    return svg(b, 248, 'A circle with one radius drawn from the centre straight up, ready for '
                       'a pie chart.')


# ================================================================================================
# Q18 -- two coordinate grids, -6 to 6 both ways, as page 14 and 15 print them.
# ================================================================================================
Q18_SHAPE = [(1, 4), (5, 4), (4, 2), (2, 2)]
assert sorted((-x, -y) for x, y in Q18_SHAPE) == sorted([(-4, -2), (-2, -2), (-1, -4), (-5, -4)])
Q18_A = [(0, 4), (3, 4), (3, 6), (2, 6), (2, 5), (0, 5)]
Q18_MIKE = [(0, 1), (2, 1), (2, 0), (3, 0), (3, 2), (0, 2)]
# Mike's shape IS shape A reflected in y = 3 -- which is the explanation the scheme wants.
assert sorted((x, 6 - y) for x, y in Q18_A) == sorted(Q18_MIKE)
NUMS6 = [k for k in range(-6, 7) if k]


def grid18():
    return coordgrid((-6, 6), (-6, 6), 22.0, 22.0, 40.0, 22.0, NUMS6, NUMS6)


def q18a():
    b, X, Y, bot = grid18()
    b += poly(Q18_SHAPE, X, Y)
    return svg(b, bot + 12, 'A coordinate grid, x and y from minus 6 to 6. A shaded shape has '
                            'corners at (1, 4), (5, 4), (4, 2) and (2, 2).')


def q18b():
    b, X, Y, bot = grid18()
    b += poly(Q18_A, X, Y) + poly(Q18_MIKE, X, Y)
    b += '<text x="%.1f" y="%.1f" style="text-anchor:middle;font:700 13px serif;fill:' \
         'currentColor">A</text>' % (X(2.5), Y(4.5) + 5)
    return svg(b, bot + 12, 'A coordinate grid, x and y from minus 6 to 6. Shape A has corners '
                            'at (0, 4), (3, 4), (3, 6), (2, 6), (2, 5) and (0, 5). Mike’s '
                            'answer has corners at (0, 1), (2, 1), (2, 0), (3, 0), (3, 2) and '
                            '(0, 2).')


# ================================================================================================
# Q19 -- the grid the line is drawn on: x from -2 to 3 with two squares to a unit, y from -9 to 9
#        with one square to a unit, measured off page 16 (the x numbers sit every second line).
# ================================================================================================
def q19():
    cy = 15.0
    b, X, Y, bot = coordgrid((-2.5, 3.5), (-9, 9), 2 * cy, cy, 68.0, 22.0,
                             [-2, -1, 1, 2, 3], [k for k in range(-9, 10) if k], xstep=0.5)
    return svg(b, bot + 12, 'A blank coordinate grid. x from minus 2 to 3, y from minus 9 to 9.')


# all six points the scheme tabulates must be on that grid
assert all(-9 <= 3 * x - 2 <= 9 for x in range(-2, 4))


# ================================================================================================
# Q20 -- triangles ABC and BCD, from page 17's own coordinates (scaled 1.9).
# ================================================================================================
Q20_PDF = {'A': (241.5, 246.0), 'B': (355.1, 246.0), 'C': (263.0, 178.8), 'D': (345.4, 99.7)}
# the scheme's own working, asserted: ABC = 18, BCD = 72, CBD = 54, and 18 : 54 = 1 : 3
assert 180 - 2 * 81 == 18 and 4 * 18 == 72 and (180 - 72) / 2 == 54 and 54 / 18 == 3


def q20():
    P = {k: ((x - 222.0) * 1.9, (y - 88.0) * 1.9) for k, (x, y) in Q20_PDF.items()}
    A, B, C, D = P['A'], P['B'], P['C'], P['D']
    b = ln(*A, *B) + ln(*A, *C) + ln(*C, *B) + ln(*C, *D) + ln(*D, *B)

    def tick(p, q):
        mx, my = (p[0] + q[0]) / 2.0, (p[1] + q[1]) / 2.0
        dx, dy = q[0] - p[0], q[1] - p[1]
        n = math.hypot(dx, dy)
        nx, ny = -dy / n * 7, dx / n * 7
        return ln(mx - nx, my - ny, mx + nx, my + ny, 1.3)
    b += tick(A, B) + tick(B, C) + tick(C, D)
    # the 81 degree arc at A, from AB round to AC
    r = 46.0
    ac = math.atan2(C[1] - A[1], C[0] - A[0])
    sx, sy = A[0] + r, A[1]
    ex, ey = A[0] + r * math.cos(ac), A[1] + r * math.sin(ac)
    b += ('<path d="M %.1f %.1f A %.1f %.1f 0 0 0 %.1f %.1f" fill="none" stroke="currentColor" '
          'stroke-width="1.1"/>' % (sx, sy, r, r, ex, ey))
    b += txt(A[0] + 27, A[1] - 13, '81°', size=13)
    b += txt(A[0] - 10, A[1] + 12, it('A')) + txt(B[0] + 10, B[1] + 12, it('B'))
    b += txt(C[0] - 12, C[1] - 2, it('C')) + txt(D[0] - 6, D[1] - 6, it('D'))
    b += txt(W / 2.0, 330, NOT_SCALE, 'cap')
    return svg(b, 340, 'Two triangles, ABC and BCD, sharing the side BC. AB, BC and CD are marked '
                       'equal. Angle CAB is marked 81 degrees.')


# ================================================================================================
# Q24 -- the prism (shared by both parts), Rana's wrong side elevation, and the blank 1 cm grid.
#        Prism vertices from page 20's vectors; Rana's rectangle is 7 squares by 4 on a 12 by 8
#        grid, starting 2 squares in and 2 down -- which is the 7 cm by 4 cm the explanation needs.
# ================================================================================================
def q24_prism():
    f = lambda x, y: ((x - 160.0) * 1.2, (y - 76.0) * 1.2)      # noqa: E731
    fl, fr, fa = f(168.8, 186.9), f(273.7, 186.9), f(221.3, 127.0)     # front triangle
    bl, br, ba = f(258.2, 147.5), f(363.2, 147.5), f(310.7, 87.6)      # back triangle
    dash = ' stroke-dasharray="4 3"'
    b = ln(*fl, *fr) + ln(*fr, *fa) + ln(*fa, *fl)                     # front face
    b += ln(*fa, *ba) + ln(*ba, *br) + ln(*fr, *br)                    # ridge, back slant, base
    b += ln(*fl, *bl, 1.2, dash) + ln(*bl, *br, 1.2, dash) + ln(*bl, *ba, 1.2, dash)
    t0, t1 = f(427.2, 192.2), f(374.1, 174.6)                          # the arrow, pointing in
    ang = math.degrees(math.atan2(t1[1] - t0[1], t1[0] - t0[0]))
    b += ln(*t0, t1[0] + 5 * math.cos(math.radians(ang)) * -1,
            t1[1] + 5 * math.sin(math.radians(ang)) * -1, 1.3) + head(t1[0], t1[1], ang, 9)
    b += txt(*f(178.0, 150.0), '4 cm', anchor='end', size=12)
    b += txt(*f(214.0, 198.0), '6 cm', size=12)
    b += txt(*f(320.5, 174.0), '7 cm', anchor='start', size=12)
    b += txt(*f(341.0, 113.0), '4 cm', anchor='start', size=12)
    return svg(b, 152, 'A solid triangular prism lying on one rectangular face. The triangle at '
                       'each end has two sloping sides of 4 cm and a base of 6 cm; the prism is '
                       '7 cm long. An arrow points at the prism from the right, along its length.')


def cmgrid(rect=None):
    c, L, T = 26.0, 14.0, 6.0
    b = ''
    for i in range(13):
        b += ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
              'stroke-width=".7" opacity=".5"/>' % (L + i * c, T, L + i * c, T + 8 * c))
    for j in range(9):
        b += ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
              'stroke-width=".7" opacity=".5"/>' % (L, T + j * c, L + 12 * c, T + j * c))
    if rect:
        x, y, w, h = rect
        b += ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" '
              'stroke="currentColor" stroke-width="2.2"/>' % (L + x * c, T + y * c, w * c, h * c))
    return b, T + 8 * c + 6


Q24_RANA = (2, 2, 7, 4)
assert (Q24_RANA[2], Q24_RANA[3]) == (7, 4), 'Rana drew the 7 cm length by the 4 cm SLOPE'


def q24a():
    b, h = cmgrid(Q24_RANA)
    return svg(b, h, 'Rana’s answer on a centimetre grid, 12 squares by 8: a rectangle 7 '
                     'squares wide and 4 squares tall.')


def q24b():
    b, h = cmgrid()
    return svg(b, h, 'A blank centimetre grid, 12 squares by 8.')


# ================================================================================================
# Q27 -- the tree, from page 23's own coordinates (shifted left 130, up 158). The four blanks are
#        dotted lines where the paper prints them; 0.6 and 0.55 are the two given.
# ================================================================================================
def q27():
    f = lambda x, y: (x - 130.0, y - 158.0)                  # noqa: E731
    b = ''
    for (x0, y0), (x1, y1) in [((136.6, 324.2), (243.5, 252.9)), ((136.6, 324.2), (243.5, 395.5)),
                               ((301.5, 254.3), (408.2, 200.9)), ((301.5, 254.3), (408.2, 307.6)),
                               ((301.5, 397.6), (408.2, 344.2)), ((301.5, 397.6), (408.2, 451.0))]:
        b += ln(*f(x0, y0), *f(x1, y1), 1.2)
    for (x, y), s in [((247.0, 257.0), 'heads'), ((247.0, 401.0), 'not heads'),
                      ((411.3, 203.0), 'heads'), ((411.3, 313.0), 'not heads'),
                      ((411.3, 347.0), 'heads'), ((411.3, 457.0), 'not heads')]:
        b += txt(*f(x, y), s, anchor='start', size=12)
    for (x, y), s in [((262.0, 175.0), 'coin A'), ((427.0, 175.0), 'coin B')]:
        b += '<text x="%.1f" y="%.1f" style="text-anchor:middle;font:700 12px serif;fill:' \
             'currentColor">%s</text>' % (f(x, y)[0], f(x, y)[1], s)
    b += txt(*f(172.9, 277.0), '0.6', size=12) + txt(*f(337.1, 216.5), '0.55', size=12)
    for x, y in [(154.2, 381.0), (318.9, 299.0), (318.9, 361.0), (318.9, 442.0)]:
        x0, y0 = f(x, y)
        b += ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
              'stroke-width="1.2" stroke-dasharray="1 2.5"/>' % (x0, y0, x0 + 41, y0))
    return svg(b, 306, 'A probability tree diagram. Coin A branches to heads, marked 0.6, and '
                       'not heads, with a blank. From each, coin B branches to heads and not '
                       'heads; the top heads branch is marked 0.55 and the other three are blank.')


# ================================================================================================
# Q28 -- the paddling pool. The ellipse is deepened so it reads as a cylinder at phone size (the
#        paper's is nearly flat); the radius and depth arrows sit where page 24 puts them.
# ================================================================================================
def q28():
    cx, rx, ry, top, bot = 150.0, 125.0, 13.0, 30.0, 98.0
    e = lambda y, sweep, dash='': ('<path d="M %.1f %.1f A %.1f %.1f 0 0 %d %.1f %.1f" '  # noqa
                                   'fill="none" stroke="currentColor" stroke-width="1.3"%s/>'
                                   % (cx - rx, y, rx, ry, sweep, cx + rx, y, dash))
    b = e(top, 1) + e(top, 0)                              # the whole top rim
    b += e(bot, 0) + e(bot, 1, ' stroke-dasharray="4 3"')  # front of the base solid, back dashed
    b += ln(cx - rx, top, cx - rx, bot, 1.3) + ln(cx + rx, top, cx + rx, bot, 1.3)
    # the radius, broken where its label sits, as the paper prints it
    b += dot(cx, top) + ln(cx, top, 196, top, 1.1) + ln(254, top, cx + rx - 6, top, 1.1)
    b += head(cx + rx, top, 0, 7) + txt(225, top + 4, '100 cm', size=12)
    b += ln(290, top + 6, 290, bot - 6, 1.1) + head(290, top, -90, 7) + head(290, bot, 90, 7)
    b += txt(296, (top + bot) / 2.0 + 4, '30 cm', anchor='start', size=12)
    return svg(b, 118, 'A paddling pool in the shape of a cylinder. The radius of the top is '
                       'marked 100 cm and the depth is marked 30 cm.')


# volume -> seconds -> minutes, the scheme's own figures
_v = math.pi * 100 ** 2 * 30
assert round(_v) == 942478 and round(_v / 250) == 3770 and 62 <= _v / 250 / 60 <= 63


# ================================================================================================
# THE ROWS
# ================================================================================================
# LANGUAGES DOWN, YEARS ACROSS. The paper prints it the other way round, and five columns in a
# 320px card put Spanish and Total off the right-hand edge -- a screenshot showed it. A two-way table
# reads the same either way round; every cell keeps its own row and column.
# The year headings break onto two lines and the cells take half the stylesheet's side padding,
# because even turned round the table was 23px too wide for a 320px card.
Q13_TABLE = table(['', 'Year<br>10', 'Year<br>11', 'Total'],
                  [['French', '33', '', ''],
                   ['German', '', '45', ''],
                   ['Spanish', '34', '', '67'],
                   ['Total', '', '113', '207']]).replace(
    '<th ', '<th style="padding:.35rem .45rem" ').replace(
    '<td>', '<td style="padding:.35rem .45rem">')
# the scheme's completed table, from the six it gives
_y10, _y11 = [33, 27, 34], [35, 45, 33]
assert sum(_y10) == 207 - 113 and sum(_y11) == 113 and _y10[2] + _y11[2] == 67
assert sum(_y10) + sum(_y11) == 207

Q14_TABLE = table(['Drink', 'Number of people'], [[d, str(n)] for d, n in Q14])

# Rows that change. Each value is a dict of fields to SET; None removes a field.
# `diagram` values are the names of the drawing functions above.
EDIT = {
    '3': dict(html='<p>Write down the value of the 3 in the number 62&nbsp;837</p>'),
    '6a': dict(lead=None),
    '7a': dict(html='<p>Write down which method of travel is the mode.</p>', lead=None,
               figure=None, answer_type='short'),
    '7b': dict(figure=None, answer_type='short'),
    '10a': dict(html='<p>On the diagram above, draw a radius of the circle.</p>',
                lead='<p>Here is a circle.</p>', diagram='q10a', figure=None,
                answer_type='drawing'),
    '10b': dict(lead='<p>Here is another circle.</p>', diagram='q10b', figure=None,
                answer_type='short'),
    '13': dict(html='<p>James asks students in Year 10 and Year 11 to name their favourite '
                    'language from French or German or Spanish.</p><p>The two-way table shows '
                    'information about his results.</p>' + Q13_TABLE +
                    '<p>Complete the two-way table.</p>', lead=None, figure=None,
               answer='<b>French: 33, 35, total 68. German: 27, 45, total 72. Spanish: 34, 33, '
                      'total 67. Totals: 94, 113, 207.</b> &mdash; B3 for all six missing values, '
                      'B2 for four or five, B1 for two or three. Start with a line that has only '
                      'one gap. Spanish: 67 &minus; 34 = <b>33</b> in Year 11. Year 11 then has '
                      'only French missing: 113 &minus; 45 &minus; 33 = <b>35</b>. The Year 10 '
                      'total is 207 &minus; 113 = <b>94</b>, so Year 10 German is 94 &minus; 33 '
                      '&minus; 34 = <b>27</b>. Then the language totals: French 33 + 35 = '
                      '<b>68</b>, German 27 + 45 = <b>72</b>. Check: 68 + 72 + 67 = 207.'),
    '14': dict(html='<p>The table gives information about the drinks people ordered in a '
                    'cafe.</p>' + Q14_TABLE + '<p>Draw an accurate pie chart for this '
                    'information.</p>', lead=None, diagram='q14', figure=None,
               answer_type='drawing'),
    '18a': dict(lead=None, diagram='q18a', figure=None, answer_type='drawing'),
    '18b': dict(lead=None, diagram='q18b', figure=None, answer_type='explain'),
    '19': dict(lead=None, diagram='q19', figure=None, answer_type='drawing'),
    '20': dict(lead='<p><i>ABC</i> and <i>BCD</i> are isosceles triangles.</p>', diagram='q20',
               figure=None),
    '24a': dict(html='<p>Rana is trying to draw the side elevation of the solid prism from the '
                     'direction of the arrow.</p><p>Here is her answer on a centimetre grid.</p>'
                     '<p>Explain why Rana&rsquo;s side elevation is not correct.</p>',
                lead=None, diagram='q24a', figure=None, answer_type='explain'),
    '24b': dict(diagram='q24b', figure=None, answer_type='drawing'),
    '27a': dict(html='<p>Complete the probability tree diagram.</p>', lead=None, diagram='q27',
                figure=None, answer_type='annotate'),
    '28': dict(html='<p>The pool has radius 100 cm.<br>The pool has depth 30 cm.</p>'
                    '<p>The pool is empty. It is then filled with water at a rate of 250 '
                    'cm<sup>3</sup> per second.</p><p>Work out the number of minutes it takes to '
                    'fill the pool completely. Give your answer correct to the nearest minute. '
                    'You must show all your working.</p>',
               lead='<p>A paddling pool is in the shape of a cylinder.</p>', diagram='q28',
               figure=None),
}

# ---- THE MARKING ------------------------------------------------------------------------------
# Every value below was run through the app's own `markAnswer_` (js/check-marks-load.js) against
# the right answer AND the obvious wrong one, before being written.
ACCEPTS = {
    # "tens, " had a stray comma, and the scheme also takes "thirty". NOT "3 tens": `markBare_`
    # strips a trailing word, so that alternative would mark a bare "3" right.
    '3': 'tens | ten | 30 | thirty',
    # The scheme says "Allow a3".
    '4': '3a | a3',
    # AN ORDERING HAS NO `accept`. `markParts_` sorts the parts before comparing, so with a cell
    # here "2/3, 1/2, 1/4" -- the order reversed -- was marked RIGHT. Measured, not argued.
    '5': '',
    # The scheme refuses an answer with no unit ("Must include correct units"), and `markBare_`
    # strips the unit off the accepted value, so "2.5" was marked right -- and "25 mm", which the
    # scheme accepts, was marked wrong. A person reads this one.
    '6b': '',
    '10b': 'chord',
    '16a': 'm^4 | m4',
    '16b': '5x + 2y | 2y + 5x',
    '17': '180 g butter, 300 g flour, 75 g sugar | butter 180, flour 300, sugar 75 '
          '| 180 g, 300 g, 75 g | 180g, 300g, 75g | 180, 300, 75',
    '23b': '3.42 × 10^7 | 3.42*10^7',
    # "29 775 or 29 776 or 29 780 or 29 800" -- the scheme's own A1 list.
    '25': '29 775 | 29 776 | 29 780 | 29 800',
    '26': '2 g/cm^3 | 2',
    # "A1 for answer in the range 62 to 63", so 62.8 -- the unrounded answer -- is right too.
    '28': '63 | 62 to 63',
    '29b': 'h = 3p + 5 | h = 5 + 3p',
}

# ---- THE PREAMBLES: a stem part (b) needs, moved off part (a) so it is said once ----------------
PREAMBLES = [
    dict(q='6', after='6a', html='<p>A map has a scale of 1 cm represents 4 km.</p>',
         diagram=None, topics=None),
    dict(q='7', after='7a', html='<p>Julie asks some students how they travel to school.<br>The '
                                 'chart shows her results.</p>', diagram='q7', figure='bar-chart',
         topics=None),
    dict(q='24', after='24a', html='<p>The diagram shows a solid triangular prism.</p>',
         diagram='q24_prism', figure='3d-shape', topics=None),
    dict(q='27', after='27a', html='<p>Tim has two biased coins, coin <b>A</b> and coin <b>B</b>.'
                                   '<br>He is going to throw both coins.</p><p>The probability '
                                   'that coin <b>A</b> will land on heads is 0.6<br>The '
                                   'probability that coin <b>B</b> will land on heads is 0.55</p>',
         diagram=None, topics=None),
]

DRAWN = {}
for name, fn in [('q7', q7), ('q10a', q10a), ('q10b', q10b), ('q14', q14), ('q18a', q18a),
                 ('q18b', q18b), ('q19', q19), ('q20', q20), ('q24_prism', q24_prism),
                 ('q24a', q24a), ('q24b', q24b), ('q27', q27), ('q28', q28)]:
    s = fn()
    DRAWN[name] = s
    m = re.match(r'<svg viewBox="0 0 (\d+) ([\d.]+)"', s)
    assert m and int(m.group(1)) == W, name
    h = float(m.group(2))
    for a, bb in re.findall(r'(?:cx|x1|x2|x)="(-?[\d.]+)"[^>]*?(?:cy|y1|y2|y)="(-?[\d.]+)"', s):
        assert -1 <= float(a) <= W + 1 and -1 <= float(bb) <= h + 1, (name, a, bb, h)
    for pts in re.findall(r'points="([^"]+)"', s):
        for pair in pts.split():
            x, y = [float(v) for v in pair.split(',')]
            assert -1 <= x <= W + 1 and -1 <= y <= h + 1, (name, x, y)
    assert 'text-anchor="' not in s and '<marker' not in s, name

# ================================================================================================
# WRITE
# ================================================================================================
lines = open(FILE, encoding='utf-8').read().split('\n')
pre_by_after = {p['after']: p for p in PREAMBLES}
pre_qs = {p['q'] for p in PREAMBLES}
out, made, edited, marked = [], [], set(), set()


def dump(row, trailing):
    return json.dumps(row, ensure_ascii=False, separators=(',', ':')) + (',' if trailing else '')


def apply(row, fields):
    for k, v in fields.items():
        if v is None:
            row.pop(k, None)
        elif k == 'diagram':
            row['diagram'] = DRAWN[v]
            row['diagram_by'] = 'family'
        else:
            row[k] = v


for raw in lines:
    bare = raw.rstrip()
    trailing = bare.endswith(',')
    body = bare[:-1] if trailing else bare
    try:
        row = json.loads(body)
    except ValueError:
        out.append(raw)
        continue
    if row.get('paper_id') != PAPER:
        out.append(raw)
        continue
    rid = row.get('row_id') or ''
    if row.get('kind') == 'preamble' or rid in (PFX + q for q in pre_qs):
        raise SystemExit('%s already exists -- this script has already run against this file' % rid)
    if row.get('kind') != 'question':
        out.append(raw)
        continue
    short = rid[len(PFX):]

    if short in pre_by_after:
        p = pre_by_after[short]
        t = dict(row)
        for k in ('part', 'marks', 'answer', 'answer_type', 'accept', 'figure', 'examiner_note',
                  'lead', 'diagram', 'diagram_by'):
            t.pop(k, None)
        t['row_id'] = PFX + p['q']
        t['kind'] = 'preamble'
        t['question'] = p['q']
        t['part'] = ''
        t['marks'] = ''
        t['html'] = p['html']
        if p['topics']:
            t['topics'] = p['topics']
        if p['diagram']:
            t['diagram'] = DRAWN[p['diagram']]
            t['diagram_by'] = 'family'
        out.append(dump(t, True))
        made.append(t['row_id'])

    if short in EDIT:
        apply(row, EDIT[short])
        edited.add(short)
    if short in ACCEPTS:
        if ACCEPTS[short]:
            row['accept'] = ACCEPTS[short]
        else:
            row.pop('accept', None)
        marked.add(short)
    # the other parts of a question whose figure now lives on its preamble lose the stale label
    if str(row.get('question')) in ('7', '24') and short not in EDIT:
        row.pop('figure', None)
        edited.add(short)
    # 6(a) and 27(b): the stem is on the preamble now, so the part keeps only its own ask
    if short == '27b':
        row['html'] = ('<p>Tim throws coin <b>A</b> once and he throws coin <b>B</b> once.</p>'
                       '<p>Work out the probability that both coins land on heads.</p>')
        edited.add(short)
    out.append(dump(row, trailing))

assert sorted(made) == sorted(PFX + p['q'] for p in PREAMBLES), made
assert set(EDIT) <= edited, set(EDIT) - edited
assert set(ACCEPTS) == marked, set(ACCEPTS) ^ marked
open(FILE, 'w', encoding='utf-8').write('\n'.join(out))
print('preambles written: %s' % ', '.join(made))
print('rows edited: %s' % ', '.join(sorted(edited, key=lambda s: (int(re.sub(r'\D', '', s)), s))))
print('accept cells set: %s' % ', '.join(sorted(marked)))
print('drawings: %d' % len(DRAWN))
