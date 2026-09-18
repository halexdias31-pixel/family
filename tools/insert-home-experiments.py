#!/usr/bin/env python3
"""
==================================================================================================
@family. — insert-home-experiments.py

TEN EXPERIMENTS THAT RUN IN SOMEBODY'S FRONT ROOM, AND FIVE THAT WERE REFUSED.

WHY THEY ARE PRACTICALS AND NOT A NEW TABLE. `data/practicals.json` already holds 41 experiments
with a name, a subject, kit, steps, safety, a venue and a topic join — which is this list with
different values in it. CLAUDE.md settles the shape twice over: the `images` and `needs` notes
both say that a thing one column wider is not a second table, and the practicals' own note says
`subject` IS THE SCIENCE and `kind` is what it is. A home chemistry experiment IS chemistry and
IS a practical; a second kind beside it would put one door in the funnel marked Practicals and
another marked Experiments, and ask somebody to know the difference.

WHAT ACTUALLY DISTINGUISHES THEM IS `venue`, WHICH ALREADY EXISTS. The 41 are `lab`, `library
room` and `outdoors`. These are `home` and `outdoors`, and that is the fact a tutor needs: can I
do this in a client's front room.

THE FIVE REFUSALS ARE ROWS, NOT A DELETION, and that is the point of them. "Recorded so the
reasoning is not lost" was the instruction, and a tutor asking why they are not burning magnesium
ribbon has to be able to find the answer. `active` is NOT the column for it — CLAUDE.md records
that distinction on the posts tab: `active` is whether a thing has been deleted, `approved` is
whether it has been let through, and folding the two means undeleting and approving are one act.
So an excluded row is live, carries `excluded_reason`, and says so on its own card before it says
anything else.

WHAT IS DELIBERATELY NOT IN HERE. The source carried a learner profile — an age, a set of
interests, a first session date, and "confirm the student has a fish tank". THIS REPOSITORY IS
PUBLIC and git history is permanent, so none of that is committed. Where a learner-specific line
carried a reusable fact it is written as one: "matches the fish interest on file" becomes a
`feasible` of "needs a tank, a pond, or a window onto birds", which is true for anybody.

RUN IT:  python3 tools/insert-home-experiments.py
==================================================================================================
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRACTICALS = os.path.join(ROOT, 'data', 'practicals.json')
TOPICS = os.path.join(ROOT, 'data', 'topics.json')

PIPE = ' | '

# ---------- THE THREE COMPLIANCE WORDS ARE A CLOSED LIST AND NONE OF THESE NEEDS A FOURTH --------
# `check-practicals.js` holds the vocabulary and refuses anything else, which is the `VOCAB`
# argument: a new value has to be added by somebody who has just read what is already in use.
# "Not assessed — enrichment" is exactly what a home experiment is.
ENRICH = 'Not assessed — enrichment'


def row(**kw):
    """One practical, with the columns in the order the existing 41 carry them."""
    out = {
        'practical_id': kw['id'], 'name': kw['name'], 'subject': kw['subject'],
        'level': kw['level'], 'exam_board': kw.get('board', ''), 'spec_ref': kw.get('spec_ref', ''),
        'compliance': kw.get('compliance', ENRICH),
        'aim': kw['aim'], 'outcome': kw.get('outcome', ''),
        'venue': kw['venue'], 'feasible': kw['feasible'],
        'group_size': kw.get('group_size', 1), 'minutes': kw['minutes'],
        'safety': kw.get('safety', ''), 'maths_link': kw.get('maths_link', ''),
        'item_ids': '', 'notes': kw.get('notes', ''),
        'active': True, 'sort_order': kw['sort_order'], 'topics': kw['topics'],
        'equipment': PIPE.join(kw.get('equipment', [])),
        'steps': PIPE.join(kw.get('steps', [])),
        # ---------- THE NEW COLUMNS, AND WHY EACH ONE COULD NOT BE AN EXISTING ONE ---------------
        # `age_min`   the first question a tutor asks and nothing carried it
        # `hazard`    one word; `safety` is the paragraph, this is the triage
        # `wow`       what decides which experiment opens a session
        # `science`   the explanation. `aim` is one line and `outcome` is what you end up with;
        #             neither is the paragraph that teaches, which is the most valuable field here
        # `log`       what to write down, and `variables` what to change — these two ARE the
        #             "What I changed | What I measured" table the whole set is built around, and
        #             folding them into one column would lose which is which
        # `cost_*`    per run and one-off are different numbers and a tutor needs both
        # `excluded_*` see the header
        'age_min': kw.get('age_min', None),
        'hazard': kw.get('hazard', ''),
        'wow': kw.get('wow', ''),
        'science': kw.get('science', ''),
        'log': PIPE.join(kw.get('log', [])),
        'variables': PIPE.join(kw.get('variables', [])),
        'cost_per_run_gbp': kw.get('cost_per_run', None),
        'setup_cost_gbp': kw.get('setup_cost', None),
        'excluded_reason': kw.get('excluded_reason', ''),
        'reconsider_at_age': kw.get('reconsider_at_age', None),
    }
    return out


ROWS = []

# ============================================================================== 01
ROWS.append(row(
    id='PR-HM01', name="Elephant's toothpaste", subject='Chemistry', level='KS2–GCSE',
    aim='Show a catalyst turning a reaction that takes months into one that takes seconds.',
    outcome='A column of foam, a warm bottle, and a catalyst that is unchanged at the end.',
    venue='home', feasible='yes, with kit', minutes=15, sort_order=500,
    age_min=7, hazard='low', wow='high',
    topics='Rate of Reaction, Energy Changes',
    equipment=[
        'Hydrogen peroxide 6% (20 vol), 100 ml per run',
        'Dried yeast, one 7 g sachet per run',
        'Washing-up liquid, one good squeeze',
        'Food colouring',
        'Warm water, 3 tbsp',
        'Empty 500 ml plastic bottle with a narrow neck',
        'Washing-up bowl or deep tray',
        'Safety goggles and nitrile gloves',
    ],
    steps=[
        'Stand the bottle in the washing-up bowl.',
        'Pour in 100 ml of 6% hydrogen peroxide.',
        'Add a good squeeze of washing-up liquid.',
        'Drip food colouring down the inside of the neck so the foam comes out striped.',
        'In a separate cup stir one 7 g yeast sachet into 3 tbsp of warm water. Leave one minute.',
        'Pour the yeast mixture into the bottle and step back.',
    ],
    science=('Yeast contains catalase, an enzyme acting as a catalyst. Hydrogen peroxide breaks '
             'down into water and oxygen on its own, but over months. Catalase makes it happen in '
             'seconds and comes out unchanged, ready to do it again. The washing-up liquid traps '
             'the oxygen as foam. The reaction is exothermic, so the bottle warms.'),
    log=['Time from pour to peak foam', 'Foam height',
         'Bottle temperature before and after, by touch or thermometer',
         'Repeat with half the yeast and compare'],
    variables=['How much yeast — the amount of catalyst',
               'The temperature of the water used to wake the yeast',
               'Peroxide strength, 3% against 6%, if both are to hand'],
    safety=('6% peroxide irritates skin and eyes — the tutor handles the bottle, gloves on, '
            'goggles on both of you before the pour. What is left is soapy water and oxygen, so a '
            'cloth clears it. Never substitute a stronger peroxide: 12% and 40 vol are a different '
            'thing entirely.'),
    notes=('Run it once privately before the session to see how much foam this bottle gives. | '
           'This is the one to open with.'),
    cost_per_run=2.00, setup_cost=9.95,
))

# ============================================================================== 02
ROWS.append(row(
    id='PR-HM02', name='Red cabbage pH indicator', subject='Chemistry', level='KS2–GCSE',
    aim='Build a working pH indicator out of a vegetable and rank the kitchen with it.',
    outcome='A rack of tubes running red to green, ordered by pH, and a neutralisation to finish.',
    venue='home', feasible='yes, with kit', minutes=25, sort_order=510,
    age_min=7, hazard='very low', wow='medium-high',
    topics='Chemical Changes, Ordering Numbers & Decimals',
    equipment=[
        'Half a red cabbage',
        'Boiling water',
        'Sieve or colander',
        'Glass test tubes and a rack',
        'White vinegar',
        'Lemon juice',
        'Bicarbonate of soda',
        'Washing-up liquid',
        'Table salt, as the neutral control',
    ],
    steps=[
        'The night before: chop half a red cabbage, cover with boiling water, leave 15 minutes, '
        'strain. Keep the purple liquid in the fridge.',
        'Part-fill six to eight test tubes with the purple liquid.',
        'Add a different household substance to each — vinegar, lemon juice, bicarbonate '
        'solution, soapy water, salt water, and plain water as the control.',
        'Line the rack up left to right, most acidic to most alkaline.',
        'Then add vinegar to a tube already turned green by bicarbonate and watch it come back to '
        'purple. That is neutralisation happening in front of him.',
    ],
    science=('Red cabbage holds anthocyanin, a pigment that changes shape depending on how many '
             'hydrogen ions are around it. Red or pink in acid, purple at neutral, blue-green in '
             'alkali, yellow in strong alkali. That is exactly what universal indicator does, '
             'using a plant pigment instead of a synthetic dye. Roughly: pH 2–3 red, 4–5 '
             'pink, 6–7 purple, 8–9 blue, 10–12 green, above 12 yellow.'),
    log=['Substance, the colour it gave, and the pH you estimate from it',
         'The household substances ranked into one ordered scale'],
    variables=['Which substance', 'How much of it — concentration against strength'],
    safety=('Boiling water is the tutor’s job and nobody else’s. Kitchen substances '
            'only: no oven cleaner, no drain cleaner, no bleach.'),
    notes='Boil and strain the cabbage the night before — it is the one bit of prep that cannot be rushed.',
    cost_per_run=1.50, setup_cost=13.88,
))

# ============================================================================== 03
ROWS.append(row(
    id='PR-HM03', name='Electrolysis of water, and the squeaky pop', subject='Chemistry',
    level='GCSE',
    aim='Split water with a 9V battery, collect the hydrogen, and test it with a lit splint.',
    outcome='A sharp squeaky pop — the standard laboratory test for hydrogen, from a battery '
            'and two pencils.',
    venue='home', feasible='yes, with kit', minutes=30, sort_order=520,
    age_min=9, hazard='low', wow='high',
    topics='Chemical Changes, Chemical Analysis',
    equipment=[
        '9V battery',
        'Two pencils sharpened at BOTH ends, as graphite electrodes',
        'Glass or jar of warm water',
        'Bicarbonate of soda, one or two heaped teaspoons, as the electrolyte',
        'Glass test tube',
        'Bamboo skewer, 30 cm',
        'Lighter or matches',
    ],
    steps=[
        'Stir one or two heaped teaspoons of bicarbonate of soda into a glass of warm water.',
        'Sharpen both pencils at both ends. Press the exposed graphite of each against a terminal '
        'of the 9V battery and dip the other ends into the solution, not touching each other.',
        'Bubbles form at both electrodes. The hydrogen comes off the negative one.',
        'Fill a test tube with the solution, invert it over the negative electrode, and let the '
        'hydrogen push the liquid out. This takes 10 to 20 minutes — start it and run '
        'another experiment while it fills.',
        'Lift the tube out keeping it mouth-down. Light the skewer and hold the flame to the '
        'mouth of the tube.',
    ],
    science=('Pure water barely conducts, so something has to be dissolved in it to carry the '
             'current. At the negative electrode water is reduced to hydrogen; at the positive it '
             'is oxidised to oxygen. Twice as much hydrogen comes off as oxygen, because that is '
             'the formula. The pop is the collected hydrogen burning in air all at once.'),
    log=['How long the test tube took to fill',
         'Bubble rate at each electrode — hydrogen should be about double the oxygen',
         'Whether more electrolyte, or warmer water, fills it faster'],
    variables=['How much bicarbonate of soda', 'Water temperature',
               'How far apart the electrodes sit'],
    safety=('The tutor holds the lit skewer and the student stands back. One test tube of gas and '
            'no more. Keep the flame away from the glass the electrolysis is running in, and open '
            'a window.'),
    notes=('BICARBONATE OF SODA, NOT TABLE SALT. Chloride ions oxidise to chlorine, which is '
           'toxic — this is the one substitution that matters. | Epsom salts also work and '
           'then magnesium hydroxide settles on the cathode, fouling the electrode and clouding '
           'the water. Washing soda works harder than bicarbonate if you need it faster. | '
           'Replaces the magnesium-and-hydrochloric-acid version of this test — same gas, '
           'same pop, no corrosive acid in a kitchen.'),
    cost_per_run=0.50, setup_cost=5.00,
))

# ============================================================================== 04
ROWS.append(row(
    id='PR-HM04', name='Burning steel wool — conservation of mass', subject='Chemistry',
    level='GCSE',
    aim='Burn something and have it come out HEAVIER, then work out where the extra came from.',
    outcome='A mass gain on the scales, and the reason for it: 4Fe + 3O₂ → 2Fe₂O₃.',
    venue='outdoors', feasible='yes, with kit', minutes=20, sort_order=530,
    age_min=9, hazard='medium', wow='very high',
    topics='Chemical Changes, Quantitative Chemistry, Percentage Increase & Decrease, Units & Measures',
    equipment=[
        'Steel wire wool, grade 0000',
        '9V battery',
        'Metal baking tray',
        'Digital kitchen scale',
        'Bowl of water alongside',
        'Safety goggles',
    ],
    steps=[
        'Tear off a small pad of wire wool, roughly 3 to 5 g. Weigh it and write it down.',
        'Put it on the metal tray, outdoors, away from anything that can catch.',
        'Touch both terminals of the 9V battery to the wool. It lights immediately.',
        'Watch the glow travel. It is out in about twenty seconds.',
        'Let it cool all the way down, then weigh what is left and write that down.',
    ],
    science=('The battery shorts across the fine strands and heats them enough to light. The iron '
             'reacts with oxygen in the air to make iron oxide, and the oxygen atoms that join on '
             'have mass — so the product weighs MORE than the wool did. That is the '
             'counter-intuitive bit: every fire a child has ever seen leaves less behind than it '
             'started with. This is the clearest demonstration of conservation of mass you can do '
             'without a lab.'),
    log=['Mass before, in grams', 'Mass after, in grams', 'The percentage gain',
         'How long it burned for'],
    variables=['Mass of wool at the start', 'Whether the pad is teased out or left tight'],
    safety=('OUTDOORS ONLY, on a metal tray — never on grass, decking or a worktop. Bowl of '
            'water beside it. Goggles on and both of you standing back once it is lit. Let the '
            'residue cool completely before it is touched. Store wire wool away from batteries: '
            'it can light on its own if the two meet in a drawer.'),
    notes=('GRADE 0000 AND NOT COARSER. Thicker strands will not light off a 9V battery. Avoid '
           'car-care pads — many are soaped or oiled and burn dirty. | For a parent: it is a '
           'sparkler. Outdoors, on a tray, over in twenty seconds. | Replaces burning magnesium '
           'ribbon — same oxidation chemistry, far more control.'),
    cost_per_run=0.30, setup_cost=9.98,
))

# ============================================================================== 05
ROWS.append(row(
    id='PR-HM05', name='Rates of reaction with effervescent tablets', subject='Chemistry',
    level='GCSE',
    aim='Change one thing at a time and watch the reaction speed move with it.',
    outcome='A graph of dissolving time against temperature, and the habit of changing one '
            'variable at a time.',
    venue='home', feasible='yes, with kit', minutes=30, sort_order=540,
    age_min=8, hazard='very low', wow='low to look at, high to learn from',
    topics='Rate of Reaction, Scatter Graphs & Correlation, Units & Measures',
    equipment=[
        'Effervescent vitamin C tablets',
        'Digital kitchen thermometer',
        'Glasses or beakers',
        'A stopwatch — a phone will do',
        'Measuring jug',
    ],
    steps=[
        'Drop one whole tablet into a glass of cold water and time it to complete dissolution.',
        'Repeat with warm water, then hot. Record the temperature each time.',
        'Repeat with a crushed tablet at one fixed temperature.',
        'Repeat with half the volume of water.',
        'Plot dissolving time against temperature.',
    ],
    science=('The tablet holds citric acid and bicarbonate dry, so nothing happens until water '
             'lets them react and carbon dioxide comes off. Warmer water means faster-moving '
             'particles, so collisions are more frequent and harder, so the reaction is quicker. '
             'Crushing the tablet does the same thing a different way: more surface touching the '
             'water at once.'),
    log=['Temperature in °C against time to dissolve in seconds',
         'Whole tablet against crushed, at one fixed temperature',
         'The graph: time up the side, temperature along the bottom'],
    variables=['Water temperature', 'Whole tablet or crushed — surface area',
               'Volume of water — concentration', 'Stirring or not'],
    safety='Hot water is the tutor’s. The tablets are food and swallowing one is not a hazard.',
    notes=('THE MOST VALUABLE ONE IN THE SET for teaching method, and the least impressive to '
           'look at. Keep the water volume, the tablet, the glass and the stirring the same and '
           'change ONE thing — that is the entire point of the session.'),
    cost_per_run=1.00, setup_cost=6.39,
))

# ============================================================================== 06
ROWS.append(row(
    id='PR-HM06', name='Separating salt from sand', subject='Chemistry', level='GCSE',
    aim='Take apart a mixture nobody could separate by hand, and get the salt back.',
    outcome='Sand on the filter paper, salt crystals in the dish a day later, and a recovery '
            'percentage.',
    venue='home', feasible='yes, with kit', minutes=30, sort_order=550,
    age_min=8, hazard='very low', wow='medium, and delayed',
    topics='Separating Mixtures, Chemical Analysis, Percentage of an Amount',
    equipment=[
        'Play sand or reptile terrarium sand',
        'Table salt',
        'Filter paper, 110 mm',
        'A funnel — cut a 2 L plastic bottle in half and invert the top into the base',
        'Warm water',
        'Shallow dish to evaporate in',
    ],
    steps=[
        'Mix two tablespoons of sand with one of salt, and show that no amount of picking '
        'separates them.',
        'Add warm water and stir. The salt dissolves; the sand does not.',
        'Fold the filter paper into a cone, sit it in the funnel, and pour the mixture through. '
        'Sand stays on the paper and the salt solution goes through.',
        'Pour what came through into a shallow dish and leave it on a sunny windowsill or a warm '
        'radiator for a day.',
        'Next session: the salt has come back as crystals.',
    ],
    science=('Salt dissolves and sand does not, so filtering takes out the sand and leaves the '
             'salt in the water. Evaporating the water leaves the salt behind as crystals. The '
             'salt was never destroyed — it was spread out among the water molecules, and now '
             'it is back. Weighing it proves that rather than asserting it.'),
    log=['Mass of salt in, mass of crystals out', 'The percentage you recovered',
         'A sketch of the crystals — they are cubes, and that is worth noticing'],
    variables=['Water temperature — how fast the salt dissolves',
               'Where the dish sits — how fast it evaporates'],
    safety='Nothing beyond ordinary kitchen care.',
    notes=('PLAY SAND OR REPTILE SAND, NOT BUILDER’S. Builder’s sand carries clay that '
           'goes straight through the filter as a cloud and leaves a grey residue, which ruins '
           'the crystals at the end. | The payoff is a day later, so it is the one to start in a '
           'session you know you are following.'),
    cost_per_run=0.50, setup_cost=11.23,
))

# ============================================================================== 07
ROWS.append(row(
    id='PR-HM07', name='Shoebox smartphone projector', subject='Physics', level='GCSE',
    aim='Build a projector from a shoebox and a magnifying glass, and find out why the phone goes '
        'in upside down.',
    outcome='A real image on the wall, inverted, and the distance that focuses it.',
    venue='home', feasible='yes, with kit', minutes=45, sort_order=560,
    age_min=8, hazard='very low', wow='medium',
    topics='Waves, Enlargements',
    equipment=[
        'Shoebox',
        'Magnifying glass, 100 mm lens',
        'Black card',
        'Double-sided mounting tape',
        'A smartphone',
        'Craft knife or scissors — the tutor’s',
    ],
    steps=[
        'Cut a hole in one end of the shoebox to fit the lens, and mount the lens in it.',
        'Line the inside with black card so nothing reflects.',
        'Make a folded-card stand inside to hold the phone UPSIDE DOWN.',
        'Phone brightness to maximum and auto-rotate OFF.',
        'Darken the room and slide the phone back and forth until it focuses.',
    ],
    science=('The lens bends light from the screen so that it comes back together on the wall as '
             'a real image. A real image from a single converging lens is upside down, which is '
             'why the phone goes in that way. Moving the phone relative to the focal point changes '
             'where the image forms and how big it is — which is the ray diagram, built '
             'rather than drawn.'),
    log=['Phone-to-lens distance against image size',
         'The distance where it is sharpest',
         'How that compares with the lens’s focal length'],
    variables=['Phone-to-lens distance', 'Box-to-wall distance', 'Screen brightness'],
    safety='The craft knife is the tutor’s. Nothing else on this one.',
    notes=('IT IS DIMMER THAN ANYBODY EXPECTS. Build it and focus it before he is watching, or '
           'the first look is a disappointment. Lens diameter is what decides brightness, not '
           'magnification. | It needs a properly dark room.'),
    cost_per_run=0, setup_cost=17.52,
))

# ============================================================================== 08
ROWS.append(row(
    id='PR-HM08', name='Motorised scribble bot', subject='Physics', level='KS2–KS3',
    aim='Make a motor with a lump stuck on it drive a cup around a sheet of paper.',
    outcome='A drawing made by vibration, and a set of patterns that change with the weight.',
    venue='home', feasible='needs a motor and battery holder, about £8, not yet bought',
    minutes=45, sort_order=570,
    age_min=7, hazard='very low', wow='high — and he keeps it',
    topics='Electricity, Forces',
    equipment=[
        'Small hobby DC motor with an AA battery holder',
        'Plastic cup',
        'Three or four felt-tip markers',
        'Tape',
        'Blu-tack or a cork, for the off-centre weight',
        'Large sheets of paper',
    ],
    steps=[
        'Turn the cup upside down and tape three or four felt tips round it as legs, tips down.',
        'Tape the motor and the battery holder to the top of the cup.',
        'Stick a blob of Blu-tack off-centre on the motor shaft.',
        'Switch it on over a large sheet of paper.',
    ],
    science=('The weight is not on the axis the shaft turns about, so spinning it throws the whole '
             'body around rather than just turning. The legs turn that shaking into travel. It is '
             'the same reason a washing machine walks across the floor on a spin cycle, and the '
             'same reason wheels get balanced.'),
    log=['Thirty seconds per set-up, each on its own labelled sheet',
         'Which set-up drew the widest pattern'],
    variables=['How far the weight sits from the centre of the shaft', 'How heavy the weight is',
               'Three legs or four', 'How long the legs are'],
    safety='Nothing beyond keeping the motor off hair and loose sleeves.',
    notes=('The motor and battery holder are the one thing in this set still to buy — about '
           '£8. | A build-and-keep, which is the one kind of session that carries on after '
           'you have left.'),
    cost_per_run=0, setup_cost=13.00,
))

# ============================================================================== 09
ROWS.append(row(
    id='PR-HM09', name='Measuring car speeds on the street', subject='Physics',
    level='KS2–GCSE',
    aim='Turn two lamp posts and a stopwatch into twenty real speeds.',
    outcome='Twenty measured speeds in mph, a mean and a range, and the proportion over the limit.',
    venue='outdoors', feasible='yes', minutes=40, sort_order=580,
    age_min=8, hazard='low', wow='medium',
    topics='Compound Measures, Units & Measures, Averages & Range',
    equipment=[
        'Tape measure, or the measure tool in Google Maps',
        'A stopwatch — a phone will do',
        'Clipboard and a results sheet',
    ],
    steps=[
        'Pick two fixed landmarks on the road — consecutive lamp posts are ideal — and '
        'measure the distance between them.',
        'Stand well back on the pavement.',
        'Time each car between the two points.',
        'Work out speed = distance ÷ time, then convert to mph by multiplying by 2.237.',
        'Log twenty vehicles.',
    ],
    science=('Speed is distance divided by time and nothing else, which is easy to say and only '
             'becomes real when you have measured both halves yourself. The conversion is the '
             'other half of the lesson: the same speed is 8.9 m/s and 20 mph, and neither number '
             'is more true than the other.'),
    log=['Distance between the landmarks, in metres', 'Time for each vehicle, in seconds',
         'Speed in m/s and in mph', 'Mean, fastest and slowest',
         'How many were over the limit — most of Merton and Wandsworth is 20 mph',
         'Cars against vans'],
    variables=['Time of day', 'Which road', 'Cars against vans against buses'],
    safety=('Stay on the pavement and well back from the kerb the whole time. Do not point a phone '
            'or anything else at a driver. Tell the parent beforehand that this one is outdoors.'),
    notes='Costs nothing and needs no kit, so it is the one to fall back on when something else has not arrived.',
    cost_per_run=0, setup_cost=0,
))

# ============================================================================== 10
ROWS.append(row(
    id='PR-HM10', name='Fish behaviour logging', subject='Biology', level='KS2–KS3',
    aim='Watch one fish properly for two minutes and find out what an ethogram is.',
    outcome='A tally of behaviours before and after feeding, and a bar chart of the two.',
    venue='home', feasible='needs a tank, a pond, or a window onto birds', minutes=30,
    sort_order=590,
    age_min=7, hazard='none', wow='low to look at, high if the fish is his',
    topics='Ecology, Bar Charts & Pictograms',
    equipment=[
        'A fish tank, or a pond, or birds through a window',
        'A stopwatch',
        'A recording grid, ruled up beforehand',
    ],
    steps=[
        'Pick ONE fish and stay with it.',
        'Watch for two minutes and write down what it is doing every fifteen seconds — '
        'swimming, still, at the surface, hiding, feeding.',
        'Do it once before feeding and once after.',
        'Compare the two.',
    ],
    science=('This is an ethogram: a list of the behaviours an animal has and how long it spends '
             'in each. It is how behavioural biologists actually work. The fifteen-second interval '
             'is the point — you cannot watch everything at once, so you SAMPLE, and the '
             'sample stands in for the whole.'),
    log=['A tally per behaviour, per session', 'Before feeding against after feeding',
         'A bar chart of time spent in each behaviour'],
    variables=['Before or after feeding', 'Time of day', 'Which individual you follow'],
    safety='None. Do not tap the glass.',
    notes='Needs something alive to watch. Birds through a window work as well as a tank and cost nothing.',
    cost_per_run=0, setup_cost=0,
))

# ==================================================================================================
# THE FIVE THAT WERE CONSIDERED AND REFUSED.
#
# They are rows and not a deletion, because "recorded so the reasoning is not lost" was the point
# of writing them down. Each one is live, carries `excluded_reason`, and leads with it — see the
# card in find.js, which draws the refusal before it draws anything else.
#
# NO `steps`, DELIBERATELY. An experiment nobody is going to run does not need a method, and
# `check-practicals.js` asks an excluded row for a REASON where it asks a live one for kit and
# steps. Writing out a method for something that has been refused is inventing content to satisfy
# a checker, which is the opposite of what the checker is for.
# ==================================================================================================
def refused(**kw):
    r = row(**kw)
    assert r['excluded_reason'], kw['id'] + ' is refused and says nothing about why'
    return r


ROWS.append(refused(
    id='PR-HX01', name='Magnesium and hydrochloric acid — the hydrogen pop',
    subject='Chemistry', level='GCSE',
    aim='The classic school way of making hydrogen and testing it with a lit splint.',
    venue='lab', feasible='needs a lab', minutes=20, sort_order=600,
    age_min=14, hazard='medium', wow='high',
    topics='Chemical Changes, Chemical Analysis',
    excluded_reason=(
        'Needs dilute hydrochloric acid. It is corrosive, and a domestic kitchen has no eyewash, '
        'no fume extraction and no technician standing behind you. Not appropriate for a '
        'primary-aged student in their own home.'),
    reconsider_at_age=14,
    notes='Replaced by the electrolysis version — same hydrogen, same pop, water and a battery.',
))

ROWS.append(refused(
    id='PR-HX02', name='Burning magnesium ribbon', subject='Chemistry', level='GCSE',
    aim='Burn a metal in air and see the oxide left behind.',
    venue='lab', feasible='needs a lab', minutes=15, sort_order=610,
    age_min=14, hazard='high', wow='very high',
    topics='Chemical Changes, Quantitative Chemistry',
    excluded_reason=(
        'Burns at about 3000 °C, throws out UV that can damage eyes, cannot be put out with '
        'water, and can drop molten metal. Not acceptable indoors in a client’s home at any '
        'age.'),
    reconsider_at_age=14,
    notes='Replaced by burning steel wool — the same oxidation chemistry with far more control.',
))

ROWS.append(refused(
    id='PR-HX03', name='Paper chromatography', subject='Chemistry', level='GCSE',
    aim='Separate the dyes in a felt-tip pen and measure how far each one travels.',
    venue='home', feasible='yes, with kit', minutes=30, sort_order=620,
    age_min=8, hazard='very low', wow='medium',
    topics='Chemical Analysis, Separating Mixtures',
    excluded_reason=(
        'Left out at the tutor’s preference, not on a safety judgement. Available whenever '
        'it is wanted: the filter paper is already bought and water-soluble markers are about '
        '£4. It covers the GCSE chromatography required practical and the Rƒ calculation.'),
    notes='The only one of the five that is a preference rather than a hazard.',
    cost_per_run=0.50, setup_cost=4.00,
))

ROWS.append(refused(
    id='PR-HX04', name='Copper displacement on a coin', subject='Chemistry', level='GCSE',
    aim='Strip the copper off a coin and put it back on a steel screw.',
    venue='home', feasible='yes', minutes=25, sort_order=630,
    age_min=9, hazard='low', wow='medium',
    topics='Chemical Changes',
    excluded_reason=(
        'Proposed and declined. Nothing against it beyond that — it costs nothing to '
        'reinstate, because the salt and vinegar are already on the shopping list and the coins '
        'and the screw come from the house.'),
    notes='Covers displacement reactions and the reactivity series.',
    cost_per_run=0, setup_cost=0,
))

ROWS.append(refused(
    id='PR-HX05', name='Flame tests', subject='Chemistry', level='GCSE',
    aim='Identify metal ions by the colour they turn a flame.',
    venue='lab', feasible='needs a lab', minutes=25, sort_order=640,
    age_min=13, hazard='medium', wow='high',
    topics='Chemical Analysis',
    excluded_reason=(
        'Needs metal salts and a sustained open flame. A higher hazard than anything else in this '
        'set, and harder to justify to a parent for a ten-year-old than the rest of it.'),
    reconsider_at_age=13,
))

# ==================================================================================================
# ASSERTIONS, BEFORE A ROW IS WRITTEN.
#
# The rule this repository keeps: a number mistyped into a file fails HERE rather than shipping.
# ==================================================================================================
ids = [r['practical_id'] for r in ROWS]
assert len(ids) == len(set(ids)), 'a practical_id appears twice'
assert len(ROWS) == 15, 'expected ten experiments and five refusals, got %d' % len(ROWS)

live = [r for r in ROWS if not r['excluded_reason']]
gone = [r for r in ROWS if r['excluded_reason']]
assert len(live) == 10 and len(gone) == 5

for r in live:
    i = r['practical_id']
    assert r['equipment'], i + ' has no kit'
    assert r['steps'], i + ' has no method'
    assert r['science'], i + ' does not say what the science is'
    assert r['log'], i + ' does not say what to write down'
    assert r['variables'], i + ' does not say what to change'
    assert r['cost_per_run_gbp'] is not None, i + ' is not costed per run'
    assert r['setup_cost_gbp'] is not None, i + ' has no set-up cost'

for r in gone:
    i = r['practical_id']
    assert not r['steps'], i + ' is refused and carries a method anyway'

for r in ROWS:
    i = r['practical_id']
    assert r['age_min'] and 5 <= r['age_min'] <= 18, i + ' has no sensible age_min'
    assert r['hazard'], i + ' has no hazard level'
    assert r['topics'].strip(), i + ' names no topics, so nothing can reach it'
    # ---------- A COMMA IN A TOPIC NAME IS TWO TOPICS ----------------------------------------
    # The fault this repository already repaired once: `topics` is a comma-list, so a name with a
    # comma inside it arrives as two topics and neither joins the tree. An assertion in the
    # writer rather than a thing to remember.
    for t in r['topics'].split(','):
        assert t.strip(), i + ' has an empty topic — a doubled comma'
    for col in ('equipment', 'steps', 'log', 'variables', 'notes'):
        for part in str(r[col]).split('|'):
            if str(r[col]).strip():
                assert part.strip() or not str(r[col]).strip(), i + ' has a doubled pipe in ' + col

# ---------- AND THE TOPICS HAVE TO NAME SOMETHING REAL --------------------------------------------
# `check-practicals.js` is the rule and this is the same question asked before the file is written,
# so a typo never reaches the repository at all. The tree is read here rather than copied.
def tkey(s):
    return re.sub(r'[^a-z0-9]', '', str(s).lower())


known = set()
with open(TOPICS) as fh:
    for line in fh:
        s = line.strip().rstrip(',')
        if s in ('[', ']') or not s:
            continue
        t = json.loads(s)
        known.add(tkey(t.get('label')))
        known.add(tkey(str(t.get('topic_id', '')).replace('-', ' ')))
        for a in str(t.get('aliases') or '').split(','):
            if a.strip():
                known.add(tkey(a))

missing = []
for r in ROWS:
    for t in r['topics'].split(','):
        if tkey(t) not in known:
            missing.append((r['practical_id'], t.strip()))
assert not missing, 'topics that name nothing in data/topics.json: %r' % missing

# ==================================================================================================
# WRITE, ONE OBJECT PER LINE.
# The shape `check-practicals.js` enforces and `data/questions.json` already has, for the reason
# that file records: the next script to append by splitting on newlines.
# ==================================================================================================
with open(PRACTICALS) as fh:
    lines = fh.read().rstrip('\n').split('\n')
assert lines[0].strip() == '[' and lines[-1].strip() == ']', 'practicals.json is not the shape expected'

body = lines[1:-1]
have = set()
for raw in body:
    s = raw.strip().rstrip(',')
    if s:
        have.add(json.loads(s)['practical_id'])
clash = have & set(ids)
assert not clash, 'these ids are already in the file: %r' % sorted(clash)

body = [b.rstrip().rstrip(',') for b in body if b.strip()]
body += [json.dumps(r, ensure_ascii=False) for r in ROWS]
out = ['['] + [b + ',' for b in body[:-1]] + [body[-1]] + [']']
with open(PRACTICALS, 'w') as fh:
    fh.write('\n'.join(out) + '\n')

print('wrote %d rows (%d to run, %d refused) into data/practicals.json — %d rows in total'
      % (len(ROWS), len(live), len(gone), len(body)))
print('topics all join data/topics.json')
