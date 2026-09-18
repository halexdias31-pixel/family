#!/usr/bin/env python3
"""AQA GCSE Chemistry 8462/1F, June 2024 — 58 question rows into data/questions.json.

WHY THIS IS A SCRIPT AND NOT A HAND EDIT. CLAUDE.md: "Every number in a transcription is checked
against the paper's own stated total ... and the insert script asserts it before writing a row."
The cover says 100 and the margin boxes say 9, 10, 14, 10, 10, 10, 8, 10, 11, 8.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Foundation)_ Paper 1 - June 2024 (1).pdf`, AQA's own
8462/1F scheme — read, not derived.

THREE OF ITS TEN QUESTIONS ARE ALSO ON THE HIGHER PAPER, WORD FOR WORD. 08, 09 and 10 here are 01,
02 and 03 of 8462/1H, which is the overlap AQA prints on both tiers — and the two mark schemes give
the same answers, checked side by side rather than assumed. They are transcribed again rather than
cross-referenced, because a row belongs to the paper a student is holding: somebody working through
the Foundation paper should not be sent to the Higher one for question 8. The duplicate-document
rule in `check-library.js` is about two PAPER ids pointing at one PDF and is untouched by this —
these are two different papers that happen to share questions.

FIGURE 15 IS DRAWN AND IT IS THE SAME EMPTY GRID AS THE HIGHER PAPER'S FIGURE 1, from the same
`axes()` call with the same arguments, because it IS the same printed grid. The rest are described:
atom diagrams, separating apparatus, titration glassware, a burette scale, two results graphs, a
wound dressing, a cube, three carbon structures, a reactivity series and a chemical cell.
"""
import json, datetime, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import W, axes

PAPER = 'P-AQA-8462-2406-1F'
DOC = dict(paper_id=PAPER, subject='Chemistry', key_stage='KS4', band_type='stage',
           band_value='GCSE', tier='Foundation', level='GCSE', company='AQA', exam_board='AQA',
           spec_code='8462/1F', exam_wave='First wave', year='2024', month='5', paper='1',
           exam_date='2024-05-17', document_type='Past paper', name='Paper 1 — June 2024',
           active='True', trackable='True', printable='False')

AS = 'Atomic Structure & the Periodic Table'
BN = 'Bonding & Structure'
QC = 'Quantitative Chemistry'
CC = 'Chemical Changes'
EC = 'Energy Changes'

TABLE4 = [('Helium', 2, '0.2'), ('Neon', 10, '0.8'), ('Argon', 18, '1.6'),
          ('Krypton', 36, 'X'), ('Xenon', 54, '5.4'), ('Radon', 86, '9.1')]

def fig15():
    """The empty grid 09.4 asks you to plot on — the same one printed as Figure 1 on the Higher
    paper, so it is the same `axes()` call with the same arguments and cannot drift from it."""
    return axes(110, 11, 20, 2, 'Atomic number', 'Density in mg/cm³',
                'Empty grid for plotting density against atomic number',
                xminor=5, yminor=1)

T4 = ('<table><tr><th>Element</th><th>Atomic number</th><th>Density in mg/cm<sup>3</sup></th></tr>'
      + ''.join('<tr><td>%s</td><td>%d</td><td>%s</td></tr>' % r for r in TABLE4) + '</table>')
T1 = ('<table><tr><th></th><th>Trial 1</th><th>Trial 2</th><th>Trial 3</th></tr>'
      '<tr><td>Volume of acid added in cm<sup>3</sup></td><td>25.3</td><td>23.7</td><td>23.6</td>'
      '</tr></table>')
T2 = ('<table><tr><th>Substance</th><th>Property</th></tr><tr><td>Carbon</td><td>Strong</td></tr>'
      '<tr><td>Silicon dioxide</td><td>Hard</td></tr><tr><td>Silver</td><td>Kills bacteria</td></tr>'
      '<tr><td>Titanium dioxide</td><td>Blocks light</td></tr></table>')
T3 = ('<table><tr><th>Molten compound</th><th>Product at negative electrode</th>'
      '<th>Product at positive electrode</th></tr>'
      '<tr><td>Lead chloride</td><td>&nbsp;</td><td>Chlorine</td></tr>'
      '<tr><td>Potassium iodide</td><td>Potassium</td><td>&nbsp;</td></tr>'
      '<tr><td>&nbsp;</td><td>Zinc</td><td>Bromine</td></tr></table>')

