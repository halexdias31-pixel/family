#!/usr/bin/env python3
"""AQA GCSE Biology 8461/1F, June 2024 — 58 question rows into data/questions.json.

WHY THIS IS A SCRIPT AND NOT A HAND EDIT. CLAUDE.md: "Every number in a transcription is checked
against the paper's own stated total ... and the insert script asserts it before writing a row."
The cover says 100 and the margin boxes say 12, 8, 10, 14, 14, 14, 14, 14. Both are asserted below,
and so is every intermediate the scheme prints.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Foundation)_ Paper 1 - June 2024.pdf`, which is AQA's
own 8461/1F scheme — read, not derived.

FIGURE 2 IS THE ONE PICTURE NOBODY CAN HAVE, AND THE PDF SAYS SO ITSELF. In place of the phloem
photograph AQA prints "Figure 2 cannot be reproduced here due to third-party copyright
restrictions" and names the journal it came from. That is the same fact as the AQA English insert
this repository already records — a source that is not in the paper and cannot be in a public
repository either — so the row carries what the figure is OF and says where it came from, and
nothing pretends to be the picture.

ONE FIGURE IS DRAWN. Figure 6 is the blank grid 07.7 asks you to finish: label the y-axis, choose a
scale, plot the four bars, label them, with the bar for disease E already drawn at 14%. A grid and
one bar is a drawing instruction with exactly one answer, and with it here `padSource_` lays a pen
over it and the question can be done on a phone. The rest — a leaf cross-section, two line graphs,
a pie chart of the cell cycle, a dividing cell, a body outline lettered A to F — are artwork, and
what each SHOWS is written into its question, never what the answer is: Figure 4's rim is described
as ten equal ticks with four of them under the growth sector, because "40%" is 05.4's answer and not
its picture.
"""
import json, datetime, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import W

PAPER = 'P-AQA-8461-2406-1F'
DOC = dict(paper_id=PAPER, subject='Biology', key_stage='KS4', band_type='stage',
           band_value='GCSE', tier='Foundation', level='GCSE', company='AQA', exam_board='AQA',
           spec_code='8461/1F', exam_wave='First wave', year='2024', month='5', paper='1',
           exam_date='2024-05-10', document_type='Past paper', name='Paper 1 — June 2024',
           active='True', trackable='True', printable='False')

CB = 'Cell Biology'; OG = 'Organisation'; IR = 'Infection & Response'; BE = 'Bioenergetics'

# ---------------------------------------------------------------------------------------------
# FIGURE 6 — the blank grid, with disease E's bar already on it. Ten major columns by fifteen, five
# minor to a major, exactly as the printed sheet: at the scale the scheme asks for (1 cm = 5%) that
# is 0 to 75%, which is what the tallest bar, disease H at 70%, needs. The y-axis is deliberately
# unlabelled and unscaled, because labelling and scaling it is two of the four marks.
# ---------------------------------------------------------------------------------------------
COLS, ROWS, CELL = 10, 15, 29
def fig6():
    L, T = 40, 12
    R, B = L + COLS * CELL, T + ROWS * CELL
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="Blank graph grid with one bar, labelled '
         'E, already plotted">' % (W, B + 26)]
    for i in range(COLS * 5 + 1):
        x = L + i * CELL / 5.0
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>' % (x, T, x, B))
    for i in range(ROWS * 5 + 1):
        y = T + i * CELL / 5.0
        p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"/>' % (L, y, R, y))
    for i in range(COLS + 1):                                   # the major (centimetre) lines
        x = L + i * CELL
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width=".9" '
                 'opacity=".75"/>' % (x, T, x, B))
    for i in range(ROWS + 1):
        y = T + i * CELL
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width=".9" '
                 'opacity=".75"/>' % (L, y, R, y))
    h = 14 / 5.0 * CELL                                          # E is 14%, and one square is 5%
    p.append('<rect x="%d" y="%.1f" width="%d" height="%.1f" fill="currentColor" '
             'fill-opacity=".25" stroke="currentColor" stroke-width="1.2"/>'
             % (L + CELL, B - h, CELL, h))
    p.append('<text x="%.1f" y="%d" class="lbl" style="text-anchor:middle">E</text>'
             % (L + CELL * 1.5, B + 18))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    return ''.join(p) + '</svg>'

