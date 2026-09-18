#!/usr/bin/env python3
"""AQA GCSE Chemistry 8462/2F, June 2024 — 63 question rows into data/questions.json.

WHY THIS IS A SCRIPT AND NOT A HAND EDIT. CLAUDE.md: "Every number in a transcription is checked
against the paper's own stated total ... and the insert script asserts it before writing a row."
The cover says 100 and the margin boxes say 12, 9, 9, 13, 11, 9, 10, 10, 8, 9.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Foundation)_ Paper 2 - June 2024 (1).pdf`, AQA's own
8462/2F scheme — read, not derived.

QUESTIONS 8, 9 AND 10 ARE 1, 2 AND 3 OF 8462/2H, word for word: the tier overlap, the same as on
Paper 1. Both schemes read side by side; transcribed again rather than cross-referenced, for the
reason given in the Paper 1 script — a row belongs to the paper a student is holding.

TWO GRIDS ARE DRAWN AND THAT IS WHERE THE MARKS ARE. Figure 2 carries the bar for hydrogen at 16%
already, which is what fixes the scale for the carbon bar you have to add; Figure 3 is an empty
grid whose two axes are both printed, so only the plotting is left. The rest are described: a
chromatogram, a nitrogen-percentage graph, an apparatus drawing, three sets of displayed formulae
and two photographs.

THE DISPLAYED FORMULAE ARE WRITTEN OUT ALONG A LINE rather than drawn, and the three or four
options of a tick-box question are written out as they differ — where each chlorine sits, what is
above and below each carbon of the repeating unit. A question asking "which of these structures"
is unanswerable without them, and they are text, not a picture.
"""
import json, datetime, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import W, axes

PAPER = 'P-AQA-8462-2406-2F'
DOC = dict(paper_id=PAPER, subject='Chemistry', key_stage='KS4', band_type='stage',
           band_value='GCSE', tier='Foundation', level='GCSE', company='AQA', exam_board='AQA',
           spec_code='8462/2F', exam_wave='First wave', year='2024', month='6', paper='2',
           exam_date='2024-06-11', document_type='Past paper', name='Paper 2 — June 2024',
           active='True', trackable='True', printable='False')

OR = 'Organic Chemistry'; AT = 'Chemistry of the Atmosphere'; AN = 'Chemical Analysis'
RT = 'Rate of Reaction'; UR = 'Using Resources'; QC = 'Quantitative Chemistry'

# ---------------------------------------------------------------------------------------------
# FIGURE 2 — the bar chart 01.9 asks you to finish. Ten large squares across by eleven up, five
# small to a large, the y-axis numbered 0 to 100 in tens, and the hydrogen bar already drawn to 16%
# two squares wide. That bar is the whole point: it is what says one large square is 10%, so the
# carbon bar can be drawn to 84 without the scale being guessed.
# ---------------------------------------------------------------------------------------------
COLS, ROWS, CELL = 10, 11, 27
def fig2():
    L, T = 46, 12
    R, B = L + COLS * CELL, T + ROWS * CELL
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="Bar chart grid with the hydrogen bar '
         'already drawn to 16 per cent">' % (W, B + 34)]
    for i in range(COLS * 5 + 1):
        x = L + i * CELL / 5.0
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>' % (x, T, x, B))
    for i in range(ROWS * 5 + 1):
        y = T + i * CELL / 5.0
        p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"/>' % (L, y, R, y))
    for i in range(COLS + 1):
        x = L + i * CELL
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width=".9" '
                 'opacity=".75"/>' % (x, T, x, B))
    for i in range(ROWS + 1):
        y = T + i * CELL
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width=".9" '
                 'opacity=".75"/>' % (L, y, R, y))
        if (ROWS - i) * 10 <= 100:
            p.append('<text x="%d" y="%.1f" class="num" style="text-anchor:end">%d</text>'
                     % (L - 5, y + 4, (ROWS - i) * 10))
    h = 16 / 10.0 * CELL
    p.append('<rect x="%d" y="%.1f" width="%d" height="%.1f" fill="currentColor" '
             'fill-opacity=".25" stroke="currentColor" stroke-width="1.2"/>'
             % (L + CELL * 6, B - h, CELL * 2, h))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    p.append('<text x="%.1f" y="%d" class="ax" style="text-anchor:middle">Element</text>'
             % ((L + R) / 2, B + 22))
    p.append('<text x="12" y="%d" class="ax" style="text-anchor:middle" transform="rotate(-90 12 '
             '%d)">Percentage (%%) by mass</text>' % ((T + B) / 2, (T + B) / 2))
    return ''.join(p) + '</svg>'

def fig3():
    """The empty grid 02.4 asks you to plot Table 1 on — both axes printed, only the plotting left."""
    return axes(13000, 440, 2000, 100, 'Mass of coal burned per minute in kilograms',
                'Mass of sulfur dioxide produced per minute in kilograms',
                'Empty grid for plotting sulfur dioxide against coal burned',
                xminor=500, yminor=20)

