#!/usr/bin/env python3
"""AQA GCSE Biology 8461/2H, June 2024 — the document row and 43 question rows.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Higher)_ Paper 2 - June 2024.pdf`, AQA's own 8461/2H
scheme — read, not derived, for the reason CLAUDE.md records about the 2017 Highers.

WHAT THE PAPER SAYS IT IS OUT OF. The cover says 100 and the nine boxes down the margin say
8, 10, 11, 15, 14, 11, 13, 10, 8. Both are asserted below, and so is every intermediate the scheme
prints inside its own working — the missing table value, the percentage read off the graph, both
routes through the maize energy calculation, the biomass ratio and the one-in-2500.

THREE FIGURES ARE DRAWN AND EACH IS A DRAWING INSTRUCTION WITH EXACTLY ONE ANSWER.

  Figure 4 and Figure 11 are the grids two plotting questions are drawn ON — and both are RASTER
  images inside the PDF, no text layer and no vectors, so their majors were found by their own
  regular spacing in the pixels. That is CLAUDE.md's rule for a picture that carries data, and it
  is what fixes the scale: Figure 4 is 8 columns by 7 rows with the y-axis printed 0 to 70 in tens
  and the x-axis deliberately blank, which is where two of its four marks are; Figure 11 is 14 by 6
  with a heavier zero line up the middle, which is what "symmetrical around 0" in its scheme means.

  Figure 10 is the polydactyly pedigree, and a pedigree is DATA rather than artwork: twelve people,
  who is affected, who is married to whom, who is whose child. Every one of those facts is in the
  printed symbols, and questions 06.2 and 06.3 — six marks — cannot be answered without them. It is
  built from a table of those facts rather than drawn by hand, so the picture and the prose under it
  cannot disagree; CLAUDE.md records that shape from the Corbettmaths fraction sheets.

EVERYTHING ELSE IS ARTWORK AND WHAT IT SHOWS IS SAID IN WORDS. A hoverfly beside a wasp, a section
through a peat bog, peat being cut, a bean seedling, two sets of apparatus, a metre rule being
dropped, a diagram of the endocrine glands. None is a picture the row's own words determine, and
Figure 7 in particular is the drawing the STUDENT is asked to finish. Each carries `figure` so
`check-library.js` counts it as outstanding rather than letting the prose hide it.
"""
import json, datetime, pathlib, sys
from fractions import Fraction
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import W, blankgrid

PAPER = 'P-AQA-8461-2406-2H'
SRC = 'https://drive.google.com/file/d/1bChd05jlDhK9CbfYakb1MurGZ5vDomT6/view'
BASE = dict(subject='Biology', key_stage='KS4', band_type='stage', band_value='GCSE',
            tier='Higher', level='GCSE', company='AQA', exam_board='AQA', spec_code='8461/2H',
            exam_wave='First wave', year='2024', month='6', paper='2', exam_date='2024-06-07',
            document_type='Past paper', name='Paper 2 — June 2024', active='True',
            trackable='True', printable='False')
DOC = dict(BASE, row_id='D-' + PAPER, paper_id=PAPER, kind='document', total_marks='100',
           needs='Calculator, Ruler', source_url=SRC)

IE = 'Inheritance & Evolution'; EC = 'Ecology'; HR = 'Homeostasis & Response'
OG = 'Organisation'; BE = 'Bioenergetics'

# --- Figure 4: 8 columns by 7 rows, y printed 0 to 70 in tens, x-axis blank. Measured off the
# --- raster: majors 59 px apart, eight of them across and seven up, the y labels on the majors.
F4_COLS, F4_ROWS, F4_PER = 8, 7, 10
FIG4 = blankgrid(F4_COLS, F4_ROWS, 34, [], F4_PER,
                 'Blank graph grid, y-axis printed 0 to 70, x-axis blank',
                 left=52, ylab='Total number of tadpoles', ynums=True)

# --- Figure 11: 14 columns by 6 rows with the zero line up the middle at column 7, so there is the
# --- same room either side of it — which is what the scheme's "symmetrical around 0" asks for.
F11_COLS, F11_ROWS, F11_ZERO = 14, 6, 7
FIG11 = blankgrid(F11_COLS, F11_ROWS, 22, [], 1,
                  'Blank grid for a pyramid of biomass, with a zero line up the middle',
                  left=16, zero_col=F11_ZERO)


