"""AQA A-level Physics 7408/2 — Paper 2 — June 2023.

Every answer is READ OFF AQA's own scheme, `Mark scheme (A-level) _ Paper 2 - June 2023` (its cover
says 7408/2, June 2023, Version 1.0 Final; its values — 0.1265 and 0.0316 m³ in 02.1, 6.3 × 10²⁰ kg
in 03.5, 270 in 04.2, 2.0 × 10⁵ Ω in 05.3, 23.2 in 07.4 — are this paper's). The 2017 Highers are
why that is the rule and not a preference.

The cover says 85 marks — Section A 60, Section B 25 (twenty-five one-mark multiple-choice
questions, 08 to 32) — and the boxes down the pages say 5, 7, 10, 8, 10, 10, 10 and 25. All of it
is asserted below, and so is every intermediate the scheme prints inside its own working.

EVERY FIGURE IN THIS PDF IS A RASTER IMAGE with no text layer and no vectors, so the graphs that
carry data were MEASURED IN PIXELS rather than eyeballed: the gridlines were found by their regular
spacing in each embedded image, and the curve traced column by column as the run of dark pixels.
  * Figure 3 (03.2) — x: 0 at px 490.5, 10 × 10⁶ m at 1671.5; y: 0 at 1209, 5.0 × 10⁵ N at 28.
    Its intercept (4.76) is the probe's own weight, 4.9 × 10⁴ kg × 9.81 — asserted.
  * Figure 7 (04.4) — x: 1.0 cm at 255.5, 2.5 cm at 1850; y: 0 at 1096.5, 10 × 10³ at 33.5. The
    scheme's own readings (10 at 1.00 cm, 4 at 1.34 cm; 10 → 5 over 0.25 cm, 5 → 2.5 over 0.31 cm)
    are recomputed off the measured curve.
  * Figure 9 (05.2) — x: 0 at 443, 12 s at 1860.5; y: 0 at 1449, 6.0 × 10⁻⁵ A at 32. The scheme's
    80 ± 2 one-centimetre squares (4.0 × 10⁻⁴ C) is recomputed as the area under the measured curve.
  * Figure 10 (05.3) — x: 10 s at 262.5, 42.5 s at 1644.5; y: 1.5 V at 1096.5, 4.0 V at 33.5. The
    scheme's 4.0 V at 11 s and 2.0 V at 32 s are asserted off the measured curve.
  * Figure 15 (07.3, 07.5) — x: 0 at 169.5, 16 at 1114; y: 0 at 1089, 0.9 at 26. The scheme's
    0.85 at 12 is asserted.
  * The graph in 32 — x: 0 at 418, 50 s at 1599; y: 4.0 MBq at 1208.5, 14.0 at 27.5. The half-life
    read off it gives the scheme's key, D.
  * Figure 5 (04) — the equipotentials were each traced as a connected component and binned by
    angle about the wire; P, the labels and the 5.0 mm arrow are at their measured positions. P is
    a filled dot printed ON the 2000 V line, so its pixels were cut out of that line (radius 26 px
    about its centre, 934.8, 865.7) before binning, or it would have bent the arc towards itself.

DRAWN BECAUSE THE WORDS OR NUMBERS FIX THEM: Figure 1 (a cube of side l, P moving at c towards the
shaded face W); Figure 2 (the tyre, to scale from its three printed dimensions); Figure 6 and Figure
12 (blank axes for the student's sketch); Figure 8 (the circuit, whose topology 05.3's R₁ + R₂
discharge path also fixes); the six charges of 14; the path in 16 (a parabola in a uniform field);
the E–r graph of 17; the flux graph of 22.

DESCRIBED, NOT DRAWN: Figure 4 (the spark detector apparatus), Figure 11 (the electron-scattering
chamber), Figures 13 and 14 (two gliders — the words say everything the pictures do), the four
molecule diagrams of 18 and the four emf graphs of 22, which are the options and are written out
as the options.

FIGURE 15 IS DRAWN ON BOTH 07.3 AND 07.5, deliberately: both parts are about it and 07.1, 07.2 and
07.4 are not, so a question-scoped preamble would put it on three cards that never mention it.
"""
import datetime, math, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from svgplot import W

PAPER = 'P-AQA-7408-2306-2'
QP = '1F3COjDZxwgSTMJ77yEwDBFgZde9jyvc3'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS5', band_type='stage',
           band_value='A-Level', level='Alevel', company='AQA', exam_board='AQA',
           spec_code='7408/2', exam_wave='First wave', year='2023', month='6', paper='2',
           exam_date='2023-06-09', document_type='Past paper',
           name='Paper 2 — June 2023', active='True', trackable='True', printable='False')

TH = 'Thermal Physics'
GR = 'Gravitational Fields'
EM = 'Electric & Magnetic Fields'
CAP = 'Capacitors'
NUC = 'Nuclear Physics'
MECH = 'Mechanics & Materials'
PR = 'Particles & Radiation'

# ---------------------------------------------------------------------------------------------
# MEASURED DATA (see the module note). (x, y) in the graph's own units.
# ---------------------------------------------------------------------------------------------
F3 = [(0.04, 4.76), (0.25, 4.443), (0.5, 4.114), (0.75, 3.831), (1, 3.577), (1.25, 3.35), (1.5, 3.146), (1.75, 2.96), (2, 2.79), (2.25, 2.634), (2.5, 2.49), (2.75, 2.357), (3, 2.232), (3.25, 2.118), (3.5, 2.011), (3.75, 1.913), (4, 1.819), (4.25, 1.733), (4.5, 1.651), (4.75, 1.576), (5, 1.505), (5.25, 1.437), (5.5, 1.376), (5.75, 1.317), (6, 1.261), (6.25, 1.211), (6.5, 1.162), (6.75, 1.118), (7, 1.075), (7.25, 1.034), (7.5, 0.999), (7.75, 0.964), (8, 0.931), (8.25, 0.902), (8.5, 0.876), (8.75, 0.849), (9, 0.826), (9.25, 0.804), (9.5, 0.784), (9.75, 0.766), (9.95, 0.754)]
F7 = [(1.004, 9.882), (1.02, 9.404), (1.04, 8.838), (1.06, 8.318), (1.08, 7.842), (1.1, 7.404), (1.12, 6.997), (1.14, 6.621), (1.16, 6.272), (1.18, 5.949), (1.2, 5.648), (1.25, 4.984), (1.3, 4.418), (1.35, 3.936), (1.4, 3.521), (1.45, 3.161), (1.5, 2.85), (1.55, 2.573), (1.6, 2.332), (1.65, 2.117), (1.7, 1.926), (1.75, 1.756), (1.8, 1.605), (1.85, 1.472), (1.9, 1.35), (1.95, 1.245), (2, 1.145), (2.05, 1.06), (2.1, 0.983), (2.15, 0.912), (2.2, 0.851), (2.25, 0.799), (2.3, 0.748), (2.35, 0.706), (2.4, 0.663), (2.45, 0.63), (2.49, 0.607)]
F9 = [(0.04, 5.975), (0.25, 5.845), (0.5, 5.699), (0.75, 5.557), (1, 5.419), (1.25, 5.286), (1.5, 5.157), (1.75, 5.032), (2, 4.907), (2.25, 4.788), (2.5, 4.67), (2.75, 4.555), (3, 4.444), (3.25, 4.334), (3.5, 4.226), (3.75, 4.122), (4, 4.02), (4.25, 3.923), (4.5, 3.823), (4.75, 3.728), (5, 3.636), (5.25, 3.546), (5.5, 3.456), (5.75, 3.37), (6, 3.285), (6.25, 3.203), (6.5, 3.121), (6.75, 3.044), (7, 2.967), (7.25, 2.892), (7.5, 2.82), (7.75, 2.749), (8, 2.68), (8.25, 2.614), (8.5, 2.549), (8.75, 2.486), (9, 2.424), (9.25, 2.364), (9.5, 2.308), (9.75, 2.253), (10, 2.197), (10.25, 2.147), (10.5, 2.095), (10.75, 2.046), (10.96, 2.007)]
F10 = [(10.1, 3.845), (10.25, 3.874), (10.5, 3.919), (10.75, 3.961), (11, 3.997), (11.25, 3.968), (11.5, 3.933), (11.75, 3.9), (12, 3.868), (12.25, 3.836), (12.5, 3.804), (12.75, 3.773), (13, 3.741), (13.25, 3.709), (13.5, 3.679), (13.75, 3.65), (14, 3.62), (14.25, 3.59), (14.5, 3.561), (14.75, 3.532), (15, 3.502), (15.25, 3.474), (15.5, 3.445), (15.75, 3.418), (16, 3.389), (16.25, 3.361), (16.5, 3.334), (16.75, 3.306), (17, 3.28), (17.25, 3.253), (17.5, 3.226), (17.75, 3.199), (18, 3.174), (18.25, 3.147), (18.5, 3.122), (18.75, 3.097), (19, 3.071), (19.25, 3.046), (19.5, 3.021), (19.75, 2.996), (20, 2.972), (20.25, 2.947), (20.5, 2.922), (20.75, 2.898), (21, 2.874), (21.25, 2.85), (21.5, 2.827), (21.75, 2.804), (22, 2.781), (22.25, 2.757), (22.5, 2.736), (22.75, 2.712), (23, 2.691), (23.25, 2.668), (23.5, 2.646), (23.75, 2.624), (24, 2.602), (24.25, 2.581), (24.5, 2.559), (24.75, 2.538), (25, 2.518), (25.25, 2.497), (25.5, 2.476), (25.75, 2.456), (26, 2.435), (26.25, 2.416), (26.5, 2.396), (26.75, 2.375), (27, 2.356), (27.25, 2.337), (27.5, 2.318), (27.75, 2.299), (28, 2.28), (28.25, 2.261), (28.5, 2.243), (28.75, 2.225), (29, 2.206), (29.25, 2.188), (29.5, 2.17), (29.75, 2.152), (30, 2.135), (30.25, 2.117), (30.5, 2.099), (30.75, 2.083), (31, 2.066), (31.25, 2.05), (31.5, 2.034), (31.75, 2.017), (32, 2.008), (32.25, 2.094), (32.5, 2.187), (32.75, 2.28), (33, 2.371), (33.25, 2.46), (33.5, 2.547), (33.75, 2.633), (34, 2.718), (34.25, 2.8), (34.5, 2.882), (34.75, 2.961), (35, 3.04), (35.25, 3.116), (35.5, 3.19), (35.75, 3.264), (36, 3.334), (36.25, 3.404), (36.5, 3.471), (36.75, 3.537), (37, 3.599), (37.25, 3.659), (37.5, 3.718), (37.75, 3.773), (38, 3.824), (38.25, 3.874), (38.5, 3.92), (38.75, 3.964), (38.95, 3.993)]
F15 = [(0.86, 0.013), (0.9, 0.026), (0.95, 0.054), (1, 0.08), (1.1, 0.123), (1.2, 0.158), (1.35, 0.203), (1.5, 0.242), (1.7, 0.288), (1.9, 0.35), (2.1, 0.364), (2.4, 0.412), (2.7, 0.454), (3, 0.491), (3.3, 0.525), (3.6, 0.555), (3.9, 0.598), (4.2, 0.609), (4.5, 0.632), (4.8, 0.654), (5.1, 0.672), (5.4, 0.689), (5.7, 0.704), (6, 0.717), (6.3, 0.729), (6.6, 0.74), (6.9, 0.751), (7.2, 0.761), (7.5, 0.769), (7.8, 0.778), (8.1, 0.787), (8.4, 0.792), (8.7, 0.799), (9, 0.806), (9.3, 0.811), (9.6, 0.817), (9.9, 0.829), (10.2, 0.829), (10.5, 0.832), (10.8, 0.836), (11.1, 0.84), (11.4, 0.844), (11.7, 0.848), (12, 0.85), (12.3, 0.854), (12.6, 0.857), (12.9, 0.859), (13.2, 0.862), (13.5, 0.864), (13.8, 0.867), (14.1, 0.87), (14.4, 0.87), (14.7, 0.872), (14.85, 0.873)]
F15X = [(2, 0.347), (4, 0.592), (6, 0.717), (8, 0.783), (10, 0.823), (12, 0.85), (14, 0.868)]
F32 = [(0.2, 13.928), (1, 13.672), (2, 13.362), (3, 13.058), (4, 12.764), (5, 12.479), (6, 12.199), (7, 11.925), (8, 11.655), (9, 11.396), (10, 11.136), (11, 10.886), (12, 10.637), (13, 10.397), (14, 10.16), (15, 9.925), (16, 9.7), (17, 9.478), (18, 9.261), (19, 9.044), (20, 8.836), (21, 8.632), (22, 8.429), (23, 8.236), (24, 8.044), (25, 7.853), (26, 7.67), (27, 7.491), (28, 7.313), (29, 7.146), (30, 6.978), (31, 6.814), (32, 6.655), (33, 6.5), (34, 6.349), (35, 6.203), (36, 6.06), (37, 5.922), (38, 5.787), (39, 5.658), (40, 5.526), (41, 5.406), (42, 5.287), (43, 5.174), (44, 5.065), (44.7, 4.988)]
EQ = {
  400: [(1260.1, 224.7), (1201.3, 228.3), (1128.8, 230.8), (1063.9, 230.8), (1003.9, 230.3), (947.8, 229), (894, 227.4), (842.4, 225.8), (792.5, 224.3), (742.9, 223), (694.7, 222.1), (646.4, 222.3), (598.3, 222.1), (550.1, 223), (500.5, 224.3), (450.6, 225.8), (399, 227.4), (345.4, 229), (289.1, 230.3), (229.1, 230.8), (164.2, 230.8), (91.7, 228.3), (32.7, 224.7)],
  800: [(1258.5, 419.5), (1199.2, 413.1), (1127.6, 403.3), (1062.5, 394.5), (1002, 388.5), (944.7, 383.9), (890.5, 380.3), (839.1, 377.5), (789.3, 375.2), (741.2, 373.5), (693.5, 372.3), (646.4, 372.3), (599.5, 372.3), (551.8, 373.5), (503.7, 375.2), (453.9, 377.5), (402.5, 380.3), (348.3, 383.9), (291, 388.5), (230.6, 394.5), (165.4, 403.3), (93.8, 413.1), (34.3, 419.5)],
  1200: [(1260.1, 638.8), (1200.2, 616.9), (1125.6, 593.3), (1057.7, 574.7), (995.7, 560.3), (938.5, 549), (884.4, 540.2), (833.5, 533.5), (784.8, 528.6), (737.7, 525.3), (692.2, 523.3), (646.5, 523.2), (600.8, 523.3), (555.3, 525.3), (508.1, 528.6), (459.5, 533.5), (408.6, 540.2), (354.6, 549), (297.3, 560.3), (235.3, 574.7), (167.2, 593.3), (92.7, 617), (32.8, 638.8)],
  1600: [(1158.6, 849.5), (1114.6, 814.5), (1055.8, 775.9), (999.9, 746.4), (946, 723.7), (895.7, 706.9), (848.8, 694.6), (804.6, 685.9), (762.9, 679.7), (723.2, 675.8), (684.6, 673.5), (646.4, 673.2), (608.4, 673.5), (569.8, 675.8), (530.1, 679.7), (488.4, 685.9), (444, 694.7), (397.4, 706.9), (347.1, 723.7), (293.1, 746.4), (237.3, 775.8), (178.1, 814.7), (134.3, 849.5)],
  2000: [(1027, 956.1), (998.8, 924.2), (967.2, 893.1), (910.4, 847.6), (889.9, 833.7), (855.8, 814.1), (823, 798.7), (791.3, 786.7), (760.8, 777.7), (731, 771.2), (702.1, 766.9), (673.7, 764.3), (645.5, 763.9), (617.5, 764.3), (589.2, 766.8), (560.5, 770.9), (530.3, 777.3), (499, 786.2), (467, 798.2), (433.4, 813.8), (399.8, 833.3), (364.3, 858.2), (337.8, 880.4)],
  2400: [(871.9, 960.6), (857, 940.1), (835.5, 916.5), (812.7, 897), (790, 882.1), (766.8, 870.4), (744.8, 861.9), (723.5, 855.9), (703.3, 851.7), (683.9, 849.1), (665, 847.7), (646.4, 848), (628, 847.7), (609.1, 849.1), (589.5, 851.7), (569.5, 855.8), (548.3, 861.8), (526.1, 870.4), (503.1, 882), (480.3, 897), (457.3, 916.5), (435.8, 940.2), (421, 960.7)],
  2800: [(782.4, 963.7), (772.5, 952.2), (758.5, 939), (744.6, 928.2), (731.2, 919.9), (717.5, 913.1), (704.8, 908.2), (692.4, 904.6), (680.4, 902), (668.8, 900.4), (657.7, 899.4), (646.4, 899.6), (635.3, 899.4), (624.2, 900.4), (612.7, 902), (600.6, 904.6), (588.2, 908.2), (575.3, 913.2), (561.9, 919.8), (548.4, 928.2), (534.5, 938.9), (520.5, 952.2), (510.6, 963.7)],
  3200: [(720.1, 965.8), (713.7, 960.7), (704.9, 954.8), (696.9, 950.4), (689.1, 946.9), (682, 944.3), (675.2, 942.4), (669, 941), (663, 940), (657.4, 939.2), (652, 939), (646.5, 939), (641, 939), (635.6, 939.2), (630, 940), (624, 941), (617.8, 942.4), (611, 944.3), (603.9, 946.9), (596.1, 950.4), (588.2, 954.7), (579.4, 960.6), (572.9, 965.8)],
  3600: [(674, 967.2), (672.5, 965.4), (670, 963.4), (667.5, 961.6), (664.9, 959.9), (662.3, 959), (659.7, 957.9), (656.9, 956.9), (654.1, 956.9), (651.7, 955.8), (649, 956), (646.1, 951.9), (643.9, 956.1), (641, 956), (638.3, 956.2), (635.7, 957), (632.8, 957.6), (630, 958.6), (627.3, 959.9), (624.7, 961.1), (622.1, 963.1), (619.6, 965.1), (617.8, 967)],
}

