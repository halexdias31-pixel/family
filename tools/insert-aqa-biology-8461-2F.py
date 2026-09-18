#!/usr/bin/env python3
"""AQA GCSE Biology 8461/2F, June 2024 — 61 question rows into data/questions.json.

WHY THIS IS A SCRIPT AND NOT A HAND EDIT. CLAUDE.md: "Every number in a transcription is checked
against the paper's own stated total ... and the insert script asserts it before writing a row."
The cover says 100 and the margin boxes say 9, 10, 8, 8, 9, 10, 9, 8, 8, 10, 11. Both are asserted
below.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Foundation)_ Paper 2 - June 2024.pdf`, which is AQA's
own 8461/2F scheme — read, not derived.

TWO FIGURES ARE DRAWN AND THIRTEEN ARE DESCRIBED. Figure 15 is the grid 11.3 asks you to finish —
its y-axis is printed and its x-axis is not, which is two of the four marks — and Figure 11 is a
Punnett square with the female gametes filled in and the rest blank, which is a table rather than a
picture and is built as one. The brain, the evolutionary tree, the eye, the peat bog and the rest
are artwork, and what each SHOWS is written into its question.

AND WHAT A FIGURE SHOWS IS NOT WHAT ITS ANSWER IS. Figure 1's labels are described by where they
point — the outer layer of the cerebrum, a pea-sized structure on a stalk beneath the middle — and
not by what they are, because naming them is 01.5 and 01.6. Figure 8's tubes are described by how
much root grew in each, not by which grew most, because that is 07.3. The line is easy to cross
while writing a description that has to be useful, and crossing it turns a question into a sentence
with the answer in it.
"""
import json, datetime, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import W

PAPER = 'P-AQA-8461-2406-2F'
DOC = dict(paper_id=PAPER, subject='Biology', key_stage='KS4', band_type='stage',
           band_value='GCSE', tier='Foundation', level='GCSE', company='AQA', exam_board='AQA',
           spec_code='8461/2F', exam_wave='First wave', year='2024', month='6', paper='2',
           exam_date='2024-06-07', document_type='Past paper', name='Paper 2 — June 2024',
           active='True', trackable='True', printable='False')

HR = 'Homeostasis & Response'; IE = 'Inheritance & Evolution'; EC = 'Ecology'
OG = 'Organisation'; BE = 'Bioenergetics'; CB = 'Cell Biology'

# ---------------------------------------------------------------------------------------------
# FIGURE 15 — the y-axis is printed and the x-axis is not, which is the question. Eleven large
# squares across by seven up, five small to a large, numbered 0 to 70 in tens: that is what the
# sheet prints, and the totals to be plotted (60, 58, 50, 32, 16, 12) all fit inside it.
# ---------------------------------------------------------------------------------------------
COLS, ROWS, CELL = 11, 7, 27
def fig15():
    L, T = 44, 12
    R, B = L + COLS * CELL, T + ROWS * CELL
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="Grid with a numbered y-axis for the '
         'total number of tadpoles and an unlabelled x-axis">' % (W, B + 30)]
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
        p.append('<text x="%d" y="%.1f" class="num" style="text-anchor:end">%d</text>'
                 % (L - 5, y + 4, (ROWS - i) * 10))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    p.append('<text x="14" y="%d" class="ax" style="text-anchor:middle" transform="rotate(-90 14 '
             '%d)">Total number of tadpoles</text>' % ((T + B) / 2, (T + B) / 2))
    return ''.join(p) + '</svg>'

PUNNETT = ('<table><tr><th></th><th colspan="2">Female</th></tr>'
           '<tr><th>Male</th><th>R</th><th>r</th></tr>'
           '<tr><td>?</td><td>&nbsp;</td><td>&nbsp;</td></tr>'
           '<tr><td>?</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>')
T1 = ('<table><tr><th>Sample number</th><th>0 weeks</th><th>1 week</th><th>2 weeks</th>'
      '<th>3 weeks</th><th>5 weeks</th><th>8 weeks</th></tr>'
      '<tr><td>1</td><td>11</td><td>17</td><td>8</td><td>9</td><td>5</td><td>0</td></tr>'
      '<tr><td>2</td><td>15</td><td>11</td><td>12</td><td>7</td><td>0</td><td>5</td></tr>'
      '<tr><td>3</td><td>23</td><td>16</td><td>14</td><td>10</td><td>7</td><td>3</td></tr>'
      '<tr><td>4</td><td>11</td><td>14</td><td>16</td><td><b>X</b></td><td>4</td><td>4</td></tr>'
      '<tr><td><b>Totals</b></td><td>60</td><td>58</td><td>50</td><td>32</td><td>16</td><td>12</td>'
      '</tr></table>')

