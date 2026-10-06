"""
THE TWO 2017 HIGHER PAPER 1s, AUDITED QUESTION BY QUESTION AGAINST THE PRINTED PAPERS.

ASKED FOR AS *"for [a student] i like to do higher maths papers. im just scared as the papers i do
typically something is always wrong like your diagrams or something. i just want it to be good."*
Both papers -- Edexcel 1MA1/1H May 2017 (`P-1MA1-1705-1H`) and November 2017 (`P-1MA1-1711-1H`)
-- already had every drawing, and that was the problem: a drawing that exists is a drawing nobody
looks at again. Each was laid beside the question paper out of Drive and rendered page by page.

THE PDFs ARE THE SOURCE OF TRUTH AND EVERY FIGURE BELOW WAS MEASURED OFF THEIR VECTORS, not
eyeballed off a screenshot -- `page.get_drawings()` gives every line, curve and cross the paper
prints in points, and the constants below ARE those points. CLAUDE.md's rule for a picture that
carries data: measured, not read by eye.

WHAT WAS WRONG, AND IT WAS NOT SMALL:

  May Q1    every half-unit cross was drawn 0.1 to the LEFT (9.4 for 9.5, 12.4 for 12.5 ...), the
            grid had no minor squares to draw a line of best fit on, and the prose above the graph
            printed the outlier's position -- part (a)'s whole answer.
  May Q5    the diagonal ran the other way and the right-angle marks were missing.
  May Q11   one-unit grid on a question that asks for roots to a tenth and f(1.5) to a tenth; the
            prose said where the curve crosses, which is part (b).
  May Q18   a DIAMOND with horizontal and vertical diagonals. The paper's rhombus is a slanted one
            on a pair of axes with no diagonals drawn -- and a horizontal DB contradicts the
            question's own y = x/2 + 6.
  May Q19   X and D drawn in, with D a short way past C. The answer is k = 2/5, which puts D
            two-and-a-half OC lengths beyond C: the picture contradicted the answer.
  May Q21   upside down (BC on top on the paper), with diagonals the paper does not draw and none of
            the equal-side ticks or equal-angle arcs the proof hangs on.
  Nov Q3    a different figure: E bottom-left, the 35 degrees in the wrong angle. On the paper E is
            above D on CD extended, F is on AD, and the arrows mark the parallel sides.
  Nov Q4    no shading and no 3 cm / 3 cm arrows -- the shaded ring IS the question.
  Nov Q7    x from -3 to 3 with dots; the paper is a -5..5 grid with crosses and a label.
  Nov Q12   (b) had no picture: the Year 7 box plot was a sentence listing its five values, which
            are the reading the question is about.
  Nov Q18   the grid stopped at y = -2 and x = -4. The image Q goes to y = -3.5: a student could
            not draw the answer.
  Nov Q19   D drawn above the x-axis and two lines from A where the paper has one; D is ON the x-axis.
  Nov Q22   rotated and relabelled, with "8 cm" sitting on the line.
  Nov Q23   2x drawn SHORTER than x.

AND THE MARKING: several `accept` cells were a sentence (`2^3 x 7, that is 2 x 2 x 2 x 7`) -- the
comma splits them into parts, so NOTHING a child typed could ever match. Others marked the
obvious right answer wrong (`0.75` against `x = 0.75`, `-0.75, 2.75` against `x = -0.75 and ...`).
Each new alternative is one the row's own answer prose already states the scheme accepts, or a
spelling of the same value; nothing wider. And NOT a bare pair where order is the point: a comma
list is compared sorted, so `10, 19` beside `(10, 19)` would mark the reversed coordinate right.

AND THE WORDS: Nov Q8's recurring dots were combining accents that sat beside the digit, Nov Q13's
shared stem was on (a) only so (b) began mid-story, and five equations broke across a line at
320px (`y` on one line, `= x/2 + 6` on the next). Each is fixed where it is written.

THE MARK SCHEMES ARE NOT IN DRIVE ANY MORE, and that is said rather than glossed. Every answer was
re-derived here (asserted below), and the bands quoted come from the rows' own scheme notes, which
were written when the schemes were open.

RUN-ONCE: it refuses to run against a file that already has the November Q13 preamble it adds.
"""
import json
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from svgplot import W                   # noqa: E402  the one place the scale lives
except ImportError:                         # run from outside tools/: the same number, stated
    W = 340
assert W == 340, 'every drawing here is laid out inside a 340-unit viewBox'

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'data', 'questions.json')
MAY, NOV = 'P-1MA1-1705-1H', 'P-1MA1-1711-1H'
M = lambda s: 'Q-1MA1-1705-1H-%s' % s       # noqa: E731
N = lambda s: 'Q-1MA1-1711-1H-%s' % s       # noqa: E731
NEW_PRE = 'S-P-1MA1-1711-1H-q13'


# ================================================================================================
# DRAWING PRIMITIVES -- currentColor ink, inline text-anchor (CSS beats the attribute), no ids
# ================================================================================================
def svg(body, h, label):
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>'
            % (W, h, label, body))


def ln(x1, y1, x2, y2, w=1.4, dash='', op=''):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
            'stroke-width="%s"%s%s/>' % (x1, y1, x2, y2, w,
                                         (' stroke-dasharray="%s"' % dash) if dash else '',
                                         (' opacity="%s"' % op) if op else ''))


def gl(x1, y1, x2, y2):
    return '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="grid"/>' % (x1, y1, x2, y2)


def tx(x, y, s, cls='num', anchor='middle', size=None, extra=''):
    st = 'text-anchor:%s' % anchor + (';font-size:%spx' % size if size else '') + extra
    return '<text x="%.1f" y="%.1f" class="%s" style="%s">%s</text>' % (x, y, cls, st, s)


def poly(pts, fill='none', w=1.4, op=None, closed=True):
    d = ' '.join('%.1f,%.1f' % p for p in pts)
    tag = 'polygon' if closed else 'polyline'
    return ('<%s points="%s" fill="%s"%s stroke="currentColor" stroke-width="%s" '
            'stroke-linejoin="round"/>' % (tag, d, fill,
                                           (' fill-opacity="%s"' % op) if op is not None else '', w))


def head(tx_, ty_, fx, fy, size=7.0, half=3.0):
    """A filled arrowhead with its tip at (tx_, ty_), pointing away from (fx, fy). A triangle and
       not a <marker>: a marker needs an id, and five cards in the DOM is five copies of one id."""
    a = math.atan2(ty_ - fy, tx_ - fx)
    bx, by = tx_ - size * math.cos(a), ty_ - size * math.sin(a)
    nx, ny = -math.sin(a) * half, math.cos(a) * half
    return ('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor"/>'
            % (tx_, ty_, bx + nx, by + ny, bx - nx, by - ny))


def chevron(cx, cy, ang, n=1, size=5.0, gap=4.0):
    """The open arrow-marks a paper puts on parallel sides: n chevrons pointing along `ang`."""
    out = []
    ca, sa = math.cos(ang), math.sin(ang)
    for k in range(n):
        off = (k - (n - 1) / 2.0) * gap
        px, py = cx + off * ca, cy + off * sa
        bx, by = px - size * ca, py - size * sa
        nx, ny = -sa * size * 0.55, ca * size * 0.55
        out.append('<polyline points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" '
                   'stroke="currentColor" stroke-width="1.2"/>'
                   % (bx + nx, by + ny, px, py, bx - nx, by - ny))
    return ''.join(out)


def cross(cx, cy, r=3.2):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
            '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
            % (cx - r, cy - r, cx + r, cy + r, cx - r, cy + r, cx + r, cy - r))


def arc(cx, cy, r, a1, a2, w=1.2):
    """A circular arc about (cx, cy) from angle a1 to a2 (degrees, anticlockwise on the PAGE, i.e.
       y up), the short way."""
    p1 = (cx + r * math.cos(math.radians(a1)), cy - r * math.sin(math.radians(a1)))
    p2 = (cx + r * math.cos(math.radians(a2)), cy - r * math.sin(math.radians(a2)))
    large = 1 if ((a2 - a1) % 360) > 180 else 0
    return ('<path d="M%.1f %.1f A%.1f %.1f 0 %d 0 %.1f %.1f" fill="none" stroke="currentColor" '
            'stroke-width="%s"/>' % (p1[0], p1[1], r, r, large, p2[0], p2[1], w))


class Map(object):
    """Paper points -> picture units. One scale and one offset per figure, so every vertex keeps
       the place the paper gave it relative to every other."""
    def __init__(self, x0, y0, s, ox, oy):
        self.x0, self.y0, self.s, self.ox, self.oy = x0, y0, s, ox, oy

    def __call__(self, x, y):
        return (self.ox + (x - self.x0) * self.s, self.oy + (y - self.y0) * self.s)


def ang(p, q):
    return math.atan2(q[1] - p[1], q[0] - p[0])


# ================================================================================================
# HTML HELPERS
# ================================================================================================
def frac(n, d):
    return ('<span class="frac"><span class="frac-n">%s</span><span class="frac-d">%s</span></span>'
            % (n, d))


def rdot(d):
    """A recurring-decimal dot over ONE digit. The combining dot (&#775;) the rows used sat beside
       the digit in this font and read as an accent; a dot positioned over the digit is what the
       paper prints."""
    return ('<span style="position:relative;display:inline-block">%s<span aria-hidden="true" '
            'style="position:absolute;left:0;right:0;top:-.38em;text-align:center;'
            'font-size:.6em;line-height:1">&bull;</span></span>' % d)


