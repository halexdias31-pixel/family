## A child's handle carries no name, the old one still signs them in, and a parent's surname goes to nobody else

**The owner, 11 Oct:** *"Change usernames to be more abstract to hide the names of kids. Just use
initials and some combination which comes from date of birth or something. Also don't show surname
as some kids have different surnames and gets a bit awkward. Maybe"*

The owner does not make the design calls ("i dont choose what is best most simplest elegant"); the
main session decided the shape below and this note records every decision and why.

### 1. A child's handle is their initials and four digits

**`ej4827`**: the first letter of the first name and of the last name, lower case, then four digits
each from **2 to 9**, no separator. `handleKid_` in people.gs, beside `handleMake_`, with
`HANDLE_KID_DIGITS = '23456789'`, `HANDLE_KID_TAIL = 4`, `HANDLE_KID_TRIES = 60`.

- **Who gets one is `isChild_`** — the one test 333 uses (holds `student` and is acting as one, a
  Tutor tick still waiting counting for nothing, `pupil`/`kid` read as `student`). No second
  definition. `handleMake_` asks it of the row; callers whose row does not exist yet pass a draft
  (`register` a student `{ role, first_name, last_name }`, `makeChild` the same; `acceptInvite` no
  row, which is a grown-up). Randomise, `resetPin` (blank handles only) and `fillHandles` pass the row.
- **The digits are random, NOT the date of birth.** That is the one part of the ask not taken: a
  birthday is personal data about a child, and a handle is shown to every other user — the score
  board, every post and comment, every family card, every roster. With the initials beside it, a
  birthday is most of a child's identity. A random tail is as memorable to its owner and says nothing.
  `check-handles.js` proves the handle is not a function of the date: the same dice for two children
  who differ only in their birthday must give the same handle.
- **2 to 9 only.** No `0`/`O` or `1`/`l` to misread off a screen or down a phone; and no tail can read
  as a date — a year needs a 0 or a 1 (19xx, 20xx), a month needs one (01–12), so four digits from 2–9
  are never a year, a dd/mm or an mm/dd.
- **Four digits, no underscore.** 8⁴ = 4096 tails per pair of initials. Every candidate still goes
  through `handleTrouble_` (shape, reserved, blocklist — digits fold onto letters, so `ti75…` reads as
  a word and is drawn again — and the clash). Measured over every pair of initials and all 4096 tails:
  the worst pair loses 13% to the blocklist's folds, so sixty misses in a row does not happen.
- **Initials are the first LETTER of each name, folded to a–z** (NFKD for accents, a small table for
  letters NFKD keeps whole: `Ł`→l, `Ø`→o, `ß`→s…). Not the first a–z letter: `Łukasz` is `l`, never
  the `u` two characters in. One usable initial gives one (`e4827`); none — another script, or no names —
  gives `HANDLE_FALLBACK` where the initials would be (`friend4827`), the grown-ups' rule for a name the
  handle cannot carry.
- **Randomise keeps the initials and draws a new tail.** The initials are the child's; the tail is the
  only choice there is.
- **What the initials still say**, said plainly — and this first said it too narrowly (see *After
  review*, P1): the second letter is her surname's first, and it goes wherever her handle goes, beside her
  first name — the score board every signed-in account reads (and registration is open), every post and
  comment a signed-out visitor's payload carries, every family card and roster. A stranger can learn
  "Wren Q.". Before 342 the same places carried `wren_kind43`, with no part of the surname. **Kept
  knowingly**: it is the owner's "just use initials" and the main session's decision, a first name and a
  surname initial is the convention schools use for this, and the initial is what tells two Wrens'
  handles apart to the children who know them. Note 333 records it as a narrowing of "a child's surname
  goes to nobody". The first initial alone (`w4827`) is one change in `handleKid_` and `handleKidShaped_`
  if that call is ever made the other way.

