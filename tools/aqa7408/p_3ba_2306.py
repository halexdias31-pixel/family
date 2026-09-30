"""AQA A-level Physics 7408/3BA — Paper 3 Section B, Option A: Astrophysics — June 2023.

Every answer is READ OFF AQA's own scheme, `Mark scheme (A-level) _ Paper 3 Section B Option A
Astrophysics - June 2023` (its cover says 7408/3BA, June 2023, Version 1.0 Final, and every value
in it — 0.11 and −7.84 in 01.3, 374.96 and 373.53 nm in 03.3, Table 3 in 04 — is this paper's).
The 2017 Highers are why that is the rule and not a preference.

The cover says 35 marks, and the Question-mark boxes down the pages say 7, 9, 8, 6 and 5. Both are
asserted below, and so is every intermediate the scheme prints inside its own working.

TWO FIGURES ARE DRAWN AND BOTH ARE MEASURED OFF THE PAPER, NOT EYEBALLED. Both are raster images
in the PDF with no text layer and no vectors.
  * Figure 2 (05.1) is twelve crosses on a v–d grid. The gridlines were found by their regular
    spacing in the embedded image (x: 0 at px 369.5, 200 Mpc at 1314; y: 0 at px 744.5, 12 000
    km/s at 36) and each cross located as a connected dark blob. The scheme's acceptable band —
    a line through the origin meeting 12 000 km/s between 160 and 200 Mpc — is recomputed below
    and gives its own 4.1 to 5.1 × 10¹⁷ s.
  * Figure 1 (01.4) is the paper's Hertzsprung–Russell outline: the axes (spectral class O to M,
    absolute magnitude −10 to 15) are printed numbers, and the four regions are redrawn from their
    measured positions on the page. It carries no answer — 01.4 asks for the Sun's evolutionary
    path, which is the student's own line — so it is drawn for the pen to go on.
"""
import datetime, math, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from svgplot import W, scatter

PAPER = 'P-AQA-7408-2306-3BA'
QP = '1OM5xFiWHOcVog-QAJ5i5mh-Dx72SQKep'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS5', band_type='stage',
           band_value='A-Level', level='Alevel', company='AQA', exam_board='AQA',
           spec_code='7408/3BA', exam_wave='First wave', year='2023', month='6', paper='3',
           exam_date='2023-06-15', document_type='Past paper',
           name='Paper 3 Section B: Astrophysics — June 2023', active='True',
           trackable='True', printable='False')

A = 'Astrophysics'
TEL = A + ', Telescopes'
STAR = A + ', Classification of Stars'
COS = A + ', Cosmology'

