## Two exam dates on a student's own page, and the login that still fails is a spreadsheet cell

**Asked for as "also allow student accounts to be able to write exam dates. like Small exam: _____
big exam:_____. also i still cant login with my details. i dont want case sensitive details to
login."** Two things, and only one of them is a code change.

### Login is not case-sensitive, has never been, and the ask is already how it works

**MEASURED IN THE CODE RATHER THAN ASSUMED, because the commit before this one changed something
next door and the two are easy to confuse.** `verifyLogin` resolves through `findPerson` and nothing
else, and every one of its six rungs compares through `key()` — `S(v).toLowerCase().replace(/[^a-z0-9]/g, '')` — so `HalexD`, `halexd` and `HALEX D` are one identity. The e-mail rung is `norm`, which
also folds case.

**WHAT CHANGED LAST NIGHT WAS THE DISPLAY, NOT THE MATCHING.** `register` wrote `norm(first + last)`
and `changeHandle` lower-cased what anybody typed, so the name shown back to somebody was
`halexdias` where they had written `HalexDias`. That is preserved now. **And the uniqueness test
still goes through `key()`, which it must**: `HalexDias` and `halexdias` as two rows is two accounts
`findPerson` cannot tell apart, so the second person signs in as the first — not a denial, a
disclosure, and this file already records `changePin` doing exactly that by accident.

**So there is nothing to change for that sentence, and one line to change if the literal reading is
ever wanted**: `key()` in `constants.gs`. It is not changed, because somebody who typed a capital on
Tuesday would not be able to sign in on Wednesday and the sentence they would get is *"Name or PIN
not recognised"* — the worse of the two failures this repository names.

### And the live row says exactly why the PIN is refused

**READ OFF `Ledger` → `people` THROUGH THE DRIVE CONNECTOR, not reasoned about.** On P001:
`pin_hash` populated, `pin_salt` populated, **and the plaintext `pin` holding the four digits being
typed.** `authCheckPin_`'s second line is `if (hash) return authSame_(...)` — **a row with a hash
never consults the plaintext again** — so the right answer is sitting in a cell nothing reads, one
column away from the one that decides. `authSetPin_` writes the hash and clears the plaintext *in
the same call*, so that pair cannot be produced by any path through this code: the digits were typed
back into the cell by hand after the hash existed.

**`tries: 8` WITH `locked_until` EMPTY IS THE OTHER THING THAT ROW SAYS, and it is new.** This file
recorded `tries: 4` beside a written lock as arithmetically impossible under `FREE_TRIES: 10` and
therefore proof the throttle rewrite had not been pulled into Apps Script. Eight wrong answers with
no lock is only possible *under* the new code. **So the backend HAS been deployed since**, and what
is left is the cell. Two free attempts remain before the ladder starts.

**THE REMEDY IS FOUR CELLS AND IS THE OWNER'S**, because nothing here can compute the hash — the
pepper is in Script Properties and unreachable. On that row: put the PIN in **`pin`**, empty
**`pin_hash`** and **`pin_salt`**, empty **`locked_until`**, and set **`tries`** to 0. The next
sign-in takes the plaintext path, succeeds, and re-hashes immediately, clearing the plaintext again.

**THE CODE CHANGE THAT WOULD "FIX" IT IS REFUSED AND NAMED SO NOBODY REACHES FOR IT.** Falling back
to the plaintext when the hash fails makes a stale cell a second permanent credential for every row
that has one — which is the whole reason hashing replaced it.

### The exams tab exists, has the better shape, and is deliberately not used

**`exams` IS A REAL TAB WITH `person_id`, `subject`, `label`, `exam_date`, `board`, `notes` AND
`active`, and it is read by nothing** — this repository's oldest silence. What makes it useful is a
repeating row editor: a surface to add a row, name a subject, pick a board, delete one again. That is
a feature rather than two blanks, and two blanks is what was asked for.

**So it is two columns on `people`, and the choice is written beside them with its upgrade path**:
if a student ever needs five exams with boards and notes, `exam_small_date` and `exam_big_date` are
what the migration reads and that tab is where it writes. Two NAMED facts rather than a list — the
mock and the real thing — so this is not the numbered-column shape `images`, `needs` and
`equipment_1 … equipment_10` are written against.

