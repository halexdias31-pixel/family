# 506 — No festive cards

The owner, about the holiday cards on the feed ("Christmas party" and the like, drawn under the Camera):
"that's not something we want — don't do that" (softened; the owner's words were stronger).

## What went

- **Drawing:** `festiveCard` (book.js), the festive block in `postsBlocks` and `FEED_FEST_N` (posts.js), the
  `item:feed:festive` start-page rule in layout.js, `.fest` CSS and the `.fest` selectors in layout/submit/words.
- **The ticket flow.** Festive cards sold places: `fest-join`/`fest-join-go` (receipt.js) sent `joinFestive`,
  which created a `kind: festive` job on the first join (`price_total` = price per child), logged the headcount,
  wrote a receipt and emailed the admin. All gone: the `joinFestive` handler (dopost.gs), its `ACTION_ROLES`
  entry, its `KID_MONEY_ACTIONS` entry and its `doPost actions` advert, and the admin's "Sign-ups to a
  festive event" note on the bookings preference.
- **Backend:** `festiveOffers` and `festiveReady_` (booking.gs); `doGet` no longer sends `festive`.
  `closures()` no longer marks a priced event row as a `festive` closure.
- **Checks:** the festive journeys and their fixture key; the surname check of a festive join; the
  `joinFestive` rows in check-kid-prices and check-prefs. A journey now proves an old payload that still
  sends `festive` draws nothing, and that a layout with `item:feed:festive` in `deleted` is harmless.
- `js/rules.js` `items-no-move` now names the Camera and Daive's card only.

## What stays

- The **`holidays` tab**: `closures()` reads its `inset`/`closed`/`bank` rows (with the computed bank
  holidays) into `DATA.closures` for the Calendar and session dates. Old festive columns on it are ignored.
- Old `kind: festive` job rows stay in the sheet as history; nothing new makes one.
- The 489 one-off layout repair still runs (a v1 layout gets its camera back); the id it adds to
  `deleted` is unknown now and ignored.
