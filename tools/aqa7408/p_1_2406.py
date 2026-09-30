"""AQA A-level Physics 7408/1 — Paper 1 — June 2024.

Every answer is READ OFF AQA's own scheme, `Mark scheme_ Paper 1 - June 2024 AL` — its cover says
A-level Physics 7408/1, Paper 1, June 2024, Version 1.0 Final, and every number in it (380 nm and
28.2° in 03.4, 2.82 × 10⁻¹² J in 04.2, 350 N, 4.5 m, 18 m and 6.5 m s⁻¹ in 05.2, 12 mA, 350 Ω and
3.2 V in Q6, 625 Hz in Q7) is this paper's. The 2017 Highers are why that is the rule and not a
preference. The multiple-choice keys (08–32) are the scheme's key column; the one-line working under
some of them is recomputed below rather than written from memory.

The cover (Friday 24 May 2024, morning) says 85 marks. The per-question boxes say 7, 9, 10, 4, 12,
11, 7 for Section A and 25 for Section B. Both are asserted below, and so is every intermediate the
scheme prints inside its own working. `month` is 5 because the cover's date is in May:
check-library.js compares `exam_date` against `month`, and the series is still named June 2024.

THE PAPER PRINTS ²⁰⁹₈₂Po IN 08 A. Polonium is element 84 and lead is 82; the key (C) does not depend
on it, and the option is transcribed as printed.

EVERY FIGURE IN THIS PDF IS A RASTER IMAGE with no text layer and no vectors. Drawn here:
  * Figure 2 (03.4) is TRACED, not eyeballed. The majors were found by their regular spacing in the
    embedded 997 × 595 image (300 nm at px 157.5, 50 nm per 102 px; intensity 0 at px 525.5, 0.1
    per 51 px), and the curve located column by column as the dark pixels (grey gridlines excluded,
    the printed letters X and Y masked out). `SPEC` below is that trace binned at 1.5 nm, keeping
    each bin's lowest and highest point so a narrow line is not flattened. The traced X peak is at
    380.2 nm, which is the scheme's own 380 nm (it accepts 377.5 to 382.5).
  * Figure 4 (05.1) is the paper's scale drawing, measured off the image: T1 at 34.8° above the
    horizontal and 285.2 px long, T2 at 11.5° and 238.2 px long (ratio 1.197). Solving the
    equilibrium with the measured angles gives T1 = 474 N and T2 = 397 N, inside the scheme's
    470–490 and 390–410 — asserted. The scheme's own printed scale is 350 N ↔ 35 mm.
  * Figure 6 (Q7) is a sine of amplitude 7 mm and wavelength 0.70 m over the 1.05 m string — the
    scheme's own 3.5 mm (half of 7) and 0.7 m fix it — with S where the displacement is 4 mm (the
    scheme's 07.4 starts S's graph at 4 mm). Axes and grid measured: x 0 to 1.1 m, minor 0.02 m;
    y −8 to 8 mm, minor 0.4 mm.
  * Figure 7 (07.4) is the empty grid the answer is drawn on: t 0 to 2.25 ms (minor 0.05 ms),
    displacement −8 to 8 mm — measured off the image, nothing plotted.
  * Figure 1 (the two prisms), Figure 3 (the cable), Figure 5 (the circuit) and the diagrams in
    09, 11, 15, 16, 18, 19, 20, 22 and 28 are redrawn from the page's own geometry; none carries a
    number the question asks to be read off, and the ray inside Figure 1 — the answer to 03.1 — is
    left off, as printed.
"""
import datetime, math, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from svgplot import W, axes

PAPER = 'P-AQA-7408-2406-1'
QP = '1x6JRy-coffewJPherOs-totrRN3vP6un'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS5', band_type='stage',
           band_value='A-Level', level='Alevel', company='AQA', exam_board='AQA',
           spec_code='7408/1', exam_wave='First wave', year='2024', month='5', paper='1',
           exam_date='2024-05-24', document_type='Past paper',
           name='Paper 1 — June 2024', active='True', trackable='True', printable='False')

PART = 'Particles & Radiation'
WAVE = 'Progressive & Stationary Waves'
MECH = 'Mechanics & Materials'
CIRC = 'Electric Circuits'
SHM = 'Circular & Periodic Motion'
NUC = 'Nuclear Physics'
ERR = 'Measurements & Their Errors'

# ---------------------------------------------------------------------------------------------
# drawing helpers
# ---------------------------------------------------------------------------------------------
def svg(h, label, body):
    return '<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>' % (W, h, label, ''.join(body))

def ln(x1, y1, x2, y2, extra=''):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1.2"%s/>'
            % (x1, y1, x2, y2, extra))

DASH = ' stroke-dasharray="4 3" opacity=".7"'

def tx(x, y, s, anchor='middle', cls='lbl'):
    return '<text x="%.1f" y="%.1f" class="%s" style="text-anchor:%s">%s</text>' % (x, y, cls, anchor, s)

def head(x, y, ang, size=7):
    """A filled arrowhead with its tip at (x, y) pointing along `ang` (radians, SVG y downwards).
    Triangles rather than <marker>s: several question cards are in the DOM at once and a marker
    needs an id."""
    a1, a2 = ang + math.pi - 0.4, ang + math.pi + 0.4
    return ('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor"/>'
            % (x, y, x + size * math.cos(a1), y + size * math.sin(a1),
               x + size * math.cos(a2), y + size * math.sin(a2)))

def arrow(x1, y1, x2, y2, extra=''):
    return ln(x1, y1, x2, y2, extra) + head(x2, y2, math.atan2(y2 - y1, x2 - x1))

def poly(pts, fill='none', extra=''):
    return ('<polyline points="%s" fill="%s" stroke="currentColor" stroke-width="1.2" '
            'stroke-linejoin="round"%s/>' % (' '.join('%.1f,%.1f' % p for p in pts), fill, extra))

# ---------------------------------------------------------------------------------------------
# FIGURE 1 — prisms A and B, measured off the 474 × 295 image: apex (182.5, 3), A's base from
# (26, 292) to (339.5, 292), B's right face x = 339.5; incoming ray at y 89.5 meeting A's face at
# x 135.7; outgoing ray at y 134.5 from the right face with a right-angle mark.
# ---------------------------------------------------------------------------------------------
def fig1():
    s = 0.66
    X = lambda x: 14 + x * s
    Y = lambda y: 10 + y * s
    b = []
    b.append('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor" '
             'fill-opacity=".12" stroke="currentColor" stroke-width="1.2"/>'
             % (X(182.5), Y(3), X(339.5), Y(3), X(339.5), Y(292), X(339.5), Y(292)))
    b.append('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor" fill-opacity=".28" '
             'stroke="currentColor" stroke-width="1.2"/>' % (X(182.5), Y(3), X(26), Y(292), X(339.5), Y(292)))
    b.append(ln(X(182.5), Y(3), X(339.5), Y(3)) + ln(X(339.5), Y(3), X(339.5), Y(292)))
    b.append(ln(X(3), Y(89.5), X(135.7), Y(89.5)) + head(X(72), Y(89.5), 0))
    b.append(ln(X(339.5), Y(134.5), X(472), Y(134.5)) + head(X(410), Y(134.5), 0))
    b.append('<polyline points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" stroke="currentColor" '
             'stroke-width="1"/>' % (X(339.5), Y(150), X(355), Y(150), X(355), Y(134.5)))
    b.append(tx(X(48), Y(282), '<tspan font-weight="700">A</tspan>'))
    b.append(tx(X(322), Y(26), '<tspan font-weight="700">B</tspan>'))
    return svg(int(Y(295)) + 6, 'Figure 1: a block made of a triangular prism A joined along its '
               'right-hand sloping face to prism B, whose right face is vertical. A horizontal ray '
               'enters the left face of A; a horizontal ray leaves the vertical face of B at right '
               'angles to it. The path inside the block is not drawn.', b)