FIG1 = ("<p><b>Figure 1</b> shows four boxes, <b>A</b> to <b>D</b>, in which grey, black and white "
        "circles represent three different types of atom.</p><ul>"
        "<li><b>A</b> — four three-atom molecules, of two different kinds: two are white–black–white "
        "and two are grey–white–grey.</li>"
        "<li><b>B</b> — two single black atoms and two white–white pairs, loose in the box.</li>"
        "<li><b>C</b> — two grey–white–grey three-atom molecules and two white–white pairs.</li>"
        "<li><b>D</b> — four molecules, every one of them white–black–white.</li></ul>")
FIG3 = ("<p><b>Figure 3</b> shows four sets of apparatus for separating mixtures.</p><ul>"
        "<li><b>A</b> — a cone of filter paper in a funnel over a conical flask, with the mixture "
        "poured into the cone.</li>"
        "<li><b>B</b> — a round-bottomed flask of the mixture over a heat source, with a "
        "thermometer in its neck and a condenser leading down to a conical flask.</li>"
        "<li><b>C</b> — a strip of paper hanging in a beaker of solvent with a spot of the mixture "
        "on it.</li>"
        "<li><b>D</b> — an evaporating basin of the mixture on a tripod over a heat source.</li>"
        "</ul>")
FIG13 = ("<p><b>Figure 13</b> shows part of the reactivity series with the non-metal carbon "
         "included, most reactive first: <b>potassium, lithium, carbon, zinc, tin, gold</b>.</p>")
METHOD8 = ("<p>A student produced a salt by reacting copper carbonate with sulfuric acid. This is "
           "the method used.</p><ol><li>Measure 50 cm<sup>3</sup> of sulfuric acid into a beaker."
           "</li><li>Add copper carbonate powder.</li><li>Stir the mixture.</li><li>Repeat steps 2 "
           "and 3 until copper carbonate is in excess.</li><li>Filter the mixture.</li><li>Warm "
           "the filtrate gently until crystals start to appear.</li><li>Leave the solution to cool "
           "and crystallise.</li></ol>")

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",1,"short",AS,"diagram","", "<p>This question is about elements, compounds and mixtures.</p>" + FIG1 + "<p>Which diagram in <b>Figure 1</b> represents a pure compound? Tick <b>one</b> box: <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>",
 "D — every molecule in it is the same, and each is made of more than one type of atom",
 "Figure 1 is artwork in the PDF; what it shows is written out in the question."),
("1","2",1,"short",AS,"diagram","", "<p>Which diagram in <b>Figure 1</b> represents a mixture of an element and a compound? Tick <b>one</b> box: <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>",
 "C — the grey–white–grey molecules are a compound and the white–white pairs are an element",
 "Figure 1 is artwork in the PDF; what it shows is written out at 01.1."),
("1","3",1,"short",AS,"diagram","", "<p>Elements are metals or non-metals. <b>Figure 2</b> is an outline of the periodic table divided into four sections: <b>A</b> is the tall block on the left, <b>B</b> the wide block in the middle, <b>C</b> the block below and left of the zig-zag on the right, and <b>D</b> the block above and right of it.</p><p>Where are metals found in the periodic table? Tick <b>one</b> box.</p><ul><li>Section A only</li><li>Sections A, B and C</li><li>Sections B, C and D</li><li>Section D only</li></ul>",
 "Sections A, B and C",
 "Figure 2 is artwork in the PDF; what it shows is stated in the question."),
("1","4",2,"short",AS,"", "", "<p>Which <b>two</b> of the following are typical properties of a transition metal? Tick <b>two</b> boxes.</p><ul><li>Can be bent and shaped</li><li>Good conductor of electricity</li><li>Low density</li><li>Low melting point</li><li>Poor conductor of heat</li></ul>",
 "Can be bent and shaped; good conductor of electricity", ""),
