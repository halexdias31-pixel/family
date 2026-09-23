"""Every figure AQA prints on Chemistry 8462/1F, June 2024, drawn.

REPORTED WHILE SOMEBODY WAS SITTING THE PAPER: "there are already places where there are no
diagrams like question 1a and so on... i want it to be a replica of the actual exam." 01.1 is
four boxes of atoms and the question is *which box is a pure compound* — a question about a
picture you cannot see is not a question, which is the fault CLAUDE.md records under "on the app
it's just text".

MEASURED OFF THE PAPER, NOT WRITTEN FROM THE PROSE. Every figure in this paper is an embedded
raster PNG with no text layer and no vectors, so the four that CARRY DATA were read in pixels —
CLAUDE.md's rule for a picture that decides an answer:

  Figure 1   every atom's centre and fill, split out of the touching molecules by a distance
             transform: A 12 atoms, B 6, C 10, D 12
  Figure 5   the three numbered burette ticks at y = 199, 327, 455.5 px and the meniscus at
             275.5 -> 16 + 76.5/128 = 16.60, which is one of the four options and no other
  Figure 6   the numbered gridlines, then the ink in each plotted column
  Figure 7   the crosses found as connected components, the one on the axis read separately

WHAT IS DELIBERATELY NOT DRAWN IS FIGURE 8: a hand with a dressing on it, answered entirely from
Table 2 beside it. It keeps its `figure` so `check-library.js` still counts it — the line this
file draws everywhere between a picture the row's own words determine and an illustration.
"""

import json, pathlib, re, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import W, axes, scatter

FILE = pathlib.Path(__file__).resolve().parent.parent / 'data/questions.json'
ID = 'Q-AQA-8462-2406-1F-%s'

def svg(h, body, label):
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>' % (W, h, label, body))

def t(x, y, s, cls='lbl', extra=''):
    return '<text x="%.1f" y="%.1f" class="%s"%s>%s</text>' % (x, y, cls, extra, s)

def line(x1, y1, x2, y2, w=1.4, dash=''):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
            'stroke-width="%s" %s/>' % (x1, y1, x2, y2, w, 'stroke-dasharray="4 3"' if dash else ''))

def rect(x, y, w, h, fill='none', sw=1.4, rx=0):
    return ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="%s" stroke="currentColor" '
            'stroke-width="%s" rx="%s"/>' % (x, y, w, h, fill, sw, rx))

def circ(cx, cy, r, fill='none', sw=1.3):
    return ('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s" stroke="currentColor" '
            'stroke-width="%s"/>' % (cx, cy, r, fill, sw))

def path(d, fill='none', sw=1.4):
    return '<path d="%s" fill="%s" stroke="currentColor" stroke-width="%s"/>' % (d, fill, sw)

WASH = 'currentColor" fill-opacity=".14'      # the one fill this paper's glassware uses


# ── FIGURE 1 ──────────────────────────────────────────────────────────────────────────────────
# The atoms as measured, in the source image's own pixels (box interiors are 342 x 309 each), so
# a mis-typed coordinate is a mis-typed coordinate rather than a different molecule. Fill is what
# the pixels under each centre actually were: white, grey or black.
FIG1 = {
    'A': [('w', 79, 65), ('b', 116, 65), ('w', 152, 65),          # white-black-white
          ('g', 214, 99), ('w', 245, 119), ('g', 275, 139),       # grey-white-grey
          ('w', 214, 194), ('b', 245, 215), ('w', 275, 235),      # white-black-white
          ('g', 65, 243), ('w', 101, 243), ('g', 138, 243)],      # grey-white-grey
    'B': [('w', 75, 88), ('w', 65, 123),                          # a pair of white atoms
          ('b', 263, 63),                                         # a lone black atom
          ('b', 81, 243),                                         # a lone black atom
          ('w', 276, 210), ('w', 241, 224)],                      # a pair of white atoms
    'C': [('g', 72, 61), ('w', 103, 81), ('g', 134, 102),         # grey-white-grey
          ('w', 239, 107), ('w', 228, 143),                       # a pair of white atoms
          ('w', 77, 203), ('w', 108, 224),                        # a pair of white atoms
          ('g', 193, 247), ('w', 229, 247), ('g', 266, 247)],     # grey-white-grey
    'D': [('w', 68, 64), ('b', 104, 64), ('w', 141, 64),
          ('w', 277, 65), ('b', 250, 90), ('w', 223, 115),
          ('w', 60, 172), ('b', 74, 206), ('w', 89, 240),
          ('w', 186, 203), ('b', 217, 224), ('w', 247, 244)],
}
# What each box IS, which is what 01.1 and 01.2 are asking. Asserted below rather than trusted.
FIG1_IS = {'A': 'two compounds', 'B': 'two elements', 'C': 'element + compound',
           'D': 'pure compound'}

def fig1():
    """Four boxes side by side. The source boxes are square-ish and 342 px across; four of them
    across a 340-unit viewBox is 76 each, so every atom keeps its position in its own box."""
    BW, GAP, X0, Y0 = 72, 12, 6, 10           # 4x72 + 3x12 + 2x6 = 336, so D is not clipped
    R = 4.4                                     # 19.5 px of 342 -> 4.1 of 72; nudged to touch
    # NOT `#fff` FOR THE WHITE ATOM. This app has two palettes and a drawing takes the page's own
    # ink -- a literal white disc is white on cream, and a literal black one is black on black.
    # Outline, 45% and solid read as three different atoms on either ground.
    FILLS = {'w': 'none', 'g': 'currentColor" fill-opacity=".55', 'b': 'currentColor'}
    out = []
    for i, key in enumerate('ABCD'):
        bx = X0 + i * (BW + GAP)
        out.append(rect(bx, Y0, BW, BW, sw=1.1))
        # bonds first, so an outline is never painted over
        atoms = [(f, bx + x * BW / 342.0, Y0 + y * BW / 309.0) for f, x, y in FIG1[key]]
        for j, (f1, x1, y1) in enumerate(atoms):
            for f2, x2, y2 in atoms[j + 1:]:
                if (x1 - x2) ** 2 + (y1 - y2) ** 2 < (R * 2.4) ** 2:
                    out.append(line(x1, y1, x2, y2, w=1))
        for f, x, y in atoms:
            out.append(circ(x, y, R, FILLS[f], sw=1))
        out.append(t(bx + BW / 2.0, Y0 + BW + 15, key))
    key_y = Y0 + BW + 34
    out += [circ(18, key_y - 4, R, FILLS['g'], sw=1), circ(34, key_y - 4, R, FILLS['b'], sw=1),
            t(50, key_y, 'and', 'cap', ' style="text-anchor:start"'),
            circ(78, key_y - 4, R, FILLS['w'], sw=1),
            t(90, key_y, 'represent different types of atom.', 'cap',
              ' style="text-anchor:start"')]
    return svg(key_y + 10, ''.join(out), 'Figure 1: four boxes of atoms and molecules, A to D')


