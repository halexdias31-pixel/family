## Imposter has a picture on every card, says only the word, and writes only what the game is played with

**The owner, 11 Oct:** *"Add symbols to imposter. Also make the voice ONLY say the word. THERE IS TOO
MUCH FLUFF with talking and all sorts. Even written."*

Three changes, one note:

1. **Every card has a picture**, drawn big over its word: an emoji, 750 of them, plus one for each of
   the 25 categories.
2. **The voice says the word and nothing else.** Listen on a player's card says "pizza". Listen on
   the imposter's card says "Imposter". Nothing else in the game speaks.
3. **The screens lose their sentences.** What is left is a name, the word, "Imposter", the
   category, and buttons of one word.

The second trim of the same game. The first was 8 Oct, in
[300](300-imposter-says-less-and-knows-more-words.md).

### Every screen, before and after

| Screen | Before (since 8 Oct) | Now |
|---|---|---|
| Line over the card, on every screen | Everyone gets the word but one. Find the imposter. | *(gone)* |
| Setup | small **Players**, − 4 +, Read aloud tile, **Deal** | the same: small **Players**, − 4 +, Read aloud tile, **Deal** |
| Hand-over | small **Pass to**, big **Player 2**, **Show** | big **Player 2**, **Show** |
| A player's card | big **pizza**, **Hide**, Listen | **🍕** big, **pizza**, **Hide**, Listen |
| The imposter's card | big **Imposter**, small **Hint: Food**, **Hide**, Listen | **😋** big (the category's picture), **Imposter**, small **Food**, **Hide**, Listen |
| Play | small **Food**, big **Player 3 starts**, **Reveal** | **😋** big, **Player 3 starts**, small **Food**, **Reveal** |
| Reveal | small **Imposter**, **Player 2**, small **Word**, **pizza**; **Play again**, **Players** | small **Imposter**, **Player 2**, **🍕**, **pizza**; **Deal**, **Players** |

Read aloud's tile and Listen have no words on them, only their marks. Their names are in `title`
and `aria-label`, unchanged.

- **"Pass to", "Hint:" and "Word" went.** Each one labelled something the screen already showed.
- **The line over the card went too.** The dropdown above it already says "Imposter", and the
  rules are the ones everybody at the table plays by. The other seven word games keep their line.
  A clock, a forbidden list or a hot seat is a rule somebody new has to be told.
- **"Player 3 starts" keeps its verb.** It is the one word on these screens that is not a name.
  On the screen after the last Hide, "Player 3" alone would read as one more hand-over.
- **"Play again" became "Deal".** That is the setup screen's word for the same press, so a
  one-word button means one thing.
- **The category moved below the big line** on the play screen. It is the only small line left,
  and it now sits in the same place on the imposter's card and on the play screen.

### The voice, before and after

| When | Before | Now |
|---|---|---|
| A hand-over comes up | "Player 2. Press Show, then the speaker, and hold the phone to your ear." | nothing |
| Listen, a player's card | "Your word is pizza. Your word is pizza." | "pizza" |
| Listen, the imposter's card | "You’re the imposter. Your hint is food." | "Imposter" |
| The play screen comes up | "Food. Player 3 starts." | nothing |
| The reveal comes up | "The imposter was Player 2. The word was pizza." | nothing |

- **`impAnnounce_` is gone.** It said the three lines that played as a screen came up. Now
  `imp-listen` is the only thing that speaks.
- **Volume is 0.6 always.** The one thing said now is the secret, into one ear.
- **Listen still says nothing until it is pressed**, and pressing it again says the word again.
- **Hide, Deal (on the setup screen and on the reveal), Players and leaving the column still cut
  the voice off first.**
- **How to hold the phone is no longer spoken.** The grown-up who deals shows a child once, the
  way every other game at the table is taught.

**The trade-off, written down.** The longer lines were padded on purpose. The review of 8 October
found that the table can hear *how long* a phone talks even when it cannot make out the word.
"Pizza." took about 0.6s and "You’re the imposter. The hint is food." about 3s, so the imposter's
phone talked five times longer. The padding made both lines the same shape, and the padding was
the fluff the owner heard. Now both are single words:

