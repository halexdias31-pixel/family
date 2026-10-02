## The finder was spending a quarter of the screen on what you had already answered

**Reported as "the tags don't need to be as big. Everything should be a bit more efficient with
space."** Measured before anything was touched, six answers deep at 390px — the state
`check/ui.js` already declares, because it is the one the last complaint came from:

| | before | after |
|---|---|---|
| the chips | **192px over four wrapped lines** | **141px over three** |
| an answer row | 48px | **44px** |
| the seven answers | 336px | 308px |
| the whole question card | **673px** | **575px** |
| a result card | 218px | **201px** |

**A quarter of the pane was going to what had already been decided**, and the answers — the thing
somebody is on this screen to press — got half of what was left.

### The 44px stays and everything else gives

**A chip is a control and a fingertip does not scale.** This stylesheet carries five convictions of
that rule — `.btn.tiny`, `.post-act`, `.fm-adds label`, the chips themselves and `.qp-check` — and
making the tags smaller by making them shorter would be the sixth. **What was actually costing the
room is WIDTH**: the label, the padding and the gaps decide how many chips fit on a line, and a line
is 44px whether it holds two of them or four. Narrower text (.78 → .72rem), less padding (.6 →
.45rem), a tighter key (.66 → .6rem) and smaller gaps — same target, one fewer row of it.

**The uppercase key stays**, and the note above it is why: *"Grade 9 and 9 are different amounts of
information, and with four chips on a line the second one is a puzzle."* It is the widest thing on
each chip and it is also the thing that makes a chip readable; shrinking it is the answer, deleting
it is not.

### An answer row was 48px against a 44px floor

`min-height: 44px` is what a fingertip needs and `.8rem` of padding over a 24px line took every row
**four pixels past it** — height bought from nobody, because the target was already 44. At `.55rem`
the box lands ON the floor: the same 44px to press, 4px less to scroll past, seven times over.

### And two numbers that are not the Find screen at all

**The pane's own padding was a second margin round the same content.** `1rem 1rem 1.25rem`, inside a
card the grid has already inset from the screen — 15px of a 328px column gone to the frame on each
side, 33px down the height, on **every screen in the app**. `.85rem .85rem 1rem`: trimmed, not
removed, because a pane with no padding is content against a border, and the bottom keeps a little
more than the top because a list ending flush with the glass reads as clipped.

**And the browser's own paragraph margin under every question.** `.qsheet p:first-child` has had its
TOP margin taken off since it was written and the other end was left on: `1em` — 14.8px measured —
under the last paragraph of every question, between the question's last line and a container that
already supplies the gap. One paragraph of white space per card, on every card in a list somebody
scrolls.

**Nothing regressed**: `check/ui.js` reports nothing new across 100 combinations, `check/cards.js`
lays out all 4,906 question rows at 320px with nothing past the column, and every tap target on the
screen is still 44px — which is the one measurement here that was never negotiable.
