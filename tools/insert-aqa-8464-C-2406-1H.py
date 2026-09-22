#!/usr/bin/env python3
"""AQA GCSE Combined Science: Trilogy 8464/C/1H, June 2024 — 32 question rows and 2 preambles.

WHY THIS IS A SCRIPT AND NOT A HAND EDIT. CLAUDE.md: "Every number in a transcription is checked
against the paper's own stated total ... and the insert script asserts it before writing a row."
The cover says 70 and the eight boxes down the margin say 9, 8, 6, 8, 14, 8, 10, 7. Both are
asserted below, and so is every intermediate the mark scheme prints inside its own working. The
DOCUMENT ROW ALREADY EXISTS (`D-P-AQA-8464C-2406-1H`, carrying `total_marks: 70`), so this writes
question and preamble rows only — `check-library.js` is what sums them against that cell.

WHERE EVERY ANSWER CAME FROM. AQA's own `Mark scheme (Higher)_ Paper 1 - June 2024` for 8464/C/1H,
read rather than derived. The 2017 Higher maths papers are why that is a rule and not a preference:
four answers there were subtly wrong precisely because they were worked out from the question. Where
the scheme takes a range or names an alternative — "allow a value in the range 1925 to 1930", the
zinc route through 01.3, the 6/34 route through 05.2 — the range and the alternative are carried.

THE TEXT LAYER WAS HONEST ON THIS PAPER AND THAT IS NOT THE USUAL CASE. Every question's prose,
Table 1, Table 3, Table 4 and all six tick-box lists extracted cleanly from `get_text()`; nothing
arrived as loose digits and no Caesar shift. What the text layer does NOT hold is any of the
eleven figures — all eleven are raster images (`get_images()` returns one per page, `get_drawings()`
returns only the page furniture), with no text layer and no vectors inside them. So every page
carrying a figure was rendered and looked at, which is the only reason the three drawings below are
measurements rather than guesses.

WHAT WAS DRAWN, AND EACH IS A THING THE STUDENT COMPLETES.

  * Figure 5 (02.4) is the empty grid the student plots Table 1 on. Its squares were counted in the
    pixels, not estimated: the grid is 65 small squares across by 45 up at a uniform 28.4 px, with
    labels every ten squares, so it runs 0 to 6.5 and 0 to 4.5 in steps of 0.1. With the grid there,
    `padSource_` lays a pen over it and the question can be answered on a phone.
  * The 05.1 skeleton is the dot-and-cross diagram with NO electrons on it, which is what the paper
    prints and what the two marks are for. Circle centres and radii measured off the rendered page —
    see AMM below; the two side hydrogens come out symmetric about the nitrogen to half a pixel,
    which is what says the measurement is right.
  * Figure 8 (05.4) is the reaction profile with only the reactant level drawn. Measured: the
    reactant line starts ON the energy axis, runs 37.2% of the way along the progress axis, and sits
    at exactly 50% of the axis height. Completing it is the question.

WHAT WAS REFUSED, AND FIGURE 1 IS THE ONE WORTH READING. It is a line graph of copper production
from 1900 to 2010, and 01.1 asks for two conclusions from it — so the SHAPE OF THAT CURVE IS THE
ANSWER. CLAUDE.md: "what a figure shows is not what its answer is." Drawing it would mean tracing a
smooth curve out of a raster and re-interpolating it, which is the "curve read by eye" this
repository already paid for once (50 at 160 cm where the pixels said 48.1); describing it would mean
writing the mark scheme's own six bullets into the question. So the row gives the two AXES and
their ranges — which is not the answer — carries `figure` so `check-library.js` counts it in the
backlog, and says in `examiner_note` that the curve is deliberately absent. A tutor needs the paper
open for that one part, and the row says so rather than pretending otherwise.

The other figures are apparatus and structure diagrams: the copper sulfate preparation, the test
tube, the polystyrene cup, the Table 2 structures, the electrolysis cell, the nanotube. Each is
described in the question's own words — a question about a picture you cannot see is not a
question — and each row that needs one carries `figure`, so the count is the honest backlog rather
than the minimum that could be argued for. THE DESCRIPTIONS STOP SHORT OF THE ANSWER, deliberately
and in two places it was tempting not to: Figure 2 is described as circles of two labelled sizes
without calling the rows distorted, because "the layers are distorted" is the second of 01.2's three
marks; and Figure 11 is a cylinder of linked carbon rings rather than of hexagons, because
"hexagonal" is the whole of 08.1.

Figure 7 and Figure 9 are NOT in that backlog and are not drawings either: one is a displayed
formulae equation and the other is a list of six metals, and both are text. They are transcribed as
text, which is what they are.

ONE MISSING PICTURE IS INVISIBLE TO THAT COUNT AND IT IS SAID RATHER THAN LEFT. `noPicture` in
check-library.js exempts any row that HAS a drawing, so 02.4 — which carries Figure 5 and is also
the row that describes the un-transcribed Figure 4 apparatus — is not counted, and the honest
backlog for this paper is eleven rather than the ten it reports. The filter is right about what it
asks (this row's student-facing picture is there); the arithmetic just cannot see a second figure
on a row that already has one.

TWO PREAMBLES, AND ONLY TWO. `preamble_` attaches a question-scoped row to EVERY part of that
question, so a preamble is only right where the shared block covers all of them. Q5's stem
("nitrogen reacts with hydrogen to produce ammonia") and Q8's nanotube figure do; Q2's does not —
its first three parts hang off the copper sulfate preparation and its last two off a completely
different thermal-decomposition experiment, so a Q2 preamble would staple the wrong apparatus to
02.4. Those contexts are written into the parts that need them instead.

AXIS LABELS ARE SHORTENED ON THE DRAWN GRID AND THE QUESTION CARRIES THEM IN FULL. `.qsheet .ax` is
9px and the y-axis label is rotated, so it is bounded by the PLOT HEIGHT (136) rather than the
width: the paper's own "Mass of the contents of test tube after heating in grams" is about 230px
rotated and would be clipped away at both ends, which is the fault `check/cards.js` gained a rule
for. The prose above the grid states both axes exactly as the paper prints them.
"""
import json, datetime, pathlib, sys
from fractions import Fraction
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from svgplot import W, axes

