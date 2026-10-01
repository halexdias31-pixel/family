"""
TWO FOUNDATION PAPER 1s AUDITED AGAINST THE PAPERS THEMSELVES, AND THE DIAGRAMS REDRAWN FROM THEM.

Edexcel 1MA1/1F June 2024 (RS1786302107764-415) and 1MA1/1F May 2017 (RS1786302107764-481).

ASKED FOR AS *"for theo i just do foundation maths papers with him. but last time the diagrams were
bad or somehting ... the papers i do typically something is always wrong like your diagrams or
something. i just want it to be good."*

THE 2024 DRAWINGS WERE MADE WITHOUT THE PAPER, AND IT SHOWED. `tools/refine-f-p1-audit.py`'s
predecessor, `refine-1f-2406-p1.py`, drew every figure from the row's prose and the mark scheme's
arithmetic, and said so -- "the size of that angle was chosen here", "WHERE on the grid triangle A
sits was chosen here". The question paper has been in Drive the whole time
(`Question paper - Paper 1F - June 2024.pdf`), and every one of its figures is VECTOR artwork, so
the real coordinates come straight out of `page.get_drawings()`. Measured against them:

  Q3   the small angle is ACUTE (37 degrees), not obtuse -- so the answer's own "head off obtuse"
       sentence was teaching the wrong trap. The reflex arc is a near-full circle round the vertex.
  Q7   the grid is 13 by 16 one-centimetre squares with a dark left and bottom edge -- not 11 by 10
       with millimetre subdivisions.
  Q8   the letters were in the wrong places: x is angle AOB on the paper, and the drawing had x
       between C and A. OC points right, OB straight down, OA down-left.
  Q9   input and output are words, not boxes.
  Q12  36 cm and 30 cm were swapped (36 is the long slanted side), and the rectangle had lost its
       "length" label and had 4 cm on the wrong side.
  Q19  triangle A is (-3,1),(-3,3),(-2,3) and B is (2,-3),(2,-1),(3,-1). The drawing had invented
       both. The vector is still (5, -4), which the triangles now prove rather than assert.
  Q22  the L had its notch at the top right; the paper's is at the BOTTOM right, with right-angle
       marks at five corners.
  Q23  18 is in the overlap and 15 is in P only. The drawing had them the other way round -- and
       so did BOTH answers, which told a student "15 is the one students lose, it sits in the
       overlap". P' and P u Q are unchanged, because both 15 and 18 are in P.
  Q16  a table of prices stood in for the paper's picture of battery packs. The paper says the
       three prices in three sentences under that picture, so those sentences are what is here.
  Q21b Kevin's working broke across lines at 320px -- "= 1" on one line and its 9/24 on the next.
       It is three lines now, as printed, each held together.

THE 2017 PAPER IS NOT IN DRIVE, BUT ITS TEXT AND HALF ITS FIGURES ARE. The 1H paper of the same
morning (P48147A, Thursday 25 May 2017) is in Drive and its Q1 to Q6 ARE the Foundation's Q21 to
Q26, so those figures were measured off it. The Foundation paper's own text (P48134A) was found in a
public notebook on GitHub, which settles every question's wording, the spinner's labels and what
each picture shows. What could NOT be checked against the original is said in each row's
`examiner_note` rather than guessed at silently.

  Q6   the spinner drawing was broken -- a diamond with its bottom cut off and a stray line through
       one section. Redrawn, and moved onto a preamble so part (ii) can see it too.
  Q7   the answer said nonsense ("the sausages cost 2.30 each only if the other items come to
       4.60, and they come to 4.60"). One packet costs 1.70.
  Q21  the scatter graph is redrawn off the 1H paper: one point is at (10.4, 13), not (10.5, 13),
       and the y-axis now carries every label the paper prints (10 to 20 in twos) and its titles.
  Q25  the diagonal runs bottom-left to top-right, with right-angle marks, as printed.
  Q15  the existing drawing's right-angle mark straddled the triangle's corner, and "width" sat on
       the rectangle's edge because `text-anchor` was an attribute, which `.qsheet .lbl` overrules.
  and every 2017 row that described its picture in prose now carries the paper's own words instead.

AND THE MARKING, WHICH IS THE ONE THING THAT TELLS A CHILD THEY ARE WRONG. Every `accept` was run
through the app's own `markAnswer_` with the answers a student actually types. Found:

  2024 Q6  `GBP1.5(0)` marked 1.5, 1.50 and GBP1.50 all WRONG -- the bracket notation is the
           scheme's shorthand, not something anybody types.
  2024 Q4  a list is compared as a SET, so any order of the five decimals was marked right on a
           question that is only about order. A person marks it now.
  2024 Q2, Q13b, Q23, Q25, Q26 and 2017 Q3, Q4, Q15, Q17, Q19, Q21, Q22, Q25, Q27: a right
           answer in an ordinary spelling (30%, 0.67, y=1.5x+3, 7.5%, x = 12.5, 56fe, 2^3 x 7,
           2x2x2x7, 13.5cm, -b-a ...) was marked wrong.
  2024 Q13a stays `1` alone. The marker strips a % sign, so `100%` would also pass a bare "100",
           which this scheme refuses by name; "100%" being told "not yet" is the smaller wrong.
  "Is X right? You must show / give a reason" rows had `accept: Yes/No` -- so "No, it is 1.70"
  was marked WRONG while a bare "No" scored. Those are a person's to mark, and the scheme agrees:
  the decision alone is worth nothing.

RUN ONCE. It edits data/questions.json in place and refuses to run a second time.
"""
import json
import math
import os
import re
import sys
from fractions import Fraction

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgplot import W                      # noqa: E402  the one place the scale lives

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.path.join(HERE, 'data', 'questions.json')

P24 = 'RS1786302107764-415'
P17 = 'RS1786302107764-481'
I24 = lambda s: 'Q-1MA1-2406-1F-%s' % s     # noqa: E731
I17 = lambda s: 'Q-1MA1-1706-1F-%s' % s     # noqa: E731
STEM17 = lambda q: 'S-%s-q%s' % (P17, q)    # noqa: E731
NEW_STEM = STEM17('6')                      # the run-once marker: this script creates it

NOT_SCALE = 'Diagram NOT accurately drawn'


