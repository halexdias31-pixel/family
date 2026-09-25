#!/usr/bin/env python3
# ==================================================================================================
# @family. — tools/practical-guides.py
#
# ONE COLUMN, `risks`, AND ONE NEW PRACTICAL.
#
# WHY A COLUMN RATHER THAN A RENDERER. Every practical already carries `safety`, which is one
# sentence of prose, and the guide asked for a risk assessment — hazard and what you do about it,
# item by item. THE GUIDE NO LONGER DRAWS ONE: it was cut on 2026-09-25 to the five things the
# owner asked for, and `practicalGuide_` lists what went. The column stays filled and
# `check-practicals.js` still FAILS a live row without it, so the section is one `<section>` from
# coming back — which is the whole reason this file is worth keeping as it is.
#
# Deriving those from the prose is the fault CLAUDE.md records twice: a substring over free text
# called five practicals "required" when they say outright they are not, and parsing
# "why intuition fails" into a topic was refused for the same reason. So each one is WRITTEN, from
# that row's own kit list and its own safety line, and the prose stays where it is.
#
# ONE SENTENCE PER HAZARD, PIPE-SEPARATED — the shape `equipment` and `steps` already have, for the
# reason recorded there: 14 of the 410 equipment cells hold a comma inside one item, so a comma
# cannot separate. A nested delimiter (hazard ~ harm ~ control) was the other candidate and is the
# numbered-column fault wearing a different hat: three facts that must line up, in one cell, with
# nothing able to check that they do. A hazard and its control in one sentence is one fact.
#
# WHAT IS DELIBERATELY NOT HERE. No hazard is invented from a word in the kit list — "Bunsen
# burner" appears in twelve of these and a rule matching it would be a substring over free text
# again. Where a row's own safety line and kit do not settle a hazard, nothing is written for it and
# `check-practicals.js` prints the count, which is the `figure` pattern: a number somebody can act
# on rather than a silence.
#
#     python3 tools/practical-guides.py
# ==================================================================================================
import json, io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data', 'practicals.json')

