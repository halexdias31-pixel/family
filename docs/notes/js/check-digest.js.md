# js/check-digest.js

The full text of comments in `js/check-digest.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-digest.js — THE SUNDAY PARENT EMAIL AND ITS MARKS, ASKED OF THE REAL BACKEND

top level, before `fs`

```
/* ==================================================================================================
   node js/check-digest.js — THE SUNDAY PARENT EMAIL AND ITS MARKS, ASKED OF THE REAL BACKEND

   ASKED FOR AS *"something which triggers every sunday. it checks what the student has done that week
   and records the questions and send it in an email to parents. for now dont actually make it but make
   the infrastructure"*. So nothing here has ever emailed anybody, and that is exactly why it needs a
   check: the first time it runs for real is a Sunday evening with forty families on the other end, and
   every rule below fails by sending — to the wrong person, twice, or at all when it was meant not to.

     · A WEEK IS MONDAY TO SUNDAY IN LONDON, including the two Sundays the clocks change, and a run on a
       Monday sends the week that just ended rather than starting one with nothing in it.
     · ONLY THAT WEEK'S SUBMISSIONS (since 9 Oct — `attempts` before), one line per question however many
       times it was sent, grouped per learner, new and gone-back-to apart, with the name the phone sent —
       and never the key in its place: a question with no name is counted, not listed.
     · EACH WITH THE WEEK'S LATEST VERDICT AS A MARK — ✓, ✗, the AI's "3 of 4 marks", "not marked" (it
       printed `sent` until 12 Oct) — the owner's *"Just whether it's right or not"*: the last press of
       the week decides it, a press after the week does not, and a press before it is still this week's,
       in the one list (the plan keeps it apart; the email no longer says "(again)").
     · ONLY THE LEARNER'S ACCEPTED PARENTS WITH AN ADDRESS. Not a pending link, not a refused one, not
       another family's parent, not the learner; a parent whose `weekly_email` says no is skipped; a
       learner nobody can be told about is listed with the reason and emailed to nobody.
     · OFF DOES NOTHING. PREVIEW WRITES THE LOG AND SENDS NOTHING. SEND SENDS ONE PER PARENT PER LEARNER,
       AND A SECOND RUN SENDS NONE — the log row is the receipt. The daily quota keeps its reserve, and
       what it held back goes on the next run, once.
     · `installWeeklyDigest` LEAVES EXACTLY ONE SUNDAY TRIGGER AT THE CONFIGURED HOUR, London, however
       many times it is run, and touches no other trigger. NOTHING CALLS IT, or the run, from anywhere.
     · `digestPreview` IS AN ADMIN'S, and writes, sends and books nothing.
     · `submitAnswer` KEEPS THE LABEL: tags out, capped — and a tab made without the column still takes
       the press.
     · THE PLAN CARRIES EACH QUESTION'S WORDS (SCHEMA.submissions `words`): a practical's latest box that
       has any, none that hold a link, an address or a domain anywhere in them — the question still
       listed by its name — and none on an item not printed.
     · AND THE EMAIL PRINTS THEM, since the owner made it the one parents get (*"should be at the end
       of the week that it send to parents all they done that week"*): each question under its paper
       as "Q4a: <its ask>", the stem its parts share once, refused words gone and the number kept, a
       paper with no words its line of numbers, one list, escaped, never a raw key, at most
       `DIGEST_WEEK_LIST_MAX` and then "…and N more." — and 80 of the longest under Gmail's clip.
     · `installWeeklyDigest` AND `removeWeeklyDigest` TAKE AWAY WHAT NOTHING RUNS ANY MORE
       (`DIGEST_RETIRED_RUNS`: the removed email's hourly check, the removed marking passes), and only
       that, and say so.
     · `installWeeklyDigest` TAKES AWAY THE REMOVED EMAIL'S HOURLY CHECK (`DIGEST_RETIRED_RUNS`), and
       only that, and says so.
     · `DIGEST_WORDS_REFUSE` RULE BY RULE — a one-letter domain, a dot that is not a full stop, a
       mobile, a landline as it is written, an account number, a sort code — words only under a key in
       the library's shape, and EVERY QUESTION AND STEM IN data/questions.json, as the phone sends it,
       refused by none of them.
     · SINCE 12 OCT (docs/history/348) — *"i want them to see if they got it right too"*:
         THE VERDICTS AS RECORDED (9, since 18 Oct — docs/history/352, *"It's already marked when they
         submit the questions"*): ✓, ✗ and the AI's marks as the press recorded them, "not marked" for a
         `sent` answer, no Gemini call from the email's run, no row appended to `submissions`.
         THE EMAIL (10, f), as MailApp is handed it: no handle, surname, id, PIN, `sent`, link or key —
         and each question's words with ✓, ✗, "N of M marks" or "not marked".
         THE TRIGGER (6, g): ONE — the 9pm Sunday email — booked once, and the way back.
         `checkSundayEmail` (11, h): every line it promises, and nothing changed.
         `check/digest-dry.js` (12): an invented week written to a folder, nothing sent, never in the repo.
     · SINCE 18 OCT (docs/history/351) — *"On Sunday @9pm"* and *"So each question As is on site."*:
         9PM (6, 9f, 11): 21 the code's default and the config row's, the run-up booked at 20:00 and working a
         burst from 19:50, the email's own run "up to 9:02pm"; `checkSundayEmail` printing the hour
         `installWeeklyDigest` recorded, WARNING while the config cell says another, and calling triggers with
         no recorded hour unknown.
         AS ON THE SITE (13): a library question printed whole from its row — the shared stem once, its
         picture after it, each part's number and marks over all its words, then "Kit: ✓" — through the
         allow-list; each picture the PNG twin by SHA-256 on the site, with its alt text, and the alt text in
         the plain body; a key the library has not got as its words line; no address but the pictures'; a
         real question's picture a file that is in data/diagrams/; and 80 whole papers under Gmail's clip
         with every question kept.

   THROUGH THE REAL BACKEND on `check-gas-load.js`, with MailApp, ScriptApp and the clock stubbed so
   that nothing here can reach a mailbox, a project or the time of day. The people are invented and
   their PINs are 0000.
================================================================================================== */
```

### THE WORLD — MailApp, ScriptApp, the lock and a London clock over the real backend — is `check-mail-load.js` now, lifted out of this file when the email after a

top level, before `world`

```
/* THE WORLD — MailApp, ScriptApp, the lock and a London clock over the real backend — is
   `check-mail-load.js` now, lifted out of this file when the email after a session needed the same
   one. The weekly receipt (`digest_log`, keyed by `week_of`) is its default. */
