# js/me.js

The full text of comments in `js/me.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — me.js ONE FILE, SPLIT.

top level, before `split_`

```
/* ==================================================================================================
   @family. — me.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   me.js is number 7 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### THE SCREENS. One function each, returning markup.

top level, before `split_`

```
/* ================================================================================================
   THE SCREENS.

   One function each, returning markup. None of them touches the tab bar, hides another screen, or
   has an opinion about the sheet — that is the shell's job, and keeping it that way is why adding
   the eighth screen will be as easy as the second.

   Everything pressable carries `data-do`, so markup can be thrown away and redrawn without
   anything needing to be rewired.
================================================================================================ */
```

### ---------- YOU

top level, before `split_`

```
/* ---------- YOU --------------------------------------------------------------------------------
   Everything about the person using the app, and nothing about the app. Signed out it is one
   button; signed in it is who you are, what you have, and the ways out.
--------------------------------------------------------------------------------------------- */
```

### ---------- SIGNING IN AND OUT BELONGS AT THE TOP OF THE FEED

top level, before `signInCard_`

```
/* ---------- SIGNING IN AND OUT BELONGS AT THE TOP OF THE FEED ---------------------------------------
   IT WAS AT THE FAR END OF `You`. Signing in is the thing somebody does BEFORE anything else works,
   and signing out is the thing they look for when handing the phone to somebody else — and both sat
   on the last column, past the account, past the claims, past everything.

   POSTS IS THE SCREEN NOBODY ARRIVES AT WITH AN ERRAND, which is exactly where a state you might
   need to change belongs. Above the ＋, because whether you are signed in decides whether the ＋ does
   anything at all.

   ONE FUNCTION, DRAWN IN TWO PLACES. `You` still shows it — that is where somebody who has gone
   looking will look — and Posts shows it first. Same markup either way, so the two cannot drift. */
```

### ---------- NAME, USERNAME OR E-MAIL, AND THE LABEL HAS TO SAY SO

in `signInCard_`

```
/* ---------- NAME, USERNAME OR E-MAIL, AND THE LABEL HAS TO SAY SO -----------------------
             ASKED FOR AS *"i want people to be able to sign in with email as well."* `findPerson`
             takes an address now — but a box captioned "your name" is a box nobody tries an address
             in, which is this repository's own sentence about the calculator and about `topics`: a
             thing nobody can find is a thing that is not there.

             THREE WORDS RATHER THAN A SENTENCE UNDER IT. A caption is read; a paragraph explaining
             a single text box is the note this app has now been asked three times to take off a
             card. The placeholder carries the example, which is what a placeholder is for.

             `autocomplete="username"` IS UNCHANGED AND IS STILL RIGHT. It is the token for "the
             thing you sign in with" whatever that thing is, and a phone offers a saved address
             under it as readily as a saved handle.

             ---------- AND THE THING YOU SIGN IN WITH IS AN ADDRESS NOW, AND ONLY THAT ----------
             ASKED FOR AS *"i want people to be able to sign in only with their email and their pin
             now. no case sensitive stuff."* `verifyLogin` resolves the `email` column and nothing
             else, so the caption says one thing rather than offering three and refusing two.

             `type="email"` IS WHAT BRINGS UP THE KEYBOARD WITH `@` ON IT, and `autocapitalize` off
             is the phone's half of "no case sensitive stuff" — the server folds case anyway, but a
             box that capitalises the first letter of an address reads as though case mattered.
             THE ID STAYS `in-name`, because `forgot-pin`, the Enter-to-submit listener and
             `check-flow.js` all find the box by it, and renaming it buys nothing but three edits.

             ---------- AND A HANDLE, FOR EVERYBODY ----------
             ASKED FOR AS *"have the students be able to login with their handles too"*. The handle
             door was for rows with no address; it is open to every row now (see `verifyLogin`), so
             the placeholder stopped saying "if you have no email" — that clause told a student with
             an address that their handle would not work, which is no longer true. `type="text"`
             stays, because `type="email"` would refuse a handle before it was sent.
             ---------- NO EXAMPLE, AND WHERE THERE IS ONE IT IS THE ADMIN'S OWN NAME ----------
             IT SAID `ada@x.com or ada_kind7`, and the owner, 9 Oct: *"remove the example login. i dont
             want it to have an example, or matter of fact let it be the admin login name."* So a box on
             a device nobody has run the business from says nothing — the label already says "email or
             handle" — and on a device an admin has signed in on, the grey text is what that admin signs
             in with (`signInHint_`). FROM THIS DEVICE ONLY, never the repository or the payload: the
             repository is public and a stranger's phone has no business being told the admin's name. */
```

### ---------- THE PIN, ON A SHARED iPAD

in `signInCard_`

```
/* ---------- THE PIN, ON A SHARED iPAD ---------------------------------------------------------
             *"i feel very insecure when signing into the kids accounts"*. It was `type="password"` with
             `autocomplete="current-password"`, beside a `username` box: exactly the pair Safari offers to
             save to the iCloud Keychain — so on the family's iPad every child's PIN could end up in the
             owner's keychain, offered back to whichever child next tapped the box. A PIN on a shared
             device is not a password the device should keep.

             SO IT IS NOT A PASSWORD FIELD WHERE IT NEED NOT BE. Where the browser can draw dots on a
             text box (`-webkit-text-security`, Safari and Chrome), it is one — `.pin-dots` — and there is
             no password field for the keychain to remember. Where it cannot, it stays `password`, with
             `autocomplete="off"`, so the PIN is never drawn in the clear. `data-1p-ignore` and
             `data-lpignore` say the same to the two password managers that read their own attribute.

             `maxlength="8"` because no PIN here is longer; `pattern="[0-9]*"` with `inputmode="numeric"`
             is what brings an iPhone's number pad up; `enterkeyhint="go"` labels the key that signs in
             (the Enter listener below presses Sign in). The in-app PIN pad the diagnosis offered is not
             built here: the keypad is keypad.js's, and is being rebuilt. */
```

### ---------- THREE TILES, WHERE THERE WERE TWO BUTTONS AND A CARD

in `signInCard_`

```
/* ---------- THREE TILES, WHERE THERE WERE TWO BUTTONS AND A CARD -------------------------
             ASKED FOR AS *"turn the sign in and forgot pin buttons into tiles. same with create
             account button."* This card is a THING in this app's sense — the account you are about
             to be — and its actions were the last hand-drawn control row on the front door.
             Settings' Save (1194c6f) and Sign out (4585865) went the same way before it.

             ONE ROW, NOT THREE PLACES. `Forgotten your PIN?` was a quiet button under `Sign in`, and
             `Make an account` was a whole separate card below this one saying "No account yet?" —
             which, until this change, did nothing but toast that it was not wired. Three ways
             through one door belong beside each other.

             `do-signin` KEEPS ITS NAME, because the Enter listener below clicks
             `[data-do="do-signin"]`, and `send_` already knows a busy tile has no word to swap.
             GOLD IS STILL `Sign in` — `buy` is this app's one "the main thing" tone, and there is one
             of those on this card.

             FORGOT-PIN STILL TAKES NO SECOND BOX (*"add forgot pin option. it will send an email to
             their email."*). The address is already typed above — it is the first thing anybody
             fills in — and it is the same address the new PIN is sent to. */
```

### A TILE SHOWS A MARK AND NO WORD — its name is in `title` and `aria-label`, which a finger never reads.

in `signInCard_`

```
/* A TILE SHOWS A MARK AND NO WORD — its name is in `title` and `aria-label`, which a finger
             never reads. On a stranger's first screen that is three marks to guess at, so the card
             says them once, in the order they sit. One line, under the row, not one per tile. */
```

### ---------- AND THE OTHER DOOR

in `signInCard_`

```
/* ---------- AND THE OTHER DOOR ----------------------------------------------------------
             DRAWN ONLY WHEN THERE IS AN ID TO DRAW IT FOR. `googleClientId` comes off the payload;
             with no id in the config tab the button is absent rather than present and broken, which
             is the difference between a feature not set up and a feature that does not work.

             THE PIN STAYS. Children mostly do not have Google accounts, and half of the people this
             app signs in are children — so this is a second way in, never a replacement. */
```

### `#in-said` STOOD HERE — a faint grey line carrying a validation, a "Checking…" the button already says with a spinner on it, and a refusal that is now a toast.

in `signInCard_`

```
/* `#in-said` STOOD HERE — a faint grey line carrying a validation, a "Checking…" the
              button already says with a spinner on it, and a refusal that is now a toast. See the
              note over `do-signin`: three jobs, and none of them is still its. */
```

### ---------- `signOutCard_` WAS HERE

top level, before `meRest_`

```
/* ---------- `signOutCard_` WAS HERE ----------------------------------------------------------------
   A NAME, A ROLE AND A `Sign out` BUTTON, at the top of the feed. It was the right answer to the
   question "which screen does signing out live on", and that turned out to be the wrong question —
   the way out belongs on the object it acts on, which is your own card, next to your photograph and
   your credits. See `meCard` in cards.js.

   AND IT WAS HALF A CARD. `meCard` already drew your face, your name and your role; this drew the
   first three of those again on another screen, which is the same duplication the account rows were
   moved out of `meRest_` to stop. One card, one place, one way out. */
```

### THE PHOTOGRAPH, not the figure.

in `meRest_`

```
/* THE PHOTOGRAPH, not the figure. `USER.avatar` is the WEARABLE string — "hair:crop|legs:jeans"
     — and putting that in a src gives a broken image every time. The picture is `photo`, it is a
     Drive link, and it goes through `pic()` like every other one.
     It was also never sent: verifyLogin's reply carried neither field, so this has been falling
     back to a letter for everybody since the rewrite. */
```

### A PHOTOGRAPH IF THERE IS ONE, otherwise the figure.

in `meRest_`

```
/* A PHOTOGRAPH IF THERE IS ONE, otherwise the figure. The letter in a circle is the last
     resort now rather than the second — it says nothing about anybody, and every account has a
     figure whether or not anybody has chosen one, because the starting look is seeded from the
     handle. */
```

### ---------- YOUR FACE AND YOUR NAME ARE ON YOUR CARD, NOT HERE

in `meRest_`

```
/* ---------- YOUR FACE AND YOUR NAME ARE ON YOUR CARD, NOT HERE -----------------------------------
     THE ACCOUNT ROWS MOVED AND THIS DID NOT. `meCard` in cards.js draws your photograph, your name,
     your role and every fact under them, in the funnel under People — and this drew the photograph,
     the name and the role again at the top of a column two swipes away. Half a card, duplicating
     the top half of a whole one.

     What is left in this column is what you DO — the claims waiting on an answer, what needs fixing,
     your link, signing out. Who you are is one card, in one place. */
```

### `installCard()` WAS HERE, "second, and that is the whole point of where it is" — and this column had stopped being drawn, so it was second on a page nobody

in `meRest_`

```
/* `installCard()` WAS HERE, "second, and that is the whole point of where it is" — and this
          column had stopped being drawn, so it was second on a page nobody could reach. It is
          deleted, with everything that fed it; see "NOTHING IN THE APP ASKS ANYBODY TO INSTALL IT"
          further down. */
```

### `Your figure` WAS A TILE ON YOUR CARD and is the last card of Settings now.

in `meRest_`

```
/* `Your figure` WAS A TILE ON YOUR CARD and is the last card of Settings now. It was a whole card here, with the
          avatar drawn a second time beside the one at the top of the same column, listing what you
          have on. The wardrobe itself says that better than a summary of it does. */
```

### ---------- END OF THE PROFILE CARD

in `meRest_`

```
/* ---------- END OF THE PROFILE CARD ------------------------------------------------------
          Everything above is WHO YOU ARE: your name and face, the facts about your account, and
          your figure. Everything below is what you DO with the account — change your details, see
          what needs fixing, hand out your link, sign out.
          Two different questions, so two panes. `ME_SPLIT` is the mark between them; `mePages`
          cuts on it. A marker rather than counting cards, because the admin card in the second
          group only exists for an admin — so any count would be right for you and wrong for
          everybody else. */
```

### ---------- THE WEEK, ON A PANE OF ITS OWN

in `meRest_`

```
/* ---------- THE WEEK, ON A PANE OF ITS OWN ------------------------------------------------
          IT WAS A CARD IN THE MIDDLE OF THE ACCOUNT LIST, between your details and the admin
          things — which made a timetable look like another setting to press. It is not: it is the
          one thing on this column you READ rather than act on, and it needs the width.
          `ME_SPLIT` already makes separate panes, so it gets one. */
```

### ---------- SOMEBODY WANTS TO ADD YOU TO THEIR FAMILY

in `meRest_`

```
/* ---------- SOMEBODY WANTS TO ADD YOU TO THEIR FAMILY -----------------------------------
          FIRST, ABOVE EVERYTHING. A claim is somebody saying they are your parent, and it sits
          unanswered until you say. Putting it below the fold would be putting the one thing that
          needs a decision underneath the things that do not. */
```

### ---------- AND THE OTHER END OF IT

in `meRest_`

```
/* ---------- AND THE OTHER END OF IT -------------------------------------------------------
          A PARENT ASKS BY NAME. The backend matches on first and last name and refuses politely
          when there are none or more than one — so this asks for exactly those two things and lets
          it answer. Shown to a parent or client; a student has nobody to add. */
```

### `Add your child` AND `Edit your details` ARE TILES ON YOUR CARD NOW — one mark each, in the row under your own face, beside the wardrobe.

in `meRest_`

```
/* `Add your child` AND `Edit your details` ARE TILES ON YOUR CARD NOW — one mark each, in the
          row under your own face, beside the wardrobe. Three cards you scrolled past, each a heading
          and a sentence, each doing one thing: which is what a tile is. The tiles have gone too — adding a child is
          "Manage your child" on the Settings column (`childManageCard_`), and your details are that column and your
          own card's Edit. */
```

### ---------- `What needs fixing` AND `Tell someone` WERE HERE

in `meRest_`

```
/* ---------- `What needs fixing` AND `Tell someone` WERE HERE ------------------------------
          BOTH WERE CARDS THAT OPENED A SHEET, in a column of things you do to your account, and
          neither is something anybody comes here for. `Tell someone` handed out a referral link
          nobody had asked for; `What needs fixing` was an admin diagnostic sitting between a
          client's details and their Sign out button.

          THE DIAGNOSTIC ITSELF IS STILL COMPUTED AND IS NOW READ BY NOTHING. `dataProblems()` is
          the largest thing in the backend — a term that ends before it starts, a tutor with no
          hours, a law set to a colour nobody defined — and the comment that used to be here said,
          correctly, that it had been computed and read by nothing for a long time before this card
          existed. It is back in that state. That is worth a door somewhere an admin actually
          works, rather than a card on a settings screen; it is not worth this one. */
```

### ---------- THE SECOND `Sign out` WAS HERE

in `meRest_`

```
/* ---------- THE SECOND `Sign out` WAS HERE -------------------------------------------------
          THERE WERE TWO OF THEM, and the note at the head of this file explains why there should be
          one: signing in and out moved to the top of Posts, because that is the screen nobody
          arrives at with an errand and because signing out is what you look for when handing the
          phone to somebody else. The move happened. The old button was never taken out, so both
          screens carried one and each was `data-do="signout"` — identical behaviour, two places,
          which reads as an app unsure which of them is the real one.

          NEITHER OF THEM SURVIVED. The one on Posts went too, and for the same reason it beat this
          one: the way out belongs next to who you are. It is the last row of `meCard` now — under
          your photograph, your name, your role and your credits — which is the one place it does not
          have to be moved again the next time a screen changes shape. */
```

### ---------- THE VERSION CARD IS GONE FROM THE COLUMN

in `meRest_`

```
/* ---------- THE VERSION CARD IS GONE FROM THE COLUMN --------------------------------------
          IT WAS THREE BUILD NUMBERS AND A DEPLOY WARNING, on a card of its own, and with the You
          column folded into the funnel it landed between the question and your own account card —
          so the first thing anybody saw after answering was a page of build stamps. It answered a
          question only I ever ask, in the place everybody looks.

          IT IS NOT DELETED, BECAUSE IT EARNS ITS KEEP. "Is what I am looking at the thing I just
          changed" has cost more rounds than any bug in this app, and the per-file `Not deployed`
          line is what catches a half-pasted Apps Script every time. Both are on the diagnostics
          the tiles already open, not on a page in everybody's way. */
```

### ---------- THE BUILD STAMPS, FOR WHEN SOMETHING HAS CHANGED AND HAS NOT

top level, before `versionSaid_`

```
/* ---------- THE BUILD STAMPS, FOR WHEN SOMETHING HAS CHANGED AND HAS NOT ---------------------------
   ALL THREE, because any one of them being stale looks exactly like a bug in the other two — and
   the CSS was the one that could not be asked. Below them, and only when they disagree, which of
   the backend files was missed: one number for six files is a number that lies, because Apps Script
   is pasted a file at a time and `BACKEND_VERSION` lives in constants.gs, so pasting that one alone
   moves the figure while every handler stays where it was.

   COMPARED ON THE WHOLE STAMP. Comparing dates was right while I bumped only the file I had edited,
   and that made an untouched file look permanently undeployed — so the warning was always on, which
   is the one thing a warning must never be. */
```

### THE YOU SCREEN IS ONE PAGE.

top level, before `ME_SPLIT`

```
/* THE YOU SCREEN IS ONE PAGE.
   It was chunked four cards at a time, which put Messages, Change your PIN, Tell someone and Sign
   out on a second page — and a pager on a SETTINGS screen is the wrong instrument entirely. Paging
   is for a list you are working THROUGH: posts, search results, sessions. This is a list you are
   looking IN, and the thing somebody wants is never on the page they are on, because they do not
   know which page it is on. Signing out should not require finding it first.
   One page, scrolled. Longer, and everything is where it looks like it is. */
```

### MESSAGES, ON A PANE OF ITS OWN.

top level, before `ME_SPLIT`

```
/* MESSAGES, ON A PANE OF ITS OWN.

   `mePages` was `[meBlocks().join('')]` — every block split apart by `split_` and then immediately
   joined back into one page. So the whole of You was a single pane with everything stacked down it
   as rows, and nothing on that screen could be its own card however it was styled. That is why
   Messages kept coming out as another row: there was no second pane for it to be.

   Two pages now. Your details, credits and the rest stay together as one list, because that is
   what they are. A thread is not a fact about you — it is somebody trying to reach you — so it
   gets the pane, the same way a session gets one on the Book screen.

   ONE FUNCTION FOR THE CARD, called from here, so the markup and the page cannot come apart. */
```

### `meMessagesCard` WAS HERE — one pane on `You` holding every message from everybody, filled by `fillMessages` into a single `#msg-body`.

top level, before `ME_SPLIT`

```
/* `meMessagesCard` WAS HERE — one pane on `You` holding every message from everybody, filled by
   `fillMessages` into a single `#msg-body`. Each conversation is its own widget now, in the drawer
   with the calendar and the notepad — see `msgWidgets_`. */
```

### PROFILE, then ACCOUNT, then MESSAGES.

in `mePages`

```
/* PROFILE, then ACCOUNT, then MESSAGES. Split on the marker rather than on a card count, so the
     admin-only card in the second half cannot move the boundary for an admin and not for anybody
     else. No marker — the signed-out screen — is one page, which is right: there is nothing to
     settle and nobody to have written to you. */
```

### SPLIT ON EVERY MARKER, NOT THE FIRST.

in `mePages`

```
/* SPLIT ON EVERY MARKER, NOT THE FIRST. This took `indexOf` and cut once, which was right while
     there was one marker and silently wrong the moment I added a second: the extra one would have
     been left sitting in the page as a literal HTML comment, and the week would have shared a pane
     with the account list anyway. Splitting on all of them means adding a pane is adding a marker.
     Empty pieces are dropped, so a marker at the very start or two in a row costs nothing. */
```

### ---------- YOUR SESSIONS ARE YOURS, SO THEY ARE HERE

in `mePages`

```
/* ---------- YOUR SESSIONS ARE YOURS, SO THEY ARE HERE ------------------------------------------
     THEY WERE A COLUMN, THEN A FUNNEL ANSWER, and neither was right. A column cost a swipe on every
     screen for a list most people can count on one hand; a funnel answer made them findable, which
     sounds better than it is — you do not SEARCH for your own bookings, you check them, and a thing
     you check belongs where the rest of your own things already are.

     THE OPEN CLASSES DID NOT COME WITH THEM, and that is the whole distinction: a class with seats
     going is somebody else's, there are many, and which one suits you depends on subject, level,
     venue and day. That is a search. Those stayed in Find where the filters are.

     AND THEY ARE NOT DRAWN HERE ANY MORE. `mePages` fed the You column, which no longer exists —
     these pages are read by `youPages_`… which was also deleted, so nothing has drawn a `jobCard`
     from this line since the columns went. It stayed because it broke nothing, which is the whole
     problem with it: dead code that still compiles is dead code nobody removes.

     A SESSION HAS TWO PLACES AND THIS WAS NEVER ONE. `Booking · Receipts` is the document, one to a
     page; `Your sessions` is the roster, who is in it and how many seats are left. A third, folded
     copy on a screen that no longer exists is the duplication the whole evening has been about. */
```

### Drawn, then filled. `fillMessages` looks for `#msg-body` by id, so it can only run once this screen's markup is in the document — the same reason a widget's

top level, before `mountGoogleWhenDrawn`

```
/* Drawn, then filled. `fillMessages` looks for `#msg-body` by id, so it can only run once this
   screen's markup is in the document — the same reason a widget's `start` runs after its page is
   filled rather than while it is being built. A frame later is enough, and it costs nothing on a
   screen nobody is looking at because there is no `#msg-body` to find. */
```

### ---------- NOTHING IN THE APP ASKS ANYBODY TO INSTALL IT

top level, before `mountGoogleWhenDrawn`

```
/* ---------- NOTHING IN THE APP ASKS ANYBODY TO INSTALL IT -----------------------------------------
   The owner, 6 Oct: *"delete the suggester telling to bookmark"*. That took out `installBar`, the
   "Keep @family. on your phone" strip that slid down three seconds into every first visit — and it
   left behind everything that fed it. The browser's install offer was still caught and HELD in
   `INSTALL_PROMPT`; `installCard` and its `on('install')` were still here, under a comment saying
   the offer "stays where somebody can go looking for it, `installCard` on the You screen"; and
   `brandIcon`, `isInstalled` and `isIOS` were still here because that card asked them.

   NONE OF IT WAS ON SCREEN. `installCard` was built only by `meRest_`, which only `meBlocks` calls,
   which only `mePages` calls — and nothing calls `mePages` (see the note over it). So an Android
   visitor was refused Chrome's own install bar in favour of an offer of ours that nobody could
   reach, and the next person to read this was told the reverse. `check-doors` could not see it: it
   pairs a `data-do` with its handler wherever the string is WRITTEN, and written is not drawn.

   THE BROWSER'S OWN MINI-BAR IS A SUGGESTER TOO, so it stays down. Chrome on Android fires
   `beforeinstallprompt` when it judges the site installable and, left alone, slides up its own
   "Add @family. to Home screen" — the same interruption in the browser's handwriting.
   `preventDefault` is the whole of stopping it, so that is the whole of this. The event is NOT
   kept: holding it is holding an offer in reserve, and nothing may make one.

   INSTALLING STILL WORKS FOR ANYBODY WHO GOES LOOKING. The browser menu's Install / Add to Home
   Screen reads the manifest and the `apple-touch-icon` in index.html, and neither ever needed the
   card; on an iPhone the Share sheet was always the only route. `applyBrandIcon_` in shell.js puts
   `brand.logo_square` on that home-screen icon, and it never depended on any of this. (`brandIcon`
   also rebuilt the manifest around the logo — but only when `installCard` was drawn, which since
   the You column went was never, so the manifest's own `icon.png` is what Chrome has installed.)

   `check-flow`'s "nothing offers to install" holds the decision on the running app, as four people
   (signed in or out, iPhone or Android): the offer is cancelled; once the page is still, nothing on
   it moves in the 3.5 s after the offer — a frame-late redraw and a timer-late `prompt()` included;
   no `install` door is wired; and once every screen is drawn, nothing new hangs off `<body>` and
   nothing anywhere says install, on your phone, add to home, home screen or bookmark. */
```

### ---------- `screen('me')` WAS HERE

top level, before `mountGoogleWhenDrawn`

```
/* ---------- `screen('me')` WAS HERE -----------------------------------------------------------------
   THE LAST COLUMN BUT ONE. `meCard` had already taken the top of it into the funnel — your face,
   your name, your role and the facts under them — and what stayed was what you DO: the install
   prompt, the claims, the tiles, the version footer. Those are pages behind `What for · You` now;
   see `youPages_` in find.js.

   `meBlocks` IS UNCHANGED and is what that reads. It already returned a card list rather than a
   screen, which is why nothing here had to be rewritten to move it.

   THE GOOGLE BUTTON STILL HAS TO BE MOUNTED A FRAME LATE, because Google renders into an element
   that has to exist first. It hangs off the funnel's own paint now rather than this screen's —
   `mountGoogleWhenDrawn` below, called from the same place the other widgets are started. */
```

### `on('health')` WAS HERE — it fetched `?health=1` and drew the backend's problem list in a sheet.

top level, before `gLoaded`

```
/* `on('health')` WAS HERE — it fetched `?health=1` and drew the backend's problem list in a sheet.
   The card that opened it has gone, so this could not be reached; `check-doors` named it the moment
   the card came out. The backend still computes `dataProblems()` and still puts it on the payload,
   so nothing is lost by deleting the reader — only the reading. */
```

### ---------- MOUNTING GOOGLE'S BUTTON

top level, before `gLoaded`

```
/* ---------- MOUNTING GOOGLE'S BUTTON ---------------------------------------------------------------
   GOOGLE DRAWS IT, NOT US. The button has to be theirs — it is what carries the sign-in prompt and
   the account chooser, and a lookalike of our own could not produce a token.

   THE SCRIPT IS FETCHED ONCE AND ONLY IF NEEDED. Loaded at the moment the sign-in card is drawn
   rather than in the page head: somebody already signed in never asks Google for anything, which is
   a request they never make and a third party that never hears from them.

   AND IT IS IDEMPOTENT. `repaint()` redraws this card whenever anything changes, so both the script
   load and the render guard against having already happened — without that, a redraw stacks a
   second button on top of the first. */
```

### WHAT COMES BACK IS A CLAIM AND IT IS NOT INSPECTED HERE.

top level, before `googleSignedIn_`

```
/* WHAT COMES BACK IS A CLAIM AND IT IS NOT INSPECTED HERE. The token is passed straight through to
   the server, which asks Google whether it signed it. Reading it in the browser would prove nothing
   — the browser is the party being checked. */
```

### THE SAME VOICE AS THE PIN DOOR, which is the point:

in `googleSignedIn_`

```
/* THE SAME VOICE AS THE PIN DOOR, which is the point: two ways in that report differently are
     two ways in, and the one that behaves unlike the other reads as the broken one. See the note
     over `do-signin` for why `#in-said` is gone. There is no button to disable here — Google draws
     its own — so the toast is the only thing that says anything is happening. */
```

### ---------- EXCEPT WHEN GOOGLE HAS JUST TAKEN AWAY THE PIN

in `googleSignedIn_`

```
/* ---------- EXCEPT WHEN GOOGLE HAS JUST TAKEN AWAY THE PIN -----------------------------------
         `pinCleared`: the address was PENDING, so Google proving it also took the PIN the account was
         made with (`googleLogin` in dopost.gs — whoever chose it may not own the address) and signed
         everybody else out. Said in the server's words, in a sheet they close: the person this
         happens to is as often the real registrant, and a PIN that stops working tomorrow with no
         sentence anywhere is a lock-out they cannot explain. A toast is gone in 2.6 seconds. The sheet is
         `afterSignIn_`'s, which every door in shares — with the children held, when there were any. */
```

### THE SAME DOOR AS THE PIN PATH — `signedIn_`, because the reply is the same reply (one function builds it on the server for exactly this reason) and both doors

in `googleSignedIn_`

```
/* THE SAME DOOR AS THE PIN PATH — `signedIn_`, because the reply is the same reply (one function
         builds it on the server for exactly this reason) and both doors have to feel the same, or the one
         that feels slower reads as the one that is broken. */
```

### THE SIGN-IN CARD SPEAKS IN TOASTS, AND IT USED TO SAY EVERYTHING THREE TIMES.

top level, before `who`

```
/* ==================================================================================================
   THE SIGN-IN CARD SPEAKS IN TOASTS, AND IT USED TO SAY EVERYTHING THREE TIMES.

   REPORTED AS *"I don't like how name or pin not recognised is a banner. It should be like the
   other pop ups that come up at the bottom of screen."* Measured on a wrong PIN: a gold banner
   across the top of the app, a faint grey line under the button, and — the part that is not in the
   complaint — **the banner is still there after you sign in correctly.** `why_` in shell.js carries
   that half; it no longer raises one.

   AND THE LINE UNDER THE BUTTON WAS THE THIRD COPY, doing three jobs badly:

     "Both, please."   a validation, before any request has left the phone
     "Checking…"       which the BUTTON already says, with a spinner, from `send_`
     the refusal       which is now the toast

   So there is nothing left for `#in-said` to carry and it is gone from the markup. `send_`'s own
   `say()` falls through to `toast()` when no `where` is given — one place decides, which is why
   dropping the option is the whole of the change rather than a second call to `toast` here.

   A TOAST IS 2.6 SECONDS AND THAT IS ENOUGH FOR THIS. Somebody has just pressed a button and is
   looking at the screen; eight of the thirteen `why_` callers in this app already answer a failed
   write exactly this way. What a toast must not carry is a STANDING condition — see `banner()`. */
```

### ---------- A NEW PIN, TO THE ADDRESS IN THE SHEET AND NOWHERE ELSE

top level, before `who`

```
/* ---------- A NEW PIN, TO THE ADDRESS IN THE SHEET AND NOWHERE ELSE ------------------------------
   NOT ONE RULE IS REPEATED HERE, which is the same argument `pin-save` already makes one column
   along: the box checks whether it is empty and nothing else, and whatever comes
   back is what gets said. The server decides whether that name resolves, whether there is an
   address on it, and what to tell somebody who asked about an account that is not theirs — and it
   deliberately says the SAME sentence to all three, so a copy of that reasoning here would be a
   second place to get it wrong.

   THE SENTENCE IS THE SERVER'S. `d.message` is what the handler wrote; the fallback below is for a
   deployment too old to carry the action at all, which answers a refusal rather than this. */
```

### A REFUSAL IS A SENTENCE NOW \u2014 "we have no email for this account", "no account has that handle" \u2014 and `send_` has already toasted it.

top level, before `name`

```
/* A REFUSAL IS A SENTENCE NOW \u2014 "we have no email for this account", "no account has that
       handle" \u2014 and `send_` has already toasted it. Without this the rejection went unhandled, which
       was harmless only while the server answered every case with the same success. */
```

### ---------- THE BUTTON HAS TO LOOK PRESSED

top level, before `action`

```
/* ---------- THE BUTTON HAS TO LOOK PRESSED ------------------------------------------------------
     `send_` HAS DONE THIS ALL ALONG and this call was the one that did not ask. It takes `button`
     and disables it, and `busy` and relabels it, restoring both whatever happens — and signing in
     passed neither, so the only thing that changed on screen was a line of faint grey text under a
     button that still read `Sign in` and could still be pressed.

     From the outside that is a frozen app. The request is fifteen seconds against Apps Script, the
     button invites a second press for all of them, and a second press is a second verifyLogin —
     so the fix is not decoration, it is the thing that stops two sessions being opened by somebody
     who thought the first tap missed. */
```

### NO `where` AND NO `saying`.

top level, before `action`

```
/* NO `where` AND NO `saying`. Without a `where`, `send_`'s own `say()` toasts — see the note
     over this handler. `saying` wrote "Checking…" into a line under a button that `busy` has
     already relabelled "Checking…" with a spinner on it, which is the same word twice, six pixels
     apart, on the one card where somebody is waiting. */
```

### `email` AND `name`, THE SAME STRING TWICE.

top level, before `action`

```
/* `email` AND `name`, THE SAME STRING TWICE. This backend reads `email` first; one deployed
     before it reads `name` and resolves an address through `findPerson`'s last rung — so the two
     can land a day apart in either order and signing in works throughout. See `verifyLogin`. */
```

### `send_` THROWS ON A REPLY CARRYING `error`, and `verifyLogin` refuses with one — so this branch is for a reply that says `success: false` and nothing else

top level, before `why`

```
/* `send_` THROWS ON A REPLY CARRYING `error`, and `verifyLogin` refuses with one — so this
         branch is for a reply that says `success: false` and nothing else, which is the shape a
         future refusal could take without anybody here noticing. */
```

### THE REPLY, PLUS WHAT WE ALREADY KNEW.

top level, before `why`

```
/* THE REPLY, PLUS WHAT WE ALREADY KNEW. This was `USER = d` — the reply wholesale — so any
         field the backend did not send simply did not exist on the person afterwards. Not
         hypothetical: `todo` was missing from this reply for weeks and every docket vanished at
         sign-in because of it.
         The name matters most, because it is what every request identifies the person by. A reply
         without one signs somebody in as nobody, and the failure that follows is a booking refused
         for not being signed in, to somebody who plainly is. */
```

### ---------- CLEARING THE LAST ATTEMPT'S REFUSAL IS NOT A LINE ANY MORE

top level, before `why`

```
/* ---------- CLEARING THE LAST ATTEMPT'S REFUSAL IS NOT A LINE ANY MORE ------------------
         THIS CLEARED `#in-said`, and the report it was written for — *"the name or PIN not
         recognised doesn't disappear after i just logged in correctly"* — was only half true of
         that element. The LOUD copy was the banner, which nothing cleared at all and which was
         still across the top of the app after a successful sign-in. A toast expires by itself, so
         there is nothing here to clear and nothing that can outlive the thing it was about. */
```

### NOT THE TYPED TEXT AS A NAME FALLBACK ANY MORE — it is an e-mail address now, and a row with no first or last name would have signed in wearing its address as

top level, before `why`

```
/* NOT THE TYPED TEXT AS A NAME FALLBACK ANY MORE — it is an e-mail address now, and a row with
         no first or last name would have signed in wearing its address as a display name. The
         handle is on every sign-in reply and is a name somebody chose. */
