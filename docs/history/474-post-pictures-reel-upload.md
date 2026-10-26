# 474 — A post wears its author's picture; a reel can be a file; the Christmas party card

## The post's face

Owner: *"because i uploaded this from personal, the profile picture should be in sync with my dp for my
account."* Their post showed the round `@` mark instead of their picture.

`doGet` sent each post's face as `avatar`, the author's `photo` cell joined by the whole name at the moment
the payload was built. When that came back empty the phone fell through to `brand('logo_square')` — the
`@family.` mark, which is meant only for a post made as the business. So a person with no photo at that
moment (or a payload cached from before they set one) was drawn as the business.

Now:

- `doGet` also sends `authorId`, the author's `person_id` (blank for the business).
- `postFaceWho_` (posts.js) reads the face when the card is drawn: your own post takes `USER.photo` (the
  Picture card's value) and `USER.avatar`; another person's takes what `doGet` sent for them; only a post
  with no `authorId` gets the brand mark. A person with no picture is their initial, never the mark.
- Each face carries `data-face-of`; `pfpTake_` (me.js) calls `postFacesMine_`, so a change of picture
  redraws your faces on the feed where they stand, with no reload.

Version stamps bumped together: `2026-10-26-r-post-faces-reel-upload`.

## "wtf is that christmas party thing above the camera"

The card above the camera on the feed is a **festive card** (`DATA.festive`, `festiveCard` in book.js, put
before the camera by `feedColumn_`). It is not in the code or the repository's seed: `festiveOffers()`
(booking.gs) reads the **`holidays` tab of the Ledger spreadsheet**. Row `H2026-16` (Christmas Day,
25 Dec 2026) has `event_name` "Christmas party", a venue, `price_per_child` 8, `max_children` 16 and
`active` TRUE; `opens_days` 60 puts it on the feed from 26 Oct. `setupHolidays` (setup.gs) only ever adds
rows with `active` FALSE and no event, venue or price — so those cells were typed into the sheet.
`data/settings/holidays.json` is the export of that tab and is not read by the site.

Nothing was deleted. To take it off: on the Ledger's `holidays` tab, set `active` to FALSE on row
`H2026-16` (or clear its venue or price — `festiveReady_` needs both).

## "add a reel should also give me option to upload a file instead"

The admin's new-reel form (games.js, `mediaFormHtml_`) keeps the YouTube link box and gains an
**Upload a video** tile. It opens `<input type="file" accept="video/*">` with no `capture`, so an iPhone
offers its library and Files. The file goes through `camItemOf_` — the camera's own reader and its 20 MB
`CAM_VID_MAX` — and is sent as `mediaUpload`, which `driveKeep_`s it into the posts folder (the route a
recorded clip takes) and writes a `media` row with id `f<ms>` and the Drive address. The column plays it
from `postVidSrc_`'s download address. Edit, Hide and Delete take the `f` id as they take a YouTube one.

Journeys: check-flow "an admin uploads a reel as a video file …" and "a post wears its author's account picture …".
