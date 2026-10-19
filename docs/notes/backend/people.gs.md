# backend/people.gs

The full text of comments in `backend/people.gs` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — 20_people.gs (3 of 8) WHO SOMEBODY IS, and what follows from that:

top level, before `rolesOf`

```
/* ==================================================================================================
   @family. — 20_people.gs   (3 of 8)

   WHO SOMEBODY IS, and what follows from that: roles, family links, avatars, and
   who may write to whom.

   `findPerson` is the important one. Identity used to be a name, and a name is an editable cell —
   so anything that wrote to the wrong row silently merged two accounts. It matches on `person_id`
   first, and a name only as a fallback.

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

### A person may hold SEVERAL roles — a parent who also tutors, an admin who teaches.

top level, before `rolesOf`

```
/* A person may hold SEVERAL roles — a parent who also tutors, an admin who teaches. The cell holds
   a comma list, and one role is not more real than another: every check below asks "does this
   person hold X", never "is this person an X", which is the difference that makes the second role
   work everywhere rather than only where somebody remembered it. */
```

### The other half of that cell:

top level, before `titlesOf`

```
/* The other half of that cell: the values that are TITLES rather than roles. `mainRole` picks from
   a declared list and cannot return one of these, and `hasRole` is only ever asked about a role
   somebody named — so without this they reach no screen at all, which is a fact typed into the
   sheet that nothing draws. Read off `ROLE_TITLES` rather than "anything mainRole did not pick",
   because that second rule would print a typo in the role cell as somebody's job title. */
```

### ---------- THE THREE SELF-CHOSEN ROLES, AS THE WIDGET SEES THEM

top level, before `selfRolesOf_`

```
/* ---------- THE THREE SELF-CHOSEN ROLES, AS THE WIDGET SEES THEM -----------------------------------
   Read through `SELF_ROLE_ALIASES`, so `parent` is Client. In `SELF_ROLES`' order, which is the
   order the card draws them and the order `setMyRoles` writes them. An empty cell is `['client']`
   because `rolesOf` says so — the default the whole site already treats an empty cell as. */
```

### ---------- WHAT A PERSON IS ALLOWED TO ACT AS, WHICH IS NOT ALWAYS WHAT THE CELL SAYS

top level, before `actingRole_`

```
/* ---------- WHAT A PERSON IS ALLOWED TO ACT AS, WHICH IS NOT ALWAYS WHAT THE CELL SAYS -------------
   `mainRole` picks the most privileged role in the cell, and the cell now takes a tick. So a pending
   tutor's `tutor` is set aside here, and what is left decides. NOTHING LEFT IS `student`, not
   `client`: `rolesOf`'s empty-cell default is right for a row nobody has filled in, and wrong for a
   person whose only claim is one nobody has checked — the least that somebody can do is the right
   answer while the business decides, and a student may reach the admin, which is who they need.
   MESSAGING READS THIS, both ways round — the one gate a tick would otherwise have opened on the
   spot (`tutor → client` is allowed and `student → tutor` is not). */
```

### ---------- THE SESSIONS SOMEBODY IS STILL SITTING IN AS A TUTOR, OR AS A CLIENT

top level, before `liveSeatsAs_`

```
/* ---------- THE SESSIONS SOMEBODY IS STILL SITTING IN AS A TUTOR, OR AS A CLIENT -------------------
   WHY UNTICKING HAS TO ASK. Who is in a session is folded from the events (`participantsOf`), not
   from the `role` cell, so dropping Tutor would not take anybody off a roster — it would leave a
   tutor teaching on Tuesday whose own app has stopped calling them one: no staff view, no tutor
   pages, and a family whose tutor reads as nobody. So `setMyRoles` refuses to drop a role while
   this finds a live seat held in it, and says how many.

   LIVE MEANS: a seat that is not Withdrawn, in a job that is not cancelled by its roster, not
   `ended` by `closeFinishedJobs`, and whose last date is not already behind us. Matched by display
   name because that is what an event's `actor` is (see `participantsOf`). */
```

### Find a person by ID FIRST, then by name.

top level, before `findPerson`

```
/**
 * Find a person by ID FIRST, then by name.
 *
 * Identity used to be the name, and a name is an editable field — so anything that wrote to the
 * wrong row, or renamed somebody, silently merged two accounts and there was nothing underneath
 * to tell them apart. `person_id` never changes and is never shown, so it can't be edited into a
 * collision. Names remain how people log in; they're just no longer what the site trusts.
 *
 * TWO ARGUMENTS, because eleven handlers already call it with two: `findPerson(body.name,
 * body.personId)`. It took one, so the id was accepted and thrown away — every one of those calls
 * has been matching on the name alone, which is precisely the identity this function exists to
 * stop relying on. The id is tried first when it is given.
 */
```

### ---------- AND AN E-MAIL ADDRESS, MATCHED AS AN ADDRESS RATHER THAN AS A NAME

in `findPerson`

```
/* ---------- AND AN E-MAIL ADDRESS, MATCHED AS AN ADDRESS RATHER THAN AS A NAME ------------------
     ASKED FOR AS *"i want people to be able to sign in with email as well."* (`verifyLogin` has
     since stopped calling this at all — it reads the `email` column alone; see there. The rung
     stays, because every other caller of this function may be handed an address.) `verifyLogin` resolved
     through this function and nothing else, so one rung here was the whole of it — and it is the
     last rung, after every name, so nothing that used to resolve can start resolving to somebody
     different.

     `norm` RATHER THAN `key`, AND THAT IS NOT TIDINESS. `key` strips everything that is not a letter
     or a digit, so `alex@dias.com` reduces to `alexdiascom` — and so does a person whose full name
     is "Alex Dias Com". Two different people, one key, and `changePin` then checks the PIN somebody
     typed against the other one's row: the denial this file already records happening once, for
     real, to one person. An address is a machine identifier rather than a name typed with variable
     spacing, so it is compared whole, case-folded and trimmed, and the `@` it must contain is what
     makes that collision impossible rather than merely unlikely.

     A BLANK CELL IS NOT A MATCH. Most rows on this tab have no e-mail; without the guard the first
     of them would answer to an empty search term, which `want` above already refuses — but `norm`
     is a different fold and would not. */
```

### AN E-MAIL ADDRESS THAT ALREADY ANSWERS TO SOMEBODY ELSE.

top level, before `emailRefusal_`

```
/* ==================================================================================================
   AN E-MAIL ADDRESS THAT ALREADY ANSWERS TO SOMEBODY ELSE.

   THE MOMENT AN ADDRESS CAN SIGN YOU IN, IT IS A CREDENTIAL, and two rows holding one is the
   `findPerson` denial with a new column in front of it: the first row wins, so the second person
   types their own address and their own PIN and is told the PIN is wrong — confidently, about the
   one thing they are certain of, with no way to argue. That happened once already, by accident,
   because a call forgot to send an id.

   BESIDE `handleRefusal` AND `pricingRefusal_` SO THAT SOMETHING CAN RUN IT. Written inline in
   `updateProfile` it is four lines nothing here can reach, and a rule with no check is the shape
   this repository records every time an instrument could not see its subject. Same three arguments,
   same sentence-not-a-boolean, same reason: "that is taken" is the only useful part.

   NOT A FORMAT CHECK. The box already refuses a shape the browser will not accept, and a stricter
   rule here would refuse real addresses — which is the failure this repository calls the worse of
   the two everywhere it marks an answer. This asks one question: does anybody else already answer
   to it. */
```

### ONE FUNCTION THAT SAYS WHY A HANDLE IS REFUSED, OR NOTHING AT ALL.

top level, before `handleFold_`

```
/* ==================================================================================================
   ONE FUNCTION THAT SAYS WHY A HANDLE IS REFUSED, OR NOTHING AT ALL.

   IT RETURNS A SENTENCE, NOT A BOOLEAN, and that is the whole shape. A handler that gets `false`
   back has to invent a reason, and the reason is the only useful part: "that is taken" and "you
   changed it a fortnight ago" and "no, not that word" are three completely different things to be
   told, and a person given the wrong one argues with the wrong thing.

   NOBODY TYPES A HANDLE ANY MORE, AND THE GATE STAYS. *"handles should be their name and a virtuous
   describing word. they can randomise it but it will follow that general name."* — so the box went
   and `handleMake_` is the only thing that asks. What it asks is unchanged: the shape, the reserved
   names, the blocklist (a first name can still carry a word, and the underscore is dropped before
   the fold, so a name and a virtue can meet across it) and the clash. The sentences are read by
   `check-handles.js` now rather than by a person, and they stay sentences for its reason: a case
   that fails should say WHICH rule refused, not that something did.
================================================================================================== */
```

### WHAT A HANDLE MEANS RATHER THAN HOW IT IS SPELLED.

top level, before `handleFold_`

```
/* WHAT A HANDLE MEANS RATHER THAN HOW IT IS SPELLED. Case, separators and the digits people
   substitute for letters all come out, so `F_4_G` and `fag` are one string before anything is
   compared. Leaving `0`→`o` and the rest in place would make the blocklist a list of spellings
   rather than a list of words, and a spelling is trivially worked around. */
```

### ---------- TWO FORMS, AND WHICH ONE EACH LINE BELOW USES IS THE WHOLE OF IT

in `handleTrouble_`

```
/* ---------- TWO FORMS, AND WHICH ONE EACH LINE BELOW USES IS THE WHOLE OF IT -------------------
     `shown` IS WHAT WAS ASKED ABOUT and is the only thing quoted back; `raw` is it folded, and every
     comparison in this function uses that. The generator only ever asks in lower case, but a row
     typed into the sheet by hand may say `HaLeX` — and because nothing here compares on the case,
     `halex` is still refused while `HaLeX` exists, which is the guard that stops two accounts
     rendering identically on a site children use. */
```

### THE ALLOW LIST IS CHECKED FIRST, or `analysis` never gets the chance.

in `handleTrouble_`

```
/* THE ALLOW LIST IS CHECKED FIRST, or `analysis` never gets the chance. A handle that IS one of
     these words, or is one of them with digits or underscores around it, is past the blocklist —
     but `analfun` is not, because it is not that word with decoration, it is a different word. */
```

### ---------- AND THE FIRST VERSION OF THIS LINE LET EVERY BANNED WORD THROUGH

in `handleTrouble_`

```
/* ---------- AND THE FIRST VERSION OF THIS LINE LET EVERY BANNED WORD THROUGH -------------------
     IT TESTED THE END WITH `folded.lastIndexOf(w) === folded.length - w.length`, and `lastIndexOf`
     answers -1 when the word is not there. So any handle exactly one character SHORTER than some
     allowed word made -1 === -1 and was waved past: `fuckface` is eight characters, `therapist` is
     nine, and that is the whole of it. Thirteen of the checked cases failed at once — `n1gg3r`
     included — on a rule that reads perfectly and is wrong by an off-by-one in a sentinel value.

     `check-handles.js` FOUND IT ON ITS FIRST RUN, which is the entire argument for writing the
     check before trusting the filter. Nothing about the behaviour was visible from reading it. */