```

### ---------- DRAWN NOW, REFRESHED AFTER

top level, before `why`

```
/* ---------- DRAWN NOW, REFRESHED AFTER --------------------------------------------------------
         THIS WAS `load()` ALONE, AND `load()` IS A FULL PAYLOAD FETCH — about fifteen seconds against
         this backend. `repaint` is the LAST line of it, so nothing on screen changed until the whole
         spreadsheet had come back: you were signed in, the toast said so, and the card in front of
         you still asked for your name until something else happened to repaint it. That is the
         "it doesn't tell you until you interact again" — the interaction was not doing the work, it
         was just the next thing that happened to repaint.

         SIGNING OUT NEVER HAD THIS. It sets `USER = null` and repaints on the spot, with no fetch at
         all, which is exactly why leaving feels instant and arriving did not.

         EVERYTHING THE SIGNED-IN SCREEN NEEDS IS ALREADY IN `USER` — the reply carried it. So paint
         it, then let `load()` bring the payload the person's id unlocks and repaint again when it
         lands. Two paints, and the first one is the one that matters. ALL OF IT IS `signedIn_` NOW —
         the three doors in (this, Google, the emailed link) were three copies of these lines. */
```

### NO `.catch` THAT SPEAKS.

top level, before `why`

```
/* NO `.catch` THAT SPEAKS. `send_` has already toasted the sentence through `why_`, and a
       second copy here is what put the refusal on the screen twice. The rejection is swallowed
       rather than left unhandled, and marked `handled` by `send_` so nothing else reports it.

       ---------- BUT A WRONG PIN SAYS WHICH BOX, AND EMPTIES IT --------------------------------------
       MEASURED ON THE iPAD: after "That PIN is not right" the box kept the old digits and lost the
       focus, so a child had to find the box, delete four dots and retype — on the screen the owner
       called *"janky"*. The toast stays (docs/history/134 is the owner's choice of a toast); the box it
       was about is emptied, focused and marked `aria-invalid` until the next keystroke. A handle nobody
       has is the same, for the handle box. By the server's code (`why`), never by its sentence. */
```

### ---------- ENTER SUBMITS, BECAUSE THE KEYBOARD SAYS IT WILL

top level, before `id`

```
/* ---------- ENTER SUBMITS, BECAUSE THE KEYBOARD SAYS IT WILL --------------------------------------
   A PHONE KEYBOARD PUTS `Go` WHERE RETURN WOULD BE and pressing it did nothing at all — the two
   inputs are not in a `<form>`, so there is no default submit to happen. Somebody who types their
   PIN and presses the key the keyboard is offering them gets silence, and the reasonable conclusion
   is that the app is broken rather than that the key is decorative.

   ONE LISTENER ON THE DOCUMENT, ADDED ONCE, rather than handlers in the markup: the card is redrawn
   on every repaint, and anything attached to its inputs would be attached again each time — see the
   note on `data-do` in shell.js, which is the same argument.

   IT PRESSES THE BUTTON RATHER THAN REPEATING WHAT THE BUTTON DOES. `do-signin` needs the element
   to disable, so calling the handler without one would restore exactly the frozen-button fault
   above, in a second place where nobody would think to look for it. */
```

### ---------- SIGNING OUT ENDS THE SESSION ON THE SERVER TOO

top level, before `tok`

```
/* ---------- SIGNING OUT ENDS THE SESSION ON THE SERVER TOO ---------------------------------------
     FORGETTING THE TOKEN ON THIS PHONE IS NOT ENDING A SESSION. A token that still works after
     somebody believed they had left is the one thing sign-out must not leave behind — on a shared
     or lost phone it is the whole of what sign-out was for.
     SENT AND NOT WAITED FOR. The screen must clear whatever the network does; a sign-out that
     hangs because there is no signal is a sign-out that did not happen.

     ---------- BUT THE LAST ANSWERS GO UP FIRST -----------------------------------------------------
     A child who types an answer and hands the iPad straight over has an answer still a second and a
     half from the account. It is sent now, while the token still works, and the session is ended
     only once that request has answered — the screen clears at once either way. Whatever could not go
     stays due on this device under that child, and goes the next time they sign in here. */
```

### AND THE PRESSES, WHICH SINCE 9 OCT ARE HOW A TYPED ANSWER REACHES THE ACCOUNT AT ALL — the one in flight and every one queued behind it, on this token, before

top level, before `subs`

```
/* AND THE PRESSES, WHICH SINCE 9 OCT ARE HOW A TYPED ANSWER REACHES THE ACCOUNT AT ALL — the one in flight
     and every one queued behind it, on this token, before it is ended (`subDrain_`, js/submit.js). They
     were left out of this wait: a Check pressed just before Sign out was refused on the ended token, or
     forgotten behind the one in flight, and waited on this device for a sign-in that may never come
     (review of 10 Oct). Who and whether, read now, before `signedOut_` forgets them. */
```

### AND THE NOTEPAD, THE DOCKET AND THE TIMETABLE, still inside their moment before they go up (`keepDue_`, data.js) — each is sent only while somebody is signed

top level, before `due`

```
/* AND THE NOTEPAD, THE DOCKET AND THE TIMETABLE, still inside their moment before they go up
     (`keepDue_`, data.js) — each is sent only while somebody is signed in, so after `signedOut_` below
     the words typed in the last second and a half reached nobody (review of 317). */
```

### ONE WAY IN AND ONE WAY OUT.

top level, before `signedOut_`

```
/* ==================================================================================================
   ONE WAY IN AND ONE WAY OUT.

   THREE DOORS IN — the PIN, Google, the link in a forgotten-PIN mail — WERE THREE COPIES of the same
   six lines, and TWO WAYS OUT — Sign out, and `api()` finding the session dead — each cleared a
   different subset of what belonged to the person leaving. On the family's shared iPad that subset was
   the fault (diag-signin, measured): after one child signed out and the next signed in, **the first
   child's private message from their tutor was on the second child's Messages column for about fifteen
   seconds**, until the second child's own inbox arrived. Their stars were there too, until their payload
   landed. `MESSAGES`, the dm poll's flags, `FAVS`, the done dates held for the visit and the per-person
   keys of `DATA` were simply never told.

   `signedOut_` IS EVERYTHING THAT IS ONE PERSON'S, cleared in one place, and both ways out call it.
   `signedIn_` calls it first whenever the person arriving is not the one whose things are held — so the
   next child starts from nothing of the last one's, whichever door either of them used. */
```

### ---------- AND WHAT THEY HAD ASKED FIND FOR GOES WITH THEM

in `signedOut_`

```
/* ---------- AND WHAT THEY HAD ASKED FIND FOR GOES WITH THEM --------------------------------------
     THE SEARCH AND THE CHIPS ARE THE PERSON'S, NOT THE PHONE'S. They outlived the sign-out, so the
     next person to pick the phone up saw the last one's question — and found by the review of the
     Bible: an admin signed out from inside it left "WHAT KIND Resources ✕ SHELF Books ✕" and
     "Nothing matches" on a signed-out Find, which is the name of the one shelf only an admin is
     shown, on the screen of somebody who is not one. Nothing was fetched or drawn, but a shelf
     nobody else may see was named to them. So Find starts again from its first question, as it
     does on a fresh visit. `typeof`, because me.js loads before find.js declares `STUFF`. The box is
     not cleared here: `repaint` below draws Find's controls again from `STUFF.q`.
     ---------- `keepFind`: NOBODY WAS SIGNED IN, SO THERE IS NOBODY ELSE'S QUESTION TO TAKE AWAY ----------
     THE OWNER, 9 Oct: *"when the child writes something in an answer box then goes to sign in, it wipes
     their finder so they have to click all the way to get back there."* `signedIn_` calls this for
     nobody-signed-in as well as for somebody else, and this line could not tell the two apart — so a
     child who walked the funnel to Q13 signed out, typed an answer and signed in was put back on the
     first question. Signed out is the least anybody can be shown — `load()` drops a payload asked for by
     somebody who has gone since, so an admin's cannot land on a signed-out phone (docs/history/318) — and
     what was asked for then is nobody's but the person holding the phone, so it stays: the search, the
     chips, and — since nothing here touches `PAGE` — the card and the page they were on.
     ---------- `ended`: THE SESSION DIED UNDER THE PERSON STILL HOLDING THE PHONE --------------------------
     `api()` CALLS THIS WHEN THE SERVER SAYS THE TOKEN IS NO GOOD — thirty days up, or the PIN changed on
     another phone — and it is the owner's complaint by another door: a child on Q13 types "80", the answer
     goes up a second and a half later, the refusal comes back, and Find was emptied under the card they
     were reading. Nobody left; the same child is holding the iPad. So Find stays, and `STUFF.whose` says
     whose question it is: the same person signing in again keeps it, and anybody else signing in next is
     a switch and starts again (`signedIn_`). AN ADMIN'S IS STILL CLEARED: theirs is the one question that
     can name a shelf only an admin is shown, which is the reason above.
     ONE DECIDER PER DOOR: `signedIn_` passes `keepFind`, `api()` passes `ended`; Sign out and a switch from
     one person to another pass neither and clear Find.
     ---------- AND FIND 2, ON THE SAME RULE ------------------------------------------------------------------
     THERE ARE TWO FINDERS (docs/history/329) and both carry everything, the Books shelf too (347), so the
     shelf the admin rule above was written about can be in either. Every finder's state is kept, marked
     or cleared together, through `finderStates_` (find.js) — `typeof`, for the reason `STUFF` is. */
```

### WHAT THE LAST PERSON SENT, AS THIS DEVICE HELD IT FOR THE VISIT, AND ANYTHING OPEN OVER THE SCREEN.

in `signedOut_`

```
/* WHAT THE LAST PERSON SENT, AS THIS DEVICE HELD IT FOR THE VISIT, AND ANYTHING OPEN OVER THE SCREEN.
     Their presses still to go up stay queued under their own key, for the next time they sign in here
     (js/submit.js). It was the done dates held for the visit (`DONE_HELD`) until 9 Oct. */
```

### AND THE KEYPAD'S UNDO (`KP_UNDO`, keypad.js), as the pen's held Clears go (`padWhoChanged_`).

in `signedOut_`

```
/* AND THE KEYPAD'S UNDO (`KP_UNDO`, keypad.js), as the pen's held Clears go (`padWhoChanged_`). It is kept
     by the box's key, and the signed-out key's history outlived the person who typed it: Sam's words, typed
     signed out and claimed by him when he signed in, came back under the signed-out key at the next
     visitor's Ctrl+Z after he had gone — nobody's, for whoever signed in next (317, "Undo, the booking form,
     a switch"). The next person's Ctrl+Z starts from what they find. */
```

### ---------- AND THE FILMS, WHICH HAVE NO `for` CHECK AT ALL

in `signedOut_`

```
/* ---------- AND THE FILMS, WHICH HAVE NO `for` CHECK AT ALL --------------------------------------
     `DATA.films` IS AN ADMIN'S WHOLE FILM LIST, Drive links included (note 068: the list is secret,
     and the links are the folder's only lock), and unlike the keys above nothing reading it asks
     whose it is — the videos card draws whatever is there (Find did too, until the films left it on
     10 Oct), and the payload was the only gate. Signing out does not reload the payload, so after an
     admin signed out on the family's iPad the next person to pick it up found every film in Games →
     Videos and in Find, and a child signing in after them saw the list until their own payload landed,
     fifteen to thirty-five seconds later (found by the review of the Notflix sync, 9 Oct, through the
     real `signout`).
     The sync made it worse by filling the list the moment an admin opens Games. So the films and
     the sync's stamp go with the admin; and the card's own note of whom it synced for, and the sync
     still in flight — whose reply `filmsSyncRun_` already drops for somebody who has gone, and which
     held would leave the next admin's Sync tile busy with a sync they never pressed. Find's memo is
     dropped as well, though today its key names the person and a sign-out rebuilds it anyway: it is
     kept against `DATA` by identity and everything here is an edit in place — the stars above
     included — so the day the key stops naming the person (the role has already left it) this is
     what keeps the last person's lists out of Find. (It was written to keep the films out; Find has
     none to keep out now.)
     The search typed into the videos box goes for the reason `STUFF.q` does above: it may be a
     title. `typeof`, because games.js and find.js load after this file. */
```

### AND THE DEAD KEY OF THE DRAW/TYPE SWITCH, which face each drawing question was left on (327, 337).

in `signedOut_`

```
/* AND THE DEAD KEY OF THE DRAW/TYPE SWITCH, which face each drawing question was left on (327, 337). The
     switch went on 18 Oct (356); a device that still holds the key drops it here, with the person's other
     device state, rather than keeping a preference nothing reads. */
```

### ---------- THE REPLY'S PER-PERSON EXTRAS GO ON `DATA`, NOT ON `USER`

in `signedIn_`

```
/* ---------- THE REPLY'S PER-PERSON EXTRAS GO ON `DATA`, NOT ON `USER` ---------------------------------
     `loginReplyFor_` sends this person's submissions, stars, family and answers with the reply now, so
     they are on the screen with "Signed in" rather than fifteen to thirty-five seconds later. They are
     the payload's keys, in the payload's shapes, and they go where the payload's copies go — behind the
     same `for` checks. On `USER` they would be written into `familyUser` and kept for thirty days. */
```

### ---------- A DIFFERENT PERSON FROM THE ONE WHOSE THINGS ARE HELD STARTS CLEAN; NOBODY HELD KEEPS FIND

in `signedIn_`

```
/* ---------- A DIFFERENT PERSON FROM THE ONE WHOSE THINGS ARE HELD STARTS CLEAN; NOBODY HELD KEEPS FIND ----
     THIS WAS ONE CONDITION, `!USER || … !== pid || !pid` — "a different person, or nobody held, starts
     clean" — and so signing in from signed out threw away the funnel exactly as a switch between two
     children does (*"it wipes their finder"*, 9 Oct). Somebody else signed in still goes through
     `signedOut_` whole. From nobody, the stars, the inbox, the per-person keys and the films still go —
     they are the device's last person's, or nobody's — but Find is the same seat: the same child, now with
     a name. UNLESS FIND SAYS IT IS SOMEBODY ELSE'S: `STUFF.whose` is set only when a session died under
     its person (`ended` in `signedOut_`), and then only that person signing in again keeps it — anybody
     else is the next child on the iPad, and starts from the first question. ONE PLACE DECIDES, and it is
     these lines; `signedOut_` only does what it is told. */
```

### ---------- AND ARRIVED OVER SOMEBODY ELSE, WRITTEN DOWN BEFORE ANY DOOR IS ASKED

in `signedIn_`

```
/* ---------- AND ARRIVED OVER SOMEBODY ELSE, WRITTEN DOWN BEFORE ANY DOOR IS ASKED ----------------------
     A switch is not the same seat (318), so nothing another visitor made signed out is this person's — the
     claim below was told (`ownOnly`), and the doors that open a card or the board were not: `ansRead_` and
     `padAdopt_` moved another tab's signed-out answer into Ada's empty box after she signed in over Ben,
     and up to her account (317, "Undo, the booking form, a switch"). `ansMayMove_` reads this now, for every
     door — the board drawn by `padWhoChanged_` just below and the booking form included. The sign-out step
     above forgot the last arrival's; the same person signing in again keeps theirs. */
```

### AND WHAT WAS WRITTEN SIGNED OUT IS THIS PERSON'S, from nobody only — the same seat as Find above.

in `signedIn_`

```
/* AND WHAT WAS WRITTEN SIGNED OUT IS THIS PERSON'S, from nobody only — the same seat as Find above. ALL
     OF IT, NOW, AFTER THE ACCOUNT'S COPY: the later edit wins, and none is left on the device for the
     next child to sign in (`answersClaim_`, js/answers.js).
     AND OVER SOMEBODY ELSE, ONLY WHAT IS THEIRS: a switch is not the same seat, so nothing another visitor
     made signed out is the arriving child's — but what THEY made after the server ended their session is,
     and it was left for `ansRead_` to move into an empty box only: Ada back while Ben was still signed in
     found her essay without the words she had typed beside it (317, "Six edges closed", G1). */
```

### ---------- AND BACK WHERE YOU CAME FROM

in `signedIn_`

```
/* ---------- AND BACK WHERE YOU CAME FROM ----------------------------------------------------------------
     MEASURED ON THE iPAD: signed in, you stayed on the account column — your card and then every tutor —
     so a child sent there from a question (`go('account')` from the cheat sheet, or a swipe across to
     sign in) had to find their way back. Only when the sign-in happened ON that column: signing in from
     the card at the top of the feed leaves you on the feed. Back to the column you came from, or — with
     nowhere to go back to — Find, for a child, which is what a child signs in to do. */
```

### ---------- THE HANDLES THIS DEVICE HAS SIGNED IN, NEVER THEIR PINS

top level, before `HANDLES_KEY`

```
/* ---------- THE HANDLES THIS DEVICE HAS SIGNED IN, NEVER THEIR PINS ---------------------------------------
   Switching child on the family iPad was typing a handle every time. A chip per handle that has signed
   in here fills the box and puts the caret in the PIN, so it is one tap and the PIN. HANDLES ONLY: a
   handle is printed on every card on the site; a PIN is never written anywhere on the device. Each chip
   has a ✕ that forgets it — a child who has left, a visitor's account. Most recent first, six at most:
   more than a family's children is not a family's iPad. Every read and write wrapped, for private mode. */
```

### ---------- A HANDLE THAT MOVED MOVES ON THIS DEVICE TOO (docs/history/342, the review)

top level, before `handleRename_`

```
/* ---------- A HANDLE THAT MOVED MOVES ON THIS DEVICE TOO (docs/history/342, the review) -------------------
   `?run=kidHandles` gives a child their initials and four digits, and the family iPad's sign-in card went on
   offering the old chip — `@ella_kind42`, her first name, on the shared device — beside the new one, and the
   one-tap way in was the old one, so "Your handle has changed" came back on every sign-in until somebody
   pressed ✕. The old chip becomes the new one IN ITS PLACE; a device that never had the old one, or forgot
   it with ✕, is not given the new one by this. Called by the three things that learn a handle moved: a
   sign-in by an old handle (`signedIn_`), `myProfile` (`profileRefresh_`) and Randomise. */
```

### ---------- THE ADMIN'S SIGN-IN NAME, AS THIS DEVICE LAST SAW IT

top level, before `ADMIN_HINT_KEY`

```
/* ---------- THE ADMIN'S SIGN-IN NAME, AS THIS DEVICE LAST SAW IT -----------------------------------------
   THE GREY TEXT IN THE SIGN-IN BOX (`signInCard_`). What the admin TYPED, email or handle, because that is
   their "login name" in the owner's sentence — not the handle the reply carries, which an admin who signs
   in by address may never have typed. Only an admin's: a child's handle is already a chip, one tap away,
   and a placeholder naming whichever child signed in last would be the wrong child for the next one.
   Kept when they sign out — it is a hint, like the chips, and no secret; ✕ on the admin's own chip
   forgets it with the chip. */
```

### THE CHIP CHOSEN STAYS LIT, so whoever is holding the iPad can see whose account the PIN is for before typing it — the one thing on this card that answers

top level, before `row`

```
/* THE CHIP CHOSEN STAYS LIT, so whoever is holding the iPad can see whose account the PIN is for
     before typing it — the one thing on this card that answers *"i feel very insecure when signing into
     the kids accounts"*. A value and a focus are invisible from across the table; a gold edge is not. */
```

### ---------- THE WARDROBE

top level, before `AV_FIG`

```
/* ---------- THE WARDROBE -------------------------------------------------------------------------
   Every slot, every item, with the locked ones showing what they would take. A catalogue you can
   SEE is what makes levelling up mean anything — a list of only what you already own tells you
   nothing about what is next, which is the whole reason to have a level at all.

   The colours are free and come first, because they are what most people change and because
   nobody should have to earn the right to have brown hair. */
```

### `on('build-said')` WAS HERE, opening `versionSaid_` in a sheet from a `Build` tile on your own card.

top level, before `AV_FIG`

```
/* `on('build-said')` WAS HERE, opening `versionSaid_` in a sheet from a `Build` tile on your own
   card. The tile was removed on request, and the stamps are printed under the admin's own Signing-in
   card on the Settings column instead — a sheet opened from nothing is a handler with no door. */
```

### ---------- THE WARDROBE IS ONE CARD

top level, before `AV_FIG`

```
/* ---------- THE WARDROBE IS ONE CARD ---------------------------------------------------------------
   *"the avatar bit is split into like 4 widgets. should just be 1. make things smaller to fit on a
   screen if need be."* It was four pages — Colours, then the six slots two at a time — and each of
   the four drew the same figure at the top, so swiping the wardrobe was one picture going past four
   times. The history of why it was paged at all is worth keeping: rendered whole at the old sizes it
   was **1517px against a 534px pane at 320x568**, with every option a 44px drawing and its name
   under it, and a pane that could not scroll. That arithmetic is what changed, not the goal.

   SMALLER, AND THE NUMBERS ARE THE DESIGN. Every line is a label column and a strip: the three
   colours are 21px circles, eight to a row, and the six slots are 29px squares holding the drawing
   alone, six to a row — which fits a 320px card (about 191px of strip) exactly, and wraps rather
   than scrolls sideways the day a shop row adds a seventh hairstyle. Measured with the probe at
   320x568, the whole card is inside the pane with room to spare; see `ACCEPTED_TAP` in
   check/ui.js for why a 21px circle and a 29px square are an accepted trade and not an oversight.

   THE NAME MOVED OFF THE BUTTON AND ONTO IT. A 29px square has no room for `fringe` under the
   drawing, so the name is its `aria-label` and `title` — the drawing is what anybody reads, which is
   the argument `.av-opts` already makes against a dropdown of names — and a locked item keeps the
   one word that matters, what it would take, as a small pill across its foot.

   THE FIGURE ONCE, beside the level and the credits. Credits live here now rather than on your
   account card — *"credits can stay in the column to the right"* — because credits are what buy a
   wearable, so this is where the number means something. */
```

### ---------- AND THE CARD IS A SECTION OF YOUR OWN CARD'S EDIT NOW (docs/history/339)

top level, before `wardrobeBody_`

```
/* ---------- AND THE CARD IS A SECTION OF YOUR OWN CARD'S EDIT NOW (docs/history/339) ------------------
   The owner, 11 Oct: *"your figure should also be in your profile card editing."* It was the last page
   of Settings, "Your figure", reached by a swipe to the end of thirteen; it is the `figure` section of
   the form your own card turns into (`cardEditForm_`), straight under the picture, because the figure is
   what the picture's "your figure" option draws (`photoPicker_`) and the two are edited side by side.
   So this is the INSIDE of the card now — the figure, the level and credits, the swatches and the slots
   — and the section around it says what it is. `avatarSave` rebuilds every `.av-card` from this one
   renderer, so a pick moves the ring, the lock and the credits as it did on Settings. */
```

### `on('wardrobe')` WAS HERE — the `Your figure` tile's door, which found the colour page on this column and turned to it.

top level, before `packLook_`

```
/* `on('wardrobe')` WAS HERE — the `Your figure` tile's door, which found the colour page on this
   column and turned to it. The tile went on request; the wardrobe is a section of your own card's Edit
   now (docs/history/339), straight under the picture, so there is nothing to jump to. */
```

### ---------- THE FIGURE AS IT IS DRAWN, NOT AS THE CELL SAYS IT (the review of docs/history/339)

top level, before `lookKey_`

```
/* ---------- THE FIGURE AS IT IS DRAWN, NOT AS THE CELL SAYS IT (the review of docs/history/339) ------------------
   MOST PEOPLE HAVE NEVER CHOSEN A LOOK: their `avatar` cell is blank, and the figure is worked out from their
   handle (`avatarConfig`'s hash — skin and hair colour). So two cells can draw one face (blank, and the same look
   written out) and one cell can draw two (blank, under two handles). Whether a figure CHANGED is asked of what is
   drawn — the whole look, with the handle it was drawn under, keys in one order — never of the raw cell: Cancel
   compared cells, and after a Randomise put back a blank look under the NEW handle, a different face from the one
   the card opened with, under a toast saying "Put back as it was". */
```

### ---------- HOW MANY LOOKS ARE ON THE WIRE

top level, before `AV_WIRE`

```
/* ---------- HOW MANY LOOKS ARE ON THE WIRE ------------------------------------------------------------------
   `AV_SEQ` decides which answer the PHONE believes; it cannot decide which request the SERVER finishes last.
   `saveAvatar` takes no lock, so a pick and a Cancel's put-back sent side by side are two writes of one cell,
   and the last to finish wins — measured in the review of docs/history/339: a shirt picked, Cancel at once, the
   pick finishing last, and the sheet wore the shirt Cancel said it had taken off. The picture had this guard
   already (`.pfp.is-sending`, note 330); the figure counts its requests here, both ways out of `api()`, and
   `card-cancel` waits for nought. A count and not a class on the wardrobe, because a payload landing redraws
   the form under a request and a class would go with the old element. */
```

### ---------- AND ONE AFTER ANOTHER, IN THE ORDER THEY WERE CHOSEN (round 1 of the fixes for docs/history/339)

top level, before `AV_WIRE`

```
/* ---------- AND ONE AFTER ANOTHER, IN THE ORDER THEY WERE CHOSEN (round 1 of the fixes for docs/history/339) -------
   THE KEEP MADE IT TWO LOOKS ON THE WIRE BY ITSELF. `avatarKeep_` sends a look the moment a new handle lands, and the
   wardrobe is two sections above Randomise — a colour tapped straight after was a second `saveAvatar` beside the
   keep, and with no lock on the server whichever finished last won: measured, the keep finishing last put the sheet
   back in shirt 0 while the phone wore shirt 3, and Save shut the card over a figure everybody else draws in other
   clothes. Two quick taps had always been the same race, out of sight (`AV_SEQ` settles the PHONE, not the sheet).
   So each look waits for the one before it to be answered, and the server finishes them in the order they were
   chosen — the last one chosen is the last one written. The token goes in when the look is CHOSEN, not when it is
   sent: a look waiting in this line belongs to whoever picked it, and a phone handed to somebody else who signs in
   meanwhile must not write it on theirs (`api()` reads `USER.token` at sending time otherwise). */
```

### ---------- EVERY FIGURE ON THE COLUMN, NOT THE FIRST ONE `$()` FINDS

top level, before `avatarDraw_`

```
/* ---------- EVERY FIGURE ON THE COLUMN, NOT THE FIRST ONE `$()` FINDS ------------------------
   THE WARDROBE WAS SEVEN PAGES AND EACH CARRIED THE FIGURE (it is one card now). As an id that was
   four elements with one id and `$()` handing all of them the first — so picking a colour on page five moved the
   figure on page one and the one under your thumb did not change. The `$('msg-text')` fault, on
   the surface where the whole point is that you SEE the change. A class, and all of them. */
```

### ---------- THE WHOLE CARD FOLLOWS THE LOOK, NOT ONLY THE FIGURE

top level, before `avatarDraw_`

```
/* ---------- THE WHOLE CARD FOLLOWS THE LOOK, NOT ONLY THE FIGURE --------------------------------
   THIS REDREW `.av-figure` AND NOTHING ELSE, so the ring stayed on the colour you had left, a
   bought item went on showing its price and lock, and the credits line kept the old balance —
   measured, pressing skin 4 left the ring on skin 1 while the figure changed. The card's INSIDE is
   rebuilt from `wardrobeBody_`, the one renderer, but the card ELEMENT is kept: `paneReach_` writes
   its zoom inline on that element and `paneWatch_`'s observer is attached to it, and swapping it
   would drop both. EVERY `.av-card`, because the wardrobe is a section of your own card's Edit now
   (docs/history/339) and the You column is drawn — and counted by the pager — more than once. */
```

### ---------- AND THE PICTURE'S "YOUR FIGURE" WITH IT

top level, before `avatarDraw_`

```
/* ---------- AND THE PICTURE'S "YOUR FIGURE" WITH IT ------------------------------------------------
   THE OWNER, 11 Oct: *"your figure should also be in your profile card editing."* The section above
   this one on the same form is the picture chooser, whose first option is your figure (`photoPicker_`)
   and whose preview is your figure when that is your picture — both drawn from `USER.avatar` when the
   form was drawn. Left alone, a pick here dressed the wardrobe's figure and left the picker's in the
   old clothes one section up: two drawings of one figure, disagreeing, on one form. So they are drawn
   again from the same look, by the same `avatarFor` and `pfpFace_` that drew them. */
```

### ---------- AND ONLY THE LATEST TAP'S ANSWER COUNTS

in `avatarSave`

```
/* ---------- AND ONLY THE LATEST TAP'S ANSWER COUNTS -----------------------------------------------
     Two quick taps are two requests, and they can come back in either order — measured, skin 2 then
     skin 5 left the phone wearing skin 2 when the first reply was the slower one. Each tap takes a
     number; a reply for an older one is ignored, in the refusal path too, or a late refusal of an
     old tap would put the look from before it back over a newer one the server accepted. */
```

### ---------- A TOAST, BECAUSE THE PAGE NO LONGER HAS A LINE TO WRITE TO

in `avatarSave`

```
/* ---------- A TOAST, BECAUSE THE PAGE NO LONGER HAS A LINE TO WRITE TO --------------
         `#av-said` WENT WITH THE SHEET and it was the second duplicate id on these pages. What it
         said on the happy path was "Saved" over a figure that had already changed — which is what
         `avatarSave`'s own comment above calls the difference between a wardrobe and a form. Only
         BUYING is worth a word, because that one spends credits. */
```

### ---------- A NEW HANDLE KEEPS THE FACE IT HAD (the review of docs/history/339)

top level, before `avatarKeep_`

```
/* ---------- A NEW HANDLE KEEPS THE FACE IT HAD (the review of docs/history/339) ----------------------------------
   A FIGURE NOBODY DRESSED IS WORKED OUT FROM THE HANDLE (`avatarConfig`: *"Seeded by their handle, so it is theirs
   and never changes on its own"*) — so Randomise, which changes the handle, changed the skin and the hair colour of
   everybody who had never chosen a look. It did on Settings' Signing in card before 339, out of sight of the
   wardrobe; on your own card's Edit the wardrobe is two sections above Randomise, and pressing it visibly turned a
   darker face with red hair into a pale one with brown (measured, every role). Nothing on the form said it would,
   and Cancel could not undo it — the cell was still blank.
   SO THE FACE IS WRITTEN DOWN THE MOMENT THE HANDLE CHANGES: the look the OLD handle drew, through the one door a
   look has (`saveAvatar`), with nothing new on the server. A press on the handle never changes the face; the face
   changes when somebody changes it in the wardrobe. Put on the phone first, so no frame draws the new handle's
   colours; a refusal puts the cell back to blank and the figure follows the new handle, as the server's copy does,
   and says so. Only for a blank look: a look somebody chose names its own colours and no handle moves it. */
```

### ---------- MAKING AN ACCOUNT

top level, before `REG_PIN`

```
/* ---------- MAKING AN ACCOUNT ---------------------------------------------------------------------
   THIS WAS `toast('Registration is the next thing to wire')`, under a card that said "No account
   yet?" — so the front door's third way in was a sign that it was not a way in. The backend has had
   `register` all along (dopost.gs): first name, last name, email, PIN, and it writes a student row
   marked PENDING and mails a `?verify=` link. Nothing on a phone ever posted it.

   A SHEET, BECAUSE IT IS A SHORT QUESTION WITH AN END — the same reason `friendsSheet` is one. And
   it is a FORM, so its control is a button, not a tile: the tile that opens it is the thing's action,
   the button inside is the form's.

   THE PIN RULE IS CHECKED HERE AS WELL AS THERE, and that is a deliberate exception to the argument
   `forgot-pin` makes about not repeating the server's rules. A wrong PIN is the likeliest mistake on
   this form, and finding out costs fifteen seconds against Apps Script with every box locked — so the
   phone says it at once. The server's `/^\d{4,8}$/` still decides; this is the same pattern so the
   two cannot refuse different things, and `check-flow` holds them together.

   NO `ref`. The backend will record a referral code, but nothing hands one out any more (see
   `my-referral`, gone), and `?ref=` on this site's address is Stripe's return leg in receipt.js —
   reading it here would credit a payment reference as an introduction. */
```

### ---------- AND A CHILD WITH NO EMAIL OF THEIR OWN

top level, before `REG_NOTE`

```
/* ---------- AND A CHILD WITH NO EMAIL OF THEIR OWN --------------------------------------------------
   ASKED FOR AS *"so all kids can login easily with their handle and pin."* This form was the only way
   in that did not need the owner, and it refused the commonest child there is: no address was
   refused, and mum's — already on her own account or a brother's — was "already registered".

   ONE TICK, NOT A SECOND FORM. The box is the same box; the tick says whose address it is, and the
   post carries it as `parent_email` instead of `email` (see `register` in dopost.gs), so it is never
   the child's sign-in address and never clashes with the grown-up's own account. The link goes to
   the grown-up, who says yes; the child signs in with their HANDLE, which the reply carries and the
   sign-in box is filled with. The note under the button says the other way — a parent making the
   account from theirs — because that is the one with no waiting at all. */
```

### ---------- AND WHO THE ACCOUNT IS FOR, ASKED FIRST

top level, before `REG_NOTE`

```
/* ---------- AND WHO THE ACCOUNT IS FOR, ASKED FIRST -------------------------------------------------
   FOUND BY THE WALK AFTER *"audit the registration process and so on so all kids can login easily
   with their handle and pin."* A parent who made an account here was made a STUDENT — `register`
   wrote that for everybody — so Settings never drew "Make your child's account", and ticking Client
   under Your roles was refused, rightly, by the rule that stops a child making themself a parent.
   The fault was not the rule; it was that nobody had been asked.

   ONE QUESTION, AND NOTHING ELSE UNTIL IT IS ANSWERED. Two buttons — a FORM's control, so buttons and
   not tiles, and the chosen one gold: `.btn-row .btn.on`, the two-answer pattern `posting as` already
   uses. The boxes appear under it once it is answered, so the question cannot be skipped and there is
   no "you forgot to say" toast to write. Nothing is chosen for you: a default is the answer the walk
   found wrong, whichever way round it was set.

   THE ANSWER SHAPES THE REST. A parent's account needs an address of its own (it is what they sign
   in with, and the server refuses `parent_email` beside `who: 'parent'`), so the grown-up's-email tick
   is a student's only — hidden, and unticked, for a parent. The note under the button says what comes
   next for the person who chose: a parent's is where their child's account is made.

   THE CHOICE LIVES ON THE ROW (`data-who`), not in a variable: the sheet is the form, a closed sheet
   forgets it, and a reopened one asks again — which is right for a question about who you are. */
```

### THE TWO NAMES SHARE A ROW, as on "Make your child's account" — measured:

in `registerSheet_`

```
/* THE TWO NAMES SHARE A ROW, as on "Make your child's account" — measured: with the question
            above them, four boxes stacked put Make my account under the fold of a 320x568 phone for a
            student, and the parent's note half under it. A row is 74px back, and a name fits in half
            of a 320 sheet. */
