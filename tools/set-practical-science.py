#!/usr/bin/env python3
# ==================================================================================================
# @family. — set-practical-science.py
#
# THE GUIDE OPENED ON EIGHT EMPTY BOXES AND NO EXPLANATION, ON 41 OF THE 57 PRACTICALS.
#
# `practicalGuide_` DREW "What is going on" from `science`, and draws "Things you could change" /
# "Things you could measure" from `variables` and `log`. The first of those went with the cut to
# five things; the other two are the worksheet's own scaffolding and are why that section works.
#
# Those three columns existed on the eleven home practicals and on nothing else — so every AQA
# required practical and every fun one handed a student the kit, the method, and then asked them to
# name an independent variable with nothing on the card suggesting one. Measured before this ran:
# 57 guides, 11 with a "What is going on".
#
# WRITTEN FROM EACH ROW'S OWN AIM, OUTCOME, STEPS AND `maths_link`, never from the title. That is
# the rule the whole library runs on: a practical called "Osmosis" could be any of four experiments,
# and the one in this file is potato cylinders in sugar solution with a percentage-change graph —
# which is what the science paragraph has to explain, because it is what the student will do.
#
# THE SCIENCE IS THE MECHANISM, NOT THE ANSWER. A paragraph that says "the rate rises with
# concentration" tells somebody the result of the experiment they have not run yet. What is here
# says WHY — more particles in the same volume, so more frequent collisions — which is the half a
# student cannot get from watching, and is the half that is the same before and after.
#
# `variables` AND `log` ARE CANDIDATES, NOT INSTRUCTIONS. The guide asks the student to name the
# independent variable; a list of things that could be changed is the prompt for that question and
# not an answer to it. Four each, so the choice is real.
#
# A PIPE, NOT A COMMA. `asList_` splits `topics` on commas and these columns on pipes, for the
# reason recorded in CLAUDE.md: 14 of the 410 equipment cells carry a comma inside one item.
# Asserted below rather than remembered.
# ==================================================================================================
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, 'data', 'practicals.json')

# ---- the content -------------------------------------------------------------------------------
# science | variables (things you could change) | log (things you could measure)
W = {}

W['PR-PH01'] = (
 "Energy going into the block does not vanish: it raises the average kinetic energy of the "
 "particles, which is what a thermometer reads as temperature. E = mcΔθ says how much, "
 "and c is the energy needed to raise one kilogram of the material by one degree — a property "
 "of the material, not of this block. Plot temperature against energy supplied and the gradient is "
 "1/(mc), so a steep line means a material that heats easily. Two things about the shape are worth "
 "noticing: the line bends at the start, because the heater warms itself before it warms the block, "
 "and the temperature keeps climbing after switch-off, because energy is still travelling inwards "
 "from the heater.",
 "The material of the block — aluminium against copper against steel|The mass of the block|"
 "The power of the heater|How well the block is insulated",
 "Temperature every minute|Energy supplied, off the joulemeter or from power × time|"
 "The mass of the block, in kg|How far the temperature rises after the heater goes off")

W['PR-PH02'] = (
 "Hot water loses energy three ways at once: conduction through the beaker wall, convection in the "
 "air around it, and radiation from its surface. An insulator works mostly by trapping air — "
 "air is a poor conductor, and air that cannot move cannot convect — so what makes a good "
 "insulator is usually the pockets inside it rather than the material itself. That is why two thin "
 "layers often beat one thick one, and why the lid matters: the quickest route out of an open "
 "beaker is evaporation and convection off the top.",
 "The material — bubble wrap, newspaper, felt, cotton wool|The number of layers|"
 "Whether the lid is on|The starting temperature of the water",
 "Temperature every minute for ten minutes|The total drop over the ten minutes|"
 "The time taken to fall by a fixed amount, say 10 °C|The shape of the cooling curve, not just its ends")

W['PR-PH03'] = (
 "A current is electrons drifting through a lattice of metal ions, and every collision with an ion "
 "transfers energy and slows them. A longer wire means more collisions, so doubling the length "
 "doubles the resistance — which is why the graph is a straight line through the origin rather "
 "than any other straight line. A thicker wire gives the electrons more routes side by side, so "
 "resistance falls as the cross-sectional area rises. Both are gathered into the resistivity in "
 "R = ρL/A. Keep the current small and open the switch between readings: a warm wire has a "
 "higher resistance, and that would bend the line.",
 "The length of the wire|Its thickness — the SWG number|"
 "The material — constantan against copper against nichrome|"
 "The current, and so how warm the wire is allowed to get",
 "The potential difference across the wire|The current through it|R = V/I at each length|"
 "The gradient of resistance against length")

