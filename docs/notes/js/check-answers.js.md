# js/check-answers.js

The full text of comments in `js/check-answers.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-answers.js IS THE ANSWER A PERSON SEES SHORT.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-answers.js

   IS THE ANSWER A PERSON SEES SHORT.

   ASKED FOR AS "make answers breaifer", and, offered the choice between shorter written answers and
   hiding the working behind a tap: "i want shorter answers." Measured before the change: 4,309
   answers, median 88 characters, 1,019 over 200 and the longest 1,677 -- a card whose answer was a
   page of prose, with the result somewhere inside it.

   THE ANSWER IS ITS RESULT, AND NOTHING ELSE IS DRAWN. `answerParts_` in find.js says where the
   RESULT stops -- what comes before the first spaced dash, with the mark-scheme codes taken off -- and
   `answerBlock_` draws that head and only that. The explanation and the examiner's note stayed in the
   data (Mark with AI sends both as its scheme) and left the page on the owner's word: *"Also remove
   all 'why's. I just want it to have answer."* tools/answer-brief.py put every long answer into the
   `result — why` shape. This holds the line:

     1  `answerParts_` itself, on the cases that shaped it: the spaced dash and only the spaced one,
        a dash inside a table left alone, codes off the result and kept where a sentence needs
        them, an entity's own semicolon kept, a bold opened before the dash closed on each side.
     2  every answer in data/questions.json, drawn through the REAL function, shows a result of
        LIMIT characters or fewer -- unless ACCEPTED names it, with one written reason.
     3  the split never cuts a fraction or a power in two: `typeset_` over the two halves draws as
        many stacked fractions and raised powers as it does over the whole.
     4  a name on ACCEPTED that is no longer over the limit fails too: a reason nobody needs is a
        line that will one day excuse something else.
     5  `answerBlock_` itself, cut out by name and run over every answer in the library, draws the
        head typeset and NOTHING ELSE: no fold, no `<details>`, no examiner's note, not one word of
        the why. A second copy of "where the answer stops" would be the drift this file exists for.
     And it PRINTS, without failing, how many results are a word that says the working was done
     rather than what it came to ("Shown", "AO2"): those rows are being rewritten in the data, and a
     count is how anybody knows when that is finished.

   WHY 120. Measured on the drawn results after the rewrite: median 7 characters, 95th percentile
   89. Before it, the 90th percentile was 154 -- so 120 is above every result that is a result and
   below every one that was a paragraph. At the root size a 390px phone draws (14.82px), 120
   characters is about three lines of the card: the most that reads as one answer at a glance.

   IT RUNS THE REAL FUNCTIONS, CUT OUT OF find.js BY NAME with `check-marks-load.js`'s cutter, the
   way `check-typeset.js` runs `typeset_`: a copy here would be a second opinion about where an
   answer ends, and the day the two drifted this would pass while the cards grew back.

   PRINTS A COUNT EVERY RUN, the distribution and the five longest -- a silence is not a count.

     node js/check-answers.js
================================================================================================== */
```

### ---------- ANSWERS THAT ARE LONG AND ARE ALLOWED TO BE, ONE REASON EACH

top level, before `ACCEPTED`

```
/* ---------- ANSWERS THAT ARE LONG AND ARE ALLOWED TO BE, ONE REASON EACH ---------------------------
   Still printed every run. The point of the list is that a NEW long answer fails loudly instead of
   joining a count nobody reads -- the same contract as ACCEPTED in check-payload.js. */
```

