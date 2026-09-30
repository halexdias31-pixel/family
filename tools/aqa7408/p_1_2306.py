"""AQA A-level Physics 7408/1 — Paper 1 — June 2023.

Every answer is READ OFF AQA's own scheme, `Mark scheme (A-level) _ Paper 1 - June 2023` (its cover
says A-level Physics 7408/1, June 2023, Version 1.0 Final, and every value in it — 1114.66875 MeV in
01.4, 4.73 s in 02.1, 450 m s⁻¹ read off Figure 1, 4.76 Ω in 03.2, 1.18 m in 05.4 — is this
paper's). The 2017 Highers are why that is the rule and not a preference.

The cover says 85 marks — Section A (questions 01 to 06) and Section B, twenty-five one-mark
multiple-choice questions 07 to 31. The Question-mark boxes down the pages say 6, 10, 11, 14, 10, 9
and 25. All of it is asserted below, and so is every intermediate the scheme prints.

The cover prints the date: Wednesday 24 May 2023 (afternoon). So `month` is 5 — check-library.js
compares `exam_date` against `month` on the same row — and the name keeps AQA's series, June 2023.

EVERY FIGURE IN THIS PDF IS A RASTER IMAGE with no text layer and no vectors, so:
  * Figure 1 (02.2–02.4, speed against distance) carries the data three parts are answered from.
    Its gridlines were found by their regular spacing in the embedded 1982 × 1171 image (x: 0 at
    px 302, 16 000 m at 1908; y: 0 at px 1036, 500 m s⁻¹ at 32) and the curve traced as the dark
    pixels in each column. The scheme's own readings come straight back off the trace — 450 m s⁻¹
    at 5600 m, a peak of 470 ± 5 m s⁻¹ — and are asserted below.
  * Figure 11 (05.1, stress against strain) the same way (1245 × 991; strain 0 at px 406.5, 15 at
    1114.5; stress 0 at px 835.5, 150 MPa at 127). The scheme's 105 MPa at 7.5 × 10⁻⁴ lies on it.
  * The displacement–time graph of 14 and the force–time graph of 25 are printed on exact
    gridlines — a sine of amplitude 1.5 cm and period 6 ms; 10 N to 0.5 s then 20 N to 1.0 s — so
    their numbers determine them and they are drawn.
  * Figures 2, 6, 7, 8, 9 and 10 are shapes the paper's own words fix: a series circuit, blank
    pd–position axes with P, Q, R and B marked where the paper marks them (the pen goes on these
    for 03.4), the Porro prism and its ray at normal incidence, the prism with the ray only as far
    as the paper draws it (04.3 asks the student to finish it), and the two alternative prisms.
  * Everything else — the variable resistor and potential-divider circuit, the lighting beam, the
    floating pencil, the ship, the Feynman diagram, the ring patterns, the trapdoor, the cable
    graphs, the terminal boxes, the discs, the banked aircraft, the springs — is described in the
    question's own words and carries `figure`, without saying what the answer is.
"""
import datetime, math, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from svgplot import W, axes

PAPER = 'P-AQA-7408-2306-1'
QP = '1Nhv0FTtMnNITzPvDqZUPeHPrr0374IiL'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS5', band_type='stage',
           band_value='A-Level', level='Alevel', company='AQA', exam_board='AQA',
           spec_code='7408/1', exam_wave='First wave', year='2023', month='5', paper='1',
           exam_date='2023-05-24', document_type='Past paper',
           name='Paper 1 — June 2023', active='True', trackable='True', printable='False')

PART = 'Particles & Radiation'
WAVE = 'Progressive & Stationary Waves'
MECH = 'Mechanics & Materials'
CIRC = 'Electric Circuits'
SHM = 'Circular & Periodic Motion'
MEAS = 'Measurements & Their Errors'

LINE = 'fill="none" stroke="currentColor" stroke-width="1.4"'

# ---------------------------------------------------------------------------------------------
# FIGURE 1 — measured (module note). distance / m, speed / m s⁻¹.
# ---------------------------------------------------------------------------------------------
FIG1 = [(0, 0), (160, 13), (320, 26), (480, 39), (640, 51), (800, 64), (960, 77), (1120, 90),
        (1280, 103), (1430, 115), (1590, 128), (1750, 141), (1910, 154), (2070, 167), (2230, 180),
        (2390, 192), (2550, 205), (2710, 218), (2870, 231), (3030, 243), (3190, 256), (3350, 269),
        (3510, 282), (3670, 295), (3830, 308), (3990, 320), (4140, 333), (4300, 346), (4460, 359),
        (4620, 372), (4780, 384), (4940, 397), (5100, 410), (5260, 423), (5420, 436), (5580, 448),
        (5740, 456), (5900, 461), (6060, 463), (6220, 465), (6380, 466), (6540, 468), (6690, 469),
        (6850, 470), (7010, 471), (7170, 471), (7330, 471), (7490, 471), (7650, 470), (7810, 469),
        (7970, 468), (8130, 463), (8290, 455), (8450, 448), (8610, 442), (8770, 434), (8930, 422),
        (9090, 409), (9250, 398), (9400, 389), (9560, 382), (9720, 375), (9880, 368), (10040, 358),
        (10200, 346), (10360, 338), (10520, 331), (10680, 325), (10840, 318), (11000, 312),
        (11160, 305), (11320, 298), (11480, 291), (11640, 283), (11800, 274), (11960, 263),
        (12110, 249), (12270, 232), (12430, 216), (12590, 200), (12750, 185), (12910, 163),
        (13070, 148), (13230, 136), (13390, 127), (13550, 120), (13710, 112), (13870, 102),
        (14030, 90), (14190, 74), (14350, 56), (14510, 43), (14670, 29), (14820, 16), (14980, 3)]

# FIGURE 11 — measured. strain / 10⁻⁴, stress / MPa. The curve stops where the metal fractures.
FIG11 = [(0, 0), (0.5, 7.2), (1.01, 14.3), (1.51, 21.4), (2.02, 28.5), (2.53, 35.6), (3.04, 42.7),
         (3.55, 49.8), (4.06, 56.8), (4.57, 63.8), (5.07, 70.9), (5.58, 78), (6.09, 85.1),
         (6.6, 92.1), (7.11, 99.2), (7.62, 106.2), (8.12, 113.2), (8.63, 119.7), (9.14, 125.9),
         (9.65, 131.6), (10.16, 136.8), (10.67, 141.4), (11.18, 145.8), (11.68, 149.8),
         (12.19, 153.4), (12.68, 156.4)]


def curve(pts):
    def extra(sx, sy):
        return ('<polyline points="%s" %s/>'
                % (' '.join('%.1f,%.1f' % (sx(x), sy(y)) for x, y in pts), LINE))
    return extra


def fig1():
    return axes(16000, 500, 4000, 50, 'distance / m', 'speed / m s⁻¹',
                'Figure 1: speed against distance for the car, rising in a straight line from the '
                'origin, levelling off near the top, then falling back to zero by about 15 000 m',
                curve(FIG1), xminor=400, yminor=10)


def fig11():
    return axes(17.5, 175, 5, 50, 'strain / 10⁻⁴', 'stress / MPa',
                'Figure 11: stress against strain for the metal up to fracture — a straight line '
                'from the origin that curves over a little before it ends',
                curve(FIG11), xminor=0.5, yminor=5)


def fig14():
    pts = [(t / 20.0, 1.5 * math.sin(2 * math.pi * (t / 20.0) / 6.0)) for t in range(121)]
    return axes(6, 2, 1, 0.5, 'time / ms', 'displacement / cm',
                'Displacement against time for a point on the string: one full sine cycle from 0 '
                'to 6 ms, peak 1.5 cm at 1.5 ms and trough −1.5 cm at 4.5 ms',
                lambda sx, sy: ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>'
                                % (sx(0), sy(0), sx(6), sy(0))) + curve(pts)(sx, sy),
                ymin=-2, xminor=1, yminor=0.5)


def fig25():
    step = [(0, 10), (0.5, 10), (0.5, 20), (1.0, 20), (1.0, 0)]
    return axes(1.2, 20, 0.5, 10, 't / s', 'F / N',
                'Force against time: 10 N from 0 to 0.5 s, then 20 N from 0.5 s to 1.0 s, then zero',
                curve(step), xminor=0.1, yminor=10)


