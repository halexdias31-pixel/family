## Sentence Scramble and Word Search, and both are taps rather than drags

**Asked for as "Sentence Scramble - Groups race to arrange cut-up paper words into a grammatically
correct sentence" and "He also used to like mazes and word searches".** Two games on the Games
column, after the maze: `wordsearch` and `scramble` in `WIDGETS` (map.js), engines in games.js
beside the maze. Both keep their state through a repaint (Scrabble's rule, not the maze's), so a
payload landing does not deal again; New puzzle and Skip / Next sentence are what do.

**The scramble's chips are the words as printed**, capital and full stop included, because a strip
of cut paper keeps its punctuation, and those are the clues a child uses first. One pool of 44px
chips that never moves; a used chip stays where it was, dimmed, and tapping it again takes the word
back, so nothing reflows under the finger. The sentence being built is written out above. Check is
pressable only when every word is placed, and a wrong answer says how many words from the start are
right. A level select (KS2, KS3, KS4). No timer and no score: "groups race" is the people's race.

**`SS_SENTENCES` is 173 sentences, and the rule for them is the part to copy.** A sentence that two
noun phrases can swap and still make sense ("The teacher thanked the student"), a floating adverb, an
adjective that fits either noun, or two names in symmetric roles has a second right answer that a
child would be told is wrong. Each was rewritten or listed with its alternatives: an entry that is an
array is the sentence and its other valid orders, and `ssRight_` accepts any of them. A grammatical
nonsense order is marked wrong on purpose.

**A review sentence by sentence found seven more with a second sensible order**, and none was
caught by the builder's pass: `light, carbon dioxide and water`, `regularly revise`, `therefore
further research`, `the second poem … the first`, `dark and light`, `planted in the forest`, and the
baby and the puppy swapping. Each is listed with its alternative now, so ten entries carry one. The
full stop and the capital pin the two ends of most sentences, which is why the rest survive; what
gets through is two lower-case noun phrases or a floating adverb in the middle. No rule can see
"sensible", so this stays a reading job, and `check-flow.js` builds every stated alternative.

**The word search is two taps, the first letter and the last, and the maze is why.** A drag across
the grid would fight the pager for the gesture the app navigates by, and the only fix for that is
`data-noswipe` over most of the card, which makes a card you cannot swipe off. A tap is a click, and
`PRESS_MOVED` already swallows the click a swipe makes, so a swipe starting on the grid still turns
the page. `check/press.js` now swipes with real touch events from `.ws` and `.ss-chips` to prove it.
A cell cannot be 44px (measured at 320x568, ten across is 20px and eight 25px; at 390, 25 and 32); `ACCEPTED_TAP` in check/ui.js carries the
numbers, and a wrong tap costs nothing.

**Each theme says its own size and direction rule.** Younger themes read forwards only (right, down
and down-right): Years 3–4 spellings, animals and KS2 science on 8x8 with six words, and Years 5–6
spellings on 10x10 with seven because the words are long. Older themes (KS3–4 science, maths,
geography) are 10x10 with eight words in any of eight directions. The spelling lists are the
national curriculum's statutory words, cut to what fits. A word inside another already placed
("angle" in "triangle") is skipped. The select names say the year first (`Years 3–4 spellings`),
because at 320px the end of the label is cut off, and `Spellings, Years 3…` could not tell the two
spelling lists apart.

**The first version dealt the LONGEST six of eighteen random words, and a younger grid was six whole
rows.** `wsBuild_` sorted three puzzles' worth by length and placed from the top, so a Years 3–4 8x8
was six eight-letter words, one per row, with two rows of filler: a list of rows rather than a
puzzle, found on a screenshot. The deal is now the first `n` of a shuffle (placed longest-first, the
rest kept as spares), and at most one word may run the whole width of a grid. `check-flow.js` fails
on a second; proved by mutation (2 to 4 per grid without the limit).

**The filler is checked for rude words in all eight directions, and the arithmetic is why.** A given
three-letter word turns up by chance in about one ten-by-ten grid in twenty. `WS_NOT` is a copy of
`HANDLE_BLOCKED` from backend/constants.gs, because the backend list never reaches the phone, and
`check-widgets.js` fails if the two differ. It caught `raccoon` on its first run.

**Checked.** `check-widgets.js` reads both lists: at least 150 sentences and 40 a band, each starts
with a capital and ends with `. ! ?`, 4 to 14 words, no repeats, and every alternative uses the same
words as its sentence; every theme word fits its grid, each theme has three puzzles' worth, and no
theme word contains a filtered word. `check-flow.js` builds every stated alternative through the
real handlers, plays one sentence right and one wrong, builds fifteen puzzles of every theme and
reads each word back off its cells, and plays a puzzle by taps in both directions. Proved by
mutation: alternatives refused, the filter removed, a younger theme going backwards, and a reversed
tap refused all fail. Two states in check/states.js: a word search part-found and the longest
sentence half built.

**`check/press.js` and `check/cards.js` read `PRESS_PORT` and `CARDS_PORT`** now, as ui.js and
cascade.js already did, so two checkouts on one machine can run them at once.

**And that swipe pass had been skipping most pages since it was written.** It turned a column's
page with `goPage` alone, but the sideways swipe before it had already moved the app to the next
column. So after a column's first sideways swipe, every later page was measured off-screen to the
left, filtered out, and never swiped from. The scramble's chips, eleven pages into Games, were how
this was found. It calls `go` as well now, and the pass went from 62 swipes to 72, all landing.

**The full `check/ui.js` run is clean**: 316 combinations, nothing new. One earlier run, made under
heavy load, reported `PANE OFF THE SCREEN` by 10px on `stuff · a quiz@768`; it did not recur, and
that screen is not one either game touches.