# ---------------------------------------------------------------------------------------------
# ONE PLOTTER FOR THE MEASURED GRAPHS. `svgplot.axes` starts every x axis at 0, and Figures 7 and
# 10 start at 1.0 cm and 10 s — so this is that routine's own layout (L 52, R 326, T 14, the same
# classes, the box sized from its label count) with an x minimum.
# ---------------------------------------------------------------------------------------------
def plot(xmin, xmax, xstep, ymin, ymax, ystep, xlab, ylab, label, extra, xminor, yminor,
         xfmt='%g', yfmt='%g'):
    L, R, T = 52, 326, 14
    rows = (ymax - ymin) / ystep + 1
    B = T + max(136, int(rows * 17))
    sx = lambda v: L + (R - L) * (v - xmin) / (xmax - xmin)
    sy = lambda v: B - (B - T) * (v - ymin) / (ymax - ymin)
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s">' % (W, B + 48, label)]
    n = int(round((xmax - xmin) / xminor))
    for i in range(n + 1):
        x = sx(xmin + i * xminor)
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>' % (x, T, x, B))
    n = int(round((ymax - ymin) / yminor))
    for i in range(n + 1):
        y = sy(ymin + i * yminor)
        p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"/>' % (L, y, R, y))
    p.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
             'stroke-width="1" opacity=".55"/>' % (L, T, R - L, B - T))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    n = int(round((xmax - xmin) / xstep + 1e-9))
    for i in range(n + 1):
        v = xmin + i * xstep
        if v <= xmax + 1e-9:
            p.append('<text x="%.1f" y="%d" class="num">%s</text>' % (sx(v), B + 15, xfmt % v))
    n = int(round((ymax - ymin) / ystep + 1e-9))
    for i in range(n + 1):
        v = ymin + i * ystep
        p.append('<text x="%d" y="%.1f" class="num" style="text-anchor:end">%s</text>'
                 % (L - 5, sy(v) + 4, yfmt % v))
    p.append(extra(sx, sy))
    p.append('<text x="%.1f" y="%d" class="ax" style="text-anchor:middle">%s</text>'
             % ((L + R) / 2, B + 36, xlab))
    p.append('<text x="12" y="%d" class="ax" style="text-anchor:middle" '
             'transform="rotate(-90 12 %d)">%s</text>' % ((T + B) / 2, (T + B) / 2, ylab))
    return ''.join(p) + '</svg>'

def curve(pts):
    def f(sx, sy):
        return ('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.6" '
                'stroke-linejoin="round"/>' % ' '.join('%.1f,%.1f' % (sx(x), sy(y)) for x, y in pts))
    return f

def crosses(pts):
    def f(sx, sy):
        o = []
        for x, y in pts:
            cx, cy = sx(x), sy(y)
            o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>' % (cx - 3, cy - 3, cx + 3, cy + 3))
            o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>' % (cx - 3, cy + 3, cx + 3, cy - 3))
        return ''.join(o)
    return f

def both(*fs):
    return lambda sx, sy: ''.join(f(sx, sy) for f in fs)

def fig3():
    def shade(sx, sy):
        under = [(x, y) for x, y in F3 if x <= 8] + [(8, interp(F3, 8))]
        pts = ['%.1f,%.1f' % (sx(0), sy(0))] + ['%.1f,%.1f' % (sx(0), sy(under[0][1]))] + \
              ['%.1f,%.1f' % (sx(x), sy(y)) for x, y in under] + ['%.1f,%.1f' % (sx(8), sy(0))]
        return ('<polygon points="%s" fill="currentColor" opacity=".16" stroke="none"/>' % ' '.join(pts))
    return plot(0, 10, 1, 0, 5.0, 0.5, 'height above Earth’s surface / 10⁶ m',
                'gravitational force / 10⁵ N',
                'Graph of the gravitational force on the space probe against its height above the '
                'Earth’s surface, with the area under the curve from 0 to 8 × 10⁶ m shaded',
                both(shade, curve([(0, F3[0][1])] + F3)), 1, 0.5, yfmt='%.1f')

def fig7():
    return plot(1.0, 2.5, 0.5, 0, 10, 1, 'h / cm', 'N / 10³',
                'Graph of the number of sparks N in 10 minutes against the height h of the source '
                'above the mesh, from h = 1.0 cm to 2.5 cm', curve(F7), 0.02, 0.2, xfmt='%.1f')

def fig9():
    return plot(0, 12, 1, 0, 6.0, 0.5, 'time / s', 'current / 10⁻⁵ A',
                'Graph of the ammeter reading against time as the capacitor charges from 0 to 4.0 V',
                curve([(0, 6.0)] + F9), 0.2, 0.1, yfmt='%.1f')

def fig10():
    return plot(10, 42.5, 5, 1.5, 4.0, 0.5, 'time / s', 'pd / V',
                'Graph of the pd across the capacitor against time from 10 s to 42.5 s',
                curve(F10), 0.5, 0.05, yfmt='%.1f')

def fig15():
    return plot(0, 16, 2, 0, 0.9, 0.1, 'm<tspan dy="3" font-size="9">M</tspan><tspan dy="-3"> / m</tspan>'
                '<tspan dy="3" font-size="9">N</tspan>', 'v / u',
                'Graph of the ratio v over u against the mass ratio m M over m N, with crosses at '
                'every even mass ratio from 2 to 14 on a smooth curve that starts at 1 on the axis',
                both(curve(F15), crosses(F15X)), 2, 0.1, yfmt='%.1f')

def fig32():
    return plot(0, 50, 5, 4.0, 14.0, 1.0, 'time / s', 'activity / MBq',
                'Graph of the activity of a sample of nuclide X against time from 0 to 45 s',
                curve([(0, 14.0)] + F32), 1, 0.2, yfmt='%.1f')

def interp(pts, x):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x0 <= x <= x1:
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    raise ValueError(x)

def arrowhead(x, y, ang, s=5):
    a = math.radians(ang)
    p1 = (x - s * math.cos(a - .45), y - s * math.sin(a - .45))
    p2 = (x - s * math.cos(a + .45), y - s * math.sin(a + .45))
    return ('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor"/>'
            % (x, y, p1[0], p1[1], p2[0], p2[1]))

def txt(x, y, s, cls='lbl', anchor='middle', style=''):
    return ('<text x="%.1f" y="%.1f" class="%s" style="text-anchor:%s%s">%s</text>'
            % (x, y, cls, anchor, (';' + style) if style else '', s))

