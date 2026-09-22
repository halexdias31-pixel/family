# -*- coding: utf-8 -*-
"""AQA GCSE Combined Science: Trilogy 8464/B/2H, June 2024 — Biology Paper 2H, Higher.

Six preamble rows and 34 question rows under `P-AQA-8464B-2406-2H`, whose document row already
exists and is NOT written again here. (Both counts are printed by the run as well as written here,
for the reason CLAUDE.md gives about "all 18 checks pass": this sentence is the one that goes
stale, and the first draft of it already had said 30.)

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Higher)_ Paper 2 Biology - June 2024.pdf`, AQA's own
8464/B/2H scheme, read line by line — not derived, not worked out from the question. CLAUDE.md
records what deriving cost on the 2017 Highers: four answers subtly wrong because they were
reasoned rather than read. Where the scheme lists alternatives with `allow`, they are carried;
where it prints `do not accept`, that is carried too, because the refusals are the half a happy
path never reaches.

THE TOTALS ARE ASSERTED BOTH WAYS. The cover says *"The maximum mark for this paper is 70"* and
the scheme prints `Total Question 1 … 11`, `2 … 10`, `3 … 15`, `4 … 8`, `5 … 9`, `6 … 17`. Both
the per-question dict and its sum are asserted below, so a dropped part or a misread mark count
fails here instead of shipping.

WHAT THE TEXT LAYER DID. 16.6 KB over 32 pages, which by CLAUDE.md's rough tell is thin — and for
once it is thin honestly: a question paper is mostly ruled answer space. The prose, both tables
and every tick-box option extracted cleanly and were checked against renders of pages 7, 8, 22 and
23. WHAT IT HAS NONE OF IS THE FIGURES: all six are raster images inside the PDF (`get_images`
returns one per page, `get_drawings` returns only the page furniture), so nothing inside any of
them is in the text layer at all and every one had to be rendered and read.

FIGURE 6 WAS MEASURED OFF THE PIXELS, NOT EYEBALLED. It is the only figure here whose content is a
set of values read off a scale, and CLAUDE.md's rule is the one this repository paid for when a
cumulative-frequency curve read by eye gave 50 where the pixels said 48.1. The embedded raster was
extracted at its own 1717 x 1453, the grid found by its own regular spacing (minors 23.6 px,
majors every fifth), the scale fixed from the printed labels — x = 0 at column 406 and 47.3 px per
mmol/dm3, y = 300 at row 1314.5 and 4.726 px per millisecond — and then each range bar read off
its serifs and each mean off the crossing point of its own X. The three bars land on 3.00, 6.00
and 15.98 mmol/dm3, which is the method's own list of 16, 6 and 3 and is what confirms the scale.
Eight of the nine readings come out on an exact multiple of five; the mean at 6 mmol measures
393.7 and is the one that does not, so it is written as 394 rather than rounded up to a tidier
number nobody measured.

WHAT IS DRAWN AND WHAT IS NOT, which is the line CLAUDE.md draws twice.

  Figure 2, the quadrat — DRAWN. A square frame, a five-by-five grid inside it and `50 cm` against
  one side is a construction with exactly one answer, and 01.2 is unanswerable without the 50.

  Figure 3, the AKU pedigree — DRAWN, and it is DATA rather than artwork: thirteen people, who is
  affected, who is married to whom, who is whose child. 03.1 and 03.2 are two of this question's
  marks and neither can be answered without those facts, so the SVG is generated from a table of
  them and the assertions below are made about the table. "The picture disagrees with the prose
  under it" is then a shape that cannot occur. Both parts hang from it, so it is a question-scoped
  preamble — the same answer this file's Venn-diagram entry already gives.

  Figure 4, the Punnett square — DRAWN, and drawn rather than written as a `<table>` because 03.3
  says *"complete Figure 4"*: with the grid there, `padSource_` lays a pen over it and the
  question can actually be answered on a phone. That is why its `answer_type` is `annotate`. It is
  empty, because every cell of it is a mark.

  Figure 6, the results — DRAWN, from the measurements above.

  Figure 1 (limpets on rocks) and Figure 5 (an otter) — NOT DRAWN. Both are photographs, neither
  carries a number, and a photograph is not a thing this library redraws. Each carries `figure`
  because that is what the column means — the paper printed a picture there — and what it shows is
  said in the preamble's own words. They do NOT join the outstanding count, because that count is
  over `kind: 'question'` and these are preamble rows; that is the honest place for them, since
  neither is work anybody is going to do.

AND `figure` CAME OFF THREE ROWS AFTER THE FIRST RUN. 04.2, 05.3 and 05.4 went in carrying
`figure: 'table'`, which took the outstanding count 721 → 724 — three rows counted as a picture
that never came across when Table 1 and Table 2 are both transcribed, in full, in the row itself.
That is the KS2 Paper 2 fault CLAUDE.md records, and it is the mirror of a silence: a number that
counts work that does not exist stops meaning anything just as surely as one nobody prints. With
them cleared the count is unmoved at 721, which is the true statement about this paper.

AND WHAT A FIGURE SHOWS IS NOT WHAT ITS ANSWER IS. Figure 6's key — a vertical line is the range,
an X is the mean — is written into 06.7 because the paper prints that key beside the graph. Which
of the three means is lowest is NOT written into the question; it is in the drawing, exactly as it
is on the paper, and in the answer, which is where an answer goes.

THE PEDIGREE'S RENDERER IS NOW SHARED. It was a local function in `insert-aqa-biology-8461-2H.py`;
this is the second paper to print a family tree, so it moved to `tools/svgplot.py` — different
data, one renderer, which is what `axes()` already is and what CLAUDE.md says about `documents_()`
and `factsNow_`. Proved byte-identical first: the 8461/2H figure regenerates at 3,535 characters
and matches both rows already committed from it, character for character.
"""
import json, datetime, pathlib, sys
from fractions import Fraction
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import W, axes, pedigree