```

### ---------- TAKEN, AND AGAINST ALL THREE COLUMNS

in `handleTrouble_`

```
/* ---------- TAKEN, AND AGAINST ALL THREE COLUMNS -----------------------------------------------
     `findPerson` matches `first + last` and `handle`, first row wins — so
     checking `handle` alone would let somebody take a name that already resolves to another person,
     and `changePin` would then check their PIN against that person's row. Everything `findPerson`
     can answer to, this refuses. */
```

### ---------- AND AGAINST EVERY HANDLE SOMEBODY ELSE USED TO HAVE (342)

in `handleTrouble_`

```
/* ---------- AND AGAINST EVERY HANDLE SOMEBODY ELSE USED TO HAVE (342) --------------------------
     AN OLD HANDLE STILL SIGNS ITS CHILD IN (`handleWasRows_`), so handing it to somebody else would
     be handing them a name a classmate's phone still types — and "who was @foo last week" would have
     two answers. Nothing asked this before: `handle_was` was a record, never a reservation, and
     Randomise could reissue yesterday's handle to the next child the same afternoon. Your OWN history
     is not a clash, as your own handle is not: going back to an old name is a true history. */
```

### ---------- AND NO MONTH, WHICH THERE USED TO BE

in `handleTrouble_`

```
/* ---------- AND NO MONTH, WHICH THERE USED TO BE ----------------------------------------------
     A thirty-day cooldown stood here, and its reason was the typed box: a blocklist is a floor
     rather than a ceiling, so somebody free to rename sits trying variations until a rude one gets
     past it, and a month per attempt is what made that a game nobody wins. With no box there is
     nothing to try variations OF — every handle is a first name and a word off a list somebody
     chose — so the brake has nothing left to brake, and a child who presses Randomise twice is
     simply looking for a word they like. `handle_was` still traces every change. */
```

### AND A HANDLE IS GENERATED RATHER THAN DERIVED FROM A CHILD'S NAME.

top level, before `HANDLE_ADJ`

```
/* ==================================================================================================
   AND A HANDLE IS GENERATED RATHER THAN DERIVED FROM A CHILD'S NAME.

   ASKED FOR AS *"each person should have randomly generated username, handle llik \"@_____\",
   email, first name, last name and username."*

   MEASURED FIRST, AND TWO THINGS WERE WRONG. `register` wrote
   `username: S(first + last).replace(/[^A-Za-z0-9]/g, '')` and **no `handle` at all** — so every
   account made through the form has a blank handle to this day, and `doGet`'s
   `handle || username || first_name` has been showing the squashed name instead.

   AND THAT USERNAME COLLIDES, WHICH IS NOT A TIDINESS FAULT. Two people called John Smith both get
   `JohnSmith`. `findPerson` matches `username` and returns the FIRST row, so the second person
   signs in as the first — and `changePin` then checks the PIN they typed against the other one's
   row and tells them their own PIN is wrong. This file records that denial happening for real, to
   one person, by accident. Nothing guarded it: `handleTrouble_` guarded the rename box of the day
   and was never reached by registration.

   WORDS RATHER THAN THE NAME, AND THAT IS THE SAFEGUARDING HALF. Most of the people on this tab are
   children. A handle built from a real child's full name publishes that name wherever the handle is
   shown — which is exactly what made `ticks_1/2/3` a leak rather than untidiness, and CLAUDE.md
   carries that entry in full. `BrightOtter42` is memorable, sayable down a phone, and says nothing
   about whose it is.

   NAME-PLUS-A-RANDOM-TAIL WAS THE OTHER CANDIDATE AND IT LOSES ON THAT ONE POINT ALONE. It is
   friendlier (`halexdias_4b` is guessable by its owner) and it still prints the child's name. The
   ask said randomly generated; the privacy argument says the same thing, so there is nothing to
   trade.

   `handleTrouble_` IS THE ONE GATE AND THIS GOES THROUGH IT. Shape, the reserved list, the
   blocklist and the clash against every column `findPerson` answers to — a generator with its own
   copy of any of that is the second reader this repository keeps finding.

   ONE COLUMN. `username` was `handle` written a second time and the people tab's redesign dropped
   it, so there is nothing to keep in step: `handle` is the only name a person has here besides
   their own, and the e-mail address is what they sign in with.
================================================================================================ */
```

### ---------- A HANDLE IS THEIR FIRST NAME, A VIRTUE AND A NUMBER, IN ANY ORDER

top level, before `HANDLE_ADJ`

```
/* ---------- A HANDLE IS THEIR FIRST NAME, A VIRTUE AND A NUMBER, IN ANY ORDER ---------------------
   ASKED FOR AS *"nobosy can actually change their handle specifically, they can just hit randomise.
   but it will always be like their first name, a virtuous adjective and random numbers and maybe an
   underscore. but all random order."* So a handle is three parts — the first name, one word off a
   list of virtues, and a two-digit number drawn fresh every time — laid out in one of
   `HANDLE_ORDERS`, with an underscore at one of the two joins about half the time: `halex_kind42`,
   `kindhalex42`, `halex42_kind`, `kind42halex`. All lower case.

   THIS REVERSES 1 OCTOBER, AND SAYS SO. The rule before this one was `<first>_<virtue>` with NO
   number, because `sam_kind10` beside `sam_kind` is one keystroke apart and reads as the same person
   (docs/history 222). The owner has now asked for the number on every handle, and the clash check
   is what still stands between two people who look alike: `handleTrouble_` compares by `key()`,
   which drops the underscore, so `halexkind42` is refused while `halex_kind42` exists. What it does
   NOT refuse is `kindhalex42` beside `halex_kind42` — the same three parts in another order. That
   takes a second Halex who drew the same word AND the same number, and it is the owner's call.

   THE DIGITS ARE NEVER FIRST, which is `HANDLE_SHAPE`'s rule rather than taste: a handle starts with
   a letter. So of the six orders of three parts only the four in `HANDLE_ORDERS` are drawn.

   ONE UNDERSCORE AT MOST, AND THAT IS ARITHMETIC. `HANDLE_SHAPE` allows twenty characters: the
   longest word (8), the number (2) and one underscore leave `HANDLE_FIRST_MAX` = 9 for the name. A
   second underscore would cut every name a letter shorter for a separator nobody asked for — "maybe
   an underscore". Nine keeps `Alexander`, `Charlotte`, `Elizabeth` and `Sebastian` whole, and every
   letter a word gains is a letter cut off a child's name, which is why `thoughtful`, `courageous`
   and `considerate` are not on the list. The first name must START with a letter, so leading digits
   come off; a name with no ASCII letters left (another script) falls back to `HANDLE_FALLBACK`.

   EXISTING HANDLES ARE NOT REGENERATED. A `halex_kind` made on 1 October is still the shape — see
   `handleParts_`, which reads every arrangement and the old two-part one — so `?run=renameHandles`
   leaves it alone, and nobody's sign-in name moves until they press Randomise themselves. That
   matters because a child with no e-mail signs in WITH the handle.

   THE FIRST NAME REVERSES A SAFEGUARDING ARGUMENT THIS FILE USED TO MAKE, AND SAYS SO. The older
   generator used words rather than the name because a handle built from a child's FULL name
   publishes it wherever the handle is shown. A FIRST name is what the owner asked for, three times
   now, and is much less than a full name, and cards already draw it — but it is not nothing, and it
   is the owner's call rather than this file's.

   EVERY WORD IS A VIRTUE A PARENT WOULD BE HAPPY TO SEE BESIDE THEIR CHILD'S NAME, and nothing else
   is: no colour, no mood, no luck. That is a judgement and it is written here because no check can
   make it. What a check CAN make is the rest — `check-handles.js` puts every word, in every order
   and with every number, through `handleTrouble_` beside a spread of first names, because the
   blocklist folds digits onto letters and drops the underscore, so a name, a number and a word can
   meet across the joins. Those are refused and the generator draws again, which is why it walks
   rather than draws once.

   THE FALLBACK IS ALSO WHERE A FIRST NAME THE BLOCKLIST REFUSES GOES. Every candidate built on it
   carries the refused word, so every draw fails; the same walk is then made on the fallback, which
   keeps the shape asked for with a neutral word where the name would be. */
```

### THE NUMBER: ten to ninety-nine, so it is always two digits.

top level, before `HANDLE_TAIL_MIN`

```
/* THE NUMBER: ten to ninety-nine, so it is always two digits. A single digit would make `kind7` and
   `kind70` two handles one keystroke apart, and a fixed width is what lets `handleParts_` find
   where a name that ends in a digit stops. */
```

### THE ORDERS A HANDLE IS DRAWN IN — every arrangement of the three parts that does not start with the number.

top level, before `HANDLE_ORDERS`

```
/* THE ORDERS A HANDLE IS DRAWN IN — every arrangement of the three parts that does not start with
   the number. Named once, because the generator draws from it and `handleParts_` reads by it, and
   two lists of one rule are two rules the day one of them changes. */
```

### HOW MANY CANDIDATES A HEAD GETS before the walk moves to the fallback:

top level, before `HANDLE_TRIES`

```
/* HOW MANY CANDIDATES A HEAD GETS before the walk moves to the fallback: every word on the list
   twice, each with its own number, order and underscore. With 4 orders × 90 numbers × 3 joins per
   word nothing on an ordinary tab is close to running out — the bound is there so a gate that has
   started refusing everything is reported rather than spun on. */
```

### HOW MANY EARLIER HANDLES `handle_was` MAY HOLD BEFORE RANDOMISE STOPS — AND NONE IS EVER DROPPED.

top level, before `HANDLE_WAS_MAX`

```
/* HOW MANY EARLIER HANDLES `handle_was` MAY HOLD BEFORE RANDOMISE STOPS — AND NONE IS EVER DROPPED.
   IT WAS `HANDLE_WAS_KEEP = 10`, a trim: the cell kept the newest ten, which was enough to answer "who
   was @foo last week" while the column was only a RECORD. Since 342 every entry is a CREDENTIAL (an old
   handle still signs its person in, `handleWasRows_`) and a RESERVATION (`handleTrouble_` never hands one
   to anybody else) — so the trim retired both at the eleventh press. The review measured it: a child
   moved by `?run=kidHandles` who then pressed Randomise ten times lost the handle on her parent's slip,
   and it became free to give to a grown-up with the same first name, whose wrong tries the child's next
   attempt would then count. A credential is not retired by tidying a cell.
   So `handleWasWith_` keeps every entry, and `randomiseHandle` refuses once the history holds this many
   — two hundred presses, about four thousand characters against the fifty thousand a cell takes. The two
   admin jobs (`renameHandles`, `kidHandles`) may each add one past it; they run once. */
