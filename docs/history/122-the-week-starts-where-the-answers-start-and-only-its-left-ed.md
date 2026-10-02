## The week starts where the answers start, and only its left edge could move

**Reported with a screenshot of the form: "can you see how grid stretches across all columns? I want
it squashed into the second column which is the input column."** The second time it has been asked —
the first was about the block week, where it was granted, and the hour week was refused on
arithmetic.

**Measured on the card rather than quoted, because the recorded numbers had gone soft.** `.bk-open`
was `1 / -1` and is `2 / -1`, which hands back the label column and its gap:

| | cell before | cell after |
|---|---|---|
| 320px | 19.1 × 20 | **13.6 × 20** |
| 390px | 24.1 × 20 | **17.6 × 20** |
| 768px+ | 25.6 × 20 | **18.7 × 20** |

**That is a real reduction and it is written down rather than smoothed over.** The height floor is
untouched at 20px; what gives is width, and the note over `.hr` sets that floor against a cell *24px
wide* — which is exactly what 390 used to be. At 320 the target is now 13.6px with its neighbour two
pixels away. **`ACCEPTED_TAP` already carries these cells** with the arithmetic beside them — eleven
fingertips need 484px and no phone is that wide — so nothing new is reported and this makes an
accepted finding smaller. Asked twice, measured, and the owner's call.

**One rule for both weeks now, so `is-blocks` had no reader left.** It existed only to say *this
week may start at the value column*, back when the hour week could not; a class with no rule behind
it is `.favwrap.is-fav` again, so it is off the markup too.

### The right edge is the half that cannot move, and the reason is a decision already reversed once

**`2 / -1` is the value column AND the three figure tracks behind it.** So the week starts where the
answers start and still runs to the card's edge, while an unanswered row's dash stops at **189 of
351**. Clipping the week to 189 is `2 / 3` — **78px for eleven hours, a seven-pixel cell** — which is
the same arithmetic written beside `.bk-row.is-blank` where it was refused before.

**So the card's two right edges are not this rule's to close.** They are the price of the multiplier,
the rate and the total sitting on a form with nothing priced on it — hidden once, on this same
complaint, and put back on *"what happened to all the columns I had before for things like
multiplier"*. Hiding them again is one line and it closes both edges at 351; it is the owner's
judgement and it has already been made in both directions, so it is offered rather than taken.

### And CLAUDE.md had been describing the hidden version for weeks

**The three sections under "the rows were holding three empty columns" say the figure columns go on
an unpriced card. They do not.** The revert was written up in `style.css` and nothing came back
here, so this file's own table said the value's right edge was 351 while the live card said 189.
**Found by measuring the card while answering this complaint**, which is the only reason it is not
still there — the same shape as `.favwrap.is-fav`, as `resource_type` in `VOCAB` and as the dead
`kind === 'paper'` guard, pointed at the map rather than at the code.

**Measured after, three states × four widths**: `gridLeft === valueLeft` on the form at every width,
no sideways scroll anywhere, `under: 0` on every pane, and the block week unchanged at 55/70/74px a
cell.