FIG2 = ("<p><b>Figure 2</b> is an evolutionary tree running left to right towards the present day. "
        "The ancestor splits at <b>A</b>; one branch runs straight to the <b>black-backed jackal</b> "
        "and the other carries on. That branch splits off the <b>Ethiopian wolf</b>, then splits at "
        "<b>B</b> to leave the <b>golden jackal</b>, then splits off the <b>coyote</b>, and finally "
        "splits at <b>C</b> into the <b>domestic dog</b> and the <b>grey wolf</b>. The key gives "
        "<b>A</b> 6 million years ago, <b>B</b> 3 million years ago and <b>C</b> 32 thousand years "
        "ago.</p>")
FIG4 = ("<p><b>Figure 4</b> is a horizontal section through a human eye with parallel light rays "
        "from a distant object entering at the front and meeting on the retina. Two structures are "
        "lettered: <b>A</b> is the thick cord leaving the back of the eyeball, and <b>B</b> is the "
        "transparent disc suspended behind the pupil by the suspensory ligaments.</p>")
FIG8 = ("<p><b>Figure 8</b> shows the six tubes side by side, labelled with the concentration of "
        "chemical <b>Q</b> in arbitrary units: tube 1 is 0, tube 2 is 0.01, tube 3 is 0.1, tube 4 "
        "is 1, tube 5 is 10 and tube 6 is 100. Tube 1's cutting has grown two short roots, tube 2's "
        "three short ones, tube 3's a thick bunch of long ones, tube 4's two short ones, tube 5's a "
        "single short one, and tube 6's none at all.</p>")

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",2,"short",HR,"", "", "<p>The nervous system allows humans to respond to stimuli and coordinate their behaviour.</p><p>Complete the order of structures to link a stimulus to a response. Choose answers from the box: <i>coordinator &nbsp; effector &nbsp; receptor</i></p><p>stimulus → ............... → ............... → ............... → response</p>",
 "stimulus → receptor → coordinator → effector → response. Either adjacent pair right on its own scores 1.", ""),
("1","2",2,"short",HR,"", "", "<p>Some human actions are reflex actions.</p><p>What is a reflex action?</p>",
 "Any two of: it is fast or rapid; it is a response or reaction; it is automatic or involuntary — not under conscious control; it protects you from harm", ""),
("1","3",1,"short",HR,"", "", "<p>Which is an example of a reflex action? Tick <b>one</b> box.</p><ul><li>Blinking in sudden bright light</li><li>Kicking a ball in a game</li><li>Writing a message to a friend</li></ul>",
 "Blinking in sudden bright light", ""),
("1","4",1,"short",HR,"", "", "<p>Many reflex actions are movements.</p><p>What type of tissue causes movement? Tick <b>one</b> box.</p><ul><li>Blood</li><li>Gland</li><li>Muscle</li></ul>",
 "Muscle", ""),
("1","5",1,"short",HR,"diagram","", "<p>Many human activities are coordinated by the brain. <b>Figure 1</b> is a side view of a human brain cut in half, with four structures lettered. <b>A</b> points to the outer layer of the large folded mass filling the top of the skull. <b>B</b> points to a small pea-sized body hanging on a short stalk beneath the middle of the brain. <b>C</b> points to the rounded swelling of the brain stem below that. <b>D</b> points to the cord running down out of the base of the brain. The <b>cerebellum</b> — the smaller ridged mass at the back — is labelled by name.</p><p>Which structure in <b>Figure 1</b> is the pituitary gland? Tick <b>one</b> box: <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>",
 "B", "Figure 1 is artwork in the PDF; what it shows is stated in the question."),
("1","6",1,"short",HR,"diagram","", "<p>Which structure in <b>Figure 1</b> is the cerebral cortex? Tick <b>one</b> box: <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</p>",
 "A", "Figure 1 is artwork in the PDF; what it shows is stated at 01.5."),
("1","7",1,"short",HR,"", "", "<p>What is the function of the cerebellum? Tick <b>one</b> box.</p><ul><li>Balance</li><li>Hearing</li><li>Sight</li></ul>",
 "Balance", ""),