# --- Figure 10: the pedigree, built from the facts rather than drawn. A square is a male, a circle
# --- a female, filled means polydactyly. ---------------------------------------------------------
PEOPLE = {                      # id: (x, generation, male?, affected?)
    1: (55, 0, True, True),   2: (110, 0, False, False),
    3: (215, 0, True, False),  4: (270, 0, False, False),
    5: (45, 1, True, False),   6: (120, 1, False, True),
    7: (175, 1, True, False),  8: (240, 1, False, False), 9: (300, 1, False, False),
    10: (105, 2, True, False), 11: (150, 2, True, False), 12: (195, 2, True, False),
}
COUPLES = [(1, 2, [5, 6]), (3, 4, [7, 8, 9]), (6, 7, [10, 11, 12])]
GEN_Y = [22, 92, 162]
SZ = 15


def pedigree():
    p = ['<svg viewBox="0 0 %d 196" role="img" aria-label="Family tree showing the inheritance of '
         'polydactyly through three generations">' % W]
    for a, b, kids in COUPLES:
        ya = GEN_Y[PEOPLE[a][1]]
        xa, xb = PEOPLE[a][0], PEOPLE[b][0]
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="1"/>'
                 % (xa + SZ / 2, ya, xb - SZ / 2, ya))
        mid = (xa + xb) / 2.0
        ky = GEN_Y[PEOPLE[kids[0]][1]]
        bar = ky - 22
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="currentColor" '
                 'stroke-width="1"/>' % (mid, ya, mid, bar))
        xs = [PEOPLE[k][0] for k in kids]
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="currentColor" '
                 'stroke-width="1"/>' % (min(min(xs), mid), bar, max(max(xs), mid), bar))
        for k in kids:
            p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" '
                     'stroke-width="1"/>' % (PEOPLE[k][0], bar, PEOPLE[k][0], ky - SZ / 2))
    for n, (x, gen, male, aff) in sorted(PEOPLE.items()):
        y = GEN_Y[gen]
        fill = 'currentColor' if aff else 'none'
        if male:
            p.append('<rect x="%.1f" y="%.1f" width="%d" height="%d" fill="%s" '
                     'stroke="currentColor" stroke-width="1.2"/>'
                     % (x - SZ / 2, y - SZ / 2, SZ, SZ, fill))
        else:
            p.append('<circle cx="%d" cy="%d" r="%.1f" fill="%s" stroke="currentColor" '
                     'stroke-width="1.2"/>' % (x, y, SZ / 2, fill))
        p.append('<text x="%d" y="%.1f" class="lbl" style="text-anchor:middle">%d</text>'
                 % (x, y + SZ / 2 + 12, n))
    return ''.join(p) + '</svg>'


FIG10 = pedigree()

T1 = ('<table><tr><th>Sample number</th><th>0 weeks</th><th>1 week</th><th>2 weeks</th>'
      '<th>3 weeks</th><th>5 weeks</th><th>8 weeks</th></tr>'
      '<tr><td>1</td><td>11</td><td>17</td><td>8</td><td>9</td><td>5</td><td>0</td></tr>'
      '<tr><td>2</td><td>15</td><td>11</td><td>12</td><td>7</td><td>0</td><td>5</td></tr>'
      '<tr><td>3</td><td>23</td><td>16</td><td>14</td><td>10</td><td>7</td><td>3</td></tr>'
      '<tr><td>4</td><td>11</td><td>14</td><td>16</td><td><b>X</b></td><td>4</td><td>4</td></tr>'
      '<tr><td><b>Totals</b></td><td>60</td><td>58</td><td>50</td><td>32</td><td>16</td>'
      '<td>12</td></tr></table>')
T2 = ('<table><tr><th>Amino acid</th><th>Normal maize (g/kg)</th>'
      '<th>Quality protein maize, QPM (g/kg)</th></tr>'
      '<tr><td>Leucine</td><td>122.2</td><td>88.1</td></tr>'
      '<tr><td>Lysine</td><td>28.9</td><td>41.9</td></tr>'
      '<tr><td>Methionine</td><td>19.9</td><td>18.1</td></tr>'
      '<tr><td>Phenylalanine</td><td>49.4</td><td>40.9</td></tr>'
      '<tr><td>Threonine</td><td>34.5</td><td>36.5</td></tr>'
      '<tr><td>Tryptophan</td><td>7.3</td><td>16.3</td></tr>'
      '<tr><td>Valine</td><td>45.9</td><td>51.2</td></tr></table>')

PEAT = ('<p>Peat bogs are estimated to contain twice as much carbon as all the world’s '
        'forests. <b>Figure 2</b> is a section through part of a peat bog, with a sundew plant '
        'growing on the surface. Layer <b>A</b>, at the top, contains a lot of air. Layer <b>B</b>, '
        'below it, contains the dead remains of plants, has a low pH, contains very little oxygen, '
        'and contains carbon dioxide and methane.</p>')