# ---------- THE RISK ASSESSMENT, PER PRACTICAL ----------------------------------------------------
# Each item: the hazard, and what is done about it. Read off that row's own kit and safety line.
RISKS = {
 'PR-PH01': ["The immersion heater and the block stay hot for minutes after the supply is off — leave them on the heatproof mat and do not lift the block until it is cool to the back of the hand.",
             "Water in the thermometer hole beside a mains-fed supply — use the low-voltage supply only, and mop any spill before switching on.",
             "Slotted block edges are sharp — carry it flat, not by the rim."],
 'PR-PH02': ["Hot water scalds — the tutor fills the beaker, at no more than 80 °C for anyone under 14, and it is carried with two hands and set down before anyone else touches it.",
             "A full beaker near the table edge — stand it at the back of the bench, away from bags and trailing sleeves.",
             "A thermometer left standing in a beaker tips it — clamp it or hold it."],
 'PR-PH03': ["The nichrome wire gets hot enough to burn — keep the current low, open the switch between readings, and never touch the wire with the circuit closed.",
             "The wire is taped to a metre rule and can spring loose — tape both ends and keep fingers off the free length.",
             "A short circuit heats the leads — check the variable resistor is in before closing the switch."],
 'PR-PH04': ["The filament lamp gets hot — let it cool before moving it, and do not exceed the rating printed on it.",
             "A diode without its protective resistor burns out and can get hot — put the resistor in the circuit before the supply goes on.",
             "Leads warm if the current is pushed up — work inside the component ratings and open the switch between readings."],
 'PR-PH05': ["Water and a balance together — wipe every spill at once, and keep the balance on a dry part of the bench.",
             "The eureka can spout drips onto the floor — stand it over a tray and put the catch beaker under the spout before filling.",
             "Dropping a stone into a measuring cylinder cracks the base — lower it down a tilted cylinder rather than dropping it."],
 'PR-PH06': ["A spring under load can snap and fly — eye protection on before the first mass goes on, and nobody leans over the hanger.",
             "Falling masses land on feet — put a soft mat or tray under the hanger and keep feet out from under it.",
             "The clamp stand topples as the load grows — G-clamp the base to the bench before loading."],
 'PR-PH07': ["The falling mass hanger lands on feet — put a soft landing under it and keep the floor clear.",
             "The trolley runs off the end of the runway — put a catcher or a block at the far end before the first run.",
             "The pulley pulls loose under load — clamp it firmly and check it after every few runs."],
 'PR-PH08': ["Water and mains electricity in one place — the ripple tank lamp and the vibration generator run off a low-voltage supply, and the supply sits away from the tank.",
             "A strobe can trigger a photosensitive seizure — ask before it goes on, and tell anyone in the room that it is about to.",
             "Spilled water on the floor is a slip — fill the tank in place and mop at once."],
 'PR-PH09': ["The ray box lamp gets hot enough to burn — let it cool before moving it, and keep paper off the housing.",
             "A dimmed room is a trip hazard — clear bags and stools from the walkway before the lights go down.",
             "The glass block chips and cuts if it is dropped — slide it on the paper rather than lifting it across the bench."],
 'PR-PH10': ["Boiling water going into the Leslie cube scalds — the tutor fills it, on the mat, and it is not moved again once filled.",
             "The filled cube stays hot on every face — handle it by the base, and let it cool in place.",
             "Water spilled down the outside runs onto the detector leads — fill through a funnel and wipe the outside before switching on."],
 'PR-CH01': ["Dilute sulfuric acid irritates skin and eyes — goggles from before the bottle is opened until the bench is cleared, and any splash is washed off at once.",
             "The evaporating basin and the tripod stay hot long after the flame is out — leave them on the mat and check with the back of a hand.",
             "Bunsen flame and loose hair or sleeves — hair tied back, sleeves up, flame on the yellow safety flame between heatings.",
             "Boiling the solution to dryness spits hot crystals — stop heating while liquid is still visible and let the last of it evaporate on its own."],
 'PR-CH02': ["Sodium hydroxide solution is corrosive to eyes — goggles throughout, and the burette is filled below eye level with a funnel.",
             "A burette clamped high tips the stand — clamp it low and check the stand base is flat before filling.",
             "Acid or alkali on the fingers from the tap — wash hands before leaving, and report every spill rather than wiping it quietly.",
             "Glass pipettes break at the neck — a safety filler, never the mouth, and the pipette is carried vertically."],
 'PR-CH03': ["Chlorine comes off the positive electrode from sodium chloride solution — a fume cupboard, or a very small volume with the window open, and nobody sniffs the cell.",
             "Copper(II) sulfate solution is harmful if swallowed and stains — goggles on, hands washed before anyone leaves.",
             "Graphite electrodes crumble and short across the cell — check they are clear of each other before the supply goes on.",
             "Low-voltage supply near an open cell of solution — the supply stands away from the beaker and is switched off before anything is moved."],
 'PR-CH04': ["Dilute acid and alkali splash when they are poured together — goggles on both of you, and the lower concentrations for anyone younger.",
             "The cup tips as the thermometer goes in — stand the polystyrene cup inside a beaker before anything is added.",
             "The mixture warms enough to surprise a hand on the cup — hold the outer beaker rather than the cup."],
 'PR-CH05': ["Sulfur dioxide comes off the thiosulfate and acid mixture and irritates the airway — keep volumes small, ventilate the room, and take the flask away to a sink at the end rather than leaving it open on the bench.",
             "Anyone asthmatic is at more risk from that gas than the rest of the room — ask first, and run the gas-syringe version with them instead.",
             "Dilute hydrochloric acid on skin — goggles throughout and wash a splash off at once."],
 'PR-CH06': ["Low hazard with water as the solvent — the one thing to watch is the beaker tipping, so the rod holding the paper rests across the rim rather than being held.",
             "If a solvent other than water is used it is flammable and its vapour collects — ventilate, and no flame anywhere in the room.",
             "Ink and food colouring stain skin and clothes — spot the paper with a stick rather than a finger."],
 'PR-CH07': ["Bunsen flame with a wire loop held in it — hair tied back, sleeves up, and the loop goes into the flame away from everybody rather than across the bench.",
             "The nichrome loop stays red-hot and looks cold — it is rested on the mat between samples and never put down on the bench.",
             "Sodium hydroxide solution is corrosive to eyes — goggles throughout, added dropwise down the side of the tube.",
             "Cleaning the loop in hydrochloric acid spits when it goes back into the flame — shake the drop off before returning it."],
 'PR-CH08': ["Boiling water in distillation apparatus — anti-bumping granules in the flask, and the apparatus is never sealed at both ends.",
             "Hot glassware looks identical to cold — everything stays on the mat until it is cool to the back of a hand.",
             "Pond and sea water carry bacteria — gloves if there is a cut, hands washed before anyone leaves the room.",
             "The condenser hose comes off under pressure and floods the bench — wire the hoses on and run the water slowly."],
 'PR-BI01': ["Coverslips and slides break into small sharp pieces — lower the coverslip with a mounted needle, and sweep breakages into the sharps bin rather than picking them up.",
             "The mounted needle is sharp — it is pointed away from the hand holding the slide.",
             "Iodine stain marks skin and clothes and irritates eyes — one drop from a pipette, goggles on.",
             "Cheek cells are a human-tissue risk assessment of their own — onion only, unless that assessment has been done."],
 'PR-BI02': ["Live bacterial culture — strict aseptic technique, the plate is taped shut in two places and never reopened.",
             "Incubating above 25 °C in a school selects for organisms that grow at body temperature — the incubator is set to 25 °C and checked before the plates go in.",
             "The inoculating loop is flamed red-hot and stays hot — it is cooled in the agar edge before it touches the culture.",
             "Used plates are a disposal hazard — autoclaved or sealed for collection, never in the ordinary bin."],
 'PR-BI03': ["Cork borers and scalpels cut to the bone — cut down onto a board, away from the body, and nobody else's hand is near the board.",
             "A cork borer twisted through a potato slips when it breaks through — the potato is flat on the board and the borer is turned rather than pushed.",
             "Sucrose solutions spilled on the floor are sticky and slippery — the rack stands in a tray.",
             "Under-14s with a scalpel — the tutor does the cutting, the student measures."],
 'PR-BI04': ["Ethanol is highly flammable and its vapour travels — no Bunsen, no flame anywhere in the room while the bottle is open, and the water bath is electric.",
             "Benedict's solution is harmful and the bath is at 75 °C — goggles, and tubes are lifted with a holder rather than fingers.",
             "Biuret reagent contains sodium hydroxide and is corrosive to eyes — goggles throughout, added dropwise.",
             "Food samples carry allergens — check every allergy in the room before a single sample is opened, and nothing is tasted."],
 'PR-BI05': ["Iodine solution stains skin and clothes and irritates eyes — goggles, and it goes onto the tile from a pipette rather than being poured.",
             "Buffer solutions are irritants — goggles, and hands washed before leaving.",
             "A 35 °C water bath with tubes in it tips if it is knocked — it sits at the back of the bench with the leads behind it."],
 'PR-BI06': ["A bright lamp beside a beaker of water and a mains lead — the supply stays away from the water and the lead runs behind the bench.",
             "The lamp gets hot enough to burn and to heat the tube — the beaker of water is the heat shield and it is not moved once the lamp is on.",
             "Pondweed and pond water carry bacteria — hands washed before anyone leaves."],
 'PR-BI07': ["Almost nothing physical — the one thing to set is that the dropped ruler is caught rather than grabbed at, so nobody bangs a hand on the table edge.",
             "Testing the effect of caffeine on anyone under 16 is not done at all — the comparison is between people, or between hands."],
 'PR-BI08': ["Compost and seed coatings carry bacteria and some seeds are chemically treated — untreated cress only, and hands washed afterwards.",
             "The cardboard box on a sunny windowsill blocks the walkway — it goes at the back of the sill, not on the floor.",
             "Cling film over a Petri dish with condensation drips — the dish stands on a tray."],
 'PR-BI09': ["Working outdoors away from the building — a written outdoor risk assessment, high-vis on everybody, and a headcount at every stop and before leaving.",
             "The river edge is the one place somebody can drown — no quadrat is placed within the fenced line, and nobody works alone.",
             "Soil, water and animal droppings carry bacteria — gloves, cuts covered, hands washed before anybody eats.",
             "Stinging and scratching plants, and insects — long sleeves, and the first aid kit stays with the group rather than in a bag."],
 'PR-BI10': ["Lipase and sodium carbonate solution are irritants — goggles throughout and hands washed at the end.",
             "Water baths across a range of temperatures, the hottest of them scalding — tubes are moved with a holder and the hot bath is the tutor's.",
             "Milk goes off and is a biological hazard once it has stood warm — it goes down the sink with plenty of water the same session, not into a bin."],
 'PR-FN01': ["A height with a drop — a public viewing platform with a barrier only, never a roof, a window ledge or a fire escape, and nobody leans on or over the rail.",
             "A group in a public building — headcount before going up and again before leaving, and a meeting point agreed at the bottom first.",
             "Binoculars pointed at the sun blind permanently — the horizon only, and it is said out loud before they are handed over.",
             "Dropped equipment from height hits somebody below — the clinometer and the phone go on wrist straps or stay in a pocket."],
 'PR-FN02': ["Working in direct sun for the middle of the day — hats, water, shade between readings, and the session is moved if it is very hot.",
             "Looking at the sun to line the pole up blinds — the SHADOW is measured and the sun is never looked at, which is said before the pole goes up.",
             "A metre stick standing vertically falls on somebody — it is held or based in something heavy, not balanced.",
             "Chalk marks on ground that is not yours — a playground or your own path only."],
 'PR-FN03': ["Pacing a baseline takes people backwards into traffic, cyclists and other pedestrians — the baseline is paced along a pavement or a field edge, never into the road, and whoever is pacing looks where they are going.",
             "A clinometer held to the eye means the eye is not on the ground — stop walking before sighting.",
             "Cones or chalk left behind are a hazard to the next person — they are collected before the group leaves."],
 'PR-FN04': ["The microwave is mains equipment and is the adult's to operate — the student measures, the tutor runs it.",
             "Running a microwave empty or nearly empty damages it and can start a fire — the plate of chocolate goes in before it is switched on and the run is seconds, watched.",
             "Melted chocolate is hot enough to burn — oven gloves, and it is left to stand before it is measured.",
             "The turntable is removed, so the plate does not rotate and the dish gets hot in patches — it is lifted with gloves from the rim."],
 'PR-FN05': ["Almost nothing — cocktail sticks have a point, so the ends are blunted or matchsticks with the heads removed are used instead.",
             "Sticks dropped on the floor are a slip and a stand-on hazard — the drops are made into a tray."],
 'PR-FN06': ["Dried rice or peas on a hard floor are a slip hazard — everything is dropped into a tray with a lip and swept up before anyone walks through.",
             "Grain allergy — ask first, and use dried peas instead.",
             "A pair of compasses has a point — the circle is drawn on the card flat on the table, and it is put away point-down in a pot."],
 'PR-FN07': ["Nothing beyond ordinary classroom care — scissors are the only sharp thing and they are passed handle-first.",
             "Round objects roll off a table and break — they are kept on a tray rather than at the edge."],
 'PR-FN08': ["Nothing physical at all — the sweet used as the prize is the only thing to check, so it goes nowhere near anyone with an allergy to it and is not eaten."],
 'PR-FN09': ["An outdoor session in a public park — written outdoor risk assessment, high-vis, and a headcount at every corner as well as before leaving.",
             "The river bank is the drowning risk — the route is walked on the path side and the corner nearest the water is measured from the path.",
             "Traffic on the park entrances — the group crosses together at one point agreed beforehand.",
             "A trundle wheel takes eyes down to the ground — whoever is wheeling has a partner watching ahead for them."],
 'PR-FN10': ["Moving water — nobody enters it, at all, and every measurement is taken from a bridge or a fenced bank.",
             "The water's edge is the one place a slip is serious — one adult per three students at the edge, and the floats are thrown rather than placed.",
             "River water carries bacteria including leptospirosis — no hands in the water, cuts covered, hands washed before anybody eats.",
             "Leaning over a bridge parapet to watch a float — the metre stick is used to point rather than to reach, and nobody climbs the rail."],
 'PR-FN11': ["Dried spaghetti snaps under load and the pieces fly at eye height — eye protection on everybody before the first mass goes on, not just the person loading.",
             "The tower collapses onto the hand holding the basket — the masses are added with the hand underneath, and everybody stands back at the last few.",
             "Broken spaghetti on a hard floor is a slip hazard — it is swept up before anyone walks through, not after."],
 'PR-FN12': ["Dropping from a stepladder — one adult on the ladder, nobody else on it, and it is the adult who drops while the student times from the floor.",
             "A stairwell or a landing without a rail is a fall — the drop is made from a landing with a rail or from the ladder, never leaning over an open drop.",
             "Somebody walking underneath at the moment of the drop — the landing area is called before each drop."],
 'PR-FN13': ["Nothing is drunk, at any point — the layers look like a drink and are said out loud not to be before the first pour.",
             "Oil on a hard floor is the worst slip hazard in this set — it is poured over a tray and any spill is cleaned with detergent, not just wiped.",
             "A tall glass jar tips and breaks — a plastic cylinder with anyone younger, and it stands at the back of the table.",
             "A ping-pong ball or a grape is a choking hazard for a small child — they stay in the jar."],

 # ---------- THE HOME EXPERIMENTS, WHERE THE RISK ASSESSMENT MATTERS MOST -------------------------
 # No technician, no fume cupboard, somebody else's kitchen, and a parent who has agreed to
 # something in writing. These are the rows a tutor actually reads before ringing the doorbell.
 'PR-HM01': ["6% hydrogen peroxide irritates skin and burns eyes — goggles and nitrile gloves on both of you before the bottle is opened, and the tutor does the pouring.",
             "A stronger peroxide is a different experiment — 12% and 40 vol are never substituted, whatever is in the cupboard, and the bottle is checked before leaving home.",
             "The foam comes out fast and hot and carries peroxide with it — the bottle stands in a washing-up bowl and both of you stand back once the yeast goes in.",
             "Foam on somebody's floor — the whole thing runs in a deep tray, and what is left is soapy water and oxygen, so a cloth clears it."],
 'PR-HM02': ["Boiling water to draw the colour out is the tutor's job and nobody else's — the student is at the table, not at the kettle.",
             "Household chemicals that are not food — no oven cleaner, no drain cleaner, no bleach, and this is agreed with the parent before anything comes out of the cupboard.",
             "Bleach and vinegar together give off chlorine — the reason bleach is not on the list is said out loud rather than left implied.",
             "Hot cabbage water in a glass tube cracks it — it is left to cool before it is poured into anything."],
 'PR-HM03': ["A lit skewer near a test tube of hydrogen — the tutor holds the flame, the student stands back, and one test tube of gas is collected and no more.",
             "The flame goes near the jar the electrolysis is running in — the tube is carried away from the jar before it is lit.",
             "Hydrogen collecting in an enclosed kitchen — a window is opened before the battery is connected.",
             "Pencils sharpened at both ends are two points — they are carried in a pot, not in a pocket."],
 'PR-HM04': ["Burning steel wool throws sparks — OUTDOORS ONLY, on a metal baking tray, never on grass, decking or a worktop, and a bowl of water stands beside it.",
             "Sparks at eye height — goggles on, and both of you standing back once it is lit.",
             "The residue looks cold and is not — it cools on the tray until it can be touched with the back of a hand, and the tray is not moved before then.",
             "Wire wool and a battery in the same drawer can ignite on their own — they are stored apart, and this is said to the parent rather than assumed."],
 'PR-HM05': ["Hot water is the tutor's to pour — the student reads the thermometer and starts the stopwatch.",
             "Effervescent tablets are food and swallowing one is not a hazard, which is worth saying so nobody panics — but the run with hot water is not drunk."],
 'PR-HM06': ["Nothing beyond ordinary kitchen care — the one thing to set is that the evaporating dish goes on a heatproof surface and is left to dry on its own rather than being heated.",
             "Play sand is dusty and gets in eyes — it is poured slowly and the bag is closed between runs.",
             "A cut-down plastic bottle has a sharp edge — the tutor does the cutting and tapes the rim."],
 'PR-HM07': ["The craft knife is the tutor's and stays with the tutor — the student marks where the hole goes and the tutor cuts it.",
             "A magnifying glass left in sunlight on a windowsill starts a fire — it goes back in the box the moment the projector is finished with.",
             "The shoebox is taped shut around a phone — the phone comes out before the box is put away, so nobody goes looking for it later."],
 'PR-HM08': ["A spinning off-centre weight catches hair and loose sleeves — hair tied back and sleeves up before the battery goes in.",
             "The bot runs off the table and falls — it runs on a large sheet of paper on the floor, not on a table.",
             "Felt-tips on somebody else's carpet — the paper is bigger than the bot can travel in the time, and the floor under it is checked first."],
 'PR-HM09': ["Standing near a live road — both of you stay on the pavement, well back from the kerb, for the whole session, and this is agreed with the parent beforehand.",
             "Pointing a phone at a driver reads as filming and gets a reaction — nothing is pointed at a vehicle or a person, and the stopwatch is held low.",
             "A student watching a stopwatch is not watching the road — the tutor watches the traffic and the student watches the watch.",
             "A quiet residential street only — no main road, no junction, and no measuring from a central island."],
 'PR-HM10': ["None — the only rule is that nobody taps the glass, which is for the fish rather than for the student.",
             "A tank of water and a plug socket in the same corner — nothing is moved or unplugged, and the observation is done from a chair."],
}

