## There is no room in the booking card, so the list is the page rather than a sheet over it

**Reported as *"i dont like this. this is shit. no pop up menus."*** — over a screenshot of the
multi-select sheet built the day before, which was itself the fix for *"for me to multiselect i have
to click on field then click on subject then click on field then click on another subject."*

**THE GEOMETRY RULES OUT EVERY IN-CARD EXPANSION AND THAT IS THE WHOLE OF THE DESIGN.** `.pane` is
`overflow: hidden`, and measured on the booking column the card's own content is **544px in a 534px
pane at 320×568 and 605.7 in 613 at 390** — seven pixels of headroom at the widest phone and ten
past the fold at the narrowest. Twelve subjects as wrapped 44px chips is about 276px at 320; as a
stacked list, 528.
Either way the rows below it, the Send tile among them, go past a fold with no scroll and no page to
turn to. A capped block with its own scroller does not help, because the card grows by whatever the
cap is. **Every shape that opens under the row overflows**, and that is arithmetic rather than an
opinion.

**SO THE PAGE THE FORM IS ON SHOWS THE LIST INSTEAD OF THE FORM.** Nothing covers anything, the page
COUNT does not change — `bookBlocks` still returns the form's page first and the receipts after it —
so `PAGE.booking` is where it was, the back gesture does not leave the app, and the card in front of
you becomes the list and then becomes the card again. Pressing the field opens it and pressing Done
closes it, which is the gesture that was asked for in the first place.

**`#bookr` IS THE WRAPPER EITHER WAY, AND THAT IS NOT TIDINESS.** `paintBook_` finds the screen to
repaint by walking up from `#bookr`, so a picker drawn outside it would come up once and then be
unable to redraw itself — every tick would run the handler and change nothing, which is the fourth
of the four causes `clicks()` lists and the one that looks exactly like the app being dead. That is
the fault this file already records under *"grid not working when click"*, and it is why the state
lives in `BOOKING.picking` rather than in the DOM: a redraw rebuilds the page, and state kept in
markup is state a redraw loses.

**TWO COLUMNS RATHER THAN A STACK, WHICH IS THE SAME ARITHMETIC AGAIN.** Twelve full-width 44px
buttons is 528px against a 534px pane before the heading and the Done.
`repeat(auto-fill, minmax(7.5rem, 1fr))` is two columns on a phone and more on anything wider — six
rows of 44 — and the card measures **432.7px at 320 with twelve options on it**, every one a real
44px target, with a hundred pixels to spare. Screenshotted, which is the **twentieth** time this
file says so — counted off the entries above rather than remembered, the last of them being the
Flappy Bird sky one heading up.

**A STEP THAT CANNOT BE ANSWERED CLOSES THE LIST** rather than drawing an unpressable one. Changing
Kind can lock the very question being picked — a joined class settles its own subjects — and a page
of twelve greyed buttons with a Done under it is a state nobody chose to be in.

### The journey had to assert the two things that pull against each other

`check-flow`'s multi-select journey asserted that the surface stays open across ticks, **which is
also true of the shape that was just rejected.** It asks both now: the list is on the page after two
ticks, AND `#sheet` is still hidden — so the sheet coming back fails it — and Done puts the form
back, because a list drawn in place of the form is a page somebody is stuck on if its one way out
stops working. `bookerCard` is exported for it, since the only way to ask "is the list on screen" is
to ask what page 0 of the booking column holds.
