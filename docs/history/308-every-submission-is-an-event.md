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
| `attempts`: one row per person per question — `first_done`, `last_done`, `times` — upserted by `markDone`, sent on the first keystroke of the day and backfilled from the phone on every load. | **`submissions`**: one row per PRESS — `person_id, key, label, words, answer, verdict, submitted_at, event_id` — appended by `submitAnswer` and never updated or deleted. Right, then wrong, is two rows, and the later one is the latest. |
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
  email's own `attemptLabel_` / `attemptWords_`; `submitted_at` is the server's clock; 25 a request
  (`SUBMISSIONS_PER_POST`). It retires no payload.
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
- **What was done before the deploy has no submission**, so those cards show nothing until the question
  is sent again, and the first Sunday email after the deploy covers presses since. Old typed drafts stay
  on the `answers` tab and on each device; they are not read back. (A separate piece of work migrates
  them.)
- **A press queued offline and sent late takes the server's time** of arrival, so for the email it is in
  the week it reached the sheet. Sunday presses after the 18:00 run are in nobody's email, as before.

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

### For the owner to do — one Apps Script sitting

1. **GitHub Assistant ↓** (or clasp) to pull `main` into the Apps Script project. No file is added or
   removed, so `backend/files.json` is unchanged.
2. Run **`ensureSchema`** from the function list (or open `/exec?setup=1`). It creates the
   **`submissions`** tab. The `attempts` tab stays where it is, read by nothing; it can be deleted by
   hand, or kept as a record.
3. **Deploy → Manage deployments → pencil → New version → Deploy**, so the web app (and the Preview on
   the weekly email's card) is the new code. Until then the site keeps every press on the device and
   sends them the first time the backend lists `submitAnswer`.
