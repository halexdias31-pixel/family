## The day a question was done is on the sheet, so it follows the student and an admin can see it

Asked for as *"should be saved to a spreadsheet instead of"* being kept only on the phone. 268 wrote
`Done 4 Oct` on the question card from `done:<who>:<key>` in `localStorage`, and said in so many words
that a tab was the backend change it was not making. This is that change.

### The tab: `attempts`, in the Ledger

`person_id, question_key, first_done, last_done, times` — named in `TAB`, `SCHEMA` and `WHERE`, so
`ensureSchema` creates it. **The Ledger** because it is the only file `FILES` has, and because it is
where every other record *of a learner* already lives (`people`, `exams`, `favourites`) — a student's
attempts sit beside their row rather than in a second spreadsheet.

**One row per person per question, upserted**, never a row per press: `first_done` once, `last_done`
each new day, `times` counting the *days* it was done on. No id column — the row is found by what it
is (this person, this question), the way `records` are found by slug.

### The action: `markDone` (`self`)

`items: [{ key, day }]`, up to `ATTEMPTS_PER_POST` (50). **The person is the token's**: the gate
overwrites `body.personId`, so a request naming another student dates the question for whoever sent
it. **Under the script lock** (`tryLock(5000)`, refused rather than written unlocked — the phone
re-sends on the next load). **A day already covered writes nothing**, so a retry, two phones or a
re-sent backlog cannot count twice. The phone's day is believed up to tomorrow; later than that, or
before 2024, is London's today.

**It does not retire everybody's payload.** Every other write does, through `POST_WROTE` →
`clearPayloadCache`, which bumps the generation and makes the next visitor of every kind rebuild.
A done question is in two payloads only — the student's and each admin's — so `retirePayloadOf_`
(core.gs) removes those two cache keys by `payloadKey_`'s own key and `POST_WROTE` is put back.
Twenty questions an evening would otherwise have been twenty site-wide rebuilds.

### Who is sent what: `DATA.attempts`

`{ for, mine: { <key>: { first, last, times } }, people? }`. A signed-in person gets their own rows;
a visitor with no token gets `{ for: '', mine: {} }`; **an admin also gets `people`** —
`{ <person_id>: { n, last } }`, a summary rather than every row, because the people column draws two
facts per card and every row for every student is thousands of entries to one phone.

**A tutor gets nothing extra — a decision, for the owner to confirm.** Who a tutor teaches is not a
column anywhere: `participantsOf` folds it from the events tab by *display name*, and the child a
parent booked for is a name in `for_children`, blank on most rows. A rule on that would hand one
family's work to whichever tutor shares a name with somebody in the booking — and a tutor's people
column does not draw students at all. Admin-only until a booking carries person ids.

`for` is checked on the phone (the `familyFor` rule): a payload left on a shared phone by the last
student does not date the next one's questions, and an admin's summary is not drawn for whoever
signs in after them.

### The phone

- **The card reads the sheet first, the phone as the floor**: `doneRead_` shows the *later* of the
  sheet's `last_done` and the `localStorage` copy, so neither can move the date backwards and a
  backend without the tab leaves the card exactly as 268 left it.
- **One request per question per day.** `doneMark_` already stopped before writing when today was
  stored; the send sits after that return, so forty keystrokes are one `markDone`. Only to a backend
  whose `features` lists `markDone`; quietly, like a star.
- **The backlog goes up on load** (`attemptsSync_`, from `adoptMarks_`): every
  `done:u:<me>:<key>` (and `DONE_HELD`) whose day the sheet lacks, in one request, fifty at a time,
  once per person per visit, only against a payload built for that person. So every date 268 ever
  stored reaches the sheet the first time that student opens the app after the deploy.
- **An admin's people column** says `12 questions · last 4 Oct` under a learner's handle
  (`attemptsLine_`, `.prof-act` in the seat price's ink). Nothing for somebody with no attempts.

### Checked, each proved by mutation and restored to green

`js/check-attempts.js` (new, in `check-all`), through the real `doPost`/`doGet` on
`check-gas-load.js`: first = last on the first day, the same day again writes 0 cells, a later day
moves last and counts, an older day moves first, 2099 is today, 60 items write 50, no token is
refused, the row is the token's person when the body claims another; Ada gets hers, Ben his, the
admin both summaries, a stranger and a `?person=` spoof nothing; and a done question leaves
`PAYLOAD_GEN` alone, retires Ada's and the admin's cached payloads and keeps Ben's. Red for: same-day
counting, first overwritten, person from the body, `mine` unfiltered, `people` to everybody, the
generation bumped, the admin not retired, no cap, no future clamp.

`check-flow` gains **a Check sends one attempt to the sheet**: signed out nothing; the load sends
exactly the two days the sheet lacks, once even when two payloads land together; the sheet's date on
a card the phone never stamped, the sheet's later day over the phone's older one and the reverse;
one Check one request with `[{ key, day: today }]`, a second Check and keystrokes nothing more,
thirty keystrokes into a fresh box one request; Ben does not see Ada's sheet date; the admin's
line, its singular, nothing for nobody, drawn under the name by `findCard`, and not for Ben after
the admin; a backend without `markDone` sent nothing. Red for: the sheet ignored, the phone always
winning, no send, the send before the debounce, the sync sending everything, the sync not once per
visit, `for` unchecked (card and admin line), the `features` gate removed, the card line removed,
the sync unhooked from `adoptMarks_`.

`check/fixture.json` carries `attempts` as `doGet` sends it to the admin the fixture already is, so
`check/ui.js` measures the people column's line at every width. Screenshots at 320 and 390 of
Evie's card: the line sits under the handle, one line, no crowding.

### Owner steps

1. Push, then sync `backend/` into Apps Script (the GitHub Assistant extension, or clasp).
2. Run **`ensureSchema`** (or open `/exec?setup=1`) — it creates the `attempts` tab. Until then
   `markDone` answers "The sheet has no attempts tab…" and the phone keeps the dates to itself.
3. Deploy a new version of the web app (the merge bumps the four version stamps; this branch does not).

Nothing else: the dates already on students' phones go up by themselves the next time each opens
the app signed in.