def ln(x1, y1, x2, y2, extra=''):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1.2"%s/>'
            % (x1, y1, x2, y2, extra))

def dimension(x1, y1, x2, y2):
    ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
    return ln(x1, y1, x2, y2, ' stroke-width="0.9"') + arrowhead(x2, y2, ang) + arrowhead(x1, y1, ang + 180)

# ---- FIGURE 1: the cube. Side l, P at the centre of the front face moving at c towards W. ----
def fig1():
    x0, y0, s, dx, dy = 110, 50, 100, 42, -32
    o = ['<svg viewBox="0 0 %d 190" role="img" aria-label="A hollow cube of side l. A particle P '
         'inside it moves with velocity c towards the shaded right-hand face W.">' % W]
    o.append('<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="currentColor" opacity=".22"/>'
             % (x0 + s, y0, x0 + s + dx, y0 + dy, x0 + s + dx, y0 + s + dy, x0 + s, y0 + s))
    o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
             'stroke-width="1.2"/>' % (x0, y0, s, s))
    o.append('<polyline points="%d,%d %d,%d %d,%d %d,%d" fill="none" stroke="currentColor" '
             'stroke-width="1.2"/>' % (x0, y0, x0 + dx, y0 + dy, x0 + s + dx, y0 + dy, x0 + s + dx, y0 + s + dy))
    o.append(ln(x0 + s, y0, x0 + s + dx, y0 + dy) + ln(x0 + s, y0 + s, x0 + s + dx, y0 + s + dy))
    d = ' stroke-dasharray="4 3" stroke-width="0.9"'
    o.append(ln(x0 + dx, y0 + dy, x0 + dx, y0 + s + dy, d) + ln(x0 + dx, y0 + s + dy, x0, y0 + s, d)
             + ln(x0 + dx, y0 + s + dy, x0 + s + dx, y0 + s + dy, d))
    px, py = x0 + s / 2 - 4, y0 + s / 2 + 4
    o.append('<circle cx="%.1f" cy="%.1f" r="2.6" fill="currentColor"/>' % (px, py))
    o.append(ln(px, py, px + 30, py, ' stroke-width="0.9"') + arrowhead(px + 30, py, 0))
    o.append(txt(px, py - 7, '<tspan font-weight="bold">P</tspan>') + txt(px + 38, py + 4, '<tspan font-style="italic">c</tspan>', anchor='start'))
    o.append(txt(x0 + s + dx / 2, y0 + s / 2 + dy / 2 + 4, '<tspan font-weight="bold">W</tspan>'))
    o.append(dimension(x0, y0 + s + 14, x0 + s, y0 + s + 14) + txt(x0 + s / 2, y0 + s + 30, '<tspan font-style="italic">l</tspan>'))
    o.append(dimension(x0 + s + dx + 12, y0 + dy, x0 + s + dx + 12, y0 + s + dy)
             + txt(x0 + s + dx + 22, y0 + s / 2 + dy + 4, '<tspan font-style="italic">l</tspan>', anchor='start'))
    o.append(dimension(x0 + s + 8, y0 + s + 8, x0 + s + dx + 8, y0 + s + dy + 8)
             + txt(x0 + s + dx / 2 + 18, y0 + s + dy / 2 + 16, '<tspan font-style="italic">l</tspan>', anchor='start'))
    return ''.join(o) + '</svg>'

# ---- FIGURE 2: the tyre, to scale — 660 mm and 330 mm diameters, 370 mm wide (0.2 px per mm). ----
def fig2():
    k = 0.2
    cx, cy, R, r = 84, 102, 660 * k / 2, 330 * k / 2
    o = ['<svg viewBox="0 0 %d 215" role="img" aria-label="Side view and front view of the wheel: '
         'the gas in the tyre fills the space between a rim 330 mm across and a tyre 660 mm across, '
         'and the tyre is 370 mm wide.">' % W]
    o.append(txt(cx, 18, 'side view', style='font-weight:bold') + txt(301, 18, 'front view', style='font-weight:bold'))
    o.append('<path d="M%.1f,%.1f a%.1f,%.1f 0 1,0 %.1f,0 a%.1f,%.1f 0 1,0 %.1f,0 Z M%.1f,%.1f '
             'a%.1f,%.1f 0 1,0 %.1f,0 a%.1f,%.1f 0 1,0 %.1f,0 Z" fill="currentColor" fill-opacity=".3" '
             'fill-rule="evenodd" stroke="currentColor" stroke-width="1.4"/>'
             % (cx - R, cy, R, R, 2 * R, R, R, -2 * R, cx - r, cy, r, r, 2 * r, r, r, -2 * r))
    o.append('<circle cx="%.1f" cy="%.1f" r="5" fill="none" stroke="currentColor"/>' % (cx, cy))
    for a in range(5):
        t = math.radians(90 + 72 * a)
        o.append(ln(cx + 6 * math.cos(t), cy - 6 * math.sin(t), cx + (r - 4) * math.cos(t), cy - (r - 4) * math.sin(t), ' stroke-width="2.4"'))
    o.append(txt(4, 34, 'tyre', anchor='start') + ln(28, 32, cx - 40, cy - 48, ' stroke-width="0.7"')
             + txt(2, 178, 'rim', anchor='start') + ln(22, 172, cx - 24, cy + 22, ' stroke-width="0.7"'))
    dash = ' stroke-dasharray="3 3" stroke-width="0.8"'
    for y in (cy - R, cy + R):
        o.append(ln(cx, y, 262, y, dash))
    for y in (cy - r, cy + r):
        o.append(ln(cx, y, 168, y, dash))
    o.append(dimension(162, cy - r, 162, cy + r) + txt(166, cy + 4, '330 mm', anchor='start'))
    o.append(dimension(214, cy - R, 214, cy + R) + txt(218, cy - 40, '660 mm', anchor='start'))
    fx, fw = 264, 370 * k
    o.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="currentColor" fill-opacity=".3" '
             'stroke="currentColor" stroke-width="1.4"/>' % (fx, cy - R, fw, 2 * R))
    for y in (cy - r, cy + r):
        o.append(ln(fx, y, fx + fw, y, dash))
    o.append(dimension(fx, cy + R + 14, fx + fw, cy + R + 14) + txt(fx + fw / 2, cy + R + 30, '370 mm'))
    return ''.join(o) + '</svg>'

# ---- FIGURE 5: equipotentials, traced (image px → svg: x·0.215 + 8, y·0.215 + 4). ----
def fig5():
    X = lambda px: 4 + px * 0.205
    Y = lambda py: 6 + py * 0.205
    o = ['<svg viewBox="0 0 %d 250" role="img" aria-label="Equipotentials between the metal mesh at '
         '0 V and the wire at 4000 V, 5.0 mm below it, drawn every 400 V, with a dashed line from the '
         'mesh straight down to the wire and a point P on the 2000 V equipotential.">' % W]
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="3"/>'
             % (X(186), Y(67.5), X(1107), Y(67.5)))
    o.append(ln(X(646.5), Y(84), X(646.5), Y(970), ' stroke-dasharray="4 3" stroke-width="0.8" opacity=".7"'))
    for v, pts in EQ.items():
        o.append('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.1"/>'
                 % ' '.join('%.1f,%.1f' % (X(a), Y(b)) for a, b in pts))
    o.append('<circle cx="%.1f" cy="%.1f" r="2.4" fill="currentColor"/>' % (X(646.5), Y(981.7)))
    o.append('<circle cx="%.1f" cy="%.1f" r="4.7" fill="currentColor"/>' % (X(934.8), Y(865.7)))
    o.append(txt(X(987), Y(872), '<tspan font-weight="bold">P</tspan>'))
    o.append(txt(X(646), Y(40), 'metal mesh') + txt(X(136), Y(76), '0 V') + txt(X(84), Y(205), '400 V')
             + txt(X(294), Y(930), '2000 V') + txt(X(647), Y(1040), '4000 V') + txt(X(646), Y(1112), 'wire'))
    o.append(dimension(X(1408), Y(68), X(1408), Y(970)) + txt(X(1408) + 4, Y(520), '5.0 mm', anchor='start'))
    return ''.join(o) + '</svg>'

# ---- FIGURE 6: blank axes for the sketch, d from 0 (mesh) to 5 mm (wire). No values on E. ----
def fig6():
    L, R, T, B = 60, 290, 16, 126
    o = ['<svg viewBox="0 0 %d 170" role="img" aria-label="Blank axes: E upwards with no values, '
         'd / mm along from 0 at the mesh to 5 at the wire.">' % W]
    o.append(ln(L, T, L, B) + ln(L, B, R + 8, B))
    o.append(ln(R, B, R, B + 4))
    o.append(txt(L - 12, (T + B) / 2, '<tspan font-style="italic">E</tspan>', cls='ax'))
    o.append(txt(L, B + 15, '0', cls='num') + txt(R, B + 15, '5', cls='num')
             + txt((L + R) / 2, B + 15, '<tspan font-style="italic">d</tspan> / mm', cls='ax')
             + txt(L, B + 30, '(mesh)') + txt(R, B + 30, '(wire)'))
    return ''.join(o) + '</svg>'

# ---- FIGURE 8: the circuit. ----
def fig8():
    o = ['<svg viewBox="0 0 %d 250" role="img" aria-label="Circuit: a 6.0 V battery, a two-way '
         'switch, a capacitor C with a voltmeter across it, a resistor R1 and an ammeter in series '
         'with the capacitor, and a resistor R2. The switch connects the capacitor branch either to '
         'the battery or to R2.">' % W]
    bx, cx, rx, top, bot = 77, 210, 306, 24, 236
    # left: battery
    o.append(ln(bx, top, bx, 100) + ln(bx, 124, bx, bot))
    o.append(ln(bx - 16, 100, bx + 16, 100, ' stroke-width="1.6"') + ln(bx - 8, 110, bx + 8, 110, ' stroke-width="2.6"')
             + ln(bx - 16, 114, bx + 16, 114, ' stroke-width="1.6"') + ln(bx - 8, 124, bx + 8, 124, ' stroke-width="2.6"'))
    o.append(txt(bx - 24, 116, '6.0 V', anchor='end'))
    # top: switch — left contact to battery, right contact to R2, blade from the capacitor branch
    o.append(ln(bx, top, cx - 14, top) + ln(cx + 14, top, rx, top))
    o.append('<circle cx="%d" cy="%d" r="3" fill="none" stroke="currentColor"/>' % (cx - 11, top))
    o.append('<circle cx="%d" cy="%d" r="3" fill="none" stroke="currentColor"/>' % (cx + 11, top))
    o.append(ln(cx, 46, cx - 9, top + 3) + ln(cx, 46, cx, 66))
    # capacitor with voltmeter across it
    o.append('<circle cx="%d" cy="66" r="2.4" fill="currentColor"/>' % cx)
    o.append(ln(cx, 66, cx, 86) + ln(cx - 18, 86, cx + 18, 86, ' stroke-width="1.6"')
             + ln(cx - 18, 94, cx + 18, 94, ' stroke-width="1.6"') + ln(cx, 94, cx, 122))
    o.append('<circle cx="%d" cy="122" r="2.4" fill="currentColor"/>' % cx)
    o.append(txt(cx + 24, 94, '<tspan font-style="italic">C</tspan>', anchor='start'))
    vx = 145
    o.append(ln(cx, 66, vx, 66) + ln(vx, 66, vx, 78) + ln(vx, 106, vx, 122) + ln(vx, 122, cx, 122))
    o.append('<circle cx="%d" cy="92" r="14" fill="none" stroke="currentColor" stroke-width="1.2"/>' % vx
             + txt(vx, 96, 'V'))
    # R1 and ammeter
    o.append(ln(cx, 122, cx, 132) + '<rect x="%d" y="132" width="16" height="44" fill="none" '
             'stroke="currentColor" stroke-width="1.2"/>' % (cx - 8) + ln(cx, 176, cx, 188))
    o.append(txt(cx + 14, 160, 'R<tspan dy="3" font-size="9">1</tspan>', anchor='start', style='font-style:italic'))
    o.append('<circle cx="%d" cy="202" r="14" fill="none" stroke="currentColor" stroke-width="1.2"/>' % cx
             + txt(cx, 206, 'A') + ln(cx, 216, cx, bot))
    # right: R2
    o.append(ln(rx, top, rx, 94) + '<rect x="%d" y="94" width="16" height="44" fill="none" '
             'stroke="currentColor" stroke-width="1.2"/>' % (rx - 8) + ln(rx, 138, rx, bot))
    o.append(txt(rx + 12, 122, 'R<tspan dy="3" font-size="9">2</tspan>', anchor='start', style='font-style:italic'))
    o.append(ln(bx, bot, rx, bot) + '<circle cx="%d" cy="%d" r="2.4" fill="currentColor"/>' % (cx, bot))
    return ''.join(o) + '</svg>'

