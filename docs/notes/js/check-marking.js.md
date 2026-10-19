# js/check-marking.js

The full text of comments in `js/check-marking.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-marking.js DOES THE MARKER SAY YES TO A RIGHT ANSWER AND NO TO A WRONG ONE.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-marking.js

   DOES THE MARKER SAY YES TO A RIGHT ANSWER AND NO TO A WRONG ONE.

   WHY THIS EXISTS. `markAnswer_` is the one piece of this app that tells a child they are wrong,
   and there is nobody for them to appeal to. Everything else here measures whether the app WORKS;
   this measures whether it is FAIR, and the two failures are not symmetrical:

     a right answer marked wrong   a child stops trusting the marking, and then stops using it
     a wrong answer marked right   a child learns the wrong thing and finds out in an exam

   Both are real and the first is the one that happened. The library writes Q23(b) of the June 2024
   Foundation paper as `5&frasl;9`, which strips to `5⁄9` carrying U+2044 FRACTION SLASH -- a
   character no phone keyboard has. What a student types is `5/9`, and before the fold in
   `markNorm_` those were two different strings. Ninety-one rows in the library are spelled that
   way, and somebody was sitting one of those papers at the time.

   IT READS THE REAL FUNCTIONS, NOT A COPY. `find.js` is 350 KB and needs a browser, so the five
   marking functions are cut out of it by name and run on their own -- they touch nothing else in
   the app, which is what makes that safe and is also why they are worth checking in isolation. A
   second implementation here would be a second thing to keep in step, which is the fault this
   repository records under `childrenOf`, under `link`/`source_url` and under `kinds`.

   EVERY CASE IS A FAULT THAT HAPPENED OR ONE THAT NEARLY DID. The thousands-separator row is the
   first question of that same Foundation paper, whose scheme answer is "18 000" and which marked
   "18000" wrong. The `11/6` row is the reason spaces are NOT stripped wholesale: 1 1/6 and 11/6 are
   1.17 and 1.83, and folding them together would mark a wrong answer right to fix a right one.
================================================================================================== */
```

### CUT BY NAME, BRACE-COUNTED, AND THE CUTTER IS `check-marks-load.js` — one extractor, because other checks need the same functions to ask different questions of

top level, before `NAMES`

```
/* CUT BY NAME, BRACE-COUNTED, AND THE CUTTER IS `check-marks-load.js` — one extractor, because
   other checks need the same functions to ask different questions of them, and a second cutter
   written once already could not find `markBare_`. A regex for "the body of a
   function" is really a regex for "up to the next closing brace at the start of a line", which is
   a formatting convention rather than a fact about the code, and this file is checking the one
   thing in the app that must not be approximately right. */
```

### A UNIT IS NOT A LIST OF ALTERNATIVES.

in `CASES`

```
/* A UNIT IS NOT A LIST OF ALTERNATIVES. `set-accept.py` used to split an answer on `/`, so
     `12 km/h` became the two acceptable answers `12 km` and `h` — and the bare letter **h** was
     marked RIGHT. Found on Q14(a) of the June 2024 Foundation Paper 2. */
```

### A BAND THE SCHEME PRINTS TAKES EVERY NUMBER IN IT.

in `CASES`

```
/* A BAND THE SCHEME PRINTS TAKES EVERY NUMBER IN IT. Q13 of the May 2017 Foundation Paper 1 is
     `1.5 to 2 metres` and there is no single right answer to it — and before `markRange_` the
     BOTTOM of the band passed while the TOP failed, from the same cell, which is worse than
     failing both: it looks like marking. */
```

### ---------- A RATIO, WHICH NOTHING IN THIS LIBRARY COULD MARK UNTIL THE COLON FOLDED

in `CASES`

```
/* ---------- A RATIO, WHICH NOTHING IN THIS LIBRARY COULD MARK UNTIL THE COLON FOLDED ----------
     `markNorm_` took the spaces off either side of a fraction slash and left them round a colon,
     so `2:3` typed against the `2 : 3` a mark scheme prints came out FALSE. Measured across the
     whole library first: not one of its 1,435 `accept` cells held a colon, so no ratio answer
     anywhere could mark itself -- which is also what proves the fold cannot change an existing
     row. Q10 of the June 2024 Foundation paper is the first one that can. */
```

### ---------- AN ACCEPTED BAND WRITTEN WITH A DASH, WHICH NO CASE HERE HAD

in `CASES`

