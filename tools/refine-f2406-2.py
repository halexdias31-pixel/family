"""
EDEXCEL 1MA1 JUNE 2024 FOUNDATION PAPER 2 (CALCULATOR), CHECKED QUESTION BY QUESTION AGAINST THE
PRINTED PAPER AND ITS MARK SCHEME, BOTH READ OUT OF DRIVE.

  Question paper  'Question paper - Paper 2F - June 2024.pdf'  (P76924A)
  Mark scheme     'Mark scheme - Paper 2F - June 2024.pdf'

Asked for as "the papers i do typically something is always wrong like your diagrams or something.
i just want it to be good." Measured first: 42 rows, 80 marks, every answer present -- and SIXTEEN
rows naming a figure with no drawing anywhere, plus one row whose figure was described WRONGLY.

WHAT WAS WRONG ABOUT THE PAPER, not merely missing from it:

  Q20  the lead said AB = 19 cm and AC = 10 cm. The paper prints 19 cm on CA, the side opposite
       the right angle at B, and 10 cm on AB -- the scheme's own working is 19^2 = 10^2 + BC^2. The
       number came out right (16.2) because the arithmetic happens not to care which letters the
       two lengths carry, but the answer's explanation told a student "AB = 19 is the hypotenuse",
       which is the wrong side of the picture they are now looking at.

THE DRAWINGS ARE TAKEN FROM THE PDF'S OWN VECTORS (page.get_drawings), not from the prose. Every
figure on this paper is vector line-work, so the coordinates below are the paper's own, scaled:

  Q6   pictogram   squares 25.3pt; January = 2 + a half-WIDTH bar; February = 2 + a QUARTER (half
                   width, half height); March = 3. The answers 10, 9 and 12 are asserted from that.
  Q7a  the line is 246.6pt = 8.70 cm. A screen has no centimetres, so a centimetre ruler is drawn
       under it at the drawing's own scale; the line is 8.7 of its centimetres.
  Q7b  arms at 51.8 and -15.2 degrees from the vertex: 67.0 degrees, asserted. An angle survives
       any uniform scale, so a protractor held to the screen still reads 67.
  Q8   the coordinate grid, A at (2, 1) and B at (-2, -5).
  Q11  the spinner: radii at 0, 90 and 225 degrees, so sector 2 is 90 and sectors 1 and 3 are 135.
  Q16  the conversion line ends at (9.97 oz, 282.7 g): 28.35 g per ounce, the real conversion.
       6 oz -> 170 g and 1000 g -> 35.3 oz are asserted inside the scheme's bands.
  Q17  triangle ABC: CB 9.65 cm, CA 5.66 cm, AB 8.68 cm as printed. A 0-4 cm bar is drawn at the
       triangle's own scale, because the question is about 4 cm and a phone has no centimetres.
  Q20  the right-angled triangle, at the paper's own proportions.
  Q24b the grid, x from -2.5 to 3.5 and y from -4 to 8, majors every 0.5 across and every 1 up
       exactly as printed.
  Q26  the quadrilateral and its four marked angles, not to scale (the paper's are not either:
       its angle at A is 52 degrees where 2x + 15 = 65).
  Q27  the two isosceles triangles.

AND THREE ARE TABLES, which this repository's rule says are not pictures: Q24(a)'s table of values
and Q28's grouped frequencies were prose summaries ("Given y values: 6 at x = -2 ..."), and are
<table> markup now.

PREAMBLES. Q6, Q8, Q16 and Q28 each have parts that hang from one shared picture or table, and only
part (a) carried the stem -- so part (c) of Q6 was a card with no pictogram and (b) of Q28 was a
card with no table. A question-scoped preamble draws it on every part.

ACCEPT. The marker sorts a comma list before it compares (markParts_), so a list whose ORDER is the
answer cannot be marked by it: Q1's ordered list and Q24(a)'s three table values would mark ANY
permutation right, and the coordinates in Q8 would mark (1, 2) right if written without brackets.
Those four lose their `accept` and a person marks them. Q24(c)'s two readings each carry a +-0.1
tolerance the marker cannot express for a pair, so it goes the same way. The measured answers gain
the scheme's own bands (8.5 to 8.9, 65 to 69, 167 to 173, 34 to 36, 16.1 to 16.2, 151 to 152) and
three rows gain the alternatives the scheme prints (6dc; 2 x 3^2 x 5; 2^2 x 3^2; 0.517...).

RUN ONCE. A second run against its own output would insert the four preambles again, so it refuses.
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
PAPER = 'RS1786302107764-417'
PFX = 'Q-1MA1-2406-2F-'
PT_PER_CM = 72 / 2.54


def svg(body, h, label):
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>' % (W, h, label, body))


def line(x1, y1, x2, y2, cls='', w=1.4, extra=''):
    attr = ('class="%s"' % cls) if cls else 'stroke="currentColor" stroke-width="%s"' % w
    return '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" %s%s/>' % (x1, y1, x2, y2, attr, extra)


def txt(x, y, s, cls='num', anchor='middle'):
    """Inline style, never `text-anchor=` -- `.qsheet .num` beats the attribute."""
    return ('<text x="%.1f" y="%.1f" class="%s" style="text-anchor:%s">%s</text>'
            % (x, y, cls, anchor, s))


def L(s):
    return '<tspan class="lbl">%s</tspan>' % s


def poly(pts, fill='none', w=1.4):
    return ('<polygon points="%s" fill="%s" stroke="currentColor" stroke-width="%s"/>'
            % (' '.join('%.1f,%.1f' % p for p in pts), fill, w))


def rect(x, y, w, h, sw=1.3, fill='none'):
    return ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="%s" stroke="currentColor" '
            'stroke-width="%s"/>' % (x, y, w, h, fill, sw))


def arc(c, p1, p2, r, w=1.1):
    """The small arc at vertex c between the rays to p1 and p2, drawn INSIDE the angle. With y
       pointing down, sweep-flag 1 is the direction of increasing screen angle, which is the short
       way round exactly when the cross product of the two rays is positive."""
    def at(p):
        dx, dy = p[0] - c[0], p[1] - c[1]
        n = math.hypot(dx, dy)
        return c[0] + dx / n * r, c[1] + dy / n * r
    a, b = at(p1), at(p2)
    cross = (p1[0] - c[0]) * (p2[1] - c[1]) - (p1[1] - c[1]) * (p2[0] - c[0])
    return ('<path d="M %.1f %.1f A %.1f %.1f 0 0 %d %.1f %.1f" fill="none" stroke="currentColor" '
            'stroke-width="%s"/>' % (a[0], a[1], r, r, 1 if cross > 0 else 0, b[0], b[1], w))


def ang(c, p):
    return math.degrees(math.atan2(-(p[1] - c[1]), p[0] - c[0]))


# ================================================================================================
# Q6  --  the pictogram, off the PDF's own rectangles (page 3)
# ================================================================================================
Q6_SQ = 25.3                                         # one key symbol, in points
Q6_ROWS = {                                          # (x0, x1, y0, y1) of each symbol, in points
    'January': [(152.2, 177.5, 132.9, 158.2), (190.5, 215.8, 132.9, 158.2),
                (228.8, 241.5, 132.9, 158.2)],
    'February': [(152.2, 177.5, 172.6, 197.9), (190.5, 215.8, 172.6, 197.9),
                 (228.8, 241.5, 172.6, 185.3)],
    'March': [(152.2, 177.5, 212.3, 237.6), (190.5, 215.8, 212.3, 237.6),
              (228.8, 254.1, 212.3, 237.6)],
    'April': [], 'May': [],
}


def q6_count(name):
    return sum((x1 - x0) * (y1 - y0) for x0, x1, y0, y1 in Q6_ROWS[name]) / Q6_SQ ** 2 * 4


assert round(q6_count('January')) == 10, q6_count('January')      # (a), the scheme's 10
assert round(q6_count('February')) == 9, q6_count('February')     # the scheme's 4 + 4 + 1
assert round(q6_count('March')) == 12, q6_count('March')          # the scheme's 4 + 4 + 4
assert 60 - (10 + 9 + 12 + 11) == 18                              # (c)


def q6():
    k = 1.1
    X = lambda x: 10 + (x - 66.8) * k       # noqa: E731
    Y = lambda y: 8 + (y - 125.7) * k       # noqa: E731
    rows = ['January', 'February', 'March', 'April', 'May']
    top, rh = Y(125.7), 39.7 * k
    body = rect(X(66.8), top, X(330.5) - X(66.8), rh * 5, 1.1)
    body += line(X(146.2), top, X(146.2), top + rh * 5, w=1.1)
    for i, name in enumerate(rows):
        if i:
            body += line(X(66.8), top + i * rh, X(330.5), top + i * rh, w=1.1)
        body += txt(X(66.8) + 8, top + i * rh + rh / 2 + 4, name, 'num', 'start')
        for x0, x1, y0, y1 in Q6_ROWS[name]:
            body += rect(X(x0), Y(y0), (x1 - x0) * k, (y1 - y0) * k, 1.1)
    ky = top + rh * 5 + 14
    kx = 120.0
    body += rect(kx, ky, 206, 40, 1.1)
    body += txt(kx + 10, ky + 25, 'Key:', 'num', 'start')
    body += rect(kx + 48, ky + 7, Q6_SQ * k, Q6_SQ * k, 1.1)
    body += txt(kx + 86, ky + 25, 'represents 4 houses', 'num', 'start')
    return svg(body, ky + 52, 'A pictogram with rows for January, February, March, April and May. '
               'January has two whole squares and a half-width square, February two whole squares '
               'and a quarter square, March three whole squares; April and May are empty. Key: one '
               'square represents 4 houses.')


# ================================================================================================
# Q7(a)  --  the line, 246.6pt on the paper = 8.70 cm, with a centimetre ruler under it
# ================================================================================================
Q7A_CM = (420.9 - 174.3) / PT_PER_CM
assert abs(Q7A_CM - 8.7) < 0.01, Q7A_CM
assert 8.5 <= round(Q7A_CM, 1) <= 8.9


def q7a():
    u, x0 = 33.0, 18.0                                       # units per centimetre
    body = line(x0, 30, x0 + round(Q7A_CM, 1) * u, 30, w=2)
    ry = 52.0
    body += rect(x0 - 6, ry, 9.4 * u + 12, 34, 1)
    for mm in range(0, 93):
        x = x0 + mm * u / 10.0
        h = 12 if mm % 10 == 0 else (8 if mm % 5 == 0 else 5)
        body += line(x, ry, x, ry + h, w=0.8)
        if mm % 10 == 0:
            body += txt(x, ry + 26, str(mm // 10))
    body += txt(x0 + 4.7 * u, ry + 50, 'centimetres', 'cap')
    return svg(body, ry + 60, 'A straight line, with a centimetre ruler drawn underneath it at the '
               'same scale, its zero lined up with the left-hand end of the line.')


# ================================================================================================
# Q7(b)  --  the angle, off page 4: arms from (215.9, 316.2) to (321.2, 449.8) and (379.9, 271.5)
# ================================================================================================
Q7B_V, Q7B_P1, Q7B_P2 = (215.9, 316.2), (321.2, 449.8), (379.9, 271.5)
Q7B_X = abs(ang(Q7B_V, Q7B_P1) - ang(Q7B_V, Q7B_P2))
assert abs(Q7B_X - 67) < 0.5, Q7B_X                          # the scheme's 67, range 65 to 69


def q7b():
    k = 1.2
    T = lambda p: (80 + (p[0] - Q7B_V[0]) * k, 66 + (p[1] - Q7B_V[1]) * k)   # noqa: E731
    v, a, b = T(Q7B_V), T(Q7B_P1), T(Q7B_P2)
    body = line(v[0], v[1], a[0], a[1], w=1.2) + line(v[0], v[1], b[0], b[1], w=1.2)
    body += arc(v, a, b, 34.8 * k)
    body += txt(v[0] + 23.6, v[1] + 12, L('x'))
    return svg(body, a[1] + 10, 'Two straight lines meeting at a point, making an acute angle '
               'marked x.')


# ================================================================================================
# Q8  --  the coordinate grid with A and B
# ================================================================================================
Q8_A, Q8_B = (2, 1), (-2, -5)
assert ((Q8_A[0] + Q8_B[0]) / 2, (Q8_A[1] + Q8_B[1]) / 2) == (0, -2)    # (b)


def coord_grid(lo_x, hi_x, lo_y, hi_y, step, left, top=14.0):
    cols, rows = hi_x - lo_x, hi_y - lo_y
    to = lambda x, y: (left + (x - lo_x) * step, top + (hi_y - y) * step)   # noqa: E731
    p = []
    for i in range(cols + 1):
        p.append(line(left + i * step, top, left + i * step, top + rows * step, 'grid'))
    for i in range(rows + 1):
        p.append(line(left, top + i * step, left + cols * step, top + i * step, 'grid'))
    zx, zy = to(0, 0)
    p.append(line(left, zy, left + cols * step, zy, 'axis'))
    p.append(line(zx, top, zx, top + rows * step, 'axis'))
    for x in range(lo_x, hi_x + 1):
        if x:
            p.append(txt(to(x, 0)[0], zy + 14, str(x).replace('-', '&minus;')))
    for y in range(lo_y, hi_y + 1):
        if y:
            p.append(txt(zx - 5, to(0, y)[1] + 4, str(y).replace('-', '&minus;'), 'num', 'end'))
    p.append(txt(zx - 7, zy + 14, L('O')))
    p.append(txt(left + cols * step + 10, zy + 4, L('x')))
    p.append(txt(zx + 10, top + 4, L('y')))
    return ''.join(p), to, top + rows * step


def cross(c, s=4.5):
    return (line(c[0] - s, c[1] - s, c[0] + s, c[1] + s, w=1.5)
            + line(c[0] - s, c[1] + s, c[0] + s, c[1] - s, w=1.5))


def q8():
    body, to, bot = coord_grid(-6, 6, -6, 6, 22.0, 34.0)
    a, b = to(*Q8_A), to(*Q8_B)
    body += cross(a) + txt(a[0] + 11, a[1] - 7, L('A'))
    body += cross(b) + txt(b[0] - 11, b[1] + 15, L('B'))
    return svg(body, bot + 12, 'A coordinate grid with x and y from minus 6 to 6. Point A is marked '
               'with a cross at (2, 1) and point B with a cross at (minus 2, minus 5).')


# ================================================================================================
# Q11  --  the spinner, off page 7
# ================================================================================================
Q11_C, Q11_R = (297.6, 326.7), 58.6
Q11_RADII = [(356.2, 326.7), (297.6, 268.1), (256.0, 367.9)]
_deg = sorted(ang(Q11_C, p) % 360 for p in Q11_RADII)
assert [round(d) for d in _deg] == [0, 90, 225], _deg
assert round(_deg[1] - _deg[0]) == 90                        # sector 2, the quarter


def q11():
    k = 1.6
    c = (170.0, 104.0)
    T = lambda p: (c[0] + (p[0] - Q11_C[0]) * k, c[1] + (p[1] - Q11_C[1]) * k)  # noqa: E731
    r = Q11_R * k
    body = ('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="currentColor" '
            'stroke-width="1.3"/>' % (c[0], c[1], r))
    for p in Q11_RADII:
        q = T(p)
        body += line(c[0], c[1], q[0], q[1], w=1.2)
    s = 8.4 * k                                               # the right-angle mark in sector 2
    body += ('<polyline points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" stroke="currentColor" '
             'stroke-width="1"/>' % (c[0], c[1] - s, c[0] + s, c[1] - s, c[0] + s, c[1]))
    t0, t1 = T((272.7, 293.7)), T((319.9, 356.2))             # the arrow
    body += line(t0[0], t0[1], t1[0], t1[1], w=1.4)
    dx, dy = t1[0] - t0[0], t1[1] - t0[1]
    n = math.hypot(dx, dy)
    ux, uy = dx / n, dy / n
    tip = (t1[0] + ux * 6, t1[1] + uy * 6)
    body += ('<path d="M %.1f %.1f L %.1f %.1f L %.1f %.1f z" fill="currentColor"/>'
             % (tip[0], tip[1], tip[0] - ux * 11 - uy * 5, tip[1] - uy * 11 + ux * 5,
                tip[0] - ux * 11 + uy * 5, tip[1] - uy * 11 - ux * 5))
    for s_, p in (('2', (322.0, 303.0)), ('1', (265.1, 317.5)), ('3', (307.6, 355.0))):
        q = T(p)
        body += txt(q[0], q[1] + 5, s_)
    return svg(body, c[1] + r + 10, 'A circular spinner with an arrow at its centre, split into '
               'three sections by three radii. Section 2 is a right angle, a quarter of the '
               'circle; sections 1 and 3 are the two larger pieces.')


# ================================================================================================
# Q16  --  the conversion graph, off page 11: the line from (0, 0) to (9.97 oz, 282.7 g)
# ================================================================================================
Q16_G_PER_OZ = 282.7 / 9.97
assert abs(Q16_G_PER_OZ - 28.35) < 0.05, Q16_G_PER_OZ          # the real ounce
assert 167 <= 6 * Q16_G_PER_OZ <= 173                          # (a), the scheme's band
assert 34 <= 1000 / Q16_G_PER_OZ <= 36                         # (b), the scheme's band


def q16():
    Lx, R, T, B = 56.0, 326.0, 14.0, 304.0
    sx = lambda v: Lx + (R - Lx) * v / 10.0                    # noqa: E731
    sy = lambda v: B - (B - T) * v / 300.0                     # noqa: E731
    p = []
    for i in range(0, 101):                                    # 0.1 oz
        if i % 5:
            p.append(line(sx(i / 10.0), T, sx(i / 10.0), B, 'grid'))
    for i in range(0, 61):                                     # 5 g
        if i % 5:
            p.append(line(Lx, sy(i * 5), R, sy(i * 5), 'grid'))
    maj = 'stroke="currentColor" stroke-width=".7" opacity=".55"'
    for i in range(0, 21):                                     # majors every 0.5 oz
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" %s/>' % (sx(i / 2.0), T,
                                                                        sx(i / 2.0), B, maj))
    for i in range(0, 13):                                     # and every 25 g
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" %s/>' % (Lx, sy(i * 25), R,
                                                                        sy(i * 25), maj))
    p.append(line(Lx, B, R, B, 'axis') + line(Lx, T, Lx, B, 'axis'))
    for v in range(0, 11, 2):
        p.append(txt(sx(v), B + 15, str(v)))
    for v in range(0, 301, 50):
        p.append(txt(Lx - 5, sy(v) + 4, str(v), 'num', 'end'))
    p.append(line(sx(0), sy(0), sx(9.97), sy(282.7), w=1.5))
    p.append(txt((Lx + R) / 2, B + 34, 'ounces', 'cap'))
    p.append('<text x="12" y="%.1f" class="cap" style="text-anchor:middle" '
             'transform="rotate(-90 12 %.1f)">grams</text>' % ((T + B) / 2, (T + B) / 2))
    return svg(''.join(p), B + 44, 'A conversion graph with ounces from 0 to 10 across and grams '
               'from 0 to 300 up. A straight line runs from the origin to about 283 grams at '
               '10 ounces.')


# ================================================================================================
# Q17  --  triangle ABC, off page 12, at a known scale so 4 cm means something on a screen
# ================================================================================================
Q17 = {'C': (161.6, 243.8), 'A': (234.8, 101.0), 'B': (435.1, 243.8)}


def _cm(a, b):
    return math.hypot(Q17[a][0] - Q17[b][0], Q17[a][1] - Q17[b][1]) / PT_PER_CM


assert abs(_cm('C', 'B') - 9.65) < 0.02 and abs(_cm('C', 'A') - 5.66) < 0.02
assert abs(_cm('A', 'B') - 8.68) < 0.02


def q17():
    s = 30.0 / PT_PER_CM                     # 30 units a centimetre
    T = lambda n: (24 + (Q17[n][0] - Q17['C'][0]) * s, 22 + (Q17[n][1] - Q17['A'][1]) * s)  # noqa
    a, b, c = T('A'), T('B'), T('C')
    body = poly([a, b, c], w=1.3)
    body += txt(a[0], a[1] - 7, L('A')) + txt(c[0] - 4, c[1] + 16, L('C'))
    body += txt(b[0] + 4, b[1] + 16, L('B'))
    y = c[1] + 40
    body += line(24, y, 24 + 4 * 30, y, w=1.2)
    for i in range(5):
        body += line(24 + i * 30, y - 5, 24 + i * 30, y + 5, w=1)
    body += txt(24 + 2 * 30, y + 19, '4 cm, to the same scale', 'cap')
    return svg(body, y + 28, 'Triangle ABC, with C bottom left, B bottom right and A above, nearer '
               'C than B. Beneath it a bar 4 centimetres long at the same scale as the triangle.')


# ================================================================================================
# Q20  --  the right-angled triangle, off page 14: right angle at B, 19 cm on CA, 10 cm on AB
# ================================================================================================
Q20_P = {'C': (213.1, 175.6), 'B': (361.3, 175.6), 'A': (361.3, 100.1)}
assert Q20_P['A'][0] == Q20_P['B'][0] and Q20_P['C'][1] == Q20_P['B'][1]   # the right angle is B
assert abs(math.sqrt(19 ** 2 - 10 ** 2) - 16.155) < 0.001                  # the answer, 16.2


def q20():
    k = 1.55
    T = lambda n: (44 + (Q20_P[n][0] - Q20_P['C'][0]) * k,                 # noqa: E731
                   20 + (Q20_P[n][1] - Q20_P['A'][1]) * k)
    a, b, c = T('A'), T('B'), T('C')
    body = poly([a, b, c], w=1.3)
    q = 9.0
    body += ('<polyline points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" stroke="currentColor" '
             'stroke-width="1"/>' % (b[0] - q, b[1], b[0] - q, b[1] - q, b[0], b[1] - q))
    body += txt(a[0] + 6, a[1] - 4, L('A')) + txt(b[0] + 9, b[1] + 13, L('B'))
    body += txt(c[0] - 9, c[1] + 5, L('C'))
    body += txt((a[0] + c[0]) / 2 - 14, (a[1] + c[1]) / 2 - 8, '19 cm')
    body += txt(a[0] + 8, (a[1] + b[1]) / 2 + 4, '10 cm', 'num', 'start')
    return svg(body, b[1] + 22, 'A right-angled triangle ABC with the right angle at B. The side '
               'CA, opposite the right angle, is 19 cm and the side AB is 10 cm.')


# ================================================================================================
# Q24  --  the table of values, and the grid, off page 18
# ================================================================================================
Q24_X = [-2, -1, 0, 1, 2, 3]
Q24_GIVEN = {-2: 6, 0: 0, 2: 2}
for _x, _y in Q24_GIVEN.items():
    assert _x * _x - _x == _y
assert [x * x - x for x in (-1, 1, 3)] == [2, 0, 6]                      # (a)
_r = [(1 - math.sqrt(17)) / 2, (1 + math.sqrt(17)) / 2]
assert -1.7 <= _r[0] <= -1.5 and 2.5 <= _r[1] <= 2.7                    # (c), the scheme's bands


def mn(v):
    return str(v).replace('-', '&minus;')


Q24_TABLE = ('<table><tbody><tr><th scope="row"><i>x</i></th>%s</tr>'
             '<tr><th scope="row"><i>y</i></th>%s</tr></tbody></table>'
             % (''.join('<td>%s</td>' % mn(x) for x in Q24_X),
                ''.join('<td>%s</td>' % (mn(Q24_GIVEN[x]) if x in Q24_GIVEN else '&nbsp;')
                        for x in Q24_X)))


def q24():
    Lx, T = 34.0, 14.0
    ux, uy = 45.0, 22.5                      # one unit across, one unit up
    sx = lambda v: Lx + (v + 2.5) * ux       # noqa: E731
    sy = lambda v: T + (8 - v) * uy          # noqa: E731
    R, B = sx(3.5), sy(-4)
    p = []
    for i in range(0, 61):                   # minors: 0.1 across, 0.2 up
        p.append(line(sx(-2.5 + i / 10.0), T, sx(-2.5 + i / 10.0), B, 'grid'))
    for i in range(0, 61):
        p.append(line(Lx, sy(-4 + i / 5.0), R, sy(-4 + i / 5.0), 'grid'))
    maj = 'stroke="currentColor" stroke-width=".7" opacity=".55"'
    for i in range(0, 13):                   # majors: every 0.5 across, every 1 up
        x = sx(-2.5 + i / 2.0)
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" %s/>' % (x, T, x, B, maj))
    for v in range(-4, 9):
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" %s/>' % (Lx, sy(v), R, sy(v), maj))
    p.append(line(Lx, sy(0), R, sy(0), 'axis') + line(sx(0), T, sx(0), B, 'axis'))
    for v in (-2, -1, 1, 2, 3):
        p.append(txt(sx(v), sy(0) + 14, mn(v)))
    for v in range(-4, 9):
        if v:
            p.append(txt(sx(0) - 4, sy(v) + 4, mn(v), 'num', 'end'))
    p.append(txt(sx(0) - 8, sy(0) + 14, L('O')))
    p.append(txt(R - 6, sy(0) - 6, L('x')) + txt(sx(0) + 10, T + 10, L('y')))
    return svg(''.join(p), B + 10, 'A blank coordinate grid of graph paper, x from minus 2 to 3 '
               'and y from minus 4 to 8, ready for the curve to be drawn.')


# ================================================================================================
# Q26  --  the quadrilateral, off page 20 (a quad and four arcs)
# ================================================================================================
Q26_P = {'A': (166.0, 199.5), 'B': (244.1, 98.7), 'C': (403.2, 98.7), 'D': (429.8, 199.5)}
Q26_ARC = {'A': 56.9, 'B': 41.4, 'C': 42.0, 'D': 46.6}         # the paper's own arc radii
Q26_LAB = {'A': ('2<tspan font-style="italic">x</tspan> + 15', (200.1, 187.5)),
           'B': ('4<tspan font-style="italic">x</tspan> + 15', (252.1, 121.6)),
           'C': ('4<tspan font-style="italic">x</tspan> + 8', (387.6, 121.6)),
           'D': ('3<tspan font-style="italic">x</tspan> &minus; 3', (407.0, 187.5))}
_x = (360 - 15 - 15 - 8 + 3) / 13.0
assert _x == 25 and (2 * _x + 15) + (4 * _x + 15) == 180                  # the answer's x = 25


def q26():
    k = 1.12
    T = lambda p: (16 + (p[0] - 166.0) * k, 20 + (p[1] - 98.7) * k)        # noqa: E731
    P = {n: T(p) for n, p in Q26_P.items()}
    body = poly([P['A'], P['B'], P['C'], P['D']], w=1.3)
    nb = {'A': ('B', 'D'), 'B': ('A', 'C'), 'C': ('B', 'D'), 'D': ('C', 'A')}
    for n, (u, v) in nb.items():
        body += arc(P[n], P[u], P[v], Q26_ARC[n] * k)
        s, at = Q26_LAB[n]
        q = T(at)
        body += txt(q[0], q[1], s)
    body += txt(P['A'][0] - 2, P['A'][1] + 15, L('A')) + txt(P['B'][0] - 4, P['B'][1] - 6, L('B'))
    body += txt(P['C'][0] + 6, P['C'][1] - 6, L('C')) + txt(P['D'][0] + 4, P['D'][1] + 15, L('D'))
    return svg(body, P['D'][1] + 24, 'Quadrilateral ABCD with BC across the top and AD across the '
               'bottom. The angle at A is marked 2x + 15, at B 4x + 15, at C 4x + 8 and at D '
               '3x minus 3, all in degrees.')


# ================================================================================================
# Q27  --  two similar isosceles triangles, off page 21
# ================================================================================================
Q27_P = {'B': (184.2, 224.2), 'C': (279.3, 224.2), 'A': (231.8, 101.0),
         'E': (362.3, 222.4), 'F': (414.6, 222.4), 'D': (388.5, 154.6)}
assert 8 * (1.5 / 6) == 2                                                  # the answer


def q27():
    k = 1.3
    T = lambda n: (20 + (Q27_P[n][0] - 184.2) * k, 22 + (Q27_P[n][1] - 101.0) * k)  # noqa: E731
    P = {n: T(n) for n in Q27_P}
    body = poly([P['A'], P['B'], P['C']], w=1.3) + poly([P['D'], P['E'], P['F']], w=1.3)
    body += txt(P['A'][0], P['A'][1] - 7, L('A')) + txt(P['B'][0] - 10, P['B'][1] + 4, L('B'))
    body += txt(P['C'][0] + 10, P['C'][1] + 4, L('C')) + txt(P['D'][0], P['D'][1] - 7, L('D'))
    body += txt(P['E'][0] - 10, P['E'][1] + 4, L('E')) + txt(P['F'][0] + 10, P['F'][1] + 4, L('F'))
    mAB = ((P['A'][0] + P['B'][0]) / 2, (P['A'][1] + P['B'][1]) / 2)
    mAC = ((P['A'][0] + P['C'][0]) / 2, (P['A'][1] + P['C'][1]) / 2)
    body += txt(mAB[0] - 8, mAB[1], '8 cm', 'num', 'end') + txt(mAC[0] + 8, mAC[1], '8 cm', 'num',
                                                                'start')
    body += txt((P['B'][0] + P['C'][0]) / 2, P['B'][1] + 18, '6 cm')
    body += txt((P['E'][0] + P['F'][0]) / 2, P['E'][1] + 18, '1.5 cm')
    return svg(body, P['B'][1] + 28, 'Two isosceles triangles side by side. ABC has AB and AC both '
               '8 cm and base BC 6 cm. The smaller DEF has base EF 1.5 cm, and DE and DF are '
               'not marked.')


# ================================================================================================
# Q28  --  the grouped frequency table
# ================================================================================================
Q28 = [(50, 100, 34), (100, 150, 29), (150, 200, 27), (200, 250, 19), (250, 300, 11)]
assert sum(f for _, _, f in Q28) == 120
_fx = sum((a + b) / 2 * f for a, b, f in Q28)
assert _fx == 18200 and 151 <= _fx / 120 <= 152                          # (b)
assert 34 < 60 <= 34 + 29                                                  # (a) 100 < w <= 150
Q28_TABLE = ('<table><thead><tr><th scope="col">Weight (<i>w</i> grams)</th>'
             '<th scope="col">Frequency</th></tr></thead><tbody>%s</tbody></table>'
             % ''.join('<tr><td>%d &lt; <i>w</i> &le; %d</td><td>%d</td></tr>' % r for r in Q28))


# ================================================================================================
# WHAT GOES WHERE
# ================================================================================================
NS = {}   # filled below with every drawing, checked for being inside its own box

PREAMBLES = {
    # q: (first part, its new html, the preamble's html, figure label, drawing, topics-from, note)
    '6': dict(first='6a',
              part_html='<p>Write down the number of houses Ben sold in January.</p>',
              html='<p>Ben sells houses.</p><p>The pictogram shows information about the number of '
                   'houses Ben sold in each of the first three months of last year.</p>',
              figure='pictogram', draw='q6',
              note='Drawn from the question paper’s own rectangles: January is two squares '
                   'and a half-width one (10), February two and a quarter (9), March three (12).'),
    '8': dict(first='8a',
              part_html='<p>Write down the coordinates of the point <i>A</i>.</p>',
              html='<p>The points <i>A</i> and <i>B</i> are shown on the grid.</p>',
              figure='grid', draw='q8',
              note='The grid and the two crosses are the paper’s: A at (2, 1), B at '
                   '(−2, −5).'),
    '16': dict(first='16a',
               part_html='<p>Change 6 ounces to grams.</p>',
               html='<p>You can use this graph to change between ounces and grams.</p>',
               figure='graph', draw='q16',
               note='The line is the paper’s, measured off its vectors: from the origin to '
                    '282.7 g at 9.97 oz, which is 28.35 g to the ounce. The large squares are the '
                    'paper’s too, 0.5 oz by 25 g, with five small squares in each.'),
    '28': dict(first='28a',
               part_html='<p>Find the class interval that contains the median.</p>',
               html='<p>The table shows information about the weights of 120 oranges.</p>'
                    + Q28_TABLE,
               figure='', draw=None, note=''),
}

# rows that change on their own: html / lead / diagram / figure / answer / accept / note
EDITS = {
    '1': dict(accept=''),
    '6c': dict(),
    '6b': dict(),
    '7a': dict(lead='', draw='q7a',
               note='On the printed paper the line is 8.7 cm long (the scheme accepts 8.5 to 8.9). '
                    'A screen has no centimetres, so a centimetre ruler is drawn under it at the '
                    'drawing’s own scale; on that ruler the line is 8.7 cm.',
               accept='8.5 to 8.9 cm'),
    '7b': dict(lead='', draw='q7b',
               note='Drawn from the paper’s own lines: the angle is 67°. An angle does '
                    'not change when a picture is scaled, so a protractor held to the screen '
                    'reads it too.',
               accept='65 to 69'),
    '8a': dict(lead='', accept=''),
    '8b': dict(accept=''),
    '11': dict(lead='<p>Majid has a spinner.</p>', draw='q11',
               note='Drawn from the paper’s own lines: the three radii are at 0°, '
                    '90° and 225°, so section 2 is 90° and sections 1 and 3 are '
                    '135° each.'),
    '13a': dict(accept='6cd | 6dc'),
    '16a': dict(lead='', accept='167 to 173 g'),
    '16b': dict(accept='34 to 36 ounces'),
    '17': dict(lead='<p>Here is a triangle <i>ABC</i>.</p>', draw='q17',
               html='<p>The region <b>R</b> consists of all points inside the triangle that are '
                    'less than 4 cm from <i>A</i> <b>and</b> closer to <i>C</i> than to <i>B</i>.'
                    '</p><p>On the diagram show, by shading, the region <b>R</b>.</p>',
               note='The triangle is the paper’s own, which prints CB 9.65 cm, CA 5.66 cm and '
                    'AB 8.68 cm. A screen has no centimetres, so a 4 cm bar is drawn beneath it at '
                    'the triangle’s own scale, to judge the arc by.'),
    '19a': dict(accept='0.5170189759 | 0.517 | 0.5170 | 0.51701 | 0.517018 | 0.5170189 | '
                       '0.51701897 | 0.517018975 | 0.517019 | 0.5170190 | 0.51701898 | 0.517018976'),
    '20': dict(lead='<p><i>ABC</i> is a right-angled triangle.</p>', draw='q20',
               answer='<b>16.2 cm</b> &mdash; M1 A1, anything from <b>16.1 to 16.2</b> accepted. '
                      'The right angle is at <i>B</i>, so the side opposite it, <i>CA</i> = 19 cm, '
                      'is the hypotenuse, and this is Pythagoras backwards: '
                      '<i>CB</i><sup>2</sup> = 19<sup>2</sup> &minus; 10<sup>2</sup> = 361 &minus; '
                      '100 = 261, and &radic;261 = 16.155&hellip;, which is 16.2 to 3 significant '
                      'figures. Adding instead of subtracting gives 21.5 and no marks.',
               note='The lead used to say AB = 19 cm and AC = 10 cm. The paper prints 19 cm on CA '
                    'and 10 cm on AB, with the right angle at B, which is what the scheme’s '
                    'own working (19² = 10² + BC²) uses.',
               accept='16.1 to 16.2 cm'),
    '21a': dict(accept='2 × 3 × 3 × 5 | 2 × 3^2 × 5 | 2 × 3² × 5 | 2x3x3x5 | 2 x 3 x 3 x 5 | '
                       '2*3*3*5 | 2x3^2x5'),
    '21b': dict(figure='', accept='36 | 2^2 × 3^2 | 2 × 2 × 3 × 3'),
    '24a': dict(html='<p>Complete the table of values for <i>y</i> = <i>x</i><sup>2</sup> '
                     '&minus; <i>x</i></p>' + Q24_TABLE, lead='', accept=''),
    '24b': dict(draw='q24',
                note='The grid is the paper’s: x from −2 to 3 and y from −4 to 8, '
                     'large squares 0.5 across and 1 up, five small squares in each.'),
    '24c': dict(accept=''),
    '26': dict(lead='<p><i>ABCD</i> is a quadrilateral.</p>', draw='q26',
               html='<p>All angles are measured in degrees.</p>'
                    '<p>Show that <i>ABCD</i> is a trapezium.</p>',
               note='Drawn from the paper’s own lines and, like the paper’s, not to the '
                    'angles it marks: the angle at A is drawn at 52° where 2x + 15 = 65°.'),
    '27': dict(lead='<p><i>ABC</i> and <i>DEF</i> are two similar isosceles triangles.</p>',
               draw='q27', note=''),
    '28b': dict(accept='151 to 152 g'),
}

# ================================================================================================
# NOTHING MAY BE PAINTED OUTSIDE ITS OWN BOX
# ================================================================================================
for name, fn in [('q6', q6), ('q7a', q7a), ('q7b', q7b), ('q8', q8), ('q11', q11),
                 ('q16', q16), ('q17', q17), ('q20', q20), ('q24', q24), ('q26', q26),
                 ('q27', q27)]:
    s = fn()
    m = re.match(r'<svg viewBox="0 0 (\d+) ([\d.]+)"', s)
    assert m and int(m.group(1)) == W, name
    h = float(m.group(2))
    pairs = [(float(a), float(b)) for a, b in re.findall(
        r'(?:cx|x1|x2|x)="(-?[\d.]+)"[^>]*?(?:cy|y1|y2|y)="(-?[\d.]+)"', s)]
    assert pairs, name
    for x, y in pairs:
        assert -1 <= x <= W + 1 and -1 <= y <= h + 1, '%s: (%s, %s) outside 0..%d x 0..%s' % (
            name, x, y, W, h)
    for pts in re.findall(r'points="([^"]+)"', s):
        for pr in pts.split():
            x, y = [float(v) for v in pr.split(',')]
            assert 0 <= x <= W and 0 <= y <= h, '%s: point (%s, %s) outside' % (name, x, y)
    assert 'text-anchor="' not in s and '<marker' not in s, name
    NS[name] = s

# ================================================================================================
# WRITE
# ================================================================================================
lines = open(FILE, encoding='utf-8').read().split('\n')
out, made, edited = [], [], []
pre_ids = {PFX + q for q in PREAMBLES}
under = {q: [] for q in PREAMBLES}

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
    if rid in pre_ids:
        raise SystemExit('%s already exists -- this script has already run against this file' % rid)
    short = rid.replace(PFX, '')
    q = str(row.get('question') or '')
    dump = lambda r, comma: json.dumps(r, ensure_ascii=False, separators=(',', ':')) + (
        ',' if comma else '')                                                  # noqa: E731

    if row.get('kind') == 'question' and q in PREAMBLES:
        p = PREAMBLES[q]
        if short == p['first']:
            t = dict(row)
            for k in ('part', 'marks', 'answer', 'answer_type', 'accept', 'figure',
                      'examiner_note', 'lead', 'needs_print'):
                t.pop(k, None)
            t.update(row_id=PFX + q, kind='preamble', question=q, html=p['html'])
            if p['draw']:
                t['figure'] = p['figure']
                t['diagram'] = NS[p['draw']]
                t['diagram_by'] = 'family'
            if p['note']:
                t['examiner_note'] = p['note']
            out.append(dump(t, True))
            made.append(t['row_id'])
            row['html'] = p['part_html']
        row.pop('lead', None) if short != '6b' else None
        row.pop('figure', None)
        under[q].append(short)

    if short in EDITS:
        e = EDITS[short]
        for k in ('lead', 'html', 'answer', 'figure', 'accept'):
            if k in e:
                if e[k] == '':
                    row.pop(k, None)
                else:
                    row[k] = e[k]
        if e.get('draw'):
            row['diagram'] = NS[e['draw']]
            row['diagram_by'] = 'family'
        if e.get('note'):
            row['examiner_note'] = e['note']
        edited.append(short)
    out.append(dump(row, trailing))

assert sorted(made) == sorted(pre_ids), made
assert under == {'6': ['6a', '6b', '6c'], '8': ['8a', '8b', '8c'], '16': ['16a', '16b'],
                 '28': ['28a', '28b']}, under
assert sorted(edited) == sorted(EDITS), sorted(set(EDITS) - set(edited))
open(FILE, 'w', encoding='utf-8').write('\n'.join(out))
print('preambles written: %s' % ', '.join(sorted(made)))
print('rows edited: %s' % ', '.join(edited))
print('drawings: %d, each %d wide and inside its own box' % (len(NS), W))
print('  Q6 pictogram 10 / 9 / 12; Q7a line %.2f cm; Q7b angle %.1f deg; Q16 %.2f g/oz'
      % (Q7A_CM, Q7B_X, Q16_G_PER_OZ))