# ---------------------------------------------------------------------------------------------
# FIGURE 2 — the traced spectrum (see the module note). (wavelength / nm, lowest, highest).
# ---------------------------------------------------------------------------------------------
SPEC = [(301,0.207,0.223), (302.2,0.179,0.207), (303.7,0.168,0.181), (305.1,0.162,0.168), (306.6,0.164,0.193), (308.1,0.191,0.23), (309.6,0.227,0.246), (311,0.246,0.256), (312.7,0.256,0.268), (314.5,0.268,0.274), (315.9,0.274,0.276), (317.4,0.274,0.276), (318.9,0.274,0.274), (320.3,0.274,0.278), (321.8,0.278,0.283), (323.3,0.283,0.287), (324.8,0.285,0.287), (326.2,0.272,0.285), (327.7,0.248,0.274), (329.2,0.232,0.248), (330.6,0.23,0.24), (332.1,0.24,0.26), (333.6,0.258,0.289), (335.1,0.289,0.297), (336.5,0.295,0.297), (338.2,0.283,0.293), (339.9,0.279,0.283), (341.4,0.279,0.281), (342.9,0.281,0.287), (344.4,0.289,0.295), (345.8,0.295,0.301), (347.3,0.301,0.305), (348.8,0.305,0.309), (350.2,0.309,0.311), (351.7,0.307,0.311), (353.2,0.305,0.307), (354.7,0.305,0.313), (356.1,0.313,0.328), (357.6,0.328,0.348), (359.1,0.348,0.362), (360.5,0.354,0.362), (362.3,0.321,0.354), (364,0.301,0.325), (365.4,0.293,0.303), (366.9,0.291,0.293), (368.4,0.291,0.293), (369.8,0.293,0.297), (371.3,0.297,0.303), (372.8,0.303,0.313), (374.3,0.311,0.325), (375.7,0.323,0.501), (377.2,0.44,0.681), (378.7,0.66,0.821), (380.1,0.799,0.868), (381.6,0.679,0.864), (383.1,0.477,0.701), (384.6,0.403,0.501), (386,0.405,0.501), (387.7,0.489,0.84), (389.5,0.799,0.934), (390.9,0.877,0.936), (392.4,0.695,0.885), (393.9,0.54,0.721), (395.3,0.489,0.558), (396.8,0.472,0.491), (398.3,0.46,0.473), (399.8,0.454,0.462), (401.2,0.454,0.477), (402.7,0.475,0.501), (404.2,0.499,0.519), (405.6,0.517,0.521), (407.1,0.513,0.521), (408.6,0.505,0.513), (410.1,0.497,0.505), (411.5,0.489,0.497), (413.2,0.481,0.489), (414.9,0.479,0.505), (416.4,0.491,0.613), (417.9,0.599,0.701), (419.4,0.695,0.721), (420.8,0.668,0.721), (422.3,0.578,0.673), (423.8,0.456,0.585), (425.2,0.401,0.479), (426.7,0.395,0.401), (428.2,0.393,0.395), (429.7,0.389,0.393), (431.1,0.378,0.389), (432.6,0.368,0.378), (434.1,0.364,0.368), (435.5,0.364,0.462), (437.3,0.44,0.701), (439,0.679,0.821), (440.4,0.799,0.827), (441.9,0.673,0.807), (443.4,0.499,0.687), (444.8,0.391,0.521), (446.3,0.379,0.393), (447.8,0.37,0.379), (449.3,0.362,0.37), (450.7,0.362,0.366), (452.2,0.366,0.376), (453.7,0.376,0.383), (455.1,0.379,0.383), (456.6,0.368,0.379), (458.1,0.356,0.368), (459.6,0.354,0.36), (461,0.358,0.373), (462.7,0.373,0.405), (464.5,0.405,0.421), (465.9,0.419,0.422), (467.4,0.419,0.422), (468.9,0.411,0.419), (470.3,0.399,0.411), (471.8,0.385,0.401), (473.3,0.373,0.385), (474.8,0.366,0.373), (476.2,0.358,0.366), (477.7,0.354,0.36), (479.2,0.352,0.354), (480.6,0.352,0.521), (482.1,0.479,0.76), (483.6,0.721,0.899), (485.1,0.881,0.913), (486.5,0.738,0.901), (488.2,0.495,0.76), (489.9,0.409,0.521), (491.4,0.389,0.411), (492.9,0.378,0.391), (494.4,0.37,0.378), (495.8,0.37,0.378), (497.3,0.376,0.393), (498.8,0.391,0.409), (500.2,0.407,0.426), (501.7,0.424,0.438), (503.2,0.438,0.446), (504.7,0.446,0.452), (506.1,0.45,0.452), (507.6,0.444,0.45), (509.1,0.434,0.444), (510.5,0.421,0.436), (512.3,0.397,0.422), (514,0.385,0.399), (515.4,0.383,0.385), (516.9,0.383,0.389), (518.4,0.389,0.399), (519.9,0.397,0.411), (521.3,0.409,0.426), (522.8,0.426,0.446), (524.3,0.446,0.452), (525.7,0.438,0.45), (527.2,0.407,0.438), (528.7,0.383,0.409), (530.1,0.381,0.389), (531.6,0.389,0.413), (533.1,0.411,0.444), (534.6,0.44,0.454), (536,0.438,0.452), (537.7,0.397,0.44), (539.5,0.379,0.401), (540.9,0.379,0.383), (542.4,0.383,0.393), (543.9,0.393,0.401), (545.3,0.399,0.403), (546.8,0.403,0.405), (548.3,0.403,0.405), (549.8,0.403,0.405), (551.2,0.403,0.405), (552.7,0.403,0.403), (554.2,0.403,0.411), (555.6,0.409,0.421), (557.1,0.421,0.432), (558.6,0.432,0.446), (560,0.446,0.458), (561.5,0.458,0.466), (563.2,0.466,0.472), (565,0.464,0.47), (566.4,0.45,0.464), (567.9,0.432,0.45), (569.4,0.424,0.432), (570.8,0.424,0.428), (572.3,0.428,0.438), (573.8,0.438,0.444), (575.2,0.444,0.452), (576.7,0.452,0.454), (578.2,0.454,0.458), (579.7,0.456,0.458), (581.1,0.456,0.458), (582.6,0.452,0.456), (584.1,0.444,0.452), (585.5,0.438,0.446), (587.3,0.424,0.438), (589,0.415,0.424), (590.4,0.405,0.415), (591.9,0.399,0.405), (593.4,0.395,0.399), (594.9,0.395,0.405), (596.3,0.401,0.421), (597.8,0.419,0.44), (599.3,0.438,0.446), (600.7,0.438,0.446), (602.2,0.428,0.44), (603.7,0.419,0.428), (605.1,0.415,0.419), (606.6,0.415,0.421), (608.1,0.421,0.426), (609.6,0.426,0.428), (611,0.421,0.428), (612.7,0.413,0.421), (614.5,0.409,0.413), (615.9,0.409,0.411), (617.4,0.409,0.413), (618.9,0.413,0.421), (620.3,0.419,0.426), (621.8,0.426,0.436), (623.3,0.436,0.444), (624.8,0.444,0.452), (626.2,0.45,0.454), (627.7,0.454,0.458), (629.2,0.456,0.46), (630.6,0.458,0.46), (632.1,0.458,0.46), (633.6,0.46,0.464), (635,0.464,0.472), (636.5,0.472,0.485), (638.2,0.485,0.493), (640,0.475,0.493), (641.4,0.45,0.477), (642.9,0.426,0.452), (644.4,0.419,0.428), (645.8,0.419,0.434), (647.3,0.432,0.454), (648.8,0.454,0.483), (650.2,0.477,0.652), (651.7,0.621,0.785), (653.2,0.775,0.87), (654.7,0.854,0.879), (656.1,0.74,0.864), (657.6,0.554,0.76), (659.1,0.464,0.621), (660.5,0.446,0.466), (662.3,0.428,0.446), (664,0.422,0.428), (665.4,0.422,0.424), (666.9,0.424,0.43), (668.4,0.43,0.438), (669.9,0.438,0.452), (671.3,0.452,0.468), (672.8,0.468,0.481), (674.3,0.479,0.487), (675.7,0.473,0.487), (677.2,0.458,0.475), (678.7,0.45,0.458), (680.1,0.45,0.462), (681.6,0.46,0.479), (683.1,0.477,0.493), (684.6,0.493,0.501), (686,0.479,0.499), (687.7,0.456,0.481), (689.5,0.45,0.456), (690.9,0.454,0.472), (692.4,0.472,0.499), (693.9,0.497,0.528), (694.9,0.524,0.53)]

def fig2():
    L, R, T, B = 50, 330, 12, 212
    sx = lambda nm: L + (R - L) * (nm - 300) / 400.0
    sy = lambda v: B - (B - T) * v
    b = []
    for i in range(0, 81):                                          # 5 nm minor
        x = sx(300 + 5 * i)
        b.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"%s/>'
                 % (x, T, x, B, ' opacity=".9"' if i % 10 == 0 else ''))
    for i in range(0, 51):                                          # 0.02 minor
        y = sy(0.02 * i)
        b.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"%s/>'
                 % (L, y, R, y, ' opacity=".9"' if i % 5 == 0 else ''))
    b.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
             'stroke-width="1" opacity=".55"/>' % (L, T, R - L, B - T))
    for nm in range(300, 701, 50):
        b.append('<text x="%.1f" y="%d" class="num">%d</text>' % (sx(nm), B + 15, nm))
    for k in range(0, 11):
        b.append('<text x="%d" y="%.1f" class="num" style="text-anchor:end">%.1f</text>'
                 % (L - 5, sy(k / 10.0) + 4, k / 10.0))
    pts = []
    for i, (nm, lo, hi) in enumerate(SPEC):
        if hi - lo < 0.012:
            pts.append((nm, (lo + hi) / 2))
            continue
        nxt = SPEC[i + 1] if i + 1 < len(SPEC) else SPEC[i]
        rising = (nxt[1] + nxt[2]) / 2 > (lo + hi) / 2         # the steep run is drawn as a slope,
        a, b_ = (lo, hi) if rising else (hi, lo)                # not a stair of vertical ticks
        pts += [(nm - 0.6, a), (nm + 0.6, b_)]
    pts = [(300, 0.23)] + pts + [(695, 0.53)]
    b.append('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.3" '
             'stroke-linejoin="round"/>' % ' '.join('%.1f,%.1f' % (sx(a), sy(v)) for a, v in pts))
    b.append(tx(sx(376.5), sy(0.885), '<tspan font-weight="700">X</tspan>'))
    b.append(tx(sx(390.5), sy(0.955), '<tspan font-weight="700">Y</tspan>'))
    b.append(tx((L + R) / 2, B + 36, 'wavelength / nm', cls='ax'))
    b.append('<text x="12" y="%d" class="ax" style="text-anchor:middle" transform="rotate(-90 12 %d)">'
             'intensity / arbitrary units</text>' % ((T + B) / 2, (T + B) / 2))
    return svg(B + 46, 'Figure 2: intensity in arbitrary units from 0 to 1.0 against wavelength '
               'from 300 to 700 nm, a spectrum with several sharp lines; two neighbouring lines near '
               'the left are labelled X and Y.', b)

# ---------------------------------------------------------------------------------------------
# FIGURE 3 — the cable, from the page's own geometry (657 × 394 image, s = 0.5).
# ---------------------------------------------------------------------------------------------
def fig3():
    s = 0.5
    X = lambda x: 5 + x * s
    Y = lambda y: 10 + y * s
    b = [ln(X(5), Y(388), X(655), Y(388))]
    b.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="currentColor" fill-opacity=".3" '
             'stroke="currentColor" stroke-width="1"/>' % (X(86), Y(28), 10 * s, 360 * s))      # post A
    b.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="currentColor" fill-opacity=".3" '
             'stroke="currentColor" stroke-width="1"/>' % (X(96), Y(141), 45 * s, 9 * s))       # platform
    b.append(ln(X(138), Y(150), X(138), Y(388)))
    b.append(ln(X(30), Y(388), X(88), Y(140)) + ln(X(37), Y(388), X(92), Y(150)))            # strut
    b.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="currentColor" fill-opacity=".3" '
             'stroke="currentColor" stroke-width="1"/>' % (X(621), Y(265), 9 * s, 123 * s))     # post B
    b.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width=".8"/>'
             % (X(94), Y(50), X(475), Y(310)))
    b.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width=".8"/>'
             % (X(475), Y(310), X(625), Y(287)))
    b.append('<circle cx="%.1f" cy="%.1f" r="3" fill="currentColor"/>' % (X(475), Y(310)))
    b.append(ln(X(475), Y(313), X(475), Y(326)))
    b.append('<path d="M%.1f %.1f q-12 4 -10 20 q12 6 22 0 q2 -16 -12 -20 z" fill="currentColor" '
             'fill-opacity=".15" stroke="currentColor" stroke-width="1"/>' % (X(475), Y(326)))
    b.append(tx(X(476), Y(360), '<tspan font-weight="700">O</tspan>'))
    b.append(tx(X(475), Y(298), '<tspan font-weight="700">P</tspan>'))
    b.append(tx(X(91), Y(20), '<tspan font-weight="700">A</tspan>'))
    b.append(tx(X(626), Y(258), '<tspan font-weight="700">B</tspan>'))
    return svg(int(Y(392)) + 4, 'Figure 3: a tall vertical post A on the left, braced by a strut and '
               'a small platform, and a shorter post B on the right. A cable runs from the top of A '
               'steeply down to a pulley P, from which object O hangs, then less steeply up to the top '
               'of B.', b)

# ---------------------------------------------------------------------------------------------
# FIGURE 4 — the scale drawing. Measured endpoints in the 476 × 187 image: T1 from the vertex
# (238.6, 167.3) to (4.5, 4.5); T2 from the vertex to (472, 119.5). Drawn at s = 0.62 with room
# below the vertex for the weight vector the student adds.
# ---------------------------------------------------------------------------------------------
F4_V, F4_T1, F4_T2 = (238.6, 167.3), (4.5, 4.5), (472.0, 119.5)