def fig2():
    o = ['<svg viewBox="0 0 %d 150" role="img" aria-label="Figure 2: a cell of emf ε in series '
         'with two resistors R1 and R2; the pd across R1 is V1 and across R2 is V2">' % W]
    o.append('<polyline points="165,40 70,40 70,100 110,100" %s/>' % LINE)
    o.append('<polyline points="175,40 270,40 270,100 230,100" %s/>' % LINE)
    o.append('<line x1="165" y1="30" x2="165" y2="50" stroke="currentColor" stroke-width="1.4"/>')
    o.append('<line x1="175" y1="35" x2="175" y2="45" stroke="currentColor" stroke-width="3"/>')
    o.append('<text x="170" y="22" class="lbl" style="text-anchor:middle"><tspan font-style="italic">ε</tspan></text>')
    o.append('<rect x="110" y="92" width="40" height="16" %s/>' % LINE)
    o.append('<rect x="190" y="92" width="40" height="16" %s/>' % LINE)
    o.append('<line x1="150" y1="100" x2="190" y2="100" stroke="currentColor" stroke-width="1.4"/>')
    o.append('<text x="130" y="104" class="lbl" style="text-anchor:middle">R₁</text>')
    o.append('<text x="210" y="104" class="lbl" style="text-anchor:middle">R₂</text>')
    for x0, x1, lab in ((105, 155, 'V₁'), (185, 235, 'V₂')):
        o.append('<line x1="%d" y1="122" x2="%d" y2="122" stroke="currentColor" stroke-width="1"/>' % (x0, x1))
        o.append('<polyline points="%d,118 %d,122 %d,126" fill="none" stroke="currentColor" stroke-width="1"/>' % (x0 + 5, x0, x0 + 5))
        o.append('<polyline points="%d,118 %d,122 %d,126" fill="none" stroke="currentColor" stroke-width="1"/>' % (x1 - 5, x1, x1 - 5))
        o.append('<text x="%d" y="140" class="lbl" style="text-anchor:middle"><tspan font-style="italic">%s</tspan></text>' % ((x0 + x1) // 2, lab))
    return ''.join(o) + '</svg>'


def fig6():
    # the paper's axes (px on the rendered page): A 199, P 429, Q 528, R 630, B 669; 0 V at y 1117,
    # 3.0 V at 778, top of the axis 733. One scale, s, maps them all.
    s = 250 / 470.0
    X = lambda px: 60 + (px - 199) * s
    Y = lambda py: 14 + (py - 733) * s
    B, top = Y(1117), Y(733)
    o = ['<svg viewBox="0 0 %d %d" role="img" aria-label="Figure 6: blank axes of pd in volts '
         '(0 V to 3.0 V) against the position of C, with A at the origin and P, Q, R and B marked '
         'by dashed vertical lines">' % (W, int(B + 40))]
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>' % (X(199), top, X(199), B))
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>' % (X(199), B, X(695), B))
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1" '
             'stroke-dasharray="4 3"/>' % (X(199), Y(778), X(680), Y(778)))
    for px, lab in ((429, 'P'), (528, 'Q'), (630, 'R'), (669, 'B')):
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width="1" '
                 'stroke-dasharray="4 3"/>' % (X(px), top, X(px), B))
        o.append('<text x="%.1f" y="%.1f" class="lbl" style="text-anchor:middle">%s</text>' % (X(px), B + 14, lab))
    o.append('<text x="%.1f" y="%.1f" class="lbl" style="text-anchor:middle">A</text>' % (X(199), B + 14))
    o.append('<text x="%.1f" y="%.1f" class="num" style="text-anchor:end">3.0 V</text>' % (X(199) - 4, Y(778) + 4))
    o.append('<text x="%.1f" y="%.1f" class="num" style="text-anchor:end">0 V</text>' % (X(199) - 4, B + 4))
    o.append('<text x="%.1f" y="%.1f" class="ax" style="text-anchor:middle">position of C</text>'
             % ((X(199) + X(669)) / 2, B + 32))
    o.append('<text x="12" y="%.1f" class="ax" style="text-anchor:middle" transform="rotate(-90 12 %.1f)">'
             'pd / V</text>' % ((top + B) / 2, (top + B) / 2))
    return ''.join(o) + '</svg>'


def prism(o, ax, ay, h, fill=True):
    """A right-angled isosceles prism: apex (ax, ay), longest side horizontal h below it."""
    o.append('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor" fill-opacity=".12" '
             'stroke="currentColor" stroke-width="1.2"/>' % (ax, ay, ax - h, ay + h, ax + h, ay + h))


def arrow(o, x, y, dx, dy):
    L = math.hypot(dx, dy); ux, uy = dx / L, dy / L
    o.append('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor"/>'
             % (x + 5 * ux, y + 5 * uy, x - 3 * ux - 3 * uy, y - 3 * uy + 3 * ux,
                x - 3 * ux + 3 * uy, y - 3 * uy - 3 * ux))


def fig7():
    o = ['<svg viewBox="0 0 %d 210" role="img" aria-label="Figure 7: a right-angled isosceles '
         'Porro prism with its longest side at the bottom; a ray enters that side at normal '
         'incidence, reflects horizontally off one shorter side, reflects down off the other and '
         'leaves through the longest side">' % W]
    prism(o, 170, 20, 130)
    xin, y1 = 106.6, 150 - (106.6 - 40)
    xout = 300 - (150 - y1)
    o.append('<polyline points="%.1f,200 %.1f,%.1f %.1f,%.1f %.1f,200" %s/>'
             % (xin, xin, y1, xout, y1, xout, LINE))
    arrow(o, xin, 172, 0, -1)
    o.append('<polyline points="%.1f,150 %.1f,143 %.1f,143" fill="none" stroke="currentColor" '
             'stroke-width="1"/>' % (xin + 7, xin + 7, xin))
    return ''.join(o) + '</svg>'


def fig8():
    o = ['<svg viewBox="0 0 %d 215" role="img" aria-label="Figure 8, not to scale: the prism with a '
         'ray entering the longest side at angle of incidence θ to the dashed normal, refracting '
         'up to one shorter side and reflecting across to the other shorter side, where the '
         'drawing stops">' % W]
    prism(o, 170, 20, 130)
    xe = 106.4
    o.append('<line x1="%.1f" y1="109" x2="%.1f" y2="202" stroke="currentColor" stroke-width="1" '
             'stroke-dasharray="4 3"/>' % (xe, xe))
    o.append('<polyline points="89.1,203 %.1f,150 117.4,72.6 205.2,55.2" %s/>' % (xe, LINE))
    arrow(o, 94.0, 188, 17.3, -53)
    o.append('<text x="84" y="170" class="lbl" style="text-anchor:end"><tspan font-style="italic">θ</tspan></text>')
    o.append('<text x="330" y="16" class="lbl" style="text-anchor:end">not to scale</text>')
    return ''.join(o) + '</svg>'


def fig9_10():
    o = ['<svg viewBox="0 0 %d 150" role="img" aria-label="Figure 9: an equilateral triangular '
         'prism. Figure 10: a right-angled isosceles prism of the original shape">' % W]
    o.append('<polygon points="85,25 30,120 140,120" fill="currentColor" fill-opacity=".2" '
             'stroke="currentColor" stroke-width="1.2"/>')
    o.append('<polygon points="250,40 170,120 330,120" fill="currentColor" fill-opacity=".08" '
             'stroke="currentColor" stroke-width="1.2"/>')
    o.append('<text x="85" y="142" class="lbl" style="text-anchor:middle">Figure 9</text>')
    o.append('<text x="250" y="142" class="lbl" style="text-anchor:middle">Figure 10</text>')
    return ''.join(o) + '</svg>'