```

### ---------- THE PEOPLE, THE FAMILIES AND A WEEK OF WORK

top level, before `SUN`

```
/* ---------- THE PEOPLE, THE FAMILIES AND A WEEK OF WORK ----------------------------------------------
   THE WEEK IS MON 28 SEP – SUN 4 OCT 2026, and the run is that Sunday at 18:00 in London (17:00 UTC —
   it is still summer time). Ada did five things around it: two new inside it (the Monday-after-the-
   Sunday-before and the Sunday itself), one done again inside it, one entirely the week before, and one
   on the Monday after. Her family is every kind of link there is. */
```

### ONE ROW PER PRESS (SCHEMA.submissions).

in `seeded`

```
/* ONE ROW PER PRESS (SCHEMA.submissions). Ada sent q:ADA-1 three times in the week — right on the
     Monday and the Wednesday, wrong on the Friday — and once more, right, on the Monday after, which is
     next week's: the week's mark is the Friday's ✗, neither the week's first press nor next week's.
     q:ADA-SUN was right on the Sunday afternoon, before the 18:00 run. */
```

### THE WEEK'S LATEST VERDICT, ONE LINE PER QUESTION:

top level, before `a1`

```
/* THE WEEK'S LATEST VERDICT, ONE LINE PER QUESTION: q:ADA-1 was sent three times in the week and once
       the Monday after — one item, the Friday's `wrong`; never the week's first press, Monday's `right`,
       and never next week's `right`. */
```

### ---------- 2a. A PRESS IS IN THE WEEK BY LONDON'S CALENDAR, NOT BY UTC'S

top level, before `b`

```
/* ---------- 2a. A PRESS IS IN THE WEEK BY LONDON'S CALENDAR, NOT BY UTC'S --------------------------------------
   `submitted_at` is an instant, and in summer London is an hour ahead of it: 23:00 UTC on Sunday 4 Oct is
   midnight starting Monday 5 Oct in London — next week's — and 23:00 UTC on Sunday 27 Sep is the first
   minute of Monday 28 Sep, this week's. Eve's only other row is the week before. */