W['PR-PH04'] = (
 "A fixed resistor held at one temperature obeys Ohm's law, so the current is proportional to the "
 "potential difference and the graph is a straight line through the origin. A filament lamp does "
 "not: the current heats the filament, a hotter filament resists more, so the line flattens as the "
 "voltage rises — the curve is the resistance changing underneath you. A diode conducts one "
 "way: almost nothing flows below about 0.7 V, then the current climbs steeply, and in reverse it "
 "stays near zero. The gradient of an I–V graph is 1/R, so a curve that flattens is a "
 "resistance that is rising.",
 "The component — resistor, filament lamp, diode|The potential difference, set by the variable "
 "resistor|Which way round the supply is connected|Whether the lamp is given time to cool between readings",
 "The current at each setting|The potential difference at each setting|"
 "The gradient, and so the resistance, at several points along each curve|"
 "The voltage at which the diode starts to conduct")

W['PR-PH05'] = (
 "Density is how much mass is packed into a given volume, ρ = m/V, and it belongs to the "
 "material rather than to the lump: half a brick has half the mass and half the volume and exactly "
 "the same density. Volume is the awkward half. A cuboid can be measured and multiplied out; "
 "anything irregular has to be found by displacement, because an object lowered into a full "
 "container pushes aside precisely its own volume of water. A liquid cannot be weighed without "
 "something to hold it, so its mass is found by difference. 1 g/cm³ is 1000 kg/m³, and "
 "that conversion is where most of the marks go.",
 "The material of the sample|Whether the shape is regular or irregular|"
 "The method used for the volume — calculated, or by displacement|"
 "The size of the sample, which should not change the answer at all",
 "The mass of each sample|The volume, by measurement and by displacement|ρ = m/V for each|"
 "The percentage difference from the published density")

W['PR-PH06'] = (
 "A spring stretches because the forces between its atoms resist being pulled apart, and for small "
 "extensions that resistance is proportional to how far you have pulled: F = ke, with k the spring "
 "constant in newtons per metre. A stiff spring has a large k and therefore a shallow line on an "
 "extension-against-force graph. Past the limit of proportionality the line bends, because the "
 "coils start to straighten out rather than the whole spring flexing; past the elastic limit the "
 "spring does not come back to its original length at all. Extension is the CHANGE in length, never "
 "the length itself — which is the commonest lost mark on this practical.",
 "The force added, in 100 g steps|The spring itself — a stiff one against a soft one|"
 "Two springs end to end, or two side by side|How far past the straight part you are willing to go",
 "The length of the spring at each load|The extension, as length minus original length|"
 "The gradient of force against extension, which is k|"
 "The load at which the line stops being straight")

W['PR-PH07'] = (
 "F = ma says the acceleration is set by the resultant force and by the mass being accelerated. "
 "Hold the mass constant and double the force and the acceleration doubles — a straight line "
 "through the origin. Hold the force constant and double the mass and the acceleration halves, "
 "which is a curve against m and a straight line against 1/m. The mass being accelerated is the "
 "trolley AND the hanging masses together, which is why they are moved from one to the other rather "
 "than added: adding them would change the force and the mass in the same breath. Tilting the "
 "runway cancels friction, so the string tension is the only resultant force left.",
 "The accelerating force — how many masses hang on the end|"
 "The total mass being accelerated|The tilt of the runway, and so how much friction is cancelled|"
 "The surface of the runway",
 "The acceleration from the light gates|The velocity at each gate|"
 "The accelerating force in newtons|a against F, and a against 1/m")

W['PR-PH08'] = (
 "A wave carries energy without carrying matter: the water in the ripple tank bobs up and down and "
 "stays where it is. The frequency is how many wavefronts pass a point each second and is set by "
 "the dipper; the wavelength is the distance between two crests and is set by the frequency and the "
 "medium together. v = fλ ties the three, and the speed belongs to the MEDIUM — change "
 "the depth of the water and the speed changes, so the wavelength changes while the frequency stays "
 "wherever the generator put it. On a string the wave reflects off both ends and interferes with "
 "itself, which is why only certain frequencies give a clear standing wave and why the wavelength "
 "is twice the distance between adjacent nodes.",
 "The frequency set on the generator|The depth of the water in the tank|"
 "On the string: the tension, from the hanging masses|On the string: the length between the fixed points",
 "The length of ten wavelengths, divided by ten|The frequency off the generator|"
 "v = fλ at each setting|The distance between adjacent nodes on the string")

W['PR-PH09'] = (
 "Light travels in straight lines through a uniform medium and changes direction at a boundary. At "
 "a mirror it reflects, angle of incidence equal to angle of reflection — both measured from "
 "the normal, the line at 90° to the surface, and never from the surface itself. At glass it "
 "refracts, because light travels more slowly in glass: going in, the ray bends towards the normal; "
 "coming out, it bends away by the same amount, so a rectangular block shifts a ray sideways "
 "without changing the direction it ends up travelling. Past a critical angle nothing leaves at "
 "all and the light is totally internally reflected, which is how a fibre-optic cable works.",
 "The angle of incidence, in ten-degree steps|The material of the block — glass against perspex|"
 "The shape of the block — rectangular, semicircular, triangular|The colour of the light",
 "The angle of incidence, from the normal|The angle of reflection|The angle of refraction|"
 "The ratio sin i / sin r, which should come out the same every time")

