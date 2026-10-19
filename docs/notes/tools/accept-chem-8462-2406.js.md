# tools/accept-chem-8462-2406.js

The full text of comments in `tools/accept-chem-8462-2406.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — tools/accept-chem-8462-2406.js

top level, before `fs`

```
/* ==================================================================================================
   @family. — tools/accept-chem-8462-2406.js

   CHEMISTRY PAPER 1 COULD NOT MARK A SINGLE ONE OF ITS OWN ANSWERS.

   Reported by somebody sitting it. Measured: 102 questions across the two tiers, 102 with an
   answer, and `accept` empty on every one — so `ansBox_` drew the box and no Check button on all
   of them, and a student working through the paper found out whether they were right by opening
   the mark scheme, which is the one thing a student on their own will not do honestly. The rest
   of the library is not like this: 1,398 rows already carry an `accept`.

   THE RULE IS AS NARROW AS THE FAIRNESS ARGUMENT NEEDS, because this is the one thing in the app
   that tells a child they are wrong and there is nobody for them to appeal to. Two shapes qualify
   and nothing else does:

     A TICK BOX     the paper prints the options, so the set of right answers is closed and
                    printed. 28 of these questions exist on the two tiers; the ones kept are the
                    ones somebody can actually TYPE — a letter, a number, a name, a formula, a
                    phrase of about four words. The sentence options (`Energy is taken in from the
                    surroundings so the reaction is endothermic`) and the equation options
                    (`2 Cl⁻ → Cl₂ + 2 e⁻`) are deliberately left unmarkable: this app has a text
                    box rather than radio buttons, nobody types those, and a right answer marked
                    wrong is the failure that makes a student stop trusting the marking.

     ONE VALUE      a calculation whose answer is a single number, with or without its unit.
                    `markBare_` already drops a unit from the expected side.

   EVERYTHING ELSE IS LEFT ALONE and that is most of the paper: every `explain`, every level-marked
   answer, every "any two of", every answer that is two facts in one box. A mark scheme that reads
   working is not a string comparison and pretending otherwise is worse than no button.

   AND EVERY ENTRY IS PROVED BOTH WAYS BEFORE IT IS WRITTEN, through the app's own `markAnswer_`
   rather than a second opinion about what a right answer is. For a tick box the wrong side is free and is
   the strongest test available: EVERY OTHER PRINTED OPTION must mark wrong. An `accept` that lets
   two of the four options through is a question with two right answers.
================================================================================================== */
```

### `tail: [accept, [other spellings a right answer might be typed as], printedAnswerReducesTo?]`.

top level, before `ACCEPT`

```
/* `tail: [accept, [other spellings a right answer might be typed as], printedAnswerReducesTo?]`.
   The printed answer's own head, and on a tick box every other printed option, are added to the
   two sides automatically. The third element is for the one row whose printed answer is itself a
   list of alternatives (`Methyl orange or phenolphthalein`), where no splitting rule can produce
   the thing a student types -- said out loud rather than papered over with a wider `accept`. */
```

### A `<sup>` CLOSES UP AND EVERY OTHER TAG OPENS A GAP.

top level, before `options`

```
/* A `<sup>` CLOSES UP AND EVERY OTHER TAG OPENS A GAP. `16.4 cm<sup>3</sup>` is one option and
   stripping every tag to a space makes it `16.4 cm 3`, which is not what is printed and not what
   anybody types -- so the option would have matched nothing and the "exactly one right" test would
   have failed on a correct `accept`. */
```