# ── FIGURE 2 ──────────────────────────────────────────────────────────────────────────────────
def fig2():
    """The periodic table as an outline in four sections, which is the whole question: A is the
    tall block on the left, B the wide block through the middle, C the block left of the zig-zag
    on the right and D the block above and right of it. Drawn as one outer frame with three
    internal walls, because that is what AQA prints -- not four separate boxes."""
    C, R, X0, Y0 = 15.0, 22.0, 26, 18
    x = lambda c: X0 + c * C
    y = lambda r: Y0 + r * R
    out = []
    # ONE silhouette, corner by corner, clockwise from the top-left of block A
    pts = [(0, 0), (2, 0), (2, 1), (11, 1), (11, 0.35), (14, 0.35), (14, -0.6), (18, -0.6),
           (18, 4), (0, 4)]
    out.append('<path d="M%s Z" fill="none" stroke="currentColor" stroke-width="1.3"/>'
               % ' L'.join('%g %g' % (x(c), y(r)) for c, r in pts))
    out.append(line(x(2), y(1), x(2), y(4), w=1.2))          # A from B
    out.append(line(x(11), y(0.4), x(11), y(4), w=1.2))      # B from the right-hand block
    # the zig-zag between C and D, down and across, as the paper prints it
    d = 'M%g %g' % (x(11), y(1.1))
    for c, r in [(12, 1.1), (12, 2.0), (14, 2.0), (14, 3.0), (16, 3.0), (16, 4)]:
        d += ' H%g V%g' % (x(c), y(r))
    out.append(path(d, sw=1.2))
    out += [t(x(1), y(2.4), 'A'), t(x(6.5), y(3.2), 'B'),
            t(x(13), y(3.4), 'C'), t(x(16.9), y(1.4), 'D')]
    return svg(y(4) + 14, ''.join(out), 'Figure 2: an outline periodic table in four sections')


# ── QUESTION 01.5, the dot-and-cross ──────────────────────────────────────────────────────────
def q15():
    """What the paper actually prints, which is NOT what the row said. The transcription read it
    as *the charges to be shown*; the paper prints the charges already -- a `+` outside the
    potassium bracket and a `-` outside the chloride one -- and what the student completes is the
    ELECTRONS on the two ions. Getting that backwards tells somebody to do the one part of the
    question that is already done for them."""
    import math
    out = []
    def mark(cx, cy, r, ang, kind):
        px, py = cx + r * math.cos(math.radians(ang)), cy + r * math.sin(math.radians(ang))
        if kind == 'dot':
            return '<circle cx="%.1f" cy="%.1f" r="2.2" fill="currentColor"/>' % (px, py)
        return (line(px - 2.6, py - 2.6, px + 2.6, py + 2.6, w=1.3)
                + line(px - 2.6, py + 2.6, px + 2.6, py - 2.6, w=1.3))
    # the two atoms, complete, as the paper draws them
    out += [circ(80, 44, 27, sw=1.3), t(80, 49, 'K'), mark(80, 44, 27, 270, 'dot')]
    out += [circ(210, 44, 27, sw=1.3), t(210, 49, 'Cl')]
    for a in (250, 290, 330, 30, 70, 110, 190):
        out.append(mark(210, 44, 27, a, 'x'))
    out += [t(80, 88, 'Potassium atom', 'cap'), t(210, 88, 'Chlorine atom', 'cap')]
    out += [line(145, 100, 145, 126), path('M141 126 L149 126 L145 134 Z', fill='currentColor')]
    # the ions: the brackets and the charges are printed, the shells are empty to be completed
    for cx, sym, chg in ((80, 'K', '+'), (210, 'Cl', '&#8722;')):
        out += [circ(cx, 172, 27, sw=1.3), t(cx, 177, sym),
                path('M%g 140 h-9 v64 h9' % (cx - 34), sw=1.3),
                path('M%g 140 h9 v64 h-9' % (cx + 34), sw=1.3),
                t(cx + 48, 150, chg, 'num')]
    out += [t(80, 218, 'Potassium ion', 'cap'), t(210, 218, 'Chloride ion', 'cap')]
    return svg(228, ''.join(out), 'A dot and cross diagram to complete: a potassium atom and a '
                                  'chlorine atom above their two ions')


# ── GLASSWARE, drawn once and used by three figures ───────────────────────────────────────────
# Figure 3 wants a conical flask and a beaker, Figure 4 wants the conical flask again, and
# Figure 14 wants the beaker again. Two descriptions of one object is the `.reel .over` fault
# CLAUDE.md records, so each shape is a function and the figures call it.

def conical(cx, top, w, h, fill=0.0):
    """A conical flask: a narrow neck, sloping shoulders, a flat base."""
    nw, bw = w * 0.16, w * 0.5
    d = ('M%.1f %.1f v%.1f L%.1f %.1f h%.1f L%.1f %.1f v%.1f'
         % (cx - nw, top, h * 0.34, cx - bw, top + h, bw * 2, cx + nw, top + h * 0.34, -h * 0.34))
    out = [path(d)]
    if fill:
        y = top + h * (1 - fill)
        y = max(y, top + h * 0.34)
        frac = (top + h - y) / (h * 0.66)
        half = nw + (bw - nw) * frac
        out.append('<path d="M%.1f %.1f L%.1f %.1f h%.1f L%.1f %.1f Z" fill="%s"/>'
                   % (cx - half, y, cx - bw, top + h, bw * 2, cx + half, y, WASH))
    return ''.join(out)

def beaker(cx, top, w, h, fill=0.0):
    out = [path('M%.1f %.1f v%.1f h%.1f v%.1f' % (cx - w / 2, top, h, w, -h))]
    if fill:
        y = top + h * (1 - fill)
        out.append(rect(cx - w / 2 + 1, y, w - 2, h - (y - top) - 1, WASH, sw=0))
    return ''.join(out)


