# Time: availability, bookings, calendar, timetable and rota — one model

**Asked for, 24 Oct (workshop note):** *"I need to fix how calendar and timetable and availability and all of that
should work or be set up or synced. It seems they clash or should or shouldn't be synced. Figure out timetable widget
and rota widget like weekly timetable."*

This is a design, not a change. It maps every place a time lives today, names where two of them disagree, and
recommends one model with a step-by-step plan. History 260 already fixed the first round of clashes (one set of facts,
Your week folded into the Timetable, closures, dates on `busyHours`); this picks up what 260 left and what has been
added since (rooms 336, the Staff hub 405, ranks 400).

---

## 1. The principle

**Every fact is written once; every screen is a view.** Four kinds of fact, each with one home:

| Concept | What it is | One source of truth |
|---|---|---|
| **The year** | terms, half terms, holidays, bank holidays, INSET/closed days | computed (`schoolYear`, `bankHolidays`) + override rows |
| **Availability** | when a tutor (or a room) *could* teach | a recurring weekly pattern + dated exceptions |
| **Bookings** | when somebody *is* taught | a `jobs` row: its ticked hours + its session dates |
| **Personal entries** | a student's school lessons, an exam | the `timetable` cell, the `exams` tab |

**Busy is never stored.** A booked hour is worked out from `jobs` every time it is asked; nothing writes a booking into
anybody's availability. That is what makes the "should these be synced?" question go away: there is nothing to sync,
because there is no second copy.

**Calendar, Timetable and Rota are the same data at two zooms.** The Calendar is a month of dates; the Timetable (a
learner) and the Rota (a tutor, or everybody for an admin) are a week of hours. One function gathers the items; each
view only draws them.

---

## 2. Where time lives today

### 2.1 The map

| # | Fact | Stored in | Who edits | Who sees / where drawn | Notes |
|---|---|---|---|---|---|
| 1 | Tutor weekly hours | `people.availability` (one cell of `m16`-style codes; `availSet`/`availGridIn`) | the tutor (Staff hub → Hours `hoursHtml_`, card editor `s.id==='week'`; the Settings week for a non-staff row only — 432), an admin | tutor card `profAvail_` (cards.js), booking grid `slotGrid` (book.js), `tutorHoursRefusal_` (booking.gs), setup health list (setup.gs) | 9–18 only: `AVAIL_HOURS` (constants.gs) and `SLOT_HOURS` (book.js) are two lists held equal by `check-booking.js` |
| 2 | Tutor hours on an application | `applications.availability` (codes or free text) | the applicant | Business column (records.js) | **not copied** to `people.availability` on approve (`applicationApprove_`, people.gs) |
| 3 | Venue opening hours | `venues.availability` | admin (venue editor) | `slotGrid` (as `vAvail`), venue card | 4 of 13 venues in the export are blank |
| 4 | Room hours | `rooms.availability`, blank = the venue's (`roomTerms_`, booking.gs) | admin (`saveRoom`) | `slotGrid` via `spaceFor` | |
| 5 | What a tutor is already teaching | derived: `busyHours(tutor, from, to)` (booking.gs) over `jobs` | nobody (derived) | grey/hatched hours on the grid and the card, `createJob` refusal | per tutor only — **no room or venue equivalent** |
| 6 | A booking's days and hours | `jobs.weekday`, `start_time`, `hours_per_session` | `createJob` (dopost.gs) from the phone's `bookSpec` | `busyHours`, `weekSessions_`, Calendar, receipt `jobWeekRows_` | **only the first run** is stored (see 2.2 A) |
| 7 | A booking's dates | `jobs.session_dates` (comma list) | written once at booking by the phone's `computeSessionDates` (core.js), which steps over `DATA.closures` | `jobOn_`/`jobDates_` (book.js), `busyHours` window, `payStatement_`, `closeFinishedJobs` | frozen at booking time |
| 8 | Which term a booking is for | `jobs.term_name` | `createJob` | receipt, card | text label; `waitlist`/`festive` jobs reuse it for other ids |
| 9 | School terms and holidays | computed `schoolYear(y)` overridden by `terms` tab rows (`termsFor`, booking.gs) → `DATA.intervals` (doget.gs) | admin (sheet) | booking Term step, Calendar | **the `terms` tab name collides** with the legal documents `terms.js` reads (see 2.2 F) |
| 10 | Bank holidays | computed `bankHolidays(y)`; plus `holidays` rows of kind `bank` | admin (sheet) | `DATA.closures` → booking skips, Calendar | the export has 16 typed `bank` rows duplicating the computed ones |
| 11 | INSET / closed days | `holidays` rows, kind `inset`/`closed` | admin (sheet) | `DATA.closures` | |
| 12 | Festive events | `holidays` rows with `event_name`, `venue`, `price_per_child`, `active` | admin (sheet) | `festiveOffers` → `DATA.festive` (offered between `opens_days` before and `trail_days` after), Calendar; a ready one is also a closure | a family's joined event is a `jobs` row with no `weekday`/`start_time`, so it is **not on their Timetable** |
| 13 | Waiting-list "can come" | sentences in `events.message` ("can come: Monday evening, …"), `SLOT_BLOCKS` | the family | `waitlistWhen` summary on the list | a family preference, not availability; deliberately broad (119) |
| 14 | Personal timetable | `people.timetable` (JSON week; device copy when signed out) | the person (`saveTimetable`) | Timetable widget `tmtHtml_` (games.js), day at a time | booked sessions drawn locked from `weekSessions_` |
| 15 | Exams | `exams` tab (`saveExam`) **and** `people.exam_small_date` / `exam_big_date` | student / parent / admin | Calendar, Your journey countdown (Progress) | `doGet` merges the two people columns into `DATA.exams` (260 §4) — two homes for one fact |
| 16 | Birthdays | `people.date_of_birth` → `DATA.birthdays` | the person | Calendar | fine |
| 17 | Sunday digest timing | config `weekly_digest`, `weekly_digest_hour` (21), trigger `onWeekDay(SUNDAY)` in `DIGEST_TZ` Europe/London | owner | email | week = Monday–Sunday London, the same week `mondayOf_` uses on the phone; reads marks, not sessions — no clash |
| 18 | Monthly pay statement | derived: `payStatement_(tutor, ym)` over `session_dates` | nobody | Staff hub (staff.js) | inherits whatever `session_dates` says (frozen, see 2.2 D) |
| 19 | Job lifecycle | `closeFinishedJobs` daily at 03:00 sets `status = ended` after the last date | trigger | everywhere | fine |

