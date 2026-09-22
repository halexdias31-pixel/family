#!/usr/bin/env python3
"""AQA GCSE Combined Science: Trilogy 8464/B/1H, June 2024 — Biology Paper 1H, 27 question rows
and 6 preambles. The document row is already in the file; this adds only what sits under it.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Higher)_ Paper 1 Biology - June 2024.pdf`, which is
AQA's own 8464/B/1H scheme — read, not derived. CLAUDE.md records why that is the rule and not a
preference: four answers on the 2017 Highers were subtly wrong because they were worked out rather
than read. Where the scheme takes a RANGE it is written as a range (02.5 is "0.64 to 0.66"), and
where it lists alternatives they are carried (01.2's five positive colours, 03.3's five routes).

WHAT THE PAPER SAYS IT IS OUT OF. The cover says 70 and the seven boxes down the margin say
13, 9, 12, 10, 9, 11, 6. Both are asserted below, and so is every number the scheme prints inside
its own working: 0.96 ÷ 15.54 × 100 = 6.17760618…, 36 × 1000 = 36 000, 30 × 1.5 = 45, and
36 000 ÷ 45 = 800. The percentages the PAPER prints in Table 1 are recomputed too — every one of
them from the two masses on its own row — because a mistyped table is a wrong question that reads
perfectly. All of it goes through `Fraction`: 16.50 − 15.54 is not 0.96 in binary, and CLAUDE.md
already records two true assertions refused by that.

WHICH SUBJECT THIS IS, READ OFF THE COVER RATHER THAN THE FILENAME. Drive calls it
`Question paper (Higher)_ Paper 1 Biology - June 2024.pdf`; the cover says GCSE COMBINED SCIENCE:
TRILOGY, Higher Tier, Biology Paper 1H, 8464/B/1H, Friday 10 May 2024, 70 marks. That is a
different qualification from the 8461 Biology already in this library — same board, same morning,
different paper — so `subject` is Combined Science and `section` is Biology, which is how the
8464/P rows already in the file are filed.

THE TEXT LAYER WAS CLEAN AND WAS CHECKED ANYWAY. Nothing here is maths set as artwork, so no
digits went missing in the four ways CLAUDE.md lists — but Table 1 and Table 2 are the two places
where a dropped digit would be invisible, so both pages were rendered at scale 4 and read against
the extraction before a row was written. Both match.

ONE FIGURE IS DRAWN, AND IT IS DRAWN BECAUSE IT *IS* THE QUESTION. 02.4 is "complete Figure 2:
plot the percentage change in mass … and draw a line of best fit", so the picture the question
needs is the grid with only the point the paper has already plotted on it — (0.8, −1.3), which is
Table 1's own 0.8 row. With the grid there, `padSource_` lays a pen over it and the question can
be answered on a phone. The grid was measured off the page rather than estimated: the majors were
found by their own regular spacing, giving 0.2 mol/dm³ and 1% per major, a frame running to
1.1 mol/dm³ and from −3% to 5%, and a medium line every five small squares. The medium lines are
what is drawn: the paper's small square is 0.02 and 0.1, which at this width is nineteen hundredths
of a pixel apart and comes out as the grey smear CLAUDE.md records under `axes()`.

FIGURE 4 IS DELIBERATELY NOT DRAWN, AND THAT IS THE ONE DECISION WORTH READING. It is a graticule:
a cell lying over a numbered scale, and the scheme's five marks are 36 (mm) measured off the
printed page, 36 × 1000 = 36 000 µm, 30 divisions × 1.5 µm = 45 µm, the substitution, and 800.
The first of those is a measurement of THE PAPER. Measured off the PDF's own coordinates, the 20
and 50 ticks are 102.1 pt apart, which is 36.0 mm — the scheme's number exactly, so the file is at
true A4 scale and a ruler on the printed page really does give 36. A redrawing lays out at
`min(100%, 20rem)` and is therefore a different length on every screen: a student measuring OUR
picture would get a real number, put it through the scheme's method, and be told they were wrong.
A question that is answerable and wrong is worse than one that says what it needs. So the row says
what the scale shows — 20 to 50, ten small divisions between numbers, 1.5 µm each — and
`examiner_note` carries the 36 mm with the scheme named as its source, which is what this library
already does for the 80 Ω and the 3 cm of air on 8463/1H.

THE OTHER FOUR ARE ARTWORK AND WHAT THEY SHOW IS SAID IN WORDS. The beaker and sealed tube, the
bacteria photograph, the four stages of a dividing cell, and the two alveoli. None is a picture
the row's own words determine, and Figure 3 is a third-party photograph AQA acknowledges in a
separate booklet — so it could not be reproduced here even if it could be drawn. What each shows
is written into the question, because a question about a picture you cannot see is not a question;
what each ANSWER is stays out of it. Figure 6 is described as an outline with ten deep folds
against one with shallow waves, which is what is printed, and not as "a smaller surface area",
which is the first of that question's four marks.

FIGURE 1 IS ON THE PREAMBLE, SO `check-library.js` WILL NOT COUNT IT. That count is over question
rows, and no part of question 2 is about the apparatus — it illustrates the method every part
shares, which is exactly what a preamble is. Said here rather than left to be rediscovered: the
outstanding-figure count this run prints is 4, and the honest number of figures not reproduced is
five.

05.3 IS THE ONE ROW THAT NEEDS THE PRINTED SHEET, and it says so. `needs_print` is what puts
"Printed sheet" on the card, and a question whose first mark is a ruler on the paper is the case
that column is for.
"""
import json, datetime, math, pathlib, sys
from fractions import Fraction
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import W, axes

