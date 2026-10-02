## Sharing is a print of the element, and the second renderer is gone

**Asked for as *"can you also wipe everything we know about the sharing reciept? ... all i want is
for when i share a booking/reciept it just shares a pdf of an exact copy of what they are seeing on
the screen."*** Wiped: `receiptCanvas` (about two hundred lines), `corsImage_`, `BOOK_ROWS`, and
`js/check-canvas.js` with its roster entry.

**THE HONEST READING OF "AN EXACT COPY" IS THE ELEMENT ITSELF**, and this file's own record of that
canvas is the argument. It had its own column arithmetic, its own fonts, its own palette read off
the document and its own rules and dashes — and over its life it drew *a green terminal of a card
that was cream paper*, printed the venue and the tutor twice, went on drawing photographs the card
had stopped drawing, and said `TO PAY` where the screen said `COST`. Every one of those is one
document told the answer twice. **A second renderer is not a copy of the first; it is a thing that
has to be kept in step with it.**

**SO IT PRINTS, WHICH IS THE ROUTE THIS APP ALREADY HAS THREE OF.** The cheat sheet, the flyer and
`quiz-print` each build their paper, put a class on `body` and call `window.print()`. A print
dialogue is where every phone and every laptop keeps *save as PDF* and *share*, so the PDF is the
platform's, made from the real markup with real text in it rather than a picture of some pixels —
and `check-surfaces.js` fails the build on the alternative anyway.

**THE `.rc` THE BUTTON IS IN, ASKED OF THE DOM.** The share tile is printed on the receipt's own
foot, so the document to print is the one the control is part of — the same move as `msg-send`
walking up to its nearest `.msg-form`. The form, a saved session and the basket all share the
handler without any of them being named.

### Three things it got wrong before it was right, and all three were measured

| | |
|---|---|
| **`position: absolute` landed it at x = 101.3** | `.screen` is `position: absolute` and `placeCells` puts a transform on the columns, and either makes an ancestor the containing block. So `left: 10mm` was 10mm from whichever column the card was parked in. The other three printable things are children of `body` and never met this, because they BUILD their paper. This one moves, and a comment node holds its place so it goes back whether the dialogue was used or dismissed |
| **a print re-lays the page out** | the receipt is 327.6px on a 390px phone and **472 once the page box is A4** — so what would have printed is a wider re-flow of the card, with different column widths and different wraps, against a scale computed from a box that no longer existed. `--rc-w` pins it to the width it had on the glass |
| **a browser drops backgrounds when it prints** | on the reasonable assumption that a page is black on white. This document is black and gold, so without `print-color-adjust: exact` the gold marks — which are how the week and the six stage ticks say anything at all — disappear |

**THE SCALE IS A TRANSFORM RATHER THAN A WIDTH**, because a width would re-lay the grid out and a
document that re-flows for the paper is no longer a copy of what was on the screen. The smaller of
the two fits, so a long receipt shrinks onto one page rather than being cut in half by a page break.
Measured on the real card: k = 1.729, the sheet lands at **10mm, 10mm, 566.4 × 993.4** inside a
718 × 1047 printable area.

**AND THE TWO TILES ARE HIDDEN ON THE PRINT.** `Ask for it` and `Share this booking` are printed
inside the receipt's own foot — see `bookBreakdown`, which put them there deliberately — so they are
part of the element, and a PDF of a booking with a gold Send button on it is a picture of a control
nobody can press.

**WHAT IT COSTS IS AN A4 OF BLACK IF SOMEBODY PUTS IT ON PAPER**, and that is the trade rather than
an oversight: *"an exact copy of what they are seeing on the screen"* is a dark card on a dark page,
and a white sheet would be a different document. It is written down here rather than quietly
lightened, because which of the two a PDF should be is the owner's call and the line to change is
one `print-color-adjust`.
