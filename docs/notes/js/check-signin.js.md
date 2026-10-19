# js/check-signin.js

The full text of comments in `js/check-signin.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-signin.js — EVERY WAY A CHILD GETS IN, THROUGH THE REAL BACKEND

top level, before `fs`

```
/* ==================================================================================================
   node js/check-signin.js — EVERY WAY A CHILD GETS IN, THROUGH THE REAL BACKEND

   ASKED FOR AS *"audit the registration process and so on so all kids can login easily with their
   handle and pin."* Three audits read the sign-up and sign-in code and walked it through the real
   `doPost`, and between them found a child with no email who could not get an account at all, a PIN
   that starts with 0 refused for ever, "Forgotten your PIN?" wiping the PIN of whoever's handle was
   typed into it, and an admin reset that could never run. Every one of those passed every check in
   the suite, because no check asked the question from the child's side.

   THIS ASKS IT FROM THE CHILD'S SIDE, END TO END: a child with no email registered by a parent, the
   same child registering themselves with a grown-up's address, a child typed into the sheet by hand,
   each signing in by handle and PIN and getting a new PIN when they forget it — and the ways a
   classmate who knows their public handle could get in their way.

   NOT A SECOND IMPLEMENTATION. `check-gas-load.js` loads every `.gs` file into one scope over an
   in-memory Ledger whose `setValue` parses a string the way a real sheet does — including dropping
   the 0 off the front of a string of digits, which is the half of this a stub would have hidden.
   Mail is caught, not sent: `MAIL` below records every message, and `MAIL_FAIL` / `QUOTA` make the
   mail service refuse, so "the PIN changed and nobody was sent it" is something this can see.

   THE PINS ARE BUILT, NOT WRITTEN. `check-secrets.js` refuses four digits beside the word, so every
   PIN here but the `0000` placeholder is assembled from its digits. The people are invented and
   their addresses are on example.org.
================================================================================================== */
```

### 2. A PARENT MAKES THEIR CHILD'S ACCOUNT — no email, signed in by handle at once

top level, before `b`

```
/* ==================================================================================================
   2. A PARENT MAKES THEIR CHILD'S ACCOUNT — no email, signed in by handle at once
   ================================================================================================== */
```

### 3. A CHILD WITH NO EMAIL MAKES THEIR OWN ACCOUNT, WITH A GROWN-UP'S ADDRESS

top level, before `b`

```
/* ==================================================================================================
   3. A CHILD WITH NO EMAIL MAKES THEIR OWN ACCOUNT, WITH A GROWN-UP'S ADDRESS
   ================================================================================================== */
```

### 4. "FORGOTTEN YOUR PIN?"

top level, before `b`

```
/* ==================================================================================================
   4. "FORGOTTEN YOUR PIN?" — sent beside the old one, honest, and not a way to lock a child out
   ================================================================================================== */
```

### 5. A CLASSMATE WITH YOUR HANDLE — the lock, the way out of it, and who is told

top level, before `b`

```
/* ==================================================================================================
   5. A CLASSMATE WITH YOUR HANDLE — the lock, the way out of it, and who is told
   ================================================================================================== */
```

### 6. A NEW PIN FROM A PARENT OR AN ADMIN, AND A ROW TYPED INTO THE SHEET

top level, before `b`

```
/* ==================================================================================================
   6. A NEW PIN FROM A PARENT OR AN ADMIN, AND A ROW TYPED INTO THE SHEET
   ================================================================================================== */
```

### 7. WHAT THE PAYLOAD SAYS ABOUT A HANDLE, AND WHAT IT NO LONGER SENDS

top level, before `b`

```
/* ==================================================================================================
   7. WHAT THE PAYLOAD SAYS ABOUT A HANDLE, AND WHAT IT NO LONGER SENDS
   ================================================================================================== */
```

### 8. WHO THE ACCOUNT IS FOR — a parent signs up as a parent, a student as a student, and a student still cannot make themself one THE WALK AFTER 273 FOUND IT:

top level, before `whoRules`

```
/* ==================================================================================================
   8. WHO THE ACCOUNT IS FOR — a parent signs up as a parent, a student as a student, and a student
      still cannot make themself one
   --------------------------------------------------------------------------------------------------
   THE WALK AFTER 273 FOUND IT: a parent who signed up on the phone was written `student`, so Settings
   never offered "Make your child's account" and ticking Client was refused by the rule that stops a
   child promoting themself. The form now asks, and `register` writes the role it was told — and the
   rule stays. Each half is asked of the SHEET afterwards, and then of the next thing the person does.
   ================================================================================================== */
