# backend/setup.gs

The full text of comments in `backend/setup.gs` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — 50_setup.gs (6 of 8) BRINGING THE SHEET UP TO DATE, AND SAYING WHAT IS WRONG WITH IT.

top level, before `seedOptions`

```
/* ==================================================================================================
   @family. — 50_setup.gs   (6 of 8)

   BRINGING THE SHEET UP TO DATE, AND SAYING WHAT IS WRONG WITH IT.

   `ensureSchema` and `autoMigrate` run when somebody asks — `?setup=1`, `?run=…`, or the editor's function
   list — and never on an ordinary request (doGet says why: it landed on whoever opened the app next).
   THIS LINE SAID THEY RAN THEMSELVES ON THE FIRST REQUEST AFTER A DEPLOY, and the owner's steps were
   written from it twice (309 said there was nothing to run; 308 offered `/exec?setup=1` before the New
   version, when /exec is still the OLD code — review of 10 Oct).
   `dataProblems` and `checkEverything` are the two that answer "why is this not appearing" without
   anybody having to guess.

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

### ---------- THE CODE'S OWN OPTION VALUES, ADDED WHERE MISSING — AND NOTHING ELSE TOUCHED

top level, before `seedOptions`

```
/* ---------- THE CODE'S OWN OPTION VALUES, ADDED WHERE MISSING — AND NOTHING ELSE TOUCHED --------------
   IT REWROTE THE WHOLE TAB, on every `ensureSchema`. It read every row, kept the lists the code does not
   own as `[list_name, value, sort_order]`, cleared columns A to C from row 2 down and wrote the kept rows
   back, closed up, with the code's four lists rebuilt after them. Found on 10 Oct, before the owner
   runs `ensureSchema` on the live Ledger to add the `submissions` tab (note 308), where the options
   tab holds 145 rows the owner has edited:
     · THE FOURTH COLUMN DID NOT MOVE WITH THE OTHER THREE. `focus` (D) is what says a subject is
       academic or sporty, and it was never read or cleared — so every row that closed up over a blank
       row or a rebuilt list was written beside the `focus` of the row that used to be there, and the
       subjects' kinds shifted down the sheet.
     · EVERY CELL WENT THROUGH `S()` AND BACK: a value the sheet held as a number or a date came back
       as the text of it.
     · AND AN EDIT TO ONE OF THE CODE'S LISTS — a wording, an order, a value added — was put back to
       the code's every time.
   NOW IT ONLY ADDS. For each list the code owns (`OPTION_DEFAULTS`), a value that list does not have
   yet — compared without case or surrounding spaces — is appended as a new row at the end of that
   list's numbering. No row is rewritten, moved, reordered or removed; a second run adds nothing.
   A value the owner took out of one of these lists comes back, because the code branches on it
   (the note over `OPTION_DEFAULTS`); one the owner added stays, and so does every word of theirs.
   `check-submissions.js` runs `ensureSchema` over an owner's tab and asks that every row is as it was. */
```

### ---------- THREE OF THESE COLUMNS DO NOT EXIST, AND ONE OF THEM WAS THE PRICE

in `seedAvatarItems`

```
/* ---------- THREE OF THESE COLUMNS DO NOT EXIST, AND ONE OF THEM WAS THE PRICE ------------------
     IT WROTE `price`, `currency` AND `in_stock`. The shop tab has `price_pence`, `price_ticks`,
     `price_coins`, `acquire` and `active`. `addRow` reports an unknown key through `missedWrite_`,
     so this was not silent — but reported and discarded is still discarded, and the row lands with
     the cell empty either way.

     TWO OF THE THREE DID NO HARM, WHICH IS WHY IT SURVIVED. `inStock` is derived from `active`, and
     `ON_` reads an empty value as on, so nothing looked out of stock. `unit` is derived too and
     falls back to 🪙 for a wearable, so the currency still printed. Everything looked right.

     THE PRICE DID NOT SURVIVE. `price` is not a column, `price_coins` was never written, and
     `acquire` — the word that decides WHICH of the three price columns to read — was not written
     either. So `doGet` fell to `S(r.price_coins) || S(r.price_pence)`, found both empty, and sent
     `price: ''`. Every wearable seeded by this function has been priced at nothing since the shop
     and items tabs were merged. Bunches cost 15 coins in `AVATAR_ITEMS` and cost nothing in the
     shop.

     `acquire` ALSO SAYS WHICH KIND OF THING IT IS. An item with no `cost` in that list is earned by
     levelling up rather than bought — the description below has always said so — and `acquire:
     'level'` is how the payload is told to send no price at all instead of an empty one.

     ALREADY-SEEDED ROWS ARE NOT REPAIRED BY THIS. The guard two lines above returns early once any
     avatar row exists, so a sheet that has run this before keeps its empty prices and needs
     `price_coins` and `acquire` filling in by hand. Found by `node js/check-columns.js`, which
     could not run at all until its own path was fixed. */
```

### ---------- THE WEARABLES HAVE BEEN FREE SINCE THE TWO TABS WERE MERGED

top level, before `repairShopPrices`

```
/* ---------- THE WEARABLES HAVE BEEN FREE SINCE THE TWO TABS WERE MERGED ---------------------------
   REPORTED AS "shop items should be updated to price you think would be reasonable", and the price
   is not a judgement anybody has to make: it is in `AVATAR_ITEMS`, in this repository, and has been
   since the wardrobe was built. Bunches cost 15 coins there and nothing in the shop.

   THE NOTE ABOVE `seedAvatarItems` ALREADY DIAGNOSED THIS and then said what it could not do about
   it: *"ALREADY-SEEDED ROWS ARE NOT REPAIRED BY THIS. The guard two lines above returns early once
   any avatar row exists, so a sheet that has run this before keeps its empty prices and needs
   `price_coins` and `acquire` filling in by hand."* A repair described in a comment and left for
   somebody to do by hand is a repair that does not happen — which is the argument this file makes
   about `geocodeVenues` being a URL somebody had to assemble, and about the rename that "has to be
   remembered". The machine is right here.

   `acquire` IS THE ONE THAT ACTUALLY BREAKS IT, not the price. `doGet` reads `acquire` to decide
   WHICH of the three price columns to look in, and an empty `acquire` falls through to
   `S(r.price_coins) || S(r.price_pence)` — both blank on every seeded row. So it sends `price: ''`,
   which the phone reads as no price at all. Writing the coins without the word would still leave
   a level-gated hat looking purchasable, and writing the word without the coins would price a
   bought one at nothing: the two go together or neither is worth writing.

   IT NEVER OVERWRITES A PRICE SOMEBODY HAS TYPED. That is what makes it safe to repeat and what
   makes it a repair rather than a reset — the sheet is the owner's, and a job that quietly replaces
   a considered figure with the code's default is the `renameValue` fault written into the money.
   A cell with anything in it is left exactly as it is, whatever it says.

   MATCHED ON `art_id` + `slot`, NOT ON `name`. Two slots can hold an item called Nothing, and a
   name is a cell somebody can edit — which is the fault `check-post.js` exists for, one table
   along. The pair is what the seeder wrote and what the wardrobe compares on. */
```

### ALREADY SAID SOMETHING?

in `repairShopPrices`

```
/* ALREADY SAID SOMETHING? LEAVE IT. Both cells, independently: a row that has a price and no
       `acquire` still needs the word, and one that has the word and no price still needs the
       number. Counting the untouched ones is what makes a second run legible — "0 priced" on its
       own reads the same whether everything was already right or nothing was found. */
