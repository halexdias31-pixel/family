## Checking your work

**The checks now run themselves.** `.claude/settings.json` registers a `SessionStart` hook —
`.claude/session-start.sh` — which installs the check dependencies if `node_modules` is missing,
then runs the whole suite and prints one of two lines: `all N checks pass` with N read off the run,
or the failures under
**`CHECKS ARE RED ON ARRIVAL — this is not something this session did`**.

**That second sentence is the point.** Every check here was good and none of them ran unless
somebody remembered; the failure mode left was starting work on a repo that was already broken and
spending the session unable to tell which half was yours. A minute and a half buys an unambiguous
baseline — a red after that is the thing you just did.

**That figure is written here and nowhere else, deliberately.** It said seventeen seconds in this
file AND in the hook's own comment for as long as it was seventeen, and went on saying it after the
suite had roughly doubled twice — the same fault as "all 18 checks pass". The hook's comment names
no number at all now; the run prints its own timings per check, which is the only version that
cannot go stale, and this sentence is a rough shape rather than a measurement.

**It exits 0 whatever happens**, deliberately: a hook that refuses to start a session is a hook
somebody deletes. It reports and gets out of the way. It also prints the branch, the head commit,
and how many files were already uncommitted before you arrived.

**Tested in both directions**, because a check that cannot fail is not a check: an undeclared name
added to `js/core.js` produced `2 of 18 checks found something wrong` and 25 of 27 broken journeys;
removing it went back to green.

**The count is read off the run, not typed into the sentence.** It said "all 18 checks pass" for as
long as there were eighteen, and went on saying it when there were twenty-two — a number in a
sentence nobody re-reads. The hook counts the `PASS`/`note` lines now.

### Three checks existed and none of them ran

`check-lifecycle.js`, `check-spine.js` and `check-surfaces.js` were written, committed, and left out
of the roster in `check-all.js`. All three pass, and all three had been passing in silence — this
file even cites `check-spine.js` finding two missing receipt rows "the first time it ran", which was
also the last time anything ran it.

**The roster is the only thing that makes a check real.** This is the `check-booking.js` fault in a
different costume: there, a check that could not find its subject printed "nothing to check" and
exited 0; here, four good checks sat on disk and were never invoked. Adding a file to `js/` does not
add it to `npm run check`.

### `node js/check-library.js` — the data, which nothing had ever read

Every other check reads the CODE. `data/questions.json` was 4,264 rows and 2.4 MB of committed
content when this was written — the library the whole Find screen is about — and **no check had ever
opened it**. It grows every time a paper is transcribed, so take the number off the file
(`node -e "console.log(require('./data/questions.json').length)"`) rather than off this sentence. A wrong
row does not throw and does not fail a build; it is simply a question somebody is taught wrongly.

What it refuses, each drawn from a mistake made or nearly made:

| | |
|---|---|
| **the shape** | line 1 a bare `[`, last line a bare `]`, and **each line parsed on its own** |
| **row ids** | present, and unique — a repeat silently replaces a question |
| **`ticks_*`** | never, in any spelling. See below |
| **orphans** | a question naming a `paper_id` with no `kind:'paper'` row can be found and never opened |
| **80 marks** | every Edexcel 1MA1 Higher paper, by definition of the qualification |
| **the vocabulary** | a closed list per facet column; anything else fails |

**The vocabulary is the one that prompted the file.** `exam_wave`, `tier`, `subject` and the rest are
FACETS — `facetFromSheet_` turns a column into a question the funnel asks, and every distinct value
becomes an answer somebody is offered. Transcribing the November papers I tagged them
`exam_wave: 'Resit'`, a perfectly sensible word, beside the `'Second wave'` this file had used for
exactly that meaning since before I arrived. Two answers, one meaning, and a filter that reads as
arbitrary. I caught it by looking afterwards, which is luck. Now a new value has to be added to
`VOCAB` deliberately, by somebody who has just read what is already in use — the same argument as
`ACCEPTED` in `check-payload.js` and `ACCEPTED_TAP` in `check/ui.js`.

