# js/check-chess.js

The full text of comments in `js/check-chess.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-chess.js — THE MOVE GENERATOR, COUNTED RATHER THAN READ.

top level, before `fs`

```
/* ==================================================================================================
   node js/check-chess.js — THE MOVE GENERATOR, COUNTED RATHER THAN READ.

   The board is two players round one phone now, so the only thing standing between a child and a
   wrong move is `legalMoves` in chess.js. A move generator is the textbook case of code that reads
   correctly and is wrong: a king that can castle through check, an en-passant capture that leaves
   the pawn behind, a promotion that forgets the capture. PERFT is the standard answer — count every
   leaf of the game tree to a fixed depth and compare against numbers the whole chess-programming
   world agrees on. One wrong rule anywhere changes a count.

   NOT A SECOND IMPLEMENTATION. The engine is cut out of `price-rows.js` (the board helpers) and
   `chess.js` (the rules) by marker and run as-is, so what is counted is the code that ships.
================================================================================================== */
```