PAPER = 'P-AQA-8464B-2406-1H'
BASE = dict(subject='Combined Science', key_stage='KS4', band_type='stage', band_value='GCSE',
            tier='Higher', level='GCSE', company='AQA', exam_board='AQA', spec_code='8464/B/1H',
            exam_wave='First wave', year='2024', month='5', paper='1', exam_date='2024-05-10',
            document_type='Past paper', name='Biology Paper 1 — June 2024', active='True',
            paper_id=PAPER, section='Biology')

CB = 'Cell Biology'; OG = 'Organisation'; IR = 'Infection & Response'; BE = 'Bioenergetics'

# ---- TABLE 1, transcribed off the rendered page: (concentration, at start, after 2 hours,
# change, percentage). The percentage the paper prints is recomputed from the two masses below;
# `X` is what 02.3 asks for and is the one the scheme works out.
TABLE1 = [('0.0', '15.54', '16.50', '0.96', None),
          ('0.2', '15.16', '15.78', '0.62', '4.1'),
          ('0.4', '15.00', '15.35', '0.35', '2.3'),
          ('0.6', '15.29', '15.37', '0.08', '0.5'),
          ('0.8', '14.95', '14.75', '-0.20', '-1.3'),
          ('1.0', '14.77', '14.40', '-0.37', '-2.5')]
# Temperature in °C, volume of gas in cm³ in 1 hour.
TABLE2 = [(10, 1), (15, 2), (20, 4), (25, 8), (30, 16), (35, 16), (40, 2), (45, 0)]
# The one point the paper has already plotted on Figure 2, which is Table 1's 0.8 row.
PLOTTED = (0.8, -1.3)

MINUS = lambda s: s.replace('-', '−')


def t1():
    # THE PAPER'S OWN TWO-ROW HEADER. Flattening it into five long headings was the first
    # version and a screenshot is what refused it: "Mass of tube at start in grams" in a narrow
    # column is seven lines of heading over a two-character number.
    head = ('<tr><th rowspan="2">Concentration of salt solution in mol/dm<sup>3</sup></th>'
            '<th colspan="3">Mass of tube in grams</th>'
            '<th rowspan="2">Percentage (%) change in mass</th></tr>'
            '<tr><th>At start</th><th>After 2 hours</th><th>Change</th></tr>')
    body = ''.join('<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>'
                   % (c, s, a, MINUS(ch), '<b>X</b>' if p is None else MINUS(p))
                   for c, s, a, ch, p in TABLE1)
    return '<table>' + head + body + '</table>'


def t2():
    return ('<table><tr><th>Temperature in °C</th>'
            '<th>Volume of gas produced in 1 hour in cm<sup>3</sup></th></tr>'
            + ''.join('<tr><td>%d</td><td>%d</td></tr>' % r for r in TABLE2) + '</table>')