T1 = ('<table><tr><th>Time in hours</th><th>pH1</th><th>pH2</th><th>pH3</th><th>pH5</th></tr>'
      '<tr><td>0</td><td>210</td><td>210</td><td>210</td><td>216</td></tr>'
      '<tr><td>24</td><td>23</td><td><b>X</b></td><td>63</td><td>185</td></tr></table>')
T2 = ('<table><tr><th>Type of bread</th><th>Time taken for bread to taste sweet in seconds</th>'
      '</tr><tr><td>Brown</td><td>43</td></tr><tr><td>White</td><td>35</td></tr>'
      '<tr><td>Wholemeal</td><td>57</td></tr></table>')
T3 = ('<table><tr><th>Type of bread</th><th>Test 1</th><th>Test 2</th><th>Test 3</th><th>Mean</th>'
      '</tr><tr><td>Brown</td><td>38</td><td>43</td><td>45</td><td>42</td></tr>'
      '<tr><td>White</td><td>35</td><td>31</td><td>39</td><td>35</td></tr>'
      '<tr><td>Wholemeal</td><td>58</td><td>55</td><td>61</td><td><b>X</b></td></tr></table>')
T4 = ('<table><tr><th>Piece of potato</th><th>Concentration of salt solution in mol/dm<sup>3</sup>'
      '</th><th>Mass at start in g</th><th>Mass after 20 minutes in g</th><th>Change in g</th>'
      '<th>Percentage (%) change in mass</th></tr>'
      '<tr><td>A</td><td>0.1</td><td>6.2</td><td>6.5</td><td>+ 0.3</td><td>+ 4.8</td></tr>'
      '<tr><td>B</td><td>0.3</td><td>6.8</td><td>6.5</td><td>− 0.3</td><td>− 4.4</td></tr>'
      '<tr><td>C</td><td>0.5</td><td>6.5</td><td>5.8</td><td>− 0.7</td><td>− 10.8</td></tr>'
      '<tr><td>D</td><td>0.7</td><td>6.0</td><td>4.9</td><td>− 1.1</td><td><b>X</b></td></tr>'
      '</table>')
T5 = ('<table><tr><th>Cardiovascular disease</th><th>Percentage (%) increase in risk compared to '
      'people who have never smoked</th></tr><tr><td>E</td><td>14</td></tr>'
      '<tr><td>F</td><td>20</td></tr><tr><td>G</td><td>29</td></tr><tr><td>H</td><td>70</td></tr>'
      '</table>')

FIG1 = ("<b>Figure 1</b> is a labelled cross-section through a leaf, showing the upper epidermis, "
        "the palisade mesophyll below it, the spongy mesophyll with its air spaces, the lower "
        "epidermis with its pores, and a vein carrying xylem and phloem.")
METHOD2 = ("<p>The stomach contains acid to kill pathogens. A scientist investigated the effect of "
           "acid on the survival of bacteria. This is the method used.</p><ol><li>Prepare four "
           "test tubes each with 10 cm<sup>3</sup> of culture solution.</li><li>Use acid to adjust "
           "the pH of the solutions to be pH1, pH2, pH3 and pH5.</li><li>Add 1 cm<sup>3</sup> of "
           "bacteria mixture to each test tube.</li><li>Take a 0.1 cm<sup>3</sup> sample from each "
           "test tube and record the number of live bacteria.</li><li>Keep the test tubes at "
           "37 °C for 24 hours.</li><li>Repeat step 4.</li></ol><p><b>Table 1</b> shows some of "
           "the results.</p>" + T1)
FIG3 = ("<p><b>Figure 3</b> is a pair of graphs sharing a year axis from 1940 to about 2015. The "
        "top graph is the percentage of children vaccinated: it is zero until 1968, climbs steeply "
        "to about 54% by 1972, runs roughly level to about 1977, climbs again to about 92% by 1995, "
        "dips to about 80% in the early 2000s and recovers to about 85%. The bottom graph is the "
        "number of people with measles in thousands: about 330 in 1940, rising to about 490 by "
        "1950, level at about 490 until 1968, then falling steeply to about 120 by 1978 and on "
        "down to almost nothing by 2000.</p>")
