#!/usr/bin/env python3
"""AQA GCSE Biology 8461/1H, June 2024 — the document row and 48 question rows.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Higher)_ Paper 1 - June 2024.pdf`, which is AQA's own
8461/1H scheme — read, not derived. CLAUDE.md records why that is the rule and not a preference:
four answers on the 2017 Highers were subtly wrong because they were worked out rather than read.

WHAT THE PAPER SAYS IT IS OUT OF. The cover says 100 and the eight boxes down the margin say
14, 14, 12, 12, 11, 8, 17, 12. Both are asserted below, and so is the only arithmetic the scheme
prints inside its own working — the cylinder length and the magnification of question 08.3.

THIS PAPER WAS IN DRIVE THE WHOLE TIME AND NOBODY COULD SEE IT. AQA names every subject's download
`Question paper (Higher)_ Paper 1 - June 2024.pdf`, so four subjects arrive under one filename and
Drive disambiguates them into `(1)`, `(2)`, `(3)`. This one is the unsuffixed copy, and its cover
says 8461/1H. CLAUDE.md's rule — check the metadata and read the front cover before reading a
single page — is what finds it; a filename never will.

ONE FIGURE IS DRAWN AND IT IS THE ONE THE FOUNDATION PAPER ALREADY DRAWS. 01.7 here is 07.7 there:
the same four cardiovascular diseases, the same blank grid, the same bar for E. It goes through
`blankgrid` in tools/svgplot.py with the same arguments rather than a second set of coordinates.

EVERYTHING ELSE IS ARTWORK AND WHAT IT SHOWS IS SAID IN WORDS. A lettered body outline, a Petri
dish, a variegated leaf, a dividing cell, three photosynthesis curves — none is a picture the row's
own words determine, and redrawing a curve nobody stated the points of is the mistake this
repository records where a cumulative-frequency curve read by eye gave 50 where the pixels said
48.1. Each carries `figure` so `check-library.js` counts it as outstanding rather than letting the
prose hide it.

AND FIGURE 3 IS THE ONE PICTURE NOBODY CAN HAVE — the same phloem photograph 8461/1F prints, where
AQA itself writes "Figure 3 cannot be reproduced here due to third-party copyright restrictions"
and names the journal. A source that is not in the paper cannot be in a public repository either,
so the row says what the figure is OF and `examiner_note` carries AQA's own sentence.
"""
import json, datetime, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import blankgrid

PAPER = 'P-AQA-8461-2406-1H'
SRC = 'https://drive.google.com/file/d/1Q9wzIZDxIRRenHMBUKN4S8u1z6UxgNwR/view'
BASE = dict(subject='Biology', key_stage='KS4', band_type='stage', band_value='GCSE',
            tier='Higher', level='GCSE', company='AQA', exam_board='AQA', spec_code='8461/1H',
            exam_wave='First wave', year='2024', month='5', paper='1', exam_date='2024-05-10',
            document_type='Past paper', name='Paper 1 — June 2024', active='True',
            trackable='True', printable='False')
DOC = dict(BASE, row_id='D-' + PAPER, paper_id=PAPER, kind='document', total_marks='100',
           needs='Calculator, Ruler', source_url=SRC)

CB = 'Cell Biology'; OG = 'Organisation'; IR = 'Infection & Response'; BE = 'Bioenergetics'

# FIGURE 1 — the blank grid with disease E's bar already on it. Ten major columns by fifteen, five
# minor to a major: at the scale the scheme asks for (1 cm = 5%) that is 0 to 75%, which is the
# headroom disease H at 70% needs. The y-axis is deliberately unlabelled and unscaled, because
# labelling and scaling it is two of the four marks.
COLS, ROWS, CELL, PER_SQUARE = 10, 15, 29, 5
FIG1 = blankgrid(COLS, ROWS, CELL, [(1, 14, 'E')], PER_SQUARE,
                 'Blank graph grid with one bar, labelled E, already plotted')