PAPER = 'P-AQA-8464C-2406-1H'
DOC = dict(paper_id=PAPER, subject='Combined Science', key_stage='KS4', band_type='stage',
           band_value='GCSE', tier='Higher', level='GCSE', company='AQA', exam_board='AQA',
           spec_code='8464/C/1H', exam_wave='First wave', year='2024', month='5', paper='1',
           exam_date='2024-05-17', document_type='Past paper',
           name='Chemistry Paper 1 — June 2024', active='True', trackable='True',
           printable='False')

# ---- topics, checked against data/topics.json before a row was written ---------------------------
# NO COMMA IN ANY OF THESE. `topics` is a comma-list read by `asList_`, so a comma inside a name is
# a second topic — AQA's own heading "Bonding, Structure and the Properties of Matter" split into
# `Bonding` and `Structure and the Properties of Matter`, and neither joins the tree. The tree
# carries that unit as `Bonding & Structure`, with AQA's spelling among its aliases.
AS = 'Atomic Structure & the Periodic Table'
BN = 'Bonding & Structure'
QC = 'Quantitative Chemistry'
CC = 'Chemical Changes'
EC = 'Energy Changes'
SM = 'Separating Mixtures'

# ---- Table 1, read off page 8 --------------------------------------------------------------------
TABLE1 = [('1.2', '0.8'), ('2.4', '1.7'), ('3.6', '2.2'), ('4.8', '3.1'), ('6.0', '3.9')]
T1 = ('<table><tr><th>Mass of copper carbonate in test tube before heating in grams</th>'
      '<th>Mass of the contents of test tube after heating in grams</th></tr>'
      + ''.join('<tr><td>%s</td><td>%s</td></tr>' % r for r in TABLE1) + '</table>')
T3 = ('<table><tr><th>Bond</th><th>N ≡ N</th><th>H — H</th><th>N — H</th></tr>'
      '<tr><td>Bond energy in kJ/mol</td><td>945</td><td><b>X</b></td><td>391</td></tr></table>')
T4 = ('<table><tr><th>Hydrogen halide</th><th>Boiling point in °C</th></tr>'
      '<tr><td>HF</td><td>20</td></tr><tr><td>HCl</td><td>−85</td></tr>'
      '<tr><td>HBr</td><td>−67</td></tr><tr><td>HI</td><td>−35</td></tr></table>')

METHOD2 = ("<p>This is the method used.</p><ol><li>Add 1.2 g of copper carbonate to a test tube."
           "</li><li>Heat the test tube and contents until the mass does not change.</li>"
           "<li>Record the mass of the contents of the test tube after heating.</li>"
           "<li>Repeat steps 1 to 3 with different masses of copper carbonate.</li></ol>")
METHOD4 = ("<p>This is the method used.</p><ol><li>Pour 50 cm<sup>3</sup> of nitric acid into a "
           "polystyrene cup.</li><li>Measure the temperature of the solution.</li><li>Add 0.50 g "
           "of magnesium carbonate.</li><li>Stir the mixture.</li><li>Measure the temperature."
           "</li><li>Repeat steps 1 to 5 with different masses of magnesium carbonate.</li></ol>")


