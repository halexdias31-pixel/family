## A child is called by their first name — to everybody, in everything the server says, and the sheet keeps the rest

**The owner, 10 Oct:** *"make each look like a card. with fake barcode. also side note dont show
children's last name."*

The cards and their barcode are another branch's. This is the side note, and a side note that is
only true if it is true everywhere: the people column, a family card, a roster, a post, "who
reacted", a message, a receipt, a greeting, a toast, the weekly email.

### The decision: absent, not hidden — and nobody is sent it

**A name the phone is sent and told not to draw is in the JSON of everybody who opens the network
tab.** `payload.students` paid for that lesson once ("CHILDREN ARE NOT SENT TO STRANGERS" in
doget.gs). So the rule is about what the server SENDS, and the phone draws whatever arrives.

**A child's surname goes to nobody**: not another student, not a parent, not a tutor, not a
stranger — and **not their own parent or an admin either**. The rule as handed over allowed those
two, and keeping it simple meant deciding one way: the owner's sentence has no exceptions, an admin
reads the surname in the sheet and a parent typed it, and nothing on any screen draws it for either
of them, so sending it would only be one more copy on one more phone. **One place it goes**: the
child's own Settings, as the `last_name` box of `profileOf_`, which only their own sign-in reply and
`myProfile` carry — they typed it, and they can see and fix it. (`getProfile` answers with the same
boxes; it is an admin-only call nothing on the site makes.)

**A CHILD** is a row that holds `student` and is acting as one (`actingRole_`) — no adult role in
effect, a Tutor tick still waiting counting for nothing, and `pupil` or `kid` read as `student`
(`SELF_ROLE_ALIASES`). A student who is an approved tutor keeps a tutor's public card; a parent who
is also learning is a parent. (It said `mainRole` first; see the review below.)

**TWO CHILDREN WITH ONE FIRST NAME** are told apart by their handle: `Sam (@sam_bold12)`, wherever
the name stands alone (a roster, "who reacted", an inbox). A card that already prints the handle
under the name — a family card, the admin's people column, the score board — gets the bare first
name, or it would print the handle twice.

### How: one way to build a name, and a net at every exit

| piece | where | what |
|---|---|---|
| `nameFor_(r, cardHasHandle)` | backend/people.gs | **the** way a name is built for anything that leaves: a grown-up's whole name, a child's first name (with the handle when shared) |
| `kidNamesOff_(v)` | people.gs | **the net**: every child's whole name in a string, or anywhere in an object walked in place (keys too), replaced with `nameFor_`'s answer |
| `jsonOut` | core.gs | every reply goes through the net before it is written |
| `doGet`'s kept body | doget.gs | through the net before `cachePut_` — it goes out by `jsonRaw_`, past `jsonOut`; `freshFor_` nets the half laid on a hit |
| `mailOut_(o)` | people.gs | **every email**: subject, text and HTML through the net, then `MailApp.sendEmail`. The nine direct sends and `notify` all call it |
| `kidNamesBack_(stored, sent)` | people.gs, called by `setCell` and `setCells` (core.gs) | **the net on the way back in**: text the net shortened and the phone saved again is not written over the sheet's — see the review below |
| `kidMemo_()` | people.gs | the people tab's children worked out once per request, dropped by any write to that tab |