def fig2():
    """The grid 02.4 is answered ON, with the one cross the paper has already drawn and nothing
    else — because plotting the other four and fitting the line is what the three marks are for."""
    def plotted(sx, sy):
        cx, cy = sx(PLOTTED[0]), sy(PLOTTED[1])
        return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                % (cx - 3, cy - 3, cx + 3, cy + 3, cx - 3, cy + 3, cx + 3, cy - 3))
    return axes(1.1, 5, 0.2, 1, 'Concentration of salt solution in mol/dm³',
                'Percentage (%) change in mass',
                'Grid for plotting percentage change in mass against concentration of salt '
                'solution, with the result for 0.8 mol/dm3 already plotted',
                plotted, ymin=-3, xminor=0.1, yminor=0.5)


FIG1 = ('<p><b>Figure 1</b> shows one of the sealed tubes in a salt solution: a beaker holding the '
        'salt solution, with the sealed tube lying in it, tied at both ends. The liquid inside the '
        'tube is labelled solution <b>Z</b> and the wall of the tube is labelled the partially '
        'permeable membrane.</p>')

METHOD2 = ('<p>A student investigated the concentration of salt in solution <b>Z</b>.</p>'
           '<p>The student used a method involving osmosis. The student used tubing made of '
           'partially permeable membrane.</p><p>This is the method used.</p>'
           '<ol><li>Cut six pieces of tubing to the same length.</li>'
           '<li>Tie one end of each piece of tubing.</li>'
           '<li>Put the same volume of solution <b>Z</b> into each piece of tubing.</li>'
           '<li>Tie the other end of each piece of tubing to form a sealed tube.</li>'
           '<li>Record the mass of each tube.</li>'
           '<li>Place each tube into a different concentration of salt solution.</li>'
           '<li>After 2 hours, remove each tube from the salt solutions.</li>'
           '<li>Record the mass of each tube.</li></ol>')

PHOTO4 = ('<p>A student investigated the relationship between temperature and the rate of '
          'photosynthesis. The student measured the volume of gas produced by an aquatic plant in '
          '1 hour. The student collected the gas in a measuring cylinder.</p>'
          '<p><b>Table 2</b> shows the results.</p>' + t2())

# (question, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",2,"short",OG,"","", "<p>Glucose and fructose are different sugars. Fructose has a much sweeter taste than glucose.</p><p>Suggest <b>two</b> reasons why the drinks company uses fructose in the drink rather than using glucose.</p><p>Do not refer to sweetness in your answer.</p>",
 "Any two from: less fructose or sugar is needed; it is cheaper to produce or to buy the drink — less sugar tax, or more profit (cheaper on its own is ignored); there is less energy in the drink, so people are more likely to buy it (fewer calories or joules is accepted). “Less sugar is needed so it would be cheaper” scores both marks on its own. “Fructose is sweeter than glucose” is ignored.", ""),
("1","2",3,"short",OG,"","", "<p>Describe how a student could test the drink for sugar.</p><p>Give the colour of a positive result.</p>",
 "Add Benedict’s reagent or solution (1); heat the reagent or solution (1) — any appropriate method of heating, and if a temperature is given it must be at least 60 °C; “warm” is ignored. Positive result: green, yellow, orange, brown or brick red (1). The starting colour is ignored.", ""),
("1","3",2,"short",OG,"","", "<p>Describe how a student could test the drink for protein.</p><p>Give the colour of a positive result.</p>",
 "Add Biuret reagent or solution (1) — adding Biuret A and Biuret B is accepted, and so is adding potassium or sodium hydroxide solution and copper sulfate solution. Positive result: mauve, purple, lilac or pink-purple (1). The starting colour is ignored.", ""),
("1","4",6,"written",OG,"","", "<p>The human digestive system breaks down protein and fat in the drink.</p><p>Describe how protein and fat are digested.</p><p>You should include:</p><ul><li>the enzymes involved</li><li>where the enzymes are produced.</li></ul>",
 "Level-marked out of 6. Level 2 (4–6) needs the digestion of BOTH fat and protein, each linked to the right type of enzyme. Protein: protease breaks protein down into amino acids; protease is produced in the stomach, in the pancreas and in the small intestine; hydrochloric acid provides the correct pH for protease in the stomach. Fat: lipase breaks fat down into fatty acids and glycerol; lipase is produced by the pancreas and by the small intestine; bile is produced by the liver, released from the gall bladder, emulsifies the fat to give a larger surface area for lipase, and neutralises the acid to provide the correct pH for the enzymes.", ""),

