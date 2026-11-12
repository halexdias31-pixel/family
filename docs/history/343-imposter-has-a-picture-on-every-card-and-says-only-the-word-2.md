# 343-imposter-has-a-picture-on-every-card-and-says-only-the-word (part 2 of 2)

Continues [part 1](343-imposter-has-a-picture-on-every-card-and-says-only-the-word.md).

### After review (11–12 October)

Three reviews of the branch (how it plays, whether the pictures are honest, whether the checks hold
what they claim) found nineteen things. Each was reproduced on the reviewed commit first, then fixed,
and each fix is held by a check that was red before it and is green after, where a check can see it.

#### The imposter was handed the word

**Eight category pictures showed one of their own cards.** The imposter holds the category's
picture where everybody else holds the word's, so when one of these cards came up, the imposter had
a big coloured picture of the answer: 14 cards of 750, about one round in fifty. The code already stated the
rule ("none is a card's picture, or the imposter would be holding a word"), but the only check was
"no picture twice", which compares code points, and 🐯 is not 🐅.

| Category | Its picture | The card it showed | What changed |
|---|---|---|---|
| Wild animals | 🐯 | `tiger` 🐅 | the card: `tiger` → `orangutan` 🦧. The tiger face is the better hint |
| Pets and farm animals | 🐶 | `dog` 🐕, `guide dog` 🦮, `poodle` 🐩 | the picture: 🐶 → 🐾. `dog` is the word every child says. `paw prints` went (it is the picture now) and `peacock` 🦚 came in from Wild animals |
| At the seaside | 🏖️ | `parasol` ⛱️ | the picture: 🏖️ → 🌊, so 🏖️ could be the card `beach`, in place of `waves` (the picture now). `parasol` → `roller coaster` 🎢 |
| Sport | 🏅 | `gold medal` 🥇 | the card: → `gymnastics` 🤸, from Actions, where it was `cartwheel` |
| Music | 🎶 | `musical note` 🎵 | the card: → `dancer` 💃, from People |
| School | 📚 | `book` 📖, `notebook` 📓, `exercise book` 📒 | the picture: 📚 → 🎒. `backpack` went (it is the picture now) and `hundred` 💯 came in from Signs and symbols |
| Clothes | 👚 | `T-shirt` 👕 | the card: → `headscarf` 🧕 |
| Celebrations | 🎉 | `confetti` 🎊, `party` 🥳 | the picture: 🎉 → 🎈. `balloon` went (it is the picture now) and `Easter bunny` 🐰 came in |
| Transport | 🛣️ | `train track` 🛤️ | the picture: 🛣️ → 🚥. Not in the review: the new check found it. A motorway and a railway are drawn the same way, receding into the distance |

**`check-widgets.js` now holds this twice.**

- **By picture (`LOOKALIKE`).** Families of pictures a child would call one thing: the two tigers,
  the four dogs, the medals, the books, the music notes. A category picture and a card of the
  same category in one family is a failure. A card in another category may look like it, because
  a round's word only ever comes from its own category.
- **By word (`SYM_SAYS`).** What a child calls each category picture, written down by hand. A
  card of that category whose word is one of those names is a failure. Every category picture
  needs an entry, so a new picture fails until somebody has looked at it and written down what it
  shows.

Proved by putting `tiger` back, and by swapping the tiger's picture with the category's (🐅 ↔ 🐯).
Both are red.

#### A child who cannot read did not know they were the imposter

With Read aloud off, which is how the game arrives, the imposter's card was a big picture over a
word, exactly like everybody else's. A five-year-old dealt the imposter would see 🐯, take the
tiger for their word, and play as somebody who had it. "Imposter" was the one word on the card they
needed, and the only one they could not read. The note over `IMP_DECK` said the pictures let a
child who cannot read play with the voice off, which was true of every card but that one.

**The imposter's picture now carries a gold "?".** It sits on the picture's lower right, inside
the picture's own slot, so the card keeps its height and is still a big picture over a line of
text from across the table. It is not on the play screen, where the same picture belongs to
everybody. It means "you don't know the word", and a child learns it once.

The other choice was to write that a non-reader needs Read aloud for this. It was not taken
because Read aloud is off until somebody turns it on, and the owner's 8 Oct note was that the young
ones who cannot read should be able to play.

The first version hung the "?" from the middle of the picture. `.art` centres its children, so the
picture's box is only as wide as the emoji, and the mark stuck 5px out of it. `check/ui.js`
reported the picture scrolling sideways at 320 and 390. It is set from the picture's right edge
now, inside padding made for it.