METHOD6 = ("<p>A student investigated the effect of different concentrations of salt solution on "
           "the mass of uncooked pieces of potato. This is the method used.</p><ol><li>Cut four "
           "pieces of a potato to the same size.</li><li>Record the mass of each piece of potato."
           "</li><li>Put one of the pieces of potato into a beaker containing 100 cm<sup>3</sup> "
           "of 0.1 mol/dm<sup>3</sup> salt solution.</li><li>Repeat step 3 using the other pieces "
           "of potato, each in a different concentration of salt solution.</li><li>After 20 "
           "minutes, remove the pieces of potato from the solutions.</li><li>Record the mass of "
           "each piece of potato.</li></ol>")

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",1,"short",OG,"", "", "<p>Plants are made of different tissues.</p><p>Which term describes a group of tissues working together? Tick <b>one</b> box.</p><ul><li>Organ</li><li>Organism</li><li>Organ system</li></ul>",
 "Organ", ""),
("1","2",2,"short",OG,"diagram","", "<p>" + FIG1 + "</p><p>Draw <b>one</b> line from each leaf tissue to an important feature of the tissue.</p><p>Leaf tissues: <b>Palisade mesophyll</b>, <b>Spongy mesophyll</b>.<br>Features: contains many air spaces; contains the most chloroplasts; made of dead cells.</p>",
 "Palisade mesophyll → contains the most chloroplasts. Spongy mesophyll → contains many air spaces. (No more than one line may leave a box on the left.)",
 "Figure 1 is artwork in the PDF; what it shows is stated in the question."),
("1","3",1,"short",OG,"", "", "<p>Xylem tissue transports water to the leaves.</p><p>Which term describes the loss of water from the leaves? Tick <b>one</b> box.</p><ul><li>Photosynthesis</li><li>Respiration</li><li>Transpiration</li></ul>",
 "Transpiration", ""),
("1","4",1,"short",OG,"", "", "<p>Which substance strengthens xylem tissue? Tick <b>one</b> box.</p><ul><li>Glucose</li><li>Lignin</li><li>Starch</li></ul>",
 "Lignin", ""),
("1","5",2,"explain",OG,"diagram","", "<p>The upper epidermis is transparent.</p><p>Explain why the upper epidermis needs to be transparent. Use <b>Figure 1</b>.</p>",
 "So that light can reach the palisade and spongy mesophyll below it — the layers with the chloroplasts — for photosynthesis",
 "Figure 1 is artwork in the PDF; what it shows is stated at 01.2."),
("1","6",2,"short",OG,"", "", "<p>Complete the sentences. Choose answers from the box: <i>chloroplasts &nbsp; guard cells &nbsp; meristems &nbsp; stomata</i></p><p>The pores in the lower epidermis of a leaf are called ............... .<br>The opening and closing of the pores in the lower epidermis is controlled by ............... .</p>",
 "stomata; guard cells — in that order", ""),
("1","7",1,"short",CB,"diagram","", "<p><b>Figure 2</b> is a photograph of two cells from phloem tissue, labelled cell <b>X</b> and cell <b>Y</b>, with a part <b>A</b> marked inside one of them. Part <b>A</b> contains cell sap.</p><p>Name part <b>A</b> in <b>Figure 2</b>.</p>",
 "The (permanent) vacuole",
 "Figure 2 is a third-party photograph. AQA's own paper prints in its place: “Figure 2 cannot be reproduced here due to third-party copyright restrictions”, and names the source as Bentwood and Cronshaw, ‘Cytochemical Localization of Adenosine Triphosphatase in the Phloem of Pisum sativum and its Relation to the Function of Transfer Cells’, Planta Vol. 2, pp. 111–120."),
("1","8",1,"short",CB,"", "", "<p>Sugars move from cell <b>Y</b> into cell <b>X</b> against the concentration gradient. Energy is needed to move sugars against the concentration gradient.</p><p>Which process moves sugars against the concentration gradient? Tick <b>one</b> box.</p><ul><li>Active transport</li><li>Diffusion</li><li>Osmosis</li></ul>",
 "Active transport", ""),