```

### EVERY PERSON HAS A HANDLE, AND THE ONES THAT CANNOT BE GENERATED ARE REPORTED RATHER THAN INVENTED.

top level, before `fillHandles`

```
/* ==================================================================================================
   EVERY PERSON HAS A HANDLE, AND THE ONES THAT CANNOT BE GENERATED ARE REPORTED RATHER THAN INVENTED.

   ASKED FOR AS *"each person should have randomly generated username, handle llik \"@_____\", email,
   first name, last name and username."*

   `register` DOES THIS FOR EVERY NEW ROW FROM NOW ON — see `handleMake_`. This is the other half:
   the rows that are already there, every one of which was written before any of it existed.

   IT ONLY EVER FILLS A BLANK, WHICH IS `repairShopPrices`' RULE AND FOR ITS REASON. A handle is what
   somebody signs in with and what `findPerson` resolves them by, so a job that replaced one would
   lock that person out of their own account and change the name their friends know them by. A cell
   with anything at all in it is left exactly as it is, and the count of what was left alone is
   printed — "0 filled" on its own reads the same whether everything was already right or nothing
   was found.

   AND IT WILL NOT INVENT AN EMAIL, A FIRST NAME OR A LAST NAME. That is the one place this job
   stops, and it is the same line the practicals' blank `needs` and the library's `figure` count are
   drawn on: a generated `@example.com` address is not a blank cell, it is a WRONG cell — `notify`,
   `forgotPin`, the verification link and every invitation would post into nothing and report
   success, which is this repository's oldest shape with a stamped addressed envelope. A made-up
   first name on a real child's public card is worse again. So they are COUNTED and NAMED by
   `person_id`, and somebody who knows the answer types it in.

   IDS RATHER THAN NAMES IN THE REPORT, because a row missing a first name has nothing else to be
   called, and because this reply is read by an admin over a URL rather than by the person.
================================================================================================ */
```

### NAMED, NOT SKIPPED. `setCell` writes to a header that is not there and loses the value with no error anywhere — the fault every `noColumn` refusal in this

in `fillHandles`

```
/* NAMED, NOT SKIPPED. `setCell` writes to a header that is not there and loses the value with
       no error anywhere — the fault every `noColumn` refusal in this project exists to prevent, and
       the reason a job that "ran" and changed nothing is the worst possible outcome here. */
```

### EVERY HANDLE INTO THE NEW SHAPE — `?run=renameHandles`.

top level, before `renameHandles`

```
/* ==================================================================================================
   EVERY HANDLE INTO THE NEW SHAPE — `?run=renameHandles`.

   ASKED FOR AS *"handles should be their name and a virtuous describing word. they can randomise it
   but it will follow that general name."* The handles `fillHandles`, `register` and the old typed
   box made before this are `BrightOtter42` or whatever somebody typed, so this regenerates every
   one that is not already the generated shape — see `handleMake_` and `handleParts_` in people.gs.

   A NUMBER IS PART OF THE SHAPE NOW, SO THIS NO LONGER STRIPS ONE. On 1 October a tail was only
   right while every bare word for that name was taken, and this job renamed `halex_steady71` to a
   bare `halex_<virtue>` the moment one was free. Then the owner asked for *"their first name, a
   virtuous adjective and random numbers and maybe an underscore. but all random order"* — every
   handle Randomise makes carries a number, and the old rule would have stripped it off every one of
   them on the next run. So the rule is one question: is it the shape (`handleParts_`, which reads
   every arrangement and the old two-part `<first>_<virtue>`)? Shaped is left alone, whatever order.

   AND THE 2 OCTOBER ASK WAS NOT TO REGENERATE EXISTING HANDLES. A `halex_kind` is still shaped, so
   this leaves it — a child with no e-mail signs in with the handle, and nobody's sign-in name moves
   until they press Randomise. What this still renames is what was never the shape at all:
   `BrightOtter42` and typed ones. Safe to run twice for the same reason as before: what it writes
   is shaped, and the second run asks the same one question.

   THIS OVERWRITES, WHICH `fillHandles` REFUSES TO, AND THE REASON IT MAY IS SIGN-IN. `fillHandles`
   only fills blanks because a handle used to be something you signed in with; `verifyLogin` reads
   the e-mail column and nothing else now, so a new handle locks nobody out. It changes the name
   friends see, which is what was asked for. (NOT QUITE ANY MORE: since 2 October a row with no
   e-mail signs in with its handle — which is the other reason a shaped handle is left alone above.
   An unshaped one on a blank-address row is renamed and that child's sign-in name moves with it;
   the report names them by id, so whoever runs this can tell them.)

   THE OLD ONE GOES ONTO `handle_was`, newest first, where that column exists — the same history
   Randomise keeps (`handleWasWith_`) — because that is a safeguarding column: "who was @foo last
   week" is asked exactly once, about the one account where it matters. `handle_changed_at` is
   written beside it where it exists: it is when the newest handle began, and there is no cooldown
   left for a rename somebody did not ask for to spend.

   A ROW ALREADY IN THE SHAPE IS LEFT ALONE, so a second run reports every row left alone and
   changes nothing. Reported by `person_id`, for the reason `fillHandles` gives.
================================================================================================ */
```

### A CHILD'S HANDLE IS NOT THIS JOB'S (342).

in `renameHandles`

```
/* A CHILD'S HANDLE IS NOT THIS JOB'S (342). It is moved by `kidHandles`, which shows what it would
       do before it does it; this one writes as it goes, and a child with no email signs in with the
       handle. Counted, so a run says it left them. */
```

### THE HISTORY BEFORE THE HANDLE (342, the review):

in `renameHandles`

```
/* THE HISTORY BEFORE THE HANDLE (342, the review): one `setCell` per column, in this order, so a
       write that fails between them leaves the old handle in `handle_was` AND in `handle` — harmless —
       never a new handle with nothing to say what the old one was, which for a row with no email is a
       sign-in name nobody can recover. */
```

### EVERY CHILD'S HANDLE INTO THEIR INITIALS AND FOUR DIGITS — `?run=kidHandles`, PREVIEWED FIRST (342)

top level, before `kidHandles`

```
/* ==================================================================================================
   EVERY CHILD'S HANDLE INTO THEIR INITIALS AND FOUR DIGITS — `?run=kidHandles`, PREVIEWED FIRST (342)

   THE OWNER, 11 OCT: *"Change usernames to be more abstract to hide the names of kids. Just use
   initials..."* `register`, `makeChild`, Randomise, `resetPin` and `fillHandles` give a child the new
   shape from now on (`handleMake_` asks `isChild_`); this is the other half — the children who already
   have a handle with their first name in it, which is every child on the sheet today.

   A PREVIEW UNLESS IT IS TOLD OTHERWISE. With no `arg` it writes NOTHING: how many children there are,
   how many it would move, how many of those sign in with the handle (no email of their own — the ones
   to tell), and each one by `person_id` with the handle they have and the initials they would get
   (`ej····` — the digits are drawn when it runs for real, so a preview that showed them would be
   showing handles nobody gets). `previewFromGitHub`'s rule, written down in CLAUDE.md: the run you can
   read before the run that writes. `&arg=apply` then moves them, and answers with the real before and
   after by `person_id`.

   WHY AN ADMIN'S JOB AND NOT THE NEXT SIGN-IN. A child who never signs in would keep a name-bearing
   handle on the score board, under their posts and on their family's cards for as long as they did
   not — and a handle changed in the middle of somebody signing in is a sign-in that cannot be
   previewed. Nor `autoMigrate`: that runs on every `?run` and `?setup`, with nothing shown first.

   NOBODY LOSES THEIR SIGN-IN. Every old handle goes to the front of `handle_was` (`handleWasWith_`),
   and `verifyLogin` and `forgotPin` still let it in when nobody has it as their handle now
   (`handleWasRows_`), saying the new one as they do. `handleTrouble_` will never hand an old one to
   somebody else. Sessions are keyed by `person_id`, so nobody is signed out; a signed-in phone learns
   the new handle from `myProfile` on its next open. Every `friends` list that named an old handle is
   moved with it (`handleFriendsMove_`).

   SAFE TO RUN TWICE: a handle already in a child's shape is left alone (`handleKidShaped_` — any
   initials, so a child whose name was corrected since is not moved again over a letter), so the second
   run moves nobody. A grown-up is never touched — their handles are `renameHandles'`.

   AND SAFE TO RUN AGAIN AFTER A RUN THAT FAILED PART-WAY (the review, round 1). Each child's history is
   written BEFORE their handle, in its own write — so whatever column order an import has left, a
   failure between the two leaves the old handle in both cells (harmless; the re-run moves them) rather
   than a new handle with no history, which for a child with no email is a lock-out nobody can see. The
   friends lists are moved from EVERY child's history, not only from this run's moves: a re-run after a
   failure finds the children already moved "already shaped" and has no moves of its own, and the lists
   naming their old handles were left wrong for good. An old handle nobody holds now and only one child
   ever had is that child, whichever run moved it. And the cache is cleared in a `finally`.

   WHAT THE PREVIEW ALSO SAYS, BY ID AND NEVER BY NAME:
     · `inAnotherHistory` — a child whose CURRENT handle is on somebody else's `handle_was`. Randomise
       could reissue a handle before 342 made old ones reservations; after the move that handle would be
       in two histories, and typing it would be refused as two accounts' ("ask us to sort it out") — so
       the child holding the slip would be the one locked out. Take the entry off the other row first.
     · `grownUpsSurnameInHandle` — a private grown-up (a parent, a client: `namePrivate_`) whose handle
       carries their surname. The net takes the surname out of their NAME everywhere, and a hand-typed
       `olabrisk` would carry it straight back beside their first name on every post and roster. Not
       moved here — a grown-up's sign-in name is theirs, and their handles are `renameHandles'` — only
       counted, so the admin sees it before anybody else does. */
