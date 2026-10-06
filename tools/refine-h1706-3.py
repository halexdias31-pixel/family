"""
EDEXCEL 1MA1 HIGHER PAPER 3 (CALCULATOR), JUNE 2017 -- EVERY ROW CHECKED AGAINST THE PRINTED PAPER.

ASKED FOR AS *"for [a student] i like to do higher maths papers. im just scared as the papers i do typically
something is always wrong like your diagrams or something. i just want it to be good."* Measured
first: 29 rows, 80 marks, every one answered -- and THIRTEEN carrying a `figure` with `diagram`
empty. Twelve of those are pictures the paper prints and the transcription lost; the thirteenth,
Q8's `circle`, is a picture the paper NEVER printed (the question is words only), so the label was
a claim about nothing.

THE SOURCE IS THE REAL PAPER, NOT THE PROSE. "2017 Paper 3 Tuesday 13 June.pdf" in the owner's
HtierMathsEdexcel folder is p50549a_gcse_maths_1ma1_3h_jun17 -- a vector PDF, so every figure below
was rebuilt from the paper's own drawing commands (`page.get_drawings()`), not eyeballed: the corners
of the two squares in Q5, the triangle's vertices in Q7 and Q15, the five box-plot values in Q9 to
the minor gridline, the three lines of Q13 to the end points the paper draws them between. Each is
the paper's geometry, scaled into this library's 340-wide viewBox (`svgplot.W`). THE MARK SCHEME
FOR THIS SITTING IS NOT IN DRIVE -- searched by code, by title and by "Summer 2017" -- so every
answer here is proved by arithmetic below instead, and nothing claims what the scheme says.

WHAT CHANGED, IN ONE PLACE:

  PICTURES   Q1(a) the blank Venn the student completes -- two UNLABELLED circles, as printed, so
             labelling them A and B is part of the answer; Q5 the two squares, polygon P and the
             12-gon meeting at B and C; Q7 the right-angled triangle; Q9 the box-plot grid with the
             male students' plot, on a question-scoped preamble so the pen arms on (b); Q13 the
             three lines and the shaded triangle; Q15 the triangle with the 45 degree angle; Q18 the
             circle, its two tangents and the dashed line OD.
  PROSE      Every one of those rows carried a sentence standing in for its picture, and three of
             them handed over part of the answer: Q9(a) listed the five values the question asks
             the student to READ OFF the box plot; Q13 named the three lines whose equations ARE the
             question; Q5 and Q15 described the geometry the working is about. Those sentences go
             the moment the picture arrives -- what a figure shows is not what its answer is.
  TABLES     Q3's dress sizes and Q9's female-student five-number summary were prose; they are
             tables now (Q9's turned on its side, two columns, because six across runs off a 320px
             card the way Q7 of the June 2024 Foundation paper did).
  PREAMBLES  Q1, Q3, Q9, Q16 and Q17 left their shared stem on part (a), so (b) read "Explain how
             this could affect your decision in part (a)" with nothing to decide about. The stem is
             written once, on a preamble, and drawn on every part.
  ANSWERS    Q8 said 5.58; x = 5.58519..., which is 5.59 to 3 significant figures. Q16(a) had all
             three iterates in one `accept`, so a student typing exactly the scheme's values would
             have been marked wrong -- a person marks it now. Q19's accept was `x < -2 | x > 1/2`,
             which marked HALF the answer right on its own; it is the pair or nothing now.
  DATE       Tuesday 13 June 2017, read off the cover, on every row.

Q20(b) IS A SKETCH ON BLANK SPACE ON THE PAPER, so it gets no picture: drawing axes for it would be
a mark awarded by the drawing.
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
PAPER = 'P-1MA1-1706-3H'
ID = lambda s: 'Q-1MA1-1706-3H-%s' % s     # noqa: E731
DATE = '2017-06-13'                         # "Tuesday 13 June 2017 - Morning", off the cover


def svg(body, h, label):
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>'
            % (W, round(h), label, body))


def line(x1, y1, x2, y2, w=1.4, extra=''):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
            'stroke-width="%s"%s/>' % (x1, y1, x2, y2, w, extra))


def poly(pts, closed=True, w=1.4, fill='none', extra=''):
    d = ' '.join('%.1f,%.1f' % p for p in pts)
    tag = 'polygon' if closed else 'polyline'
    return ('<%s points="%s" fill="%s" stroke="currentColor" stroke-width="%s"%s/>'
            % (tag, d, fill, w, extra))


def txt(x, y, s, cls='num', anchor='middle'):
    """INLINE `style`, NOT `text-anchor=`. CSS beats an SVG presentation attribute, so
       `.qsheet .num { text-anchor: middle }` silently wins over the attribute -- CLAUDE.md records
       ten y-axis numbers sitting centred on their axis for exactly that."""
    return ('<text x="%.1f" y="%.1f" class="%s" style="text-anchor:%s">%s</text>'
            % (x, y, cls, anchor, s))


def at(x0, y0, s, ox, oy):
    """The paper's own coordinates (PDF points, y down) into this viewBox: one origin, one scale,
       so every vertex and every label of a figure is moved by the same map and cannot drift
       from its neighbours."""
    return lambda x, y: (ox + (x - x0) * s, oy + (y - y0) * s)


CY = 4.5     # a 13px label is centred on a point by putting its baseline this far below it


# ================================================================================================
# Q1(a) -- the Venn diagram the student completes: a rectangle, the script E, two UNLABELLED circles
# ================================================================================================
Q1_E = list(range(1, 30, 2))
Q1_A = [3, 9, 15, 21, 27]
Q1_B = [5, 15, 25]
assert len(Q1_E) == 15 and set(Q1_A) <= set(Q1_E) and set(Q1_B) <= set(Q1_E)
assert sorted(set(Q1_A) & set(Q1_B)) == [15]
assert len(set(Q1_A) | set(Q1_B)) == 7                       # (b) 7/15
assert sorted(set(Q1_E) - set(Q1_A) - set(Q1_B)) == [1, 7, 11, 13, 17, 19, 23, 29]


def q1():
    # PDF: frame 164.5,224.5 -> 430.5,416.7; circles centred (259.8, 314.9) and (336.0, 314.7),
    # both r 53.6; the script E at (170.3..179.1, 230.4..242.4). Nothing else is printed in it.
    s = 1.2
    P = at(164.5, 224.5, s, (W - 266.0 * s) / 2.0, 8)
    x0, y0 = P(164.5, 224.5)
    x1, y1 = P(430.5, 416.7)
    body = ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" stroke="currentColor" '
            'stroke-width="1.3"/>' % (x0, y0, x1 - x0, y1 - y0))
    for cx, cy in ((259.8, 314.9), (336.0, 314.7)):
        X, Y = P(cx, cy)
        body += ('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="currentColor" '
                 'stroke-width="1.4"/>' % (X, Y, 53.6 * s))
    ex, ey = P(174.7, 236.4)
    body += txt(ex, ey + CY, '&#8496;', 'lbl')
    return svg(body, y1 + 8, 'A rectangle marked with the script E for the universal set, with two '
                             'overlapping circles inside it. Neither circle is labelled and nothing '
                             'is written in the diagram yet.')


# ================================================================================================
# Q5 -- AB, BC and CD are sides of polygon P; a square and the 12-gon meet it at B and at C
# ================================================================================================
Q5_A, Q5_B, Q5_C, Q5_D = (237.6, 122.2), (265.4, 160.3), (311.3, 148.6), (321.3, 102.5)
Q5_SQ1 = [Q5_A, Q5_B, (227.4, 188.1), (199.5, 150.0)]           # the left square, A B on it
Q5_SQ2 = [Q5_C, Q5_D, (367.4, 112.5), (357.4, 158.6)]           # the right square, C D on it
Q5_12 = [(203.9, 229.2), (227.4, 188.1), Q5_B, Q5_C, (357.4, 158.6), (395.5, 186.6)]
# the arithmetic the question is about: the three angles at B make a full turn
_sq, _twelve = 90.0, (12 - 2) * 180.0 / 12
_p = 360.0 - _sq - _twelve
assert (_twelve, _p) == (150.0, 120.0) and 360.0 / (180.0 - _p) == 6.0


def _ang(o, p, q):
    a = math.atan2(p[1] - o[1], p[0] - o[0])
    b = math.atan2(q[1] - o[1], q[0] - o[0])
    d = abs(math.degrees(a - b)) % 360.0
    return min(d, 360.0 - d)


# THE PAPER'S DRAWING IS NOT A CONSTRUCTION, and the first version of this script said it was. Its
# two squares are true squares -- both corners measure 90 to a tenth of a degree -- but P's angles
# at B and C come out 112 and 117, not 120, and the 12-gon's 158 and 153, not 150. Copied as
# printed, because the cover says diagrams are not accurately drawn and that is exactly what stops
# a student measuring 120 off the page instead of showing it.
assert abs(_ang(Q5_B, Q5_A, (227.4, 188.1)) - 90.0) < 0.5
assert abs(_ang(Q5_C, Q5_D, (357.4, 158.6)) - 90.0) < 0.5
assert 105 < _ang(Q5_B, Q5_A, Q5_C) < 125 and 105 < _ang(Q5_C, Q5_B, Q5_D) < 125


def q5():
    s = 1.5
    P = at(199.5, 89.6, s, (W - 196.0 * s) / 2.0, 8)
    body = (poly([P(*p) for p in Q5_SQ1]) + poly([P(*p) for p in Q5_SQ2])
            + poly([P(*p) for p in Q5_12], closed=False))
    labels = [(238.2, 116.3, '<tspan class="lbl">A</tspan>'),
              (266.25, 168.7, '<tspan class="lbl">B</tspan>'),
              (309.7, 157.6, '<tspan class="lbl">C</tspan>'),
              (319.95, 95.6, '<tspan class="lbl">D</tspan>'),
              (231.75, 155.2, 'square'), (338.35, 130.25, 'square'),
              (280.5, 134.6, 'polygon <tspan style="font-weight:bold">P</tspan>'),
              (309.9, 195.1, 'regular 12-sided polygon')]
    for x, y, t in labels:
        X, Y = P(x, y)
        body += txt(X, Y + CY, t)
    return svg(body, P(0, 229.2)[1] + 10,
               'Three sides AB, BC and CD of polygon P. On the left a square shares the side AB, '
               'on the right a square shares the side CD, and below BC is a regular 12-sided '
               'polygon. At B a square, polygon P and the 12-sided polygon meet, and the same '
               'three shapes meet at C.')


# ================================================================================================
# Q7 -- the right-angled triangle, the right angle at B
# ================================================================================================
Q7_C, Q7_B, Q7_A = (228.7, 91.2), (366.7, 91.2), (366.7, 146.5)
Q7_AB = 15 * math.sin(math.radians(23))
assert round(Q7_AB, 2) == 5.86, Q7_AB


def q7():
    s = 1.8
    P = at(216.8, 84.8, s, 25, 8)
    C, B, A = P(*Q7_C), P(*Q7_B), P(*Q7_A)
    body = poly([C, B, A])
    body += poly([P(358.2, 91.2), P(358.2, 99.7), P(366.7, 99.7)], closed=False, w=1.1)
    a0, a1 = P(287.0, 91.2), P(282.7, 112.8)
    r = math.hypot(a0[0] - C[0], a0[1] - C[1])
    body += ('<path d="M %.1f %.1f A %.1f %.1f 0 0 1 %.1f %.1f" fill="none" stroke="currentColor" '
             'stroke-width="1.1"/>' % (a0[0], a0[1], r, r, a1[0], a1[1]))
    for x, y, t in ((220.85, 92.1, '<tspan class="lbl">C</tspan>'),
                    (374.15, 90.8, '<tspan class="lbl">B</tspan>'),
                    (366.05, 155.2, '<tspan class="lbl">A</tspan>'),
                    (275.6, 98.85, '23&deg;'),
                    (282.85, 123.25, '15 cm')):
        X, Y = P(x, y)
        body += txt(X, Y + CY, t)
    return svg(body, P(0, 161.2)[1] + 8,
               'A right-angled triangle ABC with the right angle at B. CB is the top edge, BA runs '
               'down from B, and CA is the sloping side marked 15 cm. The angle at C is marked '
               '23 degrees.')


# ================================================================================================
# Q9 -- the box-plot grid with the male students' plot already on it
# ================================================================================================
# PDF: 0 at x 155.3 and 1000 at x 438.8 (28.35 a hundred); the plot's five vertical strokes sit at
# 160.6, 197.1, 225.5, 248.4 and 367.8, which are 18.7, 147.4, 247.6, 328.4 and 749.6 -- on the
# minor (20) gridlines at 20, 150, 250, 330 and 750 to within the stroke width.
Q9_PDF = [160.6, 197.1, 225.5, 248.4, 367.8]
Q9_MALE = [20, 150, 250, 330, 750]
for _x, _v in zip(Q9_PDF, Q9_MALE):
    assert abs((_x - 155.3) / 0.2835 - _v) < 3, (_x, _v)
assert all(v % 10 == 0 for v in Q9_MALE)
assert Q9_MALE[3] - Q9_MALE[1] == 180                           # (a) the interquartile range
Q9_FEMALE = [60, 180, 300, 350, 650]                            # (b)'s table
assert Q9_FEMALE[2] > Q9_MALE[2] and Q9_MALE[4] > Q9_FEMALE[4]  # (c): the two honest readings


def q9():
    L, R, T = 62.0, 324.0, 10.0
    per = (R - L) / 1000.0                       # units a pound
    minor = 20 * per
    rows = 30                                    # six large squares of five, as printed
    B = T + rows * minor
    X = lambda v: L + v * per                    # noqa: E731
    p = []
    for i in range(51):                          # every 20 pounds
        x = L + i * minor
        if i % 5:
            p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="grid"/>' % (x, T, x, B))
        else:
            p.append(line(x, T, x, B, .9, ' opacity=".55"'))
    for j in range(rows + 1):
        y = T + j * minor
        if j % 5:
            p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="grid"/>' % (L, y, R, y))
        else:
            p.append(line(L, y, R, y, .9, ' opacity=".55"'))
    p.append(line(L, B, R, B, 1.5))              # the money axis
    for v in range(0, 1001, 100):
        p.append(line(X(v), B, X(v), B + 4, 1.2))
        p.append(txt(X(v), B + 17, str(v)))
    p.append(txt((L + R) / 2.0, B + 35, 'Money spent (&pound;)'))
    # the male plot, centred on the first heavy line down, four small squares tall
    mid = T + 5 * minor
    lo, q1, md, q3, hi = Q9_MALE
    bh, ch = 2 * minor, 1.55 * minor
    p.append(line(X(lo), mid, X(q1), mid, 1.6) + line(X(q3), mid, X(hi), mid, 1.6))
    p.append(line(X(lo), mid - ch, X(lo), mid + ch, 1.6) + line(X(hi), mid - ch, X(hi), mid + ch, 1.6))
    p.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" stroke="currentColor" '
             'stroke-width="1.6"/>' % (X(q1), mid - bh, X(q3) - X(q1), 2 * bh))
    p.append(line(X(md), mid - bh, X(md), mid + bh, 1.6))
    p.append(txt(31, mid - 3, 'Male') + txt(31, mid + 12, 'students'))
    return svg(''.join(p), B + 44,
               'A grid for box plots, with a money scale from 0 to 1000 pounds along the bottom. '
               'Near the top is the box plot for the male students, labelled Male students. The '
               'rest of the grid is empty, for a second box plot.')


# ================================================================================================
# Q13 -- three lines and the shaded triangle they cut off
# ================================================================================================
Q13_SHALLOW = lambda x: x / 2.0 + 1      # noqa: E731  through (0, 1) and (2, 2), as printed
Q13_STEEP = lambda x: x                  # noqa: E731  through O and (2, 2)
Q13_FLAT = -2
Q13_TRI = [(-6, -2), (-2, -2), (2, 2)]
assert Q13_SHALLOW(-6) == Q13_FLAT and Q13_STEEP(-2) == Q13_FLAT and Q13_SHALLOW(2) == Q13_STEEP(2) == 2
# a point inside satisfies the answer's three inequalities
_ix, _iy = -2.0, -1.0
assert _iy >= Q13_FLAT and _iy <= Q13_SHALLOW(_ix) and _iy >= Q13_STEEP(_ix)
# the paper's own end points: shallow (-7, -2.5) to (6, 4), steep (-4, -4) to (4, 4)
assert Q13_SHALLOW(-7) == -2.5 and Q13_SHALLOW(6) == 4


def q13():
    u = 21.0
    L, T = 16.0, 22.0
    X = lambda x: L + (x + 7) * u          # noqa: E731
    Y = lambda y: T + (4 - y) * u          # noqa: E731
    p = []
    for i in range(14 * 5 + 1):
        x = L + i * u / 5.0
        if i % 5:
            p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="grid"/>' % (x, Y(4), x, Y(-4)))
        else:
            p.append(line(x, Y(4), x, Y(-4), .8, ' opacity=".5"'))
    for j in range(8 * 5 + 1):
        y = T + j * u / 5.0
        if j % 5:
            p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="grid"/>' % (X(-7), y, X(7), y))
        else:
            p.append(line(X(-7), y, X(7), y, .8, ' opacity=".5"'))
    p.append('<polygon points="%s" fill="currentColor" fill-opacity=".22" stroke="none"/>'
             % ' '.join('%.1f,%.1f' % (X(a), Y(b)) for a, b in Q13_TRI))
    # the axes, with arrowheads drawn as triangles (no <marker> ids -- five cards share a page)
    p.append(line(X(-7), Y(0), X(7) + 8, Y(0), 1.4))
    p.append('<path d="M %.1f %.1f l -7 -3.5 v 7 z" fill="currentColor"/>' % (X(7) + 14, Y(0)))
    p.append(line(X(0), Y(-4), X(0), Y(4) - 8, 1.4))
    p.append('<path d="M %.1f %.1f l -3.5 7 h 7 z" fill="currentColor"/>' % (X(0), Y(4) - 14))
    p.append(txt(X(7) + 20, Y(0) + CY, '<tspan class="lbl">x</tspan>'))
    p.append(txt(X(0) - 10, Y(4) - 8, '<tspan class="lbl">y</tspan>'))
    p.append(line(X(-7), Y(-2), X(7), Y(-2), 1.3))
    p.append(line(X(-4), Y(-4), X(4), Y(4), 1.3))
    p.append(line(X(-7), Y(Q13_SHALLOW(-7)), X(6), Y(Q13_SHALLOW(6)), 1.3))
    # THE NUMBERS SIT ON A PATCH OF THE CARD'S OWN COLOUR, which is what the paper does with a white
    # box behind each one. A screenshot is why: the heavy y = -2 line ran straight through the '-2'
    # on the y-axis, and every gridline through every other number. `--raised` is the `.qcard`
    # background on both palettes, so the patch is invisible except where it hides a line.
    # NOT under the x-axis's '-2' or the O, which sit inside the shaded triangle -- the paper leaves
    # those two unboxed for the same reason, and a patch there would punch a hole in the shading.
    def num(x, y, s, anchor='middle', cls='num', patch=True):
        w = 7.0 * len(s.replace('&minus;', '-')) + 3
        x0 = x - w / 2.0 if anchor == 'middle' else x - w + 1
        return (('<rect x="%.1f" y="%.1f" width="%.1f" height="13" style="fill:var(--raised)"/>'
                 % (x0, y - 10.5, w) if patch else '') + txt(x, y, s, cls, anchor))
    p.append(num(X(0) - 8, Y(0) + 15, 'O', cls='lbl', patch=False))
    for v in (-6, -4, -2, 2, 4, 6):
        p.append(num(X(v), Y(0) + 15, str(v).replace('-', '&minus;'), patch=(v != -2)))
    for v in (4, 3, 2, 1, -1, -2, -3, -4):
        p.append(num(X(0) - 4, Y(v) + CY, str(v).replace('-', '&minus;'), 'end'))
    return svg(''.join(p), Y(-4) + 8,
               'A coordinate grid with x from minus 7 to 7 and y from minus 4 to 4. Three straight '
               'lines are drawn on it: a horizontal line, a line through the origin, and a less '
               'steep line. The triangle between them, below the axes on the left and reaching up '
               'to where the two sloping lines cross, is shaded.')


# ================================================================================================
# Q15 -- triangle ABC with the 45 degree angle at B between the two given sides
# ================================================================================================
Q15_C, Q15_A, Q15_B = (214.5, 86.5), (189.9, 226.2), (404.9, 226.2)
Q15_X = (-5 + math.sqrt(241)) / 4
assert abs(0.5 * (Q15_X + 3) * (2 * Q15_X - 1) * math.sin(math.radians(45)) - 6 * math.sqrt(2)) < 1e-9
assert round(Q15_X, 2) == 2.63 and 2 * Q15_X - 1 > 0


def q15():
    s = 1.25
    P = at(178.9, 73.6, s, (W - 237.3 * s) / 2.0, 6)
    C, A, B = P(*Q15_C), P(*Q15_A), P(*Q15_B)
    body = poly([C, A, B])
    a0, a1 = P(345.0, 226.2), P(356.6, 190.7)
    r = math.hypot(a0[0] - B[0], a0[1] - B[1])
    body += ('<path d="M %.1f %.1f A %.1f %.1f 0 0 1 %.1f %.1f" fill="none" stroke="currentColor" '
             'stroke-width="1.1"/>' % (a0[0], a0[1], r, r, a1[0], a1[1]))
    for x, y, t in ((214.65, 79.6, '<tspan class="lbl">C</tspan>'),
                    (182.55, 227.4, '<tspan class="lbl">A</tspan>'),
                    (412.55, 227.4, '<tspan class="lbl">B</tspan>'),
                    (340.7, 144.35, '(<tspan font-style="italic">x</tspan> + 3) metres'),
                    (359.9, 213.0, '45&deg;'),
                    (297.3, 235.8, '(2<tspan font-style="italic">x</tspan> &minus; 1) metres')):
        X, Y = P(x, y)
        body += txt(X, Y + CY, t)
    return svg(body, P(0, 243.9)[1] + 6,
               'Triangle ABC with A bottom left, B bottom right and C at the top. The side BC is '
               'marked (x + 3) metres, the side AB along the bottom is marked (2x minus 1) metres, '
               'and the angle at B between them is marked 45 degrees.')


# ================================================================================================
# Q18 -- the circle, centre O, the two tangents from D and the dashed line OD
# ================================================================================================
Q18_ANGLE_AOD = math.degrees(math.acos(5 / 9.0))
Q18_ARC = (360 - 2 * Q18_ANGLE_AOD) / 360 * 2 * math.pi * 5
assert round(Q18_ARC, 1) == 21.6, Q18_ARC
assert round(2 * Q18_ANGLE_AOD / 360 * 2 * math.pi * 5, 2) == 9.82      # the minor-arc trap


def q18():
    s = 1.25
    P = at(172.5, 70.7, s, (W - 250.7 * s) / 2.0, 8)
    O, A, C, D = P(258.2, 146.1), P(292.7, 84.0), P(292.7, 208.1), P(409.2, 146.1)
    body = ('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="currentColor" '
            'stroke-width="1.4"/>' % (O[0], O[1], 71.0 * s))
    body += poly([O, A, D, C], closed=True)
    body += line(O[0], O[1], D[0], D[1], 1.2, ' stroke-dasharray="6.5 3.75"')
    for x, y, t in ((294.95, 76.7, '<tspan class="lbl">A</tspan>'),
                    (176.15, 144.8, '<tspan class="lbl">B</tspan>'),
                    (248.7, 144.8, '<tspan class="lbl">O</tspan>'),
                    (418.85, 145.8, '<tspan class="lbl">D</tspan>'),
                    (294.9, 215.3, '<tspan class="lbl">C</tspan>'),
                    (262.0, 106.55, '5 cm'), (259.05, 180.55, '5 cm')):
        X, Y = P(x, y)
        body += txt(X, Y + CY, t)
    return svg(body, P(0, 221.3)[1] + 10,
               'A circle with centre O. A is at the top right of the circle and C at the bottom '
               'right; OA and OC are radii, each marked 5 cm. D is outside the circle to the right, '
               'with straight lines DA and DC and a dashed line from O to D. B is on the left of '
               'the circle, on the far side from D.')


# ================================================================================================
# TABLES -- two things the paper prints as tables and the transcription had as sentences
# ================================================================================================
def table(head, rows):
    h = ''.join('<th scope="col">%s</th>' % c for c in head)
    b = ''.join('<tr><th scope="row">%s</th>%s</tr>'
                % (r[0], ''.join('<td>%s</td>' % c for c in r[1:])) for r in rows)
    return '<table><thead><tr>%s</tr></thead><tbody>%s</tbody></table>' % (h, b)


Q3_ROWS = [(8, 2), (10, 9), (12, 8), (14, 6)]
assert sum(n for _, n in Q3_ROWS) == 25
_run, _med = 0, None
for _size, _n in Q3_ROWS:
    _run += _n
    if _med is None and _run >= 13:
        _med = _size
assert _med == 12                                          # (a): the 13th of 25
assert dict(Q3_ROWS)[14] == 6                              # (b)'s 6/25
Q3_TABLE = table(['Dress size', 'Number of women'], [[str(a), str(b)] for a, b in Q3_ROWS])

# ON ITS SIDE: six columns across is wider than a 320px card.
Q9_TABLE = table(['', 'Money spent (&pound;)'],
                 [[k, str(v)] for k, v in zip(['Smallest', 'Lower quartile', 'Median',
                                               'Upper quartile', 'Largest'], Q9_FEMALE)])


def frac(n, d):
    return ('<span class="frac"><span class="frac-n">%s</span><span class="frac-d">%s</span></span>'
            % (n, d))


# A COLUMN VECTOR, from the one stacked component this stylesheet already has: two `.frac-d` rows
# (no rule between them, which is what makes it a vector rather than a fraction) between brackets
# tall enough to hold both.
_BR = '<span style="font-size:1.75em;vertical-align:middle;line-height:1">%s</span>'
COLVEC = lambda a, b: ((_BR % '(') + '<span class="frac"><span class="frac-d">%s</span>'      # noqa: E731
                       '<span class="frac-d">%s</span></span>' % (a, b) + (_BR % ')'))

# ================================================================================================
# THE ARITHMETIC EVERY ANSWER RESTS ON -- the mark scheme is not in Drive, so it is proved here
# ================================================================================================
assert 420 * 2 // 7 == 120 and 420 * 35 // 100 == 147 and (420 - 120 - 147) // 9 * 4 == 68     # Q4
assert round((25 * 1.05 + 15 * 1.4 + 280 * 0.99) / 320, 2) == 1.01                            # Q6
Q8_X = math.sqrt(2 * 49 / math.pi)
assert round(Q8_X, 4) == 5.5852 and '%.2f' % Q8_X == '5.59'                                   # Q8
assert round(6000 * 1.06 ** 5, 2) == 8029.35                                                  # Q10
assert 215 % 17 != 0                                                                          # Q11
_ab, _ac = 18 // 6, 18 * 7 // 18
assert (_ab, _ac - _ab, 18 - _ac) == (3, 4, 11)                                               # Q12
_x = [-2.5]
for _ in range(3):
    _x.append(-2 - 4 / _x[-1] ** 2)
assert ('%.2f' % _x[1], '%.4f' % _x[2], '%.4f' % _x[3]) == ('-2.64', '-2.5739', '-2.6038')    # Q16
assert abs(_x[3] ** 3 + 2 * _x[3] ** 2 + 4) < 0.1
assert round(275 / (107.5 / 60), 2) == 153.49 and round(272.5 / (107.5 / 60), 2) == 152.09     # Q17
assert (2 * (-2) ** 2 + 3 * (-2) - 2, 2 * 0.25 + 1.5 - 2) == (0, 0)                           # Q19
# the paper's own marks, part by part -- the cover says 80
MARKS = {'1a': 4, '1b': 2, '2': 3, '3a': 1, '3b': 1, '4': 5, '5': 4, '6': 4, '7': 2, '8': 4,
         '9a': 2, '9b': 2, '9c': 1, '10': 3, '11': 2, '12': 3, '13': 4, '14a': 3, '14b': 3,
         '15': 5, '16a': 3, '16b': 2, '17a': 4, '17b': 1, '18': 5, '19': 3, '20a': 1, '20b': 3}
assert sum(MARKS.values()) == 80

# ================================================================================================
# WHAT GOES WHERE
# ================================================================================================
PREAMBLES = {
    '1': dict(topics='sets', diagram=None,
              html='<p>&#8496; = {odd numbers less than 30}<br><i>A</i> = {3, 9, 15, 21, 27}<br>'
                   '<i>B</i> = {5, 15, 25}</p>'),
    '3': dict(topics='averages', diagram=None,
              html='<p>The table shows some information about the dress sizes of 25 women.</p>'
                   + Q3_TABLE),
    '9': dict(topics='box plots', diagram='q9',
              html='<p>The box plot shows information about the distribution of the amounts of '
                   'money spent by some male students on their holidays.</p>'
                   '<p>The table shows information about the distribution of the amounts of '
                   'money spent by some female students on their holidays.</p>' + Q9_TABLE),
    '16': dict(topics='iteration', diagram=None,
               html='<p>Using &nbsp;<i>x</i><sub><i>n</i>+1</sub> = &minus;2 &minus; '
                    + frac('4', '<i>x</i><sub><i>n</i></sub><sup>2</sup>')
                    + '<br>with <i>x</i><sub>0</sub> = &minus;2.5</p>'),
    '17': dict(topics='bounds', diagram=None,
               html='<p>A train travelled along a track in 110 minutes, correct to the nearest '
                    '5 minutes.</p><p>Jake finds out that the track is 270&nbsp;km long.<br>He '
                    'assumes that the track has been measured correct to the nearest 10&nbsp;km.'
                    '</p>'),
}

# NO `examiner_note` ON ANY ROW. `check-library.js` counts every note as "what the transcriber could
# not recover -- worth a person and the original paper", so a note saying where a drawing came from
# would put seven complete questions on the backlog of broken ones. A count of work that does not
# exist stops meaning anything; where each picture came from is written here instead.
PARTS = {
    '1a': dict(html='<p>Complete the Venn diagram to represent this information.</p>',
               diagram='q1', figure='',
               answer='Label one circle <i>A</i> and the other <i>B</i> &mdash; the paper leaves '
                      'them blank and naming them is part of completing the diagram. 15 goes in '
                      'the overlap, because it is the only number in both sets. 3, 9, 21 and 27 '
                      'go in <i>A</i> only and 5, 25 in <i>B</i> only. The eight odd numbers under '
                      '30 that are in neither &mdash; 1, 7, 11, 13, 17, 19, 23, 29 &mdash; go in '
                      'the rectangle outside both circles: they are members of &#8496; and a '
                      'diagram without them is incomplete'),
    '1b': dict(figure=''),
    '3a': dict(html='<p>Find the median dress size.</p>', figure=''),
    '3b': dict(figure='',
               html='<p>3 of the 25 women have a shoe size of 7</p><p>Zoe says that if you choose '
                    'at random one of the 25 women, the probability that she has either a shoe '
                    'size of 7 or a dress size of 14 is <sup>9</sup>&frasl;<sub>25</sub> because'
                    '</p><p><sup>3</sup>&frasl;<sub>25</sub> + <sup>6</sup>&frasl;<sub>25</sub> = '
                    '<sup>9</sup>&frasl;<sub>25</sub></p><p>Is Zoe correct?<br>You must give a '
                    'reason for your answer.</p>'),
    '5': dict(html='<p>In the diagram, <i>AB</i>, <i>BC</i> and <i>CD</i> are three sides of a '
                   'regular polygon <b>P</b>.</p><p>Show that polygon <b>P</b> is a hexagon.<br>'
                   'You must show your working.</p>',
              diagram='q5', figure=''),
    '7': dict(html='<p><i>ABC</i> is a right-angled triangle.</p><p>Calculate the length of '
                   '<i>AB</i>.<br>Give your answer correct to 3 significant figures.</p>',
              diagram='q7', figure=''),
    '8': dict(figure=''),
    '9a': dict(html='<p>Work out the interquartile range for the amounts of money spent by these '
                    'male students.</p>', figure=''),
    '9b': dict(html='<p>On the grid, draw a box plot for the information in the table.</p>',
               figure=''),
    '9c': dict(figure='',
               answer='The box plots can support either answer, as long as the reason quotes '
                      'them. Yes: the female median is &pound;300 against the male &pound;250, so '
                      'a typical female student spent more (and her lower quartile, &pound;180, is '
                      'higher too). No: the biggest spender was male &mdash; &pound;750 against '
                      '&pound;650 &mdash; and box plots show how each group&rsquo;s spending is '
                      'spread, not how many students are in it, so they cannot show which group '
                      'spent more money in total. An opinion with no figure from the plots behind '
                      'it is not a reason'),
    '13': dict(html='<p>Write down the three inequalities that define the shaded region.</p>',
               diagram='q13', figure=''),
    '14a': dict(html='<p>Simplify &nbsp;' + frac('<i>x</i><sup>2</sup> &minus; 16',
                                                 '2<i>x</i><sup>2</sup> &minus; 5<i>x</i> &minus; 12')
                     + '</p>'),
    '14b': dict(html='<p>Make <i>v</i> the subject of the formula &nbsp;<i>w</i> = '
                     + frac('15(<i>t</i> &minus; 2<i>v</i>)', '<i>v</i>') + '</p>',
                accept='v = 15t ⁄ (w + 30) | 15t ⁄ (w + 30) | v = 15t ⁄ (30 + w)'),
    '15': dict(html='<p>The area of triangle <i>ABC</i> is 6&radic;2&nbsp;m<sup>2</sup>.</p><p>'
                    'Calculate the value of <i>x</i>.<br>Give your answer correct to 3 significant '
                    'figures.</p>',
               diagram='q15', figure=''),
    '16a': dict(html='<p>Find the values of <i>x</i><sub>1</sub>, <i>x</i><sub>2</sub> and '
                     '<i>x</i><sub>3</sub></p>',
                accept=''),
    '17a': dict(html='<p>Could the average speed of the train have been greater than '
                     '160&nbsp;km/h?<br>You must show how you get your answer.</p>'),
    '18': dict(html='<p><i>A</i>, <i>B</i> and <i>C</i> are points on a circle of radius 5&nbsp;cm, '
                    'centre <i>O</i>.<br><i>DA</i> and <i>DC</i> are tangents to the circle.<br>'
                    '<i>DO</i> = 9&nbsp;cm</p><p>Work out the length of arc <i>ABC</i>.<br>Give '
                    'your answer correct to 3 significant figures.</p>',
               diagram='q18', figure='',
               answer='21.6&nbsp;cm &mdash; a tangent meets the radius at 90&deg;, so <i>OAD</i> is '
                      'right-angled with hypotenuse <i>OD</i> = 9 and <i>OA</i> = 5. cos(angle '
                      '<i>AOD</i>) = 5 &divide; 9 gives 56.25&hellip;&deg;, and by symmetry angle '
                      '<i>AOC</i> = 112.50&hellip;&deg;. Arc <i>ABC</i> goes the long way round '
                      'through <i>B</i>, so its angle is 360 &minus; 112.50&hellip; = '
                      '247.49&hellip;&deg;, and the arc is 247.49&hellip; &divide; 360 &times; '
                      '2&pi; &times; 5 = 21.598&hellip;. Taking the minor arc instead gives 9.82, '
                      'and that is the trap'),
    # NO `accept` AT ALL, and the reason is the marker rather than the row. The old cell was
    # `x < -2 | x > 1/2`, which marked HALF the answer right on its own. The pair cannot be written
    # either: `markNorm_` opens by deleting anything shaped like an HTML tag, and `x < -2, x > 1/2`
    # contains `< -2, x >` -- so it reduces to `x 1/2`, and so does `x < 9, x > 1/2`. Measured: no
    # cell can mark the right answer right without marking that wrong one right too. A person marks
    # it, which is what a two-region answer wants anyway.
    '19': dict(accept=''),
    '6': dict(accept='1.01 g/cm^3 | 1.01 g/cm3'),
    '20a': dict(accept='(0, 1) | 0, 1'),
    '20b': dict(html='<p>The equation of circle <b>C</b> is &nbsp;<i>x</i><sup>2</sup> + '
                     '<i>y</i><sup>2</sup> = 16</p><p>The circle <b>C</b> is translated by the '
                     'vector ' + COLVEC('3', '0') + ' to give circle <b>B</b>.</p><p>Draw a sketch '
                     'of circle <b>B</b>.</p><p>Label with coordinates<br>the centre of circle '
                     '<b>B</b><br>and any points of intersection with the <i>x</i>-axis.</p>'),
}

# Q8: the answer said 5.58. x = 5.58519..., and the fourth significant figure is a 5 followed by
# more digits, so it rounds UP. 5.58 is what truncating, or rounding r too early, gives.
PARTS['8'].update(
    answer='5.59 &mdash; 49 is the area in cm<sup>2</sup>, not 49&pi;, so &pi;<i>r</i><sup>2</sup> = '
           '49 gives <i>r</i> = &radic;(49 &divide; &pi;) = 3.9493&hellip; and the diameter is '
           '7.8986&hellip;&nbsp;cm. The square&rsquo;s diagonal IS that diameter, so by Pythagoras '
           '<i>x</i><sup>2</sup> + <i>x</i><sup>2</sup> = 7.8986&hellip;<sup>2</sup> and <i>x</i> = '
           '7.8986&hellip; &divide; &radic;2 = 5.5851&hellip;, which is 5.59 to 3 significant '
           'figures &mdash; the next digit is a 5 with more after it, so it rounds up. 5.58 comes '
           'from rounding <i>r</i> too early',
    accept='5.59')
# Q10 and Q12: answers a student writes in a form the old cell refused
PARTS['10'] = dict(accept='6 | 6% | x = 6')
PARTS['12'] = dict(accept='3 : 4 : 11')

# ---- THE PAPER'S OWN LINE BREAKS, AND NO EXPRESSION SPLIT ACROSS TWO LINES -------------------------
# Every one of these read correctly and a screenshot at 390px is what found them: Q12's two ratios
# ran on as one sentence and broke "= 7 : 11" onto a line of its own, Q14(b)'s formula left "w ="
# behind at the end of a line with the fraction under it, Q20(b)'s column vector split its bracket
# from its numbers, and Q3(b)'s three ninths-of-25 were superscripts a reader squints at where the
# paper prints stacked fractions. The words are the paper's; only where a line may break changes.
NOWRAP = lambda s: '<span style="white-space:nowrap">%s</span>' % s      # noqa: E731
PARTS['3b']['html'] = (
    '<p>3 of the 25 women have a shoe size of 7</p><p>Zoe says that if you choose at random one of '
    'the 25 women, the probability that she has either a shoe size of 7 or a dress size of 14 is '
    + frac('9', '25') + ' because</p><p style="text-align:center">'
    + NOWRAP(frac('3', '25') + ' + ' + frac('6', '25') + ' = ' + frac('9', '25'))
    + '</p><p>Is Zoe correct?<br>You must give a reason for your answer.</p>')
PARTS['4'] = dict(html=(
    '<p>Daniel bakes 420 cakes.<br>He bakes only vanilla cakes, banana cakes, lemon cakes and '
    'chocolate cakes.</p><p>' + frac('2', '7') + ' of the cakes are vanilla cakes.<br>35% of the '
    'cakes are banana cakes.<br>The ratio of the number of lemon cakes to the number of chocolate '
    'cakes is ' + NOWRAP('4 : 5') + '</p><p>Work out the number of lemon cakes Daniel bakes.</p>'))
PARTS['6']['html'] = (
    '<p>The density of apple juice is 1.05 grams per cm<sup>3</sup>.</p><p>The density of fruit '
    'syrup is 1.4 grams per cm<sup>3</sup>.</p><p>The density of carbonated water is 0.99 grams per '
    'cm<sup>3</sup>.</p><p>25&nbsp;cm<sup>3</sup> of apple juice are mixed with 15&nbsp;cm<sup>3</sup> '
    'of fruit syrup and 280&nbsp;cm<sup>3</sup> of carbonated water to make a drink with a volume of '
    '320&nbsp;cm<sup>3</sup>.</p><p>Work out the density of the drink.<br>Give your answer correct to '
    '2 decimal places.</p>')
PARTS['8']['html'] = (
    '<p>A square, with sides of length <i>x</i>&nbsp;cm, is inside a circle.<br>Each vertex of the '
    'square is on the circumference of the circle.</p><p>The area of the circle is '
    '49&nbsp;cm<sup>2</sup>.</p><p>Work out the value of <i>x</i>.<br>Give your answer correct to 3 '
    'significant figures.</p>')
PARTS['10']['html'] = (
    '<p>Naoby invests &pound;6000 for 5 years.<br>The investment gets compound interest of '
    '<i>x</i>% per annum.</p><p>At the end of 5 years the investment is worth &pound;8029.35</p>'
    '<p>Work out the value of <i>x</i>.</p>')
PARTS['11'] = dict(html=(
    '<p>Jeff is choosing a shrub and a rose tree for his garden.<br>At the garden centre there are '
    '17 different types of shrubs and some rose trees.</p><p>Jeff says,</p><p>&ldquo;There are 215 '
    'different ways to choose one shrub and one rose tree.&rdquo;</p><p>Could Jeff be correct?<br>'
    'You must show how you get your answer.</p>'))
PARTS['12']['html'] = (
    '<p>The points <i>A</i>, <i>B</i>, <i>C</i> and <i>D</i> lie in order on a straight line.</p>'
    '<p style="text-align:center">' + NOWRAP('<i>AB</i> : <i>BD</i> = 1 : 5') + '<br>'
    + NOWRAP('<i>AC</i> : <i>CD</i> = 7 : 11') + '</p><p>Work out '
    + NOWRAP('<i>AB</i> : <i>BC</i> : <i>CD</i>') + '</p>')
PARTS['14b']['html'] = ('<p>Make <i>v</i> the subject of the formula &nbsp;'
                        + NOWRAP('<i>w</i> = ' + frac('15(<i>t</i> &minus; 2<i>v</i>)', '<i>v</i>'))
                        + '</p>')
PARTS['16b'] = dict(html=(
    '<p>Explain the relationship between the values of <i>x</i><sub>1</sub>, <i>x</i><sub>2</sub> '
    'and <i>x</i><sub>3</sub> and the equation '
    + NOWRAP('<i>x</i><sup>3</sup> + 2<i>x</i><sup>2</sup> + 4 = 0') + '</p>'))
PARTS['20a']['html'] = (
    '<p>The equation of a curve is &nbsp;' + NOWRAP('<i>y</i> = <i>a</i><sup><i>x</i></sup>')
    + '<br><i>A</i> is the point where the curve intersects the <i>y</i>-axis.</p>'
    '<p>State the coordinates of <i>A</i>.</p>')
PARTS['20b']['html'] = PARTS['20b']['html'].replace(
    COLVEC('3', '0'), NOWRAP(COLVEC('3', '0')))
assert NOWRAP(COLVEC('3', '0')) in PARTS['20b']['html']

DRAW = {'q1': q1, 'q5': q5, 'q7': q7, 'q9': q9, 'q13': q13, 'q15': q15, 'q18': q18}

# ================================================================================================
# NOTHING MAY BE PAINTED OUTSIDE THE BOX `check/cards.js` MEASURES
# ================================================================================================
DRAWN = {}
for name, fn in DRAW.items():
    s = fn()
    DRAWN[name] = s
    m = re.match(r'<svg viewBox="0 0 (\d+) ([\d.]+)"', s)
    assert m and int(m.group(1)) == W, '%s: viewBox width must be %d' % (name, W)
    h = float(m.group(2))
    pairs = [(float(a), float(b)) for a, b in re.findall(
        r'(?:cx|x1|x2|x)="(-?[\d.]+)"[^>]*?(?:cy|y1|y2|y)="(-?[\d.]+)"', s)]
    assert pairs, '%s: no coordinates found, so this guard would pass on anything' % name
    for x, y in pairs:
        assert 0 <= x <= W and 0 <= y <= h, '%s: (%s, %s) outside 0..%d x 0..%s' % (name, x, y, W, h)
    for pts in re.findall(r'points="([^"]+)"', s):
        for pair in pts.split():
            x, y = [float(v) for v in pair.split(',')]
            assert 0 <= x <= W and 0 <= y <= h, '%s: polygon point (%s, %s) outside' % (name, x, y)
    assert 'text-anchor="' not in s, '%s: use inline style, not the attribute -- CSS beats it' % name
    assert '<marker' not in s, '%s: no <marker> ids -- several cards share one page' % name

# ================================================================================================
# WRITE
# ================================================================================================
DUMP = lambda r: json.dumps(r, ensure_ascii=False, separators=(',', ':'))    # noqa: E731
lines = open(FILE, encoding='utf-8').read().split('\n')
out, made, touched, dated = [], [], [], 0
first_part = {q: min(p for p in MARKS if re.match(r'^%s[a-z]$' % q, p)) for q in PREAMBLES}
seen_marks = {}

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
    rid = row.get('row_id', '')
    # THIS SCRIPT MUST NOT RUN TWICE -- a second run would add five more preambles with the same
    # ids. `tools/refine-1f-2406-p1.py` records learning that the expensive way.
    if rid in [ID(q) for q in PREAMBLES] or row.get('exam_date'):
        raise SystemExit('%s is already refined -- this script has already run against this file'
                         % rid)
    row['exam_date'] = DATE
    dated += 1
    if row.get('kind') != 'question':
        out.append(DUMP(row) + (',' if trailing else ''))
        continue
    short = rid.replace(ID(''), '')
    seen_marks[short] = int(row.get('marks') or 0)

    # a new preamble goes in FRONT of the first part of its question
    q = str(row.get('question'))
    if q in PREAMBLES and short == first_part[q]:
        p = PREAMBLES[q]
        t = dict(row)
        for k in ('part', 'marks', 'answer', 'answer_type', 'accept', 'figure', 'examiner_note',
                  'lead', 'diagram', 'diagram_by'):
            t.pop(k, None)
        t.update(row_id=ID(q), kind='preamble', question=q, part='', marks='', html=p['html'],
                 topics=p['topics'], sort_order='1')
        if p['diagram']:
            t['diagram'] = DRAWN[p['diagram']]
            t['diagram_by'] = 'family'
        out.append(DUMP(t) + ',')
        made.append(t['row_id'])

    if short in PARTS:
        d = PARTS[short]
        for k in ('html', 'answer', 'accept', 'figure'):
            if k in d:
                row[k] = d[k]
        if d.get('diagram'):
            row['diagram'] = DRAWN[d['diagram']]
            row['diagram_by'] = 'family'
        touched.append(short)
    out.append(DUMP(row) + (',' if trailing else ''))

assert seen_marks == MARKS, 'the rows disagree with the printed marks: %s' % (
    {k: (seen_marks.get(k), MARKS.get(k)) for k in set(seen_marks) | set(MARKS)
     if seen_marks.get(k) != MARKS.get(k)})
assert sorted(made) == sorted(ID(q) for q in PREAMBLES), made
assert sorted(touched) == sorted(PARTS), (sorted(touched), sorted(PARTS))
assert dated == len(MARKS) + 1, dated                     # 28 parts and the document row
open(FILE, 'w', encoding='utf-8').write('\n'.join(out))

print('paper %s: %d parts, %d marks, dated %s' % (PAPER, len(MARKS), sum(MARKS.values()), DATE))
print('preambles written: %s' % ', '.join(made))
print('rows changed: %s' % ', '.join(sorted(touched, key=lambda s: (int(re.match(r'\d+', s).group()), s))))
print('drawings: %d, each %d wide -- %s' % (len(DRAWN), W, ', '.join(sorted(DRAWN))))
print('  Q5  at B: 90 + 120 + 150 = 360, exterior 60, 6 sides')
print('  Q7  AB = 15 sin 23 = %.4f -> 5.86' % Q7_AB)
print('  Q8  x = %.5f -> 5.59 (was 5.58)' % Q8_X)
print('  Q9  male 20/150/250/330/750, IQR 180; female from the table')
print('  Q13 triangle (-6,-2) (-2,-2) (2,2) under y = x/2 + 1, above y = x and y = -2')
print('  Q15 x = %.5f -> 2.63' % Q15_X)
print('  Q18 arc ABC = %.4f -> 21.6 (minor arc 9.82 is the trap)' % Q18_ARC)