def vec(s):
    """A vector printed with an arrow over its two letters, as the paper prints OA and OC.
       No `scaleX` on the arrow: a transform paints outside the box it is laid out in, and on a
       320px card the arrow over a vector at the start of a line ran 5px past the column."""
    return ('<span style="position:relative;display:inline-block;padding-top:.15em">'
            '<span aria-hidden="true" style="position:absolute;left:0;right:0;top:-.5em;'
            'text-align:center;line-height:1;font-size:.85em">&rarr;</span>'
            '<i>%s</i></span>' % s)


def nw(s):
    """One expression, one line. A browser breaks a line at any space, so `y = ½x + 6` arrived
       as `y` at the end of one line and `= ½x + 6` at the start of the next, and the `x²` after
       a stacked fraction dropped onto a line of its own -- found on a 320px screenshot."""
    return '<span style="white-space:nowrap">%s</span>' % s


def products(*forms):
    """Every spelling of one product a phone produces: `x` and `*` are not folded by the marker,
       and neither are the spaces round them, so each is listed both ways."""
    out = []
    for f in forms:                     # f uses ' × ' between factors
        for sep in (' × ', ' x ', 'x', ' * ', '*'):
            v = f.replace(' × ', sep)
            if v not in out:
                out.append(v)
    return ' | '.join(out)


# ================================================================================================
# MAY 2017 1H
# ================================================================================================
# ---- Q1: the scatter graph. Crosses measured off the paper's own vectors -----------------------
#      page 2: x = 7 is the y-axis at 186.42 pt, one unit is 1 cm = 28.35 pt, y = 10 is the x-axis
#      at 501.17 pt. These are the fourteen cross centres the PDF prints (n = 8 segments each).
Q1_PDF = [(257.53, 458.90), (271.69, 246.02), (282.73, 416.42), (285.37, 444.98),
          (300.13, 388.10), (300.14, 416.42), (313.93, 359.66), (328.09, 359.66),
          (342.25, 331.34), (356.77, 303.62), (384.85, 274.94), (399.01, 246.02),
          (413.41, 217.94), (421.69, 217.94)]
Q1_X0, Q1_Y0, Q1_U = 186.42, 501.17, 28.35
Q1_PTS = [(round((x - Q1_X0) / Q1_U + 7, 1), round((Q1_Y0 - y) / Q1_U + 10, 1)) for x, y in Q1_PDF]
assert len(Q1_PTS) == 14, 'fourteen British towns'
for (x, y), (px, py) in zip(Q1_PTS, Q1_PDF):
    assert abs((px - Q1_X0) / Q1_U + 7 - x) < 0.05 and abs((Q1_Y0 - py) / Q1_U + 10 - y) < 0.05
assert Q1_PTS == [(9.5, 11.5), (10.0, 19.0), (10.4, 13.0), (10.5, 12.0), (11.0, 14.0),
                  (11.0, 13.0), (11.5, 15.0), (12.0, 15.0), (12.5, 16.0), (13.0, 17.0),
                  (14.0, 18.0), (14.5, 19.0), (15.0, 20.0), (15.3, 20.0)], Q1_PTS
# the outlier, part (a): the one point far above the run of the other thirteen
assert (10.0, 19.0) in Q1_PTS


def q1():
    u = 25.0
    L, T = 58.0, 18.0
    R, B = L + 10 * u, T + 11 * u
    X = lambda v: L + (v - 7) * u          # noqa: E731
    Y = lambda v: B - (v - 10) * u         # noqa: E731
    p = []
    for i in range(51):                    # minor squares of 0.2, as printed
        x = L + i * u / 5
        p.append(gl(x, T, x, B))
    for i in range(56):
        y = T + i * u / 5
        p.append(gl(L, y, R, y))
    for i in range(11):
        p.append(ln(L + i * u, T, L + i * u, B, w=.7, op='.45'))
    for i in range(12):
        p.append(ln(L, T + i * u, R, T + i * u, w=.7, op='.45'))
    p.append(ln(L, B, R + 12, B, w=1.3) + head(R + 14, B, L, B))
    p.append(ln(L, B, L, T - 8, w=1.3) + head(L, T - 10, L, B))
    for v in range(7, 18, 2):
        p.append(tx(X(v), B + 15, str(v)))
    for v in range(10, 21, 2):
        p.append(tx(L - 6, Y(v) + 4, str(v), anchor='end'))
    for x, y in Q1_PTS:
        p.append(cross(X(x), Y(y)))
    p.append(tx((L + R) / 2, B + 34, 'Number of hours of sunshine', cls='cap'))
    p.append('<text x="13" y="%.1f" class="cap" style="text-anchor:middle" '
             'transform="rotate(-90 13 %.1f)">Maximum temperature (&deg;C)</text>'
             % ((T + B) / 2, (T + B) / 2))
    return svg(''.join(p), B + 44,
               'A scatter graph of maximum temperature in degrees Celsius, from 10 to 21, against '
               'number of hours of sunshine, from 7 to 17, with fourteen crosses plotted on a grid '
               'of small squares.')


# ---- Q5: the frame. Paper page 6: rectangle 204.67..354.92 x 88.20..181.45, right-angle marks
#      at top-left and bottom-right, diagonal from bottom-left to top-right. -------------------
def q5():
    m = Map(204.67, 88.20, 1.55, 54.0, 18.0)
    a, b = m(204.67, 88.20), m(354.92, 181.45)
    s = 8.5 * 1.55
    p = [poly([a, (b[0], a[1]), b, (a[0], b[1])]),
         ln(a[0], b[1], b[0], a[1]),
         poly([a, (a[0] + s, a[1]), (a[0] + s, a[1] + s), (a[0], a[1] + s)], w=1),
         poly([b, (b[0] - s, b[1]), (b[0] - s, b[1] - s), (b[0], b[1] - s)], w=1),
         tx(b[0] + 8, (a[1] + b[1]) / 2 + 4, '5 m', anchor='start'),
         tx((a[0] + b[0]) / 2, b[1] + 18, '12 m')]
    return svg(''.join(p), b[1] + 28,
               'A rectangle with one diagonal from the bottom left corner to the top right corner. '
               'The bottom side is 12 m and the right side is 5 m. Two corners carry right-angle '
               'marks.')


# ---- Q11: y = f(x). The curve is the paper's own polyline, all 53 vertices, in points on page 10;
#      the axes cross at (234.68, 283.19), one x unit is 2 cm = 56.693 pt and one y unit 1 cm. ------
Q11_PDF = [(121.29, 113.11), (126.85, 130.51), (133.37, 149.73), (142.04, 173.71),
           (152.59, 200.76), (158.43, 214.87), (164.66, 229.1), (171.24, 243.27),
           (178.04, 257.17), (185.13, 270.54), (192.44, 283.19), (201.85, 298.55),
           (211.78, 313.69), (216.99, 321.0), (222.38, 328.03), (227.99, 334.72),
           (233.83, 341.07), (239.95, 346.85), (246.36, 352.12), (252.99, 356.83),
           (260.02, 360.74), (267.33, 363.97), (275.04, 366.3), (279.07, 367.15),
           (283.15, 367.77), (287.35, 368.11), (291.65, 368.23), (295.91, 368.06),
           (300.1, 367.66), (304.13, 367.04), (308.1, 366.13), (315.75, 363.75),
           (323.01, 360.52), (329.92, 356.55), (336.56, 351.84), (342.85, 346.57),
           (348.86, 340.73), (354.64, 334.44), (360.2, 327.75), (365.47, 320.77),
           (370.63, 313.46), (380.44, 298.44), (389.74, 283.19), (397.05, 270.54),
           (404.08, 257.11), (410.94, 243.22), (417.51, 229.04), (423.75, 214.82),
           (429.65, 200.7), (440.19, 173.66), (448.92, 149.73), (455.55, 130.51),
           (461.17, 113.11)]
Q11_PTS = [((x - 234.68) / 56.693, (283.19 - y) / 28.3465) for x, y in Q11_PDF]


def q11_at(xv):
    for (a, b), (c, d) in zip(Q11_PTS, Q11_PTS[1:]):
        if a <= xv <= c:
            return b + (d - b) * (xv - a) / (c - a)


def q11_roots():
    out = []
    for (a, b), (c, d) in zip(Q11_PTS, Q11_PTS[1:]):
        if b * d <= 0 and b != d:
            r = a + (c - a) * (0 - b) / (d - b)
            if not out or abs(out[-1] - r) > 1e-6:     # a vertex ON the axis ends one segment and
                out.append(r)                           # starts the next: one root, not two
    return out


assert abs(Q11_PTS[0][0] + 2) < .01 and abs(Q11_PTS[0][1] - 6) < .01          # (-2, 6)
assert abs(Q11_PTS[-1][0] - 4) < .01 and abs(Q11_PTS[-1][1] - 6) < .01         # (4, 6)
_low = min(Q11_PTS, key=lambda t: t[1])
assert abs(_low[0] - 1) < .01 and abs(_low[1] + 3) < .01, _low                 # (a) (1, -3)
_r = q11_roots()
assert len(_r) == 2 and -0.8 <= _r[0] <= -0.7 and 2.7 <= _r[1] <= 2.8, _r      # (b) the scheme's bands
assert -2.8 <= q11_at(1.5) <= -2.75, q11_at(1.5)                                # (c) -2.8 off the grid


