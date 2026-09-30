"""AQA A-level Physics 7408/3A — Paper 3 Section A — June 2023.

Every answer is READ OFF AQA's own scheme, `Mark scheme (A-level) _ Paper 3 Section A - June 2023`
(its cover says 7408/3A, Paper 3 Section A, June 2023, Version 1.0 Final; its values — 4.5 × 10⁻²
in 01.1, n = 17 and u0 = 0.14 in 01.4, P = 6.82 and 17.0 in 02.4, 0.43 mT in 03.7 — are this
paper's). The 2017 Highers are why that is the rule and not a preference.

The cover says 45 marks and the Question-mark boxes say 13, 16 and 16. Both are asserted below, and
so is every intermediate the scheme prints inside its own working.

EVERY FIGURE IN THIS PDF IS A RASTER IMAGE with no text layer and no vectors, so the four that
carry data were measured in pixels, never eyeballed:
  * Figure 1 (01.2, 01.4) — 72 white balls on a grey field. Each ball located as a connected
    light blob (34 px across); later balls are drawn over earlier ones, so a centre is taken from
    the unclipped left edge. The floor is the dark band at y = 1268 px. The scheme's own check
    holds: the n = 0 ball's bottom is 1163 px above the floor = H = 1550 mm, and n = 5 comes out
    at h ≈ 1397 mm against the scheme's 1393 — and the first ball on the floor is n = 17.
  * Figure 3 (01.5, 01.6) — 27 crosses. Gridlines found by their spacing (s 2000 mm at px 284,
    3400 at 1937.5; h 0 at px 1450, 600 at 32); each cross a 22-px dark blob.
  * Figure 4 (02) — 18 crosses the same way (V 0 at px 204.5, 12 V at 1792; I 0.2 A at 2409,
    2.0 A at 27). The five Table 2 rows land on printed values, and the table's own numbers are
    used for those five crosses.
  * Figure 11 (03.4, 03.5) — two smooth curves. They are the on-axis field of a single loop,
    B = B0 / (1 + (x − x0)² / r²)^1.5, with B0 = 0.665 mT and r = 68 mm read off the peaks; the
    formula was checked against the dark pixels of both curves at thirteen x values and agrees
    to within 0.002 mT over most of the range and 0.006 mT at worst (the dashed curve near
    x = 100 mm), so the curves are drawn from it (asserted below).
Figure 6 (02.5) is the paper's blank grid, drawn so the pen can go on it. Figure 1's photograph,
Figures 2, 5, 7a/7b, 8, 9 and 10 are apparatus; they carry `figure` and what they show is said in
prose without giving an answer away.
"""
import datetime, math, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from svgplot import W

PAPER = 'P-AQA-7408-2306-3A'
QP = '1fUqavCzFk-WojECEc15uaCffREb_qLY_'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS5', band_type='stage',
           band_value='A-Level', level='Alevel', company='AQA', exam_board='AQA',
           spec_code='7408/3A', exam_wave='First wave', year='2023', month='6', paper='3',
           exam_date='2023-06-15', document_type='Past paper',
           name='Paper 3 Section A — June 2023', active='True',
           trackable='True', printable='False')

MEAS = 'Measurements & Their Errors'
MECH = 'Mechanics & Materials'
CIRC = 'Electric Circuits'
FIELD = 'Electric & Magnetic Fields'


def graph(xmin, xmax, xstep, ymin, ymax, ystep, xlab, ylab, label, extra='',
          xminor=None, yminor=None, height=220, ynums=True, xfmt='%g', yfmt='%g'):
    """A grid whose axes need not start at 0 — `svgplot.axes()` is 0-based, and Figure 3 starts at
    2000 mm and Figure 11 at −20 mm. Same classes, same inline text-anchor (see axes())."""
    L, R, T = 52, 326, 14
    B = T + height
    xminor = xminor or xstep / 5.0
    yminor = yminor or ystep / 5.0
    sx = lambda v: L + (R - L) * (v - xmin) / (xmax - xmin)
    sy = lambda v: B - (B - T) * (v - ymin) / (ymax - ymin)
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s">' % (W, B + 48, label)]
    for i in range(int(round((xmax - xmin) / xminor)) + 1):
        x = sx(xmin + i * xminor)
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>' % (x, T, x, B))
    for i in range(int(round((ymax - ymin) / yminor)) + 1):
        y = sy(ymin + i * yminor)
        p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"/>' % (L, y, R, y))
    for i in range(int(round((xmax - xmin) / xstep)) + 1):
        x = sx(xmin + i * xstep)
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="currentColor" '
                 'stroke-width=".6" opacity=".5"/>' % (x, T, x, B))
        p.append('<text x="%.1f" y="%d" class="num">%s</text>'
                 % (x, B + 15, (xfmt % (xmin + i * xstep)).replace('-', '−')))
    for i in range(int(round((ymax - ymin) / ystep)) + 1):
        y = sy(ymin + i * ystep)
        p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="currentColor" '
                 'stroke-width=".6" opacity=".5"/>' % (L, y, R, y))
        if ynums:
            p.append('<text x="%d" y="%.1f" class="num" style="text-anchor:end">%s</text>'
                     % (L - 5, y + 4, yfmt % (ymin + i * ystep)))
        else:
            p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="axis"/>' % (L - 4, y, L, y))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    p.append(extra(sx, sy) if callable(extra) else extra)
    p.append('<text x="%.1f" y="%d" class="ax" style="text-anchor:middle">%s</text>'
             % ((L + R) / 2, B + 36, xlab))
    if ylab:
        p.append('<text x="12" y="%d" class="ax" style="text-anchor:middle" '
                 'transform="rotate(-90 12 %d)">%s</text>' % ((T + B) / 2, (T + B) / 2, ylab))
    return ''.join(p) + '</svg>'


