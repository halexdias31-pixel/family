"""
KS2 SATs 2019 MATHEMATICS PAPERS 2 AND 3 (REASONING), CHECKED QUESTION BY QUESTION AGAINST THE
PRINTED PAPERS AND THE STA'S OWN MARK SCHEME.

Read off `ks2-2019-mathematics-paper-2.pdf`, `ks2-2019-mathematics-paper-3.pdf` and
`ks2-2019-mathematics-papers-123-mark-scheme.pdf` in Drive, every page rendered and looked at. The
papers are Crown copyright under the Open Government Licence v3.0, so nothing here is restricted --
but the pictures are DRAWN rather than photographed, like the rest of the library, so they take the
page's own ink and work on both palettes.

WHAT WAS WRONG, IN THE ORDER IT MATTERS:

  1. ELEVEN PICTURES THE QUESTIONS NEED WERE NOT THERE. A reflection with no shape, a measuring jug
     with no scale, a pictogram with no symbols, a coordinate grid with no points, six triangles
     with no rectangle. Every one is drawn here from the paper's own geometry: the grid squares are
     counted off the rendered page and every coordinate below is asserted against what the paper
     prints or what the mark scheme's own answer requires.

  2. FIVE MULTI-PART QUESTIONS LEFT THEIR SHARED STEM ON PART (a), so part (b) read "Write the
     missing number at the end of the sequence" with no rule, "What was the mean maximum
     temperature?" with no temperatures, "What are the coordinates of D?" with no rectangle. A
     question-scoped preamble (`preamble_` in find.js) carries the stem and the picture onto every
     part -- Q8, Q22 on Paper 2 and Q7, Q10, Q21 on Paper 3.

  3. FIVE ANSWERS WERE WRONG OR MUDDLED. Paper 2 Q7 said the jug's scale had five divisions to the
     litre; it has four (quarter-litres) and the paint stands one division BELOW the lowest printed
     mark. Q20's explanation said "1/20 is 15%... no: it is 5%". Q3 said the two 1,009s are told
     apart at the sixth digit; it is the fifth (the hundreds). Paper 3 Q9 and Q22 said the answer
     "needs the picture" -- the picture is here now, so they show the working.

  4. FIVE `accept` CELLS WOULD HAVE MARKED A WRONG ANSWER RIGHT. `markParts_` compares a comma list
     as a SORTED set -- right for factors, wrong for an ORDER or a COORDINATE: Paper 3 Q4 (write
     these masses in order) passed any order at all, and Q21's (55, 30) and (55, 14) passed the
     swapped (30, 55) and (14, 55). Paper 2 Q11(a) asks for a DECIMAL and the scheme refuses 1/4,
     but `markFrac_` folds 1/4 onto 0.25. Paper 2 Q18's mark is for the EXPLANATION and the scheme
     says circling 89 alone earns nothing, yet a Check would have said Correct for "89". All five
     are left for a person to mark rather than marked wrongly.

  5. RIGHT ANSWERS MARKED WRONG. This branch's `markAnswer_` strips a unit off the EXPECTED side
     only, so a child typing "25%" against `25`, or "65p" against `65 | 0.65`, or "155 g" against
     `155`, was told Not yet. Each accept cell gains the spellings with the unit the answer box
     prints, and nothing it would not already accept.

  6. THREE TABLES WERE PROSE. Paper 2 Q14 and Q15 and Paper 3 Q7's eight kittens.
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
P2, P3 = 'P-STA-KS2-2019-P2', 'P-STA-KS2-2019-P3'
ID2 = lambda s: 'Q-STA-KS2-2019-P2-%s' % s      # noqa: E731
ID3 = lambda s: 'Q-STA-KS2-2019-P3-%s' % s      # noqa: E731


# ================================================================================================
# DRAWING HELPERS -- the same three every refine script in tools/ uses
# ================================================================================================
def svg(body, h, label):
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>'
            % (W, h, label, body))


def line(x1, y1, x2, y2, cls='', extra=''):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" %s%s/>'
            % (x1, y1, x2, y2,
               ('class="%s"' % cls) if cls else 'stroke="currentColor" stroke-width="1.4"', extra))


def txt(x, y, s, cls='num', anchor='middle', size=None):
    """INLINE `style`, NOT `text-anchor=` -- CSS beats an SVG presentation attribute."""
    return ('<text x="%.1f" y="%.1f" class="%s" style="text-anchor:%s%s">%s</text>'
            % (x, y, cls, anchor, (';font-size:%dpx' % size) if size else '', s))


def poly(pts, fill=True, extra=''):
    d = ' '.join('%.1f,%.1f' % p for p in pts)
    f = 'fill="currentColor" fill-opacity=".18"' if fill else 'fill="none"'
    return '<polygon points="%s" %s stroke="currentColor" stroke-width="1.6"%s/>' % (d, f, extra)


def head(x, y, ang):
    """An arrowhead as a triangle, never a <marker>: a marker needs an id and five cards with the
       same id on one page resolve to whichever came first."""
    a = math.radians(ang)
    l, w = 7.0, 3.2
    bx, by = x - l * math.cos(a), y - l * math.sin(a)
    px, py = -math.sin(a) * w, math.cos(a) * w
    return ('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor"/>'
            % (x, y, bx + px, by + py, bx - px, by - py))


def arrow2(x1, y1, x2, y2):
    """A double-headed dimension arrow."""
    ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
    return line(x1, y1, x2, y2, extra=' stroke-width="1"') + head(x2, y2, ang) + head(x1, y1, ang + 180)


def arrow_gap(x1, x2, y, gap):
    """A horizontal dimension arrow broken in the middle for its label, as the paper prints it --
       a gap rather than a box painted over the line, because a box needs a fill colour and the
       card has two palettes."""
    m = (x1 + x2) / 2.0
    return (line(x1, y, m - gap / 2.0, y, extra=' stroke-width="1"')
            + line(m + gap / 2.0, y, x2, y, extra=' stroke-width="1"')
            + head(x2, y, 0) + head(x1, y, 180))


def dot(x, y, r=2.6):
    return '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="currentColor"/>' % (x, y, r)


NOT_SCALE = 'Not to scale'
NOT_SIZE = 'Not actual size'


# ================================================================================================
# PAPER 2 Q4  --  the shape to reflect, counted off the page
# ================================================================================================
# The paper's grid is 14 squares by 9 with the mirror line on the boundary after the 7th column.
# The shape's corners, counted in squares from the grid's top-left corner, measured off the page
# rendered at 150 dpi (one square is 56.7 px, every corner lands within 0.05 of a whole square):
Q4_COLS, Q4_ROWS, Q4_MIRROR = 14, 9, 7
Q4_SHAPE = [(9, 2), (11, 2), (11, 7), (8, 7), (10, 5)]
Q4_IMAGE = [(2 * Q4_MIRROR - x, y) for x, y in Q4_SHAPE]
# the mark scheme's completed diagram: the image's upright edge 4 squares left of the line, its
# inner corner 3 squares left -- and every corner of it still on the grid
assert Q4_IMAGE == [(5, 2), (3, 2), (3, 7), (6, 7), (4, 5)], Q4_IMAGE
assert all(0 <= x <= Q4_COLS and 0 <= y <= Q4_ROWS for x, y in Q4_SHAPE + Q4_IMAGE)


def p2q4():
    c, left, top = 22.0, 16.0, 16.0
    p = []
    for i in range(Q4_COLS + 1):
        p.append(line(left + i * c, top, left + i * c, top + Q4_ROWS * c, 'grid'))
    for j in range(Q4_ROWS + 1):
        p.append(line(left, top + j * c, left + Q4_COLS * c, top + j * c, 'grid'))
    mx = left + Q4_MIRROR * c
    p.append(line(mx, top - 8, mx, top + Q4_ROWS * c + 8,
                  extra=' stroke-width="2" stroke-dasharray="7 4"'))
    p.append(poly([(left + x * c, top + y * c) for x, y in Q4_SHAPE]))
    p.append(txt(mx, top + Q4_ROWS * c + 24, '<tspan font-weight="700">mirror line</tspan>', 'cap'))
    return svg(''.join(p), top + Q4_ROWS * c + 32,
               'A square grid, 14 squares across and 9 down, with a dashed vertical mirror line '
               'down the middle. A shaded shape is drawn to the right of the mirror line.')


# ================================================================================================
# PAPER 2 Q7  --  the paint container, scale measured off the page
# ================================================================================================
# Measured at 150 dpi: the marks 5, 4 and 3 at y = 375, 454 and 533 -- 79 px to a litre -- with a
# mark every 19.75 px, so FOUR divisions to the litre (quarter-litres), a longer mark at each half.
# The lowest printed mark is at 553 = 2.75 l; the paint's surface is at 573 = 2.49 l, ONE DIVISION
# BELOW THE LOWEST MARK; the container's bottom is at 773 = 0.0 l.
Q7_PER_L = 79.0
Q7_MARKS = {5: 375, 4: 454, 3: 533}
Q7_SURFACE_PX, Q7_BOTTOM_PX, Q7_LOWEST_PX = 573, 773, 553
assert Q7_MARKS[4] - Q7_MARKS[5] == Q7_PER_L and Q7_MARKS[3] - Q7_MARKS[4] == Q7_PER_L
Q7_PAINT = 3 - (Q7_SURFACE_PX - Q7_MARKS[3]) / Q7_PER_L
Q7_ZERO = 3 - (Q7_BOTTOM_PX - Q7_MARKS[3]) / Q7_PER_L
Q7_LOWEST = 3 - (Q7_LOWEST_PX - Q7_MARKS[3]) / Q7_PER_L
assert abs(Q7_PAINT - 2.5) < 0.02, Q7_PAINT          # the scheme's 2.5 or 2 1/2
assert abs(Q7_ZERO) < 0.05, Q7_ZERO                  # the bottom of the jug really is 0
assert abs(Q7_LOWEST - 2.75) < 0.01, Q7_LOWEST       # the lowest printed mark is 2 3/4


def p2q7():
    u = 34.0                     # px per litre here
    x0, x1, top = 112.0, 228.0, 14.0
    bottom = top + 6.25 * u      # the paper's jug is 6.28 litres tall
    yl = lambda v: bottom - v * u                       # noqa: E731
    p = [('<path d="M %.1f %.1f L %.1f %.1f L %.1f %.1f L %.1f %.1f L %.1f %.1f" fill="none" '
          'stroke="currentColor" stroke-width="1.6"/>'
          % (x0 - 3, top, x0, top + 6, x0, bottom, x1, bottom, x1, top + 6)),
         line(x1, top + 6, x1 + 3, top, extra=' stroke-width="1.6"'),
         '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="currentColor" '
         'fill-opacity=".55"/>' % (x0, yl(2.5), x1 - x0, 2.5 * u),
         txt((x0 + x1) / 2 + 16, top + 22, 'litres')]
    tx = x0 + 12
    for q in range(11, 21):                 # 2.75 .. 5.0 in quarter litres
        v = q / 4.0
        if v == int(v):
            ln = 20.0
            p.append(txt(tx + ln + 10, yl(v) + 4.5, str(int(v)), 'num', 'start'))
        elif q % 2 == 0:
            ln = 13.0
        else:
            ln = 6.0
        p.append(line(tx, yl(v), tx + ln, yl(v), extra=' stroke-width="1"'))
    return svg(''.join(p), bottom + 10,
               'A container of dark paint with a scale in litres. The scale is marked 3, 4 and 5, '
               'with smaller marks between them; the lowest mark is one small division below 3.')


# ================================================================================================
# PAPER 2 Q11(a)  --  the scales, whose display IS the answer space
# ================================================================================================
def p2q11():
    p = [poly([(110, 52), (230, 52), (238, 74), (102, 74)], extra=' fill-opacity=".35"'),
         '<rect x="98" y="74" width="144" height="9" fill="currentColor" fill-opacity=".55" '
         'stroke="currentColor" stroke-width="1.2"/>',
         poly([(108, 83), (232, 83), (246, 160), (94, 160)], extra=' fill-opacity=".12"'),
         '<rect x="124" y="104" width="94" height="32" fill="none" stroke="currentColor" '
         'stroke-width="2.2"/>',
         txt(210, 125, '<tspan font-weight="700">kg</tspan>', 'num', 'end'),
         line(100, 160, 100, 168), line(240, 160, 240, 168),
         # the wedge of cheese: a triangular top face and the cut face below it, as printed
         poly([(132, 51), (206, 47), (208, 30), (128, 36)], extra=' fill-opacity=".08"'),
         poly([(128, 36), (208, 30), (160, 14)], extra=' fill-opacity=".04"')]
    return svg(''.join(p), 176,
               'A wedge of cheese on a set of kitchen scales. The scales’ display is an '
               'empty box marked kg.')


# ================================================================================================
# PAPER 2 Q13  --  the sketch, NOT the full-size triangle (that is the student's to draw)
# ================================================================================================
Q13_ANGLE = 35.0


def p2q13():
    ax, ay, bx = 70.0, 150.0, 240.0
    cy = ay - (bx - ax) * math.tan(math.radians(Q13_ANGLE))
    assert cy > 10, cy
    r = 34.0
    ex, ey = ax + r * math.cos(math.radians(Q13_ANGLE)), ay - r * math.sin(math.radians(Q13_ANGLE))
    p = [poly([(ax, ay), (bx, ay), (bx, cy)], fill=False),
         '<path d="M %.1f %.1f A %.1f %.1f 0 0 0 %.1f %.1f" fill="none" stroke="currentColor" '
         'stroke-width="1"/>' % (ax + r, ay, r, r, ex, ey),
         txt(ax + 50, ay - 7, '35°'),
         '<polyline points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" stroke="currentColor" '
         'stroke-width="1"/>' % (bx - 12, ay, bx - 12, ay - 12, bx, ay - 12),
         arrow2(ax, ay + 16, bx, ay + 16), txt((ax + bx) / 2, ay + 34, '8 cm'),
         txt(bx + 12, 74, '<tspan font-weight="700">Not to</tspan>', 'num', 'start'),
         txt(bx + 12, 90, '<tspan font-weight="700">scale</tspan>', 'num', 'start')]
    return svg(''.join(p), ay + 42,
               'A sketch of a right-angled triangle, not to scale. The bottom side is 8 cm; the '
               'angle at its left end is 35 degrees and the angle at its right end is a right '
               'angle.')


# ================================================================================================
# PAPER 2 Q17  --  the two shapes; no lengths on the picture, exactly as the paper
# ================================================================================================
def p2q17():
    cx, cy, r = 92.0, 82.0, 46.0
    hexa = [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
            for a in range(0, 360, 60)]
    p = [poly(hexa), txt(cx, 26, 'regular hexagon'),
         '<rect x="200" y="40" width="80" height="80" fill="currentColor" fill-opacity=".18" '
         'stroke="currentColor" stroke-width="1.6"/>', txt(240, 26, 'square'),
         txt(170, 150, '<tspan font-weight="700">%s</tspan>' % NOT_SIZE, 'cap')]
    return svg(''.join(p), 160, 'A regular hexagon and a square, side by side, not actual size.')


# ================================================================================================
# PAPER 2 Q21  --  the card, 7 squares by 5
# ================================================================================================
Q21_COLS, Q21_ROWS = 7, 5
# The only answer, up to which end and which corner: a 5 x 5 square, a 2 x 2 square and the 2 x 3
# rectangle left over -- checked by brute force over every pair of straight grid cuts.


def _q21_solutions():
    sols = set()
    # first cut across the whole card, second cut across one of the two pieces
    for first in ['v%d' % i for i in range(1, Q21_COLS)] + ['h%d' % j for j in range(1, Q21_ROWS)]:
        k = int(first[1:])
        if first[0] == 'v':
            pieces = [(k, Q21_ROWS), (Q21_COLS - k, Q21_ROWS)]
        else:
            pieces = [(Q21_COLS, k), (Q21_COLS, Q21_ROWS - k)]
        for i, (w, h) in enumerate(pieces):
            other = pieces[1 - i]
            for cut in range(1, w):
                three = [other, (cut, h), (w - cut, h)]
                sq = sorted(a for a, b in three if a == b)
                if len(sq) == 2 and sq[0] != sq[1] and sum(1 for a, b in three if a != b) == 1:
                    sols.add(tuple(sorted(three)))
            for cut in range(1, h):
                three = [other, (w, cut), (w, h - cut)]
                sq = sorted(a for a, b in three if a == b)
                if len(sq) == 2 and sq[0] != sq[1] and sum(1 for a, b in three if a != b) == 1:
                    sols.add(tuple(sorted(three)))
    return sols


assert _q21_solutions() == {((2, 2), (2, 3), (5, 5))}, _q21_solutions()


def p2q21():
    c = 34.0
    left, top = (W - Q21_COLS * c) / 2, 10.0
    p = []
    for i in range(1, Q21_COLS):
        p.append(line(left + i * c, top, left + i * c, top + Q21_ROWS * c, extra=' stroke-width=".7"'))
    for j in range(1, Q21_ROWS):
        p.append(line(left, top + j * c, left + Q21_COLS * c, top + j * c, extra=' stroke-width=".7"'))
    p.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" stroke="currentColor" '
             'stroke-width="2"/>' % (left, top, Q21_COLS * c, Q21_ROWS * c))
    return svg(''.join(p), top + Q21_ROWS * c + 10,
               'A rectangle of card marked with grid lines, 7 squares across and 5 squares down.')


# ================================================================================================
# PAPER 2 Q22  --  the temperature graph; the paper prints every value beside its cross
# ================================================================================================
Q22 = [('Mon', 8.1), ('Tue', 9.3), ('Wed', 11.9), ('Thu', 11.8), ('Fri', 12.4)]
assert sum(1 for _, t in Q22 if t < 10) == 2                         # (a) 2/5
assert round(sum(t for _, t in Q22) / 5, 1) == 10.7                  # (b) the scheme's 10.7
assert abs(sum(t for _, t in Q22) - 53.5) < 1e-9                     # the scheme's 53.5


def p2q22():
    x0, x1, y0, top = 104.0, 330.0, 198.0, 22.0
    sy = (y0 - top) / 14.0
    Y = lambda t: y0 - t * sy                           # noqa: E731
    p = []
    for t in range(2, 15, 2):
        p.append(line(x0, Y(t), x1, Y(t), 'grid'))
    p.append(line(x0, y0, x1, y0, 'axis'))
    p.append(line(x0, y0, x0, top - 10, 'axis'))
    p.append(head(x0, top - 14, -90))
    for t in range(0, 15, 2):
        p.append(line(x0 - 4, Y(t), x0, Y(t), 'axis'))
        p.append(txt(x0 - 7, Y(t) + 4.5, str(t), 'num', 'end'))
    step = (x1 - x0) / 5.0
    for i, (d, t) in enumerate(Q22):
        x = x0 + step * (i + 0.5)
        p.append(txt(x, y0 + 17, d))
        p.append(line(x - 4, Y(t) - 4, x + 4, Y(t) + 4, 'pt'))
        p.append(line(x - 4, Y(t) + 4, x + 4, Y(t) - 4, 'pt'))
        p.append(txt(x + 5, Y(t) - 7 if d == 'Fri' else Y(t) + 15, '%.1f' % t, 'num', 'start'))
    p.append(txt((x0 + x1) / 2, y0 + 36, '<tspan font-weight="700">Day</tspan>'))
    p.append(txt(40, 108, '<tspan font-weight="700">Temperature</tspan>'))
    p.append(txt(40, 124, '<tspan font-weight="700">in °C</tspan>'))
    return svg(''.join(p), y0 + 44,
               'A graph of the maximum temperature in degrees Celsius for five days, Monday to '
               'Friday, each value marked with a cross and written beside it.')


# ================================================================================================
# PAPER 2 Q23  --  Amina's 6 x 4 x 3 cuboid of centimetre cubes
# ================================================================================================
Q23_L, Q23_H, Q23_D = 6, 4, 3
assert Q23_L * Q23_H * Q23_D == 72                                          # the scheme's 72
assert (Q23_L + 5) * (Q23_H + 5) * (Q23_D + 5) == 792                       # and 792
assert 792 - 72 == 720


def p2q23():
    c, dx, dy = 24.0, 11.0, 8.0
    fx, fy = 92.0, 44.0                     # top-left of the front face
    p = []
    R = lambda i, j, k: (fx + i * c + k * dx, fy + j * c - k * dy)    # noqa: E731
    # front face
    for i in range(Q23_L + 1):
        p.append(line(*R(i, 0, 0), *R(i, Q23_H, 0), extra=' stroke-width="1"'))
    for j in range(Q23_H + 1):
        p.append(line(*R(0, j, 0), *R(Q23_L, j, 0), extra=' stroke-width="1"'))
    # top face
    for i in range(Q23_L + 1):
        p.append(line(*R(i, 0, 0), *R(i, 0, Q23_D), extra=' stroke-width="1"'))
    for k in range(Q23_D + 1):
        p.append(line(*R(0, 0, k), *R(Q23_L, 0, k), extra=' stroke-width="1"'))
    # right face
    for k in range(Q23_D + 1):
        p.append(line(*R(Q23_L, 0, k), *R(Q23_L, Q23_H, k), extra=' stroke-width="1"'))
    for j in range(Q23_H + 1):
        p.append(line(*R(Q23_L, j, 0), *R(Q23_L, j, Q23_D), extra=' stroke-width="1"'))
    # dimensions
    lx = fx - 14
    p.append(arrow2(lx, fy, lx, fy + Q23_H * c))
    p.append(txt(lx - 6, fy + Q23_H * c / 2 + 4, '4 cm', 'num', 'end'))
    by = fy + Q23_H * c + 14
    p.append(arrow2(fx, by, fx + Q23_L * c, by))
    p.append(txt(fx + Q23_L * c / 2, by + 17, '6 cm'))
    sx, sy = R(Q23_L, Q23_H, 0)
    p.append(arrow2(sx + 8, sy + 8, sx + 8 + Q23_D * dx, sy + 8 - Q23_D * dy))
    p.append(txt(sx + 14 + Q23_D * dx, sy + 14, '3 cm', 'num', 'start'))
    p.append(txt(sx + 14 + Q23_D * dx, fy + 6, '<tspan font-weight="700">Not actual</tspan>', 'num', 'start'))
    p.append(txt(sx + 14 + Q23_D * dx, fy + 22, '<tspan font-weight="700">size</tspan>', 'num', 'start'))
    return svg(''.join(p), by + 26,
               'A cuboid built from centimetre cubes, 6 cubes long, 4 cubes tall and 3 cubes deep, '
               'labelled 6 cm, 4 cm and 3 cm.')


# ================================================================================================
# PAPER 3 Q9  --  the pictogram: two whole circles and a quarter
# ================================================================================================
Q9_WHOLE, Q9_PART, Q9_KEY = 2, 0.25, 1000
assert Q9_WHOLE * Q9_KEY + Q9_PART * Q9_KEY == 2250                    # the scheme's 2,250


def p3q9():
    r, cy = 20.0, 52.0
    p = [line(70, 14, 70, 84), line(70, 84, 196, 84),
         txt(62, 50, '2016', 'num', 'end'), txt(62, 68, '<tspan font-weight="700">Year</tspan>', 'num', 'end'),
         txt(133, 104, '<tspan font-weight="700">Number of satellites</tspan>')]
    for i in range(Q9_WHOLE):
        p.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="currentColor" fill-opacity=".2" '
                 'stroke="currentColor" stroke-width="1.2"/>' % (98 + 44 * i, cy, r))
    # the quarter: the lower-left quarter of a circle whose centre is the top-right corner of the
    # piece -- straight top, straight right side, curved lower-left, as printed
    qx = 98 + 44 * Q9_WHOLE - 2 + r * 0.0
    p.append('<path d="M %.1f %.1f L %.1f %.1f A %.1f %.1f 0 0 0 %.1f %.1f Z" fill="currentColor" '
             'fill-opacity=".2" stroke="currentColor" stroke-width="1.2"/>'
             % (qx, cy, qx - r, cy, r, r, qx, cy + r))
    p.append('<rect x="214" y="18" width="118" height="68" fill="none" stroke="currentColor" '
             'stroke-width="1"/>')
    p.append('<circle cx="240" cy="52" r="%.1f" fill="currentColor" fill-opacity=".2" '
             'stroke="currentColor" stroke-width="1.2"/>' % r)
    p.append(txt(266, 48, '= 1,000', 'num', 'start'))
    p.append(txt(266, 64, 'satellites', 'num', 'start'))
    return svg(''.join(p), 114,
               'A pictogram for 2016 showing two whole circles and one quarter of a circle. The key '
               'says one circle stands for 1,000 satellites.')


# ================================================================================================
# PAPER 3 Q10  --  the grid with three points joined by two lines
# ================================================================================================
Q10_PTS = [(-2, 3), (-1, -2), (1, 2)]          # read off the page: dots at these grid crossings
Q10_NEW = (-1, 2)
Q10_QUAD = [Q10_PTS[0], Q10_PTS[1], Q10_PTS[2], Q10_NEW]
Q10_MOVED = [(x + 4, y) for x, y in Q10_QUAD]
assert Q10_MOVED == [(2, 3), (3, -2), (5, 2), (3, 2)], Q10_MOVED
assert all(-6 <= x <= 6 and -6 <= y <= 6 for x, y in Q10_QUAD + Q10_MOVED)


def p3q10():
    s, lo, hi = 20.0, -6, 6
    left, top = (W - (hi - lo) * s) / 2, 18.0
    to = lambda x, y: (left + (x - lo) * s, top + (hi - y) * s)     # noqa: E731
    p = []
    for v in range(lo, hi + 1):
        p.append(line(to(v, lo)[0], top, to(v, lo)[0], top + (hi - lo) * s, 'grid'))
        p.append(line(left, to(lo, v)[1], left + (hi - lo) * s, to(lo, v)[1], 'grid'))
    zx, zy = to(0, 0)
    p.append(line(left - 8, zy, left + (hi - lo) * s + 10, zy, 'axis'))
    p.append(head(left + (hi - lo) * s + 14, zy, 0))
    p.append(line(zx, top + (hi - lo) * s + 8, zx, top - 10, 'axis'))
    p.append(head(zx, top - 14, -90))
    for v in range(lo, hi + 1):
        if v:
            # 11px, and a negative x number nudged LEFT of its line (the minus sign makes it wide),
            # because at 20 units a square the 13px numbers ran into the origin's 0 and "-1 0"
            # read as "-10" on the first screenshot
            p.append(txt(to(v, 0)[0] - (2 if v < 0 else 0), zy + 13, str(v).replace('-', '−'),
                         size=11))
            p.append(txt(zx - 4, to(0, v)[1] + 4, str(v).replace('-', '−'), 'num', 'end', 11))
    p.append(txt(zx - 4, zy + 13, '0', 'num', 'end', 11))
    p.append(txt(left + (hi - lo) * s + 16, zy + 16, '<tspan class="lbl">x</tspan>'))
    p.append(txt(zx + 12, top - 6, '<tspan class="lbl">y</tspan>'))
    a, b, c = (to(*q) for q in Q10_PTS)
    p.append(line(*a, *b, extra=' stroke-width="1.6"'))
    p.append(line(*b, *c, extra=' stroke-width="1.6"'))
    p.extend(dot(*q) for q in (a, b, c))
    return svg(''.join(p), top + (hi - lo) * s + 14,
               'A coordinate grid with x and y from minus 6 to 6. Three points are marked, at '
               '(minus 2, 3), (minus 1, minus 2) and (1, 2), joined by two straight lines through '
               '(minus 1, minus 2).')


# ================================================================================================
# PAPER 3 Q21  --  rectangle ABDE on the axes, not to scale
# ================================================================================================
Q21_A, Q21_C = (25, 30), (40, 22)
Q21_B = (2 * Q21_C[0] - Q21_A[0], Q21_A[1])
Q21_D = (2 * Q21_C[0] - Q21_A[0], 2 * Q21_C[1] - Q21_A[1])
assert Q21_B == (55, 30) and Q21_D == (55, 14), (Q21_B, Q21_D)        # the scheme's answers


def p3q21():
    ox, oy = 40.0, 182.0
    ax, ay, bx, by = 110.0, 52.0, 252.0, 136.0          # the rectangle, as drawn on the paper
    cx, cy = (ax + bx) / 2, (ay + by) / 2
    b = lambda s: '<tspan font-weight="700">%s</tspan>' % s     # noqa: E731
    p = [line(ox, oy, 300, oy, 'axis'), head(304, oy, 0),
         line(ox, oy, ox, 14, 'axis'), head(ox, 10, -90),
         txt(ox - 6, oy + 14, '0', 'num', 'end'),
         txt(296, oy + 18, '<tspan class="lbl">x</tspan>'), txt(ox - 12, 18, '<tspan class="lbl">y</tspan>'),
         '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="currentColor" '
         'fill-opacity=".14" stroke="currentColor" stroke-width="1.4"/>' % (ax, ay, bx - ax, by - ay),
         dot(ax, ay), dot(bx, ay), dot(bx, by), dot(ax, by), dot(cx, cy),
         txt(ax - 4, ay - 8, b('A')), txt(bx + 4, ay - 8, b('B')),
         txt(ax - 4, by + 18, b('E')), txt(bx + 4, by + 18, b('D')),
         txt(ax - 6, ay + 16, '(25, 30)', 'num', 'end'),
         txt(cx - 6, cy - 6, b('C'), 'num', 'end'), txt(cx + 4, cy + 16, '(40, 22)', 'num', 'start'),
         txt(270, 82, b('Not to'), 'num', 'start'), txt(270, 98, b('scale'), 'num', 'start')]
    return svg(''.join(p), oy + 24,
               'Coordinate axes with rectangle ABDE drawn on them, sides parallel to the axes. A is '
               'the top-left corner at (25, 30), B top-right, D bottom-right and E bottom-left. C, '
               'the centre, is at (40, 22). Not to scale.')


# ================================================================================================
# PAPER 3 Q22  --  six identical right-angled triangles making a rectangle
# ================================================================================================
# Measured at 150 dpi: the rectangle is 290 px tall, the left part 291 px wide and the right part
# 146 px -- so the left part is a square 7 by 7 and the right part 3.5 wide, which is the only
# arrangement in which all six triangles are the same 3.5 by 7 right-angled triangle.
Q22_H = 7.0
Q22_LEFT, Q22_RIGHT = 7.0, 3.5
assert Q22_LEFT + Q22_RIGHT == 10.5                              # the scheme's 10.5
assert sorted([Q22_H / 2, Q22_LEFT]) == sorted([Q22_RIGHT, Q22_H])   # left and right triangles alike
assert abs(291 / 290 - Q22_LEFT / Q22_H) < 0.02 and abs(146 / 290 - Q22_RIGHT / Q22_H) < 0.02


def p3q22():
    u = 20.0
    x0, y0 = 70.0, 12.0
    X = lambda v: x0 + v * u                                         # noqa: E731
    Y = lambda v: y0 + v * u                                         # noqa: E731
    L = Q22_LEFT + Q22_RIGHT
    p = ['<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" stroke="currentColor" '
         'stroke-width="2"/>' % (X(0), Y(0), L * u, Q22_H * u),
         line(X(Q22_LEFT), Y(0), X(Q22_LEFT), Y(Q22_H), extra=' stroke-width="1.1"'),
         line(X(0), Y(Q22_H / 2), X(Q22_LEFT), Y(Q22_H / 2), extra=' stroke-width="1.1"'),
         line(X(0), Y(0), X(Q22_LEFT), Y(Q22_H / 2), extra=' stroke-width="1.1"'),
         line(X(0), Y(Q22_H), X(Q22_LEFT), Y(Q22_H / 2), extra=' stroke-width="1.1"'),
         line(X(Q22_LEFT), Y(0), X(L), Y(Q22_H), extra=' stroke-width="1.1"'),
         arrow2(X(0) - 16, Y(0), X(0) - 16, Y(Q22_H)),
         txt(X(0) - 22, Y(Q22_H / 2) + 4, '7 cm', 'num', 'end'),
         arrow_gap(X(0), X(L), Y(Q22_H) + 16, 48),
         txt(X(L / 2), Y(Q22_H) + 21, '<tspan font-weight="700">?</tspan> cm'),
         txt(X(L / 2), Y(Q22_H) + 42, '<tspan font-weight="700">%s</tspan>' % NOT_SIZE, 'cap')]
    return svg(''.join(p), Y(Q22_H) + 50,
               'A rectangle 7 cm tall made of six identical right-angled triangles: four on the '
               'left meeting at a point on a vertical line, two on the right either side of a '
               'diagonal. Its length is marked with a question mark. Not actual size.')


# ================================================================================================
# PAPER 3 Q23  --  P, Q and R on a line, 800 m, not to scale (Q is drawn where the paper draws it)
# ================================================================================================
def p3q23():
    x0, x1, y = 30.0, 310.0, 30.0
    qx = x0 + (x1 - x0) * (501.0 / 690.0)        # the paper's own, deliberately not 4 : 1
    b = lambda s: '<tspan font-weight="700">%s</tspan>' % s     # noqa: E731
    p = [line(x0, y, x1, y, extra=' stroke-width="1.6"'), dot(x0, y), dot(qx, y), dot(x1, y),
         txt(x0, y - 10, b('P')), txt(qx, y - 10, b('Q')), txt(x1, y - 10, b('R')),
         arrow_gap(x0, x1, y + 16, 54),
         txt((x0 + x1) / 2, y + 21, '800 m'),
         txt(x1, y + 46, b(NOT_SCALE), 'num', 'end')]
    return svg(''.join(p), y + 54,
               'Three points P, Q and R on a straight line, with Q between them nearer to R. The '
               'whole distance from P to R is marked 800 m. Not to scale.')


DRAWN = {}
for _name, _fn in [('p2q4', p2q4), ('p2q7', p2q7), ('p2q11', p2q11), ('p2q13', p2q13),
                   ('p2q17', p2q17), ('p2q21', p2q21), ('p2q22', p2q22), ('p2q23', p2q23),
                   ('p3q9', p3q9), ('p3q10', p3q10), ('p3q21', p3q21), ('p3q22', p3q22),
                   ('p3q23', p3q23)]:
    _s = _fn()
    m = re.match(r'<svg viewBox="0 0 (\d+) ([\d.]+)"', _s)
    assert m and int(m.group(1)) == W, '%s: viewBox width must be %d' % (_name, W)
    _h = float(m.group(2))
    for a, b_ in re.findall(r'(?:cx|x1|x2|x)="(-?[\d.]+)"[^>]*?(?:cy|y1|y2|y)="(-?[\d.]+)"', _s):
        assert -1 <= float(a) <= W + 1 and -1 <= float(b_) <= _h + 1, (_name, a, b_)
    for pts in re.findall(r'points="([^"]+)"', _s):
        for pair in pts.split():
            x, y = [float(v) for v in pair.split(',')]
            assert -1 <= x <= W + 1 and -1 <= y <= _h + 1, (_name, x, y)
    assert 'text-anchor="' not in _s and '<marker' not in _s, _name
    DRAWN[_name] = _s


# ================================================================================================
# TABLES -- a table is not a picture
# ================================================================================================
BOX = '&#9744;'
P2Q14_HTML = ('<p>Complete the table.</p><table><thead><tr><th></th><th scope="col">Round 39,476'
              '</th></tr></thead><tbody>'
              + ''.join('<tr><th scope="row">to the nearest %s</th><td>%s</td></tr>' % (n, BOX)
                        for n in ('10,000', '1,000', '100'))
              + '</tbody></table>')
Q15_ROWS = [('Raspberry', 12), ('Lemon', 8), ('Orange', 15), ('Blackcurrant', 25)]
assert sum(n for _, n in Q15_ROWS) == 60 and 15 * 100 // 60 == 25
P2Q15_HTML = ('<p>Amina asked 60 children to choose their favourite flavour of jelly. These were '
              'her results.</p><table><thead><tr><th scope="col">Flavour</th><th scope="col">'
              'Number of children</th></tr></thead><tbody>'
              + ''.join('<tr><th scope="row">%s</th><td>%d</td></tr>' % r for r in Q15_ROWS)
              + '<tr><th scope="row"><b>Total</b></th><td><b>60</b></td></tr></tbody></table>'
              '<p>What <b>percentage</b> of the 60 children chose orange?</p>')
KITTENS = [305, 375, 310, 255, 275, 410, 360, 345]               # as printed, two rows of four
assert max(KITTENS) - min(KITTENS) == 155                          # 7(a)
assert [sum(1 for k in KITTENS if lo <= k < lo + 50) for lo in (250, 300, 350, 400)] == [2, 3, 2, 1]
P3Q7_PRE = ('<p>This picture shows the masses of eight kittens.</p><table><tbody>'
            # FOUR ROWS OF TWO, not the paper's two rows of four: four columns ran off the right of
            # a 320px card and the table scrolled sideways on the first screenshot
            + ''.join('<tr><td>%d&nbsp;g</td><td>%d&nbsp;g</td></tr>' % (KITTENS[i], KITTENS[i + 1])
                      for i in range(0, 8, 2))
            + '</tbody></table>')


# ================================================================================================
# PREAMBLES -- the stem and the picture every part of the question shares
# ================================================================================================
PREAMBLES = [
    dict(paper=P2, q='8', id=ID2('8'), topics='Term-to-Term Rules', diagram=None, figure='',
         html='<p>In this sequence, the rule to get the next number is <b>multiply by 2, and then '
              'add 3</b>.</p><p>' + BOX + ' &nbsp; 25 &nbsp; 53 &nbsp; ' + BOX + '</p>'),
    dict(paper=P2, q='22', id=ID2('22'), topics='Mean', diagram='p2q22', figure='line-graph',
         html='<p>This graph shows the maximum temperature for five days.</p>',
         note='Every value is the paper’s own, printed beside its cross on the graph.'),
    dict(paper=P3, q='7', id=ID3('7'), topics='Subtraction', diagram=None, figure='',
         html=P3Q7_PRE),
    dict(paper=P3, q='10', id=ID3('10'), topics='Coordinates', diagram='p3q10', figure='grid',
         html='<p>On the grid there are three points joined by two lines.</p>',
         note='The three points are the paper’s: (−2, 3), (−1, −2) and (1, 2).'),
    dict(paper=P3, q='21', id=ID3('21'), topics='Coordinates', diagram='p3q21', figure='grid',
         html='<p><b>ABDE</b> is a rectangle on coordinate axes. The sides of the rectangle are '
              'parallel to the axes.</p><p>Point <b>C</b> is the centre of the rectangle.</p>',
         note='Drawn not to scale, as the paper’s is: the coordinates are to be worked out, '
              'not measured.'),
]
PRE_IDS = {p['id'] for p in PREAMBLES}

# ================================================================================================
# PER-ROW EDITS.  Keys present are set; a value of None removes the key.
# ================================================================================================
DROP = None
EDITS = {
    # ---------------------------------------------------------------------------- PAPER 2
    ID2('3'): dict(answer='<b>1,230,650</b> is 1st, <b>1,023,065</b> 2nd, <b>1,009,909</b> 3rd '
                          'and <b>1,009,099</b> smallest &mdash; all four are a million and '
                          'something, so compare the next digits along. 1,230,650 has 2 hundred '
                          'thousands, the most; 1,023,065 has 2 ten thousands; the two 1,009s are '
                          'equal until the hundreds, where 9 beats 0.'),
    ID2('4'): dict(answer_type='drawing', figure=DROP, diagram=DRAWN['p2q4'], diagram_by='family',
                   answer='Every corner goes the same number of squares on the OTHER side of the '
                          'mirror line, at the same height. So the reflected shape&rsquo;s long '
                          'upright edge is 4 squares left of the line; its top edge runs from 2 to '
                          '4 squares left; its bottom edge from 1 to 4 squares left; and the inward '
                          'corner is 3 squares left of the line, 2 squares above the bottom edge. '
                          'The scheme does not need it shaded.',
                   examiner_note='Grid, mirror line and shape are the paper’s, corner for '
                                 'corner.'),
    ID2('7'): dict(figure=DROP, diagram=DRAWN['p2q7'], diagram_by='family',
                   answer='<b>2.5 litres</b> &mdash; the scale has four small gaps to each litre, '
                          'so each gap is a quarter of a litre. The lowest mark is a quarter below '
                          '3, which is 2&frac34;, and the top of the paint is one more gap below '
                          'that: 2&frac34; &minus; &frac14; = 2&frac12;. The scheme accepts 2.5 or '
                          '2&frac12;.',
                   accept='2.5 | 2.5 litres | 2.5 l',
                   examiner_note='The scale is measured off the paper: 3, 4 and 5 litres with a '
                                 'mark every quarter-litre, and the paint one quarter below the '
                                 'lowest mark.'),
    ID2('8a'): dict(html='<p>Write the missing number in the <b>first</b> box.</p>'),
    ID2('8b'): dict(html='<p>Write the missing number in the <b>last</b> box.</p>'),
    ID2('11a'): dict(figure=DROP, diagram=DRAWN['p2q11'], diagram_by='family', accept=DROP,
                     answer='<b>0.25 kg</b> &mdash; a quarter of 1 is 0.25. The scheme refuses '
                            '<sup>1</sup>&frasl;<sub>4</sub> and any other fraction: the question '
                            'asks for a decimal, which is also why there is no Check here &mdash; '
                            'the marker would accept &frac14; as the same number.'),
    ID2('11b'): dict(accept='65 | 0.65 | 65p'),
    ID2('13'): dict(html='<p>Here is a sketch of a triangle. It is not drawn to scale.</p>'
                         '<p>Draw the full-size triangle <b>accurately</b>. Use an angle measurer '
                         '(protractor) and a ruler.</p><p>On the paper one line, 8&nbsp;cm long, '
                         'has been drawn for you &mdash; rule your own 8&nbsp;cm line first.</p>',
                    diagram=DRAWN['p2q13'], diagram_by='family'),
    ID2('14'): dict(html=P2Q14_HTML),
    ID2('15'): dict(html=P2Q15_HTML, accept='25 | 25%'),
    ID2('17'): dict(figure=DROP, diagram=DRAWN['p2q17'], diagram_by='family',
                    html='<p>These two shapes have the <b>same</b> perimeter.</p><p>The length of '
                         'each side of the <b>hexagon</b> is 8 centimetres.</p><p>Calculate the '
                         '<b>area</b> of the <b>square</b>.</p><p>Show your method</p>',
                    accept='144 | 144 cm² | 144 cm2 | 144cm²'),
    ID2('18'): dict(accept=DROP),
    ID2('19'): dict(accept='3.75 | 3.75 litres | 3.75 l'),
    ID2('20'): dict(answer='<b><sup>1</sup>&frasl;<sub>5</sub> and <sup>3</sup>&frasl;<sub>15</sub>'
                           '</b> &mdash; 20% is <sup>20</sup>&frasl;<sub>100</sub>, which cancels '
                           'to <sup>1</sup>&frasl;<sub>5</sub>; and <sup>3</sup>&frasl;<sub>15'
                           '</sub> cancels to <sup>1</sup>&frasl;<sub>5</sub> as well (divide top '
                           'and bottom by 3). The other three are not 20%: '
                           '<sup>1</sup>&frasl;<sub>20</sub> is 5%, <sup>20</sup>&frasl;<sub>40'
                           '</sub> is a half, which is 50%, and <sup>2</sup>&frasl;<sub>100</sub> '
                           'is 2%. Two marks for both right boxes and nothing else ticked; one mark '
                           'for one right box with nothing wrong, or both right with one wrong.'),
    ID2('21'): dict(answer_type='drawing', figure=DROP, diagram=DRAWN['p2q21'], diagram_by='family',
                    html='<p>Adam has this rectangular piece of card. It is marked with grid '
                         'lines.</p><p>Adam makes two straight cuts along the grid lines. The two '
                         'cuts divide the rectangle into 3 shapes:</p><ul><li>2 squares of '
                         '<b>different</b> size, and</li><li>1 rectangle.</li></ul><p>Using the '
                         'grid lines, draw <b>two</b> lines that show where Adam could have made '
                         'his cuts. Use a ruler.</p>',
                    answer='Cut off a <b>5 by 5 square</b>, then a <b>2 by 2 square</b>. The card '
                           'is 7 squares across and 5 down, so the biggest square it holds is 5 by '
                           '5: one cut from top to bottom, 5 squares in from either end. That '
                           'leaves a strip 2 squares wide and 5 tall; one cut across it, 2 squares '
                           'from its top or its bottom, makes a 2 by 2 square and leaves a 2 by 3 '
                           'rectangle. The scheme shows all four versions (big square at either '
                           'end, small square at the top or bottom of the strip) and any one earns '
                           'the mark. No other pair of cuts works.'),
    ID2('22a'): dict(html='<p>For what fraction of the five days was the maximum temperature below '
                          '10&nbsp;&deg;C?</p>',
                     answer='<b><sup>2</sup>&frasl;<sub>5</sub></b> &mdash; two of the five days, '
                            'Monday (8.1&nbsp;&deg;C) and Tuesday (9.3&nbsp;&deg;C), were below '
                            '10&nbsp;&deg;C. The scheme also accepts <sup>4</sup>&frasl;<sub>10'
                            '</sub> or 0.4.'),
    ID2('22b'): dict(accept='10.7 | 10.7°c | 10.7 °c'),
    ID2('23'): dict(diagram=DRAWN['p2q23'], diagram_by='family',
                    html='<p>Amina made this cuboid using centimetre cubes.</p><p>Stefan makes a '
                         'cuboid that is 5&nbsp;cm longer, 5&nbsp;cm taller and 5&nbsp;cm wider '
                         'than Amina&rsquo;s cuboid.</p><p>What is the <b>difference</b> between '
                         'the number of cubes in Amina&rsquo;s and Stefan&rsquo;s cuboids?</p>'
                         '<p>Show your method</p>',
                    accept='720 | 720 cubes'),
    # ---------------------------------------------------------------------------- PAPER 3
    # 3(2b) keeps its `4000000` alone: "4 million" in the cell is stripped to "4" by `markBare_`,
    # and the scheme refuses 4 -- a wrong answer marked right, measured before it was left out.
    ID3('4'): dict(accept=DROP,
                   answer='<b>0.009 kg, 0.99 kg, 1.025 kg, 1.25 kg</b> &mdash; pad them all to '
                          'three decimal places first (0.009, 0.990, 1.025, 1.250) and they compare '
                          'like whole numbers. 1.025 looks longer than 1.25 and is smaller, which '
                          'is the whole question. All four must be in order for the mark.'),
    ID3('7a'): dict(html='<p>What is the <b>difference</b> in mass between the heaviest kitten and '
                         'the lightest kitten?</p>',
                    accept='155 | 155 g | 155g'),
    ID3('9'): dict(figure=DROP, diagram=DRAWN['p3q9'], diagram_by='family',
                   html='<p>This pictogram shows the number of satellites above the Earth in '
                        '2016.</p><p>How many satellites were above the Earth in 2016?</p>',
                   answer='<b>2,250</b> &mdash; two whole circles are 2 &times; 1,000 = 2,000, and '
                          'the last symbol is a quarter of a circle, so it stands for a quarter of '
                          '1,000, which is 250. The scheme refuses 2,000&frac14;, 2&frac14; and '
                          '2.25: the question asks how many satellites, not how many symbols.',
                   accept='2250 | 2250 satellites'),
    ID3('10a'): dict(answer_type='drawing', figure=DROP,
                     html='<p>Lara plots <b>another point</b> on the grid at (&minus;1, 2). She '
                          'joins the points to make a quadrilateral.</p><p>Complete Lara&rsquo;s '
                          'quadrilateral on the grid. Use a ruler.</p>',
                     answer='Plot (&minus;1, 2) &mdash; one square left of the y-axis and two up '
                            '&mdash; and rule a line from it to (&minus;2, 3) and another to '
                            '(1, 2), the two loose ends of the lines already drawn. The '
                            'quadrilateral&rsquo;s corners are (&minus;2, 3), (&minus;1, &minus;2), '
                            '(1, 2) and (&minus;1, 2).'),
    ID3('10b'): dict(answer_type='drawing', figure=DROP,
                     answer='Move every corner 4 squares right and keep its y-coordinate: '
                            '(&minus;2, 3) goes to (2, 3), (&minus;1, &minus;2) to (3, &minus;2), '
                            '(1, 2) to (5, 2) and (&minus;1, 2) to (3, 2). Join them in the same '
                            'order. A translation only moves a shape &mdash; same size, same way '
                            'up. The scheme also gives the mark for a correct translation of a '
                            'wrong quadrilateral from part (a).'),
    ID3('14'): dict(accept='91 | 91 days'),
    ID3('15'): dict(accept='400 | 400 km | 400km'),
    ID3('16'): dict(accept='1.85 | 185p'),
    ID3('19'): dict(accept='7174 | 7174 beads'),
    ID3('20'): dict(accept='29 | 29 booklets'),
    ID3('21a'): dict(figure=DROP, accept=DROP,
                     html='<p>What are the coordinates of <b>B</b>?</p>',
                     answer='<b>(55, 30)</b> &mdash; C is halfway along the rectangle, so it is '
                            '40 &minus; 25 = 15 to the right of A, and B is another 15 beyond C, '
                            'at 55. B is on the same top edge as A, so its y-coordinate is still '
                            '30. Write it with x first: (30, 55) is a different point.'),
    ID3('21b'): dict(figure=DROP, accept=DROP,
                     html='<p>What are the coordinates of <b>D</b>?</p>',
                     answer='<b>(55, 14)</b> &mdash; D is the corner diagonally opposite A, so C '
                            'is halfway between them in BOTH directions: across, 55 as in part (a); '
                            'down, 22 is 8 below 30, so D is 8 below that again, at 14. The scheme '
                            'gives one mark for the right y-coordinates even if B and D share the '
                            'same wrong x.'),
    ID3('22'): dict(figure=DROP, diagram=DRAWN['p3q22'], diagram_by='family',
                    html='<p>Six identical right-angled triangles are arranged to make a '
                         'rectangle.</p><p>Calculate the <b>length</b> of the rectangle.</p>',
                    answer='<b>10.5 cm</b> &mdash; the six triangles are identical, so match their '
                           'sides. On the right, two triangles sit either side of a diagonal and '
                           'each runs the full 7&nbsp;cm height. On the left, four triangles are '
                           'stacked two high, so each has a side of half of 7, which is 3.5&nbsp;cm '
                           '&mdash; and since every triangle is the same, a triangle&rsquo;s two '
                           'short sides are 3.5&nbsp;cm and 7&nbsp;cm. The left part is therefore '
                           '7&nbsp;cm wide and the right part 3.5&nbsp;cm wide: '
                           '7 + 3.5 = 10.5&nbsp;cm. The scheme also accepts 10&frac12;.',
                    accept='10.5 | 10.5 cm | 10.5cm'),
    ID3('23'): dict(diagram=DRAWN['p3q23'], diagram_by='family'),
}
# the parts that take the preamble's stem: what each keeps is set in EDITS above
assert all(k in EDITS for k in (ID2('8a'), ID2('8b'), ID2('22a'), ID3('7a'), ID3('10a'),
                                ID3('21a'), ID3('21b')))

# ================================================================================================
# WRITE
# ================================================================================================
text = open(FILE, encoding='utf-8').read()
lines = text.split('\n')
out, seen, made = [], set(), []
FIRST_PART = {ID2('8a'): PREAMBLES[0], ID2('22a'): PREAMBLES[1], ID3('7a'): PREAMBLES[2],
              ID3('10a'): PREAMBLES[3], ID3('21a'): PREAMBLES[4]}


def dump(row, trailing):
    return json.dumps(row, ensure_ascii=False, separators=(',', ':')) + (',' if trailing else '')


for raw in lines:
    bare = raw.rstrip()
    trailing = bare.endswith(',')
    body = bare[:-1] if trailing else bare
    try:
        row = json.loads(body)
    except ValueError:
        out.append(raw)
        continue
    if row.get('paper_id') not in (P2, P3):
        out.append(raw)
        continue
    rid = row.get('row_id')
    if rid in PRE_IDS:
        raise SystemExit('%s already exists -- this script has already run against this file' % rid)
    if rid in FIRST_PART:
        p = FIRST_PART[rid]
        t = {k: row[k] for k in ('row_id', 'paper_id') if k in row}
        t['row_id'] = p['id']
        t['question'] = p['q']
        t['kind'] = 'preamble'
        if p['figure']:
            t['figure'] = p['figure']
        if p['diagram']:
            t['diagram'] = DRAWN[p['diagram']]
            t['diagram_by'] = 'family'
        t['html'] = p['html']
        for k in ('active', 'name', 'subject', 'key_stage', 'band_type', 'band_value', 'company',
                  'exam_board', 'year', 'document_type'):
            if k in row:
                t[k] = row[k]
        t['topics'] = p['topics']
        if p.get('note'):
            t['examiner_note'] = p['note']
        out.append(dump(t, True))
        made.append(p['id'])
    if rid in EDITS:
        for k, v in EDITS[rid].items():
            if v is None:
                row.pop(k, None)
            else:
                row[k] = v
        seen.add(rid)
        out.append(dump(row, trailing))
        continue
    out.append(raw)

missing = set(EDITS) - seen
assert not missing, 'rows not found: %s' % sorted(missing)
assert sorted(made) == sorted(PRE_IDS), made
open(FILE, 'w', encoding='utf-8').write('\n'.join(out))
print('preambles written: %s' % ', '.join(made))
print('rows edited: %d' % len(seen))
print('drawings: %d, each %d wide' % (len(DRAWN), W))