# ---- FIGURE 12: blank grid, 8 × 6 squares, for the intensity–θ sketch. ----
def fig12():
    L, T, c = 70, 12, 30
    o = ['<svg viewBox="0 0 %d 225" role="img" aria-label="Blank grid of 8 by 6 squares: electron '
         'intensity upwards from 0, theta along from 0.">' % W]
    for i in range(9):
        o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="grid"/>' % (L + i * c, T, L + i * c, T + 6 * c))
    for j in range(7):
        o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="grid"/>' % (L, T + j * c, L + 8 * c, T + j * c))
    o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, T + 6 * c))
    o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T + 6 * c, L + 8 * c, T + 6 * c))
    o.append(txt(L - 6, T + 6 * c + 4, '0', cls='num', anchor='end') + txt(L, T + 6 * c + 16, '0', cls='num')
             + txt(L + 4 * c, T + 6 * c + 18, '<tspan font-style="italic">θ</tspan>', cls='ax'))
    o.append('<text x="14" y="%d" class="ax" style="text-anchor:middle" transform="rotate(-90 14 %d)">'
             'electron intensity</text>' % (T + 3 * c, T + 3 * c))
    return ''.join(o) + '</svg>'

# ---- 14: six charges ±Q equally spaced round a circle of diameter d. ----
def fig14():
    cx, cy, r = 170, 112, 78
    signs = {60: '+', 0: '+', -60: '−', -120: '+', 180: '−', 120: '−'}
    o = ['<svg viewBox="0 0 %d 230" role="img" aria-label="Six charged spheres equally spaced round '
         'a dashed circle of diameter d: going clockwise from the top right they are +Q, +Q, −Q, +Q, '
         '−Q and −Q.">' % W]
    o.append('<circle cx="%d" cy="%d" r="%d" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>' % (cx, cy, r))
    for a, s in signs.items():
        t = math.radians(a)
        x, y = cx + r * math.cos(t), cy - r * math.sin(t)
        o.append('<circle cx="%.1f" cy="%.1f" r="8" fill="currentColor" fill-opacity=".25" stroke="currentColor"/>' % (x, y))
        lx, ly = cx + (r + 24) * math.cos(t), cy - (r + 24) * math.sin(t) + 4
        o.append(txt(lx, ly, s + '<tspan font-style="italic">Q</tspan>'))
    t1, t2 = math.radians(205), math.radians(25)
    o.append(dimension(cx + (r - 2) * math.cos(t1), cy - (r - 2) * math.sin(t1),
                       cx + (r - 2) * math.cos(t2), cy - (r - 2) * math.sin(t2)))
    o.append(txt(cx + 2, cy + 24, '<tspan font-style="italic">d</tspan>'))
    return ''.join(o) + '</svg>'

# ---- 16: a parabola bending upwards inside a shaded square (px from the page, offset 300, 150). ----
def fig16():
    o = ['<svg viewBox="0 0 %d 180" role="img" aria-label="A shaded square region of uniform '
         'electric field. An electron enters from the left moving horizontally and its path curves '
         'upwards as it crosses the region.">' % W]
    o.append('<rect x="30" y="15" width="148" height="150" fill="currentColor" opacity=".16"/>')
    k = 78.0 / 142 ** 2
    pts = ['%.1f,%.1f' % (30 + u, 95 - k * u * u) for u in range(0, 143, 6)]
    o.append('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.4"/>' % ' '.join(pts))
    u = 81
    o.append(arrowhead(30 + u, 95 - k * u * u, math.degrees(math.atan(-2 * k * u))))
    o.append(ln(132, 57, 190, 57, ' stroke-width="0.8"') + txt(194, 61, 'path of electron', anchor='start'))
    o.append(ln(150, 112, 190, 112, ' stroke-width="0.8"') + txt(194, 108, 'region of uniform', anchor='start')
             + txt(194, 122, 'electric field', anchor='start'))
    return ''.join(o) + '</svg>'

# ---- 17: E against r outside a charged sphere of radius R — an inverse square from R, shaded. ----
def fig17():
    ox, oy, xr = 40, 150, 72
    o = ['<svg viewBox="0 0 %d 180" role="img" aria-label="Graph of electric field strength E '
         'against distance r from the centre of a charged sphere of radius R: nothing is drawn '
         'inside R, and from R outwards E falls away as an inverse-square curve towards zero. The '
         'area under the curve from R onwards is shaded.">' % W]
    fx = lambda x: oy - 138 * ((xr - ox) / float(x - ox)) ** 2
    xs = list(range(xr, 331, 4))
    o.append('<polygon points="%s" fill="currentColor" opacity=".18"/>'
             % ' '.join(['%d,%d' % (xr, oy)] + ['%d,%.1f' % (x, fx(x)) for x in xs] + ['%d,%d' % (xs[-1], oy)]))
    o.append('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.4"/>'
             % ' '.join('%d,%.1f' % (x, fx(x)) for x in xs))
    o.append(ln(ox, 8, ox, oy) + ln(ox, oy, 332, oy))
    o.append(ln(xr, oy, xr, 10, ' stroke-dasharray="4 3" stroke-width="0.8"'))
    o.append(txt(ox - 14, 80, '<tspan font-style="italic">E</tspan>', cls='ax') + txt(ox - 6, oy + 4, '0', cls='num', anchor='end')
             + txt(ox, oy + 15, '0', cls='num') + txt(xr, oy + 15, '<tspan font-style="italic">R</tspan>', cls='num')
             + txt(200, oy + 15, '<tspan font-style="italic">r</tspan>', cls='ax'))
    return ''.join(o) + '</svg>'

# ---- 22: the flux graph, with t₁–t₄ at their measured positions on the page. ----
def fig22():
    ox, oy = 40, 130
    t = {1: 21, 2: 57, 3: 151, 4: 228}
    o = ['<svg viewBox="0 0 %d 160" role="img" aria-label="Graph of magnetic flux phi against time t: '
         'zero until t1, rising steeply in a straight line to a maximum at t2, constant until t3, then '
         'falling in a less steep straight line to zero at t4.">' % W]
    o.append(ln(ox, 10, ox, oy) + ln(ox, oy, ox + 262, oy))
    o.append('<polyline points="%d,%d %d,%d %d,%d %d,%d" fill="none" stroke="currentColor" stroke-width="1.6"/>'
             % (ox + t[1], oy, ox + t[2], 18, ox + t[3], 18, ox + t[4], oy))
    for k, x in t.items():
        o.append(ln(ox + x, 12, ox + x, oy, ' stroke-dasharray="4 3" stroke-width="0.7"'))
        o.append(txt(ox + x, oy + 15, '<tspan font-style="italic">t</tspan><tspan dy="3" font-size="9">%d</tspan>' % k, cls='num'))
    o.append(txt(ox - 12, 22, '<tspan font-style="italic">ϕ</tspan>', cls='ax') + txt(ox + 256, oy + 15, '<tspan font-style="italic">t</tspan>', cls='ax'))
    return ''.join(o) + '</svg>'

TABLE1 = ('<p><b>Table 1</b> shows the pressure in the tyre and the mass of the wheel before and '
          'after the addition of the extra gas.</p><p>The gas is kept at a constant temperature of '
          '100 °C.</p><table><tr><th></th><th>Pressure in tyre / Pa</th><th>Mass of wheel / kg</th></tr>'
          '<tr><td>Before</td><td>1.01 &times; 10<sup>5</sup></td><td>14.897</td></tr>'
          '<tr><td>After</td><td>2.11 &times; 10<sup>5</sup></td><td>14.991</td></tr></table>')

TABLE2 = ('<table><tr><th></th><th>Distance of space probe from centre of mass of X / 10<sup>6</sup> m</th>'
          '<th>Speed of space probe / 10<sup>3</sup> m s<sup>&minus;1</sup></th></tr>'
          '<tr><td>A</td><td>6.0</td><td>1.1</td></tr><tr><td>B</td><td>0.17</td><td>1.3</td></tr></table>')

GSTEM = ('<p>At the Earth’s surface,</p><ul><li>the gravitational field strength of the Sun is '
         '<i>g</i><sub>S</sub></li><li>the gravitational field strength of the Earth is '
         '<i>g</i><sub>E</sub>.</li></ul>')

ALPHA = ('<p>An alpha particle passes through the mesh.</p><p>The alpha particle ionises an argon '
         'atom at <b>P</b> on <b>Figure 5</b>, releasing one electron.</p><p>The electron and the '
         'argon ion have no kinetic energy at <b>P</b>.</p><p>The electron then travels to the wire '
         'and the argon ion travels to the mesh.</p>')

RATIO = ('<sup>speed of electron when it reaches the wire</sup>&frasl;<sub>speed of argon ion when it '
         'reaches the mesh</sub>')

R13 = '<i>R</i> = <i>R</i><sub>0</sub><i>A</i><sup>1/3</sup>'

GLIDERS = ('<p>The collision of a neutron with the nucleus of a moderator atom is modelled using two '
           'gliders on a horizontal frictionless air track.</p><p>In <b>Figures 13</b> and <b>14</b> '
           'the glider <b>N</b> of mass <i>m</i><sub>N</sub> represents the neutron and the glider '
           '<b>M</b> of mass <i>m</i><sub>M</sub> represents the moderator nucleus.</p>'
           '<p><b>Figure 13</b> shows glider <b>N</b> travelling with initial speed <i>u</i> towards the '
           'stationary glider <b>M</b>.</p><p>The gliders collide. <b>N</b> rebounds with speed '
           '<i>v</i> as shown in <b>Figure 14</b>.</p>'
           '<p>[Figures 13 and 14: before the collision, the smaller glider N moves to the right at '
           'speed <i>u</i> towards the larger glider M, which is at rest; after it, N moves to the '
           'left at speed <i>v</i> and M moves to the right.]</p>')

MRATIO = '<sup><i>m</i><sub>M</sub></sup>&frasl;<sub><i>m</i><sub>N</sub></sub>'
F15P = ('<p><b>Figure 15</b> shows the variation of the ratio <sup><i>v</i></sup>&frasl;<sub><i>u</i></sub> '
        'with the ratio ' + MRATIO + '.</p>')

