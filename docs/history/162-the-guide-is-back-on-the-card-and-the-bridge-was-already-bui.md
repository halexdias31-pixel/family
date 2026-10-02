## The guide is back on the card, and the bridge was already built

**Reported, in these words: "I want a diagram for every practical. As I said. Same layout. Diagram,
ingredients, steps, work. It seems you've moved it all to pop up after pressing a tile. I HATE THIS.
I HATE POP UP. Even if it doesn't fit on screen we'll cross that bridge when we get there."**

So `practicalCard_` calls `practicalGuide_` inline, and the `prac-guide` tile, its handler and the
sheet are deleted. `practicalGuide_` is KEPT as the builder rather than inlined, which is what
leaves every `.gd` rule in the stylesheet applying unchanged — the drawing's `figure`, the kit
chips, the worksheet boxes and their `.gd-sec` headings are the same markup in the same order.

### The measurement said this was going to be bad, and then said it was already solved

**With the guide on it a practical card is a MEDIAN 1,581px inside an 807px pane at 390×844, and 77
of the 82 are over.** Clipped, that is about half of every practical unreachable — the method from
step four onwards and the whole worksheet — which is a different thing from a card that runs a
little long, and worth more than "we'll cross that bridge".

**SO A `max-height` AND AN `overflow-y: auto` WENT ONTO `.card.prac`, AND IT WORKED, AND IT WAS
WRONG.** `paneReach_` in `find.js` already measures every funnel pane after a paint and writes
`overflow-y: auto` **inline** on the ones that overflow — written for the 431 question cards with
exactly this fault — and `scrollHost_` in `overworld.js` then scrolls that pane from the app's own
drag and hands the next swipe to the grid. **A practical card is a funnel result, so it has been
covered since the day that was written.**

**MEASURED, THE NEW RULE MADE IT WORSE: two scrollers down one card.** The card scrolled 266px and
then the PANE scrolled a further 81, because a card capped at the pane's OUTER height does not fit
inside the pane's padding — and a swipe was eaten between them. The instrumented run said it
outright, wrapping the app's own functions: `scrollHost_` answered `card prac` on the first swipe
and `pane` on the second.

**So there is no new CSS at all.** The `--cell-max` variable extracted at `:root` for the same wrong
reason went back with it. **Proved with real touch events on the tallest card**: the pane shows
805px of 1,152, `paneReach_` has set it to `auto`, two swipes scroll it 0 → 260 → 347 and reach the
end, and the third turns the page. One card, everything on it, nothing unreachable, no pop-up.

**FOUND BY ASKING THE BROWSER WHICH RULE WON**, which is the only thing that could have found it:
the pane's own `overflow-y` came back `auto` while `.pane` in the stylesheet says `hidden`, and
`CSS.getMatchedStylesForNode` named the winner as `INLINE`. A stylesheet grep would have reported
`hidden` and been confidently wrong.

### Two checks were measuring a surface the app no longer has

**`check/cards.js` opened each guide with `openSheet` and `check/states.js`'s declared state did
too.** Both would have gone on passing — about a surface nobody can reach, which is this
repository's oldest fault pointed at its own instruments. Both render the card now; every
measurement inside those loops is unchanged, because the `.gd` block is.

**AND `check/cards.js`'s HEIGHT RULE PRINTED A SENTENCE THAT HAD STOPPED BEING TRUE.** *"Cut off
with no scroll and no page to turn to"* — a failure, correct when the guide was split off and the
count fell to zero, and false of all 77 the moment it came back, because the pane scrolls them. It
is a count now, in the same words as the question rule directly above it, which had been saying the
right thing all along: *"so the pane scrolls and the pager takes over at the end"*. Stood down on a
measurement rather than on convenience — the real-touch run above is what licensed it.

**And the run's own pass sentence claimed "every practical card fits the pane it is drawn in"**,
with 77 that do not. Both counts are printed rather than claimed now. Same shape as
`.favwrap.is-fav` and the dead `kind === 'paper'` guard: a confident sentence outliving the thing it
described, in the check that exists to catch exactly that.

### The state counted eighteen worksheet boxes and wanted three

**`check/ui.js` reported `stuff · a practical guide` as NOT MEASURED at every width**, and the state
was drawing perfectly. The expect asked `document.querySelectorAll('#s-stuff .card.prac .gd-box')
.length === 3` — and the windowed pager keeps about six result pages in the DOM at once, so that
counts six guides and answers **18**. The claim is per card, so the count is per card. Caught by
replicating the state's own `enter` in a browser rather than by reading it.

### What is NOT done, and one thing worth deciding

**"I HATE POP UP" is a general sentence and this commit acted on the practical guide only**, which
is what the report was about. **Measured, fourteen other surfaces still open in a sheet**: the quiz,
the flyer and cheat-sheet widgets, a post's reactions list, the new-post and edit-post composers,
Add a friend, Add your child, Message, Build, a day on the calendar, Mark it paid, Join in, and a
legal document. Each is a form or a document rather than a thing you are looking AT, which is the
line the house style already draws — but the quiz is the one that is plainly the same object as a
practical guide, and if it should come onto the card too that is one edit of the same shape.
