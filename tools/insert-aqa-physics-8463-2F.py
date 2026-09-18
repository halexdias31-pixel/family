#!/usr/bin/env python3
"""AQA GCSE Physics 8463/2F, June 2024 — 60 question rows into data/questions.json.

WHY THIS IS A SCRIPT AND NOT A HAND EDIT. CLAUDE.md: "Every number in a transcription is checked
against the paper's own stated total ... and the insert script asserts it before writing a row."
The cover says 100 and the margin boxes say 8, 9, 8, 13, 9, 8, 18, 13, 14.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Foundation)_ Paper 2 - June 2024 (2).pdf`, AQA's own
8463/2F scheme — read, not derived.

QUESTIONS 8 AND 9 ARE 1 AND 2 OF 8463/2H, word for word — the refraction experiment with the car
headlight, and the baby walker with its gears. Both schemes read side by side; transcribed again
rather than cross-referenced, for the reason the other Foundation scripts give.

SO FIGURE 14 HERE IS FIGURE 2 THERE, and it is the same drawing from the same `scatter()` call in
tools/svgplot.py rather than a second set of coordinates. That extraction was proved byte-identical
against the Higher paper's rows before it was kept — the same move as the `libraryExtras_` cutover.

FIGURE 9 IS DRAWN TOO. Three straight sections with five corners the scheme quotes back — the walk
covers 3200 m in 2000 s at a mean of 1.6 m/s, and section B is the shallowest — so it is a drawing
instruction with exactly one answer. The magnets, the wave diagrams, the trolley runway, the pool
and the headlight are artwork, and what each shows is written into its question.
"""
import json, datetime, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import W, axes, scatter

PAPER = 'P-AQA-8463-2406-2F'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS4', band_type='stage',
           band_value='GCSE', tier='Foundation', level='GCSE', company='AQA', exam_board='AQA',
           spec_code='8463/2F', exam_wave='First wave', year='2024', month='6', paper='2',
           exam_date='2024-06-14', document_type='Past paper', name='Paper 2 — June 2024',
           active='True', trackable='True', printable='False')

WV = 'Waves'; F = 'Forces'; SP = 'Space Physics'; EM = 'Magnetism & Electromagnetism'
EMW = 'Electromagnetic Waves'

TABLE1 = [(10, 6), (20, 12), (30, 18), (40, 23), (50, 28), (60, 32)]
TABLE2 = [(70, 35), (80, 37)]
WALK = [(0, 0), (500, 1200), (1000, 1400), (2000, 3200)]

def fig14():
    """Figure 2 of the Higher paper, which shares this question — one plotter, one picture."""
    return scatter(90, 45, 10, 5, 'Angle of incidence in degrees',
                   'Angle of refraction in degrees',
                   'Graph of angle of refraction against angle of incidence, six points plotted',
                   TABLE1)

def fig9():
    line = lambda sx, sy: ('<polyline points="%s" fill="none" stroke="currentColor" '
                           'stroke-width="1.8"/>'
                           % ' '.join('%.1f,%.1f' % (sx(x), sy(y)) for x, y in WALK)) + \
                          ''.join('<text x="%.1f" y="%.1f" class="lbl" '
                                  'style="text-anchor:middle">%s</text>'
                                  % (sx(x), sy(y) - 8, n)
                                  for n, x, y in (('A', 320, 780), ('B', 760, 1330),
                                                  ('C', 1560, 2420)))
    return axes(2200, 3800, 500, 500, 'Time in seconds', 'Distance in metres',
                'Distance-time graph for a walk, in three straight sections labelled A, B and C',
                line, xminor=100, yminor=100)

T1 = ('<table><tr><th>Angle of incidence in degrees</th><th>Angle of refraction in degrees</th>'
      '</tr>' + ''.join('<tr><td>%d</td><td>%d</td></tr>' % r for r in TABLE1) + '</table>')
T2 = ('<table><tr><th>Angle of incidence in degrees</th><th>Angle of refraction in degrees</th>'
      '</tr>' + ''.join('<tr><td>%d</td><td>%d</td></tr>' % r for r in TABLE2) + '</table>')