# ================================================================================================
# THE REPLICA. A figure is the paper's own vector coordinates, in PDF points, mapped onto the
# 340-wide viewBox by one scale and one offset -- so nothing is placed by eye, and a figure cannot
# disagree with the page it was measured from except by the scale everything shares.
# ================================================================================================
class Fig:
    def __init__(self, ox, oy, k, dx, dy, h):
        self.ox, self.oy, self.k, self.dx, self.dy, self.h = ox, oy, k, dx, dy, h
        self.parts = []
        self.pts = []                     # every coordinate written, for the in-the-box guard

    def p(self, x, y):
        X, Y = (x - self.ox) * self.k + self.dx, (y - self.oy) * self.k + self.dy
        self.pts.append((X, Y))
        return X, Y

    def line(self, x1, y1, x2, y2, w=1.3, extra=''):
        a, b = self.p(x1, y1), self.p(x2, y2)
        self.parts.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
                          'stroke-width="%s"%s/>' % (a[0], a[1], b[0], b[1], w, extra))

    def poly(self, pts, w=1.3, fill='none', closed=True, extra=''):
        q = ' '.join('%.1f,%.1f' % self.p(x, y) for x, y in pts)
        tag = 'polygon' if closed else 'polyline'
        self.parts.append('<%s points="%s" fill="%s" stroke="currentColor" stroke-width="%s"%s/>'
                          % (tag, q, fill, w, extra))

    def head(self, pts):
        """A filled arrowhead, the paper's own three points. Never a <marker>: a marker needs an
           id, and several cards share one page."""
        q = ' '.join('%.1f,%.1f' % self.p(x, y) for x, y in pts)
        self.parts.append('<polygon points="%s" fill="currentColor" stroke="none"/>' % q)

    def circle(self, cx, cy, r, w=1.3):
        c = self.p(cx, cy)
        self.pts.append((c[0] - r * self.k, c[1] - r * self.k))
        self.pts.append((c[0] + r * self.k, c[1] + r * self.k))
        self.parts.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="currentColor" '
                          'stroke-width="%s"/>' % (c[0], c[1], r * self.k, w))

    def arc(self, cx, cy, r, a0, a1, w=1.1):
        """An arc in MATHS degrees (anticlockwise from the positive x-axis, y up), drawn from a0
           to a1 going anticlockwise -- so the sweep the angle covers is unambiguous, which is the
           whole fault this file found on Q3 and Q8."""
        span = (a1 - a0) % 360.0
        pt = lambda a: (cx + r * math.cos(math.radians(a)), cy - r * math.sin(math.radians(a)))  # noqa: E731
        s, e = self.p(*pt(a0)), self.p(*pt(a1))
        for t in range(0, 101, 5):                      # the arc's own extent, for the guard
            self.p(*pt(a0 + span * t / 100.0))
        # in screen coordinates (y down) anticlockwise-in-maths is sweep-flag 0
        self.parts.append('<path d="M %.1f %.1f A %.1f %.1f 0 %d 0 %.1f %.1f" fill="none" '
                          'stroke="currentColor" stroke-width="%s"/>'
                          % (s[0], s[1], r * self.k, r * self.k, 1 if span > 180 else 0,
                             e[0], e[1], w))

    def text(self, x, base, s, cls='num', anchor='middle', style=''):
        """`x` is the anchor point and `base` the baseline, both in PDF points. INLINE `style` for
           the anchor, never the attribute: `.qsheet .num { text-anchor: middle }` beats an SVG
           presentation attribute, which CLAUDE.md records costing ten y-axis numbers once."""
        X, Y = self.p(x, base)
        st = 'text-anchor:%s' % anchor + (';' + style if style else '')
        self.parts.append('<text x="%.1f" y="%.1f" class="%s" style="%s">%s</text>'
                          % (X, Y, cls, st, s))

    def span(self, bb, s, cls='num', anchor='middle', style='', base=9.7):
        """A text span placed where the paper prints it. `bb` is the PDF span's own bounding box;
           a 12pt Times span's baseline sits 9.7pt below the top of that box."""
        x0, y0, x1, y1 = bb
        x = {'middle': (x0 + x1) / 2.0, 'start': x0, 'end': x1}[anchor]
        self.text(x, y0 + base, s, cls, anchor, style)

    def raw(self, s):
        self.parts.append(s)

    def cap(self, y, s):
        self.parts.append('<text x="%.1f" y="%.1f" class="cap" style="text-anchor:middle">%s</text>'
                          % (W / 2.0, y, s))

    def svg(self, label):
        for X, Y in self.pts:
            assert -0.5 <= X <= W + 0.5 and -0.5 <= Y <= self.h + 0.5, (label[:40], X, Y)
        return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>'
                % (W, self.h, label, ''.join(self.parts)))


def deg_between(o, a):
    """The direction of the ray from o to a, in maths degrees with y up."""
    return math.degrees(math.atan2(-(a[1] - o[1]), a[0] - o[0])) % 360.0


# ================================================================================================
# JUNE 2024 1F -- every figure off `Question paper - Paper 1F - June 2024.pdf`, page by page
# ================================================================================================

# ---- Q3 (page 2): two rays from a vertex on the right, and y on the reflex angle ----------------
Q3_V = (337.8, 436.3)
Q3_R1 = (238.0, 377.9)          # up and to the left
Q3_R2 = (237.8, 448.7)          # slightly down and to the left
Q3_A1, Q3_A2 = deg_between(Q3_V, Q3_R1), deg_between(Q3_V, Q3_R2)
Q3_SMALL = Q3_A2 - Q3_A1
assert 30 < Q3_SMALL < 45, Q3_SMALL                 # ACUTE: the answer's trap is "acute", not obtuse
assert 180 < 360 - Q3_SMALL < 360                   # and y, the other way round, is reflex


def q3():
    f = Fig(230.0, 370.0, 1.75, 30.0, 10.0, 160)
    f.line(*Q3_V, *Q3_R1)
    f.line(*Q3_V, *Q3_R2)
    # the paper's arc: radius 19.4 round the vertex, the long way, from one ray round to the other
    f.arc(Q3_V[0], Q3_V[1], 19.4, Q3_A2, Q3_A1 + 360.0)
    f.span((344.0, 430.3, 349.3, 442.3), 'y', 'lbl')
    return f.svg('Two straight lines meeting at a point, with a small acute angle between them. '
                 'The angle marked y is the one that goes the long way round the point.')


# ---- Q7 (page 4): 13 by 16 one-centimetre squares, a dark left edge and a dark bottom edge ------
Q7_COLS, Q7_ROWS = 13, 16
assert round((481.9 - 113.4) / 28.35) == Q7_COLS and round((682.4 - 228.8) / 28.35) == Q7_ROWS


def q7():
    cell = 21.0
    L = (W - Q7_COLS * cell) / 2.0
    T = 6.0
    R, B = L + Q7_COLS * cell, T + Q7_ROWS * cell
    p = []
    for i in range(Q7_COLS + 1):
        x = L + i * cell
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
                 'stroke-width=".8" opacity=".45"/>' % (x, T, x, B))
    for j in range(Q7_ROWS + 1):
        y = T + j * cell
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
                 'stroke-width=".8" opacity=".45"/>' % (L, y, R, y))
    # the paper draws the left edge and the bottom edge black: the two axes, with no scale on them,
    # because the scale is one of the four marks
    p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>' % (L, T, L, B))
    p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>' % (L, B, R, B))
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="A grid of squares, thirteen across '
            'and sixteen up, with a dark line up the left edge and along the bottom edge and '
            'nothing else drawn on it.">%s</svg>' % (W, B + 6, ''.join(p)))


# ---- Q8 (page 5): OC right, OB straight down, OA down-left; 220 over the top, x = AOB -----------
Q8_O, Q8_A, Q8_B, Q8_C = (292.4, 116.7), (218.6, 159.1), (292.4, 201.6), (377.3, 116.7)
Q8_aA, Q8_aB, Q8_aC = deg_between(Q8_O, Q8_A), deg_between(Q8_O, Q8_B), deg_between(Q8_O, Q8_C)
assert abs(Q8_aC - 0) < 0.5 and abs(Q8_aB - 270) < 0.5 and 205 < Q8_aA < 215
Q8_X = 360 - 220 - 90
assert Q8_X == 50                                   # the scheme's answer, from its own working


