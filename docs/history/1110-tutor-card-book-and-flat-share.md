# 1110 — tutor card: a Book tile, and the shared picture is flat

The owner (7 Nov): optimise the tutor profile layout, don't rebuild it; a Book tile goes to
Find › Booking with that tutor; sharing a card shares a PNG exactly as seen.

- **Book is back** on a tutor card (`tutorTiles_`, tiles.js), reversing the earlier "you do not book
  from a person" note. It is `book-with` with `data-tutor`, so the form opens with the tutor row
  answered and every other question still to ask. Not on your own card, a child's view, or an
  unlisted tutor.
- **The shared PNG had a box.** `tutorPng_` draws the card off-screen in `.tpng-host`, outside any
  `.pane`, so the pane's flattening rule (690) did not apply: the picture got the widget's raised
  surface, border and `.7rem` inset while the site card had none. `check/share-profile.js` failed on
  every text's x. `.tpng-host > .card.is-widget` now flattens it the same way.
- **Photos stay phone-sized** on a wide column: `.prof-photos` columns cap at 6.5rem, so a desktop
  card no longer shows 9rem squares. At 390px nothing changes.
