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

## For the owner to do — one Apps Script sitting, on the live Ledger

1. **GitHub Assistant ↓** (or clasp) to pull `main` into the Apps Script project. No file is added or
   removed, so `backend/files.json` is unchanged.
2. Run **`ensureSchema`** from the function list (or open `/exec?setup=1`). It creates the
   **`submissions`** tab (with `pressed_at` as its last column), adds any column another tab is missing,
   and touches no row of yours: on the options tab it only appends a code-owned value a list is missing
   (the report says `added: …`). The `attempts` tab stays where it is, read and written by nothing — keep
   it as the record of what was done before, or delete it by hand.
3. **Deploy → Manage deployments → pencil → New version → Deploy**, so the web app (and the Preview on
   the weekly email's card) is the new code. The You screen shows `2026-10-09-e-submissions` on all four
   stamps when it has landed. Until then the site keeps every press on the device and sends them the
   first time the backend lists `submitAnswer` — and each child's questions done before the switch go up
   from their own device, once, the next time they are signed in there.