("1","9",1,"short",CB,"", "", "<p>Which cell structures are needed to provide energy to move sugars? Tick <b>one</b> box.</p><ul><li>Chloroplasts</li><li>Chromosomes</li><li>Mitochondria</li></ul>",
 "Mitochondria", ""),

("2","1",1,"short",IR,"", "", "<p>Pathogens cause disease.</p><p>How does the skin defend the human body against pathogens?</p>",
 "It is a physical barrier — it stops pathogens entering the body. (Producing antimicrobial secretions, oil, sebum or sweat is also accepted.)", ""),
("2","2",2,"calculation",IR,"", "", METHOD2 + "<p>What fraction of the bacteria present at 0 hours for pH3 survived for 24 hours? Give your answer in its simplest form.</p>",
 "3/10 — 63 out of 210, which cancels to 3/10 (0.3 is accepted; 30% is ignored). Getting to 63/210 alone scores 1.", ""),
("2","3",3,"calculation",IR,"", "", "<p>How many more bacteria were killed at pH1 than at pH5 in 24 hours? Complete the following steps: calculate the number killed at pH1; calculate the number killed at pH5; calculate how many more were killed at pH1 than at pH5.</p>",
 "156. At pH1, 210 − 23 = 187 killed. At pH5, 216 − 185 = 31 killed. 187 − 31 = 156.", ""),
("2","4",2,"explain",IR,"", "", "<p>A student calculated value <b>X</b> in <b>Table 1</b> to be 43.</p><p>Suggest how the student calculated this value.</p>",
 "The student took the midpoint between the pH1 and pH3 values, 23 and 63: (63 − 23) ÷ 2 = 20, and 23 + 20 = 43 — or (23 + 63) ÷ 2 = 43 directly. Plotting the data and reading off pH2 is also accepted.", ""),

("3","1",2,"short",IR,"", "", "<p>Measles is caused by a virus. The measles vaccine is given to children to prevent them becoming ill with measles.</p><p>Draw <b>one</b> line from each blood component to its function when someone is vaccinated against measles.</p><p>Blood components: <b>Platelets</b>, <b>White blood cells</b>.<br>Functions: help clot the blood where the vaccine was injected; produce antibodies to the measles virus; produce the measles skin rash; transport oxygen to the measles virus.</p>",
 "Platelets → help clot the blood where the vaccine was injected. White blood cells → produce antibodies to the measles virus.", ""),
("3","2",1,"short",IR,"graph", "", FIG3 + "<p>What year was the measles vaccine first used? Use <b>Figure 3</b>.</p>",
 "1968 (1969 is accepted)",
 "Figure 3 is a graph in the PDF; what it shows is stated in the question."),
("3","3",3,"explain",IR,"graph", "", "<p>Describe the trend in the number of people with measles from 1945 to 1975. Use <b>Figure 3</b>.</p>",
 "It increases, then levels off (reaching a maximum between about 1956 and 1968), then decreases. An overall decrease alone scores 1 of the 3.",
 "Figure 3 is a graph in the PDF; what it shows is stated at 03.2."),
("3","4",1,"short",IR,"graph", "", "<p>In 1998, a scientific paper was published suggesting a link between condition <b>X</b> and one type of measles vaccine.</p><p>What happened to the percentage of children vaccinated against measles after the scientific paper was published in 1998? Use <b>Figure 3</b>.</p>",
 "It decreased — from about 92% to about 80% — and then increased again", ""),
("3","5",1,"short",IR,"", "", "<p>Why might the claims made in the scientific paper have affected the percentage of children vaccinated? Tick <b>one</b> box.</p><ul><li>The measles pathogen did not exist in the UK anymore.</li><li>Parents were worried their children would get condition X.</li><li>The health service in the UK did not have any vaccines.</li></ul>",
 "Parents were worried their children would get condition X", ""),