("2","1",1,"short",CB,"","", "<p>What was the independent variable for the investigation?</p><p>Tick <b>one</b> box.</p><ul><li>Change in mass of tube</li><li>Concentration of salt solution</li><li>Time in salt solution</li><li>Volume of solution <b>Z</b></li></ul>",
 "Concentration of salt solution", ""),
("2","2",1,"explain",CB,"","", "<p>The student dried the outside of each tube with a paper towel before recording the mass.</p><p>Why was it important to dry the tubes?</p>",
 "Water or solution left on the tubing would affect — increase — the mass. “The results would not be valid” is also accepted.", ""),
("2","3",3,"calculation",CB,"","", "<p><b>Table 1</b> shows the results.</p>" + t1() + "<p>Calculate value <b>X</b> in <b>Table 1</b>.</p><p>Give your answer to 1 decimal place.</p>",
 "6.2%. 0.96 ÷ 15.54 × 100 (1) = 6.17(760618…) (1) = 6.2 to 1 decimal place (1). The answer may be written into Table 1, and a correct conversion to 1 dp of the student’s own incorrect percentage is allowed.", ""),
("2","4",3,"drawing",CB,"graph", fig2(), "<p><b>Table 1</b> shows the results.</p>" + t1() + "<p>Complete <b>Figure 2</b>.</p><p>You should:</p><ul><li>plot the percentage change in mass from <b>Table 1</b> for salt concentrations of only 0.2 mol/dm<sup>3</sup> to 1.0 mol/dm<sup>3</sup></li><li>draw a line of best fit.</li></ul><p>One of the results has been plotted for you.</p>",
 "Plot all four remaining points — (0.2, 4.1), (0.4, 2.3), (0.6, 0.5) and (1.0, −2.5) — within half a small square (2 marks; three correct points scores 1). Then draw a line of best fit (1). The point for 0.8 mol/dm³ is already plotted at −1.3. An attempt to plot 0 mol/dm³ is ignored, and so is extrapolation.", ""),
("2","5",1,"short",CB,"graph", fig2(), "<p>Determine the concentration of salt in solution <b>Z</b>.</p><p>Use <b>Figure 2</b>.</p>",
 "Read off where your own line of best fit crosses 0% change in mass — at that concentration the tube neither gained nor lost mass, so the salt solution outside matches solution Z. Half a small square of tolerance is allowed. If no line of best fit is drawn, an answer in the range 0.64 to 0.66 mol/dm³ scores the mark.", ""),

("3","1",1,"short",IR,"","", "<p>What type of microorganism causes measles?</p>",
 "A virus", ""),
("3","2",2,"short",IR,"","", "<p>Vaccinations help reduce the spread of measles.</p><p>Suggest <b>two</b> ways the spread of measles can be reduced.</p><p>Do not refer to vaccination in your answer.</p>",
 "Any two from: isolation of people with measles; covering your nose and mouth when you cough or sneeze (wearing face coverings is accepted); frequent handwashing or sanitiser (frequent cleaning of surfaces is accepted). Unqualified “PPE”, “public health education programmes” and “social distancing” are ignored.", ""),
("3","3",4,"explain",IR,"","", "<p>Describe how the measles vaccine helps a person to become immune to the measles pathogen.</p>",
 "Any four from: the vaccine or injection contains a dead or inactive measles pathogen (weakened or attenuated is accepted, and so is “contains measles antigens”); white blood cells produce antibodies (lymphocytes or leucocytes are accepted, phagocytes are not); the antibodies produced are specific to the measles pathogen; memory cells are made; on secondary exposure antibodies are produced faster, or in larger quantities. If nothing else scores, “antibodies are produced” is worth 1. Herd immunity and antitoxins are ignored.", ""),
("3","4",2,"explain",IR,"","", "<p>Norovirus is a type of virus.</p><p>Explain how viruses cause illness.</p>",
 "Viruses enter cells (1) — “live or reproduce inside cells” and “inject genetic material into cells” are both accepted — so the cells are damaged or killed (1), or burst open.", ""),
