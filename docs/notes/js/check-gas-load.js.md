# js/check-gas-load.js

The full text of comments in `js/check-gas-load.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-gas-load.js THE WHOLE BACKEND IN ONE vm SCOPE, OVER AN IN-MEMORY LEDGER, FOR WHATEVER WANTS TO ASK IT.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-gas-load.js

   THE WHOLE BACKEND IN ONE vm SCOPE, OVER AN IN-MEMORY LEDGER, FOR WHATEVER WANTS TO ASK IT.

   LIFTED OUT OF `check-profile.js`, WHICH WROTE IT, the day a second check needed it.
   `check-aimark.js` asks the real `doPost` what "Mark with AI" answers with no key, over the cap,
   and when Gemini sends back seven marks out of three — the same `doPost`, the same gate, the same
   token. A second copy of this harness would be the second reader this repository keeps recording
   under `documents_()`, `paperIdOf_` and `childrenOf`, and it would drift on the first Apps Script
   service somebody stubs in one and not the other. `check-marks-load.js` is the same move for the
   marking functions.

   `backend(extra)` — `extra` is merged over the default services before the scope is built, so a
   check can hand in its own `UrlFetchApp` (Gemini) without the default one learning about it. The
   default refuses the network outright: a check that reached the internet would be a check that
   passes or fails with somebody else's server.
================================================================================================== */
```

### ---------- WHAT A REAL SHEET DOES TO A STRING, INCLUDING THE 0 IT DROPS

top level, before `coerce`

```
/* ---------- WHAT A REAL SHEET DOES TO A STRING, INCLUDING THE 0 IT DROPS ----------------------------
   THIS KEPT A STRING OF DIGITS THAT STARTS WITH 0 AS A STRING, and a real sheet does not: `setValue`
   and a person typing both turn it into a number, so four noughts come back `0`. That one kindness
   was the whole reason no check here could see a child's PIN that started with 0 refused for ever —
   the harness was storing the PIN the sheet would have mangled. Every seeded PIN in these checks is
   the `0000` placeholder, so since this line every one of them arrives as the number 0, exactly as a
   PIN typed into the live sheet does, and signing in at all now proves `authPinLost_`. A leading
   apostrophe is still text — that is `cellSafe_`'s answer, and the sheet's. */
```

### ---------- A TAB HAS A GRID, AND `getRange` REFUSES ANYTHING PAST IT

in `backend`

```
/* ---------- A TAB HAS A GRID, AND `getRange` REFUSES ANYTHING PAST IT -------------------------------
     THESE TABS WERE EXACTLY AS WIDE AS WHATEVER HAD BEEN WRITTEN TO THEM, and `getRange` wrote anywhere
     it was pointed. A real tab is a grid of a fixed size: a new one is 1000 x 26, one imported from an
     xlsx is sized to its content, and Apps Script answers a range past the edge with "The coordinates of
     the range are outside the dimensions of the sheet". The live `people` was imported at exactly 61
     columns with not one spare, so `ensureSchema` threw on its first tab every time it had a column to
     add — and no check here could see it, because no tab here had an edge.

     `gridOf[name]` is the size a check gives a tab (`grid(name, { cols, rows })`); with none, the
     Sheets default. A grid is never smaller than what is in it — `appendRow` widens and lengthens a
     real tab too — so only a check that pins a tab to its content meets an edge, and that is exactly
     the tab the 4 Oct import made. `insertColumnsAfter` widens it, as the real one does. */
```

### A NEW TAB HAS NO ROWS, so `appendRow` lands on row 1.

in `book`

```
/* A NEW TAB HAS NO ROWS, so `appendRow` lands on row 1. It started as `[[]]` — one empty row — and
       the header `ensureSchema` appends to a tab it creates went to ROW 2, where `schemaGaps` (which
       reads row 1) could not find it: a tab created and reported as missing in the same breath. */
```

### A DAY ASKED FOR AS A DAY.

in `Utilities`

```
/* A DAY ASKED FOR AS A DAY. The whole ISO stamp for anything else, as before — but `aiMarkCount_`
         keys its tally on `yyyy-MM-dd`, and a stamp with milliseconds in it is a new day on every call,
         so the cap reset itself between presses and `check-aimark.js` caught 21 marks out of 20. */
```

