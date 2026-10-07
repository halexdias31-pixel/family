## The email after a session goes two hours after the child's last lesson of the day, to the parents who accepted them, about that day

Asked for on 6 Oct as *"i need to begin wiring up the feedback system for parents to see the questions
their children have done. like for example i have done with [a learner]. like 2 hours after the end of
each session is done it will send an automated email to them of the questions they got done."* The
owner left the design to us (*"i dont choose what is best most simplest elegant"*).

It is built and **switched off**, like the weekly email (280). Three steps, all the owner's, come
before any parent gets one: `session_recap` on the config tab reads `preview` or `send`; the owner runs
`installSessionRecap` once from the Apps Script editor; and `preview` runs for a session or two before
`send`. `check-recap.js` fails if anything else books the hourly check.

### The decisions

| Question | Decision |
|---|---|
| What one email covers | One child, one London day, one parent. It goes `session_recap_delay` hours (2) after that child's **last** counted session that day ends. Two sessions in a day are one email that names both. Two siblings get two emails, the same rule as the weekly one. |
| "The questions they got done" | The child's `attempts` rows whose `first_done` or `last_done` is that day, joined on the part of the key before `#`. The email says **"that day"**, never "in the session", because the sheet keeps days, not times. `attempts` gets no new column. |
| Right or wrong | Not reported. The verdict never reaches the sheet, because `doneMark_` fires on the first keystroke, before Check is pressed. |
| Which sessions | `jobs` rows that are lessons. Only the children of **Booked** seats count (paid by Stripe, or Mark paid). Who is on a session comes from the `events` roster, never from the `status` cell. |
| When a session ends | The day's last ticked hour plus one, off a new `jobs.slot_codes` column (see "After review" below). A row without it is never due before 19:00, the grid's last possible end; a date its start is not known for is 18:00 (the grid's last start) plus the hours, and the email leaves the time out. |
| Schedule | One `everyHours(1)` trigger, booked by hand once with `installSessionRecap`. There is no trigger per session. |
| No backfill | Stateless. A day is acted on only while `due ≤ now < due + 24h` (`RECAP_LATE_HOURS`), so switching it on reaches at most the last day's sessions, and there is no watermark to lose. |
| Who is told | The weekly email's rule, run through `digestPlan_` itself: accepted parents only, never `verified=PENDING`, never the learner, one email per mailbox. Opting out uses a **new** column, `people.session_email`, where blank means on. `weekly_email` has nothing to do with this email. |
| Nothing done | No email. The log gets a `nothing done` row, which names any questions marked that day on the tutor's or the booker's own account. |
| The switch | Config row `session_recap`: `off` / `preview` / `send`, arriving `off`. The delay is `session_recap_delay`, 0–12, default 2. The switch is a cell, **not a tile on the phone**, for the reason at the top of js/digest.js. |
| Receipts | A new Ledger tab, `recap_log`. Only `sent` and `sending` are receipts. `preview`, `held`, `failed`, `not sent`, `opted out` and `nothing done` are not, so the next hourly check acts on them again while the day is inside its 24 hours. A note row is rewritten only when what it says has changed. |
| Missing `attempts` tab | Once something is due, the run returns an error and the trigger throws. The preview shows a warning. **The weekly email has the same guard now**: until today it read a missing tab as a quiet week. |
| Engine | The weekly run's claim, send and receipt loop moved out of `digestRun_` into `digestMail_` (and `digestLocked_`), and both emails call it. `check-digest.js`'s 44 rules stayed green with only the harness import changed. |

### The caveat that decides whether it says anything

A question is marked under **whoever is signed in on the device**. `markDone` is `self`, so the token
decides the person. If a session is worked through on the tutor's own phone while the tutor is signed
in, every question goes on the tutor's row and none on the child's, and this email correctly finds
nothing. The child has to be signed in on the device used in the session. When the run sees this
happen, the log says so: *"no question on the attempts tab for Ada Pupil on Tue 6 Oct — this email
reports only questions marked while signed in as Ada Pupil; 9 were marked that day on Sam Tutor’s
account (the tutor)"*. That text goes only into the log and the admin's Preview, never into an email.

### Why "that day", and what it costs

`attempts` is one row per person per question, holding two days and a day count, with no times. So
"done in the session" can only mean "first or last done on the session's date". That includes
homework done the same morning. Two sessions on one day cannot be told apart. A question done in the
session and again the next day loses the session day; the two-hour delay usually avoids that. A
question done offline, or refused as "Busy", reaches the sheet on the next app load. If that is
within 24 hours of due it is still sent; otherwise it is in Sunday's email.

### When a session ends, and why the stored start is not always trusted

A booking is one `jobs` row for a run of dates, with one `start_time` and one `hours_per_session`.

- **A multi-day booking** (`Monday, Friday`) stores only its first run's start. `bookSpec` names the
  session by the first run, and the per-hour `slots` were used to check the tutor's hours and were
  never stored (they are now: `jobs.slot_codes`, see "After review"). Using that start on the other
  day sends during the lesson: a Monday 10–12 / Friday 16–18 booking would email at 14:00 on the
  Friday.
- **An Edit move** rewrites `weekday` and `start_time` and leaves `session_dates` unchanged (dopost.gs,
  the MAP under "Edit carries the new terms"). After a move, a date can fall on a day the row no
  longer names.

So the start is trusted only when the `weekday` cell names no day, or the date falls on the **first**
day it names. **This is stricter than the build spec**, which also trusted a row that names one day
even when the date is on a different day. The code above shows that case happens. Otherwise the end
is 18:00 plus the hours, which is never earlier than the real end.

### Who the session is about

The children are resolved **seat by seat, never by searching the people tab**:

- `for_children` holds display names. A name is matched only against the accepted children of a
  Booked seat's own person: the full name, or a first name that is unique in that family.
- A student who booked their own seat is their own learner.
- If the booking names nobody and the family has exactly one child, it is that child.
- Anything else goes in the log, not guessed: which of two children, nobody linked, a name that is
  nobody's child here, a booker not on the people tab.
- `Someone else` is the booking form's seat for a child with no account, and is ignored.

A wrong match cannot leak. Whoever is picked, the email contains that learner's own attempts and goes
to that learner's own accepted parents.

**Also beyond the spec**, both found in the code:

- `kind` = `session` counts as a lesson as well as blank, because SCHEMA.jobs says both are the
  ordinary booking.
- A name on the booking that belongs to an **unpaid or withdrawn** seat's child is a Preview-only
  line ("Ben Pupil — Bo Other’s seat is Withdrawn, not Booked"). Without this, the log would say the
  child is "not a child linked to anyone with a paid seat", which is not true.
- Two job-level reasons for the same job and day are one row that says both, not two rows
  overwriting each other under one key.

### What exists

- **`backend/recap.gs`** (in `files.json`), functions only. It contains `recapSessions_` and
  `recapGroups_` (pure: sessions, learners, due times), `recapPlan_` (`digestPlan_` with a one-day
  "week", this email's render and `session_email`), `recapRender_` (the email), `recapRun_` /
  `sessionRecapRun` (the hourly run, which throws when it does not finish),
  `installSessionRecap` / `removeSessionRecap`, and `recapPreviewOut_`.
- **The email** has a subject like `Ada’s session on Tue 6 Oct: 3 questions`, and these parts:
  - which lesson it was and when ("Ada had Maths on Tuesday 6 October, 4pm to 6pm.");
  - how many questions, and how many were new;
  - the list grouped by paper (`Maths · Paper 1 (Calculator) — June 2024` / `Q3, Q7 (again)`), with
    numbers in numeric order, at most 30 items, then "…and N more";
  - the site, and how to stop.

  It never contains a tutor, price, venue, another child or a **raw key**. A question with no
  printable name is counted and not listed.
- **`backend/digest.gs`**: `digestPlan_` takes an optional `{render, optOut}`. `digestMail_`,
  `digestLocked_` and `digestNoAttempts_` are shared. Line 16's reference to a `pending-digest.md`
  that never existed now points at 280.
- **The sheet**: Ledger tab `recap_log` (`day, learner_id, parent_id, job_ids, due, to, subject,
  questions, status, at, note`; `day`, `due` and `job_ids` are written as text); `people.session_email`;
  `jobs.slot_codes` (after review, below); config rows `session_recap` (off) and `session_recap_delay`
  (2). `weekly_digest_reserve` is now one floor under both emails. The four version stamps moved
  together, last to `2026-10-06-e-sessionrecap`, so `autoMigrate` adds all of it.
- **`recapPreview`** (`admin`, in `features`) covers the last 7 days and writes, sends and books
  nothing. For each day it shows:
  - every booked session, with when its email falls due;
  - every email as it would read now, with the log's word for it;
  - everybody nobody can tell, and why;
  - the sessions the run never writes about (not agreed, cancelled, for someone not on the site).
- **The card** is in js/digest.js, which is now headed "the parent emails". It is the last page of an
  admin's Settings, after the weekly card, so no index in front of it moves. It shows *Email after
  each session: Off / Preview / Send*, the delay in words, where the switch is, and one Preview tile.
  Its sheet puts the missing-tab warning and "No hourly check is booked" first. The weekly sheet now
  prints the missing-tab warning in place of "Nobody has done a question yet this week".
- **style.css**: `#sheet-body h3` (and `h2`) wrap an address. At 320px the preview's
  `To Pat Parent · pat.parent…@example.org` heading made the sheet scroll sideways by 92px
  (check/ui.js). The weekly sheet's address had fit in an `h2` only by luck. `--css-version` was bumped.

### Checked, each rule proved by mutation and the real files green again

- **`js/check-mail-load.js`** (a harness, not on the roster) is check-digest's world lifted out
  unchanged, with three additions:
  - the mail stub's receipt is a parameter (`digest_log`/`week_of` or `recap_log`/`day`);
  - `everyHours` was added to the trigger stub;
  - `formatDate` answers `yyyy-MM-dd HH:mm` in the named zone.

  It also holds the static readers `calls`, `mentions` and `unquote`. `check-gas-load.js` loads
  `recap` after `digest`. `check-columns` and `check-rows` now read `recap.gs`.
- **`js/check-digest.js`**: 44 → 47 rules. With no `attempts` tab, the Sunday run errors, writes and
  sends nothing, and the trigger throws; the Preview says `attempts:false` with the reason. A parent
  with `session_email=no` still gets Sunday's email. **3 mutations, each red.**
- **`js/check-recap.js`** (in check-all), on the real backend. Its people are invented. A second "Ada
  Pupil" in another family is put **first** on the people tab, so a name looked up across the tab
  finds her. It covers:
  - London due times in BST, GMT, the day the clocks go back, and a 22:00 end (due at midnight, and
    the email still says Tue 6 Oct);
  - the delay;
  - multi-day and blank starts;
  - a time-of-day Date, dd/mm/yy, and a single-Date cell;
  - no backfill, and a held email inside and outside its 24 hours;
  - Booked seats only: not agreed, agreed but unpaid (then paid), cancelled, paid-and-withdrew, two
    families, waitlist and festive;
  - learners: Someone else, an unknown name, a student booking alone, only child vs two children, the
    other Ada, a split booking, a first name;
  - that day's questions only: a practical once, unsafe, key-only and blank labels counted not
    printed, Q2 before Q10, 35 → 30 + "5 more", escaping, nothing printable;
  - nothing done, with the tutor's 9 named in the note and not in any email; a second hour writes
    nothing; late attempts are sent;
  - recipients;
  - two sessions in one day;
  - off, preview and send;
  - quota, failures, `sending`, a lost `sent` write, the lock, and throwing;
  - missing tabs;
  - the installer;
  - nothing starts it;
  - Preview access.

  Across every world, no email was sent without a `sending` row on `recap_log`, and none was sent
  under the lock. **30 mutations, each red for its own reason.** They include one for each
  of the four departures from the spec described above, and every mutation the build spec listed:
  - the window's upper bound dropped;
  - the clock read in UTC;
  - the Booked filter dropped;
  - children resolved with a global `findPerson`;
  - the first start used on every weekday;
  - due per session instead of per day;
  - an email on zero questions;
  - `weekly_email` read instead of `session_email`;
  - the missing-tab guard removed;
  - the send made under the lock;
  - `failed` written over `sending`;
  - note rows written unconditionally;
  - the trigger booked from `installTriggers`;
  - the key printed when the label is empty.
- **`check-flow`**: a new journey for the card. It is the admin's alone and the page after the weekly
  card. The mode follows `session_recap` and the delay `session_recap_delay`. It has one tile and no
  switch. Preview posts exactly one `recapPreview`. Markup in a subject is printed, not drawn. The
  warnings come first, and empty days are not drawn. A backend without the action is told to sync.
  The weekly sheet's warning shows when `attempts:false`. **13 mutations, each red.**
- **`check/states.js`** gains the card and its preview as admin states. `check/ui.js --screen=settings`
  reports nothing new, after the `h3` fix above. `check/press.js` presses `recap-preview`. Its one swipe
  report ("touch up from stuff · a tall question card") is the same on HEAD without this branch.
  Screenshots at 320 and 390 were looked at: the card is the weekly card's twin, the tile is 44px, and
  the address wraps.

### After review: eight faults, each fixed at its root and each proved by a mutation

A review of the build found these. Every one has a check case that fails on the build as first
committed and passes now, and every mutation below was run and turned its check red before the real
files were made green again.

1. **A day booked in two runs was emailed between them (major).** The hour grid lets a family tick
   Monday 10:00 and Monday 16:00–17:00. `bookSpec` names the session by its first run, so the job row
   said `Monday`, `10:00`, one hour, and the per-hour `slots` were used to check the tutor's week and
   then dropped. The email read that as a lesson ending at 11:00, went at 13:00 saying "10am to
   11am", and spent the day's receipt, so the afternoon's questions never went.
   - `createJob` now keeps what was ticked in a new `jobs.slot_codes` column, **only as sent**. An
     older phone that sends no `slots` leaves it blank, rather than storing `bookingCodes_`'s reading
     of the three cells, which would claim the first run is the only one.
   - It is written only when the tab has the column. Before `?setup=1` adds it, a write to a missing
     column would turn the reply into an error for a booking that was appended, and the family would
     ask again. A blank cell costs an email an hour or two late.
   - An Edit that moves `day` or `time` rewrites the codes when it sends new ones, and blanks them
     when it does not.
   - `recapEnd_` reads this date's hours off the codes: the end is the last ticked hour plus one. The
     time is printed only when the day is one unbroken run.
   - A row with no codes (every booking from before) cannot show a second run, so it is never due
     before 19:00 + the delay. The time it prints is the stored run's, on the first day the row names.
   - `slotCodes_` (booking.gs) is the one reading of a list of codes, for the request, the row and the
     email.
2. **"Mark it paid and the next hourly check sends it" could be false.** With a paid morning and an
   unpaid afternoon, the morning's email went at lunchtime; marking the afternoon paid that evening
   found the day's receipt spent. An agreed, unpaid lesson now works out its children as `pending`,
   and `recapGroups_` lets its end hold their day back without ever starting an email of its own. The
   one email goes after the last lesson and carries the whole day. Its log row now says the lesson
   "is not named in the email; that day's questions are in the child's email either way" when that is
   so, and promises a send only when no email covers that child's day.
3. **A family that joined an open class was never emailed, and the log said nothing (major).**
   `for_children` is the booker's answer, and it was read against every seat. A family that joined
   later by Ask to join matched nothing and was dropped quietly. Now only the **booker** (the actor
   of the job's first client Request, `ask.booker`) reads the booking's words. Every other seat first
   looks for its own children among the names, so a split booking still works, and otherwise reads as
   a booking that named nobody: the student themself, then the family's only child, and otherwise a
   logged "which of" or "no child linked" row.
4. **The Preview's words ignored the mode, the 24 hours and whether anybody could be told.** With the
   switch off it said "email due now" over an email headed "not on the log yet". It now words each line
   from the mode, a `state` the server adds to each email, and whether the session has a learner:
   "off — would go now if switched on", "not sent — session_recap is off", "would be written to
   recap_log", "not sent — past its 24 hours, it will not go", and "nobody to email — see below".
5. **Foundation and Higher shared a heading** ("Q1, Q1"). Measured on the library, 14 headings held
   more than one paper. `doneLabel_` (js/find.js, split out of `doneMark_` so the backlog sync in task
   39 can use it) adds the tier to the paper's name, or `A-level` when the tier cell is empty and the
   band says so, unless the name already says it. 0 shared headings remain. Rows already on the sheet
   keep their old labels.
6. **A practical's heading carried the card's "60 min".** `doneLabel_` drops a `N min` segment, and
   `digestPlan_` drops it from rows already stored, so both emails lose it.
7. **Each email's `h3` was the largest text in the Preview.** Inside `.recap-sheet` only (a global
   `#sheet-body h3` would have shrunk every card opened in a sheet), the day is now a divider with a
   rule and the email heading is smaller than the text under it. The `check/states.js` state asks
   exactly that of the drawn page.
8. **`check/states.js` put a log reason on a session line**, a reply the server never sends.
   `check-recap.js` now asks the real Preview which reasons are logged and reads the fixture for them.

Mutations, each red: `slot_codes` ignored; the 19:00 floor dropped; two runs printed as one span;
derived codes stored for an older phone; the column written unguarded; an Edit leaving the old hours;
a pending lesson not holding the day; a pending lesson starting its own group; the unpaid row always
promising a send; the booking's names read for every seat; the booker taken as the first paid seat,
or the roster's first; a joiner's unplaced seat made quiet; durations kept (both checks); the
Preview's email without `state`; the fixture's log reason restored; no tier, no A-level from the
band, the tier said twice, the duration kept on the phone; and five of the Preview's wordings, plus
the heading rule (in `check/ui.js`).

### Owner steps

1. Merge and push. Sync `backend/` with the GitHub Assistant extension (route 1 in CLAUDE.md), then
   deploy a new web-app version.
2. Open `/exec?setup=1`. It adds `recap_log`, `people.session_email`, `jobs.slot_codes` and the two
   config rows, **and the `attempts` tab if the live Ledger still lacks it.** Bookings made before
   this have no `slot_codes`, so their emails go at 19:00 + the delay at the earliest; bookings made
   after it go two hours after their own last hour.
3. In the Apps Script editor, run **`installSessionRecap`** once. Nothing new needs authorising.
4. On the phone, go to Settings → *Email after each session* → **Preview**. For the learner:
   - their session shows under its day (if not, it is not booked on the site);
   - a seat is Booked (paid, or Mark paid);
   - the booking names them, or they are the only child on the account;
   - the parent's link is accepted and the address confirmed;
   - **their questions appear.** If the Preview says *"nothing done … marked on {Tutor}’s
     account"*, the questions were done while the tutor was signed in. The child has to be signed in
     on the device used in the session.
5. Set `session_recap` to `preview` and read `recap_log` after a session or two.
6. Set it to `send`. To stop: `off`, or `removeSessionRecap`. A parent who replies "stop" gets
   `session_email = no` on their row.

### Limits, stated and not built

- There is no "working with [child]" mode for the tutor's device. That is the natural next build.
- A single date of a booking cannot be cancelled. Take it out of `session_dates`; otherwise a day with
  no lesson but with homework is still emailed.
- "That day" includes homework done the same day.
- About 100 emails a day on a consumer account, with one reserve of 10 shared by both emails.
- Pending task 39 (labels on the backlog sync) makes more items printable. Nothing here depends on it.
