## All the answers in one column, which needed the other three to give their width up

**Asked for as "label each column at the top. Small", and then the reason behind three requests:**
*"I want all input fields in 1 column. I don't want them to mix with other things. That's why I'm
trying to get the time grid in the coloumn. However I know it's a big thing to have in one column."*

**That principle cannot be held with the figure columns there, and the arithmetic is why.** An
answer lives in track 2, which is **78px of 312 at 390** with the multiplier, the rate and the total
behind it — and eleven hours in 78px is a **seven-pixel cell**. So either the week spans the figure
tracks and mixes, which is the complaint, or the figure tracks give their width up when they hold
nothing. There is no third arrangement: the week needs 244px and the card has 312.

**So the answer column is the wide one until figures need the room.** `.bk-v` spans `2 / -1`, which
is exactly where `.bk-open` puts the week — measured on the form at three widths, **the dash and the
grid now share both edges**: `[111, 351]` at 390, `[93, 287]` at 320, `[295, 549]` at 768.

### This rule has been written, reverted and written again, and the third time has a reason

**Written from *"the grid shouldn't extend beyond the 1st coloumn like the other fields"*; reverted
from *"what happened to all the columns I had before for things like multiplier"*.** Both reports
are about one edge and they wanted it in different places, which is why it flip-flopped.

**What the revert was about is answered by the header rather than by the columns.** "What happened
to all the columns" is a question about columns that vanished with nothing saying so. `spineHead_`
names them, so `× +/h +` appear **labelled** the moment there is a figure to put under them,
and their absence on an unpriced form reads as *nothing is priced yet* instead of as something
having gone missing. **Proved by the waiting-list state**, which is the one branch the fixture can
price: it carries an `About` total, so the columns are there, `TOTAL` sits over `£144.00`, and the
dash correctly stops at 189 while the week runs to 351.

**`:has` reads the card's own totals** rather than a flag somebody sets, so there is no second place
for "is this priced" to be wrong — and **the header is excluded from its own test**, which is the
line that is easy to get wrong. `spineHead_` writes `+` into a `.bk-t`, so a plain
`:has(.bk-t:not(:empty))` is true on every card and the rule could never fire. The descendant is
`.bk-row:not(.is-cols)`.

### The column headings existed once and were deleted for being big

**The note where they were says they were *"six words explaining a layout nobody was confused by,
and the widest band of text on the card"*.** Half of that has stopped being true — the report that
brought them back is somebody counting the columns and asking which is which — and the other half is
exactly why the word **Small** was in the request. `.58rem` of tracked uppercase in the faint ink,
reading as a caption rather than as a row of the document.

**The stub head was blank**, which is what a table does with the column its row names live in, and
**the value column's word came from the caller** — `Answer` on the form and `Detail` on the receipt,
because the two documents are not the same sentence. **Both are gone**, and the entry stays because
the arithmetic below it is what somebody needs: the owner later dictated the five heads glyph by
glyph — `Q A × +/h +` — so the stub is named, the word is the same on both documents, and `cols` is
a flag rather than a string. See *"Five column heads, dictated column by column"* below.

### It cost 11px on the one card that had 8, and where they came back is the entry

**`check/ui.js` named it immediately**: the waiting-list branch runs 812px of content into an 805px
pane at 768, and its own note already records it arriving with **three pixels spare at 390 and eight
at 768**. A header at an ordinary line-height put it 11px past the fold.

| | |
|---|---|
| **the `.rc-rule` above the rows** | **8px.** A rule and a dashed border under the header is two lines doing one job, and the second is labelled. Without a header the rule stays, because then nothing else closes the block above off |
| **the header's own spacing** | 17.8px → **12.1px.** 1.15 rather than 1.4, almost no padding under the words, and no margin under the rule — a `.bk-row` has none either, and the border IS the separation |
| **`.bk`'s top margin** | `.4rem` → `.15rem`, off `:has`, because that margin was sized for a rule and its `.22rem` that are no longer there |

**Measured after: `under: 0` on all four states at all four widths**, no sideways scroll, and all 37
checks pass. **Nothing redundant was found on that card first** — its blocks were listed and the
tiles are 44px targets, the terms line is a link and the summary is content — so the header paid for
itself rather than being funded by something else's headroom.

### A question the other branch answers, printed under the answer

**Reported as "When free field is redundant now as we are using the grid bit."** Measured on the
ordinary form before anything was changed: a row reading `When free  —`, **no control, no week, and
nothing that can ever fill it** — sitting directly under the `When` row, which is 186px of hour grid
that had just answered the same question to the hour.

