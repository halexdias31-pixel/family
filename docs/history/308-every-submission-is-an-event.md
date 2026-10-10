## Every submission is an event, and the card says how the latest one went — never the day

**The owner, 9 Oct:**

> *"The kids don't need to see the day they did something. Just whether it's right or not. Also I just
> want system to record each submition. So like if they submit a correct answer then change it and
> submit an incorrect answer, that's 2 events. And it will leave the latest event up, so they would see
> incorrect answer there next time they login. Simple. Instead of each question just saving number of
> attempts."*

### What changed

| Before | Now |
|---|---|
| The card said `Done 4 Oct` beside the star (268, 269): the day a question was last touched — the first keystroke counted. | **The card says how the LATEST submission went**, in the same slot: "Correct" (tick), "Not yet" (the turning arrow), "Sent" (nothing marked it) or the AI's "3/4". Nothing for a question never sent. **No card says a day.** |
| `attempts`: one row per person per question — `first_done`, `last_done`, `times` — upserted by `markDone`, sent on the first keystroke of the day and backfilled from the phone on every load. | **`submissions`**: one row per PRESS — `person_id, key, label, words, answer, verdict, submitted_at, event_id, pressed_at` — appended by `submitAnswer` and never updated or deleted. Right, then wrong, is two rows, and the later PRESS is the latest (`pressed_at`, added after the review — below). |
| A typed, picked or ordered answer went to the account as it was typed (`saveAnswers`, 296), and came back as a draft on the next device. | **An answer reaches the account when it is SENT.** The next device opens the box on the latest answer sent, with its verdict on the verdict line. An answer typed after the last Send stays on THAT device, with no verdict, until it is sent — the line under the box says *"On this device until you send it"*. Drawings (the pen, ringed words) have no Send and go up as they are drawn, exactly as before. |
| A box with no scheme and no AI had no button — typing was saving. | **Every box has a way to send**, signed in: Check where there is a scheme, Mark with AI where it is on, and otherwise a **plain Send** (`qp-send`, verdict `sent`) — about 399 maths answers with no scheme, every worded one while AI marking is off, and each of a practical's three worksheet boxes. When AI marking goes off mid-visit its tile becomes the plain Send where it stands. |
| The weekly parent email listed the questions a child "worked on", new and gone back to, by first and last day. | **It reads the week's submissions**: one line per question however often it was sent, grouped by paper with its words exactly as before, and each with **the week's latest verdict as a mark** beside its number — `Q4a ✓`, `Q5a ✗`, `Q5b sent`, `Q7 3/4`. "(again)" now means it was also sent before the week began. Everything else (who gets it, the switch, the Sunday hour, the caps, the privacy rules) is unchanged. |

**What a submission is** — a press that asks for a verdict, and nothing else: Send on a typed or maths
answer (Check), a pick that completes a multiple-choice card (marked at once; an option the scheme
never settled is `sent`, and every pick that completes it again is another event), Send on an ordering
(a row with a hole is "Put all 5 in the row first", not a submission), Mark with AI coming back with
marks (`ai:2/3`), and the plain Send. Typing is not one, an item placed in an ordering is not one, and
"Write something first" is not one.

### The backend (`backend/dopost.gs`, `backend/doget.gs`, `backend/digest.gs`)

- **`submitAnswer`** (`self`): the person is the token's, whatever the body claims; under the script
  lock; **a press already on the sheet (same `event_id`) is not written again** and is answered as saved
  with its own time, so a send whose reply was lost is one row; a verdict outside
  `right|wrong|sent|ai:N/M`, an id not in the phone's shape, an empty answer or one over
  `ANSWER_TEXT_MAX` is refused whole and left out of the reply; the answer is written with a leading
  apostrophe so `3/4`, `0.50`, `2,4` and `=1+1` come back exactly; the name and words go through the
  email's own `attemptLabel_` / `attemptWords_`; `submitted_at` is the server's clock, and `pressed_at`
  the phone's moment of the press, never later than the server's; 25 a request (`SUBMISSIONS_PER_POST`).
  It retires no payload, and it reads two columns of the tab, not the tab (after the review, below).