There is **no rota widget** today: a tutor's Timetable shows their own booked sessions (because `myJobs_` matches the
tutor's name) but not their hours, and nobody — not even an admin — has a view of everybody's week.

### 2.2 Where two sources disagree or duplicate

**A. A booking on several days with different times is stored wrong, and can be sold twice.** The grid lets a family
tick Monday 10–12 and Friday 16–18. `bookSpec` (book.js) sends `slots` (every code) but `createJob` writes only
`weekday: "Monday, Friday"`, `start_time` = the first run's hour, `hours_per_session` = the first run's length. 124
called this "an honest simplification". It is not harmless: `busyHours` reads the row, so it greys **Friday 10–12**
(never booked) and leaves **Friday 16–18** (booked) free for the next family. The Timetable, the Calendar label and the
receipt show the same wrong Friday. Two runs on one day (Mon 10–11 and Mon 14–15) collapse to one.

**B. Rooms and venues are never busy.** `busyHours` exists only for tutors. Two families can book the same room at the
same hour with two different tutors (or with No preference) and both are accepted. `capacityFor` caps seats inside one
job, not overlapping jobs.

**C. A blank venue means two opposite things.** `slotGrid` treats a venue with no hours as open every hour (260 §2,
deliberately); the setup health list (setup.gs) says the same venue *"will never appear as bookable"*. Four live venues
are blank.

**D. Dates are frozen at booking.** `session_dates` is computed on the phone the moment the family books. An INSET day
or festive event added afterwards does not remove the session, so the receipt, the Timetable, the Calendar and the
tutor's statement all keep a session on a day the business is shut — and nobody is told.

**E. No exceptions to availability.** A tutor going away for a week can only untick their whole week (which also
releases every *other* week) or leave it ticked and be booked. Venues have the same gap (a library closed for
refurbishment).

**F. `terms` is two tables.** `TAB.terms` is school terms in `SCHEMA` and is read by `termsFor`; `terms.js` reads
`DATA.terms` as legal documents; the old Settings export's `terms` rows are the tutor agreement. `check-payload.js`
already lists this as unresolved. A legal row on the Ledger's `terms` tab is ignored by `termsFor` only because it has
no `term_name`.