T1 = ('<table><tr><th>Number of furnaces in use</th><th>Mass of coal burned per minute in kg</th>'
      '<th>Mass of sulfur dioxide produced per minute in kg</th>'
      '<th>Mass of carbon dioxide produced per minute in kg</th></tr>'
      '<tr><td>0</td><td>0</td><td>0</td><td>0</td></tr>'
      '<tr><td>1</td><td>3000</td><td>100</td><td>7000</td></tr>'
      '<tr><td>2</td><td>6000</td><td>200</td><td>14 000</td></tr>'
      '<tr><td>3</td><td>9000</td><td>300</td><td>21 000</td></tr>'
      '<tr><td>4</td><td>12 000</td><td>400</td><td>28 000</td></tr></table>')
T2 = ('<table><tr><th>Concentration of sodium thiosulfate solution in g/dm<sup>3</sup></th>'
      '<th>Time for cross to become no longer visible in seconds</th></tr>'
      '<tr><td>8</td><td>120</td></tr><tr><td>16</td><td>60</td></tr>'
      '<tr><td>24</td><td>40</td></tr><tr><td>32</td><td>30</td></tr></table>')
T3 = ('<table><tr><th></th><th>Poly(chloroethene)</th><th>Poly(ethene)</th></tr>'
      '<tr><td>Density in g/cm<sup>3</sup></td><td>1.5</td><td>0.9</td></tr>'
      '<tr><td>Temperature at which polymer completely melts in °C</td><td>260</td><td>120</td>'
      '</tr></table>')
T4 = ('<table><tr><th></th><th>Plain concrete</th><th>Pre-stressed concrete</th></tr>'
      '<tr><td>Cost in £ per m<sup>3</sup></td><td>75</td><td>225</td></tr>'
      '<tr><td>Density in kg per m<sup>3</sup></td><td>2300</td><td>2500</td></tr>'
      '<tr><td>Strength in arbitrary units</td><td>600</td><td>3000</td></tr></table>')
T5 = ('<table><tr><th>Concentration of sodium chloride in g/dm<sup>3</sup></th><th>Trial 1</th>'
      '<th>Trial 2</th><th>Trial 3</th><th>Trial 4</th></tr>'
      '<tr><td></td><td>35.2</td><td>34.6</td><td>36.4</td><td>33.8</td></tr></table>')

FIG4 = ("<p><b>Figure 4</b> shows the finished chromatogram, not drawn to scale: a start line near "
        "the bottom, a line near the top marking the final level reached by the water, and five "
        "lanes labelled <b>A</b>, <b>B</b>, <b>C</b>, <b>D</b> and <b>Y</b>. Lane <b>A</b> has one "
        "spot about half way up. Lane <b>B</b> has one spot lower than that. Lane <b>C</b> has one "
        "spot high up. Lane <b>D</b>'s spot is still sitting on the start line. Lane <b>Y</b> has "
        "<b>two</b> spots: one higher than C's, and one level with A's.</p>")

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",2,"short",OR,"", "", "<p>This question is about hydrocarbons. A hydrocarbon has the formula C<sub>6</sub>H<sub>14</sub>.</p><p>Name the <b>two</b> elements in a hydrocarbon.</p>",
 "Carbon and hydrogen", ""),
("1","2",1,"short",OR,"", "", "<p>How many atoms are there in one molecule of C<sub>6</sub>H<sub>14</sub>? Tick <b>one</b> box.</p><ul><li>2</li><li>6</li><li>14</li><li>20</li></ul>",
 "20 — six carbons plus fourteen hydrogens", ""),
("1","3",1,"short",OR,"", "", "<p>C<sub>6</sub>H<sub>14</sub> is a member of a homologous series.</p><p>What is the general formula for the homologous series that contains C<sub>6</sub>H<sub>14</sub>? Tick <b>one</b> box.</p><ul><li>C<sub>n</sub>H<sub>2n−2</sub></li><li>C<sub>n</sub>H<sub>2n</sub></li><li>C<sub>n</sub>H<sub>2n+2</sub></li></ul>",
 "CₙH₂ₙ₊₂ — with n = 6 that gives 14 hydrogens", ""),
("1","4",1,"short",OR,"", "", "<p>Which homologous series has C<sub>6</sub>H<sub>14</sub> as a member? Tick <b>one</b> box.</p><ul><li>Alcohols</li><li>Alkanes</li><li>Alkenes</li><li>Carboxylic acids</li></ul>",
 "Alkanes", ""),
("1","5",1,"drawing",OR,"diagram","", "<p>Complete <b>Figure 1</b> to show the displayed structural formula of C<sub>6</sub>H<sub>14</sub>. <b>Figure 1</b> gives a chain of six carbon atoms joined by single bonds, with the hydrogens left off.</p>",
 "Add hydrogens so that every carbon has four bonds: three on each end carbon and two on each of the four in the middle — H₃C—CH₂—CH₂—CH₂—CH₂—CH₃.",
 "Figure 1 is artwork in the PDF and the answer is a drawing in the scheme; both are described rather than reproduced."),
