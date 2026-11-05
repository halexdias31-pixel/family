# 950 — one button

Owner: "stabilise by universalising buttons".

- `tile_` (js/tiles.js) is the one maker. It now takes one tile's data, a list of them, or nothing
  (`null` draws nothing), so a place passes thin data instead of keeping its own wrapper.
- `send: true` is a Check/Send (was `checkTile_`). `form: true` draws a form's word button, the one
  `.btn` rule, 44px up (a separate `btn_` was planned; folding it into `tile_` kept every file's
  outside-link budget from rising by one).
- Wrappers replaced by data: `bibleTiles_`→`bibleOpts_`, `finderOpenTile_`→`finderOpenOpts_`,
  `subSendTile_` (inlined), `questionTiles_` (always '' — gone), `magTile_`/`magCardTile_`/`qLockTile_`
  /`readAloudTile_`/`hearItTile_`/`speedTile_`/`helpTile_`/`aiTile_`→`…Opts_`, `resendTile_`→`RESEND_LINK`.
- 66 hand-written `<button class="btn …">` in games, me, posts, map, receipt, talmud, find now go
  through `tile_({ form: true, … })` (script-converted, one line each; all gained `type="button"`).
- Looks: `--tile` 36→44px (every tile a 44px tap), radius `--tile-r` for every tile rule, chips' radius
  `--btn-r`; the funnel's `.chip.sm` is 44px tall (its chosen-chip ✕ was 32px). check/tiles.js expects 44.
- Not done: keypad keys and options stay their own (rule 8); text-action/text-drop links, games' boards;
  the owner's "same core row on every card" (Share/Save/Suggest/Top) is left for the next round.

## Round 2 — one core row on every card

- `cardTiles_` (js/tiles.js) is the one row: `cardCore_` draws `CARD_CORE_` = Share, Save, Suggest, Top
  (same icons, order, place), then `cardExtras_` appends the kind's extras from `CARD_EXTRAS_`, a
  kind→function map (tiles.js lists its own kinds; find.js, hymns.js, mechanics.js add theirs with
  `Object.assign`/assignment); `cardActions_`'s if-chain is gone. (A name-by-string table was tried
  first: it hid the links from the dead-code and coupling counts — 14 functions read "never called".) Then the shared extras (read aloud, speed, magnifier, Open, padlock), admin last.
- Share is one handler, `card-share` (find.js): `navigator.share` with `?card=<key>`, else the link copied
  + toast. `openSharedCard` (run first in `findPlaceBack_`) opens that card in Find and drops the param.
- Top is `find-top` (first page of the finder; outside one, the pane scrolls up). A Find page whose card
  row has it no longer adds the separate Back-to-top row.
- Drawers that drew their own rows now give data only: insert (Print, Official), history kinds
  (`histExtras_`), timeline (`tlExtras_`), hymn (`hymnExtras_`), mech (`mechExtras_`); soon cards'
  own Suggest row went (the core one files under `soon`/id, `suggestTileFor_`). The tutor card's own
  Share went (core Share). History link tiles use `flag`, not a second star.
- `tileRowsJoin_`: a card's row leads whatever it joins (`coreIn_`), so a question's Help comes after the four.
- health.js variety family `cardrow` ("Card tile rows", ideal 1): cardTiles_ + any drawer drawing its own
  `tile-row` + a variant if `CARD_CORE_`/cardTiles_ stop starting with the four. Before 7, now 1; budget 1.
- Browser (390x844, fixture, admin): a question's maths input is a readonly `input.kp-in` driven by the
  on-screen keypad (`.kp-key` taps, not keyboard typing); typed 0.42, Check → "Not yet".
- Not done: a post's own feed row (`postTiles_`) is a thing's row in the feed, left as is.