def q11():
    ux, uy = 46.0, 23.0
    L, T = 40.0, 22.0
    R, B = L + 6 * ux, T + 10 * uy
    X = lambda v: L + (v + 2) * ux         # noqa: E731
    Y = lambda v: B - (v + 4) * uy         # noqa: E731
    p = []
    for i in range(61):                    # x minor 0.1, as printed
        x = L + i * ux / 10
        p.append(gl(x, T, x, B))
    for i in range(51):                    # y minor 0.2
        y = T + i * uy / 5
        p.append(gl(L, y, R, y))
    for i in range(13):                    # majors every 0.5 across and 1 up, as printed
        p.append(ln(L + i * ux / 2, T, L + i * ux / 2, B, w=.7, op='.45'))
    for i in range(11):
        p.append(ln(L, T + i * uy, R, T + i * uy, w=.7, op='.45'))
    p.append(ln(L, Y(0), R + 10, Y(0), w=1.3) + head(R + 12, Y(0), L, Y(0)))
    p.append(ln(X(0), B, X(0), T - 10, w=1.3) + head(X(0), T - 12, X(0), B))
    p.append(tx(R + 18, Y(0) + 4, '<tspan class="lbl">x</tspan>', anchor='start'))
    p.append(tx(X(0) - 10, T - 6, '<tspan class="lbl">y</tspan>'))
    for v in (-2, -1, 1, 2, 3, 4):
        p.append(tx(X(v), Y(0) + 14, ('&minus;%d' % -v) if v < 0 else str(v)))
    p.append(tx(X(0) - 7, Y(0) + 14, '<tspan style="font-style:italic">O</tspan>', anchor='end'))
    for v in range(-4, 7):
        if v:
            p.append(tx(X(0) - 5, Y(v) + 4, ('&minus;%d' % -v) if v < 0 else str(v), anchor='end'))
    p.append(poly([(X(a), Y(b)) for a, b in Q11_PTS], w=1.6, closed=False))
    return svg(''.join(p), B + 8,
               'The graph of y = f(x) on a grid of small squares, x from minus 2 to 4 and y from '
               'minus 4 to 6: a U-shaped curve.')


# ---- Q15: the formula box, as printed beside the question (page 13). --------------------------
def q15():
    m = Map(323.74, 62.21, 1.3, 22.0, 8.0)
    a, b = m(323.74, 62.21), m(552.38, 130.90)
    p = [poly([a, (b[0], a[1]), b, (a[0], b[1])], w=1)]
    mid = (a[1] + b[1]) / 2 + 4
    p.append(tx(a[0] + 14, mid, 'Volume of cone =', anchor='start'))
    fx = a[0] + 124
    p.append(tx(fx, mid - 9, '1'))
    p.append(ln(fx - 6, mid - 4, fx + 6, mid - 4, w=1))
    p.append(tx(fx, mid + 10, '3'))
    p.append(tx(fx + 9, mid, '&pi;<tspan style="font-style:italic">r</tspan>'
                '<tspan dy="-6" style="font-size:9px">2</tspan>'
                '<tspan dy="6" style="font-style:italic">h</tspan>', anchor='start'))
    # the cone: apex, the two sides, the base ellipse (back half dashed), its centre, r and h
    apex, lft, rgt = m(508.36, 72.26), m(484.93, 113.84), m(531.79, 113.84)
    cx, cy = m(508.36, 113.84)
    rx, ry = (rgt[0] - lft[0]) / 2, 6.3 * 1.3 / 1.0 * 0.62
    p.append(ln(apex[0], apex[1], lft[0], lft[1], w=1.1) + ln(apex[0], apex[1], rgt[0], rgt[1], w=1.1))
    p.append('<path d="M%.1f %.1f A%.1f %.1f 0 0 0 %.1f %.1f" fill="none" stroke="currentColor" '
             'stroke-width="1.1"/>' % (lft[0], cy, rx, ry, rgt[0], cy))
    p.append('<path d="M%.1f %.1f A%.1f %.1f 0 0 1 %.1f %.1f" fill="none" stroke="currentColor" '
             'stroke-width="1" stroke-dasharray="3 2"/>' % (lft[0], cy, rx, ry, rgt[0], cy))
    p.append('<circle cx="%.1f" cy="%.1f" r="1.3" fill="currentColor"/>' % (cx, cy))
    p.append(ln(cx, cy, rgt[0] - 4, cy, w=.9) + head(rgt[0] - 1, cy, cx, cy, size=5, half=2.2))
    p.append(tx((cx + rgt[0]) / 2 - 2, cy + 14, '<tspan style="font-style:italic">r</tspan>'))
    hx = m(535.18, 0)[0] + 4
    p.append(ln(apex[0], apex[1], hx + 4, apex[1], w=.8))
    p.append(ln(hx, apex[1] + 5, hx, cy - 5, w=.9) + head(hx, apex[1], hx, cy, size=5, half=2.2)
             + head(hx, cy, hx, apex[1], size=5, half=2.2))
    p.append(tx(hx + 6, (apex[1] + cy) / 2 + 4, '<tspan style="font-style:italic">h</tspan>',
                anchor='start'))
    return svg(''.join(p), b[1] + 8,
               'A box giving the formula: volume of cone equals one third pi r squared h, beside a '
               'small cone with its height h and base radius r marked.')


# ---- Q18: the rhombus on axes, page 15. No diagonals: the paper draws none. -------------------
def q18():
    m = Map(178.0, 64.0, 1.3, 18.0, 12.0)
    O = m(191.77, 253.65)
    A, B_, C, D = m(240.0, 86.7), m(363.4, 86.7), m(328.3, 203.1), m(211.0, 203.1)
    xe, ye = m(409.48, 253.65), m(191.77, 74.43)
    p = [ln(O[0], O[1], xe[0], xe[1], w=1.1) + head(xe[0] + 2, xe[1], O[0], O[1], size=6, half=2.6),
         ln(O[0], O[1], ye[0], ye[1], w=1.1) + head(ye[0], ye[1] - 2, O[0], O[1], size=6, half=2.6),
         poly([A, B_, C, D]),
         tx(A[0] - 3, A[1] - 7, 'A', cls='lbl'), tx(B_[0] + 3, B_[1] - 7, 'B', cls='lbl'),
         tx(C[0] + 2, C[1] + 17, 'C', cls='lbl'), tx(D[0] - 4, D[1] + 17, 'D', cls='lbl'),
         tx(O[0] - 10, O[1] + 14, 'O', cls='lbl'), tx(xe[0] + 12, xe[1] + 5, 'x', cls='lbl'),
         tx(ye[0] - 12, ye[1] + 4, 'y', cls='lbl')]
    return svg(''.join(p), O[1] + 22,
               'Axes with origin O, and a rhombus A B C D drawn above the x-axis: A top left, '
               'B top right, C bottom right and D bottom left, with A B and D C horizontal.')


# the rhombus the question describes exists and its diagonal AC is the answer's
_A, _M = (5, 11), (6, 9)                    # DB: y = x/2 + 6 meets AC: y = -2x + 21 at (6, 9)
assert _M[1] == _M[0] / 2 + 6 and _M[1] == -2 * _M[0] + 21
_C = (2 * _M[0] - _A[0], 2 * _M[1] - _A[1])
_B = (10, 11)                               # on DB with AB horizontal, as the paper draws it
_D = (2 * _M[0] - _B[0], 2 * _M[1] - _B[1])
_sides = [math.dist(p, q) for p, q in ((_A, _B), (_B, _C), (_C, _D), (_D, _A))]
assert max(_sides) - min(_sides) < 1e-9, _sides    # a real rhombus: every side 5
assert _A[1] == -2 * _A[0] + 21 and _C[1] == -2 * _C[0] + 21


# ---- Q19: the parallelogram, page 16. Only OABC, a and c: X and D are for the student. --------
def q19():
    m = Map(170.0, 75.0, 1.25, 20.0, 14.0)
    O, A, B_, C = m(182.0, 194.9), m(248.0, 89.9), m(413.2, 89.9), m(347.2, 194.9)
    p = [poly([O, A, B_, C])]
    ma = ((O[0] + A[0]) / 2, (O[1] + A[1]) / 2)
    mc = ((O[0] + C[0]) / 2, (O[1] + C[1]) / 2)
    p.append(head(ma[0] + 4 * math.cos(ang(O, A)), ma[1] + 4 * math.sin(ang(O, A)), O[0], O[1]))
    p.append(head(mc[0] + 4, mc[1], O[0], O[1]))
    p.append(tx(ma[0] - 12, ma[1] - 2, '<tspan style="font-weight:700">a</tspan>'))
    p.append(tx(mc[0], mc[1] + 17, '<tspan style="font-weight:700">c</tspan>'))
    p += [tx(O[0] - 10, O[1] + 12, 'O', cls='lbl'), tx(A[0] - 2, A[1] - 8, 'A', cls='lbl'),
          tx(B_[0] + 8, B_[1] - 6, 'B', cls='lbl'), tx(C[0] + 6, C[1] + 16, 'C', cls='lbl')]
    return svg(''.join(p), O[1] + 26,
               'Parallelogram O A B C with O at the bottom left. O A is marked with an arrow and '
               'labelled a; O C is marked with an arrow and labelled c.')


# k = 2/5: OD = c + c/k, OX = (a + c)/2, XD = OD - OX = (1/2 + 1/k)c - a/2 = 3c - a/2
assert abs((0.5 + 1 / (2 / 5.0)) - 3) < 1e-12


