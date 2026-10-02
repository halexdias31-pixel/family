## The card changed under your thumb, and the shift was measured off the one page that cannot move

**Reported as "when navigating up and down on the practicles, they just start bugging out. i dont
know if its because i was favouriting things too."** It was, and reproducing it took one probe:

| | |
|---|---|
| six pages into the practicals | page 7, reading **Microbiology** |
| press the star on that card | page 7, reading **Food tests** |

**A star added a page in FRONT of the results**, so every result slid down by one while the page you
were standing on kept its number. The card you were reading became a different card and nothing
anywhere said why.

**`paintStuff(true)` WAS ALREADY TRYING TO DO THIS AND WAS MEASURING THE WRONG THING.** It shifted
`PAGE.stuff` by `stuffQuestionPage_() - wasQ` — and `screen('stuff')` builds
`[the question], frontPages_(), savedPages_(), …`, so **the question is page nought under every
ordering and that difference is always nought.** The note over the star's handler claimed it moved
you "by exactly that much"; it moved you by nothing. Same shape as the `.favwrap.is-fav` rule below:
a sentence describing a mechanism that is not there.

**AND MY FIRST FIX MOVED NOTHING EITHER, for a reason worth keeping.** Measuring off
`stuffFirstResult_()` looks right and is derived from `savedPages_()`, which reads `FAVS` — and
`toggleFav` has already written to it by the time `paintStuff` runs. So the old value and the new
value are the same number. **The strip still standing is the only thing that remembers where the
results used to start**, so the old count is read off the DOM. The probe caught it because it
reports the card it can see rather than the number it expected.

**And the root cause went in the same commit**: the saved things are a column now, so nothing is
ever inserted in front of the results. The shift stays, because `frontPages_()` can still change.