("1","6",1,"short",OR,"", "", "<p>Petrol contains C<sub>6</sub>H<sub>14</sub> and is burned in car engines.</p><p>What general name is used to describe petrol when petrol is burned to release energy?</p>",
 "A fuel (a fossil fuel)", ""),
("1","7",2,"short",AT,"", "", "<p>Atmospheric pollutants are formed when C<sub>6</sub>H<sub>14</sub> undergoes incomplete combustion.</p><p>Complete the sentences. Choose answers from the box: <i>ammonia &nbsp; carbon monoxide &nbsp; coal &nbsp; soot &nbsp; sulfur &nbsp; sulfur dioxide</i></p><p>The solid atmospheric pollutant formed during incomplete combustion is ............... .<br>The gaseous atmospheric pollutant formed during incomplete combustion is ............... .</p>",
 "soot; carbon monoxide — in that order", ""),
("1","8",1,"short",OR,"", "", "<p>A different organic compound (C<sub>12</sub>H<sub>26</sub>) can be broken down to produce C<sub>6</sub>H<sub>14</sub> and one other compound.</p><p>Complete the equation for the reaction: C<sub>12</sub>H<sub>26</sub> → C<sub>6</sub>H<sub>14</sub> + C__H__</p>",
 "C₆H₁₂ — the carbons and hydrogens on each side must balance", ""),
("1","9",2,"drawing",QC,"graph", fig2(), "<p>The percentage by mass of each element in C<sub>6</sub>H<sub>14</sub> is 84% C and 16% H.</p><p>Complete <b>Figure 2</b>. You should label each element on the x-axis and plot the percentage by mass of C in C<sub>6</sub>H<sub>14</sub>. The bar for hydrogen has been drawn for you.</p>",
 "Draw the carbon bar to 84% — the hydrogen bar already on the chart is at 16%, so one large square is 10% — and label the two bars C and H. Half a small square of tolerance.", ""),

("2","1",1,"short",AT,"", "", "<p>This question is about burning coal. A power station has four coal-burning furnaces; each furnace burns 3000 kg of coal per minute. <b>Table 1</b> shows some information about this power station.</p>" + T1 + "<p>Carbon dioxide is a greenhouse gas.</p><p>What is the effect on the rate of global climate change of using more furnaces in this power station? Complete the sentence, choosing from: <i>decreases &nbsp; stays the same &nbsp; increases</i>. Use <b>Table 1</b>.</p><p>The rate of global climate change ............... .</p>",
 "increases", ""),
("2","2",2,"calculation",QC,"", "", "<p>7000 kg of carbon dioxide are produced when 3000 kg of coal are burned.</p><p>Calculate the mass of carbon dioxide produced when 1 kilogram of coal is burned.</p>",
 "2.33 kg — 7000 ÷ 3000 = 2.3333…", ""),
("2","3",1,"short",AT,"", "", "<p>Complete the sentence.</p><p>Sulfur dioxide causes an environmental effect called acid ............... .</p>",
 "rain", ""),
("2","4",3,"drawing",AT,"graph", fig3(), "<p><b>Figure 3</b> shows how the mass of sulfur dioxide produced per minute varies with the mass of coal burned per minute — an empty grid with both axes already labelled and scaled.</p><p>Complete <b>Figure 3</b>. You should plot data from <b>Table 1</b> and draw a line of best fit.</p>",
 "Plot the five pairs — (0, 0), (3000, 100), (6000, 200), (9000, 300) and (12 000, 400) — each within half a small square, then draw a straight line of best fit through them. Three or four correct points score 1 of the 2 plotting marks.", ""),
("2","5",1,"short",AT,"graph", fig3(), "<p>Complete the sentence. Use <b>Table 1</b> and <b>Figure 3</b>.</p><p>As the mass of coal burned per minute increases, the mass of sulfur dioxide produced per minute ............... .</p>",
 "increases", ""),
("2","6",1,"short",AT,"", "", "<p>This power station also releases particulates into the air.</p><p>Complete the sentence.</p><p>The release of particulates into the air causes global ............... .</p>",
 "dimming", ""),

("3","1",2,"explain",AN,"", "", "<p>This question is about paper chromatography. A student investigated substance <b>Y</b>. This is the method used.</p><ol><li>Draw a start line in ink on a piece of chromatography paper.</li><li>Put spots of four different dyes, <b>A</b>, <b>B</b>, <b>C</b> and <b>D</b>, and a spot of substance <b>Y</b>, on the start line.</li><li>Dip the paper into water so that the water level is below the start line.</li><li>Wait until the water has risen to near the top of the paper.</li></ol><p>The student's method contains a mistake in Step 1. What is the mistake? Give <b>one</b> reason for your answer.</p>",
 "The start line was drawn in ink. It should be drawn in pencil, because the ink runs, smudges or dissolves in the solvent and would separate too.", ""),