```

### THE HISTORY FIRST, IN ITS OWN WRITE — see above.

in `kidHandles`

```
/* THE HISTORY FIRST, IN ITS OWN WRITE — see above. AND THE FACE THE OLD HANDLE DREW, in the same write,
         when nobody ever chose a look (`handleFaceKept_`, round 2): a blank look is drawn from the handle, so
         the move gave every such child a different skin and hair colour. */
```

### EVERY CHILD'S OLD HANDLES, whichever run moved them:

in `kidHandles`

```
/* EVERY CHILD'S OLD HANDLES, whichever run moved them: an entry on ONE row's history only, that
         row a child's, and nobody holding it now. `handleTrouble_` never reissues one, so "nobody holds
         it" stays true; an entry on two rows' histories is the case `inAnotherHistory` reports, and a
         list naming it is left as it is rather than guessed. */
```

### ---------- A PRIVATE GROWN-UP WHOSE HANDLE CARRIES THEIR SURNAME (342, the review)

top level, before `handleSurnameIn_`

```
/* ---------- A PRIVATE GROWN-UP WHOSE HANDLE CARRIES THEIR SURNAME (342, the review) -------------------
   The net calls a parent or a client by their first name to everybody else (`namePrivate_`), and the
   handle goes out beside it exactly as stored — so a hand-typed `olabrisk` defeats the rule on every
   post, roster and family card. By `person_id`, for an admin's report; a surname of under three letters
   is not looked for, because it is inside too many handles by chance to mean anything. Children are not
   asked: a child's handle is moved to initials by `kidHandles` whatever it says. */
```

### `key`, not `norm`. `norm` lowercases and trims; it does not touch punctuation, so "English Lang."

in `renameValue`

```
/* `key`, not `norm`. `norm` lowercases and trims; it does not touch punctuation, so "English
     Lang." and "english lang" stay different to it — and those are exactly the two spellings a
     value picks up over a year of being typed into a spreadsheet by hand. `key` strips everything
     that is not a letter or a digit, which is the same comparison `findPerson` uses to decide two
     names are the same person. */
```

### ---------- AND THEN THE DUPLICATES IT JUST MADE

in `renameValue`

```
/* ---------- AND THEN THE DUPLICATES IT JUST MADE ------------------------------------------
     A rename onto a name that ALREADY EXISTS is a merge, not a rename. "English Lang." becoming
     "English Language" when there is already an English Language leaves two rows saying the same
     thing — two identical entries in the subject dropdown, and two pricing rows for one subject
     where only one of them can be the multiplier that applies.

     Nothing would have thrown. The list would simply have shown the same subject twice, and the
     price would have been whichever row happened to be read first — which is the kind of fault
     that gets noticed on an invoice rather than on a screen.

     Only LIST tabs, where a row IS its value. A resource with the same subject as another resource
     is not a duplicate; it is two resources on the same subject. */
```

### MAKE THE @family. ADMIN ACCOUNT.

top level, before `makeBrandAccount`

```
/**
 * MAKE THE @family. ADMIN ACCOUNT. Run ONCE from the editor, with a PIN:
 *
 *     makeBrandAccount('4821')
 *
 * By hand this is a row with four fields that fail SILENTLY if they are wrong, which is why it is
 * a function:
 *   · `role` must be exactly `admin` — anything else and every admin control is simply absent
 *   · `pin` must be 4 to 8 digits, or verifyLogin refuses it with "Name or PIN not recognised"
 *   · `verified` must NOT read PENDING. Blank is right: blank means an account that predates
 *     email confirmation, and PENDING means one that is waiting for a link nobody will send
 *   · `listed` must be FALSE, or the business appears in the site's own list of tutors
 *
 * ONE NOTE ON THE NAME. `findPerson` compares names with everything but letters and digits
 * stripped, so "@family." and "family" are the same login. That is deliberate — nobody types
 * punctuation into a login box reliably — and it means either will get you in.
 *
 * AND ONE CONSEQUENCE WORTH HAVING. Posts made as the business are authored "@family.", and the
 * feed looks an author up in the people list to find their face. So a photo on this row becomes
 * the mark on every brand post, without brand!logo_square needing to be filled in at all.
 */
```

### ---------- HOW LONG THE FIRST REQUEST AFTER A DEPLOY MAY TAKE

top level, before `makeBrandAccount`

```
/* ---------- HOW LONG THE FIRST REQUEST AFTER A DEPLOY MAY TAKE ------------------------------------
   Everything ensureSchema does is now a handful of round trips rather than one per row, which is
   what makes it safe to run on somebody's page load. Anything added to it later has to keep that
   property: a loop calling setValue or addRow per row will be fine on this sheet and will time the
   site out on a bigger one, and the failure is an HTML error page rather than an error message.

   The rule: read a range, change the array, write the range. Once.
--------------------------------------------------------------------------------------------- */
```

### ---------- THROUGH `authSetPin_`, AND THIS LINE IS WHY THE OWNER COULD NOT SIGN IN

in `makeBrandAccount`

```
/* ---------- THROUGH `authSetPin_`, AND THIS LINE IS WHY THE OWNER COULD NOT SIGN IN ----------
       IT WAS `setCell(t, existing, 'pin', String(pin))` AND IT LEFT `pin_hash` STANDING.
       `authCheckPin_`'s second line is `if (hash) return authSame_(...)` — a row with a hash never
       consults the plaintext again — so this wrote the digits into a cell nothing reads and left the
       real credential as a hash of some earlier PIN. The row is then unverifiable for ever: the
       owner types what is visibly in the sheet and is refused every time, with nothing anywhere
       saying why.

       MEASURED ON THE LIVE SHEET: P001 carries `pin`, `pin_hash` AND `pin_salt` all populated, which
       is this line's output cell for cell — and the reason "I cannot sign in but <a client> can" is
       that she is a client, so no brand-account path has ever touched her plaintext cell.

       AND `dataProblems` SENT PEOPLE HERE. It tested `!S(brand.pin)` — the cell `authSetPin_`
       deliberately empties — so it reported every correctly hashed admin as having no PIN and told
       the owner to run this function. Following the app's own advice created the fault. See
       `hasPin_` in booking.gs.

       THE THROTTLE GOES WITH IT, because this function's own note two lines up says it exists to
       "make sure it actually WORKS" — and a row at the top of the lockout ladder does not work
       however right its PIN is. `tries` is what `authWrong_` counts and nothing but a successful
       sign-in resets it, so a row that has been refused ten times stays one typo from an hour's
       wait. Clearing both is the difference between a repair and a repair you cannot use.

       THROUGH `authClearThrottle_` RATHER THAN THE TWO LINES, which is what this was before the
       helper existed. Four paths issue a PIN and this was the only one that remembered — so the
       argument above was right and was written down in exactly one of the four places that needed
       it. `check-backend.js` asks the question now. */