T1 = ('<table><tr><th>Cardiovascular disease</th><th>Percentage (%) increase in risk compared to '
      'people who have never smoked</th></tr><tr><td>E</td><td>14</td></tr>'
      '<tr><td>F</td><td>20</td></tr><tr><td>G</td><td>29</td></tr><tr><td>H</td><td>70</td></tr>'
      '</table>')
T2 = ('<table><tr><th>Type of bread</th><th>Time taken for bread to taste sweet in seconds</th>'
      '</tr><tr><td>Brown</td><td>43</td></tr><tr><td>White</td><td>35</td></tr>'
      '<tr><td>Wholemeal</td><td>57</td></tr></table>')
T3 = ('<table><tr><th>Leaf tested</th><th>Treatment</th><th>Result after 48 hours</th></tr>'
      '<tr><td>1</td><td>Upper and lower surfaces covered with black paper</td>'
      '<td>No starch present</td></tr>'
      '<tr><td>2</td><td>Upper and lower surfaces covered and sealed with transparent plastic</td>'
      '<td>No starch present</td></tr>'
      '<tr><td>3</td><td>Not covered</td><td>Starch present</td></tr></table>')
T4 = ('<table><tr><th>Part of leaf tested</th><th>Result after 48 hours</th></tr>'
      '<tr><td>Green</td><td></td></tr><tr><td>White</td><td></td></tr></table>')

CPR = ('<p>A person has coronary heart disease.</p><p>The person’s heart stops beating and '
       'they stop breathing. A first-aider pushes down on the person’s chest, which puts '
       'pressure on the heart.</p>')
CF = '<p>Cystic fibrosis (CF) is an inherited disorder caused by a faulty gene.</p>'
BREAD = ('<p>A student investigated three types of bread. For each type the student put a square '
         'piece of bread into their mouth, did not chew it, and recorded the time taken for the '
         'bread to taste sweet. <b>Table 2</b> shows the results.</p>' + T2)
POTATO = ('<p>A student investigated the effect of concentration of salt solution on the mass of '
          'uncooked potato pieces. <b>Figure 4</b> shows the results: a line graph of percentage '
          'change in mass against concentration of salt solution in mol/dm<sup>3</sup>. The line '
          'starts above zero at the lowest concentrations, crosses zero, and falls further below '
          'zero as the concentration rises, so the pieces at 0.6 mol/dm<sup>3</sup> lost mass and '
          'those at 1.0 mol/dm<sup>3</sup> lost more.</p>')
PETRI = ('<p>A scientist grew one type of bacterium on agar in a Petri dish and placed paper discs '
         'each containing a different antibiotic on the agar. <b>Figure 5</b> shows the dish after '
         '2 days: a lawn of bacteria with a clear zone of inhibition around each disc, the zones '
         'differing in size from one antibiotic to the next.</p>')

# (question, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",1,"short",OG,"","", CPR + "<p>Which blood vessels are affected by coronary heart disease? Tick <b>one</b> box.</p><ul><li>Arteries</li><li>Capillaries</li><li>Veins</li></ul>",
 "Arteries", ""),
("1","2",2,"explain",OG,"","", CPR + "<p>Explain why putting pressure on the heart helps the person.</p>",
 "It pushes or moves blood, which gets oxygen around the body. A description of getting oxygen around the body, or to a named organ, is accepted; 'to the lungs' is not, and references to restarting the heart or to the pacemaker are ignored.", ""),
("1","3",1,"explain",BE,"","", "<p>The first-aider also forces air into the person’s lungs by blowing into their mouth.</p><p>Describe how forcing air into the person’s lungs helps the person.</p>",
 "It provides oxygen for respiration. (The idea of carbon dioxide triggering breathing to restart is also allowed.)", ""),
("1","4",1,"short",OG,"","", "<p>The person’s heart starts to beat again and the person starts breathing. The person has a high level of cholesterol in their blood.</p><p>Name <b>one</b> type of drug that would decrease the level of cholesterol in the person’s blood.</p>",
 "Statins (a named statin is accepted)", ""),
