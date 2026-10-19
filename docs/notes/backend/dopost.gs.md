# backend/dopost.gs

The full text of comments in `backend/dopost.gs` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — 70_doPost.gs (8 of 8) EVERY ACTION.

top level, before `DOPOST_VERSION`

```
/* ==================================================================================================
   @family. — 70_doPost.gs   (8 of 8)

   EVERY ACTION. One function and one gate: `ACTION_ACCESS` in 00_constants says who may
   do what, `accessDenied` in 30_booking enforces it once, and then the handlers run.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */
```

### ---------- THIS FILE'S OWN STAMP

top level, before `DOPOST_VERSION`

```
/* ---------- THIS FILE'S OWN STAMP ---------------------------------------------------------------
   ONE VERSION STRING IN `constants.gs` DESCRIBED SIX FILES, and Apps Script is pasted a file at
   a time — so pasting constants.gs alone moved the number the You screen shows while every
   handler stayed where it was. The screen said `2026-08-14-features` and the backend did not
   have `openWaitlist`, which is the version indicator actively lying: worse than none, because
   it is the thing you check to rule the deploy out.
   Each file that can go stale on its own now says so on its own. */
```

### AND IT SAYS HOW LONG.

in `signInRow_`

```
/* AND IT SAYS HOW LONG. "Try again in a few minutes" is a sentence you cannot act on: it is
     the same words whether the wait is one minute or an hour, so the only thing to do with it
     is keep pressing — which is what makes the wait longer. A number is a thing somebody can
     wait out. See `authWaitMins_`. */
```

### EXCEPT FOR THE PIN THAT WAS JUST EMAILED, which is the way out of the lock and would otherwise be refused exactly when it was asked for (181).

in `signInRow_`

```
/* EXCEPT FOR THE PIN THAT WAS JUST EMAILED, which is the way out of the lock and would otherwise
     be refused exactly when it was asked for (181). Five misses at it retire it, so the lock still
     holds against a guesser — and a mail to the account's own address carries a link no miss can
     retire, so a squatter typing wrong PINs on purpose cannot keep its owner out (`authResetKey_`). */
```

### ---------- A WRONG ADDRESS AND A WRONG PIN SAY DIFFERENT THINGS NOW

in `signInRow_`

```
/* ---------- A WRONG ADDRESS AND A WRONG PIN SAY DIFFERENT THINGS NOW ---------------------
       ASKED FOR AS *"make the error codes more specific. if its username not recognised then say
       that. if pin wrong then say that."* It used to be one sentence for both, on purpose:
       telling somebody the address was right is telling a guesser half the answer, and it lets
       anybody find out whether an address has an account here. The owner has chosen being told
       which half was wrong over that. What still stands between a guesser and a PIN is the
       throttle above, which is untouched. */
```

### `by` IS WHICH DOOR WAS USED, not whether the row has an address:

in `signInRow_`

```
/* `by` IS WHICH DOOR WAS USED, not whether the row has an address: a student with an
         address who signed in by handle typed a handle, and "wrong PIN for that email address"
         would name a thing they never typed. Left out, it is the old rule. */
```

### ---------- AN UNCONFIRMED ADDRESS NO LONGER KEEPS ANYBODY OUT

in `signInRow_`

```
/* ---------- AN UNCONFIRMED ADDRESS NO LONGER KEEPS ANYBODY OUT -----------------------------------
     The owner, 6 Oct: *"dont make them have to need to verify their email to login"*. A `PENDING`
     row used to be refused here until its link was opened, and the link was where sign-ups
     stalled — a child waiting on a grown-up's inbox, a parent whose mail went to spam. The PIN is
     the proof of who is signing in; the link proves only that the ADDRESS reaches them. So the row
     stays `PENDING` until the link is opened, and that still matters where an address is USED —
     no mail but the link and "Forgotten your PIN?" goes to a `PENDING` address (`addressPending_`),
     no child is tied to a `PENDING` account by any door (`confirmFirst_`), the emailed PIN used ends
     every other session on the row whatever its state (`authResetUse_`), and Google proving a
     `PENDING` address also takes away the PIN its registrant chose (`googleLogin`) — but it no longer
     decides whether somebody may sign in.
     WHAT THAT COST, FOUND BY THE PR #130 REVIEW: a PIN on a self-made row proves who REGISTERED, not
     who owns the address. Each of those is a place an unproved address was being trusted as if it had
     been proved, which the sign-in refusal used to hide. */
```

### ---------- A ROW WITH NO ID IS GIVEN ONE BEFORE A SESSION IS MADE FOR IT

in `signInRow_`

```
/* ---------- A ROW WITH NO ID IS GIVEN ONE BEFORE A SESSION IS MADE FOR IT -------------------------
     A SESSION IS `{ id }`, AND `authWhoIs_` REFUSES AN EMPTY ONE. So a child typed into the sheet
     after the last deploy — no `person_id` until `ensureSchema` next ran — was told "Signed in", and
     the first thing they pressed answered "Signed out — please sign in again", every time. The id is
     the same shape `ensurePersonIds` gives, written now, once, on the row that needs it. */
```

### ---------- SIGNED IN BY A HANDLE THAT HAS MOVED ON (342)

in `signInRow_`

```
/* ---------- SIGNED IN BY A HANDLE THAT HAS MOVED ON (342) ---------------------------------------------
     A child whose handle `?run=kidHandles` (or their own Randomise on another phone) moved typed the old
     one. It let them in — locking a child out of their own account over a name nobody asked them about
     would be the worst way to tell them — and this says what it is now, every time the old one is used,
     because every time is a child who has not learned the new one yet. */
```

### ---------- THE CONFIRMATION LINK, TO AN ACCOUNT'S OWN ADDRESS

top level, before `linkMail_`

```
/* ---------- THE CONFIRMATION LINK, TO AN ACCOUNT'S OWN ADDRESS ---------------------------------------
   `register` SENDS IT ONCE AND `resendLink` SENDS IT AGAIN, and they are one body so the two cannot
   drift: the second copy is the one somebody whose first went to spam actually reads, and it has to say
   everything the first did — the line for whoever did not make the account most of all. Sent directly
   rather than through `notify`, which looks the address up on the row and refuses a PENDING one; the
   point of this mail is to prove that THIS address reaches this person. Throws as `MailApp` does, and
   each caller says what a failure means for it. `r` needs only `first_name`, `email` and `handle`. */
```

### ---------- AND WHAT TO DO IF YOU DID NOT MAKE IT

in `body`

```
/* ---------- AND WHAT TO DO IF YOU DID NOT MAKE IT -----------------------------------------
           Since 6 Oct an account signs in before its link is opened, so whoever typed THIS address may
           be signed in already, and this email is the only thing its real owner is ever sent. The way
           back is the one that proves the inbox: the emailed PIN, typed back, replaces theirs and signs
           everybody else out (`authResetUse_`) — whether or not the link was opened first, since round
           two of the PR #130 review. "Do not open the link" stays because opening it confirms an
           account somebody else holds, and a confirmed account is one a child can be put on.
           THE REVIEW'S OBJECTION, ANSWERED RATHER THAN IGNORED: when the address is a parent's TYPO,
           this line tells the stranger who owns it how to take the account. They are its address's
           owner, and what they would take holds no child (`confirmFirst_`) and was mailed nothing; the
           parent finds out at once — signed out, PIN gone — instead of never. */
```

### NOT SET HERE. It used to be, on the grounds that a POST is a write — and `messages` is a POST that reads an inbox, which meant opening that widget threw the

in `doPost`

```
/* NOT SET HERE. It used to be, on the grounds that a POST is a write — and `messages` is a POST
       that reads an inbox, which meant opening that widget threw the payload cache away. `setCell`
       and `addRow` set it now, so it says what it means: the sheet changed. See core.gs. */
```

### ONE GATE, before anything runs.

in `doPost`

```
/* ONE GATE, before anything runs. Thirteen handlers each carried their own admin check, which
       is thirteen chances to forget — and a forgotten check looks exactly like a working feature.
       The table above says who may do what; this enforces it once. */
```

### A DEAD SESSION SAYS SO IN A WORD THE PHONE CAN READ.

in `doPost`

```
/* A DEAD SESSION SAYS SO IN A WORD THE PHONE CAN READ. The sentence is for a person; `why` is for
       `api()`, which would otherwise have to match English to know that the app it is running in is
       no longer signed in — and every later Save would say "Please sign in again." under a screen
       that still shows somebody signed in. */
```

### ---------- WHO THE REPLY IS FOR (342)

in `doPost`

```
/* ---------- WHO THE REPLY IS FOR (342) -------------------------------------------------------------
       The row the gate resolved the token to, for an action that needs one — `body.personId` is the
       gate's by now, never the request's; for an open action, whoever the token says if it carries one,
       and nobody otherwise. Never a name or an id off the request: a claim to be an admin would be a way
       to every grown-up's surname. Read by `nameFor_` and the net (`kidNamesSpans_`), on the way out and
       on the way back in. */
```

### invitations -------------------------------------------------------------------------- Sending:

in `doPost`

```
/* --- invitations --------------------------------------------------------------------------
       Sending: the split emails already on a booking become actual invitations.
       Opening: no account needed — the person being invited does not have one yet, which is the
       whole point. Opening is recorded, because an invitation nobody opens and one that is opened
       and refused are different problems.  --- */
```

### ---------- SENDING MAIL IN SOMEBODY ELSE'S NAME

in `doPost`

```
/* ---------- SENDING MAIL IN SOMEBODY ELSE'S NAME ------------------------------------------
         This took a job id, a name and a list of addresses, and sent an email to each — signed as
         whoever the request said it was from, with no check that the sender is real, is in the
         booking, or is who they say. An endpoint that sends mail on an unverified name is the one
         thing on this site somebody outside it could actually misuse.

         THREE THINGS NOW: the asker exists, the invitation is FROM them, and they are actually in
         the booking they are inviting people to share. The third is the one that matters — an
         invitation to share a session is a claim about a session, and it should come from somebody
         who has one. */
```

### NOT WHEN THE ADDRESS ALREADY HAS AN ACCOUNT.

in `doPost`

```
/* NOT WHEN THE ADDRESS ALREADY HAS AN ACCOUNT. Signing in is an address now, and two rows on
         one address is refused by `verifyLogin` — so a second row here would lock the existing
         account holder out of their own sign-in. They are already a person; the invite stands. */
```

### what's wrong with the people tab ----------------------------------------------------- Read-only.

in `doPost`

```
/* --- what's wrong with the people tab -----------------------------------------------------
       Read-only. Lists the things that make two accounts behave as one: rows sharing a name, rows
       with no id, rows with no PIN. Admin-only because it names people and their access. --- */
```

### `hasPin_`, NOT `S(r.pin)`.

in `doPost`

```
/* `hasPin_`, NOT `S(r.pin)`. The plaintext cell is EMPTY on every correctly hashed row —
           `authSetPin_` clears it — so this listed every properly secured person as having no PIN,
           on the one screen an admin opens to find out who cannot sign in. The third and fourth
           readers of that cell; see the note over `hasPin_` in booking.gs. */
```

### register ------------------------------------------------------------------------------ Anyone may create a STUDENT or a CLIENT (parent) account.

in `doPost`

```
/* --- register ------------------------------------------------------------------------------
       Anyone may create a STUDENT or a CLIENT (parent) account. Not a tutor and not an admin: those
       carry access to other people's details and to money, so they stay something an admin grants
       rather than something a form hands out.
       The checks are for honest collisions rather than attacks — two families with the same name,
       or somebody registering twice because the first attempt seemed not to work. --- */
```

### ---------- WHO THE ACCOUNT IS FOR IS ASKED, AND THE ANSWER IS THE ROLE

in `doPost`

```
/* ---------- WHO THE ACCOUNT IS FOR IS ASKED, AND THE ANSWER IS THE ROLE ----------------------------
       FOUND BY THE WALK AFTER *"audit the registration process and so on so all kids can login easily
       with their handle and pin."* A parent who signed up on the phone was written `student` — this
       said "Anyone may create a CLIENT account" above a row that wrote `role: 'student'` — so Settings
       never drew "Make your child's account", and ticking Client under Your roles was refused by
       `setMyRoles`' rule that a student cannot make itself a client. That rule is right and stays: it
       is what stops a child's account, made by or linked to a parent, promoting itself. The fault was
       that a parent was a student in the first place. So the form asks — `who: 'parent'` or
       `'student'` — and the row is written in the role it names, once, at the one moment the person
       is choosing it.

       NO ANSWER IS A STUDENT. An old phone posts no `who`, and student is what this always wrote —
       the role that can do least, which is the right thing to give a person who did not say.

       A PARENT'S ACCOUNT NEEDS AN ADDRESS OF ITS OWN. It is what they sign in with, what the link
       proves, and where a child's account they make is written to (`makeChild`). `parent_email` is a
       child's door — "a grown-up's address" — so `who: 'parent'` beside it is refused rather than
       turned quietly into a student.

       WHY A CHILD WHO TICKS PARENT GAINS NOTHING OVER ANY OTHER CHILD. No form can check an age; what
       matters is what `client` reaches, and every power it has over ANOTHER person goes through that
       person or through a row nobody else owns:
         · `makeChild` writes a NEW row, linked to the maker, and refuses a name that is already an
           account — it cannot reach a child who exists.
         · `claimChild` only ASKS; nothing is linked until the named child answers yes (`answerClaim`,
           the child and nobody else). Every child is a request they may refuse, from anybody.
         · `resetPin` and the family cards follow ACCEPTED links only (`acceptedChildren`).
         · `doGet` sends a client the same public half of the students list a student gets, and their
           own family — nothing of anybody else's.
       What it does add is booking (which needs a card) and messaging a tutor (`MESSAGING`): listed
       adults the business has put on Find for exactly that, every message kept in the messages tab and
       reportable. And it is a NEW account — the student account a child already has is untouched, and
       `setMyRoles` still refuses it Client. */
```

### ---------- A CHILD WITH NO EMAIL OF THEIR OWN MAKES AN ACCOUNT WITH A GROWN-UP'S

in `doPost`

```
/* ---------- A CHILD WITH NO EMAIL OF THEIR OWN MAKES AN ACCOUNT WITH A GROWN-UP'S --------------
       ASKED FOR AS *"so all kids can login easily with their handle and pin"*, and the form refused
       the commonest child there is: no address was "Please give a real email address", and mum's —
       already on her own account, or on a brother's — was "That email is already registered". So
       the only way in for a child without an inbox was the owner typing a row into the sheet.

       `parent_email` IS NOT A SIGN-IN ADDRESS. The row's `email` stays blank — an address on two rows
       locks both out of `verifyLogin` — and the grown-up's goes in a column of its own, which is
       somewhere to write and nothing more: the confirmation link goes there, so the grown-up says
       yes before the account works (the same proof `email` gives, held by the person who should hold
       it for a child), and so do a forgotten PIN and the too-many-guesses warning (`authGrownUps_`).
       The child signs in with the HANDLE, which the reply carries so the phone can put it straight
       into the sign-in box. A parent making the account from their own is `makeChild`. */
```

### ---------- THE ADDRESS FIRST, AND A NAME CLASH THAT DOES NOT SAY IT IS ONE (342, the review)

in `doPost`

```
/* ---------- THE ADDRESS FIRST, AND A NAME CLASH THAT DOES NOT SAY IT IS ONE (342, the review) -------
         The name was asked first and answered "There is already an account in that name" — so an address
         already on a row, passed with a guessed whole name, told anybody whether that child or parent
         existed and wrote nothing either way. The address is the person's own to ask about; the name is
         not. What a refusal still says, and why nothing pauses (it did, for a day of round 1, and one
         signed-out caller could switch sign-up off for everybody): the note over `isChild_` in people.gs. */
```

### PENDING until they click the link.

in `doPost`

```
/* PENDING until they click the link. Deliberately a third state rather than a blank:
         accounts that predate this have no `verified` value at all, and treating blank as
         unverified would lock out every existing family the moment this deployed. */
```

### WHO SENT THEM. The referral code was generated and never recorded against anybody, so the loop was open at the far end — codes went out and nothing came back.

in `doPost`

```
/* WHO SENT THEM. The referral code was generated and never recorded against anybody, so
         the loop was open at the far end — codes went out and nothing came back. Now the code
         somebody arrived with is matched to the person who owns it, and both halves are written:
         `came_from` is the raw code (kept even if it matches nobody, because a code that matches
         nobody is itself worth seeing), `invited_by` is the person. */
```

### BEFORE THE ROW EXISTS, so `handleMake_` is passed no row of the tab's:

in `doPost`

```
/* BEFORE THE ROW EXISTS, so `handleMake_` is passed no row of the tab's: there is nothing of this
         person's for a clash to exclude yet. A STUDENT'S IS PASSED AS A DRAFT of the row about to be
         written — the role and both names — because a child's handle is their initials (342) and the
         draft is what `isChild_` and the initials are read from. A parent's is a grown-up's. */
```

### THE ROLE THEY CHOSE — see the note over this action.

in `doPost`

```
/* THE ROLE THEY CHOSE — see the note over this action. It said "Students by default. A parent
           booking for a child is the account an admin sets up", and that is the sentence the walk
           found a parent stuck behind: the admin was the only way to Client, and nobody was told. */
```

### ---------- THE HANDLE IS GENERATED — first name, virtue, number — see `handleMake_`

in `doPost`

```
/* ---------- THE HANDLE IS GENERATED — first name, virtue, number — see `handleMake_` --------
           It goes through `handleTrouble_`, so the shape, the reserved list, the blocklist and the
           clash are checked exactly once. There is no `username` column any more: it was the handle
           written twice. `?run=fillHandles` fills any row a generator ever gave up on. */
```

### "ONCE YOU HAVE OPENED IT":

in `body`

```
/* "ONCE YOU HAVE OPENED IT": until then this address is one nobody has proved, and a
                     child's PIN is not mailed to one (`authGrownUps_`) — a mistyped grown-up's address is
                     a stranger's inbox, and the handle above is all "Forgotten your PIN?" asks for. */
```

### confirming an email address --------------------------------------------------------- The token is the proof:

in `doPost`

```
/* --- confirming an email address ---------------------------------------------------------
       The token is the proof: it was sent to that address and nowhere else, so presenting it shows
       the address was reachable by the person holding it. Cleared on use, so a link works once. */
```

### ---------- A NEW ADDRESS FOR AN ACCOUNT THAT HAS ONE: MOVED ONLY WHERE THAT ACCOUNT IS SIGNED IN

in `doPost`

```
/* ---------- A NEW ADDRESS FOR AN ACCOUNT THAT HAS ONE: MOVED ONLY WHERE THAT ACCOUNT IS SIGNED IN ----
         The link `updateProfile` sends when a confirmed account asks for a new address (`authMove*_` in
         booking.gs says why it waits aside). Opening it proves the inbox; `session` — the phone's own
         token, sent beside this one because `token` is taken — proves the account. A link opened anywhere
         else is told to sign in and open it again, and changes nothing: a stranger whose address was
         typed by mistake holds the link and never the account. */
```

### WHOEVER HOLDS THIS LINK OWNS THE INBOX IT WENT TO (342) — the account's own, or the grown-up's a no-email child named — so the reply is theirs, and the

in `doPost`

```
/* WHOEVER HOLDS THIS LINK OWNS THE INBOX IT WENT TO (342) — the account's own, or the grown-up's a
         no-email child named — so the reply is theirs, and the grown-up it names (`linkedTo`) is very
         often them: their whole name stays in it for them, as their own payload has it. */
```

### ---------- A GROWN-UP SAYING YES TO A CHILD'S ACCOUNT ALSO PUTS THE CHILD ON THEIRS

in `doPost`

```
/* ---------- A GROWN-UP SAYING YES TO A CHILD'S ACCOUNT ALSO PUTS THE CHILD ON THEIRS --------------
         The child named this address (`register` with `parent_email`) and whoever holds it has just
         opened the link — both halves of what `claimChild` and `answerClaim` ask for, in the other
         order. So if the address is a PARENT's account (client or admin, `claimChild`'s own test), the
         link is written accepted. Not a student's: a brother who registered with mum's address holds
         it on a student row, and that makes him nobody's parent. Two rows on one address is a guess,
         and is not made.
         ---------- AND NOT A PARENT ROW WHOSE OWN ADDRESS NOBODY HAS PROVED ----------------------------
         The click proves the inbox; it says nothing about who made the account sitting on it. Ben names
         mum@, mum has no account, and somebody else registers a parent row on mum@ with their own PIN —
         `register` checks only the `email` column, so it is allowed, and since 6 Oct a PENDING row signs
         in. Mum opens the link she expected, Ben was written onto THEIR account, and `resetPin`, which
         follows accepted links, handed them Ben's PIN (PR #130 review). So a PENDING parent row is not
         linked: the child is confirmed alone, and the reply says the grown-up adds them from their own
         account once its address is confirmed — "Add your child", which the child answers. */
```

### ---------- "SEND THE LINK AGAIN"

in `doPost`

```
/* ---------- "SEND THE LINK AGAIN" ------------------------------------------------------------------
       A PARENT WHOSE LINK WENT TO SPAM HAD NO WAY TO A SECOND ONE. That was the owner's own reason for
       letting sign-in stop waiting on it (6 Oct), and once a child waits on it instead (`confirmFirst_`)
       the link is the one thing standing between a parent and making their child's account — so the
       cards that say "open the link first" carry this, and it has to work.

       ONLY TO THE ROW'S OWN ADDRESS, AND ONLY WHILE IT IS PENDING. `self`, so it is the row the token
       resolved to and nobody named; nothing typed on the request says where it goes. A confirmed row is
       told so and sent nothing. A no-email child has no address of their own — their link went to a
       grown-up, and sending that again is the grown-up's business, not a button on the child's card.
       ONE PER QUARTER OF AN HOUR (`AUTH.LINK_GAP_MINS`), because every press is a mail out of the quota
       the booking notices use. A FRESH TOKEN each time, so the link in the newest mail is the only one
       that works: a token sat in an old mail in somebody's spam is one more copy of the key. Written
       only once the mail has gone — `forgotPin`'s rule — so a mail that fails leaves the old link
       working rather than none. The mail is `linkMail_`, `register`'s own, word for word. */
```

### ---------- OR THE LINK FOR A NEW ADDRESS WAITING TO BE PROVED (`authMove*_`)

in `doPost`

```
/* ---------- OR THE LINK FOR A NEW ADDRESS WAITING TO BE PROVED (`authMove*_`) ------------------
         The same button on the Contact card, for the same person: the one whose mail went to spam. The
         same quarter hour, under the same key, so the two cannot be pressed in turn for twice the mail.
         To the new address and nowhere else, with a fresh key, and the old link stops working. */
```

### SIGNING IN WITH GOOGLE WHAT THE BROWSER SENDS IS A CLAIM, NOT A FACT.

in `doPost`

```
/* ================================================================================================
       SIGNING IN WITH GOOGLE
       ------------------------------------------------------------------------------------------------
       WHAT THE BROWSER SENDS IS A CLAIM, NOT A FACT. Google's button hands the page a signed token
       saying "this is who I am"; a page can hand this endpoint anything at all. So the token is not
       read here — it is sent back to Google, which is the only party that can say whether it signed
       it, and every answer below comes from Google's reply rather than from the request.

       THREE THINGS ARE CHECKED AND ALL THREE MATTER.
       `aud` must be OUR client id: a valid Google token issued to somebody else's site is still a
       valid Google token, and without this check anybody could take one from their own app and sign
       in here as its owner.
       `email_verified` must be true: Google will carry an unverified address, and an unverified
       address is somebody's claim about an inbox rather than proof of one.
       `exp` is enforced by tokeninfo, which refuses an expired token outright.

       AND NO ACCOUNT IS CREATED. Matching an address to a row is a different act from making one —
       an unknown address gets a sentence, not a new person. Registering stays where it was, where a
       name and a role and a PIN are set deliberately.
    ================================================================================================ */
```

### THE SAME READING OF THE ADDRESS AS `verifyLogin`, and the same refusal of two rows on one:

