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

**A CHILD** is a row whose `mainRole` is `student` — holding no adult role. A student who also tutors
keeps a tutor's public card; a parent who is also learning is a parent.

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

**WHAT IT CANNOT KNOW**: a surname a child has since changed, still in an old event's `actor`; a child
whose row was deleted; and a surname on its own — a parent who shares it is a grown-up, and theirs to
show. A referral code already in a child's cell (six letters of the whole name, `IVYKIN`) is kept — it
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

### Checked

- **`js/check-surnames.js`** (new, in `check-all`), through the real backend (`check-gas-load.js`):
  a child, `Wren Quorrington`, with a second Wren beside her; her whole name stored where the live
  sheet stores it (a post and its caption, reactions, a comment, her own booking, her parent's
  booking with her whole name ticked, a typed `children` cell, an exam, a birthday, a score, an
  order). The payload — fresh and kept — the sign-in reply, `myProfile` and the inbox for a stranger,
  another student, the other Wren, another parent, **her own parent**, her tutor and an admin; the
  admin's `listPeople`, `diagnosePeople` and `digestPreview`; 13 emails (a message, a claim declined,
  her own PIN change, the New PIN, a make-child) — **no surname in any**. Her first name is there,
  with her handle where it is shared; her own Settings carries `last_name`; the sheet keeps every
  surname; a tutor's Decline naming her as shown reaches her seat. And the source: no `MailApp` send
  outside `mailOut_`, no `createTextOutput` outside `jsonOut`/`jsonRaw_`.
- **`check-flow.js`**, *"a child is her first name on every screen"*: the phone booted on the REAL
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