def fig4():
    s = 0.62
    X = lambda x: 14 + x * s
    Y = lambda y: 14 + y * s
    vx, vy = X(F4_V[0]), Y(F4_V[1])
    b = [ln(vx, vy, X(F4_T1[0]), Y(F4_T1[1])), ln(vx, vy, X(F4_T2[0]), Y(F4_T2[1]))]
    for end, lab, dx, dy in ((F4_T1, 'T<tspan baseline-shift="sub" font-size="75%">1</tspan>', -10, 16),
                             (F4_T2, 'T<tspan baseline-shift="sub" font-size="75%">2</tspan>', 4, 18)):
        mx, my = (vx + X(end[0])) / 2, (vy + Y(end[1])) / 2
        b.append(head(mx, my, math.atan2(Y(end[1]) - vy, X(end[0]) - vx)))
        b.append('<text x="%.1f" y="%.1f" class="lbl" style="text-anchor:middle;font-style:italic">%s</text>'
                 % (mx + dx, my + dy, lab))
    return svg(int(vy + 150), 'Figure 4: a force diagram drawn to scale. From one point, a line '
               'labelled T1 runs up and to the left at about 35 degrees above the horizontal, and a '
               'shorter line labelled T2 runs up and to the right at about 11 degrees above the '
               'horizontal, each with an arrow pointing away from the point. There is space below '
               'for the diagram to be completed.', b)

# ---------------------------------------------------------------------------------------------
# FIGURE 5 — the circuit: battery in the top wire; thermistor X–Y and variable resistor Y–Z below.
# ---------------------------------------------------------------------------------------------
def fig5():
    L, R, T, B = 60, 290, 22, 120
    b = [ln(L, T, 160, T), ln(190, T, R, T), ln(L, T, L, B), ln(R, T, R, B)]
    b.append(ln(160, T - 12, 160, T + 12) + ln(166, T - 6, 166, T + 6))           # cell 1
    b.append(ln(166, T, 184, T, ' stroke-dasharray="3 2"'))
    b.append(ln(184, T - 12, 184, T + 12) + ln(190, T - 6, 190, T + 6))           # cell 2
    b.append(ln(L, B, 100, B) + ln(130, B, 220, B) + ln(250, B, R, B))
    b.append('<rect x="100" y="%d" width="30" height="12" fill="none" stroke="currentColor" '
             'stroke-width="1.2"/>' % (B - 6))
    b.append(poly([(98, B + 12), (126, B - 12), (134, B - 12)]))                 # thermistor
    b.append('<rect x="220" y="%d" width="30" height="12" fill="none" stroke="currentColor" '
             'stroke-width="1.2"/>' % (B - 6))
    b.append(arrow(215, B + 13, 256, B - 14))                                    # variable resistor
    for x, lab in ((L, 'X'), (175, 'Y'), (R, 'Z')):
        b.append('<circle cx="%d" cy="%d" r="2.8" fill="currentColor"/>' % (x, B))
        b.append(tx(x, B + 18, '<tspan font-weight="700">%s</tspan>' % lab))
    return svg(B + 26, 'Figure 5: a series circuit of a battery, a thermistor between points X and '
               'Y, and a variable resistor between points Y and Z.', b)

# ---------------------------------------------------------------------------------------------
# FIGURE 6 and FIGURE 7 — the stationary wave, and the blank grid for 07.4.
# ---------------------------------------------------------------------------------------------
A6, LAM6, LEN6 = 7.0, 0.70, 1.05
XS = LAM6 * math.asin(4 / A6) / (2 * math.pi)                  # S, on the first rising slope

def fig6():
    def extra(sx, sy):
        p = ['<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>' % (sx(0), sy(0), sx(1.1), sy(0))]
        pts = [(sx(i * LEN6 / 210), sy(A6 * math.sin(2 * math.pi * i * LEN6 / 210 / LAM6))) for i in range(211)]
        p.append('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.5"/>'
                 % ' '.join('%.1f,%.1f' % q for q in pts))
        cx, cy = sx(XS), sy(4)
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>' % (cx - 3, cy - 3, cx + 3, cy + 3))
        p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>' % (cx - 3, cy + 3, cx + 3, cy - 3))
        p.append(tx(cx - 4, cy - 6, '<tspan font-weight="700">S</tspan>', 'end'))
        return ''.join(p)
    return axes(1.1, 8, 0.2, 2, 'distance / m', 'displacement / mm',
                'Figure 6: displacement in mm against distance along the string in m at t = 0, a '
                'curve starting at zero at 0 m, with the point S marked on it', extra,
                ymin=-8, xminor=0.02, yminor=0.4)

def fig7():
    def extra(sx, sy):
        return '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>' % (sx(0), sy(0), sx(2.25), sy(0))
    return axes(2.25, 8, 0.5, 2, 't / ms', 'displacement / mm',
                'Figure 7: an empty grid, displacement from −8 to 8 mm against t from 0 to 2.25 ms',
                extra, ymin=-8, xminor=0.05, yminor=0.4)

# ---------------------------------------------------------------------------------------------
# Section B diagrams, redrawn from the page's own layout.
# ---------------------------------------------------------------------------------------------
def panel(ox, oy, w, h, ylab, xlab, body, title):
    """A small sketch-graph: axes from (ox, oy) with the origin at the bottom left."""
    p = [tx(ox + w / 2, oy - h - 8, '<tspan font-weight="700">%s</tspan>' % title)]
    p.append(ln(ox, oy, ox, oy - h) + ln(ox, oy, ox + w, oy))
    p.append(tx(ox - 4, oy - h + 8, ylab, 'end'))
    p.append(tx(ox + w, oy + 14, xlab, 'end'))
    p.append(tx(ox - 4, oy + 4, '0', 'end') + tx(ox, oy + 14, '0'))
    return ''.join(p) + body

