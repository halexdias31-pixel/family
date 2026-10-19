# check/cascade.js

The full text of comments in `check/cascade.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/cascade.js WHICH RULE WINS, AND WHETHER IT IS THE ONE SOMEBODY MEANT.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check/cascade.js

   WHICH RULE WINS, AND WHETHER IT IS THE ONE SOMEBODY MEANT.

   THIS STYLESHEET HAS LOST THE SAME ARGUMENT SEVEN TIMES. Every entry is in CLAUDE.md and every one
   was found by a person looking at a screenshot or reading two blocks side by side:

     `.price.faint`                    a blank price was meant to recede. `.faint` and `.price` are
                                       both one class, `.price` is written later, and the shop card
                                       printed a not-yet-priced row in full ink for months.
     `--fly-ink`                       set from a template string, read by a rule that never won.
     `.bk-row.is-blank` → `.is-bare`   the `max-content` repair went on the rule three thousand lines
                                       further down and the rows went back to 481px under a fix that
                                       read as though it had worked.
     `.rc-total` → `.bk-row`           the total row declared its own three-track grid and has been
                                       drawn on the booking form's five-track one since it was
                                       written, with the money in a 7ch track.
     `text-anchor="end"` → `.qsheet .num`   CSS beats an SVG presentation attribute, so ten y-axis
                                       numbers sat centred on the axis line.
     `.gd-sec p` → `.prac-safety`      caught before it was written, by reading the block first.
                                       (both rules have since gone with the guide's risk section)
     `.dock-new .btn` → `.btn.tiny`    the docket's ＋ was written at 1.1rem and has always rendered
                                       at 0.80rem — 11.86px inside a 44px box. Found by this file.

   SEVEN REPAIRS AND NO RULE. That is the sentence this repository writes about `cost: 0`, about
   `paper: true`, about the spelling fold and about `delRow` — a fault repaired in the instance and
   not in the rule comes back. This is the rule.

   ------------------------------------------------------------------------------------------------
   THE QUESTION, AND WHY IT HAD TO BE NARROWED TWICE.

   The honest general form — "two rules set the same property on one element and the later one wins"
   — reported **1,001 findings** on the first run, and nearly all of them are the cascade doing its
   job: a base and its variant, a longhand under a shorthand, `.hr` against `[data-do]` for a cursor.
   That is the `check-rows.js` fault exactly, where the first version had 95 findings and 2 real
   ones, and a report that is mostly noise is a report nobody reads.

   SO IT ASKS THE NARROW QUESTION THE SEVEN FAULTS SHARE. Two rules collide here only when:

     · they set the SAME property, and
     · they have the SAME specificity, so nothing but their ORDER decides it, and
     · they are different rules — two selectors of one rule are one declaration, not a contest, and
     · they share at least one class, so they are talking about the same kind of thing, and
     · neither's class set contains the other's — `.btn` under `.btn.tiny` is an ordinary override
       and this is not about those; `.dock-new .btn` against `.btn.tiny` is two sideways variants
       where the file order is the only reason either wins, and
     · a real element in the rendered app matches BOTH.

   That last one is what makes it a measurement rather than a grep: 1,001 became **five**, and three
   of those are one `border-bottom` shorthand counted per longhand.

   ------------------------------------------------------------------------------------------------
   AND IT IS FAST BECAUSE THE PAIRS COME FIRST. Asking 1,510 elements about 1,916 rules is three
   million `matches()` calls per state. The candidate pairs are computed from the STYLESHEET alone,
   which is cheap and does not change, and only those few selectors are ever put to the document.

     node check/cascade.js
     node check/cascade.js --all   every collision, including the ordinary overrides
     node check/cascade.js --screen=account   one screen and its states, as `check/ui.js` and
                                   `check/press.js` take it — for a machine too busy to walk all of them
                                   inside one window. The pairs are the whole stylesheet's either way.
================================================================================================== */
```

### ---------- KNOWN, WITH A WRITTEN REASON EACH, AND STILL PRINTED

top level, before `ACCEPTED`

```
/* ---------- KNOWN, WITH A WRITTEN REASON EACH, AND STILL PRINTED ----------------------------------
   THE SAME ARGUMENT AS `ACCEPTED_TAP` AND `ACCEPTED`. An order-decided collision is not always a
   fault — sometimes the later rule really is the one meant to win, and it wins for a reason somebody
   can state. What makes the list honest rather than convenient is that each entry says WHY, so a
   reader can disagree with it; an entry that only names a selector is a silencer.

   KEYED ON THE PAIR AND THE PROPERTY, not on the selector alone: `.tile.on` losing its colour to
   `.tile.is-admin` is understood, and `.tile.on` losing its BACKGROUND to something else next month
   is not. */
```

### ---------- THE WHOLE ANALYSIS, RUN IN THE PAGE

top level, before `analyse`