FIG7 = ("<p><b>Figure 7</b> represents a transverse wave — two and a bit cycles of a smooth wave "
        "about an undisturbed middle line — with four arrows drawn on it. <b>A</b> is a vertical "
        "arrow from a crest all the way down to the next trough. <b>B</b> is a horizontal arrow "
        "from one crest across to the next crest. <b>C</b> is a vertical arrow from a trough up to "
        "the middle line. <b>D</b> is a horizontal arrow between the two points where the wave "
        "crosses the middle line on either side of a crest.</p>")

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",1,"short",SP,"", "", "<p>A group of stars is called a galaxy.</p><p>What is the name of our galaxy? Tick <b>one</b> box.</p><ul><li>Black Eye</li><li>Hockey Stick</li><li>Milky Way</li><li>Sculptor Dwarf</li></ul>",
 "Milky Way", ""),
("1","2",1,"short",SP,"", "", "<p>The Sun is one of the stars in our galaxy.</p><p>What was the Sun originally formed from? Tick <b>one</b> box.</p><ul><li>Dust and gas</li><li>Heavy elements</li><li>Oxygen</li></ul>",
 "Dust and gas", ""),
("1","3",1,"short",SP,"", "", "<p>Which of the following forces was involved in the formation of the Sun? Tick <b>one</b> box.</p><ul><li>Electrostatic force</li><li>Gravitational force</li><li>Magnetic force</li></ul>",
 "Gravitational force", ""),
("1","4",1,"short",SP,"", "", "<p>Stars produce light because they release energy.</p><p>Complete the sentence. Choose the answer from the box: <i>combustion &nbsp; conduction &nbsp; fusion</i></p><p>The process which releases energy inside stars is ............... .</p>",
 "fusion", ""),
("1","5",1,"short",EMW,"", "", "<p>Visible light and infrared radiation travel from the Sun to the Earth.</p><p>Which statement describes the time taken for visible light and infrared radiation to travel from the Sun to the Earth? Tick <b>one</b> box.</p><ul><li>Visible light takes less time than infrared radiation</li><li>Visible light takes the same time as infrared radiation</li><li>Visible light takes more time than infrared radiation</li></ul>",
 "Visible light takes the same time as infrared radiation — all electromagnetic waves travel at the same speed in a vacuum", ""),
("1","6",1,"short",EMW,"", "", "<p>Infrared radiation has a longer wavelength than visible light.</p><p>Complete the sentence. Choose the answer from the box: <i>smaller &nbsp; the same &nbsp; greater</i></p><p>Compared with the frequency of infrared radiation, the frequency of visible light is ............... .</p>",
 "greater — a shorter wavelength means a higher frequency", ""),
("1","7",2,"explain",EMW,"", "", "<p>The Sun and the Earth both emit infrared radiation.</p><p>How does the rate of infrared radiation emitted by the Sun compare with the rate of infrared radiation emitted by the Earth? Give a reason for your answer. Tick <b>one</b> box.</p><ul><li>Lower rate than the Earth</li><li>Same rate as the Earth</li><li>Greater rate than the Earth</li></ul>",
 "Greater rate than the Earth, because the Sun is at a much higher temperature (and has a much greater surface area)", ""),

("2","1",1,"short",EM,"", "", "<p>Some metals are magnetic and others are non-magnetic.</p><p>Which of the following metals is magnetic? Tick <b>one</b> box.</p><ul><li>Aluminium</li><li>Cobalt</li><li>Copper</li><li>Zinc</li></ul>",
 "Cobalt", ""),
("2","2",2,"drawing",EM,"diagram","", "<p><b>Figure 1</b> shows magnetic field lines around a bar magnet, running out of the north pole and round to the south pole. Two circles are drawn on the field lines to represent plotting compasses, both on lines that at that point run from right to left.</p><p>Draw <b>one</b> arrow in each circle on <b>Figure 1</b> to show the direction of the magnetic field at each place.</p>",
 "Two arrows pointing left — along the field line, away from the north pole and towards the south pole. One correct arrow scores 1.",
 "Figure 1 is artwork in the PDF and the answer is a drawing in the scheme; both are described rather than reproduced."),