**G. Exams have two homes** (`exams` tab, two `people` columns) merged at `doGet`.

**H. Bank holidays have two homes** (computed + typed `bank` rows). Harmless today because `closures()` keys by date,
but a typed row with a wrong date silently adds a closure.

**I. Four editors for one cell.** Settings, the card editor, the Tools widget and (as a copy that never arrives) the
application form all write tutor hours. They share `availGrid_`, so the data agrees; the duplication is in where a
tutor is told to go.

**J. Students and parents see the wrong set of sessions.** `myJobs_` (book.js) matches `client` or `tutor` by name.
A child account is never the `client` (the parent books), and `doGet` sends a job only to people on its roster
(`iAmIn`), so **a student's Timetable and Calendar never show their own sessions**. A parent sees every child's
sessions mixed, with no way to look at one child. An admin's Timetable shows only the admin's own.

**K. Festive events the family has joined** are in `jobs` but have no weekday/time, so `weekSessions_` drops them; the
Calendar shows the *offer* (to everyone, only inside its offer window) rather than "you are going".

**L. Two hour lists.** `AVAIL_HOURS` (backend) and `SLOT_HOURS` (phone) — held equal by a check, so not a live bug.

---

## 3. The recommended model

### 3.1 The year

- **Computed first, typed only to correct.** `schoolYear(y)` and `bankHolidays(y)` stay the source. Rows are only for
  what the computation cannot know: a borough's actual term dates, an INSET day, a moved or extra bank holiday.
- **Rename the school-terms override tab to `school_terms`** (`TAB`, `SCHEMA`, `WHERE`; `check-tabs.js`). `terms` is
  left to the legal documents `terms.js` already expects.
- **`holidays` keeps single days and events**, with `kind` one of `bank` (moved/extra only), `inset`, `closed`,
  `observance`, and festive event fields. Delete the typed `bank` rows that equal a computed one; the health list warns
  if one comes back.
- **Closures** stay `closures()` → `DATA.closures`. Whether a *ready festive event* closes ordinary teaching is the one
  rule the owner should confirm again (260 assumed yes).

### 3.2 Availability = a weekly pattern + exceptions