**Two vocabulary entries are untidy and kept anyway**, with the reason written beside them, because
silently "correcting" content is worse than describing it: `exam_wave` carries both the words
(`First wave`, `Second wave` — the summer and November sittings) and ISO dates from an older import,
and `pages_checked` is a flag everywhere except one import that wrote a date into it.

**The tick rule is a disclosure rule, not a data-quality one.** `ticks_1/2/3` held the handles of
real people, most of them children, and were stripped when this file was built. This repository is
public and git history is permanent, so a tick column reappearing is not untidy, it is a leak. This
file already said so twice in prose; the check says it where it can act.

**It reports 14 questions the transcriber could not recover** — rows carrying an `examiner_note`
saying a diagram never came across, or that the text layer had flattened the maths past reading.
Every one is in `P-1MA1-2306-1H`, transcribed before the render-the-page-as-an-image method existed.
They are real questions being taught in a broken state and nothing surfaced them until now. Reported
rather than failed: it is editorial work on fourteen rows, not a build error.

**Proved in both directions, on six mutated copies** — a duplicate id, a stray facet value, a
returned tick column, a paper totalling 82, a file flattened onto one line, and an orphaned
`paper_id`. All six exit 1; the real file exits 0. **The one-line mutant is why the shape test parses
each line rather than checking its last character**: a whole file concatenated onto a single line
still ends in `}`, so the first version of that rule passed the very mutant written to catch it.
`node js/check-library.js <path>` takes a file to test against, which is the only thing that argument
is for.

```bash
npm install                      # the hook does this for you on a fresh clone
                                 # acorn, jsdom and playwright — for the checks only.
npm run check                    # everything, via js/check-all.js
node js/check.js                 # names used but never declared. Two seconds. Run always.
node js/check-flow.js            # 21 journeys through the real app in jsdom
node js/check-payload.js         # every DATA key the site reads vs every key doGet sends
node js/check-booking.js         # the booking state machine, folded in Node
node js/check-backend.js         # one Apps Script scope: every name declared exactly once
node js/check-tabs.js            # every tab routed to one of the three files, and the ids look sane
node js/check-rows.js            # each column read, against the tab that row actually came from
node js/check-post.js            # an action that names a person by a cell they can edit
node js/check-library.js         # data/questions.json: ids, 80 marks, the closed facet vocabulary
node js/check-marking.js         # a right answer marked right, a wrong one wrong
node js/check-practicals.js      # the 41 practicals, and whether their topics join to anything
node js/check-funnel.js          # the real funnel over the real library: can each question narrow?
node js/check-const.js           # nothing declared `const` is assigned to. Two seconds.
node check/deploy.js             # after a push, does a browser that has the site run the new code
node check/ui.js                 # 9 screens x 4 widths x 2 visitors. Exits 1 on anything new.
node check/ui.js --screen=tools  # one screen
node check/ui.js --shots         # also writes PNGs to check/shots/ for a human to look at
node check/live.js --sheets s.json --out /tmp/p.json   # the REAL doGet over the REAL spreadsheets
node check/ui.js --payload=/tmp/p.json                 # and the real app rendered against it
```

**`package.json` is for the checks and nothing else.** The site has no build and no dependencies —
`index.html` loads `js/*.js` and the browser concatenates them. Nothing in `node_modules` is ever
shipped. Before it existed, a fresh clone ran `node js/check.js` and got `Cannot find module 'acorn'`
with nothing anywhere saying what to install.

### `node check/cards.js` — every question in the library, laid out. A sample is not a sweep

**`check/ui.js` had never rendered a question card.** It drives the real app through its own `go()`
and measures nine screens at four widths as two visitors — 72 combinations, on every commit, for as
long as it has existed. The Find screen opens on the funnel's *question*; the results are a strip of
pages filled five either side of where you are. So the app's largest surface, four thousand rows of
it, was never on the screen it was measuring.

**It cost exactly what you would expect.** Fifty-one questions carry the printed paper's dotted
answer line — the longest 128 characters with no space in it, which to a browser is one unbreakable
word — and every one took the card, the pane and the page sideways at 320px. `ui.js` measures
sideways scroll. It reported nothing, because the page it was on never happened to hold one.

**This is the `check-flow` stub in a third costume**: a check that cannot reach its subject
reporting a pass. The summary said 72 combinations and meant it; what it did not say is that 72
combinations is nine screens seen once each.

