## The flap waited for the finger to come up, and the panel went back to being a sky

**Asked for as "can you make flabby pird more responsive on ipad. when you tap theres like a slight
delay. also make it look more like flappy bird. blue scky green pipes and the bird."** Three things,
and the first one is one line.

### `click` fires on the release, so every flap in this game had waited out a whole tap

**`canvas.onclick = flap` — and a `click` is the LIFT.** So the delay is not a frame budget, a
repaint or a canvas being stretched: it is the eighty to a hundred and fifty milliseconds between a
finger landing and it coming off again, paid on every flap since the game was written. **There is
nothing in it to tune.** No amount of that is removable while the event is the wrong one, which is
why it reads as a fixed lag rather than as the game being slow.

**THE DELAY PEOPLE REACH FOR FIRST WAS ALREADY GONE.** `.flappy` has carried `touch-action: none`
since it was written, and `index.html`'s viewport is `maximum-scale=1,user-scalable=no` — so iOS's
own double-tap-to-zoom wait had been ruled out twice over. Checking that first is what stops this
becoming a CSS change that measures nothing, which is the shape this file records under `.mat-out`.

**`pointerdown` FIRES THE INSTANT THE FINGER LANDS**, and it answers a finger, a pen and a mouse
from one binding — which is why it is that rather than `touchstart` beside a click.

**A SWIPE THAT BEGINS ON THE CANVAS ALREADY FLAPPED, so nothing is lost by moving off `click`.**
`PRESS_MOVED` in shell.js swallows the click a drag produces — and it does so in the DOCUMENT's own
bubble handler, where an element handler in the target phase has already run. `canvas.onclick` was
never covered by it, so the case that looks like a regression is the behaviour that was already
there. `onclick` is cleared rather than left alone, because a stale one would be two flaps a tap.

### `node check/press.js` — the question is asked between the touch going down and coming up

**Nothing in the suite could see this and each instrument is right about what it asks.**
`check/ui.js` measures whether a control can be read and hit, and **a late control measures
perfectly**. The press pass DISPATCHES at elements rather than touching them, so it never produces
the gap at all. And the canvas carries no `data-do`, so it was not in that queue in the first place.

**So the rule is asked in the one moment the two bindings differ**: `touchStart` sent, state read,
`touchEnd` sent. With `click` nothing has happened yet; with `pointerdown` the bird is already
rising. **Anything measured after the lift passes either way**, which is exactly how a check that
cannot fail gets written — and this file has deleted one of those before. Proved by mutation:
`canvas.onclick = flap` put back names it as *"nothing until the finger came up"* and exits 1.

**The loop is stopped by hand afterwards** rather than by leaving the column: a
`requestAnimationFrame` left running behind the forty-one pages the walk below turns would be
sharing their frame budget.

### Blue sky, green pipes, and the case came off with the panel

**The screen was four shades of olive green** — the panel the original ran on had two bits per pixel
and no backlight — **and the card round it was a charcoal handheld**: a bezel deeper at the foot
than at the head, a power light, a line of tiny type reading `DOT MATRIX · @family.`, a raked
speaker grille. About thirty lines, every cue on the real object, and none of them a control that
did nothing.

**THE SHELL'S OWN NOTE IS WHAT DECIDED IT WENT.** It said, in as many words, that *"a shell round a
sky-blue game is a costume, while a shell round an olive panel is the object itself"* — so the
moment the screen became a sky, the case was the fancy dress it had itself refused. Keeping it would
have been a Game Boy bezel with a maker's mark around somebody else's game. **The card is an
ordinary widget now**, like the chess board and the maze beside it, and its heading, its rows, its
note and its board go back to the app's own tokens rather than to four greys of their own.

**EIGHT COLOURS AND THEY ARE THE ORIGINAL'S OWN.** A cyan sky rather than a pure blue, because that
is what the sprite sheet holds and a flat cornflower reads as a template; a pipe that is three
greens, because a lit edge and a shaded one are the whole of what makes a rectangle a tube; and one
dark outline shared by the pipes, the bird and the floor, which is what stops a bright palette
reading as clip art. **Declared in `initFlappy` where `LCD` was**, for its reason: the canvas is the
only thing that paints any of them. `.flappy`'s own background is still the app's sunk grey and is
deliberately NOT a second copy of the sky — it shows for one case, a canvas the browser has not laid
out yet, and a blue written there would be one colour in two files that quietly drift.

**THE FLOOR IS PART OF THE GAME NOW rather than a stripe painted over the bottom of it.** The bird
died at the canvas EDGE while the old two-shade band sat above that line, so the last few pixels of
every fall were a bird inside the ground. `FLOOR` is one name and the death test, the bottom pipe
and where a pipe's mouth may fall all read it, so they cannot disagree about where down is.

**THREE LAYERS AT THREE SPEEDS**, which is the whole background: clouds at a third of the pipes,
scrub at a half, the floor's hatch at the full speed. The last of those is the one that matters —
with a still floor the eye reads the whole screen as slower than the pipes actually are. **Every
offset comes off `S.frame`, so a game that has not started holds still**: a background scrolling
under a "Tap to play" is a screen that looks like it has already begun, and it is the same fault as
a wing beating over one.

**THE BIRD TILTS WITH ITS OWN VELOCITY**, and that is not decoration: it is the only thing on the
screen that says how fast you are falling before you have fallen. Drawn at the origin and moved by
the canvas, because a rotation about the bird would otherwise put `S.bird.x` through a trig function
at every coordinate — **and the collision is untouched by it**, since a rotation moves neither a
circle's centre nor its radius.

**THE CAP IS WIDER THAN THE SHAFT AND THE HITBOX IS THE SHAFT.** Those few pixels each side are free
on purpose: a hitbox tighter than the drawing is the version of this game that feels fair, and one
wider than it is the version people stop playing.

**And the score is big, centred and outlined**, which is where the original keeps it and is also the
only place a white number survives — a sky, a green pipe and a tan floor all pass under that line,
and an unoutlined figure disappears into whichever of them it is over.

**AND `SCORE_TOP` IS THREE BECAUSE THE PANE CANNOT GROW, WHICH IS UNCHANGED — but the paragraph
under it here has gone stale and is left standing with this sentence pointing at it.** It says your
own line is a gold rule down the left rather than gold text because
`.widget-full:has(.flappy) .row .k` scores (0,3,1) and a colour would tie with it. That rule went
with the shell. **The edge stays and it was never only a way round a race** — a gold rule down the
left is already what this app means by "yours" — so nothing in the code changed; what changed is
that the reason quoted for it no longer exists. The same two sentences were in `style.css` and in
`check/states.js` and both are corrected in place. Found by grepping for the class before deleting
it, which is the only reason three copies of one argument did not outlive it — the shape this file
records under `.favwrap.is-fav` and under the dead `kind === 'paper'` guard.

**Nineteenth time this file writes that a screenshot is the last word on something drawn** — counted
off the entries above rather than remembered, because this tally has been wrong in its own warning
twice. Nothing measured wrong at any point: the card is 467 / 554 / 583px at 320 / 390 / 768,
identical to the pixel before and after, because the canvas is `margin: auto` in a card the pane
sizes. What a screenshot settles is whether it reads as the game, and it does.