```

### A CHILD'S HANDLE IS THEIR INITIALS AND FOUR DIGITS, AND NOTHING ELSE ABOUT THEM (docs/history/342)

top level, before `HANDLE_KID_DIGITS`

```
/* ==================================================================================================
   A CHILD'S HANDLE IS THEIR INITIALS AND FOUR DIGITS, AND NOTHING ELSE ABOUT THEM (docs/history/342)

   THE OWNER, 11 OCT: *"Change usernames to be more abstract to hide the names of kids. Just use
   initials and some combination which comes from date of birth or something. Also don't show surname
   as some kids have different surnames and gets a bit awkward. Maybe"*

   THIS REVERSES 2 OCTOBER FOR CHILDREN, AND SAYS SO. A handle was the first name, a virtue and a
   number — `halex_kind42` — because the owner asked for it three times, and the note above already
   said the first name "is not nothing". It is shown to every other child on the score board, under
   every post and comment, on every family card and in every roster, and a child's first name beside a
   school, a tutor's name and a day of the week is most of what finding them takes. So a CHILD — the
   one test 333 uses, `isChild_` — gets `ej4827`: the first letter of the first name and of the last
   name, then four digits. A grown-up's handle is unchanged; it is the owner's shape for a reason that
   still holds for them, and a parent is not who this is about.

   THE DIGITS ARE RANDOM, NOT THE BIRTHDAY, AND THAT IS THE ONE PART OF THE ASK NOT TAKEN. *"Something
   which comes from date of birth"* would print a fact about a child on every screen their handle is on
   — a birthday is what a stranger asks a child for, and with the initials beside it it is most of a
   child's identity. A random tail is as memorable to its owner, and says nothing.

   ONLY 2 TO 9 (`HANDLE_KID_DIGITS`). No 0 or 1, so a handle read off a screen or down a phone is never
   `o`-or-`0`, `l`-or-`1` — and so no tail can READ as a date either: a year needs a 0 or a 1 (19xx,
   20xx), a month needs one (01–12), so four digits from 2–9 are never a year, a dd/mm or an mm/dd. A
   child who sees `ej2914` would wonder whose birthday it was; `ej4827` they cannot.

   FOUR OF THEM, NO SEPARATOR. 8⁴ = 4096 tails for each pair of initials, so two children with the same
   initials on an ordinary tab are nowhere near running out; `handleTrouble_` still asks every candidate
   (shape, blocklist — a digit folds onto a letter, so `ti75…` reads as a word and is drawn again —
   reserved, and the clash against every handle and every OLD handle on the tab). An underscore would
   be one more thing to say down the phone for nothing.

   INITIALS FROM THE FIRST LETTER OF EACH NAME, folded to a–z (`Émile` → e, `Łukasz` → l). A name whose
   first letter is not a Latin letter after folding gives no initial; a child with one usable initial
   gets one (`e4827`); with none, `HANDLE_FALLBACK` stands where the initials would (`friend4827`) — the
   grown-ups' rule for a name the handle cannot carry. RANDOMISE KEEPS THE INITIALS AND DRAWS A NEW
   TAIL: the initials are the child's, the tail is the only choice there is.

   WHAT THE INITIALS STILL SAY, said plainly — and the first draft of this said it too narrowly. THE
   SECOND LETTER IS HER SURNAME'S FIRST, AND IT GOES WHEREVER HER HANDLE GOES, BESIDE HER FIRST NAME: the
   score board every signed-in account reads (and registration is open, so that is anybody who signs
   up), every post and comment of hers that a signed-out visitor's payload carries, every family card
   and roster. So the whole of what a stranger can learn is "Wren Q." — not only when a second Wren is
   on the sheet (`Wren (@wq4827)`), as this first said; the review measured it. Before 342 the same
   places carried `wren_kind43`, which held no part of the surname, so this NARROWS 333's "a child's
   surname goes to nobody" to "its first letter goes with her handle", and note 333 says so.
   KEPT KNOWINGLY: *"just use initials"* is the owner's ask and the main session's decision, a first
   name and a surname initial is the convention schools use for exactly this, and the initial is the one
   thing about her that tells two Wrens' handles apart to the children who know them. The other way —
   the first initial alone (`w4827`) — is one change in `handleKid_` and `handleKidShaped_` if that call
   is ever made the other way. */
```

### HOW MANY TAILS A HEAD IS TRIED WITH before the fallback, and then the fallback as many again.

top level, before `HANDLE_KID_TRIES`

```
/* HOW MANY TAILS A HEAD IS TRIED WITH before the fallback, and then the fallback as many again. The
   worst pair of initials loses about one tail in eight to the blocklist's folds (measured over every
   pair and all 4096 tails by `check-handles.js`: `fa`, 13%), so sixty misses in a row is not a thing a
   real tab does; the bound is there so a gate that has started refusing everything is reported rather
   than spun on. */
```

### The pieces of a handle in the generated shape — `{ head, word, tail, order }` — or null.

top level, before `handleParts_`

```
/** The pieces of a handle in the generated shape — `{ head, word, tail, order }` — or null.
    Any order in `HANDLE_ORDERS`, AND the two-part `<first>_<virtue>` of 1 October with or without
    its old tail, which is what keeps every handle made before this reading as the shape. One
    underscore at most, at a join; the fallback where the name would be.

    ONE READER, because `handleIsShaped_` and `renameHandles` both need it and two regexes for one
    shape are two shapes the day one of them changes. BUILT FROM THE LISTS rather than written as a
    pattern of letters: `kindhalex42` has no separator to split on, so the only way to find where the
    virtue ends is to know the virtues — and a regex of alternatives backtracks, so a first name that
    is itself on the list (somebody called True) is still read the right way round. */
```

### Does `h` already have the generated shape for somebody called `first`?

top level, before `handleIsShaped_`

```
/** Does `h` already have the generated shape for somebody called `first`? Every arrangement, the
    1 October `<first>_<virtue>` — and, since 342, a child's initials and tail (`handleKidShaped_`).
    `?run=renameHandles` leaves all of them alone: a grown-up who was a child keeps the handle they
    sign in with until THEY press Randomise, which then gives a grown-up's. Moving a sign-in name
    nobody asked to move is the lock-out every job here is written to avoid. */
```

### ---------- A CHILD'S INITIALS: the first letter of the first name and of the last, folded to a–z

top level, before `handleInitials_`

```
/* ---------- A CHILD'S INITIALS: the first letter of the first name and of the last, folded to a–z ------
   '' when neither has one. The FIRST LETTER, not the first a–z letter: `Łukasz`'s initial is `l`, never
   the `u` a search for a Latin letter would find two characters in. */
```

### Is `h` in a child's shape — one or two letters (or the fallback) and a tail?

top level, before `handleKidShaped_`

```
/** Is `h` in a child's shape — one or two letters (or the fallback) and a tail? What `kidHandles` leaves
    alone, and what `renameHandles` leaves a grown-up who was a child.
    ANY INITIALS, NOT THIS ROW'S. It asked for the initials of the names on the row TODAY, so a child
    whose surname was added or corrected after the move was moved again by the next run (the review,
    "a later run moves a child whose name changed"): a sign-in name changed that nobody asked to change,
    over a letter. A handle of initials and a tail carries no more of a name than its initials did on
    the day it was made, so it is left; Randomise draws one from the names as they are now. */
```

### ---------- THE ROWS AN OLD HANDLE STILL SIGNS IN (342)

top level, before `handleWasRows_`

```
/* ---------- THE ROWS AN OLD HANDLE STILL SIGNS IN (342) -------------------------------------------------
   A CHILD WHOSE HANDLE WAS MOVED MUST NOT BE LOCKED OUT BY IT. Seven of eight children on the live sheet
   have no email and sign in with the handle, and the slip a parent wrote it on, the sign-in box the
   phone remembers and the friend who knows it all say the old one. So the old one keeps working — asked
   ONLY when no row holds what was typed as its CURRENT handle (`handleRows_` first, in `verifyLogin` and
   `forgotPin`): a handle somebody has now always wins over one somebody had, so an old entry can never
   sign in a DIFFERENT person who holds that handle today. Two rows with it in their histories is
   refused, as two rows on one handle is. `handleTrouble_` refuses to reissue any old handle, so after
   342 that second case only comes from the sheet typed by hand. */
```

### EACH ENTRY ANSWERS AS A CURRENT HANDLE DOES (`handleAnswers_`) — exactly, or with a long first name spelled out where the handle keeps nine letters of it.

top level, before `handleWasRows_`

```
/* EACH ENTRY ANSWERS AS A CURRENT HANDLE DOES (`handleAnswers_`) — exactly, or with a long first name
   spelled out where the handle keeps nine letters of it. It compared `key(w) === key(typed)` alone, so
   the review's Christopher, who had always typed `christopher_kind42` for `christoph_kind42`, was let in
   the day before the move and refused the day after it, at the sign-in box and at "Forgotten your PIN?"
   both: a lock-out the move itself caused. One matcher for the handle and for every old one, so a
   spelling one of them answers to the other does too. */
```

### ---------- AND EVERY `friends` LIST THAT NAMED AN OLD HANDLE, MOVED TO THE NEW ONE (342)

top level, before `handleFriendsMove_`

```
/* ---------- AND EVERY `friends` LIST THAT NAMED AN OLD HANDLE, MOVED TO THE NEW ONE (342) ----------------
   `friends` IS A COMMA LIST OF HANDLES on the person's own row, drawn by matching `students[].handle` —
   so a handle that moves leaves its friend off every list it was on, silently. Randomise did that from
   the day it existed; moving every child's handle at once would do it to every list on the tab. `moves`
   is `{ key(old): new }`. Returns how many cells changed. */
```

### ---------- THE ROWS A TYPED HANDLE IS, FOR SIGNING IN AND FOR A FORGOTTEN PIN

top level, before `handleRows_`

```
/* ---------- THE ROWS A TYPED HANDLE IS, FOR SIGNING IN AND FOR A FORGOTTEN PIN ----------------------
   ONE READER FOR THE TWO DOORS THAT TAKE A HANDLE, because `verifyLogin` and `forgotPin` each had the
   line and a fix made in one would not be in the other. `key` folds case and drops `_` and `@`, so
   `@Halex_Kind42` and `halexkind42` are one handle.

   AND A LONG FIRST NAME SPELLED OUT. `handleFirst_` keeps nine letters, so Christopher is
   `uprightchristoph_71` — and a child types their own name the way they spell it, and
   `uprightchristopher_71` was "Sign in with the email on your account — or your handle". The same
   handle with the whole first name where the nine letters are answers too. It is the same person's
   name, so it opens nobody else's row; and it is asked only of a row whose handle IS in the shape,
   so a handle somebody typed by hand is compared as it stands. */
```

### ONE HANDLE AGAINST WHAT WAS TYPED (`want`, already through `key`), for somebody called `first`:

top level, before `handleAnswers_`

```
/* ONE HANDLE AGAINST WHAT WAS TYPED (`want`, already through `key`), for somebody called `first`: the
   same handle, or the same handle with the whole first name where its nine letters are. Lifted out of
   `handleRows_` (342) so an OLD handle answers to exactly what it answered to the day it was current
   (`handleWasRows_`) — the rule written once rather than twice. A prefix, a part, a near miss is not a
   handle: only the whole key, either way. */
```

### A handle nobody has, or '' if one could not be found.

top level, before `handleMake_`

```
/**
 * A handle nobody has, or '' if one could not be found.
 *
 * `me` is the row it is FOR, so that row's own cells are not counted as a clash — pass null for a
 * row that does not exist yet. `first` is the first name to build it from; left out, it is read off
 * `me`. `avoid` is a handle it must not hand back — the one somebody pressing Randomise already
 * has, which the clash check cannot refuse because it is their own. Nothing is written here: the
 * caller decides, because `register` writes it into a row it is building and the others into one
 * that exists.
 *
 * A FRESH DRAW EVERY TIME, NOT THE SMALLEST FREE NUMBER. The walk is the words in a random order,
 * round twice (`HANDLE_TRIES`), each candidate with its own number, order and underscore — for the
 * name and then the fallback. It gives up rather than looping: a gate that has started refusing
 * everything is a fault to report, not to spin on.
 */
