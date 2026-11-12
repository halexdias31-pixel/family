# js/me-shelves.js

The full text of comments in `js/me-shelves.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### AN ID OR THE ELEMENT ITSELF.

in `send_`

```
/* AN ID OR THE ELEMENT ITSELF. A settings card's status line is a CLASS, one per card — there are
     a dozen on one column, so it cannot be an id — and the caller already holds the element. */
```

### ONLY IF THE PAGE STILL HOLDS IT.

in `done`

```
/* ONLY IF THE PAGE STILL HOLDS IT. A reply that repaints the card replaces the element that
       had the caret, and focusing a detached node moves focus to the body -- which is worse than
       leaving it where the repaint put it. */
```

### Names that hold a yes or a no. Matched rather than listed, because the sheet grows columns and a list has to be remembered — `dbs_checked` and `is_listed` are

top level, before `FIELD_IS_BOOL`

```
/* Names that hold a yes or a no. Matched rather than listed, because the sheet grows columns and a
   list has to be remembered — `dbs_checked` and `is_listed` are booleans by their names. */
```

### `venues_ok` IS NOT A COLUMN of `people` — it is the venues tab's own `tutors_happy_here`, read and written through this one box.

top level, before `FIELD_MULTI`

```
/* `venues_ok` IS NOT A COLUMN of `people` — it is the venues tab's own `tutors_happy_here`, read and
   written through this one box. See `venuesWrites_` in core.gs for why there is no second copy. */
```

### WHICH OF YOUR OWN FIELDS KEEP A DRAFT — see the note in `fieldHtml`.

top level, before `setDraftOk_`

```
/* WHICH OF YOUR OWN FIELDS KEEP A DRAFT — see the note in `fieldHtml`. A SEVERAL-OF-A-LIST DOES NOW
   (`FIELD_MULTI` was refused here while its ticks lived in `#drop`; 315 put them in the card). */
```

### AND KEPT AS A DRAFT, as every other box on your own card is -- `draftFrom_` (data.js) skips a hidden input on purpose, so the ticks hand theirs over here.

top level, before `spec`

```
/* AND KEPT AS A DRAFT, as every other box on your own card is -- `draftFrom_` (data.js) skips a hidden
     input on purpose, so the ticks hand theirs over here. The saved list is the value that takes it away. */
```

### ANY field of a row places it, not only its first:

in `fieldRows_`

```
/* ANY field of a row places it, not only its first: a row can now read in a different order
       from the backend's list (the students range is min–max over a list that says max, min). */
```

### ---------- AND A GROUP OF `qual_N*` NAMES IS A SHELF OF QUALIFICATIONS

top level, before `isQualField_`

```
/* ---------- AND A GROUP OF `qual_N*` NAMES IS A SHELF OF QUALIFICATIONS -------------------------
   RECOGNISED BY THE NAMES, NEVER BY THE GROUP'S TITLE, exactly as the library shelf is. */
```

### EACH CAPTION IN TWO WORDINGS, a subject's and a certificate's, and the slot's `is-cert` says which is shown — so a line that becomes a DBS by a pick changes

in `qualSlot_`

```
/* EACH CAPTION IN TWO WORDINGS, a subject's and a certificate's, and the slot's `is-cert` says which
     is shown — so a line that becomes a DBS by a pick changes its captions with no redraw. */
```

### THE FACE OF A LINE: the subject (on a subject's first line only), the notation, the teaching mark — none on a certificate, which is held and not taught

top level, before `qualFace_`

```
/* THE FACE OF A LINE: the subject (on a subject's first line only), the notation, the teaching mark —
   none on a certificate, which is held and not taught (see `qualIsCert_`). */
```

### `Something else…` swaps the select for a box carrying the same attributes, so a save reads it exactly as it read the select — and it saves on the box's own

top level, before `sel`

```
/* `Something else…` swaps the select for a box carrying the same attributes, so a save reads it exactly
   as it read the select — and it saves on the box's own `change`, when the typing is finished. */
```

### A KEYBOARD STAYS WHERE IT WAS.

in `qualRedraw_`

```
/* A KEYBOARD STAYS WHERE IT WAS. The line that was pressed is replaced, and focus on a removed
     element falls to the page — so a line opened from the keyboard hands focus to its new self. */
```

### ON A CARD BEING EDITED THE SHELF IS PART OF THE CARD'S ONE DRAFT, and a redraw is a change no `input` reports — a line put back to the pool, a removal — so the

in `qualRedraw_`

```
/* ON A CARD BEING EDITED THE SHELF IS PART OF THE CARD'S ONE DRAFT, and a redraw is a change no
     `input` reports — a line put back to the pool, a removal — so the draft is written again here. */
```

### THE SLOT OPEN IN A FRESH SHELF — a saved line in its place, an empty one as a new line at the foot — with whatever was open before shut as it was last saved.

top level, before `qualReopen_`

```
/* THE SLOT OPEN IN A FRESH SHELF — a saved line in its place, an empty one as a new line at the foot —
   with whatever was open before shut as it was last saved. Answers the slot as it is in the new shelf. */
```

