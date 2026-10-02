## Every widget printed its name twice

`widgetColumn_` drew an `<h3>` from the roster's `name` above the widget, and **every widget's own
markup already had one**. Measured on the tools column: `Calculator || Calculator`, `Timer ||
Timer`, and the cheat sheet worse than either — `Cheat sheet maker (maths mat) || Cheat sheet maker
|| Cheat sheet — SATs`, three headings under two different names, because the roster label and the
card's own title had drifted apart with nothing comparing them.

**The widget's own heading is the one that stays.** It is inside the markup it belongs to, where the
roster's `name` has three other jobs — the search, the tile, the pager — and is a label rather than
a title. Two sources for one heading is this repo's recurring fault; the difference here is that
both were being drawn at once, so it was visible rather than silent.

**The check caught a real one on the way in.** `chess` has no heading of its own, and its comment
says so deliberately: *"A title saying 'Chess' above a chessboard... A board is self-explanatory in
a way almost nothing else in this app is."* That was true and it was not what happened — the roster
heading overruled it from another file. Removing that heading is what finally does what the comment
asked for, and `ACCEPTED_UNTITLED` records it with its reason so the NEXT untitled widget fails.

**Reels is an ordinary card now.** It was the only screen of the nine that returned its own markup
instead of going through `pages()` or `stack()`, so it drew straight onto the black with no pane.
The note defending that was about the SCROLL — a pane sets `touch-action: none` — and both are
available: the card is ordinary and `.reels` inside it keeps `touch-action: pan-y`, which is what
made the swipe work. The `.page.reel-page { height: 100% }` rule went with it; the scroller states
its own height, so there is no percentage to resolve and one fewer page that is special.
