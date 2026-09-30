"""AQA A-level Physics 7408/3A — Paper 3 Section A (practical skills and data analysis) — June 2024.

Every answer is READ OFF AQA's own scheme, `Mark scheme_ Paper 3 Section A - June 2024 AL` — its
cover says A-level Physics 7408/3A, Paper 3 Section A, June 2024, Version 1.0 Final, and its pages
answer this paper's own numbers (931 mV and 397 mV in 01.4, R = 2840 in 02.2, 1681 Ω and 1.68 kΩ in
02.5, the intercepts 134.85 g and 181.85 g in 03.4). The 2017 Highers are why that is the rule.

The cover says 45 marks and the question-total boxes say 15, 15 and 15. Both are asserted below, and
so is every intermediate the scheme prints inside its own working.

FIVE FIGURES ARE DRAWN AND EVERY ONE IS MEASURED OFF THE PAPER, NOT EYEBALLED. All are raster images
in the PDF with no text layer and no vectors; gridlines were found by their own regular spacing in
the embedded image and data marks located in pixels.
  * Figure 2 (01.1, 01.2) — the micrometer scales. Main-scale ticks every 20.4 px (0 at px 97,
    5 at px 200, upper whole-mm ticks 0–6, lower half-mm ticks 0.5–6.5); thimble divisions every
    20 px (25 at px 104, 20 at px 204) with the datum line at px 165, i.e. 21.95 divisions. That is
    the scheme's 6.72 mm, which is also one of the four printed options, so drawing it is the
    question and not its answer.
  * Figure 5 (01.5, 01.7) — five crosses of R against L. Axes: L 150 at px 135.5, 400 at 637;
    R 0.30 at px 815, 0.70 at 12. Crosses measured as dark blobs; L of the first and last are the
    209 mm and 388 mm the question itself names. The scheme's "about 1.66 Ω m⁻¹" and its error-bar
    limits (0.329–0.371, 0.614–0.692) are recomputed from them below.
  * Figure 7 (02.3, 02.4) — the E_V against x curve, traced column by column (x 200 at px 138.5,
    450 at 729.5; E_V 1200 at px 12.5, 200 at 603.5). Every traced point has E_V·x² within ±1.2 %
    of 5.29 × 10⁷, and the x that gives 130 lx from it lands in the scheme's 634–639 mm.
  * Figure 13 (03.4, 03.5) — two straight lines on twin axes (I 0 at px 135.5, 10 at 726; M₁ 135.5
    at px 12.5, 133.0 at 603; the right-hand M₂ axis is the same scale 46.5 g higher). Measured
    intercepts 134.853 g and 181.853 g, the scheme's 134.85 and 181.85; ends at I = 10 A measured
    at 133.61 g and 179.65 g.
The apparatus pictures (Figures 1, 3, 4, 6, 8, 9, 10, 11, 12, 14) are not drawn: each carries
`figure` and what it shows is said in the question's own words without saying what it implies.
"""
import datetime, math, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from svgplot import W

PAPER = 'P-AQA-7408-2406-3A'
QP = '1w4gej6ybKstwQILd1MGm6DsX-6Ywb45Y'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS5', band_type='stage',
           band_value='A-Level', level='Alevel', company='AQA', exam_board='AQA',
           spec_code='7408/3A', exam_wave='First wave', year='2024', month='6', paper='3',
           exam_date='2024-06-17', document_type='Past paper',
           name='Paper 3 Section A — June 2024', active='True',
           trackable='True', printable='False')

ME = 'Measurements & Their Errors'
EC = 'Electric Circuits'
EM = 'Electric & Magnetic Fields'


# ---------------------------------------------------------------------------------------------
# One plotter for the three graphs, because two of them do not start at zero and one has a second
# y-axis — svgplot.axes() does neither. Same frame numbers (L 52, R 326, T 14) as svgplot so the
# graphs read at the same scale as every other drawn graph in the library.
# ---------------------------------------------------------------------------------------------
def plot(xmin, xmax, xstep, xminor, ymin, ymax, ystep, yminor, xlab, ylab, label, extra,
         right=None, rlab=''):
    L, R, T = 52, (284 if right is not None else 326), 14
    rows = (ymax - ymin) / ystep + 1
    B = T + max(136, int(rows * 17))
    sx = lambda v: L + (R - L) * (v - xmin) / (xmax - xmin)
    sy = lambda v: B - (B - T) * (v - ymin) / (ymax - ymin)
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s">' % (W, B + 48, label)]
    for i in range(int(round((xmax - xmin) / xminor)) + 1):
        x = sx(xmin + i * xminor)
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>' % (x, T, x, B))
    for i in range(int(round((ymax - ymin) / yminor)) + 1):
        y = sy(ymin + i * yminor)
        p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"/>' % (L, y, R, y))
    p.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
             'stroke-width="1" opacity=".55"/>' % (L, T, R - L, B - T))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    n = int(round((xmax - xmin) / xstep))
    for i in range(n + 1):
        v = xmin + i * xstep
        p.append('<text x="%.1f" y="%d" class="num">%g</text>' % (sx(v), B + 15, round(v, 6)))
    n = int(round((ymax - ymin) / ystep))
    for i in range(n + 1):
        v = ymin + i * ystep
        p.append('<text x="%d" y="%.1f" class="num" style="text-anchor:end">%s</text>'
                 % (L - 5, sy(v) + 4, ('%.2f' % v) if ystep < 0.1 else ('%.1f' % v) if ystep < 1 else '%g' % v))
    if right is not None:
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (R, T, R, B))
        for i in range(n + 1):
            v = ymin + i * ystep
            p.append('<text x="%d" y="%.1f" class="num" style="text-anchor:start">%.1f</text>'
                     % (R + 4, sy(v) + 4, v + right))
        p.append('<text x="%d" y="%d" class="ax" style="text-anchor:middle" '
                 'transform="rotate(-90 %d %d)">%s</text>' % (W - 6, (T + B) / 2, W - 6, (T + B) / 2, rlab))
    p.append(extra(sx, sy))
    p.append('<text x="%.1f" y="%d" class="ax" style="text-anchor:middle">%s</text>'
             % ((L + R) / 2, B + 36, xlab))
    p.append('<text x="12" y="%d" class="ax" style="text-anchor:middle" '
             'transform="rotate(-90 12 %d)">%s</text>' % ((T + B) / 2, (T + B) / 2, ylab))
    return ''.join(p) + '</svg>'