("3","5",3,"short",IR,"","", "<p>Drugs can help to reduce the symptoms of the norovirus infection.</p><p>New drugs must go through clinical trials before being licensed for use.</p><p>Give <b>three</b> reasons why clinical trials are needed.</p>",
 "To check the drug is not toxic or poisonous — that it is not harmful, or to check for side effects (1); to check efficacy — to see whether the drug works, or whether it treats the disease (1); to determine the dosage — how much is needed (1). “To check the interaction with other drugs” is accepted for the third mark; “dangerous” on its own is ignored.", ""),

("4","1",1,"short",BE,"","", "<p>What is the symbol equation for photosynthesis?</p><p>Tick <b>one</b> box.</p><ul><li>6 CO<sub>2</sub> + C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> &rarr; 6 H<sub>2</sub>O + 6 O<sub>2</sub></li><li>C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub> &rarr; 6 CO<sub>2</sub> + 6 H<sub>2</sub>O</li><li>6 CO<sub>2</sub> + 6 H<sub>2</sub>O &rarr; C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub></li><li>6 O<sub>2</sub> + 6 H<sub>2</sub>O &rarr; 6 CO<sub>2</sub> + C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></li></ul>",
 "6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂", ""),
("4","2",3,"explain",BE,"","", PHOTO4 + "<p>Describe the effect of increasing temperature on the rate of photosynthesis.</p><p>Use data from <b>Table 2</b>.</p>",
 "As the temperature increases the rate of photosynthesis increases and then decreases (1); the fastest rate is between 30 °C and 35 °C — an optimum between those two temperatures (1); up to 30 °C the rate doubles for every 5 °C increase — 1, 2, 4, 8, 16 cm³ (1). “Increases at an increasing rate” and “increases exponentially” are accepted for the third mark. References to volume on its own are ignored.", ""),
("4","3",2,"explain",BE + ', ' + OG,"","", PHOTO4 + "<p>Explain why no gas was produced by the plant at 45 °C.</p>",
 "The enzymes in the plant or chloroplast are destroyed — denatured (1) — because the active site changes shape (1). Two other routes score the same two marks: “the active site changes shape, so the substrate no longer fits”, and “the enzymes are denatured, so the substrate no longer fits”. “The enzymes are killed” and “the cells or plants are denatured” are not accepted; “the plant is dead” is ignored.", ""),
("4","4",1,"short",BE,"","", "<p>How could the student increase the accuracy of the results?</p><p>Tick <b>one</b> box.</p><ul><li>Repeat the investigation, collecting the gas for 24 hours.</li><li>Repeat the investigation, measuring the volume of gas to 0.5 cm<sup>3</sup>.</li><li>Repeat the investigation using a different aquatic plant.</li><li>Repeat the investigation, using temperatures of 5 °C and 50 °C.</li></ul>",
 "Repeat the investigation, measuring the volume of gas to 0.5 cm³", ""),
("4","5",2,"short",BE,"","", "<p>A person grows tomatoes in a greenhouse.</p><p>The mean temperature of the greenhouse is 15 °C. A heater would keep the temperature of the greenhouse at 25 °C.</p><p>Suggest <b>two</b> reasons against using a heater set at 25 °C in the greenhouse.</p><p>Do not refer to cost in your answer.</p>",
 "Any two from: there may be too many tomatoes to eat or sell (a glut, or all ripening at once); another factor could limit photosynthesis instead; the optimum temperature might be above or below 25 °C; greenhouses are poorly insulated; pollution from the heater (increased carbon dioxide emissions or global warming); an increased rate of transpiration, so more water lost from the plants; an increased spread of plant disease. If nothing else scores, “it is a fire hazard” is worth 1.", ""),
("4","6",1,"short",CB,"","", "<p>The person cut a stem from one of the tomato plants. The cut stem was placed in soil to grow new roots.</p><p>Which tissue in the cut stem will differentiate into new root cells?</p><p>Tick <b>one</b> box.</p><ul><li>Epidermis</li><li>Meristem</li><li>Mesophyll</li><li>Phloem</li></ul>",
 "Meristem", ""),

