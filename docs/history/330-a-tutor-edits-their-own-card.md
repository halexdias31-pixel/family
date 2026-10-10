## A tutor edits their own card, on the card: Edit turns it into its form, one Save, and five Settings pages go

**The owner, 10 Oct, with two screenshots** (the Settings card "About you" — first and last name, headline,
years teaching, favourite colour, the ages they teach, three words, a tick — and their own card on the You
column — picture, name, handle, rate and seat rate, headline, an extra photograph, three words, At a
glance, Can also teach, Qualifications, Tutors at, Online, Available): *"all of this stuff should be
editable directly on the tutors card for that respective tutor. this centralises things so less widgets
are required."*

### What it is

**A TUTOR'S OWN CARD HAS AN `Edit` TILE**, a pencil, between the star and Sign out (`cardEditTile_` in
me.js, called from the `me` branch of `cardActions_` in tiles.js). Pressing it turns the card into its own
form **in place** — the card's own clothes (`.card.is-widget.is-prof`), `· editing` in gold beside the role,
on the page the card was on — section by section in the order the card reads (`CARD_SECTIONS`):

| section | what is edited | drawn with |
|---|---|---|
| picture | the face | `photoPicker_` — photo, avatar, and whatever fix-dp adds; it saves itself (`savePhoto`), as on Settings |
| name | first and last name | `fieldRows_` (one row) |
| rate and class size | rate, extra-seat share, fewest–most students | `fieldHtml`, the students as `[ ] – [ ]` |
| headline | the headline | `fieldHtml` |
| photographs | the video link and the eight extra photographs | `photoShelf_` |
| three words | `adjective_1..3` | one captioned row |
| at a glance | years teaching, favourite colour, youngest–oldest | `fieldRows_`; the session length is said, not offered (below) |
| qualifications | the whole shelf: what they hold, Teach / Can teach | `qualShelf_` |
| where they tutor | the venues they are happy at, how far they travel, and the map redrawn from the ticks as they are ticked | the several-of-a-list field, `profHeat_` |
| the week | all seventy hours, all seven days | `availGrid_` |

**ONE `Save`, THE TICK**, posts every field that changed through the existing `updateProfile`, in one
request, and the card is a card again with the new values; **`Cancel`** puts back what was there. Edit,
Save and Cancel are tiles because the card is a thing; the boxes inside are the form's controls — the same
`fieldHtml` boxes, shelf, picker and week Settings drew, one renderer each.

**"EVERY CHANGED FIELD" IS EXACT, WITH THREE CELLS SENT WHOLE** (`cardChanged_`). An untouched rate is not
sent, so it cannot start the month's clock on the quote (`pricingRefusal_` fires only on a value that moves).
But the server rebuilds three cells from whatever arrives — `availGridIn` clears every hour not sent,
`photosIn` repacks the photographs, `qualsIn` rewrites the person's qualification rows and `writeOwnRows_`
deletes one not sent — so one hour ticked sends all seventy, one photograph all eight, one grade all seventy
qualification boxes, which is what each Settings page always posted. Compared against the copy of the row
**that form was drawn from** (`CARD_DRAWN`, by a number on the form), because the You column is drawn — and
counted by the pager — more often than it reaches the screen, and `USER.profile` can be replaced by
`myProfile` while a card is held under typing.

**ON THE CARD THE QUALIFICATION SHELF KEEPS ITS ANSWERS FOR THE ONE SAVE.** On Settings it saves each answer
as it is chosen (note 284). On the card `qualSave_` writes the answer into the card's draft and tells the
line it was kept, so `qualCommit_` and the bin carry on unchanged; without that every pick would have posted
the whole card. `qualClean_` no longer cleans a card's form (a shut line is not a saved card), the placements
follow the column the shelf is on (`qualColumn_`), and "Removed …" is not toasted over a removal that waits
for Save. And because the card's Save posts every box, it refuses what the shelf would never have sent: a
line with no subject (`qualNameless_`, lifted out of `meSave_`) and a line being added, or a saved line
emptied, with no level — *"Choose a level for each qualification first — nothing was saved."* A line the
sheet already holds with no level (a PGCE typed in by hand) is left alone.

**IT SURVIVES A RELOAD, AS EVERY BOX DOES (317).** Which card is open is remembered on the device
(`familyCardEdit`, with whose phone it was), and what was typed is **one draft for the whole card**,
`card:<pid>` under the signed-in person's own key (`cardKeep_`, through `draftKeep_`, so a store that refuses
it is held for the visit and said like any other draft). Each box keeps the saved value it was typed over
(`from`), so a box drawn over a row saved elsewhere since draws the newer saved value — the review of 317's
"Samtown over Newtown", one card along. A card drawn holding a draft says so in Settings' own words
(`SET_HELD_SAY`). ONE DRAFT AND NOT ONE A BOX, for two reasons: the shelf and the week change several boxes
from one press, and an admin editing somebody else's card must never write into the ADMIN's own `set`
drafts, whose field names are the same. So the card's boxes are drawn with `draft: false` (`fieldHtml`,
`photoShelf_`), and `check-drafts.js` now asks for the lines that keep, draw back and drop the card's draft.