in `doPost`

```
/* THE SAME READING OF THE ADDRESS AS `verifyLogin`, and the same refusal of two rows on one:
         the first match would sign somebody in as whoever sits higher on the tab, and the two
         doors disagreeing about one address is a PIN refused while Google lets them in as the
         other account. */
```

### ---------- SIGNING IN WITH GOOGLE IS THE CONFIRMATION, AND THE TAKING BACK

in `doPost`

```
/* ---------- SIGNING IN WITH GOOGLE IS THE CONFIRMATION, AND THE TAKING BACK ---------------------
         The pending state exists to prove somebody owns the inbox, and Google has just proved exactly
         that about the same address (`authConfirmed_`). The PIN on a PENDING row proves nothing of the
         kind: it was chosen by whoever registered the address, who may not be its owner.
         ROUND ONE OF THE PR #130 REVIEW ENDED THEIR SESSIONS AND LEFT THEIR PIN, and measured, the
         squatter signed straight back in with it — onto a row now confirmed, so a later emailed PIN
         ended nothing either, and they read Vic's profile and reset the PIN of the child she made. So
         on a PENDING row the PIN goes too, with the guesses at it (`check-backend`'s pair holds that
         half) and any emailed PIN waiting — one asked for before Google proved the address, which
         `check-signin` (b) holds: a PIN mailed while nobody had proved the row is the registrant's
         era, and the reply below names only two ways in. Every session ends before this one is made:
         afterwards only Google or a FRESH "Forgotten your PIN?" gets in. Cleared rather than replaced
         with one drawn here, because a PIN nobody is shown is a PIN nobody can use — and the reply SAYS
         so, because the person this happens to is as often the real registrant, who would otherwise
         find their own PIN refused tomorrow with no idea why. The children the registrant put on it are
         held, as the emailed PIN's taking back holds them (`authTakeBack_`). A CONFIRMED row is left
         alone: its PIN was proved by whoever confirmed it, and signing in by Google must not sign its
         owner out elsewhere. */
```

### ---------- THIS SESSION, NOT EVERY ONE THE PERSON HOLDS (docs/history/317)

in `doPost`

```
/* ---------- THIS SESSION, NOT EVERY ONE THE PERSON HOLDS (docs/history/317) -----------------
         IT ENDED THEM ALL (`authEndSession_`), and that is how an essay vanished in a lesson. A child
         writing on the computer; the same account signed in on the iPad — by the tutor checking it,
         which is how this family uses accounts — and signed out there. The computer's NEXT signed-in
         request was answered `why: 'signed-out'`; it signed itself out and drew the box under the
         signed-out key, empty, over 3,015 characters still on the device. Reproduced in a sandbox
         on this backend: two sessions, the iPad's Sign out, nought left, and the computer's profile
         and inbox refused. Signing out of one device is about that device.
         ENDED BY THE TOKEN IT CAME WITH, which is the only session a request can prove it holds — so
         a request still cannot sign anybody else out, and the token that asked is refused after this.
         `authEndSession_` keeps the cases where ending everything is the point: a PIN changed, a PIN
         reset, an address's owner taking a row back. */
```

### ---------- AN E-MAIL ADDRESS AND A PIN, AND NOTHING ELSE

in `doPost`

```
/* ---------- AN E-MAIL ADDRESS AND A PIN, AND NOTHING ELSE ------------------------------------
         ASKED FOR AS *"i want people to be able to sign in only with their email and their pin now.
         no case sensitive stuff."* This went through `findPerson`, which answers to six things — an
         id, a full name, first + last, a handle, a username and an address — so the box took all of
         them and the question of which one a person should type had six answers. One now.

         NOT `findPerson`, and the reason is the other half of the ask. `findPerson` returns the FIRST
         row that answers to ANY rung, so an address typed here could still be claimed by a name rung
         above it on somebody else's row. Asked of the `email` column alone, it cannot.

         `norm` IS THE WHOLE OF "NO CASE SENSITIVE STUFF": trimmed and lower-cased on both sides, so
         `Halex.Dias.31@Gmail.com ` is the same address as the one in the sheet. A PIN is digits and
         has no case to fold.

         `body.email` FIRST AND `body.name` AFTER, because the phone that asks for an address may be
         older than this backend or newer than it — see `do-signin`. An old phone sends whatever was
         typed as `name`, and that is still refused unless it is an address.

         TWO ROWS ON ONE ADDRESS IS REFUSED, NOT GUESSED. The first-match rule is what made
         `changePin` check one person's PIN against another's row; with the address as the ONLY
         key, the first match would be somebody signing in as whoever happens to sit higher on the
         tab. `emailRefusal_` stops a duplicate being SAVED from the app; a duplicate typed into the
         sheet by hand is what this answers, in a sentence that says who can fix it. */
```

### ---------- A PERSON WITH NO ADDRESS SIGNS IN WITH THEIR HANDLE

in `doPost`

```
/* ---------- A PERSON WITH NO ADDRESS SIGNS IN WITH THEIR HANDLE ------------------------------
         ASKED FOR AS *"i have a student who doesnt have an email ... so he can still login."* A child
         is the usual case, and the address cannot be invented: a made-up one is a WRONG cell that
         every notice would post into and report success. So a row whose `email` cell is blank
         answers to its handle (`halex_kind42`, unique by `handleTrouble_`) and its PIN.

         ---------- AND NOW EVERY ROW DOES, ADDRESS OR NOT ------------------------------------------
         ASKED FOR AS *"have the students be able to login with their handles too"* — the student who
         HAS an address was the one left out: the box says "email or handle", the handle is on their
         own profile, and typing it answered "sign in with the email on your account". The first
         version looked the handle up among blank-address rows ONLY, and its reason was that "an
         account that has an address can only be reached by it". That reason was about COLLISION, and
         collision is answered without it: this branch is only taken when what was typed has no `@`,
         and `HANDLE_SHAPE` (letters, digits, underscores) can never hold one — so a handle and an
         address cannot be the same string, whichever rows are searched. What stands between a
         guesser and a PIN is the per-person throttle in `signInRow_`, and a handle meets it exactly
         as an address does. Handles were PUBLIC long before this (they are on every card), so the
         throttle, not the secrecy of the name, was always the guard. (This said "and the six-digit
         PIN" — a PIN is 4 to 8 digits, and the guess a four-digit one survives is the throttle's.)

         `key` FOLDS CASE AND DROPS `_` AND `@`, so `@Halex_Kind42`, `halexkind42` and
         `HALEX_KIND42` are one handle — and so are the 1 October shape (`halex_kind42`) and today's
         shuffled ones (`kind42_halex`), because the lookup is the cell, not the arrangement. Two
         rows on one handle (only possible by hand — `handleTrouble_` refuses it everywhere else) is
         refused, as two rows on one address is. The PENDING rule and the wording live in
         `signInRow_`, unchanged; its wrong-PIN sentence names the half that was typed. */
```

### NO EXAMPLE HANDLE (342):

in `doPost`

```
/* NO EXAMPLE HANDLE (342): it showed one in the grown-ups' shape, a first name, a word and a
             number — and a child's handle is their initials and four digits now, so a child who mistyped
             was shown a shape that is not theirs. The card shows the real one. */
```

### ---------- YOUR OWN SETTINGS, READ FRESH

in `doPost`

```
/* ---------- YOUR OWN SETTINGS, READ FRESH ------------------------------------------------------
       THE SETTINGS FORM DRAWS FROM `USER.profile`, AND THAT WAS WRITTEN ONCE — by the sign-in reply —
       and then kept in the phone's storage for the thirty days a session lasts. So a change made on
       another phone, by an admin, or typed into the sheet never reached the form, and the next Save
       posted the phone's old copy back over it. Worse, every phone signed in before the sign-in reply
       was repaired holds the broken shape, and would go on posting blanks.
       A POST AND NOT A KEY ON THE PAYLOAD, and that is not a preference: the payload is cached and
       served to whoever asks for the same key, and this carries a birthday, a phone number and the
       library-card PINs. `profileOf_` of the row the TOKEN resolved to, and of nobody else — the
       gate has already overwritten `body.personId` with it. */
```

### ---------- AND YOUR ROLES, WHICH WENT STALE THE SAME WAY

in `doPost`

```
/* ---------- AND YOUR ROLES, WHICH WENT STALE THE SAME WAY ---------------------------------------
       THE WALK FOUND IT: the owner changed a parent's role to client in the sheet, the parent reloaded,
       and "Make your child's account" was still missing — it appeared only after signing out and in.
       The role was the profile's fault exactly: written once by the sign-in reply and kept for thirty
       days, so a role set by an admin, typed into the sheet or changed on another phone never reached
       the screens that draw from it. The same three words the sign-in reply carries (`loginReplyFor_`),
       read the same way, so the two cannot disagree about one row. The phone only DRAWS from these —
       every action still asks the row the token resolves to, so a stale role was a missing card, never
       a power. */
```

### AND THE NAMES, said as the sign-in reply says them — `nameFor_` and `familyNamesOf_`.

in `doPost`

```
/* AND THE NAMES, said as the sign-in reply says them — `nameFor_` and `familyNamesOf_`. A phone
         signed in before 10 Oct kept a child's whole name in `familyUser` (its own, or its children's
         for the booking form) for the thirty days a session lasts; this is asked on every open, so the
         first open after the deploy puts the first names over them (`profileRefresh_`, me.js). */
```

### AND THE HANDLE, AND THE FRIENDS LIST THAT NAMES OTHERS BY THEIRS (342).

in `doPost`

```
/* AND THE HANDLE, AND THE FRIENDS LIST THAT NAMES OTHERS BY THEIRS (342). Both went stale exactly
         as the names did: `?run=kidHandles` moves a child's handle and every list it was on while their
         phone is signed in, and the phone said the old one — on their card, and in the friends list its
         next Save would post back. The phone adopts both and says the new handle once
         (`profileRefresh_`, me.js). */
```

### AND WHETHER THE ADDRESS IS PROVED YET — stale on the phone exactly as the role was:

in `doPost`

```
/* AND WHETHER THE ADDRESS IS PROVED YET — stale on the phone exactly as the role
                          was: opened on another phone, or by Google, and this phone held the held card
                          for thirty days. The sign-in reply's word, read the same way. */
```

### The target must be stated.

in `doPost`

```
/* The target must be stated. It used to fall back to the asker, which meant a request that
         had lost track of whose form it came from would write onto the ASKER's row instead of
         failing — one person's values, role included, landing on another's account. A write that
         doesn't know who it's for should not happen at all.
         Prefer the id. A name can be renamed, duplicated, or overwritten by a bad write — and
         when it is, a save addressed to a name lands on whichever row happens to answer to it. */
```

### ---------- WHO IS EDITING WHOM IS A QUESTION ABOUT TWO ROWS, ANSWERED BY THEIR IDS

in `doPost`

```
/* ---------- WHO IS EDITING WHOM IS A QUESTION ABOUT TWO ROWS, ANSWERED BY THEIR IDS ----------
         IT WAS `key(target) !== key(asker)`, AND FOR EVERY ORDINARY SAVE THAT WAS AN ID AGAINST A
         NAME. The phone sends `targetId` — a person_id — and `accessDenied` overwrites `body.name`
         with the token's DISPLAY name, so it compared `p002` with `adatutor`: never equal. Every
         tutor, parent and student was therefore "an admin editing somebody else", and refused with
         "Not authorised to edit that profile." — measured, all three roles, nothing written. The
         admin passed the gate and was treated as editing SOMEBODY ELSE on their own row, which is
         why a renamed admin kept their old name on the phone (`name: ''` in the reply).
         `accessDenied` has already resolved the token to a row and put its id on `body.personId`,
         so the question is one comparison of two ids, and admin is asked of that same row rather
         than of a display name looked up a second time. */
```

### 1. EVERY REFUSAL, BEFORE A SINGLE CELL IS TOUCHED.

in `doPost`

```
/* ================================================================================================
         1. EVERY REFUSAL, BEFORE A SINGLE CELL IS TOUCHED.

         THE PACKED CELLS USED TO BE WRITTEN AS THEY WERE MET, and the refusals under them fired
         afterwards. Measured: a Contact save carrying somebody else's e-mail answered "That e-mail
         address is already on another account" — having already written the phone and the birthday.
         A student's About-you save refused over a missing exam column had already written the
         birthday. And because `setCell` sets `POST_WROTE`, `jsonOut` retired every visitor's stored
         payload for a save that reported failure. A refusal is only a refusal if nothing has
         happened yet, so every one of them is asked here and section 2 does not start until all of
         them have said no.
         ================================================================================================ */
```

### THE FORM NAMES ARE NOT THE CELLS.

in `doPost`

```
/* THE FORM NAMES ARE NOT THE CELLS. Hour codes, the library boxes, the qualification shelf, the
         phone's two boxes and the birthday's three are packed into one cell each (`availGridIn`,
         `libCardsIn`, `qualsIn`, `phoneIn`, `dobIn`), so they are kept out of `wanted` below — and
         because they are out of it, the `noColumn` refusal cannot see their cell, so each cell's
         header is checked here. `setCell` writes to a missing header and loses the value with no
         error anywhere, which is the exact fault that refusal exists to prevent.
         EACH PACKER IS FED THE WHOLE FIELD MAP, so a form that sent two of three library cards writes
         the third as empty rather than leaving whatever was there. A page saves as a page. */
```

### QUALIFICATIONS AND LIBRARY CARDS ARE ROWS ON TABS OF THEIR OWN now (see `SCHEMA.people`), so the question is whether the TAB is there — a tab `ensureSchema`

in `doPost`

```
/* QUALIFICATIONS AND LIBRARY CARDS ARE ROWS ON TABS OF THEIR OWN now (see `SCHEMA.people`), so
         the question is whether the TAB is there — a tab `ensureSchema` has not made yet would take a
         save of that page and write nothing, under a toast saying Saved. */
```

### AND THE FACE ITSELF:

in `doPost`

```
/* AND THE FACE ITSELF: a link, nothing, or one of the eleven tokens — `photoRefusal_` in core.gs,
         the one judge `savePhoto` shares. Your own Settings never posts `photo` (the picker saves
         itself), so this is an admin's editor, or anybody with the URL; either way a sentence in this
         cell is a broken face on every card that draws it. */
```

### AN EXAM DATE IS A COLUMN, so `wanted` finds it; what a column check cannot say is whether the VALUE is a date.

in `doPost`

```
/* AN EXAM DATE IS A COLUMN, so `wanted` finds it; what a column check cannot say is whether the
         VALUE is a date. A date input cannot produce a bad one, which is not a reason to trust it:
         `doPost` is reachable by anybody with the URL. See `isoRefusal_`. */
```

### A field with no column vanishes silently:

in `doPost`

```
/* A field with no column vanishes silently: that is how an extra-seat fraction was entered
         four times and lost four times, with the site showing a stale default each time and nothing
         connecting the two. Refuse the save and name the column — the fix is one ensureSchema run,
         and nobody can act on an error they were never shown. */
```

### ---------- WHAT A TUTOR CHARGES MOVES ONCE A MONTH, ALL FOUR FIELDS TOGETHER

in `doPost`

```
/* ---------- WHAT A TUTOR CHARGES MOVES ONCE A MONTH, ALL FOUR FIELDS TOGETHER ------------
         `PRICING_FIELDS` is the four and `pricingRefusal_` in people.gs is the rule. ONLY WHEN A
         VALUE ACTUALLY MOVES: that page posts all four on every save, touched or not, and a rule
         firing on a field being PRESENT would refuse the boxes beside it for a month over a number
         nobody edited. Compared against the row as it is — and nothing below has run yet, which is
         the only moment that comparison is honest: `setCell` updates the row in memory, so asking
         after the write compares the new values with themselves.
         THE WANTED LIST IS WHAT IS ASKED ABOUT, not `fields`: a field the allow-list dropped will
         not be written, so a cooldown started by one would be a month spent on nothing. */
```

### THE STAMP'S COLUMN IS CHECKED HERE NOW.

in `doPost`

```
/* THE STAMP'S COLUMN IS CHECKED HERE NOW. This used to say a missing `pricing_changed_at` was
         "the safe direction to fail in — the rate is still saved". It was not safe: `jsonOut` turns
         any write that lands on a missing header into an error, so the rate WAS saved under a reply
         saying "Nothing was saved", and with no stamp the once-a-month rule was never enforced
         (measured: two rate changes on one day, both through). A refusal before anything moves is
         the only honest answer. */
```

### ---------- AND THE BUSINESS'S CUT OF AN EXTRA SEAT, WHICH IS AN ADMIN'S (docs/history/345)

in `doPost`

```
/* ---------- AND THE BUSINESS'S CUT OF AN EXTRA SEAT, WHICH IS AN ADMIN'S (docs/history/345) -----------
         On the same page and the same card as the four, and allowed by the same list, so who may write it is
         asked here rather than by the allow-list: `seatCutRefusal_` in people.gs. `iAmAdmin` — the TOKEN's row —
         and not `adminEditing`, which only says "another person's row": an admin who also tutors sets their own
         cut too. Nothing here touches `pricing_changed_at`; that clock is the tutor's (`SEAT_CUT_FIELD`). */
```

### ---------- AND THE AGE RANGE, WHICH IS NOT THE QUOTE AND HAS NO CLOCK

in `doPost`

```
/* ---------- AND THE AGE RANGE, WHICH IS NOT THE QUOTE AND HAS NO CLOCK ----------------------
         Asked of the same wanted-only object for the same reason, and before any write for the
         reason this whole section exists. A youngest older than the oldest is a range nobody falls
         inside — see `ageRefusal_` in people.gs. */
```

### ---------- AN ADDRESS IS WHAT SIGNS IN TO THIS ACCOUNT

in `doPost`

```
/* ---------- AN ADDRESS IS WHAT SIGNS IN TO THIS ACCOUNT ------------------------------------
         SO EMPTYING THE BOX IS A SIGN-OUT NOBODY CAN UNDO — `verifyLogin` and `forgotPin` both look
         the person up by it. And two rows on one address means `verifyLogin` refuses both, so a
         duplicate is `emailRefusal_`'s to refuse. Only when the form sent one: About you and every
         other page post no `email`, and a rule firing on absence would refuse them. An admin is NOT
         exempt: an admin putting a duplicate address on somebody's row is still the collision. */
```

### ---------- AND A NEW ADDRESS IS PROVED BEFORE IT IS TRUSTED

in `doPost`

```
/* ---------- AND A NEW ADDRESS IS PROVED BEFORE IT IS TRUSTED -------------------------------------
         THIS WROTE IT STRAIGHT INTO `email` AND LEFT `verified` AS IT WAS — round three of the PR #130
         review: a confirmed parent who mistyped her new address handed every notice, "Forgotten your
         PIN?" and so her child to whoever owns the typo, and a PENDING row's old link confirmed the new
         address. Four answers, by what the row is and what was typed (`authMove*_` in booking.gs):
           same      the address it has (any case) — nothing to prove; written as typed.
           keep      the address it has, while a new one waits — the person changed their mind; the
                     waiting one is forgotten and the row is untouched.
           correct   the row is PENDING on an address of its own, so nothing about it was ever proved:
                     the new address goes in, still PENDING, with a FRESH link sent to it — the old link
                     dies with the old address, and so does any PIN mailed there.
           move      anything else (confirmed, a legacy blank, or a row with no address yet): the row
                     keeps what it has, the new address waits aside, and a link goes to it that only
                     works where this account is signed in (`verifyEmail`).
           waiting   the address already waiting — the form posts every box on every Save, so this is
                     the Contact page saved again, not a second request; nothing is sent.
         The mail goes BEFORE anything is written, and a mail that cannot go refuses the whole Save: a
         new address recorded with no link sent is one nobody can ever prove. Applies to an admin's edit
         too — an admin typing somebody's address is the classic typo, and the person proves it. */
```

### 2. EVERY WRITE, COLLECTED INTO ONE OBJECT, THEN ONE CALL.

in `doPost`

```
/* ================================================================================================
         2. EVERY WRITE, COLLECTED INTO ONE OBJECT, THEN ONE CALL.

         THE QUALIFICATIONS AND THE LIBRARY CARDS ARE WRITTEN AS ROWS, after the person's own row, by
         `writeOwnRows_` — see core.gs. What a tutor teaches is no longer written anywhere: it is
         DERIVED from the qualifications' two ticks every time it is read (`teachesOf_`), so there is
         no second copy for a Save to keep in step.
         ================================================================================================ */
```

### THE STAMP GOES ON WITH THE WRITE, NOT BEFORE IT:

in `doPost`

```
/* THE STAMP GOES ON WITH THE WRITE, NOT BEFORE IT: written earlier, a refusal would leave the
         clock started on a change that never happened. It is the same `pricingMoved_` the guard read,
         over the same object, so the two cannot disagree about whether anything moved. An admin's edit
         stamps it too — the cell records when the quote last moved, whoever moved it. */
```

### ---------- AND THE NAME THEY HAD GOES ONTO `name_was`

in `doPost`

```
/* ---------- AND THE NAME THEY HAD GOES ONTO `name_was` ---------------------------------------
           THE REVIEW OF 10 OCT, "Brackenridge": a child booked, then corrected her surname — and the
           events stored under her old whole name were nobody's any more, so the net that calls a child
           by her first name (`kidNamesOff_`, people.gs) did not know them, and the old surname went to a
           signed-out stranger in her seat. `kidNamesIndex_` reads this column too. Only when the whole
           name really moves, and only where the column is: a missing one is `ensureSchema`'s to add on
           the first request after the deploy, and a rename must not fail for want of it. */
```

### 3. ONE WRITE. `setCells` is `setCell` for a whole row:

in `doPost`

```
/* 3. ONE WRITE. `setCells` is `setCell` for a whole row: a cell already holding what is asked
         is left alone, so a Save that changes nothing writes nothing and does NOT retire every
         visitor's stored payload — which is what made the `load()` after an untouched Save a full
         cold rebuild. See the note over it in core.gs. */
```

### AND WHAT WAITS BESIDE THE ROW.

in `doPost`

```
/* AND WHAT WAITS BESIDE THE ROW. A corrected address retires any PIN mailed to the old one (a PIN
         sent to an address the account no longer has is not a way into it) and anything waiting; a move
         is recorded only now the row's own write has gone through, so a refused Save leaves none. */
```

### ---------- AND THE FORM'S OWN VALUES COME BACK WITH THE ANSWER

in `doPost`

```
/* ---------- AND THE FORM'S OWN VALUES COME BACK WITH THE ANSWER ------------------------------
         `profileOf_` of the row as it now stands — so the phone's copy is what the SERVER made of the
         boxes (the phone repacked, the specialism derived from the ticks, a birthday normalised)
         rather than what was typed, and the next Save starts from the sheet. Only for your own row:
         an admin editing somebody else is shown that person's form elsewhere. */
```

### admin edits a pricing variable ------------------------------------------------------ Every number in the formula lives in `config`; this is how the site

in `doPost`

```
/* --- admin edits a pricing variable ------------------------------------------------------
       Every number in the formula lives in `config`; this is how the site writes one back.
       Restricted to keys that already exist, so a typo can't invent a variable that looks like a
       setting and is read by nothing. --- */
```

### ---------- NO CARD CALLS IT NOW (docs/history/345), AND IT STAYS

in `doPost`

```
/* ---------- NO CARD CALLS IT NOW (docs/history/345), AND IT STAYS ------------------------------
       It had one caller, the admin's "Your cut of an extra child" card on Settings, which posted
       `boss_rate` — the `B` `priceFrom` read as the business's share of every extra child. The owner
       asked for that cut on each tutor's card instead (*"Your cut off extra child for tutors should be
       editable on thir card"*), so it is `extra_seat_cut` on the tutor's row, written by
       `updateProfile`, and the card is gone. `B` is still read: it is what a BLANK cut means, the
       default, set in the config tab of the spreadsheet. KEPT because a phone still on the old build
       posts here during the minute after a deploy, and refusing it would say "Not saved" over a
       figure that still means something. `setCell` and `addRow` both set `POST_WROTE`, so the
       six-hour payload is retired on the way out and a new figure is on the next load.

       A KEY THAT IS NOT THERE MAY BE ADDED, BUT ONLY FROM A SHORT LIST. `priceFrom` reads `B`,
       `boss rate` or `boss_rate`, and a config tab that has never carried any of them prices every
       extra child of a tutor with no cut of their own at no cut at all; refusing to create the row
       would leave an old-build phone's Save in the deploy gap unable to set the one thing it posts.
       A list rather than any key, because an admin's typo would otherwise become a config row
       nothing reads.

       A NUMBER STAYS A NUMBER. A fraction is what this key means (`asFraction` in core.js takes
       0 to 2 and ignores anything bigger as a leftover pound figure), so it is checked here too —
       the phone's check is a convenience and this is the rule. */
```