```

### ---------- 2a2. THE WEEK'S LATEST IS BY TIME, NOT BY ROW, AND A TIE IS THE LATER ROW

top level, before `b`

```
/* ---------- 2a2. THE WEEK'S LATEST IS BY TIME, NOT BY ROW, AND A TIE IS THE LATER ROW --------------------------
   THE REVIEW OF 9 OCT: every seed above was in time order with no two presses at one moment, so nothing
   pinned "latest" — `ms > J.at` for `>=` (the first of a tie wins) and the verdict taken from sheet order
   both stayed green. A tie is certain in use: one request's items share one `submitted_at`, and that is
   every offline flush and the whole queue a phone held until the backend could take it — wrong then
   right in one batch. The email must say what the child's card says (`submissionsBuild_` in doget.gs):
   the later row of a tie, and otherwise the latest PRESS (`pressed_at`), whatever row it is on. Eve,
   whose only other row is last week's, so these are her whole week:
     q:EVE-TIE    wrong then right, one `submitted_at`, no `pressed_at` (a row from before the column) → ✓
     q:EVE-REV    the later instant on the EARLIER row (right at 14:00, then wrong at 10:00)            → ✓
     q:EVE-PRESS  one flush (one `submitted_at`), pressed in the reverse of row order: wrong on Wednesday
                  on the first row, right on Tuesday on the second                                      → ✗
     q:EVE-PTIE   one flush, pressed in one instant, wrong then right                                   → ✓ */
```

### ---------- 2a. WORK CARRIED OVER FROM BEFORE THE SWITCH IS HISTORY, NOT THE WEEK IT ARRIVED (review of 10 Oct)

top level, before `b`

```
/* ---------- 2a. WORK CARRIED OVER FROM BEFORE THE SWITCH IS HISTORY, NOT THE WEEK IT ARRIVED (review of 10 Oct) ----------
   `subMigrate_` (js/submit.js) sends what a child had done before 9 Oct as one press per question, once, the
   first time the backend can take it — so those rows ARRIVE the week the backend lands, pressed weeks
   before, under an id made from the person and the key (`1791504000000-m` and fourteen letters). Read by
   arrival, the first email after the update said "Ada worked on 4 questions" with three from September.
   Eve's week here, every row arriving on the Thursday:
     q:EVE-CARRIED   carried over (pressed 22 Sep), nothing since   → not in the email at all
     q:EVE-BOTH      carried over (pressed 23 Sep), pressed again this week → in the list, this week's mark
     q:EVE-NEW       pressed this week only                          → new */
```

### ---------- 2b. THE QUESTION'S WORDS: CARRIED, REFUSED WHEN THEY ARE A MESSAGE, AND PRINTED

top level, before `b`

```
/* ---------- 2b. THE QUESTION'S WORDS: CARRIED, REFUSED WHEN THEY ARE A MESSAGE, AND PRINTED ---------------------
   *"emails all parents on work their child has done with the exact questions for each"*, and then *"should
   be at the end of the week that it send to parents all they done that week"* — so Sunday's email prints
   each question's `words`, and it gets them from this plan: this is where a practical's three boxes become
   one question's words and where phone text is turned away. The refusal is `digestWordsSafe_`, over the
   WHOLE text: `digestSafe_` reads `attemptLabel_(s)`, which is the first 120 characters, and a question
   with a link on its second line passes it. A refusal costs the words and never the question: it is still
   listed, by its number under its paper, and still counted.

   THIS ASKED, UNTIL 8 OCT, THAT SUNDAY'S EMAIL WAS THE SAME TO THE BYTE WITH AND WITHOUT WORDS — it listed
   names then. What that protected still holds and is asked below in its new shape: words never change
   what is counted, which questions are listed or under which paper — they only add what each one asked. */
```

### AND WORDS CHANGE NOTHING BUT THE WORDS — the question this file asked as "byte-identical" while the email listed names.

top level, before `g`

```
/* AND WORDS CHANGE NOTHING BUT THE WORDS — the question this file asked as "byte-identical" while the
     email listed names. With the column blank: the same subject, the same lead, the same papers and the
     same question numbers, each paper back to its line of numbers. */
```

### ---------- 2c. WHAT A QUESTION NEVER SAYS, RULE BY RULE — AND THE WHOLE LIBRARY THROUGH IT

top level, before `b`

```
/* ---------- 2c. WHAT A QUESTION NEVER SAYS, RULE BY RULE — AND THE WHOLE LIBRARY THROUGH IT ---------------------
   `DIGEST_WORDS_REFUSE` is wider than the name's rule, because the words are ten times longer and printed
   under "@family." in a parent's inbox: a domain with one letter before its dot, a dot that is not a full
   stop, a phone number, an account number, a sort code. Each one asked by itself, in the shape a person
   types it. And words go out only under a key in the library's own shape — an invented key is somebody
   typing into the sheet, and its "question" is whatever they typed. */
