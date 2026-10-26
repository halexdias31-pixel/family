# 461 — One padlock for every game; the console's full screen gone; fewer, bigger game widgets

## What the owner said

- *"Universalise the padlock for all games widgets in the games column. Also the padlock on the console widget seems to not really work. Also remove the full screen feature on console."*
- *"merge maze into connect 4 board games"*
- *"merge chess to connect 4 widget too"*
- *"times table sprint should be merged to word games"*

## Why the console's padlock did not hold

457 gave the padlock its own state (`PADLOCK`) so a touch no longer cleared it, and in a phone-sized
Playwright chromium with real CDP touches (lock, D-pad drag, swipes across and outside the card, two
fingers, a 40 ms flick, wheel, arrow keys) the column itself never turned. The page under it did:

- **The pager's own fallback scrolled the page.** When `axisFree` refused a locked drag, `pointermove`
  went on to `scrollHost_` and scrolled the column's `.pane` by script (`SWIPE.scroll`). A
  `preventDefault` on `touchmove` cannot stop a scroll the app performs itself, so a vertical swipe
  carried the console off the screen at 320 × 568 (`pane` 263 → 0).
- **The page-hold listener only looked inside `#nes-box`.** A wheel or a touch on the card's heading,
  picker or tiles scrolled the pane natively (`pane` 0 → 263).
- **Flabby Pird and the racer had no padlock at all**: the tile lived in the game-file body only.

## What changed

- `gameLockTile_(id)` (overworld.js), drawn by `widgetOnColumn_` (arcade.js) beside the star on every
  `kind: 'game'` widget, so a new game gets it with no code of its own. `PADLOCK.game` is
  `'id@column:page'`; `PADLOCK.nes` and the console's `nes-lock` tile, `nesLock_`, `nesHoldPage_` and
  `.nes-locked` are gone.
- Locked is absolute: the pager drops the drag before any axis or scroll decision; `pageHold_` adds
  non-passive `touchmove` and `wheel` listeners and an arrow/Page/Home/End/Space `keydown` listener on
  the window, and marks `<html class="padlocked">` (`touch-action: none`, `overscroll-behavior: none`).
- Shown: the tile is `on` and pressed, and the card is ringed in gold (`.is-widget.is-locked`).
- Let go by `gameLockStray_` (from `placeCells`: a tab, a link, another page) and by the app hidden.
- The console's full screen is gone: the tile, `nesFullOn_`/`nesFullOff_`/`nesFit_`, the exit
  button, the fullscreenchange/Escape listeners, every `.nes-full`/`.nes-exit` rule, and the
  `position: fixed` allowances in check-surfaces and check/ui.js. Video full screen is untouched.
- Board games now holds Connect 4, Othello, Scrabble, **Chess and Maze** (`BOARD_GAMES`); Word games
  holds the **Times Tables Sprint** (`WORD_GAMES`, `tt`) and is headed **Word & number games**: short,
  and it says what the sprint is doing there. Chess keeps its look, its Undo/turn/New game tiles and its
  game in memory (`CHESS`), the maze its walk (`maze`), the sprint `saveTtHighscore` and its board.
  Old stars move with `FAV_MERGED` (`w:chess`, `w:maze` → Board games; `w:tables` → Word & number games).

## Checks

check-flow: *every game widget has the one padlock* (one tile per game widget; locked on the console,
Board games and Word games, no drag, flick, two-finger swipe, touchmove, wheel or arrow key moves the
column or the page; another page, a tab and a hidden app let go) and *chess and the maze are board games
and the times tables sprint a word & number game*; the maze, board games and word games journeys follow
the merge. check/states.js reaches the sprint's high scores through Word & number games.