### EXACT CASE FIRST. `config()` keys its variables case-sensitively and the pricing reads `B` (the default cut) and `b` (the bulk discount) as two different

in `doPost`

```
/* EXACT CASE FIRST. `config()` keys its variables case-sensitively and the pricing reads `B`
         (the default cut) and `b` (the bulk discount) as two different numbers — so a case-folded match
         let row order decide which of the two a post of the cut changed. */
```

### admin edits a per-option surcharge --------------------------------------------------- The S, L, D and T terms aren't single numbers — each subject, level, day

in `doPost`

```
/* --- admin edits a per-option surcharge ---------------------------------------------------
       The S, L, D and T terms aren't single numbers — each subject, level, day and time carries
       its own. Venues live on their own tab but behave the same way, so they're handled here too
       rather than making the card care which sheet a rate happens to sit on. --- */
```

### Whether the row had to be MADE.

in `doPost`

```
/* Whether the row had to be MADE. It reported `!r._existing` on a variable nothing ever
         set, so every edit came back claiming to have added a row — including the ones that
         changed an existing figure. Read before the write, which is the only moment it is true. */
```

### ---------- THE LINK EDITOR IS GONE AND IT NEVER HAD A DOOR

in `doPost`

```
/* ---------- THE LINK EDITOR IS GONE AND IT NEVER HAD A DOOR ----------------------------------
       `updateLink`, `addLink` and `deleteLink` wrote to the `links` tab. That tab is
       `data/settings/links.json` in the repository now — 126 rows in 25 categories, read by
       `settingsInto_` — so the handlers had nothing left to write to.

       THEY WERE ALREADY DEAD, which is why deleting them costs nothing and is worth recording.
       Measured across `js/` and `index.html`: not one of the three strings occurs. They were
       access-listed in `ACTION_ACCESS`, published, and never once called — `orderPrints` again, and
       eight more of the same shape are still here (`updateVenue`, `updateConfig`, `updatePricing`,
       `updateShop`, `deleteShopItem`, `saveRoom`, `updateTrip`, `addTrip`). Those eight write to
       tabs that still exist, so they still would work if anything ever called them; these three
       could not. A link is edited by editing the file and pushing, which is a deploy — the same
       trade `questions` made, for a tab nobody hand-edits twice a year. */
```

### a room, saved by venue and slot ------------------------------------------------------- Upsert, not update:

in `doPost`

```
/* --- a room, saved by venue and slot -------------------------------------------------------
       Upsert, not update: the six slots always exist on screen, so the first edit to an empty one
       has to create its row. Keyed on venue + name rather than a row number, because the form is
       drawn from a fixed list and doesn't know whether a row exists yet — and shouldn't have to. --- */
```

### fetch an image so a canvas can use it ------------------------------------------------ A browser cannot draw a Drive photo onto a canvas it intends to export.

in `doPost`

```
/* --- fetch an image so a canvas can use it ------------------------------------------------
       A browser cannot draw a Drive photo onto a canvas it intends to export. Ask for the bytes
       with crossOrigin and Drive refuses, so the image never loads; ask without it and the image
       loads but poisons the canvas, so the export throws. There is no third option from the page.

       Apps Script has no such restriction — it isn't a browser and CORS doesn't apply — so it
       fetches the bytes and hands back a data URI, which is same-origin by definition and can be
       drawn and exported freely. One round trip, and only when someone shares. --- */
```

### ---------- THREE RESOURCE HANDLERS WERE HERE

in `doPost`

```
/* ---------- THREE RESOURCE HANDLERS WERE HERE -----------------------------------------------
       `updateResource` relabelled a document by row number, `editResource` did the same by id, and
       `deleteResource` set its `active` to FALSE. All three wrote cells on a `kind: 'paper'` row of
       the `questions` tab, and that tab is `data/questions.json` in this repository now: a relabel
       is a commit, not a cell.

       THE FORM WENT WITH THEM. It was built from `resourceFields` on the payload — the same object
       the server checked writes against — so there is no version of it left offering a field
       nothing will accept. See js/resource.js, where only the basket and the paper remain. */
```

### THE POLL IS NOT FREELY EDITABLE.

in `doPost`

```
/* THE POLL IS NOT FREELY EDITABLE.
         A vote is stored against the option's TEXT. Rename an option and every vote cast for it
         points at something that no longer exists — the count survives, its option does not, and
         the percentages quietly stop adding up. Nothing throws, which is the worst version of it.
         So the options may change only while nobody has voted. */
```

### A date typed by hand.

in `doPost`

```
/* A date typed by hand. Parsed as DD/MM/YYYY and stored as a real Date, so the feed can
           sort on it — a string in that cell sorts as text, which puts 09/06 above 22/02 and
           below 1/12. Refused rather than stored wrong: a post that silently moves to the bottom
           of the feed is the kind of failure nobody connects to the edit that caused it. */
```

### THE NAME THE FORM USES IS NOT THE NAME OF THE COLUMN.

in `doPost`

```
/* THE NAME THE FORM USES IS NOT THE NAME OF THE COLUMN. The phone has always called this
           `posted_on`; this sheet keeps `creation_date`. Writing the form's name would have gone
           to a column that is not there — caught now rather than discarded silently, but caught is
           not the same as working. */
```

### LETTING A POST THROUGH, OR TURNING IT DOWN -------------------------------------------- The other half of anybody being able to post.

in `doPost`

```
/* --- LETTING A POST THROUGH, OR TURNING IT DOWN --------------------------------------------
       The other half of anybody being able to post. `on` is true to approve and false to refuse.

       REFUSING DOES NOT DELETE. The row stays, marked, because a post you turned down is exactly
       the one you might have to show somebody afterwards — a parent asking why, or a safeguarding
       question about what a child put up. Deleting it is the one thing that cannot be undone, and
       it would destroy the only record of a decision you made. --- */
```

### admin deletes a post — `active` FALSE, for the same reason a resource is --------------- Likes, votes and reactions are all rows elsewhere pointing at this

in `doPost`

```
/* --- admin deletes a post — `active` FALSE, for the same reason a resource is ---------------
       Likes, votes and reactions are all rows elsewhere pointing at this post_id. Remove the row
       and every one of them points at nothing, which renders as a like count on a post that is
       not there. The picture stays in Drive; the likes stay counted. --- */
```

### ---------- `orderPrints` WAS HERE, AND NOTHING EVER KNOCKED ON IT

in `doPost`

```
/* ---------- `orderPrints` WAS HERE, AND NOTHING EVER KNOCKED ON IT ---------------------------
       It priced a basket of printed papers from the SHEET rather than from the request — the right
       decision, and the note above it made the argument at length: a total posted by a browser is a
       total the client chose. There is no sheet. Page counts and print prices are in
       `data/questions.json`, which the backend cannot read.

       AND THE FRONT END NEVER CALLED IT. `cart-send` in js/resource.js has always been
       `toast('Checkout is the next thing to build')`. So this was a priced, guarded, access-listed
       endpoint that no version of the app has ever posted to — which is why removing it costs the
       basket nothing: the basket is local, it still totals, and the button still says the same
       sentence. What is actually missing is a checkout, and it was missing before this. */
```

### setCell returns false for a column that does not exist and says nothing.

in `savePerson`

```
/* setCell returns false for a column that does not exist and says nothing. That is how
           four pricing fields were written and lost four times over. Said out loud here, because
           nobody can act on an error they were never shown. */
```

### posting ------------------------------------------------------------------------------- An admin picks a photograph on their phone and it lands in the Drive

in `doPost`

```
/* --- posting -------------------------------------------------------------------------------
       An admin picks a photograph on their phone and it lands in the Drive folder AND in the posts
       tab, in one go. Two places, one action — which is the only way they stay in step.

       The picture arrives as base64 because a phone cannot hand Apps Script a file any other way.
       It is resized on the phone first, so what arrives is a few hundred kilobytes rather than the
       five megabytes a modern camera produces. */
```

### WHO IT IS, FIRST — BEFORE A BYTE GOES INTO DRIVE.

in `doPost`

```
/* WHO IT IS, FIRST — BEFORE A BYTE GOES INTO DRIVE. This was asked after the upload, so an
         upload happened whoever was asking and whatever they already had waiting; under
         `drive.readonly` that cost nothing because every upload failed. With `drive` it is the
         difference between a limit and a suggestion: the waiting count below needs to know whose
         posts to count, and a refusal that comes after the files are made has already let them in. */
```

### ---------- SEVERAL PICTURES AND CLIPS, AND THE FIRST IS STILL WHERE IT ALWAYS WAS

in `doPost`

```
/* ---------- SEVERAL PICTURES AND CLIPS, AND THE FIRST IS STILL WHERE IT ALWAYS WAS ----------
         `data` / `image` ARE THE FIRST ITEM exactly as before, so a phone older than this deploy
         still posts; `media` is the list of the rest, each either a `data:` URL to upload or an
         address to keep. One helper for both halves, because the first picture and the fifth are
         the same act and two copies of "save a file to the posts folder" is two places for the
         sharing line to be forgotten. */
```

### A LIST WITH NOWHERE TO GO IS REFUSED BEFORE ANYTHING IS UPLOADED.

in `doPost`

```
/* A LIST WITH NOWHERE TO GO IS REFUSED BEFORE ANYTHING IS UPLOADED. Without the column
         `addRow` would drop the rest with a line in the log and the post would go up holding one of
         the five pictures somebody chose — a success message over a post that is not what they
         made. `?setup=1` creates it. */
```

### THE CAPS AND THE QUEUE, BEFORE ANYTHING IS KEPT — `postMediaRefusal_` and `postsWaitingFor_` in content.gs say why each exists.

in `doPost`

```
/* THE CAPS AND THE QUEUE, BEFORE ANYTHING IS KEPT — `postMediaRefusal_` and `postsWaitingFor_`
         in content.gs say why each exists. An admin's post goes straight up, so only the caps apply
         to one; everybody else's waits, and waiting is where the limit is. */
```

### WHO IT IS FROM, which is not the same as who pressed the button.

in `doPost`

```
/* WHO IT IS FROM, which is not the same as who pressed the button.
         An admin posts as the business by default — the feed should read @family., not the name of
         whoever happened to have their phone out. Posting under your own name is a choice you
         make, not the default you fall into.
         The person who actually did it is still recorded, so nothing is lost. */
```

### POSTING AS THE BUSINESS IS AN ADMIN'S TO DO.

in `doPost`

```
/* POSTING AS THE BUSINESS IS AN ADMIN'S TO DO. Anybody else posts as themselves, whatever the
         request says — a client whose post went up signed "@family." would be the site putting your
         name to something you had not seen. */
```

### WHEN THE PHOTOGRAPH WAS MADE, from the file itself — not the moment somebody pressed Post.

in `doPost`

```
/* WHEN THE PHOTOGRAPH WAS MADE, from the file itself — not the moment somebody pressed
           Post. A picture chosen from the folder may have been taken in February, and dating it
           today puts it at the top of a feed above things that happened after it. */
```

### YOURS GOES UP. EVERYBODY ELSE'S WAITS.

in `doPost`

```
/* YOURS GOES UP. EVERYBODY ELSE'S WAITS. Blank rather than TRUE for an admin, because blank
           already means "never needed approving" — every row that predates this column reads that
           way, and writing TRUE would make an admin's post a DIFFERENT kind of approved from a post
           made last year. One meaning per value. */
```

### SOMEBODY HAS TO KNOW IT IS WAITING, or it waits for ever.

in `doPost`

```
/* SOMEBODY HAS TO KNOW IT IS WAITING, or it waits for ever. This is the whole mechanism: a
         post nobody is told about is a post nobody approves, and the person who made it is left
         wondering why the app ate their photograph. */
```

### Anything in the folder that is not yet a row becomes one.

in `doPost`

```
/* Anything in the folder that is not yet a row becomes one. This is the sync: drop files in
       from a computer, press this, and they appear — without which the folder and the tab drift
       apart the first time somebody uploads outside the app. */
```

### THE FILE'S NAME IS THE CAPTION.

in `doPost`

```
/**
       * THE FILE'S NAME IS THE CAPTION.
       *
       * Every post the scan made arrived with an empty caption and the name thrown away, so the
       * only way to caption anything was to open each post and type in what was already written
       * on the file. Naming a photograph in Drive is the natural place to write a caption — you
       * are already there, on a phone, having just taken it.
       *
       * Only the EXTENSION is removed. Not the date, not the brackets, not a number in front:
       * those are somebody's own words about their own photograph, and a scan that decided which
       * parts of a filename were meaningful would be guessing about the one thing it was told
       * directly.
       */
```

### THE SCAN DOES NOT NEED TO WRITE, and a check I added here was refusing to run it unless it could.

in `doPost`

```
/* THE SCAN DOES NOT NEED TO WRITE, and a check I added here was refusing to run it unless it
         could. It writes only in order to SHARE each file — and a folder that is already shared
         with anyone who has the link shares its contents by inheritance, so on this folder that
         call has nothing to do.

         Which makes this the route that works while the upload does not: drop photographs into the
         folder from the Drive app or a computer, press ⟳, and they become posts. Reading a folder
         needs only read access, and that is what the deployment has.

         A file that genuinely cannot be shared is still added, and counted, and reported. A
         photograph that might not load is better than a photograph silently skipped. */
```

### WHAT WAS ACTUALLY SEEN.

in `doPost`

```
/* WHAT WAS ACTUALLY SEEN. A scan that finds nothing and says "nothing found" gives you no
         way to tell a folder in the wrong place from a folder full of shortcuts — so it reports
         every file it looked at and why each one was skipped. */
```

### RENAME THE FILE AND THE CAPTION FOLLOWS.

in `doPost`

```
/* RENAME THE FILE AND THE CAPTION FOLLOWS. That is the whole point of taking the name:
               if it only applied the first time, correcting a typo would mean correcting it twice,
               in two places, one of which nobody would remember.
               But only while the caption still MATCHES a filename — the moment somebody edits the
               caption in the app it is theirs, and a scan that overwrote it would be the app
               throwing away the more considered of the two. So: empty, or still equal to the name
               the file used to have. */
```

### JUST THE NAME. The scan does not touch `caption` at all any more — it records what the file is called and the payload decides what to show.

in `doPost`

```
/* JUST THE NAME. The scan does not touch `caption` at all any more — it records what
               the file is called and the payload decides what to show. A rename therefore follows
               automatically, and a caption somebody typed is safe without anything having to
               check whether it was safe. */
```

### Sharing can fail on a file somebody else owns, or because this deployment has read access and no more.

in `doPost`

```
/* Sharing can fail on a file somebody else owns, or because this deployment has read
               access and no more. Neither stops the post being made: if the FOLDER is shared with
               anyone who has the link, the file already is too, and the picture will load. */
```

### The file's own date, not today's — a folder of a year's photographs added in one go would otherwise all claim to have happened this afternoon.

in `doPost`

```
/* The file's own date, not today's — a folder of a year's photographs added in one go
               would otherwise all claim to have happened this afternoon.
               Both, because they are different facts and the sheet has room for both: when the
               photograph was made, and when it arrived. */
```

### listing a tutor ------------------------------------------------------------------------- `listed` decides whether a tutor appears on the site at all.

in `doPost`

```
/* --- listing a tutor -------------------------------------------------------------------------
       `listed` decides whether a tutor appears on the site at all. It has always worked; there was
       simply no way to change it without opening the spreadsheet, which makes it a column with a
       comment rather than a control.
       Admin only, and deliberately so: a tutor who could list themselves could put themselves in
       front of clients before you had agreed to it. */
```

### ---------- IT LOOKED THE PERSON UP ITSELF, AND HALF THE ROSTER HAS NO `full_name`

in `doPost`

```
/* ---------- IT LOOKED THE PERSON UP ITSELF, AND HALF THE ROSTER HAS NO `full_name` ----------
       REPORTED AS *"why does george have a crossed out eye even if i click it. then it says no such
       person."* The tile sent the DISPLAY name and this compared it against `full_name` alone —
       but `personDisplayName`, which is what built that name, is `full_name` OR `first + last`.
       A row with the two halves filled in and the whole-name cell empty therefore produced a name
       this lookup could never match: the switch refused every press, put the tile back, and said
       the person did not exist while their card was on the screen above it.

       `findPerson` IS THE ONE READER and resolves person_id, full_name, first + last, handle and
       username in that order — which is exactly the list `personDisplayName` draws from. A second
       lookup written out here is the second reader this repository records under `documents_()`,
       `factsNow_` and `childrenOf`, and this is what it cost. The phone sends the id now as well,
       so the name is the fallback rather than the only route. */
```

### a forgotten PIN -------------------------------------------------------------------------- ASKED FOR AS

in `doPost`

```
/* --- a forgotten PIN --------------------------------------------------------------------------
       ASKED FOR AS *"add forgot pin option. it will send an email to their email."*

       ---------- IT SAYS WHAT HAPPENED NOW, BECAUSE THE SAME SENTENCE WAS HIDING NOTHING -------------
       IT ANSWERED ONE SENTENCE WHATEVER HAPPENED — "a new PIN is on its way … (a child with no email:
       the parent's inbox)" — on the grounds that a reply saying "no such person" would turn this into
       a machine for confirming who holds an account. Sign-in has said exactly that since 184
       (`no-such-email`, `not-an-email`), so the sentence protected nothing, and it cost the one
       person it was written for: a child with no address and no accepted parent was told a PIN was in
       an inbox that does not exist, and waited. So each case says itself — no such account, nobody to
       send it to (ask a parent or your tutor), sent a moment ago, could not be sent, sent.

       ---------- AND IT NO LONGER TOUCHES THE PIN UNTIL THE NEW ONE IS USED ----------------------------
       See `authResetUse_` in booking.gs. The request mails a PIN that works BESIDE the old one for a
       day; anybody may press this with anybody's handle, and now what that costs the child is an email
       to their grown-up rather than a PIN that stopped working.

       SESSIONS ARE NOT ENDED BY ASKING, and that is deliberate and is the opposite of `changePin`.
       There the person asking has proved who they are, so ending every other session removes an
       intruder. Here anybody may ask, so ending sessions would let a stranger sign the owner out of
       their own phone by typing their name. USING the PIN this sends is different, and ends them all
       (`authResetUse_`): whoever types it back has proved the inbox it went to.

       ---------- AND IT IS THE ONE PIN MAILED TO AN ADDRESS NOBODY HAS PROVED ---------------------------
       An account's OWN address gets it whatever its state, because this is how that address's owner
       takes back an account somebody else registered on it — the PR #130 review's squatter. A child's
       grown-ups get it only once THEIR address is proved (`authGrownUps_`), because a child's PIN in a
       typo's inbox is a stranger holding the child. */
```

### ---------- THE SAME TWO DOORS AS SIGNING IN, READ THE SAME WAY

in `doPost`

```
/* ---------- THE SAME TWO DOORS AS SIGNING IN, READ THE SAME WAY --------------------------------
         No `@` is a handle, through `handleRows_` (every row, as `verifyLogin`); an `@` is an address,
         `norm` on both sides and whole — never `key`, which strips the dots and the `@` and made
         `halex.dias@x.com` and `halexdias@xcom` one address. TWO ROWS ON ONE IS REFUSED, NOT GUESSED:
         which of the two accounts would be sent a PIN is exactly the guess `verifyLogin` will not make. */
```

### ---------- WHERE IT GOES: THE ACCOUNT'S OWN ADDRESS, OR ITS GROWN-UPS

in `doPost`

```
/* ---------- WHERE IT GOES: THE ACCOUNT'S OWN ADDRESS, OR ITS GROWN-UPS --------------------------
         A row with an address is sent to that address whichever door was used — the inbox the address
         door reaches, so typing the handle instead reaches nobody new. A row with none goes to its
         accepted parents and the grown-up's address it was made with (`authGrownUps_`) — mailboxes
         that are not the child's, belonging to the people who would be asked anyway. */
```

### A GROWN-UP'S ADDRESS THAT IS THERE AND NOT YET OPENED is said as itself:

in `doPost`

```
/* A GROWN-UP'S ADDRESS THAT IS THERE AND NOT YET OPENED is said as itself: "we have no email" to a
         child whose grown-up was sent a link yesterday sends them looking for the wrong thing. The link
         is the way in, and it is in that inbox already. */
```

### THE SAME PIN AGAIN if one is still waiting, so a grown-up holding two emails holds two copies of one PIN rather than a dead one and a live one — unless wrong

in `doPost`

```
/* THE SAME PIN AGAIN if one is still waiting, so a grown-up holding two emails holds two copies
         of one PIN rather than a dead one and a live one — unless wrong tries have retired it, when a
         new one is drawn (its link, below, is kept: the first mail's link still works). */
```

### ---------- AND TO THE ACCOUNT'S OWN ADDRESS, A LINK BESIDE IT THAT NO WRONG GUESS CAN USE UP

in `doPost`

```
/* ---------- AND TO THE ACCOUNT'S OWN ADDRESS, A LINK BESIDE IT THAT NO WRONG GUESS CAN USE UP ------
         See the note over `authResetKey_`: a squatter typing wrong PINs on purpose retires the typed
         PIN, and this is how its owner gets in anyway. The same key for the life of the request, so
         every copy of this mail carries a link that works. */
```

### `to` IS THE ACCOUNT'S OWN ADDRESS WHEN THAT IS WHERE IT WENT — typing this PIN back is then proof of that inbox, and a PENDING row is confirmed by it

in `doPost`

```
/* `to` IS THE ACCOUNT'S OWN ADDRESS WHEN THAT IS WHERE IT WENT — typing this PIN back is then
         proof of that inbox, and a PENDING row is confirmed by it (`authResetUse_`). Blank for a PIN
         sent to a child's grown-ups, which proves nothing about the child's row. */
```

### ---------- THE SIGN-IN LINK IN A FORGOTTEN-PIN MAIL

in `doPost`

```
/* ---------- THE SIGN-IN LINK IN A FORGOTTEN-PIN MAIL -----------------------------------------------
       `?signin=<key>` — see the note over `authResetKey_` in booking.gs. The emailed PIN used, by the one
       copy of it nobody can guess: so no lock is asked about and no miss is counted, which is the whole
       point (a squatter's wrong PINs retire the typed half, and this is the owner's way in regardless).
       Everything else is what typing the PIN back does — `authResetTake_`, one body for both: it becomes
       the PIN, every other session ends, a PENDING row is taken back and its children held — and then a
       session for whoever opened it, as `signInRow_` makes one. Only for a mail to the account's OWN
       address, and only while that is still the address it went to (`held.to`): a grown-up's mail never
       carries one, and a link to an address the account has since left opens nothing. */
```

### TAKEN BEFORE A ROW WITH NO ID IS GIVEN ONE — `signInRow_`'s rule for a session — because the record it drops is keyed by what the row is called NOW, and after

in `doPost`

```
/* TAKEN BEFORE A ROW WITH NO ID IS GIVEN ONE — `signInRow_`'s rule for a session — because the
         record it drops is keyed by what the row is called NOW, and after the id it would be called
         something else and the link would still work. */
```

### ONE MESSAGE TO EVERYBODY WAS HERE ------------------------------------------------------- `broadcast` — `sendMessage` without the picker and without the

in `doPost`

