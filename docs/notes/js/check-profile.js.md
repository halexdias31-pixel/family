# js/check-profile.js

The full text of comments in `js/check-profile.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-profile.js — YOUR SETTINGS, SAVED AND READ BACK, THROUGH THE REAL BACKEND

top level, before `backend`

```
/* ==================================================================================================
   node js/check-profile.js — YOUR SETTINGS, SAVED AND READ BACK, THROUGH THE REAL BACKEND

   REPORTED AS *"some things arent updating when i click save. also the whole saving process feels very
   unresponsive"*, and an audit found four faults under it, every one of them invisible to the suite:

     · THE SIGN-IN REPLY THREW AWAY `profileOf_`. It set `profile: profileOf_(r)` and ten lines later
       replaced it with the raw cells — so the qualification shelf, the library cards, the phone's two
       boxes, the birthday's three and the exam pickers opened empty, and a Save wrote the blanks back.
     · NOBODY BUT AN ADMIN COULD SAVE AT ALL. `updateProfile` compared the phone's `targetId` (an id)
       with `body.name` (a display name the gate had just written), so every tutor, parent and student
       was refused "Not authorised to edit that profile."
     · A REFUSED SAVE HAD ALREADY WRITTEN. The phone and the birthday were written before the e-mail
       clash was asked about, so "That e-mail address is already on another account" came back over a
       row that had changed.
     · THE PAYLOAD CACHE WAS KEYED ON `?person=` AND `?name=`, so a stranger typing the admin's id and
       name into the address was handed the admin's payload — every child in `students`.

   NOT A SECOND IMPLEMENTATION. Every `.gs` file is loaded into one vm scope, in `check/live.js`'s
   order, over an in-memory Ledger whose tabs carry `SCHEMA`'s own headers, and every request goes in
   through the real `doPost`/`doGet`. `setValue` parses a string the way a UK-locale sheet does — a
   `dd/mm/yyyy` or ISO string becomes a Date, `TRUE` a boolean, a plain number a number, and a leading
   apostrophe is text and not part of the value — because what a Save writes is compared with what the
   sheet hands back, and a stub that stored strings as given would call every Date a change.

   WHAT THE FORM POSTS is built from the group lists the backend sends, with the three substitutions the
   form makes (`phone` → its two boxes, `date_of_birth` → its three, a checkbox → TRUE/FALSE) — the
   same names `settingsPages_` draws. `check-flow.js` drives the real form; this asks the backend.

   The people are invented, their PINs are 0000 and their addresses are on example.org.
================================================================================================== */
```

### ---------- THEIR QUALIFICATIONS AND LIBRARY CARDS, AS ROWS ON TABS OF THEIR OWN

top level, before `QUAL_ROWS`

```
/* ---------- THEIR QUALIFICATIONS AND LIBRARY CARDS, AS ROWS ON TABS OF THEIR OWN ------------------
   The people tab was redesigned so a list is a tab — see `SCHEMA.people`. A PGCE and a QTS are
   ordinary rows. The admin and the tutor share the shelf, and everybody holds two library cards. */
```

### 5. A REFUSED SAVE HAS WRITTEN NOTHING.

top level, before `reply`

```
/* 5. A REFUSED SAVE HAS WRITTEN NOTHING. Somebody else's address, a new phone and a new birthday —
   as the admin, because the admin is the one role whose Save reached the writes before the gate was
   repaired, so it is the one that could prove the old order wrong. */
```

### 9. THE BUSINESS RECORDS:

top level, before `a`

```
/* 9. THE BUSINESS RECORDS: an admin's and nobody else's, a refused page writes nothing, what is
   saved comes back by its slug, an unchanged page writes nothing, and an item left empty is not a
   row — see backend/records.gs and the Settings pages in js/records.js. */
```

### 10. RANDOMISE — A NEW WORD FOR YOUR OWN HANDLE, AND NOBODY ELSE'S.

top level, before `t`

```
/* 10. RANDOMISE — A NEW WORD FOR YOUR OWN HANDLE, AND NOBODY ELSE'S.
   *"handles should be their name and a virtuous describing word. they can randomise it but it will
   follow that general name."* The Settings card has no handle box any more; its Randomise tile
   posts `randomiseHandle`, and these are the things that action must be, through the real `doPost`:
   the asker's first name, a virtue and a fresh two-digit number in a random order, never led by the
   digits (*"their first name, a virtuous adjective and random numbers and maybe an underscore. but
   all random order"*, 2 October — it was `ada_<virtue>` with no number until then), never the
   handle they already had, the old one at the FRONT of `handle_was` with EVERY earlier one kept (342: an
   old handle still signs its person in, so none is trimmed) and Randomise refused, writing nothing, once
   the history holds `HANDLE_WAS_MAX`, what the next sign-in hands back, the asker's own row whatever id is posted, a
   refusal that writes nothing for somebody signed out — and `changeHandle`, the typed box it
   replaced, no longer an action at all. `check-handles.js` holds the generator's own rules. */