- "Imposter" is three syllables.
- A word averages 2.1 syllables over all 750 cards, and 72% are within one syllable of "Imposter".
- Either one is under a second, said at 0.6 into one ear.

The tell the padding hid was a 2.4-second gap. What remains is a fraction of a second. The owner's
words decide it.

**Listen stays a press.** Speaking automatically when the card came up was not done, for the
reason in 300: a phone that reads the word out as the card appears tells the table.

### The pictures

- **Emoji.** 775 pictures could not be drawn by hand, and every phone and iPad at the table
  already has an emoji font.
- **The card is written the way it is drawn: picture, one space, word.** For example
  `'🍕 pizza'`. Each category is `{ sym, cards: [...] }`. `impCards_` splits every card at its first
  space. No emoji contains a space: joiners, variation selectors, keycap marks and tag letters are
  invisible, and none of them is U+0020. If a letter comes before the first space, the card has no
  picture, so `'hot dog'` without its 🌭 is not read as "dog" under a picture called "hot".
- **Honest.** The picture is the one a child would name with the card's word. 🍕 is pizza, but no
  emoji is shepherd's pie. A word with no honest picture was replaced by a word from the same
  category that has one (listed below). A word was renamed when the picture shows something
  slightly different: `Big Bad Wolf` to `wolf`, `teeth` to `tooth`, `biscuit` to `cookie` (🍪 is a
  chocolate-chip cookie). No near misses.
- **Nothing newer than Emoji 12.0** (iOS 13.2, 2019, every iPad still in use). A newer emoji draws as
  an empty box on an older phone. That puts one broken-looking card in one player's hand, which is
  also a tell.
  - The jobs use the Emoji 4.0 woman and man forms, alternating, because the person-neutral 🧑‍🏫
    forms are 12.1.
  - `bear` is 🐻, because 🐻‍❄️ is 13.0.
  - Of the 775 pictures, 38 are Emoji 12.0 exactly, and 24 are joined (ZWJ) sequences at 4.0, 5.0
    or 11.0.
  - These 38 draw as boxes on Windows 10 before its May 2019 update.
  - Chrome and Edge on Windows draw flags as two letters. Every iPhone and iPad on iOS 13.2 or later
    draws all of it.
- **No picture appears twice, counting category pictures.** The imposter is shown their category's
  picture, and if that were also some card's picture, the imposter would be holding a word.
- **The imposter's card has a picture too: the category's, in the same place and at the same
  size.** The plan was to put it small, beside the hint. Built that way, the imposter's card would
  have been the only one with no big picture. A big coloured picture can be seen across a table
  where the word cannot be read, so a card without one would point at the imposter. The category's
  picture is also the honest one to give them: it is their hint. The play screen shows it again,
  because by then everybody has it.
