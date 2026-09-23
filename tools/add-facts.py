#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@family. — tools/add-facts.py

FOUR HUNDRED FACTS, AND THE FIFTY-EIGHT THAT WERE THERE ARE THE REASON THIS IS A TOOL.

ASKED FOR AS "have you added the other many interstting facts? i asked for 400 last night". They
were not there: `data/settings/facts.json` held 58, and `FEED_FACTS` in js/chess.js held the same
58 plus the two clips. So this writes the rest.

WHICH FILE IS THE LIVE ONE, because it is not the obvious one. `factsNow_` prefers `DATA.facts`
and falls through to `FEED_FACTS` only when the sheet has nothing — and `settingsInto_` fills
`DATA.facts` from `data/settings/facts.json`, which has rows. So a fact added to the JavaScript
list alone would never be seen. The file is the source; `FEED_FACTS` is the floor for a phone whose
data files did not arrive, which is `libraryExtras_`'s rule in the other direction and is written
down in chess.js so nobody has to rediscover it.

WHAT A ROW HAS TO BE, and every rule is a fault that happened or would have:

  IT HAS TO BE TRUE.        This is a tutoring business's app, read by children. A wrong fact told
                            confidently is worse than no fact, and it is the same argument this
                            repository makes about a mark scheme read by eye and about a renderer
                            that printed "not drawn yet" off the wrong column. Where a number is
                            approximate it says so in the words rather than being rounded silently.
  THE HEADING IS THE FACT.  `.feed-head` takes the space and `.feed-body` is small: a heading that
                            is a teaser with the answer underneath makes a card you have to work
                            for. The body says WHY — the mechanism, the number, what it means.
  THE PICTURE IS A SEARCH.  `pic` is handed to Commons. Two or three ordinary words that name the
                            SUBJECT rather than the sentence: "sun solar corona", not "light takes
                            eight minutes".
  NO COMMAS IN A SUBJECT.   Nothing splits `subject`, but every other list column in this app does,
                            and a subject with a comma in it is one rename away from being two.

