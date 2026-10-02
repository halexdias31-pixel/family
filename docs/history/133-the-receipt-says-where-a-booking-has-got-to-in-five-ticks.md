## The receipt says where a booking has got to in five ticks

**Asked for as "I think it needs a line for requested and it gets ticked automatically by system.
Then line for accepted, then line for paid, then line for started. Then line for completed. All tick
boxes."**

**What was there was `Stage`** — one row carrying one of `jobSaid_`'s four sentences, *"Asked for —
waiting on us"*, *"Accepted — waiting for payment"* — **and `Asked for`, a date.** A sentence says
where you are; it cannot say the shape of the whole thing, so "how far along is this" took reading a
line and knowing the vocabulary. Five ticks say it at a glance, and **the first un-ticked one IS
what happens next**, which is the half the sentence was carrying.

| | is it ticked | from |
|---|---|---|
| **Requested** | always — the row exists | `createdAt`, drawn beside it |
| **Accepted** | `jobAccepted_(j)` | every seat Agreed, Paying or Booked |
| **Paid** | `jobStage_(j) === 'receipt'` | a seat at `Booked` |
| **Started** | the first planned date has passed | `startDate` |
| **Completed** | the last planned date has passed | `endDate` |

**NOBODY TICKS THESE BY HAND, AND THAT IS WHY THERE ARE NO CHECKBOXES IN THEM.** Every one is
already derivable from the roster the backend folds out of the events and from the session dates. A
tick somebody could press would be a SECOND source for a fact the roster already answers, which is
the drift this file records under `documents_()`, `factsNow_` and `childrenOf`. So they are a MARK
rather than a CONTROL: `.check` is this app's only checkbox and it is a `<label>` round an `<input>`
at a 44px floor, and five of those is 220px of pressable nothing on a card whose headroom has been
measured in single pixels. `.bk-tick` borrows that control's argument — a visible edge, a ghost ✓ in
an empty box, gold when it is done — at receipt-row size.

**EACH ONE ASKS ITS OWN QUESTION AND THEN THE ONE ABOVE IT.** A chain, because the calendar alone is
not evidence that a lesson happened: a session accepted and never paid for, whose start date has
passed, would tick `Started` off the clock — the app claiming teaching took place that nobody paid
for. **And cancellation falls out of it for free**: `jobAccepted_` answers false on an empty roster
and `participantsOf` empties the roster when everybody has gone, so a cancelled booking ticks
`Requested` and stops, with nothing here that knows the word. Measured in five states through the
real app: paid with future dates → 3 of 5; the same dates in the past → 5 of 5; nobody agreed → 1;
nobody left → 1; the blank form → 0 of 5, drawn as five empty boxes.

**THEY ARE ON THE FORM TOO, AND NOT MARKED `only:`.** `SPINE`'s own argument is that the form and
the receipt are one document across TIME, so a row that appears only once the thing is saved is a
row that changes shape at the moment somebody is checking it — which is exactly what `check-flow.js`
refused when that argument was made about `Asked for`. An unsent booking shows the five stages
ahead of it and pressing Send ticks the first.

**`stageRows_` IS ONE BUILDER AND BOTH DOCUMENTS CALL IT**, which is the whole of what stops them
drifting — the same argument `weekRows_` makes for the three week grids. `j` is null on the form.

### `jobSaid_` claimed three readers and had one

Its own note said *"the receipt row, the booking form and the stamp on the card"*. **Measured before
deleting it: one.** The stamp went when the four receipt skins became one document — written up in
`style.css`, which kept the argument and deleted the code — and the form pushes a literal dash. So
the sentence had one home and it was the row this replaces. **Third sentence in this file to outlive
the thing it described**, after `.favwrap.is-fav` and the dead `kind === 'paper'` guard.

### `created_at` has been written by three handlers and sent by nothing

`createJob`, `joinWaitlist` and `openWaitlist` all write it; `doGet` sent it nowhere. So
`if (j.createdAt) push('Asked for', …)` in `jobRows` **could not fire**, and a row this repository
argued about at length — `check-flow.js` refused to let it be dropped — has never once been drawn on
a receipt. **This repository's oldest shape for the eighth time**, after `figure`, `orderPrints`, the
four message actions, `exam_date`, `wow`, the eleven dead Settings writers and the two high-score
columns. It has a reader now: `Requested`'s own value.

**`check-payload.js` cannot see this class of fault and says so** — it compares top-level `DATA.*`
keys, so a field inside a row that nothing reads is invisible to it.

### And the `Dates` row has printed a dash on every receipt ever handed over

**`doGet` ships the run as `dates: dates.join(', ')` and `jobRows` read `j.sessionDates`** — a name
the payload has never carried. So the one row on the document whose whole job is to record WHEN the
sessions are was empty on every real booking, and the fix is one `||`.

**NOTHING COULD SEE IT, AND THE REASON IS THE ONE THIS FILE KEEPS FINDING.** `check/states.js` seeds
a job carrying `sessionDates` — **the name the CODE reads rather than the name the SERVER sends** —
so the lab has been measuring a shape that does not exist and reporting the row working. That is the
fixture stating `focus` as a string `doGet` does not send, one data path along. The state seeds
`dates` now, with a paid seat and a future start so the five ticks come out **three on and two off**:
a state where all five agreed would measure one box five times.

### The rule moved with the rows, and it is a stronger rule than the one it replaces

