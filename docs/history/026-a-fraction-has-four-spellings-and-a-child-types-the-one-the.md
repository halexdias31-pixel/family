## A fraction has four spellings and a child types the one the marker did not know

**The marking is the one thing in this app that tells a child they are wrong, and there is nobody
for them to appeal to.** Every other check here measures whether the app WORKS; this is the first
one that measures whether it is FAIR, and the two failures are not symmetrical — a wrong answer
marked right is a thing learned wrong and found out in an exam, and a right answer marked wrong is
a student who stops trusting the marking and then stops using it.

**The first one was live while somebody was sitting the paper.** `answer` writes Q23(b) of the June
2024 Foundation paper as `5&frasl;9`, which strips to `5⁄9` carrying **U+2044 FRACTION SLASH** — a
character no phone keyboard has. What gets typed is `5/9`. Two different strings, so the answer a
student is most likely to write was marked wrong; **91 rows in the library are spelled that way**,
four of them on that paper. `markNorm_` folds the fraction slash, the division slash and the vulgar
characters (`⅓` is what the Corbettmaths signpost prints) onto `/`, and takes the spaces off either
side of it.

**Only there, and that restraint is the whole of it.** Stripping every space instead would fold
`1 1/6` onto `11/6` — 1.17 and 1.83, two different numbers — so a wrong answer would be marked
right in order to fix a right one being marked wrong.

**And `strip()` in `set-accept.py` ate the space out of a mixed number.**
`<b>2<sup>2</sup>&frasl;<sub>15</sub></b>` came out as `22⁄15`, which is 1.47 where the answer is
2.13. A child typing the right answer was told it was wrong, and one typing 22/15 was told it was
right. Nine rows, every one a mixed number, `317⁄20` standing for 3 17/20 among them.

**The rule is as narrow as the fault, on the second attempt.** Turning every tag into a space fixed
this and **broke 141 algebraic answers in the same run** — `<i>n</i><sup>2</sup>` became `n 2`,
`4<i>n</i> − 3` became `4 n − 3` — so a hundred answers that were right by the old rule went wrong
by the new one. What needs the space is one shape: a digit, then a superscript that the `&frasl;`
after it proves is a numerator. Same lesson as `check-rows.js`, where the first version had 95
findings and 2 real ones.

### "Or equivalent" is what the mark scheme literally says

**A fraction is a number, and the marker was comparing it as a string.** Q23(b)'s own scheme spells
it out in the line beside the answer: *"oe … any equivalent fraction, or the decimal 0.55(5…) or
0.56, or the percentage"*. A child who writes 15/20 on the Corbettmaths sheet before cancelling, or
10/18, or 7/3 for 2 1/3, has not made a mistake. `markFrac_` parses `a/b`, `w a/b` and a decimal,
and `markAnswer_` compares them **as two whole numbers** — `a*d === c*b`, never as a decimal,
because 1/3 and 0.3333 are different numbers and a float would eventually call them equal.

**There is exactly one place that would be wrong, and it is now impossible rather than merely
absent.** A question asking for the SIMPLEST FORM has the unsimplified fraction as its question,
so accepting it back marks a non-answer right. Measured: **83 answers are a bare fraction and none
of them asks for simplest form**, which is what made the fold safe to write — and
`check-library.js` fails the build on the first one that does, naming the row and saying to leave
`accept` off it so a person marks it. Proved by mutation in both directions.

### `node js/check-marking.js` — and the roster is the only thing that makes a check real

It cuts the six marking functions out of `find.js` by name and runs them on their own — they touch
nothing else in the app, which is what makes that safe and is also why they are worth checking in
isolation. **A second implementation here would be a second thing to keep in step**, which is the
fault this file already records under `childrenOf`, under `link`/`source_url` and under `kinds`.
**Every one of its 35 cases is a fault that happened or nearly did**: the thousands separator is the
first question of that same Foundation paper, and the `11/6` case is the reason spaces are not
stripped wholesale. It is in `check-all.js`, because three good checks once sat on disk for months
without ever running.
