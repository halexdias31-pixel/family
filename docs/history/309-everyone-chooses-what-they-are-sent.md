## Everyone chooses what they are emailed: a Notifications card on Settings, and every sender asks

**The owner, 9 Oct:** *"Also let parents select their communication preferences like notification. And
kids and tutors too I guess"*

### What "a notification" is here

The site sends **email and nothing else**. No push, no web notifications (`sw.js` has no `push` listener),
no SMS, and no `GmailApp` — the only one is a stub in a check. `navigator.vibrate` in the games buzzes the
phone in hand; every `UrlFetchApp` goes to postcodes.io, Stripe, Gemini, GitHub or the cache warmer. So a
preference is a yes or a no per **kind of email**, and there were 30 senders to sort into kinds: 22
`notify()` calls and 8 direct `MailApp.sendEmail`s besides the one inside `notify` itself.

### Every kind, and whether it can be turned off

`NOTIFY_KINDS` in `backend/constants.gs` is the one list. Six can be turned off; five are always sent.

| Kind | Column | Who gets it | What it is | Senders |
|---|---|---|---|---|
| **weekly** | `weekly_email` | parent — by the role cell, **or anybody with an accepted child** (`parents: true`) | the Sunday email about a child | `digestPlan_` / `digestMail_` |
| **messages** | `messages_email` | parent, kid, tutor, admin | "A message from …" | `sendMessage` |
| **bookings** | `bookings_email` | parent, tutor, admin | a note, new terms or a payment on a session (`move` Say/Edit/Request/Pay); a paid place, to the tutor; printing posted; an invitation to a member's address; a festive sign-up, to the admin | `move`, `finalizePayment` (tutor), `orderPosted`, `sendInvite`, `joinFestive` |
| **posts** | `posts_email` | parent, kid, tutor | your post went up / was not put up | `approvePost` |
| **referrals** | `referrals_email` | everyone — **`hidden`: honoured, not drawn** | somebody joined with your code | `register` |
| **approvals** | `approvals_email` | admin | a post is waiting — **off, it waits until somebody opens Posts**, and the card says so | `addPost` |
| access | — | everyone | the confirmation link, a new address's link, a forgotten PIN, a no-email child's grown-up's yes, your child's handle | `linkMail_`, `moveMail_`, `register`, `forgotPin`, `makeChild` |
| security | — | everyone | too many wrong PINs; your PIN was changed | `authWrong_`, `changePin`, `resetPin` |
| family | — | parent (by role or an accepted child), kid | somebody saying they are your parent; the child's answer | `claimChild`, `answerClaim` |
| booked | — | parent, tutor | received (with the total), chosen, not taken forward, accepted, declined, **a family or tutor withdrawing**, paid / booked in, cancelled | `createJob`, `move` Accept/Decline/Withdraw, `markPaid`, `finalizePayment` (payer), `deleteJob` |
| reported | — | admin | a message somebody reported | `flagMessage` |

**The rule.** Essential is what somebody needs to *use* the service: getting in (access), knowing the
account is being attacked (security), never being put on a family without being told (family), the
decisions that say whether a session happens (booked), and a safeguarding report (reported). Everything
else is the conversation around those, and is somebody's to turn off. Every optional kind is **on** for
everybody until they turn it off — no row on the sheet had chosen anything.

**Two decided against the survey of 9 Oct, both towards "always sent":**
- **A `move` Withdraw is `booked`.** It was going to be optional "booking updates". A tutor leaving a
  family's session is the session losing its teacher; a parent who had switched updates off would find out
  at the door.
- **`createJob`'s email to the tutor the family named is `booked`.** It reads like a request and is more:
  `createJob` logs that tutor's own Accept ("chosen by the family at booking"), so they are already on the
  session when it is sent — it is "You're teaching X" by another door, and that one was always essential.

### One source of truth per person, and why columns

**One column per optional kind on the people tab, blank = on, `no` = off.** That is the shape
`weekly_email` already had (280, 295), read by `ON_` — the codebase's one blank-means-yes reader — and
the redesign of the people tab turned down packed cells because they "could not be read or edited in the
sheet". `ensureSchema` can append a column to a live tab; it cannot re-pack a cell. So:

