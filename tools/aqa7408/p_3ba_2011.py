"""AQA A-level Physics 7408/3BA — Paper 3 Section B, Astrophysics. The November 2020 sitting.

WHICH SITTING THIS IS, BECAUSE THE COVER SAYS OTHERWISE. The June 2020 series was cancelled and
AQA ran the autumn 2020 series on the June 2020 papers, so this paper's own cover reads *"Friday 5
June 2020, Afternoon"* and its mark scheme's cover reads *"June 2020"* — both carry the series code
206A — while AQA publishes the pair as the November 2020 paper (`AQA-74083BA-QP-NOV20.pdf`,
`AQA-74083BA-W-MS-NOV20.pdf`). The question paper and the scheme are the same paper as each other,
checked on both covers. So this is filed as November 2020 (month 11, Second wave) and `exam_date`
is left EMPTY: the one date printed is a day the paper was never sat, and a wrong day is worse than
no day.

WHERE EVERY ANSWER CAME FROM: that scheme, read rather than derived — the 2017 Highers are why.
Every intermediate the scheme prints is recomputed below, and the cover's total of 35 is asserted
against the parts' own marks and against the scheme's "Total" lines (10, 11, 10, 4).

ONE PRINTED FIGURE IS NOT A MATCH FOR ITS OWN ARITHMETIC, and it is kept as printed rather than
"corrected": the scheme writes Caph's Wien temperature as 2.9 × 10⁻³ / 410 × 10⁻⁹ = 7250 K. That
quotient is 7070 K; 7250 K is 2.9 × 10⁻³ / 400 × 10⁻⁹. Both are inside the band the scheme accepts,
6900–7630 K, and the peak of the printed curve measures at about 400 nm (below), so the answer says
the range and names the discrepancy.

THREE FIGURES ARE DRAWN AND NONE IS DESCRIBED.
  - 01.1: the only thing printed is the principal axis, labelled — the drawing IS the answer space.
  - 03.2 Figure 2: two bare axes, "absolute magnitude" up and "time /" along with its unit left for
    the student — three of the scheme's marks are for what goes on them, so a blank grid with no
    scale is the question exactly.
  - 02.2 Figure 1: the two intensity–wavelength curves, TRACED off the paper's raster image rather
    than drawn by eye. The image has no text layer and no vectors, so the axis was found by its own
    ticks (0 at pixel column 212, 2000 nm at 1458.5, a tick every 62.3 px = 100 nm) and each curve
    followed column by column by continuity; the dashed curve was traced from both ends because the
    two cross near 570 nm. The peaks measure at about 400 nm (Caph) and 640–670 nm (Schedar), against
    the scheme's readings of 410 nm and 660 nm. The printed figure has no intensity scale, and nor
    does this one.
"""
import math
from svgplot import W

PAPER = 'P-AQA-7408-2011-3BA'
BASE = dict(paper_id=PAPER, subject='Physics', key_stage='KS5', band_type='stage',
            band_value='A-Level', level='Alevel', company='AQA', exam_board='AQA',
            spec_code='7408/3BA', exam_wave='Second wave', year='2020', month='11', paper='3',
            document_type='Past paper', name='Paper 3 Section B: Astrophysics — November 2020',
            active='True', trackable='True', printable='False')
QP = '1Cl20afD18ilPtaYCJib17dUAvysOZ7eq'

TEL = 'Astrophysics, Telescopes'
STA = 'Astrophysics, Classification of Stars'
COS = 'Astrophysics, Cosmology'