PAPER = 'P-AQA-8464B-2406-2H'
BASE = dict(paper_id=PAPER, subject='Combined Science', key_stage='KS4', band_type='stage',
            band_value='GCSE', tier='Higher', level='GCSE', company='AQA', exam_board='AQA',
            spec_code='8464/B/2H', exam_wave='First wave', year='2024', month='6', paper='2',
            exam_date='2024-06-07', document_type='Past paper',
            name='Biology Paper 2 — June 2024', active='True', trackable='True',
            printable='False')

# The branches of data/topics.json, spelled as the tree spells them. NO COMMAS: `topics` is a
# comma-list read by `asList_`, so a comma inside a name is a second topic — the fault that split
# `Bonding, Structure and the Properties of Matter` into two things neither of which joins
# anything. Asserted at the foot rather than remembered.
EC = 'Ecology'
IE = 'Inheritance & Evolution'
HR = 'Homeostasis & Response'


# ---- Figure 2 -----------------------------------------------------------------------------------
def fig2():
    """The quadrat: a framed square with a five-by-five grid and 50 cm against one side. The double
    arrow is two triangles rather than a `<marker>`, for the reason CLAUDE.md records — a marker
    needs an id, and `fillStuffPages` keeps about five question cards in the DOM at once, so two
    cards carrying one would resolve both to whichever came first."""
    S, x0, y0, fr = 150, 86, 16, 7
    p = ['<svg viewBox="0 0 %d 196" role="img" aria-label="A square quadrat divided into a five '
         'by five grid, with one side labelled 50 cm">' % W]
    p.append('<rect x="%d" y="%d" width="%d" height="%d" fill="currentColor" fill-opacity=".12" '
             'stroke="currentColor" stroke-width="1"/>' % (x0 - fr, y0 - fr, S + 2 * fr, S + 2 * fr))
    p.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
             'stroke-width="1.2"/>' % (x0, y0, S, S))
    for i in range(1, 5):
        v = x0 + i * S / 5.0
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="currentColor" '
                 'stroke-width=".8" opacity=".8"/>' % (v, y0, v, y0 + S))
        h = y0 + i * S / 5.0
        p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="currentColor" '
                 'stroke-width=".8" opacity=".8"/>' % (x0, h, x0 + S, h))
    ax = x0 + S + fr + 22
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="1.2"/>'
             % (ax, y0 - fr + 6, ax, y0 + S + fr - 6))
    p.append('<path d="M%d %d l-4 8 h8 z" fill="currentColor"/>' % (ax, y0 - fr))
    p.append('<path d="M%d %d l-4 -8 h8 z" fill="currentColor"/>' % (ax, y0 + S + fr))
    p.append('<text x="%d" y="%d" class="lbl" style="text-anchor:start">50 cm</text>'
             % (ax + 10, y0 + S / 2 + 4))
    return ''.join(p) + '</svg>'


QUADRAT_CM = 50
FIG2 = fig2()


# ---- Figure 3: the pedigree, as FACTS ------------------------------------------------------------
# id: (x, generation, male?, has AKU?). Read off a render of page 10 at scale 6 — the figure is a
# raster with no text layer, so every one of these is something looked at rather than extracted.
PEOPLE = {
    'A': (115, 0, True, False), 'B': (150, 0, False, False),
    'C': (45, 1, False, False), 'D': (80, 1, True, True), 'E': (132, 1, False, False),
    'F': (185, 1, True, False), 'G': (220, 1, False, False),
    'H': (40, 2, False, False), 'I': (85, 2, True, False),
    'J': (135, 2, True, False), 'K': (180, 2, False, True),
    'L': (225, 2, True, True), 'M': (270, 2, True, False),
}
COUPLES = [('A', 'B', ['D', 'E', 'F']), ('C', 'D', ['H', 'I']),
           ('F', 'G', ['J', 'K', 'L', 'M'])]
GEN_Y = [22, 92, 162]
FIG3 = pedigree(PEOPLE, COUPLES, GEN_Y, 'Family tree showing the inheritance of AKU through three '
                'generations of one family, a square for a male and a circle for a female, filled '
                'where the person has AKU', 196)


# ---- Figure 4: the empty Punnett square ----------------------------------------------------------
def fig4():
    """Two cells along the top for the female's gametes and two rows of three below, the first cell
    of each holding one of the male's. THE TOP-LEFT CORNER HAS NO BOX, which is how the paper prints
    it and is why this is drawn rather than written as a `<table>` — a table cannot leave a corner
    out, and every cell here is a mark."""
    cw, ch, x0, y0 = 58, 44, 100, 30
    p = ['<svg viewBox="0 0 %d 180" role="img" aria-label="An empty Punnett square: two cells '
         'along the top for the female gametes, and two rows of three below, the first cell of '
         'each for a male gamete">' % W]
    box = lambda cx, cy: ('<rect x="%d" y="%d" width="%d" height="%d" fill="none" '
                          'stroke="currentColor" stroke-width="1.1"/>' % (cx, cy, cw, ch))
    for c in (1, 2):
        p.append(box(x0 + c * cw, y0))
    for r in (1, 2):
        for c in (0, 1, 2):
            p.append(box(x0 + c * cw, y0 + r * ch))
    p.append('<text x="%d" y="%d" class="lbl" style="text-anchor:middle">Female</text>'
             % (x0 + 2 * cw, y0 - 8))
    p.append('<text x="%d" y="%d" class="lbl" style="text-anchor:end">Male</text>'
             % (x0 - 8, y0 + 2 * ch + 4))
    return ''.join(p) + '</svg>'


