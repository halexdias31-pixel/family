## `node check/cascade.js` — which rule wins, and whether anybody meant it to

**This stylesheet has lost the same argument seven times.** Every one is recorded above and every
one was found by a person reading two blocks side by side or looking at a screenshot:

| | |
|---|---|
| `.price.faint` | a blank price was meant to recede. `.faint` and `.price` are both one class and `.price` is written later |
| `--fly-ink` | set from a template string, read by a rule that never won |
| `.bk-row.is-blank` → `.is-bare` | the `max-content` repair went on the rule three thousand lines down and the rows went back to 481px **under a fix that read as though it had worked** |
| `.rc-total` → `.bk-row` | the total row declared its own three-track grid and has been drawn on the five-track one since it was written |
| `text-anchor="end"` → `.qsheet .num` | CSS beats an SVG presentation attribute, so ten y-axis numbers sat centred on the line |
| `.gd-sec p` → `.prac-safety` | caught before it was written, by reading the block first |
| **`.dock-new .btn` → `.btn.tiny`** | **found by this file.** The docket's `＋` is written at 1.1rem and has always rendered at **0.80rem — 11.86px inside a 44px box.** A glyph is not a word and needs the size |

**Seven repairs and no rule**, which is this file's own sentence about `cost: 0`, about `paper:
true`, about the spelling fold and about `delRow`. A fault repaired in the instance and not in the
rule comes back.

### It had to be narrowed twice, and the first version was the noise generator

**The honest general form — two rules set the same property on one element and the later wins —
reported 1,001 findings**, and nearly all of them are the cascade doing its job: a base and its
variant, a longhand under a shorthand, `.hr` against `[data-do]` for a cursor. **That is
`check-rows.js`'s 95-findings-with-2-real-ones**, and a report that is mostly noise is a report
nobody reads.

**So it asks the narrow question the seven faults share**: two DIFFERENT rules, the same property,
the same specificity so nothing but ORDER decides, a shared class so they are about the same kind of
thing, neither's class set containing the other's, and **a real element in the rendered app matching
both**. 1,001 became five, and three of those were one `border-bottom` counted per longhand.

**And it reads the rendered stylesheet rather than the file.** The browser has already parsed the
selectors, expanded every shorthand into longhands and put the rules in order; getting any one of
those wrong by hand is the whole fault this check is about.

### Two of its own findings were about the check, which is the part worth keeping

- **`:has()`, `:is()` and `:not()` are not pseudo-classes.** Each takes the specificity of its own
  argument and `:where()` takes none. Counted as an ordinary `:pseudo`, `.pane:has(.rc)` scores
  three where it really scores two — so it tied with `.screen.on .pane` and this file confidently
  reported a contest that specificity had already settled.
- **A contest a third rule has already decided is not a contest.** `.tile.on` and `.tile.is-admin`
  both set a background, and `.tile.is-admin.on` — three classes — sets it for exactly the element
  that matches both. The giveaway was that `color` beside it WAS real: the three-class rule sets the
  background and deliberately does not set the colour.
- **And a selector repeated inside `@media` is the design, not a duplicate.** The theme tokens are
  built on it. Only two rules in the same at-rule context are two places to edit one fact.

**Proved in both directions**: putting the `＋`'s font-size back names `.dock-new .btn` overruled by
`.btn.tiny` and exits 1; the real file is green.

### 87 selectors set the same property twice — 28 of them saying it twice over

`.page .card { border-bottom: 0 }` was in this stylesheet **word for word in two places nine hundred
lines apart, with the same comment over each** — under a note saying *"a page was described twice
and the two descriptions had already drifted apart"*. `.ag-a`, `.ag-b` and `.ag-c` each declare their
`fill` twice, seven lines apart. `#splash-breathe` is told `display: none` in two separate groups.

**A vague 87 is not a number anybody can act on, so it says which kind each one is.** **28 declare
the SAME value twice** — dead text, two places to edit one fact. **59 declare different values**, so
the later wins on file order alone — and **47 of those are `.mu-grid i:nth-child(N)`**, where the
multiples of three and the multiples of five are two separate lists and every multiple of fifteen is
in both. That is a designed overlap, and saying so needed the values rather than the property names.

**Printed rather than failed**, because repairing them across 448 KB is editorial work and not a
build error. Same split as the library's `figure` count and the practicals' blank `needs`: a number
somebody can act on beats a silence.