def crosses(points):
    def f(sx, sy):
        o = []
        for x, y in points:
            cx, cy = sx(x), sy(y)
            o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>' % (cx - 3, cy - 3, cx + 3, cy + 3))
            o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>' % (cx - 3, cy + 3, cx + 3, cy - 3))
        return ''.join(o)
    return f


# ---- Figure 2: the micrometer scales (see the module note for the measurement) ----
def fig2():
    mm = lambda v: 90 + 20 * v                 # main scale: 20 units per mm
    DY = 100                                    # the datum line
    div = lambda d: DY - (d - 21.95) * 12       # thimble: 12 units per division, 21.95 on the datum
    EDGE = mm(6.72)
    o = ['<svg viewBox="0 0 %d 200" role="img" aria-label="Enlarged view of the micrometer scales: '
         'a main scale on the sleeve with whole-millimetre marks above the datum line numbered 0 and 5, '
         'half-millimetre marks below it, and the thimble scale beside it numbered 20 and 25">' % W]
    o.append('<rect x="14" y="20" width="22" height="160" fill="none" stroke="currentColor" stroke-width="1.2"/>')
    o.append('<rect x="36" y="46" width="%.1f" height="108" fill="none" stroke="currentColor" stroke-width="1.2"/>'
             % (EDGE - 36))
    o.append('<line x1="48" y1="%d" x2="%.1f" y2="%d" stroke="currentColor" stroke-width="1.2"/>' % (DY, EDGE, DY))
    for k in range(7):                          # whole millimetres, above the line
        h = 16 if k in (0, 5) else 10
        o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="1.2"/>'
                 % (mm(k), DY, mm(k), DY - h))
        if k in (0, 5):
            o.append('<text x="%d" y="%d" class="num" style="text-anchor:middle">%d</text>'
                     % (mm(k), DY - 20, k))
    for k in range(7):                          # half millimetres, below the line
        o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="1.2"/>'
                 % (mm(k + 0.5), DY, mm(k + 0.5), DY + 10))
    # the thimble: a bevelled edge carrying the scale, then the barrel
    o.append('<polygon points="%.1f,34 %.1f,166 %.1f,186 %.1f,14" fill="none" stroke="currentColor" '
             'stroke-width="1.2"/>' % (EDGE, EDGE, EDGE + 30, EDGE + 30))
    o.append('<rect x="%.1f" y="14" width="%.1f" height="172" fill="none" stroke="currentColor" '
             'stroke-width="1.2"/>' % (EDGE + 30, W - 12 - EDGE - 30))
    for d in range(17, 28):
        y = div(d)
        long_ = d % 5 == 0
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1"/>'
                 % (EDGE, y, EDGE + (26 if long_ else 14), y))
        if long_:
            o.append('<text x="%.1f" y="%.1f" class="num" style="text-anchor:start">%d</text>'
                     % (EDGE + 40, y + 4, d))
    return ''.join(o) + '</svg>'


# ---- Figure 5 ----
FIG5 = [(209, 0.350), (255, 0.438), (302, 0.502), (340, 0.565), (388, 0.653)]


def fig5():
    return plot(150, 400, 50, 10, 0.30, 0.70, 0.05, 0.01, 'L / mm', 'R / Ω',
                'Graph of resistance R against length L for five lengths of wire X', crosses(FIG5))


# ---- Figure 7: the traced curve, E_V in lx against x in mm ----
FIG7 = [(209.9, 1197.5), (218.4, 1099.3), (226.9, 1020.6), (235.3, 953.0), (243.8, 890.4),
        (252.2, 833.7), (260.7, 781.2), (269.2, 732.1), (277.6, 686.5), (286.1, 644.2),
        (294.5, 605.2), (303.0, 570.6), (311.5, 540.1), (319.9, 512.2), (328.4, 487.6),
        (336.8, 464.8), (345.3, 443.7), (353.8, 424.2), (362.2, 405.6), (370.7, 387.8),
        (379.1, 370.9), (387.6, 355.7), (396.1, 340.4), (404.5, 326.9), (413.0, 311.7),
        (421.4, 299.8), (429.9, 287.1), (438.4, 275.3), (446.8, 264.3), (450.0, 260.6)]


