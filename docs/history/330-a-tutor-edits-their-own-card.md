## A tutor edits their own card, on the card: Edit turns it into its form, one Save, and five Settings pages go

**Since 11 Oct everybody edits their own card**, not only a tutor with a public card — a parent, a student and an admin each get Edit, with the picture and the name, and on everybody's own card the figure and the handle ([339](339-your-card-holds-what-is-about-you.md)).

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
| picture | the face | `photoPicker_` — photo, figure and the ten pictures (fix-dp, merged); it saves itself (`savePhoto`), as on Settings, and Cancel puts it back (below) |
| name | first and last name | `fieldRows_` (one row) |
| rate and class size | rate, extra-seat share, fewest–most students | `fieldHtml`, the students as `[ ] – [ ]` |
| headline | the headline | `fieldHtml` |
| photographs | the video link and the eight extra photographs | `photoShelf_` |
| three words | `adjective_1..3` | one captioned row |
| at a glance | years teaching, favourite colour, youngest–oldest, the session's shortest–longest | `fieldRows_` (the session length since the review, below) |
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

### Settings: five pages go, and the server's groups stay

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
pages.** The one backend change this note records is the session length (below), which is a field gaining a
group, not a page losing one.

### Decisions

- **AN ADMIN EDITS ANY TUTOR'S CARD THE SAME WAY** (decision 3). `updateProfile` already lets an admin write
  another person's row (`adminEditing`, dopost.gs), so nothing on the server changed. The Edit tile is the
  admin's silver on somebody else's card (`tutorTiles_`), on the You column only. Their form is filled from
  `getProfile` (admin-only, by person id), never from the payload's row, which has no Teach ticks, no
  favourite colour and three words with their places lost — a Save built from it would write those losses
  back. The picture is shown and not offered, with one line saying why: `savePhoto` writes the row the token
  resolves to, which would be the admin's own. An admin's Save is answered with no profile and no name, and
  touches neither of the admin's own (the trap the map found in `meSave_`).
- **SESSION LENGTH IS EDITABLE — THE ONE BACKEND CHANGE, AND ALL FOUR STAMPS BUMPED.** The first build left it
  read-only with a sentence ("kept on the sheet") because `min_hours`/`max_hours` were in no group, so nobody
  could write them through `updateProfile`. The review asked for the box: the brief lists it with the pricing
  fields, and decision 4 allows a backend change when permission requires one — and here it does, because
  `PROFILE_GROUPS` is the allow-list. So `SESSION_FIELDS` joins the rate page (`PRICING_FIELDS.concat(...)`,
  NOT `PRICING_FIELDS`, so a session length starts no month's clock — it is what a tutor offers, not the quote),
  `SESSION_OPTIONS` is one to six whole hours sent through `FIELD_FIXED` as selects (the booking form books
  whole hours, so a half hour would promise a session nobody can book), and `hoursRefusal_` (people.gs, beside
  `ageRefusal_`, asked only when an end moved) refuses a length off the list and a shortest longer than the
  longest, before anything is written. On the card it is in At a glance, where the card prints `1–2 hours`.
  **All four stamps are `2026-10-10-i-session-length`**, after fix-dp's `h-pictures` (merged first, so they do
  not collide, and `PFP_SINCE` still compares older). A tutor not yet listed sees the two boxes on Settings'
  rate page, which `check/states.js` now counts as six boxes in two ranges.
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

The first build found `fix-dp` and `fix-avail-days` at a47d338 and merged neither. **That was out of date** —
fix-avail-days 7eb744e (20:24) and fix-dp 067aeb5 (21:18) were both committed before this branch's first
commit (22:51). **Both are merged now** (f4e7c49, 96437c4), each with the same two text conflicts —
`--css-version` (this branch's kept) and the README's order (324, 325, 330). And merging fix-dp broke this
branch in one place, as the review predicted: `cardFaceOnly_`, the admin's view of somebody else's picture,
drew its own `<img src="${pic(t.image)}">`, and since 324 the cell can hold `pfp:fox`, which `pic()` passes
through — a broken image on the form beside a card drawing the fox. It is drawn through `personFace_` now,
the same call `findCard` makes. The card journeys and check-profile were re-run on the merged tree.

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
  out of me.js and run over the real `PROFILE_GROUPS`: every field the card offers is writable (the session
  length too, since the review — writable and on the card, both asked), every tutor field is on the card or on a page still drawn and none on both, the pages
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
  chooser on somebody else's card (journey 5); session length on the card while unwritable (check-profile, the first build's rule); the photographs
  left off the card (check-profile, four lines); the card's listener keeping nothing and `fieldHtml`
  ignoring `draft: false` (check-drafts); the editor drawn smaller (check/ui.js, the state not reached at
  all five widths).

- **Two instruments learnt to run in pieces**, because on the shared machine the whole of either does not fit
  a ten-minute window: `FLOW_SLICE=k/n node js/check-flow.js` runs every n-th journey from the k-th, and
  `node check/cascade.js --screen=<id>` one screen and its states, as `check/ui.js` and `check/press.js`
  already take it (and a screen that is not there exits non-zero rather than measuring nothing).

### The review, and what changed (11 Oct)

Each finding reproduced first, fixed at the cause, held by a check that was red before and is green after.

