#!/usr/bin/env python3
"""AQA GCSE Chemistry 8462/2H, June 2024 — 47 question rows into data/questions.json.

WHY THIS IS A SCRIPT AND NOT A HAND EDIT. CLAUDE.md: "Every number in a transcription is checked
against the paper's own stated total ... and the insert script asserts it before writing a row."
The cover says 100 and the margin boxes say 10, 8, 9, 13, 12, 11, 8, 13, 16. Both are asserted
below, and so is every intermediate the scheme prints inside its own working.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Higher)_ Paper 2 - June 2024 (1).pdf`, which is AQA's
own 8462/2H scheme — read, not derived.

NOTHING IS DRAWN ON THIS PAPER, AND THAT IS A DECISION RATHER THAN A GAP. Its eleven figures are a
Haber-process flow diagram, a water-treatment flow diagram, two chromatograms, a bicycle, a
displayed formula, apparatus, two measuring cylinders and three graphs — and not one of them is a
picture the row's own words determine. The two rate graphs are the sharp case: 09.3 is "draw a
tangent on Figure 12", and a curve redrawn by eye is exactly what CLAUDE.md warns about under the
cumulative-frequency curve that "gave 50 at 160 cm where the pixels said 48.1". So every figure
carries `figure` (so `check-library.js` counts it in the backlog) and what it SHOWS is written into
the question in words, with the numbers the scheme itself quotes: 25 and 39 cm3 off the two
cylinders in Figure 11, the plateau at 0.0168 mol on Figure 12, half of it on Figure 13.

A QUESTION ABOUT A PICTURE YOU CANNOT SEE IS NOT A QUESTION. That is why the descriptions are not
optional decoration — which spot is higher in Experiment 2, which way the yield goes with
temperature, where compound A's double bond sits. It is the same fault as "on the app it's just
text", one paper along.
"""
import json, datetime, pathlib

PAPER = 'P-AQA-8462-2406-2H'
DOC = dict(paper_id=PAPER, subject='Chemistry', key_stage='KS4', band_type='stage',
           band_value='GCSE', tier='Higher', level='GCSE', company='AQA', exam_board='AQA',
           spec_code='8462/2H', exam_wave='First wave', year='2024', month='6', paper='2',
           exam_date='2024-06-11', document_type='Past paper', name='Paper 2 — June 2024',
           active='True', trackable='True', printable='False')

RT = 'The Rate and Extent of Chemical Change'
OR = 'Organic Chemistry'
AN = 'Chemical Analysis'
AT = 'Chemistry of the Atmosphere'
UR = 'Using Resources'
QC = 'Quantitative Chemistry'

T1 = ('<table><tr><th>Concentration of sodium chloride in g/dm<sup>3</sup></th><th>Trial 1</th>'
      '<th>Trial 2</th><th>Trial 3</th><th>Trial 4</th></tr><tr><td></td><td>35.2</td><td>34.6</td>'
      '<td>36.4</td><td>33.8</td></tr></table>')
T2 = ('<table><tr><th>Fuel</th><th>Hydrogen</th><th>Natural gas</th></tr>'
      '<tr><td>Energy released in kJ</td><td>11.9</td><td>37.1</td></tr>'
      '<tr><td>Mass of carbon dioxide produced in grams</td><td>0.00</td><td>1.83</td></tr>'
      '<tr><td>Mass of water vapour produced in grams</td><td>0.75</td><td>1.50</td></tr>'
      '<tr><td>Mass of oxides of nitrogen produced in grams</td><td>6.6 × 10<sup>−4</sup></td>'
      '<td>4.9 × 10<sup>−4</sup></td></tr></table>')