FIG4 = fig4()


# ---- Figure 6: measured off the raster, see the header -------------------------------------------
# (blood glucose in mmol/dm3, lowest reaction time, highest, mean) — all in milliseconds.
FIG6 = [(3, 435, 520, 465), (6, 355, 440, 394), (16, 380, 505, 435)]
NORMAL_LO, NORMAL_HI = 4.0, 7.8          # 06.7 prints this range; it is the paper's number.


def fig6():
    def marks(sx, sy):
        out = []
        for x, lo, hi, mean in FIG6:
            cx = sx(x)
            out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                       % (cx, sy(lo), cx, sy(hi)))
            for v in (lo, hi):                        # the serifs that end a range bar
                out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                           % (cx - 4, sy(v), cx + 4, sy(v)))
            cy = sy(mean)
            out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                       % (cx - 4, cy - 4, cx + 4, cy + 4))
            out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                       % (cx - 4, cy + 4, cx + 4, cy - 4))
        return ''.join(out)
    # The grid drawn is the paper's MAJOR grid — 2.5 mmol/dm3 and 25 ms. Its minors are 0.5 and 5,
    # which at this viewBox width is a line every two and a half pixels: a grey smear rather than a
    # grid, which is the fault the note over `axes()` records about ten labels in the space of ten.
    return axes(22.5, 575, 5, 50, 'Blood glucose concentration in mmol/dm³',
                'Reaction time in milliseconds',
                'Graph of reaction time against blood glucose concentration, with the range and '
                'the mean plotted at three concentrations', marks,
                ymin=300, xminor=2.5, yminor=25)


FIG6_SVG = fig6()


# ---- the two tables ------------------------------------------------------------------------------
# Table 1: months since warfarin was first given, whether it was being given, % of the population
# resistant. Table 2: distance from the sewage, bacteria x 1000/mm3, dissolved oxygen in mg/dm3.
TABLE1 = [(0, 'Yes', 1), (2, 'Yes', 24), (4, 'Yes', 81), (6, 'No', 99),
          (8, 'No', 92), (10, 'No', 85), (12, 'No', 70)]
TABLE2 = [('0.0', 4, '5.4'), ('1.0', 75, '4.8'), ('2.0', 125, '4.3'),
          ('3.0', 145, '3.8'), ('4.0', 160, '3.3'), ('5.0', 216, '2.7')]

T1 = ('<table><tr><th>Number of months since warfarin was first given</th>'
      '<th>Was warfarin being given?</th>'
      '<th>Percentage (%) of rat population resistant to warfarin</th></tr>'
      + ''.join('<tr><td>%d</td><td>%s</td><td>%d</td></tr>' % r for r in TABLE1) + '</table>')
T2 = ('<table><tr><th>Distance from where sewage was added in km</th>'
      '<th>Number of bacteria × 1000/mm<sup>3</sup></th>'
      '<th>Concentration of dissolved oxygen in mg/dm<sup>3</sup></th></tr>'
      + ''.join('<tr><td>%s</td><td>%d</td><td>%s</td></tr>' % r for r in TABLE2) + '</table>')

SEWAGE = ('<p>Sewage was accidentally added to a river.</p><p>The sewage moved with the river water '
          'and affected:</p><ul><li>the number of bacteria in the water</li><li>the concentration '
          'of dissolved oxygen in the water.</li></ul><p>Samples of river water were analysed at '
          'different distances from where the sewage was added.</p><p><b>Table 2</b> shows the '
          'results.</p>' + T2)

METHOD = ('<p>Scientists investigated whether blood glucose concentration affects reaction time.</p>'
          '<p>The reaction times of ten people with Type 1 diabetes were measured.</p><p>This is '
          'the method used.</p><ol><li>Tell one person to drink a glucose solution.</li><li>Monitor '
          'the person’s blood glucose concentration.</li><li>Record the person’s reaction time when '
          'the person’s blood glucose concentration is: 16 mmol/dm<sup>3</sup>, 6 mmol/dm<sup>3</sup>, '
          '3 mmol/dm<sup>3</sup>.</li><li>Repeat steps 1 to 3 for the nine other people.</li></ol>')


# ---- the preambles: what every part of a question hangs from -------------------------------------
# (question, topics, figure, diagram, html)
STEMS = [
("1", EC, "photograph", "",
 "<p>Limpets are small animals with shells.</p><p>Limpets attach to rocks on sea shores.</p>"
 "<p><b>Figure 1</b> is a photograph of a sea shore: rounded, ridged, cone-shaped limpet shells "
 "clamped to the bare rock, two of them labelled <i>Limpets</i>. It is a photograph rather than a "
 "drawing, so it is described here rather than reproduced.</p>"),

("2", IE, "", "", "<p>Potatoes are a food crop.</p>"),

("3", IE, "diagram", FIG3,
 "<p>AKU is a genetic disorder.</p><p><b>Figure 3</b> shows the inheritance of AKU in one family. "
 "A square is a male and a circle is a female; a filled shape is a person who has AKU and an empty "
 "one is a person who does not.</p>"),

("4", EC, "", "",
 "<p>Rat populations can increase rapidly.</p><p>When rat populations are large there is "
 "competition between rats.</p>"),

("5", EC, "photograph", "",
 "<p>Otters are mammals that live in river ecosystems.</p><p><b>Figure 5</b> is a photograph of an "
 "otter standing on grass beside a river bank. It is a photograph rather than a drawing, so it is "
 "described here rather than reproduced.</p>"),

("6", HR, "", "", "<p>Hormones are released from endocrine glands.</p>"),
]


