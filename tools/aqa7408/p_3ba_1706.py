"""AQA A-level Physics 7408/3BA, Paper 3 Section B (Astrophysics), June 2017 — 14 question rows.

Every answer is READ off AQA's own scheme ('p3b mark scheme.pdf', whose cover says "A-LEVEL Physics
7408/3BA PAPER 3 SECTION B - Astrophysics Mark scheme June 2017 Version: 1.0 Final") — not
derived. The cover's total (35) and the scheme's own "Total" lines (2, 7, 13, 7, 6) are asserted
below, and so is every number the scheme prints inside its own working.

ONE FIGURE AND IT IS DRAWN. Figure 1 (04.1) is a pair of blank axes labelled "absolute magnitude"
and "time/days" with NO scale on either — adding the scales is the first of the question's three
marks — so the words determine the whole picture and nothing about the answer is in it. Question 01
asks for a drawing and prints nothing to draw on. Tables 1 and 2 are tables and are <table> markup.
"""
import math, datetime

PID = 'P-AQA-7408-1706-3BA'
Q = 'Q-AQA-7408-1706-3BA-'
TOTAL = 35
W = 340

DOC = dict(row_id='D-' + PID, paper_id=PID, kind='document', active='True',
           name='Paper 3 Section B: Astrophysics — June 2017', subject='Physics', key_stage='KS5',
           band_type='stage', band_value='A-Level', level='Alevel', company='AQA', exam_board='AQA',
           spec_code='7408/3BA', exam_wave='First wave', year='2017', month='6', paper='3',
           exam_date='2017-06-29', document_type='Past paper', total_marks=str(TOTAL),
           needs='Calculator, Ruler, Equation booklet',
           source_url='https://drive.google.com/file/d/11q0TsS5Hg7kTW65D3tbyyNmXvuL9nU9G/view',
           trackable='True', printable='False')
# the cover prints "Thursday 29 June 2017"
assert datetime.date(2017, 6, 29).strftime('%A') == 'Thursday'

BASE = {k: DOC[k] for k in ('paper_id', 'subject', 'key_stage', 'band_type', 'band_value', 'level',
                            'company', 'exam_board', 'spec_code', 'exam_wave', 'year', 'month',
                            'paper', 'exam_date', 'document_type', 'name', 'active', 'trackable',
                            'printable')}

TEL = 'Astrophysics, Telescopes'
STAR = 'Astrophysics, Classification of Stars'
COS = 'Astrophysics, Cosmology'


def row(rid, q, part, marks, html, answer, atype, topics, accept='', figure='', diagram='',
        diagram_by='', kind='question'):
    r = dict(BASE, row_id=Q + rid, kind=kind, question=q, part=part, section='', html=html,
             topics=topics, figure=figure, diagram=diagram, diagram_by=diagram_by, placeholder='')
    if kind == 'question':
        r.update(marks=str(marks), answer=answer, answer_type=atype, accept=accept)
    return r


# ---- the scheme's own arithmetic ------------------------------------------------------------
# 02.1: collecting power goes as D^2 — B (400 mm) against A (70 mm).
ratio = (400 / 70) ** 2
assert round(ratio, 1) == 32.7
# 03.3: Wien's law, lambda_max T = 0.0029 m K, lambda_max = 1.0 um -> 2.9 x 10^3 K
T = 2.9e-3 / 1.0e-6
assert round(T) == 2900
# 03.6: m - M = 5 log(d/10), Sarin m = 3.1, d = 23 pc -> 3.1 - M = 1.8, M = 1.3
five_log = 5 * math.log10(23 / 10)
assert round(five_log, 1) == 1.8
assert round(3.1 - five_log, 1) == 1.3
# 03.5: absolute magnitude from m and d for all four — Rasalgethi is the brightest (most negative)
stars = {'Kornephoros': (43, 2.8), 'Rasalgethi': (110, 3.0), 'Rutilicus': (11, 2.8),
         'Sarin': (23, 3.1)}
absm = {s: m - 5 * math.log10(d / 10) for s, (d, m) in stars.items()}
assert min(absm, key=absm.get) == 'Rasalgethi'
# 03.2: same class G, same m, Kornephoros further away -> brighter absolute magnitude
assert absm['Kornephoros'] < absm['Rutilicus']

# ---- Figure 1: blank axes, no scales — the words fix the whole picture -----------------------
FIG1 = ('<svg viewBox="0 0 %d 230" role="img" aria-label="Figure 1: blank axes, absolute '
        'magnitude up the vertical axis and time in days along the horizontal, with no scale on '
        'either">' % W +
        '<line x1="70" y1="20" x2="70" y2="190" class="axis"/>'
        '<line x1="70" y1="190" x2="325" y2="190" class="axis"/>'
        '<text x="62" y="26" class="lbl" style="text-anchor:end">absolute</text>'
        '<text x="62" y="42" class="lbl" style="text-anchor:end">magnitude</text>'
        '<text x="325" y="212" class="lbl" style="text-anchor:end">time/days</text>'
        '</svg>')

