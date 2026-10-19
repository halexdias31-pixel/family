# js/check-widgets.js

The full text of comments in `js/check-widgets.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-widgets.js EVERY WIDGET IS THE SAME SHAPE, AND NOTHING WAS CHECKING THAT IT WAS.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-widgets.js

   EVERY WIDGET IS THE SAME SHAPE, AND NOTHING WAS CHECKING THAT IT WAS.

   `WIDGETS` in map.js is the list of things this app can open. A widget is an object, and the
   contract is entirely by convention: an `id`, a `kind`, a `name`, some `html`, and — if it has
   anything to run — an `into` naming the element to run in and a `start` to run. Nothing enforced
   any of it, so the failures were all of the same family and all silent:

     • `into` NAMING AN ID THE HTML DOES NOT CONTAIN. `start` runs, looks the element up, finds
       nothing and returns. The card draws, the widget is dead, and nothing anywhere says so. This
       is the `DATA.messages` fault in another costume — wired at one end.
     • `start` WITH NO `into`. Same outcome, one line earlier.
     • A DUPLICATE `id`. `widgetsOf_` returns both, the pager counts both, and `$(into)` finds the
       first — so the second is a page you can swipe to that shows somebody else's widget.
     • A `kind` THAT IS NEITHER `tool` NOR `game`. `widgetsOf_` filters on exactly those two
       strings, so anything else is a widget that exists and appears on no column at all.

   WHY THIS IS PARSED AND NOT GREPPED. I wrote the first version of this audit as a regex over
   `map.js` and it silently missed three widgets — the three I had added that day — because their
   `html` contains `${}` and braces. A checker that quietly skips what it cannot parse reports a
   clean bill of health for the part it did not read, which is the worst answer it could give.
   acorn is already a dependency; the file is parsed and the array is walked.

     node js/check-widgets.js
================================================================================================== */
```

### ---------- AND THE ONE THAT MEANS IT, WITH ITS REASON WRITTEN DOWN

top level, before `ACCEPTED_UNTITLED`

```
/* ---------- AND THE ONE THAT MEANS IT, WITH ITS REASON WRITTEN DOWN -------------------------------
   `chess` HAS NO HEADING ON PURPOSE and says so in its own comment: "A title saying 'Chess' above a
   chessboard... A board is self-explanatory in a way almost nothing else in this app is." That was
   true and it was not what happened — `widgetColumn_` printed the roster's `name` above it anyway,
   so the widget's argument had been overruled by a line in another file for as long as both
   existed. Removing that heading is what finally does what this comment asked for.

   LISTED RATHER THAN EXEMPTED BY SHAPE, for the same reason as `ACCEPTED` in check-payload.js and
   `ACCEPTED_TAP` in check/ui.js: the next untitled widget should fail loudly instead of joining a
   red nobody reads. */
```

### ---------- THE KINDS A COLUMN ASKS FOR, READ OFF THE CODE THAT ASKS

top level, before `ASKED_KINDS`

```
/* ---------- THE KINDS A COLUMN ASKS FOR, READ OFF THE CODE THAT ASKS ------------------------------
   THIS WAS `'tool' OR 'game'`, WRITTEN OUT, and the basket's move to the Shop column made it a
   false red on its first run: `cart` has kind 'shop' and `shopCards_` asks `widgetsOf_('shop')`.
   A hand-kept list of what the code asks for is the drift this repository keeps paying for, so it
   is every literal `widgetsOf_('…')` / `toolsStart_('…')` / `widgetColumn_('…')` in js/, comments
   stripped — a kind nothing asks for is still the fault this rule exists to catch. */
```

### ---------- THE WIDGET'S OWN MARKUP CARRIES ITS TITLE

top level, before `into`

```
/* ---------- THE WIDGET'S OWN MARKUP CARRIES ITS TITLE ------------------------------------------
     `widgetColumn_` USED TO PRINT THE ROSTER'S `name` ABOVE THE WIDGET and every widget's html
     already had a heading, so every tool on the column showed its name twice — "Calculator ||
     Calculator" — and the cheat sheet showed three headings under two different names, because the
     roster label and the card's own title had drifted apart with nothing comparing them.

     THE WIDGET'S HEADING IS NOW THE ONLY ONE DRAWN. Which makes its absence a widget with no title
     at all rather than a widget with one — silent, and only on the column, because `name` still
     labels it everywhere else. So it is checked here, where the contract already lives. */
```