("3","6",1,"short",IR,"", "", "<p>In 2010, the scientific paper linking condition <b>X</b> and the measles vaccine was shown to be based on false claims.</p><p>What should scientists do with scientific research to help detect false claims? Tick <b>one</b> box.</p><ul><li>Have the research peer reviewed.</li><li>Publish the research on the internet.</li><li>Send a research questionnaire to the public.</li></ul>",
 "Have the research peer reviewed", ""),
("3","7",1,"explain",IR,"", "", "<p>The person who wrote the scientific paper was paid to research the link between condition <b>X</b> and the measles vaccine.</p><p>Why are the claims in the scientific paper likely to be considered not valid?</p>",
 "Any one of: the author was biased; the author was influenced by money; the research was not peer reviewed; there was not enough evidence; the sample size was small. (Simply 'the author was paid' is ignored.)", ""),

("4","1",4,"written",OG,"", "", "<p>Starch and sugar are two types of carbohydrate.</p><p>Describe the chemical tests that a student could use to show if bread contains starch, and if it contains sugar. You should include the results of a positive test and a negative test for each type of carbohydrate.</p>",
 "Level-marked out of 4, and Level 2 needs both tests. Starch: add iodine solution — it turns blue-black if starch is present, and stays yellow, orange or brown if it is not. Sugar: add Benedict's solution and heat to at least 60 °C — it turns green, yellow, orange or brick red if sugar is present, and stays blue if it is not.", ""),
("4","2",2,"short",OG,"", "", "<p>A student investigated three types of bread. For each type the student put a square piece of bread into their mouth, did not chew it, and recorded the time taken for the bread to taste sweet. <b>Table 2</b> shows the results.</p>" + T2 + "<p>Complete the sentences. Choose answers from the box: <i>amylase &nbsp; fat &nbsp; lipase &nbsp; protease &nbsp; sugar</i></p><p>The starch in the bread was broken down by the enzyme ............... .<br>The enzyme broke down the starch into ............... .</p>",
 "amylase; sugar — in that order", ""),
("4","3",1,"short",OG,"", "", "<p>What was the independent variable in the investigation? Tick <b>one</b> box.</p><ul><li>The size of the piece of bread</li><li>The temperature of the mouth</li><li>The type of bread</li></ul>",
 "The type of bread", ""),
("4","4",2,"explain",OG,"", "", "<p>Give <b>two</b> conclusions that can be made from the results in <b>Table 2</b>.</p>",
 "Any two of: white bread tastes sweet in the least time; wholemeal bread takes the most time to taste sweet; brown bread takes more time than white bread to taste sweet. Any correct comparison of two breads scores one mark.", ""),
("4","5",2,"explain",OG,"", "", "<p>The student improved the investigation. <b>Table 3</b> shows the results.</p>" + T3 + "<p>What did the student do to improve the investigation? Use <b>Table 2</b> and <b>Table 3</b>.</p>",
 "Repeated each type of bread (three times) and calculated a mean", ""),
("4","6",2,"calculation",OG,"", "", "<p>Calculate value <b>X</b> in <b>Table 3</b>.</p>",
 "58 seconds — (58 + 55 + 61) ÷ 3 = 174 ÷ 3", ""),
("4","7",1,"short",OG,"", "", "<p>Why should the student do the investigation with more people? Tick <b>one</b> box.</p><ul><li>Each person's sense of taste is different.</li><li>More people would make the investigation safer.</li><li>There are many different types of bread.</li></ul>",
 "Each person's sense of taste is different", ""),

("5","1",2,"short",OG,"", "", "<p>Cancer occurs when there is uncontrolled cell division.</p><p>Which <b>two</b> factors can cause cancer? Tick <b>two</b> boxes.</p><ul><li>Antibiotics</li><li>Ionising radiation</li><li>Monoclonal antibodies</li><li>Salmonella</li><li>Viruses</li></ul>",
 "Ionising radiation and viruses", ""),
("5","2",1,"short",CB,"", "", "<p>What type of cell division occurs in cancerous cells? Tick <b>one</b> box.</p><ul><li>Binary fission</li><li>Fertilisation</li><li>Mitosis</li></ul>",
 "Mitosis", ""),
