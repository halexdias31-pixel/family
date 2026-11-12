# js/me-settings.js

The full text of comments in `js/me-settings.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### THE NEXT UNUSED SLOT.

top level, before `qualTake_`

```
/* THE NEXT UNUSED SLOT. Moving the element keeps every `data-me` in the form, so a save posts it
   wherever it sits. The `+` is off once the pool is empty (see `qualShelf_`), so this sentence is for a
   press that raced a redraw. */
```

### AN EMPTY SLOT, MOVED OUT OF THE POOL AS A NEW LINE AT THE FOOT OF THE LIST, open, emptied and marked new — so a Done or a bin before it has a

top level, before `qualStart_`

```
/* AN EMPTY SLOT, MOVED OUT OF THE POOL AS A NEW LINE AT THE FOOT OF THE LIST, open, emptied and marked
   new — so a Done or a bin before it has a subject and a level puts it back unsaved. */
```

### ONE CARD ONLY (489, the owner on Library cards: "change this to be only 1 card allowed") — the one already filled, else the first; no Add

in `libraryShelf_`

```
/* ONE CARD ONLY (489, the owner on Library cards: "change this to be only 1 card allowed") — the one already
     filled, else the first; no Add another, and a new card is written over it. */
```

### THE BARS FOLLOW THE NUMBER as it is typed, the photograph shelf's thumbnail one rule down:

top level, before `t`

```
/* THE BARS FOLLOW THE NUMBER as it is typed, the photograph shelf's thumbnail one rule down: the card
   is a preview of itself, so what is printed under the bars and the bars cannot disagree. */
```

### THE PREVIEW FOLLOWS THE BOX as it is typed into, so the check above does not wait for a Save.

top level, before `t`

```
/* THE PREVIEW FOLLOWS THE BOX as it is typed into, so the check above does not wait for a Save. One
   listener for the document, which is how every other input here is heard. */
```

### ---------- AN EXTRA PHOTO IS UPLOADED, NOT LINKED (owner, 8 Nov): redrawn here at 1200px JPEG, kept in Drive by

top level, before `PHOTO_EDGE_`

```
/* ---------- AN EXTRA PHOTO IS UPLOADED, NOT LINKED (owner, 8 Nov): redrawn here at 1200px JPEG, kept in Drive by
   `photoFile`, and its link put in the slot's box so Save keeps it with the rest of the card. */
```

### `change`, NOT A `data-do` CLICK — a file input reports its choice by changing, the camera's `cam-pick` argument.

top level, before `inp`

```
/* `change`, NOT A `data-do` CLICK — a file input reports its choice by changing, the camera's
   `cam-pick` argument. The value is cleared so choosing the same picture again still fires. */
```

### EITHER SHAPE. The backend's group list names COLUMNS, so today it says `date_of_birth` — and `isDob_` is asked as well so a deployment that ever

in `fieldsHtml`

```
/* EITHER SHAPE. The backend's group list names COLUMNS, so today it says `date_of_birth` — and `isDob_` is asked as well so a deployment that ever sends the § */
```

### THE PHOTOGRAPH SHELF GOES UNDER THE REST, not over it as the library one does:

in `fieldsHtml`

```
/* THE PHOTOGRAPH SHELF GOES UNDER THE REST, not over it as the library one does: the page
       reads profile photo, video, then the others, which is the order somebody thinks of them in. */
```

### The sheet writes TRUE/FALSE as text and the payload sends real booleans; rows written by older versions send neither consistently.

top level, before `TRUEish_`

```
/* The sheet writes TRUE/FALSE as text and the payload sends real booleans; rows written by older
   versions send neither consistently. One reader for all three. */
```

### NOT A COPY SOMEBODY IS IN — a box focused and not yet typed into is not dirty, and redrawing it would take the caret away

in `libCardsRedraw_`

```
/* NOT A COPY SOMEBODY IS IN — a box focused and not yet typed into is not dirty, and redrawing it would
     take the caret away (`landRepaint_`'s reason). It is drawn the next time it is started. */
```

### ---------- EVERY SETTINGS FIELD SAVES AS YOU TYPE (owner, 8 Nov)

top level, before `AUTOSAVE_MS`

```
/* ---------- EVERY SETTINGS FIELD SAVES AS YOU TYPE (owner, 8 Nov) ----------
   ~800ms after the last change a card sends itself: no Save button, a small tick when it lands, a toast when it fails. */
```

### GATHERED BEFORE `send_` LOCKS THE CARD.

in `meSave_`

```
/* GATHERED BEFORE `send_` LOCKS THE CARD. The lock disables every box, and this skips a disabled
     one on purpose (a locked field is not an answer) — so gathering afterwards would post nothing. */
```

### NOT SENT YET, AND THE CALLER IS TOLD SO — a refresh that ends in `saveNow` saves the card, but an editor waiting on this would otherwise wait for

in `meSave_`

```
/* NOT SENT YET, AND THE CALLER IS TOLD SO — a refresh that ends in `saveNow` saves the card, but
       an editor waiting on this would otherwise wait for ever on the path that never calls back. */
