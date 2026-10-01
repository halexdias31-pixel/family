"""
EDEXCEL 1MA1 HIGHER PAPER 2 (CALCULATOR), JUNE 2017 -- EVERY PICTURE THE PAPER PRINTS, AND THE
FOUR ANSWER CELLS THAT MARKED A RIGHT ANSWER WRONG.

ASKED FOR AS *"for lucca i like to do higher maths papers. im just scared as the papers i do
typically something is always wrong like your diagrams or something. i just want it to be good."*
Measured first, against the question paper itself (`2017 Paper 2 Thursday 8 June.pdf` in Drive,
P48148RA, the row's own `source_url`): 23 questions, 80 marks, every answer present -- and SEVENTEEN
rows carrying a `figure` with `diagram` empty on every one of them. Fourteen questions on this paper
are about a picture or a table, and the card drew none of them.

THE PROSE THAT STOOD IN FOR THE PICTURES WAS WRONG IN TWO PLACES AND GAVE THE ANSWER AWAY IN TWO MORE.

  Q3 said the prism was "2 m, 2 m, 1 m, 0.5 m, 0.5 m and a length of 2.5 m". The paper's 2.5 m is
  the SLOPING edge of the trapezium (2 across and 1.5 down: 2.5 by Pythagoras, asserted below) and
  the length of the prism is the 1 m. The answer built on that reading -- "a 5 cm by 1 cm rectangle"
  -- was the wrong side elevation, so a student following the card would have drawn it wrong and
  been told it was right.

  Q8 said "Reading off it, 48 of the students are 160 cm or shorter" -- the whole of the question,
  printed above the question. Q13 printed all five frequency densities in a sentence, which is the
  histogram read for you. Both now draw the graph and say nothing a student is meant to read off it.

  Q23's `accept` was the single alternative `3x + √7y = 8, that is y = (8 − 3x)⁄√7` -- one string
  with ", that is" in the middle of it, which nothing anybody types can ever match. The equation of
  a tangent has many right forms (rationalised, rearranged, decimal), so the cell is emptied and a
  person marks it -- a Check that knows two of them is a Check that tells the rest they are wrong.

THREE ANSWER CELLS TOLD A RIGHT ANSWER IT WAS WRONG, measured through the app's own `markAnswer_`
before anything was changed: `28/3` against `x = 28⁄3` (Q11), `29/20` and `1.45` against
`x = 29⁄20` (Q18), and `4.5388 x 10^24` -- with the letter x every keyboard has -- against
`4.5388 × 10^24 kg` (Q10b). The answer lines on the paper print `x =` already, so the bare value is
exactly what a student writes.

WHAT IS DRAWN, AND FROM WHAT. The PDF is vector (InDesign through Ghostscript), so every figure here
is the paper's own geometry rather than a reading by eye -- CLAUDE.md's rule for a picture that
carries data, and the reason the cumulative-frequency curve was not "redrawn by hand":

  Q8   the curve's four Bezier segments, converted from points to data units off the paper's own
       major gridlines (120 to 170 cm at 56.69 pt per 10; 0 to 60 at 56.69 per 10). It starts at
       (130, 5), ends at (170, 60), and passes 48 at 160 -- asserted by evaluating the curve.
  Q13  the five bars, measured: 1.10, 2.80, 2.31, 1.40, 0.70 -- and they sum to the 134 members the
       question states, which is the only end-to-end check a histogram has.
  Q14  the nine sketches, each curve's own control points, in one transform for the whole sheet.
  Q20  the parabola is the equation itself -- y = x^2 - 2x + 3 from x = -2 to 4 is exactly one
       quadratic Bezier with its control point where the end tangents meet -- on the paper's grid
       (x -4 to 6, y -1 to 11, fifths of a unit).
  Q3, Q5, Q9, Q12, Q15, Q21 the paper's own vertices and label positions, shifted and scaled.
  Q17  drawn TRUE rather than traced: the paper's sketch puts the sector at about 65 degrees, and an
       equilateral AOB makes it 60. A figure the question's own words determine exactly is drawn the
       way they determine it.

FOUR ARE TABLES AND NOT PICTURES -- Q1's probabilities, Q6's two banks, Q10's eight planets and
Q14's matching table. Q1 is set DOWN rather than across, because seven columns of numbers do not
fit a 320px card (CLAUDE.md records Saturday going off the edge of a five-column table). Q10's one
table is set as two -- distances, then masses -- because three columns of standard form do not fit
that card either, and the column cut off was the one Q10(a) asks about.

Q16's recurring dots are combining characters the app's serif sets beside the digit rather than
over it, so the row says what the two numbers are, as the library's other recurring rows do.
Equations are joined with no-break spaces (`EQ`), because a screenshot broke `y` from `= x^2 ...`.

THREE PREAMBLES, because three questions hang several parts from one figure: Q5 (the triangle and
its three lengths), Q10 (the planets) and Q20 (the graph). Q3 gets one as well, for a different
reason: the prism is the thing being looked AT and the centimetre grid is the thing being drawn ON,
and `padSource_` puts the pen on the part's own drawing -- so the prism sits above it on the
preamble and only the grid takes the pen. Q20's two parts are `drawing` now, because "by drawing a
suitable straight line" and a tangent are drawn on the graph, and Q9 is `annotate`, because the
scheme's method is to draw the four reflected triangles on the grid.

THE MARK SCHEME FOR THIS PAPER IS NOT IN DRIVE. Searched by code, title and text; the 2017 Higher
Paper 1 scheme is there and Paper 2's is not. So nothing here is "read off the scheme": every
numerical answer is re-derived and asserted below, the two tolerances that are a reading off a
picture (Q8, Q20b) are said as readings rather than as the scheme's words, and no `accept` is wider
than the arithmetic.

RUN ONCE. It refuses to run against its own output, as `tools/draw-1f-1705-q13.py` does.
"""
import json
import math
import os
import re
import sys
from fractions import Fraction as F

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgplot import W                           # noqa: E402  the one place the scale lives

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.path.join(HERE, 'data', 'questions.json')
PAPER = 'P-1MA1-1706-2H'
QID = lambda s: 'Q-1MA1-1706-2H-%s' % s          # noqa: E731
PID = lambda q: 'S-P-1MA1-1706-2H-q%s' % q       # noqa: E731
EXAM_DATE = '2017-06-08'                         # "Thursday 8 June 2017 - Morning", the cover

import datetime                                  # noqa: E402
assert datetime.date(2017, 6, 8).weekday() == 3, 'the cover says THURSDAY 8 June 2017'


# ================================================================================================
# DRAWING HELPERS
# ================================================================================================
def f(v):
    return '%.1f' % v


def svg(body, h, label):
    return '<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>' % (W, round(h), label, body)


def ln(x1, y1, x2, y2, w=1.2, extra=''):
    return ('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="currentColor" stroke-width="%s"%s/>'
            % (f(x1), f(y1), f(x2), f(y2), w, extra))


def gl(x1, y1, x2, y2, style=''):
    """A grid line. `class="grid"` is the faint one every drawing in the library uses; a heavier
       line is the same class with its weight overridden inline, because a class the stylesheet
       does not know is a class that draws nothing."""
    return ('<line x1="%s" y1="%s" x2="%s" y2="%s" class="grid"%s/>'
            % (f(x1), f(y1), f(x2), f(y2), (' style="%s"' % style) if style else ''))


MID = 'stroke-width:.7;opacity:.45'
MAJ = 'stroke-width:.9;opacity:.6'


def tx(x, y, s, cls='num', anchor='middle', style=''):
    """INLINE `style`, NOT `text-anchor=`. CSS beats an SVG presentation attribute, so
       `.qsheet .num { text-anchor: middle }` silently wins over the attribute -- CLAUDE.md records
       ten y-axis numbers sitting centred on their axis for exactly that."""
    st = 'text-anchor:%s' % anchor + (';' + style if style else '')
    return '<text x="%s" y="%s" class="%s" style="%s">%s</text>' % (f(x), f(y), cls, st, s)


def poly(pts, fill='none', w=1.2, close=True, extra=''):
    d = ' '.join('%s,%s' % (f(x), f(y)) for x, y in pts)
    tag = 'polygon' if close else 'polyline'
    return ('<%s points="%s" fill="%s" stroke="currentColor" stroke-width="%s"%s/>'
            % (tag, d, fill, w, extra))


def head(tip, frm, size=5.0):
    """A filled arrowhead at `tip`, pointing away from `frm`. A triangle rather than a `<marker>`:
       a marker needs an id, and five question cards in the DOM at once would put five elements
       with one id on the page -- CLAUDE.md records the browser resolving every one of them to the
       first."""
    dx, dy = tip[0] - frm[0], tip[1] - frm[1]
    n = math.hypot(dx, dy)
    ux, uy = dx / n, dy / n
    bx, by = tip[0] - ux * size, tip[1] - uy * size
    px, py = -uy * size * 0.55, ux * size * 0.55
    return ('<polygon points="%s,%s %s,%s %s,%s" fill="currentColor" stroke="none"/>'
            % (f(tip[0]), f(tip[1]), f(bx + px), f(by + py), f(bx - px), f(by - py)))


def frac_html(n, d):
    return ('<span class="frac"><span class="frac-n">%s</span><span class="frac-d">%s</span></span>'
            % (n, d))