("2","1",1,"short",IE,"", "", "<p>Carl Linnaeus invented a classification system that places organisms into groups.</p><p>What is the name of the largest classification group in Linnaeus's system? Tick <b>one</b> box.</p><ul><li>Family</li><li>Kingdom</li><li>Order</li></ul>",
 "Kingdom", ""),
("2","2",2,"short",IE,"", "", "<p>Linnaeus gave each species a binomial name.</p><p>Which <b>two</b> classification groups form the binomial name? Tick <b>two</b> boxes.</p><ul><li>Class</li><li>Genus</li><li>Order</li><li>Phylum</li><li>Species</li></ul>",
 "Genus and species", ""),
("2","3",1,"short",IE,"diagram","", "<p>Scientists think that the animals in <b>Figure 2</b> all evolved from an ancestor that lived about 6 million years ago.</p>" + FIG2 + "<p>What was the most recent time that the domestic dog and the golden jackal shared a common ancestor? Tick <b>one</b> box.</p><ul><li>32 thousand years ago</li><li>3 million years ago</li><li>6 million years ago</li></ul>",
 "3 million years ago — the split at B is the last one they are both above",
 "Figure 2 is artwork in the PDF; the tree it shows is written out in the question."),
("2","4",1,"short",IE,"diagram","", "<p>Which present-day animal in <b>Figure 2</b> is the most distant relative of the domestic dog?</p>",
 "The black-backed jackal — it branched off first, at A. ('Jackal' unqualified is ignored; the golden jackal is wrong.)",
 "Figure 2 is artwork in the PDF; the tree it shows is written out at 02.3."),
("2","5",2,"short",IE,"", "", "<p>Scientists think the grey wolf and the domestic dog had a common ancestor. The common ancestor lived about 32 thousand years ago and is now extinct.</p><p>Give <b>two</b> possible causes of extinction.</p>",
 "Any two of: drought; an ice age; global warming; volcanic activity; an asteroid collision; new predators or hunters; new disease; competition for food; competition for mates; loss or change of habitat. 'Climate change' alone scores 1.", ""),
("2","6",1,"explain",IE,"", "", "<p>32 thousand years ago, humans hunted other animals for food. Wolves also hunted other animals for food.</p><p>Suggest <b>one</b> reason why wolves began to follow groups of humans.</p>",
 "Any one of: wolves ate the humans; wolves got the left-over food from humans; humans gave food to the wolves", ""),
("2","7",2,"explain",IE,"", "", "<p>Some wolves are more aggressive than other wolves.</p><p>Describe how selective breeding of wolves could produce a domestic animal that is less aggressive than the wolf.</p>",
 "Breed from the least aggressive wolves, then breed from the least aggressive of their offspring — and keep repeating that over many generations", ""),

("3","1",1,"short",IE,"diagram","", "<p>Genetic engineering can be used for making many useful products. <b>Figure 3</b> is a flow diagram of how a vaccine against a virus can be made by genetic engineering: a piece is cut out of the virus, put into a yeast cell, and the yeast cell then makes copies of something which is collected and used as the vaccine.</p><p>Which part of the virus is put into the yeast cell?</p>",
 "The gene for the antigen",
 "Figure 3 is artwork in the PDF; what it shows is stated in the question."),
("3","2",1,"short",IE,"diagram","", "<p>Which part of the virus is made by the yeast cell?</p>",
 "The (pure) antigen", "Figure 3 is artwork in the PDF; what it shows is stated at 03.1."),
("3","3",1,"short",IE,"", "", "<p>A long time ago, vaccines were made in a different way. The virus was heated to stop it reproducing. The vaccine contained whole viruses.</p><p>Why might the vaccine containing heat-treated viruses be dangerous? Tick <b>one</b> box.</p><ul><li>The viruses may be inactive.</li><li>The viruses may cause an infection.</li><li>The viruses will not mutate.</li></ul>",
 "The viruses may cause an infection", ""),
("3","4",3,"short",EC,"", "", "<p>Genetic engineering can also be used in agriculture. Weeds are a problem for farmers because the weeds compete with crop plants.</p><p>Give <b>three</b> factors that the weeds and crop plants compete for.</p>",
 "Any three of: light; water; mineral ions or salts; oxygen in the soil; space. ('Nutrients' and 'carbon dioxide' are ignored.)", ""),
("3","5",1,"explain",EC,"", "", "<p>Glyphosate is a weed killer used in agriculture. Genetically modified (GM) maize is a food crop that is resistant to glyphosate weed killer. Farmers can spray glyphosate on a field to kill the weeds where the GM maize is growing.</p><p>Suggest <b>one</b> advantage of using glyphosate on fields where GM maize is growing.</p>",
 "The crop plants grow better — a higher yield", ""),
