# 441 — One console for every game, and Word Search and Sentence Scramble in Word games

The owner: "Merge flabby pird into the games console player. Same with the Colliers Wood racecar game."
And, in the same batch: "Merge the sentence scramble and word search into one widget too."

## The Console

`flabby` and `racer` are no longer widgets. The `console` widget (map.js) has a getter `html` with a
`#cs-pick` select and `#cs-slot`, built the way Board games were in 414. `CONSOLE_GAMES` (games.js) holds
three choices, each with `start`, `still` (the drawn-ahead `draw`) and `stop`:

- **Game files** — the emulator as before (389, 391, 399, 419, 437): `nesPaint_` into `#nes-box`.
- **Flabby Pird** — `initFlappy` / `flappyStill_` unchanged (scores, Best, the board, tap and space bar),
  its canvas inside `.cs-body.cs-hand`, a handheld shell.
- **Colliers Wood racer** — `initRacer` / `raceStill_` / `racerStop_` unchanged (best lap, the admin's Build
  the map tile, keys), its `#race-box` inside `.cs-body.cs-wide`, a wide bezel.

The choice is kept on the device as `cs-game`. A pick stops all three (`consoleStop_`) and starts the
chosen one; leaving the column stops all three, so the off-screen pause holds for each game. The app-quiet
hold (419) keys on the `console` id, which is still the id.

## Word games

`wordsearch` and `scramble` are no longer widgets; they are the last two entries of `WORD_GAMES` (`ws`,
`ss`), their bodies moved unchanged. Word games now offers ten games.

## Stars

`FAV_MERGED` (find.js) moves a star on `w:flabby` / `w:racer` to `w:console` and on `w:wordsearch` /
`w:scramble` to `w:wordgames`, run on the device's copy at load and on every adopted payload. The game is
chosen (`cs-game` / `wg-game`) the first time only, flagged `merged:<old key>` on the device, so a later
pick stands even though the sheet still holds the old star.

## Two copies

A starred widget is drawn on Saved as well as Games, with the same ids, so `csPaint_` and `wgPaint_` now
paint every `#cs-slot` / `#wg-slot` and every picker: a pick on one copy was undone by the other.

## Checks

- check-flow: new journey *the console is one widget for every game (441)…*; the racer journeys open the
  Console and choose the racer; the Space/Flappy journey chooses Flabby Pird; the word games journey
  expects ten; the word search and scramble journeys preset `wg-game`.
- check/states.js, check/press.js, check/swipe.js: Flabby Pird, Word Search and Scramble states open the
  merged widget and choose the game.
- check-widgets: `initFlappy`, `initWordSearch`, `initScramble` in `ACCEPTED_ENGINE`, with reasons.