**WHY A NET AS WELL AS A HELPER.** A child's name is not only *built* — it is *stored* as text, typed
whole into an event's `actor`, a post's `author` and caption, a booking's `for_children`, a parent's
`children` cell, a receipt's `person_name` — and read back verbatim by a roster, the feed, a waiting
list. Every one of those is a route that would have to remember. The net does not: a route written
next year cannot forget. It asks `nameFor_`, so the two halves cannot disagree. Builders were moved
onto `nameFor_` too (the family card, the people column, clients' children, claims, the exams and
birthdays, orders, posts' authors and reactors, the inbox, the sign-in reply's lists, the make-child
and New PIN replies, a referral code, the digest's preview) so the code says what it means rather
than leaning on the net.

**HOW THE NET MATCHES.** Each word of a child's whole name, any run of white space between, case
folded, as whole words where a letter is any script's letter (`\b` would see no edge after an `ë`),
and an apostrophe as itself or the ways HTML spells it (the weekly email escapes the names it prints).
Longest first. A child with no first name has a "whole name" of their surname alone — as a pattern it
would take "kind" out of "be kind" — so it is replaced only where it is the whole value. Measured in
node: a 112 KB payload with 166 children, 35 ms; it runs on a cold build and on the fresh half of a
hit, never on the kept body twice.

**WHAT IT CANNOT KNOW**: a child whose row was deleted; a surname changed by hand in the spreadsheet,
which no `updateProfile` saw (type the old whole name into `name_was`); and a surname on its own — a
parent who shares it is a grown-up, and theirs to show. (A surname changed through Settings it does
know now, by `name_was`; and a child who is only words in a parent's `children` cell is cut to her
first word before she goes anywhere. Both from the review below.) A referral code already in a child's cell (six letters of the whole name, `IVYKIN`) is kept — it
may be on a flyer; a new one is made from the first name.

### What it changed besides the names

- **`createJob` takes `clientName` from an admin and nobody else.** It is the name the phone drew,
  and a child's phone draws `Wren` now — taken as written, her own booking would have gone into the
  events as `Wren`, a seat answering to no row and to every other Wren. `body.name` is the token's
  whole name. It also closes a door: a signed-in parent could name somebody else.
- **`move` finds a seat by the name the phone was shown**, second, and only when it picks out one
  seat — a tutor answering Wren's request names `Wren (@wren_kind43)`, and the whole-name match found
  nobody ("Say which person you mean").
- **The child's own `name` is `nameFor_` too**, on the sign-in reply, `myProfile` and a rename's save
  reply — the same string the net puts on her seat and her posts, so the phone's "is this mine?" still
  matches, and her You card and "Signed in as" are her first name.
- **A phone signed in before the deploy** kept the whole names in `familyUser` for the thirty days a
  session lasts. `myProfile` (asked on every open) now carries `name`, `children`, `kids`, `parents`
  and `siblings`, and `profileRefresh_` lays them over the stored ones. And a stored kid's name is cut
  to `profile.first_name` in data.js before the first frame, because `myProfile` lands a second after
  it — measured: the first frame drew her whole name on her own You card and booking form.
- **A name printed above its own handle does not say the handle too** — `nameBesideHandle_` (data.js),
  used by your own card (find.js's `myRow`, cards.js's fallback). Found by the screenshots: with a
  second Wren on the sheet her own card read "Wren (@wren_kind43) / @wren_kind43". Only a trailing
  `(@<this card's handle>)` goes, and only where it is drawn; `USER.name` keeps the server's string.
- **The register email to a no-email child's grown-up** names the child by first name.
- **The fixtures say what `doGet` sends now.** `check/fixture.json`'s student on the admin's people
  column and in "who reacted" is `Evie` (her long surname went — a child no longer has one there), and
  the long name the layout rules need moved to a grown-up, `Carl Everyclient-Longername`; the same in
  `check/states.js` and the people-column journey in `check-flow.js`.
- **`check-prefs.js`** counts the calls to `mailOut_` as the direct senders, and fails on a
  `MailApp.sendEmail` anywhere but inside it.

### The sheet

**Nothing is lost.** Every surname, every typed `child_typed`, every post's `author` cell, every
event's `actor` stays exactly as it was; the net works on the way out, never on the way in. The
admin still reads every whole name in the spreadsheet.

### The review of 10 Oct — eight findings, each reproduced first

Probes over the real backend (and a Chromium walk of every screen for four visitors) found the rule
true for the child it was written about and false at its edges. Each was reproduced, fixed at the
rule, and is held by `check-surnames.js` — red on the commit before, green after.

1. **A child who ticks Tutor in her own Settings stopped being a child** (two findings, one cause).
   `isChild_` asked `mainRole`, which picks the highest role TICKED; `setMyRoles` leaves a child's tick
   PENDING, and the rest of the backend already says a pending tick counts for nothing. So one tap took
   the rule off her: her whole name went to a signed-out stranger in her seat's `events[].actor`, to
   every signed-in phone on the score board and as `<b>Juno Vandersloot</b>` under her comment, into her
   tutor's live roster and the subject of his "New request" email. **Now** `isChild_` is "holds
   `student` and `actingRole_` says `student`", over the aliased words — so a `pupil` typed into the
   sheet (a *client* to `mainRole`) is a child too. data.js's first-frame cut decides the same way.
2. **The score board had started sending whole names.** It always said `S(r.first_name) || name`; the
   branch made it `nameFor_(r, true)`, which is the whole name for anybody holding `student` who is not
   a child — a parent who is also learning — and the board goes to every signed-in phone. **Now**
   `kidFirst_(r) || nameFor_(r, true)`: the first name for everybody, as before, never a lone surname.
3. **A child who is only words in her parent's `children` cell kept her surname**: `kids: ["Sol
   Fennimore"]` on her parent's sign-in reply, and once the parent booked, `for_children` carried it to
   the tutor and the admin. Nothing on the people tab can recognise her. **Now** `typedKids_` says each
   typed name that is nobody's row by its first word (one that is somebody's row, as `nameFor_` says
   it), `childNamesOf` offers those, and `createJob` puts any of the cell's whole words a phone sends
   back through the same cut (`kidsForJob_`).
