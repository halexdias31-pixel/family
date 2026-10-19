# js/check-surnames.js

The full text of comments in `js/check-surnames.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-surnames.js — NO CHILD'S SURNAME LEAVES THE SERVER, THROUGH THE REAL BACKEND

top level, before `fs`

```
/* ==================================================================================================
   node js/check-surnames.js — NO CHILD'S SURNAME LEAVES THE SERVER, THROUGH THE REAL BACKEND

   THE OWNER, 10 OCT: *"also side note dont show children's last name."*

   A side note that is true only if it is true EVERYWHERE: the people column, a family card, a roster,
   a post, "who reacted", a message, a receipt, the weekly email. A name the phone is sent and told not
   to draw is in the JSON of everybody who opens the network tab, so the question this asks is not "is
   it drawn" but "is it SENT" — of every reply and every payload, for every kind of person who could ask,
   and of every email. `check-flow.js` asks the other half, of the screens, over these same replies.

   THE DECISION THIS HOLDS (people.gs, "A CHILD IS CALLED BY THEIR FIRST NAME"): a child's surname goes
   to NOBODY — not another student, not a parent, not a tutor, not a stranger, and not their own parent
   or an admin either, who have it already and whose screens would only draw it. ONE place it goes: the
   child's own Settings, as `profile.last_name` on their own sign-in reply and `myProfile`, so they can
   see and fix what they typed. The sheet keeps every surname; nothing here writes one away.

   THE CHILD IS `Wren Quorrington` — a surname nobody else here has, so finding it anywhere means only
   one thing — with a SECOND Wren beside her, because two children with one first name are told apart by
   their handles, and that is a rule too. Her name is put where a whole name is STORED as text, the way
   the live sheet has it — an event's actor, a post's author, a booking's children, a typed `children`
   cell — as well as where one is BUILT, because the stored ones are what a rule about building cannot
   reach.

   AND THE CHILDREN THE FIRST VERSION OF THE RULE MISSED (the review of 10 Oct), each with a surname of
   her own so a find means one thing: `Vandersloot`, a child who ticked Tutor in her own Settings and is
   still waiting (to `mainRole` she was a tutor, and her whole name went to a signed-out stranger);
   `Marchbanks`, typed into the sheet as a `pupil`; `Fennimore`, who is only words in her parent's
   `children` cell; and `Brackenridge`, the surname a child had when he booked and has since corrected.
   With them, a grown-up who is learning (the score board says a first name for everybody, as it always
   did), and what comes BACK: text the net shortened, saved again, must not be written over the sheet's.

   AND SINCE 11 OCT, A GROWN-UP WHO IS NOT ON A PUBLIC CARD (section 7, docs/history/342). The owner:
   *"don't show surname as some kids have different surnames and gets a bit awkward"* — so a parent's
   or a client's surname goes to nobody but themselves, an admin and a child on their own family row (round
   2, section 9: the claim card is where a child decides who her parent is), while a tutor's whole name stays
   on every card. That half depends on WHO IS ASKING, so it is asked of every viewer separately: each
   grown-up's surname absent from what everybody else is sent, present in their own sign-in reply and
   payload, present for an admin; and every email read for the person it went to.

   Invented people, example.org addresses, and no PIN but the 0000 placeholder.
================================================================================================== */
```

### 1. THE SOURCE — ONE DOOR OUT FOR A REPLY, ONE FOR AN EMAIL

top level, before `FILES`

```
/* ==================================================================================================
   1. THE SOURCE — ONE DOOR OUT FOR A REPLY, ONE FOR AN EMAIL
   ================================================================================================== */
```

### 2. THE PEOPLE, AND WHERE A CHILD'S WHOLE NAME IS ALREADY WRITTEN DOWN

top level, before `MAIL`

```
/* ==================================================================================================
   2. THE PEOPLE, AND WHERE A CHILD'S WHOLE NAME IS ALREADY WRITTEN DOWN
   ================================================================================================== */
