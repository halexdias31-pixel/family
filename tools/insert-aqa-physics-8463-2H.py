#!/usr/bin/env python3
"""AQA GCSE Physics 8463/2H, June 2024 — 43 question rows into data/questions.json.

WHY THIS IS A SCRIPT AND NOT A HAND EDIT. CLAUDE.md: "Every number in a transcription is checked
against the paper's own stated total ... and the insert script asserts it before writing a row."
The cover says 100 and the mark scheme's own "Total Question n" lines say 13, 14, 16, 14, 9, 8, 18,
8. Both are asserted below, so a dropped part or a misread mark count fails here rather than
shipping.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Higher)_ Paper 2 - June 2024 (2).pdf`, which is AQA's
own 8463/2H scheme — read, not derived. The 2017 Highers are why that is the rule.

FOUR FIGURES ARE DRAWN HERE AND THE REST ARE DESCRIBED. The line this repository draws is whether
the row's own words DETERMINE the picture. Figure 2 is Table 1 plotted, Figure 7 is one triplet of
lines at three shifts, Figure 9 is four labelled points on a circle, and Figure 12 is five
coordinates the mark scheme itself quotes — every one of those is a drawing instruction with
exactly one answer, so each is built below from the numbers rather than traced by eye. The baby
walker, the gears, the submarine, the headlight, the trolley runway, the ammeter demonstration and
the microphone are apparatus photographs: they carry `figure` so `check-library.js` counts them,
and what they show is said in prose rather than invented as SVG.

AND THE SCALE IS A CONSTANT, NOT AN ACCIDENT. `W` is 340 for every drawing in this library, because
`.qsheet figure svg` is `width: min(100%, 20rem)` — so the viewBox width IS the scale, and two
diagrams with different viewBox widths come out at different sizes on one screen. That fault is
recorded in CLAUDE.md under the coins.
"""
import json, datetime, pathlib

PAPER = 'P-AQA-8463-2406-2H'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS4', band_type='stage',
           band_value='GCSE', tier='Higher', level='GCSE', company='AQA', exam_board='AQA',
           spec_code='8463/2H', exam_wave='First wave', year='2024', month='6', paper='2',
           exam_date='2024-06-14', document_type='Past paper', name='Paper 2 — June 2024',
           active='True', trackable='True', printable='False')

WV = 'Waves'; F = 'Forces'; SP = 'Space Physics'; EM = 'Magnetism and Electromagnetism'
EMW = 'Electromagnetic Waves'

W = 340   # see tools/draw-money-coins.py — the viewBox width IS the scale

# ---------------------------------------------------------------------------------------------
# FIGURE 2 — Table 1 plotted. The six crosses are the six rows of Table 1 and nothing else, which
# is what makes this a drawing instruction rather than a summary: there is exactly one picture the
# words can mean. 01.3 asks you to add the two rows of Table 2 to it, so the pad in find.js lays a
# pen over this and the question becomes answerable.
# ---------------------------------------------------------------------------------------------
def axes(pts, xmax, ymax, xstep, ystep, xlab, ylab, label, extra=''):
    """One scale places the marks, the ticks and the labels — CLAUDE.md's rule for a chart, and the
    reason both graphs on this paper go through one function. It also settles two things a
    screenshot caught the first time round.

    `text-anchor` HAS TO BE INLINE, NOT AN ATTRIBUTE. `.qsheet .num` in style.css sets
    `text-anchor: middle`, and CSS beats an SVG presentation attribute — so `text-anchor="end"` on
    the y-axis numbers did nothing and every one of them sat centred on the axis line. Same fault
    as `.price.faint` losing its specificity race: it reads as a decision and behaves as nothing.

    AND THE PLOT IS TALL ENOUGH FOR ITS OWN LABELS. Ten values up a 136-unit axis at the 13px this
    stylesheet sets for `.num` is ten labels in the space of ten labels, which came out as a grey
    smear. The box is sized from how many labels it has to carry."""
    L, R, T = 52, 326, 14
    rows = ymax / ystep + 1
    B = T + max(136, int(rows * 17))
    sx = lambda v: L + (R - L) * v / xmax
    sy = lambda v: B - (B - T) * v / ymax
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s">' % (W, B + 48, label)]
    for i in range(0, int(xmax / (xstep / 5)) + 1):          # minor grid, five to a labelled step
        x = sx(i * xstep / 5)
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>' % (x, T, x, B))
    for i in range(0, int(ymax / (ystep / 5)) + 1):
        y = sy(i * ystep / 5)
        p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"/>' % (L, y, R, y))
    p.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
             'stroke-width="1" opacity=".55"/>' % (L, T, R - L, B - T))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    v = 0
    while v <= xmax + 1e-9:
        p.append('<text x="%.1f" y="%d" class="num">%g</text>' % (sx(v), B + 15, v)); v += xstep
    v = 0
    while v <= ymax + 1e-9:
        p.append('<text x="%d" y="%.1f" class="num" style="text-anchor:end">%g</text>'
                 % (L - 5, sy(v) + 4, v)); v += ystep
    p.append(extra(sx, sy) if callable(extra) else extra)
    p.append('<text x="%.1f" y="%d" class="ax" style="text-anchor:middle">%s</text>'
             % ((L + R) / 2, B + 36, xlab))
    p.append('<text x="12" y="%d" class="ax" style="text-anchor:middle" '
             'transform="rotate(-90 12 %d)">%s</text>' % ((T + B) / 2, (T + B) / 2, ylab))
    return ''.join(p) + '</svg>'

