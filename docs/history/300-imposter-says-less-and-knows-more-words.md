## Imposter says four words a screen, reads aloud for the ones who cannot read yet, and deals from 810 cards

The owner, 8 Oct, two notes about the same game:

- *"Can you make the imposter game more simple and intuitive while adding more categories and words.
  It’s info over load on the reading parts like reading theme and word extra"*
- *"For the imposter game can you have have it so young ones who can’t read can play. Like it will
  read it out for them."*

### Seven screens, and what each one says now

Every screen had a sentence on it, and every one was true. None of them was needed after the first
round. And on the card, a sentence somebody reads out to a child holding the phone is the secret said
out loud.

| Screen | Before | Now |
|---|---|---|
| The widget's one line | Three or more, one phone. Everybody knows the word but one of you. | Everyone gets the word but one. Find the imposter. |
| Setup | Players, − n +, Deal; under the card: "Everybody sees the word but one. Pass the phone round." | small **Players**, − n +, the **Read aloud** switch (only where the browser has a voice), **Deal** |
| Pass the phone | PLAYER 2 OF 4 / Hand the phone to **Player 2** / Show me; under it: "Nobody else looks." | small **Pass to**, big **Player 2**, **Show** (open eye) |
| A player's card | the category / the word / Hide — pass it on | big **the word**, **Hide** (shut eye); **Listen** (speaker) with Read aloud on. No category. |
| The imposter's card | the category / You’re the imposter / Nobody else knows. Blend in. / Hide | big **Imposter**, small **Hint: Food**, **Hide**; **Listen** with Read aloud on |
| Play | the category / **Player 3** goes first. One word each, round the circle — then vote. / Reveal; under it: "Caught? The imposter still wins by guessing the word." | small **Food**, big **Player 3 starts**, **Reveal** |
| Reveal | The imposter was / Player 2 / and the word was / pizza | small **Imposter**, big **Player 2**; small **Word**, big **pizza**; **Play again**, **Players** |

The note line under the card (`#imp-said`) is gone: nothing writes to it any more.

**The category went from a player's card.** That was the "reading theme and word" half of the note.
Somebody told "pizza" does not need telling it is a food. The category is now the imposter's hint and
nobody else's, and the whole table sees it on the play screen once everybody has looked.

### The big line and the button do not move

The phone goes to children who cannot read the button, so "the gold one under the big word" has to
be in the same place every time. Pass, card, imposter and play are all drawn by `impFrame_` in the
same slots: small line, big line, small line, button, and with Read aloud on, room for the speaker.
An empty slot is drawn empty, not left out. The big line keeps room for two lines
(`.imp-big { min-height: 2.3em }`), so "noughts and crosses", which wraps at 320px, and "pizza" put
the button in the same place.

**The first version got this wrong, and only the screenshots showed it.** It hung the card from its
top, so Listen under the button pushed nothing up inside the card. But the column centres the whole
widget in the pane. A card 72px taller is centred 36px higher, so Hide sat 36px above where Show had
been, at both 320 and 390. The fix keeps the card the same **height**: with Read aloud on, the pass
and play screens keep an empty 64px `.imp-foot` where Listen goes on a card.

Measured afterwards in Chromium, with the top and height of the big line and the button in viewport
pixels, for pass, a player's card (two-line word), the imposter's card, play, and a player's card
(one-line word):

| | big line | button |
|---|---|---|
| 320x568, Read aloud on | 249/52 on all five | 324/52 on all five |
| 320x568, Read aloud off | 285/52 | 359/52 |
| 390x844, Read aloud on | 384/63 | 472/52 |
| 390x844, Read aloud off | 420/63 | 508/52 |

After the review (below) moved Listen 20px further from Hide, the tops on all five screens are: at
320, 239.1 / 313.5 with Read aloud on and 284.6 / 359 with it off; at 390, 373.9 / 461.9 on and
419.9 / 507.9 off. That table is now a check rather than a note: see "the big line and the button
stay put" in the review section at the end.

Show, Hide and Listen carry the app's own marks from `TILE_ICONS`: `show` (open eye), `hide` (shut
eye) and a new `speak` (a speaker cone and two arcs). A child knows each by its picture as well as by
its place. Deal, Reveal and Play again keep only their words; an adult presses those.

### Read aloud

- **The browser's own voice** (`speechSynthesis`). No network, no key, nothing to install. It asks
  for a British voice (`lang = 'en-GB'`, plus the en-GB voice object when the list has loaded; Chrome
  returns no voices on its first call) at rate 0.9.
- **One switch** on the setup screen, off by default, remembered on the device as `imp-aloud` (in a
  try, like `imp-n`). It is a button with the speaker mark, the words and a knob, because it sits in
  a form and the adult setting up is the one person who reads it.
- **Where there is no voice, none of it is drawn**: no switch and no Listen, even if `imp-aloud` was
  remembered on. The game is then exactly the silent one.
- **The secret is never said by itself.** Saying the word aloud as the card came up would tell the
  whole table. A card stays silent until **Listen** is pressed, and then the phone says it quietly
  (volume 0.6) to the person holding it: "Your word is pizza. Your word is pizza.", and for the
  imposter "You’re the imposter. Your hint is food." It can be pressed again to repeat. (Until the
  review it was "Pizza." against "You’re the imposter. The hint is food."; see the end.)