**Two fixes, and only one of them is the real answer.**

`check/ui.js` gains **declared states** — `STATES` at the top names, per screen, the states worth
measuring, each a name and a line of the app's own code. The Find screen now has two: the question
and the results. A state that does not arrive fails loudly (`expect` says what must be on the
screen), for the same reason the signed-in seed does. 72 combinations became 80.

**But that is still a sample, and widening a sample makes the odds better without making the claim
truer.** Measured: searching a common word gives 1,063 hits and puts SIX cards in the DOM, all from
the same worksheet. What is actually needed is to measure the **content** rather than the screen — a
question's markup either fits a 320px column or it does not, and that has nothing to do with which
page of the funnel you are on.

**So `check/cards.js` lays all 4,005 of them out in one page load**, in batches of 500, and asks one
question: is anything wider than the column. No navigation, no lazy fill, no app. **Proved both
ways**: with `overflow-wrap` removed it names 47 rows and exits 1, up to 199px past the column; with
it, zero.

**It must not grow into a second `ui.js`.** That one owns the app — navigation, tap targets,
contrast, the parked screens, who is looking. This owns the library, at one width, with one
question. The line between them is whether the answer could change when somebody edits a cell.

### The dead end came back once the collection door was gone, and the cap was the wrong tool

**Six chips deep with School year skipped: 1,070 questions, `Topic` holding 45 answers, and the
screen saying "Nothing left to narrow."** Every other facet exhausted, and the one that was not
barred by `FACET_MAX_ANSWERS` — a question about the only thing left, refused for being five answers
too long. The collection line used to paper over this ("or the 48 topics these are in"); with that
gone, the dead end is bare.

**The cap is right and it is about READING, not about narrowing.** `field: name` is 212 paper names
and nobody chooses from 212 buttons. What was wrong was treating "too long to read all at once" as
"not a question" — two different problems with different answers. The first is solved by showing
fewer; the funnel was solving it by showing none.

**So `overFacet_` is the last resort**: when nothing qualifies, take the over-sized question with
the FEWEST answers — the one closest to being an ordinary question — and draw the biggest forty.
Biggest first to choose them, alphabetical to show them, because which forty is a question about
size and the order is a question about finding one. The rest get a line pointing at the search box,
which is on the same page and filters the same items.

### Three faults found by pointing the existing measurement at a screen somebody is actually on

**The Find screen's first question is "What for" and its answers are one word each.** So every
answer row `check/ui.js` had ever measured was `Learning`, `Shop`, `Games` — the row layout proved
against the shortest labels in the app and nothing else. Adding one state, six answers deep, on the
path from the complaint:

- **The filter chips are 38px.** `min-height: max(38px, 2.3rem)` — the root is `clamp(13.5px, 3.8vw,
  16px)`, so 2.3rem is 34px and the `max` never once chose the rem. **This is `.btn.tiny` exactly,
  and the fourth conviction of that rule** after `.post-act` and `.fm-adds label`. It survived
  because in the state the screen opens in there are no filters, so there are no chips: 63 known tap
  targets, four widths, two visitors, and the control that removes a filter was in none of them.
- **The answer labels were clipped, not wrapped.** Taking the counts off left `.k` the only child of
  its row, and `.row .k` is `flex: 0 0 auto` — right for a two-word label beside a value, wrong for
  the answer itself.
- **And a check I wrote for that second one was inert.** I assumed rule 1 could not see it, because
  an inline `<span>` has no `clientWidth`. Wrong: the span pushes its parent `.row`'s `scrollWidth`,
  and `.row` is an ordinary block — 23 findings, up to 84px, the moment the fault goes back. My new
  rule fired zero times on the fault it was written for. **Deleted.** A check that cannot fail is
  not a check, and one that cannot fail while carrying a confident comment about what it protects is
  a green light with nothing behind it.

**What was missing was never a rule. It was a state.** No amount of new measuring code would have
found any of this — only pointing the measurement that already existed at the screen somebody is on.

### Can the app be built so that reading the code is enough?

