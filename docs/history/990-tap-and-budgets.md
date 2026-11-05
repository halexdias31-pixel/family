# 990 — taps answer at once; the 960/970 budgets won back

## Tap response (check/qcard.js, data/qcard-health.json)

Before → after (first / second tap, ms to a visible change):
- card-share 487/999 → 0/0; card-cancel 128/79 → 0/0; lay-split 603/557 → 0/0. These are in `SLOW_ACTS_`
  (shell.js, beside `on`): the tile gets `aria-busy` at once (the same ring as `.tile.is-busy`) and the work
  runs after the next frame. `aria-busy`, not `is-busy`, so a `send_` inside keeps its own ring.
- pad-undo 1/999, pad-clear 17/999 → 0/0: nothing to undo or clear is now a dimmed (disabled) tile, set when the
  pad is drawn (`padBar_`) and on every `padRepaint_`, so a second tap is no longer a tap that does nothing.
- card-save 8/999 → 0/0: a second Save with nothing changed now reads as the dimmed/no-op state.
- The check counts a disabled or `aria-disabled` tile as a deliberate no-op (0 ms). voice-try is skipped:
  headless Chromium has no voices, so it speaks and draws nothing there — not testable headless.
- qcard budget tap-response 7 → 0.

## Budgets back at or below their pre-raise values

- find.js lines 12245 → 12068 (pre-raise 12122): the one-part-per-page model is gone with `QPAGE_PARTS`
  (`pageParts_`'s stem/pre/ans pages, `questionStemCard_` — its body lives on as `qStemWhole_` —
  `questionPreCard_`, `stemOnCard_`, `qFoot_`, `qPageTools_`, the `sfig` block), plus unused `facetRaw_`,
  `TOPICS_MEMO`, `QUESTION_CLASSES`, `histSpec_`, `bibleBook_`, `surfaceOf_`, `qNum_`, `printRatePence`.
  A stale place naming an old part still lands on the question's card (`stuffPart_`).
- find.js one-offs 168 → 128 (pre-raise 167): every `x.kind === 'question'` / `!== 'question'` test reads `isQ_`
  (incl. the bundle-title one at ~10370).
- find.js coupling 297 → 295: `libS` read inline; `kpWordsSay_` takes the text (both callers passed `kpWordCount_(text)`).
- qtools.js coupling 41 → 40: `questionCard_(x, was)` redraws a `.qb-part` itself, so qtools no longer names `qPartCard_`.
- shell.js coupling 187 → 186: `goPage` always goes through `inFinder_` (a no-op for the bound finder) and
  `goPageHere_` does the turn, so shell no longer reads `FINDER`. Also: a duplicated comment and the unused `PER_PAGE`.
- keypad.js coupling (66, over its 65 since 970) → 65: resume.js no longer calls `kpRender_`; the `input` event it
  fires already redraws a keypad box.
- style.css 7189 → 7179 (pre-raise 7184): `.qsheet-more`, `.qstem …`, `.qtool-tiles` had no markup left.
- searchBytes 7497677 → 7469069 (pre-raise 7483332): also the check-flow tests of the per-part pages (stem-first page order, long-part
  cuts, figure-on-stem-page, the (d) opening page — the 960 list of stale tests), which only tested the removed functions.
  check-answerable draws the whole card (`questionWhole_`) instead of each stem/pre page.

The full `node tools/health.js` run ratcheted the budgets down to these values; health score 33.3 → 33.7.

check-flow still holds other 960-stale tests (listed in 960); not run this round.