def table(head_cells, rows, row_heads=True):
    h = ''.join('<th scope="col">%s</th>' % c for c in head_cells)
    body = ''
    for r in rows:
        first = ('<th scope="row">%s</th>' % r[0]) if row_heads else ('<td>%s</td>' % r[0])
        body += '<tr>%s%s</tr>' % (first, ''.join('<td>%s</td>' % c for c in r[1:]))
    return '<table><thead><tr>%s</tr></thead><tbody>%s</tbody></table>' % (h, body)


I = lambda s: '<i>%s</i>' % s                    # noqa: E731


def EQ(s):
    """An equation never breaks across a line. A screenshot showed `y` at the end of one line and
       `= x^2 - 2x + 3` at the start of the next, which reads as two things. No-break spaces rather
       than a nowrap span, because nothing else in the library carries an inline style."""
    assert '<' not in s.replace('<i>', '').replace('</i>', '').replace('<sup>', '').replace(
        '</sup>', ''), 'EQ only joins plain words: %s' % s
    return s.replace(' ', '&nbsp;')


# ================================================================================================
# Q1  --  the probability table, set down the card rather than across it
# ================================================================================================
Q1_P = {2: '0.17', 3: '0.18', 4: '0.09', 5: '0.15', 6: '0.1'}
Q1_P1 = 1 - sum(F(v) for v in Q1_P.values())
assert Q1_P1 == F('0.31'), Q1_P1
assert (Q1_P1 + F(Q1_P[3])) * 200 == 98                       # the answer
Q1_TABLE = table(['Number on dice', 'Probability'],
                 [['1', '']] + [[str(k), Q1_P[k]] for k in sorted(Q1_P)])


# ================================================================================================
# Q2  --  the theatre, which was right; set as the paper words it
# ================================================================================================
_children = 117 * 4                                            # 117 is the quarter NOT in the Stalls
_adults = F(_children * 5, 2)
assert _children == 468 and _adults == 1170
assert F(_children + 1170, 2600) == F(63, 100) > F(60, 100)    # "Yes" -- exactly 63%


# ================================================================================================
# Q3  --  the prism, and the centimetre grid it is drawn on
# ================================================================================================
# The cross section is the trapezium: 2 m along the bottom, 2 m up the tall side, 0.5 m up the short
# side, and the slope joins them. 2 across and 1.5 down is the paper's 2.5 m -- which is what makes
# 2.5 the SLOPE and 1 m the length of the prism, the thing the old row had backwards.
assert math.hypot(2, 2 - 0.5) == 2.5
Q3_FRONT = [(0, 0), (2, 0), (2, 0.5), (0, 2)]                  # metres: the front elevation
Q3_SIDE = (1, 2, 0.5)                                         # width, height, the line across it
Q3_SCALE = 2                                                  # 2 cm to 1 m

# Paper geometry, PDF points (page 4), read off the vectors.
P3 = dict(TL=(190.66, 131.55), TR=(303.16, 226.30), BR=(303.16, 267.30), BL=(190.66, 224.55),
          ST=(360.39, 183.86), SB=(360.39, 219.86), KT=(247.9, 89.1), KB=(247.9, 187.1))


def q3_prism():
    T = lambda p: (p[0] - 128.0, p[1] - 74.0)                 # noqa: E731
    P = {k: T(v) for k, v in P3.items()}
    solid = [('BL', 'TL'), ('TL', 'TR'), ('TR', 'BR'), ('BR', 'BL'), ('TR', 'ST'), ('BR', 'SB'),
             ('ST', 'SB'), ('ST', 'KT'), ('TL', 'KT')]
    dashed = [('KT', 'KB'), ('KB', 'SB'), ('KB', 'BL')]
    b = ''.join(ln(*P[a], *P[c], w=1.2) for a, c in solid)
    b += ''.join(ln(*P[a], *P[c], w=1.0, extra=' stroke-dasharray="5 3"') for a, c in dashed)
    # the two right-angle marks, at the bottom corners of the front face
    b += poly([T((190.66, 216.04)), T((198.85, 219.05)), T((198.85, 227.55))], close=False, w=.9)
    b += poly([T((303.16, 258.79)), T((294.98, 255.79)), T((294.98, 264.30))], close=False, w=.9)
    # the two viewing arrows
    b += ln(*T((177.5, 297.4)), *T((205.0, 274.5)), w=1.0) + head(T((208.0, 272.0)), T((177.5, 297.4)), 6)
    b += ln(*T((417.6, 275.3)), *T((383.5, 262.4)), w=1.0) + head(T((380.5, 261.2)), T((417.6, 275.3)), 6)
    for s, o in (('2 m', (165.6, 185.1)), ('2 m', (224.1, 257.5)), ('1 m', (335.0, 254.5)),
                 ('0.5 m', (364.3, 204.5)), ('0.5 m', (270.7, 245.5)), ('2.5 m', (310.5, 138.8)),
                 ('side', (423.8, 286.2)), ('front', (147.9, 302.8))):
        b += tx(*T(o), s, 'num', 'start', 'font-size:12px')
    return svg(b, 238, 'A prism lying on its long rectangular face. Its front face is a trapezium: '
                       'the bottom edge is 2 m, the left-hand edge is 2 m and the right-hand edge is '
                       '0.5 m, with a right angle at each bottom corner, and the top edge slopes '
                       'down from left to right. The prism is 1 m deep, and the sloping edge along '
                       'the back is 2.5 m. Hidden edges are dashed. An arrow marked front points at '
                       'the trapezium face; an arrow marked side points at the small 1 m by 0.5 m '
                       'rectangular face on the right.')


Q3_COLS, Q3_ROWS = 16, 11                                     # the paper's grid, in centimetres
assert Q3_SCALE * max(x for x, _ in Q3_FRONT) + Q3_SCALE * Q3_SIDE[0] < Q3_COLS
assert Q3_SCALE * Q3_SIDE[1] < Q3_ROWS


def q3_grid():
    c, L, T = 20.0, 10.0, 8.0
    b = ''.join(ln(L + i * c, T, L + i * c, T + Q3_ROWS * c, w=.8, extra=' opacity=".55"')
                for i in range(Q3_COLS + 1))
    b += ''.join(ln(L, T + j * c, L + Q3_COLS * c, T + j * c, w=.8, extra=' opacity=".55"')
                 for j in range(Q3_ROWS + 1))
    return svg(b, T + Q3_ROWS * c + 8, 'A centimetre grid, sixteen squares across and eleven '
                                       'down, with nothing drawn on it.')


# ================================================================================================
# Q5  --  the triangle with DB parallel to EA
# ================================================================================================
assert F('8.1') / F('5.4') == F(3, 2)
assert F('2.6') * F(3, 2) == F('3.9')                          # (a) AE
assert F('6.15') - F('6.15') / F(3, 2) == F('2.05')            # (b) AB = AC - BC


def q5():
    T = lambda p: (p[0] - 122.0, p[1] - 62.0)                 # noqa: E731
    E, C, A = T((152.5, 194.4)), T((446.0, 194.4)), T((262.5, 84.1))
    B, D = T((326.0, 122.2)), T((253.9, 194.4))
    b = poly([E, C, A], w=1.3) + ln(*D, *B, w=1.3)
    # the parallel arrows: one chevron on EA and one on DB, both pointing up the line
    b += poly([T((209.2, 141.4)), T((211.2, 135.4)), T((205.2, 137.4))], close=False, w=1.0)
    b += poly([T((284.0, 168.4)), T((286.0, 162.4)), T((280.0, 164.4))], close=False, w=1.0)
    for s, o in (('A', (259.6, 81.3)), ('B', (325.8, 119.8)), ('C', (442.5, 206.4)),
                 ('E', (144.5, 206.4)), ('D', (247.2, 206.4))):
        b += tx(*T(o), s, 'lbl', 'start')
    return svg(b, 156, 'Triangle AEC with E bottom left, C bottom right and A at the top. B is on '
                       'AC and D is on EC, and the line DB is parallel to EA, each marked with an '
                       'arrow.')


# ================================================================================================
# A GRAPH ON THE PAPER'S OWN GRID -- one routine for Q8, Q13 and Q20 so they agree about a grid
# ================================================================================================
def graph(x0, x1, y0, y1, L, T, ux, uy, minor, mid, major):
    """Returns (parts, sx, sy, R, B). `minor`, `mid` and `major` are (x step, y step) in data units;
       a line on a major step is drawn heavier, one on a mid step a little heavier, the rest faint --
       the three weights the paper prints, which is what lets a value be read off it."""
    sx = lambda v: L + (v - x0) * ux                           # noqa: E731
    sy = lambda v: T + (y1 - v) * uy                           # noqa: E731
    R, B = sx(x1), sy(y0)
    on = lambda v, s: abs(v / s - round(v / s)) < 1e-6         # noqa: E731
    p = []
    n = int(round((x1 - x0) / minor[0]))
    for i in range(n + 1):
        v = x0 + i * minor[0]
        st = MAJ if on(v, major[0]) else MID if on(v, mid[0]) else ''
        p.append(gl(sx(v), T, sx(v), B, st))
    n = int(round((y1 - y0) / minor[1]))
    for i in range(n + 1):
        v = y0 + i * minor[1]
        st = MAJ if on(v, major[1]) else MID if on(v, mid[1]) else ''
        p.append(gl(L, sy(v), R, sy(v), st))
    return p, sx, sy, R, B