# ---- the questions -------------------------------------------------------------------------------
# (q, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",1,"short",EC,"", "",
 "<p>Limpets eat algae.</p><p>Limpets are prey for crabs.</p><p>Give the food chain for algae, crabs and limpets.</p>",
 "algae → limpets → crabs. The direction of the arrows must be correct.", ""),

("1","2",2,"calculation",EC,"diagram", FIG2,
 "<p>Students estimated the population of limpets on a sea shore.</p><p>The students were given a square quadrat.</p><p><b>Figure 2</b> shows the quadrat.</p><p>Calculate the area of the quadrat in m<sup>2</sup>.</p>",
 "0.25 m² — 50 cm × 50 cm = 2500 cm², and 2500 ÷ (100 × 100) = 0.25 m². ¼ m² is accepted. Converting first scores both marks the same way: 50 ÷ 100 = 0.5 m, then 0.5 × 0.5 = 0.25 m².", ""),

("1","3",2,"calculation",EC,"", "",
 "<p>The total area of the sea shore was 1800 m<sup>2</sup>.</p><p>The students sampled 2% of the total area of the sea shore.</p><p>Calculate the number of times the students needed to use the quadrat for the 2% sample.</p><p>Use your answer from Question 01.2</p>",
 "144 quadrats — 1800 × 2/100 = 36 m², and 36 ÷ 0.25 = 144. 1800 × 0.02 = 36 and 36 × 4 = 144 are both accepted, and so is a correct number of quadrats worked from an incorrect 2% of 1800.", ""),

("1","4",2,"explain",EC,"", "",
 "<p>Explain why throwing a quadrat is not a random method to estimate population size.</p><p>Do not refer to safety in your answer.</p>",
 "The location of the sample will be biased or chosen — students may aim for the limpets, aim to avoid them, or stand or start near a group of them — or it will be limited by how far the students can throw. So the results will not be representative of the actual abundance, and the population size will come out too high or too low.", ""),

("1","5",2,"short",EC,"", "",
 "<p>Describe <b>one</b> method the students could use to plan where the quadrat should be randomly placed each time.</p>",
 "Run a tape measure along two perpendicular sides of the sea shore — or allocate co-ordinates to it, or divide the area into a grid — and then use a random number generator. A description of generating random numbers, such as pulling them out of a container, is accepted. Throwing the quadrat is not.", ""),

("1","6",1,"short",EC,"", "",
 "<p>Suggest <b>one</b> hazard the students should be aware of when collecting data on the sea shore.</p><p>Do not refer to throwing quadrats in your answer.</p>",
 "Any one of: the water, the sea or the waves; the tide; the rocks, or slippery or uneven surfaces; quicksand; a named hazardous material on the sea shore such as needles or glass; sewage; an animal, named — a crab or a jellyfish.", ""),

("1","7",1,"short",EC,"", "",
 "<p>Populations of limpets are monitored to assess the impact of pollution in water.</p><p>Suggest <b>one</b> type of pollution in water that may affect the population of limpets.</p>",
 "Any one of: fertiliser; sewage; toxic chemicals — a named one such as a herbicide, pesticide, insecticide, DDT or crude oil. Microplastics, dissolved carbon dioxide, heavy metals and thermal pollution are all accepted.", ""),

("2","1",1,"short",IE,"", "",
 "<p>Potato plants are classified as eukaryota.</p><p>What type of classification group is eukaryota?</p><p>Tick <b>one</b> box.</p><ul><li>Class</li><li>Domain</li><li>Kingdom</li><li>Phylum</li></ul>",
 "Domain", ""),

("2","2",1,"short",IE,"", "",
 "<p>Potato plants can reproduce by asexual reproduction.</p><p>Which statement is true for asexual reproduction?</p><p>Tick <b>one</b> box.</p><ul><li>Meiosis occurs.</li><li>Offspring are genetically identical.</li><li>Pollen and egg cells are produced.</li></ul>",
 "Offspring are genetically identical", ""),

("2","3",1,"short",IE,"", "",
 "<p>Flowers of potato plants contain gametes for sexual reproduction.</p><p>How is a gamete different from other cells in a potato plant?</p><p>Tick <b>one</b> box.</p><ul><li>A gamete contains one-quarter of the number of chromosomes.</li><li>A gamete contains half of the number of chromosomes.</li><li>A gamete contains double the number of chromosomes.</li></ul>",
 "A gamete contains half of the number of chromosomes", ""),

("2","4",1,"short",IE,"", "",
 "<p>Plants in the same genus as potatoes have been studied by scientists.</p><p>Describe <b>one</b> way a new plant species could be identified as being in the same genus as potatoes.</p>",
 "Any one of: it has a similar or the same structure, characteristics or phenotype as potatoes — a named one such as the same shape, leaves, flowers or taste, or studied with microscopes; similar DNA or genes, by DNA analysis or analysis of genetic material; similar or the same biochemistry; the same first part of the binomial name. ‘Looks the same’ unqualified is ignored, and the SAME DNA or genes is not accepted.", ""),

