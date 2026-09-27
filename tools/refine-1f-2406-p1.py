"""
EVERY PICTURE JUNE 2024 FOUNDATION PAPER 1 NAMES, AND FIVE PREAMBLES SO THAT PART (b) CAN BE READ.

ASKED FOR AS *"can you ensure maths foundation paper 1 is refined and nice. also navigation is a bit
buggy for one student apparently."* Measured first: 41 questions, 80 marks, every one answered, 30
with a Check -- and SEVENTEEN carrying a `figure` with `diagram` empty on all of them. Fifteen of
those are pictures the paper prints and the transcription lost.

AND THE TWO HALVES OF THAT REPORT ARE ONE CHANGE, which is why they are in one commit. Only Q23 had
a preamble. Every other multi-part question on this paper left the shared stem on part (a) -- so
swiping through it handed a student a card reading only *"Find the range."* and another reading only
*"Give a reason for your answer."*, with the thing they refer to on the page before. You had to keep
swiping back, and swiping back loses your place in the strip. That IS the navigation report.

A QUESTION-SCOPED PREAMBLE FIXES BOTH AT ONCE, and it is the mechanism this repository already
chose: `preamble_` attaches it to every part that hangs from it, so the stem is written ONCE and the
figure is drawn once and appears on (a), (b) and (c) alike. CLAUDE.md records it for the AQA insert
(*"one fact about the insert, repeated on every question that uses it"*), for this very paper's Q23,
and for the 2017 Foundation Q13 -- `tools/draw-1f-1705-q13.py` is the template this follows.

WHAT IS DRAWN AND WHAT IS NOT is CLAUDE.md's rule unchanged: only where the row's own words, or the
mark scheme's own arithmetic, determine the picture.

  Q22's floor plan is the best case and it needs no paper at all. The scheme prints
  `(10-6) x (8-5) = 12` and `"80" - "12"` among its routes, which fixes the L exactly: 10 by 8
  overall with a 4 by 3 notch, 80 - 12 = 68 m^2, and 68 is the answer. Asserted below.

  Q23's Venn is fixed by its own two answers. P' is 10, 11, 13, 14, 16, 17 and P u Q is five of
  nine, which places all nine numbers with 15 in the overlap and nothing left over.

  Q25(a)'s line is fixed by its answer, y = 1.5x + 3, on the grid its lead states.

  Q3 and Q19 have their SHAPE from the row and one number chosen here, and both are safe because
  neither choice can move the answer: any reflex angle is called reflex, and any placement of
  triangle A with B at A + (5, -4) is described by that same vector. `examiner_note` says so on
  both rather than leaving it to be guessed at.

THREE ARE TABLES AND NOT PICTURES, which is CLAUDE.md's own line: *"A table is not a picture."*
Q15's stem and leaf, Q16's three pack prices and Q7's hours were prose summarising a printed table
-- four pairs a reader has to re-pair by counting along two lists. `.qsheet table` has been in the
stylesheet since before anything here could produce one.

NOT TO SCALE WHERE THE PAPER SAYS SO. Q8 and Q12 carry Edexcel's own "Diagram NOT accurately drawn",
which is also what stops a student measuring x off the picture instead of working it out.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgplot import W, blankgrid           # noqa: E402  the one place the scale lives

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.path.join(HERE, 'data', 'questions.json')
PAPER = 'RS1786302107764-415'
PRE = 'Q-1MA1-2406-1F-23'                  # the preamble this paper already had
ID = lambda s: 'Q-1MA1-2406-1F-%s' % s     # noqa: E731


def svg(body, h, label):
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>'
            % (W, h, label, body))


def line(x1, y1, x2, y2, cls='', extra=''):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" %s%s/>'
            % (x1, y1, x2, y2,
               ('class="%s"' % cls) if cls else 'stroke="currentColor" stroke-width="1.4"', extra))


def txt(x, y, s, cls='num', anchor='middle'):
    """INLINE `style`, NOT `text-anchor=`. CSS beats an SVG presentation attribute, so
       `.qsheet .num { text-anchor: middle }` silently wins over the attribute -- CLAUDE.md records
       ten y-axis numbers sitting centred on their axis for exactly that."""
    return ('<text x="%.1f" y="%.1f" class="%s" style="text-anchor:%s">%s</text>'
            % (x, y, cls, anchor, s))


NOT_SCALE = 'Diagram NOT accurately drawn'


# ================================================================================================
# Q3  --  an angle marked y, and the answer is the WORD reflex
# ================================================================================================
# The small angle has to be OBTUSE, because the answer's own note names "obtuse" as the wrong turn
# a student takes when they read the label as pointing at the small angle. 140 and 220.
Q3_SMALL, Q3_REFLEX = 140.0, 220.0
assert Q3_SMALL + Q3_REFLEX == 360.0
assert 90 < Q3_SMALL < 180, 'the trap answer must really be obtuse'
assert 180 < Q3_REFLEX < 360, 'y must really be reflex'


def q3():
    import math
    ox, oy, r = 150.0, 118.0, 74.0
    a, b = 20.0, 20.0 + Q3_SMALL                      # the two rays, in degrees anticlockwise
    pt = lambda d, rad: (ox + rad * math.cos(math.radians(d)),   # noqa: E731
                         oy - rad * math.sin(math.radians(d)))
    ax, ay = pt(a, r)
    bx, by = pt(b, r)
    # the arc for y sweeps the REFLEX way: clockwise from ray b round to ray a
    ar = 30.0
    s = pt(b, ar)
    e = pt(a, ar)
    # SWEEP 0, NOT 1, AND A SCREENSHOT IS WHY. The first version swept the arc over the TOP --
    # which is the 140 degree side, the one the answer calls the wrong turn -- so the picture
    # contradicted its own answer while measuring perfectly. Nothing but looking at it could see
    # that: the markup is valid, the label is inside the box and the card fits.
    arc = ('<path d="M %.1f %.1f A %.1f %.1f 0 1 0 %.1f %.1f" fill="none" stroke="currentColor" '
           'stroke-width="1.2"/>' % (s[0], s[1], ar, ar, e[0], e[1]))
    mid = pt(a - Q3_REFLEX / 2.0, ar + 20)            # inside the reflex sweep
    body = (line(ox, oy, ax, ay) + line(ox, oy, bx, by) + arc
            + '<circle cx="%.1f" cy="%.1f" r="2.4" fill="currentColor"/>' % (ox, oy)
            + txt(mid[0], mid[1] + 4, '<tspan class="lbl">y</tspan>')
            + txt(W / 2.0, 214, NOT_SCALE, 'cap'))
    return svg(body, 224, 'Two straight lines meeting at a point. The angle marked y is the one '
                          'swept the long way round, bigger than a half turn.')


# ================================================================================================
# Q7  --  the grid the chart is drawn ON, with no axes, because the axes are the marks
# ================================================================================================
Q7_ROWS = {'Lena': [6, 9, 8, 6], 'Pavel': [7, 6, 5, 6]}
Q7_DAYS = ['Wednesday', 'Thursday', 'Friday', 'Saturday']
assert max(max(v) for v in Q7_ROWS.values()) == 9


def q7():
    """Eleven columns by ten rows of centimetre squares. Ten rows carries a scale of one hour per
       square up to ten, which is the obvious scale for a tallest bar of 9 and is what the scheme's
       "linear scale present" mark is about; eleven columns holds four days of two bars with a gap.
       No axes -- `frame=False`, and svgplot says why."""
    return blankgrid(11, 10, 24, [], 1,
                     'Squared paper, eleven centimetre squares by ten, with nothing drawn on it.',
                     left=16, frame=False)


# ================================================================================================
# Q8  --  three rays at O, the angles round a point
# ================================================================================================
Q8 = (220.0, 90.0)
Q8_X = 360.0 - sum(Q8)
assert Q8_X == 50.0, Q8_X                              # the scheme's answer, from its own arithmetic


def q8():
    import math
    ox, oy, r = 170.0, 132.0, 95.0
    # drawn anticlockwise from OA at 0: OA -> 220 -> OB -> 90 -> OC -> x -> back to OA
    rays = [('A', 0.0), ('B', 220.0), ('C', 310.0)]
    assert rays[1][1] == Q8[0] and rays[2][1] - rays[1][1] == Q8[1]
    assert 360.0 - rays[2][1] == Q8_X
    pt = lambda d, rad: (ox + rad * math.cos(math.radians(d)),   # noqa: E731
                         oy - rad * math.sin(math.radians(d)))
    body = ''
    for name, d in rays:
        x, y = pt(d, r)
        lx, ly = pt(d, r + 15)
        body += line(ox, oy, x, y) + txt(lx, ly + 4, '<tspan class="lbl">%s</tspan>' % name)
    # AN ARC PER ANGLE, because three numbers floating between three rays is three numbers a
    # reader has to pair with an angle themselves -- and on a screenshot the 220 read as detached
    # from the figure entirely. The arc is what says which angle each one is about.
    # THE BIG ONE GETS THE BIG RADIUS. At 34 against rays 82 long it closed up round the vertex and
    # read as a circle drawn round O rather than as an angle; at 52 the rays are visible inside it.
    for start, span, rad, label in ((rays[0][1], Q8[0], 52.0, '220°'),
                                    (rays[1][1], Q8[1], 24.0, '90°'),
                                    (rays[2][1], Q8_X, 24.0, '<tspan class="lbl">x</tspan>')):
        a0, a1 = pt(start, rad), pt(start + span, rad)
        body += ('<path d="M %.1f %.1f A %.1f %.1f 0 %d 0 %.1f %.1f" fill="none" '
                 'stroke="currentColor" stroke-width="1.1" opacity=".8"/>'
                 % (a0[0], a0[1], rad, rad, 1 if span > 180 else 0, a1[0], a1[1]))
        x, y = pt(start + span / 2.0, rad + 16.0)
        body += txt(x, y + 4, label)
    # O SITS CLEAR OF ALL THREE ARCS. Up and right of the vertex is inside the 220 sweep and
    # nowhere near its label, which is out at the bisector.
    body += ('<circle cx="%.1f" cy="%.1f" r="2.4" fill="currentColor"/>' % (ox, oy)
             + txt(ox + 12, oy - 10, '<tspan class="lbl">O</tspan>')
             + txt(W / 2.0, 252, NOT_SCALE, 'cap'))
    return svg(body, 262, 'Three straight lines OA, OB and OC meeting at the point O. One angle at '
                          'O is marked 220 degrees, another 90 degrees, and the third is marked x.')


# ================================================================================================
# Q9  --  the number machine
# ================================================================================================
Q9_BOXES = [('× 2', lambda v: v * 2), ('− 10', lambda v: v - 10)]
assert Q9_BOXES[1][1](Q9_BOXES[0][1](13)) == 16                     # (a)'s answer
assert Q9_BOXES[1][1](Q9_BOXES[0][1](19)) == 28                     # (b)'s answer
assert Q9_BOXES[1][1](Q9_BOXES[0][1](10)) == 10                     # (c)'s answer


def q9():
    y, h = 26.0, 40.0
    cells = [('input', 58.0), (Q9_BOXES[0][0], 62.0), (Q9_BOXES[1][0], 62.0), ('output', 62.0)]
    x = 12.0
    body = ''
    for i, (label, w) in enumerate(cells):
        body += ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" '
                 'stroke="currentColor" stroke-width="1.4" rx="3"/>' % (x, y, w, h))
        body += txt(x + w / 2.0, y + h / 2.0 + 4, label)
        if i < len(cells) - 1:
            a, b = x + w, x + w + 16.0
            body += (line(a, y + h / 2.0, b - 3, y + h / 2.0)
                     + '<path d="M %.1f %.1f l -6 -4 v 8 z" fill="currentColor"/>'
                       % (b, y + h / 2.0))
        x += w + 16.0
    assert x - 16.0 <= W, 'the machine runs off the right of the box: %.1f' % x
    return svg(body, 96, 'A number machine: an input box, then a box reading times 2, then a box '
                         'reading minus 10, then an output box, joined left to right by arrows.')


# ================================================================================================
# Q12  --  a triangle and a rectangle, both labelled, neither to scale
# ================================================================================================
Q12_TRI = (14, 30, 36)
Q12_W = 4
Q12_LEN = (sum(Q12_TRI) / 4 - 2 * Q12_W) / 2
assert sum(Q12_TRI) == 80 and sum(Q12_TRI) / 4 == 20 and Q12_LEN == 6, Q12_LEN


def q12():
    # a scalene triangle, deliberately not to the 14/30/36 scale
    ax, ay = 22.0, 122.0
    bx, by = 138.0, 122.0
    cx, cy = 104.0, 30.0
    body = (line(ax, ay, bx, by) + line(bx, by, cx, cy) + line(cx, cy, ax, ay)
            + txt((ax + bx) / 2.0, ay + 18, '36 cm')
            + txt((ax + cx) / 2.0 - 22, (ay + cy) / 2.0, '30 cm')
            + txt((bx + cx) / 2.0 + 32, (by + cy) / 2.0, '14 cm'))
    rx, ry, rw, rh = 196.0, 62.0, 124.0, 44.0
    body += ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" '
             'stroke="currentColor" stroke-width="1.4"/>' % (rx, ry, rw, rh))
    body += txt(rx - 22, ry + rh / 2.0 + 4, '4 cm')
    body += txt(W / 2.0, 164, NOT_SCALE, 'cap')
    return svg(body, 174, 'A triangle with sides marked 36 cm, 30 cm and 14 cm, and beside it a '
                          'rectangle with its width marked 4 cm and its length not given.')


# ================================================================================================
# Q19  --  a coordinate grid with triangles A and B
# ================================================================================================
Q19_VEC = (5, -4)                                        # the scheme's answer
Q19_A = [(-4, 5), (-4, 2), (-2, 2)]
Q19_B = [(x + Q19_VEC[0], y + Q19_VEC[1]) for x, y in Q19_A]
for _p in Q19_A + Q19_B:
    assert -5 <= _p[0] <= 5 and -5 <= _p[1] <= 5, _p    # both fit the grid the lead states


def grid_(lo_x, hi_x, lo_y, hi_y, step=26.0, pad=26.0):
    """One coordinate grid for Q19 and Q25, so the two cannot disagree about what a unit is."""
    cols, rows = hi_x - lo_x, hi_y - lo_y
    left, top = pad, 14.0
    to = lambda x, y: (left + (x - lo_x) * step, top + (hi_y - y) * step)   # noqa: E731
    p = []
    for i in range(cols + 1):
        x = left + i * step
        p.append(line(x, top, x, top + rows * step, 'grid'))
    for i in range(rows + 1):
        y = top + i * step
        p.append(line(left, y, left + cols * step, y, 'grid'))
    zx, zy = to(0, 0)
    p.append(line(left, zy, left + cols * step, zy, 'axis'))
    p.append(line(zx, top, zx, top + rows * step, 'axis'))
    for x in range(lo_x, hi_x + 1):
        if x:
            p.append(txt(to(x, 0)[0], zy + 14, str(x)))
    for y in range(lo_y, hi_y + 1):
        if y:
            p.append(txt(zx - 8, to(0, y)[1] + 4, str(y), 'num', 'end'))
    p.append(txt(left + cols * step + 12, zy + 4, '<tspan class="lbl">x</tspan>'))
    # BESIDE THE AXIS, NOT ON TOP OF IT. Above the axis put the letter level with the topmost
    # number, so the two overlapped on both grids.
    p.append(txt(zx + 12, top + 8, '<tspan class="lbl">y</tspan>'))
    return ''.join(p), to, top + rows * step + 22


def q19():
    body, to, h = grid_(-5, 5, -5, 5)
    for pts, name in ((Q19_A, 'A'), (Q19_B, 'B')):
        d = ' '.join('%.1f,%.1f' % to(x, y) for x, y in pts)
        body += ('<polygon points="%s" fill="currentColor" fill-opacity=".14" '
                 'stroke="currentColor" stroke-width="1.4"/>' % d)
        mx = sum(to(x, y)[0] for x, y in pts) / 3.0
        my = sum(to(x, y)[1] for x, y in pts) / 3.0
        body += txt(mx, my + 4, '<tspan class="lbl">%s</tspan>' % name)
    return svg(body, h, 'A coordinate grid with x and y from minus 5 to 5, with triangle A drawn '
                        'on the upper left and triangle B, the same shape and size, lower and to '
                        'the right of it.')


# ================================================================================================
# Q22  --  the floor plan, fixed by the mark scheme's own arithmetic
# ================================================================================================
Q22 = dict(width=10, height=8, bottom_run=6, right_side=5)
_notch_w = Q22['width'] - Q22['bottom_run']
_notch_h = Q22['height'] - Q22['right_side']
Q22_AREA = Q22['width'] * Q22['height'] - _notch_w * _notch_h
assert (_notch_w, _notch_h) == (4, 3), (_notch_w, _notch_h)
assert Q22['width'] * Q22['height'] == 80
assert _notch_w * _notch_h == 12
assert Q22_AREA == 68, Q22_AREA                     # the answer, and 3 tins cover 75
assert Q22['width'] * Q22['right_side'] + Q22['bottom_run'] * _notch_h == Q22_AREA
assert 3 * 2.5 * 10 == 75 and 75 > Q22_AREA         # "yes, she has enough"


def q22():
    s = 17.0
    left, top = 40.0, 30.0        # 30, not 16: the '6 m' label sits ABOVE the top edge
    to = lambda x, y: (left + x * s, top + (Q22['height'] - y) * s)      # noqa: E731
    # anticlockwise from the bottom-left: right 10, up 5, left 4, up 3, left 6, down 8
    pts = [(0, 0), (Q22['width'], 0), (Q22['width'], Q22['right_side']),
           (Q22['bottom_run'], Q22['right_side']), (Q22['bottom_run'], Q22['height']),
           (0, Q22['height'])]
    d = ' '.join('%.1f,%.1f' % to(x, y) for x, y in pts)
    body = ('<polygon points="%s" fill="currentColor" fill-opacity=".08" stroke="currentColor" '
            'stroke-width="1.6"/>' % d)
    mark = [((0, 0), (Q22['width'], 0), '10 m', 0, 16),
            ((Q22['width'], 0), (Q22['width'], Q22['right_side']), '5 m', 20, 4),
            ((Q22['bottom_run'], Q22['height']), (0, Q22['height']), '6 m', 0, -8),
            ((0, Q22['height']), (0, 0), '8 m', -20, 4)]
    for (ax, ay), (bx, by), label, dx, dy in mark:
        p, q = to(ax, ay), to(bx, by)
        body += txt((p[0] + q[0]) / 2.0 + dx, (p[1] + q[1]) / 2.0 + dy, label)
    body += txt(W / 2.0, top + Q22['height'] * s + 34, NOT_SCALE, 'cap')
    return svg(body, top + Q22['height'] * s + 44,
               'A plan of a floor: an L-shaped room. The bottom edge is 10 m, the right-hand edge '
               '5 m, the top edge 6 m and the left-hand edge 8 m.')


# ================================================================================================
# Q23  --  the Venn, fixed by its own two answers
# ================================================================================================
Q23_E = list(range(10, 19))
Q23_P = [12, 15, 18]
Q23_Q = [10, 14, 15]
Q23_BOTH = sorted(set(Q23_P) & set(Q23_Q))
Q23_OUT = sorted(set(Q23_E) - set(Q23_P) - set(Q23_Q))
assert len(Q23_E) == 9 and Q23_BOTH == [15]
assert sorted(set(Q23_E) - set(Q23_P)) == [10, 11, 13, 14, 16, 17], "P' from the answer to (a)"
assert len(set(Q23_P) | set(Q23_Q)) == 5, 'P union Q is five of the nine -- the answer to (b)'
assert Q23_OUT == [11, 13, 16, 17]


def q23():
    """THE CIRCLES HAVE TO BE INSIDE THE RECTANGLE and a screenshot is what said they were not:
       at r = 62 about a centre at 96 they ran from 34 to 158 inside a box ending at 156, and the
       four numbers outside both circles sat at 138 and 158 -- so the second pair was painted below
       the universal set it is a member of. A Venn diagram whose circles break out of E is a
       picture contradicting the notation it is teaching."""
    h = 200.0
    box_t, box_b = 12.0, 188.0
    body = ('<rect x="10" y="%.0f" width="%d" height="%.0f" fill="none" stroke="currentColor" '
            'stroke-width="1.3"/>' % (box_t, W - 20, box_b - box_t))
    body += txt(26, 30, '<tspan class="lbl">E</tspan>')
    cy, r = 88.0, 54.0
    assert cy - r > box_t and cy + r < box_b, 'the circles must sit inside E'
    for cx, name, nx in ((130.0, 'P', 92.0), (210.0, 'Q', 248.0)):
        body += ('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="currentColor" '
                 'stroke-width="1.4"/>' % (cx, cy, r))
        body += txt(nx, 46, '<tspan class="lbl">%s</tspan>' % name)
    place = [(sorted(set(Q23_P) - set(Q23_Q)), 104.0), (Q23_BOTH, 170.0),
             (sorted(set(Q23_Q) - set(Q23_P)), 236.0)]
    for nums, x in place:
        for i, n in enumerate(nums):
            body += txt(x, cy - 4 + i * 20, str(n))
    for i, n in enumerate(Q23_OUT):
        x, y = 34.0 + (i % 2) * 26, 154.0 + (i // 2) * 20
        assert y < box_b - 4, 'a number outside both circles must still be inside E'
        assert (x - 130.0) ** 2 + (y - cy) ** 2 > r ** 2, 'and outside both circles'
        body += txt(x, y, str(n))
    return svg(body, h, 'A Venn diagram inside a rectangle labelled E, with two overlapping '
                        'circles labelled P and Q. 12 and 18 are in P only, 15 is in the overlap, '
                        '10 and 14 are in Q only, and 11, 13, 16 and 17 are outside both circles.')


# ================================================================================================
# Q25(a)  --  the line L, fixed by its own answer
# ================================================================================================
Q25_M, Q25_C = 1.5, 3                              # y = 3/2 x + 3, the scheme's answer
assert Q25_M * 0 + Q25_C == 3 and Q25_M * 2 + Q25_C == 6


def q25():
    body, to, h = grid_(-4, 4, -3, 7, step=24.0, pad=30.0)
    # the two ends of the segment, clipped to the grid the lead states
    xs = []
    for x in (-4.0, 4.0):
        y = Q25_M * x + Q25_C
        if -3 <= y <= 7:
            xs.append((x, y))
    for y in (-3.0, 7.0):
        x = (y - Q25_C) / Q25_M
        if -4 <= x <= 4:
            xs.append((x, y))
    xs = sorted(set(xs))[:2]
    assert len(xs) == 2, xs
    a, b = to(*xs[0]), to(*xs[1])
    body += line(a[0], a[1], b[0], b[1])
    mid = to(*xs[1])
    body += txt(mid[0] - 16, mid[1] + 14, '<tspan class="lbl">L</tspan>')
    return svg(body, h, 'A coordinate grid with x from minus 4 to 4 and y from minus 3 to 7, with '
                        'one straight line drawn on it and labelled L. It crosses the y-axis at 3 '
                        'and rises 3 for every 2 across.')


# ================================================================================================
# THE TABLES  --  three things that were prose and are printed tables on the paper
# ================================================================================================
def table(head, rows, caption=''):
    h = ''.join('<th scope="col">%s</th>' % c for c in head)
    b = ''.join('<tr><th scope="row">%s</th>%s</tr>'
                % (r[0], ''.join('<td>%s</td>' % c for c in r[1:])) for r in rows)
    cap = '<caption>%s</caption>' % caption if caption else ''
    return '<table>%s<thead><tr>%s</tr></thead><tbody>%s</tbody></table>' % (cap, h, b)


# DAYS DOWN, NOT ACROSS. Written with a column per day it is five columns in a 320px card, and a
# screenshot showed Saturday and its two figures off the right-hand edge -- a table you have to
# scroll sideways to finish reading, on the question whose whole job is comparing the four days.
# Three columns fits at every width this app is read at.
Q7_TABLE = table(['Day', 'Lena', 'Pavel'],
                 [[day, str(Q7_ROWS['Lena'][i]), str(Q7_ROWS['Pavel'][i])]
                  for i, day in enumerate(Q7_DAYS)],
                 'Hours worked')
Q15_STEM = [(4, [5, 9]), (5, [3, 7, 8]), (6, [1, 2, 4, 5, 7, 7]), (7, [2, 6, 7]), (8, [1])]
Q15_VALUES = [s * 10 + l for s, ls in Q15_STEM for l in ls]
assert len(Q15_VALUES) == 15, len(Q15_VALUES)
assert sorted(Q15_VALUES) == Q15_VALUES
assert Q15_VALUES[7] == 64, Q15_VALUES[7]                      # (a) the median, the 8th of 15
assert max(Q15_VALUES) - min(Q15_VALUES) == 36                 # (b) the range, 81 - 45
Q15_TABLE = (table(['Stem', 'Leaf'],
                   [[str(s), '&nbsp;'.join(str(l) for l in ls)] for s, ls in Q15_STEM])
             + '<p class="qkey">Key: 4&nbsp;|&nbsp;5 represents 45 minutes</p>')
Q16_PACKS = [(4, 180), (8, 320), (12, 600)]
assert [round(p / n) for n, p in Q16_PACKS] == [45, 40, 50]    # the scheme's three unit prices
assert min(Q16_PACKS, key=lambda t: t[1] / t[0])[0] == 8       # the answer: the pack of 8
Q16_TABLE = table(['Pack', 'Price'],
                  [['%d batteries' % n, '&pound;%.2f' % (p / 100.0)] for n, p in Q16_PACKS])


# ================================================================================================
# WHAT GOES WHERE
# ================================================================================================
# A preamble per multi-part question whose parts share a stem.  `after` is the part the shared
# prose is being MOVED OFF, and `ask` is what that part keeps -- so nothing is said twice.
PREAMBLES = [
    dict(q='8', figure='angle-diagram', diagram=q8, topics='Angles',
         html='<p>OA, OB and OC are three straight lines meeting at O.</p>',
         off=[('8i', '<p>Work out the size of the angle marked <i>x</i>.</p>')],
         note='The three angles at O are the paper’s own: 220°, 90° and x. The '
              'drawing is not to scale, as the paper’s is not, so x has to be worked out '
              'rather than measured.'),
    dict(q='9', figure='number-machine', diagram=q9, topics='Function Machines',
         html='<p>Here is a number machine.</p>',
         off=[('9a', '<p>Work out the output when the input is 13</p>')],
         note=''),
    dict(q='15', figure='', diagram=None, topics='Averages & Range',
         html='<p>Tessa recorded the times that 15 adults took to complete a run.<br>'
              'She showed her results in a stem and leaf diagram.</p>' + Q15_TABLE,
         off=[('15a', '<p>Find the median.</p>')],
         note='The stem and leaf diagram is a table rather than a picture, so it is set as one '
              'here — the transcription had it as a sentence, which is fifteen values a '
              'reader has to re-pair by counting along two lists.'),
    dict(q='22', figure='floor-plan', diagram=q22, topics='Area of 2-D Shapes',
         html='<p>The diagram shows a plan of a floor.</p>',
         off=[('22a', '<p>Petra is going to cover the floor with paint.</p>'
                      '<p>Petra has 3 tins of paint. There are 2.5 litres of paint in each tin. '
                      'Petra thinks 1 litre of paint will cover 10 m<sup>2</sup> of floor.</p>'
                      '<p>Assuming Petra is correct, does she have enough paint to cover the '
                      'floor?<br>You must show all your working.</p>')],
         note='The four marked lengths are the paper’s. The shape they describe is settled by '
              'the mark scheme’s own routes — it prints (10 − 6) × (8 − 5) '
              '= 12 and “80” − “12”, so the floor is 10 m by 8 m with a '
              '4 m by 3 m corner taken out, and 80 − 12 = 68 m² is the answer to (a).'),
    dict(q='24', figure='', diagram=None, topics='Estimation',
         html='<p>Sophie drives a distance of 513 kilometres on a motorway in France.<br>'
              'She pays 0.81 euros for every 10 kilometres she drives on the motorway.</p>',
         off=[('24a', '<p>Work out an estimate for the total amount Sophie pays to drive '
                      '513 kilometres on the motorway.<br>You must show your working.</p>')],
         note=''),
]

# The one preamble this paper already had, which gains the picture it has been describing in prose.
EXISTING = dict(row_id=PRE, diagram=q23,
                html='<p>The Venn diagram shows the nine numbers in the universal set '
                     '<i>E</i> and which of them are in set <i>P</i> and in set <i>Q</i>.</p>',
                note='')

# ---- THE ONE ANSWER ON THIS PAPER THAT COULD MARK ITSELF AND DID NOT ---------------------------
# Of the eleven questions with no `accept`, ten are correctly without one: an explain, a show-that,
# a draw-a-chart, a describe-the-transformation scored as two independent B1s, and an answer that is
# an infinite family (`y = 5x + c` for any c other than 0). `markAnswer_` compares ONE value and a
# cell on any of those would mark a right answer wrong.
#
# THE RATIO IS THE ELEVENTH AND IT IS ONE VALUE. What stopped it is that `markNorm_` folded the
# spaces round a fraction slash and not round a colon, so `2:3` typed against `2 : 3` printed came
# out FALSE -- measured, before the fold went in. See the note beside it in find.js.
Q10_ACCEPT = '2 : 3'
ACCEPTS = {'10': Q10_ACCEPT}

# A picture on a question that has no parts to share it with.
ON_PART = [
    dict(id='3', diagram=q3,
         lead='<p>The diagram shows an angle marked <i>y</i>.</p>',
         note='The shape is the paper’s — two lines at a point with the label attached '
              'to the angle swept the long way round. The size of that angle was chosen here, '
              'because the original did not come across and no reflex angle changes the answer: '
              'the smaller angle is obtuse either way, which is the wrong turn the scheme’s '
              'own note warns about.'),
    dict(id='7', diagram=q7, lead=Q7_TABLE,
         note='The grid is squared paper with no axes on it, as the paper prints — the scheme '
              'gives a mark for a linear scale being present and says it need not start at 0, so '
              'an axis drawn here would be a mark awarded by the picture. The hours are set as a '
              'table rather than a sentence.'),
    dict(id='12', diagram=q12, lead='<p>Here is a triangle and a rectangle.</p>',
         note='The four lengths are the paper’s. Not to scale: the perimeters are 80 cm and '
              '20 cm, so a rectangle drawn to the triangle’s scale would be a sliver.'),
    dict(id='16', diagram=None, lead=Q16_TABLE,
         note='The three pack prices are set as a table rather than a sentence — they are '
              'what the comparison is made from, and the scheme scores nothing for the right pack '
              'without them.'),
    dict(id='19', diagram=q19,
         lead='<p>Triangle <b>A</b> and triangle <b>B</b> are drawn on the grid.</p>',
         note='The grid is the paper’s and so is the answer, the column vector 5 across and '
              '4 down. WHERE on the grid triangle A sits was chosen here, because the original '
              'coordinates did not come across — any placement with B at A plus that vector '
              'is described by the same vector, so the answer is unchanged.'),
    dict(id='25a', diagram=q25,
         lead='<p>The straight line <i>L</i> is drawn on the grid.</p>',
         note='The line is the one its own answer states, y = 3/2 x + 3, on the grid the '
              'paper’s lead describes.'),
]

# ================================================================================================
# NOTHING MAY BE PAINTED OUTSIDE THE BOX `check/cards.js` MEASURES
# ================================================================================================
DRAWN = {}
for name, fn in [('q3', q3), ('q7', q7), ('q8', q8), ('q9', q9), ('q12', q12),
                 ('q19', q19), ('q22', q22), ('q23', q23), ('q25', q25)]:
    s = fn()
    DRAWN[name] = s
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

# ================================================================================================
# WRITE
# ================================================================================================
lines = open(FILE, encoding='utf-8').read().split('\n')
by_q = {p['q']: p for p in PREAMBLES}
moved = {pid: ask for p in PREAMBLES for pid, ask in p['off']}
on_part = {d['id']: d for d in ON_PART}
out, made, fixed, drew, marked, touched_pre = [], [], [], [], [], 0

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
    rid = row.get('row_id')
    short = rid.replace('Q-1MA1-2406-1F-', '') if rid else ''

    # ---- the preamble this paper already had: give it the picture it has been describing --------
    if rid == PRE and row.get('kind') == 'preamble':
        row['html'] = EXISTING['html']
        row['diagram'] = DRAWN['q23']
        row['diagram_by'] = 'family'
        row.pop('figure', None)
        touched_pre += 1
        out.append(json.dumps(row, ensure_ascii=False) + (',' if trailing else ''))
        continue

    # ---- a new preamble goes in FRONT of the part it is taken from ------------------------------
    if row.get('kind') == 'question' and short in moved:
        p = by_q[str(row.get('question'))]
        t = dict(row)
        for k in ('part', 'marks', 'answer', 'answer_type', 'accept', 'figure', 'examiner_note',
                  'lead'):
            t.pop(k, None)
        t['row_id'] = 'Q-1MA1-2406-1F-%s' % p['q']
        assert t['row_id'] != PRE
        t['kind'] = 'preamble'
        t['question'] = p['q']
        t['part'] = ''
        t['marks'] = ''
        t['html'] = p['html']
        t['topics'] = p['topics'] or t.get('topics', '')
        if p['diagram']:
            t['figure'] = p['figure']
            t['diagram'] = DRAWN[{'8': 'q8', '9': 'q9', '22': 'q22'}[p['q']]]
            t['diagram_by'] = 'family'
        if p['note']:
            t['examiner_note'] = p['note']
        out.append(json.dumps(t, ensure_ascii=False) + ',')
        made.append(t['row_id'])
        # and the part keeps only its own ask
        row['html'] = moved[short]
        row.pop('lead', None)
        row.pop('figure', None)
        fixed.append(short)
        out.append(json.dumps(row, ensure_ascii=False) + (',' if trailing else ''))
        continue

    # ---- the other parts of a question that now has a preamble lose their duplicate figure -----
    #      Q23's two are in this list as well: its preamble carries the Venn now, so the `figure`
    #      label on the parts names a picture they are no longer missing -- and a count of work that
    #      does not exist is the mirror of a silence, which CLAUDE.md records paying for on twelve
    #      SATs rows.
    if row.get('kind') == 'question' and (str(row.get('question')) in by_q
                                          or str(row.get('question')) == '23'):
        row.pop('figure', None)
        fixed.append(short)
        out.append(json.dumps(row, ensure_ascii=False) + (',' if trailing else ''))
        continue

    # ---- the ratio, which can mark itself now that a colon folds like a slash --------------------
    if row.get('kind') == 'question' and short in ACCEPTS:
        row['accept'] = ACCEPTS[short]
        marked.append(short)
        out.append(json.dumps(row, ensure_ascii=False) + (',' if trailing else ''))
        continue

    # ---- a picture on a question with no parts --------------------------------------------------
    if row.get('kind') == 'question' and short in on_part:
        d = on_part[short]
        key = {'3': 'q3', '7': 'q7', '12': 'q12', '19': 'q19', '25a': 'q25'}.get(short)
        if d['diagram']:
            row['diagram'] = DRAWN[key]
            row['diagram_by'] = 'family'
        else:
            row.pop('figure', None)            # its content is a table on the row now
        row['lead'] = d['lead']
        row['examiner_note'] = d['note']
        drew.append(short)
        out.append(json.dumps(row, ensure_ascii=False) + (',' if trailing else ''))
        continue

    out.append(raw)

assert touched_pre == 1, touched_pre
assert '23a' in fixed and '23b' in fixed, 'Q23 parts must lose the figure their preamble now draws'
assert len(made) == len(PREAMBLES), (made, len(PREAMBLES))
assert sorted(drew) == sorted(on_part), (drew, list(on_part))
assert sorted(marked) == sorted(ACCEPTS), (marked, list(ACCEPTS))
open(FILE, 'w', encoding='utf-8').write('\n'.join(out))
print('preambles written: %s' % ', '.join(made))
print('  Q23 preamble gained the Venn it has been describing in prose')
print('parts that lost a stranded stem or a duplicate figure: %s' % ', '.join(sorted(set(fixed))))
print('pictures drawn on a question of their own: %s' % ', '.join(sorted(drew)))
print('drawings: %d, each inside %d x its own height' % (len(DRAWN), W))
print('  Q22 floor %d m2 from the scheme\'s own (10-6)x(8-5)=12 and 80-12; 3 tins cover 75'
      % Q22_AREA)
print('  Q23 nine numbers placed, P\' = 10,11,13,14,16,17 and P u Q = 5 of 9')
print('  Q15 median %d and range %d off the transcribed stem and leaf'
      % (Q15_VALUES[7], max(Q15_VALUES) - min(Q15_VALUES)))
print('  Q16 unit prices %s p a battery -- the pack of 8 wins'
      % ', '.join(str(round(p / n)) for n, p in Q16_PACKS))
print('accept written on: %s  (%s)' % (', '.join(marked), Q10_ACCEPT))