TABLE1 = [(10, 6), (20, 12), (30, 18), (40, 23), (50, 28), (60, 32)]
TABLE2 = [(70, 35), (80, 37)]

# ---------------------------------------------------------------------------------------------
# FIGURE 2 — Table 1 plotted. The six crosses are the six rows of Table 1 and nothing else, which
# is what makes this a drawing instruction rather than a summary: there is exactly one picture the
# words can mean. 01.3 asks you to add the two rows of Table 2 to it, so the pad in find.js lays a
# pen over this and the question becomes answerable.
# ---------------------------------------------------------------------------------------------
def fig2():
    def crosses(sx, sy):
        out = []
        for x, y in TABLE1:
            cx, cy = sx(x), sy(y)
            out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                       % (cx - 3, cy - 3, cx + 3, cy + 3))
            out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                       % (cx - 3, cy + 3, cx + 3, cy - 3))
        return ''.join(out)
    return axes(TABLE1, 90, 45, 10, 5, 'Angle of incidence in degrees',
                'Angle of refraction in degrees',
                'Graph of angle of refraction against angle of incidence, six points plotted',
                crosses)

# ---------------------------------------------------------------------------------------------
# FIGURE 7 — ONE TRIPLET OF LINES AT THREE SHIFTS, which is the whole physics of the question. The
# Sun's three absorption lines are measured off the paper once; galaxy A and galaxy B are that same
# triplet slid toward the red end by a fixed fraction each. Built that way rather than as nine
# independent lines, because "the lines have the same pattern" is the question's own first sentence
# and a picture whose three patterns did not match would contradict it.
# ---------------------------------------------------------------------------------------------
SUN_LINES = (0.178, 0.210, 0.363)
def fig7():
    L, R, H, PITCH = 74, 332, 30, 56
    rows = [('The Sun', 0.0), ('Galaxy A', 0.61), ('Galaxy B', 0.39)]
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="Visible spectra of the Sun and two '
         'galaxies, showing the same three dark lines shifted towards red">'
         % (W, 10 + PITCH * len(rows) + 4)]
    for i, (name, shift) in enumerate(rows):
        y = 10 + i * PITCH
        p.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
                 'stroke-width="1.2"/>' % (L, y, R - L, H))
        p.append('<text x="%d" y="%d" class="num" style="text-anchor:end">%s</text>'
                 % (L - 6, y + H / 2 + 4, name))
        for f in SUN_LINES:
            x = L + (R - L) * (f + shift)
            p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="currentColor" '
                     'stroke-width="2.6"/>' % (x, y + 1, x, y + H - 1))
        p.append('<text x="%d" y="%d" class="ax" style="text-anchor:start">Blue</text>'
                 % (L + 2, y + H + 13))
        p.append('<text x="%d" y="%d" class="ax" style="text-anchor:end">Red</text>'
                 % (R - 2, y + H + 13))
    return ''.join(p) + '</svg>'