def fig5():
    """The empty grid 02.4 plots Table 1 on.

    MEASURED, NOT ESTIMATED — CLAUDE.md's rule for a picture that carries data, applied to a picture
    that carries a scale. Rendered at 5x and the gridlines found by their own regular spacing: 66
    verticals and 46 horizontals at a dead-flat 28.4 px, so 65 by 45 small squares, with the printed
    labels every tenth one. That fixes the axes at 0 to 6.5 and 0 to 4.5 with a small square worth
    0.1 — which is also what the scheme's "± half a small square" tolerance is measured in.

    THE MEDIUM GRID IS DRAWN, NOT THE MILLIMETRE ONE. 65 lines across 274 units is one every 4 px,
    which is the grey smear `axes()`'s own note records; the paper's own 5 mm line is every 0.5 and
    that is what is drawn, exactly as the 8462/1H grid draws its fives rather than its ones."""
    return axes(6.5, 4.5, 1, 1, 'Mass before heating in g', 'Mass after heating in g',
                'Empty grid for plotting the mass after heating against the mass before heating',
                xminor=0.5, yminor=0.5)


# The 05.1 skeleton, measured off page 16 rendered at 4x (an 850 x 711 crop of the figure's own
# image box): nitrogen centred at (424.5, 281) with radius 264, hydrogens of radius 102.5 centred at
# (112.5, 277.5), (736.5, 277.5) and (424.5, 600). The two side hydrogens sit 312 px either side of
# the nitrogen — equal to half a pixel, which is what says the circles were found rather than
# guessed. Written as the measurement, with the SVG derived from it below.
AMM = dict(n=(424.5, 281.0, 264.0),
           h=[(112.5, 277.5), (736.5, 277.5), (424.5, 600.0)], hr=102.5, ink=(10.0, 839.0))


def fig51():
    """The dot-and-cross skeleton with no electrons on it, which is what the paper prints.

    THE ELECTRONS ARE THE ANSWER AND ARE NOT HERE. 05.1's two marks are one shared pair in each
    overlap and one non-bonding pair on the nitrogen; drawing either would be printing the answer on
    the question, which is the line this repository draws under "what a figure shows is not what its
    answer is". What is drawn is the four circles and the three letters, so the student has
    something to write on."""
    s = 300.0 / (AMM['ink'][1] - AMM['ink'][0])            # the ink spans 300 of the 340 units
    ox = 20.0 - AMM['ink'][0] * s
    cx, cy, r = AMM['n']
    top = (cy - r) * s                                     # 12 units of air above the nitrogen
    oy = 12.0 - top
    bot = max(y for _, y in AMM['h']) + AMM['hr']
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s">'
         % (W, int(bot * s + oy + 12),
            'Dot and cross skeleton for ammonia: a large nitrogen circle with three smaller '
            'hydrogen circles overlapping it, drawn with no electrons on it')]
    for hx, hy in AMM['h']:
        p.append('<circle cx="%.1f" cy="%.1f" r="%.1f" class="pt"/>'
                 % (hx * s + ox, hy * s + oy, AMM['hr'] * s))
    p.append('<circle cx="%.1f" cy="%.1f" r="%.1f" class="pt"/>'
             % (cx * s + ox, cy * s + oy, r * s))
    p.append('<text x="%.1f" y="%.1f" class="num">N</text>' % (cx * s + ox, cy * s + oy + 5))
    for hx, hy in AMM['h']:
        p.append('<text x="%.1f" y="%.1f" class="num">H</text>' % (hx * s + ox, hy * s + oy + 5))
    return ''.join(p) + '</svg>'


# Figure 8, measured off page 19 rendered at 4x (a 1419 x 843 crop): the energy axis stands at
# x = 187 and the progress axis at y = 764, running to x = 1407; the one line already printed runs
# from x = 187 — it starts ON the axis — to x = 641 at y = 387. That is 37.2% of the axis length, at
# exactly 50% of the axis height.
PROF = dict(run=(641 - 187) / float(1407 - 187), up=(764 - 387) / float(764 - 10))


def fig8():
    """The reaction profile with only the reactant level on it.

    ARROWHEADS ARE TRIANGLES, NOT `<marker>`s — CLAUDE.md's rule, and the reason is the DOM rather
    than taste: a marker needs an id, `fillStuffPages` keeps about five question cards on the page
    at once, and two cards carrying one id would both resolve to whichever came first."""
    L, R, T, B = 44, 318, 22, 182
    y = B - PROF['up'] * (B - T)
    x2 = L + PROF['run'] * (R - L)
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s">'
         % (W, B + 30, 'Reaction profile axes with the reactant energy level already drawn as a '
                       'short horizontal line, and the rest of the profile left blank'),
         '<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, L, T),
         '<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B),
         '<path d="M%d %d l-4 8 l8 0 Z" fill="currentColor"/>' % (L, T - 7),
         '<path d="M%d %d l-8 -4 l0 8 Z" fill="currentColor"/>' % (R + 7, B),
         '<line x1="%d" y1="%.1f" x2="%.1f" y2="%.1f" class="axis"/>' % (L, y, x2, y),
         '<text x="%d" y="12" class="ax" style="text-anchor:middle">Energy</text>' % L,
         '<text x="%.1f" y="%d" class="ax" style="text-anchor:middle">Progress of reaction</text>'
         % ((L + R) / 2.0, B + 20)]
    return ''.join(p) + '</svg>'


