## The Find screen holds fifteen pages and has five thousand

**The fix the entry above called "the real one" and deferred.** It said: *"it is still one element
per row — the deferred half just moves the work off the tap. The honest fix is a strip that holds a
window of page ELEMENTS rather than one per result."*

### A page number and a DOM position are no longer the same number

**`PAGE_KEEP[id]` and `PAGE_LO[id]` in shell.js are the whole of it** — how many leading pages are
always present (the question, the saved things, the booking pages, which hold ids and may not be
recycled), and how many pages beyond those have been scrolled past and are not in the document.
`domIndex_` and `logIndex_` map one to the other, **both are nought on every other screen**, so a
column that builds all of its pages maps every page to itself and is untouched by construction.
That is what made it safe to put on the path every column shares.

**Everything that treated the two as one number now goes through them**: `columnShift_`, `stepY_`,
the fade sweep in `placeGrid`, `goPage`'s empty-page test, and `fillStuffPages`.

**The elements are recycled, not rebuilt.** Sliding down by one moves the top page to the bottom, so
every other page keeps the card it was already showing and turning a page still draws exactly one
card. Clearing the window on each slide would have been four lines shorter and would have redrawn
eleven cards every few turns. **Re-centred only within `STUFF_EDGE` of an end**, so most turns move
nothing at all.

**And `paintStuff` throws the window away and remakes it**, which is the cheap option now rather
than the expensive one: there are never more than fifteen, and starting from nothing means the
offset cannot be left describing a strip that no longer exists.

### Three more things were hiding behind the DOM cost

| | |
|---|---|
| **the search haystack** | six fields joined and `norm`ed for all 5,354 items **on every keystroke** — 126 ms at 8x, about 2.7 MB of string work to answer "does this contain `work`". `x.text` was built once onto the item and the join around it was not. Cached as `_hay`, which is the rule this file already states twice |
| **the sort** | ran over the FILTERED list on every tap, and none of it depended on the filter: the order is a key held on the item. The SOURCE is sorted once and `filter` keeps the order |
| **`PAGER.stuff`** | built 5,226 strings — `(i + 1) + ' of ' + n` — to be counted. The names were read by a header that no longer exists, so `pageCount` takes a number now and that entry answers with one |

| at 12x CPU — an ordinary mid-range phone | before tonight | after |
|---|---|---|
| answering a question | 340 ms | **119–142 ms** |
| a keystroke | 233 ms | **57 ms** first, **40–45 ms** after |
| **turning a page** | inside the 264 ms repaint | **6–12 ms** |
| page elements held | **5,227** | **16** |

### The journey that caught it was right and had a second opinion in it

**`check-flow`'s pager journey failed on the first run**: *"stuff: 1 page drawn, pager counts
undefined"*. It read `PAGER[id]().length` — **a second definition of how many pages a screen has**,
which broke the day an entry started answering with a count. It asks `pageCount` now, the one
definition, and it knows that a windowed screen's element count is capped on purpose: the question
is the same one, and what `drawn` is compared against is the number of pages the screen is able to
hold. **Proved by mutation**: a `PAGER.stuff` that forgets the leading pages still fires it.

### And nothing in the suite could see a card in the wrong position

**That is the fault this change can actually cause**, and it is invisible to everything: a question
rendered at the wrong page number measures perfectly, lays out perfectly, presses perfectly, and is
the wrong question. So `check/press.js` walks all 41 pages of the May 2017 Foundation paper
**forwards and then backwards** — both, because the window recycles by moving elements from one end
to the other and an off-by-one shows up only when you arrive from the other side.

**Asserted on the answer box's key** (`ans:…:q:<row_id>`), which is the one thing on a question card
that names the row it was built from: `Q6(i)` and `Q6(ii)` both start `Q6`, and my own throwaway
probe reported those two as failures for exactly that reason before the real check existed.
**Proved by mutation**: `domIndex_` returning its argument names 52 wrong pages and exits 1.