# ---------------------------------------------------------------------------------------------
# FIGURE 9 — four labelled points on a circle, and where they sit IS the answer. A, B, C and D are
# at 45, 90, 135 and 180 degrees round from the earthquake, so D is the point diametrically
# opposite it — the S-wave shadow. Drawn from those four angles rather than by eye, because a label
# placed a few degrees out would make the right answer arguable.
#
# THE EARTH SITS RIGHT OF CENTRE, which is not a composition choice: the three layer names are the
# widest text in the drawing and they read leftwards off a leader line. Centred, "Liquid outer core"
# ran off the left edge of the viewBox and the `<svg>` clipped it to "quid outer core" — caught on a
# screenshot, which is the seventh time this repository has written that sentence.
# ---------------------------------------------------------------------------------------------
def fig9():
    import math
    cx, cy, r = 236, 116, 80
    p = ['<svg viewBox="0 0 %d 236" role="img" aria-label="Cross-section of the Earth showing the '
         'mantle, liquid outer core and solid inner core, with an earthquake at the top and four '
         'labelled points A to D">' % W]
    p.append('<circle cx="%d" cy="%d" r="%d" fill="currentColor" fill-opacity=".07" '
             'stroke="currentColor" stroke-width="1.2"/>' % (cx, cy, r))
    p.append('<circle cx="%d" cy="%d" r="%.1f" fill="currentColor" fill-opacity=".18" '
             'stroke="currentColor" stroke-width="1.2"/>' % (cx, cy, r * 0.34))
    p.append('<circle cx="%d" cy="%d" r="%.1f" fill="currentColor" fill-opacity=".38" '
             'stroke="currentColor" stroke-width="1.2"/>' % (cx, cy, r * 0.16))
    p.append('<circle cx="%d" cy="%.1f" r="3.2" fill="currentColor"/>' % (cx, cy - r))
    p.append('<text x="%d" y="%.1f" class="ax" style="text-anchor:middle">Position of earthquake'
             '</text>' % (cx, cy - r - 10))
    for name, deg in (('A', 45), ('B', 90), ('C', 135), ('D', 180)):
        a = math.radians(deg - 90)
        x, y = cx + (r + 14) * math.cos(a), cy + (r + 14) * math.sin(a)
        p.append('<text x="%.1f" y="%.1f" class="lbl" style="text-anchor:middle">%s</text>'
                 % (x, y + 4, name))
    for label, at, ty in (('Solid mantle', 0.72, 62), ('Liquid outer core', 0.25, 92),
                          ('Solid inner core', 0.06, 122)):
        p.append('<line x1="142" y1="%d" x2="%.1f" y2="%.1f" stroke="currentColor" '
                 'stroke-width=".8"/>' % (ty - 4, cx - r * at, cy - r * at * 0.4))
        p.append('<text x="138" y="%d" class="ax" style="text-anchor:end">%s</text>' % (ty, label))
    return ''.join(p) + '</svg>'

# ---------------------------------------------------------------------------------------------
# FIGURE 12 — five coordinates, and the mark scheme quotes four of them back. 1/2 x 56 x 220 = 6160
# and 56 x 380 = 21280 are printed in the scheme for 07.1, and (-)36/120 is printed for 07.3, so the
# corners at (220, 56), (600, 56) and (720, 20) are the paper's own numbers rather than a reading.
# ---------------------------------------------------------------------------------------------
TRAIN = [(0, 0), (220, 56), (600, 56), (720, 20), (960, 0)]
def fig12():
    line = lambda sx, sy: ('<polyline points="%s" fill="none" stroke="currentColor" '
                           'stroke-width="1.8"/>'
                           % ' '.join('%.1f,%.1f' % (sx(x), sy(y)) for x, y in TRAIN))
    return axes(TRAIN, 1100, 70, 200, 10, 'Time in s', 'Velocity in m/s',
                'Velocity-time graph for a train between two stations', line)

T1 = ('<table><tr><th>Angle of incidence in degrees</th><th>Angle of refraction in degrees</th>'
      '</tr>' + ''.join('<tr><td>%d</td><td>%d</td></tr>' % r for r in TABLE1) + '</table>')
