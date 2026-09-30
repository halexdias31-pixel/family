"""AQA A-level Physics 7408/3BA — Paper 3 Section B, Astrophysics — November 2021.

WHICH SITTING THIS IS. AQA's own PDF metadata titles both files "... Astrophysics - November 2021" and the Drive files are named `AQA-74083BA-QP-NOV21` and `...-MS-NOV21`, and
the paper itself is stamped `IB/M/Jun21/E8` with a mark scheme headed "JUNE 2021". The summer 2021
exams were cancelled and AQA sat the June 2021 papers in the autumn series, so the paper is the June
2021 paper and the sitting is November 2021. Filed as the sitting (month 11, Second wave), because
that is when a student sat it. No exam date is printed on the cover, so `exam_date` is left empty.

WHERE EVERY ANSWER CAME FROM. AQA's own mark scheme, `AQA-74083BA-MS-NOV21.pdf` — read, not derived.
The numbers the scheme prints inside its own working are recomputed below as assertions, so a
number mistyped here fails rather than shipping.

NO FIGURE IS DRAWN. All three figures in this paper are embedded raster images (the page has one
image and no vector path for the curves), and none is determined by the paper's words:
  * Figure 1 is a hand-drawn evolutionary track on an HR diagram; the four crosses were measured off
    the rendered page in pixels (axis ticks: magnitude -10 at 318 px, 15 at 645 px; classes 69 px
    apart) and are described in prose by position only — naming what they ARE is 01.1's answer.
  * The four light curves of 02.1 are sketches that differ in shape and in time unit; they are
    described, each on its own, with nothing said about which is typical.
  * Figure 2 is a stylised spectrum. Its peak and its four dips were measured at 300 dpi against the
    printed tick marks (every 50 nm, 0 at x = 551.5 px, 1000 nm at 2024.5 px): peak 320 nm, dips at
    about 410, 435, 490 and 655 nm. The dips are described by wavelength and NOT named — recognising
    them is part of the six marks.
Each of these rows carries `figure` so check-library.js counts it in the backlog.

ACCEPT IS ON ONE ROW. 02.1 is a tick box with one right printed option. 01.4 (2.2 × 10^13 m) and
04.2 (238 Mpc) are single values, but the scheme accepts other forms and other units (standard form
written several ways; Mly, AU or m correctly converted for 04.2), and markAnswer_ compares one
string or a plain decimal — a right answer typed in another allowed form would be marked wrong,
which is the worse failure. So both are left for a person to mark.
"""
import math

PAPER = 'P-AQA-7408-2111-3BA'
BASE = dict(paper_id=PAPER, subject='Physics', key_stage='KS5', band_type='stage',
            band_value='A-Level', tier='A-Level', level='Alevel', company='AQA',
            exam_board='AQA', spec_code='7408/3BA', exam_wave='Second wave', year='2021',
            month='11', paper='3', document_type='Past paper',
            name='Paper 3 Section B: Astrophysics — November 2021', active='True',
            trackable='True', printable='False')
QP = '12aw1I_-mDmY43_YSyYeXqh3XwiAWMPS6'

TEL = 'Astrophysics, Telescopes'
STARS = 'Astrophysics, Classification of Stars'
COSMO = 'Astrophysics, Cosmology'

# ---------------------------------------------------------------------------------------------
# The mark scheme's own arithmetic, recomputed.
# ---------------------------------------------------------------------------------------------
SIGMA, R_SUN, AU = 5.67e-8, 6.96e8, 1.5e11
P_TC = SIGMA * 4 * math.pi * (5 * R_SUN) ** 2 * 31000 ** 4        # 01.4: 8.0 (7.97) x 10^30 W
assert round(P_TC / 1e30, 2) == 7.97
RATIO = P_TC / 3.8e26                                                 # "2.10 x 10^4"
assert round(RATIO / 1e4, 2) == 2.10
assert round(math.sqrt(RATIO) / 1e2, 2) == 1.45                      # "1.45 x 10^2 times further"
R_ORBIT = math.sqrt(RATIO) * AU
assert round(R_ORBIT / 1e13, 1) == 2.2 and round(R_ORBIT / 1e13, 2) == 2.17
assert round(math.sqrt(P_TC / 1.7e4) / 1e13, 1) == 2.2               # the scheme's other route
assert round(3.8e26 / AU ** 2 / 1e4, 1) == 1.7                       # where its 1.7 x 10^4 comes from