def fig7():
    def curve(sx, sy):
        return ('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.6"/>'
                % ' '.join('%.1f,%.1f' % (sx(x), sy(e)) for x, e in FIG7))
    return plot(200, 450, 50, 10, 200, 1200, 200, 40, 'x / mm', 'E<tspan baseline-shift="sub" font-size="70%">V</tspan> / lx',
                'Graph of E_V against x: a smooth curve falling from 1200 lx near x = 210 mm to about '
                '260 lx at x = 450 mm', curve)


# ---- Figure 13: M1 (solid, left axis) and M2 (dashed, right axis, 46.5 g higher) against I ----
M1 = ((0, 134.85), (10, 133.61))
M2 = ((0, 181.85), (10, 179.65))


def fig13():
    def lines(sx, sy):
        (a, b), (c, d) = M1
        o = ['<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1.6"/>'
             % (sx(a), sy(b), sx(c), sy(d))]
        (a, b), (c, d) = M2
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1.6" '
                 'stroke-dasharray="6 4"/>' % (sx(a), sy(b - 46.5), sx(c), sy(d - 46.5)))
        return ''.join(o)
    return plot(0, 10, 2, 0.4, 133.0, 135.5, 0.5, 0.1, 'I / A',
                'M<tspan baseline-shift="sub" font-size="70%">1</tspan> / g',
                'Graph of balance reading against current I: a solid line for M1 read on the left axis '
                '(133.0 to 135.5 g) and a dashed line for M2 read on the right axis (179.5 to 182.0 g), '
                'both falling in a straight line', lines, right=46.5,
                rlab='M<tspan baseline-shift="sub" font-size="70%">2</tspan> / g')


TABLE1 = ('<p><b>Table 1</b></p><table><tr><th rowspan="2"><i>d</i> / mm</th>'
          '<th colspan="4">Resistance per metre of wire / Ω m<sup>−1</sup></th></tr>'
          '<tr><th>copper</th><th>tungsten</th><th>alumel</th><th>nichrome</th></tr>'
          '<tr><td>0.38</td><td>0.151</td><td>0.504</td><td>3.15</td><td>9.73</td></tr>'
          '<tr><td>0.93</td><td>0.0247</td><td>0.0824</td><td>0.515</td><td>1.59</td></tr>'
          '<tr><td>1.63</td><td>0.00805</td><td>0.0268</td><td>0.168</td><td>0.518</td></tr>'
          '<tr><td>2.08</td><td>0.00494</td><td>0.0165</td><td>0.103</td><td>0.318</td></tr>'
          '<tr><td>3.66</td><td>0.00160</td><td>0.00532</td><td>0.0333</td><td>0.103</td></tr></table>')

TABLE2 = ('<p><b>Table 2</b></p><table><tr><th>Setting</th><th>Maximum reading displayed</th>'
          '<th>Minimum (non-zero) reading displayed</th><th>Unit</th></tr>'
          '<tr><td>range A</td><td>199.9</td><td>000.1</td><td>Ω</td></tr>'
          '<tr><td>range B</td><td>1999</td><td>0001</td><td>Ω</td></tr>'
          '<tr><td>range C</td><td>19.99</td><td>00.01</td><td>kΩ</td></tr>'
          '<tr><td>range D</td><td>199.9</td><td>000.1</td><td>kΩ</td></tr>'
          '<tr><td>range E</td><td>1.999</td><td>0.001</td><td>MΩ</td></tr></table>')

TABLE3 = ('<p><b>Table 3</b></p><table><tr><th>Setting</th><th>Minimum <i>R</i></th>'
          '<th>Maximum <i>R</i></th></tr>'
          '<tr><td>range B</td><td>______ Ω</td><td>1717 Ω</td></tr>'
          '<tr><td>range C</td><td>1.63 kΩ</td><td>______ kΩ</td></tr></table>')

MICRO = ('<p><b>Figure 1</b> shows a micrometer screw gauge: a C-shaped frame with the anvil at one '
         'end and the spindle opposite it, then the main scale on the sleeve, the micrometer scale on '
         'the thimble, and the ratchet at the far end. <b>Figure 2</b> shows an enlarged view of the '
         'scales.</p>')

CIRCUITS = ('<p><b>Figure 3</b> shows a circuit used to determine the resistance per metre of wire '
            '<b>X</b>: a cell, a switch, a 1.2 Ω resistor and wire <b>X</b> in series. <b>X</b> is '
            'mounted between two terminals on a ruler. Clips are used to connect a voltmeter across '
            'the 1.2 Ω resistor. When the switch is closed, the voltmeter reading is 931 mV.</p>'
            '<p>The switch is then opened and the voltmeter is connected to <b>X</b> as shown in '
            '<b>Figure 4</b>: the same series circuit, with the voltmeter now clipped to two points '
            'on <b>X</b>.</p>')

