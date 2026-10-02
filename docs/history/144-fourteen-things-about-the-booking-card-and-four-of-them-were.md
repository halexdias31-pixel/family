## Fourteen things about the booking card, and four of them were one `[]`

**Reported in one message with four screenshots**, and the list is worth keeping whole because the
answers are not fourteen separate changes: four come from one line, three are deletions, and one is
a gesture the control could never have made.

### The four that were one `[]`

**`options: () => isWaiting_() ? [] : […]` ON FOUR STEPS.** Reported as *"it just defualts to sasha
motola and wont let change"*, *"it doesnt let choosing a subject even though im trying to start a
NEW waitlist"*, *"it also doesnt let me select number of extra seats for waitlist session"*, and
*"it also doesnt let me select which terms."*

**AN EMPTY OPTION LIST IS HOW `stepLocked_` GREYS A ROW**, which is right and is not what those four
wanted. So the questions were not merely unasked: they were drawn, greyed, holding **whatever the
instant branch had left in them** — which is the whole of the Sasha Matola report. The argument
written over each was about JOINING a list somebody else had opened, where the subject, the level
and the seat are settled by whoever opened it. The row above them asks exactly that (`joining`), and
`book-set` writes the class's answers in when you choose one. **The one case the old rule had
nothing to say about is somebody opening a NEW list**, and that is the case being reported.

**THREE OF THE FOUR ARE ASKED ON BOTH BRANCHES NOW.** The fourth — the tutor — genuinely cannot be
answered on a list, because who teaches one is settled when it fills. It keeps its lock and gains
the `fallback` hook the `client` step already uses: *"the row shows what the booking would be
submitted as."*

**AND THE FALLBACK ALONE WOULD NOT HAVE DONE IT.** `stepSelect_` reads `BOOKING[st.id] || fb`, so
the stale name wins the `||` and `'No preference'` is never reached — two rules, with the older one
silently in front. `bookToggle_`'s sibling in the `change` handler clears `BOOKING.tutor` when the
kind changes, so the fallback is reached because nothing is in front of it rather than because it
out-ranks something. **Proved by mutation in both directions.**

### Picking several answers was three opens, three scrolls and three closes

**Reported as *"for me to multiselect i have to click on field then click on subject then click on
field then click on another subject. thats long."*** A `<select>` closes when you choose — that is
what choosing MEANS to it — so the toggling worked perfectly and the GESTURE was the cost.

**`<select multiple>` IS STILL REFUSED**, for the reason written over `stepSelect_`: on a phone it
renders as a list box with its own scrollbar, which is the deleted panel in a worse shape. So it is
a **sheet**, which is this app's own answer to anything longer than a row — `#sheet-body` scrolls
where `.pane` does not, the practical guide and the quiz both take that route, and
`check-surfaces.js` fails the build on the alternative (a new tab). Measured: every option is a
**358×44** button, several tick without the surface closing, and the row behind fills in as they do.

**`bookToggle_` IS LIFTED OUT OF THE `change` HANDLER** so the dropdown and the sheet are one
toggle — the half that would have drifted is the re-sort into the offered order, which is what stops
`Autumn 2, Autumn 1` reading back as a sentence about the wrong school year.

**AND THE FIRST VERSION OF THE CHECK COULD NOT FAIL ON THE FAULT IT WAS WRITTEN FOR.** It called the
two handlers and asserted the sheet stayed open — so putting the row back to a `<select>` left every
assertion green, because the journey opened the sheet itself. It asserts the ROW carries
`data-do="book-many"` now. Measured by mutation, which is the only way that was ever going to be
known.

### Three deletions, and the notes were right and still had to go

| | |
|---|---|
| the `.bk-say` asides | *"theres text there AGAIN! fucking stop with that."* Four steps carried a `note` and every one was a correct sentence under the first fields of the app's most crowded card, explaining a control whose own row already reads back what was chosen |
| `aside` | *"remove the 36 sessions at the bottom next to the price."* The count is the MULTIPLIER on the row that does the arithmetic, where it is doing a job somebody can follow |
| `rc-terms` | *"remove the nothing is booked yet text."* The gold tile says `Ask for it`, the six stage ticks are all empty, and the first of them is `Requested` — the document already says it in its own shape |

