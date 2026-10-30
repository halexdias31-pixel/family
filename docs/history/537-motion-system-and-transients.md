# 537 — Motion is one system, and transient surfaces come and go (package F)

**Asked:** the polish pass (531): *"feels so stable, like iOS made it"*. Package F of the plan takes rules U11 (every
transient surface enters and leaves with motion and is readable), U12 (motion is one system) and the expand half of U6
(a height that changes on the glass moves, it does not jump). The owner said yes to D9 (one speed, one springy curve),
D10 (every toast shown, long ones up long enough to read, wider, fading out) and D14 (reduced motion keeps the gold
"here it is" ring).

## The toast (js/shell.js `toast`, style.css `#toasts`/`.toast`)

Before: one `#toast`, its text replaced by the next message (a second toast a second later took the first one's place),
gone after 2.6 s whatever its length (118 letters at 160 px wide), removed in 0 frames, `left: 50%` with an auto width.

Now a stack in one live region (`#toasts`, `role=status aria-live=polite`, created once and kept). Each message is its
own `.toast` line, newest at the foot; older lines are lifted by `translate` (`toastStack_`), never laid out again, so
nothing on the glass shifts. Each stays `min(7000, 2000 + 50 ms × letters)`. It enters with WAAPI on `--dur-enter` and
the spring, and leaves with a fade on `--dur-exit`; it is removed when the fade's `finished` resolves, not on a timer.
The same words again re-enter on the same line with their time started over (a double press is one line). At most three
are up; a fourth sends the oldest out. The box is the app's width less `--s4` each side on any window (`left/right:
max(--s4, 50% − --app/2 + --s4)`), so a long one is wide. Colour `--toast-bg` on `--bg`.

**`#toast` is still the newest line.** Some forty flow checks read `getElementById('toast').textContent` right after an
action; a queue that held a message back for seven seconds would have made them all wrong, and a stack shows every
message at once instead, which is what "none lost" asks. When the newest leaves, the name passes to the newest still up.

## One expand motion (`expand_`, `expandOut_`, js/shell.js beside the sheet)

`expand_(anchors, mutate, {content})` reads where everything below the anchors stands (siblings after each anchor and
after each ancestor up to the page, at most 24), runs `mutate`, and slides each from where it was (FLIP on `translate`,
`--dur-move`, the spring); what the change shows opens downward (`clip-path` and `opacity`). `expandOut_(leaving,
mutate, {anchors, content, done})` fades `leaving` out first (`--dur-exit`), then runs `mutate` through `expand_`, so
the exit plays before anything is hidden. A move during a move starts where the eye sees it: positions are read with the
old slide running, then the old one is cancelled. Nothing runs under reduced motion or without `Element.animate`
(jsdom), where both are a plain `mutate()`, so every flow check sees what it always saw.

- **Folds.** A `click` on `window` (after every app handler, so a swipe's click, already prevented, toggles nothing)
  takes over a `<details>`'s own toggle: opening through `expand_`, closing through `expandOut_`; pressed again while
  closing, it stays open. `.ce-fold` keeps its always-open rule (its capture handler prevents first). The Tutor column's
  tick list grew 47 px in one frame with no motion (the audit); now it opens.
- **The sheet.** `sheetPlace_` split into `sheetWhere_` (where it will go, read first) and placing it, so `openSheet`
  can read what is below that place before it moves. Opening runs through `expand_`. `closeSheet` keeps its order and
  its promises — `onClose` runs at once, a sheet opened by it wins — but a sheet that really closes is drawn again with
  `.is-leaving` (no pointer) for its fade, then hidden, emptied and sent home, and what was below closes the gap. A
  second `closeSheet` during the fade does nothing; `openSheet` during it stops the fade and takes over. `inert` was
  tried and refused by `check-surfaces` (it reads as a page taking the screen over); `pointer-events: none` is enough.

## Compositor only

- **Bars grow by scale.** The poll's bar, the materials gauge and the pricing bars were `width` transitions (a layout
  every frame). Each is now full width scaled by `scaleX(var(--f|--x))` from the left. The pricing bar's four parts were
  flex items side by side; now each is drawn from the bar's start to the running sum (`--x`) and the earlier ones lie on
  top (`z-index` 4 to 1), so only a scale changes and the picture is the same. `check-flow`'s pricing check reads `--x`.
- **The record disc** morphed its own `border-radius` into a square. Now the white ring stays round and keeps a red dot
  (`::before`) and a red square (`::after`) that trade scale and opacity.
- **`.feed-art`'s `background-image .3s`** transition was dead (a gradient never interpolates) and is gone.

## Tokens everywhere else

Every release transition outside package E's press rules moved from `var(--quick) ease` to `var(--dur-quick)
var(--ease-out)`; the feed mark and the YouTube frame fade on `--dur-enter`; the reaction's landing pop on `--dur-enter`
and the spring (its 1.35 overshoot went with the second spring); `.lay-moved` and `.post-lit` on `--dur-mark` (the
shared-link ring was 2.6 s, now 1.3 s like the layout ring).

**Scripts.** `motionOK_()` is the one question: layout.js's `layCalm_`, games.js's `chessMotion_` (gone) and board.js
ask it. `MOTION_`'s movement durations read 0 while reduced motion is asked, live (the stylesheet says so too, but
`MOTION_` had read it once), and it is read again when the setting changes. The layout move (`layMoveShow_`) glides by
WAAPI `translate` on `--dur-move` and the spring, cancelling the glide before it, instead of a CSS transition cleared by a
360 ms timer that could land in the middle of the next move; its ring comes off on `animationend`. The notebook's glide
lasts `MOTION_.move` and, with less motion, is simply there. The chess board's turn reads its time and curve from its
own `--chess-turn`/`--chess-ease` (one source for the rotate transition and the scale that goes with it); the glides,
knock, comeback and flinch use the spring, `MOTION_.in`, `.out`, `.enter`, `.move`. The distance-scaled glide stays.

**Reduced motion.** The blanket `* { animation-duration: .01ms !important; transition-duration: .01ms !important }`
is gone. It took the "here it is" ring with it (1e-05 s, D14). The tokens zero every movement, and each loop that is
not a token (busy ring, loader dots, carets, chess ring, connect four) already had its own reduced-motion rule.

## The checks

- **check/motion.js** (static, in `--fast`) is no longer only a ratchet. Hard: a duration or curve written out that is
  not in `ACCEPTED` (each with its reason: the slide's own timing, the busy ring and loader loops, carets, the chess
  cinematic and the falling king, connect four's gravity, and the press rules package E rewrites); a transition or a
  keyframe of a layout property (anything neither composited nor paint-only); `transition: all`; reduced motion asked
  outside shell.js; a script writing its own duration or curve; an `ACCEPTED` entry that matches nothing any more. The
  counts still ratchet: 15 distinct durations (19), 11 curves (13), 20 duration literals written (30), 38 curves written
  (76), 28 paint-only transitions — package E's release washes.
- **check/jank/toast.js** — two toasts a second apart both on the glass, an entering motion, the same words re-enter, a
  fade running in each line's last 250 ms, a 118-letter toast at least 70% of the app's width and still up at 5 s, the
  stack empty after 8 s, a `role=status` region.
- **check/jank/expand.js** — every `<details>` on every column (drawn and paged to) opened and closed: a change over
  8 px needs a transform/translate/opacity/clip-path animation within two frames; it ends as it began. The sheet in the
  feed's front card: open and close each move, and 800 ms later it is hidden and home.
- **check/jank/reduce.js** — reduced motion emulated: `motionOK_()` says no and `MOTION_` reads 0; `.lay-moved` and
  `.post-lit` still last at least a second; a toast and the sheet move nothing; the notebook's glide is over the moment
  it is asked (a student's whiteboard).
- **check/jank/interrupt.js** — `layMoveShow_` twice 120 ms apart on the calculator's card (a 120 px spacer in and out):
  the second glide starts within 3 px of where the first had got to, no frame jumps further than the move itself, and it
  ends where it began. At a phone width only: at 1280 the column re-centres as the card grows, which is package G's.

## Proof

Each new gate red on a mutation, green again on the real files:
- `expand_`/`expandOut_` made to run `mutate()` alone: 12 findings, the staff fold 47 px with no motion opening and
  closing for all three visitors, the sheet 380 px with no motion and no fade.
- The old `toast()` back: 6 findings (no entering motion, the first message replaced, no re-entry, a 118-letter toast
  gone before 5 s, none seen leaving, no live region).
- The blanket `.01ms` rule back and the notebook's reduced-motion gate taken out: `.lay-moved` and `.post-lit` last
  1e-05 s, the glide still running.
- The old CSS-transition `layMoveShow_` back: the second move started 62 px from where the first had got to, a frame
  jumped 182 px, the card ended 10 px out.
- check/motion.js on a copy (`MOTION_CSS`, `MOTION_JS`) with a `width .37s ease-in-out` transition, a `height`
  keyframe, `transition: all`, a script's `duration: 300`, a script asking `prefers-reduced-motion`, and `.hr` renamed
  (its exception stale): 12 findings, one of each; the real files green.

## Not done here

The paint-only release transitions (`background`, `border-color`, `color`, `box-shadow` on 28 rules) are package E's
press look; they are counted and may not grow. The slide's own timing (`.screen`, 527) and the keypad's caret (528) are
theirs. Anchoring the card in front while something grows at 1280 is package G's.