`check-flow.js` asserted that `Stage`, `Status` and `Asked for` are all on the blank form and all
dashes. The invariant is untouched and the rows have changed, so it asserts the five stages are on
both the blank and the priced form, drawn as tick boxes, **none of them ticked** — and that
something IS ticked once `book-send` has gone. **The list is read off the app's own `JOB_STAGES`**
rather than written out here, and **the tick is read off the whole cell rather than its text**,
because a ticked and an unticked box hold the same glyph and differ by one class: a rule reading the
text would pass on both, which is the shape of every inert check this repository has deleted.

**It replaces a count of the word "Stage".** That version asked only that the string appeared twice
— so it would have passed on two blank forms. It was there to say "the second document is the
booking widget" and could not say the widget had anything in it.

**Proved by mutation in three directions**: every stage always ticked names five rows on the blank
form and five on the priced one; nothing ever ticked names the receipt under the form; and the tick
class renamed names all ten. The real files pass all 30 journeys.

### A screenshot caught the one thing measurement could not

**`Requested` carries a date and the other four do not**, so written box-then-date its box sat where
its date started while the other four sat at the card's right edge — **five boxes in two columns**,
on a row of ticks whose whole job is to be read down. `.bk-v` is right-aligned, so the box goes
LAST. Every row measured correctly, nothing overflowed, and no check here asks whether five things
line up inside their own column. **Fifteenth time this file writes that a screenshot is the last
word on something drawn.**

### And `check/ui.js` found the four pixels the waiting-list card did not have

**FIVE ROWS WHERE THERE WERE THREE.** `Stage`, `Status` and `Asked for` became five ticks and
`Status`, and the waiting-list branch is the card that `check/ui.js`'s own note records arriving
with **three pixels of headroom at 768** — *"there is no headroom on this branch at all, which is
why the block grid's cells are 20px rather than 44"*. It said so on the first run after the ticks
went in: *".pane holding pane hides 4px below its own fold"*, at 768 and 1280, signed in.

**THE LEADING IS WHERE IT CAME FROM, and the blanks had already solved it.** `.bk-v` is
`line-height: 1.35`, which is a line for READING — and `.bk-row.is-blank` already drops to 1.1 with
the argument written beside it: *"a dash is not read, it is counted past on the way to the row
below"*. A tick is the same: five of them are SCANNED down, which is the whole point of drawing
them as a column. At 1.1 a stage row is **15.7px against an ordinary row's 19.6**, the five come to
78px instead of 94, and the card is back inside its pane with eleven pixels to spare.

**Asked of `:has(.bk-tick)` rather than a class on the row**, because the row carrying a tick is
exactly the row a tick was put in — a flag would be a second thing for `receiptRow` to remember and
a second thing to go stale.

**AND THE BOX IS SIZED TO WHATEVER LINE THAT LEAVES.** `font-size: inherit` with a `1.05em` box is
12.6px against a 12.6px line at 768. The first version used `.check .box`'s own pair scaled down —
`.82rem` with a `1.05em` box — which is **13.3px inside a 12.1px line**, so the mark was setting the
row's height instead of fitting it. `vertical-align: middle` is the half that is easy to miss: an
inline box sits ON the baseline, so its whole height hangs above it and the descender space is
added underneath, which is where the extra pixels were.

### Four more rows were reading names the payload has never sent

**"Check the receipt booker that it all is well" was the other half of the ask, and it was not.**
The method is `check-payload.js`'s question asked one level down, where that check cannot go — it
compares top-level `DATA.*` keys, so a field inside a row that nothing sends is invisible to it.
Every `j.<field>` `jobRows` reads, against every key `doGet` puts on a job: **sixteen against
forty-seven, and six came back.**

| the row | read | sent | what a real receipt said |
|---|---|---|---|
| **Students** | `students`, `maxStudents` | `maxKids` | **the row was absent** — `push` skips a row with no value |
| **Venue** | `venue` | `location` | **absent** |
| **Host** | `clientHosts` | *nothing* | **"We book the room"**, to every family hosting at home |
| **Sharing** | `splitEmails` | *nothing* | **"Just you"**, on a session split three ways |
| Dates | `sessionDates` | `dates` | a dash — recorded above |
| — | `maxStudents` | — | the second half of the `Students` read |

**TWO ARE REPAIRED ON THE PHONE AND TWO AT THE SERVER, and which end is not a coin toss.**
`Students` and `Venue` were drawing NOTHING, and the right name is already in the app: `seatsOf_`
is its one reader of "how many seats" — used by the roster and by the stamp, so a third spelling
here would be the `documents_()` fault — and `jobReceipt`'s own header already tries `venue` then
`location`, with the note *"both names are tried, because two lists genuinely use two"*. It was
found once, for the line under the title, and not for the row two inches below it.

**`Host` and `Sharing` were drawing a CONFIDENT WRONG ANSWER rather than nothing**, which is the
worse half: a line about who is responsible for a venue, and a line naming who is splitting the
cost. Neither fact is anywhere on the phone, so guessing a name here would have been inventing one.
`doGet` sends them.

**`splitEmails` IS NARROWER THAN `iAmIn`, DELIBERATELY.** Those are addresses the BOOKER typed in —
the people they invited — and `iAmIn` is the whole roster, so sending it that way would hand one
family the e-mail addresses another family chose. It goes to `cs[0]`, which is the same seat
`client` is taken from, and to an admin because somebody has to.

**And the state seeded `students` and `venue` too**, so the lab has been drawing two rows nobody
holding a real booking has ever seen — the third instance in one commit of a fixture stating a
shape `doGet` does not send.