("2","3",1,"short",EM,"diagram","", "<p><b>Figure 2</b> shows magnetic field lines around a bar magnet, with three places lettered: <b>A</b> right at one pole where the lines are packed closest together, <b>B</b> out to the side where they have spread apart, and <b>C</b> further out still where they are furthest apart.</p><p>Which letter shows where the magnetic field is strongest? Tick <b>one</b> box: <b>A</b>, <b>B</b> or <b>C</b>.</p>",
 "A — the field is strongest where the field lines are closest together",
 "Figure 2 is artwork in the PDF; what it shows is stated in the question."),
("2","4",1,"short",EM,"diagram","", "<p><b>Figure 3</b> shows the magnetic field lines between two bar magnets facing each other: the lines curve away from the gap on both sides and none of them crosses from one magnet to the other.</p><p>Which diagram shows how the magnets are arranged in <b>Figure 3</b>? The options are the same two magnets labelled N-S, S-N, N-N and S-S. Tick <b>one</b> box.</p>",
 "S-S — two like poles facing each other repel, which is the pattern where the field lines curve away from the gap",
 "Figure 3 and the options are artwork in the PDF; what they show is stated in the question."),
("2","5",2,"explain",EM,"diagram","", "<p>A teacher demonstrates how a current in a wire creates a magnetic field around the wire. <b>Figure 4</b> shows a vertical wire passing through a horizontal piece of cardboard, with a switch in the circuit so the current can be switched on and off.</p><p>Describe how the teacher can use a plotting compass to demonstrate the magnetic effect of the current in the wire.</p>",
 "Put the compass on the card near the wire and switch the current on and off — the needle moves when the current is switched. (Or: move the compass around the wire and show that the direction the needle points changes.)",
 "Figure 4 is artwork in the PDF; what it shows is stated in the question."),
("2","6",1,"short",EM,"", "", "<p>The teacher decreases the current in the wire.</p><p>How does the strength of the magnetic field around the wire change? Tick <b>one</b> box.</p><ul><li>Decreases</li><li>Stays the same</li><li>Increases</li></ul>",
 "Decreases", ""),
("2","7",1,"short",EM,"", "", "<p>The teacher reverses the direction of the current in the wire.</p><p>What happens to the magnetic field around the wire?</p>",
 "It reverses direction — the field lines go round the other way", ""),

("3","1",1,"short",F,"diagram","", "<p>A student investigated how changing the mass of a trolley affects the acceleration of the trolley. <b>Figure 5</b> shows some of the equipment: a trolley on a horizontal runway, pulled by a string over a pulley at the end of the bench with a small mass hanging from it.</p><p>The trolley in <b>Figure 5</b> is not moving.</p><p>Which force prevents the trolley from moving? Tick <b>one</b> box.</p><ul><li>Friction</li><li>Tension</li><li>Weight</li></ul>",
 "Friction",
 "Figure 5 is artwork in the PDF; what it shows is stated in the question."),
("3","2",2,"short",F,"", "", "<p>The force pulling on the trolley was increased so that the trolley accelerated. The force was then kept constant and different masses were put on the trolley. For each different mass the acceleration of the trolley was measured.</p><p>Draw <b>one</b> line from each variable to the correct quantity.</p><p>Variables: the <b>mass</b> put on the trolley; the <b>acceleration</b> measured.<br>Quantities: independent variable; dependent variable.</p>",
 "The mass put on the trolley → independent variable. The acceleration measured → dependent variable.", ""),
("3","3",2,"calculation",F,"", "", "<p>For one of the masses put on the trolley, the student recorded three values of acceleration:</p><p>1.58 m/s<sup>2</sup> &nbsp; 1.53 m/s<sup>2</sup> &nbsp; 1.54 m/s<sup>2</sup></p><p>Calculate the mean acceleration of the trolley.</p>",
 "1.55 m/s² — (1.58 + 1.53 + 1.54) ÷ 3", ""),