```

### SHE BOOKS THE TUTOR HERSELF — and her phone, which calls her `Wren` now, says so in `clientName`.

top level, before `slotDay`

```
/* SHE BOOKS THE TUTOR HERSELF — and her phone, which calls her `Wren` now, says so in `clientName`. The
   seat must still go down under her WHOLE name: the sheet keeps it, and a seat called `Wren` would answer
   to no row and to every other Wren. */
```

### SHE INVITES A FRIEND TO SHARE IT.

top level, before `m2`

```
/* SHE INVITES A FRIEND TO SHARE IT. AN INVITATION IS AN HTML EMAIL — she asks a friend to share her session, and her name is in its HTML.
   The only email here with an `htmlBody` that names her, so it is what proves the net reaches the HTML. */
```

### JUNO TICKS TUTOR IN HER OWN SETTINGS.

top level, before `ticked`

```
/* JUNO TICKS TUTOR IN HER OWN SETTINGS. It is a request, not a role: `listed` goes PENDING and the business
   has said nothing — so she is a child still, and must be called one. Then she books and says a word on
   Wren's post, so her whole name is in an event's `actor`, her tutor's roster, the "New request" email,
   a comment and the score board. */
```

### 3. NOBODY ELSE IS SENT IT — every payload and every reply, for every kind of person

top level, before `WHO`

```
/* ==================================================================================================
   3. NOBODY ELSE IS SENT IT — every payload and every reply, for every kind of person
   ================================================================================================== */
```

### 4. SHE IS — HER OWN SETTINGS, AND NOWHERE ELSE

top level, before `me`

```
/* ==================================================================================================
   4. SHE IS — HER OWN SETTINGS, AND NOWHERE ELSE
   ================================================================================================== */
```

### 5. EVERY EMAIL — the ones written above, and the ones the family actions send

top level, before `claim`

```
/* ==================================================================================================
   5. EVERY EMAIL — the ones written above, and the ones the family actions send
   ================================================================================================== */
```

### 5b. THE NET'S OWN EDGES, asked of the real function in the real scope

top level, before `off`

```
/* ==================================================================================================
   5b. THE NET'S OWN EDGES, asked of the real function in the real scope
   ================================================================================================== */
```

### 6. NOTHING IS LOST — the sheet keeps every surname

top level, before `fH`

```
/* ==================================================================================================
   6. NOTHING IS LOST — the sheet keeps every surname
   ================================================================================================== */
```

### 6b. WHAT COMES BACK IS NOT WRITTEN BACK SHORT

top level, before `admPost`

```
/* ==================================================================================================
   6b. WHAT COMES BACK IS NOT WRITTEN BACK SHORT
   ================================================================================================== */
```

### 7. A GROWN-UP WHO IS NOT ON A PUBLIC CARD — by first name to everybody but themselves and an admin

top level, before `GROWN`

```
/* ==================================================================================================
   7. A GROWN-UP WHO IS NOT ON A PUBLIC CARD — by first name to everybody but themselves and an admin

   THE GROWN-UPS ABOVE ARE ALREADY WHERE A WHOLE NAME IS STORED: Pip booked for Wren and Tess for Sol
   (an event's actor, a roster's seat), Ola asked to claim Wren. Here Pip also says a word under the post
   and reacts to it, and Ola writes to the tutor (an inbox, and the email that tells him). Gus is a parent
   who is also learning — a grown-up, and private. Tam is a tutor and Hal an admin: their whole names stay
   on every card, for everybody, because a family books a tutor by name.
   ================================================================================================== */
```

### A CHILD SEES THE WHOLE NAME OF A GROWN-UP ON HER OWN FAMILY ROW, asked or accepted (`netKin_`, 342 round 2):

top level, before `KIN`

```
/* A CHILD SEES THE WHOLE NAME OF A GROWN-UP ON HER OWN FAMILY ROW, asked or accepted (`netKin_`, 342 round 2):
   Pip is Wren's parent. Ola ASKED to be, and Wren said no in section 5 — so Ola's surname is hunted in
   everything Wren is sent from then on, and allowed only in the one email that asked her (below). */
