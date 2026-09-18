#!/usr/bin/env python3
"""AQA GCSE Chemistry 8462/1H, June 2024 — 44 question rows into data/questions.json.

WHY THIS IS A SCRIPT AND NOT A HAND EDIT. CLAUDE.md: "Every number in a transcription is checked
against the paper's own stated total ... and the insert script asserts it before writing a row."
The cover says 100 and the margin boxes say 10, 11, 8, 14, 10, 11, 15, 9, 12. Both are asserted
below, and so is every intermediate the scheme prints inside its own working.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Higher)_ Paper 1 - June 2024 (1).pdf`, which is AQA's
own 8462/1H scheme — read, not derived.

FIGURE 3 WAS MEASURED OFF THE PIXELS, NOT READ OFF THE PAGE. It is a raster image inside the PDF
with no text layer and no vectors, so there was nothing to extract: the gridlines were found by
their own regular spacing, the scale fixed from them (2.5 °C and 0.10 g per major division), and
the eight crosses located as dark blobs. CLAUDE.md's rule for a picture carrying data, and the
reason for it is one line down in the same entry — "a cumulative-frequency curve read by eye gave
50 at 160 cm where the pixels said 48.1". The scheme's own two readings, 0.8 g and 47 °C for where
the lines of best fit cross, land exactly on the fifth cross, which is what confirms the scale.

FIGURE 1 IS DRAWN EMPTY, ON PURPOSE. 02.4 is "plot the data from Table 1 on Figure 1", so the
picture the question needs is the grid with nothing on it — and with it there, `padSource_` lays a
pen over the grid and the question can actually be answered on a phone. Figure 3 is drawn with its
eight crosses for the same reason: 04.1 asks for two lines of best fit ON them.

THE REST ARE DESCRIBED. The atom models, the electrolysis apparatus and its result, the chemical
cell, the reaction profiles and the two displayed formulae are artwork in the PDF. Where the
picture decides the answer — the blue patch by the negative electrode and the yellow by the
positive, the four profiles and which way each arrow points — what it shows is said in the
question's own words, because a question about a picture you cannot see is not a question.
"""
import json, datetime, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import W, axes

PAPER = 'P-AQA-8462-2406-1H'
DOC = dict(paper_id=PAPER, subject='Chemistry', key_stage='KS4', band_type='stage',
           band_value='GCSE', tier='Higher', level='GCSE', company='AQA', exam_board='AQA',
           spec_code='8462/1H', exam_wave='First wave', year='2024', month='5', paper='1',
           exam_date='2024-05-17', document_type='Past paper', name='Paper 1 — June 2024',
           active='True', trackable='True', printable='False')

AS = 'Atomic Structure & the Periodic Table'
BN = 'Bonding & Structure'   # NO COMMA: `topics` is a comma-list, so a comma in a
                             # name is a second topic. Measured: it split into
                             # 'Bonding' and 'Structure and the Properties of
                             # Matter', neither of which joins data/topics.json.
QC = 'Quantitative Chemistry'
CC = 'Chemical Changes'
EC = 'Energy Changes'

TABLE1 = [('Helium', 2, '0.2'), ('Neon', 10, '0.8'), ('Argon', 18, '1.6'),
          ('Krypton', 36, 'X'), ('Xenon', 54, '5.4'), ('Radon', 86, '9.1')]

# Measured off the image in the PDF — see the header. Mass of zinc in g, highest temperature in °C.
FIG3 = [(0.00, 21.0), (0.20, 28.0), (0.40, 33.5), (0.60, 41.0),
        (0.80, 47.0), (1.00, 47.0), (1.20, 46.0), (1.40, 47.0)]

def fig1():
    """The empty grid 02.4 asks you to plot on. Axes read off the page: atomic number to 110,
    density to 11 mg/cm³, labelled every 20 and every 2."""
    return axes(110, 11, 20, 2, 'Atomic number', 'Density in mg/cm³',
                'Empty grid for plotting density against atomic number',
                xminor=5, yminor=1)