```

### ---------- NO E-MAIL ON THE BRAND ROW, WHICH IT USED TO BORROW FROM WHOEVER THE ADMIN WAS

in `makeBrandAccount`

```
/* ---------- NO E-MAIL ON THE BRAND ROW, WHICH IT USED TO BORROW FROM WHOEVER THE ADMIN WAS ------
     It copied the current admin's address so notifications would still reach them. That was
     harmless while an address was only somewhere to send mail; SIGNING IN IS AN ADDRESS NOW, and
     `verifyLogin` refuses an address held by two rows rather than guessing between them — so this
     line would have locked the owner AND the brand account out of PIN sign-in the moment it ran.
     Notifications do not need it: `notify` falls back to any admin with an address. */
```

### NO `pin` HERE. It used to be `pin: String(pin)` — the brand account's PIN sitting in a spreadsheet cell in plain sight, which is the whole thing `authSetPin_`

in `row`

```
/* NO `pin` HERE. It used to be `pin: String(pin)` — the brand account's PIN sitting in a
       spreadsheet cell in plain sight, which is the whole thing `authSetPin_` was written to stop,
       on the one row that can reach every control on the site. The hash is set below, once the row
       exists and there is something for `setCell` to write to. */
```

### AFTER `addRow`, BECAUSE `authSetPin_` WRITES THROUGH `setCell` and that needs a row on the sheet.

in `makeBrandAccount`

```
/* AFTER `addRow`, BECAUSE `authSetPin_` WRITES THROUGH `setCell` and that needs a row on the
     sheet. So the PIN is hashed in a second step rather than passed in — which is also what makes
     the created row and the repaired row above end in exactly the same state. */
```

### Nothing to clear on a row `addRow` made a moment ago — and it is written anyway, because the note above claims both paths end in the same state and an

in `makeBrandAccount`

```
/* Nothing to clear on a row `addRow` made a moment ago — and it is written anyway, because
     the note above claims both paths end in the same state and an unwritten cell is only
     nearly that. `N('')` is 0, so this changes no behaviour; it removes the reader's need to
     know that. */
```

### EVERY OLD LIKE BECOMES A 👍.

top level, before `migrateLikes`

```
/**
 * EVERY OLD LIKE BECOMES A 👍.
 *
 * Run ONCE from the editor. Likes and reactions were two ways of saying the same thing, and the
 * heart has gone — but a press is a press, and deleting a year of them because the control they
 * belonged to was retired would be throwing away the only record of what anybody thought of a
 * photograph.
 *
 * Idempotent, and careful about the one case that matters: somebody who liked a post AND reacted
 * to it already has an opinion on file, and that one wins. A person gets one reaction per post,
 * so overwriting theirs with a thumb would be the migration deciding they had meant something
 * else.
 */
```

### No sleep. The id carries `made`, which differs on every row, so two written in the same millisecond were never going to collide — the same thing that was

in `migrateLikes`

```
/* No sleep. The id carries `made`, which differs on every row, so two written in the same
       millisecond were never going to collide — the same thing that was slowing the resource ids
       down to the point of timing the request out. */
```

### ---------- FOUR PAPER JOBS WERE HERE, AND CLAUDE.md ALREADY SAID NOT TO RUN THEM

top level, before `seedLandmarks`

```
/* ---------- FOUR PAPER JOBS WERE HERE, AND CLAUDE.md ALREADY SAID NOT TO RUN THEM ----------------
   `ensureResourceIds` gave every document row an id. `seedPastPapers` wrote 78 Edexcel GCSE Maths
   papers, `seedALevelPapers` 42 A-Level and AS ones, and `dropOldALevelPapers` removed eight empty
   rows before them. Between them they are most of what is in the library today, and every one of
   them appended to the `questions` tab.

   THAT TAB IS `data/questions.json` IN THIS REPOSITORY NOW, and CLAUDE.md has carried the line "do
   not seed that tab" since the real rows were found in a file that had been written off as junk. A
   seeder is the sharpest version of that warning: `sheetFor_` answers a blank id for an unrouted
   name, `read` cannot tell that from an empty tab, and `appendRow` on nothing succeeds. It would
   report "78 papers added" and add none — or worse, find a tab of that name somebody recreated and
   fill it with a second copy of a library that already exists in git.

   ADDING A PAPER IS A COMMIT NOW. One JSON object per line in `data/questions.json`, which is what
   made moving it worth doing: a diff names the rows that changed, and there is no export, no CSV,
   no File → Import, and no wondering whether it landed. */
```

### THE COLLIERS WOOD LANDMARKS, WRITTEN INTO THE TAB.

top level, before `seedLandmarks`

```
/**
 * THE COLLIERS WOOD LANDMARKS, WRITTEN INTO THE TAB.
 *
 * Five real buildings with their surveyed outlines — every corner as OpenStreetMap holds it, not a
 * rectangle drawn round them. The `landmarks` tab has been in the schema for months with nothing in
 * it; these are the rows.
 *
 * THE OUTLINE IS THE ONLY THING THAT HAS TO BE RIGHT. `width_m`, `depth_m` and `bearing` are written
 * too, because the tab has the columns and something that cannot parse a polygon can still draw a
 * box — but they are DERIVED from the outline here, by finding the smallest rectangle that holds it.
 * Nobody types them, so nobody can type them wrong, and if the outline is ever corrected they are
 * recomputed rather than left disagreeing with it.
 *
 * WHY THAT MATTERS, in this exact case: Britannia Point is 17 storeys and 13,000 m² of TOTAL FLOOR
 * SPACE. Its footprint is a fraction of that. Those two numbers sit side by side in every description
 * of the building, and an `area` column would take whichever was typed. A polygon cannot be
 * misunderstood.
 *
 * IDEMPOTENT, BY NAME AND WORLD. Run it as often as you like: a landmark already on the tab is left
 * exactly as it is, including anything you have since corrected by hand. It adds what is missing and
 * touches nothing else.
 */
```

### THERE WERE TWO OF THESE.

top level, before `seedLandmarks`

```
/* THERE WERE TWO OF THESE. An earlier `seedLandmarks` was already in this file, and it wrote the
   outline with SEMICOLONS between the points while `landmarks()` in 40_content splits on COMMAS —
   so every polygon would have parsed as one long unreadable point and every building would have
   fallen back to its bounding box. Nothing would have thrown; the shapes would just quietly have
   been rectangles.
   The one that survives writes commas, which is what the reader has always wanted. */
```

### THE TAB'S OWN NAMES.

in `seedLandmarks`

```
/* THE TAB'S OWN NAMES. These were `width_m`, `depth_m`, `height_m` and `colour`, none of
         which is a column of the landmarks tab — so `addRow` dropped all four in silence and every
         seeded landmark arrived with no size and no colour. `shape` is gone with them: there is no
         such column and nothing reads one. */
```

### WHEN EASTER IS, and it is the only date on this tab that needs arithmetic rather than a rule.

top level, before `easterOf_`

```
/**
 * WHEN EASTER IS, and it is the only date on this tab that needs arithmetic rather than a rule.
 *
 * Five of the eighteen holidays hang off it — Pancake Day is 47 days before, Mother's Day 21,
 * Good Friday 2, Easter Monday 1 after — so getting this one right gets six rows right, and
 * getting it wrong moves them all by the same amount, which looks plausible and is not.
 *
 * The anonymous Gregorian computus. Written out rather than trusted to a library, because there is
 * no library here, and checked against the years it will actually be used for: 5 April 2026 and
 * 28 March 2027.
 */
```

### And the last one — "the last Monday in August".

top level, before `lastDow_`

```
/** And the last one — "the last Monday in August".

    `new Date(y, month, 0)` IS THE LAST DAY OF THE MONTH BEFORE, because Date counts months from
    zero and day 0 is the day before the first. Passing 5 for May therefore landed on 30 June and
    walked back to a Monday in the WRONG MONTH — 31 May 2026 came out as the Spring bank holiday
    and it is a Sunday. `month` here is the human one, 1 for January, to match `nthDow_` beside it;
    so the last day of it is day 0 of the NEXT, which is `month` itself once Date has taken its
    zero off. */
