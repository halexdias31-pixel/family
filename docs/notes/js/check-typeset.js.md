# js/check-typeset.js

The full text of comments in `js/check-typeset.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-typeset.js DOES THE MATHS ON A QUESTION CARD LOOK THE WAY THE PAPER PRINTS IT.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-typeset.js

   DOES THE MATHS ON A QUESTION CARD LOOK THE WAY THE PAPER PRINTS IT.

   ASKED FOR AS "no x2 or x^2, it should look how its supposed to look ... it shouldnt be 4/5 it
   should be 4 over the five". Two things answer that and this checks both:

     `typeset_` in find.js     stacks every fraction the library stores as one, and raises every
                               `x^2`, when a card is drawn
     the library itself        holds no fraction, power or times sign written as plain text that
                               `typeset_` cannot know is maths -- `5/8`, `11 m2`, `6x2+3x4`

   IT RUNS THE REAL FUNCTION, CUT OUT OF find.js BY NAME, the way `check-marking.js` runs the real
   marker: a copy here would be a second opinion about what a fraction is, and the day the two
   drifted this would pass while the cards broke. The cutter is `check-marks-load.js`'s, so there
   is one extractor in the repository and not two.

   AND IT ASKS ABOUT WHAT IS DRAWN, NOT WHAT IS STORED. Every rule below runs on `typeset_`'s
   OUTPUT, so a stored `<sup>4</sup>&frasl;<sub>5</sub>` is fine (it is drawn stacked), a stored
   `x^2` is fine (it is drawn raised), and a stored `4/5` fails -- because nothing turns that into
   a fraction, and a check of the store alone would have to keep its own list of which stored
   shapes are fine. One list, in one function, is the point.

   WHAT FAILS:
     1  a fraction slash `typeset_` could not read both sides of, outside a superscript
     2  a whole number over a whole number in plain text, anywhere in the library -- unless
        tools/data/typeset-keep.json names it as something else (41/42 meaning "41 or 42")
     3  a caret left in the text
     4  in a MATHS row: an algebraic slash (`t/2`, `(x + 2) / (2x + 1)`, `?/24`), a letter with a
        digit run onto it (`2x2`, `y5`) or a unit with its power run onto it (`cm3`, `m2`)
     5  a `.frac` that was never given its two halves -- the June 2023 papers drew `A ÷ B` in one
     6  a line on typeset-keep.json that no longer matches anything -- a reason nobody needs

   WHAT IT LEAVES, AND COUNTS, because a silence is not a count:
     * a decimal either side of a slash (`12/17.2`) -- a division in working, as a mark scheme
       writes one; and a slash in a unit (`m/s`, `g/cm³`)
     * a slash inside a superscript -- a fractional index, which the paper sets inline too
     * 1ST CLASS MATHS' LOST POWERS. 1,358 of its rows are raw PDF text and the powers did not
       survive extraction (`Simplify fully 2x2 – 2xy`). They are not plain-text maths somebody
       typed; they are a transcription that has to be redone from the PDFs by position, sheet by
       sheet -- audit maths-1 step 4 -- and until then they are a named backlog, printed with its
       size, rather than either a permanent red or a silence.

     node js/check-typeset.js
================================================================================================== */
```

### ---------- THE FUNCTION, ON THE CASES THAT MATTER

top level, before `F`

```
/* ---------- THE FUNCTION, ON THE CASES THAT MATTER -------------------------------------------------
   Every case is a row of the library or a fault that nearly shipped. `F(a, b)` is the stacked form,
   written out once here so a change to the markup is a change in one place. */
```

### WHAT A READER SEES AS TEXT:

top level, before `unscript`

```
/* WHAT A READER SEES AS TEXT: no superscripts or subscripts (those are drawn raised or lowered, and
   that is the point of them), the hidden slash gone, every tag a space so two halves of a stacked
   fraction cannot run together into one number, and every entity a space.

   A SCRIPT LEAVES A MARK RATHER THAN A SPACE. The first version blanked it to a space, and
   `305<sup>2</sup>/76<sup>2</sup>` came out as `305 /76` -- a whole number over a whole number that
   nobody wrote, failed three A-level physics answers whose working divides two squares. `§` is
   neither a digit nor a space, so nothing either side of a power can join up across it. */
```

### THE SAME TWO SHAPES tools/typeset-plain-maths.py rewrites -- `4/5`, and `4 / 5` with a space each side -- and the same idea of a whole number:

top level, before `BEFORE`

```
/* THE SAME TWO SHAPES tools/typeset-plain-maths.py rewrites -- `4/5`, and `4 / 5` with a space each
   side -- and the same idea of a whole number: not touching a digit, a slash, a letter, a decimal
   point or a Greek letter (`3600 / 2π` is a chain of working, not 3600 over 2). */
```