- **What everybody may hear is said by itself**, only on the press that brings that screen up:
  - pass: "Player 2. Press Show, then the speaker, and hold the phone to your ear." (Until the
    review it was "Hold the phone to your ear, then press Show.")
  - play: "Food. Player 3 starts."
  - reveal: "The imposter was Player 2. The word was pizza."

  A browser lets a page speak in answer to a tap (Safari refuses a first `speak()` outside one).
  `impPaint` never speaks, so a repaint, a payload arriving or a swipe back to the column says nothing.
- **Hide, leaving the column, Play again and Players each call `speechSynthesis.cancel()` before
  anything else.** `speak()` adds to a queue; it does not replace what is playing. Without the cancel,
  a word still being spoken when the phone is handed on would finish in the next player's ear.

### The deck: 27 categories of 30

The deck went from 11 categories of 22 (242 cards) to 27 of 30 (810), using exactly the list
supplied.

- **Finer categories as well as more of them.** The category is the imposter's whole hint. "Animals"
  covering a shark, a bee and a hamster told them almost nothing; "Sea life" tells them enough.
- **Thirty in every category.** The pile is every (category, word) pair, so a category's share of the
  rounds is its share of the cards.

`check-widgets.js` now holds the shape: at least 25 categories, at least 30 words in each, no word
twice anywhere, and no word that contains its own category's name. When comparing words it ignores
case, apostrophes and hyphens, and drops a trailing s from each word. Run against the **old** deck, the
rule finds three faults that passed every check at the time:

- `hairdresser` (Jobs) and `hairdresser’s` (Places) were the same card.
- `school bus` and `school trip` were in School, so the hint handed the imposter half the answer.

The deck is still left out of the cross-game comparison, for the reason in the note over `IMP_DECK`.

### Checks

- **`check-flow.js`: the imposter journey, rewritten.** It reads each screen against the round that
  was actually dealt (`__t.IMP`) and checks:
  - exactly one imposter;
  - every other player is shown the dealt word and not the category;
  - the imposter gets the hint and never the word;
  - the pass screen names the player, carries nothing secret even in its markup, and is identical for
    every player apart from the number;
  - leaving the column hides a word that was left up;
  - the play screen shows the category and who starts, and not the word;
  - the reveal names the imposter and the word.
- **A word budget.** The pass, card, imposter and play screens may show at most 4 words, counted as
  runs of letters after taking out the dealt word and its category. The category is taken out because
  "Pets and farm animals" is the hint, not the app talking. A player's number is not counted.
- **`check-flow.js`: a read-aloud journey.** It stands in for `speechSynthesis` before the app loads,
  with a version that records each line spoken and each `cancel()`, and writes the journey's own
  presses into the same list. It checks:
  - with the switch off, nothing is said;
  - the switch is remembered and survives a repaint;
  - the pass sentence is the same for everybody, apart from the number, across two rounds;
  - the word is only ever said straight after a Listen pressed by a player who has the word;
  - the imposter's Listen says "imposter" and the hint, never the word;
  - Listen is quiet, slightly slower than normal speech, and asks for en-GB;
  - Hide, leaving the column, Play again and Players cancel first;
  - the play screen and the reveal speak, and a repaint does not;
  - with no `speechSynthesis`, neither the switch nor Listen is drawn.
- **`check/states.js`: six Imposter states on Games.** Setup with Read aloud on, pass, a player's card
  with Listen, the imposter's card, play, and reveal. Each puts the longest word and the longest
  category in the deck on screen, so `check/ui.js` measures them at every width.
- **`check/press.js`**: `imp-listen` is added to `ACCEPTED_QUIET` with its reason. It only makes a
  sound, which that harness cannot hear, and drawing anything would give the player away.

**Every rule was proved by a mutation** that turned it red, and the real files were green again
afterwards: 40 mutations in all (14 on the screens and the budget, 18 on reading aloud, 8 on the
deck).

### Also found

- **`check.js` cannot see a call made at load time to a function in a later file.** The first version
  built Show and Hide as top-level `const` strings that called `tileIcon_`. `tiles.js` loads after
  `games.js`, so in a browser that would have thrown, and `check.js` still reported "nothing is read
  before it exists". The buttons are now built by functions, so the call happens at paint time.
  The rule itself was left as it was here; the review fixed it (see the end).
- **`check-doors.js` cannot pair a `data-do` built from a variable.** A helper that built the three
  gold buttons from their action names left Show, Hide and Reveal reported as "a handler with no
  door". Each button now has its `data-do` written out in the markup.
- **`.imp-pass` stays in the stylesheet.** Imposter no longer uses it, but the timed games' paused
  card (`partyHeld_`) and 20 Questions' hand-over still do.

### After the review of 8 October

Ten findings. Each was checked before it was fixed; the measurements are from Chromium on the real
files.