("2","5",6,"written",IE + ', ' + EC,"", "",
 "<p>Scientists have collected and stored seeds from species in the same genus as potatoes.</p><p>In the future, these seeds may be used for genetic modification of potato plants.</p><p>Genetically modified potato plants could help supply food to the human population as the climate changes.</p><p>Explain why genetic modification of crop plants may be important for the human population to survive climate change.</p>",
 "Level-marked out of 6, and for Level 3 the answer must explain an effect of climate change AND a benefit of GM, with a logical link between them. Effects of climate change: it will change weather patterns; it causes flooding, drought or temperature change; farming land is decreased by sea level rise, flooding or desertification; current crops cannot grow or survive in the changed conditions. Benefits of GM: crops may grow in a wider range of conditions; they may resist a wider range of pests and diseases; they may store for longer; yield or growth rate may increase — which feeds an increasing human population, is useful if less land is available for farming, and matters because a larger population needs more land for housing. Also creditable: variation among current crops is reduced by asexual reproduction or selective breeding, and the rate of evolution by natural selection may be slower than the rate of climate change.", ""),

("3","1",1,"explain",IE,"", "",
 "<p>Describe how <b>Figure 3</b> shows that the allele for AKU is recessive.</p>",
 "The parents of a child who has AKU do not have AKU themselves — A and B do not have AKU but their child D does, and F and G do not have AKU but their children K and L do. ‘Children with AKU have parents who are carriers’ is also accepted.", ""),

("3","2",1,"short",IE,"", "",
 "<p>Which person is <b>definitely</b> heterozygous for AKU?</p><p>Tick <b>one</b> box.</p><ul><li>C</li><li>D</li><li>E</li><li>G</li></ul>",
 "G", ""),

("3","3",5,"annotate",IE,"table-blank", FIG4,
 "<p>A female who has AKU and a male who is heterozygous for AKU plan to have a child.</p><p>Determine the probability that the child will have AKU.</p><p>You should:</p><ul><li>complete <b>Figure 4</b></li><li>identify the phenotype of each offspring genotype</li><li>use the symbols: <b>A</b> = dominant allele, <b>a</b> = recessive allele.</li></ul>",
 "0.5 — and 50%, ½, 1 in 2, 1:1 and 50:50 are all accepted; 1:2 and 50/50 are not. The parental gametes are a and a from the female and A and a from the male (1 mark each, and 1 mark if the two are the other way round). The offspring derived from them are Aa, Aa, aa and aa (1). The phenotypes are Aa = no AKU and aa = AKU (1). The probability must match the offspring genotypes the student actually derived.", ""),

("3","4",2,"explain",IE,"", "",
 "<p>A mutation is a change in a gene.</p><p>People who have AKU have a mutation that causes the production of a non-functioning enzyme.</p><p>Enzymes are proteins.</p><p>Suggest how a mutation can result in the production of a non-functioning enzyme.</p>",
 "The mutation causes an incorrect sequence of amino acids, which causes the enzyme — or its active site — to be a different shape, so the enzyme and the substrate cannot bind. ‘The enzyme is denatured’ is ignored, and ‘no enzyme is produced’ is not accepted.", ""),

("3","5",4,"written",HR,"", "",
 "<p>Some people have In Vitro Fertilisation (IVF) treatment to increase the chance of becoming pregnant.</p><p>Describe how the process of IVF can result in pregnancy.</p>",
 "FSH and LH are given or injected into the female to stimulate the maturation of eggs (1). The collected eggs are fertilised in the laboratory — fused with sperm, or sperm injected into the egg (1). The fertilised egg undergoes mitosis, dividing to form an embryo (1). One or two embryos, or balls of cells, are inserted into the uterus (1).", ""),

("3","6",2,"short",IE,"", "",
 "<p>Embryos can be screened to detect inherited disorders.</p><p>Give <b>two</b> arguments against embryo screening.</p><p>Do not refer to religion in your answer.</p>",
 "Any two of: a risk to the embryo, including a risk of miscarriage; a risk to the female or mother; it is a stressful process; it may lead to termination of the pregnancy or destruction of the embryo; the high cost of the screening process; the embryo cannot give consent — which extends to increased prejudice against other people with inherited disorders. A risk to the embryo from radiation is not accepted, and references to religion or ethics are ignored.", ""),

("4","1",2,"short",HR,"", "",
 "<p>When rats compete, the basal metabolic rate of the rats increases.</p><p>Basal metabolic rate is controlled in the same way in humans and in rats.</p><p>Describe how basal metabolic rate is increased.</p>",
 "More thyroxine is secreted or released (1), from the thyroid gland (1). The alternative answer is that more adrenaline is secreted or released (1), from the adrenal gland (1).", ""),

