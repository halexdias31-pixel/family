## A handle is a first name, a virtue and a fresh number, in a random order

**Asked for as "nobosy can actually change their handle specifically, they can just hit randomise.
but it will always be like their first name, a virtuous adjective and random numbers and maybe an
underscore. but all random order."** The first half was already true (222: no box, a Randomise
control posting `randomiseHandle`). The second half reverses 222's rule, and the owner confirmed
the reversal: a new handle, and every Randomise press, is the first name, a virtue off `HANDLE_ADJ`
and a two-digit number drawn fresh each time (10–99), arranged in a random order, sometimes with
an underscore, never starting with the digits. **Existing handles are not regenerated.**

**`handleMake_` draws, it no longer walks to the smallest free tail.** `handleDraw_` builds one
candidate: one of `HANDLE_ORDERS` — the four of the six orders of three parts that do not lead with
the number, because `HANDLE_SHAPE` wants a letter first — a fresh number, and an underscore at one
of the two joins with `HANDLE_UNDERSCORE_ODDS` = 0.5. `halex_kind42`, `kindhalex42`, `halex42_kind`,
`kind42halex`. Every candidate still goes through `handleTrouble_`; the walk is the words in a
random order, round twice (`HANDLE_TRIES` = 60), for the name and then `friend`, then it gives up.
One underscore at most keeps the arithmetic of 222: 9 + 8 + 2 + 1 = 20, so `HANDLE_FIRST_MAX`
stays 9.

**What 222 warned about is still partly guarded.** `sam_kind10` beside `sam_kind` was the reason
numbers came off. The clash check compares by `key()`, which drops underscores, so `halexkind42`
is refused while `halex_kind42` exists, and `avoid` (Randomise never hands back your own) compares
the same way. It does not refuse `kindhalex42` beside `halex_kind42` — same parts, another order —
which takes a second Halex drawing the same word and the same number. Left as the owner's call.

**`handleParts_` reads every arrangement and the 1 October shape.** Built from the lists as a regex
of alternatives per order, because `kindhalex42` has no separator and only the word list says where
the virtue ends; backtracking means a first name that is itself a virtue (`True`) still reads.
Old `halex_kind` and `halex_kind71` are shaped, so `?run=renameHandles` leaves them alone.

**`renameHandles` no longer strips a tail, and `handleBareFree_` is deleted.** Its 222 rule renamed
`halex_steady71` to a bare word once one was free; with a number on every handle that rule would
strip the number off every Randomise press on the next run. It now asks one question — shaped? —
and still renames `BrightOtter42` and typed handles. It was not run. Its comment now says that a
child with no e-mail signs in with the handle (c3b5ba7), so renaming an unshaped one moves that
child's sign-in name; the report names them by id.

**Randomise is a tile.** It was a `.btn quiet` beside the PIN form's button; the handle is a thing,
so its one action is `tile_({ icon: 'shuffle', … act: 'handle-shuffle' })` with a new crossing-arrows
mark in `TILE_ICONS`. The line under it says a press makes a new first name, word and number, and
that a handle you sign in with changes with it.

**Measured.** `check-handles.js` runs 356,400 candidates (11 names × 30 words × 4 orders × 3 joins
× 90 numbers) through the gate: 36 are refused (digits fold onto letters — `ada` + `55` is
`adass`), and the generator draws again; it fails past one in fifty. 200 generated handles over
nine first names: every one shaped by a regex written in the check, never led by digits, at most
one underscore, ≤ 20, accepted by the gate and read as shaped by `handleIsShaped_`; all four orders,
both joins and no join, and 79 different numbers seen. `avoid` is proved by pinning `Math.random`
to 0 so the generator is made to offer the person's own handle (and its spelling without the
underscore). `check-profile.js` runs 17 presses through the real `doPost`: every answer in the shape
and more than one order across them. `check/states.js` "your handle" now wants the tile with its
mark and no `.btn`.

**Proved by mutation, eleven ways**, each red for its own reason and green on restore: one order in
the list; the draw always the first order (also `check-profile`); a digits-first order added; the
parser reading only the old shape; `avoid` ignored; the number always 10; never an underscore; the
tail-strip put back in `renameHandles`; no number at all (also `check-profile`); the gate skipped;
and Randomise written back as a `.btn` (`check/ui.js --screen=settings`, red at all four widths).

Stamps not bumped here — the merger bumps all four together.