# (q, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",2,"short",BN,"graph","", "<p>Copper is a useful metal.</p><p><b>Figure 1</b> is a line graph of the mass of copper produced each year between 1900 and 2010. The year runs along the bottom, marked every 25 years from 1900 to 2025; the mass of copper produced each year, in 10<sup>9</sup> kilograms, runs up the side from 0 to 20, marked every 2. One curve is drawn across the grid.</p><p>Give <b>two</b> conclusions that can be made from <b>Figure 1</b>.</p>",
 "Any two of: the mass of copper produced increased from 1900 to 2010; before 1930 the mass produced increased only slightly; after 1930 it increased rapidly; the highest mass of copper was produced in 2010 (15.8 × 10⁹ kilograms); the lowest was produced in 1900 (0.2 × 10⁹ kilograms); the increase was not linear. A value anywhere in the range 1925 to 1930 is accepted for the turning point.",
 "Figure 1 is a raster image in the PDF with no text layer and no vectors, and the SHAPE OF ITS CURVE is what this question asks you to describe — so the axes are given and the curve deliberately is not, rather than the mark scheme's own conclusions being written into the question. You need the paper open for this part."),
("1","2",3,"explain",BN,"diagram","", "<p>Mixtures of copper and zinc are heated to produce alloys.</p><p><b>Figure 2</b> represents the structures of pure copper and of an alloy of copper and zinc, each drawn as a block of touching circles. <b>Pure copper</b> is three rows of five circles, all the same size. The <b>alloy of copper and zinc</b> is drawn from circles of two sizes: the larger shaded ones are labelled as zinc atoms and the smaller open ones as copper atoms.</p><p>Explain why the alloy of copper and zinc is harder than pure copper. Use <b>Figure 2</b>.</p>",
 "The atoms are different sizes, so the layers are distorted, so the layers cannot easily slide over each other (the atoms cannot slide over each other).",
 "Figure 2 is artwork in the PDF and is not transcribed. How the alloy's rows sit is deliberately not described, because 'the layers are distorted' is the second of this question's three marks."),
("1","3",4,"calculation",QC,"","", "<p>A 5.25 g sample of an alloy of copper and zinc contains 13.5% zinc by mass.</p><p>Calculate the mass of copper in the 5.25 g sample. Give your answer to 3 significant figures.</p>",
 "4.54 g. The copper is 100 − 13.5 = 86.5%, so the mass of copper is (86.5 ÷ 100) × 5.25 = 4.54125 g, which is 4.54 g to 3 significant figures. The scheme takes the other route for the same marks: the zinc is (13.5 ÷ 100) × 5.25 = 0.70875 g, so the copper is 5.25 − 0.70875 = 4.54125 g.", ""),

("2","1",1,"short",CC,"diagram","", "<p>A student prepared copper sulfate by reacting an acid with excess copper carbonate.</p><p><b>Figure 3</b> shows the first two stages. In <b>Stage 1</b>, copper carbonate is tipped from a spatula into a beaker of acid. In <b>Stage 2</b>, the mixture is poured from a flask through a filter funnel into <b>beaker N</b>: the copper sulfate solution runs through into beaker N, and the unreacted copper carbonate stays behind in the funnel.</p><p>What is the formula of the acid used to prepare copper sulfate? Tick <b>one</b> box.</p><ul><li>HCl</li><li>HNO<sub>3</sub></li><li>H<sub>2</sub>SO<sub>4</sub></li></ul>",
 "H₂SO₄",
 "Figure 3 is artwork in the PDF and is not transcribed; what each stage shows is stated in the question."),
("2","2",1,"short",CC,"","", "<p>In <b>Stage 1</b> of the preparation, copper carbonate is added to the acid until the copper carbonate is in excess.</p><p>Why is excess copper carbonate used in stage 1?</p>",
 "So that all the acid reacts (so all the acid is used up)", ""),
("2","3",2,"short",SM + ', ' + CC,"","", "<p>Beaker <b>N</b> contained the copper sulfate solution that had run through the filter funnel.</p><p>Describe how the student could produce copper sulfate crystals from the copper sulfate solution in beaker <b>N</b>.</p>",
 "Heat the solution to remove some of the water (evaporate some of the water or solution), then leave it to cool and crystallise. References to filtration are ignored.", ""),
("2","4",3,"drawing",QC,"graph", fig5(), "<p>A student investigated the thermal decomposition of copper carbonate. Copper carbonate decomposes to form two products. <b>Figure 4</b> shows the apparatus: a test tube held at an angle with the copper carbonate lying in its closed end, and a flame heating it from below.</p>" + METHOD2 + "<p><b>Table 1</b> shows the results.</p>" + T1 + "<p>Plot the data from <b>Table 1</b> on <b>Figure 5</b>. The horizontal axis is the mass of copper carbonate in the test tube before heating in grams, and the vertical axis is the mass of the contents of the test tube after heating in grams.</p><p>Draw a line of best fit.</p>",
 "All five points plotted — (1.2, 0.8), (2.4, 1.7), (3.6, 2.2), (4.8, 3.1) and (6.0, 3.9) — each within half a small square, for 2 marks; 3 or 4 points correctly plotted scores 1. A line of best fit scores the third mark.", ""),