def q8():
    f = Fig(200.0, 80.0, 1.45, 25.0, 6.0, 226)
    for end in (Q8_A, Q8_B, Q8_C):
        f.line(*Q8_O, *end)
    # the paper's circle round O, broken at the rays into the three angles it labels
    f.arc(Q8_O[0], Q8_O[1], 29.1, Q8_aC, Q8_aA)              # 220: C round over the top to A
    f.arc(Q8_O[0], Q8_O[1], 32.9, Q8_aA, Q8_aB)              # x: A to B, the angle AOB
    f.arc(Q8_O[0], Q8_O[1], 30.6, Q8_aB, Q8_aC + 360)        # 90: B to C
    f.span((280.7, 89.0, 298.7, 101.0), '220°')
    f.span((286.3, 103.4, 295.0, 115.4), 'O', 'lbl')
    f.span((278.7, 127.3, 284.0, 139.3), 'x', 'lbl')
    f.span((298.1, 121.3, 310.1, 133.3), '90°', 'num', 'start')
    f.span((209.2, 154.3, 216.5, 166.3), 'A', 'lbl')
    f.span((287.1, 201.0, 294.5, 213.0), 'B', 'lbl')
    f.span((378.2, 108.3, 386.3, 120.3), 'C', 'lbl', 'start')
    f.cap(220, NOT_SCALE)          # clear of B's own label
    return f.svg('Three straight lines from O: OC to the right, OB straight down and OA down to '
                 'the left. Angle AOC over the top is 220 degrees, angle BOC is 90 degrees and '
                 'angle AOB is marked x.')


# ---- Q9 (page 6): input -> [x 2] -> [- 10] -> output ---------------------------------------------
def q9():
    f = Fig(146.0, 84.0, 1.05, 14.0, 6.0, 46)
    f.raw('')
    for (x1, x2, hx) in ((179.3, 213.4, 219.0), (274.6, 308.6, 314.3), (369.9, 403.9, 409.5)):
        f.line(x1, 103.3, x2, 103.3, 1.1)
        f.head([(hx - 5.65, 100.5), (hx, 103.3), (hx - 5.65, 106.2)])
    f.poly([(221.0, 87.6), (274.6, 87.6), (274.6, 119.0), (221.0, 119.0)], 1.1)
    f.poly([(316.2, 87.6), (369.9, 87.6), (369.9, 119.0), (316.2, 119.0)], 1.1)
    f.span((150.5, 96.9, 175.2, 108.9), 'input')
    f.span((238.1, 96.9, 257.5, 108.9), '× 2')
    f.span((332.3, 96.9, 354.3, 108.9), '− 10')
    f.span((414.1, 96.9, 444.8, 108.9), 'output')
    return f.svg('A number machine: input, then a box multiplying by 2, then a box subtracting '
                 '10, then output.')


# ---- Q12 (page 8): the triangle 30 / 36 / 14 and the rectangle 4 by "length" ---------------------
Q12_TRI = [(143.1, 157.7), (272.9, 157.7), (289.9, 87.9)]
Q12_RECT = (359.8, 118.2, 427.0, 157.7)
Q12_SIDES = {'30 cm': 30, '36 cm': 36, '14 cm': 14}
_tri_len = lambda a, b: math.hypot(b[0] - a[0], b[1] - a[1])  # noqa: E731
# the LONGEST side on the page carries the LONGEST label: 36 on the slant, 30 on the base, 14 right
_drawn = {'30 cm': _tri_len(Q12_TRI[0], Q12_TRI[1]), '36 cm': _tri_len(Q12_TRI[0], Q12_TRI[2]),
          '14 cm': _tri_len(Q12_TRI[1], Q12_TRI[2])}
assert sorted(_drawn, key=_drawn.get) == sorted(Q12_SIDES, key=Q12_SIDES.get), _drawn
assert (sum(Q12_SIDES.values()) / 4 - 2 * 4) / 2 == 6          # the scheme's 6


def q12():
    f = Fig(140.0, 84.0, 1.0, 10.0, 6.0, 124)
    f.poly(Q12_TRI)
    x0, y0, x1, y1 = Q12_RECT
    f.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])
    f.span((194.5, 161.2, 222.9, 173.2), '30 cm')
    f.span((189.9, 109.0, 218.2, 121.0), '36 cm')
    f.span((285.5, 119.8, 313.9, 131.8), '14 cm', 'num', 'start')
    f.span((431.5, 131.1, 453.9, 143.1), '4 cm', 'num', 'start')
    f.span((381.1, 161.2, 411.1, 173.2), 'length')
    f.cap(117, NOT_SCALE)
    return f.svg('A triangle with sides 30 cm along the bottom, 36 cm up the long slanted side and '
                 '14 cm on the short side, and a rectangle 4 cm high whose other side is labelled '
                 'length.')


# ---- Q19 (page 14) and Q25 (page 20): a coordinate grid, one centimetre to one unit ---------------
U = 28.35


def grid(f, ox, oy, xs, ys, xmax_arrow, ymax_arrow, xlabels, ylabels, olabel):
    """The paper's grid: grey squares, black axes with filled arrowheads, the numbers where the
       paper prints them -- x-axis numbers centred under their line, y-axis numbers set against
       the axis. `ox`, `oy` is the origin in PDF points."""
    X = lambda v: ox + v * U          # noqa: E731
    Y = lambda v: oy - v * U          # noqa: E731
    for v in range(xs[0], xs[1] + 1):
        f.line(X(v), Y(ys[1]), X(v), Y(ys[0]), .8, ' opacity=".4"')
    for v in range(ys[0], ys[1] + 1):
        f.line(X(xs[0]), Y(v), X(xs[1]), Y(v), .8, ' opacity=".4"')
    f.line(X(0), Y(ys[0]), X(0), ymax_arrow + 6.3, 1.3)
    f.head([(X(0) + 4.4, ymax_arrow + 7.6), (X(0), ymax_arrow), (X(0) - 4.4, ymax_arrow + 7.6)])
    f.line(X(xs[0]), Y(0), xmax_arrow - 6.3, Y(0), 1.3)
    f.head([(xmax_arrow - 7.5, Y(0) + 4.4), (xmax_arrow, Y(0)), (xmax_arrow - 7.5, Y(0) - 4.4)])
    for v in xlabels:
        f.text(X(v), Y(0) + 12.4, ('–%d' % -v) if v < 0 else '%d' % v)
    for v in ylabels:
        f.text(X(0) - 3.9, Y(v) + 4.0, ('–%d' % -v) if v < 0 else '%d' % v, 'num', 'end')
    f.text(X(0) - 3.8, Y(0) + 12.0, 'O', 'lbl', 'end')
    f.text(X(0) - 4.4, ymax_arrow + 2.5, 'y', 'lbl', 'end')
    f.text(xmax_arrow + 0.5, Y(0) + 10.7, 'x', 'lbl', 'start')
    return X, Y


Q19_A = [(-3, 1), (-3, 3), (-2, 3)]
Q19_B = [(2, -3), (2, -1), (3, -1)]
_vec = {(b[0] - a[0], b[1] - a[1]) for a, b in zip(Q19_A, Q19_B)}
assert _vec == {(5, -4)}, _vec                       # every vertex moves by the scheme's (5, -4)
# and the paper's own drawing says the same: A's corner at (203.5, 215.1), origin at (288.5, 243.5)
assert round((203.5 - 288.5) / U) == -3 and round((243.5 - 215.1) / U) == 1