T2 = ('<table><tr><th>Angle of incidence in degrees</th><th>Angle of refraction in degrees</th>'
      '</tr>' + ''.join('<tr><td>%d</td><td>%d</td></tr>' % r for r in TABLE2) + '</table>')

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",1,"short",WV,"diagram","", "<p>A student investigated the refraction of light by a glass block. <b>Figure 1</b> shows the protractor used to measure the angles of incidence and the angles of refraction. It is an ordinary semicircular protractor, marked in single degrees with a double scale running 0 to 180 in both directions.</p><p>What is the resolution of the protractor used to measure the angles?</p>",
 "1°", ""),
("1","2",6,"written",WV,"", "", "<p><b>Table 1</b> shows the results.</p>" + T1 + "<p>Describe a method the student could have used to obtain the data in <b>Table 1</b>. You may include a labelled diagram.</p>",
 "Level-marked out of 6. Place the glass block on a piece of paper and draw around it. Shine a ray from a ray box through the block. Mark the ray going in and the ray coming out, and join the marks to show the whole path through the block. Draw a normal at 90° to the surface. Measure the angle of incidence and the angle of refraction with a protractor. Repeat over a range of angles of incidence — 10° to 60° in 10° steps. Methods using mirrors and reflection score zero.", ""),
("1","3",2,"drawing",WV,"graph", fig2(), "<p><b>Figure 2</b> shows some of the results from <b>Table 1</b>. The student measured the angles of refraction for two additional angles of incidence. <b>Table 2</b> shows the additional results.</p>" + T2 + "<p>Complete <b>Figure 2</b>. You should:</p><ul><li>plot the results from <b>Table 2</b></li><li>draw the line of best fit.</li></ul>",
 "Plot (70, 35) and (80, 37) — both within half a small square — and draw a curve through all eight points. A line starting at the origin is allowed.", ""),
("1","4",1,"explain",WV,"graph", fig2(), "<p>How does <b>Figure 2</b> show that the angle of refraction is <b>not</b> directly proportional to the angle of incidence?</p>",
 "The line curves — it is not straight", ""),
("1","5",2,"drawing",WV,"diagram","", "<p><b>Figure 3</b> shows a diagram of a car headlight, which has a lamp, a curved reflective surface behind it and a flat transparent cover across the front. <b>Figure 4</b> shows a ray of light leaving the lamp and meeting the curved reflective surface.</p><p>Complete <b>Figure 4</b> to show the reflected ray of light. You should include the normal line at the point where the incident ray meets the reflecting surface.</p>",
 "Draw the normal at the point where the ray meets the mirror, then the reflected ray so that the angle of reflection equals the angle of incidence. Judged by eye.",
 "Figures 3 and 4 are artwork in the PDF and are not transcribed."),
("1","6",1,"short",WV,"diagram","", "<p>Rays of light pass through the transparent cover of the headlight.</p><p>Which diagram shows how a ray of light passes through the transparent cover? Tick <b>one</b> box.</p><ul><li>The ray bends at both surfaces of the cover and leaves parallel to, but shifted sideways from, the ray that went in.</li><li>The ray bends at the first surface and then turns back downwards on leaving.</li><li>The ray passes straight through without changing direction.</li></ul>",
 "The first one — the ray refracts at both surfaces and emerges parallel to the incident ray but displaced sideways",
 "The three diagrams are artwork in the PDF. The answer was read off a render of the mark scheme, which prints the correct one."),

("2","1",2,"explain",F,"diagram","", "<p><b>Figure 5</b> shows a young child using a baby walker. The child is standing still.</p><p>What is the resultant vertical force on the child? Give a reason for your answer.</p>",
 "0 N, because the child is not accelerating vertically — the upward forces equal the downward forces, so the forces are balanced",
 "Figure 5 is a photograph in the PDF and is not transcribed."),
("2","2",1,"short",F,"", "", "<p>Write down the equation which links distance (<i>s</i>), force (<i>F</i>) and work done (<i>W</i>).</p>",
 "work done = force × distance, or W = F × s", ""),
