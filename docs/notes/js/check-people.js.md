# js/check-people.js

The full text of comments in `js/check-people.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-people.js THE CELLS ON THE `people` TAB THAT HOLD MORE THAN ONE FACT, ROUND-TRIPPED.

top level, before `process.env.TZ`

```
/* ==================================================================================================
   @family. — check-people.js

   THE CELLS ON THE `people` TAB THAT HOLD MORE THAN ONE FACT, ROUND-TRIPPED.

   THREE COLUMNS ON THIS TAB ARE PACKED, and every one of them exists because the alternative is a
   numbered column — the fault CLAUDE.md records under `images`, under `needs`, under the practicals'
   `equipment_1 … equipment_10` and, in writing, over `library_card` itself. So:

     `availability`   77 tickboxes -> "m09,m10,…"           `availGridOut` / `availGridIn`
     `date_of_birth`   3 boxes     -> "15/09/1985"          `dobOut`       / `dobIn`

   AND TWO SETS OF BOXES THAT ARE ROWS ON TABS OF THEIR OWN since the people tab was redesigned —
   the qualification shelf on `qualifications` and the library cards on `library_cards`. They go
   through the same round trip: boxes to rows, rows back to boxes.

   NOTHING HAS EVER TESTED EITHER. They are the one shape where a fault is completely silent: a
   packer that drops a field writes a shorter cell, the form reloads with an empty box, and the
   person who typed it assumes they forgot. There is no error, no log and nothing on screen — which
   is this repository's oldest shape, and the reason `availGridIn` went eighteen months unexamined.

   WHAT THIS ASKS IS ONE QUESTION: pack what was typed, unpack it again, and get the same thing
   back. Plus the cases where the two halves are NOT symmetrical and the asymmetry is deliberate —
   a trailing empty card is dropped, a middle gap is kept, and a separator typed into a box is
   stripped rather than escaped.

     node js/check-people.js

   IT RUNS THE BACKEND'S OWN FUNCTIONS, cut out of the `.gs` by name and run in Node. Not a second
   implementation: a second implementation would agree with itself and with nothing else, which is
   the fault this file exists to catch one table along.
================================================================================================== */
```

### ---------- EVERY CASE IN THIS FILE RUNS IN A TIMEZONE BEHIND UTC

top level, before `process.env.TZ`

```
/* ---------- EVERY CASE IN THIS FILE RUNS IN A TIMEZONE BEHIND UTC --------------------------------
   NOT DECORATION, AND MEASURED. `new Date('2027-05-14')` is UTC MIDNIGHT, so it reads back as the
   13th anywhere west of Greenwich and as the 14th here — this container is UTC. So the ONE mutation
   that matters most to `isoDate_`, parsing the ISO branch with `new Date(<string>)` instead of
   matching it, passes every assertion below when the ambient zone is UTC and fails two of them in
   New York. A case that only fails somewhere else is a case that passes here by luck, which is this
   repository's own definition of a check that cannot fail.

   Set before the first `Date` is constructed, which is what Node reads it for. It makes the birthday
   cases stricter too and changes none of their answers: `dobOut`/`dobIn` build from local fields and
   `dobRefusal_` compares against `Date.now()`, so neither has a string for a zone to get wrong. */
```

### THE THIRD PACKED CELL, and the one whose unpacker has to read TWO different stored shapes:

in `SRC`

```
/* THE THIRD PACKED CELL, and the one whose unpacker has to read TWO different stored shapes:
     Sheets makes a real Date of a birthday typed into the spreadsheet, and this app writes a
     `dd/mm/yyyy` string. `sheetDate` is what tells them apart, so it is cut out too. */
```

### ---------- AND THE COLUMN THAT IS NOT PACKED AND IS STILL A RE-SPELLING

in `SRC`

```
/* ---------- AND THE COLUMN THAT IS NOT PACKED AND IS STILL A RE-SPELLING ----------------------
     `exam_small_date` HOLDS ONE FACT, so it is not a packed cell — and it is here for the same
     reason the three are: a value goes out in one spelling and comes back in another, and if the two
     halves disagree the picker opens EMPTY over a cell with a date in it and the next save writes
     the empty over it. Silent, exactly like a short `availability` cell. */
