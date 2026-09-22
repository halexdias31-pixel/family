#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""AQA GCSE Combined Science: Trilogy 8464/C/2H, June 2024 — Chemistry Paper 2H, Higher.

Two preamble rows and 33 question rows under `P-AQA-8464C-2406-2H`, whose document row already
exists and is NOT written again here. Both counts are printed by the run as well as stated here,
for the reason CLAUDE.md gives about "all 18 checks pass": this sentence is the one that goes
stale.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Higher)_ Paper 2 Chemistry - June 2024.pdf`, AQA's own
8464/C/2H scheme, read line by line — not derived, not worked out from the question. CLAUDE.md
records what deriving cost on the 2017 Highers: four answers subtly wrong because they were
reasoned rather than read. Where the scheme says `allow`, the alternatives are carried; where it
says `ignore` or `do not accept`, that is carried too, because the refusals are the half a happy
path never reaches. 01.5's `MP2 is dependent on MP1` and 03.5's "1 mark for the unbalanced
equation" are the scheme's own conditions and are written into the answers rather than flattened.

THE TOTALS ARE ASSERTED BOTH WAYS. The cover says *"The maximum mark for this paper is 70"* and the
scheme prints `Total Question 1 … 10`, `2 … 12`, `3 … 12`, `4 … 8`, `5 … 13`, `6 … 15`. The paper's
own margin boxes (page 6 `10`, page 9 `12`, page 12 `12`, page 15 `8`, page 20 `13`, page 24 `15`)
agree with the scheme box for box. Both the per-question dict and its sum are asserted below, so a
dropped part or a misread mark count fails here instead of shipping.

AND EVERY NUMBER THE SCHEME PRINTS INSIDE ITS OWN WORKING IS RECOMPUTED, because a scheme can be
mis-READ. 6.4 ÷ 0.87 = 7.356, 77.8/100 × 3.50 = 2.723, 750 ÷ 215 = 3.488372093, 3.49 × 10 000 =
34 900 and the scheme's own alternative route through 215/10 000 = 0.0215. **Every one goes through
`Fraction`.** In float `6.4/0.87` is 7.356321839080461 where the exact value is 7.35632183908046 —
they differ in the last digit, so a naive equality assertion on this paper is fragile in exactly
the way CLAUDE.md records twice, where a true assertion was refused by binary floating point. The
two balanced equations are asserted element by element, one line per element, which is the form
that cannot be written wrong by accident.

WHAT THE TEXT LAYER DID. 13.4 KB over 28 pages, which by CLAUDE.md's rough tell is thin — and it is
thin honestly: a question paper is mostly ruled answer space. The prose, the `[n marks]` tags, the
margin totals and every tick-box option on pages 16 and 17 extracted cleanly, and the 33 parts were
counted off the paper's own `0 n . m` labels rather than off my reading of it. WHAT IT HAS NONE OF
IS THE FIGURES: all six are raster images inside the PDF (`get_images` returns exactly one per
figure page, `get_drawings` returns only the page furniture), so nothing inside any of them is in
the text layer at all and every one had to be rendered and looked at.

NOTHING ON THIS PAPER IS DRAWN, AND THAT IS A DECISION RATHER THAN A GAP.

  Figures 1 and 3 — the fractionating column and the rate apparatus — are apparatus diagrams. The
  row's own words do not determine them; what they are is a set of LABELS, and every label is
  transcribed into the question. 02.1 is six marks of method and the student is told "Figure 3
  shows the apparatus", so the labels are the question: conical flask, stopper, delivery tube,
  measuring cylinder inverted in a trough of water. Figure 1 prints `Crude oil`, `Heat` and an
  upward arrow reading `Decreasing temperature`, and that arrow is transcribed because the paper
  hands it to the student — describing less would make 01.3 harder here than in the hall.

  Figure 4 — the chromatogram — is marked **Not to scale** on the paper itself, which is the paper
  saying its spot heights are not data. What it carries is an ORDER (red on the start line, yellow
  above it, blue higher, solvent front at the top) and four labels, and prose carries an order
  perfectly. Drawing it would mean choosing the two heights the paper declines to fix. Same answer
  the 8462/2H transcription already gave for its two chromatograms.

  Figures 5 and 6 — the two graphs — are the ones worth the paragraph, because I measured them
  before refusing them. CLAUDE.md's rule for a picture carrying data is to measure rather than
  eyeball, so both rasters were calibrated off their own gridlines (minor pitch 23.58 px = 5 s
  across and 0.2 mol up; the y-axis at column 266 and the x-axis at row 1314 on Figure 6) and the
  curves read column by column. Two things came out of that and they point opposite ways:

    THE MEASUREMENT IS SOUND. Figure 6's curve starts at 0.06 mol — the line's own thickness — and
    plateaus at 8.414 mol, reaching it between 202 and 207 s depending on the tolerance used. The
    scheme's answer to 05.6 is `210 (s)` with `allow a value in the range 205 to 210`, so the
    scheme's own tolerance band CONTAINS the measurement. That is what confirms the scale, exactly
    as the crossing point confirmed it on 8462/1H's Figure 3.

    AND IT STILL DOES NOT LICENCE A DRAWING. Figure 5 holds three curves that cross twice, and two
    attempts at separating them failed in the flattering direction: a nearest-run tracker collapsed
    all three onto one curve at the first crossing and reported a stoichiometry of −3.40 mol of
    oxygen consumed, and a slope-predicting tracker coasted the SO3 curve flat at zero for the
    whole graph. A wrongly separated curve is a wrong question that reads perfectly — so the honest
    report is that I could not do it, rather than a picture nobody would have checked. Figure 6 is
    Figure 5's sulfur trioxide curve drawn alone, so drawing one and describing the other would put
    two renderings of one curve in the library, which is the two-readers-of-one-thing fault
    CLAUDE.md records under `documents_()` and `factsNow_`. Both are described, both carry
    `figure`, and both join the outstanding count where they belong: 05.6 and 05.7 cannot be
    answered off the card, and that is 7 of this paper's 70 marks stated as a number rather than
    hidden.

  Figure 2 — the repeating unit of poly(propene) — is the one that gets NO `figure`, and the reason
  is the KS2 Paper 2 lesson rather than laziness. It is a displayed formula, and a displayed
  formula is TEXT: both carbons, all four hydrogens, the methyl group, the two bonds leaving the
  brackets and the subscript n are written out in the row. Nothing is outstanding, so counting it
  would be a number counting work that does not exist — which CLAUDE.md calls the mirror of a
  silence, and stops the count meaning anything just as surely.

AND WHAT A FIGURE SHOWS IS NOT WHAT ITS ANSWER IS. 05.6's three marks are the TIME and the fact
that the lines become level; so Figure 5 is described by its axes, its three labels and its three
starting values (10, 5 and 0 moles, read at t = 0 where no curves cross), and the levelling is NOT
in the question. It is in `examiner_note`, which `answerBlock_` draws inside `.qans` — behind the
reveal for a student, always open for staff — which is the right side of that line. 05.7's note
carries the measured gradient at 60 s, 0.052 mol/s, explicitly flagged as measured here rather than
printed by the scheme, because the scheme prints no value at all: all four of its marks are method
and it allows the correct use of an incorrectly drawn tangent.

THE TOPICS ARE THE SCHEME'S OWN SPEC REFERENCES, resolved to the branches data/topics.json already
carries. Unit 5.6 is *The rate and extent of chemical change* — rates AND equilibrium — and this
library spells it `Rate of Reaction`, which is what the 8462/2H rows for the identical SO2/O2/SO3
equilibrium already use; CLAUDE.md records `The Rate and Extent of Chemical Change` being refused
as a second home for it. So all seven parts of Q5 are `Rate of Reaction`, including 05.1, whose
spec ref is 5.6.2.2 and not unit 5.5. One topic per row: measured first, 0 science rows in the
library carry a maths branch and only 3 carry more than one topic at all, so a maths link on 05.7
would have been a convention invented here while four other agents work in the same file.
"""
import json, datetime, pathlib, sys
from fractions import Fraction

PAPER = 'P-AQA-8464C-2406-2H'
BASE = dict(paper_id=PAPER, subject='Combined Science', key_stage='KS4', band_type='stage',
            band_value='GCSE', tier='Higher', level='GCSE', company='AQA', exam_board='AQA',
            spec_code='8464/C/2H', exam_wave='First wave', year='2024', month='6', paper='2',
            exam_date='2024-06-11', document_type='Past paper',
            name='Chemistry Paper 2 — June 2024', active='True', trackable='True',
            printable='False')

# The branches of data/topics.json, spelled as the tree spells them. NO COMMAS: `topics` is a
# comma-list read by `asList_`, so a comma inside a name is a second topic — the fault that split
# `Bonding, Structure and the Properties of Matter` into two things neither of which joins
# anything. Asserted against the tree at the foot rather than remembered.
OR = 'Organic Chemistry'          # 5.7 — crude oil, alkanes, alkenes, polymers
RT = 'Rate of Reaction'           # 5.6 — the rate AND extent of chemical change (see the header)
AT = 'Chemistry of the Atmosphere'  # 5.9 — atmospheric pollutants
AN = 'Chemical Analysis'          # 5.8 — chromatography
UR = 'Using Resources'            # 5.10 — potable water, phytomining

# ---- the figures, described rather than drawn. See the header for why each one. -------------------
FIG1 = ("<p><b>Figure 1</b> is a diagram of the equipment. A pipe labelled <i>Crude oil</i> enters "
        "on the left and coils through a furnace, with an arrow labelled <i>Heat</i> pointing up "
        "into it from below. From the furnace a pipe runs into the lower part of a tall column. "
        "The column is drawn with five trays at different heights, each with an outlet pipe "
        "leaving the side of the column, together with one outlet at the very top and one at the "
        "very bottom. A long arrow beside the column, pointing upwards, is labelled "
        "<i>Decreasing temperature</i>.</p>")
FIG3 = ("<p><b>Figure 3</b> shows the apparatus, with these parts labelled: a <i>conical flask</i> "
        "holding <i>hydrochloric acid</i>, with pieces of <i>calcium carbonate</i> lying at the "
        "bottom and bubbles rising through the liquid; a <i>stopper</i> in the neck of the flask "
        "carrying a <i>delivery tube</i>; and that delivery tube running across and up into an "
        "inverted <i>measuring cylinder</i> standing in a trough of <i>water</i>, with "
        "<i>carbon dioxide</i> collecting in the closed top of the cylinder.</p>")
FIG4 = ("<p><b>Figure 4</b> shows the chromatogram: a vertical strip with a horizontal "
        "<i>start line</i> drawn near the bottom and a horizontal <i>solvent front</i> near the "
        "top. Three spots are marked on it — a <b>red</b> spot sitting on the start line, a "
        "<b>yellow</b> spot part of the way up, and a <b>blue</b> spot higher still, below the "
        "solvent front. The figure is marked <i>Not to scale</i>.</p>")
FIG5 = ("<p><b>Figure 5</b> is a graph of <i>number of moles</i> up the side against <i>time in "
        "seconds</i> along the bottom, drawn on a square grid. The vertical axis runs from 0 to "
        "just over 10 and is labelled every 2; the horizontal axis runs from 0 to 300 and is "
        "labelled every 50. Three curves are drawn, each labelled at its right-hand end: "
        "<b>SO<sub>2</sub></b>, which starts at 10 moles, <b>O<sub>2</sub></b>, which starts at "
        "5 moles, and <b>SO<sub>3</sub></b>, which starts at 0 moles.</p>")
FIG6 = ("<p><b>Figure 6</b> is the sulfur trioxide curve of <b>Figure 5</b> drawn on its own, on "
        "the same square grid: <i>number of moles of sulfur trioxide</i> up the side, from 0 to "
        "just over 10 and labelled every 2, against <i>time in seconds</i> along the bottom, from "
        "0 to 300 and labelled every 50.</p>")

TICK_EQ = ("<ul><li>Equilibrium position shifts to the left</li>"
           "<li>Equilibrium position does not change</li>"
           "<li>Equilibrium position shifts to the right</li></ul>")

METHOD6 = ("<p>A student investigated the mass of dissolved solids in a 100 cm<sup>3</sup> sample "
           "of sea water. This is the method used.</p><ol><li>Weigh an evaporating basin.</li>"
           "<li>Measure 100 cm<sup>3</sup> of sea water.</li><li>Pour the sea water into the "
           "evaporating basin.</li><li>Heat the evaporating basin.</li><li>Weigh the evaporating "
           "basin and contents.</li><li>Calculate the mass of dissolved solids in the sea "
           "water.</li></ol>")

# ---- the two preambles: content several parts hang from, which is what a preamble is for ---------
# Q4: all four parts are about the one chromatogram. Q5: all seven are about the one reversible
# reaction. Q6 gets NO preamble although it has a shared method, because that method is shared by
# 06.3 alone — a question-scoped preamble attaches to every part, and it would sit above 06.1
# (distillation) and 06.7 (phytomining), which are not about it.
STEMS = [
("4", AN, "diagram", "",
 "<p>Printer ink is a mixture of chemicals.</p><p>A student used chromatography to investigate the "
 "colours in a printer ink. The student put a spot of the printer ink on the start line.</p>"
 "<p><b>Figure 4</b> shows the results.</p>" + FIG4),
("5", RT, "", "",
 "<p>Sulfuric acid is produced by an industrial process.</p><p>In the process, sulfur dioxide "
 "(SO<sub>2</sub>) reacts with oxygen (O<sub>2</sub>) to produce sulfur trioxide "
 "(SO<sub>3</sub>).</p><p>The equation for the reversible reaction is:</p>"
 # ⇌ LITERALLY, NOT `&rlhar;`. Measured: the library writes this arrow as the character three
 # times and as that entity never, and an entity with no precedent here is one more thing that
 # can render as text on a parser that does not carry the HTML5 name.
 "<p>2 SO<sub>2</sub>(g) + O<sub>2</sub>(g) ⇌ 2 SO<sub>3</sub>(g)</p>"
 "<p>The forward reaction releases 198 kJ/mol of energy.</p>"),
]

# (q, part, marks, answer_type, topics, figure, diagram, html, answer, examiner_note)
Q = [
("1","1",1,"short",OR,"","",
 "<p>Alkanes and alkenes are hydrocarbons.</p><p>Define the term &lsquo;hydrocarbon&rsquo;.</p>",
 "A molecule made up of carbon and hydrogen atoms only", ""),
("1","2",1,"short",OR,"","",
 "<p>The general formula for alkanes is C<sub>n</sub>H<sub>2n+2</sub></p><p>Determine the formula "
 "of the alkane with 10 carbon atoms.</p>",
 "C<sub>10</sub>H<sub>22</sub> — with n = 10, the number of hydrogens is 2 × 10 + 2 = 22", ""),
("1","3",4,"explain",OR,"diagram","",
 "<p>Crude oil is a mixture of hydrocarbons.</p><p><b>Figure 1</b> represents industrial equipment "
 "used to separate crude oil into fractions.</p>" + FIG1 +
 "<p>Explain how crude oil is separated into fractions. Use <b>Figure 1</b>.</p>",
 "Four marks, one each: the crude oil is heated; so some of the hydrocarbons vaporise; the column "
 "has a temperature gradient (allow: the column gets cooler going up); so the hydrocarbons or "
 "fractions condense at different heights or temperatures in the column — or, for the same mark, "
 "they condense at their boiling points.",
 "Figure 1 is a raster image inside the PDF with no text layer, so it is described in the "
 "question rather than reproduced. Every label it carries, including the upward "
 "'Decreasing temperature' arrow, is transcribed, because the paper hands those to the student."),
("1","4",1,"short",OR,"","",
 "<p>The alkane molecule C<sub>14</sub>H<sub>30</sub> can be cracked to produce smaller "
 "molecules.</p><p>Balance the equation for the reaction.</p>"
 "<p>C<sub>14</sub>H<sub>30</sub> &rarr; C<sub>8</sub>H<sub>18</sub> + ......... "
 "C<sub>3</sub>H<sub>6</sub></p>",
 "C<sub>14</sub>H<sub>30</sub> → C<sub>8</sub>H<sub>18</sub> + <b>2</b> C<sub>3</sub>H<sub>6</sub> "
 "— carbon: 8 + 2 × 3 = 14, and hydrogen: 18 + 2 × 6 = 30", ""),
("1","5",2,"short",OR,"","",
 "<p>Propene (C<sub>3</sub>H<sub>6</sub>) is an alkene.</p><p>Describe the test for alkenes. Give "
 "the result.</p>",
 "Test: add bromine water. Result: it changes from orange to colourless (allow: it decolourises; "
 "ignore 'clear'). The result mark is dependent on the test mark being awarded.", ""),
("1","6",1,"short",OR,"","",
 "<p>Poly(propene) is made from propene.</p><p><b>Figure 2</b> represents the repeating unit of "
 "poly(propene). It is drawn as a displayed formula: two carbon atoms joined by a single bond, "
 "the left-hand one carrying an H above it and an H below it, the right-hand one carrying a "
 "CH<sub>3</sub> above it and an H below it, with a bond leaving the pair on each side. The whole "
 "unit is enclosed in brackets with a subscript <i>n</i> outside them — that is, "
 "&mdash;[CH<sub>2</sub>&mdash;CH(CH<sub>3</sub>)]<sub>n</sub>&mdash;</p>"
 "<p>What type of substance is poly(propene)?</p>",
 "A polymer (allow: plastic; allow: hydrocarbon)", ""),

("2","1",6,"written",RT,"diagram","",
 "<p>Some factors affect the rates of chemical reactions.</p><p>A student investigated the effect "
 "of changing the particle size of calcium carbonate on the rate of reaction with hydrochloric "
 "acid.</p><p><b>Figure 3</b> shows the apparatus.</p>" + FIG3 +
 "<p>Describe a method the student could use to produce valid results.</p>",
 "Level-marked out of 6. Level 3 (5–6) the method would lead to a valid outcome, key steps "
 "identified and logically sequenced; Level 2 (3–4) not necessarily valid, most steps identified "
 "but not fully sequenced; Level 1 (1–2) some relevant steps, links not clear. Indicative content: "
 "measure a volume of hydrochloric acid using a measuring cylinder; measure a mass of calcium "
 "carbonate using a balance; add the acid to the calcium carbonate in the conical flask; put the "
 "stopper and delivery tube into the flask; start a timer; record the volume of gas collected at "
 "set time intervals, or time how long it takes for a fixed volume of gas to be collected; repeat "
 "using different sized pieces of calcium carbonate; keep the same mass of calcium carbonate, the "
 "same volume, concentration and temperature of acid; repeat each experiment.",
 "Figure 3 is a raster image inside the PDF; its labelled parts are transcribed into the question, "
 "because the student is told the apparatus is shown and the labels are what the method is "
 "written from."),
("2","2",3,"explain",RT,"","",
 "<p>The student investigated the effect of increasing the temperature on the rate of a "
 "reaction.</p><p>Explain the effect of increasing the temperature on the rate of a reaction. "
 "Refer to particles and collisions in your answer.</p>",
 "Three marks, one each: increasing the temperature increases the rate of reaction; because the "
 "particles have more energy (allow: the particles move faster); so the frequency of collisions "
 "increases (allow: a greater proportion of collisions have enough energy to react).", ""),
("2","3",2,"short",RT,"","",
 "<p>Catalysts affect the rate of reactions.</p><p>What is meant by a &lsquo;catalyst&rsquo;?</p>",
 "A substance that increases the rate of reaction (allow: changes the rate of reaction), and is "
 "not used up during the reaction. 'Does not take part in the reaction' is ignored.", ""),
("2","4",1,"short",RT,"","",
 "<p>What are catalysts in biological systems called?</p>",
 "Enzymes", ""),

("3","1",4,"explain",OR,"","",
 "<p>Some fractions of crude oil are processed to produce fuel for transport.</p><p>Describe how "
 "crude oil was formed.</p>",
 "Four marks, one each: plankton died (allow: the remains of ancient biomass); and were buried in "
 "mud (allow: buried by sediments); and were compressed; over millions of years.", ""),
("3","2",2,"explain",AT,"","",
 "<p>Transport is a source of atmospheric pollutants.</p><p>Suggest how sulfur dioxide can be "
 "produced by transport.</p>",
 "Some fuels contain sulfur (a named fossil fuel is allowed for 'fuels'); which reacts with oxygen "
 "to produce sulfur dioxide.", ""),
("3","3",2,"short",AT,"","",
 "<p>Give <b>two</b> problems caused by sulfur dioxide as an atmospheric pollutant.</p>",
 "Acid rain (allow a specific effect of acid rain); and respiratory problems in humans (allow a "
 "named respiratory problem, for example asthma).", ""),
("3","4",2,"explain",AT,"","",
 "<p>Describe how carbon monoxide can be produced by transport.</p>",
 "Fuels are burnt (a named fossil fuel is allowed); in insufficient or limited oxygen (allow: "
 "carbon monoxide is produced by incomplete combustion).", ""),
("3","5",2,"short",AT,"","",
 "<p>Catalytic converters are fitted to car exhausts to reduce the amount of pollution from "
 "cars.</p><p>Carbon monoxide and nitrogen dioxide (NO<sub>2</sub>) react in a catalytic "
 "converter. Nitrogen and carbon dioxide are produced.</p><p>Write a balanced equation for the "
 "reaction.</p>",
 "4 CO + 2 NO<sub>2</sub> → N<sub>2</sub> + 4 CO<sub>2</sub> — carbon 4 = 4, oxygen 4 + 4 = 8, "
 "nitrogen 2 = 2. CO + NO<sub>2</sub> → N<sub>2</sub> + CO<sub>2</sub> with no balancing numbers, "
 "or with incorrect ones, scores 1 of the 2.", ""),

("4","1",2,"explain",AN,"","",
 "<p>Explain why the red colour did not move from the start line.</p>",
 "The red colour is insoluble in the solvent; so it does not move with the solvent.", ""),
("4","2",4,"calculation",AN,"","",
 "<p>The blue colour moved 6.4 cm up the chromatogram.</p><p>The R<sub>f</sub> value of the blue "
 "colour is 0.87</p><p>Calculate the distance moved by the solvent.</p><p>Give your answer to "
 "<b>2 significant figures</b>.</p>",
 "<b>7.4 cm</b>. Four marks: writing 0.87 = 6.4 ÷ (distance moved by solvent); rearranging to "
 "distance moved by solvent = 6.4 ÷ 0.87; = 7.356; = 7.4 cm to 2 significant figures.", ""),
("4","3",1,"short",AN,"","",
 "<p>There were four colours in the printer ink.</p><p>Suggest <b>one</b> reason why only three "
 "colours were visible on the chromatogram.</p>",
 "Any one of: two of the dyes may have the same R<sub>f</sub> value as the blue or yellow colour; "
 "two of the dyes may have spots in the same place; two of the colours may be insoluble; the other "
 "colour may be white. 'Colourless' is ignored.", ""),
("4","4",1,"short",AN,"","",
 "<p>Suggest how the student could use chromatography to show there were four colours in the "
 "printer ink.</p>",
 "Use a different solvent", ""),

("5","1",1,"short",RT,"","",
 "<p>What is the amount of energy transferred during the reverse reaction?</p><p>Tick <b>one</b> "
 "box.</p><ul><li>&lt; 198 kJ/mol</li><li>= 198 kJ/mol</li><li>&gt; 198 kJ/mol</li></ul>",
 "= 198 kJ/mol", ""),
("5","2",1,"short",RT,"","",
 "<p>The concentration of oxygen is increased.</p><p>What is the effect on the position of the "
 "equilibrium?</p><p>Tick <b>one</b> box.</p>" + TICK_EQ,
 "Equilibrium position shifts to the right", ""),
("5","3",1,"short",RT,"","",
 "<p>The pressure is decreased.</p><p>What is the effect on the position of the equilibrium?</p>"
 "<p>Tick <b>one</b> box.</p>" + TICK_EQ,
 "Equilibrium position shifts to the left", ""),
("5","4",1,"short",RT,"","",
 "<p>The temperature is increased.</p><p>What is the effect on the position of the equilibrium?</p>"
 "<p>Tick <b>one</b> box.</p>" + TICK_EQ,
 "Equilibrium position shifts to the left", ""),
("5","5",2,"explain",RT,"","",
 "<p>A catalyst is used in the reaction.</p><p>Suggest what effect the catalyst has on the "
 "position of the equilibrium. Give <b>one</b> reason for your answer.</p>",
 "Effect: the equilibrium position does not change. Reason: the catalyst increases the rate of the "
 "forward reaction and the reverse reaction equally.", ""),
("5","6",3,"explain",RT,"graph","",
 "<p>A scientist measured how the number of moles of sulfur dioxide, oxygen and sulfur trioxide "
 "varied with time during the reaction.</p><p><b>Figure 5</b> shows the results.</p>" + FIG5 +
 "<p>Determine the time taken for the reaction to reach equilibrium. Explain your answer. Use "
 "<b>Figure 5</b>.</p>",
 "Time: <b>210 s</b> — any value in the range 205 to 210 s is accepted. Explanation, one mark "
 "each: the lines become level or horizontal; because the rates of the forward reaction and the "
 "reverse reaction are equal — or, for the same mark, because the number of moles of all three "
 "gases remains constant.",
 "Figure 5 is a raster image inside the PDF and is not reproduced here, so this part cannot be "
 "answered off the card. Measured off the printed curve rather than read by eye, the sulfur "
 "trioxide plateau is 8.41 moles and is reached between 202 and 207 s depending on the tolerance "
 "used — inside the scheme's own accepted range, which is what confirms the reading of the scale. "
 "The value above is the scheme's, not the measurement's."),
("5","7",4,"calculation",RT,"graph","",
 "<p><b>Figure 6</b> shows the results for sulfur trioxide.</p>" + FIG6 +
 "<p>Determine the rate of reaction at 60 seconds. Give your answer in mol/s.</p>",
 "Four marks, one each: a tangent drawn to the curve at 60 s; correct values read off that tangent "
 "for the y step and the x step (a tolerance of half a small square is allowed on each "
 "coordinate); rate = y step ÷ x step; and the rate calculated correctly from them. The scheme "
 "allows the correct use of an incorrectly drawn tangent, and the correct use of incorrectly "
 "determined values for the steps.",
 "The scheme prints no value for the rate — all four marks are for the method. Figure 6 is a "
 "raster image and is not reproduced here. Measured off the printed curve, the gradient at 60 s is "
 "0.052 mol/s, so a correctly drawn tangent should give about 0.05 mol/s; that figure was measured "
 "here and is not the scheme's."),

("6","1",1,"short",UR,"","",
 "<p>The Earth&rsquo;s natural resources are used to manufacture useful products. One useful "
 "product is potable water.</p><p>Potable water can be produced from sea water by distillation.</p>"
 "<p>Give <b>one</b> disadvantage of using distillation to produce potable water.</p>",
 "Large amounts of energy are required. References to time and to cost are ignored.", ""),
("6","2",2,"short",UR,"","",
 "<p>Describe <b>one</b> other method to produce potable water from sea water.</p>",
 "Reverse osmosis; using membranes. 'Desalination' on its own is ignored.", ""),
("6","3",2,"explain",UR,"","",
 METHOD6 + "<p>Explain how repeating steps 4 and 5 would improve this method.</p>",
 "Heat until the mass is constant; to ensure that all the water has evaporated.", ""),
("6","4",2,"calculation",UR,"","",
 "<p>The total mass of dissolved solids in a 100 cm<sup>3</sup> sample of sea water is 3.50 g.</p>"
 "<p>The percentage of sodium chloride in the dissolved solids is 77.8%.</p><p>Calculate the mass "
 "of sodium chloride dissolved in the 100 cm<sup>3</sup> sample of sea water.</p>",
 "<b>2.72 g</b> — mass = (77.8 ÷ 100) × 3.50 = 2.723 g, and 2.723 g is also accepted.", ""),
("6","5",2,"short",UR,"","",
 "<p>Biological methods are used to extract metal compounds from metal ores.</p><p>One method of "
 "producing copper from low-grade copper ores is by using bacteria. The bacteria produce leachate "
 "solutions that contain copper compounds.</p><p>Give <b>two</b> methods that can be used to "
 "extract copper from these leachate solutions.</p>",
 "Displacement using scrap iron; and electrolysis.", ""),
("6","6",3,"explain",UR,"","",
 "<p>Phytomining uses plants to absorb metal compounds from low-grade ores.</p><p>Describe how the "
 "metal compounds are obtained from the plants.</p>",
 "Three marks, one each: the plants are harvested; and burned; to produce ash that contains the "
 "metal compounds.", ""),
("6","7",3,"calculation",UR,"","",
 "<p>Nickel is produced by phytomining.</p><p>One hectare of plants produces 215 kg of nickel.</p>"
 "<p>Determine the area required to produce 750 kg of nickel.</p><p>Give your answer in "
 "m<sup>2</sup>.</p><p>One hectare = 10 000 m<sup>2</sup></p>",
 "<b>34 900 m<sup>2</sup></b> (3.49 × 10<sup>4</sup> m<sup>2</sup> is accepted). Area = 750 ÷ 215 "
 "= 3.49 hectares — 3.488372093 correctly rounded to at least 2 significant figures is allowed — "
 "then 3.49 × 10 000 = 34 900 m². The scheme's alternative route scores the same: 215 ÷ 10 000 = "
 "0.0215 kg/m², then 750 ÷ 0.0215 = 34 900 m².", ""),
]

# ---- the paper says what it is out of, and so does every box down the margin ----------------------
PER_QUESTION = {"1": 10, "2": 12, "3": 12, "4": 8, "5": 13, "6": 15}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 70, 'the cover says 70 and these sum to %d' % sum(got.values())
assert len(Q) == 33, 'the paper prints 33 parts, counted off its own "0 n . m" labels; got %d' % len(Q)

# ---- every number the scheme prints inside its own working, recomputed with Fraction --------------
# FRACTION AND NOT FLOAT, and 04.2 is why: in binary 6.4/0.87 is 7.356321839080461 where the exact
# value is 7.35632183908046. CLAUDE.md records two true assertions refused by binary float; this is
# the same trap one paper along, and the answer is to stay exact.
def sig(x, n):
    """Round a Fraction to n significant figures, as the scheme does."""
    import math
    f = float(x)
    return round(f, n - 1 - math.floor(math.log10(abs(f))))

rf = Fraction(64, 10) / Fraction(87, 100)                      # 04.2
assert round(float(rf), 3) == 7.356, float(rf)                 # the scheme prints 7.356
assert sig(rf, 2) == 7.4                                       # and then 7.4 to 2 sf

nacl = Fraction(778, 1000) * Fraction(350, 100)                # 06.4
assert nacl == Fraction(2723, 1000)                            # the scheme allows 2.723
assert round(float(nacl), 2) == 2.72

ha = Fraction(750, 215)                                        # 06.7
assert round(float(ha), 9) == 3.488372093                      # the scheme prints all of this
assert sig(ha, 3) == 3.49
assert Fraction(349, 100) * 10000 == 34900
conv = Fraction(215, 10000)                                    # the scheme's alternative route
assert conv == Fraction(43, 2000) and float(conv) == 0.0215
assert sig(Fraction(750) / conv, 3) == 34900.0

assert 2 * 10 + 2 == 22                                        # 01.2, CnH2n+2 with n = 10

# 01.4 and 03.5, one line per element — the form that cannot be written wrong by accident
assert 8 + 2 * 3 == 14 and 18 + 2 * 6 == 30                    # C14H30 -> C8H18 + 2 C3H6
assert 4 * 1 == 4 * 1                                          # 4 CO + 2 NO2 -> N2 + 4 CO2 : carbon
assert 4 * 1 + 2 * 2 == 4 * 2                                  #                            : oxygen
assert 2 * 1 == 1 * 2                                          #                            : nitrogen

# ---- what was measured off the two graphs, so the notes cannot drift from the measurement --------
FIG6_PLATEAU = 8.414          # moles of SO3, mean of the curve past 260 s
FIG6_LEVELS_AT = (202, 207)   # first second within 0.05 / 0.01 mol of that plateau
FIG6_GRADIENT_60 = 0.0519     # mol/s, least-squares over 45-75 s
SCHEME_RANGE = (205, 210)     # 05.6: "allow a value in the range 205 to 210 (s)"
# THE SCHEME'S OWN TOLERANCE BAND CONTAINS THE MEASUREMENT. That is what confirms the scale, and
# it is the only independent check available on a raster with no text layer.
assert FIG6_LEVELS_AT[0] <= SCHEME_RANGE[1] and FIG6_LEVELS_AT[1] >= SCHEME_RANGE[0] - 3
assert round(FIG6_GRADIENT_60, 2) == 0.05, 'the note rounds the measured gradient to 0.05 mol/s'
assert 8.3 < FIG6_PLATEAU < 8.5

# ---- the topics join the tree, and no name carries a comma ---------------------------------------
TREE = json.loads((pathlib.Path(__file__).parent.parent / 'data' / 'topics.json').read_text())
LABELS = {r['label'].lower() for r in TREE}
LABELS |= {a.strip().lower() for r in TREE for a in r['aliases'].split(',') if a.strip()}
for names in [r[4] for r in Q] + [s[1] for s in STEMS]:
    for t in names.split(','):
        t = t.strip()
        assert t, 'an empty topic'
        assert '&' not in t and ' and ' not in t.lower(), \
            'check-library.js folds & onto and; keep the tree\'s own spelling: %r' % t
        assert t.lower() in LABELS, 'topic %r is in no branch of data/topics.json' % t

# ---- the cover names the day as well as the date -------------------------------------------------
d = datetime.date.fromisoformat(BASE['exam_date'])
assert d.strftime('%A') == 'Tuesday', 'the cover says Tuesday 11 June 2024'
assert d.year == 2024 and d.month == 6

# ---- build ---------------------------------------------------------------------------------------
rows = []
for q, topics, figure, diagram, html in STEMS:
    r = dict(BASE)
    r.update(row_id='S-AQA-8464C-2406-2H-%02d' % int(q), kind='preamble', question=q, part='',
             section='', html=html, topics=topics, figure=figure, diagram=diagram,
             diagram_by=('family' if diagram else ''), placeholder='')
    rows.append(r)
for q, part, marks, atype, topics, figure, diagram, html, answer, note in Q:
    r = dict(BASE)
    r.update(row_id='Q-AQA-8464C-2406-2H-%02d%s' % (int(q), part), kind='question',
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
print('figures described and not drawn: %d question rows carry `figure`; Figure 2 carries none, '
      'because a displayed formula written out in full is not outstanding work'
      % sum(1 for r in Q if r[5]))