# ---- Q21: the quadrilateral, page 18: BC on top, equal sides ticked, equal angles arced. ------
def q21():
    m = Map(185.0, 80.0, 1.42, 18.0, 10.0)
    A, B_, C, D = m(197.6, 169.4), m(236.4, 94.9), m(356.9, 94.9), m(395.7, 169.4)
    p = [poly([A, B_, C, D])]
    s = 1.42
    # the two angle arcs, radius 19.4 pt on the paper, inside the angle at B and at C
    r = 19.4 * s
    aBA = math.degrees(math.atan2(-(A[1] - B_[1]), A[0] - B_[0]))      # page angle (y up)
    aCD = math.degrees(math.atan2(-(D[1] - C[1]), D[0] - C[0]))
    p.append(arc(B_[0], B_[1], r, aBA, 0))
    p.append(arc(C[0], C[1], r, 180, aCD))
    # the double ticks on AB and on CD, at the middle of each side
    for P, Q in ((A, B_), (C, D)):
        mx, my = (P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2
        a = ang(P, Q)
        nx, ny = -math.sin(a) * 6, math.cos(a) * 6
        for off in (-2.6, 2.6):
            cx, cy = mx + off * math.cos(a), my + off * math.sin(a)
            p.append(ln(cx - nx, cy - ny, cx + nx, cy + ny, w=1.1))
    p += [tx(A[0] - 9, A[1] + 6, 'A', cls='lbl'), tx(B_[0] - 4, B_[1] - 7, 'B', cls='lbl'),
          tx(C[0] + 5, C[1] - 7, 'C', cls='lbl'), tx(D[0] + 10, D[1] + 6, 'D', cls='lbl')]
    return svg(''.join(p), A[1] + 18,
               'Quadrilateral A B C D with B C along the top and A D along the bottom. A B and C D '
               'each carry two tick marks, and the angles at B and at C are each marked with an '
               'arc.')


# ---- Q22: the hexagon, page 19. BE dashed; P and Q ticked on the outside of AF and CD. --------
def q22():
    m = Map(240.0, 80.0, 1.35, 112.0, 12.0)
    B_, A, F, E = m(297.04, 93.41), m(260.86, 163.43), m(260.86, 255.05), m(297.04, 186.83)
    C, D = m(333.22, 163.43), m(333.22, 255.05)
    P, Q = m(260.86, 194.8), m(333.22, 194.8)
    p = [poly([E, F, A, B_, C, D], closed=True),
         ln(B_[0], B_[1], E[0], E[1], w=1.1, dash='5 3'),
         ln(P[0] - 5.2, P[1], P[0] + 5.2, P[1], w=1.1), ln(Q[0] - 5.2, Q[1], Q[0] + 5.2, Q[1], w=1.1)]
    p += [tx(B_[0], B_[1] - 7, 'B', cls='lbl'), tx(A[0] - 9, A[1] + 4, 'A', cls='lbl'),
          tx(C[0] + 9, C[1] + 4, 'C', cls='lbl'), tx(P[0] - 13, P[1] + 5, 'P', cls='lbl'),
          tx(Q[0] + 13, Q[1] + 5, 'Q', cls='lbl'), tx(E[0], E[1] + 18, 'E', cls='lbl'),
          tx(F[0] - 9, F[1] + 14, 'F', cls='lbl'), tx(D[0] + 9, D[1] + 14, 'D', cls='lbl')]
    return svg(''.join(p), F[1] + 22,
               'Hexagon A B C D E F shaped like an arrowhead pointing up: B at the top, A and C '
               'below it on either side, F and D at the bottom, and E the inner point between '
               'them. B E is dashed. P is marked on A F and Q on C D.')


# ================================================================================================
# NOVEMBER 2017 1H
# ================================================================================================
# ---- Q3: page 4. A, D on the top line; B, C on the bottom; E above D on CD extended; BFE straight.
def n3():
    m = Map(158.0, 68.0, 1.12, 8.0, 10.0)
    A, D = m(170.82, 141.16), m(393.39, 141.16)
    B_, C, E = m(204.54, 220.86), m(422.67, 220.86), m(372.26, 83.76)
    # F is where BE crosses AD -- computed, so it is ON both lines
    t = (141.16 - 220.86) / (83.76 - 220.86)
    F = m(204.54 + t * (372.26 - 204.54), 141.16)
    # and D really is on CE, which is what "EDC is a straight line" says
    tD = (141.16 - 220.86) / (83.76 - 220.86)
    assert abs((422.67 + tD * (372.26 - 422.67)) - 393.39) < 0.1
    p = [ln(A[0], A[1], D[0], D[1]), ln(B_[0], B_[1], C[0], C[1]), ln(B_[0], B_[1], A[0], A[1]),
         ln(C[0], C[1], E[0], E[1]), ln(B_[0], B_[1], E[0], E[1])]
    s = 1.12
    # 35 degrees at F between FE and FD; 75 degrees at C between CD and CB, radii from the paper
    aFE = math.degrees(math.atan2(-(E[1] - F[1]), E[0] - F[0]))
    p.append(arc(F[0], F[1], 49.07 * s, 0, aFE))
    aCD = math.degrees(math.atan2(-(D[1] - C[1]), D[0] - C[0]))
    p.append(arc(C[0], C[1], 29.77 * s, aCD, 180))
    p.append(tx(F[0] + 38, F[1] - 10, '35&deg;'))
    p.append(tx(C[0] - 22, C[1] - 12, '75&deg;'))
    # the parallel-side marks: >> on AD and BC, > on BA and CD (both pointing up)
    p.append(chevron((A[0] + D[0]) / 2 - 26, A[1], 0, n=2))
    p.append(chevron((B_[0] + C[0]) / 2 + 10, B_[1], 0, n=2))
    p.append(chevron((B_[0] + A[0]) / 2, (B_[1] + A[1]) / 2, ang(B_, A)))
    p.append(chevron((C[0] + D[0]) / 2, (C[1] + D[1]) / 2, ang(C, D)))
    p += [tx(A[0] - 9, A[1] - 3, 'A', cls='lbl'), tx(B_[0] - 5, B_[1] + 16, 'B', cls='lbl'),
          tx(C[0] + 9, C[1] + 13, 'C', cls='lbl'), tx(D[0] + 10, D[1] + 5, 'D', cls='lbl'),
          tx(E[0] + 2, E[1] - 7, 'E', cls='lbl'), tx(F[0] - 4, F[1] - 7, 'F', cls='lbl')]
    return svg(''.join(p), B_[1] + 24,
               'Parallelogram A B C D with A D along the top and B C along the bottom, both marked '
               'with double arrows, and B A and C D marked with single arrows. C D is extended '
               'upwards beyond D to E. A straight line from B to E crosses A D at F. The angle at '
               'F between F E and F D is 35 degrees and the angle at C between C D and C B is 75 '
               'degrees.')


assert 180 - 35 - 75 == 70                  # vertically opposite, opposite angles, triangle


# ---- Q4: three circles, centre O, radii 4, 7, 10 to scale; the 4..7 ring shaded. -------------
def n4():
    k = 10.5
    cx, cy = 170.0, 116.0
    p = ['<path d="M%.1f %.1f a%.1f %.1f 0 1 0 %.1f 0 a%.1f %.1f 0 1 0 %.1f 0 Z '
         'M%.1f %.1f a%.1f %.1f 0 1 0 %.1f 0 a%.1f %.1f 0 1 0 %.1f 0 Z" fill="currentColor" '
         'fill-opacity=".28" fill-rule="evenodd" stroke="none"/>'
         % (cx - 7 * k, cy, 7 * k, 7 * k, 14 * k, 7 * k, 7 * k, -14 * k,
            cx - 4 * k, cy, 4 * k, 4 * k, 8 * k, 4 * k, 4 * k, -8 * k)]
    for r in (4, 7, 10):
        p.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="currentColor" '
                 'stroke-width="1.3"/>' % (cx, cy, r * k))
    p.append(cross(cx, cy, 2.6))
    p.append(tx(cx - 1, cy + 15, '<tspan style="font-style:italic">O</tspan>'))
    p.append(ln(cx + 2, cy, cx + 4 * k - 6, cy, w=1) + head(cx + 4 * k, cy, cx, cy, size=6, half=2.6))
    for r0, r1 in ((4, 7), (7, 10)):
        a, b = cx + r0 * k, cx + r1 * k
        p.append(ln(a + 6, cy, b - 6, cy, w=1) + head(a, cy, b, cy, size=6, half=2.6)
                 + head(b, cy, a, cy, size=6, half=2.6))
    for r0, r1, s in ((0, 4, '4 cm'), (4, 7, '3 cm'), (7, 10, '3 cm')):
        p.append(tx(cx + (r0 + r1) / 2.0 * k + (3 if r0 == 0 else 0), cy - 6, s, size=11))
    return svg(''.join(p), cy + 10 * k + 8,
               'Three circles with the same centre O. The inner circle has radius 4 cm; the next '
               'is 3 cm further out and the outer one 3 cm further again. The ring between the '
               'inner and middle circles is shaded.')


assert (49 - 16) * 3 != 100                 # 33/100 of the logo, not a third: Daisy is wrong


# ---- Q6: a tall rectangle, page 7: y along the top, 2x + 6 left, 5x - 9 right. ----------------
def n6():
    m = Map(230.51, 94.34, 1.0, 101.0, 22.0)
    a, b = m(230.51, 94.34), m(368.76, 281.09)
    s = 8.5
    p = [poly([a, (b[0], a[1]), b, (a[0], b[1])])]
    for (x, y, dx, dy) in ((a[0], a[1], 1, 1), (b[0], a[1], -1, 1), (b[0], b[1], -1, -1),
                           (a[0], b[1], 1, -1)):
        p.append(poly([(x + dx * s, y), (x + dx * s, y + dy * s), (x, y + dy * s)], w=.9,
                      closed=False))
    my = (a[1] + b[1]) / 2 + 4
    p += [tx((a[0] + b[0]) / 2, a[1] - 7, '<tspan style="font-style:italic">y</tspan>'),
          tx(a[0] - 8, my, '2<tspan style="font-style:italic">x</tspan> + 6', anchor='end'),
          tx(b[0] + 8, my, '5<tspan style="font-style:italic">x</tspan> &minus; 9', anchor='start')]
    return svg(''.join(p), b[1] + 10,
               'A rectangle taller than it is wide, with a right-angle mark in each corner. The top '
               'side is labelled y, the left side 2x plus 6 and the right side 5x minus 9.')