# ---------------------------------------------------------------------------------------------
# The scheme's own arithmetic, recomputed. A number mistyped into this file fails here.
# ---------------------------------------------------------------------------------------------
theta = 450e-9 / 0.21                                   # 01.2 Rayleigh criterion (scheme: θ ≈ λ/D)
assert round(theta, 8) == 2.14e-6
assert round(theta * 12.5e6) == 27                       # smallest detail at 12 500 km, in metres
assert round(1000 / 12.5e6, 7) == 8.0e-5                 # angle a 1 km crater subtends
assert round(2.4 ** 2 / 0.21 ** 2) == 131                # 01.3 — the scheme prints "= 130"
assert round(2.9e-3 / 660e-9, -2) == 4400                # 02.2 Schedar
assert round(2.9e-3 / 400e-9) == 7250                    # 02.2 Caph as the scheme's 7250 K needs
assert round(2.9e-3 / 410e-9, -1) == 7070                # ... and what its printed 410 nm gives
assert 6900 <= 2.9e-3 / 410e-9 <= 7630 and 6900 <= 7250 <= 7630
LY, PC = 9.46e15, 3.08e16                                # Data and Formulae Booklet values
d_sched = 228 * LY / PC
assert round(d_sched) == 70                              # 02.4 conversion to parsec
M_sched = 2.2 - 5 * math.log10(70 / 10)
assert round(M_sched, 3) == -2.025                       # 02.4
# 02.3 — dimmest on the absolute scale is Caph; recomputed for all four rows of Table 1
TABLE1 = [('Caph', 'white', 2.3, 55), ('Ruchbah', 'blue/white', 2.7, 99),
          ('Schedar', 'orange', 2.2, 228), ('Tsih', 'blue', 2.2, 610)]
absM = {n: m - 5 * math.log10(ly * LY / PC / 10) for n, _, m, ly in TABLE1}
assert max(absM, key=absM.get) == 'Caph'
Rs = 2 * 6.67e-11 * 15 * 1.99e30 / (3.00e8) ** 2         # 02.5
assert round(Rs, -3) == 44000
ratio = (1.4e10) ** 2 * 53000 ** 4 / ((7.0e8) ** 2 * 5700 ** 4)   # 04.1
assert round(ratio, -5) == 3.0e6

# ---------------------------------------------------------------------------------------------
# FIGURE 1, traced (see the module note). x in nm, y in pixels above the baseline of the 1515 px
# raster — the printed figure has no intensity scale, so the unit is the drawing's own.
# ---------------------------------------------------------------------------------------------
CAPH = [(0, 0), (120, 0), (140, 3), (160, 21), (180, 62), (200, 126), (220, 194), (240, 262),
        (260, 330), (280, 397), (300, 460), (320, 509), (340, 546), (360, 572), (380, 588),
        (400, 593), (420, 591), (440, 583), (460, 572), (480, 557), (500, 539), (520, 519),
        (540, 499), (560, 477), (580, 456), (600, 434), (620, 413), (640, 393), (660, 373),
        (680, 353), (700, 334), (720, 316), (740, 298), (760, 281), (780, 265), (800, 249),
        (820, 234), (840, 220), (860, 208), (880, 196), (900, 186), (920, 177), (940, 168),
        (960, 159), (980, 151), (1000, 143), (1040, 128), (1080, 114), (1120, 102), (1160, 90),
        (1200, 81), (1240, 72), (1280, 64), (1320, 58), (1360, 52), (1400, 47), (1440, 43),
        (1480, 39), (1520, 36), (1560, 33), (1600, 30), (1640, 27), (1680, 25), (1720, 22),
        (1760, 19), (1800, 17), (1840, 15), (1880, 13), (1920, 11), (1960, 9), (2000, 7)]
SCHEDAR = [(200, 0), (240, 14), (260, 28), (280, 52), (300, 75), (320, 108), (340, 144),
           (360, 179), (380, 214), (400, 247), (420, 282), (440, 315), (460, 348), (480, 376),
           (500, 403), (520, 426), (540, 448), (560, 457), (580, 472), (600, 476), (620, 481),
           (640, 483), (660, 482), (680, 481), (700, 476), (720, 473), (740, 469), (760, 459),
           (780, 452), (800, 441), (820, 428), (840, 419), (860, 406), (880, 395), (900, 379),
           (920, 365), (940, 356), (960, 344), (980, 335), (1000, 324), (1040, 303), (1080, 284),
           (1120, 265), (1160, 247), (1200, 230), (1240, 214), (1280, 198), (1320, 183),
           (1360, 169), (1400, 156), (1440, 144), (1480, 133), (1520, 124), (1560, 116),
           (1600, 108), (1640, 100), (1680, 92), (1720, 88), (1760, 81), (1800, 76), (1840, 71),
           (1880, 66), (1920, 62), (1960, 58), (2000, 55)]