T3 = ('<table><tr><th>Material</th><th>Aluminium alloy</th><th>Bamboo</th></tr>'
      '<tr><td>Raw material</td><td>aluminium ore</td><td>bamboo plant</td></tr>'
      '<tr><td>Cost of frame in £</td><td>250</td><td>1500</td></tr>'
      '<tr><td>Strength in arbitrary units</td><td>290</td><td>193</td></tr>'
      '<tr><td>Mass in kilograms</td><td>1.6</td><td>2.4</td></tr>'
      '<tr><td>Lifespan in years</td><td>6–10</td><td>10–15</td></tr>'
      '<tr><td>One method of disposal at end of life</td><td>recycled to make new products</td>'
      '<td>burned to produce heat energy</td></tr></table>')

METHOD1 = ("<p>The student determined the concentration of sodium chloride in the salt solution. "
           "This is the method used.</p><ol><li>Weigh an empty evaporating dish.</li><li>Add "
           "25.0 cm<sup>3</sup> of the salt solution into the evaporating dish.</li><li>Heat the "
           "evaporating dish and contents.</li><li>Weigh the evaporating dish and contents.</li>"
           "<li>Repeat steps 3 to 4 until there is no further change in mass.</li><li>Repeat "
           "steps 1 to 5 three more times.</li></ol>")
FIG4 = ("<p><b>Figure 4</b> shows two chromatography beakers side by side. In <b>Experiment 1</b> "
        "the solvent is water; the paper carries a start line near the bottom, a yellow spot about "
        "halfway up and a red spot below it, with the solvent front near the top. In "
        "<b>Experiment 2</b> the solvent is ethanol; the red spot is in much the same place, but "
        "the yellow spot has travelled noticeably further — it now sits just under the solvent "
        "front.</p>")
COMPOUND_A = ("<p><b>Figure 8</b> represents a molecule of compound <b>A</b>, drawn as a displayed "
              "formula: a CH<sub>2</sub>=CH— group at the top, whose lower carbon is joined "
              "through an oxygen to a carbon that carries a double-bonded oxygen, and that carbon "
              "is joined to a CH<sub>3</sub> group. Written along a line it is "
              "CH<sub>2</sub>=CH—O—C(=O)—CH<sub>3</sub>.</p>")

