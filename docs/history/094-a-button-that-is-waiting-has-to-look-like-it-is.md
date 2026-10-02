## A button that is waiting has to look like it is

**Reported as "sign in page feels very unresponsive even if it is loading".** `send_` has disabled
the button and relabelled it `Checking…` since it was written, and against this backend that label
sits there for about fifteen seconds without moving. **A word that does not move is not
distinguishable from a word that is stuck**, and the reasonable conclusion is that the tap missed —
which is the same reasoning that made `send_` take a button in the first place.

**One rule, on `send_`'s own busy class, so every write in the app gets it** rather than the
sign-in button alone: booking, saving a profile, posting a comment. A ring rather than a bar or
dots, because it is the one shape that cannot be mistaken for content on a button that already
holds a word, and it sits in the button's own `gap` beside the label. `currentColor` at a third, so
the gold button, the ghost and the quiet one are one rule and none of them can go invisible on a
palette nobody has thought about. Measured: `Checking… disabled SPINNER`.

**And the refusal is cleared on the way in.** *"The name or PIN not recognised doesn't disappear
after i just logged in correctly"* — `send_` overwrites it with `Checking…` and `repaint` rebuilds
the card without it, so this is belt and braces rather than the only thing standing between the
two. It costs a line, and the sentence it removes is one that tells somebody who has just got in
that they did not.