def bez_at(seg, t):
    (a, b), (c, d), (e, g), (h, k) = seg
    m = 1 - t
    return (m ** 3 * a + 3 * m * m * t * c + 3 * m * t * t * e + t ** 3 * h,
            m ** 3 * b + 3 * m * m * t * d + 3 * m * t * t * g + t ** 3 * k)


# ================================================================================================
# Q8  --  the cumulative frequency curve, traced off the paper's own Bezier segments
# ================================================================================================
# PDF points converted to (height cm, cumulative frequency) off the paper's major gridlines, then
# moved by (+0.09, +0.085) -- the stroke sits that far off the line it is drawn along, which is what
# makes the two ends land on (130, 5) and (170, 60) rather than a hair short of both.
Q8_CURVE = [
    [(130.00, 5.00), (130.00, 5.00), (134.75, 7.93), (140.01, 13.10)],
    [(140.01, 13.10), (143.58, 16.60), (147.45, 20.72), (150.01, 25.04)],
    [(150.01, 25.04), (153.88, 31.56), (155.14, 39.68), (159.99, 48.08)],
    [(159.99, 48.08), (162.28, 52.02), (165.48, 56.27), (170.00, 60.00)],
]
assert Q8_CURVE[0][0] == (130.00, 5.00) and Q8_CURVE[-1][-1] == (170.00, 60.00)
for _a, _b in zip(Q8_CURVE, Q8_CURVE[1:]):
    assert _a[-1] == _b[0], 'the segments must join'


def q8_read(xv):
    for seg in Q8_CURVE:
        if seg[0][0] <= xv <= seg[-1][0]:
            lo, hi = 0.0, 1.0
            for _ in range(60):
                mid = (lo + hi) / 2
                if bez_at(seg, mid)[0] < xv:
                    lo = mid
                else:
                    hi = mid
            return bez_at(seg, lo)[1]
    raise ValueError(xv)


Q8_AT_160 = q8_read(160.0)
assert abs(Q8_AT_160 - 48) < 0.25, Q8_AT_160                    # 48 are 160 cm or shorter
assert 60 - round(Q8_AT_160) == 12                             # the answer


def q8():
    p, sx, sy, R, B = graph(120, 170, 0, 60, L=52.0, T=16.0, ux=274 / 50, uy=274 / 50,
                            minor=(1, 1), mid=(5, 5), major=(10, 10))
    p.append(ln(sx(120), B, R + 10, B, w=1.3) + head((R + 14, B), (R, B), 6))
    p.append(ln(sx(120), B, sx(120), sy(60) - 8, w=1.3) + head((sx(120), sy(60) - 12), (sx(120), B), 6))
    for v in range(120, 171, 10):
        p.append(tx(sx(v), B + 15, str(v)))
    for v in range(0, 61, 10):
        p.append(tx(sx(120) - 5, sy(v) + 4, str(v), 'num', 'end'))
    d = 'M %s %s' % (f(sx(Q8_CURVE[0][0][0])), f(sy(Q8_CURVE[0][0][1])))
    for seg in Q8_CURVE:
        d += ' C ' + ' '.join('%s %s' % (f(sx(x)), f(sy(y))) for x, y in seg[1:])
    p.append('<path d="%s" fill="none" stroke="currentColor" stroke-width="1.4"/>' % d)
    p.append(tx((sx(120) + R) / 2, B + 32, 'Height (cm)', 'num', 'middle', 'font-size:12px'))
    cy = (sy(60) + B) / 2
    p.append('<text x="14" y="%s" class="num" style="text-anchor:middle;font-size:12px" '
             'transform="rotate(-90 14 %s)">Cumulative frequency</text>' % (f(cy), f(cy)))
    return svg(''.join(p), B + 40, 'A cumulative frequency graph of the heights of 60 students. '
                                   'Height in cm runs from 120 to 170 along the bottom and '
                                   'cumulative frequency from 0 to 60 up the side, on a grid of '
                                   'one-unit squares. The curve starts at 130 cm and 5, rises '
                                   'slowly, then steeply between 150 and 160 cm, and levels off to '
                                   'reach 60 at 170 cm.')


# ================================================================================================
# Q9  --  triangle A on the grid
# ================================================================================================
Q9_A = [(3, 3), (4, 3), (4, 1)]
_refl_x = lambda p: (p[0], -p[1])                             # noqa: E731
_refl_yx = lambda p: (p[1], p[0])                             # noqa: E731
Q9_C = [_refl_yx(_refl_x(p)) for p in Q9_A]                   # Kyle: x-axis, then y = x
Q9_E = [_refl_x(_refl_yx(p)) for p in Q9_A]                   # Amy: y = x, then x-axis
assert sorted(Q9_C) == [(-3, 3), (-3, 4), (-1, 4)], Q9_C
assert sorted(Q9_E) == [(1, -4), (3, -4), (3, -3)], Q9_E
assert set(Q9_C) != set(Q9_E), 'Amy is NOT correct'
assert set((-x, -y) for x, y in Q9_C) == set(Q9_E), 'they are a half turn apart'
for _p in Q9_A + Q9_C + Q9_E:
    assert all(-5 <= v <= 5 for v in _p)


Q9_LINE = 'stroke-width:.6;opacity:.4'


def q9():
    s, L, T = 26.0, 40.0, 24.0
    X = lambda v: L + (v + 5) * s                             # noqa: E731
    Y = lambda v: T + (5 - v) * s                             # noqa: E731
    # A LIGHT GRID, because every axis number sits on a grid line: at the weight of the centimetre
    # grid in Q3 a screenshot showed the lines striking through -5 to 5 on both axes.
    b = ''.join(gl(X(v), Y(5), X(v), Y(-5), Q9_LINE) for v in range(-5, 6))
    b += ''.join(gl(X(-5), Y(v), X(5), Y(v), Q9_LINE) for v in range(-5, 6))
    b += ln(X(-5), Y(0), X(5) + 10, Y(0), w=1.3) + head((X(5) + 15, Y(0)), (X(5), Y(0)), 6)
    b += ln(X(0), Y(-5), X(0), Y(5) - 10, w=1.3) + head((X(0), Y(5) - 15), (X(0), Y(5)), 6)
    for v in range(-5, 6):
        if v:
            b += tx(X(v), Y(0) + 15, str(v).replace('-', '−'))
            b += tx(X(0) - 5, Y(v) + 4, str(v).replace('-', '−'), 'num', 'end')
    b += tx(X(0) - 5, Y(0) + 15, 'O', 'num', 'end', 'font-style:italic')
    b += tx(X(5) + 22, Y(0) + 4, 'x', 'num', 'middle', 'font-style:italic')
    b += tx(X(0) - 9, Y(5) - 9, 'y', 'num', 'middle', 'font-style:italic')
    b += poly([(X(x), Y(y)) for x, y in Q9_A], w=1.6)
    b += tx(X(3.65), Y(2.33), 'A', 'num', 'middle', 'font-weight:700')
    return svg(b, Y(-5) + 8, 'A coordinate grid with x and y from minus 5 to 5. Triangle A has '
                             'its corners at (3, 3), (4, 3) and (4, 1).')


# ================================================================================================
# Q12(a)  --  Mr Lear's tree diagram, wrong on purpose
# ================================================================================================
Q12_TREE = {'first': (16, 14), 'after_boy': (15, 14), 'after_girl': (16, 13)}
assert sum(Q12_TREE['first']) == 30
assert sum(Q12_TREE['after_boy']) == 29 and sum(Q12_TREE['after_girl']) == 29
# -- out of 30 when they should be out of 29, which is also why each pair adds to 29/30, not 1


def q12():
    T = lambda p: (p[0] - 120.0, p[1] - 142.0)                # noqa: E731
    root = T((148.1, 316.5))
    b = ln(*root, *T((255.1, 245.2))) + ln(*root, *T((255.1, 387.8)))
    for fork, top, bot in (((299.5, 243.0), (406.3, 189.6), (406.3, 296.4)),
                           ((299.5, 388.0), (406.3, 334.6), (406.3, 441.4))):
        b += ln(*T(fork), *T(top)) + ln(*T(fork), *T(bot))
    fr = [('16', '30', (180.4, 261.5, 266.0)), ('14', '30', (180.4, 363.0, 367.5)),
          ('15', '30', (337.3, 192.6, 197.1)), ('14', '30', (337.3, 284.1, 288.6)),
          ('16', '30', (337.3, 338.6, 343.1)), ('13', '30', (337.3, 430.1, 434.6))]
    for n, d, (cx, base, bar) in fr:
        X, Yn = T((cx, base))
        _, Yb = T((cx, bar))
        b += tx(X, Yn, n, 'num', 'middle', 'font-size:12px')
        b += ln(X - 6.4, Yb, X + 6.4, Yb, w=.7)
        b += tx(X, Yn + 16.9, d, 'num', 'middle', 'font-size:12px')
    for s, (cx, base) in (('boy', (417.2, 190.6)), ('girl', (417.2, 300.6)), ('boy', (417.2, 335.6)),
                          ('girl', (417.2, 445.6)), ('boy', (266.4, 247.6)), ('girl', (266.4, 391.6))):
        b += tx(*T((cx, base)), s, 'num', 'middle', 'font-size:12px')
    b += tx(*T((266.4, 162.4)), '1st student', 'num', 'middle', 'font-size:12px;font-weight:700')
    b += tx(*T((417.2, 162.4)), '2nd student', 'num', 'middle', 'font-size:12px;font-weight:700')
    # the two shared numerators in the check above are the paper's: assert the drawing says them
    assert [n for n, _, _ in fr] == ['16', '14', '15', '14', '16', '13']
    return svg(b, 314, 'A probability tree diagram for the 1st and 2nd student chosen. First '
                       'branches: boy 16 over 30, girl 14 over 30. After a boy: boy 15 over 30, '
                       'girl 14 over 30. After a girl: boy 16 over 30, girl 13 over 30.')


