## A person may change their own name now, and two of the three asks were already built

**Asked for as "allow people to be able to change their own code and username. i will need a naughty
username blocker? and maybe only allowing them to change username once a month maybe a good idea?"**
Measured before building anything, and two thirds of it existed:

| | |
|---|---|
| **the code** | `changePin` is access-listed `'self'`, wired at `me.js:1490`, three fields at the foot of the *Edit me* sheet, new PIN typed twice, current PIN required. **Already done** |
| **the username** | `handle` is not in `PROFILE_EDITABLE`, so nobody has ever been able to change one. This is the whole of the new work |
| **the blocker** | yes, and it is the SECOND most important guard |
| **once a month** | yes, and not for tidiness — see below |

### Uniqueness is the rule that matters, and it is correctness rather than taste

**`findPerson` resolves a person by `person_id`, then `full_name`, then `first + last`, then
`handle`, then `username` — first match wins.** So a handle duplicating any of those makes
`changePin` check the PIN somebody typed against **another person's row** and tell them their own
PIN is wrong. This file already records that denial: it happened by accident, to one person, because
a call forgot to send an id.

**Letting people choose their own handle turns that accident into something a person can do on
purpose.** So the check is against all four columns and not just `handle` — and it is the reason the
word list, which is what anybody asks about first, is the second guard rather than the first.

### And `handle` and `username` are one fact in two columns

**Third occurrence of the shape**, after `needs_print`/`print_required` and `category`/`compliance`.
`register` writes `username` as `norm(first + last)`; `doGet` reads `handle || username ||
first_name`; `findPerson` matches both. **A change writing only `handle` would leave the old name
answering to that person for ever** — a new name and still reachable by the old one. `changeHandle`
writes both or neither.

### The cooldown is a brake on the arms race, not a tidiness rule

A blocklist is a floor and never a ceiling: somebody who can rename freely sits there trying
variations until one gets past, which is a game they win eventually. **Thirty days turns that into a
month of waiting per attempt.** `handle_changed_at` is the only state — one date, no counter, so the
rule is *has a month passed* rather than a tally to keep in step. **Admins skip the cooldown and
nothing else**: an admin fixing somebody's bad handle is the remedy, and an admin taking a taken
name is still a collision.

**`handle_was` is a safeguarding column rather than a nicety.** Most of the people on that tab are
children. A rename leaving no trace means an admin cannot answer *"who was @foo last week"* — the
question that gets asked exactly once, about the one account where it matters.

### The Scunthorpe half is half the cases, because the wrong refusal is the worse one

**A rude handle is seen by a parent; a real name refused is somebody who has done nothing, told no,
with no way to argue.** So `HANDLE_ALLOWED` carries nineteen innocent words with **one written
reason each** — `analysis`, `classic`, `cocktail`, `bassist`, `therapist`, `scunthorpe` itself —
which is the `ACCEPTED` / `VOCAB` / `ACCEPTED_TAP` / `RETIRED_FACETS` pattern for a fifth time, and
means a NEW collision fails loudly instead of joining a list nobody reads.

**Matched against the de-leeted form**, so `f4gg0t`, `sh1t_lord` and `b0ll0cks` are the same strings
as their plain spellings before anything is compared — a filter that only catches the plain spelling
catches nobody who is trying. **And the word is never quoted back**: naming it is repeating it, on a
site children read, and the person who typed it already knows which one it was.

**ASCII only, and that one is about safety rather than shape.** `раul` with a Cyrillic а and `paul`
are different strings that look identical, so a handle nobody can tell from somebody else's is
impersonation with nothing to point at. Refusing unicode makes it impossible rather than something
to spot.

**No rule is repeated on the phone.** The box checks whether it is empty and nothing else; the line
underneath says whatever the server said. `MESSAGING` records the argument — a rule written twice is
two rules to keep in step — and writing "3 to 20 characters" into `me.js` would be a third place for
that number to be wrong.

### `node js/check-handles.js` found a real one on its first run

**Every banned word was being let through.** The allow-list's end-of-string test was
`folded.lastIndexOf(w) === folded.length - w.length`, and `lastIndexOf` answers **-1** when the word
is not there — so any handle exactly one character SHORTER than some allowed word made `-1 === -1`
and was waved past. `fuckface` is eight characters and `therapist` is nine. **Thirteen cases failed
at once, `n1gg3r` among them**, on a line that reads perfectly and is wrong by a sentinel value.

**Nothing about that was visible from reading it**, which is the entire argument for writing the
check before trusting the filter — and it is the same shape as `.mat-out` and the seven dead custom
properties: reasoning about behaviour instead of asking for it. It is `startsWith`/`endsWith` now.

**41 usernames checked**, every one a fault that happened or would have: the shape, the Cyrillic
lookalike, the reserved names, the leet spellings, the innocent words, a clash against each of the
four columns `findPerson` answers to, your own handle not clashing with yourself, and the month
holding at five days and releasing at two hundred. Plus three that an admin must NOT be exempt from.
