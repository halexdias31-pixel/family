## Each field in its correct column, which needed the card to stop being thirty grids

**Reported as *"make reciept builder more like ordely. each field in its correct column"***, the
morning after the five column heads went on. They sat over nothing, and the reason is structural
rather than a width somebody got wrong.

**EVERY `.bk-row` DECLARED `display: grid` AND ITS OWN `grid-template-columns`.** So `max-content`
and `1fr` resolved PER ROW — thirty independent grids stacked up, which cannot line up except by
accident. Measured at 390 on a priced booking, relative to the card's left edge:

| | label | answer | × | +/h | + |
|---|---|---|---|---|---|
| **the head** | 7.7→60.9 | 65.4→190.5 | 194.9→231 | 235.5→276.8 | 281.2→319.9 |
| `Tutor` — priced | 7.7→**75.6** | 80.1→**158.3** | 162.7→208.9 | 213.3→266 | 270.5→319.9 |
| `Subject` — no figures | 7.7→75.6 | 80.1→**319.9** | — | — | — |
| `Dates` — a dash | 7.7→**39.9** | **44.3**→319.9 | — | — | — |

**Not one of the head's five boundaries was a boundary of any row**, the answers ended at two
different x on one card, and three blank rows started their dash in three different places.

**SO THE CARD DECLARES THE COLUMNS AND EVERY ROW SUBGRIDS ONTO THEM.** `grid-template-columns:
subgrid` is the only thing that makes a track shared: `display: contents` would drop the row, and
the row is what carries the padding, the tick line-height and the week's own layout. `max-content`
on the label now resolves once across every label on the card, and `1fr` once. After: **every row
and the head at `7.7→78.6 | 83→158.3 | 162.7→208.9 | 213.3→266 | 270.5→319.9`.**

**THE TWO PER-ROW TEMPLATES HAD TO GO IN THE SAME COMMIT.** `.is-bare` and `.is-blank` each declare
their own five tracks and both are two classes, so either would have won on order and taken the
alignment straight back — the `.price.faint` shape, on the one rule whose whole job is that the
columns agree. What each MEANS is unchanged and is now said by hiding the three money spans, which
is what `is-bare` already meant.

**AND THE FONT-SIZE HAD TO MOVE WITH THEM.** Every track is `em` or `ch`, which resolve against the
element that DECLARES them — so tracks on `.bk` at the card's own size and text in the row at
`.74rem` size the columns for a font nothing is set in. Measured before that line existed: `6.2em`
came out **96px** against a label 56px wide, and the five columns wanted **385px on a card with
328**. One selector for both, rather than the same expression written twice.

### An answer stays in the answer column, and what that costs is the answer column

**`.bk-v { grid-column: 2 / -1 }` WAS THE OTHER HALF.** A row with no figures gave its answer the
three money tracks as well, which is why `Subject` ended at 319.9 and `Tutor` at 158.3 on one card.
It is gone: an answer is column A whether or not the row beside it happens to carry a price.

**WHAT IT COSTS IS REAL AND IS THE NARROWER OF TWO WIDTHS THE CARD ALREADY HAD.** A value box is
**56.3 / 75.3 / 80.9px** at 320 / 390 / 768, read off the card's own `grid-template-columns`. Every
PRICED row was already that — *"two editable fields, one above the other, in two sizes"* is what the
note over `is-bare` calls it — so nothing new is introduced; the card settles on one. A dropdown
whose option is longer than that ellipsises, which `Instant cl…` does at 390.

**THE WEEK IS THE ONE EXEMPTION AND IT IS ARITHMETIC.** Ten hour cells with their 1px gutters in the
answer track is **4.7 / 6.6 / 7.2px a cell**, under the 7.6 `ACCEPTED_TAP` already calls the largest
compromise on its list. `grid-column: 2 / 4` gives it the multiplier column — the one track beside
it a day row could never fill — so it lands on a REAL column edge instead of wherever a percentage
falls, and the two money columns stay unbroken down the card's whole height. Measured: **8.97 /
11.69 / 12.48px a cell**, against 7.6 / 9.7 / 10.3 at 44% of a span that ended 29px inside the
multiplier column. **That gives a fifth of the thinness back, asked for twice**, and `2 / -1;
width: 44%` is the one declaration that reverses it.

**Nothing overflows anywhere**: `over: 0` and no sideways scroll on the blank form, the priced form
and the waiting list at all four widths, with the waiting-list card — the one with three pixels of
headroom in its own note — at 761 in a 769 pane.

### `FIELD OUT OF ITS COLUMN` — and two mutants had already survived the whole suite

**Nothing here could ask this question, and that was proved before it was written.** An adversarial
review of the header wrote two mutants against it and both passed every check: nothing overflowed,
nothing was clipped, every row measured exactly what it asked for. `check/cascade.js` pairs two
rules matching ONE element at equal specificity; `check-css.js` reads the file. Neither can ask
whether a box is in the wrong COLUMN.

**One question, over the classes the card's own grid names**: every cell of a column has the same
two edges. The header is a row like any other to it, which is the half that matters — a head that
does not sit over its column is exactly as much a finding as a value that does not. The week's RIGHT
edge is exempt with the arithmetic above; its LEFT edge is not, because the left edge is the one the
eye tracks down the card. 1.5px of slack, which is sub-pixel layout and nothing else: the smallest
real fault here was 3px.

**Proved by mutation in both directions** — the header given back its own template names 33 findings
and exits 1 (`.bk-k right edge varies by 10.3px down one card — "For" against "Q"`); the real files
exit 0 and all 38 checks pass.

### And `Q` was drawn in the ink of the rows underneath it

**Found by the same review, and it is the twelfth conviction of `.price.faint` in this stylesheet.**
`.bk-k { color: var(--dim) }` is a declaration ON the span; `.bk-row.is-cols { color: var(--faint) }`
is on the row and reaches it only by inheritance, and a direct declaration beats inheritance at any
specificity. Measured: `Q` came out `#9a9a9a` at 6.99:1 and `A × +/h +` came out `#808080` at
4.98:1 — and `#9a9a9a` is `Venue` and `Subject` and every other label in that column exactly. One
heading a step louder than the other four, in the ink of the rows it heads, starting at the same x.

**The other four each carry `color: inherit` and were written to defeat this.** `.bk-k` had none
because until the heads went on it was **empty**, and a rule that paints nothing cannot be seen to
be wrong. Neither check could see it and that is worth stating rather than assuming: both colours
pass 4.5:1, so `check/ui.js` is silent, and the loser is inheritance rather than a competing rule,
so `check/cascade.js` is too.
