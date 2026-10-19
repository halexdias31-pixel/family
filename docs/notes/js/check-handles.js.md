# js/check-handles.js

The full text of comments in `js/check-handles.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-handles.js A HANDLE IS THE ONE NAME ON A PERSON THAT EVERYBODY ELSE HAS TO LOOK AT.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-handles.js

   A HANDLE IS THE ONE NAME ON A PERSON THAT EVERYBODY ELSE HAS TO LOOK AT.

   NOBODY TYPES ONE ANY MORE. *"handles should be their name and a virtuous describing word. they can
   randomise it but it will follow that general name."* And on 2 October: *"their first name, a
   virtuous adjective and random numbers and maybe an underscore. but all random order."* So
   `handleMake_` builds every handle — the first name, a virtue and a fresh two-digit number, in one
   of the four orders that do not start with the digits, with an underscore at one join about half
   the time — and the Settings card's Randomise tile asks it for another. The cases below are in
   three parts: the GATE every candidate goes through (`handleTrouble_`), the GENERATOR's own rules
   (two hundred draws all shaped, every order seen, never the handle you already have, every older
   shape still read as shaped by `handleParts_`), and the two jobs that
   write handles onto rows that exist. `randomiseHandle` itself is run through the real `doPost` in
   `check-profile.js`, which is the file here that already loads the whole backend.

   Every other check here measures whether the app WORKS. This one and `check-marking.js` are the two
   that measure whether it is SAFE to hand to a child, and the failures are not symmetrical:

     a rude handle let through   is on a tutoring site, beside children's names, until somebody sees
                                 it — and the person who sees it first is a parent
     a real name refused         is somebody who has done nothing, told no, with no way to argue

   A first name is still something the gate is asked about, and a name and a virtue can meet across
   the underscore — which is why `HANDLE_ALLOWED` is still here, and why half the gate's cases are
   words that must be let through rather than words that must not.

   ---------- AND THE RULE THAT IS NOT ABOUT WORDS AT ALL ---------------------------------------------

   `findPerson` resolves a person by id, then `first + last`, then `handle`, then e-mail, FIRST MATCH
   WINS. A handle that duplicates any of those makes `changePin` check the PIN somebody typed against
   ANOTHER PERSON'S ROW and tell them their own PIN is wrong — the denial CLAUDE.md already records,
   which happened by accident to one person. A generator that did not ask would make the same
   accident on its own, so the uniqueness cases below are the ones that matter most even though the
   word list is what anybody asks about first.

   IT CUTS THE TWO FUNCTIONS OUT OF `people.gs` AND RUNS THEM, which is `check-marking.js`'s method
   and is safe for the same reason: they touch nothing else. A second implementation here would be a
   second thing to keep in step — the fault this repository records under `childrenOf`, under
   `link`/`source_url` and under `factsNow_`.

   ---------- AND THE ONE THING A PERSON MAY ONLY CHANGE ONCE A MONTH ---------------------------------

   `pricingRefusal_` IS THE SAME MECHANISM OVER FOUR COLUMNS — a tutor's rate, their extra-seat
   fraction and the two ends of the class sizes they take, which between them are what a family is
   quoted and what every booking already taken was priced and seated against. It lives beside
   `handleTrouble_` in `people.gs` *so that this file can run it*: written inside `updateProfile` it
   would be six lines nothing here can reach, which is the shape this repository records every time a
   check could not see its subject.

   ITS OWN CASES ARE BELOW THE HANDLES, and two of them are faults that would have been silent.
   A page that posts the four unchanged must NOT be refused, because that form posts all four on
   every save whether or not anybody touched one. And ONE CLOCK MEANS ONE CLOCK: a rate changed five
   days ago must refuse a change to the seat cap today, or the four stamps somebody could walk round
   a week at a time are back with one name on them.

   RUN IT:  node js/check-handles.js
================================================================================================== */
```

### ---------- CUT BY NAME, AND FAIL LOUDLY IF A NAME IS NOT THERE

top level, before `grab`

```
/* ---------- CUT BY NAME, AND FAIL LOUDLY IF A NAME IS NOT THERE -------------------------------------
   A check that cannot reach its subject must exit non-zero — `check-booking.js` printed "nothing to
   check" and exited 0 for months, which read as a pass. */
```

### ---------- AND THE GENERATOR, WHICH THE COMMENT OVER IT CANNOT CHECK ITSELF

in `SRC`