("3","4",1,"explain",F,"graph","", "<p><b>Figure 6</b> plots the acceleration of the trolley against its total mass: the points start high on the left and fall away steeply, flattening out towards the right without reaching zero.</p><p>Describe the relationship shown in <b>Figure 6</b>.</p>",
 "The acceleration is inversely proportional to the mass — as the mass increases, the acceleration decreases",
 "Figure 6 is a graph in the PDF; its shape is described rather than redrawn, because the points are not stated anywhere in the paper."),
("3","5",2,"calculation",F,"", "", "<p>When the total mass of the trolley was 1.5 kg, the acceleration of the trolley was 0.62 m/s<sup>2</sup>.</p><p>Calculate the resultant force acting on the trolley. Use the equation:</p><p>resultant force = mass × acceleration</p>",
 "0.93 N — 1.5 × 0.62", ""),

("4","1",1,"short",WV,"diagram","", FIG7 + "<p>Which arrow represents the <b>amplitude</b> of the wave? Tick <b>one</b> box: <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>",
 "C — the amplitude is measured from the undisturbed middle line to a crest or trough, not from crest to trough",
 "Figure 7 is artwork in the PDF; what it shows is written out in the question."),
("4","2",1,"short",WV,"diagram","", "<p>Which arrow represents the <b>wavelength</b> of the wave? Tick <b>one</b> box: <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>",
 "B — one whole cycle, from a point on the wave to the same point on the next",
 "Figure 7 is artwork in the PDF; what it shows is written out at 04.1."),
("4","3",2,"calculation",WV,"", "", "<p>A wave has a frequency of 5000 Hz.</p><p>Calculate the period of the wave. Use the equation:</p><p>period = 1 ÷ frequency</p>",
 "0.0002 s (2 × 10⁻⁴ s)", ""),
("4","4",1,"short",EMW,"", "", "<p>Give <b>one</b> example of a transverse wave that can travel through a vacuum.</p>",
 "Any named electromagnetic wave — light, radio waves, X-rays, and so on", ""),
("4","5",1,"short",WV,"diagram","", "<p><b>Figure 8</b> represents a longitudinal wave as a row of vertical lines, bunched close together in some places and spread apart in others. Three points are lettered: <b>E</b> where the lines are bunched tightest, <b>F</b> in the middle of the widest gap, and <b>G</b> where they are bunched again.</p><p>Which point is at the centre of a rarefaction? Tick <b>one</b> box: <b>E</b>, <b>F</b> or <b>G</b>.</p>",
 "F — a rarefaction is where the particles are furthest apart",
 "Figure 8 is artwork in the PDF; what it shows is stated in the question."),
("4","6",2,"calculation",WV,"", "", "<p>A sound wave has a frequency of 750 Hz.</p><p>speed of sound in air = 330 m/s</p><p>Calculate the wavelength of the sound wave. Use the equation:</p><p>wavelength = wave speed ÷ frequency</p>",
 "0.44 m — 330 ÷ 750", ""),
("4","7",4,"written",WV,"", "", "<p>Describe a method that could be used to determine the speed of sound in air.</p>",
 "Level-marked out of 4. Make a sound with something sharp — cymbals, wooden blocks, a starting pistol. Measure the distance between the source and the detector with a tape measure, trundle wheel or metre rule — the distance to a wall, along a track, or between two microphones. Start timing when the sound is made and stop when it is heard, using a stopwatch, oscilloscope or data logger. For an echo method, double the distance or halve the time. Then use speed = distance ÷ time.", ""),
("4","8",1,"short",WV,"", "", "<p>When a sound wave moves from air into water, the speed of the wave increases. The frequency of the sound wave does not change.</p><p>Complete the sentence. Choose the answer from the box: <i>decreases &nbsp; stays the same &nbsp; increases</i></p><p>When a sound wave moves from air into water its wavelength ............... .</p>",
 "increases — wavelength is speed ÷ frequency, and the speed has gone up while the frequency has not", ""),

