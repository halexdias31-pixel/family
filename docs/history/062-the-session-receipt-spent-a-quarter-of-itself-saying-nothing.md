## The session receipt spent a quarter of itself saying nothing fourteen times

**Reported as "audit the reciept and see how it could be made better. its so fucking clunky long
looking".** Measured first, signed in at 390px, on a real session — subject, level, tutor, venue,
six dates, a price:

| | before | after |
|---|---|---|
| the receipt card | **683px** | **470px** |
| its rows | **28** | **14** |
| of those, a dash | **14** (168px) | 0 |
| rows taller than one line | 3 | **0** |
| `span.bk-t` past its column | 18–28px, four widths | 0 |

### The dashes are right on the form and wrong on the receipt

**`SPINE`'s own note is the argument and it is right about one document**: *"a row with nothing to
say prints a dash rather than being left out, because a document whose SHAPE changes with its
contents cannot be read at a glance: you find a line by where it is."* That is how you use a FORM —
the rows you have not answered are the rows you are about to, and one appearing under your thumb as
you answer moves everything below it, which is the complaint this file already records about the
week grid folding.

**A receipt is not filled in.** It is read once, about one session, and nobody counts down it to
find `Tutor`. A row saying a fact does not exist is not a fact; on a printed receipt it is the line
the shop leaves off. So `spineRows_` takes a `fill` flag, the form is the untouched caller, and the
receipt asks for something different.

**The spine and its guard are untouched**, which is what makes it safe: this changes which rows are
DRAWN, not what a row is called or where it sits. `check-spine.js` reads the LABELS both builders
push, not the markup, so the drift it exists to stop — `Seats` against `Students`, `Space` against
`Host` — is caught exactly as before. Proved by mutation: a stray `Invoice ref` still exits 1.

### `check/ui.js` had never had a receipt on the screen, and that is why three faults were sitting on it

**Measured before anything was changed: the booking column draws ONE page and it is the form.**
`myJobs_()` keeps the sessions whose `client` or `tutor` is the visitor, and the fixture's one job
names neither — so `booking: nothing to report` has meant the form at four widths on every run this
file has ever made. **The most-complained-about card in the app was outside the measurement.**

**And the basket is worse: no fixture can reach it at all.** `basketPages()` draws nothing when
`CART` is empty, and `CART` lives in `localStorage` rather than in the payload.

Both are declared states now — seeded through the app's own doors, `DATA.liveJobs` and `CART`, the
way the signed-in visitor and the seeded message thread already are. 104 combinations became 112.
**Every fault below came from their first run.**

### Three faults, and the third had been dead since the line was written

**`Per session` wrapped its label on every receipt ever drawn.** A 68×30 label box on two lines
beside a 230px value column holding "1.5 hours" — the label broke in half while two thirds of the
room next to it went unused. **The `max-content` repair this file already records went onto
`.bk-row.is-blank`, the DASHES, and not onto the rows somebody reads.** Repaired in the instance,
not in the rule, for the third round of the same fault. `.bk-row.is-bare` takes
`minmax(6.2em, max-content)` now: a floor so every receipt's labels start where the form's do, and
a ceiling that is the label itself.

**`6 dates` overflowed the total column**, because `.bk-t` is `--mono` and the track is `7.5ch`
measured against the ROW's proportional font. It is exactly wide enough for `£270.00`, which is
what it was measured for, and money is the only other thing that column has ever held. The count
went into the value, where the dates are — one answer, not a value and a total.

**And `£270.00` overflowed it too, by 18px on a receipt and 28px in the basket.** `.rc-total`
declares its own three-track grid at its own block — `auto minmax(0, 1fr) max-content`, right,
because it hides three of the six children — and **`.bk-row` is one class sixty lines LATER, so the
cascade settles the tie by order and that declaration has never applied.** The total row has been
drawn on the five-column booking grid since the day it was written, with its figure in a `7ch`
track. **Fourth conviction of this rule in this stylesheet**, after `.price.faint`, `--fly-ink` and
`.bk-row.is-blank` losing to `.bk-row.is-bare` 3,000 lines down.

