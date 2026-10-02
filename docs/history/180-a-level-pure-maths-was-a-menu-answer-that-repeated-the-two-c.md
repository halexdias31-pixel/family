## `A-Level Pure Maths` was a menu answer that repeated the two chips above it, and 18 GCSE questions were in it

**Reported as "sometimes in finder there are things which seem to appear in wrong menu. like i
remember seeing a level maths pure somewhere it shouldnt be. also why would that be a full option?
wouldnt a level be split from maths split from pure? this happens frequently."** Both halves are
right and they turned out to be the same fault seen from two sides.

**THE DESIGN QUESTION IS ANSWERED BY WALKING THE FUNNEL RATHER THAN BY READING IT.** At
`Learning · Questions · Maths · A-Level` — Subject and Level both already answered, because the
declared flow asks them before Topic area — the very next question offered
**`A-Level Pure Maths` / `Algebra`.** Every word of that button but one is on a chip directly above
it. The split the report asks for already exists as three separate questions; what did not was a
branch of the topic tree carrying the level and the subject in its NAME.

### What was in it, measured

| | |
|---|---|
| rows resolving to `A-Level Pure Maths` | **84** |
| of those, whose own Level column says **GCSE** | **18** |
| the words that put them there | `proof` (8), `rates of change` (4), `coordinate geometry` (4), `circles`, `arithmetic`, and three more on rows already carrying one of those |

**EVERY ONE OF THOSE IS AN ORDINARY GCSE HIGHER TOPIC** — algebraic proof is on the 1MA1 spec, and
`Q-1MA1-1705-1H-3` tagged `arithmetic` is *"Work out 54.6 × 4.3"*. They landed in an A-level menu
because the A-level subtree was the only place in the tree those words appeared, so the exact match
resolved uniquely. **This file already records one instance of it** — a GCSE lava-flow question
resolving to A-Level Pure Maths through `rates` — repaired in the data and not in the rule, which is
the `cost: 0` shape and is why it came back with eighteen more.

### And a second one underneath it: the index kept whichever branch was higher in the file

**`topicIndex_` BUILT `exact` AS WORD → ONE AREA**, with `if (exact[k] === undefined) exact[k] = area`
— so a word that exists in two roots resolved to whichever `data/topics.json` lists first. **Six
words are in two roots**: `brackets`, `bracket`, `trapezium rule`, `proof`, `arc length`,
`reflection`. And `brackets` is a node under **Number** and under **Punctuation**, which is why
**two KS2 GRAMMAR questions were filed under maths.** Nothing anywhere said so — a decision nobody
made, taken by file order, invisible from either row.

**`reflection` WAS THE LOADED GUN AND THE NEW RULE FOUND IT FIRING.** Zero QUESTION rows use the
word; `PR-HM14`, a **physics practical**, does — and it was resolving to Geometry & Measures.

### The branch says what it is, rather than the name saying it

`data/topics.json` gains two optional columns on its root rows. `Pure` — renamed from
`A-Level Pure Maths`, with the old spelling kept as an alias so nothing that names it breaks —
declares `only_level: A-Level, AS`, and **all thirteen roots declare `only_subject`**. Read off the
row rather than out of the label, because a substring rule over a name is what put a gold
*"required practical"* flag on five cards that say they are not one.

**THE LEVEL ALWAYS RULES A BRANCH OUT AND THE SUBJECT ONLY EVER BREAKS A TIE, and that asymmetry is
measured rather than chosen.** Counted across the library:

```
   97  practical: subject science  ->  area MATHS      <- deliberate, and the largest crossing there is
   73  practical: subject science  ->  area science
    2  question:  subject english  ->  area maths      <- the fault
```

**A blanket subject rule would have broken ninety-seven deliberate joins to fix two mistakes** —
the resistance of a wire IS a straight-line graph, and a student stuck on direct proportion should
find it. That is the ninety-five-findings-with-two-real-ones this repository records about
`check-rows.js`, and it is why the subject test is only reached when a word names more than one
branch.