# ---------- THE VOLCANO ---------------------------------------------------------------------------
# ASKED FOR BY NAME. It is the bicarbonate-and-vinegar volcano, which is a carbonate and an acid
# giving carbon dioxide — so it belongs with `Chemical Changes` and `Rate of Reaction`, both of
# which `data/topics.json` already carries, and the variable that makes it an EXPERIMENT rather than
# a demonstration is the ratio of the two, which is `Writing & Simplifying Ratio`.
#
# `wow: high` AND `Worth opening a session with` IS THE POINT OF IT. Its own note says the honest
# thing: the eruption is the hook and the measurement is the lesson, and a session that stops at the
# eruption has done a magic trick rather than an experiment.
VOLCANO = {
 "practical_id": "PR-HM11",
 "name": "Volcano — bicarbonate and vinegar",
 "subject": "Chemistry",
 "level": "GCSE",
 "exam_board": "",
 "spec_ref": "",
 "compliance": "Not assessed — enrichment",
 "aim": "Build a volcano, then stop treating it as a trick and find the mixture that gives the biggest eruption.",
 "outcome": "A graph of foam height against the amount of bicarbonate, and the point where adding more stops making any difference.",
 "venue": "home",
 "feasible": "yes, with kit",
 "group_size": 1,
 "minutes": 40,
 "safety": "Vinegar stings eyes — goggles on both of you before the first pour. Everything runs in a tray. Nothing here is drunk, and the washing-up liquid is what makes that worth saying.",
 "maths_link": "Ratio of acid to carbonate; reading a value off a graph where it levels off; percentage increase between runs.",
 "item_ids": "",
 "notes": "THE ERUPTION IS THE HOOK AND THE MEASUREMENT IS THE LESSON. A session that stops at the first eruption has done a magic trick. The second run is where the science is: same bottle, same vinegar, twice the bicarbonate — and then the run where twice as much changes nothing, because the vinegar has run out. That is the limiting reactant, met before it is ever called that. | Build the cone out of foil and a bottle rather than papier-mâché: papier-mâché takes a week to dry and the session is 40 minutes. | The cheapest way to get a repeatable measurement is to stand a ruler in the tray behind the bottle and film it on a phone, then scrub back to the tallest frame.",
 "active": True,
 "sort_order": 600,
 "topics": "Chemical Changes, Rate of Reaction, Writing & Simplifying Ratio, Units & Measures",
 "equipment": "Bicarbonate of soda, a 200 g tub | White vinegar, a 1 litre bottle | Empty 500 ml plastic bottle with a narrow neck | Kitchen foil, to build the cone round the bottle | Washing-up liquid, one squeeze a run | Red food colouring | Measuring spoons and a measuring jug | Digital kitchen scale | 30 cm ruler, stood in the tray as a scale | Deep tray or washing-up bowl | Safety goggles | A phone, to film the eruption",
 "steps": "Stand the bottle in the tray and build the foil cone round it, leaving the neck clear. | Stand the ruler in the tray behind the bottle so every run is filmed against the same scale. | Put one level teaspoon of bicarbonate of soda into the bottle, then a squeeze of washing-up liquid and a few drops of colouring. | Measure 50 ml of vinegar. Start filming, pour it in and stand back. | Scrub back through the film to the tallest frame and read the height off the ruler. | Rinse the bottle out and repeat with two teaspoons, then three, then four — same 50 ml of vinegar every time. | Plot foam height against teaspoons of bicarbonate. | Find where the line stops climbing, and work out what has run out.",
 "age_min": 6,
 "hazard": "very low",
 "wow": "high",
 "science": "Bicarbonate of soda is a carbonate and vinegar is an acid, and an acid on a carbonate always gives a salt, water and carbon dioxide. The gas is what erupts; the washing-up liquid traps it as foam so you can see how much there was, which is the only reason it is in the recipe. Adding more bicarbonate makes more gas until the vinegar runs out — after that the extra powder sits in the bottom of the bottle and the eruption stops growing. That is a limiting reactant, and it is visible here without anybody naming it first.",
 "log": "Teaspoons of bicarbonate against foam height in cm, read off the ruler in the film | How long the eruption lasted | The run where more bicarbonate stopped making a difference | What is left in the bottle afterwards on the biggest run",
 "variables": "How much bicarbonate of soda | How much vinegar | The temperature of the vinegar | How wide the bottle neck is | How much washing-up liquid",
 "cost_per_run_gbp": 0.4,
 "setup_cost_gbp": 7.5,
 "excluded_reason": "",
 "reconsider_at_age": None,
}

