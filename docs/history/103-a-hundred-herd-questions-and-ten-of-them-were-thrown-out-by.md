## A hundred herd questions, and ten of them were thrown out by a reviewer told to refute

**The decks were written by one agent each and then attacked by another**, whose instructions said
a clean report over a deck with a bad card in it is worse than no review. It earned it: **24 of the
290 cards were faulted**, and every one of the faults is a rule this file already states in another
context.

| | |
|---|---|
| `Name a colour.` · `Name a shape.` | **nothing to decide.** Blue, and circle-or-square. A herd question with one dominant answer is not a question, because there is no herd to match |
| `Name something you would find in a library.` | exactly one answer — books |
| `Name a reason a train is late.` | rewards knowing rather than guessing, and splits the adult in the room from the child |
| `Name a school trip everybody goes on.` · `Name a pudding they serve at school.` | **the rule about never asking a child what their family has**, in a costume. A trip costs money and "everybody goes on" is false out loud in front of a parent |
| `trying to do a handstand against a wall` | **charades is MIMED, so the mime of a handstand IS a handstand** — in somebody else's front room, beside the furniture. The sharpest finding in the set |
| five quiz shows | a desk and a buzzer mime as nothing |
| `The Snowman` | a Christmas card dealt in June, and a 26-minute television animation filed under Film |

**Four were near-duplicates of a card three places above them** — `a ventriloquist` beside `a
puppeteer` ("puppet" is the first clue either describer says, so the team shouts the other card),
`cartwheeling` beside `somersaulting`, `Name a musical instrument` beside `Name an instrument that
is loud to practise`.

### The one it found that nothing else could have

**`Countdown` was in the charades TV deck and `a countdown` is in Articulate's Random.** The two
games are **pages of the same column**, so the same word could be dealt twice in one sitting — once
to describe and once to mime — and the second time the room already knows the answer. The reviewer
flagged it as pre-existing and supplied no replacement, which is the right call for a judgement.

**It is a rule now rather than a repair**, which is this file's own sentence about `cost: 0` for the
twelfth time: `check-widgets.js` reads both decks out of `games.js` and fails on a word in both,
comparing with a leading article stripped because `a countdown` and `Countdown` are the same word to
a room and different strings to a checker — the `spellKey_` argument one file along. **A deck it
cannot read is a failure too**, not a pass, because *"I did not manage to look"* printed as *"I
looked and it was fine"* is this repository's oldest fault. **Proved by mutation**: put `Countdown`
back and it names both sides and exits 1.

**And a double comma made an array hole.** The splice left `'…breaks.',,` — which is an elision, so
`HERD_BUILTIN.length` was **101 with a `null` at index 20**, and the deck would have dealt a blank
card roughly once a hundred taps. Caught by counting the deck in a real JS engine rather than by
reading the diff; `100 / 180 / 150, unique, no holes` is the check that found it.
