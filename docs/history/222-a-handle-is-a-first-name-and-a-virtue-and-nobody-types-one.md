## A handle is a first name and a virtue, and nobody types one

**Asked for as "handles should be there name and a virtuas describing word. they can randomise it
but it will follow that general name."** `handleMake_` in people.gs builds `halex_kind`: the first
name, an underscore, and one word off `HANDLE_ADJ`, which is thirty virtues and nothing else (kind,
brave, honest, patient, gentle, generous, grateful, faithful…). The old list mixed virtues with
colours and moods (`golden`, `copper`, `lucky`, `sunny`) and put a number on every handle.

**A different word comes before a number.** A second Sam gets `sam_brave`, not `sam_kind10` beside
`sam_kind`, because that pair is one keystroke apart and reads as the same person. A two-digit tail
is added only when every word on the list is already taken for that first name, and then it is the
smallest free one. The walk is bounded: every word bare in a random order, then tails 10–99 on the
first word drawn, for the name and then the fallback.

**Eight letters at most, because it is arithmetic.** `HANDLE_SHAPE` allows 20: the longest word (8),
a tail (2) and the underscore leave `HANDLE_FIRST_MAX` = 9 for the name, which keeps `Alexander`,
`Charlotte` and `Elizabeth` whole. `thoughtful` and `considerate` are off the list for that reason.

**The Settings card shows the handle and a Randomise button, and the box is gone.** It posts
`randomiseHandle` (`self` in `ACTION_ACCESS`), which acts on the row the token resolved to whatever
id is posted, never hands back the handle you already have (`avoid`), and puts the old one at the
front of `handle_was`: newest first, comma-separated, the last `HANDLE_WAS_KEEP` (10). It goes
through `send_`, so the button spins and the card is locked. The new handle is written onto the card
and into `USER` at once, and `load()` refreshes every card that draws it. The "You were @…" line is
`HANDLE_SAID`, keyed by person and drawn from state, because the inbox and `profileRefresh_` repaint
the column a moment after the payload and a line written onto the element did not survive them.

**`changeHandle` and `HANDLE_COOLDOWN_DAYS` are deleted.** The month existed because a typed box let
somebody try variations until a rude one got past the blocklist. A handle built from a first name and
a chosen word has nothing to try variations of. `handleTrouble_` stays as the one gate every
candidate goes through: shape, reserved names, the blocklist (a first name can still carry a word,
and a name and a virtue can meet across the folded underscore) and the clash. It no longer takes
`isAdmin`. `handle_changed_at` is still written, as the date the newest handle began.

**`?run=renameHandles` must be run once after the backend deploys.** It regenerates every handle not
already `<first>_<virtue>`: `BrightOtter42`, `halex_bright42`, and typed ones. **A tailed handle
counts as the shape only while its number is needed**: `halex_steady71` reads as shaped, because
`steady` is a virtue, but a bare word is free, so it becomes bare. That rule is also what makes the
job safe to run twice. `handleParts_` is the one reader of the shape, used by `handleIsShaped_` and
by the job.

**Proved by mutation, twelve ways.** `check-handles.js`: always a tail; a number before trying another
word; `avoid` ignored; a random tail; `handle_was` overwritten or uncapped; the cooldown put back; a
tailed handle never or always left alone; `changeHandle` put back; `randomiseHandle` not `self`.
`check-profile.js` runs the action through the real `doPost`: a bare `ada_<virtue>`, a different handle
on every one of 15 presses, the history capped at ten, another person's id posted (only the asker's
own handle changes), signed out (refused and nothing written), and `changeHandle` no longer an action.
`check/states.js` has `settings · your handle`, which fails at all four widths if a box comes back
beside the button.