**This reverses 2 October for children, and says so** (211, 222, 250: a handle is the first name, a
virtue and a number; 250's "existing handles are not regenerated"). A grown-up's handle is unchanged.

### 2. A grown-up's handle is unchanged — and a grown-up who was a child keeps theirs until they press Randomise

The rule is per person and decided by the child test at the moment a handle is MADE. A child who
becomes a grown-up (the test stops saying child) keeps `ej4827` — `handleIsShaped_` reads any initials
and a tail as shaped (after review: not only today's initials), so `?run=renameHandles` leaves it — until
they press Randomise, which then makes
a grown-up's. Moving a sign-in name nobody asked to move is exactly the lock-out every job here avoids.

### 3. Nobody loses their sign-in

- **An old handle still signs its person in.** `handleWasRows_` (people.gs) finds the rows whose
  `handle_was` holds what was typed, and `verifyLogin` and `forgotPin` ask it **only when no row holds
  it as its handle now** — a current handle always wins, so an old entry can never sign in a different
  person who holds that handle today. Two rows with it in their histories is refused, worded as two rows
  on one handle is. The same PIN, the same throttle, the same "Wrong PIN for that handle." And the same
  spellings: an old handle answers to whatever it answered to when it was current, a long first name
  spelled out included (`handleAnswers_`, after review).
- **An old handle is never given to anybody else.** `handleTrouble_`'s clash now refuses any entry on
  ANOTHER row's `handle_was` too (your own history is not a clash). Uniform for grown-ups as well: before
  this, Randomise could reissue yesterday's handle to the next person the same afternoon. **And none is
  ever dropped** (after review): `handle_was` kept the newest ten, which retired the slip's handle at the
  eleventh press; it keeps every one now, and Randomise stops at `HANDLE_WAS_MAX` (200) instead.
- **The child is told.** The sign-in reply carries `handleMoved: { was, now }` and a sentence ("Your
  handle is @ej4827 now. @ella_kind42 still signs you in, but use @ej4827 from now on."); the phone opens
  it in the sheet it already uses for sentences that must not be lost (`afterSignIn_`, me.js), titled
  "Your handle has changed". Every time the old one is used — every time is a child who has not learned
  the new one yet. A phone already signed in learns it from `myProfile`, which carries `handle` (and
  `friends`) now; `profileRefresh_` takes both, says the new handle once (a toast, and "You were @…"
  under the handle, `HANDLE_SAID`), and the next open says nothing.
- **Sessions are keyed by `person_id`**, so moving a handle signs nobody out.
- **Friends lists move with the handle** (`handleFriendsMove_`). `friends` is a comma list of handles,
  drawn by matching `students[].handle`, so a moved handle dropped its friend off every list — Randomise
  had done that since it existed. Randomise and the migration both rewrite every cell that named it.

### 4. The children already on the sheet: `?run=kidHandles`, previewed first

An admin's one-off, the `previewFromGitHub` rule: **look, then do.**

```
…/exec?run=kidHandles&name=Your%20Name&pin=0000            ← the preview: writes NOTHING
…/exec?run=kidHandles&name=Your%20Name&pin=0000&arg=apply  ← moves them
```
(your own name and PIN, not these.) The preview answers with `children`, `toMove`, `leftAlone`,
`signInByHandle` (the ones with no email — the ones to tell), `inAnotherHistory` and
`grownUpsSurnameInHandle` (after review, by id) and each child by `person_id` with the
handle they have and the initials they would get (`ej····`: the digits are drawn when it runs for real,
so a preview showing them would show handles nobody gets). `apply` moves every child whose handle is not
already their initials and a tail, puts the old one at the FRONT of `handle_was` (`handleWasWith_`),
stamps `handle_changed_at`, moves the friends lists, and answers with the real before and after. A
second run moves nobody. Grown-ups are never touched; `renameHandles` now leaves every child to this job.

**Why an admin's job, not the next sign-in (b) or `autoMigrate` (c).** It is visible and reversible
(the old handle keeps working), and it reaches every child — one who never signs in would otherwise
keep a name-bearing handle on the score board and under their posts indefinitely. Changing a handle in
the middle of somebody signing in cannot be previewed. `autoMigrate` runs on every `?run` and `?setup`
with nothing shown first, and `check-signin.js` already holds that `ensureSchema` changes no handle a
child has. And not folded into `renameHandles`, which writes as it goes — and on the live sheet would
also move five grown-ups whose handles are not the generated shape.

**The private Ledger snapshot of 10 Oct** (read in place; counts only): 17 people with a name, **8
children, all 8 would move**, **7 of them sign in by handle** (no email), 8 distinct pairs of initials
(no two children share a pair), and 6 private grown-ups (§5). No child has any `handle_was` yet.

### 5. Surnames

**A child's surname still goes to nobody** (333) — confirmed on every exit: the net is unchanged for
children (`jsonOut`, the kept `doGet` body, `freshFor_`, `mailOut_`), and a handle now carries no part
of a child's name past its initials, so handles, receipts, emails, DMs, posts, booking pages, the family
cards and "Manage your child" carry no child's surname.

**And now a parent's surname goes to nobody else either** — the awkwardness the owner describes is a
child called by her first name beside a parent called by his whole one, which says on every card that
the two surnames differ.

- **Who is covered — `namePrivate_`:** everybody who is not a child and not ACTING as a tutor or an
  admin (`actingRole_`): a client, a parent who is also learning, somebody whose only role is a Tutor
  tick still waiting. 6 on the live sheet.
- **Who keeps a whole name — approved tutors and admins**, on every card, to everybody: families book a
  tutor by name, and an admin is the business.
- **Who still sees a private grown-up's whole name — themselves and any admin.** Unlike a child's. So it
  is a VIEWER-AWARE half of the same net, not a second net: `NET_VIEWER_` (constants.gs) says who a reply
  or an email is for; `nameFor_` and `kidNamesSpans_` ask `netSeesWhole_`. A grown-up's own payload,
  sign-in reply and mail keep their whole name — which is what keeps the fourteen places the phone asks
  "is this mine?" against `USER.name` working (book.js, find.js, mat.js, posts.js, receipt.js, tiles.js)
  without one line of the phone changing. A child's half never asks: it is nobody's.
- **Where the viewer is set:** `doGet` from the token (before the cache is asked, so a hit's fresh half
  agrees; the stored body is keyed on the same person, `payloadKey_`); `doPost` after the gate — the
  token's row, never a name or id off the request, because a claim to be an admin would be a way to every
  grown-up's surname; `loginReplyFor_` to the row signing in; `register` to the new row (their own
  reply); `verifyEmail` to whoever owns the inbox the link went to; `?run=` to the admin who proved
  their PIN. **Reset to nobody at the top of `doGet` and `doPost`** — Apps Script keeps an instance
  between requests. **Every email per recipient** (`mailOut_` → `mailViewer_`): the one row with that
  address once it is proved; several addresses, an address on no row, or one nobody has proved (a typo's
  inbox is a stranger's) is nobody.
- **Applied in what the server sends**, as 333 was: the phone never receives what it must not show.
  `nameToOthers_` is the name as anybody else may have it — what the net replaces a whole name with, and
  what a referral code is cut from (a code is handed round). Two private people with one first name are
  told apart by handle (`Pip (@pip_kind42)`), children and grown-ups counted together, since both read
  "Pip". A tutor answering a parent's seat by the name shown still reaches it (`move`'s `shownAs`, which
  asks the same net for the same viewer). On the way back in (`kidNamesBack_`) the same viewer rule: text
  the net shortened for a tutor and saved again keeps the parent's whole name in the sheet.
- **A private grown-up whose whole name a tutor or admin also answers to is left out of the net** — that
  name is on a public card, and the net cannot tell which of the two a sentence meant.
- **An open class's `events` go only to the people on it and an admin** (after review — this first said
  they "still go to strangers", and they named every family three lines below the slots that blank them).
  An invitation to a typed address names the inviter by first name — the uniform rule; the recipient
  knows who asked them from the session itself.
- **"Confirmed on every exit" depends on the doors that answer a NAME** (after review): `register` and
  `makeChild` no longer say "there is already an account in that name", and a festive join's typed list
  is cut to first names before other families read it. See *After review*, P2 and P3.

**This narrows 333's "a grown-up's is their whole name"** to tutors and admins, and to the person and an
admin for everybody else.

### Front end (kept small — `fix-card-settings` moves this card)

- The line under Randomise no longer says what a handle is made of ("Your first name, a word that suits
  you and a number…" was wrong for a child): *"Randomise makes a new one — if you sign in with your handle,
  that is your new sign-in name."* The server is the one that knows which shape.
- "Add a friend"'s placeholder no longer shows a first-name handle.
- `afterSignIn_` opens the sheet for `handleMoved`; `profileRefresh_` adopts `handle` and `friends`.
  Two races are closed while doing it, both by `ACCOUNT_AT_` (`accountChanged_`): Randomise marks it when
  its answer lands and a friends list saved here marks it on the press and on the answer, so a `myProfile`
  asked before either is asked again rather than putting the old handle or the old list back. (The first
  version tested Randomise's race by `HANDLE_SAID`'s text, which knew only the last press — see *After
  review*, C2.) And the device's chip for a moved handle becomes the new one (`handleRename_`).
- No CSS changed, so `--css-version` stays.

### Checked

- **`check-handles.js`**: 400 children's handles over ten names (accents, a stroke, an apostrophe, a
  digit in front, one name, the other, another script, none) — the initials exactly, four digits 2–9, no
  part of either name past its initial, the gate's yes, read back as shaped; the handle not a function
  of the birthday; who gets one (`isChild_`, seven role shapes); Randomise keeps the initials; never an
  old handle of somebody else's (seven in eight taken, and with the dice pinned the walk falls to the
  fallback); the blocklist against every pair of initials and all 4096 tails; `renameHandles` leaves
  children and a grown-up's initials-and-tail alone; `fillHandles` gives a blank child the child's
  shape. In the cut `verifyLogin`: an old handle signs its child in and says the new one; an older one
  too, said as stored; the new one says nothing moved; a handle somebody holds NOW wins over the one who
  had it; an old handle in two histories is refused.