TADPOLE = ('<p>Frogs lay their eggs in water and the eggs hatch as tadpoles. Students investigated '
           'the number of tadpoles in a pond for 8 weeks. This is the method used.</p><ol>'
           '<li>Collect 10 dm<sup>3</sup> of pond water in a bucket.</li>'
           '<li>Count the number of tadpoles collected.</li>'
           '<li>Put the tadpoles back into the pond.</li>'
           '<li>Repeat steps 1 to 3 another three times in different parts of the pond.</li>'
           '<li>Repeat steps 1 to 4 at intervals for 8 weeks.</li></ol>')
SEEDLING = ('<p>A student investigated the effect of gravity on the growth of bean seedlings, '
            'putting ink marks at even spacings along the root of each seedling (<b>Figure 5</b>). '
            '<b>Figure 6</b> shows the two sets of apparatus. In apparatus <b>A</b> the seedlings '
            'are held still, surrounded by damp blotting paper, so that gravity acts down one side '
            'of each root. In apparatus <b>B</b> the seedlings are on a slowly turning wheel, so '
            'that gravity acts equally on every side. Both were left in a dark cupboard for 24 '
            'hours.</p>')
CHICKEN = ('<p>A farmer has 1000 chickens and feeds them on seeds from maize plants.</p><ul>'
           '<li>1 hectare of land produces 16.4 tonnes of maize seeds.</li>'
           '<li>The maize seeds have an energy content of 16 MJ per kg.</li>'
           '<li>Chickens can use 80% of the energy in maize seeds.</li>'
           '<li>Each chicken needs 46 MJ of energy to grow to full size.</li></ul>')
QPM = ('<p>Protein is an important part of a chicken’s diet. Proteins contain 20 different '
       'types of amino acid; a chicken can make many of them from other substances in the diet, '
       'but the essential amino acids are the ones it cannot make and must be given. Maize seeds '
       'contain protein but the proportion of some essential amino acids is low, so scientists '
       'have produced Quality Protein Maize (QPM). <b>Table 2</b> compares the proportions of '
       'seven essential amino acids in the two.</p>' + T2)
PEDI = ('<p>Polydactyly is an inherited disorder: a person with polydactyly has extra fingers or '
        'toes, and it is caused by a dominant allele. <b>Figure 10</b> shows the inheritance of '
        'polydactyly in one family. A square is a male and a circle is a female; a filled symbol '
        'is a person who has polydactyly. Person <b>1</b> (male, polydactyly) and person <b>2</b> '
        '(female) have two children, <b>5</b> (male) and <b>6</b> (female, polydactyly). Person '
        '<b>3</b> (male) and person <b>4</b> (female) have three children, <b>7</b> (male), '
        '<b>8</b> (female) and <b>9</b> (female). Persons <b>6</b> and <b>7</b> have three '
        'children, <b>10</b>, <b>11</b> and <b>12</b>, all male and none with polydactyly.</p>'
        '<p>In questions 06.2 and 06.3, use these symbols: <b>D</b> = the allele for having '
        'polydactyly, <b>d</b> = the allele for not having polydactyly.</p>')

ART = 'Artwork in the PDF; what it shows is stated in the question.'

# (question, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",1,"short",IE,"","", "<p>Evolution of new species occurs by mutation and natural selection.</p><p>What is a mutation?</p>",
 "A change in the DNA — in the base code or nucleotide sequence, in a base, in a gene or allele, in part of a chromosome, in the number of chromosomes, or in the genetic material. 'Genetic information' and 'variation' are ignored, and so is any reference to amino acids or proteins.", ""),
("1","2",3,"explain",IE,"","", "<p>Describe the process of natural selection.</p>",
 "Any three of: there is variation between members of a species; the better adapted survive (survival of the fittest); the survivors reproduce; and they pass on the favourable alleles or genes. An answer given in terms of a worked example is accepted.", ""),
("1","3",1,"short",IE,"","", "<p>Which scientists suggested the theory of evolution by natural selection? Tick <b>one</b> box.</p><ul><li>Alexander Fleming and Carl Woese</li><li>Alfred Wallace and Alexander Fleming</li><li>Alfred Wallace and Charles Darwin</li><li>Charles Darwin and Carl Woese</li></ul>",
 "Alfred Wallace and Charles Darwin", ""),
("1","4",3,"explain",IE,"photograph","", "<p>The hoverfly and the wasp are insects with bright yellow and black markings. <b>Figure 1</b> is a photograph of a hoverfly beside a wasp, showing that the two have a very similar pattern of yellow and black bands.</p><p>The wasp has a sting to defend itself against predators. The hoverfly does not have a sting. Hoverflies and wasps live in the same habitat.</p><p>Explain how having yellow and black markings helps the hoverfly survive.</p>",
 "The hoverfly looks like a wasp — the pattern of markings is similar; a predator avoids wasps so that it does not get stung; so the predator does not attack or eat the hoverfly. ('The predator thinks it is a wasp' is ignored.)",
 ART),