```

### THE FOUR APPS SCRIPT HELPERS THOSE FIVE REACH FOR, copied rather than imported — the same arrangement `check-handles.js` uses and for its stated reason:

top level, before `PRELUDE`

```
/* THE FOUR APPS SCRIPT HELPERS THOSE FIVE REACH FOR, copied rather than imported — the same
   arrangement `check-handles.js` uses and for its stated reason: if one of them changes meaning in
   `constants.gs`, a case here fails, which is what a stub is for. */
```

### ---------- THE FIELD LIST IS DERIVED FROM THE COUNT, so a fourth library is one number

top level, before `cards`

```
/* ---------- THE FIELD LIST IS DERIVED FROM THE COUNT, so a fourth library is one number -----------
   WRITTEN OUT HERE WOULD BE THE SECOND COPY. What this asks instead is that the list AGREES with
   the count — nine names for three cards — which is the thing that breaks if somebody edits one and
   not the other. */
```

### FIVE, BECAUSE THAT IS THE ASK — *"same with library cards (max 5)"*.

top level, before `cards`

```
/* FIVE, BECAUSE THAT IS THE ASK — *"same with library cards (max 5)"*. A number typed into a check
   is usually the second copy this repository warns about; here it is the requirement itself, so the
   check fails if somebody lowers the constant back without being asked to. */
```

### ---------- THE ROUND TRIP, WHICH IS THE WHOLE POINT

top level, before `cards`

```
/* ---------- THE ROUND TRIP, WHICH IS THE WHOLE POINT ---------------------------------------------
   Boxes -> rows (what `updateProfile` writes with `writeOwnRows_`) -> the person's rows read back
   (`ownRows_`) -> boxes. `person_id` is what ties a row to its person, so rows for somebody else in
   the same tab must never come back into this person's form. */
```

### ---------- THE QUALIFICATIONS

top level, before `q7`

```
/* ---------- THE QUALIFICATIONS -------------------------------------------------------------------
   `teach` IS THE SPECIALISM (one on the page, the gold chip under "Teaches") and `can_teach` is
   everything else taught. On the way back a specialism is also taught, so the form's Can teach box
   comes back ticked beside it. */
```

### ---------- WHAT A TUTOR TEACHES IS DERIVED FROM THE TICKS, NOT KEPT

top level, before `subject`

```
/* ---------- WHAT A TUTOR TEACHES IS DERIVED FROM THE TICKS, NOT KEPT ------------------------------
   The card's "Teaches" and "Can also teach" read this. The specialism first; a subject ticked twice
   is one phrase; a tutor with no specialism has no "Teaches" rather than their first "can teach"
   promoted into it. */
```

### ---------- A QUALIFICATION AS ITS PARTS, AND AS THE SENTENCE

top level, before `subject`

```
/* ---------- A QUALIFICATION AS ITS PARTS, AND AS THE SENTENCE --------------------------------------
   *"Maths subscript to it is grade and super script is the level."* The card writes each one like an
   isotope off `qualsParts`, and a phone from before that reads `quals`. Both are written off ONE list
   by `qualsParts_`, so this follows what was typed into the boxes all the way to both keys: the same
   length, the same order, the row with no subject dropped from both, and the sentence byte-for-byte
   what `doGet` wrote inline before it moved — an older phone must not see a single character move. */
```

### THE CERTIFICATES ARE THE TAIL OF THE PHONE'S LISTS, copied — so the copy is held to them.

top level, before `listIn`

```
/* THE CERTIFICATES ARE THE TAIL OF THE PHONE'S LISTS, copied — so the copy is held to them. A name
   here that the shelf does not offer is one the server calls a certificate and nobody can choose;
   one renamed on the shelf and not here turns a PGCE into notation without anything failing. */
```

### AND THE FIXTURE SENDS WHAT doGet SENDS.

top level, before `FX`

```
/* AND THE FIXTURE SENDS WHAT doGet SENDS. `check/fixture.json` stands in for the response in every
   browser check, so its tutor's two keys must be one list in two spellings — a fixture whose
   sentences and parts disagree measures a card no backend could produce. */
```

### ---------- THE VENUES: A SAVE THAT MOVES NOTHING WRITES NOTHING

top level, before `me`

```
/* ---------- THE VENUES: A SAVE THAT MOVES NOTHING WRITES NOTHING ----------------------------------
   `others.concat(mine)` put this person at the END of the cell on every Save, so a Save with nothing
   touched rewrote it and retired the payload. */