("1","5",2,"drawing",BN,"diagram","", "<p>Potassium and chlorine react to produce potassium chloride. An atom of potassium loses an electron to form a potassium ion. An atom of chlorine gains an electron to form a chloride ion.</p><p>Complete the dot and cross diagram: two outer shells are drawn, one for the potassium ion and one for the chloride ion, with the charges to be shown.</p>",
 "Show the potassium ion's outer shell with no electrons in it (or eight, if you have drawn the shell below), and the chloride ion's outer shell with eight electrons — the one gained shown as a different mark from the other seven. Any consistent combination of dots, crosses and circles is accepted.",
 "The dot-and-cross diagram is artwork in the PDF and the answer is a drawing in the scheme; both are described rather than reproduced."),
("1","6",1,"short",AS,"diagram","", FIG3 + "<p>Which apparatus could be used to collect water from sodium chloride solution? Use <b>Figure 3</b>. Tick <b>one</b> box: <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>",
 "B — distillation, which boils the water off and condenses it back into a separate flask",
 "Figure 3 is artwork in the PDF; what it shows is written out in the question."),
("1","7",1,"short",AS,"diagram","", "<p>Which apparatus shows filtration? Use <b>Figure 3</b>. Tick <b>one</b> box: <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>",
 "A", "Figure 3 is artwork in the PDF; what it shows is written out at 01.6."),

("2","1",3,"short",CC,"diagram","", "<p>A titration measures the volumes of an acid and an alkali that neutralise each other. <b>Figure 4</b> shows the apparatus in three steps. <b>A</b> is the narrow glass tube with a bulb in the middle, used to transfer a fixed volume of the alkali. <b>B</b> is the flask the alkali is transferred into, which stands under the tap. <b>C</b> is the long graduated tube with a tap at the bottom, clamped above it and filled with the acid.</p><p>Name the pieces of equipment labelled <b>A</b>, <b>B</b> and <b>C</b> in <b>Figure 4</b>. Choose answers from the box: <i>beaker &nbsp; burette &nbsp; conical flask &nbsp; measuring cylinder &nbsp; pipette &nbsp; test tube</i></p>",
 "A: pipette. B: conical flask. C: burette.",
 "Figure 4 is artwork in the PDF; what it shows is stated in the question."),
("2","2",1,"short",CC,"", "", "<p>In Step 2 the acid is added to the alkali until the solution is neutralised. The volume of acid added is then read from equipment <b>C</b>.</p><p>Name a suitable indicator for use in Step 2 of the titration.</p>",
 "Methyl orange or phenolphthalein (litmus is accepted). Universal indicator is not.", ""),
("2","3",1,"short",CC,"", "", "<p>Give <b>one</b> observation that shows the alkali is neutralised.</p>",
 "A colour change", ""),
("2","4",2,"short",CC,"", "", "<p>Give <b>two</b> ways to make sure that the volume of acid added is accurate.</p>",
 "Any two of: swirl the flask; add the acid drop by drop near the end point; read the burette at eye level, at the bottom of the meniscus; make sure there are no bubbles in the burette; stand the flask on a white tile; repeat and take a mean", ""),
("2","5",1,"short",CC,"diagram","", "<p><b>Figure 5</b> shows the reading on equipment <b>C</b> at the end of Step 2: a close-up of the burette scale, marked in 0.1 cm<sup>3</sup> divisions with 16 and 17 labelled, and the bottom of the meniscus sitting six small divisions below the 16 mark.</p><p>What is the reading on equipment <b>C</b>? Tick <b>one</b> box.</p><ul><li>16.4 cm<sup>3</sup></li><li>16.6 cm<sup>3</sup></li><li>17.4 cm<sup>3</sup></li><li>17.6 cm<sup>3</sup></li></ul>",
 "16.6 cm³ — a burette is numbered downwards from the top, and the meniscus is read at its bottom",
 "Figure 5 is artwork in the PDF; the reading it shows is the mark scheme's own."),
("2","6",1,"short",CC,"", "", "<p>A student did a different titration. <b>Table 1</b> shows the results.</p>" + T1 + "<p>Which <b>two</b> results should be used to calculate the mean volume of acid added? Tick <b>one</b> box.</p><ul><li>Trial 1 and Trial 2</li><li>Trial 1 and Trial 3</li><li>Trial 2 and Trial 3</li></ul>",
 "Trial 2 and Trial 3 — they are concordant, within 0.1 cm³ of each other; trial 1 is the rough titration", ""),
