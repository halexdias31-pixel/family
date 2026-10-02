## Five classroom games, and a clock that knows a repaint from a column being left

**Asked for as a list in the owner's own words**: Just a Minute, Taboo, Hot Seat, 20 Questions and
Alibi. Five Games widgets in `js/map.js`, one section of `js/games.js` under the note over `PARTY`.

| | what is on the card |
|---|---|
| **Just a Minute** | a random topic, 60 seconds, and three tallies — Hesitation, Repetition, Deviation |
| **Taboo** | the word and the five you may not say, 60 seconds, Correct / Pass, a count |
| **Hot Seat** | a cover card first ("hold the phone up so only the class can see it"), then the word large, 60 seconds, Got it / Pass |
| **20 Questions** | dealt like Imposter's card — hand the phone over, Show me, Hide it — then "It's a person / place / thing", n of 20, Yes, No and Reveal |
| **Alibi** | the case (what happened, when, where the two say they were) with **no questions on it**, because the suspects take it out of the room; then each suspect on their own two-minute clock with the same six questions; then the verdict |

**NOT `ROUND_GAMES`, BECAUSE `initRound` THROWS THE ROUND AWAY ON EVERY START** — `roundAt[k] = null`
— and a widget starts on every `repaint`. These five were asked to survive one. Changing that under
Articulate and Charades was not asked for, so the clock is written once more for five.

**THE CLOCK IS A DEADLINE.** A running round holds `ends`, a held one holds `left`; `toolsStart_`
clears and restarts every widget on every repaint, and a `left--` interval would lose up to a second
each time. The tick writes the clock text and nothing else, so the buttons are never rebuilt under a
finger.

**`stop` IS CALLED TWICE OVER AND MEANS TWO THINGS.** `toolsStart_` calls `toolsStop_` before every
start, so a repaint is a stop and a start a moment apart; leaving the column is a stop on its own.
`partyHere_(k)` tells them apart by asking whether this game's own card is on the screen in front
(`#s-<AT> #<k>-card`): a repaint carries straight on, and a column left behind is paused until somebody presses Resume, with nothing secret on the paused
card. Hot Seat's paused card is its cover card, because it is the same moment; 20 Questions has no
clock and hides its secret instead, which is Imposter's rule.

**Decks**: 170 topics, 132 Taboo cards, 141 Hot Seat words, 132 secrets, and for Alibi 121 crimes,
24 times, 46 places and 122 questions. Child-safe, and the 20 Questions people are from history and
books rather than the news. `check-widgets.js` now compares every pair of the six word decks on this
column (these four and Articulate's and Charades'), refuses a repeat inside any deck including
Alibi's, holds a 120 floor on what each round is about, and checks every Taboo card is a word and
four or five forbidden words that are not itself. Imposter is still left out, for the reason over
`IMP_DECK`. **Proved by mutation**: `a countdown` in Hot Seat, `Hats` in Hot Seat and a three-word
Taboo card are all named and the run fails.

**Five `check-flow.js` journeys' worth of mutants, all named**: a stop that always pauses (the repaint
assertions fire), a stop that never pauses (the leaving assertions fire), Hot Seat starting its clock
before the word is shown, 20 Questions keeping its secret up when the column goes, Alibi reshuffling
questions for the second suspect, and a tally that counts nothing.

**Six `check/states.js` states**, each entered through the app's own handlers and then given the
LONGEST entry its deck holds — a random deal measures a different card every run. The Alibi
interview is drawn at 94% / 87% at 320x568 by `paneReach_`; nothing else is smaller than it ships.

**`check/press.js` reads `PRESS_PORT`** like `check/ui.js` and `check/cascade.js` already do.

### The review found the column next door, and thirty-odd words the rule could not see

**`partyHere_` FIRST SAID THE WHOLE SAVED COLUMN WAS "HERE".** Saved holds starred games, so for a
starred game that is right — and for every other game it meant a Taboo minute started on Games and
swiped one column over to Saved went on running on a card that was on no screen, and ran out there:
the fault the pause exists for, on the column beside it. It asks the DOM now, and a sixth journey
(*a round left for the Saved column, where it is not starred, pauses like any other leave*) fails on
the old test.

**THE CROSS-DECK RULE COMPARED SPELLINGS, so a plural walked straight through it.** `Penguins` on Just
a Minute beside `a penguin` on Charades, `Dinosaurs` beside Taboo's `dinosaur`, `Socks` beside 20
Questions' `a sock` — 45 pairs, two of them already in the column before this (`a witch` against
`The Witches`, `a neighbour` against `Neighbours`). The key now folds each word's plural ending and a
final e, which errs towards calling two words one, because a false alarm costs choosing another card.
Forty-three topics, two Articulate entries and their replacements' own collisions were changed until
it passes. **Proved by mutation**: `Penguins` put back is named against `a penguin`.

**What the rule deliberately does not catch is one card inside another** — `guitar` in `playing the
guitar` — because asked as a rule it would also refuse `kettle` for being in a nursery rhyme, which
the original two decks are full of. So the four new guessed and dealt decks were swept by hand with a
throwaway containment script: twelve Taboo cards, twenty-one 20 Questions secrets and seven Hot Seat
words were replaced where they were the same object as another card (`jigsaw` and `jigsaw puzzle`,
`Peter Rabbit` and `The Tale of Peter Rabbit`, `a light bulb` and `changing a light bulb`). Among the
three new guessed decks themselves the sweep reports **0**. Against Articulate and Charades a residue
remains that is a title or a different sense (`a king` in `King Arthur`, `tennis` in `a tennis ball`),
and that is a judgement left visible here rather than a rule.