("4","2",6,"written",IE,"", "",
 "<p>The size of a rat population can increase quickly.</p><p>One female rat and one male rat can produce 20 offspring every 2 months.</p><p>Warfarin is a poison that has been used to control rat populations.</p><p>Rat populations can become resistant to warfarin by the process of evolution.</p><p>A population of rats was given warfarin for 4 months.</p><p><b>Table 1</b> shows information about resistance to warfarin in the rat population for a year after warfarin was first given.</p>" + T1 + "<p>Rats with resistance to warfarin have a smaller mean mass than rats that are not resistant to warfarin.</p><p>Smaller rats are often at a disadvantage when competing against larger rats.</p><p>Explain the trends in the data when warfarin was being given and when warfarin was no longer given.</p><p>Use <b>Table 1</b>.</p>",
 "Level-marked out of 6, and for Level 3 the answer must explain both the increase and the decrease. Trends: the percentage resistant increased for 6 months, or increased while warfarin was being given, then decreased after it stopped; the decrease is slower than the increase; and the change from increase to decrease is not instant at 6 months. The increase: some rats have alleles for resistance, from random mutation, so they are more likely to survive while warfarin is being used; they reproduce and pass the allele to the next generation, repeating for several generations until most of the population is resistant — and several generations fit inside 6 months. The decrease: with warfarin no longer used, resistant rats are outcompeted for food, mates, territory or shelter by non-resistant rats, or are killed by larger non-resistant rats, so rats without resistance become more likely to reproduce.", ""),

("5","1",1,"short",EC,"", "",
 "<p>Define the term ‘ecosystem’.</p>",
 "The interaction of a community of living organisms with the non-living parts of their environment or habitat. ‘The interaction of a community of biotic parts and the abiotic parts of their environment’ is accepted.", ""),

("5","2",2,"short",EC,"", "",
 "<p>Otters are an important species for the stability of the river community.</p><p>Describe <b>two</b> ways animal species may be important for the stability of a whole community.</p>",
 "Any two of: it may be a predator and so control the prey population, or keep it fairly constant; it may be prey and so provide energy to a predator; it may be a primary consumer and so control the plant or algae population; it may alter the habitat for other species to survive in; it may provide shelter for other species; it may maintain biodiversity; it may disperse seed or pollen. ‘Prey provide food to a predator’ is ignored — the mark is for energy.", ""),

("5","3",1,"calculation",EC,"", "",
 SEWAGE + "<p>The number of bacteria at 5.0 km was greater than the number of bacteria where the sewage was added.</p><p>Calculate how many times greater.</p>",
 "54 — 216 ÷ 4. Working in the real numbers, 216 000 ÷ 4000, is accepted.", ""),

("5","4",2,"explain",EC,"", "",
 SEWAGE + "<p>A student concluded:</p><p>‘number of bacteria ∝ concentration of dissolved oxygen’</p><p>Explain why the student’s conclusion is not correct.</p><p>Use <b>Table 2</b>.</p>",
 "As the number of bacteria increases the concentration of dissolved oxygen decreases — a negative correlation — and the converse is accepted. So the relationship is not that as the bacteria increase the oxygen increases in the same ratio, which is what a proportional relationship would mean. References to inverse proportion are ignored.", ""),

("5","5",3,"explain",EC,"", "",
 "<p>Otters:</p><ul><li>live in water and on the land</li><li>eat mainly fish.</li></ul><p>The concentration of dissolved oxygen has decreased in a river where otters live.</p><p>Explain how the decrease in the concentration of dissolved oxygen in the river water will affect the population of otters.</p>",
 "The decrease in oxygen concentration causes a decrease in the number of fish — more fish die (1) — because fish need oxygen to respire aerobically (1); invertebrates needing oxygen, with fish eating the invertebrates, is accepted. So the otter population decreases because there is less food (1), or its rate of reproduction is lower through lack of food, or the otters migrate to another river. The alternative answer is that the decrease means more bacteria are present (1), so more fish die of bacterial infection (1), so the otter population decreases (1). Implying that otters take oxygen from the water is not accepted, and nor is energy being produced by respiration.", ""),

("6","1",1,"short",HR,"", "",
 "<p>Which gland releases hormones to control other glands?</p><p>Tick <b>one</b> box.</p><ul><li>Adrenal</li><li>Pituitary</li><li>Thyroid</li></ul>",
 "Pituitary", ""),

("6","2",1,"short",HR,"", "",
 "<p>Several hormones can affect blood glucose concentration.</p><p>Adrenaline can increase blood glucose concentration.</p><p>What is <b>one</b> other effect of adrenaline?</p><p>Tick <b>one</b> box.</p><ul><li>Decreased breathing rate</li><li>Decreased metabolic rate</li><li>Increased blood flow to muscles</li><li>Increased FSH production</li></ul>",
 "Increased blood flow to muscles", ""),

("6","3",1,"short",HR,"", "",
 "<p>Cells in the pancreas detect changes in blood glucose concentration.</p><p>What type of cell in the body detects changes?</p>",
 "Receptors — receptor cells or receptor neurones. Sensory cells or sensory neurones are accepted.", ""),

("6","4",2,"explain",HR,"", "",
 METHOD + "<p>People with Type 1 diabetes were selected for the investigation instead of people who did not have diabetes.</p><p>Explain why.</p>",
 "Their blood glucose concentration varies more than it does in people who do not have diabetes — it increases and decreases more, and goes very high, which gives a sufficient range of concentrations to test (1). That is because less or no insulin is produced when the blood glucose concentration increases, so there is nothing to bring it back down (1). The converse, clearly describing people who do not have diabetes, is accepted.", ""),

("6","5",2,"short",HR,"", "",
 METHOD + "<p>Control variables between the different people in the investigation included:</p><ul><li>age</li><li>sex</li><li>food and drink consumed before and during the test.</li></ul><p>Suggest <b>two</b> other control variables that should be used in the investigation.</p>",
 "Any two of: prior familiarity with the reaction time test, or practice; the type of reaction time test, or a described part of it such as which hand is used to catch the ruler; insulin injections; a named drug that would affect reaction time; the amount of sleep, or tiredness; distractions. ‘Health’ unqualified is ignored, and so are caffeine and alcohol.", ""),