m = lambda M: 5 * math.log10(7.7e5 / 10) + M                          # 02.2
assert round(m(-19.3), 1) == 5.1 and round(m(-19.0), 1) == 5.4 and round(m(-19.5), 1) == 4.9
assert m(-19.3) < 6                                                    # brighter than the naked-eye limit

assert round(2.9e-3 / 320e-9, -3) == 9000                             # 03: Wien off the measured peak

v = 0.0516 * 3.00e8                                                    # 04.2
assert round(v / 1e7, 2) == 1.55
d_mpc = (v / 1e3) / 65
assert round(d_mpc) == 238

assert round(305 ** 2 / 76 ** 2) == 16                                # 05.3: "16 times brighter"

# ---------------------------------------------------------------------------------------------
def q(n, part, marks, html, answer, answer_type, topics, accept='', figure=''):
    rid = 'Q-AQA-7408-2111-3BA-%02d%s' % (n, part)
    return dict(BASE, row_id=rid, kind='question', question=str(n), part=part, section='B',
                marks=str(marks), html=html, answer=answer, answer_type=answer_type,
                topics=topics, accept=accept, figure=figure, diagram='', diagram_by='',
                placeholder='')

def pre(n, html, topics):
    return dict(BASE, row_id='Q-AQA-7408-2111-3BA-%02d' % n, kind='preamble', question=str(n),
                section='B', html=html, topics=topics)

DOC = dict(BASE, row_id='D-' + PAPER, kind='document', total_marks='35', exam_date='',
           needs='Calculator, Ruler, Protractor',
           source_url='https://drive.google.com/file/d/%s/view' % QP)

FIG1 = ('<p><b>Figure 1</b> shows the evolution of a star similar to the Sun on a '
        'Hertzsprung-Russell (HR) diagram.</p>'
        '<p><i>Figure 1: absolute magnitude up the vertical axis, from +15 at the bottom to −10 at '
        'the top; spectral class along the horizontal axis, O B A F G K M from left to right. One '
        'continuous track is drawn. It starts beyond class M at about magnitude +2.5 and runs left '
        'and slightly down, through a cross labelled <b>W</b> just before class M at about +3.3, to '
        'a cross labelled <b>X</b> at class G, about +5.5. From X it climbs steeply, bulging out '
        'towards class K at about −2.5, and levels off along magnitude −5, where a cross labelled '
        '<b>Y</b> sits just short of class F. It then sweeps left and steeply down to a cross '
        'labelled <b>Z</b> between classes O and B at about +10, and ends curving down towards '
        'class B at +15.</i></p>'
        '<p>Theta Carinae is a star with a radius five times that of the Sun. It has a surface '
        'temperature of 31 000 K.</p>')

