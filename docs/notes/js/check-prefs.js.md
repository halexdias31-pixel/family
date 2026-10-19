# js/check-prefs.js

The full text of comments in `js/check-prefs.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-prefs.js — WHAT EVERYBODY HAS CHOSEN TO BE EMAILED, HONOURED BY EVERY SENDER

top level, before `fs`

```
/* ==================================================================================================
   node js/check-prefs.js — WHAT EVERYBODY HAS CHOSEN TO BE EMAILED, HONOURED BY EVERY SENDER

   ASKED FOR AS *"Also let parents select their communication preferences like notification. And kids
   and tutors too I guess"* (the owner, 9 Oct). The site sends email and nothing else, so a preference is
   a yes or no per KIND of email — `NOTIFY_KINDS` in backend/constants.gs — kept on the person's row
   (`weekly_email` and five more beside it, blank is on), written by `setNotify` and read by `wants_`.

   A SWITCH IS ONLY AS GOOD AS THE SENDER THAT FORGETS TO ASK IT. There were 22 `notify(` calls and 8
   direct `MailApp.sendEmail`s on the day this was written, and the next one added is the one that will
   not ask. So this check asks three things, and each is a different way of being wrong:

     1. THE TABLE. Every kind has a label and a note for the card and roles it reaches; an optional kind
        has a column on the people tab (`SCHEMA.people`), an essential one says why it cannot be turned
        off. The weekly email's old opt-out IS one of them — folded in, not a second mechanism.
     2. THE SOURCE. Every `notify(` in backend/ names a kind that is in the table — a literal, or a
        conditional of two literals, so it can be read here — and THE KIND THIS FILE PINS FOR THAT CALL
        (`CALLS`, by where it is and what its subject says), so moving a sender from an optional kind to
        an essential one is an edit to this file and not a quiet way to make a switch do nothing. Every
        `MailApp.sendEmail` sits in a place this file names, either essential with a reason, or asking
        `wants_` for its kind. A new sender fails here before it can mail somebody who said no. Every
        optional kind has a sender, or its switch would be a tick that does nothing. Nothing reads one of
        the columns but `wants_`.
     3. THE BEHAVIOUR, THROUGH THE REAL `doPost` — check-gas-load.js, MailApp stubbed: for every
        optional kind a real sender, switched off sends that person nothing and writes a line in the log
        (`notifyHeld_`), switched on sends; the essentials still go when every column on every row says
        `no`; the TOKEN decides whose row `setNotify` writes, by `resetPin`'s rule for a child; a stranger
        reads and writes nobody's; and a row from before the columns, or a sheet without them, is on.
        And the card is drawn for whoever the sender writes to: a parent by the family tab whatever their
        role cell says, a `parent` or `kid` typed into it, and the real doGet listing `setNotify` in
        `features` — the one line that turns the card on for every phone.

   The people are invented, their addresses are on example.org and every PIN is 0000.
================================================================================================== */
```

### ---------- 2. THE SOURCE

top level, before `FILES`

```
/* ---------- 2. THE SOURCE ----------------------------------------------------------------------------------
   Parsed, not grepped: the house style is that a comment is a bug report, so `notify(` and `MailApp` are all
   over the prose. A tiny walker with the ancestor chain, because which function a send sits in is the
   question. */
```

### THE DIRECT SENDERS, BY WHERE THEY ARE.

top level, before `DIRECT`

```
/* THE DIRECT SENDERS, BY WHERE THEY ARE. `essential` names the kind and the reason is the table's `why`;
   `asks` is an optional kind whose sender must call `wants_(…, '<kind>')` in the function named `in`. A
   send somewhere not listed fails, and so does a listed place that no longer sends — a stale row here
   would be a sender this check believes is covered. */