def crosses(points, sx, sy):
    out = []
    for x, y in points:
        cx, cy = sx(x), sy(y)
        out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                   % (cx - 3, cy - 3, cx + 3, cy + 3))
        out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                   % (cx - 3, cy + 3, cx + 3, cy - 3))
    return ''.join(out)

# ---------------------------------------------------------------------------------------------
# FIGURE 1 — the stroboscope photograph. Ball left edges and vertical extents in image pixels.
# ---------------------------------------------------------------------------------------------
FIG1_PX = [(88, 72, 105), (101, 79, 112), (117, 94, 127), (133, 117, 150), (149, 147, 180),
           (163, 186, 220), (180, 233, 266), (196, 286, 319), (212, 348, 382), (227, 417, 450),
           (242, 493, 527), (258, 577, 610), (274, 668, 701), (289, 766, 799), (305, 874, 907),
           (321, 988, 1021), (337, 1108, 1141), (353, 1233, 1266), (369, 1140, 1173),
           (384, 1048, 1082), (402, 972, 1005), (416, 899, 932), (432, 834, 867),
           (449, 778, 811), (465, 729, 762), (480, 689, 722), (498, 655, 688), (514, 628, 661),
           (530, 610, 642), (544, 598, 631), (559, 596, 629), (576, 599, 632), (591, 611, 644),
           (608, 632, 665), (625, 659, 692), (641, 695, 728), (657, 736, 769), (673, 785, 818),
           (690, 845, 878), (705, 911, 944), (721, 983, 1016), (737, 1065, 1098),
           (753, 1153, 1186), (769, 1230, 1263), (785, 1156, 1190), (801, 1090, 1123),
           (817, 1039, 1073), (832, 991, 1024), (848, 949, 982), (865, 919, 952),
           (880, 896, 929), (895, 878, 911), (911, 869, 902), (927, 869, 902), (943, 876, 909),
           (959, 891, 924), (976, 915, 948), (991, 943, 976), (1008, 982, 1016),
           (1024, 1028, 1061), (1039, 1081, 1114), (1055, 1142, 1175), (1072, 1212, 1245),
           (1086, 1208, 1241), (1103, 1156, 1189), (1119, 1114, 1147), (1136, 1079, 1112),
           (1151, 1053, 1086), (1165, 1036, 1070)]
FLOOR_PX = 1268
MM_PER_PX = 1550.0 / (FLOOR_PX - FIG1_PX[0][2])       # H = 1550 mm is the n = 0 ball's bottom


def fig1():
    s = 290.0 / 1205
    X = lambda px: 25 + px * s
    Y = lambda py: 10 + (py - 50) * s
    o = ['<svg viewBox="0 0 %d %d" role="img" aria-label="Stroboscopic photograph of a bouncing '
         'ball: 72 images of the ball, falling to the floor and then making two smaller bounces '
         'to the right">' % (W, int(Y(FLOOR_PX) + 34))]
    o.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" stroke="currentColor" '
             'stroke-width=".8" opacity=".5"/>' % (X(0), Y(50), 1205 * s, Y(FLOOR_PX) - Y(50)))
    for x1, y1, y2 in FIG1_PX:
        o.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="currentColor" fill-opacity=".85"/>'
                 % (X(x1 + 16.5), Y((y1 + y2) / 2.0), 16 * s))
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="3"/>'
             % (X(0), Y(FLOOR_PX) + 1, X(1205), Y(FLOOR_PX) + 1))
    o.append('<text x="%.1f" y="%.1f" class="lbl">floor</text>' % (X(0), Y(FLOOR_PX) + 20))
    return ''.join(o) + '</svg>'

# ---------------------------------------------------------------------------------------------
# FIGURE 3 — h against s for n = 40 to 66, measured (mm).
# ---------------------------------------------------------------------------------------------
FIG3 = [(2046.6, 345.7), (2096.5, 237.2), (2148.6, 120.2), (2199.8, 20.1), (2249.8, 115.3),
        (2299.7, 203.1), (2351.0, 271.4), (2404.7, 336.2), (2454.7, 387.8), (2506.3, 430.1),
        (2557.5, 460.2), (2608.3, 484.3), (2660.0, 494.9), (2709.5, 495.1), (2763.7, 484.3),
        (2811.6, 464.4), (2865.7, 433.5), (2914.8, 395.2), (2968.6, 344.4), (3016.4, 284.6),
        (3066.4, 215.2), (3119.7, 135.2), (3169.7, 42.5), (3219.7, 50.1), (3271.3, 117.4),
        (3324.6, 170.3), (3374.2, 216.6)]


def fig3():
    def extra(sx, sy):
        o = crosses(FIG3, sx, sy)
        for (x, y), lab, dx in ((FIG3[0], 'n = 40', 26), (FIG3[-1], 'n = 66', -30)):
            o += ('<text x="%.1f" y="%.1f" class="lbl" style="text-anchor:middle">%s</text>'
                  % (sx(x) + dx, sy(y) - 12, lab))
        return o
    return graph(2000, 3400, 200, 0, 600, 100, 's / mm', 'h / mm',
                 'Graph of h against s for images n = 40 to n = 66, showing the second and third '
                 'contacts with the floor', extra, xminor=20, yminor=10, height=190)