# (q, part, marks, answer_type, topics, figure, html, answer, examiner_note)
Q = [
("1","1",2,"short",AN,"", "<p>A student investigated an aqueous solution of a salt. The student identified that the salt solution contained only sodium ions and chloride ions.</p><p>Describe a test to identify sodium ions. Give the result of the test.</p>",
 "Test: a flame test. Result: a yellow flame. (Or: flame emission spectroscopy, and the lines match the sodium spectrum.)", ""),
("1","2",2,"short",AN,"", "<p>Describe a test to identify chloride ions. Give the result of the test.</p>",
 "Test: add acidified silver nitrate solution. Result: a white precipitate. The result mark depends on getting the test right.", ""),
("1","3",1,"short",UR,"", METHOD1 + "<p>Why did the student heat the evaporating dish and contents until the mass did not change?</p>",
 "To make sure all the water had evaporated", ""),
("1","4",1,"short",UR,"", "<p>How did the student calculate the mass of solid sodium chloride remaining after steps 1 to 5? Tick <b>one</b> box.</p><ul><li>Mass of 25 cm<sup>3</sup> of salt solution + mass of empty evaporating dish</li><li>Mass of 25 cm<sup>3</sup> of salt solution − mass of empty evaporating dish</li><li>Mass of evaporating dish and dry contents + mass of empty evaporating dish</li><li>Mass of evaporating dish and dry contents − mass of empty evaporating dish</li></ul>",
 "Mass of evaporating dish and dry contents − mass of empty evaporating dish", ""),
("1","5",4,"calculation",QC,"", "<p>The student calculated the concentration of sodium chloride in the salt solution. <b>Table 1</b> shows the results.</p>" + T1 + "<p>The percentage by mass of sodium ions in sodium chloride is 39.3%.</p><p>Calculate the mean concentration of sodium ions in the salt solution.</p>",
 "13.8 g/dm³. The mean concentration of sodium chloride is (35.2 + 34.6 + 36.4 + 33.8) ÷ 4 = 140 ÷ 4 = 35.0 g/dm³, and 35.0 × 39.3 ÷ 100 = 13.755, which rounds to 13.8.", ""),

("2","1",1,"short",UR,"diagram", "<p>This question is about ammonia and nitric acid. In the Haber process ammonia is produced from nitrogen and hydrogen. <b>Figure 1</b> is a flow diagram of the process: nitrogen and hydrogen enter a reactor, the mixture leaves it and passes through a condenser where liquid ammonia is drawn off, and a pipe <b>P</b> runs from the condenser back to the reactor.</p><p>Pipe <b>P</b> links the condenser to the reactor. Why is the condenser linked to the reactor? Use <b>Figure 1</b>.</p>",
 "To recycle the unreacted nitrogen and hydrogen back into the reactor",
 "Figure 1 is artwork in the PDF; what it shows is stated in the question."),
("2","2",1,"short",RT,"", "<p>Which metal is used as a catalyst in this reaction?</p>",
 "Iron", ""),
("2","3",2,"short",AN,"", "<p>Nitric acid is produced by reacting ammonia with oxygen. The word equation is:</p><p>ammonia + oxygen → water + nitric acid</p><p>Platinum is a catalyst in this reaction.</p><p>Describe the test for oxygen gas. Give the result if oxygen gas is present.</p>",
 "Test: put a glowing splint into the gas. Result: the splint relights. The result mark depends on getting the test right.", ""),
("2","4",2,"annotate",RT,"graph", "<p><b>Figure 2</b> represents the reaction profile of the catalysed reaction between ammonia and oxygen: energy up the side, progress of reaction along the bottom, a curve that starts at a dotted reactant level, rises to a peak and falls to a lower product level. Nothing on it is labelled.</p><p>Complete the reaction profile for the catalysed reaction in <b>Figure 2</b>. You should:</p><ul><li>label the activation energy</li><li>label the reactants and products, using the names of the reactants and products.</li></ul>",
 "Draw a labelled vertical arrow from the dotted reactant line up to the peak — that is the activation energy. Label the left-hand level 'ammonia and oxygen' and the right-hand level 'nitric acid and water' (formulae are accepted).",
 "Figure 2 is artwork in the PDF; what it shows is stated in the question."),
("2","5",1,"short",RT,"graph", "<p>How would <b>Figure 2</b> be different if no catalyst was used? Tick <b>one</b> box.</p><ul><li>The final energy level would be higher.</li><li>The final energy level would be lower.</li><li>The line would reach a higher peak.</li><li>The line would reach a lower peak.</li></ul>",
 "The line would reach a higher peak — without a catalyst the activation energy is larger", ""),
("2","6",1,"short",UR,"", "<p>Ammonia and nitric acid react to produce the salt, ammonium nitrate. Ammonium ions and nitrate ions both contain nitrogen.</p><p>Suggest <b>one</b> use of ammonium nitrate.</p>",
 "Fertiliser (explosives and sports injury packs are also accepted)", ""),

("3","1",2,"short",RT,"", "<p>This question is about water. Hydrogen gas reacts with oxygen gas to produce water. Water is decomposed into hydrogen gas and oxygen gas using electricity.</p><p>Which <b>two</b> words describe the reaction between hydrogen gas and oxygen gas? Tick <b>two</b> boxes.</p><ul><li>Alloying</li><li>Combustion</li><li>Corrosion</li><li>Endothermic</li><li>Reversible</li></ul>",
 "Combustion and reversible", ""),
("3","2",1,"short",RT,"", "<p>Water molecules break down into hydrogen ions and hydroxide ions. The equation for the reaction is:</p><p>H<sub>2</sub>O ⇌ H<sup>+</sup> + OH<sup>−</sup></p><p>Which sentence describes this reaction at equilibrium? Tick <b>one</b> box.</p><ul><li>Water molecules break down at a higher rate than they reform.</li><li>Water molecules break down and reform at the same rate.</li><li>Water molecules break down at a lower rate than they reform.</li></ul>",
 "Water molecules break down and reform at the same rate", ""),
("3","3",6,"written",UR,"diagram", "<p>Water collected from rivers is used in the home for drinking and flushing toilets. Water used in the home must be potable — safe to drink. Waste water produced after use in the home is called sewage.</p><p><b>Figure 3</b> is a flow diagram: water is taken from a river and goes through <b>Process A</b> before reaching the home, and the sewage leaving the home goes through <b>Process B</b> before returning to the river.</p><p>Explain what happens to water in <b>Process A</b> and in <b>Process B</b>. Do not refer to use of water in the home.</p>",
 "Level-marked out of 6, and Level 3 needs both halves. Process A — making water potable: pass the water through filter beds to remove solids, then sterilise it with chlorine, ozone or ultraviolet light to destroy microbes. Process B — treating waste water: screening through a metal grid to remove solids and grit, then sedimentation to separate sewage sludge from effluent, then anaerobic digestion of the sludge and aerobic biological treatment of the effluent.",
 "Figure 3 is artwork in the PDF; what it shows is stated in the question."),

("4","1",2,"explain",AN,"diagram", "<p>A student investigated an orange dye (<b>A</b>) using paper chromatography. " + FIG4[3:] + "<p>Explain why the yellow dye and red dye travel different distances in <b>Experiment 1</b>. Refer to forces of attraction between the dyes and the chromatography paper in your answer.</p>",
 "The yellow dye travels further because it has a weaker attraction to the chromatography paper (the stationary phase). 'The weaker the attraction to the paper, the further the dye travels' alone scores 1 of the 2.",
 "Figure 4 is artwork in the PDF; what it shows is stated in the question."),
("4","2",3,"explain",AN,"diagram", FIG4 + "<p>The student used the same type of chromatography paper in <b>Experiment 1</b> and in <b>Experiment 2</b>.</p><p>Explain why the yellow dye is in different positions in <b>Experiment 1</b> and in <b>Experiment 2</b>. Use <b>Figure 4</b>.</p>",
 "In Experiment 2 the yellow dye travels further, because the solvents are different, and the yellow dye is more soluble in (more attracted to) ethanol than water.",
 "Figure 4 is artwork in the PDF; what it shows is stated in the question."),
("4","3",2,"explain",AN,"diagram", "<p>The student investigated a different orange dye (<b>B</b>). <b>Figure 5</b> shows the results of <b>Experiment 3</b> using orange dye <b>B</b>: the same apparatus, and a <b>single</b> spot on the paper above the start line — where dye <b>A</b> had separated into two.</p><p>Compare the purity of the orange dyes <b>A</b> and <b>B</b>. Give reasons for your answer. Use <b>Figure 4</b> and <b>Figure 5</b>.</p>",
 "A is impure (a mixture) and B is pure, because A separates into two dyes — two spots — and B produces only one.",
 "Figure 5 is artwork in the PDF; what it shows is stated in the question."),
("4","4",3,"calculation",AN,"", "<p>The student calculated that the R<sub>f</sub> value of the orange dye in the experiment shown in <b>Figure 5</b> was 0.48.</p><p>Calculate the distance moved by the solvent front when the orange dye had moved 5.4 cm.</p>",
 "11.25 cm — 0.48 = 5.4 ÷ distance moved by solvent, so the distance is 5.4 ÷ 0.48", ""),
("4","5",1,"explain",AN,"", "<p>Why is the R<sub>f</sub> value of a dye not affected by how far the solvent front is allowed to travel?</p>",
 "Because the Rᶠ value is a ratio — the distance moved by the spot is directly proportional to the distance moved by the solvent, so the proportion stays the same", ""),
("4","6",2,"short",AN,"", "<p>Another type of chromatography is called gas chromatography. Gas chromatography is an instrumental method of chemical analysis. Scientists tested the orange dyes using gas chromatography.</p><p>Suggest <b>two</b> advantages of using the instrumental method of gas chromatography rather than paper chromatography.</p>",
 "Any two of: it is more sensitive; it is more accurate; it is faster; it needs a smaller sample; it gives greater resolution", ""),

("5","1",2,"explain",AT,"", "<p>This question is about burning fuels in central heating boilers.</p><p>Explain how oxides of nitrogen are produced when burning fuels.</p>",
 "The high temperatures in the flame cause nitrogen and oxygen from the air to react together", ""),
("5","2",2,"explain",AT,"", "<p>In the future, gas central heating boilers may burn hydrogen rather than natural gas. <b>Table 2</b> shows information about these fuels when 1 dm<sup>3</sup> of the fuel is burned in a central heating boiler.</p>" + T2 + "<p>Explain <b>one</b> positive impact on the environment of burning hydrogen rather than natural gas as a fuel. Use <b>Table 2</b>.</p>",
 "Less climate change (less global warming), because burning hydrogen produces no carbon dioxide — 0.00 g against 1.83 g", ""),
("5","3",2,"explain",AT,"", "<p>Explain <b>one</b> negative impact on the environment of burning hydrogen rather than natural gas as a fuel. Use <b>Table 2</b>.</p>",
 "More oxides of nitrogen are produced — 6.6 × 10⁻⁴ g against 4.9 × 10⁻⁴ g — so more acid rain, or more respiratory problems", ""),
("5","4",3,"calculation",QC,"", "<p>Air is 20% oxygen.</p><p>Calculate the volume of air needed to provide enough oxygen to react with 3.50 dm<sup>3</sup> of hydrogen gas. The equation for the reaction is</p><p>2 H<sub>2</sub> + O<sub>2</sub> → 2 H<sub>2</sub>O</p>",
 "8.75 dm³ — the equation needs half as much oxygen as hydrogen, so 3.50 × ½ = 1.75 dm³ of oxygen, and 1.75 × 100 ÷ 20 = 8.75 dm³ of air", ""),
("5","5",3,"explain",OR,"", "<p>Central heating boilers can also burn kerosene. Kerosene is produced from crude oil in a fractionating column using fractional distillation. In the first step, crude oil is heated and hydrocarbon vapours are formed.</p><p>Explain how kerosene is produced from these hydrocarbon vapours.</p>",
 "There is a temperature gradient in the fractionating column — it gets cooler going up — so the kerosene condenses at the level in the column that matches kerosene's boiling point range. Both of the last two marks need kerosene named.", ""),

("6","1",6,"written",UR,"diagram", "<p>This question is about materials used to make bicycles. <b>Figure 6</b> is a photograph of a bicycle. <b>Table 3</b> shows information about two materials used to make bicycle frames.</p>" + T3 + "<p>Evaluate the use of aluminium alloy and of bamboo for making bicycle frames. Use <b>Table 3</b>.</p>",
 "Level-marked out of 6, and Level 3 needs a reasoned judgement. For bamboo: it is renewable, it can be burned to give renewable heat and is carbon neutral, and the frame lasts longer (10–15 years against 6–10) — but it costs six times as much, is weaker (193 against 290), is heavier (2.4 kg against 1.6 kg) and growing it uses agricultural land. For aluminium alloy: it is cheaper, stronger, lighter — so the bicycle is faster and easier to carry — and it is recyclable, so the ore is conserved; but aluminium is a finite resource and mining the ore is polluting. Neither material need reach landfill.",
 "Figure 6 is a photograph in the PDF and is not transcribed."),
("6","2",2,"explain",UR,"", "<p>Explain why aluminium alloy bicycle frames do not need protection from corrosion.</p>",
 "Aluminium alloy has an oxide coating, which stops water and oxygen reaching the aluminium underneath. (Not sacrificial protection.)", ""),
("6","3",1,"short",UR,"", "<p>Bicycle chains are made from an alloy of iron. Bicycle chains rust without protection. Paint is not used to protect bicycle chains from rusting.</p><p>Suggest how bicycle chains can be protected from rusting.</p>",
 "Coat them with grease or oil (galvanising, or using stainless steel, is also accepted)", ""),
("6","4",2,"short",UR,"", "<p>Bicycle frames can also be made from a composite of carbon fibres embedded in a polymer resin.</p><p>What description is given in this composite to the carbon fibre component, and to the polymer resin component?</p>",
 "Carbon fibre: the reinforcement. Polymer resin: the matrix (or binder).", ""),

("7","1",2,"short",AN,"", "<p>This question is about sulfuric acid. Sulfuric acid contains sulfate ions.</p><p>Describe the test for the presence of sulfate ions in sulfuric acid. Give the result of the test.</p>",
 "Test: add barium chloride solution (barium nitrate is accepted). Result: a white precipitate. The result mark depends on getting the test right.", ""),
("7","2",1,"short",RT,"graph", "<p>One stage in the industrial production of sulfuric acid is the reaction of sulfur dioxide with oxygen to produce sulfur trioxide. This reversible reaction reaches dynamic equilibrium.</p><p><b>Figure 7</b> is a graph of the percentage yield of sulfur trioxide against temperature: the yield falls as the temperature rises.</p><p>Which statement about the forward reaction is correct? Use <b>Figure 7</b>. Tick <b>one</b> box.</p><ul><li>The yield is greater at higher temperatures because the reaction is exothermic.</li><li>The yield is greater at higher temperatures because the reaction is endothermic.</li><li>The yield is smaller at higher temperatures because the reaction is exothermic.</li><li>The yield is smaller at higher temperatures because the reaction is endothermic.</li></ul>",
 "The yield is smaller at higher temperatures because the reaction is exothermic",
 "Figure 7 is artwork in the PDF; the trend it shows is stated in the question."),
("7","3",2,"explain",RT,"", "<p>The equation for the reaction is:</p><p>2 SO<sub>2</sub>(g) + O<sub>2</sub>(g) ⇌ 2 SO<sub>3</sub>(g)</p><p>Explain why the percentage yield of sulfur trioxide in this reaction is greater if the pressure is higher.</p>",
 "There are more moles of gas on the left-hand side (3 against 2), so raising the pressure shifts the position of equilibrium to the right", ""),
("7","4",2,"explain",RT,"", "<p>In industry, the reaction is done at 450 °C and atmospheric pressure. Under these conditions the yield of sulfur trioxide is 86%.</p><p>Suggest <b>two</b> reasons why a higher pressure is not used.</p>",
 "Any two of: the yield is already high; more energy would be needed; the risk of explosion increases; the extra income from a higher yield is outweighed by the extra cost; stronger vessels and more safety precautions cost more", ""),
("7","5",1,"short",RT,"", "<p>This reaction uses a catalyst to increase the rate of the reaction. The catalyst is a metal oxide.</p><p>Which is the most likely metal in the metal oxide catalyst? Use the periodic table. Tick <b>one</b> box.</p><ul><li>Aluminium (Al)</li><li>Barium (Ba)</li><li>Potassium (K)</li><li>Vanadium (V)</li></ul>",
 "Vanadium (V) — it is the only transition metal in the list", ""),

("8","1",1,"annotate",OR,"diagram", "<p>This question is about monomers and polymers. Compound <b>A</b> has an alkene functional group and an ester functional group.</p>" + COMPOUND_A + "<p>Draw a circle around the alkene functional group on <b>Figure 8</b>.</p>",
 "Circle the C=C double bond at the top of the molecule, with the two carbons and the bond between them inside the circle",
 "Figure 8 is artwork in the PDF; the structure is written out in the question."),
("8","2",2,"short",OR,"", "<p>Describe what will be seen when compound <b>A</b> is shaken with bromine water.</p>",
 "The orange bromine water turns colourless (is decolourised). 'Clear' is not enough.", ""),
("8","3",1,"annotate",OR,"diagram", "<p><b>Figure 9</b> is a repeat of <b>Figure 8</b>.</p><p>Draw a circle around the ester functional group on <b>Figure 9</b>.</p>",
 "Circle the —O—C(=O)— group in the middle of the molecule: the single-bonded oxygen, the carbon it joins, and that carbon's double-bonded oxygen",
 "Figure 9 is artwork in the PDF; the structure is written out at 08.1."),
("8","4",3,"calculation",OR,"", "<p>Compound <b>A</b> has the formula C<sub>4</sub>H<sub>6</sub>O<sub>2</sub>. Compound <b>A</b> is flammable.</p><p>Write a balanced equation for the complete combustion of compound <b>A</b>.</p>",
 "2 C₄H₆O₂ + 9 O₂ → 8 CO₂ + 6 H₂O (multiples are accepted). Getting the reactants right with wrong numbers, or the products right with wrong numbers, scores 1 each.", ""),
("8","5",2,"annotate",OR,"diagram", "<p>Many molecules of compound <b>A</b> join together to form polymer <b>B</b>.</p><p>Complete the displayed formula equation which represents this reaction — the monomer on the left with an <i>n</i> in front of it, and the repeating unit in brackets on the right.</p>",
 "Draw the repeating unit with a SINGLE C—C bond where the monomer had the double bond — the rest of the molecule unchanged, and trailing bonds out of each end carbon with no extra atoms on them — and write n after the closing bracket.",
 "The answer is a drawing in the mark scheme; it is described rather than reproduced."),
("8","6",1,"short",OR,"", "<p>What type of polymer is polymer <b>B</b>? Tick <b>one</b> box.</p><ul><li>Addition polymer</li><li>Condensation polymer</li><li>DNA</li><li>Protein</li></ul>",
 "Addition polymer", ""),
("8","7",1,"short",UR,"", "<p>Polymer <b>B</b> is a polymer which melts when heated.</p><p>What word is used to describe polymers which melt when heated?</p>",
 "Thermosoftening (thermoplastic is accepted)", ""),
("8","8",2,"explain",UR,"", "<p>Explain why some polymers do not melt when heated.</p>",
 "They have cross-links — covalent bonds — between the polymer chains, and too much energy would be needed to overcome them", ""),

("9","1",2,"explain",RT,"diagram", "<p>A student investigated the rate of the reaction between zinc and sulfuric acid. The equation for the reaction is</p><p>Zn(s) + H<sub>2</sub>SO<sub>4</sub>(aq) → ZnSO<sub>4</sub>(aq) + H<sub>2</sub>(g)</p><p><b>Figure 10</b> shows the apparatus: a stoppered conical flask with a delivery tube running into an inverted 50 cm<sup>3</sup> measuring cylinder standing in a trough of water. This is the method used.</p><ol><li>Pour 50 cm<sup>3</sup> of sulfuric acid into the conical flask.</li><li>Add excess zinc to the conical flask.</li><li>Insert the stopper and start a timer.</li><li>Measure the volume of hydrogen collected in the 50 cm<sup>3</sup> measuring cylinder every 20 seconds for 180 seconds.</li></ol><p>Explain why the volume of hydrogen collected in the measuring cylinder is less than the volume of hydrogen produced.</p>",
 "Some hydrogen escapes from the flask, because the reaction starts before the stopper is put in — the stopper cannot be inserted instantly. (One mark alone: some air from the flask is collected, or some hydrogen stays in the flask or the delivery tube.)",
 "Figure 10 is artwork in the PDF; what it shows is stated in the question."),
("9","2",4,"calculation",QC,"diagram", "<p><b>Figure 11</b> shows the two measuring cylinders: after 40 seconds it reads <b>25 cm<sup>3</sup></b>, and after 100 seconds it reads <b>39 cm<sup>3</sup></b>.</p><p>Determine the number of moles of hydrogen collected between 40 seconds and 100 seconds. The volume of one mole of any gas at room temperature and pressure is 24 dm<sup>3</sup>.</p>",
 "5.8 × 10⁻⁴ mol. The volume collected is 39 − 25 = 14 cm³, which is 0.014 dm³, and 0.014 ÷ 24 = 5.8333… × 10⁻⁴.",
 "Figure 11 is artwork in the PDF; the two readings are the mark scheme's own."),
("9","3",5,"calculation",RT,"graph", "<p>A different student investigated how the concentration of sulfuric acid affected the rate of the reaction, using sulfuric acid of concentration 0.40 mol/dm<sup>3</sup>, and calculated the number of moles of hydrogen collected after every 20 seconds.</p><p><b>Figure 12</b> shows the results: moles of hydrogen collected up the side against time in seconds along the bottom. The curve climbs steeply from the origin, passes about 0.0140 mol at 50 seconds, bends over, and levels off at about 0.0168 mol from roughly 140 seconds onwards.</p><p>Determine the rate of reaction at 45 seconds. You should draw a tangent on <b>Figure 12</b>. Give your answer in standard form.</p>",
 "Draw a tangent to the curve at 45 s, read a y step and an x step off it, and divide — rate = y step ÷ x step, then write the answer in standard form in mol/s. The scheme marks the tangent, the two readings, the division, the calculation and the standard form separately, and allows a correct calculation from a tangent drawn slightly differently.",
 "Figure 12 is a graph in the PDF and is not transcribed; the readings quoted are off the printed curve."),
("9","4",2,"drawing",RT,"graph", "<p><b>Figure 13</b> shows the results for 0.40 mol/dm<sup>3</sup> sulfuric acid — the same curve as <b>Figure 12</b>, levelling off at about 0.0168 mol.</p><p>The student repeated the experiment using 0.20 mol/dm<sup>3</sup> sulfuric acid instead. Excess zinc was used in each experiment.</p><p>Sketch a line on <b>Figure 13</b> to show the results you would expect.</p>",
 "A line starting at the origin, less steep than the one already drawn, levelling off at 0.0084 mol — half the final value, because there is half as much acid and the zinc is in excess in both.",
 "Figure 13 is a graph in the PDF and is not transcribed."),
("9","5",3,"explain",RT,"", "<p>Explain how increasing the temperature would affect the rate of reaction between zinc and sulfuric acid.</p>",
 "It increases the rate, because the particles have more energy and move faster, so the frequency of collisions increases — and a greater proportion of collisions have enough energy to react", ""),
]