("5","1",2,"short",F,"", "", "<p>A person has been for a walk.</p><p>Some quantities are scalar quantities and others are vector quantities.</p><p>Which of the following are scalar quantities? Tick <b>two</b> boxes.</p><ul><li>Displacement</li><li>Distance</li><li>Force</li><li>Speed</li><li>Velocity</li></ul>",
 "Distance and speed — the other three have a direction as well as a size", ""),
("5","2",1,"short",F,"graph", fig9(), "<p><b>Figure 9</b> shows the distance–time graph for the walk, in three straight sections: <b>A</b> from the start up to 1200 m at 500 s, <b>B</b> from there to 1400 m at 1000 s, and <b>C</b> from there to 3200 m at 2000 s.</p><p>What was the total distance walked by the person in 2000 seconds?</p>",
 "3200 m", ""),
("5","3",2,"calculation",F,"graph", fig9(), "<p>Calculate the average speed of the person during the 2000 seconds. Use your answer to Question 05.2 and the equation:</p><p>average speed = total distance ÷ total time</p>",
 "1.6 m/s — 3200 ÷ 2000", ""),
("5","4",2,"explain",F,"graph", fig9(), "<p>Which section of <b>Figure 9</b> shows the person walking the slowest? Give a reason for your answer. Tick <b>one</b> box: <b>A</b>, <b>B</b> or <b>C</b>.</p>",
 "B, because it has the smallest gradient — on a distance–time graph the gradient is the speed", ""),
("5","5",1,"short",F,"", "", "<p>The person walked slowest when going up some steps.</p><p>Complete the sentence. Choose the answer from the box: <i>air resistance &nbsp; friction &nbsp; gravity</i></p><p>When walking up the steps, the person did more work against the force of ............... .</p>",
 "gravity", ""),
("5","6",1,"short",F,"", "", "<p>On another day, the person ran the same route.</p><p>What is a typical speed for a person running? Tick <b>one</b> box.</p><ul><li>0.3 m/s</li><li>3.0 m/s</li><li>30 m/s</li></ul>",
 "3.0 m/s", ""),

("6","1",1,"short",EMW,"diagram","", "<p><b>Figure 10</b> is a scale of wavelengths with the types of electromagnetic radiation marked along it, from radio waves at the long end through microwaves, infrared, the visible band from about 400 nm to 700 nm, ultraviolet, X-rays and gamma rays at the short end.</p><p>Suggest <b>one</b> piece of equipment that can be used to detect infrared radiation.</p>",
 "An infrared camera (a thermal imaging camera, night vision goggles or a thermometer are also accepted)",
 "Figure 10 is artwork in the PDF; what it shows is stated in the question."),
("6","2",1,"short",EMW,"diagram","", "<p>Which of the following values is a wavelength of red light? Tick <b>one</b> box.</p><ul><li>320 nm</li><li>410 nm</li><li>690 nm</li><li>750 nm</li></ul>",
 "690 nm — red is at the long-wavelength end of the visible band, which stops before 700 nm",
 "Figure 10 is artwork in the PDF; what it shows is stated at 06.1."),
("6","3",2,"explain",EMW,"diagram","", "<p>The eyes of a bee can detect electromagnetic radiation with wavelengths between 300 nm and 600 nm.</p><p>Give <b>two</b> ways the radiation detected by the eyes of a bee is different from the radiation detected by human eyes.</p>",
 "Bees cannot detect all the colours a human can — they cannot see red light. And bees can detect ultraviolet radiation, which humans cannot.",
 "Figure 10 is artwork in the PDF; what it shows is stated at 06.1."),
("6","4",2,"short",EMW,"", "", "<p>Complete the sentences. Choose the answers from the box: <i>absorbed &nbsp; emitted &nbsp; reflected &nbsp; refracted</i></p><p>When sunlight shines on a red flower, the red light is ............... .<br>All other colours of light shining on the red flower are ............... .</p>",
 "reflected; absorbed — in that order", ""),