```
/* ---------- AND THE GENERATOR, WHICH THE COMMENT OVER IT CANNOT CHECK ITSELF ------------------
     `handleMake_` PASSES ITS CANDIDATES THROUGH `handleTrouble_`, so it cannot produce a handle that
     is taken, reserved or the wrong shape — that half is structural. What it CAN produce is a pair
     that folds onto a banned word: `handleFold_` turns digits into letters, so a word-pair nobody
     would look at twice can reduce onto something the blocklist refuses, and the generator would
     then quietly burn tries. That is a fact about the two lists TOGETHER, which is exactly what a
     person reading one list cannot see. */
```

### ---------- A CHILD'S HANDLE (342), AND THE ONE TEST THAT SAYS WHO IS A CHILD

in `SRC`

```
/* ---------- A CHILD'S HANDLE (342), AND THE ONE TEST THAT SAYS WHO IS A CHILD ---------------------
     `handleMake_` ASKS `isChild_` NOW, so the test comes with it — the real one and what it reaches for,
     cut out the same way, rather than a stub that says "student" and would agree with itself. A second
     reading of who is a child is the thing 333 refused to have. */
```

### ---------- AND THE REPAIR JOB, WHICH IS THE ONE THING HERE THAT WRITES

in `SRC`

```
/* ---------- AND THE REPAIR JOB, WHICH IS THE ONE THING HERE THAT WRITES -----------------------
     `fillHandles` FILLS A BLANK HANDLE ON EVERY EXISTING ROW, and the fault it must never have is
     overwriting one: a handle is what somebody signs in with and what `findPerson` resolves them
     by, so a job that replaced one would lock that person out of their own account. That is not a
     thing reading it can settle — it is a thing you run over rows and then look at the rows. */
```

### THE FOUR FIELDS THE RULE IS ABOUT, READ OUT OF `constants.gs` RATHER THAN LISTED HERE.

in `SRC`

```
/* THE FOUR FIELDS THE RULE IS ABOUT, READ OUT OF `constants.gs` RATHER THAN LISTED HERE. A copy
     would agree with itself and with nothing else — so a fifth field added there is under these
     cases the same afternoon, and one deleted there fails them. */
```

### ---------- AND THE BUSINESS'S CUT OF AN EXTRA SEAT, PER TUTOR (docs/history/345)

in `SRC`

```
/* ---------- AND THE BUSINESS'S CUT OF AN EXTRA SEAT, PER TUTOR (docs/history/345) ----------------------
     Beside the four and NOT one of them — its own rule, an admin's alone, and its own idea of "moved" that
     knows a blank (the config default) from a nought (no cut). Its constant read out of constants.gs, as
     `PRICING_FIELDS` is, so the rule here is the one the server runs. */
```

### The eight Apps Script helpers those two reach for, and nothing else.

top level, before `PRELUDE`

```
/* The eight Apps Script helpers those two reach for, and nothing else. If one of them ever changes
   meaning, this stops agreeing with the backend and that is the point of stubbing rather than
   importing: they are the backend's, copied, and a drift shows up as a case failing. */
```

### THE GATE ITSELF, SO THE GENERATOR'S OWN LOOP CAN BE TESTED.

top level, before `DAY`

```
/* THE GATE ITSELF, SO THE GENERATOR'S OWN LOOP CAN BE TESTED. `handleTrouble_` is a
              function DECLARATION in this scope, so it can be rebound — and that is the way to reach
              `handleMake_`'s retry and its give-up branch deterministically, because the order the
              words are tried in is random. Restored after each case; nothing outside these lines
              uses it. */
```

### ---------- EVERY CASE IS A FAULT THAT HAPPENED OR WOULD HAVE

top level, before `CASES`

```
/* ---------- EVERY CASE IS A FAULT THAT HAPPENED OR WOULD HAVE ---------------------------------------
   `no` means "must be refused", `yes` means "must be allowed". The word beside it is the reason,
   printed when a case fails, because "case 31 failed" tells nobody anything. */
```

### ---------- EVERY COMPARISON FOLDS THE CASE

in `CASES`

```
/* ---------- EVERY COMPARISON FOLDS THE CASE ------------------------------------------------
     The generator only ever asks in lower case, but rows typed into the sheet by hand do not, and
     the gate is what stops `halex` being handed out while `HaLeX` already answers to somebody — two
     accounts that render identically on a site children use. A version that made the matching
     case sensitive passes none of the four `no`s below, which is why they are cases rather than a
     sentence in a comment. */
```