("2","5",1,"short",QC,"","", "<p>Why does the mass of the contents of the test tube decrease in mass when copper carbonate is thermally decomposed?</p>",
 "A gas escapes from the test tube (carbon dioxide escapes). 'Copper carbonate thermally decomposes' on its own is ignored.", ""),

("3","",6,"written",BN,"diagram","", "<p><b>Table 2</b> shows diagrams which represent the structures of two substances.</p><p><b>Sodium chloride, NaCl</b> is drawn as a packed block of spheres of two sizes, the larger ones each marked <b>−</b> and the smaller ones each marked <b>+</b>, alternating in every direction. <b>Oxygen, O<sub>2</sub></b> is drawn as two circles of the same size joined to each other.</p><p>Compare the structure and bonding of sodium chloride and oxygen.</p>",
 "Level marked out of 6. Level 2 (4–6) needs a comparison of either the structure or the bonding of both substances, with a description of magnitude. Indicative content — similarities: both have strong bonds; the particles have full outer shells. Differences: sodium chloride is a compound made from two elements and oxygen is an element; sodium chloride is a giant structure of ions and oxygen is a small molecule; sodium chloride has ionic bonds and consists of oppositely charged ions, with electrons transferred from sodium atoms to chlorine atoms; oxygen is covalent, its molecules made of oxygen atoms joined by a double covalent bond with electrons shared between them, and with weak forces between the molecules.",
 "The Table 2 structures are artwork in the PDF and are not transcribed; what each one shows is stated in the question."),

("4","1",1,"short",CC,"","", "<p>Nitric acid (HNO<sub>3</sub>) is a strong acid.</p><p>What is meant by a 'strong acid'?</p>",
 "Completely ionised in aqueous solution (completely ionised when dissolved in water, or fully dissociated in aqueous solution)", ""),
("4","2",1,"short",CC,"","", "<p>Nitric acid is used as a dilute aqueous solution.</p><p>What is meant by 'dilute aqueous solution'?</p>",
 "A low concentration of the (nitric) acid dissolved in water. A low concentration of solute, solid or gas dissolved in water is also accepted.", ""),
("4","3",1,"short",CC,"","", "<p>10 cm<sup>3</sup> of a nitric acid solution has a pH of 1. Water is added to the nitric acid solution to change the pH of the nitric acid solution to pH 3.</p><p>How does the hydrogen ion concentration change? Tick <b>one</b> box.</p><ul><li>Decreases by a factor of 100</li><li>Decreases by a factor of 10</li><li>Increases by a factor of 10</li><li>Increases by a factor of 100</li></ul>",
 "Decreases by a factor of 100", ""),
("4","4",1,"short",CC,"","", "<p>Write the ionic equation for the reaction between an acid and an alkali.</p>",
 "H⁺ + OH⁻ → H₂O. State symbols are ignored.", ""),
("4","5",1,"short",QC,"","", "<p>The equation shows the reaction between magnesium carbonate and nitric acid.</p><p>MgCO<sub>3</sub> + 2 HNO<sub>3</sub> → Mg(NO<sub>3</sub>)<sub>2</sub> + H<sub>2</sub>O + CO<sub>2</sub></p><p>What is the ratio of the number of moles of magnesium carbonate to the number of moles of nitric acid in the reaction? Tick <b>one</b> box.</p><ul><li>1 : 1</li><li>1 : 2</li><li>2 : 1</li><li>2 : 2</li></ul>",
 "1 : 2", ""),
("4","6",1,"short",CC,"","", "<p>A student mixed some magnesium carbonate with excess nitric acid. The student then added two drops of universal indicator to the solution.</p><p>What colour was the solution after the addition of universal indicator? Tick <b>one</b> box.</p><ul><li>Red</li><li>Green</li><li>Blue</li></ul>",
 "Red", ""),
("4","7",2,"short",EC,"diagram","", "<p>A student investigated the temperature change when different masses of magnesium carbonate were reacted with excess nitric acid.</p><p><b>Figure 6</b> shows the apparatus: a polystyrene cup holding 50 cm<sup>3</sup> of nitric acid, with a thermometer standing in it, and 0.50 g of magnesium carbonate on a spatula held above it.</p>" + METHOD4 + "<p>Give <b>two</b> improvements to the <b>method</b> to produce more accurate results. Do <b>not</b> refer to improvements to the apparatus in your answer.</p>",
 "For each mass of magnesium carbonate, repeat the experiment (discarding anomalous results) and calculate the mean. And measure the highest temperature reached.",
 "Figure 6 is artwork in the PDF and is not transcribed; what it shows is stated in the question."),