("6","5",1,"short",EMW,"", "", "<p>A gardener looks at a red flower through a green filter.</p><p>How does the flower appear to the gardener? Tick <b>one</b> box.</p><ul><li>Black</li><li>Green</li><li>Red</li><li>White</li></ul>",
 "Black — the filter only lets green through and the flower only reflects red, so no light reaches the eye", ""),
("6","6",1,"short",EMW,"", "", "<p>The leaves of the plant reflect light. The leaves have a rough surface.</p><p>What type of reflection happens at the leaf surface?</p>",
 "Diffuse (scattering)", ""),

("7","1",2,"calculation",F,"", "", "<p>A swimming pool is being filled with water.</p><p>Calculate the weight of the water in the swimming pool when the mass of the water is 25 000 kg.</p><p>gravitational field strength = 9.8 N/kg</p><p>Use the equation: weight = mass × gravitational field strength</p>",
 "245 000 N — 25 000 × 9.8", ""),
("7","2",3,"calculation",F,"", "", "<p>When the swimming pool is full, the weight of the water is 1 960 000 N. The bottom of the swimming pool has an area of 49 m<sup>2</sup>.</p><p>Calculate the pressure at the bottom of the swimming pool when it is full. Use the equation:</p><p>pressure = weight ÷ area</p><p>Choose the unit from the box: <i>m<sup>2</sup> &nbsp; m<sup>3</sup> &nbsp; N &nbsp; Pa</i></p>",
 "40 000 Pa — 1 960 000 ÷ 49. The unit is the pascal.", ""),
("7","3",1,"short",F,"diagram","", "<p>There is a force acting on the side of the swimming pool because of the water pressure. <b>Figure 11</b> shows the side of the swimming pool with three arrows drawn at a point on the wall: <b>A</b> pointing straight down, <b>B</b> pointing horizontally outwards at right angles to the wall, and <b>C</b> pointing diagonally.</p><p>Which arrow shows the direction of the force acting on the side of the swimming pool? Tick <b>one</b> box: <b>A</b>, <b>B</b> or <b>C</b>.</p>",
 "B — the force from a fluid acts at right angles to the surface",
 "Figure 11 is artwork in the PDF; what it shows is stated in the question."),
("7","4",2,"calculation",F,"", "", "<p>A child is swimming in the pool. The velocity of the child is 0.70 m/s. The child then accelerates for 5.0 s, reaching a final velocity of 1.3 m/s.</p><p>Calculate the acceleration of the child. Use the equation:</p><p>acceleration = change in velocity ÷ time taken</p>",
 "0.12 m/s² — (1.3 − 0.7) ÷ 5.0", ""),
("7","5",2,"calculation",F,"diagram","", "<p><b>Figure 12</b> shows a diving board at the side of the swimming pool, mounted on a spring at the poolside end.</p><p>The original length of the spring is 0.84 m. When the child stands on the diving board, the length of the spring decreases by 0.21 m.</p><p>Calculate the percentage change in the length of the spring.</p>",
 "25% — 0.21 ÷ 0.84 × 100",
 "Figure 12 is artwork in the PDF; what it shows is stated in the question."),
("7","6",1,"short",F,"", "", "<p>Write down the equation which links extension (<i>e</i>), force applied to a spring (<i>F</i>) and spring constant (<i>k</i>).</p>",
 "force = spring constant × extension, or F = k × e", ""),
("7","7",3,"calculation",F,"", "", "<p>The force applied to the spring by the weight of the child is 336 N. The change in length of the spring is 0.21 m.</p><p>Calculate the spring constant of the spring.</p>",
 "1600 N/m — 336 = k × 0.21, so k = 336 ÷ 0.21", ""),
("7","8",4,"calculation",F,"", "", "<p>The child steps off the diving board and falls into the swimming pool. The initial velocity of the child is 0 m/s.</p><p>acceleration due to gravity = 9.8 m/s<sup>2</sup></p><p>Calculate the final velocity when the child has fallen a distance of 0.95 m through the air. Give your answer to 2 significant figures. Use the Physics Equations Sheet.</p>",
 "4.3 m/s — v² − 0² = 2 × 9.8 × 0.95 = 18.62, so v = √18.62 = 4.3150…", ""),