def fig3():
    def crosses(sx, sy):
        out = []
        for x, y in FIG3:
            cx, cy = sx(x), sy(y)
            out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                       % (cx - 3, cy - 3, cx + 3, cy + 3))
            out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                       % (cx - 3, cy + 3, cx + 3, cy - 3))
        return ''.join(out)
    return axes(1.5, 52.5, 0.2, 5, 'Mass of zinc in grams', 'Highest temperature reached in °C',
                'Graph of highest temperature reached against mass of zinc, eight points plotted',
                crosses, ymin=20, xminor=0.05, yminor=2.5)

T1 = ('<table><tr><th>Element</th><th>Atomic number</th><th>Density in mg/cm<sup>3</sup></th></tr>'
      + ''.join('<tr><td>%s</td><td>%d</td><td>%s</td></tr>' % r for r in TABLE1) + '</table>')
T2 = ('<table><tr><th></th><th>Trial 1</th><th>Trial 2</th><th>Trial 3</th><th>Trial 4</th></tr>'
      '<tr><td>Highest temperature reached in °C</td><td>37.6</td><td>37.2</td><td>37.8</td>'
      '<td>37.4</td></tr></table>')
T3 = ('<table><tr><th>Electrode A</th><th>Symbol of metal</th><th>Voltage in volts</th></tr>'
      '<tr><td>Copper</td><td>Cu</td><td>−0.59</td></tr>'
      '<tr><td>Magnesium</td><td>Mg</td><td>2.12</td></tr>'
      '<tr><td>Nickel</td><td>Ni</td><td>0.00</td></tr>'
      '<tr><td>Silver</td><td>Ag</td><td>−1.05</td></tr>'
      '<tr><td>Zinc</td><td>Zn</td><td>0.51</td></tr></table>')
T4 = ('<table><tr><th>Bond</th><th>C — C</th><th>C — H</th><th>O = O</th><th>C = O</th>'
      '<th>O — H</th></tr><tr><td>Energy in kJ/mol</td><td>347</td><td><b>X</b></td><td>498</td>'
      '<td>805</td><td>464</td></tr></table>')

METHOD1 = ("<p>A student produced a salt by reacting copper carbonate with sulfuric acid. This is "
           "the method used.</p><ol><li>Measure 50 cm<sup>3</sup> of sulfuric acid into a beaker."
           "</li><li>Add copper carbonate powder.</li><li>Stir the mixture.</li><li>Repeat steps 2 "
           "and 3 until copper carbonate is in excess.</li><li>Filter the mixture.</li><li>Warm "
           "the filtrate gently until crystals start to appear.</li><li>Leave the solution to cool "
           "and crystallise.</li></ol>")
METHOD4 = ("<p>A student investigated the energy change of the reaction between zinc and copper "
           "sulfate solution. This is the method used.</p><ol><li>Measure 25 cm<sup>3</sup> of "
           "copper sulfate solution into a polystyrene cup.</li><li>Measure the temperature of the "
           "copper sulfate solution.</li><li>Add 0.20 g of zinc powder to the copper sulfate "
           "solution.</li><li>Stir the reaction mixture.</li><li>Record the highest temperature "
           "reached.</li><li>Repeat steps 1 to 5 with different masses of zinc powder.</li></ol>")

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",2,"short",CC,"", "", METHOD1 + "<p>Complete the word equation for the reaction.</p><p>copper carbonate + sulfuric acid → ............... + ............... + carbon dioxide</p>",
 "copper sulfate + water (CuSO₄ and H₂O are accepted)", ""),
("1","2",1,"short",CC,"", "", "<p>Give <b>one</b> observation the student could make during Step 4 which shows that the copper carbonate is in excess.</p>",
 "Solid remains in the mixture — or there is no more effervescence, bubbling or fizzing", ""),
("1","3",1,"short",CC,"", "", "<p>Give <b>one</b> reason for filtering the mixture in Step 5.</p>",
 "To remove the excess copper carbonate", ""),
("1","4",1,"short",CC,"", "", "<p>Name the equipment that can be used to warm the filtrate gently in Step 6.</p>",
 "An electric heater, or a water bath. (A Bunsen burner is ignored.)", ""),
("1","5",3,"calculation",QC,"", "", "<p>The maximum theoretical mass of the salt that could be produced using 50 cm<sup>3</sup> of the sulfuric acid is 12.5 g. The percentage yield of the salt is 92.8%.</p><p>Calculate the mass of salt actually produced. Use the equation:</p><p>% yield = (mass of salt actually produced ÷ maximum theoretical mass of salt that could be produced) × 100</p>",
 "11.6 g — mass produced = (92.8 ÷ 100) × 12.5", ""),
