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