# ---------------------------------------------------------------------------------------------
# FIGURE 1 — the HR diagram, redrawn from measured pixel positions of the embedded image (1366 ×
# 900 px). Axis: spectral-class tick boundaries at x = 308 + 144.3k; absolute magnitude −10 at
# y 43, 15 at y 763 (28.8 px per magnitude). Everything is mapped through one scale, `P()`.
# ---------------------------------------------------------------------------------------------
def fig1():
    s = 274 / 1042.0
    X = lambda px: 52 + (px - 308) * s
    Y = lambda py: 14 + (py - 15) * s
    B = Y(763)
    o = ['<svg viewBox="0 0 %d %d" role="img" aria-label="Hertzsprung–Russell diagram: absolute '
         'magnitude from −10 at the top to 15 at the bottom against spectral class O B A F G K M, '
         'with outlined regions for supergiants, giants, the main sequence and white dwarfs">'
         % (W, int(B + 44))]
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>' % (X(308), Y(15), X(308), B))
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>' % (X(308), B, X(1350), B))
    for k in range(8):
        x = X(308 + 144.3 * k)
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>' % (x, B, x, B + 4))
    for k, c in enumerate('OBAFGKM'):
        o.append('<text x="%.1f" y="%.1f" class="num">%s</text>' % (X(380 + 144.3 * k), B + 16, c))
    for mag in (-10, -5, 0, 5, 10, 15):
        y = Y(43 + 28.8 * (mag + 10))
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>' % (X(308) - 4, y, X(308), y))
        o.append('<text x="%.1f" y="%.1f" class="num" style="text-anchor:end">%s</text>'
                 % (X(308) - 6, y + 4, str(mag).replace('-', '−')))
    for cx, cy, rx, ry, lab in ((930, 93, 425, 48, 'supergiants'), (1097, 313, 185, 48, 'giants'),
                                (528, 663, 107, 55, 'white dwarfs')):
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" stroke="currentColor" '
                 'stroke-width="1"/>' % (X(cx), Y(cy), rx * s, ry * s))
        words = lab.split(' ') if lab == 'white dwarfs' else [lab]    # two lines, as printed
        for i, w in enumerate(words):
            o.append('<text x="%.1f" y="%.1f" class="lbl" style="text-anchor:middle">%s</text>'
                     % (X(cx), Y(cy) + 4 + (i - (len(words) - 1) / 2.0) * 12, w))
    band = [(360, 90), (400, 55), (450, 70), (520, 170), (600, 255), (700, 320), (800, 370),
            (900, 405), (1000, 445), (1110, 510), (1195, 590), (1250, 640), (1285, 690),
            (1240, 740), (1200, 730), (1120, 650), (1050, 585), (950, 530), (850, 485),
            (700, 430), (560, 350), (500, 290), (420, 200), (360, 120)]
    o.append('<polygon points="%s" fill="none" stroke="currentColor" stroke-width="1" '
             'stroke-linejoin="round"/>' % ' '.join('%.1f,%.1f' % (X(a), Y(b)) for a, b in band))
    o.append('<text x="%.1f" y="%.1f" class="lbl" style="text-anchor:middle">main sequence</text>'
             % (X(930), Y(630)))
    o.append('<text x="%.1f" y="%.1f" class="ax" style="text-anchor:middle">spectral class</text>'
             % ((X(308) + X(1350)) / 2, B + 36))
    o.append('<text x="12" y="%.1f" class="ax" style="text-anchor:middle" transform="rotate(-90 12 %.1f)">'
             'absolute magnitude</text>' % ((Y(15) + B) / 2, (Y(15) + B) / 2))
    return ''.join(o) + '</svg>'

# ---------------------------------------------------------------------------------------------
# FIGURE 2 — twelve crosses, measured (see the module note). d in Mpc, v in km/s.
# ---------------------------------------------------------------------------------------------
FIG2 = [(58, 4290), (64.5, 5290), (91, 5290), (92.5, 7500), (97, 6700), (103, 5090),
        (120, 9030), (122.5, 9880), (145, 10660), (145, 9600), (158, 8930), (185, 9530)]

def fig2():
    return scatter(200, 12000, 50, 2000, 'd / Mpc', 'v / km s⁻¹',
                   'Graph of recession speed v against distance d for twelve galaxies', FIG2,
                   xminor=5)

TABLE1 = ('<p><b>Table 1</b> shows data for two stars: Rigel and the Sun.</p>'
          '<table><tr><th>Star</th><th>Surface temperature / K</th><th>Absolute magnitude</th>'
          '<th>Mass / kg</th></tr>'
          '<tr><td>Rigel</td><td>12 000</td><td>−7.84</td><td>3.6 &times; 10<sup>31</sup></td></tr>'
          '<tr><td>Sun</td><td>5700</td><td>4.83</td><td>2.0 &times; 10<sup>30</sup></td></tr></table>')

STEM2 = ('<p>V1031 and WASP-82 are two stars in the constellation Orion. V1031 appears 40 times '
         'brighter than WASP-82 when viewed from Earth. The apparent magnitude of V1031 is 6.0</p>')

TABLE2 = ('<p><b>Table 2</b> shows data about the EHT and the Hubble telescope.</p>'
          '<table><tr><th></th><th>Aperture</th><th>Operating wavelength</th></tr>'
          '<tr><td>EHT</td><td>1.3 &times; 10<sup>7</sup> m</td><td>1.3 mm</td></tr>'
          '<tr><td>Hubble</td><td>2.4 m</td><td>410 nm</td></tr></table>')

TABLE3 = ('<table><tr><th></th><th>Temperature / K</th><th>Radius of star / m</th>'
          '<th>Apparent magnitude</th></tr>'
          '<tr><td>M40 A</td><td>6000</td><td>6.3 &times; 10<sup>9</sup></td><td>9.7</td></tr>'
          '<tr><td>M40 B</td><td>4700</td><td>1.1 &times; 10<sup>10</sup></td><td>10.1</td></tr></table>')