**THE YOU COLUMN IS NOT REDRAWN UNDER A CARD BEING EDITED** (`settingsKeep_`, which `paint` already asks):
held from the first keystroke until Save or Cancel and while Save is on the wire, as a Settings card is. A
clean card is redrawn as usual, and `myProfile` landing redraws your own (`profileRefresh_` returns its
promise now, so a card waiting for a copy it can trust knows when the question was answered).

**AND IT IS DRAWN AT FULL SIZE, AND ITS PANE SCROLLS** (`paneReach_` in find.js). Measured with the widest
profile the lab holds, the form is 2,051px tall at 320×568 and 2,143px at 390×844, in panes of 532 and 805;
at the 0.70 floor it is still 1,502 and 1,570. It scrolls either way, so drawing it smaller bought no fit and
cost every box, tick and tile 30% of its size — the open tick list's answer, for its reason. The first look
at the lab found the pane `overflow: hidden` with the zoom gone, so Save could not be reached; the pane now
scrolls from its first pixel over, as an open list's does.

### Settings: five pages go, and nothing on the server changed

**FOR SOMEBODY WITH A CARD, About you, Photos, Your rate and group size, Qualifications and Availability
are not drawn**, and Contact & address loses the venues and the distance, which the card's map now edits
(`cardSettingsGroups_`, asked by `settingsPages_`). A line at the top of Settings says where they went.
**Contact & address, Library cards and Notifications stay** — they are private, and the card is public. The
test is the one that draws the Edit tile: your own row in `DATA.tutors`. Nobody else is sent an unlisted
tutor, so a tutor not yet listed has no card and keeps every page — never a field with no box anywhere. A
parent's and a student's Settings are their own groups and do not change.

**`PROFILE_GROUPS` IS THE PERMISSION AS WELL AS THE LAYOUT.** `PROFILE_EDITABLE`, the allow-list
`updateProfile` writes from, is the union of the three group maps, and `profileOf_` walks it. Measured
through the real backend: taking the five groups out of `constants.gs` would have dropped headline, years,
ages, colour, the three words, video, the photographs, the four pricing fields, all seventy qualification
boxes and all seventy hours from what anybody may write — only the names and the picture survive, through
the parent and student groups. **So the groups stay exactly as they are and the phone stops drawing those
pages.** No backend change, no version stamps moved.

### Decisions

- **AN ADMIN EDITS ANY TUTOR'S CARD THE SAME WAY** (decision 3). `updateProfile` already lets an admin write
  another person's row (`adminEditing`, dopost.gs), so nothing on the server changed. The Edit tile is the
  admin's silver on somebody else's card (`tutorTiles_`), on the You column only. Their form is filled from
  `getProfile` (admin-only, by person id), never from the payload's row, which has no Teach ticks, no
  favourite colour and three words with their places lost — a Save built from it would write those losses
  back. The picture is shown and not offered, with one line saying why: `savePhoto` writes the row the token
  resolves to, which would be the admin's own. An admin's Save is answered with no profile and no name, and
  touches neither of the admin's own (the trap the map found in `meSave_`).
- **SESSION LENGTH IS NOT EDITABLE, AND THE CARD SAYS WHERE IT IS KEPT.** `min_hours`/`max_hours` are in no
  group, so nobody may write them through `updateProfile`. The brief listed session length among the
  pricing fields; it is not one (`PRICING_FIELDS` is the rate, the seat and the two class sizes). Making it
  writable is a backend change — the fields into the rate group (not `PRICING_FIELDS`, so no cooldown), a
  min-not-above-max refusal beside `ageRefusal_`, and all four stamps bumped — and it collides with fix-dp's
  stamp bump, so it was left for the owner to ask for. `check-profile.js` holds the two halves together: if
  it ever becomes writable, the card's sentence is out of date and the check says so.
- **THE CARD'S ORDER, NOT THE BRIEF'S LIST.** The brief said both "in the order the card shows them" and a
  list with the rate after the headline and the photographs last. In place means each section is edited
  where it is read, so the card's order won: the rate by the name, the photographs after the headline.
- **THE FAVOURITE COLOUR AND THE VIDEO ARE NOT ON THE PUBLIC CARD**, so they ride beside what Settings paired
  them with (the colour with the years, the video with the photographs) — nothing those pages held is left
  without a box.
- **THE SAVED CARD IS DRAWN AT ONCE, THEN BY THE SERVER.** `load()` follows every Save that wrote something
  and replaces `DATA` whole, but the live payload takes seconds; so the plain fields just saved are put on
  this phone's copy of the row in `doGet`'s shapes (`cardPatchRow_`) and the card is right the moment the
  toast says Saved. The qualifications are not guessed at — what a tutor teaches is derived on the server
  (`teachesOf_`) — and arrive with the payload.
- **A PRECEDENT, AND WHY THIS IS NOT IT.** tiles.js records the owner asking to *"remove edit tile as they
  can already edit their profile on the column to the right"*. That tile was a door to another column; this
  one edits the card in place, and the pages it would have led to are gone.

### Step zero