("3","6",1,"explain",EC,"", "", "<p>Suggest <b>one</b> problem of using glyphosate on fields where GM maize is growing. Do not refer to cost in your answer.</p>",
 "Any one of: it may kill or harm other plants; it may pollute streams, rivers or soil; it may harm humans or animals; it may reduce biodiversity", ""),

("4","1",2,"short",HR,"diagram","", "<p>The human eye can make clear images of objects. <b>Figure 4</b> shows how the human eye focuses light rays from a distant object onto the retina.</p>" + FIG4 + "<p>Label structures <b>A</b> and <b>B</b> on <b>Figure 4</b>. Choose answers from the box: <i>cornea &nbsp; lens &nbsp; optic nerve &nbsp; sclera</i></p>",
 "A: the optic nerve. B: the lens.",
 "Figure 4 is artwork in the PDF; what it shows is stated in the question."),
("4","2",1,"short",HR,"", "", "<p>The eye in <b>Figure 4</b> is focused on a distant object.</p><p>Complete the sentence. Choose the answer from the box: <i>contract &nbsp; expand &nbsp; stretch</i></p><p>To focus on a near object the ciliary muscles ............... .</p>",
 "contract", ""),
("4","3",1,"short",HR,"diagram","", "<p>Complete the sentence. Choose the answer from the box: <i>longer &nbsp; thicker &nbsp; thinner</i></p><p>To focus on a near object structure <b>B</b> in <b>Figure 4</b> becomes ............... .</p>",
 "thicker", "Figure 4 is artwork in the PDF; what it shows is stated at 04.1."),
("4","4",1,"short",HR,"", "", "<p>Complete the sentence. Choose the answer from the box: <i>iris &nbsp; retina &nbsp; suspensory ligaments</i></p><p>When the eye looks at an object in bright light the pupil gets smaller. The size of the pupil is controlled by the ............... .</p>",
 "iris", ""),
("4","5",1,"short",HR,"diagram","", "<p>The retina is sensitive to light.</p><p>How does information from the retina reach the brain via structure <b>A</b> in <b>Figure 4</b>?</p>",
 "As electrical impulses, along sensory neurones", "Figure 4 is artwork in the PDF; what it shows is stated at 04.1."),
("4","6",1,"explain",HR,"diagram","", "<p><b>Figure 5</b> shows the eye of a person who is short sighted looking at a distant object: the light rays are brought together at a point in front of the retina rather than on it. The person cannot see the object clearly.</p><p>Give the reason why the person cannot see the object clearly.</p>",
 "The light rays do not meet on the retina — they focus in front of it. (Also accepted: the lens is too thick, or the eyeball is too long.)",
 "Figure 5 is artwork in the PDF; what it shows is stated in the question."),
("4","7",1,"short",HR,"", "", "<p>Short sightedness can be corrected using spectacle lenses.</p><p>Give <b>one</b> other way short sightedness can be corrected. Do not refer to spectacles in your answer.</p>",
 "Contact lenses, laser surgery, or a replacement lens in the eye", ""),

("5","1",1,"short",HR,"", "", "<p>The hormone insulin helps to control the concentration of glucose in the blood.</p><p>Which organ produces insulin? Tick <b>one</b> box.</p><ul><li>Adrenal gland</li><li>Pancreas</li><li>Thyroid</li></ul>",
 "Pancreas", ""),
("5","2",1,"short",HR,"", "", "<p>People with Type 2 diabetes produce insulin, have body cells that do not respond to insulin, and often have a high concentration of glucose in their blood.</p><p>Why do people with Type 2 diabetes often have a high concentration of glucose in their blood? Tick <b>one</b> box.</p><ul><li>The body cells change glucose into glycogen for storage.</li><li>The body cells have a high rate of respiration to release energy.</li><li>The body cells take in a low amount of glucose from the blood.</li></ul>",
 "The body cells take in a low amount of glucose from the blood", ""),