```

### A CHILD'S IS THEIR INITIALS AND A TAIL (342) — `isChild_`, the one test 333 uses, asked of the row

in `handleMake_`

```
/* A CHILD'S IS THEIR INITIALS AND A TAIL (342) — `isChild_`, the one test 333 uses, asked of the row
     (or of the draft a caller hands in before the row exists: `{ role, first_name, last_name }`). No row
     is a grown-up's, which is what `acceptInvite` makes. `first` is not read for a child: initials need
     both names, and both are on the row. */
```

### `handleBareFree_` WAS HERE.

top level, before `handleWasWith_`

```
/* `handleBareFree_` WAS HERE. It asked whether a handle WITHOUT a number was free, because on
   1 October a number was only right when every bare word was taken and `renameHandles` stripped
   one that was no longer needed. A number is on every handle now, so that question would strip the
   number off every handle Randomise makes — it went rather than stay as a rule nothing should ask. */
```

### `handle_was` with `was` added at the front:

top level, before `handleWasWith_`

```
/** `handle_was` with `was` added at the front: newest first, comma-separated, EVERY ONE KEPT (see
    `HANDLE_WAS_MAX` — an entry still signs its person in, so none is trimmed). Nothing is de-duplicated
    — a history that says somebody went back to an earlier handle is a true history — except `was`
    already at the front, which is no change at all: a `kidHandles` run that wrote the history and failed
    before the handle (342, the review's "a failure between the two writes") writes it again when it is
    re-run, and the second copy would say the child had that handle twice in a row. */
```

### ---------- A HANDLE THE SERVER MOVES KEEPS THE FACE IT DREW (342, after review round 2)

top level, before `FACE_SKINS`

```
/* ---------- A HANDLE THE SERVER MOVES KEEPS THE FACE IT DREW (342, after review round 2) -------------------------
   A FIGURE NOBODY DRESSED IS WORKED OUT FROM THE HANDLE. A blank `avatar` cell is drawn by `avatarConfig`
   (js/links.js) with its skin and hair colour picked by `hashOf(handle)` — *"Seeded by their handle, so it is
   theirs and never changes on its own"* — on the person's own You card and wardrobe always, and to everybody
   else once their picture is the figure (`faceFig_`). So `?run=kidHandles` gave every child who never chose a
   look a different figure — a different SKIN TONE, and nothing in the preview said so. On the Ledger snapshot
   that was all eight children (the review, round 2: a dark face with dark purple hair came out pale, with
   brown). Randomise did it to anybody with a blank look, as long as Randomise has existed; `fix-card-settings`
   (note 339) met it there and keeps the face on the phone (`avatarKeep_`), which reaches neither this job nor
   a phone that learns its handle from a sign-in or from `myProfile`.
   SO EVERY HANDLE THE SERVER MOVES WRITES THE LOOK THE OLD ONE DREW into the blank cell, in the write before the
   handle (`kidHandles`, `randomiseHandle`, `renameHandles`): the face changes when somebody changes it in the
   wardrobe, never because a handle moved. In `saveAvatar`'s packed shape — every slot at its default (the free
   items `avatarConfig` starts from), the two colours the old handle hashed to, shirt 0 — so the wardrobe opens
   on exactly the figure that was there. A look somebody chose names its own colours and is left alone; a row
   with no handle was drawn from its NAME, which is a different string to every viewer, so there is no one face
   to keep and nothing is written.
   `FACE_SKINS` AND `FACE_HAIRS` ARE THE LENGTHS OF `AV_SKIN` AND `AV_HAIR` in js/links.js, and the hash is
   core.js's `hashOf` (FNV-1a) line for line. Two copies of one rule is what this repository usually refuses;
   it is here because the server cannot read the phone's files, and `check-signin.js` holds the two together:
   it draws the kept look with the phone's own `avatarConfig` and the old handle with it too, and they must be
   one face. */
```

### AND WHAT A TUTOR CHARGES MOVES ONCE A MONTH, ALL FOUR FIELDS TOGETHER.

top level, before `pricingMoved_`

```
/* ==================================================================================================
   AND WHAT A TUTOR CHARGES MOVES ONCE A MONTH, ALL FOUR FIELDS TOGETHER.

   ASKED FOR AS *"only let tutors change thier rate, min number of kids and max number of kids willing
   to work with and fraction extra rate all together. and they can only change once a month."* None of
   the four is a preference: `priceFrom` builds the price from `rate_per_hour` and `extra_seat_rate`,
   `seatLimits` offers the seat count from `max_students` and `min_students`, and every booking already
   taken was priced and seated against whatever they said on the day.

   ONE CLOCK FOR THE FOUR, WHICH IS WHAT *"ALL TOGETHER"* MEANS. A stamp each would be four clocks and
   a tutor could walk round them a week at a time — raise the rate on Monday, the extra-seat fraction
   next Monday — which is the arms race the handle cooldown was written against while a handle could
   be typed (it went with the box; see `handleTrouble_`, and these four ARE typed). `PRICING_FIELDS`
   in `constants.gs` is that list, and `PROFILE_GROUPS` builds the one page from the same constant, so
   the page and this rule cannot disagree about which fields are the quote.

   A FUNCTION BESIDE `handleRefusal` RATHER THAN SIX LINES INSIDE `updateProfile`, and that is about
   what can be CHECKED. `check-handles.js` cuts functions out of these files by name and runs them;
   a rule written inside a request handler is a rule nothing here can reach, and this repository's
   own sentence is that a check which cannot reach its subject is not a check. Same file as the
   handle rule and the same shape — the row and what is wanted, plus here whether the asker is an
   admin, which the handle rule stopped needing when its cooldown went — so the two read alike.

   IT TAKES THE WHOLE `fields` OBJECT WHERE THE HANDLE RULE TAKES ONE VALUE, because the question is
   *has any of the four moved* and only the posted object can answer it.

   AND IT ANSWERS '' FOR A CHANGE THAT IS NOT ONE. That page posts all four every time it is saved,
   whether or not any was touched, so a rule firing on a field being PRESENT would refuse a save of
   the boxes beside it for a month over a number nobody edited. That is the fault this handler already
   paid for once, where a blank box was written back over every profile field on the first press of
   Save — and it is why `pricingMoved_` compares values rather than counting keys.
================================================================================================== */
```

### TWO SHAPES THE PRICE CANNOT USE, refused for an admin too.

in `pricingRefusal_`

```
/* TWO SHAPES THE PRICE CANNOT USE, refused for an admin too. `seatShare_` reads the extra-seat
     figure as a SHARE of the rate and treats anything outside 0–2 as nothing, so `15` typed as
     pounds saved without complaint and charged nothing per seat. And a minimum above the maximum is
     a class nobody can book. Only when something moved, like the rule below. */
```

### THE BUSINESS'S CUT OF AN EXTRA SEAT, PER TUTOR — AN ADMIN'S TO SET, AND ONE READER FOR WHAT IS SENT.

top level, before `seatCutOut_`

```
/* ==================================================================================================
   THE BUSINESS'S CUT OF AN EXTRA SEAT, PER TUTOR — AN ADMIN'S TO SET, AND ONE READER FOR WHAT IS SENT.

   THE OWNER, 12 Oct: *"Your cut off extra child for tutors should be editable on thir card. Like they can
   edit that small number to the right of their normal rate"* (docs/history/345). The number to the right of
   the rate is `+£X/h a seat`, which is the rate times the tutor's share plus the business's — and the
   business's was ONE config number (`B`, Settings' "Your cut of an extra child") for every tutor. It is
   `extra_seat_cut` on each tutor's row now, edited on their card, and the config `B` is what a BLANK cell
   means, so a sheet nobody has typed into prices exactly as it did.

   `seatCutOut_` IS WHAT `doGet` SENDS: '' for a blank cell — "use the default" — and the number otherwise.
   NOT `N()` alone, which turns a blank into nought, and nought here is a different answer: no cut at all,
   the tutor keeps the whole of the seat. ONLY A PLAIN DECIMAL FROM 0 TO 2 IS A CUT; anything else states no
   decision the price can use, so it is sent as blank, the default: a typo in the sheet must not quietly take
   the business's margin to nothing. That held only for words until the review of 345 — "10" typed by hand
   meaning ten per cent, or "-0.1", went out as the number and `seatShare_` priced it as NO cut; and "£0.10"
   was priced as 0.1 by this while the health card called it "no cut" and an admin's own write of it was
   refused. One reading now, and the health card (`dataProblems`, setup.gs) asks this function too.
   AND THE PATTERN IS THE PARSER, `Number()` OVER A STRING THAT PASSED IT. This tested with `Number()` and sent
   with `N()`'s `parseFloat`, and the two disagree on exactly the strings a person would craft: `Number('0x1')`
   is 1 and `parseFloat('0x1')` is 0, likewise "0b10" and "0o2". So a tutor's post of "0x1" over an admin's
   cut of 1 looked unchanged to the refusal below, was written, and went to every phone as 0 — no cut, for
   that tutor, by that tutor (measured through the real `doPost`). A string the pattern refuses is no cut of
   anybody's, and the phone reads it the same way (`seatCutOf_`, js/core.js).

   `seatCutRefusal_` IS ASKED BEFORE ANYTHING IS WRITTEN, beside `pricingRefusal_` and in its shape (the row,
   the wanted-only fields, whether the TOKEN's row is an admin), so a check can cut it out by name. Three
   answers, and only when the value MOVED — the rate page and the card post every box on a no-change Save, and
   a rule firing on a value being present would refuse a tutor's headline over a number they never touched:
     · moved by anybody but an admin — refused. A tutor deciding the business's margin is the one thing this
       column must not allow; the card does not offer them the box, and the server does not trust the card.
     · a value `seatShare_` (js/core.js) would not read as a share — refused, an admin included. Above 2 is
       pounds typed into a fraction, which the price would silently read as nothing.
     · blank, nought, or a share above 0 up to 2 — allowed.
   "MOVED" IS THE CELL ITSELF, OR THE SAME CUT WRITTEN TWO WAYS — and the second is asked of `seatCutOut_`, the
   one reading, never of a second parser. Blank → 0 takes the cut away and is a change; '0.10' → 0.1 is the same
   cut written twice and is not; anything `seatCutOut_` does not read as a cut is a change unless it is the very
   cell that is there, so a tutor can neither write "0x1" over a 1 nor tidy an admin's cell into another
   spelling. And it starts no month's clock: that clock is the TUTOR's, on what THEY charge, and this is not
   theirs to move (`SEAT_CUT_FIELD`, constants.gs).
================================================================================================== */
```

### THE AGES A TUTOR TEACHES — ONE READER, AND A REFUSAL ASKED BEFORE ANYTHING IS WRITTEN.

top level, before `ageRank_`

```
/* ==================================================================================================
   THE AGES A TUTOR TEACHES — ONE READER, AND A REFUSAL ASKED BEFORE ANYTHING IS WRITTEN.

   `ageRank_` TURNS A CELL INTO SOMETHING THAT CAN BE COMPARED: a whole number, `Infinity` for an adult
   learner, `null` for an end nobody has answered, and `NaN` for a cell holding something else. The
   word is read loosely — `adults`, `Adult` and `18+` all mean the same thing when typed into the sheet
   by hand — because a reader that only knew the form's own spelling would print a hand-typed row as
   nothing. NOUGHT IS UNANSWERED, NOT AN AGE: a blank numeric cell reads as 0 in more than one place in
   this project, and "age 0" on a public card is the `cost: 0` shape again.

   `ageOut_` IS WHAT THE PAYLOAD SENDS: the number, `Adults`, or '' — so the phone's card never has to
   know there was ever a second spelling.

   `ageRefusal_` IS ASKED ONLY WHEN AN END MOVED, which is `pricingMoved_`'s rule and for its reason:
   About you posts both ends on every save, and the select keeps a hand-typed value that is not on the
   list as its own first option. A rule firing on a value being PRESENT would refuse a headline because
   somebody once typed "3" into the sheet. What moved must be on `AGE_OPTIONS` — the form cannot
   produce anything else, which is not a reason to trust it, since `doPost` is reachable by anybody
   with the URL — and the youngest may not be older than the oldest. An admin is not exempt: neither
   rule is a brake on a person, both are about whether the range means anything.

   BESIDE `pricingRefusal_` RATHER THAN INSIDE `updateProfile`, so `check-profile.js` reaches it
   through the real `doPost` and something can say it works.
================================================================================================== */
```

### ---------- HOW LONG A SESSION IS — `ageRefusal_`'S RULE FOR THE OTHER RANGE ON THE CARD

top level, before `hoursRank_`

```
/* ---------- HOW LONG A SESSION IS — `ageRefusal_`'S RULE FOR THE OTHER RANGE ON THE CARD ------------------
   WRITABLE SINCE docs/history/330, when the tutor's card became where they edit it (`SESSION_FIELDS` in
   constants.gs says why). ASKED ONLY WHEN AN END MOVED, for `ageRefusal_`'s reason: the card's Save posts only
   what changed, but a Settings page posts every box, and a hand-typed `1.5` in the sheet must not refuse a
   rate somebody else changed. What moved must be blank or on `SESSION_OPTIONS`, and the shortest may not be
   longer than the longest. A blank shortest reads as one, which is what `doGet` sends (`N() || 1`); a blank
   longest is no limit. An admin is not exempt — both rules are about whether the range means anything. */
