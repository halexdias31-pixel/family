## Each library card looks like one: a bank card's shape on paper, a fake barcode worked out from its number, and its three boxes still on it

**The owner, 10 Oct**, with a screenshot of Settings → Library cards (three entries, each a library name
box with a four-digit PIN box beside it and a card number box under them, then "Add another" and the
tick): *"make each look like a card. with fake barcode."*

### What it is

**EACH SLOT IS A CARD NOW** (`libraryShelf_` in js/me.js, `.lib-face` in style.css). A bank card's
proportions, 85.6 by 54 (the ID-1 size most library cards are printed at too), on the PAPER palette,
because it stands in for a thing you hold, as the receipt and the sign-in slip do: `--paper`, `--paper-ink`,
`--paper-dim`, `--paper-faint`, `--paper-rule`, never a literal. `LIBRARY CARD` small at the top left, the
library's name large under it, the PIN small at the top right under its own `PIN`, and along the bottom a
barcode with the number printed under it in the face's monospace, as on the real one.

**THE THREE BOXES ARE STILL THE THREE BOXES**, sitting on the card, borderless and in its ink, so the card is
edited where it is read. Every one is still `fieldHtml`'s with the same `data-me` name, so nothing about
what is saved moved: `meSave_` posts the same fifteen `libN_*` fields, `shelfSlots_` still shows the filled
cards and `Add another` still reveals the next and focuses its name, and the tick is the tick.

**THE DRAFTS DID NOT MOVE EITHER**, and that is a decision rather than an omission. 317 gave every settings box
a draft and left the library cards out on purpose — *"NOT A LIBRARY CARD (its PIN is on it, and a card is
drafted whole or not at all)"* — and `setDraftOk_` still refuses every `libN_` box. So a reload before the tick
draws the saved cards, every other box on the column comes back holding its draft, and nothing typed on a
card, PIN or not, is ever written to the device. The journey holds all three halves.

**A NAME FOR EVERY BOX, FOR A SCREEN READER.** The PIN's is its visible `PIN` caption — `fieldHtml`'s own
`<span>` in its `<label>`, so the caption and the name read out are one string. The name and the number say
what they are in their placeholders while empty and through an `aria-label` once filled. The face is a
`role="group"` named `Library card N`, so the printed `LIBRARY CARD` is `aria-hidden` rather than read twice.