("1","6",2,"explain",CC,"", "", "<p>Some salts can be produced by reacting sulfuric acid with a metal. Neither copper nor sodium is used to produce a salt with sulfuric acid.</p><p>Give <b>one</b> reason why each metal is not used.</p>",
 "Copper: it does not react with the acid — it is below hydrogen in the reactivity series, so it will not displace hydrogen. Sodium: the reaction is dangerous — it could explode, or get too hot.", ""),

("2","1",2,"explain",AS,"", "", "<p>This question is about the periodic table. Sodium and potassium are in Group 1 of the periodic table.</p><p>Give <b>one</b> similarity and <b>one</b> difference between the electronic structures of sodium and potassium.</p>",
 "Similarity: both have one electron in their outer shell. Difference: sodium has 3 shells and potassium has 4.", ""),
("2","2",2,"short",CC,"", "", "<p>Group 1 elements react with water.</p><p>Give <b>two</b> observations made when potassium reacts with water.</p>",
 "Any two of: effervescence, bubbling or fizzing; the potassium floats; it moves around; it gets smaller; it melts or forms a ball; a flame; an explosion", ""),
("2","3",2,"explain",CC,"", "", "<p>Potassium hydroxide solution is produced when potassium reacts with water.</p><p>What is the colour of universal indicator when added to potassium hydroxide solution? Give <b>one</b> reason for your answer.</p>",
 "Blue, violet or purple — because the solution is alkaline (it contains hydroxide, OH⁻, ions)", ""),
("2","4",2,"drawing",AS,"graph", fig1(), "<p><b>Table 1</b> shows the densities of some of the elements in Group 0 of the periodic table.</p>" + T1 + "<p>Plot the data from <b>Table 1</b> on <b>Figure 1</b>.</p>",
 "Plot all five known points — (2, 0.2), (10, 0.8), (18, 1.6), (54, 5.4) and (86, 9.1) — each within half a small square. Three or four correct points score 1 of the 2.", ""),
("2","5",1,"short",AS,"graph", fig1(), "<p>Estimate the density (<b>X</b>) of krypton. Use <b>Figure 1</b> and <b>Table 1</b>.</p>",
 "3.4 mg/cm³ — anything from 3.0 to 3.8 is accepted", ""),
("2","6",1,"short",AS,"", "", "<p>The elements in Group 7 are called the halogens. A more reactive halogen can displace a less reactive halogen from a solution of its salt.</p><p>Which combination of solutions will produce a reaction when mixed? Tick <b>one</b> box.</p><ul><li>Chlorine and potassium fluoride</li><li>Chlorine and potassium bromide</li><li>Bromine and potassium fluoride</li><li>Bromine and potassium chloride</li></ul>",
 "Chlorine and potassium bromide", ""),
("2","7",1,"short",AS,"", "", "<p>Which of the following describes the trends going down Group 7? Tick <b>one</b> box.</p><ul><li>Relative molecular mass decreases and boiling point decreases.</li><li>Relative molecular mass decreases and boiling point increases.</li><li>Relative molecular mass increases and boiling point decreases.</li><li>Relative molecular mass increases and boiling point increases.</li></ul>",
 "Relative molecular mass increases and boiling point increases", ""),

("3","1",2,"short",AS,"diagram","", "<p>This question is about models of the atom. <b>Figure 2</b> shows two early models of the atom. <b>Model A</b> is a shaded ball of positive charge with four electrons dotted about inside it. <b>Model B</b> is a small positive nucleus at the centre with electrons arranged on two circular shells around it.</p><p>Name the models of the atom shown in <b>Figure 2</b>.</p>",
 "Model A: the plum pudding model (Thomson). Model B: the Bohr model (also accepted: nuclear, planetary, Rutherford-Bohr).",
 "Figure 2 is artwork in the PDF and is not transcribed."),