- **A double tap went through two screens** (raised twice, as a blocker). Show, Hide and Reveal are
  drawn on the same pixels, so the second tap of a double tap landed on the button the first one
  drew. Reproduced with two touch taps 120ms apart at 390, and at 320 with taps 300 and 500ms apart:
  - double tap on Show: the card flashed, then Hide passed the turn on, unseen;
  - double tap on Hide: Player 2's card opened in Player 1's hands;
  - double tap on the last Hide: straight to Reveal, before anybody had played.

  Show, Hide and Reveal now ignore a press within 600ms of the card being drawn (`impTooSoon_`). It
  uses `performance.now()` on both sides, and only applies to a press that came with an event, so
  checks and states that call `ACTIONS` directly still walk a round in one tick. A CSS
  `pointer-events` fade-in was ruled out because `prefers-reduced-motion` cuts every animation to
  .01ms. Hide also does nothing now unless a card is up. The same double taps in Chromium afterwards
  are each one press, and a press 900ms later still goes through.
- **The pass line told a non-reader to do the wrong thing.** It said "Hold the phone to your ear,
  then press Show." But Show makes no sound, and the gold button left under the child's thumb is
  Hide. It now says "Press Show, then the speaker, and hold the phone to your ear." **Still to do:**
  nobody has heard it on the family's own phone at the table, to check that the word cannot be heard
  from the next seat. That test is needed before Read aloud is called finished.
- **Listen was 7.4px under Hide**, the card's `.5rem` gap, and Hide is the one press that cannot be
  taken back. Listen now has 20px above it, and so does the empty `.imp-foot`, so the card is still
  the same height on every screen. Measured afterwards: 27.4px from Hide's bottom to Listen's top at
  390, 26.8px at 320.
- **The table could hear who the imposter was.** "Pizza." takes about 0.6s and "You’re the imposter.
  The hint is food." about 3s. Every player in a round hears a line of the same length, so the odd
  one out was the answer. The lines are now the same shape: "Your word is pizza. Your word is
  pizza." and "You’re the imposter. Your hint is food." Counted in syllables over all 810 cards, the
  averages went from 2 against 11 to 10.6 against 10.6, and 72% of cards are within two syllables of
  each other. Saying the word twice also means the second one is heard at the ear. The review also
  offered starting the line 1.2–1.5s after the tap. **That was not done.** Safari only starts speech
  in answer to a tap until something has spoken, nothing here can test that on an iPhone, and a
  Listen that says nothing would be worse. It is the owner's call after a test on a real phone.
- **The imposter journey searched the raw markup**, so `cat` (Pets and farm animals) matched the
  `art-cat-of` class, and on correct code the journey failed eight ways about one deal in 810. It now
  reads what a person can see: the text, plus every `title`, `aria-label` and `alt`. Proved both
  ways. With `cat` on top of the pile, the old reader fails and the new one passes. With the word put
  in a `title` on the pass screen, the new one fails.
- **The word budget only counted `#imp-card`.** `#imp-said` with "Nobody else looks." in it passed
  every check. The budget now counts the whole game apart from its `.sub` line. The journey also
  requires `.sub` to be exactly "Everyone gets the word but one. Find the imposter.", with no
  `#imp-said` and no `.note`.
- **Nothing measured that the big line and the button stay put.** With `.imp-foot` hidden and the
  two-line floor taken off `.imp-big`, `check/ui.js` still reported nothing new. A new state, "the big
  line and the button stay put", walks a round through the handlers with Read aloud on and then off.
  On pass, the longest word, the next pass, the imposter's card with the longest category, and play,
  it reads the top of both, and requires them all to match within 0.5px.

  Each reading is taken two frames after its press, once the column is at rest, because the
  `ResizeObserver` (`holdColumn_`) re-centres a card that changed height after layout. A first
  version read everything in one tick and had Read aloud on and off at the same height, so it was
  blind to exactly the 36px it was written for. Proved against three mutations: the foot hidden, the
  floor taken off, and the 20px given to Listen but not to the foot.
- **"No word says its own category" only caught the whole category name.** 15 of the 27 categories
  are more than one word, and `kitchen sink`, `garden gnome` and `toy box` all passed. Now each
  content word of the category (not the, and, in, at, of) is held against each word of the card. On
  the real deck this flags only `sea urchin` in Sea life. It is let through in `CAT_WORD_OK` with a
  written reason that is printed on every run. An entry the deck no longer holds is an error.
- **`check.js` treated every function as safe to reach at load.** A function is hoisted only within
  its own script, so a top-level call into a later file throws. That line now skips a function only
  when its file loads earlier. The real files still report nothing. A top-level `tileIcon_('hide')`
  in games.js is now reported as `games.js reads tileIcon_ at load, but tiles.js declares it later`,
  whether it is a plain call, inside a template, or a bare reference.

Every new rule was turned red by a mutation, and the real files were green again afterwards: 5 on
the double tap, 2 on the voice, 2 on the budget and the line, 1 on what is visible, 3 on the deck,
3 on check.js and 3 on the stay-put state. The review's own mutation of the last one (`.imp-foot`
hidden and the floor taken off) now makes `node check/ui.js --screen=games` exit 1, with the state
reported unmeasured at every width for both visitors.