# ---- the paper says what it is out of, and so does every box down the margin ----
PER_QUESTION = {"1": 10, "2": 8, "3": 9, "4": 13, "5": 12, "6": 11, "7": 8, "8": 13, "9": 16}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())

# ---- every number the scheme prints inside its own working, recomputed here ----
assert 35.2 + 34.6 + 36.4 + 33.8 == 140.0 and 140.0 / 4 == 35.0
assert round(35.0 * 39.3 / 100, 3) == 13.755
assert round(5.4 / 0.48, 2) == 11.25
assert 3.50 * 0.5 == 1.75 and 1.75 * 100 / 20 == 8.75
assert 39 - 25 == 14 and round(0.014 / 24, 9) == 5.83333e-4
assert round(0.0168 / 2, 4) == 0.0084          # the plateau 09.4 asks you to sketch to
# 2 C4H6O2 + 9 O2 -> 8 CO2 + 6 H2O, balanced element by element
assert 2 * 4 == 8 * 1                          # carbon
assert 2 * 6 == 6 * 2                          # hydrogen
assert 2 * 2 + 9 * 2 == 8 * 2 + 6 * 1          # oxygen

d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 6

rows = []
for q, part, marks, atype, topics, figure, html, answer, note in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-8462-2406-2H-%02d%s' % (int(q), part), kind='question',
             question=q, part=part, section='', marks=str(marks), html=html,
             answer=answer, answer_type=atype, topics=topics, figure=figure,
             diagram='', diagram_by='', placeholder='')
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