assert 2 * 5 + 6 == 5 * 5 - 9 == 16 and 16 * 3 == 48


# ---- Q7: Brogan's graph, page 8. -5..5 by 0..10, squares of 0.2, crosses, straight segments. --
N7_PTS = [(-3, 10), (-2, 5), (-1, 2), (0, 1), (1, 2), (2, 5), (3, 10)]
assert all(y == x * x + 1 for x, y in N7_PTS)       # her points are right; the joins are not


def n7():
    u = 25.0
    L, T = 40.0, 24.0
    R, B = L + 10 * u, T + 10 * u
    X = lambda v: L + (v + 5) * u          # noqa: E731
    Y = lambda v: B - v * u                # noqa: E731
    p = []
    for i in range(51):
        p.append(gl(L + i * u / 5, T, L + i * u / 5, B))
        p.append(gl(L, T + i * u / 5, R, T + i * u / 5))
    for i in range(11):
        p.append(ln(L + i * u, T, L + i * u, B, w=.7, op='.45'))
        p.append(ln(L, T + i * u, R, T + i * u, w=.7, op='.45'))
    p.append(ln(L, B, R + 12, B, w=1.3) + head(R + 14, B, L, B))
    p.append(ln(X(0), B, X(0), T - 10, w=1.3) + head(X(0), T - 12, X(0), B))
    p.append(tx(R + 20, B + 4, '<tspan class="lbl">x</tspan>', anchor='start'))
    p.append(tx(X(0) - 10, T - 13, '<tspan class="lbl">y</tspan>'))
    for v in range(-5, 6):
        if v:
            p.append(tx(X(v), B + 15, ('&minus;%d' % -v) if v < 0 else str(v)))
    p.append(tx(X(0) - 3, B + 15, '<tspan style="font-style:italic">O</tspan>', anchor='end'))
    for v in range(1, 11):
        p.append(tx(X(0) - 5, Y(v) + 4, str(v), anchor='end'))
    p.append(poly([(X(x), Y(y)) for x, y in N7_PTS], w=1.6, closed=False))
    for x, y in N7_PTS:
        p.append(cross(X(x), Y(y)))
    p.append(tx(X(3) + 4, Y(10) - 6, '<tspan style="font-style:italic">y</tspan> = '
                '<tspan style="font-style:italic">x</tspan><tspan dy="-5" style="font-size:9px">'
                '2</tspan><tspan dy="5"> + 1</tspan>', anchor='middle'))
    return svg(''.join(p), B + 24,
               'Brogan\'s graph on a grid of small squares, x from minus 5 to 5 and y from 0 to '
               '10, labelled y = x squared + 1: seven crosses joined by straight lines, coming to '
               'a sharp point at (0, 1).')


# ---- Q12: the two box-plot grids, page 11. 130..180 cm, one square per cm, fifteen rows. -------
#      Year 7 box plot measured: x = 130 at 156.31 pt, 5.6693 pt per cm.
N12_PDF = [246.76, 294.95, 311.96, 354.59, 385.77]
N12_Y7 = [round(((x - 156.31) / 5.6693 + 130) * 2) / 2.0 for x in N12_PDF]
assert all(abs((x - 156.31) / 5.6693 + 130 - v) < 0.06 for x, v in zip(N12_PDF, N12_Y7))
assert N12_Y7 == [146, 154.5, 157.5, 165, 170.5], N12_Y7
assert N12_Y7[3] - N12_Y7[1] == 10.5 and N12_Y7[4] - N12_Y7[0] == 24.5   # IQR and range of (b)
assert 161 + 7 == 168 and 154 + 20 == 174                                   # (a)'s two missing values


def n12(who, box=None):
    u = 5.0
    L, T = 68.0, 10.0
    R, B = L + 50 * u, T + 15 * u
    X = lambda v: L + (v - 130) * u        # noqa: E731
    p = []
    for i in range(51):
        w, op = (.5, '.3') if i % 5 else ((.8, '.5') if i % 10 else (1.1, '.6'))
        p.append(ln(X(130 + i), T, X(130 + i), B, w=w, op=op))
    for i in range(16):
        w, op = (.5, '.3') if i % 5 else (.8, '.5')
        p.append(ln(L, T + i * u, R, T + i * u, w=w, op=op))
    p.append(ln(L, B, R + 10, B, w=1.3) + head(R + 12, B, L, B))
    for v in range(130, 181, 10):
        p.append(tx(X(v), B + 15, str(v)))
    p.append(tx((L + R) / 2, B + 31, 'height (cm)', cls='cap'))
    p.append(tx(L - 8, T + 7.5 * u + 4, who, anchor='end'))
    if box:
        lo, q1, me, q3, hi = box
        top, bot, mid = T + 5 * u, T + 10 * u, T + 7.5 * u
        p.append(poly([(X(q1), top), (X(q3), top), (X(q3), bot), (X(q1), bot)], w=1.6))
        p.append(ln(X(me), top, X(me), bot, w=1.6))
        p.append(ln(X(lo), mid, X(q1), mid, w=1.6) + ln(X(q3), mid, X(hi), mid, w=1.6))
        p.append(ln(X(lo), top, X(lo), bot, w=1.6) + ln(X(hi), top, X(hi), bot, w=1.6))
        label = ('A box plot of the heights of the Year 7 girls on a grid from 130 to 180 cm, one '
                 'small square per centimetre.')
    else:
        label = ('An empty grid from 130 to 180 cm, one small square per centimetre, labelled Year '
                 '11, for the box plot to be drawn on.')
    return svg(''.join(p), B + 40, label)


# ---- Q18: -8..8 both ways, as printed -- the image Q reaches y = -3.5. ------------------------
N18_P = [(2, 7), (2, 3), (4, 3)]
N18_Q = [(-x / 2.0, -y / 2.0) for x, y in N18_P]
assert N18_Q == [(-1, -3.5), (-1, -1.5), (-2, -1.5)]
assert all(-8 <= c <= 8 for pt in N18_Q for c in pt)    # the answer fits the grid it is drawn on


def n18():
    u = 18.0
    L, T = 26.0, 26.0
    R, B = L + 16 * u, T + 16 * u
    X = lambda v: L + (v + 8) * u          # noqa: E731
    Y = lambda v: T + (8 - v) * u          # noqa: E731
    p = []
    for i in range(17):
        p.append(ln(L + i * u, T, L + i * u, B, w=.6, op='.4'))
        p.append(ln(L, T + i * u, R, T + i * u, w=.6, op='.4'))
    p.append(ln(L, Y(0), R + 10, Y(0), w=1.3) + head(R + 12, Y(0), L, Y(0)))
    p.append(ln(X(0), B, X(0), T - 8, w=1.3) + head(X(0), T - 10, X(0), B))
    p.append(tx(R + 18, Y(0) + 4, '<tspan class="lbl">x</tspan>', anchor='start'))
    p.append(tx(X(0) - 9, T - 11, '<tspan class="lbl">y</tspan>'))
    for v in range(-8, 9):
        if v:
            s = ('&minus;%d' % -v) if v < 0 else str(v)
            p.append(tx(X(v) - 3, Y(0) + 12, s, size=10))
            p.append(tx(X(0) - 3, Y(v) + 3.5, s, anchor='end', size=10))
    p.append(tx(X(0) - 4, Y(0) + 12, '<tspan style="font-style:italic">O</tspan>', anchor='end',
                size=10))
    p.append(poly([(X(x), Y(y)) for x, y in N18_P], fill='currentColor', op=.25, w=1.6))
    p.append(tx(X(2.45), Y(4.4) + 4, '<tspan style="font-weight:700">P</tspan>'))
    return svg(''.join(p), B + 10,
               'A coordinate grid with x and y each from minus 8 to 8. Shape P is a shaded '
               'triangle with vertices at (2, 7), (2, 3) and (4, 3).')