# ---------------------------------------------------------------------------------------------
# FIGURE 4 — I against V for lamp L, measured; the five Table 2 rows take the table's values.
# ---------------------------------------------------------------------------------------------
FIG4 = [(0.745, 0.361), (1.459, 0.641), (2.06, 0.811), (2.683, 0.95), (3.30, 1.07),
        (3.927, 1.16), (4.524, 1.241), (5.17, 1.32), (5.798, 1.39), (6.429, 1.451), (7.06, 1.52),
        (7.69, 1.59), (8.33, 1.65), (8.901, 1.71), (9.58, 1.773), (10.197, 1.833),
        (10.859, 1.89), (11.47, 1.94)]


def fig4():
    return graph(0, 12, 2, 0.2, 2.0, 0.2, 'V / V', 'I / A',
                 'Graph of current I against voltage V for filament lamp L: eighteen points',
                 lambda sx, sy: crosses(FIG4, sx, sy), xminor=0.2, yminor=0.02, height=250,
                 yfmt='%.1f')


def fig6():
    return graph(2, 12, 2, 0, 6, 1, 'V / V', '',
                 'Blank grid for plotting P against V: V from 2 to 12 V, vertical axis not '
                 'labelled or scaled', xminor=0.2, yminor=0.1, height=240, ynums=False)

# ---------------------------------------------------------------------------------------------
# FIGURE 11 — BH against x for experiments 1 and 2, from the single-loop formula (see note).
# ---------------------------------------------------------------------------------------------
B0, R_MM = 0.665, 68.0
bh = lambda x, c: B0 / (1 + ((x - c) / R_MM) ** 2) ** 1.5
# spot values read off the dark pixels of the printed curves (x mm, exp 1, exp 2)
FIG11_READ = [(-18, 0.602, 0.158), (0, 0.665, 0.237), (20, 0.589, 0.363), (40, 0.424, 0.526),
              (60, 0.282, 0.652), (80, 0.182, 0.636), (98, 0.123, 0.514)]


def fig11():
    def extra(sx, sy):
        o = []
        for c, dash in ((0, ''), (R_MM, ' stroke-dasharray="4 3"')):
            pts = ' '.join('%.1f,%.1f' % (sx(x), sy(bh(x, c))) for x in range(-20, 101))
            o.append('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.4"%s/>'
                     % (pts, dash))
        for i, (dash, lab) in enumerate(((None, 'experiment 1'), ('4 3', 'experiment 2'))):
            y = sy(0.075) - (1 - i) * 14
            o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
                     'stroke-width="1.4"%s/>' % (sx(46), y, sx(58), y,
                                                 (' stroke-dasharray="%s"' % dash) if dash else ''))
            o.append('<text x="%.1f" y="%.1f" class="lbl">%s</text>' % (sx(61), y + 4, lab))
        return ''.join(o)
    return graph(-20, 100, 20, 0, 0.7, 0.1, 'x / mm', 'B<tspan baseline-shift="sub" font-size="75%">H</tspan> / mT',
                 'Graph of horizontal flux density BH against x for experiment 1 (solid) and '
                 'experiment 2 (dashed)', extra, xminor=2, yminor=0.01, height=210, yfmt='%.1f')


def fig37():
    """The x-axis 03.7 provides: a line from x = 0 to x = r with a tick midway, and nothing else —
    the BH axis, its values and the curve are the marks."""
    return ('<svg viewBox="0 0 %d 150" role="img" aria-label="An x-axis from 0 to r with a tick '
            'midway, labelled x / mm; no vertical axis">'
            '<line x1="40" y1="75" x2="300" y2="75" class="axis"/>'
            '<line x1="40" y1="71" x2="40" y2="79" class="axis"/>'
            '<line x1="170" y1="71" x2="170" y2="79" class="axis"/>'
            '<line x1="300" y1="71" x2="300" y2="79" class="axis"/>'
            '<text x="40" y="94" class="num">0</text>'
            '<text x="300" y="94" class="num"><tspan font-style="italic">r</tspan></text>'
            '<text x="170" y="112" class="ax" style="text-anchor:middle">x / mm</text></svg>' % W)

TABLE1 = ('<p>A stroboscope emits bright flashes of white light. The duration of each flash and '
          'the frequency of the flashes can be varied.</p>'
          '<p><b>Table 1</b> shows information about the stroboscope.</p>'
          '<table><tr><th></th><th>Minimum</th><th>Maximum</th></tr>'
          '<tr><td>Duration of each flash / &micro;s</td><td>60</td><td>300</td></tr>'
          '<tr><td>Frequency of flashes / Hz</td><td>1</td><td>150</td></tr></table>'
          '<p>The duration of each flash is <i>T</i><sub>1</sub>.</p><p>The time from the start of '
          'a flash to the start of the next flash is <i>T</i><sub>2</sub>.</p><p>The duty cycle of '
          'a stroboscope is defined as <i>T</i><sub>1</sub>/<i>T</i><sub>2</sub></p>')

FIG2_EQ = ('<p><b>Figure 2</b> shows the first six images of the ball, starting with <i>n</i> = 0, '
           'where <i>n</i> is the image number: the six circles run down and to the right, with '
           '<i>H</i> marked as the height of the bottom of the n = 0 image above the floor and '
           '<i>h</i> as the height of the bottom of the n = 5 image.</p>'
           '<p>The images are used to determine:</p><ul><li><i>H</i>, the vertical distance from '
           'the bottom of the ball to the floor when <i>n</i> = 0</li><li><i>h</i>, the vertical '
           'distance from the bottom of the ball to the floor for each non-zero value of '
           '<i>n</i>.</li></ul><p>The <i>n</i> = <i>N</i> image is produced at the instant that the '
           'ball hits the floor for the first time. For <i>n</i> between 0 and <i>N</i> it can be '
           'shown that</p><p><i>H</i> &minus; <i>h</i> = <i>u</i><sub>0</sub><i>n</i>/<i>f</i> + '
           '(<i>g</i>/2)(<i>n</i>/<i>f</i>)<sup>2</sup></p><p>where <i>u</i><sub>0</sub> is the '
           'vertical velocity of the ball when <i>n</i> = 0, <i>g</i> is the acceleration due to '
           'gravity and <i>f</i> is the frequency of the flashes.</p>')