### ---------- AN ENGINE WITH NO WIDGET, WHICH IS HOW THREE GAMES VANISHED

top level, before `ACCEPTED_ENGINE`

```
/* ---------- AN ENGINE WITH NO WIDGET, WHICH IS HOW THREE GAMES VANISHED --------------------------
   I DELETED CONNECT 4, OTHELLO AND HERD MENTALITY BY ACCIDENT AND EVERY CHECK STAYED GREEN.

   Removing The Overworld, I cut from its entry to the next one I could see — and those three sat in
   between. 45 lines went. `check.js` was happy (the functions were still declared), `check-flow`
   was happy (it does not know what should be on a column), and `check/ui.js` was happy (it measures
   what is drawn, and three fewer pages measure fine). The app lost three games in silence.

   THE ONE SIGNAL THAT EXISTED WAS A SOFT NOTE. `check-dead` named `initHerd` among six other
   function names on a single comma-separated line, in a check that reports rather than fails. It
   did not name `initConnect4` or `initOthello` at all, because `on('c4-again')` still called them —
   so the code looked alive while nothing could reach it.

   SO THIS ASKS THE QUESTION FROM THE OTHER END. Not "does this widget work" but "is there machinery
   here for a widget that no longer exists": a function named like a widget's starter, in the files
   widgets are built from, that no widget's `start` mentions. A game's engine with no entry in
   WIDGETS is either a widget somebody deleted or one somebody forgot to add, and both are worth
   stopping for. The test is whether the name appears inside any widget's `start`, so a starter
   reached by a widget passes however it is spelled. */
```

### KEPT ON PURPOSE, WITH A REASON EACH — the same arrangement check-payload.js and check-access.js use, and for the same reason:

top level, before `ACCEPTED_ENGINE`

```
/* KEPT ON PURPOSE, WITH A REASON EACH — the same arrangement check-payload.js and check-access.js
   use, and for the same reason: a permanently red check is one nobody opens, and a deliberate
   orphan is not a fault. An entry here is a promise that somebody looked. */
```

### THE ROSTER, PRINTED EVERY RUN.

top level, before `untitled`

```
/* THE ROSTER, PRINTED EVERY RUN. A count alone does not say WHICH \u2014 and the whole failure above
   was three names quietly leaving a list. Printed in full so a disappearance shows in a diff of this
   check's own output, which is the cheapest alarm there is. */
```

### ---------- AND THE WORD DECKS THAT ARE DEALT ON ONE COLUMN

top level, before `gsrc`

```
/* ---------- AND THE WORD DECKS THAT ARE DEALT ON ONE COLUMN --------------------------------------
   ARTICULATE AND CHARADES ARE PAGES OF THE SAME COLUMN, so a word in both decks can be dealt twice
   in one sitting — once to be described and once to be mimed — and the second time the room already
   knows the answer. It happened: `Countdown` was in the charades TV deck and `a countdown` is in
   Articulate's Random, and the only thing that found it was an agent told to try to refute the deck
   rather than approve it.

   FOUR MORE DECKS JOINED THE COLUMN — Just a Minute's topics, Taboo's words, Hot Seat's words and
   20 Questions' secrets — and the argument is the same for all six: the answer to one game must not
   be the answer to another an hour later. So every pair is compared, not just the first two. Taboo's
   FORBIDDEN words are not dealt and are not compared; Imposter's deck is left out deliberately, and
   the note over `IMP_DECK` says why. A list that is dealt but never guessed goes in `OWN_ONLY` below
   and is checked for repeats within itself and nothing else.

   THE COMPARISON IGNORES A LEADING ARTICLE, because `a countdown` and `Countdown` are the same word
   to a room and different strings to a checker — which is the `spellKey_` argument one file along.

   THIS IS A FAILURE, NOT A COUNT, and it can be, because the number is zero: a collision is one word
   to change, not a backlog to work through. */
```

### EMPTY SINCE ALIBI WENT.

top level, before `OWN_ONLY`

```
/* EMPTY SINCE ALIBI WENT. Its four lists — crimes, times, places and questions — were the only
     decks on the column that nobody guesses, and they were deleted with the game ("delete alibi
     game."). The list stays because the rule is still right for the next such deck, and naming a
     deck here is the whole of adding one. */
```

