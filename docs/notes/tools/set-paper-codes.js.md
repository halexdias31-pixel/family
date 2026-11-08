# tools/set-paper-codes.js

The full text of comments in `tools/set-paper-codes.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — tools/set-paper-codes.js THE CODE PRINTED BY THE BARCODE, AS ITS OWN CELL (owner 8 Nov 2026).

top level, before `fs`

```
/* @family. — tools/set-paper-codes.js  THE CODE PRINTED BY THE BARCODE, AS ITS OWN CELL (owner 8 Nov 2026).
   A past paper is named by its paper reference ("1MA1/3F", "9MA0/02", "8461/1H", "J560/01"), so Find's Paper facet and the
   card's paper pill read `paper_code`. Filled on every past/specimen cover of AQA, Edexcel and OCR from, in order: the
   row's own `spec_code` (normalised), its questions' ids (Q-1MA1-2406-3F-…), its source file name, and for Edexcel A-level
   Maths the paper number. A filled cell is never overwritten. `--check` changes nothing and exits 1 if a cell would change.
   STA tests carry no board paper reference, so they get none. Usage: node tools/set-paper-codes.js [--check] */
```