W['PR-PH10'] = (
 "Every object above absolute zero emits infrared, and how much depends on its temperature and on "
 "its surface. Matt black is the best emitter and the best absorber; shiny silver is the worst at "
 "both. Colour and texture are doing separate jobs — matt black and shiny black differ, so it "
 "is not only the colour — and the same surface that emits well absorbs well, which is why "
 "the two halves of this practical give the same ranking. Distance matters because radiation "
 "spreads out, so the cube is moved rather than the detector: otherwise the surface is not the only "
 "thing that changed.",
 "The surface — matt black, shiny black, matt white, shiny silver|"
 "The temperature of the water in the cube|The distance from the face to the detector|"
 "How long the cube is left to settle before the first reading",
 "The detector reading for each face|The mean of three repeats per face|"
 "The water temperature at the start and at the end|The reading against distance, for one face")

W['PR-CH01'] = (
 "An acid and an insoluble base give a salt and water: CuO + H₂SO₄ → CuSO₄ + "
 "H₂O. Adding the base in excess is the trick of it — once no more will dissolve, every "
 "bit of acid has reacted, so what is left in solution is the salt and nothing else, and the filter "
 "takes the leftover base away. Crystals form because the solution becomes saturated as water "
 "evaporates, and the slower they are left to grow the larger and better formed they are, since the "
 "ions have time to find their places in the lattice. Heating to dryness drives off the water of "
 "crystallisation and leaves a white powder where the blue crystals should be.",
 "The acid and base pair, and so which salt you are making|How much excess base is added|"
 "How far the solution is evaporated before it is left|How slowly the crystals are left to grow",
 "The mass of copper oxide that dissolves|The mass of dry crystals at the end|"
 "The percentage yield against the theoretical mass|The size and shape of the crystals")

W['PR-CH02'] = (
 "Neutralisation is H⁺ + OH⁻ → H₂O, and the endpoint is the moment the last of "
 "the alkali is used up. The indicator changes there because the pH swings sharply across the "
 "endpoint: a fraction of a drop takes the mixture through several pH units, which is the whole "
 "reason the last of the acid goes in dropwise. Titres within 0.10 cm³ of each other are what "
 "shows the reading is repeatable, and only those are meaned — a rough titre is a different "
 "measurement and averaging it in would drag the answer. n = cV then gives the moles of acid, and "
 "the balanced equation gives the moles of alkali from that.",
 "The concentration of the acid|The indicator — phenolphthalein against methyl orange|"
 "The volume of alkali pipetted|The acid and alkali pair, and so the ratio in the equation",
 "The initial and final burette readings, to 0.05 cm³|The titre for each run|"
 "The mean of the concordant titres only|The concentration worked out from n = cV")

W['PR-CH03'] = (
 "A current splits an ionic compound into its elements. Positive ions travel to the negative "
 "cathode and gain electrons; negative ions travel to the positive anode and lose them. Which "
 "product actually appears is a competition. At the cathode the metal is deposited if it is less "
 "reactive than hydrogen, and hydrogen comes off if it is not; at the anode a halogen is released "
 "if one is there, and oxygen from the water if not. That is why copper sulfate gives copper and "
 "oxygen while sodium chloride gives hydrogen and chlorine — the water is a reactant here, "
 "not just something the salt is dissolved in.",
 "The solution — copper sulfate, sodium chloride, copper chloride|"
 "The concentration of the solution|The voltage applied|The electrode material — graphite against copper",
 "What appears at each electrode|The gas test result at each electrode|"
 "The mass of the cathode before and after|How the mass gained changes with time")

W['PR-CH04'] = (
 "Neutralisation is exothermic: making the O–H bonds in water releases more energy than it "
 "takes to break the bonds in the acid and the alkali, and the difference warms the mixture. Each "
 "5 cm³ of alkali neutralises a little more acid and releases a little more energy, so the "
 "temperature climbs — until the acid runs out. After that the alkali going in is cold liquid "
 "diluting a warm mixture, so the temperature falls again. The peak is therefore the neutralisation "
 "point, and it is read off where the two straight parts of the graph would meet rather than off "
 "the highest dot, which is as likely to be a stray reading as the true maximum.",
 "The volume of alkali added, in 5 cm³ steps|The concentration of the acid or the alkali|"
 "The acid used — hydrochloric against sulfuric|How well the cup is insulated",
 "The highest temperature after each addition|Temperature against volume added|"
 "The peak, read off where the two lines cross|The temperature rise from start to peak")

W['PR-CH05'] = (
 "A reaction happens when particles collide hard enough and the right way round. A more "
 "concentrated solution has more particles in the same volume, so collisions are more frequent and "
 "the rate goes up. Thiosulfate and acid give sulfur, which clouds the mixture, so the time for the "
 "cross to disappear measures the rate — and because a slow reaction takes LONGER, the rate is "
 "1/time rather than time. The total volume is kept the same by swapping solution for water: "
 "diluting by adding extra liquid would change the depth the light has to travel through as well, "
 "which would alter the result for a reason that has nothing to do with rate.",
 "The concentration of the thiosulfate|The temperature of the mixture|The concentration of the acid|"
 "Surface area, or a catalyst, in the marble-chip version of this",
 "The time for the cross to disappear|1/time, as a measure of rate|"
 "The volume of gas given off every ten seconds, for the other method|"
 "The mass lost from the flask over time")