# the traced peaks agree with the scheme's readings to within a small square of the printed axis
assert abs(max(CAPH, key=lambda p: p[1])[0] - 410) <= 20
assert 620 <= max(SCHEDAR, key=lambda p: p[1])[0] <= 680

def fig1():
    L, R, T, B = 44, 326, 16, 186
    sx = lambda nm: L + (R - L) * nm / 2000.0
    sy = lambda v: B - (B - T) * v / 620.0
    poly = lambda pts: ' '.join('%.1f,%.1f' % (sx(x), sy(v)) for x, v in pts)
    p = ['<svg viewBox="0 0 %d 232" role="img" aria-label="Intensity received at Earth against '
         'wavelength from 0 to 2000 nm for Caph, a solid curve, and Schedar, a dashed curve">' % W]
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T - 6, L, B))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    for nm in range(0, 2001, 100):
        h = 5 if nm % 500 == 0 else 3
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="axis"/>'
                 % (sx(nm), B, sx(nm), B + h))
        if nm % 500 == 0:
            p.append('<text x="%.1f" y="%d" class="num">%d</text>' % (sx(nm), B + 17, nm))
    p.append('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.8"/>'
             % poly(CAPH))
    p.append('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.5" '
             'stroke-dasharray="5 3"/>' % poly(SCHEDAR))
    # leader lines to the two names, where the paper puts them
    p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>'
             % (sx(470), sy(565), sx(560), sy(600)))
    p.append('<text x="%.1f" y="%.1f" class="lbl">Caph</text>' % (sx(575), sy(596)))
    p.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>'
             % (sx(840), sy(419), sx(900), sy(470)))
    p.append('<text x="%.1f" y="%.1f" class="lbl">Schedar</text>' % (sx(915), sy(466)))
    p.append('<text x="%.1f" y="224" class="ax" style="text-anchor:middle">wavelength / nm</text>'
             % ((L + R) / 2))
    p.append('<text x="14" y="%d" class="ax" style="text-anchor:middle" transform="rotate(-90 14 %d)">'
             'intensity received at Earth</text>' % ((T + B) / 2, (T + B) / 2))
    return ''.join(p) + '</svg>'

def fig2():
    L, R, T, B = 44, 326, 14, 176
    return ('<svg viewBox="0 0 %d 214" role="img" aria-label="Blank axes: absolute magnitude up the '
            'side, time along the bottom with its unit left blank">' % W
            + '<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B)
            + '<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B)
            + '<text x="14" y="%d" class="ax" style="text-anchor:middle" transform="rotate(-90 14 %d)">'
              'absolute magnitude</text>' % ((T + B) / 2, (T + B) / 2)
            + '<text x="%d" y="204" class="ax" style="text-anchor:middle">time /</text>' % ((L + R) / 2)
            + '</svg>')

def axis11():
    return ('<svg viewBox="0 0 %d 150" role="img" aria-label="A horizontal line labelled principal '
            'axis, with space above and below it to draw the telescope">' % W
            + '<line x1="10" y1="75" x2="262" y2="75" class="axis"/>'
            + '<text x="268" y="72" class="lbl">principal</text>'
            + '<text x="268" y="88" class="lbl">axis</text></svg>')

T1 = ('<table><tr><th>Name</th><th>Colour</th><th>Apparent magnitude</th><th>Distance / ly</th></tr>'
      + ''.join('<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % (n, c, m, d)
                for n, c, m, d in TABLE1) + '</table>')
