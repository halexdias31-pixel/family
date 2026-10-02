## Seven word games are one widget with a dropdown

**Asked for as "Merge word games into one widget. Like articulate and charades".** Articulate,
Charades, Taboo, Hot Seat, Just a Minute, 20 Questions and Imposter were seven cards in a row on the
Games column. They are one `wordgames` widget now: a heading, a dropdown, and the chosen game under
it. **Alibi and Herd Mentality stay separate**: Alibi is an interview with a case file, and Herd is a
question everybody answers at once, so neither is a word to get across.

**None of the engines changed.** `WORD_GAMES` at the foot of games.js holds each game's body (its old
card minus the `.card` wrapper and heading) and its own start and stop. `ROUND_GAMES`, `PARTY` and
Imposter still draw into their own `<k>-card`, which is now inside `#wg-slot`. The choice is kept on
the device under `wg-game`.

**The widget's `html` is a getter, and the first version is why.** With an empty slot that `start`
filled afterwards, a repaint put down markup with no `#tab-card` in it. `partyHere_` then read the
repaint as the column being left and paused the round under the finger. `check-flow.js` named it at
once. The getter puts the chosen game's card into the markup `paint` writes.

**Switching game is a leave.** `wg-pick` empties the slot first, then runs every game's stop. The
old game's card is already out of the document, so its stop treats it as a column being left:
Articulate's clock stops, a party round pauses until Resume, and Imposter hides its word.

**Stars on the seven old widget ids no longer match anything**, so a game starred onto Saved before
this change is gone from there and has to be starred again as Word games.

**Checked.** The new journey `the word games are one widget, and switching game pauses the one left`
asks five things:
- none of the seven ids is still a widget of its own;
- the dropdown offers seven games;
- each choice draws only its own card;
- a Taboo round pauses when another game is chosen, and does not show its word when switched back;
- the choice is remembered.

It fires when the stop in `wg-pick` is removed. The party journeys and the lab states reach their
game through the widget's dropdown. `initRound` and `initImposter` are in `check-widgets.js`'s
`ACCEPTED_ENGINE` with the reason.
