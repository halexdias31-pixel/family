"""
TWENTY-FIVE PRACTICALS FROM A PASTED LIBRARY, AND TWENTY-ONE THAT WERE ALREADY HERE.

The owner pasted a 46-entry practicals file. Twenty-one of them are already in
`data/practicals.json` under the names this library gave them -- the red cabbage indicator, the
effervescent tablets, elephant's toothpaste, salt and sand, the steel wool, the electrolysis, the
shoebox projector, the scribble bot, the car speeds, the animal ethogram, the five refusals, and
five that are the LAB versions of the same investigation (Hooke's law, refraction, infrared).
Those five are deliberately NOT duplicated: a home version and a school version of one experiment
is two rows that must agree, which is the `needs_print` / `print_required` fault this repository
has already paid 356 rows of disagreement for.

WHAT IS DELIBERATELY NOT IMPORTED, and it is most of the pasted file:

  * `learner_profile` -- an age, a town-level setting and a list of one child's interests.
  * `sessions` -- SIX DATED ROWS CARRYING A CHILD'S FIRST NAME. This repository is public and git
    history is permanent, which is the whole of the `ticks_1/2/3` rule in `check-library.js`: a
    column holding children's handles is not untidy, it is a leak.
  * `status` / `done_on` -- when a particular child was taught a particular thing. Same fact as
    the sessions block, spread over two columns.
  * the notes written about one learner -- "he grew hesitant", "confirm he has a tank",
    "matches his car interest", "before HE is watching".
  * `inventory` -- a record of what the tutor already owns and what it cost.

CLAUDE.md already records this decision once, made about the ten home experiments in September:
"a learner profile: an age, a set of interests, a first session date... none of it is here. Where a
learner-specific line carried a reusable fact it is written as one." Same again. "His RC car" is a
remote-control car anybody can borrow; "confirm he has a tank" is already `feasible` on PR-HM10.

AND ONE ROW IS WRITTEN RATHER THAN IMPORTED. The pasted `heat-pressure` entry carries no method
and no science -- its own note says "Details not recorded. Fill in method/science." Importing an
empty row would be a practical that cannot be run, and guessing which kit was used would be
inventing a record of somebody's session. It goes in as the standard gas-pressure practical it is
the name of, written out in full, claiming nothing about what was done on the day.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, 'data', 'practicals.json')
TOPICS = os.path.join(HERE, 'data', 'topics.json')

HAZARD = {'none', 'very low', 'low', 'medium', 'high'}
WOW = {'low', 'medium', 'medium-high', 'high', 'very high'}
COMPLIANCE = {'AQA required practical', 'AQA-aligned, not a required practical',
              'Not assessed — enrichment'}

# THE SIX PLACE NAMES `check-practicals.js` REFUSES. Asserted here as well as there, because a
# rule that only lives in the checker is a rule the writer can walk past -- CLAUDE.md's own
# sentence about `cost: 0` being repaired in the data and not in the rule.
LOCAL = ['Wandle', 'Colliers Wood', 'Britannia Point', 'Wandsworth', 'Croydon', 'Merton']

# And the learner. Nothing carrying this may reach a public file.
PRIVATE = ['Ernie', 'Pokémon', 'Pokemon']


def key(s):
    return re.sub(r'[^a-z0-9]+', ' ', str(s).lower().replace('&', 'and')).strip()


def known_topics():
    ok = set()
    for line in open(TOPICS, encoding='utf-8'):
        line = line.strip().rstrip(',')
        if not line.startswith('{'):
            continue
        t = json.loads(line)
        if t.get('label'):
            ok.add(key(t['label']))
        ok.add(key(str(t.get('topic_id') or '').replace('-', ' ')))
        for a in str(t.get('aliases') or '').split(','):
            if a.strip():
                ok.add(key(a))
    return ok


KNOWN = known_topics()
ROWS = []
ORDER = [650]


def p(pid, name, subject, **kw):
    """ONE PRACTICAL, WITH THE COLUMNS THE CARD AND THE GUIDE BOTH READ.

    Every assertion here is a rule `check-practicals.js` also enforces. Two writers of one rule is
    the fault this repository records under `MESSAGING` and `childrenOf` -- the difference is that
    these fail where the row is WRITTEN, naming the row, instead of failing a suite run later."""
    row = {
        'practical_id': pid, 'name': name, 'subject': subject,
        'level': kw.get('level', 'KS2–GCSE'), 'exam_board': '', 'spec_ref': '',
        'compliance': kw.get('compliance', 'Not assessed — enrichment'),
        'aim': kw['aim'], 'outcome': kw['outcome'],
        'venue': kw.get('venue', 'home'), 'feasible': kw.get('feasible', 'yes, with kit'),
        'group_size': 1, 'minutes': kw['minutes'],
        'safety': kw['safety'], 'maths_link': kw['maths_link'],
        'item_ids': '', 'notes': kw.get('notes', ''), 'active': True,
        'sort_order': ORDER[0], 'topics': kw['topics'],
        'equipment': kw['equipment'], 'steps': kw['steps'], 'risks': kw['risks'],
        'science': kw['science'], 'log': kw['log'], 'variables': kw['variables'],
        'diagram': '', 'age_min': kw['age_min'],
        'hazard': kw['hazard'], 'wow': kw['wow'],
    }
    if 'cost_per_run_gbp' in kw:
        row['cost_per_run_gbp'] = kw['cost_per_run_gbp']
    if 'setup_cost_gbp' in kw:
        row['setup_cost_gbp'] = kw['setup_cost_gbp']
    ORDER[0] += 10

    assert row['hazard'] in HAZARD, pid + ' hazard: ' + row['hazard']
    assert row['wow'] in WOW, pid + ' wow: ' + row['wow']
    assert row['compliance'] in COMPLIANCE, pid
    assert 4 <= int(row['age_min']) <= 18, pid
    assert row['venue'] in ('home', 'outdoors', 'library room', 'lab'), pid
    for t in row['topics'].split(','):
        t = t.strip()
        assert t, pid + ' has an empty topic — a trailing comma is a second topic'
        assert key(t) in KNOWN, pid + ' names a topic the tree has never heard of: ' + t
    # A HAZARD AND WHAT YOU DO ABOUT IT, ONE PER ITEM. A risks cell with one entry on an experiment
    # involving heat is the shape `check-practicals.js` calls a claim rather than a record.
    assert len([x for x in row['risks'].split('|') if x.strip()]) >= 2, pid + ' needs real risks'
    for col in ('steps', 'equipment', 'science', 'log', 'variables'):
        assert str(row[col]).strip(), pid + ' has no ' + col
    blob = json.dumps(row, ensure_ascii=False)
    for w in LOCAL + PRIVATE:
        assert w.lower() not in blob.lower(), pid + ' carries "' + w + '", which may not be published'
    ROWS.append(row)


# ==================================================================================================
# PHYSICS AND ENGINEERING — the things you build, and then measure
# ==================================================================================================

p('PR-HM12', 'Newton\'s cradle — build one, then compare', 'Physics',
  level='KS2–GCSE', minutes=60, age_min=8, hazard='none', wow='medium',
  aim='Build a Newton\'s cradle from a kit, then put it beside a manufactured one and work out why '
      'the bought one behaves better.',
  outcome='A table of balls dropped against balls swinging out, and a written answer to why the '
          'homemade one loses the pattern after a few swings.',
  topics='Forces, Energy, Units & Measures',
  equipment='A Newton\'s cradle kit — frame, five balls, string | A manufactured Newton\'s cradle, '
            'to compare against | A 30 cm ruler | A phone, to film the swing in slow motion',
  steps='Build the frame square and check it with the ruler before hanging anything — a frame that '
        'is out of true is the whole experiment. | Hang the five balls, then adjust the strings '
        'until every ball hangs at the same height and they just touch in a line. | Lift one ball '
        'to a marked height, let go, and count how many swing out. | Repeat with two, then three, '
        'then four. Write the number down before saying it out loud. | Do exactly the same on the '
        'manufactured cradle. | Film both in slow motion and look at what the homemade one does '
        'that the bought one does not.',
  science='Momentum and energy both pass along the line of balls, and both have to be conserved — '
          'which is why dropping two makes two swing out rather than one going twice as fast. The '
          'bought cradle keeps that pattern for longer because its balls are equal in mass, hung at '
          'equal heights and lined up so they hit squarely. Every one of those is something the '
          'kit build has to get right by hand, and any of them being slightly off sends a little '
          'of the momentum sideways instead of along the line. That is the point of doing both: '
          'the physics is in the toy and the engineering is in why one toy works better.',
  log='Balls dropped against balls swinging out, on the kit | The same on the manufactured one | '
      'How many swings before the pattern falls apart, on each | What is visibly different in the '
      'slow-motion films',
  variables='How many balls are dropped | The height they are dropped from | How level the frame is '
            '| Whether the strings are all the same length | Which cradle is being used',
  safety='Nothing here is sharp, hot or edible. The only real care is the frame: a tall kit frame '
         'on the edge of a table goes over when a ball is lifted, so it sits well back.',
  maths_link='Counting and comparing; measuring string lengths to the millimetre and seeing that a '
             'millimetre matters; a tally of swings before and after.',
  risks='A kit frame is light and tall, and lifting a ball pulls it forward — stand it well back '
        'from the table edge and hold the base for the first few drops. | Small hard balls on a '
        'hard floor roll a long way and are stepped on — count them into the box at the end. | The '
        'strings are thin and get wound round fingers while adjusting — cut them to length with '
        'scissors rather than pulling them tight to snap.',
  notes='THE PAIRING IS THE LESSON AND IT ONLY WORKS IN THAT ORDER. Building first means the '
        'manufactured one stops being a desk toy and becomes the answer to a question that has '
        'already been asked. Handing over the bought one first makes the kit build feel like a '
        'worse version of something. | Expect the homemade one to be visibly worse, and say so '
        'beforehand — the experiment is not spoiled by that, it is the experiment.')

p('PR-HM13', 'Hand-wound motor', 'Physics',
  level='KS2–KS3', minutes=40, age_min=8, hazard='none', wow='medium',
  aim='Build a wind-up mechanism and find out how many winds it takes to go a given distance.',
  outcome='A straight-line graph of winds against distance travelled, and the point where extra '
          'winds stop adding anything.',
  topics='Energy, Forces, Straight Line Graphs, Direct Proportion',
  equipment='A hand-winding motor or wind-up kit | A tape measure or trundle wheel | A stopwatch | '
            'Masking tape, to mark a start line | A clear run of hard floor, about 3 m',
  steps='Build the mechanism from the kit and check it runs freely before measuring anything. | '
        'Tape a start line on the floor. | Wind it five times, set it on the line, let go, and '
        'measure how far it travels. | Repeat three times and take the middle value rather than '
        'the best one. | Do the same at ten winds, fifteen, twenty. | Plot winds against distance '
        'and look for where the line stops being straight.',
  science='Winding the spring stores energy in it — the spring is bent out of shape and wants to '
          'go back. Letting go turns that stored energy into movement, and friction between the '
          'wheels and the floor is what eventually stops it. Twice the winds is roughly twice the '
          'stored energy, which is why the first part of the graph is close to a straight line. It '
          'stops being straight when the spring is nearly fully wound, because the last few turns '
          'store much less than the first few did.',
  log='Winds against distance, three runs at each | The middle value at each number of winds | '
      'Where the graph stops climbing | Run time at each setting, if the mechanism is slow enough '
      'to time',
  variables='The number of winds | The floor surface | Whether the mechanism is released or pushed '
            '| How much the moving part weighs, if anything can be added to it',
  safety='A wound spring under tension is the only thing to watch: it is released by letting go '
         'rather than by taking the mechanism apart.',
  maths_link='Plotting one thing against another and drawing a line of best fit; taking a middle '
             'value from three runs rather than the best one; recognising direct proportion and '
             'then recognising where it stops.',
  risks='A wound spring unwinds suddenly if the mechanism is opened while loaded — it is always '
        'let run down before anything is adjusted. | Small kit parts go under furniture and are '
        'trodden on — the build happens on a tray. | It runs off the end of a table if measured up '
        'there rather than on the floor, which is the only breakage this practical has ever had.')

p('PR-HM14', 'Periscope', 'Physics',
  level='KS2–KS3', minutes=40, age_min=7, hazard='very low', wow='medium',
  aim='Build a periscope from a kit and work out why the mirrors have to sit at exactly 45 degrees.',
  outcome='A working periscope, and a drawing of the light path through it with the angles marked.',
  topics='Reflection, Waves, Angles',
  equipment='A periscope kit, or two small mirrors and a long cardboard box | A protractor | A 30 '
            'cm ruler | Masking tape | A pencil and plain paper, for the ray diagram',
  steps='Build the periscope from the kit, checking each mirror against the protractor as it goes '
        'in. | Use it to look over the back of a sofa and round a door frame. | Now draw what is '
        'happening: light in at the top, off the first mirror, down the tube, off the second, out '
        'to the eye. | Mark the angle the light hits each mirror at and the angle it leaves at. | '
        'Loosen one mirror, tilt it a few degrees, and look again. Draw what changed.',
  science='Light travels in straight lines and bounces off a mirror at the same angle it arrived '
          'at. Two mirrors at 45 degrees turn the beam through 90 degrees each time — down the '
          'tube, then out to your eye — so you end up looking at something your eyes have no '
          'straight line to. Tilting one mirror even slightly sends the beam into the side of the '
          'tube instead of onto the second mirror, which is why the picture disappears rather than '
          'just moving a little.',
  log='The angle each mirror is set at | What can be seen at 45 degrees and what happens at 40 or '
      '50 | A ray diagram with the angles written on it | How far round a corner it will see',
  variables='The angle of each mirror | How long the tube is | How big the mirrors are | Whether '
            'the inside of the tube is light or dark',
  safety='Mirror glass is the one hazard, and kit mirrors are usually plastic. If real glass is '
         'used, its edges are taped before anything is built round it.',
  maths_link='Measuring and drawing angles with a protractor; the angle of incidence equalling the '
             'angle of reflection; turning through 90 degrees twice and ending up parallel.',
  risks='Mirror glass chips and the edges are sharp — tape every edge before the build starts, or '
        'use plastic mirrors. | The tilt-one-mirror step tempts pulling the build apart — loosen '
        'it with tape rather than by force so it goes back. | Walking about while looking through '
        'it means walking into furniture, which is funnier than it is safe.',
  notes='The tilt step is what turns a craft activity into a practical. Without it a periscope is '
        'a thing you made; with it, 45 degrees is a number that had to be that number.')

p('PR-HM15', 'Gas pressure — a balloon on a bottle', 'Physics',
  level='KS2–GCSE', minutes=25, age_min=8, hazard='low', wow='high',
  aim='Make a balloon inflate and deflate without blowing into it, and measure how the temperature '
      'of the air inside changes its volume.',
  outcome='A table of water temperature against balloon circumference, and the reason a sealed '
          'container of air behaves like a thermometer.',
  topics='Energy, Units & Measures, Straight Line Graphs',
  equipment='A glass bottle with a narrow neck | A balloon that fits over the neck | A bowl of hot '
            'water from the tap | A bowl of iced water | A digital thermometer | A tape measure or '
            'a length of string and a ruler | A tea towel',
  steps='Stretch the balloon over the neck of the empty bottle so it seals. | Measure the water in '
        'the hot bowl and write the temperature down. | Stand the bottle in the hot water and '
        'watch the balloon. | When it stops growing, measure round the widest part of the balloon '
        'with the string. | Move the bottle straight into the iced water and watch it go back. | '
        'Measure the cold water and the balloon again. | Repeat with warm water in between, so '
        'there are three points rather than two.',
  science='The bottle is full of air even when it looks empty, and that air is sealed in by the '
          'balloon. Heating it makes the air particles move faster, hit the walls harder and more '
          'often, and spread further apart — so the same amount of air takes up more room, and the '
          'only place for it to go is into the balloon. Cooling does the reverse, and the balloon '
          'gets sucked partly back into the neck. Nothing is added or taken away at any point: the '
          'same particles are in there throughout, which is the part worth saying out loud.',
  log='Water temperature against balloon circumference, at three temperatures | How long it takes '
      'to stop growing each time | Whether it returns to exactly the starting size when cooled | '
      'What happens if the bottle is left in the hot water much longer',
  variables='The temperature of the water | How long the bottle stays in | The size of the bottle | '
            'Whether the balloon seals properly',
  safety='Hot water from the tap is hot enough for this and a kettle is not needed. The tutor '
         'moves the bottle between bowls; a wet glass bottle is a slippery glass bottle.',
  maths_link='Reading a thermometer; measuring a circumference with string and converting to a '
             'diameter; plotting temperature against size and seeing a straight line.',
  risks='Hot water scalds and a wet glass bottle slips — the tutor carries the bottle between '
        'bowls, over a tea towel, every time. | Glass on a hard floor if it is dropped — the bowls '
        'stand on a towel on the table, not on the edge. | A balloon stretched over a bottle neck '
        'can snap back off it — faces stay to the side of the neck rather than over it. | Never a '
        'kettle and never boiling water: tap-hot is enough and the difference is a burn.',
  notes='THE PASTED LIBRARY HAD THIS AS "Heat and Pressure Experiment" WITH NO METHOD AND NO '
        'SCIENCE, and its own note said the details were not recorded. This is the standard '
        'version written out in full rather than a reconstruction of what was actually done on the '
        'day — if the original used a different kit, this row is a good practical under the right '
        'name rather than a record of that session. | Worth pairing with the can-crush version '
        'later: same physics, more alarming, needs a hob.')

p('PR-HM16', 'Pendulum timing', 'Physics',
  level='KS2–GCSE', minutes=30, age_min=8, hazard='none', wow='low',
  aim='Find out what actually changes how fast a pendulum swings, and rule out the thing everybody '
      'guesses first.',
  outcome='A graph of length against the time for ten swings, and a measured demonstration that '
          'the mass makes no difference.',
  topics='Forces, Straight Line Graphs, Mean, Units & Measures',
  equipment='About 1.5 m of string | Three weights of clearly different mass — washers, a bag of '
            'coins, a heavy nut | A stopwatch | A metre rule | A clamp stand, or a heavy book on '
            'the edge of a table to trap the string under',
  steps='Hang a weight on 20 cm of string. | Pull it to one side by a hand-span and let go without '
        'a push — the push is the commonest way to ruin this. | Time TEN swings and divide by ten, '
        'rather than timing one. | Repeat twice more at the same length and take the middle value. '
        '| Do the same at 40 cm, 60 cm, 80 cm, 100 cm. | Now go back to one length and swap the '
        'weight for a much heavier one. Time it again. | Plot length against time. Write down what '
        'the mass did.',
  science='A pendulum\'s swing time depends on its length and on gravity, and on nothing else that '
          'matters here. Making it heavier pulls it down harder, but it also makes it harder to '
          'get moving, and those two cancel out exactly — which is why the heavy weight and the '
          'light one keep time together. Making it longer gives the bob further to travel on each '
          'swing, so it takes longer. The graph is not a straight line: to get one you plot the '
          'time against the square root of the length, which is the point at which this becomes a '
          'GCSE practical rather than a KS2 one.',
  log='Length against the time for ten swings, three runs at each | The middle value at each length '
      '| The time for ten swings with a light bob and a heavy one at the same length | Whether the '
      'starting angle changed anything',
  variables='The length of the string | The mass of the bob | The angle it is released from | '
            'Whether it is released or pushed',
  safety='A weight on a string swung indoors reaches further than people expect. It swings along '
         'the table, not out into the room, and nobody stands in the arc.',
  maths_link='Timing ten and dividing by ten to reduce the error, which is the first real lesson in '
             'measurement; taking a middle value from three; plotting a curve and recognising it is '
             'not a straight line.',
  risks='A heavy bob on a long string is a pendulum aimed at somebody — set the swing along the '
        'table and keep the far end clear. | The string slips out from under a book mid-swing and '
        'the weight goes across the room — clamp it, or trap it under something heavier than you '
        'think is needed. | Small washers and coins on the floor are a slip hazard — count them in '
        'and out.',
  notes='THE MASS STEP IS THE WHOLE PRACTICAL and it is worth asking for a prediction in writing '
        'before it is run. Almost everybody says the heavy one will swing faster. Being wrong '
        'about that, with their own stopwatch, is the bit that stays.')

p('PR-HM17', 'Slinky waves', 'Physics',
  level='KS2–KS3', minutes=20, age_min=6, hazard='very low', wow='medium',
  aim='See the two kinds of wave with your own hands, and measure how fast one travels down the '
      'spring.',
  outcome='A drawing of each wave type with the direction of vibration and the direction of travel '
          'marked, and a rough speed in metres per second.',
  topics='Waves, Compound Measures, Units & Measures',
  equipment='A metal slinky, or a long soft spring | A clear run of hard floor, about 3 m | A tape '
            'measure | A stopwatch | A short length of coloured wool, tied to one coil',
  steps='Two people, one end each, spring stretched along the floor between them. | Push your end '
        'sharply towards the other and let go: the squash travels down the spring. That is '
        'longitudinal. | Now flick your end sideways: the hump travels down instead. That is '
        'transverse. | Watch the coloured wool in each case and say which way it moves compared to '
        'which way the wave goes. | Measure the distance between the two ends. | Time how long a '
        'pulse takes to travel down and back, five times, and take the mean. | Speed is twice the '
        'distance divided by the time.',
  science='A wave carries energy from one place to another without carrying the stuff it travels '
          'through. The wool proves it: it moves and comes back, and it ends up where it started, '
          'while the wave has gone right down the spring. In a longitudinal wave the coils vibrate '
          'along the same direction the wave travels, which is how sound moves through air. In a '
          'transverse wave they vibrate across it, which is how light and water waves behave. '
          'Stretching the spring further makes the pulse travel faster, which is why the distance '
          'has to be measured for every run rather than once.',
  log='Which way the wool moves against which way the wave goes, for each type | Distance between '
      'the ends | Five times for a pulse down and back | The mean speed in m/s | What happens to '
      'the speed when the spring is stretched further',
  variables='How far the spring is stretched | How hard the pulse is started | Which type of wave | '
            'Whether the far end is held or free',
  safety='A metal slinky that gets away is the only real hazard here, and it is a real one: it '
         'whips and it tangles. It is held at both ends the whole time.',
  maths_link='Speed as distance over time; doubling the distance because the pulse goes down and '
             'back; taking a mean of five timings; unit conversion from centimetres to metres.',
  risks='A stretched metal slinky released at one end whips back hard and can catch a face — both '
        'ends are held at all times and it is never stretched towards anybody. | A slinky dropped '
        'while stretched tangles permanently, which ends the practical — it is relaxed before it '
        'is put down. | Metal coils pinch fingers when the spring is squashed — hold the end coils '
        'rather than gripping the middle.',
  setup_cost_gbp=5,
  notes='This is one of the few practicals where two people are genuinely required, which makes it '
        'a good one for a session where the tutor is otherwise setting something up.')

p('PR-HM18', 'Circuits — series, parallel, and what conducts', 'Physics',
  level='KS2–GCSE', minutes=45, age_min=8, hazard='very low', wow='medium',
  aim='Build circuits that work and circuits that do not, and find out what a circuit actually '
      'needs before anything lights up.',
  outcome='A table of materials against whether they conduct, and a measured answer to why two '
          'bulbs in series are dimmer than two in parallel.',
  topics='Electricity, Straight Line Graphs',
  equipment='A snap-together circuits kit, or a battery holder, leads, bulbs and a switch | Two '
            'identical bulbs | A buzzer and a small motor, if the kit has them | A handful of test '
            'objects — a coin, a paperclip, a rubber, a pencil lead, a plastic ruler, a wooden '
            'lolly stick, kitchen foil',
  steps='Build the simplest thing that works: battery, bulb, wires, complete loop. | Break the loop '
        'anywhere and confirm it goes out wherever you break it. | Add a switch and find out that a '
        'switch IS a break you can control. | Put two bulbs in series and look at the brightness. | '
        'Rebuild them in parallel and look again. | Now make a gap in the circuit with two bare '
        'wire ends, and bridge it with each test object in turn. | Record conducts or does not for '
        'each one, and sort them afterwards into two groups.',
  science='Current needs a complete loop from one end of the battery to the other — break it '
          'anywhere and everything stops, which is why a broken bulb takes the whole string out in '
          'series. In series the same current goes through both bulbs and the battery\'s push is '
          'shared between them, so each gets about half and both are dim. In parallel each bulb '
          'gets the full push on its own branch, so both are bright — and the battery runs down '
          'faster, because it is now supplying two full currents instead of one. What conducts '
          'turns out to be almost exactly what is metal, which is a better rule to arrive at from '
          'a table than to be told.',
  log='Material against conducts or not | Brightness of one bulb, two in series, two in parallel | '
      'What happens when one bulb is unscrewed in each arrangement | How long the battery lasts in '
      'each, if there is time',
  variables='Series or parallel | The number of bulbs | The material bridging the gap | The number '
            'of batteries',
  safety='Everything here runs on a battery of a few volts and nothing plugs into a wall. The one '
         'rule that matters is the one about not connecting a battery straight to itself.',
  risks='A wire from one battery terminal straight to the other with nothing in between is a short '
        'circuit: the wire gets hot fast and the battery can leak — check every build before it is '
        'connected, and disconnect between tests. | Batteries left in a kit box next to steel wool '
        'or foil can short in the box — the batteries come out at the end of the session. | Small '
        'bulbs get hot enough to be uncomfortable after a few minutes on — they are unscrewed by '
        'the base, not the glass.',
  maths_link='Recording a two-way result in a table; comparing brightness as a rough ordinal scale '
             'and noticing that is weaker evidence than a number; dividing a voltage between '
             'components.',
  setup_cost_gbp=30,
  notes='A snap-together kit is worth the money over loose components for a first session: crocodile '
        'clips that will not stay on turn a physics practical into a fine-motor one. Loose '
        'components are better once the ideas are in place. | The motor from this kit is also what '
        'the scribble bot (PR-HM08) needs, so the two are worth buying together.')

p('PR-HM19', 'Electromagnet — how many paperclips', 'Physics',
  level='KS3–GCSE', minutes=40, age_min=8, hazard='very low', wow='high',
  aim='Make a magnet out of electricity, then find out what makes it stronger.',
  outcome='A graph of coil turns against paperclips lifted, and a magnet that can be switched off.',
  topics='Magnetism & Electromagnetism, Electricity, Straight Line Graphs, Direct Proportion',
  equipment='About 2 m of enamelled copper wire | A large iron nail | A battery and holder | A '
            'switch, or just disconnect a lead | A box of steel paperclips | Bar magnets and iron '
            'filings in a sealed tray, for the field-lines part | Fine sandpaper, to strip the '
            'wire ends',
  steps='First, the field you cannot see: put a bar magnet under paper, sprinkle iron filings on '
        'top, tap the paper. Sketch the pattern. | Now wind twenty turns of wire round the nail, '
        'neatly and all the same way. | Sand the enamel off both ends of the wire — the wire looks '
        'bare and is not. | Connect to the battery, dip the nail into the paperclips, lift, and '
        'count what comes up. | Disconnect and watch them drop. | Add twenty more turns and repeat. '
        'Then twenty more. | Plot turns against paperclips.',
  science='A current in a wire makes a magnetic field round it, and winding the wire into a coil '
          'stacks those fields on top of each other so they add up. The iron nail concentrates the '
          'field further, which is why a nail lifts far more than the coil alone. More turns means '
          'more field and more paperclips, roughly in proportion, until the iron is fully '
          'magnetised and adding turns stops helping. The part worth pausing on is the switch-off: '
          'a permanent magnet cannot be turned off, and this one can, which is exactly why scrapyard '
          'cranes and doorbells use electromagnets rather than permanent ones.',
  log='Field-line sketch from the filings | Turns against paperclips lifted, at 20, 40 and 60 | '
      'Whether they all drop the instant the circuit is broken | What happens with the battery the '
      'other way round',
  variables='The number of turns | The core — iron nail, pencil, nothing | The number of batteries '
            '| Which way the current flows',
  safety='The wire warms up while the circuit is closed, and warms up quickly if the coil is left '
         'connected. It is connected for the few seconds of a lift and then disconnected.',
  risks='A coil left connected gets hot enough to burn a finger and flattens the battery in '
        'minutes — disconnect between every test, without exception. | Iron filings are almost '
        'impossible to get off a magnet and get into eyes if blown — they stay in a sealed tray or '
        'a bag, and the magnet stays outside it, under the paper. | Enamelled wire ends are sharp '
        'and the sanded ends more so — the tutor strips them. | Paperclips are swallowable and this '
        'is a practical that scatters them.',
  maths_link='Plotting turns against paperclips and seeing proportion, then seeing where it stops; '
             'counting a repeatable quantity; a fair test where only one thing changes.',
  setup_cost_gbp=16,
  notes='The filings step at the start is what makes the rest make sense — without it an '
        'electromagnet is a nail that picks things up, and with it there is a field to picture. | '
        'A sealed filings tray is worth buying over loose filings for exactly the reason in the '
        'risks column.')

p('PR-HM20', 'Balloon-powered car', 'Physics',
  level='KS2–GCSE', minutes=45, age_min=7, hazard='none', wow='high',
  aim='Build a car that moves without being pushed, then change one thing at a time to make it go '
      'further.',
  outcome='A car, a table of design changes against distance, and a sentence naming what is '
          'actually pushing it.',
  topics='Forces, Compound Measures, Straight Line Graphs, Mean',
  equipment='A plastic bottle, for the chassis | Two bamboo skewers, for axles | Four bottle lids, '
            'for wheels | Drinking straws, to hold the axles | A balloon | A wider straw, taped '
            'into the balloon\'s neck | Tape | A tape measure or trundle wheel | A stopwatch',
  steps='Tape two straws across the bottle, front and back, and push a skewer through each. | Make '
        'a hole in the centre of each lid and push one onto each skewer end. Spin them — if they '
        'wobble, the holes are off centre, and that is worth fixing now. | Tape the balloon over '
        'the end of the wide straw, and tape the straw along the top of the bottle pointing '
        'backwards. | Blow through the straw to inflate the balloon, pinch it, set the car down, '
        'let go. | Measure the distance. Run it three times and take the mean. | Now change ONE '
        'thing — wheel size, balloon size, how much air, where the straw points — and run it three '
        'times again.',
  science='Air rushes backwards out of the straw, and the car goes forwards. That is Newton\'s '
          'third law: push something one way and it pushes you back the other way, equally hard. '
          'Nothing is pushing against the air in front or against the floor — the car would work '
          'in a vacuum, and a rocket is exactly this. What stops it is friction in the axles and '
          'between the wheels and the floor, which is why wobbly wheels and a tight straw cost more '
          'distance than anything else on the car.',
  log='Distance for each design, three runs and a mean | Time over the distance, so speed can be '
      'worked out | Which single change gained the most | What the car does on carpet against a '
      'hard floor',
  variables='Balloon size | How much air goes in | Wheel diameter | How freely the axles turn | The '
            'surface | Where the straw points',
  safety='A burst balloon is the only thing that happens here, and the pieces are a choking hazard '
         'for anybody much younger than the student.',
  risks='Skewer points are genuinely sharp and this build involves pushing them through plastic — '
        'the tutor cuts the points off with scissors before the build starts. | Burst balloon '
        'fragments are a choking hazard and go straight in the bin rather than on the table. | '
        'Making holes in bottle lids is the one step that wants a sharp point and a hand underneath '
        '— the tutor does it, lid on a cork or a rubber, not held in a palm.',
  maths_link='Mean of three runs; speed as distance over time; changing one variable at a time and '
             'attributing the difference to it; percentage improvement between designs.',
  notes='THE FIRST CAR SHOULD BE BUILT FAST AND BADLY. A careful first build takes the whole '
        'session and leaves no time to change anything, and changing things is the practical. | '
        'The off-centre wheel hole is the commonest reason a car veers, and noticing that yourself '
        'is worth more than being told.')

p('PR-HM21', 'Lolly-stick catapult', 'Physics',
  level='KS2–GCSE', minutes=40, age_min=7, hazard='very low', wow='medium',
  aim='Build a catapult and find the launch angle that throws furthest.',
  outcome='A graph of angle against distance with a clear peak, and the angle that peak sits at.',
  topics='Forces, Energy, Angles, Straight Line Graphs',
  equipment='About ten lolly sticks | Several elastic bands | A bottle lid, for the cup | Pom-poms '
            'or scrunched paper, as ammunition | A protractor | A tape measure | Masking tape, for '
            'a firing line',
  steps='Build the catapult: a stack of sticks banded at both ends as the body, two more as the '
        'throwing arm and base, banded at one end to make a hinge. | Tape the bottle lid to the '
        'end of the arm. | Tape a firing line on the floor and always fire from behind it. | Set '
        'the arm to pull back to a marked point every time — this is the variable that ruins the '
        'experiment if it is left to feel. | Fire at a low angle, measure where it lands, three '
        'times. | Repeat at roughly 20, 30, 45, 60 and 75 degrees, checking each with the '
        'protractor. | Plot angle against mean distance.',
  science='Pulling the arm back stretches the bands and stores energy in them; letting go turns '
          'that into movement. Where the pom-pom lands depends on two things at once — how fast it '
          'leaves and at what angle. A low angle gives it plenty of forward speed but almost no '
          'time in the air; a steep angle gives it lots of time and almost no forward speed. The '
          'best compromise is about 45 degrees, and the graph should have a hump with its top '
          'somewhere near there. Air resistance on something as light as a pom-pom pulls the real '
          'answer slightly below 45, which is a good thing to notice rather than to explain away.',
  log='Angle against distance, three shots at each | Mean distance per angle | Where the peak of '
      'the graph sits | What changes if the pull-back distance is doubled',
  variables='The launch angle | How far the arm is pulled back | The number of elastic bands | The '
            'mass of the projectile',
  safety='Soft ammunition only, and it is never aimed at a person or an animal. That is the whole '
         'of the safety brief and it is not negotiable.',
  risks='An elastic band that snaps during the build flicks back into a face — the tutor does the '
        'banding, and safety glasses are not excessive if the bands are old. | A catapult aimed at '
        'a person is the obvious risk and the rule is stated before the build, not after the first '
        'shot. | Pom-poms under furniture end with somebody crawling about near a table leg — fire '
        'along a clear run.',
  maths_link='Measuring and setting an angle with a protractor; mean of three; plotting a curve and '
             'reading off where it peaks; the idea that a maximum is a point rather than a trend.',
  setup_cost_gbp=3)

p('PR-HM22', 'A remote-control car on four surfaces', 'Physics',
  level='KS2–GCSE', minutes=40, age_min=8, hazard='none', wow='medium',
  aim='Measure how fast a remote-control car goes on different surfaces and work out what is '
      'slowing it down.',
  outcome='A bar chart of surface against speed, and a ranking of the surfaces by how much friction '
          'they add.',
  topics='Forces, Compound Measures, Bar Charts & Pictograms, Mean',
  equipment='A remote-control car | A tape measure or trundle wheel | A stopwatch | Masking tape, '
            'for start and finish lines | Four surfaces to try — carpet, hard floor, pavement, '
            'short grass',
  steps='Mark a start and a finish line a fixed distance apart — 5 m works indoors, 10 m outside. | '
        'Run the car flat out from a rolling start over the line, and time it between the marks. | '
        'Three runs on each surface, mean of three. | Use the same distance on every surface, or '
        'the comparison is worthless. | Check the battery at the start and at the end: if it has '
        'dropped, the last surface is unfairly slow and the run order has to be rotated. | Work out '
        'speed for each and draw a bar chart.',
  science='The car\'s motor pushes it forward and friction between the tyres and the ground pushes '
          'back. Rough surfaces like grass and carpet have far more of it, so the car settles at a '
          'lower top speed — it is not that the motor is weaker, it is that the backward push '
          'balances the forward one sooner. Grass does something extra: the wheels have to push '
          'blades out of the way as well, so energy goes into moving the grass rather than the car. '
          'The battery matters because a battery that is running down pushes less hard, which is '
          'why the run order has to be rotated rather than done in the obvious sequence.',
  log='Surface against time over the fixed distance, three runs | Mean time and calculated speed '
      'per surface | Battery state at the start and the end | Whether the ranking holds when the '
      'run order is reversed',
  variables='The surface | The distance run | The battery level | Whether the start is rolling or '
            'standing | Which car',
  safety='Outdoors this happens well away from a road, on a path or a garden, with the car never '
         'driven towards the kerb.',
  risks='A car at speed on a pavement runs into the road if the finish line is anywhere near a '
        'kerb — the run is set up parallel to the road, never towards it, with an adult at the far '
        'end. | Timing while walking backwards is how people trip — the timer stands still at the '
        'finish line. | A car driven on grass picks up water and grit and should be wiped down, or '
        'the last surface is the one that breaks it.',
  maths_link='Speed as distance over time; mean of three runs; drawing a bar chart with a sensible '
             'scale; recognising a confounding variable — the battery — and designing round it.',
  notes='THE BATTERY IS THE REAL LESSON HERE and it is the thing that makes this better than it '
        'looks. Running carpet, then floor, then grass gives grass the flattest battery and the '
        'answer everybody expected. Rotating the order, or recharging between, is the difference '
        'between a fair test and a confirmation.')

p('PR-HM23', 'Egg drop', 'Physics',
  level='KS2–GCSE', minutes=45, age_min=7, hazard='none', wow='high',
  aim='Design something that lets an egg survive a fall, and work out why the successful ones work.',
  outcome='A surviving egg, and a written reason involving stopping time rather than softness.',
  topics='Forces, Energy, Estimation',
  equipment='Eggs, several — allow for failures | Paper, straws, tape, string, plastic bags | A '
            'tape measure | A bin bag or a tray to drop onto | A step ladder or an upstairs window, '
            'with an adult',
  steps='Set a materials limit — say ten straws, one sheet of paper, 50 cm of tape — because '
        'unlimited materials means wrapping the egg in a duvet and learning nothing. | Fifteen '
        'minutes to design and build. | Drop from a low height first, over a tray. If it survives, '
        'go higher. | Record the height it survived and the height it failed at. | Rebuild once, '
        'changing one thing, and try to beat it. | At the end, look at what the survivors had in '
        'common.',
  science='The egg breaks because of the FORCE on it, and the force depends on how quickly it is '
          'brought to a stop. Falling from higher means hitting faster, so there is more speed to '
          'lose. A design that works does one of two things: it spreads the force over more of the '
          'shell so no single point takes it all, or it makes the stop take longer — crumple zones, '
          'a straw cage that collapses, a parachute that slows the fall. Longer stop, smaller '
          'force. It is the same reason cars have crumple zones and why you bend your knees when '
          'you land, and both of those are worth naming once the egg has survived.',
  log='Height dropped from against survived or not, per design | Which design element each survivor '
      'had | How the winning design failed when it finally did | Rough estimate of the drop time',
  variables='Drop height | How much material is allowed | Whether the design slows the fall or '
            'cushions the landing | Which way up it lands',
  safety='The drop happens outdoors or over a tray, and the person dropping is an adult on the step '
         'ladder — nobody stands underneath, and nobody climbs to watch.',
  risks='Raw egg on a hard floor is a slip hazard and a salmonella one — everything lands on a bin '
        'bag or a tray, and hands are washed at the end. | Dropping from a height means somebody is '
        'up a ladder or at a window: the adult drops, the student watches from the ground, and '
        'nobody stands under the drop zone. | Eggshell fragments in a cardboard design are sharp '
        'enough to cut when the failures are unwrapped — the tutor opens them.',
  maths_link='Recording a yes/no result against a continuous variable; estimating fall time and '
             'therefore speed; the idea of a fair test when each trial destroys the sample.',
  notes='TWO BUILDS IS BETTER THAN ONE GOOD ONE. The second build, with one change and a reason '
        'for it, is where the design thinking is — the first is just enthusiasm.')

p('PR-HM24', 'Gear build — follow the drive through', 'Physics',
  level='KS2–GCSE', minutes=60, age_min=9, hazard='none', wow='medium',
  aim='Build a mechanism from technical instructions, then trace how the turning gets from the '
      'motor or handle to the wheels.',
  outcome='A working build, and a drawing of the gear train with the direction of each gear marked '
          'and the overall ratio worked out.',
  topics='Forces, Writing & Simplifying Ratio, Ratio Problems',
  equipment='A technic-style construction set with gears — any brand | The instruction booklet | '
            'Plain paper and a pencil, for the gear diagram | A marker or a sticker, to mark one '
            'tooth so turns can be counted',
  steps='Build to the instructions. Split the job: one person finds parts, the other assembles, '
        'then swap every few pages. | When it is done, find the gear the handle or motor turns, and '
        'the gear the wheels are on. | Put a sticker on one tooth of each. | Turn the input gear '
        'exactly ten times and count how many turns the output makes. | That is the gear ratio — '
        'write it as a ratio and simplify it. | Draw the gear train and mark which way each gear '
        'turns. | Count the teeth on two meshing gears and check the ratio matches what you '
        'measured.',
  science='Two meshing gears always turn in opposite directions, so a train of three brings you '
          'back to the same direction as the first — which is why gear trains have idlers in them. '
          'The ratio of the teeth is the ratio of the turns, the other way up: a small gear driving '
          'a big one means the big one turns fewer times but turns harder. That is the trade every '
          'gearbox makes — speed for turning force, and you never get both. A bicycle in a low gear '
          'is the same mechanism, and so is the difference between the first and top gear in a car.',
  log='Input turns against output turns | The ratio, written and simplified | Tooth counts on each '
      'meshing pair | Which way each gear turns | Whether the measured ratio matches the tooth '
      'counts',
  variables='Which gears mesh | How many gears in the train | Which gear the input goes to | '
            'Whether an idler is added',
  safety='Nothing here is dangerous. The parts are small, which matters if there is a much younger '
         'child or a dog in the room.',
  risks='Small parts are a choking hazard for younger siblings and are eaten by dogs — the build '
        'happens on a tray, and the tray goes up out of reach at the end of the session. | Gear '
        'teeth pinch fingers when a train is turned by hand under load — turn the input, not the '
        'output. | Standing on a dropped technic pin hurts enough to end a session; count them back '
        'into the box.',
  maths_link='Gear ratio as a ratio, written and simplified; counting teeth and predicting the '
             'ratio before measuring it; the inverse relationship between speed and turning force.',
  notes='THE BUILD IS NOT THE PRACTICAL — the gear trace afterwards is, and it takes ten minutes. A '
        'session that ends when the model is finished has been an afternoon of following '
        'instructions. | Pair building (one fetches, one assembles, then swap) keeps both people in '
        'it; a long complex build done alone is where interest is usually lost. | Good fallback '
        'activity when something else has overrun.')

p('PR-HM25', 'Cardboard pinball table', 'Physics',
  level='KS2–KS3', minutes=90, age_min=8, hazard='very low', wow='medium',
  aim='Build a sloped pinball table and use it to find out what the slope does to the ball.',
  outcome='A playable table, and a measured answer to how the slope angle changes how long a ball '
          'stays in play.',
  topics='Forces, Energy, Angles, Mean',
  equipment='A large cardboard box lid, or stiff card | An elastic band and a lolly stick, for the '
            'launcher | Marbles or ball bearings | Cardboard tubes and offcuts, for bumpers | Tape '
            'and glue | A protractor | A stopwatch | Books, to prop the table at different angles',
  steps='Cut the base to size and tape a channel down one side for the launcher. | Build the '
        'launcher: a lolly stick on an elastic band, pulled back and released. | Glue bumpers and '
        'obstacles on, leaving a clear run from the launcher. | Prop the top of the table on one '
        'book and measure the angle with the protractor. | Launch with the same pull-back every '
        'time and time how long the ball stays on the table. Five runs, take the mean. | Add '
        'another book, measure the new angle, repeat. | Plot angle against mean time in play.',
  science='On a sloped table, gravity is always pulling the ball down the slope, and the steeper '
          'the slope the bigger the share of that pull that acts along the table. So a steep table '
          'drains the ball fast and a shallow one lets it wander. The bumpers take energy out of '
          'the ball each time it hits one — the ball leaves slower than it arrived — which is why a '
          'ball eventually stops climbing back up no matter how hard it was launched. That is the '
          'same reason a real pinball table is sloped at a few degrees rather than flat or steep.',
  log='Slope angle against mean time in play, five runs each | How many bumpers the ball hits '
      'before it drains | Whether the same pull-back gives the same launch every time | The angle '
      'that gives the longest game',
  variables='The slope angle | The pull-back distance on the launcher | The number and placing of '
            'bumpers | The ball — marble or bearing',
  safety='A marble on a hard floor is a slip hazard and the table build involves cutting card, '
         'which the tutor does.',
  risks='Cutting stiff card needs a craft knife and that is the tutor\'s job, on a cutting mat, '
        'with the student not leaning over it. | Marbles roll off and are stepped on — the table '
        'sits on a towel that catches them, and they are counted back in. | Hot glue, if used, '
        'burns through skin before it can be wiped off — a glue stick or tape is enough for this '
        'and is the better choice.',
  maths_link='Measuring an angle with a protractor; mean of five timings; plotting angle against '
             'time and reading off a best value; keeping a launch variable constant by marking it.',
  notes='THE HONEST WARNING: this is a long build for a fairly small amount of science, and it is '
        'in the library as a two-session project rather than a one-session practical. Build in the '
        'first session, measure in the second. | It earns its place when somebody wants to make '
        'something and keep it, which the measuring practicals mostly do not give them.')

# ==================================================================================================
# CHEMISTRY
# ==================================================================================================

p('PR-HM26', 'Lava lamp', 'Chemistry',
  level='KS2–KS3', minutes=20, age_min=6, hazard='none', wow='medium',
  aim='Make a lava lamp out of a bottle, and explain why the blobs go up and then come back down.',
  outcome='A timed run per tablet piece, and a drawing labelled with which layer is denser.',
  topics='Density, Compound Measures, Rate of Reaction',
  equipment='A tall clear bottle or glass | Vegetable oil | Water | Food colouring | Effervescent '
            'tablets | A tray, to stand it in | A stopwatch',
  steps='Quarter-fill the bottle with water. | Top it up with oil, slowly, and let the two settle. '
        'Ask which is on top and why before saying anything. | Add ten drops of food colouring and '
        'watch them fall through the oil and only mix once they reach the water. | Break a tablet '
        'into quarters and drop one in. | Time how long the bubbling lasts. | Repeat with a half '
        'and then a whole tablet, and with cold water and then warm.',
  science='Oil floats because it is less dense than water — the same volume of it weighs less — and '
          'the two do not mix because oil molecules and water molecules will not bond to each '
          'other. The tablet sinks through the oil to the water, reacts, and makes carbon dioxide. '
          'Each bubble carries a blob of coloured water up with it; at the top the bubble escapes '
          'into the air, the blob is suddenly denser than the oil round it again, and down it goes. '
          'Nothing is heating anything — a real lava lamp uses heat to change density, and this one '
          'uses gas, which is a nice difference to be able to state.',
  log='Tablet size against how long the bubbling lasts | Cold water against warm water | Roughly how '
      'many blobs a minute | Whether the oil and water ever mix',
  variables='The size of the tablet piece | The water temperature | How much oil against how much '
            'water | The shape of the bottle',
  safety='Everything here is kitchen-safe. The oil is the only mess and it is a real one on a '
         'carpet.',
  risks='Spilt oil on a floor is slippery and stains — the bottle stands in a tray for the whole '
        'session, including while it is being filled. | Food colouring stains hands, clothes and '
        'worktops permanently — it goes in by the drop, over the tray. | It looks like a drink, and '
        'that is worth saying out loud once before anything is added.',
  maths_link='Density as mass for a given volume; timing and comparing; proportion between tablet '
             'size and how long the reaction runs.',
  notes='Best run straight after the rates-of-reaction tablets (PR-HM05), because it is the same '
        'reaction met a second time doing something else entirely.')

p('PR-HM27', 'The naked egg', 'Chemistry',
  level='KS2–GCSE', minutes=15, age_min=6, hazard='none', wow='high',
  aim='Dissolve an eggshell with vinegar, and then find out what the bare egg does when it is left '
      'in water.',
  outcome='A shell-less bouncing egg, and a before-and-after mass showing it has gained water.',
  topics='Chemical Changes, Cell Biology, Percentages',
  equipment='Two raw eggs | White vinegar | Two jars or glasses with loose lids | A digital kitchen '
            'scale | A tape measure or a length of string | Water | Golden syrup or a strong salt '
            'solution, for the extension',
  steps='Weigh each egg and measure round it with the string. Write both down. | Cover both eggs '
        'with vinegar. Lids loose — this fizzes. | Look at it after five minutes: the shell is '
        'covered in bubbles. Ask what the gas is. | Leave it. At the next session, change the '
        'vinegar. | At about 48 hours, rinse very gently. The shell has gone and the egg is '
        'rubbery. | Weigh and measure again. | Extension: put one bare egg in plain water and one '
        'in golden syrup overnight, and weigh both again.',
  science='Eggshell is calcium carbonate, and vinegar is an acid. Acid on a carbonate gives a salt, '
          'water and carbon dioxide — those bubbles are the carbon dioxide, and they are the shell '
          'leaving. What is left is the membrane underneath, which is not dissolved by vinegar. '
          'That membrane is partially permeable: water can cross it and bigger molecules cannot. So '
          'in the vinegar, and then in plain water, water moves INTO the egg and it swells; in '
          'syrup, water moves out and it shrivels. That is osmosis, on an egg you can hold, which '
          'is the same process as the potato cylinders in the GCSE required practical.',
  log='Mass and circumference before, after the vinegar, and after the water or syrup | Percentage '
      'change in mass at each stage | How long the fizzing lasted | How high the egg bounces before '
      'it breaks',
  variables='How long it sits in the vinegar | Whether the vinegar is changed | What the bare egg '
            'goes into next | The temperature of the vinegar',
  safety='Raw egg is the only concern and it is a food-hygiene one rather than a chemical one.',
  risks='Raw egg on hands and surfaces is a salmonella risk — hands washed after every handling, '
        'surfaces wiped, and the eggs are not eaten at any point. | The bare egg bursts, and it '
        'bursts over whatever is underneath — the bounce test happens over a sink or a tray, from a '
        'few centimetres, not across a room. | Vinegar in the eyes stings; the jar is not sniffed '
        'closely while it is fizzing.',
  maths_link='Percentage change in mass; measuring a circumference with string; comparing two '
             'conditions against one control.',
  notes='START IT AT THE END OF A SESSION. It needs 48 hours, which means it is ready two sessions '
        'later, and the delay is a feature — there is something waiting when they come back. | The '
        'syrup extension is the part that turns a trick into the osmosis practical, and it costs '
        'one extra night.')

p('PR-HM28', 'Click hand warmer', 'Chemistry',
  level='KS3–GCSE', minutes=20, age_min=7, hazard='very low', wow='high',
  aim='Set off a hand warmer and measure how much it heats up and how long it stays warm.',
  outcome='A cooling curve for the warmer, and the temperature it peaks at.',
  topics='Crystallisation, Energy Changes, Solubility, Real-Life Graphs',
  equipment='A reusable sodium acetate click hand warmer | A digital thermometer, or an infrared '
            'one | A stopwatch | A pan of water and a hob, to reset it | A tea towel',
  steps='Feel the warmer while it is still liquid and take its temperature. | Click the metal disc '
        'and watch the crystals spread from it. | Take the temperature every 30 seconds for the '
        'first five minutes, then every two minutes after that. | Keep going until it is back to '
        'room temperature. | Plot temperature against time. | Reset it: the tutor boils it in water '
        'until it is completely clear again, then lets it cool undisturbed.',
  science='Inside is a supersaturated solution — more sodium acetate is dissolved in the water than '
          'should be able to stay dissolved at that temperature, which is only possible because it '
          'was heated to dissolve it and then cooled without being disturbed. It is balanced on a '
          'knife edge. The click bends the metal disc and makes a tiny rough spot for the first '
          'crystal to form on, and once there is one, the rest crystallise off it in seconds. '
          'Forming crystals RELEASES energy — the same energy that had to be put in to dissolve it '
          '— so the pack gets hot. Boiling it dissolves everything again and resets the whole '
          'thing, which is why it is reusable and a chemical hand warmer is not.',
  log='Temperature every 30 seconds, then every two minutes | The peak temperature and how long it '
      'took to get there | How long it stays above body temperature | The shape of the cooling '
      'curve',
  variables='How long before the disc is clicked | How warm the room is | Whether it is wrapped or '
            'in the open | How big the warmer is',
  safety='The reset is a pan of boiling water and the tutor does all of it. The warmer itself gets '
         'to about 50 degrees, which is hot to hold but not a burn.',
  risks='The reset means boiling water and a sealed plastic pouch, which can float against a hot '
        'pan base and split — the tutor does it, the pouch sits on a folded tea towel in the pan, '
        'and the student is not at the hob. | A split pouch leaks hot sodium acetate solution, '
        'which is not very harmful but is very hot — a split warmer is binned rather than reset '
        'again. | It reaches about 50 degrees, which is uncomfortable against thin skin for a long '
        'time — it is held in a palm, not taped to anybody.',
  setup_cost_gbp=8,
  maths_link='Plotting a cooling curve and reading off its peak; choosing a sampling interval that is short where the change is fast and long where it is slow, which is a real decision rather than a rule.',
  notes='PAIR IT WITH THE COLD REACTION (PR-HM35) IN THE SAME SESSION. One gets hot, one gets cold, '
        'both are chemical changes, and the pair is the whole of exothermic and endothermic in '
        'twenty minutes. | Resetting it takes about ten minutes of boiling, so it is worth doing '
        'before the session rather than during it.')

p('PR-HM29', 'Rusting — what iron actually needs', 'Chemistry',
  level='KS2–GCSE', minutes=15, age_min=8, hazard='none', wow='low',
  aim='Find out which of water, air and salt iron needs before it will rust, by taking them away '
      'one at a time.',
  outcome='Five jars ranked by how much rust appeared, and a sentence naming the two things that '
          'turn out to be necessary.',
  topics='Corrosion, Chemical Changes, Using Resources',
  equipment='Five plain uncoated iron nails, all the same | Five jars with lids | Water | Salt | '
            'Cooking oil | A kettle, for the boiled-water jar | Sticky labels | A camera or a phone',
  steps='Label the jars: plain water, salt water, oil only, dry and sealed, boiled water with an oil '
        'layer on top. | Set them up. The last one needs boiled water — boiling drives the '
        'dissolved air out — with oil poured on top to stop air getting back in. | Photograph all '
        'five side by side on day one. | Look every session for a week or two and photograph them '
        'in the same order. | Rank them at the end and work out which jar each condition was '
        'missing.',
  science='Iron rusts when it has BOTH water and oxygen — it is iron reacting with oxygen, with '
          'water letting the reaction happen. Take either away and it does not go: the dry sealed '
          'nail has air and no water, the boiled-and-oiled nail has water and almost no air, and '
          'both stay clean. The oil-only nail has neither. Salt does not cause rust, it speeds it '
          'up, because dissolved salt makes the water carry charge more easily and rusting is at '
          'bottom an electrical process. That is why cars rust faster near the sea and after the '
          'gritters have been out.',
  log='A rust rating out of five per jar, per visit | A photograph of all five, same order, every '
      'time | Which jar rusted first | The final ranking, and which condition each jar was missing',
  variables='Whether water is present | Whether air is present | Whether salt is added | How warm '
            'the jars are kept | How long it runs',
  safety='Nothing here is hazardous. The nails are sharp and the boiled water is hot, and those are '
         'the two.',
  risks='Nail points are sharp and five loose nails on a table find a palm eventually — they are '
        'moved with the jar rather than by hand, and counted in and out. | The boiled-water jar '
        'needs a kettle and hot water poured into glass, which the tutor does, onto a heatproof '
        'surface. | Rusty water stains, and a jar knocked over after two weeks is the one that '
        'makes the mess — they sit on a tray on a shelf, not on a windowsill edge.',
  setup_cost_gbp=3,
  maths_link='Ranking five results against each other rather than measuring them, and being honest that a rating out of five is weaker evidence than a number; keeping a record over two weeks.',
  notes='A TWO-MINUTE PRACTICAL THAT RUNS FOR A FORTNIGHT. Set it up at the end of a session and '
        'spend two minutes on it at the start of every one after that. | The photograph in the same '
        'order every time is what makes the comparison possible later — memory is not good enough '
        'over two weeks. | The boiled-water jar is the one that makes it an experiment rather than '
        'a demonstration, and it is the one most people leave out.')

p('PR-HM30', 'Growing crystals', 'Chemistry',
  level='KS2–GCSE', minutes=15, age_min=7, hazard='very low', wow='medium',
  aim='Grow crystals from a saturated solution and find out what changes how big they get.',
  outcome='Two jars of crystals grown at different cooling rates, measured and compared.',
  topics='Crystallisation, Solubility, Separating Mixtures',
  equipment='Epsom salts, unscented | Two jars | Hot water | A teaspoon | A ruler | A fridge | A '
            'magnifying glass | Dark paper, to see the crystals against',
  steps='Dissolve Epsom salts in hot water a spoonful at a time, stirring, until no more will go in '
        'and there is a little left in the bottom. That is saturated. | Pour the clear solution '
        'into two jars, leaving the undissolved bit behind. | Put one jar in the fridge and leave '
        'the other somewhere warm and undisturbed. | Look at both the next session. | Measure the '
        'longest crystal in each with a ruler and look at the shape under the magnifier. | Sketch '
        'what you see against dark paper.',
  science='Hot water holds far more dissolved solid than cold water does. As the solution cools it '
          'can no longer hold what is in it, and the excess comes out of solution as crystals. How '
          'fast it cools decides the size: cool it fast in the fridge and a huge number of tiny '
          'crystals start at once, because there is no time for any of them to grow. Cool it slowly '
          'and far fewer start, and each has time to get big. That is the same reason fine-grained '
          'and coarse-grained rocks are different rocks — granite cooled slowly underground and '
          'basalt cooled fast on the surface.',
  log='Longest crystal in each jar, in mm | How many crystals, roughly, in each | The shape under '
      'the magnifier | How long each took to appear',
  variables='How fast it cools | How saturated the solution is | Whether it is disturbed while '
            'cooling | Which salt is used',
  safety='Epsom salts are sold as a bath product and are harmless to handle. Hot water is the only '
         'hazard and the tutor pours it.',
  risks='The dissolving step needs water hot enough to matter, which the tutor pours and stirs — a '
        'jar of hot solution tipped over is a scald. | Glass jars of liquid left for days get '
        'knocked — they go on a tray on a shelf, not a table edge. | Epsom salts are a laxative in '
        'quantity and it looks like sugar; it is not tasted, and the jars are labelled.',
  setup_cost_gbp=5,
  maths_link='Measuring a length in millimetres; comparing a few large against many small and seeing that the total amount of solid is about the same either way.',
  notes='THE TWO-JAR COMPARISON IS THE POINT. One jar of crystals is a craft activity; two jars '
        'cooled at different rates is an experiment with a result you can measure. | Unscented '
        'matters: the perfumed bath ones do not crystallise cleanly.')

p('PR-HM31', 'Slime', 'Chemistry',
  level='KS2–GCSE', minutes=20, age_min=6, hazard='very low', wow='medium',
  aim='Turn a runny liquid into a stretchy solid by adding something in tiny amounts, and find the '
      'amount that works best.',
  outcome='A table of how much activator was added against how far the slime stretches before it '
          'breaks.',
  topics='Polymers, Chemical Changes, Units & Measures',
  equipment='PVA glue | Bicarbonate of soda | Contact lens saline that lists boric acid or sodium '
            'borate in its ingredients | A bowl and a spoon | Measuring spoons | A ruler | Food '
            'colouring, optional',
  steps='Put 100 ml of PVA glue in the bowl. | Stir in half a teaspoon of bicarbonate of soda. | '
        'Add the saline half a teaspoon at a time, stirring hard after each one. | Stop the moment '
        'it comes away from the bowl — this is the step everybody overshoots. | Knead it for a '
        'minute. | Hang a lump from your fingers and measure how far it stretches before it snaps. '
        '| Make a second batch with twice as much saline and measure again.',
  science='PVA glue is a polymer: very long molecules, like cooked spaghetti, sliding over each '
          'other, which is why it pours. The borate in the saline links those long molecules '
          'together at points along their length, so they can still slide a bit but cannot slide '
          'away from each other entirely. That is what makes it stretchy rather than runny or '
          'brittle. More activator means more links and a stiffer, shorter-stretching slime; too '
          'much and it becomes a rubbery lump that snaps. The bicarbonate is there to get the '
          'conditions right for the borate to do its job.',
  log='Teaspoons of saline against how far it stretches before snapping | How it behaves when '
      'pulled slowly against pulled fast | Which batch was best and at what amount | What it is '
      'like the next session',
  variables='How much saline | How much bicarbonate | How long it is kneaded | Whether colouring is '
            'added',
  safety='Hands are washed afterwards. This is not eaten and it is not left on fabric or carpet.',
  risks='Borate is harmful if swallowed and slime is exactly the sort of thing that gets tasted — '
        'it is stated once before starting, and hands are washed at the end. | It sticks to fabric, '
        'carpet and hair and does not come out — it stays on a wipeable surface and off laps. | '
        'Some people react to borate on skin: if anyone has sensitive skin or eczema, this is done '
        'in disposable gloves or skipped.',
  setup_cost_gbp=8,
  maths_link='Adding a reagent in equal measured steps and finding the point where the behaviour changes; measuring a stretch in centimetres and comparing batches.',
  notes='The saline MUST list boric acid or sodium borate — plain saline does nothing at all, and '
        'that is the commonest reason this fails. | The pull-slowly-against-pull-fast observation '
        'is free and is the most interesting thing here: slow and it stretches, fast and it snaps, '
        'which is a non-Newtonian behaviour worth naming.')

p('PR-HM32', 'Lemon battery', 'Chemistry',
  level='KS3–GCSE', minutes=30, age_min=8, hazard='none', wow='high',
  aim='Make electricity out of fruit and find out how many lemons it takes to light an LED.',
  outcome='A lit LED, and a graph of the number of lemons against the voltage produced.',
  topics='Electricity, Chemical Changes, Straight Line Graphs, Direct Proportion',
  equipment='Four lemons | Four copper coins, or copper strip | Four galvanised nails or zinc strip '
            '| Crocodile-clip leads | An LED | A multimeter, if there is one | A knife, for the '
            'slits',
  steps='Roll each lemon under your hand first — it breaks the juice sacs and makes a real '
        'difference. | Cut two small slits in each lemon, a few centimetres apart. | Push a copper '
        'coin into one and a galvanised nail into the other. Do not let them touch inside. | Clip a '
        'lead from the copper of one lemon to the nail of the next, all the way along. | Measure '
        'the voltage across the whole chain with the multimeter, after one lemon, then two, then '
        'three, then four. | Connect the LED across the two free ends — long leg to copper. | If it '
        'will not light, add a lemon.',
  science='This is not the lemon storing electricity — the lemon is not a battery, the two metals '
          'are. Zinc gives up electrons more readily than copper does, and the acidic juice lets '
          'those electrons travel between them, so a current flows from one metal to the other '
          'through the circuit. Each lemon makes about the same small voltage, so wiring them in a '
          'chain adds the voltages up, which is exactly how the cells inside a real battery work. '
          'The current is tiny, which is why it will just about light an LED and will never run '
          'anything that needs real power.',
  log='Number of lemons against voltage | The voltage where the LED first lights | Whether rolling '
      'the lemon first changes the reading | What happens if two lemons are swapped round',
  variables='The number of lemons | Which metals are used | How far apart the electrodes are | How '
            'juicy the fruit is | Whether it is lemon, lime or potato',
  safety='The lemons are not eaten afterwards — zinc and copper have been sitting in them.',
  risks='Cutting the slits is a knife job and the tutor does it; a lemon rolls under a knife, which '
        'is how people cut themselves. | Galvanised nails are sharp and are being pushed into '
        'something slippery — push with a cloth, not a bare thumb. | The lemons are not eaten and '
        'that is said before the first one is cut, not after.',
  setup_cost_gbp=5,
  maths_link='Plotting cells against voltage and seeing a straight line through the origin; reading '
             'off the value where something starts working; adding equal quantities in series.',
  notes='An LED only works one way round, and a dead LED that is simply backwards is the commonest '
        'ten minutes lost on this. Try it both ways before adding lemons. | A multimeter turns this '
        'from a trick into a graph, and cheap ones are about a tenner.')

p('PR-HM33', 'Mentos and cola', 'Chemistry',
  level='KS2–GCSE', minutes=30, age_min=6, hazard='none', wow='very high',
  aim='Set off a fountain outdoors, then turn it into a fair test by changing one thing at a time.',
  outcome='A bar chart of drink against fountain height, and an explanation that does not involve a '
          'chemical reaction.',
  topics='Rate of Reaction, Bar Charts & Pictograms, Units & Measures',
  equipment='Two-litre bottles of diet cola, full-sugar cola and sparkling water | A tube of mints '
            'with a rough surface | A tape measure, or a marked cane pushed into the ground | A '
            'phone, to film it | Somewhere outdoors that can get sticky',
  steps='Outdoors, well away from anything that matters. Push a cane into the ground beside the '
        'bottle and mark it every 20 cm so the height can be read off the film. | Stand the bottle '
        'up, open it, drop in the mints, and get back immediately. | Film every run from the same '
        'place. | Scrub back to the tallest frame and read the height off the cane. | Repeat with '
        'the other drinks, same number of mints, same bottle size. | Then, if there is another '
        'bottle: crush the mints first and see what happens.',
  science='Nothing is reacting here, which is the part almost everybody gets wrong. The carbon '
          'dioxide is already in the drink, dissolved under pressure, and it wants to come out. It '
          'needs somewhere to start — a rough spot for a bubble to form on. The mints are covered '
          'in tiny pits, so thousands of bubbles form at once on every surface of every mint as it '
          'sinks, and all that gas leaving at the same moment pushes the liquid out of the neck. '
          'That is why crushing them changes the answer and why a smooth sweet does almost nothing. '
          'Diet cola goes highest mainly because its sweeteners lower the surface tension, so '
          'bubbles form more easily.',
  log='Drink against fountain height, read off the marked cane | Whole mints against crushed | How '
      'many mints against height, if there are bottles to spare | Whether the bottle is left with '
      'flat liquid afterwards',
  variables='Which drink | The number of mints | Whole or crushed | The temperature of the drink | '
            'The bottle neck width',
  safety='Outdoors only. The fountain goes several metres up and comes down over everything within '
         'a couple of metres of the bottle.',
  risks='It erupts within a second of the mints going in and it goes higher than people expect — '
        'the drop happens at arm\'s length and everybody is several metres back before it starts. | '
        'Sticky sugar over a patio attracts wasps for days — it is run on grass, and the area is '
        'hosed afterwards. | A bottle that falls over mid-eruption becomes a hose aimed sideways: '
        'it stands on flat ground, not on grass that slopes. | Never in a bottle with the cap '
        'anywhere near it, and never indoors.',
  setup_cost_gbp=5,
  maths_link='Reading a height off a marked scale in a film rather than guessing it; a bar chart with a sensible scale; keeping every other variable fixed across three drinks.',
  notes='THE MARKED CANE IS WHAT MAKES THIS A PRACTICAL. Without it, three eruptions is three '
        'eruptions and nobody can say which was biggest. | Save one bottle for the crushed-mints '
        'run — it is the one that proves the surface-area explanation rather than just asserting '
        'it.')

p('PR-HM34', 'Invisible ink', 'Chemistry',
  level='KS2–KS3', minutes=15, age_min=6, hazard='very low', wow='medium',
  aim='Write a message that cannot be seen, then make it appear with heat, and find out which '
      'liquids work.',
  outcome='A revealed message, and a table of which household liquids work as ink and which do not.',
  topics='Chemical Changes, Time',
  equipment='Lemon juice | Milk | White vinegar | Sugar water | Water, as the control | Cotton buds '
            '| White paper | A hairdryer, or a radiator | A stopwatch',
  steps='Write one word in lemon juice with a cotton bud and let it dry completely — damp paper '
        'shows the writing anyway. | Do the same with each other liquid on its own strip of paper, '
        'including plain water as a control. | Hold the hairdryer on hot over each strip and time '
        'how long until anything appears. | Record which worked, which did not, and how long each '
        'took. | Write a longer message in the best one.',
  science='Heat makes the substances left behind in the juice react with oxygen in the air — the '
          'same kind of change that turns a cut apple brown — and the products of that change are '
          'darker than the paper. The trick is that it happens to the juice at a lower temperature '
          'than it happens to the paper, so the writing browns while the page stays white. Plain '
          'water leaves nothing behind at all, which is why it is the control and why it never '
          'appears. Anything with sugar or protein in it tends to work; anything that dries to '
          'nothing does not.',
  log='Liquid against whether it appeared | Time under the hairdryer until it showed | How dark '
      'each one went | Whether the plain-water control did anything',
  variables='Which liquid | How concentrated it is | How long the heat is applied | How close the '
            'heat is | The type of paper',
  safety='A hairdryer on hot, held close to paper, is the hazard and it is a real one — paper '
         'scorches and then catches.',
  risks='Paper under sustained heat scorches and can ignite — the tutor holds the hairdryer, keeps '
        'it moving, and stops the moment the message shows. | A hairdryer is a mains appliance near '
        'a table with liquids on it — the liquids are at the other end of the table and the cable '
        'is not trailing. | A radiator is the safer alternative and only takes longer.',
  maths_link='Timing a change and comparing; a controlled comparison with a deliberate control that '
             'is expected to do nothing.',
  notes='THE PLAIN-WATER CONTROL IS THE WHOLE SCIENCE. Without it this is a party trick; with it, '
        'there is a reason to think the juice is doing something rather than the paper. | It reads '
        'better as spy messages than as a chemistry practical, and there is no reason not to frame '
        'it that way.')

p('PR-HM35', 'The cold reaction', 'Chemistry',
  level='KS2–GCSE', minutes=20, age_min=7, hazard='very low', wow='medium',
  aim='Make a reaction that gets colder instead of hotter, and measure how much colder.',
  outcome='A temperature drop in degrees, and a pairing with an exothermic reaction that makes the '
          'difference obvious.',
  topics='Energy Changes, Chemical Changes, Rate of Reaction, Negative Numbers',
  equipment='Citric acid, food grade | Bicarbonate of soda | Water | A digital thermometer | A '
            'plastic cup | Measuring spoons | A stopwatch',
  steps='Put 100 ml of water in the cup and take its temperature. Write it down. | Stir in two '
        'tablespoons of citric acid until it dissolves, and take the temperature again. | Now add '
        'one tablespoon of bicarbonate of soda and stir. | Take the temperature every 15 seconds '
        'for two minutes. | Feel the outside of the cup — this is the bit people remember. | Plot '
        'temperature against time and find the lowest point.',
  science='Breaking the bonds in the starting substances takes energy in, and making the bonds in '
          'the products gives energy out. Usually more comes out than goes in and the mixture gets '
          'hotter. Here it is the other way round: more energy is needed to break the bonds than is '
          'released making the new ones, so the difference is taken from the surroundings — the '
          'water, the cup, and your hand. That is what endothermic means, and it is why a sports '
          'injury cold pack works on exactly this principle. The fizzing is carbon dioxide, the '
          'same as the vinegar-and-bicarbonate reaction, and the gas leaving is part of why this '
          'one runs the way it does.',
  log='Temperature before, after the citric acid dissolves, and every 15 seconds after the '
      'bicarbonate | The lowest temperature reached and how long it took | The total drop in '
      'degrees | What the outside of the cup feels like',
  variables='How much citric acid | How much bicarbonate | The starting water temperature | How '
            'much water | Whether it is stirred',
  safety='Citric acid is a food ingredient and is safe to handle, but it stings in the eyes and on '
         'broken skin. Nothing here is drunk.',
  risks='Citric acid powder stings badly in the eyes and it is a fine powder that puffs when '
        'spooned — it is measured over the cup, slowly, and hands are kept away from faces. | It '
        'looks and smells like a drink mix and it is not — say so before the first spoonful. | The '
        'mixture fizzes over the top of the cup if too much goes in at once; the cup stands in a '
        'tray and the bicarbonate goes in in one measured spoonful.',
  setup_cost_gbp=4,
  maths_link='Negative change as a drop; reading a thermometer to one decimal place; plotting a '
             'curve and reading off its minimum; subtraction across zero if the room is cold.',
  notes='RUN IT IN THE SAME SESSION AS SOMETHING EXOTHERMIC — the hand warmer (PR-HM28), or '
        'elephant\'s toothpaste (PR-HM01) where the bottle gets warm. One of each is what makes the '
        'two words stick; either on its own is just a temperature change.')

# ==================================================================================================
# BIOLOGY
# ==================================================================================================

p('PR-HM36', 'Strawberry DNA', 'Biology',
  level='KS3–GCSE', minutes=30, age_min=8, hazard='low', wow='very high',
  aim='Get DNA out of a strawberry and see it with the naked eye.',
  outcome='A visible thread of DNA lifted out on a skewer, and an explanation of what each '
          'ingredient was for.',
  topics='Cell Biology, Inheritance & Evolution, Separating Mixtures',
  equipment='Three strawberries | A zip-seal freezer bag | Half a teaspoon of salt | A teaspoon of '
            'washing-up liquid | 100 ml of water | A coffee filter or a fine sieve | Two glasses | '
            'Isopropyl alcohol, chilled in the freezer for an hour | A bamboo skewer',
  steps='Chill the alcohol in the freezer well before the session — this will not work warm. | Put '
        'the strawberries in the bag, seal it, and squash them thoroughly with your hands for a '
        'minute. | Mix the salt, washing-up liquid and water in a glass and pour it into the bag. | '
        'Squash again, gently this time, for another minute. | Filter the mixture into a clean '
        'glass. | Tilt the glass and let the tutor pour cold alcohol very slowly down the side so '
        'it sits in a layer on top. Do not stir. | Watch the white stringy layer form where the two '
        'meet. | Lift it out on the skewer.',
  science='Every cell in the strawberry has DNA in it, and strawberries have eight copies of each '
          'chromosome where humans have two, which is why they give so much. Squashing breaks the '
          'cells open. The washing-up liquid breaks the fatty membranes round the cell and round '
          'the nucleus — the same way it breaks up grease on a plate — and lets the DNA out. The '
          'salt makes the DNA strands clump together instead of staying spread through the liquid. '
          'And DNA does not dissolve in alcohol the way it does in water, so when it reaches the '
          'cold alcohol layer it comes out of solution and appears as white threads. What you lift '
          'out is millions of molecules together, not one.',
  log='What the layer looks like as it forms | How much was recovered | A sketch of the threads on '
      'the skewer | Whether skipping the salt, or the soap, changes the result',
  variables='Which fruit | Whether the alcohol is cold | How long it is squashed | Whether salt or '
            'soap is left out | How much filtering',
  safety='Isopropyl alcohol is flammable and the tutor handles it. No flames anywhere near, and it '
         'is not in the room where anything is being heated.',
  risks='Isopropyl alcohol is flammable and its vapour is heavier than air — the tutor pours it, '
        'the bottle is capped straight away, and nothing in the house is alight. | It is harmful if '
        'swallowed and looks like water in a glass — the glass is labelled and the mixture is '
        'binned at the end of the session rather than left on a worktop. | The vapour irritates '
        'eyes in a small room; a window is opened. | Strawberry juice and filtering means wet hands '
        'and slippery glasses on a hard surface.',
  setup_cost_gbp=5,
  maths_link='Measuring volumes; the scale jump from a molecule to something visible, which is a '
             'genuine powers-of-ten conversation.',
  notes='THE COLD IS NOT OPTIONAL and it is the reason this fails when it fails. Room-temperature '
        'alcohol gives a cloudy nothing. An hour in the freezer, and pour it the moment it comes '
        'out. | Leaving the salt out for a second run is worth the extra strawberries: it is the '
        'ingredient whose job is least obvious, and the difference is visible.')

# ==================================================================================================

def write():
    lines = open(OUT, encoding='utf-8').read().rstrip().rstrip(']').rstrip().rstrip(',')
    have = {json.loads(l.strip().rstrip(','))['practical_id']
            for l in open(OUT, encoding='utf-8') if l.strip().startswith('{')}
    for r in ROWS:
        assert r['practical_id'] not in have, 'already there: ' + r['practical_id']
    body = ',\n'.join(json.dumps(r, ensure_ascii=False) for r in ROWS)
    open(OUT, 'w', encoding='utf-8').write(lines + ',\n' + body + '\n]\n')

    per = {}
    for r in ROWS:
        per[r['subject']] = per.get(r['subject'], 0) + 1
    print('added %d practicals: %s' % (len(ROWS), ', '.join(
        '%s %d' % (k, per[k]) for k in sorted(per))))
    print('  risks written out: %d hazards, %.1f each'
          % (sum(len([x for x in r['risks'].split('|') if x.strip()]) for r in ROWS),
             sum(len([x for x in r['risks'].split('|') if x.strip()]) for r in ROWS) / len(ROWS)))
    print('  every row carries age_min, wow, hazard, science, log, variables and steps')
    print('  nothing carries a learner name, an interest, a session date or a local place name')


if __name__ == '__main__':
    write()