TABLE1 = ('<p><b>Table 1</b></p><table><tr><th>Telescope</th><th>Type</th>'
          '<th>Objective diameter/mm</th></tr><tr><td>A</td><td>refractor</td><td>70</td></tr>'
          '<tr><td>B</td><td>reflector</td><td>400</td></tr></table>')
TABLE2 = ('<p><b>Table 2</b></p><table><tr><th>Star</th><th>Distance/pc</th><th>Spectral class</th>'
          '<th>Apparent magnitude</th></tr>'
          '<tr><td>Kornephoros</td><td>43</td><td>G</td><td>2.8</td></tr>'
          '<tr><td>Rasalgethi</td><td>110</td><td>M</td><td>3.0</td></tr>'
          '<tr><td>Rutilicus</td><td>11</td><td>G</td><td>2.8</td></tr>'
          '<tr><td>Sarin</td><td>23</td><td>A</td><td>3.1</td></tr></table>')

QS = [
    row('01', '1', '', 2,
        '<p>Draw the ray diagram for a Cassegrain telescope. Your diagram should show the paths of '
        'two rays, initially parallel to the principal axis, as far as the eyepiece.</p>',
        '1 mark: both mirrors correct — a concave primary mirror and a convex secondary (condone a '
        'flat secondary if labelled convex; a concave secondary is not condoned; the primary should '
        'not look like two mirrors, and no gap is needed in it). 1 mark: two rays, initially '
        'parallel to the principal axis, reflecting from the primary to the secondary and then '
        'crossing as they pass back through the primary. Rays drawn curved lose the mark; no lens '
        'is needed.',
        'drawing', TEL),
    row('02', '2', '', 0,
        '<p>The Kielder Observatory in Northumberland includes two optical telescopes attached to '
        'the same mount, so that they can be used to view the same object. Some of the properties '
        'of these telescopes are summarised in <b>Table 1</b>.</p>' + TABLE1,
        '', '', TEL, kind='preamble'),
    row('021', '2', '1', 3,
        '<p>The telescopes are used to view the same object.</p><p>Suggest which telescope in '
        '<b>Table 1</b> produces the brighter image.</p><p>Support your answer with a suitable '
        'calculation.</p>',
        'B (the reflector), with support — e.g. its diameter is bigger (1). The brightness of the '
        'image is set by the collecting power, which is proportional to D² or the area (1). '
        'Calculation of the areas or of D² (1) — e.g. (400/70)² ≈ 33, so B collects about 33 times '
        'as much light. An unsupported answer gains no marks; ignore references to resolving power.',
        'explain', TEL),
    row('022', '2', '2', 2,
        '<p>The minimum angular resolution of a telescope can be determined using the Rayleigh '
        'criterion.</p><p>Explain what is meant by the Rayleigh criterion.</p>',
        'Two objects will just be resolved when the first minimum (edge of the Airy disc) in the '
        'diffraction pattern of one image (1) coincides with the central maximum (centre of the '
        'Airy disc) of the other (1). Correct diagrams can gain both marks.',
        'explain', TEL),
    row('023', '2', '3', 2,
        '<p>Discuss which of the two telescopes in <b>Table 1</b> would be better at resolving the '
        'images of two objects that are close together.</p>',
        'B is better because it has a larger diameter (1); the minimum angular separation (angular '
        'resolution) depends on 1/D, from θ ≈ λ/D (1). No mark for an unsupported answer; correct '
        'calculations using any wavelength can gain both marks.',
        'explain', TEL),
    row('03', '3', '', 0,
        '<p><b>Table 2</b> summarises some of the properties of four stars in the constellation '
        'Hercules.</p>' + TABLE2,
        '', '', STAR, kind='preamble'),
    row('031', '3', '1', 2,
        '<p>Define the parsec. You may use a diagram as part of your answer.</p>',
        'The distance at which 1 AU subtends an angle of 1/3600 of a degree (1 arc second) (2). Or a '
        'diagram with 1 AU, 1 pc and 1/3600° (1 arcsec) labelled — 1 AU may be shown as the '
        'Sun–Earth distance, and 1 pc can be either long side.',
        'written', STAR),
    row('032', '3', '2', 3,
        '<p>Deduce which star is larger, Kornephoros or Rutilicus.</p>',
        'Kornephoros. They are the same spectral class (G) and therefore have similar temperatures '
        '(1). They have the same apparent magnitude but Kornephoros is significantly further away, '
        'so it has a greater power output / brighter absolute magnitude (1). As P = σAT⁴, to have a '
        'greater power output at the same temperature Kornephoros must have a greater area, so it '
        'is bigger (1). No mark for the answer on its own.',
        'explain', STAR),
    row('033', '3', '3', 2,
        '<p>One of the four stars has the peak in its black-body radiation curve at a wavelength of '
        '1.0 µm.</p><p>Calculate the corresponding temperature for this curve.</p>'
        '<p>temperature = ______ K</p>',
        'Substitution into λ<sub>max</sub>T = 0.0029 m K (1) (condone power-of-ten errors in this '
        'mark), giving T = 2.9 × 10⁻³ / 1.0 × 10⁻⁶ = 2.9 × 10³ K (1).',
        'calculation', STAR, accept='2900|2.9 × 10^3|2900 K'),
    row('034', '3', '4', 2,
        '<p>Explain which star produced the black-body radiation curve described in question '
        '03.3.</p>',
        'Spectral class is related to temperature (1), so a star at about 2900 K is in spectral '
        'class M and is therefore Rasalgethi (1). Error carried forward from 03.3 is allowed; the '
        'second mark is for the correct class and therefore the star.',
        'explain', STAR),
    row('035', '3', '5', 1,
        '<p>Which star has the brightest absolute magnitude?</p><p>Tick (✓) the correct box.</p>'
        '<ul><li>Kornephoros</li><li>Rasalgethi</li><li>Rutilicus</li><li>Sarin</li></ul>',
        'Rasalgethi',
        'short', STAR, accept='Rasalgethi'),
    row('036', '3', '6', 3,
        '<p>Determine the absolute magnitude of Sarin.</p><p>absolute magnitude = ______</p>',
        'Use of m − M = 5 log(d/10): 3.1 − M = 5 log(2.3) (2 — for substituting m, M and d in pc '
        'with the correct log; one mark lost per error, more than two errors 0/3), so 3.1 − M = 1.8 '
        'and M = 1.3 (1, ecf allowed for up to two errors).',
        'calculation', STAR, accept='1.3'),
    row('041', '4', '1', 3,
        '<p>Sketch, on the axes in <b>Figure 1</b>, the light curve for a typical type 1a '
        'supernova. Label the axes with suitable scales.</p>',
        'Scales (1): an absolute-magnitude scale getting more negative going up, and a time scale '
        'with 0 along the axis going up to between 10 and 400 days. Curve (1): a line going up and '
        'then down, with the left-hand side steeper than the steepest part of the right-hand side. '
        'Peak (1): the line rises quickly to a peak at an absolute magnitude between −18 and −20.',
        'drawing', STAR, figure='graph', diagram=FIG1, diagram_by='family'),
    row('042', '4', '2', 1,
        '<p>Type 1a supernovae can be used as standard candles.</p><p>Explain what is meant by a '
        'standard candle.</p>',
        'An object whose absolute magnitude is known (and whose apparent magnitude can be '
        'measured). Do not allow "fixed" or "constant" for known, but condone "predictable"; do not '
        'allow "directly measured". Intrinsic/inherent brightness or luminosity is condoned for '
        'absolute magnitude.',
        'written', COS),
    row('043', '4', '3', 3,
        '<p>Measurements of type 1a supernovae in 1999 led to a controversy concerning the '
        'behaviour of the Universe.</p><p>Describe this controversy and how the measurements led '
        'to it.</p>',
        'Measurements of the supernovae did not agree with predictions from Hubble’s law (1), so '
        'the Universe must be expanding at an increasing rate / accelerating (1). Controversial '
        'because there is no known energy source for the expansion — or a reference to dark energy '
        '(1).',
        'explain', COS),
    row('05', '5', '', 6,
        '<p>According to NASA nearly 2000 exoplanets had been discovered by 2016, and the search '
        'continues. One aim of this search is to find an Earth-like planet orbiting a Sun-like '
        'star.</p><p>Discuss the difficulties associated with the detection of an Earth-like planet '
        'orbiting a Sun-like star.</p><p>In your answer you should compare the methods that are '
        'used in the search and suggest which may be the most successful.</p>',
        'Level-marked out of 6. Level 3 (5–6): all three methods described (transit, radial '
        'velocity, direct observation), all three applied to Earth-like planets, and a judgement '
        'reached. Level 2 (3–4): two methods described and applied, or three described and only '
        'one applied. Level 1 (1–2): only one method described, or two described poorly. '
        'Indicative content — Transit: dips in brightness as the planet crosses in front of the '
        'star from our point of view; the alignment must be right for the planet to eclipse, so '
        'many possible candidates are not observed, but an Earth-like planet could be seen if not '
        'too far away. Radial velocity (Doppler): a periodic shift in the star’s spectrum as it '
        'moves round the common centre of mass with the planet; an Earth-like planet’s mass is much '
        'less than a Sun-like star’s so the effect is slight, but it could be detected with highly '
        'sensitive spectrometers. Direct observation: very unlikely, as an Earth-like planet is too '
        'small, too near its star and too cool to be seen against the star’s brightness.',
        'written', COS),
]

ROWS = [DOC] + QS

# The scheme's own "Total" lines, per question, and the cover's 35.
per_q = {}
for r in QS:
    if r['kind'] == 'question':
        per_q[r['question']] = per_q.get(r['question'], 0) + int(r['marks'])
assert per_q == {'1': 2, '2': 7, '3': 13, '4': 7, '5': 6}, per_q
assert sum(per_q.values()) == TOTAL
