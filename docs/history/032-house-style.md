## House style

Follow it. It is unusual and it is deliberate.

- **Comments say WHY, and what went wrong before.** Not what the line does. Most of them are a bug
  report written from the far side. Match the density of the file you are in.
- **Fallbacks everywhere.** `brand(k, or)`, `|| []`, `try/catch` around anything that can be absent.
  An empty or broken sheet must still produce a working site.
- Plain scripts, no modules, no framework, no build.
- **A THING has tiles; a FORM has buttons.** This is the rule that decides which of the app's two
  action surfaces to use, and it was never written down — which is the only reason the app looked
  inconsistent. Measured: 46 inline `<button>`s against 21 `tile_()` calls, so tiles are the
  *minority*, and the split is by context rather than by accident.
  - **Tiles** (`tiles.js`, one renderer) are the action row under a **thing**: a paper, a tutor, a
    shop item, a session. One `tile_({icon, label, note, act, data})` per action, wrapped in a
    `.tile-row`. Tap targets, icons and the press animation come from one place, and `check-doors`
    pairs every `act` against a handler.
  - **Buttons** are the controls inside a **form or a dialog** — the booking form, the pay sheet,
    the composer. A form's buttons belong to the form.
  - **Tiles win any tie.** One renderer means one place to fix a tap target; 46 inline buttons is 46
    places to get it wrong. If you are unsure which you are building, it is a thing, and it is tiles.
  - A tile has room for a label and about three words of `note`. When an action needs a real warning
    — "everyone is withdrawn", "never as though Stripe had confirmed it" — put **one** paragraph
    under the row rather than one per button. See `jobAdminTiles_`.
- **THERE ARE TWO PALETTES.** The screen is black and gold (`--bg`, `--gold`, `--ink`, `--line`).
  Everything standing in for PAPER — the receipt, the job stubs, the roster, the print sheet, the
  calendar, the splash — is cream and warm ink (`--paper`, `--paper-ink`, `--paper-dim`,
  `--paper-faint`, `--paper-strip`, `--paper-rule`). Only the first was ever tokenised: the paper
  one was six hex codes written out by hand, `#f4f1e8` alone in 29 rule-groups, so "make the paper
  warmer" was a find-and-replace across ~70 declarations and one missed leaves a card with two
  different papers in it. **Never write a paper colour as a literal.**
- **Which palette a colour belongs to decides its scope.** A colour used by more than one component
  is a `:root` token. A colour that belongs to ONE component — a chess board's cream and charcoal,
  which is that board's own convention and not this app's — is defined on that component
  (`.chess { --chess-light: … }`) so it is named without being offered to the whole stylesheet.
- **Tap targets in `px`, everything else in `rem`.** Line 121 sets the root to
  `clamp(13.5px, 3.8vw, 16px)`, so a rem is 14.82px on a 390px phone. `2.75rem` for a 44px target
  comes out at 40.75px and still fails. A fingertip is the same size on every screen; it is the one
  measurement here that must not scale.
- Version constants — `BACKEND_VERSION`, `DOGET_VERSION`, `DOPOST_VERSION`, `BOOKING_VERSION` — are
  compared on the **whole stamp**, so bump all four together or the You screen reports the untouched
  ones as "Not deployed".
