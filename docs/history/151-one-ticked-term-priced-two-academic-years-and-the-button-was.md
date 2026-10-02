## One ticked term priced two academic years, and the button was there twice

**Reported as "why is it coming out to so much?"** over a screenshot of the booking card totalling
**£1024.59** whose Dates row listed **eighteen sessions across two Septembers** — 28/09/26 to
13/10/26, and then 06/09/27 to 12/10/27 — for one ticked term.

**REPRODUCED BEFORE ANYTHING WAS READ ABOUT, WHICH IS WHY THE DIAGNOSIS IS SHORT.** With two rows
named `Autumn 1` in the payload and one button pressed:

| | one `Autumn 1` | two |
|---|---|---|
| `bookSpec().windows` | 1 | **2** |
| the `Term` row reads | `Autumn 1` | **`Autumn 1, Autumn 1`** |
| sessions | 3 | **10** |
| the total | £60 | **£200** |

**`bookSpec` FILTERS BY NAME WHERE EVERY OTHER READER FINDS.** It became a filter when the step
learned to take several answers — correctly, because several terms is several windows — and a name
sent twice is then one tick meaning two of them. `waitTerm_` and the receipt's term lookup both use
`.find`, so they were already right BY ACCIDENT; `intervals_()` is the one answer to "which terms
exist" and all four readers go through it, which makes that luck a rule and stops the option list
offering a name the price would read differently.

**A NAME IS AN ANSWER TO A QUESTION AND A QUESTION HAS ONE ANSWER.** Two identical buttons is not a
choice anybody can make, and ticking one cannot honestly mean *both of them* — it means the one
about to be taught, which is the first, because `doGet` sends them chronologically.

### The payload really ships the name twice, and its own comment said otherwise

**`doget.gs` HAS CARRIED A NOTE CLAIMING THIS WAS FIXED** — that once terms which have ENDED are
dropped, *"each name appears once inside the next twelve months"*. Measured against the real
`schoolYear` on **25/09/2026**, the filter it describes keeps **`Autumn 1 2026-09-07..2026-10-23`
AND `Autumn 1 2027-09-06..2027-10-22`**: the first has not ended, and the second starts **four days**
inside the 370-day cut-off. Every other name appears once.

**SO IT HELD FOR MOST OF THE YEAR AND FAILED EVERY AUTUMN, which is the one term it matters for** —
a sentence true in March and false in September, which is exactly the shape this file records under
`.favwrap.is-fav` and the dead `kind === 'paper'` guard. One row per name, the earliest, which is
what the sentence always meant to say. **The 370-day window is untouched**: a shorter one would drop
July's list of the September after it, which is the case two school years are sent for.

**FIXED AT SOURCE AND ON THE PHONE, because the deploy is blocked** on the Cloud-project switch and
this app's house rule is that a broken sheet must still produce a working site. The source fix is the
repair; `intervals_()` is what makes a payload it does not control harmless.

### `no day of the year offers one term name twice` — the real block, over a year of todays

**One date proves one date, and the fault is a date RANGE.** So `check-booking.js` cuts the
`computed` block out of `doget.gs` and runs it 365 times, with `Date` **shadowed as a parameter of
the generated function** rather than the source being rewritten — so what is measured is the code
that ships, to the character. `termsFor` is stubbed to `schoolYear`, which is what the real one
answers with when nobody has typed the dates into the sheet: the case that ships.

**THE FIRST VERSION'S CUT ENDED AT THE DEDUPE FILTER'S OWN `});`** — so removing that filter, which
is the one mutation worth making here, took the cut to an unrelated brace and the check failed with
*"missing ) after argument list"*. **A guard firing for a fault in its own cutter teaches nothing**,
which is the `check/load.js` lesson about an instrument that lies. It ends at the next STATEMENT now.
**Proved by mutation**: the dedupe removed names every day from 25/09/2026 onwards with both start
dates printed; the real file is green.

**And a journey for the other half.** `one ticked term prices one term` seeds a payload holding the
name twice and asserts four things: the question does not offer one name as two buttons, one tick
opens one window, the Term row reads one name, and **no session falls outside the ticked term's own
year** — which is the thing the report was actually about. All four fire with `intervals_()` reverted.
