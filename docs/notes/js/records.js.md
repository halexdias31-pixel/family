# js/records.js

The full text of comments in `js/records.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### BUSINESS RECORDS — insurance, tax, legal, safeguarding:

top level, before `BIZ_SOON_DAYS`

```
/* ==================================================================================================
   BUSINESS RECORDS — insurance, tax, legal, safeguarding: the paperwork a tutoring business keeps.

   A COLUMN OF THEIR OWN, THE LAST ONE, FOR AN ADMIN AND NOBODY ELSE. They were a widget on the Tools
   column, a register you added rows to. *"no the business stuff should not be on tools it should be on
   the account settings column. only admin sees. also it should be like everything else, like e.g.
   public liability insurance:________ then i have to enter that bit in."* So it is a FORM, shaped like
   every settings page: a fixed list of things, each a caption with its boxes beside each other (the
   library shelf's `.lib-row`), and one Save per page through `send_`.

   AND THEN OUT OF SETTINGS. *"the business checklist stuff should go in their own column at the end."*
   (the owner, 10 Oct). Settings is about YOU — your details, your PIN, your emails — and five cards of
   the business's insurance and tax at its foot were the one part of it that was not. So the same five
   cards are `screen('biz')` below, the last column, drawn and saved exactly as they were; `bizStart_`
   fires when the column is drawn for an admin (and again, harmlessly, on arrival). The column is in `TABS` for an admin only —
   `columnsFor_` in shell.js leaves it out for anybody else, section and all (docs/history/334). A
   card typed into is kept as it was on Settings: `.me-form[data-dirty]` and `settingsKeep_` (me.js)
   cover this column too.

   A FIXED LIST RATHER THAN A REGISTER, and that is the whole of what changed. Each item has a slug
   (`pub_liability`) that is its `record_id` in the Ledger's `records` tab, so the tab keeps its shape
   and a row is found by what it IS rather than by an id the phone invented. What somebody fills in
   is a reference and a date — and for insurance, who provides it. It is advice about what to keep,
   not a statement of what the law requires of this business: employers' liability and Companies
   House depend on how the business is set up, and the placeholders say so.

   THE DATE IS MARKED WHEN IT IS NEAR, which is what the register was for: past it and the caption
   says Overdue, within thirty days Due soon. Only on a date that is a DEADLINE — a registration or
   the day an account was opened is in the past on purpose, and calling it overdue would be a red
   flag on something that is fine. `track: false` says which.

   A POST AND NEVER THE PAYLOAD — see backend/records.gs. `listRecords` is asked once, when the Business
   column is first drawn for an admin (`bizStart_`, from `screen('biz')`; arriving asks too, and finds it
   asked). Until it answers, Save
   refuses: a page saved before the rows arrived would post six empty boxes over whatever the sheet
   holds.
================================================================================================== */
```

### THE CARD'S OWN LINE SAYS ONLY A REFUSAL NOW.

top level, before `bizSaid_`

```
/* THE CARD'S OWN LINE SAYS ONLY A REFUSAL NOW. It said "Fetching what is recorded…" under Save on all
   five cards while `listRecords` was out — a wait in words of its own, with the boxes empty and
   live beneath it. The wait is the one loader over the boxes (`bizCard_`). */
```

### EACH BOX A DRAFT UNTIL ITS CARD IS SAVED (data.js; docs/history/317):

in `bizItem_`

```
/* EACH BOX A DRAFT UNTIL ITS CARD IS SAVED (data.js; docs/history/317): a provider, a reference and a
     date typed and not yet saved went with a reload. Drawn holding the draft, with the recorded value as
     the one that takes it away (`bizFill_` keeps that value current once the records arrive). */
```

### ---------- UNTIL THE SHEET HAS ANSWERED, THE BOXES ARE UNDER THE ONE LOADER

top level, before `bizCard_`

```
/* ---------- UNTIL THE SHEET HAS ANSWERED, THE BOXES ARE UNDER THE ONE LOADER ---------------------------
   MEASURED ON 9 Oct with `listRecords` held: five cards, every box empty and editable, "Fetching what
   is recorded…" under Save, and a Save that answered with a toast. A box typed into then made the
   card one `bizFillAll_` leaves alone, so what the sheet held never reached it. The owner, 9 Oct:
   *"They should all have a simplistic simple loading thing while it's info or whatever is loading."*
   So the boxes and Save are drawn as they will be and veiled by `loading_()` (shell.js): the card is
   its finished size from the first frame, the dots sit over the room the dates will fill, nothing can
   be typed into a box about to be overwritten, and `bizFill_` takes the loader off as it fills them —
   in place, so nothing on the card moves. The title stays out of it, so you can see which card it is. */
```

### THE PAGES, OR NONE. A card is not a permission — `listRecords` and `saveRecordsPage` are `admin` in `ACTION_ACCESS` — but a page a non-admin cannot use is a

top level, before `bizPages_`

```
/* THE PAGES, OR NONE. A card is not a permission — `listRecords` and `saveRecordsPage` are `admin` in
   `ACTION_ACCESS` — but a page a non-admin cannot use is a page they should not have to swipe past.
   Asked here as well as by `columnsFor_`, which already leaves the column out for them: a state that
   plays a parent on an admin's phone (check/states.js) paints this column without a sign-out, and it
   draws nothing rather than an admin's form for a parent. */
```

### THE COLUMN, AND ITS RECORDS ASKED FOR AS SOON AS IT IS DRAWN FOR AN ADMIN — not when it is arrived at.

top level, before `bizFill_`

```
/* THE COLUMN, AND ITS RECORDS ASKED FOR AS SOON AS IT IS DRAWN FOR AN ADMIN — not when it is arrived at.
   On a wide screen it sits beside Progress, on the glass, and asking only on arrival left its first card
   under the loader for as long as nobody went there; the owner, of exactly that: *"these remain loading
   untill i scroll to them. i dont like this"* (10 Oct, docs/history 331/334). `bizStart_` asks once and
   is a no-op after, so a repaint asks nothing new; after the draw, not during it, so a POST is never
   part of building the markup. Nothing on the column runs, so nothing is stopped on the way out. */
```

### WHAT ARRIVED, WRITTEN INTO THE CARDS ALREADY ON THE PAGE rather than a repaint of the column.

top level, before `bizFill_`

```
/* WHAT ARRIVED, WRITTEN INTO THE CARDS ALREADY ON THE PAGE rather than a repaint of the column. A
   repaint throws away every pane's fitted zoom and the column is re-measured a frame later; filling
   the boxes in place changes a few values and a caption, and the cards stay the elements
   `paneWatch_` is already watching. A card with something typed into it is left alone — the same
   rule `settingsKeep_` applies to the whole column. */
```