- **Pattern:** `people.availability` for tutors, `venues.availability` and `rooms.availability` (blank = the venue's)
  for spaces. Unchanged format (`m16` codes, 9–18).
- **Exceptions:** a new tab **`away`**: `away_id, kind (person|venue|room), who (person_id, venue name or "Venue —
  Room"), from_date, to_date, hours (optional codes; blank = whole days), note, created_by, created_at`. A tutor
  writes their own; an admin writes anybody's and any space's.
- **Effective availability on a date** = pattern ∩ not away ∩ not a closure ∩ not busy. One function each side
  (`freeOn_(who, date)` on the phone, `freeOn(who, date)` in booking.gs) that `slotGrid`, the card, the Rota and
  `createJob` all ask.
- **Blank means:** a *tutor* with no pattern is not bookable by name (owner, 260). A *venue* with no pattern is open
  (`slotGrid`'s current rule); the setup message is corrected to say "not limited by hours" rather than "never
  bookable". (Owner may choose the opposite; then those four venues need hours first.)
- **Families have no availability.** The owner's 260 answer stands. Their waiting-list "can come" stays a preference
  and is never synced into anything.

### 3.3 Bookings = jobs with sessions

- **A job stores every ticked hour:** a new `jobs.slot_codes` column (e.g. `m10,m11,f16,f17`) written by `createJob`
  from the `slots` the phone already sends. `weekday`, `start_time` and `hours_per_session` stay written (derived from
  the codes) so older readers and the sheet still read, but **nothing decides anything from them** once
  `slot_codes` is there.
- **One reader each side:** `jobRuns_(j)` (book.js) and `jobRuns(j)` (booking.gs) return `[{day, from, hours}]` from
  `slot_codes`, falling back to `weekday × start_time × hours_per_session` for old rows. `busyHours`, the new
  `spaceBusy`, `weekSessions_`, `calendarMarks`, the receipt's `jobWeekRows_`, `payStatement_` and the ICS feed all read it.
- **`session_dates` stays the list of dates** that are taught. It is the one place a date is added or removed.
- **Session exceptions**, admin only, logged as `events`: *skip a date* (removes it from `session_dates`; credit or
  refund is a separate money decision) and *move a date* (replaces one date; same hours, or new codes for that date
  only in an `exceptions` JSON cell if ever needed — not in the first cut).
- **Who a session is for** gains ids: `jobs.for_child_ids` (person_ids, beside the names in `for_children`), written at
  booking from the parent's ticked children, so a student can be matched without matching names.

### 3.4 Views: one item source, three zooms

- **`timeItems_(from, to, scope)`** (new, book.js): returns dated, timed items — `session` (from `jobRuns_` ×
  `jobDates_`), `event` (a festive job I have joined, at its date and `hours`), `lesson` (personal timetable entries,
  repeating weekly), `exam`, `closure`, `term` boundaries, `birthday`, and for a tutor `free` (pattern minus busy) and
  `away`. `scope` is `me`, `child:<id>`, `tutor:<name>`, `room:<label>` or `all` (admin).
- **Calendar** (month, paper palette) = `timeItems_` for the month, dots by kind (`CAL_KINDS`); `calendarMarks`
  becomes a thin wrapper.
- **Timetable** (week) = `timeItems_` for Monday–Sunday. Keep the day chips (320px rule from 235) and add a **week
  strip** above them: seven narrow columns with a block per item, so the week is read at a glance and a tap opens the
  day. Arrows step this week / next week (`weekSessions_(when)` already takes a date).
- **Rota** (week) = the same week view in tutor or admin mode — not a separate widget engine.

### 3.5 What each role sees

| Role | Timetable / Rota | Calendar | Can edit |
|---|---|---|---|
| **Student** | *My timetable*: own sessions (matched by `for_child_ids`), own written lessons, exams; no prices | own sessions, exams, terms, closures, events joined, birthdays | written lessons, exams |
| **Client (parent)** | *Family timetable*: a chip per linked child plus *All*; each child's sessions and that child's written lessons (read-only) | the same, filtered by the chip | own written lessons, a child's exams |
| **Staff (tutor)** | *My rota*: booked sessions solid, free hours (pattern minus busy) faint gold, away days hatched, closures; **Edit my week** opens the pattern grid and an *Away* list | own sessions, away, terms, closures | own pattern, own away rows |
| **Admin** | *Rota* on the Business column: tutors × days for a chosen week (or rooms × days), every session, gaps, and a flag list (below) | everything | anybody's pattern/away, any space's hours/away, skip/move a session |

Signed out: the Timetable keeps its device-only written week, as now.

### 3.6 Sync rules (all derived, none copied)

1. **Booking blocks the tutor and the room automatically.** `busyHours` (tutor) and a new `spaceBusy(label, from,
   to)` (room; a venue with rooms is never booked as a whole; `Online` and a client's home never block) read `jobs`
   live. The grid greys, `createJob` refuses. Nothing is written to availability.
2. **Cancelling releases automatically** — already true: a job with nobody on the roster is cancelled (`jobStatusOf`).
3. **A pattern change does not move booked sessions.** The Rota flags a booked session now outside the tutor's
   pattern; the admin decides.
4. **An away row over a booked session** is accepted and flagged (to the admin flag list and, for a tutor's own row, a
   warning before saving: "you teach 3 sessions in those days").
5. **A closure added after booking** never edits a job by itself (the price was agreed). It appears on the admin flag
   list — "2 sessions fall on INSET 13 Feb" — with *Skip this date* beside it.
6. **Unpaid requests** keep blocking the tutor once a tutor is confirmed, as now; a cancelled one does not.
7. **Personal written lessons never block a booking** (families have no availability). The booking form may later
   *warn* "clashes with your written Maths lesson" — optional, step 11.
8. **Waiting lists** block nothing until they run and become a session with codes and dates.

The **admin flag list** (Rota and the setup health list): sessions on a closed day; sessions outside the tutor's
pattern; sessions on an away day; two sessions in one room at one hour (data from before rule 1); tutors with no
hours; venues with no hours.

### 3.7 Google Calendar export (optional): one ICS feed per person

- `doGet` branch `?ics=<token>` returning `ContentService.createTextOutput(ics).setMimeType(ContentService.MimeType.ICAL)`.
- `people.ics_token` (random, 32 hex), made on first ask, **Rotate** on the Timetable revokes the old link. The token
  is the only key — no name, no PIN in the URL.
- Contents: the person's own `timeItems_(today − 30 d, today + 365 d, scope)` sessions (a parent's feed carries each
  child's, labelled with the child's first name), plus optional closures. One `VEVENT` per session date, `UID =
  job_id + date + '@family'`, `TZID=Europe/London` with a `VTIMEZONE` block so the clock change is right, `SEQUENCE`
  bumped when a date moves, and a cancelled job sends `STATUS:CANCELLED` for 30 days before it drops out.
- No other family's names (the `seatName` rule), no prices, no addresses beyond the venue name.
- A tile **Add to Google Calendar** on the Timetable: `https://calendar.google.com/calendar/r?cid=webcal://…`; plus
  *Copy link* for Apple/Outlook.
- **Read-only, one way.** Two-way sync with Google Calendar is not recommended: it would make Google a second source of
  truth, which is the problem this design removes.

---

## 4. What to delete or merge

| Delete / merge | Into | Why |
|---|---|---|
| `jobs.weekday/start_time/hours_per_session` as *sources* | `jobs.slot_codes` (columns kept as derived display) | 2.2 A — wrong hours stored, double sale |
| `people.exam_small_date`, `exam_big_date` and the `doGet` merge | `exams` tab rows (`saveExam`), Settings writes rows | 2.2 G |
| typed `bank` rows equal to computed ones | `bankHolidays()` | 2.2 H |
| `terms` tab as school terms | `school_terms` tab | 2.2 F |
| `calendarMarks`' own readers | `timeItems_` | one item source |
| Tools widget *My teaching hours* | Rota's **Edit my week** (Settings and the card editor keep linking to the same grid) | 2.2 I |
| `applications.availability` left behind on approve | copied to `people.availability` by `applicationApprove_` when it is codes | 2.2 I |
| setup.gs "never appear as bookable" for a blank venue | "not limited by hours" | 2.2 C |
| `AVAIL_HOURS` / `SLOT_HOURS` two lists | optional: one `teach_from`/`teach_to` in config sent as `DATA.constants.vars` | 2.2 L (low value) |

---

## 5. Implementation plan

Small steps, each shippable on its own and each green on `npm run check`, with a mutation proving its new rule (house
style). Backend steps bump all four version stamps and need the Apps Script pull + an admin open (361). Effort: **S** ≈
half a day, **M** ≈ 1–2 days, **L** ≈ 3–4 days, including checks.

| Step | What | Where | Effort | Ships alone because |
|---|---|---|---|---|
| **0** | Owner decisions (section 6) | — | — | |
| **1** | **Store every ticked hour.** `jobs.slot_codes` (SCHEMA → `ensureSchema`); `createJob` writes `slotCodes_(body.slots)`; `jobRuns`/`jobRuns_` both sides with the old-row fallback; `busyHours`, `weekSessions_`, `calendarMarks` label, `jobWeekRows_`, `payStatement_` read them. `check-booking.js`: Mon 10–12 + Fri 16–18 busy exactly there; `check-flow.js`: Timetable draws Friday at 16. | booking.gs, dopost.gs, constants.gs, book.js | M | fixes a live double-sale; old rows unchanged |
| **2** | **Rooms are busy.** `spaceBusy(label, from, to)`; payload `busy` per space for today; `slotGrid` greys "room booked"; `createJob` refuses an overlap in the same room (a venue with rooms counts each room; Online/home exempt). `check-rooms.js` rules. | booking.gs, doget.gs, dopost.gs, book.js | M | independent of 3–10 |
| **3** | **Clean-ups.** Blank-venue message; copy application hours on approve; delete duplicate typed `bank` rows + health warning; exam columns → `exams` rows (one-off migration in `setup`, Settings writes rows, `doGet` merge removed). | setup.gs, people.gs, me.js, doget.gs | S each (M total) | each is one rule |
| **4** | **`school_terms` rename.** New tab, `termsFor` reads it (falls back to `terms` rows that have `term_name` for one release), `check-tabs.js`/`check-payload.js` updated; owner moves any typed term rows. | constants.gs, booking.gs, checks | S | fallback keeps old rows working |
| **5** | **One item source.** `timeItems_(from, to, scope)` in book.js; `calendarMarks` and `tmtHtml_` read it; joined festive events appear on both. No backend. | book.js, games.js | M | pure refactor + K fixed |
| **6** | **Students and parents see the right sessions.** `jobs.for_child_ids` written at booking; `doGet` sends a job to a linked child (family tab) named in it, with prices stripped (Student rank, 398); `myJobs_` matches by id; parent chips on the Timetable. `check-profile.js`: child sees own, not sibling's; parent filter. | dopost.gs, doget.gs, book.js, games.js | M–L | biggest visible win for families |
| **7** | **Weekly view.** Week strip over the day chips, this/next week arrows, weekend rule kept; `check/states.js` at 320/390; `--css-version` bump. | games.js, style.css | M | drawing only |
| **8** | **Tutor rota.** For Staff, the Timetable shows free hours (pattern − busy) and has **Edit my week** (the existing `availGrid_`); retire the Tools *My teaching hours* widget (it becomes a door to this). | games.js, me.js, map.js | M | reads existing data |
| **9** | **Away (exceptions).** `away` tab (`TAB`/`SCHEMA`/`WHERE`), `saveAway`/`deleteAway` (self for own person rows, admin any), payload `away` for the next 12 months; `freeOn` both sides used by `slotGrid`, the card, `tutorHoursRefusal_`, `spaceBusy`; Rota draws them. | constants.gs, dopost.gs, doget.gs, booking.gs, book.js, cards.js | L | additive; no row = today's behaviour |
| **10** | **Admin rota + flag list.** Business-column card: tutors × days (toggle rooms × days) for a week; the flag list from 3.6; *Skip this date* action (edits `session_dates`, logs an event, no money change). | records.js or staff.js, dopost.gs | L | admin-only |
| **11** | **ICS feed.** `?ics=` branch, `people.ics_token`, *Add to Google Calendar* / *Copy link* / *Rotate*; cached per token for 15 min. Spike first (half a day) to confirm Google Calendar accepts the Apps Script URL. Optional: the booking form's "clashes with your written lesson" warning. | doget.gs, games.js | M (+S spike) | optional, read-only |

Suggested order: 1 → 2 → 3 → 5 → 6 → 7 → 8 → 4 → 9 → 10 → 11. Steps 1 and 2 stop money going wrong; 5–8 are what the
owner asked to *see*; 9–11 are new capability.

---

## 6. Owner decisions needed first

1. **A blank venue:** open every hour (recommended, current booking behaviour) or closed until hours are typed?
2. **Festive events close ordinary teaching** on their day — still yes?
3. **A closure added after a booking:** flag for the admin to skip (recommended) or remove the date automatically and
   re-price?
4. **A tutor's away row over booked sessions:** allowed with a flag (recommended) or refused until the sessions are
   moved?
5. **Rooms:** is a room always one booking at a time (recommended), or can two small groups share a large room?
6. **ICS feed:** wanted now, later, or not at all?

---

## 7. Risks

- **Old job rows without `slot_codes`** keep the first-run simplification until they end. Mitigation: the fallback (no
  row reads worse than today), the admin flag list can name multi-day rows to check by hand (the request event does
  not keep the ticked codes, so there is nothing to backfill from), and every old row ends within a term.
- **Room blocking may refuse a booking the owner considers fine** (shared large room). Decision 5 first; the refusal
  names the clashing hour so it is never silent.
- **Students seeing jobs** is a privacy change: the payload must strip prices and other families' names for the Student
  rank (`seatName`, 386, 398). `check-profile.js` must prove a sibling's and a stranger's sessions are absent.
- **Name-based matching** (`client`, `tutor`, `for_children`) breaks on a rename; ids (`for_child_ids`) fix it for
  children. Tutors and clients still match by name in `busyHours`/`myJobs_` — a later step could move those to ids.
- **Tab rename** (`school_terms`): rows typed into the old tab are lost if the fallback is removed too early.
- **Apps Script ICS:** the web-app URL redirects to googleusercontent.com; some calendar clients do not follow it, and
  Google refreshes subscribed calendars only every 8–24 hours, so a change is not instant. A leaked token shows that
  person's schedule until rotated. Each poll is a `doGet` execution against the daily quota — cache per token.
- **Clock change:** session dates are London dates and hours are local; the ICS must carry `TZID=Europe/London`, and
  any day counting must avoid the `Math.ceil` across 25 October fault fixed in 346.
- **Layout:** a seven-column week strip at 320px is tight (235 measured 35px a column); the strip is a summary, the day
  list stays the place to read and tap.
- **Load:** `spaceBusy` and `freeOn` read `jobs` per request; read once per `doGet`/`createJob` and pass the rows, as
  `busyHours` should.