("3","2",1,"short",AN,"diagram","", "<p>A different student used a method which gave valid results.</p>" + FIG4 + "<p>How many different dyes are in substance <b>Y</b>? Use <b>Figure 4</b>.</p>",
 "2 — substance Y separated into two spots",
 "Figure 4 is artwork in the PDF; what it shows is written out in the question."),
("3","3",2,"explain",AN,"diagram","", "<p>Which of the four dyes, <b>A</b>, <b>B</b>, <b>C</b> and <b>D</b>, could be in substance <b>Y</b>? Give <b>one</b> reason for your answer. Use <b>Figure 4</b>.</p>",
 "A — it travelled the same distance as one of the spots from substance Y, so it has the same Rᶠ value. (B, C and D do not line up with either of Y's spots.)",
 "Figure 4 is artwork in the PDF; what it shows is written out at 03.2."),
("3","4",1,"explain",AN,"diagram","", "<p>Suggest why dye <b>D</b> remained on the start line at the end of the investigation. Use <b>Figure 4</b>.</p>",
 "Dye D is insoluble in water — there is no attraction between it and the solvent, so it did not move",
 "Figure 4 is artwork in the PDF; what it shows is written out at 03.2."),
("3","5",2,"calculation",AN,"", "", "<p>The student determined that the distance moved by the water was 6.0 cm and the distance moved by dye <b>A</b> was 2.4 cm.</p><p>Calculate the R<sub>f</sub> value of dye <b>A</b>. Use the equation:</p><p>R<sub>f</sub> = distance moved by dye A ÷ distance moved by water</p>",
 "0.4 — 2.4 ÷ 6.0. It has no units.", ""),
("3","6",1,"short",AN,"", "", "<p>Complete the sentence. Choose the answer from the box: <i>solute &nbsp; solution &nbsp; solvent</i></p><p>The water in step 3 is used as a ............... .</p>",
 "solvent — it is the mobile phase", ""),

("4","1",3,"explain",AT,"graph","", "<p>This question is about the Earth's atmosphere and naturally occurring polymers. <b>Figure 5</b> plots the estimated percentage of nitrogen in the Earth's atmosphere against time since the Earth was formed: it starts near zero, climbs steadily, and from about 2.3 billion years ago runs flat at about 80%.</p><p>Describe the trends shown by the graph. Use data from <b>Figure 5</b>.</p>",
 "The percentage of nitrogen increases, until about 2.3 billion years, and then remains constant — at about 80%. Anything from 2.1 to 2.4 billion years is accepted.",
 "Figure 5 is a graph in the PDF; the values quoted are the mark scheme's own readings."),
("4","2",1,"short",AT,"", "", "<p>The percentage of oxygen in the Earth's atmosphere has increased since the Earth was formed. This is because of photosynthesis:</p><p>carbon dioxide + water → glucose + oxygen</p><p>What happened to the percentage of carbon dioxide in the atmosphere when photosynthesis began? Tick <b>one</b> box.</p><ul><li>The percentage of carbon dioxide decreased.</li><li>The percentage of carbon dioxide stayed the same.</li><li>The percentage of carbon dioxide increased.</li></ul>",
 "The percentage of carbon dioxide decreased", ""),
("4","3",1,"short",AT,"", "", "<p>The photosynthesis reaction takes in energy from the surroundings.</p><p>Complete the sentence. Choose the answer from the box: <i>carbon dioxide &nbsp; light &nbsp; water</i></p><p>The source of the energy used in photosynthesis is ............... .</p>",
 "light", ""),
("4","4",2,"short",AT,"", "", "<p>Which <b>two</b> produce oxygen by photosynthesis? Tick <b>two</b> boxes.</p><ul><li>Algae</li><li>Animals</li><li>Plants</li><li>Viruses</li><li>Yeast</li></ul>",
 "Algae and plants", ""),
("4","5",2,"short",OR,"", "", "<p>The glucose produced during photosynthesis can form naturally occurring polymers.</p><p>Which <b>two</b> are naturally occurring polymers that can be produced from glucose? Tick <b>two</b> boxes.</p><ul><li>Cellulose</li><li>DNA</li><li>Poly(propene)</li><li>Protein</li><li>Starch</li></ul>",
 "Cellulose and starch", ""),
("4","6",1,"short",QC,"", "", "<p>DNA molecules contain two polymer chains. A DNA molecule has a relative formula mass (M<sub>r</sub>) of approximately 140 000 000 000.</p><p>What is the approximate relative formula mass in standard form? Tick <b>one</b> box.</p><ul><li>1.4 × 10<sup>9</sup></li><li>1.4 × 10<sup>10</sup></li><li>1.4 × 10<sup>11</sup></li><li>1.4 × 10<sup>12</sup></li></ul>",
 "1.4 × 10¹¹ — 140 000 000 000 has eleven digits after the leading 1.4", ""),
