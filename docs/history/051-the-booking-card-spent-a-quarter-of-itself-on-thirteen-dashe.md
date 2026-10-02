## The booking card spent a quarter of itself on thirteen dashes

**Asked for as "optimise Booking. I mean look at grid for starters it takes up so much space."**
Measured first, signed in, at 390px: the card is **845px** and it goes

| | |
|---|---|
| fifteen rows that are questions | 285px |
| **thirteen rows that are a dash** | **210px** |
| the week grid and its surround | 182px |
| the total bar, the two tiles and the terms | 107px |

**THE GRID IS NOT THE BIGGEST SPENDER AND IT IS ALSO AT ITS FLOOR**, which is the half worth saying
before anything is changed. Seven rows at `max(20px, 1.55em)` plus six 1px gaps is 146px; the 20px
is a fingertip rather than a preference, and the note over `.hr` records this block going 222 → 174
→ 146 and why it stops there. A week has seven days and a day has to be pressable. What came back
off it is the 36px of margin and instruction wrapped round it, which is real and is all there is.

**The thirteen dashes are where the room actually was.** They stay — the argument for them is
written over `.bk-row.is-blank` and over `Stage`/`Status`, which this file has already debated twice
and settled twice: a row that appears only once a booking is saved is a row that changes shape at
the moment somebody is checking it. What a blank row does not need is the LEADING of a row somebody
reads. 1.35 is a line for reading; a dash is counted past on the way to the row below.

**And two of the thirteen cost twice what a blank row costs.** `Extra subj.` and `Per session` are
the only two labels of the spine's twenty-eight one character too long for a 6.2em column, so those
two rows were 30px where the other eleven were 15. **The note over `SPINE_EXTRA` records this exact
fault and its fix** — four labels shortened for exactly this reason — and it came back on the two
that are still eleven characters. Shortening a third time is the hand-repair this repository keeps
finding; the column giving way is the rule.

### `white-space: nowrap` fixed the height and broke the width, and then did nothing at all

**Two mistakes in one line, both caught by measuring rather than reading.** `nowrap` against a fixed
6.2em column is a label that does not wrap and does not fit: `check/ui.js` reported `span.bk-k
overflows by 3px` at four widths — the row taking the card sideways instead of the row being tall.
`max-content` is the version that asks for what the label needs and gives the dash what is left, so
nothing wraps AND nothing overflows at any label length somebody adds later.

**And written beside `.bk-row.is-blank` it did nothing**, because `.bk-row.is-bare` sets the same
property three thousand lines further down and both selectors are two classes — the cascade settles
a tie by order. The rows went back to 481px under a rule that read as though it had fixed them, and
the only reason that was visible is that the probe was run again rather than trusted. **Same fault
as `.price.faint`**: a rule that reads as a decision and behaves as nothing.

**Measured after**: the card is **776px**, the rows 457, every blank row 12px, and `check/ui.js`
reports nothing new across the eight booking combinations.