("5","3",2,"short",HR,"", "", "<p>Drug <b>X</b> is used for treating people who have Type 2 diabetes. Scientists investigated the effect of drug <b>X</b> on the concentration of glucose in the blood of mice. This is the method used.</p><ol><li>Give two groups of mice the same diet for 8 weeks.</li><li>Give each mouse in group <b>A</b> 2 cm<sup>3</sup> of water to drink.</li><li>Give each mouse in group <b>B</b> 2 cm<sup>3</sup> of drug <b>X</b> to drink.</li><li>After 30 minutes, give each mouse 1 cm<sup>3</sup> of glucose solution to drink.</li><li>Measure the concentration of glucose in the blood of each mouse at intervals for 3 hours.</li></ol><p>Give <b>two</b> control variables used in the investigation.</p>",
 "Any two of: the same diet; the same 8-week duration; the same 30 minutes before the glucose; the same 2 cm³ volume of drink; the same 1 cm³ of glucose solution", ""),
("5","4",2,"calculation",HR,"graph", "", "<p><b>Figure 6</b> plots the concentration of glucose in the blood against time for both groups. In each group the concentration rises to a maximum and then falls. Group <b>B</b>'s curve peaks at 20 minutes and group <b>A</b>'s at 30 minutes, and group B's curve is lower than group A's throughout.</p><p>Group <b>B</b> reached a maximum value earlier than group <b>A</b>. Determine how many minutes earlier.</p>",
 "10 minutes — 30 for group A minus 20 for group B. Anything from 28 to 32 is accepted for group A.",
 "Figure 6 is a graph in the PDF; the two peak times are the mark scheme's own readings."),
("5","5",2,"explain",HR,"graph", "", "<p>Give <b>two</b> conclusions about the effect of drug <b>X</b> on the concentration of glucose in the blood. Do not refer to reaching the maximum value earlier.</p>",
 "Any two of: with drug X the concentration is lower throughout; its maximum is lower; it increases more slowly; it decreases more slowly; it returns to the original concentration sooner", ""),
("5","6",1,"short",HR,"", "", "<p>How could scientists find the best dose of drug <b>X</b> for controlling blood glucose concentration? Tick <b>one</b> box.</p><ul><li>Repeat the investigation twice more.</li><li>Use different concentrations of drug X.</li><li>Use more mice in the investigation.</li></ul>",
 "Use different concentrations of drug X", ""),

("6","1",1,"short",HR,"", "", "<p>Plants grow in response to the direction of light and to gravity.</p><p>What name is given to a plant's growth response? Tick <b>one</b> box.</p><ul><li>Accommodation</li><li>Adaptation</li><li>Tropism</li></ul>",
 "Tropism", ""),
("6","2",1,"short",HR,"", "", "<p>Which substance controls the response to light in plant shoots? Tick <b>one</b> box.</p><ul><li>Amylase</li><li>Auxin</li><li>Lactic acid</li></ul>",
 "Auxin", ""),
("6","3",2,"short",OG,"", "", "<p>A plant root grows downwards in response to gravity.</p><p>Which <b>two</b> substances can the root absorb in larger amounts when it grows downwards? Tick <b>two</b> boxes.</p><ul><li>Carbon dioxide</li><li>Glucose</li><li>Nitrate ions</li><li>Protein</li><li>Water</li></ul>",
 "Nitrate ions and water", ""),
("6","4",6,"written",HR,"diagram","", "<p>Plan an investigation to show the effect of light from one direction on the growth of plant seedlings. You should include a control, the measurements you would record, and any other observations you would make. You may use the equipment shown in <b>Figure 7</b> — pots of seedlings, a cardboard box with a narrow slit cut in one side, and a ruler — and any other laboratory apparatus.</p>",
 "Level-marked out of 6, and Level 3 needs a comparison with plants in full light or darkness plus a control variable. Put one pot of seedlings in the box with the slit, one in the dark and one in full light. Measure the heights of the shoots at the start and again at the end — straightening bent shoots or following them with thread — record how the seedlings look, calculate the mean increase in height for each group, and compare them. Control the temperature, the volume of water, the soil, the age of the seedlings, the species and the time left.",
 "Figure 7 is artwork in the PDF; the equipment it shows is listed in the question."),

("7","1",1,"explain",IE,"diagram","", "<p>Gardeners can grow plants from seeds and from cuttings taken from adult plants. A gardener investigated the growth of roots on cuttings from a geranium plant. This is the method used.</p><ol><li>Take 6 cuttings from the stems of the same plant.</li><li>Prepare 6 test tubes, each containing a different concentration of a solution of chemical <b>Q</b>.</li><li>Place 1 cutting in each test tube with the cut end of each stem in the solution.</li><li>Leave the test tubes at room temperature for 10 days.</li></ol>" + FIG8 + "<p>Tube 1 contains no chemical <b>Q</b>. Tube 1 is a control.</p><p>Why did the gardener include tube 1 in the investigation?</p>",
 "To compare with the other tubes — to show what difference chemical Q makes",
 "Figure 8 is artwork in the PDF; what it shows is stated in the question."),