("4","7",1,"short",OR,"", "", "<p>What is the approximate relative formula mass (M<sub>r</sub>) of <b>each</b> polymer chain in the DNA molecule? Tick <b>one</b> box.</p><ul><li>70 000 000 000</li><li>140 000 000 000</li><li>280 000 000 000</li><li>560 000 000 000</li></ul>",
 "70 000 000 000 — there are two chains, so each is half the total", ""),
("4","8",1,"short",OR,"", "", "<p>Complete the sentence.</p><p>The shape of a DNA molecule is a double ............... .</p>",
 "helix", ""),
("4","9",1,"short",OR,"", "", "<p>How many different nucleotides are present in a molecule of DNA? Tick <b>one</b> box.</p><ul><li>1</li><li>2</li><li>3</li><li>4</li></ul>",
 "4", ""),

("5","1",2,"explain",RT,"diagram","", "<p>A student investigated the rate of the reaction of sodium thiosulfate solution with hydrochloric acid. When they react, the mixture becomes cloudy. <b>Figure 6</b> shows the apparatus: a conical flask standing on a piece of paper with a pencil cross drawn on it, seen from above. This is the method used.</p><ol><li>Put 75 cm<sup>3</sup> of sodium thiosulfate solution in a conical flask.</li><li>Draw a pencil cross on paper.</li><li>Put the conical flask on the pencil cross.</li><li>Add 15 cm<sup>3</sup> of hydrochloric acid to the contents of the conical flask.</li><li>Swirl the conical flask to mix the contents and immediately start a timer.</li><li>Stop the timer when the pencil cross is no longer visible through the reaction mixture.</li><li>Repeat steps 1 to 6 using different concentrations of sodium thiosulfate solution.</li></ol><p>Explain why a 50 cm<sup>3</sup> conical flask is unsuitable to use in this method.</p>",
 "The two volumes add up to 90 cm³, which is more than 50 cm³, so the flask would overflow",
 "Figure 6 is artwork in the PDF; what it shows is stated in the question."),
("5","2",1,"short",RT,"", "", "<p>Name a piece of equipment suitable for measuring the volume of sodium thiosulfate solution.</p>",
 "A measuring cylinder (a pipette or burette is accepted)", ""),
("5","3",2,"short",RT,"", "", "<p>The student measured the time taken for the pencil cross to be no longer visible for different concentrations of sodium thiosulfate solution.</p><p>Draw <b>one</b> line from each type of variable to the variable in this investigation.</p><p>Types: <b>Dependent variable</b>, <b>Independent variable</b>.<br>Variables: concentration of sodium thiosulfate solution; size of conical flask; temperature of sodium thiosulfate solution; time for pencil cross to become no longer visible; volume of hydrochloric acid.</p>",
 "Dependent variable → time for the pencil cross to become no longer visible. Independent variable → concentration of sodium thiosulfate solution. Getting them the wrong way round scores 1 of the 2.", ""),
("5","4",1,"short",RT,"", "", "<p>What effect will using a darker pencil cross have on the time taken for the cross to be no longer visible? Tick <b>one</b> box.</p><ul><li>The time taken will decrease.</li><li>The time taken will be the same.</li><li>The time taken will increase.</li></ul>",
 "The time taken will increase — a darker cross stays visible through more cloudiness", ""),
("5","5",1,"short",RT,"", "", "<p><b>Table 2</b> shows the results.</p>" + T2 + "<p>Which concentration of sodium thiosulfate solution had the highest rate of reaction? Tick <b>one</b> box.</p><ul><li>8 g/dm<sup>3</sup></li><li>16 g/dm<sup>3</sup></li><li>24 g/dm<sup>3</sup></li><li>32 g/dm<sup>3</sup></li></ul>",
 "32 g/dm³ — the shortest time, 30 seconds, is the fastest reaction", ""),
("5","6",2,"short",RT,"", "", "<p>Increasing the concentration of sodium thiosulfate solution changes the rate of the reaction with hydrochloric acid.</p><p>Which <b>two</b> statements explain the effect of increasing the concentration? Tick <b>two</b> boxes.</p><ul><li>The particles are closer together.</li><li>The particles are further apart.</li><li>The particles collide less frequently.</li><li>The particles collide more frequently.</li><li>The particles move faster.</li><li>The particles move slower.</li></ul>",
 "The particles are closer together; the particles collide more frequently", ""),
("5","7",2,"short",RT,"", "", "<p>Complete the sentences. Choose the answers from the box: <i>decreases &nbsp; stays the same &nbsp; increases</i></p><p>If the temperature of the hydrochloric acid is increased, the time taken for the cross to disappear ............... .<br>If the concentration of the hydrochloric acid is decreased, the time taken for the cross to disappear ............... .</p>",
 "decreases; increases — in that order", ""),