("8","1",1,"short",WV,"diagram","", "<p>A student investigated the refraction of light by a glass block. <b>Figure 13</b> shows the protractor used to measure the angles of incidence and the angles of refraction. It is an ordinary semicircular protractor, marked in single degrees with a double scale running 0 to 180 in both directions.</p><p>What is the resolution of the protractor used to measure the angles?</p>",
 "1°", "Figure 13 is artwork in the PDF; what it shows is stated in the question."),
("8","2",6,"written",WV,"", "", "<p><b>Table 1</b> shows the results.</p>" + T1 + "<p>Describe a method the student could have used to obtain the data in <b>Table 1</b>. You may include a labelled diagram.</p>",
 "Level-marked out of 6. Place the glass block on a piece of paper and draw around it. Shine a ray from a ray box through the block. Mark the ray going in and the ray coming out, and join the marks to show the whole path through the block. Draw a normal at 90° to the surface. Measure the angle of incidence and the angle of refraction with a protractor. Repeat over a range of angles of incidence — 10° to 60° in 10° steps. Methods using mirrors and reflection score zero.", ""),
("8","3",2,"drawing",WV,"graph", fig14(), "<p><b>Figure 14</b> shows some of the results from <b>Table 1</b>. The student measured the angles of refraction for two additional angles of incidence. <b>Table 2</b> shows the additional results.</p>" + T2 + "<p>Complete <b>Figure 14</b>. You should plot the results from <b>Table 2</b> and draw the line of best fit.</p>",
 "Plot (70, 35) and (80, 37) — both within half a small square — and draw a curve through all eight points. A line starting at the origin is allowed.", ""),
("8","4",1,"explain",WV,"graph", fig14(), "<p>How does <b>Figure 14</b> show that the angle of refraction is <b>not</b> directly proportional to the angle of incidence?</p>",
 "The line curves — it is not straight", ""),
("8","5",2,"drawing",WV,"diagram","", "<p><b>Figure 15</b> shows a diagram of a car headlight, which has a lamp, a curved reflective surface behind it and a flat transparent cover across the front. <b>Figure 16</b> shows a ray of light leaving the lamp and meeting the curved reflective surface.</p><p>Complete <b>Figure 16</b> to show the reflected ray of light. You should include the normal line at the point where the incident ray meets the reflecting surface.</p>",
 "Draw the normal at the point where the ray meets the mirror, then the reflected ray so that the angle of reflection equals the angle of incidence. Judged by eye.",
 "Figures 15 and 16 are artwork in the PDF and are not transcribed."),
("8","6",1,"short",WV,"diagram","", "<p>Rays of light pass through the transparent cover of the headlight.</p><p>Which diagram shows how a ray of light passes through the transparent cover? Tick <b>one</b> box.</p><ul><li>The ray bends at both surfaces of the cover and leaves parallel to, but shifted sideways from, the ray that went in.</li><li>The ray bends at the first surface and then turns back downwards on leaving.</li><li>The ray passes straight through without changing direction.</li></ul>",
 "The first one — the ray refracts at both surfaces and emerges parallel to the incident ray but displaced sideways",
 "The three diagrams are artwork in the PDF. The answer is the one the mark scheme prints."),

("9","1",2,"explain",F,"diagram","", "<p><b>Figure 17</b> shows a young child using a baby walker. The child is standing still.</p><p>What is the resultant vertical force on the child? Give a reason for your answer.</p>",
 "0 N, because the child is not accelerating vertically — the upward forces equal the downward forces, so the forces are balanced",
 "Figure 17 is a photograph in the PDF and is not transcribed."),
("9","2",1,"short",F,"", "", "<p>Write down the equation which links distance (<i>s</i>), force (<i>F</i>) and work done (<i>W</i>).</p>",
 "work done = force × distance, or W = F × s", ""),
("9","3",3,"calculation",F,"", "", "<p>The child pushed the baby walker 2.8 m across a horizontal floor. The work done by the child was 35 J.</p><p>Calculate the horizontal force the child applied to the baby walker.</p>",
 "12.5 N (13 N is also accepted)", ""),