("2","3",3,"calculation",F,"", "", "<p>The child pushed the baby walker 2.8 m across a horizontal floor. The work done by the child was 35 J.</p><p>Calculate the horizontal force the child applied to the baby walker.</p>",
 "12.5 N (13 N is also accepted)", ""),
("2","4",2,"explain",F,"", "", "<p>The child pushed the baby walker from a carpet onto a hard floor. The child applied the same horizontal force to the baby walker.</p><p>Explain why the speed of the baby walker increased.</p>",
 "The resistive force — the friction between the wheels and the floor — has decreased, so the resultant force increases", ""),
("2","5",1,"short",F,"", "", "<p>Write down the equation which links distance (<i>d</i>), force (<i>F</i>) and moment of a force (<i>M</i>).</p>",
 "moment = force × distance, or M = F × d", ""),
("2","6",3,"calculation",F,"diagram","", "<p>There are some toy gears on the front of the baby walker; <b>Figure 6</b> shows two of them, gear A and gear B, meshed together. The child applies a force to gear A, which causes a moment about the pivot, so gear A rotates.</p><p>The child applies a force of 2.0 N on gear A. The perpendicular distance between the force and the pivot is 7.5 cm.</p><p>Calculate the moment of the force about the pivot.</p>",
 "0.15 N m — convert 7.5 cm to 0.075 m first, then M = 2.0 × 0.075",
 "Figure 6 is artwork in the PDF and is not transcribed."),
("2","7",2,"explain",F,"diagram","", "<p>Explain what happens to gear B when the child applies the force to gear A.</p>",
 "Gear B rotates in the opposite direction to gear A — or clockwise, or faster than gear A — because gear A exerts a force on gear B, causing a moment about gear B's pivot",
 "Figure 6 is artwork in the PDF and is not transcribed."),

("3","1",3,"short",SP,"", "", "<p>The Universe contains many stars. The Sun is the star at the centre of our solar system.</p><p>Give <b>three</b> other types of object that form our solar system.</p>",
 "Any three of: planets; dwarf planets; moons (natural satellites); asteroids; meteors, meteoroids or meteorites; comets", ""),
("3","2",1,"short",SP,"", "", "<p>Some main sequence stars will eventually form black holes. <b>Table 3</b> gives the mass of four stars.</p><table><tr><th>Star</th><th>Mass in kg</th></tr><tr><td>Arcturus</td><td>2.2 × 10<sup>30</sup></td></tr><tr><td>Betelgeuse</td><td>2.2 × 10<sup>31</sup></td></tr><tr><td>Cygni A</td><td>1.4 × 10<sup>30</sup></td></tr><tr><td>The Sun</td><td>2.0 × 10<sup>30</sup></td></tr></table><p>Which star in <b>Table 3</b> is most likely to form a black hole?</p>",
 "Betelgeuse", ""),
("3","3",1,"short",SP,"", "", "<p>The distance from Cygni A to the Earth is 1.1 × 10<sup>8</sup> gigametres.</p><p>Which distance is the same as 1.1 × 10<sup>8</sup> gigametres? Tick <b>one</b> box.</p><ul><li>1.1 × 10<sup>11</sup> m</li><li>1.1 × 10<sup>14</sup> m</li><li>1.1 × 10<sup>17</sup> m</li><li>1.1 × 10<sup>20</sup> m</li></ul>",
 "1.1 × 10^17 m", ""),
("3","4",3,"explain",SP,"diagram", fig7(), "<p>The light spectrum from every galaxy includes dark lines. The lines have the same pattern. <b>Figure 7</b> shows the position of dark lines in the visible spectra of light from the Sun and from two distant galaxies.</p><p>Explain what these light spectra tell us about the velocities of galaxy <b>A</b> and galaxy <b>B</b>.</p>",
 "Both show red-shift — the wavelength of the absorption lines has increased — so both galaxies are moving away from us. A shows a greater red-shift than B, so A is travelling faster than B.", ""),
("3","5",4,"calculation",SP,"", "", "<p>The distance between Arcturus and the Earth is 3.6 × 10<sup>14</sup> km.</p><p>speed of light = 3.0 × 10<sup>8</sup> m/s</p><p>Calculate the time taken for light from Arcturus to reach the Earth. Use the Physics Equations Sheet.</p>",
 "1.2 × 10^9 s (1 200 000 000 s) — convert the distance to 3.6 × 10^17 m first", ""),