```

### AND THE REFUSAL DOES NOT SEND THEM TO A TICK THEY WERE JUST REFUSED.

top level, before `before`

```
/* AND THE REFUSAL DOES NOT SEND THEM TO A TICK THEY WERE JUST REFUSED. It said "Tick Parent
         under Your roles" — a word the card does not have, and a tick `setMyRoles` turns a student
         down for two lines above. A student is told who can change it. */
```

### ---------- THE STALE ROLE: the owner changes it in the sheet, the phone asks `myProfile`

top level, before `before`

```
/* ---------- THE STALE ROLE: the owner changes it in the sheet, the phone asks `myProfile` --------
         The walk changed a role in the sheet and the card stayed missing until a sign-out. The phone
         asks `myProfile` once per app open; it has to carry the role the sheet holds NOW. */
```

### A TUTOR MAY TICK CLIENT, SO A TUTOR IS TOLD THE TICK — by the word the card prints.

top level, before `LABELS`

```
/* A TUTOR MAY TICK CLIENT, SO A TUTOR IS TOLD THE TICK — by the word the card prints. The card's
     labels are read from `ROLE_PICKS` in js/me.js, so a refusal and the card cannot drift apart
     again: "Parent" was the drift, and nothing could see it. */
```

### 9. AN ADDRESS NOBODY HAS PROVED — it signs in, it holds no child, and its owner can always take it THE OWNER, 6 Oct:

top level, before `proofRules`

```
/* ==================================================================================================
   9. AN ADDRESS NOBODY HAS PROVED — it signs in, it holds no child, and its owner can always take it
   --------------------------------------------------------------------------------------------------
   THE OWNER, 6 Oct: *"dont make them have to need to verify their email to login"*, and that stays —
   every PENDING row below signs in. What the PR #130 review found is what the sign-in refusal had been
   hiding: a PIN on a self-made row proves who REGISTERED, not who owns the address. Round one held the
   mail back and ended the squatter's sessions while the row was PENDING; the review of round one found
   the squatter back in by their own PIN after Google, still in after the owner had opened the link and
   then used an emailed PIN, and a typo'd address's owner still taking the parent's child. So this is the
   design now, and each part is asked here through the real backend:
   (a) A CHILD IS TIED TO AN ACCOUNT ONLY THROUGH A CONFIRMED ADDRESS — `makeChild`, `claimChild`, a
       child's yes in `answerClaim`, a grown-up's link in `verifyEmail`, a parent's `resetPin` and an
       admin's `linkChild` each refuse while the parent is PENDING, and the parent's own doors work once
       the address is confirmed;
   (b) THE ADDRESS'S OWNER CAN ALWAYS TAKE IT BACK — the emailed PIN used ends every other session,
       PENDING or not; Google on a PENDING row ends them AND takes the registrant's PIN; opening your own
       link signs nobody out;
   (c) NOTHING BUT THE LINK AND THE FORGOTTEN-PIN PIN IS MAILED TO AN UNPROVED ADDRESS — `notify`, the
       guesses warning and a child's forgotten PIN skip a PENDING parent and a PENDING child's typed
       grown-up; an account's OWN pending address still gets its forgotten PIN;
   (d) "SEND THE LINK AGAIN" mails only the row's own pending address, a fresh link, once a quarter hour.
   ROUND THREE OF THE REVIEW found each of those stepped round by a door none of them watched, so:
   (e) A NEW ADDRESS TYPED IN SETTINGS is proved by the ACCOUNT before it is trusted — it waits beside a
       confirmed row and only that account, signed in, can open its link; a PENDING row's corrected
       address gets a fresh link and the old one (and any PIN mailed to the old address) dies;
   (f) WHEN AN ADDRESS'S OWNER TAKES A PENDING ROW BACK, the children the registrant put on it — links
       from before (a) — are `held`, and only an admin settles them; opening your own link holds none;
   (g) A SQUATTER TYPING WRONG PINS CANNOT KEEP THE OWNER OUT — the mail to an account's own address
       carries a sign-in link no miss can use up.
   ================================================================================================== */
```

### ONE MILLISECOND APART.

top level, before `register`

```
/* ONE MILLISECOND APART. `register` names a row 'P' + Date.now(), so two sign-ups inside one
     millisecond — which this harness does and a phone never would — are ONE PERSON to every session and
     every family link: the stranger's `resetPin` on the child was refused as "your own PIN", which
     passed the rule for the wrong reason, and only on a fast run. Measured on the unfixed backend. */
```

### ---------- (a) A CHILD WAITS ON THE PARENT'S ADDRESS BEING PROVED

top level, before `b`

```
/* ---------- (a) A CHILD WAITS ON THE PARENT'S ADDRESS BEING PROVED ------------------------------------
     Jo's address is a typo, jsmith1@ for jsmith@. Seeded PENDING with a token, as `register` leaves it.
     Ned is a child put on Jo by hand before this rule existed (an accepted link to a PENDING row — the
     shape round one's `verifyEmail` and main's both wrote); Pia has an unanswered claim from Jo. */