4. **A surname corrected after booking was never recognised again** — the net was built from the row
   as it is now, so "Ivo Brackenridge" (now "Ivo Brack") went to a stranger, in his seat. **Now**
   `updateProfile` puts the old whole name on `name_was` (a new safeguarding column beside
   `handle_was`, newest first, ten kept; added by `ensureSchema` on the first request after this deploy,
   and a rename does not fail while it is missing), and `kidNamesIndex_` maps those names too. Rewriting
   the old events instead was the other option; it would change the ledger's history, and every other
   place a whole name is stored (captions, `for_children`, receipts) would need the same rewrite.
5. **Settings could write a handle into `last_name`.** The whole-value rule (a no-first-name child's
   surname, replaced only where it is the whole value) reached `profile.last_name` — hers, and a
   GROWN-UP's who shares the surname — and the form sends every box, so the next Save wrote
   `@thistle_kind47` into the sheet. **Now** a box called `first_name` or `last_name` is one part of a
   name and never a child's whole one (`kidWholeOk_`), on the way out and on the way back in.
6. **Text the net shortened came back and was written over the sheet's.** The admin pinned a post and
   the editor sent the caption it was filled with — "Wren and the volcano" — over "Wren Quorrington and
   the volcano"; a parent added a line to her notepad and every line above it lost the surname. **Now**
   `setCell` and `setCells`, the only two functions that change a cell, put every string written over a
   string through `kidNamesBack_`: a value that is what the net made of the cell is the cell, unchanged
   (and `setCells` skips it, so nothing is written); an edit of it keeps every name the edit did not
   touch — the differing middle is found from the common start and end, and only that is taken from
   what was sent; a name the edit runs into (an edge inside it, or a letter typed against it) belongs
   to the edit. A value that has a child's WHOLE name in it is written as it is: whoever wrote it had
   the whole names — `name_was` gaining a name shares its first word with what the net makes of the old
   cell, and comparing the two wrote the old name in twice (measured, and now a rule in the check).
   One door each way: a route written next year cannot forget either.
7. **No check sent an HTML email**, so taking `htmlBody` out of `mailOut_`'s net stayed green. **Now**
   the child invites a friend to her session (`sendInvites`, whose HTML names her), and a hand-made
   email goes through `digestMail_`, the weekly email's door.

**And a cost the review measured in passing**: `kidFirstShared_` walked the whole people tab for every
name `nameFor_` was asked for, so the board, the admin's column and the posts' faces were each one pass
per row — the net's index took 181 ms over 300 people and 1179 ms over 600 (node). `kidMemo_` works it
out once per request: a cold signed-out `doGet` over 600 people went from 2082 ms to 128 ms, the
admin's from 2400 ms to 530 ms; and the net now runs `exec` on its one pattern instead of `matchAll`,
which recompiled a pattern naming every child for every string (a 2.7 MB walk, 2.1 s to 0.4 s).