("7","2",2,"calculation",IE,"diagram","", "<p>How many times more concentrated is chemical <b>Q</b> in tube 6 than in tube 2?</p>",
 "10 000 times — 100 ÷ 0.01",
 "Figure 8 is artwork in the PDF; the concentrations are listed at 07.1."),
("7","3",1,"short",IE,"diagram","", "<p>What was the best concentration of chemical <b>Q</b> for stimulating root growth? Tick <b>one</b> box.</p><ul><li>0.01 arbitrary units</li><li>0.1 arbitrary units</li><li>1 arbitrary unit</li><li>10 arbitrary units</li></ul>",
 "0.1 arbitrary units — tube 3, which grew by far the most root",
 "Figure 8 is artwork in the PDF; what it shows is stated at 07.1."),
("7","4",1,"explain",IE,"diagram","", "<p>Give evidence from <b>Figure 8</b> that a high concentration of chemical <b>Q</b> may be toxic to geranium plants.</p>",
 "There is reduced or no root growth at the higher concentrations — tube 6, at 100 units, grew no roots at all",
 "Figure 8 is artwork in the PDF; what it shows is stated at 07.1."),
("7","5",4,"written",IE,"", "", "<p>The gardener has four types of geranium plant: <b>A</b>, <b>B</b>, <b>C</b> and <b>D</b>. Plant <b>A</b> produces larger, more brightly-coloured flowers than any of the other plants. The gardener wants to grow more plants of type <b>A</b>.</p><p>Explain why the gardener chooses to take cuttings from plant <b>A</b> instead of growing seeds from plant <b>A</b>.</p>",
 "Level-marked out of 4. Cuttings are quicker — no waiting for flowers, fruit and seed. They are asexual reproduction, so there is no fusing of gametes and no mixing of alleles from two parents: it is mitosis, which copies the genetic material exactly, rather than meiosis. So every offspring is a clone of plant A and has the same large, brightly-coloured flowers, where seeds would vary through pollination from other geraniums. That also means consistent quality and a quicker turnover for the gardener.", ""),

("8","1",1,"short",IE,"diagram","", "<p>In 1866, a monk called Gregor Mendel published the results of his investigations into inheritance in pea plants. Pea seeds can be round or wrinkled in shape. Mendel crossed pea plants that produced round seeds with pea plants that produced wrinkled seeds. <b>Figure 10</b> shows the result: plant 1 (round seeds) crossed with plant 2 (wrinkled seeds) gave plants 3 and 4, which all produced round seeds.</p><p>Use these symbols for the alleles: <b>R</b> = dominant allele for round seeds, <b>r</b> = recessive allele for wrinkled seeds.</p><p>In <b>Figure 10</b>, the genotype of plant 1 is <b>RR</b>. Give the genotype of plant 2.</p>",
 "rr — homozygous recessive",
 "Figures 9 and 10 are artwork in the PDF; what Figure 10 shows is stated in the question."),
("8","2",3,"annotate",IE,"diagram","", "<p>Mendel collected the seeds from plants 3 and 4 and grew new plants from the seeds. Mendel crossed the new plants.</p><p>Complete the Punnett square diagram in <b>Figure 11</b>. You should show the male gametes and the offspring genotypes.</p>" + PUNNETT,
 "The male gametes are R and r, the same as the female's. The four offspring are RR, Rr, Rr and rr. Two or three correct offspring cells score 1 of the 2 marks for them.", ""),
("8","3",1,"short",IE,"", "", "<p>Give the ratio of round seeds to wrinkled seeds in the offspring in <b>Figure 11</b>.</p>",
 "3 : 1 — three of the four genotypes carry at least one R", ""),
("8","4",1,"short",IE,"", "", "<p>Some of the offspring in <b>Figure 11</b> are homozygous and some are heterozygous.</p><p>What does 'heterozygous' mean?</p>",
 "Having two different alleles of a gene. (Not 'two different genes'.)", ""),
("8","5",2,"explain",IE,"", "", "<p>Mendel published his work in 1866.</p><p>Suggest <b>two</b> reasons why the importance of Mendel's work was not recognised until the early 1900s.</p>",
 "Any two of: other scientists were not aware of his work, or it was published in an obscure journal and lost for years; other theories such as blending inheritance were accepted at the time; he was not considered a scientist — he was only a monk; his mathematical approach was a novel idea nobody understood; peas gave unusual results compared with other species, and his results were not corroborated; later discoveries were what made his work relevant.", ""),