**WHAT SAYS A BOX IS A BOX, WITH NO BORDER**: the focus ring, 2px of `--paper-ink` (13:1 on the paper, where
the app's gold edge would be about 1.6:1) — inside the number's box, which runs from the bars to the card's
foot — and, for the one box with no words in it while empty, the PIN, a dashed line in `--paper-faint`
(3.4:1) just under the middle line of the box until something is typed. Its placeholder is one space, only so
`:placeholder-shown` can draw that line: any hint in it — `0000`, four dots — reads on a card as a PIN
somebody saved.

### The barcode is a picture of one, and not one

*"fake barcode"* is the owner's word and it is meant. `libBars_` draws one SVG `<path>` of bars whose widths
come from the number — `hashOf` (core.js, FNV-1a) seeds a xorshift stream that picks each bar 1–4 modules wide
and each gap 1–3, between two thin guard pairs, to about ninety modules — so every card looks like its own, the
same number always draws the same bars, and one changed digit changes all of them. **It is not a symbology**:
not Codabar or Code 39, not EAN, no start and stop characters, no check digit. A barcode that only *looked*
valid would be worse than a plainly fake one — held up to a library's self-service kiosk, a scan that fails
says nothing. So it is `aria-hidden`, and the number printed under it is the real thing. An empty number draws
an even stand-in (two on, two off) in `--paper-rule`, so an empty card does not look as though it holds a
number; the bars redraw on every keystroke into the number (one delegated `input` listener, the photo shelf's
thumbnail rule).

### What it cost at 320, measured

**THE PAGE NO LONGER FITS A 320x568 PHONE AT FULL SIZE.** The two-row boxes of 141 were 504.7px in a 530 pane;
a card's height follows its width, and three faces at 85.6:54 are about 154px each. So at 320x568 the pane's own
rule draws the page at **78.4%** (`paneReach_`, floor 70%) — each card 244x154 in its own pixels, a 44px box
34.5px on the glass. At 390x844 it is drawn at full size, each card 300x190. With a fourth card open at 320 the
page is at the 70% floor and the pane scrolls to the tick. That is the trade the owner chose for every widget
(*"If you need to leave things more compact or smaller font. This goes for all widgets so they all fit on
screen."*), and `check/ui.js` counts it among
the known `CARD DRAWN SMALLER TO FIT`; the task asked for the card to fill the width at 320 and keep its shape,
so the zoom is the price rather than a narrower card.

**WHAT IS PRINTED LARGE GROWS WITH THE CARD, AND NOTHING ELSE DOES.** The first shots at 768 had 2.2rem of bars
and a 1.3rem name on a card 400px wide, a third of it blank. The face is a size container now and the name
(`clamp(16px, 6.5cqw, 1.5rem)` — never under the 16px an iPhone needs before it zooms into a box) and the bars
(`clamp(1.9rem, 15cqw, 4rem)`) are in `cqw` of it. **THE PIN'S BOX IS FOUR DIGITS WIDE**, never under 44px: at
`6ch` the 320 shot read `Sutton Centr…` beside a PIN box a third empty. A long library name ends in an ellipsis
on the card and scrolls in its box under the focus, as every box does with a value longer than itself.

### What checks it

- **`check-flow.js`, three journeys.** *Each library card is drawn as a card*: five slots, three shown, one face
  each holding exactly its own `libN_name`/`_no`/`_pin`, none beside it; a named group, a hidden caption, a name
  for each box; the bars `aria-hidden`, after the PIN and before the number; three numbers, three different
  barcodes; the name first in keyboard order; no box carrying a draft. *Typing a number redraws its bars*: a
  different number changes them, typing the first back draws the first back, the same number on another card
  draws the same bars, `libBarsOf_` is deterministic and two numbers a digit apart differ, and an empty number is
  marked `is-blank` and drawn as one width at one spacing. *The cards still save the fifteen fields*: a reload
  keeps the column's other drafts and never a card's (nothing `lib` or PIN written as a draft), Add another
  reveals and focuses card four, and the tick posts exactly the fifteen fields, trimmed, the hidden fifth slot
  as empty strings.
- **`check/states.js` → `check/ui.js`**: *settings · three library cards*, three invented libraries at every
  width — three faces and one Add another; each 85.6:54 within 3%, nothing spilling past that shape, every box's
  ink 4.5:1 or better on the face's own paper (the text rule cannot ask it: a box's value is not a text node),
  and different `aria-hidden` bars on each.
- **Proved by mutation, real files green after each**: the PIN moved off the face; the bars seeded without the
  number; the redraw listener aimed at nothing; an uneven stand-in; `setDraftOk_` letting `libN_` boxes draft;
  the PIN box `disabled` (so not posted); the bars without `aria-hidden`; the PIN before the name in the markup;
  no settings drafts at all (the reload's other half) — each turned its journey red. `aspect-ratio` taken off
  the face, and `--paper-faint` as the boxes' ink (3.4:1), each turned `check/ui.js` red at 390 with the state
  NOT measured.
- **`check/cascade.js` caught the first draft of the stylesheet**: `.lib-shelf .lib-no input` tied
  `.lib-shelf .lib-face input` on all four paddings and won on its line number — the `.price.faint` fault this
  shelf was convicted of once already (note 141). One class more, and the number's focus rule with it.

### Gone with it

The dashed hairline between slots (`.lib-card + .lib-card`) and the photo shelf's override of it, and
`.lib-shelf .lib-row > label.field` — no shelf draws a `.lib-row` now; the two-track row is the business records
card's alone. The note over `.lib-shelf` that called a border round each card the "not everything is a card"
fault says the owner overturned it, and why: a library card is a card.