("1","5",2,"explain",OG,"","", "<p>A doctor decides that the person needs to have a stent fitted.</p><p>Explain how a stent works to treat coronary heart disease.</p>",
 "The stent opens or widens the blocked blood vessel — or keeps it open — so that more blood can flow, or more glucose and oxygen reach the heart muscle. The type of blood vessel is ignored, and so is 'unblocks'.", ""),
("1","6",2,"explain",OG,"","", "<p><b>Table 1</b> shows the effect of smoking on the risk of developing different cardiovascular diseases.</p>" + T1 + "<p>Give <b>two</b> conclusions that can be made from the data in <b>Table 1</b>.</p>",
 "Any two of: smoking increases the risk of all types of cardiovascular disease; smoking increases the risk of disease H more than any other; smoking increases the risk of disease E less than any other. Two correct comparisons of the effect of smoking on two diseases also score two. 'Smoking causes cardiovascular disease' is ignored — the table is about risk.", ""),
("1","7",4,"drawing",OG,"graph",FIG1, "<p><b>Figure 1</b> is a blank graph grid with the bar for cardiovascular disease <b>E</b> already plotted.</p><p>Complete <b>Figure 1</b>. You should:</p><ul><li>label the y-axis</li><li>add the correct scale to the y-axis</li><li>plot the data from <b>Table 1</b></li><li>label each bar.</li></ul>",
 "Label the y-axis 'Percentage (%) increase in risk compared to people who have never smoked'. The scale is 1 cm = 5%, which is what the bar already drawn fixes: E is 14%. Plot F at 20, G at 29 and H at 70, and label all four bars. Half a small square of tolerance is allowed; bars touching, and how wide they are, are ignored.", ""),
("1","8",1,"short",OG,"","", "<p>Describe <b>one</b> lifestyle factor that can increase the risk of cardiovascular disease. Do not refer to smoking in your answer.</p>",
 "A poor diet — one high in saturated fat or cholesterol — or a lack of exercise. A high alcohol intake and other real lifestyle factors such as a stressful job are also accepted; 'obesity' and unqualified 'diet' are not.", ""),

("2","1",1,"short",CB,"","", CF + "<p>Where in a cell would the CF gene be found?</p>",
 "In the nucleus (chromosome is allowed; 'in the DNA' is ignored)", ""),
("2","2",1,"short",OG,"diagram","", CF + "<p>CF affects many organs in the body. The main organs affected are the lungs, the pancreas and the small intestine.</p><p><b>Figure 2</b> is an outline of the human body with six organs lettered <b>A</b> to <b>F</b>.</p><p>Which letters in <b>Figure 2</b> show the lungs, the pancreas and the small intestine? Tick <b>one</b> box.</p><ul><li>A, D and E</li><li>A, E and F</li><li>B, C and D</li><li>B, C and F</li></ul>",
 "A, D and E",
 "Figure 2 is artwork in the PDF and is not transcribed; which letter sits on which organ cannot be resolved without it."),
("2","3",6,"written",OG,"","", "<p>The pancreas produces several digestive enzymes. CF reduces the amount of each enzyme that reaches the small intestine.</p><p>Explain why a person with CF has:</p><ul><li>difficulty digesting food</li><li>difficulty gaining body mass.</li></ul>",
 "Level-marked out of 6, and Level 3 needs both halves. Digesting food: less or no lipase, so less fat broken down into fatty acids and glycerol; less or no carbohydrase or amylase, so less starch broken down into glucose; less or no protease, so less protein broken down into amino acids. Gaining body mass: less absorption of those small soluble molecules, so fewer amino acids available for building protein, muscle, cells and tissues; less fat stored; less respiration, so less energy for building new molecules and cells.", ""),
("2","4",3,"short",OG,"","", "<p>Gas exchange happens in the alveoli in the lungs.</p><p>Describe <b>three</b> features of the alveoli that help maximise gas exchange.</p>",
 "A large surface area (or a large surface area to volume ratio); a large capillary network — a good, efficient blood supply; walls that are thin, one cell thick. References to the alveoli being moist, and to a steep concentration gradient, are ignored, and 'thin cell walls' is not accepted.", ""),