("9","4",2,"explain",F,"", "", "<p>The child pushed the baby walker from a carpet onto a hard floor. The child applied the same horizontal force to the baby walker.</p><p>Explain why the speed of the baby walker increased.</p>",
 "The resistive force — the friction between the wheels and the floor — has decreased, so the resultant force increases", ""),
("9","5",1,"short",F,"", "", "<p>Write down the equation which links distance (<i>d</i>), force (<i>F</i>) and moment of a force (<i>M</i>).</p>",
 "moment = force × distance, or M = F × d", ""),
("9","6",3,"calculation",F,"diagram","", "<p>There are some toy gears on the front of the baby walker; <b>Figure 18</b> shows two of them, gear A and gear B, meshed together. The child applies a force to gear A, which causes a moment about the pivot, so gear A rotates.</p><p>The child applies a force of 2.0 N on gear A. The perpendicular distance between the force and the pivot is 7.5 cm.</p><p>Calculate the moment of the force about the pivot.</p>",
 "0.15 N m — convert 7.5 cm to 0.075 m first, then M = 2.0 × 0.075",
 "Figure 18 is artwork in the PDF and is not transcribed."),
("9","7",2,"explain",F,"diagram","", "<p>Explain what happens to gear B when the child applies the force to gear A.</p>",
 "Gear B rotates in the opposite direction to gear A — or clockwise, or faster than gear A — because gear A exerts a force on gear B, causing a moment about gear B's pivot",
 "Figure 18 is artwork in the PDF and is not transcribed."),
]

# ---- the paper says what it is out of, and so does every box down the margin ----
PER_QUESTION = {"1": 8, "2": 9, "3": 8, "4": 13, "5": 9, "6": 8, "7": 18, "8": 13, "9": 14}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())

# ---- every number the scheme prints inside its own working, recomputed here ----
assert round((1.58 + 1.53 + 1.54) / 3, 2) == 1.55
assert round(1.5 * 0.62, 2) == 0.93
assert 1 / 5000 == 0.0002
assert 330 / 750 == 0.44
assert 3200 / 2000 == 1.6
assert round(25000 * 9.8) == 245000        # 9.8 is not exact in binary; see 8462/2F
assert 1960000 / 49 == 40000
assert round((1.3 - 0.7) / 5.0, 2) == 0.12
assert round(0.21 / 0.84 * 100) == 25
assert round(336 / 0.21) == 1600
assert round(2 * 9.8 * 0.95, 2) == 18.62 and round(18.62 ** 0.5, 1) == 4.3
assert round(35 / 2.8, 1) == 12.5 and 2.0 * 0.075 == 0.15    # shared with 8463/2H question 02
# Figure 9's own corners give the two numbers the scheme quotes
assert WALK[-1] == (2000, 3200) and WALK[-1][1] / WALK[-1][0] == 1.6
for _, _, _, _, topics, *_ in Q:
    assert ',' not in topics, topics

d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 6

rows = []
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-8463-2406-2F-%02d%s' % (int(q), part), kind='question',
             question=q, part=part, section='', marks=str(marks), html=html,
             answer=answer, answer_type=atype, topics=topics, figure=figure,
             diagram=diagram, diagram_by=('family' if diagram else ''), placeholder='')
    if note:
        r['examiner_note'] = note
    rows.append(r)

p = pathlib.Path('/home/user/family/data/questions.json')
lines = p.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
seen = {json.loads(l.rstrip(','))['row_id'] for l in lines if '"row_id"' in l}
clash = seen & {r['row_id'] for r in rows}
assert not clash, 'row ids already in the file: %r' % sorted(clash)

lines[-2] += ','
for r in rows[:-1]:
    lines.insert(-1, json.dumps(r) + ',')
lines.insert(-1, json.dumps(rows[-1]))
p.write_text('\n'.join(lines) + '\n')
print('wrote %d question rows for %s, %d marks' % (len(rows), PAPER, sum(got.values())))