- `weekly_email` **keeps its name** — renaming it would lose every `no` already typed — and *is* the weekly
  switch. The old opt-out is folded in, not a second mechanism beside it.
- Five more beside it in `SCHEMA.people`: `messages_email`, `bookings_email`, `posts_email`,
  `referrals_email`, `approvals_email`. Not `admin_email`, which reads like an address.
- `TAB.people` and `WHERE.people` already name the tab; only `SCHEMA` needed the columns.

### Every sender asks — at the moment it sends

- **`wants_(row, kind)`** in people.gs is the one reader: yes for an essential kind, yes for a kind nobody
  declared (a swallowed PIN reset is worse than an unwanted note, and `check-prefs` refuses an undeclared
  kind before it ships), otherwise `ON_(row[col])`.
- **`notify(name, subject, body, kind)`** asks it last, after the address and its proof. Every one of the 22
  calls names its kind; `move`'s is a conditional of two literals so it can be read off the source.
- **The digest** reads `wants_(p, 'weekly')` where it read `ON_(p.weekly_email)` itself. Its footer now says
  *"To stop these emails, untick Weekly progress email in Settings → Notifications on the site, or reply to
  this one and say so."*
- **`sendInvite`**, when the address typed is already a member's, asks that member's `bookings`.
- **A held email is written down, never dropped.** `notifyHeld_` logs `notify held: <kind> email not sent to
  <person_id> … Subject: …` to the Apps Script execution log (Executions, in the editor) — as `aiMark` logs a
  refusal from Gemini. The weekly email also writes its `digest_log` row (`opted out`), and an invitation
  writes `invites.notes` ("not emailed: bookings_email on their row says no"). **Never in the reply**: the
  person sending a message is not told that its recipient has messages switched off.

### Written only through `setNotify`, and whose row is the token's

`setNotify` is `self` in `ACTION_ACCESS`. The gate has already made `body.personId` the token's person, so a
request naming somebody else still writes the asker's own row. On writes a blank, off writes `no` — a
switch and a cell typed in the sheet are one fact. Refused, writing nothing: an unknown kind, an essential
kind (with its `why`), a kind that does not reach that person's roles (a child switching off the weekly email
about themselves), and a sheet without the column yet ("Run ensureSchema()").

**A parent for a child** is `resetPin`'s rule word for word, because it is the same question: an admin, or a
parent the child has **accepted** (an `asked` link is a claim, not a family), the parent's own address
proved (`confirmFirst_`), never an admin's row. The backend takes `targetId` today; **the card does not
offer it yet** — most children have no address of their own and are sent nothing (`makeChild` writes
`email: ''`), and the weekly email about a child is already the parent's own switch.

### The card

**Settings → Notifications**, the last card, for everybody signed in (appended for the wardrobe's reason —
`PAGE.settings` remembers a page by its index). It draws what the server sends on the profile —
`notifyOf_` → `profileOf_` → the sign-in reply, `myProfile` and `updateProfile` — so the phone keeps no
list of its own. `setMyRoles` sends it too: tick Tutor and two more lines appear now, not on the next open.