("2","7",1,"short",BN,"", "", "<p>A salt is produced when an acid neutralises an alkali. Barium chloride is a salt containing the ions Ba<sup>2+</sup> and Cl<sup>−</sup>.</p><p>What is the formula of barium chloride? Tick <b>one</b> box.</p><ul><li>BaCl</li><li>BaCl<sub>2</sub></li><li>Ba<sub>2</sub>Cl</li><li>Ba<sub>2</sub>Cl<sub>2</sub></li></ul>",
 "BaCl₂ — two 1− ions balance one 2+ ion", ""),

("3","1",1,"short",CC,"", "", "<p>This question is about energy changes of reactions. Zinc reacts with copper sulfate solution:</p><p>zinc + copper sulfate → zinc sulfate + copper</p><p>What type of reaction is this? Tick <b>one</b> box.</p><ul><li>Combustion</li><li>Decomposition</li><li>Displacement</li></ul>",
 "Displacement", ""),
("3","2",3,"calculation",QC,"", "", "<p>Calculate the percentage (%) by mass of copper in copper sulfate (CuSO<sub>4</sub>). Give your answer to 3 significant figures.</p><p>Relative atomic mass (A<sub>r</sub>): Cu = 63.5<br>Relative formula mass (M<sub>r</sub>): CuSO<sub>4</sub> = 159.5</p>",
 "39.8% — 63.5 ÷ 159.5 × 100 = 39.81191…, which to 3 significant figures is 39.8", ""),
("3","3",1,"short",EC,"", "", "<p>A student investigated the energy change in the reaction between zinc and copper sulfate solution. This is the method used.</p><ol><li>Measure 25 cm<sup>3</sup> of copper sulfate solution into a polystyrene cup.</li><li>Weigh 0.20 g of zinc powder.</li><li>Add the zinc powder to the copper sulfate solution.</li><li>Measure the highest temperature reached by the mixture.</li><li>Repeat steps 1 to 4 using different masses of zinc powder.</li></ol><p>Control variables are used to make an investigation a fair test.</p><p>Which is a control variable in the investigation? Tick <b>one</b> box.</p><ul><li>Highest temperature reached by the mixture</li><li>Mass of zinc powder</li><li>Volume of copper sulfate solution</li></ul>",
 "Volume of copper sulfate solution", ""),
("3","4",1,"short",EC,"graph","", "<p><b>Figure 6</b> plots the highest temperature reached against the mass of zinc powder added. The points climb steeply from 22 °C with no zinc to 47 °C at 0.80 g, and from there they stay level at about 47 °C for every larger mass.</p><p>What is the minimum mass of zinc powder needed to react with all the copper sulfate solution? Use <b>Figure 6</b>.</p>",
 "0.80 g — the mass at which the temperature stops rising, so all the copper sulfate has reacted",
 "Figure 6 is a graph in the PDF; the two values quoted are the mark scheme's own readings."),
("3","5",2,"calculation",EC,"graph","", "<p>What is the maximum temperature change in the reaction between zinc powder and 25 cm<sup>3</sup> of copper sulfate solution? Use <b>Figure 6</b>.</p>",
 "25 °C — 47 °C minus the starting 22 °C", ""),
("3","6",3,"calculation",QC,"", "", "<p>25 cm<sup>3</sup> of copper sulfate solution contained 6.75 g of copper sulfate.</p><p>Calculate the concentration of the solution in g/dm<sup>3</sup>. You should calculate the volume of the solution in dm<sup>3</sup> (1000 cm<sup>3</sup> = 1 dm<sup>3</sup>) and use:</p><p>concentration in g/dm<sup>3</sup> = mass of copper sulfate in grams ÷ volume of solution in dm<sup>3</sup></p>",
 "0.025 dm³, and 6.75 ÷ 0.025 = 270 g/dm³", ""),
("3","7",2,"drawing",EC,"graph","", "<p>Another student investigated the energy change of the reaction between sodium hydrogencarbonate and hydrochloric acid, measuring the <b>lowest</b> temperature reached for different masses of sodium hydrogencarbonate. <b>Figure 7</b> plots those results: the first five points fall steadily as more is added, and the last four sit level at the bottom.</p><p>Draw <b>two</b> straight lines of best fit on <b>Figure 7</b>. The lines should cross.</p>",
 "One line of best fit through the first five points — the falling part — and a second through the last four, the level part. Maximum 1 mark if the lines do not intersect.",
 "Figure 7 is a graph in the PDF and is not transcribed."),