**THE `note` PROPERTIES WENT WITH THE RENDERING**, not just the rendering: four live functions drawn
nowhere is the shape this file records under `resource_type` in `VOCAB` and the dead
`kind === 'paper'` guard. **`why` STAYS AND IS NOT THE SAME THING** — a refusal says the answer on
the row is wrong for the booking, nothing else on the card says so, and it is silent on every answer
that is fine, which is why none of the four screenshots had one on it.

### The total was the one figure not under the column that names it

**ASKED FOR AS *"cost is in the Q column and the total cost is in the + column, styled like
everything else for maximum uniformity."*** It was OUTSIDE `.bk` with three columns of its own, so
`COST` was the only label not under `Q` and the figure the whole card adds up to was the only one
not under `+`. Inside `.bk` it subgrids like every other row and the five tracks place it with
nothing to keep in step. Measured at 390: label `[374, 445]` under `Q` at `[374, 445]`, figure
`[637, 687]` under `+` at `[637, 687]`.

**AND THE FIGURE STOPPED BEING BIGGER**, which answers the complaint and a measurement at once:
`1.05rem` at weight 700 in a `7.5ch` track is the overflow this stylesheet already records at 18px
on a receipt and 28 in the basket.

**`.bk-row.rc-total`'s THREE COLUMNS ARE GONE FOR THE THIRD TIME.** They were declared at its own
block and lost to `.bk-row` sixty lines later; restated where they won; and now deleted, because a
row inside `.bk` has no template of its own to win or lose with — which is the one arrangement where
that fault cannot come back.

### Every date, which is the second time round and the owner's call

**ASKED FOR AS *"also look at dates, it should outline every date there."*** This row was a span and
a count, and the note that made it one is still true: every date comma-separated wraps to six lines
on the card and is truncated mid-date on the shared picture. **What it got wrong is whose question
it was.** "Nobody reads a weekly booking date by date" is an assumption about the reader, and the
reader has said otherwise — a family checking against a diary wants the days, and a span cannot say
which Mondays are missed for half term. Both documents changed together, because *a job's receipt
and the form it came from must not disagree about how a run of dates is written*.

### `Shared by` on both branches, and `only:` had to become a set

**ASKED FOR AS *"shared by 4 families is a new line i think!? there should be no exclusive field
lines to one then the other. add that line to instant session too."*** It was pushed by the waiting
branch and by nothing else, so a family splitting an instant session three ways had the price
divided by three and nothing anywhere saying by what. `L.splitShares` is the pricing's own
denominator rather than a second reading of `BOOKING.split`.

**DROPPING THE FLAG ALTOGETHER PUT IT ON THE RECEIPT TOO**, where `Sharing` two rows up already
answers the question in the words that document needs — the addresses somebody was invited by name,
or `Open — 3 seats free` on a list. Two rows for one fact, the second a permanent dash, and **13px
past the pane at 768 and 1280**, which `check/ui.js` named on its first run. So `only:` is a
comma-separated set read by one `onlyHas_`, and the row is `only: 'book, wait'`. A `not:` beside
`only:` would have been a second way of saying one thing.

**`Per session` IS STILL WAITING-ONLY AND THAT IS NOT THE SAME EXCLUSIVITY.** On a list nothing else
says how long a session is — there is no day yet, so the week is blocks. On an instant booking the
When rows already print `Monday 13:00–15:00`, on the row that decides it.

### `Extra seats`, where the stored number and the drawn number are different units

**ASKED FOR AS *"change this to be extra seats, then options are 0,1,2,3."*** The question already
said "How many extra seats?" and then offered `Just mine`, `One more seat`, `2 more seats` — three
ways of counting one thing, none of them the bare number asked for.