# ================================================================================================
# Q13  --  the histogram, measured off the paper and checked against its own 134
# ================================================================================================
Q13_BARS = [(0, 10, F('1.1')), (10, 20, F('2.8')), (20, 40, F('2.3')), (40, 60, F('1.4')),
            (60, 90, F('0.7'))]
assert sum((b - a) * d for a, b, d in Q13_BARS) == 134         # the question's own membership
_over50 = F(60 - 50) * F('1.4') + F(90 - 60) * F('0.7')
assert _over50 == 35 and _over50 * F(20, 100) == 7             # the answer


def q13():
    p, sx, sy, R, B = graph(0, 100, 0, 3.0, L=52.0, T=16.0, ux=2.74, uy=274 / 3.0,
                            minor=(2, 0.05), mid=(10, 0.25), major=(20, 0.5))
    for a, c, d in Q13_BARS:
        p.append('<rect x="%s" y="%s" width="%s" height="%s" fill="none" stroke="currentColor" '
                 'stroke-width="1.5"/>' % (f(sx(a)), f(sy(float(d))), f(sx(c) - sx(a)),
                                          f(B - sy(float(d)))))
    p.append(ln(sx(0), B, R + 10, B, w=1.3) + head((R + 14, B), (R, B), 6))
    p.append(ln(sx(0), B, sx(0), sy(3.0) - 8, w=1.3) + head((sx(0), sy(3.0) - 12), (sx(0), B), 6))
    for v in range(0, 101, 20):
        p.append(tx(sx(v), B + 15, str(v)))
    for k in range(7):
        v = k * 0.5
        p.append(tx(sx(0) - 5, sy(v) + 4, '0' if not k else '%.1f' % v, 'num', 'end'))
    p.append(tx((sx(0) + R) / 2, B + 32, 'Age in years', 'num', 'middle', 'font-size:12px'))
    cy = (sy(3.0) + B) / 2
    p.append('<text x="14" y="%s" class="num" style="text-anchor:middle;font-size:12px" '
             'transform="rotate(-90 14 %s)">Frequency density</text>' % (f(cy), f(cy)))
    return svg(''.join(p), B + 40, 'A histogram of the ages of the members of a sports club. Age '
                                   'in years runs from 0 to 100 along the bottom and frequency '
                                   'density from 0 to 3.0 up the side. There are five bars, for '
                                   'ages 0 to 10, 10 to 20, 20 to 40, 40 to 60 and 60 to 90, of '
                                   'different heights.')


# ================================================================================================
# Q14  --  nine sketch graphs, each curve the paper's own Bezier segments
# ================================================================================================
# (letter, frame left, frame top, y-axis x, (y-axis top, bottom), x-axis y, (x-axis left, right),
#  [segments of (x0 y0 x1 y1 x2 y2 x3 y3)], label origins for y, O, x and the letter)  -- PDF points
Q14 = [
    ('A', 70.99, 87.76, 144.04, (107.45, 221.34), 167.93, (89.12, 204.0),
     [[[96.17, 163.46, 96.17, 163.46, 180.67, 173.21, 181.92, 105.71]]],
     (132.66, 111.0), (131.98, 179.31), (199.84, 179.31), (77.03, 101.9)),
    ('D', 70.99, 243.66, 146.04, (263.32, 379.22), 323.81, (89.12, 204.0),
     [[[95.46, 323.81, 97.67, 338.71, 103.01, 368.55, 110.33, 368.55],
       [110.33, 368.55, 120.08, 368.55, 128.49, 284.79, 146.04, 284.79],
       [146.04, 284.79, 163.58, 284.79, 166.08, 368.55, 179.33, 368.55],
       [179.33, 368.55, 186.74, 368.55, 192.51, 344.83, 198.74, 323.8]]],
     (134.66, 266.9), (133.98, 335.22), (199.84, 335.22), (76.71, 257.81)),
    ('G', 70.99, 399.57, 146.04, (419.23, 535.13), 479.71, (89.12, 204.0),
     [[[93.04, 530.71, 93.04, 530.71, 99.79, 478.72, 146.04, 479.71],
       [146.04, 479.71, 192.29, 480.71, 196.91, 530.58, 196.91, 530.58]]],
     (134.66, 422.81), (133.98, 491.12), (199.84, 491.12), (76.37, 413.71)),
    ('B', 226.89, 87.76, 299.97, (107.42, 223.32), 167.9, (245.05, 359.93),
     [[[245.05, 163.43, 245.05, 163.43, 287.35, 165.93, 293.1, 151.68],
       [293.1, 151.68, 297.36, 141.1, 296.1, 115.18, 296.1, 115.18]],
      [[304.44, 222.82, 304.44, 222.82, 301.94, 180.52, 316.19, 174.77],
       [316.19, 174.77, 326.76, 170.5, 352.69, 171.77, 352.69, 171.77]]],
     (288.57, 111.0), (287.89, 179.31), (355.74, 179.31), (232.94, 101.9)),
    ('E', 226.89, 243.66, 301.95, (263.32, 379.22), 323.81, (245.03, 359.9),
     [[[258.74, 272.81, 258.74, 272.81, 266.4, 374.56, 301.94, 375.81],
       [301.94, 375.81, 337.49, 377.06, 344.24, 272.81, 344.24, 272.81]]],
     (290.57, 266.9), (289.89, 335.22), (355.75, 335.22), (232.95, 257.81)),
    ('H', 226.89, 399.57, 299.95, (419.23, 535.13), 479.71, (245.03, 359.9),
     [[[354.86, 475.24, 354.86, 475.24, 312.56, 477.74, 306.81, 463.49],
       [306.81, 463.49, 302.55, 452.92, 303.81, 426.99, 303.81, 426.99]],
      [[295.47, 534.63, 295.47, 534.63, 297.97, 492.33, 283.72, 486.58],
       [283.72, 486.58, 273.15, 482.32, 247.22, 483.58, 247.22, 483.58]]],
     (288.57, 422.81), (288.39, 490.13), (355.75, 491.12), (232.28, 413.71)),
    ('C', 382.8, 87.76, 463.86, (107.42, 223.32), 167.9, (400.94, 515.81),
     [[[408.11, 127.34, 409.63, 125.33, 411.32, 124.19, 413.22, 124.19],
       [413.22, 124.19, 430.07, 124.19, 430.07, 213.56, 446.92, 213.56],
       [446.92, 213.56, 463.78, 213.56, 463.78, 124.19, 480.63, 124.19],
       [480.63, 124.19, 497.49, 124.19, 497.49, 213.56, 514.34, 213.56],
       [514.34, 213.56, 516.16, 213.56, 517.78, 212.53, 519.24, 210.68]]],
     (452.47, 111.0), (450.8, 178.32), (511.66, 179.31), (388.52, 101.9)),
    ('F', 382.8, 243.66, 457.85, (263.32, 379.22), 323.81, (400.94, 515.81),
     [[[406.37, 377.27, 416.41, 326.64, 442.38, 326.15, 457.85, 323.8],
       [457.85, 323.8, 473.33, 321.45, 499.29, 320.97, 509.33, 270.33]]],
     (446.47, 266.9), (446.79, 335.22), (511.66, 335.22), (389.41, 257.81)),
    ('I', 382.8, 399.57, 457.85, (419.51, 535.41), 479.99, (400.94, 515.81),
     [[[495.54, 475.27, 495.54, 475.27, 411.04, 485.02, 409.79, 417.52]]],
     (446.47, 422.81), (446.79, 491.12), (511.64, 491.12), (390.51, 413.71)),
]
Q14_SIDE = 141.23
assert sorted(g[0] for g in Q14) == list('ABCDEFGHI')
# the four the question asks about, read off the shapes rather than taken on trust:
#   C rises THROUGH the origin and repeats -- sin x.        F is the cubic through the origin.
#   A meets the y-axis above O and grows -- 2^x.           H has its branches in quadrants 1 and 3.
_c = [g for g in Q14 if g[0] == 'C'][0]
_cs = _c[7][0][2]                                    # the trough-to-peak piece; its midpoint is O
_cm = bez_at([(_cs[0], _cs[1]), (_cs[2], _cs[3]), (_cs[4], _cs[5]), (_cs[6], _cs[7])], 0.5)
assert abs(_cm[0] - _c[3]) < 0.5 and abs(_cm[1] - _c[5]) < 1.5, ('C passes through O', _cm)
assert _cs[1] > _c[5] > _cs[7], 'C RISES through O (a trough to its left, a peak to its right)'
_h = [g for g in Q14 if g[0] == 'H'][0]
assert all(s[-2] > _h[3] for s in _h[7][0]) and _h[7][0][-1][-1] < _h[5], 'H: one branch up and right'
assert all(s[-2] < _h[3] for s in _h[7][1]) and _h[7][1][-1][-1] > _h[5], 'H: the other down and left'
_b = [g for g in Q14 if g[0] == 'B'][0]
assert _b[7][0][-1][-2] < _b[3] and _b[7][0][-1][-1] < _b[5], 'B: its left branch is ABOVE the axis'