```

### `month` is the human one — 5 is May — and Date counts from zero, so May is index 4 and the last day of it is day 0 of index 5.

in `lastDow_`

```
/* `month` is the human one — 5 is May — and Date counts from zero, so May is index 4 and the
     last day of it is day 0 of index 5. Written as the one expression rather than adjusted
     afterwards: the first attempt at this returned a Sunday for the Spring bank holiday and the
     correction moved it a month, which is what happens when an off-by-one is patched by feel
     instead of stated. */
```

### THE HOLIDAYS OF ONE YEAR, WRITTEN INTO THE TAB.

top level, before `seedHolidays`

```
/**
 * THE HOLIDAYS OF ONE YEAR, WRITTEN INTO THE TAB.
 *
 * Computed rather than typed, for the reason set out on the schema: ten of these move, and five of
 * them move with Easter. A list somebody types is right for one year.
 *
 * `opens_days` IS A JUDGEMENT AND IT IS PER HOLIDAY. Christmas wants six weeks to fill four seats
 * and Pancake Day wants one — a single "open a month ahead" would put a February event on the
 * screen in January and a December one up too late to fill.
 *
 * IDEMPOTENT, BY NAME AND YEAR. A row already there is left exactly as it is, including a date you
 * have moved or an `opens_days` you have changed — this fills a year in, it does not overwrite a
 * decision. Run it again next January and it adds the next year and touches nothing else.
 */
```

### OFF BY DEFAULT, and that is deliberate.

in `seedHolidays`

```
/* OFF BY DEFAULT, and that is deliberate. Eighteen holidays switched on is eighteen waitlists
         opening themselves at a business that runs perhaps three events a year — the tab is the
         CALENDAR, and turning one on is you deciding to run it. */
```

### THE SAME LOOKUP `read` USES.

in `ensureSchema`

```
/* THE SAME LOOKUP `read` USES. Without it this walks the ledger, fails to find `venues`, and
       creates a fresh empty one — so the app would read the real venues from the settings file
       while a decoy sat in the database looking like the real thing. */
```

### TWO DIFFERENT FAULTS, AND THEY NEED DIFFERENT WORDS.

in `ensureSchema`

```
/* TWO DIFFERENT FAULTS, AND THEY NEED DIFFERENT WORDS. `sheetFor_` returns a blank id both for a
       tab routed at a file whose id is not filled in, and for a tab with no line in `WHERE` at all.
       The first is a configuration step somebody has not done yet; the second is a tab in SCHEMA
       that nothing can ever reach, and it stays invisible until something says the word `WHERE`. */
```

### ---------- A FILE THAT WILL NOT OPEN IS ONE TAB'S PROBLEM, NOT EVERY TAB'S

in `ensureSchema`

```
/* ---------- A FILE THAT WILL NOT OPEN IS ONE TAB'S PROBLEM, NOT EVERY TAB'S ------------------
       THIS WAS A BARE `openById` AND IT WOULD HAVE TAKEN `?setup=1` DOWN. Found while checking
       whether the `Settings` spreadsheet was safe to delete: one tab still routed at a binned file
       throws here, the throw escapes `ensureSchema`, and the run dies on the first name in
       `SCHEMA` — so `post_comments`, which only this creates, would never have been made, and the
       comments feature would have sat there looking broken with nothing saying why.

       THE ROUTE IS FIXED TOO — nothing points at that file any more — but repairing the instance
       and not the rule is the shape CLAUDE.md records under `cost: 0`, under `paper: true` and
       under the spelling fold, every time with the fault coming back. A tab whose file will not
       open is reported and skipped, and every other tab is still checked. */
```

### ---------- `at.tab` HAS NEVER EXISTED

in `ensureSchema`

```
/* ---------- `at.tab` HAS NEVER EXISTED -------------------------------------------------------
       `sheetFor_` RETURNS `id`, `names`, `make` AND `away`. There is no `tab`, and there never was —
       so this asked for `getSheetByName(undefined)`, found nothing every single time, and then
       called `insertSheet(undefined)`, which creates a sheet with a DEFAULT name. Run once against a
       full database it reported "tab created" for all forty tabs and left forty `Sheet1`-style
       sheets holding nothing but headers, while the real tabs went untouched — so the columns this
       function exists to add were never added, and the report said the opposite.

       IT LOOKS THE WAY `read` LOOKS. `at.names` is the list `read` tries in order — the code's own
       name first, then whatever the tab has been renamed to — so a tab called `items&shop` is found
       rather than duplicated. Only when none of them exists is one made, under `at.make`, which is
       the name the code asks for. */
```

### ---------- A TAB IS AS WIDE AS ITS GRID, AND THE GRID IS NOT AS WIDE AS SCHEMA

in `ensureSchema`

```
/* ---------- A TAB IS AS WIDE AS ITS GRID, AND THE GRID IS NOT AS WIDE AS SCHEMA ---------------
         `getRange` REFUSES A RANGE PAST THE TAB'S LAST COLUMN — "The coordinates of the range are
         outside the dimensions of the sheet" — and a tab made by importing an xlsx is sized to its
         content: the live `people` came from the 4 Oct file at exactly 61 columns, `jobs` at 39,
         `landmarks` at 29, not one spare between them. Found on 10 Oct, before the owner's first
         sitting with the submissions backend, by running this function over that morning's export
         in a model that sizes each tab as the export did: it threw here on `people` — the FIRST name
         in SCHEMA, nine columns short (parent_email … approvals_email) — nothing caught it, and
         nothing after it ran: no `submissions`, no `answers`, no config rows. Not seen on the live
         sheet, because it was caught first. The harness could not see it, because its tabs were
         exactly as wide as whatever was written to them (`grid` in js/check-gas-load.js now gives a
         tab its size, and check-submissions section 9b runs this over a tab with no spare column).

         THE GRID IS WIDENED FIRST, at its right-hand edge, so nothing that is already there moves —
         the same rule as the comment above, kept for the grid as well as the headers. */
```

### ---------- AND A HANDLE, WHICH A ROW TYPED INTO THE SHEET HAS NOT GOT

in `ensureSchema`

```
/* ---------- AND A HANDLE, WHICH A ROW TYPED INTO THE SHEET HAS NOT GOT ------------------------
     `fillHandles` RAN ONLY FROM `?run=fillHandles`, which nobody runs. A child added by hand had no
     handle — and a child with no address signs in with nothing else — while every card printed their
     first name where the handle goes, which the sign-in box then refused. So it runs wherever the
     ids are filled, and on the same terms: a blank is filled, nothing is overwritten. */
```

### ---------- WHAT IS WRONG WITH THE DATA

top level, before `dataProblems`

```
/* ---------- WHAT IS WRONG WITH THE DATA --------------------------------------------------------
   The health check has always reported missing COLUMNS. This reports missing SENSE — the things
   that are structurally fine and factually broken, which is most of what actually stops the site
   working.

   Every item here is something that had to be noticed by a person and told to somebody. A term
   ending before it starts, a tutor with no hours, a client with no email: none of them throws, all
   of them silently remove a feature, and each one was found by staring at a spreadsheet.
   The system knows all of it already. It should say so.

   Ordered by what it costs you: things that stop money, then things that stop contact, then
   things that are merely untidy.
--------------------------------------------------------------------------------------------- */
```

### `deep` — whether to run the checks that COST SOMETHING:

top level, before `dataProblems`

```
/* `deep` — whether to run the checks that COST SOMETHING: asking Drive whether it may write, and
   reading thirty tab headers to list missing columns. Off by default, because this function is
   called on every admin page load and both of those are round trips somebody is waiting on.
   `?health=1` turns it on, which is somebody opening the health card on purpose. */
```

### THEIR OWN CUT OF AN EXTRA SEAT (docs/history/345), typed into the sheet by hand where the card's refusal cannot reach.

in `dataProblems`

```
/* THEIR OWN CUT OF AN EXTRA SEAT (docs/history/345), typed into the sheet by hand where the card's
         refusal cannot reach. ASKED OF `seatCutOut_`, the one reading, because this said "priced as no cut"
         over a cell the price read otherwise — "£0.10" was 0.1 to the price and "no cut" here (the review
         of 345). Anything it does not read as a cut is priced at the config B, which is what this says. */