def mc(stem, opts):
    return stem + '<p>' + '<br>'.join('<b>%s</b>&nbsp; %s' % (l, o) for l, o in zip('ABCD', opts)) + '</p>'

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, accept)
Q = [
 ('1', '1', 1, 'written', TH, '', '',
  '<p>State what is meant by the internal energy of an ideal gas.</p>',
  'The total kinetic energy of the particles. "Molecules" or "atoms" are condoned for particles. '
  'The mean kinetic energy, or the kinetic energy of a single particle, is not accepted, and neither '
  'is any answer implying potential energy (or any other energy) is added to the kinetic energy.', ''),
 ('1', '2', 1, 'explain', TH, '', '',
  '<p>Explain why <b>P</b> has a change in momentum of &minus;2<i>mc</i> during one collision with '
  '<b>W</b>.</p>',
  'The collision is elastic, so the speed is the same before and after: Δp = p<sub>final</sub> − '
  'p<sub>initial</sub> = −mc − mc = −2mc. Either the initial or the final momentum must be described '
  'clearly enough to justify the negative answer (Δ is taken to mean final − initial).', ''),
 ('1', '3', 1, 'proof', TH, '', '',
  '<p><b>P</b> collides repeatedly with <b>W</b>.</p><p>Show that the frequency <i>f</i> of collisions '
  'is <sup><i>c</i></sup>&frasl;<sub>2<i>l</i></sub>.</p>',
  'The time between collisions with W is T = 2l / c (the particle travels 2l at speed c), so '
  'f = 1/T = c / 2l. There must be evidence of a time calculation using distance and speed; any '
  'attempted use of v = fλ is not allowed.', ''),
 ('1', '4', 2, 'proof', TH, '', '',
  '<p>Deduce an expression, in terms of <i>m</i>, <i>c</i> and <i>V</i>, for the contribution of '
  '<b>P</b> to the pressure exerted on <b>W</b>.</p><p>Refer to appropriate Newton’s laws of motion.</p>',
  'p = mc²/V. A reference to a Newton law (a simple link between Newton’s name and an equation is '
  'enough) and P = F/A (1 mark); F = rate of change of momentum = 2mc × c/2l = mc²/l, so P = '
  '(mc²/l)/l² = mc²/V (1 mark).', ''),

 ('2', '1', 5, 'calculation', TH, '', '',
  '<p>The mass of the wheel is measured when the gas in the tyre is at a pressure of 1.01 &times; '
  '10<sup>5</sup> Pa.</p><p>More of the same gas is added to the tyre and the mass of the wheel is '
  'measured again.</p>' + TABLE1 + '<p>Determine, in kg mol<sup>&minus;1</sup>, the molar mass of the '
  'gas.</p><p>molar mass = ______ kg mol<sup>&minus;1</sup></p>',
  '0.028 kg mol⁻¹. Volume of gas = πhd²/4 for the outer cylinder minus the rim: '
  'π × 0.370 × 0.660²/4 = 0.1265 m³ and π × 0.370 × 0.330²/4 = 0.0316 m³ (1, an attempt at either '
  'volume; power-of-ten errors condoned), so V = 0.1265 − 0.0316 = 0.0949 m³ (1). n = pV/RT at '
  'T = 373 K: 1.01 × 10⁵ × 0.0949 / (8.31 × 373) = 3.09 mol, or 2.11 × 10⁵ × 0.0949 / (8.31 × 373) = '
  '6.46 mol (1); Δn = 6.46 − 3.09 = 3.37 mol (1); molar mass = (14.991 − 14.897)/3.37 = 0.094/3.37 = '
  '0.028 kg mol⁻¹ (1).',
  '0.0275 to 0.0285'),
 ('2', '2', 2, 'explain', TH, '', '',
  '<p>Motorsport regulations specify a minimum amount of gas in the tyre.</p><p>The amount of gas in '
  'the tyre is checked by measuring the pressure before the wheel is put onto the car. The regulations '
  'also specify a maximum temperature for the tyre when making this measurement.</p><p>Explain why a '
  'maximum temperature is specified.</p>',
  'Carrying out the check at a higher temperature increases the pressure in the tyre (1 — linking '
  'pressure to temperature; p ∝ T is condoned); so the tyre could pass the check with a smaller amount '
  'of gas in it — when the tyre is hot the same pressure is reached with less gas (1).', ''),

 ('3', '1', 2, 'written', GR, '', '',
  '<p>Describe <b>two</b> properties of a radial gravitational field.</p>',
  'One general point (1): a region in which a mass experiences a force due to another mass; OR the '
  'field is conservative, so any change in potential energy depends only on the initial and final '
  'positions and not on the path; OR the force is always attractive / the field lines point to the '
  '(centre of) mass / the equipotential surfaces are spherical about the (centre of) mass; OR it is a '
  'non-contact force. AND the point specific to a radial field (1): the field strength (force) has an '
  'inverse-square variation with distance. "The force is attractive" alone is insufficient; "force" '
  'and "mass" must be used rather than words like "effect", "gravity" or "object".', ''),
 ('3', '2', 1, 'written', GR, 'graph', fig3(),
  '<p>A space probe is launched from the Earth’s surface.</p><p><b>Figure 3</b> shows how the '
  'gravitational force acting on the space probe varies with height above the Earth’s surface.</p>'
  '<p>State the physical significance of the shaded area in <b>Figure 3</b>.</p>',
  'The (minimum) energy needed / work done to launch the space probe to a height of 8 × 10⁶ m; OR the '
  'change in gravitational potential energy of the probe when it is moved from the Earth’s surface to '
  'a height of 8 × 10⁶ m.', ''),
 ('3', '3', 2, 'calculation', GR, '', '',
  GSTEM + '<p>Calculate <sup><i>g</i><sub>S</sub></sup>&frasl;<sub><i>g</i><sub>E</sub></sub>.</p>'
  '<p>distance from the Earth to the Sun = 1.50 &times; 10<sup>11</sup> m</p>'
  '<p><sup><i>g</i><sub>S</sub></sup>&frasl;<sub><i>g</i><sub>E</sub></sub> = ______</p>',
  '6.0 × 10⁻⁴ (or 0.060%). g<sub>S</sub> = GM<sub>S</sub>/r² = 6.67 × 10⁻¹¹ × 1.99 × 10³⁰ / '
  '(1.50 × 10¹¹)² = 5.90 × 10⁻³ N kg⁻¹, or a substitution into a valid equation (1); '
  'g<sub>S</sub>/g<sub>E</sub> = 5.90 × 10⁻³ / 9.81 = 6.0 × 10⁻⁴ (1). Alternatively the ratio '
  '(M<sub>Sun</sub>/M<sub>Earth</sub>) × (r<sub>Earth</sub>/r<sub>Sun</sub>)² may be used. The answer '
  'must be given to at least 2 s.f.; if 3 or more are seen it must round to 6.01 or 6.02 × 10⁻⁴.',
  '0.0006 to 0.000602 | 6.0 × 10^-4 | 6.0x10^-4 | 6 × 10^-4 | 6.01 × 10^-4 | 6.02 × 10^-4 | 6.01x10^-4 | 6.02x10^-4'),
 ('3', '4', 1, 'explain', GR, '', '',
  GSTEM + '<p>Explain why <i>g</i><sub>S</sub> is more important than <i>g</i><sub>E</sub> in '
  'predicting the motion of the space probe as it escapes from the Solar System.</p>',
  'The force from the Earth, because of its smaller mass, is less than the force from the Sun at a '
  'similar distance; OR the total work done in moving a long way from the Sun is much greater than '
  'that in moving a long way from the Earth, because m<sub>E</sub> ≪ m<sub>S</sub>. "Edge of the Solar '
  'System" is condoned for "a similar distance".', ''),
 ('3', '5', 4, 'calculation', GR, '', '',
  '<p>The space probe eventually reaches a point where the gravitational influence of the Solar '
  'System is negligible.</p><p>The probe is unpowered as it approaches an isolated interstellar body '
  '<b>X</b>.</p><p>The gravitational field of <b>X</b> changes the kinetic energy of the space probe.</p>'
  '<p><b>Table 2</b> shows the distance of the space probe from the centre of mass of <b>X</b> and the '
  'speed for two positions <b>A</b> and <b>B</b> of the space probe.</p>' + TABLE2 +
  '<p>The space probe has a mass of 4.9 &times; 10<sup>4</sup> kg.</p><p>Calculate the mass of '
  '<b>X</b>.</p><p>mass of X = ______ kg</p>',
  '6.3 × 10²⁰ kg. Change in kinetic energy (or per unit mass) formulated: ½m(v<sub>B</sub>² − '
  'v<sub>A</sub>²) = 1.18 × 10¹⁰ J, i.e. m × 2.40 × 10⁵ J (1; 2 s.f. allowed). Change in gravitational '
  'potential energy formulated: ΔE<sub>p</sub> = GMm(1/1.7 × 10⁵ − 1/6.0 × 10⁶) = GMm × 5.72 × 10⁻⁶ '
  '(1). Evidence of the intention to equate ΔE<sub>k</sub> and ΔE<sub>p</sub>, e.g. ½(v<sub>B</sub>² − '
  'v<sub>A</sub>²) = GM/r<sub>B</sub> − GM/r<sub>A</sub>, with data substituted (1; ecf allowed); mass '
  'of X = 6.3 × 10²⁰ kg (1).',
  '6.3 × 10^20 | 6.3x10^20 | 6.29 × 10^20 | 6.29x10^20'),

 ('4', '1', 2, 'drawing', EM, 'graph', fig6(),
  '<p><b>Figure 5</b> shows a dashed line between the mesh and the wire.</p><p>Sketch on '
  '<b>Figure 6</b> a graph to show how the magnitude <i>E</i> of the electric field strength varies '
  'with the distance <i>d</i> from the mesh along this dashed line.</p><p>No values are required on '
  'the <i>E</i> axis.</p>',
  'A horizontal line above zero for more than half the distance (1), then curving upwards towards the '
  'wire (1). The two marks are independent.', ''),
 ('4', '2', 2, 'calculation', EM + ', ' + PR, '', '',
  ALPHA + '<p>Calculate the ratio ' + RATIO + '.</p><p>Assume that the air has no effect on the motion '
  'of the electron or on the motion of the argon ion.</p><p>mass of argon ion = 6.64 &times; '
  '10<sup>&minus;26</sup> kg</p><p>ratio = ______</p>',
  '270. A statement that the (kinetic) energy gained is the same, or a correct substitution of data '
  'into the equation or ratio (1); ratio = √(6.64 × 10⁻²⁶ / 9.11 × 10⁻³¹) = 270 (1). Factors that '
  'cancel, such as ½, may be absent.',
  '269.5 to 270.5'),
 ('4', '3', 1, 'explain', EM, '', '',
  ALPHA + '<p>In practice, the air <b>does</b> affect the motion of the electron and the motion of the '
  'argon ion.</p><p>Suggest how the presence of air between the mesh and the wire changes the ratio in '
  'Question 04.2.</p><p>No numerical detail is required.</p>',
  'The ratio is larger — because, due to collisions, the argon ion loses more energy / speed / momentum '
  'than the electron; OR the argon ion is more ionising than the electron (the electron is less '
  'ionising). The mark is for the explanation. "The argon ion has a higher probability of collision" '
  'is accepted, as are reverse arguments; answers suggesting the particles travel different distances, '
  'or referring to air resistance, are not.', ''),
 ('4', '4', 3, 'explain', NUC + ', ' + EM, 'graph', fig7(),
  '<p>The alpha source in <b>Figure 4</b> is moved to different heights <i>h</i> above the mesh.</p>'
  '<p><b>Figure 7</b> shows how the number of sparks <i>N</i> produced in 10 minutes varies with '
  '<i>h</i>.</p><p>No sparks are produced when the source is not present.</p><p>Student A suggests that '
  'the spark rate obeys an inverse-square law.</p><p>Student B suggests that the spark rate decreases '
  'exponentially with <i>h</i>.</p><p>Determine whether either student is correct.</p>',
  'Neither is correct. Evidence of a suitable test of A’s suggestion using 2 or more data points, e.g. '
  'Nh² = constant (1): 10 × 1.0² = 10 but 4 × 1.34² = 7.18, so Nh² is not constant. Evidence of a '
  'suitable test of B’s suggestion using 2 or more sets of data (1): N should halve in equal intervals '
  'of h (or N e<sup>h</sup> constant for N = k e<sup>−h</sup>; log/ln tests accepted) — but N falls '
  'from 10 to 5 in 0.25 cm and from 5 to 2.5 in 0.31 cm. Both tests performed AND both suggestions '
  'rejected with reasons (1). An answer accepting B is allowed if it refers to experimental error and '
  'the difference is small.', ''),

 ('5', '1', 3, 'proof', CAP, '', '',
  '<p>Show that the time taken for the capacitor to charge from 2.0 V to 4.0 V is approximately '
  '0.7<i>R</i><sub>1</sub><i>C</i>.</p>',
  'V = V<sub>0</sub>(1 − e<sup>−t/RC</sup>) with a substitution attempted, V<sub>0</sub> being larger '
  'than V (1). Time to charge to 4.0 V: t<sub>2</sub> = −R<sub>1</sub>C ln(1 − 4/6); or to 2.0 V: '
  't<sub>1</sub> = −R<sub>1</sub>C ln(1 − 2/6) (1; can be t<sub>2</sub> = 1.10R<sub>1</sub>C or '
  't<sub>1</sub> = 0.41R<sub>1</sub>C). t<sub>2</sub> − t<sub>1</sub> = R<sub>1</sub>C[ln(2/3) − '
  'ln(1/3)] = R<sub>1</sub>C ln 2 = 0.69R<sub>1</sub>C, or (1.10 − 0.41)R<sub>1</sub>C = 0.69R<sub>1</sub>C '
  '(1 — 0.69R<sub>1</sub>C must be seen, from a time difference). Finding the time to charge to 2 V '
  'from a 4 V supply gains only the first mark; a solution using the discharge equation scores 0.', ''),
 ('5', '2', 4, 'calculation', CAP, 'graph', fig9(),
  '<p>The capacitor is fully discharged.</p><p>The capacitor is then charged until the potential '
  'difference (pd) across it is 4.0 V.</p><p><b>Figure 9</b> shows the variation with time of the '
  'ammeter reading as the capacitor is charged.</p><p>Show that the capacitance of the capacitor is '
  'about 1 &times; 10<sup>&minus;4</sup> F.</p>',
  'C = 1.0 × 10⁻⁴ F. Method 1 (area): an attempt at the area under the I–t graph by counting squares '
  '(1); one 1 cm square (1 s × 0.5 × 10⁻⁵ A) is a charge of 0.5 × 10⁻⁵ C (1); about 80 squares (78 to '
  '82), so Q = (3.9 to 4.1) × 10⁻⁴ C (1); C = Q/4 = a value that rounds to 1 × 10⁻⁴ F to 2 or more '
  's.f. (1). Method 2 (data points): with the capacitor at 4 V the resistor has 2 V across it at '
  'I = 2.0 × 10⁻⁵ A (or 6 V at 6.0 × 10⁻⁵ A at the start) (1), so R<sub>1</sub> = 1.0 × 10⁵ Ω (1); the '
  'charging time constant R<sub>1</sub>C = 10(.0) s, e.g. from I = I<sub>0</sub>e<sup>−t/R₁C</sup> with '
  'I = 2 × 10⁻⁵ A, I<sub>0</sub> = 6 × 10⁻⁵ A, t = 11 s (1); C = 10.0 / 1.0 × 10⁵ = 1.0 × 10⁻⁴ F (1). '
  'Estimating an average current by sight and using C = IT/V scores 1 mark at most.', ''),
 ('5', '3', 3, 'calculation', CAP, 'graph', fig10(),
  '<p>When the pd reaches 4.0 V the switch is immediately set to discharge the capacitor.</p><p>When '
  'the pd reaches 2.0 V the switch is immediately set to charge the capacitor.</p><p><b>Figure 10</b> '
  'shows how the pd across the capacitor varies with time.</p><p>Determine the value of '
  '<i>R</i><sub>2</sub>.</p><p><i>R</i><sub>2</sub> = ______ Ω</p>',
  '2.0 × 10⁵ Ω. Reading relevant discharge data from Figure 10, e.g. the time to fall to half: 4.0 V '
  'to 2.0 V in (32 − 11) s (1). A valid substitution to find R<sub>1</sub> or R<sub>Total</sub>: '
  't<sub>½</sub> = 0.69R<sub>Total</sub>C (0.7RC allowed) gives R<sub>Total</sub> = 3.0 × 10⁵ Ω; '
  'R<sub>1</sub> = 1.0 × 10⁵ Ω from Figure 9 (6.0 to 3.0 × 10⁻⁵ A in 6.8 s) or from 05.2 (1). '
  'R<sub>2</sub> = R<sub>Total</sub> − R<sub>1</sub> = 2.0 × 10⁵ Ω (1; one error carried forward allowed '
  'from R<sub>Total</sub> or R<sub>1</sub>).',
  '200000 | 2.0 × 10^5 | 2.0x10^5 | 2 × 10^5 | 2x10^5'),

 ('6', '1', 2, 'written', NUC, '', '',
  '<p>Nuclear radii can be estimated using either alpha particles or high-energy electrons.</p>'
  '<p>State <b>two</b> advantages of using high-energy electrons rather than alpha particles for this '
  'estimate.</p>',
  'Any two: electrons give greater resolution (the wavelength can be made very small); electrons can '
  'get closer to the nuclei (no electrostatic repulsion); electrons have less recoil (their mass is '
  'small compared with the nucleus); free electrons are easier to accelerate / give energy to (higher '
  'charge-to-mass ratio); electrons are easier to produce; the scattering distributions are easier to '
  'interpret / the strong nuclear interaction is not involved; alpha particles only give the distance '
  'of closest approach (an upper limit to the radius). Reverse arguments are allowed.', ''),
 ('6', '2', 2, 'drawing', NUC, 'graph', fig12(),
  '<p><b>Figure 11</b> shows a beam of electrons, each with the same high energy, incident on a target '
  'gas.</p><p>The electrons are diffracted by the nuclei in the gas.</p><p>The intensities of these '
  'diffracted electrons are measured at various angles <i>θ</i>.</p><p>The data are used to determine '
  'the nuclear radius <i>R</i> of the atoms in the gas.</p><p>[Figure 11: inside an evacuated circular '
  'chamber the electron beam passes through a tube of target gas; a detector on the rim of the chamber '
  'receives electrons scattered at an angle <i>θ</i> to the undeviated beam.]</p><p>Sketch on '
  '<b>Figure 12</b> a graph showing how the electron intensity varies with <i>θ</i>.</p>',
  'A curved line showing a decrease in intensity with increasing θ (1), with a single non-zero minimum '
  '(1). U-shaped graphs are not allowed; the initial part of the curve may be absent; a line covering '
  'less than half the θ axis scores 1 mark at most.', ''),
 ('6', '3', 2, 'proof', NUC, '', '',
  '<p>The radius <i>R</i> of a nucleus is related to its nucleon number by ' + R13 + '.</p><p>Show that '
  'this equation is consistent with the idea that all nuclei have the same density.</p>',
  'Density = mass ÷ volume = Am<sub>nucleon</sub> / (4/3 πR³) (1; M unlabelled is not accepted, lower-case '
  'm is; m<sub>n</sub> is condoned; the nucleon mass must be 1.67 × 10⁻²⁷ kg if a value is used). '
  'Substituting R = R<sub>0</sub>A<sup>1/3</sup> gives density = 3m<sub>nucleon</sub> / 4πR<sub>0</sub>³, '
  'in which all the terms are constant — the expression does not depend on A (1).', ''),
 ('6', '4', 1, 'written', NUC, '', '',
  '<p>The equation ' + R13 + ' is derived from experimental data.</p><p>Suggest <b>one</b> reason why the '
  'constant density of nuclear material derived from this equation is only approximate.</p>',
  'Any one: the mass of the nucleus is not exactly A × m<sub>nucleon</sub> (this ignores the binding '
  'energy); the volume equation assumes the nucleus is a perfect sphere, which is not true; the density '
  'equation implies the density is uniform within a nucleus, which is not true; protons have a slightly '
  'different mass from neutrons. "The density of individual nucleons can differ" is not accepted.', ''),
 ('6', '5', 3, 'calculation', NUC, '', '',
  '<p>The measured radius <i>R</i> of <sup>35</sup><sub>17</sub>Cl is 4.02 &times; 10<sup>&minus;15</sup> '
  'm.</p><p>Calculate an estimate of</p><ul><li>the constant <i>R</i><sub>0</sub></li><li>the density of '
  'nuclear material.</li></ul><p><i>R</i><sub>0</sub> = ______ m</p><p>density = ______ kg m<sup>&minus;3</sup></p>',
  'R<sub>0</sub> = 1.2(3) × 10⁻¹⁵ m and density = 2.1 × 10¹⁷ kg m⁻³. R<sub>0</sub> = R/A<sup>1/3</sup> = '
  '4.02 × 10⁻¹⁵ / 35<sup>1/3</sup> = 1.23 × 10⁻¹⁵ m (1); substitutes into the density equation, e.g. '
  '35 × 1.67 × 10⁻²⁷ / (4/3 π (4.02 × 10⁻¹⁵)³) (1); density = 2.1 × 10¹⁷ kg m⁻³ — 2.15 is accepted, '
  '2.2 is not, and a calculation must be seen (1).', ''),

 ('7', '1', 1, 'short', NUC, '', '',
  '<p>Carbon is used as the moderator in some thermal nuclear reactors.</p><p>Identify <b>one</b> other '
  'material commonly used as a moderator.</p>',
  'Heavy water (D₂O), OR beryllium, OR (normal) water (H₂O).', ''),
 ('7', '2', 2, 'written', NUC, '', '',
  '<p>State <b>two</b> benefits of slowing down the neutrons released during fission.</p>',
  'Any two: U-235 (the uranium fuel) is more likely to absorb the neutron (condoned: fission of U-236 is '
  'much more likely; absorption by U-238 is less likely); slow neutrons are less damaging / cause less '
  'fatigue to the structure of the reactor or shielding; slow neutrons spend longer in the fissionable '
  'material and increase the chance of fission; slowing the neutrons transfers heat energy to the '
  'moderator, which can make it easier to extract.', ''),
 ('7', '3', 2, 'proof', NUC + ', ' + MECH, 'graph', fig15(),
  GLIDERS + F15P + '<p>Show that when ' + MRATIO + ' is 12, <b>N</b> loses about 30% of its initial '
  'kinetic energy in the collision.</p>',
  'From Figure 15, v/u = 0.85 at a mass ratio of 12, so final KE / initial KE = ½m<sub>N</sub>v² / '
  '½m<sub>N</sub>u² = (v/u)² = 0.85² = 0.72 (72%) (1); so the proportion of kinetic energy lost is 28% '
  '(1; an error carried forward only for an arithmetic slip).', ''),
 ('7', '4', 3, 'calculation', NUC + ', ' + TH, '', '',
  '<p>In a reactor, the speed of a fast-moving neutron is reduced by a series of <i>y</i> random '
  'collisions with carbon-12 nuclei.</p><p>The final kinetic energy <i>E</i><sub>f</sub> of the neutron '
  'is</p><p><i>E</i><sub>f</sub> = <i>E</i><sub>0</sub>e<sup>&minus;<i>by</i></sup></p><p>where '
  '<i>E</i><sub>0</sub> is the initial kinetic energy of the neutron and <i>b</i> = 0.73</p><p>A thermal '
  'neutron has kinetic energy equivalent to that of the average particle of an ideal gas with a '
  'temperature of 350 K.</p><p>One neutron has an initial kinetic energy of 1.0 MeV.</p><p>Calculate the '
  'minimum value of <i>y</i> required so that this neutron becomes a thermal neutron.</p><p>y = ______</p>',
  'y = 23.(2). Final kinetic energy = (3/2)kT = 1.5 × 1.38 × 10⁻²³ × 350 = 7.2 × 10⁻²¹ J (1), and initial '
  'kinetic energy = 1.6 × 10⁻¹³ J (1) — or 0.045 eV and 1.0 × 10⁶ eV, both from the same route with '
  'consistent units. y = ln(E<sub>0</sub>/E<sub>f</sub>)/b = ln(1.0 × 10⁶ / 0.045)/0.73 = 23.2 (1). The '
  'answer 24 is condoned provided it is given as an integer.',
  '23.15 to 23.25 | 24'),
 ('7', '5', 2, 'explain', NUC + ', ' + MECH, 'graph', fig15(),
  F15P + '<p>Explain, with reference to <b>Figure 15</b>, why elements with a small nucleon number are '
  'preferred as moderator materials.</p>',
  'The model (Figure 15) shows that a low nucleon number (and so a low mass) gives a greater change / '
  'reduction in the speed or kinetic energy of the neutron in a collision (1); so fewer collisions are '
  'needed, and the moderator can be thinner (1). Nuclear mass is condoned for mass number.', ''),
]