("3","6",4,"written",SP,"", "", "<p>When stars are formed, they contain mostly hydrogen.</p><p>Describe how stars produce all other naturally occurring elements.</p>",
 "Level-marked out of 4. Fusion occurs at high temperatures and produces new elements. Hydrogen nuclei fuse to form helium nuclei. When hydrogen in the core begins to run out, helium nuclei fuse to make heavier elements, up to iron. Some massive stars become supernovae, creating the elements heavier than iron.", ""),

("4","1",2,"explain",F,"diagram","", "<p>The Mariana Trench is the deepest part of the Pacific Ocean. <b>Figure 8</b> shows a submarine going down to the bottom of it.</p><p>The depth of the submarine increases. Explain what happens to the pressure on the submarine.</p>",
 "The height of the column of water above the submarine increases, which increases the weight of water acting on it, so the pressure increases. (Or: p = ρgh, and ρ and g stay the same, so pressure increases.)",
 "Figure 8 is artwork in the PDF and is not transcribed."),
("4","2",4,"calculation",F,"", "", "<p>The submarine moved from the surface of the water to the bottom of the Mariana Trench. The change in pressure was 110 000 kPa.</p><p>mean density of sea water = 1026 kg/m<sup>3</sup><br>gravitational field strength = 9.8 N/kg</p><p>Calculate the depth of the Mariana Trench. Use the Physics Equations Sheet.</p>",
 "10 940 m (11 000 m is accepted with working) — convert 110 000 kPa to 110 000 000 Pa first", ""),
("4","3",1,"short",WV,"", "", "<p>Earthquakes often occur at the Mariana Trench. P-waves and S-waves are produced by earthquakes.</p><p>Which statement describes P-waves and S-waves? Tick <b>one</b> box.</p><ul><li>Both P-waves and S-waves are longitudinal.</li><li>Both P-waves and S-waves are transverse.</li><li>P-waves are longitudinal and S-waves are transverse.</li><li>P-waves are transverse and S-waves are longitudinal.</li></ul>",
 "P-waves are longitudinal and S-waves are transverse", ""),
("4","4",2,"explain",WV,"diagram", fig9(), "<p><b>Figure 9</b> shows the layers inside the Earth. An earthquake occurs at the position shown.</p><p>Which letter shows the position where <b>only</b> P-waves will be detected? Give a reason for your answer. Tick <b>one</b> box: <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>",
 "D — because only P-waves can travel through liquids, so only they get through the liquid outer core. (S-waves cannot travel through the outer core.)", ""),
("4","5",3,"calculation",WV,"", "", "<p>An S-wave has a frequency of 3.6 Hz. The S-wave has a speed of 4.5 km/s.</p><p>Calculate the wavelength of this S-wave. Use the Physics Equations Sheet.</p>",
 "1250 m (1300 m accepted) — convert 4.5 km/s to 4500 m/s first", ""),
("4","6",2,"explain",F,"", "", "<p>A seismometer is a device that detects earthquakes. P-waves travel at a known speed between an earthquake and a seismometer. S-waves travel at a slower speed than P-waves. A P-wave and an S-wave from the earthquake arrive at the seismometer at different times.</p><p>Describe the relationship between the distance from the earthquake to the seismometer and the time between the P-wave and the S-wave arriving.</p>",
 "The distance is directly proportional to the time between the two waves arriving. (A greater distance means a greater time, or a positive correlation, scores 1 of the 2.)", ""),

("5","1",1,"short",F,"diagram","", "<p>A student investigated how the acceleration of a trolley varies with the resultant force on the trolley. <b>Figure 10</b> shows some of the equipment used: a trolley on a horizontal runway, pulled by a string that runs over a pulley at the end of the bench to a hanging mass. <b>Figure 10</b> shows the force <i>F</i> which acts through the string.</p><p>What name is given to force <i>F</i>?</p>",
 "Tension", "Figure 10 is artwork in the PDF and is not transcribed."),
("5","2",1,"short",F,"", "", "<p>Give <b>one</b> variable that should have been a control variable in this investigation.</p>",
 "The combined mass of the trolley and the mass hanger (the mass or weight of the trolley, or of the hanger, is accepted)", ""),
