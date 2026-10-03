## A profile picture picker, a tutor's hours on their card, and a heat map you can read

### The heat map

**Asked for as *"make the heat map a bit clearer."*** Two things made it unclear, and both were
measured on a stand-in tile in OpenStreetMap's own colours, because this container cannot load the
real tiles (403):

- **The streets were gone.** `.heat-tiles` was `invert(1) hue-rotate(180deg) brightness(.85)
  contrast(.9) saturate(.4)`. White minor roads on `#f2efe9` land came out `rgb(13,13,13)` on
  `rgb(26,25,23)`, which is 1.11:1. The two colours are 5% apart, and inverting keeps them 5% apart at
  the dark end. Turning the contrast up after an invert only clips both to black (measured: 1.00:1).
  The filter is now `brightness(.46) contrast(4) saturate(.5) sepia(.25)`. The stretch comes first, so
  the narrow light band the tiles live in is spread across the dark half of the range, and streets stay
  LIGHTER than the blocks round them, as on any dark map. Minor roads now measure 1.62:1 on open land
  and 2.46:1 on residential grey (`#e0dfdf`, which is most of London at these zooms). Water is 1.85:1,
  and place labels come out dark rather than white.
- **Seven venues were one blob.** Colliers Wood, Sutton, Wimbledon, Tooting, Mitcham, Balham and
  Morden merge into a single patch with 80px glows. That is right for a heat map, but it meant three
  venues looked the same as seven. Each venue now has a 10px gold core with a dark ring, on its own
  `.heat-core` layer above the glows. The core is placed by the same `pos()` call as the glow, so the
  two position strings are identical.
- **No text was added.** The owner asked for a map *"instead of the tutors at showing names of all
  places"*.

The account state `a tutor card, the five captions and the area map` now also asserts that there is
one core per venue (`data-dots`) and that the cores' `background-position` list equals the glows'.
Proved by placing the core at `pos(p[0], p[1], D, D)`, half a dot off its glow: the state reported
"was entered and shows no … gold core on its centre" at every width. It went green again once the
change was put back.

**The phone has the last word on the filter.** Every screenshot here was taken over a stand-in tile.
If it is too dark or too bright, tune the two numbers. Do not change the order.

### A tutor's hours on their card

**Asked for as *"tutors availability should appear on their card."*** `doGet` has always sent `avail`
on every tutor. It is `availGridOut`'s 77 codes, `{ m09: 'TRUE', m10: '' … }`, and `busy` uses the
same codes for hours the tutor is already teaching. `findCard` never read either one.
`profAvail_` (cards.js) now draws an **Available** caption after `Tutors at`, with a read-only week
under it, built by `weekGrid_` like the booking form, the receipt and the Settings week:

- A ticked hour is lit gold. A ticked hour they are already teaching is greyed (`shut`, with
  `is-busy`), because offering it as open would be a promise the booking grid then breaks. Its
  title says "already teaching".
- A day with nothing ticked collapses to a thin row. A tutor with nothing ticked gets **no caption
  and no week**. 77 grey cells would read as "never available", and `slotGrid` treats an unfilled
  grid as "nobody has said".
- The span is the booking's 9 to 18, widened to any hour the tutor ticked (their own grid runs to 19).
- **Spans, not the receipt's `<button disabled>`.** The first version used buttons, and
  `check/ui.js` listed all 77 as 17x12 tap targets: 210 "known" rows at 320 alone, for cells nobody
  presses. A screen reader now gets one sentence for the whole week (`role="img"`).

**The fixture lied about the shape.** `check/fixture.json`'s tutor had `avail: []` and `busy: []`, so
the lab could not draw availability at all. It now holds the 77-code object with nine hours on
(Mon 16–18, Tue 10–11, Wed 16, Sat 10–12) and `busy: { m17: 'Maths' }`. The booking screen's
`check/ui.js` pass is unchanged by it.

**Owner's five captions.** In note 210 the owner asked for exactly five captions. `Available` is a
sixth, so the heat-map state now allows it only as the last caption.

Checks:
- A check-flow journey covers lit hours, the busy hour greyed, collapsed days, no control in the
  week, the spoken sentence, and no week when nothing is ticked.