```

### THE ROUTE ROUND ONE LEFT OPEN:

top level, before `who`

```
/* THE ROUTE ROUND ONE LEFT OPEN: the owner opens the confirmation link FIRST. The row goes TRUE with
       the squatter still signed in (opening a link signs nobody out — that is right), and THEN she uses
       "Forgotten your PIN?". The emailed PIN must end their session whatever state the row is in now. */
```

### A PIN MAILED BEFORE GOOGLE PROVED THE ADDRESS — the squatter pressing "Forgotten your PIN?"

top level, before `m0`

```
/* A PIN MAILED BEFORE GOOGLE PROVED THE ADDRESS — the squatter pressing "Forgotten your PIN?" is
         enough to put one there — goes with the registrant's PIN: the reply names Google and a FRESH one
         as the only ways in, and `googleLogin` drops it (`authResetDrop_`). Nothing else held this. */
```

### ---------- (c) NOTHING BUT THE LINK AND THE FORGOTTEN-PIN PIN TO AN UNPROVED ADDRESS

top level, before `b`

```
/* ---------- (c) NOTHING BUT THE LINK AND THE FORGOTTEN-PIN PIN TO AN UNPROVED ADDRESS ---------------------
     Jo's address is the typo again, PENDING. Lu is Jo's child (a link from before the rule). Bo has no
     email and typed gran1@ for his grown-up — a typo too — and has not been confirmed; Pat is a
     confirmed parent who has Bo through an answered claim. */
```

### ---------- (e) A NEW ADDRESS TYPED IN SETTINGS IS PROVED BY THE ACCOUNT BEFORE IT IS TRUSTED

top level, before `b`

```
/* ---------- (e) A NEW ADDRESS TYPED IN SETTINGS IS PROVED BY THE ACCOUNT BEFORE IT IS TRUSTED ------------
     Round three of the review, older than every round: Settings → Contact → email wrote the address
     straight in and left `verified` as it was. Jo is CONFIRMED on jsmith@ with Lu on her account; she
     types jsmith1@. Measured on round two's backend: the row kept TRUE, `notify` mailed jsmith1@, its
     owner's "Forgotten your PIN?" got Jo's account and `resetPin` handed them Lu. Now the new address
     waits beside the row (`authMove*_`), and only Jo, signed in, can open its link. */
```

### BLOCK D: A PENDING ROW CORRECTED.

top level, before `kay`

```
/* BLOCK D: A PENDING ROW CORRECTED. Nothing on it was proved, so the address is simply replaced — and
       the old link, mailed to the old address, must not confirm the row holding the new one. Nor may a
       PIN mailed to the old address still open it. */
```

### ---------- (f) LINKS MADE BEFORE THE RULE GO TO `held` WHEN THE ADDRESS'S OWNER TAKES THE ROW BACK

top level, before `b`

```
/* ---------- (f) LINKS MADE BEFORE THE RULE GO TO `held` WHEN THE ADDRESS'S OWNER TAKES THE ROW BACK ----------
     Round three: Jo PENDING on the typo jsmith1@ with Ned accepted (a link from before `confirmFirst_`)
     and a claim to Pia unanswered. The stranger who owns jsmith1@ presses "Forgotten your PIN?", types
     the PIN back, and the row is confirmed — measured on round two: resetPin on Ned, signed in as Ned. */
```

### ---------- (g) A SQUATTER TYPING WRONG PINS CANNOT KEEP THE OWNER OUT

top level, before `b`

```
/* ---------- (g) A SQUATTER TYPING WRONG PINS CANNOT KEEP THE OWNER OUT ----------------------------------------
     Round three: the squatter keeps their session and types wrong PINs at the address — eleven lock
     it, five more used to throw away the PIN Vic had just been mailed, for every new one she asked
     for. The typed PIN is still retired (a guesser gets five), and the link in the same mail is not. */
```

### ---------- (h) TAKING IT BACK CANCELS A CHANGE OF ADDRESS THE SQUATTER LEFT WAITING

top level, before `b`

```
/* ---------- (h) TAKING IT BACK CANCELS A CHANGE OF ADDRESS THE SQUATTER LEFT WAITING -------------------
     The review of round three, reproduced: Vic opens her confirmation link with the squatter still signed
     in; the squatter types sam@ in Settings and is mailed its link; Vic takes the account back by the
     emailed PIN — and the move sat on. Her Contact card said her email was changing to sam@, her "Send the
     link again" mailed the squatter a fresh link, and the squatter's link, forwarded and opened by Vic
     signed in, moved her account to sam@, where "Forgotten your PIN?" took it again. */
