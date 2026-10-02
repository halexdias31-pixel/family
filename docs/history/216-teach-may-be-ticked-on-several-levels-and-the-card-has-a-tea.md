## Teach may be ticked on several levels, and the card has a Teaches heading for all of them

**Reported as "when i tick teach for different levels of same subject it unticks the other one. i
dont want that. also you dont have a teach heading."** There was one Teach on the whole page, kept
in three places: `on('qual-tick')` unticked every other level's Teach, `qualsIn` kept only the first
posted, and `qualsList_` kept only the first row read. All three are gone. The only rule left is that
Teach implies Can teach, and unticking Can teach takes Teach off.

**The missing heading had the same cause.** `Teaches` was drawn from `teachesMain`, a single string.
A tutor whose one Teach was dropped, or who had none, got only `Can also teach`. `teachesOf_` now
returns `main` as a list, and `doGet` sends it as `teachesSpec`. It still sends `teachesMain` as the
first one, for a phone built before this. The card draws every `teachesSpec` entry as a gold chip
under `Teaches`, and the rest of `teaches` under `Can also teach`.

`check-flow.js` ticks Teach on two levels through the real handler and wants both still ticked.
Putting the untick back fails it. `check-people.js` asserts two Teach rows are two Teaches on the way
in, on the way out and in `teachesOf_`. Stamps are `2026-10-01-a-manyteach`.
