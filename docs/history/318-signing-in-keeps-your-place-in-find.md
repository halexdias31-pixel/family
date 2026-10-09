## Signing in keeps your place in Find: the same chips, the same card, the same page, and the answer moves to you

**The owner, 9 Oct:** *"when the child writes something in an answer box then goes to sign in, it wipes
their finder so they have to click all the way to get back there."*

### Why it was wiped

**ONE CONDITION DID TWO JOBS.** `signedIn_` (js/me.js) starts with
`if (!USER || String(USER.personId) !== pid || !pid) signedOut_({ quiet: true })` — the person arriving
is not the one whose things are held, so clear them first. True when one child signs in over another,
which is what it was written for (note 296: the last child's private message on the next child's
Messages column). **And true when NOBODY was signed in**, which it was never thought about for.

**AND `signedOut_` EMPTIES FIND.** `STUFF.q = ''; STUFF.filters = []` — added after the review of the
Bible found an admin signed out on the Books shelf leaving *"WHAT KIND Resources ✕ SHELF Books ✕"* on a
signed-out Find (note 292): the name of a shelf only an admin is shown, on the screen of somebody who is
not one. Right for a sign-out. So a child who walked the funnel signed out — Questions → Maths → Past
paper → GCSE → Higher → 2023 → June → Paper 1 — went to the card, typed an answer, swiped across and
signed in, and `signedIn_` sent them back to Find (it already does, `PREV_AT`), **onto a Find that
started again from its first question**. The answer was not lost — `ansRead_` moves a signed-out answer
to whoever signs in (note 296) — but it only does that when the card is drawn, and the card was eight
taps away.

Measured in Chromium at 820x1180 (the iPad), the real library, the owner's errand to June 2023 1H Q13:
signed out on page 28 with "80" in the box; signed in, page 0, chips `[]`, the answer still under the
signed-out key and nothing under the child's.

### What changed

| | |
|---|---|
| **`signedIn_` decides, in one place** | `if (!USER) signedOut_({ quiet: true, keepFind: true }); else if (… !== pid \|\| !pid) signedOut_({ quiet: true });`. Nobody → somebody is the same seat: the same child, now with a name. |
| **`signedOut_` takes `keepFind`** | and leaves `STUFF.q` and `STUFF.filters` alone when told. Everything else it clears still goes, because it is the device's last person's or nobody's: the stars, the inbox and its poll, the done dates held, the keypad and any sheet, the payload's per-person keys, the films, the answers' read. Nothing in it touches `PAGE`, so the card and the page come back with the chips. |
| **Sign out, the dead session, and A → B** | unchanged: Find starts again. Only `signedIn_`'s nobody-held branch passes `keepFind`. |
| **Find stands on the card by name when the list under it changes** | `PAGE.stuff` is a number and a redraw kept the number — right while the list is the same list. The payload that lands after signing in is that person's, and a signed-in child can be shown more (their friends answer a search; for an admin, the Bible's index joins the list mid-read). Measured: one more row in front of Q13 and the redraw put the child on Q12. So a filled page now says which card it is (`FIND_AT` on the page element, written by `stuffFillOne_`, read only while the page is still marked filled), and the two redraws that keep your place — `screen('stuff')` and `paintStuff(true)` — look that card up in the new list (`stuffHeld_`, `stuffBackTo_`). Asked of the page on the screen rather than remembered, because that is what the child is looking at. Only for the same search and chips; a card that is gone leaves the number as it was. |

**Why not split Find's reset into its own function.** It is two lines and one caller decides; an option
passed from the one branch that wants it reads as what it is, and `signedOut_` stays the single list of
what is one person's.

### Checked

- **check-flow, "signing in from signed out keeps Find's chips, the card and its page — and the typed
  answer moves to the child"**: real rows of data/questions.json (the three June 2023 Higher papers and a
  Corbettmaths sheet, so the funnel has questions to ask); the funnel walked by **clicking its own chips**,
  each the first answer that keeps Q13's card on the strip; Q13's page (page 28 of the column, its 28th
  result); "80" pressed on the keypad; `go('account')`; the handle and PIN 0000 typed; Sign in pressed,
  as a student, with the payload after it held. Asserted before the payload: on Find, the same chips and
  search, the same page, Q13's card on it, the box under the student's key drawn holding "80", the answer
  stored under `ans:u:P12:` and the signed-out copy gone. Then the payload is released carrying one more
  row in front of Q13 (Q7 gains a part (b) — one page, as the walk chose Questions and answer pages are
  not drawn), and all of it is asked again: the page number has moved and the card has not. And the
  moved answer goes up to the student's account.
- **check-flow, "Find is still started again when an admin signs out from an admin-only shelf, and when
  another child signs in over the last"**: an admin on Resources → Books with `genesis` typed presses the
  real Sign out — chips, search and the word Books gone; a child signing in after that is handed none of
  it; Ada signed in with chips and a search, then `signedIn_` for another child — Find cleared; the same
  child signing in again keeps theirs.
- **Proved by mutation**, each red, then green on the real files: `signedIn_` as it was (the journey
  fails on every assertion); the find.js half reverted (fails only after the payload, "Find is on
  Q-1MA1-2306-1H-12"); `keepFind` passed on a switch (the counter-case fails, "handed Ada's Find");
  `signedOut_` never clearing Find (the counter-case fails on all four).
- **In Chromium** (a scratch Playwright walk over the real library and `check/fixture.json`, not
  committed): before the fix, signed in onto the funnel's first question; after it, on Q13 with "80" and
  *Saved to Sol's account* under it, the card centred (589px against 590), and still there after a
  second repaint.
- `check.js`, `check-const.js`, `check-signin.js`, `check-answers.js`, `check-saved-answers.js` green.
  **check-flow: 199 journeys, 198 pass.** The one that does not — "the videos widget is last on Games…"
  (*the card never asked for data/videos.json*, *there is no search box on the videos card*) — fails the
  same way on the commit this was built on with neither file changed, so it is not this note's. A
  second full run, at a load average of over forty, also failed two journeys that time themselves —
  the imposter game drawing and the timetable saving; the timetable passed run alone, and the imposter
  journey failed the same way on the base commit at that load.
- `check/states.js` is the list of states, not a runner (it loads); its runner, `check/ui.js`, on the
  account column: 100 combinations, nothing new, and the same states unreachable as on the commit
  before. On Find: 584 combinations, nothing new; one state ("a worded answer, the pad up on its
  letters" at 1280) was not entered on a machine with a load of thirty-odd, and 1280 alone, run again,
  measured all 117.

### Not changed, and worth knowing

- **A switch from one child to another still starts Find again**, as it must (their chips may name what
  the next child is not shown). On the family iPad that means the second child walks the funnel again;
  the chips chosen are not remembered per person.
- **The answer moves when the card is drawn**, by `ansRead_`'s rule — so an answer typed signed out on a
  card the child never returns to stays under the signed-out key until somebody draws it.