def main():
    raw = io.open(DATA, encoding='utf-8').read().rstrip('\n').split('\n')
    assert raw[0].strip() == '[', 'line 1 is not a bare ['
    assert raw[-1].strip() == ']', 'the file does not end with a bare ]'
    rows = [json.loads(l.rstrip(',')) for l in raw[1:-1]]

    have = {r['practical_id'] for r in rows}
    if VOLCANO['practical_id'] in have:
        rows = [r for r in rows if r['practical_id'] != VOLCANO['practical_id']]
    rows.append(dict(VOLCANO))
    RISKS[VOLCANO['practical_id']] = [
        "Vinegar in the eyes stings badly and this one erupts upwards — goggles on both of you before the first pour, not after the first surprise.",
        "Foam over somebody else's kitchen floor — the bottle stands in a deep tray for every run, including the ones you think will be small.",
        "It looks exactly like a drink and there is washing-up liquid in it — say out loud that nothing here is tasted, before the colouring goes in.",
        "Rinsing between runs means a wet bottle and a wet hand near a phone that is filming — the phone is propped up, not held.",
    ]

    # ---------- WRITTEN ONLY WHERE THERE IS ONE, AND COUNTED WHERE THERE IS NOT -------------------
    wrote, blank, refused = 0, [], 0
    for r in rows:
        rid = r['practical_id']
        if r.get('excluded_reason'):
            # A REFUSED EXPERIMENT CARRIES NO METHOD, BY RULE — see check-practicals.js — and a risk
            # assessment for something nobody is going to run is the same invention as a method for
            # it. `risks` is present and empty so the column exists on every row.
            r['risks'] = ''
            refused += 1
            continue
        items = RISKS.get(rid)
        if not items:
            r['risks'] = ''
            blank.append(rid)
            continue
        for it in items:
            assert '|' not in it, rid + ' has a pipe inside one risk'
            assert it.strip() == it and it, rid + ' has an empty or padded risk'
        r['risks'] = ' | '.join(items)
        wrote += 1

    rows.sort(key=lambda r: (float(r.get('sort_order') or 0), r['practical_id']))
    out = io.open(DATA, 'w', encoding='utf-8')
    out.write('[\n')
    for i, r in enumerate(rows):
        out.write(json.dumps(r, ensure_ascii=False) + (',' if i < len(rows) - 1 else '') + '\n')
    out.write(']\n')
    out.close()

    print('practicals: %d rows' % len(rows))
    print('risk assessments written: %d' % wrote)
    print('refused experiments, correctly given none: %d' % refused)
    print('live rows still with no risk assessment: %d%s'
          % (len(blank), (' — ' + ', '.join(blank)) if blank else ''))

main()