```

### THE NAMES AND THE ADDRESS ARE DRAFTS (data.js; docs/history/317) — the sheet closed by a tap outside, or the page reloaded, and they were gone.

in `registerSheet_`

```
/* THE NAMES AND THE ADDRESS ARE DRAFTS (data.js; docs/history/317) — the sheet closed by a tap
            outside, or the page reloaded, and they were gone. The DEVICE'S drafts (nobody is signed in
            to make an account), so they last `DRAFT_DEVICE_MS` and no longer: on a shared iPad the next
            family is not handed this one's address tomorrow. Dropped when the account is made. NOT THE
            QUESTION ABOVE, which is asked again on purpose (the note over `REG_NOTE`), nor the tick it
            resets, and NEVER THE PIN. */
```

### THREE LINES AT 320, MEASURED:

in `registerSheet_`

```
/* THREE LINES AT 320, MEASURED: the first draft was five, and its last two sat under the fold
            of a sheet nobody scrolls. The tick says whose address it is in four words for the same
            reason. Filled from `REG_NOTE` when the question is answered. */
```

### UNREACHABLE FROM THE SHEET — the button is under the question until it is answered — and said anyway, for a button pressed some other way:

top level, before `body`

```
/* UNREACHABLE FROM THE SHEET — the button is under the question until it is answered — and said
     anyway, for a button pressed some other way: never posted unanswered, because an unanswered
     `register` is a student, and that is the fault this question is here to end. */
```

### THROUGH `send_`, so the button spins, the four boxes lock while it is on the wire (`#sheet-body` is one of the boxes `send_` knows to lock) and a refusal

top level, before `body`

```
/* THROUGH `send_`, so the button spins, the four boxes lock while it is on the wire (`#sheet-body`
     is one of the boxes `send_` knows to lock) and a refusal — "That email is already registered" —
     is toasted in the server's own words. */
```

### THE ADDRESS GOES INTO THE SIGN-IN BOX, because the next thing this person does — after the email — is sign in with it, and they have just typed it once.

top level, before `handle`

```
/* THE ADDRESS GOES INTO THE SIGN-IN BOX, because the next thing this person does — after the
         email — is sign in with it, and they have just typed it once. FOR A CHILD WITH NO ADDRESS IT
         IS THE HANDLE, which they have never seen: it is the only thing they will sign in with, and
         the box is the one place on the screen that stays put while they wait for their grown-up. */
```

### ---------- AND THE LINK IN THAT EMAIL

top level, before `verifyFromLink_`

```
/* ---------- AND THE LINK IN THAT EMAIL ------------------------------------------------------------
   `register` MAILS `SITE_URL?verify=<token>` AND NOTHING READ IT. So every account made from the
   form would have stayed PENDING for ever. Signing in no longer waits on it (the owner, 6 Oct), but
   an unconfirmed address is still one nothing but the link and a forgotten PIN is mailed to, and a
   grown-up's link is what puts a no-email child on their account — when that account's own address
   is confirmed (`verifyEmail`, `parentPending`).

   READ ONCE AT START-UP, FROM boot.js, and taken out of the address before anything is sent, the
   same way a shared `?post=` link should be: the token is single-use (dopost.gs clears it), so a
   refresh with it still in the bar would post it again and be told the link "has already been used"
   — a refusal on the screen of somebody whose account is fine.

   NO DATA NEEDED, so it does not wait for `load()`. The two requests run side by side. */
```

### ---------- `session`: WHO THIS PHONE IS SIGNED IN AS, beside the link's own token

in `verifyFromLink_`

```
/* ---------- `session`: WHO THIS PHONE IS SIGNED IN AS, beside the link's own token ---------------------
     A link that MOVES an account to a new address only works where that account is signed in
     (`verifyEmail`, `authMove*_` in booking.gs) — the new address's inbox and the account, both. `token`
     is the link's, so `api()` adds nothing, and the phone's own goes in a field of its own. A link that
     only confirms ignores it. */
```

### ---------- A NEW ADDRESS, MOVED

in `verifyFromLink_`

```
/* ---------- A NEW ADDRESS, MOVED ----------------------------------------------------------------
         The row has it now, confirmed. Said here and written into `USER` at once — the profile a
         `myProfile` beside this may bring back is from before (`ACCOUNT_AT_`). */
```

### ---------- `parentPending`: A SHEET THEY CLOSE, NOT A TOAST THAT CLOSES ITSELF

in `verifyFromLink_`

```
/* ---------- `parentPending`: A SHEET THEY CLOSE, NOT A TOAST THAT CLOSES ITSELF ----------------
           THERE IS A PARENT ACCOUNT ON THIS ADDRESS AND NOBODY HAS CONFIRMED IT, so the child was not put
           on it — it may not be the reader's (see `verifyEmail`). Round one said this in a toast of about
           170 characters, which `toast` takes away after 2.6 seconds; the child's link is single-use, so
           the grown-up could never open it again to read the rest (PR #130 review, round two). The next
           step is theirs and has three parts, so it is a sheet with Done, and stays until they say so.
           The last line is for the reader to whom the account is a surprise: somebody else made it on
           their address, and "Forgotten your PIN?" is how they take it back (`authResetUse_`). */
```

### ---------- AND YOUR OWN, OPENED ON THE PHONE YOU ARE SIGNED IN ON

in `verifyFromLink_`

```
/* ---------- AND YOUR OWN, OPENED ON THE PHONE YOU ARE SIGNED IN ON --------------------------------
           Since sign-in stopped waiting on the link, the person opening it is often already in — and
           was told "now sign in". The held card and the line under their own card go at once, from the
           reply (`myProfile` runs beside this request at start-up and may have answered first, with the
           address still waiting). Matched on the handle, which is one person's, or the name. */
```

### AND A `myProfile` ASKED BEFORE THIS IS NOT ALLOWED TO PUT IT BACK (`ACCOUNT_AT_`) — measured by round three of the review:

in `verifyFromLink_`

```
/* AND A `myProfile` ASKED BEFORE THIS IS NOT ALLOWED TO PUT IT BACK (`ACCOUNT_AT_`) — measured
             by round three of the review: the one boot fires beside this request landed after it, said
             "still waiting", and the held card stayed under a toast saying the opposite. */
```

### ---------- "SIGN IN, AND IT WILL FINISH BY ITSELF"

in `verifyFromLink_`

```
/* ---------- "SIGN IN, AND IT WILL FINISH BY ITSELF" ---------------------------------------------------
       A move link opened where the account is not signed in. Kept on this phone, and `afterSignIn_` sends
       it again the moment somebody signs in — if it is the right account it moves, and if not the server
       says so again. Kept for the tab's life only: a link is single-use and a newer mail retires it. */
```

### ---------- WHAT EVERY DOOR IN DOES ONCE IT IS IN

top level, before `afterSignIn_`

```
/* ---------- WHAT EVERY DOOR IN DOES ONCE IT IS IN -----------------------------------------------------
   The PIN, Google and the sign-in link each set `USER` from the same reply (`loginReplyFor_`), and then
   two things are owed that none of them did on its own:
   · A SENTENCE THE SERVER SAYS MUST BE READ — the children taken off a PENDING account its address's
     owner has just taken back (`authTakeBack_`), or Google taking away the PIN. A sheet with Done, not a
     2.6-second toast: it is about somebody's children, and nobody can ask for it again. The same for a
     change of address the taking back cancelled (`moveDropped`, `authResetTake_`): it may have been the
     owner's own, and this sentence is the only place they learn to type it again.
   · A MOVE LINK THAT WAS WAITING FOR A SIGN-IN (`verifyFromLink_`), sent now.
   · AN OLD HANDLE THAT LET THEM IN (`handleMoved`, docs/history/342): a child whose handle the business
     moved to their initials typed the one on their slip — it still works, and this is where they learn
     the new one, in a sheet they close rather than a toast that closes itself. */
```

### ---------- AND THE SIGN-IN LINK IN A FORGOTTEN-PIN MAIL

top level, before `pinFromLink_`

```
/* ---------- AND THE SIGN-IN LINK IN A FORGOTTEN-PIN MAIL ----------------------------------------------
   `?signin=<key>` — `pinLink` in dopost.gs: the emailed PIN used by the one copy of it nobody can guess,
   so it gets its owner in even when somebody else's wrong PINs have locked the account and used up the
   typed PIN (round three of the PR #130 review). Read once at start-up like `?verify=`, and taken out of
   the address before anything is sent: it is single-use, and a refresh would post it again. */
```

### ---------- FRIENDS

top level, before `friendHandles`

```
/* ---------- FRIENDS ------------------------------------------------------------------------------
   A comma list of handles on the person's own row. Kept as one cell for the same reason the docket
   is: a friendship has no life of its own, nothing links to it, and a tab would mean a row id and
   a deletion policy for something that is a name in a list.
--------------------------------------------------------------------------------------------- */
```

### ADDING ONE. The LIST is on Find with everything else; this is only the asking — a short question with an end, which is what a sheet is for.

top level, before `friendsSheet`

```
/* ADDING ONE. The LIST is on Find with everything else; this is only the asking — a short question
   with an end, which is what a sheet is for. It used to show the list here too, which made friends
   the one set of people on the site reachable from two places. */
```

### `on('friends')` WAS HERE and nothing on any screen carried `data-do="friends"`.

top level, before `box`

```
/* `on('friends')` WAS HERE and nothing on any screen carried `data-do="friends"`. It opened the
   same sheet `friend-add-open` opens, twenty-six lines below, which IS reachable — so this was a
   second door onto one room, with no handle on the outside of it.
   Removed rather than given a button: two ways in is two things to keep in step, and the one that
   works is the one people use. */
```

### A `myProfile` ASKED BEFORE THIS IS ABOUT THE LIST BEFORE IT (342) — it carries `friends` now, and landing after this it would put the old list back

in `friendsSave`

```
/* A `myProfile` ASKED BEFORE THIS IS ABOUT THE LIST BEFORE IT (342) — it carries `friends` now, and
     landing after this it would put the old list back (`profileRefresh_` asks again instead). Marked
     again when the save lands, as Randomise marks it: one asked while the save was on its way may have
     been answered from the sheet before the save reached it. */
```

### The list lives on Find now, so that is what has to be redrawn — and the memo has to be told, or it serves the list from before the change.

in `friendsSave`

```
/* The list lives on Find now, so that is what has to be redrawn — and the memo has to be told,
     or it serves the list from before the change. ON BOTH FINDERS, which list the friends alike
     (docs/history/347): `FIND_MEMO` from out here is Find's alone, so `friendsForget_` asks every
     finder's, and the one in front is drawn. */
```

### ---------- MESSAGES

top level, before `MESSAGES`

```
/* ---------- MESSAGES -----------------------------------------------------------------------------
   Read-only for now on the sending side of a thread nobody has started: the backend has
   `sendMessage` and this can post to it, but there is no picker for WHO — that belongs with the
   roster, where the people you are talking to are already on screen.
--------------------------------------------------------------------------------------------- */
```

### WHERE MESSAGES COME FROM.

top level, before `MESSAGES`

```
/* WHERE MESSAGES COME FROM.
   `DATA.messages` — which both readers below used to take — is not a key the payload has ever
   held. Messages are a POST action (`messages`), because a conversation is private and the GET
   payload goes out whole to whoever asks for it. So the widget and the sheet both read undefined,
   fell to `|| []`, and said "Nothing yet." to everybody for ever — the exact shape of the
   `liveJobs` fault, and just as quiet.

   Held here between openings so re-opening the widget does not re-ask, and refreshed on every
   open so it is never more than one tap stale. */
```

### ---------- WHETHER THE LAST ANSWER WAS ONE

top level, before `MSG_FAILED`

```
/* ---------- WHETHER THE LAST ANSWER WAS ONE ------------------------------------------------------
   `MESSAGES` CANNOT SAY. It is left alone on a failure — deliberately, which is why a blip does not
   read as everything having been deleted — so `null` means both *never asked* and *asked and
   refused*, and the column drew "Nothing yet." over an inbox nobody managed to read. This
   repository's oldest fault, on the one screen whose whole job is telling you somebody wrote.

   ONE FIELD, NOT TWO. A `MSG_AT` was here as well, and the poll in posts.js gated on it — which was
   wrong in a way only the failure path shows: it only moves on SUCCESS, so a refused fetch left the
   gate open and every `paint('dm')` asked again. The pacing is a fact about the ASKING and lives
   with the asking, as `DM_LAST`; this is a fact about the DATA. */
```

### ---------- ONE REQUEST AT A TIME, AND ONLY FOR WHOEVER ASKED

top level, before `MSG_ASKING`

```
/* ---------- ONE REQUEST AT A TIME, AND ONLY FOR WHOEVER ASKED ---------------------------------------
   MEASURED: every load asked twice — `load()` for the widgets, and the Messages column's own draw
   (`dmSync_`) a moment later — two round trips to Apps Script for one inbox. A second caller while one is
   on the wire is handed the same promise. And a reply that lands after the iPad has changed hands is the
   last child's inbox: it is dropped rather than put on the next child's column (diag-signin, C). */
```

### `send` FOR THE SAME REASON, and the comment below was written as though it already did.

in `loadMessages`

```
/* `send` FOR THE SAME REASON, and the comment below was written as though it already did. With
     `api()` a refusal — "Not signed in." — resolves with no `messages` key, `|| []` turns it into an
     empty list, and the inbox reads as empty rather than as unreachable. That is the exact fault
     the next four lines say they are guarding against, and it was reaching them as a success. */
```

### A failure leaves whatever was already there rather than emptying the list — an unreachable backend is not the same fact as an empty inbox, and showing the

in `asking.p`

```
/* A failure leaves whatever was already there rather than emptying the list — an unreachable
       backend is not the same fact as an empty inbox, and showing the second for the first is how
       a network blip reads as everything having been deleted. */
```

### WRITING ONE — THE HALF THAT HAS NEVER EXISTED.

top level, before `messageSheet`

```
/* ==================================================================================================
   WRITING ONE — THE HALF THAT HAS NEVER EXISTED.

   `sendMessage` WAS A DOOR WITH NO HANDLE. The backend has had the whole of it since messages were
   built: a role policy (`MESSAGING`), a five-minute gap between sends, a 2,000-character cap, and
   an email to the recipient because nobody sits on a tutoring site waiting for a message. Measured
   across the app: of the four message actions, `messages` had one caller and `sendMessage`,
   `readMessage` and `flagMessage` had none. This is the same shape as `orderPrints` — access
   listed, priced, published in the feature list, and never once posted to.

   THE NOTE ABOVE SAID WHERE IT BELONGED and it was right: "there is no picker for WHO — that
   belongs with the roster, where the people you are talking to are already on screen." A tutor's
   pass IS the picker. You are looking at the person; the control names them, and nothing has to be
   typed, searched or guessed.

   BY ID, NOT BY NAME. `findPerson(name, id)` prefers the id and falls back to matching the name —
   right for a row typed into the sheet before anybody has an id, and silently wrong the day two
   people share one. On a private message that is not a denial, it is a disclosure. The id is on the
   payload now; see the note beside `personId` in doget.gs for why publishing it costs nothing.

   THE SERVER DECIDES WHETHER YOU MAY, and its sentence is what the sheet shows. Repeating
   `MESSAGING` on the phone would be two copies of one rule — the fault recorded here under `kinds`,
   under `link`/`source_url` and under `childrenOf` — and the server's own words already say what to
   do instead: "You cannot message them directly. An admin can pass it on."
================================================================================================== */
```

### THE SHEET IS THE SAME FORM IN A SHEET.

top level, before `messageSheet`

```
/* THE SHEET IS THE SAME FORM IN A SHEET. It had its own textarea, its own button and its own note,
   which is a second composer to keep in step with the one on the thread — the fault recorded here
   under `childrenOf`, under `link`/`source_url` and under `factsNow_`. Five rows rather than one,
   because a sheet opened to write a message has nothing else on it to make room for. */
```

### ---------- SENDING, OPTIMISTICALLY

top level, before `MSG_PENDING`

```
/* ---------- SENDING, OPTIMISTICALLY ----------------------------------------------------------------
   THE BUBBLE APPEARS THE MOMENT SEND IS PRESSED. Against this backend a send is several seconds —
   longer again with a photograph on it — and a box that sits there saying "Sending…" reads as the tap
   having missed. So the message joins its thread at once, marked `sending`, and becomes an ordinary
   message when `loadMessages` next brings it back from the sheet.

   A REFUSAL STAYS ON THE SCREEN AS A REFUSAL, beside the message it refused, with the server's own
   sentence and a Retry — the rule `check-replies.js` enforces, one step on: a message that failed
   must not read as sent, and what was typed must not be thrown away. `send()` rather than `api()`
   for exactly that reason: it throws on `{ error }`.

   THE PENDING LIST IS NOT `MESSAGES`, because `loadMessages` replaces that array wholesale — a
   pending item written into it would vanish on the next poll whether or not it had been delivered. */
```

### THE CAPS, IN BYTES, AND THE SERVER HOLDS THE SAME ONES (`MSG_FILE_MAX`, `MSG_FILES_MAX` and `MSG_FILES_COUNT` in content.gs).

top level, before `MSG_CAP_`

```
/* THE CAPS, IN BYTES, AND THE SERVER HOLDS THE SAME ONES (`MSG_FILE_MAX`, `MSG_FILES_MAX` and
   `MSG_FILES_COUNT` in content.gs). Checked here so a person is told when they CHOOSE a file rather
   than after a minute of upload. 32MB rather than a round 45 because the files travel as base64,
   four thirds of their size, and Apps Script takes about 50MB in one POST — a larger message would be
   refused by Google with an HTML page rather than by the handler with a sentence. */
```

### A photograph over a couple of megabytes is redrawn through `camItemOf_` — the same 1600px the camera uses — because a camera roll's original is four megabytes

top level, before `msgRead_`

```
/* A photograph over a couple of megabytes is redrawn through `camItemOf_` — the same 1600px the
   camera uses — because a camera roll's original is four megabytes for a bubble 280px wide. Anything
   else goes as it is. Never rejects: a file that cannot be read at all comes back `null`, and
   `msgPost_` SAYS SO rather than sending without it.

   A PHOTOGRAPH THE BROWSER CANNOT DRAW GOES AS IT IS. `camItemOf_` answers `null` when the image will
   not decode — a HEIC in Chrome, Firefox or Android is exactly that — and this used to hand the
   `null` straight on, so a four-megabyte iPhone photograph chosen on a laptop was dropped from the
   message without a word and the words went alone. The redraw is a saving, not a condition: when it
   cannot be had, the original is read and sent, and Drive's own thumbnail draws it in the bubble. */
```

### A CLIP IS TOLD HOW TO FIT.

top level, before `file`

```
/* A CLIP IS TOLD HOW TO FIT. 20MB is about twenty seconds of a phone's 1080p video — the owner's
       "i cant send … videos" was mostly this — and "over 20MB" alone leaves somebody to work out
       that trimming is the answer. The cap itself is the server's and stays. */
```

### ENTER SENDS ON A KEYBOARD AND NEVER ON A PHONE.

top level, before `b`

```
/* ENTER SENDS ON A KEYBOARD AND NEVER ON A PHONE. On a phone the return key is the only way to start
   a new line, and a message sent half-written because somebody wanted a paragraph break is worse than
   one more tap. `pointer: fine` is the test for a real keyboard beside a real mouse. */
```

### ---------- A FILE THAT COULD NOT BE READ IS NEVER LEFT OUT IN SILENCE

in `msgPost_`

```
/* ---------- A FILE THAT COULD NOT BE READ IS NEVER LEFT OUT IN SILENCE ------------------------
       `list.filter(Boolean)` WAS THE WHOLE OF IT: an unreadable file vanished and the message went
       without it, saying "Sent". Now the rest still go — one bad file does not hold up the other
       five — and the one that could not be read goes BACK IN THE BOX with its name said, so it is
       somewhere a person can see it and decide, not nowhere. Nothing readable and nothing typed is
       a refusal that names it. */
```

### Repaint the column and stay on the conversation somebody is in.

top level, before `dmRedraw_`

```
/* Repaint the column and stay on the conversation somebody is in. A new message moves its thread to
   the front, so without this the page index stays put and the screen shows SOMEBODY ELSE'S thread
   after you press send — the conversation you wrote in replaced by the next one down. */
```

### ---------- THE WORDS WITHOUT THE PHOTOGRAPHS

top level, before `p`

```
/* ---------- THE WORDS WITHOUT THE PHOTOGRAPHS -----------------------------------------------------
   OFFERED ONLY WHEN THE SERVER SAID THE FILES WERE THE PROBLEM (`why: 'files'`) — no column for them
   yet, or a deployment not allowed to write to Drive — and only when something was typed. The site
   decided a message goes whole or not at all (see `msgAttachSave_`), so the words are not sent behind
   anybody's back; this is the person choosing to.
   THE FILES GO BACK IN THE BOX, NOT THE BIN. "Never silently drop a file": they wait in the composer
   for the next message, where Remove can still take them out. */
```

### ---------- AND MARKING THEM READ, WHICH NOTHING HAS EVER DONE

top level, before `markRead_`

```
/* ---------- AND MARKING THEM READ, WHICH NOTHING HAS EVER DONE -----------------------------------
   `readMessage` IS THE THIRD DOOR WITH NO HANDLE. `messageThreads_` counts a message unread when it
   has no `read_at`, and only the server can write that cell — so the badge beside a conversation
   could only ever have gone up. A count that never falls stops being a count and becomes decoration
   within about a day.

   ONE CALL PER MESSAGE, and only for the ones that are actually unread and actually yours: the
   server refuses anybody else's, so asking about them would be a round trip to be told no.

   NOTHING WAITS FOR IT. The screen has already drawn; this is bookkeeping, and a failed round trip
   leaves the message unread, which is true rather than wrong. */
```

### ---------- AND WHICH ONES THEY WERE STAYS ON THE SCREEN

in `markRead_`

```
/* ---------- AND WHICH ONES THEY WERE STAYS ON THE SCREEN -----------------------------------
       THE OUTLINE NEVER SHOWED ON THE MESSAGES COLUMN. `dmPages_` marks a thread read BEFORE it
       renders it — drawing is reading, see the note there — so by the time `messagesHtml_` asked
       `!m.read` every message already said yes, and the card's head said "2 new" over a thread
       with nothing in it marked new. `fresh` is "this was unread when you arrived": it lives on
       the object `loadMessages` will replace, so it lasts exactly until the next answer from the
       server changes something, which is the moment it stops being news. */
```

### THE EMPTY INBOX SAYS HOW TO START ONE.

top level, before `emptyMessages_`

```
/* THE EMPTY INBOX SAYS HOW TO START ONE. There is no "new message" button on this column — the
   picker for WHO is a person's own card, which is the decision recorded over `messageSheet` — so a
   person looking at an empty Messages column had been told where messages appear and not how one
   begins. One clause, naming the door that exists. */
```

### ---------- ONE THREAD PER PERSON

top level, before `msgTime_`

```
/* ---------- ONE THREAD PER PERSON ------------------------------------------------------------------
   EVERY MESSAGE WAS IN ONE LIST. A note from a tutor about Tuesday and a note from another parent
   about splitting a class sat in one column, sorted by time, with nothing but a name under each to
   say which conversation you were reading. That is a log, not a chat.

   `withId` IS THE THREAD. The server now says who the other person is on every message — see the
   messages handler in dopost.gs — so grouping is a fact from the sheet rather than a guess from a
   name string.

   MOST RECENT FIRST, because a thread nobody has written to in a month is not the one you opened
   the app for. */
```

### When a message was sent, as a number:

top level, before `msgTime_`

```
/* When a message was sent, as a number: the server's `15/09/26 18:20`, the fixture's ISO and a
   pending bubble's own clock all come through here, because sorting their STRINGS put 16 September
   below 9 September — day-first dates do not sort as text. */
```

### ---------- THREADS AS WIDGETS WERE HERE, AND THEY PUT CHAT IN TOOLS

top level, before `msgDay_`

```
/* ---------- THREADS AS WIDGETS WERE HERE, AND THEY PUT CHAT IN TOOLS ------------------------------
   `msgWidgets_()` BUILT ONE WIDGET PER CONVERSATION, `kind: 'tool'`, and `allWidgets()` concatenated
   them — so every thread was a page of the Tools column. Reported as "i dont want chat in tools.
   what the fuck", with a screenshot of two of them under the calendar.

   THE ARGUMENT WAS ALREADY WRITTEN in `map.js`, where the static messages widget was deleted from
   `WIDGETS`: a calculator and a timer are instruments you go looking for, and a message is somebody
   trying to reach you. That removal took the fixed entry out and left this one generating the same
   thing, so the decision was undone by a function nobody connected to it.

   AND THE `dm` COLUMN IS WHERE A CONVERSATION LIVES NOW — one per page, with the composer at the
   foot of each, built long after that note. `fillThread_` went with this: its only caller was the
   widget's own `start`, and `dmCards_` in posts.js fills a thread on the column that has one.

   `messageThreads_`, `messagesHtml_`, `markRead_` and `emptyMessages_` all stay. They are what the
   column is built from. */
```

### ---------- ONE RENDERER, AND IT DREW A LOG RATHER THAN A CONVERSATION

top level, before `msgDay_`

```
/* ---------- ONE RENDERER, AND IT DREW A LOG RATHER THAN A CONVERSATION ---------------------------
   ASKED FOR AS "messages should look like IG DMs". What was here was full-width rows separated by
   hairlines, with `text-align: right` standing in for "this one is mine" — which is a transcript.
   A conversation is read by SIDE before it is read by name: you know who said a thing from where it
   sits, and the name under it is a confirmation rather than the way in.

   RUNS, WHICH IS THE HALF THAT ACTUALLY MAKES IT READ AS A CHAT. Four messages in a row from one
   person is one turn, not four — so only the LAST of a run carries the tail corner and the "you ·
   time" line, and the ones above it hug at 2px. Without that, six bubbles down a card read as six
   separate exchanges and the screen is no calmer than the hairlines were.

   `mark(m.body)` IS UNCHANGED and is the reason the bubble holds a `<p>` rather than text: it is
   the app's own small-markup renderer, so a message can carry a link and a line break exactly as it
   did before.

   STILL ONE RENDERER. The widget on Tools, the thread on the Messages column and anything else that
   wants a conversation all call this — a second copy of "how to show a message" is how this screen
   came to be reading a payload key that has never existed. */
```

### ---------- A DAY, AND A TIME

top level, before `msgDay_`

```
/* ---------- A DAY, AND A TIME ------------------------------------------------------------------
   The day is said ONCE, on a line of its own, where the conversation crosses midnight — so the line
   under a bubble can be the time alone. Printing `15/09/26 18:20` under every run was the date
   repeated down the whole thread. */
```

### ---------- PICTURE, CLIP OR FILE: THE TYPE, AND THE NAME WHEN THERE IS NO TYPE

top level, before `msgKind_`

```
/* ---------- PICTURE, CLIP OR FILE: THE TYPE, AND THE NAME WHEN THERE IS NO TYPE ------------------
   A PHONE DOES NOT ALWAYS SAY. A clip picked through "Browse", or shared in from another app, can
   come with an empty `type` — and a bubble that tested the type alone drew it as a chip saying "MOV"
   rather than a clip that plays. The server types such a file by its name before it is stored
   (`msgTypeOf_` in content.gs); this is the same reading for the pending bubble, which has not been
   to the server yet, and for a row stored before that. */
```

### ---------- WHAT WAS SENT WITH IT

top level, before `msgAttachHtml_`

```
/* ---------- WHAT WAS SENT WITH IT --------------------------------------------------------------
   A picture is drawn, a clip plays in place, and anything else is a chip naming the file that opens
   it. `pic()` and `postVidSrc_` are the feed's own readers of a Drive address, so a photograph in a
   message and one on a post come through one door — and the clip carries `post-vid` so the feed's
   `error` listener turns a clip Drive will not hand over into a link rather than a black box. A
   pending bubble's addresses are `blob:` URLs, which both readers pass through untouched. */
```

### ---------- AN ADMIN'S REFUSAL CARRIES THE FIX, AND THE FIX IS AN ADDRESS

top level, before `msgFixUrls_`

```
/* ---------- AN ADMIN'S REFUSAL CARRIES THE FIX, AND THE FIX IS AN ADDRESS ------------------------
   The consent screen, or the site's own `?setup=1`. As text in a red line it is something to copy
   out by hand on a phone; as a link inside the sentence it is a 14px target. So each one becomes one
   more control beside Retry — 44px, named for where it goes — and the sentence stays the server's.
   The scope names Google's error quotes (`.../auth/drive`) are addresses too and go nowhere useful,
   so they stay words. At most two: a refusal is not a page of links. */
```

### AND THE SENTENCE WITHOUT THEM.

top level, before `msgFailSaid_`

```
/* AND THE SENTENCE WITHOUT THEM. An address that has become a control is not also printed — two
   hundred characters of consent URL broken across eight lines of a 320px bubble, above a button
   that goes to the same place. A line that was only a label for it ("Consent link: …") goes; one
   that used it in a sentence ("Open … once") says where it went instead. */
```

### ---------- THE THREAD

top level, before `messagesHtml_`

```
/* ---------- THE THREAD --------------------------------------------------------------------------
   Runs, as before: four messages in a row from one person are one turn, so only the last carries
   the tail and the time. A day line wherever the date changes, and a pending message says where it
   has got to — `sending…`, or the server's refusal with a Retry beside it. */
```

### ---------- THE COMPOSER, ONCE, WHEREVER IT IS WANTED

top level, before `msgDraft_`

```
/* ---------- THE COMPOSER, ONCE, WHEREVER IT IS WANTED --------------------------------------------
   IT EXISTED ONLY INSIDE A SHEET, reached from a person's pass — so the Messages column showed you
   conversations you could read and not answer. Every messaging app anybody has used puts the box at
   the foot of the thread, and "reply where you are reading" is most of what "look like IG DMs"
   means.

   ONE BUILDER AND ONE SENDER, because the alternative is the fault this file already records four
   times: a second copy of a thing, and the fix reaching one of them. `on('msg-send')` finds its box
   by walking up to the nearest `.msg-form` rather than by a fixed id, which is what lets three
   threads and a sheet be on screen at once — ids cannot do that, and the first version of this had
   `#msg-text` in it.

   "Message…", NOT "Message Ada Tutor…". The name wrapped the hint onto a second line at 390px and
   was clipped mid-letter at 320, in a box whose card already says who it is in its head and whose
   sheet says it in its title. The name moved to `aria-label`, where a screen reader still gets it
   and nothing has to fit.

   THE NOTE IS PART OF THE FORM. The five-minute gap and the e-mail are things somebody needs to
   know BEFORE pressing send, and they are also where a refusal is printed — so the sentence and the
   place the server answers are one element rather than two to keep in step. */
```

### ---------- WHAT IS HALF WRITTEN SURVIVES A RELOAD (docs/history/317)

top level, before `msgDraft_`

```
/* ---------- WHAT IS HALF WRITTEN SURVIVES A RELOAD (docs/history/317) -----------------------------------
   THE BOX IS A DRAFT (`draftAttr_`, data.js), per conversation and per person: kept as it is typed,
   drawn back into the composer by every redraw and every reload, and dropped only when the server
   has the message (`msgPost_`). NOT WHILE THE SAME WORDS ARE A BUBBLE ON THEIR WAY — Send empties the
   box and the redraw that follows must not put them back; after a reload there is no bubble, and a
   message that never went is in the box again rather than nowhere. */
```

### ---------- CHECK UPLOADS: THE ADMIN'S ANSWER TO "CAN A PHOTO BE SENT YET"

top level, before `UPLOADS_SAID`

```
/* ---------- CHECK UPLOADS: THE ADMIN'S ANSWER TO "CAN A PHOTO BE SENT YET" -----------------------
   ASKED FOR AS *"i cant send images, or videos in the chat to people. i think you need to add
   something to ledger for that."* Two things stood in the way — a column in the Ledger and a Drive
   scope the deployment had never asked for — and both are fixed by the owner rather than by code:
   `?setup=1`, an Allow, a new version. Nothing on the site said which of those was still undone, or
   when all of them had landed, except sending a photograph and reading the refusal.

   A TOOL, FOR AN ADMIN, ON THE TOOLS COLUMN — `admin: true` on the roster entry, the flyer maker's
   lock, asked through `widgetFor_` by every door. One tile, because the card is a THING (the
   deployment's ability to keep a file) and pressing it is the one action on it; the report is drawn
   under the tile and kept in `UPLOADS_SAID`, so a repaint of the column — the poll, a sign-in — does
   not throw away an answer that took a round trip and a test file to get.

   THE BACKEND IS ASKED, NOT GUESSED AT. `checkUploads` makes one test file in the folder, shares it
   and bins it — see `uploadsCheck_` in content.gs. A backend too old to have the action is told
   apart from one that answered, because before the first deploy that IS the answer. */
```

### THE ADDRESSES A STEP NEEDS ARE TILES UNDER THE LIST, not links in its sentence — a link in a line of 0.78rem type is a 14px target, and a tile is 44px from the

in `uploadsHtml_`

```
/* THE ADDRESSES A STEP NEEDS ARE TILES UNDER THE LIST, not links in its sentence — a link in a
     line of 0.78rem type is a 14px target, and a tile is 44px from the one renderer that guards
     where it may open. `href` is the server's (the consent screen) or this app's own address with
     `?setup=1`, which the server cannot always name: `ScriptApp.getService()` is blank from some
     deployments. `tile_` itself refuses anything that is not an absolute http(s) address. */
```

### A CARD THAT GREW IS PLACED AGAIN — "every grower in the app already calls this", in the note over `paneWatch_`.

in `uploadsPaint_`

```
/* A CARD THAT GREW IS PLACED AGAIN — "every grower in the app already calls this", in the note
     over `paneWatch_`. The answer is four rows and up to five steps under a card that was a tile
     and a sentence, and `check/ui.js` found the column's pane 2,386px off the glass at 768 the first
     time the state drew it. Instant, and only for the column in front. */
```

### NOT DEPLOYED YET IS THE FIRST ANSWER, and the commonest one on the day this ships:

top level, before `f`

```
/* NOT DEPLOYED YET IS THE FIRST ANSWER, and the commonest one on the day this ships: the payload
     lists what the live backend can do, so a backend without the action says so here rather than
     coming back "That action is not recognised". */
```

### `on('messages')` was here — a second way to see the same thread, opened in a sheet.

top level, before `claimCard_`

```
/* `on('messages')` was here — a second way to see the same thread, opened in a sheet. Messages
   are a WIDGET, reached from Tools, and that route calls `fillMessages` directly; nothing has ever
   carried `data-do="messages"`, so this copy has never opened. `messagesHtml_` above is the shared
   renderer and stays — the widget uses it. */