```

### ---------- THE LAW-COLOUR CHECK WENT WITH THE TAB

in `dataProblems`

```
/* ---------- THE LAW-COLOUR CHECK WENT WITH THE TAB ---------------------------------------------
     `laws` IS `data/settings/laws.json` NOW and the tab held no rows, so this health check had
     nothing to walk even before the move. What it asked was worth asking — `mark()` skips a law
     whose colour has no class, so a misspelt colour reads as the law not working — and the place
     to ask it is wherever the file is checked, not here, because this cannot open a file in git. */
```

### Columns something has actually tried to write to during THIS request and could not find.

in `dataProblems`

```
/* Columns something has actually tried to write to during THIS request and could not find.
     Distinct from the schema-version check below: that says the update never ran, this says it ran
     and something is still missing — a column removed by hand, or a name that only exists in the
     code. */
```

### THE JOBS THAT RUN THEMSELVES, AND WHETHER THEY DID.

in `dataProblems`

```
/* THE JOBS THAT RUN THEMSELVES, AND WHETHER THEY DID. Each is attempted once and never retried
     on its own, so a failure is permanent until somebody asks again — which means it has to be
     said somewhere a person looks rather than only in an execution log nobody opens. */
```

### WHICH COLUMNS — BUT NOT ON A PAGE LOAD.

in `dataProblems`

```
/* WHICH COLUMNS — BUT NOT ON A PAGE LOAD.
         `schemaGaps` opens the spreadsheet and reads the header row of all THIRTY tabs, one round
         trip each, to say which columns are missing. That is the right answer to the question and
         it is thirty round trips added to a request somebody is waiting on.

         AND IT COULD NOT STOP. This fires when SCHEMA_VERSION does not match BACKEND_VERSION, and
         the only thing that records a match is `autoMigrate` — which no longer runs on a page load,
         because it was the previous thing making page loads slow. So the condition became permanent
         and the cost became every-admin-every-load. Two fixes that were each right on their own and
         together made a loop.

         THE HEADLINE NEEDS NO SPREADSHEET. "The sheet is behind the code" is known from two strings
         already in hand, and that is the part that tells somebody to act. WHICH columns is the
         detail, and detail is what `?health=1` is for. */
```

### CAN THE DEPLOYMENT WRITE TO DRIVE?

in `dataProblems`

```
/* CAN THE DEPLOYMENT WRITE TO DRIVE? Not the editor — the deployment, which is the one that
     serves the site and the one that pins its own manifest. The two disagree exactly when a scope
     has been declared and not yet published, which is the state that produces "permissions are not
     sufficient" on a photograph somebody is trying to post right now. */
```

### ---------- THIS USED TO RUN ON EVERY ADMIN PAGE LOAD

in `dataProblems`

```
/* ---------- THIS USED TO RUN ON EVERY ADMIN PAGE LOAD ------------------------------------------
       It opens the Drive folder, CREATES A FILE IN IT and deletes it again — three round trips to
       another Google service, before the payload has been built, every single time an admin opened
       the app. Drive permission is the one thing on this project that has broken repeatedly, and a
       Drive call that hangs takes the whole request with it: the phone sits on a loading animation
       and nothing anywhere says why.

       IT IS A SETUP QUESTION, ASKED ONCE. Whether this deployment may write to Drive changes when
       somebody grants a scope and at no other time — so asking it on every load is asking a settled
       question over and over at the cost of the thing people are waiting for.

       SO IT IS ONLY ASKED WHEN THE REPORT IS ASKED FOR BY NAME: `?health=1`, or `checkEverything`
       from the editor. The ordinary admin load gets every other check in this function — the terms,
       the tutors, the venues, the pricing, the schema — and skips the one that leaves the building. */
```

### Not "no posts can be made" — the scan still works, and posting by dropping files into the folder is a complete route.

in `dataProblems`

```
/* Not "no posts can be made" — the scan still works, and posting by dropping files into
           the folder is a complete route. What is lost is uploading a photograph from inside the
           app, which is one of two ways rather than the only one. */
```

### A PAGE-COUNT TALLY WAS HERE, and so was a second one under `printing` below.

in `dataProblems`

```
/* A PAGE-COUNT TALLY WAS HERE, and so was a second one under `printing` below. Both counted
     document rows with a Drive link and no `pages`, because a count is what prices a print. There
     are no document rows in any spreadsheet — the library is `data/questions.json` — so this check
     could only ever have reported 0 of 0, which is the most convincing kind of wrong answer. */
```

### LANDMARKS THAT HAVE NOT BEEN MEASURED.

in `dataProblems`

```
/* LANDMARKS THAT HAVE NOT BEEN MEASURED. A row with a position and no size can be put on the
     map as a point and cannot be drawn as a building — which is worth saying, because the whole
     value of this tab is the measuring and a half-filled row looks finished in a spreadsheet. */
```

### VENUES WITH NO COORDINATES.

in `dataProblems`

```
/* VENUES WITH NO COORDINATES. The map places what it can and lays the rest at its edge, which
     is honest and easy to miss — so it is said here too, with the reason: a venue with no postcode
     is waiting for somebody, and one WITH a postcode and no coordinates means the geocoder has not
     managed to run. Those are different problems and only one of them is yours. */
```

### THE ADMIN ACCOUNT ITSELF.

in `dataProblems`

```
/* THE ADMIN ACCOUNT ITSELF. `adminName_()` falls back to any admin with an email, so
     notifications keep arriving — but nobody can SIGN IN as an account with no PIN, and an admin
     row that cannot be logged into is an admin nobody has. */
```

### `hasPin_`, NOT `S(brand.pin)`.

in `dataProblems`

```
/* `hasPin_`, NOT `S(brand.pin)`. That cell is EMPTY on every correctly hashed row, so this
       reported a working admin as unable to sign in — and sent them to `makeBrandAccount`, which
       until today wrote the plaintext and left the hash standing. The diagnostic manufactured the
       fault it was diagnosing. See the note over `hasPin_` in booking.gs. */
```

### `brand!logo_square` IS CHECKED ON THE PHONE OR NOWHERE.

in `dataProblems`

```
/* `brand!logo_square` IS CHECKED ON THE PHONE OR NOWHERE. The tab is `data/settings/brand.json`
     now and this cannot read it; `brand('logo_square', …)` already falls back to a letter in a
     circle, which is the behaviour this was warning about rather than a fault it could fix. */
```

### MONEY OWED BACK. A client who paid and then withdrew is kept on the roster marked `Withdrawn` precisely so this can find them — the seat is gone and the

in `dataProblems`

```
/* MONEY OWED BACK. A client who paid and then withdrew is kept on the roster marked `Withdrawn`
     precisely so this can find them — the seat is gone and the payment is not, and a refund is a
     thing a person has to do. Nothing else in this system will ever mention it: the job reads
     cancelled, the card shows nobody coming, and the only other trace is a Confirm in the events
     tab that nothing reads. */
```

### ---------- THE TERM DATES, CHECKED AGAINST EACH OTHER

in `dataProblems`

```
/* ---------- THE TERM DATES, CHECKED AGAINST EACH OTHER ------------------------------------------
     A TERM WITH BAD DATES SAT IN THE SHEET AND NOTHING SAID SO. `termWindow` already computes a
     `dateFault` when a term ends before it starts, and it is sent to the phone — where it is used
     to grey out a booking, which is the right thing to do with it and no help at all if you are
     trying to find out WHY nothing can be booked.

     THREE FAULTS, because they fail in three different ways and a report that lumps them together
     tells you nothing about which to fix:

       BACKWARDS   ends before it starts. Every calculation of length comes out negative.
       OVERLAPPING two terms covering the same day, so a booking can be in both at once.
       A GAP       days belonging to no term, where a booking has no term to be in.

     Overlaps and gaps need the rows compared to each other, which is why nothing found them: every
     check up to now looked at one row at a time, and neither fault exists in a single row. */