- **`DATA.submissions`** = `{ for, mine: { <key>: { answer, verdict, at, id } } }`, the token's
  person's latest per question, laid on every payload fresh (`payloadWithFresh_`, never in the stored
  body) and on the sign-in reply. An admin also gets `people` — per learner, how many questions and the
  day of the last — which keeps the people column's `12 questions · last 4 Oct` (269, *"so a tutor can
  see it"*). Nobody else's answers ever.
- **Not a read of the whole tab on every load.** The tab grows by a row a press, with words of up to
  1,200 characters. Each person's `mine` (and the admin's summary) is kept in CacheService under the
  payload's generation, the backend's version and a per-person stamp that `submitAnswer` moves after its
  rows are flushed — so the tab is read once per person per press, not once per page anybody opens. A
  stamp rather than a `remove`, because a load that read the tab a moment before a write would otherwise
  put its stale copy back a moment after.
- **`attempts`** is out of `TAB`, `WHERE` and `SCHEMA`, and `markDone` out of `ACTION_ACCESS` and the
  features list, with `attemptWords`. A phone still on the old code sends nothing to a tab nobody reads.
  **The live tab is left where it is** — `ensureSchema` only adds.
- **The weekly email** (`digestPlan_`) folds the week's presses into one line per question by London's
  calendar (23:00 UTC on a summer Sunday is next week), takes the week's last press as its mark, a
  press before the week as "(again)", and the latest name and words any of its rows carries.

### The phone (`js/submit.js`, new, after answers.js)

`subRecord_` makes a press an event — its own id (`<ms>-<six letters>`), the library key, the name and
words for the email (`doneLabel_` / `doneWords_`), the answer and the verdict — into a queue kept per
person in `localStorage` (`subQ:u:<id>`), and into this device's copy of the latest per question
(`subLast:u:<id>`). `subPush_` sends at once, again with backoff after a refusal (the same ids), and with
`keepalive` as the app goes away — and only to a backend whose features list `submitAnswer`, so the site
going live before the Apps Script pull loses nothing: presses wait on the device and go up the first time
the backend can take them. `subAdopt_` lays the account's latest over this device's on every payload and
at sign-in: a press made on the computer since is the latest here too, and fills the box — unless a
finger is in it, or something was typed here after it (a draft, by this device's clock; the answer this
device itself last sent is never mistaken for one). Sign-out clears the payload's copy and the visit's
memory; presses still to go up wait under their own person's key.

**Why a tick and an arrow on the card, not ✓ and ✗.** The card's slot speaks with the verdict line's
own voice and marks — the house rule in style.css is that "not yet" never wears a cross, because these
are practice sheets a child works through alone and a cross reads as final. The parent's email, read
by a grown-up at a glance down a list of numbers, uses ✓ and ✗.

### Decided along the way (the plan's three open questions)

1. **A plain Send on every box nothing can mark**, not only worded answers with AI off: once typed
   answers stopped syncing as drafts, a maths box with no scheme or a worksheet box would otherwise never
   reach the account at all.
2. **The admin's people line stays**, from a summary of `submissions` (counts and a day, no answer), so a
   tutor can still see how a learner is getting on. Remove `people` from `submissionsFor_` and
   `subsLine_` to drop it.
3. **`event_id` is a column.** Without it the server cannot tell a retried send from a new press.

### Not done, and known

- **Right and wrong are the phone's word.** The library and its schemes are on the phone, not the server;
  `submitAnswer` checks the verdict's vocabulary, not its truth. Mark with AI's marks are recorded by the
  phone too (the server already clamps them in `aiMark`). Nothing is paid or ranked on them.
- **What was done before the deploy** is carried across once per person per device (`subMigrate_`,
  below) — but only what is still on a device: a question done on a phone that is never signed in again
  after the switch stays a blank card until it is sent again. Old typed drafts on the `answers` tab (if
  a backend ever had one) are not read back.
- **A press queued offline and sent late is in the week it ARRIVED** for the email (`submitted_at`),
  though it is ordered by when it was pressed. Sunday presses after the 18:00 run are in nobody's email,
  as before.
- **Two devices migrating the same question with different answers** write it once — the first to arrive
  (one id per person and key). The other device keeps showing its own answer and verdict, the account
  the first; the next press of that question on either device settles it.

### Checks