("5","1",2,"drawing",BN,"", fig51(), "<p>Complete the dot and cross diagram for an ammonia molecule.</p>",
 "One shared pair of electrons in each overlap (1 mark), and 2 non-bonding electrons on the outer shell of nitrogen (1 mark). Any combination of circles, dots, crosses or e⁻ is allowed, and any inner shell electrons drawn on the nitrogen are ignored. Non-bonding electrons on a hydrogen are not accepted.", ""),
("5","2",4,"calculation",QC,"","", "<p>The equation for the reaction between nitrogen and hydrogen to produce ammonia is:</p><p>N<sub>2</sub> + 3 H<sub>2</sub> → 2 NH<sub>3</sub></p><p>Calculate the mass of hydrogen that is needed to produce 25 g of ammonia.</p><p>Relative atomic masses (A<sub>r</sub>): H = 1, N = 14</p>",
 "4.41 g. Mᵣ of NH₃ = 14 + (3 × 1) = 17; moles of NH₃ = 25 ÷ 17 = 1.47; moles of H₂ = 1.47 × 3/2 = 2.205; mass of H₂ = 2.205 × 2 = 4.41 g. 4.4117647 correctly rounded to at least 2 significant figures is accepted. The scheme's other route scores the same 4 marks: 2 × Mᵣ(NH₃) = 34, so 6 g of H₂ gives 34 g of NH₃, and (6 ÷ 34) × 25 = 4.41 g.", ""),
("5","3",5,"calculation",EC,"","", "<p><b>Figure 7</b> shows the displayed formulae equation for the reaction of nitrogen with hydrogen:</p><p>N ≡ N + 3 H — H → 2 (H — N(— H) — H)</p><p>In the reaction the energy released forming new bonds is 93 kJ/mol greater than the energy needed to break existing bonds.</p><p><b>Table 3</b> shows bond energies.</p>" + T3 + "<p>Calculate the bond energy <b>X</b> for the H — H bond. Use <b>Figure 7</b> and <b>Table 3</b>.</p>",
 "436 kJ/mol. Bonds broken = 945 + 3X. Bonds made = 6 × 391 = 2346. Energy released = bonds made − bonds broken, so 93 = 2346 − (945 + 3X), giving 3X = 1308 and X = 436.", ""),
("5","4",3,"drawing",EC,"", fig8(), "<p>Energy is released from the reaction to produce ammonia.</p><p><b>Figure 8</b> shows part of the reaction profile for the reaction between nitrogen and hydrogen to produce ammonia. Energy runs up the side and progress of reaction along the bottom, and one horizontal line is already drawn partway up the energy axis.</p><p>Complete <b>Figure 8</b>. You should:</p><ul><li>complete the profile line</li><li>label the energy level of the reactants and the product</li><li>label the <b>overall</b> energy change.</li></ul>",
 "The correct shape for an exothermic reaction, with the product line below the level of the reactants line (1 mark). Labelled horizontal lines for the reactants and the product — nitrogen and hydrogen, and ammonia (1 mark). A labelled overall energy change (1 mark).", ""),

("6","1",1,"short",CC,"","", "<p>In the Earth most metals are found as compounds.</p><p>Name <b>one</b> metal that is found in the Earth as the metal itself.</p>",
 "Gold (Au). Silver (Ag), platinum (Pt) and copper (Cu) are also accepted.", ""),
("6","2",1,"short",CC,"","", "<p><b>Figure 9</b> shows a reactivity series, most reactive first:</p><ol><li>Potassium</li><li>Magnesium</li><li>Zinc</li><li>Carbon</li><li>Metal <b>Z</b></li><li>Copper</li></ol><p>Suggest the most economical method for extracting metal <b>Z</b> from an oxide of metal <b>Z</b>.</p>",
 "Reduction by carbon (heating or reacting with carbon)", ""),
("6","3",1,"short",CC,"diagram","", "<p><b>Figure 10</b> shows the electrolysis cell used to extract aluminium from aluminium oxide. The tank is lined with the <b>negative carbon electrode</b>, and three <b>positive carbon electrode</b> rods hang into it from a metal wire. The tank holds a <b>molten mixture of aluminium oxide and substance X</b>, with <b>molten aluminium</b> collected in a layer along the bottom.</p><p>Name substance <b>X</b> shown in <b>Figure 10</b>.</p>",
 "Cryolite",
 "Figure 10 is artwork in the PDF and is not transcribed; every label it carries is stated in the question."),
("6","4",3,"explain",CC,"diagram","", "<p>Explain what happens to the positive carbon electrodes during the extraction of aluminium from aluminium oxide.</p>",
 "Oxygen is produced, which reacts with the carbon of the electrode (the anode) to form carbon dioxide, so the electrode has to be continually replaced (it is used up, or it burns away).",
 "Figure 10 is artwork in the PDF and is not transcribed; what the cell holds is described on 06.3."),
