## The cheat sheet's list is no longer a scroller, and a number line runs from −10 to 10

**"the cheat sheet maker should not have a scroll thing"**: `.mat-list` lost `.widget-squeeze`, and
`.mat-list.widget-squeeze { min-height: 6rem }` is deleted. That class made the list a scroll box
inside a card that also slides, so every drag on it was a guess between moving the list and moving
the column. The card is now as tall as its whole list, and `paneReach_` treats it like every other
card: it draws it smaller down to 70%, and past that the PANE scrolls and hands the swipe back to
the grid at its end. Measured with real touch events, signed in and out: with Every level at
320x568 the card is drawn at 70%, three swipes up scroll the pane to its end and the fourth turns
the page; at SATs on 390x844 the card fits at 91% with no scroll at all. The flyer still carries
`.widget-squeeze`, and the generic rules beside `.card.is-widget` are untouched.

**The state asks the computed style, not just the class.** `tools · the cheat sheet maker, filled`
fails if anything from the list up to its card has `overflow-y: auto` or `scroll`. The class test
alone would pass a `.mat-list { overflow-y: auto }` rule that put the scroll bar straight back.
Proved by mutation: that rule names the state at all four widths.

**"add minus number line"**: `M52`, Negative number line, in `MAT_PARTS` with `at0: 35`, so it is
listed straight after M04's 0–1 line. Every whole number from −10 to 10:
- the minus is U+2212;
- zero has a longer, thicker tick and a bold label;
- an arrowhead at each end, drawn as a border triangle.

It is full width for M04's reason. It is offered on SATs, 11+, Y9 Mocks and both GCSE tiers, has no
`tier`, and is not given in the exam. The id is **M52, not M51**: M51 is the pH scale on another
branch, and one id for two pieces would be one row of the sheet tab answering for both.

**The zero is bold at the same size, not bigger.** The first version drew it at 3.6mm against the
others' 2.9mm, with its `top` nudged so the two line boxes were centred. Centring line boxes does
not line up digits, because a digit sits on its baseline and where that falls depends on the font.
Measured on the printed sheet, the zero's baseline was 0.44mm below its neighbours', and the
screenshot showed a dropped 0. With one size and one `top`, all 21 baselines are at 10.72mm.

**`MAT_SLOT.M52` is 22mm, measured on the printed sheet.** The block is 18.8mm under another block,
counting its rule and the 3mm under it. A millimetre is added for another browser's mono and the
total rounded up to the 2mm row. The block measures 22mm and does not overflow, and `matPaint`'s
overflow alarm stays silent. Screenshotted in print media.

`check-flow.js` gains one journey, which asserts all of this:
- the labels read −10…10 with a real minus;
- exactly one zero is picked out;
- both arrows are present;
- it is offered at each of the levels above and not at A-level;
- the list carries no `.widget-squeeze`.

Proved by mutation: a hyphen for the minus names the line, and putting the class back names the
list.

**`check/press.js` and `check/cards.js` read `PRESS_PORT` and `CARDS_PORT`** like the other browser
checks. Both had their port hard-coded, which two sessions on one machine cannot share.