def q19():
    f = Fig(136.0, 70.0, 1.0, 6.0, 4.0, 330)
    X, Y = grid(f, 288.5, 243.5, (-5, 5), (-5, 5), 454.3, 77.7,
                [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], True)
    for tri, name in ((Q19_A, 'A'), (Q19_B, 'B')):
        f.poly([(X(a), Y(b)) for a, b in tri], 1.5, 'currentColor', True, ' fill-opacity=".18"')
        cx = sum(X(a) for a, b in tri) / 3.0
        cy = sum(Y(b) for a, b in tri) / 3.0
        f.text(cx - 3.5, cy + 0.5, name, 'lbl', 'middle', 'font-style:normal')
    return f.svg('A coordinate grid from minus 5 to 5 on both axes. Triangle A has corners at '
                 '(-3, 1), (-3, 3) and (-2, 3). Triangle B has corners at (2, -3), (2, -1) and '
                 '(3, -1).')


# Q25: L runs from (-4, -3) up to where it leaves the grid at y = 7
Q25_GRAD, Q25_C = Fraction(3, 2), 3
assert Q25_GRAD * -4 + Q25_C == -3                  # the paper's line starts at the corner (-4, -3)
assert abs(float((7 - Q25_C) / Q25_GRAD) - (363.2 - 288.1) / U) < 0.03   # and leaves at y = 7 (to half a point)


def q25():
    f = Fig(160.0, 84.0, 1.0, 12.0, 6.0, 330)
    X, Y = grid(f, 288.1, 312.7, (-4, 4), (-3, 7), 425.3, 92.8,
                [-4, -3, -2, -1, 1, 2, 3, 4], [-3, -2, -1, 1, 2, 3, 4, 5, 6, 7], True)
    x_top = float((7 - Q25_C) / Q25_GRAD)
    f.line(X(-4), Y(-3), X(x_top), Y(7), 1.6)
    f.span((355.9, 125.6, 363.9, 137.6), 'L', 'lbl', 'middle', 'font-style:normal')
    return f.svg('A coordinate grid with x from -4 to 4 and y from -3 to 7. A straight line L '
                 'runs from the corner (-4, -3) up through (0, 3) and leaves the top of the grid '
                 'just before x = 3.')


# ---- Q22 (page 16): the floor plan, notch at the BOTTOM right, five right-angle marks -----------
Q22_OUTLINE = [(219.9, 102.7), (376.0, 102.7), (376.0, 175.8), (307.4, 175.8), (307.4, 212.6),
               (219.9, 212.6)]
Q22_MARKS = [[(228.4, 102.7), (228.4, 111.2), (219.9, 111.2)],
             [(219.9, 204.1), (228.4, 204.1), (228.4, 212.6)],
             [(299.0, 212.5), (299.0, 204.0), (307.5, 204.0)],
             [(367.5, 175.7), (367.5, 167.2), (376.0, 167.2)],
             [(376.0, 111.2), (367.5, 111.2), (367.5, 102.7)]]
# the lengths the paper prints, on the sides it prints them on: top 10, left 8, bottom 6, right 5
Q22_LEN = {'top': 10, 'left': 8, 'bottom': 6, 'right': 5}
Q22_AREA = Q22_LEN['top'] * Q22_LEN['left'] - (Q22_LEN['top'] - Q22_LEN['bottom']) * (
    Q22_LEN['left'] - Q22_LEN['right'])
assert Q22_AREA == 68                               # "80" - "12", the scheme's own route
assert 3 * 2.5 * 10 == 75 and Q22_AREA < 75         # so the answer to (a) is Yes
# the notch really is at the bottom right: the bottom edge stops short and the right edge does too
assert Q22_OUTLINE[3][0] < Q22_OUTLINE[2][0] and Q22_OUTLINE[2][1] < Q22_OUTLINE[4][1]


def q22():
    f = Fig(190.0, 80.0, 1.45, 14.0, 6.0, 240)
    f.poly(Q22_OUTLINE, 1.3)
    for m in Q22_MARKS:
        f.poly(m, 1.0, 'none', False)
    f.span((286.4, 85.4, 309.4, 97.4), '10 m')
    f.span((255.0, 212.7, 272.0, 224.7), '6 m')
    f.span((198.1, 148.6, 215.1, 160.6), '8 m', 'num', 'end')
    f.span((380.2, 130.5, 397.2, 142.5), '5 m', 'num', 'start')
    f.cap(233, NOT_SCALE)          # clear of the 6 m under the bottom edge
    return f.svg('The plan of a floor: an L shape. The top edge is 10 m and the left edge is '
                 '8 m. The bottom edge is 6 m and the right edge is 5 m, with a rectangular '
                 'corner missing from the bottom right.')


# ---- Q23 (page 18): the Venn diagram, read off where each number is printed ----------------------
Q23_P, Q23_Q, Q23_R = (270.7, 156.7), (324.6, 156.7), 53.6
Q23_NUMS = {12: (255.4, 145.0), 18: (297.6, 155.4), 10: (346.1, 145.6), 14: (346.1, 179.3),
            15: (255.4, 178.7), 11: (241.85, 222.5), 13: (279.0, 222.5), 16: (316.2, 222.5),
            17: (353.4, 222.5)}
_in = lambda c, pt: math.hypot(pt[0] - c[0], pt[1] - c[1]) < Q23_R   # noqa: E731
SET_P = {n for n, pt in Q23_NUMS.items() if _in(Q23_P, pt)}
SET_Q = {n for n, pt in Q23_NUMS.items() if _in(Q23_Q, pt)}
assert SET_P == {12, 15, 18} and SET_Q == {10, 14, 18}, (SET_P, SET_Q)
assert SET_P & SET_Q == {18}                        # 18 is the overlap -- NOT 15
assert sorted(set(Q23_NUMS) - SET_P) == [10, 11, 13, 14, 16, 17]       # the scheme's P'
assert sorted(SET_P | SET_Q) == [10, 12, 14, 15, 18]                    # the scheme's M1 list


def q23():
    f = Fig(160.0, 84.0, 1.2, 4.0, 4.0, 192)
    f.poly([(164.7, 87.5), (430.6, 87.5), (430.6, 239.1), (164.7, 239.1)], 1.1)
    f.circle(*Q23_P, Q23_R, 1.1)
    f.circle(*Q23_Q, Q23_R, 1.1)
    f.span((169.8, 91.2, 178.6, 103.2), 'E', 'lbl')
    f.span((234.0, 110.3, 241.3, 122.3), 'P', 'lbl')
    f.span((352.8, 109.9, 361.4, 121.9), 'Q', 'lbl')
    for n, (x, y) in Q23_NUMS.items():
        f.text(x, y + 3.7, str(n))
    return f.svg('A Venn diagram inside a rectangle E. Circle P holds 12 and 15 on its own, '
                 'circle Q holds 10 and 14 on its own, and 18 is in the overlap of P and Q. '
                 '11, 13, 16 and 17 are outside both circles.')


# ================================================================================================
# MAY 2017 1F
# ================================================================================================