Held by the screen journey (the "?" class on the imposter's card, and on no other card and not on
the play screen) and by `check/states.js`, which asks real Chromium whether the stylesheet draws a
"?" there and nothing on a player's card.

#### Dark pictures vanished into the dark card

Some pictures are drawn in black or dark grey, and the card is nearly black (rgb 30, 24, 17).
Measured in Chromium with Noto at 390, as the share of each picture's drawn pixels that reach 3:1
against the card:

| | before | after |
|---|---|---|
| ♠️ spades | 0% | 13% |
| ♣️ clubs | 0% | 13% |
| 🕸️ cobweb | 0% | 43% |
| 🕶️ sunglasses | 3% | 21% |
| ➖ minus | 4% | 19% |
| ➕ plus | 4% | 20% |
| ➗ divide | 8% | 24% |
| 🧥 coat | 8% | 19% |

The "after" share is the outline itself: a continuous light edge round the whole shape, which is
what makes the shape readable. Apple's font, on the family's iPads, draws ♠ ♣ ➕ ➖ ➗ and the music
notes in solid black.

**Every picture now has a hairline of `--ink` round it**: two `drop-shadow`s of the token, each a
fiftieth of the picture's size. A paper disc behind the picture was the other option. It was not
taken because it is a second shape on the card and paper is the other palette. The outline only
shows where a picture would have vanished, and is a sticker's edge on the ones that never did. It
does not use `color-mix()`, because iOS 15 drops the whole declaration over it.

Screenshots of spades, clubs, cobweb, sunglasses, minus, plus, divide and coat were taken before and
after at 390 and looked at. `check/states.js` asks that the picture has its outline. ✖️ times went
from the deck (below).

#### A double tap on Reveal threw the reveal away

This was already true before the pictures went in. Reveal's second tap landed on the reveal
screen's Players button: Reveal's centre is x=195 at 390, Deal ends at 191 and Players starts at
198, and Chromium's touch adjustment sends a tap in that gap to the nearer button. The round went
play → reveal → setup in one gesture, and the table never saw who it was.

**The reveal's Deal and Players now take `(el, e)` and ignore a press within `IMP_GAP`**, the
same guard Show, Hide and Reveal have. Players also stamps the time it acted. The double-tap
journey now double-taps Reveal onto both of those buttons and requires the reveal to stay up.
Both were red on the reviewed commit. In Chromium with real touch taps 120ms apart on Reveal's
centre, three runs each at 390x844 and 320x568: the reviewed commit went to the setup screen 6
times in 6, and this branch stays on the reveal 6 times in 6. A double tap on Players from there
lands on the setup screen with the player count unchanged.

The journey also taps Players on its own, past the gap, and requires the setup screen, so the
guard cannot swallow a first tap. `check/press.js` presses the reveal's two buttons straight after
Reveal, and with the guard they are quiet now: they are listed as known quiet, with that reason and
scoped to the play state, the way Show straight after Deal already was.

#### Pictures that were not honest

- `triangle` in Music was 🔺, the red shape, not the instrument: a picture of a different thing
  with the same name. It is a shape in Signs and symbols now, beside `circle` ⭕ and `square` 🟥.
- `thumb` 👍: a child says "thumbs up", which is a gesture. It moved to Actions as `thumbs up`,
  and The body has `face mask` 😷 in its place.
- `sundae` 🍨 is drawn as an ice cream, which is the seaside's card. Food has `falafel` 🧆 instead.
- `haunted house` 🏚️ is a run-down house with nothing haunted about it. Fairy tales has `coffin`
  ⚰️ instead.
- `theme park` 🎢 is a roller coaster. It is now `roller coaster`, at the seaside, with the big
  wheel and the merry-go-round.
- `skyscraper` 🏙️ is a skyline. It is now `city`.
- `cinema` 🎬 is a clapperboard. Around town has `post office` 🏤 instead.
- `Mrs Christmas` 🤶 is now `Mrs Claus`, which is what UK children say.
- `loudspeaker` 📢 is drawn as a megaphone, beside `megaphone` 📣. `wind chime` 🎐 is a Japanese
  glass chime that a UK child would call a bell. `DVD` 📀 is `CD` 💿 in gold. All three went.
- **Kept: `sunset` 🌅 at the seaside.** Unicode names it "sunrise", and Space and weather has
  `sunrise` 🌄. But a sun on the edge of the sea is what a child at the seaside calls a sunset, the
  two cards are never in the same round, and neither category had an honest picture left to swap
  in.