("3","8",1,"short",EC,"graph","", "<p>Which statement describes the energy change in the reaction shown in <b>Figure 7</b>? Tick <b>one</b> box.</p><ul><li>Energy is transferred to the surroundings so the reaction is endothermic.</li><li>Energy is transferred to the surroundings so the reaction is exothermic.</li><li>Energy is taken in from the surroundings so the reaction is endothermic.</li><li>Energy is taken in from the surroundings so the reaction is exothermic.</li></ul>",
 "Energy is taken in from the surroundings so the reaction is endothermic — the temperature falls", ""),

("4","1",1,"short",BN,"", "", "<p>This question is about small particles.</p><p>What is the approximate number of atoms in a nanoparticle? Tick <b>one</b> box.</p><ul><li>A few hundred atoms</li><li>A few thousand atoms</li><li>A few million atoms</li><li>A few billion atoms</li></ul>",
 "A few hundred atoms", ""),
("4","2",1,"short",AS,"", "", "<p>Nanoparticles of some elements can be used as catalysts.</p><p>Which element is most likely to be used as a catalyst? Use the periodic table. Tick <b>one</b> box.</p><ul><li>Aluminium</li><li>Iron</li><li>Magnesium</li></ul>",
 "Iron — it is the only transition metal of the three", ""),
("4","3",2,"short",BN,"diagram","", "<p>Nanoparticles are used in sun creams and in wound dressings. A wound dressing is placed next to the skin to prevent infection; <b>Figure 8</b> is a photograph of one. <b>Table 2</b> shows some information about substances used in the form of nanoparticles.</p>" + T2 + "<p>Draw <b>one</b> line from each use to the best substance for that use.</p><p>Uses: <b>Sun creams</b>, <b>Wound dressings</b>.<br>Substances: carbon; silicon dioxide; silver; titanium dioxide.</p>",
 "Sun creams → titanium dioxide, because it blocks light. Wound dressings → silver, because it kills bacteria.",
 "Figure 8 is a photograph in the PDF and is not transcribed."),
("4","4",6,"calculation",BN,"diagram","", "<p><b>Figure 9</b> shows a cubic nanoparticle with each edge labelled <b>4 nm</b>.</p><p>Calculate the surface area of the cubic nanoparticle, its volume, and the simplest whole number ratio of surface area : volume. Use the equation:</p><p>surface area of cubic nanoparticle = 6 × surface area of one face</p>",
 "Surface area = 6 × 4² = 96 nm². Volume = 4³ = 64 nm³. Ratio 96 : 64, which simplifies to 3 : 2.",
 "Figure 9 is artwork in the PDF; the edge length it is labelled with is stated in the question."),

("5","1",1,"short",AS,"diagram","", "<p>This question is about carbon and carbon compounds. An atom of carbon is represented as <sup>13</sup><sub>6</sub>C.</p><p>What is the number of protons in this atom of carbon? Tick <b>one</b> box.</p><ul><li>1</li><li>6</li><li>7</li><li>13</li></ul>",
 "6 — the bottom number is the atomic number", ""),
("5","2",1,"short",AS,"diagram","", "<p>What is the number of neutrons in this atom of carbon? Tick <b>one</b> box.</p><ul><li>1</li><li>6</li><li>7</li><li>13</li></ul>",
 "7 — the mass number 13 minus the 6 protons", ""),
("5","3",1,"short",AS,"diagram","", "<p>What is the number of electrons in this atom of carbon? Tick <b>one</b> box.</p><ul><li>1</li><li>6</li><li>7</li><li>13</li></ul>",
 "6 — an atom is neutral, so it has as many electrons as protons", ""),
("5","4",1,"short",BN,"diagram","", "<p><b>Figure 10</b> shows the structure of a carbon compound as a displayed formula: two carbon atoms joined to each other, with three fluorine atoms bonded to each.</p><p>Complete the formula of the carbon compound: C__F__</p>",
 "C₂F₆",
 "Figure 10 is artwork in the PDF; what it shows is stated in the question."),