### AND IT FOLDS A PLURAL, WORD BY WORD, which the first version of this rule did not.

top level, before `fold`

```
/* AND IT FOLDS A PLURAL, WORD BY WORD, which the first version of this rule did not. Comparing
       spellings let `Penguins` on Just a Minute sit beside `a penguin` on Charades, `Dinosaurs`
       beside Taboo's `dinosaur` and `Socks` beside 20 Questions' `a sock` — thirty-odd pairs a room
       hears as one word, every one of them passing a rule written to catch exactly that. So each word
       loses a plural ending and then a final e (`potatoes` and `potato`, `shoes` and `shoe`, `witches`
       and `witch` all meet), which is cruder than English and errs towards calling two words one —
       the cheaper mistake here, because the cost of a false alarm is choosing a different card.
       What it does NOT catch is one card inside another (`guitar` in `playing the guitar`): that is
       a judgement, and the five new decks were swept for it by hand rather than by a rule that would
       also refuse `a kettle` for appearing in a nursery rhyme. */
```

### ---------- IMPOSTER'S DECK, WHICH IS LEFT OUT OF THE COMPARISON ABOVE AND NOT OUT OF EVERYTHING

top level, before `gsrc`

```
/* ---------- IMPOSTER'S DECK, WHICH IS LEFT OUT OF THE COMPARISON ABOVE AND NOT OUT OF EVERYTHING -------
   ASKED FOR AS "more categories and words" (8 Oct), when it went from eleven categories of twenty-two
   to twenty-seven of thirty; and "Add symbols to imposter" (11 Oct), when every card got its picture
   and the deck became twenty-five of thirty, because only so many words have an honest one. The notes
   over `IMP_DECK` are the argument; this holds its shape, because every fault in a deck draws
   perfectly — a word dealt twice is a card that comes round twice as often, a picture that is a box
   on an older iPad is one player's card looking broken, and nobody playing would ever say so.

   READ THE WAY THE GAME READS IT. A category is `{ sym, cards }` and a card is '🍕 pizza', its picture,
   one space, its word — split here as `impCards_` splits it in games.js. A deck in any other shape is
   not a deck this game can deal, and is said, never skipped.

   AT LEAST 25 CATEGORIES, AT LEAST 30 WORDS IN EACH, AND THE SAME NUMBER IN EVERY ONE. Below that the
   owner's "more" quietly shrinks again; and the pile is every (category, word) pair, so a category's
   share of the rounds is its share of the cards — one of thirty-one beside twenty-four of thirty is a
   hint that comes up more for no reason anybody chose.

   NO WORD TWICE ANYWHERE, folded harder than the rule above: case, apostrophes, hyphens and a trailing
   s all go, so `hairdresser` and `hairdresser’s`, `fry-up` and `fry up`, `seed` and `seeds` meet. The
   old deck had the first pair, in Jobs and in Places, and passed every check there was.

   NO WORD THAT SAYS ITS OWN CATEGORY. The category is the imposter's whole hint, so `school bus` under
   School — the old deck had it, and `school trip` beside it — hands the imposter half of the answer.

   ANY WORD OF THE CATEGORY, NOT THE WHOLE OF IT. This tested for the whole phrase inside the card, and
   15 of the 27 categories were more than one word: `kitchen sink` under In the kitchen, `garden gnome`
   under In the garden and `toy box` under Toys and games were each put in and passed, with the line
   "none naming its category" printed under them (the review of 8 October). So each word of the
   category that carries meaning — not the, and, in, at or of — is held against each word of the card,
   folded the same way. Whole words still, so `seahorse` is not `sea`.

   `CAT_WORD_OK` IS A CARD LET THROUGH, with its reason, printed every run like the check's other
   lists: a new one is a failure, not a line added to a list nobody reads. It is EMPTY since 11 Oct:
   its one entry was `sea urchin` in Sea life, and both went — Sea life into At the seaside, the urchin
   for want of a picture. An entry the deck no longer holds is an error, which is how that was found.

   EVERY CARD HAS A PICTURE, AND NO PICTURE IS ON TWO CARDS — a category's counted with them, because
   the imposter is shown their category's picture, and a word's picture in that place would be a word.
   A PICTURE IS EMOJI AND NOTHING ELSE: no letter, no space. AND A PICTURE THAT IS AN OLD SYMBOL CARRIES
   ITS U+FE0F — ☀ ✂ ♠ and the rest are drawn as plain black text without it on some phones, beside
   everybody else's colour; the selector is invisible, so a retyped picture loses it and nobody sees.

   NOTHING NEWER THAN EMOJI 12.0 (iOS 13.2, 2019): a newer picture is an empty box on an older iPad.
   `NEWER` is every single code point Unicode added to emoji after 12.0, from its own data up to Emoji
   17.0 (unicode-emoji-json, emojibase-data and emoji-datasource agree on every one), and anything past
   U+1FAFF, which is where the next ones will go. A JOINED PICTURE — 👩‍🏫, two emoji and a joiner —
   is newer than either of its halves can say (🧑‍🏫 is 12.1, made of two 5.0 and 0.6 pictures), so
   those are let through BY NAME in `ZWJ_OK`, each with the version Unicode's emoji-zwj-sequences
   gives it: a new one is a failure until somebody has looked it up. AND THE VERSION WRITTEN THERE IS
   READ: a lookup that came back 13.0 and was written down passed until the review of 11 October,
   with "none newer than Emoji 12.0" printed under it (🐻‍❄️ with `'13.0'` beside it went green).

   AND EACH PICTURE IS ONE EMOJI — Unicode's own list of them, `\p{RGI_Emoji}`, which only a regex
   with the `v` flag can ask for (Node 20 and later; CI is 22). The classes above test code points
   one at a time, so `🐟🍟` (two pictures on one card), `🇺🇰` (two letters that are no flag — a
   flag is an ISO code, and the UK's is GB) and `🔺🔺` all passed them. A Node that cannot ask is
   said, never passed. NO SKIN TONE either: a tone is a choice the deck does not make — every person
   on a card is the default yellow — and a modifier joined to an old hand can be newer than both
   halves (`🤝🏽` is 14.0, from a 3.0 handshake and a 1.0 tone), which no code-point range can see.

   ---------- A CATEGORY'S PICTURE IS NEVER ONE OF ITS OWN CARDS -------------------------------------
   THE IMPOSTER HOLDS THE CATEGORY'S PICTURE where everybody else holds the word's, so a category
   picture that shows one of its cards hands the imposter the word, big, in colour, on that one
   card in thirty. The rule was written over `IMP_DECK` from the start and held only by "no picture
   twice" — which compares code points, and 🐯 is not 🐅. The review of 11 October found eight that
   way, every check green: Wild animals 🐯 over `tiger` 🐅, Pets 🐶 over `dog` 🐕 (and `guide dog`,
   `poodle`), At the seaside 🏖️ over `parasol` ⛱️, Sport 🏅 over `gold medal` 🥇, Music 🎶 over
   `musical note` 🎵, School 📚 over `book` 📖, Clothes 👚 over `T-shirt` 👕, Celebrations 🎉 over
   `confetti` 🎊 and `party` 🥳. So it is held twice, by picture and by word:
     - `LOOKALIKE`: families of pictures a child would call one thing — two drawings of a tiger,
       four of a dog, a sports medal and a gold one. A category's picture and a card of the SAME
       category in one family is a failure. Another category's card may look like it: that round's
       word is never theirs.
     - `SYM_SAYS`: what a child calls each category picture, written down by hand. A card of that
       category whose word IS one of those names is a failure (🎉 is "party", so `party` under
       Celebrations is the imposter told the word). EVERY CATEGORY PICTURE NEEDS AN ENTRY: a new or
       changed one is a failure until somebody has looked at it and said what it is, which is the
       `ZWJ_OK` rule again — and the only way a picture nobody listed in a family is ever looked at.
   The 🐯/🐅 swap (the tiger's picture for the category's, and the other way) is how this is proved.

   AND BOTH HALVES LEFT TWO THROUGH, printing "no category's picture one of its own cards" over them
   (the second review, 12 October): In the kitchen 🥘 over `frying pan` 🍳 — a pan of food seen from
   above, twice, in Noto and in Apple's drawing alike — and Space and weather 🌌 over `shooting star`
   🌠 and `star` ⭐, a square of night sky with stars in it beside another. SYM_SAYS had written down
   that 🥘 is "pan", and passed `frying pan`, because it asked for the WHOLE word. So:
     - a SYM_SAYS name now matches the END of a card's word, whole words, folded: the last word of an
       English name is what the thing is (a frying pan is a pan; a top hat is not a top, and Clothes'
       👚 is "top"), so `frying pan` meets "pan" and `top hat` does not meet "top". Equality is the
       case where the name is the whole word, so nothing the old rule caught is let go;
     - a picture may be in more than one family (🌃 has stars and a moon), and every one is asked;
     - A JOINED PICTURE IS ITS PARTS: 👨‍🍳 is 👨, a joiner and 🍳, and Noto draws the cook holding
       that frying pan, egg and all — so a category picture joined from one of its own cards'
       pictures, or a card joined from the category's, is a failure. It was the review's own
       suggestion for the kitchen, and the drawing is why it was not taken.
   `KEPT` is the other half of a judgement: a category's picture beside its own cards that it draws
   or is drawn like — raised by the review, or found by laying Apple's drawings of all twenty-five
   beside their thirty — looked at in Noto and in Apple's drawing, and kept, each with its reason,
   printed every run the `NEAR_OK` way, and an error once the deck no longer holds it.

   ---------- NOT THE SAME CARD TWICE UNDER TWO NAMES ----------------------------------------------
   "NO WORD TWICE" FOLDS AND COMPARES, so `apple` and `green apple`, `chick` and `hatching chick`,
   `moon` and `half moon` all passed it — 31 such pairs inside one category when the pictures came
   in (the review of 11 October). In this game the word is talked about ONE WORD AT A TIME, and the
   imposter's best clue for `green apple` is the one for `apple`; a pair like that is a card that
   comes up twice as often. So within a category, a card whose whole folded word sits inside
   another's (`moon` in `full moon`) is a failure unless `NEAR_OK` lets it through with a reason —
   printed every run, the `CAT_WORD_OK` way, and an entry the deck no longer holds is an error. */
```