T2 = ('<table><tr><th>Name</th><th>Radius / m</th><th>Surface temperature / K</th></tr>'
      '<tr><td>Melnick 34</td><td>1.4 &times; 10<sup>10</sup></td><td>53 000</td></tr>'
      '<tr><td>Sun</td><td>7.0 &times; 10<sup>8</sup></td><td>5 700</td></tr></table>')

# (question, part, marks, answer_type, topics, figure, diagram, html, answer, accept)
Q = [
 ('1', '1', 2, 'drawing', TEL, 'diagram', axis11(),
  '<p>Draw a ray diagram for a Cassegrain telescope.</p><p>Your diagram should show the paths of '
  '<b>two</b> rays up to the eyepiece lens.</p><p>The rays should initially be parallel to the '
  'principal axis.</p>',
  'One mark for the mirrors: a concave primary mirror (with a hole in the middle, which can be '
  'inferred from rays passing through it) and a convex secondary mirror. A flat secondary is condoned '
  'only if labelled convex; a concave secondary is not. The primary must not look like two mirrors. '
  'One mark for the two rays: initially parallel to the principal axis, reflecting off the primary '
  'to the secondary, then crossing on the principal axis after the secondary and before passing '
  'through the primary (crossing after the primary is condoned if it is before a lens). No lens is '
  'needed; arrows on rays are ignored; poorly drawn (e.g. curved) rays lose the mark.', ''),
 ('1', '2', 3, 'explain', TEL, '', '',
  '<p>A spacecraft passes Pluto at a distance of 12 500 km. The telescope on board has an aperture '
  'of diameter 0.21 m and operates at a wavelength of 450 nm.</p><p>Discuss whether this telescope '
  'is suitable for studying a crater with a diameter of approximately 1 km on Pluto.</p>',
  'Resolution θ = λ/D = 450 × 10⁻⁹ / 0.21 = 2.14 × 10⁻⁶ rad ✓. Smallest detail = 2.14 × 10⁻⁶ × '
  '12.5 × 10⁶ = 27 m ✓. A sensible comparison and a decision ✓ — e.g. 27 m is about 1/40th of the '
  'crater, so the telescope is suitable. Alternatively for the second mark, find the angle the 1 km '
  'crater subtends (8.0 × 10⁻⁵ rad) and compare the two angles for the third.', ''),
 ('1', '3', 2, 'short', TEL, '', '',
  '<p>The Hubble telescope has an aperture of diameter 2.4 m.</p><p>Compare the collecting power of '
  'the Hubble telescope with the telescope on the spacecraft in Question 01.2.</p>',
  'Collecting power ∝ area (∝ d² condoned if d is clearly the diameter) ✓. Ratio = 2.4² / 0.21² ≈ '
  '130, so Hubble collects about 130 times as much; OR calculates both areas and states Hubble\'s is '
  'much bigger ✓.', ''),
 ('1', '4', 3, 'explain', TEL, '', '',
  '<p>An astrophysicist had to decide whether to use a reflecting telescope or a refracting '
  'telescope on the spacecraft in Question 01.2.</p><p>Discuss which type of telescope to use.</p>',
  'At least two clear comparisons ✓✓, and a decision justified by the effect of at least one of them '
  'on the image — likely a reflector ✓. Against refractors: spherical and chromatic aberration; '
  'reflectors are lighter and shorter, and mirrors do not suffer chromatic aberration. Against '
  'reflectors: the spider / secondary mirror blocks some light, reduces image brightness and causes '
  'diffraction effects. Cost, difficulty of construction and air trapped in a refractor are ignored.',
  ''),
 ('2', '1', 1, 'short', STA, '', '',
  '<p>Which star has the highest surface temperature?</p><p>Tick (&#10003;) <b>one</b> box.</p>'
  '<ul><li>Caph</li><li>Ruchbah</li><li>Schedar</li><li>Tsih</li></ul>',
  'Tsih (the blue star).', 'Tsih'),
 ('2', '2', 4, 'explain', STA, 'graph', fig1(),
  '<p><b>Figure 1</b> shows the intensity received at Earth from two of the stars, plotted against '
  'wavelength.</p><p>The effect of absorption by the Earth&rsquo;s atmosphere is not shown.</p>'
  '<p>Discuss what information can be found from <b>Figure 1</b> about the temperature and colour '
  'of these stars.</p><p>Support your answer with suitable calculations.</p>',
  'Temperature: an attempt to use Wien\'s law ✓ and a correct T for both stars ✓. Caph peaks at about '
  '410 nm: T = 2.9 × 10⁻³ / λmax ≈ 7250 K, accepted 6900–7630 K (the scheme prints 410 × 10⁻⁹ beside '
  '7250 K; 2.9 × 10⁻³ / 410 × 10⁻⁹ is 7070 K, also inside the range). Schedar peaks at about 660 nm: '
  'T = 2.9 × 10⁻³ / 660 × 10⁻⁹ ≈ 4400 K, accepted 3600–5200 K. Error carried forward from wrong '
  'temperatures is allowed. Colour: links colour to the wavelengths produced ✓ and Schedar emits '
  'longer wavelengths so is \'redder\' than Caph ✓; OR links temperature to spectral class ✓ — Caph '
  'is class F (white), Schedar class K (orange) ✓. Just stating the colours earns nothing.', ''),
 ('2', '3', 1, 'short', STA, '', '',
  '<p>State which star in <b>Table 1</b> is dimmest on the absolute magnitude scale.</p>',
  'Caph.', 'Caph'),
 ('2', '4', 3, 'calculation', STA, '', '',
  '<p>Calculate the absolute magnitude of Schedar.</p>',
  'Converts 228 ly to parsec: 70 pc ✓. Uses m − M = 5 log(d/10), rearranged to M = m − 5 log(d/10) ✓. '
  'M = 2.2 − 5 log(70/10) = −2.0 (−2.025), to at least 2 significant figures ✓. Error carried forward '
  'for a wrong conversion only if there is an attempt to convert.',
  '-2.0 | -2.03 | -2.02 | -2.025'),
 ('2', '5', 2, 'calculation', STA, '', '',
  '<p>Tsih has a mass over 15 times the mass of the Sun.</p><p>Tsih may eventually collapse to form '
  'a black hole.</p><p>Calculate the radius of the event horizon for a black hole with a mass 15 '
  'times that of the Sun.</p>',
  'R<sub>s</sub> = 2GM/c² = 2 × 6.67 × 10⁻¹¹ × 15 × 1.99 × 10³⁰ / (3.00 × 10⁸)² ✓ = 4.4 × 10⁴ m ✓. '
  'Using ≈ rather than = is fine; error carried forward for a power-of-ten error only.',
  '4.4 × 10^4 | 44000 | 4.4 × 10^4 m'),
 ('3', '1', 1, 'short', COS, '', '',
  '<p>State what is meant by a standard candle.</p>',
  'An object of known absolute magnitude ✓ — other wordings are fine as long as it is clear the '
  'intrinsic power / brightness is what is known.', ''),
 ('3', '2', 3, 'drawing', COS, 'graph', fig2(),
  '<p>Sketch on <b>Figure 2</b> the light curve for a type 1a supernova.</p><p>Annotate your graph '
  'with suitable scales and a unit for time.</p>',
  'Peak absolute magnitude between −18 and −20 AND the magnitude axis in the correct direction '
  '(more negative upwards) — the minus sign is essential ✓. A time scale of 40 to 500 days (any time '
  'unit that fits that range is accepted) ✓. The rise on the left steeper than the fall on the right, '
  'by eye ✓. Axes starting at 0 are allowed.', ''),
 ('3', '3', 6, 'written', COS, '', '',
  '<p>Measurements of type 1a supernovae are used to find a value for the Hubble constant.</p>'
  '<p>The distance from Earth is known for many type 1a supernovae.</p><p>Describe how these values '
  'of distance are used, with other data, to find the Hubble constant.</p><p>Your answer should '
  'include:</p><ul><li>the other data needed and how these data are used</li><li>the graph plotted, '
  'including appropriate units for the axes</li><li>how the Hubble constant is obtained and any '
  'limitations on the result.</li></ul>',
  'Level-marked out of 6: 6 — all three areas covered, at least two in some detail; 5 — a fair '
  'attempt at all three; 4 — two areas discussed, or one discussed and two partly; 3 — one discussed '
  'and one partly, or all three partly; 2 — one area, or partial attempts at two; 1 — none of the '
  'three without significant error. Data: also need the red shift z, found by measuring the '
  'wavelength of spectral lines; use z to find the recession velocity, v = zc. Graph: velocity on the '
  'y-axis against distance on the x-axis, v in km s⁻¹ and distance in Mpc; H is the gradient. '
  'Limitations: the apparent magnitude may be affected by what the light passes through; much scatter '
  'in the data (with a specific reason, e.g. variation between galaxies or random measurement error); '
  'at large distances the accelerating universe affects the graph; data are needed from many '
  'supernovae.', ''),
 ('4', '1', 2, 'calculation', STA, '', '',
  '<p>Calculate <sup>power output of Melnick 34</sup>&frasl;<sub>power output of the Sun</sub>.</p>',
  'Uses P = σAT⁴ (a substitution for either star earns this) ✓. Ratio = (1.4 × 10¹⁰)² × 53000⁴ / '
  '((7.0 × 10⁸)² × 5700⁴) = 3.0 × 10⁶ ✓.',
  '3.0 × 10^6 | 3 × 10^6 | 3000000'),
 ('4', '2', 2, 'explain', STA, '', '',
  '<p>Discuss why the evolution of a supergiant star in the local part of our galaxy could be '
  'dangerous for life on Earth.</p>',
  'The star will undergo a supernova / collapse, or form a neutron star or black hole ✓, which '
  'produces a gamma ray burst AND a consequence for life (e.g. kills cells, damages DNA) or a '
  'reference to the burst being highly collimated ✓.', ''),
]