```

### ---------- AND THE DATE OF BIRTH, WHOSE UNPACKER HAS TO READ TWO STORED SHAPES

top level, before `dob`

```
/* ---------- AND THE DATE OF BIRTH, WHOSE UNPACKER HAS TO READ TWO STORED SHAPES -----------------
   A BIRTHDAY TYPED INTO THE SPREADSHEET IS A REAL DATE and one written by this app is a
   `dd/mm/yyyy` string, and `dobOut` has to come apart into the same three numbers either way. The
   Date case is the one that was a live fault: `profileOf_` sent `S(r.date_of_birth)`, so the box
   rendered `Sun Sep 15 1985 00:00:00 GMT+0100 (British Summer Time)`.

   THE ZERO PADDING IS NOT COSMETIC. `sheetDate`'s anchored branch reads `15/09/1985`; a
   four-digit year is what keeps it out of the two-digit rule, which is `2000 + n` and would make
   `85` into 2085. So the packer's output is asserted character for character. */
```

### AN EXAM DATE, WHICH GOES OUT AS ISO AND MAY ARRIVE AS ANYTHING THE SHEET HOLDS.

top level, before `isoNo`

```
/* ================================================================================================
   AN EXAM DATE, WHICH GOES OUT AS ISO AND MAY ARRIVE AS ANYTHING THE SHEET HOLDS.

   `isoDate_` IS THE ONE THING BETWEEN A CELL AND AN EMPTY PICKER. A date input silently rejects any
   value that is not `yyyy-mm-dd` — so every case below where the answer is NOT empty is a case where
   getting it wrong loses a date on the next save, with nothing on screen saying so.

   THE TIMEZONE CASE IS THE ONE THAT CANNOT BE SEEN BY READING. `new Date('2027-05-14')` is UTC
   midnight, so in any timezone behind UTC it reads back as the 13th — the `parseWhen` fault this
   repository records reading `2026-09-15` as 26 September 2015. `isoDate_` matches and re-spells
   rather than parsing, so the assertion below holds wherever the script runs.
================================================================================================ */
```

### THE LIST IS WHAT KEEPS THE TWO HALVES IN STEP, and a rule that named the columns here would be the second copy.

top level, before `reSrc`

```
/* THE LIST IS WHAT KEEPS THE TWO HALVES IN STEP, and a rule that named the columns here would be the
   second copy. What this asks is that it is not EMPTY — which is what a rename would leave it, with
   every case above still passing and not one column going through either function. */
```

### ---------- AND THE TWO HALVES OF IT LIVE IN DIFFERENT FILES

top level, before `reSrc`

```
/* ---------- AND THE TWO HALVES OF IT LIVE IN DIFFERENT FILES -------------------------------------
   `DATE_COLS` IN `constants.gs` DECIDES WHAT THE SERVER SENDS AS ISO; `FIELD_IS_DATE` IN `js/me.js`
   DECIDES WHAT THE FORM DRAWS AS A PICKER. Nothing anywhere makes them agree, and they must: a
   column in the list whose name does not match the regex gets an ISO value from the server and a
   plain text box on the phone, so `2027-05-14` is what somebody is asked to edit and `14/05/2027`
   is what they type — refused by `isoRefusal_`, which is a save that fails on a page that looks
   fine. The reverse is worse and silent: a column that matches the regex but is NOT in the list
   draws a picker and is sent whatever the cell holds, so a real Date opens it EMPTY and the next
   save writes the empty over it.

   THE REGEX IS READ OUT OF THE FILE rather than written again here, which is the whole point — a
   copy of `/_date$/` in this check would agree with itself and with nothing else, the fault this
   file's own header names about a second implementation. */
```

### ---------- THE PHOTOGRAPHS

top level, before `A`

```
/* ---------- THE PHOTOGRAPHS ---------------------------------------------------------------------
   Every case is a way a gallery goes wrong without anything failing: a link that splits in two on
   the next read, a picture drawn twice, a blank that becomes a hole in the grid, a note typed into a
   link box drawn as a broken picture on a public card, and the face repeated under itself. */
```