W['PR-CH06'] = (
 "Chromatography separates a mixture by giving each component a choice between two phases: the "
 "solvent moving up the paper, and the paper itself. A dye that dissolves well and clings to the "
 "paper weakly travels a long way; one that clings tightly hardly moves. Rf is the ratio of how far "
 "the spot went to how far the solvent went, so it always comes out between 0 and 1, and it is the "
 "same for a given dye and solvent whatever size the paper is — which is what makes it worth "
 "quoting at all. The line is pencil because ink would run with everything else, and the paper must "
 "not dip below it, or the spots dissolve straight into the water.",
 "The solvent — water, ethanol, or a mixture|The ink or food colouring tested|"
 "The type of paper|How long the paper is left before the front reaches the top",
 "The distance each spot travels|The distance the solvent front travels|The Rf value for each spot|"
 "The number of separate dyes in each ink")

W['PR-CH07'] = (
 "A flame test works because the heat lifts an atom's outer electrons to a higher level; they fall "
 "back and give out the difference as light, and the size of that gap is fixed for each metal, so "
 "the colour names it. The hydroxide tests work on a different principle: sodium hydroxide makes "
 "insoluble metal hydroxides whose colours differ — copper blue, iron(II) green, iron(III) "
 "brown. Aluminium's white precipitate redissolves in excess where calcium's and magnesium's do "
 "not, and that is how those three are told apart. The loop is cleaned between samples because a "
 "trace of sodium gives a yellow bright enough to hide everything else.",
 "The unknown sample being tested|The test used — flame, hydroxide, carbonate, halide, sulfate|"
 "Whether the sodium hydroxide is added dropwise or in excess|"
 "How clean the loop is, which is a control rather than a choice",
 "The flame colour for each sample|The precipitate colour with sodium hydroxide|"
 "Whether that precipitate redissolves in excess|The gas test result for the carbonates")

W['PR-CH08'] = (
 "Fresh water from any source is not pure: it carries dissolved salts, and the mass left behind "
 "after evaporation says how much. The pH says whether it is acidic — rainwater usually is, "
 "slightly, from dissolved carbon dioxide. Distillation separates by boiling point: the water "
 "boils off, travels through the condenser, cools back to a liquid and leaves everything with a "
 "higher boiling point behind, which is why the distillate leaves no residue when it is evaporated "
 "in turn. The thermometer bulb sits level with the side arm because what it has to measure is the "
 "vapour going over, not the liquid in the flask.",
 "The water sample — tap, rain, sea, pond|The volume evaporated|"
 "Whether the sample is distilled once or twice|The source the sample is taken from",
 "The pH of each sample|The mass of the basin empty, and with the residue|"
 "The mass of dissolved solids, by difference|The concentration in grams per dm³")

W['PR-BI01'] = (
 "A light microscope uses two lenses: the objective makes a magnified real image and the eyepiece "
 "magnifies that again, so the total magnification is the two multiplied together. What limits it "
 "is not magnification but RESOLUTION — how close two things can be and still look like two "
 "— and for light that is about 200 nm, set by the wavelength, which is why an electron "
 "microscope is needed for anything smaller than an organelle. Iodine stains the starch and the "
 "cell wall so the outlines show; unstained, an onion cell is nearly transparent. Real size = image "
 "size ÷ magnification, and almost every mark lost here is a unit: 1 mm is 1000 μm.",
 "The specimen — onion, cheek cell, leaf|The objective lens used|"
 "The stain — iodine, methylene blue, none|How thin the section is",
 "The magnification of each lens combination|The size of the drawn image|"
 "The real size of a cell, from image size ÷ magnification|"
 "How many cells fit across the field of view")

W['PR-BI02'] = (
 "Bacteria grow outwards from wherever they were spread, and an antiseptic that reaches them stops "
 "them dividing — so a clear ring appears round the disc where nothing has grown. How big that "
 "ring is depends on how effective the antiseptic is and on how far it diffuses through the agar. "
 "Area is the fair comparison rather than diameter, because doubling the diameter quadruples the "
 "area, and a ranking by diameter understates the difference. The water disc is the control: "
 "without it a clear zone could be the paper blocking growth rather than what is on it. The lid is "
 "taped in two places so air can reach the plate, and it is incubated at 25 °C rather than "
 "body temperature, both to keep human pathogens from growing.",
 "The antiseptic or antibiotic on the disc|Its concentration|The species of bacteria|"
 "The incubation temperature and time",
 "The diameter of each clear zone|The area of each zone, πr²|"
 "The zone round the water control, which should be nothing|"
 "The ranking of the antiseptics by area")