MCQ = [
 ('8', 'C', TH, '', '',
  '<p>A 1000 W heater is 75% efficient. The heater is used to increase the temperature of some water '
  'from 10 °C to 85 °C in 7 hours.</p><p>What mass of water is heated?</p><p>specific heat capacity of '
  'water = 4200 J kg<sup>&minus;1</sup> K<sup>&minus;1</sup></p>',
  ['1.0 kg', '13 kg', '60 kg', '110 kg'], '60 kg'),
 ('9', 'C', TH, '', '', '<p>Which can lead to a value for the absolute zero of temperature?</p>',
  ['Boyle’s law', 'Brownian motion', 'Charles’s law', 'Rutherford scattering'], 'Charles’s law'),
 ('10', 'C', EM + ', ' + GR, '', '',
  '<p>Two protons are separated by a distance of 1 &times; 10<sup>&minus;9</sup> m.</p><p>Which is an '
  'estimate of <sup>electric repulsion force</sup>&frasl;<sub>gravitational attraction force</sub> for '
  'these two protons?</p>',
  ['10<sup>18</sup>', '10<sup>28</sup>', '10<sup>36</sup>', '10<sup>45</sup>'], '10³⁶'),
 ('11', 'B', GR, '', '',
  '<p>Data are collected for the mass <i>M</i>, radius <i>R</i> and escape velocity <i>u</i> for each '
  'planet in the Solar System.</p><p>The data show that <i>u</i> is directly proportional to</p>',
  ['(<i>M</i>/<i>R</i>)<sup>&minus;1/2</sup>', '(<i>M</i>/<i>R</i>)<sup>1/2</sup>',
   '<i>M</i>/<i>R</i>', '(<i>M</i>/<i>R</i>)<sup>2</sup>'], '(M/R)^½'),
 ('12', 'B', GR + ', Circular & Periodic Motion', '', '',
  '<p>A satellite is in a circular orbit at a height <i>h</i> above the surface of a planet of mass '
  '<i>M</i> and radius <i>R</i>.</p><p>What is the linear speed of the satellite?</p>',
  ['√(<i>GM</i>) / (<i>R</i> + <i>h</i>)', '√(<i>GM</i> / (<i>R</i> + <i>h</i>))',
   '<i>GM</i> / √(<i>R</i> + <i>h</i>)', '<i>GM</i> / (<i>R</i> + <i>h</i>)'], '√(GM/(R + h))'),
 ('13', 'D', GR, '', '',
  '<p>Which statement is <b>not</b> true for a satellite in a geostationary orbit?</p>',
  ['The satellite orbits in the plane of the Earth’s equator.',
   'The satellite has the same angular velocity as a point on the Earth’s surface.',
   'The satellite takes 24 hours to orbit the Earth.',
   'Signals from the satellite can be sent to any point on the Earth’s surface during one orbit.'],
  'Signals from the satellite can be sent to any point on the Earth’s surface during one orbit'),
 ('14', 'C', EM, 'diagram', fig14(),
  '<p>Six metal spheres, each carrying a charge of magnitude <i>Q</i>, are equally spaced around a '
  'circle of diameter <i>d</i>.</p><p>What is the magnitude of the field strength at the centre of the '
  'circle?</p>',
  ['0', '<sup><i>Q</i></sup>&frasl;<sub>π<i>ε</i><sub>0</sub><i>d</i><sup>2</sup></sub>',
   '<sup>2<i>Q</i></sup>&frasl;<sub>π<i>ε</i><sub>0</sub><i>d</i><sup>2</sup></sub>',
   '<sup>4<i>Q</i></sup>&frasl;<sub>π<i>ε</i><sub>0</sub><i>d</i><sup>2</sup></sub>'], '2Q/(πε₀d²)'),
 ('15', 'A', EM, '', '',
  '<p>Two point charges are separated by a distance of 200 mm.</p><p>The force of attraction between '
  'them is 180 µN.</p><p>The distance between the point charges is increased by 400 mm.</p><p>What is '
  'the new force of attraction?</p>', ['20 µN', '45 µN', '60 µN', '90 µN'], '20 µN'),
 ('16', 'A', EM, 'diagram', fig16(),
  '<p>The diagram shows the path of an electron in a uniform electric field.</p><p>The electron moves '
  'in a vertical plane.</p><p>The direction of the electric field is</p>',
  ['vertically down the plane.', 'vertically up the plane.', 'horizontally into the plane.',
   'horizontally out of the plane.'], 'vertically down the plane'),
 ('17', 'C', EM, 'graph', fig17(),
  '<p>The graph shows the variation of electric field strength <i>E</i> surrounding a charged sphere of '
  'radius <i>R</i>. The distance from the centre of the sphere is <i>r</i>.</p><p>The total area under '
  'the curve from <i>R</i> to infinity is</p>',
  ['the capacitance of the sphere.', 'the charge held on the sphere.',
   'the electric potential of the sphere.', 'the energy needed to remove an electron from the sphere.'],
  'the electric potential of the sphere'),
 ('18', 'A', EM, 'diagram', '',
  '<p>A polar molecule is in an external electric field.</p><p>Which diagram shows the orientation of '
  'the polar molecule?</p><p>[Each diagram shows the same four vertical field lines, with arrows '
  'pointing downwards, and a polar molecule drawn as an oval with a + end and a &minus; end.]</p>',
  ['the molecule lies along the field lines, &minus; end at the top and + end at the bottom',
   'the molecule lies across the field lines, + end on the left and &minus; end on the right',
   'the molecule lies along the field lines, + end at the top and &minus; end at the bottom',
   'the molecule lies across the field lines, &minus; end on the left and + end on the right'],
  'the diagram with the molecule along the field, − end at the top and + end at the bottom'),
 ('19', 'C', EM + ', ' + PR, '', '',
  '<p>An alpha particle is moving towards a stationary gold nucleus. The alpha particle has a kinetic '
  'energy of 9.0 &times; 10<sup>&minus;13</sup> J when it is a large distance from the gold nucleus.</p>'
  '<p>The gold nucleus contains 79 protons.</p><p>What is the closest possible distance of approach of '
  'the alpha particle to the gold nucleus?</p>',
  ['2.5 &times; 10<sup>&minus;16</sup> m', '2.0 &times; 10<sup>&minus;14</sup> m',
   '4.0 &times; 10<sup>&minus;14</sup> m', '2.0 &times; 10<sup>&minus;7</sup> m'], '4.0 × 10⁻¹⁴ m'),
 ('20', 'B', EM, '', '',
  '<p>A wire is at right angles to a uniform magnetic field and carries an electric current.</p><p>The '
  'wire is 150 mm in length.</p><p>When the current in the wire is increased by 4.0 A, the force acting '
  'on the wire increases by 3.6 &times; 10<sup>&minus;3</sup> N.</p><p>What is the magnetic flux density '
  'of the field?</p>',
  ['6.0 &times; 10<sup>&minus;6</sup> T', '6.0 &times; 10<sup>&minus;3</sup> T',
   '1.7 &times; 10<sup>2</sup> T', '1.7 &times; 10<sup>5</sup> T'], '6.0 × 10⁻³ T'),
 ('21', 'B', EM, '', '',
  '<p>A beam consists of ionised atoms of two isotopes of an element.</p><p>When the beam enters a '
  'uniform magnetic field, the ions move in circular paths.</p><p>The ions have the same charge and '
  'travel at the same speed when they enter the magnetic field.</p><p>Which statement is true?</p>',
  ['The force acting on an ion is different for each isotope.',
   'The radius of the path followed by an ion is different for each isotope.',
   'The kinetic energy of an ion increases for both isotopes.',
   'The acceleration of an ion is the same for both isotopes.'],
  'The radius of the path followed by an ion is different for each isotope'),
 ('22', 'A', EM, 'graph', fig22(),
  '<p>The magnetic flux <i>ϕ</i> in a coil varies with time <i>t</i> as shown.</p><p>Which graph shows '
  'how the emf <i>ε</i> induced in the coil varies with <i>t</i>?</p><p>[Each option is a graph of '
  '<i>ε</i> against <i>t</i>, with <i>t</i><sub>1</sub> to <i>t</i><sub>4</sub> marked as on the flux '
  'graph.]</p>',
  ['a tall positive rectangular pulse from <i>t</i><sub>1</sub> to <i>t</i><sub>2</sub>, zero from '
   '<i>t</i><sub>2</sub> to <i>t</i><sub>3</sub>, then a shorter negative rectangular pulse from '
   '<i>t</i><sub>3</sub> to <i>t</i><sub>4</sub>',
   'a tall positive rectangular pulse from <i>t</i><sub>1</sub> to <i>t</i><sub>2</sub>, zero from '
   '<i>t</i><sub>2</sub> to <i>t</i><sub>3</sub>, then a shorter positive rectangular pulse from '
   '<i>t</i><sub>3</sub> to <i>t</i><sub>4</sub>',
   'a tall positive triangular spike between <i>t</i><sub>1</sub> and <i>t</i><sub>2</sub>, zero from '
   '<i>t</i><sub>2</sub> to <i>t</i><sub>3</sub>, then a shorter negative triangular dip between '
   '<i>t</i><sub>3</sub> and <i>t</i><sub>4</sub>',
   'a tall positive triangular spike between <i>t</i><sub>1</sub> and <i>t</i><sub>2</sub>, zero from '
   '<i>t</i><sub>2</sub> to <i>t</i><sub>3</sub>, then a shorter positive triangular spike between '
   '<i>t</i><sub>3</sub> and <i>t</i><sub>4</sub>'],
  'the graph with a tall positive rectangular pulse from t₁ to t₂ and a shorter negative one from t₃ to t₄'),
 ('23', 'D', EM, '', '',
  '<p>The distance between the wing tips of a metal aircraft is 30 m.</p><p>The aircraft flies '
  'horizontally at a steady speed of 100 m s<sup>&minus;1</sup>.</p><p>The aircraft passes through a '
  'vertical magnetic field of flux density 2.0 &times; 10<sup>&minus;7</sup> T.</p><p>What is the emf '
  'induced between its wing tips?</p>', ['0.2 µV', '20 µV', '300 µV', '600 µV'], '600 µV'),
 ('24', 'D', EM, '', '',
  '<p>A circular coil with a radius of 0.10 m has 200 turns.</p><p>The coil rotates at 50 revolutions per '
  'second about an axis which is perpendicular to a uniform magnetic field and in the plane of the '
  'coil.</p><p>The magnetic flux density of the field is 0.20 T.</p><p>What is the maximum emf induced in '
  'the coil?</p>', ['63 V', '126 V', '195 V', '395 V'], '395 V'),
 ('25', 'D', NUC, '', '',
  '<p>After radioactive waste is removed from a cooling pond, it is often stored in underground caves.</p>'
  '<p>This is to protect workers from the effects of</p>',
  ['alpha particles from nuclides with a large decay constant.',
   'alpha particles from nuclides with a small decay constant.',
   'gamma radiation from nuclides with a large decay constant.',
   'gamma radiation from nuclides with a small decay constant.'],
  'gamma radiation from nuclides with a small decay constant'),
 ('26', 'C', NUC, '', '',
  '<p>Alpha particle scattering can be demonstrated using a thin gold foil.</p><p>Which statement about '
  'this demonstration is <b>not</b> true?</p>',
  ['The foil is thin enough to assume that alpha particles are deflected only once.',
   'Nuclei are more massive than alpha particles which allows the alpha particles to be deflected by '
   'more than 90°.',
   'The number of alpha particles deflected backwards is greater than the number that pass straight '
   'through the foil.',
   'Deflections of alpha particles by electrons in the foil are much smaller than deflections due to '
   'nuclei.'],
  'The number of alpha particles deflected backwards is greater than the number that pass straight through the foil'),
 ('27', 'C', EM + ', Electric Circuits', '', '',
  '<p>A transformer for use in a 230 V ac supply is 90% efficient.</p><p>The transformer provides a '
  'current of 3.00 A at 12.0 V.</p><p>What is the current in the primary coil?</p>',
  ['0.141 A', '0.156 A', '0.174 A', '5.75 A'], '0.174 A'),
 ('28', 'A', NUC, '', '',
  '<p>The random nature of radioactive decay means that it is never possible to predict</p>',
  ['when a particular nucleus will decay.', 'whether a β<sup>&minus;</sup> particle or a β<sup>+</sup> '
   'particle is emitted.', 'the approximate time taken for the activity to decrease to a specified value.',
   'the approximate thickness of an absorber needed to reduce the count rate to a specified value.'],
  'when a particular nucleus will decay'),
 ('29', 'B', NUC, '', '',
  '<p>Radiation is used to measure the thickness of an aluminium sheet accurately.</p><p>The thickness '
  'of the sheet is about 0.5 mm.</p><p>Which type of radiation is most appropriate for the measurement?</p>',
  ['α', 'β<sup>&minus;</sup>', 'β<sup>+</sup>', 'γ'], 'β⁻'),
 ('30', 'C', NUC, '', '',
  '<p>Tritium is a radioactive nuclide used in ‘Exit’ signs.</p><p>When a sign was manufactured the '
  'activity of the tritium in it was 37 MBq.</p><p>After 10 years the tritium in the sign has an '
  'activity of 21 MBq.</p><p>What will the activity be 15 years after it was manufactured?</p>',
  ['12 MBq', '13 MBq', '16 MBq', '17 MBq'], '16 MBq'),
 ('31', 'B', NUC, '', '',
  '<p>The mass of fuel in a nuclear reactor decreases at a rate of 4.0 &times; 10<sup>&minus;6</sup> kg '
  'per hour.</p><p>What is the rate at which energy is transferred due to nuclear fission?</p>',
  ['4.0 &times; 10<sup>7</sup> W', '1.0 &times; 10<sup>8</sup> W', '6.0 &times; 10<sup>8</sup> W',
   '3.6 &times; 10<sup>10</sup> W'], '1.0 × 10⁸ W'),
 ('32', 'D', NUC, 'graph', fig32(),
  '<p>The graph shows the variation of activity with time for a sample of a nuclide <b>X</b>.</p><p>What '
  'was the initial number of nuclei of <b>X</b> in the sample?</p>',
  ['4.67 &times; 10<sup>5</sup>', '3.0 &times; 10<sup>8</sup>', '4.2 &times; 10<sup>8</sup>',
   '6.1 &times; 10<sup>8</sup>'], '6.1 × 10⁸'),
]

