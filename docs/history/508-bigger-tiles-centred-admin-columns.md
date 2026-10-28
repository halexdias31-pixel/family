# 508 — Bigger tiles, widgets that float back to the middle, admin-only columns, a sturdier answer path

## The owner's notes

- N-1793191076520 and N-1793186038937: "the tiles universally are actually too small. make them a bit bigger.
  kids are having trouble submitting inputs"
- N-1793180403696, with a picture: "finder is floating higher… because I deleted my search or the bible page I was
  on. looks goofy. should float back down"; and in chat: "ensure widgets stay centred. finder is going all over the
  place after I delete tags"
- N-1793146418283, on Site's "Weekly email's words": "why can't I move this to the right and have it start a new
  column when I do so"
- In chat: "turn all tiles into circles, and as you're already doing, make them slightly bigger."
- N-1793191233330, on Find 2: "I want less possibility of things to go wrong for students when answering questions.
  please tell me how to achieve this. also I suspect universalising tools and standardising things will achieve
  this. I don't want to have to keep re-editing after every student lesson."

## 1. The tile spec, again (467, 487)

487 quartered the tile to a 22px plate with a 10px mark, 3px apart. Children missed it. The one spec is now
`--tile: 36px; --tile-i: 16px; --tile-gap: 6px` (style.css `:root`), and every answer's send — every tile made by
`checkTile_` (Check, Send, Mark by rule, a cells or pad Check, Send on an ordering) plus the report Send and the
working-photo Send — carries `is-submit` and is `--tile-send: 44px` square. Keypad keys (48px) and multiple-choice
options (44px) were already 44px or more. The Rules card's `tap-44` now says so: switched to Universal, the sends
shrink to 36px with the keys and options. check/tiles.js wants 36x36 with a 16px mark, 44x44 for `is-submit`, and
still finds no row spilling at 320, 390, 768 and 1280px (4,124 tiles).

**Round (owner, later the same day: "turn all tiles into circles, and as you're already doing, make them slightly
bigger").** `.tile` is `border-radius: 50%` on its square plate, so every tile is a circle, tones and focus ring
included; the wide "Tap again" tile is a pill. Keypad keys, options and the calculator are not tiles and keep
their shapes. check/tiles.js asserts the radius is at least half the plate (fails on all 4,118 with 3px).

## 2. Why Find floated high

`HOLD_AT` (shell.js) holds the card you are using where its top is, so a card growing under a finger does not jump.
It held in both directions: a card first touched while tall (a chip added, results showing) and then shrunk — words
cleared, chips dropped, a page gone — stayed at the tall card's top, above the middle. The hold now remembers the
card's height (`h`): when the card is shorter than it was, the hold is moved back to the centre and kept from there.
Growing still holds. This is in `columnShift_`, so it is every widget's, not Find's alone; horizontal placement was
never affected (cards are a constant width).

check/centred.js (Playwright, 390px): on Find and Find 2, a chip added, the hold let go as if arrived at, then the
search box touched, words typed and cleared, chips dropped — after every shrink the card's top is within 6px of
centred and its middle is the viewport's middle. With the fix taken out it fails on the dropped chip (top 262px,
centred 319px).

## 3. Admin-only columns

▶ on Business and Site was off: the rule `admin-cols` keeps Business and Site cards from going where a non-admin's
column would show an empty space. Now ▶ on the last admin column makes a custom column (466) with `admin: true`,
titled "New admin column", placed after Site, and `columnsFor_` leaves it out for anybody not an admin (it is an
`admin` tab like Business). `adminCol_` counts an admin custom column as admin, so Business and Site cards move
among them and nothing else moves onto one. `layoutSane_` and the backend's `layoutClean_` keep the flag; the
backend now also keeps cards listed under `site` (it dropped them before). All four stamps bumped.
Journey: "layout engine (508)".

## 4. Answering: the risks found, and what was done

Fixed now:

1. **✓/Enter on the pad did not mark a rule-marked answer.** `kpDone_` (keypad.js) looked for
   `.qp-check[data-do="qp-check"]` or `qp-send`; a `markWords` box's tile is `qp-rule`, so Done only closed the pad.
   Now it presses the box's own `.is-submit` tile, whichever it is — one submit path.
2. **Check read the card's first box, not its own.** `qp-check` (find.js) took `card.querySelector`, unlike
   `qp-rule` and `qp-send`; on a card with two boxes it marked the wrong one. Its own box first now.
3. **A double tap was two submissions.** `subRecord_` (submit.js) recorded and queued every press; the same answer
   and verdict again within a second is now the first press (`SUB_LAST`, in memory only).
4. **Pasted or phone-typed characters failed matching.** `markNorm_` now drops zero-width characters and soft
   hyphens, straightens curly quotes and reads full-width digits as digits.
5. **The send was the smallest thing on the card.** 44px now (section 1).

Recommendations, not done here:

6. A decimal comma ("3,5") reads as a list of two; it needs a per-question rule, not a guess.
7. Five separate Check handlers (`qp-check`, `qp-rule`, `qp-send`, `qp-cells-check`, `pad-check`/`pad-send`,
   `qp-order-send`) each find their input and write their verdict; one `submit_(box)` dispatching on the box's kind
   would make every future fix land everywhere at once.
8. Multiple choice records on every tap after a wrong pick (`qp-choose`); a confirm step would stop mis-taps
   counting as tries.
9. A question with no `accept`, no `markWords` and the AI off shows Send only when signed in; signed out the child
   has no button at all. A visible "Sign in to send" would be clearer.
10. Answers typed while signed out stay on that device (`ansWhoOf_`); a prompt to claim them on sign-in exists (318)
   but is easy to miss.
