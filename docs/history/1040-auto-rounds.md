# 1040 — unattended health rounds

Each round fixes what does not change the look, plus what the owner asked for outright
("pressing a tile never adds/removes/moves other controls"); anything else visible goes to `docs/owner-questions.md`.

## Round of 2026-11-05

- Reports refreshed: `tools/facet-data.js` (facet-health), `check/qcard.js` run once.
- stable-controls 12 → 9: the status lines under Save (`.me-said`, `#pin-said`) keep one line of room from the start, so Change PIN's message no longer moves Try voice and the report box. The rest are questions.
- static-controls 5 → 2: `check/qcard.js` read a one-line `on('card-share', …)` as never ending, so `myResultNew_` (tags, not controls) was blamed; the scan now ends a handler at the next top-level declaration. Talmud's size tiles are redrawn inside their own row instead of replacing it.
- check-actions red → green: favLinksSave, rewriteCheck, rewriteIdeas carry "switched off, kept for attic/js/…" reasons.
- A tombstone comment pair (referral sheet) in `js/me.js` dropped; the story is the `on('my-referral')` history above it in git.
- Dup waitlist rows in `backend/dopost.gs` left: their fields differ, so merging could change what is written.

## Round of 2026-11-05 (2): Find cut into sixteen files

- `js/find.js` (12,081 lines) is now `js/find-finder.js`, `find-facets`, `find-history`, `find-boxers`, `find-parts`, `find-marking`, `find-cells`, `find-pen`, `find-pad`, `find-loupe`, `find-figures`, `find-aloud`, `find-levels`, `find-bundles`, `find-pages`, `find-measure` (all ≤ 790 lines), in that order where `find` stood in `FILES` and `LATER`.
- Cut in source order at top-level statement boundaries (acorn), not by the plan's prefix groups: order unchanged means load order unchanged. No edits inside any block; one statement moved: `window.CARD_EXTRAS_MORE = …` to the end of `find-boxers.js`, after `bibleOpts_` (a function no longer hoisted across files).
- `tools/find-src.js` gives the checks Find as one text (`findSrc()`) or its file list (`findFiles()`), read from `index.html`; none found throws. About 25 checks and tools now read it instead of `js/find.js`; check-drafts, check-writings, check-finder, check-widgets, check-tiers, check-strings, check-changed, facet-hues and health.js know the pieces.
- `tools/structure.js` ratchet: a removed file's functions and counts pass to the files cut from it, so a split is not new giants; `health.js --changed` weighs Find's pieces' empty catches together and keys one-offs to `js/find.js`.
- Fighter-name facet mismatches (11): the data is right (a fight has two fighters); what the tag shows is a look, so it is a question.
- The § stories of the pieces stay in `docs/notes/js/find.js.md`.
- Budgets raised by hand, for the split alone: coupling `js/me.js` 184 → 187 and `js/talmud.js` 25 → 29 (they read Find's names, now from several files); `searchBytes` 7,472,098 → 7,472,640 (the checks' new lines that read the pieces). A `--changed` run before `git add` measures untracked pieces as absent and tightens wrongly; stage new files first.

## Round of 2026-11-05 (3): me.js, shell.js and keypad.js cut in order

- `js/me.js` (4,867 lines) is `me-account`, `me-messages`, `me-roles`, `me-shelves`, `me-settings`, `me-card`, `me-people`; `js/shell.js` (3,932) is `shell-boot`, `shell-layout`, `shell-pages`, `shell-click`, `shell-api`, `shell-hold`; `js/keypad.js` (1,785) is `keypad-keys`, `keypad-pad`, `keypad-edit`. All ≤ 780 lines, in place in `FILES`, `LATER` (keypad) and tiers.json (`files`, `later`).
- Same method as round 2: acorn top-level boundaries, pure moves, concatenation byte-identical to the old file. A scan for load-time use of a later piece's name found none (two hits were object keys).
- One edit: keypad.js declared `kpSelect_` twice; the first (overridden by hoisting, same behaviour) is deleted, since across files check.js counts it as declared twice.
- `tools/piece-src.js` (`pieceFiles(base)`, `pieceSrc(base)`) reads any cut file back by its old name from `index.html`; none found throws. check-anims, api-deadline, css, people, press-hold, profile, surfaces, tiers, voice, drafts, loading, suggest, widgets, strings, keyboard, aimark, library, flow, check/motion, tools/tiers, cache, structure and health.js read the pieces.
- `tools/isolation.js` counts the pieces of me/shell/keypad as one caller, as the old file was: the cut otherwise raised six find-* coupling budgets by counting each piece as a new file.
- check-widgets failed before this round: every widget is off (tiers.json, 4 Nov), so none draws itself and each `pure: true` read as unproved. A stale check, not a site change: off widgets are now left out of the `pure` judgement.
- `searchBytes` kept under budget by deleting nine unused declarations in `js/check-flow.js` (`CARD_ORDER_`, `seatSaid_`, `seatParts_`, `seatNote_`, `placeholderFaults_`, `pageHead`, `rowSay`, `earCut_`, `resPick_`) and `PLACEHOLDER_MARKUP_`.
- Browser 390x844: sign in, Find menu pick, a question keyed on `.kp-key` and Checked, Settings field changed and Saved (`updateProfile` sent, "Saved"), sign out — no page errors. No owner questions this round.