PRE = {
 '1': (TH, fig1(),
       '<p><b>Figure 1</b> shows a single gas particle <b>P</b> of an ideal gas inside a hollow cube.</p>'
       '<p>The cube has side length <i>l</i> and volume <i>V</i>.</p><p><b>P</b> has mass <i>m</i> and is '
       'travelling at a velocity <i>c</i> perpendicular to side <b>W</b>.</p>'),
 '2': (TH, fig2(),
       '<p><b>Figure 2</b> shows a wheel used in motorsport. A rubber tyre is fitted around a '
       'cylindrical metal rim. The tyre is filled with a gas.</p><p>The dimensions shown in <b>Figure 2</b> '
       'are for the volume of the gas in the tyre.</p><p>Assume that this volume remains constant '
       'throughout this question.</p>'),
 '4': (EM, fig5(),
       '<p><b>Figure 4</b> shows a spark detector used to detect alpha particles.</p><p>[Figure 4: an alpha '
       'source held above a flat metal mesh, with a wire stretched beneath the mesh; the mesh is '
       'connected to 0 V and the wire to 4000 V.]</p><p>The detector consists of a metal mesh placed '
       '5.0 mm above a wire.</p><p>A potential difference of 4000 V is applied between the mesh and the '
       'wire.</p><p>Molecules in the air between the mesh and the wire are ionised by an alpha particle '
       'and a spark is produced.</p><p><b>Figure 5</b> shows equipotentials between the mesh and the '
       'wire.</p>'),
 '5': (CAP, fig8(),
       '<p><b>Figure 8</b> shows a circuit used to investigate the charge and discharge of a capacitor of '
       'capacitance <i>C</i> using resistors of resistances <i>R</i><sub>1</sub> and <i>R</i><sub>2</sub>.'
       '</p><p>The battery has an emf of 6.0 V and negligible internal resistance.</p>'),
}