**`STUDENT_GROUPS` AND NEITHER OF THE OTHER TWO MAPS.** A tutor's exams are their qualifications and
a parent does not sit one, so the page appears for a student and for nobody else with nothing on the
phone deciding it — the `MESSAGING` rule, which is why a policy is never repeated there. **Third in
that map**, straight after the two things a student is asked for first, because the note over
`PROFILE_GROUPS`' own `Contact` row is the same argument: *"a field nobody can find is a field that
is not there"*, written about a group that had been the thirteenth of twenty-three swipes.

### A date picker, which is the opposite decision from the birthday and for its own reasons

**THE NOTE OVER `DOB_FIELDS` REFUSES `type="date"` AND GIVES FOUR REASONS. For an exam date three
fall away and the load-bearing one INVERTS:**

| | |
|---|---|
| a birth year is forty years of scrolling on a picker that opens on today | **an exam is weeks away**, so a picker opening on today is the shortest route rather than the longest |
| it ignores `inputmode` and `maxlength` | irrelevant — there are no boxes |
| it draws its own chrome this stylesheet cannot reach | still true, and the price of a real calendar and a value the platform has already validated |
| its value is ISO rather than the `dd/mm/yyyy` this sheet writes | what `isoDate_` is for |

**And one argument a birthday could not have: somebody picking an exam date wants to see which day
of the week it falls on**, which only a calendar can say.

**`FIELD_IS_DATE = /_date$/`, MATCHED RATHER THAN LISTED**, which is the argument written over
`FIELD_IS_BOOL` three lines above it: the sheet grows columns and a list has to be remembered. **And
`date_of_birth` does not match it**, so the two arrangements need no exception written about each
other — the suffix is what separates them, which is why it is load-bearing rather than decoration.

### The caption is the owner's own sentence, because the column name reads as nothing

**`exam_small_date` WITH ITS UNDERSCORES TAKEN OUT IS "exam small date"**, which is `fieldLabel`'s
default and is right far more often than it is wrong — `exam_board` reads perfectly as "exam board".
It is wrong here twice over: nobody says it, and inside a group already called **Exam dates** it says
both words twice, which is the argument written over `library_card` three lines up in `FIELD_LABEL`.

**NOT SHORTENED TO "small" AND "big", WHICH IS WHERE THIS STOPS COPYING THAT ONE.** There the two
parts are self-describing once the group has named the thing — "card number", "PIN". Here `small`
alone on a card is a size of nothing. So the repetition is kept and the caption is
*"Small exam: _____ big exam:_____"*, which is both the owner's own words and what a student
recognises: the mock and the real one.

### `isoDate_` never constructs a Date from a string, and the check runs in New York to prove it

**`new Date('2027-05-14')` IS UTC MIDNIGHT**, so anywhere west of Greenwich it reads back as the
13th — the `parseWhen` fault this file records reading `2026-09-15` as 26 September 2015. `sheetDate`
ends in exactly that call, so it is not used for the ISO branch: a real Date is read through its own
local fields and a string is **matched and re-spelled**.

**THE CONTAINER IS UTC, SO THE ONE MUTATION THAT MATTERS PASSED HERE BY LUCK.** Parsing the ISO
branch with `new Date(<string>)` satisfies every assertion in a UTC zone and fails two of them in
New York. `check-people.js` sets `process.env.TZ = 'America/New_York'` before the first `Date` is
constructed — so every case in that file, the birthday ones included, now runs in a zone behind UTC.
**A case that only fails somewhere else is a case that passes here by luck**, which is this
repository's own definition of a check that cannot fail. **Proved by mutation three ways**: the ISO
branch parsed with `new Date` (2 cases), the `dd/mm` branch read as `mm/dd` (2), and the refusal
widened to accept anything `sheetDate` can read (1). The real file is green in UTC, New York and
Auckland.

**AND THE CELL COMES BACK A DIFFERENT TYPE FROM THE ONE THAT WAS WRITTEN, which is the non-obvious
half.** `setCell` writes the string `2027-05-14` and Sheets COERCES it into a real Date in a cell with
default formatting — so the very next read is not the string that was sent. That is why `isoDate_`
tests `instanceof Date` first rather than last: the round trip through the spreadsheet changes the
type, every time, and a function that only handled the string would work once and then draw an empty
picker for ever.