("5","1",1,"short",CB,"photograph","", "<p><b>Figure 3</b> shows bacteria viewed using a microscope. It is a grey, black-and-white image in which several hundred rod-shaped bacteria lie across a fine mesh of fibres. Each rod is separately visible, with its rounded ends and the texture of its own surface showing, and the rods appear to stand out from the surface below them.</p><p>What type of microscope was used to view the bacteria in <b>Figure 3</b>?</p><p>Give a reason for your answer.</p>",
 "An electron microscope, because it has a high resolution or a high magnification. Both halves are needed for the single mark.",
 "Figure 3 is a third-party photograph — AQA publishes its acknowledgements in a separate booklet — so it cannot be reproduced here; what it shows is described in the question."),
("5","2",3,"short",CB,"","", "<p>Bacterial cells are prokaryotic cells.</p><p>Give <b>three</b> ways that a prokaryotic cell is different from a eukaryotic cell.</p>",
 "Any three from: it does not have a nucleus — its DNA or genetic material is free in the cytoplasm; it does not have mitochondria; it has a single loop or strand of DNA; it has plasmids (small rings of DNA); it is smaller (bacteria have smaller ribosomes is accepted). The converse for a eukaryotic cell scores if it is clearly stated. If nothing else scores, “a prokaryotic cell has no membrane-bound organelles” is worth 1. “Genetic information” is ignored.", ""),
("5","3",5,"calculation",CB,"diagram","", "<p><b>Figure 4</b> shows a special slide used to determine the size of a cell viewed using a microscope.</p><p><b>Figure 4</b> is the circular field of view of the microscope. One cell — a rounded head with a long thin tail — lies across the top of it. Below the cell runs the scale on the slide, numbered 20, 30, 40 and 50, with ten small divisions between one number and the next. A dashed line dropped from each end of the cell meets the scale at 20 and at 50. Printed beside the field of view is: ‘Each small division on the scale is 1.5 µm’.</p><p>Calculate the magnification of the cell shown in <b>Figure 4</b>.</p>",
 "× 800. Measure the cell on the printed page: 36 mm (anything from 35 to 37 mm, or 3.5 to 3.7 cm, is accepted) (1). Convert: 36 × 1000 = 36 000 µm (1). Real size: the cell covers 30 divisions, so 30 × 1.5 = 45 µm (1). Substitute: magnification = 36 000 ÷ 45 (1). Answer 800, with no unit (1). If nothing else scores, writing magnification = image size ÷ real size, or a correct rearrangement, is worth 1.",
 "Figure 4 is artwork in the PDF and is deliberately NOT redrawn: the scheme’s first mark is the cell measured with a ruler on the printed page, which comes to 36 mm at true A4 scale (measured off the PDF’s own coordinates: the 20 and 50 ticks are 102.1 pt apart). A drawing here lays out at whatever width the screen gives it, so measuring it would produce a real number and a wrong answer. The 36 mm above is the scheme’s own figure."),

("6","1",4,"explain",CB,"diagram","", "<p><b>Figure 5</b> shows a lung cell dividing. It is four drawings in a row, joined by arrows. In the first, the cell holds a tangle of long thin threads. In the second, the threads have become separate short structures, each one doubled along its length. In the third, they have been gathered into two groups, one at each end of the cell. In the fourth, the cell has become two cells side by side, each holding a rounded body with a tangle of threads inside it.</p><p>Describe the process of the cell cycle shown in <b>Figure 5</b>.</p>",
 "The DNA replicates, so two copies of each chromosome form (1); one set of chromosomes is pulled to each end of the cell (1); the nucleus divides — two new nuclei form (1); the cytoplasm or cell membrane divides and two genetically identical cells form (1). A maximum of 3 marks if the stages are given out of order, and 1 mark for “mitosis” if nothing else scores. “DNA reproduces” is not accepted; the names of the phases of mitosis are ignored.",
 "Figure 5 is artwork in the PDF and is not transcribed; what the four drawings show is described in the question."),
("6","2",3,"explain",OG,"","", "<p>Lung cancer is malignant.</p><p>Explain what is meant by a malignant tumour.</p>",
 "Uncontrolled cell division or growth (1); it invades neighbouring tissues (1); tumour cells spread to different parts of the body, or to other tissues, in the blood or lymph (1) — “the tumour metastasises” is accepted for the third mark.", ""),