FIG3_STEM = ('<p><b>Figure 3</b> shows positions of the bottom of the ball for <i>n</i> = 40 to '
             '<i>n</i> = 66. In this range of positions, the ball makes contact with the floor for '
             'the second and third times.</p><p>Values of <i>h</i>, the vertical distance from the '
             'bottom of the ball to the floor, are plotted on the <i>y</i>-axis. Values of '
             '<i>s</i>, the horizontal displacement from a point on the floor below the centre of '
             'the <i>n</i> = 0 image, are plotted on the <i>x</i>-axis.</p>')

STEM2 = ('<p><b>Figure 4</b> is a plot of current&ndash;voltage data for a filament lamp '
         '<b>L</b>.</p><p>The current <i>I</i> was measured as the voltage <i>V</i> across '
         '<b>L</b> was increased at a steady rate. These data were obtained using a current sensor '
         'and a voltage sensor connected to a data logger. The logger recorded data at a rate of '
         '2.5 Hz.</p>')

TABLE2 = ('<p><b>Table 2</b> shows some values of <i>V</i> that are plotted on <b>Figure 4</b> and '
          'corresponding results for <i>I</i> and for the power <i>P</i> dissipated in '
          '<b>L</b>.</p><table><tr><th><i>V</i> / V</th><th><i>I</i> / A</th><th><i>P</i> / W</th>'
          '</tr><tr><td>3.30</td><td>1.07</td><td>3.53</td></tr>'
          '<tr><td>5.17</td><td>1.32</td><td></td></tr>'
          '<tr><td>7.69</td><td>1.59</td><td>12.2</td></tr>'
          '<tr><td>9.58</td><td></td><td></td></tr>'
          '<tr><td>11.47</td><td>1.94</td><td>22.3</td></tr></table>')

STEM3 = ('<p><b>Figure 7a</b> shows the front view of a vertical coil mounted on a circular frame, '
         'with <b>Q</b> at its centre. <b>Figure 7b</b> is a side view showing a section through '
         'the frame and coil. A constant direct current in the coil produces magnetic flux, drawn '
         'in Figure 7b as field lines that pass through the coil horizontally near <b>Q</b> and '
         'curve round the two sections of the coil above and below it.</p><p>Point <b>Q</b> is at '
         'the centre of the coil. A sensor placed at <b>Q</b> detects <i>B</i><sub>H</sub>, the '
         'horizontal component of the magnetic flux density. The effect of the Earth&rsquo;s '
         'magnetic field at <b>Q</b> is negligible.</p>')

FIG10 = ('<p><b>Figure 10</b> shows an arrangement of two vertical coils, seen side-on: coil 1 on '
         'the left and coil 2 on the right, a distance <i>r</i> apart, with a horizontal axis '
         '<b>PR</b> through both centres. <b>Q</b> is at the centre of coil 1, and the sensor is '
         'shown at a new position a displacement <i>x</i> from <b>Q</b> along <b>PR</b>. Four '
         'experiments are done using this arrangement.</p><p>Coil 1 and coil 2 are identical and '
         'have a radius <i>r</i>. The coils are separated by a distance <i>r</i> and have a common '
         'axis <b>PR</b>. <b>Q</b> is at the centre of coil 1.</p><p>The four different '
         'experiments investigate how <i>B</i><sub>H</sub> varies with <i>x</i>, the displacement '
         'of the sensor from <b>Q</b> along <b>PR</b>.</p><p>In experiment 1, the current in coil '
         '1 is 225 mA and the current in coil 2 is zero.</p><p>In experiment 2, the current in '
         'coil 1 is zero and the current in coil 2 is 225 mA.</p><p><b>Figure 11</b> shows the '
         'results of experiment 1 and experiment 2.</p>')