("2","5",3,"explain",BE,"","", "<p>CF reduces the amount of oxygen that can enter the blood from the alveoli.</p><p>Explain how a reduced amount of oxygen entering the blood will affect the human body.</p>",
 "There is less aerobic respiration, so less energy is released, which results in less muscle contraction — or a reduced metabolism, or an increased breathing rate or depth, or an increased heart rate. The alternative route also scores three: more anaerobic respiration, so lactic acid is produced, causing muscle fatigue or any of the same consequences. 'Less energy produced or made' is not accepted.", ""),

("3","1",6,"written",OG,"","", "<p>Cake and bread each contain the same two types of carbohydrate.</p><p>Describe the chemical tests that could be used to show the presence of the two types of carbohydrate in cake. Include a risk assessment in your answer.</p>",
 "Level-marked out of 6, and Level 3 needs both reagents with their correct positive results and a risk assessment. Iodine solution tests for starch and changes from yellow-orange-brown to blue-black. Benedict's reagent tests for sugar: heat the cake with it to at least 60 °C, and it changes from blue to green, yellow, orange, brown or brick red. Risks: burns from the flame, hot glass or boiling water — use a water bath and let equipment cool; Benedict's spitting into the face — wear eye protection and point the tube away; Benedict's and iodine as irritants — clean spills at once, wear gloves or eye protection, use a dropper bottle.", ""),
("3","2",1,"short",OG,"","", BREAD + "<p>What was the dependent variable in the investigation?</p>",
 "The time taken for the bread to taste or become sweet ('time' on its own is ignored)", ""),
("3","3",1,"short",OG,"","", BREAD + "<p>Give <b>one</b> control variable the student should have used in the investigation.</p>",
 "Any one of: the size, mass or amount of bread; the surface area of the bread; where the bread is placed on the tongue; cleaning the mouth between tests. The temperature of the bread and 'use the same student' are ignored.", ""),
("3","4",3,"explain",OG,"","", BREAD + "<p>During the investigation, the bread began to taste sweet in the student’s mouth.</p><p>Explain why the bread tasted sweet.</p>",
 "The bread contains starch; the starch is broken down into sugar (glucose or maltose); by amylase in the saliva. An alternative route also scores three: the bread contains sugar, the sugar dissolves in the saliva, and the solution reaches the taste receptors on the tongue.", ""),
("3","5",1,"short",OG,"","", BREAD + "<p>Suggest <b>one</b> reason why the results of the investigation were not valid. Do not refer to control variables in your answer.</p>",
 "Any one of: the investigation was not repeated; the results rely on the student's perception of taste, which is subjective; the amount of saliva or amylase produced varies. 'The mean was not calculated' is ignored.", ""),

("4","1",3,"short",OG,"","", "<p>Plants contain many different tissues.</p><p>Complete the sentences.</p><p>The leaf tissue that contains the most chloroplasts is the ............... .<br>The leaf tissue that contains many air spaces is the ............... .<br>The plant tissue that can differentiate throughout the life of the plant is the ............... .</p>",
 "Palisade mesophyll; spongy mesophyll; meristem — and they must be in that order. A single cell is not accepted in place of the tissue.", ""),
("4","2",1,"short",OG,"","", "<p>Xylem tissue transports water through a plant. The walls of xylem cells contain cellulose.</p><p>Name <b>one</b> other substance that strengthens xylem tissue.</p>",
 "Lignin", ""),
("4","3",1,"short",OG,"","", "<p>Phloem tissue transports dissolved sugars around a plant.</p><p>Name the process that transports dissolved sugars around a plant.</p>",
 "Translocation ('active transport' is ignored)", ""),
("4","4",1,"short",CB,"photograph","", "<p><b>Figure 3</b> is a photograph of two plant cells from phloem tissue, one of them labelled cell <b>X</b> and a part of the other labelled <b>Y</b>.</p><p>Name part <b>Y</b> in <b>Figure 3</b>.</p>",
 "The (permanent) vacuole",
 "AQA's own question paper prints, in place of the photograph: “Figure 3 cannot be reproduced here due to third-party copyright restrictions. It is a photograph showing two cells from phloem tissue from page numbers 111-120 of the following publication: Cytochemical Localization of Adenosine Triphosphatase in the Phloem of Pisum sativum and its Relation to the Function of Transfer Cells, Planta Vol. 2 by B J Bentwood and J Cronshaw.” It is third-party copyright and is not reproducible in a public repository either."),