```

### ---------- `countTicks` WAS HERE

top level, before `brandName`

```
/* ---------- `countTicks` WAS HERE ----------------------------------------------------------------
   IT COUNTED A PERSON'S HANDLE across `ticks_1..3` on every document row, and it was right to: the
   version before it counted the same three column names on the PERSON'S row, which nothing has ever
   written to, so a student could work through the whole library and the total stayed 0 for ever.

   BOTH TABS ARE NOW WRONG PLACES TO LOOK. The document rows left the spreadsheet with the rest of
   `questions`, and the three tick columns were stripped out of `data/questions.json` before it was
   committed — they held the handles of real children and this repository is public. So there is
   nothing to count, and the two callers (`redeem`, and `ticks:` on the login reply) are gone rather
   than being handed a permanent zero. See dopost.gs for both. */
```

### THE NAME CAME OFF THE `brand` TAB AND THAT TAB IS `data/settings/brand.json` NOW.

in `brandName`

```
/* THE NAME CAME OFF THE `brand` TAB AND THAT TAB IS `data/settings/brand.json` NOW. The phone
     reads it; this cannot, because Apps Script has no way into a file in git. `BRAND_NAME` is the
     same string the fallback always was, in one place, so an e-mail and a post signature cannot
     disagree — and changing it is the one line in constants.gs rather than a cell. */
```

### `toSheetRole` was here — the way back from the app's words to the sheet's, `parent` to `client`.

top level, before `acceptedLinks`

```
/* `toSheetRole` was here — the way back from the app's words to the sheet's, `parent` to `client`.
   Written as the pair of `toAppRole` for symmetry and never needed: values travel sheet-to-app and
   are written back by name, never translated in reverse. `ROLE_FROM_APP` stays in the constants,
   which is where the mapping belongs if it is ever wanted. */
```

### ---------- WHO IS RELATED TO WHOM

top level, before `acceptedLinks`

```
/* ---------- WHO IS RELATED TO WHOM -------------------------------------------------------------
   Read from the `family` tab, and ONLY where the child accepted. A row that was asked and never
   answered is a request, not a relationship — treating the two the same is how a claim becomes a
   fact without anybody agreeing to it.

   ONE siblingsOf, taking a person_id. There were two: an older one reading the parent's `children`
   cell and taking a ROW, and this one taking an ID. The second overwrote the first, and the two
   callers still passing a row were handing an object to `S()` — which stringifies it to
   "[object Object]", matches nobody, and returns an empty list. Every student on the site has had
   no siblings since, silently.
--------------------------------------------------------------------------------------------- */
```

### `seedFamilies` WAS HERE.

top level, before `childNamesOf`

```
/* `seedFamilies` WAS HERE. It wrote a hand-written list of real families (`KNOWN_FAMILIES`, in
   constants.gs) into the family tab as accepted links, leaving any link that already existed
   exactly as it was. It ran, the links are on the tab, and the list was children's names in a
   public repository — so both went together. See the note where `KNOWN_FAMILIES` used to be. An
   admin links a child from the app now, with `linkChild`, which writes the same accepted row. */
```

### A PARENT'S CHILDREN, FROM THE ONE PLACE THAT HOLDS THEM.

top level, before `childNamesOf`

```
/**
 * A PARENT'S CHILDREN, FROM THE ONE PLACE THAT HOLDS THEM.
 *
 * This read the `children` CELL on the parent's row — a comma list of names typed by hand — while
 * `acceptedChildren` read the family tab. Two answers to one question, and they could disagree
 * without either being obviously wrong: a link accepted on the tab and a stale name in the cell,
 * or the reverse.
 *
 * The family tab wins and the cell is a FALLBACK, for a sheet that has names typed in and no links
 * made yet. Once a family's links are on the tab — `linkChild`, `makeChild` or `claimChild` — there
 * is nothing in the cell that is not on the tab, and the fallback stops mattering — which is the
 * right way for two sources to become one: the weaker one goes quiet rather than being deleted out
 * from under somebody.
 */
```

### ---------- RENAMED, BECAUSE THERE WERE TWO `childrenOf` AND THIS ONE NEVER RAN

top level, before `childNamesOf`

```
/* ---------- RENAMED, BECAUSE THERE WERE TWO `childrenOf` AND THIS ONE NEVER RAN -------------------
   `people.gs` DECLARED `childrenOf` TWICE — this one at line 248 taking a person ROW and returning
   NAMES, and another 34 lines below taking a parent ID and returning ROWS. Apps Script has one
   global scope, so the second silently replaced the first, and CLAUDE.md has carried "not yet
   fixed; be careful around it" ever since.

   THE TWO CALLERS WANTED DIFFERENT THINGS, which is what made it more than untidy:

     doget.gs:544    childrenOf(S(r.person_id)).map(personDisplayName)   wants the ID version
     dopost.gs:3018  out.kids = childrenOf(r)                            wants THIS one

   The second was handed a row where the survivor expects an id, so `S(parentId)` on an object
   matched nothing and `out.kids` has been an empty list for every parent signing in, for as long as
   both have existed. Nothing failed and nothing said so — the same shape as a key the backend never
   sends, which `|| []` turns into an empty database.

   NAMED FOR WHAT IT RETURNS. `childrenOf` returns people; `childNamesOf` returns names. Two
   functions one letter apart would be the same trap with a longer fuse, and the thing that
   distinguishes them is not the argument but the answer. */
```

### ---------- THE CHILDREN A PARENT TYPED INTO THEIR OWN `children` CELL, AS THEY MAY BE SAID

top level, before `typedKids_`

```
/* ---------- THE CHILDREN A PARENT TYPED INTO THEIR OWN `children` CELL, AS THEY MAY BE SAID -------------
   A CHILD WHO IS ONLY WORDS IN THAT CELL — no row, no accepted link — is somebody the net cannot know
   (`kidNamesOff_` recognises a child by her row), so she kept her surname: the review of 10 Oct found
   `kids: ["Sol Fennimore"]` on her parent's sign-in reply, and once that parent booked, `for_children`
   carried it whole to the tutor and the admin. The cell names children by definition, so a typed name
   that is nobody's row is its FIRST WORD here — which word is the surname nothing can tell, and the
   first is the name she is called by. A typed name that IS somebody's row is said as `nameFor_` says that
   row. `typed` is the cell's own words, for `createJob` to find a name a phone sent back whole. */
```

### ---------- WHO A FAMILY SAYS IT IS BRINGING, AS OTHER FAMILIES MAY READ IT (342, the review)

top level, before `typedFirstWords_`

```
/* ---------- WHO A FAMILY SAYS IT IS BRINGING, AS OTHER FAMILIES MAY READ IT (342, the review) ---------------
   `joinFestive` ASKS "Who is coming? Names, or just how many children." and kept the answer word for word
   in the joining event — which every family on the event reads, and which went to every signed-out visitor
   until `doGet` stopped sending an open job's events to people not in it. So "Wren Quorrington and Bo
   Ashdown-Vance" put two surnames in front of strangers, one of them a child who is no row the net could
   recognise. EACH NAME CUT TO ITS FIRST WORD, `typedKids_`'s rule for a child who is only words: split at a
   comma, a semicolon, a slash, `&`, `+`, a new line or the word "and", and the separators kept. A count
   ("3") is its own first word. "just two" becomes "just" — the admin's email keeps the words as typed,
   and a party's headcount is not worth a surname. */
```

### THE CHILDREN ON SOMEBODY'S ACCOUNT.

top level, before `childrenOf`

```
/* THE CHILDREN ON SOMEBODY'S ACCOUNT. The mirror of `siblingsOf`, walking the same accepted links
   the other way — parent to child rather than child to sibling.

   WRITTEN BECAUSE THE BOOKING FORM COULD ONLY EVER ASK ABOUT THE SIGNED-IN PERSON'S CHILDREN. An
   admin booking on behalf of a family was offered their OWN children, or told there were none, and
   no amount of choosing a client changed it — the question read `USER.children` and a client is not
   the user. */