("3","2",4,"written",AS,"diagram","", "<p>Compare <b>model A</b> with the model of the atom used today. Use <b>Figure 2</b>.</p>",
 "Level-marked out of 4. Similarities: both contain electrons; both are neutral overall. Differences: model A has no nucleus, no protons and no neutrons, where today's model has all three. In model A the positive charge and the mass are spread throughout the atom; today the positive charge and almost all the mass are concentrated in the centre. In model A the electrons are distributed randomly; today they are in shells or energy levels. Model A has no empty space; today's atom is mostly empty space.",
 "Figure 2 is artwork in the PDF and is not transcribed."),
("3","3",2,"short",AS,"", "", "<p>Chadwick's experiments showed the existence of neutrons in an atom. This led to an understanding of isotopes.</p><p>Define the term 'isotopes'. Refer to subatomic particles in your answer.</p>",
 "Atoms with the same number of protons but different numbers of neutrons", ""),
("4","1",2,"drawing",EC,"graph", fig3(), METHOD4 + "<p><b>Figure 3</b> shows the results.</p><p>Draw <b>two</b> lines of best fit on <b>Figure 3</b>. The lines should cross.</p>",
 "One line of best fit through the first five points (the rising part), and a second through the last four (the flat part). Maximum 1 mark if the lines do not intersect.", ""),
("4","2",4,"explain",EC,"graph", fig3(), "<p>Explain the results shown in <b>Figure 3</b>. Do not refer to anomalous points. Use data from <b>Figure 3</b>.</p>",
 "The temperature rises because the reaction is exothermic — energy is transferred to the surroundings — until 0.8 g of zinc is added (where the temperature reaches 47 °C). After that there is no additional reaction, because the zinc is in excess and the copper sulfate has been used up.", ""),
("4","3",2,"explain",EC,"", "", "<p>Explain why using a polystyrene cup gives more accurate results than using a glass beaker.</p>",
 "Polystyrene is a better thermal insulator, so less energy is transferred to the surroundings", ""),
("4","4",2,"short",CC,"", "", "<p>Complete the ionic equation for the reaction between zinc and copper sulfate solution. Include state symbols.</p><p>Zn(s) + Cu<sup>2+</sup>(aq) → ............... + ...............</p>",
 "Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s). Zn²⁺ and Cu without state symbols scores 1 of the 2.", ""),
("4","5",3,"calculation",QC,"", "", "<p>A different student repeated steps 1 to 5 of the method four times using 0.50 g of zinc powder. <b>Table 2</b> shows the results.</p>" + T2 + "<p>Calculate the mean highest temperature reached. Include the uncertainty in your answer.</p>",
 "37.5 ± 0.3 °C — the mean is (37.6 + 37.2 + 37.8 + 37.4) ÷ 4 = 150 ÷ 4, and the uncertainty is half the range of 0.6 °C", ""),
("4","6",1,"short",EC,"", "", "<p>The results show random errors. The student did not make any measuring errors.</p><p>Suggest <b>one</b> reason for the random errors in this experiment.</p>",
 "The starting temperature may have been different each time, or the stirring was inconsistent (or the lid was used inconsistently)", ""),

("5","1",4,"explain",BN,"", "", "<p>This question is about ionic compounds and electrolysis. Calcium chloride is an ionic compound. Calcium and chlorine react to produce calcium chloride.</p><p>Describe what happens to calcium atoms and chlorine atoms when the ionic compound calcium chloride is formed.</p>",
 "Each calcium atom loses two electrons and each chlorine atom gains one electron, so one calcium atom reacts with two chlorine atoms, forming Ca²⁺ ions and Cl⁻ ions — all with full outer shells. Just 'calcium atoms lose electrons and chlorine atoms gain electrons' scores 1 of the 4.", ""),
("5","2",1,"short",BN,"", "", "<p>Solid calcium chloride cannot be electrolysed. Give <b>one</b> reason why.</p>",
 "The ions cannot move — they are in fixed positions", ""),
("5","3",1,"short",CC,"", "", "<p>Name the product formed at the negative electrode when aqueous calcium chloride solution is electrolysed.</p>",
 "Hydrogen", ""),