```
/* --- ONE MESSAGE TO EVERYBODY WAS HERE -------------------------------------------------------
       `broadcast` — `sendMessage` without the picker and without the five-minute gap, admin-only —
       and it went with its only door, the "Message everyone" card at the foot of the Messages
       column, on the report "remove the note to everyone button". A handler with no door is the
       `orderPrints` shape, and it would also have been a live admin action nothing could see or
       test. The one idea in it worth keeping if it is ever rebuilt: every row of one send needs its
       own `message_id`, because `'M' + Date.now()` is one millisecond for a whole loop and
       `readMessage` finds a message by that id. */
```

### reacting ------------------------------------------------------------------------------- One per person per post, and it can be changed or taken back — the

in `doPost`

```
/* --- reacting -------------------------------------------------------------------------------
       One per person per post, and it can be changed or taken back — the same shape as a vote,
       because it is the same kind of thing: a choice among a few, held by a person. */
```

### The emoji must be one this post OFFERS.

in `doPost`

```
/* The emoji must be one this post OFFERS. Without the check anybody could react with any
         character and it would appear beside the real ones as though it belonged.
         The same function the payload used to build the row, so the two cannot disagree — reading
         the set twice in two places is how a face gets drawn that the server then refuses. */
```

### ---------- `want` IS THE FACE TO END ON, AND IT IS SET, NOT TOGGLED

in `doPost`

```
/* ---------- `want` IS THE FACE TO END ON, AND IT IS SET, NOT TOGGLED ------------------------
         THIS WAS ONLY A TOGGLE — "the same one again takes it back" — and a toggle is a request that
         means something different depending on what arrived before it. The phone sent one per tap and
         undid each refused one on its own, so a quick double tap whose first save was refused and
         second accepted left 😂 here and nothing on the page; a reload brought back a reaction the
         person had taken back (docs/history/335). The phone now sends one save at a time carrying
         `want` ('' for none), and this sets it: the same request twice, or one arriving late, changes
         nothing. `emoji` alone is still the toggle, for a phone running code from before `want`. */
```

### ---------- UNDER THE SCRIPT LOCK, AND OVER EVERY ROW OF YOURS

in `doPost`

```
/* ---------- UNDER THE SCRIPT LOCK, AND OVER EVERY ROW OF YOURS -----------------------------
         Look-then-write with no lock: two requests read "nothing of yours", and both added a row.
         So the read is fresh under the lock, as `submitAnswer`'s is, and it takes EVERY row this
         person has on this post rather than the first — a copy an old race left behind would have
         counted twice on every load, and come back after the first was taken away. */
```

### saying something under a post ------------------------------------------------------------ THE SAME SHAPE AS A REACTION AND A VOTE, one column wider:

in `doPost`

```
/* --- saying something under a post ------------------------------------------------------------
       THE SAME SHAPE AS A REACTION AND A VOTE, one column wider: a post_id, a person_id, what they
       said and when. Three tabs behaving the same way is three things a reader already understands.

       IT IS NOT ONE PER PERSON, which is the one place it differs and the reason it is an `addRow`
       with no lookup first. A reaction and a vote are a CHOICE — you have one, and pressing again
       changes or takes it back. A remark is not a choice; somebody who says two things has said two
       things.

       THE POST HAS TO BE ONE THEY CAN SEE. A post waiting for approval is sent to nobody but its
       author and an admin, so commenting on one is a request that could only have been made by
       guessing an id — and answering it would confirm the id exists. Refused in the same sentence
       as a post that is gone, because "no" and "not for you" are the same answer to somebody
       guessing.

       2,000 CHARACTERS, WHICH IS `sendMessage`'S CAP AND FOR ITS REASON: a cell has a limit, and a
       person who typed an essay should be told rather than have the sheet quietly keep half of it.
       Refused rather than truncated — a comment that posts as something other than what was typed
       is worse than one that does not post. */
```

### ---------- THE SAME THREE ANSWERS `doGet` GIVES, AND THEY ARE READ OFF THE SAME COLUMN

in `doPost`

```
/* ---------- THE SAME THREE ANSWERS `doGet` GIVES, AND THEY ARE READ OFF THE SAME COLUMN ----
         `post.person_id` WAS THE FIRST VERSION OF THIS AND THE POSTS TAB HAS NO SUCH COLUMN.
         `check-rows.js` named it — the check that asks whether a name is a column of THIS tab
         rather than of any tab, which is the fault it was written for. Whose post it is lives in
         `author`, resolved through `findPerson` exactly as the payload resolves it; a second way of
         asking "is this yours" is a second answer to get wrong on the one question that decides
         who may write under somebody's photograph. */
```

### taking one down --------------------------------------------------------------------------- A CELL, NOT A DELETED ROW, and the argument is the one `approved`

in `doPost`

```
/* --- taking one down ---------------------------------------------------------------------------
       A CELL, NOT A DELETED ROW, and the argument is the one `approved` already makes on a post: a
       comment you took down is the one you may need to show somebody afterwards, and deleting it is
       the single thing here that cannot be undone.

       THE AUTHOR OR AN ADMIN. The gate can only see that somebody is signed in — whose comment it
       is is a question only this can answer, which is why `deleteComment` is `self` in the access
       table and the real rule is the next two lines. It is also the ONLY place that rule is
       written: `doGet` sends `canRemove` per comment so the phone draws what the server decided
       rather than deciding again. */
```

### voting in a poll ----------------------------------------------------------------------- One vote per person per post, and it can be changed.

in `doPost`

```
/* --- voting in a poll -----------------------------------------------------------------------
       One vote per person per post, and it can be changed. Changed rather than added, because a
       person who taps twice has changed their mind, not voted twice — and the row is updated so
       there is never a second one to reconcile. */
```

### Tapping the answer you already chose takes the vote back — the same gesture that cast it, which is how every poll a person has used already behaves.

in `doPost`

```
/* Tapping the answer you already chose takes the vote back — the same gesture that cast
           it, which is how every poll a person has used already behaves. A phone that sends `want`
           has worked that out itself and sends ''. */
```

### the photographs already in the folder, that are not posts yet --------------------- UPLOADING NEEDS WRITE ACCESS.

in `doPost`

```
/* --- the photographs already in the folder, that are not posts yet ---------------------
       UPLOADING NEEDS WRITE ACCESS. Reading the folder does not, and this deployment plainly has
       read — the captions are coming off filenames, which is the same call.
       So there is a way to post that needs nothing granted: put the photograph in the folder from
       the Drive app, and choose it here. The picture already exists and is already shared; all
       that is missing is a row, and a row is a sheet write.
       This is not a workaround for a broken feature. For a photograph taken on a phone it is
       fewer steps than uploading: it is already in Drive.
    ------------------------------------------------------------------------------------------ */
```

### messages ------------------------------------------------------------------------------ Send, read, and flag.

in `doPost`

```
/* --- messages ------------------------------------------------------------------------------
       Send, read, and flag. Everything that can refuse says which rule refused it, because "not
       allowed" tells somebody nothing about what to do next. */
```

### A FILE WITH NOWHERE TO GO IS REFUSED BEFORE ANYTHING IS UPLOADED — `addRow` would drop the column with a line in the log and the message would arrive without

in `doPost`

```
/* A FILE WITH NOWHERE TO GO IS REFUSED BEFORE ANYTHING IS UPLOADED — `addRow` would drop the
         column with a line in the log and the message would arrive without the picture it was
         sent for. `addPost`'s `media` rule, one tab along. */
```

### ---------- ONLY WHEN THERE IS SOMETHING TO PUT IN IT

in `doPost`

```
/* ---------- ONLY WHEN THERE IS SOMETHING TO PUT IN IT ----------------------------------------
         `attachments: ''` WAS WRITTEN ON EVERY MESSAGE, and on a Ledger without the column `addRow`
         counts a field it has nowhere to put as a miss whatever its value — so `jsonOut` turned a
         message of plain words into "Nothing was saved for: messages.attachments". The row HAD been
         written and the e-mail HAD gone; the phone said "Not sent", and Retry ran into the
         five-minute gap the first send had started. Words never needed the column. */
```

### ---------- CHECK UPLOADS

in `doPost`

```
/* ---------- CHECK UPLOADS ---------------------------------------------------------------------
       The admin's tile on Tools: can a photograph or a clip in a message be kept, asked of THIS
       deployment rather than of the editor. Leaves nothing behind — see `uploadsCheck_`. */
```

### ---------- WHO THE OTHER PERSON IS

in `rows`

```
/* ---------- WHO THE OTHER PERSON IS ---------------------------------------------------
             `fromName` HAS BEEN READ BY THE PHONE AND NEVER SENT. `messagesHtml_` prints
             `m.fromName || 'them'`, so every message anybody has ever received has been labelled
             "them" — the field simply was not in this reply.

             AND THE COUNTERPART IS THE THREAD. A message is between two people; which of them is
             the OTHER one depends on who is asking, and the server is the only side that knows both
             the ids and the names. Sent once here rather than looked up per row on a device that
             does not have the people tab. */
```

### claiming a child ------------------------------------------------------------------ A parent types a first and last name.

in `doPost`

```
/* --- claiming a child ------------------------------------------------------------------
       A parent types a first and last name. Nothing happens to the child's account until the
       child accepts — so a wrong name reaches nobody, and a right one reaches somebody who gets
       to say no. */
```

### HELD, NOT MAIN. The card is drawn for anybody who HOLDS client or admin (`mayAddChild_` reads `heldRoles`), and this asked for the MAIN role — so a person who

in `doPost`

```
/* HELD, NOT MAIN. The card is drawn for anybody who HOLDS client or admin (`mayAddChild_` reads
         `heldRoles`), and this asked for the MAIN role — so a person who is both a tutor and a parent
         was shown the card and refused behind it. `hasRole` reads every role in the cell. */
```

### NOT FROM AN ADDRESS NOBODY HAS PROVED — see `addressPending_`.

in `doPost`

```
/* NOT FROM AN ADDRESS NOBODY HAS PROVED — see `addressPending_`. Asking is not linking, but the
         child's yes would be a yes to an account whoever owns that inbox can take with "Forgotten your
         PIN?", and a child cannot be expected to know that. Refused here, before anybody is asked. */
```

### ---------- A YES TO AN ACCOUNT WHOSE ADDRESS NOBODY HAS PROVED WAITS

in `doPost`

```
/* ---------- A YES TO AN ACCOUNT WHOSE ADDRESS NOBODY HAS PROVED WAITS --------------------------
         The claim was asked by somebody signed in, and `claimChild` refuses a PENDING asker now — but a
         claim asked before it did, or written into the family tab by hand, still sits here, and a yes
         to it is the child put on an account whoever owns that inbox can take.
         So YES waits, with the row left `asked` so it can be answered once the address is proved; NO
         is never held up, because saying no to a stranger must not depend on the stranger. */
```

### changing a PIN -------------------------------------------------------------------- Deliberately NOT a profile field.

in `doPost`

```
/* --- changing a PIN --------------------------------------------------------------------
       Deliberately NOT a profile field. Everything on that form autosaves as you type, and a PIN
       that autosaves is a PIN that changes when somebody leans on a keyboard — and locks the owner
       out of their own account.
       So it asks for the CURRENT one first. That is the whole protection: an unlocked laptop, a
       shared computer or a session left open cannot be used to take an account, because taking it
       needs something only the owner knows. */
```

### ---------- THE TUTOR AGREEMENT: A TICK THAT STAYS TICKED

in `doPost`

```
/* ---------- THE TUTOR AGREEMENT: A TICK THAT STAYS TICKED ------------------------------------
       ASKED FOR AS *"a draft widget for tutors, just do a draft small contract with tick to agree.
       cant untick after ticked."* The phone's box is disabled once ticked, and that is the
       convenience; THIS is the rule — a row already carrying a signature is refused rather than
       re-stamped, so the date it holds is the day they agreed and nothing can move or clear it.
       There is no `agree: false` path at all, which is the only way "cannot untick" is true of a
       server anybody can post to.

       TUTORS AND ADMINS, the same test the widget roster's `tutor: true` flag reads. A parent
       posting here gets a sentence rather than a signature on a contract they are not party to. */
```

### ALREADY SIGNED IS AN ANSWER, NOT A FAILURE.

in `doPost`

```
/* ALREADY SIGNED IS AN ANSWER, NOT A FAILURE. It was an error, so a phone that had not seen the
         tick yet (signed in before it was made on another one) unticked the box, re-enabled it and
         toasted a refusal about an agreement that WAS signed. The reply carries the date either way,
         and the phone ticks and locks the box from it. */
```

### BOTH COLUMNS BEFORE EITHER IS WRITTEN.

in `doPost`

```
/* BOTH COLUMNS BEFORE EITHER IS WRITTEN. It checked the first only, so with `agreement_version`
         missing the date landed and `jsonOut` then called the whole thing a failure — a signature on
         the sheet under a phone that unticked it. */
```

### ---------- A NEW WORD FOR YOUR OWN HANDLE

in `doPost`

```
/* ---------- A NEW WORD FOR YOUR OWN HANDLE --------------------------------------------------
       ASKED FOR AS *"handles should be their name and a virtuous describing word. they can randomise
       it but it will follow that general name."* So there is no box to type a handle into any more:
       the Settings card shows the one you have and a Randomise button, and this is what it presses.
       It asks `handleMake_` for another, never the one you already have, and writes it. Since
       *"their first name, a virtuous adjective and random numbers and maybe an underscore. but all
       random order"* that is a fresh word, a fresh number and a fresh arrangement on every press.

       A CHILD WITH NO E-MAIL SIGNS IN WITH THE HANDLE, so for them this press changes the sign-in
       name too. The Settings card says so under the tile for exactly those accounts.

       THE ROW IS THE TOKEN'S. `accessDenied` writes `body.personId` from the session before this
       runs, so a request naming somebody else's id randomises the asker's own handle — there is no
       admin path and no target, because a handle is the one thing about a person nobody else
       should be choosing for them.

       NO COOLDOWN, AND THAT IS NOT AN OVERSIGHT. A month between changes existed because a typed box
       let somebody try variations until a rude one got past the blocklist. Every handle this can
       produce is a first name and a word somebody chose for the list, so pressing it again is a
       child looking for a word they like rather than an attempt at anything.

       ALL THREE COLUMNS BEFORE ANY IS WRITTEN. `setCells` loses a write to a header that is not
       there and `jsonOut` then calls the whole thing a failure — over a handle that HAD changed,
       with nothing in `handle_was` to say what it was. */
```

### A FULL HISTORY STOPS THE PRESS, IT DOES NOT LOSE ITS OLDEST (342, the review).

in `doPost`

```
/* A FULL HISTORY STOPS THE PRESS, IT DOES NOT LOSE ITS OLDEST (342, the review). Every old handle
         still signs its person in and is never given to anybody else, so trimming the cell — it kept the
         newest ten — retired the handle on a child's slip at the eleventh press and freed it for the next
         person with that first name. `HANDLE_WAS_MAX` presses is a child who will be told to ask. */
```

### `handle_was` IS A HISTORY, newest first and kept whole — see `handleWasWith_`.

in `doPost`

```
/* `handle_was` IS A HISTORY, newest first and kept whole — see `handleWasWith_`. It was one cell
         overwritten by each change, which answered "who was @foo" only about the most recent name.
         WRITTEN FIRST, IN ITS OWN WRITE (342, the review): `setCells` writes one run of adjacent columns
         at a time, so on a tab where `handle_was` is not beside `handle` a failure between the two left
         a new handle with nothing to say what the old one was — and the old one, on the slip, no longer
         signing anybody in. This way round a failure leaves an extra history entry and the old handle. */
```

### AND THE FACE THE OLD HANDLE DREW, in the same write, when nobody ever chose a look (`handleFaceKept_`, 342 round 2) — a blank look is drawn from the handle, so

in `doPost`

```
/* AND THE FACE THE OLD HANDLE DREW, in the same write, when nobody ever chose a look (`handleFaceKept_`,
         342 round 2) — a blank look is drawn from the handle, so every press changed the skin and the hair
         colour. Sent back as `avatar`, so the phone draws the same face before its next sign-in. */
```

### ---------- A PARENT MAKES THEIR CHILD'S ACCOUNT

in `doPost`

```
/* ---------- A PARENT MAKES THEIR CHILD'S ACCOUNT -------------------------------------------------
       ASKED FOR AS *"so all kids can login easily with their handle and pin."* "Add your child" only
       ever LINKED an account that already existed — and the only ways an account came to exist were
       `register` (which wanted the child's own email) and the owner typing a row into the sheet. So a
       parent of a child with no inbox had nothing to add, and a second child on one family's address
       was "That email is already registered".

       THE ROW IS MADE HERE, BY THE PARENT, AND IS LINKED ALREADY. No email (it would be a credential,
       and a made-up one is a wrong cell); a handle from `handleMake_`, so the shape and the clash and
       the blocklist are asked once as everywhere else; the PIN the parent chose, under `pinWeak_`;
       `verified` TRUE, because the person vouching for the child is signed in and is their parent.
       The family link is written `accepted`: `claimChild` waits for the child to say yes because a
       stranger could be claiming somebody else's child, and here no existing person is being claimed
       — the child this makes did not exist a second ago.

       THE HANDLE COMES BACK IN THE REPLY so the phone can show it with the PIN, once, to write down;
       and it is emailed to the parent, without the PIN — the parent chose it, and a PIN in a mailbox is
       one more copy of it. Every id is made before anything is written, so the person row and the
       link land together or the refusal comes first. */
```

### THE REFUSAL NAMES A TICK THAT EXISTS, AND ONLY TO SOMEBODY WHO MAY TICK IT.

in `doPost`

```
/* THE REFUSAL NAMES A TICK THAT EXISTS, AND ONLY TO SOMEBODY WHO MAY TICK IT. It said *"Tick
         Parent under Your roles"* — the card's word is Client (`ROLE_LABEL`), and the person most
         likely to be told it, a student, is refused that very tick by `setMyRoles`. So: a student is
         told who can change it, read as `setMyRoles` reads it (`actingRole_`, so a waiting Tutor
         tick is still a student); anybody else — a tutor, who may tick Client — is told the tick. The
         phone never draws this card for either, so it is reached by a stale phone or a request sent
         straight here; found by the walk after the parent sign-up, which sent one. */
```

### ---------- NOT ON AN ACCOUNT WHOSE ADDRESS NOBODY HAS PROVED

in `doPost`

```
/* ---------- NOT ON AN ACCOUNT WHOSE ADDRESS NOBODY HAS PROVED --------------------------------
         THE PR #130 REVIEW'S TYPO, TWICE. Jo registers on jsmith1@ meaning jsmith@, signs in (no gate
         since 6 Oct) and makes Lu's account. Round one stopped the mail naming Lu's handle going to
         jsmith1@ — and its owner still pressed "Forgotten your PIN?" on the address, which must reach a
         PENDING address (it is how a squatted one is taken back), signed in as Jo and reset Lu's PIN.
         So the child waits, not the mail: the parent opens the link first. Asked after the role, so a
         student is still told the thing that is actually in their way. The phone draws the same
         sentence where the form would be (`childHeldCard_` in me.js), so this is for a stale phone. */
```

### ROUND ONE ASKED `addressPending_(me)` HERE, so the handle did not go to a typo's inbox.

in `doPost`

```
/* ROUND ONE ASKED `addressPending_(me)` HERE, so the handle did not go to a typo's inbox. A
         PENDING parent is refused above now and never reaches this line, so the address it mails is one
         somebody has proved; a second test of the same thing here would be a rule in two places. */
```

### ---------- A NEW PIN FOR SOMEBODY ELSE: THEIR PARENT, OR AN ADMIN

in `doPost`

```
/* ---------- A NEW PIN FOR SOMEBODY ELSE: THEIR PARENT, OR AN ADMIN -------------------------------
       A CHILD WITH NO ADDRESS WHO FORGOT THEIR PIN HAD NOBODY WHO COULD HELP IN THE APP. "Forgotten
       your PIN?" sends to an inbox, and a child with none and no linked parent has none; the admin
       reset inside `changePin` could never run (see there); so the one remedy was typing four digits
       into the sheet — which did not lift the lock either, because the wrong-PIN count lives in
       Script Properties where nobody can see it.

       WHO MAY: an admin, or a parent the child has ACCEPTED — the two people a child would go to.
       Not for an admin's row, and not your own (yours is Settings → Signing in, which asks for the
       old one). The target is an id, never a name: the gate has already made `body.personId` the
       asker, so `targetId` is the only thing on the request about whom.

       WHAT IT DOES is everything a new credential means here, in one place: a PIN drawn by
       `authFreshPin_`, the throttle cleared, any emailed PIN dropped, every session the child holds
       ended, a blank handle filled (a row typed into the sheet has none, and a PIN with no handle is
       still no way in). (It also confirmed an unconfirmed account, and no longer does — see below.)
       The PIN is returned ONCE, to be read out or written down, and is not kept anywhere but the
       cell. */
```

### ---------- A PARENT WHOSE OWN ADDRESS NOBODY HAS PROVED GIVES NOBODY A PIN

in `doPost`

```
/* ---------- A PARENT WHOSE OWN ADDRESS NOBODY HAS PROVED GIVES NOBODY A PIN -----------------------
         THIS IS THE STEP EVERY TAKEOVER THE PR #130 REVIEW FOUND ENDED ON: the stranger holding a
         PENDING parent row — registered on mum's address before mum, or owning the inbox a parent
         mistyped — reset the child's PIN and was handed it. `verifyEmail`, `claimChild`, `answerClaim`
         and `makeChild` now put no child on such a row, and this is the same rule at the last door,
         for the links made before they did. Asked after "is it yours", so a stranger asking about a
         child who is not theirs hears only that. An admin is the business vouching, and is not asked. */
```

### ---------- AND THE CHILD'S `verified` IS NOT TOUCHED

in `doPost`

```
/* ---------- AND THE CHILD'S `verified` IS NOT TOUCHED ------------------------------------------
         IT WAS SET TRUE HERE, "whoever is giving them a PIN is the grown-up vouching for them", and
         that was right while PENDING meant "may not sign in". It means "nobody has proved this address"
         now (`addressPending_`), and the grown-up giving a PIN has proved nothing about the child's own
         address, or about the one a no-email child TYPED for a grown-up — which `authGrownUps_` mails
         the child's PIN to the moment the child's row is not PENDING. A parent's New PIN would have
         laundered a typo'd grown-up's address into a proved one. The child signs in with this PIN
         either way. */
```

### ---------- YOUR OWN PIN, AND NOBODY ELSE'S

in `doPost`

```
/* ---------- YOUR OWN PIN, AND NOBODY ELSE'S ---------------------------------------------------
         AN "ADMIN RESETTING SOMEBODY ELSE'S" BRANCH STOOD HERE AND COULD NEVER RUN. It compared
         `body.adminName` with `body.name`, and the gate writes BOTH from the token before this line
         (`accessDenied`) — so `resetting` was always false, an admin's request naming a child was
         answered "That is not your current PIN", and an admin who typed their own current PIN changed
         their OWN. `forgotPin`'s comment sent people here for it. Giving somebody else a new PIN is
         `resetPin` now: its own action, with a target, for an admin or that child's parent. */
```

### ---------- CHANGING A PIN ENDS EVERY OTHER SESSION

in `doPost`

```
/* ---------- CHANGING A PIN ENDS EVERY OTHER SESSION -------------------------------------
         SOMEBODY CHANGING A PIN IS OFTEN SOMEBODY WHO THINKS SOMEONE ELSE HAS IT. Leaving old
         tokens working would mean the intruder stays signed in through the very act meant to
         remove them — the change would lock out only the person who made it. */
```

### ---------- AND THE PHONE THAT MADE THE CHANGE IS GIVEN A NEW SESSION

in `doPost`

```
/* ---------- AND THE PHONE THAT MADE THE CHANGE IS GIVEN A NEW SESSION -------------------------
         `authEndSession_` ENDS EVERY SESSION THE PERSON HOLDS, THE CALLER'S INCLUDED — so the note
         above ("every OTHER session") was a promise the code did not keep. Measured: the reply was
         `{success}`, the phone kept its dead token, and every Save after it on every card answered
         "Please sign in again." under a screen that still said you were signed in. A fresh session
         for the caller, and only the caller: minting one for SOMEBODY ELSE and handing it to whoever
         asked would be handing over their account. */
```