```

### ---------- YOUR OWN DETAILS

top level, before `claimCard_`

```
/* ---------- YOUR OWN DETAILS ---------------------------------------------------------------------
   Built from the backend's own field list, exactly as the resource editor is — `profileFields` IS
   the allow-list the server checks writes against, so a form built from it cannot offer a field
   the server will refuse or miss one it would accept.
--------------------------------------------------------------------------------------------- */
```

### ---------- ADDING A CHILD, AND ANSWERING WHEN SOMEBODY ADDS YOU

top level, before `claimCard_`

```
/* ---------- ADDING A CHILD, AND ANSWERING WHEN SOMEBODY ADDS YOU ----------------------------------
   THE BACKEND FOR THIS WAS ALREADY WRITTEN AND UNREACHABLE. `claimChild` and `answerClaim` both
   existed, both correct, and nothing in the app called either — so a parent could not ask and a
   child could not have been asked. `check-doors` names an unreachable handler the moment a door
   appears for it; there had never been a door, so there was nothing to name.

   TWO NAMES, NOT ONE. The backend matches on first AND last name and refuses when it finds none or
   more than one — asking for a single field would send it a string it cannot split reliably, and
   "Mary Anne Smith" is where that goes wrong. */
```

### ---------- THE ANSWER HALF HAD NO DOOR EITHER, UNTIL THE ACCOUNT COLUMN DREW IT

top level, before `claimCard_`

```
/* ---------- THE ANSWER HALF HAD NO DOOR EITHER, UNTIL THE ACCOUNT COLUMN DREW IT -----------------
   THIS CARD WAS ONLY EVER BUILT BY `meRest_`, AND NOTHING CALLS `meRest_` ANY MORE — the old You
   column it fed is gone (see `mePages`). So a parent pressed `Ask them`, was told "they will see it
   when they next sign in", and the child never saw it: the request sat at `asked` for ever, no link
   was ever accepted, and the family cards the account column now draws could only ever come from a
   row typed into the sheet by hand. `check-doors` could not say so — `claim-yes` is a string in the
   markup, so it reads as a door whether or not anything draws it.

   ONE RENDERER, CALLED BY `accountPages_` straight after your own card, which is where a decision
   about who your parent is belongs. In place, no sheet, two buttons because it is a question with
   two answers. */
```

### ---------- LINKING A CHILD WHO HAS AN ACCOUNT: THE LAST SECTION OF "MANAGE YOUR CHILD"

top level, before `kidAddSec_`

```
/* ---------- LINKING A CHILD WHO HAS AN ACCOUNT: THE LAST SECTION OF "MANAGE YOUR CHILD" -----------------
   It was a card of its own on the Settings column, "Add your child" — before that a sheet opened by a
   tile — and it is one section of the one card now (`childManageCard_`, below; docs/history/339). THE
   HEADING KEEPS ITS WORDS (a heading, not a caption, since the review of 339), because the server says
   them: `makeChild`'s refusal for a child who already has an account tells the parent to *use "Add your
   child"* (dopost.gs), and a sentence pointing at words nobody can find on the screen is the `MESSAGING`
   fault from the other side. NO IDS ON THE BOXES:
   the handler reads the section the button is in, which is what `me-save` does, so a second copy of this
   card anywhere can never be the one it reads. The foot line it had ("nothing changes until they
   accept…") said the sub-line's second sentence again, and went into it. */
```

### ---------- `send` TAKES ONE ARGUMENT AND THIS ONCE PASSED TWO, so nothing was ever asked

top level, before `action`

```
/* ---------- `send` TAKES ONE ARGUMENT AND THIS ONCE PASSED TWO, so nothing was ever asked -----
     THE SAME FAULT AS THE STAR AND AS `toggleSpot` BEFORE IT: the body on the wire was the string
     spread into indexed keys, the backend refused an action it could not read, and the sheet stayed
     open with no toast. Measured, not read, at the time.

     `send_` NOW RATHER THAN `send`, because the boxes are on a card rather than in a sheet: it
     locks them and the button while the request is in flight and says a refusal as a toast — the
     rule `send_`'s own note gives about backspacing a PIN that is already on the wire. */
```

### ---------- MAKING YOUR CHILD'S ACCOUNT, FROM YOURS

top level, before `KID_MADE`

```
/* ---------- MAKING YOUR CHILD'S ACCOUNT, FROM YOURS ------------------------------------------------
   ASKED FOR AS *"so all kids can login easily with their handle and pin."* "Add your child" only ever
   LINKED an account that already existed, and a child with no email had no way to have one — so the
   card below it asked a parent to type the name of an account nobody could make. This makes it:
   first name, last name, and a PIN the parent chooses (the same 4 to 8 digits as everywhere, checked
   here for `REG_PIN`'s reason). `makeChild` in dopost.gs writes the row with no email, a handle of
   its own drawing, and the family link already accepted.

   THE ANSWER IS A SLIP: the handle and the PIN, once, on paper — the thing a parent writes on the
   fridge or photographs. Held as STATE (`KID_MADE`, keyed by the parent's id) and drawn from it, for
   `HANDLE_SAID`'s reason: the payload lands a moment later and repaints this column, and a mark put
   on the element would be gone before anybody had read it. A reload forgets it, which is right for a
   PIN on a screen. */
```

### THE MAKE FORM, the middle section of "Manage your child" (`childManageCard_`, below).

top level, before `kidMakeSec_`

```
/* THE MAKE FORM, the middle section of "Manage your child" (`childManageCard_`, below). It was a card of
   its own, "Make your child's account"; its heading keeps those words because the parent's confirmation
   email names them (`register` in dopost.gs: *Settings → "Make your child's account"*). A HEADING AND NOT
   A CAPTION (the review of docs/history/339): it was `.prof-cap`, the card's faint 8px label voice, which made
   the words an email sends a parent to look for the smallest text on the card — 5.8px at 320 while the card
   was still drawn smaller. Its foot line
   pointed at "the next card"; the add section is straight under it now and says the same in its own
   first words, so the line is the slip's alone. */
```

### ---------- AN ADDRESS NOBODY HAS PROVED: THE MAIL IT IS NOT SENT, AND THE CHILD IT CANNOT HOLD YET

top level, before `pendingAddr_`

```
/* ---------- AN ADDRESS NOBODY HAS PROVED: THE MAIL IT IS NOT SENT, AND THE CHILD IT CANNOT HOLD YET ----
   SIGNING IN NEVER WAITS ON THE LINK (the owner, 6 Oct: *"dont make them have to need to verify their
   email to login"*), and the PR #130 review found what that had cost: a PIN on a self-made row proves
   who registered, not who owns the address. So the backend holds two things back from a PENDING
   address — every mail but the link and a forgotten PIN (`notify`), and every door that puts a child
   on the account (`confirmFirst_`) — and this file says so where the person would otherwise wait:
   a line under their own card on the You column ("we will email you once you open the link"), and the
   make-child card on Settings drawn as that one sentence instead of a form the server would refuse.
   Both carry "Send the link again", because the person this is for is most often the one whose link
   went to spam — the owner's own reason for dropping the gate.

   THE SERVER SAYS WHICH (`pendingEmail` on the sign-in reply and on `myProfile`, see `loginReplyFor_`)
   and the phone decides nothing: a stale phone draws the form, and the server turns it down with the
   same sentence, which is a toast and never a child on a typo's account. */
```

### ---------- A NEW ADDRESS WAITING TO BE PROVED, ON THE CARD IT WAS TYPED ON

top level, before `movingNote_`

```
/* ---------- A NEW ADDRESS WAITING TO BE PROVED, ON THE CARD IT WAS TYPED ON -----------------------------
   A confirmed account's new address is not written until the account, signed in, opens the link sent to
   it (`authMove*_` in booking.gs — a typo's owner holds the inbox and never the account). So the box shows
   the address that is waiting, and this paragraph says the two facts a person needs: it is not done, and
   which address still signs in. Under the row, as the house rule has it, beside "Send the link again" in
   the row — the person this is for is the one whose link went to spam. Both addresses in it: when the new
   one is a typo, seeing it written out is how it is caught. */
```

### WHERE THE TWO FORMS WOULD BE, for a parent whose address is still PENDING.

top level, before `kidHeldSec_`

```
/* WHERE THE TWO FORMS WOULD BE, for a parent whose address is still PENDING. Its own class and not
   `kid-make`: there is nothing to make in it, and what finds `.kid-make` is looking for the form. IN PLACE
   OF BOTH FORMS — the add form would be refused for the same reason, and two sections saying one sentence
   is one too many. It was a card of its own drawn instead of the two child cards, ONE PAGE WHERE THERE
   WERE TWO, which moved every page after it on the link being opened; inside "Manage your child" it is one
   page either way (docs/history/339). The heading is the make form's, for the confirmation email's words. */
```

### ---------- MANAGE YOUR CHILD: ONE CARD (docs/history/339)

top level, before `kidsLinked_`

```
/* ---------- MANAGE YOUR CHILD: ONE CARD (docs/history/339) ------------------------------------------------
   THE OWNER, 11 Oct: *"chagne the add/make you child widget into one widget which is manage you child."*
   They were two Settings pages, "Make your child's account" and "Add your child" (one held card while the
   parent's own address waited), for the same people (`mayAddChild_`). One card now, on the same column, in
   three sections:
     · THE CHILDREN ALREADY LINKED TO YOU, a line each — face, first name, handle — because a card called
       "Manage your child" that does not say who your children are is a pair of forms with a new title.
       From `DATA.family`, the accepted links `doGet` builds for this token and nothing else, held to the
       same `familyFor` stamp the You column's family cards are (`accountPages_`), so a list left over from
       the last person on this phone is never drawn as yours.
     · MAKING AN ACCOUNT, then LINKING ONE THAT EXISTS — the two forms, unchanged, in the order the two
       cards were in: most children here have no account of their own.
   WHAT MANAGING A CHILD ALREADY IS, AND NOTHING MORE: "New PIN" (`kid-pin` → `resetPin`), the one power a
   parent holds over a linked child's account, beside their name, the place a parent who came to manage them
   looks. Nothing new on the server. AND HERE ONLY (the review of docs/history/339): it was on the child's own
   card on the You column as well, and at 1280 the two were side by side — two widgets doing one job, against
   the owner's *"one widget which is manage you child"* — and they disagreed, because this one knew the
   address rule below and that one did not, so a pending parent pressed it there and was refused. The child's
   card on the You column is the child; managing them is this card.
   While the parent's address is unproved the forms are one sentence (`kidHeldSec_`) and the children are
   listed without New PIN, because `resetPin` refuses a pending parent (`confirmFirst_`) and a tile the
   server will refuse is a door painted on a wall. */
```

### A REFUSAL THAT SAYS THE ADDRESS IS WAITING corrects the phone:

top level, before `heldBy_`

```
/* A REFUSAL THAT SAYS THE ADDRESS IS WAITING corrects the phone: a phone holding an old sign-in reply
   drew the form, and the server's answer is the newer fact. Stored, and the column redrawn, so the
   card the person is looking at turns into the one that says why. */
```

### ---------- A NEW PIN FOR YOUR CHILD, OR FOR ANYBODY IF YOU ARE AN ADMIN

top level, before `id`

```
/* ---------- A NEW PIN FOR YOUR CHILD, OR FOR ANYBODY IF YOU ARE AN ADMIN ----------------------------
   THE TILE IS BESIDE THE CHILD — on "Manage your child" for a parent (`kidListSec_`; it left the child's card
   on the You column in the review of docs/history/339, one place for one job), on the admin's everyone
   column for an admin — because the PIN is about that person (a THING has tiles). PRESSING IT ASKS FIRST, in a sheet with its own
   button (a FORM has buttons): the child's old PIN stops working and every phone they are signed in on
   is signed out, which is not a thing a thumb scrolling past should do. The answer is the same slip as
   above, in the same sheet, once. `resetPin` decides who may; this draws the tile for the two people
   the server will say yes to and nobody else. */
```

### THE THIRD OF THE THREE.

in `answerClaim_`

```
/* THE THIRD OF THE THREE. Same shape, same silence — see `add-child-go` above. A parent pressed
     yes on their own child's request and nothing happened, on the one screen where "nothing
     happened" is indistinguishable from "it worked and the list has not refreshed yet". */
```

### GONE FROM THE SCREEN NOW, not in fifteen seconds.

in `answerClaim_`

```
/* GONE FROM THE SCREEN NOW, not in fifteen seconds. The card is a request that has just been
       answered; leaving it up until the payload lands invites the second tap the server would
       refuse as "already answered". The family card it turns into arrives with the payload. */
```

### YOUR SETTINGS, AS A COLUMN.

top level, before `HANDLE_SAID`

```
/* ==================================================================================================
   YOUR SETTINGS, AS A COLUMN.

   ASKED FOR AS "account setting should appear in a new column by itself. For now make that new
   column at the end." What was there was one sheet — `openSheet('Your details', …)` — holding the
   profile form, the username and the PIN, opened by a tile on your own account card.

   MOVED, NOT COPIED, AND THE IDS ARE WHY. `pin-now`, `pin-new`, `pin-again` and `pin-said` are
   looked up with `$()` (the handle's line and the status lines are classes, found from the card).
   Drawing them on a column AND leaving them in a sheet would put two elements under one id on the
   page at once, and `$()` hands
   every Save button the first of them — the `$('msg-text')` bug this repository already records,
   where a reply typed into the second thread posted to the first. So the sheet is gone and the tile
   is a door to the column.

   `settings` IS A SCREEN ID AND `js/settings.js` IS ABOUT THE SHEET EXPORTS. Two different things
   wearing one word, which this repository has paid for before (`kind` colliding with two columns,
   `resource_type` after the rename) — so it is named here rather than discovered. Nothing in
   `js/settings.js` reads a screen and nothing here reads `data/settings/*.json`; the collision is
   in the prose only, and this paragraph is the whole of the fix.

   ONE THING PER PAGE, BECAUSE `.pane` IS `overflow: hidden`. The sheet scrolls and a pane does not:
   `#sheet-body` could hold the profile fields, a week of seventy-seven tickboxes, a username and
   three PIN boxes in one scroller, and a column cannot. So each group the backend sends is a page,
   then the username, then the PIN. Which is also what every other column in this app is — one thing
   you are looking at, and the next one a swipe away.

   AND EACH PAGE SAVES ITSELF, WHICH THE BACKEND ALREADY ALLOWS. `updateProfile` writes only the
   fields it is given (`wanted.forEach(f => setCell(…))`), so a partial post cannot blank what it
   did not name. The ONE exception is the timetable: `availGridIn(fields)` rebuilds the whole
   `availability` cell from whatever hour codes arrive, so a half-sent week would erase the other
   half. That is exactly why the grid is one page and not split — `isTimetable_` keeps a group
   whole, and a group is a page.

   SIGN OUT STAYS ON YOUR ACCOUNT CARD. It is not a setting, it is the one action that must be
   reachable without knowing where anything is, and it is already one swipe from everywhere at the
   foot of your own card in `accountPages_`. Drawing it here as well would be two doors to one
   action, which is the duplication this app's own tab table spends four paragraphs regretting. */
```

### WHAT THE LINE UNDER YOUR HANDLE SAYS AFTER A RANDOMISE — "You were @…" — kept as STATE and drawn from it, never left on the element.

top level, before `HANDLE_SAID`

```
/* WHAT THE LINE UNDER YOUR HANDLE SAYS AFTER A RANDOMISE — "You were @…" — kept as STATE and drawn
   from it, never left on the element. The first version wrote it into the line and then called
   `load()`, and the inbox and your own profile land a moment after the payload and each repaint this
   column: the line was back to its standing sentence before anybody had read it. The `REEL_HELD`
   rule, one card along — a mark put on the element by a press is a mark a repaint throws away while
   the state keeps it. For this session; a reload starts it again. KEYED BY THE PERSON, because a
   phone passed to somebody else who signs in on it must not tell them who THEY used to be. */
```

### ---------- WHICH FIELDS ARE YOURS TO EDIT: THE SAME CHOICE THE SHEET MADE, IN ONE PLACE

top level, before `GROUPS_OLD_`

```
/* ---------- WHICH FIELDS ARE YOURS TO EDIT: THE SAME CHOICE THE SHEET MADE, IN ONE PLACE ------------------
   The backend says which fields a role may edit — a parent's map, a student's, a tutor's — and an admin
   too old a deployment to have been told still gets a few. LIFTED OUT OF `settingsPages_` (docs/history/339)
   because three things ask it now and must not answer differently: the Settings pages, your own card's
   Edit (`ownCardSections_`) and the library cards on Tools (`initLibCards_`). Three copies of "which map
   is mine" would be the `MESSAGING` fault inside one file. */
```

### ---------- AND THE LIBRARY CARDS, WHICH ARE A TOOL NOW

top level, before `notLibrary_`

```
/* ---------- AND THE LIBRARY CARDS, WHICH ARE A TOOL NOW ---------------------------------------------------
   The owner, 11 Oct: *"move library card widget to the tools column."* The cards are a group in every
   role's map (`'Library cards': LIBRARY_FIELDS` in constants.gs), and that group is the write allow-list as
   well as the layout, so it stays on the server exactly as it is: the phone draws it on Tools
   (`initLibCards_`) and takes it off Settings here. A retired field goes with it, so an older server's
   `library_note` cannot leave a Library cards page holding nothing but a box nobody draws. Asked of the
   NAMES (`isLibraryCard_`), never of the group's title. Pure, so `check-profile.js` runs it over the real
   groups. */
```

### THE COLUMN IS NAMED OFF `TABS` RATHER THAN WRITTEN OUT.

in `settingsPages_`

```
/* THE COLUMN IS NAMED OFF `TABS` RATHER THAN WRITTEN OUT. `applyColumns_` takes every label
       from `data/settings/columns.json`, so "You" is a cell somebody can edit — and a sentence here
       spelling it out is a second place for that word to be wrong the afternoon it changes. */
```

### ---------- WHAT IS ABOUT YOUR CARD IS EDITED ON YOUR CARD, SO THOSE BOXES ARE NOT DRAWN HERE

in `settingsPages_`

```
/* ---------- WHAT IS ABOUT YOUR CARD IS EDITED ON YOUR CARD, SO THOSE BOXES ARE NOT DRAWN HERE -------
     The owner, 10 Oct, for a tutor: *"all of this stuff should be editable directly on the tutors card
     for that respective tutor. this centralises things so less widgets are required."* — and on 11 Oct,
     for everybody: *"the random name generator should be one of the editable things in the profile
     settings of the profile card. your figure should also be in your profile card editing."* So
     EVERYBODY signed in edits their own card in place now (`cardMayEdit_`), and every field that form
     holds (`ownCardFields_`: your picture and your name for everybody; for a tutor with a public card the
     rate, the headline, the photographs, the words, the facts, the qualifications, the venues and the
     week as well) is taken off these pages — a box in two places is two places to keep in step, and the
     second is the one that goes stale. A group left empty goes whole: a parent's About you held only the
     picture and the name, so it is gone; a student's keeps the date of birth and the two exams. Asked of
     the FIELDS, not the titles — the titles are the backend's to choose. NOTHING CHANGES ON THE SERVER:
     the groups are the write allow-list as well as the layout (`PROFILE_EDITABLE`), so they stay exactly
     as they are and the phone stops drawing them here.
     AND THE LIBRARY CARDS ARE A TOOL NOW (`notLibrary_`; the `libcards` widget in map.js) — *"move library
     card widget to the tools column."* — so their fields leave these pages too, for everybody. */
```

### ONE GROUP AT A TIME, THROUGH THE SAME WALK.

in `settingsPages_`

```
/* ONE GROUP AT A TIME, THROUGH THE SAME WALK. `fieldsHtml` is handed `{ [g]: groups[g] }` rather
     than reimplemented per page — it is the one place that knows a group of hour codes is a week
     grid and everything else is a column of boxes, and a second walk here would be a second answer
     to that question. Its own note says so: "one walk now, so a group of hour codes becomes a
     timetable everywhere rather than only where somebody remembered." */
```

### THE QUALIFICATIONS CARD HAS NO SAVE OF ITS OWN:

in `pages`

```
/* THE QUALIFICATIONS CARD HAS NO SAVE OF ITS OWN: every answer on it is saved the moment it
            is chosen, through the same `meSave_` — see `qualShelf_`. A Save at the foot of the card
            would be a second way to keep a change already kept, and the one somebody would wait to
            press. Only a card that is nothing but the shelf. */
```

### ---------- MANAGE YOUR CHILD, ONE CARD (docs/history/339)

in `settingsPages_`

```
/* ---------- MANAGE YOUR CHILD, ONE CARD (docs/history/339) ------------------------------------------
     *"remove add your child tile as that should go on column to the right."* It was a tile on your own
     account card that opened a sheet; then two cards here, "Make your child's account" and "Add your
     child" (one held card instead while the parent's own address waited); and on 11 Oct, *"chagne the
     add/make you child widget into one widget which is manage you child."* — so one card, the children
     already linked to you on it, both forms under them, and the held sentence in place of the forms while
     the address waits. For the same people the tile was for: a parent, a client or an admin; a student
     has nobody to add. ONE PAGE IN EVERY STATE, which is the other thing it bought: the held card was one
     page where the forms were two, so opening the link moved every page after it by one. */
```

### ---------- SIGNING IN IS YOUR PIN, AND THE ADMIN'S BUILD STAMPS

in `settingsPages_`

```
/* ---------- SIGNING IN IS YOUR PIN, AND THE ADMIN'S BUILD STAMPS ------------------------------------
     It was your handle and your PIN, one card. The handle — shown, with Randomise and the line saying
     what the last press made — is a section of your own card's Edit now (docs/history/339; *"the random
     name generator should be one of the editable things in the profile settings of the profile card"*),
     because it is printed on the card, under your name, and a THING on your card is edited on your card.
     THE PIN STAYS HERE: a secret is not a thing printed on a card, it is a form with its own button and
     its own rules (the old PIN, typed twice), and every new handle asking for a PIN is what folding the
     two into one Save would have meant. NOT ONE RULE IS REPEATED HERE: the button posts, and whatever
     comes back is what the line underneath says (`MESSAGING`). The three PIN boxes sit on one line,
     captioned by what they are in order. */
```

### THE BUILD STAMPS, FOR AN ADMIN, UNDER THE ONE CARD ONLY THEY SEE THEM ON.

in `settingsPages_`

```
/* THE BUILD STAMPS, FOR AN ADMIN, UNDER THE ONE CARD ONLY THEY SEE THEM ON. They were a `Build`
          tile on your own account card, removed on request; the stamps are still the only thing on
          a home-screen app with no address bar that says which build is running, so they moved
          rather than went — small, at the foot of the card that is about your own sign-in. */
```

### ---------- THE WARDROBE WAS HERE, AT THE END, AND IS A SECTION OF YOUR OWN CARD'S EDIT NOW

in `settingsPages_`

```
/* ---------- THE WARDROBE WAS HERE, AT THE END, AND IS A SECTION OF YOUR OWN CARD'S EDIT NOW -----------
     The owner, 11 Oct: *"your figure should also be in your profile card editing."* — see `wardrobeBody_`.
     Taking its page out moves every page that was behind it by one, which is what the rule below is about.

     EVERY CARD FROM HERE ON IS APPENDED RATHER THAN INSERTED, because `PAGE.settings` remembers where
     somebody was for the length of a visit: a card put in front moves every index behind it, and a person
     on Notifications is turned to whatever slid into its place. What moves an index here is a change of
     the pages within a visit — signing in, a role saved, `myProfile` landing, the payload landing with a
     card on it — and `paintPager` clamps the index to the pages there are, so a person who was on a page
     that went comes back to a real page (the last), never to nothing. This change took three pages out
     (the wardrobe, one of the two child cards, and a parent's About you), so it moves indexes once, on
     the visit the new build arrives in. AND THE ADMIN'S "YOUR CUT OF AN EXTRA CHILD", which sat after the
     agreement, went the same way (docs/history/345): the cut is on each tutor's card now, beside their rate,
     and its default is the config tab's `B` — an admin's later pages move up by one, once. */
```

### `tutorHeld_`, NOT `isTutorRole`:

in `settingsPages_`

```
/* `tutorHeld_`, NOT `isTutorRole`: somebody whose Tutor tick is waiting for the admin is exactly
     who should be reading and signing this — before the yes, not after it. The server's own test in
     `signAgreement` is `hasRole(me, 'tutor')`, which a pending tutor passes. */
```

### ---------- YOUR JOURNEY AND THE WEEKLY PARENT EMAIL WERE HERE, AND NEITHER IS A SETTING

in `settingsPages_`

```
/* ---------- YOUR JOURNEY AND THE WEEKLY PARENT EMAIL WERE HERE, AND NEITHER IS A SETTING ----------------
     The owner, 12 Oct, with a screenshot of an admin's Settings ending on the two of them: *"This should
     be moved to appropriate column. Also the other widget regarding seeing weekly kids work or whatever
     sounds dumb delete that widget."* So "Your journey" — a student's progress, and nothing on it a setting —
     is the Progress column's card now (`journeyCard_` in js/arcade.js, beside the column that draws it),
     and the admin's "Weekly parent email: Off" card is gone with its Preview and its file, js/digest.js.
     THE SUNDAY EMAIL ITSELF STAYS ON THE SERVER (backend/digest.gs) — the owner asked for that
     infrastructure and called only the card dumb, and switched the email on the same day (note 348).
     docs/history/346. AND THE ADMIN'S "Your cut of an extra child" CARD WENT THE SAME DAY: the cut is
     per tutor now, set on that tutor's own card beside the rate (`cardRateHtml_`, note 345).
     THREE PAGES OUT FROM IN FRONT OF NOTIFICATIONS, for an admin (one for a student), so the one index
     behind them moves, once, with the build — and a new build arrives by a reload, which `PAGE` does not
     survive (only the column is remembered, `familyTab`). And whoever is on a page past the end of a
     column that got shorter comes back on its last page, Notifications, never on nothing (`paintPager`'s
     clamp, asked by check-flow's business journey with `PAGE.settings` at 999).
     THE BUSINESS'S OWN PAPERWORK WAS HERE TOO — five cards for an admin, between those two — and is a
     column of its own now, the last one (`screen('biz')` in js/records.js; *"the business checklist stuff
     should go in their own column at the end"*, 10 Oct). */
```

### ---------- YOUR ROLES: TUTOR, CLIENT, STUDENT — TICK EVERY ONE THAT IS YOU

top level, before `ROLE_PICKS`

```
/* ---------- YOUR ROLES: TUTOR, CLIENT, STUDENT — TICK EVERY ONE THAT IS YOU ------------------------
   ASKED FOR AS *"each account should have a widget in account settings which say what the roles
   are. they can be either a tutor or client or student. they can be tutor and client and student
   like multiselect."*

   THREE `.check` TICKS, the app's own several-of-a-few control — the box the tutor agreement and
   every yes/no field on this column already draw — and not the several-of-a-list field that opens
   under its summary, which is for a list too long to show shut. Three answers fit on the card and should be SEEN, because the card's whole
   job is to say what you are. Each says in a few words what it means here, since "client" is this
   business's word for the parent who pays, and nobody outside it would guess that.

   A SAVE TILE, NOT A SAVE ON EVERY TICK. Ticking Tutor is the one change here that asks somebody
   else for something, and a tap that posts on the way past is a request sent by a thumb that was
   only scrolling. One press, one answer, like every other card on this column.

   ADMIN IS NOT A TICK. It is given, so it is SAID — one line, for an admin only — and the server
   carries it through whatever the three boxes say (`setMyRoles`). WHAT THE SERVER REFUSES IS NOT
   REPEATED HERE beyond "at least one", which the card can know without asking: the live-session
   rule and the child's-account rule come back as the server's own sentence on the line under the
   tile — the `MESSAGING` argument, that a rule written twice is two rules to keep in step. */
```

### A REFUSAL PUTS THE TICKS BACK TO WHAT YOU HOLD.

top level, before `held`

```
/* A REFUSAL PUTS THE TICKS BACK TO WHAT YOU HOLD. The walk after the parent sign-up found a
       student's Client box still ticked in gold under the server's *"Nothing was changed"* — a box
       that says yes over a line that says no, and the box is what the eye reads. The sentence stays
       (`send_` wrote it); only the ticks move, so the card shows what the server has, which is the
       card's whole job. NOT ON A LOST REPLY: the server never answered, nothing was decided, and the
       ticks are still the request somebody is about to send again. */
```

### ---------- NOTIFICATIONS: WHAT @family. EMAILS YOU, AND WHAT YOU CAN TURN OFF

top level, before `NOTIFY_OLD_SAY_`

```
/* ---------- NOTIFICATIONS: WHAT @family. EMAILS YOU, AND WHAT YOU CAN TURN OFF ---------------------------
   ASKED FOR AS *"Also let parents select their communication preferences like notification. And kids and
   tutors too I guess"* (the owner, 9 Oct). The site sends email and nothing else, so this is one card of
   the kinds of email that reach YOU — a parent, a learner, a tutor, an admin, or several — each a tick,
   and under them what is always sent and cannot be turned off.

   THE PHONE KEEPS NO LIST. Which kinds reach whom, what each is called and what each is set to come from
   the server on the profile (`notifyOf_` in people.gs, out of `NOTIFY_KINDS` in constants.gs) — the same
   table every sender asks before it sends — so the card cannot offer a tick for an email the server never
   sends you, or miss one it does.

   `.check` TICKS, the app's only checkbox, with the two-line label the roles card uses (`role-pick-say`):
   a tick is a control inside a form, and a card of yes/no answers is the roles card's shape. SAVED ON
   EACH TICK, like the agreement's box and unlike the roles card: nothing here asks anybody else for
   anything, so there is no request a passing thumb could send by accident — and a Save tile under six
   ticks would be the one press everybody forgets. ONLY THE BOX BEING SAVED is locked while it saves
   (`send_` with `lock` on its own row): each tick is one cell, so a parent unticking three emails in a row
   is three saves, not one save and two taps that did nothing (review, 9 Oct — the whole card was locked,
   and a locked `.check` looked exactly like a live one).

   WHAT IS ALWAYS SENT IS WORDS, NOT GREYED BOXES. The Signing-in card's argument: an input that cannot be
   typed into reads as broken. A greyed tick reads as "switched off by somebody", which is the opposite.

   AND THE STATES BETWEEN, each one sentence rather than ticks that would be refused: a backend older than
   this site (`setNotify` not in `DATA.features` — everything is still sent), the choices not yet in (the profile is from a phone
   signed in before the server sent them; `myProfile` brings them on this open), an account with no email
   of its own — most children, whose mail goes to their grown-ups — and an address nobody has proved yet,
   which is sent nothing but its link (`addressPending_`). NOT added to `profileShapeOk_`: an old backend
   never sends `notify`, and that test would ask it for the profile on every save, for ever. */
```

### WHAT A BACKEND OLDER THAN THIS SITE MEANS FOR THE PERSON READING IT:

top level, before `NOTIFY_OLD_SAY_`

```
/* WHAT A BACKEND OLDER THAN THIS SITE MEANS FOR THE PERSON READING IT: nothing is held, everything still
   goes. The instruction is the admin's alone — a parent cannot sync anything — and it does not say "Apps
   Script": `\bapps?\b` is one of the words `check-flow`'s install journey reads as an offer to install, and a
   parent's screen must never seem to make one. */
```

### WHAT THE LINE UNDER THE TICKS SAYS AFTER ONE IS SAVED, kept as state for `HANDLE_SAID`'s reason:

top level, before `NOTIFY_SAID`

```
/* WHAT THE LINE UNDER THE TICKS SAYS AFTER ONE IS SAVED, kept as state for `HANDLE_SAID`'s reason: the
   payload landing repaints this column, and a sentence written only on the element would be gone before
   it was read. Keyed by the person, so the next person on this phone is not told about somebody else's. */
```

### A LIST WITH NOTHING IN IT.

in `notifyCard_`

```
/* A LIST WITH NOTHING IN IT. The server sends every role at least `access` and `security`, so this is a
     backend that sent `kinds: []` — the one that read a `parent` cell raw (`notifyHow_` in people.gs) did.
     One sentence rather than "To x@… · saved as you tick." over no ticks at all. */
```

### ---------- SHORT, BECAUSE IT HAS TO FIT A 320 PHONE WITHOUT SCROLLING

in `notifyCard_`

```
/* ---------- SHORT, BECAUSE IT HAS TO FIT A 320 PHONE WITHOUT SCROLLING ---------------------------
       The owner: *"I don't like scrolling. If you need to leave things more compact or smaller font."* The
       first drawing — a sentence of instructions, each always-sent kind as a two-line item, a standing line
       at the foot — was 800px at 390 and scrolled at 320 even shrunk to the floor (`paneReach_`). So the
       address and "saved as you tick" are one line; what is always sent is ONE RUN of its labels, each label
       saying the whole of it (`NOTIFY_KINDS` in constants.gs), its note a hover for a pointer; and the line at
       the foot is empty until a tick has something to say. The ticks keep their 44px rows. */
```

### ---------- THIS BOX'S ROW IS LOCKED, NOT THE CARD

top level, before `action`

```
/* ---------- THIS BOX'S ROW IS LOCKED, NOT THE CARD ---------------------------------------------------
     It locked the card, and a second tick while the first was saving (about two seconds of Apps Script)
     landed on a disabled box that looked live: no request, the box stayed as it was, and "Saved" for the
     first (review, 9 Oct, walked in Chromium). One tick is one cell, so the saves cannot step on each
     other's writes — the row is locked so the same box is not sent twice at once. */
```

### THIS KIND'S ANSWER, MERGED INTO THE LIST WE HOLD — not the reply's whole list.

top level, before `on`

```
/* THIS KIND'S ANSWER, MERGED INTO THE LIST WE HOLD — not the reply's whole list. Two saves in flight
         can answer in either order, and the earlier one's list still has the later tick as it was: kept
         whole, the next repaint would put back a tick the server has already taken away. The reply's list
         is taken whole only when there is none to merge into. An older reply with no list keeps ours. */
```

### ---------- A FAILURE PUTS THE TICK BACK TO WHAT THE SERVER HAS — REFUSED OR LOST

top level, before `live`

```
/* ---------- A FAILURE PUTS THE TICK BACK TO WHAT THE SERVER HAS — REFUSED OR LOST ------------------
       Unlike the roles card, which leaves the ticks on a lost reply because its Save tile is how somebody
       sends them again. Here the tick IS the request and there is no tile: a box left showing a choice the
       server never heard reads as saved, and every sender goes on reading the other answer. So the box
       goes back to the last thing the server said, and `send_` has already written why on the line under
       it — tick it again to try again. */
