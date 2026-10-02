## June 2024 Foundation Papers 2 and 3, against the schemes rather than against me

**82 questions, every one read off `1MA1_2F_2406_MS` and `1MA1_3F_2406_MS`.** The 2017 Highers are
why that is the rule and not a preference: four answers there were subtly wrong because they were
DERIVED — a reading off a grid the algebra disagrees with, two single values where the scheme takes
a range, a ratio in a form the scheme also accepts.

**The arithmetic is still recomputed, because a scheme can be mis-READ.** Every intermediate the two
schemes print — 638 miles, 40.113, 6.333482454, 12.25, 18200, 942478, 29775, the whole two-way
table — is asserted in the script that writes the rows, so a number mistyped into this file fails
instead of shipping.

### Four rows were wrong about the paper, and two of them no check could have caught

| | |
|---|---|
| **2F Q19(a)** | carried *"[EXPRESSION NOT EXTRACTED — a fraction with 3.5 squared and 2.17 above, 46.891 cubed below]"*, **wrong in every term**. It is &radic;(35.2 + 1.7³) over 4.6² − 8.91 |
| **3F Q29(b)** | carried *"[FORMULA NOT EXTRACTED]"*. It is *p* = (*h* − 5)/3 |
| **2F Q24(a)** | said the table gives 0 at *x* = 1. The paper gives it at *x* = **0** |
| **3F Q13** | said Year 10 has German 34 and that 67 is the German total. Both are **Spanish** |

**The mark scheme proves the first one without the paper**, which is the part worth keeping: 1.7³ =
4.913, 35.2 + 4.913 = **40.113**, &radic;40.113 = **6.333482454**, 4.6² − 8.91 = **12.25**, and the
quotient is **0.5170189759**. All four of those numbers are printed in the scheme as partial credit.
The garbled version reproduces none of them. The page was rendered as an image anyway, because the
text layer gives `35 2 1 7 4 6 8 91 3 2 . . . .` — loose digits, the failure mode this file already
records four ways.

**And it proves the last one too.** The scheme's completed grid computes 27 **between** the two
numbers the paper gives Year 10, so those two cannot be adjacent columns — which settles that 34 is
Spanish without opening the paper at all. **Both of the last two are invisible to every check here**:
0 at *x* = 1 and 0 at *x* = 0 are the same value, and a two-way table with the right numbers in the
wrong columns is still a valid row. A student filling either in from the card would have been
writing in the wrong blank.

### Two faults in the marking column, found by reading what came out of it

**`12 km/h` was being split into the two acceptable answers `12 km` and `h`.** `set-accept.py` treated
the solidus as an "or", with a lookahead that protected `3/4` and did nothing for a unit — so the
single letter **h** was marked RIGHT. `2 g/cm3` split the same way. Measured across the library:
every `/` in an answer value is a unit or a fraction and **not one is a genuine alternative**, so the
slash no longer separates and the word "or", which a person wrote deliberately, still does.

**And a superscript that is not a fraction numerator is a POWER.** Deleting its tags ran it into the
base: `m<sup>4</sup>` was stored as `m4` and `10<sup>7</sup>` as `107` — values nobody would type,
so `3.42 × 10^7` was marked wrong. **88 accept values corrected**, and the one that looked wrong on
review (`9891` → `98^91`) turned out to be the row where the answer really is 98 to the power 91.

**This is the third round of the same shape** — after the fraction slash and the mixed number — and
the lesson each time is that the marking column is DERIVED, so it has to be read rather than
assumed. Six new cases in `check-marking.js`, which is 35 now.

### `.frac`, and the class name that would have collided

The library writes a bare fraction as `<sup>a</sup>&frasl;<sub>b</sub>`, which is right inside a
sentence and unreadable for an expression: Q19(a) is a square root over a difference of two squares.
`.frac` is a real component now — **and its classes are `frac-n` and `frac-d` rather than `num` and
`den`, which is not fussiness**: `.qsheet .num` already exists in this stylesheet as the SVG label
class for a drawn diagram, and these cards render INSIDE `.qsheet`. A second `.num` would have
inherited a 13px serif and a text-anchor meant for an SVG — **the `.price.faint` collision again**,
where a class reads as a decision and behaves as something else.