```

### A CHILD IS CALLED BY THEIR FIRST NAME — TO EVERYBODY, IN EVERYTHING THE SERVER SAYS THE OWNER, 10 OCT:

top level, before `netViewerSet_`

```
/* ==================================================================================================
   A CHILD IS CALLED BY THEIR FIRST NAME — TO EVERYBODY, IN EVERYTHING THE SERVER SAYS
   --------------------------------------------------------------------------------------------------
   THE OWNER, 10 OCT: *"also side note dont show children's last name."* Asked as a side note and
   meant everywhere: the people column, a family card, a roster, a post, "who reacted", a message,
   a receipt, a greeting, the weekly email.

   ABSENT, NOT HIDDEN. A name the phone was sent and then told not to draw is a name in the JSON of
   every visitor who opens the network tab — the lesson `payload.students` paid for (doget.gs, "CHILDREN
   ARE NOT SENT TO STRANGERS"). So a child's surname never leaves this server: not to another student,
   not to a parent, not to a tutor, not to a stranger, and NOT TO THEIR OWN PARENT OR AN ADMIN EITHER.
   The rule could have let those two in, and the owner's sentence has no exceptions in it — nothing
   on any screen draws it for them (an admin reads it in the sheet, a parent typed it), so sending it
   would only be one more copy on one more phone. ONE PLACE IT GOES: the child's own Settings, as the
   `last_name` box of `profileOf_`, which only their own sign-in reply and `myProfile` carry, so they
   can see and fix what they typed. (`getProfile` answers with the same boxes, and is an admin-only
   call nothing on the site makes — the row as the sheet holds it, for somebody who holds the sheet.)
   The sheet keeps every surname exactly as it was; nothing here writes one.

   WHO IS A CHILD: somebody who holds `student` and is ACTING as one (`actingRole_`) — no adult role
   in effect. A student who is also an approved tutor is public as a tutor and keeps a tutor's card; a
   parent who is also learning is a parent. NOT `mainRole`, which this said first: `mainRole` picks the
   highest role TICKED, and a child can tick Tutor in her own Settings (`setMyRoles`) — which leaves her
   PENDING, a tick the business has not said yes to and that counts for nothing anywhere else. To
   `mainRole` she was a tutor at once, so one tap took the rule off her and her whole name went to a
   signed-out stranger in her seat's events, to every signed-in phone on the score board and under her
   comments, and into her tutor's roster and email subject (the review of 10 Oct, "Vandersloot"). And
   through `SELF_ROLE_ALIASES`, so a row typed as `pupil` or `kid` is a child too, as the roles card
   already reads it — to `mainRole` those were clients, whose whole names go everywhere.

   TWO HALVES, ONE RULE:
     · `nameFor_(r)` IS HOW A NAME IS BUILT FOR ANYTHING THAT LEAVES — the payload, a reply, an
       email. A grown-up's is their whole name, as before; a child's is their first name.
     · `kidNamesOff_` IS THE NET UNDER IT, at the exits: `jsonOut`, the stored payload in `doGet`,
       and `mailOut_`. A child's name is not only BUILT here — it is STORED as text, typed whole into
       an event's `actor`, a post's `author`, a booking's `for_children`, a receipt — and read back
       out verbatim by a roster, a feed, a waiting list. Every one of those is a route that would
       have to remember. The net does not: every child's full name in anything leaving is replaced
       with `nameFor_`'s answer, so a route written next year cannot forget. It asks the same
       function, so the two halves cannot disagree.
     · `kidNamesBack_` IS THE SAME NET ON THE WAY BACK IN, in `setCell` and `setCells`. What the net
       shortened can come back: the admin's post editor sends the caption it was filled with when only
       Pin was changed, a notepad is saved whole on the next keystroke, a parent's Settings send the
       `children` box as drawn. Written as sent, each would put the shortened text over the sheet's —
       the surname gone from the one place that keeps it. So a value that is what the net made of the
       cell is the cell, unchanged; and an edit to it keeps every name the edit did not touch (see
       `kidNamesBack_`). `addRow` has nothing to keep.

   TWO CHILDREN WITH ONE FIRST NAME are told apart by their handle — `Sam (@sam_bold12)` — wherever
   the name stands alone. A card that already prints the handle under the name asks for the bare
   first name (`cardHasHandle`), or it would print the handle twice.

   A NAME SHE USED TO HAVE: `name_was`, newest first, written by `updateProfile` whenever a person's
   whole name changes — so a child whose surname was corrected after she booked is still recognised in
   the events stored under the old one (the review, "Brackenridge": the old whole name went to a
   stranger, in her seat). A safeguarding column like `handle_was`, and kept for the same reason.

   AND A GROWN-UP WHO IS NOT ON A PUBLIC CARD, SINCE 11 OCT (docs/history/342). The owner: *"don't show
   surname as some kids have different surnames and gets a bit awkward"* — a child called by her first
   name beside a parent called by his whole one says, on every family card and roster, that the two
   surnames differ. So a PARENT'S or CLIENT'S surname is not sent to anybody else either: everybody who
   is not a child and not ACTING as a tutor or an admin (`namePrivate_` — a client, a parent who is also
   learning, somebody whose only role is a Tutor tick still waiting). Approved tutors and admins keep
   their whole names on every card: families book a tutor by name, and an admin is the business.
   UNLIKE A CHILD'S, SOME PEOPLE STILL SEE IT: the grown-up themselves, any admin, and a child that
   grown-up has asked to be, or is, the parent of (`netKin_`, round 2 — the claim card). That is why it is a
   VIEWER-AWARE half of the same net rather than a second net — `NET_VIEWER_` (constants.gs) says who
   a reply or an email is for, `nameFor_` and `kidNamesSpans_` ask `netSeesWhole_`, and a grown-up's own
   payload, sign-in reply and mail keep their whole name, so the fourteen places the phone asks "is
   this mine?" against `USER.name` still match. A child's half never asks: it is nobody's.

   WHAT THE NET STILL CANNOT KNOW: a child whose row was deleted; a surname changed in the spreadsheet
   by hand, which no `updateProfile` saw (type the old whole name into `name_was`); and a child who is
   only words in a parent's `children` cell — which is why `childNamesOf` and `createJob` cut those to
   the first word before they go anywhere. And it matches a child's WHOLE name, so a child's surname
   alone (a parent who shares it) is not touched: that is a grown-up's name, and theirs to show.
================================================================================================== */
```

### ---------- WHO THE NET IS WORKING FOR (342)

top level, before `netViewerSet_`

```
/* ---------- WHO THE NET IS WORKING FOR (342) -------------------------------------------------------------
   `row` is the person a reply or an email is going to — the token's, the row signing in, the address's
   — or null for nobody known. Only two things about them matter, so only two are kept. */
```

### ---------- THE GROWN-UPS ON A CHILD'S OWN FAMILY ROWS SEE HER — SHE SEES THEIR WHOLE NAMES (342, round 2)

top level, before `NET_KIN_STATES`

```
/* ---------- THE GROWN-UPS ON A CHILD'S OWN FAMILY ROWS SEE HER — SHE SEES THEIR WHOLE NAMES (342, round 2) ----
   THE CLAIM CARD WAS THE ONE PLACE A CHILD VETS A GROWN-UP, AND 342 TOOK THE SURNAME OFF IT. "Pip says they
   are your parent" — Yes / No — and a yes gives that account her bookings, her progress and `resetPin` over
   her: they choose her next PIN and can sign in as her. Before 342 the card said `Pip Strangeways`, and since
   `register` refuses a whole name that is already an account, a stranger could not borrow Mum's. After it,
   anybody registering as "Pip <anything>" — the first name every roster shows other families — sent a card
   that read like Mum's but for a handle (the review, round 2, measured it: `Pip (@pip_brave77)` beside her
   accepted `Pip (@pip_kind42)`; with Mum not on the sheet, just `Pip`).
   So a child sees the WHOLE name of every grown-up on a family row naming her as the child, while it is
   `asked` (the card she is deciding on) or `accepted` (her own parent — and the name she compares the next
   claim with). Not the awkwardness the owner described: that is a child called by her first name beside a
   parent called by his whole one, in front of OTHER people. Her own parent's surname, to her, says nothing she
   does not know, and a claimant chose to put their name in front of her when they asked.
   NOT `refused` or `held` — a no is the end of it, and `held` is a link an admin is still settling. NOT the
   other way round: a child's surname is nobody's, her own parent's included (333). NOT a sibling, a
   co-parent or anybody else the family tab connects only through her. A row is only ever written by the
   grown-up's own action (`claimChild`, `makeChild`, their inbox opening the link) or an admin (`linkChild`),
   so no child can put a stranger's name in front of herself.
   One pass over the family tab per viewer, kept on the viewer and dropped by a write to that tab
   (`kidMemoDrop_`) — `answerClaim` turns `asked` into `refused` in the middle of a request. */
```

### THE ADDRESS AN EMAIL GOES TO, AS A VIEWER:

top level, before `mailViewer_`

```
/* THE ADDRESS AN EMAIL GOES TO, AS A VIEWER: the one row with that address, once somebody has proved it
   is theirs. Several addresses, an address on no row (a grown-up's for a no-email child, a friend
   invited to a session) or one nobody has proved (a typo's inbox is a stranger's) is nobody known. */
```

### ---------- A WHOLE NAME TYPED TO SEE WHETHER IT IS SOMEBODY'S ACCOUNT (342, the review)

top level, before `isChild_`

```
/* ---------- A WHOLE NAME TYPED TO SEE WHETHER IT IS SOMEBODY'S ACCOUNT (342, the review) -----------------
   `register` IS OPEN TO ANYBODY, and it answered "There is already an account in that name" BEFORE it
   looked at the address — so anybody holding a list of surnames could pass an address that is already
   registered (a miss then wrote nothing either) and confirm, guess by guess, the whole name of any child
   or any parent: 333's rule and 342's undone by a form. The review measured four guesses, zero writes.
   `makeChild` answered the same thing, by name, to any confirmed parent.
   NOW the address is asked first, so a registered OWN address is that answer whatever the name, and a clash
   is the same sentence as any other refusal of its kind and does not say which half. Nothing more is done,
   and what is left is said honestly in note 342: a refusal still means "one of these is taken". On the
   child's door (`parent_email`, which is somewhere to write, not a sign-in address) the same grown-up's
   address serves every guess — a hit is refused and writes nothing, a miss writes a PENDING row and mails
   that address.
   THERE WAS A PAUSE HERE, AND IT WENT IN ROUND 2. Five clashes a day with private whole names refused EVERY
   new account and every `makeChild` for a day — and the review tripped it signed out, from one row of its own:
   register a child once, send the same name five more times (the child's door has no address of its own to
   check), and no family could sign up until tomorrow, with nothing to show an admin why. Any counter every
   caller shares can be filled by one caller; counting each row once, and only confirmed rows older than a day,
   would only raise the price to five accounts made the day before. And it never bounded the guessing anyway:
   `claimChild` answers "No student called …" to any confirmed parent and writes nothing on a miss. An off
   switch for every family's sign-up is worse than the oracle it slowed. Closing the oracle for good would
   need two accounts to share a whole name, which is not done — `findPerson` and `notify` resolve a person by
   name, and would then have two answers. */
```

### `actingRole_` READS THE ALIASED WORDS, so `pupil, teacher` with a PENDING tick is the same child as `student, tutor`.

in `isChild_`

```
/* `actingRole_` READS THE ALIASED WORDS, so `pupil, teacher` with a PENDING tick is the same child as
     `student, tutor`. Holding `student` is asked first: a grown-up whose only role is a tutor tick still
     waiting acts as a student there (the least they can do), and is not a child for that. */