# ---- Q6: the spinner, AB over CB as the paper's text prints it ------------------------------------
def spinner17():
    """A square stood on its corner, split by its two diagonals -- one across and one down -- into
       four sections. The paper's text layer prints the letters as two rows, "A B" over "C B", so
       A is top left, B top right, C bottom left and B bottom right."""
    cx, cy, r = 170.0, 70.0, 58.0
    p = ['<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" '
         'stroke="currentColor" stroke-width="1.4"/>'
         % (cx, cy - r, cx + r, cy, cx, cy + r, cx - r, cy)]
    p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
             'stroke-width="1.2"/>' % (cx - r, cy, cx + r, cy))
    p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
             'stroke-width="1.2"/>' % (cx, cy - r, cx, cy + r))
    for dx, dy, s in ((-1, -1, 'A'), (1, -1, 'B'), (-1, 1, 'C'), (1, 1, 'B')):
        p.append('<text x="%.1f" y="%.1f" class="lbl" style="text-anchor:middle;'
                 'font-style:normal">%s</text>' % (cx + dx * r / 3.0, cy + dy * r / 3.0 + 4.5, s))
    return ('<svg viewBox="0 0 %d 140" role="img" aria-label="A fair four-sided spinner: a square '
            'standing on one corner, divided by its two diagonals into four equal sections '
            'labelled A, B, C and B.">%s</svg>' % (W, ''.join(p)))


SPIN = ['A', 'B', 'C', 'B']
assert Fraction(SPIN.count('B'), len(SPIN)) == Fraction(1, 2) and SPIN.count('F') == 0


# ---- Q21: the scatter graph, off 1MA1/1H May 2017 page 2 (it is that paper's Q1) ----------------
SCATTER = [(9.5, 11.5), (10, 19), (10.4, 13), (10.5, 12), (11, 14), (11, 13), (11.5, 15),
           (12, 15), (12.5, 16), (13, 17), (14, 18), (14.5, 19), (15, 20), (15.3, 20)]
# measured: cross centres on the page, against the axes' own ticks (7 at x 186.4, 17 at 469.8;
# 10 at y 501.2, 21 at 189.3)
_CROSSES = [(257.9, 458.9), (271.9, 246.0), (282.8, 416.4), (285.2, 445.0), (300.2, 388.1),
            (300.2, 416.4), (314.0, 359.6), (328.1, 359.6), (342.3, 331.3), (356.8, 303.6),
            (384.8, 275.0), (399.0, 246.0), (413.4, 218.0), (421.7, 218.0)]
for (vx, vy), (cx, cy) in zip(SCATTER, _CROSSES):
    assert abs(7 + (cx - 186.4) / 28.34 - vx) < 0.05 and abs(10 + (501.2 - cy) / 28.355 - vy) < 0.05
assert len(SCATTER) == 14                           # "fourteen British towns"


def _outlier(pts):
    """The point furthest from the least-squares line through the other thirteen -- which is what
       "outlier" means here, worked out rather than asserted."""
    best = None
    for i, (x0, y0) in enumerate(pts):
        rest = pts[:i] + pts[i + 1:]
        n = len(rest)
        mx = sum(x for x, y in rest) / n
        my = sum(y for x, y in rest) / n
        b = sum((x - mx) * (y - my) for x, y in rest) / sum((x - mx) ** 2 for x, y in rest)
        d = abs(y0 - (my + b * (x0 - mx)))
        if best is None or d > best[0]:
            best = (d, (x0, y0), my, b, mx)
    return best


_o = _outlier(SCATTER)
assert _o[1] == (10, 19), _o                        # the scheme's (10, 19)
assert _o[3] > 0                                    # and positive correlation without it
_hrs = _o[4] + (16.4 - _o[2]) / _o[3]
assert 12 <= _hrs <= 13, _hrs                       # 16.4 C reads back inside the scheme's 12 to 13


def scatter21():
    k = 0.84
    ox, oy = 186.4, 501.2                           # (7, 10) on the page
    L0, B0 = 92.0, 280.0                            # where (7, 10) lands in the svg
    ux, uy = 28.34 * k, 28.355 * k
    X = lambda v: L0 + (v - 7) * ux                 # noqa: E731
    Y = lambda v: B0 - (v - 10) * uy                # noqa: E731
    p = []
    for i in range(0, 51):                          # minor every 0.2, unit lines heavier
        x = X(7 + i * 0.2)
        op = '.55' if i % 5 == 0 else '.22'
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
                 'stroke-width="%s" opacity="%s"/>' % (x, Y(21), x, Y(10),
                                                        '.7' if i % 10 == 0 else '.5', op))
    for j in range(0, 56):
        y = Y(10 + j * 0.2)
        op = '.55' if j % 5 == 0 else '.22'
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
                 'stroke-width="%s" opacity="%s"/>' % (X(7), y, X(17), y,
                                                        '.7' if j % 10 == 0 else '.5', op))
    top, right = Y(10 + (501.2 - 175.2) / 28.355), X(7 + (486.3 - 186.4) / 28.34)
    p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>'
             % (X(7), Y(10), X(7), top + 5))
    p.append('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor"/>'
             % (X(7) - 3.6, top + 6.4, X(7), top, X(7) + 3.6, top + 6.4))
    p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>'
             % (X(7), Y(10), right - 5, Y(10)))
    p.append('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor"/>'
             % (right - 6.4, Y(10) - 3.6, right, Y(10), right - 6.4, Y(10) + 3.6))
    for v in (7, 9, 11, 13, 15, 17):
        p.append('<text x="%.1f" y="%.1f" class="num" style="text-anchor:middle">%d</text>'
                 % (X(v), Y(10) + 15, v))
    for v in (10, 12, 14, 16, 18, 20):
        p.append('<text x="%.1f" y="%.1f" class="num" style="text-anchor:end">%d</text>'
                 % (X(7) - 5, Y(v) + 4.3, v))
    for x, y in SCATTER:
        cx, cy = X(x), Y(y)
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                 % (cx - 3, cy - 3, cx + 3, cy + 3))
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                 % (cx - 3, cy + 3, cx + 3, cy - 3))
    # the axis titles as the paper prints them: three lines to the left, one line underneath
    for i, s in enumerate(('Maximum', 'temperature', '(°C)')):
        p.append('<text x="6" y="%.1f" class="num" style="text-anchor:start">%s</text>'
                 % (Y(15.5) + i * 15, s))
    p.append('<text x="%.1f" y="%.1f" class="num" style="text-anchor:middle">Number of hours of '
             'sunshine</text>' % ((X(7) + X(17)) / 2.0, Y(10) + 34))
    h = Y(10) + 42
    for s in p:
        for v in re.findall(r'[xy]\d?="(-?[\d.]+)"', s):
            assert -0.5 <= float(v) <= max(W, h) + 0.5
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="A scatter graph of maximum '
            'temperature in degrees C, from 10 to 21, against number of hours of sunshine, from 7 '
            'to 17, with fourteen crosses.">%s</svg>' % (W, int(math.ceil(h)), ''.join(p)))


# ---- Q25: the frame, off 1MA1/1H May 2017 page 6 (that paper's Q5) ------------------------------
assert math.isqrt(12 ** 2 + 5 ** 2) ** 2 == 169 and (12 + 12 + 5 + 5 + 13) * 1.5 == 70.5


def frame25():
    f = Fig(196.0, 80.0, 1.6, 6.0, 6.0, 216)
    x0, y0, x1, y1 = 204.7, 88.2, 354.9, 181.4
    f.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], 1.4)
    f.poly([(x0, y0 + 8.5), (x0 + 8.5, y0 + 8.5), (x0 + 8.5, y0)], 1.0, 'none', False)
    f.poly([(x1 - 8.5, y1), (x1 - 8.5, y1 - 8.5), (x1, y1 - 8.5)], 1.0, 'none', False)
    f.line(x0, y1, x1, y0, 1.4)                    # bottom-left up to top-right, as printed
    f.span((266.4, 182.5, 291.1, 198.6), '12 m', 'num', 'middle', '', 11.6)
    f.span((363.7, 126.3, 382.3, 142.5), '5 m', 'num', 'start', '', 11.6)
    return f.svg('A rectangular frame 12 m long and 5 m high, with right angles marked, and one '
                 'diagonal from the bottom left corner to the top right corner.')