W['PR-BI03'] = (
 "Osmosis is water moving through a partially permeable membrane from where water is more "
 "concentrated to where it is less. A potato cylinder in pure water takes water in and gains mass; "
 "in strong sugar solution it loses both. Somewhere between, the solution matches the cell sap and "
 "nothing moves either way — that is where the line crosses zero, and finding it is the reason "
 "the graph is worth plotting instead of just listing the masses. Percentage change is used rather "
 "than raw change because the cylinders do not start at identical masses, and 0.2 g means something "
 "different on a 2 g cylinder than on a 4 g one.",
 "The concentration of the sugar solution|The tissue — potato, sweet potato, beetroot|"
 "The time left in the solution|The surface area of the cylinder",
 "The mass before and after|The percentage change in mass|"
 "The concentration at which the line crosses zero|How firm each cylinder feels at the end")

W['PR-BI04'] = (
 "Each reagent reacts with one class of molecule and reports it as a colour. Iodine goes blue-black "
 "with starch because the iodine sits inside the coiled starch chain. Benedict's needs heat and "
 "goes brick red with reducing sugars, as copper(II) is reduced to copper(I) oxide. Biuret goes "
 "purple with the peptide bonds in protein — so it is testing for the bond rather than for any "
 "particular protein. The ethanol emulsion test works because lipids dissolve in ethanol and not in "
 "water, so tipping the ethanol into water throws them out of solution as a cloud of droplets. All "
 "four are QUALITATIVE: they say whether, not how much.",
 "The food being tested|The concentration of the food solution|"
 "Whether the sample is ground and filtered first|The time in the water bath, for Benedict's",
 "The starting colour of each test|The finishing colour of each test|"
 "Which food groups each food turns out to contain|"
 "How strong the Benedict's colour is, as a rough guide to how much sugar")

W['PR-BI05'] = (
 "Amylase breaks starch down into maltose, and it does it at an active site shaped to fit the "
 "starch. pH changes the charges on the amino acids that hold that shape, so too far either side of "
 "the optimum and the active site no longer fits — the enzyme is denatured, and that change "
 "does not reverse when the pH is put back. Iodine is the reporter: while starch is there the drop "
 "goes blue-black, and the moment it stays orange the starch has gone. A faster reaction takes less "
 "time, so the rate is 1000/time, and plotting that against pH gives a curve with a clear peak "
 "rather than a trough.",
 "The pH of the buffer|The temperature of the mixture|The concentration of the amylase|"
 "The concentration of the starch",
 "The time until the iodine stops going blue-black|The rate, as 1000/time|"
 "The pH at which the rate peaks|How wide the range of pH it works over is")

W['PR-BI06'] = (
 "Photosynthesis uses light energy to turn carbon dioxide and water into glucose and oxygen, and "
 "the bubbles are that oxygen. More light means more energy arriving, so the rate rises — "
 "until something else runs short and the graph levels off, at which point carbon dioxide or "
 "temperature has become the limiting factor. Light from a lamp spreads out over the surface of a "
 "sphere, so its intensity falls with the square of the distance; plotting rate against 1/d² "
 "straightens the curve and shows the proportionality directly. The beaker of water in the way "
 "absorbs infrared, so moving the lamp changes the light without changing the temperature.",
 "The distance from the lamp|The concentration of hydrogencarbonate solution, and so the carbon "
 "dioxide|The temperature of the water|The colour of the light",
 "Bubbles per minute, meaned over three counts|The volume of gas collected in a fixed time|"
 "Rate against distance, and rate against 1/d²|The distance at which the graph levels off")

W['PR-BI07'] = (
 "A reflex misses the brain out, but catching a ruler does not: light reaches the eye, a signal "
 "goes to the brain, the brain decides, and a signal travels down the arm — so what is being "
 "measured is the whole loop, which is why it comes out in hundreds of milliseconds rather than the "
 "few a spinal reflex takes. The ruler is the clock: a dropped object falls d = ½gt², so "
 "the distance it fell before you caught it converts to a time, t = √(2d/g). The first "
 "attempts are thrown away because people get noticeably better within a few goes, and that "
 "improvement would otherwise look like an effect of whatever you changed.",
 "Which hand is used — dominant or not|A distraction, such as music or being talked to|"
 "Time of day, tiredness, or caffeine|Whether the person can see the drop coming",
 "The distance caught, for each of ten drops|The time from t = √(2d/g)|"
 "The mean time, with any obvious anomaly noted rather than quietly dropped|"
 "The mean before and after the factor is changed")

W['PR-BI08'] = (
 "A shoot bends towards light because auxin, a plant hormone, collects on the shaded side and makes "
 "those cells elongate more, so that side grows longer and the shoot leans over. That is "
 "phototropism, and in a shoot it is positive. In a root the same hormone has the opposite effect "
 "— it slows growth where it collects — so a root turns downwards whichever way round the "
 "seed happens to land: positive gravitropism. Which is why a dish turned on its side still sends "
 "roots down and shoots up, and why the dark dish matters: it separates bending from simply growing.",
 "The direction the light comes from|Whether there is any light at all|"
 "The orientation of the dish, for the gravity version|The colour of the light",
 "The height of the seedlings each day|The angle they bend through|"
 "The direction the roots grow, against the direction of the dish|"
 "The proportion of seeds that germinate at all")