```

### EVERY QUESTION AND STEM IN THE LIBRARY, AS THE PHONE SENDS IT — and not one refused.

top level, before `plain`

```
/* EVERY QUESTION AND STEM IN THE LIBRARY, AS THE PHONE SENDS IT — and not one refused. The comment over
     `DIGEST_WORDS_REFUSE` says each rule was measured so; this measures it every run, so a rule widened
     tomorrow cannot quietly cost real questions their words in every parent's email. The text is the
     phone's own: `doneWordsPlain_` and the constants above it, read out of js/find.js and run over jsdom,
     then `attemptWords_`, as submitAnswer keeps it — the html and the lead of every question and preamble. */
```

### ---------- 2d. THE WEEK'S LIST: ONE STEM, ONE LIST, ESCAPED, AT MOST 80, AND UNDER GMAIL'S CLIP

top level, before `b`

```
/* ---------- 2d. THE WEEK'S LIST: ONE STEM, ONE LIST, ESCAPED, AT MOST 80, AND UNDER GMAIL'S CLIP -----------------
   `digestQuestions_` (backend/digest.gs) is the list, and these are its rules asked of the email a parent
   opens. A question's parts share a scene, printed ONCE above them, so Q5a, Q5b and Q5c read as the paper
   prints them rather than as one scene three times. A question first done before the week is in the same
   list with this week's mark, and says nothing of when it was first done (no "(again)" since 12 Oct).
   What came off a phone is escaped in the HTML and printed as written in the text. A week is up to seven
   days of this, so the list stops at `DIGEST_WEEK_LIST_MAX` (80) with "…and N more." — which counts the
   questions past the cap and the ones with no name alike — and 80 of the longest a question can be still
   come in under the ~102 KB of HTML past which Gmail clips a message and hides the footer that says how to
   stop. Read at the backend's own limits. */
```

### THE CAP, THROUGH THE REAL RUN'S PLAN:

top level, before `b`

```
/* THE CAP, THROUGH THE REAL RUN'S PLAN: Eve (whose only other row is last week's) did 85 named questions
     and 2 with no name. 80 are listed, in number order, and "…and 7 more." counts the five past the cap
     and the two that were never printable. */
```

### AND 80 OF THE LONGEST A QUESTION CAN BE STILL COME IN UNDER GMAIL'S CLIP:

top level, before `b`

```
/* AND 80 OF THE LONGEST A QUESTION CAN BE STILL COME IN UNDER GMAIL'S CLIP: each on its own paper of 110
     characters, its own stem past `DIGEST_STEM_SHOWN` and its own ask past `DIGEST_WORDS_SHOWN`, with a
     sprinkling of what `digestEsc_` grows. Rendered by the real `digestRender_`. Over ~102 KB of HTML Gmail
     shows "[Message clipped]" and the footer that says how to stop is behind it. The floor beside it is
     that the words really were printed at length — a render that dropped them would pass the ceiling. */
```

### ---------- 3. THE LABEL submitAnswer KEEPS

top level, before `b`

```
/* ---------- 3. THE LABEL submitAnswer KEEPS -------------------------------------------------------------
   The name a parent reads came off a phone, so the row keeps it by the email's own rule (`attemptLabel_`):
   tags out, spaces folded, capped. It was `markDone`'s to keep until 9 Oct, with a rule for filling a
   blank cell on a day already covered; a press is a row of its own now, written once with whatever name
   came with it, so that rule went with the upsert. */
```

### A TAB MADE BY HAND WITHOUT THE `label` AND `words` COLUMNS.

top level, before `b`

```
/* A TAB MADE BY HAND WITHOUT THE `label` AND `words` COLUMNS. `addRow` reports every key with no column
     and `jsonOut` makes that an error, so a name written regardless would answer "Nothing was saved for:
     submissions.label" over a row that was in fact written. The name and the words are the email's; the
     press must still save, and say it did. */
```

### A LABEL TURNED AWAY IS NOT REPLACED BY THE KEY.

top level, before `g`

```
/* A LABEL TURNED AWAY IS NOT REPLACED BY THE KEY. This fell back to a key in the library's shape
       (q:BEN-2) while the email listed names; with each question's words a raw key reads to a parent as
       a fault. The three whose text came off the phone — two labels and a key that is a sentence — are
       not printed at all, and are the "3 more". */