("4","5",5,"explain",CB,"photograph","", "<p>The phloem tissue transports sugars to other parts of the plant. The concentration of dissolved sugars in the phloem cell in <b>Figure 3</b> is higher than in cell <b>X</b>.</p><p>Explain how sub-cellular structures help to move dissolved sugars from cell <b>X</b> into the phloem cell.</p>",
 "Cell X contains mitochondria; they carry out aerobic respiration; which releases energy; the energy is needed to move the dissolved sugars against the concentration gradient — from a low concentration to a high one; by active transport. Anaerobic respiration is not accepted, nor is energy being 'produced' or 'made'.",
 "Figure 3 is the copyright photograph AQA could not print; see 04.4."),
("4","6",1,"short",CB,"photograph","", "<p>New phloem cells form when unspecialised plant cells differentiate and become specialised.</p><p>Describe <b>one</b> change in structure that occurs when an unspecialised cell differentiates to form a phloem cell. Use <b>Figure 3</b>.</p>",
 "Any one of: loss of cytoplasm; loss of the nucleus; loss of mitochondria; loss of ribosomes; loss of sub-cellular structures; the end walls become perforated (sieve plates form). A larger vacuole forming is also allowed; a change in size or shape is ignored.",
 "Figure 3 is the copyright photograph AQA could not print; see 04.4."),

("5","1",6,"written",CB,"graph","", POTATO + "<p>Plan a method that could be used to obtain the results in <b>Figure 4</b>.</p>",
 "Level-marked out of 6. Measure and record the mass of the potato pieces; place them into at least three different concentrations of salt solution; leave them; remove and blot them dry; measure the mass again and calculate the change; repeat each concentration twice more and calculate a mean change in mass. Control variables: the same size or mass of piece, the same potato or type of potato, the same blotting technique, no skin on the pieces, the same time (at least 10 minutes) and the same temperature. For Level 3 the method must be able to produce the graph in Figure 4.",
 "Figure 4 is a results graph in the PDF; what it shows is stated in the question, and no point on it is quoted anywhere in the paper, so it is not redrawn."),
("5","2",3,"explain",CB,"graph","", POTATO + "<p>Explain the result for the potato pieces in the 0.6 mol/dm<sup>3</sup> salt concentration.</p>",
 "The pieces lost mass because water left the cells; because the solution in the cells is less concentrated — more dilute — than the solution outside; and the water left by osmosis. Correct references to water concentration or water potential are allowed; 'water moves from a high solute concentration to a low one' is not.",
 "Figure 4 is a results graph in the PDF; what it shows is stated in the question."),
("5","3",2,"explain",CB,"graph","", POTATO + "<p>Explain why the result for the potato pieces at 1.0 mol/dm<sup>3</sup> was different from the result at 0.6 mol/dm<sup>3</sup>.</p>",
 "The pieces at 1.0 mol/dm³ lost more mass because more water left them — more osmosis occurred out of the potato; because the concentration gradient between the inside and the outside of the cells is steeper at 1.0 mol/dm³.",
 "Figure 4 is a results graph in the PDF; what it shows is stated in the question."),

("6","1",1,"short",IR,"","", "<p>This question is about pathogens. A scientist investigated antibiotic resistance in bacteria.</p><p>Name <b>one</b> antibiotic.</p>",
 "Penicillin, or any other named antibiotic ('penicillium' is ignored — that is the mould)", ""),
("6","2",2,"explain",IR,"diagram","", PETRI + "<p>A student said: ‘The bacterium is resistant to antibiotic C.’</p><p>Explain how the results in <b>Figure 5</b> show that the student is not correct.</p>",
 "The bacterium is killed by antibiotic C — there is a zone of inhibition around it; if the bacterium were resistant the bacteria would grow right up to the edge of the disc, and there would be no zone of inhibition.",
 "Figure 5 is a photograph of the Petri dish in the PDF; what it shows is stated in the question, and the sizes of the individual zones are not quoted anywhere in the paper."),