### ---------- `redeem` WAS HERE — A PRINTED PAPER FOR A THOUSAND TICKS

in `doPost`

```
/* ---------- `redeem` WAS HERE — A PRINTED PAPER FOR A THOUSAND TICKS -------------------------
       IT CANNOT BE EARNED ANY MORE. The price was `countTicks(me)`, which counted a person's handle
       across `ticks_1..3` on every document row, and those three columns were the one thing
       deliberately left out of `data/questions.json`: they held the handles of real children and
       this repository is public. Nothing writes a tick now and nothing reads one.

       SO IT GOES RATHER THAN RETURNING 0 FOR EVER. A reward priced at a thousand of something
       nobody can accumulate is not a reward, it is a sentence the student cannot act on — and this
       app has already paid once for exactly that shape, when `countTicks` read the person's row
       while `toggleTopicTick` wrote the document's and the total sat at 0 for everybody.

       `orderPosted` BELOW STAYS. It marks an order posted and notifies whoever asked, and orders
       are still a tab — a thing arriving in the post does not care what paid for it. */
```

### `bookings` RATHER THAN A KIND OF ITS OWN:

in `doPost`

```
/* `bookings` RATHER THAN A KIND OF ITS OWN: nothing writes an order any more, and a column for a
         mail that cannot be triggered is a switch nobody could ever see work. A parcel on its way is
         news about something already paid for, like a note on a session. */
```

### exams ------------------------------------------------------------------------------ A student's own dates.

in `doPost`

```
/* --- exams ------------------------------------------------------------------------------
       A student's own dates. `self`, so a student adds their own — and the handler checks the row
       belongs to the person asking, because an access level that nobody enforces is a comment. */
```

### ---------- THE TIMETABLE, KEPT ON THE ACCOUNT

in `doPost`

```
/* ---------- THE TIMETABLE, KEPT ON THE ACCOUNT ---------------------------------------------
       The docket's pattern — `savePerson` on the row the token resolved to, so a request naming
       somebody else still writes the asker's own cell. Two refusals before anything is written:
       it must be the widget's shape (a cell of anything else would be read back as an empty week
       and then saved over), and it must fit a cell — a spreadsheet cell holds 50,000 characters
       and a week of lessons is a few hundred. */
```

### ---------- WHICH EMAILS YOU WANT: ONE TICK ON THE NOTIFICATIONS CARD

in `doPost`

```
/* ---------- WHICH EMAILS YOU WANT: ONE TICK ON THE NOTIFICATIONS CARD ----------------------------------
       The owner, 9 Oct: *"Also let parents select their communication preferences like notification. And
       kids and tutors too I guess"*. One kind at a time (`NOTIFY_KINDS`), saved the moment it is ticked —
       `on: true` writes a BLANK, which is what every row already had and what `ON_` reads as yes, and
       `on: false` writes `no`, the word the owner was told to type into `weekly_email` by hand (280). So a
       switch on the phone and a cell typed in the sheet are one fact, and every sender reads it through
       `wants_` at the moment it sends.

       WHOSE ROW IS THE TOKEN'S. The gate has made `body.personId` the asker, so a request naming somebody
       else by name is still the asker's own row. `targetId` is the one way to another row, and it is
       `resetPin`'s rule word for word, because it is the same question — what a grown-up may decide for a
       child: an admin, or a parent the child has ACCEPTED (an `asked` link is a claim, not a family), the
       parent's own address proved (`confirmFirst_`), and never an admin's row. The phone does not offer it
       yet; the rule is here so the day it does, nobody has to decide it again.

       REFUSED, WITH NOTHING WRITTEN: a kind that is not in the table, an ESSENTIAL kind (its `why` is the
       sentence — a reset PIN cannot be switched off), a kind that does not reach that person's roles (a
       child turning off the weekly email about themselves would be a cell that means nothing), and a sheet
       without the column yet — `savePerson`'s sentence, because `ensureSchema` is what adds it. */
```

### `notifyHow_`, THE CARD'S OWN QUESTION, so the two cannot disagree.

in `doPost`

```
/* `notifyHow_`, THE CARD'S OWN QUESTION, so the two cannot disagree. This was `hasRole` against the
         kind's roles, which refused a `parent` cell everything and told an admin with a child that the
         weekly email "is not an email that reaches you" — on the Sunday it reached them (review, 9 Oct). */
```

### A PERSON'S REFERRAL CODE, and who has arrived through it.

in `doPost`

```
/* A PERSON'S REFERRAL CODE, and who has arrived through it.
       The count is the point. A code nobody used is a question about the offer, not about the
       code — and without `invited_by` being recorded, that question cannot be asked at all. */
```

### The second argument used to be the TAB OBJECT, handed to a function that expected an id.

in `doPost`

```
/* The second argument used to be the TAB OBJECT, handed to a function that expected an id.
         Harmless only because findPerson ignored it; now that it does not, it is the person's own
         id, which is what was meant all along. */
```

### A CHILD'S FROM THEIR FIRST NAME.

in `doPost`

```
/* A CHILD'S FROM THEIR FIRST NAME. Six letters of the whole name are the start of the surname
           whenever the first name is short — `IVYKIN` — and a referral code is made to be handed round
           (the owner, 10 Oct: *"dont show children's last name"*). A code already in the cell is kept:
           it may be on a flyer, and it is the sheet's. */
```

### a student changes their avatar ------------------------------------------------------- Every equipped item is re-checked here.

in `doPost`

```
/* --- a student changes their avatar -------------------------------------------------------
       Every equipped item is re-checked here. The site knows the catalogue because it has to draw
       the shapes, but knowing it is not the same as being trusted with it: an item you haven't
       earned is refused whatever the request says.
       Buying happens here too, in one step with the equipping — a credit is only spent when the
       item is actually put on, so a failed request can never leave someone poorer. --- */
```

### a person changes their own profile picture -------------------------------------------- ASKED FOR AS

in `doPost`

```
/* --- a person changes their own profile picture --------------------------------------------
       ASKED FOR AS *"everyone should have a profile picture selector widget in account settings"*.
       `photo` was a box you pasted a link into, so a picture on your phone could not become your
       face without first being uploaded somewhere else and shared — which nobody but an admin knew
       how to do. The phone crops it square and sends it here; this keeps it in Drive exactly as a
       post's photograph is kept (`driveKeep_`) and writes the address into `photo`.

       YOUR OWN ROW AND NOBODY ELSE'S. `self` in `ACTION_ACCESS`, so the gate has already written
       `body.name` and `body.personId` from the token — a request naming somebody else changes the
       asker's picture, never theirs, and one with no token never reaches this line.

       ONLY A PICTURE. A `data:` URL that is not `image/*` is refused by name rather than kept: this
       cell is drawn as an `<img>` on a public card, and a file of any other kind there is a broken
       square on every phone. A link is refused too — the picker never sends one, and the link box
       has gone from Settings, so accepting one here would be a second door to the same cell that
       nothing in the app uses. `remove` blanks the cell, which puts the initial back on the card.

       THE OLD FILE STAYS IN DRIVE. Deleting a file because a cell stopped naming it is how a picture
       somebody also used in a post goes missing from the feed; a folder with a few spare faces in it
       costs nothing anybody sees. */
```

### ---------- OR ONE OF THE ELEVEN, CHOSEN IN THE GRID UNDER THE TILES

in `doPost`

```
/* ---------- OR ONE OF THE ELEVEN, CHOSEN IN THE GRID UNDER THE TILES ------------------------
         THE OWNER, 10 Oct: *"everybody profile picture selector should have 10 basic profile pics
         like xbox dp selector, which allow you to use your avatar as a dp."* A tap in the grid posts
         `choice`, and the cell takes the token — nothing goes to Drive, because there is no file:
         the drawing is the phone's. `photoChoice_` (core.gs) is the only judge of what counts, so a
         `choice` that is not exactly one of `PFP_CHOICES` — a link, a tag, a near miss — is refused
         by name with the cell as it was. A PHONE FROM BEFORE THIS never sends `choice`, and a server
         from before it answers this request "That is not a picture" and writes nothing, which is the
         honest refusal the picker says until this file is pulled. */
```

### A CAP, IN DECODED BYTES, for a body the phone has already redrawn at 600px — about 60KB.

in `doPost`

```
/* A CAP, IN DECODED BYTES, for a body the phone has already redrawn at 600px — about 60KB. Five
         megabytes is a phone that skipped the crop, and a cell pointing at a 20MB face is a card that
         takes a minute to draw on a train. */
```

### a person says which of the three they are ------------------------------------------------- ASKED FOR AS

in `doPost`

```
/* --- a person says which of the three they are -------------------------------------------------
       ASKED FOR AS *"each account should have a widget in account settings which say what the roles
       are. they can be either a tutor or client or student. they can be tutor and client and student
       like multiselect."*

       ITS OWN ACTION, NOT A FIELD OF `updateProfile`. `role` is in `PROFILE_READONLY` and stays
       there: that list is "an admin may write the whole cell", and what a person may do to their
       own is a different, smaller thing — three words of it, under four rules a field allow-list
       cannot express:

         1. ONLY THE THREE. `admin`, or any other word, is refused by name. What the row already
            holds outside the three — `admin`, a `ROLE_TITLES` title — is carried through untouched.
         2. AT LEAST ONE. An empty cell reads as `client` (`rolesOf`), so "none" would save as
            something the person did not tick.
         3. A TICKED TUTOR WAITS. `listed` becomes `LISTED_PENDING` and the admin's own Listed switch
            is the yes. Not for an admin, who is the person saying yes.
         4. NOTHING IS DROPPED FROM UNDER A SESSION. Unticking Tutor or Client while `liveSeatsAs_`
            finds a seat in that role is refused, with the count — see there for what it would orphan.
       And one that is about children: A ROW THAT IS ONLY A STUDENT CANNOT MAKE ITSELF A CLIENT. Client
       is the parent's role — it pays, books, claims children and may message tutors — and a child's
       account ticking it would be a child messaging adults the business has not introduced. A Tutor
       tick is safe from the same row because it waits (rule 3) and `actingRole_` treats it as nothing
       until it is approved.

       YOUR OWN ROW AND NOBODY ELSE'S: `self`, so `body.personId` is the token's, whatever was posted.
       EVERY REFUSAL BEFORE ANY WRITE, the `updateProfile` rule: a refusal that had already written
       the role cell would be a role changed under a toast saying it was not. */
```

### `notify` RIDES WITH THE ROLES:

in `doPost`

```
/* `notify` RIDES WITH THE ROLES: which emails reach somebody is decided by what they are, so a parent
         who has just ticked Tutor has two more lines on the Notifications card, now rather than on the
         next app open (`notifyOf_`). */
```

### ---------- MARKING A WORDED ANSWER WITH GEMINI

in `doPost`

```
/* ---------- MARKING A WORDED ANSWER WITH GEMINI ---------------------------------------------------
       ASKED FOR AS "add gemini marking system for worded questions." `markAnswer_` on the phone marks
       anything with a number in it, and it cannot mark "explain why the rate increases" — 578 rows of
       the library are `explain` and 145 are `written`, and until now the only thing those boxes could
       do was wait for the tutor. So a worded answer is sent here with the question and the scheme
       the phone already holds, and Gemini says how many of the marks it earns and why, in a sentence.

       THE KEY IS A SCRIPT PROPERTY AND NOWHERE ELSE. This repository is public and its history is
       permanent — `check-secrets.js` fails the build on anything shaped like a Google key — and the
       config tab goes to every phone in the payload. `GEMINI_API_KEY` in Project Settings → Script
       Properties is the one place it can be read by this code and by nobody who opens the site.

       NO KEY IS A SENTENCE, NOT A FAULT. `why: 'ai-off'` is a code the phone reads to grey the
       button for the rest of the visit, so a reworded sentence cannot turn the greying off — the
       `signed-out` argument in `api()`. `aiMarking` in the payload says the same before anybody
       presses, and this is what still answers when a cached payload is behind.

       A CAP PER PERSON PER DAY, because every press is a request somebody pays for and `self` is all
       a sign-up costs. `ai_marks_per_day` on the config tab, 20 when the cell is blank, counted
       against `body.personId` — which the gate wrote from the TOKEN, never from a name, so renaming
       yourself is not a fresh twenty (`check-post.js`'s rule). Counted in Script Properties under a
       lock rather than in the cache, because the cache may drop a key whenever it likes and a cap
       that resets itself at random is not a cap.

       IT WRITES NOTHING TO THE SHEET. The verdict is advice on practice work, shown once on the
       phone; it is not a mark anybody records, and the reply says which model gave it -- the one that
       actually did, which since the 503 of 11 Oct may be the second (`aiGemini_`, docs/history/344).
       (The phone records the marks as a press of its own, `ai:N/M`, through `submitAnswer`.)

       A PRESS IS THE ONLY WAY IN (18 Oct). From 12 to 18 Oct a server pass in digest.gs asked the same
       marker with no press at all, overnight and before the Sunday email; the owner: *"The marking is
       already done on each question."* It is gone (docs/history/352), and the Sunday email prints the
       verdict each press recorded. */
```

### WHAT IS SENT IS CLAMPED HERE, NOT TRUSTED FROM THE PHONE.

in `doPost`

```
/* WHAT IS SENT IS CLAMPED HERE, NOT TRUSTED FROM THE PHONE. A question is a few hundred
         characters; a body of a megabyte is somebody using this as a free Gemini.
         THE ANSWER IS NOT CUT, IT IS REFUSED PAST ITS CEILING. It was `.slice(0, 2000)` -- about 350
         words -- and the owner's pupil wrote a forty-mark essay three times that long: Gemini read the
         first third, and the phone drew its mark as the essay's. A mark for part of an answer shown as a
         mark for the whole is worse than no mark, so past `AI_ANSWER_MAX` (constants.gs) the reply says
         so, before a mark is counted or Gemini is asked. The question and the scheme are context, and a
         long one is still cut -- to 8,000, sized for an English stem and a two-strand levelled scheme. */
```

### AN ESSAY (`ansEssay_` on the phone: `written` or `explain`, six marks or more, never Maths -- a page of "show that" working is not writing to be judged on

in `doPost`

```
/* AN ESSAY (`ansEssay_` on the phone: `written` or `explain`, six marks or more, never Maths -- a
         page of "show that" working is not writing to be judged on levels) IS MARKED ON THE SCHEME'S
         LEVELS, strand by strand, with two or three things to do next -- `aiMarkAsk_`. Anything but a
         real `true` is a short answer, marked as it always was. */
```

### A LOCK NOT HAD IS NOT A CAP REACHED.

in `doPost`

```
/* A LOCK NOT HAD IS NOT A CAP REACHED. Until the review of 12 Oct both came back as null, so a press
         made while something else held the script lock for more than this one's five seconds -- the lock
         every save, sync and migration on the site shares -- told the pupil "That is today's 20 AI marks
         used — they come back tomorrow" with marks left, sending them away for the day over a few
         seconds. It is busy, in the busy sentence, with the `why` every other lock-busy refusal in this
         file carries. */
```

### A PRESS THAT ENDS WITHOUT A MARK GIVES ITS COUNT BACK -- a 503, a refusal, a reply with no mark in it, or a throw on the way, which is why it is a `finally`

in `doPost`

```
/* A PRESS THAT ENDS WITHOUT A MARK GIVES ITS COUNT BACK -- a 503, a refusal, a reply with no mark
         in it, or a throw on the way, which is why it is a `finally` and not a line after the call. The
         cap counts marks GIVEN; on 11 Oct a pupil was told "Gemini said 503" and lost one of the day's
         twenty for it. Taken first and given back, never counted after: see `aiMarkCount_`.
         AND EVERY PRESS THAT GOT THIS FAR WRITES ONE TIMING LINE, marked or not, thrown or not (12 Oct,
         docs/history/350) -- after the give-back, so its lock is in the total too. */
```

### THE SAME FOUR FIELDS THE PHONE HAS ALWAYS READ, and an essay's breakdown beside them for anything that wants it as data rather than as the lines of `feedback`.

in `doPost`

```
/* THE SAME FOUR FIELDS THE PHONE HAS ALWAYS READ, and an essay's breakdown beside them for anything
         that wants it as data rather than as the lines of `feedback`. `left` is as of the take: a press of
         the same person's that fails while this one was with Gemini gives its count back afterwards, so
         `left` can be one low. Nothing on the phone reads it; anything that starts to should read it as
         "at least". */
```

### ---------- `toggleTopicTick` WAS HERE

in `doPost`

```
/* ---------- `toggleTopicTick` WAS HERE ------------------------------------------------------
       It put a person's handle into `ticks_1..3` on a document row and moved XP and credits by one.
       The columns are gone — stripped out of `data/questions.json` at source, because they held the
       handles of children and this repository is public — and the tab they were on is gone with
       them.

       IF TICKS COME BACK THEY COME BACK IN `Ledger`, one row per person per document, which is what
       they always were: a fact about a PERSON and a document, filed under neither. That is also the
       version that would have survived this move untouched. */
```

### ---------- `toggleVenueComfort` WAS HERE

in `doPost`

```
/* ---------- `toggleVenueComfort` WAS HERE -----------------------------------------------------
       It wrote whatever `body.handle` it was handed into a venue's `tutors_happy_here`, so a signed-in
       tutor could put ANYBODY on a venue — and nothing in the app ever called it. The Settings page
       writes that cell now, through `updateProfile` and `venuesWrites_`, for the signed-in person only:
       one writer, keyed on the row the token resolved to rather than a name in the request. */
```

### PAYMENT ------------------------------------------------------------------------------ Two halves, and they must stay apart.

in `doPost`

```
/* --- PAYMENT ------------------------------------------------------------------------------
       Two halves, and they must stay apart.

       createCheckout   builds a Stripe session and hands back a URL. It records NOTHING about the
                        job — a client who opens the payment page and closes the tab has not paid,
                        and the sheet must not think otherwise.
       finalizePayment  runs when Stripe sends the client back with ?paid=1&ref=…, checks the
                        session was actually paid by asking Stripe, and only then writes the
                        Confirm event that turns Paying into Booked.

       So money is the ONE thing on this site the client's own browser cannot assert. Everything
       else it says is taken at face value; this is verified against Stripe before it counts. --- */
```

### THE SAME GUARD `move` HAS, on the action that matters most.

in `doPost`

```
/* THE SAME GUARD `move` HAS, on the action that matters most.
         The site has always sent a requestId here; nothing read it. One id per user action, so a
         double tap, a retry or a flaky connection cannot open a second checkout for one booking. */
```

### ---------- CHARGE WHAT THE RECEIPT SAYS, NOT WHAT THE JOB SAYS

in `doPost`

```
/* ---------- CHARGE WHAT THE RECEIPT SAYS, NOT WHAT THE JOB SAYS -------------------------
         These are two different numbers and only one of them is a promise.

         `price_total` on the job is a cell. It can be edited afterwards — by an admin fixing
         something, by `move` carrying new terms, by a hand in the spreadsheet — and none of that
         is wrong; a job is a live thing. The RECEIPT is not: it is what the client was shown and
         agreed to, stored as whole pence at the moment of asking precisely so it cannot move.

         Charging from the job meant a price edited between asking and paying was charged silently
         against a document that said something else. Which is the one kind of billing mistake
         nobody forgives, and it would have looked like nothing at all from either end.

         Falls back to the job where there is no receipt — an older booking made before receipts
         existed should still be payable. */
```

### Recorded so the guard above can recognise a repeat — it reads the events tab, and a checkout that leaves no trace is a checkout that can be started twice.

in `doPost`

```
/* Recorded so the guard above can recognise a repeat — it reads the events tab, and a
           checkout that leaves no trace is a checkout that can be started twice.
           On SUCCESS only: one that never reached Stripe should be retryable, and refusing a retry
           after a failure would strand a client who wants to pay you. */
```

### MARKING A SESSION PAID, BY HAND ------------------------------------------------------- PEOPLE PAY IN CASH.

in `doPost`

```
/* --- MARKING A SESSION PAID, BY HAND -------------------------------------------------------
       PEOPLE PAY IN CASH. They hand over notes at the library, or send a bank transfer, or settle
       three sessions at once in a way no card flow will ever see — and until now the only thing
       that could move a booking to Booked was Stripe's return leg. So a family who had actually
       paid stayed on an accepted application for ever, and the receipt that proves what they paid
       for could never be issued.

       IT IS RECORDED AS WHAT IT IS. `finalizePayment` writes "payment confirmed by Stripe" because
       Stripe was asked and answered. This writes who marked it, and how they say it was paid — the
       one thing that must never happen here is money arriving by hand and being written down as
       though a processor had verified it. A year later the difference between those two is the
       difference between evidence and somebody's word, and only one of them can be checked.

       THE SAME EVENT EITHER WAY. `Confirm` is what `participantsOf` folds into Booked and there is
       no second route to it — one word for one fact, whoever wrote it, so nothing downstream has to
       know which way a session was paid for.
    ------------------------------------------------------------------------------------------- */
```

### ONLY WHAT HAS BEEN AGREED.

in `doPost`

```
/* ONLY WHAT HAS BEEN AGREED. Marking an unagreed booking paid would skip the step where both
         sides settle the terms — so the family is Booked onto a session whose price, day or venue
         nobody has accepted. The lobby exists to stop exactly that, and a shortcut past it is the
         shortcut that produces a dispute. */
```

### ---------- THE ADMIN MAY ANSWER ANY REQUEST

in `doPost`

```
/* ---------- THE ADMIN MAY ANSWER ANY REQUEST ----------------------------------------------
         SOMEBODY HAS TO SAY YES. A client asks for a session and the machine had no way for the
         business to answer: `move` refused anybody who was not already a participant, and the only
         thing an admin could do to a booking was `deleteJob`, which ends it for everyone. So every
         request sat at Waiting until a TUTOR happened to accept it — and on a job with no tutor
         yet, nothing could ever move it at all.

         AS THE BUSINESS, NOT AS A PARTICIPANT. The admin is not taking a seat and not teaching it;
         they are answering on behalf of @family., which is what an Accept from this side means.
         So the event is logged in their own name with `role: admin` — the log has to say who
         actually decided, and a decision recorded as somebody else's is worse than none.

         WHY IT IS SAFE TO SKIP THE LOBBY RULES BELOW. Those exist to stop a stranger joining a
         session or a second tutor taking one that is taken — questions about who may occupy a
         seat. An admin is not occupying anything, so none of them applies. What follows this is
         checked exactly as before for everybody else. */
```

### AND THE FAMILY WHOSE BOOKING IT IS HAS TO HAVE SAID YES.

in `doPost`

```
/* AND THE FAMILY WHOSE BOOKING IT IS HAS TO HAVE SAID YES.
             The seat count says there is ROOM; this says they are willing to share it with somebody
             they have not met. Those are different questions and only the second is consent.
             Checked here rather than only on the phone, because a button that is not drawn is not
             a rule — anybody can post this action, and the sheet is where the answer lives. */
```

### TAKING A SESSION AS ITS TUTOR NEEDS A TUTOR.

in `doPost`

```
/* TAKING A SESSION AS ITS TUTOR NEEDS A TUTOR. This asked nothing about who was posting:
             `role: 'tutor'` in the body was the whole qualification, so any signed-in parent could
             claim an open job. It mattered less while the role cell was the admin's alone; with a
             Tutor box in Settings it is the gate — held AND approved (`tutorPending_`), or admin. */
```

### AND BY THE NAME THE PHONE WAS SHOWN.

in `doPost`

```
/* AND BY THE NAME THE PHONE WAS SHOWN. A seat holds the whole name it was booked under, but a
         child's seat reaches every phone as their first name (`nameFor_`, the owner, 10 Oct) — so a
         tutor answering Wren's request names `Wren`, and the whole-name match finds nobody. The name as
         shown is asked second, and only when it picks out exactly one seat: two Wrens are told apart by
         their handles, which is what the shown name carries when two children share one. */