IDEMPOTENT ON THE HEADING. Run it twice and the second run writes nothing — a row already in the
file is skipped by its heading, so a batch can be added to and re-run without the ids shifting or
the facts doubling. That is the rule `tools/add-aqa-8464-2406-higher.py` records for the papers.
"""
import io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.join(HERE, '..', 'data', 'settings', 'facts.json')

# ---------- THE CLOSED LIST -----------------------------------------------------------------------
# `feedColours` hashes whatever word it is given, so a new subject costs nothing and gets its own
# pair of colours — which is exactly why a list is needed: nothing anywhere would notice `Sport`
# beside `Sports`, and the funnel's own `spellKey_` lesson is that two spellings of one answer are
# two buttons. Six were added for four hundred facts; the other sixteen were already in use.
SUBJECTS = [
    'Animals', 'Body', 'Buildings', 'Earth', 'Everyday', 'Food', 'History', 'Language', 'Making',
    'Maths', 'Money', 'Music', 'Nature', 'Oddities', 'People', 'Science', 'Sea', 'Space', 'Sport',
    'Study', 'Tech', 'Weather',
]

ROWS = []


def fact(subject, heading, body, pic):
    assert subject in SUBJECTS, 'subject not on the list: ' + subject
    for name, v, lo, hi in (('heading', heading, 12, 78), ('body', body, 40, 240),
                            ('pic', pic, 3, 60)):
        assert isinstance(v, str) and lo <= len(v) <= hi, \
            '%s is %d characters on %r' % (name, len(v or ''), heading)
    assert ',' not in subject
    assert not heading.endswith('.'), 'a heading is not a sentence: ' + heading
    assert body.endswith(('.', '!', '?')), 'the body is prose and ends like it: ' + heading
    assert '<' not in body and '<' not in heading, 'no markup in a fact: ' + heading
    ROWS.append({'subject': subject, 'heading': heading, 'body': body, 'pic': pic})


def main():
    src = io.open(FILE, encoding='utf-8').read()
    have = json.loads(src)
    seen = {r['heading'].strip().lower() for r in have}
    used = {r['fact_id'] for r in have}

    n = max([int(re.sub(r'\D', '', r['fact_id']) or 0) for r in have] or [0])
    add, dup = [], 0
    for r in ROWS:
        if r['heading'].strip().lower() in seen:
            dup += 1
            continue
        seen.add(r['heading'].strip().lower())
        n += 1
        fid = 'F%03d' % n
        assert fid not in used, 'id already taken: ' + fid
        used.add(fid)
        add.append({'fact_id': fid, 'subject': r['subject'], 'heading': r['heading'],
                    'body': r['body'], 'pic': r['pic'], 'active': True,
                    'sort_order': '', 'notes': ''})

    # ---------- ONE OBJECT PER LINE, WHICH IS THIS REPOSITORY'S SHAPE FOR A DATA FILE -------------
    # `data/questions.json` is written this way and its note says why: the next script to append by
    # splitting on newlines, and a diff that names the rows that changed rather than the file.
    if add:
        lines = [json.dumps(r, ensure_ascii=False) for r in have + add]
        io.open(FILE, 'w', encoding='utf-8').write('[\n' + ',\n'.join(lines) + '\n]\n')

    kinds = {}
    for r in have + add:
        kinds[r['subject']] = kinds.get(r['subject'], 0) + 1
    print('facts: %d were there, %d written, %d already present by heading -> %d'
          % (len(have), len(add), dup, len(have) + len(add)))
    print('  ' + ' · '.join('%s %d' % (k, kinds[k]) for k in sorted(kinds)))
    empty = [k for k in SUBJECTS if k not in kinds]
    if empty:
        print('  no facts yet: ' + ', '.join(empty))


# ==================================================================================================
# SPACE
# ==================================================================================================
fact('Space', 'A day on Venus is longer than its year',
     'Venus turns once every 243 Earth days and goes round the Sun in 225. It also turns backwards, so the Sun there rises in the west.',
     'venus planet surface')
fact('Space', 'Saturn would float in a big enough bath',
     'Its average density is about 0.69 grams per cubic centimetre and water is 1.00. It is a ball of hydrogen and helium with no solid surface to stand on.',
     'saturn rings cassini')
fact('Space', 'There are more trees on Earth than stars in the Milky Way',
     'About three trillion trees against an estimated 100 to 400 billion stars. Both numbers are estimates, and they are not close enough for the comparison to be in doubt.',
     'forest canopy from above')
fact('Space', 'Footprints on the Moon will outlast every building on Earth',
     'There is no wind and no rain to move the dust. Only the slow rain of micrometeorites erodes them, over millions of years.',
     'apollo boot print moon')
fact('Space', 'Jupiter has a storm that has been running for centuries',
     'The Great Red Spot has been watched since at least 1831 and probably since the 1660s. It is shrinking: it was twice as wide a hundred years ago.',
     'jupiter great red spot')
fact('Space', 'The International Space Station sees sixteen sunrises a day',
     'It orbits at about 28,000 km/h and goes round the Earth every 90 minutes. Crews keep to Greenwich Mean Time so that meals and sleep still make sense.',
     'international space station orbit')
fact('Space', 'Space is silent because there is nothing to shake',
     'Sound is a pressure wave in a material. With almost no particles between them, two astronauts a metre apart could shout and hear nothing.',
     'astronaut spacewalk')
fact('Space', 'A teaspoon of neutron star would weigh about a billion tonnes',
     'A star heavier than the Sun is crushed into a ball the width of a city, so its atoms collapse into neutrons packed like an atomic nucleus.',
     'neutron star illustration')
fact('Space', 'Olympus Mons is nearly three times the height of Everest',
     'The Martian volcano stands about 22 km above the surrounding plains. Mars has no moving tectonic plates, so a volcano sits over its hot spot and keeps growing.',
     'olympus mons mars')
fact('Space', 'The Moon is drifting away at about the speed a fingernail grows',
     '3.8 cm a year, measured by bouncing lasers off mirrors the Apollo crews left behind. Tides are slowing the Earth and the Moon takes the energy.',
     'lunar laser ranging retroreflector')
fact('Space', 'Most of the Solar System is Sun',
     'The Sun holds about 99.86% of all the mass in it. Jupiter is most of what is left, and everything else — planets, moons, asteroids — shares the remainder.',
     'sun photosphere')
fact('Space', 'Light from the nearest star takes over four years to get here',
     'Proxima Centauri is 4.24 light years away. A car at motorway speed would need about fifty million years to make the trip.',
     'proxima centauri star')
fact('Space', 'Astronauts get taller in orbit',
     'Without gravity compressing the spine the discs between the vertebrae expand, adding up to 5 cm. It goes back within days of landing, often with backache.',
     'astronaut floating iss')
fact('Space', 'Mercury has ice, thirty million miles from the Sun',
     'Craters at its poles never see sunlight, so their floors stay below −170 degrees Celsius and hold water ice while the day side reaches 430.',
     'mercury polar craters messenger')
fact('Space', 'Every atom heavier than iron was made in a dying star',
     'Fusion in a star stops paying at iron. The gold in a ring and the iodine in your thyroid were forged in a supernova or a collision of neutron stars.',
     'supernova remnant')
fact('Space', 'Voyager 1 is carrying a record nobody can play without instructions',
     'A gold-plated copper disc with sounds and pictures from Earth, plus a diagram showing how to spin it. It is now over 24 billion km away and still answering.',
     'voyager golden record')
fact('Space', 'Halley’s Comet comes back about every 76 years',
     'It was last here in 1986 and is due in 2061. Most people get one chance at it, which is why every return is written down somewhere.',
     'halley comet 1986')
fact('Space', 'The Sun makes a Hiroshima bomb of energy every millionth of a second',
     'Fusion in the core turns about four million tonnes of mass into energy every second. It has been doing it for 4.6 billion years and is roughly halfway through.',
     'solar flare sun')


# ==================================================================================================
# ANIMALS
# ==================================================================================================
fact('Animals', 'An octopus has three hearts and blue blood',
     'Two hearts pump blood through the gills and one through the body. The blue comes from haemocyanin, which carries oxygen with copper where our blood uses iron.',
     'octopus vulgaris')
fact('Animals', 'A shrimp can punch hard enough to boil water',
     'The mantis shrimp’s club accelerates like a bullet. The water behind it briefly vaporises into a bubble that collapses with a flash of light and a bang.',
     'mantis shrimp')
fact('Animals', 'Wombats produce cube-shaped droppings',
     'The last part of the intestine has stiff and stretchy sections that shape the pellets. Cubes do not roll away, which matters if you mark territory with them.',
     'wombat australia')
fact('Animals', 'A tardigrade has survived being fired into open space',
     'Dried out, it pulls in its legs and stops almost all chemistry. Samples flown on a 2007 mission came back alive after ten days of vacuum and raw sunlight.',
     'tardigrade microscope')
fact('Animals', 'Elephants cannot jump',
     'Every other land mammal can get all four feet off the ground. An elephant’s legs are built as columns for carrying weight, with no springy tendon to push off with.',
     'african elephant')
fact('Animals', 'A honeybee visits about two million flowers for one jar of honey',
     'A worker makes a twelfth of a teaspoon in her whole life. The hive flies the equivalent of twice round the world for a 450 gram jar.',
     'honeybee on flower')
fact('Animals', 'Crows can recognise individual human faces and hold a grudge',
     'Researchers in Seattle wore masks to trap crows, and birds scolded that mask for years. Birds that were never trapped learned to scold it too.',
     'american crow')
fact('Animals', 'A sloth can take a month to digest one leaf',
     'Its stomach has four chambers and its body runs cool to save energy. Two thirds of a well-fed sloth’s weight can be the contents of its gut.',
     'three toed sloth')
fact('Animals', 'The Greenland shark can live for four hundred years',
     'Radiocarbon dating of the lens of the eye gave one female an estimated age near 392. They do not breed until about 150 years old.',
     'greenland shark')
fact('Animals', 'A group of flamingos is called a flamboyance',
     'The pink is not theirs. They eat algae and brine shrimp full of carotenoids, and a flamingo fed a plain diet fades to white.',
     'flamingo flock')
fact('Animals', 'Cats cannot taste sweetness',
     'The gene for one half of the sweet receptor is broken in every cat studied, from the house cat to the tiger. A pure carnivore has no use for it.',
     'domestic cat')
fact('Animals', 'A hummingbird’s heart beats over 1,200 times a minute in flight',
     'It has to eat roughly its own body weight in nectar every day, and at night it can drop into torpor with its heart at fifty beats a minute to survive.',
     'hummingbird in flight')
fact('Animals', 'Axolotls regrow legs, jaws and parts of the brain',
     'They also stay larval for life, keeping feathery gills instead of turning into land salamanders. In the wild they survive in one lake system in Mexico City.',
     'axolotl')
fact('Animals', 'The blue whale’s call is louder than a jet engine',
     'Up to 188 decibels, and low enough that it carries for hundreds of kilometres through deep water. The animal is the largest that has ever lived.',
     'blue whale')
fact('Animals', 'A snail can have thousands of teeth',
     'They sit on a ribbon called a radula which it scrapes across surfaces like a file. A limpet’s teeth are the strongest natural material yet measured.',
     'garden snail radula')
fact('Animals', 'Reindeer eyes change colour with the season',
     'A layer behind the retina is gold in the Arctic summer and deep blue in winter, scattering light back through the retina so the eye catches more of it.',
     'reindeer arctic')
fact('Animals', 'Emperor penguin fathers go four months without eating',
     'He balances the egg on his feet through the Antarctic winter, huddling in a crowd that slowly rotates so nobody is on the windward edge for long.',
     'emperor penguin huddle')
fact('Animals', 'A pistol shrimp snaps its claw and stuns fish with the bubble',
     'The claw shuts in under a millisecond. The jet of water it fires creates a cavitation bubble that collapses at thousands of degrees for a fraction of a second.',
     'pistol shrimp')
fact('Animals', 'Ants do not have lungs',
     'They breathe through holes along the body called spiracles, connected to tubes that carry air straight to the tissues. It works beautifully and only at small sizes.',
     'ant macro')


# ==================================================================================================
# MATHS
# ==================================================================================================
fact('Maths', 'In a room of 23 people it is more likely than not that two share a birthday',
     'There are 253 possible pairs, not 23, and each pair is a chance. At 70 people it is 99.9%. Our intuition compares everybody to ourselves instead.',
     'birthday cake candles')
fact('Maths', 'A piece of paper folded 42 times would reach the Moon',
     'Each fold doubles the thickness, and 0.1 mm doubled 42 times is about 440,000 km. You cannot actually do it: the record is twelve folds.',
     'folded paper')
fact('Maths', 'There are more ways to shuffle a deck than there are atoms on Earth',
     '52 factorial is about 8 followed by 67 zeros. A well-shuffled deck has almost certainly never existed in that order before.',
     'playing cards deck')
fact('Maths', 'Zero took a long time to be a number',
     'Babylonians used a gap, Greeks argued about whether nothing could be something, and the symbol arrived from India via the Islamic world around the 9th century.',
     'brahmi numerals manuscript')
fact('Maths', 'Pi has been calculated to over a hundred trillion digits and NASA uses fifteen',
     'Fifteen decimal places are enough to work out the circumference of the Solar System to within the width of a finger.',
     'pi symbol')
fact('Maths', 'A Mobius strip has one side and one edge',
     'Give a paper strip a half twist and glue the ends. Draw a line down the middle and you return to the start having covered what looked like both faces.',
     'mobius strip')
fact('Maths', 'Doubling a rice grain per chessboard square needs more rice than exists',
     'The 64th square alone is 9.2 million trillion grains. The whole board comes to about a thousand times the world’s annual rice crop.',
     'chessboard rice grains')
fact('Maths', 'The Fibonacci numbers show up in pine cones and sunflowers',
     'Each number is the sum of the two before it. Seeds packed at the angle those numbers give leave the fewest gaps, so plants that do it fit more in.',
     'sunflower seed spiral')
fact('Maths', 'Seventy per cent of numbers starting with 1 is normal, not suspicious',
     'Benford’s law: in many real data sets the leading digit is 1 about 30% of the time and 9 about 5%. Tax offices use it to spot invented figures.',
     'accounting ledger numbers')
fact('Maths', 'A four-colour map is always enough',
     'No map of countries needs more than four colours for no two neighbours to match. Proved in 1976, and the first famous proof that needed a computer.',
     'political map four colours')
fact('Maths', 'There is no biggest prime number',
     'Euclid proved it around 300 BC in a few lines: multiply any finite list of primes together and add one, and you have a number none of them divides.',
     'euclid elements manuscript')
fact('Maths', 'A circle is the shape that holds the most for the least edge',
     'For a fixed perimeter nothing encloses more area. It is why a soap bubble is round, and why a cold animal curls up.',
     'soap bubble')
fact('Maths', 'Your chances improve if you switch doors',
     'The Monty Hall problem: pick one of three doors, the host opens a losing one, and switching wins two times in three. Almost everyone refuses to believe it.',
     'game show doors')
fact('Maths', 'Roman numerals have no zero and no place value',
     'That is why long division in Rome was a specialist job. The Hindu-Arabic system we use puts the value in the position, so a clerk can do it with a pen.',
     'roman numerals inscription')
fact('Maths', 'The word algebra comes from an Arabic book title',
     'Al-Khwarizmi’s 9th-century Kitab al-jabr. Al-jabr means restoring — moving a subtracted term to the other side. His name gave us the word algorithm.',
     'al-khwarizmi statue')
fact('Maths', 'A googol is bigger than the number of atoms in the observable universe',
     'A googol is 1 followed by 100 zeros; the atom count is nearer 1 followed by 80. A nine-year-old named it, and a search engine misspelled it.',
     'blackboard large numbers')
fact('Maths', 'Two people in London almost certainly have exactly the same number of hairs',
     'A head carries up to about 150,000 hairs and the city holds nine million people. More people than possible hair counts means at least two must match.',
     'crowd of people london')
fact('Maths', 'The equals sign was invented to save writing',
     'Robert Recorde put two parallel lines in a book in 1557, because, he wrote, no two things can be more equal. Before that people wrote it out in words.',
     'robert recorde whetstone of witte')


# ==================================================================================================
# BODY
# ==================================================================================================
fact('Body', 'Your stomach lining is replaced every few days',
     'It has to be: the acid in there is strong enough to dissolve metal. The cells that make the protective mucus are among the fastest-renewing in the body.',
     'stomach anatomy illustration')
fact('Body', 'Bone is stronger than concrete for its weight',
     'A cubic inch of bone can take about 8,600 kg in compression. It is also alive, rebuilding itself along the lines where it is loaded most.',
     'human femur bone')
fact('Body', 'You have about 100,000 km of blood vessels',
     'Mostly capillaries thin enough that red cells pass in single file. Laid end to end they would go round the Earth twice.',
     'capillary network micrograph')
fact('Body', 'The eye has a blind spot and the brain paints over it',
     'Where the optic nerve leaves the retina there are no light receptors at all. What you see there is the brain’s best guess from the surroundings.',
     'human retina optic disc')
fact('Body', 'Goosebumps are a leftover from having fur',
     'Tiny muscles pull each hair upright to trap air and make an animal look bigger. On a nearly hairless body it achieves almost nothing.',
     'goosebumps skin')
fact('Body', 'Half the cells you carry are not yours',
     'Roughly as many bacterial cells as human ones, mostly in the large intestine. They weigh about the same as the brain and help digest what we cannot.',
     'gut bacteria micrograph')
fact('Body', 'A baby is born with about 300 bones and ends up with 206',
     'Many start as separate pieces of cartilage and fuse as they grow. The skull plates stay separate at birth so the head can squeeze through.',
     'newborn baby feet')
fact('Body', 'Your nose remaps smells while you sleep',
     'Smell is the only sense that does not route through the thalamus on its way to consciousness, which is part of why a smell can return a memory so quickly.',
     'olfactory bulb anatomy')
fact('Body', 'Fingerprints are not unique to humans',
     'Koalas have prints so similar to ours that they have confused forensic examiners. Both species climb and grip, and the ridges probably help with touch.',
     'koala paw')
fact('Body', 'You cannot tickle yourself',
     'The cerebellum predicts the sensation from your own movement and cancels it out. That prediction is how you can hold a cup without watching your hand.',
     'cerebellum brain anatomy')
fact('Body', 'Your heart beats about 100,000 times a day',
     'Around 2.5 billion times in an average life, moving roughly 7,500 litres of blood every 24 hours without ever taking a rest day.',
     'human heart anatomy')
fact('Body', 'The strongest muscle for its size is in your jaw',
     'The masseter can close the back teeth with a force over 90 kg. The strongest by total force is the gluteus maximus, which is why you can climb stairs.',
     'human jaw muscles anatomy')
fact('Body', 'Bruises change colour as your body takes the blood apart',
     'Haemoglobin breaks down into biliverdin, which is green, then bilirubin, which is yellow. The colour tells you roughly how old the bruise is.',
     'bruise skin')
fact('Body', 'You make about a litre and a half of saliva a day',
     'It starts digestion before food reaches the stomach: the enzyme amylase in it begins breaking starch into sugar while you are still chewing.',
     'salivary glands anatomy')
fact('Body', 'Your sense of balance lives in three loops of fluid in each ear',
     'The semicircular canals sit at right angles to each other, so they can tell nodding from shaking from tilting. Spinning leaves the fluid moving after you stop.',
     'inner ear semicircular canals')
fact('Body', 'The cornea has no blood supply',
     'It takes oxygen straight from the air, which is why a cornea can be transplanted with very little risk of rejection — there is no blood to carry the attack.',
     'human eye cornea')
fact('Body', 'Adults have about 5 litres of blood and give away under a tenth of it',
     'A blood donation is 470 ml. The plasma is back within a day and the red cells within a few weeks, which is why you can give every three or four months.',
     'blood donation bag')


# ==================================================================================================
# HISTORY
# ==================================================================================================
fact('History', 'Oxford University is older than the Aztec Empire',
     'Teaching at Oxford is recorded from 1096. Tenochtitlan was founded in 1325, more than two centuries later.',
     'oxford university bodleian')
fact('History', 'Cleopatra lived closer to the Moon landing than to the pyramids',
     'The Great Pyramid was already 2,500 years old in her lifetime. Apollo 11 was about 2,000 years after it.',
     'cleopatra relief egypt')
fact('History', 'The shortest war in history lasted under an hour',
     'Britain against Zanzibar, 27 August 1896. Estimates run from 38 to 45 minutes, and the Sultan’s palace was in ruins before lunch.',
     'zanzibar palace 1896')
fact('History', 'The Great Fire of London killed officially six people',
     'It destroyed 13,200 houses and 87 churches. The low death toll is partly record-keeping: the poor were not always counted.',
     'great fire of london painting')
fact('History', 'Napoleon was not short',
     'He was about 5 feet 7 in modern measure, average for a Frenchman of his day. The confusion is French inches, which were longer than English ones.',
     'napoleon bonaparte portrait')
fact('History', 'Vikings did not wear horned helmets',
     'No horned helmet has ever been found in a Viking grave. The image comes from a costume designer for a Wagner opera in 1876.',
     'viking helmet gjermundbu')
fact('History', 'The first computer programmer wrote her programs before the computer existed',
     'Ada Lovelace published an algorithm for Babbage’s Analytical Engine in 1843. The machine was never finished in her lifetime.',
     'ada lovelace portrait')
fact('History', 'Ketchup was sold as medicine in the 1830s',
     'An Ohio doctor claimed tomato pills cured indigestion and jaundice. The trade collapsed when competitors sold pills with no tomato in them at all.',
     'vintage tomato ketchup advert')
fact('History', 'The Tower of Pisa was leaning before it was finished',
     'Building stopped for nearly a century after the third floor because of war. The pause let the ground settle, which is probably why it is still standing.',
     'leaning tower of pisa')
fact('History', 'Wartime Britain invented a cover story about carrots',
     'The story that carrots gave RAF pilots night vision helped hide the existence of airborne radar. Carrots do contain vitamin A, which the eye genuinely needs.',
     'wartime carrot poster')
fact('History', 'The Rosetta Stone is a tax decree',
     'It repeats the same priestly decree in Greek, demotic and hieroglyphs. Comparing them is what let Champollion read hieroglyphs again after 1,400 years.',
     'rosetta stone british museum')
fact('History', 'The Statue of Liberty arrived in 350 pieces',
     'It came from France in 214 crates in 1885 and took four months to assemble. The copper skin is about the thickness of two pennies.',
     'statue of liberty construction')
fact('History', 'Postboxes in Britain were once green',
     'They were painted green until 1874, then repainted red over about a decade because people kept walking into them.',
     'victorian pillar box')
fact('History', 'Harvard was founded before calculus was invented',
     'Harvard dates from 1636; Newton and Leibniz developed calculus in the 1660s and 1670s. The first students learned Latin, Greek and theology.',
     'harvard yard old building')
fact('History', 'The Black Death moved about as fast as a person could walk',
     'It crossed Europe in roughly four years from 1347. Fleas travelled on rats, and rats travelled on carts and ships at human pace.',
     'medieval plague illustration')
fact('History', 'The word salary comes from salt',
     'Roman soldiers received an allowance connected with salt, called salarium. Salt was the only practical way to keep meat before refrigeration.',
     'roman salt pans')
fact('History', 'A Roman legionary carried about 30 kg on the march',
     'Armour, shield, two javelins, a sword, a saw, a basket, a cooking pot and rations for days. They were nicknamed Marius’ mules for it.',
     'roman legionary reenactment')
fact('History', 'The first email was sent in 1971 and nobody remembers what it said',
     'Ray Tomlinson sent it between two computers side by side, and later said the text was probably QWERTYUIOP. He chose @ because it was not in anyone’s name.',
     'pdp-10 computer')


# ==================================================================================================
# EARTH AND SEA
# ==================================================================================================
fact('Earth', 'The deepest hole ever drilled got a third of the way through the crust',
     'The Kola Superdeep Borehole reached 12.26 km in 1989 and stopped because the rock was 180 degrees Celsius and behaving like plastic.',
     'kola superdeep borehole')
fact('Earth', 'Mount Everest grows about 4 mm a year',
     'India is still pushing into Asia at roughly 5 cm a year. Earthquakes can knock the summit down a little, and the 2015 Nepal quake did.',
     'mount everest summit')
fact('Earth', 'The Sahara was green within human history',
     'Until about 5,000 years ago it held lakes, hippos and cattle herders. Rock paintings deep in the desert show people swimming.',
     'tassili n ajjer rock art')
fact('Earth', 'There is a lake under Antarctica that has been sealed for millions of years',
     'Lake Vostok lies under 4 km of ice, kept liquid by pressure and the heat of the rock below. It is about the size of Lake Ontario.',
     'lake vostok antarctica')
fact('Earth', 'Iceland is getting wider',
     'The Mid-Atlantic Ridge runs straight through it, so the two halves of the island are pulling apart by about 2 cm a year. You can walk down the gap at Thingvellir.',
     'thingvellir rift iceland')
fact('Earth', 'A day is getting longer, very slowly',
     'Tidal friction adds about 1.7 milliseconds per century. In the Devonian, 400 million years ago, a year held about 400 days.',
     'earth from space day night')
fact('Earth', 'Most of the planet’s fresh water is frozen',
     'About 69% is locked in ice caps and glaciers and nearly all of the rest is groundwater. Rivers and lakes hold well under 1% of it.',
     'glacier ice greenland')
fact('Earth', 'Volcanic lightning is real and nobody is entirely sure why',
     'Ash particles rubbing together build up charge in the plume. Eruptions at Eyjafjallajokull and Taal produced storms of it over the crater.',
     'volcanic lightning eruption')
fact('Earth', 'The Dead Sea is so salty you cannot sink in it',
     'About 34% salt against the ocean’s 3.5%. Nothing bigger than a microbe lives in it, and it is dropping over a metre a year as the Jordan is drawn off.',
     'dead sea salt formations')
fact('Sea', 'More of the Moon has been mapped than the deep ocean floor',
     'About a quarter of the sea bed has been surveyed in detail by sonar. The rest is inferred from satellite measurements of the shape of the sea surface.',
     'bathymetric map ocean floor')
fact('Sea', 'The Mariana Trench would swallow Everest with a mile to spare',
     'Challenger Deep is about 10,935 m down. Only a handful of people have been to the bottom — fewer than have walked on the Moon.',
     'mariana trench bathymetry')
fact('Sea', 'Most of the oxygen you breathe came from the sea',
     'Estimates put the plankton share at 50 to 80% of all the oxygen produced. One genus, Prochlorococcus, may make a fifth of it on its own.',
     'marine phytoplankton bloom')
fact('Sea', 'Seawater is not the same blue everywhere and that is biology',
     'Water absorbs red light first, which is why deep water looks blue. Green water is water full of chlorophyll, which is to say full of life.',
     'ocean water surface')
fact('Sea', 'There are rivers and lakes at the bottom of the sea',
     'Brine pools are so much saltier than the water above that they sit in pools with a visible shoreline, and submersibles can watch waves lap at the edge.',
     'brine pool seafloor')
fact('Sea', 'The longest mountain range on Earth is underwater',
     'The mid-ocean ridge runs about 65,000 km round the globe, where new sea floor is made as plates pull apart. Almost none of it has ever been seen.',
     'mid ocean ridge map')
fact('Sea', 'A blue whale’s tongue can weigh as much as an elephant',
     'Its heart is the size of a small car and its aorta is wide enough to crawl through. It feeds on krill a few centimetres long.',
     'blue whale surfacing')
fact('Sea', 'Sea otters hold hands so they do not drift apart',
     'They wrap themselves in kelp for the same reason. They also keep a favourite stone in a pouch of loose skin under the arm for breaking shells.',
     'sea otter floating')


# ==================================================================================================
# SCIENCE
# ==================================================================================================
fact('Science', 'Glass is not a slow-moving liquid',
     'Old window panes are thicker at the bottom because of how they were made, not because they flowed. At room temperature glass is a solid and stays one.',
     'medieval stained glass window')
fact('Science', 'Hot water can freeze faster than cold under the right conditions',
     'The Mpemba effect has been reported since Aristotle and is still argued about. Evaporation, dissolved gas and convection all seem to play a part.',
     'ice crystals forming')
fact('Science', 'A single bolt of lightning is five times hotter than the Sun’s surface',
     'About 30,000 degrees Celsius against the Sun’s 5,500. The thunder is the air around it exploding outwards as it is heated in a fraction of a second.',
     'lightning strike')
fact('Science', 'Helium was found on the Sun before it was found on Earth',
     'A yellow line in the 1868 eclipse spectrum matched no known element, and it was named after Helios. It was isolated on Earth 27 years later.',
     'solar spectrum lines')
fact('Science', 'Diamonds and pencil lead are the same element',
     'Both are pure carbon. In diamond each atom is bonded to four others in a rigid lattice; in graphite the atoms sit in sheets that slide over each other.',
     'diamond and graphite')
fact('Science', 'Water expands when it freezes, which is why lakes freeze from the top',
     'Almost every other substance contracts. Ice floating means the water below stays liquid, which is the only reason fish survive a winter.',
     'frozen lake ice surface')
fact('Science', 'Atoms are almost entirely empty space',
     'If the nucleus were a marble on a football pitch, the electrons would be at the stands. What stops your hand passing through a table is electrical repulsion.',
     'atomic model illustration')
fact('Science', 'Absolute zero has never been reached',
     'Minus 273.15 Celsius. Laboratories have got within a few billionths of a degree, but removing the last of the energy would take infinite steps.',
     'laser cooling apparatus')
fact('Science', 'Honey never goes off',
     'Jars found in Egyptian tombs were still edible. It is too acidic and too low in water for bacteria, and bees add an enzyme that makes hydrogen peroxide.',
     'honey jar')
fact('Science', 'A superconductor will float above a magnet and stay there',
     'Below a critical temperature it expels magnetic field entirely. Cooled in place, it locks to its position and can be pushed around a track without touching it.',
     'superconductor levitation')
fact('Science', 'The tallest possible tree is about 130 metres and physics decides it',
     'Above that, water cannot be pulled to the leaves against gravity and friction without the column breaking. The tallest measured redwood is 116 m.',
     'coast redwood tall trees')
fact('Science', 'Sound travels about four times faster in water than in air',
     '1,480 metres per second against 343. In steel it is faster again, which is why you can hear a train through a rail before you hear it through the air.',
     'sound wave diagram')
fact('Science', 'Bananas are slightly radioactive',
     'They are rich in potassium and one isotope of it, potassium-40, is unstable. The dose is tiny and your own body carries more of it than the fruit does.',
     'bananas')
fact('Science', 'Rust is iron burning, very slowly',
     'It is the same chemistry as a flame — oxidation — running at room temperature. Salt speeds it up because it carries the charge between the two reactions.',
     'rusted iron surface')
fact('Science', 'Metals feel colder than wood at the same temperature',
     'They conduct heat out of your hand faster. What you are feeling is not temperature at all but the rate at which your skin is losing heat.',
     'metal and wood surfaces')
fact('Science', 'A gram of DNA could hold every film ever made',
     'Researchers have stored and read back data in synthetic DNA at densities around 200 petabytes per gram. It also lasts thousands of years if kept dry and cold.',
     'dna double helix model')
fact('Science', 'The hottest chilli is measured by how much sugar water hides it',
     'The Scoville scale began in 1912 as a taste test with a panel of people. Capsaicin binds the same receptor that responds to actual heat, which is why it burns.',
     'chilli peppers')
fact('Science', 'Nothing in the universe is truly at rest',
     'You are turning with the Earth, orbiting the Sun at 30 km/s, going round the galaxy at 220, and moving with the galaxy through the local group.',
     'milky way galaxy')


# ==================================================================================================
# LANGUAGE AND WORDS
# ==================================================================================================
fact('Language', 'English has no word that rhymes with orange, month or silver',
     'Purple has one — curple, an old word for a horse’s hindquarters. Rhyme is a fact about a language’s sound inventory rather than about the world.',
     'orange fruit')
fact('Language', 'The dot over an i is called a tittle',
     'It arrived in medieval manuscripts to stop i being lost among the strokes of m, n and u. The word survives mainly in the phrase jot or tittle.',
     'medieval manuscript minuscule')
fact('Language', 'Shakespeare is the first recorded user of about 1,700 English words',
     'Eyeball, bedazzled, lacklustre, swagger. Some he coined and some he simply wrote down first, which is a different claim and easier to prove.',
     'shakespeare first folio')
fact('Language', 'There is a language with no words for left and right',
     'Guugu Yimithirr in Queensland uses compass directions for everything, including where a cup sits on a table. Its speakers keep a running sense of north.',
     'queensland australia landscape')
fact('Language', 'The longest word in most dictionaries is a lung disease',
     'Pneumonoultramicroscopicsilicovolcanoconiosis, 45 letters, coined in 1935 partly to be long. The disease itself is ordinarily called silicosis.',
     'lung x-ray')
fact('Language', 'Icelandic speakers can read texts written a thousand years ago',
     'The language has changed so little that the medieval sagas are set books in school. New words are built from Icelandic roots rather than borrowed.',
     'icelandic saga manuscript')
fact('Language', 'The ampersand was once the 27th letter of the alphabet',
     'Children finished by reciting "and per se and", which slurred into ampersand. The symbol itself is a cursive Latin et.',
     'ampersand typography')
fact('Language', 'Nearly half the world speaks a language descended from one prehistoric tongue',
     'Proto-Indo-European was spoken perhaps 6,000 years ago and left no writing. It is reconstructed from the regular sound differences between its descendants.',
     'indo-european language tree')
fact('Language', 'Sign languages are not signed versions of spoken ones',
     'British and American Sign Language are unrelated and mutually unintelligible, with their own grammar. BSL is closer to Auslan than to ASL.',
     'british sign language')
fact('Language', 'Emoji began on a Japanese phone network in 1999',
     'Shigetaka Kurita drew 176 symbols on a 12 by 12 grid for NTT DoCoMo. The originals are now in the Museum of Modern Art in New York.',
     'original emoji set')
fact('Language', 'The word robot comes from a play about forced labour',
     'Karel Capek’s R.U.R., Prague 1920, from the Czech robota. The robots in it are artificial people, and they win.',
     'rur play 1921 poster')
fact('Language', 'Punctuation was invented to help people read aloud',
     'Ancient Greek and Latin were written without spaces between words. Marks were added by scribes to show where a reader should breathe.',
     'ancient greek papyrus')
fact('Language', 'Welsh has a word for the ache of longing for a place',
     'Hiraeth: a homesickness for somewhere you may never have been, or that no longer exists. Portuguese saudade is close but not the same.',
     'welsh countryside snowdonia')
fact('Language', 'Almost every language has a word like huh',
     'A study of 31 unrelated languages found a short, low, questioning syllable in every one. It seems to be a repair tool for conversation rather than a word.',
     'people talking conversation')
fact('Language', 'The QWERTY layout was not designed to slow you down',
     'That story is repeated everywhere. It was arranged to separate common letter pairs so the typebars of an 1870s machine would not jam into each other.',
     'sholes typewriter 1878')
fact('Language', 'A pangram uses every letter once and they are hard to write',
     'The quick brown fox jumps over the lazy dog has 35 letters for 26 slots. Perfect pangrams exist but read like a car registration.',
     'letterpress type case')


# ==================================================================================================
# EVERYDAY AND FOOD
# ==================================================================================================
fact('Everyday', 'The plastic tip on a shoelace has a name',
     'It is an aglet. Without one the fibres unravel and the lace will not thread, which is why they were made of metal before plastic.',
     'shoelace aglet')
fact('Everyday', 'A pencil can draw a line about 56 km long',
     'Roughly 45,000 words from one pencil, with no ink to dry out and nothing to leak at altitude. Graphite writes by leaving sheets of carbon on the paper.',
     'pencil tip graphite')
fact('Everyday', 'Bubble wrap was invented as wallpaper',
     'Two shower curtains sealed together in 1957. It did not sell, was tried as greenhouse insulation, and only found its use when IBM needed to ship computers.',
     'bubble wrap')
fact('Everyday', 'The microwave was invented by a man who noticed a melted chocolate bar',
     'Percy Spencer was standing near a magnetron in 1945. He tried popcorn next, then an egg, which exploded over a colleague.',
     'early radarange microwave oven')
fact('Everyday', 'Velcro was copied from burrs stuck to a dog',
     'George de Mestral looked at them under a microscope in 1941 and found hooks. The name is from velours and crochet — velvet and hook.',
     'burdock burrs')
fact('Everyday', 'A cash machine PIN was four digits because of one man’s wife',
     'John Shepherd-Barron proposed six and his wife said she could only remember four. Four has been the world standard ever since.',
     'cash machine keypad')
fact('Everyday', 'The hole in a pen lid is there to stop you choking',
     'It keeps an airway open if one is swallowed. BIC added it deliberately, and it is now required by safety standards for caps that size.',
     'ballpoint pen cap')
fact('Everyday', 'Left-handed scissors are genuinely different, not marketing',
     'The blades are swapped so the cutting edge you can see is the one that matters. With the wrong pair a left-hander pushes the blades apart and the paper folds.',
     'scissors pair')
fact('Everyday', 'Toilet roll was sold with a warning that it was splinter-free',
     'Early paper was made from wood pulp with the splinters still in it. Northern Tissue advertised splinter-free paper as a feature into the 1930s.',
     'toilet paper roll')
fact('Everyday', 'A tin opener was invented 48 years after the tin',
     'Cans were patented in 1810 and opened with a hammer and chisel. The instruction on early tins was to cut round the top with a chisel.',
     'vintage tin can')
fact('Food', 'Carrots were purple before they were orange',
     'Orange carrots were selectively bred in the Netherlands in the 16th century. Purple, white and yellow varieties are still grown and taste much the same.',
     'purple carrots')
fact('Food', 'A strawberry is not a berry and a banana is',
     'Botanically a berry comes from a single ovary with seeds inside. A strawberry’s seeds are on the outside and each one is a separate fruit.',
     'strawberry close up')
fact('Food', 'Nutmeg was once worth more than its weight in gold',
     'It grew on a handful of Indonesian islands and Europe fought wars over it. Britain traded one of them to the Dutch for Manhattan.',
     'nutmeg seeds')
fact('Food', 'Bread rises because yeast breathes out',
     'Yeast eats sugar and gives off carbon dioxide and alcohol. The gluten network traps the gas in bubbles, and the alcohol bakes off in the oven.',
     'bread dough rising')
fact('Food', 'Peanuts are not nuts',
     'They are legumes and grow underground, related to peas and beans. An almond is a seed inside a fruit, and a cashew grows outside one.',
     'peanut plant roots')
fact('Food', 'Onions make you cry because they fight back',
     'Cutting releases an enzyme that makes a sulphur compound which drifts up and reacts with the water in your eyes to form a small amount of sulphuric acid.',
     'sliced onion')
fact('Food', 'Chocolate was a bitter drink for most of its history',
     'The Maya and Aztec drank cacao spiced and unsweetened. Sugar and milk are European additions, and solid eating chocolate is only about 180 years old.',
     'cacao pods')
fact('Food', 'Apples float because a fifth of an apple is air',
     'That is why apple bobbing works at all. It is also why a bruised apple sinks a little lower: the damaged cells fill with juice.',
     'apples in water')
fact('Food', 'The hottest part of a chilli is not the seeds',
     'It is the pale pith the seeds are attached to, where the capsaicin is made. Scraping out the pith takes most of the heat with it.',
     'chilli cross section')


# ==================================================================================================
# TECH AND MAKING
# ==================================================================================================
fact('Tech', 'The Apollo computer had less memory than a musical birthday card',
     'About 72 kilobytes of read-only memory and 4 kilobytes of working memory. It flew twelve people to the Moon and it was hand-woven from wire and magnets.',
     'apollo guidance computer')
fact('Tech', 'The first webcam watched a coffee pot',
     'Cambridge computer scientists pointed a camera at the shared pot in 1991 so nobody climbed the stairs for nothing. It went online to the world in 1993.',
     'trojan room coffee pot')
fact('Tech', 'A single Google search uses about as much energy as a lightbulb for a minute',
     'The search itself is fast; the cost is in keeping thousands of machines warm and ready so the answer arrives in a fifth of a second.',
     'data centre servers')
fact('Tech', 'The at sign is older than email by centuries',
     'Merchants used it for "at the rate of" — 10 barrels @ £5. It survived on the typewriter keyboard, which is why it was free for Ray Tomlinson to borrow.',
     'at sign typography')
fact('Tech', 'Wi-Fi came out of a failed attempt to detect exploding black holes',
     'Australian radio astronomers built maths for untangling smeared signals. It did not find the black holes and it is now in the chip in every phone.',
     'radio telescope parkes')
fact('Tech', 'The first 1GB hard drive weighed 250 kg',
     'IBM shipped it in 1980 and it cost around $40,000. The same capacity now fits on a chip smaller than a fingernail and costs less than a sandwich.',
     'ibm 3380 disk drive')
fact('Tech', 'Bluetooth is named after a Viking king',
     'Harald Bluetooth united Denmark and Norway; the logo is his initials in runes. It was a code name that nobody got round to replacing.',
     'bluetooth logo runes')
fact('Tech', 'A QR code can lose 30% of itself and still work',
     'It carries Reed-Solomon error correction, the same family of maths that keeps a scratched CD playing. The three big squares tell the scanner which way up it is.',
     'qr code')
fact('Tech', 'Undo was invented in the 1970s and changed how people use computers',
     'Before it, a mistake was permanent, so people worked slowly and carefully. Being able to try something is most of what makes a computer feel safe.',
     'xerox alto computer')
fact('Tech', 'Your phone has more sensors than a 1990s aircraft',
     'Accelerometer, gyroscope, magnetometer, barometer, light, proximity, GPS and several cameras — most of them etched in silicon a few millimetres across.',
     'mems accelerometer chip')
fact('Making', 'The paperclip is over a century old and nobody has improved on it',
     'The Gem shape was in use by the 1890s. Hundreds of patents have tried to beat it and the plain double loop still holds paper better than any of them.',
     'paperclips')
fact('Making', 'Concrete from ancient Rome is stronger now than when it was poured',
     'Roman harbour concrete used volcanic ash, and seawater reacts with it to grow crystals in the cracks. Modern concrete is destroyed by the same seawater.',
     'roman concrete harbour')
fact('Making', 'Superglue was invented twice by accident and rejected both times',
     'It stuck to everything, which was the problem. Its first real use was sealing wounds in Vietnam, before anybody sold it in a tube.',
     'cyanoacrylate glue tube')
fact('Making', 'A Swiss Army knife has a tool for a horse’s hoof on some models',
     'The hook was for removing stones from hooves. Several tools on older models exist for equipment nobody carries any more and were kept for tradition.',
     'swiss army knife')
fact('Making', 'LEGO bricks from 1958 still fit the ones made today',
     'The tolerance is about two hundredths of a millimetre. A brick holds roughly 4,000 newtons before it fails — a stack of 375,000 bricks.',
     'lego bricks')
fact('Making', 'The Eiffel Tower is about 15 cm taller in summer',
     'Iron expands as it warms. It also leans slightly away from the Sun as one side heats faster than the other.',
     'eiffel tower')
fact('Making', 'A violin is held together mostly by glue that is meant to fail',
     'Hide glue is used because it can be softened with heat and water, so a two-hundred-year-old instrument can be opened for repair without being destroyed.',
     'violin luthier workshop')
fact('Making', 'Pencils are graded by how much clay is mixed with the graphite',
     'More clay makes a harder, lighter line — that is the H. More graphite makes it blacker and softer, which is the B. HB sits in the middle.',
     'pencil grades set')


# ==================================================================================================
# NATURE AND WEATHER
# ==================================================================================================
fact('Nature', 'Trees talk to each other through fungi',
     'Threads of fungus link roots across a wood and carry sugar, water and chemical warnings. A dying tree can pass its carbon to its neighbours through it.',
     'mycorrhizal fungi roots')
fact('Nature', 'Bamboo can grow nearly a metre in a day',
     'Some species manage 91 cm in 24 hours. It is a grass, and the whole stem lengthens at once rather than growing from the tip like a tree.',
     'bamboo forest')
fact('Nature', 'A single aspen colony in Utah is one of the heaviest living things',
     'Pando is about 47,000 stems sharing one root system and one set of genes. Estimates of its age run from thousands to tens of thousands of years.',
     'pando aspen grove utah')
fact('Nature', 'Sunflowers follow the Sun only while they are young',
     'The stem grows faster on one side to turn the head. Once the flower opens it stops and settles facing east, which warms it early and brings more bees.',
     'sunflower field')
fact('Nature', 'Some plants count',
     'A Venus flytrap only shuts after two touches within about twenty seconds, and needs five to start digesting. It is a filter against raindrops.',
     'venus flytrap')
fact('Nature', 'Lichen is two organisms living as one',
     'A fungus provides the structure and an alga or cyanobacterium provides the food. Some grow less than a millimetre a year and are used to date rock falls.',
     'lichen on rock')
fact('Nature', 'Seeds have germinated after two thousand years in a jar',
     'A date palm seed from Masada sprouted in 2005. Arctic permafrost has yielded a flowering plant grown from tissue over 30,000 years old.',
     'date palm seedling')
fact('Nature', 'Autumn colours were in the leaf all summer',
     'The yellows and oranges are carotenoids, hidden by chlorophyll. When the tree stops making chlorophyll before winter, what was underneath shows.',
     'autumn leaves')
fact('Nature', 'Moss has no roots',
     'It takes water straight through its surface, which is why it grows on stone and why it dries to nothing and revives when it rains.',
     'moss close up')
fact('Weather', 'No two snowflakes are alike, and one scientist checked for decades',
     'Wilson Bentley photographed over 5,000 between 1885 and 1931. Each crystal grows through its own path of temperature and humidity, and the path is the pattern.',
     'snowflake photograph bentley')
fact('Weather', 'A cloud can weigh as much as a hundred elephants',
     'A cumulus a kilometre across holds around 500 tonnes of water, spread as droplets so small that the rising air holds them up.',
     'cumulus cloud')
fact('Weather', 'Lightning strikes the Earth about 40 times every second',
     'Roughly three million strikes a day, most of them over land in the tropics. Lake Maracaibo in Venezuela has storms almost 300 nights a year.',
     'catatumbo lightning')
fact('Weather', 'The largest recorded hailstone was the size of a football',
     'One that fell in South Dakota in 2010 measured 20 cm across and weighed nearly a kilogram. Hail grows in layers as it is carried up and down a storm.',
     'large hailstone')
fact('Weather', 'Rain has a smell and it has a name',
     'Petrichor: oils from plants collect in dry soil and are thrown into the air by raindrops, along with a compound made by soil bacteria called geosmin.',
     'rain on dry ground')
fact('Weather', 'A rainbow is a circle and the ground gets in the way',
     'From an aeroplane you can see the whole ring. The angle is fixed at about 42 degrees from the point opposite the Sun, which is why nobody reaches the end.',
     'rainbow')
fact('Weather', 'The wind has a scale invented by a naval officer with no instruments',
     'Francis Beaufort described what the sea and the sails looked like at each force. It is still used because a person can read it without a meter.',
     'rough sea beaufort scale')
fact('Weather', 'Antarctica is a desert',
     'The interior gets under 50 mm of precipitation a year, less than the Sahara. Nothing melts, so what falls stays and piles up for millennia.',
     'antarctic plateau')
fact('Weather', 'Thunder is the sound of air being shoved out of the way',
     'The bolt heats a channel of air to about 30,000 degrees in a fraction of a second and it expands supersonically. Count the seconds and divide by three for kilometres.',
     'thunderstorm clouds')


# ==================================================================================================
# MONEY, SPORT, MUSIC
# ==================================================================================================
fact('Money', 'The pound is the world’s oldest currency still in use',
     'It dates from around 775 AD, when a pound of silver was cut into 240 pennies. That is why there were 240 pence in a pound until 1971.',
     'anglo-saxon silver penny')
fact('Money', 'Most money does not exist as notes or coins',
     'Around 3% of the money in the UK is physical cash. The rest is numbers in bank ledgers, created when banks make loans.',
     'bank of england')
fact('Money', 'A £20 note costs a few pence to make',
     'Polymer notes cost more than paper ones to print and last two and a half times as long, so they work out cheaper and survive the washing machine.',
     'polymer banknote')
fact('Money', 'Compound interest is why starting early beats saving more',
     'Save £50 a month from 25 to 35 and stop, or from 35 to 65 at the same rate, and at 7% the first person usually ends up ahead.',
     'compound interest graph')
fact('Money', 'The word bankrupt comes from a broken bench',
     'Banca rotta in Italian. A money changer who could not pay had his table broken, so nobody would trade at it again.',
     'renaissance money changer painting')
fact('Money', 'Cows were money before coins were',
     'Cattle, grain and salt were all used. The problem a coin solves is divisibility: you can give half a coin of value, not half a cow.',
     'ancient greek coins')
fact('Money', 'Britain once taxed windows and people bricked them up',
     'The tax ran from 1696 to 1851 and was charged on the number of windows. Blocked-up openings are still visible on Georgian houses.',
     'georgian house bricked window')
fact('Sport', 'A golf ball has dimples because a scuffed ball flew further',
     'Players noticed old balls went further than new ones. The dimples trap a thin turbulent layer that keeps the air attached, halving the drag.',
     'golf ball dimples')
fact('Sport', 'The marathon distance was set by a route to please a royal family',
     'The 1908 London Olympics started at Windsor Castle so the children could watch, making 26 miles 385 yards. It was fixed as the standard in 1921.',
     '1908 olympic marathon')
fact('Sport', 'A cricket ball swings because one side is polished',
     'The smooth side keeps the air attached longer than the rough side, so the pressures differ and the ball curves. Reverse swing happens when the ball is old.',
     'cricket ball seam')
fact('Sport', 'A table tennis ball spins over a hundred times a second',
     'A top player puts enormous topspin on it, which is what makes the ball dive onto the table instead of sailing long. The bat rubber is built for grip.',
     'table tennis')
fact('Sport', 'The first football World Cup final was played with two different balls',
     'Argentina supplied one for the first half and Uruguay one for the second, in 1930. Uruguay won with their own ball on the pitch.',
     '1930 world cup final')
fact('Sport', 'Olympic gold medals are mostly silver',
     'They have been since 1912. The rules require at least six grams of gold plating on a medal that is otherwise about 92% silver.',
     'olympic gold medal')
fact('Sport', 'A boxing ring is square and the name is older than the rope',
     'Fights were held in a circle drawn on the ground with the crowd around it. The square with ropes arrived in 1838 and the word stayed.',
     'boxing ring')
fact('Music', 'Middle C is not in the middle of anything in particular',
     'It sits between the treble and bass staves, which is where the name comes from. On a standard 88-key piano it is the fourth C, slightly left of centre.',
     'piano keyboard middle c')
fact('Music', 'An octave sounds the same because the frequency doubles',
     'The A above middle C is 440 Hz and the next A is 880. Every culture that has been studied treats notes an octave apart as the same note.',
     'sound wave frequency')
fact('Music', 'The longest piece of music being played will finish in 2640',
     'John Cage’s ORGAN2/ASLSP is being performed on a church organ in Halberstadt, Germany. A chord change draws a crowd.',
     'halberstadt cage organ')
fact('Music', 'A theremin is played without touching it',
     'Two aerials sense the position of the player’s hands by how they change an electrical field. Leon Theremin invented it in 1920 while researching sensors.',
     'theremin instrument')
fact('Music', 'A grand piano has around 20 tonnes of string tension',
     'That is why the frame is cast iron. The strings pull hard enough that a wooden frame would fold, which is what happened before 1825.',
     'grand piano frame strings')


# ==================================================================================================
# BUILDINGS, PEOPLE, ODDITIES
# ==================================================================================================
fact('Buildings', 'The Empire State Building was put up in 410 days',
     'It went up during the Depression, about four and a half floors a week, and came in under budget. Steel arrived on site and was bolted in within days.',
     'empire state building construction 1930')
fact('Buildings', 'A skyscraper sways on purpose',
     'Rigid buildings crack. Tall ones are designed to move up to a metre at the top in high wind, some with a huge weighted pendulum to damp the motion.',
     'taipei 101 tuned mass damper')
fact('Buildings', 'Notre-Dame took nearly 200 years to build',
     'Begun in 1163 and largely finished by 1345. Almost nobody who started it saw it done, which is true of most great cathedrals.',
     'notre dame paris')
fact('Buildings', 'The Colosseum could be emptied in about fifteen minutes',
     'Eighty numbered entrances and a ticket that told you which stairs to take. Modern stadium design still copies the idea and calls them vomitoria.',
     'colosseum rome interior')
fact('Buildings', 'Some old houses have no thirteenth floor',
     'The lifts skip from 12 to 14. Nothing changes about the building; the floor above the twelfth is simply given a different number.',
     'lift buttons panel')
fact('Buildings', 'Stonehenge’s bluestones came 250 km from Wales',
     'Each weighs two to four tonnes. How they were moved around 2500 BC is still argued about, and the quarries have been found in the Preseli Hills.',
     'stonehenge')
fact('Buildings', 'The Sydney Opera House roof was solved by cutting up a sphere',
     'Utzon’s design could not be built until he realised every shell could be a piece of one sphere, so the same curve could be cast again and again.',
     'sydney opera house shells')
fact('Buildings', 'Venice is built on millions of wooden piles',
     'Driven into the mud, they do not rot because there is no oxygen down there. Over centuries many have partly turned to stone.',
     'venice canal buildings')
fact('People', 'Marie Curie is the only person to win Nobel Prizes in two different sciences',
     'Physics in 1903 and Chemistry in 1911. Her notebooks are still radioactive and are kept in lead-lined boxes.',
     'marie curie laboratory')
fact('People', 'The man who invented the Pringles tube is buried in one',
     'Fredric Baur, a chemist, asked for part of his ashes to be put in a can. His family bought one at a supermarket on the way to the funeral.',
     'pringles can')
fact('People', 'Alan Turing’s work shortened the Second World War by an estimated two years',
     'The Bletchley Park codebreaking effort read German naval signals. The machines built to do it, and the ideas behind them, became the computer.',
     'bombe machine bletchley park')
fact('People', 'Mary Anning found the first ichthyosaur skeleton at twelve',
     'She sold fossils on the Dorset coast to support her family and reshaped palaeontology. The Geological Society did not admit women in her lifetime.',
     'mary anning fossil lyme regis')
fact('People', 'Isaac Newton spent more time on alchemy than on physics',
     'He also ran the Royal Mint and personally pursued counterfeiters through London. He wrote more words on theology than on mathematics.',
     'isaac newton portrait')
fact('People', 'Nikola Tesla could not stand pearls',
     'He refused to speak to a woman wearing them. He also counted his steps, and insisted on hotel room numbers divisible by three.',
     'nikola tesla portrait')
fact('People', 'Katherine Johnson checked the computer’s sums by hand',
     'John Glenn refused to fly until she had verified the electronic trajectory calculations for his 1962 orbit. She worked at NASA for 33 years.',
     'katherine johnson nasa')
fact('Oddities', 'Sweden once drove on the left and swapped overnight',
     'At 5 a.m. on 3 September 1967 every vehicle in the country stopped, moved across and started again. Accidents went down for months afterwards.',
     'dagen h sweden 1967')
fact('Oddities', 'There is a town in Norway with mirrors on the mountains',
     'Rjukan sits in a valley with no direct sun for half the year, so in 2013 it installed three steerable mirrors to put a patch of sunlight on the square.',
     'rjukan solspeil mirrors')
fact('Oddities', 'A cloud of gas in space smells of raspberries and rum',
     'Ethyl formate has been detected near the centre of the galaxy. It is the compound that gives raspberries much of their flavour.',
     'sagittarius b2 molecular cloud')
fact('Oddities', 'The Guinness Book of Records was invented to settle pub arguments',
     'A brewery director argued about Europe’s fastest game bird, could not find the answer in any book, and commissioned one in 1954.',
     'guinness brewery dublin')
fact('Oddities', 'Bhutan measures Gross National Happiness',
     'It has been official policy since the 1970s, with a survey covering health, education, culture and time use. GDP is not the country’s main target.',
     'bhutan monastery')
fact('Oddities', 'Nobody knows who invented the wheel',
     'The oldest evidence is a potter’s wheel from Mesopotamia around 3500 BC. The hard part was never the wheel; it was the axle that had to fit it.',
     'bronze age wheel')
fact('Oddities', 'A group of crows is called a murder and nobody is sure why',
     'The collective nouns come from a 15th-century list written partly as a game for hunters. Many of them were never in ordinary use at all.',
     'crows flock')


# ==================================================================================================
# STUDY — the one subject a tutoring app has a reason to be opinionated about
# ==================================================================================================
fact('Study', 'Testing yourself beats reading it again, and it is not close',
     'Being made to recall something strengthens the memory far more than seeing it. Rereading feels like learning because it feels easy, which is the trap.',
     'student flashcards')
fact('Study', 'Spacing the same hour over a week beats doing it in one go',
     'Forgetting a little and pulling it back is what fixes it. Four twenty-minute goes across a week beat one eighty-minute session almost every time.',
     'calendar week planner')
fact('Study', 'Mixing topics up feels worse and works better',
     'Practising one type of question in a block goes smoothly and fades fast. Shuffling types forces you to work out which method applies, which is the exam skill.',
     'maths exercise book')
fact('Study', 'Writing notes by hand beats typing for understanding',
     'Typists get more words down and remember less. Writing is slower, so you have to decide what matters, and deciding is the part that sticks.',
     'handwritten notes')
fact('Study', 'Sleep is when a memory is filed',
     'Learning something and then sleeping beats learning it and staying up, even with the same total study time. A cut-short night undoes part of the day.',
     'person sleeping')
fact('Study', 'Explaining it to somebody is a test in disguise',
     'You find the gap the moment you have to say it out loud. An empty chair works: the point is producing the explanation, not who hears it.',
     'student teaching whiteboard')
fact('Study', 'Past papers work because they teach the question, not the topic',
     'Boards reuse a small set of question shapes. After ten papers you recognise what is being asked before you have finished reading it.',
     'exam paper past papers')
fact('Study', 'Highlighting is close to useless on its own',
     'Study after study finds no benefit. What makes it worth anything is what you do afterwards: turning each highlight into a question you have to answer.',
     'highlighted textbook')
fact('Study', 'A short break helps more than pushing through',
     'Attention fades after about 25 to 40 minutes on hard material. A five-minute break away from a screen resets it; a break on a phone mostly does not.',
     'student taking a break')
fact('Study', 'Working out loud catches mistakes reading silently misses',
     'Saying each step names it, and a step you cannot name is usually the one that is wrong. It is why examiners give marks for method.',
     'student working through problem')
fact('Study', 'Cramming works for tomorrow and almost nothing after',
     'You can pass a test on material learned last night and have very little of it a fortnight later. For an exam season that is the wrong trade.',
     'late night studying')
fact('Study', 'Doing the hardest thing first is worth more than it feels',
     'Attention and willpower are best early. Leaving the hard question to the end of a session usually means doing it badly or not at all.',
     'desk with books')

# ==================================================================================================
# MORE ODDITIES, PEOPLE AND MONEY
# ==================================================================================================
fact('Oddities', 'There is an official unit of measurement called the Smoot',
     'A 1958 MIT prank measured a bridge in the height of a student, Oliver Smoot. The markings are repainted every year and the police use them for locations.',
     'harvard bridge smoot markings')
fact('Oddities', 'The shortest commercial flight lasts under two minutes',
     'Westray to Papa Westray in Orkney is 2.7 km. With a good wind the aircraft has been recorded doing it in 47 seconds.',
     'westray papa westray flight')
fact('Oddities', 'One Japanese railway station exists for a single passenger',
     'Kyu-Shirataki in Hokkaido was kept open for a schoolgirl until she graduated in 2016. The timetable was arranged around her lessons.',
     'rural japanese railway station')
fact('Oddities', 'A cat was once listed as the co-author of a physics paper',
     'F.D.C. Willard appeared on a 1975 paper because the author had written "we" throughout and did not want to change it. The cat was his Siamese, Chester.',
     'siamese cat')
fact('Oddities', 'There is a species of jellyfish that can reset to a juvenile',
     'Turritopsis dohrnii can turn its cells back into an earlier form when stressed. It can still be eaten, so it is not immortal in any useful sense.',
     'turritopsis jellyfish')
fact('Oddities', 'The Netherlands has been closing prisons for lack of prisoners',
     'Falling crime and a strong preference for community sentences left cells empty. Some have been converted into housing and one into a hotel.',
     'dutch prison building')
fact('Oddities', 'Finland gives new parents a cardboard box that is also a cot',
     'The maternity package has been issued since 1938 and contains clothes, bedding and a mattress. Infant mortality fell sharply after it was introduced.',
     'finnish baby box')
fact('Oddities', 'There is a library of books that cannot be read until 2114',
     'The Future Library in Oslo collects one manuscript a year, sealed. A forest was planted in 2014 to supply the paper they will be printed on.',
     'nordmarka forest oslo')
fact('People', 'Hedy Lamarr co-invented the idea behind Wi-Fi and Bluetooth',
     'A film star, she patented frequency hopping in 1942 to stop torpedo signals being jammed. The patent expired before anybody built it.',
     'hedy lamarr portrait')
fact('People', 'Rosalind Franklin’s photograph is what showed DNA was a helix',
     'Photo 51, taken in 1952, was shown to Watson without her knowledge. She died at 37, four years before the Nobel Prize was given for the structure.',
     'rosalind franklin photo 51')
fact('People', 'Ignaz Semmelweis was ignored for telling doctors to wash their hands',
     'Deaths on his maternity ward fell from 18% to 2%. He was dismissed, and germ theory arrived twenty years too late to save his reputation.',
     'ignaz semmelweis portrait')
fact('People', 'Ada Lovelace saw that a calculating machine could handle more than numbers',
     'She wrote that it might compose music if the rules of harmony could be expressed as symbols. Nobody else made that leap for another century.',
     'analytical engine babbage')
fact('People', 'Srinivasa Ramanujan taught himself maths from one textbook',
     'He posted his results to Cambridge from a clerk’s job in Madras in 1913. Some of the formulae he sent were not proved for another eighty years.',
     'srinivasa ramanujan')
fact('People', 'Alexander Fleming found penicillin because he did not tidy up',
     'He came back from holiday in 1928 to a contaminated culture plate with a clear ring round the mould. It took another decade to make it into a drug.',
     'penicillium mould culture')
fact('Money', 'A shopkeeper rounding to 99p is using a real effect',
     'People read prices left to right and anchor on the first digit. £2.99 is filed as two-something, and the effect survives even when people know about it.',
     'price tags shop')
fact('Money', 'The first cash machine was opened in Enfield in 1967',
     'It took a paper voucher impregnated with mildly radioactive carbon-14 and matched it against a PIN. Barclays installed it and Reg Varney used it first.',
     'barclays enfield cash machine')
fact('Money', 'Inflation is why a 1970s pound would buy about ten pounds of things today',
     'Prices in the UK are roughly fourteen times what they were in 1970. It is also why comparing old wages to modern ones without adjusting is meaningless.',
     'old british banknotes')

# ==================================================================================================
# MORE SEA, FOOD, MUSIC, WEATHER, SPORT
# ==================================================================================================
fact('Sea', 'A coral reef is an animal, a plant and a rock at once',
     'The polyp is an animal, the algae inside it photosynthesise, and the skeleton it builds is limestone. Bleaching is the polyp expelling its algae under heat stress.',
     'coral reef')
fact('Sea', 'Jellyfish have no brain, blood or bones',
     'A net of nerves runs through the bell and does the work. They have been in the sea for over 500 million years, longer than trees have been on land.',
     'moon jellyfish')
fact('Sea', 'The sea is not level',
     'Gravity varies with the rock below, so the surface sits up to a hundred metres higher in some places than others. Satellites map the bumps to find what is underneath.',
     'ocean surface satellite')
fact('Sea', 'Whales hear each other across ocean basins through a sound channel',
     'At a certain depth sound bends back on itself instead of escaping, so a low call travels for hundreds of kilometres. Submarines use the same layer.',
     'humpback whale underwater')
fact('Sea', 'A tsunami is barely a ripple in deep water',
     'It may be under a metre high and hundreds of kilometres long, moving at the speed of a jet. It only rears up when the sea floor rises beneath it.',
     'tsunami wave coast')
fact('Sea', 'Seahorse fathers carry the pregnancy',
     'The female deposits eggs into a pouch on his belly and he carries them to term. They also pair for life in several species and greet each other daily.',
     'seahorse')
fact('Food', 'Cheese is a way of keeping milk for the winter',
     'Everything about it — salt, acid, drying, mould — is preservation. What we taste as flavour is mostly the controlled result of stopping milk from spoiling.',
     'cheese wheels cellar')
fact('Food', 'Every vanilla flower in the world is pollinated by hand',
     'The orchid is Mexican and its natural pollinator does not live where vanilla is grown. Each flower opens for one day and must be pollinated that morning.',
     'vanilla orchid flower')
fact('Food', 'Most of a cucumber is water and so is most of you',
     'A cucumber is about 96% water and an adult human about 60%. Lettuce, celery and watermelon are all above 90%.',
     'cucumber slices')
fact('Food', 'Bitterness is a warning system',
     'Humans have around 25 different bitter receptors and only one for sweet. Most natural poisons taste bitter, so the tongue is built to be suspicious.',
     'bitter greens vegetables')
fact('Food', 'Cooking is what let human brains get big',
     'Heat breaks down starch and protein, so a cooked meal gives far more usable energy for the same chewing. Our jaws and guts shrank as our brains grew.',
     'cooking over fire')
fact('Food', 'Bread, beer and paper all start with the same trick',
     'Breaking long molecules into short ones — starch into sugar, wood into fibre. Enzymes, yeast and heat are the three tools and every kitchen uses all three.',
     'wheat field harvest')
fact('Music', 'Perfect pitch is more common where the language is tonal',
     'In Mandarin and Vietnamese the pitch of a syllable changes the word, so children learn to attend to absolute pitch before the window closes.',
     'child learning piano')
fact('Music', 'A minor chord sounds sad in some cultures and not in others',
     'The physics is the same everywhere; the meaning is learned. Listeners with no exposure to Western music do not reliably hear minor as sad.',
     'sheet music minor chord')
fact('Music', 'The loudest instrument in an orchestra is the one at the back',
     'A trumpet or trombone can reach over 110 decibels at the player’s ear. Orchestral players are among the professions most at risk of hearing damage.',
     'orchestra brass section')
fact('Music', 'Singing in a group synchronises heartbeats',
     'Choir members’ heart rates line up within minutes, because the breathing pattern of the phrases controls the pulse through the vagus nerve.',
     'choir singing')
fact('Music', 'The pitch orchestras tune to has been creeping up for centuries',
     'Baroque orchestras often used A at 415 Hz; the standard is 440 and some orchestras play at 443. Brighter sounds better, and everyone else has to follow.',
     'orchestra tuning oboe')
fact('Weather', 'Tornado Alley is moving east',
     'The centre of US tornado activity has shifted from the plains towards the Mississippi valley over recent decades, where there are more trees and more people.',
     'tornado supercell')
fact('Weather', 'Fog is a cloud that is touching the ground',
     'There is no difference in the physics. It forms when air cools to its dew point, which is why valleys and riversides fill first on a clear night.',
     'morning fog valley')
fact('Weather', 'Frost can form when the air is above freezing',
     'The ground radiates heat to a clear sky and drops below zero while the air a metre up does not. That is why a car roof frosts and the pavement does not.',
     'frost on grass')
fact('Weather', 'Hurricanes spin opposite ways in the two hemispheres',
     'The Coriolis effect turns moving air right in the north and left in the south. It is also why one never forms on the equator, where the effect is zero.',
     'hurricane from space')
fact('Sport', 'A football swerves because it drags air round with it',
     'Spin makes the air faster on one side than the other, so the pressure differs and the ball curves. The same effect makes a cricket ball and a tennis ball dip.',
     'football free kick')
fact('Sport', 'The high jump was changed by one man going over backwards',
     'Dick Fosbury won gold in 1968 with a technique everybody thought was a joke. It lets the body’s centre of mass pass under the bar.',
     'fosbury flop high jump')
fact('Sport', 'Swimmers shave because it genuinely helps',
     'Removing body hair reduces drag and, by several studies, changes the feel of the water enough to alter stroke length. The gain is small and races are small.',
     'competitive swimmer')
fact('Sport', 'Marathon runners hit a wall at about 20 miles for a chemical reason',
     'The body stores roughly 2,000 calories of glycogen and a marathon costs about 2,600. When it runs out the body switches to fat, which burns far more slowly.',
     'marathon runners')

# ==================================================================================================
# MORE BUILDINGS, MAKING, NATURE, EARTH, EVERYDAY, LANGUAGE
# ==================================================================================================
fact('Buildings', 'The Shard has more glass than a football pitch',
     '11,000 panes covering about 56,000 square metres. The panes are angled so the building reflects the sky and changes colour with the weather.',
     'the shard london')
fact('Buildings', 'A cathedral spire is a lightning rod that predates the idea',
     'Being the tallest thing for miles, they were struck constantly and often burned. Franklin’s rod in 1752 was resisted partly on theological grounds.',
     'cathedral spire')
fact('Buildings', 'The Pantheon’s dome is still the largest unreinforced concrete dome',
     'Nearly 1,900 years old, 43 m across, and the concrete gets lighter towards the top — heavy basalt at the base, light pumice at the crown.',
     'pantheon rome dome')
fact('Buildings', 'Medieval builders worked to a drawing scratched on a floor',
     'Tracing floors survive at York and Wells: full-size plaster surfaces where the mason cut out the shape of a window before carving the stone.',
     'york minster tracing floor')
fact('Making', 'A saw cuts on the push in Europe and the pull in Japan',
     'A pull stroke keeps the blade in tension, so it can be much thinner and takes less wood. A push saw must be stiff enough not to buckle.',
     'japanese pull saw')
fact('Making', 'Damascus steel was lost for two centuries and is still argued about',
     'The patterned blades stopped being made around 1750. Modern analysis found carbon nanotubes in them, probably from impurities in a particular ore.',
     'damascus steel blade pattern')
fact('Making', 'Bricks are laid in patterns for strength, not decoration',
     'A stretcher bond staggers the joints so a crack cannot run straight down. English bond alternates whole bricks across the wall to tie the two skins together.',
     'brick bond wall')
fact('Making', 'A nail holds by friction and a screw holds by thread',
     'Which is why a nail is better in shear and a screw is better in tension, and why a floorboard is screwed and a rafter is nailed.',
     'nails and screws')
fact('Nature', 'A beaver dam can be seen from space',
     'One in Alberta is about 850 m long and was spotted on satellite imagery in 2007. Beavers build in response to the sound of running water.',
     'beaver dam')
fact('Nature', 'Fungi are closer to animals than to plants',
     'They cannot photosynthesise, they store food as glycogen the way we do, and their cell walls are made of chitin, the same material as an insect shell.',
     'mushrooms forest floor')
fact('Nature', 'The largest organism on Earth may be a fungus in Oregon',
     'One honey fungus spreads across nearly 10 square kilometres of forest floor and is thought to be at least 2,400 years old.',
     'armillaria honey fungus')
fact('Nature', 'Grass survives being eaten because it grows from the bottom',
     'The growing point sits at ground level rather than the tip, so mowing or grazing removes old leaf and not the factory. That is why lawns work.',
     'grass blades close up')
fact('Earth', 'Magnetic north wanders and has sped up',
     'It has moved from Canada towards Siberia at up to 55 km a year. Aviation charts and phone compasses are corrected for it on a schedule.',
     'compass needle')
fact('Earth', 'The Earth’s magnetic field has flipped hundreds of times',
     'The last reversal was about 780,000 years ago. Rock forming at the mid-ocean ridge records each flip as a stripe, which is how plate tectonics was proved.',
     'magnetic striping seafloor')
fact('Earth', 'A river can change country',
     'The Rio Grande has moved enough to shift the US-Mexico border, and Italy and Switzerland agreed to redraw theirs as a glacier retreated.',
     'meandering river from above')
fact('Earth', 'Soil takes centuries to make and minutes to lose',
     'A centimetre of topsoil can take several hundred years to form from rock and organic matter, and a single storm on bare ground can wash it away.',
     'soil profile cross section')
fact('Everyday', 'Mirrors are slightly green',
     'Ordinary glass absorbs a little red and blue. Put two mirrors facing each other and the reflections get greener the further down the tunnel you look.',
     'mirror tunnel reflection')
fact('Everyday', 'A bar of soap works by having two ends',
     'One end of the molecule sticks to water and the other to grease. Rinsing pulls the whole lot away, which is also how washing up liquid and shampoo work.',
     'soap bar')
fact('Everyday', 'Keys are cut to a code, not to a shape',
     'Each cut is one of a small number of depths, so a key is really a short number. That is why a locksmith can cut one from the code stamped on the lock.',
     'key cutting machine')
fact('Everyday', 'Road signs are reflective because of millions of tiny glass beads',
     'They send light straight back to where it came from, which is why a sign is bright to a driver and dull to somebody standing beside the road.',
     'retroreflective road sign')
fact('Everyday', 'Zips were sold for twenty years before clothes used them',
     'They went on boots and tobacco pouches first. The name came from the sound, and clothing makers only adopted them for children’s wear in the 1930s.',
     'zip fastener close up')
fact('Language', 'Most of the world’s languages have never been written down',
     'Of roughly 7,000 living languages, over half have no written tradition. About one dies every few weeks as the last fluent speaker does.',
     'endangered language fieldwork')
fact('Language', 'The word deadline probably comes from a prison camp',
     'A line around a Civil War camp beyond which prisoners were shot. The printing sense arrived later, and the ordinary one later still.',
     'civil war prison camp')
fact('Language', 'Reading silently was once considered strange',
     'Augustine wrote about Ambrose reading without moving his lips as a curiosity. Word spacing arrived in the 7th century and made silent reading normal.',
     'monk reading manuscript')

# ==================================================================================================
# THE LAST THIRTY-TWO
# ==================================================================================================
fact('Space', 'Uranus rolls round the Sun on its side',
     'Its axis is tipped 98 degrees, probably by an ancient collision. Each pole gets 42 years of continuous sunlight and then 42 years of night.',
     'uranus planet')
fact('Space', 'A black hole is not a hole and does not suck',
     'It is mass in a very small space. Replace the Sun with a black hole of the same mass and the Earth would carry on in exactly the same orbit, in the dark.',
     'black hole event horizon image')
fact('Space', 'Saturn’s rings are mostly ice and mostly thinner than a house',
     'They run 280,000 km across and are typically about ten metres deep. Scaled to a sheet of paper, the rings would be a kilometre wide.',
     'saturn rings edge on')
fact('Maths', 'Every number can be reached by a game nobody can prove ends',
     'The Collatz rule: halve it if even, treble and add one if odd. Every number tried lands on 1, and after ninety years nobody has proved they all do.',
     'collatz conjecture graph')
fact('Maths', 'A perfect shuffle eight times puts a deck back exactly as it started',
     'Split the deck precisely in half and interleave it. Magicians use it; the maths is a permutation of order eight on 52 cards.',
     'riffle shuffle cards')
fact('Maths', 'The chance of two people in a room of 60 sharing a birthday is 99%',
     'It is the same arithmetic as the 23 case and it still surprises people. Anything below certainty needs 366 people, which is the fact intuition reaches for.',
     'calendar dates')
fact('Maths', 'Prime numbers keep your bank details safe',
     'Multiplying two large primes is instant; finding them again from the answer is not. Public key encryption is built on that gap being real.',
     'prime numbers sieve')
fact('Body', 'Your ears and nose never really stop growing',
     'Cartilage keeps adding cells slowly, and gravity stretches it. It is why noses and ears are a reasonable guess at somebody’s age.',
     'human ear close up')
fact('Body', 'You blink about 15 times a minute and see no gap',
     'The brain suppresses vision during the blink and stitches the two sides together. You lose around 10% of your waking hours to blinks you never noticed.',
     'human eye blinking')
fact('Body', 'A shiver is your muscles burning fuel for heat',
     'They contract against each other so the energy comes out as warmth rather than movement. It can raise heat production by five times for a short while.',
     'person shivering cold')
fact('Science', 'Ice has more than a dozen different crystal forms',
     'The one on a pond is ice I. Under pressure water freezes into denser arrangements, and some of them stay solid at temperatures well above boiling.',
     'ice crystal structure')
fact('Science', 'Static shock is electrons that jumped',
     'Rubbing moves electrons from one material to the other. The spark is a few thousand volts and almost no current, which is why it stings and does not harm.',
     'static electricity spark')
fact('Science', 'A candle flame is mostly soot glowing',
     'The yellow light is solid carbon particles heated until they shine. In zero gravity there is no rising hot air, so a flame is a small blue sphere.',
     'candle flame')
fact('Science', 'You can boil water at room temperature',
     'Boiling is when vapour pressure matches the surrounding pressure. Pump the air out of a jar and water bubbles cold, which is why kettles take longer up a mountain.',
     'vacuum chamber boiling water')
fact('Animals', 'Giraffes have the same number of neck bones as you',
     'Seven, like almost every mammal. Each one is just very long, which is also why a giraffe needs a valve system to stop blackouts when it lifts its head.',
     'giraffe neck')
fact('Animals', 'Cows have best friends and get stressed when separated',
     'Heart rate and cortisol both rise when a cow is penned away from her preferred partner. Dairy herds handled in stable groups produce more milk.',
     'dairy cows field')
fact('Animals', 'A starfish has no brain and can eat outside its body',
     'It pushes its stomach out through its mouth, digests a mussel inside the shell and pulls the stomach back in. Its nervous system is a ring with no centre.',
     'starfish')
fact('History', 'The pyramids were built by paid workers, not slaves',
     'Their village has been excavated: bakeries, breweries, medical care for broken bones, and graves near the pyramids, which no slave would have been given.',
     'giza workers village excavation')
fact('History', 'The Great Wall is not one wall and is not visible from space',
     'It is many walls built over 2,000 years by different dynasties. At a few metres wide and the colour of the ground, no astronaut has picked it out unaided.',
     'great wall of china')
fact('History', 'Britain switched calendars and lost eleven days',
     'In September 1752 the 2nd was followed by the 14th. The tax year still starts on 6 April because the old year end was shifted rather than shortened.',
     'georgian calendar 1752')
fact('Tech', 'Every photograph on your phone is a guess',
     'The sensor records only one colour per pixel behind a chequered filter, and software works out the other two by comparing neighbours.',
     'bayer filter sensor')
fact('Tech', 'Aeroplane mode exists mostly because of the ground',
     'A phone at altitude reaches many masts at once and confuses the network more than it bothers the aircraft. Modern cabins now carry their own small mast.',
     'aeroplane cabin window')
fact('Tech', 'The internet is mostly cables under the sea',
     'Over 95% of international traffic goes through fibre on the sea bed, not satellites. The bundles are about as thick as a garden hose.',
     'submarine communications cable')
fact('Nature', 'A dandelion seed flies on a ring of air',
     'The bristles create a stable vortex above the seed rather than acting like a parachute. It was only properly explained in 2018.',
     'dandelion seed head')
fact('Nature', 'Plants defend themselves with chemicals and warn the neighbours',
     'Damaged leaves release volatile compounds, and nearby plants of the same species start making their own defences before anything has touched them.',
     'leaf damage insect')
fact('Earth', 'Gold on Earth mostly arrived after the planet formed',
     'Iron dragged the original gold into the core. What can be mined is thought to have been delivered by asteroid bombardment afterwards.',
     'gold nugget')
fact('Weather', 'The jet stream is why flying west takes longer',
     'A ribbon of wind at 200 km/h or more runs west to east at cruising height. London to New York is routinely an hour longer than the return.',
     'jet stream map')
fact('Money', 'A credit card number checks itself',
     'The last digit is worked out from the others by a rule called the Luhn algorithm, so a typo is caught before anything is sent anywhere.',
     'credit card numbers')
fact('Buildings', 'The tallest building has a spire you cannot go up',
     'The top 244 m of the Burj Khalifa is unoccupiable structure. Height is measured to the architectural top, so spires are how records are broken.',
     'burj khalifa dubai')
fact('Everyday', 'A tea bag was invented by accident as a sample pouch',
     'A New York merchant sent loose tea in silk bags in 1908 and customers dropped the whole bag in. He had meant them to open it.',
     'tea bag in cup')
fact('Sport', 'Chess has more possible games than atoms in the universe',
     'The Shannon number puts sensible games at around 10 to the power 120. After four moves each there are already over 288 billion positions.',
     'chess board opening')
fact('Oddities', 'Switzerland has bunkers for its entire population',
     'Shelter space is required by law for every resident and has been since 1963. Many are now used as wine cellars, museums, youth hostels and data centres.',
     'swiss civil defence bunker')


if __name__ == '__main__':
    main()