("2","1",3,"explain",EC,"diagram","", PEAT + "<p>Explain why most of the dead remains of plants in layer <b>B</b> do not decay.</p>",
 "There is a lack of oxygen for aerobic respiration; so less or no energy is released; in the microorganisms — the bacteria, fungi and decomposers. The alternative route also scores three: the low pH denatures enzymes, so there are fewer reactions and less energy released, in the microorganisms. Respiration in the dead plants is not accepted, and neither is energy being 'produced' or 'made'.",
 ART),
("2","2",1,"short",EC,"diagram","", PEAT + "<p>The peat bog in <b>Figure 2</b> is a stable community. The moss produces biomass at a rate of 340 g/m<sup>2</sup>/year.</p><p>What is the approximate biomass of the moss that becomes biomass in primary consumers? Tick <b>one</b> box.</p><ul><li>0.34 g/m<sup>2</sup>/year</li><li>3.4 g/m<sup>2</sup>/year</li><li>34 g/m<sup>2</sup>/year</li><li>340 g/m<sup>2</sup>/year</li></ul>",
 "34 g/m²/year — about 10% of the biomass at one trophic level is transferred to the next",
 ART),
("2","3",1,"short",EC,"","", "<p>The sundew plant shown in <b>Figure 2</b> has leaves with sticky hairs that trap and digest insects. Digestion of the insects releases phosphates and simple compounds of nitrogen that the sundew plant uses.</p><p>What substance can the sundew plant make using the phosphates? Tick <b>one</b> box.</p><ul><li>Cellulose</li><li>DNA</li><li>Glycerol</li><li>Starch</li></ul>",
 "DNA", ""),
("2","4",1,"short",EC,"","", "<p>What substance can the sundew plant make using the nitrogen? Tick <b>one</b> box.</p><ul><li>Fatty acid</li><li>Glucose</li><li>Lactic acid</li><li>Protein</li></ul>",
 "Protein", ""),
("2","5",4,"explain",EC,"photograph","", "<p>Humans have destroyed large areas of peat bog to collect peat, which provides fuel and compost for gardeners. The peat comes from layer <b>B</b>. <b>Figure 3</b> shows peat being cut and removed from a peat bog.</p><p>Explain how the destruction of peat bogs and the use of peat affects the temperature of the Earth’s atmosphere.</p>",
 "The temperature increases — global warming, heat energy trapped; because carbon dioxide is released from the peat bog; because carbon dioxide is produced by burning or by the decay of the peat; and because methane is released from the peat bog. That there are fewer plants left to take carbon dioxide in for photosynthesis is also allowed.",
 ART),

("3","1",1,"short",EC,"","", TADPOLE + "<p>Suggest <b>one</b> improvement to the method.</p>",
 "Any one of: collect more samples each time; collect samples more frequently; use a bigger bucket or sample; do not return the tadpoles until after the fourth sample (any method that avoids double counting); sample at the same time of day; randomise the collecting positions; collect at a range of depths; use standardised sweeps with a net instead of a bucket.", ""),
("3","2",1,"calculation",EC,"","", TADPOLE + "<p><b>Table 1</b> shows the results.</p>" + T1 + "<p>Value <b>X</b> is the number of tadpoles in sample 4, at 3 weeks. Calculate value <b>X</b>.</p>",
 "6 — the total at 3 weeks is 32 and the other three samples give 9 + 7 + 10 = 26", ""),
("3","3",4,"drawing",EC,"graph",FIG4, "<p><b>Figure 4</b> is a graph grid whose y-axis is already printed and labelled ‘Total number of tadpoles’, running from 0 to 70 in tens. The x-axis is blank.</p><p>Complete <b>Figure 4</b> to show how the <b>total</b> number of tadpoles changed over the 8 weeks. You should:</p><ul><li>label the x-axis</li><li>use a suitable scale for the x-axis</li><li>plot the data for the <b>total</b> numbers of tadpoles from <b>Table 1</b></li><li>draw a line of best fit.</li></ul>",
 "Label the x-axis 'Time in weeks' and give it a correct linear scale using at least half the available space (1 mark). Plot all six totals — 60, 58, 50, 32, 16 and 12 at 0, 1, 2, 3, 5 and 8 weeks (2 marks, or 1 mark for four or five correct plots; half a small square of tolerance). Draw a curved line of best fit (1 mark) — a line drawn point to point is ignored.", ""),