```

### THE SHAPE, WRITTEN HERE RATHER THAN ASKED OF `handleParts_`:

top level, before `W`

```
/* THE SHAPE, WRITTEN HERE RATHER THAN ASKED OF `handleParts_`: the asker's first name, a virtue
     and a number 10–99 in any of the four orders that do not lead with the digits, one underscore at
     most. Asking the backend's own parser would be the generator marking its own homework. */
```

### MORE THAN ONE ORDER OVER THE PRESSES — "but all random order".

top level, before `hist`

```
/* MORE THAN ONE ORDER OVER THE PRESSES — "but all random order". Not all four: fourteen presses
     miss one of four about one run in fourteen, and a check that is red by chance is a red nobody
     reads. One order in fourteen presses is a fixed order, one chance in sixty million. */
```

### 10. THE AGE RANGE: A YOUNGEST OLDER THAN THE OLDEST IS REFUSED BEFORE ANYTHING IS WRITTEN, so is an age that is not on the list, and a real change comes back.

top level, before `t`

```
/* 10. THE AGE RANGE: A YOUNGEST OLDER THAN THE OLDEST IS REFUSED BEFORE ANYTHING IS WRITTEN, so is an
   age that is not on the list, and a real change comes back. About you posts the headline as well,
   and it is changed in the same request — so a refusal that let the rest of the page through would
   show up here as a headline that moved. As the tutor, because it is a tutor's field; the admin row
   is a copy of the tutor's and would prove nothing the tutor does not. */
```

### 10. WHO IS SENT WHICH FIGURE ON A SESSION, BY THE REAL `doGet`.

top level, before `job_id`

```
/* 10. WHO IS SENT WHICH FIGURE ON A SESSION, BY THE REAL `doGet`.
   *"for tutor they shouldnt see grand total client pays, only grand total they earn. admin should be
   able to see grand total client pays. total tutor earns, and how much admin earns."* The phone only
   draws what arrives — see `jobMoney_` — so the rule that matters is the payload's: a client is
   never sent the split, a tutor on the job is sent their pay and not the client's total, an admin
   is sent all three. Asked of the cache-keyed GET each person really makes, with their token. */
```

### AND THE PAYLOAD CACHE, NOT ONLY THE ROW CACHE.

top level, before `asWho`

```
/* AND THE PAYLOAD CACHE, NOT ONLY THE ROW CACHE. `b.seed` writes the tab directly, which is what a
     hand edit is, and the six-hour payload does not know — so any visitor fetched earlier in this
     file is served the payload from before the seed. The age-range section above fetches the
     tutor's, so the tutor and nobody else was sent a payload with no J-MONEY in it, and this
     section reported the session "did not reach the tutor". `clearPayloadCache` is what a real
     write retires it with. */
```

### 10. YOUR OWN FAMILY, THROUGH THE REAL `doGet`, AND NOBODY ELSE'S.

top level, before `f`

```
/* 10. YOUR OWN FAMILY, THROUGH THE REAL `doGet`, AND NOBODY ELSE'S.
   ASKED FOR AS *"students should be able to see their parents and likewise"*. Two families on one
   tab, and the links that must NOT count beside the ones that must: a claim nobody answered and a
   claim refused, each naming somebody from the other family. A student sees their parent and not
   the other parent; a parent sees their child and not the other child; a stranger whose URL names
   the student sees nobody, because the list is built from the TOKEN. Its own backend, because the
   people above have no family and a link added there would change what they are sent. */
```

### AND SIBLINGS, ON *"students should be able to see their parents and siblings likewise"*.

top level, before `link_id`

```
/* AND SIBLINGS, ON *"students should be able to see their parents and siblings likewise"*. Cal is
     Anna's second child, so Abe and Cal see each other; Ben is Bea's, and the only links between
     him and Anna's children are L3 (asked) and L4 (refused) — so until Abe says yes to Bea, Ben is
     nobody's brother here. After he does, Abe and Ben share an accepted parent and both appear. */
```

### ---------- EVERYONE, ON AN ADMIN'S PEOPLE COLUMN, AND ON NOBODY ELSE'S

top level, before `ad`

```
/* ---------- EVERYONE, ON AN ADMIN'S PEOPLE COLUMN, AND ON NOBODY ELSE'S ------------------------
     *"Admin should be able to see every one in the people column."* An admin's token is sent every
     student and client by id, and no private cell; a student, a parent and a stranger are sent
     nobody. The admin's own row is on `tutors`, so it is not repeated here. */