def q14():
    s = (W - 8) / (524.03 - 70.99)
    T = lambda x, y: (4 + (x - 70.99) * s, 4 + (y - 87.76) * s)   # noqa: E731
    b = ''
    for (let, fx, fy, ax, (ay0, ay1), xy, (xx0, xx1), curves, oy, oo, ox, ol) in Q14:
        x0, y0 = T(fx, fy)
        b += ('<rect x="%s" y="%s" width="%s" height="%s" fill="none" stroke="currentColor" '
              'stroke-width=".8"/>' % (f(x0), f(y0), f(Q14_SIDE * s), f(Q14_SIDE * s)))
        b += ln(*T(ax, ay1), *T(ax, ay0 + 3), w=.9) + head(T(ax, ay0 - 1), T(ax, ay1), 4.2)
        b += ln(*T(xx0, xy), *T(xx1 - 3, xy), w=.9) + head(T(xx1 + 1, xy), T(xx0, xy), 4.2)
        for segs in curves:
            d = 'M %s %s' % tuple(f(v) for v in T(segs[0][0], segs[0][1]))
            for sg in segs:
                d += ' C ' + ' '.join('%s %s' % tuple(f(v) for v in T(sg[i], sg[i + 1]))
                                      for i in (2, 4, 6))
            b += '<path d="%s" fill="none" stroke="currentColor" stroke-width="1.3"/>' % d
        for ch, o in (('y', oy), ('O', oo), ('x', ox)):
            b += tx(*T(*o), ch, 'num', 'start', 'font-size:10px;font-style:italic')
        b += tx(*T(*ol), let, 'num', 'start', 'font-size:11px;font-weight:700')
    return svg(b, 8 + (540.8 - 87.76) * s, 'Nine sketch graphs labelled A to I, each on its own '
                                           'x and y axes through O. A: a curve rising more and '
                                           'more steeply to the right and flattening towards the '
                                           'x-axis on the left, crossing the y-axis above O. B: '
                                           'two branches, top left and bottom right of O. C: a '
                                           'wave rising through O. D: a wave with a peak on the '
                                           'y-axis. E: a U-shaped curve with its lowest point on '
                                           'the y-axis below O. F: a curve from bottom left to '
                                           'top right through O, S-shaped. G: an upside '
                                           'down U with its top at O. H: two branches, top right '
                                           'and bottom left of O. I: a curve falling from top '
                                           'left towards the x-axis on the right.')


Q14_TABLE = table(['Equation', 'Graph'],
                  [['<i>y</i> = sin&nbsp;<i>x</i>', ''],
                   ['<i>y</i> = <i>x</i><sup>3</sup> + 4<i>x</i>', ''],
                   ['<i>y</i> = 2<sup><i>x</i></sup>', ''],
                   ['<i>y</i> = ' + frac_html('4', '<i>x</i>'), '']], row_heads=False)


# ================================================================================================
# Q15  --  the cyclic quadrilateral and its two diagonals
# ================================================================================================
Q15_O, Q15_R = (296.4, 224.4), 132.0
Q15_P = dict(A=(217.8, 118.4), B=(416.9, 170.5), C=(407.4, 295.8), D=(222.6, 333.9))
for _k, _v in Q15_P.items():
    assert abs(math.hypot(_v[0] - Q15_O[0], _v[1] - Q15_O[1]) - Q15_R) < 1.5, _k


def q15():
    T = lambda p: (p[0] - 145.0, p[1] - 82.0)                 # noqa: E731
    P = {k: T(v) for k, v in Q15_P.items()}
    cx, cy = T(Q15_O)
    b = ('<circle cx="%s" cy="%s" r="%s" fill="none" stroke="currentColor" stroke-width="1.2"/>'
         % (f(cx), f(cy), f(Q15_R)))
    b += poly([P['A'], P['B'], P['C'], P['D']], w=1.2)
    b += ln(*P['A'], *P['C']) + ln(*P['B'], *P['D'])
    for s, o in (('A', (204.4, 117.5)), ('D', (210.7, 344.8)), ('E', (325.6, 237.2)),
                 ('C', (409.0, 305.6)), ('B', (420.3, 170.2))):
        b += tx(*T(o), s, 'lbl', 'start')
    return svg(b, 282, 'Four points A, B, C and D on a circle, joined to make a quadrilateral '
                       'ABCD, with its two diagonals AC and BD crossing at E.')


# ================================================================================================
# Q17  --  the sector, drawn with the angle its own words give it
# ================================================================================================
Q17_R, Q17_SIDE = 11, 7
_sector = F(60, 360) * math.pi * Q17_R ** 2
_tri = math.sqrt(3) / 4 * Q17_SIDE ** 2
assert round(100 * (_sector - _tri) / _sector, 1) == 66.5       # the answer


def q17():
    O = (300.0, 228.0)
    R = 236.0
    k = R / Q17_R
    pt = lambda deg, rad: (O[0] + rad * math.cos(math.radians(deg)),   # noqa: E731
                           O[1] - rad * math.sin(math.radians(deg)))
    Q, N = pt(180, R), pt(120, R)
    A, B = pt(120, Q17_SIDE * k), pt(180, Q17_SIDE * k)
    # THE ORDER ROUND THE SHADED REGION IS B, A, N, the arc, Q -- A to N is a straight piece of ON
    # and Q back to B is a straight piece of OQ, so the arc has to start at N and end at Q.
    shade = ('<path d="M %s %s L %s %s L %s %s A %s %s 0 0 0 %s %s Z" fill="currentColor" '
             'fill-opacity=".22" stroke="none"/>'
             % (f(B[0]), f(B[1]), f(A[0]), f(A[1]), f(N[0]), f(N[1]), f(R), f(R), f(Q[0]), f(Q[1])))
    arc = ('<path d="M %s %s A %s %s 0 0 0 %s %s" fill="none" stroke="currentColor" '
           'stroke-width="1.3"/>' % (f(N[0]), f(N[1]), f(R), f(R), f(Q[0]), f(Q[1])))
    b = shade + arc + ln(*Q, *O, w=1.3) + ln(*O, *N, w=1.3) + ln(*A, *B, w=1.3)
    b += tx(N[0], N[1] - 7, 'N', 'lbl') + tx(A[0] + 11, A[1] + 4, 'A', 'lbl')
    b += tx(Q[0], Q[1] + 18, 'Q', 'lbl') + tx(B[0], B[1] + 18, 'B', 'lbl')
    b += tx(O[0], O[1] + 18, 'O', 'lbl')
    return svg(b, O[1] + 26, 'A sector ONQ with centre O on the right, Q to the left of O and N '
                             'above and to the left. A is on ON and B is on OQ, joined by a '
                             'straight line AB. The region between AB and the arc NQ is shaded.')


# ================================================================================================
# Q20  --  y = x^2 - 2x + 3 on the paper's grid, as the exact parabola
# ================================================================================================
q20f = lambda x: x * x - 2 * x + 3                            # noqa: E731
assert q20f(-2) == 11 and q20f(4) == 11 and q20f(1) == 2       # the ends the paper draws, and the turn
# (a) x^2 - 3x - 1 = 0 is where the curve meets y = x + 4
_r = [(3 + s * math.sqrt(13)) / 2 for s in (-1, 1)]
for _x in _r:
    assert abs(q20f(_x) - (_x + 4)) < 1e-9
assert [round(v, 1) for v in _r] == [-0.3, 3.3]
# (b) the gradient at P(2, 3) is 2x - 2 = 2
assert q20f(2) == 3 and 2 * 2 - 2 == 2


def q20():
    p, sx, sy, R, B = graph(-4, 6, -1, 11, L=33.0, T=24.0, ux=27.4, uy=27.4,
                            minor=(0.2, 0.2), mid=(1, 1), major=(2, 2))
    p.append(ln(sx(-4), sy(0), R + 10, sy(0), w=1.3) + head((R + 14, sy(0)), (R, sy(0)), 6))
    p.append(ln(sx(0), B, sx(0), sy(11) - 10, w=1.3) + head((sx(0), sy(11) - 14), (sx(0), B), 6))
    for v in (2, 4, 6, 8, 10):
        p.append(tx(sx(0) - 4, sy(v) + 4, str(v), 'num', 'end'))
    for v in (-2, 2, 4):
        p.append(tx(sx(v), sy(0) + 15, str(v).replace('-', '−')))
    p.append(tx(sx(0) - 4, sy(0) + 15, 'O', 'num', 'end', 'font-style:italic'))
    p.append(tx(R + 22, sy(0) + 4, 'x', 'num', 'middle', 'font-style:italic'))
    p.append(tx(sx(0) - 10, sy(11) - 8, 'y', 'num', 'middle', 'font-style:italic'))
    # one quadratic Bezier IS the parabola: ends on the curve, control where the end tangents meet
    x0, x2 = -2.0, 4.0
    x1 = (x0 + x2) / 2
    y1 = q20f(x0) + (2 * x0 - 2) * (x1 - x0)
    assert abs(y1 - (q20f(x2) + (2 * x2 - 2) * (x1 - x2))) < 1e-9
    p.append('<path d="M %s %s Q %s %s %s %s" fill="none" stroke="currentColor" '
             'stroke-width="1.4"/>' % (f(sx(x0)), f(sy(q20f(x0))), f(sx(x1)), f(sy(y1)),
                                       f(sx(x2)), f(sy(q20f(x2)))))
    return svg(''.join(p), B + 8, 'Part of the graph of y = x squared minus 2x plus 3, on a grid '
                                  'with x from minus 4 to 6 and y from minus 1 to 11 in fifths of '
                                  'a unit. The curve is a U shape from (minus 2, 11) down to its '
                                  'lowest point (1, 2) and up to (4, 11), crossing the y-axis at '
                                  '3.')


