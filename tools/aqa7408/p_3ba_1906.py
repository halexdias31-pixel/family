"""AQA A-level Physics 7408/3BA — Paper 3 Section B, Astrophysics option, June 2019.

WHERE EVERY ANSWER CAME FROM. AQA's own mark scheme, AQA-74083BA-W-MS-JUN19.pdf (Drive
1YS_0EZUOoDJ49L0mWeeG3qoQYxyFAATR) — read, not derived. The 2017 Highers are why that is the rule.
The scheme's running header says "7408/3A – JUNE 2018" on most pages; that is AQA's template left
unedited, and its page 6 header and every answer are this paper's (Canis Minor, NGC 936, Procyon).

THE COVER SAYS 35 and the scheme's own Total lines say 8, 13, 9 and 5 — both asserted below, as are
the numbers the scheme prints inside its working (the two resolutions, the collecting-power ratio,
Procyon's distance and its unit conversions, and both Hubble constants).

ONE FIGURE IS DRAWN AND ONE IS DESCRIBED. Figure 1 is two parallel rays of white light meeting a
converging lens, with the principal axis dashed — the words determine it and the question is to
complete it, so it is drawn (with nothing past the lens). Figure 2 is an HR diagram whose region
outlines are freehand artwork; no number fixes them, so it carries `figure` and is described in
prose — and its absolute-magnitude axis is deliberately left without numbers, because putting them
there is 03.1.
"""
import math, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from svgplot import W

PAPER = 'P-AQA-7408-1906-3BA'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS5', band_type='stage',
           band_value='A-Level', level='Alevel', company='AQA', exam_board='AQA',
           spec_code='7408/3BA', exam_wave='First wave', year='2019', month='6', paper='3',
           exam_date='2019-06-03', document_type='Past paper',
           name='Paper 3 Section B: Astrophysics — June 2019', active='True',
           trackable='True', printable='False')

TEL = 'Astrophysics, Telescopes'
STARS = 'Astrophysics, Classification of Stars'
COS = 'Astrophysics, Cosmology'

# ------------------------------------------------------------------------------------------------
# THE SCHEME'S OWN ARITHMETIC, recomputed. Data and Formulae Booklet: c = 3.00e8 m/s,
# 1 ly = 9.46e15 m, 1 pc = 3.08e16 m, 1 AU = 1.50e11 m.
# ------------------------------------------------------------------------------------------------
C, LY, PC, AU = 3.00e8, 9.46e15, 3.08e16, 1.50e11
# 01.3 — minimum and maximum resolvable angle, theta = lambda / D
assert round(350e-9 / 39.3, 10) == 8.9e-9
assert round(2.5e-3 / 110, 6) == 2.3e-5
assert round(1800e-9 / 39.3, 9) == 4.6e-8
assert round(1000e-3 / 110, 4) == 9.1e-3
assert round(110 ** 2 / 39.3 ** 2, 1) == 7.8                 # collecting power ratio
# 02.5 — m - M = 5 log(d/10): 0.34 - 2.65 = -2.31
d_pc = 10 * 10 ** ((0.34 - 2.65) / 5)
assert round(d_pc, 2) == 3.45
assert round(10 * 10 ** ((2.65 - 0.34) / 5)) == 29               # the reversed-magnitude error
assert round(d_pc * PC / LY, 1) in (11.2, 11.3)
assert round(d_pc * PC / AU / 1e5, 1) == 7.1
assert round(d_pc * PC / 1e17, 1) == 1.1
# 04.1 — H = v / d with v = zc
def hubble(z, d_ly):
    return (z * C / 1e3) / (d_ly * LY / PC / 1e6)            # km/s per Mpc
assert round(hubble(4.8e-3, 6.8e7)) == 69
assert round(hubble(3.0e-3, 3.2e7)) == 92
assert round(4.8 / 6.8, 1) == 0.7 and round(3.0 / 3.2, 1) == 0.9