**Not changed, and why**: a surname typed into a *hand-built* `createJob` as one of the booker's own
children's (`kids: "Ashgrove, Lark"`). The booking form only ticks names the server gave it, all first
names now; free words in a request are the parent's own, like a message, and no rule over names can
say which word is a surname without guessing. And a child renamed after booking still loses her seat
to `move` (it matches the token's whole name against the events): older than this branch, and a
question of identity, not of names shown.

### Checked

- **`js/check-surnames.js`** (new, in `check-all`; 169 rules after the review), through the real backend (`check-gas-load.js`):
  a child, `Wren Quorrington`, with a second Wren beside her; her whole name stored where the live
  sheet stores it (a post and its caption, reactions, a comment, her own booking, her parent's
  booking with her whole name ticked, a typed `children` cell, an exam, a birthday, a score, an
  order). The payload — fresh and kept — the sign-in reply, `myProfile` and the inbox for a stranger,
  another student, the other Wren, another parent, **her own parent**, her tutor and an admin; the
  admin's `listPeople`, `diagnosePeople` and `digestPreview`; 13 emails (a message, a claim declined,
  her own PIN change, the New PIN, a make-child) — **no surname in any**. Her first name is there,
  with her handle where it is shared; her own Settings carries `last_name`; the sheet keeps every
  surname; a tutor's Decline naming her as shown reaches her seat. And the source: no `MailApp` send
  outside `mailOut_`, no `createTextOutput` outside `jsonOut`/`jsonRaw_`. After the review: Juno (ticks
  Tutor, books, comments), Kit (a `pupil`), Ivo (books, then corrects his surname), Sol (only words in
  her parent's cell), Gus (a parent who is learning, by first name on the board), a grown-up sharing a
  no-first-name child's surname, the pin-only post edit, a notepad line, a tutor's headline, the
  invitation's HTML and the weekly email's door, and `kidNamesBack_` asked directly for each kind of
  edit. Every finding's mutation is red (the commit message lists them).
- **`check-flow.js`**, *"a child is her first name on every screen"* (Juno added after the review, red with `mainRole`): the phone booted on the REAL
  `doGet` for each visitor's token, every POST answered by the real `doPost`, every screen and every
  page of the windowed ones drawn — her surname nowhere in the document for a visitor, her tutor,
  another parent, an admin, or herself on a phone signed in before the deploy (her Settings boxes
  left out, and nothing else).
- **Screenshots at 390, the real app over the real backend** (a one-off script, not committed): the
  admin's people column (two Wrens, told apart by `@wren_kind43` and `@wren_bold44` under the name),
  her parent's family card ("Your child · Wren"), another parent's feed (her post captioned "Wren
  (@wren_kind43) and the volcano"), the admin's inbox ("Wren (@wren_kind43)"), her own card ("Wren",
  her handle under it) and her Settings — where the Last name box is the one place her surname is.
- **Mutations**, each red for its own reason and green on restore — see the commit message.

**Since 11 Oct (342):** a child's handle carries no name either — their initials and four digits — and the rule here grew a viewer-aware half: a parent's or client's surname goes to nobody but themselves and an admin (tutors and admins keep their whole names). `nameFor_` asks who the reply is for (`NET_VIEWER_`), and "a grown-up's is their whole name" above now means a tutor's or an admin's. See [342](342-a-child-s-handle-carries-no-name.md).
**And it narrows "a child's surname goes to nobody" by one letter, knowingly** (342, after review): her handle is her initials, so its second letter is her surname's first, and it goes beside her first name wherever the handle goes — the score board, her posts to a signed-out visitor, family cards, rosters. Two doors that confirmed a guessed whole name to anybody (`register`, and `makeChild` to any parent) no longer SAY it is the name — but a refusal there still means "one of these is taken", as `claimChild`'s "No student called …" does to any confirmed parent (342, round 2, which also took out the pause round 1 put on it: one signed-out caller could switch sign-up off for everybody). An open class's events no longer go to people not on it.
**And a child sees the whole name of a grown-up on her own family row** (342, round 2): the claim card is where she decides whether somebody is her parent, so a claimant's surname — and her own parent's, to compare it with — goes to her (`netKin_`), and still to nobody else. Her own surname still goes to nobody, her parent included.