```

### ---------- AND EVERY `notify(` CALL, PINNED TO THE KIND IT WAS DECIDED TO BE

top level, before `CALLS`

```
/* ---------- AND EVERY `notify(` CALL, PINNED TO THE KIND IT WAS DECIDED TO BE ----------------------------
   READ FOR MEMBERSHIP ONLY, the kind was "some kind in the table", and only one real sender per optional
   kind is driven below. So the tutor's "Paid: a place is confirmed" moved from `bookings` to `reported`,
   and `joinFestive`'s mail to the admin from `bookings` to `booked`, both stayed green (review, 9 Oct) —
   and `joinFestive` is the ONLY sender behind the admin's Booking updates tick, which would then do
   nothing. Each call is keyed by where it is (`placeOf`) and the first words its subject says
   (`subjectOf` — the first string, through a `+`, the `?`'s first answer, or the `||`'s first that has
   one), and must name exactly the kind(s) written here, in that order. A call nobody listed fails, and so
   does a row no call matches: a reclassification is an edit to this table, made on purpose, with the
   reason in the comment beside the call in backend/. `when` pins the test of a `cond ? a : b` kind —
   which acts of `move` are `booked` is as much the decision as the two words. */
```

### ---------- `mailOut_` IS THE ONE DOOR, SO A SENDER IS A CALL TO IT

top level, before `mailCall`

```
/* ---------- `mailOut_` IS THE ONE DOOR, SO A SENDER IS A CALL TO IT --------------------------------
       SINCE 10 OCT EVERY EMAIL GOES THROUGH `mailOut_` (people.gs), which takes a child's surname out of
       it on the way (the owner: *"dont show children's last name"*). So the direct senders this table
       names are the calls to the door, and `MailApp.sendEmail` itself belongs inside the door and nowhere
       else — one anywhere else is a send that asks nobody about anything, and fails here as the GmailApp
       one always has. `check-surnames.js` asks the same question from the other side. */
```

### A PIN `register` AND `changePin` WILL TAKE — 0000 is refused as too easy to guess (`pinWeak_`) — built in pieces, as check-signin builds its own, so

top level, before `FRESH`

```
/* A PIN `register` AND `changePin` WILL TAKE — 0000 is refused as too easy to guess (`pinWeak_`) — built in
   pieces, as check-signin builds its own, so `check-secrets.js` does not read a PIN literal in a public
   repository. Invented, and nobody's. */
```

### 3a. WHAT THE CARD IS TOLD, PER ROLE — the sign-in reply's profile, which is `profileOf_`.

top level, before `WANT`

```
/* 3a. WHAT THE CARD IS TOLD, PER ROLE — the sign-in reply's profile, which is `profileOf_`. The owner's ask,
   written out: a parent's, a kid's, a tutor's and an admin's, and nothing of anybody else's. NO `referrals`
   for anybody: it is `hidden` (constants.gs), because nothing hands a code out any more. */
```

### THE ONE LINE THAT TURNS THE CARD ON.

top level, before `wk`

```
/* THE ONE LINE THAT TURNS THE CARD ON. `notifyCard_` draws "The live backend does not have notification
   choices yet" for any doGet whose `features` does not name `setNotify`, and check-flow and check/states.js
   type `features: ['setNotify']` into their payloads — so deleting it from doget.gs left every journey green
   and every phone saying so for ever (review, 9 Oct). Asked of the real doGet, as check-aimark asks `aiMark`. */
```

### 3f. WHOEVER A SENDER WRITES TO IS SHOWN ITS SWITCH, AND MAY USE IT.

top level, before `SUN`

```
/* 3f. WHOEVER A SENDER WRITES TO IS SHOWN ITS SWITCH, AND MAY USE IT.
   PARENTS BY THE FAMILY TAB: the Sunday run writes to `acceptedParents`, which reads links, not role cells —
   and an admin may make or link a child, and a tutor who was a client may untick Client and keep theirs.
   Both were sent the weekly email, offered no tick for it, and told by `setNotify` that it "is not an email
   that reaches you" (review, 9 Oct). So each of them, with an accepted child: the card has the weekly
   switch and "Family links" under Always sent, `setNotify` takes it, and the real Sunday run then sends
   them nothing (and logs it) — or, left on, sends.
   THE WORDS PEOPLE TYPE: `parent` and `kid` in the role cell (`SELF_ROLE_ALIASES`). Read raw, a `parent`
   row was drawn no kinds at all and refused every one. */
```

