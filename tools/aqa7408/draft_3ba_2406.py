"""AQA A-level Physics 7408/3BA — Paper 3 Section B, Option A Astrophysics, June 2024.

Question paper: Drive 1WG3WaLcXJKcxsHeByotcpWXCCe7osfuG, read off the rendered pages (Monday 17 June
2024, 35 marks, cover lists pencil, ruler, scientific calculator, Data and Formulae Booklet and a
protractor).

THE ANSWERS ARE DELIBERATELY EMPTY. The Drive file supplied as this paper's mark scheme
(1JZOr-TT6sIipe7c7l3lznI4O0y8ley3o, titled "... June 2024 AL") is the JUNE 2017 7408/3BA scheme:
its cover, the header on every page and its PDF metadata all say 2017, and its questions
(telescopes A and B, Rasalgethi, a supernova light curve, exoplanet detection) are not this paper's.
No June 2024 scheme for this paper is in Drive under any name. Answers here are read off the mark
scheme and never derived (CLAUDE.md, the 2017 Highers), so every `answer` and `accept` waits for the
right scheme. Until then `write.py --check p_3ba_2406` refuses this module with "has no answer",
which is the right refusal.

When the scheme arrives, fill `answer` for each question row (and `accept` for 03.3, the tick-box,
and for any single-value calculation), then assert the scheme's intermediates (the telescope's
eyepiece-objective distance, the Jupiter distance, the parallax angle, Wien's-law temperature,
Stefan's-law power, the Schwarzschild radius) against their inputs below.
"""

PID = 'P-AQA-7408-2406-3BA'
QP = '1WG3WaLcXJKcxsHeByotcpWXCCe7osfuG'
TOTAL = 35

BASE = {
    'paper_id': PID, 'subject': 'Physics', 'key_stage': 'KS5', 'band_type': 'stage',
    'band_value': 'A-Level', 'tier': 'A-Level', 'level': 'A-Level', 'company': 'AQA',
    'exam_board': 'AQA', 'spec_code': '7408/3BA', 'exam_wave': 'First wave', 'year': '2024',
    'month': '6', 'paper': '3', 'exam_date': '2024-06-17', 'document_type': 'Past paper',
    'name': 'Paper 3 Section B: Astrophysics — June 2024', 'active': 'True',
    'trackable': 'True', 'printable': 'False',
}

DOC = dict(BASE, row_id='D-' + PID, kind='document', total_marks=str(TOTAL),
           needs='Calculator, Ruler, Protractor, Equation booklet',
           source_url='https://drive.google.com/file/d/%s/view' % QP)

TEL, STARS, COSMO = 'Astrophysics, Telescopes', 'Astrophysics, Classification of Stars', \
    'Astrophysics, Cosmology'

def row(q, part, marks, html, answer_type, topics, figure=''):
    return dict(BASE, row_id='Q-AQA-7408-2406-3BA-%02d%s' % (q, part), kind='question',
                question=str(q), part=str(part), section='', marks=str(marks), html=html,
                answer='', accept='', answer_type=answer_type, topics=topics, figure=figure,
                diagram='', diagram_by='', placeholder='')

def pre(q, html, topics, figure=''):
    return dict(BASE, row_id='Q-AQA-7408-2406-3BA-%02d' % q, kind='preamble', question=str(q),
                part='', section='', marks='', html=html, topics=topics, figure=figure,
                diagram='', diagram_by='', placeholder='')