```

### ---------- WHAT EVERY ROW OF THE PEOPLE TAB SAYS ABOUT CHILDREN, WORKED OUT ONCE

top level, before `kidMemo_`

```
/* ---------- WHAT EVERY ROW OF THE PEOPLE TAB SAYS ABOUT CHILDREN, WORKED OUT ONCE --------------------
   `kidFirstShared_` USED TO WALK THE WHOLE TAB FOR EVERY NAME IT WAS ASKED ABOUT, and `nameFor_` asks it
   for every child — so the admin's people column, the score board and the posts' faces were each one
   pass over the tab per row: measured in node, 181 ms for the net's index over 300 people and 1179 ms
   over 600, and every signed-in payload builds the board. Now one pass per request: which rows are
   children and how many children answer to each first name, kept beside the read cache it came from
   (`KID_MEMO_`, constants.gs) and dropped by any write to the people tab (`kidMemoDrop_`), so a child
   renamed by this very request is recognised under the name its reply is about to carry. */
```

### A person's name as it may leave the server, TO THIS REQUEST'S VIEWER (`NET_VIEWER_`).

top level, before `nameFor_`

```
/** A person's name as it may leave the server, TO THIS REQUEST'S VIEWER (`NET_VIEWER_`).
    `cardHasHandle`: the card prints the handle anyway. A grown-up's whole name to themselves, to an
    admin and to a child on their own family row (`netSeesWhole_`); to anybody else what `nameToOthers_`
    says. A child's is never whole, to anybody. */
```

### The name as anybody who is not this person or an admin may have it:

top level, before `nameToOthers_`

```
/** The name as anybody who is not this person or an admin may have it: a tutor's or an admin's whole
    name; a child's or a private grown-up's first name, with the handle where somebody else answers to
    it. What the net replaces a whole name WITH, so it is asked without a viewer — and what a referral
    code is cut from, since a code is handed round. */
```

### ---------- A NAME SOMEBODY USED TO HAVE

top level, before `nameWasWith_`

```
/* ---------- A NAME SOMEBODY USED TO HAVE ------------------------------------------------------------
   `name_was` with `was` added at the front: newest first, comma-separated, the last `NAME_WAS_KEEP`.
   `handleWasWith_`'s shape, for `handleWasWith_`'s reason. */
```

### ---------- THE NET: EVERY CHILD'S WHOLE NAME, AND WHAT TO SAY INSTEAD

top level, before `kidNamesIndex_`

```
/* ---------- THE NET: EVERY CHILD'S WHOLE NAME, AND WHAT TO SAY INSTEAD ----------------------------
   One per request (`kidMemo_`), retired by a write to the people tab — a reply is built AFTER its
   writes, and a child renamed by this very request must be recognised under the name the reply is
   about to carry. One people read (the request's own, usually already in hand) and one RegExp.

   SPACING AND CASE AS TYPED: `Ivy  KIND` in an old cell is the same child, so each word is matched on
   its own with any run of white space between, case folded. WHOLE WORDS ONLY — `Ivy Kind` must not
   eat the front of `Ivy Kindersley` — and a letter is any script's letter, which `\b` is not (it
   would see no edge after the `ë` of a surname ending in one). An apostrophe matches itself and the
   ways HTML spells it, because the weekly email escapes the names it prints.

   HER NAMES AS THEY WERE TOO (`name_was`), after every name as it is now — a child who is called
   today what another child used to be called is the one meant.

   A CHILD WITH NO FIRST NAME has a "full name" of their surname alone, which as a pattern would take
   a common word out of every sentence ("be kind"). So it is replaced only where it is the WHOLE value
   — the `actor` of an event, an `author` — and nowhere inside a sentence. */
```

### `adult` AND `wholeAdult`:

in `kidNamesIndex_`

```
/* `adult` AND `wholeAdult`: whose name each GROWN-UP'S entry is (342), keyed as `said` and `whole`
     are — the one thing about an entry the viewer is asked about (`kidNamesSpans_`). A child's entry has
     none, and is replaced for every viewer. */
```

### THE GROWN-UPS WHO ARE NOT ON A PUBLIC CARD (342) — and not one whose whole name a tutor or an admin also answers to:

in `kidNamesIndex_`

```
/* THE GROWN-UPS WHO ARE NOT ON A PUBLIC CARD (342) — and not one whose whole name a tutor or an admin
     also answers to: that name is on a public card, and the net cannot tell which of the two a sentence
     meant. A row with no id is keyed `?`, which no viewer is, so only an admin is exempt for it. */
```

### ---------- WHERE THE WHOLE-VALUE RULE DOES NOT REACH: A BOX THAT HOLDS ONE PART OF A NAME

top level, before `kidWholeOk_`

```
/* ---------- WHERE THE WHOLE-VALUE RULE DOES NOT REACH: A BOX THAT HOLDS ONE PART OF A NAME ----------
   A no-first-name child's "whole name" is her surname alone, so as a whole value it was replaced
   EVERYWHERE — and `last_name` is a whole value. The review of 10 Oct: her own Settings box read her
   handle where her surname is (`@thistle_kind47`), and so did the Settings of a GROWN-UP who shares
   that surname; the form sends every box, so the next Save wrote the handle into the sheet's
   `last_name` and the surname was gone. A box called `first_name` or `last_name` is one part of a
   person's name, never a child's whole one, so the rule leaves it alone — on the way out, and on the
   way back in. */
```

### `exec` ON THE ONE PATTERN, not `matchAll`:

in `kidNamesSpans_`

```
/* `exec` ON THE ONE PATTERN, not `matchAll`: `matchAll` copies the RegExp for every string it is handed,
     and a copy of a pattern naming four hundred children is a fresh compile — measured, the walk over a
     big payload went from a quarter of a second to two. */
```

### A GROWN-UP'S WHOLE NAME TO THEMSELVES OR AN ADMIN IS LEFT (342) — and the search goes on from the next character rather than past it, so a child's whole name

in `kidNamesSpans_`

```
/* A GROWN-UP'S WHOLE NAME TO THEMSELVES OR AN ADMIN IS LEFT (342) — and the search goes on from the
       next character rather than past it, so a child's whole name INSIDE that grown-up's (`Mary Ann
       Kind` holding a child called `Ann Kind`) is still found and still replaced. */
```

### ---------- AND ON THE WAY BACK IN: WHAT THE NET SHORTENED IS NOT WRITTEN OVER WHAT IT SHORTENED

top level, before `kidNamesBack_`

```
/* ---------- AND ON THE WAY BACK IN: WHAT THE NET SHORTENED IS NOT WRITTEN OVER WHAT IT SHORTENED --------
   CALLED BY `setCell` AND `setCells` for every string written over a string, with the cell as it stands.
   `stored` is the sheet's; `sent` is what is about to be written; the answer is what to write.

     · NO CHILD'S NAME IN THE CELL — nothing to keep, `sent` as it is. Nine writes in ten stop here.
     · `sent` IS WHAT THE NET MADE OF THE CELL — nothing was changed, so the cell is kept as it is: the
       admin pinning a post sends its caption back as it was drawn, "Wren and the volcano".
     · AN EDIT OF WHAT THE NET MADE OF IT — one line added to a notepad, a word changed in a caption: the
       part that differs is found (the common start and the common end), and only that part is taken
       from `sent`; everything either side of it is the cell's own, every surname in it kept. A name the
       edit itself runs into (an edge strictly inside it, or a letter typed against it) is part of the
       edit and goes as written — that name is what the person changed.
     · `sent` HAS A CHILD'S WHOLE NAME IN IT — whoever wrote it had the whole names, so it is not the
       net's text coming back: a value the server worked out (`name_was` with one more name at the
       front, a list with one taken out) or a name typed in full. It goes as it is. Measured, and the
       reason this case is here: `name_was` gaining a name shares its first word with what the net
       makes of the old cell, and an edit found by comparing the two wrote the old name in twice.
     · ANYTHING ELSE — a cell cleared, a value with no name the net knows — differs across the names
       too, so the edit is the whole of it and `sent` goes as it is.
   SEVERAL EDITS FAR APART IN ONE SAVE are one edit from the first to the last, so a name between them
   is taken as the person saw it. A notepad saves as it is typed, so that is a save that was slow. */
```

### ---------- AND THE MAIL, THROUGH ONE DOOR

top level, before `mailOut_`

```
/* ---------- AND THE MAIL, THROUGH ONE DOOR ---------------------------------------------------------
   EVERY EMAIL THIS PROJECT SENDS GOES THROUGH HERE, so the subject, the text and the HTML are put
   through the net before they leave — `check-surnames.js` fails on any `MailApp.sendEmail` anywhere
   else. To EVERYBODY, the child included: the owner's sentence has no "except to themselves", and an
   email is forwarded more readily than a screen is shown. Throws as `MailApp` does, so each caller's
   own `try` still says what a failure means for it. */
```

### FOR THE PERSON IT GOES TO (342):

in `mailOut_`

```
/* FOR THE PERSON IT GOES TO (342): a grown-up's whole name stays in their own mail and an admin's, and
     goes from everybody else's — `mailViewer_` reads the address. Whoever the request was for is put
     back after, because a reply is built after the mail it sends. */
```

### `firstNamesOnly`: A WHOLE NAME BECOMES THE FIRST NAME ALONE, NEVER "First (@handle)".

in `mailOut_`

```
/* `firstNamesOnly`: A WHOLE NAME BECOMES THE FIRST NAME ALONE, NEVER "First (@handle)". The net names
     a child by first name and adds the handle where two children share it, which is right on a screen
     where the handle is how one is told from the other — and wrong in the parents' Sunday email, which
     the owner said carries no usernames (*"they dont need to see usernames or whatever"*, 12 Oct): a
     question whose words held a child's whole name would have put the handle in a parent's inbox. Taken
     off the message here, so MailApp is never handed it. */
```

### THE NET'S INDEX WITH EVERY " (@handle)" TAKEN OFF WHAT A NAME BECOMES — `mailOut_`'s `firstNamesOnly`.

top level, before `kidNamesBare_`

```
/* THE NET'S INDEX WITH EVERY " (@handle)" TAKEN OFF WHAT A NAME BECOMES — `mailOut_`'s `firstNamesOnly`.
   A copy: the index is memoised for the request, and the screens' replies still want the handle.
   AND A NAME THAT WOULD BECOME A BARE "@handle" IS NOT REPLACED AT ALL (the review of 12 Oct). A child with
   no first name is named by their handle (`kidFirst_`), and stripping " (@…)" leaves that untouched: a
   question this week whose words held the phrase — "Describe how Van Dyke painted…", over a child whose
   surname is Van Dyke — went to a parent as "Describe how @vd_hidden_99 painted…". Such an entry is dropped
   from the copy, so the words go as they were written: in the parents' email the only words are the
   question's own, and the email names its child by the first name it already checked (`digestPlan_`). */
```

### WHOEVER IS ACTUALLY REACHABLE as an admin.

top level, before `adminName_`

```
/**
 * WHOEVER IS ACTUALLY REACHABLE as an admin.
 *
 * ADMIN_NAME first, because it names the account these messages are addressed to. But a name is
 * an editable cell: rename the row, drop the admin role from it, or leave its email blank, and
 * every notification about a print order or a reported message goes nowhere and says nothing.
 * So if that row cannot be reached, ANY admin with an address will do — a message delivered to
 * the wrong admin is recoverable, and one delivered to nobody is not.
 */