# ================================================================================================
# Q21  --  three circles in a rectangle, drawn exactly
# ================================================================================================
Q21_R = 24
_w = 4 * Q21_R
_h = 2 * Q21_R + Q21_R * math.sqrt(3)
assert round(_w * _h, -2) == 8600 and round(_w * _h, 1) == 8598.6


def q21():
    r = 40.0
    w, h = 4 * r, 2 * r + r * math.sqrt(3)
    L, T = (W - w) / 2, 8.0
    cs = [(L + r, T + r), (L + 3 * r, T + r), (L + 2 * r, T + r + r * math.sqrt(3))]
    for i in range(3):
        for j in range(i + 1, 3):
            assert abs(math.hypot(cs[i][0] - cs[j][0], cs[i][1] - cs[j][1]) - 2 * r) < 1e-9
    assert abs(cs[2][1] + r - (T + h)) < 1e-9
    b = ('<rect x="%s" y="%s" width="%s" height="%s" fill="none" stroke="currentColor" '
         'stroke-width="1.2"/>' % (f(L), f(T), f(w), f(h)))
    for x, y in cs:
        b += ('<circle cx="%s" cy="%s" r="%s" fill="none" stroke="currentColor" stroke-width="1.2"/>'
              '<circle cx="%s" cy="%s" r="1.6" fill="currentColor"/>' % (f(x), f(y), f(r), f(x), f(y)))
    return svg(b, T + h + 8, 'A rectangle holding three identical circles: two side by side along '
                             'the top and one below, between them. Each circle touches the other '
                             'two, the two top circles touch the top and the sides, and the bottom '
                             'circle touches the bottom. A dot marks the centre of each circle.')


# ================================================================================================
# Q6, Q10  --  the two banks, and the planets
# ================================================================================================
Q6_TABLE = ('<table><thead><tr><th scope="col">Personal Bank</th><th scope="col">Secure Bank</th>'
            '</tr></thead><tbody><tr><td>Compound Interest</td><td>Compound Interest</td></tr>'
            '<tr><td>2% for each year</td><td>4.3% for the first year<br>0.9% for each extra year'
            '</td></tr></tbody></table>')
_personal = 25000 * 1.02 ** 3
_secure = 25000 * 1.043 * 1.009 ** 2
assert round(_personal, 2) == 26530.20 and round(_secure, 2) == 26546.46 and _secure > _personal

Q10_PLANETS = [('Earth', '0', '5.97 × 10^24'), ('Jupiter', '6.29 × 10^8', '1.898 × 10^27'),
               ('Mars', '7.83 × 10^7', '6.42 × 10^23'), ('Mercury', '9.17 × 10^7', '3.302 × 10^23'),
               ('Neptune', '4.35 × 10^9', '1.024 × 10^26'), ('Saturn', '1.28 × 10^9', '5.68 × 10^26'),
               ('Uranus', '2.72 × 10^9', '8.683 × 10^25'), ('Venus', '4.14 × 10^7', '4.869 × 10^24')]


def sf(s):
    """`6.29 × 10^8` as a number, for the assertions, and as the paper sets it, for the table."""
    if ' × 10^' not in s:
        return F(s), s
    m, e = s.split(' × 10^')
    return F(m) * F(10) ** int(e), '%s&nbsp;&times;&nbsp;10<sup>%s</sup>' % (m, e)


_mass = {p: sf(m)[0] for p, _, m in Q10_PLANETS}
_dist = {p: sf(d)[0] for p, d, _ in Q10_PLANETS}
assert max(_mass, key=_mass.get) == 'Jupiter'                                      # (a)
assert _mass['Venus'] - _mass['Mercury'] == F('4.5388') * 10 ** 24                 # (b)
assert 105 < _dist['Neptune'] / _dist['Venus'] < 105.1                             # (c) 105.07
# THE PAPER'S ONE TABLE AS TWO, the planets down the side of each. Three columns of standard form
# are 225px at the narrowest and a card at 320px has 197: a screenshot showed the Mass column cut off
# at "1.898 ×" -- on a question that asks for the planet with the greatest MASS. A table that has to
# be scrolled sideways to see the column the question is about is a trap rather than a table.
Q10_TABLE = (table(['Planet', 'Distance from Earth (km)'],
                   [[p, sf(d)[1]] for p, d, _ in Q10_PLANETS], row_heads=False)
             + table(['Planet', 'Mass (kg)'],
                     [[p, sf(m)[1]] for p, _, m in Q10_PLANETS], row_heads=False))

# ================================================================================================
# THE ARITHMETIC OF EVERY OTHER ANSWER ON THE PAPER, so a number in this file cannot be mistyped
# ================================================================================================
assert round(117 / ((56 / 70) + 75 / 60), 2) == 57.07                       # Q4(a) 117 km / 2.05 h
assert F(4755, 1000) <= F(476, 100) < F(4765, 1000)                         # Q7
_x11 = F(28, 3)                                                             # Q11
assert (3 * _x11 - 2) / 4 - (2 * _x11 + 5) / 3 == (1 - _x11) / 6
assert F(4, 5) + F(29, 20) == F(9, 4) and F(29, 20) == F('1.45')            # Q18: 2^(4/5+x) = 2^(9/4)
for _x in (5, 7, -1):                                                       # Q19: a = 4, b = -42
    assert F(2) - F(_x + 2, _x - 3) - F(_x - 6, _x + 3) == F(4 * _x - 42, _x * _x - 9)
assert [2 * n * n + n + 1 for n in range(1, 6)] == [4, 11, 22, 37, 56]      # Q22
assert F(3, 22) * F(2, 9) == F(1, 33)                                       # Q16
assert abs((1.5 ** 2 + (math.sqrt(7) / 2) ** 2) - 4) < 1e-12               # Q23: P is on L
assert abs(3 * 1.5 + math.sqrt(7) * (math.sqrt(7) / 2) - 8) < 1e-12         #       and on the tangent


# ================================================================================================
# WHAT EACH ROW BECOMES
# ================================================================================================
# A preamble per question whose parts share a picture, plus Q3's (see the docstring for why).
PREAMBLES = {
    '3': dict(first='3', figure='prism', draw=q3_prism, topics=None,
              html='<p>The diagram shows a prism with a cross section in the shape of a '
                   'trapezium.</p>'),
    '5': dict(first='5a', figure='diagram', draw=q5, topics=None,
              html='<p>' + I('ABC') + ' and ' + I('EDC') + ' are straight lines.<br>'
                   + I('EA') + ' is parallel to ' + I('DB') + '.</p><p>'
                   + I('EC') + ' = 8.1&nbsp;cm.<br>' + I('DC') + ' = 5.4&nbsp;cm.<br>'
                   + I('DB') + ' = 2.6&nbsp;cm.</p>'),
    '10': dict(first='10a', figure='', draw=None, topics=None,
               html='<p>The tables show some information about eight planets.</p>' + Q10_TABLE),
    '20': dict(first='20a', figure='graph', draw=q20, topics=None,
               html='<p>The diagram shows part of the graph of '
                    + EQ(I('y') + ' = ' + I('x')
                    + '<sup>2</sup> &minus; 2' + I('x') + ' + 3') + '</p>'),
}