```

### ---------- AND WHAT IS MISSING, AGAINST THE COMPUTED YEAR

in `dataProblems`

```
/* ---------- AND WHAT IS MISSING, AGAINST THE COMPUTED YEAR --------------------------------
         THE CHECKS ABOVE ONLY SEE ROWS THAT EXIST. A year with two terms entered and ten missing
         passes every one of them — nothing is backwards, nothing overlaps — and is useless, because
         a booking in March has no term to sit in.
         `termsFor` fills a year in from the rules, so comparing against it says which rows are
         absent rather than only whether the ones present are sane. */
```

### RUN THIS FROM THE EDITOR when anything is not appearing.

top level, before `checkEverything`

```
/**
 * RUN THIS FROM THE EDITOR when anything is not appearing.
 *
 * `checkEverything` — pick it from the dropdown, press Run, and paste the log.
 *
 * It exists because guessing has cost several rounds: is the backend deployed, does the tab exist,
 * is the row filled in, is the site old? Each of those looks identical from the outside — the
 * thing you wanted simply is not there.
 *
 * This answers all of them in one run.
 */
```

### WHICH SHEET. "I changed the cell and nothing happened" is answered here more often than anywhere else — two spreadsheets open in two tabs is the easiest

in `checkEverything`

```
/* WHICH SHEET. "I changed the cell and nothing happened" is answered here more often than
     anywhere else — two spreadsheets open in two tabs is the easiest mistake in this whole
     system to make, and from the outside it is indistinguishable from a broken feature. */
```

### THE NAME IS THE CHECK, not decoration.

in `checkEverything`

```
/* THE NAME IS THE CHECK, not decoration. Opening it proves the id is a Google Sheet rather than
       an .xlsx upload — the fault that made every section load empty, and that no amount of reading
       the id could have caught, because both files have the same title and the same owner. */
```

### 2. THE BRANDING. It listed every key of the `brand` tab and said which reactions were in use.

in `checkEverything`

```
/* 2. THE BRANDING. It listed every key of the `brand` tab and said which reactions were in use.
        That tab is `data/settings/brand.json` in the repository now — the phone reads it and this
        cannot, so what is left is the half the server still decides. */
```

### 4. RESOURCES WAS HERE — ids, page counts and what could be sold on paper.

in `checkEverything`

```
/* 4. RESOURCES WAS HERE — ids, page counts and what could be sold on paper. This report reads
     spreadsheets, and the library is not one: `data/questions.json` in this repository is where the
     642 documents and 3,271 questions live, and `node js/check-rows.js` is what inspects it. */
```

### RUN THIS FROM THE EDITOR when the scan finds nothing.

top level, before `checkPostsFolder`

```
/**
 * RUN THIS FROM THE EDITOR when the scan finds nothing.
 *
 * Pick `checkPostsFolder` from the dropdown, press Run, and read the log. It answers the four
 * questions in order, and stops at the first one that fails — so the answer is the last line
 * rather than something to interpret.
 *
 * It goes through the editor rather than the site on purpose: no deployment, no permissions, no
 * caching, no web layer. Whatever it says is the truth about the folder itself.
 */
```

### Install the background jobs.

top level, before `installTriggers`

```
/**
 * Install the background jobs. Run ONCE from the editor (or load /exec?triggers=1).
 *
 * Deliberately not on page load: reading a PDF takes a second or two, so even two per visit would
 * put seconds back onto a page that was already slow enough to time out once. A trigger does the
 * same work with nobody waiting on it.
 *
 * Idempotent — existing triggers for these functions are cleared first, so running it twice leaves
 * one of each rather than two.
 */
```

### `geocodeVenues` is here so a postcode typed on Tuesday is placed on Tuesday night without anybody being told to go and run something.

in `installTriggers`

```
/* `geocodeVenues` is here so a postcode typed on Tuesday is placed on Tuesday night without
     anybody being told to go and run something. It costs one request and does nothing at all when
     every venue is already placed, which is almost every night. */
```

### `refreshPageCounts` WAS THE THIRD.

in `installTriggers`

```
/* `refreshPageCounts` WAS THE THIRD. It read PDFs out of Drive to price a print and wrote the
     number into a document row; there is no document row. It is still NAMED here so that a project
     which has already installed the old trigger has it deleted rather than left running nightly
     against a function that no longer exists. */
```

### ---------- AND THE ONE THAT DECIDES WHETHER THE SPREADSHEET IS THE SITE

in `installTriggers`

```
/* ---------- AND THE ONE THAT DECIDES WHETHER THE SPREADSHEET IS THE SITE -----------------------
     `installSheetWatch` WAS "run once, by hand, after deploying", which is a sentence in a comment,
     and a sentence in a comment is not a thing that has happened. The evidence that it never did is
     the fault itself: an edit typed into a tab took up to six hours to appear on the site, because
     nothing retired the stored payload except a write made through the app.

     A SETUP STEP YOU HAVE TO REMEMBER IS A SETUP STEP THAT IS SOMETIMES SKIPPED, and this one is
     skipped silently and looks exactly like the sheet not being wired to the site at all. So
     `/exec?triggers=1` now does it.

     REPORTED, NOT ASSUMED. It returns what actually happened, because a watch that could not be
     installed — the account cannot open the subjects file, the trigger quota is full — must not be
     reported as installed by a function that only tried. */
```

### ---------- AND `installWarmTrigger` IS DELIBERATELY NOT CALLED HERE

in `installTriggers`

```
/* ---------- AND `installWarmTrigger` IS DELIBERATELY NOT CALLED HERE ----------------------------
     IT WOULD EXHAUST THE ACCOUNT'S SCRIPT TIME AND TAKE THE NIGHTLY JOBS DOWN WITH IT. Every five
     minutes is 288 runs a day; each one waits on a payload build, which is about thirty-five
     seconds for the anonymous copy and another for each admin. That is five hours of script time a
     day against a daily allowance of ninety minutes — so the warmer would spend the budget before
     lunch and everything scheduled after that, `closeFinishedJobs` included, would simply not run.
     A speed measure that stops the site's own maintenance is not a speed measure.

     AND IT IS NO LONGER THE THING THAT KEEPS EDITS FAST. It existed to cover the moment the stored
     copy expires; `warmAfterEdit` now covers the moment it actually matters — a minute after you
     stop typing — and costs nothing on a day nobody edits anything. Polling every five minutes to
     notice a change the spreadsheet can simply tell us about is the arrangement this replaces.

     STILL THERE TO RUN BY HAND if a day ever comes where the six-hourly expiry is worth paying for.
     `?run=installWarmTrigger&name=…&pin=…`, and read the paragraph above first. */
```

### WHAT THIS DEPLOYMENT IS ACTUALLY ALLOWED TO DO.

top level, before `checkScopes`

```
/**
 * WHAT THIS DEPLOYMENT IS ACTUALLY ALLOWED TO DO.
 *
 * Not what the manifest asks for — what the token in its hand was granted. Those are different
 * things and the difference is invisible from every other angle: the manifest can list Drive, the
 * editor can be authorised, and the running deployment can still hold a token issued before any of
 * that, which produces "permissions are not sufficient" from code that looks entirely correct.
 *
 * Google will list a token's scopes if you ask it, so this stops being a matter of retracing four
 * steps and becomes a matter of reading a list.
 *
 *     /exec?run=checkScopes&name=…&pin=…
 *
 * A scope that is missing here is missing FOR THE THING SERVING THE SITE, whatever the editor says.
 */
```

### `heldScopes_` and `holdsScope_` in content.gs — one asking of Google, and a scope matched by its WHOLE name.

in `checkScopes`

```
/* `heldScopes_` and `holdsScope_` in content.gs — one asking of Google, and a scope matched by its
     WHOLE name. This matched `indexOf('/auth/drive')`, which `drive.readonly` contains, so it called
     a read-only token able to create and share post photographs. */