- **`js/check-submissions.js`** (new, on the roster; `check-attempts.js` deleted with the tab), through
  the real `doPost` / `doGet`: a row per press, right then wrong two rows and the later the latest; a
  retried id one row, in one request or two, and another child's id their own; the token's person over
  `body.personId`; refused verdicts, ids, empty and over-cap answers; text in, text out (`3/4`, `1/2`,
  `0.50`, `2,4`, `=1+1`, `+44`, `007`, `TRUE`); the name and words by the email's rules; the cap of 25;
  no token and `markDone` refused; who gets what — the learner their own latest, the admin a summary and
  no answer, a stranger and a `?person=` spoof nothing, on a miss and on a hit; the sign-in reply in the
  payload's shape; the features; no payload retired, the stored body without `submissions`, a cache hit
  fresh; the tab not read on a second load, read again after a press and after a hand edit; and nothing
  in `backend/` or `js/` reading or writing `attempts`, `markDone` or `attemptWords`.
- **`js/check-digest.js`** reseeded with submissions: the week's latest verdict per question (not the
  week's first press, not next week's), London days not UTC ones, every mark (✓ ✗ sent 2/3) in text and
  HTML, "(again)" from a press before the week, the latest words of a practical's boxes, the
  no-submissions-tab stop, the old `attempts` tab not read — and every protection it asked before.
- **`js/check-saved-answers.js`**: the sign-in reply carries the child's latest submissions, nobody
  else's, and no `attempts`.
- **`js/check-flow.js`**: five journeys replace the eight about dates and the backlog — the verdict beside
  the star for the person signed in alone (and never a date, signed out none, private mode held for the
  visit, a box nothing marks has its own Send and is not `.qp-check`); right, edited, wrong as two events
  with the draft kept on the device and not sent, a fresh device opening on the wrong answer with "Not
  yet", the account's old drafts never read back, a press from another device before and after a draft;
  a pick, an ordering, Mark with AI and a worksheet box each one event while a drawing still syncs;
  presses kept until the backend can take them, a refused send retried under the same ids, a lost reply
  one row, `keepalive` on `pagehide`; and every press carrying the question's own words and the name a
  parent reads. The AI journey asks that AI going off leaves a Send; sign-out and sign-in ask for
  submissions where they asked for dates; the ordering's Send is a recorded submission.
- **`check/states.js`**: three cards — last got right, last got wrong, last sent unmarked — each measured
  by `check/ui.js` at every width; the ordering states clear the verdict they leave behind.

Every new rule was broken on purpose and seen red for its own reason, and the real files seen green
again — 50 mutations: 19 against check-submissions (a retry written twice, the gate opened to `anyone`,
the answer not text, any verdict taken, the first press the latest, everybody sent the summary on a hit,
the stored body keeping submissions, a press bumping the generation, the cache ignoring the stamp, the
tab read on every load, `markDone` back in the features, no cap, the ceiling gone, the sign-in reply
without submissions, a phone file posting `markDone`, the name kept raw, the summary counting presses,
the stamp not moved, a digest reading `attempts`); 8 against check-digest (the week's first press as its
mark, a press after the week counted, UTC days, no ✓, no AI mark, no "(again)", a blank later name
blanking an earlier one, the no-tab stop gone); 1 against check-saved-answers; and 22 against check-flow
(Check, the AI and a completing pick not recorded, a payload for somebody else read, drafts still synced,
the account's press over a later draft, the slot signed out, the plain Send as `.qp-check`, a refusal
dropping the queue, sign-out keeping the payload's copy, a holed ordering recorded, the sign-in reply not
adopted, a verdict on an edited answer, a press without its name, no `keepalive`, one drawer for every
person, old drafts read back, no plain Send on a box or a worksheet, no Send after AI goes off, a date on
the card, the queue sent to a backend without the action).

**The worksheet's Send stands beside each box**, as Send does at the chat bar, not on a row of its own:
three 48px rows took the worksheet at 320 to the 70% floor and into a scroll in the first shots.

## After the review, and the merge with the essay sheet, autosave and keep-Find (10 Oct)

The branch was merged with the integration branch before the review's findings were applied, so the
rules notes 312, 317 and 318 set hold with submissions in. **The four stamps are
`2026-10-09-e-submissions`; `--css-version` is `2026-10-10-e-submissions`.**