### And narrowing the funnel emptied the booking column

**Found because the new state repainted the column and got back zero pages.** `bookingPages_` opens
with two guards. The first says the column is exempt, and says why: *"the booking column has no
funnel state, because nobody answered `What for` to get there — they swiped."* The second, five
lines down, refuses to build anything once `kindLabel` has been answered — **and it was never given
the same exemption.**

So: narrow the funnel to `What kind · Questions`, swipe to Booking, and save anything. `load()`
repaints, `bookingPages_` returns `[]`, and the form, the receipt for the session you just booked
and the basket all go, with nothing on screen saying why. `go('booking')` alone does not do it,
which is exactly why it survived — you have to narrow, swipe over, and then save.

### What was NOT done to the basket, and why

**Asked as "the cart should be moved elsewhere? idk where? maybe another coloumn? its own coloumn?
maybe."** Measured before answering: it is page 3 of Booking, 278px, and `cart-send` is
`toast('Checkout is the next thing to build')`. **It cannot complete a purchase.** Only `DATA.shop`
rows can enter it, priced in credits, and nothing is ever posted anywhere — it lives in
`localStorage` and stops there.

**So a column of its own would be a wider front door onto a room with nothing in it** — the
`orderPrints` shape this file already records eleven times over under the Settings migration. The
instinct behind the question is right and the answer to it is a checkout, not an address. Written
down rather than done, because where a basket lives is a judgement for whoever owns the shop, and
the one thing that is not a judgement is that moving it changes nothing today.

### How long a pinned browser takes to recover, measured — and I got it wrong twice first

**Reported as "look still old", with a screenshot of the live site drawing a "Reels" heading over a
FACT** — which is the signature this file already records: `clipsNow_` filtered the facts out of
that column on 2026-09-17 and the heading went with the one-widget-per-reel change, so the browser
was running a build from at least two days earlier.

**Nothing was wrong.** The Pages deployment for that merge finished at **10:39:07**; the screenshot
is stamped **10:40**. The fix had been live for fifty-three seconds.

**But "just open it again" was a claim I had made without measuring**, so it was measured: the
worker from before the fix installed, the site opened twice to pin the entry point, then the fix
deployed, then opened again and again.

| | |
|---|---|
| the deploy lands | nothing changes on that open |
| **one more ordinary open** | the new worker installs; the store becomes `family-2` |
| **the open after that** | the new code runs |
| **`?dev`, once** | every store emptied and every worker unregistered **on that page**, new code immediately |

**So it is TWO ordinary opens, not one.** A worker never controls the page that registered it, and
the page that installs the new worker was itself served by the old one — so the earliest the new
code can run is the load after the swap. `?dev` skips both steps because it unregisters at the top
of `index.html`, before a single versioned URL is asked for.

#### Two wrong answers on the way, both from the harness rather than the app

**"The browser asks for `sw.js` once, ever."** It printed exactly that: one request on the first
load and none on any of five opens after it, with the registration never reaching `installing`.
**The harness was closing the page 1,800 ms after `goto`, and `load` had not fired** — it waits for
every deferred script and the 3.4 MB library. At 6,000 ms the server sees a request for `sw.js` on
**every** navigation, which is what Chromium actually does.

**And a fix was written on that wrong reading.** `register(...).then(reg => reg.update())`, to force
the check the browser supposedly was not making — twenty lines of prose about how a broken worker
could not be replaced by pushing a new one. **Measured with `load` allowed to fire, it changes
nothing**: with it and without it, the new code runs on the same open. Reverted, and it is the
third time this file records that sentence — `.mat-out`, `cache: 'no-cache'`, and now this. **A
rule changed on a measurement nobody took.** The only difference here is that the measurement was
taken, was wrong, and the second measurement caught the first.

**The instrument lied in the flattering direction both times**, which is the one thing every entry
under `check/load.js` already says about this kind of harness: a page closed early looks like a
browser that never asks, and a browser that never asks looks like a bug worth fixing.