**`BOOKING.n` STAYS THE TOTAL**, which is the half nobody sees and the half that matters:
`seatLimits`, `spaceFor`, `priceFrom` and the backend all read it as *how many chairs*, so storing
the extras would be one fact in two units. `label_` is the whole change. **`String(…)`, not the
number** — `stepRows_` does `String(text || '—')` and `0` is falsy, so a `label_` returning zero
would print a dash over an answer somebody gave.

**AND THE RECEIPT HAD TO FOLLOW.** `jobRows` pushes `Students` with the TOTAL, aliased onto the same
spine row — so without the subtraction the two documents would print different numbers under one
label, which is the whole fault the spine was built to stop. `SPINE_ALIAS` moved with the step's
`short`; left pointing at `Seats` it would have named a row that no longer exists.

### `Applied for`, and a sixth stage had to be paid for out of the ones already there

**ASKED FOR AS *"its not really applicable for sessions booked with specific tutors, but it is for
no preference tutors. however it will just be autimatically ticked with requested."*** So it is
`is: j => true` and the chain does the rest: a booking naming a tutor is an application to that
tutor and there is no second moment to wait for; a no-preference booking is put out to whoever is
free, which also happens at the asking. `evAt_(j, 'Apply', 1)` is read first and **nothing writes
one** — said here rather than left to be discovered, because the fallback is the behaviour and the
first branch is the hook.

**`check/ui.js` NAMED IT THE SAME AFTERNOON**: `.pane holding rc hides 13px below its own fold`, on
the session receipt and the basket. **The row that made the card too tall is the row that paid for
it**: `.bk-row:has(.bk-tick)` loses its `.1rem 0`, because the argument already written over its
line-height is that a column of ticks is not twelve lines of prose — it is one block, scanned down,
and what separates its rows is the boxes rather than air. Six rows × 6.2px is 37px, three times what
the new row costs, so the block is shorter with the extra stage than it was with five.

**AND TWO CHECKS WERE COUNTING TO FIVE.** `check-flow.js` asserted `JOB_STAGES.length !== 5` in one
place and `STAGES.length !== 5` in another — the second one line under a list it had just derived
from `JOB_STAGES`. Both are the "all 18 checks pass" fault; what a guard like that is for is *can
this check see its subject*, which is a non-empty list of rows with predicates on them. And the
chain test **skipped `Requested` by name**, so a row behaving exactly as designed would have failed
it: it finds the first unticked row and asserts nothing after it ticks, which is the property itself.

### The split box took anything at all

**ASKED FOR AS *"for split field, have something which verifies that its an email format that has
been entered."*** Every other thing that list feeds — the price per family, the roster, the
invitation the backend sends — treats an entry as a person, so `dan@` is a family who is charged a
share and never hears about it.

**A REFUSAL, NOT A REWRITE.** `why` is the one mechanism this form has for saying an answer is
wrong, it is drawn under the row it is about, and it leaves what was typed alone — a box that
silently drops what somebody entered is the fault `nothingHere` records. **The shape is the narrow
one**: something, an `@`, something with a dot, no spaces, which is what a browser's own
`type="email"` asks. Anything stricter refuses real addresses, and a right answer marked wrong is
the worse of the two failures.

### And two things a screenshot caught that nothing else could

**`.many-opt { text-align: left }` DID NOTHING.** `.btn` is `display: flex; justify-content: center`,
so the label is an anonymous flex item centred by the CONTAINER — there is no line box for
`text-align` to move. **The `.price.faint` shape, and no check here can see it**: nothing overrides
the declaration, so `check/cascade.js` and `check-css.js` are both correctly silent.
`justify-content: flex-start`, because a list is scanned down its left edge.

**AND `Shared by · 1 family` READ AS A FAULT.** The receipt's own `Sharing` row already says
`Just you` for a session nobody is splitting, four lines away on the same document. **Eighteenth
time this file writes that a screenshot is the last word on something drawn** — counted off the
entries above rather than remembered, because this tally has been wrong in its own warning twice.