### PICTURES A CHILD WOULD CALL ONE THING.

top level, before `LOOKALIKE`

```
/* PICTURES A CHILD WOULD CALL ONE THING. Compared without U+FE0F, which changes how a picture is
       drawn and not what it is of. A family need not be in the deck whole — 🐱 and 🥈 are here so
       that a category picture changed to one of them is still caught, and 🥘 and 🌌 so that the two
       the second review found cannot come back. 🎼 is NOT with the music notes: see `KEPT`. */
```

### LOOKED AT AND KEPT — a category's picture beside cards of its own that it draws, or is drawn like, and is not:

top level, before `KEPT`

```
/* LOOKED AT AND KEPT — a category's picture beside cards of its own that it draws, or is drawn
       like, and is not: 'category|picture|card,card' to the reason. Raised by the second review
       (🎶 🌊 🎭) and by laying Apple's drawing of every category's picture beside its thirty
       (emoji-datasource-apple 15.1) and Noto's beside them. No rule above fails these, so this
       list lets nothing through: it is the judgement written where the next person to raise the
       pair will look, printed every run, and an entry the deck no longer holds is an error. Most
       say why nothing else could take the place — the same "no honest picture left at 12.0" that
       NEAR_OK gives — and that is the part to look at again if the deck ever goes past 12.0. */
```