```

### ---------- YOUR JOURNEY WAS HERE, AND IS THE PROGRESS COLUMN'S CARD NOW

top level, before `AGREEMENT_VERSION`

```
/* ---------- YOUR JOURNEY WAS HERE, AND IS THE PROGRESS COLUMN'S CARD NOW -----------------------------
   `mayJourney_` and `journeyCard_` are in js/arcade.js, beside `progressCards_`, the list the Progress
   column draws: *"This should be moved to appropriate column"* (the owner, 12 Oct). docs/history/346. */
```

### ---------- THE TUTOR AGREEMENT (DRAFT), AND A TICK THAT CANNOT BE TAKEN BACK

top level, before `AGREEMENT_VERSION`

```
/* ---------- THE TUTOR AGREEMENT (DRAFT), AND A TICK THAT CANNOT BE TAKEN BACK ----------------------
   ASKED FOR AS *"a draft widget for tutors, just do a draft small contract with tick to agree. cant
   untick after ticked."* Plain English, short enough to read on the card rather than in a sheet —
   no pop-ups, which the owner has said twice — and headed DRAFT in words, because it has not been
   read by anybody who writes contracts for a living and must not look as though it has.

   `AGREEMENT_VERSION` IS POSTED WITH THE TICK, so the sheet says WHICH text somebody agreed to. A
   revised agreement is a new version string; the old signature stays on the row and says so.

   THE LOCK IS THE SERVER'S. `signAgreement` refuses a row that already carries a date, and there is
   no untick action at all. The disabled box here is the half somebody sees; drawn from
   `USER.agreementSignedAt`, which `loginReplyFor_` sends, so it is locked on every phone the person
   signs in on rather than only the one they ticked it on. */
```

### A click on an unticked box has already ticked it by the time this runs.

top level, before `el.disabled`

```
/* A click on an unticked box has already ticked it by the time this runs. It is locked for the
     length of the request so a second tap cannot post twice, and put back only if the server
     refused — a refusal is reported as a refusal, which is `send`'s whole job. */
```

### `on('edit-me')` WAS HERE — `go('settings')`, the door from a `Your settings` tile on your own account card.

top level, before `availGrid_`

```
/* `on('edit-me')` WAS HERE — `go('settings')`, the door from a `Your settings` tile on your own
   account card. *"remove edit tile as they can already edit their profile on the column to the
   right"*: the column is one swipe from that card, so the tile was a second route to it. */
```

### THE HOURS SOMEBODY IS FREE, as a week you tick.

top level, before `availGrid_`

```
/**
 * THE HOURS SOMEBODY IS FREE, as a week you tick.
 *
 * The same grid the booker uses — because it is the same question, asked of a tutor instead of a
 * client, and answering it in two different shapes would be two things to learn.
 *
 * Each box carries its own hidden checkbox, so `me-save` gathers it exactly like every other field
 * and nothing about saving had to change. The box is the label; the checkbox is what the form
 * reads.
 */
```

### ---------- AND IT IS `weekGrid_`, BECAUSE THE COMMENT ABOVE STOPPED BEING TRUE

top level, before `availGrid_`

```
/* ---------- AND IT IS `weekGrid_`, BECAUSE THE COMMENT ABOVE STOPPED BEING TRUE -------------------
   THE PARAGRAPH ABOVE FORBIDS EXACTLY WHAT HAPPENED. The booking grid gained one row of hour
   numbers along the top and a run of ticked hours that joins into a bar; this one went on printing
   seventy-seven numbers with a gutter between every tick, because it was a second piece of markup
   wearing the same class names. Two shapes for one question, which is the thing the note says must
   not happen — and a note cannot stop it. One builder can.

   THE CELL IS ALL THAT IS DIFFERENT and it stays here, where it belongs: a label wrapping a hidden
   checkbox, because `me-save` gathers `[data-me]` and nothing about saving had to change.

   THE COLUMNS LINE UP BY CONSTRUCTION. `availGridOut` in `core.gs` walks `AVAIL_DAYS ×
   AVAIL_HOURS`, so every day carries the same hours — the same guarantee `slotGrid()` gives the
   booker, and the reason one header can name the columns for all seven rows. A day the backend
   sends nothing for is dropped rather than drawn empty. */
```

### ---------- `.me-week`, BECAUSE THIS WEEK IS READ AT LEISURE AND THE BOOKING ONE IS NOT

in `availGrid_`

```
/* ---------- `.me-week`, BECAUSE THIS WEEK IS READ AT LEISURE AND THE BOOKING ONE IS NOT ----------
     *"refine availability bit it looks weird, like scruffy."* Three things made it so, measured on
     a screenshot at 320 and 390: cells a different width from their height (a 19px column in a
     20px row reads as a smudge rather than a square), a two-letter day in capitals beside a column
     of small numbers, and bars that joined only for hours saved before the card was drawn — see the
     change listener in me.js. The booking week keeps its shape because that card has no height to
     spare; this card is a page to itself, so its cells are SQUARE, its days are `Mon`, and the
     scoping class says so without touching the other two weeks that share `weekGrid_`. */
```

### A ROUND TRIP THAT CANNOT FAIL SILENTLY.

top level, before `send_`

```
/**
 * A ROUND TRIP THAT CANNOT FAIL SILENTLY.
 *
 * Twenty-one places send something to the backend, and five of them had no `.catch` — including
 * `verifyLogin` and `createJob`, which are signing in and asking for a session. With no connection
 * those produced an unhandled rejection and nothing on the screen: the button did nothing, twice,
 * and then somebody gave up.
 *
 * The three things every one of them wants are the same three: stop the button being pressed
 * again, say what went wrong where the person is looking, and let the button go afterwards.
 * `where` is whichever the form has — an element id for a form with a line for messages, and a
 * toast for anything without one.
 */
```

### ---------- AND THE FIELDS, WHICH IS THE HALF THAT WAS MISSING

in `send_`

```
/* ---------- AND THE FIELDS, WHICH IS THE HALF THAT WAS MISSING ---------------------------------
     REPORTED AS *"i can still backspace login details while its loading logging in. this is not
     proffesional or right."* Exactly right: this function disabled the BUTTON and left every box
     on the card live, so you could edit the PIN that was already on the wire. What is then on the
     screen is not what is being checked, and when the refusal comes back it is about a PIN the
     screen no longer shows.

     ON `send_` RATHER THAN ON THE SIGN-IN CARD, because it is the one shared POST helper in this
     app -- so the booking form, the composer and the profile save all get it from
     one place. A lock written on the card that prompted it is the fault this repository records
     under `cost: 0` and `paper: true`: repaired in the instance, and back within a month.

     EXACTLY WHAT IT DISABLED IS WHAT IT ENABLES. A field already disabled for its own reason -- a
     locked step on the booking form, a shut `<select>` -- must still be disabled afterwards, so
     the list is the ones this actually changed rather than everything it can find. The button is
     left out of it because `done()` below already owns that one.

     AND THE FOCUS COMES BACK. Disabling the box somebody is typing in moves focus to the document,
     so after a refusal the caret would be nowhere and the next keystroke would go to the page.
     Remembered here and restored in `done()`.

     EXCEPT A CONTROL MARKED `data-unlocked`, WHICH WAITS FOR THE SAVE ITSELF. The qualifications card
     saves on every answer, and a box's answer is saved on `change` — which fires when the box loses
     focus, which is the moment a finger lands on the next thing. So "type a school, tap the next line"
     was a save that locked the card under the finger: the line was disabled between pointerdown and
     click, the click never happened, and the tutor tapped twice (walked at 320, every run). Those
     controls stay live and queue their press until the save answers (`qualWhenSaved_` in this file);
     the boxes are still locked, so what is on the wire is still what is on the screen. */
```

### AND IT IS MARKED `refused` — THE SERVER ANSWERED, AND THE ANSWER WAS NO. A caller can then tell that from a reply that never came:

in `send_`

```
/* AND IT IS MARKED `refused` — THE SERVER ANSWERED, AND THE ANSWER WAS NO. A caller can then
         tell that from a reply that never came: after a refusal what the form shows is a choice the
         server has turned down, after a lost reply it is still the person's unsent request. Found on
         the roles card, whose refused Client tick stayed gold under "Nothing was changed". */
```

### AND THE WHOLE REPLY RIDES ON IT, as on `send`'s — a refusal is sometimes a fact for the code as well as a sentence:

in `send_`

```
/* AND THE WHOLE REPLY RIDES ON IT, as on `send`'s — a refusal is sometimes a fact for the code
           as well as a sentence: `why: 'unconfirmed'` turns the make-child form into the held card
           (`heldBy_`), where matching the sentence would break on its first rewording. */
```

### THROUGH `why_`, so the same sentence appears here and in the banner — the line under the button is where somebody looks, the banner is where text can be

in `send_`

```
/* THROUGH `why_`, so the same sentence appears here and in the banner — the line under the
         button is where somebody looks, the banner is where text can be selected and pasted to
         somebody who can fix it, and neither should be a different account of the same fault. */
```

### ONE FIELD RENDERER. There were two, and they had different powers.

top level, before `FIELD_IS_BOOL`

```
/* ================================================================================================
   ONE FIELD RENDERER.

   There were two, and they had different powers. The profile editor could draw a SELECT from the
   backend's validations and could disable a field somebody is not allowed to change. The resource
   editor could offer a DATALIST of what other rows already say. Neither could do the other's job —
   so which editor you happened to be in decided what a field was capable of, and adding a third
   editor meant writing a third renderer and choosing which half of the features to reimplement.

   This is the union. Every editor gets selects, suggestions, checkboxes, read-only and the right
   keyboard, and a new editor gets all of it by passing a list of names.

   WHAT DECIDES A FIELD'S SHAPE is the field itself, not the form it is on:

     a fixed list of answers  → a select        (validations, from the backend)
     a list of what others say → a datalist      (suggestions, from the rows)
     a name that reads true/false → a checkbox
     anything else            → a text box, with the keyboard its name implies

   `attr` is which data-attribute the form reads on save — `data-me` for a profile, `data-ed` for a
   resource. That is the only thing the two editors genuinely differ by, so it is the only thing
   passed in.
================================================================================================ */
```

### ---------- AND A NAME ENDING `_date` IS A DAY ON A CALENDAR

top level, before `FIELD_IS_DATE`

```
/* ---------- AND A NAME ENDING `_date` IS A DAY ON A CALENDAR --------------------------------------
   MATCHED RATHER THAN LISTED, which is the argument written over `FIELD_IS_BOOL` three lines up:
   the sheet grows columns and a list has to be remembered. `exam_small_date` and `exam_big_date` are
   the two on a form today; `exam_date` on the exams tab and `creation_date` on a post are the same
   shape and would be right to draw this way if either ever reached a form.

   `date_of_birth` DOES NOT MATCH IT, AND THAT IS THE POINT RATHER THAN AN ESCAPE. A birthday is
   three boxes and a `dd/mm/yyyy` cell — see `isDobBox_` below, and the long note over `isoDate_` in
   core.gs, which argues that the same control is wrong for a birth year and right for an exam. The
   suffix is what separates them, so neither needs an exception written about the other. */
```

### ---------- TWO LISTS THE BACKEND HAS NEVER BEEN TOLD ABOUT

top level, before `FIELD_LISTS_`

```
/* ---------- TWO LISTS THE BACKEND HAS NEVER BEEN TOLD ABOUT ------------------------------------------
   `DATA.validations` IS BUILT FROM THE `options` TAB through `FIELD_OPTIONS` in constants.gs, and
   neither of these fields is in that map — so the backend sends no list for either, and without one
   `fieldHtml` draws a free text box. Asked for as *"favourite colour doesn't need its own widget and
   should be a dropdown"* and *"the more qualifications bit should instead be a drop down of many
   different qualification stuff and its multi select"*.

   THE BACKEND STILL WINS WHEN IT SENDS ONE. `fieldOptions_` reads `validations` first, so the day
   somebody adds `favourite_colour: 'colour'` to `FIELD_OPTIONS` and fills an `options` list, that
   list is the dropdown with no deploy of this file. Until then these are the floor — the house rule
   that an empty sheet must still produce a working form, which is `factsNow_`'s rule one list along.

   CREDENTIALS, NOT SUBJECTS. What somebody STUDIED is the `Qualifications` shelf (subject, level,
   board, grade); this is the list of things a parent asks about beside that — can you teach, are you
   checked, are you first-aid trained, can you coach. NO COMMAS IN ANY ENTRY, because the cell stores
   the ticked ones as a comma-list and `profList_` splits it on the public card: a comma inside a name
   would print one qualification as two. `check-people.js` could not see that, so it is said here. */
```

### ---------- WHAT A QUALIFICATION CAN BE IN, AS A LIST THAT IS SPELT RIGHT

top level, before `QUAL_SUBJECTS`

```
/* ---------- WHAT A QUALIFICATION CAN BE IN, AS A LIST THAT IS SPELT RIGHT -------------------------
   ASKED FOR AS *"reevaluate the subjects list"*. The shelf offered the `options` tab's `subject`
   list, which is the list of what can be BOOKED — thirteen entries, among them "Englisht Literiture",
   "Physical Educations" and "(Single) Physics", and nothing a degree is in. A qualification is what
   somebody STUDIED, which is a different and much longer list, so it is its own list here rather
   than a second job for the booking one. Alphabetical, because it is scanned for a name; the common
   school and university subjects, spelt as the boards and universities spell them. Anything not on it
   is `Something else…`, which `qualPick_` turns into a box, and a value already saved that the list
   does not hold is kept as its chosen option — so nothing anybody typed is lost by this. The
   certificates a tutor holds (a PGCE, a DBS) are at the foot, because they are entries on this same
   shelf now that "More qualifications" is gone. */
```

### ---------- AND THE LEVELS, WHICH STOPPED AT A-LEVEL

top level, before `QUAL_LEVELS`

```
/* ---------- AND THE LEVELS, WHICH STOPPED AT A-LEVEL ------------------------------------------------
   ASKED FOR AS *"level only has gcse. it doesnt seem to have like the degree levels ... add enhanced
   level to level so i can put enhanced dbs."* The shelf offered the `options` tab's `level` list,
   which is the booking list again — GCSE, 11+, AS, Alevel, B-TEC, SATs and three mocks — so a degree
   could only be typed in. This is what somebody can HOLD, school to doctorate, in the order they get
   it; then the three certificate levels a DBS check comes at, so `DBS · Enhanced` is two picks rather
   than one subject spelling the level out. A level already saved that is not here is kept as its
   chosen option, exactly as the subject is, so the sheet's `Alevel` still shows.
   `SATs`, NOT `KS2 SATs` -- *"sats is one tag not ks2 sats"* -- the word the `options` tab and Find's
   Level question both use; a `KS2 SATs` already saved is kept as its chosen option, by the rule above. */
```

### ---------- AND ONE SHELF SLOT'S LIST OFF THE FIRST SLOT'S

top level, before `fieldOptions_`

```
/* ---------- AND ONE SHELF SLOT'S LIST OFF THE FIRST SLOT'S -------------------------------------
   `FIELD_OPTIONS` sends `qual_1_level` ONCE rather than ten times — see its note in constants.gs —
   so `qual_7_level` asks for `qual_1`'s list here. (What a tutor teaches is no longer a field: it is
   the three-way Teach / Can teach / Not teaching control on each qualification — see `qualSlot_`.) */
```

### ONE FIELD, drawn from what is known about it.

top level, before `setDraftOk_`

```
/**
 * ONE FIELD, drawn from what is known about it.
 *
 * @param name      the column
 * @param value     what it holds now
 * @param o.attr    the data-attribute the save reads   (default `data-me`)
 * @param o.options a fixed list — draws a select
 * @param o.suggest what other rows say — draws a datalist
 * @param o.readonly whether it may be changed
 * @param o.label   an override for the label
 */
```

### ---------- AND A CARD DRAWN HOLDING ONE SAYS SO

top level, before `SET_HELD_SAY`

```
/* ---------- AND A CARD DRAWN HOLDING ONE SAYS SO ----------------------------------------------------------
   SAVE SENDS EVERY BOX OF ITS CARD (`meSave_`), so a box holding an edit made before a reload and never
   saved went up with a Save pressed for the box beside it — and nothing on the card said the city in
   front of you was not the one on the sheet (review of 317). `draftAttr_` marks a box drawn holding a
   draft (`data-draft-held`); its card's line says so until the next Save writes over it. */
```

### THE EXTRA-SEAT FIGURE IS A SHARE OF THE RATE, NOT POUNDS, and nothing on the box said so:

in `fieldHtml`

```
/* THE EXTRA-SEAT FIGURE IS A SHARE OF THE RATE, NOT POUNDS, and nothing on the box said so: a tutor
     typing 15 meaning £15 saved without complaint and charged nothing per seat, because `seatShare_`
     treats anything outside 0–2 as nought. The caption says what it is and the box refuses the rest;
     `pricingRefusal_` refuses it on the server as well. */
```

### AND THE BUSINESS'S CUT OF IT, PER TUTOR SINCE docs/history/345 — the same kind of figure, so the same caption and the same bounds (`seatCutRefusal_`), and it

in `fieldHtml`

```
/* AND THE BUSINESS'S CUT OF IT, PER TUTOR SINCE docs/history/345 — the same kind of figure, so the same caption
     and the same bounds (`seatCutRefusal_`), and it says what a blank is, because blank and 0 are two answers here:
     the usual share (the config tab's `B`) and none at all. Drawn as a fraction only where the rate page is still
     on Settings — a tutor or an admin with no public card; on a card it is in pounds (`cardRateHtml_`). A tutor
     sees it and cannot change it (`settingsPages_` makes it read-only), and the server refuses it from them.
     READ-ONLY, IT SAYS WHO SETS IT, as the card's line does: a dimmed box under the admin's caption said nothing
     about why it would not take a figure (the review of 345). */
```

### ---------- AN UNSAVED EDIT IS A DRAFT (data.js; docs/history/317)

in `fieldHtml`

```
/* ---------- AN UNSAVED EDIT IS A DRAFT (data.js; docs/history/317) ------------------------------
     A CARD'S BOXES WAITED FOR ITS SAVE, and a reload before it took every edit on the card with it.
     So each box of YOUR OWN row (`data-me` — another editor's row is somebody else's draft) keeps what
     is typed as a draft and is drawn holding it, with the saved value as the one that takes the draft
     away again; `meSave_` drops each field it sent. NOT A LIBRARY CARD (its PIN is on it, and a
     card is drafted whole or not at all), NOT THE QUALIFICATION SHELF (saved the moment each answer
     changes, `qualCommit_`), and never anything named a PIN — `draftKeep_` refuses those whatever asks.
     A SEVERAL-OF-A-LIST IS DRAFTED TOO NOW: it was left out while its ticks lived in `#drop`, a panel
     the draft could not reach; since 315 they are checkboxes in this card, so a reload between a tick
     and Save put every tick back -- the essay of 317 in a smaller box. The hidden answer carries the
     draft (`da`) and the ticks' `change` keeps it (below `fieldHtml`); `v` above is already the draft's,
     so the boxes are drawn ticked from it.
     `draft: false` IS THE CARD EDITOR'S (`cardEditHtml_`, below): its boxes are `data-me` so every
     listener here hears them, and the whole card is ONE draft of its own (`cardKeep_`), keyed by whose
     card it is — a box keeping a `set` draft as well would be a second copy, and on an admin's edit of
     somebody else's card it would be the ADMIN's own field holding the other tutor's words. */
```

### ---------- SEVERAL OF A LIST IS A LIST OF CHECKBOXES, OPENED UNDER ITS FIELD

in `fieldHtml`

```
/* ---------- SEVERAL OF A LIST IS A LIST OF CHECKBOXES, OPENED UNDER ITS FIELD ------------------
     IT WAS A BUTTON THAT HUNG `#drop`, the booking form's floating panel, off the field (note 226),
     until the owner asked on 9 October for *"a more stable standard simple conventional drop down
     list"* (note 315). A floating panel is the opposite of every one of those words, so this is the
     conventional control: a `<details>` whose summary IS the field — the box's own clothes, saying
     what is ticked — and which, opened, puts one `.check` row per option directly under it, in the
     card, pushing what is below it down. The browser opens it and shuts it, a keyboard's Enter does
     too, and a screen reader says expanded or collapsed; nothing here positions anything.

     NOT `<select multiple>`, which a laptop draws as a list box you Ctrl-click, and not a `<select>`
     that shuts after every pick — *"doesnt disapear after each option click"* is the booking form's
     accepted answer, and this is the same answer in the settings column's clothes.

     THE ANSWER IS STILL THE HIDDEN INPUT CARRYING THE ATTRIBUTE, so `me-save` gathers it exactly like
     every other box on the card and nothing about saving changed. A tick rewrites it (the `change`
     listener below `fieldHtml`), and the tick's own `change`, bubbling, is what marks the card dirty —
     which the panel's buttons never did, so a repaint before Save could put every tick back.

     THE BOXES CARRY `data-many-of`, NOT THE ATTRIBUTE. `me-save` reads every checkbox carrying it as
     TRUE or FALSE, and fifteen boxes under one name would each have overwritten the list.

     ANYTHING ALREADY IN THE CELL IS OFFERED, list or not. The column was free text once, so a row may
     hold a name the list does not — leaving it off would make it impossible to untick and easy to
     lose on the next save.

     OPEN IS DRAWN OPEN — see `MANY_OPEN_` below: a repaint keeps the list open under the person who
     opened it, as `BOOKING.picking` keeps the booking form's. */
```

### A FIXED LIST IS A SELECT.

in `fieldHtml`

```
/* A FIXED LIST IS A SELECT. Somebody choosing an exam board should not be able to invent one —
     that is how a sheet ends up with four spellings of Edexcel.
     AND A SAVED VALUE THE LIST DOES NOT HOLD IS KEPT AS ITS FIRST OPTION. Without it the empty
     option was the one selected, so pressing Save with nothing touched wrote '' over a borough, a
     town, a favourite colour, or a qualification's Merit or Grade 8 — whatever the options tab
     happened not to list. `qualYears_` and the several-of-a-list field above keep theirs this way. */
```

### A PLACEHOLDER ON A SELECT IS ITS EMPTY OPTION, and the caption goes exactly as it does for a box below:

in `fieldHtml`

```
/* A PLACEHOLDER ON A SELECT IS ITS EMPTY OPTION, and the caption goes exactly as it does for a
       box below: the empty option reads `Level` or `Board` until something is chosen, and the
       `aria-label` names it after that, because a chosen `A-Level` alone does not say which
       question it answers. */
```

### ---------- A DAY ON A CALENDAR IS A DATE INPUT

in `fieldHtml`

```
/* ---------- A DAY ON A CALENDAR IS A DATE INPUT -----------------------------------------------
     WHAT IT BUYS OVER A TEXT BOX, which is what these two were until this: the platform's own
     calendar, the weekday beside each number, a value it has already validated, and no way to type
     `05/14/2027` into a sheet that reads `14/05/2027`. That last one is not hypothetical — it is the
     fault the three birthday boxes were written to close, one column along.

     ITS VALUE IS ALWAYS `yyyy-mm-dd`, WHICHEVER WAY THE PHONE DRAWS IT. The control shows the
     viewer's own format and yields ISO, so the sheet gets one spelling from every device — which is
     why `isoDate_` on the server sends ISO back rather than the `dd/mm/yyyy` everything else writes:
     a non-ISO value is SILENTLY REJECTED by the control, so a picker fed the wrong spelling opens
     empty over a cell that has a date in it and the next save writes the empty over it.

     NO PLACEHOLDER, because a date input does not show one — it draws its own hint — so the caption
     is the only thing that can name it and is always kept. */
```

### ---------- A CAPTION OR A PLACEHOLDER, NEVER BOTH

in `fieldHtml`

```
/* ---------- A CAPTION OR A PLACEHOLDER, NEVER BOTH ---------------------------------------------
     A PLACEHOLDER IS THE ACCESSIBLE NAME WHEN THERE IS NOTHING ELSE, which this app has measured:
     ten controls have no text and no `aria-label`, every one carries a placeholder, and adding a
     label repeating it would be two strings to keep in step. So a caller that asks for one gets a
     box with no caption above it and 15px of the card back — which is what makes three library
     cards fit a 568px phone at all. Every other field keeps its caption, because a form of nine
     unlabelled boxes is a form you have to guess at. */
```

### EXTRA ATTRIBUTES, FOR THE CALLERS THAT NEED ONE THE NAME CANNOT IMPLY.

in `fieldHtml`

```
/* EXTRA ATTRIBUTES, FOR THE CALLERS THAT NEED ONE THE NAME CANNOT IMPLY. `inputmode` and
     `list` above are derived from the field's own name, which is right for a hundred and twenty
     fields and cannot say `maxlength="2"` or `autocomplete="bday-day"` — facts about a box rather
     than about a column. Passed as a string so this stays one `<input>`: a second renderer for a
     box that differs by two attributes is the drift this file spends most of its length avoiding. */
```

### ---------- WHICH SEVERAL-OF-A-LIST FIELD IS OPEN, KEPT AS STATE RATHER THAN IN THE DOM

top level, before `MANY_OPEN_`

```
/* ---------- WHICH SEVERAL-OF-A-LIST FIELD IS OPEN, KEPT AS STATE RATHER THAN IN THE DOM ---------------
   FOUND BY REVIEW ON 9 OCTOBER: open the venues field, tick nothing, and let a payload land — the
   list shut under the person. Opening a `<details>` fires no `input` and no `change`, so the card was
   clean, `settingsKeep_` let `paint` redraw it, and the open state had lived only in the element that
   was replaced. The panel it replaced survived the same repaint, and so does the booking form's list,
   because `BOOKING.picking` is state; this is that, for the settings column. Not by marking the card
   dirty, which is the qualification shelf's answer for an open LINE (*"AN OPEN LINE COUNTS"*): a card
   held dirty is a column that is never redrawn until Save, and opening a list to read it is not an
   edit. Written by the browser's own `toggle` (it does not bubble, hence the capture), so a keyboard's
   Enter, a tap and a redraw drawing it `open` all say the same thing. One is remembered, the last
   opened, which is the booking form's rule too; there is one such field today (`venues_ok`). The shut
   of an element being thrown away by a repaint is not a person shutting it, hence `isConnected`. */
```

### A PERSON OPENING IT, as against a repaint drawing it open:

top level, before `list`

```
/* A PERSON OPENING IT, as against a repaint drawing it open: the list is brought onto the screen, as
     the booking form's is (`tickListShow_` in book.js) — at 320 the card grows when it stops being
     drawn smaller, and the field went below the glass as it opened. */
```

### ---------- A TICK UNDER A SEVERAL-OF-A-LIST FIELD

top level, before `t`

```
/* ---------- A TICK UNDER A SEVERAL-OF-A-LIST FIELD -------------------------------------------------
   WRITES THE HIDDEN INPUT AND THE SUMMARY, AND NOTHING ELSE. The list is read off the boxes in the
   order they are drawn — the list's own order, then anything the cell held that the list does not —
   which is `bookToggle_`'s rule: a summary in the order things were tapped reads as a different
   answer every time.

   THIS WAS `meDrop_` AND SIX FUNCTIONS BESIDE IT — the settings column's half of `#drop`, the
   floating panel: which field owned it, where it hung, following the field on every placement of the
   grid, shutting when the page turned, and handing its moves and its Escape over to book.js. The
   panel went on 9 October (note 315); a box in the card needs none of that. */
```

### ---------- A TICKED HOUR SAYS SO WITH `.on` AS WELL AS WITH `:checked`

top level, before `t`

```
/* ---------- A TICKED HOUR SAYS SO WITH `.on` AS WELL AS WITH `:checked` ------------------------------
   THE JOINED BAR IS DRAWN OFF `.on` — `.hr.on + .hr.on` — and the availability grid set that class
   only when it was DRAWN. So an hour ticked since joined nothing, and one unticked stayed joined to
   its neighbour: a week of saved bars beside a week of loose squares, which is most of what read as
   "scruffy". One listener keeps the class in step with the box, so every run of hours is one bar
   whether it was saved yesterday or ticked a second ago. */
```

### ---------- BOXES THAT ARE ONE QUESTION SIT ON ONE LINE

top level, before `FIELD_ROWS`

```
/* ---------- BOXES THAT ARE ONE QUESTION SIT ON ONE LINE ----------------------------------------
   ASKED AS *"make it all more efficient and intuitive it looks long right now."* A name is a first
   and a last; a subject is the subject and its level; three words are three words. Drawn one under
   another each costs a whole row and a caption, so a page of them read as a list twice as long as
   the thing it asks. Side by side they read as the pairs they are.

   WHEN EVERY MEMBER IS ON THE PAGE, AND ONLY THEN — a group that sends one of a pair draws it as an
   ordinary box, so this can never hide a field or invent one. `cap` gives the row ONE caption and
   the boxes placeholders instead, for the three words, where "adjective 1, adjective 2, adjective 3"
   over three narrow boxes would be the caption saying the same thing three times. */
```

### "max and min number of students could more efficiently be written as '[] - []'."* One row, one caption, a dash between — and MIN FIRST although the backend

in `FIELD_ROWS`

```
/* *"max and min number of students could more efficiently be written as '[] - []'."* One row, one
     caption, a dash between — and MIN FIRST although the backend lists max first, because a range is
     read low to high. `dash` is what draws the `–`; the two stay two columns in `PRICING_FIELDS`, so
     the month's clock still covers both. */
```

### THE AGES A TUTOR TEACHES, THE SAME `[ ] – [ ]` SHAPE AS THE STUDENTS ABOVE, so the two ranges a tutor states read alike although they live on different pages.

in `FIELD_ROWS`

```
/* THE AGES A TUTOR TEACHES, THE SAME `[ ] – [ ]` SHAPE AS THE STUDENTS ABOVE, so the two ranges a
     tutor states read alike although they live on different pages. Two SELECTS rather than boxes —
     `validations` carries `AGE_OPTIONS` from constants.gs, four to eighteen and then `Adults` — and a
     placeholder on a select is its empty option, so each reads `youngest` / `oldest` until chosen. */
```

### AND HOW LONG A SESSION IS, THE THIRD RANGE — two selects off `SESSION_OPTIONS` (constants.gs), whole hours, the same `[ ] – [ ]`.

in `FIELD_ROWS`

```
/* AND HOW LONG A SESSION IS, THE THIRD RANGE — two selects off `SESSION_OPTIONS` (constants.gs), whole
     hours, the same `[ ] – [ ]`. Writable since docs/history/330; on the card's At a glance, where the card
     prints it as `1–2 hours`. */
```

### A WHOLE FORM, from a group table.

top level, before `isTimetable_`

```
/**
 * A WHOLE FORM, from a group table.
 *
 * The backend sends `{ 'About you': ['first_name', …], … }` for every editable thing, and every
 * editor walked it the same way with its own field renderer at the bottom. One walk now, so a group
 * of hour codes becomes a timetable everywhere rather than only where somebody remembered.
 */
```

### A GROUP OF HOUR CODES IS A TIMETABLE.

top level, before `isTimetable_`

```
/* A GROUP OF HOUR CODES IS A TIMETABLE. Recognised by the shape of the names rather than by the
   group's title, so renaming it in the backend does not turn it back into a column of boxes.
   ONE TEST, TWO READERS: `fieldsHtml` draws it inside the details sheet, and `availCodes_` finds
   it for the tool on the Tools column. A second spelling of "is this the week grid" is a second
   chance for one of them to stop recognising it. */
```

### ---------- AND A GROUP OF `libN_*` NAMES IS A SHELF OF LIBRARY CARDS

top level, before `isLibraryCard_`

```
/* ---------- AND A GROUP OF `libN_*` NAMES IS A SHELF OF LIBRARY CARDS ----------------------------
   RECOGNISED BY THE SHAPE OF THE NAMES, exactly as the timetable above is and for the same reason:
   the group's title is the backend's to choose, and a renderer that keys on it stops working the
   day somebody renames it. (There was a `library_note` box under the shelf — "note to yourself" —
   and the owner took it off, so every name in the group is a card now; the test still asks ANY
   rather than ALL, so a field added beside the cards one day is drawn rather than dropped.)

   WHY IT NEEDS A RENDERER AT ALL, measured rather than asserted: nine ordinary `label.field` boxes
   are 63.1px each at 320 and the group came to **790.2px in a pane that caps at 534.25** — 283px
   below the fold, with no scroll and no page to turn to, which is exactly the `OUT OF REACH` fault.
   Two rows per card — the name and the PIN across, the number full width beneath — is **430.4px
   with 78.9px of headroom**. */
```

### ---------- AND `library_note` IS NOT DRAWN, WHATEVER THE BACKEND SENDS

top level, before `RETIRED_FIELDS_`

```
/* ---------- AND `library_note` IS NOT DRAWN, WHATEVER THE BACKEND SENDS ---------------------------
   *"for the library card widget, there doesnt need to be a add note to it."* The column left
   `SCHEMA.people` and the groups in `constants.gs` — but the phone reaches Pages in a minute and the
   backend reaches Apps Script when somebody runs the sync, and the deployment the live site talks
   to still lists `library_note` in its `Library cards` group. So the box went on being drawn under
   the shelf, asked for by a server that had been told to stop asking.

   DROPPED IN `fieldsHtml`, THE ONE WALK EVERY SURFACE GOES THROUGH, so neither an older deployment
   nor a cached payload can put it back. Nothing is lost by not posting it: `updateProfile` writes
   only the fields it is sent, so a note already sitting in an old sheet's cell stays there untouched
   rather than being blanked by a Save that no longer carries the box. */
```

### ---------- AND A DATE OF BIRTH IS THREE BOXES, NOT ONE

top level, before `isDobBox_`

```
/* ---------- AND A DATE OF BIRTH IS THREE BOXES, NOT ONE ------------------------------------------
   ASKED FOR AS *"date of birth should be 3 boxes. day, month and year. or copy the best practice
   method."* It was one plain text box with no type, no placeholder and no hint about which way
   round the first two numbers go — so what reached the cell was whatever anybody typed, and
   `09/15/1985` is a date `sheetDate` reads as the 9th of March 1986 rather than as nothing.

   WHY NOT `type="date"`, which is the other reading of "best practice": a birth year is forty
   years of scrolling on an iOS picker that opens on today, its value is ISO rather than the
   `dd/mm/yyyy` this sheet speaks, it ignores `inputmode` and `maxlength`, and it draws its own
   chrome that this stylesheet cannot reach. The long note over `DOB_FIELDS` in `constants.gs`
   carries the measurement.

   THE CAPTION IS WHERE THIS STOPS COPYING THE LIBRARY SHELF. That one gets away with placeholders
   and no caption because its group IS "Library cards" — the heading names it. A date of birth
   sits inside `Contact` or `About you`, which name three fields between them, so the row needs a
   caption of its own and `fieldHtml` cannot emit one (its `span` is per box).

   RECOGNISED BY THE SHAPE OF THE NAMES, like the timetable and the shelf above, and for the same
   reason: the group's title is the backend's to choose. */
