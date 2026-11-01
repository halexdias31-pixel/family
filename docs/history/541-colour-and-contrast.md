# 541 — Colour is tokens, and contrast counts the opacity (package J, rule U18)

**Asked:** the polish plan (531) for *"feels so stable, like iOS made it"*. Rule U18: no colour literal outside
`:root` or a component's own `--x`; never a paper literal; one ink-on-accent token; text dimmed with a colour,
not opacity; contrast of at least 4.5:1, worked out with every ancestor's opacity. Owner decision D8: *"Darken
it slightly (to pass the reading standard)"* for the faint writing on paper. Press, hover and disabled colours
belong to package E (536); the toast's colour to package F (537); the keypad's to its own work (528).

## What changed in style.css

- **Ink on the accent is `var(--on-gold)`**, everywhere a rule paints `background: var(--gold)`: it was written
  four ways (`#000`, `#111`, `#1a1409`, `var(--bg)`) across 19 rules. The checkbox tick and the warning banner
  (`--warn`, a bright fill in the same ink) say it too. Same colour on screen, now one name.
- **Paper draws in `--paper*`.** The roster slot (`#eeeadd`, `#cfc6b4`, `#a99f8f`) is a mix of `--paper` and
  `--paper-strip`, `--paper-rule` and `--paper-faint`; its tutor stripe is the component's own `--rost-tutor`.
  The docket's sheet and the notepad (`#fbfaf5`, `#f7f4e9`, `#fbf9f1`) are `--paper` mixed with white, so they
  move with the paper. The clipboard's wood, clip and the printed sheets' `--pa-*` greys are drawings, kept.
- **A paper colour on the black screen was a mistake in kind**: the chevron on a tappable card, the dotted
  underline, a missing face's initial and the drawings' signature were `rgb(244 241 232 / …)`, the paper colour
  at an alpha. The chevron and underline are now `--ink` at the same alpha; the initial and signature are
  `var(--faint)` because at `.3` they measured about 2.2:1.
- **A component's tokens said by name**: the print sheet's tick and say lines wrote `--pa-ink`, `--pa-mid` and
  `--pa-label` out by hand. Dead fallbacks went: `var(--raised, #1a1815)`, `var(--sunk, #111)`, and
  `var(--red, #ff6b6b)` — there is no `--red`, so the fallback was always what showed; it is `var(--bad)`.
- **Text dimmed by a colour**: `.w-blue-soft`, `.kt-done`, `.prof-words i`, `.qsheet-lines` and `.card-lock` mix
  their colour with `--bg` at the old opacity (the same grey, solid); the subject over a photo is `--over-ink`
  at 80%; a blank booking value is `var(--faint)` (it was `.45` of `--ink`, 3.6:1).
- **D8:** `--paper-faint` is `#6a635a` (was `#8a8175`): 5.24:1 on `--paper`, 4.58:1 on `--paper-strip` (3.39 and
  2.96 before). Anything paler fails on the strip, so faint now sits on `--paper-dim`'s lightness: the third
  voice on paper is no longer lighter than the second. If the owner wants three steps back, `--paper-dim` is the
  one to darken; that is a new decision, not D8.
- `index.html`'s "files did not arrive" page wrote the old `--paper-faint` as a literal; it reads `--faint`.

## The checks

- **js/check-css.js 7b** (widened from tiles to every rule): a hex or `rgb()` equal to a `:root` token, or to a
  component's own token, fails, with the token to say. Black and white stay legal: `#000` could mean four tokens.
  `ART_TONE` lists the drawings that keep their own palettes (consoles, calculator, chess, Scrabble, the neon
  times-table cabinet, the LED timer, the flyer, the word counter, the pad's instruments, the papyrus, the boxer,
  the keypad), one reason each. `#toast` is listed until package F's `--toast-bg` merges.
- **7d**: a light warm literal anywhere (a paper colour written out), or a hex in a rule that draws with
  `var(--paper…)`; ink on `background: var(--gold)` other than `var(--on-gold)`; a token-pair table (screen inks
  on `--bg` and `--raised`, `--on-gold` on `--gold`, the toast, the three paper inks on `--paper` and
  `--paper-strip`) at 4.5:1 each; and `opacity` under 1 on a rule that styles text, outside drawings, keyframes
  and the quiet states (disabled, off, locked, shut, sending, soft).
- **check/ui.js contrast** multiplies every ancestor's opacity into the text colour's alpha and names the faded
  ancestors. The walk stops at a `.page` or `.screen` (the slide, 527, dims what is not in front on purpose — the
  first run without that stop reported 996 findings, every one a neighbour) and at a parked `.soft` pane; a
  disabled control is exempt (WCAG), and so are a teaching animation (`.an-<id>`, art fading its own frames) and a
  word faded to nothing. Proven: `.pane { opacity: .5 }` gave 193 findings on tools@390; the real file, none.

Each was proven by a mutation: an ink of `#000` on the accent, the notepad's `#f7f4e9`, the old `--paper-faint`,
`.kt-done`'s opacity and a hand-written `--pa-ink` each turned check-css red in its own section, and the real
file went green again.