("3","4",3,"calculation",EC,"graph",FIG4, "<p>After 0 weeks, no more tadpoles hatched in the pond.</p><p>Calculate the percentage of the tadpoles that would still be found in the pond at 4 weeks compared with 0 weeks. Use information from <b>Figure 4</b>.</p>",
 "About 36.7%. Read the values at 0 and 4 weeks off your own line of best fit — 60 and about 22 (1 mark); 22 ÷ 60 × 100 (1 mark); 36.7, and 37 or 36.6… are accepted (1 mark). Any calculation consistent with your own line scores. If no line was drawn, 60 and 24 taken from the table are allowed for full marks.", ""),
("3","5",2,"short",EC,"","", "<p>After 4 weeks many of the tadpoles had died.</p><p>Suggest <b>two</b> reasons why the tadpoles died.</p>",
 "Any two of: disease or a named pathogen; being eaten by predators; lack of food (competition for food); low oxygen concentration in the water (eutrophication); a change in temperature; a change in pH; some of the pond dried out (lack of space); a toxic chemical such as sewage or fertiliser. Unqualified 'competition', 'pollution' and 'waste' are ignored.", ""),

("4","1",1,"explain",HR,"diagram","", SEEDLING + "<p>Give the reason why the student placed both sets of apparatus in the dark.</p>",
 "To prevent the direction of the light affecting the results or the growth of the roots — to prevent phototropism, so that only gravity affects the growth.",
 ART),
("4","2",2,"short",HR,"diagram","", SEEDLING + "<p>What are <b>two</b> reasons for surrounding the seedlings with damp blotting paper? Tick <b>two</b> boxes.</p><ul><li>To prevent photosynthesis in the roots</li><li>To prevent the growth of mould on the roots</li><li>To prevent water affecting the direction of root growth</li><li>To provide enough water for root growth</li><li>To provide the roots with mineral ions</li></ul>",
 "To prevent water affecting the direction of root growth; and to provide enough water for root growth.",
 ART),
("4","3",2,"explain",HR,"diagram","", "<p>Apparatus <b>B</b> is a control.</p><p>Explain why apparatus <b>B</b> is needed.</p>",
 "To compare with apparatus A — to see the difference between them; so that it shows that gravity caused the results in apparatus A, because gravity acted equally in all directions in B, cancelling out its one-sided effect.",
 ART),
("4","4",3,"drawing",HR,"diagram","", "<p><b>Figure 7</b> shows one seedling from apparatus <b>A</b> at the start of the investigation and after 24 hours. At the start the root is straight, horizontal, and has evenly spaced ink marks along it. The drawing of the seedling after 24 hours is not complete — the root is missing.</p><p>Complete <b>Figure 7</b> to show the appearance of the root after 24 hours, and the ink marks on the root after 24 hours.</p>",
 "Draw the root bending downwards (1); draw it longer than it was at the start (1); and show the ink marks spread out in the bent region (1). Marks spread out before the bend are not accepted.",
 "Figure 7 is the drawing the student is asked to finish; it is artwork in the PDF and what it starts as is stated in the question."),
("4","5",1,"short",HR,"diagram","", "<p>Describe how a root from apparatus <b>B</b> would look different from the root you drew in Question 04.4.</p>",
 "It would be horizontal — growing straight out, not bent at all.",
 ART),
("4","6",2,"explain",HR,"","", "<p>Auxin is a plant hormone.</p><p>Explain how auxin causes the results in apparatus <b>A</b>.</p>",
 "There is an uneven distribution of auxin — more of it on the lower side; so the upper side grows faster than the lower (or the lower side grows more slowly than the upper). 'More auxin on the upper side' is ignored.", ""),
("4","7",2,"short",HR,"","", "<p>Farmers can use plant hormones to control the growth of plants.</p><p>Give <b>two</b> uses of auxin.</p>",
 "Any two of: as weed killers; in rooting powders, to grow plants from cuttings; to promote growth in tissue culture; to inhibit lateral buds.", ""),
("4","8",2,"short",HR,"","", "<p>A farmer sprayed an apple tree with gibberellin.</p><p>Suggest <b>two</b> reasons why the farmer sprayed the apple tree with gibberellin.</p>",
 "Any two of: to promote, start or force flowering (to grow more flowers); to get more fruit; to get bigger fruits. The idea of the fruits ripening at the same time is also allowed, and if neither 'more' nor 'bigger' is given, a bigger yield of apples scores one.", ""),

("5","1",2,"short",HR,"diagram","", "<p>The human body has two coordination systems: the nervous system and the endocrine system.</p><p>Two students investigated human reaction time. Student <b>A</b> held a metre rule above student <b>B</b>’s hand, then released it, and student <b>B</b> caught the rule as quickly as possible. <b>Figure 8</b> shows the method: the rule held vertically between the open thumb and finger of the other student’s hand.</p><p>Suggest <b>two</b> ways to improve the students’ method for measuring human reaction time.</p>",
 "Any two of: use the same starting position of the ruler each time (or any other control variable); use a more precise scale — a ruler with millimetres; repeat and calculate a mean, or repeat and eliminate anomalies; convert the distance into a time; rest student B's hand or arm on a table.",
 ART),