```

### AN ADMIN'S TARGET IS EVERYBODY WHO IS WAITING.

in `doPost`

```
/* AN ADMIN'S TARGET IS EVERYBODY WHO IS WAITING. They are answering the request rather than
         choosing between people, so with one client on the job that client is the target without
         anybody having to name them — and with several, the same rule as everyone else applies and
         a name is required. */
```

### THE LOBBY RULES ARE ABOUT THE TWO SIDES, and an admin is not one of them.

in `doPost`

```
/* THE LOBBY RULES ARE ABOUT THE TWO SIDES, and an admin is not one of them.
         `bmApply` judges what a mover may do from their OWN status — and an admin answering a
         request has no status on this job, so every move would be refused as "admin cannot Accept
         from (–, Waiting)". That is the machine correctly describing a person who is not playing.
         Answering is not a move in the lobby; it is the business saying yes. */
```

### WHO DECIDED, IN THEIR OWN NAME.

in `doPost`

```
/* WHO DECIDED, IN THEIR OWN NAME. An admin answering is logged as an admin — not as the
         tutor, not as the family. A year from now the only record of why a session went ahead is
         this line, and a decision recorded under somebody else's name is worse than no record. */
```

### AN ADMIN'S ACCEPT IS NOT LOGGED IN THEIR OWN NAME, and this is the one thing that has to be right about it.

in `doPost`

```
/* AN ADMIN'S ACCEPT IS NOT LOGGED IN THEIR OWN NAME, and this is the one thing that has to be
         right about it. `participantsOf` adds ANYBODY who acts on a job to the roster — that is how
         a tutor applying becomes a participant — so an Accept written as `actor: Halex Dias` puts
         the admin in the room as a client, on every job they ever answer. Folded and checked:
         "<client>=Agreed, GeorgePovey=Agreed, Halex Dias=Agreed", with the admin sitting in a seat on
         somebody's tutoring session.

         So the decision is recorded ON THE PARTICIPANTS' OWN EVENTS, in the `message` — "accepted
         by Halex Dias" — which is where a year-later reader is looking anyway, and it leaves the
         roster saying exactly who is in the session.

         A DECLINE IS DIFFERENT and may be logged as the admin: `participantsOf` returns early on a
         Decline and removes the target, so it never reaches the line that would add them. */
```

### AN ADMIN'S ACCEPT SETTLES THE WHOLE ROOM.

in `doPost`

```
/* AN ADMIN'S ACCEPT SETTLES THE WHOLE ROOM. `participantsOf` moves the ACTOR and whoever was
         targeted; an admin is not in the roster, so an Accept from them would otherwise move one
         person and leave the rest Waiting on a session that has been agreed.
         Written as an Accept per participant, each in their own name, so the fold produces exactly
         what it would have if they had each pressed it — and the log says who prompted it. */
```

### ---------- WHICH OF THESE SOMEBODY MAY TURN OFF, BY THE ACT

in `doPost`

```
/* ---------- WHICH OF THESE SOMEBODY MAY TURN OFF, BY THE ACT ---------------------------------------
         ACCEPT, DECLINE AND WITHDRAW DECIDE whether the session happens with this person in it — `booked`,
         essential. WITHDRAW is one the survey of 9 Oct had as optional, and it is not: a tutor leaving a
         family's session is the session losing its teacher, and a parent who had turned "booking
         updates" off would find that out at the door. EDIT, SAY, REQUEST AND PAY are the conversation
         around a session that is still going ahead — new terms, a note, a payment somebody else made —
         `bookings`, theirs to turn off: each is on the session's page whether or not it is emailed.
         Written in the call as a conditional of two literals, not a variable, so `check-prefs.js` can
         read both answers off the source. */
```

### ---------- `clientName` IS AN ADMIN'S TO GIVE, AND NOBODY ELSE'S

in `doPost`

```
/* ---------- `clientName` IS AN ADMIN'S TO GIVE, AND NOBODY ELSE'S ------------------------------
         IT IS THE NAME THE PHONE DREW, and since 10 Oct a child's phone draws its own name as the first
         name alone (`nameFor_` — the owner: *"dont show children's last name"*). Taken as written, a
         child booking for themselves would go into the events as `Wren` — a seat that answers to no row,
         and to every other Wren. `body.name` is the token's whole name (`accessDenied`), so anybody but an
         admin books as who they are; an admin booking for a family names that family, which is the one
         thing the field was for. It also closes a door: a signed-in parent could name somebody else. */
```

### THE ONE NUMBER THE PHONE MUST NOT CHOOSE, checked before anything is written.

in `doPost`

```
/* THE ONE NUMBER THE PHONE MUST NOT CHOOSE, checked before anything is written.
         Not recomputed — see `priceLooksWrong` for why a second copy of the formula would be worse
         than the problem — but a total that cannot pay for the room and the teaching is refused
         outright, because there is no honest way to arrive at one. */
```

### ---------- IF THE CLIENT IS PAYING THE TRAVEL, IT IS ADDED HERE AND NOWHERE ELSE

in `doPost`

```
/* ---------- IF THE CLIENT IS PAYING THE TRAVEL, IT IS ADDED HERE AND NOWHERE ELSE ----------
         The phone priced the session without knowing about travel, and it should not have to: the
         cost is per venue, it is yours to set, and a browser that computed it would be a second
         copy of a rule that lives on the sheet.

         SO THE SERVER ADDS IT, on the way in, before the price is written or the receipt drawn —
         which means the figure the client agrees to and the figure they are charged are the same
         number, and turning this on is one cell rather than a deploy. */
```

### ---------- HOW MANY TIMES SOMEBODY MAKES THE JOURNEY

in `doPost`

```
/* ---------- HOW MANY TIMES SOMEBODY MAKES THE JOURNEY ---------------------------------------
         DECLARED HERE, BECAUSE THE LINE BELOW USES IT. It was thirteen lines further down — after
         the travel cost, after the sanity check — so `travelCost(…, sessionCount)` reached a `const`
         that had not been initialised yet and threw `Cannot access 'sessionCount' before
         initialization`. Not a hoisting nicety: `const` in the temporal dead zone throws outright,
         so EVERY booking failed at the first line that priced it.

         The same expression the sanity check below builds for `weeks`, which is what it is — one
         trip per session, and at least one, because a booking with no dates yet is still a
         booking. */
```

### A TUTOR WHO TICKED THE BOX AND IS WAITING CANNOT BE BOOKED BY NAME.

in `doPost`

```
/* A TUTOR WHO TICKED THE BOX AND IS WAITING CANNOT BE BOOKED BY NAME. `doGet` never offers
         them, so only a hand-built request could name one — and that request is the whole of what
         stands between a tick in Settings and a family's session. Asked of the row the name finds;
         a name that finds nobody is left to behave as it always has. */
```

### AN ADMIN'S DISCOUNT, AND NOBODY ELSE'S — asked before anything is written, like the refusals above (`discountRefusal_`, booking.gs).

in `doPost`

```
/* AN ADMIN'S DISCOUNT, AND NOBODY ELSE'S — asked before anything is written, like the refusals above
         (`discountRefusal_`, booking.gs). `asker` is the token's own row, so the test is of who is signed
         in, never of a name the request carries. The code's row is found once and its `used` counted up
         only after the job is written: a refused booking must not spend a use. */
```

### NUMBERS, not strings of numbers.

in `doPost`

```
/* NUMBERS, not strings of numbers. `S()` stores "286" as text, and a spreadsheet holding
           text in a money column will not sum it, will not sort it, and shows it left-aligned —
           which is the only clue anybody gets. Everything that reads it already calls `N()`, so
           this changes no behaviour and makes the sheet itself correct. */
```

### ---------- WHAT IT EARNS, WHAT IT COSTS, AND WHAT IS LEFT

in `doPost`

```
/* ---------- WHAT IT EARNS, WHAT IT COSTS, AND WHAT IS LEFT --------------------------------
           `tutor_pay` was written as an empty string on every job ever created, so the books
           recorded what a session brought in and nothing about what it took to run — and
           `admin_profit` was a figure the browser sent rather than a subtraction, which makes it a
           number rather than a fact.

           THE TRAVEL IS READ FROM THE VENUE, never from the request. Per session, because a journey
           does not get longer when the lesson does; times the number of sessions, because each one
           is another trip. Online contributes nothing and needs no special case.

           AND IT IS STORED AS PAID, not as a rate. The figure on the venue can change next month;
           what this session actually cost cannot. */
```

### WHAT THE TUTOR EARNS, which `priceFrom` works out on the phone beside `profit` below and which was dropped here — `tutor_pay` was written as an empty string on

in `doPost`

```
/* WHAT THE TUTOR EARNS, which `priceFrom` works out on the phone beside `profit` below and
           which was dropped here — `tutor_pay` was written as an empty string on every job, so the
           tutor's own receipt had nothing to show them. Recorded as SENT, like `admin_profit`: it
           is the business's note of the split, never what anybody is charged — `createCheckout`
           charges from the receipt. Blank when an older phone sends nothing, never a nought. */
```

### THE SUBTRACTION, rather than whatever the phone worked out.

in `doPost`

```
/* THE SUBTRACTION, rather than whatever the phone worked out. The travel comes off the
           margin unless `travel_on_client` says the client is paying it — in which case it was
           added to the price and taking it off again would charge it twice. */
```

### A CHILD WHO IS ONLY WORDS IN THE BOOKER'S OWN `children` CELL GOES IN BY HER FIRST WORD, as `childNamesOf` offers her now (`kidsForJob_`) — a phone signed in

in `doPost`

```
/* A CHILD WHO IS ONLY WORDS IN THE BOOKER'S OWN `children` CELL GOES IN BY HER FIRST WORD, as
           `childNamesOf` offers her now (`kidsForJob_`) — a phone signed in before that, or a request
           built by hand, could still send the cell's whole words, and nothing on the people tab would
           know them on the way out to the tutor. Every other name as the phone sent it: a child with a
           row is the net's to say. */
```

### AN ADMIN BOOKING FOR A FAMILY.

in `doPost`

```
/* AN ADMIN BOOKING FOR A FAMILY. `me` has always been the CLIENT — `S(body.clientName) ||
           S(body.name)` resolves that way — so a booking made on somebody's behalf already lands
           on their row and logs the opening Request in their name. What was missing was the other
           half: who was actually signed in when it happened.
           Compared with `key` like every other name in this file, so punctuation cannot turn one
           person into two and write a `booked_by` on a booking somebody made themselves. */
```

### THE MONEY BLOCK, AS THE PHONE PRICED IT (docs/history/353) — blank from an older phone, never a nought, for `tutor_pay`'s reason.

in `doPost`

```
/* THE MONEY BLOCK, AS THE PHONE PRICED IT (docs/history/353) — blank from an older phone, never a
           nought, for `tutor_pay`'s reason. `priced_at` stays blank: the figures are frozen when the job
           is agreed (`jobMoneyFreeze_`), not when it is asked for. */
```

### ---------- NAMING A TUTOR CONFIRMS THE TUTOR, NOT THE BOOKING

in `doPost`

```
/* ---------- NAMING A TUTOR CONFIRMS THE TUTOR, NOT THE BOOKING ---------------------------
           THIS MARKED THE FAMILY AS HAVING AGREED TO A SESSION NOBODY HAD ACCEPTED YET. The second
           line logged an Accept whose ACTOR was the client — and `participantsOf` sets the actor of
           an Accept to `Agreed`, then sets the target to `Agreed` as well because an agreement is
           mutual. So both seats came out agreed the instant the form was submitted, `jobAccepted_`
           found every client and every tutor settled, and the card that should have said "asking"
           opened stamped ACCEPTED — WAITING FOR PAYMENT, with a Pay button, on a request that had
           never been read by anybody at @family.

           A FAMILY ASKING IS NOT A FAMILY AGREEING. The point of the original line stands: choosing
           a tutor by name is choosing them, and they should not have to be approved separately. But
           that is a fact about the TUTOR. Logged as the tutor's own acceptance, with no target, so
           it settles their seat and touches nobody else's — the family stays at `Waiting`, which is
           what they are, until the business accepts.

           WHICH IS WHAT `jobAccepted_` THEN READS CORRECTLY: tutor confirmed, client waiting,
           nothing accepted, no Pay button offered on money nobody has agreed to take. */
```

### ---------- AND THE NAMED TUTOR'S — `booked` TOO, WHICH THE SURVEY OF 9 OCT HAD AS OPTIONAL

in `doPost`

```
/* ---------- AND THE NAMED TUTOR'S — `booked` TOO, WHICH THE SURVEY OF 9 OCT HAD AS OPTIONAL ----------
         It reads like a request, and it is more than one: the lines above log the tutor's own ACCEPT
         ("chosen by the family at booking"), so by the time this is sent they are already on the session.
         It is "You're teaching X" from `move` in other words, and that one is essential — a tutor who had
         turned "booking updates" off would be booked without ever being told. */
```

### THE RECEIPT, WRITTEN AT THE MOMENT OF ASKING.

in `doPost`

```
/* THE RECEIPT, WRITTEN AT THE MOMENT OF ASKING. Not derived later from the job — a job can be
         edited, moved, repriced or cancelled, and the client's copy of what they asked for must
         survive all of that unchanged.
         `lines` is whatever the phone drew, stored verbatim, so reissuing is reading it back. */
```

### THE RECEIPT BELONGS TO THE FAMILY, NOT TO WHOEVER TYPED IT.

in `doPost`

```
/* THE RECEIPT BELONGS TO THE FAMILY, NOT TO WHOEVER TYPED IT.
         `personName` was already `me` — the client — and `personId` was `body.personId`, which is
         the SIGNED-IN person's id. On a booking anybody makes for themselves those are the same
         row and nothing shows. On one an admin makes they are two different people, and the
         receipt would carry the client's NAME against the admin's ID.
         `?receipts=` matches on either, so that one document would appear in both households: the
         family finds it by name and the admin finds it by id. A receipt is a record of what one
         household agreed to, and it can belong to exactly one of them. */
```

### ITS OWN LINE, or not at all.

in `lines`

```
/* ITS OWN LINE, or not at all. A travel fee folded into an hourly rate is the thing
             people find afterwards and mind about — and the receipt is the document that has to
             survive somebody reading it closely six months later. */
```

### A FAILED RECEIPT DOES NOT FAIL THE BOOKING.

in `doPost`

```
/* A FAILED RECEIPT DOES NOT FAIL THE BOOKING. Somebody who has asked for a session and been
         told the request failed, because the paperwork failed, has been told a lie about the
         important half. It is reported alongside the success so it is visible rather than silent. */
```

### JOINING A WAITLIST --------------------------------------------------------------------- A DIFFERENT PRODUCT IN THE SAME SHAPE.

in `doPost`

```
/* --- JOINING A WAITLIST ---------------------------------------------------------------------
       A DIFFERENT PRODUCT IN THE SAME SHAPE. It is a job — so `participantsOf` folds the roster,
       `move` runs the lobby, `deleteJob` ends it and the payment path is untouched — and every
       difference is a RULE APPLIED HERE rather than a second table:

         · one seat each, so a family joins once and cannot bring a second child
         · no tutor chosen, so `stealable` stays TRUE and nobody is picked at booking
         · Maths and English, fixed, because that is what the session is
         · a fixed price, computed in `waitlistPrice` from the venue and the seat count

       THE FIRST TO JOIN CREATES IT. A waitlist nobody has joined is a row saying nothing, so there
       is no separate "open a waitlist" step — joining an empty room and starting one are the same
       act, and making them two would leave empty lists lying about on venues.

       AND ONE PER VENUE. Two lists on one room is two sets of families waiting for the same four
       seats. Checked on the SERVER, because a button that is not drawn is not a rule. --- */
```

### ---------- OPENING A WAITING LIST WITH NOBODY ON IT

in `doPost`

```
/* ---------- OPENING A WAITING LIST WITH NOBODY ON IT --------------------------------------------
       `joinWaitlist` ALWAYS SEATS THE PERSON WHO CALLS IT. That is right for a family — you do not
       start a list you are not on — and wrong for an admin advertising one. Running a Back to School
       campaign means the list has to be there BEFORE anybody has joined, so the first family who
       arrives finds something to join rather than something to start.

       IT IS THE SAME ROW, MINUS THE SEAT. No REQUEST event and no receipt, so `participantsOf` folds
       an empty roster, `seatsGoing` is the full count, and the visibility rule in doGet — open, with
       seats going — shows it to everybody. Nothing new had to be taught to the front of the app.

       ADMIN ONLY, because an open list with nobody on it is a promise the business is making. */
```

### ---------- STARRING SOMETHING, AND UNSTARRING IT

in `doPost`

```
/* ---------- STARRING SOMETHING, AND UNSTARRING IT ----------------------------------------------
       ONE ACTION FOR BOTH, because they are the same gesture and splitting them means a card has to
       know which state it is in before it can ask — which is exactly the thing that goes wrong when
       two tabs are open. The row exists or it does not; this makes it match `on`. */
```

### ---------- THE SHOP WINDOW, AND WHY A ROW IS SWITCHED OFF RATHER THAN DELETED

in `doPost`

```
/* ---------- THE SHOP WINDOW, AND WHY A ROW IS SWITCHED OFF RATHER THAN DELETED --------------
       THIS HANDLER DID NOT EXIST. The tile was built, admin-gated twice, and posting since it was
       written — and `spotlight` was in no access list, so `accessDenied` refused it before any
       handler could be reached, and `doGet` sent no `DATA.spotlight` for `adoptSpotlight_` to read.
       Measured: zero occurrences of the word anywhere under `backend/`. Wired at both ends of the
       phone with nothing in the middle, which is `orderPrints` for the thirteenth time in this
       repository.

       ADMIN-GATED HERE AS WELL AS IN `ACTION_ACCESS`, the way `openWaitlist` is: the access list
       says who may reach the handler and this says what the handler will do, and a button is not a
       permission. The phone's own `if (!isAdmin()) return` in `toggleSpot` is a third, and it is
       the one that may be wrong — a phone can be lied to.

       SWITCHED OFF RATHER THAN DELETED, which is the opposite of `favourite` two blocks down.
       An unfavourite leaves nothing worth keeping. Taking something OUT of the shop window is a
       decision about what the business promotes, and `who` and `at` are who made it and when. It
       is also what makes the sheet the authority the moment it holds any row at all: with rows
       deleted, an admin who had cleared the window would fall through to the file's default list
       and the thing they removed would come straight back. See `spotNow_` in js/collections.js. */
```

### ---------- AN ANSWER SENT, KEPT AS AN EVENT

in `doPost`

```
/* ---------- AN ANSWER SENT, KEPT AS AN EVENT ------------------------------------------------------
       THE OWNER, 9 OCT: *"I just want system to record each submition. So like if they submit a correct
       answer then change it and submit an incorrect answer, that's 2 events. And it will leave the latest
       event up, so they would see incorrect answer there next time they login."* So every press that asks
       for a verdict is a row of SCHEMA.submissions, appended and never touched again; the latest of them
       is what every device shows (`submissionsFor_` in doget.gs). It replaced `markDone`, which kept one
       row per question with the first day, the last and a count — the owner's *"number of attempts"*.

       THE PERSON IS THE TOKEN'S. `accessDenied` has overwritten `body.personId` with whoever the token
       resolved to (`self`), so a request naming another child writes a row for the child who sent it.
       `check-submissions.js` sends exactly that.

       A RETRIED SEND IS ONE ROW. The phone names each press (`id`) and sends it again until it hears back;
       a row already holding that id is not written twice, and the reply carries it as saved, so the phone
       stops sending. Without the id a dropped reply would be the same press twice in a parent's week.

       UNDER THE SCRIPT LOCK, like `saveAnswers`: two sends of one press finding no row and both appending
       is the duplicate the id exists to stop. Refused rather than written unlocked — the phone keeps the
       press and sends it again (`subPush_` in js/submit.js).

       AND IT RETIRES NO PAYLOAD. A child's submissions are not in the stored body — `doGet` lays them on
       fresh for the token's person, hit or miss (`payloadWithFresh_`) — so the flag `addRow` raises is put
       back, and no visitor rebuilds thirty tabs because a child pressed Send. */
```

### WRITTEN, THEN FLUSHED, THEN SAID — the stamp `submissionsFor_` keys this child's copy by moves only once the rows are on the sheet for another request to read

in `doPost`

```
/* WRITTEN, THEN FLUSHED, THEN SAID — the stamp `submissionsFor_` keys this child's copy by moves
           only once the rows are on the sheet for another request to read, so a load that sees the new
           stamp reads the new rows (doget.gs). */
```

### ---------- WHAT THE CHILD WROTE, KEPT ON THEIR ACCOUNT

in `doPost`

```
/* ---------- WHAT THE CHILD WROTE, KEPT ON THEIR ACCOUNT -------------------------------------------
       *"i just relogged in as [the child] after having done the questions earlier and i dont see his
       answers there"* — and on the computer, *"it didnt have his answers already written in"*. The phone
       sends what changed (debounced, and at once on Check, on leaving a box and on the app going to the
       background — `answersPush_` in js/answers.js); this keeps one row per person per answer key in
       SCHEMA.answers, and `myAnswers` below hands them back on the next device.

       THE PERSON IS THE TOKEN'S, the `submitAnswer` rule: `accessDenied` has overwritten `body.personId`, so
       a request naming another child writes the sender's own row. No token, no row.

       THE LATER EDIT WINS, and the reply says which won. A phone that was offline for an hour and sends
       an older answer gets the newer one back instead of writing over it (`answersUpsert_`).

       UNDER THE SCRIPT LOCK, for `submitAnswer`'s reason: two devices finding no row and both appending is
       two rows for one answer. Refused rather than written unlocked — the phone keeps the key dirty and
       sends it again.

       AND IT RETIRES NO PAYLOAD. Answers are not in the payload at all — a child's work is theirs, and
       the payload is cached and shared by key — so the flag `addRow` and `setCells` raise is put back,
       as `submitAnswer` does, and no visitor rebuilds because a child drew. */
```

### ---------- AND READ BACK, BY THE PERSON WHO WROTE THEM AND NOBODY ELSE

in `doPost`

```
/* ---------- AND READ BACK, BY THE PERSON WHO WROTE THEM AND NOBODY ELSE ------------------------------
       `for` IS WHO THEY ARE FOR, which the phone checks before it fills a single box: a reply that lands
       after the iPad has been handed to the next child is about the last one. No parent, tutor or admin
       read — the owner can open the sheet, and if a view is ever wanted it is a separate `admin` action. */
```

### ---------- WHAT THE WEEKLY PARENT EMAIL WOULD SAY THIS WEEK

in `doPost`

```
/* ---------- WHAT THE WEEKLY PARENT EMAIL WOULD SAY THIS WEEK ---------------------------------------
       ASKED FOR AS THE INFRASTRUCTURE FOR *"something which triggers every sunday"* and emails parents
       the questions their child did — built, and switched off. This is the one door onto it from the
       phone, and it opens onto a READ: this week's plan and every email rendered, for the admin's card
       on the Settings column. It writes no row, sends no email and books no trigger, whatever
       `weekly_digest` says — those are the Sunday run's, in backend/digest.gs, and the owner's.
       `admin` in ACTION_ACCESS: the reply is every learner's week and every parent's address. */
```

### ---------- THE FILMS, FILLED FROM THE NOTFLIX FOLDER

in `doPost`

```
/* ---------- THE FILMS, FILLED FROM THE NOTFLIX FOLDER ------------------------------------------------
       *"Let admin be able to search up films which are in the notflix folder on gdrive."* The videos
       card posts this for an admin when the last whole pass is a day old, and its silver Sync from Drive
       tile posts it by hand. `filmsSync_` in content.gs is the whole of it; this is the door.

       ADMIN-GATED HERE AS WELL AS IN `ACTION_ACCESS`, `spotlight`'s rule: the table says who may reach
       the handler, and this says what it will do for whom. The reply is the films list — the one thing
       `doGet` refuses everybody but an admin — so it is asked twice.

       THE REPLY CARRIES THE LIST, so the card is current the moment the sync answers, rather than after
       a reload that would have to rebuild the payload. `filmsFor_` reads the tab the sync has just
       written, from this request's own copy of it. */