ROWS = [
    DOC,
    pre(1, FIG1, STARS),
    q(1, '1', 3,
      '<p>State the evolutionary stage of the star at each of the points <b>W</b>, <b>X</b>, '
      '<b>Y</b> and <b>Z</b>.</p>',
      'W – protostar / gas cloud (accept formation stage) [1]. X – main sequence star [1]. '
      'Y – (red) giant AND Z – (white) dwarf [1] (condone supergiant for Y). Candidates may add to '
      'the diagram, and this is credited.',
      'short', STARS, figure='diagram'),
    q(1, '2', 1,
      '<p>Annotate <b>Figure 1</b> with a <b>T</b> to show the position of Theta Carinae.</p>',
      'T placed in the class O column with an absolute magnitude less than (brighter than) +5 — '
      'the scheme\'s accepted region runs from +5 up to −10 above class O.',
      'annotate', STARS, figure='diagram'),
    q(1, '3', 2,
      '<p>An astronomer suggests that an Earth-sized planet orbits Theta Carinae.</p>'
      '<p>Explain <b>one</b> difficulty with using the transit method to detect this planet.</p>',
      'The transit method measures how much of the star\'s light is blocked by the planet [1]. '
      'The planet is small (and the star is very big), so very little light is blocked out [1]. '
      'Any suggestion that the method involves seeing a dot moving across the face of the star '
      'scores 0.',
      'explain', COSMO),
    q(1, '4', 5,
      '<p>The astronomer suggests that the Earth-sized planet receives a similar amount of power '
      'from Theta Carinae as the Earth does from the Sun.</p>'
      '<p>The average power output of the Sun is 3.8 × 10<sup>26</sup> W.</p>'
      '<p>Determine the orbital radius of the Earth-sized planet orbiting Theta Carinae.</p>',
      '2.2 × 10<sup>13</sup> m (2.17 × 10<sup>13</sup> m). Use of P = σAT<sup>4</sup> [1]: '
      '5.67 × 10<sup>−8</sup> × 4πR<sup>2</sup> × 31000<sup>4</sup> with R = 5 R<sub>Sun</sub> '
      '= 8.0 (7.97) × 10<sup>30</sup> W [1] (condone an incorrect area formula if the other '
      'quantities are there). Attempt to use the inverse square law for the Earth, or find the ratio '
      'of powers, 7.97 × 10<sup>30</sup> / 3.8 × 10<sup>26</sup> = 2.10 × 10<sup>4</sup> (ecf) [1]. '
      'Equate the intensities for the Earth and the planet [1]: the planet is '
      '√(2.10 × 10<sup>4</sup>) = 1.45 × 10<sup>2</sup> times further away, so '
      '1.45 × 10<sup>2</sup> × 1.5 × 10<sup>11</sup> — or √(power of Theta Carinae ÷ '
      '1.7 × 10<sup>4</sup>) — = 2.2 × 10<sup>13</sup> m [1].',
      'calculation', STARS),

    q(2, '1', 1,
      '<p>Which graph shows the light curve for a typical type 1a supernova?</p>'
      '<p><i>Four graphs of absolute magnitude (−12 at the bottom to −20 at the top) against time, '
      'each running from about 0 to 300.</i></p><ul>'
      '<li><b>A</b> — time in hours: magnitude rises slowly from about −11.7 at time 0 to about '
      '−15.5 at 230, then climbs sharply to a peak of about −19.2 at about 275 and drops steeply '
      'to about −14 at 300.</li>'
      '<li><b>B</b> — time in hours: magnitude climbs sharply from about −14 just before time 0 to '
      'a peak of about −19.2 at time 0, falls quickly to about −15.5 by about 50, then declines '
      'slowly to about −11.7 at 280.</li>'
      '<li><b>C</b> — the same curve as <b>A</b>, with time in days.</li>'
      '<li><b>D</b> — the same curve as <b>B</b>, with time in days.</li></ul>'
      '<p>Tick (✓) <b>one</b> box.</p>',
      'D', 'short', STARS, accept='D', figure='graph'),
    q(2, '2', 3,
      '<p>The Andromeda galaxy is approximately 7.7 × 10<sup>5</sup> pc from Earth.</p>'
      '<p>Deduce whether a type 1a supernova which occurred in Andromeda can be observed from Earth '
      'with the naked eye.</p>',
      'Yes. Use of m − M = 5 log(d/10): m = 5 log(7.7 × 10<sup>4</sup>) − 19.3 = 5.1 [1] (allow '
      'M from −19.0 to −19.5, giving m = 5.4 to 4.9). This is brighter than the Hipparcos '
      'naked-eye limit of 6 [1]. A qualitative comparison of the brightness of their m with 6 '
      'leading to a conclusion — so it can be seen with the naked eye [1] (ecf allowed).',
      'explain', STARS),

    q(3, '', 6,
      '<p>Miaplacidus and Avior are two stars in the constellation Carina. Miaplacidus is a class '
      'A star. Avior is a class K star.</p>'
      '<p><b>Figure 2</b> shows how the intensity of radiation arriving at the Earth varies with '
      'wavelength for <b>one</b> of these stars. Only the important features of the variation are '
      'shown.</p>'
      '<p><i>Figure 2: intensity (no scale) against wavelength from 0 to 1000 nm. The intensity is '
      'zero below about 100 nm, rises smoothly to a single peak at about 320 nm, then falls away '
      'gradually towards 1000 nm, where it is about a seventh of the peak. On the falling side '
      'there are four narrow, sharp dips in intensity, at about 410 nm, 435 nm, 490 nm and '
      '655 nm.</i></p>'
      '<p>Deduce, with reference to <b>Figure 2</b>, the identity of the star.</p>'
      '<p>In your answer you should:</p><ul>'
      '<li>explain the overall shape of the graph</li>'
      '<li>describe the processes in the star that lead to the decreases in intensity</li>'
      '<li>state the identity of the star.</li></ul>',
      'Level-marked out of 6 (6: all three areas covered in some detail; 5: all three covered, at '
      'least two in detail; 4: two areas discussed, or one discussed and two partially; 3: one '
      'discussed and one partially, or all three partially; 2: one area, or a partial attempt at '
      'two; 1: none of the three without significant error). Overall shape: the curve is a black '
      'body spectrum — a continuous spectrum emitted by the star — and λ<sub>max</sub> is linked '
      'to temperature. Absorption lines: the dips are due to absorption; light of particular '
      'wavelengths is absorbed by gases in the outer layers and re-emitted in random directions, '
      'leaving dark lines; e.g. Balmer lines produced by hydrogen, which must be excited to the '
      'n = 2 state. Choice of star: Miaplacidus (class A) — either because the temperature '
      'calculated from the peak is about 9000 K, which is class A; or because the absorption lines '
      'are hydrogen Balmer lines, and strong hydrogen Balmer absorption lines are seen in class A '
      'but not in class K.',
      'written', STARS, figure='graph'),

    pre(4, '<p>IC2497 is a galaxy that contained a quasar. It is believed that the quasar stopped '
           'emitting radiation several thousand years ago.</p>', COSMO),
    q(4, '1', 2,
      '<p>Suggest why the quasar stopped emitting radiation.</p>',
      'Quasars are formed around black holes [1]. The black hole (at the centre of IC2497) no '
      'longer has matter falling into it [1] (allow: the black hole is no longer feeding, or is no '
      'longer active). With no mention of black holes, no marks.',
      'explain', COSMO),
    q(4, '2', 4,
      '<p>IC2497 has a red shift of 0.0516</p>'
      '<p>Determine the distance from the Earth to IC2497.</p>'
      '<p>Give an appropriate unit for your answer.</p>',
      '238 Mpc (2 sf accepted). Use of z = v/c: v = zc = 0.0516 × 3.00 × 10<sup>8</sup> = '
      '1.55 × 10<sup>7</sup> m s<sup>−1</sup> = 1.55 × 10<sup>4</sup> km s<sup>−1</sup> [1]; use '
      'of v = Hd [1]; d = v/H = 1.55 × 10<sup>4</sup> / 65 = 238 [1]; unit Mpc [1] (condone '
      'Megaparsec, MPC or MPc but not Mps or MpC). The unit mark needs an attempt at the '
      'calculation. A correctly converted value in another unit is allowed (ecf).',
      'calculation', COSMO),

    q(5, '1', 2,
      '<p>Explain what is meant by the Rayleigh criterion.</p>',
      'The Rayleigh criterion identifies the minimum angle subtended between two objects whose '
      'images can be resolved [1]. At that minimum angle the central maximum of the diffraction '
      'pattern of one object coincides with the first minimum of the diffraction pattern of the '
      'other [1].',
      'explain', TEL),
    q(5, '2', 3,
      '<p>A telescope uses wavelengths in the range 90 nm to 120 nm.</p>'
      '<p>Explain why this telescope must be located in space.</p>'
      '<p>Go on to discuss <b>one</b> advantage that this telescope has compared to a telescope '
      'with the same aperture that uses visible light.</p>',
      'The telescope detects ultraviolet — wavelengths shorter than visible light [1] — which is '
      'absorbed by (the ozone in) the atmosphere, so it must be in space [1]. It gives better '
      'resolution than a visible-light telescope of the same aperture, explained with reference to '
      'θ ≈ λ/D or good detail about diffraction [1].',
      'explain', TEL),
    q(5, '3', 3,
      '<p><b>Table 1</b> shows information about two telescopes.</p>'
      '<table><tr><th>Telescope</th><th>Diameter / m</th><th>Dish shape</th></tr>'
      '<tr><td>Arecibo</td><td>305</td><td>spherical</td></tr>'
      '<tr><td>Lovell</td><td>76</td><td>parabolic</td></tr></table>'
      '<p>Each telescope detects radio waves with a wavelength of 21 cm.</p>'
      '<p>Compare the performances of the telescopes in <b>Table 1</b> when both are used to '
      'observe the same faint radio objects.</p>',
      'A quantitative comparison of collecting power or resolution [1] — e.g. collecting power '
      '305<sup>2</sup>/76<sup>2</sup> = 16 times, or a calculation of the two resolutions. '
      'Arecibo gives the brighter image, or more detail [1]. Links spherical aberration to the '
      'detail of the image [1]: the Lovell (parabolic) is likely to give better detail because it '
      'has no spherical aberration. There is no absolute conclusion. No mention of the effect of '
      'shape: maximum 2.',
      'explain', TEL),
]

assert sum(int(r['marks']) for r in ROWS if r['kind'] == 'question') == 35
PER_Q = {}
for r in ROWS:
    if r['kind'] == 'question':
        PER_Q[r['question']] = PER_Q.get(r['question'], 0) + int(r['marks'])
assert PER_Q == {'1': 11, '2': 4, '3': 6, '4': 6, '5': 8}, PER_Q   # the scheme's "Total" lines