### Where the merge needed more than both sides

- **AN ESSAY'S MARK WAS NEVER RECORDED.** 312 keeps an essay's AI mark with its words (`aiKeep_`) and
  returned before this note's `subRecord_` — so the forty-mark answers the sheet exists for were the one
  kind never sent to the account. Now every Mark with AI records its press, the essay's included, with
  the words that were marked.
- **THE ESSAY'S VERDICT LINE HAS TWO SOURCES**, the kept mark (this device, with its points) and the
  latest submission (any device). `subVerdictPaint_` draws the kept mark when it is about these very
  words, or when no submission is; a submission about the words in the sheet that is not the kept mark's
  is the newer reading, and the old points come off the screen (they stay kept, for an Undo back). An
  essay with AI marking off has the plain Send, and the faint line still says why nothing marks it.
- **`SUB_ANSWER_MAX` WAS STILL 2,000** after 312 raised `ANSWER_TEXT_MAX` to 20,000 on both sides, so
  every essay over about 350 words would have been "too long to send". It is 20,000.
- **`ansOnAccount_` (317) ASKED "STAMPED AND NOT DUE"**, and since this note a typed answer is stamped on
  every key and never due: a draft the store refused counted as on the account — no "Not saved" under
  it, no "Leave site?" before a reload. A typed answer is on the account only as it was sent: the latest
  press holds exactly it, and the server has it.
- **318's claim made a claimed typed answer due** as a draft. It is this person's draft on this device
  now, never sent as a draft and never as a submission nobody pressed (`ansSyncs_`). **No signed-out
  answer becomes a submission except through `ansMayMove_` to its person**: the claim and `ansRead_` are
  the only doors to `ans:u:<id>:`, and both ask it; the migration below reads that key alone. A press made
  signed out is the visit's, and is not carried into anybody's account at sign-in.

### The review's six

1. **"Latest" was arrival order — FIXED.** The rollout itself would have inverted it: presses queue on
   every device until the owner's Apps Script steps, so the iPad's Monday "wrong" arriving after the
   computer's Tuesday "right" became the latest everywhere, and was written over the computer's box. The
   phone sends the press's own `at`; the server keeps it as **`pressed_at`** (ISO text, clamped to its
   own clock — `answersUpsert_`'s rule), answers with it, and `submissionsBuild_`, `digestPlan_` and the
   phone order by it, the later row breaking a tie. `submitted_at` stays the arrival, and still decides
   which WEEK a press is in for the email (a phone's clock is wrong on enough iPads). A row with no
   `pressed_at` falls back to `submitted_at`.
2. **Every press read the whole tab under the lock — FIXED.** `readCols_` (core.gs) reads the header and
   one column at a time; `submitAnswer` reads `person_id` and `event_id` alone, and the whole of a row only
   for a retried id; a load reads seven columns and never `label` or `words`.
3. **The keypad's gold Send (and Enter) sent nothing on a plain-Send box — FIXED, the blocker.**
   `kpDone_` runs the box's own control, from `inp.closest('.qp-mark')`: Check, else the plain Send, else
   Mark with AI while it can be pressed. An essay's key still says "done" and sends nothing (312: Mark
   with AI spends a mark; the essay is sent from its tile row).
4. **"Sent" survived a letter after AI went off mid-visit — FIXED.** `subVerdictPaint_` keeps the
   "AI marking isn't switched on" line only while the line still says it (`aiOff_` writes what it said
   on the box); a verdict that replaced it comes off with the next key, as on every box.
5. **The Preview card could not tell a backend from before submissions — FIXED.** A reply with `words`
   and no `submissions` (the old backend says `attempts:`) is told first, in bold, that the live web app
   still reads the attempts tab: sync, `ensureSchema`, New version.
6. **Nothing pinned the email's "latest" — FIXED.** check-digest seeds a tie (wrong then right, one
   instant → ✓), the later instant on the earlier row (→ ✓), one flush pressed in the reverse of row order
   (→ the later press), and asks that the card's `submissionsBuild_` says the same for every one.

### Decided after the review, from a count-only read of the live Ledger

The server had 55 `attempts` rows for 5 learners and no `answers` tab; the live backend is a week old; a
child's typed answers exist only on their devices, under `ans:u:<id>:<key>`.