# ================================================================================================
# WHAT CHANGES, ROW BY ROW
# ================================================================================================
def frac(n, d):
    return ('<span class="frac"><span class="frac-n">%s</span><span class="frac-d">%s</span>'
            '</span>' % (n, d))


EDIT = {}       # row_id -> {field: new value}
NEW = {}        # row_id of the row a new preamble goes in front of -> the preamble row

# ---------------------------------------- 2024 -----------------------------------------------------
EDIT[I24('3')] = {
    'lead': '',     # "The diagram shows an angle marked y" is not on the paper and repeats the ask
    'diagram': q3(),
    'diagram_by': 'family',
    'accept': 'reflex | reflex angle',
    'examiner_note': 'Redrawn from the paper’s own figure: two lines meeting at a point with a '
                     'small acute angle (about 37°) between them, and y marked on the angle that '
                     'goes the long way round the point.',
}
EDIT[I24('2')] = {'accept': '30 | 30%'}
EDIT[I24('4')] = {'accept': ''}          # an ORDER: the marker compares lists as sets
EDIT[I24('6')] = {'accept': '£1.50 | 1.5'}
EDIT[I24('7')] = {
    'lead': '<p>The table shows the number of hours that Lena and Pavel worked on each of four '
            'days last week.</p><table><thead><tr><th scope="col">Day</th><th scope="col">Lena'
            '</th><th scope="col">Pavel</th></tr></thead><tbody><tr><th scope="row">Wednesday'
            '</th><td>6</td><td>7</td></tr><tr><th scope="row">Thursday</th><td>9</td><td>6</td>'
            '</tr><tr><th scope="row">Friday</th><td>8</td><td>5</td></tr><tr><th scope="row">'
            'Saturday</th><td>6</td><td>6</td></tr></tbody></table>',
    'html': '<p>On the grid, draw a suitable diagram or chart for this information.</p>',
    'diagram': q7(),
    'examiner_note': 'The grid is the paper’s: thirteen squares across and sixteen up, with the '
                     'left and bottom edges drawn dark and no scale on them, because choosing and '
                     'marking the scale is one of the marks. The paper prints the days across '
                     'the top of the table; they run down the side here so that all four fit on '
                     'a phone.',
}
EDIT[I24('8')] = {
    'html': '<p><i>OA</i>, <i>OB</i> and <i>OC</i> are three straight lines.</p>',
    'diagram': q8(),
    'examiner_note': 'Redrawn from the paper’s own figure: OC goes right, OB goes straight down '
                     'and OA goes down to the left. The 220° is angle AOC over the top, the 90° is '
                     'angle BOC and x is angle AOB. Not to scale, as the paper’s is not, so x has '
                     'to be worked out rather than measured.',
}
EDIT[I24('9')] = {'diagram': q9()}
EDIT[I24('12')] = {
    'lead': '<p>The diagram shows a triangle and a rectangle.</p>',
    'diagram': q12(),
    'examiner_note': 'Redrawn from the paper’s own figure: 36 cm is the long slanted side, 30 cm '
                     'the bottom and 14 cm the short side; the rectangle is 4 cm high with its '
                     'length to be found. Not to scale.',
}
EDIT[I24('13a')] = {'lead': '<p>There are only £10 notes and £20 notes in a wallet.<br>Ali takes '
                            'at random a note from the wallet.</p>',
                    # NOT '| 100%': the marker strips a % sign, so that alternative also passes a
                    # bare "100" -- which this scheme refuses by name. 100% marked "not yet" and
                    # explained in the answer is the smaller wrong.
                    'accept': '1'}
EDIT[I24('13b')] = {'accept': '2⁄3 | 0.67 | 0.66 | 0.666 | 0.667 | 67% | 66.7%'}
EDIT[I24('16')] = {
    'accept': '',          # "supported": the scheme gives 0 for the pack alone
    # The paper's own words. Its picture is three bundles of batteries over their prices, which the
    # three sentences under it already say in full -- so a table standing in for the picture was
    # the same facts a third time, in front of the question rather than inside it.
    'lead': '',
    'html': '<p>Batteries are sold in packs of 4, in packs of 8 and in packs of 12</p>'
            '<p>A pack of 4 batteries costs &pound;1.80<br>A pack of 8 batteries costs '
            '&pound;3.20<br>A pack of 12 batteries costs &pound;6.00</p><p>Which pack gives the '
            'best value for money?<br>You must show how you get your answer.</p>',
    'examiner_note': 'The paper prints three packs of batteries over their prices. The three '
                     'sentences under that picture give every price in full, so the picture adds '
                     'nothing a student needs and is not drawn.',
}
EDIT[I24('19')] = {
    'diagram': q19(),
    'examiner_note': 'Redrawn from the paper’s own grid: triangle A has corners (−3, 1), (−3, 3) '
                     'and (−2, 3); triangle B has corners (2, −3), (2, −1) and (3, −1). Every '
                     'corner moves 5 right and 4 down.',
}
EDIT[I24('21a')] = {'accept': '2 2⁄15 | 32⁄15'}
EDIT[I24('21b')] = {
    # Three lines, as the paper sets them, and each one held together: on a 320px phone a mixed
    # number broken after its whole part reads as "= 1" and then a stray fraction on the next line.
    # NOT class="num" -- inside .qsheet that is the SVG label class and sets a 13px serif.
    'lead': '<p>Kevin was asked to work out&nbsp; <span style="white-space:nowrap">2'
            + frac('1', '3') + ' &times; ' + frac('5', '8') + '</span></p>'
            '<p>Here is his working and his answer.</p>'
            '<p style="white-space:nowrap">2' + frac('1', '3') + ' &times; ' + frac('5', '8')
            + ' = ' + frac('7', '3') + ' &times; ' + frac('5', '8') + '</p>'
            '<p style="white-space:nowrap;padding-left:4.6em">= ' + frac('35', '24') + '</p>'
            '<p style="white-space:nowrap;padding-left:4.6em">= 1' + frac('9', '24') + '</p>',
}
EDIT[I24('22')] = {
    'diagram': q22(),
    'examiner_note': 'Redrawn from the paper’s own figure: the floor is 10 m along the top and '
                     '8 m down the left, with the bottom edge 6 m and the right edge 5 m, so the '
                     'corner missing is the bottom right, 4 m by 3 m. Not to scale.',
}
EDIT[I24('22a')] = {'accept': ''}        # "Yes (supported)": the decision alone scores nothing
EDIT[I24('22b')] = {'lead': '<p>Actually, 1 litre of paint will cover 11 m<sup>2</sup> of floor.</p>'}
EDIT[I24('23')] = {
    'html': '<p>Here is a Venn diagram.</p>',
    'diagram': q23(),
    'diagram_by': 'family',
    'examiner_note': 'Redrawn from the paper’s own figure: 12 and 15 are in P only, 10 and 14 in Q '
                     'only, 18 in both, and 11, 13, 16 and 17 in neither.',
}
EDIT[I24('24')] = {'html': '<p>Sophie drives a distance of 513 kilometres on a motorway in '
                           'France.<br>She pays 0.81 euros for every 10 kilometres she drives.</p>'}