# ---------------------------------------------------------------------------------------------
# Preambles — one stem several parts hang from.
# ---------------------------------------------------------------------------------------------
PRE = {
 '1': ('<p>The neutral lambda particle &Lambda;<sup>0</sup> is a baryon with a strangeness of '
       '&minus;1</p><p>One possible decay for a &Lambda;<sup>0</sup> is</p>'
       '<p style="text-align:center">&Lambda;<sup>0</sup> &rarr; &pi;<sup>0</sup> + n</p>', '', ''),
 '2': ('<p>In 2021 the world land speed record was 1230 km h<sup>&minus;1</sup>.</p><p>This was the '
       'average speed achieved by a jet-powered car in two runs. Each run was measured over a '
       'distance of 1.61 km.</p><p>(From 02.2 on.) Engineers are designing a new jet-powered car to '
       'break this record. <b>Figure 1</b> shows the variation of speed with distance for the car, as '
       'predicted by the engineers.</p>', 'graph', fig1()),
 '3': ('<p><b>Figure 3</b> shows a variable resistor made with a thin conducting layer on an '
       'insulating base: a strip with connections at its ends <b>A</b> and <b>B</b>, and a sliding '
       'contact <b>C</b> that can move along the surface of the layer between them.</p>'
       '<p>The conducting layer has constant width and thickness and has connections at the ends '
       '<b>A</b> and <b>B</b>. <b>C</b> is a sliding contact that can move along the surface of the '
       'conducting layer between <b>A</b> and <b>B</b>.</p>'
       '<p><b>Figure 4</b> shows a circuit that uses the variable resistor as a potential divider: '
       'a battery (emf 3.00 V, internal resistance <i>r</i>) and a switch in series with the whole '
       'resistor A–B, and a digital voltmeter connected between the sliding contact C and end '
       'A.</p><p>The variable resistor is connected to a battery of emf 3.00 V and internal '
       'resistance <i>r</i>. The resistance of the conducting layer between <b>A</b> and <b>B</b> '
       'is 125 &Omega;.</p>', 'diagram', ''),
 '4': ('<p>Porro prisms are used in binoculars to reverse the path of the light. The prism is in '
       'the shape of a right-angled isosceles triangle.</p><p><b>Figure 7</b> shows a ray of light, '
       'at normal incidence on the longest side, passing through a glass Porro prism.</p>'
       '<p>The critical angle for light in the prism is 41.5&deg;.</p>', 'diagram', fig7()),
 '5': ('<p><b>Figure 11</b> shows the stress&ndash;strain graph for a metal in tension up to the '
       'point at which it fractures.</p>', 'graph', fig11()),
 '6': ('<p>A pencil is weighted with a thin coil of wire. The volume of the wire is negligible. '
       '<b>Figure 14</b> shows the pencil and wire floating upright in equilibrium in water, with a '
       'length <i>l</i> of the pencil below the surface. <b>Figure 15</b> shows it pushed down a '
       'further distance <i>y</i>, with an upward force <i>F</i> acting on it.</p>'
       '<p>In <b>Figure 14</b> the combined weight of the pencil and wire is equal to an upwards '
       'force called the buoyancy force. The length of the pencil that is submerged is <i>l</i>. '
       'A student pushes the pencil down through a displacement <i>y</i> as shown in '
       '<b>Figure 15</b>. The buoyancy force is now greater than the weight.</p><p>There is a '
       'resultant upward force <i>F</i> acting on the pencil when the student releases it. The '
       'magnitude of <i>F</i> for any value of <i>y</i> is given by</p>'
       '<p style="text-align:center"><i>F</i> = <i>A&rho;gy</i></p><p>where <i>A</i> is the '
       'cross-sectional area of the pencil, <i>&rho;</i> is the density of water and <i>g</i> is '
       'the acceleration due to gravity.</p><p>The pencil is pushed down and released. The pencil '
       'then oscillates vertically about the equilibrium position.</p>', 'diagram', ''),
}

SHIP = ('<p>A ship floating in the sea can be modelled by the pencil floating in water. The ship '
        'can oscillate vertically. These oscillations are called heave oscillations.</p><p>Wave '
        'motion causes forced oscillations of the ship. Under certain conditions, heave resonance '
        'may then occur.</p>')

BEAM = ('<p>The unloaded length of each steel wire was 1.20 m before it was attached to <b>AB</b>. '
        '<b>AB</b> is horizontal.</p><p>mass of <b>AB</b> = 4.4 kg<br>mass of lamp = 16.0 kg<br>'
        'distance between wires = 2.00 m<br>diameter of each wire = 0.800 mm<br>Young modulus of '
        'steel = 2.10 &times; 10<sup>11</sup> Pa</p>')


def mc(stem, opts, table=None):
    """Four printed options. `table` gives column headings when the options are rows of a table."""
    if table:
        h = '<table><tr><th></th>' + ''.join('<th>%s</th>' % t for t in table) + '</tr>'
        for k, row in zip('ABCD', opts):
            h += '<tr><td><b>%s</b></td>' % k + ''.join('<td>%s</td>' % c for c in row) + '</tr>'
        return stem + h + '</table>'
    return stem + '<p>' + '<br>'.join('<b>%s</b> %s' % (k, o) for k, o in zip('ABCD', opts)) + '</p>'