def fig1():
    """Figure 1: two parallel incident rays of white light, a biconvex lens, the principal axis."""
    lx, cy = 120, 90
    p = ['<svg viewBox="0 0 %d 180" role="img" aria-label="Two parallel rays of white light '
         'travelling towards a converging lens, with the principal axis dashed through its centre">'
         % W]
    p.append('<ellipse cx="%d" cy="%d" rx="12" ry="78" fill="none" stroke="currentColor" '
             'stroke-width="1.4"/>' % (lx, cy))
    p.append('<line x1="10" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="1" '
             'stroke-dasharray="6 4"/>' % (cy, W - 8, cy))
    for y in (cy - 58, cy + 58):
        p.append('<line x1="14" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="1.4"/>'
                 % (y, lx - 5, y))
        p.append('<path d="M60 %d l-8 -4 v8 z" fill="currentColor"/>' % y)
    p.append('<text x="14" y="%d" class="lbl" style="text-anchor:start">white light</text>' % (cy - 40))
    p.append('</svg>')
    return ''.join(p)


def q(num, part, marks, html, answer, answer_type, topics, accept='', figure='', diagram='',
      lead=''):
    r = dict(DOC)
    r.update(row_id='Q-AQA-7408-1906-3BA-%02d%s' % (num, part), kind='question', question=str(num),
             part=str(part), section='', marks=str(marks), html=html, answer=answer,
             answer_type=answer_type, topics=topics, accept=accept, figure=figure,
             diagram=diagram, diagram_by='family' if diagram else '', placeholder='')
    if lead:
        r['lead'] = lead
    return r


def pre(num, html, topics, figure=''):
    r = dict(DOC)
    r.update(row_id='Q-AQA-7408-1906-3BA-%02d' % num, kind='preamble', question=str(num),
             section='', html=html, topics=topics, figure=figure, diagram='', diagram_by='')
    return r


doc = dict(DOC)
doc.update(row_id='D-P-AQA-7408-1906-3BA', kind='document', total_marks='35',
           needs='Calculator, Ruler, Equation booklet',
           source_url='https://drive.google.com/file/d/1C860wYUibeACHnCb6HNUGKbGcMjofCjn/view')

TABLE2 = ('<p><b>Table 2</b> shows some properties of the four brightest stars in the '
          'constellation Canis Minor.</p><table><tr><th>Name</th><th>Apparent magnitude</th>'
          '<th>Absolute magnitude</th><th>Spectral class</th></tr>'
          '<tr><td>Gamma A</td><td>4.46</td><td>&minus;0.50</td><td>K</td></tr>'
          '<tr><td>Gomeisa</td><td>2.89</td><td>&minus;0.70</td><td>B</td></tr>'
          '<tr><td>HD 66141</td><td>4.39</td><td>&minus;0.13</td><td>K</td></tr>'
          '<tr><td>Procyon</td><td>0.34</td><td>2.65</td><td>F</td></tr></table>')

FIG2 = ('<p><b>Figure 2</b> is a Hertzsprung-Russell (HR) diagram.</p><p>The vertical axis is '
        'labelled <i>absolute magnitude</i> and carries no numbers. The horizontal axis is labelled '
        '<i>temperature / K</i> and is marked, from left to right, 50 000, 25 000, 10 000, 5000 and '
        '2500. Three outlined regions are drawn: a <i>main sequence</i> band running from the top '
        'left down to the bottom right; an oval labelled <i>giants</i> across the upper part of the '
        'diagram; and a small oval labelled <i>white dwarfs</i> near the bottom left.</p>')