```
/* ---------- AN ACCEPTED BAND WRITTEN WITH A DASH, WHICH NO CASE HERE HAD -----------------------
     `markRange_` takes `to` and the two long dashes, and every case above uses the word -- so the
     dash half of that rule has never once been exercised. CLAUDE.md records the gap in as many
     words, and it is the shape an escape sweep has broken in this repository twice: a real en dash
     written into a regex through a layer that eats the backslash leaves `/(?:to|-|-)/`, which
     matches the word and no dash, and every case in this file goes on passing. */
```

### ---------- A SPACE ROUND AN OPERATOR, WHICH IS THE RATIO RULE ONE CLASS OF CHARACTER ALONG

in `CASES`

```
/* ---------- A SPACE ROUND AN OPERATOR, WHICH IS THE RATIO RULE ONE CLASS OF CHARACTER ALONG ----
     A MARK SCHEME PRINTS `4n \u2212 3` AND NOBODY TYPES THE SPACES. 178 of the library's 1,436
     `accept` cells carry one, and they are the algebra questions \u2014 so the nth-term answer every
     student actually writes was marked wrong on every one of them. */
```

### THE ONE THING THIS MUST NOT DO, and the fraction rule above names it:

in `CASES`

```
/* THE ONE THING THIS MUST NOT DO, and the fraction rule above names it: `1 1/6` is 1.17 and
     `11/6` is 1.83. The space in a mixed number touches no operator, so nothing here can reach it
     \u2014 and these two cases are what says so rather than a sentence claiming it. */
```

### ---------- A SIGN NO PHONE KEYBOARD HAS

in `CASES`

```
/* ---------- A SIGN NO PHONE KEYBOARD HAS ------------------------------------------------------
     `\u2264` IS ON ELEVEN `accept` CELLS AND THERE IS NO KEY FOR IT. Q28 of June 2024 Foundation is
     `x \u2264 \u22124`, so a student who had solved it could not enter the answer at all. */
```

### ---------- WHAT THE MATHS KEYPAD WRITES

in `CASES`

```
/* ---------- WHAT THE MATHS KEYPAD WRITES ------------------------------------------------------
     `keypad.js` builds every structure with a slot to type into — `()/()`, `^()`, `√()` — so the
     stacked preview has somewhere to put the caret. These are its own outputs, typed key by key,
     against the scheme as the library writes it. The bracket fold in `markNorm_` is what makes
     them right, and the `2(3)` row is what it must never do. */
```

### ---------- A ROOT UNDER THE LINE, OFF THE KEYPAD

in `CASES`

```
/* ---------- A ROOT UNDER THE LINE, OFF THE KEYPAD ----------------------------------------------
     sin 45° on the exact-trig sheet: the cell lists `1/√2` and the model answer prints it, and the
     keypad writes it `1/(√(2))` — the fraction key after the 1 opens `/()`, the root key opens
     `√()`. The two folds ran in one pass, the outer bracket was tried while the inner one was still
     on, and "Not yet" was the answer to a right one. */
```

### ---------- `root`, THE THIRD SPELLING OF √

in `CASES`

```
/* ---------- `root`, THE THIRD SPELLING OF √ --------------------------------------------------------
     The exact-trig cells listed `root3/2` beside `sqrt3/2`, so `root3/2` was right and `root 3/2`
     wrong, and the letters sent four surd questions to the keyboard, which has no √ key. */
```

### AND THE SAME CELL REFUSED ITS OWN ANSWER.

in `CASES`

```
/* AND THE SAME CELL REFUSED ITS OWN ANSWER. June 2023 Higher Q16 is `10 root 2 cm`, which the
     fold made `10 √2 cm` — and the space stayed, so the keypad's `10√(2)` matched nothing. A space
     between a number and the root or π it multiplies says nothing (`3 √6` and `3√6` sit side by side
     in one cell), so it folds; and a unit comes off a surd as it does off a number. */
```

### ---------- A UNIT GLUED TO A ROOT, OR TO A MULTIPLE OF π

in `CASES`

```
/* ---------- A UNIT GLUED TO A ROOT, OR TO A MULTIPLE OF π ---------------------------------------
     ROUND 1 TOOK `√3cm` OUT OF EXACT-TRIG Q17 so the row would get the keypad, and that made `√3cm`,
     `sqrt3cm` and the keypad's `√(3)cm` — right answers the cell had marked right — "Not yet". The
     marker took a unit off a bare NUMBER only (`MARK_UNIT` began `-?[\d.\/]+`), so a surd with a unit
     on it was never reduced, and `√3 cm` in the cell did not cover `√3cm` typed. The rule is fixed
     (`MARK_NUM`: a number may end in a root or in π) and the spelling stays out of the cell. */
```