FIG5_LEAD = ('<p>The length of wire between the clips is <i>L</i>. Values of <i>R</i> are determined '
             'for different values of <i>L</i>. <b>Figure 5</b> shows these data.</p>')

OHM = ('<p><b>Figure 6</b> shows apparatus used to investigate how the resistance <i>R</i> of a '
       'light-dependent resistor (LDR) varies with illumination: a lamp above an LDR on the bench, '
       'the LDR connected to an ohm-meter with a selector dial marked OFF, A, B, C, D, E.</p>'
       '<p>The ohm-meter</p><ul><li>always displays a four-digit reading of <i>R</i></li>'
       '<li>can be set to the different ranges A to E shown in <b>Table 2</b>.</li></ul>' + TABLE2)

READING = '<p>In <b>Figure 6</b> the ohm-meter display reads <b>02.84</b>.</p>'

FIG7_LEAD = ('<p><i>R</i> is recorded for different values of the vertical distance <i>x</i> between '
             'the lamp and the LDR. <i>E</i><sub>V</sub> is calculated for each value of <i>R</i>. '
             '<b>Figure 7</b> shows how <i>E</i><sub>V</sub> varies with <i>x</i>.</p>'
             '<p>It can be shown that <i>E</i><sub>V</sub> ∝ 1/<i>x</i><sup>2</sup></p>')

SLIDES = ('<p><b>Figure 9</b> shows the LDR being used to investigate the transmission of light '
          'through glass slides: the lamp above, and a stack of glass slides lying on the LDR, which '
          'is connected to the ohm-meter. The lamp and ohm-meter are switched on. <i>R</i> is recorded '
          'with different numbers of slides placed on the LDR. <i>E</i><sub>V</sub> is calculated for '
          'each value of <i>R</i>.</p>')

EQN_EV = ('<p>For the arrangement in <b>Figure 9</b> it can be shown that</p>'
          '<p><i>E</i><sub>V</sub> = 400 e<sup>−<i>μN</i></sup></p><p>where <i>N</i> is the number '
          'of slides and <i>μ</i> is a constant.</p>')

YOKE = ('<p><b>Figure 11</b> shows the copper rod, clamped between two stands, positioned above a '
        'digital balance. Two identical magnets are mounted on a steel yoke with their opposite poles '
        'facing each other. The balance is zeroed. The yoke is then placed on the balance so that a '
        'horizontal uniform magnetic field is applied perpendicular to the copper rod; the rod lies '
        'between the two magnets. The ends of the rod are connected, through leads, to a circuit '
        'below: an ammeter, a switch and a variable d.c. supply in series. The supply&#8217;s longer '
        '(positive) plate is on the left, the side the switch and the ammeter are on, and the '
        'left-hand lead goes to the left-hand end of the rod.</p>')

MODEL = ('<p>The current <i>I</i> in the rod is varied. The balance reading <i>M</i><sub>1</sub> is '
         'recorded for different values of <i>I</i>. The switch is now opened. Two additional '
         'magnets, identical to those used before, are attached to the yoke (<b>Figure 12</b> shows '
         'two magnets on each arm of the yoke instead of one). The balance reading with four magnets '
         'attached to the yoke is <i>M</i><sub>2</sub>. With the switch open, <i>M</i><sub>2</sub> is '
         'the mass of the yoke and the four magnets. The switch is now closed. <i>M</i><sub>2</sub> '
         'is recorded for different values of <i>I</i>.</p>'
         '<p><b>Figure 13</b> shows data from both experiments. Values of <i>M</i><sub>1</sub> and '
         '<i>M</i><sub>2</sub> are plotted using different vertical axes: the solid line shows '
         '<i>M</i><sub>1</sub> (left-hand axis) and the dashed line shows <i>M</i><sub>2</sub> '
         '(right-hand axis).</p>')

EQN_M = ('<p>It can be shown that</p><p><i>M</i> = <i>kBI</i> + <i>nZ</i> + <i>Y</i></p>'
         '<p>where<br><i>M</i> = balance reading when the current is <i>I</i><br><i>B</i> = magnetic '
         'flux density of the horizontal uniform magnetic field<br><i>n</i> = number of magnets '
         'attached to the yoke<br><i>Z</i> = mass, in g, of each magnet<br><i>Y</i> = mass, in g, of '
         'the yoke<br><i>k</i> is a constant.</p>')

