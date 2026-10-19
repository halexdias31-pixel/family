# js/price-rows.js

The full text of comments in `js/price-rows.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — price-rows.js ONE FILE, SPLIT.

top level, before `PRICE_ROWS`

```
/* ==================================================================================================
   @family. — price-rows.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   price-rows.js is number 2 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### ---------- THE PRICE BREAKDOWN, AS DATA

top level, before `PRICE_ROWS`

```
/* ---------- THE PRICE BREAKDOWN, AS DATA ------------------------------------------------------
   Carried over whole. Every priced row on the card is declared ONCE here, and both the renderer
   and the refresher walk this same list — which is what stops a row being drawn and never updated,
   or updated after it stopped existing.

   `priceCells` and `runningAfter` were carried over at the rewrite and this table was not, so both
   were sitting in the file with nothing to walk. That is why the booker could only manage a per-
   hour figure and a total: the machinery for the full chain was already here and had no list.
--------------------------------------------------------------------------------------------- */
```

### Weeks are known as soon as an interval is chosen — they come from its own dates.

in `PRICE_ROWS`

```
/* Weeks are known as soon as an interval is chosen — they come from its own dates. Gating this
       on the session-date list meant a chosen interval showed no multiplier until the dates
       resolved, which is a later and separate question. */
```

### Until days are ticked, the interval only says how many WEEKS are left — not how many sessions, because a client may book one day a week or three.

in `PRICE_ROWS`

```
/* Until days are ticked, the interval only says how many WEEKS are left — not how many
       sessions, because a client may book one day a week or three. Stating a count here was a
       guess shown in the same column as settled figures. */
```

### THE ORDER MATTERS. Each of these multiplies what the ones above it have already produced, so its `of` is the running total at its own point in the chain — not

in `PRICE_ROWS`

```
/* THE ORDER MATTERS. Each of these multiplies what the ones above it have already produced, so
     its `of` is the running total at its own point in the chain — not the bare rate. Writing the
     bases out by hand is how two rows came to share one, which made the breakdown £13.67 short of
     the price it was breaking down. `rateBase` derives each from the order below. */
```

### Says WHERE the fraction came from, for an admin.

in `PRICE_ROWS`

```
/* Says WHERE the fraction came from, for an admin. A tutor's own setting and the site default
       produce identical-looking multipliers, so a setting that isn't reaching the price is
       indistinguishable from one that is — which is exactly how 1.5 kept applying while a tutor's
       0.25 sat in a column that didn't exist. */
```

### The count comes from the addresses.

in `PRICE_ROWS`

```
/* The count comes from the addresses. A number picked separately is a second statement of the
       same fact — choose 3, name 2, and neither the price nor the invitation list knows which is
       true. Naming someone IS splitting with them. */
```

### The bulk and booked-ahead rows lived here.

in `PRICE_ROWS`

```
/* The bulk and booked-ahead rows lived here. Removed for now, and their coefficients are
     ignored with them — leaving b and a applying with no row to explain them would be a price
     change nobody on the card could account for. Set them back to a live factor when the section
     returns; the rest of the machinery is unchanged. */
```

### Every money row reports the same thing:

in `priceCells`

```
/* Every money row reports the same thing: what the booking costs with this row and everything
     above it applied. The shape rows come first and report HOURS, because that's what they
     establish; from Tuition down, the figure is pounds for the whole booking. One unit per
     section, and the section boundary is where the unit changes. */
```

### Nothing to total yet — say WHY, on the row that's waiting for it.

in `running`

```
/* Nothing to total yet — say WHY, on the row that's waiting for it. Going blank here made the
       chain look like it had failed halfway: the rate rows above still showed figures, because a
       rate is knowable without hours, so the bottom half read as broken rather than as unanswered.
       The reason is stated once, on the first row that can't proceed, and the rows below it stay
       quiet rather than repeating it. */
```

### A scale of 0 means the question hasn't been answered — no length chosen, no interval — and it rendered as 'x 0 hrs, −100%', which describes a total discount

in `priceCells`

```
/* A scale of 0 means the question hasn't been answered — no length chosen, no interval — and
       it rendered as 'x 0 hrs, −100%', which describes a total discount rather than an empty
       control. Nothing chosen is nothing to say.
       A scale of exactly 1 is different depending on the row: for a COUNT (one session, one hour)
       it's a real answer worth stating, and it was being suppressed — leaving the interval row
       claiming no sessions beside a bulk row correctly reporting one. For a DISCOUNT it means the
       rule isn't applying, which is what `idle` explains. */