("6","3",4,"explain",OG + ', ' + BE,"diagram","", "<p>Smoking can damage the lungs in different ways.</p><p><b>Figure 6</b> shows alveoli from the lungs of two people. <b>Person A</b>, who does <b>not</b> smoke, has an alveolus drawn as an outline with about ten deep, narrow folds running all the way round it, like the petals of a flower. <b>Person B</b>, who does smoke, has an alveolus of the same overall width drawn with only shallow, rounded waves round its edge.</p><p>Person A and person B do the same exercise.</p><p>Explain why person B breathes much faster than person A during the exercise.</p>",
 "Person B needs to breathe faster or deeper to get more oxygen (1); because there is a smaller surface area (1); so less oxygen enters the blood — less oxygenation of haemoglobin (1); so there is less oxygen for respiration (1). The converse, clearly stated for person A, scores. “Less energy produced, made or created” is not accepted; “so anaerobic respiration increases”, “so lactic acid is produced” and “so an oxygen debt is created” are accepted for the fourth mark.",
 "Figure 6 is artwork in the PDF and is not transcribed; the shape of each alveolus is described in the question."),

("7","",6,"written",OG + ', ' + BE,"","", "<p>Angina is a condition many people get as coronary heart disease (CHD) develops.</p><p>Angina can cause chest pain and tiredness.</p><p>People with angina are sometimes treated with a drug called GTN. GTN widens the coronary arteries.</p><p>Explain:</p><ul><li>the causes and symptoms of angina</li><li>how GTN reduces the symptoms of angina.</li></ul>",
 "Level-marked out of 6. Level 3 (5–6) needs all three of the causes of angina, an explanation of its symptoms, and the treatment with GTN; Level 1 needs the symptoms or the treatment. Causes of angina and CHD: high cholesterol or fat in the blood or diet, obesity; a lack of exercise; smoking or alcohol; increasing age; a family history of atherosclerosis or heart problems. Symptoms: fatty deposits form in the coronary arteries, which narrow, so less blood — and so less oxygen and glucose — reaches the heart muscle and the body; less oxygen and glucose for respiration, so less energy is released, more anaerobic respiration, lactic acid formed, muscle fatigue. GTN: more blood reaches the heart muscle, so more oxygen and glucose reach it, so aerobic respiration increases.", ""),
]

# (question, html, figure) — a paragraph several parts hang from. Question-scoped, so `preamble_`
# draws it above every part of that question and above nothing else.
S = [
("1", "<p>Drinks contain different substances.</p><p>A drinks company claims that a drink contains sugar, protein and fat.</p>", ""),
("2", METHOD2 + FIG1, "diagram"),
("3", "<p>This question is about communicable diseases.</p><p>Measles is a communicable disease caused by a pathogen.</p>", ""),
("4", "<p>This question is about photosynthesis.</p>", ""),
("5", "<p>This question is about microscopy.</p>", ""),
("6", "<p>Smoking increases the risk of lung cancer.</p>", ""),
]

# ---- the paper says what it is out of, and so does every box down the margin ----
PER_QUESTION = {"1": 13, "2": 9, "3": 12, "4": 10, "5": 9, "6": 11, "7": 6}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 70, 'the paper is out of 70 and these sum to %d' % sum(got.values())

# ---- every number the scheme prints inside its own working, recomputed here ----------------------
# FRACTION, NOT FLOAT. 16.50 - 15.54 is 0.96000000000000085 in binary, and this library has already
# had two TRUE assertions refused by that — see the Chemistry 8462/2F R_f value and the 9.8 weight.
def to1dp(f):
    """Half-up, away from zero, on an exact Fraction — which is how a mark scheme rounds and is not
    what Python's round() does to a tie."""
    s = -1 if f < 0 else 1
    return s * math.floor(abs(f) * 10 + Fraction(1, 2)) / 10

for conc, start, after, change, pct in TABLE1:
    assert Fraction(after) - Fraction(start) == Fraction(change), \
        'Table 1 row %s: %s - %s is not %s' % (conc, after, start, change)
    share = Fraction(change) / Fraction(start) * 100
    if pct is None:                                   # value X, which 02.3 asks for
        assert share == Fraction(1600, 259), share
        assert round(float(share), 8) == 6.17760618, float(share)   # the scheme's own digits
        assert to1dp(share) == 6.2, to1dp(share)                    # and its answer
    else:
        assert to1dp(share) == float(pct), \
            'Table 1 row %s: %s%% recomputes as %s' % (conc, pct, to1dp(share))