MS = '&nbsp;m&nbsp;s<sup>&minus;1</sup>'

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, accept)
Q = [
 ('1', '1', 1, 'short', PART, '', '',
  '<p>Deduce the quark structure of a &Lambda;<sup>0</sup>.</p>',
  'uds (any order). A capital D for d is not accepted, and extra particles are penalised.', ''),
 ('1', '2', 2, 'explain', PART, '', '',
  '<p>State and explain which interaction is involved in this decay.</p>',
  'The weak interaction (1); because strangeness changes in this decay — from −1 to 0 — and '
  'strangeness can only change in a weak interaction (1). "Strangeness is not conserved (in this '
  'decay)" is accepted and "strangeness is lost" condoned. Negative arguments ("strangeness is '
  'conserved in a strong interaction") and the idea that strangeness ALWAYS changes in a weak '
  'interaction are rejected; a general statement about strangeness in the weak interaction on its '
  'own is not enough.', ''),
 ('1', '3', 1, 'short', PART, '', '',
  '<p>An antiparticle of the neutral lambda particle decays into a neutral pion and particle '
  '<b>X</b>.</p><p>Identify <b>X</b>.</p>',
  'An antineutron (n̄ accepted). Ambiguous answers are rejected unless supported, and an answer '
  'solely in terms of quarks is not accepted.', ''),
 ('1', '4', 1, 'calculation', PART, '', '',
  '<p>The rest energy of a &Lambda;<sup>0</sup> is equal to the energy of a photon with a frequency '
  'of 2.69 &times; 10<sup>23</sup> Hz.</p><p>Determine, in MeV, the rest energy of a '
  '&Lambda;<sup>0</sup>.</p><p>rest energy = ______ MeV</p>',
  '1.1(1) × 10³ MeV. E = hf, then divided by 1.60 × 10⁻¹³ J per MeV; the calculator value is '
  '1114.66875 MeV. 1100 (2 sf), 1110 (3 sf) and 1115 (4 sf) are accepted; incorrectly rounded '
  'answers are rejected.',
  '1100 | 1110 | 1115 | 1114.7 | 1114.67 | 1.1 × 10^3 | 1.11 × 10^3 | 1.1x10^3 | 1.11x10^3'),
 ('1', '5', 1, 'written', PART, '', '',
  '<p>The discovery of particles such as the &Lambda;<sup>0</sup> is made by large international '
  'research teams.</p><p>Suggest <b>one</b> reason for this.</p>',
  'Any one of: the research is expensive / needs funding from many countries; both scientists and '
  'engineers are needed because the machines are complex, large pieces of civil engineering; the '
  'research is multi-disciplinary (computation, theory and so on); it runs round the clock, so '
  'large teams work shifts; people are needed to process the large amounts of data produced. Peer '
  'review is neutral (it argues for independent teams); "avoids bias" and "reproducibility" are '
  'not accepted.', ''),

 ('2', '1', 2, 'calculation', MECH, '', '',
  '<p>The average speed for one of these runs was 343' + MS + '.</p><p>Calculate, in s, the time '
  'taken for the car to complete the other run.</p><p>time = ______ s</p>',
  '4.73 s. One mark for any of: converting 1230 km h⁻¹ to 342 m s⁻¹ (341.7); the time for the '
  '343 m s⁻¹ run, 4.69 s; the total time over 3.22 km at the record speed, 9.42 s; or the unknown '
  'speed, 340.3 m s⁻¹. Second mark for an answer that rounds to 4.73 s — a 2 sf answer is not '
  'accepted.', '4.725 to 4.735'),
 ('2', '2', 2, 'calculation', MECH, 'graph', '',
  '<p>Engineers are designing a new jet-powered car to break this record.</p><p><b>Figure 1</b> '
  'shows the variation of speed with distance for the car, as predicted by the engineers.</p>'
  '<p>The car reaches its maximum acceleration when it is 5600 m from the start. At this point '
  'the mass of the car is 6.50 &times; 10<sup>3</sup> kg.</p><p>Determine the kinetic energy of '
  'the car at its maximum acceleration.</p><p>kinetic energy = ______ J</p>',
  '6.6 × 10⁸ J. Speed read from the graph at 5600 m: 450 m s⁻¹ (445 to 455 accepted) (1); then '
  '½mv² with their speed giving a consistent answer — ½ × 6.50 × 10³ × 450² = 6.6 × 10⁸ J (1).',
  '643000000 to 673000000 | 6.6 × 10^8 | 6.6x10^8 | 6.58 × 10^8 | 6.58x10^8'),
 ('2', '3', 4, 'calculation', MECH, 'graph', '',
  '<p>At any point on the graph in <b>Figure 1</b>, the acceleration is given by:</p>'
  '<p style="text-align:center">acceleration = speed &times; gradient of line</p><p>When the car is '
  'at its maximum acceleration, the power input to the jet engines is 640 MW.</p><p>Calculate the '
  'percentage of the input power used to accelerate the car at its maximum acceleration.</p>'
  '<p>percentage of input power = ______ %</p>',
  'Between 16% and 17%. MAX three marks from: using the graph to find the gradient — 450/5600 = '
  '0.080(4) s⁻¹; speed × gradient for the acceleration — 450 × 0.08 = 36(.2) m s⁻²; F = ma for the '
  'resultant force — 2.35 × 10⁵ N; P = Fv for the power — 450 × 2.35 × 10⁵ = 106 MW. Final answer '
  'between 16% and 17% for the fourth mark. Error carried forward from 02.2 is allowed; a power '
  'calculated assuming a constant speed is rejected.', '16 to 17'),
 ('2', '4', 2, 'explain', MECH, 'graph', '',
  '<p>Scientists recommend that the average deceleration of the driver of the car should be less '
  'than 3<i>g</i>.</p><p>Deduce whether the average deceleration is less than 3<i>g</i>.</p>',
  'Yes, it is less than 3g. Identifies the distance over which the car decelerates (7000 m to '
  '7600 m allowed) AND the maximum speed, 470 ± 5 m s⁻¹ (1); uses suvat to get a deceleration of '
  'about 15 m s⁻² (an answer consistent with their distance that rounds to 15 or 16), which is less '
  'than 3g, so yes (1). Full credit for showing that 3g would stop the car in a much shorter '
  'distance, so the actual deceleration must be much less than 3g. For the second mark, '
  'gradient × average speed giving 15 m s⁻² is also allowed.', ''),

 ('3', '1', 2, 'explain', CIRC, 'diagram', fig2(),
  '<p>In <b>Figure 2</b> the cell has emf <i>&epsilon;</i> and internal resistance <i>r</i>.</p>'
  '<p>The current in the circuit is <i>I</i>.</p><p>The potential difference (pd) across '
  'R<sub>1</sub> is <i>V</i><sub>1</sub> and the pd across R<sub>2</sub> is <i>V</i><sub>2</sub>.</p>'
  '<p>Explain how the law of conservation of energy applies in this circuit. You should consider '
  'the movement of one coulomb of charge around the circuit.</p>',
  'One of: 1 C of charge gains ε J passing through the cell; OR the energy transferred by 1 C in '
  'R₁ is V₁ J; OR in R₂ is V₂ J; OR in r is Ir J (1). For conservation of energy, ε = IR₁ + IR₂ + '
  'Ir (1) — or ε = V₁ + V₂ + Ir provided the first mark is awarded. "Dissipated" and "work done" '
  'are accepted; "lost volts" is accepted for Ir but "voltage across r" is rejected. If nothing '
  'else scores, one mark for a definition of emf in terms of energy transfer.', ''),
 ('3', '2', 3, 'calculation', CIRC, '', '',
  '<p>The sliding contact <b>C</b> is moved to end <b>B</b> of the variable resistor. The switch is '
  'closed.</p><p>The digital voltmeter reads 2.89 V.</p><p>Show that <i>r</i> is approximately '
  '4.8 &Omega;.</p>',
  'Equates the emf to Ir + 2.89 in some form (1); calculates I = 2.89 ÷ 125 = 0.02312 A (1); '
  'giving r = 4.76 Ω — at least 3 sf must be seen and it must round to 4.76 (1). Alternatives: '
  'lost volts = 0.11 V (1) and the potential-divider equation 0.11 ÷ 2.89 = r ÷ 125, or '
  '3 ÷ (125 + r) = 2.89 ÷ 125 (1). If nothing else scores, one mark for using the emf value.', ''),
 ('3', '3', 2, 'calculation', CIRC, '', '',
  '<p><b>C</b> is set at <sup>1</sup>&frasl;<sub>5</sub> of the distance between <b>A</b> and '
  '<b>B</b>. The thickness of the conducting layer is uniform so the resistance between <b>A</b> '
  'and <b>C</b> is 25.0 &Omega;.</p><p>Determine the voltmeter reading at this setting.</p>'
  '<p>voltmeter reading = ______ V</p>',
  '0.58 V. The resistance splits into 25 Ω and 104.8 Ω, so the potential divider gives '
  'V = 3.00 × 25/129.8 (1) = 0.58 V (1). Other routes: V = IR with 25 Ω and their current '
  '(0.023 A from 03.2, or 3/(125 + r), or the terminal pd/125); or V = 2.89/5 with 2.89 V '
  'identified as the terminal pd. If nothing else scores, one mark for using 29.8 Ω instead of '
  '129.8 Ω, giving 2.5(2) V.', '0.58 | 0.578'),
 ('3', '4', 4, 'drawing', CIRC, 'graph', fig6(),
  '<p><b>Figure 5</b> shows a variable resistor similar to the one shown in <b>Figure 3</b> but '
  'with the following three manufacturing faults:</p><ul><li>at <b>P</b> the conducting layer '
  'changes in thickness so that <b>AP</b> is thinner than <b>PB</b></li><li>at <b>Q</b> there is a '
  'scratch into the surface of the conducting layer and across its full width</li><li>from '
  '<b>R</b> to <b>B</b> the conducting connector is laid over the conducting layer.</li></ul>'
  '<p>The width of the conducting layer is constant.</p><p>A pd of 3.0 V is applied across '
  '<b>A</b> (0 V) and <b>B</b> (3.0 V). <b>C</b> is moved from <b>A</b> to <b>B</b>.</p>'
  '<p>Sketch, on the axes in <b>Figure 6</b>, a graph to show how the pd between <b>A</b> and '
  '<b>C</b> varies as <b>C</b> is moved from <b>A</b> to <b>B</b>.</p>',
  'Any four of: a straight line from 0 V at A to P; a less steep, non-zero gradient from P to Q; '
  'a short steep increase at Q (no wider than the Q label on the axis); Q to R at about the same '
  'non-zero gradient as P to Q; a horizontal line from R to B at 3.0 V. A graph sketched from 3 V '
  'at A down to 0 V at B scores max 2 (the P–Q and Q–R marks); a single diagonal straight line '
  'from 0 V at A to B scores 1 only; a straight line from 0 V at A to R then horizontal to B '
  'scores max 2.', ''),

 ('4', '1', 1, 'calculation', WAVE, '', '',
  '<p>Show that the glass used to make the prism has a refractive index of about 1.5</p>',
  'Uses sin c = 1/n, so n = 1/sin 41.5° = 1.51. Relevant working must be seen, with at least '
  '3 sf.', ''),
 ('4', '2', 2, 'explain', WAVE, '', '',
  '<p>Explain why the ray emerges parallel to the incident ray.</p>',
  'Each angle of incidence at the second and third surfaces is 45°, which is greater than the '
  'critical angle, so total internal reflection occurs (1); the angle of incidence as the ray '
  'leaves the block is 0° — it leaves along the normal (so it emerges parallel to the incident '
  'ray) (1).', ''),
 ('4', '3', 3, 'drawing', WAVE, 'diagram', fig8(),
  '<p><b>Figure 8</b> shows a ray of light entering the prism at an angle of incidence <i>&theta;</i> '
  'and reflecting off one of the shorter sides.</p><p><i>&theta;</i> is the largest angle of '
  'incidence for which all of the light leaves through the longest side.</p><p>Draw on '
  '<b>Figure 8</b> the path of the ray of light as it continues inside the prism and emerges from '
  'the longest side.</p>',
  'Only a (totally internally) reflected ray at the second reflecting boundary (1); the reflected '
  'ray parallel to the first refracted ray, by eye (1); the ray leaving parallel to the initial '
  'ray, by eye (1).', ''),
 ('4', '4', 4, 'calculation', WAVE, 'diagram', '',
  '<p>When the angle of incidence is greater than <i>&theta;</i>, some of the light escapes the '
  'prism through one of the shorter sides.</p><p>Assume that the refractive index is 1.5 and the '
  'critical angle is 41.5&deg;.</p><p>Show that <i>&theta;</i> is about 5&deg;.</p><p>You can use '
  '<b>Figure 8</b> in your answer.</p>',
  'Angle of incidence at the second reflecting boundary = 41.5° (1); angle of reflection at the '
  'first reflecting boundary = 90° − 41.5° = 48.5° (1); angle of refraction at entry = '
  '90° − 45° − 41.5° = 3.5° (1); n = 1.5 and Snell’s law give θ = 5.3° to at least 2 sf (1). '
  'Writing 90° − 41.5° = 48.5° on its own does not get a mark; the angles can be identified from '
  'the working or the diagram.', ''),
 ('4', '5', 4, 'explain', WAVE, 'diagram', fig9_10(),
  '<p>A manufacturer wants to make a prism with a larger value of <i>&theta;</i>.</p><p>Two '
  'alternative changes to the original design of the prism are suggested:</p><ol><li>use a prism '
  'of the original glass in the shape of an equilateral triangle, as shown in <b>Figure 9</b></li>'
  '<li>use a prism of the original shape made from glass with a smaller refractive index, as shown '
  'in <b>Figure 10</b>.</li></ol><p>Discuss whether either of the two suggestions would work.</p>',
  'Neither works. The 60° prism (Figure 9): light would not leave the prism at the original angle '
  '(1); light will escape at the second reflection — it is no longer totally internally reflected, '
  'the angle of incidence there now being less than the critical angle (1). A smaller n (Figure '
  '10): a larger critical angle (1), which would reduce the value of θ (1). Suggesting that a '
  'design would work limits the marks for that design to max 1.', ''),

 ('5', '1', 1, 'calculation', MECH, 'graph', '',
  '<p>Determine, using <b>Figure 11</b>, the Young modulus of the metal.</p>'
  '<p>Young modulus = ______ Pa</p>',
  '1.38 to 1.42 × 10¹¹ Pa (2 sf 1.4 × 10¹¹ Pa allowed), with evidence the graph is used — e.g. '
  '105 × 10⁶ ÷ 7.5 × 10⁻⁴: a point on the line between 75 MPa and 125 MPa, a point on the '
  'extended straight line, or a triangle using more than half of the linear section.',
  '138000000000 to 142000000000 | 1.4 × 10^11 | 1.4x10^11 | 1.40 × 10^11 | 1.40x10^11'),
 ('5', '2', 1, 'written', MECH, 'graph', '',
  '<p>Explain how the graph shows that this metal is brittle.</p>',
  'The idea that there is only a (very) small increase in strain beyond the linear section before '
  'fracture ("extension" or "(plastic) deformation" condoned for strain). Also accepted: no '
  '"necking" before fracture; fracture occurs very near the limit of proportionality; a particular '
  'value of strain, e.g. 9 × 10⁻⁴ to 12.7 × 10⁻⁴. The idea that there is NO increase in strain is '
  'rejected.', ''),
 ('5', '3', 3, 'calculation', MECH, 'diagram', '',
  '<p><b>Figure 12</b> shows a uniform rigid lighting beam <b>AB</b> suspended from a fixed '
  'horizontal support by two identical vertical steel wires, one at each end, 2.00 m apart. A lamp '
  'is attached to the midpoint of <b>AB</b>.</p>' + BEAM +
  '<p>Calculate the extension of each wire.</p><p>extension = ______ m</p>',
  '1.1(4) × 10⁻³ m. Total load = (4.4 + 16.0) × 9.8(1) = 200(.1) N, halved to 100 N on each wire '
  '(1); uses ΔL = FL/(AE) with A = 5.03 × 10⁻⁷ m² (1; a power-of-ten error condoned, and using d '
  'for the cross-sectional area condoned); ΔL = 1.1(4) × 10⁻³ m (1). Separate σ = F/A, E = σ/strain '
  'and strain = ΔL/L are fine.',
  '0.0011 | 0.00114 | 0.001136 to 0.001138 | 1.1 × 10^-3 | 1.14 × 10^-3 | 1.1x10^-3 | 1.14x10^-3'),
 ('5', '4', 5, 'calculation', MECH, 'diagram', '',
  '<p>The right-hand steel wire is removed and replaced with an aluminium wire of diameter '
  '1.60 mm. The unloaded length of the aluminium wire is the same as that of the original steel '
  'wire.</p><p>When the lamp is at the midpoint of <b>AB</b>, one of the wires extends more than the '
  'other so that <b>AB</b> is not horizontal. To make <b>AB</b> horizontal the lamp has to be moved '
  'to a distance <i>x</i> from <b>A</b> (the end with the steel wire). <b>Figure 13</b> shows the '
  'new arrangement.</p><p>The beam, the lamp and the wires are as in 05.3: mass of <b>AB</b> = '
  '4.4 kg, mass of lamp = 16.0 kg, wires 2.00 m apart, steel wire diameter 0.800 mm, Young modulus '
  'of steel = 2.10 &times; 10<sup>11</sup> Pa.</p><p>The Young modulus of aluminium is '
  '7.00 &times; 10<sup>10</sup> Pa.</p><p>Deduce distance <i>x</i>.</p><p><i>x</i> = ______ m</p>',
  'x = 1.18 m. The extension (strain) in each wire is the same, so {FL/AE} for steel = {FL/AE} for '
  'aluminium, i.e. F/(d²E) is the same (1); substituting, Fs/(0.8² × 210) = Fa/(1.6² × 70), so '
  'Fa = 1.33 Fs (or Fs = 0.752 Fa) (1); 1.33 Fs + Fs = 200 N gives Fs = 86 N and Fa = 114 N (1); '
  'an attempt at a moment equation about A, B or another suitable point — expect '
  '16.0g x = 228 − 4.4g (1); x = 1.18 m (1). An answer of 1.14 m comes from ignoring the weight of '
  'the beam and scores max 4.', '1.18'),

 ('6', '1', 2, 'explain', SHM, '', '',
  '<p>Show that the pencil moves with simple harmonic motion.</p>',
  'Equates the resultant force to ma and shows that a is proportional to y, since A, ρ, m and g '
  'are all constant: F = ma = −Aρyg, so a = −(Aρg/m)y (1; missing minus signs condoned here); the '
  'minus sign included and explained — the (restoring) force/acceleration is directed towards the '
  'centre of oscillation, opposite to y (1).', ''),
 ('6', '2', 2, 'calculation', SHM, '', '',
  '<p>The time period <i>T</i> of the vertical oscillations is given by</p>'
  '<p style="text-align:center"><i>T</i> = 2&pi;&radic;(<i>l</i>/<i>g</i>)</p><p>The measured value '
  'of <i>l</i> in <b>Figure 15</b> is 85 mm. The pencil is pushed down 5.0 mm and released.</p>'
  '<p>Calculate the maximum acceleration of the pencil.</p><p>maximum acceleration = ______'
  ' m&nbsp;s<sup>&minus;2</sup></p>',
  '0.58 m s⁻². T = 2π/ω so ω = √(g/l) = 10.74 rad s⁻¹ (1; or the period 0.58(5) s then ω from '
  'it); a_max = ω²y_max = (9.81 ÷ 0.085) × 0.005 = 0.58 m s⁻², from some correct working (1).',
  '0.58 | 0.577'),
 ('6', '3', 2, 'written', SHM, '', '',
  SHIP + '<p>Explain what is meant by resonance.</p>',
  'The frequency of the forced vibrations equals the natural (resonant) frequency (1); the '
  'amplitude of the oscillations is at a maximum (1). A fully labelled graph of amplitude against '
  'driving frequency with the resonant frequency labelled and an amplitude peak is accepted. "Wave '
  'frequency" is condoned for driving frequency; references to phase are ignored.', ''),
 ('6', '4', 3, 'explain', SHM + ', ' + WAVE, 'diagram', '',
  SHIP + '<p><b>Figure 16</b> shows a ship moving through continuous waves of wavelength 118 m and '
  'velocity 14.2' + MS + '.</p><p>The ship is moving steadily at 8.0' + MS + ' relative to the '
  'seabed in the same direction as the waves.</p><p>The natural frequency of heave oscillations of '
  'the ship is 0.13 Hz.</p><p>A crew member needs an emergency operation. The ship’s doctor is '
  'confident that she can do the operation if the ship remains fairly steady.</p><p>There are two '
  'options:</p><ul><li>stop the ship’s motors and loosely anchor the ship to the seabed</li>'
  '<li>continue to sail the ship at 8.0' + MS + ' in the same direction.</li></ul><p>Deduce which '
  'is the better option.</p><p>Support your answer with a calculation.</p>',
  'Keep sailing. Stopped, the wave frequency is v/λ = 14.2/118 = 0.12 Hz (1; a bald "0.12 Hz" is '
  'rejected); moving at 8.0 m s⁻¹ the forcing frequency is further from the resonant frequency — '
  'or calculated, (14.2 − 8.0)/118 = 0.05 Hz (1; an incorrect calculation adding the speeds is '
  'accepted with a comment that it is further from the resonant frequency); moving is the better '
  'option with a reason — stopped, the forcing frequency is very close to the natural frequency so '
  'the amplitude will be high, or moving, resonance does not occur (1). An answer that damping '
  'will probably keep the amplitude low enough is allowed for the third mark.', ''),

 # ---------------- Section B: one mark each, the key read off the scheme's table ------------------
 ('7', '', 1, 'short', MEAS, '', '',
  mc('<p>Which combination of an object’s speed and journey time gives a distance travelled of '
     '1 mm?</p>', [('10 &micro;m s<sup>&minus;1</sup>', '100 s'),
                   ('10 km s<sup>&minus;1</sup>', '0.01 &micro;s'),
                   ('1 nm s<sup>&minus;1</sup>', '1 Gs'),
                   ('0.1 Mm s<sup>&minus;1</sup>', '100 ns')], ['Speed', 'Journey time']),
  'A — 10 μm s⁻¹ for 100 s.', 'A'),
 ('8', '', 1, 'short', MECH, '', '',
  mc('<p>A person jumps as high as she can from a standing position.</p><p>What is a reasonable '
     'estimate of her speed just after she leaves the ground?</p>',
     ['2' + MS, '4' + MS, '8' + MS, '10' + MS]),
  'B — 4 m s⁻¹.', 'B'),
 ('9', '', 1, 'short', PART, '', '',
  mc('<p>A nucleus contains <i>N</i> neutrons and <i>Z</i> protons.</p><p>Which combination of '
     '<i>N</i> and <i>Z</i> gives a nucleus with the greatest specific charge?</p>',
     [('6', '5'), ('8', '7'), ('16', '13'), ('20', '17')], ['<i>N</i>', '<i>Z</i>']),
  'B — N = 8, Z = 7.', 'B'),
 ('10', '', 1, 'short', PART, '', '',
  mc('<p>Which statement about muons is correct?</p>',
     ['They consist of a quark and an antiquark.', 'They include pions and kaons.',
      'They are subject to the strong interaction.', 'They decay into electrons.']),
  'D — they decay into electrons.', 'D'),
 ('11', '', 1, 'short', PART, 'diagram', '',
  mc('<p>The diagram represents a quark change in which an electron antineutrino is produced. '
     'Particle <b>E</b> comes in to a vertex and leaves it as particle <b>F</b>; an exchange '
     'particle (a wavy line) runs from that vertex to a second vertex, from which particle <b>G</b> '
     'and the electron antineutrino <span style="text-decoration:overline">&nu;</span><sub>e</sub> '
     'go out.</p><p>What are <b>E</b>, <b>F</b> and <b>G</b>?</p>',
     [('up quark', 'down quark', '&beta;<sup>&minus;</sup>'),
      ('down quark', 'up quark', '&beta;<sup>&minus;</sup>'),
      ('up quark', 'down quark', '&beta;<sup>+</sup>'),
      ('down quark', 'up quark', '&beta;<sup>+</sup>')], ['<b>E</b>', '<b>F</b>', '<b>G</b>']),
  'B — E down quark, F up quark, G β⁻.', 'B'),
 ('12', '', 1, 'short', PART, '', '',
  mc('<p>Photoelectrons are released when monochromatic light with a photon energy of '
     '4.2 &times; 10<sup>&minus;19</sup> J is incident on a metal surface.</p><p>The work function '
     'of the surface is 2.4 eV.</p><p>What is the maximum speed of the photoelectrons as they leave '
     'the surface?</p>',
     ['1.3 &times; 10<sup>6</sup>' + MS, '6.3 &times; 10<sup>5</sup>' + MS,
      '2.8 &times; 10<sup>5</sup>' + MS, '2.0 &times; 10<sup>5</sup>' + MS]),
  'C — 2.8 × 10⁵ m s⁻¹.', 'C'),
 ('13', '', 1, 'short', PART, 'diagram', '',
  mc('<p>Electrons with a certain kinetic energy pass through a powdered crystalline sample and '
     'are incident on a fluorescent screen.</p><p>The first sketch shows the diffraction pattern '
     'produced: a bright centre surrounded by concentric rings.</p><p>A change is made and this '
     'second pattern is produced: the same concentric rings, each with a larger radius.</p>'
     '<p>Which change could produce the second pattern?</p>',
     ['decreasing the kinetic energy of the electrons',
      'replacing the electrons with protons with the same kinetic energy',
      'using a crystalline sample with a wider spacing between its atoms',
      'moving the screen closer to the crystalline sample']),
  'A — decreasing the kinetic energy of the electrons.', 'A'),
 ('14', '', 1, 'short', WAVE, 'graph', fig14(),
  mc('<p>A string with a length of 1.2 m vibrates at its second harmonic.</p><p>The diagram shows '
     'the displacement&ndash;time graph for a point on the string.</p><p>What are the wavelength '
     'and frequency of the wave on the string?</p>',
     [('0.6', '0.17'), ('0.6', '0.34'), ('1.2', '0.17'), ('1.2', '0.34')],
     ['Wavelength / m', 'Frequency / kHz']),
  'C — wavelength 1.2 m, frequency 0.17 kHz.', 'C'),
 ('15', '', 1, 'short', WAVE, '', '',
  mc('<p>A standing wave is created on a string.</p><p>Which statement about the two waves that '
     'create the standing wave is <b>not</b> correct?</p>',
     ['They have the same frequency.', 'They have a constant phase relationship.',
      'They travel in opposite directions.', 'They have the same speed.']),
  'B — they have a constant phase relationship.', 'B'),
 ('16', '', 1, 'short', WAVE, '', '',
  mc('<p>A double slit with a separation <i>s</i> is illuminated by light of wavelength '
     '<i>&lambda;</i>.</p><p>Fringes with spacing <i>w</i> are produced on a screen placed a distance '
     '<i>D</i> from the slits.</p><p>The distance from the slits to the screen is changed to '
     '<sup><i>D</i></sup>&frasl;<sub>2</sub>.</p><p>Which combination of slit separation and '
     'wavelength produces a fringe spacing of 1.5<i>w</i> on the screen?</p>',
     [('0.22<i>s</i>', '0.66<i>&lambda;</i>'), ('0.50<i>s</i>', '0.75<i>&lambda;</i>'),
      ('0.60<i>s</i>', '1.20<i>&lambda;</i>'), ('1.20<i>s</i>', '0.40<i>&lambda;</i>')],
     ['Slit separation', 'Wavelength']),
  'A — 0.22s and 0.66λ.', 'A'),
 ('17', '', 1, 'short', WAVE, '', '',
  mc('<p>A single narrow slit is illuminated with monochromatic light and a diffraction pattern is '
     'produced.</p><p>The slit width is increased.</p><p>What happens to the width and brightness of '
     'the central maximum of the diffraction pattern?</p>',
     [('increases', 'increases'), ('increases', 'decreases'), ('decreases', 'increases'),
      ('decreases', 'decreases')], ['Width of central maximum', 'Brightness of central maximum']),
  'C — the width decreases and the brightness increases.', 'C'),
 ('18', '', 1, 'short', MECH, '', '',
  mc('<p>A ball is kicked from point P on level ground. The ball initially travels at 45&deg; to '
     'the horizontal.</p><p>The ball reaches its maximum height after a time of 2.0 s.</p><p>Air '
     'resistance can be ignored.</p><p>What is the displacement of the ball from P when at its '
     'maximum height?</p>', ['20 m', '40 m', '45 m', '60 m']),
  'C — 45 m.', 'C'),
 ('19', '', 1, 'short', MECH, '', '',
  mc('<p>An object is moving in a straight line. A graph is plotted to show the variation of the '
     'momentum of the object with time.</p><p>Which quantities can be calculated from the gradient '
     'of the graph and the area under the graph?</p>',
     [('power', 'mass &times; displacement'), ('force', 'work done &times; time'),
      ('power', 'work done &times; time'), ('force', 'mass &times; displacement')],
     ['Gradient of graph', 'Area under graph']),
  'D — gradient: force; area: mass × displacement.', 'D'),
 ('20', '', 1, 'short', MECH, '', '',
  mc('<p>Which is a pair of vectors?</p>',
     ['weight and work', 'force and energy', 'displacement and momentum',
      'acceleration and power']),
  'C — displacement and momentum.', 'C'),
 ('21', '', 1, 'short', CIRC, '', '',
  mc('<p>Which statement about a superconducting metal is correct?</p>',
     ['Its resistivity is small but not zero.', 'A current in it causes no heating effect.',
      'Its critical temperature is independent of the metal it is made from.',
      'Keeping it cold makes it too expensive to use.']),
  'B — a current in it causes no heating effect.', 'B'),
 ('22', '', 1, 'short', MECH, 'diagram', '',
  mc('<p>A heavy uniform trapdoor is hinged to the floor. It is held open by a rope as shown: the '
     'trapdoor leans up and away from a wall at about 45&deg;, and the rope runs from its top edge '
     'back to the wall, sloping upwards. Four arrows <b>A</b> to <b>D</b> are drawn from the '
     'hinge: <b>A</b> points up and away from the trapdoor, towards the wall side; <b>B</b> points '
     'up to the right, steeper than the trapdoor; <b>C</b> points horizontally, away from the wall; '
     '<b>D</b> points away from the wall and slightly downwards.</p><p>Which arrow shows the '
     'direction of the reaction force of the hinge on the trapdoor?</p>', ['', '', '', '']),
  'B.', 'B'),
 ('23', '', 1, 'short', MECH, '', '',
  mc('<p>A sphere of mass <i>m</i> falls with speed <i>v</i>.</p><p>The resistive force on the '
     'sphere is <i>kv</i>, where <i>k</i> is a constant.</p><p>What is the terminal speed of the '
     'sphere?</p>', ['<i>mg</i>/<i>k</i>', '<i>km</i>/<i>g</i>', '<i>kmg</i>',
                     '<i>k</i>/<i>mg</i>']),
  'A — mg/k.', 'A'),
 ('24', '', 1, 'short', MECH, '', '',
  mc('<p>A trolley moves down a slope with constant acceleration.</p><p>The mass of the trolley is '
     'doubled and the trolley moves down the same slope again.</p><p>Air resistance and friction '
     'are negligible.</p><p>Which is correct?</p>',
     ['The accelerating force is unchanged.', 'The accelerating force is halved.',
      'The acceleration is unchanged.', 'The acceleration is halved.']),
  'C — the acceleration is unchanged.', 'C'),
 ('25', '', 1, 'short', MECH, 'graph', fig25(),
  mc('<p>A variable force <i>F</i> acts on an object of mass 2.0 kg. The object is at rest at time '
     '<i>t</i> = 0</p><p>The graph shows the variation of <i>F</i> with <i>t</i>.</p><p>What is the '
     'speed of the object when <i>t</i> = 1.0 s?</p>',
     ['3.75' + MS, '5.00' + MS, '7.50' + MS, '15.0' + MS]),
  'C — 7.50 m s⁻¹.', 'C'),
 ('26', '', 1, 'short', MECH, 'graph', '',
  mc('<p>A heavy cable is attached to a fixed support at <b>J</b> and carries a load at its lower '
     'end <b>K</b>.</p><p>The weight of the cable is <b>not</b> negligible.</p><p>The cable has '
     'constant cross-sectional area and density.</p><p>Which graph shows the variation of tensile '
     'stress <i>&sigma;</i> in the cable with distance <i>d</i> from <b>J</b> to <b>K</b>?</p>'
     '<p>The four graphs, each of <i>&sigma;</i> against <i>d</i> from J to K, are all straight '
     'lines: <b>A</b> falls from a value at J to zero at K; <b>B</b> rises from a non-zero value at '
     'J to a larger value at K; <b>C</b> is constant; <b>D</b> falls from a value at J to a smaller, '
     'non-zero value at K.</p>', ['', '', '', '']),
  'D.', 'D'),
 ('27', '', 1, 'short', CIRC, 'diagram', '',
  mc('<p>A box with four terminals is connected to a cell and two ammeters. The top left terminal '
     'is <b>X</b>. The cell and the first ammeter are connected between <b>X</b> and the bottom '
     'left terminal; the second ammeter is connected between the top right and bottom right '
     'terminals.</p><p>Each of the boxes <b>A</b> to <b>D</b> is connected into the circuit in turn. '
     'All the resistors have equal resistance.</p><ul><li><b>A</b>: a resistor from X to top right; '
     'a resistor from X to bottom left; a wire from bottom left to bottom right.</li><li><b>B</b>: a '
     'resistor from X to top right; a wire from X to bottom left; a wire from top right to bottom '
     'right.</li><li><b>C</b>: a resistor from X to top right; a resistor from X to bottom left; a '
     'resistor from bottom left to bottom right.</li><li><b>D</b>: a resistor from X to top right; a '
     'wire from bottom left to bottom right.</li></ul><p>Which box gives the same reading on both '
     'ammeters?</p>', ['', '', '', '']),
  'D.', 'D'),
 ('28', '', 1, 'short', SHM, 'diagram', '',
  mc('<p>Two circular discs made of card rotate at constant speed on a common axle.</p><p>The discs '
     'are 2.00 m apart.</p><p>An air-gun pellet is fired parallel to the axle. The pellet makes '
     'holes in the discs.</p><p>The holes are separated by an angle of 45&deg;.</p><p>The speed of '
     'the pellet between the discs is 300' + MS + '.</p><p>How many revolutions does each disc '
     'complete in one second?</p>', ['19', '118', '740', '1074']),
  'A — 19.', 'A'),
 ('29', '', 1, 'short', CIRC, '', '',
  mc('<p>A resistor dissipates 100 W when connected across a 25 V supply with negligible internal '
     'resistance.</p><p>The supply output is reduced to 20 V and the resistor is replaced so that '
     'the power dissipated is still 100 W.</p><p>What is the percentage decrease in '
     'resistance?</p>', ['20', '36', '64', '80']),
  'B — 36.', 'B'),
 ('30', '', 1, 'short', SHM, 'diagram', '',
  mc('<p>When an aircraft turns in a horizontal circular path, it banks at an angle <i>&theta;</i>. '
     'The lift force acts at <i>&theta;</i> to the vertical, the weight <i>mg</i> acts vertically '
     'down, and the centre of the circular path is a distance <i>r</i> away horizontally.</p>'
     '<p>The aircraft has mass <i>m</i> and travels at constant speed <i>v</i> in a horizontal '
     'circular path of radius <i>r</i>. The lift force acts at the angle <i>&theta;</i>.</p><p>What '
     'is tan <i>&theta;</i>?</p>',
     ['<i>gv</i><sup>2</sup>/<i>r</i>', '<i>rv</i><sup>2</sup>/<i>g</i>',
      '<i>rg</i>/<i>v</i><sup>2</sup>', '<i>v</i><sup>2</sup>/<i>rg</i>']),
  'D — v²/rg.', 'D'),
 ('31', '', 1, 'short', SHM, 'diagram', '',
  mc('<p>A mass, attached to two springs, oscillates horizontally on a smooth surface between '
     '<b>P</b> and <b>Q</b>. The motion of the system is simple harmonic.</p><p>Which quantity has '
     'its magnitude at a minimum value when the mass is at <b>Q</b>?</p>',
     ['the acceleration of the mass', 'the kinetic energy of the mass',
      'the potential energy of the mass&ndash;spring system',
      'the resultant force of the springs on the mass']),
  'B — the kinetic energy of the mass.', 'B'),
]

