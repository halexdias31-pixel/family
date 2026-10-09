## Reactions that look finished: one line of pills under the picture, the total on the time line

**The owner, 9 Oct:** *"Also refine how the post reactions look. Looks abit scuffed right bow"*

### What was scuffed, measured

Nothing in the repository had ever drawn the row. Every post `check-flow.js` seeded sent `reactions: {}`,
and the post in `check/fixture.json` sent `{"👍": 3}`, a shape `doGet` has never sent. `reacts()` draws
both as nothing. So `check/ui.js` had measured tap size, contrast and sideways overflow on the feed at five
widths on every run, always on a post with no faces on it. The list below comes from a probe that
seeded the real shape:

1. **Faint boxes.** A face's 2px-radius box was edged in `--line-soft` (1.0:1 against the card) and,
   once counted, `--line` (1.15:1). So some faces looked boxed and others loose.
2. **Uneven widths.** A box was as wide as its count: 36.8px with none, 46.7 with one digit, 59.2 with
   three.
3. **Wrapping.** With all six counted, 🎉 and the total dropped to a second line.
4. **A bare total.** "77" sat at the end of the row in `--faint`, 18.6×38 at 390 (15×34 at 320). It read
   as another face's count and a screen reader announced it as just "77".
5. **Reflow on tap.** 👏 going from 9 to 10 widened its box, which moved 🎉 from x 303 to x 45 and 43px
   down.
6. **Tight spacing.** 5.2px from the photograph to the row and 3.7px from the row to the caption.
7. **Half-finished tiles.** Square boxes beside the real Share tile looked like tiles nobody finished.
8. **A lost press.** `.react:active` scaled the face, and the repaint that follows the tap replaced the
   button half way through, so the press was never seen to finish.
9. **Tiny faces in the sheet.** In who-reacted, each group was an `<h2>` in the sheet's small-caps label
   style. That made the face about 10px, the smallest thing in the sheet, with its count glued to it.

### Three designs, and why pills

Three designs were mocked into the real app and photographed at 320, 390 and 820, signed in and out:

- **D1, a bare strip** (faces with no plate, unused ones greyed). It read as two faces you can press
  and four you cannot, and a greyed ❤️ reads as 🖤.
- **D2, pill chips.** Every shot read as finished, and it uses the shape the funnel's chips already use.
- **D3, a summary and a React tile.** Two taps to react, and the per-face counts leave the card. The
  owner asked about the look, not the behaviour.

D2 was built, with these taken from the other two:

- **From D1:** the total moves onto the time line; a one-paint pop flag replaces D2's 600ms timestamp
  window; the row falls back to wrapping 44px columns under 320px; the sheet's groups are `<section>`s.
- **From D3:** the sheet's groups run most-used first.

### What it is now

**THE ROW (`reacts()`, posts.js).** It is a grid of six equal columns, each capped at 3.75rem, so a
count cannot move a face. Each cell is the whole 44px-tall button. The pill is the button's `::before`
(6px in from the top and bottom, 32px tall, 16px radius), outlined in `--chip-line` with the faint wash
a tile has. That is the funnel chip's family. `.answers, .chips, .qtags` gained `.reacts` and `.rx-head`
in the one rule that sets `--chip-line`, so there is no new colour.

- **A count** sits inside its pill in ink at .8rem. There is no 0: a face nobody pressed is an empty
  pill. Three characters step down to .7rem (`is-long`). `reactN_` caps every count at three
  characters: 999, then `1k`…`999k`, and never "1.5k", which overflowed a 41px cell.
- **Yours** has a gold outline, a 16% gold fill (`--react-mine`, scoped to `.reacts` and `.rx-head`
  rather than `:root`), its count in gold at 650, and `aria-pressed="true"`. The same tap takes it back
  and another face moves it. The row is a `role="group"` labelled "Reactions".
- **The face that lands** scales in from .82 once. `REACT_POP_` is set around the one `repaint()` in
  `on('react')` and cleared on the next line (`repaint` is synchronous), so the `.catch` repaint and
  every later one draw no animation. A face taken back does not land, and reduced motion draws none.