```

### The multiplier AND the percentage.

in `priceCells`

```
/* The multiplier AND the percentage. They are the same fact — x1.01 is +1% — and showing only
       one of them made rate multipliers look like a different kind of operation from the ones in
       the x column. They differ in WHERE they apply, not in what they are. */
```

### ---------- WHAT A TUTOR WROTE IN `teaches`, READ ONCE

top level, before `subjectIn_`

```
/* ---------- WHAT A TUTOR WROTE IN `teaches`, READ ONCE ------------------------------------------
   A tutor types one string per thing they teach — `Maths (GCSE)` — and it holds two facts. The
   rule for pulling them apart was written inline in `subjectRows`, twice in the same function, and
   `levelRows` below needs the same rule the other way round. Four copies of a regex is four places
   for the format to be understood slightly differently, so it is one pair of functions.

   THE BRACKET IS ONE LEVEL, not a list. `Maths (GCSE, A-Level)` reads as a single level named
   "GCSE, A-Level" — which is what this has always done, and it is left alone deliberately:
   splitting on the comma would change which tutors match which level, and that is a data decision
   for the sheet rather than something to slip in while moving a regex. If tutors are writing
   commas in there, the fix is two rows, not a cleverer parser. */
```

### A LEVEL, AS A THING RATHER THAN AS A SIDE EFFECT.

top level, before `levelRows`

```
/* ==================================================================================================
   A LEVEL, AS A THING RATHER THAN AS A SIDE EFFECT.

   A level has been three unconnected facts in three places: a word inside a tutor's `teaches`
   string, a key in the pricing tab's level multipliers, and an option on the booking form. Nothing
   joined them, so nothing could tell you that a level exists in one and not the others — and both
   of those gaps are real and both cost money:

     · A LEVEL NOBODY TEACHES is still offered on the booking form. A client picks it, and the job
       goes out to a list of tutors none of whom said they teach it.
     · A LEVEL WITH NO MULTIPLIER prices at 1 — no surcharge — and looks identical to a level
       deliberately set to 1. `priceFrom` says so in its own comment: most levels have never been
       given one. So A-Level may well be quoted at GCSE money and nothing anywhere says so.

   THREE SOURCES, UNIONED, is what makes those visible. Take only the dropdown and a level a tutor
   teaches but the sheet never listed disappears; take only what tutors teach and a level nobody
   covers yet is invisible exactly when you need to see it. The card carries where each one came
   from, so the gap reads as a gap rather than as a blank.
================================================================================================== */
```

### THE DROPDOWN FIRST, in its own order — that is the order the sheet chose and the order the booking form asks in, and a list of levels that runs GCSE, A-Level

in `levelRows`

```
/* THE DROPDOWN FIRST, in its own order — that is the order the sheet chose and the order the
     booking form asks in, and a list of levels that runs GCSE, A-Level, KS2 because that is how a
     Set happened to fill is a list nobody can scan. Anything the dropdown does not know about
     follows it, which is also where the eye should find it. */
```

### ---------- `tickCount` WAS HERE

top level, before `START`

```
/* ---------- `tickCount` WAS HERE ------------------------------------------------------------------
   It added up this person's ticks across every document, live, falling back to the `ticks` figure
   on the login reply when the payload had not landed. Both sources are gone: nothing writes a tick,
   the three columns that held them were stripped out of `data/questions.json` because they carried
   children's handles into a public repository, and the login reply no longer counts them.

   THE `Ticks` ROW ON THE YOU CARD WENT WITH IT rather than being shown a permanent 0 — a counter
   stuck at nought reads as "you have done nothing", which is the sentence this app has already been
   wrong with once, when `countTicks` read the person's row while `toggleTopicTick` wrote the
   document's. See the note where `tickRow` used to be in find.js. */
```

### A position is the board plus the four things you cannot see on it:

top level, before `newGame`

```
/* A position is the board plus the four things you cannot see on it: whose turn, what castling is
   still allowed, whether an en-passant capture is available, and the move count. Leaving any of
   them out is the usual way a chess implementation goes quietly wrong. */
```