```

### `autocomplete` IS THE HALF A PHONE ACTUALLY USES.

in `dobBoxes_`

```
/* `autocomplete` IS THE HALF A PHONE ACTUALLY USES. `bday-day`/`bday-month`/`bday-year` are the
     WHATWG tokens for exactly these three boxes, so a saved birthday is offered into them; without
     them a phone offers nothing, or offers the wrong thing into all three.
     `maxlength` RATHER THAN A PATTERN, because a pattern refuses after the fact and a maxlength
     stops the fourth digit being typed into a two-digit box in the first place. */
```

### ---------- A SHELF SHOWS WHAT IS FILLED IN, ONE EMPTY SLOT, AND A WAY TO ASK FOR ANOTHER

top level, before `shelfSlots_`

```
/* ---------- A SHELF SHOWS WHAT IS FILLED IN, ONE EMPTY SLOT, AND A WAY TO ASK FOR ANOTHER ---------
   ASKED FOR AS *"allow to add as many qualifications as you like (up to 10)"* and *"same with
   library cards (max 5)"*. Ten qualifications drawn at once is two thousand pixels of empty boxes
   on a pane that caps at 534 — so every slot is IN the markup (the save posts all of them, and a
   hidden empty slot packs to nothing) and only the filled ones are SHOWN, or one empty one when
   nothing is filled yet.
   `Add another` reveals the next one in place; it is not a sheet and not a menu, because the owner
   refuses both, and the pane scrolls once the card outgrows it (`paneWatch_`).

   THE LAST FILLED SLOT DECIDES, NOT THE COUNT. A library shelf keeps a gap in the middle on
   purpose (`libCardsIn`'s note), so what shows is measured from the last slot with anything in it
   — a count would hide the card after the gap, with its answers still in it.

   `hidden` ON THE SLOT ITSELF, which works because no rule gives `.lib-card` a `display` of its own
   — `[hidden]` is the UA's `display: none` and nothing here outranks it. */
```

### NO SPARE EMPTY SLOT ONCE ONE IS FILLED — `Add another` IS the empty slot, one tap away.

in `shelfSlots_`

```
/* NO SPARE EMPTY SLOT ONCE ONE IS FILLED — `Add another` IS the empty slot, one tap away. An
     empty card as well as the button measured **583px in a 532px pane at 320x568** on a shelf with
     two libraries in it; without it, 475. A shelf with nothing filled still shows one empty slot,
     because a button over nothing is a page with nothing to type into. */
```

### ---------- ONE LINE A QUALIFICATION, AND THE LINE IS THE DOOR

top level, before `QUAL_CERT_SUBJECTS_`

```
/* ---------- ONE LINE A QUALIFICATION, AND THE LINE IS THE DOOR -----------------------------------------
   ASKED FOR AS *"can you make the qualifications widget more efficient, elegant, intuitive and take up
   less space."* MEASURED BEFORE ANYTHING MOVED, with a tutor holding Maths, Physics and English
   Literature at GCSE and A-Level and an Enhanced DBS — seven records, the shelf a real tutor has:
     · 900px tall at 320x568, in a 532px pane — drawn at 70%, which is `PANE_ZOOM_MIN`, the floor, AND
       STILL 123px past it; 932px at 390x844, drawn at 83%. Eleven `Edit` buttons of two kinds (a
       subject's renamed it or removed it with its levels, a level's edited the level), four
       `+ Add a … level` links and an `+ Add a subject` — two ways to add, two ways to remove, and
       `+ Add a DBS level` for a certificate that has none.
     · taps, a pick from a list being two (the field, then the answer): a level added under Maths 6,
       a new subject 8, a grade changed 4, Teach marked 3, one removed 2 — and at 320 a scroll before
       Save or before Edit in three of the five, because the card did not fit even at 70%.

   SO THE DEFAULT IS ONE LINE A QUALIFICATION, WRITTEN THE WAY THE PROFILE CARD WRITES IT: the subject,
   then the level raised over the grade — `profQualChip_`'s notation and its own `.prof-iso`, so what a
   tutor reads here is what a parent reads on their card — and `Teach` in the card's gold chip or
   `Can teach` in a dim word at the end. THE SUBJECT IS SAID ONCE: it heads its first line and the lines
   under it leave the column empty, so a subject's levels read down one column like a table. Where
   it was studied and when are not on the face — the profile chip keeps them in its name, and so does
   the line (`aria-label` and `title`), and the editor shows them the moment the line is opened.

   THE LINE IS THE DOOR. One tap opens it in place, under itself — subject and level, grade and year,
   the school, Teach / Can teach / Not teaching as one control, and two tiles: the tick that closes it
   and the bin at the far end of the row. Tap the line again, or the tick, and it shuts. There is
   one kind of thing on the card to press and it does one thing.

   IT SAVES AS YOU GO, THROUGH THE SAME SAVE EVERY CARD USES. Each answer, once chosen, is posted by
   `meSave_` — all seventy boxes, the lock on the card while it is on the wire, the refusal under the
   card if there is one — so there is no Save to find and none to forget. `send_`'s lock is what
   makes that safe rather than racy: nothing on the card can change while a save is out, so two saves
   can never cross, and a failed one leaves the answer in its box for the tick to try again.

   ONE WAY TO ADD: the `+` tile under the list. It asks for the subject at once and the level straight
   after it — the subject's list opens with YOUR subjects at the top, so adding an A-Level to Maths is
   a tap on Maths, not a scroll to the Ms — and the moment there is a subject and a level, it is a
   qualification and it is saved. Everything else is the same editor every other line opens.

   THE DATA DID NOT MOVE. Every one of the ten slots is still in the form as `.q-slot[data-slot=N]`
   with its seven `data-me` boxes, so every save posts seventy fields and `qualsIn` rebuilds the rows
   exactly as before; Teach and Can teach are still hidden `TRUE` / `FALSE` boxes written by the
   three-way control. The subject is a select of its own now rather than a hidden box under a heading,
   because a line is edited as a whole. Unused slots wait in the hidden pool. */
```

### THE CERTIFICATES ARE THE TAILS OF THE TWO LISTS — the same tails `QUAL_CERTS` in core.gs copies, and `check-people.js` holds that copy to these.

top level, before `QUAL_CERT_SUBJECTS_`

```
/* THE CERTIFICATES ARE THE TAILS OF THE TWO LISTS — the same tails `QUAL_CERTS` in core.gs copies, and
   `check-people.js` holds that copy to these. A PGCE or an Enhanced DBS is written plain, as the
   profile card writes it: notation over a certificate would be a raised `Enhanced` with nothing under. */
```

### A SUBJECT'S COLUMN IS AS WIDE AS ITS OWN NAME, in `ch` because the face is monospaced — so its notation sits right after it, as on the profile chip, and its

in `qualShelf_`

```
/* A SUBJECT'S COLUMN IS AS WIDE AS ITS OWN NAME, in `ch` because the face is monospaced — so its
     notation sits right after it, as on the profile chip, and its other levels line up under that
     notation rather than under a column sized for some other subject. A shared width made a table of
     it, and `Maths` stood a third of the card away from its own `GCSE`: measured on the first
     screenshot. Never more than 42% of the line, past which a long subject wraps inside its own row. */
```

### ---------- ONE QUALIFICATION: ITS LINE, AND ITS EDITOR UNDER IT

top level, before `qualSlot_`

```
/* ---------- ONE QUALIFICATION: ITS LINE, AND ITS EDITOR UNDER IT ----------------------------------------
   The seven `data-me` boxes live in the editor, so they are posted whether it is open or not; the line
   is drawn from the same values and redrawn from the boxes as they change (`qualFaceNow_`), so the line
   and the boxes cannot disagree — and an open line is a preview of what the profile card will say. */
```

### ---------- A CERTIFICATE IS HELD, NOT STUDIED AND NOT TAUGHT

top level, before `qualIsCert_`

```
/* ---------- A CERTIFICATE IS HELD, NOT STUDIED AND NOT TAUGHT --------------------------------------
   The same test the notation uses (and `QUAL_CERTS` in core.gs copies): the subject is one of the
   certificates at the foot of the subject list, or the level is one of the three a DBS comes at.
   *Walked at 390:* the DBS editor offered Grade and `Teach | Can teach | Not teaching`, neither of
   which a certificate has — and Teach would have put "DBS Enhanced" under Teaches on the profile,
   because `teachesOf_` reads the tick and not the kind. So a certificate's editor has no grade and no
   three-way control (`.is-cert` in style.css), its year and its issuer share a row, and the two are
   two rows shorter — the height the open line was costing at 320. */
```

### ---------- THE NOTATION, BY THE PROFILE CHIP'S RULES

top level, before `qualIso_`

```
/* ---------- THE NOTATION, BY THE PROFILE CHIP'S RULES ----------------------------------------------------
   `profQualChip_` in cards.js draws the parent's side and this is the same four cases on the tutor's:
   level over grade; a level alone raised (the grade's half held open by `.prof-iso`); still studying
   with no grade said in the grade's place; and a certificate, or a subject with neither, written plain.
   Escaped rather than `mark`ed, because nothing on a settings card is a search result. */
```

### ---------- A DROP-DOWN WITH A CAPTION, AND `Something else…` AT THE FOOT

top level, before `QUAL_OTHER`

```
/* ---------- A DROP-DOWN WITH A CAPTION, AND `Something else…` AT THE FOOT -------------------------
   THE CAPTION SITS INSIDE THE BOX, over the answer (`.q-f` in style.css), rather than above it: it
   stays when something is chosen — a chosen `B` alone does not say which question it answered — and
   it costs no line of its own, which is three lines on an editor of three rows. The full value is the
   option's label, never shortened, and a value already saved that the list does not hold is kept as
   the chosen option, for the reason `fieldHtml` gives. The last option turns the select into a text
   box in place (the listener below), because a subject or a level may be one nobody listed.

   `mine` PUTS YOUR OWN SUBJECTS FIRST, under their own heading in the list — an `<optgroup>`, which
   the platform's own list draws as a caption over its options on every phone and laptop. Fifty-odd subjects is a scroll to reach Maths; a tutor adding a level to a subject
   they already hold is the commonest add there is. Only the first option matching the value is
   marked chosen, so the subject is ticked once, in your list. */
```

### ---------- THE NEXT BOX THE PERSON NEEDS, GIVEN THE FOCUS — NOT OPENED

top level, before `qualNext_`

```
/* ---------- THE NEXT BOX THE PERSON NEEDS, GIVEN THE FOCUS — NOT OPENED ---------------------------------
   THIS OPENED THE LIST, through `selOpen_` and the app's own panel (note 284: "a pick from a list is two
   taps: the field, then the answer"). A platform's list cannot be opened from script: `showPicker()`
   needs a tap of its own to ride on, which a timer after a `change` is not, and an iPhone does not offer
   it on a select at all. So the box is FOCUSED instead: its gold edge says where the next answer goes, a
   keyboard carries on from it, and a phone that draws its picker from focus shows it. One tap on the box
   opens it everywhere else. Without scrolling, because the line was scrolled into the pane when it was
   made. On the next turn, so the `change` or the press that asked has finished first (note 315). */
```

### ---------- AN ANSWER CHOSEN IS AN ANSWER SAVED

top level, before `t`

```
/* ---------- AN ANSWER CHOSEN IS AN ANSWER SAVED --------------------------------------------------------
   Only in an OPEN line, and only on `change` — a pick from a list, a box left after typing — never on
   each keystroke. A line being added asks for its level the moment it has a subject, which is the
   "subject, then level, in one step" the `+` tile promises — the level box takes the focus (`qualNext_`)
   — and it is saved once it has both. */
```

### PROGRAMMATIC CHANGES DO NOT FIRE `input`, so a card changed by a button marks itself dirty — see `settingsKeep_`:

top level, before `qualDirty_`

```
/* PROGRAMMATIC CHANGES DO NOT FIRE `input`, so a card changed by a button marks itself dirty — see
   `settingsKeep_`: a column holding an unsaved card is not redrawn under it. AN OPEN LINE COUNTS, even
   once everything in it is saved: the save itself calls `load()`, and the repaint that follows would
   otherwise shut the line between one answer and the next. */
```

### ---------- REDRAWN FROM WHAT THE BOXES HOLD

top level, before `qualRedraw_`

```
/* ---------- REDRAWN FROM WHAT THE BOXES HOLD ------------------------------------------------------------
   One renderer: the grouping, which line carries its subject, the pool, and whether the `+` has room
   are all `qualShelf_`'s answer from the values, so a line moved onto another subject joins it, a
   subject whose last line went is gone, and the tenth record turns the `+` off — with nothing here to
   keep in step. `over` is what goes back before the redraw (an open line's last saved answers, or a
   line never saved, emptied); `open` is the slot to open again in the new shelf. */
```

### WHAT SHUTTING THE OPEN LINE PUTS BACK:

top level, before `qualOver_`

```
/* WHAT SHUTTING THE OPEN LINE PUTS BACK: its last saved answers — a save that failed said so under the
   card, and leaving its answer in a shut line would post it unseen with the next one — or, for a line
   never saved, nothing at all, so it goes back to the pool. */
```

### THE LINE OPENS — and whatever else was open shuts first, as it was last saved.

top level, before `slot`

```
/* THE LINE OPENS — and whatever else was open shuts first, as it was last saved. A second tap on the
   open line is the tick.
   AN EMPTY SLOT IS A NEW QUALIFICATION. The pool's lines are not on the page, so nobody taps one — but
   a press can reach one (`check/press.js` presses every action in turn, and on a shelf with nothing
   saved every line it finds is in the pool), and a redraw that changes nothing is a control that does
   nothing. Opening an empty slot is what `+` does with the next one, so that is what it does. */
```

### ---------- THE TICK: ANYTHING NOT YET SAVED IS SAVED, AND THE LINE SHUTS

top level, before `slot`

```
/* ---------- THE TICK: ANYTHING NOT YET SAVED IS SAVED, AND THE LINE SHUTS -------------------------------
   Normally there is nothing left to save — every answer went when it was chosen — so this only shuts.
   It saves when a save failed (the answer is still in its box) or a box was typed in and the tick was
   the next thing touched. A line being added with no subject or no level is not a qualification yet,
   so it goes back to the pool unsaved, and the toast says so rather than leaving it to be guessed. */
```

### ---------- A PRESS THAT LANDS WHILE A SAVE IS OUT WAITS FOR IT

top level, before `QUAL_SAVING`

```
/* ---------- A PRESS THAT LANDS WHILE A SAVE IS OUT WAITS FOR IT ---------------------------------------
   *Walked at 320 and 390, every run:* type a school, then tap another line. The box's `change` is the
   save, it fires as the box loses focus — under the finger that is already on the next line — and the
   save locks the card. The line was disabled before its own click arrived, so the press was lost and
   the tutor tapped twice. The card's controls are `data-unlocked` now (see `send_`), and a press on one
   while a save is out is remembered and made AFTER the save answers, on the same control as the card
   is then drawn — the save may have redrawn it (a line that moved subject), so it is found again by
   its slot, its action and its answer rather than held. Only the last press is kept, which is what a
   second press means; and none is made if the save failed, because the refusal under the card is what
   the person needs to read next, not a line opening over it. One save at a time is still the rule:
   the boxes stay locked, and the queued press runs only once the lock is off. */
```

### ---------- ON A CARD BEING EDITED, AN ANSWER IS KEPT, NOT SENT

in `qualSave_`

```
/* ---------- ON A CARD BEING EDITED, AN ANSWER IS KEPT, NOT SENT --------------------------------------
     The shelf saves as it goes on Settings (note 284). On the card everything goes up together with the
     card's one Save (`card-save`), so here an answer is written into the card's draft and the line is
     told it was kept — `qualCommit_` and the bin carry on exactly as if the server had said yes, and a
     reload draws the shelf from the draft. Without this, every pick on the card would post the card. */
```

### ---------- ONE SAVE: THE CARD'S OWN

top level, before `qualCommit_`

```
/* ---------- ONE SAVE: THE CARD'S OWN ------------------------------------------------------------------
   `meSave_` gathers all seventy boxes and posts them through `send_`, so the tick spins and the card
   is locked while it is on the wire. Refused before anything is sent when the line has no subject or
   no level — the two things that make it a qualification — except for a line still being added, which
   is simply not saved yet. A line that moved subject, or was just added, is redrawn into its group and
   opened again there, so the next answer goes on where the person is. */
```

### A CERTIFICATE KEEPS NO GRADE AND NO TEACHING TICK — its editor has neither box to show, and an answer nobody can see is one nobody can take back.

in `qualCommit_`

```
/* A CERTIFICATE KEEPS NO GRADE AND NO TEACHING TICK — its editor has neither box to show, and an
     answer nobody can see is one nobody can take back. A line moved onto DBS from Maths sheds them here,
     before the comparison, so the move itself is what posts them empty. */
```

### THE THREE-WAY CONTROL, written into the two hidden boxes and saved.

top level, before `slot`

```
/* THE THREE-WAY CONTROL, written into the two hidden boxes and saved. Teach is Teach AND Can teach, which
   is the one rule `qualsIn` keeps; nothing here touches any other line, because *"when i tick teach for
   different levels of same subject it unticks the other one. i dont want that"*.
   A SHUT LINE'S CONTROL IS NOT ON THE PAGE, so a press that reached one anyway — one that raced a
   redraw, or `check/press.js` — opens that line first and then answers, rather than doing nothing. */
```

### ---------- `+`: A NEW LINE AT THE FOOT, ITS SUBJECT BOX READY

top level, before `shelf`

```
/* ---------- `+`: A NEW LINE AT THE FOOT, ITS SUBJECT BOX READY ------------------------------------------
   The subject box takes the focus rather than waiting to be found on a card that has just grown a line —
   see `qualNext_` for why it is focused and no longer opened. Scrolled into the pane first, because the
   next answer goes in a box that can be seen. */
```

### ---------- REMOVING SAVES AT ONCE

top level, before `qualRemove_`

```
/* ---------- REMOVING SAVES AT ONCE ------------------------------------------------------------------
   The line's seven boxes are emptied and the card is saved — an emptied slot is dropped by `qualsIn`
   and goes back to the pool on the redraw. If the save fails the boxes are put back, so the screen
   never shows a removal the sheet did not make. A line being added was never saved, so the bin only
   puts it back. */
```

### ---------- WHEN IT WAS RECEIVED, AND WHETHER YOU TEACH IT

top level, before `phoneRow_`

```
/* ---------- WHEN IT WAS RECEIVED, AND WHETHER YOU TEACH IT ------------------------------------
   *"remove the studying now widget. could be achieved if each qualification has a date of reception
   and present is an option"* — so a year, or `Present` for a course still running, which is what the
   studying page said in two boxes. A YEAR, NOT A DATE: nobody remembers the day a certificate came,
   and a `<select>` is one tap where a date picker is a calendar to page back through. A value the
   list does not hold (typed into the sheet) is offered anyway, so opening the page cannot lose it. */
```

### ---------- *"phone: have field for country code, then number."*

top level, before `phoneRow_`

```
/* ---------- *"phone: have field for country code, then number."* --------------------------------
   One cell (`phone`, "+44 7700 900123"); the server splits it into `phone_cc`/`phone_no` for the form
   (`phoneOut`) and packs it back (`phoneIn`), reading an old `07…` as UK. The codes come from the
   server (`DATA.phoneCodes`, off `PHONE_CODES`) so there is one list; `+44` is the floor for a
   deployment that has not sent one, and a code the list lacks is offered rather than lost. */
```

### ---------- ONE SHELF, ONE CARD PER LIBRARY

top level, before `libraryShelf_`

```
/* ---------- ONE SHELF, ONE CARD PER LIBRARY -----------------------------------------------------
   BUILT FROM THE FIELD LIST THE BACKEND SENT, not from a count written here. `LIBRARY_CARDS` is a
   constant in `constants.gs` and the nine names are derived from it there; a `3` written again on
   this side would be the second copy this repository keeps paying for — and a fourth library would
   then draw three cards and silently drop the fourth's answers on every save.

   THE NAME IS THE WIDE ONE. A borough's name is words and a PIN is four digits, so the row is
   `1fr` and `max-content`; the card number is its own line because it is the longest thing on the
   shelf and the one somebody reads back digit by digit.

   NO `<h4>` PER CARD. A heading per library is three more lines of chrome on the group that could
   not fit in the first place; the name box IS the heading, and its own caption says so.

   ---------- AND EACH ONE IS DRAWN AS THE CARD IT IS (docs/history/332) ----------------------------
   THE OWNER, 10 Oct, with a screenshot of this page — three entries, each a name box with a PIN box
   beside it and a number box under them: *"make each look like a card. with fake barcode."* So a slot
   is a library card now, at a bank card's proportions (85.6 by 54, the ID-1 size most library cards
   are printed at too) and on the PAPER palette, because it stands in for a thing you hold: `LIBRARY CARD`
   small at the top left, the library's name large under it, the PIN small at the top right under its
   own `PIN`, and along the bottom a barcode with the number printed under it, as on the real one.

   THE THREE BOXES ARE STILL THE THREE BOXES. They sit ON the card, borderless and in its ink, so the
   card is edited where it is read — there is no second view of it to keep in step. Every box is still
   `fieldHtml`'s, with the same `data-me` name, so `meSave_` posts exactly the fifteen fields it always
   did, `shelfSlots_` still decides which slots show and `Add another` still reveals the next, and the
   draft rule is untouched: `setDraftOk_` still refuses every `libN_` box, because the PIN is on the card.
   `spellcheck="false"` on all three because a red squiggle under a borough's name is not printed on
   any card; `autocomplete="off"` on the number and the PIN, which are this card's and nobody else's.

   EACH BOX KEEPS A NAME A SCREEN READER CAN SAY. The PIN's is its visible `PIN` caption — `fieldHtml`'s
   own `<span>` inside its `<label>`, so the caption on the card and the name read out are one string.
   The name and the number say what they are in their placeholders while empty and keep saying it
   through an `aria-label` once filled, when the placeholder has gone. `LIBRARY CARD` names the whole
   card as a group, so it is `aria-hidden` itself rather than read twice.

   THE PIN'S PLACEHOLDER IS ONE SPACE, deliberately. Its caption already says `PIN`, and any hint
   in the box — `0000`, four dots — reads on a card as a PIN somebody saved. The space is only there
   so `:placeholder-shown` can draw the empty box's dashed line (style.css, `.lib-face`): the one box
   on the card with no words in it while empty says "write here" without a border. The other two say
   it in their placeholders. */
```

### ---------- THE BARCODE IS A PICTURE OF ONE, AND NOT ONE

top level, before `libBarsOf_`

```
/* ---------- THE BARCODE IS A PICTURE OF ONE, AND NOT ONE ---------------------------------------------
   *"with fake barcode"* — the owner's word, and it is meant. These bars are NOT a symbology: not
   Codabar or Code 39 (what library cards commonly print), not EAN — no start and stop characters a
   reader knows, no check digit, nothing a scanner at a library desk could decode. A barcode that only
   LOOKED valid would be worse than a plainly fake one: somebody holding this page up to a self-service
   kiosk is told nothing by a scan that fails. So it is decoration and is marked as such
   (`aria-hidden`), and the number under it is the thing that is real.

   WORKED OUT FROM THE NUMBER, so every card looks like its own and the same number always draws the
   same bars. `hashOf` (core.js, FNV-1a) of the number seeds a xorshift stream, and the stream picks
   each bar 1 to 4 modules wide and each gap 1 to 3, between two thin guard pairs, until the code is
   about ninety modules long. One changed digit changes every bar, which is what makes three cards
   on one page read as three. NO NUMBER is an even placeholder — two on, two off — drawn faint by the
   stylesheet (`.is-blank`), so an empty card does not look as though it holds a number.

   ONE `<path>`, because thirty-odd `<rect>`s per card is ninety elements on this page for one picture,
   and `currentColor` so the ink is the card's (`--paper-ink`) and never a literal. The viewBox is the
   modules across and one unit down, stretched to the box by `preserveAspectRatio="none"`;
   `crispEdges` so a one-module bar is not smeared across two device pixels. */
```

### ---------- AND A CARD GIVES UP ITS BLANK BAND BEFORE THE PAGE IS DRAWN SMALLER

top level, before `libFit_`

```
/* ---------- AND A CARD GIVES UP ITS BLANK BAND BEFORE THE PAGE IS DRAWN SMALLER ----------------------
   A FACE'S HEIGHT FOLLOWS ITS WIDTH, so the page is as tall as the column is wide, and the pane's fit
   rule (`paneReach_`, find.js) answered every card past three by drawing the WHOLE page smaller —
   boxes, tick and `Add another` with it. The review of 10 Oct measured it against 6758e2f, whose
   two-row boxes drew five at full size at 390x844: four cards took the page to 81% there and five to
   70% (the tick 36px, then 31px), and pressing `Add another` re-zoomed the page under the finger. At
   1280x800 it was worse — a laptop's column is wide, so three cards were 81% and four scrolled at the
   floor. Every one of those cards had the band between its name and its bars blank: 45px at 390,
   68px at 1280.

   SO THE CARDS GIVE THAT BAND BACK FIRST, as an essay's sheet gives its spare lines (`kpSheetFit_`):
   called by `paneReach_` at zoom 1 before it measures, this narrows every face on the shelf by what
   takes the page back inside its pane, never past where its blank band runs out. A NARROWER CARD AND
   NOT A SHORTER ONE: `aspect-ratio` keeps the bank card's 85.6:54, so a face is shorter only by being
   narrower, and its bars and name (in `cqw` of it) come down with it; it stays centred, and `Add
   another` takes the cards' width (`--lib-w`, style.css). Whatever the bands cannot give is left to
   the fit rule, as before — five cards at 390 are still drawn a little smaller, and 320x568 has
   almost no band to give, so there the card still all but fills the width and the page is drawn at
   the zoom 332 records. Nothing over: the property comes off and the card fills the column.

   UP TO THREE PASSES, because the band grows as the card narrows — the bars are `15cqw` tall, so a
   narrower card has shorter bars and a little more blank — and one pass sized from the full-width
   band leaves some of it unspent. Each pass is one forced layout of this pane alone, and only a pane
   holding a library card is asked. In a try: a shelf that cannot be measured keeps the column's width. */
```

### ---------- AND A GROUP OF `photos_N` NAMES IS A SHELF OF PHOTOGRAPHS

top level, before `isPhotoField_`

```
/* ---------- AND A GROUP OF `photos_N` NAMES IS A SHELF OF PHOTOGRAPHS ----------------------------
   ASKED FOR AS *"theres only 1 photo link slot it seems like. tutors should be able to add more
   pics."* The library shelf a third time, recognised by the SHAPE of the names as the other two are:
   what is filled in, and an `Add another` under it — eight boxes drawn at once would be most of a
   phone of empty links. The backend packs them into `photos` (`photosIn` in core.gs); `photo` stays
   the face on the card and is the ordinary box above the shelf.

   A THUMBNAIL BESIDE EACH LINK, because a link is a string nobody can check by reading it. A Drive
   address that is not shared, or one pasted from the wrong tab, draws as a broken square here —
   which is the moment to find out, rather than on the public card after Save. `pic()` is the same
   rewrite the card uses, so what previews is what will be drawn. */
```

### `o.draft` IS PASSED THROUGH TO THE BOXES — the card editor keeps its own draft (`fieldHtml`'s note).

top level, before `photoShelf_`

```
/* `o.draft` IS PASSED THROUGH TO THE BOXES — the card editor keeps its own draft (`fieldHtml`'s note).
   AND THE THUMBNAILS ARE FETCHED AT ONCE, NOT `loading="lazy"`. The owner, 10 Oct: *"these remain loading
   untill i scroll to them. i dont like this"*. The shelf is drawn on a tutor's card being edited now
   (docs/history/330), a form about two thousand pixels tall in a pane that scrolls, so the three thumbs
   sat a screen and a half below the fold and were not even asked for until scrolled to — an empty square
   beside a link, which reads as a broken picture rather than one on its way (measured at 320x568: three
   thumbs at y 898–997, no request in three seconds). There are at most eight, each beside the link it
   checks; "is this link a picture" is the shelf's whole point, and it is answered before the scroll. */
```

### ---------- YOUR PICTURE, CHOSEN RATHER THAN LINKED

top level, before `photoPicker_`

```
/* ---------- YOUR PICTURE, CHOSEN RATHER THAN LINKED ---------------------------------------------
   A SQUARE PREVIEW, `Choose photo` AND `Remove`. The preview is what the picture will be — the
   photograph cropped square, one of the pictures, your figure, or with none the initial, which is the
   same letter the card draws. Square because a photograph on this site is square (the camera's still,
   a post's grid, the photo shelf's thumbnails); the card rounds it into its circle itself.

   TILES, BECAUSE THIS IS A THING — your picture — and the two actions are actions ON it, not the
   buttons of a form: each saves itself, there is nothing to fill in first, and the card's own Save
   does not touch it. The file input is hidden and `Choose photo` opens it, which is how the camera's
   `Photos` side opens its own; `accept="image/*"` with no `capture`, so a phone offers the gallery
   AND the camera rather than forcing one.

   ---------- AND UNDER THEM, ELEVEN TO CHOOSE FROM, AS AN XBOX GAMERPIC PICKER HAS -------------------
   THE OWNER, 10 Oct: *"everybody profile picture selector should have 10 basic profile pics like xbox
   dp selector, which allow you to use your avatar as a dp."* FIRST your own figure — drawn live by
   `avatarFor`, so it is wearing whatever the wardrobe card has on it right now — THEN the ten
   pictures (`PFP_ART`, links.js). For everybody: a student, a parent, a tutor and an admin all draw
   this card, because every role's group list names `photo`.
   A TAP SAVES AT ONCE, like Choose photo, and the card's Save does not touch it. A GOLD RING marks the
   one in use. They are BUTTONS rather than tiles because they are the answer being chosen, not actions
   on it — the keypad's keys and a multiple-choice question's options are the house's other two, and
   the wardrobe's own squares a third.
   44px EACH, IN PIXELS (CLAUDE.md: a fingertip is the same size on every screen): four to a row in a
   320 card, six where there is room — see `.pfp-grid`.

   ONE LINE UNDER THE GRID says what happened, the `.me-said` of every other card. `said` is what to
   put there when the picker is redrawn after a save; left out, it says what the picture is now. */
```

### THE PREVIEW IS `personFace_` LIKE EVERY OTHER FACE, so what you see here is what everybody else's card draws — which is why the wardrobe figure is no longer

top level, before `pfpFace_`

```
/* THE PREVIEW IS `personFace_` LIKE EVERY OTHER FACE, so what you see here is what everybody else's
   card draws — which is why the wardrobe figure is no longer the preview of NO picture: that was a
   face only you saw (the card has always drawn the initial), and your figure is now a picture you
   can actually choose, in the grid, for everybody. */
```

### ---------- A REFUSAL KEEPS THE OLD PICTURE AND SAYS SO

top level, before `PFP_SINCE`

```
/* ---------- A REFUSAL KEEPS THE OLD PICTURE AND SAYS SO ---------------------------------------------
   `send_` has already written the server's own sentence on the line; this adds that nothing changed.
   AND WHY, WHILE THE SERVER IS OLDER THAN THE PICTURES. A backend from before them answers a tapped
   fox "That is not a picture. Choose a photo from your phone." — true of its own door, and baffling
   under a fox. So when the payload's stamp is a date older than this build's, the line says the
   pictures are waiting on the server rather than leaving somebody to tap all eleven. A stamp that is
   not a date (the lab's `fixture`) is never called old. ONLY FOR A TAP IN THE GRID (`chose`): a refused
   photograph or Remove is the old server's own door, and its own sentence already says why. */
```

### ---------- SQUARE, AND SMALL ENOUGH TO POST

top level, before `PFP_SIZE`

```
/* ---------- SQUARE, AND SMALL ENOUGH TO POST ------------------------------------------------------
   `camItemOf_` FIRST, which is the camera's own reader — it turns whatever the phone hands over
   (a 12-megapixel original, a PNG screenshot, a HEIC the browser can decode) into a JPEG no more than
   1600px long. Then the middle square of that, drawn at no more than 600px: a face on a card is 52px
   and a full-width preview is 390, so 600 is crisp on a 3x screen and about 60KB on the wire, where
   the original would be four megabytes through Apps Script for the same picture.
   THE MIDDLE, NOT THE TOP. A portrait's face is usually in the upper half, and a top crop would be
   right for those and cut the head off every landscape; a centre crop is never badly wrong, and the
   preview shows exactly what was kept before anybody else sees it. Answers `null` for anything it
   cannot read, and never rejects. */
```

### WHAT THE SERVER SAID THE PICTURE NOW IS, written everywhere this phone keeps it:

top level, before `pfpTake_`

```
/* WHAT THE SERVER SAID THE PICTURE NOW IS, written everywhere this phone keeps it: your profile (what
   the Settings page reads), `USER.photo` (what your own card on the You column is built from when you
   have no tutor row — it was never written here, so a parent's new picture stayed off their own card
   until they signed in again), the remembered sign-in (what the next visit reads before the network),
   and any row of the payload that is you, so your own card changes too rather than waiting for the
   next load. A row whose face is now your figure carries your figure, as the server's `faceFig_` does,
   and one that stopped being it loses it. Then the picker is redrawn from it, with `said` on its line,
   and the You column is drawn again so your card is the new face when you swipe to it. */
```

### NOT WHILE THE PICKER IS ON YOUR OWN CARD'S EDIT (docs/history/339) — which is where it is now, for everybody.

in `pfpTake_`

```
/* NOT WHILE THE PICKER IS ON YOUR OWN CARD'S EDIT (docs/history/339) — which is where it is now, for
     everybody. There your card IS the form, so there is no face on the column to bring up to date until the
     form shuts, and Save and Cancel both draw the column again as they shut it (`cardClose_`). A paint here
     rebuilt the whole form from its copy of your profile, under the person choosing: the line just written
     ("Saved. …") went back to its standing sentence before it was read. Asked BEFORE the picker is
     replaced above — the old element is out of the document afterwards, and is in no card at all. */
```

### ---------- ONE OF THE ELEVEN, TAPPED

top level, before `box`

```
/* ---------- ONE OF THE ELEVEN, TAPPED ----------------------------------------------------------------
   `savePhoto` WITH `choice` — the same action as a photograph, because it is the same cell and the same
   rule (your own row, by the token; `self` in `ACTION_ACCESS`). The preview and the ring move before
   the reply, as a chosen photograph's preview does, so the choice is seen while it travels; a refusal
   puts both back and the line says what the server said and that nothing changed. A tap on the one
   already in use sends nothing. WHAT IS KEPT IS WHAT THE SERVER ANSWERS, not what was tapped — a reply
   naming another picture is drawn as that picture and said, rather than the tap being believed. */