# Shared stems a question's parts hang from, drawn on every part by preamble_.
PRE = {
 '2': '<p><b>Table 1</b> summarises some information about four stars in the constellation '
      'Cassiopeia.</p>' + T1,
 '3': '<p>Type 1a supernovae can be used as standard candles.</p>',
 '4': '<p><b>Table 2</b> gives data about the supergiant star Melnick 34 and the Sun.</p>' + T2,
}

SCHEME_TOTALS = {'1': 10, '2': 11, '3': 10, '4': 4}
for q, t in SCHEME_TOTALS.items():
    assert sum(m for qq, _, m, *_ in Q if qq == q) == t, 'question %s does not sum to %d' % (q, t)
assert sum(SCHEME_TOTALS.values()) == 35 == sum(r[2] for r in Q)

ROWS = [dict(BASE, row_id='D-' + PAPER, kind='document', total_marks='35',
             needs='Calculator, Ruler, Equation booklet',
             source_url='https://drive.google.com/file/d/%s/view' % QP)]
for q, html in PRE.items():
    ROWS.append(dict(BASE, row_id='Q-AQA-7408-2011-3BA-%02d' % int(q), kind='preamble',
                     question=q, part='', section='', html=html,
                     topics={'2': STA, '3': COS, '4': STA}[q]))
ROWS.sort(key=lambda r: (r['kind'] != 'document', r.get('question', '')))
out = [ROWS[0]]
for q, part, marks, atype, topics, figure, diagram, html, answer, accept in Q:
    pre = [r for r in ROWS[1:] if r['question'] == q]
    if pre and pre[0] not in out:
        out.append(pre[0])
    out.append(dict(BASE, row_id='Q-AQA-7408-2011-3BA-%02d%s' % (int(q), part), kind='question',
                    question=q, part=part, section='', marks=str(marks), html=html,
                    answer=answer, accept=accept, answer_type=atype, topics=topics,
                    figure=figure, diagram=diagram, diagram_by=('family' if diagram else ''),
                    placeholder=''))
ROWS = out