- **More than six faces** (a post's own cell) wrap into the same columns, 6 + 3. The house six never
  wrap at 320 or wider.
- **A post with a picture** has the faces directly under it. **A post without one** has them after the
  caption, poll and body: under the header they would be faces reacting to words not yet read. The
  admin's "this payload predates them" sentence is unchanged. The empty `<span></span>` everybody else
  got is gone: it only balanced a flex row against a Share button that is now a tile.

**THE TOTAL (`postWhen_`, `reactWho_`).** It reads "3 weeks ago · 77 reactions": a `text-action`
button after the time, in `--dim`, with the dotted line every inline action here has. It is still its
own control and still absent at 0 (a 0 that opens an empty sheet is a promise broken). It sits inline
after the time rather than at the right edge because at 820 the pills stop at about 349px of a 410px
card, and a number out at the far edge belonged to nothing. The line is 44px tall whether or not there
is a total, so the first reaction on a post moves the tile row 0px.

**THE SHEET (`on('who-reacted')`).** Each face is a `<section>` headed by a bigger pill (1.25rem face,
count beside it). Yours is the gold one, with your name first and a gold "you" after it. Groups run
most-used first, ties in the house order. "…and N more" is kept.

### The tap-target exception, and why it is honest

At 320 the six cells are **41.3px** wide. Six 44px cells need 264px, and the card has 247.8px inside its
padding; from about 345px wide every cell is 44 or more. That is in `ACCEPTED_TAP` (`/^react(\.|$)/`,
written in the keypad's style). What was done instead of the width:

- every cell is 44px tall, in px;
- the cell is the whole button and the pill only its drawing, so no pixel of the row is dead;
- under 320px the row falls back to 44px columns that wrap;
- a wrong face costs one tap, because the same tap takes it back.

The old note said *"Below the 44px rule on purpose: these sit in a row of five or six and a full-height
control would be a wall."* The wall is still kept out, because the drawn pill is smaller than the old
38px box. But the rule it broke is now met in height and missed only in width, at the narrowest phones.

### Measured, after

Seeded in Chromium (Playwright, no comments on the post so no `paneReach_` zoom):

| | 320 | 390 | 820 |
|---|---|---|---|
| cell | 41.3×44 | 50.7×44 | 58.1×44 |
| pill | 37.3×32 | 46.7×32 | 54.1×32 |
| photograph → pill | 8.7 | 9.0 | 9.1 |
| first pill, caption, Share tile: one left edge | 47.0 | 44.8 | 207.2 |
| lines for the six, any counts | 1 | 1 | 1 |

- **👏 9 → 10** moves no cell and no pill. The tapped face re-centres 3.4px inside its own pill
  for the wider number.
- **A first reaction** on an empty post moves the tile row 0px.
- **No sideways overflow and no page error** at 320, 390 or 820, signed in or out.

### What holds it

- **`check/fixture.json`** sends the real shape: the six house faces, counts, total, yours and `by`.
  PO1 has 👍 3 and ❤️ 1; PO2 has six zeroes.
- **`check/states.js`**, on the feed: `reactions nobody`, `reactions some`, `reactions yours` (signed
  in), `reactions many and wrapping` (nine faces, 999, 1500 → `1k`, 212) and `reactions who reacted`
  (the sheet open). `check/ui.js` measures each at five widths for both visitors, and `check/press.js`
  presses the faces and the total (22 presses on the feed, from 18).
- **`check-flow.js`**, in the journey "a post's faces: a tap adds yours, the same tap takes it back, the
  total opens who reacted":
  - one row of six;
  - a tap makes 😂 `.mine` (the second class) and pressed, with count 1, "4 reactions", `reactPost`
    with the `personId`, and `is-pop` for that paint only;
  - the same tap takes it back to "3 reactions";
  - the total opens the sheet, with a tie in house order and 🎉 3 ahead of ❤️ 2 ahead of 👍 1;
  - signed out, a face sends nothing and goes to sign in, and the total still opens the sheet.

  Proved by mutation: with the most-first sort and the flag's clear removed, the journey fails on both
  and goes green again with them back. The other seeded posts now send `NO_REACTIONS_()`, the shape
  `doGet` sends, in place of `{}`.

No backend change, so the four version constants stay where they are. `--css-version` is
`2026-10-09-reaction-pills`.