ROWS = [
    doc,
    q(1, 1, 1,
      '<p>The lenses used in refracting telescopes can cause chromatic aberration.</p>'
      '<p>Complete <b>Figure 1</b> to show how a lens produces chromatic aberration.</p>'
      '<p><b>Figure 1</b> shows two parallel rays of white light travelling towards a converging '
      'lens, with the principal axis drawn through the lens.</p>',
      'Two rays brought to a red focus and two rays brought to a blue focus on the principal axis, '
      'with the blue focus closer to the lens than the red focus. Accept one ray of each colour '
      'provided they pass through the principal axis; accept rays that stop at the axis; accept '
      'violet for blue, or any two colours in the right order; initials for colours are accepted. '
      'Rays may bend at the centre of the lens or at either or both surfaces.',
      'drawing', TEL, figure='diagram', diagram=fig1()),
    q(1, 2, 1,
      '<p>A Cassegrain telescope uses mirrors.</p><p>What are the shapes of the primary and '
      'secondary mirrors in a Cassegrain telescope? Tick (&#10003;) <b>one</b> box.</p>'
      '<ul><li>Primary concave, secondary concave</li><li>Primary concave, secondary convex</li>'
      '<li>Primary convex, secondary concave</li><li>Primary convex, secondary convex</li></ul>',
      'Primary mirror concave, secondary mirror convex.',
      'short', TEL, accept='Primary concave, secondary convex'),
    q(1, 3, 6,
      '<p><b>Table 1</b> contains information about two telescopes, <b>A</b> and <b>B</b>. Each '
      'telescope is planned to be the biggest of its type in the world.</p>'
      '<table><tr><th>Telescope</th><th>Type</th><th>Diameter / m</th>'
      '<th>Range of wavelengths detected</th></tr>'
      '<tr><td>A</td><td>Optical reflecting telescope</td><td>39.3</td><td>350 nm to 1800 nm</td></tr>'
      '<tr><td>B</td><td>Radio telescope</td><td>110</td><td>2.5 mm to 1000 mm</td></tr></table>'
      '<p>Discuss the similarities and differences between optical reflecting telescopes and radio '
      'telescopes. Your answer should include references to:</p>'
      '<p>&bull; structure<br>&bull; positioning<br>&bull; collecting power.</p>'
      '<p>Go on to discuss which telescope, <b>A</b> or <b>B</b>, will give a more detailed image '
      'of an astronomical object that emits both radio waves and visible light.</p>',
      'Level-marked out of 6. 6: all four aspects analysed, including a calculation of resolving '
      'power or the ratio of resolving powers for the two telescopes (can still be 6 with an error '
      'or part of one aspect missing). 5: a good attempt at three aspects, including quantitative '
      'or algebraic discussion of resolution or collecting power. 4: two aspects discussed and one '
      'partially. 3: two aspects discussed, or one discussed and two partially. 2: one aspect '
      'discussed, or partial attempts at more than one. 1: at least one relevant comment. '
      'Indicative content — Structure: both use a reflecting (parabolic) surface; a radio telescope '
      'has no secondary reflector, the detector sits at the focal point of the primary, and the '
      'dish can be wire mesh. Positioning: both can be on the Earth\'s surface because the '
      'atmosphere absorbs little at optical or radio wavelengths; optical telescopes must be away '
      'from light pollution, high up to reduce atmospheric distortion and in dry places above '
      'cloud, whereas radio telescopes need a radio-quiet area and can be at lower altitude. '
      'Collecting power: proportional to D², so the much larger radio dish has much greater '
      'collecting power — 110² / 39.3² = 7.8 times (though radio sources tend to be very weak). '
      'Resolving power: &theta; &asymp; &lambda; / D; B is larger but its wavelength is far larger, '
      'so its resolving power is generally much lower, and A gives the more detailed image. E.g. '
      'minimum &theta; for A = 8.9 &times; 10<sup>&minus;9</sup> rad and for B = 2.3 &times; '
      '10<sup>&minus;5</sup> rad (or maxima 4.6 &times; 10<sup>&minus;8</sup> rad and 9.1 &times; '
      '10<sup>&minus;3</sup> rad). Neutral: radio arrays, optical only working in the dark, placing '
      'either telescope in space.',
      'written', TEL),
    pre(2, TABLE2, STARS),
    q(2, 1, 3,
      '<p>Discuss, with reference to the Hipparcos scale, why many star maps show only two stars in '
      'the constellation Canis Minor.</p>',
      'The Hipparcos scale runs from the brightest (1) down to 6, the dimmest visible to the naked '
      'eye in good conditions (1 mark; "6 dimmest" may be inferred). Gamma A and HD 66141 are much '
      'dimmer than the two brightest stars — not much brighter than magnitude 6 (1 mark) — so only '
      'two stars, Gomeisa and Procyon, are likely to be seen unless conditions are good (1 mark). '
      'The reverse argument is accepted.',
      'explain', STARS),
    q(2, 2, 2,
      '<p>State and explain which star in <b>Table 2</b> has the most prominent Hydrogen Balmer '
      'absorption lines.</p>',
      'Gomeisa (it is a B class star) (1 mark; condone "the B class star"). B class stars are hot '
      'enough to have electrons / hydrogen in the n = 2 state (1 mark).',
      'explain', STARS),
    q(2, 3, 3,
      '<p>Deduce which star, Gamma A or HD 66141, has the larger diameter.</p>',
      'Same spectral class, so similar (or the same) temperature (1 mark). The absolute magnitude '
      'of Gamma A is brighter, so its power output is greater than that of HD 66141 (1 mark; '
      'accept power, but not "brightness", being greater without direct reference to absolute '
      'magnitude). By Stefan\'s law Gamma A has the larger area and therefore the larger diameter '
      '(1 mark; "P is proportional to A at constant T" is enough for Stefan\'s law). Confusion '
      'with apparent magnitude scores max 1.',
      'explain', STARS),
    q(2, 4, 2,
      '<p>Astronomers recently used the radial velocity method to discover an exoplanet orbiting '
      'HD 66141.</p><p>Describe the main features of the radial velocity method in the detection '
      'of planets.</p>',
      'A periodic Doppler shift in the light received from the star (1 mark; red and blue shift '
      'is equivalent, red shift increasing and decreasing is fine, and periodicity may be '
      'implied), due to the star and planet orbiting their common centre of mass (1 mark). Stating '
      'or implying that the light comes from the planet loses the first mark; "wobble" is ignored '
      'unless clearly explained.',
      'explain', COS),
    q(2, 5, 3,
      '<p>Calculate the distance from the Earth to Procyon.</p><p>Give an appropriate unit for '
      'your answer.</p><p>distance = ______ unit ______</p>',
      '3.45 pc. Use of m &minus; M = 5 log(d / 10) (1 mark): 0.34 &minus; 2.65 = 5 log(d / 10), '
      'log(d / 10) = &minus;2.31 / 5, d = 3.45 (1 mark), unit pc (1 mark; condone parsec, PC or '
      'Pc but not ps or pC). A correctly converted unit is allowed — 11.2 or 11.3 ly, 7.1 &times; '
      '10<sup>5</sup> AU, 1.1 &times; 10<sup>17</sup> m. Reversing the magnitudes (giving 29 pc) is '
      'a physics error and scores the unit mark only; using log<sub>e</sub> is max 1 (for the '
      'unit). The unit mark cannot be awarded without an attempt at the calculation.',
      'calculation', STARS, accept='3.45 pc|3.45pc|3.45 parsec|11.2 ly|11.3 ly'),
    pre(3, FIG2, STARS, figure='diagram'),
    q(3, 1, 1,
      '<p>Label the absolute magnitude axis with a suitable scale.</p>',
      'A scale labelled from +15 at the bottom up to &minus;10 at the top (+15 at the bottom of '
      'the white dwarfs at most; &minus;10 at the top of the giants at least).',
      'annotate', STARS),
    q(3, 2, 2,
      '<p>Label with an <b>S</b> the position of the Sun on the HR diagram.</p>',
      'S placed between 5000 K and the horizontal section of the bottom line of the main sequence '
      '(1 mark), and within the main sequence at the correct absolute magnitude, about +5 — closer '
      'to +5 than to 0 or +10 on a correct scale (1 mark). The marks are independent. If only "S" '
      'is drawn, its middle is used; a clearly labelled dot or cross is used if present.',
      'annotate', STARS),
    q(3, 3, 2,
      '<p>Draw a line on the HR diagram to show the evolution of a star similar to the Sun from '
      'formation to white dwarf.</p>',
      'A line coming from the right to S (1 mark), then from S up to the giants and round to the '
      'white dwarfs (1 mark). Convoluted lines are accepted; the line must touch the giants and '
      'white dwarfs but need not go into the areas. Arrows are not required, but any pointing the '
      'wrong way limit the answer to max 1.',
      'drawing', STARS),
    q(3, 4, 1,
      '<p>Label with a <b>P</b> the position on the HR diagram of a star much redder, and with a '
      'greater power output, than the Sun.</p>',
      'P placed to the right of and above the candidate\'s S (P on the same horizontal level as S '
      'is accepted).',
      'annotate', STARS),
    q(3, 5, 3,
      '<p>A star much more massive than the Sun may become a supernova and then a black hole.</p>'
      '<p>Discuss whether supernovae and black holes can be placed on the HR diagram in '
      '<b>Figure 2</b>.</p>',
      'Any three of: the absolute magnitude of a supernova (about &minus;20) is beyond the scale '
      'of the HR diagram, or a supernova is short-lived / varies so cannot be given a position; '
      'the (peak) temperature of a supernova is too high (above 50 000 K); a black hole has an '
      'escape velocity greater than c, or emits no light / has an absolute magnitude too dim to '
      'fit on the scale; the temperature of a black hole would be too low (below 2500 K). Accept '
      '"too hot" / "too cold" for temperature; insist on "absolute magnitude", not "brightness"; '
      'do not accept "absolute magnitude would be zero".',
      'explain', STARS),
    q(4, 1, 3,
      '<p><b>Table 3</b> contains information about two galaxies.</p>'
      '<table><tr><th>Galaxy</th><th>Red shift, <i>z</i></th><th>Distance from Earth / ly</th></tr>'
      '<tr><td>NGC 936</td><td>4.8 &times; 10<sup>&minus;3</sup></td>'
      '<td>6.8 &times; 10<sup>7</sup></td></tr>'
      '<tr><td>NGC 3379</td><td>3.0 &times; 10<sup>&minus;3</sup></td>'
      '<td>3.2 &times; 10<sup>7</sup></td></tr></table>'
      '<p>Discuss whether these data are consistent with Hubble\'s Law.</p>',
      'Correct use of the Doppler equation (v = zc) for both galaxies (1 mark), correct use of '
      'Hubble\'s law for both galaxies (1 mark), and a justified comparison leading to a conclusion '
      '(1 mark). Full credit for, e.g.: the Hubble constant for each galaxy compared with the data '
      'booklet value or with each other — NGC 936 is consistent (H = 69 km s<sup>&minus;1</sup> '
      'Mpc<sup>&minus;1</sup>) and NGC 3379 is not (H = 92 km s<sup>&minus;1</sup> '
      'Mpc<sup>&minus;1</sup>); or using the data-booklet H to test z or d for both galaxies; or '
      'comparing z/d for both (4.8/6.8 = 0.7 and 3/3.2 = 0.9). ECF for the comparison if at least '
      'one calculation is correct (max 2); values for only one galaxy score 1. Credit discussion '
      'that other factors affect galaxy velocity or distance measurements and the difference is '
      'not large, so Hubble\'s law is OK.',
      'calculation', COS),
    q(4, 2, 2,
      '<p>Quasars are the most distant measurable objects.</p><p>Discuss <b>one</b> problem '
      'associated with the determination of the distance from the Earth to a quasar.</p>',
      'Either: distant quasars are very faint, or a Type 1a supernova (standard candle) in the '
      'associated galaxy would be very faint (1 mark; condone "barely detectable"), with reference '
      'to the inverse square law (1 mark). Or: because of dark energy / the accelerating universe, '
      'use of Hubble\'s law or the inverse square law is not reliable over large distances. '
      'Condone: some quasars lie behind intervening galaxies or gas clouds, affecting the data / '
      'light received from the quasar.',
      'explain', COS),
]

# The cover's 35 and the scheme's per-question totals.
_by_q = {}
for _r in ROWS:
    if _r['kind'] == 'question':
        _by_q[_r['question']] = _by_q.get(_r['question'], 0) + int(_r['marks'])
assert _by_q == {'1': 8, '2': 13, '3': 9, '4': 5}, _by_q
assert sum(_by_q.values()) == int(doc['total_marks']) == 35