# ---- Q19: page 16. L through A, E, B; M through A and D; D and B on the x-axis. --------------
def n19():
    m = Map(140.0, 66.0, 1.03, 10.0, 12.0)
    xs, xe = m(148.16, 229.15), m(444.0, 229.15)
    ys, ye = m(317.49, 329.46), m(317.49, 81.65)
    L1, L2 = m(202.04, 119.48), m(426.71, 245.15)
    M1, M2 = m(177.79, 260.78), m(274.73, 87.46)
    D, C, B_ = m(195.48, 229.15), m(349.83, 315.57), m(398.16, 229.15)
    p = [ln(xs[0], xs[1], xe[0] - 5, xe[1], w=1.1) + head(xe[0] + 1, xe[1], xs[0], xs[1], 6, 2.6),
         ln(ys[0], ys[1], ye[0], ye[1] + 5, w=1.1) + head(ye[0], ye[1] - 1, ys[0], ys[1], 6, 2.6),
         ln(L1[0], L1[1], L2[0], L2[1]), ln(M1[0], M1[1], M2[0], M2[1]),
         ln(D[0], D[1], C[0], C[1]), ln(C[0], C[1], B_[0], B_[1])]
    lab = lambda pdf_bbox, s, cls='lbl': tx(m((pdf_bbox[0] + pdf_bbox[2]) / 2, 0)[0],   # noqa: E731
                                            m(0, pdf_bbox[3] - 2)[1], s, cls=cls)
    p += [lab((226.6, 141.4, 233.9, 153.4), 'A'), lab((305.9, 183.9, 313.2, 195.9), 'E'),
          lab((396.6, 235.0, 403.9, 247.0), 'B'), lab((346.7, 318.2, 354.7, 330.2), 'C'),
          lab((193.0, 235.0, 201.6, 247.0), 'D'), lab((305.5, 231.1, 314.2, 243.1), 'O'),
          lab((439.2, 230.7, 444.6, 242.7), 'x'), lab((306.9, 77.6, 312.2, 89.6), 'y'),
          tx(m(195.8, 0)[0], m(0, 118.5)[1], '<tspan style="font-weight:700">L</tspan>'),
          tx(m(276.0, 0)[0], m(0, 85.0)[1], '<tspan style="font-weight:700">M</tspan>')]
    return svg(''.join(p), m(0, 335.0)[1] + 4,
               'Axes with origin O. Line L slopes down from upper left, through A, then E on the '
               'y-axis, then B on the x-axis. Line M slopes steeply up through D on the x-axis and '
               'A. Rectangle A B C D has C below the x-axis. Not drawn to scale.')


# x + 2y = 12 meets the axes at E(0, 6) and B(12, 0); AE = EB makes A = (-12, 12); M is
# perpendicular to L through A: gradient 2, so y = 2x + 36.
assert 0 + 2 * 6 == 12 and 12 + 0 == 12 and (-12) + 2 * 12 == 12
assert 12 == 2 * (-12) + 36 and 2 * (-0.5) == -1


# ---- Q22: page 18. A bottom left, C on top, D on the right; BE joins AC to AD. -------------
def n22():
    m = Map(190.0, 80.0, 1.45, 18.0, 6.0)
    A, C, D = m(214.35, 240.46), m(257.10, 99.71), m(385.10, 228.46)
    B_, E = m(234.10, 175.43), m(306.58, 233.98)
    p = [poly([A, C, D]), ln(B_[0], B_[1], E[0], E[1])]
    p += [tx(A[0] - 8, A[1] + 15, 'A', cls='lbl'), tx(B_[0] - 10, B_[1], 'B', cls='lbl'),
          tx(C[0] + 2, C[1] - 7, 'C', cls='lbl'), tx(D[0] + 11, D[1] + 5, 'D', cls='lbl'),
          tx(E[0] + 2, E[1] + 18, 'E', cls='lbl')]
    mac = ((B_[0] + C[0]) / 2, (B_[1] + C[1]) / 2)
    mab = ((A[0] + B_[0]) / 2, (A[1] + B_[1]) / 2)
    mae = ((A[0] + E[0]) / 2, (A[1] + E[1]) / 2)
    med = ((E[0] + D[0]) / 2, (E[1] + D[1]) / 2)
    p += [tx(mac[0] - 8, mac[1] + 4, '<tspan style="font-style:italic">x</tspan> cm', anchor='end'),
          tx(mab[0] - 8, mab[1] + 4, '8 cm', anchor='end'),
          tx(mae[0], mae[1] + 19, '12 cm'), tx(med[0], med[1] + 18, '3 cm')]
    return svg(''.join(p), A[1] + 24,
               'Triangle A C D with B on A C and E on A D, and a line from B to E. A B is 8 cm, '
               'B C is x cm, A E is 12 cm and E D is 3 cm.')


# the two values the two correspondences give
assert abs(8 * 15 / 12.0 - 8 - 2) < 1e-12 and abs(12 * 15 / 8.0 - 8 - 14.5) < 1e-12


# ---- Q23: page 19. Rectangle 3x - 2 by x - 1; triangle 2x up and x across, 2 : 1 as printed. --
def n23():
    m = Map(143.26, 84.0, 0.9, 40.0, 10.0)
    r0, r1 = m(143.26, 126.22), m(282.39, 201.46)
    tR, tT, tL = m(454.83, 201.46), m(396.75, 91.20), m(396.75, 201.46)
    s = 7.15 * 0.9
    p = [poly([r0, (r1[0], r0[1]), r1, (r0[0], r1[1])]), poly([tL, tT, tR]),
         poly([(tL[0] + s, tL[1]), (tL[0] + s, tL[1] - s), (tL[0], tL[1] - s)], w=.9, closed=False)]
    p += [tx((r0[0] + r1[0]) / 2, r0[1] - 8, '3<tspan style="font-style:italic">x</tspan> &minus; 2'),
          tx(r0[0] - 7, (r0[1] + r1[1]) / 2 + 4,
             '<tspan style="font-style:italic">x</tspan> &minus; 1', anchor='end'),
          tx(tL[0] - 7, (tT[1] + tL[1]) / 2 + 4, '2<tspan style="font-style:italic">x</tspan>',
             anchor='end'),
          tx((tL[0] + tR[0]) / 2, tL[1] + 17, '<tspan style="font-style:italic">x</tspan>')]
    assert abs((tL[1] - tT[1]) / (tR[0] - tL[0]) - 1.9) < 0.1, 'the 2x side is about twice the x side'
    return svg(''.join(p), tL[1] + 26,
               'A rectangle with its top side labelled 3x minus 2 and its left side x minus 1, and '
               'beside it a right-angled triangle whose vertical side is 2x and whose bottom side '
               'is x.')


# (3x - 2)(x - 1) > x^2  <=>  (2x - 1)(x - 2) > 0, and x - 1 > 0 throws away x < 1/2
for _x in (2.01, 3, 10):
    assert (3 * _x - 2) * (_x - 1) > _x * _x
for _x in (1.01, 1.5, 2):
    assert not (3 * _x - 2) * (_x - 1) > _x * _x


# ================================================================================================
# THE ANSWERS, RE-DERIVED -- the schemes are not reachable, so the arithmetic is the check
# ================================================================================================
assert 2 ** 3 * 7 == 56 and 2 ** 2 * 3 ** 2 == 36
assert 546 * 43 == 23478                                    # May Q3: 234.78
assert 12 + 12 + 5 + 5 + 13 == 47 and 47 * 1.5 == 70.5 and 5 ** 2 + 12 ** 2 == 13 ** 2
assert (30 * 60 - 20 * 54) / 10 == 72                       # May Q7
assert 252000 / 0.004 == 6.3e7                              # May Q8(b)
assert 600 / 1.2 == 500                                     # May Q9
assert (1 / 81 ** 0.5) == 1 / 9.0 and abs((64 / 125.0) ** (2 / 3.0) - 16 / 25.0) < 1e-12
assert 9 / 0.75 ** 2 == 16                                  # May Q13(b)
assert 27 * 4 / 9 + 63 * 2 / 7 == 30 and 30 / 90.0 == 1 / 3.0   # May Q14
assert abs(100 / (25 * 1.0) - 4) < 1e-12                    # May Q15(a): 100 = (1/3)(3)(25)h
assert abs(7 / 9.0 * 2 / 8 * 2 - 7 / 18.0) < 1e-12          # May Q17
for _x, _y in ((-3, 4), (-4.8, -1.4)):                      # May Q20
    assert abs(_x * _x + _y * _y - 25) < 1e-9 and abs(_y - 3 * _x - 13) < 1e-9
assert 365 * 20 == 200 * 1 + 300 * 11 + 400 * 5 + 500 * 0 + 600 * 3   # Nov Q5(a)
assert 14 + 21 + 42 == 77 and 21 == 14 + 7 and 42 == 2 * 21           # Nov Q2
assert 15 / (2 / 3.0) == 22.5 and 15 / 20.0 * 60 - 5 == 40            # Nov Q9
assert abs(3 * 1.40 + 2 * 1.80 - 7.80) < 1e-9 and abs(5 * 1.40 + 4 * 1.80 - 14.20) < 1e-9
assert 4 * 450 / 15 == 120 and abs(5.5 / 15 - 11 / 30.0) < 1e-12      # Nov Q13
assert 432 / 990.0 == 24 / 55.0                                        # Nov Q15
assert abs(7 / 12.0 * 4 - 7 / 3.0) < 1e-12                             # Nov Q16
assert abs(2 * math.cos(math.radians(45)) + 1 - (1 + 2 ** 0.5)) < 1e-12   # Nov Q20
assert abs((6 - 8 ** 0.5) / (2 ** 0.5 - 1) - (2 + 4 * 2 ** 0.5)) < 1e-9  # Nov Q21


# ================================================================================================
# WHAT GOES WHERE
# ================================================================================================
DEL = object()          # a key to remove

Q8_SET = ('0.2%s%s' % (rdot('4'), rdot('6')), '0.24%s' % rdot('6'),
          '0.%s4%s' % (rdot('2'), rdot('6')), '0.246')