### AND NO MONTH. The cooldown went with the typed box:

in `CASES`

```
/* --- AND NO MONTH. The cooldown went with the typed box: every handle is a first name and a
     word off a list, so there is nothing for a brake to brake, and a child pressing Randomise twice
     is looking for a word they like. Putting `HANDLE_COOLDOWN_DAYS` back fails the first case. */
```

### ---------- SIGNING IN WITH AN E-MAIL, AND THE COLLISION THAT MADE IT A DIFFERENT FOLD

in `run`

```
/* ---------- SIGNING IN WITH AN E-MAIL, AND THE COLLISION THAT MADE IT A DIFFERENT FOLD --------
     ASKED FOR AS *"i want people to be able to sign in with email as well."* `verifyLogin` RESOLVED
     through `findPerson` when this was written, so the rung there WAS the feature. It reads the
     `email` column alone now, and the cases for THAT are under `SIGNIN` below — and the case that
     decides how it is written is `SAME` below.

     `alex@dias.com` AND A PERSON CALLED "Alex Dias Com" REDUCE TO ONE `key()`. That function strips
     everything that is not a letter or a digit, so an address matched the way every name above it
     is matched would put two different people on one search term — and `changePin` would then check
     the PIN somebody typed against the other one's row, which is the denial this repository records
     happening for real. Matching the address WHOLE, case-folded, makes it impossible rather than
     unlikely: the four cases below fail on any version that folds an address the way it folds a
     name, and pass on this one.

     AND THE RUNG IS LAST, which `KEEP` is for: every name that resolved before must go on resolving
     to the same row. */
```

### ---------- AND A ROW WHOSE E-MAIL CELL HOLDS A NAME

in `MAILS`

```
/* ---------- AND A ROW WHOSE E-MAIL CELL HOLDS A NAME ---------------------------------------
       WHICH IS WHAT THE `@` GUARD IS FOR, and the only thing that makes it load-bearing: an
       address is matched WHOLE, so without the guard a cell into which somebody typed a person's
       name is a second way to reach that string — and the row it reaches is not the row whose name
       it is. A sheet somebody types into by hand has cells like this in it; the rule is that a rung
       looking for an address only ever fires on something shaped like one. */
```

### THE JUNK ROW SITS FIRST, and that is the whole of what makes this a test.

in `MAILS`

```
/* THE JUNK ROW SITS FIRST, and that is the whole of what makes this a test. `Array.find`
       returns the first ROW whose predicate is true, so the order of the rungs INSIDE the
       predicate decides nothing unless the wrong row is reached first. With Grace's own row above
       it, her name matches before anything looks at anybody's e-mail cell and the case passes
       whatever the rung does. */
```

### ---------- THE GUARD IS WHAT PROTECTS THIS, AND THE RUNG ORDER IS NOT

in `FINDS`

```
/* ---------- THE GUARD IS WHAT PROTECTS THIS, AND THE RUNG ORDER IS NOT -----------------------
       I WROTE THE OPPOSITE FIRST AND THE MUTATION SAID NO. `Array.find` returns the first ROW whose
       predicate is true, so which rung sits where INSIDE that predicate decides nothing — the row
       order does. Dropping the `@` guard fires these two cases whether the address rung is first or
       last; moving the rung with the guard in place fires nothing. So the guard is the rule and the
       ordering is only about not changing what already resolved. Measured both ways rather than
       reasoned, which is what this file exists to make possible. */
```

### ---------- AND THE TYPED PATH IS GONE, AND THE DOOR THAT REPLACED IT IS THE ASKER'S OWN

in `run`

```
/* ---------- AND THE TYPED PATH IS GONE, AND THE DOOR THAT REPLACED IT IS THE ASKER'S OWN ---------
     `changeHandle` TOOK A HANDLE SOMEBODY TYPED, and everything this file used to say about it — the
     case kept as typed, what was validated being what was written — was about a box that is not
     there any more. What replaces it is `randomiseHandle`, which takes no handle at all. Two things
     must hold and both are facts about the files rather than about behaviour, so they are greps:
     nothing in the backend's code still answers to `changeHandle`, and `randomiseHandle` is `self`
     — a door for the signed-in person and nobody else. What the action DOES is run through the real
     `doPost` in `check-profile.js`.

     COMMENTS ARE STRIPPED FIRST, opener to closer, because the prose says `changeHandle` on purpose
     — it is the history of why this door exists. */
```