#### The same card twice under two names

Two cards in one category where one is the other with a word added: `apple` and `green apple`,
`moon` and `half moon`. The fold-based "no word twice" rule cannot see them. In this game the
imposter's best clue for `green apple` is the one for `apple`, so a pair like that is one card
that comes up twice as often.

- **Swapped:** `green apple` → `peanuts`, `half moon` → `umbrella`, `dead flower` → `scorpion`,
  `leaves` → `hedgehog`, `exercise book` → `atom`, `knife and fork` → `cutlery`, `boat` →
  `motor boat`, `Mrs Christmas` → `Mrs Claus`.
- **Swapped, as pictures of the same thing:** `truck` (`lorry` again, in British English),
  `loudspeaker` (`megaphone`), `DVD` (`CD`), `furious` 😡 (`angry` 😠, found here), and `times` ✖️
  (`cross` ❌, found here).
- **Let through, 22 pairs, each with its reason in `NEAR_OK`**, printed on every run. Some are
  different things that share a word: `football` and `American football`, `ice hockey`, `cable car`,
  `satellite dish`, `train track`. Others have no honest replacement left at 12.0: `full moon`,
  `cruise ship` beside `ship`, `guide dog`, `hatching chick`.
- **Not held, because they are in different categories:** `star` and `gold star`, `rock star` and
  `pop star`, `tent` and `campsite`. A round's word never sits beside a card from another
  category.

**Held by `check-widgets.js`**: within a category, a card whose whole folded word sits inside
another card's word fails unless `NEAR_OK` lets it through. An entry the deck no longer holds is an
error.

#### Every card that changed after review

41 cards and 5 category pictures after the first review, and 3 cards and 1 category picture after
the second (marked, and told in full under "After the second review"). Every category is still 30
cards, and the deck is 750 cards and 775 pictures. None is used twice, and none is newer than Emoji
12.0.

| Category | Was | Now | Why |
|---|---|---|---|
| Food | sundae 🍨 | falafel 🧆 | 🍨 is an ice cream, the seaside's card |
| Food | bacon 🥓 | fried egg 🍳 (from In the kitchen) | **second review:** what 🍳 draws, and no longer a kitchen card |
| Fruit and veg | green apple 🍏 | peanuts 🥜 (from In the kitchen) | `apple` again |
| In the kitchen | peanuts 🥜 | bin 🗑️ (from At home) | peanuts moved |
| In the kitchen | knife and fork 🍴 | cutlery 🍴 | `knife` again |
| In the kitchen | frying pan 🍳 | bacon 🥓 (from Food) | **second review:** the category's picture 🥘 is a pan of food from above too |
| At home | bin 🗑️ | wool 🧶 | bin moved |
| At home | umbrella ☂️ | credit card 💳 | umbrella moved |
| Clothes | T-shirt 👕 | headscarf 🧕 | the category's picture 👚 was a top |
| The body | thumb 👍 | face mask 😷 | 👍 is "thumbs up" |
| Feelings | furious 😡 | suspicious 🤨 | `angry` 😠 again |
| Actions | cartwheel 🤸 | thumbs up 👍 (from The body) | cartwheel moved |
| People | dancer 💃 | man 👨 | dancer moved |
| Wild animals | tiger 🐅 | orangutan 🦧 | the category's picture is 🐯 |
| Wild animals | hedgehog 🦔 | boar 🐗 | hedgehog moved |
| Wild animals | peacock 🦚 | buffalo 🐃 | peacock moved |
| Pets and farm animals | paw prints 🐾 | peacock 🦚 (from Wild animals) | 🐾 is the category's picture now |
| At the seaside | waves 🌊 | beach 🏖️ | 🌊 is the category's picture now |
| At the seaside | parasol ⛱️ | roller coaster 🎢 (from Around town) | the old picture 🏖️ was a parasol |
| At the seaside | boat 🛥️ | motor boat 🛥️ | `sailing boat` held `boat` |
| Nature | dead flower 🥀 | scorpion 🦂 | `flower` again |
| Nature | leaves 🍃 | hedgehog 🦔 (from Wild animals) | `autumn leaves` held `leaves` |
| Space and weather | half moon 🌓 | umbrella ☂️ (from At home) | `moon` again |
| Space and weather | telescope 🔭 | Milky Way 🌌 | **second review:** 🔭 is the category's picture now, and 🌌 was |
| Fairy tales | haunted house 🏚️ | coffin ⚰️ | nothing haunted is drawn |
| Around town | cinema 🎬 | post office 🏤 | 🎬 is a clapperboard |
| Around town | theme park 🎢 | shopping bags 🛍️ | 🎢 moved, as `roller coaster` |
| Around town | skyscraper 🏙️ | city 🏙️ | 🏙️ is a skyline |
| Sport | gold medal 🥇 | gymnastics 🤸 (from Actions) | the category's picture is 🏅 |
| School | backpack 🎒 | hundred 💯 (from Signs and symbols) | 🎒 is the category's picture now |
| School | exercise book 📒 | atom ⚛️ | `book` and `notebook` again, and in the old picture 📚 |
| Transport | truck 🚚 | siren 🚨 | `lorry` again |
| Celebrations | balloon 🎈 | Easter bunny 🐰 | 🎈 is the category's picture now |
| Celebrations | Mrs Christmas 🤶 | Mrs Claus 🤶 | `Christmas` again, and not what UK children say |
| Music | musical note 🎵 | dancer 💃 (from People) | the category's picture is 🎶 |
| Music | triangle 🔺 | repeat 🔁 (from Signs and symbols) | 🔺 is a shape, not the instrument |
| Music | loudspeaker 📢 | fast forward ⏩ (from Signs and symbols) | 📢 is a megaphone, and `megaphone` 📣 is a card |
| Music | DVD 📀 | rewind ⏪ (from Signs and symbols) | `CD` 💿 in gold |
| Music | wind chime 🎐 | stop button ⏹️ | a UK child would not know it |
| Signs and symbols | repeat 🔁 | triangle 🔺 (from Music) | repeat moved; 🔺 is honest as a shape |
| Signs and symbols | hundred 💯 | circle ⭕ | hundred moved |
| Signs and symbols | times ✖️ | square 🟥 | `cross` ❌ in black, and dark on the card |
| Signs and symbols | fast forward ⏩ | information ℹ️ | fast forward moved |
| Signs and symbols | rewind ⏪ | arrow ⬆️ | rewind moved |