EXP3 = ('<p>In experiment 3, the current in both coils is 225 mA so that the magnetic fields '
        'produced by coil 1 and coil 2 are combined. The resultant <i>B</i><sub>H</sub> has a '
        'constant maximum value in the region between <i>x</i> = <i>r</i>/4 and <i>x</i> = '
        '3<i>r</i>/4</p>')

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, accept)
Q = [
 ('1', '1', 1, 'short', MEAS, '', '',
  '<p>What is the maximum duty cycle of the stroboscope?</p><p>Tick (&#10003;) <b>one</b> box.</p>'
  '<ul><li>6.0 &times; 10<sup>&minus;5</sup></li><li>3.0 &times; 10<sup>&minus;4</sup></li>'
  '<li>9.0 &times; 10<sup>&minus;3</sup></li><li>4.5 &times; 10<sup>&minus;2</sup></li></ul>',
  '4.5 × 10⁻² (CAO): the longest flash, 300 μs, at the highest frequency, 150 Hz, so '
  'T₂ = 1/150 s and T₁/T₂ = 300 × 10⁻⁶ × 150.',
  '4.5 × 10^-2 | 4.5x10^-2 | 0.045'),
 ('1', '2', 1, 'written', MEAS, 'photograph', fig1(),
  '<p><b>Figure 1</b> shows images produced in an experiment in which a bouncing ball is '
  'illuminated by a stroboscope. The stroboscope flashes at a constant frequency.</p>'
  '<p>Suggest why <i>T</i><sub>1</sub> must be very short for this experiment.</p>',
  'So that the images are not blurred — or so that the position of the ball in each image can be '
  'determined. Must refer to a quality of the images: "sharp", "focused", "clear", "defined", or '
  'the ball is circular / not elongated; also allowed: the idea that the ball does not move '
  'during each flash, or that (the centre of) the ball is a single point. Comments about the '
  'trajectory ("see a clear pattern"), the duty cycle or the flash rate are neutral.', ''),
 ('1', '3', 3, 'explain', MEAS + ', ' + MECH, 'diagram', '',
  FIG2_EQ + '<p>In order to find <i>g</i>, a graph is plotted with values of '
  '(<i>H</i> &minus; <i>h</i>)/<i>n</i> on the <i>y</i>-axis.</p><p>Suggest what is plotted on '
  'the <i>x</i>-axis. Go on to explain how <i>g</i> is determined from this graph.</p>',
  'Rearranging to (H − h)/n = u₀/f + (g/2f²)n (1); a valid x-axis quantity, e.g. n, in line with '
  'y = mx + c (2); g found from the gradient for that x-axis, with g as the subject (3 — '
  'contingent on the second mark). For x = n: g = 2f² × gradient; x = n/2: g = f² × gradient; '
  'x = n/f: g = 2f × gradient; x = n/(2f): g = f × gradient; x = n/f²: g = 2 × gradient; '
  'x = n/(2f²): g = gradient. An incorrect equation with n in the mx term earns the last two '
  'marks by error carried forward.', ''),
 ('1', '4', 3, 'calculation', MECH, 'photograph', fig1(),
  FIG2_EQ + '<p>The following data are recorded.</p><p><i>H</i> = 1550 mm<br><i>f</i> = 31.0 Hz'
  '</p><p>The graphical analysis of data from <b>Figure 1</b> gives <i>g</i> as '
  '9.79 m s<sup>&minus;2</sup>.</p><p>Determine <i>u</i><sub>0</sub>.</p>'
  '<p><i>u</i><sub>0</sub> = ______ m s<sup>&minus;1</sup></p>',
  'u₀ = 0.14 m s⁻¹. n = N = 17 ± 1 counted from Figure 1 (1); use of H = u₀n/f + (g/2)(n/f)² with '
  'h = 0, or H = u₀t + ½gt² with t = n/31 (2 — full substitution, g of 9.79 or 9.8(1) condoned); '
  'u₀ evaluated to 2 sf (3). With n = 17 (t = 0.548 s) u₀ = 0.14, or 0.15 / 0.13 if t is '
  'truncated to 3 / 2 sf; with n = 16, 0.48 (0.44); with n = 18, −0.17 (−0.18). Alternative '
  'using a non-zero h: e.g. n = 5, h = (89/99) × 1550 = 1393 mm, giving u₀ = 0.18(4) m s⁻¹.', ''),
 ('1', '5', 2, 'calculation', MECH, 'scatter', fig3(),
  FIG3_STEM + '<p>Determine, in mm s<sup>&minus;1</sup>, the horizontal velocity of the ball '
  'between the second and third contacts of the ball with the floor.</p>'
  '<p>horizontal velocity = ______ mm s<sup>&minus;1</sup></p>',
  '1550 to 1650 mm s⁻¹ (1.6 × 10³ at 2 sf allowed). A valid horizontal displacement s₂ − s₁ '
  '(between 490 and 1000 mm) divided by a time — expected from counting intervals between '
  'flashes (each 1/31 s), or using the 01.6 result; the distance between contacts with a time '
  'of 19/31 or 20/31 s is condoned (1); velocity in range (1, not contingent on the first).',
  '1550 to 1650'),
 ('1', '6', 3, 'annotate', MECH, 'scatter', fig3(),
  FIG3_STEM + '<p>Determine the time between the second and third contacts.</p><p>Annotate '
  '<b>Figure 3</b> to show your method.</p><p>time = ______ s</p>',
  '0.61 to 0.65 s. Either: a smooth curve through at least the top four points (n = 51 to 54) to '
  'find h<sub>max</sub> (1); suvat with u = 0, e.g. t = 2√(2h<sub>max</sub>/9.79) (2); or: lines '
  'to find s at both contacts (e.g. through n = 41/42 or 43/44 and n = 61/62 or 63/64 to h = 0) '
  '(1), then t = (s₂ − s₁) / horizontal velocity from 01.5 (2); time in range (3, contingent on '
  'the second). A whole number of intervals (19/31 = 0.613, 20/31 = 0.645) is not condoned for '
  'the second mark, but a non-integer estimate such as 19.5/31 earns the third.', '0.61 to 0.65'),

 ('2', '1', 2, 'calculation', MEAS + ', ' + CIRC, '', '',
  '<p>Determine, in V s<sup>&minus;1</sup>, the rate of increase of <i>V</i>.</p>'
  '<p>rate of increase of <i>V</i> = ______ V s<sup>&minus;1</sup></p>',
  '1.50 to 1.65 V s⁻¹ for both marks (expected 1.57(2)); 1.40 to 1.75 for one mark. The points '
  'on Figure 4 are one logger reading apart, 0.4 s at 2.5 Hz.', '1.50 to 1.65'),
 ('2', '2', 2, 'written', MEAS, '', '',
  '<p>State <b>two</b> advantages of using data logging for this experiment.</p>',
  'Any two, one mark each: reduces the impact of error in reading and recording data manually '
  '(allow reducing human / random error, improving accuracy); data can be collected at a higher '
  'rate (condone "quickly"); the data can easily be processed — transferred to or graphed with a '
  'computer / spreadsheet; the two sets of data (I and V) are recorded simultaneously. Neutral: '
  'precision, resolution, reduces uncertainty, eliminates systematic / parallax errors or '
  'anomalies, saves time, reaction time, remote / dangerous / automatic operation, large amounts '
  'of data. More than two ideas are marked as a list.', ''),
 ('2', '3', 4, 'explain', CIRC, 'diagram', '',
  '<p><b>Figure 5</b> shows two circuits that can be used to collect current&ndash;voltage data. '
  'In both, the lamp <b>L</b> has the voltage sensor across it and the current sensor in series '
  'with it, and both sensors feed the data logger. In circuit 1, <b>X</b> is a variable resistor '
  'in series with the current sensor, <b>L</b> and the dc supply. In circuit 2, <b>X</b> is '
  'connected across the dc supply and its sliding contact feeds the current sensor and '
  '<b>L</b>, which return to one end of <b>X</b>.</p><p>The dc supply has an emf of 12 V and '
  'negligible internal resistance. The current sensor and the voltage sensor behave as ideal '
  'meters.</p><p>In circuit 1:</p><ul><li><b>X</b> is used as a variable resistor with a maximum '
  'resistance of 14.9 &Omega;</li><li>when <b>X</b> is set to maximum resistance, the resistance '
  'of <b>L</b> is 2.3 &Omega;.</li></ul><p>In circuit 2, <b>X</b> is used as a potential '
  'divider.</p><p>Discuss, with reference to circuit 1 and circuit 2, whether either circuit can '
  'produce all the data shown in <b>Figure 4</b>.</p><p>Support your answer with a '
  'calculation.</p>',
  'Circuit 2 can produce the data because the pd can be varied between 0 V and 12 V (1; "can '
  'achieve the 12 V range" allowed, "can produce 0 V and 12 V" rejected). Circuit 1 cannot '
  'produce all of the data (2; "neither can" earns 1 of these two). With X at maximum: minimum '
  'I = 12/17.2 = 0.70 A, or minimum V = 12 × 2.3/17.2 = 1.6 V (3; not 0.69). Comparison with the '
  'first (or second) point on Figure 4, e.g. 0.70 A > 0.36 A — circuit 1 cannot give I below '
  '0.70 A (4).', ''),
 ('2', '4', 3, 'calculation', CIRC, '', '',
  TABLE2 + '<p>Complete <b>Table 2</b>.</p>',
  'Row 2: P = 6.82 W (CAO). Row 4: I = 1.77 A (± 0.01, read from Figure 4) and P = 17.0 W '
  '(error carried forward for their I × 9.58). Deduct a maximum of 1 mark if any value is not '
  'to 3 sf.', ''),
 ('2', '5', 3, 'drawing', MEAS + ', ' + CIRC, 'grid-blank', fig6(),
  '<p>Plot on <b>Figure 6</b> a graph of <i>P</i> against <i>V</i>.</p><p>You should use only '
  'the data in your completed <b>Table 2</b>.</p>',
  'Vertical axis labelled P / W (1; P (W) or words allowed, a comma separator rejected). A '
  'suitable linear vertical scale in integer values, labelled at least every 4 cm and covering '
  'the points — expected 1 cm = 2 W or 2 cm = 5 W (1). All five points plotted and a smooth '
  'curve of increasing gradient, continuous from the first to the fifth point and a reasonable '
  'best fit (within 2 minor squares) (1).', ''),
 ('2', '6', 2, 'calculation', CIRC, '', '',
  '<p><b>L</b> is connected to a 12 V power supply of negligible internal resistance. <b>L</b> '
  'then dissipates its rated power <i>P</i><sub>r</sub>.</p><p>A second lamp, identical to '
  '<b>L</b>, is now connected in series with <b>L</b>.</p><p>Determine the percentage of '
  '<i>P</i><sub>r</sub> that is dissipated in this circuit.</p><p>percentage = ______ %</p>',
  '70% to 73%. P<sub>r</sub> read off at 12 V, extrapolating the curve on Figure 6 (expect '
  '23.8 W; a straight-line read-off accepted) (1); P₂ read off at 6 V (expect 8.5 W) and '
  '2P₂/P<sub>r</sub> × 100 evaluated (1, not contingent). Via Figure 4: 12 V × 1.98 A = 23.7 W '
  'and 6 V × 1.42 A = 8.5(2) W, giving 72%.', '70 to 73'),

 ('3', '1', 2, 'explain', FIELD, '', '',
  '<p>Discuss whether a search coil is a suitable sensor to detect <i>B</i><sub>H</sub>.</p>',
  'Not suitable: no emf would be induced in the search coil (1); a search coil needs to be cut '
  'by changing flux, but here the flux is constant (1). Both marks depend on saying it is not '
  'suitable; "voltage" / "potential difference" condoned for emf, but "field" is not allowed for '
  'flux. Alternative: suitable, if a valid method changes the flux through it — rotate either '
  'coil, switch the dc current off, move one coil relative to the other (1) — and it is stated '
  'that this changes the flux cutting the search coil (1).', ''),
 ('3', '2', 2, 'calculation', FIELD, 'diagram', '',
  '<p><i>B</i><sub>H</sub> is measured at <b>Q</b> with the coil vertical. The coil is now '
  'rotated about <b>Q</b> through 25&deg; as shown in <b>Figure 8</b>, which shows the coil '
  'tilted 25&deg; from the vertical dashed line through <b>Q</b>. The current in the coil does '
  'not change.</p><p>A new measurement of <i>B</i><sub>H</sub> is made with the coil fixed in '
  'this new position.</p><p>Determine the percentage change in <i>B</i><sub>H</sub> produced by '
  'this rotation of the coil. Show your working.</p><p>percentage change = ______ %</p>',
  '−9.4% (a decrease; the sign is not insisted on). Use of 1 − cos 25° (or 1 − sin 65°), e.g. '
  '1 − 0.906 or 100 − 90.6 (1); 9.4 to 2 sf (1, CAO; an unsupported 9.4 gets both). 9.0 is '
  'allowed if 1 − 0.91 is seen. 1 − sin 25° leading to 58% earns 1 mark only.',
  '9.4 | -9.4 | 9.37 | -9.37'),
 ('3', '3', 3, 'explain', MEAS + ', ' + FIELD, 'photograph', '',
  '<p><b>Figure 9</b> shows a protractor being used to measure the angle through which the coil '
  'is rotated: a circular protractor is centred on <b>Q</b>, with the edge of the frame lying '
  'across it at 25&deg; to the vertical dashed line, and an enlarged view of the protractor '
  'scale shows it marked in single-degree divisions, numbered every 10&deg;.</p><p>Estimate the '
  'percentage uncertainty in this result. Justify your answer.</p>'
  '<p>percentage uncertainty = ______ %</p>',
  '4%, from 2 × 0.5 / 25 × 100. Uncertainty in a single reading is ½° (1; up to 3° allowed if '
  'justified by parallax, the thickness of the frame etc.); the angle depends on two readings, '
  'so the absolute uncertainty in θ is 2 × that (1); percentage = 100 × absolute uncertainty / '
  '25 (1, 1 sf allowed). 0.5/25 × 100 = 2% (missing the 2) earns 1st and 3rd; an unexplained '
  '1° giving 4% earns the 3rd only; 2 × 1/25 = 8% (1° unexplained) earns the 2nd and 3rd.', ''),
 ('3', '4', 2, 'calculation', FIELD, 'graph', fig11(),
  FIG10 + '<p>During experiment 1, <i>B</i><sub>H</sub> is measured with the sensor at <b>Q</b>. '
  'The sensor is then moved along <b>PR</b> until the value of <i>B</i><sub>H</sub> is halved. '
  'The distance from <b>Q</b> to the sensor is <i>x</i><sub>0.5</sub></p><p>Determine '
  '<i>x</i><sub>0.5</sub>/<i>r</i></p><p><i>x</i><sub>0.5</sub>/<i>r</i> = ______</p>',
  '0.73 to 0.81 (no unit, at least 2 sf) — both marks for an answer in range. One mark for r in '
  'the range 67 to 69 mm (the separation of the two peaks) or x<sub>0.5</sub> in the range 50 to '
  '55 mm, seen in working or on the graph.', '0.73 to 0.81'),
 ('3', '5', 2, 'calculation', FIELD, 'graph', fig11(),
  FIG10 + EXP3 + '<p>Deduce, in mT, the value of <i>B</i><sub>H</sub> in this region.</p>'
  '<p><i>B</i><sub>H</sub> = ______ mT</p>',
  '0.93 to 0.97 mT for both marks (0.91 to 0.99 for one), at least 2 sf: B<sub>H</sub> for '
  'experiment 1 added to B<sub>H</sub> for experiment 2 at any point between x = 17 and '
  'x = 51 mm, read off Figure 11. Any sign given is ignored.', '0.93 to 0.97'),
 ('3', '6', 2, 'written', FIELD, '', '',
  EXP3 + '<p>State <b>two</b> characteristics of the magnetic field lines in this region.</p>',
  'Parallel — or in the same direction / uniform direction (1); evenly spaced — equally spaced, '
  'equidistant, uniform spacing (1). Neutral: horizontal, to the right, straight, perpendicular '
  'to the coil, close together, do not touch, "uniform field". More than two ideas are marked as '
  'a list.', ''),
 ('3', '7', 3, 'drawing', FIELD, 'graph', fig37(),
  '<p>In experiment 4, the current in coil 2 is reversed so that the direction of the magnetic '
  'field produced by coil 2 is also reversed. The magnitudes of the currents in coil 1 and coil '
  '2 are still 225 mA.</p><p>Sketch a graph to show how <i>B</i><sub>H</sub> varies between '
  '<i>x</i> = 0 and <i>x</i> = <i>r</i>. The <i>x</i>-axis has been provided for you.</p><p>Your '
  'graph should include numerical values on your <i>B</i><sub>H</sub> axis that correspond to '
  '<i>x</i> = 0 and <i>x</i> = <i>r</i>.</p>',
  'MAX 3 of 4: a vertical axis and a continuous line from x = 0 to x = r crossing B<sub>H</sub> '
  '= 0 at x = r/2 (1); the axis labelled B, a negative gradient, two-quadrant graph (1; an '
  'always-positive gradient allowed, a straight line allowed for these two); the axis labelled '
  'with symbol and unit, e.g. B<sub>H</sub> / mT, with B<sub>H</sub> = 0.43 ± 0.01 mT at x = 0 or '
  '−0.43 ± 0.01 mT at x = r (1); an approximately correct shape — falling from +0.43 through 0 at '
  'r/2 to −0.43 — with the value at x = 0 equal and opposite to that at x = r (1).', ''),
]