- **Ticks**: the `.check` row (the app's only checkbox, 44px floor in px) with the roles card's two-line
  label — the CSS selectors were widened, not copied. **Saved on each tick** (`send_` with `lock` on that
  box's own row — see the review below), like the
  agreement's box: nothing here asks anybody else for anything. A failure — refused *or* lost — puts the
  tick back to what the server last said, because the tick is the request and there is no Save tile to
  press again; `send_` writes why on the line under it.
- **Always sent**: one run of words under a caption, each label saying the whole of it ("Bookings confirmed
  or cancelled"). Not greyed boxes — the Signing-in card's argument, an input that cannot be used reads as
  broken.
- **States, each one sentence instead of ticks**: a backend without `setNotify` in `DATA.features` ("The
  live backend does not have notification choices yet, so every email is sent as before." — and, for the
  admin only, "Sync backend/ and deploy a new version to switch them on." A parent cannot sync anything, and
  the words "Apps Script" on a parent's screen are what `check-flow`'s install journey reads as an offer to
  install: the first wording failed it), the list not in
  yet (an older phone's saved profile; `myProfile` brings it on this open), **no email of their own** (most
  kids: "…emails you nothing — there is nothing to turn off. If you forget your PIN, a new one goes to your
  grown-up."), and an address still waiting for its link (the ticks, under "that link is the only thing we
  send to it"). The weekly line says "not being sent yet" while `weekly_digest` is off on the config tab.
- **It fits.** The first drawing — an instruction sentence, each always-sent kind as a two-line item, a
  standing line at the foot — was 800px at 390 and **scrolled at 320 even shrunk to the 70% floor**. The
  owner has said *"I don't like scrolling. If you need to leave things more compact or smaller font."* Now:
  a parent's card is 98% at 320 and whole at 390; a tutor's, a kid's and the admin's are whole at both.
- `profileShapeOk_` was **not** given `notify` — an old backend never sends it, and that test would ask it for
  the profile on every save, for ever.

### For the owner — in Apps Script, after this is merged

1. **Pull** `backend/` into the project (the GitHub Assistant's ↓, route 1 in CLAUDE.md). Six files changed:
   `constants.gs`, `people.gs`, `dopost.gs`, `doget.gs`, `booking.gs`, `digest.gs`.
2. **Deploy → Manage deployments → edit → Version: New version.** The web app runs the version it was
   deployed at; until then the card says the live backend does not have notification choices yet.
3. **Run `ensureSchema` for the columns** — from the function dropdown, or open `/exec?setup=1` now that step 2
   has deployed the new version. It appends `messages_email`, `bookings_email`, `posts_email`,
   `referrals_email` and `approvals_email` at the end of the people tab. Until they exist a tick is refused
   with "Run ensureSchema()", and everybody is emailed exactly as before. *(Corrected 10 Oct: this step said
   there was nothing to run. An ordinary request never runs it — `autoMigrate` is called only on `?setup=`
   and `?run=` (doget.gs), since the schema work came off the page load; the header of setup.gs said
   otherwise and was wrong.)*
4. **Check the You screen**: all four stamps read `2026-10-09-d-prefs`.
5. *Optional:* sign in as a parent, Settings → last card, untick Messages — the parent's `messages_email`
   cell says `no`. Tick it again and the cell is blank.
6. **Nothing to do for `weekly_email`.** Every `no` already typed there is the Weekly progress email switch,
   off. Typing `no` (or clearing it) in any of the six cells by hand still works and is read at the next send.
7. **"I was never told"**: Apps Script → Executions, search `notify held` — each held email is a line with
   the kind, the person's id and the subject.

### Checked

- **`js/check-prefs.js`, new, on check-all's roster** — three questions, 290 things asked:
  1. *The table*: every kind has a label, a note and roles; an optional kind's column is in `SCHEMA.people`
     and not shared; an essential one has no column and a `why`; the weekly kind's column is `weekly_email`.
  2. *The source*, parsed with acorn: all 22 `notify(` calls carry a kind from the table; all 9
     `MailApp.sendEmail`s are in a place it names — essential with a reason, or asking `wants_` for its kind
     in the function named; a send anywhere else fails; `GmailApp` fails; every kind has a sender; no file
     reads a choice column itself.
  3. *Behaviour, through the real `doPost`* (check-gas-load.js, MailApp stubbed, `console.log` recorded):
     every optional kind through a real sender — messages (`sendMessage`), posts (`approvePost`),
     referrals (`register` with a code), approvals (`addPost`), bookings (`move` Say, and `sendInvites` to a
     member, with `invites.notes`), weekly (the Sunday `digestRun_` in send mode, with its `opted out` row) —
     off sends that person nothing and logs it, on sends; with **every column on every row typed `no`**, the
     essentials still go (a booking receipt and the named tutor's, "Someone has added you", "Your new PIN", a
     reported message, a family withdrawing, both "Your PIN was changed"); the token decides whose row —
     a request naming the tutor writes the parent's, no token and a made-up token are refused, an
     essential, unknown, `constructor` or wrong-role kind is refused; a parent may choose for an accepted
     child, not an asked one, not as a stranger, a tutor or an unproved parent (`why: unconfirmed`), and an
     admin may, but not for another admin; `myProfile` with no token answers nothing and with a stranger's
     answers the stranger's own; `getProfile` refuses a non-admin; a choice survives signing in again; a row
     with blank cells is sent, and a sheet without the columns is all on and refuses a tick with the
     `ensureSchema` sentence. **Sixteen mutations, each red, then green on the real files**: `wants_` always
     yes, a call without its kind, the digest reading `weekly_email` itself, `sendInvite` not asking, any
     parent for any child, an essential kind switched off, the receipt optional, Withdraw optional, the
     roles ignored, a column missing from SCHEMA, an unlisted `MailApp.sendEmail`, `notify` not logging, on
     writing `TRUE`, an admin for an admin, a sheet without the column written to, an unproved parent for a
     child. (The essential-kind mutation survived the first version — it was still refused, by the missing
     column — so the check now asks that the refusal *says* it is always sent.)
- **`check-flow.js`, three journeys, against the real backend** rather than a typed reply: a parent, a kid
  and a tutor are each shown exactly their kinds and nobody else's, all ticked, always-sent as words, the card
  last; a child with no email gets the sentence and no ticks; unticking Messages posts `setNotify` with the
  id and token, the sheet's cell says `no`, and **a reload whose saved copy has had the list taken off it**
  gets the tick back unticked from `myProfile`; a refused save puts the tick back and says why; an old
  backend's card says so (the sync instruction to the admin only), nothing to tick, Settings otherwise whole. **Eleven mutations**, each red.
- **`check/states.js`, six states**, each list asked of the real backend's `notifyOf_` when the file loads (a
  list typed there would be the file's belief about the server): a parent on a long address, a parent whose
  address waits, a kid with no email, a tutor, the admin, an old backend. `check/ui.js --screen=settings`:
  nothing new — the parent's card is 98% at 320 (92% with the waiting line), every other role's whole.
  `check/press.js --screen=settings`: 24 actions pressed against the base commit's 23 (`notify-pick` is the
  one), nothing threw, nothing inert. **It found a fault in the states themselves**: a tick pressed in "a
  parent" is a real save, which writes `USER` to `familyUser` *as that parent*, so every reload after it
  signed the run in as the parent and the Games swipes and the booking dropdowns were measured for the wrong
  person. The states now keep the stored visitor in `sessionStorage` and write it back on `leave`. The
  Games chain-flick test still misses one flick in four on some runs — **the base commit does the same in
  this container** (measured: one miss each, a different flick each time), so it is the timing, not this.
  Looked at, at 320 and 390, for every role.
- `check-digest` (the footer keeps "To stop these emails"), `check-signin` (its three-argument `notify` calls
  are essential), `check-profile` (the sign-in reply's profile is still `profileOf_`, `notify` and all),
  `check-tabs`, `check-columns`, `check-rows`, `check-access`, `check-post`, `check-payload`, `check-backend`,
  `check-const`, `check-doors`, `check-css`, `check-settings`, `check-manifest`, `check-strings`, `check.js`:
  green; all 200 `check-flow` journeys pass. `check-secrets` caught the first draft of `check-prefs` writing
  a registration PIN as a literal — it is built in pieces now, as check-signin's are.

### Review, 9 Oct — six findings, all six fixed

1. **Somebody sent the weekly email could not turn it off.** The Sunday run writes to `acceptedParents` —
   the family tab, not the role cell — and an admin may make or link a child, a tutor who was a client may
   untick Client and keep theirs. Walked through the real backend: a tutor-only row and an admin-only row,
   each with an accepted child, were offered no weekly tick, `setNotify` told them it "is not an email that
   reaches you", and `digestRun_` sent it anyway, footer pointing at the tick. The likeliest person is the
   owner. **Fix:** `parents: true` on `weekly` and `family` in `NOTIFY_KINDS`, and **one helper,
   `notifyHow_(row, kind)`** in people.gs, asked by both `notifyOf_` (the card) and `setNotify` (the
   refusal), which counts an accepted child as being a parent. A tutor with no child is still not offered it.
2. **A second tick while the first saved did nothing.** The whole card was locked for the round trip, and a
   disabled `.check` was drawn exactly like a live one. **Fix:** only the row being saved is locked
   (`lock: el.closest('label')`); each reply merges **only its own kind** into `USER.profile.notify`, so two
   replies arriving in the other order cannot repaint a stale tick; a disabled box is drawn at 45% with a
   `progress` cursor.
3. **"Your code was used" was on every card and could never be sent** — nothing hands a code out (the
   my-referral sheet is gone, the register form sends no `ref`). The rule printing was given: a switch nobody
   could ever see work. **Fix:** `hidden: true` — the kind and its column stay, `wants_` and `setNotify` still
   honour it, `notifyOf_` does not draw it. Deleting `hidden` is the whole change the day codes come back.
4. **A role cell typed `parent`, `guardian`, `kid` or `teacher` got an empty card**, and `setNotify` refused
   every kind — `notifyOf_` read `rolesOf` raw. **Fix:** `notifyRoles_` reads the cell through
   `SELF_ROLE_ALIASES` (as `selfRolesOf_` does), and a cell naming none of the four is `client`, `mainRole`'s
   answer. On the phone, a list with no kinds is now one sentence instead of "saved as you tick" over nothing.
5. **Nothing checked that the real doGet lists `setNotify`** — the one line that turns the card on; the
   journeys type it into their payloads. **Fix:** `check-prefs` asks `b.get({}).features`, as check-aimark
   asks for `aiMark`.
6. **A sender's kind was checked for membership only**, so the tutor's "Paid: a place is confirmed" moved to
   `reported`, or `joinFestive` (the admin's only Booking-updates sender) moved to `booked`, stayed green.
   **Fix:** `CALLS` in check-prefs pins all 22 `notify()` calls by place and subject to their kind(s), with
   the test of `move`'s conditional pinned too; a call nobody pinned fails, and so does a row no call matches.

**Mutations, each red, then green on the real files** — check-prefs: the tutor's paid mail to `reported`;
`joinFestive` to `booked`; `'setNotify'` deleted from doget's features; the `parents` clause out of
`notifyHow_`; the alias map out of `notifyRoles_`; `parents: true` off `weekly`; `hidden: true` off
`referrals`; `ACT.WITHDRAW` out of `move`'s test; `setNotify` back on `hasRole`; `joinFestive`'s subject
reworded. check-flow (two new journeys, five Notifications journeys in all): the lock back on the card (no
second request); the reply's whole list kept (the repaint ticks Weekly again); the empty-list sentence out.
The review's fixes ship in the same paste as the feature — this branch was never deployed. **The stamps are
`2026-10-09-d-prefs`, all four together**, because the branch took in `claude/focused-wright-blx2g6` (the
essay sheet, autosave, the quiet retry and the rest), which had moved them to `c-essay-autosave`: its
`booking.gs`, `constants.gs`, `doget.gs` and `dopost.gs` changes are inside the six files above, so one pull
carries both, and a stamp of either side's alone would have the You screen calling the other "Not deployed".

**After the merge, `check-drafts` (new on the other side, docs/history/317) named the Notifications tick** as a
box a reload would lose. It is not: a tick is a `setNotify` the moment it is ticked and a failure puts it back
to the server's answer, so there is nothing half-made on the device to keep — the agreement box's reason, and
it is on `EXEMPT` beside it with that reason.

**On the merged tree, everything was run again.** The review's own probes (a tutor-only and an admin-only row,
each with an accepted child) now see the weekly switch, turn it off, and get nothing from `digestRun_`. Nine of
the mutations above were made again on a copy of the merge — seven in check-prefs (the paid mail to
`reported`, `joinFestive` to `booked`, `setNotify` out of features, the `parents` clause out, the alias map
out, `parents` off `weekly`, `hidden` off `referrals`) and two in check-flow (the lock on the card, the whole
list kept) — and each went red, then green on the real files. `npm run check`: 58 of 62 on
the first pass; `check/press.js`, `check/cascade.js` and `check/ui.js --part=1/3` died on EADDRINUSE (another
worktree's run held the default port) and `--part=2/3` timed out its reach at a load average of 18. All four
passed run again by themselves on their own ports (`PRESS_PORT`, `CASCADE_PORT`, `UI_PORT`), as did
`check/ui.js --screen=settings`: nothing new.