EDIT[I24('24a')] = {'html': '<p>Work out an estimate for the total amount that Sophie pays.</p>',
                    'accept': '40 euros | 40.5 | 40.8'}
EDIT[I24('25a')] = {'diagram': q25(),
                    'accept': 'y = 3⁄2x + 3 | y = 1.5x + 3 | 2y = 3x + 6',
                    'examiner_note': 'Redrawn from the paper’s own grid: L runs from (−4, −3) '
                                     'through (0, 3) to where it leaves the grid at y = 7.'}
EDIT[I24('25b')] = {'lead': '<p><b>M</b> is a different straight line with equation '
                            '<i>y</i> = 5<i>x</i></p>'}
EDIT[I24('26')] = {'accept': '7.5 | 7.5%'}
EDIT[I24('23b')] = {'accept': '5⁄9 | 0.56 | 0.55 | 0.555 | 0.556 | 56% | 55.6% | 55.5%'}

# the answer prose that was teaching the wrong picture
FIX_TEXT = [
    (I24('3'), 'answer',
     '&ldquo;Obtuse&rdquo; is the answer to head off &mdash; it is what comes out when a student '
     'names the small angle at the point instead of the one the label is actually attached to.',
     '&ldquo;Acute&rdquo; is the answer to head off &mdash; the two lines on the paper make a '
     'small angle of well under 90&deg;, and naming that one instead of the angle the label is '
     'actually attached to is the slip.'),
    (I24('23a'), 'answer',
     '<i>P</i> itself is 12, 15 and 18, and 15 is the one students lose &mdash; it sits in the '
     'overlap, so it is in <i>P</i> and must be left out of <i>P</i>&prime;.',
     '<i>P</i> itself is 12, 15 and 18, and 18 is the one students lose &mdash; it sits in the '
     'overlap, so it is in <i>P</i> and must be left out of <i>P</i>&prime; even though it is in '
     '<i>Q</i> as well.'),
    (I17('15'), 'diagram',      # a right-angle mark straddling the corner instead of inside it
     '<rect x="58" y="96" width="12" height="12" fill="none"',
     '<rect x="60" y="94" width="10" height="10" fill="none"'),
    (I17('15'), 'diagram',      # text-anchor as an ATTRIBUTE loses to .qsheet .lbl's middle, so
     '<text x="304.0" y="70.0" class="lbl" text-anchor="start">width</text>',   # it sat on the edge
     '<text x="304.0" y="70.0" class="num" style="text-anchor:start">width</text>'),
    (I24('23b'), 'answer',
     'Reading the diagram: the overlap holds 15, so P &cup; Q is 12 and 18 from P, 10 and 14 '
     'from Q, and 15 from the middle.',
     'Reading the diagram: the overlap holds 18, so P &cup; Q is 12 and 15 from P, 10 and 14 '
     'from Q, and 18 from the middle.'),
]

# ---------------------------------------- 2017 -----------------------------------------------------
_SCALE_6 = None   # filled from 6ii's own probability-scale drawing when the file is read

EDIT[I17('3a')] = {'accept': '56ef | 56fe'}                       # the order is not the mark
EDIT[I17('3b')] = {'accept': '12.5 | x = 12.5'}
EDIT[I17('4')] = {'accept': '80 | 80%'}
EDIT[I17('6i')] = {
    'html': '<p>On the probability scale, mark with a cross (&times;) the probability that the '
            'spinner will land on <b>B</b>.</p>',
    # the diagram becomes 6(ii)'s own probability scale -- see main()
}
EDIT[I17('7')] = {
    'html': '<p>Fahima buys</p><ul><li>2 packets of bread rolls costing &pound;1.50 for each '
            'packet</li><li>1 bottle of ketchup costing &pound;1.60</li><li>3 packets of '
            'sausages</li></ul><p>Fahima pays with a &pound;10 note.<br>She gets 30p change.</p>'
            '<p>Fahima works out that one packet of sausages costs &pound;2.30</p><p>Is Fahima '
            'right?<br>You must show how you get your answer.</p>',
    'answer': '<b>No &mdash; one packet of sausages costs &pound;1.70</b>. She spent &pound;10 '
              '&minus; 30p = &pound;9.70. The bread rolls are 2 &times; &pound;1.50 = &pound;3 and '
              'the ketchup &pound;1.60, so &pound;4.60 together, which leaves &pound;9.70 &minus; '
              '&pound;4.60 = &pound;5.10 for the three packets of sausages: &pound;5.10 &divide; 3 '
              '= &pound;1.70. Or check her answer forwards: 3 &times; &pound;2.30 = &pound;6.90, '
              'and &pound;6.90 + &pound;4.60 = &pound;11.50, more than the &pound;10 she paid '
              'with. Her &pound;2.30 is what comes out of &pound;10 &minus; &pound;1.50 &minus; '
              '&pound;1.60 = &pound;6.90, &divide; 3 &mdash; forgetting both the 30p change and '
              'the second packet of bread rolls. The decision on its own earns nothing: the '
              'working has to be there.',
    'accept': '',
}
assert (Fraction(970) - 2 * 150 - 160) / 3 == 170                   # pence: one packet 1.70
assert (Fraction(1000) - 150 - 160) / 3 == 230                       # how Fahima got 2.30
EDIT[I17('10')] = {'accept': '1 : 10'}
assert Fraction(2 * 6, 20 * 6) == Fraction(1, 10)
EDIT[I17('11a')] = {'html': '<p>How many square tiles are needed to make pattern number 6?</p>'}
EDIT[I17('11c')] = {'accept': ''}
EDIT[I17('14b')] = {
    'html': '<p>Year 9 students from Lowry School were also asked to choose one language to '
            'study.<br>This accurate pie chart shows information about their choices.</p><p>'
            'Shameena says, &ldquo;The pie chart shows that French was chosen by more Year 9 '
            'students at Lowry School than at Halle School.&rdquo;</p><p>Is Shameena right?<br>'
            'You must explain your answer.</p>',
    'accept': '',
    'examiner_note': 'The three sectors are labelled German, Spanish and French as on the paper. '
                     'The paper’s own chart did not come across, so the sector sizes here were '
                     'chosen — and the answer does not depend on them: a pie chart shows '
                     'proportions, and nothing says how many Lowry students there were.',
}
EDIT[I17('15')] = {
    'html': '<p>Here are a triangle and a rectangle.</p><p>The area of the rectangle is 6 times '
            'the area of the triangle.</p><p>Work out the width of the rectangle.</p>',
    'accept': '13.5 | 13.5 cm | 13.5cm',
}
assert Fraction(6 * 9 * 8, 2) / 16 == Fraction(27, 2)
EDIT[I17('17')] = {'accept': '1110 | 1110 g | 1110 grams | 1110g'}
EDIT[I17('18a')] = {
    'html': '<p>Balena wants to cover all the garden with grass seed.</p><p>Work out an estimate '
            'for the number of boxes of grass seed Balena needs.<br>You must show your '
            'working.</p>',
}
EDIT[I17('18b')] = {
    'accept': '',
    'answer': 'An underestimate, on the usual route &mdash; rounding &pi; down to 3 makes the garden '
              '300&nbsp;m<sup>2</sup> instead of 314&nbsp;m<sup>2</sup>, so the number of boxes '
              'comes out smaller than is really needed (and rounding 46 up to 50 pushes the same '
              'way). The answer depends on how part (a) was rounded, so the reason has to name the '
              'rounding and which way it went: rounding 46 down to 40 pushes the other way. '
              'Unrounded, &pi; &times; 100 &divide; 46 = 6.83, so 7 boxes are needed.',
}
assert round(math.pi * 100 / 46, 2) == 6.83
EDIT[I17('19a')] = {'accept': '9.5 | x = 9.5'}
EDIT[I17('21a')] = {'html': '<p>One of the points is an outlier.</p><p>Write down the '
                            'coordinates of this point.</p>'}