F2, F5, F7, F13 = fig2(), fig5(), fig7(), fig13()

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, accept)
Q = [
 ('1', '1', 1, 'short', ME, 'diagram', F2,
  MICRO + '<p>State, in mm, the resolution of the main scale.</p><p>resolution = ______ mm</p>',
  '(±) 0.5(0) mm, correct answer only.', '0.5 | 0.50 | 0.5 mm | 0.50 mm'),
 ('1', '2', 1, 'short', ME, 'diagram', F2,
  MICRO + '<p>What is the reading on the micrometer?</p><p>Tick (&#10003;) <b>one</b> box.</p>'
  '<ul><li>6.22 mm</li><li>6.72 mm</li><li>6.78 mm</li><li>8.22 mm</li></ul>',
  '6.72 mm (the second box).', '6.72 | 6.72 mm'),
 ('1', '3', 1, 'explain', ME, '', '',
  '<p>A wire <b>X</b> is placed in the gap between the anvil and the spindle.</p><p>State and '
  'explain how this gap is closed just before taking a reading of the diameter of <b>X</b>.</p>',
  'Use the ratchet (or the thimble and then the ratchet), with a valid justification. Justifications '
  'focus on what not using the ratchet can do: squeeze, crush or distort the wire / subject it to '
  'excessive force; change its diameter or shape; give a reading smaller than the true value; damage '
  'the mechanism or warp the frame. "Will over-tighten" is condoned. Neutral: "thimble then ratchet '
  'to save time" or "to get an accurate reading", "to make sure the wire is secure", "might change '
  'the reading", "cause a zero error", "a systematic error".', ''),
 ('1', '4', 2, 'calculation', EC, 'circuit', '',
  CIRCUITS + '<p>When the switch is closed, the voltmeter reading is 397 mV.</p><p>Show that, for '
  'the arrangement in <b>Figure 4</b>, the resistance <i>R</i> of the wire between the clips is '
  'about 0.5 Ω.</p>',
  'I = 0.931 / 1.2 (= 0.776 A), or R = 0.397 / their I (1); R = 0.51 Ω (2; 0.512 or 0.5117 '
  'condoned). Also credited for the first mark: 0.397/0.776 or 0.397/0.78 in working, '
  'R = 1.2 × 0.397/0.931, or a valid potential-divider approach.', ''),
 ('1', '5', 2, 'calculation', EC, 'graph', F5,
  FIG5_LEAD + '<p>Determine the resistance per metre of <b>X</b>.</p>'
  '<p>resistance per metre = ______ Ω m<sup>−1</sup></p>',
  'A continuous ruled best-fit line drawn on Figure 5, not passing above the centre of the 2nd point '
  'and below the centre of the 4th (1); the gradient evaluated as ΔR / ΔL with ΔR ≥ 0.2 Ω or '
  'ΔL ≥ 150 mm (1). Expect about 1.66 Ω m<sup>−1</sup>. No line on Figure 5 withholds both marks; '
  'powers-of-ten slips are not penalised.', ''),
 ('1', '6', 4, 'calculation', EC, 'table', '',
  '<p>Table 1 shows the resistance per metre of various metal wires. The diameter of <b>X</b> is one '
  'of the values of <i>d</i> shown in Table 1.</p>' + TABLE1 +
  '<p>Identify the metal used for <b>X</b>.</p><p>Go on to determine the resistivity of the '
  'metal.</p><p>State an appropriate SI unit for your answer.</p>'
  '<p>metal used for X = ______<br>resistivity = ______<br>SI unit = ______</p>',
  'Nichrome (correct answer only, and consistent with their 01.5 ΔR/ΔL) (4). ρ = (πd²/4) × ΔR/ΔL '
  'attempted with their gradient or the closest Table 1 value (1); ρ in range for their metal (2): '
  'nichrome 1.0 to 1.2 × 10<sup>−6</sup>, alumel 3.3 to 3.8 × 10<sup>−7</sup>, tungsten 5.4 to '
  '5.9 × 10<sup>−8</sup>, copper 1.6 to 1.8 × 10<sup>−8</sup> Ω m; correct power of ten and unit '
  'Ω m (3) — 1.1 × 10<sup>−3</sup> Ω mm is also accepted for nichrome. For nichrome, d = 0.93 mm with '
  '1.66 Ω m<sup>−1</sup> gives about 1.1 × 10<sup>−6</sup> Ω m.', ''),
 ('1', '7', 2, 'written', EC + ', ' + ME, 'graph', F5,
  FIG5_LEAD + '<p>A student adds error bars for <i>R</i> and <i>L</i> to each point on '
  '<b>Figure 5</b>. She estimates that</p><ul><li>each value of <i>R</i> has a percentage uncertainty '
  'of 6%</li><li>each value of <i>L</i> has an absolute uncertainty of 5 mm.</li></ul>'
  '<p>Compare her error bars for the point at <i>L</i> = 209 mm with her error bars for the point at '
  '<i>L</i> = 388 mm.</p>',
  'The horizontal (L) error bars are the same length — ±5 mm, 10 mm wide — for both points (1). A '
  'quantitative comment on the vertical (R) bars (1): about ±0.02 Ω (0.04 Ω tall) at L = 209 mm and '
  'about ±0.04 Ω (0.08 Ω tall) at L = 388 mm, or limits 0.329–0.371 and 0.614–0.692 Ω, or "the '
  'second is about twice the length of the first". An annotated sketch can earn both marks.', ''),
 ('1', '8', 2, 'explain', ME, '', '',
  '<p>Outline how error bars are used to determine the uncertainty in the gradient of a linear '
  'graph.</p>',
  'Any two of the maximum (steepest), minimum and best (mean) gradients are found using lines that '
  'pass through all the error bars (1); the uncertainty in the gradient is then the difference, e.g. '
  'm<sub>max</sub> − m<sub>best</sub>, m<sub>best</sub> − m<sub>min</sub>, or '
  '(m<sub>max</sub> − m<sub>min</sub>)/2 (1). Valid expressions for the fractional or percentage '
  'uncertainty are condoned.', ''),

 ('2', '1', 1, 'explain', EC, 'diagram', '',
  READING + '<p>Explain why the reading displayed in <b>Figure 6</b> shows that the ohm-meter is '
  'set to range C.</p>',
  'The reading is to 2 decimal places, or explains where the decimal point is (two digits before it, '
  'two after it, "XX.XX"). "Resolution shown is 0.01" is condoned. Rejected: "because of where the '
  'decimal point is", "reading is between the maximum and minimum for range C", "reading is 3 sf".',
  ''),
 ('2', '2', 2, 'calculation', EC, 'diagram', '',
  READING + '<p>The quantity <i>E</i><sub>V</sub> is a measure of the intensity of the light '
  'incident on the LDR. The SI unit of <i>E</i><sub>V</sub> is the lux (lx).</p><p>The resistance '
  '<i>R</i> of the LDR is given by</p><p>log(<i>R</i> / Ω) = −0.772 log(<i>E</i><sub>V</sub> / lx) + '
  '5.09</p><p>Show that <i>E</i><sub>V</sub> for the arrangement shown in <b>Figure 6</b> is about '
  '130 lx.</p>',
  'A valid attempt using R = 2840 Ω — log 2840 = 3.45(3) (1); E<sub>V</sub> = 132 lx (2). Using 2.84 '
  '(giving 1.01 × 10<sup>6</sup> lx) or ln 2840 (giving 2.46 × 10<sup>−2</sup> lx) scores 1 mark.',
  ''),
 ('2', '3', 2, 'explain', ME, 'graph', F7,
  FIG7_LEAD + '<p>Describe a method to show that <b>Figure 7</b> confirms this relationship.</p>'
  '<p>You do not need to show any calculations.</p>',
  'Read off at least three different points from the line (1); calculate E<sub>V</sub> × x² for each '
  'and show the values are the same / close / the differences are small (1). Or: plot log E<sub>V</sub> '
  'against log x (1) and show the gradient is about −2 (1); or plot E<sub>V</sub> against 1/x² (1) '
  'and show it is a straight line through the origin (1).', ''),
 ('2', '4', 2, 'calculation', ME, 'graph', F7,
  FIG7_LEAD + '<p>Deduce the value of <i>x</i> when <i>E</i><sub>V</sub> = 130 lx.</p>'
  '<p>x = ______ mm</p>',
  'x in the range 634 to 639 mm (2); a result in 627 to 646 mm scores 1 (630 and 640 accepted for '
  'that mark, 6.3 × 10² and 6.4 × 10² not). The curve stops at 450 mm, so the answer comes from '
  'E<sub>V</sub>x² being constant.', '634 to 639'),
 ('2', '5', 2, 'calculation', ME, 'diagram', '',
  '<p><i>R</i> is measured when <i>x</i> = 450 mm. <b>Figure 8</b> shows how the ohm-meter displays '
  'the values of <i>R</i> when set to range B and when set to range C: range B displays '
  '<b>1681</b> and range C displays <b>01.68</b>.</p><p>The uncertainty of the reading on the '
  'ohm-meter is ±2% of the displayed reading plus ±2 in the least significant digit.</p>'
  '<p>This means that:</p><ul><li>using range B the maximum value of <i>R</i> is 1.02 × 1681 + 2 = '
  '1717 Ω</li><li>using range C the minimum value of <i>R</i> is 0.98 × 1.68 – 0.02 = 1.63 kΩ.</li>'
  '</ul><p>Complete <b>Table 3</b>.</p>' + TABLE3 + '<p>Go on to explain whether range B or range C '
  'should be used to measure <i>R</i>.</p>',
  'Table 3: range B minimum 1645 Ω, range C maximum 1.73 kΩ (both needed) (1). Range B should be used '
  'because its range of possible values (or percentage difference between max and min R) is smaller '
  '— a valid quantitative comparison, e.g. range B spans 72 Ω (±36 Ω, about 4 %, ≈2 % uncertainty) '
  'against range C 100 Ω (±50 Ω, about 6 %, ≈3 %) (1); ECF from their table. "Resolution is smaller" '
  'is allowed; "more precise", "more accurate" or "smaller percentage uncertainty" alone are neutral.',
  ''),
 ('2', '6', 2, 'written', ME, 'diagram', '',
  SLIDES + '<p>The positions of the lamp and the LDR are not changed during the experiment.</p>'
  '<p>Identify <b>two</b> other control variables.</p><p>1 ______<br>2 ______</p>',
  'Any two of: the light level / background lighting in the room (keep a blackout) (1); the voltage '
  'across, current in, power or brightness of the lamp (1); the thickness of the glass slides — or '
  'their transparency, opacity or colour; "slides must be clean" is condoned (1). Neutral: '
  'temperature, μ, refractive index, density or "type" of glass, size or area of slides, the distance '
  'between lamp and LDR, the ohm-meter setting.', ''),
 ('2', '7', 2, 'explain', ME, '', '',
  EQN_EV + '<p>Explain how <i>μ</i> can be determined from a linear graph.</p>',
  'Plot ln E<sub>V</sub> against N — or it is implied by comparing ln E<sub>V</sub> = −μN + ln 400 '
  'with y = mx + c (1); μ is −(gradient) (1). Also accepted: plot log E<sub>V</sub> against N, and '
  'μ = −gradient / log e.', ''),
 ('2', '8', 2, 'calculation', ME, '', '',
  EQN_EV + '<p>In an experiment <i>μ</i> = 9.0 × 10<sup>−2</sup></p><p>Deduce the minimum number of '
  'slides needed to reduce <i>E</i><sub>V</sub> by 50%.</p><p>number of slides = ______</p>',
  '8 slides, correct answer only (2). Evidence of a workable method giving N½ ≈ 7.7 — ln 0.5 = '
  '−9.0 × 10<sup>−2</sup> N½, or trial and improvement — or an integer appropriate to their value '
  '(1).', '8 | 8 slides'),

 ('3', '1', 3, 'written', EM, 'diagram', '',
  '<p><b>Figure 10</b> shows a copper rod clamped above a horizontal bench: the rod runs between two '
  'clamp stands whose bases stand on the bench.</p><p>Describe a method to show that the copper rod '
  'is horizontal.</p><p>Your method must include the use of a metre ruler.</p><p>You may annotate '
  '<b>Figure 10</b>.</p>',
  'Use the ruler to measure the height from the bench to the rod at (at least) two different points '
  '(1); explain how the ruler is made vertical — a set-square in contact with the bench and the '
  'upright ruler, or a spirit level, T-square, plumb line or large protractor (1); check the heights '
  'are the same (1, contingent on the first). Or: a metre ruler placed on the rod with a spirit level '
  'on the ruler and no gap between ruler and rod (2), checking the bubble is central (1). Or: the '
  'metre ruler on top of nested set-squares, with no gaps, compared with the rod (2), the lower '
  'set-square in contact with the bench (1).', ''),
 ('3', '2', 3, 'explain', EM, 'circuit', '',
  YOKE + '<p>When the switch is open, the reading on the balance shows the mass of the yoke and the '
  'two magnets.</p><p>When the switch is closed, the reading on the balance decreases.</p>'
  '<p>Explain, with reference to <b>Figure 11</b>, the direction of the horizontal magnetic field.</p>',
  'The force on the rod is downwards (1); the current in the rod is from left to right (1); so by '
  'Fleming\'s left-hand rule the field is out of the page (1). The third mark needs a force up or down '
  'and a current left or right to have been stated; a reversed force or a reversed current with a '
  'correct left-hand-rule deduction from it scores 2.', ''),
 ('3', '3', 3, 'calculation', EM, '', '',
  EQN_M + '<p>Deduce the fundamental base units for <i>k</i>.</p>'
  '<p>fundamental base units = ______</p>',
  's<sup>2</sup> (3). MAX 2 from: any valid expression showing homogeneity — kBI has units of mass, '
  'e.g. k ≡ kg T<sup>−1</sup> A<sup>−1</sup>; B = F/IL (or BI = F/L); the base units of F are '
  'kg m s<sup>−2</sup>. The correct units earn 3 marks unless incorrect working is seen.', ''),
 ('3', '4', 3, 'calculation', EM, 'graph', F13,
  MODEL + EQN_M + '<p>Determine <i>Y</i>.</p><p>Y = ______ g</p>',
  'Y = 87.85 g (± 0.1 g; to at least 1 dp — 87.8 or 87.9 allowed) (3, contingent on the first mark). '
  'Two vertical intercepts recorded to 2 dp, at least one correct to ± 0.05 g: M₁ intercept '
  '134.85 g, M₂ intercept 181.85 g (or M₁ and M₂ read at the same I) (1); two valid equations — '
  '134.85 = 2Z + Y and 181.85 = 4Z + Y — or Y = 2 × (M₁ intercept) − (M₂ intercept) (1).',
  '87.75 to 87.95'),
 ('3', '5', 3, 'explain', EM, 'graph', F13,
  MODEL + EQN_M + '<p>A student sets up the apparatus with the copper rod positioned incorrectly. '
  '<b>Figure 14</b> shows how the student&#8217;s arrangement compares with the correct arrangement: '
  'in the correct arrangement the rod sits between the two magnets; in the student&#8217;s it sits '
  'higher, level with the tops of the yoke&#8217;s arms, above the magnets.</p><p>The student '
  'produces a graph of <i>M</i><sub>1</sub> against <i>I</i>.</p><p>Compare the student&#8217;s graph '
  'with the graph of <i>M</i><sub>1</sub> against <i>I</i> (the solid line) in <b>Figure 13</b>.</p>'
  '<p>Explain your answer.</p>',
  'B (the flux density at the rod) is less (1); the intercept is the same because it is the mass of '
  'the yoke and magnets, 2Z + Y, which does not change (1); the line is less steep — the gradient '
  'is kB, so less change in balance reading (force) per unit current (1). Stating "less steep and '
  'same intercept" without explanation scores 2. B = 0 (gradient zero, same intercept) scores the '
  'first and second marks.', ''),
]

