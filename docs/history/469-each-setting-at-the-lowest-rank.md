# 469 — Each setting on one column, the lowest rank it applies to

## What the owner said (26 Oct, voice)

"Something such as profile picture … would be in the account which has the least amount of privileges, because
that's something that everybody uses … Something which is only a tutor privilege, such as selecting where you
tutor, … only in the tutor thing. … you've put profile picture in two different roles' account settings. That's
wrong. It should only be in one … the role account setting which has the fewest privileges … lowest common
denominator."

## What was wrong

468 drew Picture, Your figure, Name and Handle on each person's *home* settings column (`homeCol_`): Student
settings for a student, Parent settings for a client, Tutor settings for a tutor. The same card had three layout
ids (`own:account|family|staff:picture`) and moved with the viewer's rank. A client's contact and address
(`youSetCol_`) were on Parent settings too, though every account has them.

## What changed

- **One column per setting, the same for everyone.** `OWN_SEC_OF_SET_` (me.js) is the one list: Student settings
  holds picture, figure, name and handle; Tutor settings rate, headline, photographs, three words, at a glance,
  qualifications, where you teach, available; Parent settings none of them. `ownCardSections_('students')` is the
  four, `('tutors')` a tutor's own; `homeCol_` now only says which profile column you belong to.
- **Settings fields** (`settingsSplit_`): a field is Tutor settings' when no client or student group has it (as
  before), Parent settings' when a client's group has it and no student's (`parentOnly_` — none today), else
  Student settings'. So contact, address, date of birth, PIN, roles, notifications and reading aloud are on Student
  settings for every rank. `youSetCol_` is gone.
- **Who may use a column.** accounts.md: "each rank includes everything below it". So a column is open when your rank
  is at least the column's: Student settings for every signed-in person, Parent settings from Client up, Tutor
  settings from Staff up. Signed out, all three stay locked. Parent settings, open but with nothing a parent's alone,
  says so in one line and points at Student settings.
- **Layout ids are fixed per card:** `own:account:<picture|figure|name|handle>` and `own:staff:<section>`.
  `ownSecReg_` (layout.js) reads `OWN_SEC_OF_SET_`. A layout saved before this naming `own:staff:picture` or
  `own:family:name` is mapped to the one id by `ownIdNow_` in `layoutSane_`; anything else unknown was already ignored.

## And less filler (same day)

The owner, of the "Find a student by their handle" card: "practically everything in the account settings is just
full of so much filler space… it could have just been a search bar… It just needs to be a search bar widget… more
minimal, while still containing what it absolutely needs."

- **Find by handle is one search bar:** the box (its placeholder the label, an `aria-label` for a reader) with Find
  inline on the same row (`.ps-bar`); no label above, no full-width button, no footnote.
- **No "where things went" line** at the top of Student settings (`cardMovedSay_`, `.ce-moved`, gone): each card's
  one-line description says what it is.
- **The PIN boxes** carry their names as placeholders (and `aria-label`s); "4 to 8 numbers" is the new PIN's
  placeholder, so the line under the button is only for what the server says.
- **Your roles** has no note per choice under the picker.
- Parent settings with nothing of its own is one short line.

## Checks

- check-flow, Six columns: across every rank each `own:` card id is drawn once over the three settings columns and
  on the column its id names; the four are open cards on Student settings for every rank; headline and where you
  teach are on Tutor settings for staff and admin; no contact box on Parent or Tutor settings. The locked Tutor
  settings shows a tutor's eight sections only; Parent settings is locked for a student alone.
- The card journeys (`cardOpen_`) read the section cards across Student settings and the face's column.
- check/states.js: your own card's states are read on Student settings.