("5","2",2,"short",HR,"","", "<p>Student <b>B</b>’s reaction is coordinated by the nervous system.</p><p>Give <b>two</b> ways that coordination by the endocrine system is different from coordination by the nervous system.</p>",
 "Any two of: the endocrine system sends hormones via the blood rather than along neurones; it is chemical rather than electrical transmission; it is slower; its effects are longer-lasting. The answers must be comparative.", ""),
("5","3",1,"short",HR,"diagram","", "<p><b>Figure 9</b> is a diagram of the endocrine glands in a female, with gland <b>A</b> labelled in the neck and gland <b>B</b> labelled behind the stomach.</p><p>Name <b>one</b> hormone produced by gland <b>A</b>.</p>",
 "Thyroxine (not 'thyroxide'; TSH and TRH are ignored)",
 ART),
("5","4",1,"short",HR,"diagram","", "<p>Name <b>one</b> hormone produced by gland <b>B</b>.</p>",
 "Insulin or glucagon",
 ART),
("5","5",2,"short",HR,"","", "<p>The adrenal gland produces the hormone adrenaline.</p><p>Describe <b>two</b> effects of adrenaline on the human body.</p>",
 "Any two of: increases the heart rate (blood flow); increases the breathing rate; increases oxygen delivery to the cells and tissues; increases glucose delivery to them; increases respiration or metabolism — energy release; increases sweating. Dilation of the pupils, vasoconstriction in the skin and digestive system, vasodilation in the muscles and brain, raised blood pressure, raised blood glucose and slowed digestion are all accepted. 'Prepares for fight or flight' alone scores one.", ""),
("5","6",6,"written",HR,"","", "<p>Hormones can be used for controlling human reproduction.</p><p>Explain the use of hormones in contraception, and in the treatment of infertility.</p>",
 "Level-marked out of 6, and Level 3 needs both halves. Contraception: oestrogen and progesterone, or progesterone alone, inhibit the production of FSH — so no follicle or egg matures and there is no egg to fertilise — and inhibit LH, so there is no ovulation. The methods include the oral pill, an injection, an implant, a skin patch and a hormonal IUD or IUS. Infertility: FSH stimulates several eggs to mature, increasing the number available; LH stimulates ovulation and lets the eggs be collected from the ovary, which increases the chance of fertilising one, as in IVF where an embryo is then inserted into the uterus; progesterone maintains the uterus lining and increases the chance of implantation.", ""),

("6","1",1,"short",IE,"","", "<p>Some human disorders are inherited. Polydactyly is an inherited disorder, caused by a dominant allele.</p><p>What is a dominant allele?</p>",
 "An allele that is always expressed — that shows in the phenotype even when the recessive allele is also present, that is expressed in the heterozygote, or that is expressed when only one copy is present. 'Stronger' is ignored.", ""),
("6","2",2,"explain",IE,"diagram",FIG10, PEDI + "<p>Person <b>1</b> is heterozygous.</p><p>Explain how <b>Figure 10</b> shows that person <b>1</b> is heterozygous.</p>",
 "Person 1 has polydactyly, so must have a D (a dominant allele); and person 1 has a child, person 5, who does not have polydactyly — person 5 must be dd, so must have inherited a d from person 1. An annotated genetic diagram scores both marks.", ""),
("6","3",4,"drawing",IE,"diagram",FIG10, "<p>Persons <b>6</b> and <b>7</b> are expecting a fourth child. A doctor states that the probability of having a child with polydactyly is 0.5</p><p>Explain how the doctor determined this probability. You should draw a Punnett square diagram, give the genotype of person <b>6</b> and the genotype of person <b>7</b>, and identify all the offspring that will have polydactyly.</p>",
 "Person 6 has polydactyly and has children without it, so she is <b>Dd</b> and her gametes are D and d (1 mark). Person 7 does not have polydactyly, so he is <b>dd</b> and both his gametes are d (1 mark). The Punnett square gives Dd, Dd, dd, dd (1 mark, and it must follow from the gametes given). Two of the four are Dd, which is half, so the probability of polydactyly is 0.5 (1 mark, awarded only if the square is right).", ""),