```

### TESS TICKS TUTOR AND IS LEFT WAITING (after review, round 1) — a Tutor tick nobody has said yes to is not a public card

top level, before `tessTick`

```
/* TESS TICKS TUTOR AND IS LEFT WAITING (after review, round 1) — a Tutor tick nobody has said yes to is not
   a public card (`namePrivate_` asks `actingRole_`, not the role cell), so her surname is hunted below while
   it waits. No fixture had a grown-up in that state, and reading the role cell instead stayed green. */
```

### 8. AFTER REVIEW, ROUND 1 (docs/history/342, "After review") — the doors section 7 did not walk

top level, before `revAsked`

```
/* ==================================================================================================
   8. AFTER REVIEW, ROUND 1 (docs/history/342, "After review") — the doors section 7 did not walk

   Each was found by a reviewer who changed one line and watched every check stay green — so each is
   asked here by the reply or the payload it would have changed:
     · `mailOut_` puts back whoever the request was for after each email (`finally`). Without it a reply
       built after a notification is built for the email's recipient — an admin who teaches the class,
       and each parent's `move` reply then names the other parent whole.
     · an OPEN action's viewer comes from the token, never from `personId` off the request: a stranger
       claiming the admin's id must get what any stranger gets.
     · a referral code is cut from the name as OTHERS have it, since a code is handed round.
     · a festive join's typed list of children reached every signed-out visitor, word for word, in the
       events of an open job — and the events named every family three lines below the slots that blank
       them. A typed surname is cut on the way in; the log goes only to the people on the job.
     · `register` confirmed a guessed whole name to anybody, writing nothing; `makeChild` to any parent.
   ================================================================================================== */
```

### THE CHILD'S DOOR, WITH ONE GROWN-UP'S ADDRESS FOR EVERY GUESS (round 2) — `parent_email` is somewhere to write, not a sign-in address, so nothing asks it first.

top level, before `regKid`

```
/* THE CHILD'S DOOR, WITH ONE GROWN-UP'S ADDRESS FOR EVERY GUESS (round 2) — `parent_email` is somewhere to
     write, not a sign-in address, so nothing asks it first. A guessed real name is refused in the sentence a
     clash always gets, naming nothing, and writes and mails nothing; a wrong one makes a PENDING row and mails
     that address. That difference is the "one of these is taken" note 342 says is left. */
```

### NOTHING ONE CALLER DOES PAUSES ANYBODY ELSE (round 2).

top level, before `own`

```
/* NOTHING ONE CALLER DOES PAUSES ANYBODY ELSE (round 2). Round 1 counted clashes with private names and
     refused EVERY new account after five in a day — and one signed-out caller could fill that count from a
     row of their own. A repeated own name, and repeated real ones, then an innocent family and a parent. */
```

### 9. AFTER REVIEW, ROUND 2 — A CHILD DECIDING WHETHER A GROWN-UP IS HER PARENT SEES WHO IT IS

top level, before `kinAsked`

```
/* ==================================================================================================
   9. AFTER REVIEW, ROUND 2 — A CHILD DECIDING WHETHER A GROWN-UP IS HER PARENT SEES WHO IT IS

   The claim card ("<from> says they are your parent", Yes / No) is the one place a child vets a grown-up,
   and a yes hands that account her bookings, her progress and a new PIN of their choosing. 342 cut its
   name to the first one, so a second Pip — any stranger who registers as "Pip <anything>", the name every
   roster shows other families — sent a card reading `Pip (@pip_bold55)` beside her own parent's
   `Pip (@pip_kind42)`. Now: the child on the row sees the claimant's WHOLE name while it is asked (and
   her own parent's, accepted), in the card, the payload and the email that tells her; nobody else is
   sent it; and once she says no it is gone from what she is sent too.
   ================================================================================================== */
```

### A WORD UNDER HER POST FIRST — so his name is somewhere Wren is sent whatever the card says, and "after she says no, nobody she is sent names him whole" asks

top level, before `piSaid`

```
/* A WORD UNDER HER POST FIRST — so his name is somewhere Wren is sent whatever the card says, and "after she
       says no, nobody she is sent names him whole" asks something (with no comment, a refused claim has nowhere
       left to name him, and counting `refused` as family stayed green — measured). */
```

