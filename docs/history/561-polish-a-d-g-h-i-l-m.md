# 561 — The rest of the polish pass: steady redraw, honest failures, inert pages, coalesced arrivals, px radii, controls, picture sizes (A, D, G, H, I, L, M)

**Asked:** the polish pass (531; owner: *"feels so stable, like iOS made it"*). B, C, E, F, J, K and P0 landed
as 531–542. This note covers the seven packages that were paused. Each landed as the rule, not an instance, and
each in the smallest form that holds the rule; what was left for later is listed at the end.

## A — Steady redraw (U2, U5)
- `paint()` (shell.js) records every scrolled box in the column, keyed by its path of child indexes and tag
  names, and the focused id, before the `innerHTML` swap (`placeKeep_`), and puts them back in the same task
  (`placeBack_`). A box whose path no longer matches is left at 0. A column still holding the boot's markup is
  not kept (there is nothing to keep).
- index.html's head says `html.wide` before the first paint at 700px; `check-css` fails if that number is not
  shell.js's `WIDE_FROM`. The body no longer jumps from phone to wide when shell.js runs.

## D — A failure is said once, in words (U13)
- 32 toasts and said-lines that printed `err.message` raw (so "Failed to fetch" reached a person) now say
  `why_(err)`. New `js/check-said.js` fails any toast/textContent/innerHTML line showing `err.message` or
  `String(err` outside `why_(`. Mutation: one line in staff.js back to `String(err.message)` turns it red.
- Not done: `applied_` (optimistic DATA mutation + rollback) and the one `failed_` card. Both touch ~20 handler
  bodies each and want their own pass.

## G — Inert pages (U15)
- `pageWrite_` sets `inert` exactly where it already set `pointer-events: none`: a page a finger cannot reach is
  out of the Tab order too. No new rule about which page is on; it follows the slide's own answer.
- Not done: first-placement flag, anchoring, rubber-band, wheel latching (the slide's own code).

## H — Arrivals are one repaint (U4)
- `writingCame_` (writings.js): eight writing sources landing together each repainted every finder in the same
  task. Now they book one `setTimeout(0)`; it paints the finder in front and `markStale_`s the other, which the
  ahead builder draws later. Inside `finderEach_`, so each finder is bound (CLAUDE.md "One finder, twice").

## I — Radii in px (U17)
- Every `border-radius` in rem (50 lines) is now px at 16px a rem, rounded. `check-css` fails a rem radius.
  The type scale and surface flattening are not in this pass.

## L — Controls are controls (U15)
- `.text-action` links (Try again, Add someone by their handle) and the calendar arrows are `<button
  type="button">`; the facet answers, Skip, the reel slide, the race canvas, the avatar swatches and the circled
  words carry `role="button" tabindex="0"`. A `[role=button][data-do]` that is not a button presses on Enter or
  Space (shell.js keydown). One `:where(:focus-visible)` gold ring; `.search:focus` border is the accent.
- `check-strings.js` fails a `data-do` on a div/span/li/canvas without role and tabindex (`ROLE_OK` names the
  feed's delegated surface).

## M — Pictures carry their size (U20)
- The camera's composer sends `imageW`/`imageH` for the first picture; `addPost` writes `image_w`/`image_h`
  (new posts columns in SCHEMA); doGet sends `imageW`/`imageH`; a single picture's `<img>` takes them as
  width/height, 800×1000 (4:5) for a legacy row. The fixture's PO1 carries 540×540.
- **Backend change:** all four version stamps bumped. Deploy per CLAUDE.md, then open the site as an admin so
  setup adds the two columns.