- **`check-signin.js`** (section 10, the real backend): a parent's child, a self-registered child, a
  parent's own (a grown-up's), the mail naming the new handle; the preview writes nothing (zero writes,
  the people tab byte-identical) and counts 5 children, 3 to move, 2 by handle, 2 already shaped; apply
  moves only children, the old handle first in `handle_was` with the history behind it, the friends
  lists moved; a second apply moves nobody; the old handle and an older one sign in, the reply says the
  new one; "Forgotten your PIN?" by the old handle reaches the parent; `myProfile` carries the handle; a
  current holder of an old handle is who it signs in; Randomise on a child keeps the initials and the
  handle it replaced still signs in.
- **`check-surnames.js`** (section 7): every grown-up's surname looked for in every payload (fresh and
  kept), sign-in reply, `myProfile` and inbox of nine viewers and in every email by its recipient — 211
  looks, none found where it must not be; present for themselves and the admin; tutors' whole names on
  the public list; first names on the tutor's roster and inbox and under the post; the notepad saved a
  line longer keeps the whole name in the sheet; two Pips told apart by handle; a tutor declining
  `Pip (@pip_kind42)` reaches her seat. And the made child's handle is `mq` and four digits.
- **`check-profile.js`**: the claim a child is sent names the parent by first name.
- **`check-flow.js`**: the surname journey hunts Pip's and Ola's surnames for every visitor but
  themselves and the admin (Pip is a visitor now), and the admin must be shown "Pip Ashdown"; a child
  signs in through the real sign-in box with the old handle on her slip and the sheet says the new one;
  a phone signed in before the move takes the new handle and friends list from `myProfile` and says it
  once.