- A `check/states.js` state, `a tutor's hours on their card`, covers four widths.

Proved:
- Lighting busy hours turned both the journey and the state red at all four widths.
- Dropping the empty-grid guard turned the journey red ("drawn with a week anyway").
- Buttons in place of spans turned it red ("is a control").

Each check went green again after the change was restored.

Cost: on the 390 lab card, the tutor card is drawn at 84% where it was 98%. At 320 it was already
at the 70% floor and scrolls inside its pane. Nothing is out of reach.

### A profile picture you choose, not a link you paste

**Asked for as *"everyone should have a profile picture selector widget in account settings"* and
*"add a profile picture selector"*.** Every role had `photo`, but only as a text box captioned
`photo link`. To use a picture from your phone you had to upload it somewhere, share it, copy the
address and paste it into that box.

**On your own Settings, `photo` is now a picker** (`photoPicker_` in me.js), drawn where the box was:

- A square 88px preview shows the photograph. With no photograph it shows your dressed wardrobe
  figure, or else your initial, the same letter the card draws.
- **Choose photo** is a tile that opens a hidden `<input type=file accept="image/*">`. It has no
  `capture`, so the phone offers both the gallery and the camera. It uses a new `photo` camera icon
  in `TILE_ICONS`.
- **Remove** is a tile that is disabled while there is no picture.
- One line under the row says what happened.
- The link box is gone from that surface. It was not moved behind an admin view: a hidden
  `data-me="photo"` would be posted by the card's Save with the old address, writing the old picture
  back over the new one.
- The picker is drawn only on `data-me`, the editor of your own row.

**The crop.** The phone runs the camera's own reader, `camItemOf_` (1600px JPEG), and then keeps
the centre square at no more than 600px (`pfpPrepare_`). Faces are 52px on a card, so 600px is crisp
on a 3x screen at about 60KB, where the original would be 4MB.

**The backend.**
- `addPost`'s inline `keep_` is now `driveKeep_(folder, raw, name)` in content.gs, and `addPost` and
  the new action share it. The ANYONE_WITH_LINK sharing line is written once.
- `savePhoto` is `self` in `ACTION_ACCESS`. It writes `photo` on the row the token resolved to and
  nowhere else.
- It refuses anything that is not an `image/*` `data:` URL, including a link. It caps the upload at
  5MB decoded.
- `remove` blanks the cell.
- The old file stays in Drive, because deleting it could remove a picture somebody also used in a
  post.
- **New config key `photos_folder`** is in CONFIG_DEFAULTS, blank by default. When it is blank, the
  picture goes to the posts folder (`getPhotoFolder_`), so the feature needs no setup.

**Proved.**
- `check-profile.js` §12 runs the real `doPost` over a stand-in Drive. A tutor's picture lands on
  their own row, shared by link, as `photo-P-T1-<time>.jpg`. A request naming the parent's id still
  lands on the tutor's row. A request with no token is refused, with no cell and no file written. HTML,
  a link and an empty body are each refused with nothing written. Remove blanks only the parent.
- A check-flow journey drives the page's own change listener and tiles. Choosing a file posts
  `savePhoto` with a JPEG `data:` URL and the person's id. The preview and `USER.profile.photo` take
  the returned address. Remove posts `remove` and the initial comes back. The journey also checks that
  no link box is left.
- A `check/states.js` state, `your picture, chosen`, runs at four widths. The existing
  photographs-page state now expects the picker instead of the box.
- A real Chromium run with a real 1200x700 PNG posted a 600x600 JPEG of the centre, about 12KB.

**Mutations.** Each of these went red, and each check was green again once the change was restored:
- `self` changed to `anyone`: three red lines.
- Accepting any `data:` or `http` value: an HTML file was accepted.
- Dropping `setSharing`: "not shared by link".
- Leaving `photo` in the form: the journey reported a link box beside the picker.
- Not redrawing after the save: the preview did not show the kept file.
- Posting `updateProfile` instead: no savePhoto was sent.
- Remove always disabled: the state was red at all four widths.

**Deploy**: `backend/` must be pulled for `savePhoto` to exist. Until it is, choosing a picture says
"That action is not recognised" under the tiles and nothing is written.