```

### ---------- THE COLUMN NAMES THE SHEET ACTUALLY USES

in `doPost`

```
/* ---------- THE COLUMN NAMES THE SHEET ACTUALLY USES -----------------------------------
           I WROTE `term`, `client` AND `note`, AND THE TAB HAS NONE OF THEM. It has `term_name` and
           `booked_by`, and no note column at all — so three values were dropped on every list
           opened, and `setup` said so in a warning nobody was reading at the time.

           `check-columns` reads what the backend WRITES against the schema and would have caught
           this — it did not, because `addRow` takes an object and the checker looks for literal
           column names near `setCell`. Worth knowing about that checker: it sees a field written
           one way and not the other. */
```

### `ACT.SAY`, NOT A NAME I MADE UP.

in `doPost`

```
/* `ACT.SAY`, NOT A NAME I MADE UP. The verbs are a closed set and `ACT.NOTE` is not one of
         them — an unknown action falls through `BM_EFFECT` and changes nobody's status, which
         happens to be what is wanted here and only by luck. `SAY` is the verb that means exactly
         that on purpose: a note in the log that moves no one. */
```

### ---------- FULL IS THE ROOM, AND SHUT IS THE CALENDAR

in `doPost`

```
/* ---------- FULL IS THE ROOM, AND SHUT IS THE CALENDAR --------------------------------
           A LIST THAT IS RUNNING IS NOT OFFERED HERE AT ALL — `openWaitlistAt` has already passed
           over it — so reaching this point with a full roster means four people are on it and none
           of them has been asked for money yet. */
```

### WHAT ONE SEAT COSTS, which is what every family on this list is charged.

in `doPost`

```
/* WHAT ONE SEAT COSTS, which is what every family on this list is charged. `price_total`
             holds the per-seat figure deliberately: `createCheckout` falls back to it PER PERSON
             when there is no receipt, and per-person is exactly right here — four families each
             buying one seat, not one family buying the room. */
```

### ---------- WHEN IT SHUTS, WORKED OUT RATHER THAN SENT

in `doPost`

```
/* ---------- WHEN IT SHUTS, WORKED OUT RATHER THAN SENT --------------------------------
             THIS READ `body.closesOn` AND NOTHING HAS EVER SENT IT. The column has been on every
             waitlist row since the column existed, blank every time, with a comment above it in
             `constants.gs` saying nothing enforces it yet — so a list that never filled sat open
             for good and the families on it were waiting on an answer that was never coming.

             THREE WEEKS BEFORE THE NEXT TERM STARTS. Counted here, once, at the moment the list is
             made, so it is a date sitting in a cell that you can read and change rather than a rule
             running invisibly somewhere. */
```

### WHEN THEY COULD COME, ON THEIR OWN JOINING EVENT.

in `doPost`

```
/* WHEN THEY COULD COME, ON THEIR OWN JOINING EVENT.
         NOT A COLUMN ON THE JOB, and that is the whole point: four families share one waitlist row
         and each has a different answer, so a column could only ever hold the last one written. The
         event is already per-person — it is what `participantsOf` folds the roster out of — so this
         is theirs by construction and needs no schema change.

         AND IT IS WHERE SOMEBODY WILL LOOK. The day this class runs on is chosen by reading what
         the four of them said, and `eventsForJob` already sends every event to the phone. */
```

### THEIR OWN RECEIPT, at their own seat price, written now for the same reason every other one is:

in `doPost`

```
/* THEIR OWN RECEIPT, at their own seat price, written now for the same reason every other one
         is: it is what they were shown and agreed to, and `createCheckout` charges from it rather
         than from a job cell that can move afterwards. */
```

### JOINING A FESTIVE EVENT ---------------------------------------------------------------- THE SAME SHAPE AS A WAITLIST, and for the same reason:

in `doPost`

```
/* --- JOINING A FESTIVE EVENT ----------------------------------------------------------------
       THE SAME SHAPE AS A WAITLIST, and for the same reason: it is a job, so the roster, the lobby,
       the payment path and the receipt all work untouched. What differs is where the price comes
       from — a waitlist seat is computed from the venue and the seat count, and this is a figure
       you typed on the holidays row, because a Christmas party is priced by judgement rather than
       by arithmetic.

       THE FIRST FAMILY CREATES IT. There is no separate "open the event" step: an event nobody has
       joined is a row saying nothing, and making them two acts leaves empty events lying about on
       every holiday you ever considered.

       `term_name` HOLDS THE HOLIDAY'S ID, which is the one borrowed column here. It is what joins a
       job back to the row that offered it, and `term_name` on a festive job would otherwise be
       empty — a term is a teaching block and this is an afternoon. Worth saying out loud because it
       is the kind of reuse that reads as a mistake later.
    ------------------------------------------------------------------------------------------- */
```

### THE OFFER AS THE CALENDAR SEES IT TODAY, not as the phone described it.

in `doPost`

```
/* THE OFFER AS THE CALENDAR SEES IT TODAY, not as the phone described it. A price or a
         capacity posted by a browser is a price the browser chose, and this one is a card that may
         have been sitting open in a tab since last week. */
```

### HOW MANY CHILDREN THEY ARE BRINGING, on their own joining event — the same place a waitlist keeps availability, and for the same reason:

in `doPost`

```
/* HOW MANY CHILDREN THEY ARE BRINGING, on their own joining event — the same place a
         waitlist keeps availability, and for the same reason: it is per family and the job is one
         row. A party needs a headcount and a family with three children is three chairs. */
```

### EACH NAME BY ITS FIRST WORD ON THE EVENT (342, the review) — every family on it reads the event, and a name typed here is very often a child who is no row the

in `doPost`

```
/* EACH NAME BY ITS FIRST WORD ON THE EVENT (342, the review) — every family on it reads the event,
         and a name typed here is very often a child who is no row the net knows (`typedFirstWords_`). The
         admin's email below keeps the words as typed: an admin sees everybody's whole name. */
```

### AN ADMIN LINKS A CHILD TO A PARENT ---------------------------------------------------- NOT `claimChild`, AND THE DIFFERENCE IS THE POINT.

in `doPost`

```
/* --- AN ADMIN LINKS A CHILD TO A PARENT ----------------------------------------------------
       NOT `claimChild`, AND THE DIFFERENCE IS THE POINT.

       `claimChild` is a PARENT saying "this is mine", and it writes `asked` — nothing is true until
       the child answers. That is the whole reason the family tab has a state instead of a name in
       a cell: a claim nobody agreed to is a claim, and a parent who could link a child unilaterally
       could attach themselves to somebody else's.

       This is not a parent. It is the person who runs the business recording a family they know,
       and it writes `accepted` straight away. That is the same act as typing it into the
       spreadsheet, which is what it replaces — and the reason it is admin-only and says who did it
       in the log.

       By ID or by name, because an admin doing this is looking at a list of names. --- */
```

### ---------- NOT ONTO AN ACCOUNT WHOSE ADDRESS NOBODY HAS PROVED, EVEN BY AN ADMIN

in `doPost`

```
/* ---------- NOT ONTO AN ACCOUNT WHOSE ADDRESS NOBODY HAS PROVED, EVEN BY AN ADMIN ---------------
         The admin vouches for the PERSON; the account is whoever proves its address — and since the PR
         #130 review the owner of an address can always take its account with "Forgotten your PIN?"
         (`authResetUse_`). So a child an admin put on a PENDING row on a mistyped address became the
         child of whoever owns the typo the moment they proved it, and `resetPin` handed them the PIN.
         The rule every parent-side door keeps (`confirmFirst_`), said to the admin: fix or confirm the
         address first. Unlinking is never held up. */
```

### REMOVED, not marked refused.

in `doPost`

```
/* REMOVED, not marked refused. `refused` is the CHILD's answer and means they were asked
           and said no — putting an admin's correction under the same word would make the tab lie
           about who decided. A link made in error should leave no trace of having been made. */
```

### AN ADMIN ENDS A SESSION --------------------------------------------------------------- DELETING A JOB IS WITHDRAWING EVERYONE FROM IT.

in `doPost`

```
/* --- AN ADMIN ENDS A SESSION ---------------------------------------------------------------
       DELETING A JOB IS WITHDRAWING EVERYONE FROM IT.

       That is not a trick to avoid writing a delete — it is what this system already means by a
       session being over. `participantsOf` folds the roster out of the events, `jobStatusOf` calls
       a job with no clients `cancelled`, and `doGet` does not send one. So a job everybody has left
       is already invisible everywhere, through the machinery that was built for it.

       Which means there is no `deleted` column to add. A second way for a job to be hidden is a
       second thing that can disagree with the first — a stale flag on a job with people still in
       it, or a job with nobody in it that a flag says is live. One rule, and it is the rule that
       was already there.

       THE ROW STAYS, AND SO DOES EVERY EVENT. What happened to a session — who asked, who agreed,
       who paid, who pulled out — is a thing you may be asked about months later, and it is exactly
       what a real delete would take away. The events tab is the record; this only ends the
       booking. --- */
```

### ---------- ONE MORE AI MARK FOR THIS PERSON TODAY, OR NULL

top level, before `aiMarkCount_`

```
/* ---------- ONE MORE AI MARK FOR THIS PERSON TODAY, OR NULL --------------------------------------------
   ONE PROPERTY FOR EVERYBODY, `{ day, n: { person_id: count } }`, and a new day empties it. One per
   person per day would be a property that is never deleted, and Script Properties has a ceiling.
   The day is London's, because "today" to a student here is not UTC's today.

   UNDER THE SCRIPT LOCK, because two presses a second apart both read 19, both write 20, and the cap
   is one wider than it says. If the lock cannot be had the mark is refused rather than uncounted —
   a cap that can be got round by pressing quickly is the cap the comment above says this is not.

   TAKEN BEFORE GEMINI IS ASKED AND GIVEN BACK IF NO MARK CAME (`aiMarkGiveBack_`), NOT COUNTED AFTER A
   MARK ARRIVES. Counting after would split the check from the count across the call: two presses at 19
   both read "one left", both are marked while Gemini thinks, both count, and the cap is 21. Closing that
   would mean holding the script lock across the call -- up to 20 s of retries (`AI_BUDGET_MS`) during
   which every saved answer on the site waits behind somebody's essay. Taken first, each lock is held for
   one property read and one write, a press in flight holds its place so a concurrent one at the cap is
   refused, and the worst a failure does is make a pupil at their nineteenth wait for the twentieth to
   be given back. The cap still means marks GIVEN, which since 11 Oct is all it counts.
   Returns `{ used, day }` -- the day so the give-back finds the tally it was taken from -- null at the
   cap, and `{ busy: true }` when the lock could not be had, which the caller must not read as either. */
```

### THE ONE TAKEN, BACK -- but only into the day it was taken from.

top level, before `aiMarkGiveBack_`

```
/* THE ONE TAKEN, BACK -- but only into the day it was taken from. A press at 23:59:50 that fails at
   00:00:05 was taken from a tally that midnight has already emptied, and taking one off the new day
   would hand that pupil twenty-one. A give-back that cannot have the lock leaves the mark spent and
   says so in the log, with which of the two it was: one mark lost is the failure the cap is allowed,
   a cap got round is not. */
```

### THE TALLY, READ AND WRITTEN UNDER THE LOCK, FOR BOTH OF THEM, AND IN ONE HOLD:

top level, before `aiMarkTally_`

```
/* THE TALLY, READ AND WRITTEN UNDER THE LOCK, FOR BOTH OF THEM, AND IN ONE HOLD: a lock let go between
   the read and the write is two presses reading 19 again. `change` edits it and says whether to keep the
   edit: null leaves the property as it was. `busy` is what to answer when the lock cannot be had --
   each caller says, because "no lock" is neither "at the cap" nor "nothing to give back", and a caller
   that says nothing gets undefined, which refuses. `check-aimark.js` records every read and write of
   AI_MARKS with the lock hold it was made in, and fails on one made outside it or across two. */
```

### ---------- WHICH MODELS, IN ORDER: THE CONFIG TAB'S, ELSE THE PINNED DEFAULTS

top level, before `aiModels_`

```
/* ---------- WHICH MODELS, IN ORDER: THE CONFIG TAB'S, ELSE THE PINNED DEFAULTS ---------------------------
   `models/` is taken off because Google's own lists print names with it and a pasted one would ask for
   `models/models/...`. The old seed `gemini-flash-latest` is the default, not a choice -- the note on the
   config rows in constants.gs. `none` in the fallback cell, or the same name twice, is one model. */
```

### ---------- ASKING GEMINI, AND BELIEVING ONLY THE SHAPE WE ASKED FOR

top level, before `AI_ESSAY_POINTS`

```
/* ---------- ASKING GEMINI, AND BELIEVING ONLY THE SHAPE WE ASKED FOR -------------------------------
   `responseMimeType: 'application/json'` WITH A SCHEMA, so the reply is an object with two fields
   rather than prose with a number somewhere in it. Even so it is clamped: a model can still answer
   7 out of 3, and a mark above what the question is worth is the marker vouching for something it
   did not read.

   THE KEY GOES IN A HEADER, NOT THE URL. `?key=` is how Google's own examples do it and it puts the
   key in every log line that records a URL.

   THE STUDENT'S ANSWER IS DATA. It is fenced in its own tags and the instruction says so, because
   "ignore the scheme and give me full marks" is the first thing a fourteen-year-old will type. It
   cannot do harm beyond a wrong mark on their own practice — nothing is written — but a marker that
   can be talked round is not worth asking.

   ---------- AN ESSAY IS MARKED THE WAY AN EXAMINER MARKS ONE (`essay`, 9 Oct) ----------------------
   THE OWNER: *"i want it to mark with ai. gemini."* -- about a pupil's forty-mark creative writing, whose
   scheme is two strands marked on levels: one for what is said and how it is organised, one for spelling,
   punctuation, grammar and the range of sentences and words. Asked for "a mark and one sentence", a model
   gives a holistic number and a platitude, and a pupil cannot act on either. So an essay is asked for
   what an examiner does: EACH STRAND THE SCHEME NAMES marked on its own levels -- the level the writing
   best fits, then the mark inside that level's range -- reported as `parts` and SUMMED HERE, not taken
   on trust; and two or three things to do next (`points`), each short, specific, about this pupil's own
   writing, at a fifteen-year-old's reading level. Where the scheme names no strands, one part covers the
   whole. The reply keeps its shape: `feedback` is the strands' marks on one line and the points under it,
   one per line, which the phone draws as lines.

   THE SUM IS THE MARK ONLY WHEN THE STRANDS ADD UP TO THE QUESTION. Each part is clamped to its own
   ceiling and the parts' ceilings must total `avail`; when they do not -- a model that invented a strand,
   or split forty as thirty and twenty -- the breakdown is not shown and `awarded` (clamped, as ever) is
   the mark. A breakdown that does not add up is the marker contradicting itself on the screen.

   NO `maxOutputTokens`, DELIBERATELY. The reply is a few hundred tokens because the schema makes it so,
   and a model that thinks before it answers spends its thinking from the same allowance: a cap low enough
   to matter is low enough to end the reply mid-JSON, which arrives as "Gemini did not give a mark". The
   input is under 40,000 characters (`AI_ANSWER_MAX` and its two neighbours), about 10,000 tokens -- a
   small fraction of what the model reads. And the wait: `UrlFetchApp` gives up at about a minute and a
   web app's run at six; a whole essay is answered in seconds to tens of seconds, and the phone's request
   has no timeout of its own (`api` in shell.js), so a slow mark is a slow mark and not a failure.

   THE ASKING ITSELF IS `aiGemini_`, below: the same request to each model in `models` in turn, asked
   again while Google is full (11 Oct). This function builds the request once and believes the reply. */
```

### NO `temperature`, `topP` OR `topK`.

in `sent`

```
/* NO `temperature`, `topP` OR `topK`. Google stopped honouring them with 3.6 Flash and 3.5 Flash-Lite
       and says later models will answer 400 to them -- and a 400 is neither asked again nor handed to the
       fallback, so `temperature: 0`, which did nothing on either pinned model, would one day have stopped
       marking (the review of 11 Oct). The schema and the system instruction are what keep a mark steady. */
```

### WHICH MODEL MARKED IT, on every answer -- `aiMarkEssay_`'s too -- so the reply's `model` is the one that did the marking

in `aiMarkAsk_`

```
/* WHICH MODEL MARKED IT, on every answer -- `aiMarkEssay_`'s too -- so the reply's `model` is the one
     that did the marking (Google's `modelVersion`, `aiServed_`), not the one the config tab asked for first.
     AND HOW THE ASKING WENT, for the timing line (`aiMarkTimed_`), a mark or not. */
```

### ---------- HOW HARD EACH MODEL THINKS, FOR THIS KIND OF ANSWER (12 Oct)

top level, before `aiThinking_`

```
/* ---------- HOW HARD EACH MODEL THINKS, FOR THIS KIND OF ANSWER (12 Oct) -------------------------------
   THE OWNER: *"ok the ai marking works but it takes so long. like 30 seconds or whatever"* -- the note over
   `AI_MODEL` in constants.gs says why the level is the lever and why each default is what it is. Returns
   `{ cell, level: { model: 'low', ... } }` for `aiGemini_`: a model with no entry is sent no level at all.
     the cell blank         AI_THINKING_SHORT or AI_THINKING_ESSAY, but only for a model AI_THINKING_LEVELS
                            names -- another model's levels are not known here, so it is asked as before
     a level typed          that level, for every model
     `none`                 no level for any model: each one's own default, the request before 12 Oct
     anything else typed    read as blank, and logged, because a typo must not be a 400 on every press
   and for a model AI_THINKING_LEVELS names, a level it does not offer becomes the next one up that it
   does, so `minimal` typed in the short cell is `low` on 3.8 Flash rather than a refusal. A numbered
   version of a named model (`gemini-3.8-flash-001`) offers what its name does. Read from `config()`, which
   the request has already read (`read` keeps a tab for the request), so the signature of `aiMarkAsk_`, and
   every caller of it, is as it was. */
```

### NO MARK IS NOT A MARK OF NOUGHT.

in `aiMarkEssay_`

```
/* NO MARK IS NOT A MARK OF NOUGHT. With strands that do not add up the model's own total is the mark,
     and a reply with none -- missing, blank, or words -- was `clamp`ed to 0 and drawn as "0 of 40 marks
     · AI" (the review of 9 Oct, `aiMarkEssay_` run in node). Only a reply that breaks `responseSchema`
     can do it, and when one does "try again" is the truth and nought is a verdict nobody gave. */
```

### ---------- ASKING GEMINI, AND ASKING AGAIN WHILE IT IS FULL

top level, before `aiGemini_`

```
/* ---------- ASKING GEMINI, AND ASKING AGAIN WHILE IT IS FULL ------------------------------------------
   THE OWNER, 11 Oct: *"Ai marking is not working right now Gemini said 503."* This was one
   `UrlFetchApp.fetch`, and its first 503 was the pupil's answer. The schedule and why each number is
   what it is are the note over `AI_MODEL` in constants.gs; here they are in the order they happen:

     each model in `models` -- the config tab's, then its fallback (`aiModels_`) --
       not asked at all if a 429 from an earlier press said its quota is spent and another model is
                                 behind it -- the next model, at once (`aiSpentUntil_`, 12 Oct)
       up to AI_TRIES asks, AI_WAITS apart, each wait moved by up to AI_JITTER either way, each sent
                                 the thinking level `thinking` names for that model, if any (12 Oct)
       200                       the answer, and the model Google says gave it (`aiServed_`)
       429, any 5xx, a throw     asked again; after the model's last try, the next model, at once
       a 429 that says "later"   not asked again -- its RetryInfo is past the next ask, or its quota is a
                                 DAY's -- the next model; and remembered for later presses (`aiSpend_`)
       404                       not asked again -- a retired or misspelt name will not come back --
                                 but the next model at once, which is a different name
       400 to a level sent       asked once more AT ONCE without the level -- not one of AI_TRIES -- and
                                 the cell to change logged when that marks (12 Oct)
       anything else             stop: the key, the request or the account, which no second ask mends
     and no ask at all started once AI_BUDGET_MS has gone since the first, and no model with another
     behind it asked AGAIN once AI_HANDOFF_MS has, so the other still gets its turn -- the re-ask without
     a level included, so a level refused past the handoff hands the press to the next model instead

   WHEN A CLOCK RUNS OUT THE MODEL'S TURN ENDS, NOT THE PRESS. The first build `return`ed there: a
   retry whose wait would cross 20 s gave up on the press, though the fallback's first ask has no wait
   and could still start (the review of 11 Oct, with Gemini taking 9 s a refusal: asked twice, the
   fallback never). Now it is a `break`, and the next model's first ask decides for itself.

   GOOGLE'S OWN MESSAGE IS NOT PASSED ON, AND SINCE THE REVIEW OF 11 OCT NEITHER IS ITS NUMBER. A 400 for
   a bad key says so in a sentence meant for the owner, and the person reading this is a student; "Gemini
   said 503" read to a pupil as broken rather than busy, and "Gemini said 404" about a fallback they never
   asked for is not theirs to act on at all. `aiGaveUp_` says one of three sentences, none with a digit,
   and the log keeps the rest -- every refused ask with its code, its model and which try it was, and a
   model that cannot be used named with the config cell to change.

   `thinking` IS OPTIONAL AND LAST, so a caller that passes three arguments asks exactly as before 12 Oct:
   no level for any model. It is `aiThinking_`'s `{ cell, level: { model: 'low' } }`; `payload` itself
   should carry no `thinkingConfig`, because the level is put in here per model and taken out here for a
   model that refuses it. EVERY ANSWER CARRIES `asks` -- each ask's model, level, code, start and length,
   each wait, each model passed over -- for the timing line (`aiMarkTimed_`), and nothing else reads it. */
```

### A QUOTA AN EARLIER PRESS WAS TOLD IS SPENT IS NOT ASKED AGAIN WHILE IT IS -- unless this is the last model, which is always asked:

in `aiGemini_`

```
/* A QUOTA AN EARLIER PRESS WAS TOLD IS SPENT IS NOT ASKED AGAIN WHILE IT IS -- unless this is the last
       model, which is always asked: passing it over would be giving up without asking anybody. Counted as
       the 429 it was, so a fallback that then fails is "busy", which it is. */
```

### A DAY'S QUOTA DOES NOT COME BACK IN TWO SECONDS, whatever RetryInfo says -- "1s" has been seen on one (third-party) -- so it holds this model for the rest of

in `aiGemini_`

```
/* A DAY'S QUOTA DOES NOT COME BACK IN TWO SECONDS, whatever RetryInfo says -- "1s" has been seen on
             one (third-party) -- so it holds this model for the rest of the press; and either kind that
             says "later" is remembered for the presses after this one, until then. */
```

### THE REQUEST WITH ONE MODEL'S THINKING LEVEL IN IT, `generationConfig.thinkingConfig.thinkingLevel` as Google's REST examples send it -- and never

top level, before `aiLevel_`

```
/* THE REQUEST WITH ONE MODEL'S THINKING LEVEL IN IT, `generationConfig.thinkingConfig.thinkingLevel` as
   Google's REST examples send it -- and never `thinkingBudget` beside it, which is a 400 (constants.gs). A
   copy: the next model, and the re-ask without a level, are sent the request as it was given. */
```

### GOOGLE'S SIDE, AND SO WORTH ASKING AGAIN:

top level, before `aiAgain_`

```
/* GOOGLE'S SIDE, AND SO WORTH ASKING AGAIN: 429 and any 5xx. 502 and 504 were the owner's in the first
   build -- asked once, no fallback, "Gemini said 504" to the pupil -- though a 504 is Google's deadline
   (the faster fallback may meet it) and a 502 a gateway passing (the review of 11 Oct). */