- **No replacement spreadsheet.** The owner updates in place. **`seedOptions` rewrote the options tab on
  every `ensureSchema`** — the code's four lists rebuilt, every other row closed up under a `focus`
  column that did not move with them, every value through `S()` — over 145 rows the owner has edited.
  It only adds now: a code-owned value a list is missing is appended at the end of that list's numbering,
  and no row is rewritten, moved or removed; a second run adds nothing. `ensureSchema` reports
  `added: …` where it said `rewrote: …`.
- **A one-time migration per device per person** (`subMigrate_`, js/submit.js): on a signed-in load,
  once (`subMigrated:u:<id>`), every question this person had DONE before the change — a `done:u:<id>:`
  date on the device, or a row of their own in an old backend's `DATA.attempts` — that holds their own
  non-empty answer and has no account submission becomes ONE submission, marked by the site's own marker
  (`orderSeq_`/`markOrder_`, `choiceRight`, `markAnswer_`, else `sent`), dated by the answer's last edit
  (else noon on the day it was done). A key not in the library, an empty answer, a holed ordering or a
  short pick, and a draft never done are not sent; it waits, unflagged, for the library and for the
  account's copy. The id is made from the person and the key (`subMigrateId_`, `1791504000000-m…`), so
  two devices or two runs write it once. Under an old backend the presses queue and go up the first time
  the backend lists `submitAnswer`.
- **The empty guard**: a submission whose answer is empty is nobody's latest and never written over what
  a box holds (`subAdopt_`).
- **The attempts tab stays in the sheet as an unread archive.** No sent rows are invented for it, and
  nothing writes it.

### Checked

- **check-submissions** (64 rules): `pressed_at` — the rollout's inversion, a fast clock clamped, no
  clock is now, a tie, a row from before the column ordered by its arrival; the two-column read under
  the lock, a retry's one row, a load never fetching `label`/`words` (every `getValues` on the tab
  recorded by its shape); and `ensureSchema` over an owner's options tab (subjects with a kind each, a
  blank row, a reworded and reordered code list, a value of theirs, a number) — every row as it was, the
  code's missing values appended once, a second run adding nothing, and `pressed_at` added to a
  `submissions` tab made by the first version, its press untouched.
- **check-digest** (82 rules): the tie, the reverse, the flush pressed out of row order, the tie in one
  instant — in the plan, in the email's marks, and against `submissionsBuild_`.
- **check-flow**: the keypad's gold Send and Enter on a maths box with no scheme, on the second of two
  worksheet boxes (only it sent), and on a Check, and an essay's "done" and Ctrl+Enter sending nothing;
  the migration over real library rows (an ordering, a pick of two, a maths answer with a scheme and one
  without) — the four sent with their verdicts and deterministic ids, the draft never done, the empty
  answer, the key the library has not got and the question the account has all left, the brother's keys
  and a signed-out answer untouched, nothing more on a second load, a reload, a second device after the
  first, and the same ids from a device that loaded before the account had them; an old backend's
  `attempts` queued and sent once the backend can; the empty guard; "Sent" then a letter after AI went
  off; a refused typed draft "Not saved" and at risk until sent; the essay's AI mark recorded whole; and
  the Preview card told a backend before submissions is old.
- **Mutations, each red on its own and the real files green after**: ordering by arrival, no clamp, no
  fallback to `submitted_at`, the whole tab read by a press, the whole tab read by a load, the old
  `seedOptions`, `seedOptions` without its guard (check-submissions); `>` for `>=`, the verdict by row
  order, `pressed_at` ignored (check-digest); `kpDone_` with Check alone, the essay's key sending, a random
  migration id, no empty guard, the old `is-off` return, the Preview not asking for `submissions`, the
  essay's mark returning before the record, `SUB_ANSWER_MAX` back at 2,000, `ansOnAccount_` without the
  submissions rule (check-flow). One stays green, and is meant to: the migration skipping a key the
  account has (`mine[key]`) is a second line behind `subAdopt_`, which lays the account's latest into
  the device's copy first.

## After the loader landed: the second review (10 Oct)