```

### AND THE PROGRESS COLUMN, whose journey card counts down to the two exam dates on About you (`progressRedraw_`, js/arcade.js) — not left to the

in `saveNow`

```
/* AND THE PROGRESS COLUMN, whose journey card counts down to the two exam dates on About you (`progressRedraw_`, js/arcade.js) — not left to the payload this § */
```

### THE CARD IS REDRAWN WHEN AN ADDRESS WAS TYPED — the line under the box and the tile beside Save come and go with a waiting address, and nothing

in `saveNow`

```
/* THE CARD IS REDRAWN WHEN AN ADDRESS WAS TYPED — the line under the box and the tile beside Save come and go with a waiting address, and nothing else repaints § */
```

### A QUALIFICATION WITH NO SUBJECT, ASKED OF A FORM — lifted out of `meSave_` so the card's own Save (`card-save`) refuses exactly what a Settings

top level, before `QUAL_NAMELESS_SAY_`

```
/* A QUALIFICATION WITH NO SUBJECT, ASKED OF A FORM — lifted out of `meSave_` so the card's own Save
   (`card-save`) refuses exactly what a Settings card refuses, in the same words. */
```

### THE FIELD NAMES THAT ARE HALVES OF ONE CELL — see the old-server note in `me-save`.

top level, before `PACKED_FIELD_`

```
/* THE FIELD NAMES THAT ARE HALVES OF ONE CELL — see the old-server note in `me-save`. Hour codes are
   a day prefix and an hour; the rest are the prefixes `fieldsHtml` expands a packed column into. */
```

### AND THE LIBRARY CARDS ON TOOLS (docs/history/339), and their starred copy on Saved — a `.me-form` in a widget's slot, kept by the same two lines

top level, before `KEEP_FORMS_`

```
/* AND THE LIBRARY CARDS ON TOOLS (docs/history/339), and their starred copy on Saved — a `.me-form` in a
   widget's slot, kept by the same two lines for the same reason: they were a Settings card until 11 Oct. */
```

### AND SAVED, WHILE THE LIBRARY CARDS ON THEM HOLD TYPING (docs/history/339) — the one form a widget slot holds.

in `settingsKeep_`

```
/* AND SAVED, WHILE THE LIBRARY CARDS ON THEM HOLD TYPING (docs/history/339) — the one form a
     widget slot holds. The rest of the column waits with it, as the rest of Settings waits with a card. */
```

### RETURNED, so a caller waiting on a copy it can trust (the card editor, `cardFetch_`) knows when the question has been answered either way — every

in `profileRefresh_`

```
/* RETURNED, so a caller waiting on a copy it can trust (the card editor, `cardFetch_`) knows when the
     question has been answered either way — every other caller ignores it, as before. */
```

### AN OLD SERVER, NOT A FAULT.

in `profileRefresh_`

```
/* AN OLD SERVER, NOT A FAULT. "That action is not recognised" is the server saying it predates
         this site — remembered, so the next save does not ask again, and never shown raw. */
```

### AND YOUR CARD, WHEN IT IS OPEN FOR EDITING — it is drawn from this copy (`cardEditHtml_`), and one still waiting for a copy it can trust

in `profileRefresh_`

```
/* AND YOUR CARD, WHEN IT IS OPEN FOR EDITING — it is drawn from this copy (`cardEditHtml_`), and one still waiting for a copy it can trust (`profileShapeOk_`) is § */
```

### AND THE PROGRESS COLUMN, the same rule:

in `profileRefresh_`

```
/* AND THE PROGRESS COLUMN, the same rule: its journey card counts down to the exam dates in this
         copy, which a Save on another phone may have moved (`progressRedraw_`, js/arcade.js). */
```

### AND THE LIBRARY CARDS ON TOOLS, which are drawn from this copy and are a widget now, not a page this column repaints (docs/history/339).

in `profileRefresh_`

```
/* AND THE LIBRARY CARDS ON TOOLS, which are drawn from this copy and are a widget now, not a page this
         column repaints (docs/history/339). `libCardsDraw_` leaves a copy with typing in it alone. */
```

### `change-pin` opened a sheet of its own.

top level, before `v`

```
/* `change-pin` opened a sheet of its own. It is three fields at the bottom of `edit-me` now — the
   sheet that already exists for changing your details, which a PIN is one of. */
```

### ---------- THE INTRO VIDEO, UPLOADED (8 Nov): a file, not a link — about a minute, 100 MB at most, checked here before

top level, before `VIDEO_MAX_MB_`

```
/* ---------- THE INTRO VIDEO, UPLOADED (8 Nov): a file, not a link — about a minute, 100 MB at most, checked here before
   anything is sent, then sent in 4 MB parts (`videoPart`) to the owner's private Drive folder. */
```