W['PR-BI09'] = (
 "You cannot count every daisy in a field, so you count a known fraction and scale it up: the mean "
 "per quadrat, times the number of quadrat-sized pieces in the whole area. That only works if the "
 "quadrats go down at random, because a person choosing where to put one will choose somewhere "
 "interesting and the estimate will come out high. A transect answers a different question "
 "altogether — not how many, but how the number changes along a gradient, shade to sun or path "
 "to hedge — so there the quadrats are deliberately placed at fixed intervals rather than at "
 "random, and random placing would destroy the very thing being looked for.",
 "The number of quadrats|The size of the quadrat|"
 "The area sampled — shaded against open|The interval between quadrats along the transect",
 "The count in each quadrat|The mean per quadrat|The population estimate for the whole area|"
 "Abundance against distance along the transect")

W['PR-BI10'] = (
 "Lipase breaks the fat in milk down into fatty acids and glycerol. The fatty acids make the "
 "mixture acidic, and phenolphthalein is pink in alkali and colourless in acid — so the moment "
 "the pink goes is the moment enough acid has been made. It is a clock for the reaction rather than "
 "a measure of how much fat is left. Warming speeds it up, because the molecules collide more often "
 "and harder, until about 40 °C; past that the lipase denatures and the rate falls away. That "
 "is why the graph peaks instead of climbing, and why it is not symmetrical: denaturing is "
 "permanent where a collision rate is not.",
 "The temperature of the water bath|The concentration of the lipase|"
 "The milk — full fat, semi-skimmed, skimmed|The pH of the starting mixture",
 "The time for the pink colour to go|The rate, as 1000/time|"
 "The temperature at which the rate peaks|How sharply the rate falls past that optimum")

W['PR-FN01'] = (
 "The horizon is the place where your line of sight just grazes the curve of the Earth — so "
 "that line is a tangent, and a tangent meets the radius at 90°. Pythagoras on that "
 "right-angled triangle gives (R + h)² = R² + d², and expanding leaves "
 "2Rh + h² = d². For any building h² is tiny against 2Rh, so it is dropped and "
 "R = d²/2h. The whole method depends on the Earth being curved: on a flat one the horizon "
 "would be infinitely far away whatever your height, which is what makes this worth measuring "
 "rather than reading.",
 "The height of the viewpoint|The landmark taken as the horizon|"
 "The weather, and so how far you can actually see|Whether refraction in the air is allowed for",
 "The height of the viewpoint, in metres|The straight-line distance to the furthest landmark|"
 "R, from R = d²/2h|The percentage error against 6371 km")

W['PR-FN02'] = (
 "Sunlight reaches the Earth in rays that are effectively parallel, because the sun is so far away. "
 "Two places at different latitudes therefore cast shadows at different angles at the same moment, "
 "and the difference between those two angles is exactly the angle between the two places as seen "
 "from the centre of the Earth — which is angles in parallel lines, and nothing more. So the "
 "difference in angle is the same fraction of 360° as the distance between the places is of "
 "the whole circumference. Eratosthenes did this around 240 BC with a well and a stick and came "
 "within a few per cent.",
 "The latitude of the second place|The date, which changes how high the sun gets|"
 "The height of the stick|How carefully solar noon is found",
 "The height of the stick|The shortest shadow length|The angle, from inverse tan|"
 "The circumference from the ratio, and its error against 40 000 km")

W['PR-FN03'] = (
 "The tangent ratio relates an angle in a right-angled triangle to the two sides beside the right "
 "angle: tan θ = opposite ÷ adjacent. Sighting the top of a tree makes that triangle in "
 "the air — the horizontal distance is the adjacent side and the height above your eye is the "
 "opposite — which is why eye height has to be added back at the end: the triangle starts at "
 "your eye and not at the ground. Measuring again from a second distance is not repetition but a "
 "check, because the two answers only agree if both distances and both angles were measured "
 "honestly.",
 "The distance you stand from the base|The object being measured|Whose eye height is used|"
 "Whether the ground between you and the base is level",
 "The angle of elevation|The horizontal distance|Your eye height|"
 "The height from each position, and how far the two disagree")

W['PR-FN04'] = (
 "A microwave oven does not heat evenly. The waves reflect off the metal walls and interfere with "
 "themselves, making a standing wave with fixed hot spots where the wave is strongest and cold "
 "spots where it cancels; the turntable exists to carry food through them. Take it out and the hot "
 "spots stay put and melt the chocolate in a pattern. Adjacent melted patches are HALF a wavelength "
 "apart, because a standing wave has two antinodes to a wavelength. With the frequency printed on "
 "the back of the oven, c = fλ, and the answer lands near 3 × 10⁸ m/s.",
 "The food used — chocolate, marshmallows, a tray of grated cheese|The heating time|"
 "The oven, since frequencies differ slightly between them|Where the plate sits inside the oven",
 "The distance between the centres of adjacent melted patches|The wavelength, twice that distance|"
 "The frequency off the back of the oven|c = fλ, and its percentage error")