TICK = ('<table><tr><th colspan="2">Objective lens</th><th colspan="2">Eyepiece lens</th></tr>'
        '<tr><th>Focal length / cm</th><th>Type</th><th>Focal length / cm</th><th>Type</th></tr>'
        '<tr><td>5</td><td>diverging</td><td>100</td><td>converging</td></tr>'
        '<tr><td>5</td><td>converging</td><td>100</td><td>converging</td></tr>'
        '<tr><td>100</td><td>diverging</td><td>5</td><td>converging</td></tr>'
        '<tr><td>100</td><td>converging</td><td>5</td><td>converging</td></tr></table>')

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, accept)
Q = [
 ('1', '1', 1, 'drawing', STAR, '', '',
  '<p>Draw a labelled diagram to define the parsec (pc).</p>',
  'A right-angled triangle with the Sun–Earth distance labelled 1 AU as the short side, the '
  'distance to the star labelled 1 pc (either long side), and the angle at the star labelled '
  '1/3600° — one arc second (1″, 2.8 × 10⁻⁴ degrees or 4.8 × 10⁻⁶ rad are also accepted). '
  '"au" is condoned for AU, and d is condoned for 1 pc.', ''),
 ('1', '2', 1, 'short', STAR, '', '',
  '<p>State the spectral class of Rigel.</p>',
  'B', 'B'),
 ('1', '3', 2, 'calculation', STAR, '', '',
  '<p>The apparent magnitude of Rigel is 0.11</p><p>Calculate, in pc, the distance from Rigel '
  'to the Earth.</p><p>distance = ______ pc</p>',
  'd = 390 pc. m − M = 0.11 − (−7.84) = 7.95 (0.11 + 7.84 is condoned if m − M is seen), then '
  'd = 10<sup>(m − M + 5)/5</sup> = 10<sup>2.59</sup>; the calculator value is 389.0451. One mark '
  'for evidence of the 10<sup>x</sup> step or of 0.11 − (−7.84); one for 390.',
  '389 to 390'),
 ('1', '4', 1, 'drawing', STAR, 'graph', fig1(),
  '<p><b>Figure 1</b> shows a Hertzsprung–Russell (HR) diagram.</p><p>Draw a line on '
  '<b>Figure 1</b> to show the evolution of the Sun from formation to white dwarf.</p>',
  'A line coming in from the right to absolute magnitude about 5, class G (the Sun on the main '
  'sequence), then up to the giants, then down to the white dwarfs — in that order. A missing '
  'arrow is condoned; the scheme shows a shaded region of acceptable positions for the first '
  '(protostar) part of the line, coming in from the right.', ''),
 ('1', '5', 2, 'explain', STAR, '', '',
  '<p>One stage in the evolution of Rigel includes the emission of a gamma ray burst.</p>'
  '<p>Outline the circumstances during which a gamma ray burst will be emitted by Rigel.</p>',
  'The gamma ray burst is produced when the supergiant (Rigel) collapses (1 mark), and forms a '
  'neutron star or a black hole (1 mark). References to "supernova" are ignored.', ''),

 ('2', '1', 1, 'written', TEL, '', '',
  '<p>State what is meant by <b>normal adjustment</b> when applied to an astronomical refracting '
  'telescope.</p>',
  'The final image is at infinity. Also accepted: the focal points of the objective and eyepiece '
  'lenses coincide, or the distance between the lenses is f<sub>o</sub> + f<sub>e</sub> (if '
  'f<sub>o</sub> and f<sub>e</sub> are used they must be defined). "Rays leaving the eyepiece are '
  'parallel" is condoned.', ''),
 ('2', '2', 1, 'short', TEL, '', '',
  '<p>Which combination of lenses gives the largest angular magnification when used as an '
  'astronomical telescope in normal adjustment?</p><p>Tick (&#10003;) <b>one</b> box.</p>' + TICK,
  'Objective: focal length 100 cm, converging; eyepiece: focal length 5 cm, converging.', ''),
 ('2', '3', 2, 'calculation', TEL, '', '',
  STEM2 + '<p>Calculate the apparent magnitude of WASP-82.</p><p>apparent magnitude = ______</p>',
  '10. Each step on the magnitude scale is a factor of 2.51, so 2.51<sup>x</sup> = 40 and '
  'x = log<sub>2.51</sub>(40) = 4(.01) — or adding 6 to their x (1 mark); 6 + 4 = 10 (1 mark). '
  'Trial and error is condoned; a bald correct answer with no working scores 1 mark only.',
  '10 to 10.1'),
 ('2', '4', 2, 'explain', TEL, '', '',
  STEM2 + '<p>V1031 is just visible to the naked eye of an astronomer when her pupil diameter is '
  '7 mm.</p><p>Suggest whether she can observe WASP-82 using a telescope with an objective '
  'diameter of 60 mm.</p><p>Support your answer with a calculation.</p>',
  'Yes. The collecting power of the telescope is (60/7)² = 73 or 74 times that of the naked eye '
  '(1 mark; (7/60)² = 0.014 is accepted); 73 (or 74) is greater than 40, so she can see WASP-82 '
  '(1 mark). An error carried forward is allowed for the second mark — e.g. 60/7 = 8.6 times, '
  'with the idea that 8.6 is less than 40 so she cannot.', ''),
 ('2', '5', 3, 'explain', TEL, '', '',
  '<p>CCDs are often connected to telescopes.</p><p>Explain <b>two</b> reasons why this improves '
  'the ability of astronomers to observe dim stars.</p>',
  'Two clear reasons (2 marks) and a correct justification linked to one of them (1 mark); with '
  'no justification, MAX 2. Reasons with their justifications: greater quantum efficiency — a '
  'greater proportion of the incident photons are detected ("efficiency" alone is not allowed); '
  'can expose for long periods or many images can be combined — more light is collected, better '
  'image contrast; can operate remotely — the telescope can be placed where light pollution or '
  'atmospheric absorption is minimised; can detect wavelengths beyond the visible — more energy '
  'is collected from the star. "Image processing" is neutral; references to resolution are '
  'ignored.', ''),

 ('3', '1', 1, 'written', STAR, '', '',
  '<p>State the defining property of a black hole.</p>',
  'An object whose escape velocity is greater than the speed of light, or whose gravitational '
  'field is so strong that light cannot escape. "Mass", "density", "light cannot escape" or '
  '"light cannot escape its gravity" on their own are not accepted.', ''),
 ('3', '2', 4, 'calculation', TEL + ', Classification of Stars', '', '',
  '<p>In 2019, astronomers linked several radio telescopes to produce a single telescope called '
  'the EHT. The resolution of the EHT is the same as the resolution that a telescope with an '
  'aperture equal to the diameter of the Earth could achieve.</p>' + TABLE2 +
  '<p>Galaxy M87 is 5.3 &times; 10<sup>7</sup> light years from Earth. The supermassive black '
  'hole at the centre of M87 has a mass 6.5 &times; 10<sup>9</sup> times the mass of the Sun.</p>'
  '<p>The radius of the event horizon is <i>R</i>.</p><p>The astronomers propose to use either '
  'the EHT or the Hubble telescope to observe stars whose distance from the centre of the black '
  'hole is less than 1000<i>R</i>.</p><p>Discuss, with calculations, which telescope is more '
  'suitable for this observation.</p>',
  'The EHT. R<sub>s</sub> = 2GM/c² = 2 × 6.67 × 10⁻¹¹ × 6.5 × 10⁹ × 1.99 × 10³⁰ / (3 × 10⁸)² = '
  '1.9 × 10¹³ m (1). The region subtends 1.917 × 10¹³ × 2 × 1000 / (5.3 × 10⁷ × 9.46 × 10¹⁵) = '
  '7.6 × 10⁻⁸ rad (1; 3.8 × 10⁻⁸ without the 2 is condoned). Resolution of the EHT = '
  '1.3 × 10⁻³ / 1.3 × 10⁷ = 1.0 × 10⁻¹⁰ rad, or of Hubble = 410 × 10⁻⁹ / 2.4 = 1.71 × 10⁻⁷ rad '
  '(1). Both resolutions correct and the conclusion that the EHT is better than Hubble (1). '
  'Alternative: the smallest size each can resolve at the distance of M87 is 5.0 × 10¹³ m for the '
  'EHT and 8.6 × 10¹⁶ m for Hubble. Rounding errors are condoned.', ''),
 ('3', '3', 3, 'calculation', COS, '', '',
  '<p>A star is orbiting the black hole in M87. The star is observed in the plane of its orbit.</p>'
  '<p>The wavelength of a spectral line observed in the light emitted from the star varies between '
  'a maximum and a minimum value.</p><p>maximum value observed = 374.96 nm<br>minimum value '
  'observed = 373.53 nm</p><p>Calculate the orbital speed of the star.</p>'
  '<p>orbital speed = ______ m s<sup>&minus;1</sup></p>',
  '5.7 × 10⁵ m s⁻¹. Difference in wavelength 374.96 − 373.53 = 1.43 nm, so Δλ = 0.72 nm (1); '
  'sum 748.49 nm, so the mean is 374.25 nm (1); z = 0.72 / 374.25 = 1.9 × 10⁻³ and '
  'v = zc = 1.9 × 10⁻³ × 3.00 × 10⁸ = 5.7 × 10⁵ m s⁻¹ (1). Alternatively '
  'z = (374.96 − 373.53)/(374.96 + 373.53).',
  '570000 to 573200 | 5.7 × 10^5 | 5.7x10^5 | 5.73 × 10^5'),

 ('4', '', 6, 'written', STAR, '', '',
  '<p>M40 A and M40 B are two stars that appear very close to each other when viewed from '
  'Earth.</p><p>There are two possible reasons for this:</p><ul><li>they are an orbiting binary '
  'system</li><li>they are distant from each other and only appear in the same line of '
  'sight.</li></ul><p>In an orbiting binary system, the difference between the apparent magnitude '
  'and the absolute magnitude for each star is similar.</p><p><b>Table 3</b> shows data about these '
  'two stars.</p>' + TABLE3 +
  '<p>Discuss the appearance of the two stars to an astronomer on the Earth.</p><p>In your answer '
  'you should:</p><ul><li>compare the colour of the stars</li><li>compare the brightness of the '
  'stars</li><li>deduce, with a calculation, whether the stars form an orbiting binary '
  'system.</li></ul>',
  'Level-marked out of 6: 6 — all three areas covered, at least two in some detail; 5 — two '
  'areas successful and one partial; 3–4 — two areas successful, or one successful and others '
  'partial; 1–2 — one area. Colour: M40 B appears more red than M40 A because it is cooler; M40 A '
  'is an F/G star (white / yellow-white) and M40 B a K-class star (orange). Brightness: M40 A '
  'appears brighter, its apparent magnitude being 0.4 less; the ratio is 2.51<sup>0.4</sup> = '
  '1.5. Binary: using P = σAT⁴, P<sub>A</sub> = 5.67 × 10⁻⁸ × 4π × (6.3 × 10⁹)² × 6000⁴ = '
  '3.66 × 10²⁸ W and P<sub>B</sub> = 5.67 × 10⁻⁸ × 4π × (1.1 × 10¹⁰)² × 4700⁴ = 4.22 × 10²⁸ W. '
  'A has the lower power output yet appears brighter, so A must be closer — they are not a '
  'binary.', ''),

 ('5', '1', 3, 'calculation', COS, 'scatter', fig2(),
  '<p><b>Figure 2</b> shows, for some galaxies, how their recession speed <i>v</i> varies with '
  'distance <i>d</i> from the Earth.</p><p>Estimate, using <b>Figure 2</b>, the age in seconds of '
  'the Universe.</p><p>age of Universe = ______ s</p>',
  'An age in the range 4.1 to 5.1 × 10¹⁷ s. A line of best fit drawn through the origin (1) — '
  'lines meeting v = 12 000 km s⁻¹ somewhere between d = 160 and 200 Mpc are accepted; evidence of '
  'H = Δv/Δd used (1); then age = 1/H in range (1). Using H = 65 km s⁻¹ Mpc⁻¹ is not accepted '
  'unless it is obtained from the gradient.', ''),
 ('5', '2', 2, 'written', COS, '', '',
  '<p>The estimate in Question 05.1 assumes that the Universe has expanded at a constant rate. '
  'Measurements involving type 1a supernovae that are at large distances from Earth caused '
  'astronomers to make a modification to this assumption.</p><p>State:</p><ul><li>the '
  'modification</li><li>the explanation that was proposed to account for this '
  'modification.</li></ul>',
  'The expansion is accelerating — the rate of expansion is increasing (1); due to dark energy '
  '(1). "Dark matter" is not allowed.', ''),
]

