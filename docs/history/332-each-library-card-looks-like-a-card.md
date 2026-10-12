## Each library card looks like one: a bank card's shape on paper, a fake barcode worked out from its number, and its three boxes still on it

**Since 11 Oct the library cards are a widget on Tools** (`libcards`), straight after the hours, for everybody signed in — the same shelf, the same tick and the same fifteen fields ([339](339-your-card-holds-what-is-about-you.md)).

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

### What it cost, and the band each card gives back first

**A FACE'S HEIGHT FOLLOWS ITS WIDTH, SO THE PAGE IS AS TALL AS THE COLUMN IS WIDE.** The two-row boxes of 141 drew
five libraries at full size on every size `check/ui.js` measures. As first built, every face was the column's full
width, and the pane's own fit rule (`paneReach_`, floor 70%) drew the page smaller wherever that did not fit. The
builder measured three cards at 320x568 (78.4%) and wrote "at 390 it is full size". **The review of 10 Oct found
that true only up to three**, and `check/states.js` seeded three, so `check/ui.js` never drew four or five. With
the reviewer's fit probe (tutor, N invented cards, PIN 0000), measured against 6758e2f:

| tick on the glass | 3 cards | 4 cards | 5 cards |
|---|---|---|---|
| 390x844, 6758e2f | 44px | 44px | 44px |
| 390x844, full-width faces | 44px | 36px (81%) | 31px (70%) |
| 320x568, 6758e2f | 44px | 39px | 36px |
| 320x568, full-width faces | 34px (78%) | 31px, pane scrolls | 31px, pane scrolls |

Pressing `Add another` at 390 re-zoomed the whole page under the finger, 1.0 to 0.81. And the laptop was worse
than either phone, which nobody had measured: a 1280x800 column is 372px wide, so its faces were 234px tall,
and **three** cards were drawn at 81%, with four and five at the floor and scrolling.

**THE REVIEWER OFFERED TWO ANSWERS, AND THIS IS A THIRD.** (a) accept and measure. (b) drop the blank row once
more than three cards show, or use a shorter ratio, "so five fit at 390 at zoom 1 as they did before". Before
deciding, (b) was measured, and it cannot do that. A face is a caption, the name's 44px box, the bars and the
number's 44px box, about 141px at 390 at any ratio. Five of them with their gaps and the page's 107px of
heading and tick need about 870px against a 774px pane. With the blank row gone, faces 300x154, five came out
at 84% and four at 95%. That gave up the bank card's shape, which the task decided, and did not reach the goal.
So it was not done.

**WHAT WAS DONE: THE CARDS GIVE UP THEIR BLANK BAND BEFORE THE PAGE IS DRAWN SMALLER** (`libFit_` in js/me.js,
one line in `paneReach_`). Every one of those zoomed pages had a blank band on each card between the name and the
bars: 45px at 390, 68px at 1280. The essay's sheet already gives way before its card is zoomed (`kpSheetFit_`),
and this is the same rule for the one card whose height follows its width. Called by `paneReach_` at zoom 1,
before it measures, `libFit_` sets `--lib-w` on the shelf. Every face narrows to what puts the page back inside
its pane, and never past where its band runs out. `aspect-ratio` keeps 85.6:54, so a face is shorter only by
being narrower. Its bars and name, in `cqw` of it, come down with it, and it stays centred. `Add another` takes
the same width, so the shelf stays one column. It makes up to three passes, because a narrower card has shorter
bars and so a little more band. Only what the bands cannot give is left to the zoom. With nothing over, the
property comes off and the face is the column's width again: one or two cards anywhere, three at 390.

| page drawn at | 3 cards | 4 cards | 5 cards |
|---|---|---|---|
| 320x568 | 83% (was 78) | 70%, no scroll (was scrolling) | 70%, scrolls (as before) |
| 390x844 | full size | **full size** (was 81%) | 89% (was 70%) |
| 768x1024 | full size (was 99%) | **full size** (was 77%) | **full size** (was 70%, scrolling) |
| 1280x800 | **full size** (was 81%) | 92% (was 70%, scrolling) | 82% (was 70%, scrolling) |
| 1920x1080 | full size | full size (was 96%) | **full size** (was 83%) |

**WHAT IS LEFT, SAID:**
- Five cards at 390 are drawn at 89%, so the tick is 39px. At 320x568, four and five reach the 70% floor.
  320 has almost no band to give: the face goes from 244 to 225 wide, so it still all but fills the column.
- At 320 with four cards, the page ends 22px past its pane. That is inside the app's own `PANE_REACH`, so the
  pane does not scroll. The card's bottom padding is clipped and the tick is whole on the glass.
  `check/ui.js` lists it as known: `OUT OF REACH, INSIDE THE APP'S OWN FLOOR`. Before this change, that page
  scrolled with the tick 15px below the glass.
- Pressing `Add another` with three cards at 390 now narrows the cards rather than re-zooming the page. It is
  still a change under the finger, but every box stays 44px through it.
- At 320 and three or more cards, the task's "the card fills the width" is now 225 of 244px. That is the price
  of the 37px tick (from 34), and it is the same trade the owner asked of every widget, made with the card's
  own blank rather than its type size.

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
- **`check/states.js` → `check/ui.js`**: *settings · three / four / five library cards*. Each is one source
  with its count written in (`new Function`, as for the notifications states), measured at every width. Asked of
  each: N faces, and one Add another unless all five show; each face 85.6:54 within 3%, with nothing spilling
  past that shape; every box's ink 4.5:1 or better on the face's own paper (the text rule cannot ask this,
  because a box's value is not a text node); different `aria-hidden` bars on each. Then the fit:
  **a page drawn smaller has no blank band left on its cards** (3px slack), the page is no smaller than the
  app's own `PANE_ZOOM_MIN`, and the tick is on the glass or the pane scrolls to it. The zoom that is left
  prints as `CARD DRAWN SMALLER TO FIT (known)` with its percentage.
  **Proved by mutation**: with the `libFit_` call taken out of `paneReach_`, `check/ui.js --width=390` exited 1
  with four and five library cards NOT measured. With it put back, the whole settings run was green at all five
  sizes.
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