("5","3",2,"short",CB,"", "", "<p>Complete the sentences. Choose answers from the box: <i>decrease &nbsp; fertilise &nbsp; grow &nbsp; replicate</i></p><p>Before a cell divides, the cell needs to ............... .<br>Before a cell divides, the DNA in the nucleus needs to ............... .</p>",
 "grow; replicate — in that order", ""),
("5","4",1,"short",CB,"diagram","", "<p><b>Figure 4</b> shows the cell cycle as a pie chart with an arrow running clockwise round the rim. The rim carries ten equally spaced tick marks. The <b>Cell growth stage</b> sector spans four of them, the <b>Copying of chromosomes stage</b> sector spans five, and a small dark sector labelled <b>Stage X</b> spans one.</p><p>What percentage of the time taken for the cell cycle does the cell growth stage take? Use <b>Figure 4</b>. Tick <b>one</b> box.</p><ul><li>10%</li><li>20%</li><li>40%</li><li>90%</li></ul>",
 "40% — four of the ten equal divisions",
 "Figure 4 is artwork in the PDF; what it shows is stated in the question."),
("5","5",1,"short",CB,"diagram","", "<p>What happens during stage <b>X</b> of the cell cycle in <b>Figure 4</b>? Tick <b>one</b> box.</p><ul><li>Chromosomes are pulled to each end of the cell.</li><li>The cell increases in size and mass.</li><li>The number of mitochondria increases.</li></ul>",
 "Chromosomes are pulled to each end of the cell — Stage X is mitosis itself, the shortest part of the cycle",
 "Figure 4 is artwork in the PDF; what it shows is stated at 05.4."),
("5","6",1,"short",CB,"diagram","", "<p><b>Figure 5</b> is a drawing of an animal cell during cell division, with the chromosomes at each end and a structure <b>Z</b> labelled at the outside edge of the cell.</p><p>Name structure <b>Z</b> in <b>Figure 5</b>.</p>",
 "The (cell) membrane",
 "Figure 5 is artwork in the PDF; what it shows is stated in the question."),
("5","7",3,"calculation",CB,"diagram","", "<p>The image of the cell in <b>Figure 5</b> is magnified 800 times and has a width of 50 mm.</p><p>Calculate the real width of the cell in <b>Figure 5</b>. Give your answer in micrometres (µm). Use the equation:</p><p>real width of cell = width of image of cell ÷ magnification<br>1 mm = 1000 µm</p>",
 "62.5 µm — 50 ÷ 800 = 0.0625 mm, and 0.0625 × 1000 = 62.5 µm", ""),
("5","8",2,"short",IR,"", "", "<p>Some drugs can treat cancer.</p><p>Complete the sentences. Choose answers from the box: <i>cells &nbsp; people &nbsp; plants &nbsp; viruses</i></p><p>Preclinical testing of cancer drugs is done using ............... .<br>To check if the drug is safe, the drug is tested on ............... .</p>",
 "cells; people — in that order", ""),
("5","9",1,"short",IR,"", "", "<p>In drug trials some patients are given a tablet which does not contain the drug.</p><p>What name is given to the tablet that does not contain the drug?</p>",
 "A placebo", ""),

("6","1",2,"short",CB,"", "", METHOD6 + "<p>Give <b>two</b> control variables the student used in the investigation.</p>",
 "Any two of: the size of the piece of potato; the type of potato (the same potato); the volume of salt solution (100 cm³); the time the pieces are kept in the solution (20 minutes); the potato was uncooked", ""),
("6","2",1,"short",CB,"", "", "<p>The student needed to be sure the measurements were as accurate as possible.</p><p>What should be done to each piece of potato after removing from the solution and before measuring the mass?</p>",
 "Blot it — dry the surface", ""),
("6","3",1,"short",CB,"", "", "<p>Name the piece of apparatus the student could use to measure the mass of the pieces of potato.</p>",
 "A balance (weighing scale)", ""),
("6","4",1,"short",CB,"", "", "<p><b>Table 4</b> shows the results.</p>" + T4 + "<p>What was the resolution of the apparatus used for measuring mass? Use <b>Table 4</b>. Tick <b>one</b> box.</p><ul><li>0.01 g</li><li>0.1 g</li><li>1.0 g</li><li>1.1 g</li></ul>",
 "0.1 g — every mass in the table is given to one decimal place", ""),
