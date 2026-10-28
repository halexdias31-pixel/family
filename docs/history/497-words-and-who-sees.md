# 497 — Edit words in place, and Who sees this

The owner approved two "edit it myself" features, on the principle that **the admin changes the site
without asking Claude**:

- "Edit words in place" — every widget's and card's words typed over where they stand, saved for everyone.
- "Who sees what" — per widget or card, who it is shown to, narrowing only.

## A. Edit words (js/words.js)

- `words_(key, fallback)` is the lookup, the `brand(k, or)` pattern: the admin's text or the code's.
- **Where they are kept:** config's one `words` row, a JSON `{key: text}`, sent by doGet as `words`
  (`wordsClean_`, core.gs) and written by the admin-only `wordsSave` (dopost.gs; `ACTION_ACCESS`), which
  merges `set` and removes `reset` keys. Not the `brand` tab: brand is read off the repository now (581 in
  doget.gs), so the sheet's brand rows would never reach the site. Config is where `layout` already lives.
- **Keys:** `<card id or w:widget id>|<slot>`, the slot the kind (`h` heading, `p` line, `s` a button
  card's say line, `ph` placeholder) and a hash of the code's own words, so a piece keeps its key when the
  code reorders a card; if the code's wording changes, the piece falls back to the new code wording.
- **What is converted** — one pass, `wordsIn_(scope, html)`, over everything drawn as a widget
  (`widgetOnColumn_`, `widgetMergedOn_`), a card (`cardSayIn_`, so every card on the card columns and
  merged parts), and an item (`itemMark_`: festive, camera, D'Aive). It marks every heading `h1–h4`,
  every `<p>` whose content is text alone (CARD say lines, one-line descriptions, empty-state lines),
  the say span of a button card, and every `placeholder`.
- **Not converted:** tile labels (tiles are icons; the label is only `title`/`aria-label`, not visible),
  pieces with markup inside them (a heading with a count badge, a line with a link), button and option
  text in forms, `toast()` messages, the funnel's questions (editorial already, `facets`/`kinds` tabs),
  pages after the first of a multi-page card, the column titles (custom columns have Rename).
- **Safety:** an edited piece is read with `textContent` and drawn with `esc()`; the backend strips
  control characters and caps a piece at 300 characters, the row at 40 000. Typed `<script>` shows as text.
- **Reset this text** beside every changed piece posts its key in `reset`; Save with a piece typed back to
  the code's wording (or emptied) also resets it. This is editing, not the layout's (absent) undo.

## B. Who sees this (layout `seen`)

- `seen: {id: level}` in the layout, levels `out` (signed out only), `in`, `student`, `client`, `staff`,
  `admin`; cleaned by `layoutSane_` and `layoutClean_` alike.
- `seenOk_(id)` is asked **after** the code's own gates: `widgetFor_` (so `widgetsOf_` and the pager
  counts), `cardArrange_` (a card's own column and one moved in), `itemGone_` (items and the feed's
  camera count), and `frontGo_` (nobody is sent to a front door they cannot see).
- It can only narrow. Levels below the code's known gate (a widget's `admin`/`tutor`/`signedIn`, a card
  on an admin column) are not offered, and would not widen anything anyway since both are asked. The box
  says so. An admin still sees everything, or a thing narrowed away from them could never be widened.
- It opens in place under the tile row, one label/value line, never a pop-up.

Checks: two journeys in check-flow (`edit words in place (497)`, `who sees this (497)`).