```

### WHEN A 429 SAYS THE MODEL IS BACK, in ms -- 0 when it does not say.

top level, before `aiRetryDelay_`

```
/* WHEN A 429 SAYS THE MODEL IS BACK, in ms -- 0 when it does not say. A Gemini API 429 is that model's
   quota, a minute's or a day's, and carries `google.rpc.RetryInfo` with `retryDelay` as "39s"; asked
   again 0.8 s later it is only refused again. Some 429s carry nothing (a spike in shared capacity), and
   those are asked again on the schedule like a 503. */
```

### WHETHER A 429 IS A DAY'S QUOTA SPENT (12 Oct):

top level, before `aiQuotaDay_`

```
/* WHETHER A 429 IS A DAY'S QUOTA SPENT (12 Oct): its `google.rpc.QuotaFailure` names a quota id with
   `PerDay` or `Daily` in it -- `GenerateRequestsPerDayPerProjectPerModel-FreeTier` on a free key -- the
   test Google's own gemini-cli makes before calling a 429 terminal. A minute's quota, or a 429 with no
   QuotaFailure at all, is not; those are believed by their RetryInfo, as before. */
```

### ---------- A MODEL'S QUOTA, SPENT, REMEMBERED BETWEEN PRESSES (12 Oct)

top level, before `aiSpend_`

```
/* ---------- A MODEL'S QUOTA, SPENT, REMEMBERED BETWEEN PRESSES (12 Oct) ---------------------------------
   IN THE SCRIPT CACHE, NOT SCRIPT PROPERTIES: the quota is the project's, so one entry per model serves
   every pupil, and forgetting it costs exactly one refusal -- which is what the cache may do whenever it
   likes, and what it does after AI_SPENT_MAX_S, its own ceiling. `until` is kept IN the value as well as
   given as the expiry, so an entry is believed only while the clock says so. Under a second is not kept:
   the cache keeps nothing for less. Nothing here can throw into a press. */
```

### THE NEXT MIDNIGHT IN AI_QUOTA_TZ, when Google resets a day's requests, in ms since 1970.

top level, before `aiPacificMidnight_`

```
/* THE NEXT MIDNIGHT IN AI_QUOTA_TZ, when Google resets a day's requests, in ms since 1970. The time of day
   there is asked of `Utilities.formatDate` and today's midnight worked back from it; on the two days a year
   the clocks change it is an hour out either way, which costs one refusal or an hour of the fallback. A
   clock that cannot be read is six hours from now, the cache's own ceiling. */
```

### ---------- ONE LINE PER PRESS: WHERE ITS TIME WENT (12 Oct)

top level, before `aiMarkTimed_`

```
/* ---------- ONE LINE PER PRESS: WHERE ITS TIME WENT (12 Oct) ---------------------------------------------
   THE OWNER: *"ok the ai marking works but it takes so long. like 30 seconds or whatever"* -- and nothing
   logged a press that worked, so where the thirty seconds went could only be guessed (docs/history/350).
   Now every press that reaches the take writes one line to Executions in the Apps Script editor:
     aiMark: timing -- short answer, 4120 ms in all; 690 ms before the first ask (the take 15 ms);
       gemini-3.8-flash at low 429 in 402 ms, gemini-3.5-flash-lite at minimal 200 in 2210 ms;
       marked by gemini-3.5-flash-lite
   "In all" is from the start of `doPost` to the end of the asking and any give-back; Apps Script's own
   start and the phone's network are outside it, and Executions' own duration is the request's whole.
   NO LEARNER DATA: no answer, question, scheme, name or id -- the models, levels, codes and times, and,
   for a press with no mark, which of the pupil's fixed sentences it ended on. Never throws: it runs in the
   `finally` that gives a mark back. */
```

### THE MODEL THAT ANSWERED, from the response's `modelVersion`, else the name asked for.

top level, before `aiServed_`

```
/* THE MODEL THAT ANSWERED, from the response's `modelVersion`, else the name asked for. Google now
   retires a name by routing it to a newer model (8 Oct: 3.7 Flash to 3.8 Flash) and the 200 says nothing
   else, so a pinned name that has quietly become another model shows here and in the log. A numbered
   version of the same name (`gemini-3.8-flash-001`) is the same model and is not logged; a longer name
   that merely starts with it (`gemini-3.8-flash-lite`) is another model, and is. */
```

### WHAT THE PUPIL IS TOLD WHEN THE ASKING RUNS OUT -- by how every model asked ended, not by the last one.

top level, before `aiGaveUp_`

```
/* WHAT THE PUPIL IS TOLD WHEN THE ASKING RUNS OUT -- by how every model asked ended, not by the last one.
   Busy if anything was merely busy (the first model full and the fallback broken is busy: the first will
   be back); "could not reach" if nothing answered at all; "not working" only when every model asked
   refused for a reason that is the owner's. The owner's half goes to the log, loudly, with the cell. */
```

### AND A `why` BESIDE THE SENTENCE, for a caller that branches on it — written for the Sunday marking pass of 12 Oct (gone since 18 Oct, docs/history/352), kept

in `aiGaveUp_`

```
/* AND A `why` BESIDE THE SENTENCE, for a caller that branches on it — written for the Sunday marking pass
     of 12 Oct (gone since 18 Oct, docs/history/352), kept because reading which failure it was by the
     wording would break the day the sentence is reworded. */
```

### ---------- THE REPLY A SIGNED-IN PERSON GETS

top level, before `profileOf_`

```
/* ---------- THE REPLY A SIGNED-IN PERSON GETS ------------------------------------------------------
   ONE COPY, TWO DOORS. A PIN and a Google account are two ways of proving the same thing, and what
   comes back afterwards is not a property of how you knocked. Written out twice, the second copy
   would be missing a field within a month — this reply has lost `todo`, `photo`, `avatar` and
   `avatarItems` one at a time already, each for weeks, each because it was assembled somewhere
   that did not know about them. */
```

### EVERY BOX ON THE SETTINGS FORM OPENED EMPTY, AND SAVING ONE EMPTIED THE SHEET TO MATCH.

top level, before `profileOf_`

```
/* ==================================================================================================
   EVERY BOX ON THE SETTINGS FORM OPENED EMPTY, AND SAVING ONE EMPTIED THE SHEET TO MATCH.

   `settingsPages_` fills its fields from `USER.profile` and NOTHING HAS EVER SENT ONE to the person
   themselves. `getProfile` built one — for an ADMIN, looking at somebody else — and this reply, the
   one a person gets about their own row, did not. So every group on the Settings column drew a card
   of blank boxes on a fresh sign-in, whatever was actually in the sheet.

   AND A BLANK BOX IS NOT THE ABSENCE OF AN ANSWER TO `me-save`. It gathers every `[data-me]` in the
   card, empty ones included, and `updateProfile` writes what it is given — so opening Settings,
   pressing Save on "About you" and changing nothing wrote `''` over the headline, the photograph,
   the years of experience and all three adjectives. The one screen for editing your own details
   was the one screen that could erase them, on the first press, with a toast saying "Saved".

   `profileOf_` IS THE ONE BUILDER AND BOTH CALLERS USE IT. This was `getProfile`'s own block,
   lifted out — an admin's view of somebody and that somebody's view of themselves are the same
   object, and writing it twice is the second reader this repository records under `documents_()`,
   `factsNow_` and `childrenOf`. `availSet` is called once here rather than once per hour code,
   which it was.

   IT IS NOT A DISCLOSURE. This reply is answered only after `authCheckPin_` has passed, and it
   carries the row of the person who just proved they are it — which is strictly less than
   `getProfile` has handed an admin since it was written. */
```

### ---------- AND THE DATE OF BIRTH, WHICH WAS BEING SENT AS A JAVASCRIPT DATE STRING

in `profileOf_`

```
/* ---------- AND THE DATE OF BIRTH, WHICH WAS BEING SENT AS A JAVASCRIPT DATE STRING ------------
     `S(r.date_of_birth)` IS `String(v).trim()`, AND SHEETS STORES A DATE AS A REAL DATE. So a
     birthday typed into the spreadsheet came back into the box as
     `Sun Sep 15 1985 00:00:00 GMT+0100 (British Summer Time)` — rendered and verified — on a field
     somebody is expected to read and edit. Every other date leaving this file goes through
     `fmtDate`; this one did not, which is the `S(c.said_on)` fault one tab along.
     Repaired by the three boxes rather than beside them: `dobOut` reads the cell through
     `sheetDate`, so a real Date and a `dd/mm/yyyy` string both come apart into three numbers. */
```

### ---------- AND AN EXAM DATE AS `yyyy-mm-dd`, WHICH IS WHAT THE PICKER CAN HOLD

in `out.f`

```
/* ---------- AND AN EXAM DATE AS `yyyy-mm-dd`, WHICH IS WHAT THE PICKER CAN HOLD ------
              `S(r[f])` IS THE `S(r.date_of_birth)` FAULT ONE COLUMN ALONG, and worse: a birthday
              sent as `Sun Sep 15 1985 …` at least DREW, wrongly, in a text box. A date input
              silently rejects any value that is not ISO — so a real Date, or a `dd/mm/yyyy` string
              typed into the spreadsheet, would open an EMPTY picker over a cell that has a date in
              it, and the next save would write the empty over it. */
```

### THE THREE BOXES ARE SENT AS WELL AS THE CELL.

in `profileOf_`

```
/* THE THREE BOXES ARE SENT AS WELL AS THE CELL. They are not columns, so the loop above cannot
     produce them — and the form reads them by name. The cell itself stays because `fieldsHtml`
     dispatches on the group's field list, which still names `date_of_birth`. */
```

### A NEW ADDRESS WAITING TO BE PROVED (`authMove*_`), or blank.

in `profileOf_`

```
/* A NEW ADDRESS WAITING TO BE PROVED (`authMove*_`), or blank. Not a column: `email` stays the address
     the row has, and the Contact box draws this one in its place so the next Save of that page posts it
     again rather than the old one — which would read as "keep the old one" (`updateProfile`). */
```

### WHICH EMAILS REACH THIS PERSON AND WHICH THEY HAVE TURNED OFF — `notifyOf_` in people.gs, the Notifications card's whole list.

in `profileOf_`

```
/* WHICH EMAILS REACH THIS PERSON AND WHICH THEY HAVE TURNED OFF — `notifyOf_` in people.gs, the
     Notifications card's whole list. Not a column, so the loop above cannot produce it, and an object,
     so a Save posting the form's fields back never posts it. */
```

### ---------- THE NAMES OF SOMEBODY'S OWN FAMILY, FOR THE SIGN-IN REPLY AND FOR `myProfile`

top level, before `familyNamesOf_`

```
/* ---------- THE NAMES OF SOMEBODY'S OWN FAMILY, FOR THE SIGN-IN REPLY AND FOR `myProfile` -----------------
   `kids` and `children` fill the booking form's "Which of your children?"; `parents`, `siblings` and
   `claims` the cards that name them. Every one through `nameFor_`, so a child is their first name here
   as everywhere (the owner, 10 Oct: *"dont show children's last name"*). A FUNCTION, because `myProfile`
   sends them too: a phone signed in before this kept the old whole names in `familyUser` for the thirty
   days a session lasts, and the first open after the deploy now puts the first names over them. */
```

### `childNamesOf`, NOT `childrenOf` — see the note on it.

in `familyNamesOf_`

```
/* `childNamesOf`, NOT `childrenOf` — see the note on it. This said `childrenOf(r)`, which after
     the duplicate declaration was resolved by the second one meant "find children whose parent_id
     equals this row object", so it has always been `[]`. The booking form reads
     `USER.children || USER.kids`, and `out.children` above is set correctly from the accepted
     links, which is why nothing looked broken: the fallback carried it and the primary was dead. */
```

### THE REPLY IS FOR THE PERSON SIGNING IN (342):

in `loginReplyFor_`

```
/* THE REPLY IS FOR THE PERSON SIGNING IN (342): their own whole name stays in it if they are a
     grown-up, and everybody else's is as anybody else's phone has it. Every door in ends here, and the
     request carried no token to say so. */
```

### `nameFor_`, EVEN FOR THEMSELVES — a child is called by their first name on their own screen too (the owner, 10 Oct: *"dont show children's last name"*), and it

in `loginReplyFor_`

```
/* `nameFor_`, EVEN FOR THEMSELVES — a child is called by their first name on their own screen too
     (the owner, 10 Oct: *"dont show children's last name"*), and it is the same string the net puts
     on their seat and their posts, so the phone's "is this mine?" still matches. Their surname comes
     in `profile.last_name`, for the Settings box that edits it, and nowhere else. */
```

### BOTH of them. `saveTodo` has been writing the docket to this column since it was built and the login reply only ever sent the notepad back — so every line

in `out`

```
/* BOTH of them. `saveTodo` has been writing the docket to this column since it
                   was built and the login reply only ever sent the notepad back — so every
                   line anybody added was saved correctly, survived in the sheet, and was gone
                   from the app the next time they signed in. Written under one name and read
                   under another, which is the fault this whole file keeps producing; the only
                   reason it is here rather than in the list of seven is that nothing was
                   comparing the two sides until now. */
```

### THE PHOTOGRAPH. Neither field was in this reply, so the You screen has been falling back to a letter in a circle for everybody since the rewrite — it reads

in `out`

```
/* THE PHOTOGRAPH. Neither field was in this reply, so the You screen has been
                   falling back to a letter in a circle for everybody since the rewrite — it
                   reads `USER.photo`, and nothing was sending one.
                   They are DIFFERENT THINGS and both are needed: `photo` is a picture of the
                   person, `avatar` is the wearable string — "hair:crop|legs:jeans" — which is
                   a figure to be drawn and is a broken image in any <img> that gets it. */
```

### AND WHAT THEY MAY WEAR.

in `out`

```
/* AND WHAT THEY MAY WEAR. `getProfile` has always sent this and the login
                   reply never did — so the wardrobe on somebody's own screen had to guess
                   their unlocks from the shop rows, while an admin looking at them got the
                   real answer. One of those is authoritative and it was not the one the
                   person themselves was shown. */
```

### `ticks:` WAS HERE, counted off the document rows.

in `out`

```
/* `ticks:` WAS HERE, counted off the document rows. There are no document rows
                   and no tick columns — see `toggleTopicTick` below. The You screen no longer
                   draws the row, rather than drawing a 0 that would read as "you have done
                   nothing" instead of as "this is gone". */
```

### Their family, as agreed by both sides, and anything still waiting on them.

in `loginReplyFor_`

```
/* Their family, as agreed by both sides, and anything still waiting on them. Sent with the
     person rather than fetched separately — it is three names, and a second round trip for
     three names costs more than carrying them. `familyNamesOf_`, which `myProfile` sends too. */
```

### ---------- `out.profile = {}` WAS HERE, AND IT THREW AWAY `profileOf_` TEN LINES AFTER USING IT

in `loginReplyFor_`

```
/* ---------- `out.profile = {}` WAS HERE, AND IT THREW AWAY `profileOf_` TEN LINES AFTER USING IT ---
     The object literal above sets `profile: profileOf_(r)` — every packed cell expanded into the
     boxes the form draws. This block, older than that line, then REPLACED it with `S(r[f])` for each
     name in the role's groups: so the qualification shelf past row three, every tick and received
     year, all nine library boxes, the phone's two boxes, the birthday's three and both exam pickers
     came back EMPTY or as a raw `Date` string on every sign-in. The form drew blanks over a sheet
     that had values, and the next Save on those pages wrote the blanks back — reported as "some
     things arent updating when i click save". `location` went with it: nothing on the phone reads
     `profile.location`. */
```

### ---------- AND WHAT THE PAYLOAD WOULD HAVE BROUGHT FIFTEEN SECONDS LATER

in `loginReplyFor_`

```
/* ---------- AND WHAT THE PAYLOAD WOULD HAVE BROUGHT FIFTEEN SECONDS LATER ---------------------------
     *"the logging in and everything feels so janky and unresponsive and slow"*. Measured on a shared
     iPad: "Signed in" at 2.5 s, then the person's own marks, stars and family only when their own
     `doGet` landed — 15 to 35 s later, as a freeze, often under a child already typing. They are four
     small reads of rows that are this person's and nobody else's, so they come with the sign-in, in
     exactly the shapes `doGet` sends (`submissionsFor_`, `favouritesOf_`, `familyOf_`), and the phone
     lays them over `DATA` behind the same `for` checks the payload's copies pass (`signedIn_` in me.js).
     THE SUBMISSIONS ARE WHAT A CHILD SEES ON EVERY CARD SINCE 9 OCT — the latest verdict, and the box
     opening on the latest answer sent — so on a shared iPad they have to be there with "Signed in".

     AND THE ANSWERS, so the boxes on the screen fill with "Signed in" rather than a round trip later
     (`answersFor_`). Each read is its own `try`: a tab that is missing or a read that fails costs that
     one key, never the sign-in. */
```

### ---------- ONE ROW PER PRESS, APPENDED

top level, before `submissionsAppend_`

```
/* ---------- ONE ROW PER PRESS, APPENDED -------------------------------------------------------------------
   `items` is `[{ id, key, label, words, answer, verdict, at }]` — see SCHEMA.submissions. Returns
   `{ saved: { <id>: { key, verdict, at } }, wrote }` for every press now on the sheet, written by this request
   or by an earlier send of the same press, or `{ error }` before anything is written. `at` is the row's
   `pressed_at` in ms — the moment the child pressed, by the phone's clock and never later than this
   server's — which is what the phone, and every load after it, orders the press by.

   WHAT IS REFUSED, and left out of `saved` so the phone can tell it will never be taken: an id not in
   the phone's shape (`SUBMISSION_ID`), a key that is empty or longer than any library key, a verdict
   outside `SUBMISSION_VERDICT`, and an answer that is empty or over `ANSWER_TEXT_MAX` — refused whole,
   never cut: half an answer is not the answer the verdict is about.

   A RETRIED PRESS WRITES NOTHING. Its id is already on one of this person's rows, and the reply says so
   with that row's own time — so a send whose reply was lost, sent again a minute later, is one row
   with one time. Two items with one id in the same request are one row too: the first one written is
   in `seen` before the second is read.

   ---------- AND THE TAB IS NOT READ WHOLE TO FIND THAT OUT (review of 9 Oct) ---------------------------
   It was `read(TAB.submissions)` — every column of every row anyone has ever sent, a question's words
   on each — under the site's only script lock, to answer "is this id already here". That read grows by
   a row a press, and once it nears the 5 s `tryLock` the other writes wait on, they answer "Busy". So
   only `person_id` and `event_id` are read (`readCols_`, two single columns), and the whole of a row
   only for an id found there — a retry, which is rare and is one row.

   THE PRESS'S OWN TIME (`at`, `pressed_at`), CLAMPED TO NOW — `answersUpsert_`'s rule: an iPad whose clock
   runs a day fast would otherwise be the latest at everything for a day. A missing or nonsense `at` is
   now, which is what a phone from before the column sends.

   ---------- AND THE DEVICE'S CLOCK ERROR TAKEN OUT FIRST (`sent`, review of 10 Oct) ---------------------------
   THE CLAMP HELD ONE SIDE. A FAST clock was held to now; a SLOW one went through as it was. Measured through
   the real `submitAnswer` and the phone's own `subAdopt_`: the computer sent "15" (right) an hour ago; an iPad
   two hours slow showed 15, the child changed it to 16 and pressed Check — stored two hours ago, so older
   than the computer's, the account's latest was "15", and the iPad's next load wrote 15 back over its own
   box. The reverse of the owner's example, and a child setting the clock back for a game is all it takes.
   The phone sends its own clock as it sends (`sent`, `subBody_` in js/submit.js); this server's clock now,
   less that, is the device's error — plus the request's time on the wire, a few seconds at most, which
   only ever moves a press later and never past now — and every press in the request is moved by it before
   the clamp. A phone that sends no `sent` is held as before. The reply carries the corrected time, so the
   phone keeps the order the server keeps.

   THE NAME AND THE WORDS GO IN BY THE RULES THE PARENT EMAIL HAS ALWAYS READ THEM BY — `attemptLabel_`
   and `attemptWords_`, tags out and capped — and only where the live tab has the column, so a tab made
   by hand without them still takes the answer and its verdict (`addRow` would otherwise answer "Nothing
   was saved for: submissions.words" over a row it had in fact written). */
```

### ---------- ONE ROW PER PERSON PER ANSWER, THE LATER EDIT WINNING

top level, before `answerAtMs_`

```
/* ---------- ONE ROW PER PERSON PER ANSWER, THE LATER EDIT WINNING ------------------------------------------
   `items` is `[{ key, v, at }]` — the phone's answer key with the person taken out (`ans:q:<row>`,
   `pad:q:<row>`, …), the value as text, and the moment the child made the edit in ms. Returns
   `{ saved: { <key>: { v, at } } }` with the WINNER for every key it accepted — the value it wrote, or
   the newer one already there — or `{ error }` before anything is written. See SCHEMA.answers.

   WHAT IS REFUSED, and left out of `saved` so the phone can tell: a key that is not an answer's (only
   `ans:` and `pad:`, 120 characters at most — anything else is not a box this site drew), and a value
   over its ceiling (`ANSWER_TEXT_MAX`, `ANSWER_PAD_MAX`). Never cut: half a drawing is not a drawing.

   THE PHONE'S CLOCK, NEVER AHEAD OF THE SERVER'S. An iPad whose clock runs a day fast would otherwise
   win every argument for a day. A missing or nonsense `at` is now.

   WHICH CELLS MOVE:
     · no row                         → a row                                       (one append)
     · a later edit                   → value, edited_at, saved_at                  (one write)
     · the same edit again            → nothing — a retried request writes nothing
     · an older edit                  → nothing, and the reply carries the newer one back

   THE VALUE GOES IN AS TEXT, ALWAYS — a leading apostrophe whatever it holds, because `cellSafe_` only
   protects a formula and `3/4`, `2,4` and `0.50` are not formulas. The apostrophe is the sheet's own
   "this is text" and is not part of what comes back. */
```

### EVERY ANSWER ONE PERSON HAS ON THE SHEET, `{ <key>: { v, at } }` — for `myAnswers` and the sign-in reply.

top level, before `answersFor_`

```
/* EVERY ANSWER ONE PERSON HAS ON THE SHEET, `{ <key>: { v, at } }` — for `myAnswers` and the sign-in reply.
   A key on two rows (only possible by hand) is the later edit. No tab is no answers: a backend synced
   before `ensureSchema` ran must still sign people in. */
```

### A QUESTION'S NAME AS A PARENT WILL READ IT, FROM WHATEVER THE PHONE SENT.

top level, before `attemptLabel_`

```
/* A QUESTION'S NAME AS A PARENT WILL READ IT, FROM WHATEVER THE PHONE SENT. It came off a phone and
   goes into an email, so: no tags (the HTML email escapes it as well — this is the cell, which a
   person also reads), one space where there were several, and `ATTEMPT_LABEL_MAX` at most. Blank
   is a real answer — the email falls back to the key. `cellSafe_` deals with a leading `=`. */
```

### A QUESTION'S WORDS AS A PARENT WILL READ THEM, FROM WHATEVER THE PHONE SENT.

top level, before `attemptWords_`

```
/* A QUESTION'S WORDS AS A PARENT WILL READ THEM, FROM WHATEVER THE PHONE SENT. NOT `attemptLabel_`:
   its `<[^>]*>?` reads the inequality in "Solve x > 3 and x < 7" as a tag and keeps "Solve x 3 and x",
   and 125 questions in the library have a bare `<` or `>`. So only a REAL tag comes out — a letter or a
   slash after the `<` — line breaks are kept (the stem and the ask are separate lines), runs of spaces
   become one, and `ATTEMPT_WORDS_MAX` at most. `cellSafe_` deals with a leading `=` when it is written. */
```

### CUT FIRST, AND A TAG IS `<…>` WITH NO `<` INSIDE IT.

in `attemptWords_`

```
/* CUT FIRST, AND A TAG IS `<…>` WITH NO `<` INSIDE IT. `[^>]*` after `<a` re-scanned the rest of the
     string for every `<a` with no `>` after it — measured at 18 s for 160 KB of them, under the script
     lock that every other `submitAnswer` waits on. */
```