("5","4",1,"short",CC,"", "", "<p>What is the half equation for the reaction at the positive electrode when aqueous calcium chloride solution is electrolysed? Tick <b>one</b> box.</p><ul><li>2 Cl⁻ → Cl₂ + 2 e⁻</li><li>Cl₂ + 2 e⁻ → 2 Cl⁻</li><li>4 OH⁻ → O₂ + 2 H₂O + 4 e⁻</li><li>O₂ + 2 H₂O + 4 e⁻ → 4 OH⁻</li></ul>",
 "2 Cl⁻ → Cl₂ + 2 e⁻", ""),
("5","5",3,"explain",CC,"diagram","", "<p>A student investigated the electrolysis of green copper chromate solution. <b>Figure 4</b> shows the apparatus: a piece of filter paper soaked in an electrolyte solution lies between a negative electrode on the left and a positive electrode on the right, with a drop of green copper chromate solution in the middle and a power supply across the two electrodes.</p><p><b>Figure 5</b> shows the results. The green drop has separated into two patches: a <b>blue</b> patch on the side nearer the negative electrode and a <b>yellow</b> patch on the side nearer the positive electrode.</p><p>Copper chromate solution contains the ions Cu<sup>2+</sup> and CrO<sub>4</sub><sup>2−</sup>.</p><p>Explain the results shown in <b>Figure 5</b>.</p>",
 "Cu²⁺ (copper) ions are blue and CrO₄²⁻ (chromate) ions are yellow. The Cu²⁺ ions move towards the negative electrode, and the CrO₄²⁻ ions move towards the positive electrode.",
 "Figures 4 and 5 are artwork in the PDF and are not transcribed; what each shows is stated in the question."),

("6","1",3,"explain",CC,"diagram", "", "<p>A student investigated the voltage produced by different pairs of metal electrodes in a chemical cell. <b>Figure 6</b> shows the apparatus: two metal electrodes standing in a beaker of solution, connected to a voltmeter. This is the method used.</p><ol><li>Place a nickel electrode and an electrode made from a different metal (electrode A) in 1.0 mol/dm<sup>3</sup> sodium chloride solution.</li><li>Measure the voltage produced.</li><li>Repeat using different metals for electrode A.</li></ol><p><b>Table 3</b> shows the results.</p>" + T3 + "<p>Write the symbols of the five metals in <b>Table 3</b> in order of reactivity, most reactive first. Justify your answer.</p>",
 "Mg, Zn, Ni, Cu, Ag. Justification: the higher the positive voltage, the more reactive the metal. Getting either Mg, Zn, Ni or Ni, Cu, Ag in the right order scores 1 of the 2 order marks.",
 "Figure 6 is artwork in the PDF and is not transcribed."),
("6","2",6,"written",EC,"", "", "<p>The voltage produced by a chemical cell depends on the concentration of the electrolyte solution.</p><p>Plan an experiment to investigate how the voltage produced by a chemical cell varies with the concentration of the electrolyte solution. The following substances are available:</p><ul><li>the metal electrodes in <b>Table 3</b></li><li>1.0 mol/dm<sup>3</sup> sodium chloride solution</li><li>pure water.</li></ul>",
 "Level-marked out of 6. Set up a cell with sodium chloride solution as the electrolyte and two different metals as the electrodes. Measure the voltage. Repeat at different concentrations, made by diluting the sodium chloride solution with pure water, using measured volumes of each — a measuring cylinder, pipette or burette. Use the same two metals and the same volume of electrolyte every time.", ""),
("6","3",2,"explain",EC,"", "", "<p>Describe how a hydrogen fuel cell produces a potential difference.</p>",
 "Hydrogen is oxidised electrochemically — it loses electrons — to produce water", ""),

("7","1",2,"explain",BN,"", "", "<p>This question is about iron. Iron is a metal.</p><p>Describe how iron conducts thermal energy.</p>",
 "Thermal energy is transferred by the delocalised electrons", ""),
("7","2",3,"explain",BN,"", "", "<p>Pure iron is too soft for many uses.</p><p>Explain why mixing iron with other metals makes alloys which are harder than pure iron.</p>",
 "The alloy contains atoms of different sizes, so the layers are distorted, so the layers cannot easily slide over each other", ""),