- **The picture is never spoken.** `speechSynthesis` reads an emoji by its Unicode name ("slice of
  pizza", "man health worker"). For the same reason it is `aria-hidden`, because a screen reader
  would do the same.
- **The fonts are named, colour emoji first** (`.imp-sym`). The app's own typeface is monospace.
  A monospace font that has a plain ♠ or ✖ would otherwise be used for those older symbols, giving
  a black outline where every other card has colour. Every symbol of that kind carries its
  U+FE0F.
- **Size and slot.** The picture is `3.6rem`, not a tap target, so it is in `rem`. The slot has a
  fixed height of `1.2em` of its own size, not a minimum. The hand-over draws the slot empty, and
  the card has to be the same height either way.

All 775 were rendered through the real `.imp-sym` rule in the checks' Chromium (Noto Color Emoji):
every one is a colour glyph of the same width, with no boxes and no text fallbacks. The picker that
chose them also looked at each in Apple's and Google's drawings.

### The deck: 27 categories of 30 became 25 of 30

At Emoji 12.0 there are only so many honest pictures (about 860 a child could name), and ten of the
27 categories could not find thirty. Sea life had 13, Minibeasts 13, Sweets and treats 13, At the
seaside 14, Space 15, In the garden 19, Fairy tales 20, In the kitchen 21, Music 22, Jobs 23 people
(its other seven were objects: a nurse drawn as 💉, a baker as 🥖), and Famous places 7. So the
categories follow the pictures:

- **Merged:** Sweets and treats into Food. Sea life into At the seaside. In the garden and
  Minibeasts into Nature.
- **Renamed:** Space became **Space and weather**, and the weather came in from Nature. Jobs became
  **People**: the 22 jobs that have a person drawn, plus baby, boy, girl, grandma, grandad, student,
  pregnant woman and rock star.
- **Retired:** Famous places. Only 7 landmarks have an honest picture.
- **New:** **Feelings** (faces), **Actions** (gestures and everyday doing) and **Signs and
  symbols**. These use pictures no other category needed.
- **The 25:** Food, Fruit and veg, In the kitchen, At home, Toolbox, Clothes, The body, Feelings,
  Actions, People, Wild animals, Pets and farm animals, At the seaside, Nature, Space and weather,
  Fairy tales, Countries, Around town, Sport, School, Transport, Celebrations, Toys and games, Music,
  Signs and symbols.
- **Category pictures:** Countries changed to 🌐 (School's map card is 🗺️), and School to 📚
  (🏫 is Around town's school card). Each new category has its own picture: Nature 🏞️, Space and
  weather 🌌, People 👥, Feelings 🎭, Actions 🚶, Signs and symbols 🔣.
- **Moved:**
  - magnet, ruler, scissors and paintbrush from School to Toolbox
  - helmet from Clothes to Toolbox
  - island from Nature to At the seaside
  - surfing from Sport to At the seaside
  - ice cream from Sweets to At the seaside
  - rainbow, cloud, snowflake, lightning and tornado from Nature to Space and weather
  - frog from Wild animals to Fairy tales (the frog prince)
  - reindeer from Pets to Celebrations (🦌 is a plain deer, and reads as a reindeer only at
    Christmas)
  - sledge and scooter from Transport to Toys
  - pancakes from Celebrations to Food (the picture is pancakes, not Pancake Day)
  - hairdresser became `getting a haircut` in Actions, because 💇 draws the customer
- **Two cards were renamed so they do not say their own category:** `sheet music` became
  `treble clef` and `music note` became `musical note`. `stop sign` under Signs and symbols became
  `stop`.

**Replaced: 327 cards**, listed as *old → new* in the category the new card is in. Many are just
the card that took the old one's place, not a synonym:

- **Food** (14): fish and chips → chips 🍟, spring rolls → noodles 🍜, fried rice → rice 🍚, shepherd’s pie → pie 🥧, roast dinner → chicken leg 🍗, fry-up → bacon 🥓, nachos → burrito 🌯, sausage roll → kebab 🥙, bangers and mash → steak 🥩, pick and mix → sweets 🍬, biscuit → cookie 🍪, cheesecake → cake 🍰, crumpet → pancakes 🥞, trifle → sundae 🍨.
- **Fruit and veg** (7): peas → potato 🥔, pepper → chilli 🌶️, blueberry → melon 🍈, sprouts → garlic 🧄, plum → green apple 🍏, pumpkin → sweet potato 🍠, celery → aubergine 🍆.
- **In the kitchen** (27): wooden spoon → spoon 🥄, fork → knife and fork 🍴, chopping board → knife 🔪, dishwasher → chopsticks 🥢, mug → cup ☕, teapot → milk 🥛, saucepan → egg 🥚, rolling pin → cheese 🧀, baking tray → bread 🍞, toaster → butter 🧈, grater → salt 🧂, tin opener → tin 🥫, ladle → honey 🍯, fridge → ice cube 🧊, blender → juice box 🧃, kettle → baby bottle 🍼, washing-up liquid → sponge 🧽, sink → tap 🚰, microwave → timer ⏲️, oven → fire extinguisher 🧯, whisk → fizzy drink 🥤, tea towel → takeaway 🥡, apron → croissant 🥐, sieve → bagel 🥯, peeler → baguette 🥖, measuring jug → pretzel 🥨, spatula → peanuts 🥜.
- **At home** (22): window → door 🚪, wardrobe → chair 🪑, stairs → toilet 🚽, curtains → shower 🚿, duvet → toilet roll 🧻, doorbell → telephone ☎️, lamp → keyboard ⌨️, remote control → laptop 💻, mirror → picture 🖼️, letterbox → letter ✉️, bookcase → newspaper 📰, attic → suitcase 🧳, toothbrush → razor 🪒, chimney → clock 🕰️, radiator → umbrella ☂️, iron → printer 🖨️, carpet → parcel 📦, hairdryer → mobile phone 📱, washing machine → basket 🧺, vacuum cleaner → computer 🖥️, mop → camera 📷, hot-water bottle → family 👪.
- **Toolbox** (13): saw → axe 🪓, drill → pickaxe ⛏️, hard hat → hi-vis vest 🦺, scaffolding → roadworks 🚧, tape measure → cog ⚙️, screwdriver → clamp 🗜️, plunger → barrel 🛢️, sticky tape → plug 🔌, nail → drawing pin 📌, plank → safety pin 🧷, wallpaper → scales ⚖️, sandpaper → stopwatch ⏱️, pliers → compass 🧭.
- **Clothes** (17): skirt → dress 👗, raincoat → coat 🧥, wellies → boots 👢, slippers → shoes 👞, jumper → glasses 👓, pyjamas → pants 🩲, belt → watch ⌚, earmuffs → ring 💍, leggings → handbag 👜, nappy → purse 👛, tracksuit → top hat 🎩, dressing gown → kimono 👘, dungarees → sari 🥻, kilt → turban 👳, woolly hat → walking boots 🥾, hoodie → vest 🎽, flip-flops → lab coat 🥼.
- **The body** (17): teeth → tooth 🦷, elbow → bone 🦴, skeleton → skull 💀, toes → footprints 👣, arm → finger ☝️, tummy → fist ✊, wrist → nails 💅, skin → blood 🩸, hair → curly hair 👩‍🦱, chin → red hair 👩‍🦰, forehead → bald head 👨‍🦲, ankle → plaster 🩹, fingerprint → injection 💉, freckles → germs 🦠, knee → medicine 💊, neck → stethoscope 🩺, shoulder → hearing aid 🦻.
- **People** (18): vet → judge 👨‍⚖️, butcher → office worker 👨‍💼, postman → computer programmer 👩‍💻, plumber → welder 👩‍🏭, lifeguard → soldier 💂, dinner lady → clown 🤡, window cleaner → cowboy 🤠, waiter → juggler 🤹, paramedic → jockey 🏇, shopkeeper → dancer 💃, actor → rock star 👨‍🎤, nurse → baby 👶, lollipop lady → boy 👦, magician → girl 👧, baker → grandma 👵, photographer → grandad 👴, dentist → student 👩‍🎓, hairdresser → pregnant woman 🤰.
- **Wild animals** (5): polar bear → bear 🐻, ostrich → gorilla 🦍, toucan → swan 🦢, meerkat → skunk 🦨, chameleon → raccoon 🦝.
- **Pets and farm animals** (9): goldfish → fish 🐟, goose → chick 🐤, budgie → bird 🐦, donkey → ram 🐏, guinea pig → snake 🐍, pigeon → dove 🕊️, ferret → guide dog 🦮, pony → poodle 🐩, gerbil → paw prints 🐾.
- **At the seaside** (11): clownfish → tropical fish 🐠, suncream → sunset 🌅, fishing net → fishing rod 🎣, pedalo → sailing boat ⛵, lifeboat → boat 🛥️, helter-skelter → big wheel 🎡, donkey ride → merry-go-round 🎠, rubber ring → swimming 🏊, wetsuit → bikini 👙, deckchair → sun hat 👒, flippers → sandals 👡.
- **Nature** (10): forest → tree 🌳, jungle → pine tree 🌲, bluebell → blossom 🌸, dandelion → flower 🌼, nest → dead flower 🥀, daisy → wheat 🌾, pine cone → leaves 🍃, stinging nettle → four-leaf clover 🍀, acorn → seedling 🌱, cave → fire 🔥.
- **Space and weather** (12): eclipse → full moon 🌕, Mars → half moon 🌓, mission control → satellite dish 📡, Jupiter → rain 🌧️, Venus → snow 🌨️, Neptune → thunderstorm ⛈️, Mercury → wind 🌬️, Pluto → fog 🌫️, black hole → thermometer 🌡️, crater → snowman ☃️, asteroid → sunrise 🌄, solar system → raindrop 💧.
- **Fairy tales** (21): magic wand → wizard 🧙‍♂️, giant → ghost 👻, king → prince 🤴, throne → crown 👑, knight → sword ⚔️, Cinderella → shield 🛡️, Goldilocks → bow and arrow 🏹, Big Bad Wolf → wolf 🐺, troll → elf 🧝, Sleeping Beauty → vampire 🧛, Ugly Duckling → zombie 🧟, Hansel and Gretel → broomstick 🧹, wishing well → crystal ball 🔮, Snow White → dagger 🗡️, Red Riding Hood → diamond 💎, Rapunzel → old key 🗝️, potion → scroll 📜, Peter Pan → pirate flag 🏴‍☠️, beanstalk → money bag 💰, Gingerbread Man → haunted house 🏚️, Three Little Pigs → monster 👹.
- **Around town** (16): playground → school 🏫, zebra crossing → bus stop 🚏, zoo → circus 🎪, phone box → postbox 📮, café → bank 🏦, shopping centre → corner shop 🏪, airport → train station 🚉, swimming pool → car park 🅿️, nursery → factory 🏭, theatre → synagogue 🕍, library → temple 🛕, chemist’s → cash machine 🏧, aquarium → public toilets 🚻, soft play → office block 🏢, skate park → bridge 🌉, bowling alley → barber’s 💈.
- **Sport** (13): sack race → boxing 🥊, high jump → ice hockey 🏒, rounders → baseball ⚾, gymnastics → American football 🏈, referee → gold medal 🥇, netball → lacrosse 🥍, horse riding → snowboarding 🏂, dodgeball → curling 🥌, hurdles → fencing 🤺, marathon → cycling 🚴, diving → wrestling 🤼, sailing → mountain biking 🚵, skateboarding → handball 🤾.
- **School** (25): pencil case → pencil ✏️, rubber → pen 🖊️, PE kit → fountain pen 🖋️, glitter → paints 🎨, homework → book 📖, desk → notebook 📓, spelling test → notepad 📝, book bag → backpack 🎒, assembly → alphabet 🔤, show and tell → numbers 🔢, playtime → hands up 🙋, nativity play → test tube 🧪, uniform → DNA 🧬, globe → map 🗺️, glue stick → paper clip 📎, whiteboard → clipboard 📋, coat peg → calendar 📅, lost property → bookmark 🔖, calculator → abacus 🧮, sharpener → set square 📐, sports day → bar chart 📊, ruler → graph 📈, scissors → folder 📁, magnet → petri dish 🧫, paintbrush → label 🏷️.
- **Transport** (12): digger → police car 🚓, go-kart → racing car 🏎️, double-decker bus → bus 🚌, ice-cream van → minibus 🚐, cement mixer → truck 🚚, pushchair → moped 🛵, caravan → tuk-tuk 🛺, monster truck → bullet train 🚅, submarine → underground 🚇, hot-air balloon → monorail 🚝, raft → train track 🛤️, scooter → wheelchair 🦽.
- **Celebrations** (20): birthday party → birthday cake 🎂, sleepover → party 🥳, Holi → confetti 🎊, advent calendar → Father Christmas 🎅, cracker → Mrs Christmas 🤶, pantomime → angel 👼, bunting → love letter 💌, harvest festival → bride 👰, fancy dress → groom 🤵, Mother’s Day → bouquet 💐, New Year’s Eve → fireworks 🎆, Bonfire Night → sparkler 🎇, Chinese New Year → firecracker 🧨, carnival → lantern 🏮, World Book Day → graduation 🎓, Easter egg → sparkles ✨, picnic → kiss 💏, April Fools’ Day → medal 🎖️, Eid → candle 🕯️, piñata → couple 💑.
- **Toys and games** (20): slime → dinosaur 🦕, jack-in-the-box → T-Rex 🦖, puppet → superhero 🦸, bubbles → ball 🥎, hula hoop → frisbee 🥏, skipping rope → water pistol 🔫, pass the parcel → parachute 🪂, building blocks → controller 🎮, stickers → joystick 🕹️, spinning top → pool 🎱, pogo stick → skateboard 🛹, dominoes → skittles 🎳, marbles → table tennis 🏓, hopscotch → dartboard 🎯, treasure hunt → villain 🦹, Simon says → space invader 👾, roller skates → spades ♠️, snakes and ladders → clubs ♣️, bouncy castle → tent ⛺, hide and seek → goal 🥅.
- **Music** (18): bagpipes → banjo 🪕, tuba → horn 📯, cymbals → bell 🔔, karaoke → CD 💿, trombone → speaker 🔊, talent show → megaphone 📣, choir → loudspeaker 📢, recorder → musical note 🎵, orchestra → treble clef 🎼, concert → ticket 🎫, harmonica → play button ▶️, lullaby → pause button ⏸️, tambourine → mute 🔇, maracas → wind chime 🎐, xylophone → rock on 🤘, harp → DVD 📀, castanets → shuffle 🔀, accordion → record button ⏺️.

Countries kept all 30, each with its flag.

**Dropped with no picture.** These went when their category merged or retired, and none was given a
card of its own:

- Food and Sweets: fish fingers, cereal, porridge, beans on toast, jacket potato, lasagne, omelette,
  boiled egg, macaroni cheese, meatballs, crisps, candyfloss, jelly, marshmallow, milkshake,
  brownie, sprinkles, bubblegum, candy cane, slushie, fudge, crumble, jam tart, flapjack, scone, hot
  cross bun, mince pie, Swiss roll, rocky road.
- At the seaside and Sea life: sandcastle, bucket and spade, seagull, rock pool, beach ball, pier,
  lighthouse, beach hut, pebbles, stick of rock, cliff, windbreak, cool box, postcard, bodyboard,
  jellyfish, starfish, seal, turtle, seahorse, orca, seaweed, stingray, walrus, coral, puffin, eel,
  narwhal, swordfish, tuna, salmon, sea urchin, barnacle.
- Nature, In the garden and Minibeasts: waterfall, puddle, river, icicle, iceberg, lake,
  hailstones, swing, trampoline, paddling pool, watering can, shed, pond, barbecue, sandpit, tree
  house, lawnmower, wheelbarrow, fence, gate, bird feeder, greenhouse, hosepipe, rake, flowerpot,
  scarecrow, gnome, seeds, weeds, washing line, hammock, vegetable patch, compost heap, worm, slug,
  beetle, wasp, fly, dragonfly, moth, centipede, woodlouse, tadpole, stick insect, beehive,
  daddy-long-legs, earwig, flea, maggot, chrysalis, praying mantis, pond skater, water boatman.
- Space: galaxy, Northern Lights, countdown, launch pad, constellation.
- Toolbox: ladder, paint roller, paint pot, superglue, workbench.
- Fairy tales: Puss in Boots.
- Toys and games: dice (still the category's picture), roller skates.
- Famous places, all 30: Big Ben, Eiffel Tower, London Eye, Buckingham Palace, Pyramids, Statue of
  Liberty, North Pole, Tower Bridge, Stonehenge, Mount Everest, Great Wall, Leaning Tower, Loch
  Ness, Sydney Opera House, Wembley, Antarctica, Sahara, Tower of London, Niagara Falls, Grand
  Canyon, Taj Mahal, Colosseum, Venice, Great Barrier Reef, Sphinx, Wimbledon, Hollywood, Hadrian’s
  Wall, Jurassic Coast, Land’s End.

**Honest picture, loose fit.** In each of these the picture really is the word, but the word only
loosely belongs to its category:

- **In the kitchen:** fizzy drink, takeaway, croissant, bagel, baguette, pretzel, peanuts. No emoji
  exists for a fridge, oven or kettle, so the kitchen is its utensils plus what is kept in it.
- **Toolbox:** scales, stopwatch, compass, safety pin.
- **Celebrations:** groom, sparkles, kiss, medal, candle, couple, Valentine’s Day.
- **Toys and games:** villain, space invader, spades, clubs, tent, goal.
- **Music:** wind chime, DVD, shuffle, record button, play button, pause button, mute.
- **School:** petri dish, label, lunchbox, bookmark.
- **Sport:** lacrosse, curling, handball, water polo, mountain biking.
- **Fairy tales:** haunted house, money bag, monster.
- **Around town:** barber’s, cinema, supermarket.

**For the owner to look at:**

- peach 🍑 and aubergine 🍆 are honest fruit and veg, but carry well-known adult meanings online.
  Fruit and veg has no other honest spare at 12.0.
- water pistol 🔫 was a revolver on Android and Windows before 2018.
- pregnant woman 🤰 is in People.

### What was asked and not done

- **A category choice on the setup screen.** The plan said the setup screen keeps "number of
  players, category choice, Read aloud", but the game has never had a category choice. Adding one
  would be a new menu in a note asking for less. The owner has already said no to one: Articulate's
  six category chips were removed for *"less friction if it just decides topic and the thing"*.
  The game still deals the category.
- **Speaking the word as the card comes up.** Listen is still a press (see the voice section).

### Checks

**`check-widgets.js` reads the deck the way the game does** (`{ sym, cards }`, split at the first
space). It fails, naming the card, when:

- the deck has fewer than 25 categories;
- a category holds fewer than 30 cards, or the categories are not all the same size;
- a word appears twice (case, apostrophes, hyphens and a trailing s are ignored);
- a word contains its own category's name;
- a card has no picture;
- a picture contains a letter or a space;
- a picture is not emoji;
- a picture appears twice, counting category pictures;
- an older symbol is missing its U+FE0F, or a keycap is;
- a picture is newer than Emoji 12.0. `NEWER` lists every single code point Unicode added after
  12.0, up to 17.0 (127 code points in 20 ranges), and everything past U+1FAFF;
- a joined picture is not in `ZWJ_OK`. ZWJ sequences are let through only by name, each with the
  version Unicode's emoji-zwj-sequences gives it. A joined picture can be newer than either half:
  🧑‍🏫 is 12.1 but is made of a 5.0 and a 0.6. An entry no card uses is an error too.

`CAT_WORD_OK` is empty. Its one entry was `sea urchin` in Sea life, and both went.

**`check-flow.js`**:

- **The screen journey** now checks every screen's whole text exactly, with no word budget:
  - setup: "Players − 5 + Deal"
  - hand-over: "Player 2 Show"
  - a card: "🍕 pizza Hide"
  - the imposter's card: "😋 Imposter Food Hide"
  - play: "😋 Player 3 starts Food Reveal"
  - reveal: "Imposter Player 2 🍕 pizza Deal Players"

  The budget allowed four words, which let "Pass to" and "Hint:" stay and would let any short
  sentence back. The journey also requires no `.sub`, `#imp-said` or `.note` in the game, checks
  that the picture is the dealt card's (or the category's on the imposter's card), and checks
  that no picture of the round appears on a hand-over.
- **A new deck journey**: *every card in the deck has a picture, thirty to a category, none twice,
  and each is drawn with it*. It reads the deck through `__t.impCards`, then deals and shows all 750
  cards through the real handlers and reads `.imp-sym` and `.imp-big` on each. It also checks every
  category's picture on its imposter's card.
- **The read-aloud journey is rewritten** for the new voice:
  - Each Listen says exactly the word, or exactly "Imposter".
  - Nothing is said on a hand-over, on the play screen, at the reveal, on a repaint or on coming
    back to the column.
  - Over two whole rounds, the list of everything said is exactly 16 lines: each Listen pressed
    twice, by four players, in two rounds. "Imposter" is said 4 times and each word 6.
  - The "within 1.5 times as long" rule is gone, for the reason in the trade-off above.
- `__t.impStack` stacks a whole card, picture and all, from `impCards_`.

**`check/states.js`**:

- The Imposter states set the picture with the word.
- The hand-over state wants exactly "Player 1 Show".
- The imposter's-card state wants the category's picture.
- The stay-put state reads the picture's top as well as the big line's and the button's. The
  hand-over draws the slot empty, so a slot sized by its emoji would move everything under it.

### Measured, before → after (Chromium, Read aloud on, every frame screen)

| | widget card (top–bottom) | picture | big line | button |
|---|---|---|---|---|
| 320x568 | 88–490 → 82–496 | – → 179.7 | 239.1 → 244.8 | 313.5 → 319.3 |
| 390x844 | 212–643 → 206–649 | – → 308.8 | 373.9 → 380.2 | 461.9 → 468.2 |
| 1280x800 | 180–632 → 173–638 | – → 279.7 | 348.0 → 354.4 | 449.3 → 455.6 |

- The figures are the same on all five frame screens: hand-over, a card, the next hand-over, the
  imposter's card and play. The longest word, "computer programmer", wraps to two lines without
  moving anything.
- The widget is 12px taller than before. The picture added about 65px. Removing the line over
  the card and the second small line took back about 53px.
- No widget is zoomed down at 320, 390 or 1280. `check/ui.js --screen=games` measured all five of its widths and reported nothing new.
- Screenshots of setup, hand-over, a card, the imposter's card, the longest word, play, reveal, and
  a card with Read aloud off were taken at 320x568, 390x844 and 1280x800, before and after, and
  looked at.

### Proved by mutation

Each mutation was made alone, on a copy of the branch, and turned at least one check red on its own.
The copy was green again afterwards (check-widgets and the four Imposter journeys), byte for byte
the branch's files, and the branch itself was never edited for a mutation.

| Mutation | Red |
|---|---|
| a word with no picture (`'pizza'`) | check-widgets: `Food "pizza" has no picture`. Deck journey: the card drew "pizza Hide" with no picture |
| a word twice (`'🍔 pizza'`) | check-widgets: `Food "pizza" is Food "pizza"`. Deck journey: `is Food "pizza" again`, and the card drew 🍕 where 🍔 was dealt |
| a category's picture on a card (`'😋 pizza'`) | check-widgets: `has 😋, the picture of the category Food`. Deck journey |
| 🐻‍❄️ (13.0, joined) | check-widgets: `a joined picture nobody has looked up` |
| 🦫 (U+1F9AB, 13.0) | check-widgets: `newer than Emoji 12.0 … an empty box on an older iPad` |
| ☀ without U+FE0F | check-widgets: `without its U+FE0F after U+2600` |
| a sentence spoken on the hand-over | read-aloud journey: `the hand-over to player 2 said ["Player 2. Press Show."]` |
| the reveal sentence back | read-aloud journey: `the reveal said ["The imposter was Player 4. The word was octopus."]` (the imposter is drawn at random) |
| Listen padded again ("Your word is octopus.") | read-aloud journey: `wanted exactly "octopus"` |
| the picture passed to the voice | read-aloud journey: `said "🐙 octopus", wanted exactly "octopus"` |
| an instruction line on the hand-over ("Nobody else looks") | screen journey: `reads "Player 1 Nobody else looks Show", wanted exactly "Player 1 Show"`. Read-aloud journey too |
| the line over the card back | screen journey: `has a sentence line again` and the setup screen's exact text |
| "Pass to" back on the hand-over | screen journey: `reads "Player 1 Pass to Show", wanted exactly "Player 1 Show"`. Read-aloud journey too |
| the imposter's card with no picture | screen journey: `wanted exactly "🐶 Imposter Pets and farm animals Hide"`. Deck journey, for every category |

### Not done here

- **Nobody has heard it at the table yet.** As in 300, the one test that matters for Read aloud is
  on the family's own phone: whether "pizza", said at 0.6 into one ear, can be heard from the next
  seat.
- **Nobody has seen the pictures on an iPhone or iPad yet.** The picker checked every picture
  against Apple's drawings, and this branch rendered them in Chromium with Noto.
