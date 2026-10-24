# 408 — One widget per thing

The owner, 24 October 2026: *"One widget per thing. If a thing needs more than one widget (page), each must
have a title that distinguishes it, so it earns its place."* Applied to the learning content: content cards
first, then practicals and projects where they page the same way.

## What a content card was

A content card (347, part 2) was two shapes of page:

| Page | What was on it |
|---|---|
| the card | title, tag row, then **three** sections under small headings — Key words, Formulas, Worked |
| `an<n>-<id>`, one per drawing | the subject and card as kicker, the drawing's title, the stage, Play again, then the chapter's lines `about` names, under the same three small headings |

So the card was three things in one widget, and the drawing's page was a drawing with a second widget
(headed sections of text) under its tile row. Measured on the full library: 273 cards; 273 have key words
(up to 13), 273 worked lines (up to 5), 79 formulas (up to 7); 29 drawings on 22 cards.

## What it is now

| Page | Title | What is on it |
|---|---|---|
| the card (`contentCard_`) | the card's name | its tag row and its key words, and nothing else; the tile row under it as before |
| `an<n>-<id>`, one per drawing | **Watch: <drawing's title>** | the stage, the `about` lines as a caption with no headings, then Play again |
| `formulas`, if the row has any | **Formulas** | the formulas, typeset, no heading inside |
| `worked`, if the row has any | **Worked examples** | the worked lines, no heading inside |

- **The titles live in one place**, `CONTENT_PAGE` and `contentPageTitle_` (find.js); the journey reads the
  same function, so a renamed page cannot drift from what is checked.
- **The drawings still come straight after the card** (304 put them there, and the kept place, Saved's Open
  and the Pythagoras journey all lean on it); Formulas and Worked examples follow. A page exists only where
  the row has the thing, so no card has an empty titled page.
- **No split pages.** The longest card (GCSE Physical Education, *Heart, lungs and energy*, 2,101 characters)
  now spreads over three titled pages instead of one; nothing needs a "(2 of 2)". If a future row ever
  outgrows one page, the rule is to condense it, and only then a titled "<Thing> (2 of 2)".
- **The caption is part of the drawing, not a second widget.** 304 chose the `about` lines deliberately
  (the protractor and the clock sat over words that contradicted them), so they stay — under the stage,
  without the Key words / Formulas / Worked headings, and above the Play again tile, which is the action row
  under the thing (house style).
- `tbSections_(c, keep, opt)` gained `opt.only` (one section) and `opt.bare` (no heading, because the page's
  title already says it). The part ids `formulas` and `worked` are new; `an17-pyth` and friends are unchanged.
- **Waiting (397) is unchanged:** before `libItems` brings the words a card is one page, its title and tags
  over `loading_()`'s dots; when they come it is drawn again as the pages above and lands on its first.
- **Practicals and projects already met the rule** (each part page is the item's name as kicker and its own
  title — Diagram, Equipment, Steps, Worksheet; Materials, Steps or Stages, Share it). The new journey holds
  them to it too.
- Saved and the Spotlight draw a kept card's first page only (`keptPart_`), so nearly every content card now
  has `Open · in Find` there, which is right: it is no longer whole on one page.

## Checks

- **`check-flow`, new journey "one widget per thing"**: every page of every content card, practical and
  project in the whole library (`check/lib-full.js`) has a non-empty title; no two pages of one item share
  one; a drawing is on exactly its own page and nowhere else; a content page past the card is titled as
  `contentPageTitle_` says, a drawing's page says `Watch: …`, none has a heading inside it, none is empty;
  the card carries no formulas or worked lines; a row with formulas or worked lines has those pages and a
  row without has none; a waiting card is one page titled with its name over `loading_()`'s dots.
  Mutations: titling Worked examples "Formulas" (both pages "Formulas" on *How many fit?*), and putting the
  three sections back on the card — each red, green again on the real files.
- The content-card journey wants the pages `[card, an8-mean, formulas, worked]` for Averages and reads every
  formula and worked line across the card's pages.
- **check/states.js**: `a content card` (key words only; its first-tag test was stale since 396 — the row
  opens on What for — so ui.js had been reporting it "NOT measured"; it reads the What kind tag now),
  `a content card: Formulas`, `a content card: Worked examples`, `a SATs content card` and its animation,
  `an A-level practical: card / Diagram / Steps` (Buffon's needle, GCSE–A-level Maths — there is no A-level
  content card in the library).
- Screenshots at 390x844, looked at: Measures of spread (GCSE Statistics) card, Formulas, Worked examples;
  *How many fit?* (KS2 SATs) card and Watch page; Pythagoras's Watch page; Buffon's needle card and Diagram.

css 2026-10-24-h-one-widget.
