# -*- coding: utf-8 -*-
"""Every KS1/KS2 SATs part made complete for its interaction type (375): figures, `draw_answer`, `accept`,
`choices`, `cells`, `mark_words`. Safe to re-run: each row is set to what is written here. docs/history/384.

A figure marked RECONSTRUCTED in its `examiner_note` is drawn from the row's own words and mark scheme, the paper's
exact layout not being in the library; the note says what was chosen and that the answer follows from the drawing.
"""
import io, json, os, sys

PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'questions.json')
REC = ' RECONSTRUCTED [complete-sats]: the paper itself was not in the library to copy from, so '


def f(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')


def svg(w, h, label, body):
    return '<svg viewBox="0 0 %s %s" role="img" aria-label="%s">%s</svg>' % (f(w), f(h), label, ''.join(body))


def grid(cols, rows, sq, ox, oy):
    out = []
    for i in range(cols + 1):
        out.append('<line x1="%s" y1="%s" x2="%s" y2="%s" class="grid"/>' % (f(ox + i * sq), f(oy), f(ox + i * sq), f(oy + rows * sq)))
    for j in range(rows + 1):
        out.append('<line x1="%s" y1="%s" x2="%s" y2="%s" class="grid"/>' % (f(ox), f(oy + j * sq), f(ox + cols * sq), f(oy + j * sq)))
    return out


def P(pts, sq, ox, oy, rows):
    """grid squares from the bottom-left, y up -> picture units"""
    return ' '.join('%s,%s' % (f(ox + x * sq), f(oy + (rows - y) * sq)) for x, y in pts)


def poly(pts, fill=False):
    return '<polygon points="%s" fill="%s" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' % (
        pts, 'currentColor" fill-opacity=".18' if fill else 'none')


def text(x, y, s, cls='num', anchor='middle', bold=False):
    s = '<tspan font-weight="700">%s</tspan>' % s if bold else s
    return '<text x="%s" y="%s" class="%s" style="text-anchor:%s">%s</text>' % (f(x), f(y), cls, anchor, s)


def line(x1, y1, x2, y2, w=2, dash=''):
    return '<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="currentColor" stroke-width="%s"%s/>' % (
        f(x1), f(y1), f(x2), f(y2), w, ' stroke-dasharray="%s"' % dash if dash else '')


def DA(d):
    return json.dumps(d, ensure_ascii=False, separators=(',', ':'))


ROWS = {}

# ---------- KS2 2024 PAPER 2 ----------
# Q1: the reflection. A right-angled triangle left of an upright mirror line, as the 2019 and Corbettmaths ones are drawn.
SQ, OX, OY, C, R = 26, 14, 28, 12, 8
tri = [(1, 2), (5, 2), (5, 5)]
img = [(11, 2), (7, 2), (7, 5)]
ROWS['Q-STA-KS2-2024-P2-1'] = dict(
    diagram=svg(340, OY + R * SQ + 14, 'A square grid 12 squares across and 8 down with an upright dashed mirror line down the middle. '
                'Left of it a right-angled triangle: its base 4 squares long on the 2nd line up, from 1 square in to 1 square from the mirror '
                'line, and its upright side 3 squares tall next to the mirror line.',
                grid(C, R, SQ, OX, OY) + [poly(P(tri, SQ, OX, OY, R), True),
                                          line(OX + 6 * SQ, OY - 8, OX + 6 * SQ, OY + R * SQ + 8, 2, '7 4'),
                                          text(OX + 6 * SQ, OY - 12, 'mirror line', 'cap', bold=True)]),
    diagram_by='family', html='<p>Draw the reflection of the triangle in the mirror line. Use a ruler.</p><!--fig-->',
    answer_type='drawing', needs_print='False', lead='',
    draw_answer=DA({'items': [{'k': 'segs', 'poly': [list(p) for p in img]}], 'marks': 1}),
    answer='<b>A triangle on the other side of the mirror line, the same distance from it</b> &mdash; its base 4 squares long on the 2nd '
           'line up, from 1 square right of the mirror line to 5 squares right, and its upright side 3 squares tall against the 1-square '
           'line. Each corner is as far from the mirror line as the corner it comes from, so the upright side, 1 square from the line on '
           'the left, is 1 square from it on the right. A copy slid across, not flipped, is the usual slip.',
    examiner_note='The row said only "a triangle on a grid with a mirror line".' + REC + 'the triangle and the line are placed as the '
                  'other KS2 reflections are (an upright line, a right-angled triangle a square off it). The marking follows the drawing: '
                  'the image is each corner reflected.')

# Q3: the bar graph. 25 points in all after 4 games.
OXg, BASE, U, PP = 46, 196, 20, 14
games = [7, 4, 8]
body = []
for j in range(13):
    body.append('<line x1="%s" y1="%s" x2="%s" y2="%s" class="grid"/>' % (OXg, f(BASE - j * PP), OXg + 13 * U, f(BASE - j * PP)))
    if j % 2 == 0:
        body.append(text(OXg - 6, BASE - j * PP + 4, str(j), 'num', 'end'))
body.append(line(OXg, BASE, OXg, BASE - 12 * PP - 6, 1.4))
body.append(line(OXg, BASE, OXg + 13 * U, BASE, 1.4))
for i in range(4):
    x = OXg + (1 + 3 * i) * U
    if i < 3:
        body.append('<rect x="%s" y="%s" width="%s" height="%s" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/>'
                    % (x, f(BASE - games[i] * PP), 2 * U, f(games[i] * PP)))
    body.append(text(x + U, BASE + 16, 'Game %d' % (i + 1)))
body.append(text(OXg + 8, BASE - 12 * PP - 2, 'Points', 'cap', 'start'))
ROWS['Q-STA-KS2-2024-P2-3'] = dict(
    diagram=svg(340, BASE + 26, 'A bar chart of points scored, the scale up the side going from 0 to 12 in 2s. Game 1: 7 points. Game 2: 4 '
                'points. Game 3: 8 points. Game 4: no bar drawn yet.', body),
    diagram_by='family', html='<p>Layla plays basketball. This graph shows how many points she scored in her first 3 games.</p>'
    '<p>After 4 games, Layla had scored a total of 25 points.</p><p>Complete the graph. Use a ruler.</p><!--fig-->',
    lead='', answer_type='drawing', needs_print='False',
    draw_answer=DA({'frame': {'o': [OXg, BASE], 'u': [U, -PP]}, 'items': [{'k': 'hist', 'x': [10, 12], 'h': [6]}], 'marks': 1}),
    answer='<b>A bar 6 points tall for Game 4</b> &mdash; 7 + 4 + 8 = 19 points in the first three games, and 25 &minus; 19 = 6. The bar '
           'sits in the space over Game 4 and its top is ruled level with 6 on the scale.',
    examiner_note='The row did not give games 1 to 3.' + REC + 'they are 7, 4 and 8 here, which leaves 6 for game 4 by the same sum '
                  'the paper asks for.')

# Q12: four 10 by 10 squares, each with a shape shaded.
def hundred(ox, oy, s, cells, name):
    b = grid(10, 10, s, ox, oy)
    for (cx, cy) in cells:
        b.append('<rect x="%s" y="%s" width="%s" height="%s" fill="currentColor" fill-opacity=".35"/>' % (f(ox + cx * s), f(oy + cy * s), f(s), f(s)))
    b.append('<rect x="%s" y="%s" width="%s" height="%s" fill="none" stroke="currentColor" stroke-width="1.6"/>' % (f(ox), f(oy), f(10 * s), f(10 * s)))
    b.append(text(ox + 5 * s, oy + 10 * s + 16, name, 'num', bold=True))
    return b

s12 = 13
shapes = {'W': [(c, r) for c in range(2, 3) for r in range(10)],           # 10 squares: a column
          'X': [(c, r) for c in range(10) for r in range(6, 10)],          # 40 squares: four rows
          'Y': [(4, 4)],                                                   # 1 square
          'Z': [(c, r) for c in range(5) for r in range(5)]}               # 25 squares: a 5 by 5 block
b12 = []
for k, (name, cells) in enumerate(sorted(shapes.items())):
    b12 += hundred(20 + (k % 2) * 165, 8 + (k // 2) * 160, s12, cells, name)
ROWS['Q-STA-KS2-2024-P2-12'] = dict(
    diagram=svg(340, 328, 'Four 10 by 10 squares of 100 small squares, each with a shape shaded. W: one column of 10 small squares. '
                'X: four rows, 40 small squares. Y: a single small square. Z: a 5 by 5 block, 25 small squares.', b12),
    diagram_by='family', lead='', answer_type='annotate', needs_print='False',
    html='<p>Each large square is made of 100 small squares.</p><!--fig--><p>Match each shape to the fraction of its large square '
         'that it covers: <sup>1</sup>&frasl;<sub>100</sub>, <sup>1</sup>&frasl;<sub>4</sub>, <sup>2</sup>&frasl;<sub>5</sub>, '
         '<sup>1</sup>&frasl;<sub>10</sub></p>',
    cells='W = 1/10|10/100 ; X = 2/5|40/100 ; Y = 1/100 ; Z = 1/4|25/100',
    answer='<b>W <sup>1</sup>&frasl;<sub>10</sub>, X <sup>2</sup>&frasl;<sub>5</sub>, Y <sup>1</sup>&frasl;<sub>100</sub>, Z '
           '<sup>1</sup>&frasl;<sub>4</sub></b> &mdash; count the small squares out of 100: 10 is a tenth, 40 is 4 tenths = 2 fifths, 1 is '
           'a hundredth and 25 is a quarter.',
    examiner_note='The row did not say how many small squares each shape covers.' + REC + 'each shape covers one of the four '
                  'fractions the question lists, one each; which letter has which is this drawing\'s.')

# Q18: the arrow on the scale (its figure is the row's own).
ROWS['Q-STA-KS2-2024-P2-18'] = dict(
    answer_type='drawing', needs_print='False',
    draw_answer=DA({'frame': 'vb', 'items': [{'k': 'scale', 'a': [34, 44], 'b': [306, 44], 'v': [1000, 2000], 'want': 1350, 'vtol': 20}], 'marks': 1}))

# Q21: four lines.
b21 = [line(40, 40, 200, 40), line(60, 110, 230, 110), line(270, 20, 270, 190), line(70, 190, 190, 140)]
for (x, y, s, a) in [(32, 44, 'A', 'end'), (208, 44, 'B', 'start'), (52, 114, 'C', 'end'), (238, 114, 'D', 'start'),
                     (270, 14, 'G', 'middle'), (270, 206, 'H', 'middle'), (62, 198, 'E', 'end'), (198, 140, 'F', 'start')]:
    b21.append(text(x, y, '<tspan class="lbl">%s</tspan>' % s, 'num', a))
ROWS['Q-STA-KS2-2024-P2-21'] = dict(
    diagram=svg(340, 214, 'Four straight lines. AB and CD are both level, one above the other. GH is upright, to the right. EF slopes '
                'up from E at the bottom left to F.', b21),
    diagram_by='family', lead='', answer_type='calculation', needs_print='False',
    html='<!--fig--><p>Tick all the correct statements.</p>',
    choices='AB is parallel to CD | GH is parallel to AB | CD is perpendicular to GH | EF is perpendicular to CD', choice_right='1,3',
    answer='<b>AB is parallel to CD</b> and <b>CD is perpendicular to GH</b> &mdash; AB and CD are both level, so they never meet; GH is '
           'upright, so it meets CD (or CD continued) at a right angle. GH is not parallel to AB, and EF slopes, so it is not at right '
           'angles to CD.',
    examiner_note='The row gave no direction for any line.' + REC + 'two statements are true of this drawing, as the paper\'s "tick all" '
                  'expects; which two is this drawing\'s.')

# Q25: the two missing numbers. As transcribed (3 x b - a = 2) a = 2 gives no whole b; 3 x a - b = 2 fits both given values.
ROWS['Q-STA-KS2-2024-P2-25'] = dict(
    figure='', lead='<table><thead><tr><th scope="col"><i>a</i></th><th scope="col"><i>b</i></th></tr></thead><tbody>'
                    '<tr><td>2</td><td>&#9744;</td></tr><tr><td>&#9744;</td><td>13</td></tr></tbody></table>',
    html='<p>Write the missing numbers so that 3 &times; <i>a</i> &minus; <i>b</i> = 2</p>',
    accept='b = 4, a = 5 | rule: count 2, at 1 eq 4, at 2 eq 5',
    answer='<b><i>b</i> = 4 and <i>a</i> = 5</b> &mdash; with <i>a</i> = 2: 3 &times; 2 = 6, and 6 &minus; 4 = 2. With <i>b</i> = 13: '
           '3 &times; <i>a</i> must be 15, so <i>a</i> = 5.',
    examiner_note='As transcribed the equation read 3 &times; b &minus; a = 2, which gives no whole number for b when a = 2. With the '
                  'letters the other way round (3 &times; a &minus; b = 2) both given values work, so the equation is written so here. '
                  '[complete-sats]')

# Q27: the beads.
ROWS['Q-STA-KS2-2024-P2-27'] = dict(mark_words='double|twice|two lots|2 lots|times 2|half|halve|same')

# ---------- KS2 2024 PAPER 3 ----------
# Q1: circles and rectangles with a fraction shaded.
import math
def pie_shaded(cx, cy, r, n, k):
    out = ['<circle cx="%s" cy="%s" r="%s" fill="none" stroke="currentColor" stroke-width="1.6"/>' % (cx, cy, r)]
    for i in range(k):
        a0, a1 = 2 * math.pi * i / n, 2 * math.pi * (i + 1) / n
        out.append('<path d="M%s %s L%s %s A%s %s 0 0 1 %s %s Z" fill="currentColor" fill-opacity=".35"/>' % (
            cx, cy, f(cx + r * math.sin(a0)), f(cy - r * math.cos(a0)), r, r, f(cx + r * math.sin(a1)), f(cy - r * math.cos(a1))))
    for i in range(n):
        a = 2 * math.pi * i / n
        out.append(line(cx, cy, cx + r * math.sin(a), cy - r * math.cos(a), 1.2))
    return out

def rect_shaded(x, y, w, h, n, k):
    out = []
    for i in range(n):
        out.append('<rect x="%s" y="%s" width="%s" height="%s" fill="%s" stroke="currentColor" stroke-width="1.2"/>' % (
            f(x + i * w / n), y, f(w / n), h, 'currentColor" fill-opacity=".35' if i < k else 'none'))
    return out

b31 = []
circ = [('A', 2, 1), ('B', 4, 3), ('C', 3, 1), ('D', 8, 2)]          # 1/2, 3/4, 1/3, 1/4
rect = [('P', 4, 1), ('Q', 2, 1), ('R', 6, 2), ('S', 8, 6)]          # 1/4, 1/2, 1/3, 3/4
for i, (nm, n, k) in enumerate(circ):
    cx = 48 + i * 81
    b31 += pie_shaded(cx, 52, 30, n, k)
    b31.append(text(cx, 102, nm, 'num', bold=True))
for i, (nm, n, k) in enumerate(rect):
    x = 14 + i * 81
    b31 += rect_shaded(x, 140, 68, 34, n, k)
    b31.append(text(x + 34, 194, nm, 'num', bold=True))
ROWS['Q-STA-KS2-2024-P3-1'] = dict(
    diagram=svg(340, 204, 'Four circles A to D and four rectangles P to S, each with a fraction shaded. A: one half. B: three quarters. '
                'C: one third. D: two eighths. P: one of 4 parts. Q: one of 2 parts. R: two of 6 parts. S: six of 8 parts.', b31),
    diagram_by='family', lead='', answer_type='annotate', needs_print='False',
    html='<p>These shapes have a fraction shaded.</p><!--fig--><p>Match each shaded fraction of a circle to the same shaded fraction of a rectangle.</p>',
    cells='A = Q ; B = S ; C = R ; D = P',
    answer='<b>A with Q, B with S, C with R, D with P</b> &mdash; A and Q are each a half; B is three quarters, and S is 6 of 8 = 3 '
           'quarters; C is a third, and R is 2 of 6 = a third; D is 2 of 8 = a quarter, and P is 1 of 4.',
    examiner_note='The row did not say which fraction each shape shows, and the paper\'s one match done already is not recorded.' + REC +
                  'the four fractions are a half, a quarter, a third and three quarters, two of them in equivalent forms as such '
                  'questions use; the matching follows from the drawing.')

# Q8: translate a shape 8 to the right. Axes x -7..7, y 0..8, numbered.
S8, O8x, O8y = 21, 170, 196
def xy8(x, y):
    return (O8x + x * S8, O8y - y * S8)
b8 = []
for x in range(-7, 8):
    b8.append('<line x1="%s" y1="%s" x2="%s" y2="%s" class="grid"/>' % (f(xy8(x, 0)[0]), f(xy8(0, 8)[1]), f(xy8(x, 0)[0]), f(O8y)))
    if x:
        b8.append(text(xy8(x, 0)[0], O8y + 14, ('&minus;%d' % -x) if x < 0 else str(x)))
for y in range(0, 9):
    b8.append('<line x1="%s" y1="%s" x2="%s" y2="%s" class="grid"/>' % (f(xy8(-7, 0)[0]), f(xy8(0, y)[1]), f(xy8(7, 0)[0]), f(xy8(0, y)[1])))
    if y:
        b8.append(text(O8x - 4, xy8(0, y)[1] + 4, str(y), 'num', 'end'))
b8.append(text(O8x - 4, O8y + 14, '0', 'num', 'end'))
b8.append(line(xy8(-7, 0)[0], O8y, xy8(7, 0)[0], O8y, 1.6))
b8.append(line(O8x, O8y, O8x, xy8(0, 8)[1], 1.6))
shape8 = [(-6, 1), (-3, 1), (-3, 3), (-4, 3), (-4, 6), (-6, 6)]
b8.append(poly(' '.join('%s,%s' % tuple(map(f, xy8(*p))) for p in shape8), True))
ROWS['Q-STA-KS2-2024-P3-8'] = dict(
    diagram=svg(340, 214, 'A coordinate grid, x from minus 7 to 7 and y from 0 to 8. A shaded L shape left of the y-axis, its corners at '
                '(minus 6, 1), (minus 3, 1), (minus 3, 3), (minus 4, 3), (minus 4, 6) and (minus 6, 6).', b8),
    diagram_by='family', lead='', answer_type='drawing', needs_print='False',
    html='<p>Here is a shape.</p><!--fig--><p>Draw the shape after it is translated 8 units to the right. Use a ruler.</p>',
    draw_answer=DA({'items': [{'k': 'segs', 'poly': [[x + 8, y] for x, y in shape8]}], 'marks': 1}),
    answer='<b>The same L shape with its corners at (2, 1), (5, 1), (5, 3), (4, 3), (4, 6) and (2, 6)</b> &mdash; add 8 to every x and '
           'keep every y. A translation slides the shape: same size, same way up.',
    examiner_note='The row gave the axes but not the shape.' + REC + 'the shape is an L whose corners are on grid points left of the '
                  'y-axis, so its image 8 to the right is on the grid too.')

# Q10: the quadrilateral ABCD. (b) the angle at D survives the screen; (a) a perimeter in mm needs a ruler on paper (print).
S10 = 34
A_, B_, C_, D_ = (40, 190), (40 + 7 * S10, 190), (40 + 7 * S10, 190 - 4 * S10), (40 + 3 * S10, 190 - 4 * S10)
b10 = [poly(' '.join('%s,%s' % (f(p[0]), f(p[1])) for p in (A_, B_, C_, D_)))]
for p, nm, dx, dy in [(A_, 'A', -8, 14), (B_, 'B', 8, 14), (C_, 'C', 8, -4), (D_, 'D', -6, -8)]:
    b10.append(text(p[0] + dx, p[1] + dy, '<tspan class="lbl">%s</tspan>' % nm))
b10.append('<path d="M%s %s A16 16 0 0 1 %s %s" fill="none" stroke="currentColor" stroke-width="1.2"/>' % (
    f(D_[0] + 16), f(D_[1]), f(D_[0] - 16 * 0.6), f(D_[1] + 16 * 0.8)))
b10.append(text(D_[0] + 6, D_[1] + 30, '<tspan class="lbl">d</tspan>'))
ROWS['S-P-STA-KS2-2024-P3-q10'] = dict(
    html='<p>Here is a quadrilateral ABCD.</p><!--fig-->',
    diagram=svg(340, 210, 'A quadrilateral ABCD: AB along the bottom, BC straight up from B, CD level back to the left, and DA sloping '
                'down to A. Angle d is the angle inside the shape at D.', b10),
    diagram_by='family',
    examiner_note='The row said only "a quadrilateral ABCD printed on the page".' + REC + 'it is drawn with right angles at B and C and '
                  'a slope from D to A of 3 across and 4 down, so angle d is 180&deg; &minus; 53&deg; = 127&deg; on any screen.')
ROWS['Q-STA-KS2-2024-P3-10b'] = dict(
    needs_print='False', accept='125 to 129',
    answer='<b>127&deg;</b> (125&deg; to 129&deg;) &mdash; an obtuse angle, between 90&deg; and 180&deg;: read the scale that starts at '
           '0 on DC. The common slip is reading the other scale and writing 53&deg;.')

# Q14: the pie chart (its figure is the row's own).
ROWS['Q-STA-KS2-2024-P3-14'] = dict(
    answer_type='drawing', needs_print='False',
    draw_answer=DA({'loose': True, 'frame': 'vb', 'items': [{'k': 'pie', 'c': [170, 106], 'r': 86, 'given': [0, 72, 162],
                    'sect': [72, 90, 54, 108, 36], 'atol': 3, 'm': 2,
                    'or': {'k': 'pie', 'c': [170, 106], 'r': 86, 'given': [0, 72, 162], 'sect': [72, 90, 54, 108, 36], 'atol': 3, 'need': 3, 'm': 1}}],
                    'marks': 2}))

# Q16: a whole number strictly between 60 and 70.
ROWS['Q-STA-KS2-2024-P3-16'] = dict(accept='65 | rule: count 1, each over 60 under 70 mult 1')

# Q20: four shapes; which have only two acute angles.
b20 = []
def shp(pts, nm, lx, ly):
    b20.append(poly(' '.join('%s,%s' % (f(x), f(y)) for x, y in pts)))
    b20.append(text(lx, ly, nm, 'num', bold=True))
shp([(20, 40), (130, 40), (130, 100), (20, 100)], 'A', 75, 122)                 # rectangle: no acute angles
shp([(190, 100), (310, 100), (190, 30)], 'B', 250, 122)                         # right-angled triangle: two acute
shp([(40, 200), (140, 200), (110, 150), (10, 150)], 'C', 75, 222)              # parallelogram: two acute, two obtuse
shp([(200, 205), (300, 205), (250, 140)], 'D', 250, 222)                        # acute triangle: three acute
ROWS['Q-STA-KS2-2024-P3-20'] = dict(
    diagram=svg(340, 232, 'Four shapes. A: a rectangle. B: a right-angled triangle. C: a parallelogram leaning to the right. D: a '
                'triangle with all three angles acute.', b20),
    diagram_by='family', lead='', needs_print='False',
    html='<p>Here are four shapes.</p><!--fig--><p>Write the letters of all the shapes that have <b>only two</b> acute angles.</p>',
    accept='B, C',
    answer='<b>B and C</b> &mdash; B\'s right angle leaves two acute angles; C, a parallelogram, has two acute and two obtuse. A has '
           'four right angles and none acute; D has three acute angles, one too many.',
    examiner_note='The row said only "four shapes A, B, C and D on a grid".' + REC + 'the four shapes are the kinds such a question '
                  'sets side by side (no acute angle, exactly two, three); the answer follows from the drawing.')

# Q24: the fractions.
ROWS['Q-STA-KS2-2024-P3-24'] = dict(mark_words='5/12+7/24|10/24+7/24|5/12+third|10/24+7')

# ---------- KS2 2019 ----------
ROWS['Q-STA-KS2-2019-P2-4'] = dict(draw_answer=DA({'items': [{'k': 'segs', 'poly': [[5, 7], [3, 7], [3, 2], [6, 2], [4, 4]]}], 'marks': 1}))
ROWS['Q-STA-KS2-2019-P2-11a'] = dict(accept='0.25 | 0.25 kg | rule: count 1, decimal, each eq 0.25', answer_type='calculation',
    answer='<b>0.25 kg</b> &mdash; a quarter of 1 is 0.25. The scheme refuses <sup>1</sup>&frasl;<sub>4</sub> and any other fraction: the '
           'question asks for a decimal, so the box is marked by the digits written, not by the value.')
ROWS['Q-STA-KS2-2019-P2-13'] = dict(draw_answer=DA({'frame': 'vb', 'items': [{'k': 'polygon', 'n': 3, 'sas': [8, 5.6, 90], 'sim': True}],
                                                   'eg': [[[40, 250], [280, 250], [280, 82], [40, 250]]], 'marks': 2}))
ROWS['Q-STA-KS2-2019-P2-18b'] = dict(mark_words='3+5|3+29+19|29+19|three+five|29+5|3+19')
cuts = [[[221, 10, 221, 180], [221, 78, 289, 78]], [[221, 10, 221, 180], [221, 112, 289, 112]],
        [[119, 10, 119, 180], [51, 78, 119, 78]], [[119, 10, 119, 180], [51, 112, 119, 112]]]
ROWS['Q-STA-KS2-2019-P2-21'] = dict(draw_answer=DA({'frame': 'vb', 'sq': 34, 'items': [{'k': 'any', 'of': [{'k': 'segs', 'at': c} for c in cuts]}], 'marks': 1}))
ROWS['Q-STA-KS2-2019-P3-10a'] = dict(draw_answer=DA({'items': [{'k': 'segs', 'at': [[-1, 2, -2, 3], [-1, 2, 1, 2]]}], 'marks': 1}))
ROWS['Q-STA-KS2-2019-P3-10b'] = dict(draw_answer=DA({'items': [{'k': 'segs', 'poly': [[2, 3], [3, -2], [5, 2], [3, 2]]}], 'marks': 1}))
ROWS['Q-STA-KS2-2019-P3-13'] = dict(mark_words='still+acute|stay+acute|remain+acute|is+acute|be+acute|right+angle|45')
ROWS['Q-STA-KS2-2019-P3-17'] = dict(accept='x = 8, y = 6 | x = 6, y = 7 | x = 4, y = 8 | x = 2, y = 9')
ROWS['Q-STA-KS2-2019-P3-21a'] = dict(accept='(55, 30)')
ROWS['Q-STA-KS2-2019-P3-21b'] = dict(accept='(55, 14)')
ROWS['Q-STA-KS2-2019-P3-23'] = dict(mark_words='three+times|3+times|200+3|640|160|3+200')

# ---------- KS1 2026 PAPER 2 ----------
ROWS['Q-STA-KS1-2026-P2-14'] = dict(draw_answer=DA({'frame': 'vb', 'sq': 34, 'items': [{'k': 'segs', 'at': [[95, 112, 231, 112]], 'move': 'x'}], 'marks': 1}))
ROWS['Q-STA-KS1-2026-P2-22'] = dict(accept='4, 9 | 5, 8 | 6, 7')
ROWS['Q-STA-KS1-2026-P2-22b'] = dict(accept='4, 9 | 5, 8 | 6, 7')
ROWS['Q-STA-KS1-2026-P2-26'] = dict(draw_answer=DA({'frame': 'vb', 'sq': 20, 'items': [{'k': 'cells', 'rects': [[173, 190 - 20 * (i + 1), 20, 20] for i in range(8)], 'set': [[0, 1]]}], 'marks': 1}))
ROWS['Q-STA-KS1-2026-P2-27'] = dict(accept='10p, 10p, 5p, 2p | 20p, 5p, 1p, 1p')

# ---------- KS2 2025 GPS PAPER 1 ----------
def ch(choices, right, **kw):
    d = dict(choices=' | '.join(choices), choice_right=right, surface='', **kw)
    return d

ROWS['Q-STA-KS2-2025-GPS1-3'] = ch(['after <i>Have</i>', 'after <i>lunch</i>, inside the inverted commas', 'after the closing inverted commas',
                                    'after <i>Hannah</i>'], '2', needs_print='False')
ROWS['Q-STA-KS2-2025-GPS1-5'] = ch(['We lifted up the log, and found worms woodlice snails and slugs.', 'We lifted up the log and found worms, woodlice, snails and slugs.',
                                    'We lifted up the log and found, worms woodlice, snails and slugs.', 'We lifted, up the log and found worms woodlice snails, and slugs.'], '2')
ROWS['Q-STA-KS2-2025-GPS1-8'] = ch(['We have been learning; about the Vikings they were a fascinating civilisation.', 'We have been learning about the Vikings; they were a fascinating civilisation.',
                                    'We have been learning about the Vikings they were; a fascinating civilisation.', 'We have; been learning about the Vikings they were a fascinating civilisation.'], '2')
ROWS['Q-STA-KS2-2025-GPS1-10'] = ch(['Our class visited (a castle the oldest) in the country to help us with our history project.', 'Our class visited a castle (the oldest in the country) to help us with our history project.',
                                     'Our class (visited a castle) the oldest in the country to help us with our history project.', 'Our class visited a castle the oldest in the country (to help us with our history project).'], '2')
ROWS['Q-STA-KS2-2025-GPS1-15'] = ch(['We saw various animals: on our evening walk badgers, foxes, mice and an owl.', 'We saw: various animals on our evening walk badgers, foxes, mice and an owl.',
                                     'We saw various animals on our evening walk: badgers, foxes, mice and an owl.', 'We saw various animals on our evening walk badgers, foxes: mice and an owl.'], '3')
ROWS['Q-STA-KS2-2025-GPS1-16'] = ch(['crumbling', 'castle', 'stood', 'high', 'rocky', 'hill', 'views', 'countryside', 'glorious'], '1,5,9')
ROWS['Q-STA-KS2-2025-GPS1-17'] = ch(['Swimming, which strengthens muscles in the arms and legs is great exercise.', 'Swimming which strengthens muscles, in the arms and legs, is great exercise.',
                                     'Swimming, which strengthens muscles in the arms and legs, is great exercise.', 'Swimming which strengthens muscles in the arms, and legs, is great exercise.'], '3',
                                    html='<p>Which sentence is punctuated correctly?</p><p>Tick <b>one</b>.</p>')
ROWS['Q-STA-KS2-2025-GPS1-18'] = dict(accept='who lives on a farm | that lives on a farm | who lives on the farm')
ROWS['Q-STA-KS2-2025-GPS1-23'] = ch(['I must repair &ndash; my backpack the zip is broken and I need it for our camping trip.', 'I must repair my backpack &ndash; the zip is broken and I need it for our camping trip.',
                                     'I must repair my backpack the zip is broken &ndash; and I need it for our camping trip.', 'I must repair my backpack the zip &ndash; is broken and I need it for our camping trip.'], '2')
ROWS['Q-STA-KS2-2025-GPS1-28'] = dict(mark_words='kate+ravi+player|kate+ravi+other|who+excited|both')
ROWS['Q-STA-KS2-2025-GPS1-30'] = ch(['At the museum, we enjoyed dressing-up in the old fashioned costumes and fancy hats.', 'At the museum, we enjoyed dressing up in the old-fashioned costumes and fancy hats.',
                                     'At the museum, we enjoyed dressing up in the old fashioned costumes and fancy-hats.', 'At the museum, we enjoyed dressing up in the old fashioned-costumes and fancy hats.'], '2')
ROWS['Q-STA-KS2-2025-GPS1-31'] = ch(['&ldquo;I think it is over here!&rdquo; shouted Reena, pointing at the map. &ldquo;Follow me!&rdquo;', '&ldquo;I think it is over here! shouted Reena, pointing at the map. Follow me!&rdquo;',
                                     '&ldquo;I think it is over here!&rdquo; shouted Reena, &ldquo;pointing at the map. Follow me!&rdquo;', 'I think it is over here! &ldquo;shouted Reena, pointing at the map.&rdquo; Follow me!'], '1')
ROWS['Q-STA-KS2-2025-GPS1-33'] = dict(mark_words='raheem+spoken|raheem+speak|raheem+talk|raheem+ask|raheem+being+call|speaking+raheem|talking+raheem|asking+raheem|addressed')
ROWS['Q-STA-KS2-2025-GPS1-34'] = ch(['After her dance class', 'Jamila has a strawberry milkshake', 'which she buys from the local cafe'], '3')
ROWS['Q-STA-KS2-2025-GPS1-35'] = ch(['trained', 'hard', 'before', 'hockey', 'Concentrating', 'intensely', 'hit', 'into', 'net'], '3,8')
ROWS['Q-STA-KS2-2025-GPS1-37'] = dict(accept='The treasure was stolen. | The treasure was stolen by someone.')
ROWS['Q-STA-KS2-2025-GPS1-39'] = ch(['played', 'piano', 'great', 'confidence', 'rarely', 'made', 'mistakes'], '2,4,7')
ROWS['Q-STA-KS2-2025-GPS1-42'] = ch(['This year, we have been on a number of school trips. My favourite was to the Science Museum because we saw some incredible experiments. However, Elise preferred our visit to Colchester Castle.',
                                     'This year, we have been on a number of school trips, my favourite was to the Science Museum. Because we saw some incredible experiments however, Elise preferred our visit to Colchester Castle.',
                                     'This year. We have been on a number of school trips my favourite was to the Science Museum because we saw some incredible experiments. However, Elise preferred our visit to Colchester Castle.',
                                     'This year, we have been on a number of school trips. my favourite was to the Science Museum because we saw some incredible experiments. however, Elise preferred our visit to Colchester Castle.'], '1')
ROWS['Q-STA-KS2-2025-GPS1-43'] = dict(accept='The council maintains the local park.')
ROWS['Q-STA-KS2-2025-GPS1-44'] = ch(['Dad', 'me', 'Mum&rsquo;s', 'favourite', 'his', 'cricket', 'Tennis', 'Karen&rsquo;s', 'mine', 'football'], '5,9')
ROWS['Q-STA-KS2-2025-GPS1-45'] = ch(['Since', 'Billy', 'started', 'he', 'going', 'every', 'and', 'sometimes', 'too', 'if', 'his', 'take'], '1,7,10')
ROWS['Q-STA-KS2-2025-GPS1-46'] = ch(['If', 'I', 'were', 'help', 'would', 'start', 'clearing'], '3')
ROWS['Q-STA-KS2-2025-GPS1-47'] = ch(['There', 'are', 'some', 'biscuits', 'in', 'this', 'tin', 'but', 'not', 'any', 'chocolate', 'ones'], '3,6,10')
ROWS['Q-STA-KS2-2025-GPS1-49'] = ch(['Although', 'Jane', 'was', 'speedy', 'runner', 'she', 'almost', 'beaten', 'race'], '7')


def main():
    lines = io.open(PATH, encoding='utf-8').read().split('\n')
    done = set()
    for i, ln in enumerate(lines):
        s = ln.rstrip()
        if not s.startswith('{'):
            continue
        comma = s.endswith(',')
        body = s[:-1] if comma else s
        rid = json.loads(body).get('row_id')
        if rid not in ROWS:
            continue
        row = json.loads(body)
        for k, v in ROWS[rid].items():
            if v == '' and k in ('surface', 'lead', 'figure'):
                row.pop(k, None)
            else:
                row[k] = v
        lines[i] = json.dumps(row, ensure_ascii=False, separators=(',', ':')) + (',' if comma else '')
        done.add(rid)
    miss = set(ROWS) - done
    if miss:
        sys.exit('rows not found: ' + ', '.join(sorted(miss)))
    io.open(PATH, 'w', encoding='utf-8').write('\n'.join(lines))
    print('complete-sats: %d rows set' % len(done))


if __name__ == '__main__':
    main()