```

### THE `sent` WRITE FAILS AFTER THE EMAIL WENT — a sheet timeout on the one cell.

top level, before `b`

```
/* THE `sent` WRITE FAILS AFTER THE EMAIL WENT — a sheet timeout on the one cell. It was inside the
     same `try` as the send, so the `catch` wrote `failed` over the receipt and the next run emailed the
     parent again. It must leave `sending`, and a rerun must count that as sent. */
```

### A RUN THAT DID NOT FINISH THROWS.

top level, before `thrown`

```
/* A RUN THAT DID NOT FINISH THROWS. Google throws a trigger's return value away and emails the owner
     only on an exception, so a busy lock or a held email returned quietly was a run marked
     "Completed" — and a held email nobody noticed by next Sunday is never sent. */
```

### ---------- 5b. NO `submissions` TAB IS NOT A QUIET WEEK

top level, before `b`

```
/* ---------- 5b. NO `submissions` TAB IS NOT A QUIET WEEK ---------------------------------------------------------
   THE OWNER'S LEDGER HAD NO `attempts` TAB UNTIL 6 OCT, and `read` answers a missing tab with no rows —
   so the run planned nothing, wrote nothing, and the Preview said "Nobody has done a question yet this
   week" over a sheet that had never been told what anybody did. The same is true of `submissions`
   until `ensureSchema` makes it: the run must stop and say why, send nothing, write nothing, and throw
   from the trigger so the owner is emailed the reason. */
```

### (g) ONE TRIGGER, AND ONLY ONE (18 Oct, docs/history/352) — the owner:

top level, before `b`

```
/* (g) ONE TRIGGER, AND ONLY ONE (18 Oct, docs/history/352) — the owner: *"9pm on Sunday should be the only
     time trigger."* It booked the email and two AI marking passes beside it (nightly at 02:00, and a run-up on
     the Sunday) from 12 Oct. Now, run once, three times, and at the hour 0: the email's trigger and nobody
     else's of this file — not one `digestMarkRun`, nightly, weekly or one-off — and the way back leaves only
     what was not the email's. */
```

### WHAT NOTHING RUNS ANY MORE GOES WHEN THE SUNDAY IS BOOKED — and by the way back too.

top level, before `seed`

```
/* WHAT NOTHING RUNS ANY MORE GOES WHEN THE SUNDAY IS BOOKED — and by the way back too. The email after each
     session was booked from the editor as an hourly trigger on `sessionRecapRun` (gone since docs/history/295);
     the marking pass was booked as `digestMarkRun`, nightly, on the Sunday, and as one-offs in its run-up (gone
     since docs/history/352). Left booked, each fails every time it fires and Google emails the owner each
     failure. So `installWeeklyDigest` and `removeWeeklyDigest` take those away — by those exact handler names,
     written out here rather than read from `DIGEST_RETIRED_RUNS`, so a misspelling there is red — with the
     Script Properties the marking pass kept, touch no other trigger, and say how many. */
```

### NOT ONE CALL, anywhere, to what books or runs it — its own declarations and the run's one caller aside — AND NOT ONE BARE MENTION, which is a call waiting to

top level, before `c`

```
/* NOT ONE CALL, anywhere, to what books or runs it — its own declarations and the run's one caller
     aside — AND NOT ONE BARE MENTION, which is a call waiting to happen: `sunday: installWeeklyDigest,`
     in RUNNABLE calls nothing in the text and books the Sunday from `?run=sunday`. `calls`, `mentions`
     and `unquote` are check-mail-load.js's. */
```

### AND `words: true`, THE DEPLOYED VERSION'S OWN WORD THAT IT PRINTS EACH QUESTION'S WORDS — a version older than that answers without it, and that is the whole

top level, before `d`

```
/* AND `words: true`, THE DEPLOYED VERSION'S OWN WORD THAT IT PRINTS EACH QUESTION'S WORDS — a version
       older than that answers without it, and that is the whole of the contract, whoever asks. This said
       "the card tells an older version apart by it" until 12 Oct, when the Settings card that read it was
       deleted (docs/history/346); the action and its answer stayed, so the rule is the server's now. */
```

### THE STUBBED WORLD OF THE SUNDAY OF 18 OCT (written for the marking pass of 12 Oct, kept for the email's checks):

top level, before `SUN18`

```
/* THE STUBBED WORLD OF THE SUNDAY OF 18 OCT (written for the marking pass of 12 Oct, kept for the email's checks):
   `UrlFetchApp` answers the library's URL with an invented library in the file's one-row-a-line layout and
   records every Gemini ask (`net.asks`) — there must be none; `Utilities.sleep` moves the clock. Every person
   is invented and every PIN is 0000. */
