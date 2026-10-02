## A generated handle, and the eight-part message audited item by item

**Asked for as "each person should have randomly generated username, handle llik \"@_____\", email,
first name, last name and username."** Plus a direct question about whether the message before it
had been addressed, which is answered at the foot of this entry against the code rather than against
a task list.

### `register` wrote no handle at all, and a username two people can share

**MEASURED BEFORE ANYTHING WAS DESIGNED.** `register` wrote
`username: S(first + last).replace(/[^A-Za-z0-9]/g, '')` and **no `handle` cell**. So:

| | |
|---|---|
| **every account made through the form has a blank handle** | `doGet` sends `handle \|\| username \|\| first_name`, so the squashed name has been standing in for one since the form was written |
| **and that username collides** | two people called John Smith both get `JohnSmith` |

**THE COLLISION IS NOT A TIDINESS FAULT.** `findPerson` matches `username` and returns the FIRST
row, so the second person signs in as the first — and `changePin` then checks the PIN they typed
against the other one's row and tells them their own PIN is wrong. **This file already records that
denial happening for real, to one person, by accident.** `handleTrouble_` would have refused it and
was never reached: it guards `changeHandle` and nothing else.

### Words rather than the name, and the safeguarding argument decides it

**`BrightOtter42`.** The other candidate was a name with a random tail — `halexdias_4b` — which is
friendlier, because its owner can guess it. It loses on one point and the point is not taste:
**most of the people on this tab are children**, and a handle built from a real child's full name
publishes that name wherever the handle is shown. That is exactly what made `ticks_1/2/3` a leak
rather than untidiness. The ask said randomly generated and the privacy argument says the same
thing, so there is nothing to trade.

**`handleTrouble_` IS THE ONE GATE AND THE GENERATOR GOES THROUGH IT** — shape, the reserved list,
the blocklist and the clash against all four columns `findPerson` answers to. A generator with its
own copy of any of that is the second reader this repository keeps finding. It is handed
`isAdmin: true` so the month's cooldown is skipped: that rule is a brake on somebody changing their
mind, and a row being GIVEN its first handle has not changed anything.

**BOTH COLUMNS GET THE SAME STRING.** `handle` and `username` are one fact in two columns — this
file's own sentence, and `changeHandle` already writes both — so two different generated values
would be two names for one person, which is what makes `findPerson` returning the first match
dangerous rather than merely untidy.

### The two lists, and the length claim in my own comment was wrong

**THE COMMENT SAID "EIGHT CHARACTERS OR FEWER" AND DID THE ARITHMETIC AS 8 + 8 + 2 = 18.** Measured:
the longest adjective is **6**, the longest noun **7**, and the worst pair plus its tail is **15**
against a twenty-character cap. A rule of thumb where a measurement was available, in the same commit
that added the measurement — the "all 18 checks pass" shape. It states the three numbers now, and
**a thirteen-letter noun is what it takes to break the rule**, which is what the mutation had to use.

**AND THE BLOCKLIST FOLDS DIGITS ONTO LETTERS**, so a word-pair nobody would look at twice can reduce
onto something refused — and the generator would then burn tries on it in silence. That is a fact
about the two lists TOGETHER, which is what a person reading one list cannot check. All **576** pairs
go through `handleTrouble_` on an empty tab.

**THE MUTANT FOR IT IS COMPUTED RATHER THAN WRITTEN.** A blocked word pasted into a mutation script is
the blocked word in one more file, which is the rule `check-handles.js` already states about never
quoting one back — and `check-secrets.js` caught its own author doing the equivalent with a PIN. The
script picks one out of the list at run time, builds a noun around it, and prints only whether the
rule fired.

### `?run=fillHandles` for the rows that already exist, and the line it stops at

**IT ONLY EVER FILLS A BLANK**, which is `repairShopPrices`' rule and for its reason: a handle is what
somebody signs in with, so a job that replaced one would **lock that person out of their own account**
and change the name their friends know them by — and it would look like a successful run. The count
of what was left alone is printed, because "0 filled" reads the same whether everything was already
right or nothing was found.

**A ROW WITH ONE OF THE TWO FILLED IN GETS THE OTHER COPIED ACROSS** rather than a second handle
generated. Half-resolvable is the `needs_print` / `print_required` shape on the two columns that
decide who somebody IS: `findPerson` would answer to one spelling and not the other.

**AND IT WILL NOT INVENT AN EMAIL, A FIRST NAME OR A LAST NAME.** That is the one place this job
stops, and it is the same line the practicals' blank `needs` and the library's `figure` count are
drawn on: **a generated `@example.com` address is not a blank cell, it is a WRONG cell** — `notify`,
`forgotPin`, the verification link and every invitation would post into it and report success, which
is this repository's oldest shape with a stamped addressed envelope. A made-up first name on a real
child's public card is worse again. So they are counted and **named by `person_id`**, and somebody who
knows the answer types it in.

**IDS RATHER THAN NAMES IN THE REPORT**, because a row missing a first name has nothing else to be
called — and because that reply is read by an admin over a URL rather than by the person.

### The `@` is drawn and not stored, and it had never been drawn anywhere

**MEASURED ACROSS `js/`: the only `@` in front of a handle anywhere in the app was a toast in
`changeHandle`.** `doGet` has sent `handle` on every tutor since it was written and no card drew it —
so a handle was a thing you signed in with and never saw, which is the other half of the ask.

**STORED WITHOUT IT.** `findPerson` resolves through `key()`, which strips the `@` anyway, so a stored
one is a character that means nothing to every reader and has to be remembered by every writer. Same
separation as `spellShow_`: what is matched and what is shown. Gold and `.7rem`, under the name, so it
does not compete with it and is told apart from the place name directly beneath it at the same size.