("6","1",1,"short",OR,"diagram","", "<p>This question is about addition reactions. <b>Figure 7</b> shows the displayed structural formula of ethene: two carbon atoms joined by a double bond, each carrying two hydrogens.</p><p>Complete the sentence.</p><p>When bromine water is added to ethene, the bromine water changes from orange to ............... .</p>",
 "colourless ('clear' is not accepted)",
 "Figure 7 is artwork in the PDF; what it shows is stated in the question."),
("6","2",1,"short",AN,"", "", "<p>Chlorine reacts with ethene.</p><p>What is used to identify chlorine? Tick <b>one</b> box.</p><ul><li>A lighted splint</li><li>Damp litmus paper</li><li>Limewater</li></ul>",
 "Damp litmus paper — chlorine bleaches it white", ""),
("6","3",1,"short",OR,"diagram","", "<p>Which of the following shows the displayed structural formula of the compound produced when chlorine reacts with ethene? Use <b>Figure 7</b>. All three options are two carbons joined by a single bond, and they differ in where the chlorines sit. Tick <b>one</b> box.</p><ul><li>One Cl on the first carbon and none on the second — H₂ClC—CH₃</li><li>One Cl on each carbon — H₂ClC—CClH₂</li><li>Two Cl on the first carbon and none on the second — HCl₂C—CH₃</li></ul>",
 "One Cl on each carbon — the double bond opens and one chlorine atom adds to each of the two carbons",
 "The three structures are artwork in the PDF; how they differ is written out in the question."),
("6","4",1,"short",OR,"diagram","", "<p>Chloroethene can be used to produce a polymer called poly(chloroethene). The displayed structural formula of chloroethene is two carbons joined by a double bond, one carrying H and H, the other carrying Cl and H.</p><p>Which represents the structure of poly(chloroethene)? Every option is a repeating unit in brackets with an <i>n</i> outside, and they differ in what sits on the two carbons. Tick <b>one</b> box.</p><ul><li>H and H on the first carbon, Cl and H on the second</li><li>Cl and H on the first carbon, Cl and H on the second</li><li>Cl and Cl on the first carbon, Cl and H on the second</li><li>Cl and Cl on both carbons</li></ul>",
 "H and H on the first carbon, Cl and H on the second — the repeating unit has the same atoms as the monomer, with the double bond opened to a single one",
 "The four structures are artwork in the PDF; how they differ is written out in the question."),
("6","5",3,"calculation",QC,"", "", "<p>Ethene can be used to produce another polymer called poly(ethene). <b>Table 3</b> shows information about poly(chloroethene) and poly(ethene).</p>" + T3 + "<p>Determine the simplest whole number ratio of the density of poly(chloroethene) : density of poly(ethene).</p>",
 "5 : 3 — multiply both by 10 to get 15 : 9, then divide both by 3", ""),
("6","6",1,"explain",UR,"", "", "<p>Poly(ethene) and poly(chloroethene) can both be used to make pipes.</p><p>Suggest why neither polymer is suitable for pipes carrying steam at a temperature of 300 °C. Use <b>Table 3</b>.</p>",
 "Both melt below 300 °C — 260 °C and 120 °C — so the pipes would melt", ""),
("6","7",1,"explain",UR,"", "", "<p>Poly(ethene) and paper can both be used to make shopping bags. Poly(ethene) is produced from crude oil. Paper is produced from trees.</p><p>Suggest <b>one</b> reason why paper is more sustainable than poly(ethene) for making shopping bags.</p>",
 "Oil is finite and non-renewable, where trees are a renewable source", ""),

("7","1",2,"short",UR,"diagram","", "<p>This question is about materials. Pre-stressed concrete is a composite material: the concrete is strengthened using high carbon steel bars. <b>Figure 8</b> is a cut-away drawing of a block of pre-stressed concrete with the steel bars running through it.</p><p>Which <b>two</b> words describe the high carbon steel bars? Tick <b>two</b> boxes.</p><ul><li>Alloy</li><li>Binder</li><li>Matrix</li><li>Ore</li><li>Reinforcement</li></ul>",
 "Alloy and reinforcement",
 "Figure 8 is artwork in the PDF; what it shows is stated in the question."),
("7","2",2,"explain",AT,"", "", "<p>Limestone is mainly calcium carbonate and is a raw material used in the production of concrete. In the first part of the production of concrete, air is heated by burning methane, the hot air is used to heat limestone, and the limestone decomposes:</p><p>calcium carbonate → calcium oxide + carbon dioxide</p><p>Give <b>two</b> ways in which a greenhouse gas is released in this process.</p>",
 "Burning the methane releases carbon dioxide; and the decomposition of the limestone releases carbon dioxide", ""),
("7","3",2,"short",AN,"", "", "<p>How could a sample of limestone be tested to show the presence of carbonate ions? Complete the sentences. Choose answers from the box: <i>barium chloride &nbsp; hydrochloric acid &nbsp; limewater &nbsp; sodium hydroxide &nbsp; universal indicator</i></p><p>The substance added to the limestone is ............... .<br>The gas produced is identified using ............... .</p>",
 "hydrochloric acid; limewater — in that order", ""),
