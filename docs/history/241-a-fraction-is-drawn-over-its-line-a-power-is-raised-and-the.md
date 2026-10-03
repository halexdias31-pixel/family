## A fraction is drawn over its line, a power is raised, and the library stopped writing maths as text

**Asked for as:** *"refine questions in the finder to make sure they are looking right e.g. no x2 or
x^2, it should look how its supposed to look. i see problems like this alot. same with fractions.
it shouldnt be 4/5 it should be 4 over the five like how it is supposed to be."*

**The library already said "this is a fraction" in 442 rows and the card drew it slanted anyway.**
The stored shape is `<sup>4</sup>&frasl;<sub>5</sub>` — a small raised 4, a slanted bar, a small
lowered 5 — and a stacked `.frac` component had been in `style.css` since the June 2024 Foundation
papers, used by 33 rows. Its own comment called the slanted form *"right for a bare fraction inside
a sentence"*. That was a builder's choice; the owner has now overruled it, and the comment says so.

### `typeset_`, at draw time, at every place question markup is drawn

**One function in `find.js`, called at five places**: the stems, the lead, the part, the answer and
each tapped choice. The audit counted those five and there were no others: the quizzes are a
different library and escape their text, and the search haystack is not drawn.

| It does | Because |
|---|---|
| `<sup>a</sup>&frasl;<sub>b</sub>` → numerator over a rule over denominator (U+2044 and `&#8260;` too) | the owner's "4 over the five" |
| `3<sup>4</sup>&frasl;<sub>5</sub>` → a mixed number, held on one line by `.frac-mixed` | a browser may break either side of an inline-block, and "3" ending one line with "4 over 5" starting the next reads as two numbers |
| `3x<sup>2</sup>&frasl;<sub>…</sub>` → the numerator is **3x²**, not 2 | a superscript after a LETTER is a power. Q12(a) of June 2020 3H is written exactly so, and the first draft stacked "2 over (x + 2)(x − 4)" with a 3x standing outside it: a different expression, wrong, and perfectly typeset |
| `(x + 1) &frasl; 3`, `sin B &frasl; 6.5` → the terms touching the slash | an expression has no markup saying where a numerator starts; a function name goes with its argument or `sin B/6.5` draws as sin(B/6.5) |
| `x^2`, `e^(4x^2)`, `4^-2` in TEXT → a raised power, the hyphen set as a minus | never inside a tag or an `<svg>`; re-read from the caret it replaced, for a power inside a power |
| one pair of brackets round a WHOLE half goes | the rule is the bracket. `(x + 2)(x − 4)` keeps both pairs |
| a slash INSIDE a superscript stays (`A<sup>1/3</sup>`) | a fractional index; stacked at superscript size it is unreadable on a phone, and papers set it inline too |

**Why at draw time and not by rewriting the 442 rows.** `tools/set-accept.py` reads
`2<sup>2</sup>&frasl;` as "a digit, then a numerator, so the digit is a whole number" when it writes
`accept`, and that one rule is two wrong-mark faults long (history 026: `22/15` for 2 2/15). The
marker reads `accept` only and `typeset_` is never shown `accept`. `check-marking` is green on all 80
cases, and a `check-flow` journey asserts `data-accept` reaches the marker byte for byte.

**A hidden slash between the halves (`.frac-s`)**, so a screen reader says "4 slash 5" rather than
"4 5" and copying a question pastes 4/5 rather than 45. **The first version cost 431 cards**: the
usual visually-hidden recipe squeezes the box to 1px with `overflow: hidden`, and `check/cards.js`
asks every element whether it scrolls sideways when nobody told it could — a 7px slash in a 1px box
does. It is left at its own width now, clipped by `clip-path`, pinned to the top-left of a
`position: relative` fraction. `check/cards.js` was itself changed to lay out the typeset markup
rather than the stored row — before that it was measuring the slanted form the app no longer draws.

### The rows that never said "this is a fraction": `tools/typeset-plain-maths.py`

**`typeset_` cannot know `5/8 = ?/24` is maths.** Three characters and a slash read the same as
`m/s`, as `41/42` meaning "41 or 42", or as a count table. So the plain-text rows were rewritten
once, into the stored shape, by a reviewed pass — every slash between two whole numbers listed with
its sentence first, row by row. Edited line by line and value by value: only the changed field's own
JSON token is replaced, in the escaping style that line already used, so 330 lines changed and no
other line moved. It asserts no `accept` moved, and a second run changes nothing.