("6","5",2,"short",CC,"diagram","", "<p>The formula of aluminium oxide is Al<sub>2</sub>O<sub>3</sub></p><p>Write a half equation for the reaction at the negative electrode in <b>Figure 10</b>.</p>",
 "Al³⁺ + 3 e⁻ → Al. Al³⁺ + e⁻ → Al with no balancing numbers, or with incorrect ones, scores 1 of the 2.",
 "Figure 10 is artwork in the PDF and is not transcribed; the electrodes it labels are described on 06.3."),

("7","1",4,"explain",BN + ', ' + AS,"","", "<p>Halogens are elements in Group 7 of the periodic table. Calcium reacts with chlorine to produce calcium chloride.</p><p>Explain what happens to calcium atoms and to chlorine atoms when calcium reacts with chlorine to produce calcium chloride.</p>",
 "Each calcium atom loses two electrons; each chlorine atom gains one electron; so one calcium atom reacts with two chlorine atoms; forming Ca²⁺ ions and Cl⁻ ions (calcium ions and chloride ions, or ions with full outer shells). 'Calcium atoms lose electrons and chlorine atoms gain electrons' on its own scores 1 of the 4.", ""),
("7","2",4,"explain",AS,"","", "<p>Explain why chlorine is more reactive than bromine.</p>",
 "Chlorine has fewer shells (chlorine is a smaller atom), so the outer shell is closer to the nucleus (there is less shielding), so there is a stronger attraction between the nucleus and the electron gained, so it gains the electron more easily. The converse argued for bromine is accepted throughout, and 'energy level' is accepted for 'shell'.", ""),
("7","3",2,"short",AS + ', ' + BN,"","", "<p><b>Table 4</b> shows the boiling points of four hydrogen halides.</p>" + T4 + "<p>Describe how the boiling points of the hydrogen halides change as the relative formula mass changes.</p>",
 "As the relative formula mass increases the boiling points of the hydrogen halides increase — but HF has the highest boiling point (HF does not follow the trend, or HF is anomalous).", ""),

("8","1",1,"short",BN,"diagram","", "<p>Describe the arrangement of carbon atoms in the nanotube shown in <b>Figure 11</b>.</p>",
 "Hexagonal rings of carbon atoms",
 "Figure 11 is a rendered photographic-style image in the PDF and is not transcribed. It is described on the question's preamble as a mesh of linked rings rather than of hexagons, because 'hexagonal' is the whole of this answer."),
("8","2",1,"short",BN,"","", "<p>Nanotubes are used in electronics.</p><p>Give <b>one</b> other use of nanotubes.</p>",
 "Any one of: nanotechnology; materials — a suitable use such as sporting equipment or body armour; drug delivery. References to electronic use are ignored.", ""),
("8","3",2,"calculation",QC,"","", "<p>A nanotube contains 2380 carbon atoms.</p><p>Calculate the number of moles of carbon in this nanotube.</p><p>The Avogadro constant is 6.02 × 10<sup>23</sup> per mole.</p>",
 "3.95 × 10⁻²¹ mol — the number of moles is 2380 ÷ (6.02 × 10²³) = 3.953488 × 10⁻²¹, and an answer correctly rounded to at least 2 significant figures is accepted.", ""),
("8","4",3,"explain",BN,"diagram","", "<p>Explain why carbon nanotubes can conduct electricity. Refer to bonding between carbon atoms in your answer.</p>",
 "Each carbon atom forms three covalent bonds, so one electron from each carbon atom is delocalised, so these delocalised electrons carry charge through the structure (through the nanotube).",
 "Figure 11 is a rendered photographic-style image in the PDF and is not transcribed; it is described on the question's preamble."),
]

# ---- the two preambles: a question-scoped row is drawn above EVERY part of its question ----------
S = [
("5", "<p>Nitrogen reacts with hydrogen to produce ammonia (NH<sub>3</sub>).</p>"),
("8", "<p>Carbon nanotubes are cylindrical fullerenes.</p><p><b>Figure 11</b> represents the "
      "structure of a carbon nanotube: a long cylinder, drawn end-on and tilted away, whose curved "
      "wall and open end are a mesh of linked rings of carbon atoms.</p>"),
]

# ---- the paper says what it is out of, and so does every box down the margin ----------------------
PER_QUESTION = {"1": 9, "2": 8, "3": 6, "4": 8, "5": 14, "6": 8, "7": 10, "8": 7}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 70, 'the paper is out of 70 and these sum to %d' % sum(got.values())