**AND A BRANCH THE ROW POSITIVELY MATCHES BEATS ONE THAT SAYS NOTHING**, which is what keeps an
A-level question tagged `proof` in `Pure` now that `proof` also reaches GCSE `Algebraic Proof`.
**Nothing in the library exercises that step** — not one row uses any of the six shared words at
A-level — so it is a guard with no reader, kept because the row that exercises it is one
transcription away, and **counted on every run** so that is a number rather than a silence.

### Four GCSE words got GCSE homes, read off the questions rather than off the word

`proof` → `Algebraic Proof`, `rates of change` → `Graphs`, `arithmetic` → `The Four Operations`,
`coordinate geometry` → `Coordinates` — each placed after reading the questions themselves
(*"prove that n² − n is never odd"*, the gradient of a distance-time curve, 54.6 × 4.3,
perpendicular lines and the diagonal of a rhombus).

**`circles` AND `tangents` ARE DELIBERATELY LEFT.** One row each, and neither word has one honest
GCSE home: `circles` is the equation of a circle on that row and the area of a circle on a
Corbettmaths sheet, `tangents` is a circle theorem and the gradient of a curve. **A broad alias
added for one row is the substring fault**, so they get no area, which is the honest answer — a
chip that is wrong is worse than a chip that is missing.

### The diff, over the whole library, because a tree change can steal a topic

| | |
|---|---|
| items compared | **5,195** |
| unchanged | **5,175** |
| **gained** an area | **0** — nothing was invented |
| **lost** one | **1** — the `circles` row, deliberately |
| **moved** | **19**, and every one is a repair: 17 out of the A-level branch into the right GCSE strand, 2 out of `Number` into `Punctuation` |

Measured after, the funnel asks `Maths · A-Level` → Topic area → **`Algebra` / `Pure`**. Neither
answer repeats a chip above it, and `Pure` holds exactly the 66 rows that are A-level.

### `asList_` DOES NOT SPLIT A COMMA, and I wrote the constraints with it

`asList_('A-Level, AS')` is `['A-Level, AS']` — it wraps a string, it does not split one; the
comma-reading in this app is done by whoever owns the cell, and for the tree that is `topicAtoms_`.
Written with `asList_` the two levels came out as the single key `alevelas`, nothing matched it, and
**every A-level question lost its area — `Pure` went to 0 rows.** Caught because that number was
measured rather than assumed. The note about a comma being a list in `keystage` is about the
COLUMN's reader, and I took it for a property of that helper.

### `node js/check-funnel.js` rule 8 — and the first two versions of it were the fault

**NOTHING IN THE SUITE COULD SEE EITHER FAULT.** A row in the wrong branch has valid markup, a card
that draws, and a chip that is a real answer; the only way to see it is to compare the branch
against what the row says about itself.

**VERSION ONE BLAMED THE WRONG WORD.** It asked the question of the ITEM, so a physics practical
tagged `Reflection, Waves, Angles` — which is in Geometry & Measures because of **Angles**, the
deliberate join — was reported as `Reflection` being mis-filed. Each word is resolved on its own
now, by handing `topicAreaOf_` a row carrying that one topic and the real row's subject and level:
the app's own choice, asked about one word at a time.

**VERSION TWO COULD NOT FAIL ON THE FAULT IT WAS WRITTEN FOR.** It read the candidates out of
`topicIndex_.exact` — which is the thing the fix CHANGED. Reverting the index to first-writer-wins
leaves one candidate per word, the rule's own "was there a choice" guard skips it, and the two
grammar questions go back under Number in silence. **The candidates come from `data/topics.json`
itself now**, so what is asserted is the contract rather than the code. Found by mutation, which is
the only way it was ever going to be known.

**Proved by mutation six ways**: the level filter removed (names 11 words and an item), the subject
tie-break removed (3), the index back to first-writer-wins (3, naming `Reflection` landing in
Geometry), every `only_subject` taken off the tree, and the `only_level` declaration taken off —
which reports that the rule *"has nothing to enforce and was NOT checked — not a pass"*, because a
rule enforced by a declaration goes silent rather than red when the declaration goes. The sixth, the
positive-match step, does not fire and the run prints why. `find.js` and `data/topics.json` were
both restored from copies and compared byte for byte.