Category pictures: Pets and farm animals 🐶 → 🐾, At the seaside 🏖️ → 🌊, School 📚 → 🎒, Transport
🛣️ → 🚥, Celebrations 🎉 → 🎈, and after the second review Space and weather 🌌 → 🔭.

Alcohol was kept out. 🍾 and 🥂 were the obvious Celebrations cards, and the deck has never held a
drink a child cannot have.

#### Pictures had to be one emoji, and nothing checked it

The checks tested code points one at a time. So a card with two pictures (`🐟🍟`), two regional
letters that are no flag (`🇺🇰`: the UK's code is GB, so it draws as the letters U and K), a doubled
`🔺🔺` and a skin tone newer than 12.0 (`🤝🏽` is 14.0) all passed with "none newer than Emoji
12.0" printed under them. Also, `ZWJ_OK` wrote down each joined picture's version and never read
it, so `🐻‍❄️` with `'13.0'` beside it went green.

**`check-widgets.js` now asks each picture against Unicode's own list, `\p{RGI_Emoji}`.** That
needs a regex with the `v` flag: Node 20 or later, and CI runs 22. The regex is built at run time,
so an older Node reports that it cannot check this rather than failing to parse the whole file. A
skin tone is refused outright, because every person in the deck is the default yellow. A `ZWJ_OK`
entry above 12.0 is a failure.

#### Fluff that only appears with Read aloud on was unchecked

The screen journey runs with no voice, so Listen and the Read aloud tile were never drawn there.
The read-aloud journey compared exact text on one screen only, and pressed − and + only before
Read aloud was on. A sentence beside Listen, a sentence under the switch, or "4 players" said on
every press all passed. That is the owner's exact complaint ("too much fluff with talking … even
written").

The read-aloud journey now presses − and + with Read aloud on and requires silence. It also holds
every screen to its exact words with Read aloud on: the setup screen, every hand-over, every card,
the imposter's card, play, the reveal, and setup again after Players.

#### The range and the hidden picture were unchecked

`IMP_MAX = 20` passed every journey, because the top of the range was never pressed. Taking
`aria-hidden` off the picture also passed. The screen journey now presses + thirteen times and
requires exactly "Players − 12 + Deal" with + disabled, then − twelve times and requires "Players −
3 + Deal" with − disabled. It also requires every picture on every card, on the play screen and on
the reveal to be `aria-hidden`.

#### The rule over the deck said the opposite of the deck

The comment over `IMP_DECK` opened "THE WORDS ARE THINGS, NOT IDEAS", and the same commit added
Feelings, Actions, and Signs and symbols. The rule is rewritten to say what is actually allowed: a
card is what its picture shows (a thing, a face, a gesture or a sign), and never an idea with no
picture. "Crying" (tears, sad, baby) is as easy to say three words about as "pizza".

**Open: the restructure was not asked for.** The brief said to replace a word within its own
category and keep 27 categories of 30. The deck is 25 of 30: four categories merged, Famous places
retired, three categories new. The reason is the one given above: ten categories could not find
thirty honest pictures at 12.0. It stays, and the code now explains it instead of contradicting
it, but nobody has yet decided whether to keep it.

#### The ledger above did not add up

Reconciled card by card against both decks:

- Five slot fills were listed nowhere: bow, leopard, hatching chick, water polo, ship.
- Two renames were missing: balloons → balloon, doll → dolls.
- `noughts and crosses` had left the deck without being mentioned.
- `spade` from In the garden was missing.
- `roller skates` was listed twice, once as replaced and once as dropped.

All of these are corrected in place above.

#### Every screen, after review

The words on every screen are unchanged. The imposter's card gains the "?", which is a mark and
not a word.

| Screen | Before review | After review |
|---|---|---|
| The imposter's card | 😋 / Imposter / FOOD / Hide [Listen] | 😋 with a gold "?" on it / Imposter / FOOD / Hide [Listen] |
| Play | 😋 / Player 3 starts / FOOD / Reveal | unchanged, with no "?" |
| Setup, hand-over, a player's card, reveal | as in the table at the top | unchanged |

The voice is unchanged: Listen says the word or "Imposter", and nothing else speaks.

#### Checks, after review

| Check | Result |
|---|---|
| `check-widgets.js` | passes: "25 categories, 750 words … 775 pictures, each one emoji, none twice, none newer than Emoji 12.0, no category's picture one of its own cards", and 22 pairs listed as let through. On the reviewed commit's deck it fails 31 ways |
| the 4 Imposter journeys | all pass. On the reviewed commit, 2 fail: no "?", and both double-tap-on-Reveal cases |
| `check/ui.js --screen=games` | 250 combinations, nothing new, every state measured. The first build of the "?" was reported here as sideways scroll and moved. On the reviewed commit's stylesheet, the imposter's-card and player's-card states are not met |
| `check/press.js --screen=games` | passes: 102 presses, 109 swipes all landed where they should, and the reveal's Deal and Players listed as known quiet straight after Reveal |
| `check/cascade.js` | passes: "nothing is decided by file order alone" |
| `check-flow.js`, whole | all 326 journeys pass, in four parts (81, 82, 81, 82) |
| every other `js/check-*.js` | pass, except `check-dead`, whose output is byte for byte the reviewed commit's |

#### Proved by mutation

Each mutation was made alone, on a copy of the branch, and turned a check red. Afterwards the copy
was byte for byte the branch again, and green.

| Mutation | Red |
|---|---|
| `tiger` 🐅 back in Wild animals | check-widgets: `both a tiger`, and `is what a child calls "tiger"` |
| the tiger's picture and the category's swapped (🐅 ↔ 🐯) | check-widgets: `both a tiger`, and 🐅 `is not in SYM_SAYS` |
| Celebrations' picture back to 🎉 | check-widgets: 🥳 `party` and 🎊 `confetti` `both confetti and a party` |
| School's picture back to 📚 | check-widgets: 📖 `book` and 📓 `notebook` `both a book` |
| a card called `balloon` in Celebrations | check-widgets: `is what a child calls "balloon"` |
| `green apple` back | check-widgets: `is "apple" again under a longer name` |
| `🐟🍟 chips` | check-widgets: `not one emoji` |
| `🇺🇰 Holland` | check-widgets: `not one emoji` |
| `🔺🔺 triangle` | check-widgets: `not one emoji` |
| `🤝🏽 shaking hands` | check-widgets: `with a skin tone` |
| `🐻‍❄️ bear` with `'13.0'` in `ZWJ_OK` | check-widgets: `a joined picture of Emoji 13.0 … newer than 12.0` |
| "4 players" said on − and + | read-aloud journey: `one player fewer said ["3 players"]` |
| "Hold the phone to your ear" beside Listen | read-aloud journey: `wanted exactly "🐙 octopus Hide"` |
| "Turn this on to hear your word" under the switch | read-aloud journey: `wanted exactly "Players − 4 + Deal"` |
| `IMP_MAX = 20` | screen journey: `reads "Players − 17 + Deal", wanted exactly "Players − 12 + Deal"` |
| `aria-hidden` off the picture | screen journey: `a picture is not aria-hidden` |
| no "?" on the imposter's card | screen journey: `has no "?"` |
| the "?" on every card | screen journey: `who has the word, has the imposter's "?"` |
| Players without the guard | double-tap journey: `a second tap straight after Reveal pressed Players` |
| the reveal's Deal without the guard | double-tap journey: `a second tap straight after Reveal pressed the reveal's Deal` |
| Players that ignores every tap | double-tap journey: `Players tapped on its own on the reveal did not go back to the setup screen` |
| the "?" rule's `content` taken out of style.css | `check/ui.js`: the imposter's-card state not met at any of its 10 sizes and visitors |
| the outline taken off `.imp-sym` | `check/ui.js`: the player's-card state not met at any of its 10 sizes and visitors |

#### Not done here

- **The halo, the "?" and the new pictures have not been seen on an iPad.** They were drawn in
  Chromium with Noto. Apple's drawings of 🎈 🌊 🚥 🎒 🐾 and of the 41 new cards were not seen
  here.
- **Accepted near-pairs are a judgement.** Each is written down with its reason in `NEAR_OK`, so a
  later deck can take any of them out.

### After the second review (12 October)

One finding, reproduced on the reviewed commit (368a5a5) first: **two category pictures still
showed a card of their own category**, while `check-widgets.js` printed "no category's picture one
of its own cards" over them. That was the rule the first review's fix said it now held.

#### A pan of food and a sky of stars

- **In the kitchen 🥘 over `frying pan` 🍳.** Both are a pan with food in it, seen from above, in
  Noto and in Apple's drawing alike. `SYM_SAYS` had already written down that a child calls 🥘
  "pan", and passed `frying pan` anyway, because it compared the whole word.
- **Space and weather 🌌 over `shooting star` 🌠 and `star` ⭐.** 🌌 and 🌠 are both a dark square
  of night sky with stars in it, in both sets, and a child looking at 🌌 says "stars".

In the real app, with the round's card chosen and the imposter set to player 2: player 1 saw
"🍳 frying pan Hide" and the imposter "🥘 Imposter IN THE KITCHEN Hide"; player 1 saw "🌠 shooting
star Hide" and the imposter "🌌 Imposter SPACE AND WEATHER Hide". Each pair is one round in 750.

| Category | Was | Now | Why |
|---|---|---|---|
| In the kitchen | the card `frying pan` 🍳 | `bacon` 🥓, from Food | the category keeps 🥘, because a pan of food on the hob is the kitchen; the frying pan was its double |
| Food | the card `bacon` 🥓 | `fried egg` 🍳, from In the kitchen | what 🍳 draws: an egg in a pan. Food's 😋 is a face, and nothing like a pan |
| Space and weather | the picture 🌌 | 🔭 | a telescope, which no card is or draws |
| Space and weather | the card `telescope` 🔭 | `Milky Way` 🌌 | 🔭 is the category's picture now, and 🌌 is a picture of the Milky Way: its own Unicode name |

Still 25 categories of 30, 750 cards and 775 pictures, none twice, none newer than Emoji 12.0 (🔭
is Emoji 1.0 and 🌌 is 0.6).

**The review's suggestion for the kitchen, 👨‍🍳, was not taken.** Noto draws the cook holding a
frying pan with a fried egg in it, which is the card again. And 👨‍🍳 is 👨, a joiner and 🍳, so a
phone that cannot join them draws a man and a frying pan side by side. Apple's cook holds a wooden
spoon, but Noto is what every Android phone and the checks' Chromium draw. The kitchen's other
pictures are all its own cards, or newer than 12.0: 🍽️ is a plate with cutlery, 🥣 is a bowl with a
spoon, 🔪 🥄 🧂 are cards, and 🫖 and 🧑‍🍳 are 13.0 and 12.1. So the card moved and the picture
stayed.

**Space and weather's picture changed, and not just `shooting star`**, because a child calls 🌌
"stars", which is `star` as well. Both are among the first words anybody thinks of for space.
Every other picture of the sky at 12.0 is a card here or a double of one: ☀️ 🌙 ⭐ ☁️ 🌈, the moon
in every phase, and 🌦️ ⛅ 🌩️, which are clouds with sun, rain or lightning. The telescope is the
one that points at the whole category without being any of it. Like 🌌 before it, it says space
and not weather, and SPACE AND WEATHER is written under it.

#### The check now looks by picture, by word and by parts

- **`LOOKALIKE`** gains `['🥘🍳', 'a pan with food in it, seen from above']` and
  `['⭐🌟🌠🌌🌃', 'stars']`, and 🌃 joins the moon family too. A picture can be in more than one
  family now, and every family it is in is asked. Before, only the first one found was asked.
- **`SYM_SAYS` matches the end of a card's word**, in whole words, folded. The last word of an
  English name is what the thing is. A frying pan is a pan, so `frying pan` meets "pan". A top hat
  is not a top, so `top hat` under Clothes does not meet 👚's "top". Equality is the case where the
  name is the whole word, so nothing the old rule caught is let go.
- **A joined picture is its parts.** A category picture joined from one of its own cards'
  pictures fails, and so does a card joined from the category's. That is the 👨‍🍳 case above, held.
- **`KEPT`** writes down the pairs that were looked at and kept, with a reason each. They are
  printed every run, the `NEAR_OK` way. An entry the deck no longer holds is an error, so the list
  cannot outlive its cards.

#### Looked at and kept

The review raised three more pairs as borderline: 🎶 and `treble clef`, 🌊 and `surfing`, and 🎭 and
`happy` and `sad`. After that, every category's picture was laid beside its thirty cards in Apple's
drawings and in Noto's. The Apple images came from the `emoji-datasource-apple` 15.1.2 package,
which holds the pictures Apple's font draws. That turned up five more, and the telescope was checked
against its neighbour. None of them is the same thing drawn twice, which is what 🥘/🍳 and 🌌/🌠
were. Each one is either a scene with several cards in it, or the same kind of drawing as a card.
Each is kept because no honest picture is left to take its place:

| Category's picture | Its cards | Kept because |
|---|---|---|
| Fruit and veg 🥗 | lettuce, tomato, cucumber | a salad is three cards in one bowl, so it points at all three and at none, and every fruit and vegetable at 12.0 is a card already |
| Clothes 👚 | vest 🎽 | a blouse with sleeves and a collar beside a sleeveless running vest. A child calls them "top" and "vest", and every Clothes picture is a garment laid flat |
| Feelings 🎭 | happy, sad | two faces at once, so they point at both and at neither, and FEELINGS gives those two as the first guesses anyway. Every face at 12.0 is a card, a heart is `in love`, and a thought bubble is `thinking` |
| Actions 🚶 | running 🏃 | the same person mid-stride, upright against leaning in both sets, and no card is walking. Any picture of a person doing something is beside one of the thirty |
| At the seaside 🌊 | surfing 🏄 | Apple's surfer has no wave at all, and Noto's wave is behind him. A wave is the sea every seaside card is in or beside |
| Nature 🏞️ | mountain, tree, pine tree | a landscape is several Nature cards at once. **The nearest to failing**: in Apple's drawing a mountain is the biggest thing in it. Every other landscape at 12.0 is a mountain again, a card, or another category's card, and every plant left doubles one |
| Space and weather 🔭 | satellite dish 📡 | both point at the sky, but one is a tube on legs and the other a dish on a house |
| Music 🎶 | treble clef 🎼 | neither set draws a note on 🎼, and a child names it by its clef. The one name the two share is "music", which is the category's own name |
| Signs and symbols 🔣 | hashtag #️⃣ | both sets draw every keycap as the same blue key (ℹ️ and 🆕 too), and a child calls 🔣 "symbols", never "hashtag" |

**Not listed:** Sport 🏅 beside `trophy` 🏆, a medal and a cup that both sets draw nothing alike, and
Pets 🐾 beside `dog` and `cat`, because paw prints are not the animal. The body 🧍 is a whole person
over the parts, which is the category's own idea.

#### Every screen, after the second review

The words on every screen are unchanged. Only pictures and three cards moved:

| Screen | Before | After |
|---|---|---|
| The imposter's card, Space and weather | 🌌 with a "?" / Imposter / SPACE AND WEATHER / Hide | 🔭 with a "?" / Imposter / SPACE AND WEATHER / Hide |
| Play, Space and weather | 🌌 / Player 3 starts / SPACE AND WEATHER / Reveal | 🔭 / Player 3 starts / SPACE AND WEATHER / Reveal |
| The imposter's card, In the kitchen | 🥘 with a "?", over a deck with a frying pan in it | the same card, over a deck with no pan in it |
| A player's card, the cards that moved | 🍳 frying pan, 🥓 bacon, 🔭 telescope | 🥓 bacon, 🍳 fried egg, 🌌 Milky Way |

The voice is unchanged: Listen says the word ("bacon", "fried egg", "Milky Way") or "Imposter", and
nothing else speaks.

**Screenshots looked at**, before and after, at 320x568, 390x844 and 1280x800: the imposter's card
and a player's card for each card that moved, in the real app, plus the sheets of every category in
Apple's and Noto's drawings. The picture is centred over its word, nothing is cut off, the "?" stays
inside the picture's slot, and no card scrolls sideways (216, 270 and 340 wide at the three sizes,
as before).

#### Checks, after the second review

| Check | Result |
|---|---|
| `check-widgets.js` | passes: "… 775 pictures, each one emoji, none twice, none newer than Emoji 12.0, no category's picture one of its own cards", the 22 `NEAR_OK` pairs and the 9 `KEPT` entries listed. On the reviewed commit's deck it fails 7 ways: the pan by family and by the end of its word, the star and the shooting star, and three lines saying the lists are written for the new deck (🌌 has no `SYM_SAYS` entry, and 🔭 has one and a `KEPT` one) |
| the 4 Imposter journeys | all pass, the deck journey dealing and showing all 750 cards |
| `check-flow.js`, whole | all 326 journeys pass, in four parts (81, 82, 81, 82) |
| every other `js/check-*.js` | pass, except `check-dead`, whose output is byte for byte the reviewed commit's |
| `check/ui.js --screen=games` | 250 combinations, nothing new. The first run, at a load of 44 from other sessions, left one state unmeasured at 768 and 1920 ("the big line and the button stay put", which walks a whole round with Read aloud on and off, a rest after every press); run again at a load of 14 it measured all 250 |
| `check/press.js --screen=games` | passes: 102 presses, 107 swipes all landed where they should, and the reveal's buttons straight after Reveal listed as known quiet |
| `check/cascade.js` | passes: "nothing is decided by file order alone" |

#### Proved by mutation, after the second review

Each made alone on a copy of the branch, `check-widgets.js` run there. Afterwards the copy was
byte for byte the branch again, and green.

| Mutation | Red |
|---|---|
| `frying pan` back in the kitchen, with `SYM_SAYS` back to the whole word | `are both a pan with food in it, seen from above` (the family alone) |
| `frying pan` back in the kitchen, with the 🥘🍳 family taken out | `"pan" is what a "frying pan" is` (the end of the word alone) |
| `frying pan` back in the kitchen | both of the above |
| Space and weather back to 🌌 with `telescope`, and 🌌's old `SYM_SAYS` entry | 🌌 and ⭐ `star`, 🌌 and 🌠 `shooting star`: `are both stars` |
| Space and weather's picture 🌃 | five: `moon` and `full moon` as the moon, `star`, `shooting star` and `Milky Way` as stars |
| the same, asking only the first family found (as before) | only the two moons: the stars were not asked |
| Food's picture 👨‍🍳, over its `fried egg` 🍳 | `the category's picture is joined from the card's` |
| the same, with the joined-picture rule taken out | green, which is why the rule is there |
| the review's suggestion: In the kitchen 👨‍🍳 over `frying pan` | `the category's picture is joined from the card's` |
| `surfing` renamed `surfer` | `KEPT has "At the seaside\|🌊\|surfing", which the deck no longer holds` |
| `cucumber` renamed `cucumbers` | `KEPT has "Fruit and veg\|🥗\|lettuce,tomato,cucumber" … no card "cucumber"` |
| `tiger` back in Wild animals (the first review's proof, under the new rule) | `both a tiger`, and `is what a child calls "tiger"` |
| a card called `balloon` in Celebrations (the whole-word case, under the new rule) | `is what a child calls "balloon"` |

#### Not done here

- **Apple's drawings were looked at as Apple's own images** (`emoji-datasource-apple` 15.1.2,
  what iOS 17 draws), not on an iPad. An iPad on iOS 13 to 16 draws some of them differently.
- **`KEPT` is a judgement, and Nature is the one to look at first.** 🏞️ over `mountain` is the
  nearest of the nine to the two that failed. It stays only because nothing at 12.0 can take
  either place. If the deck ever goes past 12.0, that is the first entry to undo.