def q9():
    b = []
    EK = '<tspan font-style="italic">E</tspan><tspan baseline-shift="sub" font-size="70%">k(max)</tspan>'
    F = '<tspan font-style="italic">f</tspan>'
    for i, (kind, left, right) in enumerate((('par', 'Y', 'X'), ('fan', 'Y', 'X'),
                                             ('par', 'X', 'Y'), ('fan', 'X', 'Y'))):
        ox, oy = 60 + (i % 2) * 165, 130 + (i // 2) * 150
        w, h = 110, 100
        body = []
        if kind == 'par':
            body.append(ln(ox + 26, oy, ox + 72, oy - h) + ln(ox + 52, oy, ox + 98, oy - h))
            body.append(tx(ox + 36, oy - 56, left) + tx(ox + 90, oy - 56, right))
        else:
            body.append(ln(ox + 26, oy, ox + 72, oy - h) + ln(ox + 26, oy, ox + 110, oy - 82))
            body.append(tx(ox + 40, oy - 62, left) + tx(ox + 88, oy - 48, right))
        b.append(panel(ox, oy, w, h, EK, F, ''.join(body), 'ABCD'[i]))
    return svg(300, 'Four graphs A to D of maximum kinetic energy against frequency f, each with '
               'two straight lines labelled X and Y. A: two parallel lines, Y crossing the f axis '
               'at a lower frequency than X. B: two lines from the same point on the f axis, Y the '
               'steeper. C: two parallel lines, X crossing the f axis at a lower frequency than Y. '
               'D: two lines from the same point on the f axis, X the steeper.', b)

def q11():
    b = [ln(60, 20, 220, 20), ln(60, 55, 220, 55), ln(60, 170, 220, 170)]
    b.append(tx(226, 24, '−1.0 eV', 'start') + tx(226, 59, '−6.0 eV', 'start') + tx(226, 174, '−21.0 eV', 'start'))
    b.append(arrow(105, 20, 105, 55) + arrow(155, 55, 155, 170))
    b.append(tx(112, 42, '<tspan font-style="italic">E</tspan><tspan baseline-shift="sub" font-size="70%">1</tspan>', 'start'))
    b.append(tx(162, 116, '<tspan font-style="italic">E</tspan><tspan baseline-shift="sub" font-size="70%">2</tspan>', 'start'))
    return svg(184, 'Three energy levels at −1.0 eV, −6.0 eV and −21.0 eV. E1 is an arrow down from '
               '−1.0 eV to −6.0 eV; E2 is an arrow down from −6.0 eV to −21.0 eV.', b)

def q15():
    b = ['<rect x="150" y="34" width="20" height="200" fill="none" stroke="currentColor" stroke-width="1.2"/>',
         '<rect x="150" y="150" width="20" height="84" fill="currentColor" fill-opacity=".2"/>']
    b.append('<rect x="147" y="4" width="26" height="14" fill="currentColor" fill-opacity=".35" '
             'stroke="currentColor" stroke-width="1"/>')
    b.append(ln(147, 18, 138, 30) + ln(173, 18, 182, 30))
    b.append('<circle cx="160" cy="242" r="7" fill="none" stroke="currentColor" stroke-width="1.2"/>')
    b.append(ln(155, 237, 165, 247) + ln(155, 247, 165, 237))
    b.append('<rect x="156" y="249" width="8" height="28" fill="none" stroke="currentColor" stroke-width="1.2"/>')
    b.append(ln(174, 34, 222, 34, DASH) + ln(174, 92, 196, 92, DASH) + ln(172, 150, 222, 150, DASH))
    b.append(arrow(190, 63, 190, 36) + arrow(190, 63, 190, 90))
    b.append(arrow(216, 92, 216, 36) + arrow(216, 92, 216, 148))
    b.append(tx(196, 67, '<tspan font-style="italic">L</tspan><tspan baseline-shift="sub" font-size="70%">1</tspan>', 'start'))
    b.append(tx(222, 96, '<tspan font-style="italic">L</tspan><tspan baseline-shift="sub" font-size="70%">2</tspan>', 'start'))
    b.append(tx(128, 14, 'loudspeaker', 'end') + ln(130, 11, 146, 11))
    b.append(tx(118, 80, 'tube', 'end') + ln(120, 77, 149, 85))
    b.append(tx(118, 190, 'water', 'end') + ln(120, 187, 152, 196))
    return svg(282, 'A loudspeaker above a vertical tube partly filled with water, with a tap at the '
               'bottom. L1 is marked from the top of the tube to a first level below it, and L2 from '
               'the top of the tube down to the water surface.', b)

def q16():
    b = ['<circle cx="70" cy="95" r="3.5" fill="currentColor"/>', '<circle cx="70" cy="150" r="3.5" fill="currentColor"/>']
    b.append(tx(62, 99, 'S<tspan baseline-shift="sub" font-size="70%">2</tspan>', 'end'))
    b.append(tx(62, 154, 'S<tspan baseline-shift="sub" font-size="70%">1</tspan>', 'end'))
    b.append(ln(260, 20, 260, 215))
    b.append(tx(260, 14, '<tspan font-weight="700">Q</tspan>') + tx(260, 230, '<tspan font-weight="700">P</tspan>'))
    for y, lab in ((32, 'Z'), (52, 'Y'), (72, 'X'), (92, 'W')):
        b.append('<circle cx="260" cy="%d" r="2.8" fill="currentColor"/>' % y)
        b.append(tx(268, y + 4, '<tspan font-weight="700">%s</tspan>' % lab, 'start'))
    return svg(236, 'Two point sources S2 (upper) and S1 (lower) on the left. On the right a vertical '
               'line from P at the bottom to Q at the top, with points W, X, Y and Z marked in that '
               'order going up, near Q.', b)

def q18():
    b = [poly([(30, 150), (300, 150), (300, 94), (30, 150)])]
    a = math.atan2(56, 270)
    ux, uy = math.cos(a), -math.sin(a)
    px, py = 30 + 170 * ux, 150 + 170 * uy                         # box on the slope
    nx, ny = -uy, ux
    nx, ny = uy, -ux                                             # outward normal (up)
    nx, ny = -math.sin(a), -math.cos(a)
    box = [(px, py), (px + 42 * ux, py + 42 * uy), (px + 42 * ux + 28 * nx, py + 42 * uy + 28 * ny),
           (px + 28 * nx, py + 28 * ny)]
    b.append('<polygon points="%s" fill="currentColor" fill-opacity=".35" stroke="currentColor" '
             'stroke-width="1.2"/>' % ' '.join('%.1f,%.1f' % q for q in box))
    ox, oy = px + 42 * ux + 14 * nx, py + 42 * uy + 14 * ny           # force applied at the box's face
    ang = a + math.radians(35)
    b.append(arrow(ox, oy, ox + 78 * math.cos(ang), oy - 78 * math.sin(ang)))
    b.append(ln(ox, oy, ox + 80 * ux, oy + 80 * uy, DASH))
    b.append('<path d="M%.1f %.1f A 30 30 0 0 0 %.1f %.1f" fill="none" stroke="currentColor" stroke-width=".8"/>'
             % (ox + 30 * ux, oy + 30 * uy, ox + 30 * math.cos(ang), oy - 30 * math.sin(ang)))
    b.append(tx(ox + 38 * math.cos(a + math.radians(18)), oy - 38 * math.sin(a + math.radians(18)) + 4,
                '<tspan font-style="italic">β</tspan>'))
    b.append(tx(ox + 82 * math.cos(ang) + 2, oy - 82 * math.sin(ang) - 4, '<tspan font-style="italic">F</tspan>', 'start'))
    b.append('<path d="M 80 150 A 50 50 0 0 0 %.1f %.1f" fill="none" stroke="currentColor" stroke-width=".8"/>'
             % (30 + 50 * math.cos(a), 150 - 50 * math.sin(a)))
    b.append(tx(95, 146, '<tspan font-style="italic">α</tspan>'))
    return svg(162, 'A box on a slope inclined at angle alpha to the horizontal. A force F acts on '
               'the box at angle beta above the slope, drawn from the up-slope face of the box.', b)

def q19():
    b = [ln(60, 10, 60, 190)]
    b.append('<line x1="60" y1="120" x2="260" y2="120" stroke="currentColor" stroke-width="4"/>')
    b.append('<circle cx="60" cy="120" r="5" fill="currentColor"/>')
    b.append(ln(60, 20, 160, 120))
    b.append('<path d="M 60 44 A 24 24 0 0 0 77 37" fill="none" stroke="currentColor" stroke-width=".8"/>')
    b.append(tx(67, 56, '<tspan font-style="italic">θ</tspan>'))
    b.append(ln(260, 120, 260, 158))
    b.append('<rect x="248" y="158" width="24" height="20" fill="none" stroke="currentColor" stroke-width="1"/>')
    b.append(tx(260, 173, '<tspan font-style="italic">W</tspan>'))
    b.append(tx(300, 20, '<tspan font-weight="700">not to scale</tspan>', 'end'))
    return svg(198, 'A horizontal bar pivoted at its left end on a vertical wall. A rope runs from the '
               'wall, above the pivot, down to the centre of the bar, making angle theta with the '
               'wall. A weight W hangs from the right-hand end of the bar. Not to scale.', b)

def q20():
    b = [ln(20, 150, 330, 150)]
    pts = [(30 + 280 * t, 150 - 4 * 130 * t * (1 - t)) for t in [i / 60.0 for i in range(61)]]
    b.append('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.5"/>'
             % ' '.join('%.1f,%.1f' % q for q in pts))
    ang = math.atan2(4 * 130, 280)
    b.append(arrow(30, 150, 30 + 80 * math.cos(ang), 150 - 80 * math.sin(ang)))
    b.append(tx(30 + 86 * math.cos(ang), 150 - 86 * math.sin(ang) - 2, '<tspan font-style="italic">u</tspan>'))
    b.append('<path d="M 55 150 A 25 25 0 0 0 %.1f %.1f" fill="none" stroke="currentColor" stroke-width=".8"/>'
             % (30 + 25 * math.cos(ang), 150 - 25 * math.sin(ang)))
    b.append(tx(64, 144, '<tspan font-style="italic">θ</tspan>'))
    b.append(arrow(170, 166, 30, 166) + arrow(190, 166, 310, 166))
    b.append(tx(180, 170, '<tspan font-style="italic">d</tspan>'))
    return svg(178, 'A projectile path: a symmetrical arc from the launch point to where it lands on '
               'level ground, the launch velocity u at angle theta above the horizontal, and the '
               'range d marked below.', b)

def q22():
    b = []
    G = '<tspan font-style="italic">g</tspan>'
    for i in range(4):
        ox, oy = 45 + (i % 2) * 165, 128 + (i // 2) * 146
        w, h, gT, gy = 115, 100, 75, 55
        body = [ln(ox, oy - gy, ox + gT, oy - gy, DASH), ln(ox + gT, oy - gy, ox + gT, oy, DASH)]
        if i == 0:
            body.append(ln(ox, oy, ox + gT, oy - gy))
        elif i == 1:
            body.append('<path d="M %.1f %.1f Q %.1f %.1f %.1f %.1f" fill="none" stroke="currentColor" '
                        'stroke-width="1.3"/>' % (ox, oy - h + 4, ox + 20, oy - gy + 2, ox + gT, oy - gy))
        elif i == 2:
            body.append('<path d="M %.1f %.1f Q %.1f %.1f %.1f %.1f" fill="none" stroke="currentColor" '
                        'stroke-width="1.3"/>' % (ox, oy, ox + 20, oy - gy - 2, ox + gT, oy - gy))
        else:
            body.append(ln(ox, oy - gy, ox + gT, oy - gy))
        body.append(tx(ox - 4, oy - gy + 4, G, 'end'))
        body.append(tx(ox + gT, oy + 14, '<tspan font-style="italic">T</tspan>'))
        b.append(panel(ox, oy, w, h, '<tspan font-style="italic">a</tspan>', '<tspan font-style="italic">t</tspan>',
                       ''.join(body), 'ABCD'[i]))
    return svg(290, 'Four graphs A to D of a against t up to t = T, each with g marked on the a axis. '
               'A: a straight line rising from 0 to g at T. B: a curve falling from above g and '
               'levelling off to g at T. C: a curve rising steeply from 0 and levelling off to g at T. '
               'D: a horizontal line at g.', b)

def q28():
    cx, cy, r = 170, 128, 70
    b = ['<circle cx="%d" cy="%d" r="%d" fill="none" stroke="currentColor" stroke-width="1.2"/>' % (cx, cy, r)]
    py = cy - 42
    b.append(ln(cx, 18, cx, cy, DASH) + ln(cx - 95, py, cx + 95, py, DASH))
    b.append('<circle cx="%d" cy="%d" r="6" fill="currentColor"/>' % (cx, py))
    b.append('<circle cx="%d" cy="%d" r="2.8" fill="currentColor"/>' % (cx, cy))
    b.append(tx(cx, 12, '<tspan font-weight="700">S</tspan>'))
    b.append(tx(cx - 100, py + 4, '<tspan font-weight="700">Q</tspan>', 'end'))
    b.append(tx(cx + 100, py + 4, '<tspan font-weight="700">R</tspan>', 'start'))
    b.append(tx(cx - 8, py + 18, '<tspan font-weight="700">P</tspan>'))
    b.append(tx(cx, cy + 18, '<tspan font-weight="700">O</tspan>'))
    a0, a1 = math.radians(35), math.radians(75)
    r2 = r + 10
    b.append('<path d="M %.1f %.1f A %d %d 0 0 1 %.1f %.1f" fill="none" stroke="currentColor" stroke-width="1"/>'
             % (cx + r2 * math.cos(a0), cy + r2 * math.sin(a0), r2, r2, cx + r2 * math.cos(a1), cy + r2 * math.sin(a1)))
    b.append(head(cx + r2 * math.cos(a1), cy + r2 * math.sin(a1), a1 + math.pi / 2))
    b.append(tx(334, 14, 'view of turntable from above', 'end', 'ax'))
    return svg(218, 'A turntable seen from above, centre O. P is a small mass between O and the edge, '
               'directly above O on the page. A dashed line runs from S above the turntable down '
               'through P to O; a dashed line through P runs horizontally from Q on the left to R on '
               'the right. An arrow round the edge shows the turntable turning clockwise.', b)

# ---------------------------------------------------------------------------------------------
# stems
# ---------------------------------------------------------------------------------------------
STEM2 = ('<p>A positive pion collides with a neutron and the following interaction is observed:</p>'
         '<p>&pi;<sup>+</sup> + n &rarr; K<sup>+</sup> + &Sigma;<sup>0</sup></p>'
         '<p>&Sigma;<sup>0</sup> is a neutral sigma particle with a strangeness of &minus;1</p>'
         '<p>The interaction can be used to deduce the classifications of the &Sigma;<sup>0</sup>.</p>')
STEM3 = ('<p><b>Figure 1</b> shows two prisms <b>A</b> and <b>B</b> of different refractive indices '
         'joined to make a block. A ray of monochromatic light is shown entering and then leaving the '
         'block.</p>')
STEM4 = ('<p>The deuterium&ndash;tritium (D&ndash;T) reaction is a nuclear reaction between two '
         'isotopes of hydrogen. The D&ndash;T reaction is</p>'
         '<p><sup>2</sup><sub>1</sub>H + <sup>3</sup><sub>1</sub>H &rarr; <sup>4</sup><sub>2</sub>He + n</p>'
         '<p>The energy from this reaction is transferred to the kinetic energy of the helium nucleus '
         'and the kinetic energy of the neutron.</p><p>Assume that the kinetic energies of the '
         'hydrogen nuclei are zero just before the reaction occurs.</p>')
STEM5 = ('<p>A cable system is to be used to transfer supplies across a river. A model of the proposed '
         'system is built in order to test its performance.</p><p>The model consists of a cable '
         'attached to two vertical posts <b>A</b> and <b>B</b>, as shown in <b>Figure 3</b>. A pulley '
         '<b>P</b> of negligible mass is attached to the cable.</p><p>In this question the length of '
         'the cable does not change and the weight of the cable can be ignored.</p><p>An object '
         '<b>O</b> is attached to <b>P</b>. In one test, <b>O</b> and <b>P</b> are at rest in the '
         'position shown in <b>Figure 3</b>. The weight of <b>O</b> is 350 N.</p>')
STEM6 = ('<p>The circuit in <b>Figure 5</b> is used as part of a temperature sensor. The battery has '
         'an emf of 6.5 V and negligible internal resistance.</p><p>The initial temperature of the '
         'thermistor is 22 &deg;C. At this temperature the resistance of the thermistor is 350 '
         '&Omega; and the circuit current is 12 mA.</p>')
STEM7 = ('<p>An experiment is done to investigate stationary waves on a string. A string of length '
         '1.05 m is attached between a clamp stand and a vibration generator. A stationary wave is '
         'formed on the string when the vibration generator frequency is 625 Hz.</p><p><b>Figure '
         '6</b> shows the variation of displacement with distance from one end of the string at time '
         '<i>t</i> = 0. At this time all points on the string have their maximum displacement. '
         '<b>S</b> is one point on the string.</p><p>The stationary wave is produced by two '
         'progressive waves travelling in opposite directions on the string.</p>')

TABLE1 = ('<p><b>Table 1</b></p><table><tr><th>Particle</th><th>Baryon</th><th>Hadron</th>'
          '<th>Lepton</th><th>Meson</th></tr>'
          + ''.join('<tr><td>%s</td><td></td><td></td><td></td><td></td></tr>' % p for p in
                    ('&pi;<sup>+</sup>', 'n', 'K<sup>+</sup>', '&Sigma;<sup>0</sup>')) + '</table>')

def opts(*o):
    return ''.join('<p><b>%s</b>&nbsp; %s</p>' % ('ABCD'[i], s) for i, s in enumerate(o))

FR = lambda a, b: ('<span class="frac"><span class="frac-n">%s</span><span class="frac-d">%s</span></span>' % (a, b))
SQ2 = '&radic;2'

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, accept)
Q = [
 # ---------------------------------------------------------------- Section A
 ('1', '1', 1, 'written', PART, '', '',
  '<p>State the names of the four fundamental interactions.</p>',
  'Gravity, weak (nuclear), strong (nuclear), electromagnetic — in any order, all four needed. '
  '"Interaction" or "force" and "gravitational" are condoned; "electrostatic", "gravitational '
  'potential", "em" and "EM" are not accepted.', ''),
 ('1', '2', 1, 'short', PART, '', '',
  '<p>State the products of the decay of a free neutron.</p>',
  'A proton, a beta-minus particle (electron, e, e⁻, β⁻) and an (electron) antineutrino — all '
  'three needed. "Anti electron neutrino" is condoned.', ''),
 ('1', '3', 2, 'explain', PART, '', '',
  '<p>Explain which of the fundamental interactions is responsible for the decay of the '
  'neutron.</p>',
  'The weak (nuclear) interaction (1); because it involves leptons, which do not experience the '
  'strong interaction, or because there is a change in quark flavour — a d quark changes to a u '
  'quark (1). A reference to the W⁻ (or W) together with the transfer of charge from the neutron '
  'is also accepted. The second mark depends on the first.', ''),
 ('1', '4', 3, 'explain', PART, '', '',
  '<p>The forces between two moving electrons cause their paths to change.</p><p>Explain, using '
  'the concept of exchange particles, why the electron paths change.</p>',
  'The exchange particle is a (virtual) photon (1); (virtual) photons / the exchange particles '
  'carry momentum (1); conservation of momentum means the photon interchange changes the '
  'electrons\' momentum and so their paths (1). γ is accepted for photon.', ''),

 ('2', '1', 2, 'annotate', PART, 'table', '',
  '<p>Identify the classifications of each particle in <b>Table 1</b>.</p><p>Tick (&#10003;) the '
  'appropriate boxes for each particle.</p>' + TABLE1,
  'π⁺: hadron and meson. n: baryon and hadron. K⁺: hadron and meson. Σ⁰: baryon and hadron. '
  'All four rows correct 2 marks; any two rows correct 1 mark.', ''),
 ('2', '2', 3, 'explain', PART, '', '',
  '<p>A conservation rule predicts that the following interaction <b>cannot</b> occur:</p>'
  '<p>&pi;<sup>&minus;</sup> + n &rarr; K<sup>&minus;</sup> + &Sigma;<sup>0</sup></p>'
  '<p>State the conservation rule.</p><p>Go on to explain your answer.</p>',
  'Conservation of strangeness, as the interaction would be strong, not weak (1). K⁻ and Σ⁰ each '
  'have strangeness −1 (1). The strangeness is 0 + 0 on the left and −1 + (−1) = −2 on the right, '
  'so it is not conserved (1 — must show the two sides unequal AND the left-hand side zero). No '
  'first mark for saying some other quantum number is not conserved.', ''),
 ('2', '3', 2, 'explain', PART, '', '',
  '<p>One way in which neutral pions decay is</p><p>&pi;<sup>0</sup> &rarr; &gamma; + '
  'e<sup>+</sup> + e<sup>&minus;</sup></p><p>Compare the rest energies of the particles involved '
  'in this decay.</p>',
  'Each particle given its correct rest energy, including the photon (1): π⁰ 134.972 MeV, the '
  'electron and the positron 0.510999 MeV each, the photon zero (rounded values allowed). The '
  'rest energy on the left is greater than the total on the right (1).', ''),
 ('2', '4', 1, 'written', PART, '', '',
  '<p>The decay of the neutral pion leads to the production of further gamma photons.</p><p>'
  'Explain why.</p>',
  'The positron annihilates with an electron. Answers such as "elimination" are not allowed.', ''),
 ('2', '5', 1, 'written', PART, '', '',
  '<p>The Standard Model is a theory that classifies elementary particles.</p><p>Evidence for the '
  'theory has been collected since about 1950. However, the term Standard Model has only been '
  'used since 1973.</p><p>Suggest why progress in particle physics is slow.</p>',
  'International collaboration / co-operation / verification is required, OR (investment in) '
  'expensive equipment, hardware or infrastructure is required. The idea that people with '
  'particular specialist talents, technology or infrastructure must be in place is accepted. '
  'Peer review and vague statements ("it takes a long time", "the research is expensive") are '
  'ignored.', ''),

 ('3', '1', 1, 'drawing', WAVE, 'diagram', fig1(),
  '<p>Complete, on <b>Figure 1</b>, the path of the ray of light inside the block.</p>',
  'The ray through A joins up with the ray in B, and the ray in B is horizontal (by eye). Arrow '
  'directions are ignored.', ''),
 ('3', '2', 2, 'explain', WAVE, '', '',
  '<p>Deduce which prism, <b>A</b> or <b>B</b>, has the greater refractive index.</p>',
  'For a correct diagram: B has the greater refractive index (A the lower) (1), supported by the '
  'angles at the A–B boundary — the angle of incidence is greater than the angle of refraction, '
  'i.e. the ray bends towards the normal (1). The conclusion must be consistent with the '
  'student\'s own Figure 1.', ''),
 ('3', '3', 1, 'written', WAVE, '', '',
  '<p>The block is used with a telescope to investigate stars.</p><p>The block can be replaced '
  'with a diffraction grating.</p><p>Describe <b>one</b> non-astronomical application of a '
  'diffraction grating.</p>',
  'An appropriate application with how the grating is used described, e.g. used to determine the '
  'wavelength of a named light source; to identify elements in / analyse the chemical '
  'composition of a sample; to stabilise or filter laser light; to provide a monochromatic source '
  '/ select a particular wavelength; in optical encoders for high-precision motor control; to '
  'spread the light evenly in e-readers. Condoned: identifying authentic bank notes; light shows '
  'or diffraction glasses; analysing light from the Sun.', ''),
 ('3', '4', 3, 'calculation', WAVE, 'graph', fig2(),
  '<p><b>Figure 2</b> shows a spectrum of light. Two lines in the spectrum are labelled <b>X</b> '
  'and <b>Y</b>.</p><p>The light passes at normal incidence through a diffraction grating. The '
  'number of lines per metre for the grating is <i>G</i>.</p><p>The first-order diffraction angle '
  'of <b>X</b> is at 28.2&deg; to the normal.</p><p>Calculate <i>G</i>.</p>'
  '<p><i>G</i> = ______ m<sup>&minus;1</sup></p>',
  'G = 1.2 × 10⁶ m⁻¹. Any two of: λ of X read from the spectrum as 380 nm (377.5 to 382.5 nm '
  'accepted); use of d sin θ = nλ (n = 1 assumed if not seen), giving d = 8.04 × 10⁻⁷ m; use of '
  'G = 1/d to give 1.2 × 10⁶ m⁻¹ (3 marks). Calculator values 1.2358 to 1.2518 × 10⁶ m⁻¹ '
  '(1.2436 × 10⁶ for 380 nm). A power-of-ten error is ignored in the first two marks.',
  '1235000 to 1252000 | 1.2 × 10^6 | 1.2x10^6 | 1.24 × 10^6 | 1.25 × 10^6'),
 ('3', '5', 3, 'explain', WAVE, '', '',
  '<p>A scientist wants to obtain an accurate value for the difference in wavelength between line '
  '<b>X</b> and line <b>Y</b> (<b>Figure 2</b>).</p><p>She has two options:</p><ul><li>option 1: '
  'to analyse the second-order spectrum from the original grating</li><li>option 2: to analyse '
  'the first-order spectrum from a grating with 2<i>G</i> lines per metre.</li></ul><p>Discuss '
  'which option she should choose.</p>',
  'An argument using sin θ = nGλ (or equivalent) comparing the effect of n = 2 with G′ = 2G (1); '
  'the angular separations are the same for both options (1); option 2 (the 2G grating) should be '
  'used because the n = 2 spectrum could overlap with other orders, obscuring lines — or because '
  'its maxima are better defined, or because the second-order spectrum would be dimmer (first '
  'order with 2G brighter) (1).', ''),

 ('4', '1', 2, 'proof', NUC + ', ' + MECH, '', '',
  '<p>Show that the kinetic energy of the neutron represents approximately 80% of the total energy '
  'transferred.</p>',
  'Either: the mass of He is 4 × the mass of the neutron, OR the neutron and the He nucleus have '
  'equal and opposite momenta (1); combining the momentum and kinetic energy equations, '
  'KE = p²/2m, so with the same p the KE is inversely proportional to m, and the KE of the neutron '
  'is 4 × the KE of the helium nucleus — 4/5 = 80% of the total (1).', ''),
 ('4', '2', 2, 'calculation', NUC + ', ' + MECH, '', '',
  '<p>The combined kinetic energy of the helium nucleus and the neutron is 2.82 &times; '
  '10<sup>&minus;12</sup> J.</p><p>Calculate the initial speed of the neutron.</p>'
  '<p>initial speed = ______ m s<sup>&minus;1</sup></p>',
  'v = 5.2 × 10⁷ m s⁻¹. KE of the neutron = 80% × 2.82 × 10⁻¹² = 2.26 × 10⁻¹² J, used with the '
  'neutron mass 1.67(5) × 10⁻²⁷ kg in ½mv² (1); v = 5.2 × 10⁷ m s⁻¹ (1). 5.18 × 10⁷ and '
  '5.19 × 10⁷ are also accepted. Using 2.82 × 10⁻¹² J as the neutron\'s KE is not allowed.',
  '51800000 to 52000000 | 5.2 × 10^7 | 5.2x10^7 | 5.18 × 10^7 | 5.19 × 10^7'),

 ('5', '1', 4, 'drawing', MECH, 'diagram', fig4(),
  '<p><b>Figure 4</b> is a force diagram drawn to scale. It represents the magnitudes and '
  'directions of the tensions <i>T</i><sub>1</sub> and <i>T</i><sub>2</sub> in the cable when '
  '<b>O</b> is at rest in the position shown in <b>Figure 3</b>. At this position, resistive '
  'forces are zero.</p><p>Complete the force diagram.</p><p>Go on to determine, using your '
  'diagram, the magnitudes of <i>T</i><sub>1</sub> and <i>T</i><sub>2</sub>.</p>'
  '<p><i>T</i><sub>1</sub> = ______ N<br><i>T</i><sub>2</sub> = ______ N</p>',
  'T₁ = 480 N and T₂ = 400 N (T₁ 470–490 N and T₂ 390–410 N accepted). Complete a parallelogram or '
  'triangle to draw W (1); use the drawn W (350 N) to find the scale — on the printed paper '
  '350 N ↔ 35 mm, 10 N mm⁻¹ (1); use the scale to get T₁ and T₂ — about 48 mm and 40 mm (1); the '
  'values (1). Alternative: measure the angles, (34–35)° and (11–12)° to the horizontal (1), then '
  'resolve: T₁ sin 34° + T₂ sin 11° = 350 and T₁ cos 34° = T₂ cos 11° (1), giving the values (1). '
  'The sine or cosine rule applied correctly is also allowed.', ''),
 ('5', '2', 5, 'calculation', MECH, '', '',
  '<p>In a second test, pulley <b>P</b> with <b>O</b> attached is released from <b>A</b>. '
  '<b>P</b> and <b>O</b> move along the cable to <b>B</b>.</p><p>The change in height of the '
  'centre of mass of <b>O</b> between <b>A</b> and <b>B</b> is 4.5 m. The distance travelled '
  'along the cable is 18 m. The speed of <b>O</b> when it reaches <b>B</b> is 6.5 m '
  's<sup>&minus;1</sup>.</p><p>Calculate the average resistive force on <b>O</b> and <b>P</b> as '
  'they move from <b>A</b> to <b>B</b>.</p><p>average resistive force = ______ N</p>',
  '46 N. Max 4 from: m = 350/g = 36 kg; their m in KE with v = 6.5 m s⁻¹ at B (754 J); 350 N and '
  '4.5 m in the GPE equation (1575 J); ΔGPE − ΔKE = work done against friction (821 J); '
  'friction force = work done ÷ 18. Then the average force = 46 N (1). Alternative (with a labelled '
  'diagram): m = 350/g; suvat gives a = 1.17 m s⁻²; F = ma for the resultant force; the effective '
  'component of weight 350 × (4.5 ÷ 18); subtract the resultant from that component. Answers that '
  'round to 46 N are accepted.', '45.5 to 46.49'),
 ('5', '3', 3, 'explain', MECH, '', '',
  '<p><b>O</b> contains a fragile item packed in suitable material.</p><p>Explain how the '
  'material can prevent damage to the fragile item when <b>O</b> stops suddenly at <b>B</b>.</p>',
  'The contact time, or the distance travelled during contact, is increased (1); then a physical '
  'principle (1) and its application to why the force is reduced (1), by any one of: momentum — '
  'force is the rate of change of momentum, and the change in momentum (impulse, F × Δt) is '
  'constant, so the force decreases; energy — force × distance = change in KE (work done), which '
  'is constant, so the force is reduced; Newton\'s second law — F = ma, and the change in velocity '
  'is constant, so the acceleration and hence the force are reduced.', ''),

 ('6', '1', 2, 'calculation', CIRC, '', '',
  '<p>Calculate the resistance of the variable resistor.</p><p>resistance = ______ &Omega;</p>',
  '190 Ω (calculator 191.67 Ω). Appropriate use of V = IR (1) — e.g. total resistance '
  '6.5 / 0.012 = 542 Ω, or a pd of 2.3 V across the resistor — then 190 Ω (1). A power-of-ten '
  'error is condoned in the first mark.', '190 to 191.7'),
 ('6', '2', 5, 'calculation', CIRC, '', '',
  '<p>The resistance <i>R</i> of the thermistor at temperature &theta; in K is given by:</p>'
  '<p><i>R</i> = <i>R</i><sub>0</sub> e<sup><i>B</i>(1/&theta; &minus; 1/&theta;<sub>0</sub>)</sup></p>'
  '<p>where <i>R</i><sub>0</sub> is the resistance at the initial temperature &theta;<sub>0</sub> '
  'in K, and <i>B</i> is a constant.</p><p>The temperature of the thermistor is increased to 318 '
  'K. The variable resistor is adjusted so that the circuit current is again 12 mA. The potential '
  'difference across the thermistor is now 3.2 V.</p><p>Determine <i>B</i>.</p><p>State an '
  'appropriate unit for your answer.</p><p><i>B</i> = ______ &nbsp; unit = ______</p>',
  'B = 1110 K. 22 °C converted to kelvin, 295 K (1); R = 3.2 / (12 × 10⁻³) = 267 Ω (1); use of '
  'ln(R/R₀) with their values (1); B = 1110 (1 — 1100, and answers that round to 1110 or 1120, '
  'accepted); unit K (1 — "k" is not accepted). R₀ = 190 Ω is condoned in the third mark.', ''),
 ('6', '3', 2, 'explain', CIRC, '', '',
  '<p>Explain why the current in the thermistor needs to be controlled.</p>',
  'The current causes the thermistor\'s temperature to change (it heats it) (1); the thermistor\'s '
  'resistance decreases as its temperature increases (1). A clear description of thermal runaway '
  'gets both marks.', ''),
 ('6', '4', 2, 'explain', CIRC, '', '',
  '<p>Explain how ammeters and voltmeters can be used in the circuit in <b>Figure 5</b> to '
  'demonstrate the conservation of charge and the conservation of energy.</p><p>Refer to points '
  '<b>X</b>, <b>Y</b> and <b>Z</b> in your answer.</p>',
  'Ammeter(s) in series show the current at X = the current at Y = the current at Z, OR '
  'voltmeter(s) show the emf / terminal pd (6.5 V) = pd across XY + pd across YZ (1); the current '
  'readings are linked to conservation of charge AND the pd readings to conservation of energy '
  '(1). "Currents across" is not allowed; "battery pd" only if it is clearly measured.', ''),

 ('7', '1', 1, 'short', WAVE, '', '',
  '<p>Deduce the amplitude of one of the progressive waves.</p><p>amplitude = ______ mm</p>',
  '3.5 mm (3.4 to 3.6 accepted).', '3.4 to 3.6'),
 ('7', '2', 2, 'calculation', WAVE, '', '',
  '<p>Determine, in m s<sup>&minus;1</sup>, the speed of one of the progressive waves.</p>'
  '<p>speed = ______ m s<sup>&minus;1</sup></p>',
  '440 m s⁻¹. Use of v = fλ with 625 Hz (1); wavelength 0.7 m giving 440 m s⁻¹ (1). λ from 0.68 to '
  '0.72 m, and speeds 425 to 450 m s⁻¹, are accepted.', '425 to 450'),
 ('7', '3', 1, 'short', WAVE, '', '',
  '<p>State the phase relationship between the two waves when <i>t</i> = 0</p>',
  'In phase, or a phase difference of 0 (2π, 360° and multiples accepted).', ''),
 ('7', '4', 3, 'drawing', WAVE, 'grid-blank', fig7(),
  '<p>Sketch, on <b>Figure 7</b>, a graph to show how the displacement of <b>S</b> varies with '
  '<i>t</i>.</p>',
  'A sinusoidal wave starting at displacement = 4 mm (1); amplitude 4 mm (1); period '
  '(625⁻¹) = 1.6 ms (1). Tolerance half a square; the shape is judged on the first complete cycle, '
  'and a line with no complete cycle must cover the width of the grid.', ''),

 # ---------------------------------------------------------------- Section B
 ('8', '', 1, 'short', NUC, '', '',
  '<p>Which nuclear change results in the nucleus with the greatest specific charge?</p>' + opts(
      'the alpha decay of a <sup>209</sup><sub>82</sub>Po nucleus',
      'the beta-minus decay of a <sup>28</sup><sub>12</sub>Mg nucleus',
      'the beta-plus decay of a <sup>39</sup><sub>20</sub>Ca nucleus',
      'electron capture by a <sup>105</sup><sub>47</sub>Ag nucleus'),
  'C — the beta-plus decay of a ³⁹₂₀Ca nucleus. (It gives ³⁹₁₉K, specific charge ∝ 19/39 = 0.487, '
  'against 80/205, 13/28 and 46/105 for the others.)', 'C'),
 ('9', '', 1, 'short', PART, 'graph', q9(),
  '<p>In two separate experiments, electromagnetic radiation of variable frequency <i>f</i> is '
  'incident on the surfaces of plates made from metals <b>X</b> and <b>Y</b>.</p><p>The work '
  'function of <b>X</b> is greater than the work function of <b>Y</b>.</p><p>Which graph shows '
  'how the maximum kinetic energy <i>E</i><sub>k(max)</sub> of photoelectrons emitted from the '
  'surfaces of the plates varies with <i>f</i>?</p><p><b>A</b> &nbsp; <b>B</b> &nbsp; <b>C</b> '
  '&nbsp; <b>D</b></p>',
  'A — two parallel lines (the gradient is h for both), with X crossing the f axis at the higher '
  'frequency.', 'A'),
 ('10', '', 1, 'short', PART, '', '',
  '<p>Monochromatic light is incident on a metal surface in a vacuum and photoelectrons are '
  'emitted from the surface. The photoelectric current <i>I</i> is the rate of flow of charge from '
  'the surface.</p><p>The maximum kinetic energy of the photoelectrons is '
  '<i>E</i><sub>k(max)</sub>.</p><p><i>E</i><sub>k(max)</sub> and <i>I</i> are measured.</p><p>The '
  'frequency of the light is then increased. There is no change to the rate at which energy is '
  'incident on the surface.</p><p>What happens to <i>E</i><sub>k(max)</sub> and <i>I</i> when the '
  'frequency is increased?</p><table><tr><th></th><th><i>E</i><sub>k(max)</sub></th><th><i>I</i>'
  '</th></tr><tr><td><b>A</b></td><td>increases</td><td>decreases</td></tr><tr><td><b>B</b></td>'
  '<td>increases</td><td>no change</td></tr><tr><td><b>C</b></td><td>no change</td><td>no change'
  '</td></tr><tr><td><b>D</b></td><td>no change</td><td>decreases</td></tr></table>',
  'A — E<sub>k(max)</sub> increases, I decreases.', 'A'),
 ('11', '', 1, 'short', PART, 'diagram', q11(),
  '<p>Three energy levels for an atom are shown.</p><p>Energy change <i>E</i><sub>1</sub> leads to '
  'the emission of a photon of wavelength &lambda;<sub>1</sub>.</p><p>Energy change '
  '<i>E</i><sub>2</sub> leads to the emission of a photon of wavelength &lambda;<sub>2</sub>.</p>'
  '<p>What is &lambda;<sub>1</sub> / &lambda;<sub>2</sub>?</p>' + opts('1/4', '1/3', '3', '4'),
  'C — 3. (E₁ = 5.0 eV and E₂ = 15.0 eV, and λ ∝ 1/E.)', 'C'),
 ('12', '', 1, 'short', PART, '', '',
  '<p>An electron and a proton move with the same speed.</p><p>What is (de Broglie wavelength of '
  'electron) / (de Broglie wavelength of proton)?</p>' + opts(
      '5.5 &times; 10<sup>&minus;4</sup>', '2.3 &times; 10<sup>&minus;2</sup>', '42', '1800'),
  'D — 1800 (the ratio of the proton\'s mass to the electron\'s).', 'D'),
 ('13', '', 1, 'short', WAVE, '', '',
  '<p>A laser emits light of wavelength 600 nm for 10 ns.</p><p>What is the number of complete '
  'waves emitted by the laser?</p>' + opts(
      '5 &times; 10<sup>17</sup>', '5 &times; 10<sup>12</sup>', '5 &times; 10<sup>8</sup>',
      '5 &times; 10<sup>6</sup>'),
  'D — 5 × 10⁶. (3.0 × 10⁸ × 10 × 10⁻⁹ / 600 × 10⁻⁹.)', 'D'),
 ('14', '', 1, 'short', WAVE, '', '',
  '<p>A detector measures the intensity of light from a source S<sub>1</sub>.</p><p>Polaroid '
  'material is placed between source S<sub>1</sub> and the detector. When the material is rotated '
  'through a small angle, the detected intensity does not change.</p><p>When this procedure is '
  'repeated for a source S<sub>2</sub>, the detected intensity decreases.</p><p>Which is '
  'correct?</p><table><tr><th></th><th>Light waves from S<sub>1</sub></th><th>Light waves from '
  'S<sub>2</sub></th></tr><tr><td><b>A</b></td><td>unpolarised</td><td>polarised</td></tr><tr><td>'
  '<b>B</b></td><td>unpolarised</td><td>unpolarised</td></tr><tr><td><b>C</b></td><td>polarised'
  '</td><td>polarised</td></tr><tr><td><b>D</b></td><td>polarised</td><td>unpolarised</td></tr>'
  '</table>',
  'A — light from S₁ unpolarised, light from S₂ polarised.', 'A'),
 ('15', '', 1, 'short', WAVE, 'diagram', q15(),
  '<p>A loudspeaker producing a single-frequency sound is mounted above a tube filled with water. '
  'A tap at the bottom of the tube is opened to allow the water to run out.</p><p>A student '
  'observes the change in loudness of the sound emitted by the tube as the water runs out.</p>'
  '<p>When the length of the column of air in the tube reaches <i>L</i><sub>1</sub>, the loudness '
  'is at its first maximum.</p><p>The next maximum is reached when the length of the column of air '
  'is <i>L</i><sub>2</sub>.</p><p>What is the wavelength of the sound emitted by the '
  'loudspeaker?</p>' + opts('<i>L</i><sub>2</sub>', '2<i>L</i><sub>1</sub>',
                            '<i>L</i><sub>2</sub> &minus; <i>L</i><sub>1</sub>',
                            '2(<i>L</i><sub>2</sub> &minus; <i>L</i><sub>1</sub>)'),
  'D — 2(L₂ − L₁).', 'D'),
 ('16', '', 1, 'short', WAVE, 'diagram', q16(),
  '<p>Point sources of sound of the same frequency are placed at S<sub>1</sub> and '
  'S<sub>2</sub>.</p><p>A sound detector is moved slowly along the line PQ. Consecutive maxima of '
  'sound intensity are detected at W and Y and consecutive minima are detected at X and Z.</p>'
  '<p>What is the wavelength of the sound?</p>' + opts(
      '(S<sub>1</sub>Y &minus; S<sub>2</sub>Y) &minus; (S<sub>1</sub>W &minus; S<sub>2</sub>W)',
      '(S<sub>1</sub>X &minus; S<sub>2</sub>X) &minus; (S<sub>1</sub>W &minus; S<sub>2</sub>W)',
      '(S<sub>1</sub>Y &minus; S<sub>2</sub>Y) &minus; (S<sub>1</sub>X &minus; S<sub>2</sub>X)',
      '(S<sub>1</sub>Z &minus; S<sub>2</sub>Z) &minus; (S<sub>1</sub>W &minus; S<sub>2</sub>W)'),
  'A — (S₁Y − S₂Y) − (S₁W − S₂W).', 'A'),
 ('17', '', 1, 'short', WAVE, '', '',
  '<p>Monochromatic light is used in a Young\'s double-slit interference experiment after passing '
  'through a single slit. The resulting fringe pattern is observed on a screen.</p><p>The '
  'separation of the fringes can be increased by</p>' + opts(
      'using monochromatic light of lower frequency.', 'decreasing the width of the single slit.',
      'increasing the separation of the double slits.',
      'decreasing the distance between the double slits and the screen.'),
  'A — using monochromatic light of lower frequency.', 'A'),
 ('18', '', 1, 'short', MECH, 'diagram', q18(),
  '<p>A force of magnitude <i>F</i> acts on a box of mass <i>m</i> that moves along a frictionless '
  'slope. The slope is at an angle &alpha; to the horizontal and the force acts at an angle &beta; '
  'to the slope.</p><p>What is the magnitude of the acceleration of the block along the slope?</p>'
  + opts('(<i>F</i>/<i>m</i>) sin &alpha; &minus; <i>g</i> sin &beta;',
         '(<i>F</i>/<i>m</i>) cos &beta; &minus; <i>g</i> sin &alpha;',
         '(<i>F</i>/<i>m</i>) cos (&alpha; + &beta;) &minus; <i>g</i> cos &beta;',
         '(<i>F</i>/<i>m</i>) cos (&alpha; + &beta;) &minus; <i>g</i> sin &beta;'),
  'B — (F/m) cos β − g sin α.', 'B'),
 ('19', '', 1, 'short', MECH, 'diagram', q19(),
  '<p>The weight of a uniform bar is <i>W</i>.</p><p>An object also of weight <i>W</i> is attached '
  'to one end.</p><p>The bar is pivoted at the other end and held horizontal by a rope attached to '
  'its centre.</p><p>The tension in the rope is 4<i>W</i>.</p><p>What is angle &theta;?</p>'
  + opts('41&deg;', '45&deg;', '60&deg;', '71&deg;'),
  'A — 41°. (Moments about the pivot: 4W cos θ × L/2 = W × L/2 + W × L, so cos θ = 0.75.)', 'A'),
 ('20', '', 1, 'short', MECH, 'diagram', q20(),
  '<p>A projectile is fired from ground level over horizontal ground.</p><p>Its initial velocity '
  'is <i>u</i> at an angle &theta; to the horizontal.</p><p>The range of the projectile is '
  '<i>d</i>.</p><p>A second projectile is fired with a velocity 2<i>u</i> at the same angle.</p>'
  '<p>What is the range of this projectile?</p><p>Assume that air resistance is negligible.</p>'
  + opts(SQ2 + '<i>d</i>', '2<i>d</i>', '2' + SQ2 + '<i>d</i>', '4<i>d</i>'),
  'D — 4d (the range is proportional to u²).', 'D'),
 ('21', '', 1, 'short', MECH, '', '',
  '<p>A particle travelling horizontally at 1.0 &times; 10<sup>7</sup> m s<sup>&minus;1</sup> '
  'enters a region where it has a constant vertical acceleration of 4 &times; 10<sup>14</sup> m '
  's<sup>&minus;2</sup>.</p><p>What is the horizontal distance the particle has travelled in the '
  'region when its vertical displacement is 8 &times; 10<sup>&minus;2</sup> m?</p>' + opts(
      '0.2 m', '0.1 m', '2 &times; 10<sup>&minus;8</sup> m', '0.4 &times; 10<sup>&minus;9</sup> m'),
  'A — 0.2 m. (t = √(2 × 0.08 / 4 × 10¹⁴) = 2 × 10⁻⁸ s; 1.0 × 10⁷ × 2 × 10⁻⁸ = 0.2 m.)', 'A'),
 ('22', '', 1, 'short', MECH, 'graph', q22(),
  '<p>An object is thrown vertically upwards at time <i>t</i> = 0</p><p>The object reaches its '
  'maximum height when <i>t</i> = <i>T</i> and reaches its terminal speed on the way down.</p>'
  '<p>The magnitude of the object\'s acceleration is <i>a</i>.</p><p>Which graph shows the '
  'variation of <i>a</i> with <i>t</i>?</p><p><b>A</b> &nbsp; <b>B</b> &nbsp; <b>C</b> &nbsp; '
  '<b>D</b></p>',
  'B — a starts above g and falls to g at t = T.', 'B'),
 ('23', '', 1, 'short', MECH, '', '',
  '<p>A man has a mass of 75.0 kg.</p><p>He stands on weighing scales in a lift that accelerates '
  'upwards at 2.60 m s<sup>&minus;2</sup>.</p><p>What is the reading on the scales during the '
  'acceleration?</p>' + opts('195 N', '541 N', '736 N', '931 N'),
  'D — 931 N. (75.0 × (9.81 + 2.60).)', 'D'),
 ('24', '', 1, 'short', MECH, '', '',
  '<p>An average force of 42 kN acts on the air passing through a jet engine. This force causes '
  'the speed of the air to increase by 540 m s<sup>&minus;1</sup>.</p><p>What mass of air passes '
  'through the engine in one minute?</p>' + opts(
      '7.7 &times; 10<sup>&minus;2</sup> kg', '4.7 kg', '78 kg', '4700 kg'),
  'D — 4700 kg. (42 000 × 60 / 540.)', 'D'),
 ('25', '', 1, 'short', MECH, '', '',
  '<p>A uniform wire is stretched by a load <i>F</i>.</p><p>The elastic strain energy stored in '
  'the wire is <i>E</i>.</p><p>The load is increased from <i>F</i> to 2<i>F</i>.</p><p>The wire '
  'obeys Hooke\'s law.</p><p>What is the increase in the elastic strain energy stored in the '
  'wire?</p>' + opts('<i>E</i>', '2<i>E</i>', '3<i>E</i>', '4<i>E</i>'),
  'C — 3E (the energy rises to 4E).', 'C'),
 ('26', '', 1, 'short', MECH, '', '',
  '<p>A spring is compressed by a force <i>F</i>. The spring has stiffness <i>k</i> and its length '
  'changes by &Delta;<i>L</i> during the compression. When the force is removed the spring returns '
  'to its original length in time <i>t</i>.</p><p>What is the average power developed by the '
  'spring as it returns to its original length?</p>' + opts(
      FR('<i>k</i>&Delta;<i>L</i>', '2<i>t</i>'), FR('<i>k</i>&Delta;<i>L</i>', '<i>t</i>'),
      FR('<i>k</i>(&Delta;<i>L</i>)<sup>2</sup>', '2<i>t</i>'),
      FR('<i>k</i>(&Delta;<i>L</i>)<sup>2</sup>', '<i>t</i>')),
  'C — k(ΔL)²/2t.', 'C'),
 ('27', '', 1, 'short', CIRC, '', '',
  '<p>A 12 &Omega; resistor is connected across the terminals of a battery of emf 2.0 V and '
  'internal resistance 4.0 &Omega;.</p><p>What is the pd across the resistor?</p>' + opts(
      '0.25 V', '0.75 V', '1.30 V', '1.50 V'),
  'D — 1.50 V. (2.0 × 12 / 16.)', 'D'),
 ('28', '', 1, 'short', SHM, 'diagram', q28(),
  '<p>A small mass is placed at <b>P</b> on a horizontal turntable. The turntable rotates clockwise '
  'with a constant angular speed about a vertical axis through its centre <b>O</b>.</p><p>The mass '
  'remains at rest relative to the turntable.</p><p>What is the direction of the frictional force '
  'on the mass at the instant shown?</p>' + opts(
      'from <b>P</b> to <b>O</b>', 'from <b>P</b> to <b>Q</b>', 'from <b>P</b> to <b>R</b>',
      'from <b>P</b> to <b>S</b>'),
  'A — from P to O (friction provides the centripetal force).', 'A'),
 ('29', '', 1, 'short', SHM, '', '',
  '<p>A particle of mass <i>m</i> moves in a circle of radius <i>r</i>. The number of revolutions '
  'completed per second is <i>f</i>.</p><p>What is the kinetic energy of the particle?</p>' + opts(
      '4&pi;<sup>2</sup><i>mf</i><sup>2</sup><i>r</i><sup>2</sup>',
      '2&pi;<sup>2</sup><i>mf</i><sup>2</sup><i>r</i><sup>2</sup>',
      FR('<i>mf</i><sup>2</sup><i>r</i><sup>2</sup>', '4&pi;<sup>2</sup>'),
      FR('<i>mf</i><sup>2</sup><i>r</i><sup>2</sup>', '2')),
  'B — 2π²mf²r². (½m(2πfr)².)', 'B'),
 ('30', '', 1, 'short', SHM, '', '',
  '<p>A body is in simple harmonic motion of amplitude 0.60 m and period 2&pi; seconds.</p><p>What '
  'is its speed when its displacement is 0.20 m?</p>' + opts(
      '0.32 m s<sup>&minus;1</sup>', '0.57 m s<sup>&minus;1</sup>', '0.63 m s<sup>&minus;1</sup>',
      '22 m s<sup>&minus;1</sup>'),
  'B — 0.57 m s⁻¹. (ω = 1 rad s⁻¹; v = ω√(0.60² − 0.20²).)', 'B'),
 ('31', '', 1, 'short', SHM, '', '',
  '<p>When a mass <b>M</b> is suspended from a spring, the spring extends by a distance <i>x</i>. '
  '<b>M</b> is displaced vertically and, when released, it oscillates with a period <i>T</i>.</p>'
  '<p><b>M</b> is removed and suspended from a different spring. The spring extends by a distance '
  + FR('<i>x</i>', '2') + '.</p><p><b>M</b> is again displaced vertically and released.</p><p>What '
  'is the new period of oscillations of <b>M</b>?</p>' + opts(
      FR('<i>T</i>', '2'), FR('<i>T</i>', SQ2), '<i>T</i>' + SQ2, '2<i>T</i>'),
  'B — T/√2 (the new spring is twice as stiff).', 'B'),
 ('32', '', 1, 'short', SHM, '', '',
  '<p>A mass&ndash;spring system and a simple pendulum have identical periods of oscillation '
  '<i>T</i> when at the surface of the Earth.</p><p>Both are taken to planet <b>X</b> where the '
  'acceleration due to gravity is ' + FR('<i>g</i>', '2') + '.</p><p>What are the periods of the '
  'mass&ndash;spring system and the simple pendulum on <b>X</b>?</p><table><tr><th></th><th>Period '
  'of mass&ndash;spring system</th><th>Period of simple pendulum</th></tr>'
  '<tr><td><b>A</b></td><td>' + FR('<i>T</i>', '2') + '</td><td><i>T</i>' + SQ2 + '</td></tr>'
  '<tr><td><b>B</b></td><td><i>T</i></td><td>2<i>T</i></td></tr>'
  '<tr><td><b>C</b></td><td><i>T</i></td><td><i>T</i>' + SQ2 + '</td></tr>'
  '<tr><td><b>D</b></td><td><i>T</i>' + SQ2 + '</td><td><i>T</i></td></tr></table>',
  'C — the mass–spring period is still T; the pendulum\'s is T√2.', 'C'),
]

PER_QUESTION = {'1': 7, '2': 9, '3': 10, '4': 4, '5': 12, '6': 11, '7': 7}
got = {}
for q, part, marks, *_ in Q:
    key = q if int(q) <= 7 else 'B'
    got[key] = got.get(key, 0) + marks
assert got.pop('B') == 25 and all(m == 1 for q, p, m, *_ in Q if int(q) >= 8), 'Section B is 25 one-mark questions'
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(m for _, _, m, *_ in Q) == 85, 'the cover says 85'
assert [q for q, p, *_ in Q if int(q) >= 8] == [str(n) for n in range(8, 33)]

# ---- every intermediate the scheme prints, recomputed ----
G = math.sin(math.radians(28.2)) / 380e-9                                            # 03.4
assert abs(G / 1e6 - 1.2435547) < 2e-7 and round(380e-9 / math.sin(math.radians(28.2)) * 1e7, 2) == 8.04
assert round(math.sin(math.radians(28.2)) / 377.5e-9 / 1e6, 4) == 1.2518
assert round(math.sin(math.radians(28.2)) / 382.5e-9 / 1e6, 4) == 1.2354
peakX = max((p for p in SPEC if 370 <= p[0] <= 386), key=lambda p: p[2])            # the traced X
assert 377.5 <= peakX[0] <= 382.5
assert 4 / (4 + 1) == 0.8                                                            # 04.1
KEn = 0.8 * 2.82e-12                                                                 # 04.2
assert abs(KEn - 2.256e-12) < 1e-18 and round(KEn / 1e-12, 2) == 2.26
for m, v in ((1.68e-27, 5.1823878), (1.675e-27, 5.1901169), (1.67e-27, 5.1978807)):
    assert round(math.sqrt(2 * KEn / m) / 1e7, 7) == v
a1 = math.atan2(F4_V[1] - F4_T1[1], F4_V[0] - F4_T1[0])                               # 05.1
a2 = math.atan2(F4_V[1] - F4_T2[1], F4_T2[0] - F4_V[0])
assert 34 <= math.degrees(a1) <= 35 and 11 <= math.degrees(a2) <= 12
T1 = 350 / (math.sin(a1) + math.cos(a1) / math.cos(a2) * math.sin(a2))
T2 = T1 * math.cos(a1) / math.cos(a2)
assert 470 <= T1 <= 490 and 390 <= T2 <= 410
L1 = math.hypot(F4_V[0] - F4_T1[0], F4_V[1] - F4_T1[1]); L2 = math.hypot(F4_T2[0] - F4_V[0], F4_V[1] - F4_T2[1])
assert abs(L1 / L2 - T1 / T2) < 0.02                                                 # drawn to scale
m5 = 350 / 9.81                                                                      # 05.2
assert round(m5) == 36 and round(0.5 * m5 * 6.5 ** 2) == 754 and 350 * 4.5 == 1575
Wf = 1575 - 0.5 * m5 * 6.5 ** 2
assert round(Wf) == 821 and round(Wf / 18) == 46 and round(6.5 ** 2 / (2 * 18), 2) == 1.17
assert round(350 * 4.5 / 18 - m5 * 6.5 ** 2 / 36) == 46
assert round(6.5 / 0.012) == 542 and round(6.5 / 0.012 - 350, 2) == 191.67          # 06.1
assert round(6.5 - 350 * 0.012, 1) == 2.3
R6 = 3.2 / 12e-3                                                                     # 06.2
assert round(R6) == 267
for th0 in (295, 295.15):
    B6 = math.log(R6 / 350) / (1 / 318 - 1 / th0)
    assert round(B6, -1) in (1110, 1120)
assert 625 * 0.7 == 437.5 and round(1 / 625 * 1e3, 1) == 1.6                          # Q7
assert abs(A6 * math.sin(2 * math.pi * XS / LAM6) - 4) < 1e-9 and abs(LEN6 / LAM6 - 1.5) < 1e-12
# Section B keys, where the key is a calculation
sc = {'A': 80 / 205, 'B': 13 / 28, 'C': 19 / 39, 'D': 46 / 105}
assert max(sc, key=sc.get) == 'C'                                                    # 08
assert (-6.0 - -21.0) / (-1.0 - -6.0) == 3                                           # 11
assert round(1.673e-27 / 9.11e-31, -2) == 1800                                       # 12
assert round(3.0e8 * 10e-9 / 600e-9) == 5e6                                          # 13
assert round(math.degrees(math.acos(1.5 / 2))) == 41                                 # 19
t21 = math.sqrt(2 * 8e-2 / 4e14); assert round(t21, 10) == 2e-8 and round(1e7 * t21, 3) == 0.2   # 21
assert round(75.0 * (9.81 + 2.60)) == 931                                            # 23
assert round(42000 * 60 / 540, -2) == 4700                                           # 24
assert 2.0 * 12 / (12 + 4.0) == 1.5                                                  # 27
assert round(math.sqrt(0.60 ** 2 - 0.20 ** 2), 2) == 0.57                            # 30
d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() == 4 and (d.year, d.month) == (2024, int(DOC['month']))           # cover: Friday

ROWS = [dict(DOC, row_id='D-' + PAPER, kind='document', total_marks='85',
             needs='Calculator, Ruler, Protractor, Equation booklet',
             source_url='https://drive.google.com/file/d/%s/view' % QP)]
PRE = {'2': (STEM2, PART, '', ''), '3': (STEM3, WAVE, '', ''), '4': (STEM4, NUC, '', ''),
       '5': (STEM5 + '<p><b>Figure 3</b></p>', MECH, 'diagram', fig3()),
       '6': (STEM6 + '<p><b>Figure 5</b></p>', CIRC, 'diagram', fig5()),
       '7': (STEM7 + '<p><b>Figure 6</b></p>', WAVE, 'graph', fig6())}
done = set()
for q, part, marks, atype, topics, figure, diagram, html, answer, accept in Q:
    section = 'A' if int(q) <= 7 else 'B'
    if q in PRE and q not in done:
        h, t, f, dg = PRE[q]
        ROWS.append(dict(DOC, row_id='Q-AQA-7408-2406-1-%02d' % int(q), kind='preamble', question=q,
                         section=section, html=h, topics=t, figure=f, diagram=dg,
                         diagram_by=('family' if dg else '')))
        done.add(q)
    r = dict(DOC)
    r.update(row_id='Q-AQA-7408-2406-1-%02d%s' % (int(q), part), kind='question',
             question=q, part=part, section=section, marks=str(marks), html=html,
             answer=answer, answer_type=atype, topics=topics, figure=figure,
             diagram=diagram, diagram_by=('family' if diagram else ''), placeholder='',
             accept=accept)
    ROWS.append(r)
ids = [r['row_id'] for r in ROWS]
assert len(ids) == len(set(ids))