- **Fixtures** say what `doGet` sends: who reacted and a comment now name "Priya"; the long name the
  layout rules need is a tutor's (`Carl Everyteacher-Longername`), since only a tutor's whole name
  reaches anybody else.

**The run, on the committed files:** `check-flow.js` all 327 journeys (four parts); 52 of the suite's 54
fast checks green — `check-scope` and `check-dead` are red on the base commit too, with the same findings
(`check-dead`'s list is one shorter here: `handleIsShaped_` is called now); `check/ui.js` for account,
settings, feed and dm, nothing new in 415 combinations; `check/press.js` for the same four, every press
answered — its swipe pass (a flick chain on Games, Draw at 844×390 in Find) went red under a machine load of
about twenty, and went red on the base commit too.

**Merging with `fix-card-settings`** (which moves Randomise into editing your own card), measured by a
trial `git merge-tree`: one conflict in `js/me.js`, the Settings "Signing in" card that branch deletes —
take theirs, and put this wording into their `cardHandleHtml_` ("Randomise saves a new one at once, and
Cancel does not put the old one back — if you sign in with your handle, that is your new sign-in name",
without the first-name sentence); and `docs/history/README.md`, where both append a line. Everything else
— `profileRefresh_`, `afterSignIn_`, `friendsSave`, the journeys, the states, the notes — merges by itself.
(Round 1 adds a conflict in the Randomise handler and lifts the `HANDLE_SAID` dependency — see *After
review*, "Merging".)

**Mutations, each alone, red for its own reason, the real files green again after:**

| mutation | red in |
|---|---|
| a child's handle built from the first name (`handleFirst_` as the head) | `check-handles` ("ella3393 … does not start with the initials ej"), `check-signin` (the made child's handle carries her name) |
| the tail read off the date of birth | `check-handles` (two children who differ only in their birthday given different handles) |
| an old handle asked before the current one | `check-handles` (`mo_brave33` signed in P14, who used to have it, not P13, who has it), `check-signin` |
| the preview writes (`apply` always true) | `check-signin` (the preview counts and rows, and what apply then had left to do) |
| a parent's surname reaches another user (`namePrivate_` = children only) | `check-surnames` ("Pip Ashdown" in who reacted and "Tess Lowe" in an open class's events, for a stranger, fresh and kept) |