# Every question row this script touches, and what it becomes. Keys left out are left alone.
ROWS = {
    '1': dict(html='<p>The table shows the probabilities that a biased dice will land on 2, on 3, '
                   'on 4, on 5 and on 6</p>' + Q1_TABLE + '<p>Neymar rolls the biased dice 200 '
                   'times.</p><p>Work out an estimate for the total number of times the dice will '
                   'land on 1 or on 3</p>', figure=None),
    '2': dict(html='<p>On Saturday, some adults and some children were in a theatre.<br>The ratio '
                   'of the number of adults to the number of children was 5&nbsp;:&nbsp;2</p>'
                   '<p>Each person had a seat in the Circle or had a seat in the Stalls.</p><p>'
                   '<sup>3</sup>&frasl;<sub>4</sub> of the children had seats in the Stalls.<br>117 '
                   'children had seats in the Circle.</p><p>There are exactly 2600 seats in the '
                   'theatre.</p><p>On this Saturday, were there people on more than 60% of the '
                   'seats?<br>You must show how you get your answer.</p>'),
    '3': dict(html='<p>On the centimetre grid below, draw the front elevation and the side '
                   'elevation of the prism.<br>Use a scale of 2&nbsp;cm to 1&nbsp;m.</p>',
              figure='grid-blank', draw=q3_grid,
              answer='<b>Front elevation</b> (looking along the arrow marked front): the trapezium '
                     'itself, 4&nbsp;cm along the bottom, 4&nbsp;cm up the left-hand side and '
                     '1&nbsp;cm up the right-hand side, with the sloping line joining their tops. '
                     '<b>Side elevation</b> (looking along the arrow marked side): a rectangle '
                     '2&nbsp;cm wide and 4&nbsp;cm tall, with a horizontal line across it 1&nbsp;cm '
                     'above the bottom &mdash; the edge where the 0.5&nbsp;m upright face meets the '
                     'sloping face behind it. At 2&nbsp;cm to the metre every length doubles; the '
                     'depth of the prism is the 1&nbsp;m, and the 2.5&nbsp;m is the slope, which '
                     'does not appear at its true length in either view.'),
    '4a': dict(html='<p>Olly drove 56&nbsp;km from Liverpool to Manchester.<br>He then drove '
                    '61&nbsp;km from Manchester to Sheffield.</p><p>Olly&rsquo;s average speed '
                    'from Liverpool to Manchester was 70&nbsp;km/h.<br>Olly took 75 minutes to '
                    'drive from Manchester to Sheffield.</p><p>Work out Olly&rsquo;s average '
                    'speed for his total drive from Liverpool to Sheffield.</p>',
               accept='57.1 km/h | 57.07 km/h | 57.07 to 57.1'),
    '5a': dict(html='<p>Work out the length of ' + I('AE') + '.</p>', figure=None),
    '5b': dict(html='<p>' + I('AC') + ' = 6.15&nbsp;cm.</p><p>Work out the length of ' + I('AB')
                    + '.</p>', figure=None),
    '6': dict(html='<p>Anil wants to invest &pound;25&nbsp;000 for 3 years in a bank.</p>' + Q6_TABLE
                   + '<p>Which bank will give Anil the most interest at the end of 3 years?<br>You '
                   'must show all your working.</p>'),
    '8': dict(html='<p>The cumulative frequency graph shows some information about the heights, '
                   'in cm, of 60 students.</p><p>Work out an estimate for the number of these '
                   'students with a height greater than 160&nbsp;cm.</p>',
              draw=q8, figure='graph', accept='12 | 11 to 13',
              answer='12 &mdash; go up from 160&nbsp;cm to the curve and across: 48 of the students '
                     'are 160&nbsp;cm or shorter, so 60 &minus; 48 = 12 are taller. The curve '
                     'passes 48 at 160&nbsp;cm on the paper&rsquo;s own drawing; a reading of 47 or '
                     '49 off the grid, giving 13 or 11, is the usual tolerance for a reading off '
                     'a curve.'),
    '9': dict(html='<p>The diagram shows triangle <b>A</b> drawn on a grid.</p><p>Kyle reflects '
                   'triangle <b>A</b> in the ' + I('x') + '-axis to get triangle <b>B</b>.<br>He '
                   'then reflects triangle <b>B</b> in the line ' + EQ(I('y') + ' = ' + I('x'))
                   + ' to get triangle <b>C</b>.</p><p>Amy reflects triangle <b>A</b> in the line '
                   + EQ(I('y') + ' = ' + I('x')) + ' to get triangle <b>D</b>.<br>She is then going to '
                   'reflect triangle <b>D</b> in the ' + I('x') + '-axis to get triangle <b>E</b>.'
                   '</p><p>Amy says that triangle <b>E</b> should be in the same position as '
                   'triangle <b>C</b>.</p><p>Is Amy correct?<br>You must show how you get your '
                   'answer.</p>',
              draw=q9, figure='grid-triangle', answer_type='annotate',
              answer='No. Draw the four triangles. <b>B</b> is (3,&nbsp;&minus;3), (4,&nbsp;&minus;3), '
                     '(4,&nbsp;&minus;1), and reflecting that in ' + I('y') + ' = ' + I('x')
                     + ' swaps each pair, so <b>C</b> is (&minus;3,&nbsp;3), (&minus;3,&nbsp;4), '
                     '(&minus;1,&nbsp;4). <b>D</b> is (3,&nbsp;3), (3,&nbsp;4), (1,&nbsp;4), and '
                     'reflecting that in the ' + I('x') + '-axis gives <b>E</b> at (3,&nbsp;&minus;3), '
                     '(3,&nbsp;&minus;4), (1,&nbsp;&minus;4). <b>C</b> is top left and <b>E</b> is '
                     'bottom right &mdash; a half turn apart &mdash; so the order of the two '
                     'reflections matters. In general Kyle sends (' + I('x') + ', ' + I('y')
                     + ') to (&minus;' + I('y') + ', ' + I('x') + ') and Amy to (' + I('y')
                     + ', &minus;' + I('x') + ').'),
    '10a': dict(html='<p>Write down the name of the planet with the greatest mass.</p>', figure=None),
    '10b': dict(html='<p>Find the difference between the mass of Venus and the mass of Mercury.</p>',
                figure=None,
                accept='4.5388 × 10^24 kg | 4.5388 x 10^24 | 4.5388 x 10^24 kg | 4.5388×10^24 | '
                       '4.5388x10^24 | 4.5388*10^24 | 4538800000000000000000000'),
    '10c': dict(html='<p>Nishat says that Neptune is over a hundred times further away from Earth '
                     'than Venus is.</p><p>Is Nishat right?<br>You must show how you get your '
                     'answer.</p>', figure=None,
                answer='Yes. From the table, Neptune is 4.35 &times; 10<sup>9</sup>&nbsp;km away '
                       'and Venus 4.14 &times; 10<sup>7</sup>&nbsp;km. Dividing, 4.35 &times; '
                       '10<sup>9</sup> &divide; (4.14 &times; 10<sup>7</sup>) = 105.07&hellip;, '
                       'which is over a hundred &mdash; but only just, so the division has to be '
                       'done rather than the powers compared by eye.'),
    '11': dict(html='<p>Solve&nbsp; ' + frac_html('3' + I('x') + ' &minus; 2', '4') + ' &minus; '
                    + frac_html('2' + I('x') + ' + 5', '3') + ' = '
                    + frac_html('1 &minus; ' + I('x'), '6') + '</p>',
               accept='x = 28⁄3 | 28/3 | x = 9 1/3 | 9 1/3 | 9.33 | 9.333 | x = 9.33'),
    '12a': dict(html='<p>There are 30 students in Mr Lear&rsquo;s class.<br>16 of the students are '
                     'boys.</p><p>Two students from the class are chosen at random.</p><p>Mr Lear '
                     'draws this probability tree diagram for this information.</p><p>Write down '
                     '<b>one</b> thing that is wrong with the probabilities in the probability '
                     'tree diagram.</p>',
                draw=q12, figure='tree-diagram',
                answer='The second student&rsquo;s probabilities should be out of 29, not 30. One '
                       'student has already been chosen and is not put back, so only 29 remain '
                       'for the second pick. The same fault shows another way, and either is the '
                       'one thing: each pair of second branches adds to <sup>29</sup>&frasl;<sub>30'
                       '</sub>, when the branches from one point must add to 1.'),
    '12b': dict(html='<p>Owen and Wasim play for the school football team.</p><p>The probability '
                     'that Owen will score a goal in the next match is 0.4<br>The probability that '
                     'Wasim will score a goal in the next match is 0.25</p><p>Mr Slater says,<br>'
                     '&ldquo;The probability that both boys will score a goal in the next match is '
                     '0.4 + 0.25&rdquo;</p><p>Is Mr Slater right?<br>Give a reason for your '
                     'answer.</p>'),
    '13': dict(html='<p>The histogram shows some information about the ages of the 134 members of a '
                    'sports club.</p><p>20% of the members of the sports club who are over 50 '
                    'years of age are female.</p><p>Work out an estimate for the number of female '
                    'members who are over 50 years of age.</p>',
               draw=q13, figure='histogram-grid',
               answer='7 &mdash; frequency is frequency density &times; class width, so read each '
                      'bar&rsquo;s height and multiply: 1.1 &times; 10 = 11, 2.8 &times; 10 = 28, '
                      '2.3 &times; 20 = 46, 1.4 &times; 20 = 28 and 0.7 &times; 30 = 21. Those add to '
                      '134, the membership the question states, so the bars have been read '
                      'correctly. Over 50 is half of the 40&ndash;60 bar (1.4 &times; 10 = 14) plus '
                      'all of the 60&ndash;90 bar (21), which is 35, and 20% of 35 = 7.'),
    '14': dict(html='<p>Here are some graphs.</p><p>In the table below, match each equation with '
                    'the letter of its graph.</p>' + Q14_TABLE,
               draw=q14, figure='nine-graphs'),
    '15': dict(html='<p>' + I('A') + ', ' + I('B') + ', ' + I('C') + ' and ' + I('D') + ' are four '
                    'points on the circumference of a circle.</p><p>' + I('AEC') + ' and '
                    + I('BED') + ' are straight lines.</p><p>Prove that triangle ' + I('ABE')
                    + ' and triangle ' + I('DCE') + ' are similar.<br>You must give reasons for '
                    'each stage of your working.</p>',
               draw=q15, figure='circle'),
    '16': dict(html='<p>Using algebra, prove that 0.13&#775;6&#775; &times; 0.2&#775; is equal in '
                    'value to ' + frac_html('1', '33') + '</p><p>(0.13&#775;6&#775; is '
                    '0.13636&hellip;, with the 36 recurring, and 0.2&#775; is 0.222&hellip;)</p>'),
    '17': dict(html='<p>' + I('ONQ') + ' is a sector of a circle with centre ' + I('O') + ' and '
                    'radius 11&nbsp;cm.</p><p>' + I('A') + ' is the point on ' + I('ON') + ' and '
                    + I('B') + ' is the point on ' + I('OQ') + ' such that ' + I('AOB') + ' is an '
                    'equilateral triangle of side 7&nbsp;cm.</p><p>Calculate the area of the shaded '
                    'region as a percentage of the area of the sector ' + I('ONQ') + '.<br>Give '
                    'your answer correct to 1 decimal place.</p>',
               draw=q17, figure='sector', accept='66.5% | 66.5 %'),
    '18': dict(accept='x = 29⁄20 | 29/20 | x = 1.45 | 1.45'),
    '19': dict(html='<p>2 &minus; ' + frac_html(I('x') + ' + 2', I('x') + ' &minus; 3') + ' &minus; '
                    + frac_html(I('x') + ' &minus; 6', I('x') + ' + 3') + ' can be written as a '
                    'single fraction in the form ' + frac_html(I('ax') + ' + ' + I('b'),
                                                               I('x') + '<sup>2</sup> &minus; 9')
                    + '<br>where ' + I('a') + ' and ' + I('b') + ' are integers.</p><p>Work out '
                    'the value of ' + I('a') + ' and the value of ' + I('b') + '.</p>',
               accept='a = 4 and b = −42 | 4, −42'),
    '20a': dict(html='<p>By drawing a suitable straight line, use your graph to find estimates for '
                     'the solutions of ' + EQ(I('x') + '<sup>2</sup> &minus; 3' + I('x')
                     + ' &minus; 1 = 0') + '</p>', figure=None, answer_type='drawing'),
    '20b': dict(html='<p>' + I('P') + ' is the point on the graph of ' + EQ(I('y') + ' = ' + I('x')
                     + '<sup>2</sup> &minus; 2' + I('x') + ' + 3') + ' where '
                     + EQ(I('x') + ' = 2') + '</p>'
                     '<p>Calculate an estimate for the gradient of the graph at the point '
                     + I('P') + '.</p>', figure=None, answer_type='drawing',
                answer='About 2 &mdash; draw the tangent to the curve at ' + I('P') + '(2,&nbsp;3) '
                       'and find its gradient as rise &divide; run, using two points on it as far '
                       'apart as the grid allows. It is an estimate because it depends on the '
                       'tangent drawn; the exact gradient there is 2 (the gradient of ' + I('x')
                       + '<sup>2</sup> &minus; 2' + I('x') + ' + 3 is 2' + I('x')
                       + ' &minus; 2). A tangent passing through roughly (0,&nbsp;&minus;1) and '
                       '(4,&nbsp;7) is the right line.'),
    '21': dict(html='<p>The diagram shows 3 identical circles inside a rectangle.<br>Each circle '
                    'touches the other two circles and the sides of the rectangle, as shown in the '
                    'diagram.</p><p>The radius of each circle is 24&nbsp;mm.</p><p>Work out the '
                    'area of the rectangle.<br>Give your answer correct to 3 significant figures.'
                    '</p>', draw=q21, figure='diagram',
               accept='8600 mm^2 | 8600 | 8600 mm2 | 8600 mm²'),
    '22': dict(html='<p>Here are the first five terms of a sequence.</p><p>4&emsp;&emsp;11&emsp;'
                    '&emsp;22&emsp;&emsp;37&emsp;&emsp;56</p><p>Find an expression, in terms of '
                    + I('n') + ', for the ' + I('n') + 'th term of this sequence.</p>',
               accept='2n^2 + n + 1 | 2n² + n + 1'),
    '23': dict(html='<p><b>L</b> is the circle with equation ' + EQ(I('x') + '<sup>2</sup> + '
                    + I('y') + '<sup>2</sup> = 4') + '</p><p>' + I('P') + '('
                    + frac_html('3', '2') + ', ' + frac_html('&radic;7', '2')
                    + ') is a point on <b>L</b>.</p><p>Find an equation of the tangent to <b>L</b> '
                    'at the point ' + I('P') + '.</p>',
               accept=''),
}
assert '20b' in ROWS and abs(2 * 2 - 2 - (7 - (-1)) / (4 - 0)) < 1e-12   # the tangent quoted