PER_QUESTION = {'1': 13, '2': 16, '3': 16}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 45, 'the cover says 45 and these sum to %d' % sum(got.values())

# ---- every intermediate the scheme prints, recomputed ----
assert abs(300e-6 * 150 - 4.5e-2) < 1e-12                                          # 01.1
# 01.4 — N off the measured Figure 1: the first ball whose bottom reaches the floor band
N = next(i for i, (x1, y1, y2) in enumerate(FIG1_PX) if FLOOR_PX - y2 <= 3)
assert N == 17
h5 = (FLOOR_PX - FIG1_PX[5][2]) * MM_PER_PX
assert abs(h5 - 1393) < 10                                                          # scheme: 1393
assert round(89 / 99 * 1550) == 1393
u0 = lambda t, H=1.55, g=9.79: (H - 0.5 * g * t * t) / t
assert round(u0(17 / 31.0), 2) == 0.14 and round(u0(0.548), 2) == 0.15 and round(u0(0.55), 2) == 0.13
assert round(u0(16 / 31.0), 2) == 0.48 and round(u0(18 / 31.0), 2) == -0.17
t5 = 5 / 31.0
assert abs((1.55 - 1.393 - 0.5 * 9.79 * t5 ** 2) / t5 - 0.184) < 0.002
# 01.5 — the measured crosses: horizontal spacing × f
vx = (FIG3[-1][0] - FIG3[0][0]) / 26 * 31.0
assert 1550 <= vx <= 1650
# 01.6 — both routes land in 0.61 to 0.65 s
hmax = max(h for s, h in FIG3) / 1000.0
assert 0.61 <= 2 * math.sqrt(2 * hmax / 9.79) <= 0.65
assert round(19 / 31.0, 3) == 0.613 and round(20 / 31.0, 3) == 0.645
# 02.1 — the logger interval between measured points
rate = (FIG4[-1][0] - FIG4[0][0]) / (len(FIG4) - 1) / 0.4
assert 1.50 <= rate <= 1.65
# 02.3
assert round(12 / 17.2, 2) == 0.70 and round(12 / 17.2, 3) != 0.69 and round(12 * 2.3 / 17.2, 1) == 1.6
assert abs(14.9 + 2.3 - 17.2) < 1e-9 and 12 / 17.2 > FIG4[0][1]
# 02.4
assert round(3.30 * 1.07, 2) == 3.53 and round(5.17 * 1.32, 2) == 6.82
assert round(7.69 * 1.59, 1) == 12.2 and round(11.47 * 1.94, 1) == 22.3
assert abs(dict(FIG4)[9.58] - 1.77) <= 0.01 and round(9.58 * 1.77, 1) == 17.0
# 02.6
assert 70 <= 2 * 8.5 / 23.8 * 100 <= 73 and round(2 * 12 * 0 + 2 * 8.52 / 23.7 * 100) == 72
assert round(12 * 1.98, 1) == 23.8 or round(12 * 1.98, 1) == 23.7
assert round(6 * 1.42, 2) == 8.52
# 03.2 / 03.3
assert round((1 - math.cos(math.radians(25))) * 100, 1) == 9.4
assert round((1 - 0.91) * 100, 1) == 9.0 and round((1 - math.sin(math.radians(25))) * 100) == 58
assert round(2 * 0.5 / 25 * 100) == 4 and round(0.5 / 25 * 100) == 2 and round(2 / 25 * 100) == 8
# Figure 11: the formula agrees with the pixels, then the scheme's answers from it
for x, e1, e2 in FIG11_READ:
    assert abs(bh(x, 0) - e1) < 0.007 and abs(bh(x, R_MM) - e2) < 0.007, x