| Changed | |
|---|---|
| 436 | a whole number over a whole number → stored shape (Corbettmaths 5-a-day answers, KS2 SATs answers, the A-level mechanics leads, AQA mark-scheme working) |
| 16 | mixed numbers, `1 1/6` → `1<sup>1</sup>&frasl;<sub>6</sub>`, no space — the library's own convention |
| 10 | `?/24`, the missing-number blank on the Equivalent Fractions sheet |
| 55 | by hand: `t/2`, `(x + 2) / (2x + 1)`, `dH/dt`, `pi/2`, `sqrt(7)/7`, the three lost unit powers the audit named (`11 m2`, `125 cm3`, `newtons/cm2`), four lost SUBSCRIPTS in the A-level leads (`l1`, `l2`, `u3`, `x1`), `ln2x` |
| 8 | June 2023 Higher `<span class='frac'>A &divide; B</span>` — marked as a fraction, written as a division, drawn as `A ÷ B` in a box |
| 107 | **Corbettmaths' letter x for times**, in seven sheets where every x was read and every one sits between two numbers (Times Tables, Decimals: Multiplication, Multiplication, ×10/100/1000, Order of Operations, Using Calculations, Place Value), plus nine 5-a-day stems by hand. In the coding font `6x2+3x4` reads as 6x² + 3x⁴. **By sheet, not by regex**: in 1st Class Maths `4x2` IS 4x², and a blanket rule would have been wrong across a whole publisher |

| Left as written, on purpose | |
|---|---|
| 37 | a decimal either side (`12/17.2`) — a division in working, as a mark scheme writes it |
| 17 | a slash inside a superscript — a fractional index |
| 116 | a unit in a maths row: `m/s`, `g/cm³`, `km/h`, `newtons/m²` |
| 12 | named in `tools/data/typeset-keep.json`, one reason each: `n = 41/42 or 43/44` (alternatives), `50/50`, a mark score `0/3`, `3 / 2 sf`, the flattened count table `0/1568 … 60/98`, two calculator chains, and KS2's remainder `r1` |
| 1 | `1/40th`, an ordinal written with a slash |

**The first numeric pattern refused any full stop or comma after a denominator**, because that is how
a decimal looks — and also how the end of a sentence and a list look, so `6/12 = 1/2.` and
`3/5, 65%, 2/3` were left slanted: 325 conversions where there should have been 436. A point or comma
WITH A DIGIT AFTER IT is what makes a decimal.

### `node js/check-typeset.js`, on the roster after `check-marking`

**It runs the real `typeset_`, cut out of `find.js` with `check-marks-load.js`'s cutter**, over 15
cases that are rows or near-misses, and then over every drawn field of every active row — and it
asks its questions of the OUTPUT, so a stored `<sup>a</sup>&frasl;` and a stored `x^2` are fine
(drawn right) and a stored `4/5` fails. It fails on: a slash `typeset_` could not read both sides of;
a whole number over a whole number in text; a caret left in text; in a maths row, an algebraic slash,
a letter with a digit run onto it or a unit with its power run onto it; a `.frac` with no halves (a
column vector's two `.frac-d`s are right and pass); and a keep-list line that matches nothing.

**The first text model blanked a superscript to a space**, and `305<sup>2</sup>/76<sup>2</sup>` came
out as `305 /76` — a whole number over a whole number nobody wrote, failing three A-level answers. A
script leaves a `§` now, which nothing can join across.

**1st Class Maths is a named backlog, not a red and not a silence: 521 lost powers in 295 rows**,
printed on every run. 1,358 of that publisher's 1,370 rows are raw PDF text (`Simplify fully 2x2 –
2xy`), and the fix is to re-type each sheet from its PDF by position — the method of history 045 —
which is audit maths-1 step 4 and was not done here.

### Measured

- 13,144 drawn fields read; **2,247 fractions drawn stacked, 141 of them mixed numbers; 23 carets raised.**
- `check/cards.js` at 320px: every card fits the width. Cards taller than the pane went 1,404 → 1,407,
  printed rather than failed — a stacked fraction is two lines tall.
- Screenshots at 320 and 390 of thirteen real cards drawn by `questionCard_`: mixed numbers in a
  stem and an answer, a lead with mixed numbers and ×, `5/8 = ?/24`, d²y/dx², the 3x² numerator,
  fraction choices on an A-level physics card, `e^(4x²)`, Order of Operations. Nothing scrolls
  sideways at either width.

Proved by mutation, each restored to green: `typeset_` returning its input (3 of 15 cases, 1,003
library failures, the `check-flow` journey red in all five places); every prefix read as a mixed
number (the 3x² case red); the answer drawn without `typeset_` and `accept` drawn through it (the
journey names both); `5/8 = ?/24`, `125 cm3` and `6x2+3x4` put back (each named); a June 2023
division span put back; a keep line removed and a stale one added.