**MEASURED IN A BROWSER**: `@testadmin`, **one** `@`, `rgb(255, 180, 84)`, nothing past the pane's
fold.

### And the fixture stated a handle no row can hold, for the sixth time

**IT SAID `@ada`, WITH THE `@` IN THE CELL.** `HANDLE_SHAPE` refuses a leading `@` outright, so no row
anywhere can produce one — and the moment a card drew `@` + the handle the lab rendered **`@@ada`**.
Every measurement of that card would have been of a string the app cannot produce.

**SIXTH TIME THAT FILE HAS BEEN FOUND STATING A SHAPE THE SERVER DOES NOT SEND** — after `focus` as a
string, the receipt's `sessionDates` against `dates`, the job's `students` and `venue`, the
availability hour codes, and `studentFields: []`. The other five were each found by a feature failing
to draw. **This one is a rule**: every handle in the fixture must pass `HANDLE_SHAPE` — through that
constant rather than a regex written in the check, because the question is whether the server could
ever send the value and that constant is what decides it. So the seventh fails in a check.

### The retry could not be tested by seeding rows, and the first attempt reported the app broken

**IT TOOK EVERY ADJECTIVE-NOUN PAIR BUT ONE AS A TAKEN ROW and wanted the generator to return the one
left.** The generator correctly returned `WarmComet37` — because the tail is a random 10 to 99, so
those 575 rows are 575 of **fifty-one thousand** possibilities. A case that assumed a fixed tail,
reported as a fault in the app. Taking the whole space needs 51,840 rows through a clash check that
runs four `key()` calls per row per try, which is seconds of a check that runs in hundredths.

**SO THE GATE IS REBOUND INSTEAD.** `handleTrouble_` is a function declaration in the extracted scope,
so the check can replace it — and that makes both branches deterministic: a gate that refuses
everything must make the generator **give up** rather than return a refused handle or loop, and a gate
that refuses four candidates and then allows anything must produce the fifth. The generator's contract
is a statement about its loop rather than about the words, and that is the only way to reach it.

**Eight mutations in all**, each against the exact line it replaces: a thirteen-letter noun, a noun
folding onto a blocked word, `register` writing no handle, the username back to the name, the repair
job overwriting instead of filling, the repair job inventing an email, its missing-column refusal
removed, and a half-filled row given a new handle instead of the one it has. All eight fire; the real
files are green.

**And the register block was cut for 4000 characters and outgrew it.** Adding the generated handle put
the `username:` line at 4715, so the window ended before the line it exists to read and the check said
*"could not find the username line"* — the guard working, about itself. It cuts at the next
`if (action ===` now: **a character count is not a boundary**, which is the `objectAfter_` lesson from
`check-tabs.js` where a prefix match handed a check the wrong object.

### The eight-part message, item by item, measured rather than remembered

| | |
|---|---|
| **sign in with email** | **done.** `findPerson`'s sixth rung, guarded on `@` so a junk email cell cannot be matched by a plain name |
| **the wardrobe repeats the same avatar** | **done.** Seven pages became four, and the number is measured: two slots a page, worst pair 424.7px against a 534.25px cap; three a page is 569px and over |
| **a Spotlight column after Saved** | **done.** Its own tab, handler, payload key and `spotNow_`; `sort_order` 12, after Saved |
| **a favicon** | **done.** `<link rel="icon">` had never existed at all — the manifest and the apple-touch-icon had been naming a file nobody made |
| **date of birth as three boxes** | **done**, and it repaired `profileOf_` drawing `Sun Sep 15 1985 00:00:00 GMT+0100` into an editable field |
| **somewhere for the A-level board and what you are studying** | **the place is done and the values are not typed in.** `qual_1_board` and `studying` / `studying_at` are columns, on the form, in `FIELD_OPTIONS`. The sheet still says `qual_1: Maths, GCSE, 8` — nothing here can write to it, and **`?setup=1` has not run**, so those columns do not exist in the tab yet |
| **case-sensitive username logins** | **declined, with the reason, and half of it done.** The case somebody types is now PRESERVED in both writers; matching stays case-insensitive through `key()`, because case-sensitive matching means somebody who capitalised on Tuesday is told *"Name or PIN not recognised"* on Wednesday. One line reverses it and it is named |
| **three photos and a video for the portfolio** | **NOT DONE, and it is the one that did not land.** What was built is the DOOR — `check-doors.js` had been printing `new-post` as a handler with no button for weeks — and the four files were never posted. Posts live in the Ledger `posts` tab, which nothing here can write to |

**THE PHOTOS ARE ONE PASTE EACH NOW THAT THE DOOR EXISTS.** `POST_GROUPS` has an `image` field, so
Feed → Write a post → paste the Drive URL. `pic()` sends it through
`lh3.googleusercontent.com/d/<id>=w1200`, **which transcodes**, so the HEIC files arrive as something
every browser can draw. **The video is 98.9MB and is deliberately not in** — the two clips that are in
are 7.3 and 7.9MB, and `data/reels/README.md` carries the re-encode command.

**AND "randomly generated ... email, first name, last name" IS READ AS THE LIST OF FIELDS A PERSON
SHOULD HAVE, with "randomly generated" attaching to the identifiers.** The other reading is
anonymising real people, which is irreversible, so it is not done and is named here instead: if that
is what was meant, it is one more job beside `fillHandles` and the rows it would rewrite are the ones
that job already reports.
