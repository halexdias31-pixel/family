## Five column heads, dictated column by column, and two of them overrule what was written here

**Asked for over a sketch of the five-column head**: *"There should be 5 columns in receipt. Q for
the prompt, a for answer. X for multipliers. +/h for plus rate per hour, then + for full added
price"*. `Q A × +/h +`, and the mapping was checked against `js/price-rows.js` before anything was
typed: `out.rate = signed(perHour, '/h')` puts `+£2.50/h` under `+/h` and `out.total = running()`
puts the running figure under `+`. The two symbols the owner chose are the two the column already
prints.

**THE STUB HEAD WAS BLANK AND THE ARGUMENT FOR IT WAS MINE TO LOSE.** It read *"a word over
'For / Kind / Subject' would be a label for labels"*, which is what a table does with the column its
row names live in — and it left **four headings over five columns**, so a reader counting across has
to work out which one is unlabelled. `Q` names it, and the card's own rows say why the word is
right: every label in that column IS a question the document asks.

**AND THE VALUE COLUMN'S WORD NO LONGER COMES FROM THE CALLER.** It was `Answer` on the form and
`Detail` on the receipt, on the argument that *"the form is what you ANSWER and the receipt is what
was DECIDED"* — true, and `A` is the same letter for both, so the difference has nowhere left to
show. `cols` stays as the **flag** it also was: the basket passes none, which is how a caller says
it wants no header at all — its card is two columns and there is nothing for five names to sit over.
The five words are written once, in `spineHead_`, over the columns they name.

**`×` RATHER THAN A LETTER X, and it is the same glyph to a reader.** The values beneath it are
`× 6` and `× 1.005`, so the header is the character the column already uses rather than a second
spelling of it.

### `text-transform: uppercase` went with the words, and it was one wrong character

It was on `.bk-row.is-cols` for `ANSWER`, `RATE` and `TOTAL`. Of the five symbols now in that row
the only letter it can touch is the **`h` of `+/h`**, which it raised to `H` — a header spelling the
unit one way over a column of `£12.00/h` spelling it the other. One property removed and what the
source says is what the row draws. **The tracking stays**: at `.58rem` it is what still reads these
five as a label rather than as a row of the document.

**Measured at 320 / 390 / 768, on both headers the booking column draws** — the form's and the
receipt's: `"Q" "A" "×" "+/h" "+"`, no span overflowing its track at any width, `text-transform:
none`, the pane hiding 0px, and no JS errors. Screenshotted at 390, which is the **seventeenth**
time this file says a screenshot is the last word on something drawn — counted off the lines
above rather than remembered, because this tally has been wrong in its own warning twice.

**WHAT WAS NOT FIXED BY IT WAS FIXED THE NEXT MORNING, under its own heading below.** The header kept
all five tracks while a row with no figures collapsed to two, so on the receipt `A` sat over the
right edge of a **114px** track (102..216 at 390) while the `Subject` value under it was
right-aligned at **351px**, under `+`. That was recorded here as not fixed and was the whole of the
next report.

**IT IS UNCHANGED BY THIS, AND THAT IS MEASURED RATHER THAN REASONED.** `.bk-k` is
`minmax(6.2em, max-content)`, so an empty span and a `Q` both resolve to the 6.2em floor — and the
mutation says so outright: putting `'' / Detail / × / Rate / Total` and the uppercase back into the
live header gives **`44..97 102..216 221..257 262..303 307..346`**, the same five boxes to the pixel.
Only the glyphs moved.