("6","5",1,"short",CB,"", "", "<p>Which piece of potato had the greatest change in mass in the investigation? Tick <b>one</b> box: <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>",
 "D — it changed by 1.1 g", ""),
("6","6",3,"calculation",CB,"", "", "<p>Calculate value <b>X</b> in <b>Table 4</b>. Use the equation:</p><p>percentage change in mass = (change in mass in grams ÷ mass at start in grams) × 100</p><p>Give your answer to 1 decimal place.</p>",
 "−18.3% — 1.1 ÷ 6.0 × 100 = 18.333…, which to one decimal place is 18.3", ""),
("6","7",1,"short",CB,"", "", "<p>What is the best way to present the data in <b>Table 4</b>? Tick <b>one</b> box.</p><ul><li>Bar chart</li><li>Line graph</li><li>Pie chart</li></ul>",
 "Line graph — concentration is a continuous variable", ""),
("6","8",3,"short",CB,"", "", "<p>Complete the sentences.</p><p>Some of the pieces of potato decreased in mass because the potato cells lost ............... .<br>The decrease in mass was due to a process called ............... .<br>The structure surrounding each cell in a piece of potato is partially ............... .</p>",
 "water; osmosis; permeable (membrane) — in that order", ""),
("6","9",1,"short",CB,"", "", "<p>Estimate the concentration of salt solution that would not cause a change in mass of these pieces of potato.</p>",
 "Anything from 0.15 to 0.25 mol/dm³ — the percentage change crosses zero between A at 0.1 and B at 0.3", ""),

("7","1",1,"short",OG,"", "", "<p>A person has coronary heart disease.</p><p>Which blood vessels are affected by coronary heart disease? Tick <b>one</b> box.</p><ul><li>Arteries</li><li>Capillaries</li><li>Veins</li></ul>",
 "Arteries", ""),
("7","2",2,"explain",OG,"", "", "<p>A person's heart stops beating. The person stops breathing. A first-aider pushes down on the person's chest. Pushing down on the person's chest puts pressure on the heart.</p><p>Explain why putting pressure on the heart helps the person.</p>",
 "It pushes blood around the body, which gets oxygen to the organs. (Not 'to the lungs'.)", ""),
("7","3",1,"explain",BE,"", "", "<p>The first-aider also forces air into the person's lungs by blowing into their mouth.</p><p>Describe how forcing air into the person's lungs helps the person.</p>",
 "It provides oxygen for respiration", ""),
("7","4",1,"short",OG,"", "", "<p>The person's heart starts to beat again and the person starts breathing. The person has a high level of cholesterol in their blood.</p><p>Name <b>one</b> type of drug that would decrease the level of cholesterol in the person's blood.</p>",
 "Statins", ""),
("7","5",2,"explain",OG,"", "", "<p>A doctor decides that the person needs to have a stent fitted.</p><p>Explain how a stent works to treat coronary heart disease.</p>",
 "The stent opens and keeps open the blocked blood vessel, so more blood — and so more oxygen and glucose — can flow to the heart muscle", ""),
("7","6",2,"explain",OG,"", "", "<p><b>Table 5</b> shows the effect of smoking on the risk of developing different cardiovascular diseases.</p>" + T5 + "<p>Give <b>two</b> conclusions that can be made from the data in <b>Table 5</b>.</p>",
 "Any two of: smoking increases the risk of all four diseases; smoking increases the risk of disease H more than any other; smoking increases the risk of disease E less than any other. Two correct comparisons of two diseases also score two.", ""),
("7","7",4,"drawing",OG,"graph", fig6(), "<p><b>Figure 6</b> is a blank graph grid with the bar for cardiovascular disease <b>E</b> already plotted.</p><p>Complete <b>Figure 6</b>. You should:</p><ul><li>label the y-axis</li><li>add the correct scale to the y-axis</li><li>plot the data from <b>Table 5</b></li><li>label each bar.</li></ul>",
 "Label the y-axis 'Percentage (%) increase in risk compared to people who have never smoked'. The scale is set by the bar already drawn: E is 14%, so one large square is 5%. Plot F at 20, G at 29 and H at 70, and label all four bars. Half a small square of tolerance is allowed; bars touching, and how wide they are, are ignored.", ""),