### ---------- AND `register`, WHICH IS THE WRITER EVERY ACCOUNT GOES THROUGH ONCE

in `run`

```
/* ---------- AND `register`, WHICH IS THE WRITER EVERY ACCOUNT GOES THROUGH ONCE ---------------
     `register` WAS ONCE THE WRITER NOTHING CHECKED: it stored `norm(first + last)` as a username
     and no handle at all, while the rename box was the only door the gate guarded. It writes a
     generated handle now, through the same gate, and this asks that it still does — a row written
     with no handle shows a first name where a handle would be, for ever. */
```

### ---------- TO THE NEXT HANDLER, NOT FOR 4000 CHARACTERS

in `run`

```
/* ---------- TO THE NEXT HANDLER, NOT FOR 4000 CHARACTERS ---------------------------------------
     IT WAS `post.slice(reg, reg + 4000)` AND THE HANDLER OUTGREW IT. Adding the generated handle put
     the `username:` line at 4715 characters from `action === 'register'`, so the window ended before
     the line it exists to read and the check reported "could not find the username line" — which is
     the guard doing its job, and about itself rather than about the app.

     A CHARACTER COUNT IS NOT A BOUNDARY. The next `if (action ===` is, and it is what the handler
     actually ends at — so a comment added above a line cannot move that line out of reach. Same
     lesson as `objectAfter_` in `check-tabs.js`, where `indexOf('const ' + name)` matched a longer
     name and handed the check the wrong object. */
```

### ---------- AND NOTHING WRITES A `username` ANY MORE

in `run`

```
/* ---------- AND NOTHING WRITES A `username` ANY MORE -------------------------------------------
     THE COLUMN WENT WITH THE PEOPLE TAB'S REDESIGN — it was the handle written a second time — so a
     write to it is a write to a header that is not there: `missedWrite_` records it and `jsonOut`
     turns the whole Save into "Nothing was saved". A grep over the backend's code (comments are
     prose and may say the word) for anything that names it as a cell. */
```

### ---------- THE WORD LIST, WHICH IS THE PART A PERSON CHOSE

in `run`

```
/* ---------- THE WORD LIST, WHICH IS THE PART A PERSON CHOSE -------------------------------------
     WHICH WORDS ARE VIRTUES IS A JUDGEMENT AND IS WRITTEN OVER THE LIST, NOT HERE. What a check can
     settle is the shape of the list: lower-case letters only, nothing twice (a duplicate is a word
     drawn twice as often, and two Sams one word apart in a list that says it has thirty), and short
     enough that the longest word, the longest first name kept and a tail still fit `HANDLE_SHAPE`.
     A word that broke the last rule would make every draw on it refused for length alone, and on a
     long name the generator would fall to the fallback in silence. */
```

### ---------- THE ORDERS: EVERY ONE THAT DOES NOT START WITH THE DIGITS, AND NO OTHER

in `run`

```
/* ---------- THE ORDERS: EVERY ONE THAT DOES NOT START WITH THE DIGITS, AND NO OTHER ---------------
     *"their first name, a virtuous adjective and random numbers and maybe an underscore. but all
     random order."* Three parts have six orders; `HANDLE_SHAPE` refuses a handle that starts with a
     digit, so the two that lead with the number are out and the other four are in. A list that lost
     one would still pass every draw below — it is the list itself that has to be all four. */
```

### ---------- EVERY WORD BESIDE A SPREAD OF FIRST NAMES, IN EVERY ORDER, THROUGH THE GATE

in `run`

```
/* ---------- EVERY WORD BESIDE A SPREAD OF FIRST NAMES, IN EVERY ORDER, THROUGH THE GATE -------------
     `handleFold_` turns digits into letters and drops the underscore, so a first name, a number and
     a word can meet across the joins and reduce onto something the blocklist refuses — `ada` and
     `55` are `adass` to it. Every such candidate is refused and the generator draws again, so a
     refusal is not a fault the way it was when every name had exactly thirty candidates; what would
     be is a share large enough that a name runs out of draws. So this counts them and fails past one
     in fifty, and prints the count either way. On an empty tab, so only the shape, the reserved
     list and the blocklist can refuse. */
```

### ---------- THE SHAPE THE OWNER ASKED FOR, OVER TWO HUNDRED DRAWS

in `run`

```
/* ---------- THE SHAPE THE OWNER ASKED FOR, OVER TWO HUNDRED DRAWS --------------------------------
     A contract written HERE rather than read from people.gs, because it is the generator being
     checked and a check that asked `handleParts_` whether `handleMake_` was right would be the code
     marking its own homework. Every draw, on an empty tab, must be: the first name reduced the way
     `handleFirst_` says, a virtue, and a two-digit number 10–99, in one of the four orders; at most
     one underscore and only at a join; never starting with a digit; twenty characters at most; and
     something the gate itself accepts. Then the two hundred TOGETHER must show all four orders, an
     underscore and none, and more than one number — a generator that always drew `<first>_<virtue>NN`
     passes every single-handle rule above and is exactly the fixed order the owner asked to lose. */
```

### AND THE PARSER READS IT.

in `run`

```
/* AND THE PARSER READS IT. `renameHandles` leaves alone what `handleParts_` calls shaped, so a
       handle Randomise made that the parser could not read would be renamed by the next run of the
       job — the very thing the owner said must not happen to anybody's handle. */
```

### ---------- A TAKEN WORD-AND-NUMBER IS NEVER HANDED OUT, IN ANY SPELLING

in `run`

```
/* ---------- A TAKEN WORD-AND-NUMBER IS NEVER HANDED OUT, IN ANY SPELLING -----------------------------
     The clash check compares by `key()`, which drops the underscore, so with `ada_kind42` held by
     somebody else the generator must not hand out `adakind42` either — the pair that reads as the same
     person. With every word in every one of the first two orders taken at one number, twenty draws
     must still come back free and never match a held one by `key`. */
```

### ---------- NEVER THE HANDLE YOU ALREADY HAVE

in `run`

```
/* ---------- NEVER THE HANDLE YOU ALREADY HAVE -----------------------------------------------------
     Randomise passes the current handle as `avoid`, and the gate cannot refuse it on its own: a
     person's own row is not a clash with them, so to the gate `ada_kind42` is FREE for its owner.
     With a fresh number every press the generator almost never OFFERS the current one, so thirty
     honest presses would pass a generator that ignored `avoid` entirely. So the dice are fixed:
     `Math.random` pinned to 0 makes every press draw the same candidates in the same order, the
     first press on an empty tab says what the first candidate is, and the person is then given
     exactly that handle — the next press must step past it, and past its spelling without the
     underscore, which `key()` reads as the same name. Restored in a `finally`, because a pinned
     `Math.random` left behind would make every later case here deterministic in silence. */
```

### AND A FIRST NAME THE GATE REFUSES OUTRIGHT FALLS TO THE FALLBACK, rather than giving up and leaving `register` to write a blank.

in `run`

```
/* AND A FIRST NAME THE GATE REFUSES OUTRIGHT FALLS TO THE FALLBACK, rather than giving up and
     leaving `register` to write a blank. Built from the blocklist at run time rather than written
     here, because a refused word pasted into this file is the word in one more file. */
```

### ---------- `handleIsShaped_` — WHAT `renameHandles` READS AS ALREADY DONE

in `run`

```
/* ---------- `handleIsShaped_` — WHAT `renameHandles` READS AS ALREADY DONE ----------------------
     EVERY ARRANGEMENT, AND THE ONE BEFORE IT. The 1 October `halex_kind` and its tailed form are
     still the shape — the owner said existing handles are not regenerated, and this is the line that
     keeps the job from doing it. All four new orders, with and without an underscore at either join.
     Not the shape: the older `BrightOtter42`, `halex_bright42` (not a virtue), somebody else's head,
     a one-digit or three-digit number, a number out of 10–99, the digits first, two underscores,
     capitals, a trailing underscore. */
```

### A FIRST NAME THAT IS ALSO A VIRTUE.

in `run`

```
/* A FIRST NAME THAT IS ALSO A VIRTUE. Somebody called True gets `true` as a head and might get
     `true` as a word; the parser must read `truekind42` and `kindtrue42` both, which it can only do
     because a regex of alternatives backtracks. */
```

### ---------- `handle_was`: NEWEST FIRST, AND EVERY ONE KEPT

in `run`

```
/* ---------- `handle_was`: NEWEST FIRST, AND EVERY ONE KEPT ---------------------------------------
     The one just replaced is at the front. A version that overwrote the cell — which is what it did
     while there was a month between changes — answers "who was @foo" only about the last name. It kept
     the newest ten until 342, when an old handle became a credential (it still signs its person in) and
     a reservation (nobody else is given it): the trim retired both at the eleventh press, so nothing
     falls off now, and Randomise stops at `HANDLE_WAS_MAX` instead (`check-profile.js`). */
```

### A CHILD'S HANDLE IS THEIR INITIALS AND FOUR DIGITS, AND NOTHING ELSE ABOUT THEM (docs/history/342)

in `run`

```
/* ==================================================================================================
     A CHILD'S HANDLE IS THEIR INITIALS AND FOUR DIGITS, AND NOTHING ELSE ABOUT THEM (docs/history/342)

     THE OWNER, 11 OCT: *"Change usernames to be more abstract to hide the names of kids. Just use
     initials and some combination which comes from date of birth or something."* The initials, yes;
     the date of birth, no — a birthday is a fact about a child, and a handle is on every screen. So
     the contract, written HERE rather than read from people.gs (the generator is what is checked):
     every child's handle is their initials, exactly, then four digits from 2 to 9; nothing of either
     name past its first letter; nothing the gate refuses; read back as the shape by the parser the
     migration asks; and NOT A FUNCTION OF THE BIRTHDAY — two children who differ only in it are given
     the same handle by the same dice. And who gets one is the one test 333 uses, `isChild_`.
     ================================================================================================== */
```

### NEVER A HANDLE SOMEBODY ELSE USED TO HAVE — an old handle still signs its owner in.

in `run`

```
/* NEVER A HANDLE SOMEBODY ELSE USED TO HAVE — an old handle still signs its owner in. Seven in eight
     of Ella's tails sit in another person's history; twenty draws must find the eighth, never the rest.
     And with the dice pinned so every candidate is the one old handle, the walk falls to the fallback
     rather than reissue it. The gate itself: refused for anybody else, free for the person whose
     history it is. */
```

### THE BLOCKLIST AGAINST EVERY PAIR OF INITIALS.

in `run`

```
/* THE BLOCKLIST AGAINST EVERY PAIR OF INITIALS. Digits fold onto letters (5→s, 7→t), so a pair and a
     tail can meet as a word and be drawn again — what matters is that no pair loses so many tails that
     sixty draws could all miss. Every pair, every single letter, the fallback, all 4096 tails. */
```

### AFTER REVIEW (342): A CHILD'S SHAPE IS ANY INITIALS AND A TAIL — not only the initials of the names on the row today, or a surname corrected after the move

in `run`

```
/* AFTER REVIEW (342): A CHILD'S SHAPE IS ANY INITIALS AND A TAIL — not only the initials of the names on
     the row today, or a surname corrected after the move moves the child again over a letter. And not a
     name with digits after it, nor digits that could be a year. */
```

### ---------- THE RETRY, AND THE GIVE-UP, WHICH ONLY A STUBBED GATE CAN REACH

in `run`

```
/* ---------- THE RETRY, AND THE GIVE-UP, WHICH ONLY A STUBBED GATE CAN REACH ---------------------
     The generator's contract is "keep asking until the gate says yes, and give up rather than loop",
     and that is a statement about the loop rather than about the words — so the gate is rebound. A
     gate that refuses everything must make it give up, and within a bound: `HANDLE_TRIES` draws for
     the name and as many for the fallback. A version that walked every number on every word in every
     order would ask over forty thousand times before saying no, on a request somebody is waiting for. */
```

### AND IT RETRIES RATHER THAN TAKING THE FIRST DRAW.

in `run`

```
/* AND IT RETRIES RATHER THAN TAKING THE FIRST DRAW. A gate that refuses the first four candidates
     and then allows anything must still produce one — which a generator that asked once would fail
     and a generator that asked for ever would hang. */
```

### ---------- AND THE REPAIR JOB ONLY EVER FILLS A BLANK

in `run`

```
/* ---------- AND THE REPAIR JOB ONLY EVER FILLS A BLANK ----------------------------------------
     THE FAULT IT MUST NOT HAVE is overwriting a handle — that is `renameHandles`' job, on purpose and
     only where the shape is wrong. Every case below is a row shape that exists on the real tab. */
```

### AND IT INVENTS NEITHER AN EMAIL NOR A NAME, which is the line this job stops at:

in `run`

```
/* AND IT INVENTS NEITHER AN EMAIL NOR A NAME, which is the line this job stops at: a generated
     address is not a blank cell, it is a WRONG one, and `notify` would post into it and report
     success. P4 has none of the three and must come back NAMED rather than filled. */
```

### AND IT REFUSES RATHER THAN RUNNING WHEN THE COLUMN IS NOT THERE.

in `run`

```
/* AND IT REFUSES RATHER THAN RUNNING WHEN THE COLUMN IS NOT THERE. `setCell` writes to a header
     that is not there and loses the value with no error anywhere — a job that "ran" and changed
     nothing is the worst outcome available here. */
```

### ---------- AND `renameHandles`, WHICH REPLACES ON PURPOSE AND ONLY WHERE THE SHAPE IS WRONG

in `run`

```
/* ---------- AND `renameHandles`, WHICH REPLACES ON PURPOSE AND ONLY WHERE THE SHAPE IS WRONG ------
     It may overwrite where the handle was never the shape. What it must do, row by row:

       R1 `BrightOtter42`     the oldest shape — becomes the new one, old one kept
       R2 `ada_kind`          the 1 October shape — untouched. *Existing handles are not regenerated*,
                              and a child with no e-mail signs in with this.
       R3 blank, no name      the fallback head
       R4 `sam_steady71`      the 1 October shape with a tail. Until 2 October this job stripped a
                              tail nobody needed; a number is on every handle now, so it is left
                              alone — or the job would strip the number off every Randomise press.
       R5 `kind42zo`          the new shape, digits in the middle, no underscore — untouched
       R6 a full history      the new handle at the front of `handle_was` and the oldest off the end

     And a second run changes nothing. */
```

### ---------- AND THE FIXTURE CANNOT STATE A HANDLE THE SERVER WOULD NEVER SEND

in `run`

```
/* ---------- AND THE FIXTURE CANNOT STATE A HANDLE THE SERVER WOULD NEVER SEND -----------------
     IT SAID `@ada`, WITH THE `@` IN THE CELL. `doget.gs` sends `S(r.handle) || S(r.username) ||
     S(r.first_name)` off a sheet whose cells hold `HalexD`, and `HANDLE_SHAPE` refuses a leading
     `@` outright — so no row anywhere can produce one. The moment a card drew `@` + the handle the
     lab rendered `@@ada`, and every measurement of that card would have been of a string the app
     cannot produce.

     SIXTH TIME THAT FILE HAS BEEN FOUND STATING A SHAPE THE SERVER DOES NOT SEND — after `focus` as
     a string, the receipt's `sessionDates` against `dates`, the job's `students` and `venue`, the
     availability hour codes, and `studentFields: []`. The other five were each found by a feature
     failing to draw; this is a rule, so the seventh fails here instead.

     THROUGH `HANDLE_SHAPE` RATHER THAN A REGEX WRITTEN HERE, which is the one thing that makes it
     honest: the question is whether the server could ever send this value, and that constant is what
     decides it. */
```

### ---------- AND WHAT A TUTOR CHARGES, WHICH IS THE SAME MONTH OVER FOUR NUMBERS

in `run`

```
/* ---------- AND WHAT A TUTOR CHARGES, WHICH IS THE SAME MONTH OVER FOUR NUMBERS ---------------
     EVERY CASE HERE IS A FAULT THAT WOULD HAVE HAPPENED. The first two are the ones that would have
     broken the form without looking broken: that page posts all four fields on every save, touched or
     not, so a rule firing on a field being PRESENT would refuse a save for a month over a number
     nobody edited. The cross cases are what makes it ONE clock rather than four — a rate moved five
     days ago must refuse a seat cap today, in both directions, or the walking-round is back. And the
     last two are the other end: a tutor who has never changed anything has no cell and is free, and a
     rule reading a missing date as zero would refuse everybody for ever.

     A FIELD ABSENT FROM THE POSTED OBJECT IS NOT A CHANGE, which is what lets every other page on the
     column save normally: `About you` sends no pricing field at all, so it must never be refused. */
```

### ---------- AND THE FOUR ARE THE FOUR, which no case above can say

in `run`

```
/* ---------- AND THE FOUR ARE THE FOUR, which no case above can say ----------------------------
     A rule that had quietly lost a field from its list would pass every case above — each one names
     the field it moves, so a list of three would simply stop refusing the fourth and there is no
     case that says the fourth exists. This reads the constant. */
```

### ---------- THE BUSINESS'S CUT OF AN EXTRA SEAT: AN ADMIN'S, AND BLANK IS NOT NOUGHT (docs/history/345)

in `run`

```
/* ---------- THE BUSINESS'S CUT OF AN EXTRA SEAT: AN ADMIN'S, AND BLANK IS NOT NOUGHT (docs/history/345) -----
     The owner, 12 Oct: *"Your cut off extra child for tutors should be editable on thir card."* The cut moved
     from one config number to `extra_seat_cut` on each tutor's row, and it is the business's margin, so the
     one thing this rule must never do is let a tutor set it — while still letting the tutor's own Save of the
     page it sits on through, which posts every box whether touched or not. And blank and nought are two
     answers (the usual share; none at all), which the four's `N()` compare cannot tell apart — so a blank
     made nought must count as a change, and '0.10' over 0.1 must not. */
```

### ONE PARSER, THE PATTERN (the review of 345):

in `CUTS`

```
/* ONE PARSER, THE PATTERN (the review of 345): the refusal asked `Number()` and `doGet` sent `parseFloat`, which
       disagree on "0x1" (1 and 0) — so a tutor's "0x1" over an admin's cut of 1 looked unchanged, was written, and
       went out as no cut. Anything that is not a plain decimal is a change, and no admin's to make either. */
```

### WHAT `doGet` SENDS FOR IT:

in `run`

```
/* WHAT `doGet` SENDS FOR IT: '' for blank (the default), nought for nought, the share for a share — and a cell
     that is not a plain share from 0 to 2 is the default, never a nought that takes the margin away: words, "0x1"
     (`parseFloat` read it as nought), "10" meant as ten per cent and "-0.1" (both went out as the number, which the
     price read as no cut), and "£0.10" (priced as 0.1 while the health card and an admin's write said otherwise). */
```

### ---------- `SIGNIN` — AN E-MAIL ADDRESS AND A PIN, AND NOTHING ELSE

in `run`

```
/* ---------- `SIGNIN` — AN E-MAIL ADDRESS AND A PIN, AND NOTHING ELSE ---------------------------
     ASKED FOR AS *"i want people to be able to sign in only with their email and their pin now. no
     case sensitive stuff."* `verifyLogin` reads the `email` column alone, and the three rules that
     make it so had no check at all: `check-flow`'s sign-in journey stubs the POST, and the cases
     above run `findPerson`, which sign-in no longer calls. Putting `findPerson(body.name)` back
     would have left every check here green.

     THE HANDLER ITSELF, CUT OUT OF `dopost.gs` AND RUN, not a second implementation of it. The
     seven helpers it reaches for are stubbed — the PIN check is a plain comparison, because what is
     under test is WHICH ROW a sign-in lands on rather than the hashing — and `findPerson` is stubbed
     to answer a username, so a version that went back to it fails the username case. */
```

### A STUDENT WHO HAS AN ADDRESS, in each shape a handle has had:

in `SIGNIN_ROWS`

```
/* A STUDENT WHO HAS AN ADDRESS, in each shape a handle has had: the 1 October
       `<first>_<virtue><nn>` and today's shuffled arrangement. *"have the students be able to login
       with their handles too"* — these two were the ones the handle door turned away. */
```

### ---------- A CHILD WHOSE HANDLE WAS MOVED (342), and the two ways an old handle could go wrong

in `SIGNIN_ROWS`

```
/* ---------- A CHILD WHOSE HANDLE WAS MOVED (342), and the two ways an old handle could go wrong ------
       P12 had two handles before her initials; P13 holds today a handle P14 used to have, so the old one
       must sign in P13 — whoever has it NOW; P15 and P16 both had one handle once, which is two accounts
       on one old name and is refused, never guessed. */
```

### ---------- THE HEADING NAMES BOTH THINGS, because it checks both

in `run`

```
/* ---------- THE HEADING NAMES BOTH THINGS, because it checks both -------------------------------
     It read "A USERNAME JUDGED WRONGLY" over a list that has held pricing findings since the cap
     cooldown went in — a summary naming one of the two subjects it covers, which is the "all 18
     checks pass" shape this repository records four times. */
```

### EVERY NUMBER HERE IS READ OFF THE ARRAY IT COUNTS.

in `run`

```
/* EVERY NUMBER HERE IS READ OFF THE ARRAY IT COUNTS. A figure typed into a sentence is the
     "all 18 checks pass" fault, which this repository has now recorded four times — including once
     in its own tally of how often it had recorded it. */
```