### ONE EMOJI, ASKED OF UNICODE'S OWN LIST — see "each picture is one emoji" above.

top level, before `RGI`

```
/* ONE EMOJI, ASKED OF UNICODE'S OWN LIST — see "each picture is one emoji" above. Built here and
       not written as a literal, because a `v`-flag literal is a SyntaxError on an older Node, and that
       would stop the whole of this file rather than say this one thing cannot be checked. */
```

### ---------- THE SENTENCE SCRAMBLE'S SENTENCES AND THE WORD SEARCH'S WORDS

top level, before `gsrc`

```
/* ---------- THE SENTENCE SCRAMBLE'S SENTENCES AND THE WORD SEARCH'S WORDS ------------------------
   BOTH GAMES ARE ONLY AS GOOD AS THEIR LISTS, and every fault in a list draws perfectly: a sentence
   whose stated alternative uses a word the pool does not have is a right answer nobody can build; a
   theme word longer than its grid is never placed; a theme that cannot fill its puzzle three times
   over deals the same six words every time. And the word search's filter is a COPY of the backend's
   `HANDLE_BLOCKED` — the phone never sees that list — so the two are compared here, where a copy kept
   by hand would otherwise quietly fall behind. The notes over `SS_SENTENCES` and `WS_THEMES` in
   games.js are the argument for each rule. */
```