("9","1",1,"short",IE,"", "", "<p>Evolution of new species occurs by mutation and natural selection.</p><p>What is a mutation?</p>",
 "A change in the DNA — in a base, in the base sequence, in a gene or allele, or in part of or the number of chromosomes", ""),
("9","2",3,"explain",IE,"", "", "<p>Describe the process of natural selection.</p>",
 "Any three of: there is variation between members of a species; the better adapted individuals survive; those survivors reproduce; and they pass on the favourable alleles to their offspring", ""),
("9","3",1,"short",IE,"", "", "<p>Which scientists suggested the theory of evolution by natural selection? Tick <b>one</b> box.</p><ul><li>Alexander Fleming and Carl Woese</li><li>Alfred Wallace and Alexander Fleming</li><li>Alfred Wallace and Charles Darwin</li><li>Charles Darwin and Carl Woese</li></ul>",
 "Alfred Wallace and Charles Darwin", ""),
("9","4",3,"explain",IE,"diagram","", "<p>The hoverfly and the wasp are insects with bright yellow and black markings. <b>Figure 12</b> is a pair of photographs of a hoverfly and a wasp, side by side, showing how similar their yellow and black banding is. The wasp has a sting to defend itself against predators. The hoverfly does not have a sting. Hoverflies and wasps live in the same habitat.</p><p>Explain how having yellow and black markings helps the hoverfly survive.</p>",
 "The hoverfly looks like a wasp — the pattern of markings is similar. Predators avoid wasps so that they do not get stung. So a predator does not attack or eat the hoverfly either.",
 "Figure 12 is a photograph in the PDF and is not transcribed."),

("10","1",3,"explain",EC,"diagram","", "<p>Peat bogs are estimated to contain twice as much carbon as all the world's forests. <b>Figure 13</b> is a cut-away section through part of a peat bog: a living surface of moss and sundew plants, a layer <b>A</b> just below it, and a darker layer <b>B</b> beneath that. Layer <b>A</b> contains a lot of air. Layer <b>B</b> contains the dead remains of plants, has a low pH, contains very little oxygen, and contains carbon dioxide and methane.</p><p>Explain why most of the dead remains of plants in layer <b>B</b> do not decay.</p>",
 "There is not enough oxygen for aerobic respiration, so less energy is released, in the decomposers — the microorganisms, bacteria and fungi. Alternatively: the low pH denatures their enzymes, so there are fewer reactions and less energy released in the decomposers.",
 "Figure 13 is artwork in the PDF; what it shows is stated in the question."),
("10","2",1,"short",EC,"diagram","", "<p>The peat bog in <b>Figure 13</b> is a stable community. The moss produces biomass at a rate of 340 g/m<sup>2</sup>/year.</p><p>What is the approximate biomass of the moss that becomes biomass in primary consumers? Tick <b>one</b> box.</p><ul><li>0.34 g/m<sup>2</sup>/year</li><li>3.4 g/m<sup>2</sup>/year</li><li>34 g/m<sup>2</sup>/year</li><li>340 g/m<sup>2</sup>/year</li></ul>",
 "34 g/m²/year — about 10% of the biomass passes to the next trophic level", ""),
("10","3",1,"short",EC,"", "", "<p>The sundew plant shown in <b>Figure 13</b> has leaves with sticky hairs that trap and digest insects. Digestion of the insects releases phosphates and simple compounds of nitrogen that are used by the sundew plant.</p><p>What substance can the sundew plant make using the phosphates? Tick <b>one</b> box.</p><ul><li>Cellulose</li><li>DNA</li><li>Glycerol</li><li>Starch</li></ul>",
 "DNA", ""),
("10","4",1,"short",EC,"", "", "<p>What substance can the sundew plant make using the nitrogen? Tick <b>one</b> box.</p><ul><li>Fatty acid</li><li>Glucose</li><li>Lactic acid</li><li>Protein</li></ul>",
 "Protein", ""),