PER_QUESTION = {'1': 15, '2': 15, '3': 15}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 45, 'the cover says 45 and these sum to %d' % sum(got.values())

# ---- every intermediate the scheme prints, recomputed ----
I = 0.931 / 1.2
assert round(I, 3) == 0.776 and round(0.397 / I, 2) == 0.51 and round(0.397 / I, 4) == 0.5117   # 01.4
n = len(FIG5); mx = sum(x for x, y in FIG5) / n; my = sum(y for x, y in FIG5) / n
grad = sum((x - mx) * (y - my) for x, y in FIG5) / sum((x - mx) ** 2 for x, y in FIG5) * 1000
assert abs(grad - 1.66) < 0.03, grad                                                       # 01.5
nearest = min(((abs(v - grad), m, d) for d, row in ((0.38, (0.151, 0.504, 3.15, 9.73)),
             (0.93, (0.0247, 0.0824, 0.515, 1.59)), (1.63, (0.00805, 0.0268, 0.168, 0.518)),
             (2.08, (0.00494, 0.0165, 0.103, 0.318)), (3.66, (0.00160, 0.00532, 0.0333, 0.103)))
             for v, m in zip(row, ('copper', 'tungsten', 'alumel', 'nichrome'))))
assert nearest[1:] == ('nichrome', 0.93)                                                   # 01.6
rho = math.pi * (0.93e-3) ** 2 / 4 * 1.66
assert 1.0e-6 <= rho <= 1.2e-6 and round(rho / 1e-3 * 1e6 / 1e3, 1) == 1.1                 # Ω mm too
assert round(0.350 * 0.94, 3) == 0.329 and round(0.350 * 1.06, 3) == 0.371                 # 01.7
assert round(0.653 * 0.94, 3) == 0.614 and round(0.653 * 1.06, 3) == 0.692
assert round(0.350 * 0.06, 2) == 0.02 and round(0.653 * 0.06, 2) == 0.04
assert round(math.log10(2840), 3) == 3.453                                                  # 02.2
assert round(10 ** ((5.09 - math.log10(2840)) / 0.772)) == 132
k7 = [e * x * x for x, e in FIG7]
kbar = sum(k7) / len(k7)
assert max(abs(v / kbar - 1) for v in k7) < 0.015                                          # 02.3
assert 634 <= math.sqrt(kbar / 130) <= 639                                                 # 02.4
assert round(0.98 * 1681 - 2) == 1645 and round(1.02 * 1.68 + 0.02, 2) == 1.73              # 02.5
assert 1717 - 1645 == 72 and round((1.73 - 1.63) * 1000) == 100
assert round(math.log(2) / 9.0e-2, 1) == 7.7 and math.ceil(math.log(2) / 9.0e-2) == 8       # 02.8
assert 400 * math.exp(-0.09 * 8) <= 200 < 400 * math.exp(-0.09 * 7)
# 03.3: M = kBI, T = kg s^-2 A^-1, so k = kg / (kg s^-2 A^-1 · A) = s^2 — exponents (kg, s, A)
T_units = (1, -2, -1)
k_units = tuple(m - t - a for m, t, a in zip((1, 0, 0), T_units, (0, 0, 1)))
assert k_units == (0, 2, 0)
assert round(2 * 134.85 - 181.85, 2) == 87.85                                               # 03.4
assert round(M2[0][1] - M1[0][1], 2) == 47.0                                                # 2Z = 47.0 g
d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() == 0 and (d.year, d.month, d.day) == (2024, 6, 17)                      # cover: Monday