("7","4",2,"explain",UR,"", "", "<p><b>Table 4</b> gives some information about plain concrete and pre-stressed concrete.</p>" + T4 + "<p>Explain why pre-stressed concrete rather than plain concrete is used to make bridges that carry heavy lorries. Use <b>Table 4</b>.</p>",
 "Pre-stressed concrete can bear the weight of heavy traffic, because it is much stronger — 3000 arbitrary units against 600 — so the bridge is less likely to collapse. (Not 'because it is more dense'.)", ""),
("7","5",2,"explain",UR,"diagram","", "<p><b>Figure 9</b> is a photograph of a garden path made of plain concrete slabs.</p><p>Suggest <b>two</b> reasons why plain concrete rather than pre-stressed concrete is used to make slabs for garden paths. Use <b>Table 4</b>.</p>",
 "Any two of: plain concrete slabs are cheaper — £75 against £225 per m³; they are lighter to transport and lay — 2300 against 2500 kg per m³; they do not need to carry vehicles, so the extra strength is not needed",
 "Figure 9 is a photograph in the PDF and is not transcribed."),

("8","1",2,"short",AN,"", "", "<p>A student investigated an aqueous solution of a salt. The student identified that the salt solution contained only sodium ions and chloride ions.</p><p>Describe a test to identify sodium ions. Give the result of the test.</p>",
 "Test: a flame test. Result: a yellow flame. (Or: flame emission spectroscopy, and the lines match the sodium spectrum.)", ""),
("8","2",2,"short",AN,"", "", "<p>Describe a test to identify chloride ions. Give the result of the test.</p>",
 "Test: add acidified silver nitrate solution. Result: a white precipitate. The result mark depends on getting the test right.", ""),
("8","3",1,"short",UR,"", "", "<p>The student determined the concentration of sodium chloride in the salt solution. This is the method used.</p><ol><li>Weigh an empty evaporating dish.</li><li>Add 25.0 cm<sup>3</sup> of the salt solution into the evaporating dish.</li><li>Heat the evaporating dish and contents.</li><li>Weigh the evaporating dish and contents.</li><li>Repeat steps 3 to 4 until there is no further change in mass.</li><li>Repeat steps 1 to 5 three more times.</li></ol><p>Why did the student heat the evaporating dish and contents until the mass did not change?</p>",
 "To make sure all the water had evaporated", ""),
("8","4",1,"short",UR,"", "", "<p>How did the student calculate the mass of solid sodium chloride remaining after steps 1 to 5? Tick <b>one</b> box.</p><ul><li>Mass of 25 cm<sup>3</sup> of salt solution + mass of empty evaporating dish</li><li>Mass of 25 cm<sup>3</sup> of salt solution − mass of empty evaporating dish</li><li>Mass of evaporating dish and dry contents + mass of empty evaporating dish</li><li>Mass of evaporating dish and dry contents − mass of empty evaporating dish</li></ul>",
 "Mass of evaporating dish and dry contents − mass of empty evaporating dish", ""),
("8","5",4,"calculation",QC,"", "", "<p>The student calculated the concentration of sodium chloride in the salt solution. <b>Table 5</b> shows the results.</p>" + T5 + "<p>The percentage by mass of sodium ions in sodium chloride is 39.3%.</p><p>Calculate the mean concentration of sodium ions in the salt solution.</p>",
 "13.8 g/dm³. The mean concentration of sodium chloride is (35.2 + 34.6 + 36.4 + 33.8) ÷ 4 = 140 ÷ 4 = 35.0 g/dm³, and 35.0 × 39.3 ÷ 100 = 13.755.", ""),

("9","1",1,"short",UR,"diagram","", "<p>This question is about ammonia and nitric acid. In the Haber process ammonia is produced from nitrogen and hydrogen. <b>Figure 10</b> is a flow diagram of the process: nitrogen and hydrogen enter a reactor, the mixture passes through a condenser where liquid ammonia is drawn off, and a pipe <b>P</b> runs from the condenser back to the reactor.</p><p>Pipe <b>P</b> links the condenser to the reactor. Why is the condenser linked to the reactor? Use <b>Figure 10</b>.</p>",
 "To recycle the unreacted nitrogen and hydrogen back into the reactor",
 "Figure 10 is artwork in the PDF; what it shows is stated in the question."),
("9","2",1,"short",RT,"", "", "<p>Which metal is used as a catalyst in this reaction?</p>",
 "Iron", ""),
("9","3",2,"short",AN,"", "", "<p>Nitric acid is produced by reacting ammonia with oxygen:</p><p>ammonia + oxygen → water + nitric acid</p><p>Platinum is a catalyst in this reaction.</p><p>Describe the test for oxygen gas. Give the result if oxygen gas is present.</p>",
 "Test: put a glowing splint into the gas. Result: the splint relights.", ""),
