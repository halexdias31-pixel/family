# 536 — One press look, at once, on every control (package E, rule U9)

**Asked:** the owner's *"feels so stable, like iOS made it"* (531). The touch audit found 97.5% of controls took
130 ms to press in, 326 control instances with no press look at all, the mark lost at 1.2 s with a finger still
down, `:hover` sticking after a tap, and a disabled Send passing its tap to the receipt under it. The owner said
yes to D7 (one press feel: about 4% for buttons and tiles, less for whole cards, a faint light wash; tiles sink
less than the old 12%) and D12 (holding a button or answer selects no words and pops no link preview).

## The base block (style.css, after the `*` rule)

- **The wash** — every control (`[data-do]` that is not a field, `.tab`, `button`, `summary`, `a[href]`, a label
  around a checkbox or radio, `[role=button]`) lays `linear-gradient(var(--press-wash), var(--press-wash))` as a
  `background-image` while `:active` or `.is-pressed`. A layer and not a `background-color`, so a gold button
  stays gold and a tinted tile keeps its tint. `:is(:active, .is-pressed)` is written twice so the rule is
  (0,2,0): it beats the `background: none` reset almost every button carries, and loses to a component's own
  press rule. Paper surfaces (`.paper`, the sign-in slip, statements, the calendar, the ordering strip,
  Scrabble, chess) set `--press-wash: var(--press-wash-paper)`, so their wash is dark. The calculator key and the
  reaction pill take the wash off their 44 px cell (`background-image: none`) and press their drawn cap instead.
- **Frame one** — a pressed control and everything inside it has `transition-duration: var(--dur-press)`
  (`!important`: no component may ease a finger in). Only the release eases, with the component's own duration.
- **No selection, no callout** (D12) — `user-select: none; -webkit-touch-callout: none` on the same controls;
  fields set `text` back, and `.is-held` (the padlock's copyable card) is later and wins.
- **One disabled look** — `opacity: var(--disabled); cursor: default` on `.btn .tile .chip .kt-rung .imp-step
  .cmt-x .cam-shot .cam-rec` when `[disabled]` or `[aria-disabled=true]`. No `pointer-events: none`: a disabled
  control takes its own tap. A busy `.btn` is not dimmed (its ring says it is waiting). A board square that is
  taken (Connect 4, Othello, word search) is disabled too but is not "not yet", so it is not in the list.
- `.kp-*` is left out of all of it: the keypad (528) owns its own press.

## Every component press, onto the tokens

Forty-one declarations: every press `transform` is `scale(var(--press-small))` (tiles .88, chips and pills .94,
buttons .97, keys .9 or .92 before) or `scale(var(--press-card))` (cards, coupons, a post's picture); translate-only
presses (multiple-choice options, ordering items) scale too. Brightness filters went (button, chess square,
calculator cap) and literal washes went (the brown `#221e19` on `.card.tap`, `.05` lines, `--raised` poll rows,
`--line` keys, `#101215` on the timer) — the base wash or `var(--press-wash)` in their place. Every press rule that
was `:active` alone is `:is(:active, .is-pressed)`, so it lasts as long as the mark. The three bare `:hover` rules
(`.dock-row`, `.msg-flag`, `.add-card`) are inside `@media (hover: hover)`. `--react-mine-down` went with its rule.

## `pressMark_` (js/shell.js)

- Selector widened from `[data-do], .tab` to `[data-do], .tab, button, a[href], summary, label, [role="button"]`
  (`PRESS_SEL_`): a calculator key, a link tile and a fold were never lit.
- The mark goes two frames after `pointerup`, `pointercancel` or a drag; the 1.2 s orphan timer starts at
  `pointerup`, so a held press stays lit. `pressDone_` clears only the press it was asked for.
- A passive `touchstart` on the document is the app's own promise that iOS paints `:active`; the measuring
  tool's listener in find.js no longer carries it.

## The checks

- **js/check-css.js 8b** (static, in `--fast`): a press rule's transform/filter/background is `var(--press-*)` or
  `none` (a pseudo-element may translate); every `:hover` is inside `(hover: hover)`; the base rule sets
  `user-select` and `-webkit-touch-callout` to none; no disabled rule sets `pointer-events: none`. On the old
  stylesheet: 41 findings.
- **check/touch/** (browser, `check/touch-walk.js` walks every column of `TABS` once per page at 390, a stranger
  and an admin, pressing up to four controls of each kind): `every-control-has-a-look`, `instant`, `no-select`,
  `disabled-swallows`, `mark-everywhere` (a trusted CDP touch, click swallowed, on a button without `data-do`, a
  link, a summary, a label, a `[data-do]`; the fixture has no link, so the walk draws one with `tile_({ href })`
  and takes it away), `mark-lifetime` (held 1.5 s still lit, out three frames after the lift).

## Proof

Each gate made red by a mutation and green again on the real files — see the commit message for the counts.