# The picture-only options (22, 26, 27) print just the letters; say so rather than draw blank lines.
Q = [(q, p, m, a, t, f, d, h.replace('<p><b>A</b> <br><b>B</b> <br><b>C</b> <br><b>D</b> </p>',
                                     '<p>Answer <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>'),
      ans, acc) for q, p, m, a, t, f, d, h, ans, acc in Q]

PER_QUESTION = {'1': 6, '2': 10, '3': 11, '4': 14, '5': 10, '6': 9}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert {k: v for k, v in got.items() if int(k) <= 6} == PER_QUESTION, got
assert sum(v for k, v in got.items() if int(k) >= 7) == 25 and all(
    got[str(k)] == 1 for k in range(7, 32)), 'Section B is 25 one-mark questions'
assert sum(got.values()) == 85, 'the cover says 85 and these sum to %d' % sum(got.values())
SCHEME = {7: 'A', 8: 'B', 9: 'B', 10: 'D', 11: 'B', 12: 'C', 13: 'A', 14: 'C', 15: 'B', 16: 'A',
          17: 'C', 18: 'C', 19: 'D', 20: 'C', 21: 'B', 22: 'B', 23: 'A', 24: 'C', 25: 'C', 26: 'D',
          27: 'D', 28: 'A', 29: 'B', 30: 'D', 31: 'B'}