```

### THE REQUEST THAT BECOMES A LINK goes to the child it names and nobody else:

top level, before `claimsOf`

```
/* THE REQUEST THAT BECOMES A LINK goes to the child it names and nobody else: P-SA has Bea's
     unanswered "this is my child" (L3), P-SB has only a REFUSED one (L4), and a stranger naming
     P-SA in the URL has none. This is also the payload that used to be an error — see `claims`. */
```

### BY HER WHOLE NAME (docs/history/342, round 2).

top level, before `token`

```
/* BY HER WHOLE NAME (docs/history/342, round 2). 342 first cut it to "Bea" — a parent's surname goes to
     nobody but herself and an admin — and the claim card is the one place a child VETS a grown-up: a yes
     hands them her account. A stranger registering as "Bea <anything>" sent a card that read like her own
     parent's. The child on the row sees the whole name while it is asked (and once it is accepted);
     `check-surnames.js` holds that nobody else does. */
```

### 11. A STUDENT WITH NO EMAIL, THROUGH THE REAL `doPost`.

top level, before `f`

```
/* 11. A STUDENT WITH NO EMAIL, THROUGH THE REAL `doPost`.
   ASKED FOR AS *"i have a student who doesnt have an email ... so he can still login."* A row with a
   blank address signs in by its handle and PIN, an address-holder cannot be reached by handle, and a
   forgotten PIN is reset only when a parent has accepted the link — the child's old PIN stops
   working, an unlinked child's does not. */
```

### AND A ROW THAT HAS AN ADDRESS ANSWERS TO ITS HANDLE TOO — the reverse of what this said until "have the students be able to login with their handles too"*.

top level, before `viaHandle`

```
/* AND A ROW THAT HAS AN ADDRESS ANSWERS TO ITS HANDLE TOO — the reverse of what this said until
     *"have the students be able to login with their handles too"*. Same person either door: the
     handle and the address must hand back the same `personId`, or the handle door signs somebody in
     as somebody else. */
```

### AND THE OLD PIN STILL WORKS — the reverse of what this said until the emailed PIN went BESIDE the old one (`authResetUse_`):

top level, before `kitOld`

```
/* AND THE OLD PIN STILL WORKS — the reverse of what this said until the emailed PIN went BESIDE
     the old one (`authResetUse_`): anybody can type a child's handle into "Forgotten your PIN?", and
     it used to stop the child's PIN working at once. check-signin.js walks the emailed one. */
```

### 12. A PROFILE PICTURE, THROUGH THE REAL `doPost`.

top level, before `photos`

```
/* 12. A PROFILE PICTURE, THROUGH THE REAL `doPost`.
   ASKED FOR AS *"everyone should have a profile picture selector widget in account settings"*. The
   phone posts a square JPEG as a `data:` URL; `savePhoto` keeps it in Drive (`driveKeep_`, the helper
   `addPost` uses) and writes the address into `photo`. A Drive stood in for here: a folder that
   records what was put in it and whether it was shared, because a file only its owner can open is a
   broken square on every other phone. Four answers: it lands on YOUR row; a request naming somebody
   else still lands on yours; signed out is refused with nothing written; and something that is not a
   picture is refused with nothing written. And `remove` blanks the cell. */
```

### 12b. ONE OF THE ELEVEN, THROUGH THE REAL `doPost` AND `doGet`.

top level, before `pictures`

```
/* 12b. ONE OF THE ELEVEN, THROUGH THE REAL `doPost` AND `doGet`.
   THE OWNER, 10 Oct: *"everybody profile picture selector should have 10 basic profile pics like xbox dp
   selector, which allow you to use your avatar as a dp."* The grid posts `savePhoto` with `choice`; the
   `photo` cell takes the token. Asked of the sheet and of what `doGet` then sends:
     · every one of the eleven is KEPT, exactly, on the asker's own row — and the backend's list is the
       phone's list (`PFP_CHOICES` against `PFP_ART` in js/links.js), in order;
     · anything that is neither one of the eleven nor (on `updateProfile`) a link is REFUSED with the
       cell as it was — a link at the grid's door, an unknown picture, a bare name, markup;
     · the face reaches others: a tutor's token on `tutors`, with the figure beside it ONLY when the
       face is the figure;
     · A CHILD'S PRIVACY IS UNCHANGED: a child's choice reaches their family and the admin, who already
       see their face; the `students` list every student is sent carries exactly the keys it did, and
       a stranger is sent nothing of them; a dressed child's photograph does not reach the feed. */
