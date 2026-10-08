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
  whole table. A card stays silent until **Listen** is pressed, and then the phone says the word
  quietly (volume 0.6) to the person holding it, for example "Pizza.". For the imposter it says
  "You’re the imposter. The hint is food." It can be pressed again to repeat.
- **What everybody may hear is said by itself**, only on the press that brings that screen up:
  - pass: "Player 2. Hold the phone to your ear, then press Show."
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
- **`check-doors.js` cannot pair a `data-do` built from a variable.** A helper that built the three
  gold buttons from their action names left Show, Hide and Reveal reported as "a handler with no
  door". Each button now has its `data-do` written out in the markup.
- **`.imp-pass` stays in the stylesheet.** Imposter no longer uses it, but the timed games' paused
  card (`partyHeld_`) and 20 Questions' hand-over still do.