("6","3",2,"explain",IR,"","", "<p>Suggest why doctors are concerned about antibiotic resistance.</p>",
 "Any two of: the antibiotics currently available do not kill (have no effect on) certain bacteria; diseases become more common, or there will be diseases that cannot be cured or treated, or become harder to treat; new antibiotics have to be developed, which takes time and money.", ""),
("6","4",1,"explain",IR,"","", "<p>Diseases caused by viruses cannot be treated using antibiotics.</p><p>Suggest why viruses cannot be grown on agar.</p>",
 "Viruses only exist and reproduce inside living cells — and agar is not made of cells.", ""),
("6","5",1,"short",IR,"","", "<p>Why is it difficult for scientists to develop drugs to destroy viruses?</p>",
 "The drugs damage the body's own cells and tissues, or it is hard to get the drugs inside living cells. That viruses mutate frequently, giving resistance, is also allowed.", ""),
("6","6",1,"short",IR,"","", "<p>Which disease is caused by a virus that damages white blood cells? Tick <b>one</b> box.</p><ul><li>AIDS</li><li>Gonorrhoea</li><li>Measles</li><li>Salmonella</li></ul>",
 "AIDS", ""),

("7","1",5,"explain",BE,"","", "<p>A student investigated the effect of different factors on photosynthesis, using three leaves growing on the same plant. Each leaf was treated in a different way. After 48 hours the student tested each leaf for starch. <b>Table 3</b> shows the results.</p>" + T3 + "<p>Explain the results for the three leaves.</p>",
 "Leaf 1, covered with black paper: no light, so no photosynthesis. Leaf 2, sealed in transparent plastic: no carbon dioxide, so no photosynthesis. Leaf 3, not covered: light and carbon dioxide are both present, so the leaf can photosynthesise. For leaves 1 and 2: glucose is not made, and so glucose cannot be converted to starch. (If neither of those last two is earned, 'the starch already present has been broken down' scores one.)", ""),
("7","2",1,"short",BE,"diagram","", "<p>In another investigation the student used a different type of plant, left uncovered in the light for 48 hours. <b>Figure 6</b> shows the leaf before it was tested for starch: it is variegated, with green areas and white areas.</p><p>Complete <b>Table 4</b> to show the results you would expect for the starch test on the leaf in <b>Figure 6</b>.</p>" + T4,
 "Green: starch present (blue-black). White: no starch (the iodine stays yellow-orange-brown). Both are needed for the one mark.",
 "Figure 6 is artwork in the PDF; that the leaf is variegated is stated in the question, and the pattern of the green and white areas is not otherwise described."),
("7","3",2,"explain",BE,"diagram","", "<p>Explain the results you gave in Question 07.2.</p>",
 "The green part contains chlorophyll and the white part does not; so light is absorbed by the green part but not by the white, photosynthesis occurs there, and starch can be formed.",
 "Figure 6 is artwork in the PDF; see 07.2."),
("7","4",1,"short",IR,"","", "<p>In some leaves, the green parts become yellow because of an ion deficiency.</p><p>Which ion is deficient in a plant with yellow leaves?</p>",
 "Magnesium (Mg or Mg²⁺). Nitrate and iron are also allowed.", ""),
("7","5",1,"short",IR,"","", "<p>Give the scientific term that describes the yellow colour of the leaves.</p>",
 "Chlorosis", ""),
("7","6",1,"short",BE,"","", "<p>The rate of photosynthesis is affected by different factors.</p><p>How could the oxygen produced during photosynthesis be used to measure the rate of photosynthesis?</p>",
 "Measure the volume of oxygen released in a given time, or count the number of bubbles released in a given time. 'Measure the amount released in a given time' is ignored — it does not say how.", ""),