EDITS = {
    # ------------------------------- MAY ------------------------------------------------------
    'S-P-1MA1-1705-1H-q1': dict(
        html='<p>The scatter graph shows the maximum temperature and the number of hours of '
             'sunshine in fourteen British towns on one day.</p>',
        diagram=q1(), diagram_by='family'),
    M('1a'): dict(
        html='<p>One of the points is an outlier.</p><p>Write down the coordinates of this '
             'point.</p>'),
    # NOT `10, 19` beside it: `markParts_` SORTS a comma list, so a bare pair is order-blind and
    # `19, 10` -- the reversed coordinate, which is the mistake this mark exists to catch -- would
    # be marked right. A bracket keeps the halves as `(10` and `19)`, which do not sort together.
    M('1b'): dict(accept='Positive correlation | Positive'),
    M('1c'): dict(
        html='<p>On the same day, in another British town, the maximum temperature was '
             '16.4&deg;C.</p><p>Estimate the number of hours of sunshine in this town on this '
             'day.</p>',
        answer='12 to 13 hours &mdash; the mark scheme takes anything in that range. Draw a line '
               'of best fit through the other thirteen points and read across from 16.4&deg;C; '
               'the neighbouring points are (12.5, 16) and (13, 17). The outlier is left out of '
               'the line, which is the whole reason part (a) asked for it',
        accept='12 to 13'),
    M('2'): dict(accept=products('2^3 × 7', '2 × 2 × 2 × 7') + ' | 2³ × 7'),
    M('5'): dict(
        html='<p>This rectangular frame is made from 5 straight pieces of metal.</p>'
             '<p>The weight of the metal is 1.5&nbsp;kg per metre.</p>'
             '<p>Work out the total weight of the metal in the frame.</p>',
        diagram=q5(), diagram_by='family'),
    M('8b'): dict(
        html='<p>Work out the value of (2.52 &times; 10<sup>5</sup>) &divide; (4 &times; '
             '10<sup>&minus;3</sup>)<br>Give your answer in standard form.</p>',
        accept='6.3 × 10^7 | 6.3 x 10^7 | 6.3x10^7 | 6.3 * 10^7 | 6.3*10^7'),
    M('9'): dict(
        html='<p>Jules buys a washing machine.</p><p>20% VAT is added to the price of the '
             'washing machine.<br>Jules then has to pay a total of &pound;600</p><p>What is the '
             'price of the washing machine with <b>no</b> VAT added?</p>'),
    'S-P-1MA1-1705-1H-q11': dict(
        html='<p>The graph of %s is drawn on the grid.</p>' % nw('<i>y</i> = f(<i>x</i>)'),
        diagram=q11(), diagram_by='family'),
    M('11a'): dict(
        html='<p>Write down the coordinates of the turning point of the graph.</p>'),
    # every reading the scheme's two bands allow at this grid's resolution, bare and as x = ...
    # (`and` folds onto a comma, so `x = a and x = b` is the second form too)
    M('11b'): dict(accept='x = −0.75 and x = 2.75 | ' + ' | '.join(
        f % (a, b) for f in ('%s, %s', 'x = %s, x = %s')
        for a in ('−0.75', '−0.7', '−0.8', '−0.73') for b in ('2.75', '2.7', '2.8', '2.73'))),
    M('12b'): dict(
        html='<p>Find the value of %s</p>'
             % nw('(%s)<sup><sup>2</sup>&frasl;<sub>3</sub></sup>' % frac('64', '125'))),
    'S-P-1MA1-1705-1H-q13': dict(
        html='<p>The table shows a set of values for <i>x</i> and <i>y</i>.</p>'
             '<table><tr><th><i>x</i></th><td>1</td><td>2</td><td>3</td><td>4</td></tr>'
             '<tr><th><i>y</i></th><td>9</td><td>2&frac14;</td><td>1</td>'
             '<td><sup>9</sup>&frasl;<sub>16</sub></td></tr></table>'
             '<p><i>y</i> is inversely proportional to the square of <i>x</i>.</p>'),
    M('13a'): dict(accept='y = 9⁄x^2 | y = 9⁄x² | y = 9x^−2'),
    M('13b'): dict(accept='x = 0.75 | 0.75 | x = 3⁄4'),
    M('14'): dict(
        html='<p>White shapes and black shapes are used in a game.<br>Some of the shapes are '
             'circles.<br>All the other shapes are squares.</p><p>The ratio of the number of '
             'white shapes to the number of black shapes is 3&nbsp;:&nbsp;7</p><p>The ratio of '
             'the number of white circles to the number of white squares is 4&nbsp;:&nbsp;5</p>'
             '<p>The ratio of the number of black circles to the number of black squares is '
             '2&nbsp;:&nbsp;5</p><p>Work out what fraction of all the shapes are circles.</p>'),
    'S-P-1MA1-1705-1H-q15': dict(
        html='<p>A cone has a volume of 98&nbsp;cm<sup>3</sup>.<br>The radius of the cone is '
             '5.13&nbsp;cm.</p>',
        diagram=q15(), diagram_by='family'),
    M('15a'): dict(html='<p>Work out an estimate for the height of the cone.</p>',
                   accept='4 cm | 3.5 to 4.5'),
    M('15b'): dict(
        html='<p>John uses a calculator to work out the height of the cone to 2 decimal '
             'places.</p><p>Will your estimate be more than John&rsquo;s answer or less than '
             'John&rsquo;s answer?<br>Give reasons for your answer.</p>'),
    M('18'): dict(
        html='<p><i>ABCD</i> is a rhombus.<br>The coordinates of <i>A</i> are (5, 11)<br>The '
             'equation of the diagonal <i>DB</i> is %s</p><p>Find an '
             'equation of the diagonal <i>AC</i>.</p>' % nw('<i>y</i> = %s<i>x</i> + 6' % frac('1', '2')),
        diagram=q18(), diagram_by='family',
        accept='y = −2x + 21 | y = 21 − 2x | 2x + y = 21 | y + 2x = 21'),
    M('19'): dict(
        html='<p><i>OABC</i> is a parallelogram.</p><p>%s and %s</p>'
             '<p><i>X</i> is the midpoint of the line <i>AC</i>.<br><i>OCD</i> is a straight '
             'line so that %s</p>'
             '<p>Given that %s</p><p>find the value of '
             '<i>k</i>.</p>' % (nw(vec('OA') + ' = <b>a</b>'), nw(vec('OC') + ' = <b>c</b>'),
                                nw('<i>OC</i> : <i>CD</i> = <i>k</i> : 1'),
                                nw(vec('XD') + ' = 3<b>c</b> &minus; %s<b>a</b>' % frac('1', '2'))),
        diagram=q19(), diagram_by='family',
        accept='k = 2⁄5 | 2⁄5 | k = 0.4'),
    M('20'): dict(accept='x = −3, y = 4 and x = −4.8, y = −1.4 | (−3, 4) and (−4.8, −1.4)'),
    M('21'): dict(
        html='<p><i>ABCD</i> is a quadrilateral.</p><p><i>AB</i> = <i>CD</i>.<br>Angle '
             '<i>ABC</i> = angle <i>BCD</i>.</p><p>Prove that <i>AC</i> = <i>BD</i>.</p>',
        diagram=q21(), diagram_by='family'),
    M('22'): dict(
        html='<p>The diagram shows a hexagon <i>ABCDEF</i>.</p><p><i>ABEF</i> and <i>CBED</i> '
             'are congruent parallelograms where ' + nw('<i>AB</i> = <i>BC</i> = <i>x</i>&nbsp;cm.') + '<br>'
             '<i>P</i> is the point on <i>AF</i> and <i>Q</i> is the point on <i>CD</i> such '
             'that ' + nw('<i>BP</i> = <i>BQ</i> = 10&nbsp;cm.') + '</p><p>Given that angle <i>ABC</i> = '
             '30&deg;,</p><p>prove that %s</p>'
             % nw('cos&nbsp;<i>PBQ</i> = 1 &minus; %s<i>x</i><sup>2</sup>'
                  % frac('(2 &minus; &radic;3)', '200')),
        diagram=q22(), diagram_by='family'),

    # ------------------------------- NOVEMBER -------------------------------------------------
    N('1'): dict(accept=products('2^2 × 3^2', '2 × 2 × 3 × 3') + ' | 2² × 3²'),
    N('2'): dict(accept='14 : 21 : 42 | 2 : 3 : 6'),
    N('3'): dict(
        html='<p><i>ABCD</i> is a parallelogram.<br><i>EDC</i> is a straight line.<br><i>F</i> '
             'is the point on <i>AD</i> so that <i>BFE</i> is a straight line.</p><p>Angle '
             '<i>EFD</i> = 35&deg;<br>Angle <i>DCB</i> = 75&deg;</p><p>Show that angle '
             '<i>ABF</i> = 70&deg;<br>Give a reason for each stage of your working.</p>',
        diagram=n3(), diagram_by='family'),
    N('4'): dict(
        html='<p>The diagram shows a logo made from three circles.</p><p>Each circle has centre '
             '<i>O</i>.</p><p>Daisy says that exactly %s of the logo is shaded.</p><p>Is Daisy '
             'correct?<br>You must show all your working.</p>' % frac('1', '3'),
        diagram=n4(), diagram_by='family'),
    N('6'): dict(
        html='<p>Here is a rectangle.</p><p>All measurements are in centimetres.</p><p>The area '
             'of the rectangle is 48&nbsp;cm<sup>2</sup>.</p><p>Show that <i>y</i> = 3</p>',
        diagram=n6(), diagram_by='family'),
    N('7'): dict(
        html='<p>Brogan needs to draw the graph of %s</p>' % nw('<i>y</i> = <i>x</i><sup>2</sup> + 1') +
             '<p>Here is her graph.</p><p>Write down one thing that is wrong with Brogan&rsquo;s '
             'graph.</p>',
        diagram=n7(), diagram_by='family'),
    N('8'): dict(
        html='<p>Write these numbers in order of size.<br>Start with the smallest number.</p>'
             '<p>%s</p>' % ' &nbsp; &nbsp; '.join(Q8_SET),
        answer='0.246, then %s, then %s, then %s. Write each one out to enough places and compare '
               'digit by digit: 0.246000&hellip;, 0.246246&hellip;, 0.246464&hellip;, '
               '0.246666&hellip;. They agree to three decimal places, so the fourth digit decides '
               'it &mdash; 0, 2, 4, 6' % (Q8_SET[2], Q8_SET[0], Q8_SET[1])),
    # every spelling NAMES which is which. Not `£1.40 and £1.80`: a comma or `and` list is
    # compared sorted, so that cell would also mark the swapped answer -- tea at £1.80 -- right.
    N('11'): dict(accept='tea £1.40, coffee £1.80 | tea 1.4, coffee 1.8 | tea = 1.40, coffee = '
                         '1.80 | tea = 1.4, coffee = 1.8 | t = 1.40, c = 1.80 | t = 1.4, c = 1.8'),
    N('12a'): dict(diagram=n12('Year 11'), diagram_by='family'),
    N('12b'): dict(
        html='<p>The box plot below shows information about the heights, in cm, of a group of '
             'Year 7 girls.</p><p>Compare the distribution of heights of the Year 7 girls with '
             'the distribution of heights of the Year 11 girls.</p>',
        figure='box-plot', diagram=n12('Year 7', N12_Y7), diagram_by='family'),
    N('13a'): dict(
        html='<p>On Monday Milo calculated that he needed exactly 4 chicken pies in his '
             'sample.</p><p>Work out the total number of chicken pies that were made on '
             'Monday.</p>'),
    N('13b'): dict(
        html='<p>On Tuesday, the number of steak pies Milo needs in his sample is 6 correct to '
             'the nearest whole number.</p><p>Milo takes at random a pie from the 450 pies made '
             'on Tuesday.</p><p>Work out the lower bound of the probability that the pie is a '
             'steak pie.</p>',
        accept='11⁄30 | 0.367 | 0.3667 | 0.3666 | 0.366'),
    N('14'): dict(
        html='<p>The ratio (<i>y</i> + <i>x</i>)&nbsp;:&nbsp;(<i>y</i> &minus; <i>x</i>) is '
             'equivalent to <i>k</i>&nbsp;:&nbsp;1</p><p>Show that %s</p>'
             % nw('<i>y</i> = %s' % frac('<i>x</i>(<i>k</i> + 1)', '<i>k</i> &minus; 1'))),
    N('15'): dict(
        html='<p>%s</p><p>Prove algebraically that <i>x</i> can be written as '
             '%s</p>' % (nw('<i>x</i> = 0.4%s%s' % (rdot('3'), rdot('6'))), frac('24', '55'))),
    N('16'): dict(
        html='<p><i>y</i> is directly proportional to &#8731;<i>x</i></p><p>%s '
             'when %s</p><p>Find the value of <i>y</i> when %s</p>'
             % (nw('<i>y</i> = 1%s' % frac('1', '6')), nw('<i>x</i> = 8'), nw('<i>x</i> = 64')),
        accept='2 1⁄3 | 7⁄3'),
    N('17'): dict(
        html='<p><i>n</i> is an integer.</p><p>Prove algebraically that the sum of '
             '%s and %s is always a square '
             'number.</p>' % (nw('%s<i>n</i>(<i>n</i> + 1)' % frac('1', '2')),
                              nw('%s(<i>n</i> + 1)(<i>n</i> + 2)' % frac('1', '2')))),
    N('18'): dict(
        html='<p>Enlarge shape <b>P</b> by scale factor %s with centre of enlargement '
             '(0, 0).<br>Label your image <b>Q</b>.</p>' % nw('&minus;%s' % frac('1', '2')),
        diagram=n18(), diagram_by='family'),
    N('19'): dict(
        html='<p><i>ABCD</i> is a rectangle.</p><p><i>A</i>, <i>E</i> and <i>B</i> are points '
             'on the straight line <b>L</b> with equation ' + nw('<i>x</i> + 2<i>y</i> = 12') + '<br><i>A</i> '
             'and <i>D</i> are points on the straight line <b>M</b>.</p><p><i>AE</i> = '
             '<i>EB</i></p><p>Find an equation for <b>M</b>.</p>',
        diagram=n19(), diagram_by='family',
        accept='y = 2x + 36 | y − 2x = 36 | 2x − y + 36 = 0'),
    N('20'): dict(accept='1 + √2 | √2 + 1'),
    N('21'): dict(
        html='<p>Show that %s can be written in the form <i>a</i> + <i>b</i>&radic;2 where '
             '<i>a</i> and <i>b</i> are integers.</p>'
             % frac('6 &minus; &radic;8', '&radic;2 &minus; 1')),
    N('22'): dict(
        html='<p>The two triangles in the diagram are similar.</p><p>There are two possible '
             'values of <i>x</i>.</p><p>Work out each of these values.<br>State any assumptions '
             'you make in your working.</p>',
        diagram=n22(), diagram_by='family'),
    N('23'): dict(
        html='<p>Here is a rectangle and a right-angled triangle.</p><p>All measurements are in '
             'centimetres.<br>The area of the rectangle is greater than the area of the '
             'triangle.</p><p>Find the set of possible values of <i>x</i>.</p>',
        diagram=n23(), diagram_by='family', accept='x > 2'),
}