("7","8",1,"short",OG,"", "", "<p>Describe <b>one</b> lifestyle factor that can increase the risk of cardiovascular disease. Do not refer to smoking in your answer.</p>",
 "A poor diet — one high in saturated fat or cholesterol — or a lack of exercise. High alcohol intake and a stressful job are also accepted; 'obesity' and unqualified 'diet' are not.", ""),

("8","1",1,"short",CB,"", "", "<p>Cystic fibrosis (CF) is an inherited disorder caused by a faulty gene.</p><p>Where in a cell would the CF gene be found?</p>",
 "In the nucleus (on a chromosome)", ""),
("8","2",1,"short",OG,"diagram","", "<p>CF affects many organs in the body. The main organs affected are the lungs, the pancreas and the small intestine.</p><p><b>Figure 7</b> is an outline of the human body with six organs lettered <b>A</b> to <b>F</b>.</p><p>Which letters in <b>Figure 7</b> show the lungs, the pancreas and the small intestine? Tick <b>one</b> box.</p><ul><li>A, D and E</li><li>A, E and F</li><li>B, C and D</li><li>B, C and F</li></ul>",
 "A, D and E",
 "Figure 7 is artwork in the PDF and is not transcribed; the letters cannot be resolved without it."),
("8","3",6,"written",OG,"", "", "<p>The pancreas produces several digestive enzymes. CF reduces the amount of each enzyme that reaches the small intestine.</p><p>Explain why a person with CF has difficulty digesting food, and difficulty gaining body mass.</p>",
 "Level-marked out of 6, and Level 3 needs both halves. Digesting food: less lipase, so less fat broken down into fatty acids and glycerol; less amylase, so less starch broken down into glucose; less protease, so less protein broken down into amino acids. Gaining body mass: less absorption of those small soluble molecules, so fewer amino acids for building protein, muscle and tissue, less fat stored, less respiration and so less energy for building new cells and tissues.", ""),
("8","4",3,"short",OG,"", "", "<p>Gas exchange happens in the alveoli in the lungs.</p><p>Describe <b>three</b> features of the alveoli that help maximise gas exchange.</p>",
 "A large surface area (or surface area to volume ratio); a large capillary network — a good blood supply; walls that are thin, one cell thick. ('Thin alveoli' and 'moist' are ignored.)", ""),
("8","5",3,"explain",BE,"", "", "<p>CF reduces the amount of oxygen that can enter the blood from the alveoli.</p><p>Explain how a reduced amount of oxygen entering the blood will affect the human body.</p>",
 "There is less aerobic respiration, so less energy is released, which means less muscle contraction — or a reduced metabolism, or an increased breathing rate or heart rate. Alternatively: more anaerobic respiration, so lactic acid is produced, causing muscle fatigue.", ""),
]

# ---- the paper says what it is out of, and so does every box down the margin ----
PER_QUESTION = {"1": 12, "2": 8, "3": 10, "4": 14, "5": 14, "6": 14, "7": 14, "8": 14}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())

# ---- every number the scheme prints inside its own working, recomputed here ----
from fractions import Fraction
assert Fraction(63, 210) == Fraction(3, 10)
assert 210 - 23 == 187 and 216 - 185 == 31 and 187 - 31 == 156
assert (23 + 63) / 2 == 43
assert (58 + 55 + 61) == 174 and 174 / 3 == 58
assert 50 / 800 == 0.0625 and 0.0625 * 1000 == 62.5
assert round(1.1 / 6.0 * 100, 1) == 18.3
# and the scale Figure 6 is drawn at: E's bar is 14%, one large square is 5%
assert 14 / 5.0 * CELL == 14 / 5.0 * 29 and ROWS * 5 == 75      # 75% of headroom, and H needs 70

d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 5

rows = []
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-8461-2406-1F-%02d%s' % (int(q), part), kind='question',
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