Stamps: `2026-10-11-n-kid-handles`, all four.

### After review (round 1)

Three reviewers read `01adec5` and `18278c5` — one for privacy, one for "nobody is locked out", one for
what the checks actually hold. Every finding was reproduced on that head first. Each fix has a rule that
was red before it (on the head's own files, or with the old line put back) and is green after; the table
at the end is the proof. Pre-existing faults the reviewers found on the way are fixed too, because each
contradicted something this note claimed.

**Privacy**

- **P1 — the surname initial goes further than §1 said** (should-fix). §1 said one letter of a child's
  surname shows "only when two children share a first name". In fact the handle travels beside her first
  name everywhere: a signed-out visitor's payload carries her posts as `author: "Wren", handle: "wq3572"`,
  and anybody who registers (the door is open, a PENDING row signs in) sees every child on the score board
  the same way. **Kept, knowingly — option (b)**: the initials are the owner's ask and the main session's
  decision, first name plus surname initial is the convention schools use, and the initial is what tells
  two Wrens apart to the children who know them. §1, the comment over `HANDLE_KID_DIGITS` and note 333 now
  say exactly how far it goes. Option (a), the first initial alone, is one change in `handleKid_` and
  `handleKidShaped_` if the main session prefers it.
- **P2 — a festive join's typed names reached strangers** (pre-existing). `joinFestive` logged the parent's
  "Who is coming?" words as typed, into an open job whose `events` went to every visitor — a surname of a
  child who is no row the net knows, and every family's first name as `actor` three lines below the slots
  that blank names for anybody not on the job. Now each name goes on the event as its first word
  (`typedFirstWords_`, `typedKids_`'s rule — "just two" becomes "just"; the admin's email keeps the words as
  typed), and `doGet` sends `events` only to the people on the job and an admin (`iAmIn`, the slots' own
  test; the phone reads events only for the dates on a booking's stage ticks, a document only somebody on
  the booking sees). §5's "an open class's events still go to strangers" is struck.
- **P3 — `register` confirmed a guessed whole name to anybody** (pre-existing; the published initial made
  it cheaper). It asked `findPerson(full)` before the address, so an address already on a row plus a guessed
  name answered "There is already an account in that name" or "That email is already registered", writing
  nothing either way: four guesses, zero writes, the review measured. `makeChild` named the clash to any
  confirmed parent. Now the address is asked first; a name clash is "We could not make that account. If you
  have one already, sign in — or ask us to help." (and the make-child form's equivalent), naming nothing; and
  each clash with a PRIVATE whole name (`namePrivate_`; a tutor's is public) is counted, and five in a day
  pause EVERY new account, hit or miss, until the day has passed (`nameClashNoted_`, `NAME_CLASH_MAX`).
  **What is left, said honestly:** a refusal still means "one of these is taken". Finding that out now costs
  a fresh address per guess, writes a PENDING row and mails that address on every miss (which an admin sees),
  and stops after five hits a day. Two accounts with one whole name would close it entirely and is not done:
  `findPerson` and everything that resolves a person by name would have two answers. §5's "confirmed on
  every exit" depends on this, and says so.
- **P4 — a private grown-up's hand-typed handle can carry their surname** (nit). The net takes it out of
  their name and the handle carries it back. Not moved (their sign-in name is theirs): reported by id as
  `grownUpsSurnameInHandle` in `?run=kidHandles`'s preview and `surnameInHandle` in `renameHandles`'
  report (`handleSurnameIn_`). The Ledger snapshot has none.

**Nobody locked out**

- **S1 — an old handle no longer answered to a long first name spelled out** (should-fix). `handleRows_`
  lets `christopher_kind42` stand for `christoph_kind42`; `handleWasRows_` and `handleWasEntry_` compared
  keys exactly, so the move refused at the sign-in box and at "Forgotten your PIN?" the spelling the child
  had always used. One matcher now, `handleAnswers_`, for the handle and every old one; a prefix or a near
  miss is still nothing.
- **S2 — `handle_was` was trimmed to ten** (should-fix). Ten Randomise presses after the move retired the
  slip's handle: it stopped signing her in, and `handleTrouble_` could give it to the next person with that
  first name, whose throttle the child's tries would then count. Nothing is trimmed now
  (`handleWasWith_`), and `randomiseHandle` refuses — writing nothing — once the history holds
  `HANDLE_WAS_MAX` (200, about four thousand characters of a fifty-thousand cell). `name_was` keeps its own
  ten: an old name is only what the net recognises, never a credential. `handleWasWith_` also no longer
  writes a handle twice in a row (a re-run after a failed write).
- **S3 — a run that failed part-way left friends lists wrong for good** (nit). The re-run found the moved
  children "already shaped" and had no moves of its own. The lists are now mended from EVERY child's
  history — an entry on one row's history only, that row a child's, nobody holding it now — and the cache
  is cleared in a `finally`.
- **S4 — one child's move was all-or-nothing only when the columns were adjacent** (nit). `kidHandles`,
  `randomiseHandle` and `renameHandles` now write `handle_was` first, in its own write, then the handle; a
  failure between them leaves an extra history entry, never a new handle with no history.
- **S5 — a handle Randomise reissued before 342 became ambiguous after the move** (nit). The preview lists
  such children by id (`inAnotherHistory`) and says to take the entry off the other row first. Not guessed
  at sign-in: "two accounts have had it" stays a refusal. None on the snapshot.
- **S6 — a later run moved a child whose surname was corrected** (nit). A child's shape is now any one or
  two letters (or the fallback) and four digits from 2 to 9 (`handleKidShaped_`), not today's initials.
  Randomise still draws from the names as they are.
- **S7 / C1 — the family iPad kept the old, name-bearing chip** (should-fix). `handleRename_` (me.js)
  replaces it in place when a sign-in by an old handle, `myProfile` or Randomise learns the handle moved; a
  device that never had the chip, or forgot it with ✕, is not given one.
- **S8 / C13 — the unknown-handle refusal still showed a grown-up's handle as its example** (nit). It now
  says "or your handle, as it is on your card." (check-flow's stub of that sentence moved with it).
- **Not done, and why:** neither `?run` job nor Randomise takes the script lock, so a Randomise landing
  during an apply could be overwritten. The reviewer did not report it — theoretical, an existing pattern,
  and not reproducible in the single-threaded harness — and neither job is run while children are using it.

**What the checks hold**

- **C2 — two Randomise presses under one slow `myProfile` put the first handle back** (should-fix). The
  guard compared `HANDLE_SAID`'s text with the reply, which knew only the last press. Randomise now marks
  `ACCOUNT_AT_` when its answer lands (`accountChanged_`), so any `myProfile` asked before it is asked
  again; the text test is gone, and with it the dependency on `HANDLE_SAID`'s wording. `friendsSave` marks
  it on the answer too, not only on the press.
- **C3 — nothing pressed Randomise or added a friend** under a held `myProfile`: two journeys now do, and
  three more hold the chips and the two-press race (`check-flow.js`, beside the other 342 journeys).
- **C4** `forgotPin`'s "a current handle wins", **C10** Randomise moving friends lists, **C12** "not the
  birthday" at `makeChild` and `kidHandles` (two worlds, the same dice, different birthdays) and a prefix of
  an old handle refused — all in `check-signin.js` section 11 and `check-handles.js`' sign-in table.
- **C5** `mailOut_`'s `finally` (two parents' `move` replies in a class taught by an admin), **C6** an open
  action claiming the admin's id, **C7** a grown-up with a Tutor tick still waiting (Tess ticks it before the
  viewer sweep), **C11** referral codes — `check-surnames.js` section 7 and the new section 8, with P2's and
  P3's rules.

**The Ledger snapshot of 10 Oct, after round 1** (read in place, piped, counts only): 8 children, all 8 would
move, 7 sign in by handle, 0 could not be given one, 0 in another row's history, 0 private grown-ups with
their surname in their handle (of 6 private grown-ups). An in-memory apply moved 8; every old handle and
every new one resolves to exactly its own child (8 and 8); 0 friends lists to move; a second run moves 0.

**Merging with `fix-card-settings`, updated:**
- `js/me.js`, the Randomise handler (`on('handle-shuffle')`): round 1 adds `accountChanged_();` and
  `handleRename_(d.was, d.handle);` at the top of its `.then`. That branch rewrites the handler, so this now
  conflicts: put both lines right after `HANDLE_ASKING = false;` in their version, and keep their section
  lock and DATA patching.
- `profileRefresh_`: the `handleStale` lines are gone (replaced by `ACCOUNT_AT_`), and `handleRename_` is
  called where a changed handle is adopted. Their hunk is elsewhere in the function; take both.
- `HANDLE_SAID`'s "You were @…" text is no longer read by anything — the old merge note's constraint is lifted.
- Their `HANDLE_NAME_FIRST_` guard compares only `first_name` ("a handle is your first name and a virtue").
  A child's handle is built from the last name's initial too, so it should compare `last_name` as well and
  its sentence should change (the checks reviewer's note).
- `docs/history/README.md`: both branches append one line.
- `js/check-flow.js`, the surname journey's `check('a child is her first name on every screen…'` line: both
  branches retitled it (this one added the parent half, that one "her own boxes on Settings and her own
  card's Edit"). Keep this one's `GROWN_` block above it and join the two titles; everything else in the
  journey merged by itself in the trial (`git merge-tree`, against `fix-card-settings` at `339b1bb`).
- `style.css` conflicts on `--css-version`, as it does merging the base without this branch: not this branch's.

**Round 1's mutations, each alone in a scratch copy, red for its own reason, the copy restored byte for byte
and compared with the real files after each** (25):

| mutation | red in |
|---|---|
| an old handle matched exactly only (S1) | `check-handles` (Christopher's spelled-out old handle refused), `check-signin` (sign-in and "Forgotten your PIN?") |
| `handle_was` trimmed to ten again (S2) | `check-handles` (nothing falls off; 201 kept by renameHandles), `check-signin` (twelve presses: the slip refused and free to reissue), `check-profile` (15 presses kept 10) |
| friends lists mended only from this run's moves (S3) | `check-signin` (a re-run after a failure leaves Fin's list naming nobody) |
| the handle and its history in one write (S4) | `check-signin` (`handle_was` apart from `handle`: a child with a new handle and no history, locked out) |
| no `inAnotherHistory` (S5) | `check-signin` |
| a child's shape is today's initials (S6) | `check-handles` (shape cases; a grown-up's `gg2345` renamed), `check-signin` (a corrected surname moved again) |
| the refusal shows a grown-up's handle again (S8) | `check-handles` (the sentence), `check-signin` |
| a festive join's typed names kept whole (P2) | `check-surnames` ("Bo Kettleworth" where the other families read it) |
| an open job's events to everybody (P2) | `check-surnames` (every family's name to a stranger and a student not on it) |
| `register` asks the name before the address (P3) | `check-surnames` (a guessed real name answered differently from a wrong one) |
| no pause after five clashes (P3) | `check-surnames` |
| `makeChild` names the clash (P3) | `check-surnames` |
| `handleSurnameIn_` reports nobody (P4) | `check-handles`, `check-signin` |
| "Forgotten your PIN?" asks the old handle first (C4) | `check-signin` (the PIN went to the grown-up of the child who used to have it) |
| `mailOut_` does not put the viewer back (C5) | `check-surnames` (each parent's reply names the other whole, built for the tutor-admin) |
| an open action's viewer from `personId` (C6) | `check-surnames` (a stranger claiming the admin's id is shown "Tess Lowe") |
| `namePrivate_` reads the role cell (C7) | `check-surnames` (Tess, Tutor tick pending: "Tess Lowe" on the tutor's roster) |
| Randomise leaves friends lists (C10) | `check-signin` |
| the referral code from the whole name (C11) | `check-surnames` (`PIPASH…`) |
| the move's tail from the birthday (C12) | `check-signin` (two worlds, the same dice: different handles) |
| `makeChild`'s tail from a posted birthday (C12) | `check-signin` |
| an old handle answered by a prefix (C12) | `check-handles` (`ella_kin`, `ella_kind4`), `check-signin` (`christoph_kin`) |
| `handleRename_` does nothing (C1) | `check-flow` (the chip after a sign-in by the old handle, after `myProfile`, after Randomise) |
| Randomise does not mark `ACCOUNT_AT_` (C2) | `check-flow` (two presses and one press under a held `myProfile`) |
| a friends save does not mark it (C3) | `check-flow` (the held reply puts the old list back) |

The guards the review found working but unheld (C4–C7, C10–C12, and the friends-save half of C3) pass on
`18278c5` too — their rules are proved by the mutations above. The rules for the faults (S1–S6, S8, P2,
P3, P4, C1, C2) were also run on `18278c5`'s own files: 12 of `check-signin`'s new rules, 7 of
`check-surnames`' and 3 of the five new journeys red there.

**Round 1's run, on the final files** (a machine load of 35 to 45 throughout, shared with other builders):
- `check-flow.js`, all 332 journeys in four parts (327 and the five new): 330 at the first pass. The two that
  failed were Games clocks ("just a minute keeps its round…", "a round left for the Saved column…"), timed
  against a wall clock under that load; both pass alone, and nothing in this branch touches Games.
- The fast suite, every `js/check-*.js` but `check-flow` and the harness files: all green but `check-dead`,
  red on `cafb838` too with the same names less `handleIsShaped_` (called again). `check-secrets` caught a
  test PIN this round wrote into `check-surnames.js` (fixed, the parts put together as `check-signin`'s
  `ZERO` is); `check-submissions` was red at 23:35 UTC on this branch and on `cafb838` alike — "today" is a
  London date and the harness's is UTC — and green after midnight. `check-scope` is green, on `cafb838` too.
  `check-funnel` was stopped at its 590-second limit under that load; it reads the library, not this.
- `check/ui.js` for account, settings, feed and dm: nothing new in 414 combinations (account's and feed's
  "not reachable" lists are the builder's). Feed's first run lost a state to "the half second after the tap
  never finished" and dm's to a screenshot timeout waiting for fonts; both reran clean.
- `check/press.js --no-swipe` for the same four: every press answered.