x05 = R_MM * math.sqrt(2 ** (2 / 3.0) - 1)                                          # 03.4
assert 50 <= x05 <= 55 and 0.73 <= x05 / R_MM <= 0.81
for x in range(17, 52, 2):                                                           # 03.5
    assert 0.91 <= bh(x, 0) + bh(x, R_MM) <= 0.99
assert 0.93 <= bh(R_MM / 2, 0) + bh(R_MM / 2, R_MM) <= 0.97
assert abs(bh(0, 0) - bh(0, R_MM) - 0.43) <= 0.01                                   # 03.7
assert abs(bh(R_MM, 0) - bh(R_MM, R_MM) + 0.43) <= 0.01
d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() == 3 and (d.year, d.month, d.day) == (2023, 6, 15)              # cover: Thursday

ROWS = [dict(DOC, row_id='D-' + PAPER, kind='document', total_marks='45',
             needs='Calculator, Ruler, Protractor, Equation booklet',
             source_url='https://drive.google.com/file/d/%s/view' % QP)]
PRE = {'1': (TABLE1, MEAS + ', ' + MECH, '', ''),
       '2': (STEM2, CIRC, 'graph', fig4()),
       '3': (STEM3, FIELD, 'diagram', '')}
for q in ('1', '2', '3'):
    html, topics, figure, diagram = PRE[q]
    ROWS.append(dict(DOC, row_id='Q-AQA-7408-2306-3A-%02d' % int(q), kind='preamble', question=q,
                     section='', html=html, topics=topics, figure=figure, diagram=diagram,
                     diagram_by=('family' if diagram else '')))
    for qq, part, marks, atype, tp, fg, dg, h, answer, accept in Q:
        if qq != q:
            continue
        r = dict(DOC)
        r.update(row_id='Q-AQA-7408-2306-3A-%02d%s' % (int(qq), part), kind='question',
                 question=qq, part=part, section='', marks=str(marks), html=h,
                 answer=answer, answer_type=atype, topics=tp, figure=fg,
                 diagram=dg, diagram_by=('family' if dg else ''), placeholder='',
                 accept=accept)
        ROWS.append(r)