("5","3",3,"written",F,"", "", "<p>The student held the trolley stationary and then released it. The trolley moved along the runway with a constant acceleration. The student recorded the time taken for the trolley to travel a measured distance along the runway.</p><p>Describe how the acceleration of the trolley can be calculated using the time taken and distance travelled by the trolley.</p>",
 "Divide the distance travelled by the time taken to give the mean velocity. Double the mean velocity to give the maximum velocity. Divide the change in velocity by the time taken to give the acceleration. (Using v² = u² + 2as, or s = ut + ½at², is also accepted.)", ""),
("5","4",2,"calculation",F,"", "", "<p>For one set of results, the force acting through the string was 2.0 N. The student released the trolley three times and determined the following values for acceleration:</p><p>1.36 m/s<sup>2</sup> &nbsp; 1.39 m/s<sup>2</sup> &nbsp; 1.33 m/s<sup>2</sup></p><p>Calculate the uncertainty in the values of acceleration.</p>",
 "± 0.03 m/s² — the range is 0.06 m/s² (the mean is 1.36 m/s²), and the uncertainty is half the range", ""),
("5","5",2,"explain",F,"diagram","", "<p>The runway was then raised at one end. The force acting through the string remained the same. <b>Figure 11</b> shows this.</p><p>Explain how the acceleration was affected by raising the end of the runway.</p>",
 "A component of the weight of the trolley now acts parallel to the runway, so the resultant force increases and the acceleration increases. (Also accepted: work is done raising the trolley so it gains gravitational potential energy, which is transferred to kinetic energy, increasing the final velocity and the acceleration.)",
 "Figure 11 is artwork in the PDF and is not transcribed."),

("6","1",3,"short",EMW,"", "", "<p>Radio waves and gamma rays both transfer energy.</p><p>Give <b>three</b> other similarities between radio waves and gamma rays.</p>",
 "Any three of: they travel at the same speed in a vacuum (the speed of light); they can travel through a vacuum (they need no medium); they are transverse waves; they are electromagnetic waves. Being reflected, refracted, absorbed, transmitted or diffracted is ignored.", ""),
("6","2",1,"short",EMW,"", "", "<p>Both radio waves and gamma rays are used in medicine.</p><p>Give <b>one</b> medical use of gamma rays.</p>",
 "Medical imaging — a PET scan, a tracer or a gamma camera — or a medical treatment such as radiotherapy or a gamma knife. Sterilising medical equipment is also accepted. Ultrasound, CT, X-rays, MRI and chemotherapy are not.", ""),
("6","3",2,"explain",EMW,"", "", "<p>Explain why exposure to gamma rays can be harmful but exposure to radio waves is not harmful.</p>",
 "Gamma rays are ionising and radio waves are not, so gamma rays can cause mutations in genes or DNA — increasing the risk of cancer, or damaging and killing cells", ""),
("6","4",2,"explain",EMW,"", "", "<p>Some medical scanners produce radio waves at a specific frequency.</p><p>Explain how radio waves are produced at a specific frequency.</p>",
 "Radio waves are produced by oscillations in the electrical circuits of the scanner — an alternating current, or oscillating electrons in an aerial — and the radio waves have the same frequency as those oscillations", ""),

("7","1",3,"calculation",F,"graph", fig12(), "<p><b>Figure 12</b> shows a velocity–time graph for a train travelling between two stations.</p><p>Determine the distance travelled by the train in the first 600 s of the journey.</p>",
 "27 440 m — the triangle is ½ × 56 × 220 = 6160 m and the rectangle is 56 × 380 = 21 280 m", ""),
("7","2",3,"explain",F,"graph", fig12(), "<p>Explain what happens to the braking force as the train decelerates. Use information from <b>Figure 12</b>.</p>",
 "The gradient is less after 720 s (after the velocity has fallen to 20 m/s), so the deceleration is smaller, so the braking force is smaller", ""),
("7","3",3,"calculation",F,"graph", fig12(), "<p>Determine the maximum deceleration of the train.</p>",
 "0.3 m/s² — the steepest section is from 600 s to 720 s, where the gradient is −36 ÷ 120", ""),