```

### ---------- 9. THE EMAIL PRINTS EACH VERDICT AS IT WAS RECORDED, AND MARKS NOTHING (18 Oct, docs/history/352)

top level, before `w`

```
/* ---------- 9. THE EMAIL PRINTS EACH VERDICT AS IT WAS RECORDED, AND MARKS NOTHING (18 Oct, docs/history/352) ----
   The owner: *"Marking? Why marking? It's already marked when they submit the questions? Don't be silly. The
   marking is already done on each question."* From 12 Oct a server pass marked `sent` answers with Gemini
   before the email; it is gone. Through the real `weeklyDigestRun` at 21:02 on the Sunday, WITH a key in
   Script Properties and the library served — everything the old pass needed, so its absence is what is
   asked: ✓, ✗ and the AI's marks print as recorded, a `sent` answer prints "not marked", no Gemini call is
   made (the stub records every one), and not one row is added to `submissions`. */
```

### ---------- 10. (f) THE EMAIL HOLDS ONLY WHAT A PARENT NEEDS — through the real send

top level, before `w`

```
/* ---------- 10. (f) THE EMAIL HOLDS ONLY WHAT A PARENT NEEDS — through the real send ---------------------------------
   The owner: *"they dont need to see usernames or whatever, all they need to see are the questions their kids
   have done this week ... i want them to see if they got it right too."* The message MailApp is handed —
   after `mailOut_`'s net, which on a screen turns a child's whole name into "Kit (@handle)" when two children
   share a first name. Kit's week has a question whose words name him in full, and there is another Kit. */
```

### THE HOUR BOOKED AND THE CELL APART (18 Oct):

top level, before `moved`

```
/* THE HOUR BOOKED AND THE CELL APART (18 Oct): the owner moved weekly_digest_hour from 18 to 21 on the day,
     over triggers booked at 18. Apps Script cannot read a trigger's hour, so the setup check prints the hour
     installWeeklyDigest wrote down, and WARNS in words while the cell says another; run again, it agrees. And
     triggers booked by a backend from before the record (no hour written down) are said to be unknown, never
     taken for the cell's. Changes nothing, as ever. */
```

### ---------- 13. EACH QUESTION AS IT IS ON THE SITE, WITH ITS PICTURE (18 Oct, docs/history/351)

top level, before `crypto`

```
/* ---------- 13. EACH QUESTION AS IT IS ON THE SITE, WITH ITS PICTURE (18 Oct, docs/history/351) -------------------
   The owner, 18 Oct: *"So each question As is on site."* — and *"No jpgs."* A question the library has is printed
   from its row through the real send, as the card draws it: the preamble its parts share ONCE in the paper, its
   picture where the row says, each part's number and marks over ALL of its words — never cut, never "…" — then
   how the child did. The row's markup through the allow-list: no attribute but colspan and rowspan, no link, no
   script, no image of its own. A picture is the PNG twin on the site, named by the SHA-256 of the drawing
   (tools/diagram_png.js), at the drawing's width with its aria-label as alt — and the plain body says the alt.
   A key the library does not have goes as its words cell, as before. And a week of whole papers stays under
   Gmail's clip with every question in it, the longest source texts said as "on the site". */
```

### UNDER GMAIL'S CLIP, EVERY QUESTION KEPT.

top level, before `b`

```
/* UNDER GMAIL'S CLIP, EVERY QUESTION KEPT. Eighty parts, each on its own paper under its own 3,000-character
     source: whole, that is past 102 KB. The longest sources go as "(the source text is on the site)" until the
     HTML is under DIGEST_CLIP_BYTES; every part keeps its whole words, its number and its mark, and the footer
     is there. And eighty parts of 2,000 characters each, which no source can save: the longest parts' words go
     too, and still every question is listed with its number and its mark. Rendered by the real `digestRender_`. */
```

### ---------- 12. THE DRY RUN (check/digest-dry.js) STILL RUNS, SENDS NOTHING AND WRITES NOWHERE IT MAY NOT

top level, before `os`

```
/* ---------- 12. THE DRY RUN (check/digest-dry.js) STILL RUNS, SENDS NOTHING AND WRITES NOWHERE IT MAY NOT ---------
   The lead runs it on the real sheet before a Sunday; a tool nobody runs between Sundays is a tool that has
   rotted by the next one. An invented dump and the invented library above, in the system's temp folder. */
```