**It could not be answered there by construction.** `stepGrid_` draws the blocks only on the waiting
branch and `avail`'s `options()` is empty, so `stepControl_` draws nothing either. A question with
no way to answer it, printed under the answer.

**THE RULE IS THE ONE `only:` ALREADY STATES**, and the distinction it draws is why this is a
deletion rather than a lock. `SPINE`'s own argument — *"a document whose SHAPE changes with its
contents cannot be read at a glance: you find a line by where it is"* — is about a row you have not
answered **yet**: you are about to, and a line appearing under your thumb moves everything below it.
**A row this BRANCH can never answer was never on this document**, because an ordinary booking does
not become a waiting list. That is the same sentence that took six rows off the ordinary form when
`only:` was written.

**`When` IS NOT MARKED AND THAT ASYMMETRY IS DELIBERATE.** On a waiting list it is a dash too — and
it says *no day yet*, which is **true of that booking** and becomes a real day once the list fills.
`When free` on an instant booking is not a fact about the booking; it is a question already answered
one row above, more precisely, by the grid that prompted the complaint.

### The flag has to be read in three places or the row comes straight back

**`SPINE` is built from every step's `short`.** So a question `stepRows_` correctly drops is
re-invented by `spineRows_` two hundred lines down, as a dash, under the same name — **the row
removed and then added back by the same card**. `ONLY_ON` reads `BOOK_STEPS` as well as
`SPINE_EXTRA` now, so the flag is declared once beside the row it belongs to wherever that row is
declared.

**And `nextBookStep` skips it too, which changes nothing today and is the point.** That loop already
passes over a question with no options, so `avail` was never asked. Without the guard, `only:` would
mean two different things — *not drawn* to one walker and *still asked* to another — and a
branch-only step added tomorrow **with** a list would be dropped from the card and then asked by the
funnel: a question on screen that the document it belongs to has no row for.

**`bookOn_()` is the one reader.** `isWaiting_() ? 'wait' : 'book'` was written out at the
`spineRows_` call site and would have been written out twice more; three copies of which branch this
is, on a card whose two branches differ in seven rows, is the second reader this file keeps finding
— `documents_()`, `paperIdOf_`, `factsNow_`, `childrenOf`.

**Measured after**: the ordinary form loses the row and gains no dash in its place, the waiting-list
card is unchanged with its blocks ticked and its summary reading `Mon · Tue evenings`, and the
receipt is untouched because it is built with `fill: false` and never invented the row anyway.

#### `check-flow` refused it, and this time the refusal was half right

**The journey *"the paper keeps the same rows whatever is answered"* failed immediately**, naming
`When free` — which is the check doing exactly what it was written for. The last time this happened,
over `Asked for`, the refusal was right and the row stayed.

**It is not right here, and the distinction is one this file already draws.** That journey's fault
was rows vanishing when you ANSWER — *"answering a level made Kind, When, Term, Split, Child, For
and Tutor disappear off the card while still being asked"*. `blank` against `priced` is that half
and is compared whole, untouched. Across the BRANCH it is narrowed to what the code declares, by
reading `only:` off `BOOK_STEPS` rather than listing names in the check — which is the same sentence
`SPINE_EXTRA` has carried since four derived rows were given the flag, and it is the first time a
QUESTION has one.

**AND THE TWO SHAPE COMPARISONS CANNOT FIRE ANY MORE.** Measured on four mutants rather than
assumed: `stepRows_` pushes a row for every step answered or not, and `spineRows_` invents a dash
for any spine row neither builder produced — so dropping **Subject and Level** from the waiting
branch leaves the shape identical, the row coming straight back under the same name two hundred
lines later. Turning the form's `fill` off changes nothing either, because no question row was ever
missing to be filled. **Both halves of the fault that journey is named for have been structurally
impossible since the spine was written**, and nothing anywhere said so.

**`ONLY_ON` is the only route left by which a question row can vanish**, which is why the live
assertions are the two `only:` ones: a branch-only question must be ON its own document and OFF the
other, and the flag-does-nothing mutant is the one that fires. **The comparisons are kept**, for the
reason `check-funnel.js` test 2 is kept after the spelling fold made it unfirable — it is where the
invariant is written down, `!blank` still fails if the paper stops drawing questions at all, and
both come back to life the day anything upstream stops guaranteeing them. What is not kept is the
pretence: the journey's note now says which half is load-bearing, because a rule that cannot fail
under a confident comment about what it protects is a green light with nothing behind it.