("5","5",1,"short",BN,"", "", "<p>Methane is a carbon compound, exists as small molecules, and has a low boiling point.</p><p>What is the reason for the low boiling point of methane? Tick <b>one</b> box.</p><ul><li>Covalent bonds and intermolecular forces are weak.</li><li>Only covalent bonds are weak.</li><li>Only intermolecular forces are weak.</li></ul>",
 "Only intermolecular forces are weak — the covalent bonds inside the molecule are strong and are not broken when it boils", ""),
("5","6",1,"short",BN,"", "", "<p>Buckminsterfullerene (C<sub>60</sub>) is a form of carbon and was the first fullerene to be discovered.</p><p>What is the shape of a buckminsterfullerene molecule? Tick <b>one</b> box.</p><ul><li>Cubic</li><li>Cylindrical</li><li>Spherical</li></ul>",
 "Spherical", ""),
("5","7",1,"short",BN,"diagram","", "<p>Graphite is a form of carbon. <b>Figure 11</b> represents its structure: flat sheets of carbon atoms joined in hexagons, with the sheets stacked above one another.</p><p>How many covalent bonds does each carbon atom form in graphite? Tick <b>one</b> box.</p><ul><li>1</li><li>2</li><li>3</li><li>4</li></ul>",
 "3",
 "Figure 11 is artwork in the PDF; what it shows is stated in the question."),
("5","8",3,"explain",BN,"diagram","", "<p>Diamond is another form of carbon. <b>Figure 12</b> represents its structure: carbon atoms joined in a three-dimensional network, each one bonded to the atoms around it.</p><p>Describe the structure and bonding in diamond.</p>",
 "It is a giant structure (a lattice) of atoms joined by covalent bonds, and each carbon atom forms four of them",
 "Figure 12 is artwork in the PDF; what it shows is stated in the question."),

("6","1",1,"short",CC,"", "", "<p>This question is about electrolysis and the extraction of metals.</p><p>Why can some molten substances be electrolysed? Tick <b>one</b> box.</p><ul><li>Electrons can move through the molten substance to the electrodes.</li><li>Ions can move through the molten substance to the electrodes.</li><li>Protons can move through the molten substance to the electrodes.</li></ul>",
 "Ions can move through the molten substance to the electrodes", ""),
("6","2",3,"short",CC,"", "", "<p><b>Table 3</b> shows the products of the electrolysis of some molten compounds. Complete <b>Table 3</b>.</p>" + T3,
 "Lead chloride gives lead at the negative electrode. Potassium iodide gives iodine at the positive electrode. The third compound is zinc bromide.", ""),
("6","3",2,"short",QC,"", "", "<p>Aluminium is extracted by electrolysing molten aluminium oxide.</p><p>Balance the equation for the reaction. Choose numbers from the box: <i>2 &nbsp; 3 &nbsp; 4 &nbsp; 5</i></p><p>2 Al<sub>2</sub>O<sub>3</sub> → ___ Al + ___ O<sub>2</sub></p>",
 "2 Al₂O₃ → 4 Al + 3 O₂. Either number alone scores 1.", ""),
("6","4",2,"calculation",QC,"", "", "<p>Calculate the relative formula mass (M<sub>r</sub>) of aluminium oxide (Al<sub>2</sub>O<sub>3</sub>).</p><p>Relative atomic masses (A<sub>r</sub>): O = 16, Al = 27</p>",
 "102 — (27 × 2) + (16 × 3) = 54 + 48", ""),
("6","5",2,"short",CC,"diagram","", FIG13 + "<p>Metals can be extracted from their compounds by electrolysis and by reduction with carbon. Electrolysis is more expensive than reduction with carbon.</p><p>Predict <b>one</b> metal that would be extracted by each method. Use <b>Figure 13</b>.</p>",
 "By electrolysis: potassium or lithium — a metal above carbon, which carbon cannot displace. By carbon reduction: zinc or tin — a metal below carbon.",
 "Figure 13 is artwork in the PDF; the series it shows is written out in the question."),

("7","1",1,"calculation",EC,"", "", "<p>This question is about chemical cells.</p><p>A student connects four 1.5 V cells in series to make a battery. What is the total voltage produced by the battery?</p>",
 "6 V — 4 × 1.5", ""),