("6","4",4,"explain",IE,"","", "<p>Cystic fibrosis (CF) is another inherited disorder, caused by a mutation in a gene called CFTR. For the CFTR gene, one allele in every 50 in the UK population is the cystic fibrosis allele.</p><p>Explain why only one person in 2500 in the UK population has cystic fibrosis.</p>",
 "The CF allele is recessive; so to have CF a person must have two CF alleles; the chance of any one allele being the CF allele is 1 in 50; and the chance of having two is 1/50 × 1/50 = 1/2500. ('50 × 50 = 2500' on its own is ignored — it is the multiplication of the two probabilities that earns the mark.)", ""),

("7","1",5,"calculation",EC,"","", "<p>Farmers can increase the growth rate of farm animals by controlling the animals’ diets.</p>" + CHICKEN + "<p>Calculate the area of land needed to provide enough energy from maize seeds for 1000 chickens to grow to full size. Give your answer in m<sup>2</sup>, to 3 significant figures. (1 hectare = 10 000 m<sup>2</sup>; 1 tonne = 1000 kg)</p>",
 "2190 m². The chickens need 1000 × 46 = 46 000 MJ. One hectare gives 16.4 tonnes = 16 400 kg of seed, worth 16 400 × 16 = 262 400 MJ, of which the chickens can use 80% = 209 920 MJ. So 46 000 ÷ 209 920 = 0.2191… hectares, and × 10 000 = 2191.3 m², which to 3 significant figures is 2190 m². (The scheme's other route is the same sum the other way round: each kilogram of seed gives the chickens 16 × 0.8 = 12.8 MJ, so 46 000 ÷ 12.8 = 3593.75 kg of seed is needed, and 3593.75 ÷ 16 400 × 10 000 = 2191.3 m².)", ""),
("7","2",3,"drawing",EC,"grid-blank",FIG11, "<p>Another farmer produced 4200 kg of maize seeds in a field. The farmer fed the maize to 1000 chickens. At full size, the mean mass of one chicken was 2.2 kg.</p><p><b>Figure 11</b> is a blank grid with a zero line up the middle.</p><p>Complete <b>Figure 11</b> to show a pyramid of biomass for the food chain from the maize seeds to 1000 chickens. You should label the x-axis and use a suitable scale.</p>",
 "Choose a scale that is symmetrical about the zero line (1 mark). Label the x-axis 'Biomass in kg' and label the two bars 'maize' and 'chickens' (1 mark). Draw the maize bar at 4200 kg and the chickens bar at 1000 × 2.2 = 2200 kg, with the chickens above the maize (1 mark; half a small square of tolerance, and the height of the bars is ignored).", ""),
("7","3",2,"calculation",EC,"","", "<p>Calculate the ratio of chicken biomass to maize seed biomass. Use data from Question 07.2. Give your answer in its simplest form.</p>",
 "11 : 21. The chicken biomass is 2200 kg and the maize is 4200 kg, so the ratio is 2200 : 4200 (1 mark), which simplifies to 11 : 21 (1 mark). 0.5238… : 1 and 1 : 1.9 are also accepted.", ""),
("7","4",1,"short",EC,"","", "<p>Chickens can use 80% of the biomass from the maize seeds they eat for respiration and growth.</p><p>What happens to the remaining 20% of the biomass in the maize seeds?</p>",
 "It is lost via egestion — in the faeces. Urine, excretion and 'not digested' are ignored; respiration, 'not eaten', movement and heat are not accepted.", ""),
("7","5",1,"short",EC,"","", QPM + "<p>Which amino acids are found in significantly higher proportions in the QPM seeds? Tick <b>one</b> box.</p><ul><li>Lysine and tryptophan</li><li>Lysine and valine</li><li>Threonine and tryptophan</li><li>Threonine and valine</li></ul>",
 "Lysine and tryptophan — lysine rises from 28.9 to 41.9 and tryptophan from 7.3 to 16.3, where threonine and valine barely move", ""),
("7","6",1,"explain",EC,"","", "<p><b>Table 2</b> shows that 1 kg of QPM contains less leucine than 1 kg of normal maize.</p><p>Suggest why a diet containing less leucine does not slow down the growth of chickens.</p>",
 "Chickens need only a low amount of leucine for growth — chicken proteins contain a low proportion of leucine. 'Leucine is not needed for growth' is not accepted.", ""),

("8","1",2,"explain",HR,"","", "<p>Conditions inside and outside of the human body often change. Homeostasis helps the human body to survive changing conditions.</p><p>Explain what is meant by the term ‘homeostasis’.</p>",
 "The regulation, control or maintenance of internal conditions — keeping them the same; so that the conditions are optimum for the cells and for enzyme activity.", ""),
("8","2",4,"explain",HR,"","", "<p>The kidneys have an important role in homeostasis.</p><p>Describe what happens to glucose, protein and urea in the kidneys.</p>",
 "Glucose and urea are filtered out of the blood; protein is not filtered out of the blood; all of the glucose is reabsorbed back into the blood; and the urea is mostly not reabsorbed — it passes out in the urine.", ""),