EDIT[I17('21b')] = {'accept': 'positive | positive correlation'}
EDIT[I17('21c')] = {'accept': '12 to 13 hours'}
EDIT[I17('21d')] = {'accept': ''}
EDIT[I17('22')] = {'accept': '2 × 2 × 2 × 7 | 2^3 × 7 | 2³ × 7 | 2 x 2 x 2 x 7 | 2x2x2x7 | 2^3 x 7 | 2^3x7'}
EDIT[I17('24')] = {
    'html': '<p>The area of square <i>ABCD</i> is 10&nbsp;cm<sup>2</sup>.</p><p>Show that '
            '<i>x</i><sup>2</sup> + 6<i>x</i> = 1</p>',
    'accept': '',
    'examiner_note': 'The diagram matches the paper’s: the top side AB is a 3 cm piece and an x cm '
                     'piece, the side AD likewise, with dashed lines across the square.',
}
EDIT[I17('25')] = {
    'html': '<p>This rectangular frame is made from 5 straight pieces of metal.</p><p>The weight '
            'of the metal is 1.5&nbsp;kg per metre.</p><p>Work out the total weight of the metal '
            'in the frame.</p>',
    'diagram': frame25(),
    'accept': '70.5 | 70.5 kg | 70.5kg',
    'examiner_note': 'Redrawn from the paper’s own figure (it is also Question 5 of the Higher '
                     'paper sat the same morning): a 12 m by 5 m rectangle with one diagonal.',
}
EDIT[I17('26')] = {'accept': ''}
EDIT[I17('27a')] = {'html': '<p>Find, in terms of <b>b</b>, the vector <i>DB</i>.</p>'}
EDIT[I17('27c')] = {'accept': '−a − b | −b − a'}

EDIT[STEM17('11')] = {'html': '<p>A sequence of patterns is made from circular tiles and square '
                              'tiles.</p><p>Here are the first three patterns in the sequence.</p>'}
EDIT[STEM17('13')] = {'html': '<p>The diagram shows a tree and a man.<br>The man is of average '
                              'height.<br>The tree and the man are drawn to the same scale.</p>'}
EDIT[STEM17('18')] = {'html': '<p>Balena has a garden in the shape of a circle of radius '
                              '10&nbsp;m.<br>He is going to cover the garden with grass seed to '
                              'make a lawn.</p><p>Grass seed is sold in boxes. Each box of grass '
                              'seed will cover 46&nbsp;m<sup>2</sup> of garden.</p>'}
EDIT[STEM17('21')] = {
    'html': '<p>The scatter graph shows the maximum temperature and the number of hours of '
            'sunshine in fourteen British towns on one day.</p>',
    'diagram': scatter21(),
    'examiner_note': 'Redrawn from the paper’s own graph (it is also Question 1 of the Higher '
                     'paper sat the same morning), every cross measured off the page.',
}
EDIT[STEM17('27')] = {'html': '<p><i>ABCD</i> is a parallelogram.<br>The diagonals of the '
                              'parallelogram intersect at <i>O</i>.</p><p><i>OA</i> = <b>a</b> '
                              'and <i>OB</i> = <b>b</b></p>'}

# a new preamble for Q6, so part (ii) can see the spinner too
NEW[I17('6i')] = {
    'row_id': NEW_STEM, 'kind': 'preamble', 'question': '6', 'part': '', 'section': '',
    'marks': '', 'figure': '', 'html': '<p>Sammy spins a fair 4-sided spinner.</p>',
    'diagram': spinner17(), 'diagram_by': 'family', 'sort_order': '1',
    'examiner_note': 'The letters are where the paper’s text prints them, A and B over C and B. '
                     'The paper’s own picture did not come across, so the spinner is drawn as a '
                     'square on its corner split by its diagonals; that does not change any '
                     'answer, because the four sections are equal.',
}
# fields copied from the part the preamble sits in front of, the way the q13 preamble was made
COPY = ('paper_id', 'subject', 'key_stage', 'tier', 'exam_board', 'exam_wave', 'year', 'level',
        'paper', 'month', 'document_type', 'source_id', 'needs', 'printable', 'trackable',
        'source_url', 'name', 'exam_date', 'active')


def main():
    lines = open(FILE, encoding='utf-8').read().split('\n')
    rows = {}
    for i, line in enumerate(lines):
        body = line.rstrip()
        if not body.startswith('{'):
            continue
        r = json.loads(body[:-1] if body.endswith(',') else body)
        rows[r.get('row_id')] = (i, r)
    if NEW_STEM in rows:
        raise SystemExit('%s already exists -- this script has run before' % NEW_STEM)
    missing = [k for k in list(EDIT) + list(NEW) if k not in rows]
    assert not missing, missing
    for rid in list(EDIT) + list(NEW):
        assert rows[rid][1].get('paper_id') in (P24, P17), rid

    # 6(i) keeps only the probability scale it is answered on -- 6(ii)'s own drawing of it
    scale = rows[I17('6ii')][1]['diagram']
    assert scale.startswith('<svg') and 'probability scale' in scale and 'spinner' not in scale
    EDIT[I17('6i')]['diagram'] = scale

    for rid, field, old, new in FIX_TEXT:
        cur = EDIT.get(rid, {}).get(field, rows[rid][1][field])   # several fixes may share a field
        assert cur.count(old) == 1, (rid, field, old[:40])
        EDIT.setdefault(rid, {})[field] = cur.replace(old, new)

    changed = {}
    for rid, upd in EDIT.items():
        i, r = rows[rid]
        for k, v in upd.items():
            r[k] = v
        changed[i] = r
    out = []
    for i, line in enumerate(lines):
        rid = None
        if i in changed:
            rid = changed[i]['row_id']
        else:
            body = line.rstrip()
            if body.startswith('{'):
                rid = json.loads(body[:-1] if body.endswith(',') else body).get('row_id')
        if rid in NEW:
            part = rows[rid][1]
            pre = {k: part[k] for k in COPY if k in part}
            pre.update(NEW[rid])
            out.append(json.dumps(pre, ensure_ascii=False, separators=(',', ':')) + ',')
        if i in changed:
            trailing = line.rstrip().endswith(',')
            out.append(json.dumps(changed[i], ensure_ascii=False, separators=(',', ':'))
                       + (',' if trailing else ''))
        else:
            out.append(line)
    open(FILE, 'w', encoding='utf-8').write('\n'.join(out))
    print('%d rows changed, %d preamble added' % (len(changed), len(NEW)))
    print('  2024: Q3 Q7 Q8 Q9 Q12 Q19 Q22 Q23 Q25 redrawn off the paper; Q23 answers now put 18 '
          'in the overlap')
    print('  2017: Q6 spinner redrawn onto a preamble; Q21 scatter and Q25 frame redrawn off the '
          'Higher paper; Q7 answer rewritten (one packet is 1.70)')
    print('  outlier %s, 16.4C reads %.2f hours on the least-squares line' % (_o[1], _hrs))


if __name__ == '__main__':
    main()