```

### ---------- AN ADDRESS NOBODY HAS PROVED REACHES THIS PERSON

top level, before `addressPending_`

```
/* ---------- AN ADDRESS NOBODY HAS PROVED REACHES THIS PERSON ------------------------------------------
   `verified=PENDING` is a sign-up whose address nobody has proved yet — not by its link, not by Google,
   not by typing back the emailed PIN. A typo'd address, as often as not, which is a stranger's inbox,
   or somebody else's address typed by whoever wanted the account. Blank is a row from before
   confirmation existed, and is not pending.

   ONE READER, because the rule was kept in one place only. The digest skipped a PENDING address
   (280); `notify`, the make-child email and the too-many-guesses warning did not — and once the owner
   asked that *"dont make them have to need to verify their email to login"* (6 Oct), an account on a
   mistyped address could sign in, book and make a child, and every booking notice, the child's handle
   and "PIN changed" went to the stranger (PR #130 review). Every mail to a person's own address asks
   this now, except the two that exist to reach an unproved one: the confirmation link (`register`,
   `resendLink`) and "Forgotten your PIN?", which is how the address's owner proves it and takes the
   account.

   ---------- AND NO CHILD IS TIED TO AN ACCOUNT EXCEPT THROUGH A CONFIRMED ADDRESS ------------------
   Holding the mail back was round one, and the review of it found the typo still worked: the parent
   on jsmith1@ made a child, the stranger who owns jsmith1@ pressed "Forgotten your PIN?" — which must
   go to a PENDING address, or the real owner of a squatted one could never take it back — signed in
   as the parent and reset the child's PIN. Neither half can give way, so the CHILD is what waits:
   `makeChild`, `claimChild`, a child's yes in `answerClaim`, a grown-up's link in `verifyEmail`, a
   parent's `resetPin` and an admin's `linkChild` all ask this of the parent's row and refuse while it
   is PENDING (`confirmFirst_`). An account on an unproved address signs in and books — it holds no child, so
   whoever proves that address owns nothing of anybody else's. */
```

### THE ADDRESS THE PHONE IS TOLD IS WAITING, or blank (`pendingEmail` on the sign-in reply and on `myProfile`).

top level, before `pendingEmailOf_`

```
/* THE ADDRESS THE PHONE IS TOLD IS WAITING, or blank (`pendingEmail` on the sign-in reply and on
   `myProfile`). Only the row's OWN address: a no-email child's PENDING is about the grown-up's address,
   which is not theirs to be sent a link to, and no mail of theirs is held because they have none. */
```

### ---------- "OPEN THE LINK FIRST": THE ONE ANSWER TO A CHILD-BINDING ACTION FROM AN UNPROVED ADDRESS

top level, before `confirmFirst_`

```
/* ---------- "OPEN THE LINK FIRST": THE ONE ANSWER TO A CHILD-BINDING ACTION FROM AN UNPROVED ADDRESS ------
   One sentence for every refusal above, so a parent hears the same next step whichever door they
   tried, with the address IN it — the address is the whole of what is wrong when it is a typo, and
   "check your inbox" said to somebody whose inbox it is not is a sentence they cannot act on.
   `why` and `pendingEmail` are for the phone: it draws the held card from them (me.js). */
```

### ---------- DOES THIS PERSON STILL WANT THIS KIND OF EMAIL — `NOTIFY_KINDS` in constants.gs

top level, before `wants_`

```
/* ---------- DOES THIS PERSON STILL WANT THIS KIND OF EMAIL — `NOTIFY_KINDS` in constants.gs -----------
   The owner, 9 Oct: *"Also let parents select their communication preferences like notification. And
   kids and tutors too I guess"*. ONE READER, for the reason `addressPending_` gives above: the weekly
   email read `weekly_email` itself, and a second sender with its own reading of its own column is the
   rule kept in two places. Every sender asks this — `notify`, `sendInvite`, the Sunday digest — at the
   moment of sending, so a choice made a second ago holds, and a row typed into the sheet by hand holds
   too, whatever the phone drew.

   YES FOR AN ESSENTIAL KIND, AND YES FOR A KIND NOBODY DECLARED. The first is the point of essential;
   the second is the safe way round for a sender somebody adds tomorrow — mail sent that was not wanted
   is a nuisance, a PIN reset swallowed is a locked-out family — and `check-prefs.js` refuses an
   undeclared kind before it ships anyway. BLANK IS YES (`ON_`), so every row from before the column
   existed — and a live sheet before `ensureSchema` has added it — goes on getting what it got. */
```

### ---------- AND WHEN IT SAYS NO, IT IS WRITTEN DOWN, NOT DROPPED

top level, before `notifyHeld_`

```
/* ---------- AND WHEN IT SAYS NO, IT IS WRITTEN DOWN, NOT DROPPED --------------------------------------
   `notify` LOGGED NOTHING, so "I was never told" could not be told apart from "they had it switched off".
   The Apps Script execution log (Executions in the editor), as `aiMark` logs a refusal from Gemini: no
   tab to grow, nothing for a phone to read, and the owner can find it by the person's id. NEVER IN THE
   REPLY: the sender would learn another person's choices — that somebody has switched their messages
   off is theirs to say. The weekly email and an invitation log where they already log, as well
   (`digest_log`, `invites.notes`). */
```

### ---------- WHICH ROLES AN EMAIL REACHES SOMEBODY BY — ONE ANSWER FOR THE CARD AND FOR `setNotify`

top level, before `notifyRoles_`

```
/* ---------- WHICH ROLES AN EMAIL REACHES SOMEBODY BY — ONE ANSWER FOR THE CARD AND FOR `setNotify` --------
   THE CARD AND THE SERVER DISAGREED TWICE, and both times the sender was right and the card was not
   (review, 9 Oct):

   ALIASES. `rolesOf` gives the cell's words as typed, and people type `parent`, `guardian`, `kid` and
   `teacher` there — that is why `SELF_ROLE_ALIASES` exists. Asked raw, a `parent` row reached no kind at
   all: the card read "To x@… · saved as you tick." over nothing, while the Roles card just above showed
   Client ticked, and `setNotify` refused every kind. So the words go through the alias map first, as
   `selfRolesOf_` does. A cell that names none of the four after that — only a title, say — is `client`,
   which is `mainRole`'s answer for the same row.

   PARENTS BY THE FAMILY TAB. A kind marked `parents` (the weekly email, family links) also reaches
   anybody with an ACCEPTED child, whatever their cell says, because that is who its sender writes to —
   `acceptedParents`, not a role. They meet it as a parent, so it is `client`'s note they are shown.

   Returns the roles it reaches them BY (empty: it does not reach them), because `notifyOf_` picks each
   role's note from that list. `parent` is passed in by `notifyOf_`, which asks once for eleven kinds. */
```

### A FAMILY TAB THAT CANNOT BE READ IS NOBODY'S CHILD — the roles still decide, which is what the card drew before this was asked.

in `notifyParent_`

```
/* A FAMILY TAB THAT CANNOT BE READ IS NOBODY'S CHILD — the roles still decide, which is what the card
     drew before this was asked. AND A ROW WITH NO ID IS NOBODY'S PARENT, or a half-typed link with a blank
     `parent_id` would make it one. */
```

### ---------- WHAT THE NOTIFICATIONS CARD DRAWS FOR THIS PERSON

top level, before `notifyOf_`

```
/* ---------- WHAT THE NOTIFICATIONS CARD DRAWS FOR THIS PERSON ------------------------------------------
   Sent on the profile (`profileOf_` → `myProfile`, the sign-in reply, `updateProfile`), so the phone is
   told, by the same table the senders read, exactly which kinds reach this person and what each is set
   to — the phone keeps no list of its own to drift from this one. The kinds of EVERY role they hold
   (`notifyHow_` — aliases read, and a parent by the family tab as well as by the cell), in the table's
   order, optional ones with `on`, essential ones flagged, `hidden` ones left out.

   `to` IS THE ROW'S OWN ADDRESS, because that is the only one `notify` writes to: a child with none is
   sent nothing at all (their sign-in help goes to their grown-ups, `authGrownUps_`), and the card says
   that instead of drawing switches for mail that never comes. `held` is `addressPending_` — nothing but
   the link goes to an address nobody has proved. `idle` on the weekly email while the owner has it off on
   the config tab (`digestMode_`): a switch for an email nobody is being sent must say so. */
```

### ---------- `kind` IS WHICH OF `NOTIFY_KINDS` THIS IS, AND EVERY CALLER NAMES ONE

top level, before `notify`

```
/* ---------- `kind` IS WHICH OF `NOTIFY_KINDS` THIS IS, AND EVERY CALLER NAMES ONE -----------------------
   Asked LAST, after the address and its proof: a person with no address was never going to be sent it,
   and is not "held". Left out, it is treated as essential — the checks' own three-argument calls still
   send — but `check-prefs.js` fails on any call in backend/ that leaves it out. */
```

### The catalogue as the SHEET has it, falling back to the code list until the tab is seeded.

top level, before `avatarCatalogue`

```
/* The catalogue as the SHEET has it, falling back to the code list until the tab is seeded.
   `art_id` is what the drawing table is keyed on, so renaming an item in the sheet changes what
   it's called without changing what it looks like — the two are different questions. */
```

### ---------- `r.price` IS NOT A COLUMN OF THIS TAB

in `fromShop`

```
/* ---------- `r.price` IS NOT A COLUMN OF THIS TAB --------------------------------------------
       THE SHOP TAB PRICES IN THREE CURRENCIES — `price_pence`, `price_ticks`, `price_coins` — and
       has never had a bare `price`. So `N(r.price)` was `N(undefined)`, which is 0, on every row:
       every avatar item arrived costing nothing AND flagged `free`, including the seven that carry
       a `price_coins` of 15, 20 or 30. Paid items, given away, silently.

       `price_coins` is the one, because this is the wardrobe and `find.js` renders `x.cost` as
       "credits" — the same column the shop's own price line reads first in `doget.gs`.

       `check-columns.js` COULD NOT SEE THIS: it asks whether a name is a column of ANY tab, and
       `price` is one — on `resources`, where it means something else entirely. `check-rows.js`
       asks it of the tab the row actually came from, and this was the first thing it found. */
```

### THE FREE ITEMS ARE ALWAYS IN, whether or not the shop knows about them.

in `avatarCatalogue`

```
/* THE FREE ITEMS ARE ALWAYS IN, whether or not the shop knows about them.

     `seedAvatarItems` deliberately writes only the ones that cost something — a shop row for
     "Nothing" at £0 would be a shop selling the absence of a hat. Perfectly reasonable, and it
     meant that the moment the shop was seeded this function stopped returning `none`, `crop` and
     `plain` at all. Those are the DEFAULTS every figure starts in, so `saveAvatar` then refused
     every single save with "No such item: hair/crop", including from somebody changing nothing but
     their skin colour. The wardrobe worked right up until the shop existed.

     Merged rather than either-or: the shop is the authority on anything it lists, and the code
     list supplies whatever it does not. */
```