### ---------- AND ONLY THE UNIT ITS CELL NAMES

in `CASES`

```
/* ---------- AND ONLY THE UNIT ITS CELL NAMES -----------------------------------------------------
     ROUND 2 TOOK A UNIT OFF A ROOT, AND THE BARE ROOT BESIDE IT LET ANY UNIT THROUGH. A bare way is
     where a plain number's unit is "the sentence", and round 2 handed that to every surd and π row
     with nobody having measured it there: `√3 m` was Correct on Q17, whose own cell says `√3 cm`;
     `√3²` (3), `2√3²` (12) and `√3x` passed on every surd; `15πcm³`, a volume, on an area. orig and
     round 1 refused every one. So a unit after a root or π now has to be one the cell names — on
     any of its ways, because `37.7 cm | 12π` is one circumference written twice. */
```

### ---------- `*` AND A LETTER `x` BETWEEN NUMBERS ARE `×`

in `CASES`

```
/* ---------- `*` AND A LETTER `x` BETWEEN NUMBERS ARE `×` ----------------------------------------
     Prime factorisation Q1 (88): the cell lists `2^3*11` and `2^3 x 11`, and refused every other
     spacing — `2^3 * 11`, `2 * 2 * 2 * 11`, `2^3 x11`, `2³ x 11` — on all eleven rows. */
```

### THE CELL IS WRITTEN WITH THE LETTER, because that is the hole.

in `CASES`

```
/* THE CELL IS WRITTEN WITH THE LETTER, because that is the hole. Round 1 wrote this case against
     `2 × 3 × 3 × 5` — the sign, which no rule ever read as a unit — so it was green against the
     find.js that had the hole, and guarded nothing. Two rules close it now and each is enough on
     its own: the fold makes the letter `×`, and `markBare_` never reads a lone `x` as a unit. So this
     goes red against the old find.js and with both rules gone; the fold alone is pinned by `2^3 x11`
     above and by NORMS below, and `markBare_` alone by `6` against `6w² − 10w` further down. */
```

### ---------- A UNIT WITH A CARET, AND THE POWER IS PART OF THE UNIT

in `CASES`

```
/* ---------- A UNIT WITH A CARET, AND THE POWER IS PART OF THE UNIT -------------------------------
     Pyramid Q1 refused `300cm^3` against a cell listing `300 cm^3`, and the keypad's power key
     writes `cm^(3)`. Area of Shapes Q1 asks for the units, and once its bare `60` was gone `60 cm`
     still passed, because `cm^2` was read as `cm`. */
```

### A COMPOUND UNIT CLOSED UP was "Not yet" on every speed and density in the library:

in `CASES`

```
/* A COMPOUND UNIT CLOSED UP was "Not yet" on every speed and density in the library: the unit a
     child typed came off only as letters, and `/` is not a letter, so `12km/h` stayed whole against
     a cell of `12 km/h`. The whole-library sweep below found 23 of them. */
```

### A COMPOUND CAME OFF IN ROUND 2 TOO, AND TOOK THE SAME GENEROSITY:

in `CASES`

```
/* A COMPOUND CAME OFF IN ROUND 2 TOO, AND TOOK THE SAME GENEROSITY: `2 kg/m^3` passed on a density
     listed `2 g/cm^3 | 2`, and `12 km/h m` on `12 km/h` because only the first word of a unit was
     read. A compound has to be the cell's own when the cell names a unit; where it names none, a
     compound after a plain number comes off as a plain unit does. */
```

### ---------- THE SPACE BETWEEN A NUMBER AND ITS LETTERS

in `CASES`

```
/* ---------- THE SPACE BETWEEN A NUMBER AND ITS LETTERS --------------------------------------------
     ROUND 2 TOOK IT AWAY. `markBare_` used to cut both `185p` and `185 p` to `185`, so whichever way
     round the cell and the child wrote it they met in the middle; once it stopped cutting a letter
     glued to a number (`7m` is "simplify 9m − 2m"), `185 p` typed against `185p` matched nothing, and
     43 spellings on 36 rows went from right to wrong. The library sweep below only ever typed the
     OTHER direction — a spaced cell, closed up — so it stayed green. */
```

### ---------- THE NUMBER IN FRONT OF AN EXPRESSION IS NOT THE ANSWER