Partly, and this session is an honest measure of which half. **What a reader can settle, a check
already settles**: a name used and never declared, a handler with no door, a column read off the
wrong tab, a `const` assigned to, a facet that cannot narrow, a CSS rule that wins only because of
where it sits in the file. The whole roster runs on every session start — the count is printed by
the run rather than typed here, for the reason the section above gives.

**What a reader cannot settle is what happens when two correct things meet.** Three faults this
session, all from valid code that read fine:

- **the coins overlapped.** Valid SVG, no overflow, nothing to read. The viewBox scaled at 0.60 put
  a 5p at 5px across, and the browser stretched it to 20rem so a 13px label was three times the
  width of its coin.
- **every diagram rendered at a different scale.** `.qsheet figure svg` is `width: min(100%, 20rem)`,
  so the viewBox width IS the scale. Three coins came out enormous and two price tags unreadable, on
  one screen, from one stylesheet. Nothing in either file is wrong.
- **51 dotted answer lines took the page sideways.** A legal string in a legal box.

**So the lever is not static analysis — it is to replace emergent properties with declared ones, and
to make the lab see more.** The scale fault is now impossible because every drawing lays out inside
one constant, `W`; that is a rule a reader can check. The dotted line is now caught because
something renders all four thousand rows. **Both are the same move**: take a fact that was only true
by accident of interaction, and give it somewhere to be stated and somewhere to be tested.

**A screenshot is still the last word on a drawing**, and this file has now written that sentence
three times — `.mat-face`, `.mat-out`, and the coins. What changed is that it is the last word on
fewer things.

### `check/live.js` — the real backend over the real database

Everything else measures the app against `check/fixture.json`: four question rows, fifteen people,
a handful of venues, all hand-written. That is right for most of them — a fixture is stable, and a
check whose answer changes when somebody edits a cell is a check nobody can act on.

**But it means nothing had ever seen the actual data**, and three faults in one week came from
exactly that gap. No fixture would have caught any of them, because the fixture was written from the
same belief as the code: `SCHEMA.landmarks` naming seven columns the sheet has never had,
`allTopics()` hardcoding `link: ''` with a comment explaining no PDF exists while 328 rows carry
one, and a past paper drawn twice over.

**It is not a second implementation.** It loads the `.gs` files and calls the real `doGet`. Only the
eight Apps Script globals the payload build touches are replaced — `SpreadsheetApp` backed by a dump
of the real spreadsheets, `CacheService` deliberately always missing so the payload is built from
the sheet every time. If `doget.gs` is wrong about a column, this is wrong the same way.

**Never commit the dump or the payload.** `Ledger` holds PINs, e-mail addresses, phone numbers and
dates of birth, and this repository is public. `check/live.js` refuses to write a payload inside the
working tree and `.gitignore` carries both paths.

What it found on its first run, none of which the fixture can see, because the fixture has no real
photographs and nobody in it is missing a DBS:

| | |
|---|---|
| `img.post-pic` | overflows by 27–31px on the feed at 320, 390 and 768 |
| `article.post` | overflows by 14–15px |
| `img.pass-pic` | overflows by 2px on the account screen |
| "NO DBS ON FILE" | 4.43:1 against black — needs 4.5 |

and 33 tap targets beyond the 69 already in `ACCEPTED_TAP`.

**The one thing it cannot do is tell you what is deployed.** A push is not a deploy, and every
Google host is blocked from the agent's environment by network policy — `script.google.com`,
`docs.google.com`, all of them. Only GitHub is reachable. So which version `/exec` serves has to
come from somebody opening the URL.

`check/ui.js` serves the real files, stands the backend up from `check/fixture.json`, drives the app
through its own `go()`, and measures: sideways scroll that nobody asked for, tap targets under 44 px,
text under WCAG AA contrast, JS errors, and custom properties nothing anywhere sets.

### It reported nothing because it had never signed in

**For a long time this section said `check/ui.js` reports nothing across 9 screens x 4 widths. It
did. It was measuring the app a STRANGER sees**, because nothing in it ever set a user, and this
app shows a stranger very little. The booking screen signed out is one card reading "Sign in to
book"; the form behind it is the most control-dense surface in the whole app, and "booking: nothing
to report" had always meant that card.