("6","6",1,"short",HR,"", "",
 METHOD + "<p>It was important for the scientists to monitor the health of each person during the investigation.</p><p>Suggest <b>one</b> reason why.</p>",
 "A low or a high blood glucose concentration is dangerous or unsafe. Monitoring for unconsciousness, a coma, a headache or dizziness is accepted; ‘hypoglycaemia’ or ‘hyperglycaemia’ unqualified is ignored.", ""),

("6","7",2,"explain",HR,"graph", FIG6_SVG,
 METHOD + "<p><b>Figure 6</b> shows the results. The vertical line at each blood glucose concentration is the range of the ten reaction times and the × is their mean.</p><p>People who do <b>not</b> have diabetes usually have a blood glucose concentration in the range of 4.0 mmol/dm<sup>3</sup> to 7.8 mmol/dm<sup>3</sup>.</p><p>Describe how the results in <b>Figure 6</b> show the importance of homeostasis.</p>",
 "The lowest reaction times were recorded in the range of blood glucose concentration found in people who do not have diabetes — the range 4.0 to 7.8 mmol/dm³ — or, put the other way, a high and a low blood glucose concentration both increase the mean reaction time (1). Homeostasis keeps the blood glucose concentration in a narrow range; alternatively, a lower reaction time is a survival advantage (1).", ""),

("6","8",5,"written",HR,"", "",
 "<p>Describe how blood glucose concentration is maintained within narrow limits in people who do <b>not</b> have diabetes.</p>",
 "When the blood glucose concentration increases — when it is high, or nears 7.8 mmol/dm³ — the pancreas releases insulin (1). Insulin causes glucose to move from the blood into the liver or muscle cells (1), where the excess glucose is converted to glycogen (1). When the blood glucose concentration decreases — when it is low, or nears 4.0 mmol/dm³ — the pancreas releases glucagon (1), which causes glycogen to be converted into glucose and released into the blood (1). If neither of the two middle marks is earned, ‘glucose moves into cells’ scores 1.", ""),

("6","9",2,"explain",HR,"", "",
 "<p>The scientists gave the hypothesis:</p><p>‘Optimum blood glucose concentration increases the production of chemicals that diffuse across synapses.’</p><p>Describe how an increase in the chemicals could decrease reaction time.</p>",
 "Any two of: the diffusion of the chemical across the synapse is faster; an impulse in the relay, motor or next neurone is more likely — or faster, stronger, bigger, or there are more of them; an impulse is more likely to reach the muscle, or reaches it in less time, or a bigger impulse causes faster muscle contraction. An electrical signal is accepted for an impulse throughout; ‘signal’ or ‘message’ alone is ignored.", ""),
]


# ---- the paper says what it is out of, and so does every box down the margin ----------------------
PER_QUESTION = {"1": 11, "2": 10, "3": 15, "4": 8, "5": 9, "6": 17}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the scheme: %r' % (got,)
assert sum(got.values()) == 70, 'the paper is out of 70 and these sum to %d' % sum(got.values())
assert sorted({q for q, *_ in Q}) == sorted(q for q, *_ in STEMS), 'a question with no preamble'

# ---- every number the scheme prints inside its own working, recomputed here -----------------------
# IN `Fraction`, NOT FLOATS. `1800 * 0.02` is 36.000000000000004 in binary and 0.02 is not exact —
# CLAUDE.md records two true assertions refused by that, and a percentage of an area is exactly the
# kind of number nobody would re-check.
assert QUADRAT_CM * QUADRAT_CM == 2500                                        # 01.2, the paper's 50 cm
assert Fraction(2500, 100 * 100) == Fraction(1, 4)                            # 01.2, = 0.25 m2
assert Fraction(QUADRAT_CM, 100) == Fraction(1, 2)                            # 01.2, the allowed route
assert Fraction(1, 2) * Fraction(1, 2) == Fraction(1, 4)
assert Fraction(1800 * 2, 100) == 36                                          # 01.3
assert Fraction(1800) * Fraction(2, 100) == 36                                # 01.3, "allow x 0.02"
assert Fraction(36) / Fraction(1, 4) == 144                                   # 01.3
assert 36 * 4 == 144                                                          # 01.3, "allow 36 x 4"
assert Fraction(216, 4) == 54 and Fraction(216000, 4000) == 54                # 05.3, both routes

# 03.3: the cross the scheme sets out — female aa, male Aa, offspring Aa Aa aa aa, so P(AKU) = 0.5.
# `sorted` puts 'A' before 'a' in ASCII, which is the order a genotype is written in.
OFFSPRING = sorted(''.join(sorted(f + m)) for f in 'aa' for m in 'Aa')
assert OFFSPRING == ['Aa', 'Aa', 'aa', 'aa']
assert Fraction(sum(1 for o in OFFSPRING if o == 'aa'), len(OFFSPRING)) == Fraction(1, 2)