("8","3",4,"explain",HR,"","", "<p>Explain how ADH affects the production and concentration of urine by the kidneys.</p>",
 "A high level of ADH increases the reabsorption of water — it increases the permeability to water; the reabsorption happens from the kidney tubules; so ADH increases the concentration of the urine; and decreases its volume. The converse for a low level of ADH is accepted throughout.", ""),

("9","1",6,"written",IE,"","", "<p>Glyphosate is a herbicide used in agriculture. Soya bean plants have been genetically modified (GM) to be resistant to glyphosate. A farmer can increase the yield of soya beans by growing GM soya bean plants and spraying glyphosate on the field.</p><p>Explain how the use of GM soya bean plants and glyphosate can increase the yield of soya beans.</p>",
 "Level-marked out of 6. The glyphosate kills the weeds but does not harm the GM soya; so there is less competition for light, water, mineral ions and space; more light and water means more photosynthesis and so more glucose. The extra glucose goes to respiration for energy, cellulose for cell walls, starch for stored energy, protein for cell structure and lipids for energy storage in the beans. The extra water gives turgor and support, transport, a medium for reactions and hydrolysis of stored substances. More magnesium makes chlorophyll, more nitrate makes amino acids and proteins, more phosphate makes DNA.", ""),
("9","2",2,"short",IE,"","", "<p>Suggest <b>two</b> reasons why some people are concerned about the use of GM soya bean plants. Do not refer to ethical concerns or religion in your answer.</p>",
 "Any two of: the effects on animals or humans of eating them are not known; the gene may be transferred to other, wild plants; they reduce biodiversity; the seed costs the farmer more, or the product costs the consumer more; they may affect the flavour of the product. Unqualified 'cost' is ignored.", ""),
]

# ---- the paper says what it is out of, and so does every box down the margin ----
PER_QUESTION = {"1": 8, "2": 10, "3": 11, "4": 15, "5": 14, "6": 11, "7": 13, "8": 10, "9": 8}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())

# ---- every number the scheme prints inside its own working, recomputed here ----
assert 32 - (9 + 7 + 10) == 6                                   # 03.2, value X
assert round(22 / 60 * 100, 1) == 36.7                          # 03.4, off the line of best fit
assert 1000 * 46 == 46000                                       # 07.1, the scheme's own steps
assert 16.4 * 1000 == 16400
assert 16400 * 16 == 262400
assert 262400 * 0.8 == 209920
assert 16 * 0.8 == 12.8 and 46000 / 12.8 == 3593.75             # the scheme's other route
area = 46000 / 209920 * 10000
assert round(area, 1) == 2191.3 and float('%.3g' % area) == 2190
assert round(3593.75 / 16400 * 10000, 1) == 2191.3              # and both routes give one answer
assert 1000 * 2.2 == 2200                                       # 07.2 and 07.3
assert Fraction(2200, 4200) == Fraction(11, 21)
assert round(2200 / 4200, 4) == 0.5238
assert Fraction(1, 50) * Fraction(1, 50) == Fraction(1, 2500)   # 06.4
assert round(340 * 0.1) == 34                                   # 02.2, one trophic level
# and the two grids are the ones measured off the paper
assert F4_ROWS * F4_PER == 70 and F4_COLS == 8                  # the printed y-axis runs 0 to 70
assert F11_ZERO * 2 == F11_COLS                                 # the zero line is halfway across

# ---- the pedigree agrees with the prose written above it ----
assert len(PEOPLE) == 12
assert [n for n, v in PEOPLE.items() if v[3]] == [1, 6]         # only 1 and 6 have polydactyly
assert all(PEOPLE[k][1] == PEOPLE[kids[0]][1] for a, b, kids in COUPLES for k in kids)
assert PEOPLE[1][2] and not PEOPLE[2][2]                        # 1 is the male, 2 the female
assert all(PEOPLE[k][2] for k in (10, 11, 12))                  # all three grandchildren are male

# ---- a comma in a topic name is a second topic, and so is an HTML entity ----
for q, part, marks, atype, topics, *_ in Q:
    assert ',' not in topics, 'a comma in a topic name is a second topic: %r' % topics
    assert '&' not in topics.replace(' & ', ''), 'a topic carries an entity: %r' % topics

d = datetime.date.fromisoformat(BASE['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 6      # Friday 7 June 2024, off the cover

rows = [DOC]
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(BASE)
    r.update(row_id='Q-AQA-8461-2406-2H-%02d%s' % (int(q), part), paper_id=PAPER, kind='question',
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