It now runs **72 combinations — 9 screens x 4 widths x 2 visitors**, signed out and signed in as an
admin, seeded into `localStorage` before the page loads so `data.js` signs the visitor in itself.
If the seed is ignored the run says so loudly and fails, because "I did not check" printed as
"I checked and it was fine" is this project's recurring failure.

What the other half was hiding, on the first run that could see it:

- **`.fm-out` — the flyer sheet — reported as clipping up to 593px. It was not, and neither was
  `.mat-out` before it.** See "A transform is invisible to `scrollWidth`" below: this was my
  mistake, made because the entry for `.mat-out` already said the same thing and I did not measure.
  Both are back to `overflow: hidden` and the check has been taught the difference.
- **`.fm-adds label { min-height: 2rem }` — 27px on a phone.** The comment above it correctly says
  the tap target belongs on the label rather than the 17px tickbox, and then writes it in `rem`.
  That is the `.btn.tiny` mistake and the `.post-act` mistake, both recorded below, for a **third**
  time. Tap targets in px is a rule with three convictions behind it now.
- **`.rc-tiles .tile { 40px }`** on "Ask for it" and "Share this booking" — in px, and under 44 on
  purpose, to sit politely on a receipt that no longer exists.
- **`.bk-row` overflowed by 13px at 320**, taking `.bk`, `.rc` and `.pane` sideways with it. The
  cause is the root font's own floor: `clamp(13.5px, 3.8vw, 16px)` stops shrinking at about 355px
  while the viewport does not, and every column on that card is `em` or `ch` off the root. The row
  now takes `min(.74rem, 2.85vw)` — the two curves meet exactly where the clamp stops, so it is
  unchanged at every width that already worked and needs no breakpoint to keep in step.

**63 findings remain and they are in `ACCEPTED_TAP`, with one written reason each, printed in full
and not failing the build.** Both are real and neither is a number: the hour grid cannot be made of
44px parts (eleven of them need 484px, wider than any phone), and giving the booking row's inline
dropdowns 44px detaches the dashed underline from its label by 24px, because that underline is the
grid cell's bottom border. Tried twice, photographed both times, reverted both times. Fixing it
means moving the underline onto the control — a redesign of the app's main form, and a decision
rather than a repair. The list exists so that a NEW tap target fails loudly instead of joining a red
nobody reads; same argument as `ACCEPTED` in `check-payload.js`.

The earlier baseline is still worth reading, because three of its four findings were the check being
wrong rather than the app:

- **25 sideways scrolls, two causes.** 22 were `.mat-face` set to `white-space: nowrap` inside a
  `minmax(7.5rem, 1fr)` column: a face like `◡ protractor` cannot shrink to its column, so the label
  overflowed by up to 59px and pushed `.mat-list`, then `.card`, then `.pane`. **This entry used to
  say nowrap was deliberate and quoted the comment above the rule. It misread it** — that comment
  defends the *monospace font* as what stops the columns jittering, and mono is untouched. The other
  3 were `div.mat-out`, and **that entry was wrong** — see "A transform is invisible to
  `scrollWidth`" below. Nothing was clipped; it is `overflow: hidden` again.
- **19 tap targets, 16 real.** `.btn.tiny` said `min-height: max(38px, 2.3rem)` and 2.3rem is 34px
  on a phone, so the max never chose the rem and the timer buttons were 45x38 on every device.
  `.post-act` said `min-width: 2.2rem`, which is 32.6px, so Share was 30x44 — tall enough to look
  deliberate, too narrow to hit. Both now in px. The other 3 were a 14px checkbox inside a 44px
  label, which is not a small target: a click anywhere in a label toggles the control it contains.
  `check/ui.js` now exempts a control whose wrapping label is itself 44px, and still measures the
  label on its own pass, so shrinking the row still reports it.

**The measurement was green before the layout was right, and a screenshot is what caught it.**
Wrapping `.mat-face` fixed all 25 scrolls and cost 15px of list height, with ten faces on two lines —
and `|·| ruler` rendering as `|·|` / `rul` / `er`, which no check flagged, because a mid-word break
is not an overflow. The real culprit was `.mat-note`: `display: block` inside a flex row is
blockified, so a note asking for its own line silently sat on the same one and took a third of the
column from the face beside it. With `flex: 1 0 100%` it takes the line it wanted, no face wraps at
all, and the list measures 860/464/467/467px at 320/390/768/1280 — **the same numbers nowrap gave,
to the pixel.** CLAUDE.md already says layout facts come from the browser. The other half is that
"nothing measured wrong" and "it looks right" are different claims, and only one of them a
screenshot can settle.