("7","7",1,"short",BE,"graph","", "<p>Light, carbon dioxide and temperature are limiting factors of photosynthesis. <b>Figure 7</b> shows how the rate of photosynthesis is affected by all three: it is a set of curves of rate against light intensity, each for a different combination of temperature and carbon dioxide concentration, every one rising steeply from the origin and then levelling off at a different height. Point <b>A</b> is on the steeply rising part.</p><p>At point <b>A</b> on <b>Figure 7</b>, light is a limiting factor.</p><p>What is meant by a ‘limiting factor’?</p>",
 "A factor that, if increased, would increase the rate of the reaction — or a factor that prevents the rate increasing, or prevents the maximum rate being reached.",
 "Figure 7 is a set of graphs in the PDF; what it shows is stated in the question, and no point on any curve is quoted anywhere in the paper."),
("7","8",4,"explain",BE,"graph","", "<p>Explain the effect of increasing temperature and increasing carbon dioxide concentration on the rate of photosynthesis shown in <b>Figure 7</b>.</p>",
 "Increasing the temperature while keeping the carbon dioxide concentration constant increases the rate of photosynthesis (and the converse for carbon dioxide at constant temperature); increasing the temperature increases the movement — the kinetic energy — of the particles, or the rate of enzyme activity, or the frequency of collisions; increasing the carbon dioxide concentration increases the concentration of the substrate; and all the rates plateau at a certain point because another factor becomes limiting. ('Because light is limiting' is not accepted; chlorophyll is.)",
 "Figure 7 is a set of graphs in the PDF; see 07.7."),
("7","9",1,"short",BE,"","", "<p>Photosynthesis investigations often use a light source. The spreading out of light from a source obeys the inverse square law, which links light intensity to distance from the light source.</p><p>Which of the following shows the inverse square law? Tick <b>one</b> box.</p><ul><li>light intensity ∝ 1 ÷ distance<sup>2</sup></li><li>light intensity ∝ distance<sup>2</sup></li><li>1 ÷ (light intensity)<sup>2</sup> ∝ distance<sup>2</sup></li><li>1 ÷ (light intensity)<sup>2</sup> ∝ 1 ÷ distance<sup>2</sup></li></ul>",
 "light intensity ∝ 1 ÷ distance²", ""),

("8","1",1,"short",CB,"","", "<p>Cancer is caused by changes in cells that result in uncontrolled cell division.</p><p>Before a cell begins to divide, its DNA replicates to form two copies of each chromosome.</p><p>Describe <b>one</b> other change that occurs in a cell before the cell begins to divide.</p>",
 "Any one of: the cell or its sub-cellular structures grow; the number of sub-cellular structures increases; the number of mitochondria increases; the number of ribosomes increases. The nucleus is not accepted, and neither is anything that happens as the cell divides.", ""),
("8","2",1,"short",CB,"diagram","", "<p><b>Figure 8</b> is a drawing of a cell during one of the stages of cell division, with a structure <b>Y</b> inside it and a structure <b>Z</b> labelled at the outside edge of the cell.</p><p>Name structure <b>Z</b> in <b>Figure 8</b>.</p>",
 "The (cell) membrane",
 "Figure 8 is artwork in the PDF; what it shows is stated in the question."),
("8","3",6,"calculation",CB,"diagram","", "<p>Structure <b>Y</b> in <b>Figure 8</b> is a cylinder. For structure <b>Y</b>: real volume = 24 500 000 nm<sup>3</sup>, real radius = 125 nm.</p><p>The length of a cylinder is calculated using the equation:</p><p>length = volume ÷ (π × radius<sup>2</sup>)</p><p>The length of the image of structure <b>Y</b> in <b>Figure 8</b> is 4 mm.</p><p>Calculate the magnification of structure <b>Y</b> in <b>Figure 8</b>. Use π = 3.14</p>",
 "×8010. Length = 24 500 000 ÷ (3.14 × 125²) = 24 500 000 ÷ 49 062.5 = 499.363 nm. Magnification = image size ÷ real size, and 4 mm = 4 000 000 nm, so 4 000 000 ÷ 499.363 = ×8010 (×8010.205 is allowed). No unit is given for a magnification.",
 "Figure 8 is artwork in the PDF; every number the calculation needs is printed in the question."),