```

### 12b, AND A CHILD WITH A SECOND ROLE IS STILL A CHILD.

top level, before `f`

```
/* 12b, AND A CHILD WITH A SECOND ROLE IS STILL A CHILD. Found by review on 10 Oct: the feed's guard asked
   `toAppRole(mainRole(pp)) === 'kid'`, and `mainRole` ranks tutor and client above student — so a dressed
   child who ticked Tutor in their own Settings (`setMyRoles`, self-serve, held PENDING and never listed)
   became "tutor, student", and their photograph went out as their post face to every visitor, where the
   old line had sent their wearable string. The cell above held `student` alone, so it stayed green. Asked
   twice: the child's own tick through the real `doPost`, and a row the sheet already holds as
   "student, client". Neither may put the photograph on the feed; the same child with no figure dressed
   keeps exactly what the old line sent (their link), so the rule is no stricter than it was. */
```

### 13. YOUR ROLES, THROUGH THE REAL `doPost` AND `doGet`.

top level, before `roleRules`

```
/* 13. YOUR ROLES, THROUGH THE REAL `doPost` AND `doGet`.
   ASKED FOR AS *"each account should have a widget in account settings which say what the roles are.
   they can be either a tutor or client or student. they can be tutor and client and student like
   multiselect."* `setMyRoles` is the card's one action, and every rule it keeps is asked here of the
   sheet afterwards rather than of the reply: it lands on YOUR row whoever is named; signed out is
   refused with nothing written; admin cannot be ticked, and an admin's own admin survives a save;
   none ticked is refused; a ticked Tutor is held at `listed = PENDING` — not sent to a visitor, sent
   to the admin marked, not bookable by name, unable to take an open session, unable to message as a
   tutor — until the admin's Listed switch says yes; a role is not dropped while a live session holds
   it; and a row that is only a student cannot make itself a client. */
```

### 14. THE DAYS NOBODY IS TAUGHT, THROUGH THE REAL `doGet`.

top level, before `closed`

```
/* 14. THE DAYS NOBODY IS TAUGHT, THROUGH THE REAL `doGet`.
   ASKED FOR as part of *"calander and time table and availability ... it seems they clash"*. The phone
   steps a booking's dates over `DATA.closures`, so what matters is what `doGet` puts in it: the bank
   holidays worked out for this year and next, an INSET day typed on the holidays tab, and a festive
   event the business is running — and NOT an observance nobody switched on, which is most of that
   tab and would otherwise cancel lessons on Valentine's Day. */
```

### 15. A BOOKING BY NAME, AGAINST THE TUTOR'S WEEK, THROUGH THE REAL `createJob`.

top level, before `hoursRules`

```
/* 15. A BOOKING BY NAME, AGAINST THE TUTOR'S WEEK, THROUGH THE REAL `createJob`.
   ASKED FOR AS *"tutor with no hours wont be bookable"*. The grey cells on the booking grid were
   advice: `createJob` wrote whatever hours it was sent. Now a named tutor is refused when they have
   ticked no hours at all, when an hour is outside their week, and when they are already teaching it
   in the weeks this booking runs — and a refusal writes no job. `No preference` books as before, and
   an older phone that sends no `slots` is checked off its `day` / `time` / `hours`. */
```

### 16. THE TIMETABLE, KEPT ON THE ACCOUNT, THROUGH THE REAL `doPost`.

top level, before `timetables`

```
/* 16. THE TIMETABLE, KEPT ON THE ACCOUNT, THROUGH THE REAL `doPost`.
   It lived on one phone. `saveTimetable` writes the `timetable` cell of the row the TOKEN resolves to
   (the docket's `savePerson`), so: it lands on yours; a request naming somebody else still lands on
   yours; signed out is refused with nothing written; something that is not the widget's shape is
   refused with nothing written; and the sign-in reply carries it back, which is how another phone
   gets it. */
```

### 17. A STUDENT'S TWO EXAM DATES REACH THE CALENDAR, ONCE EACH, THROUGH THE REAL `doGet`.

top level, before `examDates`

```
/* 17. A STUDENT'S TWO EXAM DATES REACH THE CALENDAR, ONCE EACH, THROUGH THE REAL `doGet`.
   `exam_small_date` and `exam_big_date` are written in Settings and the Calendar read only the exams
   tab. `doGet` merges the two cells into `exams` now — a mock and an exam — under the tab's own
   `maySee`, and a date the tab already holds for that person is the tab's row, not a second dot. */