("7","3",1,"short",QC,"", "", "<p>When iron reacts with chlorine, 0.12 mol of iron reacts with 0.18 mol of chlorine (Cl<sub>2</sub>).</p><p>Which is the correct equation for the reaction? Tick <b>one</b> box.</p><ul><li>Fe + Cl₂ → FeCl₂</li><li>Fe + 3 Cl₂ → FeCl₆</li><li>2 Fe + Cl₂ → 2 FeCl</li><li>2 Fe + 3 Cl₂ → 2 FeCl₃</li></ul>",
 "2 Fe + 3 Cl₂ → 2 FeCl₃ — the ratio 0.12 : 0.18 is 2 : 3", ""),
("7","4",1,"short",BN,"", "", "<p>The most common oxides of iron are Fe<sub>2</sub>O<sub>3</sub> and Fe<sub>3</sub>O<sub>4</sub>.</p><p>What is the ratio of the numbers of ions in Fe<sub>3</sub>O<sub>4</sub>? Tick <b>one</b> box.</p><ul><li>2 Fe²⁺ : 1 Fe³⁺ : 4 O²⁻</li><li>1 Fe²⁺ : 2 Fe³⁺ : 4 O²⁻</li><li>3 Fe²⁺ : 4 O²⁻</li><li>3 Fe³⁺ : 4 O²⁻</li></ul>",
 "1 Fe²⁺ : 2 Fe³⁺ : 4 O²⁻", ""),
("7","5",3,"calculation",QC,"", "", "<p>Calculate the percentage (%) by mass of iron in Fe<sub>3</sub>O<sub>4</sub>.</p><p>Relative atomic masses (A<sub>r</sub>): O = 16, Fe = 56</p>",
 "72.4% — Mᵣ of Fe₃O₄ is 232, and (3 × 56) ÷ 232 × 100 = 168 ÷ 232 × 100 = 72.41379…", ""),
("7","6",5,"calculation",QC,"", "", "<p>Fe<sub>2</sub>O<sub>3</sub> reacts with carbon to produce carbon dioxide. The equation for the reaction is:</p><p>2 Fe<sub>2</sub>O<sub>3</sub>(s) + 3 C(s) → 4 Fe(s) + 3 CO<sub>2</sub>(g)</p><p>Calculate the volume of carbon dioxide gas at room temperature and pressure that is produced from 40.0 kg of Fe<sub>2</sub>O<sub>3</sub> using excess carbon.</p><p>Relative formula mass (M<sub>r</sub>): Fe<sub>2</sub>O<sub>3</sub> = 160<br>The volume of 1 mole of any gas at room temperature and pressure is 24 dm<sup>3</sup>.</p>",
 "9000 dm³ — 40.0 kg is 40 000 g, which is 40 000 ÷ 160 = 250 mol of Fe₂O₃; that gives 250 × 3/2 = 375 mol of CO₂; and 375 × 24 = 9000 dm³", ""),

("8","1",3,"explain",BN,"diagram","", "<p>This question is about propane (C<sub>3</sub>H<sub>8</sub>). <b>Figure 7</b> shows its displayed structural formula: a chain of three carbon atoms, each joined to the next by a single bond, with hydrogen atoms filling every remaining bond — three on each end carbon and two on the middle one.</p><p>Explain why propane has a low boiling point.</p>",
 "Propane is a small (simple) molecule, so the intermolecular forces between the molecules are weak, so little energy is needed to overcome them. Not the covalent bonds — those are not broken when propane boils.",
 "Figure 7 is artwork in the PDF; the structure is described rather than drawn."),
("8","2",1,"short",EC,"diagram","", "<p>Propane reacts with oxygen to produce carbon dioxide and water. The reaction is exothermic.</p><p><b>Figure 8</b> shows four reaction profiles. All four have energy up the side and progress of reaction along the bottom, and all four are labelled 'overall energy change' beside an arrow between the reactant level and the product level.</p><ul><li><b>A</b> — products lower than reactants, arrow pointing <b>up</b></li><li><b>B</b> — products lower than reactants, arrow pointing <b>down</b></li><li><b>C</b> — products higher than reactants, arrow pointing <b>down</b></li><li><b>D</b> — products higher than reactants, arrow pointing <b>up</b></li></ul><p>Which is the correct reaction profile and labels for the reaction between propane and oxygen? Tick <b>one</b> box.</p>",
 "B — the products are lower in energy than the reactants because the reaction is exothermic, and the arrow points downwards from the reactant level to the product level",
 "Figure 8 is artwork in the PDF; what each of the four profiles shows is stated in the question."),