**AN UNREADABLE CELL COMES BACK EMPTY, AND THAT IS A STATED COST.** `dobOut` can keep a value it
cannot parse — it puts it in the day box, visible and editable — and **a date input cannot hold
one**: a non-ISO value is silently rejected by the control. So a hand-typed "after half term" in one
of these two cells draws an empty picker and the next save of that page writes the empty over it.
Acceptable because these columns are new and written by one control; it would not be on a column
somebody has been typing into for a year.

**AND THE REFUSAL EXISTS EVEN THOUGH THE CONTROL CANNOT PRODUCE A BAD VALUE.** Every case
`isoRefusal_` catches is a request that did not come from the form, and `doPost` is reachable by
anybody with the URL — the sentence this file writes about `?name=`. **No "is it in the future"
test**, deliberately: a birthday in the future is always a mistake and an exam date in the past is an
exam already sat, which a student's own page may hold for months.

### `DATE_COLS` and `FIELD_IS_DATE` are one arrangement in two files, and now something compares them

**Nothing made them agree**, and both directions of disagreement are real: a column in the list whose
name does not match the regex is sent as ISO and drawn as a text box, so `2027-05-14` is what
somebody is asked to edit and `14/05/2027` is what they type — refused, on a page that looks fine.
The reverse is worse and silent: a column that matches but is not in the list draws a picker and is
sent whatever the cell holds, so a real Date opens it empty and the next save blanks it.

**`check-people.js` READS THE REGEX OUT OF `js/me.js`** rather than writing it again — a copy would
agree with itself and with nothing else, the fault that file's own header names. **Proved by
mutation**: a `DATE_COLS` entry renamed to `exam_big` is named and exits 1.

### `studentFields` was `[]` in the fixture, so a student's settings column had never been drawn

**`doGet` SENDS `STUDENT_GROUPS`, AN OBJECT.** The fixture sent an empty array, so
`Object.keys([]).length` was 0, `settingsPages_` fell through to the tutor's map, and **every state
on that column has been measured as a tutor** — the FIFTH time that file has been found stating a
shape the server does not send, after `focus` as a string, the receipt's `sessionDates` against
`dates`, the job's `students` and `venue`, and the availability hour codes.

**`USER.role` IS THE APP'S OWN DOOR.** `loginReplyFor_` sends the role and `data.js` writes it onto
`USER`, so the declared state sets it and repaints — which is the state a student's own sign-in
produces, the same argument as the message thread seeded through `MESSAGES`. **It puts the role
back**, because states run in order down one page and a lab left holding a student measures every
column after it as the wrong visitor.

**MEASURED IN A BROWSER AS WELL, because a green state says only that the assertion held.** Page 3
of a student's twelve, headed **Exam dates**, two `input[type="date"]` captioned `small exam` and
`big exam`, the seeded `2027-05-14` in the first, and the pane hiding **0px** below its own fold at
390x844. The probe needed `go('settings')` before `paint` to get it: `repaint()` paints the screen
you are ON and its neighbours, and the settings column is eighth — which is not a fault in the state,
because `check/ui.js` has already `go`ne to the screen before `enter` runs.

**THE ASSERTION IS THE TYPE RATHER THAN THE COUNT.** `expect` is read as a truthy value, so a bare
count of two passes on a page holding two plain text boxes — which is exactly what `FIELD_IS_DATE`
failing to match produces. **Proved by mutation**: the regex made unmatchable names the state at all
four widths as *"was entered and shows no two exam-date boxes, both drawn as a date picker"*.

### And `git checkout <file>` threw away three uncommitted edits

**Reverting a mutation with `git checkout backend/constants.gs` reverted the whole file** — the
schema columns, the `STUDENT_GROUPS` entry and `DATE_COLS` with it, all uncommitted. Caught by
grepping for one of them immediately afterwards, and only because the three scratchpad scripts that
wrote them were still on disk to re-run. **A mutation on a file with uncommitted work is undone from
a copy, never from the index**, which is what the other two mutations in this commit did.

**Nothing the owner has to do but the four cells above**, and one thing that must run before the new
page can save: **`?setup=1`**, which is what `ensureSchema` needs to create `exam_small_date` and
`exam_big_date`. Until it does, saving that page is refused by name — *"The sheet has no column for:
exam_small_date"* — which is the refusal that exists so nobody meets a silent no-op.