```

### 17b. THE BUSINESS'S CUT OF AN EXTRA SEAT, PER TUTOR — AN ADMIN'S, AND BLANK IS NOT NOUGHT (docs/history/345).

top level, before `cutRules`

```
/* 17b. THE BUSINESS'S CUT OF AN EXTRA SEAT, PER TUTOR — AN ADMIN'S, AND BLANK IS NOT NOUGHT (docs/history/345).
   The owner, 12 Oct: *"Your cut off extra child for tutors should be editable on thir card."* The cut that was one
   config number is `extra_seat_cut` on each tutor's row: blank is the config default and nought is no cut. Asked of
   the real `doPost` and `doGet`: a tutor cannot set it, blank to nought included, and nothing is written; an admin
   can, on a tutor's row and on their own; out of range is refused for an admin too; blank and nought are stored
   and SENT as two different answers; and an admin moving it does not stamp the tutor's `pricing_changed_at` —
   that month is the tutor's, over what THEY charge. A tutor's own no-change Save of the page still saves. */
```

### 18. THE CARD: WHERE A TUTOR'S FIELDS ARE EDITED NOW, AND WHETHER EVERY ONE IS STILL SAVED (docs/history/330).

top level, before `cardRules`

```
/* 18. THE CARD: WHERE A TUTOR'S FIELDS ARE EDITED NOW, AND WHETHER EVERY ONE IS STILL SAVED (docs/history/330).
   The owner, 10 Oct: *"all of this stuff should be editable directly on the tutors card for that respective
   tutor."* The phone stopped drawing five Settings pages for anybody with a card and edits those fields on
   the card instead; the server's groups did not change, because they are the write allow-list as well as the
   layout. So this asks the PHONE'S OWN CODE — `CARD_SECTIONS`, `cardSettingsGroups_` and `cardChanged_`,
   cut out of js/me.js by name and run over the real `PROFILE_GROUPS` — and then the real `doPost`:
     · every field the card offers is one `updateProfile` lets a tutor write (a box nobody may write is a
       Save that silently drops it), and the session length it does not offer is still one nobody may write;
     · every field of the tutor groups is on the card or on a page Settings still draws — none is left with
       no box, which is what "every field still saved for every role that may write it" comes to;
     · the pages that go are exactly About you, Photos, the rate, Qualifications and the week;
     · a card's Save, built by `cardChanged_` (what moved, the three packed cells whole), round-trips for the
       tutor and for an admin on another tutor's card, and is refused to a tutor on somebody else's;
     · `getProfile`, which fills an admin's form, is an admin's and nobody else's. */
```

### SESSION LENGTH IS ON THE CARD AND WRITABLE (the review of 330: the brief listed it with the pricing fields, and nobody could write it).

top level, before `left`

```
/* SESSION LENGTH IS ON THE CARD AND WRITABLE (the review of 330: the brief listed it with the pricing
       fields, and nobody could write it). Both halves, because either alone is the bug: a box the server drops,
       or a writable field with no box anywhere. */
```

### ---------- EVERYBODY'S OWN CARD, SETTINGS AND THE TOOLS COLUMN: EVERY FIELD IN EXACTLY ONE PLACE (docs/history/339)

top level, before `libs`

```
/* ---------- EVERYBODY'S OWN CARD, SETTINGS AND THE TOOLS COLUMN: EVERY FIELD IN EXACTLY ONE PLACE (docs/history/339) ----------
       The owner, 11 Oct: *"move library card widget to the tools column … the random name generator should be one
       of the editable things in the profile settings of the profile card. your figure should also be in your
       profile card editing."* So for each of the three real maps, and for a tutor with a public card as well as
       for somebody without one, the phone's own code is asked where each field is drawn now: on the card's Edit
       (`cardSections_` as `ownCardSections_` calls it), on a Settings page (what `settingsPages_` keeps:
       `notLibrary_(cardSettingsGroups_(groups, onCard))`), or on Tools (`libFieldsOf_`, what `initLibCards_`
       draws). Every field the map lets that person write is in one of the three, none in two; the library
       fields are exactly the server's `LIBRARY_FIELDS` and none is on Settings; the card offers your figure and
       your handle, and to somebody with no public card only those, the picture and the name. */
```

### HOW LONG A SESSION IS, FROM THE CARD:

top level, before `hrs`

```
/* HOW LONG A SESSION IS, FROM THE CARD: written; NOT under the month's clock, which is running — the
         tutor moved the rate on a Settings page above, so a session length refused as "you changed what you
         charge" would be the clock reaching a field that is not the quote; and `hoursRefusal_` refuses a range
         nobody falls inside and a length off the list, writing nothing. */
```