## Round of 2026-11-05 (4): the drawing marker in stages, reasons in catches

- long-fn 30 → 29: `drawMarker_` (645 lines, `js/find-pen.js`) is now `drawGeom_`, `drawFrame_`, `drawInk_`, `drawShapes_`, `drawKinds1_`…`drawKinds5_`, `drawExample_` and a 40-line `drawMarker_` that joins them; each stage gets the earlier stages' names from one object and returns its own. Every statement is moved unchanged (acorn cut); the four plain-geometry helpers once after `KIND` (`latSnap`, `onDots`, `convex`, `cross`) now sit in `drawGeom_`, which changes nothing since they are only called later. `KIND` keeps its key order (`Object.assign` of the five parts). check-marking (all 221 cases) passes before and after; it now cuts the new names too.
- find-pen.js kept at 800 lines by dropping three blank lines; `priceFrom`, `loadOnce_`, `typeset_` left (long sequences sharing many locals, not a quick pure cut).
- Empty catches: 22 in `js/answers.js` and `js/data.js` got a one-line reason (storage blocked, a page mid-change, a bad stored value reads as none); none calls `oops_`, so no new traffic. check-catches 339 → 317, ceiling lowered to 317. health.js strips comments before counting, so its `catch` count (332) does not move: a reason makes a catch deliberate for check-catches, not for health.
- One-off: `find-aloud.js` speaks a non-question through `!isQ_(x)` (x is already read there). Same count: the line still tests `'content'`. The repeated `x.kind === 'question'` in tiles.js, working.js and submit.js were left: `isQ_` lives in a LATER Find file that tiles.js cannot count on.
- Budgets raised by hand: `searchBytes` 7,471,060 → 7,473,886 (the stages' name lists and the catch reasons); coupling `js/answers.js` 46 → 52 and `js/data.js` 70 → 86 — the same numbers at HEAD before this round (isolation.js measured before and after), stale since round 3, shown only because these files were touched.
- Browser 390x844: sign in, Find menu pick, `.kp-key` + Check, a drawn line on a draw_answer question's pad then Undo (strokes 2 → 1), pad Check, Settings Save (`updateProfile`, "Saved"), sign out — no page errors. qcard output identical to HEAD. No owner questions.

## Round of 2026-11-05 (5): the shared kind tests load first; deliberate catches counted apart

- `js/predicates.js` (new, core, in `FILES` straight after `core`, so before every user): `isQ_` moved there from find-boxers.js unchanged, joined by `isContent_ isFight_ isProject_ isShop_ isPractical_ isManuscript_ isBoxer_ isBible_ isWriting_` (an item's kind), `isPrint_` (a basket line), `isAiMark_ isWordsMark_` (a marker), `isTutorsCol_ isStudentsCol_` (a people column). Named predicates.js because `js/rules.js` is already the Rules card. `rankAtLeast_` stays in core.js, already first.
- 73 literal tests in core files became calls (`x.kind === 'content'` → `isContent_(x)`, `!==` → `!isContent_(x)`), only on plain `x it item card y q / c / m / col` operands outside comments, never as the operand of another comparison. Each predicate is `!!x && x.kind === …`, which differs only for a null item, where the old test threw. one-off 347 → 299 (the 15 definitions count, budgeted), find-one-off 75 → 31.
- health.js agrees with check-catches: a catch whose body is only a comment is `deliberate` (listed, priced 0) and only a truly empty one is `catch`. Then 56 silent catches in core js got a one-line reason by what they guard (storage blocked, focus/scroll on a gone element, a bad stored value reads as none, a draft not kept); no `oops_`, no behaviour change. check-catches 317 → 261 (ceiling lowered); health catch 332 → 118 silent + 214 deliberate.
- Heavy checks under the lock: `tools/facet-hues.js --check` is current (about 20 minutes; it timed out at 9 before). `check/cards.js` runs to the end and fails on 9 rows of one AQA sheet 69px past the column at 320px — a layout question, not a split break (owner-questions.md). Its "pane caps at NaNpx" is stale: a bare `.pane` has no `max-height` outside `#screen`, so the tall-page count is vacuous; left for a round that can rebuild it.
- Budgets raised by hand: `searchBytes` 7,473,886 → 7,476,432 and `commentRatio` 0.263 → 0.266 (the 56 reasons and the new file); coupling library 26 → 34, submit 80 → 84, tiles 63 → 74, working 29 → 31 (each call to a predicate is a link to another file).
- Score 37.3 → 38.9. Browser 390x844: sign in through the form, Find menu pick, `.kp-key` + Check, two pen lines on Q7's pad then Undo (2 → 1), Settings Save (`updateProfile`, "Saved"), sign out (`signOut`) — no page errors. One owner question (the AQA sheet).