# ================================================================================================
# NOTHING MAY BE PAINTED OUTSIDE THE BOX `check/cards.js` MEASURES
# ================================================================================================
DRAWN = {}
for name, fn in [('q3_prism', q3_prism), ('q3_grid', q3_grid), ('q5', q5), ('q8', q8), ('q9', q9),
                 ('q12', q12), ('q13', q13), ('q14', q14), ('q15', q15), ('q17', q17),
                 ('q20', q20), ('q21', q21)]:
    s = fn()
    DRAWN[fn] = s
    m = re.match(r'<svg viewBox="0 0 (\d+) ([\d.]+)"', s)
    assert m and int(m.group(1)) == W, '%s: viewBox width must be %d' % (name, W)
    h = float(m.group(2))
    pairs = [(float(a), float(b)) for a, b in re.findall(
        r'(?:cx|x1|x2|x)="(-?[\d.]+)"[^>]*?(?:cy|y1|y2|y)="(-?[\d.]+)"', s)]
    assert pairs, '%s: no coordinates found, so this guard would pass on anything' % name
    for x, y in pairs:
        assert -1 <= x <= W + 1 and -1 <= y <= h + 1, '%s: (%s, %s) outside 0..%d x 0..%s' % (
            name, x, y, W, h)
    for pts in re.findall(r'points="([^"]+)"', s):
        for pair in pts.split():
            x, y = [float(v) for v in pair.split(',')]
            assert 0 <= x <= W and 0 <= y <= h, '%s: polygon point (%s, %s) outside' % (name, x, y)
    assert 'text-anchor="' not in s, '%s: use inline style, not the attribute -- CSS beats it' % name
    assert '<marker' not in s and ' id="' not in s, '%s: no ids in a drawing' % name

# ================================================================================================
# WRITE
# ================================================================================================
lines = open(FILE, encoding='utf-8').read().split('\n')
seen, made, wrote = set(), [], []
by_first = {p['first']: (q, p) for q, p in PREAMBLES.items()}
out = []
for raw in lines:
    bare = raw.rstrip()
    trailing = bare.endswith(',')
    body = bare[:-1] if trailing else bare
    try:
        row = json.loads(body)
    except ValueError:
        out.append(raw)
        continue
    if not isinstance(row, dict) or row.get('paper_id') != PAPER:
        out.append(raw)
        continue
    rid = row.get('row_id', '')
    if rid in [PID(q) for q in PREAMBLES]:
        raise SystemExit('%s already exists -- this script has already run against this file' % rid)
    dump = lambda r, comma=True: json.dumps(r, ensure_ascii=False, separators=(',', ':')) + (',' if comma else '')  # noqa: E731
    row['exam_date'] = EXAM_DATE
    short = rid.replace('Q-1MA1-1706-2H-', '') if rid.startswith('Q-1MA1-1706-2H-') else ''

    if row.get('kind') == 'question' and short in by_first:
        q, p = by_first[short]
        t = dict(row)
        for k in ('part', 'marks', 'answer', 'answer_type', 'accept', 'figure', 'examiner_note',
                  'lead', 'html', 'diagram', 'diagram_by'):
            t.pop(k, None)
        t.update(row_id=PID(q), kind='preamble', question=q, part='', marks='', html=p['html'])
        if p['draw']:
            t['figure'] = p['figure']
            t['diagram'] = DRAWN[p['draw']]
            t['diagram_by'] = 'family'
        out.append(dump(t))
        made.append(t['row_id'])

    if row.get('kind') == 'question' and short in ROWS:
        d = ROWS[short]
        for k in ('html', 'answer', 'answer_type', 'accept'):
            if k in d:
                if d[k] == '' and k == 'accept':
                    row.pop('accept', None)
                else:
                    row[k] = d[k]
        if 'figure' in d:
            if d['figure'] is None:
                row.pop('figure', None)
            else:
                row['figure'] = d['figure']
        if d.get('draw'):
            row['diagram'] = DRAWN[d['draw']]
            row['diagram_by'] = 'family'
        seen.add(short)
        wrote.append(short)
    out.append(dump(row, trailing))

missing = sorted(set(ROWS) - seen)
assert not missing, 'rows not found: %s' % missing
assert sorted(made) == sorted(PID(q) for q in PREAMBLES), made

# the paper still sums to its own cover
_marks = 0
for raw in out:
    b = raw.rstrip().rstrip(',')
    if b.startswith('{') and '"paper_id":"%s"' % PAPER in b:
        r = json.loads(b)
        if r.get('kind') == 'question':
            _marks += int(r.get('marks') or 0)
assert _marks == 80, _marks

open(FILE, 'w', encoding='utf-8').write('\n'.join(out))
print('preambles written: %s' % ', '.join(made))
print('question rows rewritten: %s' % ', '.join(wrote))
print('drawings: %d, each %d wide' % (len(DRAWN), W))
print('  Q8 curve reads %.2f at 160 cm -> 12 taller; Q13 bars sum to 134; Q17 is %.1f%%'
      % (Q8_AT_160, 100 * (_sector - _tri) / _sector))
print('  Q9: C at %s, E at %s -- not the same' % (sorted(Q9_C), sorted(Q9_E)))
print('exam_date %s on every row of %s; marks still sum to %d' % (EXAM_DATE, PAPER, _marks))