`fix-dp` and `fix-avail-days` both sat at a47d338 with no commits after it, so **neither was merged**. Both
have work in progress elsewhere, and this kept clear of it: **cards.js is untouched** — the editor is drawn
by `accountPages_` (find.js) in place of `meCard`/`findCard` for the one card being edited, so `profAvail_`
and the card's picture markup did not move; the editor's week is `availGrid_`, not `profAvail_`; the picture
is `photoPicker_(value)`, which fix-dp's new second argument leaves working; and the new journeys sit by the
qualification journeys, not at the end of check-flow.js. **When fix-dp lands**: its `pfpTake_` repaints the
You column, which redraws a clean card editor from `USER.profile` (already updated) and is declined by
`settingsKeep_` for a dirty one, whose picker `pfpTake_` redraws itself.

### Checked

- **check-flow.js, five journeys against the real backend** (`check-gas-load.js`: the payload is the real
  `doGet`'s, laid over the fixture, and every `updateProfile`, `myProfile` and `getProfile` goes to the real
  `doPost`):
  1. a tutor edits every section — name, rate, headline, a second photograph, a word, years, colour, the
     oldest age, a qualification's grade, a venue (the map redraws with two), the distance and Tuesday 10:00
     — and Save posts **one** `updateProfile` with exactly those plain fields plus the three packed cells
     whole; the sheet's row, the venues tab and the qualifications tab hold them; with the payload held, the
     card says the new name, rate, headline, word and hour at once, and once it lands, the new grade;
  2. a half-added qualification is refused on the phone, a youngest older than the oldest is refused by the
     server with the form left open and nothing written, and Cancel sends nothing, puts the card back, leaves
     no draft, and Edit again opens on the saved values;
  3. a reload in the middle keeps the card open with every typed value, says they are not saved, and Save
     sends them to the sheet;
  4. a tutor's and an admin's Settings lose the five pages and keep Contact & address, Library cards and
     Notifications, with no box the card edits; a parent's and a student's are their own groups, every box;
  5. an admin edits another tutor's card (filled from `getProfile`, no picture chooser, one `updateProfile`
     to their row, the admin's own profile and name untouched before `myProfile` could put them back), and a
     tutor sees Edit on their own card only, a parent and a student on none.
- **check-profile.js §18**, the phone's own `CARD_SECTIONS`, `cardSettingsGroups_` and `cardChanged_` cut
  out of me.js and run over the real `PROFILE_GROUPS`: every field the card offers is writable, session
  length is still not, every tutor field is on the card or on a page still drawn and none on both, the pages
  that go are exactly the five; and through the real `doPost` a tutor's card save round-trips, an admin's
  save of a tutor's card reaches that row and not the admin's, a tutor saving somebody else's is refused,
  and `getProfile` is the admin's alone.
- **check-drafts.js** asks for the card's listener, its draft write with `from`, the draw that reads it
  back, the shelf's answers kept rather than posted, the drop in `cardClose_`, and `fieldHtml` honouring
  `draft: false`.
- **check/states.js**: *your own card, being edited* (the widest profile: three qualifications, three
  photographs, three venues, hours on four days) and *another tutor's card, being edited by an admin*,
  measured by `check/ui.js` at every width; the first also asserts the form is at full size in a pane that
  scrolls.
- **Mutations, each red, the real files green after**: every field sent (journey 1: "sent fields nobody
  changed"); the hours not sent whole ("the week would be one hour", sheet `tu10`); no immediate redraw
  (journey 1, five lines); Cancel keeping the draft (journey 2); a refusal closing the form (journey 2); a
  level-less qualification sent (journey 2); nothing kept (journey 3, thirteen lines); edit mode not
  remembered (journey 3); nobody holding a card (journey 4); every role's Settings filtered (journey 4:
  the parent and the student lose their names and picture); admins editing only their own (journey 5);
  everybody editing every card (journey 5); the admin's reply taken as their own (journey 5); the picture
  chooser on somebody else's card (journey 5); session length on the card (check-profile); the photographs
  left off the card (check-profile, four lines); the card's listener keeping nothing and `fieldHtml`
  ignoring `draft: false` (check-drafts); the editor drawn smaller (check/ui.js, the state not reached at
  all five widths).

- **Two instruments learnt to run in pieces**, because on the shared machine the whole of either does not fit
  a ten-minute window: `FLOW_SLICE=k/n node js/check-flow.js` runs every n-th journey from the k-th, and
  `node check/cascade.js --screen=<id>` one screen and its states, as `check/ui.js` and `check/press.js`
  already take it (and a screen that is not there exits non-zero rather than measuring nothing).

### Not done, and worth knowing

- **Session length** — above; one backend change away, when the owner wants it.
- **The picture is not undone by Cancel**: it saves the moment it is chosen, as on Settings, and says so
  with its own toast ("Picture saved") as it lands.
- **Two tabs, one card**: a card draft written in another tab is not pushed into this tab's open form (the
  `storage` listener in data.js speaks to `[data-draft]` boxes, and the card's are not). The reload draws it.
- **The Tools column's hours widget stays** — a second door to the week, unchanged, saving through
  `meSave_` as before.