# ---- the paper's own totals ----
PER_QUESTION = {'1': 5, '2': 7, '3': 10, '4': 8, '5': 10, '6': 10, '7': 10}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 60, 'Section A is 60 marks'
assert [m[0] for m in MCQ] == [str(n) for n in range(8, 33)] and len(MCQ) == 25   # Section B: 25
assert all(len(m[6]) == 4 and m[1] in 'ABCD' for m in MCQ)
KEY = 'CCCBBDCAACACBBADDDCCABCBD'      # the scheme's key column, 08 to 32, as printed
assert ''.join(m[1] for m in MCQ) == KEY

# ---- every intermediate the scheme prints, recomputed ----
G, k, e, me, mp, NA = 6.67e-11, 8.99e9, 1.60e-19, 9.11e-31, 1.67e-27, 6.02e23
V1 = math.pi * 0.370 * 0.660 ** 2 / 4; V2 = math.pi * 0.370 * 0.330 ** 2 / 4       # 02.1
assert round(V1, 4) == 0.1266 or round(V1, 4) == 0.1265
assert round(V2, 4) == 0.0316 and round(V1 - V2, 4) == 0.0949
n1 = 1.01e5 * 0.0949 / (8.31 * 373); n2 = 2.11e5 * 0.0949 / (8.31 * 373)
assert round(n1, 2) == 3.09 and round(n2, 2) == 6.46 and round(n2 - n1, 2) == 3.37
assert round(14.991 - 14.897, 3) == 0.094 and round(0.094 / 3.37, 3) == 0.028
gS = G * 1.99e30 / 1.50e11 ** 2                                                    # 03.3
assert round(gS, 5) == 0.00590 and round(gS / 9.81, 6) in (0.000601, 0.000602)
dEk = 0.5 * ((1.3e3) ** 2 - (1.1e3) ** 2)                                           # 03.5
assert round(dEk) == 240000 and round(4.9e4 * dEk / 1e10, 2) == 1.18
inv = 1 / 0.17e6 - 1 / 6.0e6
assert round(inv / 1e-6, 2) == 5.72
MX = dEk / (G * inv)
assert round(MX / 1e20, 1) == 6.3
assert round(4.9e4 * 9.81 / 1e5, 1) == 4.8 and abs(F3[0][1] - 4.81) < 0.1           # Fig 3 intercept = probe weight
assert round(math.sqrt(6.64e-26 / 9.11e-31)) == 270                                  # 04.2
# 04.4 — the scheme's readings, off the measured Figure 7
assert abs(interp(F7, 1.34) - 4.0) < 0.1 and round(4 * 1.34 ** 2, 2) == 7.18
def cross(pts, v):          # where a falling measured curve crosses the value v
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        if y1 >= v > y2:
            return x1 + (x2 - x1) * (y1 - v) / (y1 - y2)
h5, h25 = cross(F7, 5.0), cross(F7, 2.5)
assert abs((h5 - 1.0) - 0.25) < 0.02 and abs((h25 - h5) - 0.31) < 0.03
# 05.1 — the charging time from 2 V to 4 V on a 6 V supply
t2, t1 = -math.log(1 - 4 / 6), -math.log(1 - 2 / 6)
assert round(t2, 2) == 1.10 and round(t1, 2) == 0.41 and round(t2 - t1, 2) == 0.69 == round(math.log(2), 2)
# 05.2 — the area under the measured Figure 9 is the scheme's 80 squares of 0.5 × 10⁻⁵ C
pts = [(0, 6.0)] + F9
area = sum((x2 - x1) * (y1 + y2) / 2 for (x1, y1), (x2, y2) in zip(pts, pts[1:])) * 1e-5
assert 3.9e-4 <= area <= 4.1e-4 and 78 <= area / 0.5e-5 <= 82
R1 = 6.0 / 6.0e-5; RC = 11 / math.log(6 / 2)
assert R1 == 1.0e5 and round(RC, 1) == 10.0 and round(RC / R1 / 1e-4, 1) == 1.0
assert round(4.0e-4 / 4.0, 6) == 1.0e-4
# 05.3 — off the measured Figure 10: 4.0 V at 11 s, 2.0 V at 32 s
assert abs(interp(F10, 11.0) - 4.0) < 0.02 and abs(interp(F10, 32.0) - 2.0) < 0.02
RT = (32 - 11) / (0.69 * 1e-4)
assert round(RT / 1e5, 1) == 3.0 and round((RT - R1) / 1e5, 1) == 2.0
assert round(-10 * math.log(3 / 6), 1) == 6.9                                        # 6.0 → 3.0 in ≈ 6.8 s
R0 = 4.02e-15 / 35 ** (1 / 3)                                                        # 06.5
rho = 35 * 1.67e-27 / (4 / 3 * math.pi * (4.02e-15) ** 3)
assert round(R0 / 1e-15, 2) == 1.23 and round(rho / 1e17, 2) == 2.15
assert abs(interp(F15, 12) - 0.85) < 0.01 and round(0.85 ** 2, 2) == 0.72             # 07.3
Ef = 1.5 * 1.38e-23 * 350                                                             # 07.4
assert round(Ef / 1e-21, 3) == 7.245 and round(Ef / 1.60e-19, 3) == 0.045
assert round(math.log(1.6e-13 / Ef) / 0.73, 1) == 23.2 and round(math.log(1.0e6 / 0.045) / 0.73, 1) == 23.2
# ---- Section B, the arithmetic behind every numerical key ----
assert round(1000 * 0.75 * 7 * 3600 / (4200 * 75)) == 60                             # 08 C
assert round(math.log10(k * e ** 2 / (G * mp ** 2))) == 36                           # 10 C
assert round(180 * (200 / 600) ** 2) == 20                                           # 15 A
assert round(k * 79 * 2 * e ** 2 / 9.0e-13 / 1e-14, 1) == 4.0                        # 19 C
assert round(3.6e-3 / (4.0 * 0.150), 4) == 0.006                                     # 20 B
assert round(2.0e-7 * 30 * 100 * 1e6) == 600                                         # 23 D
assert round(0.20 * math.pi * 0.10 ** 2 * 200 * 2 * math.pi * 50) == 395            # 24 D
assert round(12.0 * 3.00 / (0.9 * 230), 3) == 0.174                                  # 27 C
assert round(37 * (21 / 37) ** 1.5) == 16                                            # 30 C
assert round(4.0e-6 / 3600 * (3.0e8) ** 2 / 1e8, 1) == 1.0                           # 31 B
# 32 — the half-life read off the measured graph, 14.0 → 7.0 MBq
th = cross(F32, 7.0)
assert 29 <= th <= 31 and round(14.0e6 * th / math.log(2) / 1e8, 1) in (5.9, 6.0, 6.1, 6.2)
assert round(14.0e6 * 30 / math.log(2) / 1e8, 1) == 6.1                              # 32 D
# 14 — the ±Q pairs: the two +Q/+Q and −Q/−Q diameters cancel, the +Q/−Q one doubles
assert abs(2 * k * 1 / (0.5) ** 2 - 2 / (math.pi * 8.854e-12 * 1)) / (2 * k * 1 / 0.25) < 1e-2
d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() == 4 and (d.year, d.month, d.day) == (2023, 6, 9)                 # cover: Friday

ROWS = [dict(DOC, row_id='D-' + PAPER, kind='document', total_marks='85',
             needs='Calculator, Ruler, Protractor, Equation booklet',
             source_url='https://drive.google.com/file/d/%s/view' % QP)]

def row(**kw):
    r = dict(DOC); r.update(kw); return r

qs = [(q, p, m, a, t, f, dg, h, ans, acc) for q, p, m, a, t, f, dg, h, ans, acc in Q]
for q, part, marks, atype, topics, figure, diagram, html, answer, accept in qs:
    if part == '1' and q in PRE:
        t, dg, h = PRE[q]
        ROWS.append(row(row_id='Q-AQA-7408-2306-2-%02d' % int(q), kind='preamble', question=q,
                        section='A', html=h, topics=t, figure='diagram', diagram=dg,
                        diagram_by='family'))
    ROWS.append(row(row_id='Q-AQA-7408-2306-2-%02d%s' % (int(q), part), kind='question',
                    question=q, part=part, section='A', marks=str(marks), html=html, answer=answer,
                    answer_type=atype, topics=topics, figure=figure, diagram=diagram,
                    diagram_by=('family' if diagram else ''), placeholder='', accept=accept))
for q, key, topics, figure, diagram, stem, opts, said in MCQ:
    i = 'ABCD'.index(key)
    ROWS.append(row(row_id='Q-AQA-7408-2306-2-%02d' % int(q), kind='question', question=q, part='',
                    section='B', marks='1', html=mc(stem, opts),
                    answer='%s — %s.' % (key, said.rstrip('.')), answer_type='short', topics=topics,
                    figure=figure, diagram=diagram, diagram_by=('family' if diagram else ''),
                    placeholder='', accept=key))