in `CASES`

```
/* ---------- THE NUMBER IN FRONT OF AN EXPRESSION IS NOT THE ANSWER -------------------------------
     `markBare_` TOOK EVERYTHING AFTER THE FIRST NUMBER AS ITS UNIT, so it cut `6w² − 10w` to `6`, and
     a bare 6 was marked RIGHT for "expand 2w(3w − 5)". Not one cell: across the library the leading
     number of 241 expressions in 110 questions passed — every nth term (`4` for `4n − 1`), every
     expansion, every line (`2` for `2y = 3x + 6`), every error interval (`93.5` for `93.5 m ≤ length
     < 94.5 m`) — and times (`2` for `2 hours 45 minutes`). It takes off a UNIT now and nothing else: a
     word or a symbol from the list, a power and a `/`, and then the end of the answer. */
```

### A SINGLE LETTER IS ALGEBRA UNLESS IT IS A UNIT, AND GLUED TO A NUMBER IT IS NEVER TAKEN FOR ONE.

in `CASES`

```
/* A SINGLE LETTER IS ALGEBRA UNLESS IT IS A UNIT, AND GLUED TO A NUMBER IT IS NEVER TAKEN FOR ONE.
     `7m` is "simplify 9m − 2m" on the 5-a-day sheet and `6.27m` is a length on the next; nothing in
     the spelling tells them apart. Every metre, gram and second the library glues on also lists the
     bare number or the spaced unit beside it, so refusing the glued letter costs no right answer —
     and the money cells that list only `250p` are pounds questions where 250 alone reads as £250. */
```

### ---------- AN ALGEBRAIC FRACTION, OFF THE KEYPAD

in `CASES`

```
/* ---------- AN ALGEBRAIC FRACTION, OFF THE KEYPAD ------------------------------------------------
     June 2020 Higher Q12(a). Its cell was `3x2⁄(x + 2)(x − 4), which is …` — the superscript lost
     when the tags came off, and a sentence after it — so it marked nothing right, and it reached the
     keypad only because `markBare_` cut it at the first letter. Rewritten as maths. The keypad begun
     with the fraction key writes `(3x^(2))/(…)`: the POWER's slot folds first now, as the root's
     does, and a numerator's slot may hold one term with a power, so the bracket comes off. */
```

### ---------- WHAT `markNorm_` ITSELF WRITES

top level, before `NORMS`

```
/* ---------- WHAT `markNorm_` ITSELF WRITES -----------------------------------------------------------
   SOME RULES CANNOT BE SEEN THROUGH `markAnswer_`, and a case written against it goes on passing with
   the rule deleted. `markParts_` runs `markNorm_` a second time over a string it has already
   normalised, so a bracket the first pass left is taken off by the second, and the order of two
   folds stops mattering at the level a CASE can see. The reviewer of round 1 deleted the line that
   folds a root's own slot first and all 137 cases stayed green. And a fold applied to BOTH sides
   cannot change whether they are equal: drop the lookahead that keeps the letter `x` in `2x + 3` and
   `2×+3` still equals `2×+3`. Those rules are statements about what `markNorm_` writes, so they are
   checked here, as that. */
```

### ---------- THE WHOLE LIBRARY, MARKED

top level, before `LIB`

```
/* ---------- THE WHOLE LIBRARY, MARKED ------------------------------------------------------------
   THE CASES ABOVE ARE THE FAULTS SOMEBODY THOUGHT OF, and every fault in this file was found the
   other way: by typing the library into itself. `6` against `6w² − 10w` was not one cell but 110, and
   `√3cm` was a right answer lost to a data edit that a sweep over one data set could not see. So the
   library is marked here on every run, seven ways, each a property that holds for EVERY row and
   needs nobody to list the rows:

     CLOSED UP   a way that is a number, a space and a unit — `√3 cm`, `12 km/h`, `80 y` — typed with
                 the space taken out is still right. A space is not an answer.
     SPACED      and the other way round: `185p`, `7m`, `6cd` typed with a space in. Round 2 lost 43 of
                 these and this sweep, typing only the first direction, stayed green over it.
     KEYPAD      a way typed the way the keypad stores it — every root, power and one-term
                 denominator in its own bracketed slot, `1/(√(2))` for `1/√2` — is still right.
     IN FRONT    the number in front of an EXPRESSION — letters and an operator after it, `4n − 1`,
                 `2y = 3x + 6`, `93.5 m ≤ length < 94.5 m` — is WRONG on its own. A unit is the
                 sentence; an expression is the answer.
     AFTER √/π   a root or a multiple of π the cell lists bare takes the units the cell names, closed
                 up or spaced, and nothing else: not a letter (`√3x`), not a power (`√3²`), not a unit
                 the cell does not name, and not the right one with another after it.
     A POWER     a number its cell lists, with `²` or `x²` after it, is wrong: a power is not a unit.
     COMPOUND    a compound unit the cell does not name, typed after a value it gives one, is wrong,
                 and so is the cell's own with another unit after it.

   The patterns that choose the rows are written out here and NOT borrowed from find.js: a check
   that asked the marker which ways have a unit would agree with the marker by construction. */
```