("10","5",4,"explain",EC,"diagram","", "<p>Humans have destroyed large areas of peat bog to collect peat. The peat provides fuel and provides compost for gardeners to use. The peat comes from layer <b>B</b>. <b>Figure 14</b> is a photograph of peat being cut and removed from a bog.</p><p>Explain how the destruction of peat bogs and the use of peat affects the temperature of the Earth's atmosphere.</p>",
 "The temperature increases — global warming. Carbon dioxide is released from the peat bog; carbon dioxide is produced by burning the peat and by its decay once it is exposed; and methane is released from the bog as well. There are also fewer plants left to take carbon dioxide in by photosynthesis.",
 "Figure 14 is a photograph in the PDF and is not transcribed."),

("11","1",1,"explain",EC,"", "", "<p>Frogs are animals that lay their eggs in water. The eggs hatch as tadpoles. Students investigated the number of tadpoles in a pond for 8 weeks. This is the method used.</p><ol><li>Collect 10 dm<sup>3</sup> of pond water in a bucket.</li><li>Count the number of tadpoles collected.</li><li>Put the tadpoles back into the pond.</li><li>Repeat steps 1 to 3 another three times in different parts of the pond.</li><li>Repeat steps 1 to 4 at intervals for 8 weeks.</li></ol><p>Suggest <b>one</b> improvement to the method.</p>",
 "Any one of: collect more samples each time; sample more often; use a bigger bucket; do not return the tadpoles until after the fourth sample, so none is counted twice; sample at the same time of day; randomise where the samples are taken; sample at a range of depths; use standardised net sweeps instead of a bucket", ""),
("11","2",1,"calculation",EC,"", "", "<p><b>Table 1</b> shows the results.</p>" + T1 + "<p>Value <b>X</b> is the number of tadpoles in sample 4, at 3 weeks. Calculate value <b>X</b>.</p>",
 "6 — the column totals 32, and 9 + 7 + 10 = 26", ""),
("11","3",4,"drawing",EC,"graph", fig15(), "<p><b>Figure 15</b> is a grid whose y-axis is already labelled 'Total number of tadpoles' and numbered 0 to 70 in tens. The x-axis has no label and no scale.</p><p>Complete <b>Figure 15</b> to show how the <b>total</b> number of tadpoles changed over the 8 weeks. You should label the x-axis, use a suitable scale for the x-axis, plot the data for the total numbers of tadpoles from <b>Table 1</b>, and draw a line of best fit.</p>",
 "Label the x-axis 'Weeks' with a linear scale using at least half the grid, then plot (0, 60), (1, 58), (2, 50), (3, 32), (5, 16) and (8, 12) and draw a curved line of best fit. Half a small square of tolerance; four or five correct plots score 1 of the 2 plotting marks.", ""),
("11","4",3,"calculation",EC,"graph", fig15(), "<p>After 0 weeks, no more tadpoles hatched in the pond.</p><p>Calculate the percentage of the tadpoles that would still be found in the pond at 4 weeks compared with 0 weeks. Use information from <b>Figure 15</b>.</p>",
 "About 37%. Read the line of best fit at 0 weeks and at 4 weeks — for example 60 and 22 — then 22 ÷ 60 × 100 = 36.7%. Any values read off your own line, within half a small square, are accepted.", ""),
("11","5",2,"explain",EC,"", "", "<p>After 4 weeks many of the tadpoles had died.</p><p>Suggest <b>two</b> reasons why the tadpoles died.</p>",
 "Any two of: disease or a named pathogen; being eaten by predators; lack of food, or competition for it; low oxygen in the water; a change in temperature; a change in pH; part of the pond drying out; a toxic chemical such as sewage or fertiliser", ""),
]

# ---- the paper says what it is out of, and so does every box down the margin ----
PER_QUESTION = {"1": 9, "2": 10, "3": 8, "4": 8, "5": 9, "6": 10,
                "7": 9, "8": 8, "9": 8, "10": 10, "11": 11}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())

# ---- every number the scheme prints inside its own working, recomputed here ----
assert 30 - 20 == 10                                   # 05.4
assert 100 / 0.01 == 10000                             # 07.2
assert 32 - (9 + 7 + 10) == 6                          # 11.2, from Table 1's own column total
assert round(22 / 60 * 100, 1) == 36.7                 # 11.4, the scheme's worked example
assert round(340 * 0.10) == 34                         # 10.2, one trophic level up
# and Figure 15 has room for every total it has to carry
assert max(60, 58, 50, 32, 16, 12) <= ROWS * 10

# no topic name may contain a comma: `topics` is a comma-list, and a comma is a second topic
for _, _, _, _, topics, *_ in Q:
    assert ',' not in topics, topics

d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 6

rows = []
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-8461-2406-2F-%02d%s' % (int(q), part), kind='question',
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