("7","2",1,"short",CC,"diagram","", "<p>A chemical cell can be made using two different metals in contact with an electrolyte. <b>Figure 14</b> shows one: two metal strips, labelled <b>metal A</b> and <b>metal B</b>, standing in a beaker of solution and connected to a voltmeter.</p><p>Which is a suitable electrolyte for a chemical cell? Tick <b>one</b> box.</p><ul><li>Pure water</li><li>Solid lead bromide</li><li>Sodium chloride solution</li></ul>",
 "Sodium chloride solution — it contains ions that are free to move",
 "Figure 14 is artwork in the PDF; what it shows is stated in the question."),
("7","3",6,"written",EC,"diagram","", "<p>A student made the hypothesis: 'The voltage produced by a cell depends on the difference in the reactivity of metal <b>A</b> and metal <b>B</b>.'</p><p>Plan an investigation to test this hypothesis. Your plan should produce valid results. Use <b>Figure 14</b>.</p>",
 "Level-marked out of 6. Set up the cell as in Figure 14: pour the electrolyte into a beaker, stand two different metals in it, connect them to a voltmeter and measure the voltage. Repeat with different pairs of metals, keeping one metal the same each time so the comparison is about the other. Use the same type, volume and concentration of electrolyte every time.",
 "Figure 14 is artwork in the PDF; what it shows is stated at 07.2."),

("8","1",2,"short",CC,"", "", METHOD8 + "<p>Complete the word equation for the reaction.</p><p>copper carbonate + sulfuric acid → ............... + ............... + carbon dioxide</p>",
 "copper sulfate + water (CuSO₄ and H₂O are accepted)", ""),
("8","2",1,"short",CC,"", "", "<p>Give <b>one</b> observation the student could make during Step 4 which shows that the copper carbonate is in excess.</p>",
 "Solid remains in the mixture — or there is no more effervescence, bubbling or fizzing", ""),
("8","3",1,"short",CC,"", "", "<p>Give <b>one</b> reason for filtering the mixture in Step 5.</p>",
 "To remove the excess copper carbonate", ""),
("8","4",1,"short",CC,"", "", "<p>Name the equipment that can be used to warm the filtrate gently in Step 6.</p>",
 "An electric heater, or a water bath. (A Bunsen burner is ignored.)", ""),
("8","5",3,"calculation",QC,"", "", "<p>The maximum theoretical mass of the salt that could be produced using 50 cm<sup>3</sup> of the sulfuric acid is 12.5 g. The percentage yield of the salt is 92.8%.</p><p>Calculate the mass of salt actually produced. Use the equation:</p><p>% yield = (mass of salt actually produced ÷ maximum theoretical mass of salt that could be produced) × 100</p>",
 "11.6 g — mass produced = (92.8 ÷ 100) × 12.5", ""),
("8","6",2,"explain",CC,"", "", "<p>Some salts can be produced by reacting sulfuric acid with a metal. Neither copper nor sodium is used to produce a salt with sulfuric acid.</p><p>Give <b>one</b> reason why each metal is not used.</p>",
 "Copper: it does not react with the acid — it is below hydrogen in the reactivity series, so it will not displace hydrogen. Sodium: the reaction is dangerous — it could explode, or get too hot.", ""),

("9","1",2,"explain",AS,"", "", "<p>This question is about the periodic table. Sodium and potassium are in Group 1.</p><p>Give <b>one</b> similarity and <b>one</b> difference between the electronic structures of sodium and potassium.</p>",
 "Similarity: both have one electron in their outer shell. Difference: sodium has 3 shells and potassium has 4.", ""),
("9","2",2,"short",CC,"", "", "<p>Group 1 elements react with water.</p><p>Give <b>two</b> observations made when potassium reacts with water.</p>",
 "Any two of: effervescence, bubbling or fizzing; the potassium floats; it moves around; it gets smaller; it melts or forms a ball; a flame; an explosion", ""),
("9","3",2,"explain",CC,"", "", "<p>Potassium hydroxide solution is produced when potassium reacts with water.</p><p>What is the colour of universal indicator when added to potassium hydroxide solution? Give <b>one</b> reason for your answer.</p>",
 "Blue, violet or purple — because the solution is alkaline (it contains hydroxide, OH⁻, ions)", ""),