### `check-flow.js` could not read a reply, so no write's success path had ever run

**Every POST in every journey rejected, and nothing said so.** `api()` in `shell.js` reads
`r.text()` and parses it second — deliberately, because an Apps Script error page is HTML and
reading it as text first is what turns `Unexpected token '<'` into the sentence the server actually
said. The fetch stub in `boot()` answered a POST with `json()` **only**. So `r.text` was
`undefined`, the promise rejected with a TypeError, and the `.then` of every write in the app was
unreachable from the harness.

**It lasted because the journeys assert on the wrong half.** `sent` is filled in by the stub
*before* it answers, so it is populated whether or not the reply can be read. "A class books
through `joinWaitlist`, a session through `createJob`" passed for as long as it has existed while
proving only that the request left the phone. What the app does with the answer — the toast, the
reset, the reload, every `.then` in `receipt.js` — had never executed once.

**Found by asking what is on the screen after a booking is sent**, and getting the same screen as
before. The stub answers both shapes now. All 28 journeys pass with the success paths actually
running, so nothing was depending on the rejection.

**This is the `check-booking.js` fault again in a different costume**: a check that cannot reach its
subject reporting a pass. There it was a path to `backend/` and an exit 0; here it is a missing
method on a stub. Both say "I checked and it was fine" when the honest answer is "I did not check".

### The booking widget comes back under the form once it is sent

**Pressing send emptied the screen.** `resetBooking_()` clears every answer and `load()` fetches the
new job, so the page somebody was looking at a second earlier went blank and a toast was the only
evidence anything had happened. The session was real and two swipes away under
`Booking · Receipts`, which is not where a person looks immediately after pressing a button.

`ASKED_JOB` in `book.js` holds the id the backend answered with — all three send paths return one,
`createJob`, `joinWaitlist` and `openWaitlist` alike — and `askedBlock_()` draws that job's receipt
below the booker. `jobReceipt` is the same builder the session sheet uses, so the two cannot drift.

**One job, not a list, and that is the whole care.** `bookBlocks` used to draw every live job under
the form, and the note above it says why that went: the funnel already has a searchable list of
them, and a page holding both is the duplication this file has produced twice. A confirmation of the
thing you just did is not that list.

**Below, not beside.** Each element of `bookBlocks()` is a page somebody swipes to, so a receipt
returned as its own element would be "somewhere else" again — the same fault wearing a different
shape. The journey checks the page COUNT as well as the markup.

**It is looked up every draw rather than kept as HTML**, so `Stage` says where the booking has got
to now: an admin accepting it while the family still has the page open moves that row from
"Asked for — waiting on us" to "Accepted — waiting for payment" on the next `load()`. It is in
memory, so a reload drops it — right for a confirmation, and nothing to keep in step.

### Every check hand-rolls its own path to `backend/`, and most of them had it wrong

`check-booking.js`, `check-columns.js` and `check-access.js` each located the `.gs` files
differently, and all three looked beside `js/` rather than in `backend/`. `check-access.js` also
asked for `doPost.gs` when the file is `dopost.gs` — the same name to a person, a different one to a
filesystem. The failures did not look alike:

- `check-booking.js` printed "nothing to check" and **exited 0**, so it read as a pass for months.
- `check-columns.js` exited 1, so it was at least visible.
- `check-access.js` reported "0 handlers, 0 classified, 34 asked for by the site" and listed every
  action the app performs as missing — alarming enough to be dismissed, which is its own kind of
  invisible.

All three now search `backend/` first and try lower-case spellings. If you move those files again,
three separate lists need updating. **A check that cannot find its subject must exit non-zero** —
"I did not check" is not the same answer as "I checked and it was fine", and exit 0 says the second
one to everything that reads it.

### Three things that will mislead you