("7","4",6,"calculation",F,"", "", "<p>Another train travels at a speed of 60 m/s. A constant braking force of 270 000 N causes the train to decelerate and stop.</p><p>mass of train = 240 000 kg</p><p>Calculate the distance travelled while the braking force is applied. Use the Physics Equations Sheet.</p>",
 "1600 m. By forces: a = −270 000 ÷ 240 000 = −1.125 m/s², then 0 = 60² + 2(−1.125)s, so s = 3600 ÷ 2.25. By energy: Ek = ½ × 240 000 × 60² = 432 000 000 J, which equals the work done, so s = 432 000 000 ÷ 270 000. By momentum: p = 14 400 000 kg m/s, t = 53.3 s, mean speed 30 m/s, s = 30 × 53.3.", ""),
("7","5",3,"explain",F,"", "", "<p>It is illegal for train drivers to drink alcohol before driving a train.</p><p>Explain how drinking alcohol would affect the stopping distance of a train.</p>",
 "Stopping distance is braking distance plus thinking distance. Alcohol increases the driver's reaction time, which increases the thinking distance, so the stopping distance increases.", ""),

("8","1",1,"short",EM,"diagram","", "<p><b>Figure 13</b> shows some apparatus used by a teacher in a demonstration: a length of wire held between the poles of two magnets, with its ends connected to an ammeter. The teacher moved the wire upwards between the magnets. The needle on the ammeter deflected to a value of +0.4 mA and then returned to zero.</p><p>What effect did this demonstrate?</p>",
 "The generator effect (electromagnetic induction)", "Figure 13 is artwork in the PDF and is not transcribed."),
("8","2",3,"explain",EM,"diagram","", "<p>Explain why a current was detected when the wire in <b>Figure 13</b> was moved upwards.</p>",
 "The wire cuts through the magnetic field between the magnets, so a potential difference is induced across the wire, and as the wire is part of a complete circuit there is a current in the circuit",
 "Figure 13 is artwork in the PDF and is not transcribed."),
("8","3",1,"short",EM,"diagram","", "<p>The teacher reversed the direction of the magnetic field, replaced the wire in its original position, and moved the wire upwards in the same way as before.</p><p>What was the deflection of the needle on the ammeter? Tick <b>one</b> box.</p><ul><li>The needle will deflect to −0.4 mA.</li><li>The needle will not move.</li><li>The needle will deflect to +0.4 mA.</li></ul>",
 "The needle will deflect to −0.4 mA", ""),
("8","4",3,"explain",EM,"diagram","", "<p><b>Figure 14</b> shows a sound wave incident on the diaphragm of a moving-coil microphone. The inside of the microphone includes a small coil of wire and a magnet.</p><p>Explain why the sound waves have an effect on the electric circuit.</p>",
 "The pressure variations in the sound waves cause the diaphragm to vibrate; the diaphragm causes the coil to vibrate; and as the coil repeatedly changes direction it induces an alternating current in the circuit.",
 "Figure 14 is artwork in the PDF and is not transcribed."),
]

# ---- the paper says what it is out of, and so does every "Total Question n" in the scheme ----
PER_QUESTION = {"1": 13, "2": 14, "3": 16, "4": 14, "5": 9, "6": 8, "7": 18, "8": 8}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the scheme: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())

# ---- and the graph corners are the ones the scheme quotes back, so a typo here fails ----
assert 0.5 * 56 * 220 == 6160 and 56 * (600 - 220) == 21280
assert 0.5 * 56 * 220 + 56 * (600 - 220) == 27440
assert (56 - 20) / (720 - 600) == 0.3
assert 270000 / 240000 == 1.125 and 60 ** 2 / (2 * 1.125) == 1600
assert round(110000000 / (1026 * 9.8)) == 10940
assert round(3.6e17 / 3.0e8) == 1200000000
assert 4500 / 3.6 == 1250 and 2.0 * 0.075 == 0.15 and 35 / 2.8 == 12.5
assert round((1.39 - 1.33) / 2, 3) == 0.03

d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 6

rows = []
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-8463-2406-2H-%02d%s' % (int(q), part), kind='question',
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