ROWS = [dict(DOC, row_id='D-' + PAPER, kind='document', total_marks='45',
             needs='Calculator, Ruler, Protractor, Equation booklet',
             source_url='https://drive.google.com/file/d/%s/view' % QP)]
ROWS.append(dict(DOC, row_id='Q-AQA-7408-2406-3A-01', kind='preamble', question='1', section='A',
                 html='<p>This question is based on a method to determine the resistivity of a wire '
                      '(required practical activity 5).</p>', topics=EC))
ROWS.append(dict(DOC, row_id='Q-AQA-7408-2406-3A-02', kind='preamble', question='2', section='A',
                 html=OHM, topics=EC))
ROWS.append(dict(DOC, row_id='Q-AQA-7408-2406-3A-03', kind='preamble', question='3', section='A',
                 html='<p>This question is about a method to investigate how the force on a conductor '
                      'varies with flux density and current (required practical activity 10).</p>',
                 topics=EM))
for q, part, marks, atype, topics, figure, diagram, html, answer, accept in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-7408-2406-3A-%02d%s' % (int(q), part), kind='question',
             question=q, part=part, section='A', marks=str(marks), html=html,
             answer=answer, answer_type=atype, topics=topics, figure=figure,
             diagram=diagram, diagram_by=('family' if diagram else ''), placeholder='',
             accept=accept)
    ROWS.append(r)