("9","4",2,"annotate",RT,"graph","", "<p><b>Figure 11</b> represents the reaction profile of the catalysed reaction between ammonia and oxygen: energy up the side, progress of reaction along the bottom, a curve that starts at a dotted reactant level, rises to a peak and falls to a lower product level. Nothing on it is labelled.</p><p>Complete the reaction profile. You should label the activation energy, and label the reactants and products using their names.</p>",
 "Draw a labelled vertical arrow from the dotted reactant line up to the peak — that is the activation energy. Label the left-hand level 'ammonia and oxygen' and the right-hand level 'nitric acid and water'.",
 "Figure 11 is artwork in the PDF; what it shows is stated in the question."),
("9","5",1,"short",RT,"graph","", "<p>How would <b>Figure 11</b> be different if no catalyst was used? Tick <b>one</b> box.</p><ul><li>The final energy level would be higher.</li><li>The final energy level would be lower.</li><li>The line would reach a higher peak.</li><li>The line would reach a lower peak.</li></ul>",
 "The line would reach a higher peak — without a catalyst the activation energy is larger", ""),
("9","6",1,"short",UR,"", "", "<p>Ammonia and nitric acid react to produce the salt, ammonium nitrate.</p><p>Suggest <b>one</b> use of ammonium nitrate.</p>",
 "Fertiliser (explosives and sports injury packs are also accepted)", ""),

("10","1",2,"short",RT,"", "", "<p>This question is about water. Hydrogen gas reacts with oxygen gas to produce water. Water is decomposed into hydrogen gas and oxygen gas using electricity.</p><p>Which <b>two</b> words describe the reaction between hydrogen gas and oxygen gas? Tick <b>two</b> boxes.</p><ul><li>Alloying</li><li>Combustion</li><li>Corrosion</li><li>Endothermic</li><li>Reversible</li></ul>",
 "Combustion and reversible", ""),
("10","2",1,"short",RT,"", "", "<p>Water molecules break down into hydrogen ions and hydroxide ions:</p><p>H<sub>2</sub>O ⇌ H<sup>+</sup> + OH<sup>−</sup></p><p>Which sentence describes this reaction at equilibrium? Tick <b>one</b> box.</p><ul><li>Water molecules break down at a higher rate than they reform.</li><li>Water molecules break down and reform at the same rate.</li><li>Water molecules break down at a lower rate than they reform.</li></ul>",
 "Water molecules break down and reform at the same rate", ""),
("10","3",6,"written",UR,"diagram","", "<p>Water collected from rivers is used in the home for drinking and flushing toilets. Water used in the home must be potable — safe to drink. Waste water produced after use in the home is called sewage. <b>Figure 12</b> is a flow diagram: water is taken from a river and goes through <b>Process A</b> before reaching the home, and the sewage leaving the home goes through <b>Process B</b> before returning to the river.</p><p>Explain what happens to water in <b>Process A</b> and in <b>Process B</b>. Do not refer to use of water in the home.</p>",
 "Level-marked out of 6, and Level 3 needs both halves. Process A — making water potable: pass the water through filter beds to remove solids, then sterilise it with chlorine, ozone or ultraviolet light to destroy microbes. Process B — treating waste water: screening through a metal grid to remove solids and grit, then sedimentation to separate sewage sludge from effluent, then anaerobic digestion of the sludge and aerobic biological treatment of the effluent.",
 "Figure 12 is artwork in the PDF; what it shows is stated in the question."),
]

# ---- the paper says what it is out of, and so does every box down the margin ----
PER_QUESTION = {"1": 12, "2": 9, "3": 9, "4": 13, "5": 11,
                "6": 9, "7": 10, "8": 10, "9": 8, "10": 9}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())

# ---- every number the scheme prints inside its own working, recomputed here ----
assert 6 + 14 == 20 and 2 * 6 + 2 == 14                 # C6H14 is CnH2n+2 with n = 6
assert 12 - 6 == 6 and 26 - 14 == 12                    # 01.8: the other product is C6H12
assert round(7000 / 3000, 2) == 2.33
assert round(2.4 / 6.0, 10) == 0.4        # binary floating point: 2.4/6.0 is 0.39999999999999997
assert (15 // 3, 9 // 3) == (5, 3) and 1.5 * 10 == 15 and 0.9 * 10 == 9
assert 35.2 + 34.6 + 36.4 + 33.8 == 140.0 and round(140.0 / 4 * 39.3 / 100, 3) == 13.755
assert 75 + 15 == 90                                    # 05.1: more than a 50 cm3 flask holds
assert 140_000_000_000 == int(1.4e11) and 140_000_000_000 // 2 == 70_000_000_000
# and the two grids are drawn at the scale their own printed bar or axis fixes
assert 16 / 10.0 * CELL == 16 / 10.0 * 27 and ROWS * 10 == 110
for _, _, _, _, topics, *_ in Q:
    assert ',' not in topics, topics

d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 6

rows = []
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-8462-2406-2F-%02d%s' % (int(q), part), kind='question',
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