("9","4",2,"drawing",AS,"graph", fig15(), "<p><b>Table 4</b> shows the densities of some of the elements in Group 0 of the periodic table.</p>" + T4 + "<p>Plot the data from <b>Table 4</b> on <b>Figure 15</b>.</p>",
 "Plot all five known points — (2, 0.2), (10, 0.8), (18, 1.6), (54, 5.4) and (86, 9.1) — each within half a small square. Three or four correct points score 1 of the 2.", ""),
("9","5",1,"short",AS,"graph", fig15(), "<p>Estimate the density (<b>X</b>) of krypton. Use <b>Figure 15</b> and <b>Table 4</b>.</p>",
 "3.4 mg/cm³ — anything from 3.0 to 3.8 is accepted", ""),
("9","6",1,"short",AS,"", "", "<p>The elements in Group 7 are called the halogens. A more reactive halogen can displace a less reactive halogen from a solution of its salt.</p><p>Which combination of solutions will produce a reaction when mixed? Tick <b>one</b> box.</p><ul><li>Chlorine and potassium fluoride</li><li>Chlorine and potassium bromide</li><li>Bromine and potassium fluoride</li><li>Bromine and potassium chloride</li></ul>",
 "Chlorine and potassium bromide", ""),
("9","7",1,"short",AS,"", "", "<p>Which of the following describes the trends going down Group 7? Tick <b>one</b> box.</p><ul><li>Relative molecular mass decreases and boiling point decreases.</li><li>Relative molecular mass decreases and boiling point increases.</li><li>Relative molecular mass increases and boiling point decreases.</li><li>Relative molecular mass increases and boiling point increases.</li></ul>",
 "Relative molecular mass increases and boiling point increases", ""),

("10","1",2,"short",AS,"diagram","", "<p>This question is about models of the atom. <b>Figure 16</b> shows two early models. <b>Model A</b> is a shaded ball of positive charge with four electrons dotted about inside it. <b>Model B</b> is a small positive nucleus at the centre with electrons arranged on two circular shells around it.</p><p>Name the models of the atom shown in <b>Figure 16</b>.</p>",
 "Model A: the plum pudding model (Thomson). Model B: the Bohr model (also accepted: nuclear, planetary, Rutherford-Bohr).",
 "Figure 16 is artwork in the PDF; what it shows is stated in the question."),
("10","2",4,"written",AS,"diagram","", "<p>Compare <b>model A</b> with the model of the atom used today. Use <b>Figure 16</b>.</p>",
 "Level-marked out of 4. Similarities: both contain electrons; both are neutral overall. Differences: model A has no nucleus, no protons and no neutrons, where today's model has all three. In model A the positive charge and the mass are spread throughout the atom; today they are concentrated in the centre. In model A the electrons are distributed randomly; today they are in shells. Model A has no empty space; today's atom is mostly empty space.",
 "Figure 16 is artwork in the PDF; what it shows is stated at 10.1."),
("10","3",2,"short",AS,"", "", "<p>Chadwick's experiments showed the existence of neutrons in an atom. This led to an understanding of isotopes.</p><p>Define the term 'isotopes'. Refer to subatomic particles in your answer.</p>",
 "Atoms with the same number of protons but different numbers of neutrons", ""),
]

# ---- the paper says what it is out of, and so does every box down the margin ----
PER_QUESTION = {"1": 9, "2": 10, "3": 14, "4": 10, "5": 10,
                "6": 10, "7": 8, "8": 10, "9": 11, "10": 8}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())

# ---- every number the scheme prints inside its own working, recomputed here ----
assert round(63.5 / 159.5 * 100, 5) == 39.81191 and round(63.5 / 159.5 * 100, 1) == 39.8
assert 47 - 22 == 25
assert 25 / 1000 == 0.025 and 6.75 / 0.025 == 270
assert 6 * 4 ** 2 == 96 and 4 ** 3 == 64 and (96 // 32, 64 // 32) == (3, 2)
assert 27 * 2 + 16 * 3 == 102
assert 4 * 1.5 == 6
assert 92.8 / 100 * 12.5 == 11.6                      # shared with 8462/1H question 01.5
assert 13 - 6 == 7                                    # the carbon nuclide
for _, _, _, _, topics, *_ in Q:
    assert ',' not in topics, topics

d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 5

rows = []
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-8462-2406-1F-%02d%s' % (int(q), part), kind='question',
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