# ── FIGURE 3 ──────────────────────────────────────────────────────────────────────────────────
def fig3():
    """Four sets of apparatus, A to D. 01.6 asks which collects water from salty water and 01.7
    which shows filtration, so the four pictures ARE the two questions.

    THE LABEL COLUMN IS DECLARED, NOT LEFT TO CHANCE. The first version let each leader line run
    to wherever the word started and `Condenser` went off the right edge of the drawing -- which
    `check/cards.js` cannot see, because nothing inside an `<svg>` can push the page sideways and
    it is clipped instead. Every box keeps `LW` units for its words and the apparatus gets the
    rest, so a longer label wraps the layout rather than vanishing."""
    BW, BH, LW, X0, Y0, GX, GY = 160, 104, 66, 4, 8, 12, 30
    out, boxes = [], {}
    for i, key in enumerate('ABCD'):
        bx, by = X0 + (i % 2) * (BW + GX), Y0 + (i // 2) * (BH + GY)
        boxes[key] = (bx, by)
        out.append(rect(bx, by, BW, BH, sw=1))
        out.append(t(bx + BW / 2.0, by + BH + 15, key))

    def lab(bx, by, fx, fy, text, ty):
        """A leader from the apparatus to the label column this box reserves."""
        lx = bx + BW - LW
        return (line(fx, fy, lx - 3, ty - 3, w=.7)
                + t(lx, ty, text, 'cap', ' style="text-anchor:start"'))

    # A -- a filter funnel standing in a conical flask
    bx, by = boxes['A']
    cx = bx + 46
    out += [path('M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f'
                 % (cx - 25, by + 12, cx - 3.5, by + 40, cx + 3.5, by + 40, cx + 25, by + 12)),
            line(cx - 25, by + 12, cx + 25, by + 12, w=1.2),
            '<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" fill="%s"/>'
            % (cx - 18, by + 20, cx - 3.5, by + 39, cx + 3.5, by + 39, cx + 18, by + 20, WASH),
            line(cx - 3.5, by + 40, cx - 3.5, by + 50, w=1.4),
            line(cx + 3.5, by + 40, cx + 3.5, by + 50, w=1.4),
            conical(cx, by + 44, 54, 56),
            lab(bx, by, cx + 14, by + 20, 'Mixture', by + 24)]

    # B -- distillation
    bx, by = boxes['B']
    fx, fy = bx + 30, by + 62
    out += [circ(fx, fy, 19, sw=1.4),
            '<path d="M%.1f %.1f a19 19 0 0 0 38 0 Z" fill="%s"/>' % (fx - 19, fy, WASH),
            line(fx - 6, by + 34, fx - 6, by + 44, w=1.4),
            line(fx + 6, by + 34, fx + 6, by + 44, w=1.4),
            rect(fx - 6.5, by + 34, 13, 5, 'currentColor" fill-opacity=".35', sw=.8),
            line(fx, by + 18, fx, by + 36, w=1.8),
            path('M%.1f %.1f L%.1f %.1f' % (fx + 6, by + 40, bx + 78, by + 62)),
            path('M%.1f %.1f L%.1f %.1f' % (fx + 9, by + 34, bx + 82, by + 56)),
            line(bx + 80, by + 59, bx + 80, by + 68, w=1.4),
            conical(bx + 88, by + 66, 34, 38),
            lab(bx, by, fx + 1, by + 22, 'Thermometer', by + 22),
            lab(bx, by, bx + 60, by + 50, 'Condenser', by + 44),
            t(bx + 6, by + 98, 'Heat', 'cap', ' style="text-anchor:start"'),
            line(fx, by + 97, fx, by + 86, w=.9),
            path('M%.1f %.1f l4 7 l-8 0 Z' % (fx, by + 83), fill='currentColor')]

    # C -- chromatography
    bx, by = boxes['C']
    cx = bx + 46
    out += [beaker(cx, by + 20, 58, 76, fill=0.16),
            line(cx - 17, by + 14, cx + 17, by + 14, w=1),
            rect(cx - 10, by + 14, 20, 68, sw=1.1),
            '<circle cx="%.1f" cy="%.1f" r="3" fill="currentColor"/>' % (cx, by + 74),
            lab(bx, by, cx + 8, by + 34, 'Paper', by + 30),
            lab(bx, by, cx + 1, by + 74, 'Mixture', by + 54),
            lab(bx, by, cx + 26, by + 86, 'Solvent', by + 78)]

    # D -- an evaporating basin on a tripod
    bx, by = boxes['D']
    cx = bx + 46
    out += ['<path d="M%.1f %.1f a30 18 0 0 0 48 0" fill="%s" stroke="currentColor" '
            'stroke-width="1.4"/>' % (cx - 24, by + 32, WASH),
            line(cx - 28, by + 30, cx + 28, by + 30, w=1.2),
            rect(cx - 32, by + 46, 64, 5, 'currentColor" fill-opacity=".2'),
            line(cx - 29, by + 51, cx - 36, by + 92), line(cx + 29, by + 51, cx + 36, by + 92),
            line(cx, by + 51, cx, by + 92),
            lab(bx, by, cx + 16, by + 34, 'Mixture', by + 34),
            t(bx + 6, by + 98, 'Heat', 'cap', ' style="text-anchor:start"'),
            line(cx, by + 97, cx, by + 60, w=.9),
            path('M%.1f %.1f l4 7 l-8 0 Z' % (cx, by + 57), fill='currentColor')]
    return svg(Y0 + 2 * BH + GY + 22, ''.join(out),
               'Figure 3: four sets of apparatus for separating mixtures, A to D')


# ── FIGURE 4 ──────────────────────────────────────────────────────────────────────────────────
def fig4():
    """The titration, in two steps. 02.1 is *name the pieces of equipment labelled A, B and C*,
    so the shapes have to be tellable apart: A is a pipette (a bulb on a stem), B a conical flask,
    C a burette (a long graduated tube with a tap)."""
    out = [t(78, 14, 'Step 1', 'lbl'), t(232, 14, 'Step 2', 'lbl')]
    # Step 1: a pipette held over a conical flask
    out += [line(78, 26, 78, 62, w=1.3),
            path('M74 62 q4 -4 8 0 v26 q-4 4 -8 0 Z', fill=WASH),
            line(78, 88, 78, 122, w=1.3),
            conical(78, 118, 62, 56),
            line(82, 70, 108, 66, w=.7), t(112, 69, 'Alkali', 'cap', ' style="text-anchor:start"'),
            line(82, 82, 108, 88, w=.7), t(112, 91, 'A', 'lbl', ' style="text-anchor:start"'),
            line(96, 132, 112, 126, w=.7), t(116, 129, 'B', 'lbl', ' style="text-anchor:start"')]
    # Step 2: a burette over a conical flask with indicator in it
    bx = 214
    out += [rect(bx - 7, 22, 14, 108, WASH, sw=1.3)]
    for i in range(21):
        out.append(line(bx - 7, 26 + i * 5, bx - 1 if i % 5 else bx + 3, 26 + i * 5, w=.5))
    out += [path('M%g 130 l4 8 h-14 l4 -8 Z' % (bx - 1)),
            circ(bx + 5, 136, 3.5, sw=1), line(bx, 140, bx, 148, w=1.3),
            conical(bx, 146, 62, 56, fill=0.30),
            line(bx + 8, 44, bx + 40, 40, w=.7),
            t(bx + 44, 43, 'Acid', 'cap', ' style="text-anchor:start"'),
            line(bx + 8, 80, bx + 40, 84, w=.7),
            t(bx + 44, 87, 'C', 'lbl', ' style="text-anchor:start"'),
            line(bx + 22, 190, bx + 40, 184, w=.7),
            t(bx + 44, 181, 'Alkali and a', 'cap', ' style="text-anchor:start"'),
            t(bx + 44, 192, 'few drops of', 'cap', ' style="text-anchor:start"'),
            t(bx + 44, 203, 'indicator', 'cap', ' style="text-anchor:start"')]
    return svg(212, ''.join(out), 'Figure 4: the titration apparatus, Step 1 and Step 2')


# ── FIGURE 5 ──────────────────────────────────────────────────────────────────────────────────
# MEASURED, because this figure IS the answer. In the source PNG the three numbered ticks sit at
# y = 199.0, 327.0 and 455.5 px and the meniscus at 275.5, so the reading is
# 16 + (275.5 - 199)/128.0 = 16.5977 -> 16.6, which is one of the four options and no other is
# within half a division. The drawing is built from that fraction rather than from a height.
F5_TICKS = (199.0, 327.0, 455.5)
F5_MENISCUS = 275.5
F5_READING = 16 + (F5_MENISCUS - F5_TICKS[0]) / (F5_TICKS[1] - F5_TICKS[0])

def fig5():
    """The burette from Step 2 with the scale round the meniscus magnified, which is how AQA
    prints a reading question: you cannot answer it off the main tube."""
    out = []
    bx = 54
    out += [rect(bx - 9, 14, 18, 176, sw=1.3),
            path('M%g 190 l5 10 h-16 l5 -10 Z' % (bx - 3)),
            circ(bx + 7, 197, 4, sw=1), line(bx, 201, bx, 212, w=1.3),
            line(bx + 9, 20, bx + 40, 20, w=.7),
            t(bx + 44, 23, 'C', 'lbl', ' style="text-anchor:start"')]
    men_y = 14 + 176 * 0.34                                   # where the liquid starts on the tube
    out.append(rect(bx - 8, men_y, 16, 190 - men_y, WASH, sw=0))
    out += [line(bx + 9, 150, bx + 40, 150, w=.7),
            t(bx + 44, 153, 'Acid', 'cap', ' style="text-anchor:start"')]
    out.append(circ(bx, men_y, 11, sw=1.1))                   # the lens on the tube
    # the magnified circle
    CX, CY, CR = 224, 96, 84
    out += [line(bx + 9, men_y - 8, CX - CR + 8, CY - CR + 24, w=.8, dash=1),
            line(bx + 9, men_y + 8, CX - CR + 8, CY + CR - 24, w=.8, dash=1),
            circ(CX, CY, CR, sw=1.3)]
    # 16 at the top, 18 at the bottom: two whole divisions across most of the circle
    top, bot = CY - CR * 0.80, CY + CR * 0.80
    span = (bot - top) / 2.0
    frac = F5_READING - 16
    ymen = top + span * frac
    import math
    half = math.sqrt(max(CR ** 2 - (ymen - CY) ** 2, 0))
    out.append('<path d="M%.1f %.1f A%d %d 0 0 0 %.1f %.1f Z" fill="%s"/>'
               % (CX - half, ymen, CR, CR, CX + half, ymen, WASH))
    out.append(line(CX - half, ymen, CX + half, ymen, w=1.3))
    for i in range(21):                                        # 0.1 cm3 divisions
        y = top + i * span / 10.0
        if y < CY - CR + 6 or y > CY + CR - 6: continue
        long = i % 10 == 0
        out.append(line(CX - (26 if long else 12), y, CX + (26 if long else 12), y,
                        w=1.1 if long else .6))
    for i, n in enumerate((16, 17, 18)):
        out.append(t(CX + 34, top + i * span + 5, str(n), 'num', ' style="text-anchor:start"'))
    return svg(220, ''.join(out),
               'Figure 5: the burette scale magnified, with the meniscus between 16 and 17')


# ── FIGURES 6 AND 7, the two graphs ───────────────────────────────────────────────────────────
# Read off the source PNGs: the numbered gridlines give the scale, then the ink in each plotted
# column gives the point. 03.4's answer -- the minimum mass of zinc -- is the corner of Figure 6's
# line, so this is a picture that decides an answer and it is measured rather than sketched.
F6_PTS = [(0.00, 22), (0.20, 28), (0.40, 34.5), (0.60, 41),
          (0.80, 47), (1.00, 47), (1.20, 47), (1.40, 47)]
F6_CORNER = 0.80
F7_PTS = [(0.0, 22.1), (1.0, 20.8), (2.0, 19.5), (3.0, 18.2),
          (4.0, 16.9), (5.0, 16.9), (6.0, 16.9), (7.0, 16.9)]

def fig6():
    """Figure 6 carries its line of best fit, in two straight sections meeting at the corner --
    which is the whole of 03.4 and 03.5, so the line is part of the data and not decoration."""
    def marks(sx, sy):
        out = []
        for x, y in F6_PTS:
            cx, cy = sx(x), sy(y)
            out += [line(cx - 3, cy - 3, cx + 3, cy + 3, w=1.3),
                    line(cx - 3, cy + 3, cx + 3, cy - 3, w=1.3)]
        out.append(line(sx(0), sy(22), sx(F6_CORNER), sy(47), w=1.3))
        out.append(line(sx(F6_CORNER), sy(47), sx(1.40), sy(47), w=1.3))
        return ''.join(out)
    return axes(1.4, 50, 0.2, 5, 'Mass of zinc powder in grams',
                'Highest temperature reached in °C',
                'Figure 6: highest temperature against mass of zinc powder',
                marks, ymin=20, xminor=0.04, yminor=1)

def fig7():
    """Figure 7 has NO line on it, and that is the question: 03.7 asks for one to be drawn."""
    return scatter(7, 23, 1, 1, 'Mass of sodium hydrogencarbonate in grams',
                   'Lowest temperature reached in °C',
                   'Figure 7: lowest temperature against mass of sodium hydrogencarbonate',
                   F7_PTS, ymin=16, xminor=0.2, yminor=0.2)


# ── FIGURE 9 ──────────────────────────────────────────────────────────────────────────────────
def fig9():
    """A cube with every edge labelled 4 nm. 04.4 is six marks of surface area, volume and their
    ratio, and all three come off this one number -- so the drawing has to label all three edges
    the paper labels and no others."""
    X, Y, S, D = 96, 40, 116, 44                    # front face and the depth offset
    out = [rect(X, Y + D, S, S),
           line(X, Y + D, X + D, Y), line(X + S, Y + D, X + S + D, Y),
           line(X + S, Y + S + D, X + S + D, Y + S),
           line(X + D, Y, X + S + D, Y), line(X + S + D, Y, X + S + D, Y + S),
           line(X + D, Y, X + D, Y + S, dash=1), line(X + D, Y + S, X + S + D, Y + S, dash=1),
           line(X + D, Y + S, X, Y + S + D, dash=1)]
    # the three dimension arrows, as the paper places them
    out += [line(X - 16, Y + D, X - 16, Y + S + D, w=1),
            path('M%g %g l4 7 l-8 0 Z' % (X - 16, Y + D + 1), fill='currentColor'),
            path('M%g %g l4 -7 l-8 0 Z' % (X - 16, Y + S + D - 1), fill='currentColor'),
            t(X - 24, Y + D + S / 2 + 4, '4 nm', 'num', ' style="text-anchor:end"'),
            line(X, Y + S + D + 16, X + S, Y + S + D + 16, w=1),
            path('M%g %g l7 4 l0 -8 Z' % (X, Y + S + D + 16), fill='currentColor'),
            path('M%g %g l-7 4 l0 -8 Z' % (X + S, Y + S + D + 16), fill='currentColor'),
            t(X + S / 2, Y + S + D + 32, '4 nm', 'num'),
            line(X - 12, Y + D - 6, X + D - 12, Y - 6, w=1),
            path('M%g %g l0 8 l7 -4 Z' % (X - 12, Y + D - 6), fill='currentColor'),
            t(X - 16, Y + 4, '4 nm', 'num', ' style="text-anchor:end"')]
    return svg(Y + S + D + 44, ''.join(out), 'Figure 9: a cube with every edge labelled 4 nm')


# ── FIGURE 10 ─────────────────────────────────────────────────────────────────────────────────
def fig10():
    """The displayed formula whose atoms 05.4 asks you to COUNT -- two carbons, six fluorines --
    so it is drawn rather than described: `C__F__` cannot be completed from a sentence saying
    three fluorines are bonded to each carbon without doing the question for the reader."""
    out = []
    for i, cx in enumerate((136, 204)):
        out += [t(cx, 76, 'C'), line(cx, 34, cx, 58, w=1.2), line(cx, 82, cx, 106, w=1.2),
                t(cx, 28, 'F'), t(cx, 116, 'F')]
    out += [line(148, 71, 192, 71, w=1.2),
            line(96, 71, 124, 71, w=1.2), t(88, 76, 'F'),
            line(216, 71, 244, 71, w=1.2), t(252, 76, 'F')]
    return svg(128, ''.join(out), 'Figure 10: a displayed formula, two carbon atoms with three '
                                  'fluorine atoms on each')


# ── FIGURES 11 AND 12, the two forms of carbon ────────────────────────────────────────────────
def _hexrow(x0, y0, w, h, n, stubs_up, stubs_down):
    """One row of a hexagonal sheet seen edge-on, which is how AQA draws graphite: the atoms zig
    up and down and the bonds run between them."""
    out, pts = [], []
    for i in range(n):
        pts.append((x0 + i * w / 2.0, y0 + (0 if i % 2 == 0 else h)))
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        out.append(line(x1, y1, x2, y2, w=1))
    for i, (x, y) in enumerate(pts):
        if stubs_up and i % 2 == 0:
            out.append(line(x, y, x - 5, y - 7, w=1))
        if stubs_down and i % 2 == 1:
            out.append(line(x, y, x + 5, y + 7, w=1))
    for x, y in pts:
        out.append(circ(x, y, 3.6, 'currentColor" fill-opacity=".45', sw=.9))
    return ''.join(out), pts

def fig11():
    """Graphite: three flat sheets one above the other, each atom joined to three others. 05.7 is
    *how many covalent bonds does each carbon form*, counted off this picture, so the bonds have
    to be countable rather than suggested."""
    out = []
    for k, top in enumerate((18, 96, 174)):
        dx = 26 if k == 1 else 0                   # the middle sheet is offset, as AQA draws it
        for r, dy in ((0, 0), (1, 18), (2, 36)):
            body, _ = _hexrow(44 + dx - r * 9, top + dy, 34, 10, 9, r == 0, r == 2)
            out.append(body)
    out += [t(30, 252, 'Key', 'lbl', ' style="text-anchor:start"'),
            circ(34, 266, 3.6, 'currentColor" fill-opacity=".45', sw=.9),
            t(44, 270, '= carbon atom', 'cap', ' style="text-anchor:start"')]
    return svg(282, ''.join(out), 'Figure 11: the structure of graphite, three layers of carbon '
                                  'atoms in flat sheets')

def fig12():
    """Diamond: one ring of carbon atoms in three dimensions with a bond going off each atom, so
    05.8's *describe the structure and bonding* has the giant lattice in front of it."""
    import math
    out = []
    CX, CY, RX, RY = 150, 92, 62, 30
    ring = [(CX + RX * math.cos(math.radians(a)), CY + RY * math.sin(math.radians(a)) - 26 * (a in (90, 270)))
            for a in (90, 30, 330, 270, 210, 150)]
    ring = [(CX + RX * math.cos(math.radians(a)), CY + RY * math.sin(math.radians(a)))
            for a in (240, 300, 0, 60, 120, 180)]
    lift = [-34, -34, 0, 22, 22, 0]                       # the ring is a chair, not a flat circle
    ring = [(x, y + d) for (x, y), d in zip(ring, lift)]
    for i in range(6):
        out.append(line(*ring[i], *ring[(i + 1) % 6], w=1.1))
    inner = [(CX - 18, CY + 18), (CX + 16, CY + 14)]      # the two atoms inside the ring
    out += [line(*ring[4], *inner[0], w=1.1), line(*ring[2], *inner[1], w=1.1),
            line(*inner[0], *inner[1], w=1.1)]
    stubs = {0: [(-24, -12), (12, -20)], 1: [(24, -12), (-10, -22)], 2: [(26, 8), (14, -18)],
             3: [(20, 20), (-6, 24)], 4: [(-22, 18), (6, 24)], 5: [(-26, 6), (-14, -16)]}
    for i, (x, y) in enumerate(ring):
        for dx, dy in stubs[i]:
            out.append(line(x, y, x + dx, y + dy, w=1))
    for x, y in inner:
        out.append(line(x, y, x, y + 26, w=1))
    for x, y in ring + inner:
        out.append(circ(x, y, 5, 'currentColor" fill-opacity=".45', sw=1))
    out += [t(30, 190, 'Key', 'lbl', ' style="text-anchor:start"'),
            circ(34, 204, 5, 'currentColor" fill-opacity=".45', sw=1),
            t(46, 208, '= carbon atom', 'cap', ' style="text-anchor:start"')]
    return svg(218, ''.join(out), 'Figure 12: the structure of diamond, carbon atoms each joined '
                                  'to four others')


# ── FIGURE 13 ─────────────────────────────────────────────────────────────────────────────────
F13 = ['Potassium', 'Lithium', 'Carbon', 'Zinc', 'Tin', 'Gold']

def fig13():
    """Part of the reactivity series with carbon set in among the metals, and an arrow saying
    which way it runs. 06.5 is *predict one metal extracted by each method*, and the answer is
    entirely which side of Carbon a metal sits -- so carbon is marked out, as AQA prints it."""
    out = []
    for i, name in enumerate(F13):
        y = 26 + i * 24
        out.append(t(118, y, name, 'cap' if name != 'Carbon' else 'lbl',
                     ' style="text-anchor:end"'))
    out += [line(140, 16, 140, 140, w=1.4),
            path('M136 140 L144 140 L140 152 Z', fill='currentColor'),
            t(156, 88, 'Decreasing reactivity', 'cap', ' style="text-anchor:start"')]
    return svg(166, ''.join(out), 'Figure 13: part of the reactivity series, most reactive at the '
                                  'top, with carbon included')


# ── FIGURE 14 ─────────────────────────────────────────────────────────────────────────────────
def fig14():
    """A chemical cell: two different metals in a beaker of electrolyte with a voltmeter across
    them. 07.2 asks which electrolyte would work and 07.3 is a hypothesis about the two metals,
    so both electrodes have to be visibly different pieces of metal in the same liquid."""
    CX = 150
    out = [beaker(CX, 116, 96, 74, fill=0.62),
           rect(CX - 26, 62, 7, 120, 'currentColor" fill-opacity=".8', sw=1),
           rect(CX + 19, 62, 7, 120, 'currentColor" fill-opacity=".8', sw=1),
           path('M%g 62 v-22 h62 v22' % (CX - 22.5), sw=1.3),
           circ(CX, 40, 15, sw=1.3), t(CX, 45, 'V'),
           line(CX + 13, 30, CX + 48, 18, w=.7),
           t(CX + 52, 21, 'Voltmeter', 'cap', ' style="text-anchor:start"'),
           line(CX - 26, 92, CX - 62, 92, w=.7),
           t(CX - 66, 95, 'Metal A', 'cap', ' style="text-anchor:end"'),
           line(CX + 26, 92, CX + 56, 92, w=.7),
           t(CX + 60, 95, 'Metal B', 'cap', ' style="text-anchor:start"'),
           line(CX + 26, 160, CX + 56, 160, w=.7),
           t(CX + 60, 163, 'Electrolyte', 'cap', ' style="text-anchor:start"')]
    return svg(206, ''.join(out), 'Figure 14: a chemical cell, two metals in an electrolyte with '
                                  'a voltmeter across them')


# ── FIGURE 15 ─────────────────────────────────────────────────────────────────────────────────
def fig15():
    """The grid 09.4 asks you to PLOT Table 4 on, printed empty because plotting it is the two
    marks. With the grid there, `padSource_` lays a pen over it and the question can be answered
    on a phone -- which is why an empty grid is drawn where a blank is not."""
    return axes(110, 11, 20, 2, 'Atomic number', 'Density in mg/cm³',
                'Figure 15: an empty grid for plotting density against atomic number',
                '', xminor=4, yminor=0.4)


# ── FIGURE 16 ─────────────────────────────────────────────────────────────────────────────────
def fig16():
    """Two early models of the atom. 10.1 is *name them* and 10.2 is *compare model A with the
    model used today*, both answered off the picture: A is a ball of positive charge with
    electrons stuck in it, B a small positive centre with electrons in shells round it."""
    import math
    out = [t(82, 16, 'Model A', 'lbl'), t(250, 16, 'Model B', 'lbl')]
    # A: the plum pudding
    out += [circ(82, 86, 50, 'currentColor" fill-opacity=".22', sw=1.2),
            line(70, 86, 94, 86, w=2), line(82, 74, 82, 98, w=2)]
    for a in (35, 105, 165, 255, 315):
        x, y = 82 + 33 * math.cos(math.radians(a)), 86 + 33 * math.sin(math.radians(a))
        out += [circ(x, y, 7.5, 'none', sw=1),
                line(x - 3.5, y, x + 3.5, y, w=1.3)]
    out += [line(96, 60, 128, 46, w=.7),
            t(132, 40, 'Ball of', 'cap', ' style="text-anchor:start"'),
            t(132, 51, 'positive', 'cap', ' style="text-anchor:start"'),
            t(132, 62, 'charge', 'cap', ' style="text-anchor:start"')]
    # B: a nucleus with two shells
    out += [circ(250, 86, 52, sw=1.1), circ(250, 86, 30, sw=1.1),
            circ(250, 86, 9, sw=1.2), line(246, 86, 254, 86, w=1.3), line(250, 82, 250, 90, w=1.3)]
    for r, angs in ((30, (250, 20)), (52, (200, 340, 90))):
        for a in angs:
            x, y = 250 + r * math.cos(math.radians(a)), 86 + r * math.sin(math.radians(a))
            out += [circ(x, y, 7.5, 'none', sw=1), line(x - 3.5, y, x + 3.5, y, w=1.3)]
    return svg(156, ''.join(out), 'Figure 16: two early models of the atom, A and B')


# ── WHICH DRAWING GOES ON WHICH ROW ───────────────────────────────────────────────────────────
# A figure goes on EVERY row that reads from it, not only the row that introduces it. A question
# card is standalone -- 01.2 is "which diagram in Figure 1 represents a mixture" and paging to it
# with no picture is the fault this whole commit is about. That is not the AQA-insert shape,
# which was one SENTENCE about a figure repeated; this is the figure itself, on the questions
# that cannot be answered without it.
def plan():
    return {
        '011': fig1(),  '012': fig1(),
        '013': fig2(),
        '015': q15(),
        '016': fig3(),  '017': fig3(),
        '021': fig4(),
        '025': fig5(),
        '034': fig6(),  '035': fig6(),
        '037': fig7(),  '038': fig7(),
        '044': fig9(),
        '054': fig10(),
        '057': fig11(),
        '058': fig12(),
        '065': fig13(),
        '072': fig14(), '073': fig14(),
        '101': fig16(), '102': fig16(),
    }

# 09.4 AND 09.5 ALREADY CARRY FIGURE 15 and are deliberately left alone. `fig15()` above builds
# the same grid and is kept, because it is the one figure on this paper somebody might reasonably
# think is missing -- the assertion that no row is overwritten is what caught it, which is why
# that assertion is in `main()` rather than a comment saying the file was checked.

# 04.3's Figure 8 is a hand with a dressing on it and the question is answered from Table 2 beside
# it, so it keeps its `figure` and gets no drawing -- CLAUDE.md's line between a picture the row's
# own words determine and an illustration.
NOT_DRAWN = {'043': 'Figure 8 is a drawing of a wound dressing on a hand; 04.3 is answered from '
                    'Table 2 beside it, so there is nothing in the picture to recover'}

# 05.1 says the nuclide out loud as <sup>13</sup><sub>6</sub>C and 05.2/05.3 ask about that same
# atom. Nothing is missing from any of the three, so `figure` on them was counting work that does
# not exist -- the mirror of a silence, which this repository has only ever recorded in the other
# direction. Same rule as the SATs Paper 2 pass: a counting label is for a picture the row
# genuinely lacks.
NO_FIGURE = ('051', '052', '053')

# ── AND THE PROSE THAT STOOD IN FOR THE PICTURE HAS TO GO WITH IT ─────────────────────────────
# THIS IS THE HALF THAT MATTERS MORE THAN THE DRAWINGS. Every one of these rows was transcribed
# with the figure written out in words, because the figure was not there -- and five of them hand
# over the answer doing it: 01.1 says "D -- four molecules, every one of them white-black-white",
# which IS "which is the pure compound"; 02.5 says the meniscus sits six small divisions below
# the 16 mark, which IS 16.6; 03.4 says the points level off "at 0.80 g", which IS the answer;
# 02.1 calls A "the narrow glass tube with a bulb in the middle", which IS pipette; and 06.5
# writes the series out, which IS the figure.
#
# CLAUDE.md ALREADY HAS THE RULE AND IT IS BEING APPLIED IN THE OTHER DIRECTION: *what a figure
# shows is not what its answer is*, written about the AQA Biology pie chart. A description
# accurate enough to teach around is right when the picture is missing and is a second source for
# one fact the moment it arrives -- the `.reel .over` fault, where one object was written twice
# and the two drifted. So each row keeps AQA's own lead-in and its ask, and loses the sentence
# that was standing in for the drawing.
TRIM = {
 '011': '<p>This question is about elements, compounds and mixtures.</p><p><b>Figure 1</b> shows '
        'diagrams which represent the atoms and molecules in different substances.</p><p>Which '
        'diagram in <b>Figure 1</b> represents a pure compound? Tick <b>one</b> box: <b>A</b>, '
        '<b>B</b>, <b>C</b> or <b>D</b>.</p>',
 '013': '<p>Elements are metals or non-metals.</p><p><b>Figure 2</b> shows an outline of the '
        'periodic table, divided into sections.</p><p>Where are metals found in the periodic '
        'table? Tick <b>one</b> box.</p><ul><li>Section A only</li><li>Sections A, B and C</li>'
        '<li>Sections B, C and D</li><li>Section D only</li></ul>',
 '016': '<p>Mixtures are separated by different methods.</p><p><b>Figure 3</b> shows the '
        'apparatus for separating four different types of mixture.</p><p>Which apparatus could be '
        'used to collect water from sodium chloride solution? Use <b>Figure 3</b>. Tick <b>one</b> '
        'box: <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>',
 '021': '<p>A titration measures the volumes of an acid and an alkali that neutralise each '
        'other.</p><p><b>Figure 4</b> shows the apparatus used.</p><p>Name the pieces of equipment '
        'labelled <b>A</b>, <b>B</b> and <b>C</b> in <b>Figure 4</b>. Choose answers from the box: '
        '<i>beaker &nbsp; burette &nbsp; conical flask &nbsp; measuring cylinder &nbsp; pipette '
        '&nbsp; test tube</i></p>',
 '025': '<p><b>Figure 5</b> shows the reading on equipment <b>C</b> at the end of Step 2.</p>'
        '<p>What is the reading on equipment <b>C</b>? Tick <b>one</b> box.</p>'
        '<ul><li>16.4 cm<sup>3</sup></li><li>16.6 cm<sup>3</sup></li><li>17.4 cm<sup>3</sup></li>'
        '<li>17.6 cm<sup>3</sup></li></ul>',
 '034': '<p><b>Figure 6</b> shows the results: the highest temperature reached against the mass '
        'of zinc powder added.</p><p>What is the minimum mass of zinc powder needed to react with '
        'all the copper sulfate solution? Use <b>Figure 6</b>.</p>',
 '037': '<p>Another student investigated the energy change of the reaction between sodium '
        'hydrogencarbonate and hydrochloric acid, measuring the <b>lowest</b> temperature reached '
        'for different masses of sodium hydrogencarbonate. <b>Figure 7</b> shows the results.</p>'
        '<p>Draw <b>two</b> straight lines of best fit on <b>Figure 7</b>. The lines should '
        'cross.</p>',
 '044': '<p><b>Figure 9</b> shows a cubic nanoparticle.</p><p>Calculate the surface area of the '
        'cubic nanoparticle, its volume, and the simplest whole number ratio of surface area : '
        'volume. Use the equation:</p><p>surface area of cubic nanoparticle = 6 &#215; surface '
        'area of one face</p>',
 '054': '<p><b>Figure 10</b> shows the structure of a carbon compound.</p><p>Complete the formula '
        'of the carbon compound: C__F__</p>',
 '057': '<p>Graphite is a form of carbon. <b>Figure 11</b> represents the structure of '
        'graphite.</p><p>How many covalent bonds does each carbon atom form in graphite? Tick '
        '<b>one</b> box.</p><ul><li>1</li><li>2</li><li>3</li><li>4</li></ul>',
 '058': '<p>Diamond is another form of carbon. <b>Figure 12</b> represents the structure of '
        'diamond.</p><p>Describe the structure and bonding in diamond.</p>',
 '065': '<p><b>Figure 13</b> shows part of the reactivity series of metals. The non-metal carbon '
        'has been included.</p><p>Metals can be extracted from their compounds by electrolysis '
        'and by reduction with carbon. Electrolysis is more expensive than reduction with '
        'carbon.</p><p>Predict <b>one</b> metal that would be extracted by each method. Use '
        '<b>Figure 13</b>.</p>',
 '072': '<p>A chemical cell can be made using two different metals in contact with an '
        'electrolyte.</p><p><b>Figure 14</b> shows a chemical cell.</p><p>Which is a suitable '
        'electrolyte for a chemical cell? Tick <b>one</b> box.</p><ul><li>Pure water</li>'
        '<li>Solid lead bromide</li><li>Sodium chloride solution</li></ul>',
 '101': '<p>This question is about models of the atom.</p><p><b>Figure 16</b> shows two early '
        'models of the atom.</p><p>Name the models of the atom shown in <b>Figure 16</b>.</p>',
}

# Every `examiner_note` on a drawn row said the figure was artwork in the PDF and what it shows is
# written out in the question. Both halves stop being true the moment it is drawn, and a note that
# outlives the thing it describes is the shape recorded under `resource_type` in `VOCAB` and the
# dead `kind === 'paper'` guard. Dropped from every row that gains a drawing.
STALE_NOTE = re.compile(r'artwork in the PDF|is a graph in the PDF|is not transcribed')

# 01.5's description had the question backwards: the paper prints the two charges and asks for the
# ELECTRONS. Told to show the charges, somebody does the one part already done for them.
Q15_HTML = ('<p>Potassium and chlorine react to produce potassium chloride. An atom of potassium '
            'loses an electron to form a potassium ion. An atom of chlorine gains an electron to '
            'form a chloride ion.</p><p>Complete the dot and cross diagram: the two atoms are '
            'drawn with their outer electrons, and below them the two ions are drawn with their '
            'charges already shown and their outer shells empty.</p>')


# ── WHAT THE PICTURES CLAIM, ASSERTED ─────────────────────────────────────────────────────────
def check():
    """The four measured figures decide four answers, so what was read off the pixels is checked
    against the paper's own options before a row is written. A number mistyped into this file
    fails here rather than shipping -- the rule every insert script in this library follows."""
    # Figure 1: what each box IS, worked out from the atoms rather than remembered
    for box, atoms in FIG1.items():
        mols, seen = [], set()
        for i, (f1, x1, y1) in enumerate(atoms):
            if i in seen: continue
            grp, stack = [i], [i]
            while stack:
                j = stack.pop()
                for k, (f2, x2, y2) in enumerate(atoms):
                    if k in grp: continue
                    xj, yj = atoms[j][1], atoms[j][2]
                    if (xj - x2) ** 2 + (yj - y2) ** 2 < 46 ** 2:
                        grp.append(k); stack.append(k)
            seen |= set(grp)
            mols.append(''.join(sorted(atoms[k][0] for k in grp)))
        kinds = sorted(set(mols))
        compound = [m for m in kinds if len(set(m)) > 1]
        element = [m for m in kinds if len(set(m)) == 1]
        was = FIG1_IS[box]
        if was == 'pure compound':
            assert len(kinds) == 1 and compound, (box, mols)
        elif was == 'element + compound':
            assert len(compound) == 1 and len(element) == 1, (box, mols)
        elif was == 'two elements':
            assert not compound and len(element) == 2, (box, mols)
        else:
            assert len(compound) == 2 and not element, (box, mols)
    assert FIG1_IS['D'] == 'pure compound' and FIG1_IS['C'] == 'element + compound'

    # Figure 5: the reading has to be one of the four options the paper offers, and only one
    opts = (16.4, 16.6, 17.4, 17.6)
    near = [o for o in opts if abs(o - F5_READING) < 0.05]
    assert near == [16.6], (F5_READING, near)

    # Figure 6: the corner of the line is 03.4's answer, and it is where the plateau starts
    flat = [x for x, y in F6_PTS if y == 47]
    assert min(flat) == F6_CORNER == 0.80, flat
    assert all(y < 47 for x, y in F6_PTS if x < F6_CORNER)

    # Figure 7: 03.7 draws a line through four falling points and 03.8 reads the plateau off it
    fall = [y for x, y in F7_PTS if x <= 3]
    assert fall == sorted(fall, reverse=True) and len(set(fall)) == 4, fall
    assert len({y for x, y in F7_PTS if x >= 4}) == 1

    # Every drawing lays out inside W, or two of them come out at different sizes on one screen
    for name, s in plan().items():
        m = re.match(r'<svg viewBox="0 0 (\d+) (\d+)"', s)
        assert m and int(m.group(1)) == W, (name, s[:60])
        assert int(m.group(2)) < 300, (name, m.group(2))       # taller than a pane is unreadable
    return True


def main():
    check()
    todo, drop, lines = plan(), set(NO_FIGURE), FILE.read_text(encoding='utf-8').split('\n')
    done, cleared, fixed, out = {}, [], 0, []
    trimmed, notes = [], 0
    for line in lines:
        bare = line.strip()
        trailing = bare.endswith(',')
        if not bare.startswith('{'):
            out.append(line); continue
        row = json.loads(bare[:-1] if trailing else bare)
        rid = row.get('row_id', '')
        tail = rid[-3:] if rid.startswith('Q-AQA-8462-2406-1F-') else None
        if tail in todo:
            assert not row.get('diagram'), '%s already carries a diagram' % rid
            assert row.get('figure'), '%s has no figure to replace' % rid
            row['diagram'] = todo[tail]
            row['diagram_by'] = 'family'
            if tail == '015':
                row['html'] = Q15_HTML
            if tail in TRIM:
                before = len(row['html'])
                row['html'] = TRIM[tail]
                assert len(row['html']) < before, '%s: the trim is not shorter' % rid
                trimmed.append(tail)
            note = row.get('examiner_note', '')
            if note and STALE_NOTE.search(note):
                row.pop('examiner_note')
                notes += 1
            done[tail] = True
        elif tail in drop:
            assert row.get('figure') == 'diagram', (rid, row.get('figure'))
            assert not row.get('diagram'), rid
            row['figure'] = ''
            cleared.append(tail)
        elif tail in NOT_DRAWN:
            assert row.get('figure') and not row.get('diagram'), rid
            fixed += 1
        out.append(json.dumps(row, ensure_ascii=False) + (',' if trailing else ''))
    missing = sorted(set(todo) - set(done))
    assert not missing, 'rows not found in the file: %r' % missing
    assert sorted(cleared) == sorted(NO_FIGURE), cleared
    assert fixed == len(NOT_DRAWN), fixed
    assert sorted(trimmed) == sorted(TRIM), sorted(set(TRIM) ^ set(trimmed))
    FILE.write_text('\n'.join(out), encoding='utf-8')
    print('%d rows of 8462/1F gained a drawing, across %d figures (Figure 15 already had one)'
          % (len(done), len({v for v in todo.values()})))
    print('  Figure 5 reads %.2f, which is the paper\'s "%s cm3" and none of the other three'
          % (F5_READING, '16.6'))
    print('  Figure 6\'s line corners at %.2f g, which is 03.4\'s answer' % F6_CORNER)
    print('  %d rows keep a figure and no drawing: %s'
          % (len(NOT_DRAWN), '; '.join('%s -- %s' % kv for kv in NOT_DRAWN.items())))
    print('  %d rows lose the sentence that was standing in for the drawing, and %d lose a note '
          'saying the figure is artwork nobody transcribed' % (len(trimmed), notes))
    print('  %d rows lose a figure they never needed: %s -- the nuclide is written out in the '
          'question' % (len(cleared), ', '.join(sorted(cleared))))


if __name__ == '__main__':
    main()