W['PR-FN05'] = (
 "Drop a needle whose length equals the line spacing and the chance it crosses a line works out at "
 "2/π. It falls out of two things being random and independent: where the centre of the needle "
 "lands between the lines, and what angle it happens to lie at. Integrating over both gives 2/π, "
 "so counting crossings and rearranging estimates π. The estimate wanders a long way early on "
 "and settles slowly — the error falls roughly as 1/√N, so a hundred times as many drops "
 "buys only ten times the accuracy, which is the real lesson here about experimental probability.",
 "The number of drops|The length of the sticks against the line spacing|"
 "Who is dropping, and from what height|Whether results are pooled across everybody",
 "The total dropped, N|The number crossing a line, C|2N/C after 50, 100 and 500 drops|"
 "The error against 3.14159 at each stage")

W['PR-FN06'] = (
 "A quarter circle of radius r has area πr²/4, and the square around it has area "
 "r² — so the ratio of the two is π/4. Scatter grains at random over the square and "
 "the fraction landing inside the arc estimates that ratio, which gives π ≈ 4 × "
 "inside ÷ total. It only works if the scattering really is even: pour from one spot and the "
 "grains pile up there, and the answer is about where you poured rather than about the two areas. "
 "Like Buffon's needle the accuracy improves as 1/√N, which makes it a good way of seeing how "
 "slowly random methods converge.",
 "The number of grains|How evenly they are scattered|The size of the square|"
 "Whether grains sitting on the line are counted in or out",
 "The number of grains inside the arc|The total on the card|4 × inside ÷ total|"
 "How the estimate moves as more grains are added")

W['PR-FN07'] = (
 "Every circle has the same ratio of circumference to diameter, whatever its size — that ratio "
 "is π, and the fact that it is constant is the whole point. Plot C against d for ten "
 "different objects and the points lie on a straight line through the origin, because C = πd "
 "is a direct proportion; the gradient is π. Dividing C by d for each object gets the same "
 "number a different way, and the two agreeing is what shows the measuring was honest: a line of "
 "best fit forgives one bad point, and a column of ratios does not.",
 "The objects measured, and how wide a range of sizes they cover|"
 "How the circumference is measured — string, tape, or rolling|"
 "How carefully the widest point is found|The number of objects",
 "The circumference of each object|The diameter of each object|C ÷ d for each one|"
 "The gradient of the line of best fit")

W['PR-FN08'] = (
 "Your first pick has a 1 in 3 chance of being right, so the other two cups hold 2 in 3 between "
 "them. The host then lifts one of those two — and crucially he knows where the counter is and "
 "always lifts an empty one, so he has not shown you a random cup. The two thirds does not spread "
 "back over all three; it collects on the single unlifted cup you did not pick. So switching wins "
 "two thirds of the time and sticking wins one third. Intuition insists it must be even because two "
 "cups are left, and running it a hundred times is the answer to that.",
 "Whether the player sticks or switches|The number of trials|"
 "The number of cups — try it with ten|"
 "Whether the host knows where the counter is, which is the assumption the whole thing rests on",
 "Wins and losses when sticking|Wins and losses when switching|The win rate for each, as a fraction|"
 "How close each is to 1/3 and 2/3 after 50, after 100, after 10 000")

W['PR-FN09'] = (
 "A trundle wheel counts revolutions and one click is one circumference, usually exactly a metre "
 "— which is why the wheel is about 318 mm across, since C = πd. Perimeter is the "
 "distance round the edge and area is what is enclosed, and the two are not tied together: two "
 "shapes with the same perimeter can have very different areas, which is exactly why the area has "
 "to be built up out of rectangles and triangles rather than guessed at from the walk. Every "
 "measurement carries an error and the errors add along the way, so the total perimeter is less "
 "precise than any single section of it.",
 "Where exactly the boundary is taken to be|How the park is cut into shapes for the area|"
 "Who walks it, and how straight they walk|"
 "Whether curved edges are walked or approximated by straight sections",
 "The length of each straight section|The total perimeter|"
 "The area of each rectangle and triangle|The total area, against a satellite measurement")

W['PR-FN10'] = (
 "Flow rate is volume per second, and it is the cross-sectional area of the river multiplied by how "
 "fast the water is moving: Q = Av. The units carry the argument — m² × m/s is "
 "m³/s. A float only measures the surface, and water at the surface moves faster than water "
 "dragging along the bed, so the true mean velocity is around 85 per cent of the float speed; "
 "ignore that and the answer comes out high. The depth varies across the channel too, so several "
 "readings are meaned rather than one taken in the middle.",
 "Where on the river the measurement is taken|The length of the timed stretch|"
 "The number of depth readings taken across the channel|"
 "Whether the surface-speed correction is applied",
 "The time for the float over 10 m, five times|The mean velocity|"
 "The width, and the depths across the channel|"
 "The flow rate in m³/s, against the published figure")