for q, part, marks, a, t, f, d, h, ans, acc in Q:
    if int(q) >= 7:
        assert acc == SCHEME[int(q)] and ans.startswith(acc), q

# ---- every intermediate the scheme prints, recomputed ----
h, e = 6.63e-34, 1.60e-19
assert round(h * 2.69e23 / (e * 1e6), 5) == 1114.66875                             # 01.4
v1 = 1230 / 3.6
assert round(v1, 1) == 341.7 and round(1610 / 343, 2) == 4.69                      # 02.1
assert round(3220 / v1, 2) == 9.42 and round(3220 / v1 - 1610 / 343, 2) == 4.73
assert round(1610 / (3220 / v1 - 1610 / 343), 1) == 340.3
def read(x, pts):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x0 <= x <= x1: return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
v = read(5600, FIG1)
assert 445 <= v <= 455, v                                                          # 02.2 off the trace
assert 465 <= max(y for x, y in FIG1) <= 475                                        # 02.4's 470 ± 5
assert round(0.5 * 6.50e3 * 450 ** 2 / 1e8, 1) == 6.6
assert round(450 / 5600, 4) == 0.0804 and round(450 * 450 / 5600, 1) == 36.2        # 02.3
F = 6.50e3 * 450 * 450 / 5600
assert round(F / 1e5, 2) == 2.35 and round(450 * F / 1e6) == 106 and 16 <= 100 * 450 * F / 640e6 <= 17
assert all(14.5 <= 470 ** 2 / (2 * s) < 16 < 3 * 9.81 for s in (7000, 7600))       # 02.4: ≈15 m s⁻²
I = 2.89 / 125
assert round(I, 5) == 0.02312 and round((3.00 - 2.89) / I, 2) == 4.76               # 03.2
assert round(25 + (125 - 25) + 4.8, 1) == 129.8 and round(3.00 * 25 / 129.8, 2) == 0.58  # 03.3
assert round(3.00 * 25 / 29.8, 2) == 2.52
assert round(1 / math.sin(math.radians(41.5)), 2) == 1.51                           # 04.1
assert 90 - 41.5 == 48.5 and 90 - 45 - 41.5 == 3.5                                  # 04.4
assert round(math.degrees(math.asin(1.5 * math.sin(math.radians(3.5)))), 1) == 5.3
assert 1.38 <= 105e6 / 7.5e-4 / 1e11 <= 1.42                                        # 05.1
assert abs(read(7.5, FIG11) - 105) < 2                                              # the scheme's point is on the trace
A = math.pi * (0.8e-3 / 2) ** 2
T = (4.4 + 16.0) * 9.81
assert round(T) == 200 and round(A / 1e-7, 2) == 5.03                               # 05.3
assert round(T / 2 * 1.20 / (A * 2.10e11) / 1e-3, 2) == 1.14
ratio = (1.6 ** 2 * 70) / (0.8 ** 2 * 210)
assert round(ratio, 2) == 1.33                                                      # 05.4
Fs = T / (1 + ratio); Fa = T - Fs
assert round(Fs) == 86 and round(Fa) == 114 and round(Fa * 2) == 229               # scheme: 228 from 114 × 2
x = (Fa * 2 - 4.4 * 9.81 * 1.0) / (16.0 * 9.81)
assert round(x, 2) == 1.18
xb = 2.00 * ratio / (1 + ratio)       # lamp alone: Fa = 16g·ratio/(1 + ratio), Fa × 2 = 16g·x
assert round(xb, 2) == 1.14                                                        # ignoring the beam
w = math.sqrt(9.81 / 0.085)
assert round(w, 2) == 10.74 and round(w * w * 0.005, 2) == 0.58                     # 06.2
assert round(2 * math.pi / w, 3) == 0.585
assert round(14.2 / 118, 2) == 0.12 and round((14.2 - 8.0) / 118, 2) == 0.05        # 06.4
# Section B working, so the key is the physics as well as the table
assert abs(10e-6 * 100 - 1e-3) < 1e-12                                              # 07
assert max([(6, 5), (8, 7), (16, 13), (20, 17)], key=lambda nz: nz[1] / sum(nz)) == (8, 7)  # 09
assert round(math.sqrt(2 * (4.2e-19 - 2.4 * e) / 9.11e-31) / 1e5, 1) == 2.8          # 12
assert 1.2 == 2 * 1.2 / 2 and round(1 / 6e-3 / 1e3, 2) == 0.17                      # 14
assert round(0.66 * (0.5) / 0.22, 2) == 1.5                                          # 16, D → D/2
assert round(math.hypot(20 * 2.0, 0.5 * 9.81 * 2.0 ** 2)) == 45                      # 18
assert (10 * 0.5 + 20 * 0.5) / 2.0 == 7.5                                            # 25
assert round(1 / 8 / (2.00 / 300)) == 19                                             # 28
assert round(100 * (1 - (20 ** 2 / 100) / (25 ** 2 / 100))) == 36                    # 29
d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() == 2 and (d.year, d.month) == (2023, int(DOC['month']))            # cover: Wednesday

ROWS = [dict(DOC, row_id='D-' + PAPER, kind='document', total_marks='85',
             needs='Calculator, Ruler, Protractor, Equation booklet',
             source_url='https://drive.google.com/file/d/%s/view' % QP)]
TOP = {'1': PART, '2': MECH, '3': CIRC, '4': WAVE, '5': MECH, '6': SHM}
for q, (html, figure, diagram) in PRE.items():
    ROWS.append(dict(DOC, row_id='Q-AQA-7408-2306-1-%02d' % int(q), kind='preamble', question=q,
                     section='', html=html, topics=TOP[q], figure=figure, diagram=diagram,
                     diagram_by=('family' if diagram else '')))
for q, part, marks, atype, topics, figure, diagram, html, answer, accept in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-7408-2306-1-%02d%s' % (int(q), part), kind='question',
             question=q, part=part, section=('A' if int(q) <= 6 else 'B'), marks=str(marks),
             html=html, answer=answer, answer_type=atype, topics=topics, figure=figure,
             diagram=diagram, diagram_by=('family' if diagram else ''), placeholder='',
             accept=accept)
    ROWS.append(r)
