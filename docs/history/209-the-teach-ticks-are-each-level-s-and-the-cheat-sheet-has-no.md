## The Teach ticks are each level's, and the cheat sheet has no Fill or Clear

**Asked for as "each level should have a tickbox which is 'teach' and 'can teach'. instead of for
the whole subject."** The pair moved off the subject and onto every level of it, and they ARE the
saved `qual_N_spec` / `qual_N_teach` boxes, so nothing writes a subject tick down any more
(`qualSubjectSync_` now carries the name only). **`Teach` is the specialism**, the one gold chip on
the card, and ticking it unticks every other level's; **`Can teach`** is everything else. Ticking
Teach ticks Can teach beside it and unticking Can teach takes Teach off, which is the rule `qualsIn`
already enforces, so there is no backend change and nothing saved moves. The level's summary line
ends `teach` or `can teach`; the subject's marks each level with ★ or ✓. A shut level now hides its
school and year boxes too; before, `.q-lvl.is-shut` hid only its first row. `settings · the
qualifications` asserts no tick on the subject, a pair on every level, and `100` / `110` across
GCSE, A-Level and a new level.

**Asked for as "get rid of fill the page button on the cheat sheet maker. and get rid of clear
button."** Both buttons, their handlers, `matFill`, `matOver`, `matArea` and `MAT_LEFT` are gone. A
sheet is built by ticking pieces and a piece comes off by unticking it. `check-flow.js` loses the
Fill-order journey. The cheat-sheet state ticks five pieces through the list's own boxes and asserts
that neither button is there.

**And every subject and every level has a delete button.** Asked for as *"there should be a delete
button for subjects or levels"*. A level already had one, `Remove this level`, but it was at the
foot of an OPENED level, and every saved level arrives shut, so nobody found it. Now a 44px ✕ sits
on every summary line, shut or open, beside the line rather than inside it, because the line is
itself a button. `qual-drop-subject` empties each of the subject's levels back into the pool, the
same way `qual-drop` empties one, then removes the subject. Nothing is lost until Save. The
qualifications state asserts one ✕ per subject and one per level.