PER_QUESTION = {'1': 7, '2': 9, '3': 8, '4': 6, '5': 5}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 35, 'the cover says 35 and these sum to %d' % sum(got.values())

# ---- every intermediate the scheme prints, recomputed ----
assert round(10 ** ((0.11 - (-7.84) + 5) / 5), 4) == 389.0451                      # 01.3
assert round(math.log(40, 2.51), 2) == 4.01 and round(6.0 + math.log(40, 2.51)) == 10  # 02.3
assert 73 <= (60 / 7) ** 2 <= 74 and round((7 / 60) ** 2, 3) == 0.014              # 02.4
Rs = 2 * 6.67e-11 * 6.5e9 * 1.99e30 / (3e8) ** 2
D = 5.3e7 * 9.46e15
assert round(Rs / 1e13, 3) == 1.917                                                # 03.2
assert round(Rs * 2 * 1000 / D / 1e-8, 2) == 7.65 or round(Rs * 2 * 1000 / D / 1e-8, 1) == 7.6
assert round(1.3e-3 / 1.3e7 / 1e-10, 3) == 1.0 and round(410e-9 / 2.4 / 1e-7, 2) == 1.71
assert round(1e-10 * D / 1e13, 1) == 5.0 and round(410e-9 / 2.4 * D / 1e16, 1) == 8.6
assert 1.3e-3 / 1.3e7 < 410e-9 / 2.4 < Rs * 2000 / D * 3                          # EHT resolves it
assert round(374.96 - 373.53, 2) == 1.43 and round(374.96 + 373.53, 2) == 748.49   # 03.3
z = (374.96 - 373.53) / (374.96 + 373.53)
assert round(z, 4) == 0.0019 and round(z * 3.00e8, -4) == 570000
assert round(0.0019 * 3.00e8) == 570000
PA = 5.67e-8 * 4 * math.pi * (6.3e9) ** 2 * 6000 ** 4                              # 04
PB = 5.67e-8 * 4 * math.pi * (1.1e10) ** 2 * 4700 ** 4
assert round(PA / 1e28, 2) == 3.67 or round(PA / 1e28, 2) == 3.66
assert abs(PB / 1e28 - 4.22) < 0.02 and PA < PB                                    # A dimmer source
assert round(2.51 ** 0.4, 1) == 1.4 or round(2.51 ** 0.4, 2) == 1.45               # ≈1.5 in the scheme
MPC = 3.086e22
assert round(160 * MPC / 12000e3 / 1e17, 1) == 4.1 and round(200 * MPC / 12000e3 / 1e17, 1) == 5.1  # 05.1
# the measured crosses themselves sit in the scheme's band: a least-squares line through the origin
H = sum(d * v for d, v in FIG2) / sum(d * d for d, v in FIG2)
assert 4.1 <= MPC / (H * 1e3) / 1e17 <= 5.1
d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() == 3 and (d.year, d.month, d.day) == (2023, 6, 15)              # cover: Thursday

ROWS = [dict(DOC, row_id='D-' + PAPER, kind='document', total_marks='35',
             needs='Calculator, Ruler, Protractor, Equation booklet',
             source_url='https://drive.google.com/file/d/%s/view' % QP)]
ROWS.append(dict(DOC, row_id='Q-AQA-7408-2306-3BA-01', kind='preamble', question='1',
                 section='', html=TABLE1, topics=STAR))
for q, part, marks, atype, topics, figure, diagram, html, answer, accept in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-7408-2306-3BA-%02d%s' % (int(q), part), kind='question',
             question=q, part=part, section='', marks=str(marks), html=html,
             answer=answer, answer_type=atype, topics=topics, figure=figure,
             diagram=diagram, diagram_by=('family' if diagram else ''), placeholder='',
             accept=accept)
    ROWS.append(r)
