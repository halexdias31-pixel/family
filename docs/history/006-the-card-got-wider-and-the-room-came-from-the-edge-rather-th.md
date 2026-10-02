## The card got wider, and the room came from the edge rather than the gap

**`CARD_W` in `shell.js` is the universal width.** Every widget, every card, every page on every
screen sits inside `.page`, which is `var(--card-w)`; widgets have no width of their own. One
number, one place — so "make the widgets a bit wider" is one constant.

**There are only two places the extra width can come from and they are not equivalent.** Across the
screen sits an edge, a gap, the card, a gap, an edge, and `2 × EDGE_SHOWING + 2 × gap + CARD_W = 1`.
Take it from the gap and the cards close up on each other, which is the one outcome that looks
broken rather than merely tight — `stepX_` refuses it outright. **Take it from the edge and you see
slightly less of the neighbour**, which still does its whole job: that edge exists to say "there is
another one of these beside you", and 6% of a phone is 23px.

So `CARD_W` 0.80 → 0.84 and `EDGE_SHOWING` 0.08 → 0.06, **gap unchanged at 2%**. Measured at the
four widths the checks use: 256 → 269 at 320px, 312 → 328 at 390px, and 329 → 345 wherever `--app`
caps the column at 26.5rem. `check/ui.js` reports nothing new across 88 combinations.

**The CSS fallback had to move with it.** `.page { width: var(--card-w, 84%) }` is only what is
drawn before the script runs — but if it disagrees with `CARD_W`, the first paint is one width and
every one after it is another, which reads as the app flinching as it opens.

**And the prose above those constants named 88% and 4% while the code said 80 and 8.** Both pairs are
self-consistent, so nothing was broken and nothing could have caught it — a sentence that stopped
being true when the numbers under it changed. It describes the shape now and names the numbers once,
which is the only version that cannot go stale. Same fault as "all 18 checks pass" and "one of the
eighteen names".
