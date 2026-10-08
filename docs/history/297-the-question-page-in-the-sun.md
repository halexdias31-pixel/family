## The question page in the sun: Questions means questions, no ↓ tile, a chat bar with Send, a keypad you can see

**Reported from a live lesson on a pupil's iPad, outdoors, 8 Oct:**

- *"answers shouldnt even be showing up when all ive done is clicked questions. the answers still show up."*
- *"there doesnt need to be a scroll down tile on questions."*
- *"when using the ipad in the sun its hard to see keypad and each button especially backspace, which i thing should be red."*
- *"the answer box should look like a chatbox. with send tile. we found it hard to find answer box in the ipad in the sun."*
- *"they keypad was a bit unstable. it wasnt working at first for some reason."*

### What was measured before anything changed

| Complaint | Cause |
|---|---|
| Answers with Questions chosen | `pageParts_` gives every question with an answer an `ans` page, and `stuffPages_` filtered one way only: Answers kept answers alone, Questions kept everything. On the Corbettmaths subtraction sheet that was 59 pages, 27 of them answers, alternating. Each was shut ("Answer hidden"), but a card tagged **Answer** under every question reads as the answers showing. The chips were also the alphabet, so **Answers was the first chip** — top left — and one tap on it opens every answer, for anybody. |
| The ↓ tile | `To the answer` on every question card (and on a drawing page after its card), turning the strip by the answer's place in `pageParts_`. Once Questions drops answer pages it would have counted pages that are not in the strip and landed on the next question. |
| Can't see the keypad | Keys `--sunk` on a black pad: **1.03:1** face, **1.34:1** edge. ⌫ a thin `⌫` glyph in `--dim`. |
| Can't find the answer box | The box `--sunk` on a `--raised` card, **1.04:1**, its rule **1.25:1**, Check's plate **1.05:1**, and nothing written in it. Only the text was ever measured (`check/ui.js` rule 3), and every glyph passed. |
| Unstable keypad | A redraw (`repaint()` on signing in, again when `load()` lands ~15 s later) replaces the card and the box being typed in. Chromium fires `focusout` for the removed box and the pad closed; **WebKit and jsdom fire nothing**: the pad stayed up, `KP_AT` named the removed input, and the next key typed into a box no longer on the page — the 5 was lost while the screen still said 7. Also: `touch-action` only on the keys, so a double tap in a gap could zoom the iPad; no press state Safari would show (`:active` only); and ⌫ after a filled slot took the `)` alone — `123/(4)` → `123/(4` → `123/(46`. |

### What changed