```

### SIGNING OUT ON ONE DEVICE IS SIGNING OUT OF THAT DEVICE (docs/history/317) THE ESSAY:

top level, before `b`

```
/* ==================================================================================================
   SIGNING OUT ON ONE DEVICE IS SIGNING OUT OF THAT DEVICE (docs/history/317)
   THE ESSAY: a child writing on the computer, the same account signed in on the iPad and signed out
   there — and every session ended, so the computer's next request was refused `signed-out` and its box
   was drawn empty over 3,015 characters. Reproduced in a sandbox of the live backend; held here: two
   sessions, the iPad signs out, the computer is still signed in, and the iPad's own token is refused.
   A PIN CHANGED STILL ENDS THEM ALL — that is `authEndSession_`'s job, and asked here so the two are
   not confused the other way.
   ================================================================================================== */
```

### 10. A CHILD'S HANDLE CARRIES NO NAME, AND NOBODY LOSES THEIR SIGN-IN OVER IT (docs/history/342)

top level, before `kidRules`

```
/* ==================================================================================================
   10. A CHILD'S HANDLE CARRIES NO NAME, AND NOBODY LOSES THEIR SIGN-IN OVER IT (docs/history/342)

   THE OWNER, 11 OCT: *"Change usernames to be more abstract to hide the names of kids. Just use initials
   and some combination which comes from date of birth or something."* Every door that makes a child's
   handle makes their initials and four digits from 2 to 9 (a parent's, a self-registered child's, a
   blank one filled, Randomise); a grown-up's is still the first name, a virtue and a number. And the
   children who already have a first-name handle are moved by `?run=kidHandles`, which with no `arg`
   WRITES NOTHING and says what it would do, and with `arg=apply` moves only children, puts every old
   handle at the front of `handle_was`, moves every friends list that named it — and a second run moves
   nobody. Through all of it, the old handle on a child's slip still signs them in, and says the new
   one; it never signs in anybody else.
   ================================================================================================== */
```

### 11. AFTER REVIEW, ROUND 1 (docs/history/342, "After review") — WHAT SECTION 10 DID NOT HOLD

top level, before `revRules`

```
/* ==================================================================================================
   11. AFTER REVIEW, ROUND 1 (docs/history/342, "After review") — WHAT SECTION 10 DID NOT HOLD

   Three reviewers read the branch and found the lock-outs section 10 could not see, because it asked
   only the cases the builder thought of. Each rule below was RED on the branch before its fix:
     · an old handle answered only to its exact spelling, so a child who had always spelled out her long
       first name (`christopher_kind42` for `christoph_kind42`) was let in the day before the move and
       refused the day after it — at the sign-in box and at "Forgotten your PIN?";
     · `handle_was` was trimmed to ten, so ten Randomise presses after the move retired the handle on
       the slip: it stopped signing her in AND became free to give to somebody else;
     · nothing held "a current handle wins" for "Forgotten your PIN?", or Randomise moving friends lists;
     · "not the birthday" was held only at `handleMake_`, not at the doors that call it;
     · a run that failed part-way left friends lists naming handles nobody has, for good, and on a tab
       whose `handle_was` is not beside `handle` it could leave a child with a new handle and no history;
     · a handle Randomise had reissued before 342 became ambiguous after the move, unseen;
     · a later run moved a child again because a surname had been corrected;
     · a private grown-up's hand-typed handle could carry the surname the net takes out of their name;
     · and the refusal for a handle nobody has still showed a grown-up's handle as the example.
   ================================================================================================== */
```

### 12. AFTER REVIEW, ROUND 2 — A HANDLE MOVED BY THE SERVER KEEPS THE FACE A BLANK LOOK DREW

top level, before `faceRules`

```
/* ==================================================================================================
   12. AFTER REVIEW, ROUND 2 — A HANDLE MOVED BY THE SERVER KEEPS THE FACE A BLANK LOOK DREW

   A figure nobody dressed is drawn from the HANDLE (`avatarConfig` in js/links.js: skin and hair colour
   from `hashOf(handle)`), so `?run=kidHandles` gave every child who never chose a look a different figure
   — a different skin tone — and the preview said nothing (the review: all eight children on the Ledger
   snapshot). Every handle the server moves now writes the old handle's look into a blank cell first
   (`handleFaceKept_`). THE FACE IS DRAWN HERE BY THE PHONE'S OWN CODE — `hashOf` out of js/core.js and
   `avatarConfig` out of js/links.js — because the server's copy of the hash and of the two palette lengths
   is exactly the thing that could drift: twenty handles, and every one must come out the same face.
   ================================================================================================== */
```