### A WIDGET DRAWN AHEAD RUNS NOTHING — AND ONE THAT SAYS IT READS NO FACTS READS NONE

top level, before `ACCEPTED_IMPURE`

```
/* ==================================================================================================
   A WIDGET DRAWN AHEAD RUNS NOTHING — AND ONE THAT SAYS IT READS NO FACTS READS NONE

   THE BUILDER DRAWS EVERY WIDGET SLOT BEFORE ANYBODY ARRIVES (`aheadDrawWidget_`, arcade.js;
   docs/history/341): a widget with no `stop` by its own `start`, one WITH a `stop` by its declared `draw`.
   The whole arrangement rests on two promises nothing else can see being broken:
     · A DRAW AHEAD RUNS NOTHING. A widget whose `start` runs something — a frame loop, a clock, a clip,
       a sound, the camera, the network — has a `stop`, and a widget with a `stop` is drawn by a `draw`
       that runs none of it. Broken, it is a game ticking or a film downloading on a column nobody is on,
       which is the flat battery arcade.js has always refused, now for every column at once. So EVERY
       draw ahead is run here in a sandbox and fails on: a fetch, an XHR, `send_` or `sendBeacon`; a media
       source (a `src` on a video, audio, source or iframe) or `play()`; an `AudioContext` or speech; the
       camera; any `setInterval`; a `setTimeout` or animation frame it set (or one of those set) still
       pending 400ms after the draw; and a write anywhere outside its own slot (any copy of it).
     · `pure: true` MEANS THE DRAWING READS NO FACTS — so it is carried through a paint and kept across a
       landing (`widgetsHeld_`, `widgetsReveil_`), and a wrong one is a drawing from old facts left on
       the glass. So each widget is drawn, with `Math.random` and `Date` held still, under five
       scenarios — signed out; a student; another student over a payload with every list changed; an
       admin; another admin over the changed payload — and its slot must come out byte-identical in
       every scenario it is drawn in IF AND ONLY IF it says `pure`. A widget drawn in fewer than two
       scenarios that differ in both person and facts cannot be proved pure, and may not say so.
   A STOP WITH NO DRAW is refused before any of it: the builder would have nothing safe to draw it by. */
```

### THE CHANGED PAYLOAD:

in `drawAheadRuntime_`

```
/* THE CHANGED PAYLOAD: every list in it different — each row's words altered, its numbers moved, its dates
     three days later, and one row more — and the settings and switches beside them moved too. A drawing
     that reads any of it differs. The few keys that say what the payload IS rather than what it holds
     (its version, which features are on, which columns exist) are left, or the app would be a different
     app rather than the same one over different facts. */
```

### WHO, OVER WHICH FACTS.

in `drawAheadRuntime_`

```
/* WHO, OVER WHICH FACTS. The tutor is the fixture's own (P002, with a row and hours of her own), so a
     widget that reads the person's row reads one; the same basket is on the device in every scenario, so
     the basket draws its prices — which come from the facts. */
```

### WITH A WEEK OF HER OWN:

in `SCEN`

```
/* WITH A WEEK OF HER OWN: a drawing that reads the person (the timetable's `USER.timetable`) differs
       between two people here, so `pure` can only be said of one that reads nobody. Without it every
       scenario's person had an empty week and the timetable passed as pure (review, 12 Oct). */
```

### PURE, IF AND ONLY IF THE SAME IN EVERY SCENARIO — and drawn under two people and two sets of facts.

in `drawAheadRuntime_`

```
/* PURE, IF AND ONLY IF THE SAME IN EVERY SCENARIO — and drawn under two people and two sets of facts. A
     widget that reads facts these scenarios do not reach is listed in `ACCEPTED_IMPURE` with what it reads:
     the same arrangement as `ACCEPTED` in check-payload.js, so a new one fails loudly instead of joining it. */
```

### ONE DRAW, WATCHED. The slot goes back to what `widgetOnColumn_` writes, the clocks and the dice are held still, `$` is told which copy

in `drawAheadRuntime_`

```
/* ONE DRAW, WATCHED. The slot goes back to what `widgetOnColumn_` writes, the clocks and the dice are held
     still, `$` is told which copy (`WIDGET_HOME`, as the builder does), and everything the draw — or a timer
     or frame it set — asks for is written down. Then 400ms for anything it left pending. */
```