The branch was built against the integration branch before the one loader (306) landed, so the two met for
the first time in this merge. Eight findings, each reproduced first (the verifier's journeys and probes),
fixed at the rule, held by a check that is red on the commit before and green after, and broken on purpose.
**The four stamps are `2026-10-10-f-submissions`** (the backend changed); `--css-version` is unchanged —
no rule in style.css moved.

1. **A signed-out draft became the child's submission at sign-in — FIXED.** `signedIn_` claims every
   signed-out answer (318: the later edit wins) and then `subAdopt_` runs the one-time carry-over, which read
   the box: Ada's 5 Oct "0.0197" (right) was replaced by a "5" somebody typed signed out, and "5" went up as
   her press — "Not yet" on her card, ✗ in the email, dated today, and her right answer never on the account.
   The same with the payload still out at the sign-in (the pass waits for the library, the claim does not),
   and for a box typed in before the pass could run (Saved draws a kept card before the payload). Two rules
   in `subMigrate_`: **an answer last edited after the end of its `done:` day is a draft** (the old code
   wrote `done:` on every day a box was touched, by the same clock as `ansAt:`, so nothing it left is
   stamped later), and **what the claim wrote over is read instead of the box** (`subClaimOver_` keeps it
   under `subBefore:u:<id>` through `keepPut_` as a record, until the pass has run). The verifier's reorder
   of the two calls in `signedIn_` was not taken: with the claim's copy read first the order cannot matter,
   and one path is one thing to keep right. The migration journey's fixture said "done 5 Oct, edited 6 Oct
   15:00", which the old code could not leave; it says done 6 Oct now.
2. **Sign out did not send the presses — FIXED.** It waited for the drafts and the notepad, not for
   `submitAnswer`: a Check just before Sign out was refused on the ended token, and a second Check queued
   behind the first was forgotten by `subForget_`. `subDrain_` (js/submit.js), started before `signedOut_`
   with the person, the token and whether the backend takes presses: the request in flight, then what is
   still queued, on that token, replies laid on as `subPush_` lays them (`subApply_`, now shared), a few
   requests at most; `signOut` waits for it.
3. **A queue the store refused was lost — FIXED.** The write fell into a memory copy nobody read (a nearly
   full store answers reads with the old list instead of throwing), the carry-over flagged itself done
   over it, and the `q` left on the latest kept that press as "the latest there is" over a later one from
   the computer, for good. The queue goes through `keepPut_` and is read through `keepHeld_` first (held
   for the visit, the splash gives way, written again as the page goes, "Leave site?" while only the page
   has it); `subMigrate_` flags itself done only when the queue and the latest were both kept; and
   `subRequeue_`, on every adopt, puts a press marked to go that the queue has not got back in the queue
   under its own id — and lets a later press from another device be the latest here, as it is on the
   account.
4. **Before the payload, a box the account holds said "On this device only" — FIXED.** `ansSavedSay_` and
   `ansOnAccount_` asked `DATA.features` first. A press the server acknowledged (`q` off) holding exactly
   the box is "Sent to …" whatever the payload has said (`ansSentHere_`); the lines that depend on which
   backend it is ("Sending…", "until you send it", the drafts' lines) say nothing while `awaiting_()`.
5. **Before the payload, an essay with AI marking on offered a plain Send — FIXED.** `aiOffered_` read a
   missing `features` as off, so the sheet drew Send and "AI marking isn't switched on yet", and a press
   recorded the forty-mark essay as an unmarked `sent`. `aiUndecided_` (keypad.js): while the payload is
   out the tile is Mark with AI where it will stand, `disabled`, with no sentence; the payload's repaint
   draws the tile it decided on. **And where there is no repaint, it is decided in place** (`aiDecided_`,
   called from `adoptMarks_`): Find is held back from a repaint while a child types in it (`findKeep_`),
   which is exactly the child who searched for the essay and started writing inside the fifteen seconds —
   her tile would still have been the waiting one when she reached for it. With AI marking on, the waiting
   tile is the very tile a fresh drawing draws, so it is let go where it stands; off, the plain Send and
   its sentence are a different row, drawn by the repaint the held column has booked.
6. **The owner's step 2 offered `/exec?setup=1` before New version — FIXED, in the words.** Until step 3,
   /exec is the 7 Oct code, whose `ensureSchema` rewrote an owner-shaped options tab and made no
   submissions tab (the verifier's probe on `8cd8323`). Step 2 now says the editor, and why not /exec;
   309's step 3 said nothing needed running because "the first request runs ensureSchema by itself", which
   doGet has not done since the schema work came off the page load — corrected, and so are the setup.gs
   header, the `?health=1` advice and two MIGRATIONS comments that said the same. The weekly email card's
   "old backend" sentence names the editor too.
7. **A slow clock made an older answer the latest — FIXED.** `pressed_at` was clamped against a fast clock
   only. The phone sends its clock as it sends (`sent`, `subBody_`); `submissionsAppend_` moves every press
   in the request by the server's now less that, before the clamp. A phone without `sent` is held as
   before. The reply carries the corrected time, so the phone keeps the server's order.
8. **Carried-over work was "this week" in the first email — FIXED.** A row with the carry-over's id
   (`SUBMISSION_CARRIED`, constants.gs) is history in `digestPlan_` — never this week's, and what makes a
   press of the same question this week "(again)" — and the admin's people line dates it by `pressed_at`.

**Not changed, and worth knowing.** The draft rule in `subAdopt_` still compares this device's edit time
with the account's (server-corrected) press time, so a device whose clock is far behind can still have a
draft typed after another device's press taken for older; the press itself is now ordered right. A press
queued normally (not lost) still wins over the account's on its own device until it goes up — it is about
to. And when the claim writes over a done answer, the claimed words stay in the box as a draft: the card
says how the carried press went, and the line under the box says the draft has not been sent. The
done-day rule is a day wide: a draft typed into a box on the SAME day the old code last touched it — the
front end updating mid-afternoon on a day the child had already worked — is still carried as a press.
It needs the update, the old work and the new draft inside one day on one device; the claim's case, the
one measured, does not depend on the rule at all (`subBefore:` is read first).

### Checked

- **check-flow, six new journeys and one fixture corrected** (`FLOW_ONLY=submission`, 18 journeys): the
  carry-over over a claim from nobody (the live backend and the new one), with the payload landing after
  the sign-in, and over a box typed before the pass; a queue the store refuses (Check sent; the carry-over
  not flagged over it — the queue refused, and the queue and the latest; a press left marked to go queued
  again beside a later "Not yet" from the computer); Sign out sending the press in flight and the one
  behind it on its own token before `signOut`, and nothing of Ada's on Ben's; the line under three boxes
  before and after the payload; the essay and a worded box before and after a payload with AI on and with
  AI off, and the cards drawn before it let go in place; and `sent` on every request.
- **check-submissions** (80 rules): a slow clock's press is the latest and comes back corrected, a queued
  press keeps its hour, a fast clock's press keeps its minute, no `sent` (or nonsense) is as before; the
  admin's line dates carried work by when it was done; and every owner section in docs/history — no step
  before a New version opens `?setup=1`, none says the first request runs `ensureSchema` by itself — with
  the code they describe (an ordinary request runs it 0 times, `?setup=1` once).
- **check-digest** (84 rules): carried work is not this week's, makes this week's press "(again)" with
  this week's mark, and the email counts two.
- **Red on the commit before (949604e with only the new checks and the old notes)**: 6 of the 18
  submission journeys, 7 check-submissions rules (the four clock rules, the admin's line, 308's step 2,
  309's step 3) and 4 check-digest lines — each for its own finding.
- **Fifteen mutations, each red alone, the real files byte-for-byte green after** (a harness that swaps
  one exact string, runs the one narrow check, and puts the file back): the done-day rule removed (the box
  typed before the pass went up as "5"); the claim's copy never kept (0.0197 not carried, three ways);
  Sign out not waiting for the drain (`submitAnswer → signOut → submitAnswer`, both left queued); the drain
  without its explicit token (a press on no token); the queue read without `keepHeld_` (nothing sent,
  "Sending…"); the flag written over a refused write (the queue and the latest refused); `subRequeue_`
  doing nothing (the next load, and the press left marked to go); the acknowledged-press line removed;
  the `awaiting_()` gate removed (the draft and the queued press "On this device only"); `aiUndecided_`
  false (the plain Send, "switched on yet", an unmarked essay queued); `aiDecided_` not called (the cards
  drawn before the payload still waiting); `sent` not sent; the skew not applied; the digest's carried
  rule removed; the summary by arrival.
- `check.js`, `check-const`, `check-backend`, `check-tabs`, `check-columns`, `check-rows`, `check-access`,
  `check-post`, `check-payload`, `check-saved-answers`, `check-drafts`, `check-loading`, `check-prefs`,
  `check-marking`, `check-doors`, `check-css` green; the whole of `check-flow` (272 journeys) green;
  `check/ui.js --screen=stuff` (615 combinations, nothing new) and `check/press.js --screen=stuff` (49
  presses, 95 swipes) green.

## 10 Oct: `ensureSchema` could not have finished on the live Ledger

Found while building the updated spreadsheet the owner asked for. The owner's sitting below would
have stopped at step 2 with *"The coordinates of the range are outside the dimensions of the sheet"*.
That run would have written nothing: no `submissions` tab, no `answers` tab, no config rows.

- **The cause.** A tab imported from an xlsx is exactly as wide as its content. The live `people` came
  from the 4 Oct file and is 61 columns wide with no spare column. `ensureSchema` appends missing
  headers with `getRange(1, have + 1, 1, missing)`, and Apps Script refuses a range past the tab's
  last column. `people` is the first name in SCHEMA and is nine columns short (parent_email,
  age_min, age_max, weekly_email and the five notification switches), so the first tab threw and
  nothing after it ran.
- **Why nobody saw it.** The harness's tabs grew to fit whatever was written to them.
- **How it was found.** A model sized each tab the way the 11:50Z export sized it, and ran main's
  `ensureSchema` over that export. It threw on `people` and wrote 0 cells. With nine columns made
  first, its result matched the updated file in every tab. This was not run on the live sheet.
- **The fix, at the rule.** `ensureSchema` widens a tab at its right-hand edge first
  (`insertColumnsAfter`), so nothing already there moves. `js/check-gas-load.js` now gives each tab
  a grid size (`grid`), and its `getRange` refuses anything past it, as Apps Script does. A new tab
  starts with no rows, so its header lands on row 1, not row 2. `check-submissions` section 9b runs
  `ensureSchema` over a `people` tab with no spare column, and fails on the old line.
  - Mutations: the widening reverted turns 9b red; the old way of starting a tab turns it red; with
    no grid modelled it passes, which is the blind spot itself.
  - The patched function, over the real export at its real sizes, finishes, widens `people` to 70
    and matches the updated file in all 39 tabs. A second run writes nothing.
- **The stamps** are `2026-10-10-g-schema-grid`, all four.
- **If the sitting comes before this reaches `main`:** in `people`, insert nine columns to the right
  of the last one (column BI) first, then run `ensureSchema`. Or use the updated file through
  **File → Import → Upload → Replace spreadsheet** inside the live Ledger, which keeps its id. That
  route loses anything written to the sheet after the file was made.

## For the owner to do — one Apps Script sitting, on the live Ledger

1. **GitHub Assistant ↓** (or clasp) to pull `main` into the Apps Script project. No file is added or
   removed, so `backend/files.json` is unchanged.
2. Run **`ensureSchema`** from the editor's function list. **Not `/exec?setup=1`**: until step 3 the web
   app is still the version deployed on 7 Oct, and that is the code a request to /exec runs — measured on it
   (`8cd8323`) over an options tab shaped like an owner's, its `ensureSchema` rebuilt the four code lists,
   left Art's and PE's `focus` beside two status rows, removed an owner's own "On hold", and made no
   `submissions` tab. From the editor it is the code just pulled. It creates the
   **`submissions`** tab (with `pressed_at` as its last column), adds any column another tab is missing,
   and touches no row of yours: on the options tab it only appends a code-owned value a list is missing
   (the report says `added: …`). The `attempts` tab stays where it is, read and written by nothing — keep
   it as the record of what was done before, or delete it by hand.
3. **Deploy → Manage deployments → pencil → New version → Deploy**, so the web app (and the Preview on
   the weekly email's card) is the new code. The You screen shows `2026-10-10-g-schema-grid` on all four
   stamps when it has landed. Until then the site keeps every press on the device and sends them the
   first time the backend lists `submitAnswer` — and each child's questions done before the switch go up
   from their own device, once, the next time they are signed in there.