```

### RUN THIS ONCE FROM THE EDITOR to grant Drive access, and to prove it.

top level, before `authoriseDrive`

```
/**
 * RUN THIS ONCE FROM THE EDITOR to grant Drive access, and to prove it.
 *
 * A deployment cannot raise the consent screen itself — that has to be a manual run — which is why
 * a redeploy alone never fixes a permission.
 *
 * IT WRITES, not just reads. The previous version only listed the folder, so it reported success
 * on a token that could read and not create — and the first anybody knew was "Specified
 * permissions are not sufficient to call DriveApp.Folder.createFile" while trying to post a
 * photograph. Read access is not write access, and a check that only reads is a check that passes
 * in exactly the case you need it to fail. So the test file is made, SHARED BY LINK and binned —
 * the three calls a real photograph makes — and nothing is left behind.
 *
 * ---------- ITS LAST LINE IS THE GATE FOR DEPLOYING, AND IT USED TO BE WHATEVER CAME LAST ----------
 * THE OWNER STEPS SAID "its log should end Can write: yes", and two things made that a suggestion
 * rather than a gate. The log did not always end there — the showcase folder's line comes after it
 * when `showcase_folder_id` is set — and "Can write" is one permission of six. Google's consent
 * screen has a tick box per permission now, so an Allow that grants Drive and leaves the e-mail one
 * unticked writes the test file perfectly and still leaves the script short.
 *
 * THAT ORDERING IS THE ONE THAT TAKES THE WHOLE SITE DOWN. The web app runs as the person who
 * deployed it, so a new version whose manifest lists a permission that person has not granted
 * answers EVERY visitor "Authorization is required" — and Tools → Check uploads cannot say so,
 * because it runs on that same broken deployment. This log, read in the editor before deploying,
 * is the only place the mistake can be caught. So the last line is always one of two sentences,
 * READY or DO NOT DEPLOY, and READY needs all three: Apps Script says nothing is left to authorise
 * (the whole manifest, not just Drive — `getAuthorizationStatus`), the token holds `drive` by its
 * whole name (`holdsScope_`), and the test file was made and shared.
 */
```

### EVERY PERMISSION THE MANIFEST LISTS, asked of Apps Script rather than of a list kept here — a second copy of the manifest's scopes would be one more thing to

in `authoriseDrive`

```
/* EVERY PERMISSION THE MANIFEST LISTS, asked of Apps Script rather than of a list kept here — a
     second copy of the manifest's scopes would be one more thing to forget when it changes.
     `REQUIRED` means at least one is still unticked. A runtime that cannot answer is not a yes. */
```

### EVERYTHING THE SHEET NEEDS, WITHOUT ANYBODY REMEMBERING ANYTHING.

top level, before `schemaGaps`

```
/**
 * EVERYTHING THE SHEET NEEDS, WITHOUT ANYBODY REMEMBERING ANYTHING.
 *
 * Run by `?setup=1` and `?run=…` (doGet) — somebody asking on purpose — and never by an ordinary page
 * load, which once paid for it. It brings the columns up to date if the version moved and runs any named
 * job that has never run. (This said deploying was the whole procedure and the first request did it; it
 * has not been true since the schema work came off the page load — review of 10 Oct.)
 *
 * ONE READ for both questions. `getProperties()` returns the lot, so asking whether the schema is
 * current and whether four migrations have run costs the same as asking either on its own.
 */
```

### WHICH COLUMNS ARE STILL MISSING, tab by tab.

top level, before `schemaGaps`

```
/**
 * WHICH COLUMNS ARE STILL MISSING, tab by tab.
 *
 * The one question that decides whether the schema is actually up to date — and nothing was asking
 * it. `ensureSchema` returned a report of what it MEANT to do, and `autoMigrate` recorded the
 * version whether or not any of it landed.
 */
```

### ---------- THE SAME LOOKUP AS EVERYWHERE ELSE, FOR THE THIRD TIME

in `schemaGaps`

```
/* ---------- THE SAME LOOKUP AS EVERYWHERE ELSE, FOR THE THIRD TIME ---------------------------
       THIS OPENED THE MAIN SPREADSHEET AND ASKED FOR THE TAB BY THE CODE'S OWN NAME. Two whole
       classes of tab can never be found that way: the four that live in the subjects file, and any
       that has been renamed — `items&shop` is both a merge and a rename.

       AND IT IS NOT ONLY A WRONG REPORT. `autoMigrate` records `SCHEMA_VERSION` only when this
       comes back EMPTY, so a tab it structurally cannot see means the version is never recorded,
       which means the schema is judged stale on the next request, which means `ensureSchema` runs
       again — every two minutes, for ever, on somebody's page load. A broken check here is not a
       missing check; it is a loop. */
```

### A JOB THAT KEEPS FAILING MUST NOT KEEP TRYING ON EVERY PAGE LOAD.

in `autoMigrate`

```
/* A JOB THAT KEEPS FAILING MUST NOT KEEP TRYING ON EVERY PAGE LOAD.
     A `retry: true` migration is recorded only if it SUCCEEDS — which is right, because the thing
     stopping it may be one authorisation prompt away. But nothing paced it: unlike the schema
     check just above, there was no attempt marker, so one that could never succeed ran again on
     every single request, for every visitor, for ever. `venue-coordinates` throws outright when
     the geocoder cannot reach the network, and that is a failed fetch on every page load with
     somebody watching a loading screen.

     The same two minutes the schema uses. Long enough that a broken job cannot make the site slow,
     short enough that a fix lands on the next cup of tea rather than the next deploy. */
```

### One at a time. Two people opening the site in the same second after a deploy would otherwise both run it, and both would be adding the same columns to the same

in `autoMigrate`

```
/* One at a time. Two people opening the site in the same second after a deploy would otherwise
     both run it, and both would be adding the same columns to the same tabs — or, worse, both
     turning the same likes into reactions. Ten seconds is long enough to finish and short enough
     that a stuck lock cannot hold a page hostage. */
```

### MARKED BEFORE THE WORK, every time.

in `autoMigrate`

```
/* MARKED BEFORE THE WORK, every time. If something throws — a tab renamed, a permission
       withdrawn — marking afterwards would mean every single request retried and failed, and the
       site would be permanently slow for a reason nobody could see. One attempt each; a failure is
       reported in `health`, and `?run=` retries it deliberately. */
```

### MARKED ONLY IF IT WORKED, and "worked" is checked rather than assumed.

in `autoMigrate`

```
/* MARKED ONLY IF IT WORKED, and "worked" is checked rather than assumed.
         It used to be marked BEFORE the work — which stops a failing migration retrying on every
         request and making the site permanently slow, and which also records a failure as a
         success. `dataProblems` then reported the schema as current, so three columns that never
         appeared looked exactly like three columns that did.
         So: run it, then go and LOOK. Every column of every tab, against the sheet. */
```

### Not recorded, so the next request tries again — but only after a pause, which is what the attempt marker is for.

in `autoMigrate`

```
/* Not recorded, so the next request tries again — but only after a pause, which is what
             the attempt marker is for. A retry on every request is the fault the old design was
             avoiding, and it was avoiding it by lying. */
```

### RECORDED BEFORE IT RUNS, which is right for a rename:

in `autoMigrate`

```
/* RECORDED BEFORE IT RUNS, which is right for a rename: one attempt per deploy, so a job
         that throws halfway cannot be re-run over its own half-finished work.
         WRONG FOR ANYTHING THAT NEEDS THE NETWORK. A migration that failed because a scope had not
         been granted yet was marked complete on the way in and never tried again — the fault was
         one authorisation prompt away and the only cure was a URL nobody knew to run.
         `retry: true` says this one may be attempted again: it is recorded only if it SUCCEEDS,
         and a job that is safe to repeat is the only kind that may say so. */
```

### WHERE IS EVERY TAB, AND IS IT THERE?

top level, before `checkTabs`

```
/* ==================================================================================================
   WHERE IS EVERY TAB, AND IS IT THERE?

   The tabs are spread across three spreadsheets, which means several ways for things to go quietly
   wrong: a blank id in FILES, a tab with no line in WHERE, a renamed tab, a file moved to another
   Drive account, an id pointing at an .xlsx upload rather than a Google Sheet. None of those throw.
   They all just make a section empty, and an empty section looks exactly like a section nobody has
   put anything in yet.

   `check-tabs.js` asks the half of this that can be answered from the source alone, before a
   deploy. This is the other half — it needs the documents open, so it can only run in here.

   So this asks the question directly. Run it after moving anything.
================================================================================================== */
```