ROWS = [
    DOC,
    pre(1, '<p>A student uses a refracting telescope in normal adjustment to make observations '
           'of Jupiter.</p><p>The telescope has an angular magnification of 75</p>', TEL),
    row(1, 1, 2, '<p>The eyepiece has a focal length of 22 mm.</p><p>Determine the distance '
                 'between the eyepiece and the objective lens.</p><p>distance = ____ m</p>',
        'calculation', TEL),
    row(1, 2, 2, '<p>When viewed through the telescope, the image of Jupiter subtends an angle of '
                 '1.7 &times; 10<sup>&minus;2</sup> rad.</p><p>Calculate, in km, the distance '
                 'between the Earth and Jupiter.</p><p>mean radius of Jupiter = 7.0 &times; '
                 '10<sup>4</sup> km</p><p>distance = ____ km</p>', 'calculation', TEL),
    row(1, 3, 3, '<p>The student places a cap over one end of the telescope. The cap has a '
                 'circular hole in its centre.</p><p><b>Figure 1</b> shows the end of the '
                 'telescope, the objective lens and the cap: the cap fits over the end of the '
                 'telescope tube in front of the objective lens, and its hole is centred on the '
                 'lens and narrower than it, so the cap covers the outer part of the lens.</p>'
                 '<p>State and explain the effect that the addition of the cap has on the '
                 'chromatic aberration caused by the lens.</p>', 'explain', TEL, 'diagram'),
    row(1, 4, 4, '<p>Explain <b>two</b> other effects that the addition of the cap has on the image '
                 'of Jupiter.</p><p>1 ____</p><p>2 ____</p>', 'explain', TEL),
    pre(2, '<p>The apparent change in position of a nearby star relative to distant stars is due '
           'to an effect known as parallax.</p><p><b>Figure 2</b> shows how parallax arises. As '
           'the Earth moves from point <b>P</b> to point <b>Q</b>, an observer on the Earth sees '
           'the position of a nearby star <b>S</b> change in relation to distant stars. (Figure 2, '
           'not to scale: straight lines from P and from Q cross at S and run on towards a column '
           'of distant stars; the angle between the two lines at S is marked <i>A</i>.)</p>'
           '<p>Angle <i>A</i> is the parallax angle. This angle can be used to determine the '
           'distance to a nearby star, provided that the relative motion between the star and the '
           'Sun is negligible between observations.</p>', STARS, 'diagram'),
    row(2, 1, 2, '<p>The distance from the Sun to <b>S</b> is 79 ly.</p><p>The Earth takes 6 '
                 'months to move from point <b>P</b> to point <b>Q</b>.</p><p>Calculate, in '
                 'degrees, angle <i>A</i>.</p><p><i>A</i> = ____ &deg;</p>', 'calculation', STARS),
    row(2, 2, 4, '<p>Parallax is used to determine the distance to a different star. Observations '
                 'of the star produce the following data:</p><p>distance determined using '
                 'parallax = 0.40 pc<br>apparent magnitude = 13.5<br>absolute magnitude = 16.7'
                 '</p><p>An astronomer suggests that the star moved significantly relative to the '
                 'Sun between the two parallax observations.</p><p>Discuss whether this suggestion '
                 'is valid.</p>', 'explain', STARS),
    pre(3, '<p><b>Figure 3</b> shows the variation of intensity with wavelength for a star: a '
           'single-peaked black-body curve plotted on a grid, intensity (no scale) against '
           'wavelength / &mu;m from 0.0 to 1.6 in steps of 0.2 with five small squares to each '
           'step. The curve starts at 0.32 &mu;m, rises steeply to its maximum, then falls more '
           'gradually to 1.4 &mu;m. The wavelength of the maximum is to be read off the '
           'grid.</p>', STARS, 'graph'),
    row(3, 1, 2, '<p>Show that <b>Figure 3</b> is consistent with a black-body temperature of '
                 'about 6.0 &times; 10<sup>3</sup> K.</p>', 'calculation', STARS),
    row(3, 2, 2, '<p>The radius of the star is 9.6 &times; 10<sup>6</sup> m.</p><p>Calculate the '
                 'power output of the star.</p><p>power output = ____ W</p>', 'calculation',
        STARS),
    row(3, 3, 1, '<p>Which row gives the type and spectral class of the star?</p><p>Tick '
                 '(&#10003;) <b>one</b> box.</p><table><tr><th>Type of star</th><th>Spectral '
                 'class</th></tr><tr><td>white dwarf</td><td>F</td></tr><tr><td>main sequence'
                 '</td><td>G</td></tr><tr><td>red giant</td><td>K</td></tr><tr><td>main sequence'
                 '</td><td>F</td></tr><tr><td>red giant</td><td>G</td></tr><tr><td>white dwarf'
                 '</td><td>K</td></tr></table>', 'short', STARS),
    row(3, 4, 2, '<p>The light from the star passes through an interstellar dust cloud before '
                 'reaching Earth.</p><p>The reduction in intensity when light passes through a '
                 'dust cloud is assumed to be inversely proportional to the wavelength of the '
                 'light.</p><p>An astronomer on the Earth estimates the black-body temperature of '
                 'the star.</p><p>Discuss the effect that the dust cloud has on this estimate.'
                 '</p>', 'explain', STARS),
    pre(4, '<p>The Earth is in the galaxy known as the Milky Way. The Andromeda Galaxy is one of '
           'the closest galaxies to the Milky Way.</p>', COSMO),
    row(4, 1, 2, '<p>The Andromeda Galaxy approaches the Milky Way at a speed of 110 km '
                 's<sup>&minus;1</sup>.</p><p>The distance between the galaxies is 770 kpc.</p>'
                 '<p>Discuss whether these data can be used to estimate an age for the Universe.'
                 '</p>', 'explain', COSMO),
    row(4, 2, 3, '<p>There is a supermassive black hole at the centre of the Andromeda Galaxy. The '
                 'mass of this black hole is 1.60 &times; 10<sup>8</sup> solar masses.</p><p>'
                 'Calculate the radius of the event horizon of this black hole.</p><p>State an '
                 'appropriate unit for your answer.</p><p>radius = ____ unit = ____</p>',
        'calculation', 'Astrophysics, Classification of Stars'),
    row(4, 3, 6, '<p>Scientists predict that a quasar will be produced as the Milky Way and the '
                 'Andromeda Galaxy merge.</p><p>Explain what is meant by a quasar.</p><p>Go on to '
                 'suggest why a quasar may be produced as galaxies merge.</p><p>In your answer you '
                 'should:</p><ul><li>describe the typical properties of a quasar</li><li>explain '
                 'how observations of quasars provide evidence for these properties</li><li>'
                 'suggest the process of quasar formation that is likely when two galaxies merge.'
                 '</li></ul>', 'written', COSMO),
]

# The cover says 35; the per-question totals printed down the margin are 11, 6, 7 and 11.
_q = {}
for r in ROWS:
    if r['kind'] == 'question':
        _q[r['question']] = _q.get(r['question'], 0) + int(r['marks'])
assert _q == {'1': 11, '2': 6, '3': 7, '4': 11}, _q
assert sum(_q.values()) == TOTAL
for r in ROWS:
    for t in r.get('topics', '').split(','):
        assert '&' not in t, r['row_id']