### ---------- THE ROWS THESE FAULTS WERE FOUND ON, AS THE LIBRARY HOLDS THEM TODAY

top level, before `ROWS`

```
/* ---------- THE ROWS THESE FAULTS WERE FOUND ON, AS THE LIBRARY HOLDS THEM TODAY ------------------
   EVERY CASE ABOVE CARRIES ITS OWN COPY OF A CELL, which is what lets it state a rule — and what let
   round 1's data edit go unseen: `√3cm` came out of the REAL exact-trig Q17 while the cases went on
   testing a copy. These are typed against the live `accept`, so a data edit that loses a right
   answer, or puts a bare number back where the unit is the question, is red here as well as there. */
```

### ---------- AN ORDERING IS MARKED BY ITS ORDER

top level, before `cutFrom`

```
/* ---------- AN ORDERING IS MARKED BY ITS ORDER --------------------------------------------------------
   `markOrder_` IS THE OTHER MARKER, and it exists because `markAnswer_` cannot do this: it reads a typed
   list as a set, so any order of the right items was right (docs/history/303). Cut out of find.js by
   the same extractor and run on its own, for the reason at the top of this file -- a copy here would be
   a second opinion about what a right order is. The row is positions, `3,4,5,2,1` the 3rd item first.

   ITS ONE FAULT THAT MATTERS IS THE SAME ONE: an order that is right marked wrong. So the alternatives
   a scheme allows where two values are equal are cases, and the library's own rows are swept below. */
```

### EVERY ORDERING IN THE LIBRARY, three ways:

top level, before `ORDER_ROWS`

```
/* EVERY ORDERING IN THE LIBRARY, three ways: each order its cell lists is right; the row reversed is
   wrong unless the cell lists it too; and every single swap of two neighbours is wrong unless the
   cell lists that. A cell that cannot mark its own order right marks nobody right, ever. */
```

### ---------- A TYPED LIST UNDER THE SAME KEY IS NOT A ROW

top level, before `seqSrc`

```
/* ---------- A TYPED LIST UNDER THE SAME KEY IS NOT A ROW -----------------------------------------------
   `orderSeq_` READS THE STORED VALUE BACK AS THE STRIP, and before these cards were orderings 52 of them
   drew the keypad and 16 a text box: what pupils typed is under the same `ansKey_`, on the device and
   in the account. Read a piece at a time, "-3, -1, 2, 4, 7" on 2406-2F-1 became `_ _ −3 2 _` -- a strip
   the pupil never made, and the next tap wrote it to the account. Cut out of find.js like `markOrder_`.
   Every case is a value and the strip it must draw, 0 for an empty slot; and every ordering in the
   library is swept with its own answer typed out the way a pupil would have (the `<b>` list, tags
   out), which must draw an empty strip, not a half-filled one. */
```

### ---------- AND IN TIME

top level, before `SLOW`

```
/* ---------- AND IN TIME ------------------------------------------------------------------------------
   `MARK_UNIT` USED TO TAKE SECONDS OVER A SENTENCE. Its unit was `[a-z][a-z0-9]*` repeated with
   nothing required between repeats, so `because` could be read as one unit, or `b` + `ecause`, or
   every other split — 2.8 s for "5 because the triangle is much bigger?" when round 1 measured it,
   doubling with each letter, on a phone, on Check. It is the question mark that does it: the words
   all read as units, the `?` does not, and every way of reading them is tried before the match is
   given up. A unit now has to end where its letters do, which is the same language with one way to
   read it. The sentence here is one plural longer: about 1.6 s with the old pattern, warm, on the
   machine that wrote this (11 s cold), and a millisecond or two now. The limit sits a quarter of the
   way up, so a slow machine is not the thing that goes red. */
```

