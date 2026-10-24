# 429 — chess moves like a board

The owner, in a workshop note: *"In chess can you make it more cinematic."* Chess (190) had been a grid of 64 buttons
redrawn on every tap: a piece vanished from one square and appeared on another, a capture was a glyph replaced, and
checkmate was a sentence above the board. The rules, the move generator and `check-chess.js` are untouched; this is
all drawing (`drawChess` and its helpers in js/games.js, the `.chess` block in style.css).

## What happens now

- **A move glides.** The glyph is its own box now (`<span class="pc">` inside the square's `<button>`), so after the
  redraw the piece on the landing square is animated from where the old square was (`chessShow_`, a FLIP with the
  Web Animations API): lifted to 1.14× in the middle of the journey and set down, 170 ms plus 32 ms a square, never
  more than 380 ms. The landing square is lifted above the others for the flight (`.sq.mv`). Castling glides the rook
  too (`CH_ROOK`).
- **A capture lands.** The taken piece is drawn again as a ghost under the arriving one, holds its square until the
  taker arrives, then shrinks and turns away as it fades; the board jolts once by 3px.
- **Undo goes back the way it came**: the history entry keeps what the move did (`fx`), so the piece glides back and a
  taken piece fades up where it stood.
- **Check** — the king flinches as the threat lands and a red ring goes out from it three times (`.chk.is-new`), then
  the red under it stays as it always did. Only on the draw after the move: picking a piece does not start it again.
- **Checkmate** — the board darkens, the beaten king rocks back and falls over (and lies above the dark), and
  CHECKMATE comes up out of it in gold, in about 1.8 s. Stalemate and the two draws darken and say so in the ink colour,
  with no fall. The status line above still says who won, for a screen reader (`aria-live`).
- **The last move**: both squares as before, the landing one a shade stronger, so the eye reads which way it went.
- **Light**: one radial layer over the board (`.chess::after`), a warm pool in the middle and the corners in shade, and
  every piece casts a small shadow (a fifth `text-shadow`). Centred, so it reads the same whichever way the board faces.
- **Sound**: a soft knock for a move, a deeper one for a capture, two rising notes for check, three falling for mate —
  quiet, through the marking sounds' own context (`markHear_`, submit.js), woken by the tap and put to rest after
  (`markRest_`), timed to the landing rather than the tap. No switch, as the marking sounds have none (374).
- **The board can turn.** A new tile (`chess-turn`, the up-and-down arrows) is a switch: on, the board turns to face
  whoever is to move — after the piece has landed, never under it — and every piece turns back the other way as it
  goes, so none is ever upside down (`.chess.is-flipped` rotates 180°, `.pc` −180°, both transitions of `rotate`).
  A square turned 45° is wider than its card, so the board draws back as it goes round by exactly
  1 / (|cos θ| + |sin θ|) (`CHESS_TURN_KEYS`), and no corner covers the words or leaves a 390px screen. Off (the
  default), White stays at the foot as it always has. Kept per device (`chess-turns` in localStorage, a convenience).
  A finished game stays as it ended.

## The row under the board is tiles

Undo and New game were `btn quiet` buttons; the board is a thing, so its row is tiles (house style): Undo (`undo`),
Turn the board (`turn`, new) and New game (`again`, new — one arrow coming round). They are drawn by `chessTiles_`
the first time `drawChess` runs, because tiles.js loads after map.js and the widget's markup cannot call `tile_`; after
that `tileSet_` keeps their state. New game's "tap again" warning moved from the button's word (which a tile does not
have) to the line above the board, and the tile lights while it is armed.

## Performance and reduced motion

Everything that moves is `transform` or `opacity` (glide, ghost, jolt, ring, fall, word, turn), so a phone composites it.
The one exception is the board's drop shadow on the Games card, which eases from below to "below when upside down"
during a turn (one 0.7 s repaint of one box, only when the board turns). With `prefers-reduced-motion: reduce` nothing
glides, shakes or falls (`chessMotion_`, and the stylesheet drops the transitions): the move is instant, the board turns
at once, and the ending is drawn as it ends. The ending is the board's own layers (`data-end` on `::before`, the dark on
`::after`) and not a child element, because every child of a board must be a square (check/ui.js `BOARDS`).

## Checked

Frames at 390×844 (2×): a glide at 0/90/180/330 ms, a capture at 0–460 ms, mate at 0–2200 ms and at rest, check, the
turn at 0/200/350/500/700 ms, castling, undoing a capture, promotion, New game armed, and the same journey under
reduced motion. `node js/check.js`, `node js/check-all.js --fast`, the four parts of `check-flow.js`.
`--css-version` is `2026-10-24-h-chess-cinematic`.