- **The kind chip means what it says.** `Questions`: the question, its opening and its figures, never an answer page (`questionsView_`, the `qOnly` cut in `stuffPages_`). `Answers`: answers alone, open, as before. No kind chosen — "Doesn't matter", a search, Saved — each answer page still follows its question, shut until Show (the 5 Oct wish). The same for a tutor and a pupil. If both chips are chosen, Answers wins.
- **What kind is in `KIND_BUCKET`'s order** (`orderOf`, `bucketTable_(...).within`): Questions, Answers, Practicals, Projects, Bundles, Films, Resources.
- **A wrong tap says "Not yet — see Answers"** — it names the chip, because with Questions chosen there is no page after.
- **The ↓ tile is gone everywhere**: `questionTiles_` (now the Figure tile for tapped questions and the done date), the drawing page's `.qfig-tiles` row, `ansWhere_`, `on('qa-go')`, and the `next` icon, which nothing else drew. The answer is a swipe.
- **The answer box is a chat bar** (`ansBox_`): a paper-palette field (`--paper`, tokens only, 17:1 on the card), rounded at half its height, saying **"Type your answer"** while empty (a placeholder on the textarea, `.kp-show:empty::before` on the maths box). **Send** is a gold round `tile_` (`tone: 'send'`, `.tile.is-send`) beside the field on the dark card — still `.qp-check`, so the handler, ✓ and every check find it unchanged. **Mark with AI** is the same tile in the same place (`aiTile_`, was `aiBox_`). A box with no scheme and no AI has no tile. The verdict is a reserved line under the bar, inside `.qp-mark`, so marking still moves nothing. A ring, not a rule: gold while typing, green/amber once marked. A worded box starts one line high and grows. Multiple-choice options stay buttons.
- **The keypad, for sunlight**: lit keys with the colours named on `#kp` as component tokens (as `.chess` does) — digits `#f2f2f2`/`#111` (18.8:1), structures pale amber with brown ink, moves mid grey with white, ✓ gold with Send's paper-aeroplane mark, and **⌫ red** (`--bad`, the owner's ask and the one stated exception to "red means wrong") with a black drawn SVG glyph (white on that red is 2.99:1). Keys 48px, 44 on screens ≤600 tall, 56 from 700 wide. `touch-action: manipulation`, no selection, no callout on the whole pad; `.kp-key.is-pressed` so a press shows on the iPad.
- **The keypad survives a redraw** (`kpLive_`, `kpFind_`, `kpTake_`, `KP_WAS`): a key asks for the live box first; if the one it named is gone, the box that replaced it is found by its `data-k` (on the page in front, then anywhere), focused without scrolling, and the caret put back where it was. A different key (somebody else signed in) finds nothing and the pad closes. `focusout` on a removed box refocuses the replacement instead of closing.
- **⌫ never leaves a stray bracket.** A filled pair is stepped over, not broken: after `)` the caret steps inside; just inside a `(` it steps out to the left (across `)/(`, `^(`, `√(`, `/(`); just after a sign whose slot is filled it steps back over the sign. Empty structures still go whole. This is every pair, not only the ones a structure key typed — `(3)/()` loses its bottom and leaves `(3)`, which must not then be deletable a half at a time. An unpaired bracket deletes like any character.

### The instrument

`check/ui.js` gained **EDGE** (WCAG 1.4.11, 3:1): a control's face or border against the ground behind it, composited down the chain as the contrast rule does, on three subjects only — `.kp-key`, `.qp-bar > .qp-ans` and `.tile.is-send` — and it prints how many it measured. A subject never on the screen when Find was measured is a finding, not a silence. Every plate-and-mark tile in the app is ~1.1:1 by design, so the rule is not asked of them. It also measures `#kp` now: the pad is on `<body>`, outside every screen, and none of its keys had ever been measured for size or contrast.

**Proved red on the old colours** by putting them back on the new markup, in a copy of the tree, and
measuring Find at 390: 32 EDGE findings — the field 1.04:1 (`#050505` on `#0b0b0b`), Send as a plate
1.1:1, and every key 1.34:1 (`#050505` with a `#232323` edge on black). The two new states that read the
colours themselves (the box at rest, the keypad in sunlight) refused to arrive there as well. Green on the
real files: nothing new to report across 505 combinations of Find's states, sizes and visitors.

### Checks

- **check-flow**: new journeys — *a redraw with the keypad up keeps typing into the same question*; *with Questions chosen, no page of a two-part paper is an answer or holds one, for a pupil or a tutor*; *What kind offers Questions first and Answers next to it*; *the answer is a swipe after the card…and no page carries a tile to it* (replacing the finding-9 tile journey). The keypad journey asserts the bar, Send, the verdict line, the red ⌫ and Send's mark on ✓, and presses ⌫ to empty from three starts with the brackets paired at every step. Every journey that pressed `qa-go` now reads the swipe off the strip and asserts no tile. "Questions IS AS IT WAS" is now "Questions has no answer page; with no kind each answer follows its card". All of them were run against the code before this change and fail there; four were also proved by mutating the new code (the `qOnly` cut, `kpLive_`, the ⌫ step, `orderOf`).
- **check/states.js**: *the answer, swiped to from its question* (was *turned to*, by the tile); *Questions chosen, Q1 then Q2*; *What kind, Questions first*; *the answer box at rest, empty, with a Send tile*; *the keypad up, colours for sunlight*; *a repaint with the keypad up*.
- **check/swipe.js**: real touch on 7, ⌫, 5 on the first answer box of the run.

### Not testable here

WebKit itself: the missing `focusout` on removal (jsdom, which behaves the same, is what is tested), whether `.is-pressed` shows where `:active` did not, and the double-tap zoom in the pad's gaps. Each needs one look on the iPad.