("8","3",5,"calculation",EC,"", "", "<p><b>Figure 9</b> shows the displayed formula equation for the reaction between propane and oxygen:</p><p>C<sub>3</sub>H<sub>8</sub> + 5 O=O → 3 O=C=O + 4 H—O—H</p><p>The overall energy change of this exothermic reaction is 2219 kJ/mol. <b>Table 4</b> shows the bond energies of the bonds in the reaction.</p>" + T4 + "<p>Calculate the bond energy of the C — H bond (<b>X</b>).</p>",
 "392 kJ/mol. Bonds broken = 2(347) + 8X + 5(498) = 3184 + 8X. Bonds made = 6(805) + 8(464) = 8542. Energy released = bonds made − bonds broken, so 2219 = 8542 − (3184 + 8X), giving 8X = 3139 and X = 392.375.", ""),

("9","1",2,"short",CC,"", "", "<p>This question is about acids and their reactions. Acids can be either weak or strong.</p><p>What is meant by 'a weak acid'?</p>",
 "An acid which is only partially ionised (partially dissociated) in aqueous solution", ""),
("9","2",2,"explain",CC,"", "", "<p>Explain what happens to the pH of an acid as the acid is diluted with water.</p>",
 "The pH increases, because the concentration of hydrogen ions decreases", ""),
("9","3",3,"written",CC,"", "", "<p>A student does a titration to find the volume of acid needed to neutralise an alkali. The student fills a burette with the acid.</p><p>Give <b>three</b> more steps the student must do before adding the acid to the alkali from the burette. You should name any equipment used.</p>",
 "Use a volumetric pipette to add the alkali (this mark is compulsory), then any two of: into a conical flask; add an indicator to the alkali; take the initial burette reading; stand the flask on a white tile. Universal indicator is not accepted.", ""),
("9","4",2,"calculation",QC,"", "", "<p>The student titrated a solution containing 0.0045 moles of sodium hydroxide with 0.15 mol/dm<sup>3</sup> hydrochloric acid. The equation for the reaction is:</p><p>NaOH + HCl → NaCl + H<sub>2</sub>O</p><p>Calculate the volume of hydrochloric acid in cm<sup>3</sup> needed in the titration.</p>",
 "30 cm³ — 0.0045 ÷ 0.15 = 0.030 dm³, which is 30 cm³", ""),
("9","5",3,"explain",AS,"", "", "<p>A calcium atom is larger than a magnesium atom.</p><p>Explain why calcium reacts more vigorously than magnesium with hydrochloric acid of the same concentration.</p>",
 "Calcium's outer electrons are further from the nucleus (it has more shells, so they are more shielded), so they are less strongly attracted to the nucleus, so positive ions are formed more easily — the electrons are more easily lost", ""),
]

# ---- the paper says what it is out of, and so does every box down the margin ----
PER_QUESTION = {"1": 10, "2": 11, "3": 8, "4": 14, "5": 10, "6": 11, "7": 15, "8": 9, "9": 12}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())

# ---- every number the scheme prints inside its own working, recomputed here ----
assert 92.8 / 100 * 12.5 == 11.6
assert round((37.6 + 37.2 + 37.8 + 37.4) / 4, 2) == 37.5
assert round((37.8 - 37.2) / 2, 2) == 0.3
assert 3 * 56 + 4 * 16 == 232 and round(168 / 232 * 100, 5) == 72.41379
assert 40000 / 160 == 250 and 250 * 3 / 2 == 375 and 375 * 24 == 9000
assert 2 * 347 + 5 * 498 == 3184 and 6 * 805 + 8 * 464 == 8542
assert 8542 - 3184 - 2219 == 3139 and round(3139 / 8, 3) == 392.375
assert round(0.0045 / 0.15, 4) == 0.03
assert 0.12 / 0.18 == 2 / 3
# and the scale Figure 3 was measured on: the scheme's own crossing point is the fifth cross
assert (0.80, 47.0) in FIG3 and len(FIG3) == 8

d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 5

rows = []
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-8462-2406-1H-%02d%s' % (int(q), part), kind='question',
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