W['PR-FN11'] = (
 "A triangle cannot change shape without one of its sides changing length, so a triangulated frame "
 "holds under load; a square can lean over into a parallelogram with every side exactly as long as "
 "it was, so it folds. That is why bridges and pylons are made of triangles. A tall tower fails "
 "more easily for a second reason as well: the taller it is, the further the top can sway before "
 "the load is no longer over the base, and a thin column under compression buckles long before the "
 "spaghetti itself would break. So height and strength pull against each other, which is what the "
 "graph is really showing.",
 "The height built|The shape of the frame — triangles against squares|"
 "How wide the base is|How the load is hung — from the very top, or spread lower",
 "The height of each tower|The mass it carried before it failed|"
 "Height against mass carried, across every team|Where each tower failed, and how")

W['PR-FN12'] = (
 "A falling object accelerates until air resistance has grown to equal its weight; the resultant "
 "force is then zero and it falls at a steady speed — terminal velocity. Air resistance "
 "depends on the speed and on the shape and area facing the air, and nesting cupcake cases changes "
 "the weight without changing either the shape or the area, which is exactly what makes them the "
 "right object for this: double the mass and the case has to be going faster before the drag "
 "catches up. A single case reaches its terminal velocity almost at once, which is why the fall "
 "time comes out nearly proportional to the drop height.",
 "The number of nested cases, and so the mass|The drop height|"
 "The shape — a case opened out against one left as it is|"
 "Whether the case is dropped or thrown down",
 "The time to fall, five times per mass|The mean time|"
 "The terminal velocity, as height ÷ mean time|Velocity against the number of cases")

W['PR-FN13'] = (
 "Liquids that do not mix settle with the densest at the bottom, because a denser liquid weighs "
 "more per unit volume and sinks through a lighter one. Density is mass ÷ volume, so weighing "
 "equal volumes ranks the liquids before anything is poured — the prediction is arithmetic "
 "rather than a guess. An object floats on any layer denser than itself and sinks through any layer "
 "less dense, so where it comes to rest brackets its density between two known values: an "
 "inequality rather than a single number, which is what bounds actually mean. Pouring down the side "
 "of the jar stops the layers mixing on the way in.",
 "The liquids used, and the order they go in|The volume of each layer|"
 "The objects dropped in|The temperature, which shifts every density a little",
 "The mass of 50 ml of each liquid|The density of each liquid|The order the layers settle in|"
 "Which layer each object rests in, and the bounds that puts on its density")

# ---- patch ---------------------------------------------------------------------------------------
lines = open(PATH, encoding='utf-8').read().rstrip('\n').split('\n')
assert lines[0].strip() == '[' and lines[-1].strip() == ']', 'file is not the one-object-per-line shape'

out = [lines[0]]
seen = set()
for raw in lines[1:-1]:
    s = raw.strip()
    trailing = ',' if s.endswith(',') else ''
    row = json.loads(s.rstrip(','))
    pid = row['practical_id']
    if pid in W:
        sci, var, log = W[pid]
        assert not row.get('science'), pid + ' already has a science'
        assert not row.get('excluded_reason'), pid + ' is a refused experiment'
        new = {}
        for k, v in row.items():
            new[k] = v
            if k == 'risks':
                new['science'] = sci
                new['log'] = log
                new['variables'] = var
        assert 'science' in new, pid + ' has no risks column to sit after'
        row = new
        seen.add(pid)
    # Rf, not R-with-a-hook. A florin is not a subscript f.
    for k, v in list(row.items()):
        if isinstance(v, str) and 'ƒ' in v:
            row[k] = v.replace('Rƒ', 'Rf').replace('ƒ', 'f')
    out.append(json.dumps(row, ensure_ascii=False) + trailing)
out.append(lines[-1])

missing = set(W) - seen
assert not missing, 'never found: ' + ', '.join(sorted(missing))

# ---- what has to be true before it is written ----------------------------------------------------
# A comma inside a topic name is a second topic — the fault CLAUDE.md records — and these three
# columns are pipe lists for the same reason. Asserted here rather than remembered.
for pid, (sci, var, log) in W.items():
    assert len(sci) > 400, pid + ': the science paragraph is too thin to explain anything'
    assert '|' not in sci, pid + ': the science is prose, not a list'
    for name, cell in (('variables', var), ('log', log)):
        items = [i.strip() for i in cell.split('|')]
        assert len(items) >= 3, pid + ': ' + name + ' offers fewer than three'
        assert all(items), pid + ': ' + name + ' has an empty item'
        assert all(len(i) > 5 for i in items), pid + ': ' + name + ' has a one-word item'

open(PATH, 'w', encoding='utf-8').write('\n'.join(out) + '\n')

rows = [json.loads(l.strip().rstrip(',')) for l in out[1:-1]]
live = [r for r in rows if not r.get('excluded_reason')]
print('rows            %d' % len(rows))
print('live            %d' % len(live))
print('with science    %d of %d live' % (sum(1 for r in live if r.get('science')), len(live)))
print('with variables  %d' % sum(1 for r in live if r.get('variables')))
print('with log        %d' % sum(1 for r in live if r.get('log')))
print('refused rows with science: %d (must be 0)'
      % sum(1 for r in rows if r.get('excluded_reason') and r.get('science')))