("8","4",2,"explain",CB,"diagram","", "<p><b>Figure 9</b> shows some of the stages of cell division, with the fibres attaching to the replicated chromosomes at stage 1 and pulling them to each end of the cell.</p><p>Some cancer drugs prevent cell division. Drug <b>X</b> prevents the fibres from attaching to the replicated chromosomes in stage 1.</p><p>Explain why a cell cannot complete division when affected by drug <b>X</b>.</p>",
 "The chromosomes cannot be pulled by the fibres to each end of the cell; so the nucleus cannot divide — two genetically identical cells cannot be formed.",
 "Figure 9 is artwork in the PDF; what it shows is stated in the question."),
("8","5",1,"short",CB,"","", "<p>Give the reason why a drug that stops cell division helps to treat cancer.</p>",
 "The tumour cannot grow, proliferate or spread — it stops secondary tumours forming (metastasis). 'It stops uncontrolled cell division' is ignored, and 'the tumour cannot become malignant' is not accepted.", ""),
("8","6",1,"short",IR,"","", "<p>New cancer drugs are tested in clinical trials. Preclinical testing happens before clinical trials.</p><p>What is involved in preclinical testing of drugs? Tick <b>one</b> box.</p><ul><li>Testing the drugs for side effects</li><li>Testing the drugs on live tissues in a laboratory</li><li>Testing the drugs to find the optimum dose</li><li>Testing the drugs with chemicals in a laboratory</li></ul>",
 "Testing the drugs on live tissues in a laboratory", ""),
]

# ---- the paper says what it is out of, and so does every box down the margin ----
PER_QUESTION = {"1": 14, "2": 14, "3": 12, "4": 12, "5": 11, "6": 8, "7": 17, "8": 12}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())

# ---- the only arithmetic the scheme prints inside its own working, recomputed here ----
length = 24500000 / (3.14 * 125 ** 2)
assert 3.14 * 125 ** 2 == 49062.5
assert round(length, 3) == 499.363, length
assert 4 * 1000000 == 4000000                          # 4 mm in nanometres, the scheme's own step
assert round(4000000 / length) == 8010, 4000000 / length
assert round(4000000 / 499.363, 3) == 8010.205         # the scheme's own second acceptable value
# and the scale Figure 1 is drawn at: E's bar is 14%, one large square is 5%, H needs 70
assert ROWS * PER_SQUARE == 75 and 70 <= ROWS * PER_SQUARE

# ---- a comma in a topic name is a second topic, and so is an HTML entity ----
for q, part, marks, atype, topics, *_ in Q:
    assert ',' not in topics, 'a comma in a topic name is a second topic: %r' % topics
    assert '&' not in topics.replace(' & ', ''), 'a topic carries an entity: %r' % topics

d = datetime.date.fromisoformat(BASE['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 5    # Friday 10 May 2024, off the cover

rows = [DOC]
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(BASE)
    r.update(row_id='Q-AQA-8461-2406-1H-%02d%s' % (int(q), part), paper_id=PAPER, kind='question',
             question=q, part=part, section='', marks=str(marks), html=html, answer=answer,
             answer_type=atype, topics=topics, figure=figure, diagram=diagram,
             diagram_by=('family' if diagram else ''), placeholder='')
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

# THE NUMBER PRINTED IS THE ONE check-library.js WILL COUNT, not "rows with a figure" — a row that
# carries a drawing is not outstanding. CLAUDE.md records the run where those two were confused.
ANSWER_SPACE = ('grid-blank', 'fractions', 'boxes', 'long-method', 'lines', 'working',
                'answer-space', 'table-blank')
missing = [x for x in Q if x[5] and x[5] not in ANSWER_SPACE and not x[6]]
print('%s: %d questions, %d marks, %d rows written. %d lack the picture they are about (%s)'
      % (PAPER, len(Q), sum(got.values()), len(rows), len(missing),
         ', '.join('%s.%s' % (x[0], x[1]) for x in missing)))