```
/* ---------- THE WHOLE ANALYSIS, RUN IN THE PAGE --------------------------------------------------
   IT READS THE RENDERED STYLESHEET, NOT THE FILE. `check/ui.js` says at length why that matters and
   the seven dead custom properties are its example: a scan of the source and a scan of the runtime
   both produced the same wrong answer, in mirror image. Here the browser has already parsed the
   selectors, expanded every shorthand into its longhands and put the rules in order, and getting
   any one of those three wrong by hand is the whole fault this file is about. */
```

### ---------- SPECIFICITY, AND `:has()` IS THE PART THAT CAUGHT ME OUT

in `analyse`

```
/* ---------- SPECIFICITY, AND `:has()` IS THE PART THAT CAUGHT ME OUT --------------------------
     `:has()`, `:is()` and `:not()` DO NOT COUNT AS PSEUDO-CLASSES. Each takes the specificity of
     its own argument, and `:where()` takes none at all. Counted as an ordinary `:pseudo`, as the
     first version did, `.pane:has(.rc)` scores three where it really scores two — so it tied with
     `.screen.on .pane` and this file confidently reported a contest that specificity had already
     settled. Two findings, both about the check.

     UNWRAPPING IS EXACT FOR ONE ARGUMENT and slightly generous for a list, where the real answer is
     the most specific of them. Every use in this stylesheet takes one. */
```

### THE AT-RULE IT IS IN TRAVELS WITH IT.

in `analyse`

```
/* THE AT-RULE IT IS IN TRAVELS WITH IT. A selector repeated inside `@media (prefers-color-scheme:
       dark)` is the whole mechanism this stylesheet is built on — see the theme tokens — and
       reporting it as written twice would be reporting the design. Only two rules in the SAME
       context are two places to edit one fact. */
```

### THE SAME SELECTOR IN TWO RULES IS THE CLEAREST CASE OF ALL and needs none of the tests below:

in `analyse`

```
/* THE SAME SELECTOR IN TWO RULES IS THE CLEAREST CASE OF ALL and needs none of the tests
         below: identical selectors are identical specificity by definition, they are obviously
         about the same thing, and neither contains the other. `.page .card { border-bottom: 0 }`
         was in this stylesheet twice, word for word, nine hundred lines apart, with the same
         comment over each. A selector written twice for DIFFERENT properties is ordinary and is
         not reported — 158 of them here, and every one is somebody grouping their rules. */
```

### ---------- AND WHETHER THE TWO SAY THE SAME THING

in `analyse`

```
/* ---------- AND WHETHER THE TWO SAY THE SAME THING --------------------------------------
           A VAGUE 87 IS NOT A NUMBER ANYBODY CAN ACT ON. Written twice with the SAME value is dead
           text — `.ag-a { fill: #f0b45f }` appears twice seven lines apart, and `.page .card
           { border-bottom: 0 }` appeared twice nine hundred lines apart. Written twice with a
           DIFFERENT value is an override that only the file order decides, which is the sharper
           half: 47 of these are `.mu-grid i:nth-child(N)` where the multiples of three and the
           multiples of five are two separate lists and every multiple of fifteen is in both. That
           is a designed overlap, and saying so needs the values. */
```

### AND NOTHING MORE SPECIFIC MAY ALREADY HAVE SETTLED IT.

in `analyse`

```
/* AND NOTHING MORE SPECIFIC MAY ALREADY HAVE SETTLED IT. `.tile.on` and `.tile.is-admin`
         both set a background, and `.tile.is-admin.on` — three classes — sets it for exactly the
         element that matches both. The order between the first two decides nothing there, and
         reporting it would be a finding about a contest neither rule is in. The first version did
         report it, on six properties, and the giveaway was that `color` was real while `background`
         beside it was not: the three-class rule sets the background and deliberately does not set
         the colour. */
```

### EVERY SCREEN AND EVERY DECLARED STATE, because a collision only counts where an element really carries both classes — and the sheet, the receipt, the basket

top level, before `found`

```
/* EVERY SCREEN AND EVERY DECLARED STATE, because a collision only counts where an element really
     carries both classes — and the sheet, the receipt, the basket, the guide and the message thread
     are on no screen `go()` lands on. Same list `check/ui.js` and `check/press.js` read. */
```

### TWO FINDINGS, TWO SEVERITIES.

top level, before `dup`

```
/* TWO FINDINGS, TWO SEVERITIES. A selector written twice in one context, both times setting the
     same property, is two places to edit one fact — real, and repairing ninety of them is editorial
     work on a 448 KB stylesheet rather than a build error. Two DIFFERENT selectors that only the
     file order separates is the fault this file exists for, and that fails. Same split as the
     library's `figure` count and the practicals' blank `needs`: a number somebody can act on beats
     a silence, and a red that is always red is a red nobody reads. */
```

