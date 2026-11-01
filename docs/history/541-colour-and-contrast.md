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

## The review's round (1 Nov)

The review measured head's ui.js at 320 for every visitor, with a student added, and found 65 CONTRAST findings,
all "faded by opacity": the switched-off tutor card (`.card.is-widget.is-off` .6, its "not listed" warning at
2.48:1), a locked settings card (`.is-locked > *` .55, field labels at 2.31:1), the sentence builder's used chips
(.35), the sign-in caption while sending (.62), a week's "9 – 18" rule (.45) and a film's thumbnail (.5). The first
report's "adds no contrast findings" was measured at 390 on tools and res only, and was wrong. The static 7d check
exempted `.is-off`, `.is-locked` and `.is-sending` as quiet while the browser counted them, so the two disagreed.

What changed:
- **Receded in colour.** One rule (beside `.card.is-off`) gives a switched-off card or post, a locked card's
  children and a refused practical's other lines `--ink: var(--dim); --gold: var(--dim); color: var(--ink)`, inside
  `:where` so a part's own colour still wins. Every word stays at --dim or --faint, 5.7:1 or better on black; only
  pictures keep an opacity. A sending message bubble gets the same two tokens. `.card.is-widget.is-locked > *` (a
  game held by its padlock, 498) hands the real tokens back with `inherit`. `.prac.is-off h3 { opacity: 1 }`, which
  could never undo its parent's .72, is gone with it.
- The sending caption, the used chip and the week's hours rule are `--faint`; the stem and lead of a question are
  colour mixes of --ink (.82 and .9 of it, as the opacity was); the measuring tool's inner number is a mix of its fill;
  an open roster slot is paler paper rather than see-through.
- **7d now asks every opacity under 1**, not only one in a rule that also sets a colour or a font: `.qsheet-stem`
  set only opacity and margin and passed. Pictures, disabled controls, pseudo-elements and frames are not words;
  everything else is fixed or written into `DIM_OK` with its reason (the parked pane, the waiting dots, face and
  wardrobe pictures, the one-glyph ✕, the message flag icon, the answer box outline, a film's picture, the disabled
  hour cells). A `DIM_OK` line that matches no fading rule fails.
- **ui.js can measure a student**: `--as=student` (or `--as=out,in,student`). Not by default: most states in states.js are drawn for an admin with no `only`, and a student run reports ~50 of them unreachable — a states.js job, not this one.

Proven: `.qsheet-lead { opacity: .9 }` and `.ss-chip.used { opacity: .35 }` each turned 7d red, `.hr.shut`
at full opacity turned its stale `DIM_OK` line red, and the real file went green again.
In the browser, `.ss-chip.used { opacity: .35 }` put back gave 7 CONTRAST findings on games@320 (2.68:1); the real
file gives none. Measured afterwards: ui.js at 320 and 390 for signed out, admin and student, and at 1280 for
all three: no CONTRAST findings (the run still exits 1 on the tap-target, sideways and edge findings that were
there before, package B's).