```

### THE PREVIEW CHANGES BEFORE THE UPLOAD, so the crop is seen while it travels; if the server refuses, the line says why and the old picture comes back.

top level, before `face`

```
/* THE PREVIEW CHANGES BEFORE THE UPLOAD, so the crop is seen while it travels; if the server
       refuses, the line says why and the old picture comes back. The ring comes off the grid for the
       same moment — a photograph is none of the eleven. */
```

### THE HOUR CODES, WHEREVER THE BACKEND PUT THEM.

top level, before `availCodes_`

```
/* THE HOUR CODES, WHEREVER THE BACKEND PUT THEM. The group's title is the backend's to choose, so
   this looks for the shape rather than for a name — and answers an empty list when no deployment
   has sent one, which is what the widget reports instead of drawing a week with no hours in it. */
```

### ---------- AND WHAT A GROUP HEADING IS DEPENDS ON THE SURFACE, SO THE SURFACE SAYS

top level, before `fieldsHtml`

```
/* ---------- AND WHAT A GROUP HEADING IS DEPENDS ON THE SURFACE, SO THE SURFACE SAYS --------------
   IT ALWAYS EMITTED `<h2>` and that was right while the only caller was a sheet: `#sheet-body h2`
   is a section marker with no rules above or below it, because the sheet is one thing rather than a
   list of things. The settings column is a list of things, one group per card — and on a screen an
   `<h2>` is something else entirely: `.screen h2` draws a full-width rule above and below with a
   `> ` prompt in front, which inside a card is a section divider where a title belongs.

   IT IS ALSO WHAT `split_` CUTS ON. `check-dead.js` states the rule outright — "a heading inside a
   card is an h3, a heading between cards is an h2" — and names the screenshot it took to find it
   the last time an `<h2>` sat in the You card and quietly cut it in two.

   ONE OPTION, DEFAULTING TO WHAT IT ALWAYS DID, which is the same move `me-save` makes two hundred
   lines down: the caller knows which container it is, and asking it is cheaper than a second
   renderer that differs by one tag. */
```

### THE SHELF, THEN WHATEVER ELSE IS IN THE GROUP.

in `fieldsHtml`

```
/* THE SHELF, THEN WHATEVER ELSE IS IN THE GROUP. The shelf takes the card fields and the rest
       of the list is drawn under it in the usual way — one `filter`, rather than a second group in
       the backend that would then need a heading of its own. (`library_note` used to be that rest;
       it is filtered off the list above — see `RETIRED_FIELDS_`.) */
```

### ---------- AND THE THREE DATE BOXES, WHICH REPLACE ONE FIELD RATHER THAN JOINING IT

in `fieldsHtml`

```
/* ---------- AND THE THREE DATE BOXES, WHICH REPLACE ONE FIELD RATHER THAN JOINING IT --------
       `date_of_birth` IS STILL IN THE GROUP because the backend's list names columns and that is
       the column. Drawing it as well as the three boxes would be the same fact twice on one card —
       the roster's `<h3>` over every widget's own heading, one form along — and the extra box would
       post a fourth value that `wanted` would happily write straight over what the boxes just said.
       So it comes OUT of `rest` and the row goes in its place. */
```

### EITHER SHAPE. The backend's group list names COLUMNS, so today it says `date_of_birth` — and `isDob_` is asked as well so a deployment that ever sends the

in `fieldsHtml`

```
/* EITHER SHAPE. The backend's group list names COLUMNS, so today it says `date_of_birth` — and
       `isDob_` is asked as well so a deployment that ever sends the three box names draws the same
       row rather than three bare boxes. One test, both spellings, which is the `isTimetable_`
       argument: a renderer that recognises only what is sent today stops recognising it the day
       the backend is tidied. */
```

### THE PHONE, AS A CODE AND A NUMBER — the birthday's arrangement:

in `fieldsHtml`

```
/* THE PHONE, AS A CODE AND A NUMBER — the birthday's arrangement: `phone` is the column the
       group names, the two boxes are what is drawn, and it comes out of `rest` so it is not drawn
       twice. Drawn where `phone` sat in the list rather than at the foot. */
```

### ---------- AND `photo` IS A PICTURE YOU CHOOSE, NOT A LINK YOU PASTE

in `fieldsHtml`

```
/* ---------- AND `photo` IS A PICTURE YOU CHOOSE, NOT A LINK YOU PASTE ------------------------
       ASKED FOR AS *"everyone should have a profile picture selector widget in account settings"*.
       It was a text box captioned `photo link`, so the only way a picture on your phone became your
       face was to upload it somewhere, share it, copy the address and paste it here — which nobody
       but an admin knew how to do. `photoPicker_` is drawn where the box was and saves itself
       through `savePhoto`, so it comes OUT of `rest`: a hidden `data-me="photo"` beside it would be
       posted by the card's Save with whatever address the page was drawn with, and would write the
       old picture back over the one just chosen.
       ONLY ON `data-me`, the one surface that edits YOUR OWN row — the picker posts to the signed-in
       person's cell whatever form it sits in, so on any other editor it would be the wrong row. */
```

### THE HOURS YOU CAN TEACH, AS A THING YOU OPEN.

top level, before `initAvail`

```
/* ==================================================================================================
   THE HOURS YOU CAN TEACH, AS A THING YOU OPEN.

   IT ALREADY WORKED AND IT WAS ALREADY UNFINDABLE. A tutor's availability is a real column, it is
   written by `me-save`, and the booker has read it since it was written — an hour nobody has
   ticked comes up greyed in the booking week with "not available" beside it. What was missing is
   the door: it sat inside *Your details*, below About you, Where and Contact, so reaching it meant
   knowing it was there.

   A TOOL IS NOT A THING YOU FIND, IT IS A THING YOU OPEN, which is the sentence this repository
   already writes about the calculator and the timer — and the Tools column is where the sixteen
   of them live, one card per page. This is the seventeenth.

   NOT A TENTH SCREEN. A column of its own is a screen every parent and every student swipes past
   holding something only a tutor may use, and `widgetsOf_` already gates the flyer maker on a
   flag. One more flag is cheaper than one more screen, and it puts the tool in the search as well.

   IT STAYS IN THE DETAILS SHEET TOO, and that is not a second copy: `fieldsHtml` and this widget
   both call `availGrid_`, so there is one grid, answered in one place, saved by one handler. Which
   is the point — a tutor who goes looking in their own details still finds it where it was. */
```

### THE BACKEND HAS NOT SENT THE HOURS, WHICH IS NOT THE SAME FACT AS A TUTOR WHO HAS TICKED NOTHING — and drawing an empty week for the first would be this

in `initAvail`

```
/* THE BACKEND HAS NOT SENT THE HOURS, WHICH IS NOT THE SAME FACT AS A TUTOR WHO HAS TICKED
     NOTHING — and drawing an empty week for the first would be this repository’s oldest fault:
     *I did not manage to look*, printed as *I looked and there was nothing there*. A deployment
     older than `profileFields` says so and offers the sheet, which is where it used to live. */
```

### ---------- AND WHILE THE PAYLOAD IS ON ITS WAY, THAT IS A WAIT, NOT THE OLD SERVER

in `initAvail`

```
/* ---------- AND WHILE THE PAYLOAD IS ON ITS WAY, THAT IS A WAIT, NOT THE OLD SERVER -------------
     The hours are named by the payload's `profileFields`, so before it lands there are none to draw,
     and this said "The hours have not arrived from the server yet" — the right words for a server
     older than `profileFields`, where they never will, and a wait in words of its own for every
     other tutor for the fifteen seconds the payload takes. The owner, 9 Oct: *"They should all have a
     simplistic simple loading thing."* So the wait is `loading_()` (shell.js); this widget's `start`
     runs again on the payload's repaint, which draws the week in its place. The sentence is kept, in
     its own words, for the payload that came without them — an older server, or one that failed —
     where it is a fact rather than a wait. */
```

### YOUR LIBRARY CARDS, A TOOL (docs/history/339)

top level, before `libCardsDraw_`

```
/* ==================================================================================================
   YOUR LIBRARY CARDS, A TOOL (docs/history/339)

   THE OWNER, 11 Oct: *"move library card widget to the tools column."* They were a page of Settings — the
   `Library cards` group every role's map carries — and they are a widget on Tools now (`libcards` in map.js),
   for exactly the people who saw that page: everybody signed in (`signedIn` in `widgetFor_`). EVERYTHING ABOUT
   THEM IS WHAT 332 MADE IT: the shelf is `libraryShelf_` (a bank card's face each, the fake barcode, the three
   boxes on it, `Add another`, `libFit_` giving the blank band back before the pane is drawn smaller), the tick
   is `me-save`, and what it posts is the fifteen `libN_*` fields through `updateProfile`, written by the same
   `writeOwnRows_` into the same tab. No drafts, by design — `setDraftOk_` still refuses every `lib` box,
   because the PIN is on the card.

   IN A `.me-form`, BECAUSE THAT IS WHAT MAKES IT A CARD THAT HOLDS TYPING: `meSave_` gathers the form, `send_`
   locks it, `KEEP_FORMS_` marks it dirty, and `settingsKeep_` holds the column while it is — so the payload or
   `myProfile` landing does not redraw a half-typed card back to the sheet's copy (the reason Settings is held,
   one column along; a library card has no draft to come back from). AND A START DOES NOT DRAW OVER IT: a
   widget is started again on arrival and on a repaint, and a `start` that redrew a dirty or sending form would
   throw away exactly what the hold kept.

   WHICH FIELDS IS THE SERVER'S: the library names in the map your role edits (`myGroups_`, `libFieldsOf_`).
   While the payload is coming there are none to draw — the one loader (`loading_`), and the payload's repaint
   starts this again; a payload that came without them is an older server, which is said in words. */
```

### AN OLDER SERVER, SAID AS ONE — `OLD_SERVER_SAY_`, the card editor's sentence for the same case.

in `libCardsDraw_`

```
/* AN OLDER SERVER, SAID AS ONE — `OLD_SERVER_SAY_`, the card editor's sentence for the same case. It said "have
     not arrived from the server yet", under a payload that had arrived and would never carry them: a promise
     the page could not keep (the review of docs/history/339). Not hidden instead: a widget that comes and goes
     with the payload would move every Tools page behind it, which is why it is appended last at all. */
```

### EVERY COPY ON THE PAGE — Tools' and, starred, Saved's — for `myProfile` landing (`profileRefresh_`):

top level, before `libCardsRedraw_`

```
/* EVERY COPY ON THE PAGE — Tools' and, starred, Saved's — for `myProfile` landing (`profileRefresh_`): the
   cards are drawn from `USER.profile`, and a copy drawn from the sign-in reply's must take the sheet's. The
   same id twice is the starred-widget rule (`$`, data.js), so it is asked of the attribute, not `$()`. */
```

### ---------- ONE SAVE, TWO SURFACES, AND THE DOM SAYS WHICH

top level, before `meSave_`

```
/* ---------- ONE SAVE, TWO SURFACES, AND THE DOM SAYS WHICH ---------------------------------------
   THIS READ `#sheet-body [data-me]` AND CALLED `closeSheet()`, both of which were right while the
   details sheet was the only place a `data-me` box could be. The availability tool on the Tools
   column draws the same boxes on an ordinary card — so a document-wide query would have gathered
   whichever surface happened to be open as well, and `closeSheet()` would have dismissed whatever
   else somebody had up.

   ASKED OF THE DOM RATHER THAN REMEMBERED IN A FLAG, which is exactly what `msg-send` already does
   with `form.closest('#sheet')`: the Save button knows which container it is in, so it gathers
   that one and closes the sheet only when it is in one. A second handler would have been a second
   copy of the whole round trip.

   AND THE STATUS LINE IS A CLASS, NOT AN ID. Two surfaces carrying `id="me-said"` is two elements
   with one id and `$()` handing both Save buttons the first of them — the `$('msg-text')` bug this
   repository already records, which would have written "Saving…" onto the wrong card. */
```

### ---------- THE SAVE ITSELF, LIFTED OUT SO THE QUALIFICATION EDITORS CAN CALL IT

top level, before `meSave_`

```
/* ---------- THE SAVE ITSELF, LIFTED OUT SO THE QUALIFICATION EDITORS CAN CALL IT ---------------------
   The qualifications card has no Save tile: each answer on it is saved as it is chosen (see
   `qualShelf_`). So the round trip is a function both call rather than a second copy of it, and it
   answers whether the card was kept — `true` once the server has said so, `false` for a refusal said
   here or there — so a line can take its next answer on a yes and keep the unsaved one in its box,
   for the tick to try again, on a no. */
```

### AND A THIRD SURFACE, WHICH IS THE SETTINGS COLUMN.

in `meSave_`

```
/* AND A THIRD SURFACE, WHICH IS THE SETTINGS COLUMN. Each group the backend sends is a card of
     its own there with its own Save, so the container has to be that card's form and not the
     document: `document.body` would gather the profile fields AND the seventy-seven hour codes on
     the page below, and `availGridIn` rebuilds the whole availability cell from whatever hour codes
     arrive — so a Save on "About you" would post half a week and erase the other half. */
```

### A QUALIFICATION WITH NO SUBJECT.

in `meSave_`

```
/* A QUALIFICATION WITH NO SUBJECT. `Add a subject` left unnamed saved as `:GCSE::8` — a card with
     no name that never counted towards what you teach. Said here, before anything is sent, because
     dropping it on the server would be something typed and gone under a toast saying Saved. */
```

### ASKED OF EACH SLOT: its `qual_N` box (the subject's select) is the name that is saved, and any visible box with an answer in it is a qualification.

in `meSave_`

```
/* ASKED OF EACH SLOT: its `qual_N` box (the subject's select) is the name that is saved, and any
     visible box with an answer in it is a qualification. Hidden boxes are skipped because Teach and
     Can teach are hidden and always hold a word. */
```

### ---------- NOT FROM A COPY OF YOUR SETTINGS THAT CANNOT BE TRUE

in `meSave_`

```
/* ---------- NOT FROM A COPY OF YOUR SETTINGS THAT CANNOT BE TRUE ------------------------------
     THE SIGN-IN REPLY SENT THE RAW CELLS FOR MONTHS, so every phone signed in before it was repaired
     holds a profile with no phone boxes, no birthday boxes and an empty qualification shelf — and a
     Save from that form writes those blanks over the sheet. `profileOf_` always sends `phone_cc`, so
     its absence is the one test that tells the broken shape apart. Nothing is sent from it; the
     sheet's own copy is asked for, and the form is redrawn from that. */
```

### ---------- AND WHEN THE SERVER IS OLDER THAN THIS SITE

in `meSave_`

```
/* ---------- AND WHEN THE SERVER IS OLDER THAN THIS SITE -----------------------------------------
     REPORTED FROM THE LIVE SITE AS "the account settings stuff isnt saving. its saying action not
     recognised". The site had been published and the Apps Script had not been updated, so the
     server had never heard of `myProfile` — and this guard asked for it before every save from an
     old-shaped copy, which on an old server is every save, and showed the server's raw sentence.
     The site and the backend land days apart whichever is deployed first, so each has to work
     against the other's older version.
     SO AN OLD SERVER SAVES THE OLD WAY, EXCEPT WHERE THAT WAS THE DANGER. A card of plain fields —
     names, a photo link, a borough — is posted exactly as it always was. A card holding a PACKED
     field (the phone's two halves, the birthday's three boxes, the qualification shelf, library
     cards, the week of hours) is the one this guard exists for: drawn from a copy without the
     expanded values, its boxes are empty, and posting them writes blanks over the sheet. That card
     is refused with a sentence saying what to update, rather than the server's. */
```

### `send_`, NOT `api()`.

in `saveNow`

```
/* `send_`, NOT `api()`. `api()` resolves with whatever the server said, and this disabled only the
     button: no spinner, every box still live, and a headline edited while the request was on the
     wire was silently lost — measured. `send_` spins the button, locks the card's boxes, puts them
     back afterwards, and writes a refusal into this card's own line. */
```

### THE SERVER'S OWN READING OF THE ROW, NOT WHAT WAS TYPED.

in `saveNow`

```
/* THE SERVER'S OWN READING OF THE ROW, NOT WHAT WAS TYPED. `updateProfile` answers with
         `profileOf_` of the row after the write — the phone repacked, the specialism derived from the
         ticks, a birthday normalised — so the next Save starts from the sheet. An older backend sends
         no profile, and the typed fields are merged as they always were. */
```

### AND THE PROGRESS COLUMN, whose journey card counts down to the two exam dates on About you (`progressRedraw_`, js/arcade.js) — not left to the payload this

in `saveNow`

```
/* AND THE PROGRESS COLUMN, whose journey card counts down to the two exam dates on About you
         (`progressRedraw_`, js/arcade.js) — not left to the payload this Save asks for, which can be
         half a minute away while the student swipes over to see the new count. */
```

### ---------- "SAVED" IS NOT THE WHOLE STORY WHEN AN ADDRESS WAS TYPED

in `saveNow`

```
/* ---------- "SAVED" IS NOT THE WHOLE STORY WHEN AN ADDRESS WAS TYPED ---------------------------------
         A new address waits to be proved, or was sent a fresh link (`updateProfile`), and "Saved" over a box
         still showing it reads as done. The server's sentence, in the toast and on the line under the card. */
```

### NOT ON THE QUALIFICATIONS CARD, WHICH SAVES ON EVERY ANSWER.

in `saveNow`

```
/* NOT ON THE QUALIFICATIONS CARD, WHICH SAVES ON EVERY ANSWER. *Walked:* after its first answer the
         line under it said "Saved" for the rest of the session — through a reload, under ten untouched
         lines — beside the toast saying the same, and it cost the card a line. There the toast is the
         receipt and the line is for a refusal only, so a success CLEARS it: the refusal from a save that
         failed is not left standing under the one that worked. */
```

### THE CARD IS REDRAWN WHEN AN ADDRESS WAS TYPED — the line under the box and the tile beside Save come and go with a waiting address, and nothing else repaints

in `saveNow`

```
/* THE CARD IS REDRAWN WHEN AN ADDRESS WAS TYPED — the line under the box and the tile beside Save
         come and go with a waiting address, and nothing else repaints this card when the Save changed no
         cell. The sentence is written again on the card that replaces this one. */
```

### THE PUBLIC CARD IS BUILT BY `doGet`, so it only moves when the payload does — but only when something was written.

in `saveNow`

```
/* THE PUBLIC CARD IS BUILT BY `doGet`, so it only moves when the payload does — but only when
         something was written. A Save that changed nothing writes nothing and leaves the stored
         payload alone, so fetching it again would be a full rebuild to learn nothing. `changed` is
         absent from an older backend, which is treated as "something changed", as before. */
```

### ---------- "SAVED" SURVIVES THE REPAINT IT CAUSES

top level, before `sayAfterLoad_`

```
/* ---------- "SAVED" SURVIVES THE REPAINT IT CAUSES ------------------------------------------------
   A Save that wrote something calls `load()`, and the repaint rebuilds the card — so the line
   under it that had just said "Saved" (or "You were patparent.") was back to its default within a
   second, and only the toast was left saying anything. The line is written again on the rebuilt
   card, found by where it is rather than by the element that no longer exists. */
```

### ---------- WHICH SETTINGS CARDS HAVE SOMETHING TYPED INTO THEM

top level, before `KEEP_FORMS_`

```
/* ---------- WHICH SETTINGS CARDS HAVE SOMETHING TYPED INTO THEM -----------------------------------
   A CARD IS DIRTY FROM ITS FIRST KEYSTROKE UNTIL IT IS SAVED, and while any card on the column is,
   `paint` leaves the column alone — see the note there. Marked from the events rather than by
   comparing each box with its `defaultValue`, because the qualification shelf and the
   several-of-a-list field keep their answer in a HIDDEN input, whose `value` and `defaultValue` are the same
   attribute: a comparison would call a picked subject clean. */
```

### AND THE BUSINESS COLUMN BY THE SAME RULE.

top level, before `KEEP_FORMS_`

```
/* AND THE BUSINESS COLUMN BY THE SAME RULE. Its five cards are `.me-form`s that moved out of Settings
   (js/records.js) and they were kept by these lines there: `bizFillAll_` leaves a card with
   `data-dirty` alone when the records land, and `paint` leaves the column alone while one is. Scoped
   to `#s-settings` alone, a provider typed before the records arrived would have been written over by
   them, and a payload landing would have redrawn the column under the typing. */
```

### AND THE YOU COLUMN, WHILE A CARD ON IT IS BEING EDITED (`cardEditHtml_`) — the same rule for the same reason:

in `settingsKeep_`

```
/* AND THE YOU COLUMN, WHILE A CARD ON IT IS BEING EDITED (`cardEditHtml_`) — the same rule for the
     same reason: the payload landing, the inbox landing and `myProfile` landing each repaint it, and
     a card rebuilt under the typing loses the caret, an open qualification line and an open list. Held
     from the first keystroke until Save or Cancel, and while its Save is on the wire. */
```

### ---------- YOUR SETTINGS, AS THE SHEET HOLDS THEM

top level, before `PROFILE_ASKING`

```
/* ---------- YOUR SETTINGS, AS THE SHEET HOLDS THEM ------------------------------------------------
   `USER.profile` WAS WRITTEN ONCE, BY THE SIGN-IN REPLY, and then kept for the thirty days a session
   lasts — so a change made on another phone, by an admin, or typed into the sheet never reached this
   form, and the next Save posted this phone's old copy back over it. `myProfile` is the backend's
   `profileOf_` of the row the TOKEN resolves to, asked once per app open (see `load()`), and whenever
   a Save finds a copy it cannot trust. A POST rather than a key on the payload: the payload is cached
   and shared, and this carries a birthday, a phone number and library-card PINs. */
```

### ---------- AN ANSWER OLDER THAN WHAT THE PHONE NOW KNOWS IS NOT PAINTED

in `profileRefresh_`

```
/* ---------- AN ANSWER OLDER THAN WHAT THE PHONE NOW KNOWS IS NOT PAINTED -----------------------------
         FOUND BY ROUND THREE OF THE PR #130 REVIEW: at start-up this request and the confirmation link's
         run side by side, and when this one answered second it put back "still waiting" — the held card
         stayed under a toast saying "you can make your child's account now", until the next refresh. The
         link (or a sign-in, or a moved address) marks the moment (`accountChanged_`); a reply to a
         question asked before it is asked again instead, and the second answer is the server's newer one. */
```

### ---------- AND THE ROLE, WHICH WENT STALE THE SAME WAY

in `profileRefresh_`

```
/* ---------- AND THE ROLE, WHICH WENT STALE THE SAME WAY ---------------------------------------
         FOUND BY THE WALK: the owner made a parent a client in the sheet, the parent reloaded, and
         "Make your child's account" stayed missing until they signed out and in. `USER.role` and
         `USER.roles` were the sign-in reply's, kept for the thirty days a session lasts, exactly as
         `USER.profile` was — and `mayAddChild_`, the roles card and every staff test read them.
         `myProfile` carries the sheet's three words now; an old server sends none and this keeps
         what it had. A changed role is a different app — other cards, other columns — so it is the
         whole `repaint`, which marks every other column stale and draws this one; one that did not
         change is the settings column alone, as before. The server never trusted these: every action
         asks the row the token resolves to, so a stale role was a missing card, not a power. */
```

### `pendingEmail` RIDES WITH THE ROLE, for the role's reason:

in `profileRefresh_`

```
/* `pendingEmail` RIDES WITH THE ROLE, for the role's reason: it decides which cards are drawn (the
         held make-child card, the line under your own card), and it goes stale the same way — the link
         opened on a laptop, the address proved by Google on another phone. */
```

### ---------- AND THE NAMES, WHICH WENT STALE THE SAME WAY

in `profileRefresh_`

```
/* ---------- AND THE NAMES, WHICH WENT STALE THE SAME WAY ---------------------------------------
         THE OWNER, 10 OCT: *"also side note dont show children's last name."* The server calls a child by
         their first name now (`nameFor_` in people.gs) — but a phone signed in before that kept the whole
         name in `familyUser` for the thirty days a session lasts: a child's own name on their You card, a
         parent's children in the booking form's "Which of your children?". `myProfile` carries the names
         as the sign-in reply says them, so the first open after the deploy puts the first names over the
         old ones; an older server sends none and this keeps what it had. A name that changed is a repaint,
         like a role: it is on the card at the top of the column. */
```

### ---------- AND THE HANDLE, WHICH THE BUSINESS MAY HAVE MOVED UNDER THIS PHONE (342)

in `profileRefresh_`

```
/* ---------- AND THE HANDLE, WHICH THE BUSINESS MAY HAVE MOVED UNDER THIS PHONE (342) -----------------
         `?run=kidHandles` gives a child their initials and four digits while their phone is signed in, and
         that phone said the old handle on their card for the thirty days a session lasts — and kept the
         old FRIENDS list, which the next "Add a friend" would have posted back over the moved one. Both
         come with `myProfile` now. A handle that changed is said ONCE: under the handle, as Randomise says
         it (`HANDLE_SAID`), and in a toast — the next open finds them equal and says nothing. An older
         server sends neither and this keeps what it had.
         A REPLY ASKED BEFORE A CHANGE MADE ON THIS PHONE is asked again above (`ACCOUNT_AT_`): Randomise
         marks it when its answer lands, and so does a friends list saved here (`friendsSave`). It was a
         text test — "does `HANDLE_SAID` say I was this?" — which knew only the LAST press: two presses
         under one slow `myProfile` and the reply put the first handle back (the review, R2).
         AND THE DEVICE'S CHIP FOR THE OLD ONE BECOMES THE NEW ONE (`handleRename_`). */
```

### BOTH THROUGH `landRepaint_` (shell.js), because this is a reply landing like the payload is:

in `profileRefresh_`

```
/* BOTH THROUGH `landRepaint_` (shell.js), because this is a reply landing like the payload is: a
         select somebody has open, or a box they are in, is not rebuilt under them. Found by review on
         9 October — the favourite colour tapped, its list up, and this repaint took the select away. */
```

### AND YOUR CARD, WHEN IT IS OPEN FOR EDITING — it is drawn from this copy (`cardEditHtml_`), and one still waiting for a copy it can trust (`profileShapeOk_`) is

in `profileRefresh_`

```
/* AND YOUR CARD, WHEN IT IS OPEN FOR EDITING — it is drawn from this copy (`cardEditHtml_`), and
         one still waiting for a copy it can trust (`profileShapeOk_`) is drawn the moment this lands.
         `paint` declines while the card holds typing (`settingsKeep_`). */
```

### ---------- AND THE HANDLE, WHICH IS A PRESS RATHER THAN A BOX

top level, before `HANDLE_NAME_FIRST_`

```
/* ---------- AND THE HANDLE, WHICH IS A PRESS RATHER THAN A BOX ----------------------------------
   `send_`, AND THEREFORE `send`, NOT `api`. `api()` resolves with whatever the server said,
   `{ error: … }` included; `send()` throws on one. A caller about to say "You are @…" wants the
   second — `check-replies.js` exists because a toast once said "Sent to Ada Tutor" about a message
   that was never written. And `send_` spins the button and locks the card while the request is out,
   so the PIN boxes beside it cannot be typed into under a request that is about to repaint them.

   FOUND FROM THE CARD THE BUTTON IS ON, not by id. The line it writes and the handle it shows are
   classes, so nothing here depends on there being exactly one of either on the page.

   UPDATED IN PLACE, THEN THE PAYLOAD. The new handle is written onto the card and into `USER` the
   moment it lands, which is what makes the press feel like it did something; `load()` then fetches
   the payload, because every card that draws this person — their profile, a high-score board — is
   drawn from it, and those would otherwise go on saying the old handle until the next open. The
   line under it is `HANDLE_SAID`, which the card is drawn from, so the repaints that follow keep it.

   THE OLD ONE IS SAID BACK. A new handle is the one change where seeing it proves nothing about
   what it replaced; `was` comes from the server, which is the only thing that knows. */
```

### ON YOUR OWN CARD NOW (docs/history/339), the `handle` section of its Edit — `el.closest('.card')` is the card being edited, and `send_` locks its form while

top level, before `HANDLE_NAME_FIRST_`

```
/* ON YOUR OWN CARD NOW (docs/history/339), the `handle` section of its Edit — `el.closest('.card')` is the
   card being edited, and `send_` locks its form while the press is out. YOUR ROWS IN THE PAYLOAD TAKE THE NEW
   HANDLE AT ONCE, as `cardPatchRow_` puts a saved name on them: the card the form turns back into is drawn
   from your tutor row, and until the payload `load()` asks for lands it would print the old handle under
   your name beside a toast saying the new one. */
```

### ---------- AFTER REVIEW (docs/history/339) — THREE THINGS THE ONE FORM CHANGED

top level, before `HANDLE_NAME_FIRST_`

```
/* ---------- AFTER REVIEW (docs/history/339) — THREE THINGS THE ONE FORM CHANGED --------------------------------
   · IT LOCKS ITS OWN SECTION, NOT THE FORM. `send_`'s default lock is the nearest `.me-form`, which on Settings
     was the Signing in card and on your card's Edit is the WHOLE CARD — every box disabled while the press was
     out, and Save (under the form, so still live) read the form with `cardFormVals_`, which skips a disabled box:
     nothing had changed, said the toast, and the card closed and dropped its draft. Measured: a first name typed,
     Randomise, Save — "Nothing had changed", the sheet still Pat. The picture locks its own `.pfp` for the same
     reason. And Save waits for it (`HANDLE_ASKING`, read by `card-save`).
   · IT WAITS FOR A FIRST NAME TYPED AND NOT SAVED. The server makes the handle from the name ON THE SHEET
     (`handleMake_(r, r.first_name, …)`), and the name boxes are the section above — so "change the name, then
     Randomise" was the natural order and made `pat_humble98` for somebody now called Quinn, against the rule
     that a handle is your first name and a virtue. Refused before it is sent, in words, on the line under it.
   · IT KEEPS THE FACE (`avatarKeep_`, above) when nobody ever chose a look. */
```

### A `myProfile` ASKED BEFORE THIS ANSWER IS ABOUT THE HANDLE BEFORE IT, and is asked again rather than landing

top level, before `HANDLE_ASKING`

```
/* A `myProfile` ASKED BEFORE THIS ANSWER IS ABOUT THE HANDLE BEFORE IT, and is asked again rather than
         landing (`ACCOUNT_AT_`, 342 — two presses under one slow reply put the first handle back). And this
         device's chip for the old handle becomes the new one (`handleRename_`). */
```

### ---------- THE ONE WHERE A NAME COLLISION LOCKS SOMEBODY OUT

top level, before `lock`

```
/* ---------- THE ONE WHERE A NAME COLLISION LOCKS SOMEBODY OUT ---------------------------------
     `findPerson(S(body.name), S(body.personId))` PREFERS THE ID AND FALLS BACK TO THE NAME, and
     this sent no id. Two people with the same display name and the handler resolves the first row,
     checks the PIN you typed against THEIR PIN, and answers "That is not your current PIN" — to
     somebody who typed their own correctly, with no way to ever change it.

     NOT A WAY IN. The current PIN is still required, so a collision cannot change anybody else's;
     it is a denial rather than a breach. It is on this call above all the others because the answer
     it gives is confidently wrong about the one thing the person is certain of. */
```

### `send_`, SO A SECOND TAP CANNOT POST A SECOND CHANGE.

top level, before `lock`

```
/* `send_`, SO A SECOND TAP CANNOT POST A SECOND CHANGE. It was `api()` with nothing disabled:
     measured, a double tap posted `changePin` twice, and the second came back refused because the
     first had already changed the PIN it was checking. The three boxes are locked while it is on the
     wire and emptied afterwards — a PIN left sitting in a box is a PIN on the screen. */
```

### ---------- A NEW PIN ENDS EVERY SESSION, SO THIS PHONE IS HANDED A NEW ONE

top level, before `USER.token`

```
/* ---------- A NEW PIN ENDS EVERY SESSION, SO THIS PHONE IS HANDED A NEW ONE ------------------
         The server ends every session the person holds — the point of changing a PIN you think
         somebody else has — and now mints a fresh one for the phone that asked. Kept before anything
         else, because every request after this one would otherwise go out on a dead token and be
         answered "Please sign in again." */
```

### `LOADED` and `LOAD_FAILED` were declared here and are now in data.js, with the rest of the state.

top level, before `CARD_SECTIONS`

```
/* `LOADED` and `LOAD_FAILED` were declared here and are now in data.js, with the rest of the state.

   THEY WERE IN THE WRONG FILE. Both are read by posts.js and written by shell.js, and neither has
   anything to do with the You screen — they lived here because the skeleton that was below happened to be
   the first thing that wanted them. That worked only because me.js is loaded before posts.js, which
   is a fact about a list in index.html rather than anything either file states.

   The moment that order changed, or me.js failed to arrive, `posts.js` threw `LOADED is not
   defined` while drawing the first screen — and the app stopped with a message naming a variable
   rather than the file that was missing.

   Shared state goes in data.js. That file loads fourth, before everything that reads it, and it is
   the one place somebody looks for "where does this value live". */
```

### `skeleton()` WAS HERE — a grey post (a face, a 4:5 picture, two lines) pulsing on the feed, the reel and Messages while the payload was on its way.

top level, before `CARD_SECTIONS`

```
/* `skeleton()` WAS HERE — a grey post (a face, a 4:5 picture, two lines) pulsing on the feed, the
   reel and Messages while the payload was on its way. Its argument was a good one: "a shape of the
   thing that is coming, not a spinner", so nothing jumps when it lands. What it lost to is the owner,
   9 Oct: *"Every widget has unique loading look. They should all have a simplistic simple loading
   thing"* — it was one of twenty-four looks for one fact. The three columns draw `loading_()` now
   (shell.js), which on a page of its own is the dots alone at the middle of the cell, with no frame
   drawn round them for the post that replaces it to jump from. The same day the skeleton had been given a
   pill-round bar where the reactions' row of faces would be (docs/history/307) — the right shape for
   a look that no longer exists; the merge kept the removal, and the reactions keep their own row. */
