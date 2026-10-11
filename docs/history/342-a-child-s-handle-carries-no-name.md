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
- **What the initials still say**, said plainly: `Wren (@wq4827)`, beside a second Wren, shows the first
  letter of her surname. That is what "just use initials" asked for, and it is one letter.

**This reverses 2 October for children, and says so** (211, 222, 250: a handle is the first name, a
virtue and a number; 250's "existing handles are not regenerated"). A grown-up's handle is unchanged.

### 2. A grown-up's handle is unchanged — and a grown-up who was a child keeps theirs until they press Randomise

The rule is per person and decided by the child test at the moment a handle is MADE. A child who
becomes a grown-up (the test stops saying child) keeps `ej4827` — `handleIsShaped_` reads it as shaped
for that row's names, so `?run=renameHandles` leaves it — until they press Randomise, which then makes
a grown-up's. Moving a sign-in name nobody asked to move is exactly the lock-out every job here avoids.

### 3. Nobody loses their sign-in

- **An old handle still signs its person in.** `handleWasRows_` (people.gs) finds the rows whose
  `handle_was` holds what was typed, and `verifyLogin` and `forgotPin` ask it **only when no row holds
  it as its handle now** — a current handle always wins, so an old entry can never sign in a different
  person who holds that handle today. Two rows with it in their histories is refused, worded as two rows
  on one handle is. The same PIN, the same throttle, the same "Wrong PIN for that handle."
- **An old handle is never given to anybody else.** `handleTrouble_`'s clash now refuses any entry on
  ANOTHER row's `handle_was` too (your own history is not a clash). Uniform for grown-ups as well: before
  this, Randomise could reissue yesterday's handle to the next person the same afternoon.
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
`signInByHandle` (the ones with no email — the ones to tell) and each child by `person_id` with the
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
- **Not changed, and why:** an open class's `events` still go to strangers (the names in them are netted
  now, so nothing is shown that should not be; whether strangers need the events at all is a separate
  question). An invitation to a typed address names the inviter by first name — the uniform rule; the
  recipient knows who asked them from the session itself.

**This narrows 333's "a grown-up's is their whole name"** to tutors and admins, and to the person and an
admin for everybody else.

### Front end (kept small — `fix-card-settings` moves this card)

- The line under Randomise no longer says what a handle is made of ("Your first name, a word that suits
  you and a number…" was wrong for a child): *"Randomise makes a new one — if you sign in with your handle,
  that is your new sign-in name."* The server is the one that knows which shape.
- "Add a friend"'s placeholder no longer shows a first-name handle.
- `afterSignIn_` opens the sheet for `handleMoved`; `profileRefresh_` adopts `handle` and `friends`.
  Two races are closed while doing it: a `myProfile` asked at open and answered after Randomise landed
  would have put the old handle back and called the new one the old — a reply naming the handle
  `HANDLE_SAID` says this phone just left is older than the press and is not taken; and a friends list
  changed on the phone marks `ACCOUNT_AT_` (`friendsSave`), so a `myProfile` asked before it is asked
  again rather than putting the old list back.
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
`HANDLE_SAID` must keep its "You were @…" text: `profileRefresh_` reads it to tell a stale reply.

**Mutations, each alone, red for its own reason, the real files green again after:**

| mutation | red in |
|---|---|
| a child's handle built from the first name (`handleFirst_` as the head) | `check-handles` ("ella3393 … does not start with the initials ej"), `check-signin` (the made child's handle carries her name) |
| the tail read off the date of birth | `check-handles` (two children who differ only in their birthday given different handles) |
| an old handle asked before the current one | `check-handles` (`mo_brave33` signed in P14, who used to have it, not P13, who has it), `check-signin` |
| the preview writes (`apply` always true) | `check-signin` (the preview counts and rows, and what apply then had left to do) |
| a parent's surname reaches another user (`namePrivate_` = children only) | `check-surnames` ("Pip Ashdown" in who reacted and "Tess Lowe" in an open class's events, for a stranger, fresh and kept) |

Stamps: `2026-10-11-n-kid-handles`, all four.
