# js/check-spine.js

The full text of comments in `js/check-spine.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-spine.js THE BOOKING FORM AND THE RECEIPT ARE ONE DOCUMENT AT TWO MOMENTS, AND NOTHING ENFORCED IT.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-spine.js

   THE BOOKING FORM AND THE RECEIPT ARE ONE DOCUMENT AT TWO MOMENTS, AND NOTHING ENFORCED IT.

   They were built by two functions — `bookBreakdown` for the form, `jobRows` for the receipt — that
   had drifted apart line by line over months. The form said `Seats`, the receipt said `Students`.
   The form said `Space`, the receipt said `Host`. The receipt had `Running`, `Weeks left` and
   `About`; the form had `Kind`, `Class`, `Split` and `When free`. Their orders disagreed. Every fix
   made all evening had to be made twice, and at least twice it was made once.

   `SPINE` IN book.js IS NOW THE ONE ORDER and `spineRows_` imposes it on both. This is what stops
   that being undone: it reads the file, finds every row label either builder emits, and fails if
   one of them is not on the spine.

   WHY A CHECKER AND NOT JUST THE SHARED FUNCTION. Sharing `spineRows_` makes the two AGREE about
   order. It cannot stop somebody adding `push('Deposit', …)` to one builder and not the other — the
   row would simply fall to the end of one document and be absent from the other, silently, which is
   exactly the failure this whole exercise is about. A label that is not on the spine is either a
   row that belongs on both and has not been added, or a row that belongs on neither.

   RUN IT:  node js/check-spine.js
================================================================================================== */
```

### ---------- THE SPINE IS BUILT FROM THE FORM NOW, SO IT IS BUILT HERE THE SAME WAY

in `run`

```
/* ---------- THE SPINE IS BUILT FROM THE FORM NOW, SO IT IS BUILT HERE THE SAME WAY --------------
     It used to be a literal array and this read it. It is now derived: every `short` on
     `BOOK_STEPS`, in order, with the non-question rows pinned after the step they belong with. So
     this replays that — which also means the checker fails if the derivation stops matching, rather
     than checking a list that no longer exists. */
```

### ---------- AND A WEEK STEP CONTRIBUTES SEVEN ROWS, NOT ITS `short`

in `run`

```
/* ---------- AND A WEEK STEP CONTRIBUTES SEVEN ROWS, NOT ITS `short` -----------------------------
     `short: 'When'` NAMES NO ROW ANY MORE. The day names are the questions — see `weekRows_` — and
     `short` survives only as the anchor `SPINE_EXTRA` pins `Per session` to. Replayed here rather
     than assumed, because this checker exists to fail when the derivation stops matching: without
     it, `When` and `When free` were reported as rows nothing fills, which is a checker describing a
     card that is not on the screen. Both week steps answer the SAME seven, so they are deduped
     exactly as `SPINE` dedupes them. */
```

### SCANNED TO THE END OF THE STEP OBJECT, not to the end of the line.

in `run`

```
/* SCANNED TO THE END OF THE STEP OBJECT, not to the end of the line. `avail` writes `short` on its
     first line and `week: true` on its third, so a one-line lookahead found `slots` and missed it —
     and a checker that sees six of the seven day rows and one phantom `When free` is worse than one
     that cannot run. `},\n` closes a step, and `[\s\S]` has to stop there or every step after a
     week step would be counted as one too. */
```

### AN EXTRA PINNED TO A STEP THAT IS GONE.

in `run`

```
/* AN EXTRA PINNED TO A STEP THAT IS GONE. It still reaches the spine — it is appended rather than
     dropped — but at the end, nowhere near where it was meant to be, which on a document read by
     position is as good as wrong. Said plainly rather than left to be noticed. */
```

### ---------- EVERY LABEL EITHER BUILDER PUSHES

in `run`

```
/* ---------- EVERY LABEL EITHER BUILDER PUSHES -------------------------------------------------
     `push('Subject', …)` in both functions. Read by pattern rather than by running the code,
     because running it would need a whole booking and a whole payload — and the point of this
     checker is that it costs nothing to run. */
```

### ---------- A DAY ROW IS FILLED BY `weekRows_`, NOT BY A `push`

in `run`

```
/* ---------- A DAY ROW IS FILLED BY `weekRows_`, NOT BY A `push` --------------------------------
     IT TAKES ITS LABEL FROM `SLOT_DAYS`, so there is no literal for the pattern above to find and
     all seven were being reported as rows that print a dash on every document for ever. They are
     the opposite: both builders fill them and one of them always does. Counted as pushed when some
     step is marked `week: true`, which is the same fact the spine half of this checker reads. */
```

### ---------- AND THE OTHER DIRECTION

in `run`

```
/* ---------- AND THE OTHER DIRECTION ------------------------------------------------------------
     A spine row nothing ever pushes is a row that prints a dash on every document for ever. That is
     not an error — `Asked for` is legitimately blank until a job exists — but a spine full of rows
     nothing fills is a spine nobody trusts, so it is reported as something to look at. */
```