**A check that guesses gives different answers on the same code.** `check/ui.js` originally picked
the screen to measure by "whichever pane has the most area on screen". Run `--screen=tools` alone
and it reported 25 sideways scrolls; run the same screen inside the full nine and it reported none,
because with nine screens drawn something else won the area contest. It now asks for `#s-<id>`
directly, which is where `paint(id)` writes, and says so loudly if it ever has to fall back.

**A transform is invisible to `scrollWidth`, and it cost two wrong fixes.** `check/ui.js` asked
`scrollWidth > clientWidth`, which is the browser's own answer and normally the honest one. But
`scrollWidth` is a LAYOUT width and a `transform: scale()` is painted after layout — so `.mat-out`
and `.fm-out`, the cheat sheet and the flyer, both 794px A4 pages scaled to 0.3533 by `matFit` and
`flyFit`, reported 514px of overflow inside a 280px box. Measured with rectangles, which *do*
account for transforms: the sheet's rendered right edge is 335 and the box's right edge is 335.
Nothing was ever clipped, at any width.

The `.mat-out` entry above was written on that reading, and I then changed `.fm-out` to match it —
**two rules changed, one of them twice, on a measurement nobody had taken.** `overflow-x: auto` is
not harmless either: it puts a real scrollbar under a sheet that is entirely on screen. Both are
`overflow: hidden` again, and the check now asks a second question in pixels a viewer can see —
does the widest child's rendered right edge pass the box's? An element with no element children is
exempt from that second question, because text cannot be transformed away from its own box and
`scrollWidth` is already right about it; the first version of the fix forgot that and would have
dropped every text overflow in the app. Verified both ways: a real 13px `.bk-row` overflow and a
forced `white-space: nowrap` text overflow are both still reported.

**Reading the source is not the same as measuring the page.** A scan of `style.css` reported seven
dead custom properties; all seven were wrong, because they are set from template strings like
`style="--fly-ink:${esc(ink)}"`. Asking the rendered page instead produced the *same seven*, because
`--fly-ink` only exists once a flyer is open. Two opposite methods, one identical false alarm. Layout
facts come from the browser; "does a writer exist at all" comes from the source. `check/ui.js` says
which of the two each check uses and why.

**Both spreadsheet IDs pointed at an `.xlsx` and `SpreadsheetApp` cannot open one.** Every section
loaded empty, which is also exactly what a blank database looks like — and the comment above
`SPREADSHEET_ID` said "if every section ever loads empty, this line is the first thing to check". It
was right and the line was wrong. There were two files of each name, same title, same owner, and
the code named the unopenable one: `1WeY0AD7dEz…` for businessDB, `1jDEeRoUTtL…` for SubjectsDB.

**The URL is how you tell them apart**, because the title does not: a Google Sheet lives at
`docs.google.com/spreadsheets/d/<id>/edit`, an uploaded `.xlsx` at `drive.google.com/file/d/<id>`.
If the address says `file/d`, Apps Script cannot read a cell of it. `check-tabs.js` now fails on an
id in that spelling, which is the only half of this a checker can see without opening Drive.

This is why the past papers looked missing. They are not — `questions` has the real Edexcel papers
in it, stems, parts and mark schemes, and has had for a while. Nothing was reading the file they are
in. **Do not seed that tab.** It is content, it is maintained in the sheet, and the sheet is the
only place it lives.

### Four spreadsheets became three, and the split is now a question with one answer

It was businessDB, SubjectsDB, Widget_Settings and Engine — and a fifth, "full pdf datbase", which
nobody counted because it had been written off (see `resources` below; it was not junk) — **split by
subject matter**, which is a split nothing could check. Nobody could say where a tab belonged without knowing the history, and
the cost of that showed up as duplicates with different column sets: `kinds` and `widgets` each
existed in two files, and **the live copy of each was the empty one**.

It is now three files, **split by who writes the rows**:

| File | Who writes it | Tabs |
|---|---|---|
| **Ledger** | the app, via `doPost` | people, jobs, receipts, posts, orders — the business as it happened |
| **Settings** | you; the app reads it | brand, config, pricing, venues, facets — editorial, never a deploy |
| **Library** | you, in bulk | boxers, fights, cheatsheet. `questions` has left — see below |

---

Continued in [part 2 of 4](031-checking-your-work-2.md).