# the shared stem of November Q13 -- part (b) cannot be read without the sample and the proportion
NEW_PREAMBLE_HTML = ('<p>A factory makes 450 pies every day.<br>The pies are chicken pies or steak '
                     'pies.</p><p>Each day Milo takes a sample of 15 pies to check.</p><p>The '
                     'proportion of the pies in his sample that are chicken is the same as the '
                     'proportion of the pies made that day that are chicken.</p>')


# ================================================================================================
# NOTHING MAY BE PAINTED OUTSIDE ITS OWN BOX, and no drawing may use the attribute CSS beats
# ================================================================================================
def _nums(s, attr):
    return [float(v) for v in re.findall(r'\b%s="(-?[\d.]+)"' % attr, s)]


for rid, ed in EDITS.items():
    s = ed.get('diagram')
    if not s:
        continue
    m_ = re.match(r'<svg viewBox="0 0 (\d+) ([\d.]+)"', s)
    assert m_ and int(m_.group(1)) == W, '%s: viewBox width must be %d' % (rid, W)
    h = float(m_.group(2))
    xs = _nums(s, 'x') + _nums(s, 'x1') + _nums(s, 'x2') + _nums(s, 'cx')
    ys = _nums(s, 'y') + _nums(s, 'y1') + _nums(s, 'y2') + _nums(s, 'cy')
    for pts in re.findall(r'points="([^"]+)"', s):
        for pair in pts.split():
            a, b = pair.split(',')
            xs.append(float(a)); ys.append(float(b))
    assert xs and ys, rid
    assert min(xs) >= 0 and max(xs) <= W, '%s: x from %s to %s' % (rid, min(xs), max(xs))
    assert min(ys) >= 0 and max(ys) <= h, '%s: y from %s to %s in %s' % (rid, min(ys), max(ys), h)
    assert 'text-anchor="' not in s and '<marker' not in s and ' id="' not in s, rid


# ================================================================================================
# WRITE
# ================================================================================================
raw = open(FILE, encoding='utf-8').read().split('\n')
out, done, marks = [], set(), {MAY: 0, NOV: 0}
pre_source = None
for line in raw:
    bare = line.rstrip()
    trail = bare.endswith(',')
    body = bare[:-1] if trail else bare
    try:
        row = json.loads(body)
    except ValueError:
        out.append(line)
        continue
    rid = row.get('row_id')
    if rid == NEW_PRE:
        raise SystemExit('%s already exists -- this script has already run against this file' % rid)
    if row.get('paper_id') in marks and row.get('kind') == 'question':
        marks[row['paper_id']] += int(row.get('marks') or 0)
    if rid in EDITS:
        assert rid not in done, 'two rows carry the id %s' % rid
        for k, v in EDITS[rid].items():
            if v is DEL:
                row.pop(k, None)
            else:
                row[k] = v
        done.add(rid)
        out.append(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + (',' if trail else ''))
    else:
        out.append(line)
    if rid == 'S-P-1MA1-1711-1H-q12':
        pre_source = row
        new = dict(row)
        new.update(row_id=NEW_PRE, question='13', part='', marks='', html=NEW_PREAMBLE_HTML)
        for k in ('diagram', 'diagram_by', 'figure'):
            new.pop(k, None)
        out.append(json.dumps(new, ensure_ascii=False, separators=(',', ':')) + ',')
        if not trail:
            raise SystemExit('the November Q12 preamble is the last row -- refusing to guess')

missing = set(EDITS) - done
assert not missing, 'rows not found: %s' % sorted(missing)
assert pre_source is not None, 'the November Q12 preamble was not found to copy from'
assert marks == {MAY: 80, NOV: 80}, marks              # both covers say 80
open(FILE, 'w', encoding='utf-8').write('\n'.join(out))
drawn = sorted(r for r, e in EDITS.items() if e.get('diagram'))
print('rows edited: %d (May %d, November %d) + 1 preamble added (%s)'
      % (len(done), sum(1 for r in done if '1705' in r), sum(1 for r in done if '1711' in r),
         NEW_PRE))
print('drawings redrawn from the paper\'s own vectors: %d' % len(drawn))
for r in drawn:
    print('   ', r)
print('accept cells rewritten: %d' % sum(1 for e in EDITS.values() if 'accept' in e))
print('May Q1: 14 crosses measured; Q11: 53 curve vertices, roots %.2f and %.2f, f(1.5) = %.2f'
      % (q11_roots()[0], q11_roots()[1], q11_at(1.5)))
print('Nov Q12(b) Year 7: %s' % ', '.join('%g' % v for v in N12_Y7))
print('both papers still sum to 80 marks')
