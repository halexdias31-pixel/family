## AQA Chemistry 8462/2F, and an assertion that caught binary floating point

**63 questions against `Mark scheme (Foundation)_ Paper 2 - June 2024`.** Cover total 100, margin
boxes 12, 9, 9, 13, 11, 9, 10, 10, 8, 9. Questions 8, 9 and 10 are 1, 2 and 3 of 8462/2H word for
word — the tier overlap again, both schemes read side by side.

**`assert 2.4 / 6.0 == 0.4` failed, and it was right to.** The R_f value really is 0.4 and Python
really computes 0.39999999999999997, because neither 2.4 nor 6.0 is exact in binary. Every other
number on this paper compares exactly; this one had to be rounded, with the reason written beside
it. **An assertion that only ever passes teaches nothing** — this one earned its line by refusing a
true statement for a reason worth knowing.

**Two grids are drawn and the marks are in them.** Figure 2 carries the hydrogen bar at 16% already,
and that bar is what fixes the scale — one large square is 10% — so the carbon bar can be drawn to
84 without guessing. Figure 3 has both axes printed and only the plotting left, so it comes straight
out of `axes()`.

**The tick-box structures are written out as they DIFFER.** "Which of these shows the compound
produced when chlorine reacts with ethene" is three displayed formulae that are identical except for
where the chlorines sit, so the row lists them that way — one Cl on the first carbon; one on each;
two on the first. A question asking "which of these" is unanswerable without them, and a structural
formula is text, not a picture.