# ---- the pedigree agrees with the scheme that was read off the same picture ----------------------
assert len(PEOPLE) == 13
assert sorted(n for n, v in PEOPLE.items() if v[3]) == ['D', 'K', 'L']   # only D, K and L have AKU
assert all(PEOPLE[k][1] == PEOPLE[a][1] + 1 for a, b, kids in COUPLES for k in kids)
assert all(PEOPLE[a][2] != PEOPLE[b][2] for a, b, _ in COUPLES)         # one of each sex
# THE FIRST OF A COUPLE IS THE ONE ON THE LEFT, NOT THE MALE, and it took this paper to say so:
# 8461/2H happened to draw every husband left of his wife, and here C is a wife drawn left of D.
# `pedigree()` runs the marriage line from a's right edge to b's left, so left is what it needs.
assert all(PEOPLE[a][0] < PEOPLE[b][0] for a, b, _ in COUPLES)
kids_of = {p: kids for a, b, kids in COUPLES for p in (a, b)}
# 03.1's scheme names exactly these two families: unaffected parents with an affected child.
aff = lambda n: PEOPLE[n][3]
assert not aff('A') and not aff('B') and aff('D') and 'D' in kids_of['A']
assert not aff('F') and not aff('G') and aff('K') and aff('L') and {'K', 'L'} <= set(kids_of['F'])
# 03.2's answer is G, and it is G because she is unaffected with an affected child. Of the four
# offered, D is affected and C and E have no affected child, so none of the other three is forced.
forced = [n for n in 'CDEG' if not aff(n) and any(aff(k) for k in kids_of.get(n, []))]
assert forced == ['G'], 'the tick-box answer G is not the only one the pedigree forces: %r' % forced

# ---- Table 1 carries the trend the scheme asks students to explain -------------------------------
given = [r for r in TABLE1 if r[1] == 'Yes']
assert [r[0] for r in given] == [0, 2, 4] and [r[2] for r in TABLE1][3] == 99
pct = [r[2] for r in TABLE1]
assert pct[:4] == sorted(pct[:4]) and pct[3:] == sorted(pct[3:], reverse=True)
rise = (pct[3] - pct[0]) / 3.0
fall = (pct[3] - pct[-1]) / 3.0
assert rise > fall, 'the scheme says the decrease is slower than the increase'

# ---- Table 2 carries the relationship 05.4 is about ----------------------------------------------
bact = [r[1] for r in TABLE2]
oxy = [float(r[2]) for r in TABLE2]
assert bact == sorted(bact) and oxy == sorted(oxy, reverse=True)
assert bact[-1] == 216 and bact[0] == 4

# ---- Figure 6 agrees with the paper and with the scheme's own answer ------------------------------
assert [x for x, *_ in FIG6] == [3, 6, 16]                 # the method's own three concentrations
assert all(lo < mean < hi for _, lo, hi, mean in FIG6)
inside = [(x, mean) for x, lo, hi, mean in FIG6 if NORMAL_LO <= x <= NORMAL_HI]
assert [x for x, _ in inside] == [6], 'only the 6 mmol point is inside the non-diabetic range'
# 06.7's answer is that the lowest reaction times sit inside that range. The DRAWING has to say so.
assert min(m for _, _, _, m in FIG6) == inside[0][1]

# ---- the topics join the tree, and no name carries a comma ---------------------------------------
TREE = json.loads((pathlib.Path(__file__).parent.parent / 'data' / 'topics.json').read_text())
LABELS = {r['label'].lower() for r in TREE}
LABELS |= {a.strip().lower() for r in TREE for a in r['aliases'].split(',') if a.strip()}
for names in [r[4] for r in Q] + [s[1] for s in STEMS]:
    for t in names.split(','):
        t = t.strip()
        assert t, 'an empty topic'
        assert '&amp;' not in t, 'an HTML entity in a topic name: %r' % t
        assert t.lower() in LABELS, 'topic %r is in no branch of data/topics.json' % t

# ---- the cover names the day as well as the date -------------------------------------------------
d = datetime.date.fromisoformat(BASE['exam_date'])
assert d.strftime('%A') == 'Friday', 'the cover says Friday 7 June 2024'
assert d.year == 2024 and d.month == 6

# ---- build ---------------------------------------------------------------------------------------
rows = []
for q, topics, figure, diagram, html in STEMS:
    r = dict(BASE)
    r.update(row_id='S-AQA-8464B-2406-2H-%02d' % int(q), kind='preamble', question=q, part='',
             section='', html=html, topics=topics, figure=figure, diagram=diagram,
             diagram_by=('family' if diagram else ''), placeholder='')
    rows.append(r)
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(BASE)
    r.update(row_id='Q-AQA-8464B-2406-2H-%02d%s' % (int(q), part), kind='question',
             question=q, part=part, section='', marks=str(marks), html=html,
             answer=answer, answer_type=atype, topics=topics, figure=figure,
             diagram=diagram, diagram_by=('family' if diagram else ''), placeholder='')
    if note:
        r['examiner_note'] = note
    rows.append(r)

p = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/home/user/family/data/questions.json')
lines = p.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
seen = {json.loads(l.rstrip(','))['row_id'] for l in lines if '"row_id"' in l}
clash = seen & {r['row_id'] for r in rows}
assert not clash, 'row ids already in the file: %r' % sorted(clash)
assert (PAPER in {json.loads(l.rstrip(','))['paper_id'] for l in lines if '"paper_id"' in l}), \
    'the document row for %s is not in %s — these questions would be orphans' % (PAPER, p)

lines[-2] += ','
for r in rows[:-1]:
    lines.insert(-1, json.dumps(r) + ',')
lines.insert(-1, json.dumps(rows[-1]))
p.write_text('\n'.join(lines) + '\n')
print('wrote %d rows for %s (%d questions, %d preambles), %d marks'
      % (len(rows), PAPER, len(Q), len(STEMS), sum(got.values())))