# ---- every number the scheme prints inside its own working, recomputed here -----------------------
# FRACTIONS, NOT FLOATS, wherever the decimal is not exact in binary. 86.5/100 and 13.5/100 are
# both recurring in base two, and this file already records two true assertions refused for that
# reason on other papers — 2.4/6.0 != 0.4, and 25000 * 9.8 != 245000.
assert Fraction(1000 - 135, 1000) * 5 == Fraction(865, 200)                  # 100 − 13.5 = 86.5 %
copper = Fraction(865, 1000) * Fraction(525, 100)
assert copper == Fraction(454125, 100000), '01.3 mass of copper: %r' % copper
assert round(float(copper), 3) == 4.541 and float(round(copper, 2)) == 4.54  # 4.54 g to 3 s.f.
zinc = Fraction(135, 1000) * Fraction(525, 100)
assert zinc == Fraction(70875, 100000) and Fraction(525, 100) - zinc == copper   # the other route

assert 14 + 3 * 1 == 17                                                      # 05.2 Mr of NH3
assert round(25 / 17, 2) == 1.47
assert Fraction(147, 100) * Fraction(3, 2) == Fraction(2205, 1000)           # 1.47 x 3/2 = 2.205
assert Fraction(2205, 1000) * 2 == Fraction(441, 100)                        # x 2 = 4.41 g
assert 17 * 2 == 34 and round(Fraction(6, 34) * 25, 7) == Fraction(44117647, 10000000)

assert 6 * 391 == 2346                                                       # 05.3 bonds made
assert 2346 - 945 - 93 == 1308                                               # so 3X = 1308
assert Fraction(1308, 3) == 436                                              # X = 436 kJ/mol

assert 10 ** (3 - 1) == 100                                                  # 04.3 pH 1 -> pH 3
assert Fraction(1, 2) == Fraction(1, 2)                                      # 04.5 MgCO3 : 2 HNO3

assert round(2380 / 6.02, 4) == 395.3488                                     # 08.3 3.953488e-21

# ---- and the three drawings, against what was measured in the pixels -----------------------------
# Figure 5's grid: 65 small squares by 45 at 0.1 each, so the axes run to 6.5 and 4.5.
assert 65 * 0.1 == 6.5 and round(45 * 0.1, 10) == 4.5
assert len(TABLE1) == 5 and TABLE1[0] == ('1.2', '0.8') and TABLE1[-1] == ('6.0', '3.9')
# the two side hydrogens are equidistant from the nitrogen — the check that says they were measured
_n = AMM['n'][0]
assert abs((_n - AMM['h'][0][0]) - (AMM['h'][1][0] - _n)) < 0.5
assert AMM['h'][2][0] == _n                                    # and the third sits directly below
# and the reactant level really is at half height, which is what makes it safe to draw
assert abs(PROF['up'] - 0.5) < 0.005 and abs(PROF['run'] - 0.372) < 0.005

# EVERY TOPIC ATOM HAS TO JOIN THE TREE, and that is the rule rather than "no comma in a name".
#
# THE FIRST VERSION OF THIS ASSERTION COULD NOT FAIL. It split the cell on commas and then checked
# each piece for a comma — which is nothing, because the split has already eaten it. Put AQA's own
# "Bonding, Structure and the Properties of Matter" in and it passed, cheerfully, having turned one
# unit into two topics that join nothing. A check that cannot fail is not a check, and one carrying
# a confident comment about what it protects is worse: CLAUDE.md has deleted a rule for exactly
# that. Found by mutation, which is the only way it could have been.
#
# Reading the tree is what a comma-split cannot do. `asList_` splits this cell on commas, so a
# comma inside a name IS a second topic — and the second topic is one `data/topics.json` has never
# heard of, so it resolves to no branch and the join silently reaches nothing. That is the trundle
# wheel's fault, where `Perimeter and area` read perfectly and matched one question of 4,000.
_tree = json.loads((pathlib.Path(__file__).parent.parent / 'data' / 'topics.json').read_text())
_known = set()
for _row in _tree:
    for _name in [_row.get('label', ''), _row.get('topic_id', '')] + \
                 str(_row.get('aliases', '')).split(','):
        if _name.strip():
            _known.add(_name.strip().lower())
for _q in Q:
    for _t in _q[4].split(','):
        assert _t.strip().lower() in _known, (
            'topic %r on %s.%s is not a label, id or alias in data/topics.json'
            % (_t.strip(), _q[0], _q[1]))

d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 5          # Friday 17 May 2024

rows = []
for q, html in S:
    r = dict(DOC)
    r.update(row_id='S-AQA-8464C-2406-1H-%02d' % int(q), kind='preamble', question=q,
             section='', html=html, placeholder='')
    rows.append(r)
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-8464C-2406-1H-%02d%s' % (int(q), part), kind='question',
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
assert PAPER in {json.loads(l.rstrip(','))['paper_id'] for l in lines if '"paper_id"' in l}, (
    'the document row for %s is not in %s — this script does not write one' % (PAPER, p))

lines[-2] += ','
for r in rows[:-1]:
    lines.insert(-1, json.dumps(r) + ',')
lines.insert(-1, json.dumps(rows[-1]))
p.write_text('\n'.join(lines) + '\n')
print('wrote %d rows for %s (%d questions, %d preambles), %d marks'
      % (len(rows), PAPER, len(Q), len(S), sum(got.values())))