# THE POINT THE PAPER HAS ALREADY PLOTTED IS TABLE 1'S OWN 0.8 ROW, and Figure 2 is drawn with it.
assert ('%.1f' % PLOTTED[0], '%.1f' % PLOTTED[1]) in [(c, p) for c, s, a, ch, p in TABLE1 if p]

# 04.2's third mark: "up to 30 °C the rate doubles every 5 °C increase".
rising = [v for t, v in TABLE2 if t <= 30]
assert rising == [1, 2, 4, 8, 16] and all(b == 2 * a for a, b in zip(rising, rising[1:]))
assert [v for t, v in TABLE2 if t > 30] == [16, 2, 0]

# 05.3, all five of the scheme's steps.
assert 36 * 1000 == 36000
assert Fraction('1.5') * 30 == 45
assert 36000 / 45 == 800

# ---- a comma in a topic name is a second topic, and every topic must join the tree ---------------
TREE = json.loads((pathlib.Path(__file__).parent.parent / 'data' / 'topics.json').read_text())
KNOWN = set()
for t in TREE:
    for v in [t.get('label'), t.get('topic_id')] + str(t.get('aliases') or '').split(','):
        if v and str(v).strip():
            KNOWN.add(str(v).strip().lower())
for q, part, marks, atype, topics, *_ in Q:
    for name in topics.split(','):
        name = name.strip()
        assert name, 'an empty topic in %r' % topics
        assert '&amp;' not in name, 'a topic carries an HTML entity: %r' % name
        assert name.lower() in KNOWN, 'topic %r is in no data/topics.json label, id or alias' % name

d = datetime.date.fromisoformat(BASE['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 5    # Friday 10 May 2024, off the cover

rows = []
for q, html, figure in S:
    r = dict(BASE)
    r.update(row_id='S-AQA-8464B-2406-1H-%02d' % int(q), kind='preamble', question=q,
             html=html, figure=figure)
    rows.append(r)
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(BASE)
    r.update(row_id='Q-AQA-8464B-2406-1H-%02d%s' % (int(q), part), kind='question',
             question=q, part=part, marks=str(marks), html=html, answer=answer,
             answer_type=atype, topics=topics, figure=figure, diagram=diagram,
             diagram_by=('family' if diagram else ''), placeholder='')
    if note:
        r['examiner_note'] = note
    if q == '5' and part == '3':
        # THE ONE ROW THAT NEEDS THE PAPER ITSELF: the first of its five marks is a ruler on the
        # printed page. See the header for why Figure 4 is not redrawn.
        r['needs_print'] = 'True'
    rows.append(r)

p = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/home/user/family/data/questions.json')
lines = p.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
seen = {json.loads(l.rstrip(','))['row_id'] for l in lines if '"row_id"' in l}
clash = seen & {r['row_id'] for r in rows}
assert not clash, 'row ids already in the file: %r' % sorted(clash)
assert PAPER in {json.loads(l.rstrip(','))['paper_id'] for l in lines
                 if '"kind": "document"' in l}, 'the document row for %s is not in the file' % PAPER

lines[-2] += ','
for r in rows[:-1]:
    lines.insert(-1, json.dumps(r) + ',')
lines.insert(-1, json.dumps(rows[-1]))
p.write_text('\n'.join(lines) + '\n')

# THE NUMBER PRINTED IS THE ONE check-library.js WILL COUNT — question rows carrying a `figure`
# that is not an answer-space label and have no drawing. Figure 1 sits on a preamble and is in
# neither number; the header says so rather than leaving it to be rediscovered.
ANSWER_SPACE = ('grid-blank', 'fractions', 'boxes', 'long-method', 'lines', 'working',
                'answer-space', 'table-blank')
missing = [x for x in Q if x[5] and x[5] not in ANSWER_SPACE and not x[6]]
print('%s: %d question rows, %d preambles, %d marks, %d rows written.'
      % (PAPER, len(Q), len(S), sum(got.values()), len(rows)))
print('   %d question(s) lack the picture they are about (%s); Figure 1 is on a preamble and is '
      'counted by neither.' % (len(missing), ', '.join('%s.%s' % (x[0], x[1]) for x in missing)))
