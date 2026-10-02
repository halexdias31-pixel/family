## Two players, one phone — and Connect 4's board had been a black stripe

**Reported as "connect 4 should be not against pc but 2 player. also its blacked out right now"** and
**"othello looks a bit shit. the black blends with the backgorund. do red and blue and dont show the
locations players can pic. also should be 2 player not against cpu".**

**THE BLACK STRIPE IS A DELETED CSS RULE AND GIT NAMES THE COMMIT.** `.c4 { grid-template-columns:
repeat(7, 1fr); grid-template-rows: repeat(6, 1fr); aspect-ratio: 7/6 }` went in *"A board square
cannot be 44px, and the arithmetic is the reason"*, which rewrote the block around it and took the
`.c4` half with it. `.oth` kept its own and has been fine throughout.

**A grid with no template is one column of 42 rows**, each `auto`, and a `<button>` with `height:
100%` has no intrinsic height — so every row collapsed and what was on screen was the board's own
`background: var(--line)` and 3px of padding. **Nothing threw, nothing overflowed, and `check/ui.js`
measures tap targets and sideways scroll rather than whether a box has a size at all.**

**And the comment survived the rule it describes**: *"7:6 AND 1:1 BECAUSE THAT IS WHAT THE GAMES
ARE"* was still sitting over a block that only said 1:1. Same shape as `.favwrap.is-fav`, as the dead
`kind === 'paper'` guard, and as `resource_type` in `VOCAB`.

**TWO PLAYERS MEANS TWO EQUAL COLOURS, and that is why gold left both boards.** Gold against `--dim`
and gold against `#15130f` was right while one side was YOU and the other was the machine — gold is
what this app means by yours. With two people at one phone there is no "yours", so a bright side and
a faded side reads as one player being switched off, and a near-black disc on a near-black card is
not a disc. Connect 4 is red and yellow because that is what is in the box; Othello is red and blue
because that is what was asked for. **Declared on the component**, which is the rule the house style
states with the chess board's cream and charcoal.

**THE LEGAL-MOVE RINGS WENT AND THE ARGUMENT FOR THEM DOES NOT SURVIVE A SECOND PLAYER.** They were
defended as teaching — Othello's legal moves are not obvious — and `othMoves_(cells, 1)` is one
side's answer drawn on a board the other side is reading. Working out where you may play IS Othello.
**Every empty square is pressable now and an illegal one says why**: it was `disabled` unless it was
legal, which is the ring in another form, and a screen reader would have heard the same list. A press
that does nothing at all is what `check/press.js` exists to report.

**Both opponents are deleted rather than switched off.** A dormant AI behind a flag is a second mode
nothing presses, which is `orderPrints`; the three rules Connect 4 used are four lines somebody can
write again if a solo mode is ever wanted, and they are kept in prose where the code was.