```

### YOUR CARD IS WHERE YOU EDIT IT (docs/history/330)

top level, before `CARD_SECTIONS`

```
/* ==================================================================================================
   YOUR CARD IS WHERE YOU EDIT IT  (docs/history/330)

   THE OWNER, 10 Oct, with a screenshot of the Settings card "About you" beside one of their own card
   on the You column: *"all of this stuff should be editable directly on the tutors card for that
   respective tutor. this centralises things so less widgets are required."*

   SO A TUTOR'S OWN CARD HAS AN `Edit` TILE, and pressing it turns the card into its own form IN
   PLACE, section by section in the order the card reads: the picture, the name, the rate and class
   sizes, the headline, the photographs, the three words, the facts at a glance, the qualifications,
   where they tutor (the map redrawn from the ticks) and the week. ONE `Save` posts every field that
   changed, through the same `updateProfile` every Settings card uses, in one request — and the card
   is a card again with the new values. `Cancel` puts back what was there. The five Settings pages
   that held these fields are not drawn for somebody with a card (`cardHolds_`, asked by
   `settingsPages_`); the server's groups, which are also its write allow-list, are untouched.

   AND SINCE 11 OCT, EVERYBODY'S OWN CARD (docs/history/339): *"the random name generator should be one of
   the editable things in the profile settings of the profile card. your figure should also be in your
   profile card editing."* A parent, a student and an admin with no public card each have Edit on their
   own card, with the sections their card prints — the picture and the name — and, on everybody's own card,
   the figure (the wardrobe) and the handle (Randomise). See `CARD_SECTIONS` and `ownCardSections_`.

   AN ADMIN EDITS ANY TUTOR'S CARD THE SAME WAY, because `updateProfile` already lets an admin write
   another person's row (`adminEditing` in dopost.gs) — nothing on the server changed for it. Their
   form is filled from `getProfile` (admin-only), never from the payload's row: that row has no Teach
   ticks, no favourite colour and three words with their places lost, and a Save built from it would
   write those losses back. The one thing an admin cannot change there is the picture — `savePhoto`
   writes the row the TOKEN resolves to, which would be the admin's own.

   A THING HAS TILES, A FORM HAS BUTTONS: Edit, Save and Cancel are the card's tiles, because the card
   is a thing; the boxes inside are the same `fieldHtml` boxes Settings drew, and the shelf, the
   picker and the week are Settings' own widgets — one renderer each, wherever they are drawn.
================================================================================================== */
```

### ---------- THE CARD'S SECTIONS, IN THE CARD'S ORDER, AND THE FIELDS EACH ONE EDITS

top level, before `CARD_SECTIONS`

```
/* ---------- THE CARD'S SECTIONS, IN THE CARD'S ORDER, AND THE FIELDS EACH ONE EDITS -------------------
   `fields` are named; `match` takes every field of that shape the backend sends, so the photographs,
   the qualification shelf and the week are as long as the backend says, exactly as on Settings. A field
   the backend does not send in `profileFields` is not drawn (`cardSections_`), so this cannot offer a
   box the server would quietly drop. PURE DATA, because `check-profile.js` reads it out of this file and
   asks the real backend whether every field in it is one a tutor and an admin may write.

   THE CARD'S ORDER, NOT A FORM'S: the rate sits by the name and the photographs after the headline,
   because that is where they are on the card — editing in place means each section is edited where it
   is read. SESSION LENGTH IS IN AT A GLANCE, where the card prints it (`1+ hour`): it was a sentence
   here saying "kept on the sheet", because `min_hours`/`max_hours` were in no group and so nobody could
   write them; the review of docs/history/330 asked for the box, and the backend now lists them on the rate
   page (`SESSION_FIELDS` in constants.gs — no clock, refused by `hoursRefusal_`). The favourite colour and the video are
   not on the public card at all; they ride with the facts and the photographs, beside what they are
   paired with on Settings (`FIELD_ROWS`), so nothing that page held is left without a box. Where they
   tutor has no caption of its own: the map under the venues carries the card's `Tutors at` already. */
```

### ---------- AND TWO SECTIONS THAT ARE YOURS ALONE, AND TWO THAT EVERY CARD HAS (docs/history/339)

top level, before `CARD_SECTIONS`

```
/* ---------- AND TWO SECTIONS THAT ARE YOURS ALONE, AND TWO THAT EVERY CARD HAS (docs/history/339) --------------
   The owner, 11 Oct: *"the random name generator should be one of the editable things in the profile
   settings of the profile card. your figure should also be in your profile card editing."* So YOUR OWN card
   gains two sections with no field in them — `own`, drawn on your own card's Edit and nobody else's:
     · `figure`, the wardrobe (`wardrobeBody_`), straight under the picture, because the figure is what the
       picture's "your figure" option draws and a pick in one is seen in the other;
     · `handle`, under the name, where the card prints it: shown, with Randomise (`handle-shuffle`).
   Neither is a field `updateProfile` writes — a look is `saveAvatar`'s and a handle `randomiseHandle`'s — so
   each saves the moment it is chosen, as the picture does, and the one Save does not carry them.
   AND EDITING YOUR OWN CARD IS FOR EVERYBODY NOW, not only a tutor with a public card: a parent, a student and
   an admin with no row each edit theirs (`cardMayEdit_`). Their card prints a face and a name and nothing a
   tutor's card adds, so `bare` marks the two sections such a card holds — picture and name — and the others
   are offered only on a card with a public row (`ownCardSections_`). */
```

### WHERE THE PAGES WENT, said once at the top of Settings.

top level, before `cardMovedSay_`

```
/* WHERE THE PAGES WENT, said once at the top of Settings. The column names are read off `TABS`, as the
   signed-out Settings card reads them, because "You" and "Tools" are cells somebody can edit. A card with a
   public row says the tutor's list as well; everybody is told their name, picture, handle and figure, and the
   library cards, moved. */
```

### `o.sent` IS WHICH FIELDS MAY BE OFFERED (a tutor's, by default); `o.own` adds your own two sections; `o.bare` keeps only the sections every card prints.

top level, before `cardSections_`

```
/* `o.sent` IS WHICH FIELDS MAY BE OFFERED (a tutor's, by default); `o.own` adds your own two sections;
   `o.bare` keeps only the sections every card prints. A section with no field left in it is not drawn —
   except your own two, which have none. Called with nothing, it is exactly the tutor's card it always was,
   which is what an admin edits on somebody else's and what `check-profile.js` asks of the real groups. */
```

### ---------- YOUR OWN CARD'S SECTIONS — FROM YOUR ROLE'S FIELDS, AND ONLY WHAT YOUR CARD PRINTS

top level, before `ownCardSections_`

```
/* ---------- YOUR OWN CARD'S SECTIONS — FROM YOUR ROLE'S FIELDS, AND ONLY WHAT YOUR CARD PRINTS -------------
   Offered from the map your role edits (`myGroups_`), so a parent is offered only what a parent may write;
   and for somebody with no public card (`cardMine_` — a parent, a student, a tutor not yet listed, the lab's
   admin) only the picture and the name, because the card they see is the face and the name and nothing
   else, and editing in place means each section is edited where it is read. Their other fields stay on
   Settings, where they always were. */
```

### ---------- WHO HAS A PUBLIC CARD, AND WHAT SETTINGS STOPS DRAWING FOR THEM

top level, before `cardMine_`

```
/* ---------- WHO HAS A PUBLIC CARD, AND WHAT SETTINGS STOPS DRAWING FOR THEM ------------------------------
   YOUR OWN ROW IN `DATA.tutors`, found by `mineIs_` — the test `accountPages_` finds your card with. Nobody
   else is sent an unlisted tutor, so a tutor not yet listed has no row: their card is the face and the name,
   and every other page of theirs stays on Settings — never a field with no box anywhere. */
```

### THE GROUPS WITH EVERY FIELD THE CARD EDITS TAKEN OUT, AND A GROUP LEFT EMPTY DROPPED — so for a tutor with a card About you, Photos, the rate, Qualifications

top level, before `cardSettingsGroups_`

```
/* THE GROUPS WITH EVERY FIELD THE CARD EDITS TAKEN OUT, AND A GROUP LEFT EMPTY DROPPED — so for a tutor with a
   card About you, Photos, the rate, Qualifications and the week go whole, and Contact & address keeps its own
   boxes. `on` is the fields to take out: a tutor's card's (`cardFields_`) unless told — Settings tells it your
   own card's (`ownCardFields_`), whoever you are. */
```

### ---------- WHICH CARD IS OPEN FOR EDITING

top level, before `CARD_EDIT`

```
/* ---------- WHICH CARD IS OPEN FOR EDITING ---------------------------------------------------------------
   ONE AT A TIME, AND IT SURVIVES A RELOAD. *"Every box survives a reload"* (docs/history/317) — a reload
   that put the card back to a card would leave what was typed in storage with nothing on the screen
   saying so. So which card is open is remembered on the device (`familyCardEdit`, with whose phone it
   was: a phone handed to somebody else opens nobody's editor), and what was typed is the card's draft
   (`cardKeep_`). `base` is the copy of the row the form is drawn from — your own `USER.profile`, or for
   an admin the `getProfile` answer. */
```

### WHOSE `familyCardEdit` WAS LAST READ — a person id, not a yes/no. It was a yes/no, read once a visit, so a tutor who signed out in the middle of editing

top level, before `CARD_EDIT_READ`

```
/* WHOSE `familyCardEdit` WAS LAST READ — a person id, not a yes/no. It was a yes/no, read once a visit,
   so a tutor who signed out in the middle of editing (Sign out is under the form — see `accountPages_`)
   and back in on the same tab found their card shut, with the draft still waiting behind Edit; only a
   reload opened it again. Read again whenever somebody else is signed in, so the same person signing
   back in finds the card the way they left it, as a reload would. */
```

### `pic` IS THE PICTURE THE CARD WAS OPENED WITH, remembered beside which card is open so a Cancel after a reload can still put it back (`card-cancel`, below)

top level, before `cardRemember_`

```
/* `pic` IS THE PICTURE THE CARD WAS OPENED WITH, remembered beside which card is open so a Cancel after a
   reload can still put it back (`card-cancel`, below) — and `fig` THE LOOK, for the same Cancel, since the
   wardrobe is a section of your own card (docs/history/339) and saves itself as the picture does.
   AND `hd`, THE HANDLE IT WAS OPENED UNDER, AND `cr`, THE CREDITS (the review of 339). A look nobody chose is
   drawn from the handle, so "the look it opened with" is the cell AND the handle that drew it — kept without the
   handle, a Randomise and then Cancel rebuilt the blank look under the NEW handle, another face. The credits
   are how Cancel knows something was bought; kept only in memory, a reload mid-edit lost the line that says
   it is still yours. */
```

### WHO MAY EDIT THIS CARD:

top level, before `cardMayEdit_`

```
/* WHO MAY EDIT THIS CARD: YOUR OWN, WHOEVER YOU ARE (docs/history/339) — and somebody else's only when it is a
   real tutor row and you are an admin, the two `updateProfile` lets through. Your own card needs no row in
   `DATA.tutors`: a parent's, a student's and an unlisted admin's are built from the sign-in reply
   (`myCardRow_`, find.js), and what their form offers is what their own role may write (`ownCardSections_`),
   which is never nothing — the picture, the name, the figure and the handle are everybody's. SOMEBODY ELSE'S
   needs the row and the backend's word on which fields a tutor edits, as before: the admin's form is filled
   from `getProfile` by that row's id, and an older backend draws no editor there. */
```

### ---------- THE EDIT TILE — `x.account` IS THE YOU COLUMN, the one place the editor is drawn

top level, before `cardEditTile_`

```
/* ---------- THE EDIT TILE — `x.account` IS THE YOU COLUMN, the one place the editor is drawn
   (`accountPages_`); the same tutor starred onto Saved or found in Find gets no door to a form that is not
   there. Silver on somebody else's card, because it is an admin's power there, as the Listed switch is. */
```

### NOT ON THE CARD BEING EDITED.

in `cardEditTile_`

```
/* NOT ON THE CARD BEING EDITED. Your own card's row (Edit, Sign out, Send the link again) is drawn under
     the form as well now, so Sign out is never taken away by editing — and Edit beside Save would be a
     second door into the form it is already standing in. */
```

### ---------- WHAT A BOX HOLDS, COMPARED THE WAY THE SERVER WILL READ IT

top level, before `CARD_BOOL_`

```
/* ---------- WHAT A BOX HOLDS, COMPARED THE WAY THE SERVER WILL READ IT ------------------------------------
   An hour and a Teach tick are TRUE or blank on the row and TRUE or FALSE in the form; everything else is
   the text, trimmed, which is what `meSave_` posts. */
```

### ---------- WHAT CHANGED — AND THE THREE PACKED CELLS GO WHOLE

top level, before `CARD_HOUR_`

```
/* ---------- WHAT CHANGED — AND THE THREE PACKED CELLS GO WHOLE ---------------------------------------------
   *"Posts every changed field"*, and only those: an untouched rate is not sent, so it cannot start the
   month's clock (`pricingRefusal_` fires only on a value that moves, and a value that is not sent cannot).
   EXCEPT WHERE THE SERVER REBUILDS A WHOLE CELL FROM WHAT ARRIVES: `availGridIn` clears every hour not
   sent, `photosIn` repacks the photographs from the boxes sent and `qualsIn` rewrites the person's rows on
   the qualifications tab from the seventy boxes (`writeOwnRows_` deletes a row not sent). One hour ticked
   and only that hour posted would be a week of one hour. So a change anywhere in one of those sends all of
   it, which is what the Settings page for it always posted. */
```

### ---------- THE CARD'S DRAFT: ONE, FOR THE WHOLE CARD, KEYED BY WHOSE CARD IT IS

top level, before `cardDraft_`

```
/* ---------- THE CARD'S DRAFT: ONE, FOR THE WHOLE CARD, KEYED BY WHOSE CARD IT IS --------------------------
   317'S RULE, AT THE SIZE OF A CARD. Every box keeps what was typed (`draftKeep_`, data.js — so a store
   that refuses it is said and held for the visit like any other draft), only what differs from the copy
   the form was drawn from, each with the saved value it was typed over (`from`). Drawn again over a row
   that has been saved elsewhere since, that box draws the newer saved value: the older edit does not win
   over a newer save — the review of 317's "Samtown over Newtown", one card along.
   ONE DRAFT AND NOT ONE A BOX: the qualification shelf and the week change several boxes from one press,
   and an admin editing somebody else's card must never write into the ADMIN's own `set` drafts, whose
   field names are the same. `card:<pid>`, under the signed-in person's own key, is neither. */
```

### THE COPY EACH DRAWN FORM WAS DRAWN FROM, by a number on the form.

top level, before `CARD_DRAWN`

```
/* THE COPY EACH DRAWN FORM WAS DRAWN FROM, by a number on the form. The You column is drawn — and
   counted, by the pager — more often than it is put on the screen, and `USER.profile` can be replaced
   by `myProfile` while a card is held under typing; what a box is compared with has to be what that box
   was drawn from, or an untouched box reads as changed. Forms no longer on the page are forgotten. */
```

### ---------- THE COPY OF THE ROW THE FORM IS FILLED FROM

top level, before `cardBaseNow_`

```
/* ---------- THE COPY OF THE ROW THE FORM IS FILLED FROM ----------------------------------------------------
   YOURS IS `USER.profile` — but only a copy `profileShapeOk_` trusts: the old sign-in reply's shape has an
   empty shelf and no hours, and a form drawn from it would post those blanks the first time one shelf
   answer moved. Not trusted, it is asked for again (`profileRefresh_`, which repaints this column when it
   lands). SOMEBODY ELSE'S is `getProfile`, an admin's action, by their id. Until either arrives the card
   shows the one loader (`loading_`), and Cancel is live. */
```

### ---------- THE CARD, AS ITS OWN FORM

top level, before `cardEditHtml_`

```
/* ---------- THE CARD, AS ITS OWN FORM ----------------------------------------------------------------------
   THE CARD'S OWN CLOTHES — `.card.is-widget.is-prof`, the role as its label — with `· editing` beside the
   role, so nobody mistakes the form for what parents see. One `.me-form`, so `send_` locks it whole and
   the line under it is the line every Settings card has (`.me-said`), saying an unsaved edit the way
   Settings says it (`SET_HELD_SAY`). Its tiles are drawn under it in the row the card's own tiles were in. */
```

### EACH SECTION THROUGH THE WIDGET SETTINGS DREW IT WITH:

top level, before `cardEditForm_`

```
/* EACH SECTION THROUGH THE WIDGET SETTINGS DREW IT WITH: `fieldRows_` lays the pairs side by side
   (first and last name, the three words, years with the colour, the two ranges), the picture is
   `photoPicker_` and saves itself, the photographs are `photoShelf_`, the qualifications the shelf, the
   venues the several-of-a-list field with the card's own map under it, and the week `availGrid_` with all
   seven days — the card shows only the days that have hours; a form has to offer the others. */
```

### ---------- THE RATE, AND WHAT AN EXTRA SEAT ADDS IN POUNDS BESIDE IT (docs/history/345)

top level, before `pounds2_`

```
/* ---------- THE RATE, AND WHAT AN EXTRA SEAT ADDS IN POUNDS BESIDE IT (docs/history/345) --------------------
   THE OWNER, 12 Oct: *"Your cut off extra child for tutors should be editable on thir card. Like they can edit
   that small number to the right of their normal rate"*. The small number is the card's `+£X/h a seat`
   (`profSeat_`, cards.js): the rate times two shares, the tutor's own (`extra_seat_rate`) and the business's
   (`extra_seat_cut` — per tutor since this note, and a blank one is the config tab's `B`, which is how every
   tutor was priced before). So this section reads as the card does: the rate, the two parts of a seat side by
   side, and the seat as the card will print it, recomputed as any of the three is typed — through `profSeat_`
   itself, so the form cannot print a seat the card would not.

   IN POUNDS AN HOUR, BECAUSE THAT IS THE NUMBER ON THE CARD the owner pointed at, and 0.5 is a number nobody
   thinks in (the Settings card this replaces said so of 0.1). STORED AS FRACTIONS STILL: a rate that moves takes
   the seat with it, as it always has, and nothing else that reads `extra_seat_rate` changes meaning. So the boxes
   typed into carry no `data-me` (`data-pound`), and the fractions are HIDDEN `data-me` boxes holding the stored
   cell EXACTLY. Untouched, `cardChanged_` sends neither — so the tutor's month clock (`pricingRefusal_`) starts
   only on a seat that moved, not on a rate typed beside one. `cardSeatSync_` (below) turns pounds into a share.

   THE CUT IS AN ADMIN'S. On an admin's edit — anybody's card, their own included — it is a box. On a tutor's own
   card it is a line saying what it is and who sets it, over a hidden box that is DISABLED, which `cardFormVals_`
   never reads, so a tutor's Save cannot carry it — and `seatCutRefusal_` (people.gs) refuses it from them on the
   server whatever a phone sends. The box is still there because every field the tutor's groups name has one.
   NO RATE, NO POUNDS: a share of nothing cannot be turned into money, so the boxes are disabled and say why. */
```

### ---------- A PART IS DRAWN ONLY WHERE THE PRICE USES IT AS THE TUTOR'S OWN, AND ASKED OF `seatShare_`

top level, before `cardSeatShown_`

```
/* ---------- A PART IS DRAWN ONLY WHERE THE PRICE USES IT AS THE TUTOR'S OWN, AND ASKED OF `seatShare_` ----------
   THIS WAS `share × rate`, A SECOND FORMULA, and it disagreed with the one reader exactly where the two answers
   differ (the review of docs/history/345): a stored nought for the tutor's part was drawn "0.00", while
   `seatShare_` prices a nought there as the config `c` — so on Ada at £20 the boxes read £0 and £2 under a seat
   of +£8.00, and beside the business's box, where £0 means NO cut, the same £0 meant the opposite. So each box
   shows a figure only when `seatShare_` would use the cell as this tutor's own (`seatOwn`, `cutOwn`), and is
   blank — "usual", with the usual amount in the line under it — when the price falls back to the config.
   THE TWO £0s ARE STILL TWO ANSWERS, because they always were in the price and the brief keeps the stored
   meaning: £0 to the business is no cut; £0 for the tutor's part is the usual share, as a blank is, so that box
   never shows "0.00" and a nought typed into it is put back to empty once it is left (`cardSeatSync_`). The
   line under the boxes says both, in pounds. */
```

### POUNDS TYPED INTO A PART → THE SHARE THE HIDDEN BOX HOLDS.

top level, before `cardSeatShare_`

```
/* POUNDS TYPED INTO A PART → THE SHARE THE HIDDEN BOX HOLDS. To SIX PLACES: the error is under half a millionth
   of the rate, so it comes back to the same penny for any rate under £10,000 an hour. And pounds that DRAW THE
   SAME as the cell the card was opened with, at this rate, put back THE STORED CELL ITSELF rather than a
   recomputed one — 0.333333 is not 0.3333333333 to `cardChanged_`, and a retyped seat must not start the tutor's
   month. Asked through `cardSeatShown_`, so "the same" is the reader's same: a nought or a blank typed into the
   tutor's part over a stored nought is the usual over the usual, and nothing is sent. A blank, or a nought in the
   tutor's part, that is NOT what was stored is '' — the usual. */
```

### THE SEAT AS THE CARD WILL PRINT IT — `profSeat_` over the typed row, the card's own function.

top level, before `cardSeatSay_`

```
/* THE SEAT AS THE CARD WILL PRINT IT — `profSeat_` over the typed row, the card's own function. Outside 0 to 2 a
   share is read as nothing (`asFraction`), so a figure past twice the rate says so instead of printing a seat the
   server is about to refuse. */
```

### ---------- THE LINE UNDER IT: WHAT A BLANK AND A NOUGHT ARE, IN POUNDS, FOR BOTH PARTS

top level, before `cardSeatNote_`

```
/* ---------- THE LINE UNDER IT: WHAT A BLANK AND A NOUGHT ARE, IN POUNDS, FOR BOTH PARTS ----------------------
   It named the usual amount for the business's part only, so nothing told a tutor what their own blank part was
   worth except subtracting it from the seat (the review of 345). Both now, in the order of the boxes: the tutor's
   part (blank or £0 is the usual), then the business's — for whoever sets it, what a blank and a nought are (the
   usual; no cut); for a tutor on their own card, what it is and who sets it, in a few words. With no rate there
   are no amounts, only the words. A backend too old to send the cut gets the first sentence alone. */
```

### ---------- AND AS IT IS TYPED: POUNDS INTO THE HIDDEN SHARE, THE SEAT REDRAWN

top level, before `cardSeatSync_`

```
/* ---------- AND AS IT IS TYPED: POUNDS INTO THE HIDDEN SHARE, THE SEAT REDRAWN ----------------------------------
   Run by the card's own listener before `cardKeep_`, so the draft holds the share that will be sent.
   POUNDS TYPED → the share, by `cardSeatShare_`. The box is marked as typed in this edit.
   THE RATE TYPED → a part TYPED IN THIS EDIT keeps its pounds and its share follows them; a part left alone keeps
   its share and its pounds follow. It moved every part's pounds, typed or not, so the same figures saved two
   different seats by the order they were typed in: £5 and £2 typed at £20 and the rate then corrected to £30
   saved £7.50 and £3.00 (the review of 345). What somebody typed is what they meant; a part they did not touch
   moves with the rate, as a stored share always has.
   A NOUGHT LEFT IN THE TUTOR'S PART is put back to empty on `change` (when the box is left, never while typing:
   "0.5" starts with a nought), so the box reads as it will when the card is opened again — "usual". */
```

### ---------- AND SAVE REFUSES A PART PAST TWICE THE RATE ITSELF, IN POUNDS

top level, before `cardSeatRefusal_`

```
/* ---------- AND SAVE REFUSES A PART PAST TWICE THE RATE ITSELF, IN POUNDS ---------------------------------------
   The preview already said so, and the server refuses it — but in the words of the Settings box, which is a share
   ("from 0 to 2 — 0.1 is a tenth"), under a form where somebody typed £99 (the review of 345). So the card says it
   in the card's unit and posts nothing. Only a part that moved: a stored figure nobody touched is not this Save's. */
```

### ---------- YOUR HANDLE, ON YOUR CARD, UNDER YOUR NAME (docs/history/339)

top level, before `cardHandleHtml_`

```
/* ---------- YOUR HANDLE, ON YOUR CARD, UNDER YOUR NAME (docs/history/339) ----------------------------------
   The owner, 11 Oct: *"the random name generator should be one of the editable things in the profile settings
   of the profile card."* It was on Settings' Signing in card, beside the PIN; it is printed under your name on
   your card, so it is edited there now. What it is made of is unchanged — *"handles should be their name and a
   virtuous describing word. they can randomise it but it will follow that general name."* — so there is still
   no box: the handle is shown, and Randomise asks the server for another (`handle-shuffle`).
   A LINE OF TEXT, NOT A DISABLED INPUT. An input that cannot be typed into reads as broken (and greys out under
   `send_`'s lock); this is a fact about you, set like the name on a card. `aria-live` so the new handle is
   read out when Randomise lands. The `@` is drawn the way every card draws it, gold, and is not in the cell.
   RANDOMISE IS A TILE, BECAUSE THE HANDLE IS A THING — from `tile_`, with the tap target, the mark and the
   press that come from that one place.
   IT SAVES THE MOMENT IT IS PRESSED, AND CANCEL DOES NOT TAKE IT BACK — said on the line under it, not hidden.
   `randomiseHandle` writes the row as it answers, and the server has no way to offer a handle without
   writing it or to put an old one back (`handle` is not in `PROFILE_EDITABLE`, and must not be: nobody types
   a handle). Folding it into the one Save would need a new power on the server to propose without writing;
   keeping it as the picture is kept — saved when chosen — needs none. And a child who signs in with their
   handle is told that a press changes what they type at sign-in, once, here, rather than in a confirm that
   would be the pop-up this app has been asked not to have. The line after a press is `HANDLE_SAID`, kept as
   state for the repaints that follow. */
```

### THE LINE SAYS WHAT A PRESS DOES, NOT WHAT A HANDLE IS MADE OF:

in `cardHandleHtml_`

```
/* THE LINE SAYS WHAT A PRESS DOES, NOT WHAT A HANDLE IS MADE OF: since 11 Oct a child's handle is their
     initials and four digits and a grown-up's is a first name, a word and a number (docs/history/342), and one
     sentence for two shapes would be wrong for one of them — the server knows which. */
```

### SOMEBODY ELSE'S PICTURE, SHOWN AND NOT OFFERED — `savePhoto` writes the asker's own row.

top level, before `cardFaceOnly_`

```
/* SOMEBODY ELSE'S PICTURE, SHOWN AND NOT OFFERED — `savePhoto` writes the asker's own row.
   THROUGH `personFace_` (links.js), AS EVERY FACE IS SINCE docs/history/324. This drew its own `<img>`
   from `pic(t.image)`, which was right while the cell could only hold a link; it can hold `pfp:fox` or
   `pfp:avatar` now, `pic()` passes a token through unchanged, and the admin's form showed a broken image
   where the card beside it drew the fox (the review of docs/history/330, on the tree with fix-dp merged).
   The same call `findCard` makes, so the form shows exactly the face the card does. */
```

### ---------- WHAT IS ON THE CARD THE MOMENT IT IS SAVED

top level, before `cardPatchRow_`

```
/* ---------- WHAT IS ON THE CARD THE MOMENT IT IS SAVED ------------------------------------------------------
   THE PAYLOAD IS THE LAST WORD AND IT IS SECONDS AWAY: `load()` follows every Save that wrote something,
   and it replaces `DATA` whole. Until it lands the card would be drawn from the row as it was, under a
   toast saying Saved — so the plain fields just saved are put on this phone's copy of the row in the
   shapes `doGet` sends them (`description` quoted, the ages as `ageOut_` writes them). The qualifications
   are not: what a tutor teaches is derived on the server (`teachesOf_`), and a guess at it here would be
   a second, worse copy of that rule. They arrive with the payload. */
```

### ---------- A QUALIFICATION WITH NO LEVEL IS NOT SENT EITHER

top level, before `CARD_LEVELLESS_SAY_`

```
/* ---------- A QUALIFICATION WITH NO LEVEL IS NOT SENT EITHER --------------------------------------------------
   On Settings a line is saved only once it has a subject AND a level (`qualCommit_`), so a line being added
   with no level, or a saved line whose level was emptied, never reaches the server. On the card the shelf
   keeps its answers for the one Save, which posts every box — so the same two are refused here, before
   anything is sent, in the words the shelf uses. A line the sheet already holds with no level (a PGCE typed
   in by hand) is not this: nothing on the card changed it, and refusing it would make the card unsaveable. */
```

### ---------- EDIT

top level, before `pid`

```
/* ---------- EDIT ------------------------------------------------------------------------------------------
   ONE CARD AT A TIME. A card already holding typing is not thrown away for another: it says so, and
   stays open, because the second editor could not even be drawn while the first holds the column. */
```

### ---------- WHAT SAVED ITSELF WHILE THE CARD WAS OPEN (the review of docs/history/339)

top level, before `cardSelfSaved_`

```
/* ---------- WHAT SAVED ITSELF WHILE THE CARD WAS OPEN (the review of docs/history/339) ----------------------------
   Your picture, your figure and your handle are each saved the moment they are chosen, so the one Save never
   carries them — and a Save with nothing typed has still something to say about them. Asked of what the card was
   opened with (`pic0`, `fig0` under `h0`), which a reload keeps, so the answer does not depend on the visit. The
   figure is compared as DRAWN (`lookKey_`): a Randomise that kept the face changed the cell and not the figure. */
```

### ---------- SAVE: EVERY CHANGE, ONE REQUEST, THE EXISTING `updateProfile`

top level, before `e`

```
/* ---------- SAVE: EVERY CHANGE, ONE REQUEST, THE EXISTING `updateProfile` ----------------------------------
   `send_` locks the whole page while it is on the wire — the form, and Cancel beside Save — and writes a
   refusal under the form. A refusal is the server's own sentence, and every refusal `updateProfile` makes
   is made before it writes anything, so the card stays open holding what was typed, with nothing saved.
   YOUR OWN SAVE TAKES THE SERVER'S READING OF YOUR ROW (`profile` in the reply), as a Settings Save does,
   and a rename renames the session; an admin's save of somebody else's card is answered with no profile
   and no name (`adminEditing`), and touches neither of the admin's. */
```

### ---------- NOT WHILE A SECTION THAT SAVES ITSELF IS ON THE WIRE (the review of docs/history/339)

top level, before `busy`

```
/* ---------- NOT WHILE A SECTION THAT SAVES ITSELF IS ON THE WIRE (the review of docs/history/339) ----------
     A box a request has locked is disabled, `cardFormVals_` skips a disabled box, and a form read under a lock
     reads as unchanged: Save said "Nothing had changed", shut the card and dropped its draft while Randomise was
     out (measured — a typed first name, gone). Randomise locks only its own section now, but a disabled box must
     never be read as an untouched one, so Save waits, in words, as Cancel waits for the picture. */
```

### NOTHING TYPED — BUT A SECTION THAT SAVES ITSELF MAY HAVE BEEN (`cardSelfSaved_`):

top level, before `t`

```
/* NOTHING TYPED — BUT A SECTION THAT SAVES ITSELF MAY HAVE BEEN (`cardSelfSaved_`): "Nothing had changed" after
     a Randomise, a pick in the wardrobe or a new picture read as if the press had been thrown away, and for a
     parent or a student three of the four sections are those. */
```

### ---------- CANCEL: WHAT WAS THERE COMES BACK — THE PICTURE TOO

top level, before `figPutBack_`

```
/* ---------- CANCEL: WHAT WAS THERE COMES BACK — THE PICTURE TOO ----------------------------------------------
   The draft goes and the card is drawn from the row again. Not while a Save is on the wire — the page is
   locked then anyway, and a Cancel that raced the reply would say "put back" over a row that changed.

   AND THE PICTURE, WHICH WAS THE ONE THING IT DID NOT PUT BACK. The chooser saves the moment a picture is
   chosen (`savePhoto`, as on Settings — a photograph goes to Drive and the eleven are one tap), so Cancel
   left the new face on the card and on the sheet under a tile whose note says "put it back" (the review of
   docs/history/330: a photo chosen, Cancel, and the card, `USER.profile` and the sheet all held it). The
   brief: Cancel *"puts back what was there"*. So the picture the card was opened with is remembered
   (`pic0`, beside which card is open, so a reload does not lose it) and, if the face is not that any more,
   it is written back — through `updateProfile`'s `photo`, because that one door takes all three things the
   cell can hold (a link, nothing, one of the eleven tokens: `photoRefusal_` in core.gs), where `savePhoto`
   takes a token or a file and could not put back a Drive link it once made. The page is locked while it
   travels, as a Save locks it, and the Cancel tile wears `send_`'s ring — no sentence of its own (`loading_`'s
   rule: a press already sent keeps the ring). Either way the card then closes, because Cancel was asked for: put back,
   it says so; refused, the toast says that everything else is as it was and the picture is not, with the
   server's own sentence, rather than claiming a put-back that did not happen. A picture still on its way
   is waited for — a Cancel that overtook it would be put back over by it. */
```

### ---------- AND THE FIGURE, WHICH THE WARDROBE SAVES A PICK AT A TIME (docs/history/339)

top level, before `figPutBack_`

```
/* ---------- AND THE FIGURE, WHICH THE WARDROBE SAVES A PICK AT A TIME (docs/history/339) ------------------
   The wardrobe is a section of your own card's Edit now, under the same Cancel tile whose note says "put it
   back" — so a look changed in it is put back as the picture is: the look the card was opened with (`fig0`,
   remembered beside which card is open, so a reload does not lose it) is sent again through `saveAvatar`, the
   one door a look has, with the page locked and `send_`'s ring. The server re-checks it piece by piece as it
   checks every look, and it is a look this person was wearing, so it passes. NOTHING BOUGHT IS UNDONE: credits
   spent on a piece stay spent and the piece stays yours to wear (`avatarItems`), which the toast says — Cancel
   puts the clothes back, not the shop. A tap still on the wire is overtaken (`AV_SEQ`), so its late answer
   cannot dress the figure again after this. Answers whether it was put back; a refusal is `send_`'s sentence
   on the form's line, and the toast says the figure is the one thing not put back.
   THE LOOK IS REBUILT UNDER THE HANDLE IT WAS OPENED WITH (`h0`, the review of 339): a blank look under the new
   handle after a Randomise is another face. And so a look nobody chose comes back WRITTEN OUT — the face it drew,
   colours and all — never blank again: `saveAvatar` re-checks a whole look and has no way to be told "nothing",
   and a blank cell would hand the face back to whatever handle comes next, which is the fault `avatarKeep_`
   closes. The same face, kept. */
```

### ---------- EVERY BOX ON THE CARD: HELD, KEPT, AND THE MAP FOLLOWS THE TICKS

top level, before `t`

```
/* ---------- EVERY BOX ON THE CARD: HELD, KEPT, AND THE MAP FOLLOWS THE TICKS ---------------------------------
   AFTER the several-of-a-list listener above has written the venues' hidden answer, because it was
   registered first. Dirty holds the column (`settingsKeep_`); `cardKeep_` writes the card's draft. */
```