- **"THESE REMAIN LOADING UNTILL I SCROLL TO THEM. I DONT LIKE THIS."** — the owner's message that this run was
  started under. **This branch is not the answer to it, and is not presented as one.** What the owner sees is
  mostly the neighbouring columns on a wide screen holding their loaders until they are gone to (the review:
  at 1280, Tools and Games still 10 and 12 `.loading` after four seconds on Settings) — that is task #79,
  *widgets on the glass*, being built in its own worktree (`fix-widgets-visible`), and nothing here touches
  it. **One part of it was this branch's own doing and is fixed here**: the editor's photograph thumbnails
  were `loading="lazy"` in a form two thousand pixels tall in a pane that scrolls, so at 320x568 the three
  thumbs (y 898–997) were not requested at all until scrolled to. `photoShelf_` draws them eagerly now (at most
  eight, each the check on the link beside it); measured in Chromium they load with the form, unscrolled.
  `check-flow` journey 1 and the edit state in `check/states.js` fail on any `img[loading=lazy]` in the form.
  **Left for #79, by name**: the card's own extra photographs (`.prof-photos`, cards.js) and faces through
  `personFace_` are still lazy, and on the You column's later pages are not fetched until paged to (the
  review's Ben, page 3 at 390). Sixteen lazy images remain across cards.js, find.js, posts.js, me.js and
  games.js; whether each should load ahead is #79's question, asked across the app at once.
- **CANCEL PUTS THE PICTURE BACK** (was: Cancel left a newly chosen picture on the card and the sheet under a tile
  saying "put it back"). The picture the card opened with (`pic0`) is remembered beside which card is open
  (`familyCardEdit`), so a reload does not lose it; Cancel, finding the face changed, writes it back through
  `updateProfile`'s `photo` — the one door that takes a link, nothing, or a token, where `savePhoto` could not
  restore a Drive link it once made — with the page locked and `send_`'s ring, then closes. Refused, it still
  closes and the toast says everything else is back and the picture is not, with the server's sentence. A
  Cancel while the picture is still saving waits for it. Journey 2: Ada (face a photograph link) taps the fox,
  the page is reloaded, Cancel sends exactly one `updateProfile` of `{ photo: <her link> }`, and the sheet, her
  profile and her card hold the link again.
- **SAVE AND CANCEL STAY IN REACH.** One Save, as decided, but the `.ce-tiles` row is `position: sticky` at the
  foot of the pane — `bottom: -1rem` because a sticky box stops at the pane's padding edge and left the form
  showing through a 1rem gap under it (measured: row foot 828 in a pane ending 844). In the card's own fill.
  At rest at the end of the form it sits above Sign out. The edit state asserts the Save tile is inside the
  pane with the pane at its top, at every width; made `static`, it fails at all five. Known: one pixel row of a
  box's letters can show under the stuck row where the pane sits on a half pixel (written beside `.ce-tiles`).
- **SIGN OUT IS UNDER THE FORM.** `editing_(myRow) ? cardEditHtml_(myRow) : meCard(...) + cardTiles_(...)` is
  `a ? b : (c + d)`, so editing your own card dropped your row — Sign out and "Send the link again" — and
  Settings has no Sign out of its own. Bracketed; `cardEditTile_` draws nothing on the card being edited, so the
  row under the form is the star, Sign out and the resend. And `CARD_EDIT_READ` is a person id now, not a
  once-a-visit flag: a tutor who signs out mid-edit and back in on the same tab finds the card open with what
  they typed (only a reload did that before), and somebody else signing in on that phone sees neither. New
  journey: Sign out once and no second Edit under the form, the draft kept, Pat sees no form and no Edit, Ada
  back finds her typing and "Not saved yet".
- **317 ON THE CARD HAS A CHECK.** Deleting the `from` guard in `cardValues_` kept every check green. New
  journey (the review's probe F, through the real `doPost`): Ada types a headline and does not save, the admin
  saves another for her, Ada reloads — the box holds the admin's. Red with the guard deleted.
- **SESSION LENGTH** and **STEP ZERO** — above.

### Checked, the second time

Every check named in the brief, on the merged tree: `check.js`, `check-const`, `check-css`, `check-doors`,
`check-drafts`, `check-profile` (card rules 20, session length through the real `doPost`), `check-backend`,
`check-post`, `check-access`, `check-loading`, `check-payload`, `check-tabs`, `check-manifest`; **all 286
check-flow journeys** in four `FLOW_SLICE` pieces; `check/ui.js --screen=account --shots` and
`--screen=settings`, `check/press.js --screen=account`, `check/cascade.js --screen=account`. **Mutations, each
red and the real files green after**: the brackets removed (Sign out journey, journey 1); Edit not hidden on the
card being edited; `CARD_EDIT_READ` once a visit (Ada back finds it shut); Cancel never putting the picture back,
and `pic0` not remembered across the reload (journey 2, five lines each); the thumbnails lazy again (journey 1);
the old `cardFaceOnly_` (the admin journey: `<img src="pfp:fox">`); the `from` guard deleted (the 317 journey);
the session fields out of the group (check-profile six lines, journey 1 five); `hoursRefusal_` emptied, and its
call skipped (check-profile, three lines each); the row not sticky (check/ui.js, the edit state at all five widths).

### Not done, and worth knowing

- **The neighbouring columns' loaders and the rest of the lazy pictures** — #79's, above.
- **Two tabs, one card**: a card draft written in another tab is not pushed into this tab's open form (the
  `storage` listener in data.js speaks to `[data-draft]` boxes, and the card's are not). The reload draws it.
- **The Tools column's hours widget stays** — a second door to the week, unchanged, saving through
  `meSave_` as before.
